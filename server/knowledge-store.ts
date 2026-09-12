import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { KnowledgeRoot } from '../shared/contracts.js'

interface KnowledgeState {
  roots: KnowledgeRoot[]
}

export interface KnowledgeRootReservation {
  root: KnowledgeRoot
  created: boolean
  finalize: () => Promise<void>
  rollback: () => Promise<boolean>
}

export class KnowledgeStore {
  private readonly statePath: string
  private state: KnowledgeState = { roots: [] }
  private readonly rootReservations = new Map<string, Set<string>>()
  private writeQueue: Promise<void> = Promise.resolve()

  constructor(private readonly directory: string) {
    this.statePath = path.join(directory, 'knowledge.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    try {
      const parsed = JSON.parse(
        await readFile(this.statePath, 'utf8'),
      ) as Partial<KnowledgeState>
      // Rebuild from known fields so a file written before roots replaced
      // bookmarks loads, and the obsolete key is not carried forward.
      this.state = { roots: parsed.roots ?? [] }
      this.rootReservations.clear()
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
      await this.persist()
    }
  }

  listRoots(): KnowledgeRoot[] {
    return structuredClone(this.state.roots)
  }

  getRoot(id: string): KnowledgeRoot | undefined {
    const root = this.state.roots.find((entry) => entry.id === id)
    return root ? structuredClone(root) : undefined
  }

  async addRoot(
    root: Omit<KnowledgeRoot, 'id' | 'createdAt'>,
  ): Promise<KnowledgeRoot> {
    const reservation = await this.reserveRoot(root)
    await reservation.finalize()
    return reservation.root
  }

  prepareRoot(
    root: Omit<KnowledgeRoot, 'id' | 'createdAt'>,
  ): { root: KnowledgeRoot; created: boolean } {
    const existing = this.state.roots.find(
      (entry) => entry.computerId === root.computerId && entry.path === root.path,
    )
    return existing
      ? { root: structuredClone(existing), created: false }
      : {
          root: {
            ...root,
            id: randomUUID(),
            createdAt: new Date().toISOString(),
          },
          created: true,
        }
  }

  reserveRoot(
    root: Omit<KnowledgeRoot, 'id' | 'createdAt'>,
  ): Promise<KnowledgeRootReservation> {
    return this.reservePreparedRoot(this.prepareRoot(root).root)
  }

  reservePreparedRoot(root: KnowledgeRoot): Promise<KnowledgeRootReservation> {
    return this.enqueue(async () => {
      const existing = this.state.roots.find(
        (entry) => entry.computerId === root.computerId && entry.path === root.path,
      )
      if (existing) {
        const reservations = this.rootReservations.get(existing.id)
        if (!reservations) return this.reservation(existing, false)
        const token = randomUUID()
        reservations.add(token)
        return this.reservation(existing, false, token)
      }
      const next = { roots: [structuredClone(root), ...this.state.roots] }
      await this.write(next)
      this.state = next
      const token = randomUUID()
      this.rootReservations.set(root.id, new Set([token]))
      return this.reservation(root, true, token)
    })
  }

  removeRoot(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const remaining = this.state.roots.filter((entry) => entry.id !== id)
      if (remaining.length === this.state.roots.length) return false
      const next = { roots: remaining }
      await this.write(next)
      this.state = next
      this.rootReservations.delete(id)
      return true
    })
  }

  /**
   * Drops the roots that named folders on a computer that is no longer
   * paired. A root is only a computer and a path, so once the computer is
   * gone the root can never answer anything but "not found" -- and it stays
   * in the list offering to try.
   */
  removeRootsForComputer(computerId: string): Promise<number> {
    return this.enqueue(async () => {
      const removedIds = this.state.roots
        .filter((entry) => entry.computerId === computerId)
        .map((entry) => entry.id)
      const remaining = this.state.roots.filter(
        (entry) => entry.computerId !== computerId,
      )
      const removed = this.state.roots.length - remaining.length
      if (removed === 0) return 0
      const next = { roots: remaining }
      await this.write(next)
      this.state = next
      for (const id of removedIds) this.rootReservations.delete(id)
      return removed
    })
  }

  private reservation(
    root: KnowledgeRoot,
    created: boolean,
    token?: string,
  ): KnowledgeRootReservation {
    let settled = false
    return {
      root: structuredClone(root),
      created,
      finalize: async () => {
        if (settled) return
        if (token) await this.finalizeReservation(root.id, token)
        settled = true
      },
      rollback: async () => {
        if (settled) return false
        const removed = token
          ? await this.rollbackReservation(root.id, token)
          : false
        settled = true
        return removed
      },
    }
  }

  private finalizeReservation(id: string, token: string): Promise<void> {
    return this.enqueue(async () => {
      const reservations = this.rootReservations.get(id)
      if (reservations?.has(token)) this.rootReservations.delete(id)
    })
  }

  private rollbackReservation(id: string, token: string): Promise<boolean> {
    return this.enqueue(async () => {
      const reservations = this.rootReservations.get(id)
      if (!reservations?.has(token)) return false
      if (reservations.size > 1) {
        reservations.delete(token)
        return false
      }
      const remaining = this.state.roots.filter((entry) => entry.id !== id)
      if (remaining.length === this.state.roots.length) {
        this.rootReservations.delete(id)
        return false
      }
      const next = { roots: remaining }
      await this.write(next)
      this.state = next
      this.rootReservations.delete(id)
      return true
    })
  }

  private persist(): Promise<void> {
    return this.enqueue(() => this.write(this.state))
  }

  private enqueue<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    const task = this.writeQueue.then(operation)
    this.writeQueue = task.then(() => undefined, () => undefined)
    return task
  }

  private async write(state: KnowledgeState): Promise<void> {
    const temporary = `${this.statePath}.tmp`
    await writeFile(temporary, JSON.stringify(state, null, 2), { mode: 0o600 })
    await rename(temporary, this.statePath)
  }
}
