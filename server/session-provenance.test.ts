import { randomUUID } from 'node:crypto'
import { rm, stat, writeFile } from 'node:fs/promises'
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
    } finally { await app.close(); await recorder.stop() }
  })

  it('records an external discovery as discovered even after the initial baseline', async () => {
    const store = await registry()
    const recorder = new JournalRecorder(store)
    try {
      await recorder.reconcile([], ['studio'])
      recorder.handle({ type: 'session.upserted', session })
      await recorder.flush()
      expect(sessionProvenanceProjection(store).project(session).provenance).toEqual({ origin: 'discovered' })
    } finally { await recorder.stop() }
  })

  it('does not present a legacy timing-only user tag as launch evidence', async () => {
    const store = await registry()
    await store.updateRegistry((entries) => {
      entries['studio:one'] = { computerId: 'studio', sessionId: 'one', title: 'Untitled', origin: 'user', firstSeenAt: session.updatedAt }
    })
    expect(sessionProvenanceProjection(store).project(session)).not.toHaveProperty('provenance')
    expect(store.sessionOrigin('studio', 'one')).toBe('user')
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
