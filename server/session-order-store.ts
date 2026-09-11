import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { SessionOrderSnapshot } from '../shared/contracts.js'

/** Bumped only when a load-breaking shape change ships. */
const STATE_VERSION = 1

interface SessionOrderState {
  version: number
  revision: number
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
  private state: SessionOrderState = { version: STATE_VERSION, revision: 0, order: {} }
  private writeQueue: Promise<void> = Promise.resolve()

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
      order,
    }
  }

  snapshot(): SessionOrderSnapshot {
    return { revision: this.state.revision, order: structuredClone(this.state.order) }
  }

  /** Whether any lane has ever been recorded, which gates the legacy bootstrap. */
  isEmpty(): boolean {
    return Object.keys(this.state.order).length === 0
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
      // Keys the client never saw stay where they were relative to the end,
      // so an order written from a filtered or older view cannot delete them.
      const retained = existing.filter((key) => !lane.includes(key))
      const next = [...lane, ...retained]
      if (sameLane(existing, next)) return false
      order[computerId] = next
      return true
    })
  }

  /**
   * Seeds an empty hub order from a browser's legacy local order. Once any
   * lane exists the hub is authoritative and this does nothing, which is what
   * makes "first successful bootstrap wins" hold when several devices start.
   */
  async bootstrap(order: Record<string, string[]>): Promise<SessionOrderSnapshot> {
    if (!this.isEmpty()) return this.snapshot()
    return this.commit((current) => {
      let changed = false
      for (const [computerId, lane] of Object.entries(order)) {
        const keys = laneFrom(lane)?.filter((key) => key.startsWith(`${computerId}:`))
        if (!keys || keys.length === 0) continue
        current[computerId] = keys
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
   */
  async replaceSession(
    computerId: string,
    previousSessionId: string,
    nextSessionId: string,
  ): Promise<SessionOrderSnapshot> {
    if (previousSessionId === nextSessionId) return this.snapshot()
    const previous = sessionOrderKey(computerId, previousSessionId)
    const next = sessionOrderKey(computerId, nextSessionId)
    return this.commit((order) => {
      const lane = order[computerId] ?? []
      const index = lane.indexOf(previous)
      if (index < 0) {
        // Repeating a clear must stay idempotent: the lifecycle event and the
        // HTTP response both report the same replacement.
        if (lane.includes(next)) return false
        order[computerId] = [...lane, next]
        return true
      }
      const replaced = [...lane]
      replaced[index] = next
      // A replacement key already further down would otherwise appear twice.
      order[computerId] = replaced.filter(
        (key, position) => key !== next || position === index,
      )
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
   * Applies a mutation, and persists before reporting the new revision. A
   * mutation that changes nothing must not advance the revision, or every
   * reconnect would look like news to the clients.
   */
  private async commit(
    mutate: (order: Record<string, string[]>) => boolean,
  ): Promise<SessionOrderSnapshot> {
    const draft = structuredClone(this.state.order)
    if (!mutate(draft)) {
      return this.snapshot()
    }
    const previous = this.state
    this.state = {
      version: STATE_VERSION,
      revision: previous.revision + 1,
      order: draft,
    }
    try {
      await this.persist()
    } catch (error) {
      // A revision nobody can reload is worse than a refused write: the
      // clients would converge on an order the hub forgets on restart.
      this.state = previous
      throw error
    }
    return this.snapshot()
  }

  private persist(): Promise<void> {
    const snapshot = JSON.stringify(this.state, null, 2)
    const temporary = `${this.statePath}.tmp`
    const task = this.writeQueue.then(async () => {
      await writeFile(temporary, snapshot, { mode: 0o600 })
      await rename(temporary, this.statePath)
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }
}

function sameLane(left: string[], right: string[]): boolean {
  return (
    left.length === right.length && left.every((key, index) => key === right[index])
  )
}
