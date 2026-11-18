import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { lstat, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ManagedSession, PendingPermission } from '../shared/contracts.js'
import type { LaunchReconciliation, PromptAcceptanceReceipt, TerminationAcknowledgement } from '../shared/launch-identity.js'
import type { ScheduleCreate } from '../shared/schedules.js'
import { deliveryUncertaintyFromError } from '../shared/submission-error.js'
import { AgentService, type CopilotClientLike } from './agent-service.js'
import { ComputerManager } from './computer-manager.js'
import type { ComputerRegistry } from './computer-registry.js'
import { JournalRecorder } from './manager-journal.js'
import { ManagerStore } from './manager-store.js'
import type { NodeIdentityStore } from './node-identity.js'
import { RemoteNodeClient } from './remote-node-client.js'
import { SessionScheduleLauncher, scheduleSessionTitle, type ScheduleLauncherHost } from './schedule-launcher.js'
import { ScheduleLaunchRefusedError, SchedulerDispatcher } from './scheduler-dispatcher.js'
import { holdsSlot, SchedulerStore } from './scheduler-store.js'
import type { SessionService } from './session-service.js'
import { SessionStore } from './session-store.js'
import type { ScheduleWorktreeService } from './schedule-worktrees.js'
import { RemoteNodeRequestError, RemoteNodeTransportError } from './remote-node-errors.js'

const directories: string[] = []
const dispatchers: SchedulerDispatcher[] = []
const managers: ComputerManager[] = []
const at = '2026-11-14T17:00:00.000Z'
const providers = [
  { id: 'copilot' as const, name: 'Copilot', available: true, terminalBacked: true, supportsLaunchIdentity: true },
  { id: 'claude' as const, name: 'Claude', available: true, terminalBacked: false, supportsLaunchIdentity: true },
]
function session(change: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id: 'session-one', computerId: 'hub', computerName: 'Fictional studio',
    cwd: '/fictional/repo', title: 'Untitled', status: 'idle', messages: [], isOpen: true, updatedAt: at,
    ...change,
  }
}
const permission: PendingPermission = { requestId: 'p', title: 'Approve command?', kind: 'shell', options: [] }
const folderTrustPermission: PendingPermission = {
  requestId: 'folder-trust', title: 'Trust folder for this session: /fictional/repo',
  kind: 'terminal', choiceCount: 3, options: [
    { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
    { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
  ],
}

afterEach(async () => {
  await Promise.all(dispatchers.splice(0).map((dispatcher) => dispatcher.stop()))
  managers.splice(0).forEach((manager) => manager.stop())
  vi.useRealTimers()
  vi.restoreAllMocks()
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

async function fixture(changes: Partial<ScheduleCreate> = {}, createdBy: 'user' | 'oracle' = 'user') {
  const directory = path.join(process.cwd(), `.schedule-launcher-${randomUUID()}`)
  await mkdir(directory)
  directories.push(directory)
  // The fixture's manual run uses a canonical instant, so the schedule's due cursor starts there; the run itself uses the test clock.
  let setupClock: number | undefined = Date.parse(at)
  const store = new SchedulerStore(directory, { now: () => setupClock ?? Date.now() })
  await store.initialize()
  const registry = new ManagerStore(path.join(directory, 'manager'))
  await registry.initialize()
  const schedule = await store.create({
    name: 'Fictional guide review', prompt: 'Review the fictional guide.',
    target: { computerId: 'hub', folder: '/fictional/repo', provider: 'copilot' },
    recurrence: { type: 'daily', time: '09:00' }, enabled: false, ...changes,
  }, createdBy)
  setupClock = undefined
  const run = (await store.admit(schedule.id, at, 'manual'))!
  const receipt: PromptAcceptanceReceipt = {
    deliveryId: `${run.launchId}:root`, sessionId: 'session-one', promptId: 'root-one',
    acceptedAt: at, state: 'delivered',
  }
  let detail = session()
  let launch: LaunchReconciliation | undefined
  let termination: TerminationAcknowledgement = {
    sessionId: detail.id, outcome: 'stopped', checkedAt: at, scope: 'provider-owned',
  }
  const host: ScheduleLauncherHost = {
    listComputers: () => [{ id: schedule.target.computerId, name: 'Fictional studio', isLocal: true, online: true, providers }],
    validateSessionDirectory: vi.fn(async (_computer, folder) => folder),
    providerRuntimeOptions: vi.fn(async (_computerId: string, provider: 'copilot' | 'claude') => ({
      models: [{
        id: 'fictional-model', name: 'Fictional model', reasoningEfforts: ['high'],
        contextTiers: provider === 'claude' ? ['default'] : ['default', 'long_context'],
      }],
    })) as ScheduleLauncherHost['providerRuntimeOptions'],
    createSession: vi.fn(async (computerId) => {
      detail = session({ computerId, launchId: run.launchId })
      launch = { launchId: run.launchId, sessionId: detail.id, sessionStatus: 'idle', receipts: [] }
      return detail
    }),
    renameSession: vi.fn(async (_computer, _id, input) => { detail = { ...detail, title: input.title }; return detail }),
    readSession: vi.fn(async () => detail),
    sendMessage: vi.fn(async () => {
      detail = { ...detail, promptReceipts: [receipt] }
      launch = { launchId: run.launchId, sessionId: detail.id, sessionStatus: detail.status, receipts: [receipt] }
      return detail
    }),
    reconcileLaunch: vi.fn(async () => launch),
    cancelWithAck: vi.fn(async () => termination),
    cancel: vi.fn(async () => {}),
    replyPermission: vi.fn(async () => detail),
    replyUserInput: vi.fn(async () => detail),
    listBackgroundTasks: vi.fn(async () => ({ supported: true, runningCount: 0, tasks: [] })),
    allocateScheduleWorktree: vi.fn(async (_computerId, input) => ({
      launchId: input.launchId, root: '/allowed/worktrees', repository: '/fictional/repo',
      path: '/allowed/worktrees/run-one', createdAt: at, state: 'ready' as const,
    })),
    readScheduleWorktree: vi.fn(async () => undefined),
    cleanupScheduleWorktree: vi.fn(async () => undefined),
  }
  const runner = new SessionScheduleLauncher(host, store, registry)
  return {
    store, registry, schedule, run, receipt, host, runner, directory,
    setDetail: (change: Partial<ManagedSession>) => { detail = { ...detail, ...change } },
    setLaunch: (value: LaunchReconciliation | undefined) => { launch = value },
    setTermination: (outcome: 'stopped' | 'unknown') => { termination = { ...termination, outcome } },
  }
}

describe('schedule runner', () => {
  it('settles an owner-confirmed deleted session without requiring its trimmed root receipt or removing its worktree', async () => {
    const f = await fixture({ workspace: 'worktree' })
    await f.runner.launch(f.run, f.schedule)
    await f.store.changeRun(f.run.id, { status: 'running', startedAt: at })
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', deleted: true, receipts: [] })
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    expect(f.store.getRun(f.run.id)).toMatchObject({
      status: 'interrupted', error: expect.stringMatching(/deleted/i), worktree: { state: 'deferred' },
    })
    expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
    expect(f.host.cleanupScheduleWorktree).not.toHaveBeenCalled()
    expect(f.host.sendMessage).toHaveBeenCalledOnce()
  })

  it.each(['create-failure', 'restart'] as const)('allows explicit abandonment of an uncertain %s and fences later owner evidence after deletion', async (stage) => {
    const f = await fixture()
    const cause = new Error('SDK creation failed after the create boundary')
    if (stage === 'create-failure') vi.mocked(f.host.createSession).mockRejectedValue(cause)
    else await f.store.changeRun(f.run.id, { status: 'launching', startedAt: new Date().toISOString() })
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id)).toMatchObject({ status: 'launching', outcomeUnknown: true }))
    expect(holdsSlot(f.store.getRun(f.run.id))).toBe(true)
    if (stage === 'create-failure') expect(deliveryUncertaintyFromError(cause)).toBe(true)
    const abandoned = await dispatcher.abandonRun(f.run.id)
    expect(abandoned).toMatchObject({ status: 'interrupted', abandonedAt: expect.any(String), error: expect.stringMatching(/abandon/i) })
    expect(holdsSlot(abandoned)).toBe(false)
    const archived = await f.store.setArchived(f.schedule.id, f.schedule.revision, true)
    await f.store.delete(f.schedule.id, archived.revision)
    const restored = new SchedulerStore(f.directory)
    await restored.initialize()
    expect(restored.isLaunchAbandoned(f.run.launchId)).toBe(true)
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'late-session', receipts: [] })
    const runner = new SessionScheduleLauncher(f.host, restored, f.registry)
    expect(await runner.reconcile(abandoned)).toMatchObject({ state: 'terminated', outcome: 'interrupted', error: expect.stringMatching(/abandon/i) })
    expect(f.host.sendMessage).not.toHaveBeenCalled()
    expect(f.host.createSession).toHaveBeenCalledTimes(stage === 'create-failure' ? 1 : 0)
  })

  it('does not adopt or send a root to a late create response after abandonment and schedule deletion', async () => {
    const f = await fixture()
    let created!: (session: ManagedSession) => void
    vi.mocked(f.host.createSession).mockImplementation(() => new Promise((resolve) => { created = resolve }))
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(created).toBeTypeOf('function'))
    await dispatcher.tick()
    expect(f.store.getRun(f.run.id)).toMatchObject({ outcomeUnknown: true })
    await dispatcher.abandonRun(f.run.id)
    const archived = await f.store.setArchived(f.schedule.id, f.schedule.revision, true)
    await f.store.delete(f.schedule.id, archived.revision)
    created(session({ launchId: f.run.launchId }))
    await new Promise<void>((resolve) => setImmediate(resolve))
    await dispatcher.tick()
    expect(f.host.sendMessage).not.toHaveBeenCalled()
    expect(f.store.allRuns()).toEqual([])
    expect(f.registry.registry()['hub:session-one']).toBeUndefined()
    expect(f.store.isLaunchAbandoned(f.run.launchId)).toBe(true)
  })

  it('rechecks abandonment after the final worktree write before issuing create', async () => {
    const f = await fixture({ workspace: 'worktree' })
    let release!: () => void
    let prepared = false
    const gate = new Promise<void>((resolve) => { release = resolve })
    const change = f.store.changeRun.bind(f.store)
    vi.spyOn(f.store, 'changeRun').mockImplementation(async (id, changes) => {
      const result = await change(id, changes)
      if (changes.worktree?.state === 'ready') { prepared = true; await gate }
      return result
    })
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    try {
      await vi.waitFor(() => expect(prepared).toBe(true))
      await dispatcher.abandonRun(f.run.id)
    } finally { release() }
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.store.getRun(f.run.id)).toMatchObject({ status: 'interrupted', worktree: { state: 'deferred' } })
  })

  it('definitively refuses Claude before creating a session and releases the slot', async () => {
    const f = await fixture()
    const unsupported = { ...f.schedule, target: { ...f.schedule.target, provider: 'claude' as const } }
    await expect(f.runner.launch(f.run, unsupported)).rejects.toBeInstanceOf(ScheduleLaunchRefusedError)
    const dispatcher = new SchedulerDispatcher(f.store, {
      launch: (run) => f.runner.launch(run, unsupported),
      reconcile: (run) => f.runner.reconcile(run), stop: (run) => f.runner.stop(run),
    })
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id)).toMatchObject({ status: 'failed', error: expect.stringMatching(/Claude.*background/i) }))
    expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.host.sendMessage).not.toHaveBeenCalled()
  })

  it.each([
    ['hub', 'copilot', 'long_context'], ['worker', 'copilot', 'long_context'],
  ] as const)('launches on %s with supported %s/%s runtime, ask policies, identity and durable provenance', async (computerId, provider, context) => {
    const f = await fixture({ target: {
      computerId, folder: '/fictional/repo', provider, model: 'fictional-model',
      effort: 'high', context, mode: 'plan',
    } })
    await f.runner.launch(f.run, f.schedule)
    expect(f.host.createSession).toHaveBeenCalledExactlyOnceWith(computerId, {
      cwd: '/fictional/repo', launchId: f.run.launchId, provider, terminalBacked: false,
      allowAllPermissions: false, mode: 'plan', model: 'fictional-model', reasoningEffort: 'high', contextTier: context,
    })
    expect(f.host.replyPermission).not.toHaveBeenCalled()
    expect(f.host.sendMessage).toHaveBeenCalledExactlyOnceWith(computerId, 'session-one', {
      content: f.schedule.prompt, enqueue: true, deliveryId: `${f.run.launchId}:root`,
    })
    expect(f.store.getRun(f.run.id)).toMatchObject({
      sessionId: 'session-one', rootPromptReceipt: f.receipt.promptId, rootPromptAcceptance: f.receipt,
    })
    const reopened = new ManagerStore(path.join(f.directory, 'manager'))
    await reopened.initialize()
    expect(reopened.registry()[`${computerId}:session-one`]).toMatchObject({
      origin: 'schedule', scheduleId: f.schedule.id, scheduleRunId: f.run.id,
    })
    expect(f.host.renameSession).toHaveBeenCalledWith(computerId, 'session-one', {
      title: '⏱ Fictional guide review · Nov 14, 2026, 9:00 AM PST',
    })
  })

  it.each([
    ['ask', 'ask'], ['ask', 'auto-approve'], ['allow-all', 'ask'], ['allow-all', 'auto-approve'],
  ] as const)('passes only the schedule permission %s and folder trust %s to session primitives', async (permissionPolicy, folderTrust) => {
    const f = await fixture({ target: { computerId: 'hub', folder: '/fictional/repo', provider: 'copilot', permissionPolicy, folderTrust } })
    const createSession = vi.fn(async () => ({ created: session(), session: session(), folderTrust }))
    const primitives = {
      createSession,
      deliverPrompt: vi.fn(async () => ({ delivered: session(), receipt: f.receipt, outcome: 'sent' as const })),
      observeSession: vi.fn(async () => session()),
      reconcileLaunch: vi.fn(async () => undefined),
      cancelWithAck: vi.fn(),
      trustFolder: vi.fn(async () => false),
    }
    await new SessionScheduleLauncher(f.host, f.store, f.registry, primitives).launch(f.run, f.schedule)
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({
      permissionPolicy, folderTrust, provenance: { origin: 'schedule', scheduleId: f.schedule.id, scheduleRunId: f.run.id, task: f.schedule.prompt },
    }))
    expect(primitives.deliverPrompt).toHaveBeenCalledWith(expect.objectContaining({ folderTrust }),
      f.schedule.prompt, { deliveryId: `${f.run.launchId}:root` })
  })

  it('uses the owner-allocated worktree without granting extra permissions', async () => {
    const f = await fixture({
      workspace: 'worktree', target: { computerId: 'hub', folder: '/fictional/repo', provider: 'copilot', worktreeRoot: '/allowed/worktrees' },
    })
    await f.runner.launch(f.run, f.schedule)
    expect(f.host.allocateScheduleWorktree).toHaveBeenCalledExactlyOnceWith('hub', {
      launchId: f.run.launchId, folder: '/fictional/repo', root: '/allowed/worktrees',
    })
    expect(f.host.createSession).toHaveBeenCalledWith('hub', expect.objectContaining({
      cwd: '/allowed/worktrees/run-one', allowAllPermissions: false,
    }))
    expect(f.store.getRun(f.run.id).worktree?.state).toBe('ready')
  })

  it.each(['refused', 'retry-expired'] as const)('records deferred worktree cleanup before finalizing a sessionless %s run', async (outcome) => {
    const f = await fixture({ workspace: 'worktree' })
    let now = Date.now()
    const finalized: Array<{ status: string; cleanup: string | undefined }> = []
    f.store.on('changed', (event) => {
      if (event.runId !== f.run.id) return
      const current = f.store.getRun(f.run.id)
      if (['failed', 'missed'].includes(current.status)) {
        finalized.push({ status: current.status, cleanup: current.worktree?.state })
      }
    })
    vi.mocked(f.host.createSession).mockRejectedValue(Object.assign(new Error(
      outcome === 'refused' ? 'Selected model is not available' : 'Runtime models are temporarily unavailable',
    ), { name: 'RuntimeConfigurationError', statusCode: outcome === 'refused' ? 400 : 503, uncertainDelivery: false }))
    const dispatcher = new SchedulerDispatcher(f.store, f.runner, { now: () => now })
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => {
      expect(f.host.allocateScheduleWorktree).toHaveBeenCalledOnce()
      expect(f.host.createSession).toHaveBeenCalledOnce()
      expect(f.store.getRun(f.run.id).status).toBe(outcome === 'refused' ? 'failed' : 'pending')
    })
    if (outcome === 'retry-expired') {
      const pending = f.store.getRun(f.run.id)
      expect(pending.worktree?.state).toBe('ready')
      now = Date.parse(pending.retryUntil!) + 1
      await dispatcher.tick()
    }
    const status = outcome === 'refused' ? 'failed' : 'missed'
    expect(finalized).toEqual([{ status, cleanup: 'deferred' }])
    expect(f.store.getRun(f.run.id)).toMatchObject({
      status, worktree: { state: 'deferred', reason: expect.stringContaining('manual') },
    })
    expect(f.store.getRun(f.run.id).sessionId).toBeUndefined()
    const reopened = new SchedulerStore(f.directory)
    await reopened.initialize()
    expect(reopened.getRun(f.run.id).worktree).toMatchObject({ state: 'deferred', reason: expect.stringContaining('manual') })
    expect(f.host.cleanupScheduleWorktree).not.toHaveBeenCalled()
    expect(f.host.createSession).toHaveBeenCalledOnce()
  })

  it('keeps a never-attempted offline intent absent across restart until the retry window expires', async () => {
    const f = await fixture()
    vi.mocked(f.host.reconcileLaunch!).mockRejectedValue(new RemoteNodeTransportError('Worker', new Error('Disconnected')))
    expect(await f.runner.reconcile(f.run)).toEqual({ state: 'absent' })
    await f.store.changeRun(f.run.id, { retryUntil: at })
    const dispatcher = new SchedulerDispatcher(f.store, f.runner, {
      targetOnline: () => false, now: () => Date.parse(at) + 1,
    })
    dispatchers.push(dispatcher)
    await dispatcher.start()
    expect(f.store.getRun(f.run.id).status).toBe('missed')
    expect(f.host.createSession).not.toHaveBeenCalled()
  })

  it.each([
    ['model', true], ['model', false], ['effort', true], ['effort', false], ['context', true], ['context', false],
  ] as const)('fails an authoritative unsupported %s selection before creation with local=%s', async (field, isLocal) => {
    const f = await fixture({ target: {
      computerId: isLocal ? 'hub' : 'worker', folder: '/fictional/repo', provider: 'copilot',
      model: field === 'model' ? 'missing' : 'fictional-model',
      ...(field === 'effort' ? { effort: 'max' } : {}),
      ...(field === 'context' ? { context: 'long_context' } : {}),
    } })
    const [computer] = f.host.listComputers()
    f.host.listComputers = () => [{ ...computer, isLocal }]
    if (field === 'context') vi.mocked(f.host.providerRuntimeOptions).mockResolvedValue({
      models: [{ id: 'fictional-model', name: 'Fictional model', reasoningEfforts: ['high'], contextTiers: ['default'] }],
    })
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('failed'))
    const reason = field === 'model' ? 'Selected model is not available'
      : field === 'effort' ? 'Selected reasoning effort is not supported by this model'
        : 'Selected context tier is not supported by this model'
    expect(f.store.getRun(f.run.id).error).toBe(reason)
    expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.store.getRun(f.run.id).rootPromptReceipt).toBeUndefined()
  })

  it.each([
    ['local SDK failure', true, new Error('Catalog query failed')],
    ['local timeout', true, Object.assign(new Error('Catalog timed out'), { name: 'TimeoutError' })],
    ['local 503', true, Object.assign(new Error('Catalog unavailable'), { statusCode: 503 })],
    ['local throttling', true, Object.assign(new Error('Catalog throttled'), { status: 429 })],
    ['remote SDK failure', false, new Error('Remote catalog query failed')],
  ] as const)('retries catalog lookup without accepting a prompt twice: %s', async (_label, isLocal, error) => {
    const f = await fixture({ target: {
      computerId: isLocal ? 'hub' : 'worker', folder: '/fictional/repo',
      provider: 'copilot', model: 'fictional-model',
    } })
    const [computer] = f.host.listComputers()
    f.host.listComputers = () => [{ ...computer, isLocal }]
    let now = Date.now()
    const dispatcher = new SchedulerDispatcher(f.store, f.runner, { now: () => now })
    dispatchers.push(dispatcher)
    try {
      vi.mocked(f.host.providerRuntimeOptions).mockRejectedValueOnce(error).mockRejectedValueOnce(error)
      await dispatcher.start()
      await vi.waitFor(() => {
        expect(f.host.providerRuntimeOptions).toHaveBeenCalledTimes(1)
        expect(f.store.getRun(f.run.id).status).toBe('pending')
      })
      const deadline = f.store.getRun(f.run.id).retryUntil
      expect(Date.parse(deadline!)).toBeGreaterThan(now)
      now += 60_000
      await dispatcher.tick()
      await vi.waitFor(() => {
        expect(f.host.providerRuntimeOptions).toHaveBeenCalledTimes(2)
        expect(f.store.getRun(f.run.id).status).toBe('pending')
      })
      expect(f.store.getRun(f.run.id)).toMatchObject({ launchId: f.run.launchId, retryUntil: deadline })
      expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
      expect(f.store.getRun(f.run.id).outcomeUnknown).toBeUndefined()
      expect(f.store.getRun(f.run.id).rootPromptAcceptance).toBeUndefined()
      expect(f.host.createSession).not.toHaveBeenCalled()
      expect(f.host.sendMessage).not.toHaveBeenCalled()
      now += 1
      await dispatcher.tick()
      await vi.waitFor(() => expect(f.store.getRun(f.run.id).rootPromptReceipt).toBe(f.receipt.promptId))
      f.receipt.outcome = 'succeeded'
      await dispatcher.tick()
      expect(f.store.getRun(f.run.id)).toMatchObject({
        status: 'succeeded', launchId: f.run.launchId, rootPromptAcceptance: f.receipt,
      })
      expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
      expect(f.store.allRuns()).toHaveLength(1)
      expect(f.host.providerRuntimeOptions).toHaveBeenCalledTimes(3)
      expect(f.host.createSession).toHaveBeenCalledOnce()
      expect(f.host.sendMessage).toHaveBeenCalledOnce()
    } finally {
      await dispatcher.stop()
    }
  })

  it.each([
    ['statusCode', 403], ['status', 422],
  ] as const)('fails an explicit catalog refusal reported through %s=%s', async (field, status) => {
    const f = await fixture({ target: {
      computerId: 'hub', folder: '/fictional/repo', provider: 'copilot', model: 'fictional-model',
    } })
    vi.mocked(f.host.providerRuntimeOptions).mockRejectedValue(Object.assign(new Error('The owner refused catalog access'), { [field]: status }))
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('failed'))
    expect(f.store.getRun(f.run.id).error).toBe('The owner refused catalog access')
    expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
    expect(f.host.createSession).not.toHaveBeenCalled()
  })

  it('retries transport loss in folder validation rather than refusing the occurrence', async () => {
    const f = await fixture()
    vi.mocked(f.host.validateSessionDirectory).mockRejectedValue(new RemoteNodeTransportError('Worker', new Error('Disconnected')))
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('pending'))
    expect(f.host.createSession).not.toHaveBeenCalled()
  })

  it.each([new TypeError('fetch failed'), Object.assign(new Error('Timed out'), { name: 'TimeoutError' })])(
    'retries raw remote preparation errors without a transport wrapper: %s', async (error) => {
      const f = await fixture()
      const [computer] = f.host.listComputers()
      f.host.listComputers = () => [{ ...computer, isLocal: false }]
      vi.mocked(f.host.validateSessionDirectory).mockRejectedValue(error)
      await expect(f.runner.launch(f.run, f.schedule)).rejects.toThrow('became unavailable')
      vi.mocked(f.host.validateSessionDirectory).mockRejectedValue(Object.assign(new Error('Disallowed folder'), { statusCode: 400 }))
      await expect(f.runner.launch(f.run, f.schedule)).rejects.toBeInstanceOf(ScheduleLaunchRefusedError)
      expect(f.host.createSession).not.toHaveBeenCalled()
    },
  )

  it('settles an owner runtime-validation refusal without reserving an uncertain launch slot', async () => {
    const f = await fixture()
    vi.mocked(f.host.createSession).mockRejectedValue(Object.assign(new Error('Selected model is not available'), {
      name: 'RuntimeConfigurationError', statusCode: 400, uncertainDelivery: false,
    }))
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('failed'))
    expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
  })

  it.each(['copilot'] as const)('fails a definitive %s owner directory check before creation and releases its slot', async (provider) => {
    const f = await fixture({ target: { computerId: 'hub', folder: '/fictional/repo', provider } })
    const folder = path.join(f.directory, 'vanished-folder')
    await mkdir(folder)
    const ownerStore = new SessionStore(path.join(f.directory, 'directory-owner'))
    await ownerStore.initialize()
    const sdkCreate = vi.fn()
    const owner = new AgentService(ownerStore, { createSession: sdkCreate, stop: vi.fn(async () => []) } as unknown as CopilotClientLike)
    const createStored = vi.spyOn(ownerStore, 'create')
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    try {
      vi.mocked(f.host.validateSessionDirectory).mockImplementation(async () => {
        await rm(folder, { recursive: true })
        return folder
      })
      vi.mocked(f.host.createSession).mockImplementation(async (computerId, input) => ({
        ...await owner.createSession(input.cwd, false, false, provider, input.model, input.reasoningEffort,
          input.contextTier, input.mode, input.launchId), computerId, computerName: 'Fictional studio',
      }))
      await dispatcher.start()
      await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('failed'))
      expect(f.store.getRun(f.run.id).error).toContain(`Folder does not exist: ${folder}`)
      expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
      expect(sdkCreate).not.toHaveBeenCalled()
      expect(createStored).not.toHaveBeenCalled()
      expect(ownerStore.reconcileLaunch(f.run.launchId)).toBeUndefined()
      expect(f.host.sendMessage).not.toHaveBeenCalled()
    } finally { await dispatcher.stop(); await owner.stop(); await ownerStore.close() }
  })

  it('settles a certain pre-create refusal even when it has no HTTP status', async () => {
    const f = await fixture()
    vi.mocked(f.host.createSession).mockRejectedValue(Object.assign(new Error('Owner rejected creation before allocating a session'), {
      uncertainDelivery: false,
    }))
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('failed'))
    expect(f.store.getRun(f.run.id).error).toBe('Owner rejected creation before allocating a session')
    expect(holdsSlot(f.store.getRun(f.run.id))).toBe(false)
  })

  it.each([false, true])('keeps an unknown SDK creation result reserved after the owner create boundary with remote=%s', async (remote) => {
    const f = await fixture()
    const ownerStore = new SessionStore(path.join(f.directory, 'uncertain-owner'))
    await ownerStore.initialize()
    const sdkCreate = vi.fn(async () => { throw Object.assign(new Error('SDK creation result is unknown'), { statusCode: 400 }) })
    const owner = new AgentService(ownerStore, { createSession: sdkCreate, stop: vi.fn(async () => []) } as unknown as CopilotClientLike)
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    try {
      vi.mocked(f.host.validateSessionDirectory).mockResolvedValue(f.directory)
      vi.mocked(f.host.createSession).mockImplementation(async (computerId, input) => {
        try {
          return {
            ...await owner.createSession(input.cwd, false, false, 'copilot', undefined, undefined, undefined, input.mode, input.launchId),
            computerId, computerName: 'Fictional studio',
          }
        } catch (error) {
          if (!remote) throw error
          throw new RemoteNodeRequestError((error as Error).message,
            (error as Error & { statusCode: number }).statusCode, undefined, deliveryUncertaintyFromError(error))
        }
      })
      await dispatcher.start()
      await vi.waitFor(() => expect(sdkCreate).toHaveBeenCalledOnce())
      await dispatcher.tick()
      expect(f.store.getRun(f.run.id).status).toBe('launching')
      expect(holdsSlot(f.store.getRun(f.run.id))).toBe(true)
      expect(f.store.getRun(f.run.id).rootPromptAcceptance).toBeUndefined()
      expect(f.host.sendMessage).not.toHaveBeenCalled()
      expect(sdkCreate).toHaveBeenCalledOnce()
    } finally { await dispatcher.stop(); await owner.stop(); await ownerStore.close() }
  })

  it.each(['empty-local', 'transport-local', 'timeout-local', 'empty-remote'] as const)(
    'retries a transient second model refresh within the offline window: %s', async (failure) => {
      const f = await fixture({ target: {
        computerId: 'hub', folder: '/fictional/repo', provider: 'copilot', model: 'fictional-model',
      } })
      const ownerStore = new SessionStore(path.join(f.directory, 'owner'))
      await ownerStore.initialize()
      const models = vi.fn().mockResolvedValueOnce({ models: [{ id: 'fictional-model', name: 'Fictional model' }] })
        .mockImplementation(async () => {
          if (failure === 'transport-local') throw new TypeError('Model transport disconnected')
          if (failure === 'timeout-local') throw Object.assign(new Error('Model refresh timed out'), { name: 'TimeoutError' })
          return { models: [] }
        })
      const sdkCreate = vi.fn()
      const owner = new AgentService(ownerStore, {
        rpc: { models: { list: models } }, createSession: sdkCreate, stop: vi.fn(async () => []),
      } as unknown as CopilotClientLike)
      const remote = failure === 'empty-remote'
      const [computer] = f.host.listComputers()
      f.host.listComputers = () => [{ ...computer, isLocal: !remote }]
      vi.mocked(f.host.validateSessionDirectory).mockResolvedValue(f.directory)
      vi.mocked(f.host.providerRuntimeOptions).mockImplementation((_computer, provider) => owner.providerRuntimeOptions(provider))
      vi.mocked(f.host.createSession).mockImplementation(async (computerId, input) => {
        try {
          const created = await owner.createSession(input.cwd, false, false, 'copilot', input.model,
            input.reasoningEffort, input.contextTier, input.mode, input.launchId)
          return { ...created, computerId, computerName: computer.name }
        } catch (error) {
          if (!remote) throw error
          throw new RemoteNodeRequestError((error as Error).message,
            (error as Error & { statusCode: number }).statusCode, undefined, deliveryUncertaintyFromError(error))
        }
      })
      let now = Date.now()
      const dispatcher = new SchedulerDispatcher(f.store, f.runner, { now: () => now })
      dispatchers.push(dispatcher)
      try {
        await dispatcher.start()
        await vi.waitFor(() => {
          expect(models).toHaveBeenCalledTimes(2)
          expect(f.store.getRun(f.run.id).status).toBe('pending')
        })
        const pending = f.store.getRun(f.run.id)
        expect(pending.retryUntil).toBeDefined()
        expect(holdsSlot(pending)).toBe(false)
        expect(ownerStore.reconcileLaunch(f.run.launchId)).toBeUndefined()
        expect(sdkCreate).not.toHaveBeenCalled()
        now = Date.parse(pending.retryUntil!) + 1
        await dispatcher.tick()
        expect(f.store.getRun(f.run.id).status).toBe('missed')
        expect(models).toHaveBeenCalledTimes(2)
      } finally {
        await dispatcher.stop()
        await owner.stop()
        await ownerStore.close()
      }
    },
  )

  it('does not retry a 503 creation response without definitive prelaunch evidence', async () => {
    const f = await fixture()
    const error = new RemoteNodeRequestError('Creation response was lost', 503)
    vi.mocked(f.host.createSession).mockRejectedValue(error)
    await expect(f.runner.launch(f.run, f.schedule)).rejects.toBe(error)
  })

  it('refuses Claude even when only a default model and explicit effort are requested', async () => {
    const f = await fixture()
    await expect(f.runner.launch(f.run, { ...f.schedule, target: { ...f.schedule.target, provider: 'claude', effort: 'high' } }))
      .rejects.toBeInstanceOf(ScheduleLaunchRefusedError)
    expect(f.host.createSession).not.toHaveBeenCalled()
  })

  it.each([false, true])('rejects Claude before querying runtime metadata with explicit model=%s', async (explicitModel) => {
    const f = await fixture()
    await expect(f.runner.launch(f.run, { ...f.schedule, target: {
      ...f.schedule.target, provider: 'claude', context: 'long_context',
      ...(explicitModel ? { model: 'fictional-model' } : {}),
    } })).rejects.toBeInstanceOf(ScheduleLaunchRefusedError)
    expect(f.host.providerRuntimeOptions).not.toHaveBeenCalled()
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.host.allocateScheduleWorktree).not.toHaveBeenCalled()
  })

  it('persists allocation intent before the RPC and reconciles a lost response into deferred ownership', async () => {
    const f = await fixture({ workspace: 'worktree' })
    const allocate = vi.mocked(f.host.allocateScheduleWorktree).getMockImplementation()!
    vi.mocked(f.host.allocateScheduleWorktree).mockImplementation(async (...args) => {
      expect(f.store.getRun(f.run.id).worktreeIntent).toMatchObject({ launchId: f.run.launchId, folder: f.schedule.target.folder })
      const owned = await allocate(...args)
      vi.mocked(f.host.readScheduleWorktree).mockResolvedValue(owned)
      throw new RemoteNodeTransportError('Worker', new Error('Response lost'))
    })
    await expect(f.runner.launch(f.run, f.schedule)).rejects.toThrow('became unavailable')
    const reopened = new SchedulerStore(f.directory)
    await reopened.initialize()
    expect(reopened.getRun(f.run.id)).toMatchObject({
      worktreeIntent: { launchId: f.run.launchId }, worktree: { state: 'deferred' },
    })
    expect(f.host.createSession).not.toHaveBeenCalled()
  })

  it('does not delete an open completed session worktree when a follow-up starts during reconciliation', async () => {
    const f = await fixture({ workspace: 'worktree' })
    await f.runner.launch(f.run, f.schedule)
    f.receipt.outcome = 'succeeded'
    vi.mocked(f.host.listBackgroundTasks).mockImplementation(async () => {
      f.setDetail({ status: 'running', updatedAt: new Date(Date.parse(at) + 60_000).toISOString() })
      return { supported: true, runningCount: 0, tasks: [] }
    })
    expect(await f.runner.reconcile(f.store.getRun(f.run.id))).toMatchObject({
      state: 'terminated', outcome: 'succeeded', worktree: { state: 'deferred', reason: expect.stringContaining('remains open') },
    })
    expect(f.host.cleanupScheduleWorktree).not.toHaveBeenCalled()
  })
  it.each(['succeeded', 'failed', 'stopped'] as const)('maps provider root %s only after provider-owned work is quiet', async (outcome) => {
    const f = await fixture()
    await f.runner.launch(f.run, f.schedule)
    f.receipt.outcome = outcome
    f.setDetail({ messages: [{ id: 'a', role: 'assistant', content: '  Display-only\nfinal summary. ', createdAt: at }] })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'terminated', outcome, summary: 'Display-only final summary.' })
    expect(f.host.cancel).not.toHaveBeenCalled()
  })

  it('does not count idle before delivery, accepted/unknown, or another root as success', async () => {
    const f = await fixture()
    await f.runner.launch(f.run, f.schedule)
    for (const outcome of [undefined, 'unknown'] as const) {
      f.receipt.outcome = outcome
      expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'running' })
    }
    f.setLaunch({
      launchId: f.run.launchId, sessionId: 'session-one', sessionStatus: 'idle',
      receipts: [{ ...f.receipt, deliveryId: 'unrelated-root', outcome: 'succeeded' }],
    })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'running', rootPromptReceipt: 'root-one' })
    expect(f.host.listBackgroundTasks).not.toHaveBeenCalled()
  })

  it('requires an exact terminal root and no queued, foreground, or background work', async () => {
    const f = await fixture()
    await f.runner.launch(f.run, f.schedule)
    f.receipt.outcome = 'succeeded'
    for (const detail of [{ status: 'running' }, { queuedCount: 1 }, { terminalQueueDispatchPending: true }] as Partial<ManagedSession>[]) {
      f.setDetail({ status: 'idle', queuedCount: 0, terminalQueueDispatchPending: false, ...detail })
      expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'running' })
    }
    f.setDetail({ terminalQueueDispatchPending: false })
    vi.mocked(f.host.listBackgroundTasks).mockResolvedValue({ supported: false, runningCount: 0, tasks: [] })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'running' })
    vi.mocked(f.host.listBackgroundTasks).mockResolvedValue({ supported: true, runningCount: 1, tasks: [] })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'running' })
  })

  it.each(['permission', 'question'])('maps an unanswered %s to needs-input without answering it', async (kind) => {
    const f = await fixture()
    await f.runner.launch(f.run, f.schedule)
    f.setDetail(kind === 'permission' ? { pendingPermission: permission } : {
      pendingUserInput: { requestId: 'q', question: 'Choose?', choices: [], allowFreeform: true },
    })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'needs-input' })
    expect(f.host.replyPermission).not.toHaveBeenCalled()
    expect(f.host.replyUserInput).not.toHaveBeenCalled()
  })

  it.each([
    [false, true, 'running'], [true, true, 'terminated'],
    [false, false, 'needs-input'], [true, false, 'needs-input'],
  ] as const)('gates recovered questions only while actionable (accepted=%s stale=%s)', async (accepted, stale, state) => {
    const f = await fixture()
    f.setLaunch({
      launchId: f.run.launchId, sessionId: 'session-one',
      receipts: accepted ? [{ ...f.receipt, outcome: 'succeeded' }] : [],
    })
    f.setDetail({
      status: 'idle', pendingUserInput: { requestId: 'recovered-question', question: 'Choose?', choices: [], allowFreeform: true, stale },
    })
    const result = await f.runner.reconcile(f.run)
    expect(result.state).toBe(state)
    if (accepted && stale) expect(result.outcome).toBe('succeeded')
    expect(f.host.sendMessage).toHaveBeenCalledTimes(!accepted && stale ? 1 : 0)
    expect(f.host.replyUserInput).not.toHaveBeenCalled()
    expect(f.host.replyPermission).not.toHaveBeenCalled()
  })

  it('retains a pre-delivery folder-trust question as needs-input instead of inferring success from idle', async () => {
    const f = await fixture()
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', receipts: [], sessionStatus: 'idle' })
    f.setDetail({ pendingPermission: permission })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'needs-input' })
    expect(f.host.sendMessage).not.toHaveBeenCalled()
    expect(f.host.replyPermission).not.toHaveBeenCalled()
    f.setDetail({ pendingPermission: undefined })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'running' })
    expect(f.host.sendMessage).toHaveBeenCalledTimes(1)
  })

  it.each([false, true])('applies accepted auto folder trust during recovery with an accepted root=%s', async (accepted) => {
    const f = await fixture({ target: {
      computerId: 'hub', folder: '/fictional/repo', provider: 'copilot', folderTrust: 'auto-approve',
    } })
    await f.store.changeRun(f.run.id, { status: 'launching', startedAt: at })
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', receipts: accepted ? [f.receipt] : [] })
    f.setDetail({ status: 'waiting', pendingPermission: folderTrustPermission })
    vi.mocked(f.host.replyPermission).mockImplementation(async () => {
      f.setDetail({ status: accepted ? 'running' : 'idle', pendingPermission: undefined })
      return session()
    })
    if (accepted) await f.store.update(f.schedule.id, { revision: 1, target: { ...f.schedule.target, folderTrust: 'ask' } })
    expect(await f.runner.reconcile(f.store.getRun(f.run.id))).toMatchObject({
      state: 'running', rootPromptReceipt: f.receipt.promptId,
    })
    expect(f.host.replyPermission).toHaveBeenCalledExactlyOnceWith('hub', 'session-one', 'folder-trust', { optionId: 'terminal:allow' })
    expect(f.host.sendMessage).toHaveBeenCalledTimes(accepted ? 0 : 1)
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.host.replyUserInput).not.toHaveBeenCalled()
  })

  it.each([
    ['ask', folderTrustPermission],
    ['auto-approve', { ...folderTrustPermission, title: 'Trust folder for this session: /other/folder' }],
    ['auto-approve', permission],
  ] as const)('leaves unapproved or non-folder recovery permissions pending under %s', async (folderTrust, pendingPermission) => {
    const f = await fixture({ target: { computerId: 'hub', folder: '/fictional/repo', provider: 'copilot', folderTrust } })
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', receipts: [] })
    f.setDetail({ status: 'waiting', pendingPermission })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'needs-input' })
    expect(f.host.replyPermission).not.toHaveBeenCalled()
    expect(f.host.sendMessage).not.toHaveBeenCalled()
  })

  it('reattaches after restart and resumes only idempotent root acceptance after a creation-only crash', async () => {
    const f = await fixture()
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', receipts: [] })
    await f.store.changeRun(f.run.id, { status: 'launching', startedAt: at })
    const reopened = new SchedulerStore(f.directory)
    await reopened.initialize()
    const restarted = new SessionScheduleLauncher(f.host, reopened, f.registry)
    expect(await restarted.reconcile(reopened.getRun(f.run.id))).toMatchObject({
      state: 'running', sessionId: 'session-one', rootPromptAcceptance: f.receipt,
    })
    await restarted.reconcile({ ...f.run, status: 'running' })
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.host.sendMessage).toHaveBeenCalledTimes(1)
    expect(f.host.reconcileLaunch).toHaveBeenCalledWith('hub', f.run.launchId)
  })

  it.each(['creation', 'acceptance'])('reconciles a lost %s response without repeating session creation or accepted delivery', async (phase) => {
    const f = await fixture()
    if (phase === 'creation') {
      const create = vi.mocked(f.host.createSession).getMockImplementation()!
      vi.mocked(f.host.createSession).mockImplementationOnce(async (...args) => {
        await create(...args)
        throw new Error('Creation response was lost')
      })
    } else {
      const send = vi.mocked(f.host.sendMessage).getMockImplementation()!
      vi.mocked(f.host.sendMessage).mockImplementationOnce(async (...args) => {
        await send(...args)
        throw new Error('Acceptance response was lost')
      })
    }
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).rootPromptReceipt).toBe(f.receipt.promptId))
    await dispatcher.tick()
    expect(f.host.createSession).toHaveBeenCalledTimes(1)
    expect(f.host.sendMessage).toHaveBeenCalledTimes(1)
    expect(f.store.getRun(f.run.id).status).toBe('running')
  })

  it('does not reaccept a root the run already remembers when owner receipt evidence disappears', async () => {
    const f = await fixture()
    await f.runner.launch(f.run, f.schedule)
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', receipts: [] })
    expect(await f.runner.reconcile(f.store.getRun(f.run.id))).toMatchObject({
      state: 'unknown', error: expect.stringContaining('no longer reports the accepted root'),
    })
    expect(f.host.sendMessage).toHaveBeenCalledTimes(1)
    expect(f.host.createSession).toHaveBeenCalledTimes(1)
  })

  it('retains uncertain and offline launches but settles confirmed deletion without relaunching', async () => {
    const f = await fixture()
    expect(await f.runner.reconcile(f.run)).toEqual({ state: 'absent' })
    expect(await f.runner.reconcile({ ...f.run, status: 'launching' })).toEqual({ state: 'unknown' })
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', deleted: true, receipts: [] })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'terminated', outcome: 'interrupted' })
    vi.mocked(f.host.reconcileLaunch!).mockRejectedValue(new Error('Offline'))
    expect(await f.runner.reconcile({ ...f.run, status: 'launching', startedAt: at }))
      .toMatchObject({ state: 'unknown', error: expect.stringContaining('slot remains reserved') })
    expect(f.host.createSession).not.toHaveBeenCalled()
  })

  it('never sends a late root into a stopping launch', async () => {
    const f = await fixture()
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', stopping: true, receipts: [] })
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'stopping' })
    expect(f.host.sendMessage).not.toHaveBeenCalled()
  })

  it.each(['stopped', 'unknown'] as const)('keeps max-runtime slots until termination acknowledgement is %s', async (outcome) => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    vi.setSystemTime(new Date(at))
    const f = await fixture({ maxRuntimeMin: 5, workspace: 'worktree' })
    // The fixture's admitted intent also exercises restart reconciliation.
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.host.sendMessage).toHaveBeenCalledTimes(1))
    await dispatcher.tick()
    f.setTermination(outcome)
    vi.setSystemTime(new Date(Date.parse(at) + 5 * 60_000))
    await dispatcher.tick()
    const current = f.store.getRun(f.run.id)
    expect(current.status).toBe(outcome === 'stopped' ? 'stopped' : 'stopping')
    expect(holdsSlot(current)).toBe(outcome === 'unknown')
    expect(f.host.cancelWithAck).toHaveBeenCalledWith('hub', 'session-one', undefined)
    expect(f.host.cancel).not.toHaveBeenCalled()
    if (outcome === 'unknown') expect(f.host.cleanupScheduleWorktree).not.toHaveBeenCalled()
  })

  it('keeps a replacement pending until the old launch has an acknowledged stop', async () => {
    const f = await fixture({ overlap: 'replace' })
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.host.sendMessage).toHaveBeenCalledTimes(1))
    await dispatcher.tick()
    f.setTermination('unknown')
    const replacement = await dispatcher.runNow(f.schedule.id)
    await dispatcher.tick()
    expect(f.store.getRun(f.run.id).status).toBe('stopping')
    expect(f.store.getRun(replacement.id).status).toBe('pending')
    expect(f.host.createSession).toHaveBeenCalledTimes(1)
    expect(f.host.cancelWithAck).toHaveBeenCalled()
    expect(f.host.cancel).not.toHaveBeenCalled()
  })

  it('fails old-node capability and invalid roots explicitly before any session side effects', async () => {
    const f = await fixture()
    f.host.listComputers = () => [{ id: 'hub', name: 'Old computer', online: true, isLocal: false, providers: [{ ...providers[0], supportsLaunchIdentity: false }] }]
    await expect(f.runner.launch(f.run, f.schedule)).rejects.toThrow('Update this computer')
    expect(await f.runner.reconcile(f.run)).toMatchObject({ state: 'terminated', outcome: 'failed', error: expect.stringContaining('Update this computer') })
    expect(f.host.createSession).not.toHaveBeenCalled()
    f.host.listComputers = () => [{ id: 'hub', name: 'Updated', online: true, isLocal: true, providers }]
    vi.mocked(f.host.validateSessionDirectory).mockRejectedValue(new Error('Folder is outside allowed roots'))
    await expect(f.runner.launch(f.run, f.schedule)).rejects.toBeInstanceOf(ScheduleLaunchRefusedError)
    expect(f.host.createSession).not.toHaveBeenCalled()
  })

  it('fails unsupported worktree computers explicitly rather than launching a checkout fallback', async () => {
    const f = await fixture({ workspace: 'worktree' })
    vi.mocked(f.host.allocateScheduleWorktree).mockRejectedValue(new Error('Update this computer to run schedules in worktrees.'))
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('failed'))
    expect(f.store.getRun(f.run.id).error).toContain('Update this computer')
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.host.sendMessage).not.toHaveBeenCalled()
  })

  it('settles a stop requested during a definitive pre-creation refusal without launching anything', async () => {
    const f = await fixture()
    let refuse!: (error: Error) => void
    const pending = new Promise<string>((_resolve, reject) => { refuse = reject })
    vi.mocked(f.host.validateSessionDirectory).mockReturnValue(pending)
    const dispatcher = new SchedulerDispatcher(f.store, f.runner)
    dispatchers.push(dispatcher)
    await dispatcher.start()
    await vi.waitFor(() => expect(f.host.validateSessionDirectory).toHaveBeenCalled())
    expect((await dispatcher.stopRun(f.run.id)).status).toBe('stopping')
    refuse(new Error('Workspace refused before creation'))
    await vi.waitFor(() => expect(f.store.getRun(f.run.id).status).toBe('stopped'))
    expect(f.host.createSession).not.toHaveBeenCalled()
    expect(f.host.cancelWithAck).not.toHaveBeenCalled()
  })

  it('records deferred worktree cleanup instead of removing dirty/unpushed work', async () => {
    const f = await fixture({ workspace: 'worktree' })
    await f.runner.launch(f.run, f.schedule)
    f.receipt.outcome = 'succeeded'
    vi.mocked(f.host.cleanupScheduleWorktree).mockResolvedValue({
      ...f.store.getRun(f.run.id).worktree!, state: 'deferred', reason: 'Unpushed commits remain',
    })
    expect(await f.runner.reconcile(f.store.getRun(f.run.id))).toMatchObject({
      state: 'terminated', outcome: 'succeeded', worktree: { state: 'deferred', reason: expect.stringContaining('remains open') },
    })
  })

  it.each(['missing-record', 'offline'])('records cleanup as deferred on %s evidence, including stale callers', async (failure) => {
    const f = await fixture({ workspace: 'worktree' })
    await f.runner.launch(f.run, f.schedule)
    f.receipt.outcome = 'succeeded'
    if (failure === 'offline') vi.mocked(f.host.cleanupScheduleWorktree).mockRejectedValue(new Error('Offline'))
    expect(await f.runner.reconcile(f.run)).toMatchObject({
      state: 'terminated', outcome: 'succeeded', worktree: { state: 'deferred', reason: expect.stringContaining('manual review') },
    })
  })

  it('does not trust mismatched root, session or termination evidence', async () => {
    const f = await fixture()
    await f.runner.launch(f.run, f.schedule)
    const current = f.store.getRun(f.run.id)
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', receipts: [{ ...f.receipt, promptId: 'other-prompt', outcome: 'succeeded' }] })
    expect(await f.runner.reconcile(current)).toMatchObject({ state: 'unknown', error: 'Mismatched root-prompt evidence' })
    f.setLaunch({ launchId: f.run.launchId, sessionId: 'session-one', receipts: [f.receipt] })
    f.setDetail({ id: 'unrelated-session' })
    expect(await f.runner.reconcile(current)).toMatchObject({ state: 'unknown', error: 'Mismatched session evidence' })
    vi.mocked(f.host.cancelWithAck!).mockResolvedValue({
      sessionId: 'other-session', outcome: 'stopped', checkedAt: at, scope: 'provider-owned',
    })
    expect(await f.runner.stop(current)).toMatchObject({ outcome: 'unknown' })
  })

  it('preserves schedule ownership across reload, journal reconciliation and replacement; Oracle cannot adopt it', async () => {
    const f = await fixture({}, 'oracle')
    expect(f.schedule.createdBy).toBe('oracle')
    await f.runner.launch(f.run, f.schedule)
    const recorder = new JournalRecorder(f.registry)
    try {
      await recorder.reconcile([session({ id: 'session-one' })], ['hub'])
      expect(recorder.managedSessions()).toEqual([])
      expect((await lstat(f.registry.directory)).mode & 0o777).toBe(0o700)
      expect((await lstat(path.join(f.registry.directory, 'sessions.json'))).mode & 0o777).toBe(0o600)
      await expect(recorder.markManaged(session(), 'Adopt this')).rejects.toThrow('not owned by Oracle')
      recorder.handle({ type: 'session.removed', computerId: 'hub', sessionId: 'session-one', replacedBy: 'replacement' })
      await recorder.flush()
      expect(f.registry.registry()['hub:replacement']).toMatchObject({ origin: 'schedule', scheduleId: f.schedule.id })
      expect(recorder.managedSessions()).toEqual([])
    } finally { await recorder.stop() }
  })

  it('keeps schedule titles within rename limits while retaining the timezone date', async () => {
    const f = await fixture({ name: 'a'.repeat(200), timezone: 'Asia/Tokyo' })
    const title = scheduleSessionTitle(f.schedule, at)
    expect(title.length).toBeLessThanOrEqual(100)
    expect(title).toContain('Nov 15, 2026, 2:00 AM GMT+9')
  })
})

describe('schedule owning-computer transport', () => {
  it.each([
    ['hub', 'checkout'], ['worker', 'checkout'], ['hub', 'worktree'], ['worker', 'worktree'],
  ] as const)('routes identified sessions and %s/%s workspace to its owner only', async (computerId, workspace) => {
    const f = await fixture({ workspace, target: { computerId, folder: '/fictional/repo', provider: 'copilot' } })
    vi.spyOn(RemoteNodeClient.prototype, 'connect').mockImplementation(() => {})
    vi.spyOn(RemoteNodeClient.prototype, 'stop').mockImplementation(() => {})
    vi.spyOn(RemoteNodeClient.prototype, 'online', 'get').mockReturnValue(true)
    vi.spyOn(RemoteNodeClient.prototype, 'providers', 'get').mockReturnValue(providers)
    vi.spyOn(RemoteNodeClient.prototype, 'getInfo').mockRejectedValue(new Error('No background discovery'))
    const worktree = {
      launchId: f.run.launchId, root: '/allowed/worktrees', repository: '/fictional/repo',
      path: '/allowed/worktrees/run-one', createdAt: at, state: 'ready' as const,
    }
    const folder = workspace === 'worktree' ? worktree.path : '/fictional/repo'
    const created = session({ computerId, cwd: folder })
    const delivered = session({ computerId, promptReceipts: [f.receipt] })
    const remoteCreate = vi.spyOn(RemoteNodeClient.prototype, 'createSession').mockResolvedValue(created)
    vi.spyOn(RemoteNodeClient.prototype, 'renameSession').mockResolvedValue(created)
    vi.spyOn(RemoteNodeClient.prototype, 'getSession').mockResolvedValue(created)
    vi.spyOn(RemoteNodeClient.prototype, 'validateSessionDirectory').mockResolvedValue('/fictional/repo')
    const remoteSend = vi.spyOn(RemoteNodeClient.prototype, 'sendMessage').mockResolvedValue(delivered)
    const remoteAllocate = vi.spyOn(RemoteNodeClient.prototype, 'allocateScheduleWorktree').mockResolvedValue(worktree)
    const localAllocate = vi.fn(async () => worktree)
    const localCreate = vi.fn(async () => created)
    const localSend = vi.fn(async () => delivered)
    const manager = new ComputerManager(
      Object.assign(new EventEmitter(), {
        providers: () => providers, createSession: localCreate, renameSession: async () => created,
        getSession: () => created,
        sendMessage: localSend, validateSessionDirectory: async () => '/fictional/repo',
      }) as unknown as SessionService,
      { info: { id: 'hub', name: 'Fictional studio', version: 'fixture' } } as NodeIdentityStore,
      {
        initialize: async () => {}, list: () => [{ id: 'worker', name: 'Worker', baseUrl: 'http://worker.test', token: 'fictional-token' }],
      } as unknown as ComputerRegistry,
      { allocate: localAllocate } as unknown as ScheduleWorktreeService,
    )
    await manager.initialize()
    managers.push(manager)
    await new SessionScheduleLauncher(manager, f.store, f.registry).launch(f.run, f.schedule)
    expect(computerId === 'hub' ? localCreate : remoteCreate).toHaveBeenCalledTimes(1)
    expect(computerId === 'hub' ? remoteCreate : localCreate).not.toHaveBeenCalled()
    if (computerId === 'hub') {
      expect(localSend).toHaveBeenCalledWith('session-one', f.schedule.prompt, true, undefined, undefined, `${f.run.launchId}:root`)
      expect(localCreate).toHaveBeenCalledWith(folder, false, false, 'copilot',
        undefined, undefined, undefined, 'autopilot', f.run.launchId)
    } else {
      expect(remoteSend).toHaveBeenCalledWith('session-one', {
        content: f.schedule.prompt, enqueue: true, deliveryId: `${f.run.launchId}:root`,
      })
      expect(remoteCreate).toHaveBeenCalledWith(expect.objectContaining({ allowAllPermissions: false, launchId: f.run.launchId }))
    }
    if (workspace === 'worktree') {
      expect(computerId === 'hub' ? localAllocate : remoteAllocate).toHaveBeenCalledWith({
        launchId: f.run.launchId, folder: '/fictional/repo', root: undefined,
      })
      expect(computerId === 'hub' ? remoteAllocate : localAllocate).not.toHaveBeenCalled()
    } else {
      expect(localAllocate).not.toHaveBeenCalled()
      expect(remoteAllocate).not.toHaveBeenCalled()
    }
    expect(f.registry.registry()[`${computerId}:session-one`]?.origin).toBe('schedule')
  })
})
