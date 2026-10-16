import { describe, expect, it } from 'vitest'
import { ORACLE_VOICE_SAMPLE_RATE } from '../shared/oracle-voice.js'
import {
  FakeVoiceEngine,
  FakeVoiceEngineFactory,
  type VoiceEngineEvent,
} from './oracle-voice-engine.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'

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
    model: '/models/voice.onnx',
    config: '/models/voice.json',
  },
}

describe('FakeVoiceEngine', () => {
  it('cancels generation-scoped STT and TTS without late callbacks', async () => {
    const engine = new FakeVoiceEngine()
    const seen: VoiceEngineEvent[] = []
    engine.onEvent((event) => seen.push(event))

    await engine.startUtterance({
      generation: 4,
      utteranceId: 'u4',
      language: 'en',
    })
    await engine.synthesize({
      generation: 4,
      segmentId: 's4',
      text: 'Hello.',
    })
    await engine.cancelGeneration(4)
    engine.emitLateEventsForTest(4)

    expect(seen).toEqual([])
    expect(engine.calls).toEqual([
      { type: 'stt.start', generation: 4, utteranceId: 'u4', language: 'en' },
      { type: 'tts.synthesize', generation: 4, segmentId: 's4', text: 'Hello.' },
      { type: 'cancel', generation: 4 },
    ])
  })

  it('delays events deterministically and preserves their order', () => {
    const engine = new FakeVoiceEngine()
    const seen: VoiceEngineEvent[] = []
    engine.onEvent((event) => seen.push(event))
    engine.queueEvent({
      type: 'partial',
      generation: 2,
      utteranceId: 'u2',
      text: 'Hel',
    })
    engine.queueEvent({
      type: 'final',
      generation: 2,
      utteranceId: 'u2',
      text: 'Hello',
    })

    expect(seen).toEqual([])
    engine.flushEvents()

    expect(seen).toEqual([
      { type: 'partial', generation: 2, utteranceId: 'u2', text: 'Hel' },
      { type: 'final', generation: 2, utteranceId: 'u2', text: 'Hello' },
    ])
  })

  it('records audio and lifecycle operations through the narrow contracts', async () => {
    const engine = new FakeVoiceEngine()
    await engine.stt.accept({
      direction: 'microphone',
      generation: 3,
      sequence: 7,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: Int16Array.of(-1, 2),
    })
    await engine.stt.end({ generation: 3, utteranceId: 'u3' })
    await engine.close()

    expect(engine.calls).toEqual([
      { type: 'stt.accept', generation: 3, sequence: 7, sampleCount: 2 },
      { type: 'stt.end', generation: 3, utteranceId: 'u3' },
      { type: 'close' },
    ])
    await expect(engine.synthesize({
      generation: 3,
      segmentId: 'late',
      text: 'Late',
    })).rejects.toThrow('closed')
  })
})

describe('FakeVoiceEngineFactory', () => {
  it('exposes a deterministic capability and returns its reusable fake session', async () => {
    const engine = new FakeVoiceEngine()
    const factory = new FakeVoiceEngineFactory(engine, {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    })

    expect(await factory.initialize(config)).toBe(engine)
    expect(factory.initializedWith).toEqual([config])
    expect(factory.capability()).toEqual({
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    })

    await factory.stop()
    expect(engine.calls.at(-1)).toEqual({ type: 'close' })
  })
})
