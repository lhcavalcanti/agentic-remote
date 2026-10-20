import type {
  ChatMessage,
  HubEvent,
  HubResyncRequest,
  HubWireEvent,
} from '../shared/contracts.js'

interface Base {
  version: number
  messages: ChatMessage[]
}

/**
 * Rebuilds whole sessions from the patches one event socket is sent. A patch
 * that does not apply to what this socket holds is dropped, and the session
 * is asked for whole again; nothing is guessed. A new socket starts empty.
 */
export class SessionPatchReceiver {
  private readonly bases = new Map<string, Base>()
  private readonly awaiting = new Set<string>()

  private readonly requestResync: (request: HubResyncRequest) => void

  constructor(requestResync: (request: HubResyncRequest) => void) {
    this.requestResync = requestResync
  }

  /** The event to handle, or `undefined` when there is nothing to handle yet. */
  receive(event: HubWireEvent): HubEvent | undefined {
    if (event.type === 'session.upserted') {
      const { patchVersion, ...upserted } = event
      const key = `${event.session.computerId}:${event.session.id}`
      if (patchVersion === undefined) {
        this.bases.delete(key)
      } else {
        this.bases.set(key, { version: patchVersion, messages: event.session.messages })
        this.awaiting.delete(key)
      }
      return upserted
    }
    if (event.type === 'session.patched') {
      const { computerId, id: sessionId } = event.session
      const key = `${computerId}:${sessionId}`
      const base = this.bases.get(key)
      const { from, to, keep, count, messages } = event.patch
      if (
        !base || base.version !== from || keep > base.messages.length ||
        keep + messages.length !== count
      ) {
        this.bases.delete(key)
        if (!this.awaiting.has(key)) {
          this.awaiting.add(key)
          this.requestResync({ type: 'session.resync', computerId, sessionId })
        }
        return undefined
      }
      // Unchanged messages keep their identity, so what renders them can tell
      // they did not change.
      const next = keep === base.messages.length && !messages.length
        ? base.messages
        : [...base.messages.slice(0, keep), ...messages]
      this.bases.set(key, { version: to, messages: next })
      return { type: 'session.upserted', session: { ...event.session, messages: next } }
    }
    if (event.type === 'session.removed') {
      const key = `${event.computerId}:${event.sessionId}`
      this.bases.delete(key)
      this.awaiting.delete(key)
    } else if (event.type === 'computer.removed') {
      for (const key of [...this.bases.keys(), ...this.awaiting]) {
        if (key.startsWith(`${event.computerId}:`)) {
          this.bases.delete(key)
          this.awaiting.delete(key)
        }
      }
    }
    return event
  }
}
