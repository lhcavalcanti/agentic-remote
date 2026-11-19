import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { SessionOrderSnapshot } from '../shared/contracts.js'

/** Bumped only when a load-breaking shape change ships. */
const STATE_VERSION = 1

interface SessionOrderState {
  version: number
  revision: number
  /**
   * Whether a browser's pre-hub order has already been taken. Lifecycle
   * discovery appends sessions on its own, so an order that is no longer empty
   * is not evidence that a migration happened; without this flag the first
   * appended session would lock every device out of its saved arrangement.
   */
  bootstrapped: boolean
  showSuspended: boolean
  showHidden: boolean
  /**
   * Sessions left out of the Sessions list. A key is only added while its
   * lane holds it, and leaves with it, so this never outgrows the order.
   */
  hidden: string[]
  /**
   * Sessions whose last turn ended while nobody was reading them, or that
   * someone marked unread. Bounded by the order exactly as `hidden` is.
   */
  unread: string[]
  order: Record<string, string[]>
}

/** The shared list visibility a client may change; omitted fields keep their value. */
export interface SessionVisibility {
  showSuspended?: boolean
  showHidden?: boolean
}

export function sessionOrderKey(computerId: string, sessionId: string): string {
  return `${computerId}:${sessionId}`
}

/**
 * Keys a plain removal took out of the list that a replacement may still
 * inherit, oldest first. Only a clear's own response comes back for one,
 * moments later, so a few dozen is plenty.
 */
function retire(retired: Set<string>, key: string): void {
  retired.add(key)
  const [oldest] = retired
  if (retired.size > 64 && oldest !== undefined) retired.delete(oldest)
}

function laneFrom(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const keys: string[] = []
  for (const entry of value) {
    // A duplicate would give one session two positions, and the second one
    // would silently win on every later lookup.
    if (typeof entry !== 'string' || !entry || keys.includes(entry)) continue
    keys.push(entry)
  }
  return keys
}

/**
 * The hub's durable custom session order.
 *
 * Every mutation that changes something increments `revision` and persists
 * before it is reported, so a committed revision is one that survived the
 * write. Nothing here reads provider session state: the store is told what
 * happened by the lifecycle it subscribes to, which keeps a preference file
 * from becoming a second, competing source of truth about sessions.
 */
export class SessionOrderStore {
  private readonly statePath: string
  private state: SessionOrderState = {
    version: STATE_VERSION,
    revision: 0,
    bootstrapped: false,
    showSuspended: true,
    showHidden: false,
    hidden: [],
    unread: [],
    order: {},
  }
  /**
   * Serializes whole commits. A commit reads, mutates, and persists, so
   * overlapping ones would otherwise publish a revision that never reached
   * disk, or undo a newer write while restoring their own.
   */
  private commits: Promise<unknown> = Promise.resolve()
  /**
   * Hidden or unread sessions a plain removal took out of the list. A node
   * that predates replacement links reports a clear that way before its
   * response names the successor, which then inherits them; a Show or a read
   * in between clears it, and so does the same session being listed again.
   * Nothing else reads them, so they stay in memory.
   */
  private retiredHidden = new Set<string>()
  private retiredUnread = new Set<string>()

  constructor(private readonly directory: string) {
    this.statePath = path.join(directory, 'session-order.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    let raw: string
    try {
      raw = await readFile(this.statePath, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
      await this.persist()
      return
    }
    let parsed: Partial<SessionOrderState>
    try {
      parsed = JSON.parse(raw) as Partial<SessionOrderState>
    } catch (error) {
      // Resetting would silently discard an order the user arranged by hand.
      // Refusing to start is recoverable; quietly forgetting is not.
      throw new Error(
        `Session order state at ${this.statePath} is not readable JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
    if (parsed.version !== undefined && parsed.version !== STATE_VERSION) {
      throw new Error(
        `Session order state at ${this.statePath} has unsupported version ${String(parsed.version)}`,
      )
    }
    const order: Record<string, string[]> = {}
    for (const [computerId, lane] of Object.entries(parsed.order ?? {})) {
      const keys = laneFrom(lane)
      if (keys && keys.length > 0) order[computerId] = keys
    }
    this.state = {
      version: STATE_VERSION,
      revision: typeof parsed.revision === 'number' && parsed.revision >= 0 ? parsed.revision : 0,
      bootstrapped: parsed.bootstrapped === true,
      showSuspended: parsed.showSuspended !== false,
      // A file from before sessions could be hidden has neither field.
      showHidden: parsed.showHidden === true,
      hidden: laneFrom(parsed.hidden) ?? [],
      // Nor one from before sessions could be unread: nothing is.
      unread: laneFrom(parsed.unread) ?? [],
      order,
    }
  }

  snapshot(): SessionOrderSnapshot {
    return {
      revision: this.state.revision,
      bootstrapped: this.state.bootstrapped,
      showSuspended: this.state.showSuspended,
      showHidden: this.state.showHidden,
      hidden: [...this.state.hidden],
      unread: [...this.state.unread],
      order: structuredClone(this.state.order),
    }
  }

  /** Whether a pre-hub browser order has already been taken. */
  isBootstrapped(): boolean {
    return this.state.bootstrapped
  }

  /** Shares suspended- and hidden-session visibility across every browser on this hub. */
  async setVisibility(visibility: SessionVisibility): Promise<SessionOrderSnapshot> {
    return this.commit((_order, state) => {
      let changed = false
      if (
        visibility.showSuspended !== undefined &&
        state.showSuspended !== visibility.showSuspended
      ) {
        state.showSuspended = visibility.showSuspended
        changed = true
      }
      if (visibility.showHidden !== undefined && state.showHidden !== visibility.showHidden) {
        state.showHidden = visibility.showHidden
        changed = true
      }
      return changed
    })
  }

  /**
   * Leaves a session out of the Sessions list, or puts it back. Nothing about
   * the session itself changes. Only a session its lane holds can be hidden,
   * so a forged or stale key cannot accumulate; showing one is always safe.
   */
  async setSessionHidden(
    computerId: string,
    sessionId: string,
    hidden: boolean,
  ): Promise<SessionOrderSnapshot> {
    const key = sessionOrderKey(computerId, sessionId)
    return this.commit((order, state) => {
      if (!hidden) this.retiredHidden.delete(key)
      if (state.hidden.includes(key) === hidden) return false
      if (!hidden) {
        state.hidden = state.hidden.filter((entry) => entry !== key)
        return true
      }
      // Checked inside the commit: a removal queued ahead of this hide has
      // already retired the key, and hiding it would bring it back.
      if (!(order[computerId] ?? []).includes(key)) {
        throw Object.assign(
          new Error(`Session ${key} is not in the session list; reload the session list`),
          { statusCode: 409 },
        )
      }
      state.hidden = [...state.hidden, key]
      return true
    })
  }

  /**
   * Marks a session unread, or read. Like hiding, nothing about the session
   * itself changes, and only a session its lane holds can be marked unread;
   * marking one read is always safe. `ifListed` makes an unlisted session a
   * no-op rather than a refusal, for the hub's own mark when a turn ends just
   * as the session leaves.
   */
  async setSessionUnread(
    computerId: string,
    sessionId: string,
    unread: boolean,
    { ifListed = false }: { ifListed?: boolean } = {},
  ): Promise<SessionOrderSnapshot> {
    const key = sessionOrderKey(computerId, sessionId)
    return this.commit((order, state) => {
      if (!unread) this.retiredUnread.delete(key)
      if (state.unread.includes(key) === unread) return false
      if (!unread) {
        state.unread = state.unread.filter((entry) => entry !== key)
        return true
      }
      // Checked inside the commit: a removal queued ahead of this has already
      // retired the key, and marking it would bring it back.
      if (!(order[computerId] ?? []).includes(key)) {
        if (ifListed) return false
        throw Object.assign(
          new Error(`Session ${key} is not in the session list; reload the session list`),
          { statusCode: 409 },
        )
      }
      state.unread = [...state.unread, key]
      return true
    })
  }

  /** The position a session currently holds, for carrying it onto a successor. */
  indexOf(computerId: string, sessionId: string): number {
    return (this.state.order[computerId] ?? []).indexOf(
      sessionOrderKey(computerId, sessionId),
    )
  }

  /**
   * Replaces one computer's lane. Only the dragged lane is submitted so a
   * client holding a stale view of another computer cannot overwrite it.
   */
  async replaceLane(
    computerId: string,
    keys: string[],
  ): Promise<SessionOrderSnapshot> {
    const lane = laneFrom(keys)
    if (!lane) {
      throw Object.assign(new Error('Session order must be a list of keys'), {
        statusCode: 400,
      })
    }
    const foreign = lane.find((key) => !key.startsWith(`${computerId}:`))
    if (foreign) {
      // Sessions never move between computers, so a key from another lane is
      // a bug or a forged payload rather than a reorder.
      throw Object.assign(
        new Error(`Session order entry ${foreign} does not belong to ${computerId}`),
        { statusCode: 400 },
      )
    }
    return this.commit((order) => {
      const existing = order[computerId] ?? []
      // Checked inside the commit, not before it: a clear or unpair queued
      // ahead of this reorder would otherwise pass an earlier check and then
      // restore the key it had just retired.
      const unknown = lane.find((key) => !existing.includes(key))
      if (unknown) {
        // The client is arranging a session this lane no longer holds, so its
        // whole view is out of date. Dropping the unknown key and keeping the
        // rest would quietly move a cleared session's live successor last, so
        // the lane is refused and the client resynchronizes instead.
        throw Object.assign(
          new Error(
            `Session order for ${computerId} is out of date; reload the session list`,
          ),
          { statusCode: 409 },
        )
      }
      // Keys the client never saw keep their place at the end, so an order
      // written from a filtered view cannot delete them.
      const retained = existing.filter((key) => !lane.includes(key))
      const next = [...lane, ...retained]
      if (sameLane(existing, next)) return false
      order[computerId] = next
      return true
    })
  }

  /**
   * Takes a browser's pre-hub order, once. Lanes the hub already discovered
   * are rearranged to match rather than replaced, so sessions found before the
   * first browser connected keep their place instead of being dropped.
   */
  async bootstrap(order: Record<string, string[]>): Promise<SessionOrderSnapshot> {
    return this.commit((current, state) => {
      if (state.bootstrapped) return false
      state.bootstrapped = true
      let changed = true
      for (const [computerId, lane] of Object.entries(order)) {
        const keys = laneFrom(lane)?.filter((key) => key.startsWith(`${computerId}:`))
        if (!keys || keys.length === 0) continue
        const existing = current[computerId] ?? []
        const known = keys.filter((key) => existing.includes(key))
        const unseen = keys.filter((key) => !existing.includes(key))
        const rest = existing.filter((key) => !known.includes(key))
        current[computerId] = [...known, ...unseen, ...rest]
        changed = true
      }
      return changed
    })
  }

  /** Puts a newly discovered session at the end of its own computer's lane. */
  async appendSession(computerId: string, sessionId: string): Promise<SessionOrderSnapshot> {
    const key = sessionOrderKey(computerId, sessionId)
    return this.commit((order) => {
      const lane = order[computerId] ?? []
      if (lane.includes(key)) return false
      this.listedAgain(key)
      order[computerId] = [...lane, key]
      return true
    })
  }

  /**
   * Puts the replacement exactly where its predecessor sat. Clearing a session
   * creates a new one, and appending it would drop a session the user placed
   * deliberately to the bottom of the list.
   *
   * `fallbackIndex` covers a legacy node whose plain removal already retired
   * the predecessor before the clear response named its successor: the slot is
   * read before the clear and restored here. Whether it was hidden or unread
   * is what that removal retired.
   */
  async replaceSession(
    computerId: string,
    previousSessionId: string,
    nextSessionId: string,
    fallbackIndex?: number,
  ): Promise<SessionOrderSnapshot> {
    if (previousSessionId === nextSessionId) return this.snapshot()
    const previous = sessionOrderKey(computerId, previousSessionId)
    const next = sessionOrderKey(computerId, nextSessionId)
    return this.commit((order, state) => {
      // Clearing replaces the identity, not the decision to keep it out of
      // the list, nor what is still waiting to be read.
      const hidden = carried(state.hidden, this.retiredHidden, previous, next)
      const unread = carried(state.unread, this.retiredUnread, previous, next)
      const marksChanged =
        !sameLane(state.hidden, hidden) || !sameLane(state.unread, unread)
      state.hidden = hidden
      state.unread = unread
      const lane = order[computerId] ?? []
      const index = lane.indexOf(previous)
      if (index >= 0) {
        const replaced = [...lane]
        replaced[index] = next
        // A replacement key already further down would otherwise appear twice.
        order[computerId] = replaced.filter(
          (key, position) => key !== next || position === index,
        )
        return true
      }
      const already = lane.indexOf(next)
      if (already >= 0) {
        // The successor is present. Only move it if the remembered slot is a
        // better answer than where a plain append happened to leave it.
        if (fallbackIndex === undefined || fallbackIndex >= lane.length) return marksChanged
        const without = lane.filter((key) => key !== next)
        const target = Math.min(Math.max(fallbackIndex, 0), without.length)
        const restored = [...without]
        restored.splice(target, 0, next)
        if (sameLane(lane, restored)) return marksChanged
        order[computerId] = restored
        return true
      }
      const target =
        fallbackIndex === undefined
          ? lane.length
          : Math.min(Math.max(fallbackIndex, 0), lane.length)
      const inserted = [...lane]
      inserted.splice(target, 0, next)
      order[computerId] = inserted
      return true
    })
  }

  async removeSession(computerId: string, sessionId: string): Promise<SessionOrderSnapshot> {
    const key = sessionOrderKey(computerId, sessionId)
    return this.commit((order, state) => {
      const lane = order[computerId]
      const listed = lane?.includes(key) === true
      const hidden = state.hidden.includes(key)
      const unread = state.unread.includes(key)
      if (!listed && !hidden && !unread) return false
      if (lane && listed) {
        const next = lane.filter((entry) => entry !== key)
        if (next.length === 0) delete order[computerId]
        else order[computerId] = next
      }
      if (hidden) {
        state.hidden = state.hidden.filter((entry) => entry !== key)
        retire(this.retiredHidden, key)
      }
      if (unread) {
        state.unread = state.unread.filter((entry) => entry !== key)
        retire(this.retiredUnread, key)
      }
      return true
    })
  }

  async removeComputer(computerId: string): Promise<SessionOrderSnapshot> {
    return this.commit((order, state) => {
      const prefix = `${computerId}:`
      const hidden = state.hidden.filter((key) => !key.startsWith(prefix))
      const unread = state.unread.filter((key) => !key.startsWith(prefix))
      const marksChanged =
        hidden.length !== state.hidden.length || unread.length !== state.unread.length
      if (!(computerId in order) && !marksChanged) return false
      delete order[computerId]
      state.hidden = hidden
      state.unread = unread
      return true
    })
  }

  /**
   * A session listed again under the same id -- reopened after a close, or
   * found again after a delete -- starts afresh: what its last removal
   * retired belonged to that removal, and must not surface on a later clear.
   */
  private listedAgain(key: string): void {
    this.retiredHidden.delete(key)
    this.retiredUnread.delete(key)
  }

  /**
   * Applies a mutation, persisting before it reports the new revision.
   *
   * Commits run one at a time. Overlapping ones would read the same starting
   * order and the later write would erase the earlier change, and a failure
   * would restore a snapshot that a newer commit had already moved past.
   * A mutation that changes nothing must not advance the revision, or every
   * reconnect would look like news to the clients.
   */
  private commit(
    mutate: (order: Record<string, string[]>, state: SessionOrderState) => boolean,
  ): Promise<SessionOrderSnapshot> {
    const run = this.commits.then(async () => {
      const previous = this.state
      // Restored with the state, so a refused write can be retried.
      const retiredHidden = new Set(this.retiredHidden)
      const retiredUnread = new Set(this.retiredUnread)
      const draft = structuredClone(previous.order)
      const staged: SessionOrderState = {
        ...previous,
        hidden: [...previous.hidden],
        unread: [...previous.unread],
        order: draft,
      }
      if (!mutate(draft, staged)) {
        return this.snapshot()
      }
      this.state = {
        version: STATE_VERSION,
        revision: previous.revision + 1,
        bootstrapped: staged.bootstrapped,
        showSuspended: staged.showSuspended,
        showHidden: staged.showHidden,
        hidden: staged.hidden,
        unread: staged.unread,
        order: draft,
      }
      try {
        await this.persist()
      } catch (error) {
        // A revision nobody can reload is worse than a refused write: the
        // clients would converge on an order the hub forgets on restart.
        // Nothing else is in flight, so the previous state is still current.
        this.state = previous
        this.retiredHidden = retiredHidden
        this.retiredUnread = retiredUnread
        throw error
      }
      return this.snapshot()
    })
    this.commits = run.catch(() => undefined)
    return run
  }

  private async persist(): Promise<void> {
    const snapshot = JSON.stringify(this.state, null, 2)
    const temporary = `${this.statePath}.tmp`
    await writeFile(temporary, snapshot, { mode: 0o600 })
    await rename(temporary, this.statePath)
  }
}

function sameLane(left: string[], right: string[]): boolean {
  return (
    left.length === right.length && left.every((key, index) => key === right[index])
  )
}

/**
 * A mark held by a replaced session, or retired with it by a plain removal,
 * moved onto its successor. The retired entry is used up either way.
 */
function carried(
  marks: string[],
  retired: Set<string>,
  previous: string,
  next: string,
): string[] {
  const wasRetired = retired.delete(previous)
  const kept = marks.filter((key) => key !== previous)
  if ((wasRetired || kept.length !== marks.length) && !kept.includes(next)) kept.push(next)
  return kept
}
