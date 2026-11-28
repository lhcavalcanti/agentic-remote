import type { Page } from '@playwright/test'
import type { FastifyInstance } from 'fastify'
import type {
  LiveDictationEngine,
  LiveDictationEngineState,
} from '../../server/live-dictation-host'
import type { LiveDecodeResult } from '../../server/live-dictation-session'

const SAMPLE_RATE = 16_000
/** The padding the live session appends to every window. */
const PADDING_SECONDS = 1
/**
 * The fake microphone plays a slow sawtooth: its level says how far into the
 * stream it is, rising from -0.45 to 0.45 over this many seconds. Resampling
 * interpolates linearly, so the level survives it, and the fake engine reads
 * where each window starts from its first sample.
 */
export const FAKE_CLOCK_SECONDS = 32
const FAKE_CLOCK_LOW = -0.45
const FAKE_CLOCK_SPAN = 0.9

export interface FakeDictationState {
  state: LiveDictationEngineState
  passes: number
  finals: number
}

/**
 * A stand-in for the Parakeet worker. It "hears" a scripted sentence, a word
 * every 0.6 s from half a second in, at the positions the fake microphone's
 * signal gives each window, so the real live session's word agreement
 * confirms words as it would for speech. Passes hear the words in lower case;
 * the final decode returns them punctuated. It stays failed, so microphones
 * record and upload, until a test makes it ready.
 */
export class FakeDictationEngine implements LiveDictationEngine {
  state: LiveDictationEngineState = 'failed'
  passes = 0
  finals = 0
  private readonly words = ['Draft', 'the', 'release', 'notes', 'for', 'Friday.']

  async tryDecode(samples: Float32Array): Promise<LiveDecodeResult | null> {
    this.passes += 1
    return this.hear(samples, false)
  }

  async decode(samples: Float32Array): Promise<LiveDecodeResult> {
    this.finals += 1
    return this.hear(samples, true)
  }

  reset(state: LiveDictationEngineState = 'failed'): void {
    this.state = state
    this.passes = 0
    this.finals = 0
  }

  snapshot(): FakeDictationState {
    return { state: this.state, passes: this.passes, finals: this.finals }
  }

  private hear(samples: Float32Array, final: boolean): LiveDecodeResult {
    const start = ((samples[0] - FAKE_CLOCK_LOW) / FAKE_CLOCK_SPAN) * FAKE_CLOCK_SECONDS
    const end = start + samples.length / SAMPLE_RATE - PADDING_SECONDS
    const heard = this.words
      .map((word, index) => ({ word, start: 0.5 + index * 0.6, end: 0.95 + index * 0.6 }))
      .filter((entry) => entry.start >= start - 0.05 && entry.end <= end)
    const text = (word: string) => final ? word : word.toLowerCase().replace(/[.]$/, '')
    return {
      text: heard.map((entry) => text(entry.word)).join(' '),
      tokens: heard.map((entry) => ` ${text(entry.word)}`),
      timestamps: heard.map((entry) => Math.max(0, entry.start - start)),
      durations: heard.map((entry) => entry.end - entry.start),
    }
  }
}

/** E2E controls: make the engine ready with the sentence from its start, or unavailable. */
export function registerFakeDictationControls(app: FastifyInstance, engine: FakeDictationEngine): void {
  app.post<{ Body: { state?: LiveDictationEngineState } }>('/__e2e/dictation/reset', async (request) => {
    engine.reset(request.body?.state ?? 'ready')
    return { ok: true }
  })
  app.get('/__e2e/dictation/state', async () => engine.snapshot())
}

/**
 * Replaces the microphone with the fake engine's clock signal: getUserMedia
 * returns a stream whose one track can end, and the capture worklet posts
 * 20 ms blocks of 48 kHz samples on a timer. MediaRecorder records a token
 * blob, so the record-and-upload fallback works too.
 */
export async function installFakeDictationCapture(page: Page): Promise<void> {
  await page.addInitScript(({ clockSeconds, low, span }) => {
    class FakeTrack extends EventTarget {
      readyState = 'live'
      stop() {
        this.readyState = 'ended'
      }
    }
    class FakeStream {
      private readonly track = new FakeTrack()
      getTracks() {
        return [this.track]
      }
    }
    class FakeAudioContext extends EventTarget {
      readonly sampleRate = 48_000
      state: AudioContextState = 'running'
      readonly audioWorklet = { addModule: async () => undefined }
      createMediaStreamSource() {
        return { connect() {}, disconnect() {} }
      }
      async resume() {
        this.state = 'running'
      }
      async close() {
        this.state = 'closed'
      }
    }
    class FakeWorkletNode {
      readonly port: { onmessage: ((event: { data: Float32Array }) => void) | null } = { onmessage: null }
      private sample = 0
      private readonly timer = setInterval(() => {
        const block = new Float32Array(960)
        for (let index = 0; index < block.length; index += 1) {
          block[index] = low + span * (((this.sample / 48_000) % clockSeconds) / clockSeconds)
          this.sample += 1
        }
        this.port.onmessage?.({ data: block })
      }, 20)
      disconnect() {
        clearInterval(this.timer)
      }
    }
    class FakeMediaRecorder extends EventTarget {
      static isTypeSupported() {
        return true
      }
      state: 'inactive' | 'recording' = 'inactive'
      readonly mimeType = 'audio/webm'
      start() {
        this.state = 'recording'
      }
      stop() {
        this.state = 'inactive'
        this.dispatchEvent(Object.assign(new Event('dataavailable'), {
          data: new Blob(['synthetic audio'], { type: 'audio/webm' }),
        }))
        this.dispatchEvent(new Event('stop'))
      }
    }
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => new FakeStream() },
    })
    Object.assign(window, {
      AudioContext: FakeAudioContext,
      AudioWorkletNode: FakeWorkletNode,
      MediaRecorder: FakeMediaRecorder,
    })
  }, { clockSeconds: FAKE_CLOCK_SECONDS, low: FAKE_CLOCK_LOW, span: FAKE_CLOCK_SPAN })
}
