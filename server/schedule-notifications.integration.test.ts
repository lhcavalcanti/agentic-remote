import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { LaunchReconciliation, PromptAcceptanceReceipt } from '../shared/launch-identity.js'
import type { ScheduleRun } from '../shared/schedules.js'
import { buildApp } from './app.js'
import { PushNotificationService } from './push-notification-service.js'
import { ComputerManager } from './computer-manager.js'
import { NotificationCenterService } from './notification-center-service.js'
import * as managerMemoryRuntime from './manager-structured-memory-runtime.js'
import { ManagerAgent } from './manager-agent.js'
import { JournalRecorder } from './manager-journal.js'
import { ManagerStore } from './manager-store.js'
import { NodeIdentityStore } from './node-identity.js'
import { recordScheduleProvenance } from './schedule-launcher.js'
import { classifyScheduleNotification } from './notification-classifier.js'
import { occurrenceKey, SchedulerStore, SCHEDULE_RUN_LIMIT } from './scheduler-store.js'

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
  vi.useRealTimers()
  await runtime?.app.close()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  await rm(directory, { recursive: true, force: true })
})
async function hub(oracleEnabled = false) {
  if (oracleEnabled) {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER', 'on')
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'off')
    vi.spyOn(ManagerAgent.prototype, 'start').mockResolvedValue()
  }
  runtime = await buildApp({
    dataDirectory: directory, logger: false, ...(!oracleEnabled ? { managerAgent: false as const } : {}),
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
  it.each([false, true])('preserves an unclaimed full-history outcome through startup admission, including failed replay=%s', async (failReplay) => {
    const seedNow = Date.now() - 24 * 60 * 60_000
    const dueAt = new Date(Date.now() - 60_000).toISOString()
    const seed = new SchedulerStore(directory, { now: () => seedNow })
    await seed.initialize()
    const schedule = await seed.create({
      name: 'Fictional retained review', prompt: 'Review the fictional guide.',
      target: { computerId: 'offline-studio', folder: '/fictional/repo', provider: 'copilot' },
      recurrence: { type: 'once', at: dueAt }, timezone: 'UTC', notify: 'always',
    })
    const retained: ScheduleRun[] = Array.from({ length: SCHEDULE_RUN_LIMIT }, (_, index) => ({
      id: `retained-${index}`, scheduleId: schedule.id, launchId: `retained-launch-${index}`,
      computerId: schedule.target.computerId, occurrenceAt: new Date(seedNow + index).toISOString(),
      trigger: 'manual', status: 'failed', endedAt: new Date(seedNow + index).toISOString(),
    }))
    const notifications = retained.map((run) => classifyScheduleNotification(schedule, run, dueAt)[0])
    const state = JSON.parse(await readFile(seed.statePath, 'utf8'))
    state.runs = retained
    state.runSchedules = Object.fromEntries(retained.map((run) => [run.id, schedule]))
    state.occurrences = Object.fromEntries(retained.map((run) =>
      [occurrenceKey(run.scheduleId, run.occurrenceAt), run.id]))
    state.notificationFences = notifications.slice(1).map((notification) => notification.id)
    await writeFile(seed.statePath, JSON.stringify(state))
    const push = new PushNotificationService(directory, sender)
    await push.initialize()
    await push.subscribe({ endpoint: 'https://push.example.test/fictional', keys: { p256dh: 'public', auth: 'auth' } })
    const admission = vi.spyOn(NotificationCenterService.prototype, 'scheduleNotifications')
    if (failReplay) admission.mockRejectedValueOnce(new Error('Synthetic notification admission failure'))

    await hub()
    await runtime.scheduleNotifications!.flush()
    await runtime.notificationCenter!.flush()
    const runs = runtime.scheduler!.store.allRuns()
    expect(runs).toHaveLength(SCHEDULE_RUN_LIMIT)
    expect(runs.some((run) => run.occurrenceAt === dueAt && run.trigger === 'schedule')).toBe(true)
    expect(runs.some((run) => run.id === retained[0].id)).toBe(true)
    expect(runs.some((run) => run.id === retained[1].id)).toBe(false)
    expect((await runtime.notificationCenter!.store.list()).filter((record) => record.id === notifications[0].id))
      .toHaveLength(failReplay ? 0 : 1)
    if (failReplay) expect(sender).not.toHaveBeenCalled()
    else await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
    admission.mockRestore()
    for (let restart = 0; restart < (failReplay ? 2 : 1); restart++) {
      await runtime.app.close()
      await hub()
      await runtime.scheduleNotifications!.flush()
      await runtime.notificationCenter!.flush()
      expect((await runtime.notificationCenter!.store.list()).filter((record) => record.id === notifications[0].id)).toHaveLength(1)
      await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
      expect(runtime.scheduler!.store.allRuns()).toHaveLength(SCHEDULE_RUN_LIMIT)
    }
  })

  it.each(['skip', 'replace'] as const)('delivers %s overlap outcomes from the real dispatcher exactly once', async (overlap) => {
    await hub()
    const scheduler = runtime.scheduler!
    const schedule = await scheduler.store.create({
      name: 'Fictional overlap review', prompt: 'Review the fictional guide.',
      target: { computerId: 'offline-studio', folder: '/fictional/repo', provider: 'copilot' },
      recurrence: { type: 'daily', time: '09:00' }, timezone: 'UTC', notify: 'always', overlap,
    })
    const first = await scheduler.runNow(schedule.id)
    const next = await scheduler.runNow(schedule.id)
    await runtime.scheduleNotifications!.flush()
    await runtime.notificationCenter!.flush()
    const outcome = overlap === 'skip' ? next : first
    const kind = overlap === 'skip' ? 'schedule.run.missed' : 'schedule.run.interrupted'
    expect(scheduler.store.getRun(outcome.id).status).toBe(overlap === 'skip' ? 'missed' : 'stopped')
    expect(await runtime.notificationCenter!.store.list()).toMatchObject([{ kind }])
    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
    await runtime.scheduleNotifications!.start()
    await runtime.notificationCenter!.flush()
    expect(await runtime.notificationCenter!.store.list()).toHaveLength(1)
    expect(sender).toHaveBeenCalledOnce()
  })

  it.each([true, false])('keeps fast clear-replacement alerts suppressed before journal flush with Oracle enabled=%s', async (oracleEnabled) => {
    const identity = new NodeIdentityStore(directory)
    await identity.initialize()
    const registry = new ManagerStore(path.join(directory, 'manager'))
    await registry.initialize()
    const session: ManagedSession = {
      id: 'scheduled-predecessor', computerId: identity.info.id, computerName: 'Fictional Studio',
      title: 'Scheduled review', cwd: '/fictional/repo', status: 'idle', messages: [],
      updatedAt: new Date().toISOString(),
    }
    await recordScheduleProvenance(registry, session, {
      origin: 'schedule', scheduleId: 'retired-schedule', scheduleRunId: 'retired-run', task: 'Review the fictional guide.',
    })
    await hub(oracleEnabled)
    expect(Boolean(runtime.managerAgent)).toBe(oracleEnabled)
    expect(runtime.scheduler!.store.allRuns()).toEqual([])
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const flush = vi.spyOn(JournalRecorder.prototype, 'flush')
    const host = runtime.manager!
    const replacement: ManagedSession = {
      ...session, id: 'fast-replacement', status: 'running',
      messages: [{ id: 'follow-up-root', role: 'user', content: 'Review again', createdAt: session.updatedAt }],
    }
    host.emit('event', {
      type: 'session.removed', computerId: session.computerId, sessionId: session.id, replacedBy: replacement.id,
    })
    host.emit('event', { type: 'session.upserted', session: replacement })
    host.emit('event', { type: 'session.upserted', session: {
      ...replacement, status: 'waiting', pendingPermission: { requestId: 'follow-up-permission', title: 'Allow?', options: [] },
    } })
    host.emit('event', { type: 'session.upserted', session: replacement })
    host.emit('event', { type: 'session.upserted', session: { ...replacement, status: 'idle' } })
    await runtime.notificationCenter!.flush()
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(flush).not.toHaveBeenCalled()
    expect(await runtime.notificationCenter!.store.list()).toEqual([])
    expect(sender).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(500)
    expect(flush).toHaveBeenCalledTimes(oracleEnabled ? 1 : 0)
    await Promise.all(flush.mock.results.map((result) => result.value))
    vi.useRealTimers()
    vi.spyOn(host, 'readSession').mockResolvedValue({ ...replacement, status: 'idle' })
    const detail = await runtime.app.inject({
      url: `/api/computers/${session.computerId}/sessions/${replacement.id}?passive=1`, headers,
    })
    expect(detail.json().session.suppressOrdinaryNotifications).toBe(true)
    expect(await runtime.notificationCenter!.store.list()).toEqual([])
    expect(sender).not.toHaveBeenCalled()
  })

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
    const provenance = { origin: 'schedule', scheduleId: schedule.id, scheduleRunId: runId, scheduleName: schedule.name }
    const detail = await runtime.app.inject({ url: `/api/computers/${computerId}/sessions/${session.id}?passive=1`, headers })
    expect(detail.json().session).toMatchObject({ suppressOrdinaryNotifications: true, provenance })
    const socket = await runtime.app.injectWS('/api/events', { headers })
    const observed: HubEvent[] = []
    socket.on('message', (raw) => observed.push(JSON.parse(String(raw))))
    try {
      host.emit('event', { type: 'session.upserted', session: { ...session } })
      await vi.waitFor(() => expect(observed).toContainEqual(expect.objectContaining({
        type: 'session.upserted', session: expect.objectContaining({ suppressOrdinaryNotifications: true, provenance }),
      })))
    } finally { socket.terminate() }
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
    const replacementDetail = await runtime.app.inject({
      url: `/api/computers/${computerId}/sessions/${replacement.id}?passive=1`, headers,
    })
    expect(replacementDetail.json().session.suppressOrdinaryNotifications).toBe(true)
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
    // Admission alone has no registry origin; notification policy must not invent one.
    expect(list.json().sessions[0].provenance).toBeUndefined()
    const detail = await runtime.app.inject({ url: `/api/computers/${session.computerId}/sessions/${session.id}?passive=1`, headers })
    expect(detail.json().session.suppressOrdinaryNotifications).toBe(true)
    expect(detail.json().session.provenance).toBeUndefined()
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
      await vi.waitFor(() => expect(observed.filter((event) => event.type === 'session.upserted')).toHaveLength(4))
      const upserts = observed.filter((event) => event.type === 'session.upserted')
      expect(upserts.every((event) => event.session.suppressOrdinaryNotifications)).toBe(true)
      for (const event of upserts.slice(0, 3)) {
        expect(event.session.provenance).toBeUndefined()
      }
      expect(upserts[3].session).toMatchObject({ status: 'idle', provenance: { origin: 'discovered' } })
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
