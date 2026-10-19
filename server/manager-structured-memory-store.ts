import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import {
  mkdir,
  lstat,
  open,
  rename,
  rm,
} from 'node:fs/promises'
import path from 'node:path'
import {
  MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS,
  MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES,
  MANAGER_STRUCTURED_MEMORY_MAX_RECORDS,
  MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES,
  MANAGER_STRUCTURED_MEMORY_MAX_TOMBSTONES,
  type ManagerStructuredMemoryAuthority,
  type ManagerStructuredMemoryCorrectInput,
  type ManagerStructuredMemoryMutationResult,
  type ManagerStructuredMemoryRememberInput,
  type ManagerStructuredMemorySearchResult,
  type ManagerStructuredMemoryState,
} from '../shared/manager-structured-memory.js'
import {
  createStructuredMemorySearchIndex,
  searchStructuredMemory,
  updateStructuredMemorySearchIndex,
  type ManagerStructuredMemorySearchIndex,
} from './manager-structured-memory-search.js'
import {
  ManagerStructuredMemoryValidationError,
  validateStructuredMemoryCorrect,
  validateStructuredMemoryForget,
  validateStructuredMemoryImport,
  validateStructuredMemoryRemember,
  validateStructuredMemoryState,
} from './manager-structured-memory-validation.js'

interface ManagerStructuredMemoryStoreOptions {
  now?: () => Date
  randomUUID?: () => string
  syncDirectory?: () => Promise<void>
}

export class ManagerStructuredMemoryPersistenceError extends Error {
  readonly statusCode = 503

  constructor(cause: unknown) {
    super('Could not save structured memory. Restore writable storage and retry.', {
      cause,
    })
    this.name = 'ManagerStructuredMemoryPersistenceError'
  }
}

export class ManagerStructuredMemoryRecoveryError extends Error {
  readonly statusCode = 503

  constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'ManagerStructuredMemoryRecoveryError'
  }
}

export class ManagerStructuredMemoryReferenceError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message)
    this.name = 'ManagerStructuredMemoryReferenceError'
  }
}

export class ManagerStructuredMemoryCapacityError extends Error {
  readonly statusCode = 507

  constructor() {
    super(
      'Structured memory reached a hard capacity limit. Export or remove data before retrying.',
    )
    this.name = 'ManagerStructuredMemoryCapacityError'
  }
}

function emptyState(): ManagerStructuredMemoryState {
  return {
    version: 1,
    revision: 0,
    records: [],
    tombstones: [],
    audit: [],
    appliedRequests: [],
  }
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT'
}

export class ManagerStructuredMemoryStore {
  private readonly statePath: string
  private readonly backupPath: string
  private readonly now: () => Date
  private readonly nextId: () => string
  private readonly injectedDirectorySync?: () => Promise<void>
  private state = emptyState()
  private searchIndex: ManagerStructuredMemorySearchIndex =
    createStructuredMemorySearchIndex(this.state)
  private serialized: string | null = null
  private commits: Promise<void> = Promise.resolve()
  private initialized = false
  private failure?: ManagerStructuredMemoryRecoveryError

  constructor(
    private readonly directory: string,
    options: ManagerStructuredMemoryStoreOptions = {},
  ) {
    this.statePath = path.join(directory, 'structured-memory.json')
    this.backupPath = path.join(directory, 'structured-memory.backup.json')
    this.now = options.now ?? (() => new Date())
    this.nextId = options.randomUUID ?? randomUUID
    this.injectedDirectorySync = options.syncDirectory
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const directoryMetadata = await lstat(this.directory)
    if (
      directoryMetadata.isSymbolicLink() ||
      !directoryMetadata.isDirectory()
    ) {
      throw new ManagerStructuredMemoryRecoveryError(
        'Structured memory directory must be a regular directory; no files were changed.',
      )
    }
    let serialized: string
    try {
      serialized = await this.readStateFile(this.statePath, 'primary')
    } catch (error) {
      if (error instanceof ManagerStructuredMemoryRecoveryError) throw error
      if (!isMissing(error)) {
        throw new ManagerStructuredMemoryRecoveryError(
          'Structured memory could not read its primary state; no files were changed.',
          error,
        )
      }
      try {
        serialized = await this.readStateFile(this.backupPath, 'backup')
      } catch (backupError) {
        if (isMissing(backupError)) {
          this.initialized = true
          return
        }
        if (backupError instanceof ManagerStructuredMemoryRecoveryError) {
          throw backupError
        }
        throw new ManagerStructuredMemoryRecoveryError(
          'Structured memory could not read its backup state; no files were changed.',
          backupError,
        )
      }
      let recovered: ManagerStructuredMemoryState
      try {
        recovered = validateStructuredMemoryState(JSON.parse(serialized))
      } catch (backupError) {
        throw new ManagerStructuredMemoryRecoveryError(
          'Structured memory backup state is corrupt or unsupported; no files were changed.',
          backupError,
        )
      }
      const pending = `${this.statePath}.${this.nextId()}.pending`
      try {
        await this.writeSynced(pending, serialized)
        await rename(pending, this.statePath)
        await this.syncDirectory()
      } catch (recoveryError) {
        await rm(pending, { force: true }).catch(() => undefined)
        throw new ManagerStructuredMemoryRecoveryError(
          'Structured memory could not restore its validated backup.',
          recoveryError,
        )
      }
      this.state = recovered
      this.searchIndex = createStructuredMemorySearchIndex(this.state)
      this.serialized = serialized
      this.initialized = true
      return
    }

    try {
      this.state = validateStructuredMemoryState(JSON.parse(serialized))
      this.searchIndex = createStructuredMemorySearchIndex(this.state)
      this.serialized = serialized
      this.initialized = true
    } catch (error) {
      throw new ManagerStructuredMemoryRecoveryError(
        'Structured memory primary state is corrupt or unsupported; no files were changed.',
        error,
      )
    }
  }

  /**
   * Reads one state file without following links. A readable-by-others file
   * owned by this process's user is tightened to 0600 first; one owned by
   * anyone else, or larger than the store limit, is refused unread.
   */
  private async readStateFile(
    filePath: string,
    label: 'primary' | 'backup',
  ): Promise<string> {
    const metadata = await lstat(filePath)
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new Error(`Structured memory ${label} state is not a regular file`)
    }
    const handle = await open(
      filePath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    )
    try {
      const opened = await handle.stat()
      if (
        !opened.isFile() ||
        opened.ino !== metadata.ino ||
        opened.dev !== metadata.dev
      ) {
        throw new Error(`Structured memory ${label} state changed while opening`)
      }
      if (opened.size > MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES) {
        throw new ManagerStructuredMemoryRecoveryError(
          `Structured memory ${label} state exceeds the supported size; no files were changed.`,
        )
      }
      if ((opened.mode & 0o077) !== 0) {
        const uid = process.getuid?.()
        if (uid !== undefined && opened.uid !== uid) {
          throw new ManagerStructuredMemoryRecoveryError(
            `Structured memory ${label} state is accessible to other users and not owned by the hub; no files were changed.`,
          )
        }
        await handle.chmod(0o600)
      }
      const buffer = Buffer.alloc(opened.size + 1)
      let length = 0
      for (;;) {
        const { bytesRead } = await handle.read(
          buffer,
          length,
          buffer.length - length,
          length,
        )
        if (bytesRead === 0) break
        length += bytesRead
        if (length > opened.size) {
          throw new ManagerStructuredMemoryRecoveryError(
            `Structured memory ${label} state changed while reading; no files were changed.`,
          )
        }
      }
      return buffer.toString('utf8', 0, length)
    } finally {
      await handle.close()
    }
  }

  /** Why structured memory stopped accepting work after an unrecoverable write. */
  failureReason(): string | undefined {
    return this.failure?.message
  }

  snapshot(): ManagerStructuredMemoryState {
    this.requireInitialized()
    return structuredClone(this.state)
  }

  exportState(): string {
    this.requireInitialized()
    return JSON.stringify(this.state)
  }

  search(
    input: unknown,
  ): ManagerStructuredMemorySearchResult {
    this.requireInitialized()
    return searchStructuredMemory(
      this.state,
      input,
      this.now(),
      this.searchIndex,
    )
  }

  remember(input: unknown): Promise<ManagerStructuredMemoryMutationResult> {
    const validated = validateStructuredMemoryRemember(input)
    this.requireUserWritableScope(validated.scope.type)
    return this.commit(async (state) => {
      const repeated = state.appliedRequests.find(
        ({ requestId }) => requestId === validated.requestId,
      )
      if (repeated) {
        this.requireRepeatedOperation(repeated.operation, 'remember')
        return {
          revision: repeated.revision,
          record: repeated.recordId
            ? state.records.find(({ id }) => id === repeated.recordId)
            : undefined,
          idempotent: true,
        }
      }
      const createdAt = this.now().toISOString()
      const contentDigest = digest(validated.content)
      const blocked = state.tombstones.some((tombstone) =>
        tombstone.canonicalKey === validated.canonicalKey &&
        tombstone.contentDigest === contentDigest &&
        JSON.stringify(tombstone.scope) === JSON.stringify(validated.scope))
      if (blocked) {
        throw new ManagerStructuredMemoryReferenceError(
          'This memory was forgotten and cannot be restored by remembering the same value.',
          409,
        )
      }
      const duplicate = state.records.find((record) =>
        record.canonicalKey === validated.canonicalKey &&
        record.content === validated.content &&
        JSON.stringify(record.scope) === JSON.stringify(validated.scope) &&
        record.supersededById === undefined &&
        !state.tombstones.some(({ recordId }) => recordId === record.id))
      if (duplicate) {
        this.requireCapacity(state, { audit: 1, appliedRequests: 1 })
        state.revision += 1
        state.audit.push({
          id: this.nextId(),
          operation: 'remember',
          requestId: validated.requestId,
          recordId: duplicate.id,
          occurredAt: createdAt,
          outcome: 'duplicate',
        })
        state.appliedRequests.push({
          requestId: validated.requestId,
          operation: 'remember',
          recordId: duplicate.id,
          revision: state.revision,
          appliedAt: createdAt,
        })
        return {
          revision: state.revision,
          record: duplicate,
          idempotent: true,
        }
      }
      this.requireCapacity(state, {
        records: 1,
        audit: 1,
        appliedRequests: 1,
      })
      const record = this.recordFor(
        validated,
        createdAt,
        'direct-user',
      )
      state.revision += 1
      state.records.push(record)
      state.audit.push({
        id: this.nextId(),
        operation: 'remember',
        requestId: validated.requestId,
        recordId: record.id,
        occurredAt: createdAt,
        outcome: 'applied',
      })
      state.appliedRequests.push({
        requestId: validated.requestId,
        operation: 'remember',
        recordId: record.id,
        revision: state.revision,
        appliedAt: createdAt,
      })
      return {
        revision: state.revision,
        record,
        idempotent: false,
      }
    })
  }

  correct(input: unknown): Promise<ManagerStructuredMemoryMutationResult> {
    const validated = validateStructuredMemoryCorrect(input)
    this.requireUserWritableScope(validated.scope.type)
    return this.commit(async (state) => {
      const repeated = state.appliedRequests.find(
        ({ requestId }) => requestId === validated.requestId,
      )
      if (repeated) {
        this.requireRepeatedOperation(repeated.operation, 'correct')
        return {
          revision: repeated.revision,
          record: repeated.recordId
            ? state.records.find(({ id }) => id === repeated.recordId)
            : undefined,
          idempotent: true,
        }
      }
      const previous = state.records.find(({ id }) => id === validated.recordId)
      if (!previous) {
        throw new ManagerStructuredMemoryReferenceError(
          'The structured memory record was not found.',
          404,
        )
      }
      this.requireUserWritableScope(previous.scope.type)
      if (
        previous.supersededById ||
        state.tombstones.some(({ recordId }) => recordId === previous.id)
      ) {
        throw new ManagerStructuredMemoryReferenceError(
          'The structured memory record is no longer active.',
          409,
        )
      }
      const contentDigest = digest(validated.content)
      if (state.tombstones.some((tombstone) =>
        tombstone.canonicalKey === validated.canonicalKey &&
        tombstone.contentDigest === contentDigest &&
        JSON.stringify(tombstone.scope) === JSON.stringify(validated.scope))
      ) {
        throw new ManagerStructuredMemoryReferenceError(
          'The replacement value was previously forgotten.',
          409,
        )
      }
      this.requireCapacity(state, {
        records: 1,
        audit: 1,
        appliedRequests: 1,
      })
      const createdAt = this.now().toISOString()
      const record = this.recordFor(
        validated,
        createdAt,
        'direct-user-correction',
        previous.id,
      )
      previous.supersededById = record.id
      previous.updatedAt = createdAt
      state.revision += 1
      state.records.push(record)
      state.audit.push({
        id: this.nextId(),
        operation: 'correct',
        requestId: validated.requestId,
        recordId: record.id,
        occurredAt: createdAt,
        outcome: 'applied',
      })
      state.appliedRequests.push({
        requestId: validated.requestId,
        operation: 'correct',
        recordId: record.id,
        revision: state.revision,
        appliedAt: createdAt,
      })
      return {
        revision: state.revision,
        record,
        idempotent: false,
      }
    })
  }

  forget(input: unknown): Promise<ManagerStructuredMemoryMutationResult> {
    const validated = validateStructuredMemoryForget(input)
    return this.commit(async (state) => {
      const repeated = state.appliedRequests.find(
        ({ requestId }) => requestId === validated.requestId,
      )
      if (repeated) {
        this.requireRepeatedOperation(repeated.operation, 'forget')
        return {
          revision: repeated.revision,
          tombstone: repeated.recordId
            ? state.tombstones.find(
                ({ recordId }) => recordId === repeated.recordId,
              )
            : undefined,
          idempotent: true,
        }
      }
      const record = state.records.find(({ id }) => id === validated.recordId)
      if (!record) {
        throw new ManagerStructuredMemoryReferenceError(
          'The structured memory record was not found.',
          404,
        )
      }
      this.requireUserWritableScope(record.scope.type)
      const existing = state.tombstones.find(
        ({ recordId }) => recordId === record.id,
      )
      const deletedAt = this.now().toISOString()
      if (existing) {
        this.requireCapacity(state, { audit: 1, appliedRequests: 1 })
        state.revision += 1
        state.audit.push({
          id: this.nextId(),
          operation: 'forget',
          requestId: validated.requestId,
          recordId: record.id,
          occurredAt: deletedAt,
          outcome: 'duplicate',
        })
        state.appliedRequests.push({
          requestId: validated.requestId,
          operation: 'forget',
          recordId: record.id,
          revision: state.revision,
          appliedAt: deletedAt,
        })
        return {
          revision: state.revision,
          tombstone: existing,
          idempotent: true,
        }
      }
      this.requireCapacity(state, {
        tombstones: 1,
        audit: 1,
        appliedRequests: 1,
      })
      const tombstone = {
        schemaVersion: 1 as const,
        recordId: record.id,
        scope: record.scope,
        canonicalKey: record.canonicalKey,
        contentDigest: digest(record.content),
        sourceDigest: record.provenance.sourceDigest,
        requestId: validated.requestId,
        deletedAt,
        ...(validated.sourceManagerMessageId
          ? { sourceManagerMessageId: validated.sourceManagerMessageId }
          : {}),
      }
      state.revision += 1
      state.tombstones.push(tombstone)
      state.audit.push({
        id: this.nextId(),
        operation: 'forget',
        requestId: validated.requestId,
        recordId: record.id,
        occurredAt: deletedAt,
        outcome: 'applied',
      })
      state.appliedRequests.push({
        requestId: validated.requestId,
        operation: 'forget',
        recordId: record.id,
        revision: state.revision,
        appliedAt: deletedAt,
      })
      return {
        revision: state.revision,
        tombstone,
        idempotent: false,
      }
    })
  }

  importState(
    requestId: unknown,
    serialized: unknown,
  ): Promise<ManagerStructuredMemoryMutationResult> {
    if (typeof serialized !== 'string') {
      throw new ManagerStructuredMemoryValidationError('malformed')
    }
    if (Buffer.byteLength(serialized) > MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES) {
      throw new ManagerStructuredMemoryValidationError('oversized')
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(serialized)
    } catch {
      throw new ManagerStructuredMemoryValidationError('malformed')
    }
    const validated = validateStructuredMemoryImport(requestId, parsed)
    return this.commit(async (state) => {
      const repeated = state.appliedRequests.find(
        (entry) => entry.requestId === validated.requestId,
      )
      if (repeated) {
        this.requireRepeatedOperation(repeated.operation, 'import')
        return {
          revision: repeated.revision,
          idempotent: true,
        }
      }
      if (
        state.revision !== 0 ||
        state.records.length > 0 ||
        state.tombstones.length > 0 ||
        state.audit.length > 0 ||
        state.appliedRequests.length > 0
      ) {
        throw new ManagerStructuredMemoryReferenceError(
          'Structured memory import requires an empty store.',
          409,
        )
      }
      if (validated.state.appliedRequests.some(
        (entry) => entry.requestId === validated.requestId,
      )) {
        throw new ManagerStructuredMemoryReferenceError(
          'The import request ID already exists in the imported state.',
          409,
        )
      }
      const appliedAt = this.now().toISOString()
      this.requireCapacity(validated.state, {
        audit: 1,
        appliedRequests: 1,
      })
      state.records = structuredClone(validated.state.records)
      state.tombstones = structuredClone(validated.state.tombstones)
      state.audit = structuredClone(validated.state.audit)
      state.appliedRequests = structuredClone(validated.state.appliedRequests)
      state.revision = validated.state.revision + 1
      state.audit.push({
        id: this.nextId(),
        operation: 'import',
        requestId: validated.requestId,
        occurredAt: appliedAt,
        outcome: 'applied',
      })
      state.appliedRequests.push({
        requestId: validated.requestId,
        operation: 'import',
        revision: state.revision,
        appliedAt,
      })
      return {
        revision: state.revision,
        idempotent: false,
      }
    })
  }

  private recordFor(
    input:
      | ManagerStructuredMemoryRememberInput
      | ManagerStructuredMemoryCorrectInput,
    createdAt: string,
    authority: ManagerStructuredMemoryAuthority,
    supersedesId?: string,
  ) {
    return {
      schemaVersion: 1 as const,
      id: this.nextId(),
      kind: input.kind,
      canonicalKey: input.canonicalKey,
      content: input.content,
      scope: input.scope,
      provenance: {
        origin: 'direct-user' as const,
        requestId: input.requestId,
        sourceDigest: digest(input),
        ...(input.sourceSession ? { sourceSession: input.sourceSession } : {}),
        ...(input.sourceManagerMessageId
          ? { sourceManagerMessageId: input.sourceManagerMessageId }
          : {}),
      },
      authority,
      confidence: input.confidence ?? 1,
      createdAt,
      updatedAt: createdAt,
      ...(input.validFrom ? { validFrom: input.validFrom } : {}),
      ...(input.validUntil ? { validUntil: input.validUntil } : {}),
      ...(supersedesId ? { supersedesId } : {}),
    }
  }

  private commit<T>(
    mutate: (state: ManagerStructuredMemoryState) => Promise<T> | T,
  ): Promise<T> {
    this.requireInitialized()
    const task = this.commits.then(async () => {
      this.requireInitialized()
      const next = structuredClone(this.state)
      const result = await mutate(next)
      validateStructuredMemoryState(next)
      const nextSearchIndex = updateStructuredMemorySearchIndex(
        this.searchIndex,
        next,
      )
      await this.persist(next)
      this.state = next
      this.searchIndex = nextSearchIndex
      return structuredClone(result)
    })
    this.commits = task.then(() => undefined, () => undefined)
    return task
  }

  private async persist(state: ManagerStructuredMemoryState): Promise<void> {
    const serialized = JSON.stringify(state)
    if (Buffer.byteLength(serialized) > MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES) {
      throw Object.assign(
        new Error('Structured memory reached its storage limit.'),
        { statusCode: 507 },
      )
    }
    const pending = `${this.statePath}.${this.nextId()}.pending`
    const pendingBackup = `${this.backupPath}.${this.nextId()}.pending`
    const previousSerialized = this.serialized
    let primaryPublished = false
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      if (this.serialized !== null) {
        await this.writeSynced(pendingBackup, this.serialized)
        await rename(pendingBackup, this.backupPath)
        await this.syncDirectory()
      }
      await this.writeSynced(pending, serialized)
      await rename(pending, this.statePath)
      primaryPublished = true
      await this.syncDirectory()
      this.serialized = serialized
    } catch (error) {
      await Promise.all([
        rm(pending, { force: true }).catch(() => undefined),
        rm(pendingBackup, { force: true }).catch(() => undefined),
      ])
      if (primaryPublished) {
        try {
          await this.restorePrimary(previousSerialized)
        } catch (recoveryError) {
          // Disk state is now uncertain, so refuse all further work until a
          // restart revalidates the files.
          this.failure = new ManagerStructuredMemoryRecoveryError(
            'Structured memory could not roll back an incomplete publication and is unavailable until the hub restarts.',
            new AggregateError([error, recoveryError]),
          )
          throw this.failure
        }
      }
      if ((error as { statusCode?: unknown }).statusCode === 507) throw error
      throw new ManagerStructuredMemoryPersistenceError(error)
    }
  }

  private async writeSynced(filePath: string, contents: string): Promise<void> {
    const handle = await open(filePath, 'wx', 0o600)
    try {
      await handle.writeFile(contents, 'utf8')
      await handle.sync()
    } finally {
      await handle.close()
    }
  }

  private async syncDirectory(): Promise<void> {
    if (this.injectedDirectorySync) {
      await this.injectedDirectorySync()
      return
    }
    const handle = await open(this.directory, 'r')
    try {
      await handle.sync()
    } finally {
      await handle.close()
    }
  }

  private async restorePrimary(serialized: string | null): Promise<void> {
    if (serialized === null) {
      await rm(this.statePath, { force: true })
      await this.syncDirectory()
      return
    }
    const pending = `${this.statePath}.${this.nextId()}.rollback.pending`
    try {
      await this.writeSynced(pending, serialized)
      await rename(pending, this.statePath)
      await this.syncDirectory()
    } catch (error) {
      await rm(pending, { force: true }).catch(() => undefined)
      throw error
    }
  }

  private requireRepeatedOperation(
    actual: string,
    expected: string,
  ): void {
    if (actual !== expected) {
      throw new ManagerStructuredMemoryReferenceError(
        'The structured memory request ID was already used for another operation.',
        409,
      )
    }
  }

  private requireUserWritableScope(
    scopeType: ManagerStructuredMemoryRememberInput['scope']['type'],
  ): void {
    if (scopeType === 'global') {
      throw new ManagerStructuredMemoryReferenceError(
        'Global structured memory requires a policy-authorized write.',
        403,
      )
    }
  }

  private requireCapacity(
    state: ManagerStructuredMemoryState,
    additions: {
      records?: number
      tombstones?: number
      audit?: number
      appliedRequests?: number
    },
  ): void {
    if (
      state.revision >= Number.MAX_SAFE_INTEGER ||
      state.records.length + (additions.records ?? 0) >
        MANAGER_STRUCTURED_MEMORY_MAX_RECORDS ||
      state.tombstones.length + (additions.tombstones ?? 0) >
        MANAGER_STRUCTURED_MEMORY_MAX_TOMBSTONES ||
      state.audit.length + (additions.audit ?? 0) >
        MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES ||
      state.appliedRequests.length + (additions.appliedRequests ?? 0) >
        MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS
    ) {
      throw new ManagerStructuredMemoryCapacityError()
    }
  }

  private requireInitialized(): void {
    if (this.failure) {
      throw new ManagerStructuredMemoryRecoveryError(this.failure.message)
    }
    if (!this.initialized) {
      throw new Error('Structured memory store is not initialized')
    }
  }
}
