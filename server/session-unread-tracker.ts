import type { HubEvent, SessionStatus } from '../shared/contracts.js'
import { turnEnded } from '../shared/session-unread.js'

export interface FinishedSession {
  computerId: string
  sessionId: string
}

/**
 * Decides, from the session events the hub relays for every computer, which
 * session just finished a turn and so becomes unread. It only remembers each
 * session's last status: whether anyone read the result is the session-order
 * store's business, and a browser clears it when you look.
 */
export class SessionUnreadTracker {
  private readonly statuses = new Map<string, SessionStatus>()

  /** Records an event, returning the session whose turn it ended, if any. */
  observe(event: HubEvent): FinishedSession | undefined {
    if (event.type === 'session.upserted') {
      const { session } = event
      const key = `${session.computerId}:${session.id}`
      const previous = this.statuses.get(key)
      this.statuses.set(key, session.status)
      return turnEnded(previous, session)
        ? { computerId: session.computerId, sessionId: session.id }
        : undefined
    }
    if (event.type === 'session.removed') {
      this.statuses.delete(`${event.computerId}:${event.sessionId}`)
    } else if (event.type === 'computer.removed') {
      const prefix = `${event.computerId}:`
      for (const key of this.statuses.keys()) {
        if (key.startsWith(prefix)) this.statuses.delete(key)
      }
    }
    return undefined
  }
}
