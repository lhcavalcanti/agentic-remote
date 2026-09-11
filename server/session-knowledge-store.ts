import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type {
  KnowledgeRoot,
  SessionKnowledgeBinding,
  SessionKnowledgeSource,
  UpdateSessionKnowledgeRootInput,
} from '../shared/contracts.js'
import { normalizeSessionKnowledgePath } from './session-knowledge-path.js'

const rootSchema = z.object({
  id: z.string().min(1),
  computerId: z.string().min(1),
  computerName: z.string(),
  path: z.string().min(1),
  name: z.string(),
  createdAt: z.string().min(1),
}).strict()

const sourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('catalog-root'), root: rootSchema }).strict(),
  z.object({
    kind: z.literal('session-folder'),
    computerId: z.string().min(1),
    computerName: z.string(),
    sessionId: z.string().min(1),
    path: z.string().min(1),
  }).strict(),
])

const legacyBindingSchema = z.object({
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

const bindingSchema = z.object({
  computerId: z.string().min(1),
  sessionId: z.string().min(1),
  source: sourceSchema.optional(),
  path: z.string().min(1).optional(),
  rootId: z.string().min(1).nullable().optional(),
  root: rootSchema.optional(),
  revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
}).strict().refine(
  (binding) => binding.source === undefined
    ? binding.path === undefined
    : binding.path !== undefined,
  'A Knowledge source and its selected path must be stored together',
)

const legacyStateSchema = z.object({
  version: z.literal(1),
  bindings: z.array(legacyBindingSchema),
}).strict().refine(
  ({ bindings }) => new Set(bindings.map(bindingKey)).size === bindings.length,
  'A session cannot have more than one Knowledge binding',
)

const stateSchema = z.object({
  version: z.literal(2),
  bindings: z.array(bindingSchema),
}).strict().refine(
  ({ bindings }) => new Set(bindings.map(bindingKey)).size === bindings.length,
  'A session cannot have more than one Knowledge binding',
)

const recoverySchema = z.object({
  version: z.literal(1),
  previous: z.string().nullable(),
}).strict()
const catalogRecoverySchema = z.object({
  version: z.literal(1),
  rootId: z.string().min(1),
}).strict()

type StoredBinding = z.infer<typeof bindingSchema>
type State = z.infer<typeof stateSchema>
type Identity = Pick<SessionKnowledgeBinding, 'computerId' | 'sessionId'>

interface RootCatalog {
  getRoot(id: string): KnowledgeRoot | undefined
  removeRoot?(id: string): Promise<boolean>
}

interface LegacyUpdate {
  rootId: string | null
  expectedRevision: number
}

interface PreparedLocation {
  source: SessionKnowledgeSource
  path: string
  rollback?: () => Promise<void>
  catalogAddition?: {
    rootId: string
    commit: () => Promise<{
      source: SessionKnowledgeSource
      path: string
      created: boolean
      rollback?: () => Promise<void>
    }>
  }
}

interface SessionKnowledgeEvents {
  updated: [binding: SessionKnowledgeBinding]
}

function bindingKey({ computerId, sessionId }: Identity): string {
  return JSON.stringify([computerId, sessionId])
}

function parseState(contents: string): State {
  const parsed = JSON.parse(contents)
  const current = stateSchema.safeParse(parsed)
  if (current.success) return current.data
  if (parsed?.version !== 1) return stateSchema.parse(parsed)
  const legacy = legacyStateSchema.parse(parsed)
  return {
    version: 2,
    bindings: legacy.bindings.map((binding) => ({
      computerId: binding.computerId,
      sessionId: binding.sessionId,
      revision: binding.revision,
      ...(binding.root ? {
        source: { kind: 'catalog-root' as const, root: binding.root },
        path: '.',
      } : {}),
    })),
  }
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
  private readonly catalogRecoveryPath: string
  private state: State = { version: 2, bindings: [] }
  private persisted: string | null = null
  private recovery?: z.infer<typeof recoverySchema>
  private catalogRecovery?: z.infer<typeof catalogRecoverySchema>
  private catalogCleanupError?: SessionKnowledgePersistenceError
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
    this.catalogRecoveryPath = `${this.statePath}.catalog-recovery`
  }

  async initialize(): Promise<void> {
    if (this.initialized) return this.recover()
    try {
      const recovery = recoverySchema.parse(JSON.parse(await readFile(this.recoveryPath, 'utf8')))
      if (recovery.previous !== null) parseState(recovery.previous)
      this.recovery = recovery
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error('Cannot load session Knowledge recovery metadata; the existing files were not changed.', { cause: error })
      }
    }
    if (this.recovery) await this.restore()
    try {
      const contents = await readFile(this.statePath, 'utf8')
      this.state = parseState(contents)
      this.persisted = contents
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error('Cannot load session Knowledge metadata; the existing file was not changed.', {
          cause: error,
        })
      }
    }
    try {
      this.catalogRecovery = catalogRecoverySchema.parse(
        JSON.parse(await readFile(this.catalogRecoveryPath, 'utf8')),
      )
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error('Cannot load session Knowledge catalog recovery metadata; the existing files were not changed.', {
          cause: error,
        })
      }
    }
    if (this.catalogRecovery) await this.recoverCatalogAddition()
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
    input: UpdateSessionKnowledgeRootInput | LegacyUpdate,
    validate?: () => void,
  ): Promise<SessionKnowledgeBinding> {
    if ('rootId' in input) {
      const root = input.rootId === null ? undefined : this.catalog.getRoot(input.rootId)
      if (input.rootId !== null && !root) {
        return Promise.reject(new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.'))
      }
      return this.updateLocation(computerId, sessionId, {
        source: root ? { kind: 'catalog-root', root } : null,
        path: root ? '.' : undefined,
        expectedRevision: input.expectedRevision,
      }, validate)
    }
    const source = input.source?.kind === 'catalog-root'
      ? this.catalog.getRoot(input.source.rootId)
      : undefined
    if (input.source?.kind === 'catalog-root' && !source) {
      return Promise.reject(new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.'))
    }
    if (input.source?.kind === 'session-folder') {
      return Promise.reject(new SessionKnowledgeReferenceError(
        'The session folder source must be resolved before it is stored.',
        400,
      ))
    }
    return this.updateLocation(computerId, sessionId, {
      source: source ? { kind: 'catalog-root', root: source } : null,
      path: source ? normalizeSessionKnowledgePath(input.path) : undefined,
      expectedRevision: input.expectedRevision,
    }, validate)
  }

  updateLocation(
    computerId: string,
    sessionId: string,
    input: {
      source: SessionKnowledgeSource | null
      path?: string
      expectedRevision: number
    },
    validate?: () => void,
    prepare?: () => Promise<PreparedLocation>,
  ): Promise<SessionKnowledgeBinding> {
    const identity = { computerId, sessionId }
    let rollback: (() => Promise<void>) | undefined
    return this.change(async (next) => {
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
      const prepared = prepare ? await prepare() : undefined
      let committed = prepared
      if (prepared?.catalogAddition) {
        await this.beginCatalogAddition(prepared.catalogAddition.rootId)
        try {
          const addition = await prepared.catalogAddition.commit()
          committed = { ...prepared, ...addition, catalogAddition: undefined }
          if (!addition.created) await this.clearCatalogAddition()
        } catch (error) {
          try {
            await this.clearCatalogAddition()
          } catch (cleanupError) {
            this.catalogCleanupError = new SessionKnowledgePersistenceError(cleanupError)
            throw new SessionKnowledgePersistenceError(new AggregateError([error, cleanupError]))
          }
          if (error instanceof SessionKnowledgeReferenceError) throw error
          throw new SessionKnowledgePersistenceError(error)
        }
      }
      rollback = committed?.rollback
      const source = committed?.source ?? input.source ?? undefined
      const selectedPath = source
        ? normalizeSessionKnowledgePath(committed?.path ?? input.path)
        : undefined
      if (source?.kind === 'catalog-root' && !this.catalog.getRoot(source.root.id)) {
        throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
      }
      const binding: StoredBinding = {
        ...identity,
        revision: current.revision + 1,
        ...(source ? {
          source: structuredClone(source),
          path: selectedPath,
          rootId: source.kind === 'catalog-root' ? source.root.id : null,
          ...(source.kind === 'catalog-root' ? { root: structuredClone(source.root) } : {}),
        } : {}),
      }
      next.bindings = [
        ...next.bindings.filter((entry) => bindingKey(entry) !== bindingKey(identity)),
        binding,
      ]
      return { changed: true, updated: [identity], result: () => this.snapshot(identity) }
    }, () => {
      validate?.()
      const source = prepare ? undefined : input.source
      if (source?.kind === 'catalog-root' && !this.catalog.getRoot(source.root.id)) {
        throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
      }
    }, async (error) => {
      if (rollback) {
        try {
          await rollback()
          await this.clearCatalogAddition()
        } catch (rollbackError) {
          if (this.catalogRecovery) {
            this.catalogCleanupError = new SessionKnowledgePersistenceError(rollbackError)
          }
          throw new SessionKnowledgePersistenceError(new AggregateError([error, rollbackError]))
        }
      }
      return error
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
        if (binding.source?.kind === 'catalog-root' && roots.has(binding.source.root.id)) {
          this.emit('updated', this.snapshot(binding))
        }
      }
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }

  flush(): Promise<void> {
    return this.writeQueue.then(() => this.retryCatalogCleanup())
  }

  recover(): Promise<void> {
    const task = this.writeQueue.then(async () => {
      if (this.unavailable) await this.restore()
      await this.retryCatalogCleanup()
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
    const source = stored?.source
    const root = source?.kind === 'catalog-root' ? source.root : undefined
    const binding: SessionKnowledgeBinding = stored
      ? {
          ...structuredClone(stored),
          rootId: root?.id ?? null,
          ...(root ? { root: structuredClone(root) } : {}),
          available: source?.kind === 'session-folder' ||
            (root !== undefined && this.catalog.getRoot(root.id) !== undefined),
        }
      : { ...identity, rootId: null, revision: 0, available: false }
    if (binding.root) Object.freeze(binding.root)
    return Object.freeze(binding)
  }

  private change<TResult>(
    mutate: (next: State) => Promise<{
      changed: boolean
      updated?: Identity[]
      result: () => TResult
    }> | {
      changed: boolean
      updated?: Identity[]
      result: () => TResult
    },
    validate?: () => void,
    onError?: (error: unknown) => Promise<unknown>,
  ): Promise<TResult> {
    const task = this.writeQueue.then(async () => {
      try {
        this.requireInitialized()
        if (this.unavailable) await this.restore()
        validate?.()
        const next = structuredClone(this.state)
        const mutation = await mutate(next)
        if (mutation.changed) {
          await this.persist(next, validate)
          this.state = next
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
      } catch (error) {
        if (onError) throw await onError(error)
        throw error
      }
    })
    this.writeQueue = task.then(() => undefined, () => undefined)
    return task
  }

  private async persist(state: State, validate?: () => void): Promise<void> {
    const pending = `${this.statePath}.${randomUUID()}.pending`
    const pendingRecovery = `${this.recoveryPath}.${randomUUID()}.pending`
    const contents = JSON.stringify(state)
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
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
      if (this.catalogRecovery) {
        try {
          await this.clearCatalogAddition()
        } catch (cleanupError) {
          this.catalogCleanupError = new SessionKnowledgePersistenceError(cleanupError)
        }
      }
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

  private async beginCatalogAddition(rootId: string): Promise<void> {
    if (this.catalogRecovery) {
      throw new SessionKnowledgePersistenceError(new Error('A Knowledge catalog recovery is already pending'))
    }
    const pending = `${this.catalogRecoveryPath}.${randomUUID()}.pending`
    const recovery = { version: 1 as const, rootId }
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      await writeFile(pending, JSON.stringify(recovery), { mode: 0o600, flag: 'wx' })
      await rename(pending, this.catalogRecoveryPath)
      this.catalogRecovery = recovery
    } catch (error) {
      await rm(pending, { force: true }).catch(() => undefined)
      throw new SessionKnowledgePersistenceError(error)
    }
  }

  private async clearCatalogAddition(): Promise<void> {
    if (!this.catalogRecovery) return
    await rm(this.catalogRecoveryPath, { force: true })
    this.catalogRecovery = undefined
    this.catalogCleanupError = undefined
  }

  private async recoverCatalogAddition(): Promise<void> {
    const recovery = this.catalogRecovery
    if (!recovery) return
    const committed = this.state.bindings.some((binding) =>
      binding.source?.kind === 'catalog-root' && binding.source.root.id === recovery.rootId)
    if (!committed) {
      if (!this.catalog.removeRoot) {
        throw new Error('Cannot recover a pending session Knowledge catalog addition')
      }
      await this.catalog.removeRoot(recovery.rootId)
    }
    await this.clearCatalogAddition()
  }

  private async retryCatalogCleanup(): Promise<void> {
    if (!this.catalogRecovery) return
    try {
      await this.recoverCatalogAddition()
    } catch (error) {
      this.catalogCleanupError = new SessionKnowledgePersistenceError(error)
      throw this.catalogCleanupError
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
