import { DICTATION_LIMITS } from '../shared/dictation.js'
import {
  WordAgreement,
  joinWords,
  wordsFromTokens,
  type TimedWord,
} from './dictation-agreement.js'

const SAMPLE_RATE = DICTATION_LIMITS.sampleRate
/** The longest window the Parakeet worker decodes at once, padding included. */
const DECODER_MAX_WINDOW_MS = 30_000
/** A forced confirm leaves the last five seconds of a long window tentative. */
const FORCED_CONFIRM_LAG_SECONDS = 5
/** A silence skip keeps the last half second, where speech may be starting. */
const SILENCE_SKIP_KEEP_SECONDS = 0.5
const FAILED_PASSES = 3

/** The output of one offline decode; PR A's `ParakeetDecodeResult` has this shape. */
export interface LiveDecodeResult {
  text: string
  tokens: readonly string[]
  timestamps: readonly number[]
  durations: readonly number[]
}

export interface LiveDecodeOptions {
  timeoutMs: number
  signal?: AbortSignal
}

/** Structurally satisfied by the Parakeet worker. */
export interface LiveDecoder {
  decode(samples: Float32Array, options: LiveDecodeOptions): Promise<LiveDecodeResult>
  /** Decodes only when the decoder is idle; resolves null instead of queueing. */
  tryDecode(samples: Float32Array, options: LiveDecodeOptions): Promise<LiveDecodeResult | null>
}

export interface LiveDictationOptions {
  /** How often a pass may start. */
  passIntervalMs: number
  /** No pass until this much audio arrived since the last pass started. */
  minNewAudioMs: number
  /** No pass until this much audio is unconfirmed. */
  minWindowMs: number
  /**
   * Confirmed audio decoded again before the last confirmed word: Parakeet
   * drops a word that starts right at the beginning of its window.
   */
  leadInMs: number
  /** Zeros appended to every window, so its last word can finish. */
  paddingMs: number
  /** Past this much unconfirmed audio, tentative words ending five seconds before its end are confirmed. */
  maxWindowMs: number
  /** This much unconfirmed audio without a word skips to half a second before its end. */
  silenceSkipMs: number
  /** At Stop, a stream this short is decoded whole for its final text. */
  fullPassMaxMs: number
  passTimeoutMs: number
  finalTimeoutMs: number
  maxDurationMs: number
}

export const DEFAULT_LIVE_DICTATION_OPTIONS: LiveDictationOptions = {
  passIntervalMs: 750,
  minNewAudioMs: 500,
  minWindowMs: 400,
  leadInMs: 1_000,
  paddingMs: 1_000,
  maxWindowMs: 15_000,
  silenceSkipMs: 2_000,
  fullPassMaxMs: 12_000,
  passTimeoutMs: 10_000,
  finalTimeoutMs: DICTATION_LIMITS.finalTimeoutMs,
  maxDurationMs: DICTATION_LIMITS.maxDurationMs,
}

/** A change to the text: words newly confirmed, and the tentative words that replace the last ones. */
export interface LiveDictationUpdate {
  seq: number
  committedAppend: string
  tentative: string
}

export interface LiveDictationClock {
  setTimeout: typeof setTimeout
  clearTimeout: typeof clearTimeout
}

export interface LiveDictationStats {
  audioSeconds: number
  retainedSeconds: number
  passes: number
}

/** The stream reached its maximum duration; it ends with a final text. */
export class DictationLimitError extends Error {
  constructor(readonly code: 'duration_limit' = 'duration_limit') {
    super('Live dictation reached its time limit')
    this.name = 'DictationLimitError'
  }
}

/** The engine failed; what was already confirmed stays the user's text. */
export class LiveDictationError extends Error {
  constructor(
    readonly code: 'engine_failed' | 'final_timeout',
    message: string,
    readonly committedText: string,
  ) {
    super(message)
    this.name = 'LiveDictationError'
  }
}

interface AudioChunk {
  offset: number
  samples: Int16Array
}

type SessionState = 'idle' | 'running' | 'finishing' | 'finished' | 'cancelled' | 'failed'

/**
 * One live dictation stream on the transcription computer. Every pass decodes
 * the audio from a second before the last confirmed word to the end, plus
 * padding, and word agreement decides what becomes confirmed. It holds audio
 * in memory only, and trims what no later pass can need.
 */
export class LiveDictationSession {
  readonly #decoder: LiveDecoder
  readonly #onUpdate: (update: LiveDictationUpdate) => void
  readonly #onFailure: (error: LiveDictationError) => void
  readonly #options: LiveDictationOptions
  readonly #clock: LiveDictationClock
  readonly #agreement = new WordAgreement()
  readonly #abort = new AbortController()
  #state: SessionState = 'idle'
  #chunks: AudioChunk[] = []
  #total = 0
  #lastPassStart = 0
  #committedText = ''
  #lastTentative = ''
  #seq = 0
  #passes = 0
  #failedPasses = 0
  #timer: ReturnType<typeof setTimeout> | undefined
  #inFlight: Promise<void> | undefined
  #finishing: Promise<string> | undefined
  #cancelFinishing: ((error: Error) => void) | undefined

  constructor(
    decoder: LiveDecoder,
    onUpdate: (update: LiveDictationUpdate) => void,
    options: Partial<LiveDictationOptions> = {},
    clock: LiveDictationClock = { setTimeout, clearTimeout },
    onFailure: (error: LiveDictationError) => void = () => undefined,
  ) {
    this.#decoder = decoder
    this.#onUpdate = onUpdate
    this.#onFailure = onFailure
    this.#options = { ...DEFAULT_LIVE_DICTATION_OPTIONS, ...options }
    this.#clock = clock
  }

  get committedText(): string {
    return this.#committedText
  }

  stats(): LiveDictationStats {
    const retained = this.#chunks.reduce((total, chunk) => total + chunk.samples.length, 0)
    return {
      audioSeconds: this.#total / SAMPLE_RATE,
      retainedSeconds: retained / SAMPLE_RATE,
      passes: this.#passes,
    }
  }

  start(): void {
    if (this.#state !== 'idle') return
    this.#state = 'running'
    this.#scheduleTick()
  }

  appendAudio(pcm16: Int16Array): void {
    if (this.#state !== 'idle' && this.#state !== 'running') return
    const limit = samplesFor(this.#options.maxDurationMs)
    const room = limit - this.#total
    if (room <= 0) throw new DictationLimitError()
    const accepted = pcm16.slice(0, room)
    if (accepted.length > 0) {
      this.#chunks.push({ offset: this.#total, samples: accepted })
      this.#total += accepted.length
    }
    if (this.#total >= limit) throw new DictationLimitError()
  }

  /** Stops the passes and returns the final text. */
  finish(): Promise<string> {
    if (this.#finishing) return this.#finishing
    if (this.#state === 'cancelled') return Promise.reject(new Error('Live dictation was cancelled'))
    if (this.#state === 'failed' || this.#state === 'finished') {
      return Promise.reject(new LiveDictationError('engine_failed', 'Live dictation already ended', this.#committedText))
    }
    this.#state = 'finishing'
    this.#clearTick()
    this.#finishing = this.#finalize()
    return this.#finishing
  }

  /** Ends the stream without a final text; nothing is emitted afterwards. */
  cancel(): void {
    if (this.#state === 'cancelled' || this.#state === 'finished') return
    this.#state = 'cancelled'
    this.#clearTick()
    this.#abort.abort()
    this.#chunks = []
    this.#cancelFinishing?.(new Error('Live dictation was cancelled'))
  }

  #scheduleTick(): void {
    this.#timer = this.#clock.setTimeout(() => {
      this.#timer = undefined
      if (this.#state !== 'running') return
      if (!this.#inFlight && this.#passDue()) {
        this.#inFlight = this.#pass().finally(() => {
          this.#inFlight = undefined
        })
      }
      this.#scheduleTick()
    }, this.#options.passIntervalMs)
  }

  #clearTick(): void {
    if (this.#timer === undefined) return
    this.#clock.clearTimeout(this.#timer)
    this.#timer = undefined
  }

  #passDue(): boolean {
    return this.#total - this.#lastPassStart >= samplesFor(this.#options.minNewAudioMs)
      && this.#total - this.#confirmedEndSample() >= samplesFor(this.#options.minWindowMs)
  }

  async #pass(): Promise<void> {
    const start = this.#windowStartSample()
    const end = Math.min(this.#total, start + this.#decodeCapSamples())
    const previousPassStart = this.#lastPassStart
    this.#lastPassStart = this.#total
    let result: LiveDecodeResult | null
    try {
      result = await this.#decoder.tryDecode(this.#window(start, end), {
        timeoutMs: this.#options.passTimeoutMs,
        signal: this.#abort.signal,
      })
    } catch {
      if (!this.#live()) return
      this.#failedPasses += 1
      if (this.#failedPasses >= FAILED_PASSES) this.#fail()
      return
    }
    if (!this.#live()) return
    if (result === null) {
      // The decoder was busy; the audio waits for the next pass.
      this.#lastPassStart = previousPassStart
      return
    }
    this.#failedPasses = 0
    this.#passes += 1
    this.#emit(this.#apply(result, start, end))
    this.#trim()
  }

  /** Feeds one decoded window to word agreement; returns the words it confirmed. */
  #apply(result: LiveDecodeResult, start: number, end: number): TimedWord[] {
    const endSeconds = end / SAMPLE_RATE
    const confirmed = this.#agreement.ingest(wordsFromTokens(result, start / SAMPLE_RATE, endSeconds))
    const unconfirmedMs = () => (endSeconds - this.#agreement.confirmedEnd) * 1_000
    if (
      confirmed.length === 0
      && this.#agreement.tentative.length === 0
      && unconfirmedMs() >= this.#options.silenceSkipMs
    ) {
      this.#agreement.skipSilenceTo(endSeconds - SILENCE_SKIP_KEEP_SECONDS)
    }
    if (unconfirmedMs() > this.#options.maxWindowMs) {
      confirmed.push(...this.#agreement.forceConfirmThrough(endSeconds - FORCED_CONFIRM_LAG_SECONDS))
      if (unconfirmedMs() > this.#options.maxWindowMs) {
        // Nothing old enough to confirm: the window would grow past what one decode takes.
        confirmed.push(...this.#agreement.forceConfirmThrough(endSeconds))
        this.#agreement.skipSilenceTo(endSeconds)
      }
    }
    return confirmed
  }

  #emit(confirmed: readonly TimedWord[]): void {
    if (!this.#live()) return
    const committedAppend = confirmed.length
      ? `${this.#committedText ? ' ' : ''}${joinWords(confirmed)}`
      : ''
    const tentative = joinWords(this.#agreement.tentative)
    if (!committedAppend && tentative === this.#lastTentative) return
    this.#committedText += committedAppend
    this.#lastTentative = tentative
    this.#seq += 1
    this.#onUpdate({ seq: this.#seq, committedAppend, tentative })
  }

  /** Drops audio no later pass can need, once the stream is too long for a whole final decode. */
  #trim(): void {
    if (this.#total <= samplesFor(this.#options.fullPassMaxMs)) return
    const keepFrom = this.#windowStartSample()
    let drop = 0
    while (
      drop < this.#chunks.length
      && this.#chunks[drop].offset + this.#chunks[drop].samples.length <= keepFrom
    ) drop += 1
    if (drop > 0) this.#chunks.splice(0, drop)
  }

  async #finalize(): Promise<string> {
    let timer: ReturnType<typeof setTimeout> | undefined
    const stopped = new Promise<never>((_resolve, reject) => {
      this.#cancelFinishing = reject
      timer = this.#clock.setTimeout(() => {
        this.#abort.abort()
        reject(new LiveDictationError(
          'final_timeout',
          'The final text took too long',
          this.#committedText,
        ))
      }, this.#options.finalTimeoutMs)
    })
    try {
      const text = await Promise.race([this.#finalText(), stopped])
      this.#state = 'finished'
      return text
    } catch (error) {
      if (this.#state === 'cancelled') throw new Error('Live dictation was cancelled')
      this.#state = 'failed'
      if (error instanceof LiveDictationError) throw error
      throw new LiveDictationError(
        'engine_failed',
        error instanceof Error && error.message ? error.message : 'The final decode failed',
        this.#committedText,
      )
    } finally {
      if (timer !== undefined) this.#clock.clearTimeout(timer)
      this.#cancelFinishing = undefined
      this.#chunks = []
    }
  }

  async #finalText(): Promise<string> {
    await this.#inFlight
    if (this.#total === 0) return this.#committedText
    const options = { timeoutMs: this.#options.finalTimeoutMs, signal: this.#abort.signal }
    if (this.#total <= samplesFor(this.#options.fullPassMaxMs)) {
      // Nothing was trimmed yet, so the whole utterance gets one decode.
      const result = await this.#decoder.decode(this.#window(0, this.#total), options)
      return joinWords(wordsFromTokens(result, 0, this.#total / SAMPLE_RATE))
    }
    // A decoder that was busy for long may leave more than one decode can take.
    while (this.#total - this.#windowStartSample() > this.#decodeCapSamples()) {
      const start = this.#windowStartSample()
      const end = start + this.#decodeCapSamples()
      const result = await this.#decoder.decode(this.#window(start, end), options)
      this.#requireFinishing()
      this.#emit(this.#apply(result, start, end))
    }
    const start = this.#windowStartSample()
    const result = await this.#decoder.decode(this.#window(start, this.#total), options)
    this.#requireFinishing()
    const tail = this.#agreement.unconfirmed(
      wordsFromTokens(result, start / SAMPLE_RATE, this.#total / SAMPLE_RATE),
    )
    return [this.#committedText, joinWords(tail)].filter(Boolean).join(' ')
  }

  #requireFinishing(): void {
    if (this.#state !== 'finishing') throw new Error('Live dictation was cancelled')
  }

  #fail(): void {
    this.#state = 'failed'
    this.#clearTick()
    this.#chunks = []
    this.#onFailure(new LiveDictationError(
      'engine_failed',
      'Live dictation could not decode three times in a row',
      this.#committedText,
    ))
  }

  #live(): boolean {
    return this.#state === 'running' || this.#state === 'finishing'
  }

  /** A lead-in before the last confirmed word, so the model hears the words after it in context. */
  #windowStartSample(): number {
    const retainedFrom = this.#chunks[0]?.offset ?? this.#total
    const leadIn = this.#agreement.resumeTime - this.#options.leadInMs / 1_000
    return Math.min(this.#total, Math.max(retainedFrom, Math.round(leadIn * SAMPLE_RATE)))
  }

  #confirmedEndSample(): number {
    return Math.min(this.#total, Math.round(this.#agreement.confirmedEnd * SAMPLE_RATE))
  }

  #decodeCapSamples(): number {
    // One second below the decoder's limit, once the padding is added.
    return samplesFor(DECODER_MAX_WINDOW_MS - this.#options.paddingMs - 1_000)
  }

  /** The window as float samples, with zero padding after it. */
  #window(start: number, end: number): Float32Array {
    const window = new Float32Array(end - start + samplesFor(this.#options.paddingMs))
    for (const chunk of this.#chunks) {
      const chunkEnd = chunk.offset + chunk.samples.length
      if (chunkEnd <= start) continue
      if (chunk.offset >= end) break
      const from = Math.max(start, chunk.offset)
      const to = Math.min(end, chunkEnd)
      for (let index = from; index < to; index += 1) {
        window[index - start] = chunk.samples[index - chunk.offset] / 32_768
      }
    }
    return window
  }
}

function samplesFor(milliseconds: number): number {
  return Math.round((milliseconds * SAMPLE_RATE) / 1_000)
}
