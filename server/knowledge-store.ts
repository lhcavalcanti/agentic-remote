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
    const existing = this.state.roots.find(
      (entry) => entry.computerId === root.computerId && entry.path === root.path,
    )
    if (existing) {
      return structuredClone(existing)
    }
    const created: KnowledgeRoot = {
      ...root,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    }
    this.state.roots.unshift(created)
    await this.persist()
    return structuredClone(created)
  }

  async removeRoot(id: string): Promise<boolean> {
    const before = this.state.roots.length
    this.state.roots = this.state.roots.filter((entry) => entry.id !== id)
    if (this.state.roots.length === before) {
      return false
    }
    await this.persist()
    return true
  }

  private persist(): Promise<void> {
    const snapshot = JSON.stringify(this.state, null, 2)
    const task = this.writeQueue.then(async () => {
      const temporary = `${this.statePath}.tmp`
      await writeFile(temporary, snapshot, { mode: 0o600 })
      await rename(temporary, this.statePath)
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }
}
