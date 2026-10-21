import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
} from '../shared/manager.js'
import {
  ORACLE_VOICE_PROTOCOL,
  voiceAudioFrameByteLength,
  type VoiceAudioFrame,
  type VoiceCapabilities,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import type {
  ManagerEventSource,
  ManagerRouteAgent,
} from './manager-routes.js'
import { SpeakableSegmenter } from './oracle-voice-segments.js'
import {
  VoiceSessionError,
  type VoiceBackendDisconnect,
  type VoiceBackendDisconnectCause,
  type VoiceBackendOutput,
} from './oracle-voice-session.js'
import { VoiceTurnState } from './oracle-voice-turn.js'

const DEFAULT_CANCEL_TIMEOUT_MS = 5_000

export type OracleVoiceBackendOutput = VoiceBackendOutput

export interface OracleVoiceBackendDisconnect extends VoiceBackendDisconnect {}

export interface OracleVoiceBackendConnection {
  capabilities: VoiceCapabilities
  control(message: VoiceClientControl): Promise<void>
  audio(frame: VoiceAudioFrame): Promise<void>
  close(reason: string): Promise<void>
}

export interface OracleVoiceBackendConnector {
  connect(options: {
    streamId: string
    output(message: OracleVoiceBackendOutput): Promise<void>
    disconnect(failure: OracleVoiceBackendDisconnect): Promise<void>
    signal?: AbortSignal
  }): Promise<OracleVoiceBackendConnection>
}

export interface OracleVoiceManager
  extends Pick<ManagerRouteAgent, 'snapshot' | 'send'> {
  cancelMessage(messageId: string): Promise<ManagerMessage>
}

interface OracleVoiceCoordinatorOptions {
  streamId: string
  manager: OracleVoiceManager
  managerEvents?: ManagerEventSource
  backend: OracleVoiceBackendConnector
  send(message: OracleVoiceBackendOutput): Promise<void>
  terminate(code: number, reason: string): void
  cancelTimeoutMs?: number
}

interface VoiceSubmission {
  generation: number
  completed?: boolean
}

interface QueuedSpeech {
  generation: number
  segmentId: string
  text: string
}

interface AudioGate {
  ready: Promise<void>
  release(): void
}

interface QueuedAudio {
  frame: VoiceAudioFrame
  bytes: number
  gate: AudioGate
  completion: AudioCompletion
}

interface AudioCompletion {
  done: Promise<void>
  settle(): void
}

type VoiceFinalControl = Extract<
  VoiceServerControl,
  { type: 'partial' | 'final' }
> & { type: 'final' }

export class OracleVoiceCoordinator {
  private readonly streamId: string
  private readonly manager: OracleVoiceManager
  private readonly managerEvents: ManagerEventSource | undefined
  private readonly backendConnector: OracleVoiceBackendConnector
  private readonly sendOutput: (message: OracleVoiceBackendOutput) => Promise<void>
  private readonly terminate: (code: number, reason: string) => void
  private readonly cancelTimeoutMs: number
  private readonly managerListener: (event: ManagerEvent) => void
  private readonly submissions = new Map<string, VoiceSubmission>()
  private readonly speechQueue: QueuedSpeech[] = []
  private operationTail: Promise<void> = Promise.resolve()
  private startPromise: Promise<void> | undefined
  private closePromise: Promise<void> | undefined
  private connection: OracleVoiceBackendConnection | undefined
  private turn: VoiceTurnState | undefined
  private defaults: ManagerClientDefaults | undefined
  private currentGeneration: number | undefined
  private activeReplyTo: string | undefined
  private segmenter: SpeakableSegmenter | undefined
  private segmenterMessageId: string | undefined
  private activeSpeech: QueuedSpeech | undefined
  private activeSpeechPlaybackThrough: number | undefined
  private speechPumpTimer: ReturnType<typeof setTimeout> | undefined
  private readonly audioQueue: QueuedAudio[] = []
  private readonly pendingAudio = new Set<QueuedAudio>()
  private readonly audioGates = new Set<AudioGate>()
  private audioGate: AudioGate = resolvedAudioGate()
  private audioDrainPromise: Promise<void> | undefined
  private maxPendingAudioBytes = 0
  private pendingAudioBytes = 0
  private failurePromise: Promise<void> | undefined
  private segmentSequence = 0
  private subscribed = false
  private clientStarted = false
  private closing = false
  private closed = false
  private backendFatalReported = false
  private readonly startAbortController = new AbortController()

  constructor(options: OracleVoiceCoordinatorOptions) {
    if (!options.streamId || options.streamId.length > 200) {
      throw new Error('A valid voice stream ID is required')
    }
    const cancelTimeoutMs = options.cancelTimeoutMs ?? DEFAULT_CANCEL_TIMEOUT_MS
    if (!Number.isSafeInteger(cancelTimeoutMs) || cancelTimeoutMs <= 0) {
      throw new RangeError('cancelTimeoutMs must be a positive safe integer')
    }
    this.streamId = options.streamId
    this.manager = options.manager
    this.managerEvents = options.managerEvents
    this.backendConnector = options.backend
    this.sendOutput = options.send
    this.terminate = options.terminate
    this.cancelTimeoutMs = cancelTimeoutMs
    this.managerListener = (event) => {
      void this.managerEvent(event).catch((error: unknown) => {
        void this.fail(
          'voice_coordinator_failed',
          errorMessage(error, 'Oracle voice coordination failed'),
          1011,
        ).catch(() => undefined)
      })
    }
  }

  start(): Promise<void> {
    this.startPromise ??= this.startConnection()
    return this.startPromise
  }

  receive(message: VoiceClientControl | VoiceAudioFrame): Promise<void> {
    if (this.closed || this.closing) return Promise.resolve()
    if (!('type' in message)) return this.receiveAudio(message)
    if (message.type === 'speech_end') {
      const audioBarrier = this.captureAudioBarrier(
        message.generation,
        this.audioGate,
      )
      return this.enqueue(() => this.handleReceive(
        message,
        resolvedAudioGate(),
        audioBarrier,
      ))
    }
    if (message.type !== 'speech_confirmed') {
      return this.enqueue(() => this.handleReceive(message))
    }
    const gate = this.createAudioGate()
    this.audioGate = gate
    return this.enqueue(async () => {
      try {
        await this.handleReceive(message, gate)
      } catch (error) {
        gate.release()
        throw error
      }
    })
  }

  managerEvent(event: ManagerEvent): Promise<void> {
    return this.enqueue(() => this.handleManagerEvent(event))
  }

  close(reason: string): Promise<void> {
    if (this.closePromise) return this.closePromise
    this.closing = true
    this.startAbortController.abort()
    this.clearAudioInput()
    const start = this.startPromise?.catch(() => undefined) ?? Promise.resolve()
    this.closePromise = start
      .then(() => this.finishClose(reason))
    this.operationTail = this.closePromise.catch(() => undefined)
    return this.closePromise
  }

  private async startConnection(): Promise<void> {
    const managerSnapshot = this.manager.snapshot()
    if (!managerSnapshot.available) {
      throw new Error(managerSnapshot.unavailableReason || 'Oracle is unavailable')
    }
    this.activeReplyTo = undefined
    if (this.managerEvents) {
      this.managerEvents.on('event', this.managerListener)
      this.subscribed = true
    }
    try {
      const connection = await this.backendConnector.connect({
        streamId: this.streamId,
        output: (message) => this.enqueue(() => this.handleBackendOutput(message)),
        disconnect: (failure) =>
          this.enqueue(() => this.handleBackendDisconnect(failure), true),
        signal: this.startAbortController.signal,
      })
      this.connection = connection
      const maxAudioSamples = Math.floor(
        connection.capabilities.sampleRate
        * connection.capabilities.limits.maxUtteranceMs
        / 1_000,
      )
      this.maxPendingAudioBytes = maxAudioSamples * Int16Array.BYTES_PER_ELEMENT
        + connection.capabilities.limits.maxQueueBytes
      this.turn = new VoiceTurnState({ maxAudioSamples })
      if (this.closing) {
        await this.finishClose('Oracle voice connection closed while starting')
        return
      }
      await this.sendOutput({
        type: 'hello',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: this.streamId,
        generation: 0,
        capabilities: connection.capabilities,
      })
    } catch (error) {
      const failure = backendDisconnectFromError(error)
      this.terminate(
        failure.retryable ? failure.code : terminalStartupCloseCode(failure.code),
        failure.reason,
      )
      await this.finishClose('Oracle voice failed to start')
      throw error
    }
  }

  private enqueue(
    operation: () => Promise<void>,
    allowClosing = false,
  ): Promise<void> {
    if (this.closed || (this.closing && !allowClosing)) {
      return Promise.resolve()
    }
    const queued = this.operationTail.catch(() => undefined).then(async () => {
      if (this.closed || (this.closing && !allowClosing)) return
      await operation()
    })
    this.operationTail = queued.catch(() => undefined)
    return queued
  }

  private async handleReceive(
    message: VoiceClientControl | VoiceAudioFrame,
    audioGate: AudioGate = resolvedAudioGate(),
    audioBarrier: Promise<void> = Promise.resolve(),
  ): Promise<void> {
    const connection = this.requireConnection()
    const turn = this.requireTurn()
    if (!('type' in message)) return
    if (
      message.protocol !== ORACLE_VOICE_PROTOCOL
      || message.streamId !== this.streamId
    ) {
      throw new Error('Voice control does not match this stream')
    }
    switch (message.type) {
      case 'start':
        if (this.clientStarted) throw new Error('Voice stream is already started')
        this.clientStarted = true
        this.currentGeneration = message.generation
        this.defaults = structuredClone(message.defaults)
        turn.advanceGeneration(message.generation)
        this.recoverVoiceSubmissions(message.generation)
        await connection.control(message)
        return
      case 'speech_tentative':
      case 'heartbeat':
        this.requireCurrentGeneration(message.generation)
        await connection.control(message)
        return
      case 'speech_confirmed':
        await this.confirmSpeech(message, connection, turn, audioGate)
        return
      case 'speech_end':
        this.requireCurrentGeneration(message.generation)
        turn.hintSpeechEnd(message.generation, message.utteranceId)
        await audioBarrier
        if (this.closed || this.closing) return
        this.requireCurrentGeneration(message.generation)
        await connection.control(message)
        return
      case 'stop':
        this.requireCurrentGeneration(message.generation)
        {
          const reason = message.reason || 'Browser stopped Oracle voice'
          await connection.control(message)
          this.terminate(1000, reason)
          await this.finishClose(reason)
        }
        return
      case 'cancel':
      case 'synthesize':
        throw new Error(`Browser voice clients may not send ${message.type}`)
    }
  }

  private async confirmSpeech(
    message: Extract<VoiceClientControl, { type: 'speech_confirmed' }>,
    connection: OracleVoiceBackendConnection,
    turn: VoiceTurnState,
    audioGate: AudioGate,
  ): Promise<void> {
    this.requireClientStarted()
    const previousGeneration = this.currentGeneration
    if (
      previousGeneration === undefined
      || message.generation !== previousGeneration + 1
    ) {
      throw new Error('Voice generation must increase by one for confirmed speech')
    }
    this.currentGeneration = message.generation
    turn.advanceGeneration(message.generation)
    const snapshot = this.manager.snapshot()
    const voiceMessageIds: string[] = []
    let capturedRunningVoice = false
    for (const [messageId, submission] of this.submissions) {
      if (submission.generation > previousGeneration) continue
      const submitted = snapshot.messages.find((candidate) =>
        candidate.id === messageId && candidate.role === 'user')
      if (submitted?.state === 'running') {
        voiceMessageIds.push(messageId)
        capturedRunningVoice = true
      } else if (submitted?.state === 'queued') {
        voiceMessageIds.push(messageId)
      } else if (submitted && ['done', 'failed', 'cancelled', 'interrupted'].includes(
        submitted.state ?? '',
      )) {
        this.submissions.delete(messageId)
      }
    }
    const speakingVoice = this.activeSpeech !== undefined || this.speechQueue.length > 0
    this.clearSpeechOutput()
    turn.confirmSpeech(message.generation, message.utteranceId)
    const backendCancellation = voiceMessageIds.length > 0 || speakingVoice
      ? connection.control(this.clientControl('cancel', previousGeneration, {}))
      : Promise.resolve()
    const backendConfirmation = connection.control(message)
    void backendCancellation.catch(() => undefined)
    void backendConfirmation.catch(() => undefined)
    try {
      await withTimeout(
        backendConfirmation,
        this.cancelTimeoutMs,
        'Voice speech confirmation timed out',
      )
    } catch (error) {
      await this.fail(
        'voice_backend_confirmation_failed',
        errorMessage(error, 'Voice speech confirmation failed'),
        1011,
      )
      throw error
    }
    audioGate.release()
    if (voiceMessageIds.length > 0 || speakingVoice) {
      try {
        if (voiceMessageIds.length > 0 || speakingVoice) {
          await withTimeout(
            backendCancellation,
            this.cancelTimeoutMs,
            'Voice synthesis cancellation timed out',
          )
        }
        for (const messageId of voiceMessageIds) {
          await withTimeout(
            this.manager.cancelMessage(messageId),
            this.cancelTimeoutMs,
            'Oracle message cancellation timed out',
          )
          this.submissions.delete(messageId)
        }
      } catch (error) {
        const timedOut = error instanceof OperationTimeoutError
        await this.fail(
          timedOut ? 'oracle_cancel_timeout' : 'oracle_cancel_failed',
          errorMessage(error, 'Oracle cancellation failed'),
          1011,
        )
        throw error
      }
      if (capturedRunningVoice || voiceMessageIds.length > 0) {
        this.activeReplyTo = undefined
      }
    }
    await backendConfirmation
  }

  private async handleBackendOutput(
    output: OracleVoiceBackendOutput,
  ): Promise<void> {
    if ('direction' in output) {
      if (
        output.direction === 'playback'
        && this.isActiveSpeech(output.generation, output.segmentId)
      ) {
        await this.sendOutput(output)
        const forwardedAt = Date.now()
        this.activeSpeechPlaybackThrough = Math.max(
          this.activeSpeechPlaybackThrough ?? forwardedAt,
          forwardedAt,
        ) + (
          output.samples.length / output.sampleRate * 1_000
        )
      }
      return
    }
    if (output.streamId !== this.streamId) {
      throw new Error('Voice backend output does not match this stream')
    }
    if (output.type === 'hello') return
    if (output.type === 'error') {
      if (output.generation === this.currentGeneration || output.fatal) {
        await this.sendOutput(output)
      }
      if (output.fatal) {
        this.backendFatalReported = true
        this.terminate(1011, output.message)
        this.scheduleClose(output.message)
      }
      return
    }
    if (output.generation !== this.currentGeneration) return
    switch (output.type) {
      case 'partial':
        if (!this.requireTurn().isActiveUtterance(
          output.generation,
          output.utteranceId,
        )) return
        await this.sendOutput(output)
        return
      case 'final':
        await this.submitFinal({ ...output, type: 'final' })
        return
      case 'audio_end':
        if (!this.isActiveSpeech(output.generation, output.segmentId)) return
        await this.sendOutput(output)
        const playbackDelayMs = this.remainingPlaybackDelayMs()
        this.activeSpeech = undefined
        this.activeSpeechPlaybackThrough = undefined
        if (playbackDelayMs > 0) {
          this.scheduleSpeechPump(playbackDelayMs, output.generation)
        } else {
          await this.pumpSpeech()
        }
        return
      case 'state':
      case 'heartbeat':
        await this.sendOutput(output)
    }
  }

  private async submitFinal(
    output: VoiceFinalControl,
  ): Promise<void> {
    const turn = this.requireTurn()
    let finalTranscript: ReturnType<VoiceTurnState['finalize']>
    try {
      finalTranscript = turn.finalize(
        output.generation,
        output.utteranceId,
        output.text,
      )
    } catch {
      return
    }
    const transcript = finalTranscript.transcript.trim()
    if (!turn.rememberSubmission(finalTranscript.utteranceId)) return
    if (!transcript) {
      await this.returnFinalToComposer(output, 'The final transcript was empty')
      return
    }
    const defaults = structuredClone(this.defaults ?? {})
    let message: ManagerMessage
    try {
      message = await this.manager.send(
        transcript,
        defaults,
        { answerOnly: true, source: 'voice' },
      )
    } catch (error) {
      await this.returnFinalToComposer(
        { ...output, text: transcript },
        `Could not send to Oracle: ${errorMessage(error, 'request failed')}`,
      )
      return
    }
    this.submissions.set(message.id, { generation: output.generation })
    if (message.state === 'running') this.activeReplyTo = message.id
    await this.sendState('thinking', output.generation)
  }

  private async returnFinalToComposer(
    output: VoiceFinalControl,
    message: string,
  ): Promise<void> {
    await this.sendOutput(output)
    await this.sendError('oracle_send_failed', message, false)
  }

  private async handleManagerEvent(event: ManagerEvent): Promise<void> {
    switch (event.type) {
      case 'manager.status':
        if (event.status === 'idle') await this.completeAssistantlessSubmissions()
        return
      case 'manager.delta':
        if (!this.clientStarted) return
        await this.consumeManagerDelta(event)
        return
      case 'manager.message':
        await this.consumeManagerMessage(event.message)
        return
      case 'manager.reset':
        this.activeReplyTo = undefined
        this.submissions.clear()
        this.clearSpeechOutput()
        return
      case 'manager.sessions':
      case 'manager.settings':
        return
    }
  }

  private async consumeManagerDelta(
    event: Extract<ManagerEvent, { type: 'manager.delta' }>,
  ): Promise<void> {
    const replyTo = this.activeReplyTo
    if (!replyTo) return
    const submission = this.submissions.get(replyTo)
    if (!submission || submission.generation !== this.currentGeneration) return
    if (this.segmenterMessageId && this.segmenterMessageId !== event.messageId) {
      return
    }
    this.segmenterMessageId ??= event.messageId
    this.segmenter ??= new SpeakableSegmenter(event.messageId)
    this.queueSpeech(
      this.segmenter.update(event.content),
      submission.generation,
    )
    await this.pumpSpeech()
  }

  private async consumeManagerMessage(message: ManagerMessage): Promise<void> {
    if (message.role === 'user') {
      if (message.state === 'running') {
        if (this.submissions.has(message.id)) {
          this.activeReplyTo = message.id
          this.segmenter = undefined
          this.segmenterMessageId = undefined
        } else if (message.source !== 'voice' && this.activeReplyTo) {
          const voiceMessageId = this.activeReplyTo
          const submission = this.submissions.get(voiceMessageId)
          if (submission?.completed) {
            this.submissions.delete(voiceMessageId)
            this.activeReplyTo = undefined
            if (
              submission.generation === this.currentGeneration
              && !this.segmenter
              && !this.segmenterMessageId
              && !this.activeSpeech
              && this.speechQueue.length === 0
              && !this.speechPumpTimer
            ) {
              await this.sendState('listening', submission.generation)
            }
          }
        }
      } else if (['done', 'failed', 'cancelled', 'interrupted'].includes(
        message.state ?? '',
      )) {
        const submission = this.submissions.get(message.id)
        if (message.state === 'done' && submission) {
          submission.completed = true
          return
        }
        this.submissions.delete(message.id)
        if (this.activeReplyTo === message.id) this.activeReplyTo = undefined
        if (
          message.state !== 'done'
          && submission
          && submission.generation === this.currentGeneration
        ) {
          this.clearSpeechOutput()
          await withTimeout(
            this.requireConnection().control(
              this.clientControl('cancel', submission.generation, {}),
            ),
            this.cancelTimeoutMs,
            'Voice synthesis cancellation timed out',
          )
        }
      }
      return
    }
    if (message.role !== 'assistant' || !message.replyTo) return
    const submission = this.submissions.get(message.replyTo)
    if (!submission) return
    if (submission.generation !== this.currentGeneration) {
      this.submissions.delete(message.replyTo)
      return
    }
    if (this.segmenterMessageId && this.segmenterMessageId !== message.id) return
    this.submissions.delete(message.replyTo)
    this.segmenterMessageId ??= message.id
    this.segmenter ??= new SpeakableSegmenter(message.id)
    const segments = this.segmenter.finalize(message.content)
    this.queueSpeech(segments, submission.generation)
    if (this.activeReplyTo === message.replyTo) this.activeReplyTo = undefined
    await this.pumpSpeech()
    if (
      segments.length === 0
      && !this.activeSpeech
      && this.speechQueue.length === 0
      && !this.speechPumpTimer
    ) {
      await this.sendState('listening', submission.generation)
    }
  }

  private async completeAssistantlessSubmissions(): Promise<void> {
    for (const [messageId, submission] of [...this.submissions]) {
      if (!submission.completed) continue
      if (submission.generation !== this.currentGeneration) {
        this.submissions.delete(messageId)
        if (this.activeReplyTo === messageId) this.activeReplyTo = undefined
        continue
      }
      if (
        this.activeReplyTo !== messageId
        || this.segmenter
        || this.segmenterMessageId
        || this.activeSpeech
        || this.speechQueue.length > 0
        || this.speechPumpTimer
      ) {
        continue
      }
      this.submissions.delete(messageId)
      this.activeReplyTo = undefined
      await this.sendState('listening', submission.generation)
    }
  }

  private queueSpeech(segments: string[], generation: number): void {
    for (const text of segments) {
      this.speechQueue.push({
        generation,
        segmentId: `${this.streamId}:${generation}:${this.segmentSequence++}`,
        text,
      })
    }
  }

  private async pumpSpeech(): Promise<void> {
    if (this.activeSpeech || this.speechPumpTimer || this.closed || this.closing) return
    while (
      this.speechQueue.length > 0
      && this.speechQueue[0].generation !== this.currentGeneration
    ) {
      this.speechQueue.shift()
    }
    const next = this.speechQueue.shift()
    if (!next) return
    this.activeSpeech = next
    this.activeSpeechPlaybackThrough = undefined
    try {
      await this.requireConnection().control(
        this.clientControl('synthesize', next.generation, {
          segmentId: next.segmentId,
          text: next.text,
        }),
      )
    } catch (error) {
      this.activeSpeech = undefined
      this.speechQueue.length = 0
      await this.sendError(
        'voice_synthesis_failed',
        errorMessage(error, 'Oracle speech synthesis failed'),
        false,
      )
    }
  }

  private async handleBackendDisconnect(
    failure: OracleVoiceBackendDisconnect,
  ): Promise<void> {
    if (this.closed) return
    if (!(failure.cause === 'worker' && this.backendFatalReported)) {
      await this.sendError(
        'voice_backend_disconnected',
        failure.reason || 'The selected voice computer disconnected',
        !failure.retryable,
      ).catch(() => undefined)
    }
    this.terminate(failure.code, failure.reason)
    await this.finishClose(failure.reason || 'Voice backend disconnected')
  }

  private async fail(
    code: string,
    message: string,
    closeCode: number,
  ): Promise<void> {
    if (this.closed) return
    if (this.failurePromise) return this.failurePromise
    this.failurePromise = (async () => {
      await this.sendError(code, message, true).catch(() => undefined)
      this.terminate(closeCode, message)
      await this.finishClose(message)
    })()
    return this.failurePromise
  }

  private async sendState(
    state: Extract<VoiceServerControl, { type: 'state' }>['state'],
    generation: number,
  ): Promise<void> {
    await this.sendOutput({
      type: 'state',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: this.streamId,
      generation,
      state,
    })
  }

  private async sendError(
    code: string,
    message: string,
    fatal: boolean,
  ): Promise<void> {
    await this.sendOutput({
      type: 'error',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: this.streamId,
      generation: this.currentGeneration ?? 0,
      code,
      message,
      fatal,
    })
  }

  private clientControl<T extends VoiceClientControl['type']>(
    type: T,
    generation: number,
    fields: Omit<
      Extract<VoiceClientControl, { type: T }>,
      'type' | 'protocol' | 'streamId' | 'generation'
    >,
  ): Extract<VoiceClientControl, { type: T }> {
    return {
      type,
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: this.streamId,
      generation,
      ...fields,
    } as Extract<VoiceClientControl, { type: T }>
  }

  private requireConnection(): OracleVoiceBackendConnection {
    if (!this.connection) throw new Error('Voice backend is not connected')
    return this.connection
  }

  private requireTurn(): VoiceTurnState {
    if (!this.turn) throw new Error('Voice coordinator has not started')
    return this.turn
  }

  private requireClientStarted(): void {
    if (!this.clientStarted || this.currentGeneration === undefined) {
      throw new Error('Voice stream has not started')
    }
  }

  private requireCurrentGeneration(generation: number): void {
    this.requireClientStarted()
    if (generation !== this.currentGeneration) {
      throw new Error('Voice generation does not match the active generation')
    }
  }

  private clearSpeechOutput(): void {
    if (this.speechPumpTimer) {
      clearTimeout(this.speechPumpTimer)
      this.speechPumpTimer = undefined
    }
    this.speechQueue.length = 0
    this.activeSpeech = undefined
    this.activeSpeechPlaybackThrough = undefined
    this.segmenter = undefined
    this.segmenterMessageId = undefined
  }

  private receiveAudio(frame: VoiceAudioFrame): Promise<void> {
    if (this.closed || this.closing || this.failurePromise) return Promise.resolve()
    try {
      this.requireConnection()
      const bytes = voiceAudioFrameByteLength(frame)
      if (
        bytes > this.maxPendingAudioBytes - this.pendingAudioBytes
      ) {
        return this.fail(
          'voice_input_backpressure',
          'Voice input queue is full',
          1013,
        )
      }
      this.pendingAudioBytes += bytes
      const queued = {
        frame,
        bytes,
        gate: this.audioGate,
        completion: audioCompletion(),
      }
      this.pendingAudio.add(queued)
      this.audioQueue.push(queued)
      this.startAudioDrain()
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  private remainingPlaybackDelayMs(): number {
    if (this.activeSpeechPlaybackThrough === undefined) return 0
    return Math.max(
      0,
      Math.ceil(this.activeSpeechPlaybackThrough - Date.now()),
    )
  }

  private createAudioGate(): AudioGate {
    let resolveReady!: () => void
    let released = false
    const gate: AudioGate = {
      ready: new Promise<void>((resolve) => {
        resolveReady = resolve
      }),
      release: () => {
        if (released) return
        released = true
        this.audioGates.delete(gate)
        resolveReady()
      },
    }
    this.audioGates.add(gate)
    return gate
  }

  private startAudioDrain(): void {
    if (this.audioDrainPromise || this.closed) return
    const draining = this.drainAudio()
    this.audioDrainPromise = draining.finally(() => {
      this.audioDrainPromise = undefined
      if (!this.closed && this.audioQueue.length > 0) this.startAudioDrain()
    })
    void this.audioDrainPromise.catch(() => undefined)
  }

  private async drainAudio(): Promise<void> {
    while (!this.closed && this.audioQueue.length > 0) {
      const queued = this.audioQueue.shift()!
      try {
        await queued.gate.ready
        if (this.closed || this.closing) continue
        this.requireClientStarted()
        let accepted: ReturnType<VoiceTurnState['acceptFrame']>
        try {
          accepted = this.requireTurn().acceptFrame(queued.frame)
        } catch (error) {
          throw new VoiceSessionError(
            errorMessage(error, 'Invalid microphone audio'),
            1008,
          )
        }
        if (!accepted.accepted) continue
        await this.requireConnection().audio(queued.frame)
      } catch (error) {
        await this.fail(
          'voice_audio_failed',
          errorMessage(error, 'Voice audio delivery failed'),
          error instanceof VoiceSessionError ? error.closeCode : 1011,
        )
        return
      } finally {
        this.pendingAudioBytes -= queued.bytes
        queued.completion.settle()
        this.pendingAudio.delete(queued)
      }
    }
  }

  private clearAudioInput(): void {
    for (const gate of [...this.audioGates]) gate.release()
    for (const queued of this.audioQueue.splice(0)) {
      this.pendingAudioBytes -= queued.bytes
      queued.completion.settle()
      this.pendingAudio.delete(queued)
    }
    for (const queued of this.pendingAudio) queued.completion.settle()
  }

  private captureAudioBarrier(
    generation: number,
    gate: AudioGate,
  ): Promise<void> {
    return Promise.all(
      [...this.pendingAudio]
        .filter((queued) =>
          queued.frame.generation === generation && queued.gate === gate)
        .map((queued) => queued.completion.done),
    ).then(() => undefined)
  }

  private scheduleSpeechPump(delayMs: number, generation: number): void {
    if (this.speechPumpTimer) clearTimeout(this.speechPumpTimer)
    this.speechPumpTimer = setTimeout(() => {
      this.speechPumpTimer = undefined
      void this.enqueue(async () => {
        if (generation !== this.currentGeneration) return
        await this.pumpSpeech()
      }).catch(() => undefined)
    }, delayMs)
  }

  private recoverVoiceSubmissions(generation: number): void {
    for (const message of this.manager.snapshot().messages) {
      if (
        message.role !== 'user'
        || message.source !== 'voice'
        || !['queued', 'running'].includes(message.state ?? '')
      ) {
        continue
      }
      this.submissions.set(message.id, { generation })
      if (message.state === 'running') this.activeReplyTo = message.id
    }
  }

  private isActiveSpeech(generation: number, segmentId: string): boolean {
    return generation === this.currentGeneration
      && this.activeSpeech?.generation === generation
      && this.activeSpeech.segmentId === segmentId
  }

  private scheduleClose(reason: string): void {
    const pendingOperation = this.operationTail
    void pendingOperation
      .catch(() => undefined)
      .then(() => this.close(reason))
      .catch(() => undefined)
  }

  private async finishClose(reason: string): Promise<void> {
    if (this.closed) return
    this.closing = true
    this.closed = true
    this.unsubscribeManager()
    this.clearSpeechOutput()
    this.clearAudioInput()
    this.submissions.clear()
    const connection = this.connection
    this.connection = undefined
    await connection?.close(reason).catch(() => undefined)
  }

  private unsubscribeManager(): void {
    if (!this.subscribed) return
    this.subscribed = false
    this.managerEvents?.off('event', this.managerListener)
  }
}

class OperationTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OperationTimeoutError'
  }
}

function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new OperationTimeoutError(message)), timeoutMs)
    timer.unref?.()
    operation.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function backendDisconnectFromError(error: unknown): OracleVoiceBackendDisconnect {
  if (isBackendDisconnect(error)) {
    return {
      code: error.code,
      reason: errorMessage(error, error.reason || 'Oracle voice backend disconnected'),
      retryable: error.retryable,
      cause: error.cause,
    }
  }
  if (error instanceof VoiceSessionError) {
    return {
      code: error.closeCode,
      reason: error.message,
      retryable: false,
      cause: disconnectCause(error.closeCode),
    }
  }
  const statusCode = typeof error === 'object' && error !== null
    ? Reflect.get(error, 'statusCode')
    : undefined
  if (statusCode === 409 || statusCode === 429) {
    return {
      code: 1013,
      reason: errorMessage(error, 'Voice backend rejected the connection'),
      retryable: false,
      cause: 'backpressure',
    }
  }
  if (statusCode === 401 || statusCode === 403) {
    return {
      code: 1008,
      reason: errorMessage(error, 'Voice backend authorization failed'),
      retryable: false,
      cause: 'policy',
    }
  }
  return {
    code: 1011,
    reason: errorMessage(error, 'Oracle voice backend failed'),
    retryable: false,
    cause: 'internal',
  }
}

function isBackendDisconnect(error: unknown): error is OracleVoiceBackendDisconnect {
  if (typeof error !== 'object' || error === null) return false
  return Number.isInteger(Reflect.get(error, 'code'))
    && typeof Reflect.get(error, 'reason') === 'string'
    && typeof Reflect.get(error, 'retryable') === 'boolean'
    && typeof Reflect.get(error, 'cause') === 'string'
}

function disconnectCause(code: number): VoiceBackendDisconnectCause {
  if (code === 1013) return 'backpressure'
  if (
    code === 1002
    || code === 1003
    || code === 1007
    || code === 1008
    || code === 1009
  ) {
    return 'protocol'
  }
  if (code === 1011) return 'internal'
  return 'policy'
}

function terminalStartupCloseCode(code: number): number {
  return code === 1000
    || code === 1002
    || code === 1003
    || code === 1007
    || code === 1008
    || code === 1009
    || code === 1013
    ? code
    : 1008
}

function resolvedAudioGate(): AudioGate {
  return {
    ready: Promise.resolve(),
    release: () => undefined,
  }
}

function audioCompletion(): AudioCompletion {
  let settle!: () => void
  let settled = false
  return {
    done: new Promise<void>((resolve) => {
      settle = resolve
    }),
    settle: () => {
      if (settled) return
      settled = true
      settle()
    },
  }
}
