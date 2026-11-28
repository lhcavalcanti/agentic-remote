import { describe, expect, it, vi } from 'vitest'
import { createPcmCapture, PcmCaptureError, type CaptureDeps } from './capture'
import workletSource from './pcm-capture-worklet.js?raw'

class FakeTrack extends EventTarget {
  stopped = false
  stop() {
    this.stopped = true
  }
}

class FakeNode {
  readonly port = { onmessage: null as ((event: { data: Float32Array }) => void) | null }
  connectedFrom: unknown
  disconnect = vi.fn()

  /** Delivers a block of microphone samples, as the worklet posts them. */
  deliver(samples: Float32Array) {
    this.port.onmessage?.({ data: samples })
  }
}

class FakeContext extends EventTarget {
  state: AudioContextState | 'interrupted' = 'running'
  readonly sampleRate: number
  readonly audioWorklet = { addModule: vi.fn(async (_url: string) => undefined) }
  readonly close = vi.fn(async () => {
    this.state = 'closed'
  })
  readonly resume = vi.fn(async () => {
    this.state = 'running'
  })
  source = { connect: vi.fn(), disconnect: vi.fn() }

  constructor(sampleRate = 48_000) {
    super()
    this.sampleRate = sampleRate
  }

  createMediaStreamSource() {
    return this.source
  }
}

function setup(overrides: Partial<CaptureDeps> = {}, sampleRate = 48_000) {
  const track = new FakeTrack()
  const stream = { getTracks: () => [track] } as unknown as MediaStream
  const context = new FakeContext(sampleRate)
  const node = new FakeNode()
  const page = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState })
  const getUserMedia = vi.fn(async (_constraints?: MediaStreamConstraints) => stream)
  const capture = createPcmCapture({
    mediaDevices: { getUserMedia },
    audioWorkletSupported: () => true,
    createAudioContext: () => context as unknown as AudioContext,
    createWorkletNode: () => node as unknown as AudioWorkletNode,
    workletUrl: '/assets/pcm-capture-worklet.js',
    document: page,
    ...overrides,
  })
  const frames: Int16Array[] = []
  const interruptions: string[] = []
  return {
    capture, track, context, node, page, getUserMedia, frames, interruptions,
    start: () => capture.start((frame) => frames.push(frame), (reason) => interruptions.push(reason)),
  }
}

describe('PCM capture', () => {
  it('asks for one echo-cancelled channel and loads the capture worklet', async () => {
    const { start, getUserMedia, context } = setup()
    await start()
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
    expect(context.audioWorklet.addModule).toHaveBeenCalledWith('/assets/pcm-capture-worklet.js')
    expect(context.source.connect).toHaveBeenCalled()
  })

  it('resamples to 16 kHz and sends 100 ms frames', async () => {
    const { start, node, frames } = setup()
    await start()
    // 150 ms at 48 kHz, in blocks of 1,024 and one of 1,152.
    for (let block = 0; block < 6; block += 1) node.deliver(new Float32Array(1_024).fill(0.5))
    node.deliver(new Float32Array(1_056).fill(0.5))
    expect(frames).toHaveLength(1)
    expect(frames[0]).toHaveLength(1_600)
    expect(frames[0].every((sample) => sample === 16_384)).toBe(true)
  })

  it('sends the last partial frame on stop and releases the microphone', async () => {
    const { capture, start, node, frames, track, context } = setup(undefined, 16_000)
    await start()
    node.deliver(new Float32Array(2_000).fill(-0.25))
    await capture.stop()
    expect(frames.map((frame) => frame.length)).toEqual([1_600, 400])
    expect(frames[1][0]).toBe(-8_192)
    expect(track.stopped).toBe(true)
    expect(context.close).toHaveBeenCalled()
    expect(node.disconnect).toHaveBeenCalled()
    node.deliver(new Float32Array(3_200))
    expect(frames).toHaveLength(2)
  })

  it.each([
    ['the track ends', ({ track }: ReturnType<typeof setup>) => track.dispatchEvent(new Event('ended'))],
    ['the track is muted', ({ track }: ReturnType<typeof setup>) => track.dispatchEvent(new Event('mute'))],
    ['the page is hidden', ({ page }: ReturnType<typeof setup>) => {
      page.visibilityState = 'hidden'
      page.dispatchEvent(new Event('visibilitychange'))
    }],
    ['the audio session is interrupted', ({ context }: ReturnType<typeof setup>) => {
      context.state = 'interrupted'
      context.dispatchEvent(new Event('statechange'))
    }],
  ])('reports an interruption once when %s', async (_label, interrupt) => {
    const harness = setup()
    await harness.start()
    interrupt(harness)
    interrupt(harness)
    expect(harness.interruptions).toHaveLength(1)
    await harness.capture.stop()
    harness.track.dispatchEvent(new Event('ended'))
    expect(harness.interruptions).toHaveLength(1)
  })

  it('gives up on audio the browser keeps suspended and releases the microphone', async () => {
    const refused = setup()
    refused.context.state = 'suspended'
    refused.context.resume.mockImplementation(async () => undefined)
    await expect(refused.start()).rejects.toMatchObject({ code: 'audio-suspended' })
    expect(refused.track.stopped).toBe(true)

    vi.useFakeTimers()
    try {
      const pending = setup()
      pending.context.state = 'suspended'
      pending.context.resume.mockImplementation(() => new Promise<void>(() => undefined))
      const starting = pending.start().catch((error: unknown) => error)
      await vi.advanceTimersByTimeAsync(2_000)
      expect(await starting).toMatchObject({ code: 'audio-suspended' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('refuses a browser without AudioWorklet before asking for the microphone', async () => {
    const { start, getUserMedia } = setup({ audioWorkletSupported: () => false })
    await expect(start()).rejects.toMatchObject({ code: 'audio-worklet-unavailable' })
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('reports a denied microphone and releases what it opened when the worklet fails', async () => {
    const denied = setup({
      mediaDevices: { getUserMedia: async () => { throw new DOMException('no', 'NotAllowedError') } },
    })
    await expect(denied.start()).rejects.toEqual(new PcmCaptureError('permission-denied', 'Microphone permission was denied'))
    const broken = setup()
    broken.context.audioWorklet.addModule.mockRejectedValueOnce(new Error('blocked'))
    await expect(broken.start()).rejects.toMatchObject({ code: 'capture-failed' })
    expect(broken.track.stopped).toBe(true)
    expect(broken.context.close).toHaveBeenCalled()
  })
})

describe('PCM capture worklet', () => {
  it('posts mono input to the page in blocks of 1,024 samples', () => {
    const posted: Float32Array[] = []
    let Processor: (new () => { process(inputs: Float32Array[][]): boolean; port: unknown }) | undefined
    class AudioWorkletProcessor {
      port = { postMessage: (data: Float32Array) => posted.push(data) }
    }
    const registerProcessor = (name: string, processor: typeof Processor) => {
      expect(name).toBe('agentic-remote-pcm-capture')
      Processor = processor
    }
    // The worklet's globals, as the audio rendering thread provides them.
    new Function('AudioWorkletProcessor', 'registerProcessor', workletSource)(AudioWorkletProcessor, registerProcessor)
    const processor = new Processor!()
    const block = (value: number) => [[new Float32Array(128).fill(value)]]
    for (let index = 0; index < 9; index += 1) expect(processor.process(block(index))).toBe(true)
    expect(processor.process([[]])).toBe(true)
    expect(posted).toHaveLength(1)
    expect(posted[0]).toHaveLength(1_024)
    expect(posted[0][0]).toBe(0)
    expect(posted[0][1_023]).toBe(7)
  })
})
