import type {
  ComputerSummary,
  HubEvent,
  ManagedSession,
  SessionDetail,
  SessionStatus,
} from '../shared/contracts.js'
import { mapWithConcurrency } from './computer-manager.js'

export interface DreamerProgressLimits {
  excerptLength: number
  openEntries: number
  closedEntries: number
  closedRetentionMs: number
  readsPerRefresh: number
  readConcurrency: number
  readTimeoutMs: number
  readRetryMs: number
}

export const DEFAULT_DREAMER_PROGRESS_LIMITS: DreamerProgressLimits = {
  excerptLength: 300,
  openEntries: 200,
  closedEntries: 20,
  closedRetentionMs: 24 * 60 * 60_000,
  readsPerRefresh: 12,
  readConcurrency: 3,
  readTimeoutMs: 10_000,
  readRetryMs: 15 * 60_000,
}

export interface DreamerProgressReply {
  excerpt: string
  at: string
  taskComplete: boolean
}

export interface DreamerProgressRequest {
  kind: 'question' | 'permission'
  excerpt: string
}

export interface TranscriptProgress {
  latest?: DreamerProgressReply
  request?: DreamerProgressRequest
}

export interface DreamerProgressEntry {
  computerId: string
  sessionId: string
  computerName: string
  title: string
  status: SessionStatus
  isOpen: boolean
  revision: number
  updatedAt: string
  latest?: DreamerProgressReply
  request?: DreamerProgressRequest
  /** The version of the session the transcript fields were read from. */
  detail?: { revision: number; updatedAt: string }
  closedAt?: string
  retryReadAt?: string
}

export interface DreamerProgressSnapshot {
  refreshedAt?: string
  staleComputers: { id: string; name: string }[]
  entries: DreamerProgressEntry[]
}

export interface DreamerProgressRefresh {
  /** Open sessions as listed by computers that answered for themselves. */
  authoritative: ManagedSession[]
}

export interface DreamerProgressSource {
  listSessionsWithAuthority(): Promise<{
    sessions: ManagedSession[]
    answeredComputerIds: string[]
  }>
  listComputers(): Pick<ComputerSummary, 'id' | 'name'>[]
  /** Must be passive: reading a session must never resume or close it. */
  readSession(computerId: string, sessionId: string): Promise<ManagedSession>
}

export interface DreamerProgressOptions {
  now?: () => Date
  limits?: Partial<DreamerProgressLimits>
}

/**
 * Listings are coalesced and can briefly hide a session, so one omission is
 * not enough to call a session closed.
 */
const ABSENCE_STRIKES = 2

const READ_PRIORITY: Record<SessionStatus, number> = {
  waiting: 0,
  error: 1,
  running: 2,
  idle: 3,
}

export function progressExcerpt(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const cut = clean.slice(0, Math.max(0, limit - 1)).replace(/[\uD800-\uDBFF]$/, '')
  return `${cut.trimEnd()}…`
}

export function transcriptProgress(session: SessionDetail, limit: number): TranscriptProgress {
  const progress: TranscriptProgress = {}
  for (let index = session.messages.length - 1; index >= 0; index -= 1) {
    const message = session.messages[index]
    if (message.role !== 'assistant' || message.streaming || !message.content.trim()) continue
    progress.latest = {
      excerpt: progressExcerpt(message.content, limit),
      at: message.createdAt,
      taskComplete: message.taskCompletion?.source === 'root-task-complete',
    }
    break
  }
  if (session.pendingUserInput && !session.pendingUserInput.stale) {
    progress.request = {
      kind: 'question',
      excerpt: progressExcerpt(session.pendingUserInput.question, limit),
    }
  } else if (session.pendingPermission && !session.pendingPermission.stale) {
    progress.request = {
      kind: 'permission',
      excerpt: progressExcerpt(session.pendingPermission.title, limit),
    }
  }
  return progress
}

interface Versioned {
  revision?: number
  updatedAt: string
}

function timeOf(value: string | undefined): number {
  const time = value ? Date.parse(value) : Number.NaN
  return Number.isFinite(time) ? time : 0
}

/** Revisions only grow; the time breaks a tie within one revision. */
export function notOlder(incoming: Versioned, current: Versioned): boolean {
  const incomingRevision = incoming.revision ?? 0
  const currentRevision = current.revision ?? 0
  if (incomingRevision !== currentRevision) return incomingRevision > currentRevision
  return timeOf(incoming.updatedAt) >= timeOf(current.updatedAt)
}

function keyOf(computerId: string, sessionId: string): string {
  return `${computerId}\u0000${sessionId}`
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Session read timed out after ${ms} ms`)), ms)
    timer.unref?.()
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * What every session was last seen doing, kept current by hub events and a
 * periodic listing, so Oracle can answer from it without reading each
 * transcript on demand.
 *
 * Every source merges monotonically: an older listing, read or event never
 * replaces a newer one.
 */
export class DreamerProgress {
  private readonly now: () => Date
  private readonly limits: DreamerProgressLimits
  private readonly entries = new Map<string, DreamerProgressEntry>()
  private readonly strikes = new Map<string, number>()
  private staleComputers: { id: string; name: string }[] = []
  private refreshedAt?: string
  private generation = 0
  private inflight?: Promise<DreamerProgressRefresh | undefined>
  /** Sessions an event touched while a listing was in flight. */
  private listingTouches?: Set<string>

  constructor(
    private readonly source: DreamerProgressSource,
    options: DreamerProgressOptions = {},
  ) {
    this.now = options.now ?? (() => new Date())
    this.limits = { ...DEFAULT_DREAMER_PROGRESS_LIMITS, ...options.limits }
  }

  applyEvent(event: HubEvent): void {
    switch (event.type) {
      case 'session.upserted':
        this.touch(keyOf(event.session.computerId, event.session.id))
        this.merge(event.session, event.summary !== true)
        break
      case 'session.removed': {
        const key = keyOf(event.computerId, event.sessionId)
        this.touch(key)
        if (event.replacedBy) {
          this.drop(key)
        } else {
          // A node resync reports a session that merely closed this way too.
          const entry = this.entries.get(key)
          if (entry) this.close(entry)
        }
        break
      }
      case 'computer.removed':
        for (const [key, entry] of this.entries) {
          if (entry.computerId === event.computerId) this.drop(key)
        }
        this.staleComputers = this.staleComputers.filter(({ id }) => id !== event.computerId)
        break
      default:
        return
    }
    this.prune()
  }

  /** One refresh at a time; a caller that arrives mid-refresh shares it. */
  refresh(): Promise<DreamerProgressRefresh | undefined> {
    if (this.inflight) return this.inflight
    const promise = this.runRefresh(this.generation)
    this.inflight = promise
    const settle = () => {
      if (this.inflight === promise) this.inflight = undefined
    }
    promise.then(settle, settle)
    return promise
  }

  /** Forgets everything; a refresh already running resolves without writing. */
  clear(): void {
    this.generation += 1
    this.inflight = undefined
    this.listingTouches = undefined
    this.entries.clear()
    this.strikes.clear()
    this.staleComputers = []
    this.refreshedAt = undefined
  }

  snapshot(): DreamerProgressSnapshot {
    const entries = [...this.entries.values()]
      .map((entry) => structuredClone(entry))
      .sort((left, right) =>
        timeOf(right.updatedAt) - timeOf(left.updatedAt) ||
        left.computerId.localeCompare(right.computerId) ||
        left.sessionId.localeCompare(right.sessionId))
    return {
      ...(this.refreshedAt ? { refreshedAt: this.refreshedAt } : {}),
      staleComputers: this.staleComputers.map((computer) => ({ ...computer })),
      entries,
    }
  }

  private async runRefresh(generation: number): Promise<DreamerProgressRefresh | undefined> {
    const touches = new Set<string>()
    this.listingTouches = touches
    let listing: Awaited<ReturnType<DreamerProgressSource['listSessionsWithAuthority']>>
    try {
      listing = await this.source.listSessionsWithAuthority()
    } finally {
      if (this.listingTouches === touches) this.listingTouches = undefined
    }
    if (generation !== this.generation) return undefined

    const registered = new Map(this.source.listComputers().map(({ id, name }) => [id, name]))
    const answered = new Set(listing.answeredComputerIds.filter((id) => registered.has(id)))
    this.applyListing(listing.sessions, registered, answered, touches)
    this.staleComputers = [...registered]
      .filter(([id]) => !answered.has(id))
      .map(([id, name]) => ({ id, name }))
    this.prune()

    await this.readStaleTranscripts(generation, answered)
    if (generation !== this.generation) return undefined
    this.refreshedAt = this.now().toISOString()
    this.prune()
    return {
      authoritative: listing.sessions.filter((session) => answered.has(session.computerId)),
    }
  }

  private applyListing(
    sessions: readonly ManagedSession[],
    registered: ReadonlyMap<string, string>,
    answered: ReadonlySet<string>,
    touches: ReadonlySet<string>,
  ): void {
    for (const [key, entry] of this.entries) {
      if (!registered.has(entry.computerId)) this.drop(key)
    }
    const listed = new Set<string>()
    for (const session of sessions) {
      if (!registered.has(session.computerId)) continue
      const key = keyOf(session.computerId, session.id)
      listed.add(key)
      if (answered.has(session.computerId)) this.strikes.delete(key)
      // An event that arrived while the listing was in flight is at least as new.
      if (!touches.has(key)) this.merge(session, false)
    }
    for (const [key, entry] of this.entries) {
      if (!entry.isOpen || !answered.has(entry.computerId) || listed.has(key) || touches.has(key)) {
        continue
      }
      const strikes = (this.strikes.get(key) ?? 0) + 1
      if (strikes < ABSENCE_STRIKES) {
        this.strikes.set(key, strikes)
      } else {
        this.close(entry)
      }
    }
  }

  private async readStaleTranscripts(generation: number, answered: ReadonlySet<string>): Promise<void> {
    const now = this.now().getTime()
    const candidates = [...this.entries.values()]
      .filter((entry) =>
        entry.isOpen &&
        answered.has(entry.computerId) &&
        !(entry.retryReadAt && timeOf(entry.retryReadAt) > now) &&
        !(entry.detail && notOlder(entry.detail, entry)))
      .sort((left, right) =>
        READ_PRIORITY[left.status] - READ_PRIORITY[right.status] ||
        timeOf(right.updatedAt) - timeOf(left.updatedAt))
      .slice(0, this.limits.readsPerRefresh)
      .map(({ computerId, sessionId }) => ({ computerId, sessionId }))

    await mapWithConcurrency(candidates, this.limits.readConcurrency, async ({ computerId, sessionId }) => {
      if (generation !== this.generation) return
      const key = keyOf(computerId, sessionId)
      let session: ManagedSession
      try {
        session = await withTimeout(
          this.source.readSession(computerId, sessionId),
          this.limits.readTimeoutMs,
        )
      } catch {
        const entry = this.entries.get(key)
        if (generation === this.generation && entry) {
          entry.retryReadAt = new Date(this.now().getTime() + this.limits.readRetryMs).toISOString()
        }
        return
      }
      const entry = this.entries.get(key)
      // Only an event can have closed or replaced it meanwhile, and that is newer.
      if (generation !== this.generation || !entry?.isOpen) return
      delete entry.retryReadAt
      if (session.computerId === computerId && session.id === sessionId) {
        this.strikes.delete(key)
        this.merge(session, true)
      }
    })
  }

  private merge(session: ManagedSession, transcript: boolean): void {
    const key = keyOf(session.computerId, session.id)
    const current = this.entries.get(key)
    if (current && !notOlder(session, current)) return
    const next: DreamerProgressEntry = {
      computerId: session.computerId,
      sessionId: session.id,
      computerName: session.computerName,
      title: session.title,
      status: session.status,
      isOpen: session.isOpen !== false,
      revision: session.revision ?? 0,
      updatedAt: session.updatedAt,
    }
    if (transcript) {
      const progress = transcriptProgress(session, this.limits.excerptLength)
      // A recovered transcript can drop its old replies; the last one still stands.
      const latest = progress.latest ?? current?.latest
      if (latest) next.latest = latest
      if (progress.request) next.request = progress.request
      next.detail = { revision: next.revision, updatedAt: next.updatedAt }
    } else if (current) {
      if (current.latest) next.latest = current.latest
      if (current.request) next.request = current.request
      if (current.detail) next.detail = current.detail
      if (current.retryReadAt) next.retryReadAt = current.retryReadAt
    }
    if (!next.isOpen) next.closedAt = current?.closedAt ?? this.now().toISOString()
    this.entries.set(key, next)
  }

  private close(entry: DreamerProgressEntry): void {
    this.strikes.delete(keyOf(entry.computerId, entry.sessionId))
    entry.isOpen = false
    entry.closedAt ??= this.now().toISOString()
  }

  private touch(key: string): void {
    this.strikes.delete(key)
    this.listingTouches?.add(key)
  }

  private drop(key: string): void {
    this.entries.delete(key)
    this.strikes.delete(key)
  }

  private prune(): void {
    const now = this.now().getTime()
    const open: [string, DreamerProgressEntry][] = []
    const closed: [string, DreamerProgressEntry][] = []
    for (const [key, entry] of this.entries) {
      if (entry.isOpen) {
        open.push([key, entry])
      } else if (now - timeOf(entry.closedAt) > this.limits.closedRetentionMs) {
        this.drop(key)
      } else {
        closed.push([key, entry])
      }
    }
    this.dropOldest(closed, this.limits.closedEntries, (entry) => timeOf(entry.closedAt))
    this.dropOldest(open, this.limits.openEntries, (entry) => timeOf(entry.updatedAt))
  }

  private dropOldest(
    items: [string, DreamerProgressEntry][],
    limit: number,
    timeOfEntry: (entry: DreamerProgressEntry) => number,
  ): void {
    if (items.length <= limit) return
    items
      .sort(([, left], [, right]) => timeOfEntry(left) - timeOfEntry(right))
      .slice(0, items.length - limit)
      .forEach(([key]) => this.drop(key))
  }
}
