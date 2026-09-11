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
import { normalizeKnowledgeRelativePath } from '../shared/knowledge-path.js'

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

const recoverySchema = z.object({
  version: z.literal(1),
  previous: z.string().nullable(),
}).strict()

const pathRecordSchema = z.object({
  computerId: z.string().min(1),
  sessionId: z.string().min(1),
  rootId: z.string().min(1),
  revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  rootPath: z.string().transform((value) =>
    normalizeKnowledgeRelativePath(value),
  ).refine((value) => value !== '.', 'A nested path record cannot name the root'),
}).strict()
const pathStateSchema = z.object({
  version: z.literal(1),
  paths: z.array(pathRecordSchema),
}).strict().refine(
  ({ paths }) =>
    new Set(paths.map(pathRecordKey)).size === paths.length,
  'A binding revision cannot have more than one nested Knowledge path',
)

type PersistedBinding = z.infer<typeof bindingSchema>
type PersistedState = z.infer<typeof stateSchema>
type PathRecord = z.infer<typeof pathRecordSchema>
type PathState = z.infer<typeof pathStateSchema>
type StoredBinding = PersistedBinding & { rootPath: string }
type State = { version: 1; bindings: StoredBinding[] }
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

function pathRecordKey(
  { computerId, sessionId, rootId, revision }: PathRecord,
): string {
  return JSON.stringify([computerId, sessionId, rootId, revision])
}

function persistedState(state: State): PersistedState {
  return {
    version: 1,
    bindings: state.bindings.map(({ rootPath: _rootPath, ...binding }) =>
      binding),
  }
}

function stateWithPaths(
  state: PersistedState,
  paths: PathState,
): State {
  return {
    version: 1,
    bindings: state.bindings.map((binding) => ({
      ...binding,
      rootPath:
        binding.rootId === null
          ? '.'
          : paths.paths.find(
              (entry) =>
                entry.computerId === binding.computerId &&
                entry.sessionId === binding.sessionId &&
                entry.rootId === binding.rootId &&
                entry.revision === binding.revision,
            )?.rootPath || '.',
    })),
  }
}

function pathStateFor(current: State, next: State): PathState {
  const records = new Map<string, PathRecord>()
  for (const binding of [...current.bindings, ...next.bindings]) {
    if (binding.rootId === null || binding.rootPath === '.') continue
    const record: PathRecord = {
      computerId: binding.computerId,
      sessionId: binding.sessionId,
      rootId: binding.rootId,
      revision: binding.revision,
      rootPath: binding.rootPath,
    }
    records.set(pathRecordKey(record), record)
  }
  return { version: 1, paths: [...records.values()] }
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

export class SessionKnowledgeRecoveryError extends Error {
  readonly statusCode = 503

  constructor(cause: unknown) {
    super('Session Knowledge metadata recovery could not finish. Restore writable storage and retry; no new binding was accepted.', {
      cause,
    })
    this.name = 'SessionKnowledgeRecoveryError'
  }
}

export class SessionKnowledgeStore extends EventEmitter<SessionKnowledgeEvents> {
  private readonly statePath: string
  private readonly recoveryPath: string
  private readonly pathStatePath: string
  private state: State = { version: 1, bindings: [] }
  private pathState: PathState = { version: 1, paths: [] }
  private persisted: string | null = null
  private recovery?: z.infer<typeof recoverySchema>
  private unavailable?: SessionKnowledgeRecoveryError
  private writeQueue: Promise<void> = Promise.resolve()
  private initialized = false

  constructor(
    private readonly directory: string,
    private readonly catalog: RootCatalog,
  ) {
    super()
    this.statePath = path.join(directory, 'session-knowledge.json')
    this.recoveryPath = `${this.statePath}.recovery`
    this.pathStatePath = path.join(directory, 'session-knowledge-paths.json')
  }

  async initialize(): Promise<void> {
    if (this.initialized) return this.recover()
    try {
      const recovery = recoverySchema.parse(JSON.parse(await readFile(this.recoveryPath, 'utf8')))
      if (recovery.previous !== null) stateSchema.parse(JSON.parse(recovery.previous))
      this.recovery = recovery
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error('Cannot load session Knowledge recovery metadata; the existing files were not changed.', { cause: error })
      }
    }
    if (this.recovery) await this.restore()
    try {
      const contents = await readFile(this.statePath, 'utf8')
      const state = stateSchema.parse(JSON.parse(contents))
      this.persisted = contents
      try {
        this.pathState = pathStateSchema.parse(
          JSON.parse(await readFile(this.pathStatePath, 'utf8')),
        )
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw new Error(
            'Cannot load session Knowledge path metadata; the existing files were not changed.',
            { cause: error },
          )
        }
      }
      this.state = stateWithPaths(state, this.pathState)
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
    this.requireReadable()
    return this.snapshot({ computerId, sessionId })
  }

  listBindings(): SessionKnowledgeBinding[] {
    this.requireReadable()
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
      let rootPath: string
      try {
        rootPath = normalizeKnowledgeRelativePath(input.rootPath)
      } catch {
        throw new SessionKnowledgeReferenceError(
          'Knowledge root path must stay inside the saved folder.',
          400,
        )
      }
      if (input.rootId === null && rootPath !== '.') {
        throw new SessionKnowledgeReferenceError(
          'An unlinked session cannot retain a nested Knowledge path.',
          400,
        )
      }
      const root = input.rootId === null ? undefined : this.catalog.getRoot(input.rootId)
      if (input.rootId !== null && !root) {
        throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
      }
      const binding: StoredBinding = {
        ...identity,
        rootId: input.rootId,
        rootPath,
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

  removeSession(computerId: string, sessionId: string, validate?: () => void): Promise<void> {
    return this.remove(
      (binding) => binding.computerId === computerId && binding.sessionId === sessionId,
      validate,
    )
  }

  removeComputer(computerId: string): Promise<void> {
    return this.remove((binding) => binding.computerId === computerId)
  }

  /** Called only after the shared catalog's removal has persisted. */
  refreshAvailability(rootIds: readonly string[]): Promise<void> {
    const roots = new Set(rootIds)
    const task = this.writeQueue.then(() => {
      this.requireReadable()
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

  recover(): Promise<void> {
    const task = this.writeQueue.then(async () => {
      if (this.unavailable) await this.restore()
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }

  private remove(matches: (binding: StoredBinding) => boolean, validate?: () => void): Promise<void> {
    return this.change((next) => {
      const before = next.bindings.length
      next.bindings = next.bindings.filter((binding) => !matches(binding))
      return { changed: before !== next.bindings.length, result: () => undefined }
    }, validate)
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
      : {
          ...identity,
          rootId: null,
          rootPath: '.',
          revision: 0,
          available: false,
        }
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
      if (this.unavailable) await this.restore()
      validate?.()
      const next = structuredClone(this.state)
      const mutation = mutate(next)
      if (mutation.changed) {
        const paths = pathStateFor(this.state, next)
        await this.persist(next, paths, validate)
        this.state = next
        this.pathState = paths
        // Persistence already checked the guard after rename. A later
        // retirement can suppress delivery, but cannot reject that commit.
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

  private async persist(
    state: State,
    paths: PathState,
    validate?: () => void,
  ): Promise<void> {
    const pending = `${this.statePath}.${randomUUID()}.pending`
    const pendingRecovery = `${this.recoveryPath}.${randomUUID()}.pending`
    const contents = JSON.stringify(persistedState(state))
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      await this.persistPaths(paths)
      validate?.()
      await writeFile(pending, contents, { mode: 0o600, flag: 'wx' })
      validate?.()
      const recovery: z.infer<typeof recoverySchema> = { version: 1, previous: this.persisted }
      await writeFile(pendingRecovery, JSON.stringify(recovery), { mode: 0o600, flag: 'wx' })
      validate?.()
      // Startup only reads the published journal, never a partially written
      // temporary file left by an interrupted process.
      await rename(pendingRecovery, this.recoveryPath)
      this.recovery = recovery
      validate?.()
      await rename(pending, this.statePath)
      // This is the guarded commit point. Keep both queue ownership and the
      // durable undo record until validation and finalization have succeeded.
      validate?.()
      await rm(this.recoveryPath)
      this.recovery = undefined
      this.persisted = contents
    } catch (error) {
      await rm(pending, { force: true }).catch(() => undefined)
      await rm(pendingRecovery, { force: true }).catch(() => undefined)
      if (this.recovery) {
        try {
          await this.restore()
        } catch (recoveryError) {
          this.unavailable = new SessionKnowledgeRecoveryError(new AggregateError([error, recoveryError]))
          throw this.unavailable
        }
      }
      if (error instanceof SessionKnowledgeReferenceError) throw error
      throw new SessionKnowledgePersistenceError(error)
    }
  }

  private async persistPaths(paths: PathState): Promise<void> {
    if (paths.paths.length === 0) {
      await rm(this.pathStatePath, { force: true })
      return
    }
    const pending = `${this.pathStatePath}.${randomUUID()}.pending`
    try {
      await writeFile(pending, JSON.stringify(paths), {
        mode: 0o600,
        flag: 'wx',
      })
      await rename(pending, this.pathStatePath)
    } catch (error) {
      await rm(pending, { force: true }).catch(() => undefined)
      throw error
    }
  }

  private async restore(): Promise<void> {
    if (!this.recovery) return
    const pending = `${this.statePath}.${randomUUID()}.pending`
    try {
      if (this.recovery.previous === null) {
        await rm(this.statePath, { force: true })
      } else {
        await writeFile(pending, this.recovery.previous, { mode: 0o600, flag: 'wx' })
        await rename(pending, this.statePath)
      }
      await rm(this.recoveryPath, { force: true })
      this.recovery = undefined
      this.unavailable = undefined
    } catch (error) {
      await rm(pending, { force: true }).catch(() => undefined)
      this.unavailable = new SessionKnowledgeRecoveryError(error)
      throw this.unavailable
    }
  }

  private requireReadable(): void {
    this.requireInitialized()
    if (this.unavailable) throw this.unavailable
  }

  private requireInitialized(): void {
    if (!this.initialized) throw new Error('Session Knowledge store is not initialized')
  }
}
