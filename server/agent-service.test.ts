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
import { afterEach, describe, expect, it } from 'vitest'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
} from './agent-service.js'
import { SessionStore } from './session-store.js'

class DeferredSession implements CopilotSessionLike {
  readonly sessionId = 'active-session'
  private resolveResponse?: (value: AssistantMessageEvent | undefined) => void

  on(_handler: (event: SessionEvent) => void): () => void {
    return () => undefined
  }

  sendAndWait(): Promise<AssistantMessageEvent | undefined> {
    return new Promise((resolve) => {
      this.resolveResponse = resolve
    })
  }

  resolvePrompt(response?: AssistantMessageEvent): void {
    this.resolveResponse?.(response)
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

  async start() {}
  async stop(): Promise<Error[]> {
    return []
  }
  async createSession(_config: SessionConfig): Promise<CopilotSessionLike> {
    return this.session
  }
  async resumeSession(
    _sessionId: string,
    _config: ResumeSessionConfig,
  ): Promise<CopilotSessionLike> {
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
