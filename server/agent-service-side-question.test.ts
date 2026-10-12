import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionMetadata } from '@github/copilot-sdk'
import { AgentService } from './agent-service.js'
import type { CopilotClientLike, CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'

type ForkRequest = { sessionId: string; toEventId?: string; name?: string }

function forkSession(id: string, ask: (question: string) => Promise<{ answer: string }>) {
  return {
    sessionId: id,
    disconnect: vi.fn(async () => undefined),
    on: () => () => undefined,
    sendAndWait: async () => undefined,
    getEvents: async () => [],
    abort: async () => undefined,
    rpc: {
      ui: { ephemeralQuery: vi.fn(({ question }: { question: string }) => ask(question)) },
    },
  } as unknown as CopilotSessionLike & {
    disconnect: ReturnType<typeof vi.fn>
    rpc: { ui: { ephemeralQuery: ReturnType<typeof vi.fn> } }
  }
}

function fakeClient(options: { fork?: boolean } = {}) {
  let forks = 0
  const asked: string[] = []
  let answer: (question: string) => Promise<{ answer: string }> =
    async (question) => ({ answer: `Answer to ${question}` })
  const resumed: ReturnType<typeof forkSession>[] = []
  const client = {
    forkRequests: [] as ForkRequest[],
    deleted: [] as string[],
    listed: [] as SessionMetadata[],
    asked,
    resumed,
    answerWith(next: typeof answer) {
      answer = next
    },
    start: vi.fn(async () => undefined),
    stop: vi.fn(async () => []),
    createSession: vi.fn(async () => { throw new Error('No SDK sessions in this fixture') }),
    resumeSession: vi.fn(async (sessionId: string) => {
      const session = forkSession(sessionId, (question) => {
        asked.push(question)
        return answer(question)
      })
      resumed.push(session)
      return session
    }),
    listSessions: async () => client.listed,
    deleteSession: vi.fn(async (sessionId: string) => {
      client.deleted.push(sessionId)
    }),
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
      ...(options.fork === false
        ? {}
        : {
            sessions: {
              fork: vi.fn(async (request: ForkRequest) => {
                client.forkRequests.push(request)
                return { sessionId: `fork-${++forks}` }
              }),
            },
          }),
    },
  }
  return client
}

const services: AgentService[] = []
const directories: string[] = []

afterEach(async () => {
  for (const service of services.splice(0)) await service.stop()
  for (const directory of directories.splice(0)) {
    await rm(directory, { recursive: true, force: true })
  }
})

async function fixture(
  events: { id?: string; type: string }[] = [],
  clientOptions: { fork?: boolean } = {},
) {
  const directory = await mkdtemp(path.join(tmpdir(), 'side-question-'))
  directories.push(directory)
  const store = new SessionStore(path.join(directory, 'state'))
  await store.initialize()
  await store.create(
    {
      id: 'source',
      cwd: directory,
      title: 'Source session',
      updatedAt: '2026-10-12T00:00:00.000Z',
      status: 'idle',
      isOpen: true,
      messages: [],
    },
    { managedOpen: true },
  )
  // The service's own runtime has no fork: side questions use their own.
  const main = fakeClient({ fork: false })
  const client = fakeClient(clientOptions)
  const factory = vi.fn(() => client as unknown as CopilotClientLike)
  const service = new AgentService(
    store,
    main as unknown as CopilotClientLike,
    async () => [],
    async () => undefined,
    async () => events as never,
    undefined,
    undefined,
    undefined,
    undefined,
    factory,
  )
  services.push(service)
  await service.start()
  return { client, main, factory, service, store, directory }
}

describe('AgentService side questions', () => {
  it('advertises side questions for Copilot', async () => {
    const { service } = await fixture()
    expect(service.providers()[0]).toMatchObject({ id: 'copilot', supportsSideQuestions: true })
  })

  it('answers from a fork of the whole history and deletes the fork', async () => {
    const { client, service } = await fixture([
      { id: 'u1', type: 'user.message' },
      { id: 'e1', type: 'assistant.turn_end' },
    ])

    await expect(service.askSession('source', '  What did we decide?  '))
      .resolves.toBe('Answer to What did we decide?')

    expect(client.forkRequests).toEqual([{ sessionId: 'source' }])
    expect(client.resumeSession).toHaveBeenCalledWith('fork-1', expect.objectContaining({ streaming: false }))
    expect(client.asked).toEqual(['What did we decide?'])
    expect(client.resumed[0].disconnect).toHaveBeenCalledOnce()
    expect(client.deleted).toEqual(['fork-1'])
    expect(service.listSessions().map((session) => session.id)).toEqual(['source'])
  })

  it('leaves a turn that is still running out of the fork', async () => {
    const { client, service } = await fixture([
      { id: 'u1', type: 'user.message' },
      { id: 'e1', type: 'assistant.turn_end' },
      { id: 'u2', type: 'user.message' },
      { id: 't2', type: 'assistant.turn_start' },
    ])

    await service.askSession('source', 'Status?')

    expect(client.forkRequests).toEqual([{ sessionId: 'source', toEventId: 'u2' }])
  })

  it('deletes the fork when the question fails', async () => {
    const { client, service } = await fixture()
    client.answerWith(async () => { throw new Error('Model unavailable') })

    await expect(service.askSession('source', 'Why?')).rejects.toThrow('Model unavailable')

    expect(client.resumed[0].disconnect).toHaveBeenCalledOnce()
    expect(client.deleted).toEqual(['fork-1'])
  })

  it('abandons a question that is not answered in time', async () => {
    const { client, service } = await fixture()
    ;(service as unknown as { sideQuestionTimeoutMs: number }).sideQuestionTimeoutMs = 20
    client.answerWith(() => new Promise(() => {}))

    await expect(service.askSession('source', 'Still there?')).rejects.toMatchObject({
      statusCode: 504,
    })
    expect(client.deleted).toEqual(['fork-1'])
  })

  it('keeps a fork listed during the question out of the session list', async () => {
    const { client, main, service, directory } = await fixture()
    let release!: (value: { answer: string }) => void
    client.answerWith(() => new Promise((resolve) => { release = resolve }))
    const asking = service.askSession('source', 'Anything?')
    await vi.waitFor(() => expect(client.asked).toEqual(['Anything?']))
    main.listed = [{
      sessionId: 'fork-1',
      startTime: new Date(),
      modifiedTime: new Date(),
      summary: 'Forked conversation',
      isRemote: false,
      context: { workingDirectory: directory },
    } as SessionMetadata]
    const discovery = service.refreshDiscovery()

    release({ answer: 'Nothing new.' })
    await expect(asking).resolves.toBe('Nothing new.')
    await discovery
    await service.refreshDiscovery()

    expect(service.listSessions().map((session) => session.id)).toEqual(['source'])
    expect(service.listHistory().map((session) => session.id)).not.toContain('fork-1')
  })

  it('forks through its own runtime, started once and stopped when idle', async () => {
    const { client, main, factory, service } = await fixture()
    ;(service as unknown as { sideQuestionIdleMs: number }).sideQuestionIdleMs = 30

    await service.askSession('source', 'First?')
    await service.askSession('source', 'Second?')

    expect(factory).toHaveBeenCalledOnce()
    expect(client.start).toHaveBeenCalledOnce()
    expect(main.resumeSession).not.toHaveBeenCalled()
    expect(main.deleteSession).not.toHaveBeenCalled()
    expect(client.deleted).toEqual(['fork-1', 'fork-2'])
    await vi.waitFor(() => expect(client.stop).toHaveBeenCalledOnce())

    await service.askSession('source', 'Third?')
    expect(factory).toHaveBeenCalledTimes(2)
  })

  it('finishes a question in flight and stops its runtime when the service stops', async () => {
    const { client, service } = await fixture()
    let release!: (value: { answer: string }) => void
    client.answerWith(() => new Promise((resolve) => { release = resolve }))
    const asking = service.askSession('source', 'Before shutdown?')
    await vi.waitFor(() => expect(client.asked).toEqual(['Before shutdown?']))

    const stopping = service.stop()
    expect(client.stop).not.toHaveBeenCalled()
    release({ answer: 'Done.' })
    await expect(asking).resolves.toBe('Done.')
    await stopping

    expect(client.deleted).toEqual(['fork-1'])
    expect(client.stop).toHaveBeenCalledOnce()
    await expect(service.askSession('source', 'After?')).rejects.toMatchObject({ statusCode: 503 })
  })

  it('refuses empty, oversized, unknown and unsupported questions', async () => {
    const { client, service } = await fixture()
    await expect(service.askSession('source', '   ')).rejects.toMatchObject({ statusCode: 400 })
    await expect(service.askSession('source', 'x'.repeat(4_001))).rejects.toMatchObject({ statusCode: 400 })
    await expect(service.askSession('missing', 'Hello?')).rejects.toMatchObject({ statusCode: 404 })
    expect(client.forkRequests).toEqual([])

    const legacy = await fixture([], { fork: false })
    await expect(legacy.service.askSession('source', 'Hello?')).rejects.toMatchObject({ statusCode: 501 })
  })
})
