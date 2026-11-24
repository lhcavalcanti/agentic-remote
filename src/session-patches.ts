import type {
  ChatMessage,
  HubEvent,
  HubResyncRequest,
  HubWireEvent,
} from '../shared/contracts.js'

interface Base {
  version: number
  messages: ChatMessage[]
  /** For a windowed session: where `messages` starts, and the rows it carries from before. */
  start?: number
  carried?: ChatMessage[]
}

/**
 * Rebuilds whole sessions from the patches one event socket is sent. A patch
 * that does not apply to what this socket holds is dropped, and the session
 * is asked for whole again; nothing is guessed. A new socket starts empty.
 *
 * A windowed session -- one sent with `messagesStart` -- holds only its latest
 * messages. Patches count from the start of the whole transcript, so one that
 * keeps fewer messages than come before the window cannot apply either.
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
        const { messages, messagesStart, carriedMessages } = event.session
        this.bases.set(key, messagesStart === undefined
          ? { version: patchVersion, messages }
          : { version: patchVersion, messages, start: messagesStart, carried: carriedMessages ?? [] })
        this.awaiting.delete(key)
      }
      return upserted
    }
    if (event.type === 'session.patched') {
      const { computerId, id: sessionId } = event.session
      const key = `${computerId}:${sessionId}`
      const base = this.bases.get(key)
      const { from, to, keep, count, messages } = event.patch
      const start = base?.start ?? 0
      if (
        !base || base.version !== from || keep < start || keep > start + base.messages.length ||
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
      const next = keep === start + base.messages.length && !messages.length
        ? base.messages
        : [...base.messages.slice(0, keep - start), ...messages]
      this.bases.set(key, { ...base, version: to, messages: next })
      return {
        type: 'session.upserted',
        session: base.start === undefined
          ? { ...event.session, messages: next }
          : {
              ...event.session,
              messages: next,
              messagesStart: base.start,
              messagesTotal: count,
              carriedMessages: base.carried ?? [],
            },
      }
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
