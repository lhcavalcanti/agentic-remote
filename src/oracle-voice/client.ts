import type { ManagerClientDefaults } from '../../shared/manager'
import {
  ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS,
  ORACLE_VOICE_CONNECTION_TIMEOUT_MS,
  ORACLE_VOICE_PROTOCOL,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  isVoiceServerControl,
  type VoiceAudioFrame,
  type VoiceCapabilities,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../../shared/oracle-voice'
import { hubFetch } from '../hub-sign-in'
import {
  VoiceCapture,
  VoiceCaptureError,
  type VoiceCaptureOptions,
} from './capture'
import {
  VoicePlayback,
  VoicePlaybackQueueError,
  type VoicePlaybackOptions,
} from './playback'

const RECONNECT_DELAYS_MS = [500, 1_000, 2_000, 4_000, 8_000] as const
const OPEN = 1
const CLIENT_NORMAL_CLOSE_CODE = 1000
const CLIENT_FATAL_CLOSE_CODE = 4000
const MAX_CLOSE_REASON_BYTES = 123
const UTF8_ENCODER = new TextEncoder()

export type OracleVoiceUiState =
  | 'off'
  | 'starting'
  | 'listening'
  | 'speech'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'interrupted'
  | 'reconnecting'
  | 'error'

export type OracleVoiceClientErrorCode =
  | 'capability-unavailable'
  | 'ticket-failed'
  | 'protocol-mismatch'
  | 'socket-failed'
  | 'slow-consumer'
  | 'slow-producer'
  | 'utterance-limit'
  | 'capture-failed'
  | 'playback-failed'
  | 'server-error'

export class OracleVoiceClientError extends Error {
  readonly code: OracleVoiceClientErrorCode
  readonly fatal: boolean
  readonly dictationFallback: boolean

  constructor(
    code: OracleVoiceClientErrorCode,
    message: string,
    options: { fatal?: boolean; dictationFallback?: boolean } = {},
  ) {
    super(message)
    this.name = 'OracleVoiceClientError'
    this.code = code
    this.fatal = options.fatal ?? true
    this.dictationFallback = options.dictationFallback ?? false
  }
}

export interface OracleVoiceTranscriptEvent {
  generation: number
  utteranceId: string
  text: string
}

export interface OracleVoiceSocket {
  readonly CONNECTING: number
  readonly OPEN: number
  readonly CLOSING: number
  readonly CLOSED: number
  readyState: number
  bufferedAmount: number
  binaryType: BinaryType
  onopen: ((event: Event) => void) | null
  onmessage: ((event: MessageEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onclose: ((event: CloseEvent) => void) | null
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
  close(code?: number, reason?: string): void
}

interface OracleVoiceCapture {
  start(): Promise<void>
  stop(): Promise<void>
}

interface OracleVoicePlayback {
  start(): Promise<void>
  enqueue(frame: VoiceAudioFrame): boolean
  tentativeSpeech(): void
  restoreAfterMisfire(): void
  cancelCurrent(): void
  confirmSpeech(generation: number): boolean
  endSegment(generation: number, segmentId: string): Promise<boolean>
  close(): Promise<void>
}

export interface OracleVoiceClientDependencies {
  fetch(input: string, init?: RequestInit): Promise<Response>
  createSocket(url: string): OracleVoiceSocket
  createCapture(options: VoiceCaptureOptions): OracleVoiceCapture
  createPlayback(options: VoicePlaybackOptions): OracleVoicePlayback
  setTimeout(
    callback: () => void,
    delay: number,
  ): ReturnType<typeof globalThis.setTimeout>
  clearTimeout(timer: ReturnType<typeof globalThis.setTimeout>): void
  baseUrl(): URL
}

export interface OracleVoiceClientOptions {
  language: string
  defaults: ManagerClientDefaults
  answerOnly: boolean
  dependencies?: Partial<OracleVoiceClientDependencies>
  onState?(state: OracleVoiceUiState): void
  onPartial?(event: OracleVoiceTranscriptEvent): void
  onFinal?(event: OracleVoiceTranscriptEvent): void
  onRestore?(event: OracleVoiceTranscriptEvent): void
  onError?(error: OracleVoiceClientError): void
}

interface VoiceTicketResponse {
  ticket: string
  expiresAt: string
}

interface PendingHello {
  cancel(): void
}

export class OracleVoiceClient {
  private readonly language: string
  private readonly defaults: ManagerClientDefaults
  private readonly answerOnly: boolean
  private readonly dependencies: OracleVoiceClientDependencies
  private readonly onState: (state: OracleVoiceUiState) => void
  private readonly onPartial: (event: OracleVoiceTranscriptEvent) => void
  private readonly onFinal: (event: OracleVoiceTranscriptEvent) => void
  private readonly onRestore: (event: OracleVoiceTranscriptEvent) => void
  private readonly onError: (error: OracleVoiceClientError) => void
  private state: OracleVoiceUiState = 'off'
  private generation = 0
  private connectionEpoch = 0
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof globalThis.setTimeout> | undefined
  private pendingHello: PendingHello | undefined
  private startPromise: Promise<void> | undefined
  private socket: OracleVoiceSocket | undefined
  private streamId: string | undefined
  private capabilities: VoiceCapabilities | undefined
  private capture: OracleVoiceCapture | undefined
  private playback: OracleVoicePlayback | undefined
  private mediaTeardownPromise: Promise<void> | undefined
  private stateBeforeTentative: OracleVoiceUiState | undefined
  private captureReady = false
  private manuallyStopped = true
  private terminalFailure = false
  private hasStarted = false
  private lastAcknowledgedHeartbeat: number | undefined
  private currentPlaybackSegmentId: string | undefined
  private playbackDrainRevision = 0
  private speakingRevision = 0

  constructor(options: OracleVoiceClientOptions) {
    if (!options.language.trim()) throw new Error('Oracle voice language is required')
    this.language = options.language
    this.defaults = structuredClone(options.defaults)
    this.answerOnly = options.answerOnly
    this.dependencies = {
      fetch: options.dependencies?.fetch ?? hubFetch,
      createSocket: options.dependencies?.createSocket
        ?? ((url) => new WebSocket(url)),
      createCapture: options.dependencies?.createCapture
        ?? ((captureOptions) => new VoiceCapture(captureOptions)),
      createPlayback: options.dependencies?.createPlayback
        ?? ((playbackOptions) => new VoicePlayback(playbackOptions)),
      setTimeout: options.dependencies?.setTimeout
        ?? ((callback, delay) => globalThis.setTimeout(callback, delay)),
      clearTimeout: options.dependencies?.clearTimeout
        ?? ((timer) => globalThis.clearTimeout(timer)),
      baseUrl: options.dependencies?.baseUrl
        ?? (() => new URL(globalThis.location.href)),
    }
    this.onState = options.onState ?? (() => undefined)
    this.onPartial = options.onPartial ?? (() => undefined)
    this.onFinal = options.onFinal ?? (() => undefined)
    this.onRestore = options.onRestore ?? (() => undefined)
    this.onError = options.onError ?? (() => undefined)
  }

  get currentState(): OracleVoiceUiState {
    return this.state
  }

  get currentGeneration(): number {
    return this.generation
  }

  start(): Promise<void> {
    if (this.startPromise && !this.manuallyStopped) return this.startPromise
    if (!this.manuallyStopped && this.state !== 'error') return Promise.resolve()
    this.manuallyStopped = false
    this.terminalFailure = false
    this.reconnectAttempt = 0
    this.cancelReconnect()
    if (this.hasStarted) this.advanceGeneration()
    this.hasStarted = true
    this.setState('starting')
    const epoch = ++this.connectionEpoch
    const playbackReady = this.preparePlayback()
    const starting = this.establish(epoch, playbackReady)
      .catch(async (error: unknown) => {
        const failure = clientError(error)
        const ownsConnection = epoch === this.connectionEpoch
        if (ownsConnection) {
          await this.teardownConnection(CLIENT_FATAL_CLOSE_CODE, failure.message)
        }
        if (
          this.manuallyStopped
          || !ownsConnection
          || this.state === 'reconnecting'
        ) return
        if (!this.terminalFailure) {
          this.terminalFailure = true
          this.report(failure)
          this.setState('error')
        }
        throw failure
      })
      .finally(() => {
        if (this.startPromise === starting) this.startPromise = undefined
      })
    this.startPromise = starting
    return starting
  }

  async stop(): Promise<void> {
    this.manuallyStopped = true
    this.terminalFailure = false
    this.connectionEpoch += 1
    this.cancelReconnect()
    this.cancelHelloWait()
    const socket = this.socket
    const streamId = this.streamId
    if (socket && streamId && socket.readyState === OPEN) {
      try {
        socket.send(JSON.stringify({
          type: 'stop',
          protocol: ORACLE_VOICE_PROTOCOL,
          streamId,
          generation: this.generation,
          reason: 'Conversation stopped',
        } satisfies VoiceClientControl))
      } catch {
        // Closing the local resources is authoritative even if the peer vanished.
      }
    }
    await this.teardownConnection(
      CLIENT_NORMAL_CLOSE_CODE,
      'Conversation stopped',
    )
    this.capabilities = undefined
    this.streamId = undefined
    this.setState('off')
  }

  private async establish(
    epoch: number,
    playbackReady: Promise<void>,
  ): Promise<void> {
    const [capabilities] = await Promise.all([
      this.fetchCapabilities(),
      playbackReady,
    ])
    this.requireEpoch(epoch)
    const ticket = await this.fetchTicket()
    this.requireEpoch(epoch)

    const socket = this.dependencies.createSocket(this.socketUrl(ticket.ticket))
    socket.binaryType = 'arraybuffer'
    this.socket = socket
    this.capabilities = capabilities
    const hello = await this.waitForHello(socket, epoch)
    this.requireEpoch(epoch)
    this.streamId = hello.streamId
    this.lastAcknowledgedHeartbeat = undefined
    this.capabilities = hello.capabilities
    this.sendControl({
      type: 'start',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: hello.streamId,
      generation: this.generation,
      language: this.language,
      defaults: structuredClone(this.defaults),
      answerOnly: this.answerOnly,
    })

    const capture = this.dependencies.createCapture({
      streamId: hello.streamId,
      initialGeneration: this.generation,
      maxQueueBytes: hello.capabilities.limits.maxQueueBytes,
      maxUtteranceMs: hello.capabilities.limits.maxUtteranceMs,
      sendControl: (control) => this.sendControl(control),
      sendAudio: (frame) => this.sendAudio(frame),
      onTentativeSpeech: () => this.handleTentativeSpeech(),
      onSpeechConfirmed: (generation) => this.handleConfirmedSpeech(generation),
      onVadMisfire: () => this.handleVadMisfire(),
      onUtteranceLimit: (maxUtteranceMs) => {
        this.report(new OracleVoiceClientError(
          'utterance-limit',
          `Conversation submitted the first ${Math.floor(maxUtteranceMs / 1_000)} seconds of speech.`,
          { fatal: false },
        ))
      },
      onError: (error) => {
        void this.failFatal(captureClientError(error))
      },
    })
    this.capture = capture
    this.captureReady = false
    await capture.start()
    this.requireEpoch(epoch)
    this.captureReady = true
    this.reconnectAttempt = 0
    this.setState('listening')
  }

  private waitForHello(
    socket: OracleVoiceSocket,
    epoch: number,
  ): Promise<Extract<VoiceServerControl, { type: 'hello' }>> {
    return new Promise((resolve, reject) => {
      let settled = false
      let timeout: ReturnType<typeof globalThis.setTimeout> | undefined
      const cleanup = (pending: PendingHello) => {
        if (timeout !== undefined) {
          this.dependencies.clearTimeout(timeout)
          timeout = undefined
        }
        if (this.pendingHello === pending) this.pendingHello = undefined
      }
      const pending: PendingHello = {
        cancel: () => {
          rejectBeforeHello(new OracleVoiceClientError(
            'socket-failed',
            'Oracle voice connection was superseded',
            { fatal: false },
          ))
        },
      }
      const resolveHello = (
        hello: Extract<VoiceServerControl, { type: 'hello' }>,
      ) => {
        if (settled) return
        settled = true
        cleanup(pending)
        resolve(hello)
      }
      function rejectBeforeHello(error: OracleVoiceClientError) {
        if (settled) return
        settled = true
        cleanup(pending)
        reject(error)
      }
      this.cancelHelloWait()
      this.pendingHello = pending
      timeout = this.dependencies.setTimeout(() => {
        rejectBeforeHello(new OracleVoiceClientError(
          'socket-failed',
          'Oracle voice did not send hello before the connection timed out',
          { fatal: false },
        ))
      }, ORACLE_VOICE_CONNECTION_TIMEOUT_MS)
      socket.onerror = () => {
        rejectBeforeHello(new OracleVoiceClientError(
          'socket-failed',
          'Oracle voice connection failed before it was ready',
          { fatal: false },
        ))
      }
      socket.onclose = (event) => {
        if (!settled) {
          rejectBeforeHello(closeError(event))
          return
        }
        void this.handleSocketClose(socket, event)
      }
      socket.onmessage = (event) => {
        if (epoch !== this.connectionEpoch || socket !== this.socket) return
        if (!settled) {
          try {
            const hello = parseHello(event.data)
            resolveHello(hello)
          } catch (error) {
            rejectBeforeHello(clientError(error))
          }
          return
        }
        void this.handleSocketMessage(socket, event)
      }
    })
  }

  private async handleSocketMessage(
    socket: OracleVoiceSocket,
    event: MessageEvent,
  ): Promise<void> {
    if (socket !== this.socket || this.manuallyStopped || this.terminalFailure) return
    try {
      if (typeof event.data === 'string') {
        const parsed = JSON.parse(event.data) as unknown
        if (!isVoiceServerControl(parsed) || parsed.type === 'hello') {
          throw new OracleVoiceClientError(
            'protocol-mismatch',
            'Oracle voice sent an invalid control message',
          )
        }
        await this.handleServerControl(parsed)
        return
      }
      const payload = event.data instanceof ArrayBuffer
        ? event.data
        : event.data instanceof Blob
          ? await event.data.arrayBuffer()
          : undefined
      if (!payload) {
        throw new OracleVoiceClientError(
          'protocol-mismatch',
          'Oracle voice sent an unsupported binary message',
        )
      }
      const frame = decodeVoiceAudioFrame(payload)
      if (frame.direction !== 'playback') {
        throw new OracleVoiceClientError(
          'protocol-mismatch',
          'Oracle voice sent microphone audio to the browser',
        )
      }
      if (frame.generation < this.generation) return
      if (frame.generation > this.generation) {
        throw new OracleVoiceClientError(
          'protocol-mismatch',
          'Oracle voice audio generation is ahead of the browser',
        )
      }
      const accepted = this.playback?.enqueue(frame) ?? false
      if (accepted) this.currentPlaybackSegmentId = frame.segmentId
    } catch (error) {
      const failure = error instanceof VoicePlaybackQueueError
        ? new OracleVoiceClientError(
            'slow-consumer',
            'Streaming playback exceeded the browser queue limit',
          )
        : error instanceof OracleVoiceClientError
          ? error
          : new OracleVoiceClientError(
              'playback-failed',
              error instanceof Error ? error.message : String(error),
            )
      await this.failFatal(failure)
    }
  }

  private async handleServerControl(control: VoiceServerControl): Promise<void> {
    if (control.streamId !== this.streamId) return
    if (control.type === 'error' && control.fatal) {
      await this.failFatal(new OracleVoiceClientError(
        'server-error',
        control.message,
      ))
      return
    }
    if (control.generation > this.generation) {
      throw new OracleVoiceClientError(
        'protocol-mismatch',
        'Oracle voice control generation is ahead of the browser',
      )
    }
    if (control.type === 'transcript_restore') {
      this.onRestore(transcriptEvent(control))
      return
    }
    if (control.generation < this.generation) return
    switch (control.type) {
      case 'partial':
        this.setState('transcribing')
        this.onPartial(transcriptEvent(control))
        return
      case 'final':
        this.onFinal(transcriptEvent(control))
        this.setState('thinking')
        return
      case 'state':
        await this.applyServerState(control.state)
        return
      case 'audio_end':
        this.handlePlaybackEnd(control.generation, control.segmentId)
        return
      case 'error':
        this.report(new OracleVoiceClientError(
          'server-error',
          control.message,
          { fatal: false },
        ))
        return
      case 'heartbeat':
        if (control.timestamp === this.lastAcknowledgedHeartbeat) return
        this.lastAcknowledgedHeartbeat = control.timestamp
        this.sendControl({
          type: 'heartbeat',
          protocol: ORACLE_VOICE_PROTOCOL,
          streamId: this.streamId,
          generation: this.generation,
          timestamp: control.timestamp,
        })
        return
      case 'hello':
        throw new OracleVoiceClientError(
          'protocol-mismatch',
          'Oracle voice sent a duplicate hello',
        )
    }
  }

  private async handleSocketClose(
    socket: OracleVoiceSocket,
    event: CloseEvent,
  ): Promise<void> {
    if (socket !== this.socket) return
    this.detachSocket(socket)
    this.connectionEpoch += 1
    await this.teardownMedia()
    if (this.manuallyStopped || this.terminalFailure) return
    if (terminalCloseCode(event.code)) {
      const failure = event.code === 1013
        ? new OracleVoiceClientError(
            'slow-consumer',
            event.reason || 'Streaming playback could not keep up',
          )
        : closeError(event)
      this.terminalFailure = true
      this.report(failure)
      this.setState('error')
      return
    }
    this.setState('reconnecting')
    this.scheduleReconnect()
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== undefined || this.manuallyStopped || this.terminalFailure) {
      return
    }
    const delay = RECONNECT_DELAYS_MS[
      Math.min(this.reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)
    ]
    this.reconnectAttempt += 1
    this.reconnectTimer = this.dependencies.setTimeout(() => {
      this.reconnectTimer = undefined
      void this.runReconnect()
    }, delay)
  }

  private async runReconnect(): Promise<void> {
    if (this.manuallyStopped || this.terminalFailure) return
    this.advanceGeneration()
    const epoch = ++this.connectionEpoch
    const playbackReady = this.preparePlayback()
    try {
      await this.establish(epoch, playbackReady)
    } catch (error) {
      if (epoch !== this.connectionEpoch) return
      const failure = clientError(error)
      await this.teardownConnection(CLIENT_FATAL_CLOSE_CODE, failure.message)
      if (this.manuallyStopped || this.terminalFailure) return
      if (
        failure.fatal
        || failure.code === 'protocol-mismatch'
        || (
          failure.dictationFallback
          && failure.code !== 'capability-unavailable'
        )
      ) {
        this.terminalFailure = true
        this.report(failure)
        this.setState('error')
        return
      }
      this.report(new OracleVoiceClientError(
        failure.code,
        failure.message,
        { fatal: false, dictationFallback: failure.dictationFallback },
      ))
      this.setState('reconnecting')
      this.scheduleReconnect()
    }
  }

  private handleTentativeSpeech(): void {
    this.stateBeforeTentative = this.state
    try {
      this.playback?.tentativeSpeech()
      this.setState('speech')
    } catch (error) {
      void this.failFatal(new OracleVoiceClientError(
        'playback-failed',
        error instanceof Error ? error.message : String(error),
      ))
    }
  }

  private handleConfirmedSpeech(generation: number): void {
    if (generation !== this.generation + 1) {
      void this.failFatal(new OracleVoiceClientError(
        'protocol-mismatch',
        'Microphone generation did not advance by one',
      ))
      return
    }
    this.generation = generation
    try {
      this.invalidatePlaybackDrain()
      this.playback?.confirmSpeech(generation)
      const interrupted = this.stateBeforeTentative === 'speaking'
        || this.stateBeforeTentative === 'thinking'
      this.stateBeforeTentative = undefined
      this.setState(interrupted ? 'interrupted' : 'speech')
    } catch (error) {
      void this.failFatal(new OracleVoiceClientError(
        'playback-failed',
        error instanceof Error ? error.message : String(error),
      ))
    }
  }

  private handleVadMisfire(): void {
    try {
      this.playback?.restoreAfterMisfire()
      const restore = this.stateBeforeTentative
      this.stateBeforeTentative = undefined
      this.setState(
        restore && restore !== 'speech' && restore !== 'interrupted'
          ? restore
          : 'listening',
      )
    } catch (error) {
      void this.failFatal(new OracleVoiceClientError(
        'playback-failed',
        error instanceof Error ? error.message : String(error),
      ))
    }
  }

  private async applyServerState(
    state: Extract<VoiceServerControl, { type: 'state' }>['state'],
  ): Promise<void> {
    switch (state) {
      case 'ready':
      case 'listening':
        if (!this.captureReady) return
        this.playbackDrainRevision += 1
        this.currentPlaybackSegmentId = undefined
        this.playback?.cancelCurrent()
        this.setAuthoritativeState('listening')
        return
      case 'recognizing':
        this.setAuthoritativeState('transcribing')
        return
      case 'thinking':
        this.setAuthoritativeState('thinking')
        return
      case 'speaking':
        this.speakingRevision += 1
        this.currentPlaybackSegmentId = undefined
        this.setAuthoritativeState('speaking')
        return
      case 'stopped':
        await this.handleServerStopped()
    }
  }

  private async handleServerStopped(): Promise<void> {
    this.manuallyStopped = true
    this.terminalFailure = false
    this.connectionEpoch += 1
    this.cancelReconnect()
    this.cancelHelloWait()
    await this.teardownConnection(
      CLIENT_NORMAL_CLOSE_CODE,
      'Voice stream stopped',
    )
    this.capabilities = undefined
    this.setState('off')
  }

  private handlePlaybackEnd(generation: number, segmentId: string): void {
    const playback = this.playback
    if (!playback) return
    const drainRevision = this.playbackDrainRevision
    const speakingRevision = this.speakingRevision
    let drained: Promise<boolean>
    try {
      drained = playback.endSegment(generation, segmentId)
    } catch (error) {
      void this.failFatal(playbackClientError(error))
      return
    }
    void drained.then((completed) => {
      const canDrainDuringTentativeSpeech = this.state === 'speech'
        && this.stateBeforeTentative === 'speaking'
      if (
        !completed
        || playback !== this.playback
        || drainRevision !== this.playbackDrainRevision
        || speakingRevision !== this.speakingRevision
        || generation !== this.generation
        || (
          this.currentPlaybackSegmentId !== undefined
          && segmentId !== this.currentPlaybackSegmentId
        )
        || (this.state !== 'speaking' && !canDrainDuringTentativeSpeech)
      ) {
        return
      }
      this.currentPlaybackSegmentId = undefined
      this.setAuthoritativeState('listening')
    }).catch((error: unknown) => {
      void this.failFatal(playbackClientError(error))
    })
  }

  private setAuthoritativeState(state: OracleVoiceUiState): void {
    if (this.state === 'speech' && this.stateBeforeTentative !== undefined) {
      this.stateBeforeTentative = state
      return
    }
    this.setState(state)
  }

  private sendControl(control: VoiceClientControl): void {
    if (control.streamId !== this.streamId) {
      throw new OracleVoiceClientError(
        'protocol-mismatch',
        'Microphone control belongs to an obsolete voice stream',
      )
    }
    if (control.generation !== this.generation) {
      throw new OracleVoiceClientError(
        'protocol-mismatch',
        'Microphone control belongs to an obsolete voice generation',
      )
    }
    this.sendPayload(JSON.stringify(control))
  }

  private sendAudio(frame: VoiceAudioFrame): void {
    if (frame.direction !== 'microphone' || frame.generation !== this.generation) {
      throw new OracleVoiceClientError(
        'protocol-mismatch',
        'Microphone audio belongs to an obsolete voice generation',
      )
    }
    this.sendPayload(encodeVoiceAudioFrame(frame))
  }

  private sendPayload(payload: string | ArrayBuffer): void {
    const socket = this.socket
    const limit = this.capabilities?.limits.maxQueueBytes
    if (!socket || socket.readyState !== OPEN || !limit) {
      throw new OracleVoiceClientError(
        'socket-failed',
        'Oracle voice is not connected',
        { fatal: false },
      )
    }
    const bytes = typeof payload === 'string'
      ? new TextEncoder().encode(payload).byteLength
      : payload.byteLength
    if (bytes > limit || socket.bufferedAmount > limit - bytes) {
      const failure = new OracleVoiceClientError(
        'slow-producer',
        'Microphone audio could not be sent fast enough',
      )
      void this.failFatal(failure)
      throw failure
    }
    socket.send(payload)
  }

  private preparePlayback(): Promise<void> {
    try {
      const playback = this.dependencies.createPlayback({
        initialGeneration: this.generation,
        maxQueuedSeconds: ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS,
      })
      this.playback = playback
      return playback.start().catch((error: unknown) => {
        throw playbackClientError(error)
      })
    } catch (error) {
      return Promise.reject(playbackClientError(error))
    }
  }

  private async failFatal(
    error: OracleVoiceClientError,
  ): Promise<void> {
    if (this.terminalFailure) return
    this.terminalFailure = true
    this.cancelReconnect()
    this.report(error)
    this.cancelHelloWait()
    await this.teardownConnection(CLIENT_FATAL_CLOSE_CODE, error.message)
    this.capabilities = undefined
    this.setState('error')
  }

  private async fetchCapabilities(): Promise<VoiceCapabilities> {
    const response = await this.dependencies.fetch('/api/oracle-voice/capabilities', {
      headers: { accept: 'application/json' },
    })
    const payload = await response.json().catch(() => undefined) as unknown
    if (!response.ok || !isCapabilities(payload)) {
      throw new OracleVoiceClientError(
        'capability-unavailable',
        response.ok
          ? 'Oracle voice returned invalid capabilities'
          : responseMessage(payload, `Oracle voice capabilities failed (${response.status})`),
        { fatal: false, dictationFallback: true },
      )
    }
    if (payload.protocol !== ORACLE_VOICE_PROTOCOL) {
      throw new OracleVoiceClientError(
        'protocol-mismatch',
        'Oracle voice protocol does not match this browser',
        { dictationFallback: true },
      )
    }
    if (!payload.available) {
      throw new OracleVoiceClientError(
        'capability-unavailable',
        payload.reason || 'Conversation mode is unavailable',
        { fatal: false, dictationFallback: true },
      )
    }
    return payload
  }

  private async fetchTicket(): Promise<VoiceTicketResponse> {
    const response = await this.dependencies.fetch('/api/oracle-voice/tickets', {
      method: 'POST',
      headers: { accept: 'application/json' },
    })
    const payload = await response.json().catch(() => undefined) as unknown
    if (!response.ok || !isTicket(payload)) {
      throw new OracleVoiceClientError(
        'ticket-failed',
        responseMessage(payload, `Oracle voice ticket failed (${response.status})`),
        { fatal: false },
      )
    }
    return payload
  }

  private socketUrl(ticket: string): string {
    const url = new URL('/api/oracle-voice', this.dependencies.baseUrl())
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.searchParams.set('ticket', ticket)
    return url.toString()
  }

  private async teardownConnection(
    closeCode = CLIENT_NORMAL_CLOSE_CODE,
    reason = 'Voice connection reset',
  ): Promise<void> {
    const socket = this.socket
    this.cancelHelloWait()
    this.detachSocket(socket)
    try {
      await this.teardownMedia()
    } finally {
      if (socket && socket.readyState !== socket.CLOSED) {
        try {
          socket.close(closeCode, closeReason(reason))
        } catch {
          // Local media teardown remains authoritative if the browser rejects close().
        }
      }
    }
  }

  private teardownMedia(): Promise<void> {
    if (this.mediaTeardownPromise) return this.mediaTeardownPromise
    const capture = this.capture
    const playback = this.playback
    this.capture = undefined
    this.playback = undefined
    this.invalidatePlaybackDrain()
    this.captureReady = false
    this.stateBeforeTentative = undefined
    // Defer resource shutdown until callers can observe the shared promise.
    const teardown = Promise.resolve()
      .then(async () => {
        await Promise.all([
          (async () => {
            try {
              await capture?.stop()
            } catch {
              // Continue closing the remaining local resources.
            }
          })(),
          (async () => {
            try {
              await playback?.close()
            } catch {
              // Continue closing the remaining local resources.
            }
          })(),
        ])
      })
      .finally(() => {
        if (this.mediaTeardownPromise === teardown) {
          this.mediaTeardownPromise = undefined
        }
      })
    this.mediaTeardownPromise = teardown
    return teardown
  }

  private detachSocket(socket: OracleVoiceSocket | undefined): void {
    if (!socket) return
    this.lastAcknowledgedHeartbeat = undefined
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null
    if (this.socket === socket) {
      this.socket = undefined
      this.streamId = undefined
    }
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer === undefined) return
    this.dependencies.clearTimeout(this.reconnectTimer)
    this.reconnectTimer = undefined
  }

  private cancelHelloWait(): void {
    const pending = this.pendingHello
    if (!pending) return
    this.pendingHello = undefined
    pending.cancel()
  }

  private advanceGeneration(): void {
    if (this.generation === 0xffff_ffff) this.generation = 0
    else this.generation += 1
  }

  private invalidatePlaybackDrain(): void {
    this.playbackDrainRevision += 1
    this.currentPlaybackSegmentId = undefined
  }

  private requireEpoch(epoch: number): void {
    if (
      epoch !== this.connectionEpoch
      || this.manuallyStopped
      || this.terminalFailure
    ) {
      throw new OracleVoiceClientError(
        'socket-failed',
        'Oracle voice connection was superseded',
        { fatal: false },
      )
    }
  }

  private setState(state: OracleVoiceUiState): void {
    if (this.state === state) return
    this.state = state
    this.onState(state)
  }

  private report(error: OracleVoiceClientError): void {
    this.onError(error)
  }
}

function parseHello(data: unknown): Extract<VoiceServerControl, { type: 'hello' }> {
  if (typeof data !== 'string') {
    throw new OracleVoiceClientError(
      'protocol-mismatch',
      'Oracle voice did not begin with a JSON hello',
    )
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(data) as unknown
  } catch {
    throw new OracleVoiceClientError(
      'protocol-mismatch',
      'Oracle voice hello was not valid JSON',
    )
  }
  if (
    !isRecord(parsed)
    || parsed.protocol !== ORACLE_VOICE_PROTOCOL
    || !isVoiceServerControl(parsed)
    || parsed.type !== 'hello'
  ) {
    throw new OracleVoiceClientError(
      'protocol-mismatch',
      'Oracle voice protocol does not match this browser',
    )
  }
  if (!parsed.capabilities.available) {
    throw new OracleVoiceClientError(
      'capability-unavailable',
      parsed.capabilities.reason || 'Conversation mode is unavailable',
      { fatal: false, dictationFallback: true },
    )
  }
  return parsed
}

function transcriptEvent(
  control: Extract<
    VoiceServerControl,
    { type: 'partial' | 'final' | 'transcript_restore' }
  >,
): OracleVoiceTranscriptEvent {
  return {
    generation: control.generation,
    utteranceId: control.utteranceId,
    text: control.text,
  }
}

function closeError(event: CloseEvent): OracleVoiceClientError {
  return new OracleVoiceClientError(
    event.code === 1013 ? 'slow-consumer' : 'socket-failed',
    event.reason || `Oracle voice connection closed (${event.code})`,
    { fatal: terminalCloseCode(event.code) },
  )
}

function clientError(error: unknown): OracleVoiceClientError {
  if (error instanceof OracleVoiceClientError) return error
  if (error instanceof VoiceCaptureError) return captureClientError(error)
  return new OracleVoiceClientError(
    'socket-failed',
    error instanceof Error ? error.message : String(error),
    { fatal: false },
  )
}

function captureClientError(error: VoiceCaptureError): OracleVoiceClientError {
  return new OracleVoiceClientError(
    'capture-failed',
    error.message,
    {
      dictationFallback: error.dictationFallback,
    },
  )
}

function playbackClientError(error: unknown): OracleVoiceClientError {
  return new OracleVoiceClientError(
    'playback-failed',
    error instanceof Error ? error.message : String(error),
  )
}

function terminalCloseCode(code: number): boolean {
  return code === 1000
    || code === 1002
    || code === 1003
    || code === 1007
    || code === 1008
    || code === 1009
    || code === 1013
}

function isCapabilities(value: unknown): value is VoiceCapabilities {
  if (!isRecord(value) || !isRecord(value.limits)) return false
  return Number.isInteger(value.protocol)
    && typeof value.available === 'boolean'
    && typeof value.computerId === 'string'
    && typeof value.computerName === 'string'
    && Number.isInteger(value.sampleRate)
    && Number.isInteger(value.playbackSampleRate)
    && Array.isArray(value.languages)
    && value.languages.every((language) => typeof language === 'string')
    && typeof value.sttProfile === 'string'
    && typeof value.ttsVoice === 'string'
    && (value.resourceClass === 'low' || value.resourceClass === 'quality')
    && Number.isSafeInteger(value.limits.maxFrameBytes)
    && Number.isSafeInteger(value.limits.maxQueueBytes)
    && Number.isSafeInteger(value.limits.maxUtteranceMs)
    && (value.reason === undefined || typeof value.reason === 'string')
}

function isTicket(value: unknown): value is VoiceTicketResponse {
  return isRecord(value)
    && typeof value.ticket === 'string'
    && value.ticket.length > 0
    && typeof value.expiresAt === 'string'
    && Number.isFinite(Date.parse(value.expiresAt))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function responseMessage(payload: unknown, fallback: string): string {
  return isRecord(payload) && typeof payload.error === 'string'
    ? payload.error
    : fallback
}

function closeReason(message: string): string {
  let reason = ''
  let byteLength = 0
  for (const character of message) {
    const characterBytes = UTF8_ENCODER.encode(character).byteLength
    if (byteLength + characterBytes > MAX_CLOSE_REASON_BYTES) break
    reason += character
    byteLength += characterBytes
  }
  return reason
}
