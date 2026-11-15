import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Schedule, ScheduleRun } from '../shared/schedules.js'
import type { ManagedSession } from '../shared/contracts.js'
import type { LaunchReconciliation, PromptAcceptanceReceipt } from '../shared/launch-identity.js'
import { buildApp } from './app.js'
import { ManagerStore } from './manager-store.js'
import { createStartupPhases, type StartupPhaseRecord } from './startup-phases.js'
import type { ScheduleReconciliation } from './scheduler-dispatcher.js'

const headers = { host: 'localhost', origin: 'http://localhost' }
const input = () => ({
  name: 'Fictional review', prompt: 'Review the fictional guide.',
  target: { computerId: 'offline-studio', folder: '/fictional/repo', provider: 'copilot' },
  recurrence: { type: 'daily', time: '09:00' },
})
let runtime: Awaited<ReturnType<typeof buildApp>>
const directories: string[] = []
let directory: string
let records: StartupPhaseRecord[]
const launcher = {
  launch: vi.fn(async () => {}),
  reconcile: vi.fn(async (): Promise<ScheduleReconciliation> => ({ state: 'running', sessionId: 'fictional-session' })),
  stop: vi.fn(async () => ({ outcome: 'stopped' as const })),
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', 'on')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', 'off')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'off')
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  records = []
  vi.clearAllMocks()
})
afterEach(async () => {
  await runtime?.app.close()
  vi.unstubAllEnvs()
  await Promise.all(directories.splice(0).map((value) => rm(value, { recursive: true, force: true })))
})

async function app(role: 'hub' | 'node' = 'hub', realRunner = false) {
  directory = path.join(process.cwd(), `.scheduler-routes-${randomUUID()}`)
  directories.push(directory)
  await mkdir(directory)
  runtime = await buildApp({
    dataDirectory: directory, role, logger: false, managerAgent: false,
    ...(!realRunner ? { scheduleLauncher: launcher } : {}),
    startupPhases: createStartupPhases({ write: (line) => records.push(JSON.parse(line)) }),
    transcriptionService: { initialize: async () => {}, stop: async () => {}, transcribe: vi.fn() },
  })
  await runtime.app.ready()
  return runtime.app
}

describe('scheduler hub API', () => {
  it('installs the real runner with Oracle off and records root receipts and schedule provenance', async () => {
    const server = await app('hub', true)
    const computerId = runtime.identity.info.id
    let launch: LaunchReconciliation | undefined
    const detail: ManagedSession = {
      computerId, computerName: 'Fictional studio', id: 'fictional-scheduled-session',
      cwd: '/fictional/repo', title: 'Untitled', status: 'idle', isOpen: true, messages: [],
      updatedAt: new Date().toISOString(),
    }
    const host = runtime.manager!
    vi.spyOn(host, 'listComputers').mockReturnValue([{
      id: computerId, name: detail.computerName, online: true, isLocal: true,
      providers: [{ id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsLaunchIdentity: true }],
    }])
    vi.spyOn(host, 'validateSessionDirectory').mockResolvedValue(detail.cwd)
    const create = vi.spyOn(host, 'createSession').mockImplementation(async (_id, input) => {
      detail.launchId = input.launchId
      launch = { launchId: input.launchId!, sessionId: detail.id, receipts: [] }
      return detail
    })
    vi.spyOn(host, 'renameSession').mockImplementation(async (_computer, _id, input) => {
      detail.title = input.title
      return detail
    })
    vi.spyOn(host, 'sendMessage').mockImplementation(async (_computer, _session, input) => {
      const receipt: PromptAcceptanceReceipt = {
        deliveryId: input.deliveryId!, sessionId: detail.id, promptId: 'fictional-root',
        acceptedAt: new Date().toISOString(), state: 'delivered',
      }
      detail.promptReceipts = [receipt]
      launch!.receipts = [receipt]
      return detail
    })
    vi.spyOn(host, 'readSession').mockResolvedValue(detail)
    vi.spyOn(host, 'reconcileLaunch').mockImplementation(async () => launch)
    vi.spyOn(host, 'listBackgroundTasks').mockResolvedValue({ supported: true, runningCount: 0, tasks: [] })
    const schedule: Schedule = (await server.inject({ method: 'POST', url: '/api/schedules', headers,
      payload: { ...input(), enabled: false, target: { ...input().target, computerId } },
    })).json().schedule
    const run: ScheduleRun = (await server.inject({ method: 'POST', url: `/api/schedules/${schedule.id}/run`, headers })).json().run
    await vi.waitFor(() => expect(runtime.scheduler!.store.getRun(run.id).rootPromptReceipt).toBe('fictional-root'))
    await runtime.scheduler!.tick()
    expect(create).toHaveBeenCalledWith(computerId, expect.objectContaining({ allowAllPermissions: false, launchId: run.launchId }))
    const registry = new ManagerStore(path.join(directory, 'manager'))
    await registry.initialize()
    expect(registry.registry()[`${computerId}:${detail.id}`]).toMatchObject({ origin: 'schedule', scheduleId: schedule.id })
    expect(runtime.managerAgent).toBeUndefined()
    expect(records.filter((record) => record.startupPhase === 'scheduler.provenance').map((record) => record.event)).toEqual(['begin', 'complete'])
    launch!.receipts[0].outcome = 'succeeded'
    await runtime.scheduler!.tick()
    expect(runtime.scheduler!.store.getRun(run.id).status).toBe('succeeded')
    host.emit('event', { type: 'session.removed', computerId, sessionId: detail.id, replacedBy: 'replacement' })
    const replacement = new ManagerStore(path.join(directory, 'manager'))
    await vi.waitFor(async () => {
      await replacement.initialize()
      expect(replacement.registry()[`${computerId}:replacement`]).toMatchObject({
        origin: 'schedule', scheduleId: schedule.id, scheduleRunId: run.id,
      })
    })
    expect(launcher.launch).not.toHaveBeenCalled()
  })

  it('settles and journals a Run now revision refusal before admitting a run', async () => {
    const server = await app()
    const schedule = await runtime.scheduler!.store.create(input() as never)
    const proposal = await runtime.scheduler!.store.propose({ operation: 'run-now', scheduleId: schedule.id, baseRevision: 1, payload: {} })
    await runtime.scheduler!.store.update(schedule.id, { revision: 1, prompt: 'User-edited guide review' })
    const response = await server.inject({ method: 'POST', url: `/api/schedules/proposals/${proposal.id}/approve`, headers })
    expect(response.statusCode).toBe(409)
    expect(runtime.scheduler!.store.proposal(proposal.id)).toMatchObject({ status: 'failed', error: 'Schedule revision conflict' })
    expect(runtime.scheduler!.store.allRuns()).toEqual([])
    await vi.waitFor(async () => {
      const entries = (await readFile(path.join(directory, 'manager', 'journal.jsonl'), 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
      expect(entries.filter((entry) => entry.proposalId === proposal.id).map((entry) => entry.proposalStatus)).toEqual(['pending', 'failed'])
    })
  })
  it('lists and resolves proposals without accepting payload substitutions and enforces hostile origins', async () => {
    const server = await app()
    const proposal = await runtime.scheduler!.store.propose({ operation: 'create', payload: input() as never })
    const listed = await server.inject({ url: '/api/schedules/proposals', headers })
    expect(listed.headers['cache-control']).toBe('no-store')
    expect(listed.json().proposals).toHaveLength(1)
    for (const [method, suffix] of [
      ['GET', '/proposals'], ['POST', `/proposals/${proposal.id}/approve`], ['POST', `/proposals/${proposal.id}/reject`],
    ] as const) {
      for (const prefix of ['/api/schedules', '/%61pi/schedules']) {
        expect((await server.inject({ method, url: `${prefix}${suffix}`,
          headers: { ...headers, origin: 'https://hostile.example' } })).statusCode).toBe(403)
      }
    }
    const path = `/api/schedules/proposals/${proposal.id}/approve`
    expect((await server.inject({ method: 'POST', url: path, headers, payload: { payload: { name: 'Substitute' } } })).statusCode).toBe(400)
    expect(runtime.scheduler!.store.list()).toEqual([])
    expect((await server.inject({ method: 'POST', url: path, headers })).json().proposal.status).toBe('applied')
    expect((await server.inject({ method: 'POST', url: path, headers })).json().proposal.status).toBe('applied')
    const rejected = await runtime.scheduler!.store.propose({ operation: 'create', payload: { ...input(), name: 'Another' } as never })
    expect((await server.inject({ method: 'POST', url: `/api/schedules/proposals/${rejected.id}/reject`, headers })).json().proposal.status).toBe('rejected')
    expect((await server.inject({ url: '/api/schedules/proposals', headers })).json().proposals).toEqual([])
  })
  it('creates, lists, reads and updates with revision, enable/archive and deletion checks', async () => {
    const server = await app()
    const create = await server.inject({ method: 'POST', url: '/api/schedules', headers, payload: input() })
    expect(create.statusCode).toBe(201)
    let schedule: Schedule = create.json().schedule
    const base = `/api/schedules/${schedule.id}`
    expect(schedule).toMatchObject({ revision: 1, createdBy: 'user', target: { permissionPolicy: 'ask', folderTrust: 'ask' } })
    expect((await server.inject({ url: '/api/schedules', headers })).json().schedules).toHaveLength(1)
    const read = await server.inject({ url: base, headers })
    expect(read.headers['cache-control']).toBe('no-store')
    expect(read.json()).toEqual({ schedule })
    expect((await server.inject({ method: 'DELETE', url: base, headers, payload: { revision: 1 } })).statusCode).toBe(409)
    const updated = await server.inject({ method: 'PATCH', url: base, headers, payload: { revision: 1, name: 'Updated review' } })
    expect(updated.statusCode).toBe(200)
    schedule = updated.json().schedule
    expect(schedule.revision).toBe(2)
    expect((await server.inject({ method: 'PATCH', url: base, headers, payload: { revision: 1, prompt: 'Stale' } })).statusCode).toBe(409)
    expect((await server.inject({ method: 'POST', url: '/api/schedules', headers,
      payload: { ...input(), name: 'UPDATED REVIEW' } })).statusCode).toBe(409)
    const disabled = await server.inject({ method: 'POST', url: `${base}/enabled`, headers, payload: { revision: 2, enabled: false } })
    expect(disabled.json().schedule).toMatchObject({ revision: 3, enabled: false })
    const enabled = await server.inject({ method: 'POST', url: `${base}/enabled`, headers, payload: { revision: 3, enabled: true } })
    expect(enabled.json().schedule).toMatchObject({ revision: 4, enabled: true })
    expect((await server.inject({ method: 'POST', url: `${base}/archived`, headers,
      payload: { revision: 4, archived: true } })).json().schedule).toMatchObject({ revision: 5, archived: true, enabled: false })
    expect((await server.inject({ method: 'POST', url: `${base}/run`, headers })).statusCode).toBe(409)
    expect((await server.inject({ url: '/api/schedules?archived=false', headers })).json().schedules).toEqual([])
    expect((await server.inject({ method: 'POST', url: `${base}/archived`, headers,
      payload: { revision: 5, archived: false } })).json().schedule).toMatchObject({ revision: 6, archived: false })
    await server.inject({ method: 'POST', url: `${base}/archived`, headers, payload: { revision: 6, archived: true } })
    expect((await server.inject({ method: 'DELETE', url: base, headers, payload: { revision: 7 } })).json()).toEqual({ ok: true })
    expect((await server.inject({ url: base, headers })).statusCode).toBe(404)
  })

  it('accepts Run now while disabled, respects overlap, and pages/stops runs', async () => {
    const server = await app()
    const schedule: Schedule = (await server.inject({ method: 'POST', url: '/api/schedules', headers,
      payload: { ...input(), enabled: false, target: { ...input().target, computerId: runtime.identity.info.id } } })).json().schedule
    const base = `/api/schedules/${schedule.id}`
    const first = await server.inject({ method: 'POST', url: `${base}/run`, headers })
    expect(first.statusCode).toBe(202)
    const run: ScheduleRun = first.json().run
    await runtime.scheduler!.tick()
    await runtime.scheduler!.tick()
    const next = await server.inject({ method: 'POST', url: `${base}/run`, headers })
    expect(next.json().run.status).toBe('missed')
    const global = await server.inject({ url: '/api/schedules/runs?limit=1', headers })
    expect(global.headers['cache-control']).toBe('no-store')
    expect(global.json()).toMatchObject({ total: 2, nextOffset: 1, runs: [expect.objectContaining({ id: next.json().run.id })] })
    expect((await server.inject({ url: `${base}/runs?offset=1&limit=1`, headers })).json())
      .toMatchObject({ total: 2, nextOffset: null, runs: [expect.objectContaining({ id: run.id })] })
    expect((await server.inject({ url: `/api/schedules/runs/${run.id}`, headers })).json().run).toMatchObject({ id: run.id })
    const stopped = await server.inject({ method: 'POST', url: `/api/schedules/runs/${run.id}/stop`, headers })
    expect(stopped.json().run.status).toBe('stopped')
    expect(launcher.stop).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['POST', '', { ...input(), name: '' }],
    ['POST', '', { ...input(), prompt: 'x'.repeat(20_001) }],
    ['POST', '', { ...input(), recurrence: { type: 'cron', expression: '*/5 * * * *' } }],
    ['POST', '', { ...input(), maxRuntimeMin: 481 }],
    ['POST', '', { ...input(), createdBy: 'oracle' }],
    ['PATCH', '/missing', { revision: 0 }],
    ['GET', '/runs?limit=201', undefined],
    ['GET', '/runs?limit=0', undefined],
    ['GET', '/runs?offset=-1', undefined],
    ['GET', '/runs?offset=1000001', undefined],
    ['GET', '/runs?status=unknown', undefined],
    ['GET', '?archived=maybe', undefined],
  ] as const)('rejects invalid %s /api/schedules%s', async (method, suffix, payload) => {
    const server = await app()
    const response = await server.inject({ method, url: `/api/schedules${suffix}`, headers, ...(payload ? { payload } : {}) })
    expect(response.statusCode).toBe(400)
    expect(runtime.scheduler!.store.list()).toEqual([])
  })

  it('returns 404 for missing schedules and runs', async () => {
    const server = await app()
    for (const url of ['/api/schedules/missing', '/api/schedules/missing/runs', '/api/schedules/runs/missing']) {
      expect((await server.inject({ url, headers })).statusCode).toBe(404)
    }
    expect((await server.inject({ method: 'POST', url: '/api/schedules/runs/missing/stop', headers })).statusCode).toBe(404)
  })

  it.each(['off', 'on'])('broadcasts durable changes with notification center %s and logs startup', async (notificationFlag) => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', notificationFlag)
    const server = await app()
    expect(records.filter((record) => record.startupPhase === 'scheduler.start').map((record) => record.event)).toEqual(['begin', 'complete'])
    const socket = await server.injectWS('/api/events', { headers })
    try {
      const event = new Promise<string>((resolve) => socket.once('message', (data) => resolve(data.toString())))
      const response = await server.inject({ method: 'POST', url: '/api/schedules', headers, payload: input() })
      expect(JSON.parse(await event)).toMatchObject({
        type: 'schedules.changed', revision: 1, scheduleId: response.json().schedule.id,
      })
    } finally { socket.terminate() }
  })

  it('constructs no scheduler state or services when the flag is off', async () => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', 'off')
    const server = await app()
    expect(runtime.scheduler).toBeUndefined()
    for (const [method, suffix] of [
      ['GET', ''], ['POST', ''], ['GET', '/id'], ['PATCH', '/id'], ['DELETE', '/id'],
      ['POST', '/id/enabled'], ['POST', '/id/archived'], ['POST', '/id/run'],
      ['GET', '/id/runs'], ['GET', '/runs'], ['GET', '/runs/id'], ['POST', '/runs/id/stop'],
      ['GET', '/proposals'], ['POST', '/proposals/id/approve'], ['POST', '/proposals/id/reject'],
    ] as const) expect((await server.inject({ method, url: `/api/schedules${suffix}`, headers })).statusCode).toBe(404)
    expect((await readdir(directory)).includes('scheduler')).toBe(false)
    expect((await readdir(directory)).includes('schedule-worktrees')).toBe(false)
    expect(records.some((record) => record.startupPhase === 'scheduler.start')).toBe(false)
    expect(launcher.launch).not.toHaveBeenCalled()
    expect(launcher.reconcile).not.toHaveBeenCalled()
    expect(launcher.stop).not.toHaveBeenCalled()
    expect((await server.inject({ url: '/api/features', headers })).json().hubFlags.scheduler).toBe(false)
  })

  it('never constructs or dispatches on a node even with the hub flag on', async () => {
    const server = await app('node')
    expect(runtime.scheduler).toBeUndefined()
    expect((await server.inject({ url: '/api/schedules', headers })).statusCode).toBe(404)
    expect((await readdir(directory)).includes('scheduler')).toBe(false)
    expect(launcher.reconcile).not.toHaveBeenCalled()
  })
})
