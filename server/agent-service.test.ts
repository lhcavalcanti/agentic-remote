import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
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
import type { ServerEvent, UserInputForm } from '../shared/contracts.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
  messagesFromHistory,
  pendingUserInputFromEvents,
  runtimeInfoFromEvents,
  foregroundTurnOpen,
  statusFromEvents,
  terminalFormSteps,
} from './agent-service.js'
import type {
  CopilotTaskInfo,
  CopilotTaskProgress,
} from './background-task-adapter.js'
import { SessionStore } from './session-store.js'
import { parseTerminalPermission, TmuxTerminalSessionController, type TerminalCancelOptions } from './terminal-session.js'

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
    reasoningEffort?: string | null
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
        reasoningEffort?: string | null
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
        return { status: 'applied', modelChanged: false }
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
      enqueue: async () => ({ queued: true as const, queueId: 'queued-command' }),
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

  sendError?: Error
  sendAndWait(content: string): Promise<AssistantMessageEvent | undefined> {
    this.sentPrompts.push(content)
    if (this.sendError) {
      return Promise.reject(this.sendError)
    }
    return new Promise((resolve) => {
      this.responseResolvers.push(resolve)
    })
  }

  async send({ prompt, mode }: { prompt: string; mode: 'immediate' }): Promise<string> {
    expect(mode).toBe('immediate')
    this.sentPrompts.push(prompt)
    if (this.sendError) throw this.sendError
    this.responseResolvers.push((response) => {
      if (response) this.emit(response)
      this.emit({
        id: randomUUID(), type: 'session.idle', timestamp: new Date().toISOString(),
        parentId: null, data: {},
      } as SessionEvent)
    })
    return randomUUID()
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
const services = new Set<AgentService>()
const startService = AgentService.prototype.start

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
  await Promise.allSettled([...services].map((service) => service.stop()))
  services.clear()
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
  vi.restoreAllMocks()
})

// Sessions are confined to the home directory; these fixtures run in tmpdir.
beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', tmpdir())
  vi.spyOn(AgentService.prototype, 'start').mockImplementation(function (this: AgentService) {
    services.add(this)
    return startService.call(this)
  })
  // SDK fixtures must never inspect or type into the developer's tmux server.
  // Terminal behavior is exercised with the explicit controllers below.
  vi.spyOn(TmuxTerminalSessionController.prototype, 'has').mockResolvedValue(false)
  vi.spyOn(TmuxTerminalSessionController.prototype, 'send').mockResolvedValue(false)
  vi.spyOn(TmuxTerminalSessionController.prototype, 'capture').mockResolvedValue(undefined)
  vi.spyOn(TmuxTerminalSessionController.prototype, 'cancel').mockResolvedValue(false)
  vi.spyOn(TmuxTerminalSessionController.prototype, 'ownerStopped').mockResolvedValue(false)
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

  it('ignores SDK client-owned tasks and progress when listing background tasks', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tasks-'))
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
    ;(client.session.backgroundTasks as unknown[]).push({
      type: 'client',
      id: 'client-task',
      clientTaskId: 'owner-key',
      status: 'running',
      startedAt: '2026-10-05T18:00:00.000Z',
    })
    client.session.backgroundTasks.push({
      type: 'shell',
      id: 'shell-task',
      description: 'Run the build',
      status: 'running',
      startedAt: '2026-10-05T18:00:01.000Z',
    })
    ;(client.session.taskProgress as Map<string, unknown>).set('shell-task', { type: 'client' })

    const listed = await service.listBackgroundTasks(created.id)
    expect(listed.tasks.map((task) => task.id)).toEqual(['shell-task'])
    expect(listed.tasks[0].progress).toBeUndefined()
    expect(listed.runningCount).toBe(1)
    await service.stop()
  })

  it.each([
    [{ kind: 'set-model', model: 'fixture-model', warning: 'Uses premium requests' }, 'Model set to fixture-model\n\nUses premium requests'],
    [{ kind: 'set-plan-model', planModel: 'plan-model', message: 'Plan model set to plan-model' }, 'Plan model set to plan-model'],
    [{ kind: 'add-timeline-entry', entry: { type: 'info', text: '\u001b[1mTimeline note\u001b[0m' } }, 'Timeline note'],
    [{ kind: 'show-dialog', dialog: { kind: 'model-picker' } }, '/usage'],
  ] as const)('renders SDK slash-command result %o as a notice', async (result, expected) => {
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
    vi.spyOn(client.session.rpc.commands, 'invoke').mockResolvedValueOnce(
      result as unknown as Awaited<ReturnType<typeof client.session.rpc.commands.invoke>>,
    )
    const updated = await service.executeCommand(client.session.sessionId, '/usage')
    expect(updated.messages.filter((message) => message.role === 'notice').at(-1)?.content)
      .toBe(expected)
    await service.stop()
  })

  it('keeps legacy factory permission titles from older runtimes', async () => {
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
    vi.spyOn(client, 'createSession').mockImplementationOnce(async (config) => {
      client.createdConfigs.push(config)
      return new DeferredSession('factory-session')
    })
    const guarded = await service.createSession(directory, false, false)
    const handler = client.createdConfigs.at(-1)?.onPermissionRequest
    if (!handler) throw new Error('Permission handler was not configured')
    const response = handler(
      { kind: 'factory', operation: 'author', name: 'release-notes' } as unknown as Parameters<typeof handler>[0],
      { sessionId: guarded.id },
    )
    await vi.waitFor(() =>
      expect(service.store.get(guarded.id)?.pendingPermission?.title).toBe('Author factory release-notes'),
    )
    const request = service.store.get(guarded.id)!.pendingPermission!
    await service.replyPermission(guarded.id, request.requestId, 'allow-once')
    await expect(response).resolves.toEqual({ kind: 'approve-once' })
    await service.stop()
  })

  it('holds an SDK queue behind a running background agent', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tasks-'))
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
    const backgroundAgent = {
      type: 'agent' as const,
      id: 'task-queue',
      description: 'Review the repository',
      status: 'running' as const,
      startedAt: '2026-09-07T20:00:00.000Z',
      agentType: 'general-purpose',
      executionMode: 'background' as const,
    }
    client.session.backgroundTasks.push(backgroundAgent)
    await service.listBackgroundTasks(created.id)

    const queued = await service.sendMessage(
      created.id,
      'Continue after the review',
      true,
    )
    expect(queued.queuedPrompts).toEqual([
      expect.objectContaining({ content: 'Continue after the review' }),
    ])
    expect(client.session.sentPrompts).toEqual([])

    Object.assign(backgroundAgent, {
      status: 'completed',
      completedAt: '2026-09-07T20:01:00.000Z',
    })
    client.session.emit({
      type: 'session.background_tasks_changed',
      id: 'tasks-changed',
      parentId: null,
      timestamp: '2026-09-07T20:01:00.000Z',
      data: {},
    } as SessionEvent)

    await vi.waitFor(() =>
      expect(client.session.sentPrompts).toEqual([
        'Continue after the review',
      ]),
    )
    expect(service.store.get(created.id)?.queuedCount).toBe(0)

    client.session.resolvePrompt()
    await service.stop()
  })

  it('waits for the final task resync before waking an SDK queue', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tasks-'))
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
      type: 'agent',
      id: 'task-old',
      description: 'Old review',
      status: 'running',
      startedAt: '2026-09-08T14:00:00.000Z',
      executionMode: 'background',
    })
    await service.listBackgroundTasks(created.id)
    await service.sendMessage(created.id, 'Continue after every review', true)

    let releaseFirst!: () => void
    const firstRead = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    let reads = 0
    const replacementAgent = {
      type: 'agent' as const,
      id: 'task-new',
      description: 'New review',
      status: 'running' as const,
      startedAt: '2026-09-08T14:01:00.000Z',
      executionMode: 'background' as const,
    }
    client.session.rpc.tasks.list = async () => {
      reads += 1
      if (reads === 1) {
        await firstRead
        return { tasks: [] }
      }
      return { tasks: [replacementAgent] }
    }

    const completionSync = service['syncBackgroundTasks'](
      created.id,
      client.session,
    )
    await vi.waitFor(() => expect(reads).toBe(1))
    void service['syncBackgroundTasks'](created.id, client.session)
    releaseFirst()
    await completionSync

    expect(client.session.sentPrompts).toEqual([])
    expect(service.store.get(created.id)?.queuedCount).toBe(1)
    expect(
      service['backgroundTaskTracker'].get(created.id).tasks,
    ).toEqual([
      expect.objectContaining({ id: 'task-new', status: 'running' }),
    ])

    Object.assign(replacementAgent, {
      status: 'completed',
      completedAt: '2026-09-08T14:02:00.000Z',
    })
    await service['syncBackgroundTasks'](created.id, client.session)
    await vi.waitFor(() =>
      expect(client.session.sentPrompts).toEqual([
        'Continue after every review',
      ]),
    )

    client.session.resolvePrompt()
    await service.stop()
  })

  it('wakes a queue when a coalesced task sync began idle and ended idle', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tasks-'))
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
    let releaseRunning!: () => void
    let releaseIdle!: () => void
    const runningRead = new Promise<void>((resolve) => {
      releaseRunning = resolve
    })
    const idleRead = new Promise<void>((resolve) => {
      releaseIdle = resolve
    })
    let reads = 0
    client.session.rpc.tasks.list = async () => {
      reads += 1
      if (reads === 1) {
        await runningRead
        return {
          tasks: [
            {
              type: 'agent',
              id: 'task-interim',
              description: 'Interim review',
              status: 'running',
              startedAt: '2026-09-08T14:00:00.000Z',
              executionMode: 'background',
            },
          ],
        }
      }
      await idleRead
      return { tasks: [] }
    }

    const syncing = service['syncBackgroundTasks'](
      created.id,
      client.session,
    )
    await vi.waitFor(() => expect(reads).toBe(1))
    void service['syncBackgroundTasks'](created.id, client.session)
    releaseRunning()
    await vi.waitFor(() => expect(reads).toBe(2))
    await service.sendMessage(
      created.id,
      'Continue after the coalesced review',
      true,
    )
    expect(service.store.get(created.id)?.queuedCount).toBe(1)
    expect(client.session.sentPrompts).toEqual([])

    releaseIdle()
    await syncing
    await vi.waitFor(() =>
      expect(client.session.sentPrompts).toEqual([
        'Continue after the coalesced review',
      ]),
    )

    client.session.resolvePrompt()
    await service.stop()
  })

  it('clears stale SDK task state before draining a queue after restart', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tasks-'))
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
      type: 'agent',
      id: 'task-restart',
      description: 'Review before restart',
      status: 'running',
      startedAt: '2026-09-08T14:00:00.000Z',
      executionMode: 'background',
    })
    await service.listBackgroundTasks(created.id)
    await service.sendMessage(created.id, 'Continue after restart', true)
    await vi.waitFor(() => {
      expect(service.store.get(created.id)?.status).toBe('idle')
      expect(service['drainingSessions'].has(created.id)).toBe(false)
    })
    client.session.backgroundTasks.length = 0
    let releaseOldSync!: () => void
    const oldSyncRead = new Promise<void>((resolve) => {
      releaseOldSync = resolve
    })
    let reads = 0
    client.session.rpc.tasks.list = async () => {
      reads += 1
      if (reads === 1) {
        await oldSyncRead
        return {
          tasks: [
            {
              type: 'agent',
              id: 'task-stale',
              description: 'Stale review',
              status: 'running',
              startedAt: '2026-09-08T14:01:00.000Z',
              executionMode: 'background',
            },
          ],
        }
      }
      return { tasks: [] }
    }
    const staleSync = service['syncBackgroundTasks'](
      created.id,
      client.session,
    )
    await vi.waitFor(() => expect(reads).toBe(1))

    await service.restartSession(created.id)
    releaseOldSync()
    await staleSync

    await vi.waitFor(() =>
      expect(client.session.sentPrompts).toEqual(['Continue after restart']),
    )
    expect(service.store.get(created.id)?.queuedCount).toBe(0)
    expect(
      service['backgroundTaskTracker'].get(created.id).tasks,
    ).toEqual([])

    client.session.resolvePrompt()
    await service.stop()
  })

  it('drops a task read that a restart has already overtaken', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-stale-tasks-'))
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

    // Only the first read is held: it is the one already in flight when the
    // runtime is replaced, and it still answers for the agent running in it.
    let release!: () => void
    const held = new Promise<void>((resolve) => { release = resolve })
    const listed = client.session.rpc.tasks!.list!
    let call = 0
    client.session.rpc.tasks!.list = async () => {
      call += 1
      if (call > 1) return { tasks: [] } as Awaited<ReturnType<typeof listed>>
      await held
      return { tasks: [{
        type: 'agent', id: 'task-stale', description: 'Overtaken review',
        status: 'running', startedAt: '2026-09-08T14:00:00.000Z',
        executionMode: 'background',
      }] } as Awaited<ReturnType<typeof listed>>
    }
    const reading = service['syncBackgroundTasks'](created.id)
    // The restart completes first, on its own read, and only then does the
    // overtaken answer arrive -- which is the order that reinstated it.
    await service.restartSession(created.id)
    release()
    await reading

    // The restarted runtime has no agent, so the retired answer must not put
    // one back and hold the queue closed again.
    expect(service['backgroundTaskTracker'].get(created.id).tasks).toEqual([])
    await service.stop()
  })

  it('wakes a queue for an agent that began and finished inside one sync', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-coalesced-'))
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

    // Reads are coalesced. This sync opens with nothing running, sees an agent
    // running, and closes with nothing running again, so the whole run happens
    // inside it. Judging the release by the state it opened on missed that.
    const listed = client.session.rpc.tasks!.list!
    let call = 0
    client.session.rpc.tasks!.list = async () => {
      call += 1
      if (call === 1) {
        service['backgroundTaskResyncNeeded'].add(created.id)
        return { tasks: [{
          type: 'agent', id: 'task-coalesced', description: 'Brief review',
          status: 'running', startedAt: '2026-09-08T14:00:00.000Z',
          executionMode: 'background',
        }] } as Awaited<ReturnType<typeof listed>>
      }
      return { tasks: [] } as Awaited<ReturnType<typeof listed>>
    }
    const wake = vi.spyOn(
      service as unknown as { wakeSdkQueue: (id: string) => void },
      'wakeSdkQueue',
    )

    await service['syncBackgroundTasks'](created.id)

    expect(call).toBeGreaterThan(1)
    expect(wake).toHaveBeenCalledWith(created.id)
    await service.stop()
  })

  it('does not drain a restarted tmux queue through the SDK', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tmux-restart-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
      async () => [],
      undefined,
      {
        restart: vi.fn(async () => true),
        has: vi.fn(async () => true),
        send: vi.fn(async () => true),
        cancel: vi.fn(async () => true),
      },
    )
    await service.start()
    const created = await service.createSession(directory, false)
    // Owned by tmux, which keeps its own runtime across a restart.
    service['externalSessionIds'].add(created.id)
    await service.store.update(created.id, (session) => {
      session.queuedPrompts = [{
        id: 'queued-tmux', content: 'Belongs to the terminal',
        createdAt: new Date().toISOString(),
      }]
      session.queuedCount = 1
    })
    const wake = vi.spyOn(
      service as unknown as { wakeSdkQueue: (id: string) => void },
      'wakeSdkQueue',
    )

    await service.restartSession(created.id)

    // Draining it here would start a second owner beside the pane's own.
    expect(wake).not.toHaveBeenCalled()
    expect(client.session.sentPrompts).toEqual([])
    await service.stop()
  })

  it('does not release the queue from a read settling during the disconnect', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-disconnect-'))
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
    // Something was running when this read began, so its answer would look
    // like a release if it were still allowed to speak.
    service['backgroundTaskTracker'].replace(created.id, [{
      id: 'task-disconnecting', type: 'agent',
      description: 'Review in the old runtime', status: 'running',
      startedAt: '2026-09-08T14:00:00.000Z', executionMode: 'background',
      canCancel: false,
    }], true)

    let release!: () => void
    const held = new Promise<void>((resolve) => { release = resolve })
    const listed = client.session.rpc.tasks!.list!
    let call = 0
    client.session.rpc.tasks!.list = async () => {
      call += 1
      if (call > 1) return { tasks: [] } as Awaited<ReturnType<typeof listed>>
      await held
      return { tasks: [] } as Awaited<ReturnType<typeof listed>>
    }
    const reading = service['syncBackgroundTasks'](created.id)
    const wake = vi.spyOn(
      service as unknown as { wakeSdkQueue: (id: string) => void },
      'wakeSdkQueue',
    )

    // The read settles part-way through the teardown, while the old runtime
    // is being disconnected and before anything has replaced it.
    const disconnect = client.session.disconnect.bind(client.session)
    client.session.disconnect = async () => {
      release()
      await reading
      await disconnect()
    }
    await service.restartSession(created.id)
    await reading

    // Its answer describes the runtime that was replaced, so it cannot send a
    // prompt into the one being built.
    expect(wake).not.toHaveBeenCalled()
    await service.stop()
  })

  it('leaves the resync request of the sync that replaced it alone', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-resync-'))
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

    let release!: () => void
    const held = new Promise<void>((resolve) => { release = resolve })
    const listed = client.session.rpc.tasks!.list!
    let call = 0
    client.session.rpc.tasks!.list = async () => {
      call += 1
      if (call > 1) return { tasks: [] } as Awaited<ReturnType<typeof listed>>
      await held
      return { tasks: [] } as Awaited<ReturnType<typeof listed>>
    }
    const stale = service['syncBackgroundTasks'](created.id)

    await service.restartSession(created.id)
    // The runtime that replaced it has work of its own to re-read.
    service['backgroundTaskResyncNeeded'].add(created.id)
    release()
    await stale

    // A retired sync settling must not take that request away, or the agent
    // it finished with stays recorded as running.
    expect(service['backgroundTaskResyncNeeded'].has(created.id)).toBe(true)
    await service.stop()
  })

  it('keeps a refusal definite when it is answering a recovery resend', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-resend-definite-'))
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
    await service.store.update(created.id, (session) => {
      session.failedPrompt = {
        content: '/model',
        failedAt: 'resend:definite',
        uncertain: true,
      }
    })
    await service.store.setSuspended(created.id, true)

    // Refused before dispatch while answering a failure. Saying so must not
    // be read back as doubt: the mark carries a value, not just a presence.
    // A command takes the failure's claim before the refusal is raised, so the
    // refusal is reported through the claim-answering path.
    await expect(
      service.executeCommand(created.id, '/model', false, 'resend:definite'),
    ).rejects.toMatchObject({ uncertainDelivery: false })
    await service.stop()
  })

  it('leaves a lost command result uncertain rather than definitely unsent', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-invoke-lost-'))
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
    // The command was handed over and the reply never came back. It may well
    // have run, so reporting it as definitely unsent invites resending it.
    client.session.rpc.commands.invoke = async () => {
      throw new Error('socket hang up')
    }

    await expect(
      service.executeCommand(created.id, '/model'),
    ).rejects.toMatchObject({ uncertainDelivery: true })
    await service.stop()
  })

  it('reports a refusal that never reached the provider as definite', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-preflight-'))
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
    await service.store.setSuspended(created.id, true)

    // Nothing was handed over, so the reader can retype it safely. Without
    // saying so the client has to treat it as possibly delivered.
    await expect(
      service.sendMessage(created.id, 'Held behind a suspended session'),
    ).rejects.toMatchObject({ uncertainDelivery: false })
    await service.stop()
  })

  it('leaves an unconfirmed follow-up uncertain rather than definitely unsent', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-followup-'))
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
    await service.sendMessage(created.id, 'Open the turn')
    await vi.waitFor(() => {
      expect(service['activePrompts'].has(created.id)).toBe(true)
    })
    // The prompt reached the SDK; only its acknowledgement is missing. It may
    // already be steering the turn, so sending it again would steer twice.
    client.session.send = async () => undefined as unknown as string

    await expect(
      service.sendMessage(created.id, 'Steer the open turn'),
    ).rejects.toMatchObject({ uncertainDelivery: true })

    client.session.resolvePrompt()
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

  it.each(['unreadable socket', 'different mount namespace'])(
    'defers indeterminate terminal recovery without failing cold startup: %s',
    async (reason) => {
      const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-discovery-'))
      directories.push(directory)
      const store = new SessionStore(path.join(directory, 'state'))
      await store.initialize()
      await store.create({
        id: 'terminal-owner', cwd: directory, title: 'Retained terminal',
        updatedAt: '2026-09-05T00:00:00.000Z', status: 'idle', isOpen: true,
        messages: [{
          id: 'history', role: 'user', content: 'Retain this history',
          createdAt: '2026-09-05T00:00:00.000Z',
        }],
        queuedCount: 1,
        queuedPrompts: [{
          id: 'queued', content: 'Wait for proven ownership', createdAt: '2026-09-05T00:00:00.000Z',
        }],
      }, { managedOpen: true, backend: 'terminal' })
      const client = new FakeCopilotClient()
      client.models = [configurableModel()]
      const failure = new Error(`tmux discovery indeterminate: ${reason}`)
      let unavailable = true
      let live = false
      const active = vi.fn(async () => {
        if (unavailable) throw failure
        return live ? [{
          id: 'terminal-owner', cwd: directory, title: 'Retained terminal',
          updatedAt: '2026-09-05T00:00:00.000Z',
        }] : []
      })
      const terminal = {
        has: vi.fn(async () => live),
        create: vi.fn(async () => {
          live = true
          return { sessionName: 'fixture', windowId: '@1' }
        }),
        send: vi.fn(async () => true),
        cancel: vi.fn(async () => true),
      }
      const stop = vi.fn(async () => { throw failure })
      const service = new AgentService(
        store, client, active, stop, async () => [], async () => undefined,
        terminal, async () => undefined, async () => undefined,
      )
      const errors: string[] = []
      service.on('event', (event) => { if (event.type === 'error') errors.push(event.message) })
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      try {
        await expect(service.start()).resolves.toBeUndefined()
        expect(store.get('terminal-owner')).toMatchObject({
          isOpen: true, queuedCount: 1, messages: [expect.objectContaining({ content: 'Retain this history' })],
        })
        expect(errors).toContain(failure.message)
        expect(warning).toHaveBeenCalled()
        expect(terminal.create).not.toHaveBeenCalled()
        expect(terminal.send).not.toHaveBeenCalled()
        expect(client.resumedSessionIds).toEqual([])
        const retained = store.get('terminal-owner')
        await expect(service.openSession('terminal-owner')).resolves.toEqual(retained)
        expect(store.shouldRecoverTerminalSession('terminal-owner')).toBe(true)
        await expect(service.activateSession('terminal-owner')).rejects.toThrow(/discovery/)
        await expect(service.listCommands('terminal-owner')).rejects.toThrow(/discovery/)
        expect(client.resumedSessionIds).toEqual([])
        expect(store.get('terminal-owner')).toEqual(retained)
        await expect(service.sendMessage('terminal-owner', 'Do not assume ownership')).rejects.toThrow(/discovery/)
        await expect(service.deleteSession('terminal-owner')).rejects.toBe(failure)
        expect(stop).toHaveBeenCalledOnce()
        expect(store.get('terminal-owner')).toBeDefined()
        unavailable = false
        await service.refreshDiscovery()
        expect(terminal.create).not.toHaveBeenCalled()
        expect(store.get('terminal-owner')).toMatchObject({ isOpen: false, queuedCount: 1 })
        expect(store.shouldRecoverTerminalSession('terminal-owner')).toBe(true)
        live = true
        await service.refreshDiscovery()
        expect(store.get('terminal-owner')).toMatchObject({ isOpen: true, queuedCount: 1 })
        await service.refreshDiscovery()
        expect(terminal.create).not.toHaveBeenCalled()
        expect(client.resumedSessionIds).toEqual([])
      } finally {
        await service.stop()
        warning.mockRestore()
      }
    },
  )

  it('keeps a backend-less legacy owner closed while terminal discovery is indeterminate', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-legacy-owner-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    await store.create({
      id: 'legacy-owner', cwd: directory, title: 'Legacy live owner',
      updatedAt: '2026-09-05T00:00:00.000Z', status: 'idle', isOpen: true,
      messages: [],
    }, { managedOpen: true })
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    client.nextSessionList = Promise.resolve([{
      sessionId: 'legacy-owner', startTime: new Date(), modifiedTime: new Date(),
      summary: 'Legacy live owner', isRemote: false,
      context: { workingDirectory: directory },
    }])
    let unavailable = true
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
    }
    const service = new AgentService(
      store, client,
      async () => {
        if (unavailable) throw new Error('Indeterminate tmux discovery')
        return [{
          id: 'legacy-owner', cwd: directory, title: 'Legacy live owner',
          updatedAt: '2026-09-05T00:00:00.000Z',
        }]
      }, async () => undefined, async () => [], async () => undefined, terminal,
    )
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      await service.start()
      expect(store.backend('legacy-owner')).toBeUndefined()
      await expect(service.activateSession('legacy-owner')).rejects.toThrow(/discovery/)
      expect(client.resumedSessionIds).toEqual([])
      unavailable = false
      await service.refreshDiscovery()
      expect(store.backend('legacy-owner')).toBe('terminal')
      expect(client.resumedSessionIds).toEqual([])
    } finally {
      await service.stop()
      warning.mockRestore()
    }
  })

  it('does not hide an SDK listing failure behind simultaneous terminal uncertainty', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-dual-discovery-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const sdkFailure = new Error('SDK listing failed')
    vi.spyOn(client, 'listSessions').mockRejectedValue(sdkFailure)
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => { throw new Error('Terminal discovery failed') },
    )
    await expect(service.start()).rejects.toBe(sdkFailure)
    await service.stop()
  })

  it('still rejects cold startup when non-discovery state writes fail', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-discovery-write-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const failure = new Error('State persistence refused')
    const sync = vi.spyOn(store, 'syncDiscovered').mockRejectedValue(failure)
    const service = new AgentService(store, client, async () => [])
    try {
      await expect(service.start()).rejects.toBe(failure)
    } finally {
      sync.mockRestore()
      await service.stop()
    }
  })

  it.each(['stop', 'delete'] as const)('orders deferred terminal recovery with %s', async (operation) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-late-recovery-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot'))
    const id = randomUUID()
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    await store.create({
      id, cwd: directory, title: 'Deferred recovery',
      updatedAt: '2026-09-05T00:00:00.000Z', isOpen: true, status: 'idle', messages: [],
    }, { backend: 'terminal', managedOpen: true })
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    let unavailable = true
    let enter = () => {}
    let finish = () => {}
    const entered = new Promise<void>((resolve) => { enter = resolve })
    const gate = new Promise<void>((resolve) => { finish = resolve })
    const terminal = {
      has: vi.fn(async () => { enter(); await gate; return false }),
      create: vi.fn(async () => ({ sessionName: 'fixture', windowId: '@1' })),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
    }
    const service = new AgentService(
      store, client, async () => {
        if (unavailable) throw new Error('Indeterminate tmux discovery')
        return []
      }, async () => {}, async () => [], async () => undefined,
      terminal, async () => undefined, async () => undefined,
    )
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      await service.start()
      unavailable = false
      const recovery = service.refreshDiscovery()
      await entered
      const changing = operation === 'stop' ? service.stop() : service.deleteSession(id)
      finish()
      await Promise.all([recovery, changing])
      if (operation === 'stop') {
        expect(terminal.create).not.toHaveBeenCalled()
      } else {
        expect(store.get(id)).toBeUndefined()
        expect(terminal.create).toHaveBeenCalledOnce()
        await service.refreshDiscovery()
        expect(terminal.create).toHaveBeenCalledOnce()
      }
    } finally {
      finish()
      await service.stop()
      warning.mockRestore()
    }
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

  it('keeps a mode-only SDK session in its mode when cleared', async () => {
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
    const created = await service.createSession(
      directory, false, true, 'copilot', undefined, undefined, undefined, 'plan',
    )
    expect(client.session.modeSwitches).toEqual(['plan'])

    const cleared = await service.clearConversation(created.id)

    expect(client.createdConfigs.at(-1)).toMatchObject({ sessionId: cleared.id })
    expect(client.createdConfigs.at(-1)?.model).toBeUndefined()
    expect(client.session.modeSwitches).toEqual(['plan', 'plan'])
    expect(cleared.runtime?.mode).toBe('plan')
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

  it('persists SDK ownership when Restart recovers a vanished managed terminal', async () => {
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
    await service.store.setBackend(created.id, 'terminal')
    service['externalSessionIds'].add(created.id)
    vi.mocked(service['terminalController'].ownerStopped!).mockResolvedValueOnce(true)

    const restarted = await service.restartSession(created.id)

    expect(restarted.executionMode).toBe('sdk')
    expect(service.store.backend(created.id)).toBe('sdk')
    await expect(service.openSession(created.id)).resolves.toMatchObject({
      id: created.id,
      executionMode: 'sdk',
    })
    expect(client.resumedSessionIds).toContain(created.id)
    await service.stop()
  })

  it('does not duplicate an ambiguously owned managed terminal during Restart', async () => {
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
    await service.store.setBackend(created.id, 'terminal')
    service['externalSessionIds'].add(created.id)

    await expect(service.restartSession(created.id)).rejects.toThrow(
      /still available|could not be confirmed stopped/,
    )
    expect(service.store.backend(created.id)).toBe('terminal')
    expect(client.resumedSessionIds).not.toContain(created.id)
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

  it('starts new SDK sessions in the requested agent mode', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const services: AgentService[] = []
    const fresh = async () => {
      const client = new FakeCopilotClient()
      client.models = [configurableModel()]
      const service = new AgentService(
        new SessionStore(path.join(directory, `state-${services.length}`)),
        client,
        async () => [],
        async () => undefined,
      )
      services.push(service)
      await service.start()
      return { client, service }
    }
    try {
      const moded = await fresh()
      const created = await moded.service.createSession(
        directory, false, true, 'copilot', undefined, undefined, undefined, 'autopilot',
      )
      expect(moded.client.session.modeSwitches).toEqual(['autopilot'])
      expect(moded.client.createdConfigs.at(-1)).not.toHaveProperty('mode')
      expect(created.runtime?.mode).toBe('autopilot')

      const plain = await fresh()
      const unmoded = await plain.service.createSession(directory, false)
      expect(plain.client.session.modeSwitches).toEqual([])
      expect(unmoded.runtime).not.toHaveProperty('mode')

      const refused = await fresh()
      refused.client.session.modeSetError = new Error('Mode unavailable')
      await expect(refused.service.createSession(
        directory, false, true, 'copilot', undefined, undefined, undefined, 'plan',
      )).rejects.toThrow('Mode unavailable')
      expect(refused.client.deletedSessionIds).toContain(refused.client.session.sessionId)
      expect(refused.service.listSessions()).toEqual([])

      const invalid = await fresh()
      await expect(invalid.service.createSession(
        directory, false, true, 'copilot', undefined, undefined, undefined,
        'shell' as unknown as 'plan',
      )).rejects.toThrow('Selected agent mode is not supported')
      expect(invalid.client.createdConfigs).toEqual([])
    } finally {
      for (const service of services) await service.stop()
    }
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
    const planned = await service.createSession(
      directory, true, true, 'copilot', undefined, undefined, undefined, 'plan',
    )
    expect(terminal.create).toHaveBeenLastCalledWith(
      planned.id,
      directory,
      path.basename(directory),
      true,
      { mode: 'plan' },
    )
    expect(planned.runtime?.mode).toBe('plan')
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

  it('takes recovery ownership of a discovered terminal the app relaunches', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
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
    const ids = ['observed', 'configured', 'restarted', 'cleared']
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => ids.map((id) => ({
        id,
        cwd: directory,
        title: id,
        updatedAt: new Date().toISOString(),
      })),
      async () => undefined,
      async () => [],
      async () => undefined,
      terminal,
    )
    await service.start()
    for (const id of ids) expect(service.store.isManagedOpen(id)).toBe(false)

    await service.configureRuntime('configured', {
      model: 'fixture-configurable',
      reasoningEffort: 'high',
      contextTier: 'long_context',
    })
    await service.restartSession('restarted')
    const cleared = await service.clearConversation('cleared')

    expect(terminal.configure).toHaveBeenCalledOnce()
    expect(terminal.restart).toHaveBeenCalledOnce()
    expect(terminal.reset).toHaveBeenCalledOnce()
    expect(service.store.isManagedOpen('observed')).toBe(false)
    for (const id of ['configured', 'restarted', cleared.id]) {
      expect(service.store.shouldRecoverTerminalSession(id)).toBe(true)
    }
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
      status: 'idle',
      isOpen: true,
    })
    expect(service.store.shouldRecoverTerminalSession(firstId)).toBe(true)
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
    expect(client.session.modeSwitches).toEqual([])
    await service.stop()
  })

  it('recreates a missing empty SDK session in its stored mode', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const store = new SessionStore(path.join(directory, 'state'))
    await store.initialize()
    const sessionId = '12345678-aaaa-bbbb-cccc-123456789abd'
    await store.create(
      {
        id: sessionId,
        cwd: directory,
        title: 'Empty autopilot session',
        updatedAt: '2026-07-24T20:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
        runtime: { allowAllPermissions: true, mode: 'autopilot' },
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

    expect(client.createdConfigs.at(-1)).toMatchObject({ sessionId })
    expect(client.session.modeSwitches).toEqual(['autopilot'])
    expect(activated.runtime?.mode).toBe('autopilot')
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

  it('never lists a session excluded from discovery, such as the manager agent', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-test-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const listed = (sessionId: string, summary: string) => ({
      sessionId,
      startTime: new Date(),
      modifiedTime: new Date(),
      summary,
      isRemote: false,
      context: { workingDirectory: directory },
    })
    client.nextSessionList = Promise.resolve([
      listed('11111111-abcd-abcd-abcd-123456789abc', 'Manager conversation'),
      listed('22222222-abcd-abcd-abcd-123456789abc', 'Real work'),
    ])
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [],
      async () => undefined,
    )
    service.excludeFromDiscovery(['11111111-abcd-abcd-abcd-123456789abc'])

    await service.start()

    expect(service.listHistory().map((session) => session.title)).toEqual(['Real work'])
    expect(service.getSession('11111111-abcd-abcd-abcd-123456789abc')).toBeUndefined()
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

  it('steers an active SDK turn with an immediate follow-up prompt', async () => {
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
    const created = await service.createSession(directory, false)

    await service.sendMessage(created.id, 'Start the investigation')
    const activeAssistant =
      service['activePrompts'].get(created.id)?.assistantMessageId
    const steered = await service.sendMessage(
      created.id,
      'Focus on the queue race first',
    )

    expect(client.session.sentPrompts).toEqual([
      'Start the investigation',
      'Focus on the queue race first',
    ])
    expect(steered.status).toBe('running')
    expect(
      steered.messages.filter((message) => message.role === 'user').at(-1),
    ).toMatchObject({ content: 'Focus on the queue race first' })
    expect(
      service['activePrompts'].get(created.id)?.assistantMessageId,
    ).not.toBe(activeAssistant)
    expect(steered.messages.at(-1)).toMatchObject({
      role: 'assistant',
      streaming: true,
    })

    client.session.resolvePrompt()
    await service.stop()
  })

  it('lets go of a follow-up tracker when its session is deleted', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-tracker-delete-'))
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
    await service.sendMessage(created.id, 'Start the investigation')
    let acceptFollowUp!: (messageId: string) => void
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      return new Promise<string>((resolve) => { acceptFollowUp = resolve })
    })
    const steering = service.sendMessage(created.id, 'Steer the turn')
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('Steer the turn')
    })
    client.session.resolvePrompt({
      id: randomUUID(), type: 'assistant.message',
      timestamp: new Date().toISOString(), parentId: null,
      data: { messageId: 'original-response', content: 'base answer' },
    } as AssistantMessageEvent)
    await new Promise((resolve) => setTimeout(resolve, 0))
    acceptFollowUp('follow-up-message')
    await steering
    await vi.waitFor(() => {
      expect(service['sdkFollowUpTrackers'].has(created.id)).toBe(true)
    })

    await service.deleteSession(created.id)

    // Disconnecting does not always announce itself, so a deleted session
    // must not be left holding its tracker, and through it an SDK session.
    expect(service['sdkFollowUpTrackers'].has(created.id)).toBe(false)
    await service.stop()
  })

  it('lets a second follow-up close its own turn once nothing else will', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-second-followup-'))
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
    await service.sendMessage(created.id, 'Start the investigation')

    // The turn ends before the first follow-up is accepted, so that follow-up
    // takes the turn over and the turn's own handler returns.
    let acceptFirst!: (messageId: string) => void
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      return new Promise<string>((resolve) => { acceptFirst = resolve })
    })
    const first = service.sendMessage(created.id, 'Steer once')
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('Steer once')
    })
    client.session.resolvePrompt({
      id: randomUUID(), type: 'assistant.message',
      timestamp: new Date().toISOString(), parentId: null,
      data: { messageId: 'original-response', content: 'base answer' },
    } as AssistantMessageEvent)
    await new Promise((resolve) => setTimeout(resolve, 0))
    acceptFirst('first-follow-up')
    await first
    await vi.waitFor(() => {
      expect(service['sdkTurnsAwaited'].has(created.id)).toBe(false)
    })

    // Nothing is left awaiting the turn, so this one closes itself -- and the
    // follow-up it supersedes must stop watching, or it answers this idle for
    // an assistant that has already finished.
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      return 'second-follow-up'
    })
    await service.sendMessage(created.id, 'Steer again')
    const secondAssistant =
      service['activePrompts'].get(created.id)?.assistantMessageId

    client.session.emit({
      id: randomUUID(), type: 'assistant.message',
      timestamp: new Date().toISOString(), parentId: null,
      data: { messageId: 'second-response', content: 'second answer' },
    } as AssistantMessageEvent)
    client.session.emit({
      id: randomUUID(), type: 'session.idle',
      timestamp: new Date().toISOString(), parentId: null, data: {},
    } as SessionEvent)
    await vi.waitFor(() => {
      expect(
        service.store.get(created.id)?.messages.find(
          (message) => message.id === secondAssistant,
        ),
      ).toMatchObject({ streaming: false })
    })
    expect(service.store.get(created.id)?.status).toBe('idle')
    // Nothing is watching once the turn has ended, so the session is not left
    // holding a tracker -- and through it an SDK session -- for good.
    expect(service['sdkFollowUpTrackers'].has(created.id)).toBe(false)
    await service.stop()
  })

  it('refuses a second follow-up while the first is still being sent', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-overlap-followup-'))
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
    await service.sendMessage(created.id, 'Start the investigation')
    let acceptFirst!: (messageId: string) => void
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      return new Promise<string>((resolve) => { acceptFirst = resolve })
    })
    const first = service.sendMessage(created.id, 'Steer once')
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('Steer once')
    })

    // Both would take the same pending slot, so the turn one is steering is
    // the turn the other would close, and replies would land on whichever
    // assistant message won the race.
    await expect(
      service.sendMessage(created.id, 'Steer twice'),
    ).rejects.toMatchObject({
      statusCode: 409,
      uncertainDelivery: false,
      message: expect.stringContaining('already being sent'),
    })
    expect(client.session.sentPrompts).not.toContain('Steer twice')

    client.session.resolvePrompt({
      id: randomUUID(), type: 'assistant.message',
      timestamp: new Date().toISOString(), parentId: null,
      data: { messageId: 'original-response', content: 'base answer' },
    } as AssistantMessageEvent)
    await new Promise((resolve) => setTimeout(resolve, 0))
    acceptFirst('first-follow-up')
    await first
    expect(service['pendingSdkFollowUps'].has(created.id)).toBe(false)
    await service.stop()
  })

  it('lets Stop end a follow-up that is still being handed over', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-stop-pending-followup-'))
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
    await service.sendMessage(created.id, 'Start the investigation')
    let acceptFollowUp!: (messageId: string) => void
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      return new Promise<string>((resolve) => { acceptFollowUp = resolve })
    })
    const steering = service.sendMessage(created.id, 'Steer the turn')
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('Steer the turn')
    })

    // Stopped before the send is acknowledged, so there is no tracker yet to
    // tell. The admission it will be built from has to carry the stop.
    await service.cancel(created.id)

    client.session.resolvePrompt({
      id: randomUUID(), type: 'assistant.message',
      timestamp: new Date().toISOString(), parentId: null,
      data: { messageId: 'original-response', content: 'base answer' },
    } as AssistantMessageEvent)
    await new Promise((resolve) => setTimeout(resolve, 0))
    acceptFollowUp('follow-up-message')
    await steering
    await vi.waitFor(() => {
      expect(service['sdkFollowUpTrackers'].has(created.id)).toBe(true)
    })
    client.session.emit({
      id: randomUUID(), type: 'session.idle',
      timestamp: new Date().toISOString(), parentId: null, data: {},
    } as SessionEvent)

    await vi.waitFor(() => {
      expect(service.store.get(created.id)?.status).toBe('idle')
    })
    expect(service['activePrompts'].has(created.id)).toBe(false)
    expect(service['sdkFollowUpTrackers'].has(created.id)).toBe(false)
    await service.stop()
  })

  it('lets Stop end a follow-up that never produced anything', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-stop-followup-'))
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
    await service.sendMessage(created.id, 'Start the investigation')
    let acceptFollowUp!: (messageId: string) => void
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      return new Promise<string>((resolve) => { acceptFollowUp = resolve })
    })
    const steering = service.sendMessage(created.id, 'Steer the turn')
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('Steer the turn')
    })
    client.session.resolvePrompt({
      id: randomUUID(), type: 'assistant.message',
      timestamp: new Date().toISOString(), parentId: null,
      data: { messageId: 'original-response', content: 'base answer' },
    } as AssistantMessageEvent)
    await new Promise((resolve) => setTimeout(resolve, 0))
    acceptFollowUp('follow-up-message')
    await steering
    await vi.waitFor(() => {
      expect(service['sdkFollowUpTrackers'].has(created.id)).toBe(true)
    })

    // Stopped before it wrote anything, so the only event still to come is the
    // idle. Ignoring it would leave the session running and Restart blocked.
    await service.cancel(created.id)
    client.session.emit({
      id: randomUUID(), type: 'session.idle',
      timestamp: new Date().toISOString(), parentId: null, data: {},
    } as SessionEvent)

    await vi.waitFor(() => {
      expect(service.store.get(created.id)?.status).toBe('idle')
    })
    expect(service['activePrompts'].has(created.id)).toBe(false)
    expect(service['sdkFollowUpTrackers'].has(created.id)).toBe(false)
    await service.stop()
  })

  it('keeps SDK follow-up ownership when the original turn idles before acceptance', async () => {
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
    const created = await service.createSession(directory, false)
    await service.sendMessage(created.id, 'Start the investigation')
    const originalAssistant =
      service['activePrompts'].get(created.id)?.assistantMessageId
    let acceptFollowUp!: (messageId: string) => void
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      return new Promise<string>((resolve) => {
        acceptFollowUp = resolve
      })
    })

    const sending = service.sendMessage(
      created.id,
      'Focus on the queue race first',
    )
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain(
        'Focus on the queue race first',
      )
    })
    const followUpAssistant =
      service.store.get(created.id)?.messages.at(-1)?.id
    client.session.resolvePrompt({
      id: randomUUID(),
      type: 'assistant.message',
      timestamp: new Date().toISOString(),
      parentId: null,
      data: { messageId: 'original-response', content: 'base answer' },
    } as AssistantMessageEvent)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(service.store.get(created.id)?.status).toBe('running')
    expect(followUpAssistant).toBeTruthy()
    expect(followUpAssistant).not.toBe(originalAssistant)
    expect(
      service['activePrompts'].get(created.id)?.assistantMessageId,
    ).toBe(originalAssistant)

    acceptFollowUp('follow-up-message')
    await sending
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(
      service['activePrompts'].get(created.id)?.assistantMessageId,
    ).toBe(followUpAssistant)
    expect(service.store.get(created.id)?.status).toBe('running')
    expect(
      service.store.get(created.id)?.messages.find(
        (message) => message.id === originalAssistant,
      ),
    ).toMatchObject({
      role: 'assistant',
      content: 'base answer',
      streaming: false,
    })
    client.session.emit({
      id: randomUUID(),
      type: 'session.idle',
      timestamp: new Date().toISOString(),
      parentId: null,
      data: {},
    } as SessionEvent)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(service.store.get(created.id)?.status).toBe('running')
    expect(
      service['activePrompts'].get(created.id)?.assistantMessageId,
    ).toBe(followUpAssistant)
    client.session.emit({
      id: randomUUID(),
      type: 'assistant.message',
      timestamp: new Date().toISOString(),
      parentId: null,
      data: { messageId: 'follow-up-response', content: 'steered answer' },
    } as SessionEvent)
    client.session.emit({
      id: randomUUID(),
      type: 'session.idle',
      timestamp: new Date().toISOString(),
      parentId: null,
      data: {},
    } as SessionEvent)
    await vi.waitFor(() => {
      expect(service.store.get(created.id)?.status).toBe('idle')
    })
    expect(service.store.get(created.id)?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'steered answer',
      streaming: false,
    })
    await service.stop()
  })

  it('preserves an uncertain SDK follow-up without making it safe to duplicate', async () => {
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
    const created = await service.createSession(directory, false)
    await service.sendMessage(created.id, 'Start the investigation')
    client.session.send = vi.fn(async ({ prompt }) => {
      client.session.sentPrompts.push(prompt)
      throw Object.assign(new Error('connection closed after submission'), {
        code: 'ECONNRESET',
      })
    })

    await expect(
      service.sendMessage(created.id, 'Potentially accepted follow-up'),
    ).rejects.toMatchObject({ uncertainDelivery: true })

    const failed = service.store.get(created.id)
    expect(failed).toMatchObject({
      status: 'error',
      failedPrompt: {
        content: 'Potentially accepted follow-up',
        uncertain: true,
      },
    })
    expect(
      failed?.messages.filter(
        (message) =>
          message.role === 'user' &&
          message.content === 'Potentially accepted follow-up',
      ),
    ).toHaveLength(1)
    expect(service['activePrompts'].has(created.id)).toBe(true)

    await expect(
      service.sendMessage(
        created.id,
        'Do not duplicate while delivery is uncertain',
      ),
    ).rejects.toThrow('may already have been accepted')
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(service.store.get(created.id)?.failedPrompt).toMatchObject({
      content: 'Potentially accepted follow-up',
      uncertain: true,
    })

    client.session.resolvePrompt({
      id: randomUUID(),
      type: 'assistant.message',
      timestamp: new Date().toISOString(),
      parentId: null,
      data: { messageId: 'accepted-response', content: 'accepted once' },
    } as AssistantMessageEvent)
    await vi.waitFor(() => {
      expect(service.store.get(created.id)?.status).toBe('idle')
    })
    expect(service.store.get(created.id)?.failedPrompt).toBeUndefined()
    expect(service.store.get(created.id)?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'accepted once',
      streaming: false,
    })
    await service.stop()
  })

  it('restores an immediate SDK follow-up when steering is unavailable', async () => {
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
    const created = await service.createSession(directory, false)
    await service.sendMessage(created.id, 'Start the investigation')
    Object.defineProperty(client.session, 'send', {
      configurable: true,
      value: undefined,
    })

    await expect(
      service.sendMessage(created.id, 'Steer this turn'),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Use Queue instead'),
      statusCode: 409,
    })
    expect(
      service.store
        .get(created.id)
        ?.messages.some((message) => message.content === 'Steer this turn'),
    ).toBe(false)

    client.session.resolvePrompt()
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
    await service.sendMessage(
      client.session.sessionId,
      'replace terminal draft',
      false,
      undefined,
      true,
    )
    await service.executeCommand(
      client.session.sessionId,
      '/usage',
      false,
      undefined,
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
      { allowDuringAgentExecution: true },
    )
    expect(terminal.send).toHaveBeenNthCalledWith(
      3,
      client.session.sessionId,
      '/usage',
      false,
      { allowDuringAgentExecution: true },
    )
    expect(terminal.send).toHaveBeenNthCalledWith(
      4,
      client.session.sessionId,
      'replace terminal draft',
      false,
      { replaceExistingInput: true },
    )
    expect(terminal.send).toHaveBeenNthCalledWith(
      5,
      client.session.sessionId,
      '/usage',
      false,
      {
        allowDuringAgentExecution: true,
        replaceExistingInput: true,
      },
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

  describe('the Copilot CLI startup probe', () => {
    async function probeService(probeStartup: (id: string, cwd: string) => Promise<void>) {
      const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-probe-'))
      directories.push(directory)
      vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot-home'))
      const terminal = {
        has: vi.fn(async () => false),
        send: vi.fn(async () => true),
        cancel: vi.fn(async () => false),
        probeStartup: vi.fn(probeStartup),
      }
      const service = new AgentService(
        new SessionStore(path.join(directory, 'state')),
        new FakeCopilotClient(),
        async () => [],
        async () => undefined,
        async () => [],
        async () => undefined,
        terminal,
      )
      await service.start()
      return { service, terminal, directory }
    }
    const sessionFiles = (directory: string, id: string) =>
      path.join(directory, 'copilot-home', 'session-state', id)

    it.each([
      ['passes', undefined],
      ['fails', new Error('Copilot did not become ready for terminal input')],
    ])('never offers the probe as a session and removes its files when it %s', async (_name, failure) => {
      let probed: string | undefined
      let retiredDuringProbe = false
      const { service, terminal, directory } = await probeService(async (id) => {
        probed = id
        retiredDuringProbe = service.store.isRetiredSession(id)
        await mkdir(sessionFiles(directory, id), { recursive: true })
        if (failure) throw failure
      })

      const probing = service.probeTerminalStartup('/canary/workspace')
      if (failure) await expect(probing).rejects.toBe(failure)
      else await expect(probing).resolves.toBeUndefined()

      expect(terminal.probeStartup).toHaveBeenCalledWith(probed, '/canary/workspace', undefined)
      expect(retiredDuringProbe).toBe(true)
      expect(service.store.isRetiredSession(probed!)).toBe(true)
      await expect(stat(sessionFiles(directory, probed!))).rejects.toMatchObject({ code: 'ENOENT' })
      expect(service.store.get(probed!)).toBeUndefined()
      await service.stop()
    })

    it('removes a leftover probe\'s files only when it was retired as a probe', async () => {
      const leftover = randomUUID()
      const unrelated = randomUUID()
      const { service, terminal, directory } = await probeService(async () => undefined)
      Object.assign(terminal, { endLeftoverProbes: vi.fn(async () => [leftover, unrelated]) })
      await service.store.retireSessionIds([leftover])
      for (const id of [leftover, unrelated]) await mkdir(sessionFiles(directory, id), { recursive: true })

      await service.probeTerminalStartup('/canary/workspace')

      await expect(stat(sessionFiles(directory, leftover))).rejects.toMatchObject({ code: 'ENOENT' })
      await expect(stat(sessionFiles(directory, unrelated))).resolves.toBeDefined()
      await service.stop()
    })

    it('publishes an alert that asks to be notified', async () => {
      const { service } = await probeService(async () => undefined)
      const events: ServerEvent[] = []
      service.on('event', (event) => events.push(event))

      service.publishAlert('Copilot CLI 1.0.98 needs attention')

      expect(events).toEqual([
        { type: 'error', message: 'Copilot CLI 1.0.98 needs attention', notify: true },
      ])
      await service.stop()
    })
  })

  describe('a terminal whose footer stopped offering the interrupt key', () => {
    const turn = (...types: string[]) =>
      types.map((type) => ({
        id: randomUUID(), type, data: {}, parentId: null,
        timestamp: new Date().toISOString(),
      })) as unknown as SessionEvent[]
    const prompt = (footer: string) => [
      ' /work/project                                      Session: 0 AIC used',
      '────────────────────────────────────────────────────────────',
      '❯',
      '────────────────────────────────────────────────────────────',
      footer,
    ].join('\n')
    const reworded = prompt(' ◉ Working · 52.1 KiB · esc to stop')
    const idle = prompt(' ← open sidebar · / commands · ? help · tab next tab        ctrl+t show reasoning · GPT-6 Astra · 1M context')

    async function terminalService(pane: string, events: () => SessionEvent[]) {
      const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-turn-log-'))
      directories.push(directory)
      const client = new FakeCopilotClient()
      const terminal = {
        has: vi.fn(async () => true),
        send: vi.fn(async () => true),
        cancel: vi.fn(async (_id: string, _options?: TerminalCancelOptions) => true),
        capture: vi.fn(async () => pane),
        inputReady: vi.fn(async () => true),
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
        async () => events(),
        async () => undefined,
        terminal,
      )
      await service.start()
      return { service, terminal, id: client.session.sessionId }
    }

    it('lets Stop ask the event log whether a turn is open', async () => {
      let events = turn('assistant.turn_start')
      const { service, terminal, id } = await terminalService(reworded, () => events)

      await service.cancel(id)

      expect(terminal.cancel).toHaveBeenCalledWith(id, { turnOpen: expect.any(Function) })
      const { turnOpen } = terminal.cancel.mock.calls[0][1]!
      expect(await turnOpen!()).toBe(true)
      events = turn('assistant.turn_start', 'assistant.turn_end')
      expect(await turnOpen!()).toBe(false)
      events = turn('assistant.turn_start', 'tool.execution_start')
      expect(await turnOpen!()).toBe(true)
      await service.stop()
    })

    it('reads an unreadable event log as no turn open', async () => {
      const { service, terminal, id } = await terminalService(reworded, () => {
        throw new Error('EACCES')
      })

      await service.cancel(id)

      const { turnOpen } = terminal.cancel.mock.calls[0][1]!
      expect(await turnOpen!()).toBe(false)
      await service.stop()
    })

    it.each([
      ['a pane it cannot read, with a turn open', reworded, turn('assistant.turn_start'), true],
      ['a pane it cannot read, with no turn open', reworded, turn('assistant.turn_start', 'assistant.turn_end'), false],
      ['an idle pane it knows, whatever the log says', idle, turn('assistant.turn_start'), false],
    ])('sends into %s as working accordingly', async (_name, pane, events, working) => {
      const { service, terminal, id } = await terminalService(pane, () => events)

      await service.sendMessage(id, 'hello terminal')

      expect(terminal.send).toHaveBeenCalledWith(
        id,
        'hello terminal',
        false,
        ...(working ? [{ allowDuringAgentExecution: true }] : []),
      )
      await service.stop()
    })
  })

  it('steers a running tmux turn through the live composer', async () => {
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
      capture: vi.fn(async () => [
        '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
        '┃',
        '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
        ' ◉ Working · esc interrupt',
      ].join('\n')),
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
      session.activity = 'Working in terminal'
      session.queuedPrompts = [{
        id: randomUUID(),
        content: 'Run this after the current turn',
        createdAt: new Date().toISOString(),
      }]
      session.queuedCount = 1
    })

    await service.sendMessage(
      client.session.sessionId,
      'Focus on the queue race first',
    )

    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      'Focus on the queue race first',
      false,
      { allowDuringAgentExecution: true },
    )
    expect(client.session.sentPrompts).toEqual([])
    expect(
      service.store.get(client.session.sessionId)?.queuedPrompts,
    ).toMatchObject([{ content: 'Run this after the current turn' }])
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
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('already been used') })
  })

  it.each([
    [true, false],
    [true, true],
    [false, false],
  ] as const)('keeps a fresh recovery decision after an unresolved terminal resend (%s, acknowledgement failure=%s)', async (uncertain, failAcknowledgement) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-uncertain-recovery-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const failure = Object.assign(new Error('Terminal delivery was not confirmed'), {
      statusCode: 409,
      ...(uncertain ? { uncertainDelivery: true } : {}),
    })
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true).mockRejectedValueOnce(failure),
      cancel: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')), client,
      async () => [{
        id: client.session.sessionId, cwd: directory, title: 'Recovered terminal',
        updatedAt: new Date().toISOString(),
      }],
      async () => undefined, async () => [], async () => undefined, terminal,
    )
    await service.start()
    const failedAt = new Date().toISOString()
    await service.store.update(client.session.sessionId, (stored) => {
      stored.failedPrompt = { content: 'Recovered prompt', failedAt, uncertain: true }
    })
    const acknowledgement = failAcknowledgement
      ? vi.spyOn(service.store, 'clearFailedPrompt').mockRejectedValue(new Error('Acknowledgement storage is unavailable'))
      : undefined
    try {
      await expect(service.sendMessage(client.session.sessionId, 'Recovered prompt', false, failedAt))
        .rejects.toMatchObject({ cause: failure, statusCode: 409, submission: { accepted: false } })
      const recovery = service.store.get(client.session.sessionId)!.failedPrompt!
      expect(recovery).toMatchObject({ content: 'Recovered prompt', uncertain: true })
      expect(recovery.failedAt).not.toBe(failedAt)
      await expect(service.sendMessage(client.session.sessionId, 'Recovered prompt', false, failedAt))
        .rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('already been used') })
      expect(terminal.send).toHaveBeenCalledOnce()
      if (acknowledgement) expect(acknowledgement).not.toHaveBeenCalled()
      acknowledgement?.mockRestore()
      await expect(service.sendMessage(client.session.sessionId, 'Recovered prompt', false, recovery.failedAt))
        .rejects.toMatchObject({ statusCode: 409, submission: { accepted: false } })
      expect(terminal.send).toHaveBeenCalledOnce()
      const decision = service.store.get(client.session.sessionId)!.failedPrompt!.failedAt
      expect(decision).not.toBe(recovery.failedAt)
      await service.sendMessage(client.session.sessionId, 'Recovered prompt', false, decision)
      expect(terminal.send).toHaveBeenCalledTimes(2)
      expect(service.store.get(client.session.sessionId)?.failedPrompt).toBeUndefined()
    } finally {
      acknowledgement?.mockRestore()
      await service.stop()
    }
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

  it('rewrites a queued prompt where it stands and reorders the queue', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-queue-'))
    directories.push(directory)
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    for (const content of ['first', 'second', 'third']) {
      await service.store.enqueuePrompt(created.id, {
        id: content,
        content,
        createdAt: '2026-09-02T00:00:00.000Z',
      })
    }

    // Rewriting keeps its place in line rather than sending it to the back.
    const edited = await service.updateQueuedPrompt(created.id, 'first', 'first, edited')
    expect(edited.prompt.content).toBe('first, edited')
    expect(edited.session.queuedPrompts?.map((p) => p.id)).toEqual([
      'first',
      'second',
      'third',
    ])

    const reordered = await service.reorderQueuedPrompts(created.id, [
      'third',
      'first',
      'second',
    ])
    expect(reordered.queuedPrompts?.map((p) => p.id)).toEqual([
      'third',
      'first',
      'second',
    ])
    // The text moved with it.
    expect(reordered.queuedPrompts?.[1].content).toBe('first, edited')
    expect(service.getSession(created.id)?.queuedPrompts?.map((prompt) => prompt.id))
      .toEqual(['third', 'first', 'second'])
  })

  it('decides what a rewritten prompt is from what it now says', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-kind-'))
    directories.push(directory)
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    await service.store.enqueuePrompt(created.id, {
      id: 'p1',
      content: 'plain text',
      createdAt: '2026-09-02T00:00:00.000Z',
    })

    // Rewritten into a command, it has to wait as one: kept as it was, the
    // queue ran it as the kind it used to be.
    const asCommand = await service.updateQueuedPrompt(created.id, 'p1', '/usage')
    expect(asCommand.prompt.command).toBe(true)

    // A command this session does not have would stop the drain when it was
    // reached, with everything behind it waiting. Refused before it is stored,
    // however it arrives -- this is reachable without the browser, and a
    // client can be holding the list of a session it no longer has open.
    await expect(
      service.updateQueuedPrompt(created.id, 'p1', '/nosuchcommand'),
    ).rejects.toMatchObject({ statusCode: 409 })

    // A catalog that cannot be read is not permission to store anything: an
    // invalid command goes back to the head after every failed drain, and
    // nothing behind it moves again. Refusing a rewrite the reader can repeat
    // is the cheaper of the two.
    // A lone slash names nothing, and every single-word command has an empty
    // shortcut -- so an empty name matched the first of them and would have
    // been stored, and run, as that command.
    await expect(
      service.updateQueuedPrompt(created.id, 'p1', '/'),
    ).rejects.toMatchObject({ statusCode: 409 })

    const listing = vi
      .spyOn(service, 'listCommands')
      .mockRejectedValue(new Error('runtime unreachable'))
    await expect(
      service.updateQueuedPrompt(created.id, 'p1', '/usage'),
    ).rejects.toMatchObject({ statusCode: 409 })
    listing.mockRestore()

    // A shortcut is written out in full: the queue's drain expands nothing, so
    // one stored as typed reached the runtime as a command it never heard of.
    const expanded = await service.updateQueuedPrompt(created.id, 'p1', '/aa on')
    expect(expanded.prompt.content).toBe('/allow-all on')

    // And back again.
    const asText = await service.updateQueuedPrompt(created.id, 'p1', 'plain again')
    expect(asText.prompt.command).toBeUndefined()
  })

  it('runs a queued slash command as a command when the queue drains', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-qcmd-'))
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

    // Queued as a command, it has to run as one. Handed to the ordinary
    // message path it reaches the model as text, so the command was never
    // carried out.
    await service.store.enqueuePrompt(created.id, {
      id: 'cmd-1',
      content: '/plan',
      createdAt: '2026-09-02T00:00:00.000Z',
      command: true,
    })
    await service.sendMessage(created.id, 'wake the queue', true)

    await vi.waitFor(() => {
      expect(client.session.invokedCommands).toContain('plan')
    })
    expect(client.session.sentPrompts).not.toContain('/plan')
  })

  it('keeps draining after a command that started no turn', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-qrest-'))
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
    // `/usage` answers with text rather than starting a turn, so nothing comes
    // back later to take the next prompt off the queue.
    await service.store.enqueuePrompt(created.id, {
      id: 'cmd-1',
      content: '/usage',
      createdAt: '2026-09-02T00:00:00.000Z',
      command: true,
    })
    await service.store.enqueuePrompt(created.id, {
      id: 'after',
      content: 'the one behind it',
      createdAt: '2026-09-02T00:00:01.000Z',
    })

    await service.sendMessage(created.id, 'wake the queue', true)

    // Everything queued behind the command goes out too, instead of waiting
    // for an unrelated send to start another drain.
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('the one behind it')
    })
  })

  it('does not announce a dequeue it may have to undo', async () => {
    // The drain takes the prompt in hand before it dispatches and puts it back
    // if it cannot go. Announcing the shorter queue in between told the
    // browser the message was gone, and there was no way there to tell that
    // moment from the message really being gone -- so anything holding a
    // rewrite of it let go, and the rewrite came adrift from the message that
    // came back.
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
    await service.store.enqueuePrompt(created.id, {
      id: 'waiting',
      content: 'the one that was waiting',
      createdAt: '2026-09-02T00:00:00.000Z',
    })

    const announced: { ids: string[]; status: string }[] = []
    service.on('event', (event) => {
      if (event.type === 'session.upserted' && event.session.id === created.id) {
        announced.push({
          ids: (event.session.queuedPrompts || []).map((prompt) => prompt.id),
          status: event.session.status,
        })
      }
    })

    await service.sendMessage(created.id, 'written afterwards', true)
    await vi.waitFor(() => {
      expect(client.session.sentPrompts).toContain('the one that was waiting')
    })

    // The prompt leaves the queue and the turn begins in the same breath. An
    // announcement that has let go of it while the session is still idle is
    // the moment that cannot be told from the message being gone.
    const heldButIdle = announced.some(
      (state) => !state.ids.includes('waiting') && state.status === 'idle',
    )
    expect(heldButIdle).toBe(false)
  })

  it('refuses an order built from a queue that has since changed', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-order-'))
    directories.push(directory)
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      new FakeCopilotClient(),
      async () => [],
      async () => undefined,
    )
    await service.start()
    const created = await service.createSession(directory, false)
    await service.store.enqueuePrompt(created.id, {
      id: 'only',
      content: 'only',
      createdAt: '2026-09-02T00:00:00.000Z',
    })

    // A prompt sent or removed while the reader was dragging. Applying an
    // order built from the list they were looking at would drop work, or
    // bring back something already gone.
    await expect(
      service.reorderQueuedPrompts(created.id, ['only', 'vanished']),
    ).rejects.toThrow(/changed while it was being reordered/)
    expect(
      service.getSession(created.id)?.queuedPrompts?.map((p) => p.id),
    ).toEqual(['only'])
  })

  it('restores a definitively refused queued prompt unchanged', async () => {
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

    expect(
      service.store
        .get(client.session.sessionId)
        ?.queuedPrompts,
    ).toEqual(queued.queuedPrompts)
    expect(errors.map((event) => event.message).join('\n')).toContain('original queued message is unchanged')
    expect(service.store.get(client.session.sessionId)?.failedPrompt).toBeUndefined()
    expect(service.store.get(client.session.sessionId)?.queuedDispatch).toBeUndefined()
    expect(terminal.send).toHaveBeenCalledTimes(1)

    const onDisk = JSON.parse(
      await readFile(
        path.join(directory, 'state', 'state.json'),
        'utf8',
      ),
    ) as { sessions: Record<string, { queuedPrompts?: unknown[]; failedPrompt?: unknown }> }
    const persisted = onDisk.sessions[client.session.sessionId]
    expect(persisted?.failedPrompt).toBeUndefined()
    expect(persisted?.queuedPrompts).toEqual(queued.queuedPrompts)
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
    expect(service.store.isManagedOpen(client.session.sessionId)).toBe(false)

    const result = await service.executeCommand(client.session.sessionId, '/cwd')

    const notice = result.messages.at(-1)
    expect(notice?.role).toBe('notice')
    expect(notice?.content).toContain('/cwd')
    expect(notice?.content).toContain(
      'Current working directory: /home/user/project',
    )
    // A command that starts no turn is still work sent from the app.
    expect(service.store.shouldRecoverTerminalSession(client.session.sessionId)).toBe(true)
    await service.stop()
  })

  it('keeps recovery ownership of a sent command when its feedback cannot be read', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-slash-'))
    directories.push(directory)
    const client = new FakeCopilotClient()
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')
    let sent = false
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        sent = true
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => {
        if (sent) throw new Error('Pane capture failed')
        return composer
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

    await expect(
      service.executeCommand(client.session.sessionId, '/cwd'),
    ).rejects.toThrow(/accepted/)

    expect(terminal.send).toHaveBeenCalledOnce()
    expect(service.store.shouldRecoverTerminalSession(client.session.sessionId)).toBe(true)
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
    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      '/usage',
      false,
      { allowDuringAgentExecution: true },
    )
    expect(result.messages.at(-1)?.content).toBe('/usage')
    await expect(
      service.executeCommand(client.session.sessionId, '/model fixture-model'),
    ).rejects.toThrow('must be queued')
    await expect(
      service.executeCommand(client.session.sessionId, '/unlisted-command'),
    ).rejects.toThrow('must be queued')
    expect(terminal.send).toHaveBeenCalledTimes(1)
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

  it.each(['external', 'owned-message', 'owned-command'] as const)('requires explicit session-use consent for %s admission', async (mode) => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-resume-prompt-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const pane = [
      ' ╭────────────────────────────────────────────────────────────╮',
      ' Session in use',
      ' This session appears to be in use by another CLI or application.',
      ' ❯ 1. Resume anyway',
      '   2. Go back (Esc)',
      ' ↑/↓ to navigate · enter to select · esc to cancel',
      ' ╰────────────────────────────────────────────────────────────╯',
    ].join('\n')
    let currentPane = pane
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => currentPane),
      ownsStartupPrompt: vi.fn(() => mode !== 'external'),
      canHandleStartupPrompt: vi.fn(async () => mode !== 'external'),
      resolveStartupPrompt: vi.fn(async () => {
        currentPane = '╻▄▄▄▄\n┃\n╹▀▀▀▀'
        return true
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
      async () => 'events-1',
      terminal,
    )
    await service.start()

    try {
      await expect(mode === 'owned-command'
        ? service.executeCommand(client.session.sessionId, '/usage')
        : service.sendMessage(client.session.sessionId, 'Continue the work'),
      ).rejects.toMatchObject({
        statusCode: 409, message: expect.stringContaining('permission card'),
      })
      expect(terminal.resolveStartupPrompt).not.toHaveBeenCalled()
      expect(terminal.send).not.toHaveBeenCalled()
    } finally {
      await service.stop()
    }
  })

  it('does not send into a desktop-app promotion', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-promotion-prompt-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const pane = [
      ' ╭───────────────────────────────────────────────╮',
      ' THE GITHUB COPILOT APP',
      ' Now generally available!',
      ' Install it now?',
      ' ❯ Yes, install      No, thanks',
      ' ←/→ to choose · Enter to select · Y / N',
      ' ╰───────────────────────────────────────────────╯',
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
      service.sendMessage(client.session.sessionId, 'Continue the work'),
    ).rejects.toMatchObject({ statusCode: 409 })
    expect(terminal.send).not.toHaveBeenCalled()
    await service.stop()
  })

  it('lets an owned startup prompt reach the terminal controller', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-owned-startup-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const pane = [
      ' ╭───────────────────────────────────────────────╮',
      ' THE GITHUB COPILOT APP',
      ' Now generally available!',
      ' Install it now?',
      ' ❯ Yes, install      No, thanks',
      ' ←/→ to choose · Enter to select · Y / N',
      ' ╰───────────────────────────────────────────────╯',
    ].join('\n')
    let currentPane = pane
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => currentPane),
      canHandleStartupPrompt: vi.fn(async () => true),
      resolveStartupPrompt: vi.fn(async () => {
        currentPane = '╻▄▄▄▄\n┃\n╹▀▀▀▀'
        return true
      }),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Owned startup',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => [],
      async () => 'events-1',
      terminal,
    )
    await service.start()
    await service.store.update(client.session.sessionId, (session) => {
      session.status = 'running'
    })

    await service.sendMessage(
      client.session.sessionId,
      'Continue the work',
      true,
    )

    expect(terminal.canHandleStartupPrompt).toHaveBeenCalledWith(
      client.session.sessionId,
      pane,
    )
    expect(terminal.resolveStartupPrompt).toHaveBeenCalledWith(
      client.session.sessionId,
    )
    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      'Continue the work',
      false,
    )
    expect(
      service.store.get(client.session.sessionId)?.queuedPrompts ?? [],
    ).toEqual([])
    await service.stop()
  })

  async function startupFifoFixture(startup = true) {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-startup-fifo-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const startupPane = [
      ' ╭───────────────────────────────────────────────╮',
      ' THE GITHUB COPILOT APP',
      ' Now generally available!',
      ' Install it now?',
      ' ❯ Yes, install      No, thanks',
      ' ←/→ to choose · Enter to select · Y / N',
      ' ╰───────────────────────────────────────────────╯',
    ].join('\n')
    let currentPane = startup ? startupPane : '╻▄▄▄▄\n┃\n╹▀▀▀▀'
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => currentPane),
      inputReady: vi.fn(async () => true),
      canHandleStartupPrompt: vi.fn(async () => true),
      resolveStartupPrompt: vi.fn(async () => {
        currentPane = '╻▄▄▄▄\n┃\n╹▀▀▀▀'
        return true
      }),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Owned startup FIFO',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => [],
      async () => 'events-1',
      terminal,
    )
    await service.start()
    const sessionId = client.session.sessionId
    const olderPrompt = {
      id: randomUUID(),
      content: 'Older queued prompt',
      createdAt: new Date().toISOString(),
    }
    await service.store.update(sessionId, (session) => {
      session.status = 'running'
    })
    return {
      service,
      terminal,
      sessionId,
      olderPrompt,
      enqueueOlder: () => service.store.enqueuePrompt(sessionId, olderPrompt),
      persisted: async () => JSON.parse(
        await readFile(path.join(directory, 'state', 'state.json'), 'utf8'),
      ).sessions[sessionId],
    }
  }

  it.each([
    { enqueue: true, arrival: 'before', startup: true },
    { enqueue: false, arrival: 'before', startup: true },
    { enqueue: false, arrival: 'owner-detection', startup: true },
    { enqueue: false, arrival: 'startup-resolution', startup: true },
    { enqueue: false, arrival: 'input-readiness', startup: true },
    { enqueue: false, arrival: 'before', startup: false },
    { enqueue: false, arrival: 'owner-detection', startup: false },
    { enqueue: false, arrival: 'empty', startup: true },
    { enqueue: false, arrival: 'empty', startup: false },
    { enqueue: true, arrival: 'startup-resolution', startup: true },
  ])('keeps persisted terminal prompts ahead of a startup send (enqueue=$enqueue, arrival=$arrival, startup=$startup)', async ({ enqueue, arrival, startup }) => {
    const context = await startupFifoFixture(startup)
    const { service, terminal, sessionId, enqueueOlder, persisted } = context
    try {
      if (arrival === 'before') {
        await enqueueOlder()
      } else if (arrival === 'owner-detection') {
        terminal.has.mockImplementationOnce(async () => {
          await enqueueOlder()
          return true
        })
      } else if (arrival === 'startup-resolution') {
        const resolve = terminal.resolveStartupPrompt.getMockImplementation()!
        terminal.resolveStartupPrompt.mockImplementationOnce(async () => {
          await enqueueOlder()
          return resolve()
        })
      } else if (arrival === 'input-readiness') {
        terminal.inputReady.mockImplementationOnce(async () => {
          await enqueueOlder()
          return true
        })
      }
      const send = service.sendMessage(sessionId, 'New startup prompt', enqueue)
      if (arrival !== 'empty' && !enqueue) {
        await expect(send).rejects.toMatchObject({
          statusCode: 409,
          message: expect.stringContaining('queue'),
        })
        expect(terminal.send).not.toHaveBeenCalled()
        expect((await persisted()).queuedPrompts).toEqual([context.olderPrompt])
      } else {
        await send
        expect(terminal.send).toHaveBeenCalledExactlyOnceWith(
          sessionId,
          arrival === 'empty' ? 'New startup prompt' : 'Older queued prompt',
          false,
        )
        expect(((await persisted()).queuedPrompts ?? []).map((prompt: { content: string }) => prompt.content))
          .toEqual(arrival === 'empty' ? [] : ['New startup prompt'])
      }
      expect(terminal.resolveStartupPrompt).toHaveBeenCalledTimes(startup ? 1 : 0)
    } finally {
      await service.stop()
    }
  })

  it.each([
    { startup: true, enqueue: false, recovery: 'acknowledged' },
    { startup: false, enqueue: false, recovery: 'acknowledged' },
    { startup: true, enqueue: true, recovery: 'acknowledged' },
    { startup: false, enqueue: true, recovery: 'acknowledged' },
    { startup: true, enqueue: false, recovery: 'unacknowledged' },
    { startup: true, enqueue: false, recovery: 'replaced-during-detection' },
  ])('preserves an earlier native recovery ahead of remaining FIFO (startup=$startup, enqueue=$enqueue, recovery=$recovery)', async ({ startup, enqueue, recovery }) => {
    const { service, terminal, sessionId, olderPrompt, enqueueOlder, persisted } = await startupFifoFixture(startup)
    const token = '2026-09-04T00:00:00.000Z'
    const submitted = 'Earlier failed prompt'
    try {
      await enqueueOlder()
      await service.store.update(sessionId, (session) => {
        session.failedPrompt = { content: submitted, failedAt: token, uncertain: true }
      })
      if (recovery === 'replaced-during-detection') {
        terminal.has.mockImplementationOnce(async () => {
          await service.store.update(sessionId, (session) => {
            session.failedPrompt = {
              content: 'A newer failure', failedAt: 'newer-failure', uncertain: true,
            }
          })
          return true
        })
      }
      const send = service.sendMessage(
        sessionId, submitted, enqueue, recovery === 'unacknowledged' ? undefined : token,
      )
      if (recovery !== 'acknowledged') {
        await expect(send).rejects.toMatchObject({ statusCode: 409 })
        expect(terminal.send).not.toHaveBeenCalled()
        expect((await persisted()).queuedPrompts).toEqual([olderPrompt])
        expect((await persisted()).failedPrompt.failedAt)
          .toBe(recovery === 'unacknowledged' ? token : 'newer-failure')
      } else {
        await send
        expect((await persisted()).failedPrompt).toBeUndefined()
        if (!enqueue) {
          // The fixture's pane is an idle composer throughout, so there is
          // never a running turn to steer past however the stored status
          // reads.
          expect(terminal.send).toHaveBeenCalledExactlyOnceWith(
            sessionId,
            submitted,
            false,
          )
          expect((await persisted()).queuedPrompts).toEqual([olderPrompt])
        } else {
          const queued = (await persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content)
          if (startup) {
            expect(terminal.send).toHaveBeenCalledExactlyOnceWith(sessionId, olderPrompt.content, false)
            expect(queued).toEqual([submitted])
          } else {
            expect(terminal.send).not.toHaveBeenCalled()
            expect(queued).toEqual([olderPrompt.content, submitted])
          }
        }
      }
    } finally {
      await service.stop()
    }
  })

  it('resolves owned startup before queueing a terminal command', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-startup-command-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    let currentPane = [
      ' ╭───────────────────────────────────────────────╮',
      ' THE GITHUB COPILOT APP',
      ' Now generally available!',
      ' Install it now?',
      ' ❯ Yes, install      No, thanks',
      ' ←/→ to choose · Enter to select · Y / N',
      ' ╰───────────────────────────────────────────────╯',
    ].join('\n')
    const terminal = {
      ownsStartupPrompt: vi.fn(() => true),
      has: vi.fn(async () => true),
      send: vi.fn(async () => {
        currentPane = [
          ' ● Usage this month: 42 requests',
          '╻▄▄▄▄',
          '┃',
          '╹▀▀▀▀',
        ].join('\n')
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => currentPane),
      canHandleStartupPrompt: vi.fn(async () => true),
      resolveStartupPrompt: vi.fn(async () => {
        currentPane = '╻▄▄▄▄\n┃\n╹▀▀▀▀'
        return true
      }),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Owned startup command',
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

    await service.executeCommand(client.session.sessionId, '/usage', true)

    expect(terminal.resolveStartupPrompt).toHaveBeenCalledWith(
      client.session.sessionId,
    )
    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      '/usage',
      false,
      { allowDuringAgentExecution: true },
    )
    await service.stop()
  })

  it('reconciles stale running state after a startup blocker closes', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-startup-idle-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const terminal = {
      ownsStartupPrompt: vi.fn(() => true),
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => '╻▄▄▄▄\n┃\n╹▀▀▀▀'),
      inputReady: vi.fn(async () => true),
      resolveStartupPrompt: vi.fn(async () => true),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Startup blocker closed',
          updatedAt: new Date().toISOString(),
        },
      ],
      async () => undefined,
      async () => [],
      async () => 'events-1',
      terminal,
    )
    await service.start()
    await service.store.update(client.session.sessionId, (session) => {
      session.status = 'running'
    })

    await service.sendMessage(
      client.session.sessionId,
      'Send after blocker',
      true,
    )

    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      'Send after blocker',
      false,
    )
    expect(
      service.store.get(client.session.sessionId)?.queuedPrompts ?? [],
    ).toEqual([])
    await service.stop()
  })

  it('serializes sends that overlap startup resolution', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-startup-overlap-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    let currentPane = [
      ' ╭───────────────────────────────────────────────╮',
      ' THE GITHUB COPILOT APP',
      ' Now generally available!',
      ' Install it now?',
      ' ❯ Yes, install      No, thanks',
      ' ←/→ to choose · Enter to select · Y / N',
      ' ╰───────────────────────────────────────────────╯',
    ].join('\n')
    const gates: Array<() => void> = []
    let activeSends = 0
    let maximumActiveSends = 0
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(
        async (_sessionId: string, _content: string, _enqueue: boolean) =>
          new Promise<boolean>((resolve) => {
            activeSends += 1
            maximumActiveSends = Math.max(maximumActiveSends, activeSends)
            gates.push(() => {
              activeSends -= 1
              resolve(true)
            })
          }),
      ),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => currentPane),
      canHandleStartupPrompt: vi.fn(async () => true),
      resolveStartupPrompt: vi.fn(async () => {
        currentPane = '╻▄▄▄▄\n┃\n╹▀▀▀▀'
        return true
      }),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Owned startup overlap',
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
      'First startup prompt',
      true,
    )
    await vi.waitFor(() => expect(gates).toHaveLength(1))
    const second = service.sendMessage(
      client.session.sessionId,
      'Second startup prompt',
      true,
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(gates).toHaveLength(1)
    gates[0]()
    await first
    await vi.waitFor(() => expect(gates).toHaveLength(2))
    gates[1]()
    await second

    expect(maximumActiveSends).toBe(1)
    expect(terminal.send).toHaveBeenNthCalledWith(
      1,
      client.session.sessionId,
      'First startup prompt',
      false,
    )
    expect(terminal.send).toHaveBeenNthCalledWith(
      2,
      client.session.sessionId,
      'Second startup prompt',
      true,
    )
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

  it('marks a rediscovered terminal command prompt as uncertain after a store failure', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'agent-service-command-fallback-'),
    )
    directories.push(directory)
    const client = new FakeCopilotClient()
    client.models = [configurableModel()]
    const terminal = {
      ownsStartupPrompt: vi.fn(() => true),
      has: vi.fn(async () => false),
      send: vi.fn(async (_sessionId: string, content: string) => {
        if (content === '/plan') {
          return false
        }
        return true
      }),
      cancel: vi.fn(async () => true),
      capture: vi.fn(async () => undefined),
    }
    const service = new AgentService(
      new SessionStore(path.join(directory, 'state')),
      client,
      async () => [
        {
          id: client.session.sessionId,
          cwd: directory,
          title: 'Command fallback',
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
      session.status = 'idle'
    })
    vi.spyOn(service.store, 'markTerminalPromptDispatched')
      .mockRejectedValueOnce(new Error('state write failed'))

    await expect(
      service.executeCommand(client.session.sessionId, '/plan'),
    ).rejects.toMatchObject({ uncertainDelivery: true })
    expect(terminal.send).toHaveBeenCalledWith(
      client.session.sessionId,
      'Create the requested plan',
      false,
    )
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
    expect(service.store.isManagedOpen(client.session.sessionId)).toBe(false)
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
    expect(service.store.shouldRecoverTerminalSession(client.session.sessionId)).toBe(true)
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
    expect(service.store.isManagedOpen(sessionId)).toBe(false)

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
      { deadline: expect.any(Number) },
    )
    expect(terminal.send).not.toHaveBeenCalled()
    expect(terminal.dismissUserInput).not.toHaveBeenCalled()
    expect(answered.pendingUserInput).toBeUndefined()
    expect(service.store.shouldRecoverTerminalSession(sessionId)).toBe(true)
    await service.stop()
  })

  it('does not take recovery ownership when a form finished without a confirmed fill', async () => {
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
            "message":"Choose the deployment",
            "requestedSchema":{
              "properties":{
                "deploymentName":{"type":"string","title":"Name","default":"keepme"}
              }
            }
          }
        }
      }
    ]`) as SessionEvent[]
    const terminal = {
      has: vi.fn(async () => true),
      send: vi.fn(async () => true),
      cancel: vi.fn(async () => true),
      pendingPermission: vi.fn(async () => undefined),
      pendingUserInput: vi.fn(async () => undefined),
      replyUserInput: vi.fn(async () => true),
      dismissUserInput: vi.fn(async () => true),
      // The form closed on its own while the app's fill could not confirm it.
      fillUserInputForm: vi.fn(async () => {
        events.push({
          type: 'tool.execution_complete',
          id: 'ask-complete',
          parentId: 'ask-start',
          timestamp: '2026-09-01T04:30:25.000Z',
          data: { toolCallId: 'ask-call', success: true },
        } as unknown as SessionEvent)
        return false
      }),
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
      async () => 'form-answer-v1',
      terminal,
    )

    await service.start()
    const sessionId = client.session.sessionId
    expect(service.store.get(sessionId)?.pendingUserInput).toBeDefined()

    const values = { deploymentName: 'staging' }
    await service.replyUserInput(
      sessionId,
      'persisted-user-input:ask-call',
      { answer: JSON.stringify(values), wasFreeform: false, values },
    )

    expect(terminal.fillUserInputForm).toHaveBeenCalledOnce()
    expect(service.store.isManagedOpen(sessionId)).toBe(false)
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
    }, undefined, { deadline: expect.any(Number) })
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
          message: expect.stringContaining(outcome === 'unconfirmed'
            ? 'completion was not confirmed'
            : 'not dismissed'),
          ...(outcome === 'unconfirmed' ? { uncertainDelivery: true } : {}),
        })
        if (outcome === 'unconfirmed') {
          await expect(service.replyUserInput(sessionId, 'persisted-user-input:question-call', {
            action, answer: '', wasFreeform: false,
          })).rejects.toMatchObject({ uncertainDelivery: true })
          expect(terminal.dismissUserInput).toHaveBeenCalledOnce()
        }
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
        }, action, { deadline: expect.any(Number) })
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
      // The resumed pane is an idle composer, so there is no execution to
      // steer past: the stored status still says running only because nothing
      // has re-read the pane yet.
      expect(terminal.send).toHaveBeenCalledWith(
        sessionId,
        'Continue',
        false,
      )
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
    expect(service.store.isManagedOpen(client.session.sessionId)).toBe(false)
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
    expect(service.store.shouldRecoverTerminalSession(client.session.sessionId)).toBe(true)
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

describe('foregroundTurnOpen', () => {
  const event = (type: string, agentId?: string): SessionEvent =>
    ({ type, ...(agentId ? { agentId } : {}), data: {} }) as unknown as SessionEvent

  it.each([
    ['a turn has started', ['assistant.turn_start'], true],
    ['a permission was answered mid-turn', ['assistant.turn_start', 'permission.requested', 'permission.completed'], true],
    ['tools run inside the turn', ['assistant.turn_start', 'tool.execution_start', 'tool.execution_complete'], true],
    ['nothing has happened', [], false],
    ['the turn ended', ['assistant.turn_start', 'assistant.turn_end'], false],
    ['the turn was interrupted', ['assistant.turn_start', 'abort'], false],
    ['a permission is waiting', ['assistant.turn_start', 'permission.requested'], false],
    ['the session shut down', ['assistant.turn_start', 'session.shutdown'], false],
    ['a new process resumed it', ['assistant.turn_start', 'session.resume', 'user.message'], false],
    ['a new process started it', ['assistant.turn_start', 'session.start'], false],
  ])('answers whether a foreground turn is open when %s', (_name, types, open) => {
    expect(foregroundTurnOpen(types.map((type) => event(type)))).toBe(open)
  })

  it('does not count background agents as the foreground turn', () => {
    expect(
      foregroundTurnOpen([
        event('assistant.turn_start'),
        event('subagent.started', 'agent-1'),
        event('assistant.turn_end'),
        event('assistant.turn_start', 'agent-1'),
      ]),
    ).toBe(false)
  })
})

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
