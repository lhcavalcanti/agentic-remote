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

  resolvePrompt(): void {
    this.resolveResponse?.(undefined)
  }

  async getEvents(): Promise<SessionEvent[]> {
    return []
  }

  async abort() {}
  async disconnect() {}
}

class FakeCopilotClient implements CopilotClientLike {
  readonly session = new DeferredSession()

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
    return []
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
    const service = new AgentService(store, client)
    await service.start()

    await service.createSession(directory)
    await service.sendMessage(client.session.sessionId, 'keep working')
    await service.deleteSession(client.session.sessionId)
    client.session.resolvePrompt()
    await new Promise((resolve) => setImmediate(resolve))

    expect(store.get(client.session.sessionId)).toBeUndefined()
    await service.stop()
  })
})
