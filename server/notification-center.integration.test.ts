import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import type { PushSubscription, RequestOptions } from 'web-push'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import type { NotificationRecord } from '../shared/notification-center.js'
import { buildApp } from './app.js'
import type { ManagerAgent } from './manager-agent.js'
import { NotificationCenterService } from './notification-center-service.js'
import { NotificationStore } from './notification-store.js'
import { PushNotificationService } from './push-notification-service.js'

const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }
const directories: string[] = []
const runtimes: Awaited<ReturnType<typeof buildApp>>[] = []
const now = new Date().toISOString()

function session(id = 'session'): ManagedSession {
  return {
    id, computerId: 'computer', computerName: 'Worker', cwd: '/project', title: `Review ${id}`,
    status: 'running', isOpen: true, updatedAt: now,
    messages: [{ id: `root-${id}`, role: 'user', content: 'Review', createdAt: now }],
  }
}

async function directory() {
  const directory = path.resolve(`.notification-center-test-${randomUUID()}`)
  directories.push(directory)
  await mkdir(directory, { mode: 0o700 })
  return directory
}

async function hub(flag: 'on' | 'off') {
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', flag)
  const sender = vi.fn(async (_subscription: PushSubscription, _payload?: string | Buffer | null, _options?: RequestOptions) =>
    ({ statusCode: 201, headers: {}, body: '' }))
  const oracle = Object.assign(new EventEmitter<{ event: [ManagerEvent] }>(), {
    start: async () => undefined,
    stop: async () => undefined,
    snapshot: () => ({ available: true, status: 'idle', messages: [], queued: 0, managedSessions: [] }),
  })
  const dataDirectory = await directory()
  const phases: string[] = []
  const runtime = await buildApp({
    dataDirectory, logger: false, managerAgent: oracle as unknown as ManagerAgent,
    pushService: new PushNotificationService(dataDirectory, sender),
    startupPhases: { run: async (name, work) => { phases.push(name); return work() } },
    transcriptionService: { initialize: async () => undefined, stop: async () => undefined, transcribe: vi.fn() },
  })
  runtimes.push(runtime)
  const emit = (event: HubEvent) => runtime.manager!.emit('event', event)
  const list = async (query = '') => {
    const response = await runtime.app.inject({ url: `/api/notifications${query}`, headers: trusted })
    expect(response.statusCode).toBe(200)
    return response.json().notifications as NotificationRecord[]
  }
  return { runtime, dataDirectory, sender, oracle, phases, emit, list }
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
})
afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.app.close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.unstubAllEnvs()
})

describe('hub notification center', () => {
  it('creates no store or startup phase and returns 404 for every route when disabled', async () => {
    const { runtime, dataDirectory, phases, emit } = await hub('off')
    emit({ type: 'session.upserted', session: { ...session(), status: 'waiting',
      pendingPermission: { requestId: 'p', title: 'Run?', options: [] } } })
    for (const [method, suffix] of [
      ['GET', ''], ['GET', '/unread-count'], ['POST', '/read-all'], ['POST', `/${'a'.repeat(64)}/read`], ['POST', `/${'a'.repeat(64)}/dismiss`],
    ] as const) {
      expect((await runtime.app.inject({ method, url: `/api/notifications${suffix}`, headers: trusted })).statusCode).toBe(404)
    }
    expect(runtime.notificationCenter).toBeUndefined()
    expect(phases).not.toContain('notifications.initialize')
    await expect(stat(path.join(dataDirectory, 'notifications'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('lists, filters, acknowledges, dismisses, counts, and broadcasts only durable changes', async () => {
    const { runtime, phases, emit, list } = await hub('on')
    expect(phases).toContain('notifications.initialize')
    await runtime.app.ready()
    const socket = await runtime.app.injectWS('/api/events?patches=1', { headers: trusted })
    const changes: HubEvent[] = []
    socket.on('message', (raw) => {
      const event = JSON.parse(String(raw)) as HubEvent
      if (event.type === 'notifications.changed') changes.push(event)
    })
    try {
      emit({ type: 'session.upserted', session: session('one') })
      emit({ type: 'session.upserted', session: { ...session('one'), status: 'idle' } })
      emit({ type: 'session.upserted', session: session('two') })
      emit({ type: 'session.upserted', session: { ...session('two'), status: 'error' } })
      const records = await list()
      expect(records).toHaveLength(2)
      const complete = records.find((record) => record.kind === 'session.completed')!
      const failed = records.find((record) => record.kind === 'session.failed')!
      expect(await list('?failed=true')).toEqual([failed])
      expect(await list('?sessionId=one&computerId=computer&kind=session.completed&unread=true')).toEqual([complete])
      expect((await runtime.app.inject({ url: '/api/notifications/unread-count', headers: trusted })).json()).toEqual({ unreadCount: 2 })
      const read = await runtime.app.inject({ method: 'POST', url: `/api/notifications/${complete.id}/read`, headers: trusted })
      expect(read.statusCode).toBe(200)
      expect(await list('?unread=true')).toEqual([failed])
      expect((await runtime.app.inject({ method: 'POST', url: `/api/notifications/${failed.id}/dismiss`, headers: trusted })).statusCode).toBe(200)
      expect(await list()).toHaveLength(1)
      await vi.waitFor(() => expect(changes).toHaveLength(4))
      expect(changes.at(-1)).toMatchObject({ type: 'notifications.changed', unreadCount: 0, revision: 4 })
      const state = JSON.parse(await readFile(runtime.notificationCenter!.store.statePath, 'utf8'))
      expect(state.revision).toBe(4)
      expect(state.records).toHaveLength(2)
      expect((await runtime.app.inject({ method: 'POST', url: '/api/notifications/not-an-id/read', headers: trusted })).statusCode).toBe(400)
      expect((await runtime.app.inject({ url: '/api/notifications?unread=garbage', headers: trusted })).statusCode).toBe(400)
      expect((await runtime.app.inject({ url: '/api/notifications?kind=unknown', headers: trusted })).statusCode).toBe(400)
      expect((await runtime.app.inject({ method: 'POST', url: `/api/notifications/${'a'.repeat(64)}/read`, headers: trusted })).statusCode).toBe(404)
    } finally { socket.terminate() }
  })

  it('read-all is filter scoped; active session reads and explicit opens mark only that computer/session read', async () => {
    const { runtime, emit, list } = await hub('on')
    for (const id of ['one', 'two', 'three']) {
      emit({ type: 'session.upserted', session: session(id) })
      emit({ type: 'session.upserted', session: { ...session(id), status: 'idle' } })
    }
    await list()
    expect((await runtime.app.inject({ method: 'POST', url: '/api/notifications/read-all?sessionId=one&computerId=computer', headers: trusted })).statusCode).toBe(200)
    expect(await list('?unread=true')).toHaveLength(2)
    vi.spyOn(runtime.manager!, 'readSession').mockResolvedValue(session('two'))
    vi.spyOn(runtime.manager!, 'getSession').mockResolvedValue(session('two'))
    vi.spyOn(runtime.manager!, 'activateSession').mockResolvedValue(session('three'))
    expect((await runtime.app.inject({ url: '/api/computers/computer/sessions/two?passive=1', headers: trusted })).statusCode).toBe(200)
    expect(await list('?unread=true')).toHaveLength(2)
    expect((await runtime.app.inject({ url: '/api/computers/computer/sessions/two', headers: trusted })).statusCode).toBe(200)
    expect(await list('?unread=true')).toHaveLength(1)
    expect((await runtime.app.inject({ method: 'POST', url: '/api/computers/computer/sessions/three/open', headers: trusted })).statusCode).toBe(200)
    expect(await list('?unread=true')).toHaveLength(0)
  })

  it('commits the in-app record before external delivery and resolves transcript-free outcomes passively', async () => {
    const { runtime, sender, emit, list } = await hub('on')
    await runtime.pushService!.subscribe({
      endpoint: 'https://push.example.test/device', expirationTime: null,
      keys: { p256dh: 'public', auth: 'auth' },
    })
    const active = session()
    const passive = vi.spyOn(runtime.manager!, 'readSession').mockResolvedValue({ ...active, status: 'idle' })
    sender.mockImplementationOnce(async () => {
      const state = JSON.parse(await readFile(runtime.notificationCenter!.store.statePath, 'utf8'))
      expect(state.records).toEqual([expect.objectContaining({ kind: 'session.completed' })])
      return { statusCode: 201, headers: {}, body: '' }
    })
    emit({ type: 'session.upserted', session: { ...active, messages: [] }, summary: true })
    emit({ type: 'session.upserted', session: { ...active, messages: [], status: 'idle' }, summary: true })
    expect(await list()).toHaveLength(1)
    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
    expect(passive).toHaveBeenCalledWith(active.computerId, active.id)
  })

  it('does not bind an old terminal snapshot to a newer passive root prompt', async () => {
    const { runtime, emit, list } = await hub('on')
    const active = session()
    vi.spyOn(runtime.manager!, 'readSession').mockResolvedValue({
      ...active, status: 'running', revision: 3,
      messages: [{ ...active.messages[0]!, id: 'later-root' }],
    })
    emit({ type: 'session.upserted', session: { ...active, revision: 1, messages: [] }, summary: true })
    emit({ type: 'session.upserted', session: { ...active, revision: 2, status: 'idle', messages: [] }, summary: true })
    expect(await list()).toEqual([])
  })

  it('retains a terminal outcome read mark through a fresh classifier and repeated node status transitions', async () => {
    const { runtime, emit, list } = await hub('on')
    emit({ type: 'session.upserted', session: session() })
    emit({ type: 'session.upserted', session: { ...session(), status: 'idle' } })
    const id = (await list())[0]!.id
    await runtime.notificationCenter!.store.markRead(id)
    const store = new NotificationStore(path.dirname(runtime.notificationCenter!.store.directory))
    await store.initialize()
    const restarted = new NotificationCenterService(store, {
      mutedSessions: () => [], readSession: async () => session(),
    })
    await restarted.hub({ type: 'session.upserted', session: session() }, true)
    await restarted.hub({ type: 'session.upserted', session: { ...session(), status: 'idle' }, summary: true })
    expect(await store.list()).toHaveLength(1)
    expect(await store.unreadCount()).toBe(0)
  })

  it('replays startup pending requests and node resyncs without duplicating or resurrecting read/dismissed records', async () => {
    const dataDirectory = await directory()
    const pending = { ...session(), status: 'waiting' as const,
      pendingPermission: { requestId: 'permission-1', title: 'Run?', options: [] } }
    async function start() {
      const store = new NotificationStore(dataDirectory)
      await store.initialize()
      const center = new NotificationCenterService(store, {
        mutedSessions: () => [], readSession: async () => pending,
      })
      const events = Object.assign(new EventEmitter<{ event: [HubEvent] }>(), { listSessions: async () => [pending] })
      const push = new PushNotificationService(dataDirectory)
      await push.initialize()
      push.setRecorder(center)
      push.attach(events)
      await vi.waitFor(async () => expect(await store.list()).toHaveLength(1))
      return { store, center, events, push }
    }
    const first = await start()
    const id = (await first.store.list())[0]!.id
    await first.store.markRead(id)
    first.push.stop()
    await first.center.flush()
    const second = await start()
    second.events.emit('event', { type: 'session.upserted', session: pending, summary: true })
    await second.center.flush()
    expect(await second.store.unreadCount()).toBe(0)
    await second.store.dismiss(id)
    second.push.stop()
    await second.center.flush()
    const finalStore = new NotificationStore(dataDirectory)
    await finalStore.initialize()
    const center = new NotificationCenterService(finalStore, { mutedSessions: () => [], readSession: async () => pending })
    await center.hub({ type: 'session.upserted', session: pending }, true)
    await center.hub({ type: 'session.upserted', session: pending, summary: true })
    expect(await finalStore.list()).toEqual([])
    expect(JSON.parse(await readFile(finalStore.statePath, 'utf8')).records).toHaveLength(1)
  })

  it('persists an Oracle reply only after successful completion, never after Stop with partial output', async () => {
    const { oracle, list } = await hub('on')
    const user = { id: 'oracle-user', role: 'user' as const, content: 'Status?', createdAt: now }
    const reply = { id: 'oracle-reply', role: 'assistant' as const, replyTo: user.id, content: 'Partial\n\n_(stopped)_', createdAt: now }
    oracle.emit('event', { type: 'manager.message', message: reply })
    expect(await list()).toEqual([])
    oracle.emit('event', { type: 'manager.message', message: { ...user, state: 'cancelled' } })
    expect(await list()).toEqual([])
    oracle.emit('event', { type: 'manager.message', message: { ...user, state: 'running' } })
    oracle.emit('event', { type: 'manager.message', message: { ...reply, id: 'retry-reply', content: '## **Completed** [answer](https://example.test/report)' } })
    expect(await list()).toEqual([])
    oracle.emit('event', { type: 'manager.message', message: { ...user, state: 'done' } })
    expect(await list()).toEqual([expect.objectContaining({ title: 'Oracle replied', body: 'Completed answer' })])
  })

  it('keeps proactive bookkeeping out of unread records without changing ordinary Oracle push delivery', async () => {
    const { oracle, runtime, sender, list } = await hub('on')
    await runtime.pushService!.subscribe({
      endpoint: 'https://push.example.test/device', expirationTime: null,
      keys: { p256dh: 'public', auth: 'auth' },
    })
    for (const state of ['done', 'failed'] as const) {
      const id = `proactive-${state}`
      oracle.emit('event', { type: 'manager.message', message: {
        id: `${id}-reply`, role: 'assistant', replyTo: id, content: 'Internal observation', createdAt: now,
      } })
      oracle.emit('event', { type: 'manager.message', message: {
        id, role: 'user', content: 'Observe', createdAt: now, state, source: 'proactive', suppressNotification: true,
      } })
    }
    expect(await list()).toEqual([])
    expect(sender).not.toHaveBeenCalled()
    oracle.emit('event', { type: 'manager.message', message: {
      id: 'typed', role: 'user', content: 'Status?', createdAt: now, state: 'done',
    } })
    expect(await list()).toHaveLength(1)
    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
  })

  it.each(['off', 'on'] as const)('preserves push delivery suppression with the hub flag %s', async (flag) => {
    const { runtime, sender, oracle, emit, list } = await hub(flag)
    await runtime.pushService!.subscribe({
      endpoint: 'https://push.example.test/device', expirationTime: null,
      keys: { p256dh: 'public', auth: 'auth' },
    })
    const titles = () => sender.mock.calls.map(([, raw]) => JSON.parse(String(raw)).title as string)
    const settled = async () => {
      await runtime.notificationCenter?.flush()
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    let revision = 0
    async function scope(value: 'all' | 'oracle' | 'off') {
      const response = await runtime.app.inject({
        method: 'PATCH', url: '/api/settings', headers: trusted,
        payload: { changes: { notificationScope: { value, baseRevision: revision++ } } },
      })
      expect(response.statusCode).toBe(200)
    }
    const question = (id: string) => ({ ...session(id), status: 'waiting' as const,
      pendingUserInput: { requestId: `${id}-question`, question: 'Where?', choices: [], allowFreeform: true } })
    await runtime.pushService!.setSessionMuted('computer', 'muted', true)
    emit({ type: 'session.upserted', session: question('muted') })
    await scope('oracle')
    emit({ type: 'session.upserted', session: question('oracle-scope') })
    emit({ type: 'error', notify: true, computerId: 'computer', message: 'Hidden health alert' })
    const reply = (id: string) => {
      oracle.emit('event', { type: 'manager.message', message: { id: `${id}-reply`, role: 'assistant', replyTo: id, content: 'Done', createdAt: now } })
      oracle.emit('event', { type: 'manager.message', message: { id, role: 'user', content: 'Status?', state: 'done', createdAt: now } })
    }
    reply('one')
    await vi.waitFor(() => expect(titles()).toEqual(['Oracle replied']))
    const socket = await runtime.app.injectWS('/api/events', { headers: trusted })
    socket.send(JSON.stringify({ type: 'presence', oracleVisible: true }))
    await settled()
    reply('watched')
    // Close before disk persistence can finish: event-time presence must win.
    socket.terminate()
    await settled()
    expect(titles()).toEqual(['Oracle replied'])
    await scope('all')
    emit({ type: 'session.upserted', session: question('visible') })
    emit({ type: 'session.upserted', session: session('finished') })
    emit({ type: 'session.upserted', session: { ...session('finished'), status: 'idle' } })
    emit({ type: 'error', notify: true, computerId: 'computer', message: 'Health alert' })
    await vi.waitFor(() => expect(titles()).toEqual([
      'Oracle replied', 'Action needed · Review visible', 'Finished · Review finished', 'Agentic Remote needs attention',
    ]))
    await scope('off')
    reply('disabled-scope')
    emit({ type: 'session.upserted', session: question('disabled-scope') })
    await settled()
    expect(titles()).toHaveLength(4)

    if (flag === 'on') {
      const records = await list()
      expect(records.find((record) => record.sessionId === 'muted')).toMatchObject({ muted: true })
      expect(records.filter((record) => record.kind === 'oracle.message')).toHaveLength(3)
      expect(records.find((record) => record.title === 'Oracle replied')).toBeDefined()
    }
  })
})
