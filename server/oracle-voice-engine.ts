import {
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceAudioFrame,
} from '../shared/oracle-voice.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'

export interface VoiceStartUtterance {
  generation: number
  utteranceId: string
  language: string
}

export interface VoiceEndUtterance {
  generation: number
  utteranceId: string
}

export interface VoiceSynthesisRequest {
  generation: number
  segmentId: string
  text: string
}

export type VoiceEngineEvent =
  | {
      type: 'ready'
    }
  | {
      type: 'partial' | 'final'
      generation: number
      utteranceId: string
      text: string
    }
  | {
      type: 'audio'
      generation: number
      segmentId: string
      sequence: number
      sampleRate: number
      samples: Int16Array
    }
  | {
      type: 'audio_end'
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
      languages: string[]
      sttProfile: string
      ttsVoice: string
      resourceClass: 'low' | 'quality'
    }

export interface VoiceSttEngine {
  start(input: VoiceStartUtterance): Promise<void>
  accept(frame: VoiceAudioFrame): Promise<void>
  end(input: VoiceEndUtterance): Promise<void>
  cancel(generation: number): Promise<void>
  close(): Promise<void>
}

export interface VoiceTtsEngine {
  synthesize(input: VoiceSynthesisRequest): Promise<void>
  cancel(generation: number): Promise<void>
  close(): Promise<void>
}

export interface VoiceEngineSession {
  readonly stt: VoiceSttEngine
  readonly tts: VoiceTtsEngine
  onEvent(listener: (event: VoiceEngineEvent) => void): () => void
  cancelGeneration(generation: number): Promise<void>
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
      generation: number
      sequence: number
      sampleCount: number
    }
  | ({ type: 'stt.end' } & VoiceEndUtterance)
  | ({ type: 'tts.synthesize' } & VoiceSynthesisRequest)
  | {
      type: 'cancel'
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
  private readonly cancelled = new Set<number>()
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

  async accept(frame: VoiceAudioFrame): Promise<void> {
    this.requireOpen()
    this.calls.push({
      type: 'stt.accept',
      generation: frame.generation,
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

  async cancel(generation: number): Promise<void> {
    await this.cancelGeneration(generation)
  }

  async cancelGeneration(generation: number): Promise<void> {
    this.requireOpen()
    this.cancelled.add(generation)
    for (let index = this.delayed.length - 1; index >= 0; index -= 1) {
      if (eventGeneration(this.delayed[index]) === generation) {
        this.delayed.splice(index, 1)
      }
    }
    this.calls.push({ type: 'cancel', generation })
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

  emitLateEventsForTest(generation: number): void {
    this.emit({
      type: 'partial',
      generation,
      utteranceId: `late-${generation}`,
      text: 'late',
    })
    this.emit({
      type: 'audio_end',
      generation,
      segmentId: `late-${generation}`,
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

function eventGeneration(event: VoiceEngineEvent): number | undefined {
  return 'generation' in event ? event.generation : undefined
}

function isCancelled(event: VoiceEngineEvent, cancelled: ReadonlySet<number>): boolean {
  const generation = eventGeneration(event)
  return generation !== undefined && cancelled.has(generation)
}
