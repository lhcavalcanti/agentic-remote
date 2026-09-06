import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { access, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ComputerSummary, HubEvent, ManagedSession, ServerEvent, SessionDetail, SessionKnowledgeBinding,
} from '../shared/contracts.js'
import { buildApp, type ServerRole } from './app.js'
import type { ComputerManager, SessionMetadataLookup } from './computer-manager.js'
import { KnowledgeStore } from './knowledge-store.js'
import type { NodeIdentityStore } from './node-identity.js'
import type { PushNotificationService } from './push-notification-service.js'
import type { SessionService } from './session-service.js'
import { SessionKnowledgeStore } from './session-knowledge-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile), rename: vi.fn(fs.rename) }
})

const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const fixtures: { directory: string; runtime: Awaited<ReturnType<typeof buildApp>> }[] = []
const releases: (() => void)[] = []
const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }

function session(computerId: string, id: string, replacedSessionIds?: string[]): ManagedSession {
  return {
    id, computerId, computerName: computerId, title: 'Same title', cwd: '/project',
    updatedAt: '2026-09-05T00:00:00.000Z', status: 'idle', isOpen: true,
    messages: [], replacedSessionIds,
  }
}

class FakeManager extends EventEmitter<{ event: [HubEvent] }> {
  computers: ComputerSummary[] = [
    { id: 'hub', name: 'Hub', isLocal: true, online: true },
    { id: 'worker', name: 'Worker', isLocal: false, online: true },
    { id: 'library', name: 'Library', isLocal: false, online: true },
  ]
  sessions = [session('hub', 'one'), session('hub', 'two'), session('worker', 'one')]
  history: ManagedSession[] = []
  answeredComputerIds = ['hub', 'worker', 'library']
  historyAuthoritative: boolean | undefined
  registrations = new Map(this.computers.map((computer) => [computer.id, Symbol()]))
  legacyClear = false
  initialize = vi.fn(async () => undefined)
  stop = vi.fn()
  listComputers = vi.fn(() => structuredClone(this.computers))
  listSessionsWithAuthority = vi.fn(async () => ({
    sessions: structuredClone(this.sessions),
    answeredComputerIds: [...this.answeredComputerIds],
  }))
  listHistory = vi.fn(async () => structuredClone(this.history))
  lookupSessionMetadata = vi.fn(async (computerId: string, sessionId: string): Promise<SessionMetadataLookup> => {
    const active = this.sessions.filter((entry) => entry.computerId === computerId)
    const history = this.history.filter((entry) => entry.computerId === computerId)
    return {
      session: active.find((entry) => entry.id === sessionId) ?? history.find((entry) => entry.id === sessionId),
      relatedSessions: structuredClone([...active, ...history].filter(
        (entry) => entry.id === sessionId || entry.replacedSessionIds?.includes(sessionId),
      )),
      activeAuthoritative: this.answeredComputerIds.includes(computerId),
      historyAuthoritative: this.historyAuthoritative ?? this.answeredComputerIds.includes(computerId),
    }
  })
  getSession = vi.fn(async () => { throw new Error('Metadata routes must not open a session') })
  activateSession = vi.fn()
  captureComputerRegistration = vi.fn((computerId: string) => {
    const registration = this.registrations.get(computerId)
    if (!registration) throw new Error('Computer not found')
    return () => this.registrations.get(computerId) === registration
  })
  listKnowledge = vi.fn(async () => ({ path: '.', entries: [] }))
  deleteSession = vi.fn(async (computerId: string, sessionId: string) => {
    if (![...this.sessions, ...this.history].some((entry) => entry.computerId === computerId && entry.id === sessionId)) {
      throw Object.assign(new Error('Session not found'), { statusCode: 404 })
    }
    this.sessions = this.sessions.filter((entry) => entry.computerId !== computerId || entry.id !== sessionId)
    this.history = this.history.filter((entry) => entry.computerId !== computerId || entry.id !== sessionId)
    this.emit('event', { type: 'session.removed', computerId, sessionId })
  })
  removeComputer = vi.fn(async (computerId: string) => {
    this.registrations.delete(computerId)
    this.computers = this.computers.filter((entry) => entry.id !== computerId)
    this.sessions = this.sessions.filter((entry) => entry.computerId !== computerId)
    this.emit('event', { type: 'computer.removed', computerId })
  })
  clearConversation = vi.fn(async (computerId: string, sessionId: string) => {
    const old = this.sessions.find((entry) => entry.computerId === computerId && entry.id === sessionId)
    const replacement = session(
      computerId, `${sessionId}-cleared`,
      this.legacyClear ? undefined : [...(old?.replacedSessionIds ?? []), sessionId],
    )
    this.sessions = this.sessions.filter((entry) => entry.computerId !== computerId ||
      (entry.id !== sessionId && entry.id !== replacement.id))
    this.sessions.push(replacement)
    this.emit('event', {
      type: 'session.removed', computerId, sessionId,
      ...(this.legacyClear ? {} : { replacedBy: replacement.id }),
    })
    if (!this.legacyClear) this.emit('event', { type: 'session.upserted', session: replacement })
    return replacement
  })

  rePair(computerId: string): void {
    this.registrations.set(computerId, Symbol())
    this.emit('event', {
      type: 'computer.updated',
      computer: this.computers.find((computer) => computer.id === computerId)!,
    })
  }
}

async function fixture(options: {
  role?: ServerRole; actualManager?: boolean; directory?: string; manager?: FakeManager
} = {}) {
  const directory = options.directory ?? path.join(process.cwd(), `.session-knowledge-routes-test-${randomUUID()}`)
  const manager = options.manager ?? new FakeManager()
  const service = Object.assign(new EventEmitter<{ event: [ServerEvent] }>(), {
    providers: () => [],
    start: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
    listSessions: vi.fn((): SessionDetail[] => manager.sessions.filter((entry) => entry.computerId === 'hub')),
    listHistory: vi.fn((): SessionDetail[] => manager.history.filter((entry) => entry.computerId === 'hub')),
    getSession: vi.fn(),
    openSession: vi.fn(async () => { throw new Error('Must not hydrate or resume an agent') }),
    activateSession: vi.fn(),
  })
  const knowledge = new KnowledgeStore(directory)
  await knowledge.initialize()
  const root = await knowledge.addRoot({
    computerId: options.actualManager ? 'hub' : 'library',
    computerName: 'Library',
    name: 'Notes',
    path: '/library/notes',
  })
  const secondRoot = await knowledge.addRoot({
    computerId: 'hub', computerName: 'Hub', name: 'Notes', path: '/library/notes',
  })
  const store = new SessionKnowledgeStore(directory, knowledge)
  const initialize = vi.spyOn(store, 'initialize')
  const runtime = await buildApp({
    role: options.role,
    dataDirectory: directory,
    logger: false,
    service: service as unknown as SessionService,
    manager: options.actualManager ? undefined : manager as unknown as ComputerManager,
    identity: {
      initialize: async () => undefined,
      info: { id: 'hub', name: 'Hub', version: 'fixture' },
      token: 'synthetic-node-test-token',
    } as unknown as NodeIdentityStore,
    knowledgeStore: knowledge,
    sessionKnowledgeStore: store,
    pushService: {
      initialize: async () => undefined,
      attach: () => undefined,
      stop: () => undefined,
      settings: () => ({ mutedSessions: [] }),
    } as unknown as PushNotificationService,
    transcriptionService: {
      initialize: async () => undefined,
      stop: async () => undefined,
      transcribe: vi.fn(),
    },
  })
  fixtures.push({ directory, runtime })
  const route = (computerId = 'hub', sessionId = 'one') =>
    `/api/computers/${encodeURIComponent(computerId)}/sessions/${encodeURIComponent(sessionId)}/knowledge-root`
  const get = (computerId = 'hub', sessionId = 'one') =>
    runtime.app.inject({ url: route(computerId, sessionId), headers: trusted })
  const put = (rootId: string | null, expectedRevision = 0, computerId = 'hub', sessionId = 'one') =>
    runtime.app.inject({
      method: 'PUT', url: route(computerId, sessionId), headers: trusted,
      payload: { rootId, expectedRevision },
    })
  const updates: SessionKnowledgeBinding[] = []
  manager.on('event', (event) => {
    if (event.type === 'session.knowledge.updated') updates.push(event.binding)
  })
  return {
    directory, runtime, app: runtime.app, service, manager, knowledge, root,
    secondRoot, store, initialize, route, get, put, updates,
  }
}

function gate() {
  let start!: () => void
  let finish!: () => void
  const started = new Promise<void>((resolve) => { start = resolve })
  const wait = new Promise<void>((resolve) => { finish = resolve })
  releases.push(finish)
  return { started, wait, start, finish }
}

function holdWrite() {
  const held = gate()
  vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
    held.start()
    await held.wait
    return disk.writeFile(...args)
  })
  return held
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
})

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.all(fixtures.splice(0).map(async ({ directory, runtime }) => {
    await runtime.app.close()
    await rm(directory, { recursive: true, force: true })
  }))
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('session Knowledge routes', () => {
  it('wires a hub-only store and returns an absent binding without seeding metadata', async () => {
    const { runtime, store, directory, get, initialize, manager } = await fixture()
    expect(runtime.sessionKnowledgeStore).toBe(store)
    expect(initialize).toHaveBeenCalledOnce()
    const before = await readdir(directory)
    const response = await get()
    expect(response.statusCode).toBe(200)
    expect(response.headers['cache-control']).toBe('no-store')
    expect(response.json()).toEqual({
      binding: { computerId: 'hub', sessionId: 'one', rootId: null, revision: 0, available: false },
    })
    expect(await readdir(directory)).toEqual(before)
    expect(store.listBindings()).toEqual([])
    expect(manager.getSession).not.toHaveBeenCalled()
    expect(manager.activateSession).not.toHaveBeenCalled()
    expect(manager.listKnowledge).not.toHaveBeenCalled()
  })

  it('does not initialize or expose the hub metadata on a node', async () => {
    const { runtime, get, initialize, directory } = await fixture({ role: 'node' })
    expect(runtime.sessionKnowledgeStore).toBeUndefined()
    expect(initialize).not.toHaveBeenCalled()
    expect((await get()).statusCode).toBe(404)
    await expect(access(path.join(directory, 'session-knowledge.json')))
      .rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('uses actual manager metadata listings for active and historical sessions without opening agents', async () => {
    const { get, put, root, service, manager } = await fixture({ actualManager: true })
    manager.history.push({ ...session('hub', 'closed'), isOpen: false })
    expect((await get()).statusCode).toBe(200)
    expect((await get('hub', 'closed')).statusCode).toBe(200)
    expect((await put(root.id, 0, 'hub', 'closed')).statusCode).toBe(200)
    expect(service.openSession).not.toHaveBeenCalled()
    expect(service.activateSession).not.toHaveBeenCalled()
    expect(service.start).not.toHaveBeenCalled()
    expect(service.listHistory).toHaveBeenCalled()
  })

  it('supports independent and shared choices, across computers with identical session IDs', async () => {
    const { put, get, root, secondRoot, manager } = await fixture()
    const before = structuredClone(manager.sessions)
    expect((await put(root.id)).json().binding).toMatchObject({
      computerId: 'hub', sessionId: 'one', rootId: root.id, root, available: true, revision: 1,
    })
    expect((await put(root.id, 0, 'hub', 'two')).statusCode).toBe(200)
    expect((await put(secondRoot.id, 0, 'worker', 'one')).statusCode).toBe(200)
    expect((await get()).json().binding.rootId).toBe(root.id)
    expect((await get('hub', 'two')).json().binding.rootId).toBe(root.id)
    expect((await get('worker', 'one')).json().binding.rootId).toBe(secondRoot.id)
    expect(manager.sessions).toEqual(before)
    expect(manager.listKnowledge).not.toHaveBeenCalled()
    expect(manager.getSession).not.toHaveBeenCalled()
  })

  it('preserves an explicit unlink and returns the newest binding with a stale-write conflict', async () => {
    const { put, get, root, updates } = await fixture()
    await put(root.id)
    const unlinked = await put(null, 1)
    expect(unlinked.statusCode).toBe(200)
    expect(unlinked.json().binding).toMatchObject({ rootId: null, revision: 2, available: false })
    const stale = await put(root.id, 0)
    expect(stale.statusCode).toBe(409)
    expect(stale.json()).toEqual({
      error: expect.stringContaining('Reload'),
      binding: unlinked.json().binding,
    })
    expect((await get()).json()).toEqual(unlinked.json())
    expect(updates.map((binding) => binding.revision)).toEqual([1, 2])
  })

  it('allows only one simultaneous save using the same expected revision', async () => {
    const { put, root, secondRoot, updates } = await fixture()
    const responses = await Promise.all([put(root.id), put(secondRoot.id)])
    expect(responses.map((response) => response.statusCode).sort()).toEqual([200, 409])
    const saved = responses.find((response) => response.statusCode === 200)!.json().binding
    expect(responses.find((response) => response.statusCode === 409)!.json().binding).toEqual(saved)
    expect(updates).toEqual([saved])
  })

  it.each([
    {},
    { rootId: null },
    { expectedRevision: 0 },
    { rootId: null, expectedRevision: -1 },
    { rootId: null, expectedRevision: 0.5 },
    { rootId: null, expectedRevision: '0' },
    { rootId: null, expectedRevision: 0, cwd: '/must-not-change' },
  ])('rejects malformed or unrelated writes %#', async (payload) => {
    const { app, route, store } = await fixture()
    const response = await app.inject({ method: 'PUT', url: route(), headers: trusted, payload })
    expect(response.statusCode).toBe(400)
    expect(store.listBindings()).toEqual([])
  })

  it('validates root, session, and registered computer identities independently', async () => {
    const { put, get, root, store, manager, knowledge } = await fixture()
    expect((await put('not-a-root')).statusCode).toBe(404)
    expect((await get('unknown', 'one')).statusCode).toBe(404)
    expect((await put(root.id, 0, 'unknown', 'one')).statusCode).toBe(404)
    expect((await get('hub', 'not-a-session')).statusCode).toBe(404)
    expect((await put(root.id, 0, 'hub', 'not-a-session')).statusCode).toBe(404)
    manager.sessions.push(session('unknown', 'one'))
    expect((await get('unknown', 'one')).statusCode).toBe(404)
    const orphan = await knowledge.addRoot({
      computerId: 'unregistered-root-owner', computerName: 'Old library', path: '/notes', name: 'Old notes',
    })
    expect((await put(orphan.id)).statusCode).toBe(404)
    expect(store.listBindings()).toEqual([])
    expect(manager.getSession).not.toHaveBeenCalled()
  })

  it.each(['/api', '/%61pi', '/a%70i'])('preserves Host and Origin policy through %s', async (prefix) => {
    const { app, root, store } = await fixture()
    for (const headers of [
      { host: 'attacker.example.test' },
      { host: 'hub.example.test', origin: 'https://attacker.example.test' },
    ]) {
      for (const method of ['GET', 'PUT'] as const) {
        const response = await app.inject({
          method,
          url: `${prefix}/computers/hub/sessions/one/knowledge-root`,
          headers,
          ...(method === 'PUT' ? { payload: { rootId: root.id, expectedRevision: 0 } } : {}),
        })
        expect(response.statusCode).toBe(403)
      }
    }
    expect(store.listBindings()).toEqual([])
  })

  it('keeps root availability separate from either computer being offline', async () => {
    const { manager, put, get, root, store } = await fixture()
    manager.computers.forEach((computer) => { computer.online = false })
    expect((await put(root.id, 0, 'worker', 'one')).json().binding.available).toBe(true)
    manager.sessions = []
    manager.answeredComputerIds = ['hub']
    expect((await get('worker', 'one')).json().binding).toEqual(store.get('worker', 'one'))
    expect((await get('worker', 'unverified')).statusCode).toBe(503)
    expect(store.get('worker', 'one').available).toBe(true)
  })

  it('does not delete associations because a non-authoritative snapshot omitted them', async () => {
    const { put, get, manager, store, root } = await fixture()
    await put(root.id, 0, 'worker', 'one')
    manager.sessions = []
    manager.answeredComputerIds = ['hub']
    expect((await get('worker', 'one')).statusCode).toBe(200)
    expect(store.get('worker', 'one').rootId).toBe(root.id)
    manager.answeredComputerIds.push('worker')
    expect((await get('worker', 'one')).statusCode).toBe(404)
    expect(store.get('worker', 'one').rootId).toBe(root.id)
  })

  it.each(['hub', 'library'])('rejects pairing changes to %s during identity validation', async (computerId) => {
    const { manager, put, root, store, updates } = await fixture()
    const held = gate()
    const lookup = manager.lookupSessionMetadata.getMockImplementation()!
    manager.lookupSessionMetadata.mockImplementationOnce(async (...args) => {
      const result = await lookup(...args)
      held.start()
      await held.wait
      return result
    })
    const pending = put(root.id).then((response) => response)
    await held.started
    manager.rePair(computerId)
    held.finish()
    expect((await pending).statusCode).toBe(409)
    expect(store.get('hub', 'one').revision).toBe(0)
    expect(updates).toEqual([])
  })

  it.each(['hub', 'library'])('rechecks %s registration before committing a held write', async (computerId) => {
    const { manager, put, root, store, updates } = await fixture()
    const held = holdWrite()
    const pending = put(root.id).then((response) => response)
    await held.started
    manager.rePair(computerId)
    held.finish()
    expect((await pending).statusCode).toBe(409)
    expect(store.get('hub', 'one').revision).toBe(0)
    expect(updates).toEqual([])
  })

  it.each(['hub', 'library'])('restores memory and disk when %s re-pairing overtakes rename', async (computerId) => {
    const { manager, put, root, secondRoot, updates, store, directory, knowledge } = await fixture()
    await put(secondRoot.id)
    const before = store.get('hub', 'one')
    const statePath = path.join(directory, 'session-knowledge.json')
    const persisted = await readFile(statePath, 'utf8')
    updates.length = 0
    const held = gate()
    vi.mocked(rename).mockImplementationOnce(async (...args) => {
      await disk.rename(...args)
      held.start()
      await held.wait
    })
    const pending = put(root.id, 1).then((response) => response)
    await held.started
    manager.rePair(computerId)
    held.finish()
    expect((await pending).statusCode).toBe(409)
    expect(updates).toEqual([])
    expect(store.get('hub', 'one')).toEqual(before)
    expect(await readFile(statePath, 'utf8')).toBe(persisted)
    const reloaded = new SessionKnowledgeStore(directory, knowledge)
    await reloaded.initialize()
    expect(reloaded.get('hub', 'one')).toEqual(before)
  })

  it('does not accept a lookup snapshot overtaken by a session removal', async () => {
    const { manager, put, root, store } = await fixture()
    const held = gate()
    const lookup = manager.lookupSessionMetadata.getMockImplementation()!
    manager.lookupSessionMetadata.mockImplementationOnce(async (...args) => {
      const result = await lookup(...args)
      held.start()
      await held.wait
      return result
    })
    const pending = put(root.id).then((response) => response)
    await held.started
    await manager.deleteSession('hub', 'one')
    held.finish()
    expect((await pending).statusCode).toBe(409)
    expect(store.get('hub', 'one').revision).toBe(0)
  })

  it('restores the previous binding in memory and on disk when the chosen root is deleted during rename', async () => {
    const { put, root, secondRoot, knowledge, store, directory, updates } = await fixture()
    await put(secondRoot.id)
    const before = store.get('hub', 'one')
    const statePath = path.join(directory, 'session-knowledge.json')
    const persisted = await readFile(statePath, 'utf8')
    const held = gate()
    vi.mocked(rename).mockImplementationOnce(async (...args) => {
      await disk.rename(...args)
      held.start()
      await held.wait
    })
    updates.length = 0
    const pending = put(root.id, 1).then((response) => response)
    await held.started
    await knowledge.removeRoot(root.id)
    held.finish()
    expect((await pending).statusCode).toBe(404)
    expect(store.get('hub', 'one')).toEqual(before)
    expect(await readFile(statePath, 'utf8')).toBe(persisted)
    expect(updates).toEqual([])
  })

  it('rolls a rejected choice back before clear transfers the prior binding to its replacement', async () => {
    const { app, manager, put, root, secondRoot, store, directory, get, updates } = await fixture()
    await put(root.id)
    const held = gate()
    vi.mocked(rename).mockImplementationOnce(async (...args) => {
      await disk.rename(...args)
      held.start()
      await held.wait
    })
    updates.length = 0
    const changing = put(secondRoot.id, 1).then((response) => response)
    await held.started
    const removed = new Promise<void>((resolve) => {
      manager.once('event', (event) => {
        expect(event.type).toBe('session.removed')
        resolve()
      })
    })
    const clearing = app.inject({
      method: 'POST', url: '/api/computers/hub/sessions/one/clear', headers: trusted,
    }).then((response) => response)
    await removed
    held.finish()
    expect((await changing).statusCode).toBe(409)
    expect((await clearing).statusCode).toBe(200)
    expect((await get('hub', 'one-cleared')).json().binding.rootId).toBe(root.id)
    expect(store.get('hub', 'one').revision).toBe(0)
    const persisted = JSON.parse(await readFile(path.join(directory, 'session-knowledge.json'), 'utf8'))
    expect(persisted.bindings).toEqual([expect.objectContaining({ sessionId: 'one-cleared', rootId: root.id, revision: 1 })])
    expect(updates.every((binding) => binding.rootId === root.id)).toBe(true)
  })

  it('discards old-generation queued lineage when the same computer ID is re-registered', async () => {
    const { manager, put, get, root, secondRoot, store, directory } = await fixture()
    await put(root.id, 0, 'worker', 'one')
    const held = holdWrite()
    const blocker = put(secondRoot.id, 0, 'hub', 'two').then((response) => response)
    await held.started
    manager.emit('event', {
      type: 'session.removed', computerId: 'worker', sessionId: 'one', replacedBy: 'successor',
    })
    manager.rePair('worker')
    manager.sessions = [session('hub', 'two'), session('worker', 'one'), session('worker', 'successor')]
    held.finish()
    expect((await blocker).statusCode).toBe(200)
    expect((await get('worker', 'one')).statusCode).toBe(200)
    expect((await get('worker', 'successor')).json().binding.revision).toBe(0)
    expect(store.get('worker', 'one').rootId).toBe(root.id)
    const persisted = JSON.parse(await readFile(path.join(directory, 'session-knowledge.json'), 'utf8'))
    expect(persisted.bindings.some((binding: SessionKnowledgeBinding) => binding.sessionId === 'successor')).toBe(false)
    expect((await put(secondRoot.id, 1, 'worker', 'one')).statusCode).toBe(200)
    expect((await put(root.id, 0, 'worker', 'successor')).statusCode).toBe(200)
  })

  it('does not let an old clear response install lineage in a new registration', async () => {
    const { app, manager, put, get, root, store } = await fixture()
    await put(root.id, 0, 'worker', 'one')
    const held = gate()
    manager.clearConversation.mockImplementationOnce(async () => {
      held.start()
      await held.wait
      return session('worker', 'successor', ['one'])
    })
    const clearing = app.inject({
      method: 'POST', url: '/api/computers/worker/sessions/one/clear', headers: trusted,
    }).then((response) => response)
    await held.started
    manager.rePair('worker')
    manager.sessions = [session('worker', 'one'), session('worker', 'successor')]
    held.finish()
    expect((await clearing).statusCode).toBe(409)
    expect((await get('worker', 'one')).statusCode).toBe(200)
    expect((await get('worker', 'successor')).json().binding.revision).toBe(0)
    expect(store.get('worker', 'one').rootId).toBe(root.id)
  })

  it('retains lineage across ordinary online/offline updates of the same registration', async () => {
    const { app, manager, put, get, root } = await fixture()
    await put(root.id, 0, 'worker', 'one')
    expect((await app.inject({
      method: 'POST', url: '/api/computers/worker/sessions/one/clear', headers: trusted,
    })).statusCode).toBe(200)
    manager.sessions.push(session('worker', 'one'))
    for (const online of [false, true]) {
      const computer = manager.computers.find((entry) => entry.id === 'worker')!
      computer.online = online
      manager.emit('event', { type: 'computer.updated', computer })
      expect((await get('worker', 'one')).statusCode).toBe(404)
      expect((await get('worker', 'one-cleared')).json().binding.rootId).toBe(root.id)
    }
  })

  it('does not call fleet-wide inventories when an unrelated node is hung', async () => {
    const { manager, get, put, root } = await fixture()
    manager.listSessionsWithAuthority.mockImplementation(() => new Promise(() => {}))
    manager.listHistory.mockImplementation(() => new Promise(() => {}))
    expect((await get()).statusCode).toBe(200)
    expect((await put(root.id)).statusCode).toBe(200)
    expect(manager.listSessionsWithAuthority).not.toHaveBeenCalled()
    expect(manager.listHistory).not.toHaveBeenCalled()
  })

  it('returns retryable 503, not absence, when active metadata succeeds but history fails', async () => {
    const { get, put, root, service } = await fixture({ actualManager: true })
    service.listHistory.mockImplementation(() => { throw new Error('history unavailable') })
    expect((await get('hub', 'historical')).statusCode).toBe(503)
    expect((await put(root.id, 0, 'hub', 'historical')).statusCode).toBe(503)
    expect(service.openSession).not.toHaveBeenCalled()
    expect(service.activateSession).not.toHaveBeenCalled()
  })

  it('keeps failed persistence visible, emits no update, and permits retry', async () => {
    const { put, get, root, secondRoot, store, updates } = await fixture()
    await put(root.id)
    const before = store.get('hub', 'one')
    updates.length = 0
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    const failed = await put(secondRoot.id, 1)
    expect(failed.statusCode).toBe(503)
    expect(failed.json().error).toContain('Try again')
    expect((await get()).json().binding).toEqual(before)
    expect(updates).toEqual([])
    expect((await put(secondRoot.id, 1)).json().binding).toMatchObject({ rootId: secondRoot.id, revision: 2 })
    expect(updates).toHaveLength(1)
  })

  it('broadcasts a hub-only event after persistence, never before it', async () => {
    const { app, put, root, store, updates, service, directory } = await fixture()
    const providerEvents: ServerEvent[] = []
    service.on('event', (event) => providerEvents.push(event))
    await app.ready()
    const socket = await app.injectWS('/api/events', { headers: trusted })
    try {
      const received = new Promise<HubEvent>((resolve) => {
        socket.once('message', (data) => resolve(JSON.parse(data.toString()) as HubEvent))
      })
      const held = holdWrite()
      const pending = put(root.id).then((response) => response)
      await held.started
      expect(updates).toEqual([])
      expect(store.get('hub', 'one').revision).toBe(0)
      await expect(access(path.join(directory, 'session-knowledge.json'))).rejects.toMatchObject({ code: 'ENOENT' })
      held.finish()
      const response = await pending
      const event = await received
      expect(event).toEqual({
        type: 'session.knowledge.updated', computerId: 'hub', sessionId: 'one',
        binding: response.json().binding,
      })
      expect(JSON.parse(await readFile(path.join(directory, 'session-knowledge.json'), 'utf8')).bindings[0].rootId)
        .toBe(root.id)
      expect(providerEvents).toEqual([])
    } finally {
      socket.terminate()
    }
  })

  it('retains root metadata and broadcasts unavailability after shared-root removal', async () => {
    const { app, put, get, root, store, updates } = await fixture()
    await put(root.id)
    const before = store.get('hub', 'one')
    updates.length = 0
    const response = await app.inject({
      method: 'DELETE', url: `/api/knowledge/roots/${root.id}`, headers: trusted,
    })
    expect(response.statusCode).toBe(204)
    expect((await get()).json().binding).toEqual({ ...before, available: false })
    expect(updates).toEqual([{ ...before, available: false }])
    expect(store.get('hub', 'one').root).toEqual(root)
  })

  it.each([false, true])('carries clear/replacement bindings (legacy plain removal: %s)', async (legacy) => {
    const { app, manager, put, get, root, store, updates } = await fixture()
    await put(root.id)
    manager.legacyClear = legacy
    updates.length = 0
    const cleared = await app.inject({
      method: 'POST', url: '/api/computers/hub/sessions/one/clear', headers: trusted,
    })
    expect(cleared.statusCode).toBe(200)
    expect(cleared.json().session.id).toBe('one-cleared')
    expect((await get('hub', 'one-cleared')).json().binding).toMatchObject({ rootId: root.id, revision: 1 })
    expect(store.get('hub', 'one').revision).toBe(0)
    expect((await get('hub', 'one')).statusCode).toBe(404)
    expect(updates).toEqual([expect.objectContaining({ sessionId: 'one-cleared', rootId: root.id })])
  })

  it('keeps a plain removal link until the actual replacement is known', async () => {
    const { manager, put, root, store, get } = await fixture()
    await put(root.id)
    manager.sessions = manager.sessions.filter((entry) => entry.computerId !== 'hub' || entry.id !== 'one')
    manager.emit('event', { type: 'session.removed', computerId: 'hub', sessionId: 'one' })
    await store.flush()
    expect(store.get('hub', 'one').rootId).toBe(root.id)
    const replacement = session('hub', 'third', ['one', 'second'])
    manager.sessions.push(replacement)
    manager.emit('event', { type: 'session.upserted', session: replacement })
    expect((await get('hub', 'third')).json().binding.rootId).toBe(root.id)
    expect(store.get('hub', 'one').revision).toBe(0)
    manager.emit('event', {
      type: 'session.removed', computerId: 'hub', sessionId: 'one', replacedBy: 'second',
    })
    await store.flush()
    expect(store.get('hub', 'third').rootId).toBe(root.id)
    expect(store.get('hub', 'second').revision).toBe(0)
  })

  it('uses persisted ancestry on a metadata read after missing every replacement event', async () => {
    const { manager, put, root, get, directory, knowledge } = await fixture()
    await put(root.id)
    manager.sessions = [session('hub', 'current', ['one', 'intermediate'])]
    const response = await get('hub', 'current')
    expect(response.statusCode).toBe(200)
    expect(response.json().binding).toMatchObject({ rootId: root.id, revision: 1 })
    const restored = new SessionKnowledgeStore(directory, knowledge)
    await restored.initialize()
    expect(restored.get('hub', 'current').rootId).toBe(root.id)
    expect(restored.get('hub', 'one').revision).toBe(0)
  })

  it('keeps the nearest saved predecessor when replacement events arrive late after a failed transfer', async () => {
    const { manager, put, root, secondRoot, store, get } = await fixture()
    manager.sessions.push(session('hub', 'second'))
    await put(root.id)
    await put(secondRoot.id, 0, 'hub', 'second')
    manager.sessions = [session('hub', 'current')]
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    manager.emit('event', {
      type: 'session.removed', computerId: 'hub', sessionId: 'second', replacedBy: 'current',
    })
    await store.flush()
    expect(store.get('hub', 'second').rootId).toBe(secondRoot.id)
    manager.emit('event', {
      type: 'session.removed', computerId: 'hub', sessionId: 'one', replacedBy: 'second',
    })
    expect((await get('hub', 'current')).json().binding.rootId).toBe(secondRoot.id)
    expect(store.get('hub', 'one').revision).toBe(0)
    expect(store.get('hub', 'second').revision).toBe(0)
  })

  it.each(['folder', 'unlink'])('does not overwrite an explicit recipient %s during reconciliation', async (choice) => {
    const { manager, put, root, secondRoot, get, store } = await fixture()
    manager.sessions.push(session('hub', 'current'))
    await put(root.id)
    const recipient = (await put(choice === 'folder' ? secondRoot.id : null, 0, 'hub', 'current')).json().binding
    manager.sessions = [session('hub', 'current', ['one'])]
    expect((await get('hub', 'current')).json().binding).toEqual(recipient)
    expect(store.get('hub', 'one').revision).toBe(0)
  })

  it('preserves a source after failed legacy-clear persistence and retries from its known mapping', async () => {
    const { app, manager, put, root, store, get } = await fixture()
    await put(root.id)
    manager.legacyClear = true
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    const response = await app.inject({
      method: 'POST', url: '/api/computers/hub/sessions/one/clear', headers: trusted,
    })
    expect(response.statusCode).toBe(503)
    expect(store.get('hub', 'one').rootId).toBe(root.id)
    expect((await get('hub', 'one-cleared')).json().binding.rootId).toBe(root.id)
    expect(store.get('hub', 'one').revision).toBe(0)
  })

  it('preserves clear mute handling even if carrying the Knowledge binding fails', async () => {
    const { app, runtime, manager, put, root } = await fixture()
    await put(root.id)
    manager.legacyClear = true
    vi.spyOn(runtime.pushService!, 'settings').mockReturnValue({ mutedSessions: ['hub:one'] })
    const setSessionMuted = vi.fn(async () => ({ mutedSessions: ['hub:one-cleared'] }))
    Object.assign(runtime.pushService!, { setSessionMuted })
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    const response = await app.inject({
      method: 'POST', url: '/api/computers/hub/sessions/one/clear', headers: trusted,
    })
    expect(response.statusCode).toBe(503)
    expect(setSessionMuted).toHaveBeenCalledExactlyOnceWith('hub', 'one-cleared', true)
  })

  it('cleans only the explicitly deleted session association', async () => {
    const { app, put, root, store, knowledge } = await fixture()
    await put(root.id)
    await put(root.id, 0, 'hub', 'two')
    const response = await app.inject({
      method: 'DELETE', url: '/api/computers/hub/sessions/one', headers: trusted,
    })
    expect(response.statusCode).toBe(204)
    expect(store.get('hub', 'one').revision).toBe(0)
    expect(store.get('hub', 'two').rootId).toBe(root.id)
    expect(knowledge.getRoot(root.id)).toEqual(root)
  })

  it.each([false, true])('finishes failed delete cleanup idempotently (restart before retry: %s)', async (restart) => {
    let context = await fixture()
    const { manager, directory, root } = context
    await context.put(root.id)
    vi.mocked(rename).mockRejectedValueOnce(new Error('metadata rename refused'))
    const failed = await context.app.inject({
      method: 'DELETE', url: '/api/computers/hub/sessions/one', headers: trusted,
    })
    expect(failed.statusCode).toBe(503)
    expect(manager.deleteSession).toHaveBeenCalledOnce()
    expect(manager.sessions.some((session) => session.computerId === 'hub' && session.id === 'one')).toBe(false)
    expect(context.store.get('hub', 'one').rootId).toBe(root.id)
    if (restart) {
      await context.app.close()
      fixtures.splice(fixtures.findIndex((entry) => entry.runtime === context.runtime), 1)
      context = await fixture({ directory, manager })
      expect(context.store.get('hub', 'one').rootId).toBe(root.id)
    }
    const retried = await context.app.inject({
      method: 'DELETE', url: '/api/computers/hub/sessions/one', headers: trusted,
    })
    expect(retried.statusCode).toBe(204)
    // The fake provider throws not-found if called again. Confirmed passive
    // absence, rather than swallowing that exception, finishes the cleanup.
    expect(manager.deleteSession).toHaveBeenCalledOnce()
    expect(context.store.get('hub', 'one').revision).toBe(0)
    const reloaded = new SessionKnowledgeStore(directory, context.knowledge)
    await reloaded.initialize()
    expect(reloaded.get('hub', 'one').revision).toBe(0)
  })

  it.each([false, true])('does not infer delete completion from partial authority (active: %s)', async (active) => {
    const { app, manager, put, root, store } = await fixture()
    await put(root.id)
    manager.sessions = []
    manager.answeredComputerIds = active ? ['hub'] : []
    manager.historyAuthoritative = !active
    const response = await app.inject({
      method: 'DELETE', url: '/api/computers/hub/sessions/one', headers: trusted,
    })
    expect(response.statusCode).toBe(503)
    expect(manager.deleteSession).not.toHaveBeenCalled()
    expect(store.get('hub', 'one').rootId).toBe(root.id)
  })

  it.each([403, 500])('does not swallow an unrelated deletion failure with status %s', async (statusCode) => {
    const { app, manager, put, root, store } = await fixture()
    await put(root.id)
    manager.deleteSession.mockRejectedValueOnce(Object.assign(new Error('Deletion refused'), { statusCode }))
    const response = await app.inject({
      method: 'DELETE', url: '/api/computers/hub/sessions/one', headers: trusted,
    })
    expect(response.statusCode).toBe(statusCode)
    expect(store.get('hub', 'one').rootId).toBe(root.id)
  })

  it('cleans unpaired session owners but retains other sessions’ unavailable root snapshots', async () => {
    const { app, put, root, store, get, manager } = await fixture()
    manager.sessions.push(session('library', 'one'))
    await put(root.id)
    await put(root.id, 0, 'library', 'one')
    const response = await app.inject({
      method: 'DELETE', url: '/api/computers/library', headers: trusted,
    })
    expect(response.statusCode).toBe(204)
    expect(store.get('library', 'one').revision).toBe(0)
    expect((await get()).json().binding).toMatchObject({ rootId: root.id, root, available: false })
    expect((await get('library', 'one')).statusCode).toBe(404)
  })

  it('does not let an old unpair request erase a new pairing binding after catalog cleanup waits', async () => {
    const { app, manager, knowledge, root, secondRoot, put, get, store, directory } = await fixture()
    const owner = manager.computers.find((computer) => computer.id === 'worker')
    if (!owner) throw new Error('The fixture worker is missing')
    await knowledge.addRoot({
      computerId: owner.id, computerName: owner.name, name: 'Worker notes', path: '/worker/notes',
    })
    expect((await put(root.id, 0, 'worker', 'one')).statusCode).toBe(200)
    const cleanup = vi.spyOn(store, 'removeComputer')
    const originalRemoval = knowledge.removeRootsForComputer.bind(knowledge)
    const held = gate()
    vi.spyOn(knowledge, 'removeRootsForComputer').mockImplementationOnce(async (computerId) => {
      held.start()
      await held.wait
      return originalRemoval(computerId)
    })
    const removing = app.inject({
      method: 'DELETE', url: '/api/computers/worker', headers: trusted,
    }).then((response) => response)
    await held.started
    await vi.waitFor(() => expect(store.get('worker', 'one').revision).toBe(0))
    manager.computers.push(owner)
    manager.sessions.push(session('worker', 'one'))
    manager.rePair('worker')
    const created = await put(secondRoot.id, 0, 'worker', 'one')
    expect(created.statusCode).toBe(200)
    expect(created.json().binding).toMatchObject({ rootId: secondRoot.id, revision: 1 })
    held.finish()
    expect((await removing).statusCode).toBe(204)
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect((await get('worker', 'one')).json().binding).toMatchObject({
      rootId: secondRoot.id, revision: 1, available: true,
    })
    const reloaded = new SessionKnowledgeStore(directory, knowledge)
    await reloaded.initialize()
    expect(reloaded.get('worker', 'one')).toMatchObject({
      rootId: secondRoot.id, revision: 1, available: true,
    })
  })

  it('does not resurrect an association when its session owner is unpaired during persistence', async () => {
    const { app, manager, put, root, store, updates } = await fixture()
    const held = holdWrite()
    const pending = put(root.id, 0, 'worker', 'one').then((response) => response)
    await held.started
    const removed = new Promise<void>((resolve) => {
      manager.once('event', (event) => {
        expect(event.type).toBe('computer.removed')
        resolve()
      })
    })
    const removing = app.inject({
      method: 'DELETE', url: '/api/computers/worker', headers: trusted,
    }).then((response) => response)
    await removed
    held.finish()
    expect((await pending).statusCode).toBe(404)
    expect((await removing).statusCode).toBe(204)
    expect(store.get('worker', 'one').revision).toBe(0)
    expect(updates).toEqual([])
  })
})
