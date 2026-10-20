import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import type { Options, Query, SDKMessage } from '@anthropic-ai/claude-agent-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { QueuedDispatches, type QueuedDelivery } from './queued-dispatch.js'
import { SessionStore } from './session-store.js'

const timestamp = '2026-09-05T00:00:00.000Z'
const originalQueue = ['first', 'middle', 'last'].map((id) => ({
  id, content: `original ${id}`, createdAt: timestamp,
}))
const fixtures: { directory: string; service: AgentService | ClaudeAgentService }[] = []
const releases: (() => void)[] = []

function gate<T = void>() {
  let resolve = (_value: T) => {}
  const promise = new Promise<T>((accept) => { resolve = accept })
  return { promise, resolve }
}

function pause() {
  const deferred = gate()
  releases.push(deferred.resolve)
  return deferred
}

function seed(directory: string, provider: 'copilot' | 'claude'): SessionDetail {
  return {
    id: 'session', title: 'Original title', cwd: directory, updatedAt: timestamp,
    provider, status: 'idle', isOpen: true, messages: [],
    queuedPrompts: structuredClone(originalQueue), queuedCount: 3,
  }
}

function copilotSession() {
  const listeners = new Set<(event: SessionEvent) => void>()
  const sdk = {
    sessionId: 'session',
    send: vi.fn(async (_options: { prompt: string; mode: 'immediate' }) => 'provider-receipt'),
    sendAndWait: vi.fn(async () => undefined),
    getEvents: vi.fn(async (): Promise<SessionEvent[]> => []),
    abort: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    on: (listener: (event: SessionEvent) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    emit: (type: string, data: unknown = {}) => {
      for (const listener of listeners) {
        listener({ id: type, type, data, timestamp, parentId: null } as SessionEvent)
      }
    },
    rpc: {
      name: { set: vi.fn(async () => {}) },
      mode: { set: vi.fn(async () => ({ status: 'applied', modelChanged: false })) },
      model: {
        getCurrent: async () => ({ modelId: 'fixture' }),
        switchTo: async () => ({ modelId: 'fixture' }),
      },
      commands: {
        list: vi.fn(async () => ({ commands: [
          { name: 'allow-all', aliases: ['yolo'], kind: 'builtin' as const, description: 'Allow tools', allowDuringAgentExecution: true },
          { name: 'plan', kind: 'builtin' as const, description: 'Make a plan', allowDuringAgentExecution: true },
          { name: 'clear', aliases: ['wipe'], kind: 'builtin' as const, description: 'Clear history', allowDuringAgentExecution: false },
        ] })),
        invoke: vi.fn(async (_options: { name: string; input?: string }): Promise<
          { kind: 'text'; text: string } | { kind: 'agent-prompt'; prompt: string; displayPrompt: string }
        > => ({ kind: 'text', text: 'Command accepted' })),
        enqueue: vi.fn(async (): Promise<{ queued: true; queueId: string } | { queued: false }> => ({ queued: true, queueId: 'queued-command' })),
      },
    },
  }
  return sdk
}

async function copilotFixture(terminalBacked = false) {
  const directory = await mkdtemp(path.join(tmpdir(), 'queued-copilot-'))
  const store = new SessionStore(directory)
  await store.initialize()
  await store.create(seed(directory, 'copilot'), {
    managedOpen: true, backend: terminalBacked ? 'terminal' : 'sdk',
  })
  const sdk = copilotSession()
  const client = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => []),
    createSession: vi.fn(async (): Promise<CopilotSessionLike> => sdk),
    resumeSession: vi.fn(async (): Promise<CopilotSessionLike> => sdk),
    deleteSession: vi.fn(async () => {}),
    listSessions: vi.fn(async () => []),
    rpc: {
      models: { list: async () => ({ models: [] }) },
      commands: { list: sdk.rpc.commands.list },
    },
  } satisfies CopilotClientLike
  const terminal = {
    has: vi.fn(async () => terminalBacked),
    send: vi.fn(async () => terminalBacked),
    cancel: vi.fn(async () => false),
    capture: vi.fn(async (): Promise<string | undefined> => undefined),
  }
  const service = new AgentService(
    store, client, async () => [], async () => {}, async () => [],
    async () => undefined, terminal, async () => undefined, async () => undefined,
  )
  fixtures.push({ directory, service })
  return { directory, store, service, sdk, client, terminal }
}

function claudeMessage(type: 'assistant' | 'stream_event' | 'user' | 'result' | 'system'): SDKMessage {
  if (type === 'assistant') return {
    type, session_id: 'session', message: { content: [{ type: 'text', text: 'Accepted reply' }] },
  } as SDKMessage
  if (type === 'stream_event') return {
    type, session_id: 'session',
    event: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Accepted reply' } },
  } as SDKMessage
  if (type === 'result') return {
    type, subtype: 'success', is_error: false, session_id: 'session', modelUsage: {},
  } as SDKMessage
  if (type === 'system') return {
    type, subtype: 'init', session_id: 'session', model: 'fixture', tools: [],
  } as unknown as SDKMessage
  return { type, session_id: 'session', message: { content: 'submitted' } } as SDKMessage
}

function aborted(options: Options): Promise<void> {
  return new Promise((resolve) => {
    if (options.abortController?.signal.aborted) resolve()
    else options.abortController?.signal.addEventListener('abort', () => resolve(), { once: true })
  })
}

async function claudeFixture(
  run: (options: Options) => AsyncGenerator<SDKMessage> = async function* (options) {
    yield claudeMessage('assistant')
    await aborted(options)
  },
) {
  const directory = await mkdtemp(path.join(tmpdir(), 'queued-claude-'))
  const store = new SessionStore(directory)
  const auth = vi.fn(async () => ({ loggedIn: true }))
  const query = vi.fn(({ prompt, options = {} }: { prompt: unknown; options?: Options }) =>
    Object.assign(
      typeof prompt === 'string' ? run(options) : (async function* () {})(),
      { supportedModels: async () => [{ value: 'fixture', displayName: 'Fixture', description: 'Fake' }] },
    ) as unknown as Query,
  )
  const sdk = {
    query: query as ClaudeSdk['query'],
    getSessionInfo: vi.fn(async (): Promise<undefined> => undefined),
    renameSession: vi.fn(async () => {}),
    deleteSession: vi.fn(async () => {}),
  }
  const service = new ClaudeAgentService(store, '/bin/true', sdk, auth)
  fixtures.push({ directory, service })
  await service.start()
  await store.create(seed(directory, 'claude'), { managedOpen: true, backend: 'sdk' })
  return {
    directory, store, service, sdk, auth, query,
    promptCalls: () => query.mock.calls.filter(([input]) => typeof input.prompt === 'string'),
  }
}

async function unknownClaim(store: SessionStore) {
  return new QueuedDispatches(store, () => {}).run(
    'session', { promptId: 'middle', content: 'unconfirmed rewrite' },
    async (text) => text,
    async (_prompt, delivery) => {
      delivery.submit()
      throw new Error('Receipt unavailable')
    },
    () => {},
  )
}

afterEach(async () => {
  vi.useRealTimers()
  releases.splice(0).forEach((release) => release())
  await Promise.all(fixtures.map(({ service }) => service.stop()))
  await Promise.all(fixtures.splice(0).map(({ directory }) => rm(directory, { recursive: true, force: true })))
  vi.restoreAllMocks()
})

describe('provider queued delivery', () => {
  it('sends the exact middle rewrite once and acknowledges the SDK receipt before completion', async () => {
    const { service, sdk, store } = await copilotFixture()
    const content = '  first line\n    indented line\n'
    const result = await service.dispatchQueuedPrompt('session', 'middle', content)
    expect(result).toMatchObject({
      outcome: 'sent', promptId: 'middle',
      session: { status: 'running', title: 'Original title', queuedPrompts: [originalQueue[0], originalQueue[2]] },
    })
    expect(sdk.send).toHaveBeenCalledExactlyOnceWith({ prompt: content, mode: 'immediate' })
    expect(sdk.sendAndWait).not.toHaveBeenCalled()
    expect(store.get('session')?.messages).toMatchObject([
      { role: 'user', content }, { role: 'assistant', streaming: true, content: '' },
    ])
    expect(store.get('session')?.failedPrompt).toBeUndefined()
  })

  it.each([
    ['/aa   on', '  on'], ['/yolo   on', '  on'], ['/ALLOW-ALL   on', '  on'],
  ])('canonicalizes the targeted command %s without flattening its arguments', async (content, argument) => {
    const { service, sdk, store } = await copilotFixture()
    await store.update('session', (session) => { session.queuedPrompts = [originalQueue[1]] })
    expect(await service.dispatchQueuedPrompt('session', 'middle', content)).toMatchObject({ outcome: 'sent' })
    expect(sdk.rpc.commands.invoke).toHaveBeenCalledExactlyOnceWith({ name: 'allow-all', input: argument })
    expect(sdk.send).not.toHaveBeenCalled()
    expect(sdk.sendAndWait).not.toHaveBeenCalled()
    expect(store.get('session')?.messages.map((message) => message.role)).toEqual(['notice'])
  })

  it.each(['/clear', '/wipe', '/statusline', '/not-a-command', '/skill', '/skills', '/MCP', '/mcp enable private'])(
    'rejects an app-only or unknown targeted command %s without a claim or provider side effect',
    async (content) => {
      const { service, sdk, store, terminal } = await copilotFixture()
      await expect(service.dispatchQueuedPrompt('session', 'middle', content))
        .rejects.toMatchObject({ statusCode: 409 })
      expect(store.get('session')?.queuedPrompts).toEqual(originalQueue)
      expect(store.get('session')?.queuedDispatch).toBeUndefined()
      expect(sdk.rpc.commands.invoke).not.toHaveBeenCalled()
      expect(terminal.send).not.toHaveBeenCalled()
      expect(sdk.send).not.toHaveBeenCalled()
    },
  )

  it.each(['copilot', 'claude'] as const)(
    'keeps a slash-leading background %s prompt plain and whitespace-exact',
    async (provider) => {
      const fixture = provider === 'copilot' ? await copilotFixture() : await claudeFixture()
      const { service, store } = fixture
      const content = '  /this is plain text\n'
      await store.update('session', (session) => {
        session.queuedPrompts = [{ ...originalQueue[0], content, command: false }]
      })
      if (service instanceof AgentService) {
        await (service as unknown as { drainSdkQueue(id: string): Promise<unknown> }).drainSdkQueue('session')
        expect((fixture as Awaited<ReturnType<typeof copilotFixture>>).sdk.send)
          .toHaveBeenCalledExactlyOnceWith({ prompt: content, mode: 'immediate' })
      } else {
        await (service as unknown as { drainQueue(id: string): Promise<unknown> }).drainQueue('session')
        expect((fixture as Awaited<ReturnType<typeof claudeFixture>>).promptCalls()[0][0].prompt).toBe(content)
      }
      expect(store.get('session')?.messages[0].content).toBe(content)
      expect(store.get('session')?.queuedDispatch).toBeUndefined()
    },
  )

  it.each(['unsupported', 'invalid request'] as const)(
    'restores the original with no orphan turn after SDK %s',
    async (failure) => {
      const { service, sdk, store } = await copilotFixture()
      if (failure === 'unsupported') {
        ;(sdk as unknown as { send?: unknown }).send = undefined
      } else {
        sdk.send.mockRejectedValueOnce(Object.assign(new Error('Invalid prompt'), { code: -32602 }))
      }
      expect(await service.dispatchQueuedPrompt('session', 'middle', 'rewritten'))
        .toMatchObject({ outcome: 'refused', restored: true })
      expect(store.get('session')).toMatchObject({
        messages: [], title: 'Original title', status: 'idle', updatedAt: timestamp,
        queuedPrompts: originalQueue,
      })
      expect(store.get('session')?.queuedDispatch).toBeUndefined()
      expect(store.get('session')?.failedPrompt).toBeUndefined()
    },
  )

  it('keeps a lost SDK receipt uncertain and allows only queue additions, not automatic dispatch', async () => {
    const { service, sdk, store } = await copilotFixture()
    sdk.send.mockRejectedValueOnce(new Error('Connection reset after submission'))
    const result = await service.dispatchQueuedPrompt('session', 'middle', 'rewritten')
    expect(result).toMatchObject({ outcome: 'uncertain', delivery: 'unknown' })
    await expect(service.sendMessage('session', 'immediate')).rejects.toMatchObject({ statusCode: 409 })
    await expect(service.executeCommand('session', '/plan')).rejects.toMatchObject({ statusCode: 409 })
    const queued = await service.sendMessage('session', 'later work', true)
    expect(queued.queuedPrompts?.map((entry) => entry.content)).toEqual([
      ...originalQueue.map((entry) => entry.content), 'later work',
    ])
    expect(queued.failedPrompt).toBeUndefined()
    expect(sdk.send).toHaveBeenCalledTimes(1)
    expect(store.get('session')?.queuedPrompts?.map((entry) => entry.id)).not.toContain('middle')
  })

  it('does not call an accepted command refused when its generated prompt cannot be prepared', async () => {
    const { service, sdk, store } = await copilotFixture()
    sdk.rpc.commands.invoke.mockImplementationOnce(async () => {
      vi.spyOn(store, 'update').mockRejectedValueOnce(new Error('Prompt preparation failed'))
      return { kind: 'agent-prompt', prompt: 'Generated prompt', displayPrompt: '/plan' }
    })
    const result = await service.dispatchQueuedPrompt('session', 'middle', '/plan')
    expect(result).toMatchObject({ outcome: 'uncertain', delivery: 'accepted' })
    expect(sdk.rpc.commands.invoke).toHaveBeenCalledTimes(1)
    expect(sdk.send).not.toHaveBeenCalled()
    expect(store.get('session')?.failedPrompt).toMatchObject({ content: '/plan', uncertain: true })
    expect(store.get('session')?.messages.map((message) => message.role)).toEqual(['notice'])
  })

  it.each(['accepted', 'refused', 'lost receipt'] as const)(
    'uses the explicit SDK command enqueue receipt (%s)', async (outcome) => {
      const { service, sdk, store } = await copilotFixture()
      if (outcome === 'refused') sdk.rpc.commands.enqueue.mockResolvedValueOnce({ queued: false })
      if (outcome === 'lost receipt') sdk.rpc.commands.enqueue.mockRejectedValueOnce(new Error('Lost command receipt'))
      const claims = new QueuedDispatches(store, () => {})
      const result = await claims.run(
        'session', { promptId: 'middle', content: '/plan' }, async (text) => text,
        (prompt, delivery) => (service as unknown as {
          runCommand(id: string, content: string, enqueue: boolean, answers: undefined, fromQueue: boolean, delivery: QueuedDelivery): Promise<unknown>
        }).runCommand('session', prompt.content, true, undefined, true, delivery),
        () => {},
      )
      expect(result).toMatchObject(outcome === 'accepted'
        ? { outcome: 'sent' }
        : outcome === 'refused'
          ? { outcome: 'refused', restored: true }
          : { outcome: 'uncertain', delivery: 'unknown' })
      expect(sdk.rpc.commands.enqueue).toHaveBeenCalledExactlyOnceWith({ command: '/plan' })
      expect(sdk.rpc.commands.invoke).not.toHaveBeenCalled()
      expect(sdk.send).not.toHaveBeenCalled()
    },
  )

  it.each([false, true])('classifies terminal errors conservatively (definite refusal: %s)', async (definite) => {
    const { service, store, terminal } = await copilotFixture(true)
    terminal.send.mockRejectedValueOnce(Object.assign(new Error('Terminal transport failed'),
      definite ? { statusCode: 409 } : {}))
    const result = await service.dispatchQueuedPrompt('session', 'middle', '  terminal rewrite\n')
    expect(result).toMatchObject(definite
      ? { outcome: 'refused', restored: true }
      : { outcome: 'uncertain', delivery: 'unknown' })
    expect(terminal.send).toHaveBeenCalledTimes(1)
    expect(store.get('session')?.messages).toEqual([])
    expect(Boolean(store.get('session')?.queuedDispatch)).toBe(!definite)
  })

  it('treats accepted terminal delivery followed by a state-write failure as uncertain, never refused', async () => {
    const { service, store, terminal } = await copilotFixture(true)
    vi.spyOn(store, 'markTerminalPromptDispatched').mockRejectedValueOnce(new Error('Outcome write failed'))
    expect(await service.dispatchQueuedPrompt('session', 'middle', 'terminal rewrite'))
      .toMatchObject({ outcome: 'uncertain', delivery: 'accepted' })
    expect(terminal.send).toHaveBeenCalledTimes(1)
    expect(store.get('session')?.failedPrompt?.uncertain).toBe(true)
  })

  it('rechecks terminal availability after capture before crossing the acceptance boundary', async () => {
    const { service, store, terminal } = await copilotFixture(true)
    terminal.capture.mockImplementationOnce(async () => {
      await store.setSuspended('session', true)
      return undefined
    })
    expect(await service.dispatchQueuedPrompt('session', 'middle', 'rewritten'))
      .toMatchObject({ outcome: 'refused', restored: true })
    expect(terminal.send).not.toHaveBeenCalled()
    expect(store.get('session')?.queuedPrompts).toEqual(originalQueue)
    expect(store.get('session')?.suspended).toBe(true)
  })

  it('does not let late hydration replace a queued turn or its placeholders', async () => {
    const { service, sdk, store } = await copilotFixture()
    const began = pause()
    const finish = pause()
    sdk.getEvents.mockImplementationOnce(async () => {
      began.resolve()
      await finish.promise
      return []
    })
    const opening = service.openSession('session')
    await began.promise
    expect(await service.dispatchQueuedPrompt('session', 'middle', 'exact rewritten prompt'))
      .toMatchObject({ outcome: 'sent' })
    const prepared = store.get('session')!.messages
    finish.resolve()
    const opened = await opening
    expect(opened.messages).toEqual(prepared)
    expect(store.get('session')?.messages).toEqual(prepared)
    expect(sdk.send).toHaveBeenCalledTimes(1)
  })

  it('blocks clear, restart, suspension, migration and a second dispatch during queued preflight', async () => {
    const { service, sdk, client, store } = await copilotFixture()
    const began = pause()
    const release = pause()
    client.resumeSession.mockImplementationOnce(async () => {
      began.resolve()
      await release.promise
      throw new Error('Load refused')
    })
    const result = service.dispatchQueuedPrompt('session', 'middle', 'rewrite')
    await began.promise
    for (const action of [
      () => service.clearConversation('session'),
      () => service.restartSession('session'),
      () => service.suspendSession('session'),
      () => service.moveToTerminal('session'),
      () => service.dispatchQueuedPrompt('session', 'middle', 'second attempt'),
    ]) await expect(action()).rejects.toThrow()
    expect(client.resumeSession).toHaveBeenCalledTimes(1)
    expect(client.deleteSession).not.toHaveBeenCalled()
    release.resolve()
    expect(await result).toMatchObject({ outcome: 'refused', restored: true })
    expect(sdk.send).not.toHaveBeenCalled()
    expect(store.get('session')?.queuedPrompts).toEqual(originalQueue)
  })

  it('does not invoke the SDK after a definitive preflight timeout returns', async () => {
    const { service, sdk, client, store } = await copilotFixture()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const began = pause()
    const release = pause()
    const ended = pause()
    client.resumeSession.mockImplementationOnce(async () => {
      began.resolve()
      await release.promise
      ended.resolve()
      return sdk
    })
    const result = service.dispatchQueuedPrompt('session', 'middle', 'rewrite')
    await began.promise
    await vi.advanceTimersByTimeAsync(20_001)
    expect(await result).toMatchObject({ outcome: 'refused', restored: true })
    release.resolve()
    await ended.promise
    await Promise.resolve()
    expect(sdk.send).not.toHaveBeenCalled()
    expect(store.get('session')?.queuedPrompts).toEqual(originalQueue)
  })

  it('bounds backend detection before claiming and never sends after its preflight timeout', async () => {
    const { service, sdk, store, terminal } = await copilotFixture()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const began = pause()
    const release = pause()
    terminal.has.mockImplementationOnce(async () => {
      began.resolve()
      await release.promise
      return true
    })
    const result = service.dispatchQueuedPrompt('session', 'middle', 'rewrite')
    const refused = expect(result).rejects.toMatchObject({ statusCode: 409 })
    await began.promise
    await vi.advanceTimersByTimeAsync(20_001)
    await refused
    release.resolve()
    await Promise.resolve()
    expect(sdk.send).not.toHaveBeenCalled()
    expect(terminal.send).not.toHaveBeenCalled()
    expect(store.get('session')?.queuedDispatch).toBeUndefined()
  })

  it.each(['stop', 'delete'] as const)('settles pending SDK admission on %s without a late reattachment', async (action) => {
    const { service, sdk, client, store } = await copilotFixture()
    const began = pause()
    const receipt = gate<string>()
    sdk.send.mockImplementationOnce(() => { began.resolve(); return receipt.promise })
    const result = service.dispatchQueuedPrompt('session', 'middle', 'rewrite')
    await began.promise
    await (action === 'stop' ? service.stop() : service.deleteSession('session'))
    expect(await result).toMatchObject({ outcome: 'uncertain' })
    receipt.resolve('too late')
    await Promise.resolve()
    expect(sdk.send).toHaveBeenCalledTimes(1)
    expect(sdk.disconnect).toHaveBeenCalledTimes(action === 'stop' ? 1 : 0)
    expect(client.deleteSession).toHaveBeenCalledTimes(action === 'delete' ? 1 : 0)
    expect(action === 'stop' ? Boolean(store.get('session')?.queuedDispatch) : !store.get('session')).toBe(true)
  })

  it.each(['assistant', 'stream_event', 'user', 'result'] as const)(
    'accepts Claude %s evidence before the generator completes', async (type) => {
      const { service, store, promptCalls } = await claudeFixture(async function* (options) {
        yield claudeMessage(type)
        await aborted(options)
      })
      expect(await service.dispatchQueuedPrompt('session', 'middle', '  rewritten Claude prompt\n'))
        .toMatchObject({ outcome: 'sent', promptId: 'middle' })
      expect(promptCalls()).toHaveLength(1)
      expect(promptCalls()[0][0].prompt).toBe('  rewritten Claude prompt\n')
      expect(store.get('session')?.messages[0].content).toBe('  rewritten Claude prompt\n')
      expect(store.get('session')?.queuedPrompts).toEqual([originalQueue[0], originalQueue[2]])
    },
  )

  it('uses actual Claude tool activity as acceptance and keeps its permission actionable', async () => {
    const { service, store } = await claudeFixture(async function* (options) {
      await options.canUseTool?.('Bash', { command: 'pwd' }, {
        signal: options.abortController!.signal, toolUseID: 'tool', requestId: 'tool-request',
      })
      yield claudeMessage('result')
    })
    expect(await service.dispatchQueuedPrompt('session', 'middle', 'request a tool'))
      .toMatchObject({ outcome: 'sent' })
    await vi.waitFor(() => expect(service.getSession('session')?.pendingPermission).toBeDefined())
    expect(store.get('session')?.status).toBe('waiting')
    expect(store.get('session')?.queuedDispatch).toBeUndefined()
  })

  it.each(['init only', 'bare completion', 'creation throws', 'iterator error'] as const)(
    'does not claim Claude acceptance from %s', async (evidence) => {
      const { service, query, store, promptCalls } = await claudeFixture(async function* () {
        if (evidence === 'init only') yield claudeMessage('system')
        if (evidence === 'iterator error') throw new Error('Iterator connection failed')
      })
      if (evidence === 'creation throws') {
        query.mockImplementationOnce(() => { throw new Error('Query creation failed') })
      }
      expect(await service.dispatchQueuedPrompt('session', 'middle', 'rewrite'))
        .toMatchObject({ outcome: 'uncertain', delivery: 'unknown' })
      expect(promptCalls()).toHaveLength(1)
      expect(store.get('session')?.queuedPrompts).toEqual([originalQueue[0], originalQueue[2]])
      expect(store.get('session')?.failedPrompt).toMatchObject({ content: 'rewrite', uncertain: true })
    },
  )

  it('preserves Claude startup ownership after a receipt timeout and stops before late query creation', async () => {
    const { service, sdk, store, promptCalls } = await claudeFixture()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const began = pause()
    const release = pause()
    sdk.getSessionInfo.mockImplementationOnce(async () => {
      began.resolve()
      await release.promise
      return undefined
    })
    const result = service.dispatchQueuedPrompt('session', 'middle', 'rewrite')
    await began.promise
    await vi.advanceTimersByTimeAsync(10_001)
    expect(await result).toMatchObject({ outcome: 'refused', restored: true })
    const close = vi.spyOn(store, 'close')
    const stopping = service.stop()
    await Promise.resolve()
    expect(close).not.toHaveBeenCalled()
    release.resolve()
    await stopping
    expect(close).toHaveBeenCalledTimes(1)
    expect(promptCalls()).toHaveLength(0)
    expect(store.get('session')?.messages).toEqual([])
    expect(store.get('session')?.queuedPrompts).toEqual(originalQueue)
  })

  it('restores a queued Claude rewrite after authentication fails before invocation', async () => {
    const { service, auth, store, promptCalls } = await claudeFixture()
    auth.mockResolvedValueOnce({ loggedIn: false })
    expect(await service.dispatchQueuedPrompt('session', 'middle', 'rewrite'))
      .toMatchObject({ outcome: 'refused', restored: true })
    expect(promptCalls()).toHaveLength(0)
    expect(store.get('session')?.messages).toEqual([])
    expect(store.get('session')?.queuedPrompts).toEqual(originalQueue)
  })

  it.each(['copilot', 'claude'] as const)('projects recovery on all %s public snapshots', async (provider) => {
    const { service, store } = provider === 'copilot' ? await copilotFixture() : await claudeFixture()
    await unknownClaim(store)
    const snapshots = [
      service.getSession('session'), ...service.listSessions(), ...service.listHistory(),
      await service.openSession('session'), await service.activateSession('session'),
      await service.renameSession('session', 'New title'),
      await service.sendMessage('session', 'queued later', true),
    ]
    for (const snapshot of snapshots) {
      expect(snapshot?.failedPrompt).toBeUndefined()
      expect(snapshot?.queuedDispatch?.state).toBe('uncertain')
      expect(snapshot?.queuedPrompts?.map((entry) => entry.id)).toContain('middle')
    }
    await store.update('session', (session) => {
      session.pendingPermission = {
        requestId: 'permission', title: 'Allow tool',
        options: [{ optionId: 'allow-once', name: 'Allow', kind: 'allow_once' }],
      }
      session.status = 'waiting'
    })
    ;(service as unknown as { permissions: Map<string, unknown> }).permissions.set('permission', {
      sessionId: 'session', resolve: vi.fn(), input: {},
    })
    const replied = await service.replyPermission('session', 'permission', 'allow-once')
    expect(replied.failedPrompt).toBeUndefined()
    expect(replied.queuedPrompts?.map((entry) => entry.id)).toContain('middle')
    expect(store.get('session')?.failedPrompt?.uncertain).toBe(true)
    await store.update('session', (session) => {
      session.pendingUserInput = {
        requestId: 'input', question: 'Choose', choices: ['One'], allowFreeform: false,
      }
      session.status = 'waiting'
    })
    ;(service as unknown as { userInputs: Map<string, unknown> }).userInputs.set('input', {
      sessionId: 'session', resolve: vi.fn(), input: {}, requestId: 'input',
      questions: [{ question: 'Choose', options: ['One'], multiSelect: false }], index: 0, answers: {},
    })
    const answered = await service.replyUserInput('session', 'input', { answer: 'One', wasFreeform: false })
    expect(answered.failedPrompt).toBeUndefined()
    expect(answered.queuedPrompts?.map((entry) => entry.id)).toContain('middle')
    expect(store.get('session')?.failedPrompt?.uncertain).toBe(true)
  })

  it.each(['copilot', 'claude'] as const)('blocks %s edits/removal/lifecycle while uncertainty is unresolved', async (provider) => {
    const { service, store } = provider === 'copilot' ? await copilotFixture() : await claudeFixture()
    await unknownClaim(store)
    const before = service.getSession('session')
    for (const action of [
      () => service.updateQueuedPrompt('session', 'middle', 'new edit'),
      () => service.removeQueuedPrompt('session', 'middle'),
      () => service.reorderQueuedPrompts('session', ['last', 'middle', 'first']),
      () => service.clearConversation('session'),
      () => service.restartSession('session'),
      () => service.suspendSession('session'),
    ]) await expect(action()).rejects.toThrow()
    expect(service.getSession('session')?.queuedPrompts).toEqual(before?.queuedPrompts)
    expect(service.getSession('session')?.queuedDispatch?.attemptId).toBe(before?.queuedDispatch?.attemptId)
  })

  it.each(['copilot', 'claude'] as const)('admits targeted %s dispatch only for open, idle, unsuspended sessions', async (provider) => {
    const { service, store } = provider === 'copilot' ? await copilotFixture() : await claudeFixture()
    for (const change of [
      { isOpen: false }, { status: 'running' }, { status: 'waiting' },
      { status: 'error' }, { suspended: true },
      { pendingUserInput: { requestId: 'waiting', question: 'Question', choices: [], allowFreeform: true } },
    ] as Partial<SessionDetail>[]) {
      await store.update('session', (session) => Object.assign(session, {
        isOpen: true, status: 'idle', suspended: false, pendingUserInput: undefined,
      }, change))
      await expect(service.dispatchQueuedPrompt('session', 'middle', 'rewrite'))
        .rejects.toMatchObject({ statusCode: 409 })
      expect(store.get('session')?.queuedDispatch).toBeUndefined()
      expect(store.get('session')?.messages).toEqual([])
    }
  })

  it.each(['copilot', 'claude'] as const)('suppresses automatic %s queue retries across restart', async (provider) => {
    const fixture = provider === 'copilot' ? await copilotFixture() : await claudeFixture()
    const { directory, service, store } = fixture
    await unknownClaim(store)
    const onDisk = JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions.session
    expect(onDisk.queuedPrompts.map((prompt: { id: string }) => prompt.id)).not.toContain('middle')
    expect(onDisk.failedPrompt).toMatchObject({ content: 'unconfirmed rewrite', uncertain: true })
    await service.start()
    expect(service.getSession('session')?.queuedDispatch?.state).toBe('uncertain')
    expect(service.getSession('session')?.queuedPrompts).toEqual(originalQueue)
    if (provider === 'copilot') {
      expect((fixture as Awaited<ReturnType<typeof copilotFixture>>).sdk.send).not.toHaveBeenCalled()
    } else {
      expect((fixture as Awaited<ReturnType<typeof claudeFixture>>).promptCalls()).toHaveLength(0)
    }
  })
})
