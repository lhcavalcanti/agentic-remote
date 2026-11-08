import { createHash } from 'node:crypto'
import {
  DREAMER_PROGRESS_REFRESH_MS,
  hasDreamerSessionIdentity,
  isDreamerSessionItem,
  type DreamerCompletionCandidate,
  type DreamerPlan,
  type DreamerProgressStatus,
  type DreamerSettings,
  type DreamerSnapshot,
  type DreamerTaskCompletionProvenance,
} from '../shared/dreamer.js'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type {
  ManagerInternalSubmission,
  ManagerMessage,
} from '../shared/manager.js'
import type {
  OracleTask,
  OracleTaskAttempt,
  OracleTaskCompletionCandidate,
  OracleTaskEvidence,
  OracleTaskOwner,
  OracleTaskStatus,
  OracleTaskView,
} from '../shared/oracle-task.js'
import type { ManagerStructuredMemoryRuntime } from './manager-structured-memory-runtime.js'
import type { ManagerRegistry } from './manager-store.js'
import {
  DREAMER_MAX_ITEMS,
  DreamerPlannerCapacityError,
  activeDreamerMemoryIds,
  planDreamer,
  projectDreamerMemory,
  projectDreamerRegistry,
  type DreamerMemoryMetadata,
  type DreamerPlanDraft,
  type DreamerPlannerInput,
} from './dreamer-planner.js'
import {
  DreamerCapacityError,
  DreamerConflictError,
  DreamerPersistenceError,
  DreamerRecoveryError,
  DreamerStore,
  dreamerRunKey,
  type DreamerRunClaim,
  type DreamerStoreSnapshot,
  type DreamerPlanWithFingerprints,
  type DreamerCoverageIncrement,
} from './dreamer-store.js'
import {
  OracleTaskConflictError,
  OracleTaskStore,
} from './oracle-task-store.js'
import {
  dreamerScheduleDecision,
  validateDreamerTimeZone,
} from './dreamer-schedule.js'
import {
  DreamerProgress,
  type DreamerProgressLimits,
  type DreamerProgressRefresh,
  type DreamerProgressSnapshot,
  type DreamerProgressSource,
} from './dreamer-progress.js'

export interface DreamerPlannerExecutionInput extends DreamerPlannerInput {
  defaultPlan: DreamerPlanDraft
}

export interface DreamerFollowUp {
  title: string
  owner: OracleTaskOwner
  status: OracleTaskStatus
  nextAction: string
}

/** What Oracle is told about session progress and the open task list. */
export interface DreamerProgressView extends DreamerProgressSnapshot {
  error?: string
  /** Open tasks, most recently changed first. */
  followUps: DreamerFollowUp[]
}

const PROGRESS_REFRESH_ERROR = 'Dreamer could not refresh session progress.'
const DISPATCH_LEFT_ERROR =
  'The dispatch left the Oracle conversation before it finished; retry to run it again.'

export interface DreamerServiceOptions {
  now?: () => Date
  registry?: () => ManagerRegistry
  memory?: () => DreamerMemoryMetadata
  structuredMemory?: ManagerStructuredMemoryRuntime
  staleAfterMs?: number
  store?: DreamerStore
  planner?: (
    input: DreamerPlannerExecutionInput,
  ) => DreamerPlanDraft | Promise<DreamerPlanDraft>
  setInterval?: typeof globalThis.setInterval
  clearInterval?: typeof globalThis.clearInterval
  readSession?: (computerId: string, sessionId: string) => Promise<ManagedSession>
  taskStore?: OracleTaskStore
  setProactiveEnabled?: (enabled: boolean) => Promise<void>
  enqueueManagerTask?: (
    input: ManagerInternalSubmission,
  ) => Promise<ManagerMessage>
  managerMessages?: () => ManagerMessage[]
  managerMessage?: (id: string) => ManagerMessage | undefined
  /** Without a source Dreamer keeps no session progress. */
  progressSource?: DreamerProgressSource
  progressRefreshMs?: number
  progressLimits?: Partial<DreamerProgressLimits>
  /**
   * Runs after each refresh with the sessions computers answered for and the
   * computer generations read before that listing.
   */
  sweepLifecycle?: (
    sessions: ManagedSession[],
    computerGenerations: ReadonlyMap<string, string>,
  ) => Promise<void>
}

export class DreamerUnavailableError extends Error {
  readonly statusCode = 503

  constructor(message = 'Dreamer is unavailable on this hub.') {
    super(message)
    this.name = 'DreamerUnavailableError'
  }
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function safeRunError(error: unknown): string {
  if (error instanceof DreamerCapacityError) return error.message
  if (error instanceof DreamerPlannerCapacityError) return error.message
  if (error instanceof DreamerConflictError) return error.message
  if (error instanceof DreamerPersistenceError) return error.message
  if (error instanceof DreamerRecoveryError) return 'Dreamer storage is unavailable.'
  return 'Dreamer could not save the morning review.'
}

function publicSnapshot(
  storeSnapshot: DreamerStoreSnapshot,
  now: Date,
): DreamerSnapshot {
  let lastError = storeSnapshot.lastError
  if (!lastError && storeSnapshot.settings.enabled) {
    const decision = dreamerScheduleDecision(now, storeSnapshot.settings.timeZone)
    if (
      decision.reason === 'window-expired' &&
      !storeSnapshot.runs.some(({ key, status }) =>
        status === 'committed' &&
        key === dreamerRunKey(storeSnapshot.settings.timeZone, decision.localDate)) &&
      !(storeSnapshot.plan?.localDate === decision.localDate &&
        storeSnapshot.plan.timeZone === storeSnapshot.settings.timeZone)
    ) {
      lastError = 'Dreamer missed the current review window.'
    }
  }
  return {
    available: true,
    revision: storeSnapshot.revision,
    settings: {
      enabled: storeSnapshot.settings.enabled,
      timeZone: storeSnapshot.settings.timeZone,
    },
    ...(storeSnapshot.plan ? { plan: storeSnapshot.plan } : {}),
    ...(lastError ? { lastError } : {}),
  }
}

function unavailableSnapshot(
  storeSnapshot: DreamerStoreSnapshot | undefined,
  safeError: string,
): DreamerSnapshot {
  return {
    available: false,
    revision: storeSnapshot?.revision ?? 0,
    settings: {
      enabled: storeSnapshot?.settings.enabled ?? false,
      timeZone: storeSnapshot?.settings.timeZone ?? 'UTC',
    },
    ...(storeSnapshot?.plan ? { plan: storeSnapshot.plan } : {}),
    lastError: safeError,
  }
}

function planWithFingerprints(
  draft: DreamerPlanDraft,
  localDate: string,
  timeZone: string,
  createdAt: string,
): DreamerPlan {
  const planId = `plan-${digest(['dreamer', localDate, timeZone]).slice(0, 32)}`
  return {
    id: planId,
    localDate,
    timeZone,
    createdAt,
    items: draft.items.map(({ fingerprint: _fingerprint, ...item }) => item),
    coverage: [...draft.coverage],
    omitted: draft.omitted,
  }
}

export class DreamerService {
  private readonly now: () => Date
  private readonly registry?: () => ManagerRegistry
  private readonly memory?: () => DreamerMemoryMetadata
  private readonly structuredMemory?: ManagerStructuredMemoryRuntime
  private readonly staleAfterMs?: number
  private readonly store: DreamerStore
  private readonly planner: (
    input: DreamerPlannerExecutionInput,
  ) => DreamerPlanDraft | Promise<DreamerPlanDraft>
  private readonly setIntervalImpl: typeof globalThis.setInterval
  private readonly clearIntervalImpl: typeof globalThis.clearInterval
  private readonly readSession?: DreamerServiceOptions['readSession']
  private readonly taskStore?: OracleTaskStore
  private readonly setProactiveEnabled?: DreamerServiceOptions['setProactiveEnabled']
  private readonly enqueueManagerTask?: DreamerServiceOptions['enqueueManagerTask']
  private readonly managerMessages?: DreamerServiceOptions['managerMessages']
  private readonly managerMessage?: DreamerServiceOptions['managerMessage']
  private readonly progress?: DreamerProgress
  private readonly progressRefreshMs: number
  private readonly sweepLifecycle?: DreamerServiceOptions['sweepLifecycle']
  private initialized = false
  private initializing?: Promise<void>
  private started = false
  private timer?: ReturnType<typeof setInterval>
  /** Armed exactly while progress is being kept: enabled and started. */
  private progressTimer?: ReturnType<typeof setInterval>
  private progressGeneration = 0
  private progressRun?: Promise<void>
  private progressDueAt?: string
  private progressError?: string
  private lifecycleGeneration = 0
  private activeRun?: Promise<DreamerSnapshot>
  private activeCommit?: Promise<void>
  private memoryReconciliation?: Promise<void>
  private taskReconciliation?: Promise<void>
  private followUpTaskReconciliation?: Promise<void>
  private runtimeError?: string

  constructor(
    directory: string,
    options: DreamerServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date())
    this.registry = options.registry
    this.memory = options.memory
    this.structuredMemory = options.structuredMemory
    this.staleAfterMs = options.staleAfterMs
    this.store = options.store ?? new DreamerStore(directory, { now: this.now })
    this.planner = options.planner ?? ((input) => planDreamer(input))
    this.setIntervalImpl = options.setInterval ?? globalThis.setInterval
    this.clearIntervalImpl = options.clearInterval ?? globalThis.clearInterval
    this.readSession = options.readSession
    this.taskStore = options.taskStore
    this.setProactiveEnabled = options.setProactiveEnabled
    this.enqueueManagerTask = options.enqueueManagerTask
    this.managerMessages = options.managerMessages
    this.managerMessage = options.managerMessage
    this.progress = options.progressSource
      ? new DreamerProgress(options.progressSource, {
          now: this.now,
          limits: options.progressLimits,
        })
      : undefined
    this.progressRefreshMs = options.progressRefreshMs ?? DREAMER_PROGRESS_REFRESH_MS
    this.sweepLifecycle = options.sweepLifecycle
  }

  initialize(): Promise<void> {
    if (this.initialized) return Promise.resolve()
    if (this.initializing) return this.initializing
    const operation = this.store.initialize().then(async () => {
      await this.taskStore?.initialize()
      this.initialized = true
    })
    this.initializing = operation
    operation.finally(() => {
      if (this.initializing === operation) this.initializing = undefined
    }).catch(() => undefined)
    return operation
  }

  async start(): Promise<void> {
    await this.initialize()
    this.started = true
    await this.reconcileTasks()
    const snapshot = this.store.snapshot()
    if (!snapshot.settings.enabled) return
    this.startTimer()
    this.startProgress()
    if (this.activeRun) {
      this.scheduleAfterActive(this.activeRun, this.lifecycleGeneration)
      return
    }
    await this.runIfDue()
  }

  async stop(): Promise<void> {
    this.lifecycleGeneration += 1
    this.started = false
    this.stopTimer()
    this.stopProgress()
    const commit = this.activeCommit
    if (commit) await commit.catch(() => undefined)
  }

  snapshot(): DreamerSnapshot {
    this.requireAvailable()
    const progress = this.progressStatus()
    return {
      ...publicSnapshot(this.store.snapshot(), this.now()),
      tasks: this.taskStore?.snapshot().tasks ?? [],
      ...(progress ? { progress } : {}),
    }
  }

  async snapshotForApi(): Promise<DreamerSnapshot> {
    await this.initialize()
    this.requireAvailable()
    await this.reconcileStaleMemory()
    await this.reconcileTasks()
    return this.withTaskViews(
      await this.withCompletionCandidates(this.snapshot()),
    )
  }

  getSnapshot(): DreamerSnapshot {
    return this.snapshot()
  }

  timerActive(): boolean {
    return this.timer !== undefined
  }

  /** Keeps progress current between refreshes; ignored unless enabled. */
  handleHubEvent(event: HubEvent): void {
    if (!this.progressTimer) return
    try {
      this.progress?.applyEvent(event)
    } catch {
      // Progress is advisory; a bad event must never break hub delivery.
    }
  }

  /**
   * Refreshes session progress, then reconciles tasks and sweeps lifecycle
   * from the same listing. Callers that arrive mid-refresh share it, and a
   * refresh that outlives a disable or stop publishes nothing. Never rejects.
   */
  refreshProgress(): Promise<void> {
    if (!this.progress || !this.progressTimer) return Promise.resolve()
    if (this.progressRun) return this.progressRun
    const run = this.runProgress(this.progress, this.progressGeneration)
    this.progressRun = run
    const settle = () => {
      if (this.progressRun === run) this.progressRun = undefined
    }
    run.then(settle, settle)
    return run
  }

  progressView(): DreamerProgressView | undefined {
    if (!this.progress || !this.progressTimer) return undefined
    let tasks: OracleTask[] = []
    try {
      tasks = this.taskStore?.snapshot().tasks ?? []
    } catch {
      tasks = []
    }
    const followUps = tasks
      .filter(({ status }) => status !== 'completed' && status !== 'dismissed')
      .sort((left, right) =>
        left.updatedAt < right.updatedAt ? 1 : left.updatedAt > right.updatedAt ? -1 : 0)
      .map(({ title, owner, status, nextAction }) => ({ title, owner, status, nextAction }))
    return {
      ...this.progress.snapshot(),
      ...(this.progressError ? { error: this.progressError } : {}),
      followUps,
    }
  }

  async updateSettings(input: DreamerSettings & { revision: number }): Promise<DreamerSnapshot> {
    await this.initialize()
    this.requireAvailable()
    const settings = {
      revision: input.revision,
      enabled: input.enabled,
      timeZone: input.timeZone,
    }
    if (!validateDreamerTimeZone(settings.timeZone)) {
      throw Object.assign(new Error('Dreamer requires a valid IANA timezone.'), { statusCode: 400 })
    }
    const before = this.store.snapshot()
    await this.store.updateSettings(settings.revision, {
      enabled: settings.enabled,
      timeZone: settings.timeZone,
    })
    if (!settings.enabled) {
      this.lifecycleGeneration += 1
      this.stopTimer()
      this.stopProgress()
      await this.setProactiveEnabled?.(false)
      return this.snapshot()
    }
    if (before.settings.timeZone !== settings.timeZone) {
      this.lifecycleGeneration += 1
    }
    this.started = true
    this.startTimer()
    this.startProgress()
    await this.setProactiveEnabled?.(true)
    // A settings save is also the startup/enablement check. This keeps the
    // route deterministic without adding a manual-run endpoint.
    if (!before.settings.enabled || before.settings.timeZone !== settings.timeZone) {
      if (this.activeRun) {
        this.scheduleAfterActive(this.activeRun, this.lifecycleGeneration)
      } else {
        await this.runIfDue()
      }
    }
    return this.snapshot()
  }

  async dispatchTask(input: {
  revision: number
  taskId: string
  requestId: string
  }): Promise<DreamerSnapshot> {
  await this.initialize()
  this.requireAvailable()
  if (!this.taskStore || !this.enqueueManagerTask) {
    throw new DreamerUnavailableError('Oracle task dispatch is unavailable.')
  }
  const task = this.taskStore.snapshot().tasks.find(({ id }) => id === input.taskId)
  if (!task) throw new OracleTaskConflictError('Oracle task was not found.')
  const existing = task.attempts.find(({ requestId }) => requestId === input.requestId)
  if (existing) return this.snapshotForApi()
  if (task.status === 'queued' || task.status === 'running' || task.status === 'review') {
    return this.snapshotForApi()
  }
  if (
    task.status !== 'ready' &&
    task.status !== 'failed' &&
    task.status !== 'blocked'
  ) {
    throw new OracleTaskConflictError('This Oracle task cannot be dispatched.')
  }
  if (task.owner !== 'oracle') {
    throw new OracleTaskConflictError(
      'This task needs your action and cannot be dispatched.',
    )
  }
  if (!task.executionPrompt) {
    throw new OracleTaskConflictError(
      'This Oracle task has no executable next step.',
    )
  }
  const attemptDigest = createHash('sha256')
    .update([task.id, input.requestId].join('\0'))
    .digest('hex')
    .slice(0, 32)
  const managerMessageId = `task-attempt-${attemptDigest}`
  const started = await this.taskStore.beginAttempt({
    revision: input.revision,
    taskId: task.id,
    requestId: input.requestId,
    managerMessageId,
  })
  const attempt = started.attempts.find(
    ({ requestId }) => requestId === input.requestId,
  )!
  try {
    await this.enqueueManagerTask(
      this.taskSubmission(started, attempt),
    )
  } catch (error) {
    await this.taskStore.reconcileAttempt({
      revision: started.revision,
      taskId: started.id,
      attemptId: attempt.id,
      status: 'failed',
      error: `Oracle could not queue this task: ${
        error instanceof Error ? error.message : String(error)
      }`,
      finishedAt: this.now().toISOString(),
    })
    throw error
  }
  return this.snapshotForApi()
  }

  /**
   * Passes never overlap. A request made while one runs may concern a task
   * that pass has already read, so it waits for a pass that starts after it;
   * every request made during the same pass shares that one follow-up.
   */
  async reconcileTasks(): Promise<void> {
  if (this.followUpTaskReconciliation) return this.followUpTaskReconciliation
  const running = this.taskReconciliation
  if (!running) return this.startTaskReconciliation()
  const followUp = running.then(() => undefined, () => undefined).then(() => {
    if (this.followUpTaskReconciliation === followUp) {
      this.followUpTaskReconciliation = undefined
    }
    return this.startTaskReconciliation()
  })
  this.followUpTaskReconciliation = followUp
  return followUp
  }

  private startTaskReconciliation(): Promise<void> {
  const operation = this.reconcileTasksInternal()
  this.taskReconciliation = operation
  operation.finally(() => {
    if (this.taskReconciliation === operation) {
      this.taskReconciliation = undefined
    }
  }).catch(() => undefined)
  return operation
  }

  async confirmTaskCompletion(input: {
  revision: number
  taskId: string
  attemptId: string
  computerId: string
  sessionId: string
  sessionRevision: number
  messageId: string
  resultDigest: string
  }): Promise<DreamerSnapshot> {
  await this.initialize()
  this.requireAvailable()
  if (!this.taskStore || !this.readSession) {
    throw new DreamerUnavailableError('Oracle task completion is unavailable.')
  }
  const task = this.taskStore.snapshot().tasks.find(({ id }) => id === input.taskId)
  const attempt = task?.attempts.find(({ id }) => id === input.attemptId)
  if (
    task?.status === 'completed' &&
    task.completion?.attemptId === input.attemptId &&
    task.completion.computerId === input.computerId &&
    task.completion.sessionId === input.sessionId &&
    task.completion.sessionRevision === input.sessionRevision &&
    task.completion.messageId === input.messageId &&
    task.completion.resultDigest === input.resultDigest
  ) {
    return this.snapshotForApi()
  }
  if (
    !task ||
    !attempt ||
    !attempt.sessionRefs.some((reference) =>
      reference.computerId === input.computerId &&
      reference.sessionId === input.sessionId
    )
  ) {
    throw new OracleTaskConflictError(
      'Verified Oracle task completion is no longer available.',
    )
  }
  const session = await this.readSession(input.computerId, input.sessionId)
  const candidate = this.oracleCompletionCandidate(
    session,
    attempt,
    input.messageId,
  )
  if (
    !candidate ||
    candidate.sessionRevision !== input.sessionRevision ||
    candidate.resultDigest !== input.resultDigest
  ) {
    throw new OracleTaskConflictError(
      'Verified Oracle task completion changed; refresh and review it again.',
    )
  }
  await this.taskStore.confirmCompletion({
    revision: input.revision,
    taskId: input.taskId,
    completion: {
      source: candidate.source,
      attemptId: candidate.attemptId,
      computerId: candidate.computerId,
      sessionId: candidate.sessionId,
      sessionRevision: candidate.sessionRevision,
      messageId: candidate.messageId,
      toolCallId: candidate.toolCallId,
      resultDigest: candidate.resultDigest,
      completedAt: candidate.completedAt,
      confirmedAt: this.now().toISOString(),
    },
  })
  return this.snapshotForApi()
  }

  async resolveUserTask(input: {
    revision: number
    taskId: string
    status: 'completed' | 'dismissed'
  }): Promise<DreamerSnapshot> {
    await this.initialize()
    this.requireAvailable()
    if (!this.taskStore) {
      throw new DreamerUnavailableError('Oracle task resolution is unavailable.')
    }
    await this.taskStore.resolveUserTask(input)
    return this.snapshotForApi()
  }

  async editPlan(
    input: {
      revision: number
      planId: string
      order?: string[]
      item?: { id: string; status: 'pending' | 'skipped' | 'done' }
      completion?: {
        itemId: string
        computerId: string
        sessionId: string
        sessionRevision: number
        messageId: string
        resultDigest: string
      }
      investigate?: {
        itemId: string
        requestId: string
      }
      taskCompletion?: {
        taskId: string
        taskRevision: number
        attemptId: string
        computerId: string
        sessionId: string
        sessionRevision: number
        messageId: string
        resultDigest: string
      }
    },
  ): Promise<DreamerSnapshot> {
    await this.initialize()
    this.requireAvailable()
    await this.reconcileStaleMemory()
    if (input.investigate) {
      return this.investigatePlanItem({
        revision: input.revision,
        planId: input.planId,
        ...input.investigate,
      })
    }
    if (input.taskCompletion) {
      return this.confirmTaskCompletion({
        revision: input.taskCompletion.taskRevision,
        ...input.taskCompletion,
      })
    }
    const edit = {
      revision: input.revision,
      planId: input.planId,
      ...(input.order ? { order: [...input.order] } : {}),
      ...(input.item ? { item: { ...input.item } } : {}),
      ...(input.completion ? { completion: { ...input.completion } } : {}),
    }
    let completion: {
      itemId: string
      provenance: DreamerTaskCompletionProvenance
    } | undefined
    if (edit.completion) {
      const current = this.store.snapshot()
      const item = current.plan?.id === edit.planId
        ? current.plan.items.find(({ id }) => id === edit.completion!.itemId)
        : undefined
      if (
        !item
        || !hasDreamerSessionIdentity(item)
        || !this.readSession
        || item.computerId !== edit.completion.computerId
        || item.sessionId !== edit.completion.sessionId
      ) {
        throw new DreamerConflictError(
          'Verified session completion is no longer available; refresh and retry.',
        )
      }
      if (
        item.status === 'done'
        && item.completion
        && item.completion.computerId === item.computerId
        && item.completion.sessionId === item.sessionId
        && item.completion.sessionRevision === edit.completion.sessionRevision
        && item.completion.messageId === edit.completion.messageId
        && item.completion.resultDigest === edit.completion.resultDigest
      ) {
        return this.snapshotForApi()
      }

      let candidate: DreamerCompletionCandidate | undefined
      try {
        candidate = await this.completionCandidate(
          item.computerId,
          item.sessionId,
          edit.completion.messageId,
        )
      } catch {
        throw new DreamerConflictError(
          'Verified session completion could not be re-read; refresh and retry.',
        )
      }
      if (!candidate || candidate.resultDigest !== edit.completion.resultDigest) {
        throw new DreamerConflictError(
          'Verified session completion changed; refresh and review it again.',
        )
      }
      if (
        candidate.computerId !== edit.completion.computerId
        || candidate.sessionId !== edit.completion.sessionId
        || candidate.sessionRevision !== edit.completion.sessionRevision
      ) {
        throw new DreamerConflictError(
          'Verified session completion changed; refresh and review it again.',
        )
      }
      completion = {
        itemId: item.id,
        provenance: item.completion
          && item.completion.computerId === candidate.computerId
          && item.completion.sessionId === candidate.sessionId
          && item.completion.sessionRevision === candidate.sessionRevision
          && item.completion.messageId === candidate.messageId
          && item.completion.toolCallId === candidate.toolCallId
          && item.completion.resultDigest === candidate.resultDigest
          && item.completion.completedAt === candidate.completedAt
          ? item.completion
          : {
          source: candidate.source,
          computerId: candidate.computerId,
          sessionId: candidate.sessionId,
          sessionRevision: candidate.sessionRevision,
          messageId: candidate.messageId,
          toolCallId: candidate.toolCallId,
          resultDigest: candidate.resultDigest,
          completedAt: candidate.completedAt,
          confirmedAt: this.now().toISOString(),
        },
      }
    }
    let activeMemoryIds: Set<string> | undefined
    if (edit.item?.status === 'done') {
      const current = this.store.snapshot()
      const item = current.plan?.id === edit.planId
        ? current.plan.items.find(({ id }) => id === edit.item!.id)
        : undefined
      if (item && isDreamerSessionItem(item)) {
        throw new DreamerConflictError(
          'Verified session completion is required; refresh and review its evidence.',
        )
      }
    }
    if (edit.item?.status === 'pending') {
      const current = this.store.snapshot()
      const item = current.plan?.id === edit.planId
        ? current.plan.items.find(({ id }) => id === edit.item!.id)
        : undefined
      if (item?.memoryId) {
        const memory = this.captureMemory()
        if (!memory || memory.mode !== 'on' || !memory.available) {
          throw new DreamerUnavailableError(
            'Structured memory metadata is unavailable.',
          )
        }
        activeMemoryIds = activeDreamerMemoryIds(memory, this.now())
        if (!activeMemoryIds.has(item.memoryId)) {
          throw new DreamerConflictError(
            'Dreamer memory item is no longer available; refresh and retry.',
          )
        }
      }
      if (item?.taskId) {
        const linked = this.taskStore?.snapshot().tasks.find(
          ({ id }) => id === item.taskId,
        )
        if (!linked) {
          throw new DreamerConflictError(
            'The linked Oracle task is unavailable; refresh and retry.',
          )
        }
        if (linked.status !== 'completed' && linked.status !== 'dismissed') {
          throw new DreamerConflictError(
            'The linked Oracle task is still active; resolve it before restoring this suggestion.',
          )
        }
      }
    }
    await this.store.editPlan(edit.revision, edit.planId, {
      ...(edit.order ? { order: edit.order } : {}),
      ...(edit.item ? { item: edit.item } : {}),
      ...(activeMemoryIds ? { activeMemoryIds } : {}),
      ...(completion ? { completion } : {}),
    })
    return this.snapshotForApi()
  }

  private async investigatePlanItem(input: {
    revision: number
    planId: string
    itemId: string
    requestId: string
  }): Promise<DreamerSnapshot> {
    if (!this.taskStore || !this.enqueueManagerTask) {
      throw new DreamerUnavailableError('Oracle investigation is unavailable.')
    }
    const current = this.store.snapshot()
    const currentItem = current.plan?.id === input.planId
      ? current.plan.items.find(({ id }) => id === input.itemId)
      : undefined
    const sourceTasks = this.taskStore.snapshot().tasks.filter(
      ({ sourcePlan }) =>
        sourcePlan?.planId === input.planId &&
        sourcePlan.itemId === input.itemId,
    )
    if (currentItem?.taskId) {
      const linked = this.taskStore.snapshot().tasks.find(
        ({ id }) => id === currentItem.taskId,
      )
      if (!linked) {
        throw new DreamerConflictError(
          'The linked Oracle task is unavailable; refresh and retry.',
        )
      }
      if (linked.attempts.some(({ requestId }) => requestId === input.requestId)) {
        return this.snapshotForApi()
      }
      await this.dispatchTask({
        revision: linked.revision,
        taskId: linked.id,
        requestId: input.requestId,
      })
      return this.snapshotForApi()
    }
    if (current.revision !== input.revision || current.plan?.id !== input.planId) {
      throw new DreamerConflictError('Dreamer plan changed; refresh and retry.')
    }
    const item = currentItem
    if (
      !item ||
      !['session', 'carry'].includes(item.source) ||
      !hasDreamerSessionIdentity(item)
    ) {
      throw new DreamerConflictError(
        'This Morning Plan suggestion is no longer available for investigation.',
      )
    }
    const recoverable = sourceTasks.findLast(
      ({ status }) => status !== 'completed' && status !== 'dismissed',
    )
    if (recoverable) {
      await this.store.editPlan(input.revision, input.planId, {
        task: {
          itemId: input.itemId,
          taskId: recoverable.id,
        },
      })
      await this.dispatchTask({
        revision: recoverable.revision,
        taskId: recoverable.id,
        requestId: input.requestId,
      })
      return this.snapshotForApi()
    }
    const task = await this.taskStore.upsertFinding({
      sourceEventIds: [
        createHash('sha256')
          .update([
            'dreamer-investigate',
            input.planId,
            input.itemId,
            ...sourceTasks.map(({ id }) => id).sort(),
          ].join('\0'))
          .digest('hex'),
      ],
      sourcePlan: {
        planId: input.planId,
        itemId: input.itemId,
      },
      title: item.label,
      summary: item.reason,
      nextAction: 'Oracle will investigate the linked session and produce verified follow-up.',
      owner: 'oracle',
      executionPrompt: [
        `Investigate the Morning Plan suggestion "${item.label}".`,
        item.reason,
        `Start from session ${item.computerId}/${item.sessionId}.`,
        'Reproduce the issue when possible, run focused tests, and leave an explicit blocker or root task completion.',
      ].join('\n'),
    })
    await this.store.editPlan(input.revision, input.planId, {
      task: {
        itemId: input.itemId,
        taskId: task.id,
      },
    })
    await this.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: input.requestId,
    })
    return this.snapshotForApi()
  }

  private async withCompletionCandidates(
    snapshot: DreamerSnapshot,
    conflictRetry = true,
  ): Promise<DreamerSnapshot> {
    if (!snapshot.plan || !this.readSession) return snapshot
    let duplicateCount = 0
    let closedOrMissingCount = 0
    let invalidIdentityCount = 0
    let unreviewableCount = 0
    const seenSessions = new Set<string>()
    const removedItemIds: string[] = []
    const projected = await Promise.all(snapshot.plan.items.map(async (item) => {
      if (
        item.status !== 'pending'
        || !hasDreamerSessionIdentity(item)
      ) return item
      const identity = JSON.stringify([item.computerId, item.sessionId])
      if (seenSessions.has(identity)) {
        duplicateCount += 1
        removedItemIds.push(item.id)
        return undefined
      }
      seenSessions.add(identity)
      try {
        const session = await this.readSession!(item.computerId, item.sessionId)
        if (
          session.computerId !== item.computerId
          || session.id !== item.sessionId
        ) {
          invalidIdentityCount += 1
          removedItemIds.push(item.id)
          return undefined
        }
        if (session.isOpen === false) {
          closedOrMissingCount += 1
          removedItemIds.push(item.id)
          return undefined
        }
        const candidate = this.completionCandidateFromSession(
          session,
          item.computerId,
          item.sessionId,
        )
        if (candidate) {
          return {
            ...item,
            label: 'Review session completion',
            reason: 'Authoritative session evidence reports a completed root task.',
            completionCandidate: candidate,
            sourceState: 'verified-completion' as const,
            sourceStateReason: 'Review the verified result before confirming completion.',
          }
        }
        if (session.status === 'error' || session.status === 'waiting') {
          return {
            ...item,
            label: session.status === 'error' ? 'Session needs attention' : 'Session is waiting',
            reason: session.status === 'error'
              ? 'Authoritative session state reports an unresolved error.'
              : 'Authoritative session state reports that input is required.',
            sourceState: 'pending' as const,
            sourceStateReason: 'No verified root task completion is available. Resolve the session, then refresh.',
          }
        }
        if (
          item.source === 'carry' &&
          (session.status === 'running' || session.status === 'idle')
        ) {
          return {
            ...item,
            sourceState: 'pending' as const,
            sourceStateReason: 'The session is still open and has no verified root task completion. Refresh after it finishes.',
          }
        }
        unreviewableCount += 1
        removedItemIds.push(item.id)
        return undefined
      } catch (error) {
        if ((error as { statusCode?: unknown }).statusCode === 404) {
          closedOrMissingCount += 1
          removedItemIds.push(item.id)
          return undefined
        }
        return {
          ...item,
          completionSourceUnavailable: true,
          sourceState: 'unavailable' as const,
          sourceStateReason: 'The owning session is offline or unavailable. Reconnect it, then refresh.',
        }
      }
    }))
    const coverageIncrements: DreamerCoverageIncrement[] = []
    const addExcluded = (count: number, singular: string, plural = `${singular}s`) => {
      if (!count) return
      coverageIncrements.push({ count, singular, plural })
    }
    addExcluded(duplicateCount, 'duplicate session proposal')
    addExcluded(
      closedOrMissingCount,
      'session that is authoritatively closed or missing',
      'sessions that are authoritatively closed or missing',
    )
    addExcluded(
      invalidIdentityCount,
      'session proposal with mismatched authoritative identity',
      'session proposals with mismatched authoritative identity',
    )
    addExcluded(
      unreviewableCount,
      'session proposal without an actionable authoritative source',
      'session proposals without an actionable authoritative source',
    )
    if (removedItemIds.length > 0) {
      try {
        await this.store.reconcilePlanSources(
          snapshot.revision,
          snapshot.plan.id,
          removedItemIds,
          coverageIncrements,
        )
      } catch (error) {
        if (conflictRetry && error instanceof DreamerConflictError) {
          return this.withCompletionCandidates(this.snapshot(), false)
        }
        throw error
      }
      const persisted = this.snapshot()
      if (!persisted.plan) return persisted
      const transientItems = new Map(
        projected
          .filter((item): item is DreamerPlan['items'][number] => item !== undefined)
          .map((item) => [item.id, item]),
      )
      return {
        ...persisted,
        plan: {
          ...persisted.plan,
          items: persisted.plan.items.map((item) => transientItems.get(item.id) ?? item),
        },
      }
    }
    const coverage = [...snapshot.plan.coverage]
    for (const { count, singular, plural = `${singular}s` } of coverageIncrements) {
      const entry = `Excluded ${count} ${count === 1 ? singular : plural}.`
      if (!coverage.includes(entry)) coverage.push(entry)
    }
    return {
      ...snapshot,
      plan: {
        ...snapshot.plan,
        coverage,
        items: projected.filter((item): item is DreamerPlan['items'][number] => item !== undefined),
      },
    }
  }

  private async completionCandidate(
    computerId: string,
    sessionId: string,
    messageId?: string,
  ): Promise<DreamerCompletionCandidate | undefined> {
    if (!this.readSession) return undefined
    const session = await this.readSession(computerId, sessionId)
    return this.completionCandidateFromSession(session, computerId, sessionId, messageId)
  }

  private completionCandidateFromSession(
    session: ManagedSession,
    computerId: string,
    sessionId: string,
    messageId?: string,
  ): DreamerCompletionCandidate | undefined {
    if (
      session.computerId !== computerId
      || session.id !== sessionId
      || !Number.isSafeInteger(session.revision)
      || session.revision! < 0
    ) return undefined
    const messageIndex = messageId
      ? session.messages.findIndex((candidate) => candidate.id === messageId)
      : session.messages.findLastIndex((candidate) => candidate.taskCompletion !== undefined)
    const lastUserMessageIndex = session.messages.findLastIndex(
      (candidate) => candidate.role === 'user',
    )
    if (messageIndex < 0 || messageIndex < lastUserMessageIndex) return undefined
    const message = session.messages[messageIndex]
    if (
      !message
      || message.role !== 'assistant'
      || message.taskCompletion?.source !== 'root-task-complete'
      || !message.content.trim()
    ) return undefined
    return {
      source: 'root-task-complete',
      computerId,
      sessionId,
      sessionRevision: session.revision!,
      messageId: message.id,
      toolCallId: message.taskCompletion.toolCallId,
      completedAt: message.taskCompletion.completedAt,
      resultDigest: createHash('sha256').update(message.content).digest('hex'),
      summary: message.content.length > 1_000
        ? `${message.content.slice(0, 999)}…`
        : message.content,
    }
  }

  async runIfDue(): Promise<DreamerSnapshot> {
    if (this.activeRun) return this.activeRun
    const operation = this.runIfDueSafe()
    this.activeRun = operation
    operation.finally(() => {
      if (this.activeRun === operation) this.activeRun = undefined
    }).catch(() => undefined)
    return operation
  }

  private async runIfDueSafe(): Promise<DreamerSnapshot> {
    try {
      await this.initialize()
      if (this.runtimeError) return this.safeUnavailableSnapshot(this.runtimeError)
      return await this.runIfDueInternal()
    } catch (error) {
      return this.handleScheduledFailure(error)
    }
  }

  private async runIfDueInternal(): Promise<DreamerSnapshot> {
    const lifecycle = this.lifecycleGeneration
    const current = this.store.snapshot()
    if (!current.settings.enabled) return publicSnapshot(current, this.now())
    const decision = dreamerScheduleDecision(this.now(), current.settings.timeZone)
    if (!decision.due) return publicSnapshot(current, this.now())
    const key = dreamerRunKey(current.settings.timeZone, decision.localDate)
    const claimed = await this.store.claimRun({
      key,
      localDate: decision.localDate,
      timeZone: current.settings.timeZone,
      generation: current.settings.generation,
    })
    if (!this.started || lifecycle !== this.lifecycleGeneration) {
      return publicSnapshot(this.store.snapshot(), this.now())
    }
    if (claimed.kind !== 'claimed') {
      if (claimed.kind === 'capacity') {
        await this.store.recordError('Dreamer run history is full; no new run was started.')
      }
      return publicSnapshot(this.store.snapshot(), this.now())
    }
    const claim = claimed.claim
    try {
      const input = this.capturePlannerInput()
      const defaultPlan = planDreamer(input)
      const draft = await this.planner({ ...input, defaultPlan })
      if (!this.isCurrent(lifecycle, claim)) {
        return publicSnapshot(this.store.snapshot(), this.now())
      }
      if (draft.items.length > DREAMER_MAX_ITEMS) {
        throw new DreamerCapacityError('Dreamer plans may contain at most 20 items.')
      }
      const plan = planWithFingerprints(
        draft,
        decision.localDate,
        current.settings.timeZone,
        this.now().toISOString(),
      )
      const persistedItems = draft.items.map((item) => ({
        ...item,
        fingerprint: item.fingerprint,
      }))
      const commit = this.store.commitRun(
        claim,
        { ...plan, items: persistedItems } as DreamerPlanWithFingerprints,
        [],
      )
      this.activeCommit = commit
      try {
        await commit
      } finally {
        if (this.activeCommit === commit) this.activeCommit = undefined
      }
      return this.snapshot()
    } catch (error) {
      if (error instanceof DreamerConflictError || !this.isCurrent(lifecycle, claim)) {
        return publicSnapshot(this.store.snapshot(), this.now())
      }
      const safeError = safeRunError(error)
      try {
        await this.store.failRun(claim, safeError)
      } catch (failure: unknown) {
        if (failure instanceof DreamerConflictError) {
          return publicSnapshot(this.store.snapshot(), this.now())
        }
        return this.handleScheduledFailure(failure)
      }
      return publicSnapshot(this.store.snapshot(), this.now())
    }
  }

  private capturePlannerInput(): DreamerPlannerInput {
    let sessions: ReturnType<typeof projectDreamerRegistry> = []
    let registryAvailable = false
    if (this.registry) {
      registryAvailable = true
      try {
        sessions = projectDreamerRegistry(this.registry())
      } catch {
        registryAvailable = false
      }
    }
    const memory = this.captureMemory()
    const stored = this.store.stateSnapshot()
    return {
      now: this.now(),
      registryAvailable,
      sessions,
      ...(memory ? { memory } : {}),
      previous: stored.plan
        ? {
            items: stored.plan.items.map((item) => ({
              ...item,
              fingerprint: stored.plan!.fingerprints[item.id] ?? item.id,
            })),
            history: stored.history,
          }
        : { items: [], history: stored.history },
      ...(this.staleAfterMs === undefined ? {} : { staleAfterMs: this.staleAfterMs }),
    }
  }

  private captureMemory(): DreamerMemoryMetadata | undefined {
    if (this.memory) {
      try {
        const supplied = this.memory()
        return projectDreamerMemory(
          supplied.mode,
          supplied.available,
          supplied.mode === 'on' && supplied.available ? supplied : undefined,
          supplied.lastError,
        )
      } catch {
        return projectDreamerMemory(
          'on',
          false,
          undefined,
          'Structured memory metadata is unavailable.',
        )
      }
    }
    if (!this.structuredMemory) return undefined
    if (this.structuredMemory.mode !== 'on') {
      return projectDreamerMemory(this.structuredMemory.mode, false)
    }
    if (!this.structuredMemory.store || this.structuredMemory.store.failureReason()) {
      return projectDreamerMemory(
        this.structuredMemory.mode,
        false,
        undefined,
        'Structured memory metadata is unavailable.',
      )
    }
    return projectDreamerMemory(
      this.structuredMemory.mode,
      true,
      this.structuredMemory.store.metadataSnapshot(),
    )
  }

  private taskSubmission(
    task: OracleTask,
    attempt: OracleTaskAttempt,
  ): ManagerInternalSubmission {
    const priorSessionRefs = uniqueSessionRefs(
      task.attempts
        .filter(({ id }) => id !== attempt.id)
        .flatMap(({ sessionRefs }) => sessionRefs),
    )
    return {
      id: attempt.managerMessageId,
      source: 'task',
      answerOnly: false,
      automatic: {
        kind: 'task',
        taskId: task.id,
        sessionRefs: priorSessionRefs,
      },
      content: [
        task.executionPrompt!,
        '',
        `Durable task: ${task.title}`,
        `Next action: ${task.nextAction}`,
        ...(priorSessionRefs.length
          ? [
              `Previous execution sessions: ${priorSessionRefs
                .map(({ computerId, sessionId }) => `${computerId}/${sessionId}`)
                .join(', ')}.`,
              'Inspect and continue a previous execution session when safe; create a replacement only when it cannot be continued.',
            ]
          : []),
        'Use a real execution session for repository work. Report blockers explicitly.',
      ].join('\n'),
    }
  }

  private async reconcileTasksInternal(): Promise<void> {
    if (!this.taskStore || !this.managerMessages) return
    for (const original of this.taskStore.snapshot().tasks) {
      const attempt = original.attempts.at(-1)
      if (!attempt || original.status === 'completed' || original.status === 'dismissed') {
        continue
      }
      let task = original
      let messages = this.managerMessages()
      let managerMessage = messages.find(({ id }) => id === attempt.managerMessageId)
        ?? this.managerMessage?.(attempt.managerMessageId)
      // A trimmed dispatch can leave newer replies that already link a session.
      const linked = attempt.sessionRefs.length > 0 || messages.some(
        ({ replyTo, sessionRefs }) =>
          replyTo === attempt.managerMessageId && Boolean(sessionRefs?.length),
      )
      if (
        !managerMessage &&
        attempt.status === 'queued' &&
        !linked &&
        this.enqueueManagerTask &&
        task.executionPrompt
      ) {
        await this.enqueueManagerTask(this.taskSubmission(task, attempt))
        messages = this.managerMessages()
        managerMessage = messages.find(({ id }) => id === attempt.managerMessageId)
          ?? this.managerMessage?.(attempt.managerMessageId)
      }
      const related = messages.filter(
        ({ replyTo }) => replyTo === attempt.managerMessageId,
      )
      const sessionRefs = uniqueSessionRefs([
        ...attempt.sessionRefs,
        ...(managerMessage?.sessionRefs ?? []),
        ...related.flatMap(({ sessionRefs }) => sessionRefs ?? []),
      ])
      let status: OracleTaskAttempt['status'] =
        attempt.status === 'failed' ? 'failed' : 'queued'
      let error = attempt.status === 'failed' ? attempt.error : undefined
      const managerFailure = (
        managerMessage?.state === 'failed' ||
        managerMessage?.state === 'cancelled' ||
        managerMessage?.state === 'interrupted'
      )
        ? managerMessage.error?.trim() ||
          `Oracle task dispatch ${managerMessage.state}.`
        : undefined
      if (sessionRefs.length > 0 && this.readSession) {
        const sessions: ManagedSession[] = []
        let unavailableError: string | undefined
        for (const reference of sessionRefs) {
          try {
            const session = await this.readSession(
              reference.computerId,
              reference.sessionId,
            )
            if (
              session.computerId !== reference.computerId ||
              session.id !== reference.sessionId
            ) {
              unavailableError = 'Execution session identity changed.'
            } else {
              sessions.push(session)
            }
          } catch (sessionError) {
            unavailableError = `Execution session is unavailable: ${
              sessionError instanceof Error ? sessionError.message : String(sessionError)
            }`
          }
        }
        const candidate = sessions
          .map((session) => this.oracleCompletionCandidate(
            session,
            { ...attempt, sessionRefs },
          ))
          .find((value) => value !== undefined)
        if (candidate) {
          status = 'review'
          error = undefined
        } else if (unavailableError) {
          status = 'blocked'
          error = unavailableError
        } else if (sessions.some(({ status: state }) => state === 'error')) {
          status = 'failed'
          error = 'An execution session failed without verified completion.'
        } else if (
          sessions.some((session) =>
            session.status === 'waiting' ||
            session.pendingPermission !== undefined ||
            session.pendingUserInput !== undefined
          )
        ) {
          status = 'blocked'
          error = 'Execution is waiting for user action.'
        } else if (sessions.some(({ status: state }) => state === 'running')) {
          status = 'running'
          error = undefined
        } else if (sessions.some((session) =>
          session.queueState?.state !== 'error' &&
          sessionRefs.some((reference) =>
            reference.computerId === session.computerId &&
            reference.sessionId === session.id &&
            reference.promptId !== undefined &&
            session.queuedPrompts?.some(({ id }) => id === reference.promptId)
          )
        )) {
          status = 'queued'
          error = undefined
        } else if (
          managerMessage?.state === 'queued' ||
          managerMessage?.state === 'running'
        ) {
          status = managerMessage.state
          error = undefined
        } else if (managerFailure) {
          status = 'failed'
          error = managerFailure
        } else if (
          !managerMessage &&
          (attempt.status === 'queued' ||
            attempt.status === 'running' ||
            attempt.status === 'failed')
        ) {
          // The dispatch left the conversation and no session evidence decides.
          status = 'failed'
          error = attempt.status === 'failed' ? attempt.error : DISPATCH_LEFT_ERROR
        } else if (sessions.length > 0) {
          status = 'blocked'
          error = 'Execution stopped without verified completion.'
        }
      } else if (managerFailure) {
        status = 'failed'
        error = managerFailure
      } else if (managerMessage?.state === 'running') {
        status = 'running'
      } else if (managerMessage?.state === 'done') {
        status = 'blocked'
        error = 'Oracle did not attach an execution session with verified results.'
      } else if (!managerMessage && attempt.status === 'running') {
        // Start over, or trimming the conversation, removed the dispatch.
        // Only a never-linked queued attempt is re-enqueued; others wait for Retry.
        status = 'failed'
        error = DISPATCH_LEFT_ERROR
      } else if (
        !managerMessage &&
        (attempt.status === 'blocked' || attempt.status === 'review')
      ) {
        status = attempt.status
        error = attempt.error
      }
      const latest = this.taskStore.snapshot().tasks.find(({ id }) => id === task.id)
      if (!latest) continue
      task = await this.taskStore.reconcileAttempt({
        revision: latest.revision,
        taskId: latest.id,
        attemptId: attempt.id,
        status,
        sessionRefs,
        ...(error ? { error } : {}),
        ...(status === 'running' && !attempt.startedAt
          ? { startedAt: this.now().toISOString() }
          : {}),
        ...(
          (status === 'failed' || status === 'blocked' || status === 'review') &&
          (!attempt.finishedAt || attempt.status !== status)
            ? { finishedAt: this.now().toISOString() }
            : {}
        ),
      })
    }
  }

  private async withTaskViews(snapshot: DreamerSnapshot): Promise<DreamerSnapshot> {
    if (!snapshot.tasks?.length) return snapshot
    const messages = this.managerMessages?.() ?? []
    const views = await Promise.all(snapshot.tasks.map(async (task): Promise<OracleTaskView> => {
      const attempt = task.attempts.at(-1)
      if (!attempt) return task
      const evidence: OracleTaskEvidence[] = messages
        .filter((message) =>
          message.replyTo === attempt.managerMessageId &&
          message.role === 'activity'
        )
        .map((message) => ({
          id: message.id,
          kind: /\b(test|vitest|jest|pytest|rspec|cargo)\b/i.test(
            `${message.tool ?? ''} ${message.content}`,
          ) ? 'test' : 'tool',
          label: message.tool ?? 'Oracle activity',
          status: 'completed',
          result: boundedText(message.content, 500),
        }))
      let completionCandidate: OracleTaskCompletionCandidate | undefined
      if (this.readSession) {
        for (const reference of attempt.sessionRefs) {
          try {
            const session = await this.readSession(
              reference.computerId,
              reference.sessionId,
            )
            const promptTurn = this.oraclePromptTurn(session, attempt)
            for (const message of promptTurn
              ? session.messages.slice(promptTurn.promptIndex + 1, promptTurn.endIndex)
              : []) {
              if (message.role === 'activity') {
                evidence.push({
                  id: `${reference.computerId}:${reference.sessionId}:${message.id}`,
                  kind: /\b(test|vitest|jest|pytest|rspec|cargo)\b/i.test(
                    message.content,
                  ) ? 'test' : 'tool',
                  label: message.content,
                  status: message.activityStatus === 'failed'
                    ? 'failed'
                    : message.activityStatus === 'running' ||
                        message.activityStatus === 'pending'
                      ? 'running'
                      : 'completed',
                  ...(message.activityResult
                    ? { result: boundedText(message.activityResult, 500) }
                    : {}),
                  ...(message.activityDurationMs === undefined
                    ? {}
                    : { durationMs: message.activityDurationMs }),
                })
              }
            }
            completionCandidate ??= this.oracleCompletionCandidate(
              session,
              attempt,
            )
          } catch {
            // Reconciliation exposes the unavailable session as a blocked reason.
          }
        }
      }
      if (completionCandidate) {
        evidence.push({
          id: `${completionCandidate.sessionId}:${completionCandidate.messageId}`,
          kind: 'completion',
          label: 'Verified task completion',
          status: 'completed',
          result: completionCandidate.summary,
        })
      }
      return {
        ...task,
        ...(evidence.length ? { evidence: evidence.slice(-12) } : {}),
        ...(completionCandidate ? { completionCandidate } : {}),
        ...(attempt.error && task.status !== 'completed'
          ? { blockedReason: attempt.error }
          : {}),
      }
    }))
    return { ...snapshot, tasks: views }
  }

  private oraclePromptTurn(
    session: ManagedSession,
    attempt: OracleTaskAttempt,
  ): { promptIndex: number; endIndex: number } | undefined {
    const promptReference = attempt.sessionRefs.find(
      (reference) =>
        reference.computerId === session.computerId &&
        reference.sessionId === session.id,
    )
    if (!promptReference?.promptId) return undefined
    let promptIndex = session.messages.findIndex(
      (message) =>
        message.id === promptReference.promptId &&
        message.role === 'user',
    )
    if (
      promptIndex < 0 &&
      promptReference.promptDigest &&
      promptReference.promptQueuePosition
    ) {
      const anchorIndex = promptReference.promptAnchorId
        ? session.messages.findIndex(
            (message) =>
              message.id === promptReference.promptAnchorId &&
              message.role === 'user',
          )
        : -1
      if (promptReference.promptAnchorId && anchorIndex < 0) return undefined
      const queuedRootIndexes = session.messages
        .map((message, index) => ({ message, index }))
        .filter(({ message, index }) =>
          index > anchorIndex && message.role === 'user')
      const resolved = queuedRootIndexes[
        promptReference.promptQueuePosition - 1
      ]
      if (
        resolved &&
        createHash('sha256')
          .update(resolved.message.content)
          .digest('hex') === promptReference.promptDigest
      ) {
        promptIndex = resolved.index
      }
    }
    if (promptIndex < 0) return undefined
    const nextUserOffset = session.messages.slice(promptIndex + 1).findIndex(
      ({ role }) => role === 'user',
    )
    const endIndex = nextUserOffset < 0
      ? session.messages.length
      : promptIndex + 1 + nextUserOffset
    return { promptIndex, endIndex }
  }

  private oracleCompletionCandidate(
    session: ManagedSession,
    attempt: OracleTaskAttempt,
    messageId?: string,
  ): OracleTaskCompletionCandidate | undefined {
    const promptTurn = this.oraclePromptTurn(session, attempt)
    if (!promptTurn) return undefined
    const { promptIndex, endIndex } = promptTurn
    const candidateIndex = messageId
      ? session.messages.findIndex(
          (message, index) =>
            index > promptIndex &&
            index < endIndex &&
            message.id === messageId,
        )
      : session.messages.findLastIndex(
          (message, index) =>
            index > promptIndex &&
            index < endIndex &&
            message.taskCompletion?.source === 'root-task-complete',
        )
    if (candidateIndex < 0) return undefined
    const candidate = this.completionCandidateFromSession(
      {
        ...session,
        messages: session.messages.slice(promptIndex, endIndex),
      },
      session.computerId,
      session.id,
      session.messages[candidateIndex]!.id,
    )
    if (!candidate) return undefined
    return { ...candidate, attemptId: attempt.id }
  }

  private async reconcileStaleMemory(): Promise<void> {
    if (this.memoryReconciliation) return this.memoryReconciliation
    const operation = this.reconcileStaleMemoryInternal()
    this.memoryReconciliation = operation
    operation.finally(() => {
      if (this.memoryReconciliation === operation) this.memoryReconciliation = undefined
    }).catch(() => undefined)
    return operation
  }

  private async reconcileStaleMemoryInternal(): Promise<void> {
    const current = this.store.snapshot()
    if (!current.plan) return
    const memory = this.captureMemory()
    if (!memory || memory.mode !== 'on' || !memory.available) return
    const activeIds = activeDreamerMemoryIds(memory, this.now())
    await this.store.reconcileMemory(activeIds)
  }

  private isCurrent(lifecycle: number, claim: DreamerRunClaim): boolean {
    if (!this.started || lifecycle !== this.lifecycleGeneration) return false
    const current = this.store.snapshot()
    return current.settings.enabled &&
      current.settings.generation === claim.generation &&
      current.settings.timeZone === claim.timeZone
  }

  private startTimer(): void {
    if (this.timer || !this.started) return
    this.timer = this.setIntervalImpl(() => {
      void this.runIfDue().catch((error: unknown) => {
        this.markScheduledFailure(error)
      })
    }, 30_000)
    const unref = (this.timer as unknown as { unref?: () => void }).unref
    unref?.call(this.timer)
  }

  private stopTimer(): void {
    if (!this.timer) return
    this.clearIntervalImpl(this.timer)
    this.timer = undefined
  }

  private startProgress(): void {
    if (!this.progress || this.progressTimer || !this.started || this.runtimeError) return
    const interval = this.progressRefreshMs
    const due = () => new Date(this.now().getTime() + interval).toISOString()
    this.progressTimer = this.setIntervalImpl(() => {
      this.progressDueAt = due()
      void this.refreshProgress()
    }, interval)
    const unref = (this.progressTimer as unknown as { unref?: () => void }).unref
    unref?.call(this.progressTimer)
    this.progressDueAt = due()
    void this.refreshProgress()
  }

  /** Forgets all progress; a refresh still running publishes nothing. */
  private stopProgress(): void {
    this.progressGeneration += 1
    this.progressRun = undefined
    this.progressDueAt = undefined
    this.progressError = undefined
    this.progress?.clear()
    if (!this.progressTimer) return
    this.clearIntervalImpl(this.progressTimer)
    this.progressTimer = undefined
  }

  private async runProgress(progress: DreamerProgress, generation: number): Promise<void> {
    let refreshed: DreamerProgressRefresh | undefined
    try {
      refreshed = await progress.refresh()
    } catch {
      if (generation === this.progressGeneration) this.progressError = PROGRESS_REFRESH_ERROR
    }
    if (generation !== this.progressGeneration) return
    if (refreshed) this.progressError = undefined
    // Task upkeep reads Oracle's messages, not the listing, so it runs even
    // when the listing failed.
    await this.reconcileTasks().catch(() => undefined)
    if (!refreshed || generation !== this.progressGeneration || !this.sweepLifecycle) return
    try {
      await this.sweepLifecycle(refreshed.authoritative, refreshed.computerGenerations)
    } catch {
      // The next refresh sweeps again; the inbox keeps its own cursor.
    }
  }

  private progressStatus(): DreamerProgressStatus | undefined {
    if (!this.progress || !this.progressTimer) return undefined
    const { refreshedAt, staleComputers } = this.progress.snapshot()
    return {
      ...(refreshedAt ? { refreshedAt } : {}),
      ...(this.progressDueAt ? { nextRefreshAt: this.progressDueAt } : {}),
      staleComputers: staleComputers.map(({ name }) => name),
      ...(this.progressError ? { error: this.progressError } : {}),
    }
  }

  private requireAvailable(): void {
    if (!this.initialized) throw new DreamerUnavailableError('Dreamer is not initialized.')
    if (this.runtimeError) throw new DreamerUnavailableError()
    try {
      this.store.snapshot()
    } catch (error) {
      if (error instanceof DreamerRecoveryError || error instanceof DreamerPersistenceError) {
        throw new DreamerUnavailableError()
      }
      throw error
    }
  }

  private safeUnavailableSnapshot(safeError: string): DreamerSnapshot {
    try {
      return unavailableSnapshot(this.store.snapshot(), safeError)
    } catch {
      return unavailableSnapshot(undefined, safeError)
    }
  }

  private handleScheduledFailure(error: unknown): DreamerSnapshot {
    const safeError = error instanceof DreamerCapacityError
      ? error.message
      : error instanceof DreamerPersistenceError || error instanceof DreamerRecoveryError
        ? 'Dreamer storage is unavailable.'
        : 'Dreamer could not complete its morning review.'
    this.markScheduledFailure(error, safeError)
    return this.safeUnavailableSnapshot(safeError)
  }

  private markScheduledFailure(
    _error: unknown,
    safeError = 'Dreamer storage is unavailable.',
  ): void {
    this.runtimeError = safeError
    this.stopTimer()
    this.stopProgress()
  }

  private scheduleAfterActive(
    active: Promise<DreamerSnapshot>,
    lifecycle: number,
  ): void {
    void active.then(
      () => {
        if (this.started && this.lifecycleGeneration === lifecycle && !this.runtimeError) {
          void this.runIfDue().catch((error: unknown) => {
            this.markScheduledFailure(error)
          })
        }
      },
      (error: unknown) => this.markScheduledFailure(error),
    )
  }
}

function uniqueSessionRefs(
  refs: OracleTaskAttempt['sessionRefs'],
): OracleTaskAttempt['sessionRefs'] {
  const positions = new Map<string, number>()
  const unique: OracleTaskAttempt['sessionRefs'] = []
  for (const reference of refs) {
    const key = `${reference.computerId}\0${reference.sessionId}`
    const position = positions.get(key)
    if (position === undefined) {
      positions.set(key, unique.length)
      unique.push({ ...reference })
      continue
    }
    const existing = unique[position]!
    unique[position] = {
      ...existing,
      ...(existing.title ? {} : reference.title ? { title: reference.title } : {}),
      ...(reference.promptId ? { promptId: reference.promptId } : {}),
      ...(reference.promptAnchorId
        ? { promptAnchorId: reference.promptAnchorId }
        : {}),
      ...(reference.promptQueuePosition
        ? { promptQueuePosition: reference.promptQueuePosition }
        : {}),
      ...(reference.promptDigest
        ? { promptDigest: reference.promptDigest }
        : {}),
    }
  }
  return unique
}

function boundedText(value: string, maximum: number): string {
  const trimmed = value.trim()
  return trimmed.length > maximum
    ? `${trimmed.slice(0, maximum - 1)}…`
    : trimmed
}
