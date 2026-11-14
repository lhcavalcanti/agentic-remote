import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import { buildApp } from './app.js'
import { PushNotificationService } from './push-notification-service.js'

const headers = { host: 'localhost', origin: 'http://localhost' }
let directory: string
let runtime: Awaited<ReturnType<typeof buildApp>>
const sender = vi.fn(async () => ({ statusCode: 201, headers: {}, body: '' }))
beforeEach(async () => {
  directory = path.resolve(`.schedule-channel-integration-${randomUUID()}`)
  await mkdir(directory)
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', 'on')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', 'on')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'off')
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  sender.mockClear()
})
afterEach(async () => {
  await runtime?.app.close()
  vi.unstubAllEnvs()
  await rm(directory, { recursive: true, force: true })
})
async function hub() {
  runtime = await buildApp({
    dataDirectory: directory, logger: false, managerAgent: false,
    pushService: new PushNotificationService(directory, sender),
    transcriptionService: { initialize: async () => {}, stop: async () => {}, transcribe: vi.fn() },
  })
  await runtime.app.ready()
  await runtime.pushService!.subscribe({ endpoint: 'https://push.example.test/fictional', keys: { p256dh: 'public', auth: 'auth' } })
}
async function run(notify: 'never' | 'always') {
  const schedule = await runtime.scheduler!.store.create({
    name: 'Fictional review', prompt: 'Review the fictional guide.',
    target: { computerId: 'fictional-studio', folder: '/fictional/repo', provider: 'copilot' },
    recurrence: { type: 'daily', time: '09:00' }, timezone: 'UTC', notify,
  })
  const run = (await runtime.scheduler!.store.admit(schedule.id, new Date().toISOString(), 'manual'))!
  const session: ManagedSession = {
    id: 'fictional-session', computerId: run.computerId, computerName: 'Fictional Studio',
    cwd: '/fictional/repo', title: 'Scheduled review', launchId: run.launchId,
    status: 'running', updatedAt: new Date().toISOString(),
    messages: [{ id: 'accepted-root', role: 'user', content: 'Review', createdAt: new Date().toISOString() }],
  }
  return { schedule, run, session }
}

describe('hub schedule notification integration', () => {
  it.each(['on', 'off'] as const)('the never policy suppresses ordinary paths but keeps HTTP/socket state with center %s', async (centerFlag) => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', centerFlag)
    await hub()
    const { run: admitted, session } = await run('never')
    const roster = await runtime.manager!.listSessionsWithAuthority()
    vi.spyOn(runtime.manager!, 'listSessionsWithAuthority').mockResolvedValue({ ...roster, sessions: [session] })
    vi.spyOn(runtime.manager!, 'readSession').mockResolvedValue(session)
    const list = await runtime.app.inject({ url: '/api/sessions', headers })
    expect(list.json().sessions[0]).toMatchObject({ id: session.id, suppressOrdinaryNotifications: true, status: 'running' })
    const detail = await runtime.app.inject({ url: `/api/computers/${session.computerId}/sessions/${session.id}?passive=1`, headers })
    expect(detail.json().session.suppressOrdinaryNotifications).toBe(true)
    const socket = await runtime.app.injectWS('/api/events', { headers })
    const observed: HubEvent[] = []
    socket.on('message', (raw) => observed.push(JSON.parse(String(raw))))
    try {
      runtime.manager!.emit('event', { type: 'session.upserted', session })
      runtime.manager!.emit('event', { type: 'session.upserted', session: { ...session, status: 'waiting',
        pendingPermission: { requestId: 'permission', title: 'Allow?', options: [] } } })
      runtime.manager!.emit('event', { type: 'session.upserted', session: { ...session, status: 'idle' } })
      await runtime.scheduler!.store.changeRun(admitted.id, { status: 'succeeded', sessionId: session.id })
      await runtime.scheduleNotifications!.flush()
      await runtime.notificationCenter?.flush()
      await vi.waitFor(() => expect(observed.filter((event) => event.type === 'session.upserted')).toHaveLength(3))
      expect(observed.filter((event) => event.type === 'session.upserted').every((event) => event.session.suppressOrdinaryNotifications)).toBe(true)
      expect(observed.filter((event) => event.type === 'schedule.run.notification')).toEqual([])
      expect(sender).not.toHaveBeenCalled()
      if (runtime.notificationCenter) expect(await runtime.notificationCenter.store.list()).toEqual([])
    } finally { socket.terminate() }
  })

  it('admits one canonical outcome before broadcasting it and sending push, and fences duplicate outcomes', async () => {
    await hub()
    const { run: admitted, session } = await run('always')
    const socket = await runtime.app.injectWS('/api/events', { headers })
    const outcomes: HubEvent[] = []
    socket.on('message', (raw) => { const event = JSON.parse(String(raw)); if (event.type === 'schedule.run.notification') outcomes.push(event) })
    try {
      runtime.manager!.emit('event', { type: 'session.upserted', session })
      runtime.manager!.emit('event', { type: 'session.upserted', session: { ...session, status: 'idle' } })
      await runtime.scheduler!.store.changeRun(admitted.id, { status: 'succeeded', sessionId: session.id, rootPromptReceipt: 'accepted-root', endedAt: new Date().toISOString() })
      await runtime.scheduleNotifications!.flush()
      await runtime.scheduler!.store.changeRun(admitted.id, { summary: 'Display-only update' })
      await runtime.scheduleNotifications!.flush()
      await vi.waitFor(() => expect(outcomes).toHaveLength(1))
      await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
      expect(await runtime.notificationCenter!.store.list()).toMatchObject([{ kind: 'schedule.run.succeeded', sessionId: session.id }])
    } finally { socket.terminate() }
  })

  it('constructs no notification service with the scheduler hub flag off', async () => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', 'off')
    await hub()
    expect(runtime.scheduler).toBeUndefined()
    expect(runtime.scheduleNotifications).toBeUndefined()
  })
})
