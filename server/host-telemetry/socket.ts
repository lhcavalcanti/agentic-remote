import type WebSocket from 'ws'
import type { HostSnapshot } from '../../shared/host-telemetry.js'

export const HOST_TELEMETRY_MAX_QUEUE_BYTES = 128 * 1024
export const HOST_TELEMETRY_MAX_QUEUE_MESSAGES = 2
export const HOST_TELEMETRY_SEND_TIMEOUT_MS = 5000

type HostSocket = Pick<WebSocket, 'readyState' | 'bufferedAmount' | 'send' | 'close' | 'terminate'>

/** No unbounded application queue, including when a peer never reads again. */
export class HostTelemetrySocket {
  private pending = 0
  private pendingBytes = 0
  private timer?: ReturnType<typeof setTimeout>
  private closingTimer?: ReturnType<typeof setTimeout>
  private closed = false

  constructor(private readonly socket: HostSocket, private readonly release: () => void) {}

  send = (snapshot: HostSnapshot): void => {
    if (this.closed) return
    if (this.socket.readyState !== 1) { this.dispose(); return }
    const payload = JSON.stringify({ type: 'host.snapshot', snapshot })
    const bytes = Buffer.byteLength(payload)
    if (this.pending >= HOST_TELEMETRY_MAX_QUEUE_MESSAGES ||
      Math.max(this.pendingBytes, this.socket.bufferedAmount) + bytes > HOST_TELEMETRY_MAX_QUEUE_BYTES) {
      this.close(1013, 'Host monitor consumer is too slow')
      return
    }
    this.pending += 1
    this.pendingBytes += bytes
    this.armTimeout()
    try {
      this.socket.send(payload, (error?: Error) => {
        this.pending -= 1
        this.pendingBytes -= bytes
        if (error) this.close(1011, 'Host monitor transport failed')
        else {
          if (this.timer) clearTimeout(this.timer)
          this.timer = undefined
          this.armTimeout()
        }
      })
    } catch {
      this.close(1011, 'Host monitor transport failed')
    }
  }

  private armTimeout(): void {
    if (this.closed || this.timer || !this.pending) return
    this.timer = setTimeout(() => this.close(1013, 'Host monitor consumer is too slow'), HOST_TELEMETRY_SEND_TIMEOUT_MS)
    this.timer.unref?.()
  }

  close(code = 1011, reason = 'Host monitoring ended'): void {
    if (this.closed) return
    this.dispose()
    this.socket.close(code, reason)
    this.closingTimer = setTimeout(() => this.socket.terminate(), 1000)
    this.closingTimer.unref?.()
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer)
    if (this.closingTimer) clearTimeout(this.closingTimer)
    this.timer = undefined
    this.closingTimer = undefined
    if (this.closed) return
    this.closed = true
    this.release()
  }
}
