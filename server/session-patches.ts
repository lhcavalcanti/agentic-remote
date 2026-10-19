import type {
  ChatMessage,
  HubEvent,
  ManagedSession,
  SessionMessagesPatch,
} from '../shared/contracts.js'

/** What a browser socket needs to be told about its patch state. */
export interface PatchSocket {
  send: (payload: string) => void
  readyState: number
  /** The publication each session was last sent at, for sockets that take patches. */
  patchVersions?: Map<string, number>
}

interface Publication {
  version: number
  session: ManagedSession
}

type SessionUpserted = Extract<HubEvent, { type: 'session.upserted' }>

function sessionKey(computerId: string, sessionId: string): string {
  return `${computerId}:${sessionId}`
}

/** Messages hold only primitive fields, so a shallow comparison is exact. */
function sameMessage(left: ChatMessage, right: ChatMessage): boolean {
  if (left === right) return true
  const leftKeys = Object.keys(left) as (keyof ChatMessage)[]
  if (leftKeys.length !== Object.keys(right).length) return false
  for (const key of leftKeys) {
    if (left[key] !== right[key]) return false
  }
  return true
}

/**
 * How a new transcript differs from the one last published: the length of
 * the prefix they share, and everything after it.
 */
export function diffMessages(
  base: readonly ChatMessage[],
  next: readonly ChatMessage[],
): { keep: number; messages: ChatMessage[] } {
  const limit = Math.min(base.length, next.length)
  let keep = 0
  while (keep < limit && sameMessage(base[keep], next[keep])) keep += 1
  return { keep, messages: next.slice(keep) }
}

/**
 * Turns session upserts into the smallest message each browser socket can
 * apply. A socket that asked for patches and holds the previous publication of
 * a session is sent only what changed; one that does not -- or never asked --
 * is sent the whole session, as before.
 *
 * Each payload is serialized at most once per event, however many sockets it
 * goes to. Publications are kept only while a patching socket is connected.
 */
export class SessionPublications {
  private readonly publications = new Map<string, Publication>()
  private readonly sockets = new Set<PatchSocket>()

  add(socket: PatchSocket): void {
    this.sockets.add(socket)
  }

  delete(socket: PatchSocket): void {
    this.sockets.delete(socket)
    if (![...this.sockets].some((entry) => entry.patchVersions)) this.publications.clear()
  }

  broadcast(event: HubEvent): void {
    if (event.type === 'session.upserted') {
      this.upsert(event)
      return
    }
    if (event.type === 'session.removed') {
      this.forget((key) => key === sessionKey(event.computerId, event.sessionId))
    } else if (event.type === 'computer.removed') {
      this.forget((key) => key.startsWith(`${event.computerId}:`))
    }
    this.sendAll(JSON.stringify(event))
  }

  /**
   * A socket whose patch did not apply asked for the whole session again.
   * It is sent the latest publication, which every later patch builds on.
   */
  resync(socket: PatchSocket, computerId: string, sessionId: string): void {
    if (!socket.patchVersions || socket.readyState !== 1) return
    const key = sessionKey(computerId, sessionId)
    const current = this.publications.get(key)
    if (!current) {
      socket.patchVersions.delete(key)
      return
    }
    socket.patchVersions.set(key, current.version)
    socket.send(JSON.stringify({
      type: 'session.upserted', session: current.session, patchVersion: current.version,
    }))
  }

  private sendAll(payload: string): void {
    for (const socket of this.sockets) {
      if (socket.readyState === 1) socket.send(payload)
    }
  }

  private forget(matches: (key: string) => boolean): void {
    for (const key of [...this.publications.keys()]) {
      if (matches(key)) this.publications.delete(key)
    }
    for (const socket of this.sockets) {
      for (const key of [...(socket.patchVersions?.keys() ?? [])]) {
        if (matches(key)) socket.patchVersions!.delete(key)
      }
    }
  }

  private upsert(event: SessionUpserted): void {
    const key = sessionKey(event.session.computerId, event.session.id)
    const patching = [...this.sockets].some((socket) => socket.patchVersions && socket.readyState === 1)
    const previous = this.publications.get(key)
    const version = (previous?.version ?? 0) + 1
    if (patching) {
      // Detached from the event, which other listeners also hold, so a later
      // change to it cannot alter what this socket is known to have.
      this.publications.set(key, {
        version,
        session: { ...event.session, messages: event.session.messages.map((message) => ({ ...message })) },
      })
    } else {
      this.publications.clear()
    }
    let full: string | undefined
    let versioned: string | undefined
    let patch: string | undefined
    for (const socket of this.sockets) {
      if (socket.readyState !== 1) continue
      if (!socket.patchVersions) {
        full ??= JSON.stringify(event)
        socket.send(full)
        continue
      }
      if (previous && socket.patchVersions.get(key) === previous.version) {
        patch ??= this.patch(event, previous, version)
        socket.send(patch)
      } else {
        versioned ??= JSON.stringify({ ...event, patchVersion: version })
        socket.send(versioned)
      }
      socket.patchVersions.set(key, version)
    }
  }

  private patch(event: SessionUpserted, previous: Publication, version: number): string {
    const { messages, ...summary } = event.session
    const { keep, messages: tail } = diffMessages(previous.session.messages, messages)
    const patch: SessionMessagesPatch = {
      from: previous.version,
      to: version,
      keep,
      count: messages.length,
      messages: tail,
    }
    return JSON.stringify({ type: 'session.patched', session: summary, patch })
  }
}
