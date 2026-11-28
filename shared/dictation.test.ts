import { describe, expect, it } from 'vitest'
import {
  DictationProtocolError,
  encodeDictationAudioFrame,
  parseDictationClientMessage,
  parseDictationServerMessage,
  readDictationAudioFrame,
} from './dictation.js'
import { encodeVoiceAudioFrame } from './oracle-voice.js'

describe('dictation client messages', () => {
  it.each([
    { protocol: 1, type: 'start', streamId: 'Abc_123-xyz' },
    { protocol: 1, type: 'stop' },
    { protocol: 1, type: 'cancel' },
    { protocol: 1, type: 'heartbeat' },
  ])('round-trips $type', (message) => {
    expect(parseDictationClientMessage(JSON.stringify(message))).toEqual(message)
  })

  it.each([
    ['invalid JSON', '{"protocol":1,'],
    ['an array', '[]'],
    ['null', 'null'],
    ['an unknown type', '{"protocol":1,"type":"synthesize"}'],
    ['another protocol', '{"protocol":2,"type":"stop"}'],
    ['a missing protocol', '{"type":"stop"}'],
    ['an extra field', '{"protocol":1,"type":"stop","text":"hello"}'],
    ['a start without a stream ID', '{"protocol":1,"type":"start"}'],
    ['an empty stream ID', '{"protocol":1,"type":"start","streamId":""}'],
    ['a 65-character stream ID', JSON.stringify({ protocol: 1, type: 'start', streamId: 'a'.repeat(65) })],
    ['a stream ID with a space', '{"protocol":1,"type":"start","streamId":"a b"}'],
    ['a stream ID with a path', '{"protocol":1,"type":"start","streamId":"../x"}'],
    ['a numeric stream ID', '{"protocol":1,"type":"start","streamId":7}'],
  ])('rejects %s', (_label, raw) => {
    expect(() => parseDictationClientMessage(raw)).toThrow(DictationProtocolError)
  })

  it('accepts a 64-character stream ID', () => {
    const streamId = 'a'.repeat(64)
    expect(parseDictationClientMessage(JSON.stringify({ protocol: 1, type: 'start', streamId })))
      .toEqual({ protocol: 1, type: 'start', streamId })
  })

  it('rejects a message over 4 KiB even when its shape is valid', () => {
    const padded = `${JSON.stringify({ protocol: 1, type: 'stop' })}${' '.repeat(4097)}`
    expect(() => parseDictationClientMessage(padded)).toThrow(/too large/)
  })
})

describe('dictation server messages', () => {
  it.each([
    { protocol: 1, type: 'ready' },
    { protocol: 1, type: 'text', seq: 0, committedAppend: '', tentative: 'olá' },
    { protocol: 1, type: 'text', seq: 12, committedAppend: ' Aquilo não', tentative: '' },
    { protocol: 1, type: 'final', text: 'Aquilo não é bom.' },
    { protocol: 1, type: 'final', text: '', reason: 'stop' },
    { protocol: 1, type: 'final', text: 'long', reason: 'duration_limit' },
    { protocol: 1, type: 'error', code: 'busy', message: 'In use', fatal: true },
    { protocol: 1, type: 'error', code: 'engine_failed', message: '', fatal: false },
    { protocol: 1, type: 'heartbeat' },
  ])('round-trips $type', (message) => {
    expect(parseDictationServerMessage(JSON.stringify(message))).toEqual(message)
  })

  it.each([
    ['invalid JSON', 'nope'],
    ['an unknown type', '{"protocol":1,"type":"partial","text":"x"}'],
    ['another protocol', '{"protocol":2,"type":"ready"}'],
    ['a negative sequence', '{"protocol":1,"type":"text","seq":-1,"committedAppend":"","tentative":""}'],
    ['a fractional sequence', '{"protocol":1,"type":"text","seq":1.5,"committedAppend":"","tentative":""}'],
    ['a missing tentative text', '{"protocol":1,"type":"text","seq":1,"committedAppend":""}'],
    ['a numeric final text', '{"protocol":1,"type":"final","text":5}'],
    ['an unknown final reason', '{"protocol":1,"type":"final","text":"","reason":"crash"}'],
    ['an unknown error code', '{"protocol":1,"type":"error","code":"teapot","message":"","fatal":true}'],
    ['a non-boolean fatal flag', '{"protocol":1,"type":"error","code":"busy","message":"","fatal":"yes"}'],
    ['an extra field', '{"protocol":1,"type":"ready","computer":"x"}'],
  ])('rejects %s', (_label, raw) => {
    expect(() => parseDictationServerMessage(raw)).toThrow(DictationProtocolError)
  })

  it('bounds each text field at 64 KiB of UTF-8', () => {
    const fits = 'a'.repeat(65_536)
    expect(parseDictationServerMessage(JSON.stringify({ protocol: 1, type: 'final', text: fits })))
      .toEqual({ protocol: 1, type: 'final', text: fits })
    // 32,769 two-byte characters are 65,538 bytes.
    const over = 'é'.repeat(32_769)
    expect(() => parseDictationServerMessage(JSON.stringify({ protocol: 1, type: 'final', text: over })))
      .toThrow(DictationProtocolError)
    expect(() => parseDictationServerMessage(JSON.stringify({
      protocol: 1, type: 'text', seq: 1, committedAppend: '', tentative: `${fits}a`,
    }))).toThrow(DictationProtocolError)
  })
})

describe('dictation audio frames', () => {
  it('round-trips a microphone frame through the voice codec', () => {
    const samples = new Int16Array([-32768, -1, 0, 1, 32767])
    expect(readDictationAudioFrame(encodeDictationAudioFrame(1, samples), 1)).toEqual(samples)
  })

  it.each([
    ['a sequence gap', 3],
    ['a sequence regression', 1],
  ])('rejects %s as a protocol error', (_label, sequence) => {
    const frame = encodeDictationAudioFrame(sequence, new Int16Array(4))
    expect(() => readDictationAudioFrame(frame, 2)).toThrow(
      expect.objectContaining({ code: 'protocol' }),
    )
  })

  it('rejects a frame from another generation', () => {
    const frame = encodeVoiceAudioFrame({
      direction: 'microphone', generation: 2, sequence: 1, sampleRate: 16_000, samples: new Int16Array(4),
    })
    expect(() => readDictationAudioFrame(frame, 1)).toThrow(expect.objectContaining({ code: 'protocol' }))
  })

  it('rejects playback audio', () => {
    const frame = encodeVoiceAudioFrame({
      direction: 'playback', generation: 1, sequence: 1, segmentId: 's', sampleRate: 16_000, samples: new Int16Array(4),
    })
    expect(() => readDictationAudioFrame(frame, 1)).toThrow(expect.objectContaining({ code: 'protocol' }))
  })

  it('rejects bytes that are not a voice frame', () => {
    expect(() => readDictationAudioFrame(new Uint8Array([1, 2, 3]).buffer, 1))
      .toThrow(expect.objectContaining({ code: 'protocol' }))
  })

  it('rejects a frame over 32 KiB before decoding it', () => {
    // 16,377 samples make 32,754 bytes of PCM plus the 24-byte header: 32,778 bytes.
    const frame = encodeDictationAudioFrame(1, new Int16Array(16_377))
    expect(frame.byteLength).toBe(32_778)
    expect(() => readDictationAudioFrame(frame, 1)).toThrow(expect.objectContaining({ code: 'frame_too_large' }))
    const fits = encodeDictationAudioFrame(1, new Int16Array(16_372))
    expect(fits.byteLength).toBe(32_768)
    expect(readDictationAudioFrame(fits, 1)).toHaveLength(16_372)
  })
})
