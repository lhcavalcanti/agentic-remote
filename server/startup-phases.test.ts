import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike } from './agent-service.js'
import { buildApp } from './app.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import type { ManagerAgent } from './manager-agent.js'
import { ProviderSessionService } from './provider-session-service.js'
import { SessionStore } from './session-store.js'
import {
  createStartupPhases,
  startManagedServer,
  type StartupPhaseRecord,
} from './startup-phases.js'

const directories: string[] = []
const services: ProviderSessionService[] = []
const releases: Array<() => void> = []
const address = { host: '127.0.0.1', port: 4318 }

function gate() {
  let release = () => {}
  const promise = new Promise<void>((resolve) => { release = resolve })
  releases.push(release)
  return { promise, release }
}

function recorder() {
  const records: StartupPhaseRecord[] = []
  const lines: string[] = []
  let clock = 0
  const phases = createStartupPhases({
    now: () => (clock += 1.5),
    write: (line) => {
      lines.push(line)
      records.push(JSON.parse(line) as StartupPhaseRecord)
    },
  })
  return {
    phases,
    records,
    lines,
    trail: () => records.map(({ startupPhase, event }) => `${event} ${startupPhase}`),
  }
}

async function fixture({ queued = false } = {}) {
  const directory = path.resolve('graphify/.cache', `startup-phases-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  directories.push(directory)
  const calls: string[] = []
  const copilotId = 'startup-phase-copilot'
  const terminalId = 'startup-phase-terminal'
  const claudeId = 'startup-phase-claude'
  const updatedAt = '2026-10-15T00:00:00.000Z'
  if (queued) {
    const seed = new SessionStore(path.join(directory, 'copilot'))
    await seed.initialize()
    await seed.create({
      id: copilotId, provider: 'copilot', cwd: directory, title: 'Synthetic startup fixture',
      status: 'idle', isOpen: true, messages: [], updatedAt,
    }, { backend: 'sdk', managedOpen: true })
    await seed.enqueuePrompt(copilotId, { id: 'copilot-queued', content: 'Synthetic', createdAt: updatedAt })
    await seed.create({
      id: terminalId, provider: 'copilot', cwd: directory, title: 'Synthetic startup fixture',
      status: 'idle', isOpen: true, messages: [], updatedAt,
    }, { backend: 'terminal', managedOpen: true })
    await seed.enqueuePrompt(terminalId, { id: 'terminal-queued', content: 'Synthetic', createdAt: updatedAt })
    const claudeSeed = new SessionStore(path.join(directory, 'claude'))
    await claudeSeed.initialize()
    await claudeSeed.create({
      id: claudeId, provider: 'claude', cwd: directory, title: 'Synthetic startup fixture',
      status: 'idle', isOpen: true, messages: [], updatedAt,
    }, { backend: 'sdk', managedOpen: true })
    await claudeSeed.enqueuePrompt(claudeId, { id: 'claude-queued', content: 'Synthetic', createdAt: updatedAt })
  }
  const copilotStore = new SessionStore(path.join(directory, 'copilot'))
  const claudeStore = new SessionStore(path.join(directory, 'claude'))
  const client: CopilotClientLike = {
    start: vi.fn(async () => { calls.push('sdk') }),
    stop: async () => [],
    createSession: vi.fn(),
    resumeSession: vi.fn(),
    listSessions: vi.fn(async () => {
      calls.push('list')
      return queued
        ? [{
            sessionId: copilotId, startTime: new Date(updatedAt), modifiedTime: new Date(updatedAt),
            summary: 'Synthetic startup fixture', isRemote: false, context: { workingDirectory: directory },
          }]
        : []
    }),
    deleteSession: async () => {},
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: {
        list: vi.fn(async () => {
          calls.push('models')
          return { models: [{ id: 'synthetic', name: 'Synthetic' }] } as never
        }),
      },
    },
  }
  const terminal = {
    has: async () => false,
    send: async () => false,
    cancel: async () => false,
  }
  const agent = new AgentService(
    copilotStore, client,
    async () => { calls.push('active'); return [] },
    async () => {},
    async () => [],
    async () => undefined,
    terminal,
    async () => undefined,
    async () => undefined,
  )
  const sdk: ClaudeSdk = {
    query: vi.fn(),
    deleteSession: vi.fn(async () => {}),
    getSessionInfo: vi.fn(async () => undefined),
    renameSession: vi.fn(async () => {}),
  }
  const authenticate = vi.fn(async () => {
    calls.push('claude-auth')
    return { loggedIn: false }
  })
  const claude = new ClaudeAgentService(claudeStore, '/bin/true', sdk, authenticate)
  // Queued work is only observed; dispatching it would need a live runtime.
  agent['drainSdkQueue'] = async (sessionId) => { calls.push(`sdk-drain ${sessionId}`) }
  agent['drainTerminalQueue'] = async (sessionId) => { calls.push(`terminal-drain ${sessionId}`) }
  claude['drainQueue'] = async (sessionId) => {
    calls.push(`claude-drain ${sessionId}`)
    return undefined
  }
  const service = new ProviderSessionService(agent, claude)
  services.push(service)
  const app = { listen: vi.fn(async (_address: typeof address) => { calls.push('listen'); return '' }) }
  return {
    directory, calls, copilotStore, claudeStore, client, agent, claude, authenticate, service, app,
    copilotId, terminalId,
  }
}

type Fixture = Awaited<ReturnType<typeof fixture>>

function hold(target: object, key: string, released: Promise<void>) {
  const methods = target as Record<string, (...args: unknown[]) => unknown>
  const original = methods[key].bind(target)
  let held = false
  methods[key] = async (...args: unknown[]) => {
    if (!held) {
      held = true
      await released
    }
    return original(...args)
  }
}

async function settle() {
  for (let index = 0; index < 5; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.allSettled(services.splice(0).map((service) => service.stop()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.restoreAllMocks()
})

describe('startup phase recorder', () => {
  it('records begin and completion with monotonic elapsed milliseconds', async () => {
    const records: StartupPhaseRecord[] = []
    const clock = [10.4, 25.6]
    const phases = createStartupPhases({
      now: () => clock.shift()!,
      write: (line) => records.push(JSON.parse(line) as StartupPhaseRecord),
    })
    await expect(phases.run('copilot.sdk', async () => 'started')).resolves.toBe('started')
    expect(records).toEqual([
      { startupPhase: 'copilot.sdk', event: 'begin', elapsedMs: 10 },
      { startupPhase: 'copilot.sdk', event: 'complete', elapsedMs: 26, durationMs: 15 },
    ])
  })

  it('records a failure by error type and code without its message', async () => {
    const { phases, records, lines } = recorder()
    const error = Object.assign(new Error('Cannot bind /home/synthetic/secret-token'), { code: 'EADDRINUSE' })
    await expect(phases.run('fastify.listen', async () => { throw error })).rejects.toBe(error)
    expect(records.at(-1)).toMatchObject({
      startupPhase: 'fastify.listen', event: 'fail', error: 'Error', code: 'EADDRINUSE',
    })
    expect(lines.join('\n')).not.toMatch(/secret|synthetic|Cannot bind/)
  })

  it('never records error names or codes that could carry data', async () => {
    const { phases, records, lines } = recorder()
    class TerminalDiscoveryFailure extends Error {}
    const named = Object.assign(new TerminalDiscoveryFailure('hidden'), {
      name: 'ghp_SyntheticToken /home/synthetic', code: 'ghp_syntheticToken',
    })
    await expect(phases.run('copilot.discovery', async () => { throw named })).rejects.toBe(named)
    expect(records.at(-1)).toEqual(expect.objectContaining({ event: 'fail', error: 'TerminalDiscoveryFailure' }))
    expect(records.at(-1)).not.toHaveProperty('code')
    await expect(phases.run('copilot.sdk', () => Promise.reject('/home/synthetic/token'))).rejects.toBe('/home/synthetic/token')
    expect(records.at(-1)).toEqual(expect.objectContaining({ event: 'fail', error: 'string' }))
    expect(lines.join('\n')).not.toMatch(/ghp_|synthetic|hidden/i)
  })

  it('keeps the original rejection when reading error metadata throws', async () => {
    const { phases, records } = recorder()
    const hostile = new Proxy(new Error('hidden'), {
      get: () => { throw new Error('getter failed') },
      getPrototypeOf: () => { throw new Error('prototype failed') },
    })
    await expect(phases.run('copilot.store', () => Promise.reject(hostile))).rejects.toBe(hostile)
    expect(records.at(-1)).toMatchObject({ startupPhase: 'copilot.store', event: 'fail' })
  })

  it('keeps phase results when the clock fails', async () => {
    const phases = createStartupPhases({ now: () => { throw new Error('clock failed') }, write: () => {} })
    const failure = new Error('Synthetic failure')
    await expect(phases.run('copilot.models', async () => 'loaded')).resolves.toBe('loaded')
    await expect(phases.run('copilot.models', () => Promise.reject(failure))).rejects.toBe(failure)
  })

  it('starts the phase work synchronously and survives a failing log sink', async () => {
    const phases = createStartupPhases({ now: () => 1, write: () => { throw new Error('sink closed') } })
    let started = false
    const running = phases.run('claude.store', async () => {
      started = true
      return 7
    })
    expect(started).toBe(true)
    await expect(running).resolves.toBe(7)
  })
})

describe('managed startup diagnostics', () => {
  it('records every provider phase in order before listening', async () => {
    const f = await fixture()
    const { phases, records, trail } = recorder()
    let recordsAtListen = -1
    f.app.listen.mockImplementation(async () => {
      recordsAtListen = records.length
      return ''
    })
    await startManagedServer(f.app, f.service, address, phases)
    expect(trail()).toEqual([
      'begin service.start',
      'begin copilot.start',
      'begin copilot.store',
      'complete copilot.store',
      'begin copilot.sdk',
      'complete copilot.sdk',
      'begin copilot.models',
      'complete copilot.models',
      'begin copilot.discovery',
      'complete copilot.discovery',
      'begin copilot.recovery',
      'begin copilot.recovery.persistence',
      'complete copilot.recovery.persistence',
      'begin copilot.recovery.terminal',
      'complete copilot.recovery.terminal',
      'begin copilot.recovery.sdk',
      'complete copilot.recovery.sdk',
      'begin copilot.recovery.dispatches',
      'complete copilot.recovery.dispatches',
      'begin copilot.recovery.transcripts',
      'complete copilot.recovery.transcripts',
      'begin copilot.queue.sdk',
      'complete copilot.queue.sdk',
      'complete copilot.recovery',
      'begin copilot.queue.terminal',
      'complete copilot.queue.terminal',
      'complete copilot.start',
      'begin claude.start',
      'begin claude.store',
      'complete claude.store',
      'begin claude.availability',
      'complete claude.availability',
      'complete claude.start',
      'complete service.start',
      'begin fastify.listen',
      'complete fastify.listen',
    ])
    expect(f.app.listen).toHaveBeenCalledOnce()
    expect(f.app.listen).toHaveBeenCalledWith(address)
    expect(records[recordsAtListen - 1]).toMatchObject({ startupPhase: 'fastify.listen', event: 'begin' })
    const elapsed = records.map(({ elapsedMs }) => elapsedMs)
    expect(elapsed).toEqual([...elapsed].sort((a, b) => a - b))
  })

  it('preserves provider startup order and recovery state', async () => {
    const plain = await fixture({ queued: true })
    await plain.service.start()
    await plain.app.listen(address)
    const instrumented = await fixture({ queued: true })
    const { phases } = recorder()
    await startManagedServer(instrumented.app, instrumented.service, address, phases)
    expect(instrumented.calls).toEqual(plain.calls)
    expect(instrumented.calls).toContain(`sdk-drain ${instrumented.copilotId}`)
    expect(instrumented.calls).toContain(`terminal-drain ${instrumented.terminalId}`)
    const state = async (f: Fixture) => {
      const persisted = JSON.parse(await readFile(path.join(f.directory, 'copilot', 'state.json'), 'utf8'))
      const { cwd, ...session } = persisted.sessions[f.copilotId]
      expect(cwd).toBe(f.directory)
      return session
    }
    expect(await state(instrumented)).toEqual(await state(plain))
  })

  it('records a provider rejection, never listens, and leaves recovery state unchanged', async () => {
    const f = await fixture({ queued: true })
    const persisted = () => readFile(path.join(f.directory, 'copilot', 'state.json'), 'utf8')
    const before = await persisted()
    const failure = new Error('Synthetic SDK failure')
    vi.mocked(f.client.start).mockRejectedValueOnce(failure)
    const { phases, trail } = recorder()
    await expect(startManagedServer(f.app, f.service, address, phases)).rejects.toBe(failure)
    expect(trail().slice(-4)).toEqual([
      'begin copilot.sdk',
      'fail copilot.sdk',
      'fail copilot.start',
      'fail service.start',
    ])
    expect(f.app.listen).not.toHaveBeenCalled()
    expect(await persisted()).toBe(before)
  })

  it.each<[string, (f: Fixture, released: Promise<void>) => void]>([
    ['copilot.store', (f, released) => hold(f.copilotStore, 'initialize', released)],
    ['copilot.sdk', (f, released) => hold(f.client, 'start', released)],
    ['copilot.models', (f, released) => hold(f.client.rpc.models, 'list', released)],
    ['copilot.discovery', (f, released) => hold(f.client, 'listSessions', released)],
    ['copilot.recovery.persistence', (f, released) => hold(f.copilotStore, 'verifyPersistence', released)],
    ['copilot.recovery.terminal', (f, released) => hold(f.agent, 'recoverTerminalSessions', released)],
    ['copilot.recovery.sdk', (f, released) => hold(f.agent, 'recoverSdkSessions', released)],
    ['copilot.recovery.dispatches', (f, released) => hold(f.agent, 'reconcileUntrackedTerminalDispatches', released)],
    ['copilot.recovery.transcripts', (f, released) => hold(f.agent, 'refreshTranscripts', released)],
    ['copilot.queue.sdk', (f, released) => hold(f.agent, 'drainSdkQueue', released)],
    ['copilot.queue.terminal', (f, released) => hold(f.agent, 'drainTerminalQueue', released)],
    ['claude.store', (f, released) => hold(f.claudeStore, 'initialize', released)],
    ['claude.availability', (f, released) => hold(f.claude, 'detectAvailability', released)],
    ['claude.queue', (f, released) => {
      f.authenticate.mockResolvedValue({ loggedIn: true })
      f.claude['loadModels'] = async () => []
      hold(f.claude, 'drainQueue', released)
    }],
  ])('leaves a deferred %s phase as the final begin record without listening', async (phase, defer) => {
    const f = await fixture({ queued: true })
    const released = gate()
    defer(f, released.promise)
    const { phases, records } = recorder()
    const starting = startManagedServer(f.app, f.service, address, phases)
    await vi.waitFor(() => expect(records.at(-1)).toMatchObject({ startupPhase: phase, event: 'begin' }))
    await settle()
    expect(records.at(-1)).toMatchObject({ startupPhase: phase, event: 'begin' })
    expect(f.app.listen).not.toHaveBeenCalled()
    released.release()
    await starting
    expect(records).toContainEqual(expect.objectContaining({ startupPhase: phase, event: 'complete' }))
    expect(records.at(-1)).toMatchObject({ startupPhase: 'fastify.listen', event: 'complete' })
    expect(f.app.listen).toHaveBeenCalledOnce()
  })

  it('keeps provider startup silent when no recorder is supplied', async () => {
    const f = await fixture()
    const log = vi.spyOn(console, 'log')
    await f.service.start()
    expect(log).not.toHaveBeenCalled()
  })

  it('labels the manager start that holds Fastify readiness', async () => {
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
    const f = await fixture()
    const released = gate()
    const managerAgent = Object.assign(new EventEmitter(), {
      start: vi.fn(() => released.promise),
      stop: vi.fn(async () => {}),
    }) as unknown as ManagerAgent
    const { phases, records } = recorder()
    const { app } = await buildApp({
      service: f.service,
      managerAgent,
      dataDirectory: f.directory,
      logger: false,
      startupPhases: phases,
      transcriptionService: { initialize: async () => undefined, stop: async () => undefined, transcribe: vi.fn() },
    })
    try {
      let ready = false
      const readying = app.ready().then(() => { ready = true })
      await vi.waitFor(() => expect(records.at(-1)).toMatchObject({ startupPhase: 'manager.start', event: 'begin' }))
      await settle()
      expect(ready).toBe(false)
      released.release()
      await readying
      expect(records.at(-1)).toMatchObject({ startupPhase: 'manager.start', event: 'complete' })
    } finally {
      await app.close()
      vi.unstubAllEnvs()
    }
  })
})
