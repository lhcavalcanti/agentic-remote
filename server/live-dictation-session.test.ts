import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DictationLimitError,
  LiveDictationError,
  LiveDictationSession,
  type LiveDecodeOptions,
  type LiveDecodeResult,
  type LiveDecoder,
  type LiveDictationUpdate,
} from './live-dictation-session.js'

const RATE = 16_000
type Word = [text: string, start: number, end: number]
type Reply = LiveDecodeResult | null | Error | Promise<LiveDecodeResult | null>

interface DecoderCall {
  kind: 'try' | 'decode'
  /** Seconds of audio in the window, without the 1 s of padding. */
  seconds: number
  samples: Float32Array
  options: LiveDecodeOptions
}

class ScriptedDecoder implements LiveDecoder {
  readonly calls: DecoderCall[] = []

  constructor(private readonly respond: (call: DecoderCall) => Reply) {}

  tryDecode(samples: Float32Array, options: LiveDecodeOptions) {
    return this.reply({ kind: 'try', seconds: samples.length / RATE - 1, samples, options })
  }

  decode(samples: Float32Array, options: LiveDecodeOptions) {
    return this.reply({ kind: 'decode', seconds: samples.length / RATE - 1, samples, options }) as
      Promise<LiveDecodeResult>
  }

  private async reply(call: DecoderCall): Promise<LiveDecodeResult | null> {
    this.calls.push(call)
    const reply = await this.respond(call)
    if (reply instanceof Error) throw reply
    return reply
  }
}

/** A decoder result for words timed from the start of the window. */
function decoded(words: Word[]): LiveDecodeResult {
  return {
    text: words.map(([text]) => text).join(' '),
    tokens: words.map(([text]) => ` ${text}`),
    timestamps: words.map(([, start]) => start),
    durations: words.map(([, start, end]) => end - start),
  }
}

/**
 * A perfect decoder over a script of absolute word times: each window hears
 * the words that lie wholly inside it. The window ends where the audio ends.
 */
function scriptDecoder(script: Word[], heardUntil: () => number, finalSpelling = (text: string) => text) {
  return new ScriptedDecoder((call) => {
    const end = heardUntil()
    const offset = end - call.seconds
    return decoded(script
      .filter(([, start, wordEnd]) => start >= offset - 1e-6 && wordEnd <= end + 1e-6)
      .map(([text, start, wordEnd]) => [
        call.kind === 'decode' ? finalSpelling(text) : text, start - offset, wordEnd - offset,
      ]))
  })
}

/**
 * Like Parakeet, it does not hear a word that starts near the beginning of its
 * window, unless the window starts the stream: a word needs some audio before
 * it.
 */
function contextDecoder(script: Word[], heardUntil: () => number) {
  return new ScriptedDecoder((call) => {
    const end = heardUntil()
    const offset = end - call.seconds
    return decoded(script
      .filter(([, start, wordEnd]) => (offset < 1e-6 || start >= offset + 0.6) && wordEnd <= end + 1e-6)
      .map(([text, start, wordEnd]) => [text, start - offset, wordEnd - offset]))
  })
}

const windows = (decoder: ScriptedDecoder) => decoder.calls.map((call) => Number(call.seconds.toFixed(3)))

function feeder(session: LiveDictationSession) {
  let samples = 0
  return {
    seconds: () => samples / RATE,
    feed(seconds: number) {
      for (let frame = 0; frame < Math.round(seconds * 10); frame += 1) {
        session.appendAudio(new Int16Array(1_600).fill(1_000))
        samples += 1_600
      }
    },
  }
}

function setup(respond: (heardUntil: () => number) => ScriptedDecoder, options = {}) {
  const updates: LiveDictationUpdate[] = []
  const failures: LiveDictationError[] = []
  let audio: ReturnType<typeof feeder> | undefined
  const decoder = respond(() => audio!.seconds())
  const session = new LiveDictationSession(
    decoder,
    (update) => updates.push(update),
    options,
    undefined,
    (failure) => failures.push(failure),
  )
  audio = feeder(session)
  return { decoder, session, updates, failures, feed: audio.feed }
}

const committed = (updates: LiveDictationUpdate[]) => updates.map((update) => update.committedAppend).join('')

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('LiveDictationSession passes', () => {
  it('shows tentative words after the first pass that is due', async () => {
    const { decoder, session, updates, feed } = setup(() =>
      new ScriptedDecoder(() => decoded([['hello', 0.1, 0.4], ['world', 0.5, 0.8]])))
    session.start()
    feed(0.3)
    await vi.advanceTimersByTimeAsync(750)
    expect(decoder.calls).toHaveLength(0)
    feed(0.7)
    await vi.advanceTimersByTimeAsync(750)
    expect(decoder.calls).toHaveLength(1)
    expect(decoder.calls[0]).toMatchObject({ kind: 'try', seconds: 1 })
    expect(decoder.calls[0].samples[0]).toBeCloseTo(1_000 / 32_768, 6)
    expect(decoder.calls[0].samples.subarray(RATE).every((sample) => sample === 0)).toBe(true)
    expect(updates).toEqual([{ seq: 1, committedAppend: '', tentative: 'hello world' }])
  })

  it('commits the words two passes agree on and re-decodes from a second before the last of them', async () => {
    const { decoder, session, updates, feed } = setup((heard) =>
      scriptDecoder([['hello', 0.1, 0.4], ['world', 0.5, 0.8], ['how', 2.2, 2.5]], heard))
    session.start()
    for (let second = 0; second < 5; second += 1) {
      feed(1)
      await vi.advanceTimersByTimeAsync(750)
    }
    expect(updates).toEqual([
      { seq: 1, committedAppend: '', tentative: 'hello world' },
      { seq: 2, committedAppend: 'hello world', tentative: '' },
      { seq: 3, committedAppend: '', tentative: 'how' },
      { seq: 4, committedAppend: ' how', tentative: '' },
    ])
    // Windows start at 0 while "world" (0.5 s) is the last confirmed word, then at 1.2 s for "how".
    expect(windows(decoder)).toEqual([1, 2, 3, 4, 3.8])
  })

  it('hears the unconfirmed words again with the confirmed audio before them', async () => {
    const script: Word[] = Array.from({ length: 27 }, (_, index) =>
      [`w${index}`, 0.1 + index * 0.5, 0.45 + index * 0.5])
    const { session, updates, feed } = setup((heard) => contextDecoder(script, heard))
    session.start()
    for (let second = 0; second < 14; second += 1) {
      feed(1)
      await vi.advanceTimersByTimeAsync(750)
    }
    const words = committed(updates).split(' ')
    // Nothing skipped and nothing repeated, all the way through.
    expect(words).toEqual(script.slice(0, words.length).map(([text]) => text))
    expect(words.length).toBeGreaterThan(20)
    await expect(session.finish()).resolves.toBe(script.map(([text]) => text).join(' '))
  })

  it('skips a busy pass and keeps its audio for the next one', async () => {
    let busy = true
    const { decoder, session, updates, feed } = setup(() =>
      new ScriptedDecoder(() => busy ? null : decoded([['hi', 0.2, 0.5]])))
    session.start()
    feed(1)
    await vi.advanceTimersByTimeAsync(750)
    expect(updates).toEqual([])
    busy = false
    // 0.4 s is less new audio than a pass needs, unless the busy pass never counted.
    feed(0.4)
    await vi.advanceTimersByTimeAsync(750)
    expect(windows(decoder)).toEqual([1, 1.4])
    expect(updates).toEqual([{ seq: 1, committedAppend: '', tentative: 'hi' }])
  })

  it('skips silence once a wordless window reaches two seconds', async () => {
    const { decoder, session, updates, feed } = setup(() => new ScriptedDecoder(() => decoded([])))
    session.start()
    feed(1.5)
    await vi.advanceTimersByTimeAsync(750)
    feed(1)
    await vi.advanceTimersByTimeAsync(750)
    feed(1)
    await vi.advanceTimersByTimeAsync(750)
    // 1.5 s of silence is kept; 2.5 s is skipped to half a second before its end,
    // and the next window starts a second before that instead of at 0.
    expect(windows(decoder)).toEqual([1.5, 2.5, 2.5])
    expect(updates).toEqual([])
  })

  it('force-confirms words more than five seconds old once the window passes fifteen seconds', async () => {
    const { decoder, session, updates, feed } = setup((heard) =>
      new ScriptedDecoder((call) => {
        const pass = decoder.calls.length
        const offset = heard() - call.seconds
        return decoded(([
          [`a${pass}`, 1, 1.5], [`b${pass}`, 5, 5.5], [`c${pass}`, 10.5, 11], [`d${pass}`, 12, 12.5],
        ] as Word[])
          .filter(([, start]) => start >= offset)
          .map(([text, start, end]) => [text, start - offset, end - offset]))
      }))
    session.start()
    feed(16)
    await vi.advanceTimersByTimeAsync(750)
    expect(updates).toEqual([{ seq: 1, committedAppend: 'a1 b1 c1', tentative: 'd1' }])
    feed(1)
    await vi.advanceTimersByTimeAsync(750)
    // The next window starts a second before "c1", the last word confirmed.
    expect(windows(decoder)).toEqual([16, 7.5])
  })

  it('emits nothing after it is cancelled, even for a pass already running', async () => {
    let answer!: (result: LiveDecodeResult) => void
    const { decoder, session, updates, feed } = setup(() =>
      new ScriptedDecoder(() => new Promise<LiveDecodeResult>((resolve) => { answer = resolve })))
    session.start()
    feed(1)
    await vi.advanceTimersByTimeAsync(750)
    expect(decoder.calls).toHaveLength(1)
    session.cancel()
    expect(decoder.calls[0].options.signal?.aborted).toBe(true)
    answer(decoded([['late', 0.1, 0.4]]))
    feed(2)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(updates).toEqual([])
    expect(decoder.calls).toHaveLength(1)
    await expect(session.finish()).rejects.toThrow(/cancelled/)
  })

  it('fails with the committed text after three passes fail in a row', async () => {
    let calls = 0
    const { decoder, session, updates, failures, feed } = setup(() =>
      new ScriptedDecoder(() => {
        calls += 1
        // One failure, then two agreeing passes, then failures only.
        if (calls === 1 || calls > 3) return new Error('worker exited')
        return decoded([['ok', 0.1, 0.3]])
      }))
    session.start()
    for (let pass = 0; pass < 6; pass += 1) {
      feed(1)
      await vi.advanceTimersByTimeAsync(750)
    }
    expect(committed(updates)).toBe('ok')
    expect(failures).toHaveLength(1)
    expect(failures[0]).toMatchObject({ code: 'engine_failed', committedText: 'ok' })
    expect(calls).toBe(6)
    feed(2)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(decoder.calls).toHaveLength(6)
  })
})

describe('LiveDictationSession bounds', () => {
  it('ends at the duration limit and keeps the audio up to it', () => {
    const { session, feed } = setup(() => new ScriptedDecoder(() => decoded([])), { maxDurationMs: 2_000 })
    feed(1.9)
    let caught: unknown
    try {
      session.appendAudio(new Int16Array(3_200))
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(DictationLimitError)
    expect(caught).toMatchObject({ code: 'duration_limit' })
    expect(session.stats().audioSeconds).toBe(2)
    expect(() => session.appendAudio(new Int16Array(1_600))).toThrow(DictationLimitError)
  })

  it('keeps no more than the longest window and two seconds over a fifteen-minute stream', async () => {
    // Every pass hears different words, so only the forced confirm moves on.
    const { decoder, session, feed } = setup(() =>
      new ScriptedDecoder((call) => {
        const words: Word[] = []
        for (let start = 0.1; start + 0.4 < call.seconds; start += 0.5) {
          words.push([`p${decoder.calls.length}w${words.length}`, start, start + 0.4])
        }
        return decoded(words)
      }), { maxDurationMs: 901_000 })
    session.start()
    let largest = 0
    for (let second = 0; second < 900; second += 1) {
      feed(1)
      await vi.advanceTimersByTimeAsync(1_000)
      largest = Math.max(largest, session.stats().retainedSeconds)
    }
    expect(session.stats().audioSeconds).toBe(900)
    // The longest window: fifteen unconfirmed seconds, the last confirmed word and a second before it.
    const longest = Math.max(...decoder.calls.map((call) => call.seconds))
    expect(longest).toBeLessThanOrEqual(15 + 0.5 + 1 + 1)
    expect(largest).toBeGreaterThan(12)
    expect(largest).toBeLessThanOrEqual(longest + 2)
  })
})

describe('LiveDictationSession finish', () => {
  it('decodes a short utterance whole for its final text', async () => {
    const { decoder, session, updates, feed } = setup((heard) =>
      scriptDecoder([['hello', 0.1, 0.4], ['world', 0.5, 0.8], ['how', 2.2, 2.5]], heard,
        (text) => text.toUpperCase()))
    session.start()
    for (let second = 0; second < 3; second += 1) {
      feed(1)
      await vi.advanceTimersByTimeAsync(750)
    }
    expect(committed(updates)).toBe('hello world')
    await expect(session.finish()).resolves.toBe('HELLO WORLD HOW')
    expect(decoder.calls.at(-1)).toMatchObject({ kind: 'decode', seconds: 3 })
  })

  it('keeps committed words verbatim and decodes only the tail of a long utterance', async () => {
    const script: Word[] = Array.from({ length: 28 }, (_, index) =>
      [`w${index}`, 0.1 + index * 0.5, 0.45 + index * 0.5])
    const { decoder, session, updates, feed } = setup((heard) =>
      scriptDecoder(script, heard, (text) => text.toUpperCase()))
    session.start()
    for (let second = 0; second < 14; second += 1) {
      feed(1)
      await vi.advanceTimersByTimeAsync(750)
    }
    const words = committed(updates)
    expect(words.startsWith('w0 w1 w2')).toBe(true)
    const final = await session.finish()
    const tail = decoder.calls.at(-1)!
    expect(tail.kind).toBe('decode')
    // From a second before the last committed word.
    expect(tail.seconds).toBeLessThan(4)
    const tailWords = script.slice(words.split(' ').length).map(([text]) => text.toUpperCase())
    expect(tailWords.length).toBeGreaterThan(0)
    expect(final).toBe(`${words} ${tailWords.join(' ')}`)
  })

  it('reports an engine failure with the committed text when the final decode fails', async () => {
    let fail = false
    const { session, updates, feed } = setup(() =>
      new ScriptedDecoder(() => fail ? new Error('worker exited') : decoded([['ok', 0.1, 0.3]])))
    session.start()
    feed(1)
    await vi.advanceTimersByTimeAsync(750)
    feed(1)
    await vi.advanceTimersByTimeAsync(750)
    expect(committed(updates)).toBe('ok')
    fail = true
    const error = await session.finish().catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(LiveDictationError)
    expect(error).toMatchObject({ code: 'engine_failed', committedText: 'ok' })
  })

  it('gives up on the final text after thirty seconds', async () => {
    const { decoder, session, feed } = setup(() =>
      new ScriptedDecoder((call) => call.kind === 'decode'
        ? new Promise<LiveDecodeResult>(() => undefined)
        : decoded([])))
    session.start()
    feed(1)
    const finishing = session.finish().catch((caught: unknown) => caught)
    await vi.advanceTimersByTimeAsync(29_999)
    expect(decoder.calls.at(-1)?.options.signal?.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await expect(finishing).resolves.toMatchObject({ code: 'final_timeout', committedText: '' })
    expect(decoder.calls.at(-1)?.options.signal?.aborted).toBe(true)
  })

  it('finishes an empty stream without decoding', async () => {
    const { decoder, session } = setup(() => new ScriptedDecoder(() => decoded([])))
    session.start()
    await expect(session.finish()).resolves.toBe('')
    expect(decoder.calls).toEqual([])
  })
})
