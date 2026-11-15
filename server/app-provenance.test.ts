import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, ManagedSession, SessionOrigin } from '../shared/contracts.js'
import { buildApp } from './app.js'
import type { ComputerManager } from './computer-manager.js'
import { ManagerStore } from './manager-store.js'

const directories: string[] = []
const applications: Array<{ close(): Promise<unknown> }> = []
const sockets: Array<{ terminate(): void }> = []
const releases: Array<() => void> = []
afterEach(async () => {
  for (const release of releases.splice(0)) release()
  for (const socket of sockets.splice(0)) socket.terminate()
  for (const app of applications.splice(0).reverse()) await app.close()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true })
})
const session = (id: string, revision = 1): ManagedSession => ({
  id, revision, computerId: 'studio', computerName: 'Studio', title: `Fictional ${id}`,
  cwd: '/fictional', status: 'idle', messages: [], updatedAt: '2026-11-15T19:00:00Z',
})

async function fixture(origin?: SessionOrigin, scheduler = false, evidence = true, earlySessions: ManagedSession[] = []) {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://localhost')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', scheduler ? 'on' : 'off')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', 'off')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'off')
  const directory = path.resolve(`.app-provenance-${randomUUID()}`)
  directories.push(directory)
  const file = path.join(directory, 'manager', 'sessions.json')
  const store = new ManagerStore(path.dirname(file))
  await store.initializeSessionRegistry()
  if (origin) await store.updateRegistry((registry) => {
    registry['studio:old'] = {
      computerId: 'studio', sessionId: 'old', title: session('old').title, firstSeenAt: session('old').updatedAt,
      origin, ...(evidence ? { originEvidence: origin === 'discovered' ? 'discovery' : 'launch' } : {}),
      ...(origin === 'schedule' ? { scheduleId: 'daily', scheduleRunId: 'run' } : {}),
    }
  })
  const current = new Map<string, ManagedSession>()
  if (origin) current.set('old', session('old'))
  const readSession = vi.fn(async (_computer: string, id: string) => {
    const value = current.get(id)
    if (!value) throw Object.assign(new Error('Session not found'), { statusCode: 404 })
    return structuredClone(value)
  })
  const listCachedSessions = vi.fn(() => [...current.values()])
  const managerEvents: HubEvent[] = []
  const manager = Object.assign(new EventEmitter(), {
    initialize: async () => {
      for (const value of earlySessions) {
        current.set(value.id, value)
        manager.emit('event', { type: 'session.upserted', session: value, summary: true })
      }
    },
    stop: () => undefined, readSession, listCachedSessions,
    listComputers: () => [{ id: 'studio', name: 'Studio', online: true, isLocal: true }],
    createSession: async () => current.get('next')!,
  }) as unknown as ComputerManager
  manager.on('event', (event) => managerEvents.push(event))
  const runtime = await buildApp({ dataDirectory: directory, manager, managerAgent: false, logger: false, serveStatic: false })
  applications.push(runtime.app)
  await runtime.app.ready()
  const socket = await runtime.app.injectWS('/api/events', { headers: { host: 'localhost', origin: 'http://localhost' } })
  sockets.push(socket)
  const messages: HubEvent[] = []
  socket.on('message', (data) => messages.push(JSON.parse(data.toString())))
  return {
    manager, current, messages, readSession, managerEvents, listCachedSessions,
    async createUser() {
      return runtime.app.inject({ method: 'POST', url: '/api/computers/studio/sessions', headers: { host: 'localhost', origin: 'http://localhost' }, payload: { cwd: '/fictional' } })
    },
    persisted: async () => JSON.parse(await readFile(file, 'utf8')),
    upsert(value: ManagedSession, summary?: true) {
      current.set(value.id, value)
      manager.emit('event', { type: 'session.upserted', session: value, ...(summary ? { summary } : {}) })
    },
    replace() {
      current.delete('old')
      manager.emit('event', { type: 'session.removed', computerId: 'studio', sessionId: 'old', replacedBy: 'next' })
    },
  }
}

describe('hub provenance publication', () => {
  it('reconciles an initial resync before attachment through discovery exactly once', async () => {
    const record = vi.spyOn(ManagerStore.prototype, 'recordDiscoveredSession')
    const f = await fixture(undefined, false, true, [session('early-external')])
    await vi.waitFor(async () => expect((await f.persisted())['studio:early-external']).toMatchObject({
      origin: 'discovered', originEvidence: 'discovery',
    }))
    await vi.waitFor(() => expect(f.managerEvents.filter((event) => event.type === 'session.upserted')).toHaveLength(2))
    expect(f.managerEvents.at(-1)).toMatchObject({ type: 'session.upserted', summary: true, session: { id: 'early-external' } })
    expect(f.listCachedSessions).toHaveBeenCalledOnce()
    f.upsert(session('early-external'))
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(record).toHaveBeenCalledOnce()
    expect(f.readSession).toHaveBeenCalledOnce()
  })

  it.each([
    ['user', 'before'], ['user', 'after'], ['manager', 'before'], ['manager', 'after'],
    ['schedule', 'before'], ['schedule', 'after'],
  ] as const)('Oracle-off replacement carries %s origin with successor %s removal', async (origin, order) => {
    const f = await fixture(origin)
    if (order === 'before') {
      f.upsert(session('next'))
      await vi.waitFor(async () => expect((await f.persisted())['studio:next']?.origin).toBe('discovered'))
    }
    f.replace()
    if (order === 'after') f.upsert(session('next'))
    await vi.waitFor(async () => expect((await f.persisted())['studio:next']).toMatchObject({
      origin, originEvidence: 'launch', ...(origin === 'schedule' ? { scheduleId: 'daily', scheduleRunId: 'run' } : {}),
    }))
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && message.session.provenance?.origin === origin,
    )).toBe(true))
    if (order === 'before') expect(f.messages.find((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && message.session.provenance?.origin === origin,
    )).toMatchObject({ summary: true })
  })

  it('publishes metadata-only discovery without waiting for another runtime revision', async () => {
    const f = await fixture()
    f.upsert(session('external'))
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'external' &&
      message.session.revision === 1 && message.session.provenance?.origin === 'discovered',
    )).toBe(true))
    expect(f.messages.find((message) => message.type === 'session.upserted' && message.session.provenance)).toMatchObject({ summary: true })
  })

  it.each([1, 2])('marks a summary discovery republish metadata-only when the passive read has revision %s', async (revision) => {
    const f = await fixture()
    const full = {
      ...session('external', revision),
      messages: [{ id: 'held-message', role: 'assistant' as const, content: 'Keep this fictional transcript.', createdAt: session('external').updatedAt }],
    }
    f.readSession.mockResolvedValue(full)
    f.upsert(session('external'), true)
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.provenance?.origin === 'discovered',
    )).toBe(true))
    const republished = f.messages.find((message) => message.type === 'session.upserted' && message.session.provenance)
    expect(republished).toMatchObject({
      type: 'session.upserted', summary: true,
      session: { revision, messages: revision === 1 ? [] : full.messages, provenance: { origin: 'discovered' } },
    })
  })

  it('publishes the current discovered session after persistence and never starts a rebroadcast loop', async () => {
    const f = await fixture()
    const original = ManagerStore.prototype.recordDiscoveredSession
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    releases.push(release)
    const record = vi.spyOn(ManagerStore.prototype, 'recordDiscoveredSession').mockImplementation(async function (this: ManagerStore, value) {
      await gate
      await original.call(this, value)
    })
    f.upsert(session('external'))
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'external' && !message.session.provenance,
    )).toBe(true))
    f.current.set('external', { ...session('external', 2), title: 'Current fictional state' })
    release()
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'external' &&
      message.session.revision === 2 && message.session.title === 'Current fictional state' &&
      message.session.provenance?.origin === 'discovered',
    )).toBe(true))
    expect(f.messages.find((message) => message.type === 'session.upserted' && message.session.provenance)).toMatchObject({ summary: true })
    f.upsert(f.current.get('external')!)
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(record).toHaveBeenCalledOnce()
    expect(f.readSession).toHaveBeenCalledOnce()
  })

  it('does not rebroadcast a discovery removed while its write is in flight', async () => {
    const f = await fixture()
    const original = ManagerStore.prototype.recordDiscoveredSession
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    releases.push(release)
    vi.spyOn(ManagerStore.prototype, 'recordDiscoveredSession').mockImplementation(async function (this: ManagerStore, value) {
      await gate
      await original.call(this, value)
    })
    f.upsert(session('external'))
    f.current.delete('external')
    f.manager.emit('event', { type: 'session.removed', computerId: 'studio', sessionId: 'external' })
    release()
    await vi.waitFor(async () => expect((await f.persisted())['studio:external']?.origin).toBe('discovered'))
    expect(f.readSession).not.toHaveBeenCalled()
    expect(f.messages.filter((message) => message.type === 'session.upserted' && message.session.provenance)).toEqual([])
  })

  it('lets replacement carry win over an in-flight successor discovery with one write and publication', async () => {
    const f = await fixture('user')
    const original = ManagerStore.prototype.recordDiscoveredSession
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    releases.push(release)
    vi.spyOn(ManagerStore.prototype, 'recordDiscoveredSession').mockImplementation(async function (this: ManagerStore, value) {
      await gate
      await original.call(this, value)
    })
    const writes = vi.spyOn(ManagerStore.prototype, 'updateRegistry')
    f.upsert(session('next'))
    f.replace()
    release()
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && message.session.provenance?.origin === 'user',
    )).toBe(true))
    expect(writes).toHaveBeenCalledOnce()
    expect(f.messages.filter((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && message.session.provenance?.origin === 'user',
    )).toEqual([expect.objectContaining({ summary: true })])
  })

  it('shares one schedule replacement write with the early schedule-suppression path', async () => {
    const f = await fixture('schedule', true)
    f.upsert(session('next'))
    await vi.waitFor(async () => expect((await f.persisted())['studio:next']?.origin).toBe('discovered'))
    const writes = vi.spyOn(ManagerStore.prototype, 'updateRegistry')
    f.replace()
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && message.session.provenance?.origin === 'schedule',
    )).toBe(true))
    expect(f.messages.find((message) => message.type === 'session.upserted' && message.session.provenance?.origin === 'schedule')).toMatchObject({ summary: true })
    expect(writes).toHaveBeenCalledOnce()
  })

  it('does not republish or overwrite an explicitly launched successor', async () => {
    const f = await fixture('manager')
    f.current.set('next', session('next'))
    expect((await f.createUser()).statusCode).toBe(201)
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && message.session.provenance?.origin === 'user',
    )).toBe(true))
    const before = f.messages.filter((message) => message.type === 'session.upserted' && message.session.id === 'next').length
    f.replace()
    await vi.waitFor(async () => expect((await f.persisted())['studio:old'].replacedBy).toBe('next'))
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(f.readSession).not.toHaveBeenCalled()
    expect(f.messages.filter((message) => message.type === 'session.upserted' && message.session.id === 'next')).toHaveLength(before)
    expect((await f.persisted())['studio:next']).toMatchObject({ origin: 'user', originEvidence: 'launch' })
  })

  it('keeps a legacy replacement unknown instead of fabricating launch evidence', async () => {
    const f = await fixture('user', false, false)
    f.upsert(session('next'))
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && message.session.provenance?.origin === 'discovered',
    )).toBe(true))
    f.messages.length = 0
    f.replace()
    await vi.waitFor(() => expect(f.messages.some((message) =>
      message.type === 'session.upserted' && message.session.id === 'next' && !message.session.provenance,
    )).toBe(true))
    expect(f.messages.find((message) => message.type === 'session.upserted' && message.session.id === 'next')).toMatchObject({ summary: true })
    expect((await f.persisted())['studio:next']).toMatchObject({ origin: 'user' })
    expect((await f.persisted())['studio:next'].originEvidence).toBeUndefined()
  })
})
