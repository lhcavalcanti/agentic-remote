import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import Fastify from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
      sessionOrder: { revision: 0, bootstrapped: false, order: {} },
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
        order: { 'computer-1': ['computer-1:b', 'computer-1:a'] },
      },
    })
    await reopened.app.close()
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
