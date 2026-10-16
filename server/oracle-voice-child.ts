import {
  spawn,
  type ChildProcessWithoutNullStreams,
} from 'node:child_process'
import path from 'node:path'
import type { Readable, Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { ORACLE_VOICE_SAMPLE_RATE } from '../shared/oracle-voice.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import type {
  VoiceEndUtterance,
  VoiceEngineEvent,
  VoiceGenerationIdentity,
  VoiceStartUtterance,
  VoiceSynthesisRequest,
  VoiceUtteranceAudioFrame,
} from './oracle-voice-engine.js'
import {
  VOICE_MAX_CANCELLATION_STREAMS,
  VOICE_PIPER_SHUTDOWN_TIMEOUT_MS,
  type VoiceWorkerChildMessage,
  type VoiceWorkerParentMessage,
} from './oracle-voice-worker-protocol.js'

const DEFAULT_HEARTBEAT_INTERVAL_MS = 5_000
const DEFAULT_MAX_UTTERANCE_SAMPLES = ORACLE_VOICE_SAMPLE_RATE * 30
const DEFAULT_PIPER_SHUTDOWN_TIMEOUT_MS = VOICE_PIPER_SHUTDOWN_TIMEOUT_MS
const DEFAULT_MAX_CANCELLATION_STREAMS = VOICE_MAX_CANCELLATION_STREAMS
const MAX_PIPER_STDERR_BYTES = 4_096

interface SherpaStream {
  acceptWaveform(input: {
    samples: Float32Array
    sampleRate: number
  }): void
  inputFinished(): void
  setOption(key: string, value: string): void
}

interface SherpaRecognizer {
  createStream(): SherpaStream
  isReady(stream: SherpaStream): boolean
  decode(stream: SherpaStream): void
  isEndpoint(stream: SherpaStream): boolean
  getResult(stream: SherpaStream): { text: string }
  reset(stream: SherpaStream): void
}

interface SherpaModule {
  OnlineRecognizer: new (config: object) => object
}

export interface PiperProcess {
  readonly pid?: number
  readonly stdin: Writable
  readonly stdout: Readable
  readonly stderr: Readable
  kill(signal: NodeJS.Signals): boolean
  once(
    event: 'exit',
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): this
  once(event: 'error', listener: (error: Error) => void): this
}

export interface VoiceWorkerOptions {
  sherpa: SherpaModule
  spawnPiper: (binary: string, args: string[]) => PiperProcess
  send: (message: VoiceWorkerChildMessage) => Promise<void>
  now: () => number
  heartbeatIntervalMs: number
  maxUtteranceSamples: number
  piperShutdownTimeoutMs: number
  maxCancellationStreams: number
}

export interface VoiceWorker {
  handle(message: VoiceWorkerParentMessage): Promise<void>
  close(): Promise<void>
}

interface ActiveUtterance {
  streamId: string
  generation: number
  utteranceId: string
  stream: SherpaStream
  sampleCount: number
  nextSequence: number
  lastText: string
  finalized: boolean
  cancelled: boolean
}

interface ActiveSynthesis {
  streamId: string
  generation: number
  segmentId: string
  process: PiperProcess
  exit: Promise<PiperExitResult>
  exited: boolean
  cancelled: boolean
  termination?: Promise<void>
}

interface PiperExitResult {
  code: number | null
  signal: NodeJS.Signals | null
  error?: Error
}

export function createVoiceWorker(
  provided: Partial<Omit<VoiceWorkerOptions, 'sherpa' | 'spawnPiper' | 'send'>>
    & Pick<VoiceWorkerOptions, 'sherpa' | 'spawnPiper' | 'send'>,
): VoiceWorker {
  const options: VoiceWorkerOptions = {
    now: Date.now,
    heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
    maxUtteranceSamples: DEFAULT_MAX_UTTERANCE_SAMPLES,
    piperShutdownTimeoutMs: DEFAULT_PIPER_SHUTDOWN_TIMEOUT_MS,
    maxCancellationStreams: DEFAULT_MAX_CANCELLATION_STREAMS,
    ...provided,
  }
  return new ResidentVoiceWorker(options)
}

class ResidentVoiceWorker implements VoiceWorker {
  private config: EnabledOracleVoiceConfig | undefined
  private recognizer: SherpaRecognizer | undefined
  private utterance: ActiveUtterance | undefined
  private synthesis: ActiveSynthesis | undefined
  private readonly cancelledThroughGeneration = new Map<string, number>()
  private heartbeatTimer: ReturnType<typeof setInterval> | undefined
  private closed = false

  constructor(private readonly options: VoiceWorkerOptions) {}

  async handle(message: VoiceWorkerParentMessage): Promise<void> {
    try {
      await this.dispatch(message)
      await this.options.send({
        type: 'response',
        requestId: message.requestId,
      })
    } catch (error) {
      if (error instanceof CancellationStreamLimitError) {
        try {
          await this.close()
        } catch {
          // The worker is still closed even if an owned Piper resists SIGKILL.
        }
      }
      await this.options.send({
        type: 'response_error',
        requestId: message.requestId,
        message: errorMessage(error),
      })
    }
  }

  async close(): Promise<void> {
    if (this.closed) return
    this.closed = true
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
    if (this.utterance) {
      this.utterance.cancelled = true
      this.recognizer?.reset(this.utterance.stream)
      this.utterance = undefined
    }
    if (this.synthesis) {
      const active = this.synthesis
      active.cancelled = true
      await this.terminatePiper(active)
      if (this.synthesis === active) this.synthesis = undefined
    }
  }

  private async dispatch(message: VoiceWorkerParentMessage): Promise<void> {
    if (this.closed && message.type !== 'close') {
      throw new Error('voice worker is closed')
    }
    switch (message.type) {
      case 'initialize':
        await this.initialize(message.config)
        return
      case 'stt_start':
        await this.startUtterance(message.input)
        return
      case 'stt_audio':
        await this.acceptAudio(message.frame)
        return
      case 'stt_end':
        await this.endUtterance(message.input)
        return
      case 'stt_cancel':
        this.cancelStt(message)
        return
      case 'tts_synthesize':
        await this.synthesize(message.input)
        return
      case 'tts_cancel':
        await this.cancelTts(message)
        return
      case 'close':
        await this.close()
        return
    }
  }

  private async initialize(config: EnabledOracleVoiceConfig): Promise<void> {
    if (this.recognizer) throw new Error('voice worker is already initialized')
    const modelDirectory = config.stt.modelDirectory
    const profile = sherpaProfile(config)
    const Recognizer = this.options.sherpa.OnlineRecognizer
    this.recognizer = new Recognizer({
      featConfig: {
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        featureDim: profile.featureDimension,
      },
      modelConfig: {
        transducer: {
          encoder: path.join(modelDirectory, profile.encoder),
          decoder: path.join(modelDirectory, profile.decoder),
          joiner: path.join(modelDirectory, profile.joiner),
        },
        tokens: path.join(modelDirectory, 'tokens.txt'),
        numThreads: config.threads,
        provider: 'cpu',
        debug: 0,
      },
      enableEndpoint: true,
      rule1MinTrailingSilence: Math.min(5, config.endpointMs * 3 / 1_000),
      rule2MinTrailingSilence: config.endpointMs / 1_000,
      rule3MinUtteranceLength: 30,
    }) as SherpaRecognizer
    this.config = config
    if (this.options.heartbeatIntervalMs > 0) {
      this.heartbeatTimer = setInterval(() => {
        void this.emit({
          type: 'heartbeat',
          timestamp: this.options.now(),
        })
      }, this.options.heartbeatIntervalMs)
      this.heartbeatTimer.unref?.()
    }
    await this.emit({ type: 'ready' })
  }

  private async startUtterance(input: VoiceStartUtterance): Promise<void> {
    const recognizer = this.requireRecognizer()
    if (this.utterance && !this.utterance.finalized) {
      throw new Error('an STT utterance is already active')
    }
    if (this.isCancelled(input)) {
      throw new Error('STT generation is cancelled')
    }
    const stream = recognizer.createStream()
    stream.setOption('language', input.language)
    this.utterance = {
      streamId: input.streamId,
      generation: input.generation,
      utteranceId: input.utteranceId,
      stream,
      sampleCount: 0,
      nextSequence: 0,
      lastText: '',
      finalized: false,
      cancelled: false,
    }
  }

  private async acceptAudio(frame: VoiceUtteranceAudioFrame): Promise<void> {
    const utterance = this.requireUtterance(frame)
    if (utterance.finalized || this.isCancelled(frame)) return
    if (frame.direction !== 'microphone') {
      throw new Error('STT accepts microphone audio only')
    }
    if (frame.sampleRate !== ORACLE_VOICE_SAMPLE_RATE) {
      throw new Error(`STT audio must be ${ORACLE_VOICE_SAMPLE_RATE} Hz`)
    }
    if (frame.sequence !== utterance.nextSequence) {
      throw new Error(`STT audio sequence must be ${utterance.nextSequence}`)
    }
    if (utterance.sampleCount + frame.samples.length > this.options.maxUtteranceSamples) {
      throw new Error('STT utterance exceeded its maximum duration')
    }
    utterance.nextSequence += 1
    utterance.sampleCount += frame.samples.length
    utterance.stream.acceptWaveform({
      sampleRate: frame.sampleRate,
      samples: pcm16ToFloat32(frame.samples),
    })
    await this.decodeAvailable(utterance)
    if (this.requireRecognizer().isEndpoint(utterance.stream)) {
      await this.finalizeUtterance(utterance, false)
    }
  }

  private async endUtterance(input: VoiceEndUtterance): Promise<void> {
    const utterance = this.utterance
    if (!utterance) {
      if (this.isCancelled(input)) return
      throw new Error('no STT utterance is active')
    }
    if (
      utterance.streamId !== input.streamId
      || utterance.generation !== input.generation
      || utterance.utteranceId !== input.utteranceId
    ) {
      throw new Error('STT utterance identity does not match')
    }
    if (utterance.finalized || this.isCancelled(input)) return
    await this.finalizeUtterance(utterance, true)
  }

  private async finalizeUtterance(
    utterance: ActiveUtterance,
    addTailSilence: boolean,
  ): Promise<void> {
    if (utterance.finalized) return
    utterance.finalized = true
    if (addTailSilence) {
      const config = this.requireConfig()
      const tailSamples = Math.min(
        ORACLE_VOICE_SAMPLE_RATE * 3,
        Math.ceil(ORACLE_VOICE_SAMPLE_RATE * config.endpointMs / 1_000),
      )
      utterance.stream.acceptWaveform({
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        samples: new Float32Array(tailSamples),
      })
    }
    utterance.stream.inputFinished()
    await this.decodeAvailable(utterance)
    const recognizer = this.requireRecognizer()
    const text = recognizer.getResult(utterance.stream).text
    if (!this.isCancelled(utterance)) {
      await this.emit({
        type: 'final',
        streamId: utterance.streamId,
        generation: utterance.generation,
        utteranceId: utterance.utteranceId,
        text,
      })
    }
    recognizer.reset(utterance.stream)
  }

  private async decodeAvailable(utterance: ActiveUtterance): Promise<void> {
    const recognizer = this.requireRecognizer()
    while (recognizer.isReady(utterance.stream)) {
      recognizer.decode(utterance.stream)
      const text = recognizer.getResult(utterance.stream).text
      if (
        text !== utterance.lastText
        && !this.isCancelled(utterance)
      ) {
        utterance.lastText = text
        await this.emit({
          type: 'partial',
          streamId: utterance.streamId,
          generation: utterance.generation,
          utteranceId: utterance.utteranceId,
          text,
        })
      }
    }
  }

  private cancelStt(input: VoiceGenerationIdentity): void {
    this.rememberCancellation(input)
    if (!this.utterance || !matchesCancelled(this.utterance, input)) return
    this.utterance.cancelled = true
    this.recognizer?.reset(this.utterance.stream)
    this.utterance = undefined
  }

  private async synthesize(input: VoiceSynthesisRequest): Promise<void> {
    const config = this.requireConfig()
    if (this.isCancelled(input)) {
      throw new Error('TTS generation is cancelled')
    }
    if (this.synthesis) throw new Error('Piper synthesis is already active')
    const args = [
      '--model',
      config.tts.model,
      '--config',
      config.tts.config,
      '--output-raw',
      ...(config.tts.speaker === undefined
        ? []
        : ['--speaker', String(config.tts.speaker)]),
    ]
    const piper = this.options.spawnPiper(config.tts.binary, args)
    const active: ActiveSynthesis = {
      streamId: input.streamId,
      generation: input.generation,
      segmentId: input.segmentId,
      process: piper,
      exit: Promise.resolve({
        code: null,
        signal: null,
      }),
      exited: false,
      cancelled: false,
    }
    active.exit = waitForPiperExit(piper).then((result) => {
      active.exited = true
      return result
    })
    this.synthesis = active
    const stderr = readBoundedText(piper.stderr, MAX_PIPER_STDERR_BYTES)
    const audio = this.streamPiperAudio(active, piper.stdout)
    piper.stdin.end(`${input.text}\n`)

    try {
      const [result, diagnostic] = await Promise.all([active.exit, stderr, audio])
      if (this.isCancelled(input)) {
        throw new Error('TTS generation is cancelled')
      }
      if (result.error) throw result.error
      if (result.code !== 0) {
        const suffix = diagnostic ? `: ${diagnostic}` : ''
        throw new Error(`Piper exited with code ${result.code ?? 'unknown'}${suffix}`)
      }
      await this.emit({
        type: 'audio_end',
        streamId: input.streamId,
        generation: input.generation,
        segmentId: input.segmentId,
      })
    } catch (error) {
      await this.terminatePiper(active)
      throw error
    } finally {
      if (this.synthesis === active) this.synthesis = undefined
    }
  }

  private async streamPiperAudio(
    active: ActiveSynthesis,
    stdout: Readable,
  ): Promise<void> {
    let sequence = 0
    let carry = Buffer.alloc(0)
    for await (const rawChunk of stdout) {
      const chunk = Buffer.isBuffer(rawChunk)
        ? rawChunk
        : Buffer.from(rawChunk as Uint8Array)
      const combined = carry.length === 0
        ? chunk
        : Buffer.concat([carry, chunk])
      const evenLength = combined.length - (combined.length % 2)
      carry = evenLength === combined.length
        ? Buffer.alloc(0)
        : Buffer.from(combined.subarray(evenLength))
      if (evenLength === 0) continue
      if (this.isCancelled(active)) continue
      const samples = new Int16Array(evenLength / 2)
      for (let offset = 0; offset < evenLength; offset += 2) {
        samples[offset / 2] = combined.readInt16LE(offset)
      }
      await this.emit({
        type: 'audio',
        streamId: active.streamId,
        generation: active.generation,
        segmentId: active.segmentId,
        sequence,
        sampleRate: this.requireConfig().tts.sampleRate,
        samples,
      })
      sequence += 1
    }
    if (carry.length > 0 && !this.isCancelled(active)) {
      throw new Error('Piper emitted an incomplete PCM16 sample')
    }
  }

  private async cancelTts(input: VoiceGenerationIdentity): Promise<void> {
    this.rememberCancellation(input)
    const active = this.synthesis
    if (!active || !matchesCancelled(active, input)) return
    active.cancelled = true
    await this.terminatePiper(active)
    if (this.synthesis === active) this.synthesis = undefined
  }

  private requireRecognizer(): SherpaRecognizer {
    if (!this.recognizer) throw new Error('voice worker is not initialized')
    return this.recognizer
  }

  private requireConfig(): EnabledOracleVoiceConfig {
    if (!this.config) throw new Error('voice worker is not initialized')
    return this.config
  }

  private requireUtterance(input: {
    streamId: string
    generation: number
    utteranceId: string
  }): ActiveUtterance {
    if (
      !this.utterance
      || this.utterance.streamId !== input.streamId
      || this.utterance.generation !== input.generation
      || this.utterance.utteranceId !== input.utteranceId
    ) {
      throw new Error('STT utterance identity does not match')
    }
    return this.utterance
  }

  private emit(event: VoiceEngineEvent): Promise<void> {
    return this.options.send({ type: 'event', event })
  }

  private rememberCancellation(input: VoiceGenerationIdentity): void {
    if (
      !this.cancelledThroughGeneration.has(input.streamId)
      && this.cancelledThroughGeneration.size >= this.options.maxCancellationStreams
    ) {
      throw new CancellationStreamLimitError()
    }
    this.cancelledThroughGeneration.set(
      input.streamId,
      Math.max(
        this.cancelledThroughGeneration.get(input.streamId) ?? -1,
        input.generation,
      ),
    )
  }

  private isCancelled(
    input: VoiceGenerationIdentity & { cancelled?: boolean },
  ): boolean {
    return input.cancelled === true
      || input.generation <= (this.cancelledThroughGeneration.get(input.streamId) ?? -1)
  }

  private terminatePiper(active: ActiveSynthesis): Promise<void> {
    if (active.termination) return active.termination
    active.termination = this.terminatePiperProcess(active)
    return active.termination
  }

  private async terminatePiperProcess(active: ActiveSynthesis): Promise<void> {
    if (active.exited) return
    active.process.kill('SIGTERM')
    if (await waitForActivePiperExit(active, this.options.piperShutdownTimeoutMs)) return
    active.process.kill('SIGKILL')
    if (!await waitForActivePiperExit(active, this.options.piperShutdownTimeoutMs)) {
      throw new Error('Piper did not exit after SIGKILL')
    }
  }
}

class CancellationStreamLimitError extends Error {
  constructor() {
    super('voice cancellation stream limit exceeded')
  }
}

function pcm16ToFloat32(samples: Int16Array): Float32Array {
  const converted = new Float32Array(samples.length)
  for (let index = 0; index < samples.length; index += 1) {
    converted[index] = samples[index] / 32_768
  }
  return converted
}

function sherpaProfile(config: EnabledOracleVoiceConfig): {
  featureDimension: number
  encoder: string
  decoder: string
  joiner: string
} {
  if (config.stt.profile === 'zipformer') {
    return {
      featureDimension: 80,
      encoder: 'encoder-epoch-99-avg-1.int8.onnx',
      decoder: 'decoder-epoch-99-avg-1.onnx',
      joiner: 'joiner-epoch-99-avg-1.int8.onnx',
    }
  }
  return {
    featureDimension: 128,
    encoder: 'encoder.int8.onnx',
    decoder: 'decoder.int8.onnx',
    joiner: 'joiner.int8.onnx',
  }
}

function waitForPiperExit(piper: PiperProcess): Promise<PiperExitResult> {
  return new Promise((resolve) => {
    let settled = false
    const finish = (result: {
      code: number | null
      signal: NodeJS.Signals | null
      error?: Error
    }) => {
      if (settled) return
      settled = true
      resolve(result)
    }
    piper.once('exit', (code, signal) => finish({ code, signal }))
    piper.once('error', (error) => finish({ code: null, signal: null, error }))
  })
}

function waitForActivePiperExit(
  active: ActiveSynthesis,
  timeoutMs: number,
): Promise<boolean> {
  if (active.exited) return Promise.resolve(true)
  return new Promise((resolve) => {
    let settled = false
    const finish = (exited: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(exited)
    }
    const timer = setTimeout(() => finish(false), timeoutMs)
    void active.exit.then(() => finish(true))
  })
}

function matchesCancelled(
  active: VoiceGenerationIdentity,
  input: VoiceGenerationIdentity,
): boolean {
  return active.streamId === input.streamId
    && active.generation <= input.generation
}

async function readBoundedText(
  stream: Readable,
  maximumBytes: number,
): Promise<string> {
  const chunks: Buffer[] = []
  let stored = 0
  for await (const rawChunk of stream) {
    if (stored >= maximumBytes) continue
    const chunk = Buffer.isBuffer(rawChunk)
      ? rawChunk
      : Buffer.from(rawChunk as Uint8Array)
    const remaining = maximumBytes - stored
    const bounded = chunk.subarray(0, remaining)
    chunks.push(Buffer.from(bounded))
    stored += bounded.length
  }
  return Buffer.concat(chunks).toString('utf8').trim()
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'voice worker operation failed'
}

function defaultSpawnPiper(binary: string, args: string[]): ChildProcessWithoutNullStreams {
  return spawn(binary, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

async function sendProcessMessage(message: VoiceWorkerChildMessage): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const send = process.send
    if (!send || !process.connected) {
      reject(new Error('voice worker IPC channel is closed'))
      return
    }
    send.call(process, message, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

async function runChildProcess(): Promise<void> {
  const imported = await import('sherpa-onnx-node')
  const namespace = imported as unknown as {
    OnlineRecognizer?: unknown
    default?: unknown
  }
  const sherpa = (
    typeof namespace.OnlineRecognizer === 'function'
      ? namespace
      : namespace.default
  ) as SherpaModule
  const worker = createVoiceWorker({
    sherpa,
    spawnPiper: defaultSpawnPiper,
    send: sendProcessMessage,
  })
  process.on('message', (message: VoiceWorkerParentMessage) => {
    void worker.handle(message)
      .then(() => {
        if (message.type === 'close' && process.connected) process.disconnect?.()
      })
      .catch(() => {
        process.exitCode = 1
        if (process.connected) process.disconnect?.()
      })
  })
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (process.send && entry === fileURLToPath(import.meta.url)) {
  void runChildProcess().catch(async (error: unknown) => {
    try {
      await sendProcessMessage({
        type: 'event',
        event: {
          type: 'fatal_error',
          message: errorMessage(error),
        },
      })
    } finally {
      process.exitCode = 1
      if (process.connected) process.disconnect?.()
    }
  })
}
