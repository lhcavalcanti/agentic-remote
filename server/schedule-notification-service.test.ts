import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PushSubscription, RequestOptions } from 'web-push'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { ScheduleRunNotification } from '../shared/notification-center.js'
import { ScheduleShellNotifier, type NotificationScope } from '../shared/notifications.js'
import type { Schedule, ScheduleRunStatus, SchedulerChanged } from '../shared/schedules.js'
import { NotificationCenterService } from './notification-center-service.js'
import { classifyScheduleNotification, notificationIdentity } from './notification-classifier.js'
import { NotificationStore } from './notification-store.js'
import { PushNotificationService } from './push-notification-service.js'
import { ScheduleNotificationService } from './schedule-notification-service.js'
import { SchedulerStore } from './scheduler-store.js'

const now = Date.parse('2026-11-14T18:00:00Z')
const input = (notify: Schedule['notify'] = 'always') => ({
  name: 'Fictional review', prompt: 'Review the fictional guide.',
  target: { computerId: 'fictional-studio', folder: '/fictional/repo', provider: 'copilot' as const },
  recurrence: { type: 'daily' as const, time: '09:00' }, timezone: 'UTC', notify,
})
let directory: string
let schedules: SchedulerStore
let records: NotificationStore
let center: NotificationCenterService
let push: PushNotificationService
let service: ScheduleNotificationService
let events: EventEmitter<{ event: [HubEvent] }>
let muted: string[]
let scope: NotificationScope
let native: Array<NonNullable<ReturnType<ScheduleShellNotifier['next']>>>
let published: ScheduleRunNotification[]
const createSender = () => vi.fn(async (_subscription: PushSubscription, _payload?: string | Buffer | null, _options?: RequestOptions) =>
  ({ statusCode: 201, headers: {}, body: '' }))
let sender: ReturnType<typeof createSender>
beforeEach(async () => {
  directory = path.resolve(`.schedule-notifications-${randomUUID()}`)
  await mkdir(directory)
  muted = []; scope = 'all'; native = []; published = []
  schedules = new SchedulerStore(directory, { now: () => now })
  await schedules.initialize()
  records = new NotificationStore(directory, { now: () => now })
  await records.initialize()
  center = new NotificationCenterService(records, {
    mutedSessions: () => muted,
    readSession: async () => { throw new Error('No passive read needed') },
    isScheduledSession: (session) => schedules.ownsSession(session.computerId, session.id, session.launchId),
    now: () => now,
  })
  sender = createSender()
  push = new PushNotificationService(directory, sender)
  await push.initialize()
  await push.subscribe({ endpoint: 'https://push.example.test/fictional', keys: { p256dh: 'public', auth: 'auth' } })
  push.setRecorder(center)
  push.setPolicy({
    scope: () => scope,
    isScheduledSession: (session) => schedules.ownsSession(session.computerId, session.id, session.launchId),
  })
  events = new EventEmitter()
  push.attach(events)
  service = new ScheduleNotificationService(schedules, {
    admit: (event) => center.hub(event), admitBatch: (batch) => center.scheduleNotifications(batch),
    mutedSessions: () => muted, now: () => now, source: events,
  })
  push.attachScheduleNotifications(service)
  const shell = new ScheduleShellNotifier()
  service.on('event', (event) => {
    published.push(event)
    const notification = shell.next(event.notification, { scope, mutedKeys: muted })
    if (notification) native.push(notification)
  })
  await service.start()
})
afterEach(async () => {
  await service.stop()
  push.stop()
  await center.flush()
  await schedules.flush()
  await rm(directory, { recursive: true, force: true })
})
async function settled() {
  await service.flush()
  await center.flush()
  await new Promise<void>((resolve) => setImmediate(resolve))
}
async function run(policy: Schedule['notify'] = 'always') {
  const schedule = await schedules.create(input(policy))
  const run = (await schedules.admit(schedule.id, new Date(now).toISOString(), 'manual'))!
  return { schedule, run }
}

describe('canonical schedule notifications across channels', () => {
  it('drains attention ingress and its generated delivery before stopping', async () => {
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, { status: 'running', sessionId: 'attention-session' })
    events.emit('event', { type: 'session.upserted', session: {
      id: 'attention-session', computerId: admitted.computerId, computerName: 'Fictional Studio',
      title: 'Scheduled review', cwd: '/fictional/repo', updatedAt: new Date(now).toISOString(),
      launchId: admitted.launchId, status: 'waiting', revision: 1, messages: [],
      pendingPermission: { requestId: 'queued-before-stop', title: 'Allow?', options: [] },
    } })
    await service.stop()
    expect(published).toHaveLength(1)
  })

  it('announces every new needs-input transition once, including across restart', async () => {
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, { status: 'needs-input', sessionId: 'attention-session' })
    await settled()
    await schedules.changeRun(admitted.id, { status: 'running' })
    await schedules.changeRun(admitted.id, { status: 'needs-input' })
    await settled()
    expect(published).toHaveLength(2)
    expect(new Set(published.map((event) => event.notification.id)).size).toBe(2)
    expect(sender).toHaveBeenCalledTimes(2)
    expect(native).toHaveLength(2)
    await service.stop()
    const restored = new SchedulerStore(directory, { now: () => now })
    await restored.initialize()
    const replay = new ScheduleNotificationService(restored, { mutedSessions: () => [], now: () => now })
    const announced = vi.fn()
    replay.on('event', announced)
    try {
      await replay.start()
      expect(announced).not.toHaveBeenCalled()
    } finally { await replay.stop() }
  })

  it.each(['always', 'attention', 'never'] as const)('routes successive permission/question attention through only the canonical %s path', async (policy) => {
    const { run: admitted } = await run(policy)
    await schedules.changeRun(admitted.id, { status: 'running', sessionId: 'attention-session' })
    const session: ManagedSession = {
      id: 'attention-session', computerId: admitted.computerId, computerName: 'Fictional Studio',
      title: 'Scheduled review', cwd: '/fictional/repo', updatedAt: new Date(now).toISOString(),
      launchId: admitted.launchId, status: 'running', revision: 1, messages: [],
    }
    const emit = (update: Partial<ManagedSession>) => events.emit('event', { type: 'session.upserted', session: { ...session, ...update } })
    emit({})
    emit({ revision: 2, status: 'waiting', pendingPermission: { requestId: 'p1', title: 'First permission', options: [] } })
    await settled()
    await schedules.changeRun(admitted.id, { status: 'needs-input' })
    await settled()
    expect(published).toHaveLength(policy === 'never' ? 0 : 1)
    emit({ revision: 3, status: 'waiting', pendingPermission: { requestId: 'p1', title: 'First permission again', options: [] } })
    emit({ revision: 4, status: 'waiting', pendingPermission: { requestId: 'p2', title: 'Second permission', options: [] } })
    await settled()
    emit({ revision: 5 })
    await settled()
    await schedules.changeRun(admitted.id, { status: 'running' })
    emit({ revision: 6, status: 'waiting', pendingUserInput: { requestId: 'q1', question: 'Where next?', choices: [], allowFreeform: true } })
    await settled()
    await schedules.changeRun(admitted.id, { status: 'needs-input' })
    await settled()
    const count = policy === 'never' ? 0 : 3
    expect(published).toHaveLength(count)
    expect(sender).toHaveBeenCalledTimes(count)
    expect(native).toHaveLength(count)
    expect(await records.list()).toHaveLength(count)
    expect(published.every((event) => event.notification.kind === 'schedule.run.needs-input')).toBe(true)
    emit({ revision: 2, status: 'waiting', pendingPermission: { requestId: 'p1', title: 'Stale replay', options: [] } })
    await settled()
    expect(published).toHaveLength(count)
  })

  it('merges a generic attention alert with its later request identity and ignores stale requests', async () => {
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, { status: 'needs-input', sessionId: 'attention-session' })
    await settled()
    const session: ManagedSession = {
      id: 'attention-session', computerId: admitted.computerId, computerName: 'Fictional Studio',
      title: 'Scheduled review', cwd: '/fictional/repo', updatedAt: new Date(now).toISOString(),
      launchId: admitted.launchId, status: 'waiting', messages: [],
    }
    events.emit('event', { type: 'session.upserted', session: {
      ...session, revision: 1, pendingPermission: { requestId: 'p1', title: 'Allow?', options: [] },
    } })
    await settled()
    expect(published).toHaveLength(1)
    events.emit('event', { type: 'session.upserted', session: { ...session, revision: 2, status: 'running' } })
    await schedules.changeRun(admitted.id, { status: 'running' })
    events.emit('event', { type: 'session.upserted', session: {
      ...session, revision: 3, pendingPermission: { requestId: 'stale', title: 'Old request', options: [], stale: true },
    } })
    await settled()
    expect(published).toHaveLength(1)
    events.emit('event', { type: 'session.upserted', session: {
      ...session, revision: 4, pendingPermission: { requestId: 'p2', title: 'Next permission', options: [] },
    } })
    await settled()
    expect(published).toHaveLength(2)
    expect(schedules.notificationReplay().claimed.size).toBe(2)
  })

  it('keeps canonical attention available for a retained completed scheduled session', async () => {
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, { status: 'succeeded', sessionId: 'attention-session' })
    await settled()
    events.emit('event', { type: 'session.upserted', session: {
      id: 'attention-session', computerId: admitted.computerId, computerName: 'Fictional Studio',
      title: 'Scheduled review', cwd: '/fictional/repo', updatedAt: new Date(now).toISOString(),
      launchId: admitted.launchId, status: 'waiting', revision: 1, messages: [],
      pendingUserInput: { requestId: 'follow-up', question: 'Continue?', choices: [], allowFreeform: true },
    } })
    await settled()
    expect(published.map((event) => event.notification.kind)).toEqual(['schedule.run.succeeded', 'schedule.run.needs-input'])
    expect(sender).toHaveBeenCalledTimes(2)
    expect(native).toHaveLength(2)
  })

  it.each(['interrupted', 'stopped'] as const)('does not reopen canonical attention after the run is %s', async (status) => {
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, { status, sessionId: 'attention-session' })
    await settled()
    const before = published.length
    events.emit('event', { type: 'session.upserted', session: {
      id: 'attention-session', computerId: admitted.computerId, computerName: 'Fictional Studio',
      title: 'Scheduled review', cwd: '/fictional/repo', updatedAt: new Date(now).toISOString(),
      launchId: admitted.launchId, status: 'waiting', revision: 1, messages: [],
      pendingPermission: { requestId: 'after-stop', title: 'Old action', options: [] },
    } })
    await settled()
    expect(published).toHaveLength(before)
  })

  it.each([false, true])('reclaims obsolete fences at capacity without replaying retained outcomes (attention: %s)', async (attention) => {
    await service.stop()
    const schedule = await schedules.create(input())
    const first = (await schedules.admit(schedule.id, new Date(now).toISOString(), 'manual', 'failed'))!
    const second = (await schedules.admit(schedule.id, new Date(now + 1).toISOString(), 'manual', 'failed'))!
    const firstId = classifyScheduleNotification(schedule, first, new Date(now).toISOString())[0].id
    const state = JSON.parse(await readFile(schedules.statePath, 'utf8'))
    const previousAttention = attention ? [
      notificationIdentity('schedule.run.needs-input', schedule.id, first.id, 'needs-input'),
      notificationIdentity('schedule.run.needs-input', schedule.id, first.id, 'needs-input', '2'),
    ] : []
    if (attention) state.runs[0].attention = { episode: 2, active: false, bound: false, requests: {} }
    if (attention) state.notificationOwners = Object.fromEntries(previousAttention.map((id) => [id, first.id]))
    state.notificationFences = [firstId, ...previousAttention,
      ...Array.from({ length: 99_999 - previousAttention.length }, (_, index) => index.toString(16).padStart(64, '0'))]
    await writeFile(schedules.statePath, JSON.stringify(state))
    const restored = new SchedulerStore(directory, { now: () => now })
    await restored.initialize()
    const warn = vi.fn()
    const replay = new ScheduleNotificationService(restored, { mutedSessions: () => [], now: () => now, warn })
    const announced = vi.fn()
    replay.on('event', announced)
    try {
      await replay.start()
      expect(warn).not.toHaveBeenCalled()
      expect(announced).toHaveBeenCalledOnce()
      expect(announced.mock.calls[0][0].notification.id).toBe(classifyScheduleNotification(schedule, second, new Date(now).toISOString())[0].id)
      expect(restored.notificationReplay().claimed.size).toBe(2 + previousAttention.length)
      expect(previousAttention.every((id) => restored.notificationReplay().claimed.has(id))).toBe(true)
      await replay.start()
      expect(announced).toHaveBeenCalledOnce()
    } finally { await replay.stop() }
  }, 15_000)

  it('announces a skipped overlap once after its atomic commit and never replays it', async () => {
    const { schedule } = await run()
    const missed = (await schedules.admit(schedule.id, new Date(now + 1).toISOString(), 'manual'))!
    const changed = vi.fn<(event: SchedulerChanged) => void>()
    schedules.on('changed', changed)
    await schedules.applyOverlap(missed.id)
    await settled()
    expect(await records.list()).toMatchObject([{ kind: 'schedule.run.missed' }])
    expect(published).toHaveLength(1)
    expect(sender).toHaveBeenCalledOnce()
    expect(native).toHaveLength(1)
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({ runIds: [missed.id] }))
    await schedules.applyOverlap(missed.id)
    await service.start()
    await settled()
    expect(published).toHaveLength(1)
    expect(sender).toHaveBeenCalledOnce()
  })

  it('batches all replaced run outcomes from the committed snapshot and preserves their restart fences', async () => {
    const schedule = await schedules.create({ ...input(), overlap: 'replace' })
    const previous = (await schedules.admit(schedule.id, new Date(now).toISOString(), 'manual'))!
    await schedules.changeRun(previous.id, { status: 'running', sessionId: 'live-review' })
    const queued = await Promise.all([1, 2].map((offset) =>
      schedules.admit(schedule.id, new Date(now + offset).toISOString(), 'manual')))
    const replacement = (await schedules.admit(schedule.id, new Date(now + 3).toISOString(), 'manual'))!
    const changed = vi.fn((event: SchedulerChanged) =>
      event.runIds?.map((id) => ({ id, status: schedules.getRun(id).status })))
    schedules.on('changed', changed)
    const persist = vi.spyOn(schedules as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    const notificationPersist = vi.spyOn(records as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    try {
      expect((await schedules.applyOverlap(replacement.id)).map((run) => run.id)).toEqual([previous.id])
      await settled()
      expect(await records.list()).toHaveLength(2)
      expect(published.map((event) => event.notification.kind)).toEqual(['schedule.run.interrupted', 'schedule.run.interrupted'])
      expect(changed.mock.results[0].value).toEqual([
        { id: previous.id, status: 'stopping' }, ...queued.map((run) => ({ id: run!.id, status: 'stopped' })),
      ])
      expect(persist).toHaveBeenCalledTimes(2)
      expect(notificationPersist).toHaveBeenCalledOnce()
      expect(sender).toHaveBeenCalledTimes(2)
      expect(native).toHaveLength(2)
      await schedules.changeRun(previous.id, { status: 'stopped', endedAt: new Date(now).toISOString() })
      await settled()
      expect(published).toHaveLength(3)
      expect(new Set(published.map((event) => event.notification.id)).size).toBe(3)
      expect(sender).toHaveBeenCalledTimes(3)
      expect(native).toHaveLength(3)
      const restored = new SchedulerStore(directory, { now: () => now })
      await restored.initialize()
      const replay = new ScheduleNotificationService(restored, {
        admitBatch: (batch) => center.scheduleNotifications(batch), mutedSessions: () => [], now: () => now,
      })
      const announced = vi.fn()
      replay.on('event', announced)
      try {
        await replay.start()
        expect(announced).not.toHaveBeenCalled()
        expect(await records.list()).toHaveLength(3)
      } finally { await replay.stop() }
    } finally { persist.mockRestore(); notificationPersist.mockRestore() }
  })

  it('announces an archived-before-overlap stop without interrupting the older live run', async () => {
    const schedule = await schedules.create({ ...input(), overlap: 'replace' })
    const previous = (await schedules.admit(schedule.id, new Date(now).toISOString(), 'manual'))!
    await schedules.changeRun(previous.id, { status: 'running' })
    const replacement = (await schedules.admit(schedule.id, new Date(now + 1).toISOString(), 'manual'))!
    await schedules.setArchived(schedule.id, schedule.revision, true)
    expect(await schedules.applyOverlap(replacement.id)).toEqual([])
    await settled()
    expect(await records.list()).toMatchObject([{ kind: 'schedule.run.interrupted' }])
    expect(schedules.getRun(previous.id).status).toBe('running')
    expect(schedules.getRun(replacement.id)).toMatchObject({ status: 'stopped', error: 'Schedule was archived before replacement overlap' })
    expect(sender).toHaveBeenCalledOnce()
    expect(native).toHaveLength(1)
    await service.start()
    expect(published).toHaveLength(1)
  })

  it.each([false, true])('accepts a legacy runId event and deduplicates overlapping runIds=%s', async (includeBatch) => {
    const { schedule, run: accepted } = await run()
    await service.stop()
    await schedules.changeRun(accepted.id, { status: 'failed' })
    const admitBatch = vi.fn((batch: ScheduleRunNotification[]) => center.scheduleNotifications(batch))
    const listener = new ScheduleNotificationService(schedules, {
      admitBatch, mutedSessions: () => [], now: () => now,
    })
    const announced = vi.fn()
    listener.on('event', announced)
    try {
      schedules.emit('changed', {
        type: 'schedules.changed', revision: 1, scheduleId: schedule.id, runId: accepted.id,
        ...(includeBatch ? { runIds: [accepted.id, accepted.id] } : {}),
      })
      await listener.flush()
      expect(admitBatch).toHaveBeenCalledOnce()
      expect(admitBatch.mock.calls[0][0]).toHaveLength(1)
      expect(announced).toHaveBeenCalledOnce()
      expect(await records.list()).toHaveLength(1)
    } finally { await listener.stop() }
  })

  it.each([4000, 3997, 0])('replays 4000 retained runs with %s existing fences using bounded durable work', async (fencedCount) => {
    await service.stop()
    const seed = await schedules.create(input())
    const state = JSON.parse(await readFile(schedules.statePath, 'utf8'))
    state.schedules = Array.from({ length: 20 }, (_, index) => ({ ...seed, id: `schedule-${index}`, name: `Review ${index}` }))
    state.cursors = Object.fromEntries(state.schedules.map((schedule: Schedule) => [schedule.id, seed.createdAt]))
    state.runs = Array.from({ length: 4000 }, (_, index) => ({
      id: `run-${index}`, scheduleId: `schedule-${Math.floor(index / 200)}`,
      launchId: `launch-${index}`, computerId: seed.target.computerId, sessionId: `session-${index}`,
      occurrenceAt: new Date(now - index * 1000).toISOString(), trigger: 'manual', status: 'failed',
      endedAt: new Date(now).toISOString(),
    }))
    state.runSchedules = Object.fromEntries(state.runs.map((run: { id: string; scheduleId: string }, index: number) =>
      [run.id, state.schedules[Math.floor(index / 200)]]))
    state.occurrences = Object.fromEntries(state.runs.map((run: { id: string; scheduleId: string; occurrenceAt: string }) =>
      [JSON.stringify([run.scheduleId, run.occurrenceAt]), run.id]))
    state.notificationFences = state.runs.slice(0, fencedCount).map((run: { id: string; scheduleId: string }) =>
      notificationIdentity('schedule.run.failed', run.scheduleId, run.id, 'failed'))
    await writeFile(schedules.statePath, JSON.stringify(state))
    const restored = new SchedulerStore(directory, { now: () => now })
    await restored.initialize()
    const warn = vi.fn()
    const admitBatch = vi.fn((batch: ScheduleRunNotification[]) => center.scheduleNotifications(batch))
    const mutedSessions = vi.fn(() => state.runs.map((run: { computerId: string; sessionId: string }) => `${run.computerId}:${run.sessionId}`))
    const replay = new ScheduleNotificationService(restored, { admitBatch, mutedSessions, now: () => now, warn })
    const announced = vi.fn()
    replay.on('event', announced)
    const persist = vi.spyOn(restored as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    const notificationPersist = vi.spyOn(records as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    const clone = globalThis.structuredClone
    let largeClones = 0
    const cloning = vi.spyOn(globalThis, 'structuredClone').mockImplementation((value, options) => {
      if (value && typeof value === 'object' && 'runs' in value &&
          Array.isArray(value.runs) && value.runs.length === 4000) {
        largeClones += 1
        if (largeClones > 2) throw new Error('Per-run scheduler replay cloning is unbounded')
      }
      return clone(value, options)
    })
    try {
      await replay.start()
      expect(largeClones).toBeLessThanOrEqual(2)
      const expected = 4000 - fencedCount
      expect(persist).toHaveBeenCalledTimes(expected ? 1 : 0)
      expect(notificationPersist).toHaveBeenCalledTimes(expected ? 1 : 0)
      expect(admitBatch).toHaveBeenCalledTimes(expected ? 1 : 0)
      expect(announced).toHaveBeenCalledTimes(expected)
      expect(mutedSessions).toHaveBeenCalledOnce()
      expect(warn).not.toHaveBeenCalled()
      if (expected) {
        const event = announced.mock.calls[0][0]
        expect(center.hub(event)).toBe(center.admission(event))
      }
      await replay.start()
      expect(mutedSessions).toHaveBeenCalledTimes(2)
      expect(announced).toHaveBeenCalledTimes(expected)
      expect(persist).toHaveBeenCalledTimes(expected ? 1 : 0)
      expect(notificationPersist).toHaveBeenCalledTimes(expected ? 1 : 0)
    } finally {
      cloning.mockRestore()
      persist.mockRestore()
      notificationPersist.mockRestore()
      await replay.stop()
    }
  }, 15_000)

  it.each(['admission', 'claim'] as const)('does not deliver replay outcomes before a successful durable %s batch', async (failure) => {
    await service.stop()
    const { schedule, run: first } = await run()
    const second = (await schedules.admit(schedule.id, new Date(now + 1).toISOString(), 'manual'))!
    await schedules.changeRun(first.id, { status: 'failed' })
    await schedules.changeRun(second.id, { status: 'failed' })
    const admitBatch = vi.fn((batch: ScheduleRunNotification[]) => center.scheduleNotifications(batch))
    const persist = vi.spyOn(schedules as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    if (failure === 'admission') admitBatch.mockRejectedValueOnce(new Error('Admission failed'))
    else persist.mockRejectedValueOnce(new Error('Claim write failed'))
    const warn = vi.fn()
    const replay = new ScheduleNotificationService(schedules, { admitBatch, mutedSessions: () => [], now: () => now, warn })
    const announced = vi.fn()
    replay.on('event', announced)
    try {
      await replay.start()
      expect(announced).not.toHaveBeenCalled()
      expect(schedules.notificationReplay().claimed.size).toBe(0)
      expect(warn).toHaveBeenCalledOnce()
      const existing = (await records.list())[0]
      if (existing) { await records.markRead(existing.id); await records.dismiss(existing.id) }
      await replay.start()
      expect(announced).toHaveBeenCalledTimes(2)
      expect(schedules.notificationReplay().claimed.size).toBe(2)
      if (existing) expect((await records.list()).some((record) => record.id === existing.id)).toBe(false)
      await replay.start()
      expect(announced).toHaveBeenCalledTimes(2)
      const restored = new SchedulerStore(directory, { now: () => now })
      await restored.initialize()
      expect(restored.notificationReplay().claimed.size).toBe(2)
    } finally { persist.mockRestore(); await replay.stop() }
  })

  it('claims overlapping replay batches atomically and skips already-fenced claims without writing', async () => {
    const ids = ['one', 'two', 'three'].map((id) => notificationIdentity('schedule.run.failed', id))
    const persist = vi.spyOn(schedules as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    try {
      const claims = await Promise.all([
        schedules.claimNotifications(ids.slice(0, 2)), schedules.claimNotifications(ids.slice(1)),
      ])
      expect(claims.flat().sort()).toEqual([...ids].sort())
      expect(persist).toHaveBeenCalledTimes(2)
      expect(await schedules.claimNotifications(ids)).toEqual([])
      expect(await schedules.claimNotification(ids[0])).toBe(false)
      expect(persist).toHaveBeenCalledTimes(2)
    } finally { persist.mockRestore() }
  })

  it.each(['succeeded', 'needs-input'] as const)('does not report stale launch errors on recovered %s outcomes', async (outcome) => {
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, {
      status: outcome, error: 'Transient owner disconnect', summary: 'The review completed successfully.',
      startedAt: new Date(now - 6 * 60 * 60_000).toISOString(),
      ...(outcome === 'succeeded' ? { endedAt: new Date(now).toISOString() } : {}),
    })
    await settled()
    const [record] = await records.list()
    expect(record.body).not.toContain('disconnect')
    expect(record.body).toBe(outcome === 'succeeded' ? 'The review completed successfully.' : 'Open the scheduled session to continue.')
    expect(record.createdAt).toBe(new Date(now).toISOString())
    expect(JSON.parse(sender.mock.calls[0][1] as string).body).not.toContain('disconnect')
  })

  for (const policy of ['always', 'attention', 'never'] as const) {
    it.each(['succeeded', 'failed', 'needs-input', 'missed', 'interrupted'] as const)(
      `${policy} resolves %s identically for in-app, push and native`, async (outcome) => {
        const { run: admitted } = await run(policy)
        const outcomeRun = await schedules.changeRun(admitted.id, {
          status: outcome, sessionId: 'fictional-session', rootPromptReceipt: 'accepted-root',
          ...(outcome === 'needs-input' ? { startedAt: new Date(now).toISOString() } : { endedAt: new Date(now).toISOString() }),
        })
        await settled()
        const expected = policy === 'never' || (policy === 'attention' && outcome === 'succeeded') ? 0 : 1
        expect(await records.list()).toHaveLength(expected)
        expect(sender).toHaveBeenCalledTimes(expected)
        expect(native).toHaveLength(expected)
        expect(published).toHaveLength(expected)
        if (expected) {
          const [record] = await records.list()
          expect(record.id).toBe(notificationIdentity(`schedule.run.${outcome}`, outcomeRun.scheduleId, outcomeRun.id, outcome))
          expect(record.kind).toBe(`schedule.run.${outcome}`)
          expect(JSON.parse(sender.mock.calls[0][1] as string).tag).toBe(native[0].tag)
        }
      },
    )
  }

  it('deduplicates repeated updates and restarts without resurrecting read or dismissed records', async () => {
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, { status: 'failed', endedAt: new Date(now).toISOString() })
    await schedules.changeRun(admitted.id, { summary: 'Updated display text' })
    await settled()
    expect(sender).toHaveBeenCalledOnce()
    const [record] = await records.list()
    await records.markRead(record.id)
    await records.dismiss(record.id)
    await service.stop()
    const restored = new SchedulerStore(directory, { now: () => now })
    await restored.initialize()
    const restoredRecords = new NotificationStore(directory, { now: () => now })
    await restoredRecords.initialize()
    const restoredCenter = new NotificationCenterService(restoredRecords, {
      mutedSessions: () => [], readSession: async () => { throw new Error('No passive read needed') }, now: () => now,
    })
    const restarted = new ScheduleNotificationService(restored, { admit: (event) => restoredCenter.hub(event), mutedSessions: () => [], now: () => now })
    const announced = vi.fn()
    restarted.on('event', announced)
    try {
      await restarted.start()
      expect(announced).not.toHaveBeenCalled()
      expect(await restoredRecords.list()).toEqual([])
      expect(await restoredRecords.unreadCount()).toBe(0)
    } finally { await restarted.stop(); await restoredCenter.flush() }
  })

  it.each([['never', 'always', 0], ['always', 'never', 1]] as const)(
    'uses the accepted %s policy even after editing to %s', async (accepted, edited, count) => {
      const { schedule, run: admitted } = await run(accepted)
      await schedules.update(schedule.id, { revision: 1, notify: edited })
      await schedules.changeRun(admitted.id, { status: 'failed' })
      await settled()
      expect(await records.list()).toHaveLength(count)
      expect(sender).toHaveBeenCalledTimes(count)
      expect(native).toHaveLength(count)
    },
  )

  it('suppresses ordinary action and completion paths before run.sessionId is bound, using launch identity', async () => {
    const { run: admitted } = await run('never')
    const session: ManagedSession = {
      id: 'not-yet-bound', computerId: admitted.computerId, computerName: 'Fictional Studio',
      title: 'Scheduled review', cwd: '/fictional/repo', updatedAt: new Date(now).toISOString(),
      launchId: admitted.launchId, status: 'running', messages: [{ id: 'root', role: 'user', content: 'Review', createdAt: new Date(now).toISOString() }],
    }
    expect(schedules.getRun(admitted.id).sessionId).toBeUndefined()
    for (const update of [
      session,
      { ...session, status: 'waiting' as const, pendingPermission: { requestId: 'permission', title: 'Allow?', options: [] } },
      { ...session, status: 'idle' as const },
    ]) events.emit('event', { type: 'session.upserted', session: update })
    await schedules.changeRun(admitted.id, { status: 'succeeded' })
    await settled()
    expect(await records.list()).toEqual([])
    expect(sender).not.toHaveBeenCalled()
    expect(native).toEqual([])
    expect(schedules.ownsSession('different-computer', session.id, session.launchId)).toBe(false)
  })

  it.each(['off', 'oracle'] as const)('preserves %s delivery scope but persists the in-app record', async (value) => {
    scope = value
    const { run: admitted } = await run()
    await schedules.changeRun(admitted.id, { status: 'failed' })
    await settled()
    expect(await records.list()).toHaveLength(1)
    expect(sender).not.toHaveBeenCalled()
    expect(native).toEqual([])
  })

  it('preserves session mute across channels without discarding the in-app record', async () => {
    const { run: admitted } = await run()
    muted = [`${admitted.computerId}:fictional-session`]
    await schedules.changeRun(admitted.id, { status: 'needs-input', sessionId: 'fictional-session' })
    await settled()
    expect(await records.list()).toMatchObject([{ muted: true, kind: 'schedule.run.needs-input' }])
    expect(sender).not.toHaveBeenCalled()
    expect(native).toEqual([])
  })

  it('keeps canonical push/native outcomes and ordinary suppression with notification center disabled', async () => {
    await service.stop()
    push.setRecorder(undefined)
    const withoutCenter = new ScheduleNotificationService(schedules, { mutedSessions: () => [], now: () => now })
    push.attachScheduleNotifications(withoutCenter)
    const shell = new ScheduleShellNotifier()
    withoutCenter.on('event', (event) => { const result = shell.next(event.notification); if (result) native.push(result) })
    try {
      const { run: admitted } = await run()
      await schedules.changeRun(admitted.id, { status: 'failed' })
      await withoutCenter.flush()
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect(sender).toHaveBeenCalledOnce()
      expect(native).toHaveLength(1)
      expect(await records.list()).toEqual([])
      await withoutCenter.start()
      expect(sender).toHaveBeenCalledOnce()
    } finally { await withoutCenter.stop() }
  })

  it('deduplicates native replays and suppresses active visible sessions, including later replay', async () => {
    const { schedule, run: admitted } = await run()
    const [record] = classifyScheduleNotification(schedule, { ...admitted, status: 'failed', sessionId: 'active' }, new Date(now).toISOString())
    const shell = new ScheduleShellNotifier()
    expect(shell.next(record, { activeKey: `${record.computerId}:active`, documentVisible: true })).toBeUndefined()
    expect(shell.next(record)).toBeUndefined()
    expect(new ScheduleShellNotifier().next(record)).toMatchObject({ urgent: true })
  })

  it('classifies a stopped run as interrupted, and never notifies non-outcomes', async () => {
    const { schedule, run: admitted } = await run()
    for (const status of ['pending', 'launching', 'running', 'stopping'] as ScheduleRunStatus[]) {
      expect(classifyScheduleNotification(schedule, { ...admitted, status }, new Date(now).toISOString())).toEqual([])
    }
    expect(classifyScheduleNotification(schedule, { ...admitted, status: 'stopped' }, new Date(now).toISOString())[0].kind).toBe('schedule.run.interrupted')
  })
})
