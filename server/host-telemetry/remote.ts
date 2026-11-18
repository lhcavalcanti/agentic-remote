import WebSocket from 'ws'
import {
  HOST_TELEMETRY_INVALID_CODE, HOST_TELEMETRY_INVALID_CLOSE_CODE, HostTelemetryMessageSchema,
  type HostSnapshot, type HostTelemetryEndReason,
} from '../../shared/host-telemetry.js'
import type { RegisteredComputer } from '../computer-registry.js'
import { RemoteNodeRequestError } from '../remote-node-errors.js'
import { HOST_TELEMETRY_MAX_QUEUE_BYTES } from './socket.js'

export const HOST_TELEMETRY_REMOTE_TIMEOUT_MS = 5000
export const HOST_TELEMETRY_STALE_STREAM_MS = 20_000

export function subscribeRemoteHost(
  computer: RegisteredComputer,
  signal: AbortSignal,
  sample: (snapshot: HostSnapshot) => void,
  ended: (reason?: HostTelemetryEndReason) => void,
): Promise<() => void> {
  const url = new URL('/node-api/host/live', computer.baseUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error('Host monitoring stopped')); return }
    const socket = new WebSocket(url, {
      headers: { authorization: `Bearer ${computer.token}` },
      handshakeTimeout: HOST_TELEMETRY_REMOTE_TIMEOUT_MS,
      maxPayload: HOST_TELEMETRY_MAX_QUEUE_BYTES,
      followRedirects: false,
    })
    let active = true
    let opened = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const finish = (error?: Error, reason?: HostTelemetryEndReason) => {
      if (!active) return
      active = false
      if (timer) clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      socket.terminate()
      if (!opened) reject(error ?? new Error('Host monitoring stopped'))
      ended(reason)
    }
    const abort = () => finish()
    signal.addEventListener('abort', abort, { once: true })
    const armTimeout = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => finish(), HOST_TELEMETRY_STALE_STREAM_MS)
      timer.unref?.()
    }
    socket.on('open', () => {
      if (!active) return
      opened = true
      armTimeout()
      resolve(() => finish())
    })
    socket.on('message', (data, binary) => {
      if (!active) return
      let snapshot: HostSnapshot
      try {
        if (binary) throw new Error('Invalid host sample')
        snapshot = HostTelemetryMessageSchema.parse(JSON.parse(data.toString())).snapshot
      } catch {
        finish(new Error('Invalid host sample'), HOST_TELEMETRY_INVALID_CODE)
        return
      }
      armTimeout()
      try { sample(snapshot) }
      catch { finish(new Error('Host monitoring delivery failed')) }
    })
    socket.on('unexpected-response', (_request, response) => {
      response.destroy()
      finish(new RemoteNodeRequestError('Host monitoring is unavailable on this computer', response.statusCode ?? 502))
    })
    socket.on('error', (error) => {
      // The ws frame parser uses WS_ERR_*; network failures use ordinary transport codes.
      const invalid = 'code' in error && typeof error.code === 'string' && error.code.startsWith('WS_ERR_')
      finish(new Error('Host monitoring transport failed'), invalid ? HOST_TELEMETRY_INVALID_CODE : undefined)
    })
    socket.on('close', (code) => finish(undefined,
      code === HOST_TELEMETRY_INVALID_CLOSE_CODE ? HOST_TELEMETRY_INVALID_CODE : undefined))
  })
}
