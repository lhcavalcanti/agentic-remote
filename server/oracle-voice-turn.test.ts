import { describe, expect, it } from 'vitest'
import {
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceAudioFrame,
} from '../shared/oracle-voice.js'
import { VoiceTurnState } from './oracle-voice-turn.js'

function frame(
  generation: number,
  sequence: number,
  sampleCount = 1,
): VoiceAudioFrame {
  return {
    direction: 'microphone',
    generation,
    sequence,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    samples: new Int16Array(sampleCount),
  }
}

describe('VoiceTurnState', () => {
  it('accepts monotonic frames and rejects duplicate, old, and skipped sequences', () => {
    const turn = new VoiceTurnState({ maxAudioSamples: 160_000 })
    turn.confirmSpeech(3, 'utterance-a')
    expect(turn.acceptFrame(frame(3, 0))).toEqual({ accepted: true })
    expect(turn.acceptFrame(frame(3, 0))).toEqual({ accepted: false, reason: 'duplicate' })
    expect(turn.acceptFrame(frame(2, 1))).toEqual({ accepted: false, reason: 'stale-generation' })
    expect(() => turn.acceptFrame(frame(3, 2))).toThrow('out of order')
  })

  it('deduplicates within one generation without retaining every stream turn', () => {
    const turn = new VoiceTurnState()
    expect(turn.rememberSubmission('utterance-a')).toBe(true)
    expect(turn.rememberSubmission('utterance-a')).toBe(false)
    turn.advanceGeneration(1)
    expect(turn.rememberSubmission('utterance-a')).toBe(true)
  })

  it('caps accepted utterance audio samples', () => {
    const turn = new VoiceTurnState({ maxAudioSamples: 3 })
    turn.confirmSpeech(8, 'utterance-a')
    expect(turn.acceptFrame(frame(8, 0, 2))).toEqual({ accepted: true })
    expect(() => turn.acceptFrame(frame(8, 1, 2))).toThrow('audio sample limit')
  })

  it('requires each generation advance to increase by exactly one', () => {
    const turn = new VoiceTurnState()
    turn.confirmSpeech(3, 'utterance-a')
    turn.advanceGeneration(4)
    expect(() => turn.advanceGeneration(6)).toThrow('generation must increase by one')
    expect(() => turn.confirmSpeech(3, 'utterance-stale')).toThrow('stale generation')
  })

  it('finalizes the confirmed utterance after an endpoint hint only once', () => {
    const turn = new VoiceTurnState()
    turn.confirmSpeech(12, 'utterance-a')
    turn.hintSpeechEnd(12, 'utterance-a')
    expect(turn.finalize(12, 'utterance-a', 'Hello')).toEqual({
      generation: 12,
      utteranceId: 'utterance-a',
      transcript: 'Hello',
    })
    expect(() => turn.finalize(12, 'utterance-a', 'Hello again'))
      .toThrow('already finalized')
  })

  it('allows the server endpoint to finalize without a client hint', () => {
    const turn = new VoiceTurnState()
    turn.confirmSpeech(13, 'utterance-b')
    expect(turn.finalize(13, 'utterance-b', 'Server endpoint')).toEqual({
      generation: 13,
      utteranceId: 'utterance-b',
      transcript: 'Server endpoint',
    })
    expect(turn.acceptFrame(frame(13, 0))).toEqual({
      accepted: false,
      reason: 'finalized',
    })
    expect(() => turn.hintSpeechEnd(13, 'utterance-b')).not.toThrow()
  })

  it('drops frames and endpoint hints from obsolete generations', () => {
    const turn = new VoiceTurnState()
    turn.confirmSpeech(20, 'utterance-a')
    turn.advanceGeneration(21)
    turn.hintSpeechEnd(20, 'utterance-a')
    expect(turn.acceptFrame(frame(20, 0))).toEqual({
      accepted: false,
      reason: 'stale-generation',
    })
    expect(() => turn.finalize(20, 'utterance-a', 'Old speech'))
      .toThrow('stale generation')
  })
})
