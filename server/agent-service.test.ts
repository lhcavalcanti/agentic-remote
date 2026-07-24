import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type {
  AssistantMessageEvent,
  ResumeSessionConfig,
  SessionConfig,
  SessionEvent,
  SessionMetadata,
} from '@github/copilot-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
  messagesFromHistory,
} from './agent-service.js'
import { SessionStore } from './session-store.js'

class DeferredSession implements CopilotSessionLike {
  readonly sessionId = 'active-session'
  readonly sentPrompts: string[] = []
  readonly invokedCommands: string[] = []
  private readonly responseResolvers: Array<
    (value: AssistantMessageEvent | undefined) => void
  > = []
  readonly rpc = {
    commands: {
      list: async () => ({
        commands: [
          {
            name: 'model',
            description: 'Select model',
            kind: 'builtin' as const,
            allowDuringAgentExecution: false,
          },
          {
            name: 'usage',
            description: 'Show usage',
            kind: 'builtin' as const,
            allowDuringAgentExecution: true,
          },
          {
            name: 'plan',
            description: 'Create a plan',
            kind: 'builtin' as const,
            allowDuringAgentExecution: true,
          },
          {
            name: 'allow-all',
            aliases: ['yolo'],
            description: 'Enable all permissions',
            kind: 'builtin' as const,
            input: { hint: '[on|off|show]' },
            allowDuringAgentExecution: true,
          },
        ],
      }),
      invoke: async ({ name }: { name: string }) => {
        this.invokedCommands.push(name)
        if (name === 'plan') {
          return {
            kind: 'agent-prompt' as const,
            prompt: 'Create the requested plan',
            displayPrompt: '/plan',
          }
        }
        return {
          kind: 'text' as const,
          text: 'command output',
        }
      },
      enqueue: async () => ({ queued: true }),
    },
  }

  on(_handler: (event: SessionEvent) => void): () => void {
    return () => undefined
  }

  sendAndWait(content: string): Promise<AssistantMessageEvent | undefined> {
    this.sentPrompts.push(content)
    return new Promise((resolve) => {
      this.responseResolvers.push(resolve)
    })
  }

  resolvePrompt(response?: AssistantMessageEvent): void {
    this.responseResolvers.shift()?.(response)
  }

  async getEvents(): Promise<SessionEvent[]> {
    return []
  }

  async abort() {}
  async disconnect() {}
}

class FakeCopilotClient implements CopilotClientLike {
  readonly session = new DeferredSession()
  nextSessionList?: Promise<SessionMetadata[]>
  resumeError?: Error
  readonly createdConfigs: SessionConfig[] = []
  readonly rpc = {
    commands: {
      list: async () => this.session.rpc.commands.list(),
    },
  }

  async start() {}
  async stop(): Promise<Error[]> {
    return []
  }
  async createSession(config: SessionConfig): Promise<CopilotSessionLike> {
    this.createdConfigs.push(config)
    return this.session
  }
  async resumeSession(
    _sessionId: string,
    _config: ResumeSessionConfig,
  ): Promise<CopilotSessionLike> {
    if (this.resumeError) {
      throw this.resumeError
    }
    return this.session
  }
  async listSessions(): Promise<SessionMetadata[]> {
    return this.nextSessionList ?? []
  }
  async deleteSession() {}
}

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('AgentService deletion', () => {
  it('extracts visible prompts while hiding injected context messages', () => {
    const events = JSON.parse(`[
      {
        "type":"user.message",
        "id":"user-1",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{
          "content":"",
          "transformedContent":"<current_datetime>now</current_datetime>\\n\\nVisible prompt\\n\\n<system_reminder>hidden</system_reminder>"
        }
      },
      {
        "type":"user.message",
        "id":"user-2",
        "parentId":"user-1",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{
          "content":"<skill-context name=\\"internal\\">hidden</skill-context>"
        }
      },
      {
        "type":"user.message",
        "id":"user-3",
        "parentId":"user-2",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{"content":"Visible prompt"}
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({ role: 'user', content: 'Visible prompt' }),
    ])
  })

  it('ignores a prompt completion after its session was deleted', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const store = new SessionStore(path.join(directory, 'state'))
    const service = new AgentService(
      store,
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()

    await service.createSession(directory)
    await service.sendMessage(client.session.sessionId, 'keep working')
    await service.deleteSession(client.session.sessionId)
    client.session.resolvePrompt()
    await new Promise((resolve) => setImmediate(resolve))

    expect(store.get(client.session.sessionId)).toBeUndefined()
    await service.stop()
  })

  it('keeps UI-created sessions open across service restarts', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const stateDirectory = path.join(directory, 'state')
    const firstService = new AgentService(
      new SessionStore(stateDirectory),
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )
    await firstService.start()
    const created = await firstService.createSession(directory)
    await firstService.stop()

    const restartedService = new AgentService(
      new SessionStore(stateDirectory),
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )
    await restartedService.start()

    expect(restartedService.listSessions()).toEqual([
      expect.objectContaining({
        id: created.id,
        isOpen: true,
      }),
    ])
    await restartedService.stop()
  })

  it('recreates an empty managed session when Copilot cannot resume it', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    const sessionId = '12345678-aaaa-bbbb-cccc-123456789abc'
    await store.create(
      {
        id: sessionId,
        cwd: directory,
        title: 'Empty session',
        updatedAt: '2026-07-24T20:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true },
    )
    const client = new FakeCopilotClient()
    client.resumeError = new Error(`Session not found: ${sessionId}`)
    const service = new AgentService(
      store,
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()

    const activated = await service.activateSession(sessionId)

    expect(activated.id).toBe(sessionId)
    expect(client.createdConfigs.at(-1)).toMatchObject({
      sessionId,
      workingDirectory: directory,
    })
    await service.stop()
  })

  it('does not resurrect a deletion from an in-flight discovery snapshot', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const store = new SessionStore(path.join(directory, 'state'))
    const service = new AgentService(
      store,
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    await service.createSession(directory)

    let releaseSnapshot: (sessions: SessionMetadata[]) => void = () => undefined
    client.nextSessionList = new Promise((resolve) => {
      releaseSnapshot = resolve
    })
    const refresh = service.refreshDiscovery()
    await service.deleteSession(client.session.sessionId)
    releaseSnapshot([
      {
        sessionId: client.session.sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Stale deleted session',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    await refresh

    expect(store.get(client.session.sessionId)).toBeUndefined()
    await service.stop()
  })

  it('uses process metadata when an indexed session has no usable context', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const sessionId = '87654321-4321-4321-4321-cba987654321'
    client.nextSessionList = Promise.resolve([
      {
        sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Corrupted indexed session',
        isRemote: false,
      },
    ])
    const store = new SessionStore(path.join(directory, 'state'))
    const service = new AgentService(
      store,
      client,
      async () => [
        {
          id: sessionId,
          cwd: directory,
          title: 'Active Copilot session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
    )

    await service.start()

    expect(service.listSessions()).toEqual([
      expect.objectContaining({
        id: sessionId,
        cwd: directory,
        isOpen: true,
      }),
    ])
    await service.stop()
  })

  it('keeps discovered session titles concise', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.nextSessionList = Promise.resolve([
      {
        sessionId: '12345678-abcd-abcd-abcd-123456789abc',
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Explore Nightscout Documentation\n\nLong handoff content',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )

    await service.start()

    expect(service.listHistory()[0]?.title).toBe(
      'Explore Nightscout Documentation',
    )
    await service.stop()
  })

  it('synchronizes new persisted messages and tool activity', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const sessionId = 'abcdef12-3456-7890-abcd-ef1234567890'
    const client = new FakeCopilotClient()
    client.nextSessionList = Promise.resolve([
      {
        sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Synced session',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    let events = JSON.parse(`[
      {
        "type":"user.message",
        "id":"user-1",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{"content":"hello"}
      },
      {
        "type":"tool.execution_start",
        "id":"tool-start",
        "parentId":"user-1",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{"toolCallId":"call-1","toolName":"bash"}
      },
      {
        "type":"tool.execution_complete",
        "id":"tool-end",
        "parentId":"tool-start",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{"toolCallId":"call-1","success":true}
      }
    ]`) as SessionEvent[]
    const store = new SessionStore(path.join(directory, 'state'))
    const service = new AgentService(
      store,
      client,
      async () => [
        {
          id: sessionId,
          cwd: directory,
          title: 'Active',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => `events-${events.length}`,
    )
    await service.start()

    expect(store.get(sessionId)?.messages).toEqual([
      expect.objectContaining({ role: 'user', content: 'hello' }),
      expect.objectContaining({
        role: 'activity',
        content: 'Tool · Bash',
        activityStatus: 'completed',
      }),
    ])

    events = [
      ...events,
      ...messagesAsEvents([
        {
          type: 'assistant.message',
          id: 'assistant-1',
          timestamp: '2026-07-22T00:00:03.000Z',
          content: 'latest response',
        },
      ]),
    ]
    await service.refreshTranscripts()

    expect(store.get(sessionId)?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'latest response',
    })
    await service.stop()
  })

  it('does not overwrite a final SDK response with a stale event log', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const staleEvents = JSON.parse(`[
      {
        "type":"user.message",
        "id":"user-1",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{"content":"hello"}
      }
    ]`) as SessionEvent[]
    const store = new SessionStore(path.join(directory, 'state'))
    const service = new AgentService(
      store,
      client,
      async () => [],
      async () => undefined,
      async () => staleEvents,
      async () => 'stale-events',
    )
    await service.start()
    await service.createSession(directory)
    await service.sendMessage(client.session.sessionId, 'hello')
    const finalResponse = JSON.parse(`{
      "type":"assistant.message",
      "id":"assistant-event",
      "parentId":"user-1",
      "timestamp":"2026-07-22T00:00:02.000Z",
      "data":{"messageId":"assistant-1","content":"final answer"}
    }`) as AssistantMessageEvent
    client.session.resolvePrompt(finalResponse)
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (store.get(client.session.sessionId)?.status === 'idle') {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 5))
    }

    await service.refreshTranscripts()

    expect(store.get(client.session.sessionId)?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'final answer',
    })
    await service.stop()
  })

  it('processes queued prompts in FIFO order', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const store = new SessionStore(path.join(directory, 'state'))
    const service = new AgentService(
      store,
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    await service.createSession(directory)
    await service.sendMessage(client.session.sessionId, 'first')
    const queued = await service.sendMessage(
      client.session.sessionId,
      'second',
      true,
    )
    expect(queued.queuedCount).toBe(1)

    client.session.resolvePrompt()
    await Promise.resolve()
    await service.sendMessage(client.session.sessionId, 'third', true)
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (client.session.sentPrompts.length === 2) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 5))
    }

    expect(client.session.sentPrompts).toEqual(['first', 'second'])
    expect(store.get(client.session.sessionId)?.queuedCount).toBe(1)
    client.session.resolvePrompt()
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (client.session.sentPrompts.length === 3) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
    expect(client.session.sentPrompts).toEqual(['first', 'second', 'third'])
    expect(store.get(client.session.sessionId)?.queuedCount).toBe(0)
    client.session.resolvePrompt()
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (store.get(client.session.sessionId)?.status === 'idle') {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
    await service.stop()
  })

  it('runs safe commands immediately and requires unsafe commands to queue', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    await service.createSession(directory)
    await service.sendMessage(client.session.sessionId, 'working')

    await expect(
      service.executeCommand(client.session.sessionId, '/model gpt-5.6-sol'),
    ).rejects.toThrow('must be queued')
    await service.executeCommand(client.session.sessionId, '/usage')
    const planned = await service.executeCommand(
      client.session.sessionId,
      '/plan next',
    )
    expect(planned.queuedCount).toBe(1)
    expect(client.session.invokedCommands).toEqual(['usage', 'plan'])

    client.session.resolvePrompt()
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (client.session.sentPrompts.length === 2) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
    expect(client.session.sentPrompts).toEqual([
      'working',
      'Create the requested plan',
    ])
    client.session.resolvePrompt()
    await new Promise((resolve) => setTimeout(resolve, 10))
    await service.stop()
  })

  it('routes external-session prompts and aliases to the owning terminal', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.nextSessionList = Promise.resolve([
      {
        sessionId: client.session.sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'External session',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'External session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )
    await service.start()

    await service.sendMessage(client.session.sessionId, 'hello terminal')
    await service.executeCommand(
      client.session.sessionId,
      '/aa on',
    )

    expect(terminal.send).toHaveBeenNthCalledWith(
      1,
      client.session.sessionId,
      'hello terminal',
      false,
    )
    expect(terminal.send).toHaveBeenNthCalledWith(
      2,
      client.session.sessionId,
      '/allow-all on',
      false,
    )
    expect(client.session.sentPrompts).toEqual([])
    await service.stop()
  })
})

function messagesAsEvents(
  values: Array<{
    type: 'assistant.message'
    id: string
    timestamp: string
    content: string
  }>,
): SessionEvent[] {
  return JSON.parse(
    JSON.stringify(
      values.map((value) => ({
        type: value.type,
        id: value.id,
        parentId: null,
        timestamp: value.timestamp,
        data: {
          messageId: value.id,
          content: value.content,
        },
      })),
    ),
  ) as SessionEvent[]
}
