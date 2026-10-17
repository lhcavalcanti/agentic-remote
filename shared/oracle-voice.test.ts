import { describe, expect, it } from 'vitest'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  VOICE_AUDIO_HEADER_BYTES,
  VoiceProtocolError,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  isVoiceClientControl,
  isVoiceServerControl,
} from './oracle-voice.js'

describe('Oracle voice audio protocol', () => {
  it('round-trips a generation-scoped PCM frame', () => {
    const pcm = new Int16Array([-32768, -1, 0, 32767])
    const encoded = encodeVoiceAudioFrame({
      direction: 'microphone',
      generation: 7,
      sequence: 11,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: pcm,
    })

    expect(encoded.byteLength).toBe(VOICE_AUDIO_HEADER_BYTES + pcm.byteLength)
    expect(decodeVoiceAudioFrame(encoded)).toEqual({
      direction: 'microphone',
      generation: 7,
      sequence: 11,
      sampleRate: 16_000,
      samples: pcm,
    })
  })

  it('writes the documented little-endian header', () => {
    const encoded = encodeVoiceAudioFrame({
      direction: 'playback',
      generation: 0x0102_0304,
      segmentId: 's1',
      sequence: 0x0506_0708,
      sampleRate: 22_050,
      samples: new Int16Array([0x1234]),
    })
    const bytes = new Uint8Array(encoded)

    expect([...bytes]).toEqual([
      65, 82, 86, 67,
      ORACLE_VOICE_PROTOCOL, 1, 2, 0,
      4, 3, 2, 1,
      8, 7, 6, 5,
      34, 86, 0, 0,
      1, 0, 0, 0,
      115, 49,
      52, 18,
    ])
  })

  it.each([
    new Uint8Array(12),
    new Uint8Array(24).fill(255),
  ])('rejects malformed binary input', (payload) => {
    expect(() => decodeVoiceAudioFrame(payload.buffer)).toThrow(VoiceProtocolError)
  })

  it('rejects a sample-count mismatch', () => {
    const encoded = encodeVoiceAudioFrame({
      direction: 'microphone',
      generation: 1,
      sequence: 2,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array([1, 2]),
    })
    new DataView(encoded).setUint32(20, 3, true)

    expect(() => decodeVoiceAudioFrame(encoded)).toThrow(VoiceProtocolError)
  })

  it('accepts bounded native playback rates but keeps microphone audio at 16 kHz', () => {
    expect(decodeVoiceAudioFrame(encodeVoiceAudioFrame({
      direction: 'playback',
      generation: 0,
      segmentId: 'segment-0',
      sequence: 0,
      sampleRate: 22_050,
      samples: Int16Array.of(1),
    }))).toMatchObject({
      direction: 'playback',
      segmentId: 'segment-0',
      sampleRate: 22_050,
    })
    expect(() => encodeVoiceAudioFrame({
      direction: 'microphone',
      generation: -1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(),
    })).toThrow(VoiceProtocolError)
    expect(() => encodeVoiceAudioFrame({
      direction: 'microphone',
      generation: 0,
      sequence: 0,
      sampleRate: 22_050 as typeof ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(),
    })).toThrow(VoiceProtocolError)
    expect(() => encodeVoiceAudioFrame({
      direction: 'playback',
      generation: 0,
      segmentId: 'segment-0',
      sequence: 0,
      sampleRate: 192_001,
      samples: new Int16Array(),
    })).toThrow(VoiceProtocolError)

    expect(() => encodeVoiceAudioFrame({
      direction: 'playback',
      generation: 0,
      sequence: 0,
      sampleRate: 22_050,
      samples: new Int16Array(),
    } as never)).toThrow(VoiceProtocolError)

    const encoded = encodeVoiceAudioFrame({
      direction: 'microphone',
      generation: 0,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(),
    })
    new DataView(encoded).setUint32(16, 22_050, true)
    expect(() => decodeVoiceAudioFrame(encoded)).toThrow(VoiceProtocolError)
  })
})

describe('Oracle voice control protocol', () => {
  const capabilities = {
    protocol: ORACLE_VOICE_PROTOCOL,
    available: true,
    computerId: 'computer-1',
    computerName: 'Computer',
    sampleRate: 16_000,
    playbackSampleRate: 22_050,
    languages: ['en'],
    sttProfile: 'quality',
    ttsVoice: 'voice',
    resourceClass: 'quality',
    limits: {
      maxFrameBytes: 64_000,
      maxQueueBytes: 256_000,
      maxUtteranceMs: 30_000,
    },
  }
  const clientControls = [
    {
      type: 'start',
      language: 'en',
      defaults: {
        computerId: 'hub',
        mode: 'autopilot',
        provider: 'copilot',
        model: 'gpt-6-sol',
        reasoningEffort: 'high',
        folders: { hub: '/home/me/src' },
      },
      answerOnly: true,
    },
    { type: 'speech_tentative' },
    { type: 'speech_confirmed', utteranceId: 'utterance-3' },
    { type: 'speech_end', utteranceId: 'utterance-3' },
    { type: 'stop' },
    { type: 'synthesize', segmentId: 'segment-3', text: 'Hello' },
    { type: 'cancel' },
    { type: 'heartbeat', timestamp: 123 },
  ]
  const serverControls = [
    { type: 'hello', capabilities },
    { type: 'partial', utteranceId: 'utterance-3', text: 'Hel' },
    { type: 'final', utteranceId: 'utterance-3', text: 'Hello' },
    { type: 'state', state: 'ready' },
    { type: 'audio_end', segmentId: 'segment-3' },
    { type: 'error', code: 'failed', message: 'Failed', fatal: false },
    { type: 'heartbeat', timestamp: 123 },
  ]

  it('requires stream and generation routing identities on every control variant', () => {
    for (const variant of clientControls) {
      const control = {
        ...variant,
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: 'stream-1',
        generation: 3,
      }
      expect(isVoiceClientControl(control), variant.type).toBe(true)
      expect(isVoiceClientControl({ ...control, streamId: undefined }), variant.type).toBe(false)
      expect(isVoiceClientControl({ ...control, generation: undefined }), variant.type).toBe(false)
    }

    for (const variant of serverControls) {
      const control = {
        ...variant,
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: 'stream-1',
        generation: 3,
      }
      expect(isVoiceServerControl(control), variant.type).toBe(true)
      expect(isVoiceServerControl({ ...control, streamId: undefined }), variant.type).toBe(false)
      expect(isVoiceServerControl({ ...control, generation: undefined }), variant.type).toBe(false)
    }
  })

  it('requires 16 kHz microphone capability and a bounded playback rate', () => {
    expect(isVoiceServerControl({
      type: 'hello',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
      generation: 3,
      capabilities: { ...capabilities, sampleRate: 48_000 },
    })).toBe(false)
    expect(isVoiceServerControl({
      type: 'hello',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
      generation: 3,
      capabilities: { ...capabilities, playbackSampleRate: 192_001 },
    })).toBe(false)
  })

  it('rejects unknown versions, variants, and routing identity keys', () => {
    expect(isVoiceClientControl({
      type: 'start',
      protocol: ORACLE_VOICE_PROTOCOL + 1,
      streamId: 'stream-1',
      generation: 0,
      language: 'en',
      defaults: {},
      answerOnly: false,
    })).toBe(false)
    expect(isVoiceClientControl({
      type: 'speech_confirmed',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
      generation: 3,
      utteranceId: 'utterance-3',
      sequence: 4,
    })).toBe(false)
    expect(isVoiceServerControl({
      type: 'unknown',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
    })).toBe(false)
  })

  it('validates the Oracle defaults and Ask or Delegate selection at stream start', () => {
    const start = {
      type: 'start',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
      generation: 0,
      language: 'en',
      defaults: {
        computerId: 'hub',
        mode: 'plan',
        provider: 'claude',
        model: 'claude-sonnet-5.5',
        reasoningEffort: 'xhigh',
        folders: { hub: '/home/me/src' },
      },
      answerOnly: false,
    }

    expect(isVoiceClientControl(start)).toBe(true)
    expect(isVoiceClientControl({ ...start, answerOnly: undefined })).toBe(false)
    expect(isVoiceClientControl({
      ...start,
      defaults: { ...start.defaults, mode: 'unsafe' },
    })).toBe(false)
    expect(isVoiceClientControl({
      ...start,
      defaults: { ...start.defaults, mode: ['plan'] },
    })).toBe(false)
    expect(isVoiceClientControl({
      ...start,
      defaults: { ...start.defaults, reasoningEffort: ['high'] },
    })).toBe(false)
    expect(isVoiceClientControl({
      ...start,
      defaults: { ...start.defaults, folders: { hub: '' } },
    })).toBe(false)
  })
})
