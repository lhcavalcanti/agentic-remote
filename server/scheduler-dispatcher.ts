import { randomInt } from 'node:crypto'
import { nextOccurrences, occurrencesBetween } from '../shared/schedule-recurrence.js'
import type { Schedule, ScheduleRun, SchedulerChanged } from '../shared/schedules.js'
import { holdsSlot, isInFlight, SCHEDULE_RUN_LIMIT, SchedulerStore } from './scheduler-store.js'

export const SCHEDULER_CONCURRENCY = 2
export const SCHEDULER_LATE_MS = 10 * 60_000
export const SCHEDULER_POLL_MS = 30_000

export interface ScheduleReconciliation {
  /** absent proves no accepted/in-progress launch, not merely a missing session entry or an offline/error response. */
  state: 'absent' | 'unknown' | 'launching' | 'running' | 'needs-input' | 'stopping' | 'terminated'
  sessionId?: string
  rootPromptReceipt?: string
  rootPromptAcceptance?: ScheduleRun['rootPromptAcceptance']
  worktree?: ScheduleRun['worktree']
  /** terminated proves quiescence of foreground, queued, and provider-owned background work. */
  outcome?: 'succeeded' | 'failed' | 'stopped' | 'interrupted'
  summary?: string
  error?: string
}
export interface ScheduleStopAcknowledgement {
  /** stopped proves termination, not merely acceptance of an abort request. */
  outcome: 'stopped' | 'unknown'
  sessionId?: string
}
export interface ScheduleLauncher {
  launch(run: ScheduleRun, schedule: Schedule): Promise<void>
  reconcile(run: ScheduleRun): Promise<ScheduleReconciliation>
  stop(run: ScheduleRun): Promise<ScheduleStopAcknowledgement>
}

/** Only use for a definitive refusal before any launch side effect. Other errors are uncertain. */
export class ScheduleTargetUnavailableError extends Error {}

/** A definitive pre-session refusal, not a lost creation/delivery response. */
export class ScheduleLaunchRefusedError extends Error {}

/** Until a runner is installed, no provider or session is touched. */
export class NoopScheduleLauncher implements ScheduleLauncher {
  async launch(): Promise<void> { throw new ScheduleTargetUnavailableError('Schedule runner is not installed') }
  async reconcile(): Promise<ScheduleReconciliation> { return { state: 'unknown' } }
  async stop(): Promise<ScheduleStopAcknowledgement> { return { outcome: 'unknown' } }
}

export interface SchedulerDispatcherOptions {
  now?: () => number
  targetOnline?: (computerId: string) => boolean
  warn?: (message: string) => void
}

/** Constructed only by the hub, with all decisions serialized before external side effects. */
export class SchedulerDispatcher {
  private active = false
  private closed = false
  private starting?: Promise<void>
  private timer?: ReturnType<typeof setTimeout>
  private work: Promise<unknown> = Promise.resolve()
  private launches = new Map<string, Promise<void>>()
  private readonly changed = (event: SchedulerChanged) => {
    if (!event.runId) this.wake()
  }

  constructor(
    readonly store: SchedulerStore,
    private readonly launcher: ScheduleLauncher,
    private readonly options: SchedulerDispatcherOptions = {},
  ) {}

  private now(): number { return (this.options.now ?? Date.now)() }
  private at(): string { return new Date(this.now()).toISOString() }
  private warn(message: string): void { (this.options.warn ?? console.warn)(message) }

  start(): Promise<void> {
    return this.starting ??= this.exclusive(async () => {
      await this.store.initialize()
      await this.store.expireProposals()
      // Pending intent is reconciled too: no catch-up or fresh launch may run first.
      for (const run of this.store.allRuns().filter(isInFlight)) await this.reconcile(run)
      if (this.closed) return
      // Admission may have committed just before a crash, before overlap policy.
      for (const run of this.store.allRuns().filter((entry) => entry.status === 'pending')) await this.overlap(run)
      this.active = true
      this.store.on('changed', this.changed)
      await this.cycle(false)
      this.planWake()
    })
  }

  async stop(): Promise<void> {
    this.active = false
    this.closed = true
    clearTimeout(this.timer)
    this.store.off('changed', this.changed)
    await this.work
    await this.store.flush()
    // Unsettled external calls remain durably launching/stopping for the next hub.
  }

  /** Also serves deterministic clocks and explicit immediate dispatch requests. */
  tick(): Promise<void> {
    return this.exclusive(async () => {
      if (!this.active) return
      await this.cycle(true)
      this.planWake()
    })
  }

  runNow(scheduleId: string, expectedRevision?: number, proposalId?: string): Promise<ScheduleRun> {
    return this.exclusive(async () => {
      if (proposalId) {
        const proposal = this.store.proposal(proposalId)
        if (proposal.status === 'applied' && proposal.appliedRunId) {
          const run = this.store.getRun(proposal.appliedRunId)
          if (this.active && run.status === 'pending') {
            await this.overlap(run)
            await this.drain()
            this.planWake()
          }
          return this.store.getRun(run.id)
        }
      }
      if (!this.active) throw Object.assign(new Error('Scheduler is not started'), { statusCode: 503 })
      const schedule = this.store.get(scheduleId)
      if (schedule.archived) throw Object.assign(new Error('Archived schedules cannot run'), { statusCode: 409 })
      // Manual triggers have unique sub-millisecond instants, disjoint from the
      // recurrence engine's millisecond-canonical occurrence keys.
      let occurrenceAt: string
      do {
        occurrenceAt = this.at().replace(/Z$/, `${randomInt(1, 1_000_000_000_000).toString().padStart(12, '0')}Z`)
      } while (this.store.hasOccurrence(scheduleId, occurrenceAt))
      const run = (await this.store.admit(scheduleId, occurrenceAt, 'manual', 'pending', undefined, undefined, expectedRevision ?? schedule.revision, proposalId))!
      await this.overlap(run)
      await this.drain()
      this.planWake()
      return this.store.getRun(run.id)
    })
  }

  stopRun(id: string): Promise<ScheduleRun> {
    return this.exclusive(async () => {
      const run = this.store.getRun(id)
      if (isInFlight(run)) await this.requestStop(run)
      if (this.active) {
        await this.drain()
        this.planWake()
      }

      return this.store.getRun(id)
    })
  }

  async abandonRun(id: string): Promise<ScheduleRun> {
    // Must not wait behind an unresolved provider stop/create operation.
    const run = await this.store.abandonRun(id)
    this.wake()
    return run
  }

  private exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const task = this.work.then(operation)
    this.work = task.catch(() => undefined)
    return task
  }

  private async cycle(reconcile: boolean): Promise<void> {
    await this.store.expireProposals()
    if (reconcile) {
      for (const run of this.store.allRuns().filter(isInFlight)) {
        if (run.status !== 'pending') await this.reconcile(run)
      }
    }
    for (const run of this.store.allRuns().filter(holdsSlot)) {
      const schedule = this.store.scheduleForRun(run.id)
      if (run.status === 'stopping' || (run.startedAt &&
          this.now() - Date.parse(run.startedAt) >= schedule.maxRuntimeMin * 60_000)) await this.requestStop(run)
    }
    for (const schedule of this.store.list(false).filter((entry) => entry.enabled)) {
      try { await this.due(schedule) }
      catch { this.warn('Could not admit due occurrences for a schedule; its cursor remains retryable') }
    }
    await this.drain()
  }

  private async due(schedule: Schedule): Promise<void> {
    const now = this.now()
    const cursor = Date.parse(this.store.cursor(schedule.id))
    if (cursor >= now) return // Backward jumps never reopen an evaluated occurrence.
    // History older than the retained tail can be skipped without reopening it:
    // advancing the durable cursor fences it just as pruning old run rows does.
    const tail: Date[] = []
    let after = cursor + 1
    let skipped = 0
    let latestSkipped: Date | undefined
    for (;;) {
      const batch = occurrencesBetween(schedule.recurrence, schedule.timezone, new Date(after), new Date(now + 1), 1000)
      const missed = batch.filter((at) => at.getTime() < now - SCHEDULER_LATE_MS)
      skipped += missed.length
      latestSkipped = missed.at(-1) ?? latestSkipped
      tail.push(...batch)
      if (tail.length > SCHEDULE_RUN_LIMIT) tail.splice(0, tail.length - SCHEDULE_RUN_LIMIT)
      if (batch.length < 1000) break
      after = batch.at(-1)!.getTime() + 1
    }
    if (!tail.length) return
    if (skipped && schedule.catchUp === 'once') {
      const latest = tail.at(-1)!
      const run = await this.store.admit(schedule.id, latest.toISOString(), 'catch-up', 'pending',
        new Date(now).toISOString(), undefined, schedule.revision)
      if (run) await this.overlap(run)
    } else {
      if (latestSkipped) {
        await this.store.admit(schedule.id, latestSkipped.toISOString(), 'schedule', 'missed', latestSkipped.toISOString(),
          `Skipped ${skipped} overdue occurrence${skipped === 1 ? '' : 's'} more than ten minutes late`, schedule.revision)
      }
      for (const at of tail.filter((entry) => entry.getTime() >= now - SCHEDULER_LATE_MS)) {
        const run = await this.store.admit(schedule.id, at.toISOString(), 'schedule', 'pending',
          at.toISOString(), undefined, schedule.revision)
        if (run) await this.overlap(run)
      }
    }
    await this.store.advanceCursor(schedule.id, new Date(now).toISOString())
  }

  private async overlap(run: ScheduleRun): Promise<void> {
    for (const other of await this.store.applyOverlap(run.id)) await this.requestStop(other)
  }

  private async drain(): Promise<void> {
    for (const candidate of this.store.allRuns().filter((run) => run.status === 'pending')) {
      if (!this.active) return
      const run = this.store.getRun(candidate.id)
      if (run.status !== 'pending') continue
      if (this.store.get(run.scheduleId).archived) {
        await this.finish(run, 'stopped', 'Schedule was archived before launch')
        continue
      }
      const schedule = this.store.scheduleForRun(run.id)
      if (run.retryUntil && this.now() > Date.parse(run.retryUntil)) {
        await this.finish(run, 'missed', run.error ?? 'Target did not return before the launch deadline')
        continue
      }
      if (this.options.targetOnline?.(run.computerId) === false) {
        await this.unavailable(run, 'Target computer is offline')
        continue
      }
      const runs = this.store.allRuns()
      const position = runs.findIndex((entry) => entry.id === run.id)
      // Persisted admission order stays FIFO across target edits and restart,
      // even when an earlier pending run does not hold a concurrency slot.
      if (runs.filter(holdsSlot).length >= SCHEDULER_CONCURRENCY ||
          runs.some((other, index) => other.id !== run.id && other.scheduleId === run.scheduleId &&
            (holdsSlot(other) || (other.status === 'pending' && index < position)))) continue
      const launching = await this.store.beginLaunch(run.id, this.at())
      if (launching.status !== 'launching') continue
      // The write above is the uncertainty boundary. Never call launch twice
      // after it, except for an explicit definitive, side-effect-free refusal.
      const operation = Promise.resolve().then(() => this.launcher.launch(launching, schedule))
        .then(() => this.afterLaunch(run.id), (error: unknown) => this.afterLaunch(run.id, error))
        .catch(() => this.warn('Could not settle a scheduler launch; it remains reserved for reconciliation'))
        .finally(() => this.launches.delete(run.id))
      this.launches.set(run.id, operation)
    }
  }

  private async afterLaunch(id: string, error?: unknown): Promise<void> {
    await this.exclusive(async () => {
      if (!this.active) return
      if (this.store.isRunAbandoned(id)) return
      const run = this.store.getRun(id)
      if (!isInFlight(run)) return
      if (error instanceof ScheduleLaunchRefusedError) {
        await this.finish(run, run.status === 'stopping' ? 'stopped' : 'failed', error.message)
      } else if (error instanceof ScheduleTargetUnavailableError) {
        if (run.status === 'stopping') await this.finish(run, 'stopped')
        else await this.unavailable(run, error.message)
      } else {
        await this.reconcile(run)
      }
      this.planWake()
    })
  }

  private async unavailable(run: ScheduleRun, error: string): Promise<void> {
    const deadline = run.trigger === 'schedule' ? run.occurrenceAt : run.createdAt ?? run.occurrenceAt
    if (this.now() - Date.parse(deadline) > SCHEDULER_LATE_MS) await this.finish(run, 'missed', error)
    else if (run.status !== 'pending' || run.error !== error || !run.retryUntil || run.outcomeUnknown) {
      await this.store.changeRun(run.id, {
        status: 'pending', startedAt: undefined, error, outcomeUnknown: undefined,
        retryUntil: new Date(Date.parse(deadline) + SCHEDULER_LATE_MS).toISOString(),
      })
    }
  }

  private async reconcile(run: ScheduleRun): Promise<void> {
    let result: ScheduleReconciliation
    try { result = await this.launcher.reconcile(run) }
    catch { result = { state: 'unknown' } }
    if (this.store.isRunAbandoned(run.id)) return
    const details = {
      outcomeUnknown: result.state === 'unknown' || (run.status === 'stopping' && !['terminated', 'absent'].includes(result.state)) ? true : undefined,
      ...(result.sessionId ? { sessionId: result.sessionId } : {}),
      ...(result.rootPromptReceipt ? { rootPromptReceipt: result.rootPromptReceipt } : {}),
      ...(result.rootPromptAcceptance ? { rootPromptAcceptance: result.rootPromptAcceptance } : {}),
      ...(result.worktree ? { worktree: result.worktree } : {}),
      ...(result.summary !== undefined ? { summary: result.summary } : {}),
      ...(result.error !== undefined ? { error: result.error } : {}),
    }
    if (result.state === 'terminated') {
      await this.store.changeRun(run.id, { ...details, status: result.outcome ?? 'interrupted', endedAt: this.at() })
    } else if (result.state === 'absent') {
      if (run.status !== 'pending' && !this.launches.has(run.id)) {
        await this.finish(run, run.status === 'stopping' ? 'stopped' : 'interrupted', 'Owning computer confirms this launch is absent')
      } else if (run.status === 'pending') await this.store.changeRun(run.id, { outcomeUnknown: undefined })
    } else if (run.status === 'stopping') {
      await this.store.changeRun(run.id, details)
    } else if (run.status === 'pending' && result.state === 'unknown' &&
        !run.sessionId && !run.rootPromptReceipt && !result.sessionId && !result.rootPromptReceipt) {
      // Unknown/no-op is not launch evidence. Never-launched intent stays pending
      // and retryable; drain enforces retryUntil and releases it as missed.
      await this.store.changeRun(run.id, details)
    } else {
      await this.store.changeRun(run.id, {
        ...details,
        status: result.state === 'unknown' ? (run.status === 'pending' ? 'launching' : run.status) : result.state,
        ...(!run.startedAt ? { startedAt: run.createdAt ?? this.at() } : {}),
      })
    }
  }

  private async requestStop(run: ScheduleRun): Promise<void> {
    if (run.status === 'pending') {
      await this.finish(run, 'stopped')
      return
    }
    const stopping = run.status === 'stopping' ? run : await this.store.changeRun(run.id, { status: 'stopping', outcomeUnknown: true })
    if (this.launches.has(run.id) && !stopping.sessionId) return
    let ack: ScheduleStopAcknowledgement
    try { ack = await this.launcher.stop(stopping) }
    catch { ack = { outcome: 'unknown' } }
    if (this.store.isRunAbandoned(run.id)) return
    if (ack.outcome === 'stopped' && (!ack.sessionId || !stopping.sessionId || ack.sessionId === stopping.sessionId)) {
      await this.finish(stopping, 'stopped')
    } else await this.store.changeRun(run.id, { outcomeUnknown: true })
  }

  private async finish(run: ScheduleRun, status: ScheduleRun['status'], error?: string): Promise<void> {
    await this.store.changeRun(run.id, { status, endedAt: this.at(), outcomeUnknown: undefined, ...(error ? { error } : {}) })
  }

  private wake(): void {
    if (!this.active) return
    clearTimeout(this.timer)
    this.timer = setTimeout(() => { void this.tick().catch(() => this.retry()) }, 0)
    this.timer.unref?.()
  }

  private retry(): void {
    this.warn('Scheduler dispatch failed; durable state will be retried')
    if (this.active) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => { void this.tick().catch(() => this.retry()) }, SCHEDULER_POLL_MS)
      this.timer.unref?.()
    }
  }

  private planWake(): void {
    if (!this.active) return
    clearTimeout(this.timer)
    const now = this.now()
    let due = now + SCHEDULER_POLL_MS
    for (const schedule of this.store.list(false).filter((entry) => entry.enabled)) {
      const next = nextOccurrences(schedule.recurrence, schedule.timezone,
        new Date(Math.max(now, Date.parse(this.store.cursor(schedule.id)))), 1)[0]
      if (next) due = Math.min(due, next.getTime())
    }
    this.timer = setTimeout(() => { void this.tick().catch(() => this.retry()) }, Math.max(1, due - now))
    this.timer.unref?.()
  }
}
