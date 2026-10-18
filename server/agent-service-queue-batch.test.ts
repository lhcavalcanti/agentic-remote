import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'

/** An SDK session whose turns end only when the test ends them. */
class TurnSession implements CopilotSessionLike {
  readonly sessionId = randomUUID()
  readonly sent: string[] = []
  private readonly handlers = new Set<(event: SessionEvent) => void>()
  private readonly open: Array<() => void> = []
  readonly rpc = {
    commands: {
      list: async () => ({ commands: [] }),
      invoke: async () => ({ kind: 'text' as const, text: '' }),
      enqueue: async () => ({ queued: true as const, queueId: 'q' }),
    },
    name: { set: async () => undefined },
    model: {
      getCurrent: async () => ({ modelId: 'fixture' }),
      switchTo: async ({ modelId }: { modelId: string }) => ({ modelId }),
    },
    mode: { set: async () => ({ status: 'applied', modelChanged: false }) },
  } as unknown as CopilotSessionLike['rpc']

  on(handler: (event: SessionEvent) => void) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  /** Prompts whose next send fails before Copilot accepts them. */
  readonly refuse = new Set<string>()

  async send({ prompt }: { prompt: string; mode: 'immediate' }) {
    if (this.refuse.delete(prompt)) throw new Error('Copilot refused the prompt')
    this.sent.push(prompt)
    this.open.push(() => {
      for (const handler of [...this.handlers]) {
        handler({
          id: randomUUID(), type: 'session.idle', timestamp: new Date().toISOString(),
          parentId: null, data: {},
        } as SessionEvent)
      }
    })
    return randomUUID()
  }

  sendAndWait(prompt: string): Promise<undefined> {
    this.sent.push(prompt)
    return new Promise((resolve) => this.open.push(() => resolve(undefined)))
  }

  /** Ends the turn now running. */
  finishTurn(): void {
    this.open.shift()?.()
  }

  get running(): number {
    return this.open.length
  }

  async getEvents() {
    return []
  }
  async abort() {}
  async disconnect() {}
}

const directories: string[] = []
const services: AgentService[] = []

afterEach(async () => {
  await Promise.allSettled(services.splice(0).map((service) => service.stop()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

async function setup(options: { directory?: string; session?: TurnSession } = {}) {
  const directory = options.directory ?? await mkdtemp(path.join(tmpdir(), 'queue-batch-service-'))
  if (!options.directory) directories.push(directory)
  const session = options.session ?? new TurnSession()
  const client = {
    start: async () => {},
    stop: async () => [],
    createSession: async () => session,
    resumeSession: async () => session,
    deleteSession: async () => {},
    listSessions: async () => [],
    rpc: { commands: { list: async () => ({ commands: [] }) }, models: { list: async () => ({ models: [] }) } },
  } as unknown as CopilotClientLike
  const service = new AgentService(
    new SessionStore(path.join(directory, 'state')),
    client,
    async () => [],
    async () => undefined,
    async () => [],
    async () => undefined,
    { has: async () => false, send: async () => false, capture: async () => '', cancel: async () => false } as never,
  )
  services.push(service)
  await service.start()
  vi.stubEnv('HOME', directory)
  const created = await service.createSession(directory)
  return { service, session, id: created.id, directory }
}

const queueOf = (service: AgentService, id: string) =>
  (service.store.get(id)?.queuedPrompts ?? []).map((prompt) => prompt.content)

async function settle(check: () => boolean, label: string) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (check()) return
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  throw new Error(`Timed out waiting for ${label}`)
}

describe('AgentService.queueBatch', () => {
  it('queues every prompt behind the running turn and runs each as its own turn, in order', async () => {
    const { service, session, id } = await setup()
    await service.sendMessage(id, 'running turn')
    const published: unknown[] = []
    service.on('event', (event) => {
      if (event.type === 'session.upserted') published.push(event)
    })
    const result = await service.queueBatch(id, { batchId: 'batch-0001', prompts: ['first', 'second', 'third'] })
    expect(result.batch).toEqual({ id: 'batch-0001', promptIds: expect.any(Array), duplicate: false })
    expect(result.session.queuedPrompts?.map((prompt) => [prompt.content, prompt.batch?.index, prompt.batch?.size]))
      .toEqual([['first', 0, 3], ['second', 1, 3], ['third', 2, 3]])
    expect(result.session.queuedPrompts?.map((prompt) => prompt.id)).toEqual(result.batch.promptIds)
    // One acknowledgement for the batch: a single published change, not three.
    expect(published).toHaveLength(1)

    for (const expected of ['first', 'second', 'third']) {
      session.finishTurn()
      await settle(() => session.sent.at(-1) === expected, expected)
      // Never two at once: each prompt waits for the turn before it.
      expect(session.running).toBe(1)
    }
    expect(session.sent).toEqual(['running turn', 'first', 'second', 'third'])
    session.finishTurn()
    await settle(() => queueOf(service, id).length === 0 && service.store.get(id)?.status === 'idle', 'idle')
  })

  it('starts the first prompt at once on an idle session', async () => {
    const { service, session, id } = await setup()
    await service.queueBatch(id, { batchId: 'batch-0001', prompts: ['first', 'second'] })
    await settle(() => session.sent.length === 1, 'first dispatch')
    expect(session.sent).toEqual(['first'])
    expect(queueOf(service, id)).toEqual(['second'])
    session.finishTurn()
    await settle(() => session.sent.length === 2, 'second dispatch')
    session.finishTurn()
  })

  it('answers a retried batch with the original items and refuses the ID for other prompts', async () => {
    const { service, id } = await setup()
    await service.sendMessage(id, 'running turn')
    const first = await service.queueBatch(id, { batchId: 'batch-0001', prompts: ['first', 'second'] })
    const retry = await service.queueBatch(id, { batchId: 'batch-0001', prompts: ['first', 'second'] })
    expect(retry.batch).toEqual({ id: 'batch-0001', promptIds: first.batch.promptIds, duplicate: true })
    expect(queueOf(service, id)).toEqual(['first', 'second'])
    await expect(service.queueBatch(id, { batchId: 'batch-0001', prompts: ['other'] }))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(queueOf(service, id)).toEqual(['first', 'second'])
  })

  it('refuses a malformed batch or a suspended session without queueing anything', async () => {
    const { service, id } = await setup()
    await service.sendMessage(id, 'running turn')
    await expect(service.queueBatch(id, { batchId: 'batch-0001', prompts: ['ok', ' '] }))
      .rejects.toMatchObject({ statusCode: 400, uncertainDelivery: false })
    await expect(service.queueBatch(id, { batchId: 'batch-0002', prompts: ['ok', '/usage'] }))
      .rejects.toMatchObject({ statusCode: 400 })
    await service.store.update(id, (stored) => {
      stored.suspended = true
    })
    await expect(service.queueBatch(id, { batchId: 'batch-0003', prompts: ['ok'] }))
      .rejects.toMatchObject({ statusCode: 409, message: expect.stringMatching(/Nothing was queued/) })
    expect(queueOf(service, id)).toEqual([])
    await expect(service.queueBatch('missing', { batchId: 'batch-0004', prompts: ['ok'] }))
      .rejects.toMatchObject({ statusCode: 404, uncertainDelivery: false })
  })

  it('reports a refusal before the write as nothing queued, so the prompts can be edited', async () => {
    const { service, id } = await setup()
    await service.sendMessage(id, 'running turn')
    // A terminal prompt still awaiting confirmation of its delivery.
    const pending = (service as unknown as { pendingTerminalPromptDispatches: Map<string, string> })
      .pendingTerminalPromptDispatches
    pending.set(id, 'dispatch')
    await expect(service.queueBatch(id, { batchId: 'batch-terminal', prompts: ['ok'] }))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    pending.delete(id)
    expect(queueOf(service, id)).toEqual([])

    await service.stop()
    await expect(service.queueBatch(id, { batchId: 'batch-stopped', prompts: ['ok'] }))
      .rejects.toMatchObject({ uncertainDelivery: false, message: expect.stringMatching(/Nothing was queued/) })
  })

  it('holds the batch while a permission is pending, and carries on once it is answered', async () => {
    const { service, session, id } = await setup()
    await service.store.update(id, (stored) => {
      stored.status = 'idle'
      stored.pendingPermission = {
        requestId: 'permission-1', title: 'Run a command', options: [],
      } as never
    })
    await service.queueBatch(id, { batchId: 'batch-0001', prompts: ['first', 'second'] })
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(session.sent).toEqual([])
    expect(queueOf(service, id)).toEqual(['first', 'second'])

    await service.store.update(id, (stored) => {
      stored.pendingPermission = undefined
    })
    // A permission reply wakes the queue; here a later queued message does.
    await service.sendMessage(id, 'after', true)
    await settle(() => session.sent.length === 1, 'first dispatch')
    expect(session.sent).toEqual(['first'])
    expect(queueOf(service, id)).toEqual(['second', 'after'])
    session.finishTurn()
    await settle(() => session.sent.length === 2, 'second dispatch')
    session.finishTurn()
    await settle(() => session.sent.length === 3, 'after dispatch')
    session.finishTurn()
  })

  it('never lets a send that arrives meanwhile land inside the batch', async () => {
    const { service, id } = await setup()
    await service.sendMessage(id, 'running turn')
    await Promise.all([
      service.queueBatch(id, { batchId: 'batch-0001', prompts: ['b1', 'b2', 'b3'] }),
      service.sendMessage(id, 'single', true),
    ])
    expect([
      ['b1', 'b2', 'b3', 'single'],
      ['single', 'b1', 'b2', 'b3'],
    ]).toContainEqual(queueOf(service, id))
  })

  it('lets one item be edited or removed without touching its neighbours', async () => {
    const { service, session, id } = await setup()
    await service.sendMessage(id, 'running turn')
    const { batch } = await service.queueBatch(id, { batchId: 'batch-0001', prompts: ['first', 'second', 'third'] })
    await service.updateQueuedPrompt(id, batch.promptIds[1], 'second, rewritten')
    await service.removeQueuedPrompt(id, batch.promptIds[0])
    expect(service.store.get(id)?.queuedPrompts?.map((prompt) => [prompt.id, prompt.content])).toEqual([
      [batch.promptIds[1], 'second, rewritten'],
      [batch.promptIds[2], 'third'],
    ])
    session.finishTurn()
    await settle(() => session.sent.length === 2, 'rewritten dispatch')
    session.finishTurn()
    await settle(() => session.sent.length === 3, 'third dispatch')
    expect(session.sent).toEqual(['running turn', 'second, rewritten', 'third'])
    session.finishTurn()
  })

  it('stops at an item whose delivery is unconfirmed, leaves its neighbours alone, and retries it in place', async () => {
    const { service, session, id } = await setup()
    await service.sendMessage(id, 'running turn')
    await service.queueBatch(id, { batchId: 'batch-fail-1', prompts: ['first', 'second', 'third'] })
    session.refuse.add('second')
    session.finishTurn()
    await settle(() => session.sent.includes('first'), 'first')
    session.finishTurn()
    await settle(() => Boolean(service.store.get(id)?.failedPrompt), 'the failure')
    await new Promise((resolve) => setTimeout(resolve, 50))
    // Never retried on its own, and nothing behind it overtakes it.
    expect(session.sent).toEqual(['running turn', 'first'])
    expect(service.store.get(id)?.failedPrompt).toMatchObject({ content: 'second' })
    expect(queueOf(service, id)).toEqual(['third'])

    // Retried where it was, once the user has checked it was not delivered.
    const dispatch = service.store.get(id)!.queuedDispatch!
    await expect(service.retryQueuedDispatch(id, dispatch.promptId, 'some-other-attempt'))
      .rejects.toMatchObject({ statusCode: 409 })
    const retried = await service.retryQueuedDispatch(id, dispatch.promptId, dispatch.attemptId)
    expect(retried.queuedPrompts?.map((prompt) => [prompt.content, prompt.batch?.index])).toEqual([['second', 1], ['third', 2]])
    expect(retried.queuedDispatch).toBeUndefined()
    expect(retried.failedPrompt).toBeUndefined()
    await settle(() => session.sent.includes('second'), 'the retry')
    session.finishTurn()
    await settle(() => session.sent.includes('third'), 'third')
    session.finishTurn()
    expect(session.sent).toEqual(['running turn', 'first', 'second', 'third'])
    expect(queueOf(service, id)).toEqual([])
    await expect(service.retryQueuedDispatch(id, dispatch.promptId, dispatch.attemptId))
      .rejects.toMatchObject({ statusCode: 409 })
  })

  it('retries only an outcome recorded as not accepted, never one a restart interrupted or the provider took', async () => {
    const { service, session, id } = await setup()
    await service.sendMessage(id, 'running turn')
    const plant = async (claim: { state: 'dispatching' | 'uncertain'; accepted?: boolean }) => {
      const attemptId = randomUUID()
      const original = { id: randomUUID(), content: `held ${claim.state} ${claim.accepted}`, createdAt: new Date().toISOString() }
      await service.store.update(id, (stored) => {
        stored.queuedDispatch = {
          attemptId, promptId: original.id, content: original.content, startedAt: original.createdAt,
          originalIndex: 0, original, ...claim,
        }
      })
      return { attemptId, promptId: original.id }
    }
    // Stored as dispatching with no live attempt: shown as unconfirmed, but
    // whether the provider took it was never recorded.
    const interrupted = await plant({ state: 'dispatching' })
    expect(service.getSession(id)?.queuedDispatch?.state).toBe('uncertain')
    await expect(service.retryQueuedDispatch(id, interrupted.promptId, interrupted.attemptId))
      .rejects.toMatchObject({ statusCode: 409, message: expect.stringMatching(/never recorded/) })
    const accepted = await plant({ state: 'uncertain', accepted: true })
    await expect(service.retryQueuedDispatch(id, accepted.promptId, accepted.attemptId))
      .rejects.toMatchObject({ statusCode: 409, message: expect.stringMatching(/accepted/) })
    expect(service.store.get(id)?.queuedDispatch?.attemptId).toBe(accepted.attemptId)

    const refused = await plant({ state: 'uncertain', accepted: false })
    const retried = await service.retryQueuedDispatch(id, refused.promptId, refused.attemptId)
    expect(retried.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['held uncertain false'])
    session.finishTurn()
    await settle(() => session.sent.includes('held uncertain false'), 'the retried item')
  })

  it('delivers a long prompt exactly as written', async () => {
    const { service, session, id } = await setup()
    const long = `Start ${'0123456789'.repeat(19_999)} end`
    await service.queueBatch(id, { batchId: 'batch-0001', prompts: [long, 'short'] })
    await settle(() => session.sent.length === 1, 'long dispatch')
    expect(session.sent[0]).toBe(long)
    session.finishTurn()
    await settle(() => session.sent.length === 2, 'short dispatch')
    session.finishTurn()
  })

  it('keeps a queued batch across a restart and recognises its retry afterwards', async () => {
    const first = await setup()
    await first.service.sendMessage(first.id, 'running turn')
    const { batch } = await first.service.queueBatch(first.id, {
      batchId: 'batch-0001', prompts: ['first', 'second'],
    })
    await first.service.stop()
    const restored = new SessionStore(path.join(first.directory, 'state'))
    await restored.initialize()
    expect(restored.get(first.id)?.queuedPrompts?.map((prompt) => [prompt.id, prompt.batch?.id]))
      .toEqual(batch.promptIds.map((promptId) => [promptId, 'batch-0001']))
    expect(restored.get(first.id)?.queueBatches?.map((record) => record.id)).toEqual(['batch-0001'])
  })

  it('keeps a terminal session’s batch in the app and sends one prompt each time it goes idle', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'queue-batch-terminal-'))
    directories.push(directory)
    const session = new TurnSession()
    let eventVersion = 'events-v0'
    let events: SessionEvent[] = []
    const composer = '\u257b\u2584\u2584\n\u2503\n\u2579\u2580\u2580\n / commands'
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      capture: vi.fn(async () => composer),
      cancel: vi.fn(async () => true),
    }
    const client = {
      start: async () => {},
      stop: async () => [],
      createSession: async () => session,
      resumeSession: async () => session,
      deleteSession: async () => {},
      listSessions: async () => [{
        sessionId: session.sessionId, startTime: new Date(), modifiedTime: new Date(),
        summary: 'External session', isRemote: false, context: { workingDirectory: directory },
      }],
      rpc: { commands: { list: async () => ({ commands: [] }) }, models: { list: async () => ({ models: [] }) } },
    } as unknown as CopilotClientLike
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [{
        id: session.sessionId, cwd: directory, title: 'Active Copilot session', updatedAt: new Date().toISOString(),
      }],
      async () => undefined,
      async () => events,
      async () => eventVersion,
      terminal as never,
    )
    services.push(service)
    await service.start()
    await service.store.updateStatus(session.sessionId, 'running')

    const { session: queued } = await service.queueBatch(session.sessionId, {
      batchId: 'batch-0001', prompts: ['first terminal prompt', 'second terminal prompt'],
    })
    // Never typed into Copilot's own queue: the app keeps both items.
    expect(terminal.send).not.toHaveBeenCalled()
    expect(queueOf(service, session.sessionId)).toEqual(['first terminal prompt', 'second terminal prompt'])

    const idleAt = queued.queuedPrompts![0].createdAt
    const later = (seconds: number) => new Date(Date.parse(idleAt) + seconds * 1_000).toISOString()
    events = [{ type: 'session.idle', id: 'idle-1', parentId: null, timestamp: idleAt, data: {} }] as SessionEvent[]
    eventVersion = 'events-v1'
    await service.refreshTranscripts()
    expect(terminal.send).toHaveBeenCalledTimes(1)
    expect(terminal.send).toHaveBeenLastCalledWith(session.sessionId, 'first terminal prompt', false)
    expect(queueOf(service, session.sessionId)).toEqual(['second terminal prompt'])

    events = [...events, {
      type: 'user.message', id: 'user-1', parentId: 'idle-1', timestamp: later(1),
      data: { content: 'first terminal prompt' },
    }] as SessionEvent[]
    eventVersion = 'events-v2'
    await service.refreshTranscripts()
    // Still running the first: the second waits.
    expect(terminal.send).toHaveBeenCalledTimes(1)

    events = [...events, {
      type: 'session.idle', id: 'idle-2', parentId: 'user-1', timestamp: later(2), data: {},
    }] as SessionEvent[]
    eventVersion = 'events-v3'
    await service.refreshTranscripts()
    expect(terminal.send).toHaveBeenCalledTimes(2)
    expect(terminal.send).toHaveBeenLastCalledWith(session.sessionId, 'second terminal prompt', false)
    expect(queueOf(service, session.sessionId)).toEqual([])
  })
})
