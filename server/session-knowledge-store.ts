import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type {
  KnowledgeRoot,
  SessionKnowledgeBinding,
  UpdateSessionKnowledgeRootInput,
} from '../shared/contracts.js'

const rootSchema = z.object({
  id: z.string().min(1),
  computerId: z.string().min(1),
  computerName: z.string(),
  path: z.string().min(1),
  name: z.string(),
  createdAt: z.string().min(1),
}).strict()

const bindingSchema = z.object({
  computerId: z.string().min(1),
  sessionId: z.string().min(1),
  rootId: z.string().min(1).nullable(),
  revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  root: rootSchema.optional(),
}).strict().refine(
  (binding) => binding.rootId === null
    ? binding.root === undefined
    : binding.root?.id === binding.rootId,
  'A linked Knowledge folder must retain its matching metadata',
)

const stateSchema = z.object({
  version: z.literal(1),
  bindings: z.array(bindingSchema),
}).strict().refine(
  ({ bindings }) => new Set(bindings.map(bindingKey)).size === bindings.length,
  'A session cannot have more than one Knowledge binding',
)

type StoredBinding = z.infer<typeof bindingSchema>
type State = z.infer<typeof stateSchema>
type Identity = Pick<SessionKnowledgeBinding, 'computerId' | 'sessionId'>

interface RootCatalog {
  getRoot(id: string): KnowledgeRoot | undefined
}

interface SessionKnowledgeEvents {
  updated: [binding: SessionKnowledgeBinding]
}

function bindingKey({ computerId, sessionId }: Identity): string {
  return JSON.stringify([computerId, sessionId])
}

export class SessionKnowledgeConflictError extends Error {
  readonly statusCode = 409

  constructor(readonly binding: SessionKnowledgeBinding) {
    super('This session’s Knowledge folder changed in another client. Reload its saved folder and try again.')
    this.name = 'SessionKnowledgeConflictError'
  }
}

export class SessionKnowledgeReferenceError extends Error {
  constructor(message: string, readonly statusCode = 404) {
    super(message)
    this.name = 'SessionKnowledgeReferenceError'
  }
}

export class SessionKnowledgePersistenceError extends Error {
  readonly statusCode = 503

  constructor(cause: unknown) {
    super('Could not save the session Knowledge folder. Try again.', { cause })
    this.name = 'SessionKnowledgePersistenceError'
  }
}

export class SessionKnowledgeStore extends EventEmitter<SessionKnowledgeEvents> {
  private readonly statePath: string
  private state: State = { version: 1, bindings: [] }
  private writeQueue: Promise<void> = Promise.resolve()
  private initialized = false

  constructor(
    private readonly directory: string,
    private readonly catalog: RootCatalog,
  ) {
    super()
    this.statePath = path.join(directory, 'session-knowledge.json')
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    try {
      const contents = await readFile(this.statePath, 'utf8')
      this.state = stateSchema.parse(JSON.parse(contents))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error('Cannot load session Knowledge metadata; the existing file was not changed.', {
          cause: error,
        })
      }
    }
    // Merely reading an unbound session must not create a file or a link.
    this.initialized = true
  }

  get(computerId: string, sessionId: string): SessionKnowledgeBinding {
    this.requireInitialized()
    return this.snapshot({ computerId, sessionId })
  }

  listBindings(): SessionKnowledgeBinding[] {
    this.requireInitialized()
    return this.state.bindings.map((binding) => this.snapshot(binding))
  }

  update(
    computerId: string,
    sessionId: string,
    input: UpdateSessionKnowledgeRootInput,
    validate?: () => void,
  ): Promise<SessionKnowledgeBinding> {
    const identity = { computerId, sessionId }
    return this.change((next) => {
      const current = this.snapshot(identity)
      if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) {
        throw new SessionKnowledgeReferenceError('Expected revision must be a nonnegative integer.', 400)
      }
      if (current.revision !== input.expectedRevision) {
        throw new SessionKnowledgeConflictError(current)
      }
      if (current.revision === Number.MAX_SAFE_INTEGER) {
        throw new SessionKnowledgeReferenceError('The Knowledge binding revision cannot advance.', 409)
      }
      const root = input.rootId === null ? undefined : this.catalog.getRoot(input.rootId)
      if (input.rootId !== null && !root) {
        throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
      }
      const binding: StoredBinding = {
        ...identity,
        rootId: input.rootId,
        revision: current.revision + 1,
        ...(root ? { root: structuredClone(root) } : {}),
      }
      next.bindings = [
        ...next.bindings.filter((entry) => bindingKey(entry) !== bindingKey(identity)),
        binding,
      ]
      return { changed: true, updated: [identity], result: () => this.snapshot(identity) }
    }, () => {
      validate?.()
      if (input.rootId !== null && !this.catalog.getRoot(input.rootId)) {
        throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
      }
    })
  }

  /**
   * An ancestry is oldest first. The nearest saved predecessor wins, including
   * an explicit unlink, but an existing recipient is never overwritten.
   */
  replaceSession(
    computerId: string,
    sessionId: string,
    replacedSessionIds: readonly string[],
    validate?: () => void,
  ): Promise<SessionKnowledgeBinding> {
    const identity = { computerId, sessionId }
    const previous = new Set(replacedSessionIds.filter((id) => id !== sessionId))
    return this.change((next) => {
      const recipient = next.bindings.find(
        (binding) => bindingKey(binding) === bindingKey(identity),
      )
      const source = [...previous].reverse().map((id) => next.bindings.find(
        (binding) => binding.computerId === computerId && binding.sessionId === id,
      )).find((binding) => binding !== undefined)
      const before = next.bindings.length
      next.bindings = next.bindings.filter(
        (binding) => binding.computerId !== computerId || !previous.has(binding.sessionId),
      )
      if (!recipient && source) {
        next.bindings.push({ ...source, sessionId })
      }
      return {
        changed: before !== next.bindings.length || (!recipient && source !== undefined),
        updated: !recipient && source ? [identity] : [],
        result: () => this.snapshot(identity),
      }
    }, validate)
  }

  removeSession(computerId: string, sessionId: string): Promise<void> {
    return this.remove((binding) =>
      binding.computerId === computerId && binding.sessionId === sessionId,
    )
  }

  removeComputer(computerId: string): Promise<void> {
    return this.remove((binding) => binding.computerId === computerId)
  }

  /** Called only after the shared catalog's removal has persisted. */
  refreshAvailability(rootIds: readonly string[]): Promise<void> {
    const roots = new Set(rootIds)
    const task = this.writeQueue.then(() => {
      for (const binding of this.state.bindings) {
        if (binding.rootId !== null && roots.has(binding.rootId)) {
          this.emit('updated', this.snapshot(binding))
        }
      }
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }

  flush(): Promise<void> {
    return this.writeQueue
  }

  private remove(matches: (binding: StoredBinding) => boolean): Promise<void> {
    return this.change((next) => {
      const before = next.bindings.length
      next.bindings = next.bindings.filter((binding) => !matches(binding))
      return { changed: before !== next.bindings.length, result: () => undefined }
    })
  }

  private snapshot(identity: Identity): SessionKnowledgeBinding {
    const stored = this.state.bindings.find(
      (binding) => bindingKey(binding) === bindingKey(identity),
    )
    const binding: SessionKnowledgeBinding = stored
      ? {
          ...structuredClone(stored),
          available: stored.rootId !== null && this.catalog.getRoot(stored.rootId) !== undefined,
        }
      : { ...identity, rootId: null, revision: 0, available: false }
    if (binding.root) Object.freeze(binding.root)
    return Object.freeze(binding)
  }

  private change<TResult>(
    mutate: (next: State) => {
      changed: boolean
      updated?: Identity[]
      result: () => TResult
    },
    validate?: () => void,
  ): Promise<TResult> {
    const task = this.writeQueue.then(async () => {
      this.requireInitialized()
      validate?.()
      const next = structuredClone(this.state)
      const mutation = mutate(next)
      if (mutation.changed) {
        await this.persist(next, validate)
        this.state = next
        // A pairing can retire while rename is in flight. Its durable commit
        // must not send a late update to the new pairing; queued lifecycle
        // cleanup still runs and the request rechecks its registration.
        let current = true
        try {
          validate?.()
        } catch {
          current = false
        }
        if (current) {
          for (const identity of mutation.updated ?? []) {
            this.emit('updated', this.snapshot(identity))
          }
        }
      }
      return mutation.result()
    })
    this.writeQueue = task.then(() => undefined, () => undefined)
    return task
  }

  private async persist(state: State, validate?: () => void): Promise<void> {
    const pending = `${this.statePath}.${randomUUID()}.pending`
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      await writeFile(pending, JSON.stringify(state), { mode: 0o600, flag: 'wx' })
      validate?.()
      await rename(pending, this.statePath)
    } catch (error) {
      await rm(pending, { force: true }).catch(() => undefined)
      if (error instanceof SessionKnowledgeReferenceError) throw error
      throw new SessionKnowledgePersistenceError(error)
    }
  }

  private requireInitialized(): void {
    if (!this.initialized) throw new Error('Session Knowledge store is not initialized')
  }
}
