import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_CONNECTION_TIMEOUT_MS,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  isVoiceClientControl,
  isVoiceServerControl,
  voiceAudioFrameByteLength,
  type VoiceAudioFrame,
  type VoiceCapabilities,
  type VoiceClientControl,
} from '../shared/oracle-voice.js'
import type { RegisteredComputer } from './computer-registry.js'
import {
  RemoteNodeRedirectError,
  RemoteNodeRequestError,
} from './remote-node-errors.js'
import {
  DEFAULT_VOICE_BACKEND_LIMITS,
  VoiceSessionError,
  type VoiceBackendDisconnectCause,
  type VoiceBackendOutput,
} from './oracle-voice-session.js'

const DEFAULT_HEARTBEAT_TIMEOUT_MS = 15_000
const DEFAULT_MAX_BUFFERED_BYTES = 64 * 1024
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

export interface RemoteVoiceClientOptions {
  connectTimeoutMs?: number
  heartbeatTimeoutMs?: number
  maxBufferedBytes?: number
  registrationSignal?: AbortSignal
  signal?: AbortSignal
}

interface RemoteVoiceClientEvents {
  event: [event: VoiceBackendOutput]
  disconnect: [error: RemoteVoiceDisconnectError]
}

export class RemoteVoiceDisconnectError extends Error {
  constructor(
    message: string,
    readonly code: number,
    readonly reason = '',
    readonly retryable = false,
    readonly cause: VoiceBackendDisconnectCause = 'internal',
  ) {
    super(message)
    this.name = 'RemoteVoiceDisconnectError'
  }
}

export class RemoteVoiceClient extends EventEmitter<RemoteVoiceClientEvents> {
  readonly capabilities: VoiceCapabilities
  private readonly maxBufferedBytes: number
  private readonly registrationSignal: AbortSignal | undefined
  private readonly registrationAbort: (() => void) | undefined
  private readonly heartbeatTimeoutMs: number
  private heartbeatTimer: ReturnType<typeof setTimeout> | undefined
  private sendTail: Promise<void> = Promise.resolve()
  private pendingBytes = 0
  private stopRequested = false
  private closingLocally = false
  private stopped = false
  private disconnected = false
  private disconnectError: RemoteVoiceDisconnectError | undefined

  private constructor(
    private readonly socket: WebSocket,
    private readonly streamId: string,
    capabilities: VoiceCapabilities,
    options: RemoteVoiceClientOptions,
  ) {
    super()
    this.capabilities = capabilities
    this.maxBufferedBytes = Math.min(
      options.maxBufferedBytes ?? DEFAULT_MAX_BUFFERED_BYTES,
      capabilities.limits.maxQueueBytes,
    )
    if (!Number.isSafeInteger(this.maxBufferedBytes) || this.maxBufferedBytes <= 0) {
      throw new RangeError('maxBufferedBytes must be a positive safe integer')
    }
    this.heartbeatTimeoutMs = options.heartbeatTimeoutMs
      ?? DEFAULT_HEARTBEAT_TIMEOUT_MS
    if (
      !Number.isSafeInteger(this.heartbeatTimeoutMs)
      || this.heartbeatTimeoutMs <= 0
    ) {
      throw new RangeError('heartbeatTimeoutMs must be a positive safe integer')
    }
    this.registrationSignal = options.registrationSignal
    if (this.registrationSignal) {
      this.registrationAbort = () => {
        this.disconnect(
          new RemoteVoiceDisconnectError(
            'Paired node registration changed during the voice stream',
            1001,
            '',
            false,
            'registration',
          ),
        )
      }
      this.registrationSignal.addEventListener('abort', this.registrationAbort, {
        once: true,
      })
    }
    socket.on('message', (data, isBinary) => this.receive(data, isBinary))
    socket.on('close', (code, reason) => {
      if (this.stopped || this.disconnected) return
      if (this.closingLocally || (this.stopRequested && code === 1000)) {
        this.markStopped()
        return
      }
      this.disconnect(remoteSocketCloseError(
        `Paired node voice socket disconnected (${code})`,
        code,
        reason.toString(),
      ), false)
    })
    socket.on('error', (error) => {
      if (this.stopped || this.disconnected || this.closingLocally) return
      const failure = remoteSocketError('Paired node voice socket failed', error)
      this.disconnect(failure, false)
      this.socket.terminate()
    })
    this.refreshHeartbeat()
  }

  static connect(
    computer: RegisteredComputer,
    streamId: string,
    options: RemoteVoiceClientOptions = {},
  ): Promise<RemoteVoiceClient> {
    if (!streamId || streamId.length > 200) {
      return Promise.reject(new Error('A valid voice stream ID is required'))
    }
    if (options.registrationSignal?.aborted) {
      return Promise.reject(new RemoteVoiceDisconnectError(
        'Paired node registration changed before the voice stream connected',
        1001,
        '',
        false,
        'registration',
      ))
    }
    if (options.signal?.aborted) {
      return Promise.reject(new RemoteVoiceDisconnectError(
        'Paired node voice connection was cancelled',
        1001,
        '',
        false,
        'transport',
      ))
    }
    const connectTimeoutMs = options.connectTimeoutMs
      ?? ORACLE_VOICE_CONNECTION_TIMEOUT_MS
    if (!Number.isSafeInteger(connectTimeoutMs) || connectTimeoutMs <= 0) {
      return Promise.reject(new RangeError('connectTimeoutMs must be a positive safe integer'))
    }
    const url = nodeWebSocketUrl(computer, '/node-api/oracle-voice', new URLSearchParams({
      protocol: String(ORACLE_VOICE_PROTOCOL),
      streamId,
    }))

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url, {
        followRedirects: false,
        maxPayload: DEFAULT_VOICE_BACKEND_LIMITS.maxFrameBytes,
        headers: nodeAuthorization(computer),
      })
      let settled = false
      let opened = false
      const registrationSignal = options.registrationSignal
      let registrationAbort: (() => void) | undefined
      const signal = options.signal
      let abort: (() => void) | undefined
      const cleanup = () => {
        clearTimeout(timer)
        if (registrationSignal && registrationAbort) {
          registrationSignal.removeEventListener('abort', registrationAbort)
        }
        if (signal && abort) {
          signal.removeEventListener('abort', abort)
        }
      }
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        socket.terminate()
        reject(new RemoteVoiceDisconnectError(
          `${computer.name} voice connection timed out`,
          1006,
          '',
          true,
          'transport',
        ))
      }, connectTimeoutMs)
      const finishError = (error: unknown) => {
        if (settled) return
        settled = true
        cleanup()
        socket.terminate()
        reject(error)
      }
      if (registrationSignal) {
        registrationAbort = () => finishError(new RemoteVoiceDisconnectError(
          'Paired node registration changed during the voice stream',
          1001,
          '',
          false,
          'registration',
        ))
        registrationSignal.addEventListener('abort', registrationAbort, {
          once: true,
        })
        if (registrationSignal.aborted) registrationAbort()
      }
      if (signal) {
        abort = () => finishError(new RemoteVoiceDisconnectError(
          'Paired node voice connection was cancelled',
          1001,
          '',
          false,
          'transport',
        ))
        signal.addEventListener('abort', abort, { once: true })
        if (signal.aborted) abort()
      }
      socket.once('open', () => {
        opened = true
      })
      socket.once('unexpected-response', (_request, response) => {
        response.resume()
        const statusCode = response.statusCode ?? 500
        finishError(REDIRECT_STATUSES.has(statusCode)
          ? new RemoteNodeRedirectError(computer.name, statusCode)
          : new RemoteNodeRequestError(
              `${computer.name} voice upgrade failed (${statusCode})`,
              statusCode,
            ))
      })
      socket.once('error', (error) => {
        finishError(remoteSocketError(
          `${computer.name} voice connection failed`,
          error,
        ))
      })
      socket.once('close', (code, reason) => {
        if (!settled) {
          finishError(remoteSocketCloseError(
            `${computer.name} voice socket closed before hello (${code})`,
            code,
            reason.toString(),
          ))
        }
      })
      socket.on('message', (data, isBinary) => {
        if (settled) return
        if (!opened || isBinary) {
          finishError(new RemoteVoiceDisconnectError(
            `${computer.name} sent an invalid voice handshake`,
            1002,
            '',
            false,
            'protocol',
          ))
          return
        }
        let message: unknown
        try {
          message = JSON.parse(rawDataBuffer(data).toString('utf8')) as unknown
        } catch {
          finishError(new RemoteVoiceDisconnectError(
            `${computer.name} sent invalid voice handshake JSON`,
            1007,
            '',
            false,
            'protocol',
          ))
          return
        }
        if (
          !isVoiceServerControl(message)
          || message.type !== 'hello'
          || message.streamId !== streamId
        ) {
          finishError(new RemoteVoiceDisconnectError(
            `${computer.name} sent an invalid voice hello`,
            1002,
            '',
            false,
            'protocol',
          ))
          return
        }
        try {
          const client = new RemoteVoiceClient(socket, streamId, message.capabilities, options)
          settled = true
          cleanup()
          resolve(client)
        } catch (error) {
          finishError(error)
        }
      })
    })
  }

  send(message: VoiceClientControl | VoiceAudioFrame): Promise<void> {
    try {
      this.requireConnected()
      const stop = 'type' in message && message.type === 'stop'
      let payload: string | Buffer
      if ('type' in message) {
        if (!isVoiceClientControl(message) || message.streamId !== this.streamId) {
          throw new VoiceSessionError('Invalid remote voice control message', 1008)
        }
        payload = JSON.stringify(message.type === 'start'
          ? { ...message, defaults: {} }
          : message)
      } else {
        if (message.direction !== 'microphone') {
          throw new VoiceSessionError('Remote voice accepts microphone audio only', 1008)
        }
        if (
          voiceAudioFrameByteLength(message) > this.capabilities.limits.maxFrameBytes
        ) {
          const error = new VoiceSessionError('Voice microphone frame is too large', 1009)
          this.disconnect(new RemoteVoiceDisconnectError(
            error.message,
            error.closeCode,
            '',
            false,
            'protocol',
          ))
          return Promise.reject(error)
        }
        payload = Buffer.from(encodeVoiceAudioFrame(message))
      }
      const bytes = typeof payload === 'string' ? Buffer.byteLength(payload) : payload.byteLength
      if (
        bytes > this.maxBufferedBytes - this.pendingBytes
        || this.socket.bufferedAmount > this.maxBufferedBytes - this.pendingBytes - bytes
      ) {
        const error = new VoiceSessionError('Remote voice output queue is full', 1013)
        this.disconnect(new RemoteVoiceDisconnectError(
          error.message,
          error.closeCode,
          '',
          false,
          'backpressure',
        ))
        return Promise.reject(error)
      }
      if (stop) this.stopRequested = true
      this.pendingBytes += bytes
      const sending = this.sendTail.catch(() => undefined).then(async () => {
        this.requireConnected(true)
        await sendSocket(this.socket, payload)
      }).catch((error: unknown) => {
        if (error instanceof VoiceSessionError) throw error
        const disconnect = new RemoteVoiceDisconnectError(
          error instanceof Error && error.message
            ? `Remote voice send failed: ${error.message}`
            : 'Remote voice send failed',
          1006,
          '',
          true,
          'transport',
        )
        this.disconnect(disconnect, false)
        this.socket.terminate()
        throw disconnect
      }).finally(() => {
        this.pendingBytes -= bytes
      })
      this.sendTail = sending.catch(() => undefined)
      return stop
        ? this.awaitProtocolStop(sending)
        : sending
    } catch (error) {
      return Promise.reject(error)
    }
  }

  control(message: VoiceClientControl): Promise<void> {
    return this.send(message)
  }

  audio(frame: VoiceAudioFrame): Promise<void> {
    return this.send(frame)
  }

  async stop(reason = 'Remote voice stopped'): Promise<void> {
    if (this.stopped) return
    this.stopRequested = true
    this.closingLocally = true
    this.clearHeartbeat()
    this.removeRegistrationAbort()
    await this.sendTail
    if (this.socket.readyState === WebSocket.CLOSED) {
      this.markStopped()
      return
    }
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        this.socket.terminate()
        this.markStopped()
        resolve()
      }, 1_000)
      this.socket.once('close', () => {
        clearTimeout(timer)
        this.markStopped()
        resolve()
      })
      this.socket.close(1000, closeReason(reason))
    })
  }

  close(reason: string): Promise<void> {
    return this.stop(reason)
  }

  private receive(data: WebSocket.RawData, isBinary: boolean): void {
    if (this.stopped || this.disconnected || this.closingLocally) return
    this.refreshHeartbeat()
    try {
      if (isBinary) {
        const buffer = rawDataBuffer(data)
        if (buffer.byteLength > this.capabilities.limits.maxFrameBytes) {
          throw new VoiceSessionError('Voice playback frame is too large', 1009)
        }
        const frame = decodeVoiceAudioFrame(exactArrayBuffer(buffer))
        if (frame.direction !== 'playback') {
          throw new Error('invalid remote voice audio direction')
        }
        this.emit('event', frame)
        return
      }
      const message = JSON.parse(rawDataBuffer(data).toString('utf8')) as unknown
      if (
        !isVoiceServerControl(message)
        || message.type === 'hello'
        || message.streamId !== this.streamId
      ) {
        throw new Error('invalid remote voice control message')
      }
      this.emit('event', message)
    } catch (error) {
      this.disconnect(new RemoteVoiceDisconnectError(
        error instanceof Error && error.message
          ? `Paired node sent an invalid voice payload: ${error.message}`
          : 'Paired node sent an invalid voice payload',
        error instanceof VoiceSessionError ? error.closeCode : 1003,
        '',
        false,
        'protocol',
      ))
    }
  }

  private disconnect(error: RemoteVoiceDisconnectError, closeSocket = true): void {
    if (this.stopped || this.disconnected) return
    this.disconnected = true
    this.disconnectError = error
    this.clearHeartbeat()
    this.removeRegistrationAbort()
    if (closeSocket && this.socket.readyState < WebSocket.CLOSING) {
      this.socket.close(error.code, closeReason(error.message))
    }
    this.emit('disconnect', error)
  }

  private requireConnected(allowStopRequested = false): void {
    if (this.stopped || (this.stopRequested && !allowStopRequested)) {
      throw new RemoteVoiceDisconnectError(
        'Remote voice client is stopped',
        1000,
        '',
        false,
        'policy',
      )
    }
    if (this.registrationSignal?.aborted) {
      throw new RemoteVoiceDisconnectError(
        'Paired node registration changed during the voice stream',
        1001,
        '',
        false,
        'registration',
      )
    }
    if (this.disconnected || this.socket.readyState !== WebSocket.OPEN) {
      throw this.disconnectError
        ?? new RemoteVoiceDisconnectError(
          'Remote voice client is disconnected',
          1006,
          '',
          true,
          'transport',
        )
    }
  }

  private removeRegistrationAbort(): void {
    if (this.registrationSignal && this.registrationAbort) {
      this.registrationSignal.removeEventListener('abort', this.registrationAbort)
    }
  }

  private async awaitProtocolStop(sending: Promise<void>): Promise<void> {
    const closed = new Promise<{ code: number; reason: string }>((resolve) => {
      this.socket.once('close', (code, reason) => {
        resolve({ code, reason: reason.toString() })
      })
    })
    await sending
    const timer = setTimeout(() => {
      this.socket.terminate()
    }, 1_000)
    try {
      const result = await closed
      if (result.code !== 1000) {
        throw this.disconnectError ?? remoteSocketCloseError(
          `Paired node voice socket disconnected (${result.code})`,
          result.code,
          result.reason,
        )
      }
      this.markStopped()
    } finally {
      clearTimeout(timer)
    }
  }

  private markStopped(): void {
    if (this.stopped) return
    this.stopped = true
    this.clearHeartbeat()
    this.removeRegistrationAbort()
  }

  private refreshHeartbeat(): void {
    this.clearHeartbeat()
    this.heartbeatTimer = setTimeout(() => {
      const failure = new RemoteVoiceDisconnectError(
        'Paired node voice heartbeat timed out',
        1006,
        '',
        true,
        'transport',
      )
      this.disconnect(failure, false)
      this.socket.terminate()
    }, this.heartbeatTimeoutMs)
  }

  private clearHeartbeat(): void {
    if (!this.heartbeatTimer) return
    clearTimeout(this.heartbeatTimer)
    this.heartbeatTimer = undefined
  }
}

/** The WebSocket address of a paired node's route, on the scheme its pairing uses. */
export function nodeWebSocketUrl(
  computer: Pick<RegisteredComputer, 'baseUrl'>,
  pathname: string,
  search?: URLSearchParams,
): URL {
  const url = new URL(computer.baseUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = pathname
  url.search = search?.toString() ?? ''
  url.hash = ''
  return url
}

export function nodeAuthorization(computer: Pick<RegisteredComputer, 'token'>): { authorization: string } {
  return { authorization: `Bearer ${computer.token}` }
}

function sendSocket(socket: WebSocket, payload: string | Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.send(payload, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function rawDataBuffer(data: WebSocket.RawData): Buffer {
  if (Array.isArray(data)) return Buffer.concat(data)
  if (data instanceof ArrayBuffer) return Buffer.from(data)
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength)
}

function exactArrayBuffer(data: WebSocket.RawData): ArrayBuffer {
  const buffer = rawDataBuffer(data)
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

function closeReason(reason: string): string {
  return reason.replace(/[^\x20-\x7e]/g, '').slice(0, 120) || 'Remote voice closed'
}

function remoteSocketCloseError(
  message: string,
  code: number,
  reason: string,
): RemoteVoiceDisconnectError {
  if (code === 1006 || code === 1012) {
    return new RemoteVoiceDisconnectError(
      message,
      code,
      reason,
      true,
      'transport',
    )
  }

  if (code === 1013) {
    return new RemoteVoiceDisconnectError(
      message,
      code,
      reason,
      false,
      'backpressure',
    )
  }
  if (
    code === 1002
    || code === 1003
    || code === 1007
    || code === 1008
    || code === 1009
  ) {
    return new RemoteVoiceDisconnectError(
      message,
      code,
      reason,
      false,
      'protocol',
    )
  }
  return new RemoteVoiceDisconnectError(
    message,
    code,
    reason,
    false,
    code === 1001 ? 'policy' : 'internal',
  )
}

function remoteSocketError(prefix: string, error: Error): RemoteVoiceDisconnectError {
  const payloadTooLarge = (error as NodeJS.ErrnoException).code
    === 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
  return new RemoteVoiceDisconnectError(
    `${prefix}: ${error.message}`,
    payloadTooLarge ? 1009 : 1006,
    error.message,
    !payloadTooLarge,
    payloadTooLarge ? 'protocol' : 'transport',
  )
}
