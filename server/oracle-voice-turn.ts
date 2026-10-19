import type { VoiceAudioFrame } from '../shared/oracle-voice.js'

export type VoiceTurnPhase =
  | 'idle'
  | 'tentative'
  | 'listening'
  | 'endpoint-pending'
  | 'finalized'
  | 'cancelled'

export interface VoiceFinalTranscript {
  generation: number
  utteranceId: string
  transcript: string
}

export interface VoiceFrameAcceptance {
  accepted: boolean
  reason?: 'duplicate' | 'stale-generation' | 'finalized'
}

interface VoiceTurnStateOptions {
  maxAudioSamples?: number
}

export class VoiceTurnState {
  private readonly maxAudioSamples: number
  private readonly submittedUtteranceIds = new Set<string>()
  private generation: number | undefined
  private utteranceId: string | undefined
  private phase: VoiceTurnPhase = 'idle'
  private nextSequence = 0
  private audioSamples = 0

  constructor(options: VoiceTurnStateOptions = {}) {
    const maxAudioSamples = options.maxAudioSamples ?? 160_000
    if (!Number.isSafeInteger(maxAudioSamples) || maxAudioSamples <= 0) {
      throw new Error('maxAudioSamples must be a positive integer')
    }
    this.maxAudioSamples = maxAudioSamples
  }

  confirmSpeech(generation: number, utteranceId: string): void {
    this.validateGeneration(generation)
    if (utteranceId.length === 0) {
      throw new Error('utterance ID must not be empty')
    }
    if (this.generation === undefined) {
      this.generation = generation
    } else if (generation < this.generation) {
      throw new Error('stale generation')
    } else if (generation > this.generation) {
      throw new Error('generation must advance before confirming speech')
    }
    if (this.phase === 'listening' || this.phase === 'endpoint-pending') {
      throw new Error('speech is already confirmed')
    }
    if (this.phase === 'finalized') {
      throw new Error('generation is already finalized')
    }

    this.utteranceId = utteranceId
    this.phase = 'listening'
    this.nextSequence = 0
    this.audioSamples = 0
  }

  acceptFrame(frame: VoiceAudioFrame): VoiceFrameAcceptance {
    if (this.generation === undefined || frame.generation > this.generation) {
      throw new Error('audio frame generation is out of order')
    }
    if (frame.generation < this.generation) {
      return { accepted: false, reason: 'stale-generation' }
    }
    if (this.phase === 'finalized') {
      return { accepted: false, reason: 'finalized' }
    }
    if (this.phase !== 'listening' && this.phase !== 'endpoint-pending') {
      throw new Error('speech is not confirmed')
    }
    if (frame.sequence < this.nextSequence) {
      return { accepted: false, reason: 'duplicate' }
    }
    if (frame.sequence > this.nextSequence) {
      throw new Error('audio frame sequence is out of order')
    }
    if (this.audioSamples + frame.samples.length > this.maxAudioSamples) {
      throw new Error('audio sample limit exceeded')
    }

    this.audioSamples += frame.samples.length
    this.nextSequence += 1
    return { accepted: true }
  }

  hintSpeechEnd(generation: number, utteranceId: string): void {
    this.validateGeneration(generation)
    if (this.generation === undefined || generation > this.generation) {
      throw new Error('speech end generation is out of order')
    }
    if (generation < this.generation) return
    if (utteranceId !== this.utteranceId) {
      throw new Error('speech end does not match the active utterance')
    }
    if (this.phase === 'finalized') return
    if (this.phase === 'listening') {
      this.phase = 'endpoint-pending'
    }
  }

  isActiveUtterance(generation: number, utteranceId: string): boolean {
    return generation === this.generation
      && utteranceId === this.utteranceId
      && (this.phase === 'listening' || this.phase === 'endpoint-pending')
  }

  finalize(
    generation: number,
    utteranceId: string,
    transcript: string,
  ): VoiceFinalTranscript {
    this.validateGeneration(generation)
    if (this.generation === undefined || generation > this.generation) {
      throw new Error('final transcript generation is out of order')
    }
    if (generation < this.generation) {
      throw new Error('stale generation')
    }
    if (this.phase === 'finalized') {
      throw new Error('generation is already finalized')
    }
    if ((this.phase !== 'listening' && this.phase !== 'endpoint-pending') || !this.utteranceId) {
      throw new Error('speech is not confirmed')
    }
    if (utteranceId !== this.utteranceId) {
      throw new Error('final transcript does not match the active utterance')
    }

    this.phase = 'finalized'
    return {
      generation,
      utteranceId,
      transcript,
    }
  }

  rememberSubmission(utteranceId: string): boolean {
    if (this.submittedUtteranceIds.has(utteranceId)) return false
    this.submittedUtteranceIds.add(utteranceId)
    return true
  }

  advanceGeneration(generation: number): void {
    this.validateGeneration(generation)
    if (this.generation !== undefined && generation !== this.generation + 1) {
      throw new Error('generation must increase by one')
    }
    this.generation = generation
    this.submittedUtteranceIds.clear()
    this.utteranceId = undefined
    this.phase = 'cancelled'
    this.nextSequence = 0
    this.audioSamples = 0
  }

  private validateGeneration(generation: number): void {
    if (!Number.isInteger(generation) || generation < 0 || generation > 0xffff_ffff) {
      throw new Error('generation must be a uint32')
    }
  }
}
