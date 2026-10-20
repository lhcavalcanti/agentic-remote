import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type WebSocket from 'ws'
import type {
  ComputerSummary, HubEvent, HubWireEvent, ManagedSession, ServerEvent, SessionDetail,
} from '../shared/contracts.js'
import { buildApp } from './app.js'
import type { ComputerManager } from './computer-manager.js'
import type { NodeIdentityStore } from './node-identity.js'
import type { PushNotificationService } from './push-notification-service.js'
import type { SessionService } from './session-service.js'

const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }
const directories: string[] = []
const apps: Awaited<ReturnType<typeof buildApp>>['app'][] = []

function session(content: string[]): ManagedSession {
  return {
    id: 'one', computerId: 'hub', computerName: 'Hub', title: 'One', cwd: '/project',
    updatedAt: '2026-09-05T00:00:00.000Z', status: 'idle', isOpen: true,
    messages: content.map((text, index) => ({
      id: `m${index}`, role: 'assistant', content: text, createdAt: '2026-09-05T00:00:00.000Z',
    })),
  }
}

class FakeManager extends EventEmitter<{ event: [HubEvent] }> {
  computers: ComputerSummary[] = [{ id: 'hub', name: 'Hub', isLocal: true, online: true }]
  initialize = vi.fn(async () => undefined)
  stop = vi.fn()
  listComputers = vi.fn(() => structuredClone(this.computers))
  listSessions = vi.fn(async () => [])
  listSessionsWithAuthority = vi.fn(async () => ({ sessions: [], answeredComputerIds: ['hub'] }))
  listHistory = vi.fn(async () => [])
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
})

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(apps.splice(0).map((app) => app.close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

async function fixture() {
  const directory = path.join(process.cwd(), `.session-patch-routes-test-${randomUUID()}`)
  directories.push(directory)
  const manager = new FakeManager()
  const service = Object.assign(new EventEmitter<{ event: [ServerEvent] }>(), {
    providers: () => [],
    start: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
    listSessions: vi.fn((): SessionDetail[] => []),
    listHistory: vi.fn((): SessionDetail[] => []),
  })
  const runtime = await buildApp({
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
  apps.push(runtime.app)
  await runtime.app.ready()
  return { app: runtime.app, manager }
}

function inbox(socket: WebSocket) {
  const events: HubWireEvent[] = []
  const waiters: (() => void)[] = []
  socket.on('message', (data) => {
    const event = JSON.parse(data.toString()) as HubWireEvent
    // Ordering preference events are sent alongside and are not under test.
    if (event.type === 'session.order.updated') return
    events.push(event)
    for (const waiter of waiters.splice(0)) waiter()
  })
  return {
    events,
    async next(count: number) {
      const deadline = Date.now() + 5_000
      while (events.length < count) {
        if (Date.now() > deadline) throw new Error(`Expected ${count} events, got ${events.length}`)
        await new Promise<void>((resolve) => {
          waiters.push(resolve)
          setTimeout(resolve, 50)
        })
      }
      return events
    },
  }
}

describe('/api/events session patches', () => {
  it('sends a patching socket changes only, and an ordinary socket whole sessions as before', async () => {
    const { app, manager } = await fixture()
    const patching = await app.injectWS('/api/events?patches=1', { headers: trusted })
    const ordinary = await app.injectWS('/api/events', { headers: trusted })
    try {
      const patched = inbox(patching)
      const whole = inbox(ordinary)
      const first = session(['a'.repeat(10_000), 'b'])
      const second = session(['a'.repeat(10_000), 'b', 'c'])
      manager.emit('event', { type: 'session.upserted', session: first })
      manager.emit('event', { type: 'session.upserted', session: second })
      const [full, patch] = await patched.next(2)
      expect(full).toEqual({ type: 'session.upserted', session: first, patchVersion: 1 })
      expect(patch).toMatchObject({
        type: 'session.patched',
        patch: { from: 1, to: 2, keep: 2, count: 3, messages: [second.messages[2]] },
      })
      expect(JSON.stringify(patch).length).toBeLessThan(1_000)
      expect(await whole.next(2)).toEqual([
        { type: 'session.upserted', session: first },
        { type: 'session.upserted', session: second },
      ])
    } finally {
      patching.terminate()
      ordinary.terminate()
    }
  })

  it('answers a resync with the whole latest session, and ignores anything else sent to it', async () => {
    const { app, manager } = await fixture()
    const socket = await app.injectWS('/api/events?patches=1', { headers: trusted })
    try {
      const received = inbox(socket)
      manager.emit('event', { type: 'session.upserted', session: session(['a']) })
      await received.next(1)
      socket.send('not json')
      socket.send(JSON.stringify({ type: 'session.resync', computerId: 'hub', sessionId: 'one', padding: 'x'.repeat(2_000) }))
      socket.send(JSON.stringify({ type: 'session.resync', computerId: 7, sessionId: 'one' }))
      socket.send(JSON.stringify({ type: 'something.else' }))
      socket.send(Buffer.from([1, 2, 3]), { binary: true })
      socket.send(JSON.stringify({ type: 'session.resync', computerId: 'hub', sessionId: 'unknown' }))
      socket.send(JSON.stringify({ type: 'session.resync', computerId: 'hub', sessionId: 'one' }))
      const events = await received.next(2)
      expect(events[1]).toEqual({ type: 'session.upserted', session: session(['a']), patchVersion: 1 })
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(received.events).toHaveLength(2)
    } finally {
      socket.terminate()
    }
  })

  it('still refuses an untrusted origin that asks for patches', async () => {
    const { app } = await fixture()
    await expect(app.injectWS('/api/events?patches=1', {
      headers: { host: 'hub.example.test', origin: 'https://attacker.example.test' },
    })).rejects.toThrow()
  })

  it('ignores resync requests on a socket that did not ask for patches', async () => {
    const { app, manager } = await fixture()
    const socket = await app.injectWS('/api/events', { headers: trusted })
    try {
      const received = inbox(socket)
      manager.emit('event', { type: 'session.upserted', session: session(['a']) })
      await received.next(1)
      socket.send(JSON.stringify({ type: 'session.resync', computerId: 'hub', sessionId: 'one' }))
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(received.events).toEqual([{ type: 'session.upserted', session: session(['a']) }])
    } finally {
      socket.terminate()
    }
  })
})
