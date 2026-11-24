import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import Fastify from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagedSession } from '../shared/contracts.js'
import type { ComputerManager } from './computer-manager.js'
import type { KnowledgeStore } from './knowledge-store.js'
import { registerHubRoutes } from './hub-routes.js'
import { SessionOrderStore } from './session-order-store.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

async function orderStore(): Promise<SessionOrderStore> {
  const directory = await mkdtemp(path.join(tmpdir(), 'hub-session-order-'))
  directories.push(directory)
  const store = new SessionOrderStore(directory)
  await store.initialize()
  return store
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

async function hub(store: SessionOrderStore, extra: Record<string, unknown> = {}) {
  const manager = fakeManager(extra)
  const app = Fastify()
  await registerHubRoutes(app, manager, {} as KnowledgeStore, undefined, undefined, store)
  return { app, manager }
}

/**
 * Waits for the queued lifecycle work behind an event to reach a state.
 * The commit persists before it reports, so a fixed number of ticks would be
 * a race against a real file write.
 */
async function until(check: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (check()) return
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  throw new Error('Timed out waiting for the session order to settle')
}

/** A session as its computer's events describe it. */
function upserted(computerId: string, id: string, change: Partial<ManagedSession> = {}) {
  return {
    type: 'session.upserted',
    session: {
      id,
      computerId,
      computerName: computerId,
      title: 'Synthetic check',
      cwd: '/home/demo',
      updatedAt: '2026-11-19T00:00:00Z',
      status: 'idle',
      messages: [],
      ...change,
    } satisfies ManagedSession,
  }
}

let sentinels = 0

/**
 * Waits for every lifecycle change queued so far. Order work runs one change
 * at a time, so once a session seated behind them appears, they are done.
 */
async function settled(store: SessionOrderStore, manager: EventEmitter): Promise<void> {
  const id = `sentinel-${sentinels += 1}`
  manager.emit('event', upserted('sentinel', id))
  await until(() => (store.snapshot().order.sentinel ?? []).includes(`sentinel:${id}`))
}

describe('hub session order routes', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('returns the committed order and commits a lane', async () => {
    const store = await orderStore()
    const { app } = await hub(store)

    const empty = await app.inject({
      method: 'GET',
      url: '/api/session-order',
      headers: { host: 'localhost' },
    })
    expect(empty.statusCode).toBe(200)
    expect(empty.json()).toEqual({
      sessionOrder: {
        revision: 0,
        bootstrapped: false,
        showHidden: false,
        hidden: [],
        unread: [],
        order: {},
      },
    })

    await store.bootstrap({ 'computer-1': ['computer-1:a', 'computer-1:b'] })
    const saved = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1',
      headers: { host: 'localhost' },
      payload: { order: ['computer-1:b', 'computer-1:a'] },
    })
    expect(saved.statusCode).toBe(200)
    expect(saved.json()).toEqual({
      sessionOrder: {
        revision: 2,
        bootstrapped: true,
        showHidden: false,
        hidden: [],
        unread: [],
        order: { 'computer-1': ['computer-1:b', 'computer-1:a'] },
      },
    })
    await app.close()
  })

  it('refuses a lane holding another computer\'s session', async () => {
    const store = await orderStore()
    const { app } = await hub(store)

    const response = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1',
      headers: { host: 'localhost' },
      payload: { order: ['computer-1:a', 'computer-2:x'] },
    })
    expect(response.statusCode).toBe(400)
    expect(store.snapshot().revision).toBe(0)
    await app.close()
  })

  it('rejects a malformed payload', async () => {
    const store = await orderStore()
    const { app } = await hub(store)

    const response = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1',
      headers: { host: 'localhost' },
      payload: { order: 'nope' },
    })
    expect(response.statusCode).toBeGreaterThanOrEqual(400)
    expect(store.snapshot().revision).toBe(0)
    await app.close()
  })

  it('seeds an empty hub once through bootstrap', async () => {
    const store = await orderStore()
    const { app } = await hub(store)

    const first = await app.inject({
      method: 'POST',
      url: '/api/session-order/bootstrap',
      headers: { host: 'localhost' },
      payload: { order: { 'computer-1': ['computer-1:b', 'computer-1:a'] } },
    })
    expect(first.json().sessionOrder.order).toEqual({
      'computer-1': ['computer-1:b', 'computer-1:a'],
    })

    const second = await app.inject({
      method: 'POST',
      url: '/api/session-order/bootstrap',
      headers: { host: 'localhost' },
      payload: { order: { 'computer-1': ['computer-1:a', 'computer-1:b'] } },
    })
    expect(second.json().sessionOrder.order['computer-1']).toEqual([
      'computer-1:b',
      'computer-1:a',
    ])
    await app.close()
  })

  it('persists hidden-session visibility through the shared snapshot', async () => {
    const store = await orderStore()
    const { app } = await hub(store)

    const saved = await app.inject({
      method: 'PUT',
      url: '/api/session-order',
      headers: { host: 'localhost' },
      payload: { showHidden: true },
    })
    expect(saved.statusCode).toBe(200)
    expect(saved.json().sessionOrder).toMatchObject({
      revision: 1,
      showHidden: true,
    })

    for (const payload of [{}, { showHidden: 'yes' }]) {
      const refused = await app.inject({
        method: 'PUT',
        url: '/api/session-order',
        headers: { host: 'localhost' },
        payload,
      })
      expect(refused.statusCode).toBeGreaterThanOrEqual(400)
    }
    expect(store.snapshot().revision).toBe(1)
    await app.close()
  })

  it('hides and shows one session without reordering it', async () => {
    const store = await orderStore()
    await store.bootstrap({ 'computer-1': ['computer-1:a', 'computer-1:b'] })
    const { app } = await hub(store)

    const hidden = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1/b',
      headers: { host: 'localhost' },
      payload: { hidden: true },
    })
    expect(hidden.statusCode).toBe(200)
    expect(hidden.json().sessionOrder).toMatchObject({
      revision: 2,
      hidden: ['computer-1:b'],
      order: { 'computer-1': ['computer-1:a', 'computer-1:b'] },
    })

    const shown = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1/b',
      headers: { host: 'localhost' },
      payload: { hidden: false },
    })
    expect(shown.statusCode).toBe(200)
    expect(shown.json().sessionOrder).toMatchObject({ revision: 3, hidden: [] })
    await app.close()
  })

  it('refuses to hide a session the hub does not list, or a malformed request', async () => {
    const store = await orderStore()
    await store.bootstrap({ 'computer-1': ['computer-1:a'] })
    const { app } = await hub(store)

    const unknown = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1/retired',
      headers: { host: 'localhost' },
      payload: { hidden: true },
    })
    expect(unknown.statusCode).toBe(409)

    for (const request of [
      { url: '/api/session-order/computer-1/a', payload: { hidden: 'yes' } },
      { url: '/api/session-order/computer-1/a', payload: {} },
      { url: `/api/session-order/computer-1/${'a'.repeat(400)}`, payload: { hidden: true } },
    ]) {
      const refused = await app.inject({
        method: 'PUT',
        headers: { host: 'localhost' },
        ...request,
      })
      expect(refused.statusCode).toBeGreaterThanOrEqual(400)
    }
    expect(store.snapshot()).toMatchObject({ revision: 1, hidden: [] })
    await app.close()
  })

  it('marks one session unread and read without reordering it', async () => {
    const store = await orderStore()
    await store.bootstrap({ 'computer-1': ['computer-1:a', 'computer-1:b'] })
    const { app } = await hub(store)

    const unread = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1/b',
      headers: { host: 'localhost' },
      payload: { unread: true },
    })
    expect(unread.statusCode).toBe(200)
    expect(unread.json().sessionOrder).toMatchObject({
      revision: 2,
      hidden: [],
      unread: ['computer-1:b'],
      order: { 'computer-1': ['computer-1:a', 'computer-1:b'] },
    })

    const read = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1/b',
      headers: { host: 'localhost' },
      payload: { unread: false },
    })
    expect(read.statusCode).toBe(200)
    expect(read.json().sessionOrder).toMatchObject({ revision: 3, unread: [] })
    await app.close()
  })

  it('refuses to mark unread a session the hub does not list, or a malformed request', async () => {
    const store = await orderStore()
    await store.bootstrap({ 'computer-1': ['computer-1:a'] })
    const { app } = await hub(store)

    const unknown = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1/retired',
      headers: { host: 'localhost' },
      payload: { unread: true },
    })
    expect(unknown.statusCode).toBe(409)

    for (const payload of [{ unread: 'yes' }, { unread: true, hidden: true }, { unread: null }]) {
      const refused = await app.inject({
        method: 'PUT',
        url: '/api/session-order/computer-1/a',
        headers: { host: 'localhost' },
        payload,
      })
      expect(refused.statusCode).toBeGreaterThanOrEqual(400)
    }
    expect(store.snapshot()).toMatchObject({ revision: 1, hidden: [], unread: [] })
    await app.close()
  })

  it('marks a session unread when its turn ends, on any computer, with no browser connected', async () => {
    const store = await orderStore()
    const { app, manager } = await hub(store)
    await app.ready()

    // A paired node's session reaches the hub as the same events as its own.
    manager.emit('event', upserted('node-1', 'remote', { status: 'running' }))
    manager.emit('event', upserted('computer-1', 'local', { status: 'waiting' }))
    manager.emit('event', upserted('computer-1', 'failing', { status: 'idle' }))
    await settled(store, manager)
    expect(store.snapshot().unread).toEqual([])

    manager.emit('event', upserted('node-1', 'remote', { status: 'idle' }))
    manager.emit('event', upserted('computer-1', 'local', { status: 'idle' }))
    manager.emit('event', upserted('computer-1', 'failing', { status: 'error' }))
    await until(() => (store.snapshot().unread ?? []).length === 3)
    expect(store.snapshot().unread).toEqual([
      'node-1:remote',
      'computer-1:local',
      'computer-1:failing',
    ])
    await app.close()
  })

  it('leaves a session read when it is first seen, still needs you, or has more queued', async () => {
    const store = await orderStore()
    const { app, manager } = await hub(store)

    // Nothing says how a session's last turn went before this hub saw it.
    manager.emit('event', upserted('node-1', 'idle-at-start', { status: 'idle' }))
    manager.emit('event', upserted('node-1', 'failed-at-start', { status: 'error' }))
    for (const pending of [
      { pendingPermission: { requestId: 'permission', title: 'Run tests', options: [] } },
      {
        pendingUserInput: {
          requestId: 'question', question: 'Which file?', choices: [], allowFreeform: true,
        },
      },
      { queuedCount: 2 },
    ]) {
      manager.emit('event', upserted('node-1', 'busy', { status: 'running' }))
      manager.emit('event', upserted('node-1', 'busy', { status: 'idle', ...pending }))
    }
    await settled(store, manager)
    expect(store.snapshot().unread).toEqual([])
    await app.close()
  })

  it('carries unread to a cleared session and drops it when the session is closed', async () => {
    const store = await orderStore()
    const { app, manager } = await hub(store)
    manager.emit('event', upserted('node-1', 'a', { status: 'running' }))
    manager.emit('event', upserted('node-1', 'a', { status: 'idle' }))
    await until(() => (store.snapshot().unread ?? []).includes('node-1:a'))

    manager.emit('event', {
      type: 'session.removed',
      computerId: 'node-1',
      sessionId: 'a',
      replacedBy: 'a2',
    })
    await until(() => (store.snapshot().unread ?? []).includes('node-1:a2'))
    expect(store.snapshot().unread).toEqual(['node-1:a2'])

    manager.emit('event', {
      type: 'session.removed',
      computerId: 'node-1',
      sessionId: 'a2',
      closed: true,
    })
    await until(() => (store.snapshot().unread ?? []).length === 0)
    expect(store.snapshot().order).toEqual({})
    await app.close()
  })

  it('tracks discovery, clear replacement, deletion, and unpairing', async () => {
    const store = await orderStore()
    const { app, manager } = await hub(store)

    manager.emit('event', {
      type: 'session.upserted',
      session: { id: 'a', computerId: 'computer-1' },
    })
    manager.emit('event', {
      type: 'session.upserted',
      session: { id: 'b', computerId: 'computer-1' },
    })
    await until(() => (store.snapshot().order['computer-1'] ?? []).length === 2)
    expect(store.snapshot().order['computer-1']).toEqual(['computer-1:a', 'computer-1:b'])

    // A replacement takes the predecessor's slot rather than the end.
    manager.emit('event', {
      type: 'session.removed',
      computerId: 'computer-1',
      sessionId: 'a',
      replacedBy: 'a2',
    })
    await until(() =>
      (store.snapshot().order['computer-1'] ?? []).includes('computer-1:a2'),
    )
    expect(store.snapshot().order['computer-1']).toEqual(['computer-1:a2', 'computer-1:b'])

    manager.emit('event', {
      type: 'session.removed',
      computerId: 'computer-1',
      sessionId: 'b',
    })
    await until(() => (store.snapshot().order['computer-1'] ?? []).length === 1)
    expect(store.snapshot().order['computer-1']).toEqual(['computer-1:a2'])

    manager.emit('event', { type: 'computer.removed', computerId: 'computer-1' })
    await until(() => Object.keys(store.snapshot().order).length === 0)
    expect(store.snapshot().order).toEqual({})
    await app.close()
  })

  it('carries the replacement slot for a node that reports a plain removal', async () => {
    const store = await orderStore()
    const { app } = await hub(store, {
      clearConversation: async () => ({ id: 'session-1-cleared', computerId: 'computer-1' }),
    })
    await store.bootstrap({
      'computer-1': ['computer-1:other', 'computer-1:session-1', 'computer-1:last'],
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/computers/computer-1/sessions/session-1/clear',
      headers: { host: 'localhost' },
    })

    expect(response.statusCode).toBe(200)
    expect(store.snapshot().order['computer-1']).toEqual([
      'computer-1:other',
      'computer-1:session-1-cleared',
      'computer-1:last',
    ])
    await app.close()
  })

  it('keeps a cleared session hidden when its node reports a plain removal first', async () => {
    const store = await orderStore()
    await store.bootstrap({
      'computer-1': ['computer-1:other', 'computer-1:session-1', 'computer-1:last'],
    })
    await store.setSessionHidden('computer-1', 'session-1', true)
    await store.setSessionUnread('computer-1', 'session-1', true)
    const { app, manager } = await hub(store, {
      clearConversation: async () => {
        // A legacy node's own removal event is applied before its response.
        manager.emit('event', {
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
        })
        await until(() => !(store.snapshot().hidden ?? []).includes('computer-1:session-1'))
        return { id: 'session-1-cleared', computerId: 'computer-1' }
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/computers/computer-1/sessions/session-1/clear',
      headers: { host: 'localhost' },
    })

    expect(response.statusCode).toBe(200)
    expect(store.snapshot()).toMatchObject({
      hidden: ['computer-1:session-1-cleared'],
      unread: ['computer-1:session-1-cleared'],
      order: {
        'computer-1': ['computer-1:other', 'computer-1:session-1-cleared', 'computer-1:last'],
      },
    })
    await app.close()
  })

  it('does not re-hide a replacement that was shown while its clear was in flight', async () => {
    const store = await orderStore()
    await store.bootstrap({ 'computer-1': ['computer-1:session-1'] })
    await store.setSessionHidden('computer-1', 'session-1', true)
    const { app, manager } = await hub(store, {
      clearConversation: async () => {
        const shown = await app.inject({
          method: 'PUT',
          url: '/api/session-order/computer-1/session-1',
          headers: { host: 'localhost' },
          payload: { hidden: false },
        })
        expect(shown.statusCode).toBe(200)
        manager.emit('event', {
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
          replacedBy: 'session-1-cleared',
        })
        await until(() =>
          (store.snapshot().order['computer-1'] ?? []).includes('computer-1:session-1-cleared'),
        )
        return { id: 'session-1-cleared', computerId: 'computer-1' }
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/computers/computer-1/sessions/session-1/clear',
      headers: { host: 'localhost' },
    })

    expect(response.statusCode).toBe(200)
    expect(store.snapshot()).toMatchObject({
      hidden: [],
      order: { 'computer-1': ['computer-1:session-1-cleared'] },
    })
    await app.close()
  })

  it('commits a lifecycle change even with no browser connected', async () => {
    const store = await orderStore()
    const { app, manager } = await hub(store)
    await app.ready()

    manager.emit('event', {
      type: 'session.upserted',
      session: { id: 'a', computerId: 'computer-1' },
    })
    await until(() => (store.snapshot().order['computer-1'] ?? []).length === 1)
    expect(store.snapshot().order['computer-1']).toEqual(['computer-1:a'])
    await app.close()
  })

  it('serves the same order to a hub rebuilt from the same directory', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'hub-session-order-'))
    directories.push(directory)
    const first = new SessionOrderStore(directory)
    await first.initialize()
    await first.bootstrap({ 'computer-1': ['computer-1:a', 'computer-1:b'] })
    const opened = await hub(first)
    await opened.app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1',
      headers: { host: 'localhost' },
      payload: { order: ['computer-1:b', 'computer-1:a'] },
    })
    await opened.app.close()

    // A fresh client against a restarted hub must see the same arrangement.
    const second = new SessionOrderStore(directory)
    await second.initialize()
    const reopened = await hub(second)
    const response = await reopened.app.inject({
      method: 'GET',
      url: '/api/session-order',
      headers: { host: 'localhost' },
    })
    expect(response.json()).toEqual({
      sessionOrder: {
        revision: 2,
        bootstrapped: true,
        showHidden: false,
        hidden: [],
        unread: [],
        order: { 'computer-1': ['computer-1:b', 'computer-1:a'] },
      },
    })
    await reopened.app.close()
  })

  it('seeds existing sessions by lineage rather than appending them', async () => {
    const store = await orderStore()
    await store.bootstrap({ 'computer-1': ['computer-1:a', 'computer-1:old', 'computer-1:z'] })
    const { app } = await hub(store, {
      listSessions: async () => [
        { id: 'a', computerId: 'computer-1' },
        // A clear this hub never saw: the successor must take its ancestor's
        // slot instead of landing at the end of the lane.
        { id: 'new', computerId: 'computer-1', replacedSessionIds: ['old'] },
        { id: 'z', computerId: 'computer-1' },
      ],
    })

    await until(() =>
      (store.snapshot().order['computer-1'] ?? []).includes('computer-1:new'),
    )
    expect(store.snapshot().order['computer-1']).toEqual([
      'computer-1:a',
      'computer-1:new',
      'computer-1:z',
    ])
    await app.close()
  })

  it('does not seed a session retired while the listing was in flight', async () => {
    const store = await orderStore()
    let release = () => {}
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    const { app, manager } = await hub(store, {
      listSessions: async () => {
        await held
        return [
          { id: 'stays', computerId: 'computer-1' },
          { id: 'gone', computerId: 'computer-1' },
          { id: 'orphan', computerId: 'computer-2' },
        ]
      },
    })

    // Both retirements are applied before the listing is even delivered.
    manager.emit('event', {
      type: 'session.removed',
      computerId: 'computer-1',
      sessionId: 'gone',
    })
    manager.emit('event', { type: 'computer.removed', computerId: 'computer-2' })
    release()

    await until(() => (store.snapshot().order['computer-1'] ?? []).length > 0)
    await app.close()
    expect(store.snapshot().order).toEqual({ 'computer-1': ['computer-1:stays'] })
  })

  it('refuses a lane arranged from a stale view', async () => {
    const store = await orderStore()
    await store.bootstrap({ 'computer-1': ['computer-1:a', 'computer-1:b'] })
    const { app } = await hub(store)

    const response = await app.inject({
      method: 'PUT',
      url: '/api/session-order/computer-1',
      headers: { host: 'localhost' },
      payload: { order: ['computer-1:retired', 'computer-1:b', 'computer-1:a'] },
    })
    expect(response.statusCode).toBe(409)
    expect(store.snapshot().order['computer-1']).toEqual(['computer-1:a', 'computer-1:b'])
    await app.close()
  })

  it('answers 503 when the hub has no order store', async () => {
    const app = Fastify()
    await registerHubRoutes(
      app,
      fakeManager(),
      {} as KnowledgeStore,
    )
    const response = await app.inject({
      method: 'GET',
      url: '/api/session-order',
      headers: { host: 'localhost' },
    })
    expect(response.statusCode).toBe(503)
    await app.close()
  })
})
