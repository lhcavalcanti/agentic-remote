import { EventEmitter } from 'node:events'
import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComputerManager } from './computer-manager.js'
import type { KnowledgeStore } from './knowledge-store.js'
import { ClientPresence } from './client-presence.js'
import { registerHubRoutes } from './hub-routes.js'

describe('ClientPresence', () => {
  it("tracks whether any open app shows Oracle, and forgets an app that leaves", () => {
    const presence = new ClientPresence()
    const phone = {}
    const laptop = {}
    presence.update(phone, JSON.stringify({ type: 'presence', oracleVisible: true }))
    presence.update(laptop, Buffer.from(JSON.stringify({ type: 'presence', oracleVisible: false })))
    expect(presence.oracleWatched()).toBe(true)
    presence.update(phone, JSON.stringify({ type: 'presence', oracleVisible: false }))
    expect(presence.oracleWatched()).toBe(false)
    presence.update(laptop, JSON.stringify({ type: 'presence', oracleVisible: true }))
    presence.remove(laptop)
    expect(presence.oracleWatched()).toBe(false)
  })

  it('forgets a report that is not renewed, as from a phone that froze with Oracle open', () => {
    let now = 0
    const presence = new ClientPresence(() => now)
    const phone = {}
    presence.update(phone, JSON.stringify({ type: 'presence', oracleVisible: true }))
    now = 60_000
    expect(presence.oracleWatched()).toBe(true)
    // Renewed in time, it holds; left alone, it lapses.
    presence.update(phone, JSON.stringify({ type: 'presence', oracleVisible: true }))
    now = 140_000
    expect(presence.oracleWatched()).toBe(true)
    now = 150_001
    expect(presence.oracleWatched()).toBe(false)
  })

  it('ignores anything that is not a small, well-formed presence message', () => {
    const presence = new ClientPresence()
    const client = {}
    for (const raw of [
      '{not json',
      JSON.stringify({ type: 'presence', oracleVisible: 'yes' }),
      JSON.stringify({ type: 'other', oracleVisible: true }),
      JSON.stringify(['presence', true]),
      JSON.stringify({ type: 'presence', oracleVisible: true, pad: 'x'.repeat(300) }),
      42,
    ]) {
      presence.update(client, raw)
    }
    expect(presence.oracleWatched()).toBe(false)
  })
})

describe('hub event socket presence', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('takes presence from a connected app and drops it when the socket closes', async () => {
    const app = Fastify()
    await app.register(fastifyWebsocket)
    const presence = new ClientPresence()
    const manager = Object.assign(new EventEmitter(), {
      captureComputerRegistration: () => () => true,
      listSessions: async () => [],
    }) as unknown as ComputerManager
    await registerHubRoutes(
      app, manager, {} as KnowledgeStore, undefined, undefined, undefined, undefined, undefined, presence,
    )
    await app.ready()
    const socket = await app.injectWS('/api/events', { headers: { host: 'localhost' } })
    socket.send(JSON.stringify({ type: 'presence', oracleVisible: true }))
    await vi.waitFor(() => expect(presence.oracleWatched()).toBe(true))
    socket.terminate()
    await vi.waitFor(() => expect(presence.oracleWatched()).toBe(false))
    await app.close()
  })
})
