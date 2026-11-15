import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ServerEvent, SessionDetail } from '../shared/contracts.js'
import { ComputerManager } from './computer-manager.js'
import type { ComputerRegistry, RegisteredComputer } from './computer-registry.js'
import type { NodeIdentityStore } from './node-identity.js'
import { RemoteNodeClient } from './remote-node-client.js'
import type { SessionService } from './session-service.js'

function session(id: string, replacedSessionIds?: string[]): SessionDetail {
  return {
    id, title: id, cwd: '/project', messages: [], status: 'idle', isOpen: true,
    updatedAt: '2026-09-05T00:00:00.000Z', replacedSessionIds,
  }
}

const managers: ComputerManager[] = []
const releases: (() => void)[] = []
const remote = new Map<string, {
  active: () => Promise<SessionDetail[]>
  history: () => Promise<SessionDetail[]>
}>()

beforeEach(() => {
  remote.clear()
  vi.spyOn(RemoteNodeClient.prototype, 'connect').mockImplementation(() => {})
  vi.spyOn(RemoteNodeClient.prototype, 'stop').mockImplementation(() => {})
  vi.spyOn(RemoteNodeClient.prototype, 'getInfo').mockImplementation(async function (this: RemoteNodeClient) {
    if (this.computer.id === 'pending') return { id: 'worker', name: 'Worker', version: 'fixture' }
    throw new Error('No background discovery in this fixture')
  })
  vi.spyOn(RemoteNodeClient.prototype, 'listSessions').mockImplementation(function (this: RemoteNodeClient) {
    return remote.get(this.computer.id)!.active()
  })
  vi.spyOn(RemoteNodeClient.prototype, 'listHistory').mockImplementation(function (this: RemoteNodeClient) {
    return remote.get(this.computer.id)!.history()
  })
  vi.spyOn(RemoteNodeClient.prototype, 'getSession').mockRejectedValue(new Error('Must not open an agent'))
  vi.spyOn(RemoteNodeClient.prototype, 'activateSession').mockRejectedValue(new Error('Must not activate an agent'))
})

afterEach(() => {
  releases.splice(0).forEach((release) => release())
  managers.splice(0).forEach((manager) => manager.stop())
  vi.restoreAllMocks()
})

async function fixture() {
  const registered = new Map<string, RegisteredComputer>(['worker', 'unrelated'].map((id) => [
    id, { id, name: id, baseUrl: `http://${id}.example.test`, token: 'synthetic-test-token' },
  ]))
  const service = Object.assign(new EventEmitter<{ event: [ServerEvent] }>(), {
    providers: () => [],
    listSessions: vi.fn(() => [session('local')]),
    listHistory: vi.fn(() => [{ ...session('closed'), isOpen: false }]),
    getSession: vi.fn(),
    openSession: vi.fn(),
    activateSession: vi.fn(),
  })
  const worker = {
    active: vi.fn(async (): Promise<SessionDetail[]> => []),
    history: vi.fn(async (): Promise<SessionDetail[]> => []),
  }
  const unrelated = {
    active: vi.fn(() => new Promise<SessionDetail[]>(() => {})),
    history: vi.fn(() => new Promise<SessionDetail[]>(() => {})),
  }
  remote.set('worker', worker)
  remote.set('unrelated', unrelated)
  const manager = new ComputerManager(
    service as unknown as SessionService,
    { info: { id: 'hub', name: 'Hub', version: 'fixture' } } as NodeIdentityStore,
    {
      initialize: async () => undefined,
      list: () => [...registered.values()],
      upsert: async (computer: RegisteredComputer) => { registered.set(computer.id, computer) },
      remove: async (id: string) => registered.delete(id),
    } as unknown as ComputerRegistry,
  )
  managers.push(manager)
  await manager.initialize()
  return { manager, service, worker, unrelated }
}

describe('ComputerManager passive session metadata', () => {
  it('lists known open sessions without contacting cached or unanswered nodes', async () => {
    const { manager, service, worker, unrelated } = await fixture()
    worker.active.mockResolvedValue([session('known'), { ...session('closed-remote'), isOpen: false }])
    await manager.lookupSessionMetadata('worker', 'known')
    worker.active.mockClear()
    service.listSessions.mockReturnValue([session('local'), { ...session('closed-local'), isOpen: false }])
    expect(manager.listCachedSessions().map((entry) => [entry.computerId, entry.id])).toEqual([
      ['hub', 'local'], ['worker', 'known'],
    ])
    expect(worker.active).not.toHaveBeenCalled()
    expect(unrelated.active).not.toHaveBeenCalled()
    expect(RemoteNodeClient.prototype.getSession).not.toHaveBeenCalled()
    await manager.removeComputer('worker')
    expect(manager.listCachedSessions().map((entry) => entry.id)).toEqual(['local'])
  })

  it('does not wait for an unrelated hung node for local active or historical identities', async () => {
    const { manager, service, worker, unrelated } = await fixture()
    expect(await manager.lookupSessionMetadata('hub', 'local')).toMatchObject({
      session: { id: 'local', computerId: 'hub' }, activeAuthoritative: true, historyAuthoritative: false,
    })
    expect(await manager.lookupSessionMetadata('hub', 'closed')).toMatchObject({
      session: { id: 'closed', computerId: 'hub' }, activeAuthoritative: true, historyAuthoritative: true,
    })
    expect(worker.active).not.toHaveBeenCalled()
    expect(worker.history).not.toHaveBeenCalled()
    expect(unrelated.active).not.toHaveBeenCalled()
    expect(unrelated.history).not.toHaveBeenCalled()
    expect(service.openSession).not.toHaveBeenCalled()
    expect(service.activateSession).not.toHaveBeenCalled()
    expect(service.getSession).not.toHaveBeenCalled()
  })

  it('reads only the requested remote computer and relevant replacement lineage', async () => {
    const { manager, worker, unrelated, service } = await fixture()
    worker.active.mockResolvedValue([session('current', ['old']), session('unrelated-session')])
    const result = await manager.lookupSessionMetadata('worker', 'old')
    expect(result).toMatchObject({ activeAuthoritative: true, historyAuthoritative: true })
    expect(result.session).toBeUndefined()
    expect(result.relatedSessions.map((entry) => [entry.computerId, entry.id])).toEqual([['worker', 'current']])
    expect(service.listSessions).not.toHaveBeenCalled()
    expect(service.listHistory).not.toHaveBeenCalled()
    expect(unrelated.active).not.toHaveBeenCalled()
    expect(unrelated.history).not.toHaveBeenCalled()
    expect(RemoteNodeClient.prototype.getSession).not.toHaveBeenCalled()
    expect(RemoteNodeClient.prototype.activateSession).not.toHaveBeenCalled()
  })

  it('reports failed history separately from a successful empty active list', async () => {
    const { manager, worker } = await fixture()
    worker.history.mockRejectedValue(new Error('History timed out'))
    expect(await manager.lookupSessionMetadata('worker', 'historical')).toEqual({
      session: undefined, relatedSessions: [], activeAuthoritative: true, historyAuthoritative: false,
    })
  })

  it('does not claim active authority when only history answered', async () => {
    const { manager, worker } = await fixture()
    worker.active.mockRejectedValue(new Error('Active listing timed out'))
    worker.history.mockResolvedValue([{ ...session('closed'), isOpen: false }])
    expect(await manager.lookupSessionMetadata('worker', 'closed')).toMatchObject({
      session: { id: 'closed', computerId: 'worker' },
      activeAuthoritative: false, historyAuthoritative: true,
    })
  })

  it('distinguishes a same-registration cached identity from an authoritative answer', async () => {
    const { manager, worker } = await fixture()
    worker.active.mockResolvedValue([session('known')])
    await manager.lookupSessionMetadata('worker', 'known')
    worker.active.mockRejectedValue(new Error('Offline'))
    expect(await manager.lookupSessionMetadata('worker', 'known')).toMatchObject({
      session: { id: 'known' }, activeAuthoritative: false, historyAuthoritative: false,
    })
    expect(worker.history).not.toHaveBeenCalled()
  })

  it('does not reuse a previous registration’s passive metadata cache', async () => {
    const { manager, worker } = await fixture()
    worker.active.mockResolvedValue([session('old')])
    await manager.lookupSessionMetadata('worker', 'old')
    await manager.registerComputer({ baseUrl: 'http://worker.example.test', token: 'new-synthetic-token' })
    worker.active.mockRejectedValue(new Error('New node unavailable'))
    worker.history.mockRejectedValue(new Error('New history unavailable'))
    expect(await manager.lookupSessionMetadata('worker', 'old')).toEqual({
      session: undefined, relatedSessions: [], activeAuthoritative: false, historyAuthoritative: false,
    })
  })

  it('rejects a history response from a registration replaced during the read', async () => {
    const { manager, worker } = await fixture()
    let started!: () => void
    let finish!: () => void
    const entered = new Promise<void>((resolve) => { started = resolve })
    const gate = new Promise<void>((resolve) => { finish = resolve })
    releases.push(finish)
    worker.history.mockImplementationOnce(async () => {
      started()
      await gate
      return [session('old')]
    })
    const reading = manager.lookupSessionMetadata('worker', 'old')
    const refused = expect(reading).rejects.toMatchObject({ statusCode: 409 })
    await entered
    await manager.registerComputer({ baseUrl: 'http://worker.example.test', token: 'new-synthetic-token' })
    finish()
    await refused
  })

  it('rejects unregistered computer identities without contacting a provider', async () => {
    const { manager, worker, unrelated } = await fixture()
    await expect(manager.lookupSessionMetadata('unknown', 'one')).rejects.toThrow('Computer not found')
    expect(worker.active).not.toHaveBeenCalled()
    expect(unrelated.active).not.toHaveBeenCalled()
  })
})
