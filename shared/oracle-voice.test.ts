import { describe, expect, it } from 'vitest'
import {
  ORACLE_VOICE_PROTOCOL,
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
      sampleRate: 16_000,
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
      sequence: 0x0506_0708,
      sampleRate: 48_000,
      samples: new Int16Array([0x1234]),
    })
    const bytes = new Uint8Array(encoded)

    expect([...bytes]).toEqual([
      65, 82, 86, 67,
      ORACLE_VOICE_PROTOCOL, 1, 0, 0,
      4, 3, 2, 1,
      8, 7, 6, 5,
      128, 187, 0, 0,
      1, 0, 0, 0,
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
      sampleRate: 16_000,
      samples: new Int16Array([1, 2]),
    })
    new DataView(encoded).setUint32(20, 3, true)

    expect(() => decodeVoiceAudioFrame(encoded)).toThrow(VoiceProtocolError)
  })

  it('rejects unsupported rates and non-uint32 routing identity', () => {
    expect(() => encodeVoiceAudioFrame({
      direction: 'microphone',
      generation: -1,
      sequence: 0,
      sampleRate: 16_000,
      samples: new Int16Array(),
    })).toThrow(VoiceProtocolError)
    expect(() => encodeVoiceAudioFrame({
      direction: 'microphone',
      generation: 0,
      sequence: 0,
      sampleRate: 7_999,
      samples: new Int16Array(),
    })).toThrow(VoiceProtocolError)
  })
})

describe('Oracle voice control protocol', () => {
  it('accepts versioned client and server controls', () => {
    expect(isVoiceClientControl({
      type: 'speech_confirmed',
      protocol: 1,
      streamId: 'stream-1',
      generation: 3,
      utteranceId: 'utterance-3',
    })).toBe(true)
    expect(isVoiceServerControl({
      type: 'final',
      protocol: 1,
      streamId: 'stream-1',
      generation: 3,
      utteranceId: 'utterance-3',
      text: 'Hello',
    })).toBe(true)
  })

  it('rejects unknown versions, variants, and routing identity keys', () => {
    expect(isVoiceClientControl({
      type: 'start',
      protocol: 2,
      streamId: 'stream-1',
      generation: 0,
      language: 'en',
    })).toBe(false)
    expect(isVoiceClientControl({
      type: 'speech_confirmed',
      protocol: 1,
      streamId: 'stream-1',
      generation: 3,
      utteranceId: 'utterance-3',
      sequence: 4,
    })).toBe(false)
    expect(isVoiceServerControl({
      type: 'unknown',
      protocol: 1,
      streamId: 'stream-1',
    })).toBe(false)
  })
})
