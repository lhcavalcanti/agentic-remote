import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PushSubscription, RequestOptions } from 'web-push'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { ScheduleRunNotification } from '../shared/notification-center.js'
import { ScheduleShellNotifier, type NotificationScope } from '../shared/notifications.js'
import type { Schedule, ScheduleRunStatus } from '../shared/schedules.js'
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
  service = new ScheduleNotificationService(schedules, { admit: (event) => center.hub(event), mutedSessions: () => muted, now: () => now })
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
