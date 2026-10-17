import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
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
  VoiceSessionError,
  type VoiceBackendOutput,
} from './oracle-voice-session.js'

const DEFAULT_CONNECT_TIMEOUT_MS = 15_000
const DEFAULT_MAX_BUFFERED_BYTES = 64 * 1024
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

export interface RemoteVoiceClientOptions {
  connectTimeoutMs?: number
  maxBufferedBytes?: number
  registrationSignal?: AbortSignal
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
    this.registrationSignal = options.registrationSignal
    if (this.registrationSignal) {
      this.registrationAbort = () => {
        this.disconnect(
          new RemoteVoiceDisconnectError(
            'Paired node registration changed during the voice stream',
            1001,
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
      this.disconnect(new RemoteVoiceDisconnectError(
        `Paired node voice socket disconnected (${code})`,
        code,
        reason.toString(),
      ), false)
    })
    socket.on('error', (error) => {
      if (this.stopped || this.disconnected || this.closingLocally) return
      this.disconnect(new RemoteVoiceDisconnectError(
        `Paired node voice socket failed: ${error.message}`,
        1011,
      ))
    })
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
      ))
    }
    const connectTimeoutMs = options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS
    if (!Number.isSafeInteger(connectTimeoutMs) || connectTimeoutMs <= 0) {
      return Promise.reject(new RangeError('connectTimeoutMs must be a positive safe integer'))
    }
    const url = new URL(computer.baseUrl)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.pathname = '/node-api/oracle-voice'
    url.search = new URLSearchParams({
      protocol: String(ORACLE_VOICE_PROTOCOL),
      streamId,
    }).toString()
    url.hash = ''

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url, {
        followRedirects: false,
        headers: {
          authorization: `Bearer ${computer.token}`,
        },
      })
      let settled = false
      let opened = false
      const registrationSignal = options.registrationSignal
      let registrationAbort: (() => void) | undefined
      const cleanup = () => {
        clearTimeout(timer)
        if (registrationSignal && registrationAbort) {
          registrationSignal.removeEventListener('abort', registrationAbort)
        }
      }
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        socket.terminate()
        reject(new Error(`${computer.name} voice connection timed out`))
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
        ))
        registrationSignal.addEventListener('abort', registrationAbort, {
          once: true,
        })
        if (registrationSignal.aborted) registrationAbort()
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
        finishError(error)
      })
      socket.once('close', (code, reason) => {
        if (!settled) {
          finishError(new RemoteVoiceDisconnectError(
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
        payload = JSON.stringify(message)
      } else {
        if (message.direction !== 'microphone') {
          throw new VoiceSessionError('Remote voice accepts microphone audio only', 1008)
        }
        if (
          voiceAudioFrameByteLength(message) > this.capabilities.limits.maxFrameBytes
        ) {
          const error = new VoiceSessionError('Voice microphone frame is too large', 1009)
          this.disconnect(new RemoteVoiceDisconnectError(error.message, error.closeCode))
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
        this.disconnect(new RemoteVoiceDisconnectError(error.message, error.closeCode))
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
          1011,
        )
        this.disconnect(disconnect)
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
    if (this.stopped || this.disconnected) return
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
      ))
    }
  }

  private disconnect(error: RemoteVoiceDisconnectError, closeSocket = true): void {
    if (this.stopped || this.disconnected) return
    this.disconnected = true
    this.disconnectError = error
    this.removeRegistrationAbort()
    if (closeSocket && this.socket.readyState < WebSocket.CLOSING) {
      this.socket.close(error.code, closeReason(error.message))
    }
    this.emit('disconnect', error)
  }

  private requireConnected(allowStopRequested = false): void {
    if (this.stopped || (this.stopRequested && !allowStopRequested)) {
      throw new RemoteVoiceDisconnectError('Remote voice client is stopped', 1000)
    }
    if (this.registrationSignal?.aborted) {
      throw new RemoteVoiceDisconnectError(
        'Paired node registration changed during the voice stream',
        1001,
      )
    }
    if (this.disconnected || this.socket.readyState !== WebSocket.OPEN) {
      throw this.disconnectError
        ?? new RemoteVoiceDisconnectError('Remote voice client is disconnected', 1001)
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
        throw this.disconnectError ?? new RemoteVoiceDisconnectError(
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
    this.removeRegistrationAbort()
  }
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
