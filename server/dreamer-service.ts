import { createHash } from 'node:crypto'
import {
  hasDreamerSessionIdentity,
  isDreamerSessionItem,
  type DreamerCompletionCandidate,
  type DreamerPlan,
  type DreamerSettings,
  type DreamerSnapshot,
  type DreamerTaskCompletionProvenance,
} from '../shared/dreamer.js'
import type { ManagedSession } from '../shared/contracts.js'
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
} from './dreamer-store.js'
import {
  dreamerScheduleDecision,
  validateDreamerTimeZone,
} from './dreamer-schedule.js'

export interface DreamerPlannerExecutionInput extends DreamerPlannerInput {
  defaultPlan: DreamerPlanDraft
}

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
  private initialized = false
  private initializing?: Promise<void>
  private started = false
  private timer?: ReturnType<typeof setInterval>
  private lifecycleGeneration = 0
  private activeRun?: Promise<DreamerSnapshot>
  private activeCommit?: Promise<void>
  private memoryReconciliation?: Promise<void>
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
  }

  initialize(): Promise<void> {
    if (this.initialized) return Promise.resolve()
    if (this.initializing) return this.initializing
    const operation = this.store.initialize().then(() => {
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
    const snapshot = this.store.snapshot()
    if (!snapshot.settings.enabled) return
    this.startTimer()
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
    const commit = this.activeCommit
    if (commit) await commit.catch(() => undefined)
  }

  snapshot(): DreamerSnapshot {
    this.requireAvailable()
    return publicSnapshot(this.store.snapshot(), this.now())
  }

  async snapshotForApi(): Promise<DreamerSnapshot> {
    await this.initialize()
    this.requireAvailable()
    await this.reconcileStaleMemory()
    return this.withCompletionCandidates(this.snapshot())
  }

  getSnapshot(): DreamerSnapshot {
    return this.snapshot()
  }

  timerActive(): boolean {
    return this.timer !== undefined
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
    const after = this.store.snapshot()
    if (!settings.enabled) {
      this.lifecycleGeneration += 1
      this.stopTimer()
      return publicSnapshot(after, this.now())
    }
    if (before.settings.timeZone !== settings.timeZone) {
      this.lifecycleGeneration += 1
    }
    this.started = true
    this.startTimer()
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

  async editPlan(
    input: {
      revision: number
      planId: string
      order?: string[]
      item?: { id: string; status: 'pending' | 'skipped' | 'done' }
      completion?: {
        itemId: string
        messageId: string
        resultDigest: string
      }
    },
  ): Promise<DreamerSnapshot> {
    await this.initialize()
    this.requireAvailable()
    await this.reconcileStaleMemory()
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
        && item.completion.messageId === edit.completion.messageId
        && item.completion.resultDigest === edit.completion.resultDigest
      ) {
        return this.withCompletionCandidates(this.snapshot())
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
      completion = {
        itemId: item.id,
        provenance: item.completion
          && item.completion.computerId === candidate.computerId
          && item.completion.sessionId === candidate.sessionId
          && item.completion.messageId === candidate.messageId
          && item.completion.toolCallId === candidate.toolCallId
          && item.completion.resultDigest === candidate.resultDigest
          && item.completion.completedAt === candidate.completedAt
          ? item.completion
          : {
          computerId: candidate.computerId,
          sessionId: candidate.sessionId,
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
      const item = current.plan?.items.find(({ id }) => id === edit.item!.id)
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
    }
    await this.store.editPlan(edit.revision, edit.planId, {
      ...(edit.order ? { order: edit.order } : {}),
      ...(edit.item ? { item: edit.item } : {}),
      ...(activeMemoryIds ? { activeMemoryIds } : {}),
      ...(completion ? { completion } : {}),
    })
    return this.withCompletionCandidates(this.snapshot())
  }

  private async withCompletionCandidates(snapshot: DreamerSnapshot): Promise<DreamerSnapshot> {
    if (!snapshot.plan || !this.readSession) return snapshot
    const items = await Promise.all(snapshot.plan.items.map(async (item) => {
      if (
        item.status !== 'pending'
        || !hasDreamerSessionIdentity(item)
      ) return item
      try {
        const candidate = await this.completionCandidate(item.computerId, item.sessionId)
        return candidate ? { ...item, completionCandidate: candidate } : item
      } catch {
        return { ...item, completionSourceUnavailable: true }
      }
    }))
    return { ...snapshot, plan: { ...snapshot.plan, items } }
  }

  private async completionCandidate(
    computerId: string,
    sessionId: string,
    messageId?: string,
  ): Promise<DreamerCompletionCandidate | undefined> {
    if (!this.readSession) return undefined
    const session = await this.readSession(computerId, sessionId)
    const message = messageId
      ? session?.messages.find((candidate) => candidate.id === messageId)
      : session?.messages.findLast((candidate) => candidate.taskCompletion !== undefined)
    if (
      !message
      || message.role !== 'assistant'
      || message.taskCompletion?.source !== 'root-task-complete'
      || !message.content.trim()
    ) return undefined
    return {
      computerId,
      sessionId,
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
