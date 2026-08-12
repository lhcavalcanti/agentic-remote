import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type {
  AssistantMessageEvent,
  ModelInfo,
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
  pendingUserInputFromEvents,
  runtimeInfoFromEvents,
} from './agent-service.js'
import { SessionStore } from './session-store.js'

class DeferredSession implements CopilotSessionLike {
  readonly sessionId = 'active-session'
  readonly sentPrompts: string[] = []
  disconnectCount = 0
  readonly invokedCommands: string[] = []
  readonly assignedNames: string[] = []
  readonly modeSwitches: string[] = []
  modeSetError?: Error
  readonly runtimeSwitches: Array<{
    modelId: string
    reasoningEffort?: string
    contextTier?: string
  }> = []
  private readonly responseResolvers: Array<
    (value: AssistantMessageEvent | undefined) => void
  > = []
  private readonly eventHandlers: Array<(event: SessionEvent) => void> = []
  readonly rpc = {
    model: {
      switchTo: async (input: {
        modelId: string
        reasoningEffort?: string
        contextTier?: string
      }) => {
        this.runtimeSwitches.push(input)
        return { modelId: input.modelId }
      },
    },
    name: {
      set: async ({ name }: { name: string }) => {
        this.assignedNames.push(name)
      },
    },
    mode: {
      set: async ({ mode }: { mode: string }) => {
        if (this.modeSetError) {
          throw this.modeSetError
        }
        this.modeSwitches.push(mode)
      },
    },
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

  on(handler: (event: SessionEvent) => void): () => void {
    this.eventHandlers.push(handler)
    return () => {
      const index = this.eventHandlers.indexOf(handler)
      if (index >= 0) {
        this.eventHandlers.splice(index, 1)
      }
    }
  }

  emit(event: SessionEvent): void {
    for (const handler of this.eventHandlers) {
      handler(event)
    }
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
  async disconnect() {
    this.disconnectCount += 1
  }
}

class FakeCopilotClient implements CopilotClientLike {
  readonly session = new DeferredSession()
  nextSessionList?: Promise<SessionMetadata[]>
  resumeError?: Error
  createError?: Error
  listModelsError?: Error
  models: ModelInfo[] = []
  readonly createdConfigs: SessionConfig[] = []
  readonly deletedSessionIds: string[] = []
  readonly resumedSessionIds: string[] = []
  stopErrors: Error[] = []
  readonly rpc = {
    commands: {
      list: async () => this.session.rpc.commands.list(),
    },
  }

  async start() {}
  async stop(): Promise<Error[]> {
    return this.stopErrors
  }
  async createSession(config: SessionConfig): Promise<CopilotSessionLike> {
    if (this.createError) {
      throw this.createError
    }
    this.createdConfigs.push(config)
    return this.session
  }
  async resumeSession(
    sessionId: string,
    _config: ResumeSessionConfig,
  ): Promise<CopilotSessionLike> {
    this.resumedSessionIds.push(sessionId)
    if (this.resumeError) {
      throw this.resumeError
    }
    return this.session
  }
  async listSessions(): Promise<SessionMetadata[]> {
    return this.nextSessionList ?? []
  }
  async listModels(): Promise<ModelInfo[]> {
    if (this.listModelsError) {
      throw this.listModelsError
    }
    return this.models
  }
  async deleteSession(sessionId: string) {
    this.deletedSessionIds.push(sessionId)
  }
}

const directories: string[] = []

function configurableModel(): ModelInfo {
  return {
    id: 'gpt-configurable',
    name: 'GPT Configurable',
    capabilities: {
      family: 'gpt-configurable',
      limits: {
        max_prompt_tokens: 100_000,
        max_context_window_tokens: 120_000,
      },
      supports: {
        vision: false,
        reasoningEffort: true,
      },
      tokenizer: 'o200k_base',
      type: 'chat',
    },
    billing: {
      tokenPrices: {
        inputPrice: 0,
        outputPrice: 0,
        batchSize: 1,
        maxPromptTokens: 50_000,
        longContext: {
          inputPrice: 0,
          outputPrice: 0,
          batchSize: 1,
          maxPromptTokens: 100_000,
        },
      },
    },
    supportedReasoningEfforts: ['medium', 'high'],
    defaultReasoningEffort: 'medium',
  } as ModelInfo
}

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
      },
      {
        "type":"user.message",
        "id":"agent-review",
        "parentId":"user-3",
        "timestamp":"2026-07-22T00:00:03.000Z",
        "data":{
          "source":"agent-session-id",
          "content":"Internal review request"
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({ role: 'user', content: 'Visible prompt' }),
    ])
  })

  it('keeps parallel tool states and fails leftovers when a turn aborts', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"start-a",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{"toolCallId":"a","toolName":"bash","arguments":{"command":"first"}}
      },
      {
        "type":"tool.execution_start",
        "id":"start-b",
        "parentId":"start-a",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{"toolCallId":"b","toolName":"view","arguments":{"path":"/tmp/file"}}
      },
      {
        "type":"tool.execution_complete",
        "id":"complete-b",
        "parentId":"start-b",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{"toolCallId":"b","success":true}
      },
      {
        "type":"abort",
        "id":"abort",
        "parentId":"complete-b",
        "timestamp":"2026-07-22T00:00:03.000Z",
        "data":{}
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:a',
        activityStatus: 'failed',
      }),
      expect.objectContaining({
        id: 'tool:b',
        activityStatus: 'completed',
      }),
    ])
  })

  it('renders successful task completion summaries as agent messages', () => {
    const events = JSON.parse(`[
      {
        "type":"assistant.message",
        "id":"empty-assistant",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{"messageId":"empty-assistant","content":""}
      },
      {
        "type":"tool.execution_start",
        "id":"task-start",
        "parentId":"empty-assistant",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{
          "toolCallId":"task-call",
          "toolName":"task_complete",
          "arguments":{"summary":"**Done.** The requested work is live."}
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"task-end",
        "parentId":"task-start",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{
          "toolCallId":"task-call",
          "success":true,
          "result":{"content":"**Done.** The requested work is live."}
        }
      },
      {
        "type":"session.task_complete",
        "id":"session-complete",
        "parentId":"task-end",
        "timestamp":"2026-07-22T00:00:02.100Z",
        "data":{}
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:task-call',
        role: 'assistant',
        content: '**Done.** The requested work is live.',
        activityStatus: undefined,
      }),
    ])
  })

  it('keeps failed task completion calls as failed activity', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"task-start",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{
          "toolCallId":"task-call",
          "toolName":"task_complete",
          "arguments":{"summary":"This should not be presented as complete."}
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"task-end",
        "parentId":"task-start",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{"toolCallId":"task-call","success":false}
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:task-call',
        role: 'activity',
        activityStatus: 'failed',
      }),
    ])
  })

  it('keeps successful non-completion tool results as activity', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"bash-start",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{
          "toolCallId":"bash-call",
          "toolName":"bash",
          "arguments":{"command":"pnpm test"}
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"bash-end",
        "parentId":"bash-start",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{
          "toolCallId":"bash-call",
          "success":true,
          "result":{"content":"All tests passed"}
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:bash-call',
        role: 'activity',
        content: 'Bash\n$ pnpm test',
        activityStatus: 'completed',
      }),
    ])
  })

  it('reconstructs only unresolved root ask-user requests', () => {
    const question = {
      type: 'tool.execution_start',
      id: 'ask-start',
      parentId: null,
      timestamp: '2026-07-22T00:00:00.000Z',
      data: {
        toolCallId: 'ask-call',
        toolName: 'ask_user',
        arguments: {
          question: 'Which goal matters most?',
          choices: ['Growth', 'Flexibility'],
        },
      },
    }
    expect(
      pendingUserInputFromEvents(
        JSON.parse(JSON.stringify([question])) as SessionEvent[],
      ),
    ).toEqual({
      requestId: 'persisted-user-input:ask-call',
      question: 'Which goal matters most?',
      choices: ['Growth', 'Flexibility'],
      allowFreeform: true,
    })
    expect(
      pendingUserInputFromEvents(
        JSON.parse(
          JSON.stringify([
            question,
            {
              type: 'tool.execution_complete',
              id: 'ask-complete',
              parentId: 'ask-start',
              timestamp: '2026-07-22T00:00:01.000Z',
              data: { toolCallId: 'ask-call', success: true },
            },
          ]),
        ) as SessionEvent[],
      ),
    ).toBeUndefined()
    expect(
      pendingUserInputFromEvents(
        JSON.parse(
          JSON.stringify([
            question,
            {
              type: 'user.message',
              id: 'answer',
              parentId: 'ask-start',
              timestamp: '2026-07-22T00:00:01.000Z',
              data: { content: 'Growth' },
            },
          ]),
        ) as SessionEvent[],
      ),
    ).toBeUndefined()
  })

  it('extracts model, effort, tier, and estimated context usage', () => {
    const events = JSON.parse(`[
      {
        "type":"session.resume",
        "id":"resume",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{
          "selectedModel":"gpt-test",
          "reasoningEffort":"medium",
          "contextTier":"long_context"
        }
      },
      {
        "type":"session.model_change",
        "id":"model",
        "parentId":"resume",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{
          "newModel":"gpt-test",
          "reasoningEffort":"high",
          "contextTier":"long_context"
        }
      },
      {
        "type":"session.compaction_start",
        "id":"context",
        "parentId":"model",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{
          "systemTokens":100,
          "conversationTokens":400,
          "toolDefinitionsTokens":50
        }
      },
      {
        "type":"session.mode_changed",
        "id":"mode",
        "parentId":"context",
        "timestamp":"2026-07-22T00:00:02.500Z",
        "data":{"previousMode":"interactive","newMode":"autopilot"}
      },
      {
        "type":"session.permissions_changed",
        "id":"permissions",
        "parentId":"mode",
        "timestamp":"2026-07-22T00:00:02.600Z",
        "data":{
          "previousAllowAllPermissions":false,
          "allowAllPermissions":true
        }
      },
      {
        "type":"user.message",
        "id":"prompt",
        "parentId":"context",
        "timestamp":"2026-07-22T00:00:03.000Z",
        "data":{"content":"12345678"}
      },
      {
        "type":"assistant.message",
        "id":"subagent",
        "agentId":"review-agent",
        "parentId":"prompt",
        "timestamp":"2026-07-22T00:00:04.000Z",
        "data":{
          "messageId":"subagent",
          "content":"Review result",
          "model":"lightweight-review-model"
        }
      }
    ]`) as SessionEvent[]

    expect(
      runtimeInfoFromEvents(
        events,
        undefined,
        new Map([
          [
            'gpt-test',
            { default: 1_000, long: 2_000, maximum: 3_000 },
          ],
        ]),
      ),
    ).toEqual({
      model: 'gpt-test',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      contextTokens: 552,
      contextTokenLimit: 2_000,
      contextEstimated: true,
      mode: 'autopilot',
      allowAllPermissions: true,
    })
  })

  it('preserves exact usage limits across later runtime events', () => {
      const previous = {
        model: 'gpt-test',
        contextTokens: 700,
        contextTokenLimit: 1_050,
        contextEstimated: false,
      }
      const events = JSON.parse(`[
        {
          "type":"assistant.message",
          "id":"assistant",
          "parentId":null,
          "timestamp":"2026-07-22T00:00:00.000Z",
          "data":{"messageId":"assistant","content":"Done","model":"gpt-test"}
        }
      ]`) as SessionEvent[]

      expect(
        runtimeInfoFromEvents(
          events,
          previous,
          new Map([
            ['gpt-test', { default: 800, long: 900, maximum: 1_000 }],
          ]),
          false,
        ),
      ).toMatchObject({
        contextTokens: 700,
        contextTokenLimit: 1_050,
        contextEstimated: false,
      })
  })

  it('reads model and effort from fresh session start events', () => {
      const events = JSON.parse(`[
        {
          "type":"session.start",
          "id":"start",
          "parentId":null,
          "timestamp":"2026-07-22T00:00:00.000Z",
          "data":{
            "sessionId":"session",
            "version":1,
            "producer":"copilot-agent",
            "copilotVersion":"1.0.75",
            "startTime":"2026-07-22T00:00:00.000Z",
            "selectedModel":"gpt-fresh",
            "reasoningEffort":"medium",
            "contextTier":"default",
            "context":{"cwd":"/tmp"}
          }
        }
      ]`) as SessionEvent[]

      expect(
        runtimeInfoFromEvents(events, undefined, new Map(), false),
      ).toMatchObject({
        model: 'gpt-fresh',
        reasoningEffort: 'medium',
        contextTier: 'default',
      })
  })

  it('continues startup when model limits are unavailable', async () => {
      const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
      directories.push(directory)
      const client = new FakeCopilotClient()
      client.listModelsError = new Error('models unavailable')
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const service = new AgentService(
        new SessionStore(path.join(directory, 'state')),
        client,
        async () => [],
        async () => undefined,
      )

      await service.start()

      expect(warning).toHaveBeenCalledWith(
        'Unable to load model context limits:',
        client.listModelsError,
      )
      warning.mockRestore()
      await service.stop()
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
    const firstClient = new FakeCopilotClient()
    const firstService = new AgentService(
      new SessionStore(stateDirectory),
      firstClient,
      async () => [],
      async () => undefined,
    )
    await firstService.start()
    const created = await firstService.createSession(directory)
    await firstService.stop()
    expect(firstClient.session.disconnectCount).toBe(1)

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

  it('allows the SDK post-cleanup runtime timeout during shutdown', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.stopErrors = [
      new Error(
        'Failed to gracefully shut down runtime: runtime.shutdown timed out after 10000ms',
      ),
    ]
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()

    await expect(service.stop()).resolves.toBeUndefined()
    expect(warning).toHaveBeenCalledWith(
      'Copilot SDK graceful shutdown timed out:',
      client.stopErrors[0]?.message,
    )
    warning.mockRestore()
  })

  it('clears SDK conversation history while keeping the session open', async () => {
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
    const created = await service.createSession(directory)
    await service.store.addMessage(created.id, {
      id: 'old-message',
      role: 'user',
      content: 'Remove this history',
      createdAt: new Date().toISOString(),
    })

    const cleared = await service.clearConversation(created.id)

    expect(cleared).toMatchObject({
      isOpen: true,
      messages: [],
      status: 'idle',
    })
    expect(cleared.id).not.toBe(created.id)
    expect(service.store.get(created.id)).toBeUndefined()
    expect(client.deletedSessionIds).toContain(created.id)
    expect(client.createdConfigs.at(-1)).toMatchObject({
      sessionId: cleared.id,
      workingDirectory: directory,
    })
    await service.stop()
  })

  it('restarts an SDK session without clearing history', async () => {
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
    const created = await service.createSession(directory)
    await service.store.addMessage(created.id, {
      id: 'kept-message',
      role: 'user',
      content: 'Keep this history',
      createdAt: new Date().toISOString(),
    })

    const restarted = await service.restartSession(created.id)

    expect(restarted.messages).toEqual([
      expect.objectContaining({ content: 'Keep this history' }),
    ])
    expect(client.resumedSessionIds).toContain(created.id)
    expect(client.deletedSessionIds).not.toContain(created.id)
    await service.stop()
  })

  it('handles SDK ask-user requests through the session UI state', async () => {
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
    const created = await service.createSession(directory)
    const handler = client.createdConfigs.at(-1)?.onUserInputRequest
    if (!handler) {
      throw new Error('User input handler was not configured')
    }

    const response = handler(
      {
        question: 'Which environment?',
        choices: ['Production', 'Staging'],
        allowFreeform: true,
      },
      { sessionId: created.id },
    )
    await vi.waitFor(() =>
      expect(service.store.get(created.id)?.pendingUserInput).toMatchObject({
        question: 'Which environment?',
        choices: ['Production', 'Staging'],
      }),
    )
    const requestId = service.store.get(created.id)?.pendingUserInput?.requestId
    if (!requestId) {
      throw new Error('User input request was not stored')
    }

    const updated = await service.replyUserInput(created.id, requestId, {
      answer: 'Staging',
      wasFreeform: false,
    })

    await expect(response).resolves.toEqual({
      answer: 'Staging',
      wasFreeform: false,
    })
    expect(updated.pendingUserInput).toBeUndefined()
    expect(updated.status).toBe('running')
    await service.stop()
  })

  it('defaults new SDK sessions to allow all and can require approval', async () => {
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

    const allowAll = await service.createSession(directory)
    const automaticHandler = client.createdConfigs.at(-1)?.onPermissionRequest
    if (!automaticHandler) {
      throw new Error('Permission handler was not configured')
    }
    expect(
      await automaticHandler(
        {
          kind: 'shell',
          fullCommandText: 'echo allowed',
          intention: 'Run an allowed command',
          commands: [],
          possiblePaths: [],
          possibleUrls: [],
          hasWriteFileRedirection: false,
          canOfferSessionApproval: false,
        },
        { sessionId: allowAll.id },
      ),
    ).toEqual({ kind: 'approve-once' })
    expect(allowAll.runtime?.allowAllPermissions).toBe(true)

    const guarded = await service.createSession(directory, false, false)
    const guardedHandler = client.createdConfigs.at(-1)?.onPermissionRequest
    if (!guardedHandler) {
      throw new Error('Guarded permission handler was not configured')
    }
    const response = guardedHandler(
      {
        kind: 'shell',
        fullCommandText: 'echo guarded',
        intention: 'Run a guarded command',
        commands: [],
        possiblePaths: [],
        possibleUrls: [],
        hasWriteFileRedirection: false,
        canOfferSessionApproval: false,
      },
      { sessionId: guarded.id },
    )
    await vi.waitFor(() =>
      expect(service.store.get(guarded.id)?.pendingPermission).toBeDefined(),
    )
    const request = service.store.get(guarded.id)?.pendingPermission
    if (!request) {
      throw new Error('Permission request was not stored')
    }
    await service.replyPermission(guarded.id, request.requestId, 'allow-once')
    await expect(response).resolves.toEqual({ kind: 'approve-once' })
    expect(guarded.runtime?.allowAllPermissions).toBe(false)

    await service.stop()
  })

  it('does not restore a stale transcript after clearing', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    let version: string | undefined
    let releaseEvents: (events: SessionEvent[]) => void = () => undefined
    let readerStarted: () => void = () => undefined
    const started = new Promise<void>((resolve) => {
      readerStarted = resolve
    })
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
      async () =>
        new Promise<SessionEvent[]>((resolve) => {
          readerStarted()
          releaseEvents = resolve
        }),
      async () => version,
    )
    await service.start()
    const created = await service.createSession(directory)
    await service.store.addMessage(created.id, {
      id: 'old-message',
      role: 'user',
      content: 'Old history',
      createdAt: '2026-07-25T22:00:00.000Z',
    })
    version = 'old-events'
    const refresh = service.refreshTranscripts()
    await started

    const clearing = service.clearConversation(created.id)
    releaseEvents(
      JSON.parse(`[
        {
          "type":"user.message",
          "id":"old-event",
          "parentId":null,
          "timestamp":"2026-07-25T22:00:00.000Z",
          "data":{"content":"Old history"}
        }
      ]`) as SessionEvent[],
    )
    const [, cleared] = await Promise.all([refresh, clearing])

    expect(service.store.get(created.id)).toBeUndefined()
    expect(service.store.get(cleared.id)?.messages).toEqual([])
    await service.stop()
  })

  it('keeps failed SDK clear state recoverable', async () => {
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
    const created = await service.createSession(directory)
    await service.store.addMessage(created.id, {
      id: 'old-message',
      role: 'user',
      content: 'Old history',
      createdAt: new Date().toISOString(),
    })
    client.createError = new Error('temporary create failure')

    const cleared = await service.clearConversation(created.id)
    expect(service.store.get(created.id)).toBeUndefined()
    expect(service.store.get(cleared.id)?.messages).toEqual([])

    client.createError = undefined
    client.resumeError = new Error(`Session not found: ${cleared.id}`)
    await expect(service.openSession(cleared.id)).resolves.toMatchObject({
      id: cleared.id,
      messages: [],
    })
    await service.stop()
  })

  it('resumes a persisted SDK queue after service restart', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const stateDirectory = path.join(directory, 'state')
    const client = new FakeCopilotClient()
    const store = new SessionStore(stateDirectory)
    await store.initialize()
    await store.create(
      {
        id: client.session.sessionId,
        cwd: directory,
        title: 'Queued SDK session',
        updatedAt: '2026-07-25T01:00:00.000Z',
        status: 'idle',
        isOpen: true,
        queuedCount: 1,
        queuedPrompts: [
          {
            id: 'persisted-queue',
            content: 'Resume after restart',
            createdAt: '2026-07-25T01:00:01.000Z',
          },
        ],
        messages: [],
      },
      { managedOpen: true },
    )
    const service = new AgentService(
      new SessionStore(stateDirectory),
      client,
      async () => [],
      async () => undefined,
    )

    await service.start()

    expect(client.session.sentPrompts).toEqual(['Resume after restart'])
    expect(
      service.store.get(client.session.sessionId)?.queuedCount ?? 0,
    ).toBe(0)
    client.session.resolvePrompt()
    await service.stop()
  })

  it('creates terminal-backed sessions without starting an SDK session', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const terminal = {
      create: vi.fn(async () => ({
        sessionName: '0',
        windowId: '@10',
      })),
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      rename: vi.fn(async () => true),
      configure: vi.fn(async () => true),
      restart: vi.fn(async () => true),
      reset: vi.fn(
        async (
          _sessionId: string,
          _replacementId: string,
          _cwd: string,
          _runtime: unknown,
          clearState: () => Promise<void>,
        ) => {
          await clearState()
          return true
        },
      ),
    }
    let activeSessionId = ''
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () =>
        activeSessionId
          ? [
              {
                id: activeSessionId,
                cwd: directory,
                title: 'Active Copilot session',
                updatedAt: new Date().toISOString(),
              },
            ]
          : [],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )
    await service.start()

    const created = await service.createSession(directory, true)
    activeSessionId = created.id
    client.nextSessionList = Promise.resolve([
      {
        sessionId: created.id,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Automatic project name',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    await service.refreshDiscovery()
    expect(terminal.rename).toHaveBeenCalledWith(
      created.id,
      'Automatic project name',
    )

    expect(terminal.create).toHaveBeenCalledWith(
      created.id,
      directory,
      path.basename(directory),
      true,
    )
    expect(client.createdConfigs).toEqual([])
    expect(service.listSessions()).toEqual([
      expect.objectContaining({ id: created.id, isOpen: true }),
    ])
    const guarded = await service.createSession(directory, true, false)
    expect(terminal.create).toHaveBeenCalledWith(
      guarded.id,
      directory,
      path.basename(directory),
      false,
    )
    const renamed = await service.renameSession(created.id, 'Renamed terminal')
    expect(renamed.title).toBe('Renamed terminal')
    expect(terminal.rename).toHaveBeenCalledWith(
      created.id,
      'Renamed terminal',
    )
    const configured = await service.configureRuntime(created.id, {
      model: 'gpt-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'autopilot',
    })
    expect(terminal.configure).toHaveBeenCalledWith(created.id, directory, {
      model: 'gpt-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'autopilot',
    })
    expect(configured.runtime).toMatchObject({
      model: 'gpt-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      contextTokenLimit: 100_000,
      mode: 'autopilot',
    })
    await service.store.addMessage(created.id, {
      id: 'terminal-history',
      role: 'user',
      content: 'Clear terminal history',
      createdAt: new Date().toISOString(),
    })
    const restarted = await service.restartSession(created.id)
    expect(terminal.restart).toHaveBeenCalledWith(created.id, directory)
    expect(restarted.messages).toEqual([
      expect.objectContaining({ content: 'Clear terminal history' }),
    ])
    const cleared = await service.clearConversation(created.id)
    expect(terminal.reset).toHaveBeenCalledWith(
      created.id,
      cleared.id,
      directory,
      {
        model: 'gpt-configurable',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      },
      expect.any(Function),
    )
    expect(cleared.id).not.toBe(created.id)
    expect(cleared.messages).toEqual([])
    expect(client.deletedSessionIds).toContain(created.id)
    await service.stop()
  })

  it('recreates previously open terminal sessions during boot', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const sessionId = 'abcdef12-3456-7890-abcd-ef1234567890'
    const stateDirectory = path.join(directory, 'state')
    const store = new SessionStore(stateDirectory)
    await store.initialize()
    await store.create(
      {
        id: sessionId,
        cwd: directory,
        title: 'Recovered terminal',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
        runtime: {
          allowAllPermissions: false,
          model: 'gpt-configurable',
          reasoningEffort: 'high',
          contextTier: 'long_context',
          mode: 'autopilot',
        },
      },
      { managedOpen: true, backend: 'terminal' },
    )
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    client.nextSessionList = Promise.resolve([
      {
        sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Recovered terminal',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    let terminalActive = false
    const terminal = {
      create: vi.fn(async () => {
        terminalActive = true
        return { sessionName: 'agentic-remote', windowId: '@20' }
      }),
      has: vi.fn(async () => terminalActive),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      rename: vi.fn(async () => true),
    }
    const service = new AgentService(
      store,
      client,
      async () =>
        terminalActive
          ? [
              {
                id: sessionId,
                cwd: directory,
                title: 'Recovered terminal',
                updatedAt: new Date().toISOString(),
              },
            ]
          : [],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )

    await service.start()

    expect(terminal.create).toHaveBeenCalledWith(
      sessionId,
      directory,
      'Recovered terminal',
      false,
      expect.objectContaining({
        model: 'gpt-configurable',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      }),
    )
    expect(client.resumedSessionIds).toEqual([])
    expect(service.listSessions()).toEqual([
      expect.objectContaining({
        id: sessionId,
        isOpen: true,
        status: 'idle',
      }),
    ])
    await service.stop()
  })

  it('continues boot recovery when one terminal probe fails', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const stateDirectory = path.join(directory, 'state')
    const store = new SessionStore(stateDirectory)
    await store.initialize()
    const firstId = '11111111-1111-1111-1111-111111111111'
    const secondId = '22222222-2222-2222-2222-222222222222'
    for (const [id, title, updatedAt] of [
      [firstId, 'Broken terminal', '2026-07-22T00:00:00.000Z'],
      [secondId, 'Healthy terminal', '2026-07-22T00:00:01.000Z'],
    ]) {
      await store.create(
        {
          id,
          cwd: directory,
          title,
          updatedAt,
          status: 'idle',
          isOpen: true,
          messages: [],
        },
        { managedOpen: true, backend: 'terminal' },
      )
    }
    const client = new FakeCopilotClient()
    client.nextSessionList = Promise.resolve([])
    const active = new Set<string>()
    const terminal = {
      create: vi.fn(async (sessionId: string) => {
        active.add(sessionId)
        return { sessionName: 'agentic-remote', windowId: '@21' }
      }),
      has: vi.fn(async (sessionId: string) => {
        if (sessionId === firstId) {
          throw new Error('tmux probe failed')
        }
        return active.has(sessionId)
      }),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      rename: vi.fn(async () => true),
    }
    const service = new AgentService(
      store,
      client,
      async () =>
        [...active].map((id) => ({
          id,
          cwd: directory,
          title: id === firstId ? 'Broken terminal' : 'Healthy terminal',
          updatedAt: new Date().toISOString(),
        })),
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )

    await expect(service.start()).resolves.toBeUndefined()

    expect(terminal.create).toHaveBeenCalledTimes(1)
    expect(terminal.create).toHaveBeenCalledWith(
      secondId,
      directory,
      'Healthy terminal',
      true,
      undefined,
    )
    expect(service.store.get(firstId)).toMatchObject({
      status: 'error',
      activity: 'Boot recovery failed',
    })
    expect(service.store.get(secondId)).toMatchObject({
      status: 'idle',
      isOpen: true,
    })
    await service.stop()
  })

  it('renames SDK sessions through Copilot and persists the title', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory)

    const renamed = await service.renameSession(created.id, 'Renamed SDK')

    expect(client.session.assignedNames).toEqual(['Renamed SDK'])
    expect(renamed.title).toBe('Renamed SDK')
    const options = await service.runtimeOptions(created.id)
    expect(options.models[0]).toMatchObject({
      id: 'gpt-configurable',
      reasoningEfforts: ['medium', 'high'],
      contextTiers: ['default', 'long_context'],
      contextTokenLimits: {
        default: 50_000,
        long_context: 100_000,
      },
    })
    const configured = await service.configureRuntime(created.id, {
      model: 'gpt-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'plan',
    })
    expect(client.session.runtimeSwitches).toEqual([
      {
        modelId: 'gpt-configurable',
        reasoningEffort: 'high',
        contextTier: 'long_context',
      },
    ])
    expect(client.session.modeSwitches).toEqual(['plan'])
    expect(configured.runtime?.model).toBe('gpt-configurable')
    expect(configured.runtime?.mode).toBe('plan')

    client.session.modeSetError = new Error('Mode unavailable')
    await expect(
      service.configureRuntime(created.id, {
        model: 'gpt-configurable',
        reasoningEffort: 'medium',
        contextTier: 'default',
        mode: 'autopilot',
      }),
    ).rejects.toThrow('Mode unavailable')
    expect(service.store.get(created.id)?.runtime).toMatchObject({
      model: 'gpt-configurable',
      reasoningEffort: 'medium',
      contextTier: 'default',
      mode: 'plan',
    })
    await service.stop()
  })

  it('keeps a terminal launch open across an in-flight discovery snapshot', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    let launchedSessionId = ''
    const terminal = {
      create: vi.fn(async (sessionId: string) => {
        launchedSessionId = sessionId
        return { sessionName: '0', windowId: '@11' }
      }),
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      rename: vi.fn(async () => true),
    }
    const activeSessions = async () =>
      launchedSessionId
        ? [
            {
              id: launchedSessionId,
              cwd: directory,
              title: 'Active Copilot session',
              updatedAt: new Date().toISOString(),
            },
          ]
        : []
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      activeSessions,
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )
    await service.start()
    let releaseSnapshot: (sessions: SessionMetadata[]) => void = () => undefined
    client.nextSessionList = new Promise((resolve) => {
      releaseSnapshot = resolve
    })
    const refresh = service.refreshDiscovery()
    await new Promise((resolve) => setImmediate(resolve))

    const created = await service.createSession(directory, true)
    releaseSnapshot([])
    await refresh
    await service.openSession(created.id)

    expect(service.listSessions()).toEqual([
      expect.objectContaining({ id: created.id, isOpen: true }),
    ])
    expect(client.resumedSessionIds).toEqual([])
    await service.stop()
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
    const sessionId = randomUUID()
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
        "data":{
          "toolCallId":"call-1",
          "toolName":"bash",
          "arguments":{
            "description":"Run checks",
            "command":"pnpm test"
          }
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"tool-end",
        "parentId":"tool-start",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{"toolCallId":"call-1","success":true}
      },
      {
        "type":"tool.execution_start",
        "id":"tool-start-2",
        "parentId":"tool-end",
        "timestamp":"2026-07-22T00:00:03.000Z",
        "data":{
          "toolCallId":"call-2",
          "toolName":"view",
          "arguments":{"path":"/tmp/project.ts"}
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"tool-end-2",
        "parentId":"tool-start-2",
        "timestamp":"2026-07-22T00:00:04.000Z",
        "data":{"toolCallId":"call-2","success":false}
      },
      {
        "type":"session.context_changed",
        "id":"context-change",
        "parentId":"tool-end-2",
        "timestamp":"2026-07-22T00:00:04.500Z",
        "data":{"cwd":"/tmp/changed-project"}
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
      async () => `events-${events.length}-${events.at(-1)?.id}`,
      {
        has: async () => false,
        send: async () => false,
        cancel: async () => false,
      },
    )
    await service.start()

    expect(store.get(sessionId)?.messages).toEqual([
      expect.objectContaining({ role: 'user', content: 'hello' }),
      expect.objectContaining({
        role: 'activity',
        content: 'Bash · Run checks\n$ pnpm test',
        activityStatus: 'completed',
      }),
      expect.objectContaining({
        role: 'activity',
        content: 'View\n/tmp/project.ts',
        activityStatus: 'failed',
      }),
    ])
    expect(store.get(sessionId)?.cwd).toBe('/tmp/changed-project')
    await service.refreshDiscovery()
    expect(store.get(sessionId)?.cwd).toBe('/tmp/changed-project')

    events = [
      ...events.filter((event) => event.type !== 'session.context_changed'),
      ...messagesAsEvents([
        {
          type: 'assistant.message',
          id: 'assistant-1',
          timestamp: '2026-07-22T00:00:05.000Z',
          content: 'latest response',
        },
      ]),
    ]
    await service.refreshTranscripts()

    expect(store.get(sessionId)?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'latest response',
    })
    expect(store.get(sessionId)?.cwd).toBe('/tmp/changed-project')
    await service.stop()
  })

  it('synchronizes external workspace metadata without transcript events', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const sessionId = 'abcdef12-1111-2222-3333-ef1234567890'
    const client = new FakeCopilotClient()
    client.nextSessionList = Promise.resolve([
      {
        sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Creation title',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    let workspace = {
      cwd: '/tmp/first-cwd',
      title: 'First workspace title',
      updatedAt: '2026-07-26T04:00:00.000Z',
    }
    let workspaceVersion = 'workspace-1'
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      rename: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
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
      async () => [],
      async () => undefined,
      terminal,
      async () => workspace,
      async () => workspaceVersion,
    )

    await service.start()

    expect(service.store.get(sessionId)).toMatchObject({
      cwd: '/tmp/first-cwd',
      title: 'First workspace title',
    })
    workspace = {
      cwd: '/tmp/second-cwd',
      title: 'Second workspace title',
      updatedAt: '2026-07-26T04:00:01.000Z',
    }
    workspaceVersion = 'workspace-2'
    await service.refreshTranscripts()
    await service.refreshDiscovery()
    expect(service.store.get(sessionId)).toMatchObject({
      cwd: '/tmp/second-cwd',
      title: 'Second workspace title',
    })
    expect(terminal.rename).toHaveBeenCalledWith(
      sessionId,
      'Second workspace title',
    )
    await service.stop()
  })

  it('streams each SDK tool call as a separate detailed activity', async () => {
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
    const created = await service.createSession(directory)
    const start = (id: string, toolName: string, args: object) =>
      JSON.parse(
        JSON.stringify({
          type: 'tool.execution_start',
          id: `start-${id}`,
          parentId: null,
          timestamp: new Date().toISOString(),
          data: { toolCallId: id, toolName, arguments: args },
        }),
      ) as SessionEvent
    const complete = (id: string, success: boolean) =>
      JSON.parse(
        JSON.stringify({
          type: 'tool.execution_complete',
          id: `complete-${id}`,
          parentId: `start-${id}`,
          timestamp: new Date().toISOString(),
          data: { toolCallId: id, success },
        }),
      ) as SessionEvent

    client.session.emit(
      start('call-a', 'bash', {
        description: 'Run unit tests',
        command: 'pnpm test',
      }),
    )
    client.session.emit(
      start('call-b', 'view', { path: '/tmp/source.ts' }),
    )
    client.session.emit(complete('call-a', true))
    client.session.emit(complete('call-b', false))
    await vi.waitFor(() =>
      expect(
        service.store
          .get(created.id)
          ?.messages.filter((message) => message.role === 'activity'),
      ).toHaveLength(2),
    )

    expect(
      service.store
        .get(created.id)
        ?.messages.filter((message) => message.role === 'activity'),
    ).toEqual([
      expect.objectContaining({
        id: 'tool:call-a',
        content: 'Bash · Run unit tests\n$ pnpm test',
        activityStatus: 'completed',
      }),
      expect.objectContaining({
        id: 'tool:call-b',
        content: 'View\n/tmp/source.ts',
        activityStatus: 'failed',
      }),
    ])

    await service.sendMessage(created.id, 'finish the task')
    client.session.emit(
      start('task-call', 'task_complete', {
        summary: '**Complete.** The live result is visible.',
      }),
    )
    client.session.emit(
      JSON.parse(
        JSON.stringify({
          type: 'tool.execution_complete',
          id: 'complete-task-call',
          parentId: 'start-task-call',
          timestamp: new Date().toISOString(),
          data: {
            toolCallId: 'task-call',
            success: true,
            result: {
              content: '**Complete.** The live result is visible.',
            },
          },
        }),
      ) as SessionEvent,
    )
    await vi.waitFor(() =>
      expect(service.store.get(created.id)?.messages.at(-1)).toMatchObject({
        role: 'assistant',
        content: '**Complete.** The live result is visible.',
        streaming: false,
      }),
    )
    expect(
      service.store
        .get(created.id)
        ?.messages.some((message) => message.id === 'tool:task-call'),
    ).toBe(false)
    client.session.resolvePrompt()

    client.session.emit(
      JSON.parse(`{
        "type":"session.context_changed",
        "id":"cwd-change",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:05.000Z",
        "data":{"cwd":"/tmp/live-project"}
      }`) as SessionEvent,
    )
    client.session.emit(
      JSON.parse(`{
        "type":"session.title_changed",
        "id":"title-change",
        "parentId":"cwd-change",
        "timestamp":"2026-07-22T00:00:06.000Z",
        "ephemeral":true,
        "data":{"title":"Live project"}
      }`) as SessionEvent,
    )
    client.session.emit(
      JSON.parse(`{
        "type":"session.mode_changed",
        "id":"mode-change",
        "parentId":"title-change",
        "timestamp":"2026-07-22T00:00:07.000Z",
        "data":{"previousMode":"interactive","newMode":"plan"}
      }`) as SessionEvent,
    )
    client.session.emit(
      JSON.parse(`{
        "type":"session.permissions_changed",
        "id":"permissions-change",
        "parentId":"mode-change",
        "timestamp":"2026-07-22T00:00:08.000Z",
        "data":{
          "previousAllowAllPermissions":false,
          "allowAllPermissions":true
        }
      }`) as SessionEvent,
    )
    await vi.waitFor(() =>
      expect(service.store.get(created.id)).toMatchObject({
        cwd: '/tmp/live-project',
        title: 'Live project',
        runtime: {
          mode: 'plan',
          allowAllPermissions: true,
        },
      }),
    )
    await new Promise((resolve) => setTimeout(resolve, 20))
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

  it('removes a selected queued prompt before it runs', async () => {
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
    await service.sendMessage(client.session.sessionId, 'first')
    const withSecond = await service.sendMessage(
      client.session.sessionId,
      'second',
      true,
    )
    const withThird = await service.sendMessage(
      client.session.sessionId,
      'third',
      true,
    )
    const second = withSecond.queuedPrompts?.[0]
    expect(second).toBeDefined()
    expect(withThird.queuedPrompts?.map((prompt) => prompt.content)).toEqual([
      'second',
      'third',
    ])

    const removed = await service.removeQueuedPrompt(
      client.session.sessionId,
      second!.id,
    )
    expect(removed.prompt.content).toBe('second')
    expect(removed.session.queuedPrompts?.map((prompt) => prompt.content)).toEqual(
      ['third'],
    )
    client.session.resolvePrompt()
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (client.session.sentPrompts.length === 2) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
    expect(client.session.sentPrompts).toEqual(['first', 'third'])
    client.session.resolvePrompt()
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
    await service.executeCommand(
      client.session.sessionId,
      '/usage',
      true,
    )
    await service.sendMessage(
      client.session.sessionId,
      'queued while idle',
      true,
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
    expect(terminal.send).toHaveBeenNthCalledWith(
      3,
      client.session.sessionId,
      '/usage',
      false,
    )
    expect(terminal.send).toHaveBeenNthCalledWith(
      4,
      client.session.sessionId,
      'queued while idle',
      false,
    )
    expect(
      service.store.get(client.session.sessionId)?.queuedCount ?? 0,
    ).toBe(0)
    expect(client.session.sentPrompts).toEqual([])
    await service.stop()
  })

  it('holds terminal queues in the app and sends the next prompt when idle', async () => {
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
    let eventVersion: string | undefined
    let events: SessionEvent[] = []
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
          title: 'Active Copilot session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => eventVersion,
      terminal,
    )
    await service.start()
    await service.store.updateStatus(client.session.sessionId, 'running')

    const queued = await service.sendMessage(
      client.session.sessionId,
      'first terminal prompt',
      true,
    )
    await service.executeCommand(
      client.session.sessionId,
      '/usage',
      true,
    )
    expect(queued.queuedPrompts?.[0]?.content).toBe(
      'first terminal prompt',
    )
    expect(terminal.send).not.toHaveBeenCalled()

    const firstIdleAt = queued.queuedPrompts?.[0]?.createdAt
    expect(firstIdleAt).toBeDefined()
    events = JSON.parse(
      JSON.stringify([
        {
          type: 'session.idle',
          id: 'idle-event',
          parentId: null,
          timestamp: firstIdleAt,
          data: {},
        },
      ]),
    ) as SessionEvent[]
    eventVersion = 'events-v1'
    await service.refreshTranscripts()

    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      'first terminal prompt',
      false,
    )
    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'running',
      queuedCount: 1,
      queuedPrompts: [{ content: '/usage' }],
    })

    events = JSON.parse(
      JSON.stringify([
        ...events,
        {
          type: 'user.message',
          id: 'queued-user-event',
          parentId: 'idle-event',
          timestamp: new Date(Date.now() + 1_000).toISOString(),
          data: { content: 'first terminal prompt' },
        },
      ]),
    ) as SessionEvent[]
    eventVersion = 'events-v2'
    await service.refreshTranscripts()
    expect(terminal.send).toHaveBeenCalledTimes(1)
    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'running',
      queuedCount: 1,
    })

    events = JSON.parse(
      JSON.stringify([
        ...events,
        {
          type: 'session.idle',
          id: 'second-idle-event',
          parentId: 'queued-user-event',
          timestamp: new Date(Date.now() + 2_000).toISOString(),
          data: {},
        },
      ]),
    ) as SessionEvent[]
    eventVersion = 'events-v3'
    await service.refreshTranscripts()
    expect(terminal.send).toHaveBeenLastCalledWith(
      client.session.sessionId,
      '/usage',
      false,
    )
    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'running',
      queuedCount: 0,
      queuedPrompts: [],
    })
    await service.stop()
  })

  it('keeps explicit terminal enqueue requests in the app when status is stale-idle', async () => {
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
    let eventVersion: string | undefined = 'events-v1'
    let events = JSON.parse(
      JSON.stringify([
        {
          type: 'session.idle',
          id: 'stale-idle-event',
          parentId: null,
          timestamp: new Date(Date.now() - 1_000).toISOString(),
          data: {},
        },
      ]),
    ) as SessionEvent[]
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
          title: 'Active Copilot session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => eventVersion,
      terminal,
    )
    await service.start()
    await service.store.updateStatus(client.session.sessionId, 'running')

    const queued = await service.sendMessage(
      client.session.sessionId,
      'queued during stale idle',
      true,
    )
    expect(queued.queuedPrompts?.map((prompt) => prompt.content)).toEqual([
      'queued during stale idle',
    ])
    expect(terminal.send).not.toHaveBeenCalled()

    await service.refreshTranscripts()
    expect(terminal.send).not.toHaveBeenCalled()
    expect(service.store.get(client.session.sessionId)).toMatchObject({
      queuedCount: 1,
      queuedPrompts: [{ content: 'queued during stale idle' }],
    })

    events = JSON.parse(
      JSON.stringify([
        ...events,
        {
          type: 'session.idle',
          id: 'fresh-idle-event',
          parentId: null,
          timestamp: new Date(Date.now() + 1_000).toISOString(),
          data: {},
        },
      ]),
    ) as SessionEvent[]
    eventVersion = 'events-v2'
    await service.refreshTranscripts()

    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      'queued during stale idle',
      false,
    )
    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'running',
      queuedCount: 0,
      queuedPrompts: [],
    })
    await service.stop()
  })

  it('detects and answers terminal ask-user requests', async () => {
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
    const request = {
      requestId: 'terminal:question',
      question: 'Choose a color',
      choices: ['Red', 'Blue'],
      allowFreeform: true,
    }
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      pendingUserInput: vi.fn(async () => request),
      replyUserInput: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Active Copilot session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )

    await service.start()

    expect(
      service.store.get(client.session.sessionId)?.pendingUserInput,
    ).toEqual(request)
    const updated = await service.replyUserInput(
      client.session.sessionId,
      request.requestId,
      { answer: 'Blue', wasFreeform: false },
    )
    expect(terminal.replyUserInput).toHaveBeenCalledWith(
      client.session.sessionId,
      request,
      'Blue',
      false,
    )
    expect(updated.pendingUserInput).toBeUndefined()
    const checksAfterReply = terminal.pendingUserInput.mock.calls.length
    await new Promise((resolve) => setTimeout(resolve, 2_100))
    await service.refreshTranscripts()
    expect(
      service.store.get(client.session.sessionId)?.pendingUserInput,
    ).toBeUndefined()
    expect(terminal.pendingUserInput.mock.calls.length).toBe(
      checksAfterReply + 1,
    )
    await service.stop()
  })

  it('recovers and answers a persisted SDK ask-user request', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const events = JSON.parse(`[
      {
        "type":"user.message",
        "id":"prompt",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{"content":"Help prioritize my goals"}
      },
      {
        "type":"tool.execution_start",
        "id":"ask-start",
        "parentId":"prompt",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{
          "toolCallId":"ask-call",
          "toolName":"ask_user",
          "arguments":{
            "question":"Which goal matters most?",
            "choices":["Growth","Flexibility"]
          }
        }
      }
    ]`) as SessionEvent[]
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
      async () => events,
      async () => 'persisted-question-v1',
    )

    await service.start()
    await service.createSession(directory)
    await service.refreshTranscripts()

    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'waiting',
      pendingUserInput: {
        requestId: 'persisted-user-input:ask-call',
        question: 'Which goal matters most?',
      },
    })
    const answered = await service.replyUserInput(
      client.session.sessionId,
      'persisted-user-input:ask-call',
      { answer: 'Growth', wasFreeform: false },
    )
    expect(answered.pendingUserInput).toBeUndefined()
    expect(client.session.sentPrompts).toEqual(['Growth'])
    client.session.resolvePrompt()
    await vi.waitFor(() =>
      expect(service.store.get(client.session.sessionId)?.status).toBe('idle'),
    )
    await service.stop()
  })

  it('detects and answers terminal permission requests', async () => {
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
    const request = {
      requestId: 'terminal-permission:request',
      title: 'Check DNS and credential presence',
      kind: 'terminal',
      options: [
        { optionId: 'terminal:allow', name: 'Yes', kind: 'allow_once' },
        { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
      ],
    }
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      pendingPermission: vi.fn(async () => request),
      replyPermission: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Active Copilot session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )

    await service.start()

    expect(
      service.store.get(client.session.sessionId)?.pendingPermission,
    ).toEqual(request)
    expect(service.store.get(client.session.sessionId)?.status).toBe('waiting')
    const updated = await service.replyPermission(
      client.session.sessionId,
      request.requestId,
      'terminal:allow',
    )
    expect(terminal.replyPermission).toHaveBeenCalledWith(
      client.session.sessionId,
      request,
      'terminal:allow',
    )
    expect(updated.pendingPermission).toBeUndefined()
    const checksAfterReply = terminal.pendingPermission.mock.calls.length
    await new Promise((resolve) => setTimeout(resolve, 2_100))
    await service.refreshTranscripts()
    expect(
      service.store.get(client.session.sessionId)?.pendingPermission,
    ).toBeUndefined()
    expect(terminal.pendingPermission.mock.calls.length).toBe(
      checksAfterReply + 1,
    )
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
