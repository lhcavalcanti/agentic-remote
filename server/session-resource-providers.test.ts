import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CopilotClient, CopilotSession } from '@github/copilot-sdk'
import type { Options, Query, SDKMessage } from '@anthropic-ai/claude-agent-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { SessionStore } from './session-store.js'
import type { CopilotResourceMethod } from './session-resource-transport.js'

const fixtures: { directory: string; stop: () => Promise<unknown> }[] = []
const releases: (() => void)[] = []
const capturedAt = '2026-09-05T10:00:00.000Z'
type Skills = Awaited<ReturnType<CopilotSession['rpc']['skills']['list']>>
type Mcp = Awaited<ReturnType<CopilotSession['rpc']['mcp']['list']>>
type DiscoveredSkills = Awaited<ReturnType<CopilotClient['rpc']['skills']['discover']>>
type DiscoveredMcp = Awaited<ReturnType<CopilotClient['rpc']['mcp']['discover']>>
type ClaudeMcpRead = (signal?: AbortSignal) => ReturnType<Query['mcpServerStatus']>

function deferred<T>() {
  let resolve!: (result: T) => void
  const promise = new Promise<T>((accept) => { resolve = accept })
  return { promise, resolve }
}

function pause() {
  const result = deferred<void>()
  releases.push(() => result.resolve())
  return result
}

async function directory() {
  const result = path.resolve(`.session-resource-fixture-${randomUUID()}`)
  await mkdir(result, { mode: 0o700 })
  return result
}

function seed(cwd: string, provider: 'copilot' | 'claude'): SessionDetail {
  return { id: 'session', provider, cwd, title: 'Fixture', status: 'idle', isOpen: true, updatedAt: capturedAt, messages: [] }
}

async function copilotFixture(mode: 'loaded' | 'unloaded' | 'tmux' | 'suspended' = 'loaded') {
  const cwd = await directory()
  const store = new SessionStore(cwd)
  await store.initialize()
  await store.create({
    ...seed(cwd, 'copilot'), suspended: mode === 'suspended',
  }, { managedOpen: true, backend: mode === 'tmux' ? 'terminal' : 'sdk' })
  const sdk = {
    sessionId: 'session',
    send: vi.fn(async () => 'receipt'),
    sendAndWait: vi.fn(async () => undefined),
    on: vi.fn(() => () => {}),
    getEvents: vi.fn(async () => []),
    abort: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    rpc: {
      name: { set: vi.fn(async () => {}) },
      mode: { set: vi.fn(async () => {}) },
      model: {
        getCurrent: vi.fn(async () => ({ modelId: 'fixture' })),
        switchTo: vi.fn(async () => ({ modelId: 'fixture' })),
      },
      commands: {
        list: vi.fn(async () => ({ commands: [] })),
        invoke: vi.fn(async () => ({ kind: 'text' as const, text: 'No invocation' })),
        enqueue: vi.fn(async () => ({ queued: true })),
      },
      skills: { list: vi.fn(async (): Promise<Skills> => ({ skills: [
        { name: 'live', description: 'Session override', source: 'project', enabled: false, userInvocable: true },
      ] })) },
      mcp: { list: vi.fn(async (): Promise<Mcp> => ({ servers: [
        { name: 'live-mcp', status: 'connected', source: 'plugin', sourcePlugin: 'docs' },
      ] })) },
    },
  } satisfies CopilotSessionLike
  const client = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => []),
    createSession: vi.fn(async () => sdk),
    resumeSession: vi.fn(async () => sdk),
    deleteSession: vi.fn(async () => {}),
    listSessions: vi.fn(async () => []),
    requestResource: vi.fn(async (method: CopilotResourceMethod, params: Record<string, unknown>, _signal: AbortSignal): Promise<unknown> => {
      switch (method) {
        case 'session.skills.list': return sdk.rpc.skills.list()
        case 'session.mcp.list': return sdk.rpc.mcp.list()
        case 'skills.discover': return client.rpc.skills.discover(params as Parameters<CopilotClient['rpc']['skills']['discover']>[0])
        case 'mcp.discover': return client.rpc.mcp.discover(params as Parameters<CopilotClient['rpc']['mcp']['discover']>[0])
      }
    }),
    rpc: {
      commands: { list: sdk.rpc.commands.list },
      models: { list: vi.fn(async () => ({ models: [] })) },
      skills: { discover: vi.fn(async (_params?: Parameters<CopilotClient['rpc']['skills']['discover']>[0]): Promise<DiscoveredSkills> => ({ skills: [
        { name: 'workspace', description: 'Global state', source: 'personal-copilot', userInvocable: true, enabled: true },
      ] })) },
      mcp: { discover: vi.fn(async (_params?: Parameters<CopilotClient['rpc']['mcp']['discover']>[0]): Promise<DiscoveredMcp> => ({ servers: [
        { name: 'configured', enabled: true, source: 'workspace', type: 'stdio' },
        { name: 'disabled', enabled: false, source: 'user', type: 'http' },
      ] })) },
    },
  } satisfies CopilotClientLike
  const terminal = {
    has: vi.fn(async () => mode === 'tmux'),
    send: vi.fn(async () => false), capture: vi.fn(async () => undefined),
    cancel: vi.fn(async () => false),
  }
  const service = new AgentService(
    store, client, async () => [], async () => {}, async () => [],
    async () => undefined, terminal, async () => undefined, async () => undefined,
  )
  fixtures.push({ directory: cwd, stop: () => service.stop() })
  if (mode === 'loaded') await service.openSession('session')
  vi.clearAllMocks()
  return { cwd, store, service, sdk, client, terminal }
}

async function claudeFixture() {
  const cwd = await directory()
  const store = new SessionStore(cwd)
  const turns: {
    options: Options
    release: () => void
    yielded: ReturnType<typeof deferred<void>>
    skills: ReturnType<typeof vi.fn<Query['supportedCommands']>>
    mcp: ReturnType<typeof vi.fn<ClaudeMcpRead>>
  }[] = []
  let init: Record<string, unknown> = {
    skills: ['review'], mcp_servers: [{ name: 'initial', status: 'pending' }],
  }
  const query = vi.fn(({ prompt, options = {} }: { prompt: unknown; options?: Options }) => {
    const finished = pause()
    const yielded = deferred<void>()
    const skills = vi.fn<Query['supportedCommands']>(async () => [
      { name: 'review', description: 'Safe description', argumentHint: '[path]' },
      { name: 'help', description: 'Builtin, not a skill', argumentHint: '' },
    ])
    const mcp = vi.fn<ClaudeMcpRead>(async () => [{
      name: 'runtime', status: 'failed', scope: 'project',
      error: 'PRIVATE_MCP_ERROR', config: { type: 'http', url: 'https://example.invalid/PRIVATE_CONFIG' },
      tools: [{ name: 'PRIVATE_TOOL' }],
    }])
    const generator = async function* () {
      if (typeof prompt !== 'string') return
      yield {
        type: 'system', subtype: 'init', session_id: 'session', cwd,
        ...init, apiKeySource: 'PRIVATE_ACCOUNT', plugins: [{ name: 'PRIVATE_PLUGIN', path: 'PRIVATE_PATH' }],
      } as unknown as SDKMessage
      if (init.commandsChanged !== undefined) {
        yield { type: 'system', subtype: 'commands_changed', commands: init.commandsChanged } as SDKMessage
      }
      yielded.resolve()
      await Promise.race([
        finished.promise,
        new Promise<void>((resolve) => options.abortController?.signal.addEventListener('abort', () => resolve(), { once: true })),
      ])
      yield {
        type: 'result', subtype: 'success', is_error: false, session_id: 'session', modelUsage: {},
      } as unknown as SDKMessage
    }
    if (typeof prompt === 'string') {
      turns.push({ options, release: () => finished.resolve(), yielded, skills, mcp })
    }
    return Object.assign(generator(), {
      supportedModels: async () => [],
      supportedCommands: skills,
      mcpServerStatus: mcp,
      initializationResult: async () => ({ commands: await skills() }),
      request: async (_input: { subtype: 'mcp_status' }, options: { signal: AbortSignal }) => ({
        response: { mcpServers: await mcp(options.signal) },
      }),
    }) as unknown as Query
  })
  const sdk = {
    query: query as ClaudeSdk['query'],
    getSessionInfo: vi.fn(async () => undefined),
    renameSession: vi.fn(async () => {}),
    deleteSession: vi.fn(async () => {}),
  }
  const service = new ClaudeAgentService(store, '/bin/true', sdk, async () => ({ loggedIn: true }))
  fixtures.push({ directory: cwd, stop: () => service.stop() })
  await service.start()
  await store.create(seed(cwd, 'claude'), { managedOpen: true, backend: 'sdk' })
  query.mockClear()
  const begin = async (metadata?: Record<string, unknown>) => {
    if (metadata) init = metadata
    const count = turns.length
    await service.sendMessage('session', 'A normal user turn')
    await vi.waitFor(() => expect(turns.length).toBe(count + 1))
    const turn = turns.at(-1)!
    await turn.yielded.promise
    return turn
  }
  const end = async () => {
    turns.at(-1)!.release()
    await vi.waitFor(() => expect(service.getSession('session')?.status).toBe('idle'))
    // Finish the normal provider rename/finally, not merely its stored idle status.
    await new Promise((resolve) => setImmediate(resolve))
  }
  return { cwd, service, store, sdk, query, begin, end, turns }
}

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.all(fixtures.map(({ stop }) => stop()))
  await Promise.all(fixtures.splice(0).map(({ directory }) => rm(directory, { recursive: true, force: true })))
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('read-only Copilot resource views', () => {
  it.each(['abort', 'timeout', 'stop'] as const)('settles provider work on %s without turning cancellation into workspace discovery', async (reason) => {
    const { service, client, sdk } = await copilotFixture()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    let pending = 0
    let providerSignal!: AbortSignal
    client.requestResource.mockImplementationOnce((_method, _params, signal) => {
      providerSignal = signal
      pending += 1
      return new Promise((_resolve, reject) => {
        const abort = () => { pending -= 1; reject(signal.reason) }
        signal.addEventListener('abort', abort, { once: true })
      })
    })
    const controller = new AbortController()
    const reading = service.listSkills('session', controller.signal).catch((error: unknown) => error)
    expect(pending).toBe(1)
    if (reason === 'abort') controller.abort()
    else if (reason === 'timeout') await vi.advanceTimersByTimeAsync(10_001)
    else await service.stop()
    expect(await reading).toMatchObject({ statusCode: reason === 'timeout' ? 504 : reason === 'stop' ? 503 : 499 })
    expect(pending).toBe(0)
    expect(providerSignal.aborted).toBe(true)
    expect(client.requestResource).toHaveBeenCalledOnce()
    expect(client.rpc.skills.discover).not.toHaveBeenCalled()
    expect(sdk.send).not.toHaveBeenCalled()
    expect(sdk.abort).not.toHaveBeenCalled()
    if (reason !== 'stop') expect(sdk.disconnect).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reads only a loaded SDK session without startup, prompt, command, terminal, or store operations', async () => {
    const { cwd, store, service, sdk, client, terminal } = await copilotFixture()
    const before = await readFile(path.join(cwd, 'state.json'), 'utf8')
    const update = vi.spyOn(store, 'update')
    const readAfterWrites = vi.spyOn(store, 'readAfterWrites')
    expect(await service.listSkills('session')).toMatchObject({ scope: 'session', skills: [{ name: 'live', enabled: false }] })
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'session', servers: [{ name: 'live-mcp', status: 'connected', pluginName: 'docs' }] })
    for (const method of [
      client.createSession, client.resumeSession, client.start, sdk.send, sdk.sendAndWait,
      sdk.rpc.commands.list, sdk.rpc.commands.invoke, sdk.rpc.commands.enqueue,
      client.rpc.skills.discover, client.rpc.mcp.discover, terminal.has, terminal.capture,
      terminal.send, update, readAfterWrites,
    ]) expect(method).not.toHaveBeenCalled()
    expect(await readFile(path.join(cwd, 'state.json'), 'utf8')).toBe(before)
  })

  it.each(['unloaded', 'tmux', 'suspended'] as const)('reports %s resources as workspace defaults without starting the session', async (mode) => {
    const { cwd, service, client, sdk, terminal } = await copilotFixture(mode)
    expect(await service.listSkills('session')).toMatchObject({ scope: 'workspace', skills: [{ name: 'workspace', source: 'user' }] })
    const mcp = await service.listMcpServers('session')
    expect(mcp).toMatchObject({
      scope: 'workspace',
      servers: [{ name: 'configured', status: 'unknown', transport: 'stdio' }, { name: 'disabled', status: 'disabled' }],
    })
    expect(mcp.message).toContain('not live terminal state')
    expect(client.rpc.skills.discover).toHaveBeenCalledExactlyOnceWith({ projectPaths: [cwd] })
    expect(client.rpc.mcp.discover).toHaveBeenCalledExactlyOnceWith({ workingDirectory: cwd })
    for (const method of [client.start, client.createSession, client.resumeSession, sdk.rpc.skills.list, sdk.rpc.mcp.list, terminal.has, terminal.capture, terminal.send]) {
      expect(method).not.toHaveBeenCalled()
    }
  })

  it('keeps authoritative empty live results, falls back only on method-not-found, and reports genuine failures safely', async () => {
    const { service, sdk, client } = await copilotFixture()
    sdk.rpc.skills.list.mockResolvedValueOnce({ skills: [] })
    expect(await service.listSkills('session')).toMatchObject({ scope: 'session', skills: [], totalCount: 0 })
    expect(client.rpc.skills.discover).not.toHaveBeenCalled()
    sdk.rpc.skills.list.mockRejectedValueOnce({ code: -32601, message: 'PRIVATE_METHOD' })
    expect(await service.listSkills('session')).toMatchObject({ scope: 'workspace', skills: [{ name: 'workspace' }] })
    sdk.rpc.mcp.list.mockRejectedValueOnce(Object.assign(new Error('PRIVATE_MCP_FAILURE'), { statusCode: 401 }))
    await expect(service.listMcpServers('session')).rejects.toMatchObject({ statusCode: 502, message: 'Unable to read session resource metadata.' })
    expect(client.rpc.mcp.discover).not.toHaveBeenCalled()
    sdk.rpc.mcp.list.mockRejectedValueOnce({ code: -32601 })
    client.rpc.mcp.discover.mockRejectedValueOnce({ code: -32601 })
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'unavailable', servers: [] })
  })

  it('returns unavailable for older SDK adapters instead of invoking command discovery', async () => {
    const { service, client, sdk } = await copilotFixture()
    Reflect.deleteProperty(sdk.rpc, 'skills')
    Reflect.deleteProperty(sdk.rpc, 'mcp')
    Reflect.deleteProperty(client.rpc, 'skills')
    Reflect.deleteProperty(client.rpc, 'mcp')
    expect(await service.listSkills('session')).toMatchObject({ scope: 'unavailable' })
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'unavailable' })
    expect(sdk.rpc.commands.list).not.toHaveBeenCalled()
    expect(client.createSession).not.toHaveBeenCalled()
    expect(client.resumeSession).not.toHaveBeenCalled()
  })

  it.each(['cwd', 'provider', 'replace', 'remove', 'clear', 'stop'] as const)('rejects late metadata after %s changes ownership', async (change) => {
    const { service, sdk, store, cwd } = await copilotFixture()
    const pending = deferred<Skills>()
    sdk.rpc.skills.list.mockReturnValueOnce(pending.promise)
    const reading = service.listSkills('session').catch((error: unknown) => error)
    if (change === 'cwd') {
      await store.update('session', (session) => { session.cwd = `${cwd}/other` })
      await store.update('session', (session) => { session.cwd = cwd })
    } else if (change === 'provider') {
      await store.update('session', (session) => { session.provider = 'claude' })
    } else if (change === 'replace') {
      await store.create(seed(cwd, 'copilot'), { managedOpen: true, backend: 'sdk' })
    } else if (change === 'remove') {
      await store.remove('session')
    } else if (change === 'clear') {
      await store.clearConversation('session')
    } else {
      await service.stop()
    }
    pending.resolve({ skills: [] })
    expect(await reading).toMatchObject({ statusCode: change === 'stop' ? 503 : 409 })
  })

  it('refuses missing sessions and new metadata calls after stop', async () => {
    const { service, sdk, client } = await copilotFixture()
    await expect(service.listSkills('missing')).rejects.toMatchObject({ statusCode: 404 })
    await service.stop()
    await expect(service.listSkills('session')).rejects.toMatchObject({ statusCode: 503 })
    await expect(service.listMcpServers('session')).rejects.toMatchObject({ statusCode: 503 })
    expect(sdk.rpc.skills.list).not.toHaveBeenCalled()
    expect(client.rpc.mcp.discover).not.toHaveBeenCalled()
  })

  it('does not couple an asynchronous metadata read to an active turn or ordinary revisions', async () => {
    const { service, sdk, store } = await copilotFixture()
    const pending = deferred<Skills>()
    sdk.rpc.skills.list.mockReturnValueOnce(pending.promise)
    const reading = service.listSkills('session')
    await store.update('session', (session) => {
      session.status = 'running'
      session.messages.push({ id: 'stream', role: 'assistant', content: '', createdAt: capturedAt, streaming: true })
    })
    store.streamMessage('session', 'stream', 'Normal streaming content')
    pending.resolve({ skills: [] })
    expect(await reading).toMatchObject({ scope: 'session', skills: [] })
    expect(store.get('session')?.status).toBe('running')
    expect(store.get('session')?.messages[0].content).toBe('Normal streaming content')
  })
})

describe('read-only Claude resource views', () => {
  it('observes command updates without fetching commands on refresh or relabelling builtins as skills', async () => {
    const { service, begin, end } = await claudeFixture()
    const turn = await begin({
      skills: ['review'], mcp_servers: [],
      commandsChanged: [
        { name: 'review', description: 'Updated description', argumentHint: '[file]' },
        { name: 'help', description: 'Not a skill', argumentHint: '' },
      ],
    })
    const first = await service.listSkills('session')
    const second = await service.listSkills('session')
    expect(second).toEqual(first)
    expect(second.skills).toEqual([{ name: 'review', commandName: 'review', description: 'Updated description', argumentHint: '[file]' }])
    expect(turn.skills).toHaveBeenCalledOnce()
    await end()
    expect(await service.listSkills('session')).toMatchObject({
      scope: 'last-known', capturedAt: first.capturedAt, skills: first.skills,
    })
  })

  it('retires observations if replacement committed before post-commit cleanup failed', async () => {
    const { service, store, cwd, begin, end } = await claudeFixture()
    await begin()
    await end()
    await writeFile(path.join(cwd, 'uploads'), 'Synthetic obstruction')
    const replacement = await service.clearConversation('session')
    expect(store.get('session')).toBeUndefined()
    const observations = Reflect.get(service, 'resourceObservations') as Map<string, unknown>
    expect(observations.has('session')).toBe(false)
    expect(store.list()[0].id).toBe(replacement.id)
    expect(await service.listSkills(replacement.id)).toMatchObject({ scope: 'unavailable' })
  })

  it.each(['abort', 'timeout', 'query-end', 'stop'] as const)('settles Claude metadata on %s without retiring last-known observations', async (reason) => {
    const { service, begin, end } = await claudeFixture()
    const turn = await begin()
    const before = await service.listMcpServers('session')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    let pending = 0
    let providerSignal!: AbortSignal
    turn.mcp.mockImplementationOnce((signal) => {
      providerSignal = signal!
      pending += 1
      return new Promise((_resolve, reject) => {
        signal!.addEventListener('abort', () => { pending -= 1; reject(signal!.reason) }, { once: true })
      })
    })
    const controller = new AbortController()
    const reading = service.listMcpServers('session', controller.signal).catch((error: unknown) => error)
    expect(pending).toBe(1)
    if (reason === 'abort') controller.abort()
    else if (reason === 'timeout') await vi.advanceTimersByTimeAsync(10_001)
    else if (reason === 'query-end') await end()
    else await service.stop()
    expect(await reading).toMatchObject({
      statusCode: reason === 'timeout' ? 504 : reason === 'query-end' ? 409 : reason === 'stop' ? 503 : 499,
    })
    expect(pending).toBe(0)
    expect(providerSignal.aborted).toBe(true)
    if (reason !== 'stop') {
      expect(turn.options.abortController?.signal.aborted).toBe(false)
      if (reason !== 'query-end') await end()
      expect(await service.listMcpServers('session')).toMatchObject({
        scope: 'last-known', capturedAt: before.capturedAt, servers: before.servers,
      })
    }
  })

  it.each(['store', 'busy'] as const)('preserves resource observations when clear is refused by %s', async (failure) => {
    const { service, store, begin, end } = await claudeFixture()
    await begin()
    const skills = await service.listSkills('session')
    const mcp = await service.listMcpServers('session')
    if (failure !== 'busy') await end()
    if (failure === 'store') {
      vi.spyOn(store, 'replaceWithClearedSession').mockRejectedValueOnce(new Error('State write refused'))
    }
    await expect(service.clearConversation('session')).rejects.toThrow()
    if (failure === 'busy') await end()
    expect(service.getSession('session')).toBeDefined()
    expect(await service.listSkills('session')).toMatchObject({
      scope: 'last-known', capturedAt: skills.capturedAt, skills: skills.skills,
    })
    expect(await service.listMcpServers('session')).toMatchObject({
      scope: 'last-known', capturedAt: mcp.capturedAt, servers: mcp.servers,
    })
  })

  it('is unavailable before a turn and uses only safe active metadata and honest last-known timestamps', async () => {
    const { service, cwd, query, begin, end, store } = await claudeFixture()
    expect(await service.listSkills('session')).toMatchObject({ scope: 'unavailable' })
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'unavailable' })
    expect(query).not.toHaveBeenCalled()
    const turn = await begin()
    const before = await readFile(path.join(cwd, 'state.json'), 'utf8')
    const update = vi.spyOn(store, 'update')
    const activeSkills = await service.listSkills('session')
    const activeMcp = await service.listMcpServers('session')
    expect(activeSkills).toMatchObject({ scope: 'session', skills: [{ name: 'review', description: 'Safe description', argumentHint: '[path]' }] })
    expect(activeSkills.skills).toHaveLength(1)
    expect(activeMcp).toMatchObject({ scope: 'session', servers: [{ name: 'runtime', status: 'failed', toolCount: 1 }] })
    expect(JSON.stringify({ activeSkills, activeMcp })).not.toContain('PRIVATE')
    expect(before).not.toContain('PRIVATE')
    expect(before).not.toContain('"review"')
    expect(await readFile(path.join(cwd, 'state.json'), 'utf8')).toBe(before)
    expect(update).not.toHaveBeenCalled()
    expect(query).toHaveBeenCalledTimes(1)
    expect(turn.skills).toHaveBeenCalledTimes(1)
    expect(turn.mcp).toHaveBeenCalledTimes(1)
    await end()
    expect(await service.listSkills('session')).toMatchObject({ scope: 'last-known', capturedAt: activeSkills.capturedAt, skills: activeSkills.skills })
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'last-known', capturedAt: activeMcp.capturedAt, servers: activeMcp.servers })
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('never treats supported builtins as skills when init did not report skills', async () => {
    const { service, begin, end } = await claudeFixture()
    const turn = await begin({ mcp_servers: [] })
    expect(await service.listSkills('session')).toMatchObject({ scope: 'unavailable' })
    expect(turn.skills).not.toHaveBeenCalled()
    await end()
    expect(await service.listSkills('session')).toMatchObject({ scope: 'unavailable' })
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'last-known', servers: [], totalCount: 0 })
  })

  it('keeps malformed init nonfatal to inference but exposes an explicit view error', async () => {
    const { service, begin, end } = await claudeFixture()
    const turn = await begin({ skills: [null], mcp_servers: undefined })
    await expect(service.listSkills('session')).rejects.toMatchObject({ statusCode: 502 })
    turn.mcp.mockRejectedValueOnce(new Error('PRIVATE_FAILURE'))
    await expect(service.listMcpServers('session')).rejects.toMatchObject({ statusCode: 502, message: 'Unable to read session resource metadata.' })
    await end()
    expect(service.getSession('session')?.status).toBe('idle')
    await expect(service.listSkills('session')).rejects.toMatchObject({ statusCode: 502 })
  })

  it('ignores command enrichment when the explicit skill list is empty', async () => {
    const { service, begin } = await claudeFixture()
    const turn = await begin({ skills: [], mcp_servers: [] })
    expect(await service.listSkills('session')).toMatchObject({ scope: 'session', skills: [], totalCount: 0 })
    expect(turn.skills).not.toHaveBeenCalled()
  })

  it('rejects late reads from superseded queries and keeps the newer snapshot', async () => {
    const { service, begin, end } = await claudeFixture()
    const first = await begin()
    const pending = deferred<Awaited<ReturnType<Query['mcpServerStatus']>>>()
    first.mcp.mockReturnValueOnce(pending.promise)
    const reading = service.listMcpServers('session').catch((error: unknown) => error)
    await end()
    await begin({ skills: ['new-skill'], mcp_servers: [] })
    pending.resolve([{ name: 'stale', status: 'connected' }])
    expect(await reading).toMatchObject({ statusCode: 409 })
    expect(await service.listSkills('session')).toMatchObject({ scope: 'session', skills: [{ name: 'new-skill' }] })
  })

  it.each(['delete', 'clear', 'stop', 'cwd', 'replace'] as const)('does not resurrect snapshots after %s', async (change) => {
    const { service, begin, end, store, cwd, query } = await claudeFixture()
    const turn = await begin()
    const pending = deferred<Awaited<ReturnType<Query['mcpServerStatus']>>>()
    turn.mcp.mockReturnValueOnce(pending.promise)
    const reading = service.listMcpServers('session').catch((error: unknown) => error)
    if (change === 'stop') {
      await service.stop()
    } else {
      await end()
      if (change === 'delete') {
        await service.deleteSession('session')
      } else if (change === 'clear') {
        const replacement = await service.clearConversation('session')
        expect(await service.listSkills(replacement.id)).toMatchObject({ scope: 'unavailable' })
      } else if (change === 'cwd') {
        await store.update('session', (session) => { session.cwd = `${cwd}/other` })
      } else {
        await store.create(seed(cwd, 'claude'), { managedOpen: true, backend: 'sdk' })
      }
    }
    pending.resolve([{ name: 'stale', status: 'connected' }])
    expect(await reading).toMatchObject({ statusCode: change === 'stop' ? 503 : 409 })
    if (change === 'delete') {
      await expect(service.listMcpServers('session')).rejects.toMatchObject({ statusCode: 404 })
    } else if (change !== 'stop' && change !== 'clear') {
      expect(await service.listMcpServers('session')).toMatchObject({ scope: 'unavailable' })
    }
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('returns unavailable after restart or suspension and refuses reads after shutdown', async () => {
    const { service, begin, end, store, cwd, sdk, query } = await claudeFixture()
    await begin()
    await end()
    await service.suspendSession('session')
    expect(await service.listSkills('session')).toMatchObject({ scope: 'unavailable' })
    await service.stop()
    await expect(service.listSkills('session')).rejects.toMatchObject({ statusCode: 503 })
    await expect(service.listMcpServers('missing')).rejects.toMatchObject({ statusCode: 503 })
    const reloaded = new ClaudeAgentService(new SessionStore(cwd), '/bin/true', sdk)
    await reloaded.store.initialize()
    expect(await reloaded.listSkills('session')).toMatchObject({ scope: 'unavailable' })
    await expect(reloaded.listMcpServers('missing')).rejects.toMatchObject({ statusCode: 404 })
    expect(store.get('session')?.suspended).toBe(true)
    expect(query).toHaveBeenCalledTimes(1)
    await reloaded.store.close()
  })

  it('retains init metadata when optional active query metadata methods are unsupported', async () => {
    const { service, begin, end } = await claudeFixture()
    const turn = await begin()
    turn.skills.mockRejectedValueOnce({ code: -32601, message: 'PRIVATE_UNSUPPORTED' })
    turn.mcp.mockRejectedValueOnce({ code: -32601, message: 'PRIVATE_UNSUPPORTED' })
    expect(await service.listSkills('session')).toMatchObject({ scope: 'session', skills: [{ name: 'review' }] })
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'session', servers: [{ name: 'initial', status: 'pending' }] })
    await end()
    expect(await service.listMcpServers('session')).toMatchObject({ scope: 'last-known', servers: [{ name: 'initial' }] })
  })
})
