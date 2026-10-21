import { describe, expect, it, vi } from 'vitest'
import type { VoiceAudioFrame } from '../../shared/oracle-voice'
import {
  VoicePlayback,
  VoicePlaybackQueueError,
  VoicePlaybackSequenceError,
} from './playback'

describe('VoicePlayback', () => {
  it('ducks tentatively and clears old generation sources on confirmation', () => {
    const playback = harness()
    playback.enqueue(audio(2, 'segment-a', 0, 24_000))

    playback.tentativeSpeech()
    expect(playback.gain()).toBeCloseTo(0.12)
    expect(playback.gainEvents()).toContainEqual({
      type: 'ramp',
      value: 0.12,
      time: 0.02,
    })

    playback.confirmSpeech(3)
    expect(playback.stoppedGenerations()).toContain(2)
    expect(playback.instance.queuedSeconds).toBe(0)
    expect(playback.instance.currentGeneration).toBe(3)
  })

  it('requires monotonic sequence within each playback segment', () => {
    const playback = harness()

    expect(playback.enqueue(audio(2, 'segment-a', 0))).toBe(true)
    expect(playback.enqueue(audio(2, 'segment-a', 1))).toBe(true)
    expect(() => playback.enqueue(audio(2, 'segment-a', 3)))
      .toThrow(VoicePlaybackSequenceError)
    expect(() => playback.enqueue(audio(2, 'segment-a', 1)))
      .toThrow(VoicePlaybackSequenceError)
    expect(playback.enqueue(audio(2, 'segment-b', 0))).toBe(true)
  })

  it.each([
    ['LJSpeech', 176_469],
    ['Faber', 148_224],
  ])('accepts the measured %s sentence and caps future audio at twelve seconds', (
    _voice,
    sampleCount,
  ) => {
    const playback = harness()
    const frames = splitAudio(2, 'segment-a', 22_050, sampleCount)

    for (const frame of frames) expect(playback.enqueue(frame)).toBe(true)
    expect(playback.instance.queuedSeconds).toBeCloseTo(sampleCount / 22_050)
    expect(() => playback.enqueue(audio(
      2,
      'segment-a',
      frames.length,
      22_050,
      12 * 22_050 - sampleCount + 1,
    )))
      .toThrow(VoicePlaybackQueueError)
    expect(playback.sources).toHaveLength(frames.length)
  })

  it('caps the number of scheduled sources even when frames are tiny', () => {
    const playback = harness({ maxScheduledSources: 2 })

    playback.enqueue(audio(2, 'segment-a', 0, 192_000, 1))
    playback.enqueue(audio(2, 'segment-a', 1, 192_000, 1))

    expect(() => playback.enqueue(audio(2, 'segment-a', 2, 192_000, 1)))
      .toThrow(VoicePlaybackQueueError)
    expect(playback.sources).toHaveLength(2)
  })

  it('rejects empty playback frames instead of scheduling zero-duration sources', () => {
    const playback = harness()

    expect(() => playback.enqueue(audio(2, 'segment-a', 0, 24_000, 0)))
      .toThrow(VoicePlaybackSequenceError)
    expect(playback.sources).toEqual([])
  })

  it('rejects stale generation audio without disturbing current playback', () => {
    const playback = harness()
    playback.enqueue(audio(2, 'segment-a', 0))
    playback.confirmSpeech(3)

    expect(playback.enqueue(audio(2, 'stale', 0))).toBe(false)
    expect(playback.sources).toHaveLength(1)
    expect(playback.sources[0].generation).toBe(2)
    expect(playback.sources[0].stopped).toBe(true)
  })

  it('removes scheduled sources when Web Audio reports that they ended', () => {
    const playback = harness()
    playback.enqueue(audio(2, 'segment-a', 0))
    playback.enqueue(audio(2, 'segment-a', 1))

    expect(playback.instance.activeSourceCount).toBe(2)
    playback.sources[0].finish()
    expect(playback.instance.activeSourceCount).toBe(1)
    playback.sources[1].finish()
    expect(playback.instance.activeSourceCount).toBe(0)
  })

  it('resolves segment drain only after every scheduled source for that segment ends', async () => {
    const playback = harness()
    playback.enqueue(audio(2, 'segment-a', 0))
    playback.enqueue(audio(2, 'segment-a', 1))
    playback.enqueue(audio(2, 'segment-b', 0))

    const drained = playback.endSegment(2, 'segment-a')
    const settled = vi.fn()
    void drained.then(settled)
    await Promise.resolve()
    expect(settled).not.toHaveBeenCalled()

    playback.sources[0].finish()
    playback.sources[2].finish()
    await Promise.resolve()
    expect(settled).not.toHaveBeenCalled()

    playback.sources[1].finish()
    await expect(drained).resolves.toBe(true)
  })

  it('settles obsolete drain waiters on generation change and close', async () => {
    const playback = harness()
    playback.enqueue(audio(2, 'segment-a', 0))
    const interrupted = playback.endSegment(2, 'segment-a')

    playback.confirmSpeech(3)
    await expect(interrupted).resolves.toBe(false)
    await expect(playback.endSegment(2, 'segment-a')).resolves.toBe(false)

    playback.enqueue(audio(3, 'segment-b', 0))
    const closed = playback.endSegment(3, 'segment-b')
    await playback.instance.close()
    await expect(closed).resolves.toBe(false)
  })

  it('uses each frame native sample rate so Web Audio performs conversion', () => {
    const playback = harness({ contextRate: 48_000 })

    playback.enqueue(audio(2, 'segment-a', 0, 22_050, 441))

    expect(playback.createdBuffers).toEqual([
      { channels: 1, length: 441, sampleRate: 22_050 },
    ])
    expect(playback.sources[0].buffer?.duration).toBeCloseTo(0.02)
    expect(playback.sources[0].startedAt).toBe(0)
  })

  it('restores full gain over 80 ms after a VAD misfire', () => {
    const playback = harness()
    playback.tentativeSpeech()

    playback.restoreAfterMisfire()

    expect(playback.gain()).toBe(1)
    expect(playback.gainEvents().at(-1)).toEqual({
      type: 'ramp',
      value: 1,
      time: 0.08,
    })
  })

  it('rejects audio that arrives after its segment ended', () => {
    const playback = harness()
    playback.enqueue(audio(2, 'segment-a', 0))
    playback.endSegment(2, 'segment-a')

    expect(() => playback.enqueue(audio(2, 'segment-a', 0)))
      .toThrow(VoicePlaybackSequenceError)
    playback.endSegment(1, 'segment-a')
    expect(() => playback.enqueue(audio(2, 'segment-a', 0)))
      .toThrow(VoicePlaybackSequenceError)
  })

  it('stops sources, disconnects the gain node, and closes its own context once', async () => {
    const playback = harness()
    playback.enqueue(audio(2, 'segment-a', 0))

    await playback.instance.close()
    await playback.instance.close()

    expect(playback.sources[0].stopped).toBe(true)
    expect(playback.gainNode.disconnect).toHaveBeenCalledOnce()
    expect(playback.context.close).toHaveBeenCalledOnce()
    expect(() => playback.enqueue(audio(2, 'segment-a', 1)))
      .toThrow('closed')
  })
})

function harness({
  contextRate = 48_000,
  maxScheduledSources,
}: {
  contextRate?: number
  maxScheduledSources?: number
} = {}) {
  const gainEvents: Array<{ type: string; value: number; time: number }> = []
  const gainParam = {
    value: 1,
    cancelScheduledValues: vi.fn(),
    setValueAtTime: vi.fn((value: number, time: number) => {
      gainParam.value = value
      gainEvents.push({ type: 'set', value, time })
      return gainParam
    }),
    linearRampToValueAtTime: vi.fn((value: number, time: number) => {
      gainParam.value = value
      gainEvents.push({ type: 'ramp', value, time })
      return gainParam
    }),
  }
  const gainNode = {
    gain: gainParam,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
  const sources: FakeSource[] = []
  const createdBuffers: Array<{
    channels: number
    length: number
    sampleRate: number
  }> = []
  const context = {
    currentTime: 0,
    destination: {},
    sampleRate: contextRate,
    state: 'running',
    close: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => gainNode),
    createBuffer: vi.fn((channels: number, length: number, sampleRate: number) => {
      createdBuffers.push({ channels, length, sampleRate })
      const samples = new Float32Array(length)
      return {
        duration: length / sampleRate,
        sampleRate,
        copyToChannel: (source: Float32Array) => samples.set(source),
      }
    }),
    createBufferSource: vi.fn(() => {
      const source = new FakeSource()
      sources.push(source)
      return source
    }),
  } as unknown as AudioContext
  const instance = new VoicePlayback({
    initialGeneration: 2,
    maxScheduledSources,
    createAudioContext: () => context,
  })

  return {
    instance,
    context: context as AudioContext & { close: ReturnType<typeof vi.fn> },
    gainNode,
    sources,
    createdBuffers,
    enqueue: (frame: VoiceAudioFrame) => {
      const accepted = instance.enqueue(frame)
      const source = sources.at(-1)
      if (accepted && source) source.generation = frame.generation
      return accepted
    },
    tentativeSpeech: () => instance.tentativeSpeech(),
    confirmSpeech: (generation: number) => instance.confirmSpeech(generation),
    restoreAfterMisfire: () => instance.restoreAfterMisfire(),
    endSegment: (generation: number, segmentId: string) =>
      instance.endSegment(generation, segmentId),
    gain: () => gainParam.value,
    gainEvents: () => gainEvents,
    stoppedGenerations: () => sources
      .filter((source) => source.stopped)
      .map((source) => source.generation),
  }
}

class FakeSource {
  buffer: AudioBuffer | null = null
  onended: (() => void) | null = null
  generation = -1
  startedAt = -1
  stopped = false
  connect = vi.fn()
  disconnect = vi.fn()

  start(time = 0): void {
    this.startedAt = time
  }

  stop(): void {
    this.stopped = true
  }

  finish(): void {
    this.onended?.()
  }
}

function audio(
  generation: number,
  segmentId: string,
  sequence: number,
  sampleRate = 24_000,
  sampleCount = 240,
): VoiceAudioFrame {
  return {
    direction: 'playback',
    generation,
    segmentId,
    sequence,
    sampleRate,
    samples: Int16Array.from(
      { length: sampleCount },
      (_, index) => index % 2 === 0 ? -32768 : 32767,
    ),
  }
}

function splitAudio(
  generation: number,
  segmentId: string,
  sampleRate: number,
  sampleCount: number,
): VoiceAudioFrame[] {
  const maxFrameSamples = 16_000
  const frames: VoiceAudioFrame[] = []
  for (let offset = 0; offset < sampleCount; offset += maxFrameSamples) {
    frames.push(audio(
      generation,
      segmentId,
      frames.length,
      sampleRate,
      Math.min(maxFrameSamples, sampleCount - offset),
    ))
  }
  return frames
}
