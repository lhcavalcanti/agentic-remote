import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { LaunchReconciliation, PromptAcceptanceReceipt } from '../shared/launch-identity.js'
import { buildApp } from './app.js'
import { PushNotificationService } from './push-notification-service.js'
import { ComputerManager } from './computer-manager.js'
import { NotificationCenterService } from './notification-center-service.js'
import * as managerMemoryRuntime from './manager-structured-memory-runtime.js'

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
  vi.restoreAllMocks()
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
  it('records startup session and offline events exactly once before Oracle initialization finishes', async () => {
    let manager!: ComputerManager
    const initializeManager = ComputerManager.prototype.initialize
    vi.spyOn(ComputerManager.prototype, 'initialize').mockImplementation(async function (this: ComputerManager) {
      await initializeManager.call(this)
      manager = this
    })
    const initializeMemory = managerMemoryRuntime.initializeManagerStructuredMemory
    vi.spyOn(managerMemoryRuntime, 'initializeManagerStructuredMemory').mockImplementation(async (...args) => {
      const memory = await initializeMemory(...args)
      const computer = manager.listComputers()[0]
      const session: ManagedSession = {
        id: 'startup-session', computerId: computer.id, computerName: computer.name,
        cwd: '/fictional/repo', title: 'Startup review', status: 'running', updatedAt: new Date().toISOString(),
        messages: [{ id: 'startup-root', role: 'user', content: 'Review', createdAt: new Date().toISOString() }],
      }
      manager.emit('event', { type: 'session.upserted', session })
      manager.emit('event', { type: 'session.upserted', session: { ...session, status: 'idle' } })
      manager.emit('event', { type: 'computer.updated', computer: { ...computer, online: false } })
      return memory
    })
    const push = new PushNotificationService(directory, sender)
    await push.initialize()
    await push.subscribe({ endpoint: 'https://push.example.test/startup', keys: { p256dh: 'public', auth: 'auth' } })
    const attach = vi.spyOn(push, 'attach')
    const recorded = vi.spyOn(NotificationCenterService.prototype, 'hub')
    runtime = await buildApp({
      dataDirectory: directory, logger: false, managerAgent: false, pushService: push,
      transcriptionService: { initialize: async () => {}, stop: async () => {}, transcribe: vi.fn() },
    })
    await runtime.app.ready()
    await runtime.notificationCenter!.flush()
    expect(await runtime.notificationCenter!.store.list()).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'session.completed', sessionId: 'startup-session' }),
      expect.objectContaining({ kind: 'computer.offline' }),
    ]))
    expect(recorded.mock.calls.filter(([event]) => event.type === 'session.upserted' && event.session.id === 'startup-session')).toHaveLength(2)
    expect(attach).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
  })

  it.each(['never', 'always'] as const)('runs an approved Oracle proposal through the real runner with %s notifications and schedule ownership', async (notify) => {
    await hub()
    const host = runtime.manager!
    const computerId = runtime.identity.info.id
    const session: ManagedSession = {
      id: 'real-runner-session', computerId, computerName: 'Fictional Studio',
      title: 'Untitled', cwd: '/fictional/repo', status: 'idle', messages: [], updatedAt: new Date().toISOString(),
    }
    let launch: LaunchReconciliation | undefined
    let earlyUnbound = false
    vi.spyOn(host, 'listComputers').mockReturnValue([{
      id: computerId, name: session.computerName, online: true, isLocal: true,
      providers: [{ id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsLaunchIdentity: true }],
    }])
    vi.spyOn(host, 'validateSessionDirectory').mockResolvedValue(session.cwd)
    const create = vi.spyOn(host, 'createSession').mockImplementation(async (_computerId, input) => {
      session.launchId = input.launchId
      launch = { launchId: input.launchId!, sessionId: session.id, receipts: [] }
      const intent = runtime.scheduler!.store.allRuns().find((run) => run.launchId === input.launchId)
      expect(intent).toBeDefined()
      earlyUnbound = intent?.sessionId === undefined
      host.emit('event', { type: 'session.upserted', session: { ...session, status: 'waiting',
        pendingPermission: { requestId: 'creation-permission', title: 'Allow folder?', options: [] } } })
      return session
    })
    vi.spyOn(host, 'renameSession').mockImplementation(async (_computerId, _sessionId, input) => {
      session.title = input.title
      return session
    })
    vi.spyOn(host, 'sendMessage').mockImplementation(async (_computerId, _sessionId, input) => {
      const receipt: PromptAcceptanceReceipt = {
        deliveryId: input.deliveryId!, sessionId: session.id, promptId: 'real-runner-root',
        acceptedAt: new Date().toISOString(), state: 'delivered',
      }
      session.promptReceipts = [receipt]
      session.messages = [{ id: receipt.promptId, role: 'user', content: input.content, createdAt: receipt.acceptedAt }]
      session.status = 'running'
      launch!.receipts = [receipt]
      host.emit('event', { type: 'session.upserted', session: { ...session } })
      return session
    })
    vi.spyOn(host, 'readSession').mockImplementation(async () => session)
    vi.spyOn(host, 'reconcileLaunch').mockImplementation(async () => launch)
    vi.spyOn(host, 'listBackgroundTasks').mockResolvedValue({ supported: true, runningCount: 0, tasks: [] })
    const proposed = await runtime.scheduler!.store.propose({ operation: 'create', payload: {
      name: 'Approved fictional review', prompt: 'Review the fictional guide.', notify, enabled: false,
      target: { computerId, folder: session.cwd, provider: 'copilot' }, recurrence: { type: 'daily', time: '09:00' },
    } })
    expect(create).not.toHaveBeenCalled()
    const created = await runtime.app.inject({ method: 'POST', url: `/api/schedules/proposals/${proposed.id}/approve`, headers })
    expect(created.statusCode).toBe(200)
    const schedule = runtime.scheduler!.store.get(created.json().proposal.appliedScheduleId)
    expect(schedule.createdBy).toBe('oracle')
    const runProposal = await runtime.scheduler!.store.propose({
      operation: 'run-now', scheduleId: schedule.id, baseRevision: schedule.revision, payload: {},
    })
    expect(create).not.toHaveBeenCalled()
    const approved = await runtime.app.inject({ method: 'POST', url: `/api/schedules/proposals/${runProposal.id}/approve`, headers })
    expect(approved.statusCode).toBe(200)
    const runId: string = approved.json().proposal.appliedRunId
    await vi.waitFor(() => expect(runtime.scheduler!.store.getRun(runId).rootPromptAcceptance?.promptId).toBe('real-runner-root'))
    expect(earlyUnbound).toBe(true)
    const registry = JSON.parse(await readFile(path.join(directory, 'manager', 'sessions.json'), 'utf8'))
    expect(registry[`${computerId}:${session.id}`]).toMatchObject({ origin: 'schedule', scheduleId: schedule.id, scheduleRunId: runId })
    expect(runtime.managerAgent).toBeUndefined()
    launch!.receipts[0].outcome = 'succeeded'
    session.status = 'idle'
    host.emit('event', { type: 'session.upserted', session: { ...session } })
    await runtime.scheduler!.tick()
    await runtime.scheduleNotifications!.flush()
    await runtime.notificationCenter!.flush()
    const settled = runtime.scheduler!.store.getRun(runId)
    expect(settled).toMatchObject({ status: 'succeeded', rootPromptReceipt: 'real-runner-root',
      rootPromptAcceptance: { outcome: 'succeeded' } })
    const expected = notify === 'never' ? 0 : 1
    expect(await runtime.notificationCenter!.store.list()).toHaveLength(expected)
    await vi.waitFor(() => expect(sender).toHaveBeenCalledTimes(expected))
    if (expected) expect((await runtime.notificationCenter!.store.list())[0].kind).toBe('schedule.run.succeeded')
    expect((await runtime.app.inject({ method: 'POST', url: `/api/schedules/proposals/${runProposal.id}/approve`, headers })).statusCode).toBe(200)
    expect(create).toHaveBeenCalledOnce()
    const archived = await runtime.scheduler!.store.setArchived(schedule.id, schedule.revision, true)
    await runtime.scheduler!.store.delete(schedule.id, archived.revision)
    expect(runtime.scheduler!.store.allRuns()).toEqual([])
    host.emit('event', { type: 'session.removed', computerId, sessionId: session.id, replacedBy: 'replacement-session' })
    const replacement: ManagedSession = {
      ...session, id: 'replacement-session', launchId: undefined, status: 'running',
      messages: [{ id: 'user-follow-up', role: 'user', content: 'Review again', createdAt: new Date().toISOString() }],
    }
    host.emit('event', { type: 'session.upserted', session: replacement })
    host.emit('event', { type: 'session.upserted', session: { ...replacement, status: 'idle' } })
    await runtime.notificationCenter!.flush()
    expect(await runtime.notificationCenter!.store.list()).toHaveLength(expected)
    expect(sender).toHaveBeenCalledTimes(expected)
    vi.mocked(host.readSession).mockResolvedValue(replacement)
    const detail = await runtime.app.inject({
      url: `/api/computers/${computerId}/sessions/${replacement.id}?passive=1`, headers,
    })
    expect(detail.json().session.suppressOrdinaryNotifications).toBe(true)
  })

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
