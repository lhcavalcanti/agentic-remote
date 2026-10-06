import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Query } from '@anthropic-ai/claude-agent-sdk'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { SessionStore } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile) }
})
const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const id = 'enqueue-clear'
const createdAt = '2026-09-06T00:00:00.000Z'
const releases: Array<() => void> = []
const fixtures: Array<{ directory: string; service: AgentService | ClaudeAgentService }> = []

function gate() {
  let finish = () => {}
  const promise = new Promise<void>((resolve) => { finish = resolve })
  releases.push(finish)
  return { promise, finish }
}

async function tick() {
  await new Promise<void>((resolve) => setImmediate(resolve))
}

async function fixture(provider: 'copilot' | 'claude' | 'native') {
  const directory = path.resolve('graphify/.cache', `enqueue-clear-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  vi.stubEnv('COPILOT_HOME', path.join(directory, 'synthetic-copilot-home'))
  const store = new SessionStore(directory)
  await store.initialize()
  await store.create({
    id, provider: provider === 'claude' ? 'claude' : 'copilot', cwd: directory,
    title: 'Original identity', status: 'idle', isOpen: true, messages: [], updatedAt: createdAt,
  }, { backend: 'sdk', managedOpen: true })
  const warmup = gate()
  const calls: string[] = []
  let native = false
  let nativeBusy = false
  let nativeHistory = true
  let nativePane = 'Ready\n> '
  const sdkFor = (sessionId: string): CopilotSessionLike => {
    const listeners = new Set<(event: SessionEvent) => void>()
    return {
      sessionId,
      send: vi.fn(async ({ prompt }) => {
        calls.push(prompt)
        queueMicrotask(() => {
          for (const listener of listeners) {
            listener({
              id: randomUUID(), type: 'session.idle', data: {},
              timestamp: new Date().toISOString(), ephemeral: true, parentId: null,
            } as SessionEvent)
          }
        })
        return randomUUID()
      }),
      sendAndWait: vi.fn(async (content) => {
        calls.push(content)
        if (content === 'warmup') await warmup.promise
        return undefined
      }),
      on: (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      getEvents: vi.fn(async () => []),
      abort: vi.fn(async () => { warmup.finish() }),
      disconnect: vi.fn(async () => {}),
      rpc: {
        commands: {
          list: vi.fn(async () => ({ commands: [] })),
          enqueue: vi.fn(async (): Promise<{ queued: true; queueId: string } | { queued: false }> => ({ queued: true, queueId: 'queued-command' })),
          invoke: vi.fn(async () => ({ kind: 'completed' as const, message: 'Done' })),
        },
        model: {
          getCurrent: vi.fn(async () => ({ modelId: 'synthetic' })),
          switchTo: vi.fn(async () => ({ modelId: 'synthetic' })),
        },
        name: { set: vi.fn(async () => {}) }, mode: { set: vi.fn(async () => ({ status: 'applied', modelChanged: false })) },
      },
    }
  }
  const sdk = sdkFor(id)
  const client: CopilotClientLike = {
    start: vi.fn(async () => {}), stop: vi.fn(async () => { warmup.finish(); return [] }),
    createSession: vi.fn(async (config) => sdkFor(config.sessionId || randomUUID())),
    resumeSession: vi.fn(async () => sdk), listSessions: vi.fn(async () => []),
    deleteSession: vi.fn(async () => {}),
    rpc: {
      models: { list: vi.fn(async () => ({ models: [] })) },
      commands: { list: vi.fn(async () => ({ commands: [] })) },
    },
  }
  const terminal = {
    has: vi.fn(async () => native),
    send: vi.fn(async (_sessionId: string, content: string) => {
      if (!native) return false
      calls.push(content)
      return true
    }),
    sendWhenIdle: vi.fn(async (_sessionId: string, content: string) => {
      if (!native || nativeBusy) return false
      calls.push(content)
      if (content.startsWith('/')) nativePane = `Ready\n${content}\nSynthetic command response ${calls.length}\n> `
      return true
    }),
    capture: vi.fn(async () => nativeBusy ? 'Working… Esc to interrupt' : nativePane),
    cancel: vi.fn(async () => false),
    reset: vi.fn(async (
      _sessionId: string, _replacementId: string, _cwd?: string,
      _runtime?: unknown, commit?: () => Promise<void>,
    ) => { await commit?.(); return true }),
  }
  const copilot = new AgentService(
    store, client, async () => [], async () => {}, async () => [], async () => native && nativeHistory ? 'native-history' : undefined,
    terminal, async () => undefined, async () => undefined,
  )
  copilot['sessions'].set(id, sdk)
  const claudeSdk: ClaudeSdk = {
    query: vi.fn(({ prompt, options }) => {
      if (typeof prompt === 'string') calls.push(prompt)
      if (prompt === 'warmup') {
        options?.abortController?.signal.addEventListener('abort', warmup.finish, { once: true })
      }
      return Object.assign((async function* () {
        if (prompt === 'warmup') await warmup.promise
        yield { type: 'stream_event', event: { type: 'message_start' } }
      })(), { supportedModels: async () => [{ value: 'synthetic', displayName: 'Synthetic', description: '' }] }) as unknown as Query
    }),
    getSessionInfo: vi.fn(async () => undefined),
    renameSession: vi.fn(async () => {}),
    deleteSession: vi.fn(async () => {}),
  }
  const claude = new ClaudeAgentService(store, '/usr/bin/true', claudeSdk, async () => ({ loggedIn: true }))
  const service = provider === 'claude' ? claude : copilot
  await service.start()
  if (provider === 'native') {
    native = true
    copilot['externalSessionIds'].add(id)
    copilot['sessions'].delete(id)
    copilot['externalCommandCache'].set(directory, { commands: [], expiresAt: Date.now() + 60_000 })
    await store.setBackend(id, 'terminal')
  }
  fixtures.push({ directory, service })
  return {
    provider, directory, store, service, copilot, claude, client, sdk, claudeSdk, terminal, warmup, calls,
    nativeHistory: (present: boolean) => { nativeHistory = present },
    persisted: async () => JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions[id],
    active: () => provider === 'claude' ? claude['active'].has(id) : copilot['activePrompts'].has(id),
    startWarmup: async () => {
      if (provider === 'native') {
        nativeBusy = true
        await store.updateStatus(id, 'running', 'Native warmup')
      } else {
        await service.sendMessage(id, 'warmup')
      }
    },
    endWarmup: async () => {
      if (provider === 'native') {
        nativeBusy = false
        await store.updateStatus(id, 'idle')
        await copilot['drainTerminalQueue'](id)
      } else {
        warmup.finish()
      }
    },
  }
}

function holdEnqueue(
  runtime: Awaited<ReturnType<typeof fixture>>,
  content = 'queued A',
  method: 'enqueuePrompt' | 'enqueueAnsweringPrompt' | 'claimRecoveryPrompt' = 'enqueuePrompt',
  holdFailure = false,
) {
  const writing = gate()
  const releaseWrite = gate()
  const committed = gate()
  const rejected = gate()
  const releaseResponse = gate()
  let held = false
  vi.mocked(writeFile).mockImplementation(async (...args) => {
    if (!held && String(args[0]) === path.join(runtime.directory, 'state.json.tmp') &&
        JSON.parse(String(args[1])).sessions[id]?.queuedPrompts.some((prompt: { content: string }) => prompt.content === content)) {
      held = true
      writing.finish()
      await releaseWrite.promise
    }
    return disk.writeFile(...args)
  })
  const methods: typeof method[] = method === 'enqueueAnsweringPrompt' ? ['enqueuePrompt', method] : [method]
  for (const name of methods) {
    const original = runtime.store[name]
    vi.spyOn(runtime.store, name).mockImplementation(async (...args: unknown[]) => {
      try {
        const result = await Reflect.apply(original, runtime.store, args) as SessionDetail
        committed.finish()
        await releaseResponse.promise
        return result
      } catch (error) {
        if (holdFailure) {
          rejected.finish()
          await releaseResponse.promise
        }
        throw error
      }
    })
  }
  return {
    writing: writing.promise, releaseWrite: releaseWrite.finish, committed: committed.promise,
    rejected: rejected.promise, releaseResponse: releaseResponse.finish,
  }
}

async function quiet(runtime: Awaited<ReturnType<typeof fixture>>) {
  await vi.waitFor(() => {
    expect(runtime.active()).toBe(false)
    if (runtime.provider === 'claude') {
      expect(runtime.claude['startingQueries'].size).toBe(0)
      expect(runtime.claude['drainingSessions'].size).toBe(0)
      expect(runtime.claude['queueWakeups'].size).toBe(0)
    } else {
      expect(runtime.copilot['drainingSessions'].size).toBe(0)
      expect(runtime.copilot['sdkQueueWakeups'].size).toBe(0)
      expect(runtime.copilot['queueOperations'].size).toBe(0)
    }
  })
  await runtime.store.flush()
}

type EnqueueCase = {
  name: string
  provider: 'copilot' | 'claude' | 'native'
  command?: boolean
  recovery?: boolean
  backlog?: boolean
  publicationFailure?: boolean
}

async function joinedEnqueue(options: EnqueueCase) {
  const runtime = await fixture(options.provider)
  const content = options.command ? '/help  preserve spacing' : 'queued A'
  const older = options.provider === 'native' && options.command ? '/help  older B' : 'older B'
  if (options.backlog) {
    await runtime.store.enqueuePrompt(id, {
      id: 'older-B', content: older, createdAt,
      ...(options.provider === 'native' && options.command ? { command: true } : {}),
    })
  } else {
    await runtime.startWarmup()
  }
  const token = options.recovery ? '2026-09-06T01:00:00.000Z' : undefined
  if (token) {
    await runtime.store.update(id, (session) => {
      session.failedPrompt = { content, failedAt: token, uncertain: true }
    })
  }
  const method = token && options.provider === 'claude' ? 'claimRecoveryPrompt'
    : token ? 'enqueueAnsweringPrompt' : 'enqueuePrompt'
  const held = holdEnqueue(runtime, content, method)
  const nativeClaims = vi.spyOn(runtime.store, 'claimTerminalQueuedPrompt')
  let publicationRefused = false
  let publicationArmed = false
  if (options.publicationFailure) {
    const publisher = runtime.service as unknown as { publish(session: SessionDetail): void }
    const publishing = publisher.publish.bind(runtime.service)
    vi.spyOn(publisher, 'publish').mockImplementation((session) => {
      if (publicationArmed && !publicationRefused && session.queuedPrompts?.some((prompt) => prompt.content === content)) {
        publicationRefused = true
        throw new Error('Synthetic publication failure after durable enqueue')
      }
      publishing(session)
    })
  }
  const submit = () => options.command
    ? runtime.service.executeCommand(id, content, true, token)
    : runtime.service.sendMessage(id, content, options.provider === 'native' || !options.backlog, token)
  const sending = submit().then((value) => ({ value }), (error: unknown) => ({ error }))
  await held.writing
  const clearing = runtime.service.clearConversation(id).then((value) => ({ value }), (error: unknown) => ({ error }))
  await tick()
  const ending = options.backlog ? Promise.resolve() : runtime.endWarmup()
  held.releaseWrite()
  await Promise.all([held.committed, ending])
  await vi.waitFor(() => {
    expect(runtime.store.get(id)?.status).toBe('idle')
    expect(runtime.active()).toBe(false)
  })
  const durable = await runtime.persisted()
  const queued = durable.queuedPrompts.find((prompt: { content: string }) => prompt.content === content)
  expect(queued).toMatchObject({ content, ...(options.command ? { command: true } : {}) })
  expect(durable.queuedPrompts.map((prompt: { content: string }) => prompt.content))
    .toEqual(options.backlog ? [older, content] : [content])
  publicationArmed = true
  held.releaseResponse()
  const [accepted, clear] = await Promise.all([sending, clearing])
  if (options.publicationFailure) {
    const cause = { message: 'Synthetic publication failure after durable enqueue' }
    expect(accepted).toMatchObject({ error: options.provider === 'claude' ? cause : {
      statusCode: 409, cause, submission: { sessionId: id, accepted: true },
    } })
  } else {
    expect(accepted).toMatchObject({ value: { id } })
  }
  expect(clear).toMatchObject({ error: { statusCode: 409 } })
  expect(runtime.terminal.reset).not.toHaveBeenCalled()
  expect(runtime.client.createSession).not.toHaveBeenCalled()
  expect(runtime.client.deleteSession).not.toHaveBeenCalled()
  expect(runtime.claudeSdk.deleteSession).not.toHaveBeenCalled()
  expect(runtime.sdk.disconnect).not.toHaveBeenCalled()
  expect(runtime.store.isRetiredSession(id)).toBe(false)
  const prefix = options.backlog ? [older] : options.provider === 'native' ? [] : ['warmup']
  await vi.waitFor(() => expect(runtime.calls).toEqual([...prefix, content]))
  await quiet(runtime)
  expect((await runtime.persisted()).queuedPrompts).toEqual([])
  if (options.provider === 'native') {
    const claims = nativeClaims.mock.calls.filter((call) => call[1].content === content)
    expect(claims).toHaveLength(1)
    expect(claims[0][1]).toMatchObject({ id: queued.id, content })
  }
  if (token) {
    await expect(submit()).rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.calls).toEqual([...prefix, content])
  }
}

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
})
afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  vi.mocked(writeFile).mockImplementation(disk.writeFile)
  for (const runtime of fixtures.splice(0)) {
    await runtime.service.stop()
    await rm(runtime.directory, { recursive: true, force: true })
  }
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('Clear joins committed enqueue admissions', () => {
  it.each(['copilot', 'claude'] as const)('refuses Clear after %s queues durably and its active turn becomes idle', async (provider) => {
    const runtime = await fixture(provider)
    await runtime.startWarmup()
    const held = holdEnqueue(runtime)
    const sending = runtime.service.sendMessage(id, 'queued A', true)
    await held.writing
    expect((await runtime.persisted()).queuedPrompts).toEqual([])
    let clearSettled = false
    const clearing = runtime.service.clearConversation(id).then(
      (value) => { clearSettled = true; return { value } },
      (error: unknown) => { clearSettled = true; return { error } },
    )
    await tick()
    await expect(runtime.service.sendMessage(id, 'must not enter', true)).rejects.toMatchObject({ statusCode: 409 })
    await runtime.endWarmup()
    held.releaseWrite()
    await held.committed
    await vi.waitFor(() => {
      expect(runtime.store.get(id)?.status).toBe('idle')
      expect(runtime.active()).toBe(false)
    })
    const queued = await runtime.persisted()
    expect(queued.queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual(['queued A'])
    expect(clearSettled).toBe(false)
    held.releaseResponse()
    const [accepted, result] = await Promise.all([sending, clearing])
    expect(accepted.id).toBe(id)
    expect(result).toMatchObject({ error: { statusCode: 409 } })
    expect(runtime.client.createSession).not.toHaveBeenCalled()
    expect(runtime.client.deleteSession).not.toHaveBeenCalled()
    expect(runtime.claudeSdk.deleteSession).not.toHaveBeenCalled()
    expect(runtime.sdk.disconnect).not.toHaveBeenCalled()
    expect(runtime.store.isRetiredSession(id)).toBe(false)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['warmup', 'queued A']))
    await vi.waitFor(() => expect(runtime.store.get(id)?.status).toBe('idle'))
    expect((await runtime.persisted()).queuedPrompts).toEqual([])
  })

  it.each<EnqueueCase>([
    { name: 'Copilot automatic backlog', provider: 'copilot', backlog: true },
    { name: 'Claude automatic backlog', provider: 'claude', backlog: true },
    { name: 'Copilot answering enqueue', provider: 'copilot', recovery: true },
    { name: 'Claude recovery claim', provider: 'claude', recovery: true },
    { name: 'Copilot recovery through automatic backlog', provider: 'copilot', recovery: true, backlog: true },
    { name: 'Claude recovery through automatic backlog', provider: 'claude', recovery: true, backlog: true },
    { name: 'native prompt queue', provider: 'native' },
    { name: 'native command queue', provider: 'native', command: true },
    { name: 'native answering prompt queue', provider: 'native', recovery: true },
    { name: 'native answering command queue', provider: 'native', command: true, recovery: true },
  ])('retains exact order and wakes once for $name', joinedEnqueue)

  it.each<EnqueueCase>([
    { name: 'Copilot enqueue', provider: 'copilot', publicationFailure: true },
    { name: 'Claude enqueue', provider: 'claude', publicationFailure: true },
    { name: 'native enqueue', provider: 'native', publicationFailure: true },
    { name: 'Copilot backlog enqueue', provider: 'copilot', backlog: true, publicationFailure: true },
    { name: 'Claude backlog enqueue', provider: 'claude', backlog: true, publicationFailure: true },
    { name: 'native backlog enqueue', provider: 'native', backlog: true, command: true, publicationFailure: true },
    { name: 'Copilot backlog recovery', provider: 'copilot', backlog: true, recovery: true, publicationFailure: true },
    { name: 'Claude backlog recovery', provider: 'claude', backlog: true, recovery: true, publicationFailure: true },
  ])('records $name before fallible publication', joinedEnqueue)

  it.each(['copilot', 'claude', 'native'] as const)('does not count a refused %s queue write as admitted work', async (provider) => {
    const runtime = await fixture(provider)
    await runtime.startWarmup()
    const held = holdEnqueue(runtime, 'queued A', 'enqueuePrompt', true)
    const sending = runtime.service.sendMessage(id, 'queued A', true).then((value) => ({ value }), (error: unknown) => ({ error }))
    await held.writing
    const clearing = runtime.service.clearConversation(id)
    await mkdir(path.join(runtime.directory, 'state.json.tmp'))
    held.releaseWrite()
    await held.rejected
    expect((await runtime.persisted()).queuedPrompts).toEqual([])
    await rm(path.join(runtime.directory, 'state.json.tmp'), { recursive: true })
    await runtime.endWarmup()
    await vi.waitFor(() => expect(runtime.store.get(id)?.status).toBe('idle'))
    held.releaseResponse()
    const [failed, cleared] = await Promise.all([sending, clearing])
    expect(failed).toMatchObject({ error: { code: 'EISDIR' } })
    expect(cleared.id).not.toBe(id)
    expect(cleared.queuedPrompts).toEqual([])
    expect(runtime.calls).toEqual(provider === 'native' ? [] : ['warmup'])
  })

  it.each(['copilot', 'claude', 'native'] as const)('allows a later explicit Clear of an already settled %s queue', async (provider) => {
    const runtime = await fixture(provider)
    await runtime.store.enqueuePrompt(id, { id: 'settled', content: 'Previously accepted queue', createdAt })
    const cleared = await runtime.service.clearConversation(id)
    expect(cleared.id).not.toBe(id)
    expect(cleared.queuedPrompts).toEqual([])
    expect(runtime.store.isRetiredSession(id)).toBe(true)
    expect(runtime.calls).toEqual([])
  })

  it.each(['copilot', 'claude', 'native'] as const)('retains a committed %s enqueue across stop without a late dispatch or write', async (provider) => {
    const runtime = await fixture(provider)
    await runtime.startWarmup()
    const held = holdEnqueue(runtime)
    const sending = runtime.service.sendMessage(id, 'queued A', true)
    await held.writing
    let stopped = false
    const stopping = runtime.service.stop().then(() => { stopped = true })
    await tick()
    expect(stopped).toBe(false)
    held.releaseWrite()
    await held.committed
    expect(stopped).toBe(false)
    held.releaseResponse()
    await Promise.all([sending, stopping])
    expect(runtime.calls).toEqual(provider === 'native' ? [] : ['warmup'])
    expect((await runtime.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual(['queued A'])
    const bytes = await readFile(path.join(runtime.directory, 'state.json'), 'utf8')
    const writes = vi.mocked(writeFile).mock.calls.length
    await new Promise((resolve) => setTimeout(resolve, 75))
    expect(vi.mocked(writeFile)).toHaveBeenCalledTimes(writes)
    expect(await readFile(path.join(runtime.directory, 'state.json'), 'utf8')).toBe(bytes)
  })

  it.each([true, false])('records SDK command queue acceptance, not explicit refusal (queued: %s)', async (queued) => {
    const runtime = await fixture('copilot')
    await runtime.startWarmup()
    const entered = gate()
    const finish = gate()
    vi.mocked(runtime.sdk.rpc.commands.enqueue).mockImplementationOnce(async () => {
      entered.finish()
      await finish.promise
      return queued ? { queued, queueId: 'queued-command' } : { queued }
    })
    const command = runtime.service.executeCommand(id, '/help  preserve spacing', true)
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    await entered.promise
    const clearing = runtime.service.clearConversation(id).then((value) => ({ value }), (error: unknown) => ({ error }))
    await runtime.endWarmup()
    await vi.waitFor(() => {
      expect(runtime.active()).toBe(false)
      expect(runtime.store.get(id)?.status).toBe('idle')
    })
    finish.finish()
    const [result, clear] = await Promise.all([command, clearing])
    expect(runtime.sdk.rpc.commands.enqueue).toHaveBeenCalledExactlyOnceWith({ command: '/help  preserve spacing' })
    if (queued) {
      expect(result).toMatchObject({ value: { id } })
      expect(clear).toMatchObject({ error: { statusCode: 409 } })
      expect(runtime.client.deleteSession).not.toHaveBeenCalled()
      expect(runtime.store.isRetiredSession(id)).toBe(false)
    } else {
      expect(result).toMatchObject({ error: { message: 'This session does not support command queueing' } })
      expect(clear).toHaveProperty('value')
      expect(runtime.store.isRetiredSession(id)).toBe(true)
    }
    expect(runtime.calls).toEqual(['warmup'])
  })

  it('retains conservative Clear refusal when the SDK command queue result is lost', async () => {
    const runtime = await fixture('copilot')
    const entered = gate()
    const finish = gate()
    vi.mocked(runtime.sdk.rpc.commands.enqueue).mockImplementationOnce(async () => {
      entered.finish()
      await finish.promise
      throw new Error('Unknown command queue outcome')
    })
    const command = runtime.service.executeCommand(id, '/help', true)
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    await entered.promise
    const clearing = runtime.service.clearConversation(id).then((value) => ({ value }), (error: unknown) => ({ error }))
    finish.finish()
    const [result, clear] = await Promise.all([command, clearing])
    expect(result).toMatchObject({ error: { message: 'Unknown command queue outcome' } })
    expect(clear).toMatchObject({ error: { statusCode: 409 } })
    expect(runtime.sdk.rpc.commands.enqueue).toHaveBeenCalledTimes(1)
    expect(runtime.client.deleteSession).not.toHaveBeenCalled()
    expect(runtime.store.isRetiredSession(id)).toBe(false)
  })

  it.each(['copilot', 'claude'] as const)('keeps two concurrent %s enqueues ordered and wakes each once', async (provider) => {
    const runtime = await fixture(provider)
    await runtime.startWarmup()
    const held = holdEnqueue(runtime)
    const first = runtime.service.sendMessage(id, 'queued A', true)
    await held.writing
    const second = runtime.service.sendMessage(id, 'queued B', true)
    const clearing = runtime.service.clearConversation(id).then((value) => ({ value }), (error: unknown) => ({ error }))
    await runtime.endWarmup()
    held.releaseWrite()
    await held.committed
    await vi.waitFor(() => expect(runtime.store.get(id)?.status).toBe('idle'))
    held.releaseResponse()
    const [a, b, clear] = await Promise.all([first, second, clearing])
    expect(a.id).toBe(id)
    expect(b.id).toBe(id)
    expect(clear).toMatchObject({ error: { statusCode: 409 } })
    await vi.waitFor(() => expect(runtime.calls).toEqual(['warmup', 'queued A', 'queued B']))
    await quiet(runtime)
    expect(runtime.store.isRetiredSession(id)).toBe(false)
    expect((await runtime.persisted()).queuedPrompts).toEqual([])
  })

  it.each([false, true])('preserves CLI-native acceptance even if its activity write fails (refused: %s)', async (refused) => {
    const runtime = await fixture('native')
    runtime.nativeHistory(false)
    await runtime.startWarmup()
    const writing = gate()
    const releaseWrite = gate()
    const settled = gate()
    const releaseResult = gate()
    let held = false
    vi.mocked(writeFile).mockImplementation(async (...args) => {
      if (!held && String(args[0]) === path.join(runtime.directory, 'state.json.tmp') &&
          JSON.parse(String(args[1])).sessions[id]?.activity === 'Queued in terminal') {
        held = true
        writing.finish()
        await releaseWrite.promise
      }
      return disk.writeFile(...args)
    })
    const update = runtime.store.update.bind(runtime.store)
    vi.spyOn(runtime.store, 'update').mockImplementationOnce(async (...args) => {
      try {
        const result = await update(...args)
        settled.finish()
        await releaseResult.promise
        return result
      } catch (error) {
        settled.finish()
        await releaseResult.promise
        throw error
      }
    })
    const sending = runtime.service.sendMessage(id, 'CLI-native queued A', true)
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    await writing.promise
    expect(runtime.terminal.send).toHaveBeenCalledExactlyOnceWith(id, 'CLI-native queued A', true)
    const clearing = runtime.service.clearConversation(id).then((value) => ({ value }), (error: unknown) => ({ error }))
    if (refused) await mkdir(path.join(runtime.directory, 'state.json.tmp'))
    releaseWrite.finish()
    await settled.promise
    if (refused) await rm(path.join(runtime.directory, 'state.json.tmp'), { recursive: true })
    await runtime.endWarmup()
    releaseResult.finish()
    const [result, clear] = await Promise.all([sending, clearing])
    if (refused) expect(result).toMatchObject({ error: {
      statusCode: 409, cause: { code: 'EISDIR' }, submission: { sessionId: id, accepted: true },
    } })
    else expect(result).toMatchObject({ value: { id } })
    expect(clear).toMatchObject({ error: { statusCode: 409 } })
    expect(runtime.calls).toEqual(['CLI-native queued A'])
    expect(runtime.terminal.reset).not.toHaveBeenCalled()
    expect(runtime.client.deleteSession).not.toHaveBeenCalled()
    expect(runtime.store.isRetiredSession(id)).toBe(false)
  })
})
