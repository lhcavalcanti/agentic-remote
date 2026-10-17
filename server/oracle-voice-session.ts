import path from 'node:path'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  VOICE_AUDIO_HEADER_BYTES,
  isVoicePlaybackSampleRate,
  type VoiceAudioFrame,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import type { VoiceBackendCapability } from '../shared/contracts.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import type {
  VoiceEngineEvent,
  VoiceEngineFactory,
  VoiceEngineSession,
} from './oracle-voice-engine.js'

export interface VoiceBackendSessionLimits {
  maxFrameBytes: number
  maxQueueBytes: number
  maxUtteranceMs: number
  idleTimeoutMs: number
}

export const DEFAULT_VOICE_BACKEND_LIMITS: VoiceBackendSessionLimits = {
  maxFrameBytes: 32 * 1024,
  maxQueueBytes: ORACLE_VOICE_SAMPLE_RATE * 2 * 2,
  maxUtteranceMs: 30_000,
  idleTimeoutMs: 30_000,
}

export type VoiceBackendOutput = VoiceServerControl | VoiceAudioFrame
type VoiceServerMessage = VoiceServerControl extends infer Message
  ? Message extends VoiceServerControl
    ? Omit<Message, 'protocol' | 'streamId'>
    : never
  : never

export interface VoiceBackendSession {
  control(message: VoiceClientControl): Promise<void>
  audio(frame: VoiceAudioFrame): Promise<void>
  close(reason: string): Promise<void>
}

export interface VoiceBackendSessionOpenOptions {
  streamId: string
  send: (output: VoiceBackendOutput) => Promise<void>
  terminate: (code: number, reason: string) => void
}

export interface VoiceBackend {
  capability(): VoiceBackendCapability
  limits(): VoiceBackendSessionLimits
  busy(): boolean
  open(options: VoiceBackendSessionOpenOptions): Promise<VoiceBackendSession>
  stop(): Promise<void>
}

interface CreateVoiceBackendSessionOptions extends VoiceBackendSessionOpenOptions {
  engine: VoiceEngineSession
  limits?: VoiceBackendSessionLimits
  onClosed?: () => void
}

interface ActiveUtterance {
  generation: number
  utteranceId: string
}

interface QueuedAudio {
  frame: VoiceAudioFrame
  utterance: ActiveUtterance
  bytes: number
}

type Timer = ReturnType<typeof setTimeout>

export class VoiceSessionError extends Error {
  constructor(
    message: string,
    readonly closeCode: number,
  ) {
    super(message)
    this.name = 'VoiceSessionError'
  }
}

export function createVoiceBackendSession(
  options: CreateVoiceBackendSessionOptions,
): VoiceBackendSession {
  return new EngineVoiceBackendSession(options)
}

class EngineVoiceBackendSession implements VoiceBackendSession {
  private readonly streamId: string
  private readonly engine: VoiceEngineSession
  private readonly limits: VoiceBackendSessionLimits
  private readonly sendOutput: (output: VoiceBackendOutput) => Promise<void>
  private readonly terminate: (code: number, reason: string) => void
  private readonly onClosed: () => void
  private readonly unsubscribe: () => void
  private readonly audioQueue: QueuedAudio[] = []
  private controlTail: Promise<void> = Promise.resolve()
  private outputTail: Promise<void> = Promise.resolve()
  private audioDrainPromise: Promise<void> = Promise.resolve()
  private closePromise: Promise<void> | undefined
  private idleTimer: Timer | undefined
  private queuedAudioBytes = 0
  private drainingAudio = false
  private started = false
  private closed = false
  private terminated = false
  private language = ''
  private generation: number | undefined
  private activeUtterance: ActiveUtterance | undefined
  private activeSegmentId: string | undefined
  private nextSequence = 0
  private utteranceSamples = 0
  private utteranceEnded = false
  private finalForwarded = false

  constructor(options: CreateVoiceBackendSessionOptions) {
    this.streamId = options.streamId
    this.engine = options.engine
    this.limits = options.limits ?? DEFAULT_VOICE_BACKEND_LIMITS
    validateLimits(this.limits)
    this.sendOutput = options.send
    this.terminate = options.terminate
    this.onClosed = options.onClosed ?? (() => undefined)
    this.unsubscribe = this.engine.onEvent((event) => this.handleEngineEvent(event))
    this.armIdleTimeout()
  }

  control(message: VoiceClientControl): Promise<void> {
    const operation = this.controlTail.then(async () => {
      this.requireOpen()
      this.armIdleTimeout()
      await this.handleControl(message)
    })
    this.controlTail = operation.catch(() => undefined)
    return operation.catch(async (error: unknown) => {
      const failure = asSessionError(error)
      await this.fail(failure)
      throw failure
    })
  }

  async audio(frame: VoiceAudioFrame): Promise<void> {
    const precedingControls = this.controlTail
    await precedingControls
    try {
      this.requireOpen()
      this.armIdleTimeout()
      if (frame.direction !== 'microphone' || frame.sampleRate !== ORACLE_VOICE_SAMPLE_RATE) {
        throw new VoiceSessionError('Only 16 kHz microphone audio is accepted', 1008)
      }
      const frameBytes = VOICE_AUDIO_HEADER_BYTES + frame.samples.byteLength
      if (frameBytes > this.limits.maxFrameBytes) {
        throw new VoiceSessionError('Voice audio frame is too large', 1009)
      }
      const utterance = this.requireUtterance(frame.generation)
      if (this.utteranceEnded) {
        throw new VoiceSessionError('Voice utterance has already ended', 1008)
      }
      if (frame.sequence !== this.nextSequence) {
        throw new VoiceSessionError('Voice audio sequence is out of order', 1008)
      }
      const maxSamples = Math.floor(
        ORACLE_VOICE_SAMPLE_RATE * this.limits.maxUtteranceMs / 1000,
      )
      if (frame.samples.length > maxSamples - this.utteranceSamples) {
        throw new VoiceSessionError('Voice utterance duration limit exceeded', 1008)
      }
      const bytes = frame.samples.byteLength
      if (bytes > this.limits.maxQueueBytes - this.queuedAudioBytes) {
        throw new VoiceSessionError('Voice input queue is full', 1013)
      }

      this.nextSequence += 1
      this.utteranceSamples += frame.samples.length
      this.queuedAudioBytes += bytes
      this.audioQueue.push({
        frame,
        utterance: { ...utterance },
        bytes,
      })
      this.startAudioDrain()
    } catch (error) {
      const failure = asSessionError(error)
      await this.fail(failure)
      throw failure
    }
  }

  close(reason: string): Promise<void> {
    if (this.closePromise) return this.closePromise
    this.closePromise = this.closeSession(reason)
    return this.closePromise
  }

  private async handleControl(message: VoiceClientControl): Promise<void> {
    if (message.streamId !== this.streamId) {
      throw new VoiceSessionError('Voice stream ID does not match this connection', 1008)
    }
    switch (message.type) {
      case 'start':
        if (this.started) {
          throw new VoiceSessionError('Voice stream is already started', 1008)
        }
        this.started = true
        this.language = message.language
        this.generation = message.generation
        await this.sendControl({
          type: 'state',
          generation: message.generation,
          state: 'ready',
        })
        return
      case 'speech_tentative':
        this.requireStartedGeneration(message.generation)
        return
      case 'speech_confirmed': {
        this.requireStarted()
        if (this.generation !== undefined && message.generation < this.generation) {
          throw new VoiceSessionError('Voice generation is stale', 1008)
        }
        if (this.activeUtterance) {
          throw new VoiceSessionError('A voice utterance is already active', 1008)
        }
        if (this.generation !== undefined && message.generation > this.generation) {
          await this.engine.cancelGeneration({
            streamId: this.streamId,
            generation: this.generation,
          })
        }
        this.generation = message.generation
        this.activeUtterance = {
          generation: message.generation,
          utteranceId: message.utteranceId,
        }
        this.nextSequence = 0
        this.utteranceSamples = 0
        this.utteranceEnded = false
        this.finalForwarded = false
        await this.engine.stt.start({
          streamId: this.streamId,
          generation: message.generation,
          utteranceId: message.utteranceId,
          language: this.language,
        })
        await this.sendControl({
          type: 'state',
          generation: message.generation,
          state: 'listening',
        })
        return
      }
      case 'speech_end': {
        const utterance = this.requireUtterance(message.generation, message.utteranceId)
        if (this.utteranceEnded) {
          throw new VoiceSessionError('Voice utterance has already ended', 1008)
        }
        this.utteranceEnded = true
        await this.audioDrainPromise
        this.requireOpen()
        this.requireUtterance(utterance.generation, utterance.utteranceId)
        await this.engine.stt.end({
          streamId: this.streamId,
          ...utterance,
        })
        await this.sendControl({
          type: 'state',
          generation: message.generation,
          state: 'recognizing',
        })
        return
      }
      case 'synthesize':
        this.requireStartedGeneration(message.generation)
        if (this.activeSegmentId) {
          throw new VoiceSessionError('Voice synthesis is already active', 1008)
        }
        this.activeSegmentId = message.segmentId
        void this.engine.tts.synthesize({
          streamId: this.streamId,
          generation: message.generation,
          segmentId: message.segmentId,
          text: message.text,
        }).catch((error: unknown) => {
          if (
            this.closed
            || this.generation !== message.generation
            || this.activeSegmentId !== message.segmentId
          ) return
          this.activeSegmentId = undefined
          void this.fail(asSessionError(error, 1011))
        })
        await this.sendControl({
          type: 'state',
          generation: message.generation,
          state: 'speaking',
        })
        return
      case 'cancel':
        this.requireStarted()
        if (this.generation !== undefined && message.generation < this.generation) return
        await this.engine.cancelGeneration({
          streamId: this.streamId,
          generation: message.generation,
        })
        this.generation = message.generation
        this.clearCurrentWork()
        await this.sendControl({
          type: 'state',
          generation: message.generation,
          state: 'ready',
        })
        return
      case 'heartbeat':
        this.requireStartedGeneration(message.generation)
        await this.sendControl({
          type: 'heartbeat',
          generation: message.generation,
          timestamp: message.timestamp,
        })
        return
      case 'stop':
        this.requireStartedGeneration(message.generation)
        await this.closeSession(message.reason || 'Voice stream stopped')
    }
  }

  private startAudioDrain(): void {
    if (this.drainingAudio) return
    this.drainingAudio = true
    this.audioDrainPromise = this.drainAudio()
  }

  private async drainAudio(): Promise<void> {
    try {
      while (!this.closed && this.audioQueue.length > 0) {
        const queued = this.audioQueue.shift()!
        this.queuedAudioBytes -= queued.bytes
        if (!sameUtterance(this.activeUtterance, queued.utterance)) continue
        await this.engine.stt.accept({
          ...queued.frame,
          streamId: this.streamId,
          utteranceId: queued.utterance.utteranceId,
        })
      }
    } catch (error) {
      await this.fail(asSessionError(error, 1011))
    } finally {
      this.drainingAudio = false
      if (!this.closed && this.audioQueue.length > 0) this.startAudioDrain()
    }
  }

  private handleEngineEvent(event: VoiceEngineEvent): void {
    if (this.closed) return
    if (event.type === 'ready') return
    if (event.type === 'fatal_error') {
      const generation = this.generation ?? 0
      void this.enqueueOutput({
        type: 'error',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: this.streamId,
        generation,
        code: 'voice_backend_failed',
        message: event.message,
        fatal: true,
      }).finally(() => this.fail(new VoiceSessionError(event.message, 1011)))
      return
    }
    if (event.type === 'heartbeat') {
      void this.sendControl({
        type: 'heartbeat',
        generation: this.generation ?? 0,
        timestamp: event.timestamp,
      })
      return
    }
    if (event.streamId !== this.streamId || event.generation !== this.generation) return
    if (event.type === 'partial' || event.type === 'final') {
      if (
        !this.activeUtterance
        || event.utteranceId !== this.activeUtterance.utteranceId
        || (event.type === 'final' && this.finalForwarded)
      ) return
      if (event.type === 'final') {
        this.finalForwarded = true
        this.activeUtterance = undefined
        this.clearAudioQueue()
      }
      void this.sendControl({
        type: event.type,
        generation: event.generation,
        utteranceId: event.utteranceId,
        text: event.text,
      })
      return
    }
    if (event.type !== 'audio' && event.type !== 'audio_end') return
    if (event.segmentId !== this.activeSegmentId) return
    if (event.type === 'audio') {
      if (!isVoicePlaybackSampleRate(event.sampleRate)) {
        void this.fail(new VoiceSessionError('Voice engine emitted an invalid sample rate', 1011))
        return
      }
      void this.enqueueOutput({
        direction: 'playback',
        generation: event.generation,
        sequence: event.sequence,
        sampleRate: event.sampleRate,
        samples: event.samples,
      })
      return
    }
    this.activeSegmentId = undefined
    void this.sendControl({
      type: 'audio_end',
      generation: event.generation,
      segmentId: event.segmentId,
    })
  }

  private sendControl(
    message: VoiceServerMessage,
  ): Promise<void> {
    return this.enqueueOutput({
      ...message,
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: this.streamId,
    } as VoiceServerControl)
  }

  private enqueueOutput(output: VoiceBackendOutput): Promise<void> {
    if (this.closed) return Promise.resolve()
    const sending = this.outputTail.then(() => this.sendOutput(output))
    this.outputTail = sending.catch(async (error: unknown) => {
      await this.fail(asSessionError(error, 1011))
    })
    return sending
  }

  private requireStarted(): void {
    if (!this.started || this.generation === undefined) {
      throw new VoiceSessionError('Voice stream has not started', 1008)
    }
  }

  private requireStartedGeneration(generation: number): void {
    this.requireStarted()
    if (generation !== this.generation) {
      throw new VoiceSessionError('Voice generation does not match the active generation', 1008)
    }
  }

  private requireUtterance(
    generation: number,
    utteranceId?: string,
  ): ActiveUtterance {
    const active = this.activeUtterance
    if (
      !active
      || active.generation !== generation
      || (utteranceId !== undefined && active.utteranceId !== utteranceId)
    ) {
      throw new VoiceSessionError('Voice audio does not match the active utterance', 1008)
    }
    return active
  }

  private requireOpen(): void {
    if (this.closed) {
      throw new VoiceSessionError('Voice backend session is closed', 1001)
    }
  }

  private async fail(error: VoiceSessionError): Promise<void> {
    if (!this.terminated) {
      this.terminated = true
      this.terminate(error.closeCode, error.message)
    }
    await this.close(error.message)
  }

  private async closeSession(_reason: string): Promise<void> {
    if (this.closed) return
    this.closed = true
    this.clearIdleTimeout()
    this.unsubscribe()
    this.clearAudioQueue()
    const generation = this.generation
    this.clearCurrentWork()
    try {
      if (generation !== undefined) {
        await this.engine.cancelGeneration({
          streamId: this.streamId,
          generation,
        })
      }
    } finally {
      this.onClosed()
    }
  }

  private clearCurrentWork(): void {
    this.activeUtterance = undefined
    this.activeSegmentId = undefined
    this.nextSequence = 0
    this.utteranceSamples = 0
    this.utteranceEnded = false
    this.finalForwarded = false
    this.clearAudioQueue()
  }

  private clearAudioQueue(): void {
    this.audioQueue.length = 0
    this.queuedAudioBytes = 0
  }

  private armIdleTimeout(): void {
    this.clearIdleTimeout()
    this.idleTimer = setTimeout(() => {
      void this.fail(new VoiceSessionError('Oracle voice stream timed out', 1001))
    }, this.limits.idleTimeoutMs)
  }

  private clearIdleTimeout(): void {
    if (!this.idleTimer) return
    clearTimeout(this.idleTimer)
    this.idleTimer = undefined
  }
}

export class LocalVoiceBackend implements VoiceBackend {
  private readonly advertisedCapability: VoiceBackendCapability
  private readonly selectedLimits: VoiceBackendSessionLimits
  private enginePromise: Promise<VoiceEngineSession> | undefined
  private active: VoiceBackendSession | undefined
  private useFactoryCapability = false

  constructor(
    private readonly factory: VoiceEngineFactory,
    private readonly config: EnabledOracleVoiceConfig,
    limits: VoiceBackendSessionLimits = DEFAULT_VOICE_BACKEND_LIMITS,
  ) {
    validateLimits(limits)
    this.selectedLimits = { ...limits }
    this.advertisedCapability = capabilityFromConfig(config)
  }

  capability(): VoiceBackendCapability {
    return this.useFactoryCapability
      ? this.factory.capability()
      : this.advertisedCapability
  }

  limits(): VoiceBackendSessionLimits {
    return { ...this.selectedLimits }
  }

  busy(): boolean {
    return this.active !== undefined
  }

  async open(options: VoiceBackendSessionOpenOptions): Promise<VoiceBackendSession> {
    if (this.active) {
      throw new VoiceSessionError('Oracle voice backend is already in use', 1013)
    }
    let release!: () => void
    const reserved = new Promise<void>((resolve) => {
      release = resolve
    })
    this.active = {
      control: async () => reserved,
      audio: async () => reserved,
      close: async () => release(),
    }
    try {
      this.enginePromise ??= this.factory.initialize(this.config)
      const engine = await this.enginePromise
      this.useFactoryCapability = true
      const session = createVoiceBackendSession({
        ...options,
        engine,
        limits: this.selectedLimits,
        onClosed: () => {
          if (this.active === session) this.active = undefined
        },
      })
      this.active = session
      return session
    } catch (error) {
      this.active = undefined
      this.enginePromise = undefined
      this.useFactoryCapability = true
      throw error
    }
  }

  async stop(): Promise<void> {
    await this.active?.close('Oracle voice backend stopped')
    this.active = undefined
    this.enginePromise = undefined
    await this.factory.stop()
    this.useFactoryCapability = true
  }
}

function capabilityFromConfig(config: EnabledOracleVoiceConfig): VoiceBackendCapability {
  return {
    available: true,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    playbackSampleRate: config.tts.sampleRate,
    languages: [config.language],
    sttProfile: config.stt.profile,
    ttsVoice: path.basename(config.tts.model).replace(/\.onnx$/i, ''),
    resourceClass: config.stt.profile === 'zipformer' ? 'low' : 'quality',
  }
}

function validateLimits(limits: VoiceBackendSessionLimits): void {
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new RangeError(`${name} must be a positive safe integer`)
    }
  }
}

function sameUtterance(
  left: ActiveUtterance | undefined,
  right: ActiveUtterance,
): boolean {
  return left?.generation === right.generation && left.utteranceId === right.utteranceId
}

function asSessionError(error: unknown, closeCode = 1008): VoiceSessionError {
  if (error instanceof VoiceSessionError) return error
  return new VoiceSessionError(
    error instanceof Error && error.message ? error.message : 'Oracle voice backend failed',
    closeCode,
  )
}
