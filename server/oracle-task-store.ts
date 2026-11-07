import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import {
  chmod,
  lstat,
  mkdir,
  open,
  rename,
  rm,
} from 'node:fs/promises'
import path from 'node:path'
import type { ManagerMessage, ManagerSessionRef } from '../shared/manager.js'
import { ORACLE_TASK_EXECUTION_PROMPT_MAX_LENGTH } from '../shared/oracle-task.js'
import type {
  OracleTask,
  OracleTaskAttempt,
  OracleTaskCompletionProvenance,
  OracleTaskOwner,
  OracleTaskSourcePlan,
  OracleTaskSourceSession,
  OracleTaskStatus,
} from '../shared/oracle-task.js'

export const ORACLE_TASK_MAX_ACTIVE = 100
export const ORACLE_TASK_MAX_ATTEMPTS = 20
export const ORACLE_TASK_MAX_SOURCE_EVENTS = 20
export const ORACLE_TASK_MAX_STATE_BYTES = 1_048_576

const STATE_VERSION = 2 as const
const LEGACY_STATE_VERSION = 1 as const
const STATE_FILE = 'dreamer-tasks.json'
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~+=:@-]{0,127}$/
const EVENT_ID_PATTERN = /^[a-f0-9]{64}$/

interface OracleTaskStoreState {
  version: typeof STATE_VERSION
  revision: number
  tasks: OracleTask[]
}

export interface OracleTaskStoreSnapshot {
  revision: number
  tasks: OracleTask[]
}

export interface OracleTaskFindingInput {
  sourceEventIds: string[]
  sourceSession?: OracleTaskSourceSession
  sourcePlan?: OracleTaskSourcePlan
  title: string
  summary: string
  nextAction: string
  owner: OracleTaskOwner
  executionPrompt?: string
}

export interface BeginOracleTaskAttemptInput {
  revision: number
  taskId: string
  requestId: string
  managerMessageId: string
}

export interface ReconcileOracleTaskAttemptInput {
  revision: number
  taskId: string
  attemptId: string
  status: Extract<OracleTaskStatus, 'queued' | 'running' | 'blocked' | 'failed' | 'review'>
  sessionRefs?: ManagerSessionRef[]
  error?: string
  startedAt?: string
  finishedAt?: string
}

export interface ConfirmOracleTaskCompletionInput {
  revision: number
  taskId: string
  completion: OracleTaskCompletionProvenance
}

export interface ResolveUserOracleTaskInput {
  revision: number
  taskId: string
  status: 'completed' | 'dismissed'
}

export interface OracleTaskStoreOptions {
  hubId: string
  now?: () => Date
  randomUUID?: () => string
  syncDirectory?: (directory: string) => Promise<void>
}

export class OracleTaskConflictError extends Error {
  readonly statusCode = 409

  constructor(message = 'Oracle task state changed; refresh and retry.') {
    super(message)
    this.name = 'OracleTaskConflictError'
  }
}

export class OracleTaskCapacityError extends Error {
  readonly statusCode = 409

  constructor(message = 'Oracle task capacity was reached.') {
    super(message)
    this.name = 'OracleTaskCapacityError'
  }
}

export class OracleTaskUnavailableError extends Error {
  readonly statusCode = 503

  constructor(message = 'Oracle task storage is unavailable.', options?: ErrorOptions) {
    super(message, options)
    this.name = 'OracleTaskUnavailableError'
  }
}

/**
 * Every session a task that is not completed or dismissed still uses: where
 * it came from and what its attempts ran in. They hold the task's evidence,
 * so Oracle never closes one without asking. Attempts record their sessions
 * only when reconciled, so the ones the attempts' turns in `messages` (the
 * conversation) already used count too.
 */
export function unfinishedOracleTaskSessions(
  tasks: readonly OracleTask[],
  messages: readonly ManagerMessage[],
): Array<{ computerId: string; sessionId: string }> {
  const sessions = new Map<string, { computerId: string; sessionId: string }>()
  const add = (references: ReadonlyArray<{ computerId: string; sessionId: string }> = []) => {
    for (const { computerId, sessionId } of references) {
      sessions.set(`${computerId}:${sessionId}`, { computerId, sessionId })
    }
  }
  const turns = new Set<string>()
  for (const task of tasks) {
    if (task.status === 'completed' || task.status === 'dismissed') continue
    if (task.sourceSession) add([task.sourceSession])
    for (const attempt of task.attempts) {
      add(attempt.sessionRefs)
      turns.add(attempt.managerMessageId)
    }
  }
  for (const message of messages) {
    if (turns.has(message.id)) add([...message.sessionRefs ?? [], ...message.automatic?.sessionRefs ?? []])
    if (message.replyTo && turns.has(message.replyTo)) add(message.sessionRefs)
  }
  return [...sessions.values()]
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT'
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && ID_PATTERN.test(value)
}

function isText(value: unknown, maximum: number): value is string {
  return typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maximum &&
    !value.includes('\0')
}

function isTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return new Date(value).toISOString() === value
}

function taskId(hubId: string, sourceEventIds: readonly string[]): string {
  return `oracle-task-${createHash('sha256')
    .update([hubId, ...sourceEventIds].join('\0'))
    .digest('hex')
    .slice(0, 40)}`
}

function attemptId(task: OracleTask, requestId: string): string {
  return `oracle-attempt-${createHash('sha256')
    .update([task.id, requestId].join('\0'))
    .digest('hex')
    .slice(0, 40)}`
}

function validateSourceSession(value: unknown): value is OracleTaskSourceSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const source = value as Record<string, unknown>
  return isId(source.computerId) &&
    isId(source.sessionId) &&
    Number.isSafeInteger(source.taskGeneration) &&
    (source.taskGeneration as number) > 0
}

function validateSourcePlan(value: unknown): value is OracleTaskSourcePlan {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const source = value as Record<string, unknown>
  return isId(source.planId) && isId(source.itemId)
}

function validateSessionRef(value: unknown): value is ManagerSessionRef {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const reference = value as Record<string, unknown>
  return isId(reference.computerId) &&
    isId(reference.sessionId) &&
    (reference.title === undefined || isText(reference.title, 200)) &&
    (reference.promptId === undefined || isId(reference.promptId)) &&
    (reference.promptAnchorId === undefined || isId(reference.promptAnchorId)) &&
    (
      reference.promptQueuePosition === undefined ||
      (
        Number.isSafeInteger(reference.promptQueuePosition) &&
        (reference.promptQueuePosition as number) > 0
      )
    ) &&
    (
      reference.promptDigest === undefined ||
      (
        typeof reference.promptDigest === 'string' &&
        EVENT_ID_PATTERN.test(reference.promptDigest)
      )
    )
}

function validateCompletion(value: unknown): value is OracleTaskCompletionProvenance {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const completion = value as Record<string, unknown>
  return completion.source === 'root-task-complete' &&
    isId(completion.attemptId) &&
    isId(completion.computerId) &&
    isId(completion.sessionId) &&
    Number.isSafeInteger(completion.sessionRevision) &&
    (completion.sessionRevision as number) >= 0 &&
    isId(completion.messageId) &&
    isId(completion.toolCallId) &&
    typeof completion.resultDigest === 'string' &&
    EVENT_ID_PATTERN.test(completion.resultDigest) &&
    isTimestamp(completion.completedAt) &&
    isTimestamp(completion.confirmedAt)
}

function validateAttempt(value: unknown): value is OracleTaskAttempt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const attempt = value as Record<string, unknown>
  return isId(attempt.id) &&
    isId(attempt.requestId) &&
    isId(attempt.managerMessageId) &&
    ['queued', 'running', 'blocked', 'failed', 'review', 'completed'].includes(
      String(attempt.status),
    ) &&
    Array.isArray(attempt.sessionRefs) &&
    attempt.sessionRefs.every(validateSessionRef) &&
    (attempt.error === undefined || isText(attempt.error, 1_000)) &&
    (attempt.startedAt === undefined || isTimestamp(attempt.startedAt)) &&
    (attempt.finishedAt === undefined || isTimestamp(attempt.finishedAt))
}

function validateTask(
  value: unknown,
  requireOraclePrompt = true,
): value is OracleTask {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const task = value as Record<string, unknown>
  return isId(task.id) &&
    Number.isSafeInteger(task.revision) &&
    (task.revision as number) > 0 &&
    isText(task.title, 120) &&
    isText(task.summary, 1_000) &&
    isText(task.nextAction, 1_000) &&
    (task.owner === 'oracle' || task.owner === 'user') &&
    ['ready', 'queued', 'running', 'blocked', 'failed', 'review', 'completed', 'dismissed']
      .includes(String(task.status)) &&
    Array.isArray(task.sourceEventIds) &&
    task.sourceEventIds.length > 0 &&
    task.sourceEventIds.length <= ORACLE_TASK_MAX_SOURCE_EVENTS &&
    task.sourceEventIds.every((id) => typeof id === 'string' && EVENT_ID_PATTERN.test(id)) &&
    (task.sourceSession === undefined || validateSourceSession(task.sourceSession)) &&
    (task.sourcePlan === undefined || validateSourcePlan(task.sourcePlan)) &&
    (
      task.executionPrompt === undefined ||
      isText(task.executionPrompt, ORACLE_TASK_EXECUTION_PROMPT_MAX_LENGTH)
    ) &&
    (
      !requireOraclePrompt ||
      task.owner !== 'oracle' ||
      isText(task.executionPrompt, ORACLE_TASK_EXECUTION_PROMPT_MAX_LENGTH)
    ) &&
    Array.isArray(task.attempts) &&
    task.attempts.length <= ORACLE_TASK_MAX_ATTEMPTS &&
    task.attempts.every(validateAttempt) &&
    (task.completion === undefined || validateCompletion(task.completion)) &&
    (
      task.userDisposition === undefined ||
      (
        task.userDisposition !== null &&
        typeof task.userDisposition === 'object' &&
        !Array.isArray(task.userDisposition) &&
        ['completed', 'dismissed'].includes(
          String((task.userDisposition as Record<string, unknown>).status),
        ) &&
        isTimestamp(
          (task.userDisposition as Record<string, unknown>).resolvedAt,
        )
      )
    ) &&
    isTimestamp(task.createdAt) &&
    isTimestamp(task.updatedAt)
}

function validateState(value: unknown): {
  state: OracleTaskStoreState
  migrated: boolean
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new OracleTaskUnavailableError('Oracle task state is malformed.')
  }
  const state = value as Record<string, unknown>
  const legacy = state.version === LEGACY_STATE_VERSION
  if (
    (!legacy && state.version !== STATE_VERSION) ||
    !Number.isSafeInteger(state.revision) ||
    (state.revision as number) < 0 ||
    !Array.isArray(state.tasks) ||
    !state.tasks.every((task) => validateTask(task, !legacy))
  ) {
    throw new OracleTaskUnavailableError('Oracle task state is corrupt or unsupported.')
  }
  const tasks = structuredClone(state.tasks as OracleTask[])
  if (new Set(tasks.map(({ id }) => id)).size !== tasks.length) {
    throw new OracleTaskUnavailableError('Oracle task state contains duplicate tasks.')
  }
  if (legacy) {
    for (const task of tasks) {
      if (task.owner !== 'oracle' || task.executionPrompt) continue
      task.owner = 'user'
      if (task.status !== 'completed' && task.status !== 'dismissed') {
        task.status = 'ready'
      }
      task.revision += 1
    }
  }
  return {
    state: {
      version: STATE_VERSION,
      revision: (state.revision as number) + (legacy ? 1 : 0),
      tasks,
    },
    migrated: legacy,
  }
}

async function defaultSyncDirectory(directory: string): Promise<void> {
  const handle = await open(directory, constants.O_RDONLY)
  try {
    await handle.sync()
  } finally {
    await handle.close()
  }
}

export class OracleTaskStore {
  private readonly statePath: string
  private readonly now: () => Date
  private readonly nextUUID: () => string
  private readonly syncDirectory: (directory: string) => Promise<void>
  private state: OracleTaskStoreState = { version: STATE_VERSION, revision: 0, tasks: [] }
  private initialized = false
  private initializing?: Promise<void>
  private commits: Promise<unknown> = Promise.resolve()

  constructor(
    private readonly directory: string,
    private readonly options: OracleTaskStoreOptions,
  ) {
    this.statePath = path.join(directory, STATE_FILE)
    this.now = options.now ?? (() => new Date())
    this.nextUUID = options.randomUUID ?? randomUUID
    this.syncDirectory = options.syncDirectory ?? defaultSyncDirectory
    if (!isId(options.hubId)) {
      throw new OracleTaskUnavailableError('Oracle task hub identity is invalid.')
    }
  }

  initialize(): Promise<void> {
    if (this.initialized) return Promise.resolve()
    if (this.initializing) return this.initializing
    const operation = this.load()
    this.initializing = operation
    operation.finally(() => {
      if (this.initializing === operation) this.initializing = undefined
    }).catch(() => undefined)
    return operation
  }

  snapshot(): OracleTaskStoreSnapshot {
    this.requireReady()
    return {
      revision: this.state.revision,
      tasks: structuredClone(this.state.tasks),
    }
  }

  upsertFinding(input: OracleTaskFindingInput): Promise<OracleTask> {
    const sourceEventIds = [...new Set(input.sourceEventIds)].sort()
    if (
      sourceEventIds.length === 0 ||
      sourceEventIds.length > ORACLE_TASK_MAX_SOURCE_EVENTS ||
      !sourceEventIds.every((id) => EVENT_ID_PATTERN.test(id)) ||
      !isText(input.title, 120) ||
      !isText(input.summary, 1_000) ||
      !isText(input.nextAction, 1_000) ||
      (input.owner !== 'oracle' && input.owner !== 'user') ||
      (input.sourceSession !== undefined && !validateSourceSession(input.sourceSession)) ||
      (input.sourcePlan !== undefined && !validateSourcePlan(input.sourcePlan)) ||
      (
        input.executionPrompt !== undefined &&
        !isText(input.executionPrompt, ORACLE_TASK_EXECUTION_PROMPT_MAX_LENGTH)
      ) ||
      (
        input.owner === 'oracle' &&
        !isText(input.executionPrompt, ORACLE_TASK_EXECUTION_PROMPT_MAX_LENGTH)
      )
    ) {
      throw new OracleTaskConflictError('Oracle finding is invalid.')
    }
    const id = taskId(this.options.hubId, sourceEventIds)
    return this.commit((candidate) => {
      const existing = candidate.tasks.find((task) => task.id === id)
      if (existing) return { value: structuredClone(existing), changed: false }
      const active = candidate.tasks.filter(
        ({ status }) => status !== 'completed' && status !== 'dismissed',
      ).length
      if (active >= ORACLE_TASK_MAX_ACTIVE) throw new OracleTaskCapacityError()
      const timestamp = this.now().toISOString()
      const task: OracleTask = {
        id,
        revision: 1,
        title: input.title.trim(),
        summary: input.summary.trim(),
        nextAction: input.nextAction.trim(),
        owner: input.owner,
        status: 'ready',
        sourceEventIds,
        ...(input.sourceSession ? { sourceSession: structuredClone(input.sourceSession) } : {}),
        ...(input.sourcePlan ? { sourcePlan: structuredClone(input.sourcePlan) } : {}),
        ...(input.executionPrompt ? { executionPrompt: input.executionPrompt.trim() } : {}),
        attempts: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      candidate.tasks.push(task)
      return { value: structuredClone(task), changed: true }
    })
  }

  beginAttempt(input: BeginOracleTaskAttemptInput): Promise<OracleTask> {
    return this.commit((candidate) => {
      const task = this.requireTask(candidate, input.taskId)
      const repeated = task.attempts.find(({ requestId }) => requestId === input.requestId)
      if (repeated) return { value: structuredClone(task), changed: false }
      this.requireTaskRevision(task, input.revision)
      if (!isId(input.requestId) || !isId(input.managerMessageId)) {
        throw new OracleTaskConflictError('Oracle task attempt identity is invalid.')
      }
      if (task.owner !== 'oracle') {
        throw new OracleTaskConflictError('User-owned tasks require explicit user action.')
      }
      if (!['ready', 'blocked', 'failed'].includes(task.status)) {
        throw new OracleTaskConflictError('Oracle task already has an active attempt.')
      }
      if (task.attempts.length >= ORACLE_TASK_MAX_ATTEMPTS) {
        throw new OracleTaskCapacityError('Oracle task attempt capacity was reached.')
      }
      const attempt: OracleTaskAttempt = {
        id: attemptId(task, input.requestId),
        requestId: input.requestId,
        managerMessageId: input.managerMessageId,
        status: 'queued',
        sessionRefs: [],
        startedAt: this.now().toISOString(),
      }
      task.attempts.push(attempt)
      task.status = 'queued'
      task.revision += 1
      task.updatedAt = this.now().toISOString()
      return { value: structuredClone(task), changed: true }
    })
  }

  reconcileAttempt(input: ReconcileOracleTaskAttemptInput): Promise<OracleTask> {
    return this.commit((candidate) => {
      const task = this.requireTask(candidate, input.taskId)
      if (task.status === 'completed' || task.status === 'dismissed') {
        return { value: structuredClone(task), changed: false }
      }
      this.requireTaskRevision(task, input.revision)
      const attempt = task.attempts.find(({ id }) => id === input.attemptId)
      if (!attempt) throw new OracleTaskConflictError('Oracle task attempt was not found.')
      if (input.sessionRefs?.some((reference) => !validateSessionRef(reference))) {
        throw new OracleTaskConflictError('Oracle task session reference is invalid.')
      }
      if (input.error !== undefined && !isText(input.error, 1_000)) {
        throw new OracleTaskConflictError('Oracle task failure reason is invalid.')
      }
      const sessionRefs = input.sessionRefs
        ? structuredClone(input.sessionRefs)
        : attempt.sessionRefs
      const error = input.error?.trim()
      const startedAt = input.startedAt ?? attempt.startedAt
      const finishedAt = input.finishedAt ?? attempt.finishedAt
      const changed =
        attempt.status !== input.status ||
        JSON.stringify(attempt.sessionRefs) !== JSON.stringify(sessionRefs) ||
        attempt.error !== error ||
        attempt.startedAt !== startedAt ||
        attempt.finishedAt !== finishedAt
      if (!changed) return { value: structuredClone(task), changed: false }
      attempt.status = input.status
      attempt.sessionRefs = sessionRefs
      if (error) attempt.error = error
      else delete attempt.error
      if (startedAt) attempt.startedAt = startedAt
      if (finishedAt) attempt.finishedAt = finishedAt
      if (task.attempts.at(-1)?.id === attempt.id) task.status = input.status
      task.revision += 1
      task.updatedAt = this.now().toISOString()
      return { value: structuredClone(task), changed: true }
    })
  }

  confirmCompletion(input: ConfirmOracleTaskCompletionInput): Promise<OracleTask> {
    return this.commit((candidate) => {
      const task = this.requireTask(candidate, input.taskId)
      if (
        task.status === 'completed' &&
        JSON.stringify(task.completion) === JSON.stringify(input.completion)
      ) {
        return { value: structuredClone(task), changed: false }
      }
      this.requireTaskRevision(task, input.revision)
      if (!validateCompletion(input.completion)) {
        throw new OracleTaskConflictError('Oracle task completion evidence is invalid.')
      }
      const attempt = task.attempts.find(({ id }) => id === input.completion.attemptId)
      if (!attempt || task.attempts.at(-1)?.id !== attempt.id) {
        throw new OracleTaskConflictError('Oracle task completion belongs to a stale attempt.')
      }
      attempt.status = 'completed'
      attempt.finishedAt = input.completion.confirmedAt
      task.status = 'completed'
      task.completion = structuredClone(input.completion)
      task.revision += 1
      task.updatedAt = input.completion.confirmedAt
      return { value: structuredClone(task), changed: true }
    })
  }

  resolveUserTask(input: ResolveUserOracleTaskInput): Promise<OracleTask> {
    return this.commit((candidate) => {
      const task = this.requireTask(candidate, input.taskId)
      if (
        task.owner === 'user' &&
        task.status === input.status &&
        task.userDisposition?.status === input.status
      ) {
        return { value: structuredClone(task), changed: false }
      }
      this.requireTaskRevision(task, input.revision)
      if (task.owner !== 'user') {
        throw new OracleTaskConflictError(
          'Oracle-owned tasks require verified execution evidence.',
        )
      }
      if (task.status === 'completed' || task.status === 'dismissed') {
        throw new OracleTaskConflictError('This user task is already resolved.')
      }
      const resolvedAt = this.now().toISOString()
      task.status = input.status
      task.userDisposition = { status: input.status, resolvedAt }
      task.revision += 1
      task.updatedAt = resolvedAt
      return { value: structuredClone(task), changed: true }
    })
  }

  private async load(): Promise<void> {
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      const directory = await lstat(this.directory)
      if (directory.isSymbolicLink() || !directory.isDirectory()) {
        throw new OracleTaskUnavailableError('Oracle task directory is not a regular directory.')
      }
      let metadata
      try {
        metadata = await lstat(this.statePath)
      } catch (error) {
        if (isMissing(error)) {
          this.initialized = true
          return
        }
        throw error
      }
      if (metadata.isSymbolicLink() || !metadata.isFile()) {
        throw new OracleTaskUnavailableError('Oracle task state is not a regular file.')
      }
      if (metadata.size > ORACLE_TASK_MAX_STATE_BYTES) {
        throw new OracleTaskUnavailableError('Oracle task state exceeds its size limit.')
      }
      const handle = await open(this.statePath, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0))
      let serialized: string
      try {
        serialized = await handle.readFile('utf8')
      } finally {
        await handle.close()
      }
      const loaded = validateState(JSON.parse(serialized))
      if (loaded.migrated) await this.persist(loaded.state)
      this.state = loaded.state
      this.initialized = true
    } catch (error) {
      if (error instanceof OracleTaskUnavailableError) throw error
      throw new OracleTaskUnavailableError('Oracle task storage could not be loaded.', {
        cause: error,
      })
    }
  }

  private commit<T>(
    mutate: (state: OracleTaskStoreState) => { value: T; changed: boolean },
  ): Promise<T> {
    this.requireReady()
    const operation = this.commits.then(async () => {
      const candidate = structuredClone(this.state)
      const result = mutate(candidate)
      if (!result.changed) return result.value
      candidate.revision += 1
      await this.persist(candidate)
      this.state = candidate
      return result.value
    })
    this.commits = operation.then(() => undefined, () => undefined)
    return operation
  }

  private async persist(state: OracleTaskStoreState): Promise<void> {
    const serialized = JSON.stringify(state)
    if (Buffer.byteLength(serialized, 'utf8') > ORACLE_TASK_MAX_STATE_BYTES) {
      throw new OracleTaskCapacityError('Oracle task state exceeds its size limit.')
    }
    const pending = `${this.statePath}.${this.nextUUID()}.pending`
    try {
      const handle = await open(pending, 'wx', 0o600)
      try {
        await handle.writeFile(serialized, 'utf8')
        await handle.sync()
      } finally {
        await handle.close()
      }
      await chmod(pending, 0o600)
      await this.syncDirectory(this.directory)
      const current = await lstat(this.statePath).catch((error: unknown) => {
        if (isMissing(error)) return undefined
        throw error
      })
      if (current && (current.isSymbolicLink() || !current.isFile())) {
        throw new OracleTaskUnavailableError('Oracle task state is not a regular file.')
      }
      await rename(pending, this.statePath)
      await this.syncDirectory(this.directory)
    } catch (error) {
      await rm(pending, { force: true }).catch(() => undefined)
      if (
        error instanceof OracleTaskCapacityError ||
        error instanceof OracleTaskUnavailableError
      ) throw error
      throw new OracleTaskUnavailableError('Oracle task state could not be saved.', {
        cause: error,
      })
    }
  }

  private requireReady(): void {
    if (!this.initialized) {
      throw new OracleTaskUnavailableError('Oracle task storage is not initialized.')
    }
  }

  private requireTaskRevision(task: OracleTask, revision: number): void {
    if (revision !== task.revision) throw new OracleTaskConflictError()
  }

  private requireTask(state: OracleTaskStoreState, id: string): OracleTask {
    const task = state.tasks.find((candidate) => candidate.id === id)
    if (!task) throw new OracleTaskConflictError('Oracle task was not found.')
    return task
  }
}
