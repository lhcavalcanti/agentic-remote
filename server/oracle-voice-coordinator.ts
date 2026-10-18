import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
} from '../shared/manager.js'
import {
  ORACLE_VOICE_PROTOCOL,
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
  }): Promise<OracleVoiceBackendConnection>
}

interface OracleVoiceManager
  extends Pick<ManagerRouteAgent, 'snapshot' | 'send' | 'cancel'> {}

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
}

interface QueuedSpeech {
  generation: number
  segmentId: string
  text: string
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
  private answerOnly = false
  private currentGeneration: number | undefined
  private activeReplyTo: string | undefined
  private segmenter: SpeakableSegmenter | undefined
  private segmenterMessageId: string | undefined
  private activeSpeech: QueuedSpeech | undefined
  private segmentSequence = 0
  private managerBusy = false
  private subscribed = false
  private clientStarted = false
  private closing = false
  private closed = false
  private backendFatalReported = false

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
    return this.enqueue(() => this.handleReceive(message))
  }

  managerEvent(event: ManagerEvent): Promise<void> {
    return this.enqueue(() => this.handleManagerEvent(event))
  }

  close(reason: string): Promise<void> {
    if (this.closePromise) return this.closePromise
    this.closing = true
    const start = this.startPromise?.catch(() => undefined) ?? Promise.resolve()
    const pendingOperations = this.operationTail
    this.closePromise = start
      .then(() => pendingOperations.catch(() => undefined))
      .then(() => this.finishClose(reason))
    this.operationTail = this.closePromise.catch(() => undefined)
    return this.closePromise
  }

  private async startConnection(): Promise<void> {
    const managerSnapshot = this.manager.snapshot()
    if (!managerSnapshot.available) {
      throw new Error(managerSnapshot.unavailableReason || 'Oracle is unavailable')
    }
    this.managerBusy = managerStatusIsBusy(managerSnapshot.status)
    this.activeReplyTo = managerSnapshot.messages.find(
      (message) => message.role === 'user' && message.state === 'running',
    )?.id
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
      })
      this.connection = connection
      const maxAudioSamples = Math.floor(
        connection.capabilities.sampleRate
        * connection.capabilities.limits.maxUtteranceMs
        / 1_000,
      )
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
  ): Promise<void> {
    const connection = this.requireConnection()
    const turn = this.requireTurn()
    if (!('type' in message)) {
      this.requireClientStarted()
      const accepted = turn.acceptFrame(message)
      if (!accepted.accepted) return
      await connection.audio(message)
      return
    }
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
        this.answerOnly = message.answerOnly
        turn.advanceGeneration(message.generation)
        await connection.control(message)
        return
      case 'speech_tentative':
      case 'heartbeat':
        this.requireCurrentGeneration(message.generation)
        await connection.control(message)
        return
      case 'speech_confirmed':
        await this.confirmSpeech(message, connection, turn)
        return
      case 'speech_end':
        this.requireCurrentGeneration(message.generation)
        turn.hintSpeechEnd(message.generation, message.utteranceId)
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
    const interrupting =
      this.managerBusy
      || this.activeReplyTo !== undefined
      || this.activeSpeech !== undefined
      || this.speechQueue.length > 0
    this.clearSpeechOutput()
    if (interrupting) {
      try {
        await withTimeout(
          connection.control(this.clientControl('cancel', previousGeneration, {})),
          this.cancelTimeoutMs,
          'Voice synthesis cancellation timed out',
        )
        await withTimeout(
          this.manager.cancel(),
          this.cancelTimeoutMs,
          'Oracle cancellation timed out',
        )
      } catch (error) {
        const timedOut = error instanceof OperationTimeoutError
        await this.fail(
          timedOut ? 'oracle_cancel_timeout' : 'oracle_cancel_failed',
          errorMessage(error, 'Oracle cancellation failed'),
          1011,
        )
        throw error
      }
      this.managerBusy = false
      this.activeReplyTo = undefined
    }
    turn.confirmSpeech(message.generation, message.utteranceId)
    await connection.control(message)
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
        this.activeSpeech = undefined
        await this.pumpSpeech()
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
        { answerOnly: this.answerOnly },
      )
    } catch (error) {
      await this.returnFinalToComposer(
        { ...output, text: transcript },
        `Could not send to Oracle: ${errorMessage(error, 'request failed')}`,
      )
      return
    }
    this.submissions.set(message.id, { generation: output.generation })
    this.managerBusy = true
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
        this.managerBusy = managerStatusIsBusy(event.status)
        return
      case 'manager.delta':
        if (!this.clientStarted) return
        await this.consumeManagerDelta(event)
        return
      case 'manager.message':
        await this.consumeManagerMessage(event.message)
        return
      case 'manager.reset':
        this.managerBusy = managerStatusIsBusy(event.snapshot.status)
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
        this.activeReplyTo = message.id
        this.segmenter = undefined
        this.segmenterMessageId = undefined
      } else if (['done', 'failed', 'cancelled', 'interrupted'].includes(
        message.state ?? '',
      )) {
        const submission = this.submissions.get(message.id)
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
    this.queueSpeech(
      this.segmenter.finalize(message.content),
      submission.generation,
    )
    if (this.activeReplyTo === message.replyTo) this.activeReplyTo = undefined
    await this.pumpSpeech()
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
    if (this.activeSpeech || this.closed || this.closing) return
    while (
      this.speechQueue.length > 0
      && this.speechQueue[0].generation !== this.currentGeneration
    ) {
      this.speechQueue.shift()
    }
    const next = this.speechQueue.shift()
    if (!next) return
    this.activeSpeech = next
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
    await this.sendError(code, message, true).catch(() => undefined)
    this.terminate(closeCode, message)
    await this.finishClose(message)
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
    this.speechQueue.length = 0
    this.activeSpeech = undefined
    this.segmenter = undefined
    this.segmenterMessageId = undefined
  }

  private isActiveSpeech(generation: number, segmentId: string): boolean {
    return generation === this.currentGeneration
      && this.activeSpeech?.generation === generation
      && this.activeSpeech.segmentId === segmentId
  }

  private scheduleClose(reason: string): void {
    void this.close(reason).catch(() => undefined)
  }

  private async finishClose(reason: string): Promise<void> {
    if (this.closed) return
    this.closing = true
    this.closed = true
    this.unsubscribeManager()
    this.clearSpeechOutput()
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

function managerStatusIsBusy(status: 'idle' | 'working' | 'recovering' | 'offline'): boolean {
  return status === 'working' || status === 'recovering'
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
