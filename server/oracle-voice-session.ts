import path from 'node:path'
import {
  ORACLE_VOICE_MAX_PCM_SAMPLE_RATE,
  ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS,
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  VOICE_AUDIO_HEADER_BYTES,
  isVoicePlaybackSampleRate,
  voiceAudioFrameByteLength,
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
  maxOutputQueueBytes: number
  maxUtteranceMs: number
  idleTimeoutMs: number
}

const MAX_INTERNAL_SEGMENT_ID_BYTES = 256

export const DEFAULT_VOICE_BACKEND_LIMITS: VoiceBackendSessionLimits = {
  maxFrameBytes: 32 * 1024,
  maxQueueBytes: ORACLE_VOICE_SAMPLE_RATE * 2 * 12,
  maxOutputQueueBytes: voiceOutputDeliveryByteLimit(
    ORACLE_VOICE_MAX_PCM_SAMPLE_RATE,
    32 * 1024,
  ),
  maxUtteranceMs: 30_000,
  idleTimeoutMs: 30_000,
}

export function voiceOutputDeliveryByteLimit(
  playbackSampleRate: number,
  maxFrameBytes: number,
): number {
  if (!isVoicePlaybackSampleRate(playbackSampleRate)) {
    throw new RangeError('playbackSampleRate must be an accepted playback sample rate')
  }
  if (!Number.isSafeInteger(maxFrameBytes) || maxFrameBytes <= 0) {
    throw new RangeError('maxFrameBytes must be a positive safe integer')
  }
  const maximumFrameOverhead = VOICE_AUDIO_HEADER_BYTES + MAX_INTERNAL_SEGMENT_ID_BYTES
  const maximumPcmBytesPerFrame = Math.floor(
    (maxFrameBytes - maximumFrameOverhead) / Int16Array.BYTES_PER_ELEMENT,
  ) * Int16Array.BYTES_PER_ELEMENT
  if (maximumPcmBytesPerFrame <= 0) {
    throw new RangeError('maxFrameBytes is too small for playback audio')
  }
  const maximumPcmBytes = (
    playbackSampleRate
    * ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS
    * Int16Array.BYTES_PER_ELEMENT
  )
  const playbackFrames = Math.ceil(maximumPcmBytes / maximumPcmBytesPerFrame)
  return (playbackFrames + 1) * maxFrameBytes
}

export type VoiceBackendOutput = VoiceServerControl | VoiceAudioFrame
export type VoiceBackendDisconnectCause =
  | 'transport'
  | 'registration'
  | 'worker'
  | 'internal'
  | 'protocol'
  | 'policy'
  | 'backpressure'

export interface VoiceBackendDisconnect {
  code: number
  reason: string
  retryable: boolean
  cause: VoiceBackendDisconnectCause
}

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
  terminate: (failure: VoiceBackendDisconnect) => void
  observeQueue?: (snapshot: VoiceBackendQueueSnapshot) => void
  signal?: AbortSignal
}

export interface VoiceBackendQueueSnapshot {
  queuedInputBytes: number
  pendingInputBytes: number
  queuedOutputBytes: number
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
  languages?: readonly string[]
  limits?: VoiceBackendSessionLimits
  onClosed?: () => void
}

interface ActiveUtterance {
  generation: number
  utteranceId: string
}

interface AudioReservation {
  frame: VoiceAudioFrame
  bytes: number
  state: 'queued' | 'pending' | 'released'
  utterance?: ActiveUtterance
}

interface QueuedOutput {
  output: VoiceBackendOutput
  bytes: number
  resolve: () => void
  reject: (error: unknown) => void
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
  private readonly languages: ReadonlySet<string> | undefined
  private readonly limits: VoiceBackendSessionLimits
  private readonly sendOutput: (output: VoiceBackendOutput) => Promise<void>
  private readonly terminate: (failure: VoiceBackendDisconnect) => void
  private readonly observeQueue: (snapshot: VoiceBackendQueueSnapshot) => void
  private readonly onClosed: () => void
  private readonly unsubscribe: () => void
  private readonly audioQueue: AudioReservation[] = []
  private readonly audioReservations = new Set<AudioReservation>()
  private readonly outputQueue: QueuedOutput[] = []
  private readonly generationCancellations = new Map<number, Promise<void>>()
  private controlTail: Promise<void> = Promise.resolve()
  private audioIngressTail: Promise<void> = Promise.resolve()
  private audioDrainPromise: Promise<void> = Promise.resolve()
  private closePromise: Promise<void> | undefined
  private idleTimer: Timer | undefined
  private queuedAudioBytes = 0
  private pendingAudioBytes = 0
  private queuedOutputBytes = 0
  private drainingAudio = false
  private drainingOutput = false
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
    this.languages = options.languages
      ? new Set(options.languages)
      : undefined
    this.limits = options.limits ?? DEFAULT_VOICE_BACKEND_LIMITS
    validateLimits(this.limits)
    this.sendOutput = options.send
    this.terminate = options.terminate
    this.observeQueue = options.observeQueue ?? (() => undefined)
    this.onClosed = options.onClosed ?? (() => undefined)
    this.unsubscribe = this.engine.onEvent((event) => this.handleEngineEvent(event))
    this.reportQueue()
    this.armIdleTimeout()
  }

  control(message: VoiceClientControl): Promise<void> {
    const precedingAudio = message.type === 'speech_end'
      ? this.audioIngressTail
      : Promise.resolve()
    const operation = this.controlTail.then(async () => {
      this.requireOpen()
      this.armIdleTimeout()
      await this.handleControl(message, precedingAudio)
    })
    this.controlTail = operation.catch(() => undefined)
    return operation.catch(async (error: unknown) => {
      const failure = asSessionError(error)
      await this.fail(failure, disconnectCause(failure.closeCode))
      throw failure
    })
  }

  audio(frame: VoiceAudioFrame): Promise<void> {
    let reservation: AudioReservation
    try {
      this.requireOpen()
      this.armIdleTimeout()
      if (frame.direction !== 'microphone' || frame.sampleRate !== ORACLE_VOICE_SAMPLE_RATE) {
        throw new VoiceSessionError('Only 16 kHz microphone audio is accepted', 1008)
      }
      const frameBytes = voiceAudioFrameByteLength(frame)
      if (frameBytes > this.limits.maxFrameBytes) {
        throw new VoiceSessionError('Voice audio frame is too large', 1009)
      }
      const bytes = frame.samples.byteLength
      if (
        bytes > this.limits.maxQueueBytes
          - this.queuedAudioBytes
          - this.pendingAudioBytes
      ) {
        throw new VoiceSessionError('Voice input queue is full', 1013)
      }
      reservation = {
        frame,
        bytes,
        state: 'queued',
      }
      this.audioReservations.add(reservation)
      this.queuedAudioBytes += bytes
      this.reportQueue()
    } catch (error) {
      const failure = asSessionError(error)
      return this.fail(failure, disconnectCause(failure.closeCode))
        .then(() => Promise.reject(failure))
    }

    const precedingControls = this.controlTail
    const operation = this.audioIngressTail.catch(() => undefined).then(async () => {
      let queued = false
      try {
        await precedingControls
        this.requireOpen()
        const utterance = this.requireUtterance(frame.generation)
        if (this.finalForwarded) return
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

        this.nextSequence += 1
        this.utteranceSamples += frame.samples.length
        queued = true
        reservation.utterance = { ...utterance }
        this.audioQueue.push(reservation)
        this.startAudioDrain()
      } catch (error) {
        const failure = asSessionError(error)
        await this.fail(failure, disconnectCause(failure.closeCode))
        throw failure
      } finally {
        if (!queued) this.releaseAudioReservation(reservation)
      }
    })
    this.audioIngressTail = operation.catch(() => undefined)
    return operation
  }

  close(reason: string): Promise<void> {
    if (this.closePromise) return this.closePromise
    this.closePromise = this.closeSession(reason)
    return this.closePromise
  }

  private async handleControl(
    message: VoiceClientControl,
    precedingAudio: Promise<void>,
  ): Promise<void> {
    if (message.streamId !== this.streamId) {
      throw new VoiceSessionError('Voice stream ID does not match this connection', 1008)
    }
    switch (message.type) {
      case 'start':
        if (this.started) {
          throw new VoiceSessionError('Voice stream is already started', 1008)
        }
        if (this.languages && !this.languages.has(message.language)) {
          throw new VoiceSessionError(
            `Voice language "${message.language}" is not supported`,
            1008,
          )
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
        if (this.activeUtterance && this.finalForwarded) {
          this.activeUtterance = undefined
        } else if (this.activeUtterance) {
          throw new VoiceSessionError('A voice utterance is already active', 1008)
        }
        if (this.generation !== undefined && message.generation > this.generation) {
          this.activeSegmentId = undefined
          this.startGenerationCancellation(this.generation)
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
        await precedingAudio
        this.requireOpen()
        const utterance = this.requireUtterance(message.generation, message.utteranceId)
        if (this.finalForwarded) {
          this.utteranceEnded = true
          this.activeUtterance = undefined
          return
        }
        if (this.utteranceEnded) {
          throw new VoiceSessionError('Voice utterance has already ended', 1008)
        }
        this.utteranceEnded = true
        await this.audioDrainPromise
        this.requireOpen()
        if (this.finalForwarded) {
          this.activeUtterance = undefined
          return
        }
        this.requireUtterance(utterance.generation, utterance.utteranceId)
        await this.engine.stt.end({
          streamId: this.streamId,
          ...utterance,
        })
        if (this.finalForwarded) {
          this.activeUtterance = undefined
          return
        }
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
          void this.handleSynthesisFailure(message, error).catch(
            (deliveryError: unknown) => {
              void this.fail(asSessionError(deliveryError, 1011), 'internal')
            },
          )
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
        this.generation = message.generation
        this.clearCurrentWork()
        this.startGenerationCancellation(message.generation)
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
        {
          const reason = message.reason || 'Voice stream stopped'
          await this.close(reason)
          this.terminateTransport({
            code: 1000,
            reason,
            retryable: false,
            cause: 'policy',
          })
        }
    }
  }

  private startAudioDrain(): void {
    if (this.drainingAudio) return
    this.drainingAudio = true
    this.audioDrainPromise = this.drainAudio()
  }

  private startGenerationCancellation(generation: number): void {
    if (this.generationCancellations.has(generation)) return
    const cancellation = this.engine.cancelGeneration({
      streamId: this.streamId,
      generation,
    }).catch(async (error: unknown) => {
      if (this.closed) return
      await this.fail(asSessionError(error, 1011), 'internal')
    }).finally(() => {
      if (this.generationCancellations.get(generation) === cancellation) {
        this.generationCancellations.delete(generation)
      }
    })
    this.generationCancellations.set(generation, cancellation)
  }

  private async handleSynthesisFailure(
    message: Extract<VoiceClientControl, { type: 'synthesize' }>,
    error: unknown,
  ): Promise<void> {
    if (
      this.closed
      || this.generation !== message.generation
      || this.activeSegmentId !== message.segmentId
    ) return
    this.activeSegmentId = undefined
    await this.sendControl({
      type: 'error',
      generation: message.generation,
      code: 'tts_failed',
      message: asSessionError(error, 1011).message,
      fatal: false,
    })
  }

  private async drainAudio(): Promise<void> {
    try {
      while (!this.closed && this.audioQueue.length > 0) {
        const queued = this.audioQueue.shift()!
        this.markAudioPending(queued)
        try {
          if (
            !queued.utterance
            || !sameUtterance(this.activeUtterance, queued.utterance)
          ) continue
          await this.engine.stt.accept({
            ...queued.frame,
            streamId: this.streamId,
            utteranceId: queued.utterance.utteranceId,
          })
        } finally {
          this.releaseAudioReservation(queued)
        }
      }
    } catch (error) {
      await this.fail(asSessionError(error, 1011), 'internal')
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
      }).catch(() => undefined).finally(
        () => this.fail(new VoiceSessionError(event.message, 1011), 'worker'),
      )
      return
    }
    if (event.type === 'heartbeat') {
      void this.sendControl({
        type: 'heartbeat',
        generation: this.generation ?? 0,
        timestamp: event.timestamp,
      }).catch(() => undefined)
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
        this.clearAudioQueue()
      }
      void this.sendControl({
        type: event.type,
        generation: event.generation,
        utteranceId: event.utteranceId,
        text: event.text,
      }).catch(() => undefined)
      return
    }
    if (event.type !== 'audio' && event.type !== 'audio_end') return
    if (event.segmentId !== this.activeSegmentId) return
    if (event.type === 'audio') {
      if (!isVoicePlaybackSampleRate(event.sampleRate)) {
        void this.fail(
          new VoiceSessionError('Voice engine emitted an invalid sample rate', 1011),
          'internal',
        )
        return
      }
      const frame: VoiceAudioFrame = {
        direction: 'playback',
        generation: event.generation,
        segmentId: event.segmentId,
        sequence: event.sequence,
        sampleRate: event.sampleRate,
        samples: event.samples,
      }
      if (voiceAudioFrameByteLength(frame) > this.limits.maxFrameBytes) {
        void this.fail(
          new VoiceSessionError('Voice playback frame is too large', 1009),
          'protocol',
        )
        return
      }
      void this.enqueueOutput(frame).catch(() => undefined)
      return
    }
    this.activeSegmentId = undefined
    void this.sendControl({
      type: 'audio_end',
      generation: event.generation,
      segmentId: event.segmentId,
    }).catch(() => undefined)
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
    const bytes = outputBytes(output)
    if (bytes > this.limits.maxOutputQueueBytes - this.queuedOutputBytes) {
      const error = new VoiceSessionError('Voice output queue is full', 1013)
      void this.fail(error, 'backpressure')
      return Promise.reject(error)
    }
    this.queuedOutputBytes += bytes
    const queued = new Promise<void>((resolve, reject) => {
      this.outputQueue.push({ output, bytes, resolve, reject })
    })
    this.reportQueue()
    this.startOutputDrain()
    return queued
  }

  private startOutputDrain(): void {
    if (this.drainingOutput) return
    this.drainingOutput = true
    void this.drainOutput()
  }

  private async drainOutput(): Promise<void> {
    try {
      while (!this.closed && this.outputQueue.length > 0) {
        const queued = this.outputQueue.shift()!
        try {
          await this.sendOutput(queued.output)
          queued.resolve()
        } catch (error) {
          const failure = asSessionError(error, 1011)
          queued.reject(failure)
          await this.fail(failure, 'transport', true)
          return
        } finally {
          this.queuedOutputBytes -= queued.bytes
          this.reportQueue()
        }
      }
    } finally {
      this.drainingOutput = false
      if (!this.closed && this.outputQueue.length > 0) this.startOutputDrain()
    }
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

  private async fail(
    error: VoiceSessionError,
    cause: VoiceBackendDisconnectCause,
    retryable = false,
  ): Promise<void> {
    this.terminateTransport({
      code: error.closeCode,
      reason: error.message,
      retryable,
      cause,
    })
    await this.close(error.message)
  }

  private terminateTransport(failure: VoiceBackendDisconnect): void {
    if (this.terminated) return
    this.terminated = true
    this.terminate(failure)
  }

  private async closeSession(_reason: string): Promise<void> {
    if (this.closed) return
    this.closed = true
    this.clearIdleTimeout()
    this.unsubscribe()
    this.clearAudioQueue()
    this.clearOutputQueue()
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
    for (const reservation of [...this.audioReservations]) {
      this.releaseAudioReservation(reservation)
    }
  }

  private markAudioPending(reservation: AudioReservation): void {
    if (reservation.state !== 'queued') return
    reservation.state = 'pending'
    this.queuedAudioBytes -= reservation.bytes
    this.pendingAudioBytes += reservation.bytes
    this.reportQueue()
  }

  private releaseAudioReservation(reservation: AudioReservation): void {
    if (reservation.state === 'released') return
    if (reservation.state === 'pending') {
      this.pendingAudioBytes -= reservation.bytes
    } else {
      this.queuedAudioBytes -= reservation.bytes
    }
    reservation.state = 'released'
    this.audioReservations.delete(reservation)
    this.reportQueue()
  }

  private clearOutputQueue(): void {
    for (const queued of this.outputQueue.splice(0)) {
      this.queuedOutputBytes -= queued.bytes
      queued.resolve()
    }
    this.reportQueue()
  }

  private reportQueue(): void {
    try {
      this.observeQueue({
        queuedInputBytes: this.queuedAudioBytes,
        pendingInputBytes: this.pendingAudioBytes,
        queuedOutputBytes: this.queuedOutputBytes,
      })
    } catch {
      // Queue observation is diagnostic and must not affect the voice session.
    }
  }

  private armIdleTimeout(): void {
    this.clearIdleTimeout()
    this.idleTimer = setTimeout(() => {
      void this.fail(
        new VoiceSessionError('Oracle voice stream timed out', 1001),
        'policy',
      )
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
    limits?: VoiceBackendSessionLimits,
  ) {
    const selectedLimits = limits ?? {
      ...DEFAULT_VOICE_BACKEND_LIMITS,
      maxOutputQueueBytes: voiceOutputDeliveryByteLimit(
        config.tts.sampleRate,
        DEFAULT_VOICE_BACKEND_LIMITS.maxFrameBytes,
      ),
    }
    validateLimits(selectedLimits)
    this.selectedLimits = { ...selectedLimits }
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
    if (options.signal?.aborted) throw acquisitionCancelled()
    let release!: () => void
    const reserved = new Promise<void>((resolve) => {
      release = resolve
    })
    const reservation: VoiceBackendSession = {
      control: async () => reserved,
      audio: async () => reserved,
      close: async () => release(),
    }
    this.active = reservation
    const enginePromise = this.enginePromise ??= this.factory.initialize(this.config)
    try {
      const engine = await waitForAcquisition(
        enginePromise,
        options.signal,
        () => {
          if (this.active === reservation) this.active = undefined
        },
      )
      this.useFactoryCapability = true
      const session = createVoiceBackendSession({
        ...options,
        engine,
        languages: [this.config.language],
        limits: this.selectedLimits,
        onClosed: () => {
          if (this.active === session) this.active = undefined
        },
      })
      this.active = session
      return session
    } catch (error) {
      if (this.active === reservation) this.active = undefined
      if (!isAcquisitionCancelled(error)) {
        if (this.enginePromise === enginePromise) this.enginePromise = undefined
        this.useFactoryCapability = true
      }
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

class VoiceBackendAcquisitionCancelled extends VoiceSessionError {}

function acquisitionCancelled(): VoiceBackendAcquisitionCancelled {
  return new VoiceBackendAcquisitionCancelled(
    'Oracle voice backend acquisition was cancelled',
    1001,
  )
}

function isAcquisitionCancelled(
  error: unknown,
): error is VoiceBackendAcquisitionCancelled {
  return error instanceof VoiceBackendAcquisitionCancelled
}

function waitForAcquisition<T>(
  pending: Promise<T>,
  signal: AbortSignal | undefined,
  onAbort: () => void,
): Promise<T> {
  if (!signal) return pending
  if (signal.aborted) {
    onAbort()
    return Promise.reject(acquisitionCancelled())
  }
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      onAbort()
      reject(acquisitionCancelled())
    }
    signal.addEventListener('abort', abort, { once: true })
    pending.then(
      (value) => {
        signal.removeEventListener('abort', abort)
        resolve(value)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', abort)
        reject(error)
      },
    )
  })
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

function outputBytes(output: VoiceBackendOutput): number {
  return 'direction' in output
    ? voiceAudioFrameByteLength(output)
    : Buffer.byteLength(JSON.stringify(output))
}

function asSessionError(error: unknown, closeCode = 1008): VoiceSessionError {
  if (error instanceof VoiceSessionError) return error
  return new VoiceSessionError(
    error instanceof Error && error.message ? error.message : 'Oracle voice backend failed',
    closeCode,
  )
}

function disconnectCause(closeCode: number): VoiceBackendDisconnectCause {
  if (closeCode === 1013) return 'backpressure'
  if (
    closeCode === 1002
    || closeCode === 1003
    || closeCode === 1007
    || closeCode === 1008
    || closeCode === 1009
  ) {
    return 'protocol'
  }
  if (closeCode === 1011) return 'internal'
  return 'policy'
}
