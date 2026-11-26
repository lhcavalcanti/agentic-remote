import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import Fastify from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type WebSocket from 'ws'
import type { ComputerSummary, HubEvent, HubWireEvent, ServerEvent, SessionDetail } from '../shared/contracts.js'
import { buildApp } from './app.js'
import type { ComputerManager } from './computer-manager.js'
import type { KnowledgeStore } from './knowledge-store.js'
import type { NodeIdentityStore } from './node-identity.js'
import type { PushNotificationService } from './push-notification-service.js'
import { registerHubRoutes } from './hub-routes.js'
import { sessionCategoryWriter } from './session-category-routes.js'
import { SessionCategoryStore } from './session-category-store.js'
import { SessionOrderStore } from './session-order-store.js'
import type { SessionService } from './session-service.js'

const directories: string[] = []
const host = { host: 'localhost' }

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

async function stores(order: Record<string, string[]> = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'hub-session-categories-'))
  directories.push(directory)
  const sessionOrder = new SessionOrderStore(directory)
  await sessionOrder.initialize()
  if (Object.keys(order).length) await sessionOrder.bootstrap(order)
  const categories = new SessionCategoryStore(directory)
  await categories.initialize()
  return { sessionOrder, categories, directory }
}

/** A manager that only has to relay lifecycle events and clear a session. */
function fakeManager(extra: Record<string, unknown> = {}) {
  const events = new EventEmitter()
  return Object.assign(events, {
    captureComputerRegistration: () => () => true,
    listSessions: async () => [],
    ...extra,
  }) as unknown as ComputerManager & EventEmitter
}

async function hub(
  { sessionOrder, categories }: { sessionOrder?: SessionOrderStore; categories?: SessionCategoryStore },
  extra: Record<string, unknown> = {},
) {
  const manager = fakeManager(extra)
  const app = Fastify()
  await registerHubRoutes(
    app, manager, {} as KnowledgeStore, undefined, undefined, sessionOrder,
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    categories,
  )
  return { app, manager }
}

async function until(check: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (check()) return
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  throw new Error('Timed out waiting for the categories to settle')
}

const members = (store: SessionCategoryStore) =>
  store.snapshot().categories.map((category) => [category.id, category.sessions])

describe('hub session category routes', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('serves the categories and commits each change against its revision', async () => {
    const owned = await stores({ hub: ['hub:a', 'hub:b'], node: ['node:c'] })
    const { app } = await hub(owned)
    const send = async (method: 'POST' | 'PATCH' | 'DELETE', url: string, payload?: object) => {
      const response = await app.inject({ method, url, headers: host, ...(payload ? { payload } : {}) })
      expect(response.statusCode).toBe(200)
      return response.json().sessionCategories
    }

    expect((await app.inject({ method: 'GET', url: '/api/session-categories', headers: host })).json())
      .toEqual({ sessionCategories: { revision: 0, categories: [] } })
    expect(await send('POST', '/api/session-categories', {
      revision: 0, id: 'lab', name: 'Homelab',
      sessions: [{ computerId: 'node', sessionId: 'c' }, { computerId: 'hub', sessionId: 'a' }],
    })).toEqual({
      revision: 1,
      categories: [{ id: 'lab', name: 'Homelab', collapsed: false, sessions: ['node:c', 'hub:a'] }],
    })
    const created = await send('POST', '/api/session-categories', { revision: 1, name: 'Reviews' })
    const reviews = created.categories[1].id as string
    expect(reviews).toMatch(/^[A-Za-z0-9_-]+$/)
    await send('PATCH', `/api/session-categories/${reviews}`, { revision: 2, name: 'Code reviews', index: 0 })
    await send('PATCH', '/api/session-categories/lab', { revision: 3, collapsed: true })
    await send('POST', '/api/session-categories/move', {
      revision: 4, categoryId: 'lab', index: 1, sessions: [{ computerId: 'hub', sessionId: 'b' }],
    })
    await send('POST', '/api/session-categories/move', {
      revision: 5, categoryId: null, sessions: [{ computerId: 'node', sessionId: 'c' }],
    })
    expect(owned.categories.snapshot()).toEqual({
      revision: 6,
      categories: [
        { id: reviews, name: 'Code reviews', collapsed: false, sessions: [] },
        { id: 'lab', name: 'Homelab', collapsed: true, sessions: ['hub:b', 'hub:a'] },
      ],
    })
    // Deleting a category leaves its sessions listed, in no category.
    expect(await send('DELETE', '/api/session-categories/lab?revision=6')).toEqual({
      revision: 7,
      categories: [{ id: reviews, name: 'Code reviews', collapsed: false, sessions: [] }],
    })
    expect(owned.sessionOrder.snapshot().order).toEqual({ hub: ['hub:a', 'hub:b'], node: ['node:c'] })
    await app.close()
  })

  it('refuses a stale, malformed, unknown, or unlisted change without committing it', async () => {
    const owned = await stores({ hub: ['hub:a'] })
    await owned.categories.change(0, { type: 'create', id: 'lab', name: 'Homelab' })
    const { app } = await hub(owned)
    const status = async (method: 'POST' | 'PATCH' | 'DELETE', url: string, payload?: object) =>
      (await app.inject({ method, url, headers: host, ...(payload ? { payload } : {}) })).statusCode

    expect(await status('PATCH', '/api/session-categories/lab', { revision: 0, collapsed: true })).toBe(409)
    expect(await status('DELETE', '/api/session-categories/lab?revision=0')).toBe(409)
    expect(await status('PATCH', '/api/session-categories/lab', { revision: 1 })).toBe(400)
    expect(await status('DELETE', '/api/session-categories/lab')).toBe(400)
    expect(await status('POST', '/api/session-categories', { revision: 1, name: '' })).toBe(400)
    expect(await status('POST', '/api/session-categories', { revision: 1, name: 'homelab' })).toBe(409)
    expect(await status('POST', '/api/session-categories/move', {
      revision: 1, categoryId: 'lab', sessions: [],
    })).toBe(400)
    expect(await status('PATCH', '/api/session-categories/gone', { revision: 1, collapsed: true })).toBe(404)
    expect(await status('POST', '/api/session-categories/move', {
      revision: 1, categoryId: 'lab', sessions: [{ computerId: 'hub', sessionId: 'unlisted' }],
    })).toBe(409)
    expect(owned.categories.snapshot().revision).toBe(1)
    await app.close()
  })

  it('answers 503 without categories, or while their file cannot be used', async () => {
    const owned = await stores()
    const choose = { method: 'PATCH', url: '/api/session-categories', headers: host, payload: { revision: 0, collapsedShows: 'none' } } as const
    const without = await hub({ sessionOrder: owned.sessionOrder })
    expect((await without.app.inject({ method: 'GET', url: '/api/session-categories', headers: host })).statusCode)
      .toBe(503)
    expect((await without.app.inject(choose)).statusCode).toBe(503)
    await without.app.close()

    await writeFile(path.join(owned.directory, 'session-categories.json'), JSON.stringify({ version: 2 }))
    const newer = new SessionCategoryStore(owned.directory)
    await newer.initialize()
    const { app } = await hub({ sessionOrder: owned.sessionOrder, categories: newer })
    const response = await app.inject({ method: 'GET', url: '/api/session-categories', headers: host })
    expect(response.statusCode).toBe(503)
    expect(JSON.stringify(response.json())).toMatch(/newer release/)
    const chosen = await app.inject(choose)
    expect(chosen.statusCode).toBe(503)
    expect(JSON.stringify(chosen.json())).toMatch(/newer release/)
    await app.close()
  })

  it('chooses what a collapsed category keeps in sight against the revision, refusing a stale or unknown choice', async () => {
    const owned = await stores({ hub: ['hub:a'] })
    await owned.categories.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a'] })
    const { app } = await hub(owned)
    const choose = (payload: object) => app.inject({ method: 'PATCH', url: '/api/session-categories', headers: host, payload })
    const lab = { id: 'lab', name: 'Lab', collapsed: false, sessions: ['hub:a'] }

    const chosen = await choose({ revision: 1, collapsedShows: 'none' })
    expect(chosen.statusCode).toBe(200)
    expect(chosen.json()).toEqual({ sessionCategories: { revision: 2, categories: [lab], collapsedShows: 'none' } })
    expect((await app.inject({ method: 'GET', url: '/api/session-categories', headers: host })).json())
      .toEqual(chosen.json())

    expect((await choose({ revision: 1, collapsedShows: 'attention' })).statusCode).toBe(409)
    for (const malformed of [
      { revision: 2, collapsedShows: 'everything' },
      { revision: 2 },
      { collapsedShows: 'attention' },
      { revision: 2, collapsedShows: 'attention', categories: [] },
    ]) {
      expect((await choose(malformed)).statusCode).toBe(400)
    }
    expect(owned.categories.snapshot()).toEqual({ revision: 2, categories: [lab], collapsedShows: 'none' })
    await app.close()
  })

  it('keeps a cleared or recovered session in its category through its replacement', async () => {
    const owned = await stores({ hub: ['hub:a', 'hub:b', 'hub:c'] })
    await owned.categories.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a', 'hub:b', 'hub:c'] })
    const { app, manager } = await hub(owned, {
      clearConversation: async () => {
        // A legacy node's own plain removal is applied before its response.
        manager.emit('event', { type: 'session.removed', computerId: 'hub', sessionId: 'b' })
        await until(() => !owned.categories.snapshot().categories[0].sessions.includes('hub:b'))
        return { id: 'b2', computerId: 'hub' }
      },
      recoverConversation: async () => ({ id: 'c2', computerId: 'hub' }),
    })

    manager.emit('event', { type: 'session.removed', computerId: 'hub', sessionId: 'a', replacedBy: 'a2' })
    await until(() => owned.categories.snapshot().categories[0].sessions.includes('hub:a2'))
    expect((await app.inject({ method: 'POST', url: '/api/computers/hub/sessions/b/clear', headers: host })).statusCode)
      .toBe(200)
    expect((await app.inject({
      method: 'POST', url: '/api/computers/hub/sessions/c/recover', headers: host, payload: { reason: 'manual' },
    })).statusCode).toBe(200)
    expect(members(owned.categories)).toEqual([['lab', ['hub:a2', 'hub:b2', 'hub:c2']]])
    await app.close()
  })

  it('remembers a closed session\'s category for Reopen, and forgets deleted and unpaired ones', async () => {
    const owned = await stores({ hub: ['hub:a', 'hub:b'], node: ['node:c'] })
    await owned.categories.change(0, {
      type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a', 'hub:b', 'node:c'],
    })
    const { app, manager } = await hub(owned)

    manager.emit('event', { type: 'session.removed', computerId: 'hub', sessionId: 'a', closed: true })
    manager.emit('event', { type: 'session.upserted', session: { id: 'a', computerId: 'hub' } })
    manager.emit('event', { type: 'session.removed', computerId: 'hub', sessionId: 'b' })
    manager.emit('event', { type: 'session.upserted', session: { id: 'found', computerId: 'hub' } })
    manager.emit('event', { type: 'computer.removed', computerId: 'node' })
    await until(() => owned.categories.snapshot().revision === 5)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(owned.categories.snapshot()).toEqual({
      revision: 5,
      categories: [{ id: 'lab', name: 'Lab', collapsed: false, sessions: ['hub:a'] }],
    })
    await app.close()
  })

  it('takes only an open session\'s arrival as Reopen', async () => {
    const owned = await stores({ hub: ['hub:a'] })
    await owned.categories.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a'] })
    const { app, manager } = await hub(owned)

    manager.emit('event', { type: 'session.removed', computerId: 'hub', sessionId: 'a', closed: true })
    await until(() => owned.categories.snapshot().revision === 2)
    // Still closed: a closed or archived record arriving is not a reopen.
    manager.emit('event', { type: 'session.upserted', session: { id: 'a', computerId: 'hub', isOpen: false, closedAt: '2026-11-25T00:00:00Z' } })
    manager.emit('event', { type: 'session.upserted', session: { id: 'a', computerId: 'hub', isOpen: false, archivedAt: '2026-11-25T00:00:00Z' } })
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(owned.categories.snapshot().revision).toBe(2)
    manager.emit('event', { type: 'session.upserted', session: { id: 'a', computerId: 'hub' } })
    await until(() => owned.categories.snapshot().revision === 3)
    await app.close()
  })

  it('seeds sessions the hub already lists by lineage, without placing any it finds', async () => {
    const owned = await stores({ hub: ['hub:old'] })
    await owned.categories.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:old'] })
    const { app } = await hub(owned, {
      listSessions: async () => [
        { id: 'new', computerId: 'hub', replacedSessionIds: ['old'] },
        { id: 'other', computerId: 'hub' },
      ],
    })
    await until(() => owned.categories.snapshot().categories[0].sessions.includes('hub:new'))
    expect(members(owned.categories)).toEqual([['lab', ['hub:new']]])
    await app.close()
  })

  it('changes categories on the hub itself as a browser does, placing only a session the list holds', async () => {
    const owned = await stores({ hub: ['hub:a'] })
    const writer = sessionCategoryWriter(owned.categories, owned.sessionOrder)

    expect(writer.snapshot()).toEqual({ revision: 0, categories: [] })
    expect(writer.unavailableReason()).toBeUndefined()
    await expect(writer.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:unlisted'] }))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(await writer.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a'] })).toEqual({
      revision: 1, categories: [{ id: 'lab', name: 'Lab', collapsed: false, sessions: ['hub:a'] }],
    })
    await expect(writer.change(0, { type: 'move', sessions: ['hub:a'], categoryId: null }))
      .rejects.toMatchObject({ statusCode: 409 })
    // Without a session order nothing is listed, so nothing can be placed.
    await expect(sessionCategoryWriter(owned.categories, undefined)
      .change(1, { type: 'move', sessions: ['hub:a'], categoryId: 'lab', index: 0 }))
      .rejects.toMatchObject({ statusCode: 409 })
  })

  it('lists a session it creates before answering, so it can go into a category at once', async () => {
    const owned = await stores({ hub: ['hub:a'] })
    await owned.categories.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a'] })
    // A slow order write, as on a busy disk: the session takes a while to be listed.
    let listNow!: () => void
    const slow = new Promise<void>((resolve) => { listNow = resolve })
    const append = owned.sessionOrder.appendSession.bind(owned.sessionOrder)
    vi.spyOn(owned.sessionOrder, 'appendSession').mockImplementation(async (computerId, sessionId) => {
      await slow
      return append(computerId, sessionId)
    })
    const { app } = await hub(owned, {
      createSession: async () => ({ id: 'new', computerId: 'hub', title: 'New', cwd: '/tmp/work' }),
    })

    const creating = app.inject({
      method: 'POST', url: '/api/computers/hub/sessions', headers: host, payload: { cwd: '/tmp/work' },
    })
    setTimeout(listNow, 50)
    expect((await creating).statusCode).toBe(201)
    const moved = await app.inject({
      method: 'POST', url: '/api/session-categories/move', headers: host,
      payload: { revision: 1, categoryId: 'lab', sessions: [{ computerId: 'hub', sessionId: 'new' }] },
    })
    expect(moved.statusCode).toBe(200)
    expect(members(owned.categories)).toEqual([['lab', ['hub:a', 'hub:new']]])
    await app.close()
  })

  it('tries a created session\'s seat once more when the order could not save it, before answering', async () => {
    const owned = await stores({ hub: ['hub:a'] })
    await owned.categories.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a'] })
    vi.spyOn(owned.sessionOrder, 'appendSession').mockRejectedValueOnce(new Error('No space left on device'))
    const { app } = await hub(owned, {
      createSession: async () => ({ id: 'new', computerId: 'hub', title: 'New', cwd: '/tmp/work' }),
    })

    const created = await app.inject({
      method: 'POST', url: '/api/computers/hub/sessions', headers: host, payload: { cwd: '/tmp/work' },
    })
    expect(created.statusCode).toBe(201)
    expect(owned.sessionOrder.indexOf('hub', 'new')).toBe(1)
    const moved = await app.inject({
      method: 'POST', url: '/api/session-categories/move', headers: host,
      payload: { revision: 1, categoryId: 'lab', sessions: [{ computerId: 'hub', sessionId: 'new' }] },
    })
    expect(moved.statusCode).toBe(200)
    await app.close()
  })
})

describe('session.categories.updated', () => {
  const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }

  class FakeManager extends EventEmitter<{ event: [HubEvent] }> {
    computers: ComputerSummary[] = [{ id: 'hub', name: 'Hub', isLocal: true, online: true }]
    initialize = vi.fn(async () => undefined)
    stop = vi.fn()
    listComputers = vi.fn(() => structuredClone(this.computers))
    listSessions = vi.fn(async () => [{ id: 'a', computerId: 'hub' }])
    listSessionsWithAuthority = vi.fn(async () => ({ sessions: [], answeredComputerIds: ['hub'] }))
    listHistory = vi.fn(async () => [])
  }

  function inbox(socket: WebSocket) {
    const events: HubWireEvent[] = []
    socket.on('message', (data) => {
      const event = JSON.parse(data.toString()) as HubWireEvent
      if (event.type === 'session.categories.updated') events.push(event)
    })
    return events
  }

  async function startHub() {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
    const directory = path.join(process.cwd(), `.session-category-routes-test-${randomUUID()}`)
    directories.push(directory)
    const manager = new FakeManager()
    const service = Object.assign(new EventEmitter<{ event: [ServerEvent] }>(), {
      providers: () => [],
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      listSessions: vi.fn((): SessionDetail[] => []),
      listHistory: vi.fn((): SessionDetail[] => []),
    })
    const built = await buildApp({
      dataDirectory: directory,
      logger: false,
      managerAgent: false,
      cliCanary: false,
      service: service as unknown as SessionService,
      manager: manager as unknown as ComputerManager,
      identity: {
        initialize: async () => undefined,
        info: { id: 'hub', name: 'Hub', version: 'fixture' },
        token: 'synthetic-node-test-token',
      } as unknown as NodeIdentityStore,
      pushService: {
        initialize: async () => undefined,
        attach: () => undefined,
        attachOracle: () => undefined,
        setPolicy: () => undefined,
        stop: () => undefined,
        settings: () => ({ mutedSessions: [] }),
      } as unknown as PushNotificationService,
      transcriptionService: { initialize: async () => undefined, stop: async () => undefined, transcribe: vi.fn() },
    })
    await built.app.ready()
    return { ...built, manager }
  }

  it('brings every connected browser to the same categories', async () => {
    const { app, manager } = await startHub()
    const first = await app.injectWS('/api/events', { headers: trusted })
    const second = await app.injectWS('/api/events', { headers: trusted })
    try {
      const firstEvents = inbox(first)
      const secondEvents = inbox(second)
      // Seated by the hub's own listing, so it can be placed.
      await until(() => manager.listSessions.mock.calls.length > 0)
      let created
      for (let attempt = 0; attempt < 100; attempt += 1) {
        created = await app.inject({
          method: 'POST', url: '/api/session-categories', headers: trusted,
          payload: { revision: 0, id: 'lab', name: 'Lab', sessions: [{ computerId: 'hub', sessionId: 'a' }] },
        })
        if (created.statusCode === 200) break
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
      expect(created?.statusCode).toBe(200)
      const committed = created!.json().sessionCategories
      await until(() => firstEvents.length === 1 && secondEvents.length === 1)
      expect(firstEvents).toEqual([{ type: 'session.categories.updated', categories: committed }])
      expect(secondEvents).toEqual(firstEvents)

      // Lifecycle changes reach them the same way.
      manager.emit('event', { type: 'session.removed', computerId: 'hub', sessionId: 'a' })
      await until(() => firstEvents.length === 2 && secondEvents.length === 2)
      expect(secondEvents[1]).toEqual({
        type: 'session.categories.updated',
        categories: { revision: 2, categories: [{ id: 'lab', name: 'Lab', collapsed: false, sessions: [] }] },
      })
    } finally {
      first.terminate()
      second.terminate()
      await app.close()
    }
  })

  it('brings every connected browser to the same choice of what a collapsed category keeps in sight', async () => {
    const { app } = await startHub()
    const first = await app.injectWS('/api/events', { headers: trusted })
    const second = await app.injectWS('/api/events', { headers: trusted })
    try {
      const firstEvents = inbox(first)
      const secondEvents = inbox(second)
      const chosen = await app.inject({
        method: 'PATCH', url: '/api/session-categories', headers: trusted,
        payload: { revision: 0, collapsedShows: 'attention' },
      })
      expect(chosen.statusCode).toBe(200)
      await until(() => firstEvents.length === 1 && secondEvents.length === 1)
      expect(firstEvents).toEqual([{
        type: 'session.categories.updated',
        categories: { revision: 1, categories: [], collapsedShows: 'attention' },
      }])
      expect(secondEvents).toEqual(firstEvents)
    } finally {
      first.terminate()
      second.terminate()
      await app.close()
    }
  })

  it('brings every browser to a change made on the hub itself, as Oracle makes them', async () => {
    const { app, manager, sessionCategoryStore, sessionOrderStore } = await startHub()
    const first = await app.injectWS('/api/events', { headers: trusted })
    const second = await app.injectWS('/api/events', { headers: trusted })
    try {
      const firstEvents = inbox(first)
      const secondEvents = inbox(second)
      await until(() => manager.listSessions.mock.calls.length > 0 && sessionOrderStore!.indexOf('hub', 'a') >= 0)
      const writer = sessionCategoryWriter(sessionCategoryStore!, sessionOrderStore)

      const committed = await writer.change(0, { type: 'create', id: 'lab', name: 'Lab', sessions: ['hub:a'] })
      await until(() => firstEvents.length === 1 && secondEvents.length === 1)
      expect(firstEvents).toEqual([{ type: 'session.categories.updated', categories: committed }])
      expect(secondEvents).toEqual(firstEvents)

      const renamed = await writer.change(1, { type: 'update', categoryId: 'lab', name: 'Home lab' })
      await until(() => firstEvents.length === 2 && secondEvents.length === 2)
      expect(secondEvents[1]).toEqual({ type: 'session.categories.updated', categories: renamed })
      // Each commit is said once.
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(firstEvents).toHaveLength(2)
    } finally {
      first.terminate()
      second.terminate()
      await app.close()
    }
  })
})
