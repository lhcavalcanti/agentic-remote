import type { SessionDetail } from '../shared/contracts.js'
import { CLOSED_SESSION_RETENTION_MS } from '../shared/closed-sessions.js'

export const CLOSED_SESSION_SWEEP_INTERVAL_MS = 60 * 60 * 1000
const CLOSED_SESSION_SWEEP_LIMIT = 20

export interface ClosedSessionOwner {
  listClosedSessions(): Pick<SessionDetail, 'id' | 'closedAt'>[]
  /** Deletes the session only if it is still closed at or before `closedBefore`. */
  deleteExpiredClosedSession(id: string, closedBefore: number): Promise<boolean>
}

/**
 * Deletes closed sessions for good once their retention ends: when started
 * and then on an interval, a bounded number a pass, oldest first. A deletion
 * that fails is logged and tried again on the next pass.
 */
export class ClosedSessionSweeper {
  private timer?: ReturnType<typeof setInterval>
  private running?: Promise<void>
  private stopped = false

  constructor(
    private readonly owner: ClosedSessionOwner,
    private readonly options: { now?: () => number; intervalMs?: number; limit?: number } = {},
  ) {}

  start(): void {
    this.stopped = false
    void this.sweep()
    this.timer = setInterval(() => void this.sweep(), this.options.intervalMs ?? CLOSED_SESSION_SWEEP_INTERVAL_MS)
    this.timer.unref?.()
  }

  async stop(): Promise<void> {
    this.stopped = true
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
    await this.running
  }

  sweep(): Promise<void> {
    if (this.stopped) return Promise.resolve()
    this.running ??= this.sweepOnce().finally(() => { this.running = undefined })
    return this.running
  }

  private async sweepOnce(): Promise<void> {
    const now = this.options.now ?? Date.now
    const closedBefore = now() - CLOSED_SESSION_RETENTION_MS
    const expired = this.owner.listClosedSessions()
      .flatMap((session) => {
        const closedAt = Date.parse(session.closedAt ?? '')
        return closedAt <= closedBefore ? [{ id: session.id, closedAt }] : []
      })
      .sort((left, right) => left.closedAt - right.closedAt)
      .slice(0, this.options.limit ?? CLOSED_SESSION_SWEEP_LIMIT)
    for (const session of expired) {
      if (this.stopped) return
      try {
        if (await this.owner.deleteExpiredClosedSession(session.id, closedBefore)) {
          console.info(JSON.stringify({
            sessionLifecycle: 'expired', sessionId: session.id, at: new Date(now()).toISOString(),
          }))
        }
      } catch (error) {
        console.warn(JSON.stringify({
          sessionLifecycle: 'expiry-failed',
          sessionId: session.id,
          at: new Date(now()).toISOString(),
          error: error instanceof Error ? error.message : String(error),
        }))
      }
    }
  }
}
