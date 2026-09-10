import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'
import type { TerminalSessionController } from './terminal-session.js'
import type { SessionDetail } from '../shared/contracts.js'

const execute = promisify(execFile)
const seedPrompt = 'Synthetic context brief'
const legacyCommit = 'c098c9a36728fa723e7319a62a1e50a98355edaa'
const directories: string[] = []
const services: AgentService[] = []
const stores: SessionStore[] = []
const releases: Array<() => void> = []
const pending: Promise<unknown>[] = []
type SeedState = 'pending' | 'dispatching' | 'failed' | 'uncertain'

function gate() {
  let release = () => {}
  const promise = new Promise<void>((resolve) => { release = resolve })
  releases.push(release)
  return { promise, release }
}

function settle<T>(promise: Promise<T>): Promise<T | Error> {
  const result = promise.catch((error: unknown) => {
    if (!(error instanceof Error)) throw error
    return error
  })
  pending.push(result)
  return result
}

async function tick() {
  await new Promise<void>((resolve) => setImmediate(resolve))
}

async function fixture(backend: 'sdk' | 'terminal', state: SeedState = 'pending') {
  const directory = await mkdtemp(path.join(tmpdir(), 'recovery-guards-'))
  directories.push(directory)
  const stateDirectory = path.join(directory, 'state')
  let store = new SessionStore(stateDirectory)
  stores.push(store)
  await store.initialize()
  await store.create({
    id: 'broken', cwd: directory, title: 'Synthetic recovery',
    updatedAt: '2026-09-09T00:00:00.000Z', status: 'error', messages: [],
    queuedPrompts: [{ id: 'waiting', content: 'Preserved FIFO head', createdAt: '2026-09-09T00:00:00.000Z' }],
  }, { backend, managedOpen: true })
  await store.replaceWithRecoveredSession('broken', 'replacement', 'manual', 0, false, seedPrompt)
  if (state === 'dispatching' || state === 'uncertain') {
    await store.claimRecoverySeed('replacement', seedPrompt)
  } else if (state === 'failed') {
    await store.failRecoverySeed('replacement', seedPrompt, 'Synthetic definite seed failure')
  }
  if (state === 'uncertain') {
    await store.close()
    store = new SessionStore(stateDirectory)
    stores.push(store)
    await store.initialize()
  }
  const sent: string[] = []
  const invoked = vi.fn(async () => ({ kind: 'text' as const, text: 'Synthetic provider mutation' }))
  const enqueued = vi.fn(async () => ({ queued: true }))
  const commands = vi.fn(async () => ({
    commands: [
      { name: 'model', kind: 'builtin' as const, description: 'Synthetic mutation', allowDuringAgentExecution: true },
      { name: 'help', kind: 'builtin' as const, description: 'Provider lookup is not a local observation', allowDuringAgentExecution: true },
    ],
  }))
  const listeners = new Set<(event: SessionEvent) => void>()
  const sdk: CopilotSessionLike = {
    sessionId: 'replacement',
    on: (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    send: vi.fn(async ({ prompt }) => {
      sent.push(prompt)
      setImmediate(() => {
        for (const listener of listeners) listener({
          id: randomUUID(), type: 'session.idle', data: {},
          timestamp: new Date().toISOString(), ephemeral: true, parentId: null,
        } as SessionEvent)
      })
      return randomUUID()
    }),
    sendAndWait: vi.fn(async (prompt) => { sent.push(prompt); return undefined }),
    getEvents: async () => [],
    abort: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    rpc: {
      commands: { list: commands, invoke: invoked, enqueue: enqueued },
      model: {
        getCurrent: async () => ({ modelId: 'fixture' }),
        switchTo: async () => ({ modelId: 'fixture' }),
      },
      name: { set: async () => {} },
      mode: { set: async () => {} },
    },
  }
  const resume = vi.fn(async () => sdk)
  const client: CopilotClientLike = {
    start: async () => {},
    stop: async () => [],
    createSession: async () => sdk,
    resumeSession: resume,
    listSessions: async () => [],
    deleteSession: async () => {},
    rpc: { commands: { list: commands }, models: { list: async () => ({ models: [] }) } },
  }
  const terminal: TerminalSessionController = {
    has: vi.fn(async () => backend === 'terminal'),
    capture: vi.fn(async () => 'Synthetic idle owner\n╻▄▄▄▄▄▄▄▄▄▄\n┃ \n╹▀▀▀▀▀▀▀▀▀▀\n / commands'),
    send: vi.fn(async (_id, prompt) => { sent.push(prompt); return backend === 'terminal' }),
    sendWhenIdle: vi.fn(async (_id, prompt) => { sent.push(prompt); return true }),
    restart: vi.fn(async () => true),
    cancel: vi.fn(async () => backend === 'terminal'),
  }
  const finder = vi.fn(async () => backend === 'terminal' ? [{
    id: 'replacement', cwd: directory, title: 'Synthetic recovery',
    updatedAt: new Date().toISOString(),
  }] : [])
  const service = new AgentService(
    store, client, finder,
    async () => {},
    async () => [],
    async () => undefined,
    terminal,
    async () => undefined,
    async () => undefined,
  )
  services.push(service)
  if (backend === 'terminal') service['externalSessionIds'].add('replacement')
  return { directory, stateDirectory, store, service, client, sdk, terminal, finder, sent, invoked, enqueued, commands, resume }
}

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.all(pending.splice(0))
  await Promise.all(services.splice(0).map((service) => service.stop()))
  await Promise.all(stores.splice(0).map((store) => store.close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.restoreAllMocks()
})

describe('recovery seed admission guards', () => {
  it('keeps Restart behind a held terminal handoff, then refuses to kill the admitted seed', async () => {
    const f = await fixture('terminal')
    const handoff = gate()
    const entered = gate()
    vi.mocked(f.terminal.sendWhenIdle!).mockImplementation(async (_id, prompt) => {
      entered.release()
      await handoff.promise
      f.sent.push(prompt)
      return true
    })
    const dispatch = settle(f.service['runRecoverySeedDispatch']('replacement'))
    await entered.promise
    const restart = settle(f.service.restartSession('replacement'))
    await tick()
    expect(f.terminal.restart).not.toHaveBeenCalled()
    expect(f.store.get('replacement')?.queuedPrompts).toHaveLength(1)
    handoff.release()
    await dispatch
    expect(await restart).toBeInstanceOf(Error)
    expect(f.terminal.restart).not.toHaveBeenCalled()
    expect(f.sent).toEqual([seedPrompt])
    expect(f.store.get('replacement')?.status).toBe('running')
  })

  it('waits for an earlier Restart to relinquish the owner before handing off the seed', async () => {
    const f = await fixture('terminal')
    const restarting = gate()
    const entered = gate()
    vi.mocked(f.terminal.restart!).mockImplementation(async () => {
      entered.release()
      await restarting.promise
      return true
    })
    const restart = settle(f.service.restartSession('replacement'))
    await entered.promise
    const dispatch = settle(f.service['runRecoverySeedDispatch']('replacement'))
    await f.store.flush()
    await tick()
    expect(f.terminal.sendWhenIdle).not.toHaveBeenCalled()
    expect(f.store.recoverySeed('replacement')?.state).toBe('pending')
    restarting.release()
    expect(await restart).not.toBeInstanceOf(Error)
    await dispatch
    expect(f.sent).toEqual([seedPrompt])
    expect(f.store.get('replacement')?.queuedPrompts).toHaveLength(1)
  })

  it('returns from startup while terminal handoff is held and never makes its queue ready', async () => {
    const f = await fixture('terminal')
    const handoff = gate()
    const entered = gate()
    vi.mocked(f.terminal.sendWhenIdle!).mockImplementation(async (_id, prompt) => {
      entered.release()
      await handoff.promise
      f.sent.push(prompt)
      return true
    })
    await f.service.start()
    await entered.promise
    const discoveries = f.finder.mock.calls.length
    await f.service['refreshDiscovery']()
    expect(f.finder.mock.calls.length).toBeGreaterThan(discoveries)
    await f.service['drainTerminalQueue']('replacement')
    expect(f.sent).toEqual([])
    expect(f.store.recoverySeed('replacement')?.state).toBe('dispatching')
    expect(f.store.get('replacement')?.queuedPrompts).toHaveLength(1)
    handoff.release()
    await f.service['recoverySeedDispatches'].get('replacement')
    expect(f.sent).toEqual([seedPrompt])
  })

  it('retains the legacy barrier through enqueue and Restart, but permits explicit conversation recovery', async () => {
    const f = await fixture('sdk', 'failed')
    expect(f.store.get('replacement')?.failedPrompt).toBeUndefined()
    expect(f.store.failedPrompt('replacement')).toBeUndefined()
    await expect(f.store.clearFailedPrompt('replacement')).rejects.toMatchObject({ statusCode: 409 })
    await f.service.sendMessage('replacement', 'New FIFO follower', true)
    await f.service.restartSession('replacement')
    expect(f.store.recoverySeed('replacement')?.state).toBe('failed')
    const stored = JSON.parse(await readFile(path.join(f.stateDirectory, 'state.json'), 'utf8'))
    expect(stored.sessions.replacement.failedPrompt).toMatchObject({ content: seedPrompt })
    expect(f.sent).toEqual([])
    f.client.createSession = async (config) => {
      if (!config.sessionId) throw new Error('Expected explicit replacement identity')
      return { ...f.sdk, sessionId: config.sessionId }
    }
    const recovered = await f.service.recoverConversation('replacement', 'manual')
    expect(recovered.id).not.toBe('replacement')
    expect(recovered.queuedPrompts?.map((prompt) => prompt.content))
      .toEqual(['Preserved FIFO head', 'New FIFO follower'])
    await f.service['recoverySeedDispatches'].get(recovered.id)
  })

  it('keeps Stop reachable while an SDK seed is held and never replays its rejected turn', async () => {
    const f = await fixture('sdk')
    const entered = gate()
    const interrupted = gate()
    vi.mocked(f.sdk.sendAndWait).mockImplementation(async (prompt) => {
      f.sent.push(prompt)
      entered.release()
      await interrupted.promise
      throw new Error('Synthetic Stop')
    })
    vi.mocked(f.sdk.abort).mockImplementation(async () => { interrupted.release() })
    const dispatch = settle(f.service['runRecoverySeedDispatch']('replacement'))
    await entered.promise
    await f.service.cancel('replacement')
    await dispatch
    expect(f.sdk.abort).toHaveBeenCalledOnce()
    expect(f.store.recoverySeed('replacement')?.state).toBe('failed')
    await f.service.restartSession('replacement')
    await f.service['runRecoverySeedDispatch']('replacement')
    expect(f.sent).toEqual([seedPrompt])
    expect(f.store.get('replacement')?.queuedPrompts).toHaveLength(1)
  })

  for (const backend of ['sdk', 'terminal'] as const) {
    it.each(['pending', 'dispatching', 'failed', 'uncertain'] as const)(
      `rejects provider slash-command effects on ${backend} with a %s seed`,
      async (state) => {
        const f = await fixture(backend, state)
        for (const enqueue of [false, true]) {
          for (const command of ['/model changed', '/help']) {
            await expect(f.service.executeCommand('replacement', command, enqueue))
              .rejects.toMatchObject({ statusCode: 409 })
          }
        }
        expect(f.commands).not.toHaveBeenCalled()
        expect(f.resume).not.toHaveBeenCalled()
        expect(f.invoked).not.toHaveBeenCalled()
        expect(f.enqueued).not.toHaveBeenCalled()
        expect(f.terminal.capture).not.toHaveBeenCalled()
        expect(f.terminal.send).not.toHaveBeenCalled()
        expect(f.sent).toEqual([])
        expect(f.store.get('replacement')?.queuedPrompts).toHaveLength(1)
      },
    )
  }
})

describe('unmodified 1.1.2 recovery queue compatibility', () => {
  let legacyRoot: string
  beforeAll(async () => {
    legacyRoot = await mkdtemp(path.join(tmpdir(), 'recovery-legacy-'))
    const { stdout } = await execute('git', ['ls-tree', '-r', '--name-only', legacyCommit, '--', 'server', 'shared'])
    for (const filename of stdout.trim().split('\n')) {
      if (!filename.endsWith('.ts') || filename.endsWith('.test.ts')) continue
      const { stdout: source } = await execute('git', ['show', `${legacyCommit}:${filename}`], { maxBuffer: 2 * 1024 * 1024 })
      const target = path.join(legacyRoot, filename)
      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, source, { mode: 0o400 })
    }
    await writeFile(path.join(legacyRoot, 'package.json'), '{"type":"module"}', { mode: 0o400 })
    const runner = path.join(legacyRoot, 'server/recovery-seed-legacy-fixture.ts')
    await writeFile(runner, await readFile(new URL('./recovery-seed-legacy-fixture.ts', import.meta.url)), { mode: 0o400 })
    await symlink(path.resolve('node_modules'), path.join(legacyRoot, 'node_modules'), 'junction')
    await chmod(legacyRoot, 0o500)
  })
  afterAll(async () => {
    await chmod(legacyRoot, 0o700)
    await rm(path.join(legacyRoot, 'node_modules'))
    await rm(legacyRoot, { recursive: true, force: true })
  })

  it('resolves legacy packages from the fixture toolchain rather than temporary-directory ancestry', async () => {
    const { stdout } = await execute(process.execPath, [
      '--input-type=module', '--eval', "console.log(import.meta.resolve('@github/copilot-sdk'))",
    ], { cwd: legacyRoot })
    expect(stdout.trim()).toBe(import.meta.resolve('@github/copilot-sdk'))
  })

  async function bootLegacy(f: Awaited<ReturnType<typeof fixture>>, backend: 'sdk' | 'terminal', phase = 'idle') {
    await f.service.stop()
    await f.store.close()
    const resultPath = path.join(f.directory, `legacy-${randomUUID()}.json`)
    await execute(process.execPath, [
      '--import', import.meta.resolve('tsx'),
      path.join(legacyRoot, 'server/recovery-seed-legacy-fixture.ts'),
      f.stateDirectory, backend, resultPath, phase,
    ], {
      env: { ...process.env, COPILOT_HOME: path.join(f.directory, 'synthetic-copilot-home'), TMUX: '' },
      timeout: 15_000,
      maxBuffer: 1024 * 1024,
    })
    return JSON.parse(await readFile(resultPath, 'utf8')) as Array<{
      calls: string[]
      session: SessionDetail
      failedPrompt?: SessionDetail['failedPrompt']
    }>
  }

  it('keeps an admitted terminal brief ahead of FIFO until its turn is observed complete', async () => {
    const f = await fixture('terminal')
    await f.store.claimRecoverySeed('replacement', seedPrompt)
    await f.store.admitRecoverySeed('replacement', seedPrompt, new Date().toISOString())
    const boots = await bootLegacy(f, 'terminal', 'busy')
    for (const boot of boots) {
      expect(boot.calls).toEqual([])
      expect(boot.session.status).toBe('running')
      expect(boot.session.queuedPrompts).toHaveLength(1)
    }
  })

  it('retains the old-reader barrier when terminal delivery succeeds but admission cannot commit', async () => {
    const f = await fixture('terminal')
    vi.spyOn(f.store, 'admitRecoverySeed').mockRejectedValueOnce(new Error('Synthetic receipt persistence failure'))
    await f.service['runRecoverySeedDispatch']('replacement')
    expect(f.sent).toEqual([seedPrompt])
    expect(f.store.recoverySeed('replacement')).toMatchObject({
      state: 'failed', error: expect.stringContaining('delivery is uncertain'),
    })
    await f.service['runRecoverySeedDispatch']('replacement')
    expect(f.sent).toEqual([seedPrompt])
    const boots = await bootLegacy(f, 'terminal')
    for (const boot of boots) {
      expect(boot.calls).toEqual([])
      expect(boot.failedPrompt).toMatchObject({ content: seedPrompt, uncertain: true })
      expect(boot.session.queuedPrompts).toHaveLength(1)
    }
  })

  for (const backend of ['sdk', 'terminal'] as const) {
    it.each(['pending', 'dispatching', 'failed', 'uncertain'] as const)(
      `keeps preserved ${backend} FIFO blocked across two old-version boots with a %s seed`,
      async (state) => {
        const f = await fixture(backend, state)
        const boots = await bootLegacy(f, backend)
        expect(boots).toHaveLength(2)
        for (const boot of boots) {
          expect(boot.calls).toEqual([])
          expect(boot.failedPrompt).toMatchObject({ content: seedPrompt })
          expect(boot.session.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['Preserved FIFO head'])
        }
        const upgraded = new SessionStore(f.stateDirectory)
        stores.push(upgraded)
        await upgraded.initialize()
        expect(upgraded.recoverySeed('replacement')?.state).toBe(state === 'pending' ? 'pending' : 'failed')
        expect(upgraded.get('replacement')?.queuedPrompts).toHaveLength(1)
        const service = new AgentService(
          upgraded, f.client, f.finder, async () => {}, async () => [], async () => undefined,
          f.terminal, async () => undefined, async () => undefined,
        )
        services.push(service)
        await service.start()
        await service['recoverySeedDispatches'].get('replacement')
        if (state === 'pending') {
          await vi.waitFor(() => expect(f.sent).toEqual(backend === 'sdk'
            ? [seedPrompt, 'Preserved FIFO head']
            : [seedPrompt]))
        } else {
          await service['drainSdkQueue']('replacement')
          await service['drainTerminalQueue']('replacement')
          expect(f.sent).toEqual([])
          expect(upgraded.get('replacement')?.queuedPrompts).toHaveLength(1)
        }
      },
    )
    it(`releases the legacy ${backend} queue only after seed admission, without duplicate delivery`, async () => {
      const f = await fixture(backend)
      await f.store.claimRecoverySeed('replacement', seedPrompt)
      await f.store.admitRecoverySeed('replacement', seedPrompt)
      const boots = await bootLegacy(f, backend)
      expect(boots.flatMap((boot) => boot.calls)).toEqual(['Preserved FIFO head'])
      expect(boots.at(-1)?.session.queuedPrompts).toEqual([])
    })
  }
})
