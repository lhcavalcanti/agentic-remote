import type {
  ChatMessage,
  HubEvent,
  ManagedSession,
  SessionMessagesPatch,
} from '../shared/contracts.js'
import { transcriptOf, windowTranscript } from '../shared/transcript-window.js'

/** What a browser socket needs to be told about its patch state. */
export interface PatchSocket {
  send: (payload: string) => void
  readyState: number
  /** The publication each session was last sent at, for sockets that take patches. */
  patchVersions?: Map<string, number>
  /**
   * Set on a patching socket that asked for a window: how many of a
   * session's latest messages it is sent in place of the whole transcript.
   */
  transcriptWindow?: number
  /** Where each session a windowed socket holds starts; kept by the publications. */
  windowStarts?: Map<string, number>
}

interface Publication {
  version: number
  session: ManagedSession
  /** A roster summary that never read the transcript, with nothing published before it. */
  unread?: true
}

/**
 * At most this many rows that changed in place before a window go with a
 * fresh one, so a browser holding older rows can update them; past it, the
 * browser lets those rows go instead.
 */
const CHANGED_BEFORE_WINDOW = 100

type SessionUpserted = Extract<HubEvent, { type: 'session.upserted' }>

function sessionKey(computerId: string, sessionId: string): string {
  return `${computerId}:${sessionId}`
}

/**
 * Message fields are primitives or, like `taskCompletion`, plain objects of
 * primitives. A transcript rebuilt from the event log makes those objects
 * afresh, so they are compared by their fields rather than by identity;
 * otherwise every message after the first one breaks the shared prefix and the
 * whole rest of the transcript is resent on every change.
 */
function sameField(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (
    left === null || right === null ||
    typeof left !== 'object' || typeof right !== 'object' ||
    Array.isArray(left) || Array.isArray(right)
  ) return false
  const leftKeys = Object.keys(left)
  if (leftKeys.length !== Object.keys(right).length) return false
  return leftKeys.every((key) =>
    (left as Record<string, unknown>)[key] === (right as Record<string, unknown>)[key])
}

function sameMessage(left: ChatMessage, right: ChatMessage): boolean {
  if (left === right) return true
  const leftKeys = Object.keys(left) as (keyof ChatMessage)[]
  if (leftKeys.length !== Object.keys(right).length) return false
  for (const key of leftKeys) {
    if (!sameField(left[key], right[key])) return false
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
 * The rows in [from, before) that changed in place -- the same row, as an old
 * activity finishing is -- or nothing when rows moved there, or too many did.
 */
function changedInPlace(
  base: readonly ChatMessage[],
  next: readonly ChatMessage[],
  from: number,
  before: number,
): ChatMessage[] {
  const changed: ChatMessage[] = []
  for (let index = from; index < before; index += 1) {
    if (index >= base.length || index >= next.length || base[index].id !== next[index].id) return []
    if (sameMessage(base[index], next[index])) continue
    if (changed.length === CHANGED_BEFORE_WINDOW) return []
    changed.push(next[index])
  }
  return changed
}

/**
 * Turns session upserts into the smallest message each browser socket can
 * apply. A socket that asked for patches and holds the previous publication of
 * a session is sent only what changed; one that does not -- or never asked --
 * is sent the whole session, as before.
 *
 * A patching socket that also asked for a window is sent the latest part of a
 * session in place of the whole one, with where it starts, and patches only
 * while what changed lies inside what it holds and fits in a window. Anything
 * else -- an old activity finishing far back, a burst of new rows -- is sent
 * as a fresh window, so no frame to it grows with the transcript.
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
      socket.windowStarts?.delete(key)
      return
    }
    socket.patchVersions.set(key, current.version)
    if (socket.transcriptWindow !== undefined) {
      const windowed = this.windowed(current, socket.transcriptWindow)
      socket.windowStarts ??= new Map()
      socket.windowStarts.set(key, windowed.start)
      socket.send(windowed.payload)
      return
    }
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
      for (const key of [...(socket.windowStarts?.keys() ?? [])]) {
        if (matches(key)) socket.windowStarts!.delete(key)
      }
    }
  }

  private upsert(received: SessionUpserted): void {
    const key = sessionKey(received.session.computerId, received.session.id)
    const patching = [...this.sockets].some((socket) => socket.patchVersions && socket.readyState === 1)
    const previous = this.publications.get(key)
    // A roster summary never read the transcript. Publishing its empty list
    // would clear what every browser shows, so the published one is kept.
    const event: SessionUpserted = received.summary && previous
      ? { type: 'session.upserted', session: { ...received.session, messages: previous.session.messages } }
      : received
    const version = (previous?.version ?? 0) + 1
    // Detached from the event, which other listeners also hold, so a later
    // change to it cannot alter what this socket is known to have.
    const publication: Publication | undefined = patching
      ? {
          version,
          session: { ...event.session, messages: event.session.messages.map((message) => ({ ...message })) },
          ...(received.summary && !previous ? { unread: true as const } : {}),
        }
      : undefined
    if (publication) {
      this.publications.set(key, publication)
    } else {
      this.publications.clear()
    }
    let full: string | undefined
    let versioned: string | undefined
    let patch: string | undefined
    let diff: { keep: number; messages: ChatMessage[] } | undefined
    const changes = () => {
      diff ??= diffMessages(previous!.session.messages, event.session.messages)
      return diff
    }
    const windows = new Map<number, { payload: string; start: number }>()
    for (const socket of this.sockets) {
      if (socket.readyState !== 1) continue
      if (!socket.patchVersions) {
        full ??= JSON.stringify(event)
        socket.send(full)
        continue
      }
      const holds = previous !== undefined && socket.patchVersions.get(key) === previous.version
      const size = socket.transcriptWindow
      socket.patchVersions.set(key, version)
      if (size === undefined) {
        if (holds) {
          patch ??= this.patch(event, previous, version, changes())
          socket.send(patch)
        } else {
          versioned ??= JSON.stringify({ ...event, patchVersion: version })
          socket.send(versioned)
        }
        continue
      }
      socket.windowStarts ??= new Map()
      if (holds) {
        const { keep, messages } = changes()
        if (keep >= (socket.windowStarts.get(key) ?? 0) && messages.length <= size) {
          patch ??= this.patch(event, previous, version, changes())
          socket.send(patch)
          continue
        }
      }
      let windowed = windows.get(size)
      if (!windowed) {
        windowed = this.windowed(publication!, size, previous && { previous, keep: changes().keep })
        windows.set(size, windowed)
      }
      socket.windowStarts.set(key, windowed.start)
      socket.send(windowed.payload)
    }
  }

  private patch(
    event: SessionUpserted,
    previous: Publication,
    version: number,
    { keep, messages: tail }: { keep: number; messages: ChatMessage[] },
  ): string {
    const { messages, ...summary } = event.session
    const patch: SessionMessagesPatch = {
      from: previous.version,
      to: version,
      keep,
      count: messages.length,
      messages: tail,
    }
    return JSON.stringify({ type: 'session.patched', session: summary, patch })
  }

  /**
   * A publication as a windowed socket is sent it whole: its latest messages,
   * where they start, and the rows from before them the browser draws or, when
   * it is replacing `changed.previous`, holds and must update.
   */
  private windowed(
    publication: Publication,
    size: number,
    changed?: { previous: Publication; keep: number },
  ): { payload: string; start: number } {
    const { session, version } = publication
    if (publication.unread) {
      // Its transcript was never read: saying it is empty would blank the
      // browser's copy, so it goes as the summary it is.
      return {
        payload: JSON.stringify({ type: 'session.upserted', session, summary: true, patchVersion: version }),
        start: 0,
      }
    }
    const window = windowTranscript(transcriptOf(session.messages), size)
    let carried = window.carriedMessages
    if (changed && changed.keep < window.messagesStart) {
      const updated = changedInPlace(
        changed.previous.session.messages, session.messages, changed.keep, window.messagesStart,
      ).filter((message) => !carried.includes(message))
      if (updated.length) {
        const order = new Map(session.messages.map((message, index) => [message, index]))
        carried = [...carried, ...updated].sort((left, right) => order.get(left)! - order.get(right)!)
      }
    }
    return {
      payload: JSON.stringify({
        type: 'session.upserted',
        session: { ...session, ...window, carriedMessages: carried },
        patchVersion: version,
      }),
      start: window.messagesStart,
    }
  }
}
