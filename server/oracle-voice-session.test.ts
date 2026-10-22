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
  DEFAULT_VOICE_BACKEND_LIMITS,
  LocalVoiceBackend,
  VoiceSessionError,
  createVoiceBackendSession,
  type VoiceBackendOutput,
  type VoiceBackendSessionOpenOptions,
  type VoiceBackendSessionLimits,
  voiceOutputDeliveryByteLimit,
} from './oracle-voice-session.js'

const streamId = 'voice-stream'
const limits: VoiceBackendSessionLimits = {
  maxFrameBytes: 4096,
  maxQueueBytes: ORACLE_VOICE_SAMPLE_RATE * 2 * 2,
  maxOutputQueueBytes: 128 * 1024,
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

function measuredPlaybackEvents(
  sampleCount: number,
  sampleRate = 22_050,
  generation = 2,
  segmentId = 'segment-2',
): Array<
  | Extract<VoiceEngineEvent, { type: 'audio' }>
  | Extract<VoiceEngineEvent, { type: 'audio_end' }>
> {
  const maxSamples = Math.floor(
    (32 * 1024 - VOICE_AUDIO_HEADER_BYTES - Buffer.byteLength(segmentId))
      / Int16Array.BYTES_PER_ELEMENT,
  )
  const events: Array<
    | Extract<VoiceEngineEvent, { type: 'audio' }>
    | Extract<VoiceEngineEvent, { type: 'audio_end' }>
  > = []
  let emitted = 0
  let sequence = 0
  while (emitted < sampleCount) {
    const count = Math.min(maxSamples, sampleCount - emitted)
    events.push({
      type: 'audio',
      streamId,
      generation,
      segmentId,
      sequence,
      sampleRate,
      samples: Int16Array.from(
        { length: count },
        (_, index) => (emitted + index) % 32_767,
      ),
    })
    emitted += count
    sequence += 1
  }
  events.push({
    type: 'audio_end',
    streamId,
    generation,
    segmentId,
  })
  return events
}

function harness(
  engine = new FakeVoiceEngine(),
  overrides: Partial<VoiceBackendSessionLimits> = {},
  sendOutput?: (output: VoiceBackendOutput) => Promise<void>,
) {
  const sent: VoiceBackendOutput[] = []
  const terminated: Array<{ code: number; reason: string }> = []
  const disconnects: unknown[] = []
  const session = createVoiceBackendSession({
    streamId,
    engine,
    limits: { ...limits, ...overrides },
    send: async (output) => {
      sent.push(output)
      await sendOutput?.(output)
    },
    terminate: ((failureOrCode: unknown, reason?: string) => {
      disconnects.push(failureOrCode)
      if (typeof failureOrCode === 'number') {
        terminated.push({ code: failureOrCode, reason: reason ?? '' })
        return
      }
      const failure = failureOrCode as { code: number; reason: string }
      terminated.push({ code: failure.code, reason: failure.reason })
    }) as VoiceBackendSessionOpenOptions['terminate'],
  })
  return { disconnects, engine, sent, session, terminated }
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
  it('sizes internal playback delivery independently from the 64KB transport queue', () => {
    expect(voiceOutputDeliveryByteLimit(22_050, 32 * 1024)).toBe(589_824)
    expect(DEFAULT_VOICE_BACKEND_LIMITS).toMatchObject({
      maxQueueBytes: 64_000,
      maxOutputQueueBytes: 4_685_824,
    })
  })

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

  it('ignores trailing audio and speech_end after an early engine final', async () => {
    const { engine, sent, session, terminated } = harness()
    await beginUtterance(session)
    engine.emit({
      type: 'final',
      streamId,
      generation: 2,
      utteranceId: 'u2',
      text: 'Early endpoint',
    })
    await vi.waitFor(() => expect(sent).toContainEqual(expect.objectContaining({
      type: 'final',
      text: 'Early endpoint',
    })))

    await expect(session.audio(frame(2, 0))).resolves.toBeUndefined()
    await expect(session.control(control('speech_end', 2, {
      utteranceId: 'u2',
    }))).resolves.toBeUndefined()
    await expect(session.control(control('speech_confirmed', 3, {
      utteranceId: 'u3',
    }))).resolves.toBeUndefined()

    expect(terminated).toEqual([])
    expect(engine.calls.filter((call) => call.type === 'stt.accept')).toEqual([])
    expect(engine.calls.filter((call) => call.type === 'stt.end')).toEqual([])
  })

  it('measures queued plus in-flight microphone audio and rejects excess backlog', async () => {
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
    const engine = new BlockingEngine()
    const queueSnapshots: Array<{
      queuedInputBytes: number
      pendingInputBytes: number
      queuedOutputBytes: number
    }> = []
    const session = createVoiceBackendSession({
      streamId,
      engine,
      limits: { ...limits, maxQueueBytes: 512 },
      send: async () => undefined,
      terminate: () => undefined,
      observeQueue: (snapshot) => queueSnapshots.push(snapshot),
    })
    await beginUtterance(session)

    await session.audio(frame(2, 0, 128))
    await session.audio(frame(2, 1, 128))
    await expect(session.audio(frame(2, 2, 128))).rejects.toMatchObject({
      closeCode: 1013,
    })
    expect(engine.calls.some((call) => call.type === 'stt.accept')).toBe(false)
    expect(Math.max(...queueSnapshots.map((snapshot) =>
      snapshot.queuedInputBytes + snapshot.pendingInputBytes))).toBe(512)

    release()
  })

  it('reserves microphone backlog before a preceding control finishes', async () => {
    let startEntered!: () => void
    let releaseStart!: () => void
    const entered = new Promise<void>((resolve) => {
      startEntered = resolve
    })
    const gate = new Promise<void>((resolve) => {
      releaseStart = resolve
    })
    class BlockingStartEngine extends FakeVoiceEngine {
      override async start(input: Parameters<FakeVoiceEngine['start']>[0]): Promise<void> {
        startEntered()
        await gate
        await super.start(input)
      }
    }
    const queueSnapshots: Array<{
      queuedInputBytes: number
      pendingInputBytes: number
      queuedOutputBytes: number
    }> = []
    const session = createVoiceBackendSession({
      streamId,
      engine: new BlockingStartEngine(),
      limits: { ...limits, maxQueueBytes: 512 },
      send: async () => undefined,
      terminate: () => undefined,
      observeQueue: (snapshot) => queueSnapshots.push(snapshot),
    })
    await session.control(control('start', 1, { language: 'en' }))
    const confirming = session.control(control('speech_confirmed', 2, {
      utteranceId: 'u2',
    }))
    await entered
    const audio = [
      session.audio(frame(2, 0, 128)),
      session.audio(frame(2, 1, 128)),
      session.audio(frame(2, 2, 128)),
    ]

    try {
      const overflow = await Promise.race([
        audio[2].then(
          () => 'resolved',
          (error: unknown) => error instanceof VoiceSessionError
            && error.closeCode === 1013
            ? 'rejected'
            : 'wrong-error',
        ),
        new Promise<'pending'>((resolve) => {
          setTimeout(() => resolve('pending'), 50)
        }),
      ])

      expect(overflow).toBe('rejected')
      expect(Math.max(...queueSnapshots.map((snapshot) =>
        snapshot.queuedInputBytes + snapshot.pendingInputBytes))).toBe(512)
    } finally {
      releaseStart()
      await confirming.catch(() => undefined)
      await Promise.allSettled(audio)
      await session.close('test complete')
    }
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

  it('does not overwrite a synchronous final with a recognizing state', async () => {
    class FinalizingEngine extends FakeVoiceEngine {
      override async end(input: Parameters<FakeVoiceEngine['end']>[0]): Promise<void> {
        this.emit({
          type: 'final',
          ...input,
          text: 'Final transcript',
        })
        await super.end(input)
      }
    }
    const { sent, session } = harness(new FinalizingEngine())
    await beginUtterance(session)

    await session.control(control('speech_end', 2, {
      utteranceId: 'u2',
    }))

    expect(sent).toContainEqual(expect.objectContaining({
      type: 'final',
      text: 'Final transcript',
    }))
    expect(sent).not.toContainEqual(expect.objectContaining({
      type: 'state',
      state: 'recognizing',
    }))
  })

  it('starts a new utterance without waiting for old native synthesis to cancel', async () => {
    let releaseCancellation!: () => void
    const cancellationGate = new Promise<void>((resolve) => {
      releaseCancellation = resolve
    })
    class SlowCancellationEngine extends FakeVoiceEngine {
      override async cancelGeneration(
        input: Parameters<FakeVoiceEngine['cancelGeneration']>[0],
      ): Promise<void> {
        await super.cancelGeneration(input)
        await cancellationGate
      }
    }
    const { engine, session } = harness(new SlowCancellationEngine())
    await beginUtterance(session)
    await session.control(control('synthesize', 2, {
      segmentId: 'slow-segment',
      text: 'A deliberately slow native segment.',
    }))

    const cancelling = session.control(control('cancel', 2))
    const confirming = session.control(control('speech_confirmed', 3, {
      utteranceId: 'u3',
    }))
    await vi.waitFor(() => {
      expect(engine.calls).toContainEqual(expect.objectContaining({
        type: 'stt.start',
        generation: 3,
        utteranceId: 'u3',
      }))
    })
    await expect(cancelling).resolves.toBeUndefined()
    await expect(confirming).resolves.toBeUndefined()

    releaseCancellation()
    await session.close('test complete')
  })

  it('does not end an utterance finalized while queued audio drains', async () => {
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
        this.emit({
          type: 'final',
          streamId,
          generation: 2,
          utteranceId: 'u2',
          text: 'Completed during drain',
        })
        await super.accept(input)
      }
    }
    const { engine, sent, session, terminated } = harness(new BlockingEngine())
    await beginUtterance(session)
    await session.audio(frame(2, 0))
    await started

    const ending = session.control(control('speech_end', 2, {
      utteranceId: 'u2',
    }))
    release()
    await expect(ending).resolves.toBeUndefined()

    await vi.waitFor(() => {
      expect(sent).toContainEqual(expect.objectContaining({
        type: 'final',
        text: 'Completed during drain',
      }))
    })
    expect(engine.calls.some((call) => call.type === 'stt.end')).toBe(false)
    expect(terminated).toEqual([])
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
      segmentId: 'segment-2',
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

  it('reports one failed synthesis segment without closing the conversation', async () => {
    class RejectOnceEngine extends FakeVoiceEngine {
      private attempts = 0

      override async synthesize(
        input: Parameters<FakeVoiceEngine['synthesize']>[0],
      ): Promise<void> {
        this.attempts += 1
        if (this.attempts === 1) throw new Error('segment is too long')
        await super.synthesize(input)
      }
    }
    const { engine, sent, session, terminated } = harness(new RejectOnceEngine())
    await session.control(control('start', 2, { language: 'en' }))
    await session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'This segment fails.',
    }))

    await vi.waitFor(() => {
      expect(sent).toContainEqual(expect.objectContaining({
        type: 'error',
        code: 'tts_failed',
        fatal: false,
      }))
      expect(sent).toContainEqual(expect.objectContaining({
        type: 'audio_end',
        segmentId: 'segment-2',
      }))
    })
    expect(terminated).toEqual([])

    await expect(session.control(control('synthesize', 2, {
      segmentId: 'segment-3',
      text: 'The next segment still runs.',
    }))).resolves.toBeUndefined()
    expect(engine.calls).toContainEqual(expect.objectContaining({
      type: 'tts.synthesize',
      segmentId: 'segment-3',
    }))
  })

  it('clears stale synthesis identity when speech confirmation advances the generation', async () => {
    const { engine, session } = harness()
    await session.control(control('start', 1, { language: 'en' }))
    await session.control(control('synthesize', 1, {
      segmentId: 'segment-1',
      text: 'Old response.',
    }))

    await session.control(control('speech_confirmed', 2, {
      utteranceId: 'u2',
    }))
    await expect(session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'New response.',
    }))).resolves.toBeUndefined()

    engine.emit({
      type: 'audio_end',
      streamId,
      generation: 1,
      segmentId: 'segment-1',
    })
    expect(engine.calls).toContainEqual({
      type: 'tts.synthesize',
      streamId,
      generation: 2,
      segmentId: 'segment-2',
      text: 'New response.',
    })
  })

  it('fails closed when the engine emits a playback frame above the advertised limit', async () => {
    const { engine, sent, session, terminated } = harness(new FakeVoiceEngine(), {
      maxFrameBytes: VOICE_AUDIO_HEADER_BYTES + 3,
    })
    await session.control(control('start', 2, { language: 'en' }))
    await session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'Hello.',
    }))

    engine.emit({
      type: 'audio',
      streamId,
      generation: 2,
      segmentId: 'segment-2',
      sequence: 0,
      sampleRate: 22_050,
      samples: Int16Array.of(-2, 2),
    })

    await vi.waitFor(() => {
      expect(terminated).toEqual([
        { code: 1009, reason: 'Voice playback frame is too large' },
      ])
    })
    expect(sent.some((entry) => 'direction' in entry)).toBe(false)
  })

  it('bounds queued control and playback output before enqueueing behind a slow consumer', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let blockOutput = false
    const partial = {
      type: 'partial',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId,
      generation: 2,
      utteranceId: 'u2',
      text: 'x'.repeat(300),
    } satisfies VoiceServerControl
    const playbackBytes = VOICE_AUDIO_HEADER_BYTES
      + 9
      + Int16Array.BYTES_PER_ELEMENT * 64
    const maxQueueBytes = Buffer.byteLength(JSON.stringify(partial)) + playbackBytes - 1
    const { engine, sent, session, terminated } = harness(
      new FakeVoiceEngine(),
      {
        maxQueueBytes: 1_000_000,
        maxOutputQueueBytes: maxQueueBytes,
      },
      async () => {
        if (blockOutput) await gate
      },
    )
    await beginUtterance(session)
    await session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'Hello.',
    }))
    blockOutput = true

    engine.emit({
      type: 'partial',
      streamId,
      generation: 2,
      utteranceId: 'u2',
      text: partial.text,
    })
    await vi.waitFor(() => {
      expect(sent).toContainEqual(partial)
    })
    engine.emit({
      type: 'audio',
      streamId,
      generation: 2,
      segmentId: 'segment-2',
      sequence: 0,
      sampleRate: 22_050,
      samples: new Int16Array(64),
    })

    await vi.waitFor(() => {
      expect(terminated).toEqual([
        { code: 1013, reason: 'Voice output queue is full' },
      ])
    })
    expect(sent.some((entry) => 'direction' in entry)).toBe(false)
    release()
  })

  it.each([
    ['LJSpeech', 176_469],
    ['Faber', 148_224],
  ])('delivers the full measured %s multi-frame sequence behind a blocked first frame', async (
    _voice,
    sampleCount,
  ) => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let blockPlayback = false
    const delivered: VoiceBackendOutput[] = []
    const { engine, session, terminated } = harness(
      new FakeVoiceEngine(),
      {
        maxFrameBytes: 32 * 1024,
        maxQueueBytes: 64 * 1024,
        maxOutputQueueBytes: voiceOutputDeliveryByteLimit(22_050, 32 * 1024),
      },
      async (output) => {
        if (blockPlayback && 'direction' in output) await gate
        delivered.push(output)
      },
    )
    await session.control(control('start', 2, { language: 'en' }))
    await session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'Measured resident VITS sentence.',
    }))
    blockPlayback = true
    const events = measuredPlaybackEvents(sampleCount)

    for (const event of events) engine.emit(event)
    await new Promise((resolve) => setImmediate(resolve))

    expect(terminated).toEqual([])
    release()
    await vi.waitFor(() => {
      expect(delivered.at(-1)).toMatchObject({ type: 'audio_end' })
    })
    expect(terminated).toEqual([])
    expect(delivered.filter((output) =>
      'direction' in output || ('type' in output && output.type === 'audio_end'),
    )).toEqual(events.map((event) => event.type === 'audio'
      ? {
          direction: 'playback',
          generation: event.generation,
          segmentId: event.segmentId,
          sequence: event.sequence,
          sampleRate: event.sampleRate,
          samples: event.samples,
        }
      : {
          type: 'audio_end',
          protocol: ORACLE_VOICE_PROTOCOL,
          streamId,
          generation: event.generation,
          segmentId: event.segmentId,
        }))
  })

  it('fails closed when blocked playback exceeds the 12-second delivery allocation', async () => {
    const gate = new Promise<void>(() => undefined)
    const { engine, session, terminated } = harness(
      new FakeVoiceEngine(),
      {
        maxFrameBytes: 32 * 1024,
        maxQueueBytes: 64 * 1024,
        maxOutputQueueBytes: voiceOutputDeliveryByteLimit(22_050, 32 * 1024),
      },
      async (output) => {
        if ('direction' in output) await gate
      },
    )
    await session.control(control('start', 2, { language: 'en' }))
    await session.control(control('synthesize', 2, {
      segmentId: 'segment-2',
      text: 'Exceed the bounded playback allocation.',
    }))

    for (const event of measuredPlaybackEvents(22_050 * 15)) {
      engine.emit(event)
      if (terminated.length > 0) break
    }

    await vi.waitFor(() => {
      expect(terminated).toEqual([
        { code: 1013, reason: 'Voice output queue is full' },
      ])
    })
  })

  it('closes the transport after stop cleanup without cleaning up twice', async () => {
    const order: string[] = []
    class OrderedEngine extends FakeVoiceEngine {
      override async cancelGeneration(
        input: Parameters<FakeVoiceEngine['cancelGeneration']>[0],
      ): Promise<void> {
        await super.cancelGeneration(input)
        order.push('cancel')
      }
    }
    const engine = new OrderedEngine()
    const session = createVoiceBackendSession({
      streamId,
      engine,
      limits,
      send: async () => undefined,
      terminate: (failure) => {
        order.push(`transport:${failure.code}:${failure.reason}`)
      },
    })
    await session.control(control('start', 2, { language: 'en' }))

    await session.control(control('stop', 2, { reason: 'User stopped' }))
    await session.close('socket close after stop')

    expect(order).toEqual([
      'cancel',
      'transport:1000:User stopped',
    ])
    expect(engine.calls.filter((call) => call.type === 'cancel')).toHaveLength(1)
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
    const { disconnects, engine, sent, session, terminated } = harness()
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
    expect(disconnects).toEqual([{
      code: 1011,
      reason: 'native recognizer failed',
      retryable: false,
      cause: 'worker',
    }])
  })

  it('classifies an asynchronous STT worker rejection as terminal internal failure', async () => {
    class RejectingEngine extends FakeVoiceEngine {
      override async accept(_frame: VoiceUtteranceAudioFrame): Promise<void> {
        throw new Error('stt accept rejected')
      }
    }
    const { disconnects, session } = harness(new RejectingEngine())
    await beginUtterance(session)

    await session.audio(frame(2, 0))

    await vi.waitFor(() => {
      expect(disconnects).toEqual([{
        code: 1011,
        reason: 'stt accept rejected',
        retryable: false,
        cause: 'internal',
      }])
    })
  })

  it('classifies an invalid worker playback sample rate as terminal internal failure', async () => {
    const { disconnects, engine, session } = harness()
    await session.control(control('start', 2, { language: 'en' }))
    await session.control(control('synthesize', 2, {
      segmentId: 'segment-invalid-rate',
      text: 'Invalid sample rate',
    }))

    engine.emit({
      type: 'audio',
      streamId,
      generation: 2,
      segmentId: 'segment-invalid-rate',
      sequence: 0,
      sampleRate: 0,
      samples: Int16Array.of(1, -1),
    })

    await vi.waitFor(() => {
      expect(disconnects).toEqual([{
        code: 1011,
        reason: 'Voice engine emitted an invalid sample rate',
        retryable: false,
        cause: 'internal',
      }])
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
