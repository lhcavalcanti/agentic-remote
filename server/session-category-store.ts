import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { CLOSED_SESSION_RETENTION_MS } from '../shared/closed-sessions.js'
import {
  SessionCategoryRefusal,
  applySessionCategoryChange,
  isSessionCategoryId,
  isSessionCategoryKey,
  sessionCategoryName,
  type SessionCategoriesSnapshot,
  type SessionCategory,
  type SessionCategoryChange,
} from '../shared/session-categories.js'

/** Bumped only when a load-breaking shape change ships. */
const STATE_VERSION = 1
/** A closed member is kept this long past the closed session's own retention. */
const CLOSED_MEMBER_GRACE_MS = 24 * 60 * 60 * 1000
/** Sessions and computers that left recently; see `departed`. */
const DEPARTED_LIMIT = 256
/** Places plain removals took, for a legacy clear's successor; see `retired`. */
const RETIRED_LIMIT = 64

type Fields = Record<string, unknown>

interface CategoryState {
  revision: number
  categories: SessionCategory[]
  /** Members whose session is closed, by when it closed. Reopening gives them back their place. */
  closed: Record<string, string>
}

function key(computerId: string, sessionId: string): string {
  return `${computerId}:${sessionId}`
}

function isRecord(value: unknown): value is Fields {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function remember<T>(entries: Map<string, T>, entryKey: string, value: T, limit: number): void {
  entries.delete(entryKey)
  entries.set(entryKey, value)
  const [oldest] = entries.keys()
  if (entries.size > limit && oldest !== undefined) entries.delete(oldest)
}

function refused(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode })
}

function validName(name: unknown): name is string {
  if (typeof name !== 'string') return false
  try {
    return sessionCategoryName(name) === name
  } catch {
    return false
  }
}

/**
 * The state a version 1 file holds, with what each category carries that this
 * release does not know, or nothing when the file does not have the shape
 * this release writes. Such a file is left alone rather than repaired, which
 * would quietly drop whatever did not fit.
 */
function parseState(parsed: Fields): { state: CategoryState; extra: Fields; categoryExtra: Map<string, Fields> } | undefined {
  const { version: _version, revision = 0, categories, closed = {}, ...extra } = parsed
  if (typeof revision !== 'number' || !Number.isInteger(revision) || revision < 0) return undefined
  if (!Array.isArray(categories) || !isRecord(closed)) return undefined
  const loaded: SessionCategory[] = []
  const categoryExtra = new Map<string, Fields>()
  const members = new Set<string>()
  const names = new Set<string>()
  for (const entry of categories) {
    if (!isRecord(entry)) return undefined
    const { id, name, collapsed, sessions, ...rest } = entry
    if (typeof id !== 'string' || !isSessionCategoryId(id) || categoryExtra.has(id)) return undefined
    if (!validName(name) || names.has(name.toLocaleLowerCase())) return undefined
    if (typeof collapsed !== 'boolean' || !Array.isArray(sessions)) return undefined
    for (const member of sessions) {
      if (typeof member !== 'string' || !isSessionCategoryKey(member) || members.has(member)) return undefined
      members.add(member)
    }
    names.add(name.toLocaleLowerCase())
    categoryExtra.set(id, rest)
    loaded.push({ id, name, collapsed, sessions: sessions as string[] })
  }
  for (const [member, closedAt] of Object.entries(closed)) {
    if (!members.has(member) || typeof closedAt !== 'string') return undefined
  }
  return { state: { revision, categories: loaded, closed: { ...closed } as Record<string, string> }, extra, categoryExtra }
}

/**
 * The hub's session categories, kept in `session-categories.json` beside, and
 * never inside, `session-order.json`: a release that predates categories
 * ignores this file, so rolling back leaves it alone and rolling forward
 * finds it again.
 *
 * Fields this release does not know are written back as they were read, so
 * a newer release's additions survive a rollback. A file from a newer
 * version, or one that cannot be read, is left untouched and categories are
 * unavailable rather than reset or allowed to stop the hub starting.
 *
 * Every commit increments `revision` and persists before it is reported. A
 * browser's change names the revision it was made against and is refused once
 * the hub has moved past it; lifecycle changes the hub observes itself apply
 * whatever the revision.
 */
export class SessionCategoryStore {
  private readonly statePath: string
  private readonly now: () => number
  private state: CategoryState = { revision: 0, categories: [], closed: {} }
  /** What the file held that this release does not know, written back unchanged. */
  private extra: Fields = {}
  private categoryExtra = new Map<string, Fields>()
  private unavailable?: string
  /** Serializes whole commits, as the session order does. */
  private commits: Promise<unknown> = Promise.resolve()
  /**
   * Sessions and computers removed or closed since this hub started, until
   * listed again. The session list a move is checked against may not have
   * caught up with a removal the store already applied, and a move let
   * through then would keep a session that no longer exists.
   */
  private departedSessions = new Map<string, true>()
  private departedComputers = new Map<string, true>()
  /**
   * Places that plain removals took. A node that predates replacement links
   * reports a clear as a plain removal before its response names the
   * successor, which then takes the place. Only that response comes back for
   * one, moments later, so they stay in memory.
   */
  private retired = new Map<string, { categoryId: string; index: number }>()

  constructor(private readonly directory: string, options: { now?: () => number } = {}) {
    this.statePath = path.join(directory, 'session-categories.json')
    this.now = options.now ?? Date.now
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    let raw: string
    try {
      raw = await readFile(this.statePath, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.unavailable = `Session categories at ${this.statePath} cannot be read (${
          (error as NodeJS.ErrnoException).code ?? 'unknown error'}); categories are unavailable until it can be`
        return
      }
      await this.persist()
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = undefined
    }
    if (!isRecord(parsed)) {
      this.unavailable = `Session categories at ${this.statePath} are not readable; categories are unavailable until the file is repaired`
      return
    }
    if (parsed.version !== undefined && parsed.version !== STATE_VERSION) {
      this.unavailable = `Session categories at ${this.statePath} were saved by a newer release; categories are unavailable until it is running again`
      return
    }
    const loaded = parseState(parsed)
    if (!loaded) {
      this.unavailable = `Session categories at ${this.statePath} are not readable as this release writes them; categories are unavailable until the file is repaired`
      return
    }
    this.state = loaded.state
    this.extra = loaded.extra
    this.categoryExtra = loaded.categoryExtra
    // Closed sessions that expired while the hub was down leave their
    // categories now; if that cannot be saved, the next commit tries again.
    const loadedState = this.state
    const pruned: CategoryState = { ...loadedState, closed: { ...loadedState.closed } }
    if (this.expire(pruned)) {
      this.state = { ...pruned, revision: loadedState.revision + 1 }
      try {
        await this.persist()
      } catch {
        this.state = loadedState
      }
    }
  }

  /** Why categories cannot be used on this hub, when they cannot. */
  unavailableReason(): string | undefined {
    return this.unavailable
  }

  snapshot(): SessionCategoriesSnapshot {
    return { revision: this.state.revision, categories: structuredClone(this.state.categories) }
  }

  /**
   * A change a browser made against `revision`. `listed` says whether the
   * session list holds a session, which only a listed one may be placed by.
   */
  async change(
    revision: number,
    change: SessionCategoryChange,
    listed: (sessionKey: string) => boolean = () => true,
  ): Promise<SessionCategoriesSnapshot> {
    if (this.unavailable) throw refused(this.unavailable, 503)
    return this.commit((state) => {
      // Checked inside the commit: a lifecycle change queued ahead of this one
      // has already moved the revision on.
      if (revision !== state.revision) {
        throw refused('Categories changed on another device; reload the session list and try again', 409)
      }
      const placed = change.type === 'create' ? change.sessions ?? []
        : change.type === 'move' && change.categoryId !== null ? change.sessions : []
      const gone = placed.find((member) => isSessionCategoryKey(member) && (
        !listed(member) || this.departedSessions.has(member) ||
        this.departedComputers.has(member.slice(0, member.indexOf(':')))))
      if (gone) throw refused(`Session ${gone} is not in the session list; reload the session list`, 409)
      let next: SessionCategory[]
      try {
        next = applySessionCategoryChange(state.categories, change)
      } catch (error) {
        if (error instanceof SessionCategoryRefusal) throw refused(error.message, error.statusCode)
        throw error
      }
      if (next === state.categories) return false
      state.categories = next
      for (const member of placed) delete state.closed[member]
      return true
    })
  }

  /**
   * A session the hub lists: discovered, created, reopened, or found again at
   * startup. Discovery never places one, but a reopened session takes back
   * the place it had when it closed, and a successor the hub never saw
   * replace its ancestor takes that ancestor's place.
   */
  async sessionListed(
    computerId: string,
    sessionId: string,
    replacedSessionIds: readonly string[] = [],
  ): Promise<SessionCategoriesSnapshot> {
    const listedKey = key(computerId, sessionId)
    this.departedSessions.delete(listedKey)
    this.departedComputers.delete(computerId)
    return this.lifecycle((state) => {
      if (listedKey in state.closed) {
        delete state.closed[listedKey]
        return true
      }
      if (state.categories.some((category) => category.sessions.includes(listedKey))) return false
      const ancestors = replacedSessionIds.map((previous) => key(computerId, previous))
      for (const ancestor of ancestors) remember(this.departedSessions, ancestor, true, DEPARTED_LIMIT)
      const ancestor = ancestors
        .find((previous) => state.categories.some((category) => category.sessions.includes(previous)))
      return ancestor ? this.replaced(state, ancestor, listedKey) : false
    })
  }

  /** Clear and Recover: the replacement takes its predecessor's category and place. */
  async replaceSession(
    computerId: string,
    previousSessionId: string,
    nextSessionId: string,
  ): Promise<SessionCategoriesSnapshot> {
    if (previousSessionId === nextSessionId) return this.snapshot()
    const previousKey = key(computerId, previousSessionId)
    const nextKey = key(computerId, nextSessionId)
    // The predecessor no longer exists, whatever a stale view still shows.
    remember(this.departedSessions, previousKey, true, DEPARTED_LIMIT)
    this.departedSessions.delete(nextKey)
    return this.lifecycle((state) => this.replaced(state, previousKey, nextKey))
  }

  /** Close keeps the session where it is, out of sight, for Reopen to give back. */
  async sessionClosed(computerId: string, sessionId: string): Promise<SessionCategoriesSnapshot> {
    const closedKey = key(computerId, sessionId)
    remember(this.departedSessions, closedKey, true, DEPARTED_LIMIT)
    return this.lifecycle((state) => {
      if (closedKey in state.closed ||
        !state.categories.some((category) => category.sessions.includes(closedKey))) return false
      state.closed[closedKey] = new Date(this.now()).toISOString()
      return true
    })
  }

  /** Delete, and a session gone from its computer's list: it leaves its category. */
  async removeSession(computerId: string, sessionId: string): Promise<SessionCategoriesSnapshot> {
    const removedKey = key(computerId, sessionId)
    remember(this.departedSessions, removedKey, true, DEPARTED_LIMIT)
    return this.lifecycle((state) => {
      delete state.closed[removedKey]
      const category = state.categories.find((entry) => entry.sessions.includes(removedKey))
      if (!category) return false
      remember(this.retired, removedKey, {
        categoryId: category.id, index: category.sessions.indexOf(removedKey),
      }, RETIRED_LIMIT)
      state.categories = state.categories.map((entry) => entry === category
        ? { ...entry, sessions: entry.sessions.filter((member) => member !== removedKey) }
        : entry)
      return true
    })
  }

  /** Unpairing a computer takes its sessions out of every category. */
  async removeComputer(computerId: string): Promise<SessionCategoriesSnapshot> {
    remember(this.departedComputers, computerId, true, DEPARTED_LIMIT)
    const prefix = `${computerId}:`
    return this.lifecycle((state) => {
      let changed = false
      state.categories = state.categories.map((category) => {
        const kept = category.sessions.filter((member) => !member.startsWith(prefix))
        if (kept.length === category.sessions.length) return category
        changed = true
        return { ...category, sessions: kept }
      })
      for (const member of Object.keys(state.closed)) {
        if (member.startsWith(prefix)) delete state.closed[member]
      }
      for (const member of [...this.retired.keys()]) {
        if (member.startsWith(prefix)) this.retired.delete(member)
      }
      return changed
    })
  }

  /** Moves `previous`'s place to `next`, or restores the place a plain removal retired. */
  private replaced(state: CategoryState, previous: string, next: string): boolean {
    const holder = state.categories.find((category) => category.sessions.includes(previous))
    const retired = this.retired.get(previous)
    this.retired.delete(previous)
    delete state.closed[previous]
    const placed = state.categories.some((category) => category.sessions.includes(next))
    if (holder) {
      // A successor already placed somewhere stays there; the predecessor just leaves.
      state.categories = state.categories.map((category) => category !== holder ? category : {
        ...category,
        sessions: placed
          ? category.sessions.filter((member) => member !== previous)
          : category.sessions.map((member) => member === previous ? next : member),
      })
      return true
    }
    const category = retired && state.categories.find((entry) => entry.id === retired.categoryId)
    if (!retired || !category || placed) return false
    const sessions = [...category.sessions]
    sessions.splice(Math.min(retired.index, sessions.length), 0, next)
    state.categories = state.categories.map((entry) => entry === category ? { ...entry, sessions } : entry)
    return true
  }

  /** Closed members whose session can no longer be reopened leave their category. */
  private expire(state: CategoryState): boolean {
    const cutoff = this.now() - CLOSED_SESSION_RETENTION_MS - CLOSED_MEMBER_GRACE_MS
    const expired = Object.entries(state.closed)
      .filter(([, closedAt]) => !(Date.parse(closedAt) > cutoff))
      .map(([member]) => member)
    if (expired.length === 0) return false
    for (const member of expired) delete state.closed[member]
    state.categories = state.categories.map((category) => {
      const kept = category.sessions.filter((member) => !expired.includes(member))
      return kept.length === category.sessions.length ? category : { ...category, sessions: kept }
    })
    return true
  }

  private lifecycle(mutate: (state: CategoryState) => boolean): Promise<SessionCategoriesSnapshot> {
    if (this.unavailable) return Promise.resolve(this.snapshot())
    return this.commit(mutate)
  }

  /**
   * Applies a mutation, persisting before it reports the new revision. A
   * mutation that changes nothing keeps the revision; a failed write puts
   * back the state and everything held in memory with it, so it can be retried.
   */
  private commit(mutate: (state: CategoryState) => boolean): Promise<SessionCategoriesSnapshot> {
    const run = this.commits.then(async () => {
      const previous = this.state
      const retired = new Map(this.retired)
      const staged: CategoryState = {
        revision: previous.revision,
        categories: previous.categories,
        closed: { ...previous.closed },
      }
      // Expired first, so nothing can reclaim a place that has already lapsed.
      const expired = this.expire(staged)
      const changed = mutate(staged)
      if (!changed && !expired) return this.snapshot()
      this.state = { ...staged, revision: previous.revision + 1 }
      try {
        await this.persist()
      } catch (error) {
        this.state = previous
        this.retired = retired
        throw error
      }
      return this.snapshot()
    })
    this.commits = run.catch(() => undefined)
    return run
  }

  private async persist(): Promise<void> {
    const snapshot = JSON.stringify({
      ...this.extra,
      version: STATE_VERSION,
      revision: this.state.revision,
      categories: this.state.categories.map((category) => ({
        ...this.categoryExtra.get(category.id),
        ...category,
      })),
      closed: this.state.closed,
    }, null, 2)
    const temporary = `${this.statePath}.tmp`
    await writeFile(temporary, snapshot, { mode: 0o600 })
    await rename(temporary, this.statePath)
    // Only once the write stands: a category whose deletion failed keeps them.
    const ids = new Set(this.state.categories.map((category) => category.id))
    for (const id of [...this.categoryExtra.keys()]) if (!ids.has(id)) this.categoryExtra.delete(id)
  }
}
