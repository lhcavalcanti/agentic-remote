import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'

type Catalog = Awaited<ReturnType<CopilotSessionLike['rpc']['commands']['list']>>['commands']

const start = new Date('2026-11-20T12:00:00.000Z').getTime()
const fixtures: Array<{ directory: string; service: AgentService }> = []
const releases: Array<() => void> = []

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((settle, fail) => { resolve = settle; reject = fail })
  return { promise, resolve, reject }
}

function catalog(description: string): Catalog {
  return [{ name: 'usage', description, kind: 'builtin', allowDuringAgentExecution: false }]
}

function listed(description: string) {
  return [{ name: 'usage', description, allowDuringAgentExecution: false }]
}

/** The value, or 'pending' when it has not settled by the next timer turn. */
async function soon<T>(promise: Promise<T>): Promise<T | 'pending'> {
  return Promise.race([promise, new Promise<'pending'>((resolve) => setTimeout(() => resolve('pending'), 100))])
}

function at(milliseconds: number) {
  vi.setSystemTime(start + milliseconds)
}

function runtime(sessionId: string, commands: () => Promise<Catalog>): CopilotSessionLike {
  return {
    sessionId,
    on: () => () => {},
    sendAndWait: vi.fn(async () => undefined),
    getEvents: vi.fn(async () => []),
    abort: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    rpc: {
      commands: { list: vi.fn(async () => ({ commands: await commands() })), invoke: vi.fn(), enqueue: vi.fn() },
      name: { set: vi.fn(async () => {}) },
      model: {
        getCurrent: vi.fn(async () => ({ modelId: 'fixture' })),
        switchTo: vi.fn(async () => ({ modelId: 'fixture' })),
      },
      mode: { set: vi.fn(async () => ({ status: 'applied', modelChanged: false })) },
    },
  } as unknown as CopilotSessionLike
}

async function fixture() {
  vi.useFakeTimers({ toFake: ['Date'] })
  at(0)
  const directory = path.resolve('graphify/.cache', `command-catalog-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot-home'))
  const store = new SessionStore(path.join(directory, 'state'))
  await store.initialize()
  const session = (id: string, extra: Partial<SessionDetail> = {}): SessionDetail => ({
    id, provider: 'copilot', cwd: directory, title: id, status: 'idle', isOpen: true,
    updatedAt: new Date(start).toISOString(), messages: [], ...extra,
  })
  for (const id of ['terminal-a', 'terminal-b']) {
    await store.create(session(id), { backend: 'terminal', managedOpen: true })
  }
  await store.create(session('sdk'), { backend: 'sdk', managedOpen: true })
  // Every folder catalog read is a temporary session; each one's list waits here.
  const reads: Array<ReturnType<typeof deferred<Catalog>>> = []
  const temporarySessions: CopilotSessionLike[] = []
  const sdk = runtime('sdk', async () => catalog('SDK session catalog'))
  const client: CopilotClientLike = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => []),
    createSession: vi.fn(async () => {
      const read = deferred<Catalog>()
      reads.push(read)
      releases.push(() => read.resolve(catalog('Released at teardown')))
      const temporary = runtime(`temporary-${reads.length}`, () => read.promise)
      temporarySessions.push(temporary)
      return temporary
    }),
    resumeSession: vi.fn(async () => sdk),
    listSessions: vi.fn(async () => []),
    deleteSession: vi.fn(async () => {}),
    rpc: {
      commands: { list: vi.fn(async () => ({ commands: [] })) },
      models: { list: vi.fn(async () => ({ models: [] })) },
    },
  } as unknown as CopilotClientLike
  const terminal = {
    has: vi.fn(async (id: string) => id !== 'sdk'),
    send: vi.fn(async () => false),
    cancel: vi.fn(async () => false),
  }
  const service = new AgentService(
    store, client, async () => [], async () => {}, async () => [], async () => undefined,
    terminal, async () => undefined, async () => undefined,
  )
  service['externalSessionIds'].add('terminal-a')
  service['externalSessionIds'].add('terminal-b')
  service['sessions'].set('sdk', sdk)
  fixtures.push({ directory, service })
  /** Reads the folder catalog once, as it was at `start`. */
  const seed = async (description = 'Catalog A') => {
    const reading = service.listCommands('terminal-a')
    await vi.waitFor(() => expect(reads).toHaveLength(1))
    reads[0].resolve(catalog(description))
    await expect(reading).resolves.toEqual(listed(description))
  }
  return { directory, store, service, client, terminal, reads, temporarySessions, sdk, seed }
}

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  for (const fixture of fixtures.splice(0)) {
    await Promise.allSettled([fixture.service.stop()])
    await rm(fixture.directory, { recursive: true, force: true })
  }
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('terminal command catalogs per folder', () => {
  it('starts one temporary session for concurrent requests in the same folder', async () => {
    const { service, client, terminal, reads, temporarySessions } = await fixture()

    const requests = [
      service.listCommands('terminal-a'),
      service.listCommands('terminal-b'),
      service.listCommands('terminal-a'),
    ]
    await vi.waitFor(() => expect(terminal.has).toHaveBeenCalledTimes(3))
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(client.createSession).toHaveBeenCalledOnce()
    reads[0].resolve(catalog('Catalog A'))
    await expect(Promise.all(requests)).resolves.toEqual([
      listed('Catalog A'), listed('Catalog A'), listed('Catalog A'),
    ])
    expect(temporarySessions[0].disconnect).toHaveBeenCalledOnce()
    expect(client.deleteSession).toHaveBeenCalledExactlyOnceWith('temporary-1')
  })

  it('answers a known terminal session from a fresh catalog without process discovery', async () => {
    const { service, client, terminal, seed } = await fixture()
    await seed()
    at(59_000)

    expect(await soon(service.listCommands('terminal-b'))).toEqual(listed('Catalog A'))
    expect(await soon(service.listCommands('terminal-a'))).toEqual(listed('Catalog A'))

    expect(terminal.has).toHaveBeenCalledOnce()
    expect(client.createSession).toHaveBeenCalledOnce()
  })

  it('serves a stale catalog at once while one background refresh replaces it', async () => {
    const { service, client, reads, seed } = await fixture()
    await seed()
    at(61_000)

    expect(await soon(service.listCommands('terminal-a'))).toEqual(listed('Catalog A'))
    expect(client.createSession).toHaveBeenCalledTimes(2)
    expect(await soon(service.listCommands('terminal-b'))).toEqual(listed('Catalog A'))
    expect(client.createSession).toHaveBeenCalledTimes(2)

    reads[1].resolve(catalog('Catalog B'))
    await vi.waitFor(() => expect(client.deleteSession).toHaveBeenCalledTimes(2))
    expect(await soon(service.listCommands('terminal-a'))).toEqual(listed('Catalog B'))
    expect(client.createSession).toHaveBeenCalledTimes(2)
  })

  it('keeps the previous catalog when a background refresh fails, and reports the failure', async () => {
    const { service, client, reads, seed } = await fixture()
    await seed()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    at(9 * 60_000)

    expect(await soon(service.listCommands('terminal-a'))).toEqual(listed('Catalog A'))
    reads[1].reject(new Error('Synthetic catalog failure'))
    await vi.waitFor(() => expect(client.deleteSession).toHaveBeenCalledTimes(2))
    await vi.waitFor(() => expect(warn).toHaveBeenCalledWith(
      expect.any(String), expect.objectContaining({ message: 'Synthetic catalog failure' }),
    ))

    expect(await soon(service.listCommands('terminal-b'))).toEqual(listed('Catalog A'))
  })

  it('waits for a fresh read once a catalog is over 10 minutes old', async () => {
    const { service, client, reads, seed } = await fixture()
    await seed()
    at(10 * 60_000 + 1_000)

    const reading = service.listCommands('terminal-a')
    expect(await soon(reading)).toBe('pending')
    expect(client.createSession).toHaveBeenCalledTimes(2)

    reads[1].resolve(catalog('Catalog B'))
    await expect(reading).resolves.toEqual(listed('Catalog B'))
  })

  it('still discovers an SDK session and lists its own catalog', async () => {
    const { service, terminal, seed } = await fixture()
    await seed()

    expect(await soon(service.listCommands('sdk'))).toEqual(listed('SDK session catalog'))
    expect(terminal.has).toHaveBeenCalledWith('sdk')
  })

  it.each([
    ['suspended', { suspended: true }],
    ['interrupted', { interruption: { detectedAt: new Date(start).toISOString(), previousStatus: 'idle' as const } }],
    ['archived', { archivedAt: new Date(start).toISOString(), isOpen: false }],
  ])('lists nothing for a %s terminal session even with a fresh folder catalog', async (_state, extra) => {
    const { service, store, directory, terminal, seed } = await fixture()
    await seed()
    await store.create({
      id: 'retained', provider: 'copilot', cwd: directory, title: 'Retained', status: 'idle', isOpen: true,
      updatedAt: new Date(start).toISOString(), messages: [], ...extra,
    }, { backend: 'terminal', managedOpen: true })
    service['externalSessionIds'].add('retained')

    expect(await soon(service.listCommands('retained'))).toEqual([])
    expect(terminal.has).not.toHaveBeenCalledWith('retained')
  })

  it('finishes a background refresh, temporary session included, before the runtime stops', async () => {
    const { service, client, reads, temporarySessions, seed } = await fixture()
    await seed()
    at(61_000)
    expect(await soon(service.listCommands('terminal-a'))).toEqual(listed('Catalog A'))

    const stopping = service.stop()
    expect(await soon(stopping)).toBe('pending')
    expect(client.stop).not.toHaveBeenCalled()
    reads[1].resolve(catalog('Catalog B'))
    await stopping

    expect(temporarySessions[1].disconnect).toHaveBeenCalledOnce()
    expect(client.deleteSession).toHaveBeenLastCalledWith('temporary-2')
    expect(client.stop).toHaveBeenCalledOnce()
  })
})
