import {
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceAudioFrame,
} from '../shared/oracle-voice.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'

export interface VoiceStartUtterance {
  streamId: string
  generation: number
  utteranceId: string
  language: string
}

export interface VoiceEndUtterance {
  streamId: string
  generation: number
  utteranceId: string
}

export interface VoiceSynthesisRequest {
  streamId: string
  generation: number
  segmentId: string
  text: string
}

export interface VoiceGenerationIdentity {
  streamId: string
  generation: number
}

export type VoiceUtteranceAudioFrame = VoiceAudioFrame & {
  streamId: string
  utteranceId: string
}

export type VoiceEngineEvent =
  | {
      type: 'ready'
    }
  | {
      type: 'partial' | 'final'
      streamId: string
      generation: number
      utteranceId: string
      text: string
    }
  | {
      type: 'audio'
      streamId: string
      generation: number
      segmentId: string
      sequence: number
      sampleRate: number
      samples: Int16Array
    }
  | {
      type: 'audio_end'
      streamId: string
      generation: number
      segmentId: string
    }
  | {
      type: 'heartbeat'
      timestamp: number
    }
  | {
      type: 'fatal_error'
      message: string
    }

export type VoiceBackendCapability =
  | {
      available: false
      reason: string
    }
  | {
      available: true
      sampleRate: typeof ORACLE_VOICE_SAMPLE_RATE
      playbackSampleRate: number
      languages: string[]
      sttProfile: string
      ttsVoice: string
      resourceClass: 'low' | 'quality'
    }

export interface VoiceSttEngine {
  start(input: VoiceStartUtterance): Promise<void>
  accept(frame: VoiceUtteranceAudioFrame): Promise<void>
  end(input: VoiceEndUtterance): Promise<void>
  cancel(input: VoiceGenerationIdentity): Promise<void>
  close(): Promise<void>
}

export interface VoiceTtsEngine {
  synthesize(input: VoiceSynthesisRequest): Promise<void>
  cancel(input: VoiceGenerationIdentity): Promise<void>
  close(): Promise<void>
}

export interface VoiceEngineSession {
  readonly stt: VoiceSttEngine
  readonly tts: VoiceTtsEngine
  onEvent(listener: (event: VoiceEngineEvent) => void): () => void
  cancelGeneration(input: VoiceGenerationIdentity): Promise<void>
  close(): Promise<void>
}

export interface VoiceEngineFactory {
  initialize(config: EnabledOracleVoiceConfig): Promise<VoiceEngineSession>
  stop(): Promise<void>
  capability(): VoiceBackendCapability
}

export type FakeVoiceEngineCall =
  | ({ type: 'stt.start' } & VoiceStartUtterance)
  | {
      type: 'stt.accept'
      streamId: string
      generation: number
      utteranceId: string
      sequence: number
      sampleCount: number
    }
  | ({ type: 'stt.end' } & VoiceEndUtterance)
  | ({ type: 'tts.synthesize' } & VoiceSynthesisRequest)
  | {
      type: 'cancel'
      streamId: string
      generation: number
    }
  | {
      type: 'close'
    }

export class FakeVoiceEngine implements VoiceEngineSession, VoiceSttEngine, VoiceTtsEngine {
  readonly stt: VoiceSttEngine = this
  readonly tts: VoiceTtsEngine = this
  readonly calls: FakeVoiceEngineCall[] = []
  private readonly listeners = new Set<(event: VoiceEngineEvent) => void>()
  private readonly cancelled = new Set<string>()
  private readonly delayed: VoiceEngineEvent[] = []
  private closed = false

  onEvent(listener: (event: VoiceEngineEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async start(input: VoiceStartUtterance): Promise<void> {
    await this.startUtterance(input)
  }

  async startUtterance(input: VoiceStartUtterance): Promise<void> {
    this.requireOpen()
    this.calls.push({ type: 'stt.start', ...input })
  }

  async accept(frame: VoiceUtteranceAudioFrame): Promise<void> {
    this.requireOpen()
    this.calls.push({
      type: 'stt.accept',
      streamId: frame.streamId,
      generation: frame.generation,
      utteranceId: frame.utteranceId,
      sequence: frame.sequence,
      sampleCount: frame.samples.length,
    })
  }

  async end(input: VoiceEndUtterance): Promise<void> {
    this.requireOpen()
    this.calls.push({ type: 'stt.end', ...input })
  }

  async synthesize(input: VoiceSynthesisRequest): Promise<void> {
    this.requireOpen()
    this.calls.push({ type: 'tts.synthesize', ...input })
  }

  async cancel(input: VoiceGenerationIdentity): Promise<void> {
    await this.cancelGeneration(input)
  }

  async cancelGeneration(input: VoiceGenerationIdentity): Promise<void> {
    this.requireOpen()
    this.cancelled.add(identityKey(input))
    for (let index = this.delayed.length - 1; index >= 0; index -= 1) {
      if (sameGeneration(this.delayed[index], input)) {
        this.delayed.splice(index, 1)
      }
    }
    this.calls.push({ type: 'cancel', ...input })
  }

  emit(event: VoiceEngineEvent): void {
    if (this.closed || isCancelled(event, this.cancelled)) return
    for (const listener of this.listeners) listener(event)
  }

  queueEvent(event: VoiceEngineEvent): void {
    if (this.closed || isCancelled(event, this.cancelled)) return
    this.delayed.push(event)
  }

  flushEvents(): void {
    for (const event of this.delayed.splice(0)) this.emit(event)
  }

  emitLateEventsForTest(input: VoiceGenerationIdentity): void {
    this.emit({
      type: 'partial',
      ...input,
      utteranceId: `late-${input.generation}`,
      text: 'late',
    })
    this.emit({
      type: 'audio_end',
      ...input,
      segmentId: `late-${input.generation}`,
    })
  }

  async close(): Promise<void> {
    if (this.closed) return
    this.closed = true
    this.delayed.length = 0
    this.listeners.clear()
    this.calls.push({ type: 'close' })
  }

  private requireOpen(): void {
    if (this.closed) throw new Error('Voice engine is closed')
  }
}

export class FakeVoiceEngineFactory implements VoiceEngineFactory {
  readonly initializedWith: EnabledOracleVoiceConfig[] = []

  constructor(
    readonly engine: FakeVoiceEngine = new FakeVoiceEngine(),
    private readonly currentCapability: VoiceBackendCapability = {
      available: false,
      reason: 'Fake voice engine is unavailable',
    },
  ) {}

  async initialize(config: EnabledOracleVoiceConfig): Promise<VoiceEngineSession> {
    this.initializedWith.push(config)
    return this.engine
  }

  capability(): VoiceBackendCapability {
    return this.currentCapability
  }

  async stop(): Promise<void> {
    await this.engine.close()
  }
}

function sameGeneration(
  event: VoiceEngineEvent,
  input: VoiceGenerationIdentity,
): boolean {
  return 'generation' in event
    && event.streamId === input.streamId
    && event.generation === input.generation
}

function isCancelled(event: VoiceEngineEvent, cancelled: ReadonlySet<string>): boolean {
  return 'generation' in event && cancelled.has(identityKey(event))
}

function identityKey(input: VoiceGenerationIdentity): string {
  return `${input.streamId}\u0000${input.generation}`
}
