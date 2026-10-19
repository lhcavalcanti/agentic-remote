import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Query } from '@anthropic-ai/claude-agent-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { ProviderSessionService } from './provider-session-service.js'
import { SessionStore } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile) }
})
const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const id = 'claude-recovery'
const fixtures: Array<{ directory: string; combined: ProviderSessionService }> = []
const releases: Array<() => void> = []

function deferred() {
  let resolve = () => {}
  let reject: (error: unknown) => void = () => {}
  const promise = new Promise<void>((finish, fail) => { resolve = finish; reject = fail })
  releases.push(resolve)
  return { promise, resolve, reject }
}

async function createStore(directory: string) {
  const store = new SessionStore(directory)
  await store.initialize()
  await store.create({
    id, provider: 'claude', cwd: directory, title: 'Recovery fixture',
    status: 'idle', isOpen: true, messages: [], updatedAt: '2026-09-06T00:00:00.000Z',
  }, { backend: 'sdk', managedOpen: true })
  return store
}

async function enqueue(store: SessionStore, content: string) {
  return store.enqueuePrompt(id, {
    id: content, content, createdAt: '2026-09-06T00:00:00.000Z',
  })
}

async function fixture(recovered: boolean, tail: boolean, reopen = true) {
  const directory = path.resolve('graphify/.cache', `claude-recovery-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  const initial = await createStore(directory)
  await enqueue(initial, 'A')
  if (tail) await enqueue(initial, 'B')
  if (recovered) {
    const { reservation } = await initial.reserveQueuedPrompt(id, () => true)
    await initial.beginPrompt(id, 'A', randomUUID(), () => true, reservation)
  }
  const store = new SessionStore(directory)
  await store.initialize()
  const runtime = await connect(directory, store)
  if (recovered && reopen) await runtime.combined.activateSession(id)
  return runtime
}

async function connect(directory: string, store: SessionStore) {
  const calls: string[] = []
  const sdk: ClaudeSdk = {
    getSessionInfo: vi.fn(async () => undefined),
    query: vi.fn(({ prompt }) => {
      if (typeof prompt === 'string') calls.push(prompt)
      return (async function* () {
        yield { type: 'stream_event', event: { type: 'message_start' } }
      })() as unknown as Query
    }),
    deleteSession: vi.fn(async () => {}),
    renameSession: vi.fn(async () => {}),
  }
  const authenticate = vi.fn(async () => ({ loggedIn: true }))
  const claude = new ClaudeAgentService(store, '/bin/true', sdk, authenticate)
  claude['available'] = true
  const copilotStore = new SessionStore(path.join(directory, 'copilot'))
  await copilotStore.initialize()
  const client: CopilotClientLike = {
    start: async () => {}, stop: async () => [], createSession: vi.fn(), resumeSession: vi.fn(),
    listSessions: async () => [], deleteSession: async () => {},
    rpc: { commands: { list: async () => ({ commands: [] }) }, models: { list: async () => ({ models: [] }) } },
  }
  const combined = new ProviderSessionService(
    new AgentService(copilotStore, client, async () => [], async () => {}),
    claude,
  )
  fixtures.push({ directory, combined })
  return {
    directory, store, claude, combined, sdk, calls, authenticate,
    token: store.get(id)?.failedPrompt?.failedAt,
    persisted: async () => JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions[id],
  }
}

function holdClaimWrite(token: string) {
  const entered = deferred()
  const gate = deferred()
  let held = false
  vi.mocked(writeFile).mockImplementation(async (...args) => {
    const current = JSON.parse(String(args[1])).sessions[id]
    if (!held && current?.lastClaimedRecovery === token && !current.failedPrompt) {
      held = true
      entered.resolve()
      await gate.promise
    }
    return disk.writeFile(...args)
  })
  return { entered: entered.promise, finish: gate.resolve, fail: gate.reject }
}

async function idle(runtime: Awaited<ReturnType<typeof connect>>) {
  await vi.waitFor(() => {
    expect(runtime.claude['active'].size).toBe(0)
    expect(runtime.claude['startingQueries'].size).toBe(0)
    expect(runtime.store.get(id)?.status).toBe('idle')
  })
}

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
})
afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  vi.mocked(writeFile).mockImplementation(disk.writeFile)
  const current = fixtures.splice(0)
  await Promise.allSettled(current.map(({ combined }) => combined.stop()))
  await Promise.all([...new Set(current.map(({ directory }) => directory))]
    .map((directory) => rm(directory, { recursive: true, force: true })))
  vi.restoreAllMocks()
})

describe('Claude recovered draft admission', () => {
  it('requires explicit reopen before claiming an interrupted recovery without consuming its token', async () => {
    const runtime = await fixture(true, true, false)
    const before = await runtime.persisted()
    await expect(runtime.combined.sendMessage(id, 'A', false, runtime.token))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(await runtime.persisted()).toEqual(before)
    expect(runtime.calls).toEqual([])
    await runtime.combined.activateSession(id)
    expect(runtime.calls).toEqual([])
    await runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['B', 'A']))
    await idle(runtime)
    await expect(runtime.combined.sendMessage(id, 'A', false, runtime.token))
      .rejects.toMatchObject({ statusCode: 409 })
  })

  it.each([false, true])('consumes a recovered token once through ProviderSessionService (queued tail: %s)', async (tail) => {
    const { store, claude, combined, calls, token } = await fixture(true, tail)
    expect(token).toBeDefined()
    expect(store.get(id)?.failedPrompt).toMatchObject({ content: 'A', uncertain: true })
    await combined.sendMessage(id, 'A', false, token)
    await vi.waitFor(() => expect(claude['active'].size).toBe(0))
    await expect(combined.sendMessage(id, 'A', false, token)).rejects.toMatchObject({ statusCode: 409 })
    await vi.waitFor(() => expect(calls).toEqual(tail ? ['B', 'A'] : ['A']))
    expect(store.get(id)?.failedPrompt).toBeUndefined()
    expect(store.get(id)?.queuedCount).toBe(0)
  })

  it('keeps a refused claim private and retryable without any provider call', async () => {
    const runtime = await fixture(true, false)
    const before = await runtime.persisted()
    const hold = holdClaimWrite(runtime.token!)
    const submitting = runtime.combined.sendMessage(id, 'A', false, runtime.token)
    const refused = expect(submitting).rejects.toThrow('Claim refused')
    await hold.entered
    expect(await runtime.persisted()).toEqual(before)
    expect(runtime.store.get(id)?.failedPrompt?.failedAt).toBe(runtime.token)
    expect(runtime.calls).toEqual([])
    hold.fail(new Error('Claim refused'))
    await refused
    expect(await runtime.persisted()).toEqual(before)
    await runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['A']))
    await idle(runtime)
  })

  it.each([false, true])('serializes concurrent recovered-token claims durably (tail: %s)', async (tail) => {
    const runtime = await fixture(true, tail)
    const hold = holdClaimWrite(runtime.token!)
    const first = runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await hold.entered
    const duplicate = runtime.combined.sendMessage(id, 'A', false, runtime.token)
    const refused = expect(duplicate).rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.calls).toEqual([])
    hold.finish()
    await Promise.all([first, refused])
    await vi.waitFor(() => expect(runtime.calls).toEqual(tail ? ['B', 'A'] : ['A']))
    await idle(runtime)
  })

  it('rejects a consumed token after another complete service/store restart', async () => {
    const first = await fixture(true, false)
    await first.combined.sendMessage(id, 'A', false, first.token)
    await vi.waitFor(() => expect(first.calls).toEqual(['A']))
    await idle(first)
    await first.combined.stop()
    const store = new SessionStore(first.directory)
    await store.initialize()
    const restarted = await connect(first.directory, store)
    await expect(restarted.combined.sendMessage(id, 'A', false, first.token))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(restarted.calls).toEqual([])
    expect(store.get(id)).not.toHaveProperty('lastClaimedRecovery')
  })

  it('does not clear a newer recovery with a stale or copied consumed token', async () => {
    const runtime = await fixture(true, false)
    await expect(runtime.combined.sendMessage(id, 'A', false, 'stale-token')).rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.store.get(id)?.failedPrompt?.failedAt).toBe(runtime.token)
    await runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['A']))
    await idle(runtime)
    const nextToken = new Date(Date.parse(runtime.token!) + 10_000).toISOString()
    await runtime.store.update(id, (session) => {
      session.failedPrompt = { content: 'C', failedAt: nextToken, uncertain: true }
    })
    await expect(runtime.combined.sendMessage(id, 'A', false, runtime.token))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.store.get(id)?.failedPrompt?.content).toBe('C')
    await runtime.combined.sendMessage(id, 'C', false, nextToken)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['A', 'C']))
    await idle(runtime)
    await runtime.store.update(id, (session) => {
      session.failedPrompt = { content: 'C', failedAt: nextToken, uncertain: true }
    })
    await expect(runtime.combined.sendMessage(id, 'C', false, nextToken))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.calls).toEqual(['A', 'C'])
  })

  it('does not clear recovery which arrives after a claim is admitted', async () => {
    const runtime = await fixture(true, false)
    const hold = holdClaimWrite(runtime.token!)
    const claiming = runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await hold.entered
    const nextToken = new Date(Date.parse(runtime.token!) + 10_000).toISOString()
    const newer = runtime.store.update(id, (session) => {
      session.failedPrompt = { content: 'C', failedAt: nextToken, uncertain: true }
    })
    hold.finish()
    await Promise.all([claiming, newer])
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(runtime.store.get(id)?.failedPrompt?.failedAt).toBe(nextToken)
    expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['A'])
    expect(runtime.calls).toEqual([])
    await runtime.combined.sendMessage(id, 'C', false, nextToken)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['A', 'C']))
    await idle(runtime)
  })

  it('retains the claimed retry across shutdown during its commit without dispatching', async () => {
    const runtime = await fixture(true, false)
    const hold = holdClaimWrite(runtime.token!)
    const claiming = runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await hold.entered
    const stopping = runtime.combined.stop()
    hold.finish()
    await Promise.all([claiming, stopping])
    expect(runtime.calls).toEqual([])
    expect((await runtime.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual(['A'])
    const store = new SessionStore(runtime.directory)
    await store.initialize()
    const restarted = await connect(runtime.directory, store)
    await expect(restarted.combined.sendMessage(id, 'A', false, runtime.token)).rejects.toMatchObject({ statusCode: 409 })
    await restarted.claude['drainQueue'](id)
    await vi.waitFor(() => expect(restarted.calls).toEqual(['A']))
    await idle(restarted)
  })

  it('leaves ordinary direct sends independent of an unrelated recovery', async () => {
    const runtime = await fixture(true, false)
    await runtime.combined.sendMessage(id, 'ordinary direct send')
    await vi.waitFor(() => expect(runtime.calls).toEqual(['ordinary direct send']))
    await idle(runtime)
    expect(runtime.store.get(id)?.failedPrompt?.failedAt).toBe(runtime.token)
    await runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['ordinary direct send', 'A']))
    await idle(runtime)
  })

  it('keeps ordinary fresh direct sends unchanged and supports an explicitly edited recovered draft', async () => {
    const fresh = await fixture(false, false)
    await fresh.store.removeQueuedPrompt(id, 'A')
    await fresh.combined.sendMessage(id, 'ordinary')
    await vi.waitFor(() => expect(fresh.calls).toEqual(['ordinary']))
    await idle(fresh)
    expect((await fresh.persisted()).lastClaimedRecovery).toBeUndefined()
    const recovered = await fixture(true, false)
    await recovered.combined.sendMessage(id, 'A with user edits', false, recovered.token)
    await vi.waitFor(() => expect(recovered.calls).toEqual(['A with user edits']))
    await idle(recovered)
    await expect(recovered.combined.sendMessage(id, 'A', false, recovered.token))
      .rejects.toMatchObject({ statusCode: 409 })
  })

  it('does not consume a direct recovery while busy, but accepts an explicit answering enqueue', async () => {
    const runtime = await fixture(true, false)
    const busy = deferred()
    vi.mocked(runtime.sdk.query).mockImplementation(({ prompt, options }) => {
      if (typeof prompt === 'string') runtime.calls.push(prompt)
      options?.abortController?.signal.addEventListener('abort', busy.resolve, { once: true })
      return (async function* () {
        if (prompt === 'busy') await busy.promise
        yield { type: 'stream_event', event: { type: 'message_start' } }
      })() as unknown as Query
    })
    await runtime.combined.sendMessage(id, 'busy')
    await expect(runtime.combined.sendMessage(id, 'A', false, runtime.token))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.store.get(id)?.failedPrompt?.failedAt).toBe(runtime.token)
    await runtime.combined.sendMessage(id, 'A', true, runtime.token)
    expect(runtime.store.get(id)?.failedPrompt).toBeUndefined()
    expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['A'])
    busy.resolve()
    await vi.waitFor(() => expect(runtime.calls).toEqual(['busy', 'A']))
    await idle(runtime)
  })

  it('retains accepted recovery in FIFO when authentication fails without making the token reusable', async () => {
    const runtime = await fixture(true, false)
    runtime.authenticate.mockResolvedValue({ loggedIn: false })
    await runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await vi.waitFor(() => expect(runtime.authenticate).toHaveBeenCalledTimes(1))
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(runtime.calls).toEqual([])
    expect(runtime.store.get(id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['A'])
    await expect(runtime.combined.sendMessage(id, 'A', false, runtime.token))
      .rejects.toMatchObject({ statusCode: 409 })
    runtime.authenticate.mockResolvedValue({ loggedIn: true })
    await runtime.claude['drainQueue'](id)
    await vi.waitFor(() => expect(runtime.calls).toEqual(['A']))
    await idle(runtime)
  })

  it('retains fresh uncertainty after a lost provider-start outcome and rejects the old token', async () => {
    const runtime = await fixture(true, false)
    vi.mocked(runtime.sdk.query).mockImplementationOnce(({ prompt }) => {
      if (typeof prompt === 'string') runtime.calls.push(prompt)
      throw new Error('Provider start outcome lost')
    })
    await runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await vi.waitFor(() => expect(runtime.store.get(id)?.queuedDispatch?.state).toBe('uncertain'))
    expect(runtime.calls).toEqual(['A'])
    const admitted = await runtime.persisted()
    expect(admitted.queuedDispatch).toBeDefined()
    expect(admitted.failedPrompt.uncertain).toBe(true)
    expect(admitted.failedPrompt.failedAt).not.toBe(runtime.token)
    await runtime.combined.stop()
    const store = new SessionStore(runtime.directory)
    await store.initialize()
    const restarted = await connect(runtime.directory, store)
    expect(store.get(id)?.failedPrompt).toMatchObject({
      content: 'A', uncertain: true, failedAt: admitted.failedPrompt.failedAt,
    })
    await expect(restarted.combined.sendMessage(id, 'A', false, runtime.token))
      .rejects.toMatchObject({ statusCode: 409 })
    await expect(restarted.combined.sendMessage(id, 'A', false, admitted.failedPrompt.failedAt))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(restarted.calls).toEqual([])
  })
})

describe('PR162 final root integration', () => {
  it.each([false, true])('retains claimed Claude recovery behind restored FIFO when Clear joins failed lookup (stop: %s)', async (stop) => {
    const runtime = await fixture(true, true)
    const entered = deferred()
    const lookup = deferred()
    vi.mocked(runtime.sdk.getSessionInfo).mockImplementationOnce(async () => {
      entered.resolve()
      await lookup.promise
      return undefined
    })
    const finishing = vi.spyOn(runtime.store, 'finishMessage')
    await runtime.combined.sendMessage(id, 'Edited recovered A', false, runtime.token)
    await entered.promise
    const clearing = runtime.combined.clearConversation(id)
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    const stopping = stop ? runtime.combined.stop() : Promise.resolve()
    lookup.reject(new Error('Metadata lookup rejected after recovery was claimed'))
    await stopping
    expect(await clearing).toMatchObject({ error: { statusCode: stop ? 503 : 409 } })
    expect(runtime.calls).toEqual([])
    expect(finishing).not.toHaveBeenCalled()
    expect(runtime.sdk.deleteSession).not.toHaveBeenCalled()
    const durable = await runtime.persisted()
    expect(durable.queuedPrompts.map((prompt: { content: string }) => prompt.content))
      .toEqual(['B', 'Edited recovered A'])
    expect(durable.lastClaimedRecovery).toBe(runtime.token)
    expect(durable.sdkQueueAdmission).toBeUndefined()
    expect(runtime.store.isRetiredSession(id)).toBe(false)
    const resumed = stop
      ? await (async () => {
          const store = new SessionStore(runtime.directory)
          await store.initialize()
          return connect(runtime.directory, store)
        })()
      : runtime
    await expect(resumed.combined.sendMessage(id, 'Edited recovered A', false, runtime.token))
      .rejects.toMatchObject({ statusCode: 409 })
    await resumed.claude['drainQueue'](id)
    await vi.waitFor(() => expect(resumed.calls).toEqual(['B', 'Edited recovered A']))
    await idle(resumed)
  })
})

describe('Claude unregistered query recovery', () => {
  it.each([false, true])('restores queued A before completing a rejected metadata lookup (stop: %s)', async (stop) => {
    const { store, claude, sdk, calls, persisted } = await fixture(false, true)
    const entered = deferred()
    const lookup = deferred()
    vi.mocked(sdk.getSessionInfo).mockImplementationOnce(async () => {
      entered.resolve()
      await lookup.promise
      return undefined
    })
    const finishing = vi.spyOn(store, 'finishMessage')
    const draining = claude['drainQueue'](id).catch((error: unknown) => error)
    await entered.promise
    expect((await persisted()).queuedDispatch.original.content).toBe('A')
    const stopping = stop ? claude.stop() : Promise.resolve()
    lookup.reject(new Error('Metadata lookup rejected'))
    await Promise.all([draining, stopping])
    expect(calls).toEqual([])
    expect((await persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual(['A', 'B'])
    expect(finishing).not.toHaveBeenCalled()
    expect(store.get(id)?.messages).toEqual([])
  })

  it.each([false, true])('handles a successful metadata lookup without losing A (stop: %s)', async (stop) => {
    const runtime = await fixture(false, true)
    const entered = deferred()
    const lookup = deferred()
    vi.mocked(runtime.sdk.getSessionInfo).mockImplementationOnce(async () => {
      entered.resolve()
      await lookup.promise
      return undefined
    })
    const draining = runtime.claude['drainQueue'](id).catch((error: unknown) => error)
    await entered.promise
    const stopping = stop ? runtime.combined.stop() : Promise.resolve()
    lookup.resolve()
    await Promise.all([draining, stopping])
    if (stop) {
      expect(runtime.calls).toEqual([])
      expect((await runtime.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual(['A', 'B'])
    } else {
      await vi.waitFor(() => expect(runtime.calls).toEqual(['A', 'B']))
      await idle(runtime)
    }
  })

  it.each([false, true])('retains durable A when metadata-failure restoration is refused (stop: %s)', async (stop) => {
    const runtime = await fixture(false, true)
    const entered = deferred()
    const lookup = deferred()
    vi.mocked(runtime.sdk.getSessionInfo).mockImplementationOnce(async () => {
      entered.resolve()
      await lookup.promise
      return undefined
    })
    const finishing = vi.spyOn(runtime.store, 'finishMessage')
    const draining = runtime.claude['drainQueue'](id).catch((error: unknown) => error)
    await entered.promise
    vi.mocked(writeFile).mockRejectedValue(new Error('Restoration refused'))
    const stopping = stop ? runtime.combined.stop().catch((error: unknown) => error) : Promise.resolve()
    lookup.reject(new Error('Metadata rejected'))
    await Promise.all([draining, stopping])
    expect(runtime.calls).toEqual([])
    expect(finishing).not.toHaveBeenCalled()
    const persisted = await runtime.persisted()
    expect(persisted.queuedDispatch.original.content).toBe('A')
    expect(persisted.failedPrompt).toMatchObject({ content: 'A', uncertain: true })
    vi.mocked(writeFile).mockImplementation(disk.writeFile)
    if (stop) {
      const store = new SessionStore(runtime.directory)
      await store.initialize()
      expect(store.get(id)?.failedPrompt?.content).toBe('A')
    } else {
      await runtime.claude['drainQueue'](id)
      expect(runtime.calls).toEqual([])
      expect(runtime.store.get(id)?.queuedDispatch).toBeDefined()
    }
  })

  it('restores an unstarted admission without erasing a newer owner or its question', async () => {
    const runtime = await fixture(false, true)
    const entered = deferred()
    const lookup = deferred()
    vi.mocked(runtime.sdk.getSessionInfo).mockImplementationOnce(async () => {
      entered.resolve()
      await lookup.promise
      return undefined
    })
    const draining = runtime.claude['drainQueue'](id).catch((error: unknown) => error)
    await entered.promise
    const newer = {
      query: {} as Query,
      abortController: new AbortController(),
      resourceOwner: Symbol(),
      resourceReads: runtime.claude['resourceReads'],
      done: Promise.resolve(),
      finish: () => {},
    }
    runtime.claude['active'].set(id, newer)
    await runtime.store.update(id, (session) => {
      session.status = 'waiting'
      session.pendingPermission = { requestId: 'newer', kind: 'tool', title: 'Newer work', options: [] }
      session.activity = 'Newer work'
    })
    lookup.reject(new Error('Old lookup rejected'))
    await draining
    expect(runtime.claude['active'].get(id)).toBe(newer)
    expect(runtime.store.get(id)).toMatchObject({
      status: 'waiting', activity: 'Newer work', pendingPermission: { requestId: 'newer' },
      queuedPrompts: [{ content: 'A' }, { content: 'B' }],
    })
    expect(runtime.calls).toEqual([])
  })

  it('does not mark a newer unregistered owner idle when an older lookup rejects', async () => {
    const runtime = await fixture(false, true)
    const entered = deferred()
    const lookup = deferred()
    vi.mocked(runtime.sdk.getSessionInfo).mockImplementationOnce(async () => {
      entered.resolve()
      await lookup.promise
      return undefined
    })
    const draining = runtime.claude['drainQueue'](id).catch((error: unknown) => error)
    await entered.promise
    const newer = Promise.resolve(true)
    runtime.claude['startingQueries'].set(id, newer)
    await runtime.store.updateStatus(id, 'running', 'Newer registration')
    lookup.reject(new Error('Old lookup rejected'))
    await draining
    expect(runtime.claude['startingQueries'].get(id)).toBe(newer)
    expect(runtime.store.get(id)).toMatchObject({
      status: 'running', activity: 'Newer registration',
      queuedPrompts: [{ content: 'A' }, { content: 'B' }],
    })
    expect(runtime.calls).toEqual([])
  })

  it('does not assert non-delivery when the query factory itself has an uncertain failure', async () => {
    const runtime = await fixture(true, false)
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse(runtime.token!))
    vi.mocked(runtime.sdk.query).mockImplementationOnce(() => { throw new Error('Provider start outcome lost') })
    await runtime.combined.sendMessage(id, 'A', false, runtime.token)
    await vi.waitFor(() => expect(runtime.store.get(id)?.failedPrompt?.uncertain).toBe(true))
    const recovered = runtime.store.get(id)!.failedPrompt!
    expect(recovered.content).toBe('A')
    expect(Date.parse(recovered.failedAt)).toBeGreaterThan(Date.parse(runtime.token!))
    expect(vi.mocked(runtime.sdk.query)).toHaveBeenCalledTimes(1)
    await expect(runtime.combined.sendMessage(id, 'A', false, runtime.token)).rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.store.get(id)?.messages.at(-1)?.content).toContain('uncertain')
    await expect(runtime.combined.sendMessage(id, 'A', false, recovered.failedAt))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(runtime.store.get(id)?.queuedDispatch?.state).toBe('uncertain')
  })
})
