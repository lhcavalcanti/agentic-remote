import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Query } from '@anthropic-ai/claude-agent-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { SessionStore } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile) }
})

const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const id = 'lifecycle-session'
const fixtures: Array<{ directory: string; service: AgentService | ClaudeAgentService; finish: () => void }> = []
const releases: Array<() => void> = []

function deferred() {
  let resolve = () => {}
  let reject: (error: unknown) => void = () => {}
  const promise = new Promise<void>((finish, fail) => { resolve = finish; reject = fail })
  releases.push(resolve)
  return { promise, resolve, reject }
}

async function nextTick() {
  await new Promise<void>((resolve) => setImmediate(resolve))
}

function holdAdmissionWrite() {
  const gate = deferred()
  const began = deferred()
  let held = false
  vi.mocked(writeFile).mockImplementation(async (...args) => {
    const state = JSON.parse(String(args[1]))
    if (!held && state.sessions[id]?.messages.some((message: { role: string }) => message.role === 'user')) {
      held = true
      began.resolve()
      await gate.promise
    }
    return disk.writeFile(...args)
  })
  return { started: began.promise, finish: gate.resolve }
}

async function fixture(provider: 'copilot' | 'claude') {
  const directory = path.resolve('graphify/.cache', `admission-lifecycle-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  const store = new SessionStore(directory)
  await store.initialize()
  await store.create({
    id, provider, cwd: directory, title: 'Lifecycle fixture', isOpen: true, status: 'idle',
    updatedAt: '2026-09-06T00:00:00.000Z', messages: [], runtime: { allowAllPermissions: false },
  }, { backend: 'sdk', managedOpen: true })
  const calls: Array<{ content: string; stopped: boolean }> = []
  const turns = new Map<string, ReturnType<typeof deferred>>()
  let finishAll = false
  let load: ReturnType<typeof deferred> | undefined
  const loading = deferred()
  let service: AgentService | ClaudeAgentService
  const isStopped = () => service instanceof AgentService ? service['stopped'] : service['stopped']
  const complete = (content: string) => turns.get(content)?.resolve()
  const finishing = () => {
    finishAll = true
    for (const turn of turns.values()) turn.resolve()
  }
  const waitForTurn = async (content: string) => {
    calls.push({ content, stopped: isStopped() })
    const turn = deferred()
    turns.set(content, turn)
    if (finishAll || isStopped()) turn.resolve()
    await turn.promise
  }
  const sdkSession: CopilotSessionLike = {
    sessionId: id,
    sendAndWait: vi.fn(async (content) => { await waitForTurn(content); return undefined }),
    on: () => () => {},
    getEvents: async () => [],
    abort: vi.fn(async () => { finishing() }),
    disconnect: vi.fn(async () => { finishing() }),
    rpc: {
      commands: { list: async () => ({ commands: [] }), invoke: vi.fn(), enqueue: vi.fn() },
      model: {
        getCurrent: async () => ({ modelId: 'fixture' }),
        switchTo: async () => ({ modelId: 'fixture' }),
      },
      name: { set: async () => {} },
      mode: { set: async () => {} },
    },
  }
  const client: CopilotClientLike = {
    start: async () => {},
    stop: vi.fn(async () => { finishing(); return [] }),
    createSession: vi.fn(async () => sdkSession),
    resumeSession: vi.fn(async () => {
      loading.resolve()
      if (load) await load.promise
      return sdkSession
    }),
    listSessions: async () => [],
    deleteSession: async () => {},
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
    },
  }
  const sdk: ClaudeSdk = {
    query: vi.fn(({ prompt, options }) => {
      const iterator = (async function* () {
        if (typeof prompt === 'string') {
          options?.abortController?.signal.addEventListener('abort', () => complete(prompt), { once: true })
          await waitForTurn(prompt)
        }
        yield* []
      })()
      return Object.assign(iterator, { supportedModels: async () => [] }) as unknown as Query
    }),
    getSessionInfo: vi.fn(async () => undefined),
    deleteSession: vi.fn(async () => {}),
    renameSession: vi.fn(async () => {}),
  }
  const authenticate = vi.fn(async () => {
    loading.resolve()
    if (load) await load.promise
    return { loggedIn: true }
  })
  service = provider === 'copilot'
    ? new AgentService(
        store, client, async () => [], async () => {}, async () => [], async () => undefined,
        { has: async () => false, send: async () => false, cancel: async () => false },
        async () => undefined, async () => undefined,
      )
    : new ClaudeAgentService(store, '/bin/true', sdk, authenticate)
  if (service instanceof ClaudeAgentService) service['available'] = true
  const drain = () => service instanceof AgentService
    ? service['drainSdkQueue'](id)
    : service['drainQueue'](id)
  const active = () => service instanceof AgentService
    ? service['activePrompts'].has(id)
    : service['active'].has(id) || service['startingQueries'].has(id)
  fixtures.push({ directory, service, finish: finishing })
  return {
    directory, store, service, client, sdk, sdkSession, authenticate, calls, drain, active, complete,
    holdLoad: () => {
      load = deferred()
      return { started: loading.promise, finish: load.resolve, fail: load.reject }
    },
    clearLoad: () => { load = undefined },
    persisted: async () => JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions[id],
  }
}

async function enqueue(store: SessionStore, content: string) {
  return store.enqueuePrompt(id, { id: content, content, createdAt: '2026-09-06T00:00:00.000Z' })
}

async function question(service: AgentService | ClaudeAgentService) {
  const response = service instanceof AgentService
    ? service['requestUserInput'](id, { question: 'Continue?', choices: ['Yes', 'No'], allowFreeform: false })
    : service['canUseTool'](id, 'AskUserQuestion', {
        questions: [{ question: 'Continue?', options: [{ label: 'Yes' }, { label: 'No' }] }],
      })
  await service.store.readAfterWrites(id)
  const requestId = service.store.get(id)!.pendingUserInput!.requestId
  const pending = service instanceof AgentService
    ? service['userInputs'].get(requestId)!
    : service['userInputs'].get(requestId)!
  const resolve = vi.spyOn(pending, 'resolve')
  return {
    response, requestId, resolve,
    reply: (answer = 'Yes') => service.replyUserInput(id, requestId, { answer, wasFreeform: false }),
  }
}

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
})

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  vi.mocked(writeFile).mockImplementation(disk.writeFile)
  for (const entry of fixtures.splice(0)) {
    entry.finish()
    await Promise.allSettled([entry.service.stop()])
    await nextTick()
    await Promise.allSettled([entry.service.store.flush()])
    await nextTick()
    await Promise.allSettled([entry.service.store.flush()])
    await rm(entry.directory, { recursive: true, force: true })
  }
  vi.restoreAllMocks()
})

describe('Session admission and queue lifecycle', () => {
  for (const provider of ['copilot', 'claude'] as const) {
    it.each(['direct', 'queued'] as const)(
      `${provider} does not dispatch a %s admission whose commit overlaps shutdown`,
      async (mode) => {
        const runtime = await fixture(provider)
        if (mode === 'queued') {
          await enqueue(runtime.store, 'first')
          await enqueue(runtime.store, 'second')
        }
        const gate = holdAdmissionWrite()
        const sending = (mode === 'queued'
          ? runtime.drain()
          : runtime.service.sendMessage(id, 'first')).catch((error: unknown) => error)
        await gate.started
        const stopping = runtime.service.stop().catch((error: unknown) => error)
        await nextTick()
        if (provider === 'copilot') expect(runtime.client.stop).not.toHaveBeenCalled()
        gate.finish()
        const [, stopped] = await Promise.all([sending, stopping])
        expect(stopped).toBeUndefined()
        await nextTick()
        expect(runtime.calls).toEqual([])
        const stored = await runtime.persisted()
        expect(JSON.stringify(stored)).toContain('first')
        if (mode === 'queued') {
          expect(stored.queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual(['first', 'second'])
        }
        const writes = vi.mocked(writeFile).mock.calls.length
        await nextTick()
        expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
        await expect(runtime.service.sendMessage(id, 'late')).rejects.toThrow(/stopp|available/i)
      },
    )

    it.each(['remove', 'edit'] as const)(
      `${provider} drains the canonical head after a reserved head is changed by %s during load`,
      async (change) => {
        const runtime = await fixture(provider)
        await enqueue(runtime.store, 'first')
        await enqueue(runtime.store, 'second')
        const load = runtime.holdLoad()
        const draining = runtime.drain().catch((error: unknown) => error)
        await load.started
        if (change === 'remove') await runtime.service.removeQueuedPrompt(id, 'first')
        else await runtime.store.update(id, (session) => { session.queuedPrompts![0].content = 'edited' })
        load.finish()
        await draining
        await vi.waitFor(() => expect(runtime.calls.map((call) => call.content)).toEqual([
          change === 'remove' ? 'second' : 'edited',
        ]), { timeout: 500 })
        expect(runtime.calls.every((call) => !call.stopped)).toBe(true)
        runtime.complete(change === 'remove' ? 'second' : 'edited')
      },
    )

    it.each(['direct', 'queued'] as const)(
      `${provider} waits for a %s provider load before teardown without dispatching`,
      async (mode) => {
        const runtime = await fixture(provider)
        if (mode === 'queued') {
          await enqueue(runtime.store, 'first')
          await enqueue(runtime.store, 'second')
        }
        const load = runtime.holdLoad()
        const sending = (mode === 'queued' ? runtime.drain() : runtime.service.sendMessage(id, 'first'))
          .catch((error: unknown) => error)
        await load.started
        let finished = false
        const firstStop = runtime.service.stop()
        expect(runtime.service.stop()).toBe(firstStop)
        const stopping = firstStop.then(() => { finished = true })
        await nextTick()
        expect(finished).toBe(false)
        if (provider === 'copilot') expect(runtime.client.stop).not.toHaveBeenCalled()
        load.finish()
        await Promise.all([sending, stopping])
        expect(runtime.calls).toEqual([])
        if (mode === 'queued') expect((await runtime.persisted()).queuedCount).toBe(2)
        if (provider === 'copilot') {
          expect(runtime.sdkSession.disconnect).toHaveBeenCalledTimes(1)
          expect(runtime.client.stop).toHaveBeenCalledTimes(1)
        }
      },
    )

    it(`${provider} retains durable recovery when a stopped committed queue admission cannot be restored`, async () => {
      const runtime = await fixture(provider)
      await enqueue(runtime.store, 'first')
      await enqueue(runtime.store, 'second')
      const gate = holdAdmissionWrite()
      const draining = runtime.drain().catch((error: unknown) => error)
      await gate.started
      const stopping = runtime.service.stop()
      const refusedStop = expect(stopping).rejects.toThrow(/recovery refused|cleanup/i)
      vi.mocked(writeFile).mockRejectedValue(new Error('recovery refused'))
      gate.finish()
      await Promise.all([draining, refusedStop])
      expect(runtime.calls).toEqual([])
      const diskState = await runtime.persisted()
      expect(diskState.sdkQueueAdmission.prompt.content).toBe('first')
      expect(diskState.failedPrompt).toMatchObject({ content: 'first', uncertain: true })
      expect(runtime.store.get(id)).not.toHaveProperty('sdkQueueAdmission')
      vi.mocked(writeFile).mockImplementation(disk.writeFile)
      const restarted = new SessionStore(runtime.directory)
      await restarted.initialize()
      expect(restarted.get(id)?.failedPrompt).toMatchObject({ content: 'first', uncertain: true })
      expect(restarted.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['second'])
    })

    it.each(['authentication', 'storage'] as const)(
      `${provider} does not hot-loop %s failures after the canonical head changes`,
      async (failure) => {
        const runtime = await fixture(provider)
        await enqueue(runtime.store, 'first')
        await enqueue(runtime.store, 'second')
        const load = runtime.holdLoad()
        const draining = runtime.drain().catch((error: unknown) => error)
        await load.started
        await runtime.service.removeQueuedPrompt(id, 'first')
        if (failure === 'authentication') load.fail(new Error('Authentication unavailable'))
        else {
          vi.mocked(writeFile).mockRejectedValue(new Error('Storage unavailable'))
          load.finish()
        }
        await draining
        await nextTick()
        await new Promise((resolve) => setTimeout(resolve, 30))
        const loads = provider === 'copilot'
          ? vi.mocked(runtime.client.resumeSession).mock.calls.length
          : runtime.authenticate.mock.calls.length
        const writes = vi.mocked(writeFile).mock.calls.length
        await new Promise((resolve) => setTimeout(resolve, 40))
        expect(provider === 'copilot'
          ? vi.mocked(runtime.client.resumeSession).mock.calls.length
          : runtime.authenticate.mock.calls.length).toBe(loads)
        expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
        expect(runtime.calls).toEqual([])
        expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['second'])
        vi.mocked(writeFile).mockImplementation(disk.writeFile)
        runtime.clearLoad()
        await runtime.drain()
        await vi.waitFor(() => expect(runtime.calls.map((call) => call.content)).toEqual(['second']))
        runtime.complete('second')
      },
    )

    it.each(['suspend', 'delete', 'newer owner'] as const)(
      `${provider} does not retry a stale reservation across %s`,
      async (transition) => {
        const runtime = await fixture(provider)
        await enqueue(runtime.store, 'first')
        await enqueue(runtime.store, 'second')
        const load = runtime.holdLoad()
        const draining = runtime.drain().catch((error: unknown) => error)
        await load.started
        await runtime.service.removeQueuedPrompt(id, 'first')
        if (transition === 'suspend') await runtime.store.setSuspended(id, true)
        else if (transition === 'delete') {
          const deleting = runtime.service instanceof AgentService
            ? runtime.service['deletingSessions']
            : runtime.service['deletingSessions']
          deleting.add(id)
        }
        else {
          if (runtime.service instanceof AgentService) {
            runtime.service['activePrompts'].set(id, { assistantMessageId: 'newer' })
          } else {
            runtime.service['active'].set(id, {
              abortController: new AbortController(), query: {} as Query,
              resourceOwner: Symbol(),
              resourceReads: runtime.service['resourceReads'],
              done: Promise.resolve(), finish: () => {},
            })
          }
          await runtime.store.updateStatus(id, 'running', 'Newer provider owns this session')
        }
        load.finish()
        await draining
        await nextTick()
        expect(runtime.calls).toEqual([])
        expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['second'])
        if (transition === 'newer owner') {
          expect(runtime.active()).toBe(true)
          expect(runtime.store.get(id)?.activity).toBe('Newer provider owns this session')
        }
      },
    )

    it(`${provider} wakes durable FIFO once after accepted-reply retry clears an ended provider`, async () => {
      const runtime = await fixture(provider)
      await runtime.service.sendMessage(id, 'first')
      await vi.waitFor(() => expect(runtime.calls).toHaveLength(1))
      const pending = await question(runtime.service)
      await runtime.service.sendMessage(id, 'second', true)
      vi.mocked(writeFile).mockRejectedValue(new Error('Persistent storage outage'))
      await expect(pending.reply()).rejects.toThrow('Persistent storage outage')
      runtime.complete('first')
      await vi.waitFor(() => expect(runtime.active()).toBe(false))
      expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['second'])
      expect(runtime.calls).toHaveLength(1)
      vi.mocked(writeFile).mockImplementation(disk.writeFile)
      await expect(pending.reply('No')).rejects.toMatchObject({ statusCode: 409 })
      await Promise.all([pending.reply(), pending.reply()])
      await vi.waitFor(() => expect(runtime.calls.map((call) => call.content)).toEqual(['first', 'second']), { timeout: 500 })
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      expect(runtime.store.get(id)?.pendingUserInput).toBeUndefined()
      runtime.complete('second')
    })

    it.each(['newer question', 'shutdown'] as const)(
      `${provider} respects %s while a successful reply settlement requests a queue wake`,
      async (transition) => {
        const runtime = await fixture(provider)
        await runtime.service.sendMessage(id, 'first')
        await vi.waitFor(() => expect(runtime.calls).toHaveLength(1))
        const pending = await question(runtime.service)
        await runtime.service.sendMessage(id, 'second', true)
        vi.mocked(writeFile).mockRejectedValue(new Error('Outage'))
        await expect(pending.reply()).rejects.toThrow('Outage')
        runtime.complete('first')
        await vi.waitFor(() => expect(runtime.active()).toBe(false))
        vi.mocked(writeFile).mockImplementation(disk.writeFile)
        if (transition === 'newer question') {
          const newer = await question(runtime.service)
          await pending.reply()
          await nextTick()
          expect(runtime.calls).toHaveLength(1)
          expect(runtime.store.get(id)?.pendingUserInput?.requestId).toBe(newer.requestId)
          expect(newer.resolve).not.toHaveBeenCalled()
          await newer.reply()
          await vi.waitFor(() => expect(runtime.calls.map((call) => call.content)).toEqual(['first', 'second']))
          expect(newer.resolve).toHaveBeenCalledTimes(1)
          runtime.complete('second')
        } else {
          const gate = holdAdmissionWrite()
          const settled = pending.reply()
          await gate.started
          const stopping = runtime.service.stop()
          gate.finish()
          await Promise.all([settled, stopping])
          await runtime.drain()
          expect(runtime.calls.map((call) => call.content)).toEqual(['first'])
          expect((await runtime.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content))
            .toEqual(['second'])
        }
        expect(pending.resolve).toHaveBeenCalledTimes(1)
      },
    )

    it(`${provider} settles a refused queued handoff before a reply wakes its next FIFO item`, async () => {
      const runtime = await fixture(provider)
      await enqueue(runtime.store, 'first')
      await enqueue(runtime.store, 'second')
      let refused = false
      vi.mocked(writeFile).mockImplementation(async (...args) => {
        const state = JSON.parse(String(args[1])).sessions[id]
        if (!refused && state?.messages.some((message: { role: string }) => message.role === 'user') &&
            !state.sdkQueueAdmission) {
          refused = true
          throw new Error('handoff confirmation refused')
        }
        return disk.writeFile(...args)
      })
      const drained = await runtime.drain().catch((error: unknown) => error)
      if (provider === 'claude') expect(drained).toEqual(new Error('handoff confirmation refused'))
      else expect(drained).toBeUndefined()
      expect(refused).toBe(true)
      expect(runtime.calls.map((call) => call.content)).toEqual(['first'])
      expect((await runtime.persisted()).sdkQueueAdmission.prompt.content).toBe('first')
      const pending = await question(runtime.service)
      vi.mocked(writeFile).mockRejectedValue(new Error('Persistent outage'))
      await expect(pending.reply()).rejects.toThrow('Persistent outage')
      runtime.complete('first')
      await vi.waitFor(() => expect(runtime.active()).toBe(false))
      await nextTick()
      vi.mocked(writeFile).mockImplementation(disk.writeFile)
      await pending.reply()
      await vi.waitFor(() => expect(runtime.calls.map((call) => call.content)).toEqual(['first', 'second']))
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      runtime.complete('second')
    })
  }

  it.each(['direct', 'queued'] as const)(
    'waits for Claude %s query registration and cancels it after shutdown closes admission',
    async (mode) => {
      const runtime = await fixture('claude')
      if (!(runtime.service instanceof ClaudeAgentService)) throw new Error('Expected Claude')
      if (mode === 'queued') {
        await enqueue(runtime.store, 'first')
        await enqueue(runtime.store, 'second')
      }
      const loading = deferred()
      const loaded = deferred()
      vi.mocked(runtime.sdk.getSessionInfo).mockImplementationOnce(async () => {
        loading.resolve()
        await loaded.promise
        return undefined
      })
      const sending = (mode === 'queued' ? runtime.drain() : runtime.service.sendMessage(id, 'first'))
        .catch((error: unknown) => error)
      await loading.promise
      expect(runtime.service['startingQueries'].has(id)).toBe(true)
      let stopped = false
      const stopping = runtime.service.stop().then(() => { stopped = true })
      await nextTick()
      expect(stopped).toBe(false)
      loaded.resolve()
      await Promise.all([sending, stopping])
      expect(runtime.calls).toEqual([])
      expect(runtime.service['startingQueries'].size).toBe(0)
      if (mode === 'queued') expect((await runtime.persisted()).queuedCount).toBe(2)
      else expect((await runtime.persisted()).failedPrompt.content).toBe('first')
    },
  )

  it('preserves a newer Claude owner and its question when an older query is still loading', async () => {
    const runtime = await fixture('claude')
    if (!(runtime.service instanceof ClaudeAgentService)) throw new Error('Expected Claude')
    await enqueue(runtime.store, 'first')
    await enqueue(runtime.store, 'second')
    const entered = deferred()
    const loaded = deferred()
    vi.mocked(runtime.sdk.getSessionInfo).mockImplementationOnce(async () => {
      entered.resolve()
      await loaded.promise
      return undefined
    })
    const draining = runtime.drain().catch((error: unknown) => error)
    await entered.promise
    const newer = {
      abortController: new AbortController(), query: {} as Query,
      resourceOwner: Symbol(),
      resourceReads: runtime.service['resourceReads'],
      done: Promise.resolve(), finish: () => {},
    }
    runtime.service['active'].set(id, newer)
    const input = await question(runtime.service)
    loaded.resolve()
    await draining
    expect(runtime.calls).toEqual([])
    expect(runtime.service['active'].get(id)).toBe(newer)
    expect(input.resolve).not.toHaveBeenCalled()
    expect(runtime.store.get(id)?.pendingUserInput?.requestId).toBe(input.requestId)
    expect(runtime.store.get(id)?.status).toBe('waiting')
    expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['first', 'second'])
  })

  it('awaits a standalone Copilot load before stopping the SDK and disposes the late handle once', async () => {
    const runtime = await fixture('copilot')
    if (!(runtime.service instanceof AgentService)) throw new Error('Expected Copilot')
    const load = runtime.holdLoad()
    const loading = runtime.service['ensureLoaded'](id)
    const refused = expect(loading).rejects.toThrow('no longer available')
    await load.started
    const stopping = runtime.service.stop()
    await nextTick()
    expect(runtime.client.stop).not.toHaveBeenCalled()
    load.finish()
    await Promise.all([refused, stopping])
    expect(runtime.sdkSession.disconnect).toHaveBeenCalledTimes(1)
    expect(runtime.client.stop).toHaveBeenCalledTimes(1)
    expect(runtime.service['loadingSessions'].size).toBe(0)
    expect(runtime.calls).toEqual([])
  })

  it('does not await a complete Copilot turn before provider teardown and fences late completion writes', async () => {
    const runtime = await fixture('copilot')
    vi.mocked(runtime.sdkSession.disconnect).mockImplementation(async () => {})
    vi.mocked(runtime.client.stop).mockImplementation(async () => [])
    await runtime.service.sendMessage(id, 'first')
    const events = vi.fn()
    runtime.service.on('event', events)
    await runtime.service.stop()
    expect(runtime.client.stop).toHaveBeenCalledTimes(1)
    const writes = vi.mocked(writeFile).mock.calls.length
    runtime.complete('first')
    await nextTick()
    await nextTick()
    expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
    expect(events).not.toHaveBeenCalled()
    expect(runtime.active()).toBe(false)
  })

  it.each([false, true])('refuses late Copilot callbacks after shutdown (allow all: %s)', async (allowAll) => {
    const runtime = await fixture('copilot')
    await runtime.store.update(id, (session) => { session.runtime!.allowAllPermissions = allowAll })
    await runtime.service.sendMessage(id, 'first')
    const config = vi.mocked(runtime.client.resumeSession).mock.calls[0][1]
    await runtime.service.stop()
    const writes = vi.mocked(writeFile).mock.calls.length
    await expect(config.onPermissionRequest!({
      kind: 'shell', fullCommandText: 'echo late', intention: 'Late request',
      commands: [], possiblePaths: [], possibleUrls: [], hasWriteFileRedirection: false,
      canOfferSessionApproval: false,
    }, { sessionId: id })).resolves.toEqual({ kind: 'user-not-available' })
    await expect(config.onUserInputRequest!({
      question: 'Late input', choices: ['Yes'], allowFreeform: false,
    }, { sessionId: id })).resolves.toEqual({ answer: '', wasFreeform: true })
    await expect(config.onElicitationRequest!({
      sessionId: id, mode: 'form', message: 'Late form',
      requestedSchema: { type: 'object', properties: { value: { type: 'string' } } },
    })).resolves.toEqual({ action: 'cancel' })
    await nextTick()
    expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
    expect(runtime.calls).toHaveLength(1)
  })

  it('does not start a Claude metadata query after shutdown during authentication', async () => {
    const runtime = await fixture('claude')
    const load = runtime.holdLoad()
    const starting = runtime.service.start()
    await load.started
    const stopping = runtime.service.stop()
    load.finish()
    await Promise.all([starting, stopping])
    expect(runtime.sdk.query).not.toHaveBeenCalled()
  })

  it('closes storage after admitted writes and checkpoints volatile text without permitting late mutations', async () => {
    const runtime = await fixture('copilot')
    await runtime.service.sendMessage(id, 'first')
    const messageId = runtime.store.get(id)!.messages.at(-1)!.id
    runtime.store.streamMessage(id, messageId, 'Last streamed text')
    await runtime.service.stop()
    expect((await runtime.persisted()).messages.at(-1).content).toBe('Last streamed text')
    const writes = vi.mocked(writeFile).mock.calls.length
    await expect(runtime.store.updateStatus(id, 'running')).rejects.toThrow('store is closed')
    await expect(runtime.store.saveUpload(id, 'late.txt', Buffer.from('late'))).rejects.toThrow('store is closed')
    runtime.store.streamMessage(id, messageId, 'Late text')
    await nextTick()
    expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
    expect(runtime.store.get(id)!.messages.at(-1)!.content).toBe('Last streamed text')
  })

  it('waits for an admitted upload before closing the store', async () => {
    const runtime = await fixture('copilot')
    const entered = deferred()
    const gate = deferred()
    vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
      entered.resolve()
      await gate.promise
      return disk.writeFile(...args)
    })
    const upload = runtime.store.saveUpload(id, 'fixture.txt', Buffer.from('fixture'))
    await entered.promise
    let closed = false
    const closing = runtime.store.close().then(() => { closed = true })
    await nextTick()
    expect(closed).toBe(false)
    gate.resolve()
    const [saved] = await Promise.all([upload, closing])
    expect(await readFile(saved.path, 'utf8')).toBe('fixture')
    await expect(runtime.store.saveUpload(id, 'late.txt', Buffer.from('late'))).rejects.toThrow('store is closed')
  })

  it('keeps queued handoff identity private and rejects stale or destructive settlement', async () => {
    const runtime = await fixture('copilot')
    await enqueue(runtime.store, 'first')
    await enqueue(runtime.store, 'second')
    const { reservation } = await runtime.store.reserveQueuedPrompt(id, () => true)
    const assistantId = randomUUID()
    await runtime.store.beginPrompt(id, 'first', assistantId, () => true, reservation)
    expect(runtime.store.get(id)).not.toHaveProperty('sdkQueueAdmission')
    expect(runtime.store.get(id)?.failedPrompt).toBeUndefined()
    await expect(runtime.store.clearFailedPrompt(id)).rejects.toMatchObject({ statusCode: 409 })
    await expect(runtime.store.setFailedPrompt(id, 'second', 'wrong')).rejects.toMatchObject({ statusCode: 409 })
    await runtime.store.settleSdkQueueAdmission(id, 'wrong-owner', false)
    expect((await runtime.persisted()).sdkQueueAdmission.assistantId).toBe(assistantId)
    await runtime.store.settleSdkQueueAdmission(id, assistantId, false)
    expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['first', 'second'])
    expect(runtime.store.get(id)?.messages).toEqual([])
    expect((await runtime.persisted()).sdkQueueAdmission).toBeUndefined()
  })

  it.each(['shape', 'timestamp', 'prompt'] as const)(
    'rejects malformed queued handoff %s metadata rather than guessing recovery',
    async (malformation) => {
      const runtime = await fixture('copilot')
      await enqueue(runtime.store, 'first')
      const { reservation } = await runtime.store.reserveQueuedPrompt(id, () => true)
      await runtime.store.beginPrompt(id, 'first', randomUUID(), () => true, reservation)
      const file = path.join(runtime.directory, 'state.json')
      const persisted = JSON.parse(await readFile(file, 'utf8'))
      const session = persisted.sessions[id]
      if (malformation === 'shape') session.sdkQueueAdmission = []
      else if (malformation === 'timestamp') session.sdkQueueAdmission.startedAt = 'invalid'
      else session.sdkQueueAdmission.prompt.command = 'invalid'
      await disk.writeFile(file, JSON.stringify(persisted))
      const restarted = new SessionStore(runtime.directory)
      await expect(restarted.initialize()).rejects.toThrow('Invalid SDK queue admission metadata')
    },
  )
})
