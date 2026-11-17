import { randomInt, randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { constants } from 'node:fs'
import { chmod, lstat, mkdir, open, readdir, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { validateRecurrence } from '../shared/schedule-recurrence.js'
import {
  scheduleProposalInputSchema, scheduleProposalSchema,
  type ScheduleProposal, type ScheduleProposalInput, type ScheduleProposalsChanged,
} from '../shared/schedule-proposals.js'
import {
  scheduleCreateSchema, scheduleRunSchema, scheduleSchema, scheduleUpdateSchema,
  type Schedule, type ScheduleCreate, type ScheduleRun, type ScheduleRunPage,
  type ScheduleRunStatus, type ScheduleUpdate, type SchedulerChanged,
} from '../shared/schedules.js'

export const SCHEDULE_RUN_LIMIT = 200
const MAX_FILE_BYTES = 64 * 1024 * 1024
const timestamp = z.string().datetime({ offset: true })
const stateSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative(),
  schedules: z.array(scheduleSchema),
  runs: z.array(scheduleRunSchema),
  runSchedules: z.record(z.string(), scheduleSchema),
  cursors: z.record(z.string(), timestamp),
  occurrences: z.record(z.string(), z.string()),
  proposals: z.array(scheduleProposalSchema).max(1000).default([]),
}).strict()
type State = z.infer<typeof stateSchema>
const empty = (): State => ({ version: 1, revision: 0, schedules: [], runs: [], runSchedules: {}, cursors: {}, occurrences: {}, proposals: [] })
const failure = (message: string, statusCode: number) => Object.assign(new Error(message), { statusCode })
export const occurrenceKey = (scheduleId: string, occurrenceAt: string) => JSON.stringify([scheduleId, occurrenceAt])
export const isInFlight = (run: ScheduleRun) =>
  ['pending', 'launching', 'running', 'needs-input', 'stopping'].includes(run.status)
export const holdsSlot = (run: ScheduleRun) => isInFlight(run) && run.status !== 'pending'

function deferUnboundWorktree(run: ScheduleRun): void {
  if (isInFlight(run) || run.sessionId || !run.worktree ||
      run.worktree.state === 'removed' || run.worktree.state === 'deferred') return
  run.worktree = {
    ...run.worktree, state: 'deferred',
    reason: 'No session was confirmed for this worktree; cleanup requires manual review',
  }
}

/** One hub writer; the occurrence fence, intent, and launch identity commit together. */
export class SchedulerStore extends EventEmitter<{ changed: [event: SchedulerChanged]; proposal: [event: ScheduleProposalsChanged] }> {
  readonly directory: string
  readonly statePath: string
  private state = empty()
  private work: Promise<unknown> = Promise.resolve()
  private loading?: Promise<void>
  private initialized = false
  private loadedProposalStatuses = new Map<string, ScheduleProposal['status']>()
  private poisoned = false
  private directoryIdentity?: { dev: number; ino: number }

  constructor(
    dataDirectory: string,
    private readonly options: { now?: () => number; warn?: (message: string) => void } = {},
  ) {
    super()
    this.directory = path.join(dataDirectory, 'scheduler')
    this.statePath = path.join(this.directory, 'state.json')
  }

  initialize(): Promise<void> { return this.loading ??= this.load() }
  private now(): string { return new Date((this.options.now ?? Date.now)()).toISOString() }

  private owner(info: { uid: number }): void {
    if (process.getuid && info.uid !== process.getuid()) throw new Error('Scheduler storage has a different owner')
  }

  private async load(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const directory = await lstat(this.directory)
    this.owner(directory)
    if (!directory.isDirectory()) throw new Error('Scheduler directory must be a real directory')
    await chmod(this.directory, 0o700)
    this.directoryIdentity = { dev: directory.dev, ino: directory.ino }
    let raw: string | undefined
    try {
      const handle = await open(this.statePath, constants.O_RDONLY | constants.O_NOFOLLOW)
      try {
        const info = await handle.stat()
        this.owner(info)
        if (!info.isFile()) throw new Error('Invalid scheduler state file')
        await handle.chmod(0o600)
        raw = info.size > MAX_FILE_BYTES ? '' : await handle.readFile('utf8')
      } finally { await handle.close() }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
    if (raw !== undefined) {
      try {
        const next = stateSchema.parse(JSON.parse(raw))
        this.validateState(next)
        next.runs.forEach(deferUnboundWorktree)
        this.state = next
      } catch {
        await rename(this.statePath, `${this.statePath}.corrupt-${randomUUID()}`)
        ;(this.options.warn ?? console.warn)('Corrupt scheduler state quarantined; starting with an empty scheduler')
      }
    }
    for (const name of await readdir(this.directory)) {
      if (!/^state\.[a-f0-9-]{36}\.pending$/.test(name)) continue
      const staging = path.join(this.directory, name)
      const info = await lstat(staging)
      this.owner(info)
      if (!info.isFile()) throw new Error('Invalid scheduler staging file')
      await unlink(staging)
    }
    await this.persist(this.state)
    this.loadedProposalStatuses = new Map(this.state.proposals.map((proposal) => [proposal.id, proposal.status]))
    this.initialized = true
  }

  private validateState(next: State): void {
    const ids = new Set(next.schedules.map((schedule) => schedule.id))
    const names = next.schedules.filter((schedule) => !schedule.archived).map((schedule) => schedule.name.toLowerCase())
    const launches = new Set(next.runs.map((run) => run.launchId))
    const counts = new Map<string, number>()
    for (const run of next.runs) counts.set(run.scheduleId, (counts.get(run.scheduleId) ?? 0) + 1)
    if (ids.size !== next.schedules.length || new Set(names).size !== names.length ||
        new Set(next.runs.map((run) => run.id)).size !== next.runs.length || launches.size !== next.runs.length ||
        Object.keys(next.runSchedules).length !== next.runs.length ||
        new Set(Object.values(next.occurrences)).size !== Object.keys(next.occurrences).length ||
        [...counts.values()].some((count) => count > SCHEDULE_RUN_LIMIT) ||
        next.schedules.some((schedule) => !Object.hasOwn(next.cursors, schedule.id)) ||
        Object.keys(next.cursors).some((id) => !ids.has(id)) ||
        next.runs.some((run) => !ids.has(run.scheduleId) || next.runSchedules[run.id]?.id !== run.scheduleId ||
          next.runSchedules[run.id]?.target.computerId !== run.computerId ||
          next.occurrences[occurrenceKey(run.scheduleId, run.occurrenceAt)] !== run.id)) {
      throw new Error('Invalid scheduler identities')
    }
    for (const key of Object.keys(next.occurrences)) {
      const pair: unknown = JSON.parse(key)
      if (!Array.isArray(pair) || pair.length !== 2 || !ids.has(pair[0]) ||
          typeof pair[1] !== 'string' || !Number.isFinite(Date.parse(pair[1]))) throw new Error('Invalid occurrence key')
    }
  }

  private checkName(next: State, schedule: Schedule): void {
    if (!schedule.archived && next.schedules.some((other) =>
      !other.archived && other.id !== schedule.id && other.name.toLowerCase() === schedule.name.toLowerCase())) {
      throw failure('A non-archived schedule already has this name', 409)
    }
  }

  private checkRecurrence(schedule: Schedule): void {
    const result = validateRecurrence(schedule.recurrence, schedule.timezone, new Date(this.now()))
    if (!result.valid) throw failure(result.errors.join('; '), 400)
  }

  proposals(): ScheduleProposal[] { return structuredClone(this.state.proposals) }
  /** Proposal statuses as read from disk, before this process changed any (e.g. startup expiry). */
  persistedProposalStatuses(): ReadonlyMap<string, ScheduleProposal['status']> { return new Map(this.loadedProposalStatuses) }
  proposal(id: string): ScheduleProposal {
    const proposal = this.state.proposals.find((entry) => entry.id === id)
    if (!proposal) throw failure('Schedule proposal not found', 404)
    return structuredClone(proposal)
  }

  async propose(input: ScheduleProposalInput, allowAll = false): Promise<ScheduleProposal> {
    const parsed = scheduleProposalInputSchema.parse(input)
    return this.commit((next) => {
      if (next.proposals.length >= 1000) {
        const oldest = next.proposals.findIndex((entry) => !['pending', 'approved'].includes(entry.status))
        if (oldest < 0) throw failure('Schedule proposal capacity reached', 409)
        next.proposals.splice(oldest, 1)
      }
      const proposal = scheduleProposalSchema.parse({
        ...parsed, id: randomUUID(), createdBy: 'oracle', createdAt: this.now(),
        expiresAt: new Date(Date.parse(this.now()) + 24 * 60 * 60_000).toISOString(), status: 'pending',
      })
      this.proposalCandidate(next, proposal, allowAll)
      next.proposals.push(proposal)
      return { result: proposal, proposalId: proposal.id }
    })
  }

  /** All approval guards and the schedule mutation share the durable transaction. */
  async approveProposal(id: string, allowAll = false): Promise<ScheduleProposal> {
    const proposal = await this.commit((next) => {
      const proposal = next.proposals.find((entry) => entry.id === id)
      if (!proposal) throw failure('Schedule proposal not found', 404)
      if (['applied', 'approved'].includes(proposal.status)) return { result: proposal, proposalId: id }
      if (proposal.status !== 'pending') throw failure(`Schedule proposal is ${proposal.status}`, proposal.status === 'expired' ? 410 : 409)
      if (Date.parse(proposal.expiresAt) <= Date.parse(this.now())) {
        proposal.status = 'expired'
        return { result: proposal, proposalId: id }
      }
      try {
        const schedule = this.proposalCandidate(next, proposal, allowAll)
        if (proposal.operation === 'run-now') {
          if (schedule.archived) throw failure('Archived schedules cannot run', 409)
          proposal.status = 'approved'
          let occurrenceAt: string
          do {
            occurrenceAt = this.now().replace(/Z$/, `${randomInt(1, 1_000_000_000_000).toString().padStart(12, '0')}Z`)
          } while (next.occurrences[occurrenceKey(schedule.id, occurrenceAt)])
          const admitted = this.admitRun(next, schedule.id, occurrenceAt, 'manual', 'pending',
            undefined, undefined, schedule.revision, proposal.id)
          return { ...admitted, result: proposal }
        } else {
          if (proposal.operation === 'create') {
            next.schedules.push(schedule)
            next.cursors[schedule.id] = this.now()
          } else {
            const previous = this.requireSchedule(next, schedule.id)
            next.schedules[next.schedules.indexOf(previous)] = schedule
            if ((!previous.enabled && schedule.enabled) || (proposal.operation === 'update' &&
                (proposal.payload.recurrence !== undefined || proposal.payload.timezone !== undefined))) {
              next.cursors[schedule.id] = this.now()
            }
          }
          proposal.status = 'applied'
          proposal.appliedScheduleId = schedule.id
        }
        return { result: proposal, proposalId: id, scheduleId: schedule.id }
      } catch (error) {
        proposal.status = 'failed'
        proposal.error = (error as Error).message.slice(0, 2000)
        return { result: proposal, proposalId: id }
      }
    })
    if (proposal.status === 'expired') throw failure('Schedule proposal expired', 410)
    if (proposal.status === 'failed') throw failure(proposal.error ?? 'Schedule proposal failed', 409)
    return proposal
  }

  rejectProposal(id: string): Promise<ScheduleProposal> {
    return this.commit((next) => {
      const proposal = next.proposals.find((entry) => entry.id === id)
      if (!proposal) throw failure('Schedule proposal not found', 404)
      if (proposal.status !== 'pending' && proposal.status !== 'rejected') throw failure(`Schedule proposal is ${proposal.status}`, 409)
      proposal.status = Date.parse(proposal.expiresAt) <= Date.parse(this.now()) ? 'expired' : 'rejected'
      return { result: proposal, proposalId: id }
    })
  }

  failProposal(id: string, error: string): Promise<void> {
    return this.commit((next) => {
      const proposal = next.proposals.find((entry) => entry.id === id)
      if (proposal?.status === 'approved') {
        proposal.status = 'failed'
        proposal.error = error.slice(0, 2000)
      }
      return { result: undefined, proposalId: id }
    })
  }

  async expireProposals(): Promise<void> {
    await this.work
    if (!this.state.proposals.some((proposal) =>
      proposal.status === 'pending' && Date.parse(proposal.expiresAt) <= Date.parse(this.now()))) return
    return this.commit((next) => {
      for (const proposal of next.proposals) {
        if (proposal.status === 'pending' && Date.parse(proposal.expiresAt) <= Date.parse(this.now())) proposal.status = 'expired'
      }
      return { result: undefined, proposalId: '*' }
    })
  }

  private proposalCandidate(next: State, proposal: ScheduleProposal, allowAll: boolean): Schedule {
    let schedule: Schedule
    if (proposal.operation === 'create') {
      schedule = scheduleSchema.parse({
        ...proposal.payload, id: proposal.id, revision: 1, archived: false, createdBy: 'oracle',
        createdAt: this.now(), updatedAt: this.now(),
      })
    } else {
      const previous = this.requireSchedule(next, proposal.scheduleId, proposal.baseRevision)
      const changes = proposal.operation === 'update' ? proposal.payload
        : proposal.operation === 'enable' ? { enabled: true }
          : proposal.operation === 'disable' ? { enabled: false }
            : proposal.operation === 'archive' ? { archived: true, enabled: false } : {}
      schedule = scheduleSchema.parse({
        ...previous, ...changes,
        revision: previous.revision + (proposal.operation === 'run-now' ? 0 : 1), updatedAt: this.now(),
      })
    }
    if (schedule.archived && schedule.enabled) throw failure('An archived schedule cannot be enabled', 409)
    if (schedule.target.permissionPolicy === 'allow-all' && !allowAll &&
        proposal.operation !== 'disable' && proposal.operation !== 'archive') {
      throw failure('The hub does not permit allow-all for Oracle schedules', 403)
    }
    if (proposal.operation === 'create' || (proposal.operation === 'update' &&
        (proposal.payload.recurrence !== undefined || proposal.payload.timezone !== undefined)) ||
        (schedule.recurrence.type !== 'once' && ['enable', 'run-now'].includes(proposal.operation))) {
      this.checkRecurrence(schedule)
    }
    const activeOthers = next.schedules.filter((entry) =>
      entry.id !== schedule.id && entry.createdBy === 'oracle' && entry.enabled && !entry.archived).length
    if (schedule.createdBy === 'oracle' && schedule.enabled && !schedule.archived && activeOthers >= 20) {
      throw failure('At most 20 active Oracle-created schedules are allowed', 409)
    }
    this.checkName(next, schedule)
    return schedule
  }

  async create(input: ScheduleCreate, createdBy: Schedule['createdBy'] = 'user'): Promise<Schedule> {
    const parsed = scheduleCreateSchema.parse(input)
    return this.commit((next) => {
      const at = this.now()
      const schedule = scheduleSchema.parse({
        ...parsed, id: randomUUID(), revision: 1, archived: false, createdBy, createdAt: at, updatedAt: at,
      })
      this.checkRecurrence(schedule)
      this.checkName(next, schedule)
      next.schedules.push(schedule)
      next.cursors[schedule.id] = at
      return { result: schedule, scheduleId: schedule.id }
    })
  }

  async update(id: string, input: ScheduleUpdate): Promise<Schedule> {
    const { revision, ...changes } = scheduleUpdateSchema.parse(input)
    return this.change(id, revision, changes)
  }

  setArchived(id: string, revision: number, archived: boolean): Promise<Schedule> {
    return this.change(id, revision, { archived, ...(archived ? { enabled: false } : {}) })
  }

  private change(id: string, revision: number, changes: Partial<Schedule>): Promise<Schedule> {
    return this.commit((next) => {
      const previous = this.requireSchedule(next, id, revision)
      const schedule = scheduleSchema.parse({ ...previous, ...changes, revision: revision + 1, updatedAt: this.now() })
      if (schedule.archived && schedule.enabled) throw failure('An archived schedule cannot be enabled', 409)
      if (changes.recurrence !== undefined || changes.timezone !== undefined) this.checkRecurrence(schedule)
      this.checkName(next, schedule)
      if (changes.recurrence !== undefined || changes.timezone !== undefined || (!previous.enabled && schedule.enabled)) {
        next.cursors[id] = this.now()
      }
      next.schedules[next.schedules.indexOf(previous)] = schedule
      return { result: schedule, scheduleId: id }
    })
  }

  delete(id: string, revision: number): Promise<void> {
    return this.commit((next) => {
      const schedule = this.requireSchedule(next, id, revision)
      if (!schedule.archived) throw failure('Archive the schedule before deleting it', 409)
      if (next.runs.some((run) => run.scheduleId === id && isInFlight(run))) throw failure('Schedule still has in-flight runs', 409)
      next.schedules = next.schedules.filter((entry) => entry.id !== id)
      for (const run of next.runs.filter((entry) => entry.scheduleId === id)) delete next.runSchedules[run.id]
      next.runs = next.runs.filter((entry) => entry.scheduleId !== id)
      delete next.cursors[id]
      for (const key of Object.keys(next.occurrences)) {
        if (JSON.parse(key)[0] === id) delete next.occurrences[key]
      }
      return { result: undefined, scheduleId: id }
    })
  }

  private requireSchedule(next: State, id: string, revision?: number): Schedule {
    const schedule = next.schedules.find((entry) => entry.id === id)
    if (!schedule) throw failure('Schedule not found', 404)
    if (revision !== undefined && schedule.revision !== revision) throw failure('Schedule revision conflict', 409)
    return schedule
  }

  list(archived?: boolean): Schedule[] {
    return structuredClone(this.state.schedules.filter((schedule) => archived === undefined || schedule.archived === archived))
  }
  get(id: string): Schedule { return structuredClone(this.requireSchedule(this.state, id)) }
  cursor(id: string): string { this.get(id); return this.state.cursors[id] }
  allRuns(): ScheduleRun[] { return structuredClone(this.state.runs) }
  hasOccurrence(scheduleId: string, occurrenceAt: string): boolean {
    return Object.hasOwn(this.state.occurrences, occurrenceKey(scheduleId, occurrenceAt))
  }
  scheduleForRun(id: string): Schedule { this.getRun(id); return structuredClone(this.state.runSchedules[id]) }
  getRun(id: string): ScheduleRun {
    const run = this.state.runs.find((entry) => entry.id === id)
    if (!run) throw failure('Schedule run not found', 404)
    return structuredClone(run)
  }
  listRuns(page: ScheduleRunPage, scheduleId?: string): { runs: ScheduleRun[]; total: number; nextOffset: number | null } {
    if (scheduleId) this.get(scheduleId)
    const runs = this.allRuns().filter((run) => (!scheduleId || run.scheduleId === scheduleId) &&
      (!page.status || run.status === page.status)).reverse()
    return {
      runs: runs.slice(page.offset, page.offset + page.limit), total: runs.length,
      nextOffset: page.offset + page.limit < runs.length ? page.offset + page.limit : null,
    }
  }

  /** Advances the due cursor in the same commit as the last admitted occurrence. */
  admit(
    scheduleId: string, occurrenceAt: string, trigger: ScheduleRun['trigger'],
    status: ScheduleRunStatus = 'pending', cursor?: string, error?: string, expectedRevision?: number, proposalId?: string,
  ): Promise<ScheduleRun | undefined> {
    return this.commit((next) => this.admitRun(next, scheduleId, occurrenceAt, trigger, status,
      cursor, error, expectedRevision, proposalId))
  }

  private admitRun(
    next: State, scheduleId: string, occurrenceAt: string, trigger: ScheduleRun['trigger'],
    status: ScheduleRunStatus, cursor?: string, error?: string, expectedRevision?: number, proposalId?: string,
  ) {
      const schedule = this.requireSchedule(next, scheduleId, expectedRevision)
      const proposal = proposalId ? next.proposals.find((entry) => entry.id === proposalId) : undefined
      if (proposalId && (!proposal || proposal.operation !== 'run-now' || proposal.scheduleId !== scheduleId ||
          proposal.baseRevision !== schedule.revision || proposal.status !== 'approved')) {
        throw failure('Schedule proposal does not authorize this run', 409)
      }
      if (schedule.archived || (trigger !== 'manual' && !schedule.enabled)) {
        throw failure('Schedule is no longer eligible for dispatch', 409)
      }
      if (trigger !== 'manual') occurrenceAt = new Date(occurrenceAt).toISOString()
      const key = occurrenceKey(scheduleId, occurrenceAt)
      const existing = next.occurrences[key]
      if (cursor && Date.parse(cursor) > Date.parse(next.cursors[scheduleId])) next.cursors[scheduleId] = cursor
      if (existing) return { result: next.runs.find((run) => run.id === existing), scheduleId }
      const retained = next.runs.filter((run) => run.scheduleId === scheduleId)
      if (retained.length >= SCHEDULE_RUN_LIMIT) {
        const oldest = retained.find((run) => !isInFlight(run))
        if (!oldest) throw failure('Schedule run capacity reached; resolve in-flight runs first', 409)
        next.runs.splice(next.runs.indexOf(oldest), 1)
        delete next.runSchedules[oldest.id]
      }
      const run = scheduleRunSchema.parse({
        id: randomUUID(), scheduleId, occurrenceAt, trigger, status,
        launchId: randomUUID(), computerId: schedule.target.computerId, createdAt: this.now(),
        ...(!['pending', 'launching', 'running', 'needs-input', 'stopping'].includes(status) ? { endedAt: this.now() } : {}),
        ...(error ? { error } : {}),
      })
      next.runs.push(run)
      next.runSchedules[run.id] = structuredClone(schedule)
      next.occurrences[key] = run.id
      if (proposal) {
        proposal.status = 'applied'
        proposal.appliedRunId = run.id
        proposal.appliedScheduleId = scheduleId
      }
      return { result: run, scheduleId, runId: run.id, proposalId }
  }

  advanceCursor(id: string, cursor: string): Promise<void> {
    return this.commit((next) => {
      this.requireSchedule(next, id)
      if (Date.parse(cursor) > Date.parse(next.cursors[id])) next.cursors[id] = cursor
      return { result: undefined, scheduleId: id }
    })
  }

  changeRun(id: string, changes: Partial<Omit<ScheduleRun, 'id' | 'scheduleId' | 'launchId' | 'occurrenceAt'>>): Promise<ScheduleRun> {
    return this.commit((next) => {
      const position = next.runs.findIndex((run) => run.id === id)
      if (position < 0) throw failure('Schedule run not found', 404)
      const run = scheduleRunSchema.parse({ ...next.runs[position], ...changes })
      next.runs[position] = run
      return { result: run, scheduleId: run.scheduleId, runId: id }
    })
  }

  applyOverlap(id: string): Promise<ScheduleRun[]> {
    return this.commit((next) => {
      const position = next.runs.findIndex((run) => run.id === id)
      if (position < 0) throw failure('Schedule run not found', 404)
      const run = next.runs[position]
      const stopping: ScheduleRun[] = []
      // Overlap can update several runs; invalidate the whole schedule.
      const change = { result: stopping, scheduleId: run.scheduleId }
      if (run.status !== 'pending') return change
      const previous = next.runs.slice(0, position).filter((other) =>
        other.scheduleId === run.scheduleId && isInFlight(other))
      if (!previous.length) return change
      const policy = next.runSchedules[id].overlap
      const endedAt = this.now()
      if (policy === 'skip') {
        next.runs[position] = scheduleRunSchema.parse({
          ...run, status: 'missed', endedAt, error: 'Skipped because another run is in flight',
        })
      } else if (policy === 'replace') {
        const schedule = next.schedules.find((entry) => entry.id === run.scheduleId)
        // Archive/disable and replacement stop intent share one commit ordering.
        // Same eligibility as admission: a manual run of a disabled schedule may still replace.
        if (!schedule || schedule.archived || (run.trigger !== 'manual' && !schedule.enabled)) {
          const reason = !schedule ? 'deleted' : schedule.archived ? 'archived' : 'disabled'
          next.runs[position] = scheduleRunSchema.parse({
            ...run, status: 'stopped', endedAt, error: `Schedule was ${reason} before replacement overlap`,
          })
          return change
        }
        for (const other of previous) {
          const updated = scheduleRunSchema.parse({
            ...other, status: other.status === 'pending' ? 'stopped' : 'stopping',
            ...(other.status === 'pending' ? { endedAt } : {}),
          })
          next.runs[next.runs.indexOf(other)] = updated
          if (updated.status === 'stopping') stopping.push(updated)
        }
      }
      return change
    })
  }

  beginLaunch(id: string, startedAt: string): Promise<ScheduleRun> {
    return this.commit((next) => {
      const position = next.runs.findIndex((run) => run.id === id)
      if (position < 0) throw failure('Schedule run not found', 404)
      const previous = next.runs[position]
      const schedule = this.requireSchedule(next, previous.scheduleId)
      // Disabling affects new recurrence admission, not already accepted or manual work.
      // Archive and this launch boundary share the same commit queue.
      const run = previous.status !== 'pending' ? previous : scheduleRunSchema.parse({
        ...previous,
        ...(schedule.archived
          ? { status: 'stopped', endedAt: startedAt, error: 'Schedule was archived before launch' }
          : { status: 'launching', startedAt, error: undefined, retryUntil: undefined }),
      })
      next.runs[position] = run
      return { result: run, scheduleId: run.scheduleId, runId: id }
    })
  }

  async flush(): Promise<void> { await this.work }

  private commit<T>(mutate: (next: State) => { result: T; scheduleId?: string; runId?: string; proposalId?: string }): Promise<T> {
    const task = this.work.then(async () => {
      if (!this.initialized) throw new Error('Scheduler store is not initialized')
      if (this.poisoned) throw new Error('Scheduler commit outcome is uncertain; restart to reload durable state')
      const next = structuredClone(this.state)
      const { result, scheduleId, runId, proposalId } = mutate(next)
      next.runs.forEach(deferUnboundWorktree)
      if (JSON.stringify(next) !== JSON.stringify(this.state)) {
        const visible = JSON.stringify([next.schedules, next.runs]) !== JSON.stringify([this.state.schedules, this.state.runs])
        next.revision += 1
        await this.persist(next)
        this.state = next
        if (visible && scheduleId) this.emit('changed', { type: 'schedules.changed', revision: next.revision, scheduleId, ...(runId ? { runId } : {}) })
        if (proposalId) this.emit('proposal', { type: 'schedule-proposals.changed', revision: next.revision, proposalId })
      }
      return structuredClone(result)
    })
    this.work = task.catch(() => undefined)
    return task
  }

  private async persist(state: State): Promise<void> {
    const directory = await lstat(this.directory)
    this.owner(directory)
    if (!directory.isDirectory() || directory.dev !== this.directoryIdentity?.dev ||
        directory.ino !== this.directoryIdentity.ino) throw new Error('Scheduler directory was replaced')
    const serialized = JSON.stringify(state)
    if (Buffer.byteLength(serialized) > MAX_FILE_BYTES) throw new Error('Scheduler storage capacity reached')
    const pending = path.join(this.directory, `state.${randomUUID()}.pending`)
    let replaced = false
    try {
      const handle = await open(pending, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600)
      try {
        await handle.writeFile(serialized)
        await handle.sync()
      } finally { await handle.close() }
      await rename(pending, this.statePath)
      replaced = true
      const handleDirectory = await open(this.directory, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
      try { await handleDirectory.sync() } finally { await handleDirectory.close() }
    } catch (error) {
      if (replaced) this.poisoned = true
      throw error
    } finally {
      await unlink(pending).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error
      })
    }
  }
}
