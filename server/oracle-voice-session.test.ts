import { describe, expect, it, vi } from 'vitest'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  VOICE_AUDIO_HEADER_BYTES,
  type VoiceAudioFrame,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import {
  FakeVoiceEngine,
  FakeVoiceEngineFactory,
  type VoiceEngineEvent,
  type VoiceUtteranceAudioFrame,
} from './oracle-voice-engine.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import {
  LocalVoiceBackend,
  VoiceSessionError,
  createVoiceBackendSession,
  type VoiceBackendOutput,
  type VoiceBackendSessionLimits,
} from './oracle-voice-session.js'

const streamId = 'voice-stream'
const limits: VoiceBackendSessionLimits = {
  maxFrameBytes: 4096,
  maxQueueBytes: ORACLE_VOICE_SAMPLE_RATE * 2 * 2,
  maxUtteranceMs: 30_000,
  idleTimeoutMs: 30_000,
}

const config: EnabledOracleVoiceConfig = {
  enabled: true,
  language: 'en',
  threads: 2,
  endpointMs: 800,
  stt: {
    profile: 'zipformer',
    modelDirectory: '/models/stt',
  },
  tts: {
    binary: '/bin/piper',
    model: '/models/lessac.onnx',
    config: '/models/lessac.json',
    sampleRate: 22_050,
  },
}

function control(
  type: VoiceClientControl['type'],
  generation: number,
  extra: Record<string, unknown> = {},
): VoiceClientControl {
  return {
    type,
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId,
    generation,
    ...extra,
  } as VoiceClientControl
}

function frame(
  generation: number,
  sequence: number,
  sampleCount = 2,
): VoiceAudioFrame {
  return {
    direction: 'microphone',
    generation,
    sequence,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    samples: new Int16Array(sampleCount),
  }
}

function harness(
  engine = new FakeVoiceEngine(),
  overrides: Partial<VoiceBackendSessionLimits> = {},
) {
  const sent: VoiceBackendOutput[] = []
  const terminated: Array<{ code: number; reason: string }> = []
  const session = createVoiceBackendSession({
    streamId,
    engine,
    limits: { ...limits, ...overrides },
    send: async (output) => {
      sent.push(output)
    },
    terminate: (code, reason) => {
      terminated.push({ code, reason })
    },
  })
  return { engine, sent, session, terminated }
}

async function beginUtterance(
  session: ReturnType<typeof harness>['session'],
  generation = 2,
  utteranceId = `u${generation}`,
): Promise<void> {
  await session.control(control('start', generation, { language: 'en' }))
  await session.control(control('speech_confirmed', generation, { utteranceId }))
}

describe('VoiceBackendSession', () => {
  it('closes on a skipped sequence before passing that audio to the engine', async () => {
    const { engine, session, terminated } = harness()
    await beginUtterance(session)
    await session.audio(frame(2, 0))
    await vi.waitFor(() => {
      expect(engine.calls.filter((call) => call.type === 'stt.accept')).toHaveLength(1)
    })

    await expect(session.audio(frame(2, 2))).rejects.toMatchObject({
      closeCode: 1008,
    })
    expect(engine.calls.filter((call) => call.type === 'stt.accept')).toEqual([
      expect.objectContaining({ sequence: 0 }),
    ])
    expect(terminated).toEqual([
      expect.objectContaining({ code: 1008 }),
    ])
  })

  it('enforces the binary frame and 30-second utterance limits', async () => {
    const oversized = harness(new FakeVoiceEngine(), {
      maxFrameBytes: VOICE_AUDIO_HEADER_BYTES + 3,
    })
    await beginUtterance(oversized.session)
    await expect(oversized.session.audio(frame(2, 0, 2))).rejects.toMatchObject({
      closeCode: 1009,
    })
    expect(oversized.engine.calls.some((call) => call.type === 'stt.accept')).toBe(false)

    const tooLong = harness(new FakeVoiceEngine(), { maxUtteranceMs: 1 })
    await beginUtterance(tooLong.session)
    await expect(tooLong.session.audio(frame(2, 0, 17))).rejects.toMatchObject({
      closeCode: 1008,
    })
    expect(tooLong.engine.calls.some((call) => call.type === 'stt.accept')).toBe(false)
  })

  it('bounds queued microphone audio to two seconds without blocking enqueue on the worker', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    class BlockingEngine extends FakeVoiceEngine {
      override async accept(input: VoiceUtteranceAudioFrame): Promise<void> {
        await gate
        await super.accept(input)
      }
    }
    const { engine, session } = harness(new BlockingEngine(), { maxQueueBytes: 4 })
    await beginUtterance(session)

    await session.audio(frame(2, 0))
    await session.audio(frame(2, 1))
    await expect(session.audio(frame(2, 2))).rejects.toMatchObject({
      closeCode: 1013,
    })
    expect(engine.calls.some((call) => call.type === 'stt.accept')).toBe(false)

    release()
  })

  it('passes every queued frame to the engine before ending the utterance', async () => {
    let acceptStarted!: () => void
    let release!: () => void
    const started = new Promise<void>((resolve) => {
      acceptStarted = resolve
    })
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    class BlockingEngine extends FakeVoiceEngine {
      override async accept(input: VoiceUtteranceAudioFrame): Promise<void> {
        acceptStarted()
        await gate
        await super.accept(input)
      }
    }
    const { engine, session } = harness(new BlockingEngine())
    await beginUtterance(session)
    await session.audio(frame(2, 0))
    await started

    const ending = session.control(control('speech_end', 2, {
      utteranceId: 'u2',
    }))
    await Promise.resolve()
    expect(engine.calls.some((call) => call.type === 'stt.end')).toBe(false)

    release()
    await ending
    expect(engine.calls.filter((call) => (
      call.type === 'stt.accept' || call.type === 'stt.end'
    )).map((call) => call.type)).toEqual(['stt.accept', 'stt.end'])
  })

  it('echoes heartbeats and closes an idle active utterance explicitly', async () => {
    vi.useFakeTimers()
    try {
      const { engine, sent, session, terminated } = harness(new FakeVoiceEngine(), {
        idleTimeoutMs: 1_000,
      })
      await beginUtterance(session)
      await session.control(control('heartbeat', 2, { timestamp: 1234 }))
      await vi.waitFor(() => {
        expect(sent).toContainEqual({
          type: 'heartbeat',
          protocol: ORACLE_VOICE_PROTOCOL,
          streamId,
          generation: 2,
          timestamp: 1234,
        })
      })

      await vi.advanceTimersByTimeAsync(1_001)

      expect(terminated).toEqual([
        { code: 1001, reason: 'Oracle voice stream timed out' },
      ])
      expect(engine.calls).toContainEqual({
        type: 'cancel',
        streamId,
        generation: 2,
      })
      await expect(session.audio(frame(2, 0))).rejects.toBeInstanceOf(VoiceSessionError)
    } finally {
      vi.useRealTimers()
    }
  })

  it('preserves worker event order, native playback rate, and only one final', async () => {
    const { engine, sent, session } = harness()
    await beginUtterance(session)
    await session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'Hello.',
    }))
    engine.emit({
      type: 'partial',
      streamId,
      generation: 2,
      utteranceId: 'u2',
      text: 'Hel',
    })
    engine.emit({
      type: 'final',
      streamId,
      generation: 2,
      utteranceId: 'u2',
      text: 'Hello',
    })
    engine.emit({
      type: 'final',
      streamId,
      generation: 2,
      utteranceId: 'u2',
      text: 'Hello again',
    })
    engine.emit({
      type: 'audio',
      streamId,
      generation: 2,
      segmentId: 'segment-2',
      sequence: 0,
      sampleRate: 22_050,
      samples: Int16Array.of(-2, 2),
    })
    engine.emit({
      type: 'audio_end',
      streamId,
      generation: 2,
      segmentId: 'segment-2',
    })

    await vi.waitFor(() => {
      expect(sent.filter((entry) => 'type' in entry && entry.type === 'audio_end'))
        .toHaveLength(1)
    })
    expect(sent.filter((entry): entry is VoiceServerControl => !('direction' in entry))).toEqual([
      {
        type: 'state',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId,
        generation: 2,
        state: 'ready',
      },
      {
        type: 'state',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId,
        generation: 2,
        state: 'listening',
      },
      {
        type: 'state',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId,
        generation: 2,
        state: 'speaking',
      },
      {
        type: 'partial',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId,
        generation: 2,
        utteranceId: 'u2',
        text: 'Hel',
      },
      {
        type: 'final',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId,
        generation: 2,
        utteranceId: 'u2',
        text: 'Hello',
      },
      {
        type: 'audio_end',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId,
        generation: 2,
        segmentId: 'segment-2',
      },
    ])
    expect(sent.find((entry) => 'direction' in entry)).toEqual({
      direction: 'playback',
      generation: 2,
      sequence: 0,
      sampleRate: 22_050,
      samples: Int16Array.of(-2, 2),
    })
  })

  it('starts synthesis without blocking a later generation cancellation', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    class BlockingSynthesisEngine extends FakeVoiceEngine {
      override async synthesize(
        input: Parameters<FakeVoiceEngine['synthesize']>[0],
      ): Promise<void> {
        await gate
        await super.synthesize(input)
      }
    }
    const { engine, session } = harness(new BlockingSynthesisEngine())
    await session.control(control('start', 2, { language: 'en' }))
    let started = false
    void session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'This synthesis is still running.',
    })).then(() => {
      started = true
    })

    await vi.waitFor(() => expect(started).toBe(true), { timeout: 100 })
    await session.control(control('cancel', 2))

    expect(engine.calls).toContainEqual({
      type: 'cancel',
      streamId,
      generation: 2,
    })
    release()
  })

  it('drops stale worker events and cancels without closing the warm engine on socket close', async () => {
    const { engine, sent, session } = harness()
    await beginUtterance(session, 4, 'u4')
    engine.emit({
      type: 'partial',
      streamId: 'old-stream',
      generation: 4,
      utteranceId: 'u4',
      text: 'stale stream',
    })
    engine.emit({
      type: 'partial',
      streamId,
      generation: 3,
      utteranceId: 'u3',
      text: 'stale generation',
    })

    await session.close('socket closed')
    engine.emit({
      type: 'partial',
      streamId,
      generation: 4,
      utteranceId: 'u4',
      text: 'late',
    })

    expect(sent.some((entry) => 'text' in entry)).toBe(false)
    expect(engine.calls).toContainEqual({
      type: 'cancel',
      streamId,
      generation: 4,
    })
    expect(engine.calls.some((call) => call.type === 'close')).toBe(false)
  })

  it('turns worker fatal errors into one ordered fatal output and explicit close', async () => {
    const { engine, sent, session, terminated } = harness()
    await beginUtterance(session)

    engine.emit({ type: 'fatal_error', message: 'native recognizer failed' } as VoiceEngineEvent)

    await vi.waitFor(() => {
      expect(terminated).toEqual([
        { code: 1011, reason: 'native recognizer failed' },
      ])
    })
    expect(sent.at(-1)).toEqual({
      type: 'error',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId,
      generation: 2,
      code: 'voice_backend_failed',
      message: 'native recognizer failed',
      fatal: true,
    })
  })
})

describe('LocalVoiceBackend', () => {
  it('keeps one warm engine, rejects a concurrent stream, and releases it on close', async () => {
    const engine = new FakeVoiceEngine()
    const factory = new FakeVoiceEngineFactory(engine, {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    })
    const backend = new LocalVoiceBackend(factory, config, limits)
    const first = await backend.open({
      streamId: 'first',
      send: async () => undefined,
      terminate: () => undefined,
    })

    await expect(backend.open({
      streamId: 'second',
      send: async () => undefined,
      terminate: () => undefined,
    })).rejects.toMatchObject({ closeCode: 1013 })

    await first.close('done')
    const second = await backend.open({
      streamId: 'second',
      send: async () => undefined,
      terminate: () => undefined,
    })
    expect(factory.initializedWith).toEqual([config])
    expect(backend.capability()).toEqual({
      available: true,
      sampleRate: 16_000,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    })

    await second.close('done')
    await backend.stop()
    expect(engine.calls.at(-1)).toEqual({ type: 'close' })
  })

  it('advertises an initialization failure instead of a success-shaped capability', async () => {
    const factory = new FakeVoiceEngineFactory()
    vi.spyOn(factory, 'initialize').mockRejectedValue(new Error('native model failed'))
    vi.spyOn(factory, 'capability').mockReturnValue({
      available: false,
      reason: 'native model failed',
    })
    const backend = new LocalVoiceBackend(factory, config, limits)

    await expect(backend.open({
      streamId: 'failed',
      send: async () => undefined,
      terminate: () => undefined,
    })).rejects.toThrow('native model failed')
    expect(backend.capability()).toEqual({
      available: false,
      reason: 'native model failed',
    })
  })
})
