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
  order: Record<string, string[]>
}

export function sessionOrderKey(computerId: string, sessionId: string): string {
  return `${computerId}:${sessionId}`
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
    order: {},
  }
  /**
   * Serializes whole commits. A commit reads, mutates, and persists, so
   * overlapping ones would otherwise publish a revision that never reached
   * disk, or undo a newer write while restoring their own.
   */
  private commits: Promise<unknown> = Promise.resolve()

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
      order,
    }
  }

  snapshot(): SessionOrderSnapshot {
    return {
      revision: this.state.revision,
      bootstrapped: this.state.bootstrapped,
      showSuspended: this.state.showSuspended,
      order: structuredClone(this.state.order),
    }
  }

  /** Whether a pre-hub browser order has already been taken. */
  isBootstrapped(): boolean {
    return this.state.bootstrapped
  }

  /** Shares suspended-session visibility across every browser on this hub. */
  async setShowSuspended(showSuspended: boolean): Promise<SessionOrderSnapshot> {
    return this.commit((_order, state) => {
      if (state.showSuspended === showSuspended) return false
      state.showSuspended = showSuspended
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
   * read before the clear and restored here.
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
    return this.commit((order) => {
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
        if (fallbackIndex === undefined || fallbackIndex >= lane.length) return false
        const without = lane.filter((key) => key !== next)
        const target = Math.min(Math.max(fallbackIndex, 0), without.length)
        const restored = [...without]
        restored.splice(target, 0, next)
        if (sameLane(lane, restored)) return false
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
    return this.commit((order) => {
      const lane = order[computerId]
      if (!lane?.includes(key)) return false
      const next = lane.filter((entry) => entry !== key)
      if (next.length === 0) delete order[computerId]
      else order[computerId] = next
      return true
    })
  }

  async removeComputer(computerId: string): Promise<SessionOrderSnapshot> {
    return this.commit((order) => {
      if (!(computerId in order)) return false
      delete order[computerId]
      return true
    })
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
      const draft = structuredClone(previous.order)
      const staged: SessionOrderState = { ...previous, order: draft }
      if (!mutate(draft, staged)) {
        return this.snapshot()
      }
      this.state = {
        version: STATE_VERSION,
        revision: previous.revision + 1,
        bootstrapped: staged.bootstrapped,
        showSuspended: staged.showSuspended,
        order: draft,
      }
      try {
        await this.persist()
      } catch (error) {
        // A revision nobody can reload is worse than a refused write: the
        // clients would converge on an order the hub forgets on restart.
        // Nothing else is in flight, so the previous state is still current.
        this.state = previous
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
