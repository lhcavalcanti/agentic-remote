import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
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
import type { UserInputForm } from '../shared/contracts.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
  messagesFromHistory,
  pendingUserInputFromEvents,
  runtimeInfoFromEvents,
  statusFromEvents,
  terminalFormSteps,
} from './agent-service.js'
import type {
  CopilotTaskInfo,
  CopilotTaskProgress,
} from './background-task-adapter.js'
import { SessionStore } from './session-store.js'
import { parseTerminalPermission } from './terminal-session.js'

class DeferredSession implements CopilotSessionLike {
  readonly sessionId: string

  constructor(sessionId = 'active-session') {
    this.sessionId = sessionId
  }
  readonly backgroundTasks: CopilotTaskInfo[] = []
  readonly taskProgress = new Map<string, CopilotTaskProgress>()
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
  currentRuntime: {
    modelId: string
    reasoningEffort?: string
    contextTier?: 'default' | 'long_context'
  } = {
    modelId: 'fixture-default',
    reasoningEffort: 'medium',
    contextTier: 'default' as const,
  }
  private readonly responseResolvers: Array<
    (value: AssistantMessageEvent | undefined) => void
  > = []
  private readonly eventHandlers: Array<(event: SessionEvent) => void> = []
  readonly rpc = {
    model: {
      getCurrent: async () => ({ ...this.currentRuntime }),
      switchTo: async (input: {
        modelId: string
        reasoningEffort?: string
        contextTier?: string
      }) => {
        this.runtimeSwitches.push(input)
        this.currentRuntime = {
          modelId: input.modelId,
          reasoningEffort:
            input.reasoningEffort || this.currentRuntime.reasoningEffort,
          contextTier:
            input.contextTier === 'long_context' ? 'long_context' : 'default',
        }
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
    tasks: {
      list: async () => ({ tasks: this.backgroundTasks }),
      getProgress: async ({ id }: { id: string }) => ({
        progress: this.taskProgress.get(id),
      }),
      cancel: async ({ id }: { id: string }) => {
        const task = this.backgroundTasks.find((entry) => entry.id === id)
        if (!task) {
          return { cancelled: false }
        }
        task.status = 'cancelled'
        task.completedAt = new Date().toISOString()
        return { cancelled: true }
      },
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
  listModelsCalls = 0
  models: ModelInfo[] = []
  readonly createdConfigs: SessionConfig[] = []
  readonly deletedSessionIds: string[] = []
  readonly resumedSessionIds: string[] = []
  stopErrors: Error[] = []
  readonly rpc = {
    commands: {
      list: async () => this.session.rpc.commands.list(),
    },
    models: {
      list: vi.fn(async () => {
        this.listModelsCalls += 1
        if (this.listModelsError) {
          throw this.listModelsError
        }
        return { models: this.models }
      }),
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
    this.listModelsCalls += 1
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
    id: 'fixture-configurable',
    name: 'Configurable Model',
    capabilities: {
      family: 'fixture-configurable',
      limits: {
        max_prompt_tokens: 100_000,
        max_context_window_tokens: 120_000,
      },
      supports: {
        vision: false,
        reasoningEffort: true,
      },
      tokenizer: 'fixture-tokenizer',
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
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

// Sessions are confined to the home directory; these fixtures run in tmpdir.
beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', tmpdir())
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

  it('fails unfinished tools when a session shuts down', () => {
    const events = JSON.parse(`[
      {
        "type":"assistant.turn_start",
        "id":"turn-start",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{"turnId":"turn"}
      },
      {
        "type":"tool.execution_start",
        "id":"tool-start",
        "parentId":"turn-start",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{"toolCallId":"call","toolName":"bash","arguments":{"command":"pnpm build"}}
      },
      {
        "type":"session.shutdown",
        "id":"shutdown",
        "parentId":"tool-start",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{"shutdownType":"routine"}
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:call',
        activityStatus: 'failed',
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
        activityResult: 'Error: tool failed; inspect the session log',
        activityDurationMs: 1_000,
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
        activityResult: 'All tests passed',
        activityDurationMs: 1_000,
      }),
    ])
  })

  it('groups activity beneath a skill and preserves failed results', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"skill-start",
        "parentId":null,
        "timestamp":"2026-08-28T00:00:00.000Z",
        "data":{
          "toolCallId":"skill-call",
          "toolName":"skill",
          "arguments":{"skill":"service-inventory"}
        }
      },
      {
        "type":"tool.execution_start",
        "id":"mcp-start",
        "parentId":"skill-start",
        "timestamp":"2026-08-28T00:00:01.000Z",
        "data":{
          "toolCallId":"mcp-call",
          "parentToolCallId":"skill-call",
          "toolName":"mcp:configuration-service-search_config_keys",
          "mcpServerName":"configuration-service",
          "mcpToolName":"search_config_keys",
          "arguments":{"query":"cache"}
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"mcp-end",
        "parentId":"mcp-start",
        "timestamp":"2026-08-28T00:00:03.500Z",
        "data":{
          "toolCallId":"mcp-call",
          "success":false,
          "result":{"content":"404 operation not found"}
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:skill-call',
        activityKind: 'skill',
      }),
      expect.objectContaining({
        id: 'tool:mcp-call',
        activityKind: 'tool',
        content: expect.stringContaining('MCP · Configuration Service · Search Config Keys'),
        activityGroupId: 'tool:skill-call',
        activityResult: 'Error: 404 operation not found',
        activityDurationMs: 2_500,
      }),
    ])
  })

  it('includes sub-agent tool calls beneath their agent heading', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"agent-start",
        "parentId":null,
        "timestamp":"2026-08-28T00:00:00.000Z",
        "data":{
          "toolCallId":"agent-call",
          "toolName":"task",
          "arguments":{
            "agent_type":"rubber-duck",
            "description":"Review the cache path"
          }
        }
      },
      {
        "type":"tool.execution_start",
        "id":"child-start",
        "agentId":"rubber-duck-1",
        "parentId":"agent-start",
        "timestamp":"2026-08-28T00:00:01.000Z",
        "data":{
          "toolCallId":"child-call",
          "parentToolCallId":"agent-call",
          "toolName":"read",
          "arguments":{"path":"cache.md"}
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"child-end",
        "agentId":"rubber-duck-1",
        "parentId":"child-start",
        "timestamp":"2026-08-28T00:00:02.000Z",
        "data":{
          "toolCallId":"child-call",
          "success":true,
          "result":{"content":"12 lines read"}
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:agent-call',
        activityKind: 'agent',
      }),
      expect.objectContaining({
        id: 'tool:child-call',
        activityGroupId: 'tool:agent-call',
        activityResult: '12 lines read',
        activityDurationMs: 1_000,
      }),
    ])
  })

  it('uses tool ownership instead of chronological event links for grouping', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"skill-start",
        "parentId":null,
        "timestamp":"2026-08-28T00:00:00.000Z",
        "data":{
          "toolCallId":"skill-call",
          "toolName":"skill",
          "arguments":{"skill":"service-inventory"}
        }
      },
      {
        "type":"tool.execution_start",
        "id":"unrelated-start",
        "parentId":"skill-start",
        "timestamp":"2026-08-28T00:00:01.000Z",
        "data":{
          "toolCallId":"unrelated-call",
          "toolName":"read",
          "arguments":{"path":"README.md"}
        }
      },
      {
        "type":"tool.execution_start",
        "id":"agent-start",
        "parentId":"unrelated-start",
        "timestamp":"2026-08-28T00:00:02.000Z",
        "data":{
          "toolCallId":"agent-call",
          "toolName":"task",
          "arguments":{"agent_type":"reviewer"}
        }
      },
      {
        "type":"subagent.started",
        "id":"subagent-start",
        "agentId":"reviewer-1",
        "parentId":"agent-start",
        "timestamp":"2026-08-28T00:00:03.000Z",
        "data":{
          "toolCallId":"agent-call",
          "agentName":"reviewer",
          "agentDisplayName":"Reviewer",
          "agentDescription":"Review the change"
        }
      },
      {
        "type":"tool.execution_start",
        "id":"child-start",
        "agentId":"reviewer-1",
        "parentId":"subagent-start",
        "timestamp":"2026-08-28T00:00:04.000Z",
        "data":{
          "toolCallId":"child-call",
          "toolName":"read",
          "arguments":{"path":"src/App.tsx"}
        }
      },
      {
        "type":"tool.execution_start",
        "id":"nested-skill-start",
        "agentId":"reviewer-1",
        "parentId":"child-start",
        "timestamp":"2026-08-28T00:00:05.000Z",
        "data":{
          "toolCallId":"nested-skill-call",
          "parentToolCallId":"agent-call",
          "toolName":"skill",
          "arguments":{"skill":"agentic-remote-navigation"}
        }
      },
      {
        "type":"tool.execution_start",
        "id":"nested-child-start",
        "agentId":"reviewer-1",
        "parentId":"nested-skill-start",
        "timestamp":"2026-08-28T00:00:06.000Z",
        "data":{
          "toolCallId":"nested-child-call",
          "parentToolCallId":"nested-skill-call",
          "toolName":"read",
          "arguments":{"path":"docs/app-spec.md"}
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:skill-call',
        activityGroupId: undefined,
      }),
      expect.objectContaining({
        id: 'tool:unrelated-call',
        activityGroupId: undefined,
      }),
      expect.objectContaining({
        id: 'tool:agent-call',
        activityGroupId: undefined,
      }),
      expect.objectContaining({
        id: 'tool:child-call',
        activityGroupId: 'tool:agent-call',
      }),
      expect.objectContaining({
        id: 'tool:nested-skill-call',
        activityGroupId: 'tool:agent-call',
      }),
      expect.objectContaining({
        id: 'tool:nested-child-call',
        activityGroupId: 'tool:nested-skill-call',
      }),
    ])
  })

  it('shows the skill name in skill activity titles', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"skill-start",
        "parentId":null,
        "timestamp":"2026-08-28T00:00:00.000Z",
        "data":{
          "toolCallId":"skill-call",
          "toolName":"skill",
          "arguments":{"skill":"agentic-remote-navigation"}
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:skill-call',
        content: 'Skill (agentic-remote-navigation)',
        activityStatus: 'running',
      }),
    ])
  })

  it('labels MCP tool activity with its server and operation', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"mcp-start",
        "parentId":null,
        "timestamp":"2026-08-28T00:00:00.000Z",
        "data":{
          "toolCallId":"mcp-call",
          "toolName":"github-mcp-server-search_repositories",
          "toolTitle":"Search repositories",
          "mcpServerName":"github-mcp-server",
          "mcpToolName":"search_repositories",
          "arguments":{"query":"agentic-remote"}
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:mcp-call',
        content: 'MCP · GitHub · Search Repositories\nagentic-remote',
        activityStatus: 'running',
      }),
    ])
  })

  it('names the background agent that keeps a turn open', () => {
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"task-start",
        "parentId":null,
        "timestamp":"2026-08-28T00:00:00.000Z",
        "data":{
          "toolCallId":"task-call",
          "toolName":"task",
          "arguments":{
            "agent_type":"rubber-duck",
            "description":"Final cache RCA review",
            "prompt":"Review the artifact"
          }
        }
      }
    ]`) as SessionEvent[]

    expect(messagesFromHistory(events)).toEqual([
      expect.objectContaining({
        id: 'tool:task-call',
        content: 'Agent (rubber-duck) · Final cache RCA review',
        activityStatus: 'running',
      }),
    ])
  })

  it('leaves a suspended task panel alone instead of starting the session', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-panel-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    await store.create(
      {
        id: 'resting-sdk',
        cwd: '/tmp/project',
        title: 'Resting project',
        updatedAt: '2026-09-02T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'sdk' },
    )
    await store.setSuspended('resting-sdk', true)
    const service = new AgentService(
      store,
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )

    // The panel asks for every session as the app loads, so asking must not
    // be what starts the runtime up again.
    await expect(
      service.listBackgroundTasks('resting-sdk'),
    ).resolves.toMatchObject({ tasks: [] })
  })

  it('refuses to suspend a session that still owns background work', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-busy-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    client.session.backgroundTasks.push({
      type: 'shell',
      id: 'shell-1',
      description: 'pnpm dev',
      status: 'running',
      startedAt: '2026-09-02T00:00:00.000Z',
      executionMode: 'background',
    })

    // A detached shell holds no foreground, so idle says nothing about it.
    // Ending the owner would abandon it, or leave it running behind a session
    // reporting that nothing is.
    await expect(service.suspendSession(created.id)).rejects.toThrow(
      /background tasks finish/,
    )
    expect(service.getSession(created.id)?.suspended).toBeFalsy()
  })

  it('refuses to suspend when work is detached while the check is under way', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-late-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)

    // The runtime is asked for its tasks before the awaits that put it down,
    // and a detached shell can be started inside those awaits. It holds no
    // foreground, so the idleness check that follows does not see it, and the
    // suspension used to go ahead and abandon it.
    let asked = 0
    const tasks = client.session.rpc.tasks
    const originalList = tasks.list
    tasks.list = async () => {
      asked += 1
      if (asked > 1) {
        client.session.backgroundTasks.push({
          type: 'shell',
          id: 'shell-late',
          description: 'pnpm build',
          status: 'running',
          startedAt: '2026-09-02T00:00:00.000Z',
          executionMode: 'background',
        })
      }
      return originalList()
    }

    await expect(service.suspendSession(created.id)).rejects.toThrow(
      /background tasks finish/,
    )
    expect(service.getSession(created.id)?.suspended).toBeFalsy()
  })

  it('leaves a suspended session listed even if the pane is seen to go first', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-open-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    await store.create(
      {
        id: 'closing-session',
        cwd: '/tmp/project',
        title: 'Closing project',
        updatedAt: '2026-09-02T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )

    // Killing the pane is what a discovery pass reads as the session being
    // gone, and it can land between the kill and the flag being written.
    await store.setOpen('closing-session', false, true)
    const suspended = await store.setSuspended('closing-session', true)

    // Suspended is put down on purpose, not found missing. Left closed, it
    // dropped out of the list with nothing able to bring it back.
    expect(suspended).toMatchObject({ suspended: true, isOpen: true })
  })

  it('suspends a session that has never been opened', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-cold-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    await store.create(
      {
        id: 'cold-session',
        cwd: directory,
        title: 'Cold project',
        updatedAt: '2026-09-02T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'sdk' },
    )
    const service = new AgentService(
      store,
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )

    // Nothing is attached, so there is no runtime holding background work and
    // none to ask. Asking anyway reached `ensureLoaded`, which refuses while a
    // suspension is under way, so the session could not be put down at all.
    await expect(service.suspendSession('cold-session')).resolves.toMatchObject(
      { id: 'cold-session', suspended: true },
    )
  })

  it('restarts a queue left standing by a drain that failed', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-drain-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    // A queue left standing by a drain that failed: the prompt is back on the
    // queue and the session is idle, with nothing running to take it off.
    await service.store.enqueuePrompt(created.id, {
      id: 'waiting-1',
      content: 'the one that was waiting',
      createdAt: '2026-09-02T00:00:00.000Z',
    })

    // A drain that failed puts its prompt back and leaves nothing running to
    // take it off again. Every message written afterwards joined the queue
    // behind it, and all of them stayed there.
    await service.sendMessage(created.id, 'written afterwards')

    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('the one that was waiting')
    })
  })

  it('refuses competing lifecycle work while a suspension is under way', async () => {
    // Suspending reads background tasks and puts the runtime down, and both
    // are awaited. Only refusing other suspensions during that window lets a
    // restart or a clear attach a live runtime behind the suspension, or lets
    // the suspension take down work that has only just started.
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-race-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)

    let releaseTasks: () => void = () => {}
    const held = new Promise<void>((resolve) => {
      releaseTasks = resolve
    })
    const listBackgroundTasks = service.listBackgroundTasks.bind(service)
    vi.spyOn(service, 'listBackgroundTasks').mockImplementation(async (id) => {
      await held
      return listBackgroundTasks(id)
    })

    const suspending = service.suspendSession(created.id)
    // The session is not yet recorded as suspended: it is only reserved.
    expect(service.getSession(created.id)?.suspended).toBeFalsy()

    // A send is refused outright: it is not lifecycle work and must not start
    // a turn into a session on its way down.
    await expect(
      service.sendMessage(created.id, 'slip through', false),
    ).rejects.toThrow(/Resume the session/)

    // Lifecycle work waits its turn rather than interleaving with the
    // teardown, and finds the session suspended when it gets there.
    const restarting = service.restartSession(created.id)
    const clearing = service.clearConversation(created.id)

    releaseTasks()
    await suspending
    expect(service.getSession(created.id)?.suspended).toBe(true)
    await expect(restarting).rejects.toThrow(/Resume the session/)
    await expect(clearing).rejects.toThrow(/Resume the session/)
    await service.stop()
  })

  it('does not suspend out from under a prompt already on its way', async () => {
    // The store still says idle until the turn is recorded, so a suspension
    // that only reads the stored status can put the runtime down underneath a
    // prompt that has already been handed to it.
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-race2-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    let releaseSend: () => void = () => {}
    const held = new Promise<void>((resolve) => {
      releaseSend = resolve
    })
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        await held
        return true
      }),
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

    const sending = service.sendMessage(
      client.session.sessionId,
      'already on its way',
      false,
    )
    await vi.waitFor(() => expect(terminal.send).toHaveBeenCalled())

    await expect(
      service.suspendSession(client.session.sessionId),
    ).rejects.toThrow(/only be suspended while idle/)

    releaseSend()
    await sending.catch(() => undefined)
    await service.stop()
  })

  it('keeps the reservation while a second send is still on its way', async () => {
    // Two sends can overlap. Marked with a flag rather than counted, the first
    // to finish cleared it while the second was still awaiting delivery, and
    // suspension saw an idle session with nothing holding it.
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-hold-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const gates: (() => void)[] = []
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(
        async () =>
          new Promise<boolean>((resolve) => {
            gates.push(() => resolve(true))
          }),
      ),
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

    const first = service.sendMessage(client.session.sessionId, 'one', false)
    const second = service.sendMessage(client.session.sessionId, 'two', false)
    await vi.waitFor(() => expect(gates.length).toBe(2))

    // The first finishes; the second is still on its way.
    gates[0]()
    await first.catch(() => undefined)

    await expect(
      service.suspendSession(client.session.sessionId),
    ).rejects.toThrow(/only be suspended while idle/)

    gates[1]()
    await second.catch(() => undefined)
    await service.stop()
  })

  it('keeps a suspended terminal session when it is opened', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-suspend-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    await store.create(
      {
        id: 'resting-session',
        cwd: '/tmp/project',
        title: 'Resting project',
        updatedAt: '2026-09-02T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.setSuspended('resting-session', true)
    const service = new AgentService(
      store,
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )

    // A suspended session has no window on purpose. Taking that as proof it
    // is gone would close it, drop it from recovery, and lose it for good.
    await expect(service.openSession('resting-session')).resolves.toMatchObject(
      { id: 'resting-session', suspended: true },
    )
    expect(store.get('resting-session')).toMatchObject({ isOpen: true })
    expect(
      store.terminalRecoverySessions().map((session) => session.id),
    ).toEqual([])
  })

  it('lists, updates, and cancels SDK background tasks independently of session status', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tasks-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    let taskEventCount = 0
    service.on('event', (event) => {
      if (event.type === 'session.tasks.updated') {
        taskEventCount += 1
      }
    })

    await service.start()
    const created = await service.createSession(directory, false)
    client.session.backgroundTasks.push({
      type: 'agent',
      id: 'task-1',
      description: 'Inspect the repository',
      status: 'running',
      startedAt: '2026-08-31T18:00:00.000Z',
      agentType: 'explore',
      executionMode: 'background',
    })
    client.session.taskProgress.set('task-1', {
      type: 'agent',
      latestIntent: 'Reading source files',
      recentActivity: [
        {
          message: '▸ view',
          timestamp: '2026-08-31T18:00:01.000Z',
        },
      ],
    })

    await expect(service.listBackgroundTasks(created.id)).resolves.toMatchObject({
      runningCount: 1,
      supported: true,
      tasks: [
        {
          id: 'task-1',
          status: 'running',
          progress: { latestIntent: 'Reading source files' },
        },
      ],
    })
    expect(taskEventCount).toBeGreaterThan(0)

    await expect(
      service.cancelBackgroundTask(created.id, 'task-1'),
    ).resolves.toMatchObject({
      runningCount: 0,
      tasks: [{ id: 'task-1', status: 'cancelled', canCancel: false }],
    })
    await service.stop()
  })

  it('treats legacy and JSON-RPC unsupported task methods as unavailable', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-task-compat-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    let taskListError: unknown = new Error(
      'Unhandled method session.tasks.list',
    )
    client.session.rpc.tasks!.list = async () => {
      throw taskListError
    }

    await expect(service.listBackgroundTasks(created.id)).resolves.toEqual({
      tasks: [],
      runningCount: 0,
      supported: false,
    })

    taskListError = Object.assign(new Error('Request failed'), { code: -32601 })
    await expect(service.listBackgroundTasks(created.id)).resolves.toEqual({
      tasks: [],
      runningCount: 0,
      supported: false,
    })
    await service.stop()
  })

  it('keeps terminal foreground status idle while a background task runs', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-terminal-task-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const completedAt = new Date(Date.now() + 1_000).toISOString()
    const events = [
      {
        type: 'tool.execution_start',
        id: 'task-start',
        parentId: null,
        timestamp: new Date(Date.now() - 1_000).toISOString(),
        data: {
          toolCallId: 'task-call',
          toolName: 'task',
          arguments: {
            agent_type: 'explore',
            description: 'Inspect the repository',
            prompt: 'Find the relevant files',
          },
        },
      },
      {
        type: 'assistant.turn_end',
        id: 'turn-end',
        parentId: 'task-start',
        timestamp: completedAt,
        data: {},
      },
      {
        type: 'assistant.turn_start',
        id: 'background-turn',
        parentId: 'turn-end',
        timestamp: new Date(Date.parse(completedAt) + 1_000).toISOString(),
        data: {
          agentId: 'agent-1',
        },
      },
    ] as SessionEvent[]
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
          title: 'Terminal session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'terminal-task-events',
      terminal,
    )

    await service.start()
    await service.store.updateStatus(client.session.sessionId, 'running')

    const options = await service.runtimeOptions(client.session.sessionId)

    expect(options.status).toBe('idle')
    await expect(
      service.listBackgroundTasks(client.session.sessionId),
    ).resolves.toMatchObject({
      runningCount: 1,
      tasks: [
        expect.objectContaining({
          id: 'task-call',
          executionMode: 'background',
          status: 'running',
        }),
      ],
    })
    expect(service.store.get(client.session.sessionId)?.status).toBe('idle')
    await service.stop()
  })

  it('refuses to cancel a task projected from a terminal session', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-terminal-cancel-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    // agent_idle is the projection path that marks a task cancellable.
    const events = [
      {
        type: 'system.notification',
        id: 'agent-idle',
        parentId: null,
        timestamp: new Date(Date.now() - 1_000).toISOString(),
        data: {
          kind: {
            type: 'agent_idle',
            agentId: 'agent-1',
            description: 'Inspect the repository',
          },
        },
      },
    ] as unknown as SessionEvent[]
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
          title: 'Terminal session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'terminal-cancel-events',
      terminal,
    )
    await service.start()

    const snapshot = await service.listBackgroundTasks(client.session.sessionId)

    // Projected from an event log, so there is no channel to cancel through.
    expect(snapshot.tasks.length).toBeGreaterThan(0)
    for (const task of snapshot.tasks) {
      expect(task.canCancel).toBe(false)
    }

    await expect(
      service.cancelBackgroundTask(client.session.sessionId, 'agent-1'),
    ).rejects.toThrow('cannot be cancelled')

    // The live CLI still owns the session: cancelling must not have attached
    // an SDK owner by resuming or creating one.
    expect(client.resumedSessionIds).not.toContain(client.session.sessionId)
    expect(client.createdConfigs).toHaveLength(0)
    await service.stop()
  })

  it('does not resume a finished terminal turn for background task activity', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-terminal-continuation-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    const request = {
      requestId: 'terminal:question',
      question: 'Choose a color',
      choices: ['Red', 'Blue'],
      allowFreeform: false,
    }
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      pendingUserInput: vi.fn(
        async (): Promise<typeof request | undefined> => request,
      ),
      replyUserInput: vi.fn(async () => true),
    }
    const events = [
      {
        type: 'assistant.turn_end',
        id: 'completed-turn',
        parentId: null,
        timestamp: new Date(Date.now() - 1_000).toISOString(),
        data: {},
      },
      {
        type: 'subagent.started',
        id: 'background-start',
        parentId: 'completed-turn',
        timestamp: new Date(Date.now() + 60_000).toISOString(),
        agentId: 'agent-1',
        data: {
          agentType: 'explore',
          agentName: 'explore',
          agentDescription: 'Inspect the repository',
          toolCallId: 'task-call',
        },
      },
    ] as SessionEvent[]
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Terminal session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'terminal-continuation-events',
      terminal,
    )

    await service.start()
    const updated = await service.replyUserInput(
      client.session.sessionId,
      request.requestId,
      { answer: 'Blue', wasFreeform: false },
    )

    // The finished turn is not resumed: no activity is shown and the request
    // is cleared. The session still reads as running because the background
    // agent it launched has not finished, which is its own state rather than
    // a continuation of the answered turn.
    expect(updated).toMatchObject({
      status: 'running',
      activity: undefined,
      pendingUserInput: undefined,
    })
    await service.stop()
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

  it('reconstructs structured ask-user forms from the current CLI schema', () => {
    const question = {
      type: 'tool.execution_start',
      id: 'structured-ask-start',
      parentId: null,
      timestamp: '2026-08-28T17:49:20.845Z',
      data: {
        toolCallId: 'structured-ask-call',
        toolName: 'ask_user',
        arguments: {
          message: 'What should I inspect?',
          requestedSchema: {
            properties: {
              target: {
                type: 'string',
                title: 'Inspection target',
                description: 'Repository or behavior to inspect.',
              },
              scope: {
                type: 'string',
                title: 'Scope',
                oneOf: [
                  { const: 'worktree', title: 'Current worktree' },
                  { const: 'code', title: 'Code behavior' },
                ],
              },
              includeHistory: {
                type: 'boolean',
                title: 'Include history',
                default: true,
              },
              areas: {
                type: 'array',
                title: 'Areas',
                items: {
                  type: 'string',
                  enum: ['server', 'web'],
                },
                minItems: 1,
              },
            },
          },
        },
      },
    }

    expect(
      pendingUserInputFromEvents(
        JSON.parse(JSON.stringify([question])) as SessionEvent[],
      ),
    ).toMatchObject({
      requestId: 'persisted-user-input:structured-ask-call',
      question: 'What should I inspect?',
      choices: [],
      allowFreeform: false,
      form: {
        fields: [
          {
            name: 'target',
            title: 'Inspection target',
            type: 'string',
            required: false,
          },
          {
            name: 'scope',
            title: 'Scope',
            type: 'string',
            required: false,
            options: [
              { value: 'worktree', label: 'Current worktree' },
              { value: 'code', label: 'Code behavior' },
            ],
          },
          {
            name: 'includeHistory',
            type: 'boolean',
            default: true,
          },
          {
            name: 'areas',
            type: 'array',
            options: [
              { value: 'server', label: 'server' },
              { value: 'web', label: 'web' },
            ],
          },
        ],
      },
    })
  })

  it('extracts model, effort, tier, and estimated context usage', () => {
    const events = JSON.parse(`[
      {
        "type":"session.resume",
        "id":"resume",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{
          "selectedModel":"fixture-test",
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
          "newModel":"fixture-test",
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
            'fixture-test',
            { default: 1_000, long: 2_000, maximum: 3_000 },
          ],
        ]),
      ),
    ).toEqual({
      model: 'fixture-test',
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
        model: 'fixture-test',
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
          "data":{"messageId":"assistant","content":"Done","model":"fixture-test"}
        }
      ]`) as SessionEvent[]

      expect(
        runtimeInfoFromEvents(
          events,
          previous,
          new Map([
            ['fixture-test', { default: 800, long: 900, maximum: 1_000 }],
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
            "selectedModel":"fixture-fresh",
            "reasoningEffort":"medium",
            "contextTier":"default",
            "context":{"cwd":"/tmp"}
          }
        }
      ]`) as SessionEvent[]

      expect(
        runtimeInfoFromEvents(events, undefined, new Map(), false),
      ).toMatchObject({
        model: 'fixture-fresh',
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
        'Unable to load runtime models:',
        client.listModelsError,
      )
      client.listModelsError = undefined
      client.models = [configurableModel()]
      const created = await service.createSession(directory)
      await expect(service.runtimeOptions(created.id)).resolves.toMatchObject({
        models: [expect.objectContaining({ id: 'fixture-configurable' })],
      })
      expect(client.listModelsCalls).toBe(2)
      warning.mockRestore()
      await service.stop()
  })

  it('reconciles stale terminal status before returning runtime options', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
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
    const completionAt = new Date(Date.now() + 1_000).toISOString()
    const events = [
      {
        type: 'assistant.turn_end',
        id: 'completed-turn',
        parentId: null,
        timestamp: completionAt,
        data: {},
      },
    ] as SessionEvent[]
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
      async () => events,
      async () => 'events-v1',
      terminal,
    )
    await service.start()
    await service.store.updateStatus(client.session.sessionId, 'running')

    const options = await service.runtimeOptions(client.session.sessionId)

    expect(options.status).toBe('idle')
    expect(service.store.get(client.session.sessionId)?.status).toBe('idle')
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

  it('settles outstanding writes before stop resolves', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const stateDirectory = path.join(directory, 'state')
    const store = new SessionStore(stateDirectory)
    const service = new AgentService(
      store,
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    await service.createSession(directory)
    await service.sendMessage(client.session.sessionId, 'keep working')

    // Resolve the prompt without awaiting it, so a write is still settling.
    client.session.resolvePrompt()
    await service.stop()

    // Once stop() has resolved, removing the directory must not race a write.
    await rm(stateDirectory, { recursive: true, force: true })
    const failures: unknown[] = []
    const onUnhandled = (reason: unknown) => failures.push(reason)
    process.on('unhandledRejection', onUnhandled)
    try {
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(failures).toEqual([])
      expect(existsSync(stateDirectory)).toBe(false)
    } finally {
      process.off('unhandledRejection', onUnhandled)
    }
  })

  it('reports a failed prompt write instead of raising an unhandled rejection', async () => {
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

    const errors: string[] = []
    service.on('event', (event) => {
      if (event.type === 'error') {
        errors.push(event.message)
      }
    })
    const unhandled: unknown[] = []
    const onUnhandled = (reason: unknown) => unhandled.push(reason)
    process.on('unhandledRejection', onUnhandled)

    try {
      await service.createSession(directory)
      await service.sendMessage(client.session.sessionId, 'keep working')

      // The state directory disappearing mid-prompt is what happens when a
      // write outlives its data directory; runPrompt persists from its own
      // completion and failure paths, and it is dispatched fire-and-forget.
      vi.spyOn(store, 'updateIf').mockRejectedValue(
        new Error('state directory is gone'),
      )
      client.session.resolvePrompt()
      for (let attempt = 0; attempt < 100 && errors.length === 0; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      expect(errors).toContain('state directory is gone')
      expect(unhandled).toEqual([])
    } finally {
      process.off('unhandledRejection', onUnhandled)
      vi.restoreAllMocks()
      await service.stop()
    }
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

    const removals: unknown[] = []
    service.on('event', (event) => {
      if (event.type === 'session.removed') {
        removals.push(event)
      }
    })

    const cleared = await service.clearConversation(created.id)

    expect(cleared).toMatchObject({
      isOpen: true,
      messages: [],
      status: 'idle',
    })
    expect(cleared.id).not.toBe(created.id)
    // Clearing replaces a session rather than deleting it. Saying so is what
    // lets every client move its state across instead of discarding it.
    expect(removals).toEqual([
      { type: 'session.removed', sessionId: created.id, replacedBy: cleared.id },
    ])
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
    expect(service['activePrompts'].has(created.id)).toBe(false)
    expect(updated.status).toBe('idle')
    await service.stop()
  })

  it('reconstructs ask-user forms from assistant tool requests', () => {
    const event = {
      type: 'assistant.message',
      id: 'assistant-message',
      parentId: null,
      timestamp: '2026-08-31T05:51:08.872Z',
      data: {
        messageId: 'assistant-message',
        content: '',
        toolRequests: [
          {
            toolCallId: 'assistant-ask-call',
            name: 'ask_user',
            arguments: {
              message: 'Authorize the prepared replacement',
              requestedSchema: {
                properties: {
                  confirm: {
                    type: 'boolean',
                    title: 'Confirm replacement',
                    default: false,
                  },
                },
              },
            },
          },
        ],
      },
    } as SessionEvent

    expect(pendingUserInputFromEvents([event])).toMatchObject({
      requestId: 'persisted-user-input:assistant-ask-call',
      question: 'Authorize the prepared replacement',
      form: {
        fields: [
          {
            name: 'confirm',
            title: 'Confirm replacement',
            type: 'boolean',
            default: false,
          },
        ],
      },
    })
  })

  it('handles SDK elicitation forms through the session UI state', async () => {
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
    const handler = client.createdConfigs.at(-1)?.onElicitationRequest
    if (!handler) {
      throw new Error('Elicitation handler was not configured')
    }

    const values = {
      target: 'agentic remote setup',
      scope: 'code',
      includeHistory: true,
      areas: ['server'],
    }
    const response = handler({
      sessionId: created.id,
      message: 'What should I inspect?',
      mode: 'form',
      requestedSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            title: 'Inspection target',
          },
          scope: {
            type: 'string',
            title: 'Scope',
            oneOf: [
              { const: 'worktree', title: 'Current worktree' },
              { const: 'code', title: 'Code behavior' },
            ],
          },
          includeHistory: {
            type: 'boolean',
            title: 'Include history',
            default: true,
          },
          areas: {
            type: 'array',
            title: 'Areas',
            items: {
              type: 'string',
              enum: ['server', 'web'],
            },
            minItems: 1,
          },
        },
        required: ['target', 'scope'],
      },
    })
    await vi.waitFor(() => {
      const pending = service.store.get(created.id)?.pendingUserInput
      expect(pending?.question).toBe('What should I inspect?')
      expect(pending?.form?.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'target', required: true }),
          expect.objectContaining({
            name: 'scope',
            options: [
              { value: 'worktree', label: 'Current worktree' },
              { value: 'code', label: 'Code behavior' },
            ],
          }),
        ]),
      )
    })
    const requestId = service.store.get(created.id)?.pendingUserInput?.requestId
    if (!requestId) {
      throw new Error('Elicitation request was not stored')
    }

    const updated = await service.replyUserInput(created.id, requestId, {
      answer: JSON.stringify(values),
      wasFreeform: false,
      values,
    })

    await expect(response).resolves.toEqual({
      action: 'accept',
      content: values,
    })
    expect(updated.pendingUserInput).toBeUndefined()
    expect(service['activePrompts'].has(created.id)).toBe(false)
    expect(updated.status).toBe('idle')
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

    vi.spyOn(client, 'createSession').mockImplementationOnce(async (config) => {
      client.createdConfigs.push(config)
      return new DeferredSession('guarded-session')
    })
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
    expect(service.getSession(allowAll.id)?.runtime?.allowAllPermissions).toBe(true)

    await service.stop()
  })

  it('applies requested runtime defaults to new SDK sessions', async () => {
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

    const created = await service.createSession(
      directory,
      false,
      true,
      'copilot',
      'fixture-configurable',
      'high',
      'long_context',
    )

    expect(client.createdConfigs.at(-1)).toMatchObject({
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
    })
    expect(created.runtime).toMatchObject({
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      contextTokenLimit: 100_000,
    })
    await service.stop()
  })

  it('refreshes SDK models and omits effort for models without effort support', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [
      {
        ...configurableModel(),
        id: 'fixture-no-effort',
        name: 'Model Without Effort',
        supportedReasoningEfforts: undefined,
        defaultReasoningEffort: undefined,
        capabilities: {
          ...configurableModel().capabilities,
          supports: {
            ...configurableModel().capabilities.supports,
            reasoningEffort: false,
          },
        },
      },
    ]
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()

    await expect(service.providerRuntimeOptions('copilot')).resolves.toEqual({
      models: [
        expect.objectContaining({
          id: 'fixture-no-effort',
          reasoningEfforts: [],
        }),
      ],
    })
    const created = await service.createSession(
      directory,
      false,
      true,
      'copilot',
      'fixture-no-effort',
    )
    expect(client.createdConfigs.at(-1)).toMatchObject({
      model: 'fixture-no-effort',
      contextTier: 'default',
    })
    expect(client.createdConfigs.at(-1)).not.toHaveProperty('reasoningEffort')
    expect(created.runtime).not.toHaveProperty('reasoningEffort')

    client.models = [configurableModel()]
    await expect(service.providerRuntimeOptions('copilot')).resolves.toEqual({
      models: [expect.objectContaining({ id: 'fixture-configurable' })],
    })
    await service.stop()
  })

  it('bypasses the SDK model cache for provider and session runtime options', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const cachedList = vi.spyOn(client, 'listModels').mockResolvedValue([
      configurableModel(),
    ])
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()

    try {
      const created = await service.createSession(directory)
      const originalRuntime = { ...created.runtime }
      client.models = [{
        ...configurableModel(),
        id: 'new-provider-model',
        name: 'New Provider Model',
      }]
      const refreshed = {
        models: [expect.objectContaining({ id: 'new-provider-model' })],
      }
      await expect(service.providerRuntimeOptions('copilot')).resolves.toMatchObject(
        refreshed,
      )
      await expect(service.runtimeOptions(created.id)).resolves.toMatchObject(
        refreshed,
      )
      expect(client.rpc.models.list).toHaveBeenCalledTimes(3)
      expect(client.rpc.models.list).toHaveBeenLastCalledWith({})
      expect(cachedList).not.toHaveBeenCalled()
      expect(service.getSession(created.id)?.runtime).toEqual(originalRuntime)
      expect(client.session.disconnectCount).toBe(0)

      await service.configureRuntime(created.id, {
        model: 'new-provider-model',
        reasoningEffort: 'high',
        contextTier: 'default',
      })
      expect(client.session.runtimeSwitches.at(-1)?.modelId).toBe(
        'new-provider-model',
      )
    } finally {
      await service.stop()
    }
  })

  it('surfaces a failed or empty catalog refresh and retries without stale fallback', async () => {
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

    try {
      const created = await service.createSession(directory)
      client.listModelsError = new Error('Temporary provider failure')
      await expect(service.providerRuntimeOptions('copilot')).rejects.toThrow(
        'Runtime models are temporarily unavailable. Try again.',
      )
      client.listModelsError = undefined
      client.models = []
      await expect(service.runtimeOptions(created.id)).rejects.toThrow(
        'Runtime models are temporarily unavailable. Try again.',
      )
      client.models = [{
        ...configurableModel(),
        id: 'recovered-provider-model',
      }]
      await expect(service.runtimeOptions(created.id)).resolves.toMatchObject({
        models: [expect.objectContaining({ id: 'recovered-provider-model' })],
      })
    } finally {
      await service.stop()
    }
  })

  it('coalesces concurrent catalog requests but refreshes the next request', async () => {
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

    try {
      const created = await service.createSession(directory)
      let resolveModels!: (result: { models: ModelInfo[] }) => void
      client.rpc.models.list.mockImplementationOnce(
        () => new Promise((resolve) => { resolveModels = resolve }),
      )
      const providerOptions = service.providerRuntimeOptions('copilot')
      const sessionOptions = service.runtimeOptions(created.id)
      await vi.waitFor(() =>
        expect(client.rpc.models.list).toHaveBeenCalledTimes(2),
      )
      resolveModels({ models: [configurableModel()] })
      await Promise.all([providerOptions, sessionOptions])
      expect(client.rpc.models.list).toHaveBeenCalledTimes(2)

      await service.providerRuntimeOptions('copilot')
      expect(client.rpc.models.list).toHaveBeenCalledTimes(3)
    } finally {
      await service.stop()
    }
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
    const modelSession = await service.createSession(
      directory,
      true,
      true,
      'copilot',
      'fixture-configurable',
      'high',
      'long_context',
    )
    expect(terminal.create).toHaveBeenLastCalledWith(
      modelSession.id,
      directory,
      path.basename(directory),
      true,
      {
        model: 'fixture-configurable',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        contextTokenLimit: 100_000,
        contextEstimated: true,
      },
    )
    expect(modelSession.runtime).toMatchObject({
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
    })
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
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'autopilot',
    })
    expect(terminal.configure).toHaveBeenCalledWith(created.id, directory, {
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'autopilot',
    })
    expect(configured.runtime).toMatchObject({
      model: 'fixture-configurable',
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
        model: 'fixture-configurable',
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

  it('moves an idle Copilot SDK session into tmux', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    let terminalActive = false
    const terminal = {
      create: vi.fn(async () => {
        terminalActive = true
        return { sessionName: 'agentic-remote', windowId: '@30' }
      }),
      has: vi.fn(async () => terminalActive),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )
    await service.start()
    const created = await service.createSession(directory, false, true)

    const migrated = await service.moveToTerminal(created.id)

    expect(terminal.create).toHaveBeenCalledWith(
      created.id,
      directory,
      path.basename(directory),
      true,
      expect.objectContaining({ allowAllPermissions: true }),
    )
    expect(client.session.disconnectCount).toBe(1)
    expect(migrated).toMatchObject({
      id: created.id,
      executionMode: 'tmux',
      isOpen: true,
    })
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
          model: 'fixture-configurable',
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
        model: 'fixture-configurable',
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

  it('closes a terminal session when boot recovery fails', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const sessionId = 'abcdef12-3456-7890-abcd-ef1234567891'
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    await store.create(
      {
        id: sessionId,
        cwd: directory,
        title: 'Missing terminal',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    const terminal = {
      create: vi.fn(async () => {
        throw new Error('tmux pane could not be restored')
      }),
      has: vi.fn(async () => false),
      send: vi.fn(async () => false),
      cancel: vi.fn(async () => false),
    }
    const service = new AgentService(
      store,
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )

    await service.start()

    expect(service.listSessions()).toEqual([])
    expect(store.get(sessionId)).toMatchObject({
      isOpen: false,
      status: 'error',
      activity: 'Boot recovery failed',
    })
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
      id: 'fixture-configurable',
      reasoningEfforts: ['medium', 'high'],
      contextTiers: ['default', 'long_context'],
      contextTokenLimits: {
        default: 50_000,
        long_context: 100_000,
      },
    })
    const configured = await service.configureRuntime(created.id, {
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'plan',
    })
    expect(client.session.runtimeSwitches).toEqual([
      {
        modelId: 'fixture-configurable',
        reasoningEffort: 'high',
        contextTier: 'long_context',
      },
    ])
    expect(client.session.modeSwitches).toEqual(['plan'])
    expect(configured.runtime?.model).toBe('fixture-configurable')
    expect(configured.runtime?.mode).toBe('plan')

    client.session.modeSetError = new Error('Mode unavailable')
    await expect(
      service.configureRuntime(created.id, {
        model: 'fixture-configurable',
        reasoningEffort: 'medium',
        contextTier: 'default',
        mode: 'autopilot',
      }),
    ).rejects.toThrow('Mode unavailable')
    expect(service.store.get(created.id)?.runtime).toMatchObject({
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'plan',
    })
    expect(client.session.runtimeSwitches.at(-1)).toEqual({
      modelId: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
    })
    await service.stop()
  })

  it('restores the live SDK model when the first runtime change fails', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    client.session.modeSetError = new Error('Initial mode unavailable')
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory)

    await expect(
      service.configureRuntime(created.id, {
        model: 'fixture-configurable',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      }),
    ).rejects.toThrow('Initial mode unavailable')

    expect(client.session.runtimeSwitches).toEqual([
      {
        modelId: 'fixture-configurable',
        reasoningEffort: 'high',
        contextTier: 'long_context',
      },
      {
        modelId: 'fixture-default',
        reasoningEffort: 'medium',
        contextTier: 'default',
      },
    ])
    expect(service.store.get(created.id)?.runtime).toEqual({
      allowAllPermissions: true,
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
    const sessionId = randomUUID()
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
      async () => [],
      async () => undefined,
      {
        has: async () => true,
        send: async () => true,
        cancel: async () => true,
      },
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
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (service.store.get(client.session.sessionId)?.status === 'idle') {
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
      service.executeCommand(client.session.sessionId, '/model fixture-model'),
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

    const sent = await service.sendMessage(
      client.session.sessionId,
      'hello terminal',
    )
    await service.executeCommand(
      client.session.sessionId,
      '/aa on',
    )
    await service.executeCommand(
      client.session.sessionId,
      '/usage',
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
    expect(sent).toMatchObject({
      activity: 'Sent to terminal',
    })
    expect(
      service.store.get(client.session.sessionId)?.queuedCount ?? 0,
    ).toBe(0)
    expect(client.session.sentPrompts).toEqual([])
    await service.stop()
  })

  it('sends an explicit enqueue immediately when an idle terminal has no event log', async () => {
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

    const sent = await service.sendMessage(
      client.session.sessionId,
      'send while idle',
      true,
    )

    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      'send while idle',
      false,
    )
    expect(sent).toMatchObject({
      status: 'idle',
      activity: 'Sent to terminal',
    })
    expect(sent.queuedCount ?? 0).toBe(0)
    await service.stop()
  })

  it('keeps a failure the reader has not been shown', async () => {
    // The browser already had a newer draft, so the failed prompt was never
    // put in front of anyone. Sending that other text must not delete the one
    // copy of what failed.
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-keep-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
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
    const failedAt = new Date().toISOString()
    await service.store.update(client.session.sessionId, (stored) => {
      stored.failedPrompt = {
        content: 'the one that failed',
        failedAt,
      }
    })

    await service.sendMessage(client.session.sessionId, 'something else', false)
    expect(
      service.store.get(client.session.sessionId)?.failedPrompt?.content,
    ).toBe('the one that failed')

    // Saying which failure is being answered is what settles it. The words
    // alone are not proof: a reader who never saw this failure can have
    // written the same thing themselves, and clearing it then would deliver
    // one of the two intended messages and silently drop the other.
    await service.sendMessage(
      client.session.sessionId,
      'the one that failed',
      false,
      failedAt,
    )
    expect(
      service.store.get(client.session.sessionId)?.failedPrompt,
    ).toBeUndefined()
    await service.stop()
  })

  it('admits only one resend of the same failure', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-claim-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    const failedAt = new Date().toISOString()
    await service.store.update(created.id, (stored) => {
      stored.failedPrompt = { content: 'the one that failed', failedAt }
    })

    // Two readers handed the same recovered prompt. The marker is only
    // cleared once a send has gone out, so both passed the check and both
    // were accepted, and with queueing both copies were delivered.
    const results = await Promise.allSettled([
      service.sendMessage(created.id, 'the one that failed', true, failedAt),
      service.sendMessage(created.id, 'the one that failed', true, failedAt),
    ])
    const accepted = results.filter((result) => result.status === 'fulfilled')
    expect(accepted).toHaveLength(1)
  })

  it('refuses a second window still holding a failure that was answered', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-late-ack-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    const failedAt = new Date().toISOString()
    await service.store.update(created.id, (stored) => {
      stored.failedPrompt = { content: 'the one that failed', failedAt }
    })

    await service.sendMessage(created.id, 'the one that failed', true, failedAt)
    expect(service.store.get(created.id)?.failedPrompt).toBeUndefined()

    // A second window was still showing the same recovered text. Reaching the
    // check after the marker had gone, it found nothing to reserve and sent
    // the prompt a second time.
    await expect(
      service.sendMessage(created.id, 'the one that failed', true, failedAt),
    ).rejects.toThrow(/already been sent/)
  })

  it('does not clear a failure the sender never said they had', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-same-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    await service.store.update(created.id, (stored) => {
      stored.failedPrompt = {
        content: 'ship it',
        failedAt: new Date().toISOString(),
      }
    })

    // A failure this browser never saw, and writing of its own that happens to
    // read the same. Taking the words as proof delivered one of the two
    // intended messages and dropped the other without saying so.
    await service.sendMessage(created.id, 'ship it', true)

    expect(service.store.get(created.id)?.failedPrompt?.content).toBe('ship it')
  })

  it('gives back a queued prompt whose send failed', async () => {
    // The browser cleared its draft the moment the queue accepted this, so the
    // text only exists on the queue. Taking it off without handing it back
    // loses what the reader wrote.
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
    let eventVersion: string | undefined = 'events-v0'
    let events: SessionEvent[] = []
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        throw Object.assign(
          new Error('The terminal did not receive the message.'),
          { statusCode: 409 },
        )
      }),
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
    const errors: { message: string; failedPrompt?: string }[] = []
    service.on('event', (event) => {
      if (event.type === 'error') {
        errors.push(event)
      }
    })

    const queued = await service.sendMessage(
      client.session.sessionId,
      'work the queue lost',
      true,
    )
    const queuedAt = queued.queuedPrompts?.[0]?.createdAt
    expect(queuedAt).toBeDefined()
    events = JSON.parse(
      JSON.stringify([
        {
          type: 'session.idle',
          id: 'idle-event',
          parentId: null,
          timestamp: queuedAt,
          data: {},
        },
      ]),
    ) as SessionEvent[]
    eventVersion = 'events-v1'
    await service.refreshTranscripts()

    // Off the retryable queue, so nothing sends it a second time by itself.
    expect(
      service.store
        .get(client.session.sessionId)
        ?.queuedPrompts?.map((prompt) => prompt.content) ?? [],
    ).not.toContain('work the queue lost')
    // ...and handed back, so the draft can be restored.
    expect(
      errors.map((event) => event.failedPrompt),
    ).toContain('work the queue lost')
    // Also recorded on the session, so a browser that was not listening when
    // it failed still finds it in the next snapshot it reads.
    expect(
      service.store.get(client.session.sessionId)?.failedPrompt?.content,
    ).toBe('work the queue lost')

    // Recorded and dequeued in one write, so a restart can never find both.
    const onDisk = JSON.parse(
      await readFile(
        path.join(directory, 'state', 'state.json'),
        'utf8',
      ),
    ) as { sessions: Record<string, { queuedPrompts?: unknown[]; failedPrompt?: unknown }> }
    const persisted = onDisk.sessions[client.session.sessionId]
    expect(persisted?.failedPrompt).toBeTruthy()
    expect(persisted?.queuedPrompts ?? []).toHaveLength(0)
    await service.stop()
  })

  it('marks a direct terminal prompt running when completion events are trackable', async () => {
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
      async () => 'events-v1',
      terminal,
    )
    await service.start()

    const sent = await service.sendMessage(
      client.session.sessionId,
      'send with tracking',
    )

    expect(sent).toMatchObject({
      status: 'running',
      activity: 'Sent to terminal',
    })
    expect(service.store.queueDispatchAt(client.session.sessionId)).toBeDefined()
    await service.stop()
  })

  it('clears an untracked terminal dispatch after service restart', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const stateDirectory = path.join(directory, 'state')
    const store = new SessionStore(stateDirectory)
    await store.initialize()
    await store.create({
      id: 'untracked-terminal',
      cwd: directory,
      title: 'Untracked terminal',
      updatedAt: new Date().toISOString(),
      status: 'idle',
      isOpen: true,
      messages: [],
    })
    await store.markTerminalPromptDispatched(
      'untracked-terminal',
      new Date().toISOString(),
    )
    const client = new FakeCopilotClient()
    client.nextSessionList = Promise.resolve([])
    const service = new AgentService(
      new SessionStore(stateDirectory),
      client,
      async () => [
        {
          id: 'untracked-terminal',
          cwd: directory,
          title: 'Untracked terminal',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => [],
      async () => undefined,
      {
        has: async () => true,
        send: async () => true,
        cancel: async () => true,
      },
    )

    await service.start()

    expect(service.store.get('untracked-terminal')?.status).toBe('idle')
    expect(service.store.queueDispatchAt('untracked-terminal')).toBeUndefined()
    await service.stop()
  })

  it('restores a shut down terminal session as idle', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const stateDirectory = path.join(directory, 'state')
    const store = new SessionStore(stateDirectory)
    await store.initialize()
    await store.create({
      id: client.session.sessionId,
      cwd: directory,
      title: 'Interrupted terminal session',
      updatedAt: '2026-07-21T23:59:59.000Z',
      status: 'idle',
      isOpen: true,
      messages: [],
    })
    await store.markTerminalPromptDispatched(
      client.session.sessionId,
      '2026-07-21T23:59:59.500Z',
    )
    client.nextSessionList = Promise.resolve([
      {
        sessionId: client.session.sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Interrupted terminal session',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    const events = JSON.parse(`[
      {
        "type":"assistant.turn_start",
        "id":"turn-start",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{"turnId":"turn"}
      },
      {
        "type":"tool.execution_start",
        "id":"tool-start",
        "parentId":"turn-start",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{"toolCallId":"call","toolName":"bash","arguments":{"command":"pnpm build"}}
      },
      {
        "type":"session.shutdown",
        "id":"shutdown",
        "parentId":"tool-start",
        "timestamp":"2026-07-22T00:00:02.000Z",
        "data":{"shutdownType":"routine"}
      }
    ]`) as SessionEvent[]
    const service = new AgentService(
      new SessionStore(stateDirectory),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Interrupted terminal session',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'events-v1',
      {
        has: async () => true,
        send: async () => true,
        cancel: async () => true,
      },
    )

    await service.start()

    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'idle',
      activity: undefined,
      messages: [
        expect.objectContaining({
          id: 'tool:call',
          activityStatus: 'failed',
        }),
      ],
    })
    expect(
      service.store.queueDispatchAt(client.session.sessionId),
    ).toBeUndefined()
    await service.stop()
  })

  it('uses the terminal queue when an untracked dispatch is still resolving', async () => {
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

    const first = service.sendMessage(
      client.session.sessionId,
      'first direct prompt',
    )
    await vi.waitFor(() =>
      expect(service.store.get(client.session.sessionId)?.status).toBe(
        'running',
      ),
    )
    const queued = await service.sendMessage(
      client.session.sessionId,
      'native queued prompt',
      true,
    )

    expect(terminal.send).toHaveBeenNthCalledWith(
      1,
      client.session.sessionId,
      'first direct prompt',
      false,
    )
    expect(terminal.send).toHaveBeenNthCalledWith(
      2,
      client.session.sessionId,
      'native queued prompt',
      true,
    )
    expect(queued.queuedCount ?? 0).toBe(0)
    expect(queued.activity).toBe('Queued in terminal')
    expect((await first).status).toBe('idle')
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
    let eventVersion: string | undefined = 'events-v0'
    let events: SessionEvent[] = []
    const composer = '\u257b\u2584\u2584\n\u2503\n\u2579\u2580\u2580\n / commands'
    let pane = composer
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async (_id: string, content: string) => {
        if (content === '/usage') pane = ` \u25cf Usage ready\n${composer}`
        return true
      }),
      capture: vi.fn(async () => pane),
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
    // A command answers in the pane rather than starting a turn, so draining
    // it reports what it printed and leaves the session idle.
    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'idle',
      queuedCount: 0,
      queuedPrompts: [],
    })
    expect(
      service.store.get(client.session.sessionId)?.messages.at(-1)?.role,
    ).toBe('notice')
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

  it('surfaces the update the terminal CLI is offering', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-upd-'))
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
      updateNotice: vi.fn(async () => '1.0.83'),
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

    expect(terminal.updateNotice).toHaveBeenCalled()
    expect(
      service.store.get(client.session.sessionId)?.runtime?.updateAvailable,
    ).toBe('1.0.83')
    await service.stop()
  })

  // The notice is only true while the terminal that painted it is running, and
  // nothing polls a session discovery has dropped.
  it('clears the update once the terminal session is gone', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-updx-'))
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
    let running = true
    const terminal = {
      has: vi.fn(async () => running),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      updateNotice: vi.fn(async () => '1.0.83'),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () =>
        running
          ? [
              {
                id: client.session.sessionId,
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
    expect(
      service.store.get(client.session.sessionId)?.runtime?.updateAvailable,
    ).toBe('1.0.83')

    running = false
    await service.refreshDiscovery()

    expect(
      service.store.get(client.session.sessionId)?.runtime?.updateAvailable,
    ).toBeUndefined()
    await service.stop()
  })

  it('reports what a terminal slash command printed', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-slash-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    let pane = [' \u25cf Tip: /plugin', composer].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        // The CLI writes its answer into the terminal, not the event log.
        pane = [
          ' \u25cf Tip: /plugin',
          ' \u25cf Current working directory: /home/user/project',
          composer,
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
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

    const result = await service.executeCommand(client.session.sessionId, '/cwd')

    const notice = result.messages.at(-1)
    expect(notice?.role).toBe('notice')
    expect(notice?.content).toContain('/cwd')
    expect(notice?.content).toContain(
      'Current working directory: /home/user/project',
    )
    await service.stop()
  })

  it('waits for a terminal slash command response to finish painting', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-paint-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    const frame = (...lines: string[]) =>
      [' \u25cf Tip: /plugin', ...lines, composer].join('\n')
    let pane = frame()
    let captures = 0
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      // The pane is captured mid-paint, so the first line lands before the
      // rest of the response does.
      capture: vi.fn(async () => {
        captures += 1
        if (captures === 2) {
          pane = frame(' \u25cf Allowed directories for file access:')
        }
        if (captures >= 3) {
          pane = frame(
            ' \u25cf Allowed directories for file access:',
            '   1. /home/user/project',
          )
        }
        return pane
      }),
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

    const result = await service.executeCommand(
      client.session.sessionId,
      '/list-dirs',
    )

    const notice = result.messages.at(-1)
    expect(notice?.content).toContain('Allowed directories for file access:')
    expect(notice?.content).toContain('1. /home/user/project')
    await service.stop()
  })

  // While the agent is working, its streaming output lands in the same pane
  // and cannot be told apart from a command's response.
  it('does not attribute pane output to a command run while the agent works', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-busy-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => ' \u25cf streaming assistant text'),
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
    await service.store.update(client.session.sessionId, (session) => {
      session.status = 'running'
    })

    const result = await service.executeCommand(
      client.session.sessionId,
      '/usage',
    )

    expect(terminal.capture).not.toHaveBeenCalled()
    expect(result.messages.at(-1)?.content).toBe('/usage')
    await service.stop()
  })

  it('refuses a prompt while a full-screen view holds the keyboard', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-overlay-prompt-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const pane = [
      ' Settings',
      ' \u276f allowedUrls        (default)',
      ' / search \u00b7 \u2191/\u2193 navigate \u00b7 tab switch scope \u00b7 enter edit',
      ' esc close',
    ].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
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
      async () => 'events-1',
      terminal,
    )
    await service.start()

    await expect(
      service.sendMessage(client.session.sessionId, 'Deploy the service'),
    ).rejects.toMatchObject({
      message: expect.stringContaining('full-screen view'),
      // Without a status the reason is reported as a generic server error and
      // the reader learns nothing.
      statusCode: 409,
    })

    // Typing now would filter the picker's list, and a stray Enter could
    // choose from it, with nothing to say the prompt never arrived.
    expect(terminal.send).not.toHaveBeenCalled()
    await service.stop()
  })

  it.each(['transcript', 'composer'])(
    'sends a prompt when keyboard hints are only quoted in the %s',
    async (location) => {
      const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-hints-'))
      directories.push(directory)
      const client = new FakeCopilotClient()
      client.models = [configurableModel()]
      const hints = 'enter select · esc cancel'
      const pane = [
        location === 'transcript' ? `The picker says ${hints}` : 'Ready',
        '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
        location === 'composer' ? `┃ Explain ${hints}` : '┃',
        '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
        ' ← open sidebar · / commands · tab next tab',
      ].join('\n')
      const terminal = {
        has: vi.fn(async () => true),
        send: vi.fn(async () => true),
        cancel: vi.fn(async () => true),
        capture: vi.fn(async () => pane),
      }
      const service = new AgentService(
        new SessionStore(path.join(directory, 'state')),
        client,
        async () => [{
          id: client.session.sessionId,
          cwd: directory,
          title: 'External session',
          updatedAt: new Date().toISOString(),
        }],
        async () => undefined,
        async () => [],
        async () => 'events-1',
        terminal,
      )
      await service.start()
      try {
        await service.sendMessage(client.session.sessionId, 'Continue reviewing')
        expect(terminal.send).toHaveBeenCalledWith(
          client.session.sessionId, 'Continue reviewing', false,
        )
      } finally {
        await service.stop()
      }
    },
  )

  it('says so when a terminal slash command opens a full-screen view', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-overlay-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    let pane = ' \u25cf Tip: /plugin'
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        pane = [
          ' Settings',
          ' \u276f allowedUrls        (default)',
          ' / search \u00b7 \u2191/\u2193 navigate \u00b7 tab switch scope \u00b7 enter edit',
          ' esc close',
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
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

    const result = await service.executeCommand(
      client.session.sessionId,
      '/config',
    )

    // Dumping a redrawing TUI into the transcript would be noise, so the
    // conversation says where it went instead.
    expect(result.messages.at(-1)?.content).toContain(
      'Opened an interactive view in the terminal',
    )
    await service.stop()
  })

  // Queued behind active work, a command used to be drained as an ordinary
  // prompt and never reported the output it printed.
  it('reports what a queued slash command printed once it is drained', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-queue-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    let pane = [' \u25cf Tip: /plugin', composer].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        pane = [
          ' \u25cf Tip: /plugin',
          ' \u25cf Usage this month: 42 requests',
          composer,
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
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
      // A version is required before the queue path is taken at all.
      async () => 'events-1',
      terminal,
    )
    await service.start()

    await service.executeCommand(client.session.sessionId, '/usage', true)

    // Draining it as an ordinary prompt would mark a turn dispatched and add
    // no notice at all.
    const notice = service.store.get(client.session.sessionId)?.messages.at(-1)
    expect(notice?.role).toBe('notice')
    expect(notice?.content).toContain('Usage this month: 42 requests')
    await service.stop()
  })

  // A command can start a turn, and the pane then fills with the agent's
  // writing rather than an answer to the command.
  it('keeps draining queued commands after one of them answers', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-drain-'),
    )
    directories.push(directory)
    const stateDirectory = path.join(directory, 'state')
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    const seed = new SessionStore(stateDirectory)
    await seed.initialize()
    await seed.create(
      {
        id: client.session.sessionId,
        cwd: directory,
        title: 'External session',
        updatedAt: '2026-07-25T01:00:00.000Z',
        status: 'idle',
        isOpen: true,
        queuedCount: 2,
        queuedPrompts: [
          {
            id: 'queued-usage',
            content: '/usage',
            command: true,
            createdAt: '2026-07-25T01:00:01.000Z',
          },
          {
            id: 'queued-cwd',
            content: '/cwd',
            command: true,
            createdAt: '2026-07-25T01:00:02.000Z',
          },
        ],
        messages: [],
      },
      { managedOpen: true },
    )
    const answered: string[] = []
    let pane = [' \u25cf Tip: /plugin', composer].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async (_sessionId: string, content: string) => {
        answered.push(content)
        pane = [
          ' \u25cf Tip: /plugin',
          ` \u25cf answered ${content}`,
          composer,
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
    }
    const service = new AgentService(
      new SessionStore(stateDirectory),
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
      async () => 'events-1',
      terminal,
    )
    await service.start()

    await service.executeCommand(client.session.sessionId, '/model', true)

    // A command answers in the pane and adds no completion event, so nothing
    // else would drain the entries behind it.
    expect(answered).toEqual(['/usage', '/cwd', '/model'])
    expect(
      service.store.get(client.session.sessionId)?.queuedCount ?? 0,
    ).toBe(0)
    await service.stop()
  })

  it('marks the session busy when a queued command starts a turn', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-turn-'),
    )
    directories.push(directory)
    const stateDirectory = path.join(directory, 'state')
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    const seed = new SessionStore(stateDirectory)
    await seed.initialize()
    await seed.create(
      {
        id: client.session.sessionId,
        cwd: directory,
        title: 'External session',
        updatedAt: '2026-07-25T01:00:00.000Z',
        status: 'idle',
        isOpen: true,
        queuedCount: 2,
        queuedPrompts: [
          {
            id: 'queued-init',
            content: '/init',
            command: true,
            createdAt: '2026-07-25T01:00:01.000Z',
          },
          {
            id: 'queued-cwd',
            content: '/cwd',
            command: true,
            createdAt: '2026-07-25T01:00:02.000Z',
          },
        ],
        messages: [],
      },
      { managedOpen: true },
    )
    const answered: string[] = []
    let pane = [' \u25cf Tip: /plugin', composer].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async (_sessionId: string, content: string) => {
        answered.push(content)
        // /init answers by starting a turn rather than printing.
        pane = [
          ' \u25cf Working on it',
          composer,
          ' esc interrupt \u00b7 ctrl+c quit',
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
    }
    const service = new AgentService(
      new SessionStore(stateDirectory),
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
      async () => 'events-1',
      terminal,
    )
    await service.start()

    await service.executeCommand(client.session.sessionId, '/model', true)

    // The turn owns the terminal, so the entries behind it wait rather than
    // being typed into the running agent.
    expect(answered).toEqual(['/init'])
    const stored = service.store.get(client.session.sessionId)
    expect(stored?.status).toBe('running')
    expect(stored?.queuedCount ?? 0).toBe(2)
    await service.stop()
  })

  it('stops draining when a queued command opens a full-screen view', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-overlay-'),
    )
    directories.push(directory)
    const stateDirectory = path.join(directory, 'state')
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    const seed = new SessionStore(stateDirectory)
    await seed.initialize()
    await seed.create(
      {
        id: client.session.sessionId,
        cwd: directory,
        title: 'External session',
        updatedAt: '2026-07-25T01:00:00.000Z',
        status: 'idle',
        isOpen: true,
        queuedCount: 2,
        queuedPrompts: [
          {
            id: 'queued-model',
            content: '/model',
            command: true,
            createdAt: '2026-07-25T01:00:01.000Z',
          },
          {
            id: 'queued-cwd',
            content: '/cwd',
            command: true,
            createdAt: '2026-07-25T01:00:02.000Z',
          },
        ],
        messages: [],
      },
      { managedOpen: true },
    )
    const answered: string[] = []
    let pane = [' \u25cf Tip: /plugin', composer].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async (_sessionId: string, content: string) => {
        answered.push(content)
        // /model opens the picker, which repaints over the composer and takes
        // the keyboard for its own search box.
        pane = [
          ' Select a model',
          ' > alternate-provider-model',
          '   fixture-model',
          ' esc close \u00b7 enter select',
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
    }
    const service = new AgentService(
      new SessionStore(stateDirectory),
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
      async () => 'events-1',
      terminal,
    )
    await service.start()

    await service.executeCommand(client.session.sessionId, '/usage', true)

    // The view owns the keyboard, so the entries behind it wait instead of
    // being typed into its search box.
    expect(answered).toEqual(['/model'])
    expect(
      service.store.get(client.session.sessionId)?.queuedCount ?? 0,
    ).toBe(2)
    await service.stop()
  })

  it('reports nothing when the command started a turn', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-slash-turn-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    let pane = [
      ' \u25cf Tip: /plugin',
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        pane = [
          ' \u25cf Tip: /plugin',
          ' \u25cf Let me look at the repository first.',
          '\u257b\u2584\u2584\u2584\u2584',
          '\u2503',
          '\u2579\u2580\u2580\u2580\u2580',
          ' \u25c9 Working - autopilot \u00b7 2.3 KiB esc interrupt',
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
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

    const result = await service.executeCommand(
      client.session.sessionId,
      '/plan',
    )

    expect(result.messages.at(-1)?.content).toBe('/plan')
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
      pendingUserInput: vi.fn(
        async (): Promise<typeof request | undefined> => request,
      ),
      replyUserInput: vi.fn(async () => true),
    }
    let events = JSON.parse(`[
      {
        "type":"assistant.turn_end",
        "id":"completed-turn",
        "parentId":null,
        "timestamp":"2026-08-12T14:17:35.730Z",
        "data":{}
      }
    ]`) as SessionEvent[]
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
      async () => `completed-events-${events.length}`,
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
    expect(updated).toMatchObject({
      status: 'running',
      activity: 'Continuing',
    })
    terminal.pendingUserInput.mockResolvedValue(undefined)
    events = [
      ...events,
      {
        type: 'assistant.turn_end',
        id: 'fresh-completed-turn',
        parentId: null,
        timestamp: new Date(Date.now() + 1_000).toISOString(),
        data: {},
      },
    ] as SessionEvent[]
    const checksAfterReply = terminal.pendingUserInput.mock.calls.length
    await new Promise((resolve) => setTimeout(resolve, 2_100))
    await service.refreshTranscripts()
    expect(
      service.store.get(client.session.sessionId)?.pendingUserInput,
    ).toBeUndefined()
    expect(terminal.pendingUserInput.mock.calls.length).toBe(
      checksAfterReply + 1,
    )
    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'idle',
      activity: undefined,
    })
    await service.stop()
  })

  it('detects structured terminal ask-user requests from the event log', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.nextSessionList = Promise.resolve([
      {
        sessionId: client.session.sessionId,
        startTime: new Date(),
        modifiedTime: new Date(),
        summary: 'Create Staging Service Configuration',
        isRemote: false,
        context: { workingDirectory: directory },
      },
    ])
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      pendingPermission: vi.fn(async () => undefined),
      pendingUserInput: vi.fn(async () => undefined),
      replyUserInput: vi.fn(async () => true),
    }
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"ask-start",
        "parentId":null,
        "timestamp":"2026-08-31T05:51:08.895Z",
        "data":{
          "toolCallId":"ask-call",
          "toolName":"ask_user",
          "toolTitle":"Asking user",
          "arguments":{
            "message":"The service release is published and the replacement payload is prepared, but I have not submitted the deployment batch.",
            "requestedSchema":{
              "properties":{
                "deleteTemporaryBootstrap":{
                  "type":"boolean",
                  "title":"Delete temporary service bootstrap",
                  "default":true
                },
                "confirmReplacement":{
                  "type":"boolean",
                  "title":"Authorize the staging service replacement",
                  "default":false
                }
              }
            }
          }
        }
      }
    ]`) as SessionEvent[]
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Create Staging Service Configuration',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'structured-ask-events-v1',
      terminal,
    )

    await service.start()

    expect(service.store.get(client.session.sessionId)).toMatchObject({
      status: 'waiting',
      pendingUserInput: {
        requestId: 'persisted-user-input:ask-call',
        question:
          'The service release is published and the replacement payload is prepared, but I have not submitted the deployment batch.',
        form: {
          fields: [
            {
              name: 'deleteTemporaryBootstrap',
              type: 'boolean',
              default: true,
            },
            {
              name: 'confirmReplacement',
              type: 'boolean',
              default: false,
            },
          ],
        },
      },
    })
    await service.stop()
  })

  it('fills the agent form instead of typing into it', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      pendingPermission: vi.fn(async () => undefined),
      pendingUserInput: vi.fn(async () => undefined),
      replyUserInput: vi.fn(async () => true),
      dismissUserInput: vi.fn(async () => true),
      fillUserInputForm: vi.fn(async () => true),
    }
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"ask-start",
        "parentId":null,
        "timestamp":"2026-09-01T04:30:21.270Z",
        "data":{
          "toolCallId":"ask-call",
          "toolName":"ask_user",
          "arguments":{
            "message":"Choose the deployment",
            "requestedSchema":{
              "properties":{
                "deploymentName":{"type":"string","title":"Name","default":"keepme"},
                "catalogScope":{
                  "type":"string",
                  "title":"Scope",
                  "oneOf":[
                    {"const":"arm_only","title":"ARM only"},
                    {"const":"new_dev_service","title":"New dev service"}
                  ]
                },
                "confirmDeployment":{"type":"boolean","title":"Confirm","default":false}
              }
            }
          }
        }
      }
    ]`) as SessionEvent[]
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Deploy the service',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'form-answer-v1',
      terminal,
    )

    await service.start()
    const sessionId = client.session.sessionId
    expect(service.store.get(sessionId)?.pendingUserInput).toBeDefined()

    const values = {
      deploymentName: 'staging-web-service-candidate',
      catalogScope: 'new_dev_service',
      confirmDeployment: true,
    }
    const answered = await service.replyUserInput(
      sessionId,
      'persisted-user-input:ask-call',
      { answer: JSON.stringify(values), wasFreeform: false, values },
    )

    // The answer goes into the form the agent is waiting on, so it arrives as
    // that tool's result instead of being typed into a field.
    // The field titles travel with the answer so the controller can confirm
    // the form on screen is still the one being answered.
    expect(terminal.fillUserInputForm).toHaveBeenCalledWith(
      sessionId,
      [
        { kind: 'text', value: 'staging-web-service-candidate' },
        { kind: 'select', optionCount: 3, index: 1 },
        { kind: 'select', optionCount: 3, index: 0 },
      ],
      { question: 'Choose the deployment', fields: ['Name', 'Scope', 'Confirm'] },
    )
    expect(terminal.send).not.toHaveBeenCalled()
    expect(terminal.dismissUserInput).not.toHaveBeenCalled()
    expect(answered.pendingUserInput).toBeUndefined()
    await service.stop()
  })

  it('cancels the form and answers in a message when it cannot be filled', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"ask-start",
        "parentId":null,
        "timestamp":"2026-09-01T04:30:21.270Z",
        "data":{
          "toolCallId":"ask-call",
          "toolName":"ask_user",
          "arguments":{
            "message":"Confirm the transfer",
            "requestedSchema":{
              "properties":{
                "confirmTransfer":{"type":"boolean","title":"Confirm","default":false}
              }
            }
          }
        }
      }
    ]`) as SessionEvent[]
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(
        async (_sessionId: string, _content: string, _enqueue: boolean) => true,
      ),
      cancel: vi.fn(async () => true),
      pendingPermission: vi.fn(async () => undefined),
      pendingUserInput: vi.fn(async () => undefined),
      replyUserInput: vi.fn(async () => true),
      // Escape cancels the tool the agent was waiting on, which it records as
      // complete; that is what makes typing the answer safe afterwards.
      dismissUserInput: vi.fn(async () => {
        events.push(
          JSON.parse(`{
            "type":"tool.execution_complete",
            "id":"ask-end",
            "parentId":null,
            "timestamp":"2026-09-01T04:30:24.000Z",
            "data":{"toolCallId":"ask-call"}
          }`) as SessionEvent,
        )
        return true
      }),
      fillUserInputForm: vi.fn(async () => false),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Deploy the service',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'form-fallback-v1',
      terminal,
    )

    await service.start()
    const sessionId = client.session.sessionId
    const values = { confirmTransfer: true }
    await service.replyUserInput(
      sessionId,
      'persisted-user-input:ask-call',
      { answer: JSON.stringify(values), wasFreeform: false, values },
    )

    // Closing the prompt first keeps the answer out of the form's fields.
    expect(terminal.dismissUserInput).toHaveBeenCalledWith(sessionId, {
      question: 'Confirm the transfer',
      fields: ['Confirm'],
    })
    const content = terminal.send.mock.calls.at(-1)?.[1] as string | undefined
    expect(content).toContain('confirmTransfer: true')
    expect(content).not.toContain('{"confirmTransfer"')
    await service.stop()
  })

  it('does not send an answer while the form is still open', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"ask-start",
        "parentId":null,
        "timestamp":"2026-09-01T04:30:21.270Z",
        "data":{
          "toolCallId":"ask-call",
          "toolName":"ask_user",
          "arguments":{
            "message":"Confirm the transfer",
            "requestedSchema":{
              "properties":{
                "confirmTransfer":{"type":"boolean","title":"Confirm","default":false}
              }
            }
          }
        }
      }
    ]`) as SessionEvent[]
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(
        async (_sessionId: string, _content: string, _enqueue: boolean) => true,
      ),
      cancel: vi.fn(async () => true),
      pendingPermission: vi.fn(async () => undefined),
      pendingUserInput: vi.fn(async () => undefined),
      replyUserInput: vi.fn(async () => true),
      // Escape never lands, so the tool stays open and the form keeps the
      // keyboard.
      dismissUserInput: vi.fn(async () => false),
      fillUserInputForm: vi.fn(async () => false),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Deploy the service',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'form-open-v1',
      terminal,
    )

    await service.start()
    const sessionId = client.session.sessionId
    const values = { confirmTransfer: true }

    await expect(
      service.replyUserInput(sessionId, 'persisted-user-input:ask-call', {
        answer: JSON.stringify(values),
        wasFreeform: false,
        values,
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('still showing its prompt'),
      statusCode: 409,
    })

    // Typing now would land in the open form and submit every other field at
    // its default, which is the corruption this path exists to avoid.
    expect(terminal.send).not.toHaveBeenCalled()
    await service.stop()
  })

  it.each([
    ['cancel', 'closed'],
    ['decline', 'closed'],
    ['cancel', 'mismatch'],
    ['cancel', 'unconfirmed'],
    ['cancel', 'already-complete'],
  ] as const)('handles %s of a persisted terminal question when %s', async (action, outcome) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-question-cancel-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const events: SessionEvent[] = [{
      type: 'tool.execution_start',
      id: 'question-start',
      parentId: null,
      timestamp: new Date().toISOString(),
      data: {
        toolCallId: 'question-call',
        toolName: 'ask_user',
        arguments: {
          message: 'Confirm the repository setup.',
          requestedSchema: {
            properties: {
              confirmed: { type: 'boolean', title: 'Confirmed', default: true },
            },
          },
        },
      },
    }]
    const complete = () => events.push({
      type: 'tool.execution_complete',
      id: 'question-end',
      parentId: null,
      timestamp: new Date().toISOString(),
      data: { toolCallId: 'question-call', success: true },
    })
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      dismissUserInput: vi.fn(async () => {
        if (outcome === 'closed') {
          complete()
        }
        return outcome !== 'mismatch'
      }),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [{
        id: client.session.sessionId,
        cwd: directory,
        title: 'Question reproduction',
        updatedAt: new Date().toISOString(),
      }],
      async () => undefined,
      async () => events,
      async () => `cancel-events-${events.length}`,
      terminal,
    )
    await service.start()
    try {
      const sessionId = client.session.sessionId
      const pending = service.getSession(sessionId)?.pendingUserInput
      expect(pending).toBeDefined()
      if (outcome === 'already-complete') {
        complete()
      }
      const reply = service.replyUserInput(sessionId, 'persisted-user-input:question-call', {
        action,
        answer: '',
        wasFreeform: false,
      })
      if (outcome === 'mismatch' || outcome === 'unconfirmed') {
        await expect(reply).rejects.toMatchObject({
          statusCode: 409,
          message: expect.stringContaining('not dismissed'),
        })
        await service.refreshTranscripts()
        expect(service.getSession(sessionId)?.pendingUserInput).toEqual(pending)
        expect(service.getSession(sessionId)?.status).toBe('waiting')
      } else {
        expect((await reply).pendingUserInput).toBeUndefined()
      }
      if (outcome === 'already-complete') {
        expect(terminal.dismissUserInput).not.toHaveBeenCalled()
      } else {
        expect(terminal.dismissUserInput).toHaveBeenCalledWith(sessionId, {
          question: 'Confirm the repository setup.',
          fields: ['Confirmed'],
        }, action)
      }
      expect(terminal.send).not.toHaveBeenCalled()
    } finally {
      await service.stop()
    }
  })

  it('drops a reply to a request the agent already finished', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const events = JSON.parse(`[
      {
        "type":"tool.execution_start",
        "id":"ask-start",
        "parentId":null,
        "timestamp":"2026-09-01T04:30:21.270Z",
        "data":{
          "toolCallId":"ask-call",
          "toolName":"ask_user",
          "arguments":{
            "message":"Confirm the transfer",
            "requestedSchema":{
              "properties":{
                "confirmTransfer":{"type":"boolean","title":"Confirm","default":false}
              }
            }
          }
        }
      },
      {
        "type":"tool.execution_complete",
        "id":"unrelated-end",
        "parentId":null,
        "timestamp":"2026-09-01T04:30:22.000Z",
        "data":{"toolCallId":"unrelated-call"}
      }
    ]`) as SessionEvent[]
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(
        async (_sessionId: string, _content: string, _enqueue: boolean) => true,
      ),
      cancel: vi.fn(async () => true),
      pendingPermission: vi.fn(async () => undefined),
      pendingUserInput: vi.fn(async () => undefined),
      replyUserInput: vi.fn(async () => true),
      dismissUserInput: vi.fn(async () => true),
      fillUserInputForm: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Deploy the service',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => events,
      async () => 'form-answered-v1',
      terminal,
    )

    await service.start()
    const sessionId = client.session.sessionId
    const values = { confirmTransfer: true }
    // The prompt is answered in the attached terminal after the app synced it,
    // so the agent records the tool as finished while the reply is in flight.
    events.push(
      JSON.parse(`{
        "type":"tool.execution_complete",
        "id":"ask-end",
        "parentId":null,
        "timestamp":"2026-09-01T04:30:23.000Z",
        "data":{"toolCallId":"ask-call"}
      }`) as SessionEvent,
    )
    await service.replyUserInput(
      sessionId,
      'persisted-user-input:ask-call',
      { answer: JSON.stringify(values), wasFreeform: false, values },
    )

    // Whatever is on screen now belongs to something else, so it must not be
    // filled or typed into.
    expect(terminal.fillUserInputForm).not.toHaveBeenCalled()
    expect(terminal.send).not.toHaveBeenCalled()
    await service.stop()
  })

  it('maps answered fields onto the agent form, and refuses what it cannot', () => {
    const form: UserInputForm = {
      fields: [
        { name: 'name', title: 'Name', type: 'string', required: false },
        {
          name: 'scope',
          title: 'Scope',
          type: 'string',
          required: false,
          options: [
            { value: 'arm_only', label: 'ARM only' },
            { value: 'new_dev_service', label: 'New dev service' },
          ],
        },
        { name: 'confirm', title: 'Confirm', type: 'boolean', required: false },
      ],
    }
    expect(
      terminalFormSteps(form, {
        name: 'swec',
        scope: 'new_dev_service',
        confirm: false,
      }),
    ).toEqual([
      { kind: 'text', value: 'swec' },
      { kind: 'select', optionCount: 3, index: 1 },
      // Yes is first, so a declined confirmation lands on No.
      { kind: 'select', optionCount: 3, index: 1 },
    ])

    // An option the agent never offered must not be guessed at.
    expect(
      terminalFormSteps(form, { name: 'x', scope: 'other', confirm: true }),
    ).toBeUndefined()
    expect(
      terminalFormSteps(
        {
          fields: [
            { name: 'tags', title: 'Tags', type: 'array', required: false },
          ],
        },
        { tags: ['a'] },
      ),
    ).toBeUndefined()
  })

  it('carries the checklist rows that were chosen', () => {
    const form: UserInputForm = {
      fields: [
        {
          name: 'operations',
          title: 'Wiki operations to authorize',
          type: 'array',
          required: false,
          default: ['confirm_all'],
          options: [
            { value: 'confirm_all', label: 'Confirm all (Recommended)' },
            { value: 'child', label: 'Upsert child page' },
            { value: 'parent', label: 'Upsert parent index' },
            { value: 'cancel', label: 'Cancel' },
          ],
        },
      ],
    }

    // What has to be pressed depends on what the list is showing, which is
    // read from the screen, so what travels is only what was chosen.
    expect(terminalFormSteps(form, { operations: ['confirm_all'] })).toEqual([
      { kind: 'checklist', optionCount: 5, selected: [0] },
    ])
    expect(terminalFormSteps(form, { operations: ['child', 'parent'] })).toEqual(
      [{ kind: 'checklist', optionCount: 5, selected: [1, 2] }],
    )

    expect(terminalFormSteps(form, { operations: ['nope'] })).toBeUndefined()
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

  it('re-surfaces an ask-user request a stale sync gate hid', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const events = JSON.parse(`[
      {
        "type":"user.message",
        "id":"prompt",
        "parentId":null,
        "timestamp":"2026-07-22T00:00:00.000Z",
        "data":{"content":"Plan the capacity move"}
      },
      {
        "type":"tool.execution_start",
        "id":"ask-start",
        "parentId":"prompt",
        "timestamp":"2026-07-22T00:00:01.000Z",
        "data":{
          "toolCallId":"ask-call",
          "toolName":"ask_user",
          "toolTitle":"Asking user",
          "arguments":{
            "message":"Choose the capacity path",
            "requestedSchema":{
              "properties":{
                "capacityPlan":{
                  "type":"string",
                  "title":"Capacity plan",
                  "oneOf":[
                    {"const":"use_default","title":"Use existing capacity"},
                    {"const":"wait","title":"Wait for quota"}
                  ]
                }
              }
            }
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
      // The agent stops writing while it waits, so the log never changes again.
      async () => 'hidden-question-v1',
    )

    await service.start()
    await service.createSession(directory)
    await service.refreshTranscripts()
    const sessionId = client.session.sessionId
    expect(service.store.get(sessionId)?.pendingUserInput).toBeDefined()

    // Reproduce the stuck session: the transcript kept the running ask-user
    // row, but the request itself never reached the session.
    await service.store.update(sessionId, (session) => {
      session.pendingUserInput = undefined
      session.status = 'running'
      session.activity = 'Sent to terminal'
    })
    expect(service.store.get(sessionId)?.messages.at(-1)).toMatchObject({
      role: 'activity',
      activityStatus: 'running',
      content: 'Ask User · Asking user',
    })

    // Every later poll short-circuits on the unchanged log, so recovery has to
    // happen there or the request stays invisible forever.
    await service.refreshTranscripts()

    expect(service.store.get(sessionId)).toMatchObject({
      status: 'waiting',
      pendingUserInput: {
        requestId: 'persisted-user-input:ask-call',
        question: 'Choose the capacity path',
      },
    })
    expect(
      service.store.get(sessionId)?.pendingUserInput?.form?.fields.map(
        (field) => field.name,
      ),
    ).toEqual(['capacityPlan'])

    // Answering must not be undone by the same recovery on the next poll,
    // because the log still has no completion for the call.
    const answered = await service.replyUserInput(
      sessionId,
      'persisted-user-input:ask-call',
      {
        answer: JSON.stringify({ capacityPlan: 'use_default' }),
        wasFreeform: false,
        values: { capacityPlan: 'use_default' },
      },
    )
    expect(answered.pendingUserInput).toBeUndefined()
    await service.refreshTranscripts()
    expect(service.store.get(sessionId)?.pendingUserInput).toBeUndefined()
    await service.stop()
  })

  it('surfaces session-use confirmation and sends only after an explicit resume', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-session-use-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    let pane = [
      'Session in use',
      'This session appears to be in use by another CLI or application.',
      '❯ 1. Resume anyway',
      '  2. Go back (Esc)',
      '↑/↓ to navigate · enter to select · esc to cancel',
    ].join('\n')
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => pane),
      pendingPermission: vi.fn(async () => parseTerminalPermission(pane)),
      replyPermission: vi.fn(async () => {
        pane = '╻▄▄▄▄▄▄▄▄\n┃\n╹▀▀▀▀▀▀▀▀\n / commands'
        return true
      }),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [{
        id: client.session.sessionId,
        cwd: directory,
        title: 'Resumed session',
        updatedAt: new Date().toISOString(),
      }],
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )
    await service.start()
    try {
      const sessionId = client.session.sessionId
      const request = service.getSession(sessionId)?.pendingPermission
      if (!request) throw new Error('Resume permission was not exposed')
      expect(service.getSession(sessionId)?.status).toBe('waiting')
      expect(request.options.map((option) => option.name)).toEqual([
        'Resume anyway', 'Go back',
      ])
      await expect(service.sendMessage(sessionId, 'Continue')).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('Choose Resume anyway or Go back'),
      })
      expect(terminal.send).not.toHaveBeenCalled()
      expect(terminal.replyPermission).not.toHaveBeenCalled()

      const updated = await service.replyPermission(sessionId, request.requestId, 'terminal:allow')
      expect(updated.pendingPermission).toBeUndefined()
      expect(terminal.replyPermission).toHaveBeenCalledWith(
        sessionId, request, 'terminal:allow',
      )
      await service.sendMessage(sessionId, 'Continue')
      expect(terminal.send).toHaveBeenCalledWith(sessionId, 'Continue', false)
    } finally {
      await service.stop()
    }
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

describe('statusFromEvents', () => {
  const event = (
    type: string,
    agentId?: string,
  ): SessionEvent =>
    ({
      type,
      ...(agentId ? { agentId } : {}),
      data: {},
    }) as unknown as SessionEvent

  it('keeps a session running while a background agent is still working', () => {
    // The turn ends as soon as the agents are launched: their work carries on
    // afterwards, and the session is still doing it.
    expect(
      statusFromEvents([
        event('assistant.turn_start'),
        event('subagent.started', 'agent-1'),
        event('subagent.started', 'agent-2'),
        event('assistant.turn_end'),
        event('subagent.completed', 'agent-1'),
      ]),
    ).toBe('running')
  })

  it('goes idle when a background agent fails rather than completes', () => {
    // Failing ends an agent too. Tracking only completions would leave the
    // session running for good after one failed.
    expect(
      statusFromEvents([
        event('assistant.turn_start'),
        event('subagent.started', 'agent-1'),
        event('assistant.turn_end'),
        event('subagent.failed', 'agent-1'),
      ]),
    ).toBe('idle')
  })

  it('goes idle once every background agent has finished', () => {
    expect(
      statusFromEvents([
        event('assistant.turn_start'),
        event('subagent.started', 'agent-1'),
        event('assistant.turn_end'),
        event('subagent.completed', 'agent-1'),
      ]),
    ).toBe('idle')
  })

  it('does not keep a stopped session running for agents it was waiting on', () => {
    expect(
      statusFromEvents([
        event('subagent.started', 'agent-1'),
        event('assistant.turn_end'),
        event('abort'),
      ]),
    ).toBe('idle')
  })

  it('still reports a question rather than the agents behind it', () => {
    expect(
      statusFromEvents([
        event('subagent.started', 'agent-1'),
        event('assistant.turn_end'),
        event('permission.requested'),
      ]),
    ).toBe('waiting')
  })
})
