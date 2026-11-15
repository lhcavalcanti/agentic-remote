import { randomUUID } from 'node:crypto'
import { readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import Fastify from 'fastify'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ManagedSession, SessionProvenance } from '../shared/contracts.js'
import { sessionProvenanceProjection } from './session-provenance.js'
import { SessionPublications } from './session-patches.js'
import { ManagerStore } from './manager-store.js'
import { JournalRecorder } from './manager-journal.js'
import { registerHubRoutes } from './hub-routes.js'
import type { ComputerManager } from './computer-manager.js'
import type { KnowledgeStore } from './knowledge-store.js'
import { buildApp } from './app.js'
import { EventEmitter } from 'node:events'
import { recordScheduleProvenance } from './schedule-launcher.js'
import { rosterLine } from './manager-context.js'

const directories: string[] = []
afterEach(async () => {
  for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true })
  vi.unstubAllEnvs()
})
async function registry() {
  const directory = path.resolve(`.agentic-provenance-${randomUUID()}`)
  directories.push(directory)
  const store = new ManagerStore(path.join(directory, 'manager'))
  await store.initialize()
  return store
}

const session: ManagedSession = {
  id: 'one', computerId: 'studio', computerName: 'Studio', title: 'Untitled', cwd: '/fictional',
  status: 'idle', messages: [], updatedAt: '2026-11-14T20:00:00Z',
}

describe('hub session provenance projection', () => {
  it.each([false, true])('records API creation as user independently of baseline timing (%s)', async (baseline) => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://localhost')
    const store = await registry()
    const recorder = new JournalRecorder(store)
    if (baseline) await recorder.reconcile([], ['studio'])
    const manager = {
      createSession: vi.fn(async () => {
        recorder.handle({ type: 'session.upserted', session })
        await recorder.flush()
        return session
      }),
      on: vi.fn(), off: vi.fn(), emit: vi.fn(),
    } as unknown as ComputerManager
    const app = Fastify()
    const dependencies: Parameters<typeof registerHubRoutes> = [app, manager, {} as KnowledgeStore]
    dependencies[14] = store
    try {
      await registerHubRoutes(...dependencies)
      const response = await app.inject({
        method: 'POST', url: '/api/computers/studio/sessions', headers: { host: 'localhost', origin: 'http://localhost' }, payload: { cwd: '/fictional' },
      })
      expect(response.statusCode).toBe(201)
      expect(response.json().session.provenance).toEqual({ origin: 'user' })
      await recorder.reconcile([session], ['studio'])
      const restarted = new ManagerStore(store.directory)
      await restarted.initialize()
      expect(restarted.sessionProvenance('studio', 'one')).toEqual({ origin: 'user' })
      expect((await stat(path.join(store.directory, 'sessions.json'))).mode & 0o777).toBe(0o600)
      const successor = { ...session, id: 'api-successor' }
      const replacementRecorder = new JournalRecorder(restarted)
      try {
        replacementRecorder.handle({ type: 'session.removed', computerId: 'studio', sessionId: 'one', replacedBy: successor.id })
        replacementRecorder.handle({ type: 'session.upserted', session: successor })
        await replacementRecorder.flush()
        const replaced = new ManagerStore(store.directory)
        await replaced.initializeSessionRegistry()
        expect(sessionProvenanceProjection(replaced).project(successor).provenance).toEqual({ origin: 'user' })
      } finally { await replacementRecorder.stop() }
    } finally { await app.close(); await recorder.stop() }
  })

  it.each([false, true])('records an external discovery as discovered independently of baseline (%s)', async (baseline) => {
    const store = await registry()
    const recorder = new JournalRecorder(store)
    try {
      if (baseline) await recorder.reconcile([], ['studio'])
      recorder.handle({ type: 'session.upserted', session })
      await recorder.flush()
      expect(sessionProvenanceProjection(store).project(session).provenance).toEqual({ origin: 'discovered' })
      expect(store.registry()['studio:one']).toMatchObject({ origin: 'discovered', originEvidence: 'discovery' })
    } finally { await recorder.stop() }
  })

  it('keeps legacy Oracle origin unchanged on unrelated writes and maps only its UI provenance', async () => {
    const store = await registry()
    const entry = { computerId: 'studio', sessionId: 'one', title: 'Untitled', origin: 'user' as const, firstSeenAt: session.updatedAt }
    await store.updateRegistry((entries) => {
      entries['studio:one'] = entry
    })
    expect(store.sessionOrigin('studio', 'one')).toBe('user')
    expect(sessionProvenanceProjection(store).project(session).provenance).toEqual({ origin: 'discovered' })
    await store.updateRegistry((entries) => {
      entries['studio:unrelated'] = { ...entry, sessionId: 'unrelated', title: 'Unrelated change' }
    })
    expect(store.registry()['studio:one']).toEqual(entry)
    expect(JSON.parse(await readFile(path.join(store.directory, 'sessions.json'), 'utf8'))['studio:one']).toEqual(entry)
    expect(rosterLine(session, store.registry()['studio:one'], new Date(session.updatedAt))).toContain('started by the user')
  })

  it.each([
    ['full', false], ['full', true], ['metadata', false], ['metadata', true],
  ] as const)('keeps registry bytes and Oracle context unchanged on %s startup regardless of baseline (%s)', async (mode, baseline) => {
    const store = await registry()
    const entry = { computerId: 'studio', sessionId: 'one', title: 'Untitled', origin: 'user', firstSeenAt: session.updatedAt, task: 'Preserve this legacy task' }
    const entries = {
      'studio:one': entry,
      'studio:observed': { ...entry, sessionId: 'observed', originEvidence: 'discovery' },
      'studio:launched': { ...entry, sessionId: 'launched', originEvidence: 'launch' },
      'studio:oracle': { ...entry, sessionId: 'oracle', origin: 'manager' },
      'studio:scheduled': { ...entry, sessionId: 'scheduled', origin: 'schedule', scheduleId: 'daily', scheduleRunId: 'run' },
    }
    const original = Buffer.from(`${JSON.stringify(entries, null, 3)}\n  \n`)
    const file = path.join(store.directory, 'sessions.json')
    await writeFile(file, original)
    await writeFile(path.join(store.directory, 'state.json'), JSON.stringify(baseline ? { baselineAt: session.updatedAt } : {}))
    const restarted = new ManagerStore(store.directory)
    if (mode === 'full') await restarted.initialize()
    else await restarted.initializeSessionRegistry()
    expect((await readFile(file)).equals(original)).toBe(true)
    expect(restarted.registry()['studio:one']).toEqual(entry)
    expect(restarted.sessionOrigin('studio', 'one')).toBe('user')
    expect(sessionProvenanceProjection(restarted).project(session).provenance).toEqual({ origin: 'discovered' })
    expect(restarted.sessionProvenance('studio', 'observed')).toEqual({ origin: 'discovered' })
    expect(restarted.registry()['studio:observed']).toEqual(entries['studio:observed'])
    expect(rosterLine(session, restarted.registry()['studio:one'], new Date(session.updatedAt))).toContain('started by the user')
    expect(restarted.sessionProvenance('studio', 'launched')).toEqual({ origin: 'user' })
    expect(restarted.sessionOrigin('studio', 'oracle')).toBe('manager')
    expect(restarted.sessionOrigin('studio', 'scheduled')).toBe('schedule')
    const persisted = JSON.parse(await readFile(file, 'utf8'))
    expect(persisted['studio:one']).toEqual(entry)
    expect(persisted['studio:oracle']).toEqual(entries['studio:oracle'])
    expect(persisted['studio:scheduled']).toEqual(entries['studio:scheduled'])
    const again = new ManagerStore(store.directory)
    await again.initializeSessionRegistry()
    expect(again.registry()).toEqual(restarted.registry())
    expect((await readFile(file)).equals(original)).toBe(true)
  })

  it.each(['before', 'after'])('preserves Oracle origin but projects a legacy replacement as discovered when observed %s removal', async (order) => {
    const store = await registry()
    await store.updateRegistry((entries) => {
      entries['studio:one'] = { computerId: 'studio', sessionId: 'one', title: session.title, origin: 'user', firstSeenAt: session.updatedAt }
    })
    const recorder = new JournalRecorder(store)
    const successor = { ...session, id: 'legacy-successor' }
    try {
      if (order === 'before') recorder.handle({ type: 'session.upserted', session: successor })
      recorder.handle({ type: 'session.removed', computerId: 'studio', sessionId: 'one', replacedBy: successor.id })
      if (order === 'after') recorder.handle({ type: 'session.upserted', session: successor })
      await recorder.flush()
      expect(store.sessionOrigin('studio', successor.id)).toBe('user')
      expect(sessionProvenanceProjection(store).project(successor).provenance).toEqual({ origin: 'discovered' })
      const restarted = new ManagerStore(store.directory)
      await restarted.initializeSessionRegistry()
      expect(restarted.sessionProvenance('studio', successor.id)).toEqual({ origin: 'discovered' })
      expect(restarted.sessionOrigin('studio', successor.id)).toBe('user')
      expect(rosterLine(successor, restarted.registry()[`studio:${successor.id}`], new Date(session.updatedAt))).toContain('started by the user')
    } finally { await recorder.stop() }
  })

  it('persists launch evidence from the actual Oracle and schedule recorders', async () => {
    const store = await registry()
    const recorder = new JournalRecorder(store)
    try {
      await recorder.markManaged(session, 'An explicitly launched task')
      await recordScheduleProvenance(store, { ...session, id: 'scheduled' }, { origin: 'schedule', scheduleId: 'daily', scheduleRunId: 'run', task: 'Scheduled task' })
      const restarted = new ManagerStore(store.directory)
      await restarted.initializeSessionRegistry()
      expect(restarted.registry()['studio:one']).toMatchObject({ origin: 'manager', originEvidence: 'launch' })
      expect(restarted.registry()['studio:scheduled']).toMatchObject({ origin: 'schedule', originEvidence: 'launch', scheduleId: 'daily', scheduleRunId: 'run' })
    } finally { await recorder.stop() }
  })

  it.each(['before', 'after'])('carries explicit user evidence when replacement discovery arrives %s removal', async (order) => {
    const store = await registry()
    const recorder = new JournalRecorder(store)
    const successor = { ...session, id: 'successor' }
    try {
      await store.recordUserSession(session)
      recorder.handle({ type: 'session.upserted', session })
      if (order === 'before') recorder.handle({ type: 'session.upserted', session: successor })
      recorder.handle({ type: 'session.removed', computerId: 'studio', sessionId: 'one', replacedBy: 'successor' })
      if (order === 'after') recorder.handle({ type: 'session.upserted', session: successor })
      await recorder.flush()
      expect(store.sessionProvenance('studio', 'successor')).toEqual({ origin: 'user' })
      expect((await stat(store.directory)).mode & 0o777).toBe(0o700)
    } finally { await recorder.stop() }
  })

  it.each(['manager', 'schedule'] as const)('does not let an API replay replace explicit %s ownership', async (origin) => {
    const store = await registry()
    await store.updateRegistry((entries) => {
      entries['studio:one'] = { computerId: 'studio', sessionId: 'one', title: 'Untitled', origin, firstSeenAt: session.updatedAt }
    })
    await store.recordUserSession(session)
    expect(store.sessionOrigin('studio', 'one')).toBe(origin)
  })

  it('still returns the created session when optional origin persistence fails', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://localhost')
    const app = Fastify()
    const createSession = vi.fn(async () => session)
    const dependencies: Parameters<typeof registerHubRoutes> = [
      app, { createSession, on: vi.fn(), off: vi.fn(), emit: vi.fn() } as unknown as ComputerManager, {} as KnowledgeStore,
    ]
    dependencies[14] = { sessionProvenance: () => undefined, recordUserSession: vi.fn().mockRejectedValue(new Error('disk refusal')) }
    try {
      await registerHubRoutes(...dependencies)
      const response = await app.inject({
        method: 'POST', url: '/api/computers/studio/sessions', headers: { host: 'localhost', origin: 'http://localhost' }, payload: { cwd: '/fictional' },
      })
      expect(response.statusCode).toBe(201)
      expect(response.json().session.id).toBe('one')
      expect(createSession).toHaveBeenCalledOnce()
    } finally { await app.close() }
  })

  it('records creation and discovery while Oracle is off without loading its conversation state', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://localhost')
    const store = await registry()
    await writeFile(path.join(store.directory, 'state.json'), '{broken unrelated Oracle state')
    const manager = Object.assign(new EventEmitter(), {
      initialize: async () => undefined, stop: () => undefined,
      listComputers: () => [{ id: 'studio', name: 'Studio', online: true, isLocal: true }],
      createSession: async () => session,
    }) as unknown as ComputerManager
    const runtime = await buildApp({ dataDirectory: path.dirname(store.directory), manager, managerAgent: false, logger: false, serveStatic: false })
    try {
      const response = await runtime.app.inject({
        method: 'POST', url: '/api/computers/studio/sessions', headers: { host: 'localhost', origin: 'http://localhost' }, payload: { cwd: '/fictional' },
      })
      expect(response.statusCode).toBe(201)
      expect(response.json().session.provenance).toEqual({ origin: 'user' })
      manager.emit('event', { type: 'session.upserted', session: { ...session, id: 'external' } })
    } finally { await runtime.app.close() }
    const restarted = new ManagerStore(store.directory)
    await restarted.initializeSessionRegistry()
    expect(restarted.sessionProvenance('studio', 'external')).toEqual({ origin: 'discovered' })
  })

  it.each(['user', 'manager', 'discovered', 'schedule'] as const)('projects only authoritative %s provenance', (origin) => {
    const source: SessionProvenance = origin === 'schedule'
      ? { origin, scheduleId: 'morning', scheduleRunId: 'run' } : { origin }
    const store = { sessionProvenance: vi.fn(() => source) }
    const projection = sessionProvenanceProjection(store, { get: () => ({ name: 'Morning review' }) })
    const input = { ...session, provenance: { origin: 'manager' as const, scheduleName: 'Untrusted node title' } }
    const output = projection.project(input)
    expect(store.sessionProvenance).toHaveBeenCalledWith('studio', 'one')
    expect(output.provenance).toEqual(origin === 'schedule' ? { ...source, scheduleName: 'Morning review' } : { origin })
    expect(input.provenance.scheduleName).toBe('Untrusted node title')
    expect(source).not.toHaveProperty('scheduleName')
  })

  it('does not guess provenance or retain a node-supplied claim when the hub has no record', () => {
    const projection = sessionProvenanceProjection()
    expect(projection.project({ ...session, title: 'Oracle schedule review', provenance: { origin: 'manager' } }))
      .not.toHaveProperty('provenance')
  })

  it('keeps schedule identity when the schedule is deleted and reflects current names on each read', () => {
    const store = { sessionProvenance: () => ({ origin: 'schedule' as const, scheduleId: 'morning', scheduleRunId: 'run' }) }
    const get = vi.fn().mockReturnValueOnce({ name: 'First name' }).mockReturnValueOnce({ name: 'Renamed' })
      .mockImplementationOnce(() => { throw new Error('Deleted') })
    const projection = sessionProvenanceProjection(store, { get })
    expect(projection.project(session).provenance?.scheduleName).toBe('First name')
    expect(projection.project(session).provenance?.scheduleName).toBe('Renamed')
    expect(projection.project(session).provenance).toEqual({ origin: 'schedule', scheduleId: 'morning', scheduleRunId: 'run' })
  })

  it('projects lists, mutation replies and patched socket metadata without changing transcripts or receipts', () => {
    const project = sessionProvenanceProjection({ sessionProvenance: () => ({ origin: 'user' }) })
    const receipt = { deliveryId: 'root' }
    expect(project.reply({ session, receipt })).toMatchObject({ session: { provenance: { origin: 'user' } }, receipt })
    expect(project.reply({ sessions: [session], answeredComputerIds: ['studio'] }))
      .toMatchObject({ sessions: [{ provenance: { origin: 'user' } }], answeredComputerIds: ['studio'] })
    const payloads: string[] = []
    const socket = { readyState: 1, send: (payload: string) => payloads.push(payload), patchVersions: new Map<string, number>() }
    const publications = new SessionPublications()
    publications.add(socket)
    publications.broadcast(project.reply({ type: 'session.upserted', session }))
    publications.broadcast(project.reply({ type: 'session.upserted', session: { ...session, title: 'Renamed' } }))
    expect(JSON.parse(payloads[0]).session.provenance).toEqual({ origin: 'user' })
    expect(JSON.parse(payloads[1])).toMatchObject({ type: 'session.patched', session: { provenance: { origin: 'user' } } })
    expect(session).not.toHaveProperty('provenance')
  })
})
