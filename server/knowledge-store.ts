import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { KnowledgeRoot } from '../shared/contracts.js'

interface KnowledgeState {
  roots: KnowledgeRoot[]
}

export class KnowledgeStore {
  private readonly statePath: string
  private state: KnowledgeState = { roots: [] }
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
    return (await this.addRootWithStatus(root)).root
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

  async addRootWithStatus(
    root: Omit<KnowledgeRoot, 'id' | 'createdAt'>,
  ): Promise<{ root: KnowledgeRoot; created: boolean }> {
    return this.commitPreparedRoot(this.prepareRoot(root).root)
  }

  commitPreparedRoot(root: KnowledgeRoot): Promise<{ root: KnowledgeRoot; created: boolean }> {
    return this.enqueue(async () => {
      const existing = this.state.roots.find(
        (entry) => entry.computerId === root.computerId && entry.path === root.path,
      )
      if (existing) return { root: structuredClone(existing), created: false }
      const next = { roots: [structuredClone(root), ...this.state.roots] }
      await this.write(next)
      this.state = next
      return { root: structuredClone(root), created: true }
    })
  }

  removeRoot(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const remaining = this.state.roots.filter((entry) => entry.id !== id)
      if (remaining.length === this.state.roots.length) return false
      const next = { roots: remaining }
      await this.write(next)
      this.state = next
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
      const remaining = this.state.roots.filter(
        (entry) => entry.computerId !== computerId,
      )
      const removed = this.state.roots.length - remaining.length
      if (removed === 0) return 0
      const next = { roots: remaining }
      await this.write(next)
      this.state = next
      return removed
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
