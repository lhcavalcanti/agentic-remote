import { randomUUID } from 'node:crypto'
import { chmod, lstat, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScheduleCreate, ScheduleRun } from '../shared/schedules.js'
import {
  NoopScheduleLauncher, SchedulerDispatcher, ScheduleTargetUnavailableError,
  SCHEDULER_LATE_MS, type ScheduleLauncher, type ScheduleReconciliation, type ScheduleStopAcknowledgement,
} from './scheduler-dispatcher.js'
import { holdsSlot, SchedulerStore, SCHEDULE_RUN_LIMIT } from './scheduler-store.js'

const INITIAL = '2026-11-14T08:00:00.000Z'
const directories: string[] = []
const dispatchers: SchedulerDispatcher[] = []
const createInput = (overrides: Partial<ScheduleCreate> = {}): ScheduleCreate => ({
  name: 'Morning review', prompt: 'Review the fictional field guide.',
  target: { computerId: 'studio', folder: '/fictional/project', provider: 'copilot' },
  recurrence: { type: 'hourly', everyHours: 1 }, timezone: 'UTC', ...overrides,
})

async function root(): Promise<string> {
  const directory = path.join(process.cwd(), `.scheduler-test-${randomUUID()}`)
  await mkdir(directory, { mode: 0o700 })
  directories.push(directory)
  return directory
}

class FakeLauncher implements ScheduleLauncher {
  states = new Map<string, ScheduleReconciliation>()
  calls: string[] = []
  launch = vi.fn(async (run: ScheduleRun) => {
    this.calls.push(`launch:${run.id}`)
    this.states.set(run.launchId, { state: 'running', sessionId: `session-${run.id}`, rootPromptReceipt: `root-${run.id}` })
  })
  reconcile = vi.fn(async (run: ScheduleRun): Promise<ScheduleReconciliation> => {
    this.calls.push(`reconcile:${run.id}`)
    return this.states.get(run.launchId) ?? { state: 'absent' }
  })
  stop = vi.fn(async (run: ScheduleRun): Promise<ScheduleStopAcknowledgement> => {
    this.calls.push(`stop:${run.id}`)
    this.states.set(run.launchId, { state: 'terminated', outcome: 'stopped' })
    return { outcome: 'stopped' }
  })
}

async function fixture(options: Parameters<typeof createInput>[0] = {}, online = () => true) {
  const directory = await root()
  const store = new SchedulerStore(directory)
  await store.initialize()
  const schedule = await store.create(createInput(options))
  const launcher = new FakeLauncher()
  const dispatcher = new SchedulerDispatcher(store, launcher, { targetOnline: online })
  dispatchers.push(dispatcher)
  return { directory, store, schedule, launcher, dispatcher }
}

async function settle(dispatcher: SchedulerDispatcher) {
  // Join queued post-launch reconciliation without moving the fake clock.
  await dispatcher.tick()
  await dispatcher.tick()
  await dispatcher.tick()
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
  vi.setSystemTime(new Date(INITIAL))
})
afterEach(async () => {
  await Promise.all(dispatchers.splice(0).map((dispatcher) => dispatcher.stop()))
  vi.useRealTimers()
  vi.restoreAllMocks()
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('scheduler durable store', () => {
  it('defers legacy and archived sessionless worktree allocations before publishing terminal runs', async () => {
    const { store, schedule, directory } = await fixture({ workspace: 'worktree', enabled: false })
    const run = (await store.admit(schedule.id, INITIAL, 'manual'))!
    await store.changeRun(run.id, { worktree: {
      launchId: run.launchId, root: '/fictional/worktrees', repository: '/fictional/project',
      path: '/fictional/worktrees/run-one', createdAt: INITIAL, state: 'ready',
    } })
    await store.setArchived(schedule.id, schedule.revision, true)
    expect(await store.beginLaunch(run.id, INITIAL)).toMatchObject({
      status: 'stopped', worktree: { state: 'deferred', reason: expect.stringContaining('manual') },
    })
    const legacy = JSON.parse(await readFile(store.statePath, 'utf8'))
    legacy.runs[0].worktree.state = 'ready'
    delete legacy.runs[0].worktree.reason
    await writeFile(store.statePath, JSON.stringify(legacy))
    const reopened = new SchedulerStore(directory)
    await reopened.initialize()
    expect(reopened.getRun(run.id)).toMatchObject({
      status: 'stopped', worktree: { state: 'deferred', reason: expect.stringContaining('manual') },
    })
  })

  it('serializes revision checks and case-insensitive names, including unarchive conflicts', async () => {
    const { store, schedule } = await fixture({ overlap: 'queue', timezone: 'Europe/London', enabled: false })
    const results = await Promise.allSettled([
      store.update(schedule.id, { revision: 1, name: 'Renamed' }),
      store.update(schedule.id, { revision: 1, prompt: 'Other prompt' }),
    ])
    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected'])
    expect(results[1]).toMatchObject({ reason: { statusCode: 409 } })
    expect(store.get(schedule.id)).toMatchObject({ revision: 2, overlap: 'queue', enabled: false, timezone: 'Europe/London' })
    await expect(store.create(createInput({ name: 'renamed' }))).rejects.toMatchObject({ statusCode: 409 })
    await store.setArchived(schedule.id, 2, true)
    await store.create(createInput({ name: 'RENAMED' }))
    await expect(store.setArchived(schedule.id, 3, false)).rejects.toMatchObject({ statusCode: 409 })
    await expect(store.update(schedule.id, { revision: 3, enabled: true })).rejects.toMatchObject({ statusCode: 409 })
    expect(store.get(schedule.id)).toMatchObject({ archived: true, revision: 3 })
  })

  it('validates recurrence spacing and bounds without changing caller prompt bytes', async () => {
    const { store, schedule } = await fixture({ prompt: '  Review.\n' })
    expect(schedule.prompt).toBe('  Review.\n')
    for (const changes of [
      { name: 'a'.repeat(201) }, { prompt: 'a'.repeat(20_001) }, { maxRuntimeMin: 4 },
      { maxRuntimeMin: 481 }, { target: { computerId: 'a', folder: '/', provider: 'unknown' } },
    ]) await expect(store.create(createInput(changes as Partial<ScheduleCreate>))).rejects.toThrow()
    await expect(store.create(createInput({ name: 'Too often', recurrence: { type: 'cron', expression: '*/5 * * * *' } })))
      .rejects.toMatchObject({ statusCode: 400 })
    await expect(store.create(createInput({ name: 'Past once', recurrence: { type: 'once', at: INITIAL } })))
      .rejects.toMatchObject({ statusCode: 400 })
  })

  it('retains the newest 200 runs and durable eviction fences across restart', async () => {
    const { store, schedule, directory } = await fixture()
    let first: ScheduleRun | undefined
    for (let index = 0; index < SCHEDULE_RUN_LIMIT + 2; index++) {
      const run = await store.admit(schedule.id, new Date(Date.parse(INITIAL) + index).toISOString(), 'schedule', 'missed')
      first ??= run
    }
    expect(store.allRuns()).toHaveLength(200)
    const restarted = new SchedulerStore(directory)
    await restarted.initialize()
    expect(await restarted.admit(schedule.id, first!.occurrenceAt, 'schedule')).toBeUndefined()
    expect(restarted.allRuns()).toHaveLength(200)
    expect(restarted.listRuns({ offset: 195, limit: 3 }, schedule.id)).toMatchObject({ total: 200, nextOffset: 198 })
    expect(restarted.listRuns({ offset: 198, limit: 3 })).toMatchObject({ total: 200, nextOffset: null })
    expect(restarted.allRuns()[0].occurrenceAt).toBe(new Date(Date.parse(INITIAL) + 2).toISOString())
  })

  it('never evicts a live run or its slot when retention capacity is reached', async () => {
    const { store, schedule } = await fixture()
    for (let index = 0; index < SCHEDULE_RUN_LIMIT; index++) {
      await store.admit(schedule.id, new Date(Date.parse(INITIAL) + index).toISOString(), 'schedule')
    }
    await expect(store.admit(schedule.id, '2026-11-15T00:00:00.000Z', 'schedule'))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(store.allRuns()).toHaveLength(200)
    expect(store.allRuns().every((run) => run.status === 'pending')).toBe(true)
  })

  it('requires archive, revision agreement, and no in-flight runs before deleting', async () => {
    const { store, schedule } = await fixture()
    await expect(store.delete(schedule.id, 1)).rejects.toMatchObject({ statusCode: 409 })
    const run = (await store.admit(schedule.id, INITIAL, 'manual'))!
    await store.setArchived(schedule.id, 1, true)
    await expect(store.delete(schedule.id, 1)).rejects.toMatchObject({ statusCode: 409 })
    await expect(store.delete(schedule.id, 2)).rejects.toMatchObject({ statusCode: 409 })
    await store.changeRun(run.id, { status: 'stopped', endedAt: INITIAL })
    await store.delete(schedule.id, 2)
    expect(store.list()).toEqual([])
    expect(store.allRuns()).toEqual([])
  })

  it('keeps state owner-only, removes stale staging, and quarantines corruption only once', async () => {
    const { store, directory } = await fixture()
    expect((await lstat(store.directory)).mode & 0o777).toBe(0o700)
    expect((await lstat(store.statePath)).mode & 0o777).toBe(0o600)
    await chmod(store.statePath, 0o644)
    await writeFile(store.statePath, '{ broken')
    const staging = path.join(store.directory, `state.${randomUUID()}.pending`)
    await writeFile(staging, 'unfinished', { mode: 0o600 })
    const warn = vi.fn()
    const restarted = new SchedulerStore(directory, { warn })
    await Promise.all([restarted.initialize(), restarted.initialize()])
    expect(restarted.list()).toEqual([])
    expect(warn).toHaveBeenCalledTimes(1)
    const names = await readdir(store.directory)
    expect(names.filter((name) => name.includes('.corrupt-'))).toHaveLength(1)
    expect(names.some((name) => name.endsWith('.pending'))).toBe(false)
    const again = new SchedulerStore(directory, { warn })
    await again.initialize()
    expect(warn).toHaveBeenCalledTimes(1)
    expect((await lstat(again.statePath)).mode & 0o777).toBe(0o600)
  })

  it('quarantines inconsistent occurrence fences rather than trusting a partial state', async () => {
    const { store, schedule, directory } = await fixture()
    await store.admit(schedule.id, INITIAL, 'manual')
    const raw = JSON.parse(await readFile(store.statePath, 'utf8'))
    raw.occurrences = {}
    await writeFile(store.statePath, JSON.stringify(raw))
    const warn = vi.fn()
    const restarted = new SchedulerStore(directory, { warn })
    await restarted.initialize()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(restarted.list()).toEqual([])
  })

  it('refuses symlink state rather than following or overwriting another file', async () => {
    const directory = await root()
    const target = path.join(directory, 'protected.json')
    await writeFile(target, 'protected')
    await mkdir(path.join(directory, 'scheduler'))
    await symlink(target, path.join(directory, 'scheduler', 'state.json'))
    await expect(new SchedulerStore(directory).initialize()).rejects.toThrow()
    expect(await readFile(target, 'utf8')).toBe('protected')
  })

  it('does not publish an occurrence or launch identity after a failed pre-replace write', async () => {
    const { store, schedule, directory } = await fixture()
    const persist = vi.spyOn(store as unknown as { persist(): Promise<void> }, 'persist').mockRejectedValueOnce(new Error('disk full'))
    await expect(store.admit(schedule.id, INITIAL, 'manual')).rejects.toThrow('disk full')
    expect(store.allRuns()).toEqual([])
    persist.mockRestore()
    const restarted = new SchedulerStore(directory)
    await restarted.initialize()
    expect(restarted.allRuns()).toEqual([])
  })
})

describe('hub schedule dispatcher', () => {
  it('lets an archive queued before the launch transition stop a pending drain atomically', async () => {
    let archive: Promise<unknown> | undefined
    const state = await fixture({}, () => {
      archive ??= state.store.setArchived(state.schedule.id, state.schedule.revision, true)
      return true
    })
    await state.dispatcher.start()
    const run = await state.dispatcher.runNow(state.schedule.id)
    await archive
    await settle(state.dispatcher)
    expect(state.store.get(state.schedule.id).archived).toBe(true)
    expect(state.launcher.launch).not.toHaveBeenCalled()
    expect(state.store.getRun(run.id)).toMatchObject({ status: 'stopped' })
  })

  it('still permits manually accepted work on a disabled schedule', async () => {
    const { dispatcher, launcher, store, schedule } = await fixture({ enabled: false })
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('running')
    expect(launcher.launch).toHaveBeenCalledOnce()
  })

  it.each([
    ['2026-03-08T09:00:00.000Z', '02:30', '2026-03-08T10:30:00.000Z'],
    ['2026-11-01T07:00:00.000Z', '01:30', '2026-11-01T08:30:00.000Z'],
  ])('uses the shared DST policy from %s', async (start, time, due) => {
    vi.setSystemTime(new Date(start))
    const { store, dispatcher, launcher } = await fixture({ recurrence: { type: 'daily', time }, timezone: 'America/Los_Angeles' })
    await dispatcher.start()
    vi.setSystemTime(new Date(due))
    await settle(dispatcher)
    expect(store.allRuns()).toHaveLength(1)
    expect(store.allRuns()[0].occurrenceAt).toBe(due)
    expect(launcher.launch).toHaveBeenCalledTimes(1)
    vi.setSystemTime(new Date(Date.parse(due) + 60 * 60_000))
    await settle(dispatcher)
    expect(store.allRuns()).toHaveLength(1)
  })

  it('wakes at the next occurrence and otherwise within thirty seconds', async () => {
    const { dispatcher, launcher, store } = await fixture({
      recurrence: { type: 'once', at: '2026-11-14T08:00:05.000Z' },
    })
    await dispatcher.start()
    await vi.advanceTimersByTimeAsync(4999)
    expect(launcher.launch).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await settle(dispatcher)
    expect(launcher.launch).toHaveBeenCalledTimes(1)
    launcher.reconcile.mockClear()
    await vi.advanceTimersByTimeAsync(30_000)
    await settle(dispatcher)
    expect(launcher.reconcile).toHaveBeenCalled()
    expect(store.allRuns()).toHaveLength(1)
  })

  it('persists pending intent and both identities before calling the launcher', async () => {
    const { dispatcher, launcher, store, schedule, directory } = await fixture()
    launcher.launch.mockImplementation(async (run) => {
      const disk = JSON.parse(await readFile(store.statePath, 'utf8'))
      expect(disk.runs).toContainEqual(expect.objectContaining({ id: run.id, launchId: run.launchId, status: 'launching' }))
      const reopened = new SchedulerStore(directory)
      await reopened.initialize()
      expect(reopened.hasOccurrence(schedule.id, run.occurrenceAt)).toBe(true)
      launcher.states.set(run.launchId, { state: 'running' })
    })
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await launcher.launch.mock.results[0].value
    await settle(dispatcher)
    expect(launcher.launch).toHaveBeenCalledTimes(1)
    expect(store.getRun(run.id).status).toBe('running')
  })

  it('recovers a crash between pending persistence and launch without duplicating the occurrence', async () => {
    const { store, schedule, directory, launcher } = await fixture()
    const at = '2026-11-14T09:00:00.000Z'
    const pending = (await store.admit(schedule.id, at, 'schedule', 'pending', at))!
    vi.setSystemTime(new Date(at))
    const restarted = new SchedulerStore(directory)
    const dispatcher = new SchedulerDispatcher(restarted, launcher)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await settle(dispatcher)
    expect(launcher.calls[0]).toBe(`reconcile:${pending.id}`)
    expect(launcher.launch).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ launchId: pending.launchId }), expect.anything())
    expect(restarted.allRuns()).toHaveLength(1)
  })

  it.each(['launching', 'running', 'needs-input', 'stopping'] as const)(
    'reconciles an accepted %s launch before catch-up and never submits it again', async (status) => {
      const { store, schedule, directory, launcher } = await fixture({ catchUp: 'once', overlap: 'queue' })
      const pending = (await store.admit(schedule.id, '2026-11-14T09:00:00.000Z', 'schedule'))!
      await store.changeRun(pending.id, { status })
      launcher.states.set(pending.launchId, { state: 'running', sessionId: 'accepted-session', rootPromptReceipt: 'accepted-root' })
      launcher.stop.mockResolvedValue({ outcome: 'unknown' })
      vi.setSystemTime(new Date('2026-11-14T11:00:00.000Z'))
      const restarted = new SchedulerStore(directory)
      const dispatcher = new SchedulerDispatcher(restarted, launcher)
      dispatchers.push(dispatcher)
      await dispatcher.start()
      await settle(dispatcher)
      expect(launcher.calls[0]).toBe(`reconcile:${pending.id}`)
      expect(launcher.launch).not.toHaveBeenCalled()
      expect(restarted.getRun(pending.id)).toMatchObject({ sessionId: 'accepted-session', rootPromptReceipt: 'accepted-root' })
      expect(restarted.allRuns().filter((run) => run.trigger === 'catch-up')).toHaveLength(1)
    },
  )

  it('holds an unknown launch and its slot after a lost response, including across restart', async () => {
    const { dispatcher, launcher, store, schedule, directory } = await fixture({ overlap: 'queue' })
    launcher.launch.mockImplementation(async (run) => {
      launcher.states.set(run.launchId, { state: 'unknown' })
      throw new Error('lost response after acceptance')
    })
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('launching')
    await dispatcher.stop()
    const restarted = new SchedulerStore(directory)
    const recovered = new SchedulerDispatcher(restarted, launcher)
    dispatchers.push(recovered)
    await recovered.start()
    await settle(recovered)
    expect(launcher.launch).toHaveBeenCalledTimes(1)
    expect(restarted.getRun(run.id).status).toBe('launching')
    launcher.states.set(run.launchId, { state: 'running', sessionId: 'recovered-session', rootPromptReceipt: 'recovered-root' })
    await settle(recovered)
    expect(restarted.getRun(run.id)).toMatchObject({ status: 'running', sessionId: 'recovered-session', rootPromptReceipt: 'recovered-root' })
  })

  it('keeps an unlaunched pending intent retryable when offline reconciliation fails', async () => {
    const { store, schedule, dispatcher, launcher } = await fixture({}, () => false)
    const run = (await store.admit(schedule.id, INITIAL, 'schedule'))!
    launcher.reconcile.mockRejectedValue(new Error('offline'))
    await dispatcher.start()
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('pending')
    expect(launcher.launch).not.toHaveBeenCalled()
  })

  it.each(['offline-unknown', 'offline-error', 'online-noop'] as const)(
    'expires never-launched pending work after restart instead of leaking a slot (%s)', async (mode) => {
      const { directory, store, schedule, dispatcher, launcher } = await fixture({}, () => false)
      await dispatcher.start()
      const run = await dispatcher.runNow(schedule.id)
      expect(store.getRun(run.id)).toMatchObject({ status: 'pending', retryUntil: '2026-11-14T08:10:00.000Z' })
      await dispatcher.stop()
      const restarted = new SchedulerStore(directory)
      const owner = mode === 'online-noop' ? new NoopScheduleLauncher() : launcher
      if (mode === 'offline-error') launcher.reconcile.mockRejectedValue(new Error('Synthetic offline lookup'))
      else launcher.reconcile.mockResolvedValue({ state: 'unknown' })
      const recovered = new SchedulerDispatcher(restarted, owner, { targetOnline: () => mode === 'online-noop' })
      dispatchers.push(recovered)
      vi.setSystemTime(new Date(Date.parse(INITIAL) + 60_000))
      await recovered.start()
      await settle(recovered)
      await vi.waitFor(() => expect(restarted.getRun(run.id))
        .toMatchObject({ status: 'pending', retryUntil: '2026-11-14T08:10:00.000Z' }))
      expect(restarted.allRuns().filter(holdsSlot)).toHaveLength(0)
      vi.setSystemTime(new Date(Date.parse(INITIAL) + SCHEDULER_LATE_MS + 1))
      await settle(recovered)
      expect(restarted.getRun(run.id)).toMatchObject({ status: 'missed' })
      expect(restarted.allRuns().filter(holdsSlot)).toHaveLength(0)
      expect(launcher.launch).not.toHaveBeenCalled()
    },
  )

  it('reserves a recovered pending launch with positive identity evidence even after the retry deadline', async () => {
    const { directory, schedule, dispatcher, launcher } = await fixture({}, () => false)
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await dispatcher.stop()
    launcher.states.set(run.launchId, { state: 'unknown', sessionId: 'accepted-session', rootPromptReceipt: 'accepted-root' })
    vi.setSystemTime(new Date(Date.parse(INITIAL) + SCHEDULER_LATE_MS + 1))
    const restarted = new SchedulerStore(directory)
    const recovered = new SchedulerDispatcher(restarted, launcher, { targetOnline: () => false })
    dispatchers.push(recovered)
    await recovered.start()
    await settle(recovered)
    expect(restarted.getRun(run.id)).toMatchObject({
      status: 'launching', sessionId: 'accepted-session', rootPromptReceipt: 'accepted-root',
    })
    expect(restarted.allRuns().filter(holdsSlot)).toHaveLength(1)
    expect(launcher.launch).not.toHaveBeenCalled()
  })

  it.each(['skip', 'replace'] as const)('recovers %s overlap after crashing immediately after pending admission', async (overlap) => {
    const { store, schedule, launcher } = await fixture({ overlap })
    const previous = (await store.admit(schedule.id, '2026-11-14T08:00:00.001Z', 'manual'))!
    await store.changeRun(previous.id, { status: 'running' })
    launcher.states.set(previous.launchId, { state: 'running', sessionId: 'live-session' })
    launcher.stop.mockResolvedValue({ outcome: 'unknown' })
    const newer = (await store.admit(schedule.id, '2026-11-14T08:00:00.002Z', 'manual'))!
    const dispatcher = new SchedulerDispatcher(store, launcher)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await settle(dispatcher)
    expect(store.getRun(newer.id).status).toBe(overlap === 'skip' ? 'missed' : 'pending')
    expect(store.getRun(previous.id).status).toBe(overlap === 'replace' ? 'stopping' : 'running')
    expect(launcher.launch).not.toHaveBeenCalled()
    expect(launcher.calls.slice(0, 2)).toEqual([`reconcile:${previous.id}`, `reconcile:${newer.id}`])
  })

  it.each(['skip', 'once'] as const)('applies catch-up %s after downtime and after sleep', async (catchUp) => {
    const { store, dispatcher, launcher } = await fixture({ catchUp })
    vi.setSystemTime(new Date('2026-11-14T11:11:00.000Z'))
    await dispatcher.start()
    await settle(dispatcher)
    const first = store.allRuns()
    if (catchUp === 'skip') {
      expect(first.map((run) => run.status)).toEqual(['missed', 'missed', 'missed'])
      expect(launcher.launch).not.toHaveBeenCalled()
    } else {
      expect(first).toHaveLength(1)
      expect(first[0]).toMatchObject({ trigger: 'catch-up', occurrenceAt: '2026-11-14T11:00:00.000Z', status: 'running' })
      launcher.states.set(first[0].launchId, { state: 'terminated', outcome: 'succeeded' })
    }
    vi.setSystemTime(new Date('2026-11-14T14:11:00.000Z'))
    await settle(dispatcher)
    expect(store.allRuns().filter((run) => run.trigger === 'catch-up')).toHaveLength(catchUp === 'once' ? 2 : 0)
    expect(store.allRuns().filter((run) => run.status === 'missed')).toHaveLength(catchUp === 'skip' ? 6 : 0)
  })

  it.each([SCHEDULER_LATE_MS, SCHEDULER_LATE_MS + 1])('uses an exact ten-minute late boundary (%s ms)', async (late) => {
    const { dispatcher, launcher, store } = await fixture()
    vi.setSystemTime(new Date(Date.parse('2026-11-14T09:00:00.000Z') + late))
    await dispatcher.start()
    await settle(dispatcher)
    expect(store.allRuns()[0].status).toBe(late === SCHEDULER_LATE_MS ? 'running' : 'missed')
    expect(launcher.launch).toHaveBeenCalledTimes(late === SCHEDULER_LATE_MS ? 1 : 0)
  })

  it('never repeats an occurrence after a backward clock jump', async () => {
    const { dispatcher, store, launcher } = await fixture()
    await dispatcher.start()
    vi.setSystemTime(new Date('2026-11-14T09:00:00.000Z'))
    await settle(dispatcher)
    vi.setSystemTime(new Date('2026-11-14T08:50:00.000Z'))
    await settle(dispatcher)
    vi.setSystemTime(new Date('2026-11-14T09:00:00.000Z'))
    await settle(dispatcher)
    expect(store.allRuns()).toHaveLength(1)
    expect(launcher.launch).toHaveBeenCalledTimes(1)
  })

  it.each(['skip', 'queue', 'replace'] as const)('applies %s overlap to manual triggers', async (overlap) => {
    const { dispatcher, store, launcher, schedule } = await fixture({ overlap })
    await dispatcher.start()
    const first = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    const next = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    if (overlap === 'skip') {
      expect(store.getRun(next.id).status).toBe('missed')
      expect(launcher.launch).toHaveBeenCalledTimes(1)
    } else if (overlap === 'queue') {
      expect(store.getRun(next.id).status).toBe('pending')
      launcher.states.set(first.launchId, { state: 'terminated', outcome: 'succeeded' })
      await settle(dispatcher)
      expect(store.getRun(next.id).status).toBe('running')
    } else {
      expect(store.getRun(first.id).status).toBe('stopped')
      expect(store.getRun(next.id).status).toBe('running')
      expect(launcher.stop).toHaveBeenCalled()
    }
    expect(first.id).not.toBe(next.id)
    expect(first.occurrenceAt).not.toBe(next.occurrenceAt)
  })

  it('holds replace and its slot until an authoritative acknowledgement, even when stop throws', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture({ overlap: 'replace' })
    launcher.stop.mockResolvedValue({ outcome: 'unknown' })
    await dispatcher.start()
    const previous = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    const replacement = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    expect(store.getRun(previous.id).status).toBe('stopping')
    expect(store.getRun(replacement.id).status).toBe('pending')
    expect(launcher.launch).toHaveBeenCalledTimes(1)
    launcher.stop.mockRejectedValueOnce(new Error('offline'))
    await dispatcher.tick()
    expect(store.getRun(previous.id).status).toBe('stopping')
    launcher.stop.mockResolvedValue({ outcome: 'stopped' })
    await settle(dispatcher)
    expect(store.getRun(previous.id).status).toBe('stopped')
    expect(store.getRun(replacement.id).status).toBe('running')
  })

  it('enforces global concurrency, counting launching and needs-input slots', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture()
    const second = await store.create(createInput({ name: 'Second' }))
    const third = await store.create(createInput({ name: 'Third' }))
    launcher.launch.mockImplementation(async (run) => {
      launcher.states.set(run.launchId, { state: run.scheduleId === schedule.id ? 'unknown' : 'needs-input' })
    })
    await dispatcher.start()
    const firstRun = await dispatcher.runNow(schedule.id)
    await dispatcher.runNow(second.id)
    const thirdRun = await dispatcher.runNow(third.id)
    await settle(dispatcher)
    expect(store.allRuns().filter(holdsSlot)).toHaveLength(2)
    expect(store.getRun(firstRun.id).status).toBe('launching')
    expect(store.getRun(thirdRun.id).status).toBe('pending')
    launcher.states.set(firstRun.launchId, { state: 'terminated', outcome: 'failed' })
    await settle(dispatcher)
    expect(launcher.launch).toHaveBeenCalledTimes(3)
    expect(store.allRuns().filter(holdsSlot)).toHaveLength(2)
  })

  it('does not block a second slot or accept premature stop proof while launch is unresolved', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture({ overlap: 'replace' })
    let release!: () => void
    launcher.launch.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve }))
    await dispatcher.start()
    const first = await dispatcher.runNow(schedule.id)
    const replacement = await dispatcher.runNow(schedule.id)
    expect(store.getRun(first.id).status).toBe('stopping')
    expect(launcher.stop).not.toHaveBeenCalled()
    const second = await store.create(createInput({ name: 'Independent' }))
    await dispatcher.runNow(second.id)
    expect(launcher.launch).toHaveBeenCalledTimes(2)
    release()
    await settle(dispatcher)
    expect(store.getRun(replacement.id).status).toBe('running')
  })

  it('retries offline targets and then marks them missed without ever calling launch', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture({}, () => false)
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    vi.setSystemTime(new Date(Date.now() + SCHEDULER_LATE_MS))
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('pending')
    vi.setSystemTime(new Date(Date.now() + 1))
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('missed')
    expect(launcher.launch).not.toHaveBeenCalled()
  })

  it('launches an offline target once it returns before the deadline', async () => {
    let online = false
    const { dispatcher, launcher, store, schedule } = await fixture({}, () => online)
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    online = true
    vi.setSystemTime(new Date(Date.now() + SCHEDULER_LATE_MS - 1))
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('running')
    expect(launcher.launch).toHaveBeenCalledTimes(1)
  })

  it('does not launch a target that only returns after its persisted retry deadline', async () => {
    let online = false
    const { dispatcher, launcher, store, schedule } = await fixture({}, () => online)
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    expect(store.getRun(run.id).retryUntil).toBe('2026-11-14T08:10:00.000Z')
    online = true
    vi.setSystemTime(new Date(Date.now() + SCHEDULER_LATE_MS + 1))
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('missed')
    expect(launcher.launch).not.toHaveBeenCalled()
  })

  it('gives a collapsed catch-up run a fresh offline retry window, not the old occurrence deadline', async () => {
    let online = false
    const { dispatcher, launcher, store } = await fixture({ catchUp: 'once' }, () => online)
    vi.setSystemTime(new Date('2026-11-14T11:30:00.000Z'))
    await dispatcher.start()
    const run = store.allRuns()[0]
    expect(run).toMatchObject({
      trigger: 'catch-up', occurrenceAt: '2026-11-14T11:00:00.000Z',
      status: 'pending', retryUntil: '2026-11-14T11:40:00.000Z',
    })
    online = true
    vi.setSystemTime(new Date('2026-11-14T11:35:00.000Z'))
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('running')
    expect(launcher.launch).toHaveBeenCalledTimes(1)
  })

  it('reconciles an unresolved launch without waiting for its lost network response', async () => {
    const { dispatcher, launcher, store, schedule } = await fixture()
    let release!: () => void
    launcher.launch.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve }))
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('launching')
    launcher.states.set(run.launchId, { state: 'running', sessionId: 'live-session', rootPromptReceipt: 'accepted-root' })
    await settle(dispatcher)
    expect(store.getRun(run.id)).toMatchObject({ status: 'running', rootPromptReceipt: 'accepted-root' })
    release()
    await settle(dispatcher)
    expect(launcher.launch).toHaveBeenCalledTimes(1)
  })

  it('retries only definitive side-effect-free refusals and keeps the original launch identity', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture()
    launcher.launch.mockRejectedValueOnce(new ScheduleTargetUnavailableError('offline before dispatch'))
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    expect(launcher.launch).toHaveBeenCalledTimes(2)
    expect(launcher.launch.mock.calls.every(([call]) => call.launchId === run.launchId)).toBe(true)
    expect(store.getRun(run.id).status).toBe('running')
  })

  it('stops at max runtime but retains the slot for unknown termination', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture({ maxRuntimeMin: 5 })
    launcher.stop.mockResolvedValue({ outcome: 'unknown' })
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    vi.setSystemTime(new Date(Date.now() + 5 * 60_000))
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('stopping')
    expect(store.allRuns().filter(holdsSlot)).toHaveLength(1)
    launcher.states.set(run.launchId, { state: 'terminated', outcome: 'stopped' })
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('stopped')
  })

  it('releases a stopping slot on authoritative absence and allows archived schedule deletion', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture()
    launcher.stop.mockResolvedValue({ outcome: 'unknown' })
    await dispatcher.start()
    const run = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    await dispatcher.stopRun(run.id)
    expect(store.getRun(run.id).status).toBe('stopping')
    launcher.states.set(run.launchId, { state: 'absent' })
    await settle(dispatcher)
    expect(store.getRun(run.id).status).toBe('stopped')
    expect(store.allRuns().filter(holdsSlot)).toHaveLength(0)
    const archived = await store.setArchived(schedule.id, schedule.revision, true)
    await expect(store.delete(schedule.id, archived.revision)).resolves.toBeUndefined()
    expect(store.allRuns()).toEqual([])
  })

  it('binds queued runs to their accepted definition instead of retargeting on edit', async () => {
    const { dispatcher, store, launcher, schedule } = await fixture({ overlap: 'queue' })
    await dispatcher.start()
    const first = await dispatcher.runNow(schedule.id)
    await settle(dispatcher)
    const queued = await dispatcher.runNow(schedule.id)
    await store.update(schedule.id, { revision: 1, target: { computerId: 'other', folder: '/other', provider: 'claude' } })
    launcher.states.set(first.launchId, { state: 'terminated', outcome: 'succeeded' })
    await settle(dispatcher)
    expect(store.getRun(queued.id).computerId).toBe('studio')
    expect(launcher.launch.mock.calls.at(-1)).toEqual([
      expect.objectContaining({ id: queued.id }), expect.objectContaining({ target: expect.objectContaining({ computerId: 'studio' }) }),
    ])
  })

  it('does not create sessions with the no-op runner', async () => {
    const launcher = new NoopScheduleLauncher()
    await expect(launcher.launch()).rejects.toBeInstanceOf(ScheduleTargetUnavailableError)
    expect(await launcher.reconcile()).toEqual({ state: 'unknown' })
    expect(await launcher.stop()).toEqual({ outcome: 'unknown' })
  })
})
