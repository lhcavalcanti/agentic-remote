import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import {
  CopilotClient,
  RuntimeConnection,
  type AssistantMessageEvent,
  type CopilotSession,
  type ElicitationResult,
  type PermissionRequest,
  type PermissionRequestResult,
  type ModelInfo,
  type ResumeSessionConfig,
  type SessionConfig,
  type SessionEvent,
  type SessionMetadata,
} from '@github/copilot-sdk'
import type {
  AgentProvider,
  AgentProviderCapability,
  ActivityKind,
  BackgroundTask,
  BackgroundTaskSnapshot,
  ChatMessage,
  AgentMode,
  ConfigureRuntimeInput,
  PendingPermission,
  PendingUserInput,
  ProviderRuntimeOptions,
  QueuedPrompt,
  RemovedQueuedPrompt,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SessionRuntimeInfo,
  UserInputReplyInput,
  UserInputField,
  UserInputFieldOption,
  UserInputFieldValue,
  UserInputForm,
  RuntimeModelOption,
  RuntimeOptions,
  RuntimeReasoningEffort,
  SessionStatus,
  SlashCommand,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import {
  backgroundTasksFromEvents,
  MAX_BACKGROUND_TASKS,
  normalizeBackgroundTask,
  type CopilotTaskInfo,
  type CopilotTaskProgress,
  type CopilotTasksApi,
} from './background-task-adapter.js'
import { BackgroundTaskTracker } from './background-task-tracker.js'
import { SessionStore, type DiscoveredSession } from './session-store.js'
import {
  findActiveCopilotSessions,
  stopActiveCopilotSession,
} from './active-sessions.js'
import {
  forgetSessionEvents,
  readSessionEvents,
  readSessionWorkspaceMetadata,
  sessionEventLogVersion,
  sessionWorkspaceVersion,
} from './event-log.js'
import { listHomeDirectories,
  type DirectoryScope,
} from './directory-browser.js'
import {
  validateKnowledgeRoot,
  validateSessionDirectory,
} from './session-directory.js'
import {
  listWorkspace,
  readWorkspaceFile,
  searchWorkspace,
} from './workspace-browser.js'
import {
  isTerminalAgentWorking,
  isTerminalOverlay,
  terminalCommandOutput,
  TmuxTerminalSessionController,
  type TerminalFormStep,
  type TerminalSessionController,
} from './terminal-session.js'

interface ActivePrompt {
  assistantMessageId: string
}

type UserInputHandler = NonNullable<SessionConfig['onUserInputRequest']>
type UserInputRequest = Parameters<UserInputHandler>[0]
type UserInputResponse = Awaited<ReturnType<UserInputHandler>>
type ElicitationHandler = NonNullable<SessionConfig['onElicitationRequest']>
type ElicitationContext = Parameters<ElicitationHandler>[0]

interface PendingSdkPermission {
  sessionId: string
  resolve: (result: PermissionRequestResult) => void
}

interface PendingSdkUserInput {
  sessionId: string
  resolve: (response: UserInputResponse) => void
}

interface PendingSdkElicitation {
  sessionId: string
  resolve: (response: ElicitationResult) => void
}

export interface CopilotSessionLike {
  sessionId: string
  on(handler: (event: SessionEvent) => void): () => void
  sendAndWait(
    content: string,
    timeout?: number,
  ): Promise<AssistantMessageEvent | undefined>
  getEvents(): Promise<SessionEvent[]>
  abort(): Promise<void>
  disconnect(): Promise<void>
  rpc: {
    commands: Pick<
      CopilotSession['rpc']['commands'],
      'list' | 'invoke' | 'enqueue'
    >
    tasks?: CopilotTasksApi
    name: Pick<CopilotSession['rpc']['name'], 'set'>
    model: Pick<CopilotSession['rpc']['model'], 'getCurrent' | 'switchTo'>
    mode: Pick<CopilotSession['rpc']['mode'], 'set'>
  }
}

export interface CopilotClientLike {
  start(): Promise<void>
  stop(): Promise<Error[]>
  createSession(config: SessionConfig): Promise<CopilotSessionLike>
  resumeSession(
    sessionId: string,
    config: ResumeSessionConfig,
  ): Promise<CopilotSessionLike>
  listSessions(): Promise<SessionMetadata[]>
  deleteSession(sessionId: string): Promise<void>
  listModels?(): Promise<ModelInfo[]>
  rpc: Pick<CopilotClient['rpc'], 'commands'>
}

interface ModelPromptLimits {
  default?: number
  long?: number
  maximum?: number
}

interface CreationRuntime {
  model: string
  reasoningEffort?: RuntimeReasoningEffort
  contextTier: 'default' | 'long_context'
  contextTokenLimit?: number
  contextEstimated: true
}

function isRuntimeReasoningEffort(
  value: unknown,
): value is RuntimeReasoningEffort {
  return (
    value === 'low' ||
    value === 'medium' ||
    value === 'high' ||
    value === 'xhigh' ||
    value === 'max'
  )
}

class RuntimeConfigurationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'RuntimeConfigurationError'
  }
}

const runtimeEventTypes = new Set<SessionEvent['type']>([
  'session.start',
  'session.resume',
  'session.model_change',
  'session.mode_changed',
  'session.permissions_changed',
  'session.usage_info',
  'assistant.message',
  'tool.execution_start',
])
const sessionIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function removeCopilotSessionFiles(sessionId: string): Promise<void> {
  if (!sessionIdPattern.test(sessionId)) {
    return
  }
  const copilotHome =
    process.env.COPILOT_HOME?.trim() ||
    path.join(process.env.HOME || process.cwd(), '.copilot')
  await rm(path.join(copilotHome, 'session-state', sessionId), {
    recursive: true,
    force: true,
  })
}

export interface AgentServiceEvents {
  event: [event: ServerEvent]
}

function activityKind(data: unknown): ActivityKind {
  const normalizedToolName = (stringValue(recordValue(data).toolName) || 'tool')
    .toLowerCase()
    .replaceAll('-', '_')
  if (normalizedToolName === 'skill') {
    return 'skill'
  }
  if (normalizedToolName === 'task') {
    return 'agent'
  }
  return 'tool'
}

function activityDuration(startedAt: string, completedAt: string): number | undefined {
  const start = Date.parse(startedAt)
  const end = Date.parse(completedAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return undefined
  }
  return end - start
}

function activityResult(data: unknown, success: boolean): string | undefined {
  const tool = recordValue(data)
  const result = recordValue(tool.result)
  const resultContent =
    previewText(result.detailedContent, true) ||
    previewText(result.content, true) ||
    previewText(result.output, true) ||
    previewText(result.message, true) ||
    previewText(tool.result, true)
  const error = previewText(tool.error, true) ||
    previewText(recordValue(tool.error).message, true)
  const text = success ? resultContent : error || resultContent
  if (text) {
    return success ? text : `Error: ${text}`
  }
  return success ? undefined : 'Error: tool failed; inspect the session log'
}

interface ActivityToolStart {
  kind: ActivityKind
  parentToolCallId?: string
  toolCallId: string
}

function isActivityGroupKind(kind: ActivityKind | undefined): boolean {
  return kind === 'skill' || kind === 'agent'
}

function activityGroupIdFor(
  parentToolCallId: string | undefined,
  agentId: string | undefined,
  toolStartsByCallId: Map<string, ActivityToolStart>,
  subagentParentsByAgentId: Map<string, string>,
): string | undefined {
  const candidateParents = [
    parentToolCallId,
    agentId ? subagentParentsByAgentId.get(agentId) : undefined,
  ].filter((value, index, values): value is string =>
    Boolean(value) && values.indexOf(value) === index,
  )
  for (const candidate of candidateParents) {
    const visited = new Set<string>()
    let parentToolCallIdToCheck: string | undefined = candidate
    while (parentToolCallIdToCheck && !visited.has(parentToolCallIdToCheck)) {
      visited.add(parentToolCallIdToCheck)
      const parent = toolStartsByCallId.get(parentToolCallIdToCheck)
      if (!parent) {
        break
      }
      if (isActivityGroupKind(parent.kind)) {
        return `tool:${parent.toolCallId}`
      }
      parentToolCallIdToCheck = parent.parentToolCallId
    }
  }
  return undefined
}

export function messagesFromHistory(events: SessionEvent[]): ChatMessage[] {
  const messages: ChatMessage[] = []
  const taskCompletionSummaries = new Map<string, string>()
  const toolStartsByCallId = new Map<
    string,
    ActivityToolStart
  >()
  const subagentParentsByAgentId = new Map<string, string>()
  for (const event of events) {
    if (event.type === 'tool.execution_start') {
      toolStartsByCallId.set(event.data.toolCallId, {
        kind: activityKind(event.data),
        parentToolCallId: stringValue(
          recordValue(event.data).parentToolCallId,
        ),
        toolCallId: event.data.toolCallId,
      })
    } else if (event.type === 'subagent.started' && event.agentId) {
      subagentParentsByAgentId.set(event.agentId, event.data.toolCallId)
    }
  }
  const activityGroupId = (event: SessionEvent): string | undefined => {
    return activityGroupIdFor(
      stringValue(recordValue(event.data).parentToolCallId),
      event.agentId,
      toolStartsByCallId,
      subagentParentsByAgentId,
    )
  }
  const finishRunningActivities = (
    activityStatus: 'completed' | 'failed' = 'completed',
  ) => {
    for (const message of messages) {
      if (
        message.role === 'activity' &&
        message.activityStatus === 'running'
      ) {
        message.activityStatus = activityStatus
      }
    }
  }

  for (const event of events) {
    if (event.type === 'user.message') {
      if (stringValue(recordValue(event.data).source)?.startsWith('agent-')) {
        continue
      }
      const content = visibleUserContent(event.data.content)
      if (content) {
        finishRunningActivities()
        messages.push({
          id: event.id,
          role: 'user',
          content,
          createdAt: event.timestamp,
        })
      }
      continue
    }
    if (event.type === 'assistant.message' && !eventAgentId(event)) {
      const content = event.data.content.trim()
      if (content) {
        finishRunningActivities()
        messages.push({
          id: event.data.messageId || event.id,
          role: 'assistant',
          content,
          createdAt: event.timestamp,
        })
      }
      continue
    }
    if (event.type === 'tool.execution_start') {
      const toolCallId = event.data.toolCallId
      const toolName = event.data.toolName
        .toLowerCase()
        .replaceAll('-', '_')
      if (toolName === 'task_complete' && !event.agentId) {
        const summary = stringValue(
          recordValue(event.data.arguments).summary,
        )?.trim()
        if (summary) {
          taskCompletionSummaries.set(toolCallId, summary)
        }
      }
      messages.push({
        id: `tool:${toolCallId}`,
        role: 'activity',
        content: toolActivityContent(event.data),
        createdAt: event.timestamp,
        activityStatus: 'running',
        activityKind: activityKind(event.data),
        activityGroupId: activityGroupId(event),
      })
      continue
    }
    if (event.type === 'tool.execution_complete') {
      const toolCallId = event.data.toolCallId
      const message = messages.find(
        (entry) => entry.id === `tool:${toolCallId}`,
      )
      if (message) {
        message.activityStatus = event.data.success ? 'completed' : 'failed'
        const resultContent = activityResult(event.data, event.data.success)
        const duration = activityDuration(message.createdAt, event.timestamp)
        if (resultContent) {
          message.activityResult = resultContent
        }
        if (duration !== undefined) {
          message.activityDurationMs = duration
        }
        const taskResultContent = stringValue(
          recordValue(recordValue(event.data).result).content,
        )?.trim()
        const taskCompletionSummary = taskCompletionSummaries.has(toolCallId)
          ? taskResultContent || taskCompletionSummaries.get(toolCallId)
          : undefined
        if (event.data.success && taskCompletionSummary) {
          finishRunningActivities()
          message.role = 'assistant'
          message.content = taskCompletionSummary
          message.createdAt = event.timestamp
          message.activityStatus = undefined
        }
      }
    }
    if (
      event.type === 'assistant.turn_end' ||
      event.type === 'session.idle' ||
      event.type === 'abort' ||
      event.type === 'session.error' ||
      event.type === 'session.shutdown'
    ) {
      finishRunningActivities(
        event.type === 'abort' ||
          event.type === 'session.error' ||
          event.type === 'session.shutdown'
          ? 'failed'
          : 'completed',
      )
    }
  }
  return messages
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.flatMap((entry) =>
        typeof entry === 'string' && entry.trim() ? [entry.trim()] : [],
      )
    : []
}

function stringArrayValue(value: unknown): string[] | undefined {
  if (
    !Array.isArray(value) ||
    !value.every((entry) => typeof entry === 'string')
  ) {
    return undefined
  }
  return value.map((entry) => entry.trim())
}

function userInputFormat(value: unknown): UserInputField['format'] {
  return value === 'email' ||
    value === 'uri' ||
    value === 'date' ||
    value === 'date-time'
    ? value
    : undefined
}

function userInputOptions(
  field: Record<string, unknown>,
): UserInputFieldOption[] | undefined {
  if (Array.isArray(field.enum)) {
    const names = Array.isArray(field.enumNames)
      ? field.enumNames.map((name) =>
          typeof name === 'string' ? name.trim() : '',
        )
      : []
    return field.enum.flatMap((value, index) =>
      typeof value === 'string' && value.trim()
        ? [
            {
              value: value.trim(),
              label: names[index] || value.trim(),
            },
          ]
        : [],
    )
  }
  const labeledOptions = Array.isArray(field.oneOf)
    ? field.oneOf
    : Array.isArray(field.anyOf)
      ? field.anyOf
      : undefined
  if (labeledOptions) {
    return labeledOptions.flatMap((value) => {
      const option = recordValue(value)
      const optionValue = stringValue(option.const)
      const label = stringValue(option.title)
      return optionValue && label
        ? [{ value: optionValue, label }]
        : []
    })
  }
  return undefined
}

export function userInputFormFromSchema(
  schemaValue: unknown,
): UserInputForm | undefined {
  const schema = recordValue(schemaValue)
  if (schema.type !== undefined && schema.type !== 'object') {
    return undefined
  }
  if (
    !schema.properties ||
    typeof schema.properties !== 'object' ||
    Array.isArray(schema.properties)
  ) {
    return undefined
  }
  const properties = recordValue(schema.properties)
  const required = new Set(stringArray(schema.required))
  let unsupported = false
  const fields: UserInputField[] = []
  for (const [name, value] of Object.entries(properties)) {
    const field = recordValue(value)
    const type = field.type
    const common = {
      name,
      title: stringValue(field.title) || name,
      description: stringValue(field.description),
      required: required.has(name),
    }

    if (type === 'string') {
      const options = userInputOptions(field)
      const hasOptions =
        Array.isArray(field.enum) || Array.isArray(field.oneOf)
      if (hasOptions && (!options || options.length === 0)) {
        unsupported = true
        continue
      }
      const defaultValue =
        typeof field.default === 'string' ? field.default : undefined
      fields.push({
        ...common,
        type: 'string',
        ...(defaultValue !== undefined ? { default: defaultValue } : {}),
        ...(options ? { options } : {}),
        ...(numberValue(field.minLength) !== undefined
          ? { minLength: numberValue(field.minLength) }
          : {}),
        ...(numberValue(field.maxLength) !== undefined
          ? { maxLength: numberValue(field.maxLength) }
          : {}),
        ...(userInputFormat(field.format)
          ? { format: userInputFormat(field.format) }
          : {}),
      })
      continue
    }

    if (type === 'array') {
      const items = recordValue(field.items)
      const options = userInputOptions(items)
      const hasOptions =
        Array.isArray(items.enum) || Array.isArray(items.anyOf)
      if (hasOptions && (!options || options.length === 0)) {
        unsupported = true
        continue
      }
      const defaultValue = stringArrayValue(field.default)
      fields.push({
        ...common,
        type: 'array',
        ...(defaultValue !== undefined ? { default: defaultValue } : {}),
        ...(options ? { options } : {}),
        ...(numberValue(field.minItems) !== undefined
          ? { minItems: numberValue(field.minItems) }
          : {}),
        ...(numberValue(field.maxItems) !== undefined
          ? { maxItems: numberValue(field.maxItems) }
          : {}),
      })
      continue
    }

    if (type === 'boolean') {
      fields.push({
        ...common,
        type: 'boolean',
        ...(typeof field.default === 'boolean'
          ? { default: field.default }
          : {}),
      })
      continue
    }

    if (type === 'number' || type === 'integer') {
      const defaultValue = numberValue(field.default)
      fields.push({
        ...common,
        type,
        ...(defaultValue !== undefined ? { default: defaultValue } : {}),
        ...(numberValue(field.minimum) !== undefined
          ? { minimum: numberValue(field.minimum) }
          : {}),
        ...(numberValue(field.maximum) !== undefined
          ? { maximum: numberValue(field.maximum) }
          : {}),
      })
      continue
    }

    unsupported = true
  }

  return unsupported ? undefined : { fields }
}

function validateUserInputForm(
  form: UserInputForm,
  values: Record<string, UserInputFieldValue>,
): void {
  const fields = new Map(form.fields.map((field) => [field.name, field]))
  for (const name of Object.keys(values)) {
    if (!fields.has(name)) {
      throw new Error(`Unknown elicitation field: ${name}`)
    }
  }

  for (const field of form.fields) {
    const value = values[field.name]
    if (value === undefined) {
      if (field.required) {
        throw new Error(`Elicitation field is required: ${field.title}`)
      }
      continue
    }
    const options = field.options
      ? new Set(field.options.map((option) => option.value))
      : undefined
    if (field.type === 'string') {
      if (typeof value !== 'string') {
        throw new Error(`Invalid value for elicitation field: ${field.title}`)
      }
      if (options && !options.has(value)) {
        throw new Error(`Invalid value for elicitation field: ${field.title}`)
      }
      if (
        field.minLength !== undefined &&
        value.length < field.minLength
      ) {
        throw new Error(`Elicitation field is too short: ${field.title}`)
      }
      if (
        field.maxLength !== undefined &&
        value.length > field.maxLength
      ) {
        throw new Error(`Elicitation field is too long: ${field.title}`)
      }
      continue
    }
    if (field.type === 'array') {
      if (
        !Array.isArray(value) ||
        !value.every((entry) => typeof entry === 'string')
      ) {
        throw new Error(`Invalid value for elicitation field: ${field.title}`)
      }
      if (options && value.some((entry) => !options.has(entry))) {
        throw new Error(`Invalid value for elicitation field: ${field.title}`)
      }
      if (
        field.minItems !== undefined &&
        value.length < field.minItems
      ) {
        throw new Error(`Elicitation field has too few values: ${field.title}`)
      }
      if (
        field.maxItems !== undefined &&
        value.length > field.maxItems
      ) {
        throw new Error(`Elicitation field has too many values: ${field.title}`)
      }
      continue
    }
    if (field.type === 'boolean') {
      if (typeof value !== 'boolean') {
        throw new Error(`Invalid value for elicitation field: ${field.title}`)
      }
      continue
    }
    if (field.type === 'number' || field.type === 'integer') {
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        (field.type === 'integer' && !Number.isInteger(value))
      ) {
        throw new Error(`Invalid value for elicitation field: ${field.title}`)
      }
      if (
        field.minimum !== undefined &&
        value < field.minimum
      ) {
        throw new Error(`Elicitation value is below minimum: ${field.title}`)
      }
      if (
        field.maximum !== undefined &&
        value > field.maximum
      ) {
        throw new Error(`Elicitation value is above maximum: ${field.title}`)
      }
    }
  }
}

export function pendingUserInputFromEvents(
  events: SessionEvent[],
): PendingUserInput | undefined {
  const pendingInputFromTool = (
    toolCallIdValue: unknown,
    toolNameValue: unknown,
    argumentsValue: unknown,
  ):
    | {
        toolCallId: string
        input: PendingUserInput
      }
    | undefined => {
    const toolCallId = stringValue(toolCallIdValue)
    const toolName = (stringValue(toolNameValue) || '')
      .toLowerCase()
      .replaceAll('-', '_')
    if (!toolCallId || toolName !== 'ask_user') {
      return undefined
    }
    const argumentsRecord = recordValue(argumentsValue)
    const question =
      (
        stringValue(argumentsRecord.question) ||
        stringValue(argumentsRecord.message) ||
        ''
      ).trim()
    if (!question) {
      return undefined
    }
    const choices = Array.isArray(argumentsRecord.choices)
      ? argumentsRecord.choices.flatMap((choice) =>
          typeof choice === 'string' && choice.trim()
            ? [choice.trim()]
            : [],
        )
      : []
    const form = userInputFormFromSchema(argumentsRecord.requestedSchema)
    return {
      toolCallId,
      input: {
        requestId: `persisted-user-input:${toolCallId}`,
        question,
        choices,
        allowFreeform:
          form
            ? false
            : typeof argumentsRecord.allowFreeform === 'boolean'
              ? argumentsRecord.allowFreeform
              : true,
        ...(form ? { form } : {}),
      },
    }
  }

  let pending:
    | {
        toolCallId: string
        input: PendingUserInput
      }
    | undefined
  for (const event of events) {
    if (eventAgentId(event)) {
      continue
    }
    if (event.type === 'user.message') {
      pending = undefined
      continue
    }
    if (event.type === 'assistant.message') {
      const toolRequests = recordValue(event.data).toolRequests
      if (Array.isArray(toolRequests)) {
        for (const requestValue of toolRequests) {
          const request = recordValue(requestValue)
          const next = pendingInputFromTool(
            request.toolCallId,
            request.name || request.toolName,
            request.arguments,
          )
          if (next) {
            pending = next
          }
        }
      }
      continue
    }
    if (event.type === 'tool.execution_start') {
      const data = recordValue(event.data)
      const next = pendingInputFromTool(
        data.toolCallId,
        data.toolName,
        data.arguments,
      )
      if (next) {
        pending = next
      }
      continue
    }
    if (
      event.type === 'tool.execution_complete' &&
      pending?.toolCallId === stringValue(recordValue(event.data).toolCallId)
    ) {
      pending = undefined
    } else if (
      event.type === 'abort' ||
      event.type === 'session.error' ||
      event.type === 'session.shutdown'
    ) {
      pending = undefined
    }
  }
  return pending?.input
}

/**
 * Turns an answered form into the moves that fill the agent's own form.
 * Anything that cannot be mapped confidently returns undefined, so the caller
 * falls back to cancelling the prompt and answering in a message rather than
 * submitting a value the user did not choose.
 */
export function terminalFormSteps(
  form: UserInputForm,
  values: Record<string, UserInputFieldValue>,
): TerminalFormStep[] | undefined {
  const steps: TerminalFormStep[] = []
  for (const field of form.fields) {
    const value = values[field.name]
    if (field.type === 'array') {
      const options = field.options
      if (!options || options.length === 0) {
        return undefined
      }
      const chosen = Array.isArray(value) ? value.map(String) : undefined
      if (!chosen) {
        return undefined
      }
      const wanted = new Set(chosen)
      if (
        [...wanted].some(
          (entry) => !options.some((option) => String(option.value) === entry),
        )
      ) {
        // The reader picked something this checklist does not offer, so the
        // rows cannot be walked with any confidence about where they are.
        return undefined
      }
      // What the reader chose, as rows. Which of them have to be pressed
      // depends on what the checklist is showing, which only the screen knows.
      const selected: number[] = []
      options.forEach((option, index) => {
        if (wanted.has(String(option.value))) {
          selected.push(index)
        }
      })
      steps.push({
        kind: 'checklist',
        // The CLI adds a freeform row under the options, as it does for a
        // single-choice list, and it is one of the rows on screen.
        optionCount: options.length + 1,
        selected,
      })
      continue
    }
    if (field.type === 'boolean') {
      if (typeof value !== 'boolean') {
        return undefined
      }
      // The agent lists Yes, No, then a freeform row.
      steps.push({ kind: 'select', optionCount: 3, index: value ? 0 : 1 })
      continue
    }
    const options = field.options
    if (options && options.length > 0) {
      const index = options.findIndex((option) => option.value === value)
      if (index < 0) {
        return undefined
      }
      steps.push({
        kind: 'select',
        optionCount: options.length + 1,
        index,
      })
      continue
    }
    if (value !== undefined && typeof value !== 'string' && typeof value !== 'number') {
      return undefined
    }
    steps.push({ kind: 'text', value: value === undefined ? '' : String(value) })
  }
  return steps.length === form.fields.length ? steps : undefined
}

/**
 * A cancelled prompt leaves the agent without its answer, so the reply spells
 * out every field it asked for instead of sending an opaque JSON blob.
 */
function persistedFormAnswer(
  request: PendingUserInput,
  values: Record<string, UserInputFieldValue>,
): string {
  const lines = (request.form?.fields || []).map((field) => {
    const value = values[field.name]
    const rendered = Array.isArray(value)
      ? value.join(', ')
      : value === undefined
        ? ''
        : String(value)
    return `- ${field.name}: ${rendered}`
  })
  return [
    'Answering the question you just asked, from the Agentic Remote app:',
    ...lines,
  ].join('\n')
}

function visibleUserContent(content: string): string {
  const direct = content.trim()
  if (direct) {
    return direct.startsWith('<skill-context') ||
      direct.startsWith('<system_reminder')
      ? ''
      : direct
  }
  return ''
}

function readableToolName(value: string): string {
  return value
    .replace(/^github-mcp-server-/, 'GitHub · ')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function readableMcpServerName(value: string): string {
  const label = readableToolName(
    value
      .replace(/^mcp:/i, '')
      .replace(/(?:-mcp)?-server$/i, ''),
  )
  return label === 'Github' ? 'GitHub' : label
}

function sameToolLabel(left: string, right: string): boolean {
  return left.replace(/[^a-z0-9]/gi, '').toLowerCase() ===
    right.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function previewText(value: unknown, multiline = false): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const normalized = stripAnsi(value).replaceAll('\0', '').trim()
  if (!normalized) {
    return undefined
  }
  const preview = multiline
    ? normalized
        .split(/\r?\n/)
        .slice(0, 3)
        .map((line) => line.trim())
        .join('\n')
    : normalized.replace(/\s+/g, ' ')
  return preview.length > 320 ? `${preview.slice(0, 319)}…` : preview
}

function toolActivityContent(data: unknown): string {
  const tool = recordValue(data)
  const toolName = stringValue(tool.toolName) || 'tool'
  const argumentsValue = recordValue(tool.arguments)
  const toolDescription = recordValue(tool.toolDescription)
  const normalizedToolName = toolName.toLowerCase().replaceAll('-', '_')
  const mcpServerName = previewText(tool.mcpServerName)
  const mcpToolName = previewText(tool.mcpToolName)
  const rawToolName = toolName.replace(/^mcp:/i, '')
  const inferredMcp = rawToolName.match(/^(.+?)-mcp-server-(.+)$/i)
  const isMcp =
    Boolean(mcpServerName || mcpToolName || inferredMcp) ||
    /^mcp:/i.test(toolName)
  const skillName =
    normalizedToolName === 'skill'
      ? previewText(argumentsValue.skill) || previewText(argumentsValue.name)
      : undefined
  // A background agent keeps the turn open long after the parent's last
  // message, so its row has to name the agent instead of reading like an
  // ordinary finished tool call.
  const agentType =
    normalizedToolName === 'task'
      ? previewText(argumentsValue.agent_type) ||
        previewText(argumentsValue.name)
      : undefined
  const description =
    previewText(tool.toolTitle) ||
    previewText(toolDescription.description) ||
    previewText(argumentsValue.description) ||
    previewText(argumentsValue.message)
  const command = previewText(argumentsValue.command, true)
  const detail =
    normalizedToolName === 'skill' || normalizedToolName === 'task'
      ? undefined
      : command ||
        previewText(argumentsValue.path) ||
        previewText(argumentsValue.file_path) ||
        previewText(argumentsValue.query) ||
        previewText(argumentsValue.pattern) ||
        previewText(argumentsValue.url) ||
        previewText(argumentsValue.agent_type) ||
        previewText(argumentsValue.name)
  const baseTitle = isMcp
    ? [
        'MCP',
        mcpServerName || inferredMcp?.[1]
          ? readableMcpServerName(mcpServerName || inferredMcp?.[1] || '')
          : undefined,
        mcpToolName || inferredMcp?.[2]
          ? readableToolName(mcpToolName || inferredMcp?.[2] || '')
          : readableToolName(rawToolName),
      ]
        .filter(Boolean)
        .join(' · ')
    : agentType
      ? 'Agent'
      : readableToolName(toolName)
  const titleDescription =
    description &&
    (isMcp
      ? !sameToolLabel(
          description,
          mcpToolName || inferredMcp?.[2] || toolName,
        )
      : true)
      ? ` · ${description}`
      : ''
  const title = `${baseTitle}${
    skillName
      ? ` (${skillName})${titleDescription}`
      : agentType
        ? ` (${agentType})${titleDescription}`
        : titleDescription
  }`
  if (!detail) {
    return title
  }
  const commandLike = /(?:bash|shell|powershell)/i.test(toolName)
  return `${title}\n${commandLike ? `$ ${detail}` : detail}`
}

function commandShortcut(value: string): string {
  const parts = value.split(/[-_]/)
  return parts.length > 1
    ? parts
    .map((part) => part[0] || '')
    .join('')
    .toLowerCase()
    : ''
}

const ansiSequence = new RegExp(
  `${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`,
  'g',
)

function stripAnsi(value: string): string {
  return value.replace(ansiSequence, '')
}

const foregroundLifecycleEvents = new Set<SessionEvent['type']>([
  'assistant.turn_start',
  'permission.requested',
  'permission.completed',
  'session.error',
  'assistant.turn_end',
  'session.idle',
  'abort',
  'session.shutdown',
])

function eventAgentId(event: SessionEvent): string | undefined {
  return (
    stringValue(event.agentId) ||
    stringValue(recordValue(event.data).agentId)
  )
}

function isForegroundLifecycleEvent(event: SessionEvent): boolean {
  return !eventAgentId(event) && foregroundLifecycleEvents.has(event.type)
}

function isForegroundCompletionEvent(event: SessionEvent): boolean {
  return (
    isForegroundLifecycleEvent(event) &&
    (event.type === 'assistant.turn_end' ||
      event.type === 'session.idle' ||
      event.type === 'session.error' ||
      event.type === 'abort' ||
      event.type === 'session.shutdown')
  )
}

function isBackgroundTaskEvent(event: SessionEvent): boolean {
  if (
    eventAgentId(event) ||
    event.type === 'session.background_tasks_changed' ||
    event.type === 'subagent.started' ||
    event.type === 'subagent.completed' ||
    event.type === 'subagent.failed'
  ) {
    return true
  }
  if (event.type !== 'system.notification') {
    return false
  }
  const data = recordValue(event.data)
  const kind = recordValue(data.kind)
  return [
    'agent_idle',
    'agent_completed',
    'shell_completed',
    'shell_detached_completed',
  ].includes(stringValue(kind.type) || '')
}

export function statusFromEvents(events: SessionEvent[]): SessionStatus {
  let status: SessionStatus = 'idle'
  // Work a turn handed to background agents outlives the turn itself, so the
  // agents still running are tracked separately from it.
  const workingAgents = new Set<string>()
  for (const event of events) {
    if (!isForegroundLifecycleEvent(event)) {
      const agentId = eventAgentId(event)
      if (agentId) {
        if (event.type === 'subagent.started') {
          workingAgents.add(agentId)
        } else if (
          event.type === 'subagent.completed' ||
          event.type === 'subagent.failed'
        ) {
          // Failing ends an agent just as completing does. Tracking only the
          // completions would leave a failed agent working for good, and the
          // session running with it.
          workingAgents.delete(agentId)
        }
      }
      continue
    }
    switch (event.type) {
      case 'assistant.turn_start':
        status = 'running'
        break
      case 'permission.requested':
        status = 'waiting'
        break
      case 'permission.completed':
        status = 'running'
        break
      case 'session.error':
        status = 'error'
        break
      case 'assistant.turn_end':
      case 'session.idle':
        status = 'idle'
        break
      case 'abort':
      case 'session.shutdown':
        // Nothing outlives the session ending, so agents it was waiting on
        // are not still working.
        workingAgents.clear()
        status = 'idle'
        break
    }
  }
  // A turn that handed its work to background agents and then ended has not
  // finished it. Reporting the session as idle offers it for the next prompt
  // and calls the work done while it is still going on.
  return status === 'idle' && workingAgents.size > 0 ? 'running' : status
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {}
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function agentMode(value: unknown): AgentMode | undefined {
  return value === 'interactive' || value === 'plan' || value === 'autopilot'
    ? value
    : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function contextTextLength(value: unknown): number {
  if (typeof value === 'string') {
    return value.length
  }
  if (Array.isArray(value)) {
    return value.reduce((total, entry) => total + contextTextLength(entry), 0)
  }
  if (value && typeof value === 'object') {
    const content = (value as Record<string, unknown>).content
    return content === undefined ? 0 : contextTextLength(content)
  }
  return 0
}

function eventContextLength(event: SessionEvent): number {
  const data = recordValue(event.data)
  if (event.type === 'user.message') {
    const source = stringValue(data.source)
    return source?.startsWith('agent-')
      ? 0
      : contextTextLength(data.content)
  }

  if (event.type === 'assistant.message') {
    return eventAgentId(event) ? 0 : contextTextLength(data.content)
  }
  if (event.type === 'tool.execution_complete') {
    return eventAgentId(event) ? 0 : contextTextLength(data.result)
  }
  return 0
}

function workingDirectoryFromEvents(
  events: SessionEvent[],
  fallback?: string,
): string | undefined {
  let cwd = fallback
  for (const event of events) {
    if (eventAgentId(event)) {
      continue
    }
    const data = recordValue(event.data)
    if (event.type === 'session.start' || event.type === 'session.resume') {
      cwd = stringValue(recordValue(data.context).cwd) || cwd
    } else if (event.type === 'session.context_changed') {
      cwd = stringValue(data.cwd) || cwd
    }
  }
  return cwd
}

function estimatedContextTokens(events: SessionEvent[]): number | undefined {
  let baselineIndex = -1
  let baselineTokens = 0
  const completedIndex = events.findLastIndex(
    (event) =>
      event.type === 'session.compaction_complete' &&
      recordValue(event.data).success === true,
  )
  if (completedIndex >= 0) {
    const complete = recordValue(events[completedIndex].data)
    const start = events
      .slice(0, completedIndex)
      .findLast((event) => event.type === 'session.compaction_start')
    const startData = recordValue(start?.data)
    baselineTokens =
      (numberValue(startData.systemTokens) || 0) +
      (numberValue(startData.toolDefinitionsTokens) || 0) +
      Math.ceil(contextTextLength(complete.summaryContent) / 4)
    baselineIndex = completedIndex
  } else {
    const startIndex = events.findLastIndex(
      (event) => event.type === 'session.compaction_start',
    )
    if (startIndex >= 0) {
      const startData = recordValue(events[startIndex].data)
      baselineTokens =
        (numberValue(startData.systemTokens) || 0) +
        (numberValue(startData.conversationTokens) || 0) +
        (numberValue(startData.toolDefinitionsTokens) || 0)
      baselineIndex = startIndex
    }
  }
  const addedCharacters = events
    .slice(baselineIndex + 1)
    .reduce((total, event) => total + eventContextLength(event), 0)
  const estimate = baselineTokens + Math.ceil(addedCharacters / 4)
  return estimate > 0 ? estimate : undefined
}

export function runtimeInfoFromEvents(
  events: SessionEvent[],
  previous: SessionRuntimeInfo | undefined,
  modelLimits: ReadonlyMap<string, ModelPromptLimits> = new Map(),
  estimateContext = true,
): SessionRuntimeInfo | undefined {
  const runtime: SessionRuntimeInfo = { ...previous }
  let exactContext = false
  for (const event of events) {
    if (eventAgentId(event)) {
      continue
    }
    const data = recordValue(event.data)
    if (event.type === 'session.start') {
      runtime.model = stringValue(data.selectedModel) || runtime.model
      runtime.reasoningEffort =
        stringValue(data.reasoningEffort) || runtime.reasoningEffort
      runtime.contextTier =
        stringValue(data.contextTier) || runtime.contextTier
    } else if (event.type === 'session.resume') {
      runtime.model = stringValue(data.selectedModel) || runtime.model
      runtime.reasoningEffort =
        stringValue(data.reasoningEffort) || runtime.reasoningEffort
      runtime.contextTier =
        stringValue(data.contextTier) || runtime.contextTier
    } else if (event.type === 'session.model_change') {
      runtime.model = stringValue(data.newModel) || runtime.model
      runtime.reasoningEffort =
        stringValue(data.reasoningEffort) || runtime.reasoningEffort
      runtime.contextTier =
        stringValue(data.contextTier) || runtime.contextTier
    } else if (event.type === 'session.mode_changed') {
      runtime.mode = stringValue(data.newMode) || runtime.mode
    } else if (
      event.type === 'session.permissions_changed' &&
      typeof data.allowAllPermissions === 'boolean'
    ) {
      runtime.allowAllPermissions = data.allowAllPermissions
    } else if (
      event.type === 'assistant.message' ||
      event.type === 'tool.execution_start'
    ) {
      runtime.model = stringValue(data.model) || runtime.model
    } else if (event.type === 'session.usage_info') {
      runtime.contextTokens =
        numberValue(data.currentTokens) || runtime.contextTokens
      runtime.contextTokenLimit =
        numberValue(data.tokenLimit) || runtime.contextTokenLimit
      runtime.contextEstimated = false
      exactContext = true
    }
  }
  const limits = runtime.model ? modelLimits.get(runtime.model) : undefined
  if (
    !exactContext &&
    limits &&
    previous?.contextEstimated !== false
  ) {
    runtime.contextTokenLimit =
      runtime.contextTier === 'long_context'
        ? limits.long || limits.maximum
        : limits.default || limits.maximum
  }

  if (
    !exactContext &&
    estimateContext &&
    previous?.contextEstimated !== false
  ) {
    const estimate = estimatedContextTokens(events)
    if (estimate !== undefined) {
      runtime.contextTokens = estimate
      runtime.contextEstimated = true
    }
  }
  return Object.values(runtime).some((value) => value !== undefined)
    ? runtime
    : undefined
}

function runtimeInfoMatches(
  left: SessionRuntimeInfo | undefined,
  right: SessionRuntimeInfo,
): boolean {
  return (
    left?.model === right.model &&
    left?.reasoningEffort === right.reasoningEffort &&
    left?.contextTier === right.contextTier &&
    left?.contextTokens === right.contextTokens &&
    left?.contextTokenLimit === right.contextTokenLimit &&
    left?.contextEstimated === right.contextEstimated &&
    left?.mode === right.mode &&
    left?.allowAllPermissions === right.allowAllPermissions
  )
}

function isMissingSessionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  const message = error.message.toLowerCase()
  return (
    message.includes('session') &&
    (message.includes('not found') || message.includes('does not exist'))
  )
}

function isUnsupportedBackgroundTaskError(error: unknown): boolean {
  const details = recordValue(error)
  const nestedDetails = recordValue(details.error)
  const code = details.code ?? nestedDetails.code
  if (
    code === -32601 ||
    code === '-32601' ||
    (typeof code === 'string' &&
      code.toLowerCase().replaceAll(/[\s_-]+/g, '') === 'methodnotfound')
  ) {
    return true
  }
  const message =
    error instanceof Error
      ? error.message
      : stringValue(details.message) || stringValue(nestedDetails.message)
  if (!message) {
    return false
  }
  const normalizedMessage = message.toLowerCase()
  return (
    normalizedMessage.includes('method not found') ||
    normalizedMessage.includes('methodnotfound') ||
    normalizedMessage.includes('unknown method') ||
    normalizedMessage.includes('unhandled method') ||
    normalizedMessage.includes('not supported')
  )
}

function normalizedTitle(value: string | undefined, fallback: string): string {
  const firstLine = value?.trim().split(/\r?\n/, 1)[0]?.trim() || fallback
  return firstLine.length > 72 ? `${firstLine.slice(0, 72)}…` : firstLine
}

function permissionTitle(request: PermissionRequest): string {
  switch (request.kind) {
    case 'shell':
      return request.intention || request.fullCommandText
    case 'write':
      return request.intention || `Write ${request.fileName}`
    case 'read':
      return request.intention || `Read ${request.path}`
    case 'mcp':
      return `Use ${request.toolTitle || request.toolName}`
    case 'url':
      return request.intention || `Open ${request.url}`
    case 'memory':
      return request.subject || 'Update Copilot memory'
    case 'custom-tool':
      return request.toolDescription || `Use ${request.toolName}`
    case 'hook':
      return request.hookMessage || `Run hook for ${request.toolName}`
    case 'extension-management':
      return `Manage extension ${request.extensionName}`
    case 'factory':
      return `${request.operation === 'author' ? 'Author' : 'Run'} factory ${request.name}`
    case 'extension-permission-access':
      return `Allow extension ${request.extensionName}`
  }
  return 'Permission required'
}

export class AgentService extends EventEmitter<AgentServiceEvents> {
  private readonly client: CopilotClientLike
  private readonly sessions = new Map<string, CopilotSessionLike>()
  private readonly hydratedSessions = new Set<string>()
  private readonly loadingSessions = new Map<
    string,
    Promise<CopilotSessionLike>
  >()
  private readonly hydratingSessions = new Map<string, Promise<SessionDetail>>()
  private readonly activePrompts = new Map<string, ActivePrompt>()
  private readonly drainingSessions = new Set<string>()
  /** Failures whose resend has been admitted, so a second cannot be. */
  private readonly claimedFailures = new Set<string>()
  /** Failures whose resend was accepted, so a later copy cannot follow it. */
  private readonly answeredFailures = new Set<string>()
  /**
   * Sessions whose current send has reached the runtime.
   *
   * Anything that fails after this point leaves a send that may well have
   * arrived, whatever kind of failure it is.
   */
  private readonly deliveredSends = new Set<string>()
  /** What a cleared session became, so outstanding work can follow it. */
  private readonly replacedInto = new Map<string, string>()
  /** Sleeping acknowledgement retries, cleared when the service stops. */
  private readonly acknowledgementTimers = new Set<NodeJS.Timeout>()
  /** Marker clearances still outstanding after an accepted send. */
  private readonly pendingAcknowledgements = new Map<string, Promise<void>>()
  /** Set when the service is shutting down, so retries stop with it. */
  private stopped = false
  private readonly queueOperations = new Map<string, Promise<unknown>>()
  private readonly deletingSessions = new Set<string>()
  private readonly deletedSessionIds = new Set<string>()
  private readonly backgroundTaskTracker = new BackgroundTaskTracker()
  private readonly backgroundTaskSyncs = new Map<
    string,
    Promise<BackgroundTaskSnapshot>
  >()
  private readonly backgroundTaskResyncNeeded = new Set<string>()
  private readonly permissions = new Map<string, PendingSdkPermission>()
  private readonly userInputs = new Map<string, PendingSdkUserInput>()
  private readonly terminalUserInputChecks = new Map<string, number>()
  private readonly terminalUpdateChecks = new Map<string, number>()
  private readonly answeredTerminalPermissions = new Map<
    string,
    { requestId: string; expiresAt: number; repliedAt: string }
  >()
  /** Sessions being put down, which nothing may start a turn into. */
  private readonly suspendingSessions = new Set<string>()
  // Suspend, resume, restart, clear and migration each replace or remove a
  // session's runtime, so only one may be doing so at a time. Checking a flag
  // on the way in is not enough: they all await, and another can arrive while
  // one is waiting.
  private readonly lifecycleLocks = new Map<string, Promise<unknown>>()
  // Sessions with a prompt on its way to a runtime. Suspending has to leave
  // them alone: the store still says idle until the turn is recorded, and
  // tearing the runtime down here kills a turn that has already started.
  private readonly dispatchingSessions = new Map<string, number>()
  // Sessions whose runtime is not open for new work yet. A resume clears the
  // suspended flag before it has claimed the queue, and sending is reopened
  // by that flag, so admission is held shut separately until the prompt that
  // was already waiting has been taken.
  private readonly admissionClosed = new Set<string>()

  /** Marks a session as having a prompt on its way, and gives back the undo. */
  private holdDispatch(sessionId: string): () => void {
    // Counted rather than flagged: two sends can overlap, and the first to
    // finish would otherwise clear the mark while the second is still
    // awaiting delivery, leaving suspension free to tear it down.
    this.dispatchingSessions.set(
      sessionId,
      (this.dispatchingSessions.get(sessionId) || 0) + 1,
    )
    let released = false
    return () => {
      if (released) {
        return
      }
      released = true
      const held = (this.dispatchingSessions.get(sessionId) || 1) - 1
      if (held > 0) {
        this.dispatchingSessions.set(sessionId, held)
      } else {
        this.dispatchingSessions.delete(sessionId)
      }
    }
  }

  /** Runs lifecycle work for a session one at a time, in arrival order. */
  private serializeLifecycle<T>(
    sessionId: string,
    run: () => Promise<T>,
  ): Promise<T> {
    const previous = this.lifecycleLocks.get(sessionId) ?? Promise.resolve()
    const next = previous.catch(() => undefined).then(run)
    // Only that it finished, never what it produced: holding the result keeps
    // a whole cloned transcript alive for as long as the session does. The
    // entry goes once nothing is waiting behind it.
    const settled = next.then(
      () => undefined,
      () => undefined,
    )
    this.lifecycleLocks.set(sessionId, settled)
    void settled.then(() => {
      if (this.lifecycleLocks.get(sessionId) === settled) {
        this.lifecycleLocks.delete(sessionId)
      }
    })
    return next
  }
  /** Resumes already under way, so a second one joins rather than repeats. */
  private readonly resumingSessions = new Map<string, Promise<SessionDetail>>()
  private readonly answeredTerminalInputs = new Map<
    string,
    { requestId: string; expiresAt: number; repliedAt: string }
  >()
  // An ask-user request answered from the UI stays unresolved in the event log
  // until the agent writes its completion, so the recovery below must not
  // resurrect the request the user just answered.
  private readonly answeredPersistedInputs = new Map<
    string,
    { requestId: string; expiresAt: number }
  >()
  private readonly elicitations = new Map<string, PendingSdkElicitation>()
  private discoveryTimer?: NodeJS.Timeout
  private discoveryInFlight?: Promise<void>
  private transcriptTimer?: NodeJS.Timeout
  private transcriptInFlight?: Promise<void>
  private externalSessionIds = new Set<string>()
  private readonly launchingTerminalSessionIds = new Set<string>()
  private discoveryGeneration = 0
  private readonly eventLogFingerprints = new Map<string, string>()
  private readonly eventLogVersions = new Map<string, string>()
  private readonly workspaceVersions = new Map<string, string>()
  private readonly liveTranscriptWatermarks = new Map<string, string>()
  private readonly liveTaskCompletionSummaries = new Map<string, string>()
  private readonly liveActivityEvents = new Map<
    string,
    Map<
      string,
      {
        agentId?: string
        parentToolCallId?: string
        kind?: ActivityKind
        toolCallId?: string
        subagentToolCallId?: string
      }
    >
  >()
  private readonly modelPromptLimits = new Map<string, ModelPromptLimits>()
  private readonly runtimeModels = new Map<string, RuntimeModelOption>()
  private runtimeModelLoad?: Promise<void>
  private readonly externalCommandCache = new Map<
    string,
    {
      expiresAt: number
      commands: Awaited<
        ReturnType<CopilotSessionLike['rpc']['commands']['list']>
      >['commands']
    }
  >()

  constructor(
    readonly store: SessionStore,
    client: CopilotClientLike = new CopilotClient({
      connection: RuntimeConnection.forStdio({
        path: process.env.COPILOT_BIN?.trim() || '/usr/local/bin/copilot',
      }),
      logLevel: 'error',
      useLoggedInUser: true,
    }),
    private readonly activeSessionFinder = findActiveCopilotSessions,
    private readonly activeSessionStopper = stopActiveCopilotSession,
    private readonly sessionEventReader = readSessionEvents,
    private readonly sessionEventVersion = sessionEventLogVersion,
    private readonly terminalController: TerminalSessionController =
      new TmuxTerminalSessionController(),
    private readonly workspaceReader = readSessionWorkspaceMetadata,
    private readonly workspaceVersion = sessionWorkspaceVersion,
  ) {
    super()
    this.client = client
  }

  providers(): AgentProviderCapability[] {
    return [
      {
        id: 'copilot',
        name: 'GitHub Copilot',
        available: true,
        terminalBacked: true,
        supportsTmuxMigration: true,
        supportsBackgroundTasks: true,
      },
    ]
  }

  async start(): Promise<void> {
    await this.store.initialize()
    await this.client.start()
    await this.ensureRuntimeModels().catch((error: unknown) => {
      console.warn('Unable to load runtime models:', error)
    })
    await this.discoverSessions()
    const recoveredTerminalSessions = await this.recoverTerminalSessions()
    if (recoveredTerminalSessions > 0) {
      await this.discoverSessions()
    }

    await this.reconcileUntrackedTerminalDispatches()
    await this.refreshTranscripts()
    await Promise.all(
      this.store
        .list()
        .filter(
          (session) =>
            session.isOpen &&
            session.queuedPrompts?.length &&
            // A suspended session has nothing to run the queue in. The runtime
            // guard refuses it anyway, but only after taking the head off and
            // putting it back with an error nobody asked for.
            !session.suspended &&
            !this.externalSessionIds.has(session.id),
        )
        .map((session) => this.drainSdkQueue(session.id)),
    )
    this.discoveryTimer = setInterval(() => {
      void this.refreshDiscovery()
    }, 10_000)
    this.discoveryTimer.unref()
    this.transcriptTimer = setInterval(() => {
      void this.refreshTranscripts()
    }, 750)
    this.transcriptTimer.unref()
  }

  async stop(): Promise<void> {
    this.stopped = true
    for (const timer of this.acknowledgementTimers) {
      clearTimeout(timer)
    }
    this.acknowledgementTimers.clear()
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer)
      this.discoveryTimer = undefined
    }
    if (this.transcriptTimer) {
      clearInterval(this.transcriptTimer)
      this.transcriptTimer = undefined
    }
    for (const permission of this.permissions.values()) {
      permission.resolve({ kind: 'user-not-available' })
    }
    this.permissions.clear()
    for (const input of this.userInputs.values()) {
      input.resolve({ answer: '', wasFreeform: true })
    }
    this.userInputs.clear()
    for (const elicitation of this.elicitations.values()) {
      elicitation.resolve({ action: 'cancel' })
    }
    this.elicitations.clear()
    this.terminalUserInputChecks.clear()
    this.terminalUpdateChecks.clear()
    this.answeredTerminalPermissions.clear()
    this.answeredTerminalInputs.clear()
    this.backgroundTaskSyncs.clear()
    this.backgroundTaskResyncNeeded.clear()
    for (const session of this.store.list()) {
      this.backgroundTaskTracker.remove(session.id)
    }
    const disconnected = await Promise.allSettled(
      [...this.sessions.values()].map((session) => session.disconnect()),
    )
    this.sessions.clear()
    const errors = [
      ...disconnected.flatMap((result) =>
        result.status === 'rejected'
          ? [
              result.reason instanceof Error
                ? result.reason
                : new Error(String(result.reason)),
            ]
          : [],
      ),
      ...(await this.client.stop()),
    ]
    // Sessions and the SDK are down, so settle any write they triggered. Once
    // stop() resolves no further write can land, which is what lets a caller
    // safely tear down the data directory.
    await this.store.flush()
    const runtimeTimeouts = errors.filter((error) =>
      error.message.startsWith(
        'Failed to gracefully shut down runtime: runtime.shutdown timed out',
      ),
    )
    for (const timeout of runtimeTimeouts) {
      // The SDK reports this after disposing its connection and killing its owned CLI.
      console.warn('Copilot SDK graceful shutdown timed out:', timeout.message)
    }
    const fatalErrors = errors.filter((error) => !runtimeTimeouts.includes(error))
    if (fatalErrors.length > 0) {
      throw new AggregateError(fatalErrors, 'Copilot SDK did not stop cleanly')
    }
  }

  listSessions(): SessionDetail[] {
    return this.store
      .list()
      .filter((session) => session.isOpen)
      .map((session) => ({
        ...session,
        messages: [],
      }))
  }

  listHistory(): SessionDetail[] {
    return this.store.list().map((session) => ({
      ...session,
      messages: [],
    }))
  }

  listDirectories(path?: string, scope?: DirectoryScope) {
    return listHomeDirectories(path, scope)
  }

  validateSessionDirectory(inputPath: string): Promise<string> {
    return this.validateDirectory(inputPath)
  }

  /**
   * Browses a knowledge root. The root is confined exactly like a session
   * working directory, and the requested path is confined within it by
   * `listWorkspace`, so no session is involved.
   */
  async listKnowledge(root: string, path = '.') {
    return listWorkspace(await validateKnowledgeRoot(root), path)
  }

  async readKnowledgeFile(root: string, path: string) {
    return readWorkspaceFile(await validateKnowledgeRoot(root), path)
  }

  listWorkspace(
    sessionId: string,
    requestedPath?: string,
  ): Promise<WorkspaceListing> {
    return listWorkspace(
      this.requireWorkspaceRoot(sessionId),
      requestedPath,
    )
  }

  readWorkspaceFile(
    sessionId: string,
    requestedPath: string,
  ): Promise<WorkspaceFile> {
    return readWorkspaceFile(
      this.requireWorkspaceRoot(sessionId),
      requestedPath,
    )
  }

  searchWorkspace(
    sessionId: string,
    query: string,
    requestedPath?: string,
  ): Promise<WorkspaceSearchResponse> {
    return searchWorkspace(
      this.requireWorkspaceRoot(sessionId),
      query,
      requestedPath,
    )
  }

  private requireWorkspaceRoot(sessionId: string): string {
    const session = this.store.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    return session.cwd
  }

  private ensureRuntimeModels(): Promise<void> {
    if (this.runtimeModels.size > 0) {
      return Promise.resolve()
    }
    return this.refreshRuntimeModels()
  }

  private refreshRuntimeModels(): Promise<void> {
    if (this.runtimeModelLoad) {
      return this.runtimeModelLoad
    }
    const loading = this.loadRuntimeModels().finally(() => {
      if (this.runtimeModelLoad === loading) {
        this.runtimeModelLoad = undefined
      }
    })
    this.runtimeModelLoad = loading
    return loading
  }

  private async loadRuntimeModels(): Promise<void> {
    if (!this.client.listModels) {
      throw new RuntimeConfigurationError(
        'Runtime model discovery is not supported',
        503,
      )
    }
    const models = await this.client.listModels()
    if (models.length === 0) {
      throw new RuntimeConfigurationError(
        'No runtime models are currently available',
        503,
      )
    }
    const promptLimits = new Map<string, ModelPromptLimits>()
    const runtimeModels = new Map<string, RuntimeModelOption>()
    for (const model of models) {
      const value = recordValue(model)
      const capabilities = recordValue(value.capabilities)
      const capabilityLimits = recordValue(capabilities.limits)
      const billing = recordValue(value.billing)
      const tokenPrices = recordValue(billing.tokenPrices)
      const longContext = recordValue(tokenPrices.longContext)
      const limits = {
        default: numberValue(tokenPrices.maxPromptTokens),
        long: numberValue(longContext.maxPromptTokens),
        maximum: numberValue(capabilityLimits.max_prompt_tokens),
      }
      promptLimits.set(model.id, limits)
      const supportedEfforts = Array.isArray(value.supportedReasoningEfforts)
        ? value.supportedReasoningEfforts.filter(
            isRuntimeReasoningEffort,
          )
        : []
      runtimeModels.set(model.id, {
        id: model.id,
        name: stringValue(value.name) || model.id,
        reasoningEfforts: supportedEfforts,
        contextTiers:
          Object.keys(longContext).length > 0
            ? ['default', 'long_context']
            : ['default'],
        contextTokenLimits: {
          default: limits.default || limits.maximum,
          long_context: limits.long || limits.maximum,
        },
      })
    }
    this.modelPromptLimits.clear()
    this.runtimeModels.clear()
    for (const [id, limits] of promptLimits) {
      this.modelPromptLimits.set(id, limits)
    }
    for (const [id, model] of runtimeModels) {
      this.runtimeModels.set(id, model)
    }
  }

  getSession(id: string): SessionDetail | undefined {
    return this.store.get(id)
  }

  async openSession(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (this.externalSessionIds.has(id)) {
      return stored
    }
    if (this.hydratedSessions.has(id)) {
      return stored
    }
    if (stored.suspended) {
      // Having nothing running is what was asked for, not evidence that the
      // session is gone. Closing it here would drop it from recovery and take
      // the conversation with it.
      return stored
    }
    if (this.store.backend(id) === 'terminal') {
      const closed = await this.store.setOpen(id, false, true)
      this.publish(closed)
      throw new Error('Terminal session is no longer available')
    }

    const inFlight = this.hydratingSessions.get(id)
    if (inFlight) {
      return inFlight
    }
    const hydration = this.hydrateSession(id)
    this.hydratingSessions.set(id, hydration)
    try {
      return await hydration
    } finally {
      this.hydratingSessions.delete(id)
    }
  }

  async activateSession(id: string): Promise<SessionDetail> {
    const session = await this.openSession(id)
    const opened = await this.store.setOpen(id, true, true)
    this.publish(opened)
    return {
      ...opened,
      messages: session.messages,
    }
  }

  async createSession(
    inputPath: string,
    terminalBacked = false,
    allowAllPermissions = true,
    provider: AgentProvider = 'copilot',
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
  ): Promise<SessionDetail> {
    if (provider !== 'copilot') {
      throw new Error(`Provider ${provider} is not handled by Copilot`)
    }
    const cwd = await this.validateDirectory(inputPath)
    const runtime = await this.creationRuntime(
      model,
      reasoningEffort,
      contextTier,
    )
    if (terminalBacked) {
      return this.createTerminalSession(cwd, allowAllPermissions, runtime)
    }
    const sdkSession = await this.client.createSession({
      workingDirectory: cwd,
      streaming: true,
      ...runtime,
      onPermissionRequest: allowAllPermissions
        ? async () => ({ kind: 'approve-once' })
        : (request, invocation) =>
            this.requestPermission(invocation.sessionId, request),
      onUserInputRequest: (request, invocation) =>
        this.requestUserInput(invocation.sessionId, request),
      onElicitationRequest: (context) => this.requestElicitation(context),
    })
    this.attachSession(sdkSession)
    this.sessions.set(sdkSession.sessionId, sdkSession)
    this.hydratedSessions.add(sdkSession.sessionId)

    const now = new Date().toISOString()
    const session = await this.store.create(
      {
        id: sdkSession.sessionId,
        cwd,
        title: path.basename(cwd) || 'New session',
        updatedAt: now,
        status: 'idle',
        isOpen: true,
        messages: [],
        runtime: {
          allowAllPermissions,
          ...runtime,
        },
      },
      { managedOpen: true, backend: 'sdk' },
    )
    this.publish(session)
    return session
  }

  uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    return this.store.saveUpload(sessionId, filename, data)
  }

  async renameSession(id: string, title: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    // A suspended session is renamed where it is: the name is ours to keep,
    // and telling a runtime about it would mean starting the one that
    // suspending put down. It is carried over whenever the session next runs.
    if (!this.store.get(id)?.suspended && !this.suspendingSessions.has(id)) {
      if (this.externalSessionIds.has(id)) {
        await this.terminalController.rename?.(id, title)
      } else {
        const session = await this.ensureLoaded(id)
        await session.rpc.name.set({ name: title })
      }
    }
    const renamed = await this.store.renameSession(id, title)
    this.publish(renamed)
    return renamed
  }

  async providerRuntimeOptions(
    provider: AgentProvider,
  ): Promise<ProviderRuntimeOptions> {
    if (provider !== 'copilot') {
      throw new Error(`Provider ${provider} is not handled by Copilot`)
    }
    try {
      await this.refreshRuntimeModels()
    } catch (error) {
      throw new RuntimeConfigurationError(
        'Runtime models are temporarily unavailable. Try again.',
        503,
        { cause: error },
      )
    }
    return { models: [...this.runtimeModels.values()] }
  }

  async runtimeOptions(id: string): Promise<RuntimeOptions> {
    let stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    stored = await this.reconcileRuntimeStatus(stored)
    const options = await this.providerRuntimeOptions('copilot')
    return {
      current: stored.runtime || {},
      models: options.models,
      status: stored.status,
    }
  }

  async configureRuntime(
    id: string,
    input: ConfigureRuntimeInput,
  ): Promise<SessionDetail> {
    let stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    stored = await this.reconcileRuntimeStatus(stored)
    if (stored.status === 'running' || stored.status === 'waiting') {
      throw new RuntimeConfigurationError(
        'Runtime settings can only change while the session is idle',
        409,
      )
    }
    try {
      await this.refreshRuntimeModels()
    } catch (error) {
      throw new RuntimeConfigurationError(
        'Runtime models are temporarily unavailable. Try again.',
        503,
        { cause: error },
      )
    }
    const model = this.runtimeModels.get(input.model)
    if (!model) {
      throw new RuntimeConfigurationError('Selected model is not available', 400)
    }
    if (
      input.reasoningEffort &&
      !model.reasoningEfforts.includes(input.reasoningEffort)
    ) {
      throw new RuntimeConfigurationError(
        'Selected reasoning effort is not supported by this model',
        400,
      )
    }
    if (!model.contextTiers.includes(input.contextTier)) {
      throw new RuntimeConfigurationError(
        'Selected context tier is not supported by this model',
        400,
      )
    }
    const mode = input.mode || agentMode(stored.runtime?.mode) || 'interactive'
    const configuration: ConfigureRuntimeInput = { ...input, mode }
    const limits = this.modelPromptLimits.get(input.model)
    const persistRuntime = async (appliedMode: AgentMode | undefined) => {
      const updated = await this.store.update(id, (session) => {
        session.runtime = {
          ...session.runtime,
          model: input.model,
          reasoningEffort: input.reasoningEffort,
          contextTier: input.contextTier,
          mode: appliedMode || agentMode(session.runtime?.mode),
          contextTokenLimit:
            input.contextTier === 'long_context'
              ? limits?.long || limits?.maximum
              : limits?.default || limits?.maximum,
          contextEstimated: true,
        }
      })
      this.publish(updated)
      return updated
    }
    if (this.externalSessionIds.has(id)) {
      if (!this.terminalController.configure) {
        throw new Error('Terminal runtime configuration is not available')
      }
      if (!(await this.terminalController.configure(id, stored.cwd, configuration))) {
        throw new Error('External terminal is no longer available')
      }
    } else {
      const session = await this.ensureLoaded(id)
      const previousRuntime = await session.rpc.model.getCurrent()
      await session.rpc.model.switchTo({
        modelId: input.model,
        reasoningEffort: input.reasoningEffort,
        contextTier: input.contextTier,
      })
      try {
        await session.rpc.mode.set({ mode })
      } catch (error) {
        if (
          previousRuntime.modelId
        ) {
          try {
            await session.rpc.model.switchTo({
              modelId: previousRuntime.modelId,
              reasoningEffort: previousRuntime.reasoningEffort,
              contextTier: previousRuntime.contextTier,
            })
          } catch (rollbackError) {
            throw new AggregateError(
              [error, rollbackError],
              'Runtime configuration failed and the previous model could not be restored',
            )
          }
        }
        throw error
      }
    }
    return persistRuntime(mode)
  }

  private async reconcileRuntimeStatus(
    stored: SessionDetail,
  ): Promise<SessionDetail> {
    if (
      stored.status === 'idle' ||
      !this.externalSessionIds.has(stored.id) ||
      this.activePrompts.has(stored.id) ||
      stored.pendingPermission ||
      stored.pendingUserInput
    ) {
      return stored
    }
    const events = await this.sessionEventReader(stored.id)
    const latestLifecycle = events.findLast(
      (event) =>
        isForegroundLifecycleEvent(event) &&
        (event.type === 'assistant.turn_start' ||
          event.type === 'assistant.turn_end' ||
          event.type === 'session.idle' ||
          event.type === 'session.error' ||
          event.type === 'abort' ||
          event.type === 'session.shutdown'),
    )
    if (
      !latestLifecycle ||
      Date.parse(latestLifecycle.timestamp) < Date.parse(stored.updatedAt)
    ) {
      return stored
    }
    const status = statusFromEvents(events)
    if (status === stored.status || status === 'waiting') {
      return stored
    }
    const reconciled = await this.store.update(stored.id, (session) => {
      session.status = status
      if (status !== 'running') {
        session.activity = undefined
      }
    })
    this.publish(reconciled)
    return reconciled
  }

  /**
   * Keeps a session while giving back everything running for it.
   *
   * The conversation lives on disk, so the process holding it is the
   * expendable part. Suspending ends it and keeps the session, its id and its
   * history, which is what makes a machine full of sessions affordable.
   */
  async suspendSession(id: string): Promise<SessionDetail> {
    return this.serializeLifecycle(id, () => this.suspendSerialized(id))
  }

  private async suspendSerialized(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (stored.suspended) {
      return stored
    }
    if (this.suspendingSessions.has(id)) {
      throw Object.assign(new Error('Session is already being suspended'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    // Claimed before anything is awaited, so a message arriving while the
    // background tasks are being read cannot start a turn into a session that
    // is on its way down.
    this.suspendingSessions.add(id)
    try {
      return await this.suspendClaimedSession(id, stored)
    } finally {
      this.suspendingSessions.delete(id)
    }
  }

  private async suspendClaimedSession(
    id: string,
    stored: SessionDetail,
  ): Promise<SessionDetail> {
    if (
      stored.status === 'running' ||
      stored.status === 'waiting' ||
      this.drainingSessions.has(id)
    ) {
      throw Object.assign(new Error('Session can only be suspended while idle'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    // A detached shell keeps running without holding the foreground, so an
    // idle session can still own live work. Suspending ends the owner, which
    // either abandons that work or leaves it running behind a session that
    // says nothing is.
    // Asked for the way the panel asks, because a terminal session's tasks
    // are projected from its event log rather than owned over RPC: the sync
    // path sees nothing for one and would report it as having no work.
    // Not knowing what is running is not the same as nothing running, and the
    // cache is empty until something has been read once, so a failure here
    // refuses rather than assumes.
    await this.assertNoLiveBackgroundTasks(id)
    // Reading the tasks was awaited, and a turn can start while it is. What
    // was idle when this began may be working now, and putting the runtime
    // down would take that work with it.
    this.assertStillIdle(id)
    // A terminal session's foreground status is only refreshed by the poll, so
    // the store can still say idle while a turn typed straight into the pane
    // is already running. The log is asked directly rather than trusted to
    // have been read in the last fraction of a second.
    if (this.externalSessionIds.has(id) || this.store.backend(id) === 'terminal') {
      // An absent log already reads as an empty list, so anything thrown here
      // is a log that could not be read. Carrying on would suspend on the
      // strength of a status the poll may not have refreshed, and take a live
      // turn down with it.
      const events = await this.sessionEventReader(id).catch(() => {
        throw new Error(
          'Session cannot be suspended until its transcript can be read',
        )
      })
      if (statusFromEvents(events) !== 'idle') {
        throw Object.assign(new Error('Session can only be suspended while idle'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
      }
    }
    // The stored backend as well as the discovery set. Discovery can miss a
    // live terminal for a pass, and taking that as an SDK session found no
    // runtime to put down and recorded the session as suspended with its pane
    // still running. The controller proves absence, or does the teardown.
    if (this.externalSessionIds.has(id) || this.store.backend(id) === 'terminal') {
      if (!this.terminalController.stop) {
        throw new Error('Terminal session suspend is not available')
      }
      // Checked again in there, immediately before the pane is killed.
      // Finding the owner is awaited, and somebody working in tmux can start
      // a turn while that happens, which this would otherwise take with it.
      // Discovery that began before the pane was killed is holding an answer
      // that predates the suspension, and would land afterwards and mark the
      // session closed. Moving the generation on discards it, the same way
      // resume discards an answer that predates the pane it started.
      this.discoveryGeneration += 1
      const closed = await this.terminalController.stop(id, async () => {
        this.assertStillIdle(id)
        // One reading answers both questions, and nothing is awaited after it.
        // A terminal session's background tasks are projected from the same
        // event log its foreground status comes from, so asking separately
        // left a gap: a detached task started during the second read holds no
        // turn, the status still said idle, and the pane went down underneath
        // live work.
        const live = await this.sessionEventReader(id).catch(() => {
          throw new Error(
            'Session cannot be suspended until its transcript can be read',
          )
        })
        if (statusFromEvents(live) !== 'idle') {
          throw Object.assign(new Error('Session can only be suspended while idle'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
        }
        const running = backgroundTasksFromEvents(live, {
          assumeBackground: true,
        }).filter(
          (task) => task.status === 'running' || task.status === 'queued',
        )
        if (running.length) {
          throw new Error(
            'Session can only be suspended once its background tasks finish',
          )
        }
        this.assertStillIdle(id)
      })
      this.discoveryGeneration += 1
      if (!closed) {
        throw Object.assign(new Error('The terminal window could not be closed'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
      }
    } else {
      // An attachment already on its way would insert a live runtime after
      // this point, so it is waited for and then let go of rather than left
      // to land behind the suspension.
      const loading = this.loadingSessions.get(id)
      if (loading) {
        await loading.catch(() => undefined)
      }
      // The attachment above was awaited, and a detached task can be started
      // inside that wait. Disconnecting would abandon it.
      await this.assertNoLiveBackgroundTasks(id)
      this.assertStillIdle(id)
      const active = this.sessions.get(id)
      if (active) {
        await active.disconnect()
        this.sessions.delete(id)
      }
      this.hydratedSessions.delete(id)
    }
    // Tearing the runtime down was awaited too. Recording a suspension over
    // work that started meanwhile would describe a session as suspended while
    // it is still running.
    this.assertStillIdle(id)
    const suspended = await this.store.setSuspended(id, true)
    this.publish(suspended)
    return suspended
  }

  /**
   * Refuses unless the session is still doing nothing.
   *
   * Suspending awaits twice over, and the session is only reserved against
   * other suspensions. Idleness is the whole precondition, so it is checked
   * again after each wait rather than once at the start.
   */
  /**
   * Refuses unless the session owns no live background work.
   *
   * Reading this is awaited, and a detached task can be started inside that
   * wait, so it is asked again immediately before the runtime goes down rather
   * than once on the way in. The idleness check beside it only refreshes
   * foreground status and would not see a task that holds no turn.
   *
   * Asked for the way the panel asks, because a terminal session's tasks are
   * projected from its event log rather than owned over RPC. Not knowing what
   * is running is not the same as nothing running, so a failure here refuses
   * rather than assumes.
   */
  private async assertNoLiveBackgroundTasks(id: string): Promise<void> {
    const tasks = await this.listBackgroundTasks(id).catch(() => {
      throw new Error(
        'Session cannot be suspended until its background tasks can be read',
      )
    })
    if (!tasks.supported) {
      // An empty list because the runtime could not be asked is not the same
      // as an empty list because nothing is running, and suspending on the
      // strength of it disconnects a session that still owns live work.
      throw new Error(
        'Session cannot be suspended until its background tasks can be read',
      )
    }
    if (
      tasks.tasks.some(
        (task) => task.status === 'running' || task.status === 'queued',
      )
    ) {
      throw new Error(
        'Session can only be suspended once its background tasks finish',
      )
    }
  }

  private assertStillIdle(id: string): void {
    const current = this.store.get(id)
    if (
      !current ||
      current.status === 'running' ||
      current.status === 'waiting' ||
      this.drainingSessions.has(id) ||
      this.activePrompts.has(id) ||
      // A prompt already on its way to the runtime. The store still says idle
      // until the turn is recorded, so without this the teardown lands on a
      // turn that has already started.
      this.dispatchingSessions.has(id)
    ) {
      throw Object.assign(new Error('Session can only be suspended while idle'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
  }

  /** Gives a suspended session something to run in again. */
  async resumeSession(id: string): Promise<SessionDetail> {
    // In the same queue as suspend, restart, clear and migration. Reading the
    // stored flag on the way in saw a session that suspension was still in
    // the middle of putting down, and returned success for a resume the
    // suspension then wrote over.
    return this.serializeLifecycle(id, () => this.resumeQueued(id))
  }

  private async resumeQueued(id: string): Promise<SessionDetail> {
    const inFlight = this.resumingSessions.get(id)
    if (inFlight) {
      // Two resumes would each find no owner and each build one, leaving two
      // Copilot processes on the same session id.
      return inFlight
    }
    const resuming = this.resumeClaimedSession(id).finally(() => {
      this.resumingSessions.delete(id)
    })
    this.resumingSessions.set(id, resuming)
    return resuming
  }

  private async resumeClaimedSession(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (!stored.suspended) {
      return stored
    }
    if (this.store.backend(id) === 'terminal') {
      if (!this.terminalController.create) {
        throw new Error('Terminal session resume is not available')
      }
      if (!(await this.terminalController.has(id))) {
        this.launchingTerminalSessionIds.add(id)
        this.discoveryGeneration += 1
        try {
          // The same id is what brings the conversation back: Copilot reads
          // its own record for it rather than starting from nothing.
          await this.terminalController.create(
            id,
            stored.cwd,
            stored.title,
            stored.runtime?.allowAllPermissions ?? true,
            stored.runtime,
          )
        } finally {
          // Discovery that began while this was starting up saw no process
          // and is holding an answer that predates the pane. Moving the
          // generation on discards it, so it cannot land afterwards and mark
          // the session closed again.
          this.discoveryGeneration += 1
          this.launchingTerminalSessionIds.delete(id)
        }
      }
      this.externalSessionIds.add(id)
    }
    // An SDK session reconnects on its own when it is next spoken to, so
    // there is nothing to start here.
    // Closed before the flag is written, because clearing it is exactly what
    // reopens sending, and the queue has not been claimed yet.
    const hasQueue = Boolean(this.store.get(id)?.queuedPrompts?.length)
    if (hasQueue) {
      this.admissionClosed.add(id)
    }
    const resumed = await this.store.setSuspended(id, false)
    this.publish(resumed)
    // A prompt queued before the suspension is waiting with nothing to run it.
    // Draining now keeps the queue in the order it was written: left for
    // whatever happens to finish next, a message sent after the resume would
    // go first.
    //
    // The dispatch hold stays on until the queue has been claimed. Clearing
    // the suspended flag is what reopens sending, and without this a message
    // arriving in that gap starts a turn ahead of the prompt that was already
    // waiting, or beside it.
    if (resumed.queuedPrompts?.length) {
      const releaseDispatch = this.holdDispatch(id)
      try {
        const drain =
          this.store.backend(id) === 'terminal'
            ? this.drainTerminalQueue(id)
            : this.drainSdkQueue(id)
        await drain.catch((error: unknown) => {
          // The head prompt goes back on the queue when a drain fails. The
          // door reopens so the session stays usable, and what is still
          // waiting keeps its place because a send made while a queue exists
          // joins the end of it rather than going straight out.
          this.publishError(id, error)
        })
      } finally {
        this.admissionClosed.delete(id)
        releaseDispatch()
      }
    } else if (hasQueue) {
      this.admissionClosed.delete(id)
    }
    return resumed
  }

  async restartSession(id: string): Promise<SessionDetail> {
    return this.serializeLifecycle(id, () => this.restartSerialized(id))
  }

  private async restartSerialized(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (stored.suspended || this.suspendingSessions.has(id)) {
      // Restarting would start a runtime while the session still says it has
      // none, and for a terminal session leave a second owner behind it. A
      // suspension already under way counts: it is holding the session while
      // it reads background tasks and puts the runtime down.
      throw Object.assign(new Error('Resume the session before restarting it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    if (
      stored.status === 'running' ||
      stored.status === 'waiting' ||
      this.drainingSessions.has(id)
    ) {
      throw new Error('Session can only restart while idle')
    }
    if (this.externalSessionIds.has(id)) {
      if (!this.terminalController.restart) {
        throw new Error('Terminal session restart is not available')
      }
      if (!(await this.terminalController.restart(id, stored.cwd))) {
        throw new Error('External terminal is no longer available')
      }
    } else {
      const active = this.sessions.get(id)
      if (active) {
        await active.disconnect()
        this.sessions.delete(id)
      }
      await this.attachSdkSession(id)
    }
    const restarted = await this.store.update(id, (session) => {
      session.status = 'idle'
      session.activity = undefined
      session.pendingPermission = undefined
      session.updatedAt = new Date().toISOString()
    })
    this.publish(restarted)
    return restarted
  }

  async moveToTerminal(id: string): Promise<SessionDetail> {
    return this.serializeLifecycle(id, () => this.moveToTerminalSerialized(id))
  }

  private async moveToTerminalSerialized(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (this.store.backend(id) === 'terminal') {
      return stored
    }
    if (stored.suspended || this.suspendingSessions.has(id)) {
      throw new Error('Resume the session before moving it to tmux')
    }
    if (
      stored.status !== 'idle' ||
      this.drainingSessions.has(id)
    ) {
      throw new Error('Session can only move to tmux while idle')
    }
    // A detached shell keeps running without holding the foreground, so an
    // idle session can still own live work. Migrating disconnects the SDK
    // owner and drops the tracking, which would abandon it silently.
    const tasks = await this.syncBackgroundTasks(id).catch(() =>
      this.backgroundTaskTracker.get(id),
    )
    if (
      tasks.tasks.some(
        (task) => task.status === 'running' || task.status === 'queued',
      )
    ) {
      throw new Error(
        'Session can only move to tmux once its background tasks finish',
      )
    }
    if (!this.terminalController.create) {
      throw new Error('Terminal-backed sessions are not available')
    }
    const loading = this.loadingSessions.get(id)
    if (loading) {
      await loading
    }
    const active = this.sessions.get(id)
    if (active) {
      await active.disconnect()
      this.sessions.delete(id)
    }
    this.hydratedSessions.delete(id)
    this.backgroundTaskTracker.remove(id)
    this.backgroundTaskSyncs.delete(id)
    this.launchingTerminalSessionIds.add(id)
    this.discoveryGeneration += 1
    try {
      await this.terminalController.create(
        id,
        stored.cwd,
        stored.title,
        stored.runtime?.allowAllPermissions ?? true,
        stored.runtime,
      )
      const migrated = await this.store.setBackend(id, 'terminal')
      this.externalSessionIds.add(id)
      this.publish(migrated)
      return migrated
    } catch (error) {
      await this.activeSessionStopper(id)
      try {
        await this.ensureLoaded(id)
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          'Moving the session to tmux failed and the SDK session could not be restored',
        )
      }
      throw error
    } finally {
      this.launchingTerminalSessionIds.delete(id)
      this.discoveryGeneration += 1
    }
  }

  async clearConversation(id: string): Promise<SessionDetail> {
    return this.serializeLifecycle(id, () => this.clearSerialized(id))
  }

  private async clearSerialized(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (stored.suspended || this.suspendingSessions.has(id)) {
      // Clearing builds the replacement a session carries on in, which is a
      // live owner. A later resume would then build a second one beside it.
      throw Object.assign(new Error('Resume the session before clearing it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    if (
      stored.status === 'running' ||
      stored.status === 'waiting' ||
      this.drainingSessions.has(id)
    ) {
      throw new Error('Conversation can only be cleared while the session is idle')
    }
    const runtime: ConfigureRuntimeInput | undefined =
      stored.runtime?.model &&
      (stored.runtime.contextTier === 'default' ||
        stored.runtime.contextTier === 'long_context')
        ? {
            model: stored.runtime.model,
            ...(isRuntimeReasoningEffort(stored.runtime.reasoningEffort)
              ? { reasoningEffort: stored.runtime.reasoningEffort }
              : {}),
            contextTier: stored.runtime.contextTier,
            mode: agentMode(stored.runtime.mode) || 'interactive',
          }
        : undefined
    const replacementId = randomUUID()
    this.deletedSessionIds.add(id)
    forgetSessionEvents(id)
    this.discoveryGeneration += 1
    try {
      if (this.externalSessionIds.has(id)) {
        if (!this.terminalController.reset) {
          throw new Error('Terminal conversation reset is not available')
        }
        const reset = await this.terminalController.reset(
          id,
          replacementId,
          stored.cwd,
          runtime,
          async () => {
            try {
              await this.client.deleteSession(id)
            } catch (error) {
              if (!isMissingSessionError(error)) {
                throw error
              }
            }
            await removeCopilotSessionFiles(id)
          },
        )
        if (!reset) {
          throw new Error('External terminal is no longer available')
        }
        await this.terminalController.rename?.(replacementId, stored.title)
        this.externalSessionIds.delete(id)
        this.externalSessionIds.add(replacementId)
      } else {
        const active = this.sessions.get(id)
        if (active) {
          await active.disconnect()
          this.sessions.delete(id)
        }
        this.hydratedSessions.delete(id)
        try {
          await this.client.deleteSession(id)
        } catch (error) {
          if (!isMissingSessionError(error)) {
            throw error
          }
        }
        await removeCopilotSessionFiles(id)
        let fresh: CopilotSessionLike | undefined
        try {
          fresh = await this.client.createSession({
            sessionId: replacementId,
            workingDirectory: stored.cwd,
            streaming: true,
            model: runtime?.model,
            contextTier: runtime?.contextTier,
            onPermissionRequest: stored.runtime?.allowAllPermissions
              ? async () => ({ kind: 'approve-once' })
              : (request, invocation) =>
                  this.requestPermission(invocation.sessionId, request),
            onUserInputRequest: (request, invocation) =>
              this.requestUserInput(invocation.sessionId, request),
            onElicitationRequest: (context) => this.requestElicitation(context),
          })
        } catch (error) {
          this.publishError(replacementId, error)
        }
        if (fresh) {
          this.attachSession(fresh)
          this.sessions.set(replacementId, fresh)
          this.hydratedSessions.add(replacementId)
        }
        if (fresh && runtime) {
          await fresh.rpc.model
            .switchTo({
              modelId: runtime.model,
              reasoningEffort: runtime.reasoningEffort,
              contextTier: runtime.contextTier,
            })
            .catch((error: unknown) =>
              this.publishError(replacementId, error),
            )
          await fresh.rpc.mode
            .set({ mode: runtime.mode || 'interactive' })
            .catch((error: unknown) =>
              this.publishError(replacementId, error),
            )
        }
      }
      for (const [requestId, permission] of this.permissions) {
        if (permission.sessionId === id) {
          permission.resolve({ kind: 'user-not-available' })
          this.permissions.delete(requestId)
        }
      }
      for (const [requestId, input] of this.userInputs) {
        if (input.sessionId === id) {
          input.resolve({ answer: '', wasFreeform: true })
          this.userInputs.delete(requestId)
        }
      }
      this.eventLogFingerprints.delete(id)
      this.eventLogVersions.delete(id)
      this.workspaceVersions.delete(id)
      this.backgroundTaskSyncs.delete(id)
      this.backgroundTaskTracker.remove(id)
      this.liveTranscriptWatermarks.delete(id)
      this.liveActivityEvents.delete(id)
      this.activePrompts.delete(id)
      this.queueOperations.delete(id)
      this.terminalUserInputChecks.delete(id)
      this.terminalUpdateChecks.delete(id)
      this.answeredTerminalPermissions.delete(id)
      this.answeredTerminalInputs.delete(id)
      const cleared = await this.store.replaceWithClearedSession(
        id,
        replacementId,
      )
      // Anything still waiting to be done for the old session has to follow it
      // here. A recovery marker moves across with the conversation, and a
      // clearance still being retried would otherwise look for a session that
      // is gone and give up, leaving the accepted prompt recoverable again.
      this.replacedInto.set(id, replacementId)
      this.emit('event', {
        type: 'session.removed',
        sessionId: id,
        replacedBy: replacementId,
      })
      this.publish(cleared)
      return cleared
    } finally {
      if (this.transcriptInFlight) {
        await this.transcriptInFlight
      }
      this.deletedSessionIds.delete(id)
      this.discoveryGeneration += 1
    }
  }

  private async createTerminalSession(
    cwd: string,
    allowAllPermissions: boolean,
    runtime?: SessionRuntimeInfo,
  ): Promise<SessionDetail> {
    if (!this.terminalController.create) {
      throw new Error('Terminal-backed sessions are not available')
    }
    const sessionId = randomUUID()
    const title = path.basename(cwd) || 'New session'
    this.launchingTerminalSessionIds.add(sessionId)
    this.discoveryGeneration += 1
    try {
      if (runtime) {
        await this.terminalController.create(
          sessionId,
          cwd,
          title,
          allowAllPermissions,
          runtime,
        )
      } else {
        await this.terminalController.create(
          sessionId,
          cwd,
          title,
          allowAllPermissions,
        )
      }
      const now = new Date().toISOString()
      const session = await this.store.create(
        {
          id: sessionId,
          cwd,
          title,
          updatedAt: now,
          status: 'idle',
          isOpen: true,
          messages: [],
          runtime: {
            allowAllPermissions,
            ...runtime,
          },
        },
        { managedOpen: true, backend: 'terminal' },
      )
      this.externalSessionIds.add(sessionId)
      this.publish(session)
      return session
    } catch (error) {
      await this.activeSessionStopper(sessionId)
      throw error
    } finally {
      this.launchingTerminalSessionIds.delete(sessionId)
      this.discoveryGeneration += 1
    }
  }

  private async creationRuntime(
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
  ): Promise<CreationRuntime | undefined> {
    const modelId = model?.trim()
    if (!modelId) {
      if (reasoningEffort?.trim() || contextTier) {
        throw new RuntimeConfigurationError(
          'A model is required when setting effort or context',
          400,
        )
      }
      return undefined
    }
    const options = await this.providerRuntimeOptions('copilot')
    const selected = options.models.find((candidate) => candidate.id === modelId)
    if (!selected) {
      throw new RuntimeConfigurationError('Selected model is not available', 400)
    }
    const effort = reasoningEffort || selected.reasoningEfforts[0]
    const tier = contextTier || 'default'
    if (effort && !selected.reasoningEfforts.includes(effort)) {
      throw new RuntimeConfigurationError(
        'Selected reasoning effort is not supported by this model',
        400,
      )
    }
    if (!selected.contextTiers.includes(tier)) {
      throw new RuntimeConfigurationError(
        'Selected context tier is not supported by this model',
        400,
      )
    }
    const limits = this.modelPromptLimits.get(modelId)
    return {
      model: modelId,
      ...(effort ? { reasoningEffort: effort } : {}),
      contextTier: tier,
      contextTokenLimit:
        tier === 'long_context'
          ? limits?.long || limits?.maximum
          : limits?.default || limits?.maximum,
      contextEstimated: true,
    }
  }

  async sendMessage(
    sessionId: string,
    rawContent: string,
    enqueue = false,
    acknowledgedFailure?: string,
  ): Promise<SessionDetail> {
    const content = rawContent.trim()
    if (!content) {
      throw new Error('Message cannot be empty')
    }
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    if (this.admissionClosed.has(sessionId)) {
      // Resuming, and the prompt that was already queued has not been claimed
      // yet. Starting a turn now would put this one in front of it.
      throw Object.assign(new Error('The session is still resuming'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    // Let go of the recovered text only once this has actually been taken.
    // Clearing on the way in meant a retry that then failed left the reader
    // with an empty composer and the server with no copy either.
    // What was waiting to be handed back before this went out. A send that is
    // drained straight away can fail and record a new one, and acknowledging
    // afterwards would clear the failure this very call just created.
    const before = this.store.get(sessionId)?.failedPrompt?.failedAt
    // Claimed before it is delivered, not after. Two readers handed the same
    // recovered prompt both passed the check and both sends were accepted,
    // and with queueing both copies went in and drained once the first
    // acknowledgement cleared the marker.
    const claim = this.claimFailure(sessionId, content, before, acknowledgedFailure)
    let sent: SessionDetail
    try {
      // The failure this send is answering, and only when it is answering
      // one. Passing the current marker for every send let an unrelated
      // message take it with it on its way to the queue.
      // Held for the whole dispatch, not just the checks. Detection, pane
      // capture and delivery are all awaited, and a suspension finishing
      // during any of them would put the runtime down under a turn already on
      // its way.
      const releaseDispatch = this.holdDispatch(sessionId)
      try {
        sent = await this.sendAdmitted(
          sessionId,
          content,
          enqueue,
          claim ? before : undefined,
        )
      } finally {
        releaseDispatch()
      }
      this.deliveredSends.delete(sessionId)
    } catch (error) {
      // A send that failed after the terminal had already taken the text is
      // not a send that can be repeated. Letting go of the reservation invited
      // exactly the second copy it exists to prevent.
      //
      // Delivery is what decides, not the kind of error. A perfectly ordinary
      // persistence failure after the text has gone in leaves the same
      // ambiguity, so anything thrown once the send is known to have gone out
      // keeps the reservation.
      if (this.deliveredSends.has(sessionId)) {
        this.deliveredSends.delete(sessionId)
        claim?.release(true)
        // The failure this answered has been dealt with as far as anyone can
        // tell, so the marker must not go on offering it -- refused by the
        // record of an answered failure, it would block the queue for good.
        await this.acknowledgeFailedPrompt(
          sessionId,
          content,
          acknowledgedFailure,
        ).catch(() => {
          this.scheduleFailureAcknowledgement(
            sessionId,
            content,
            acknowledgedFailure,
          )
        })
      } else {
        claim?.release()
      }
      throw error
    }
    if (this.store.get(sessionId)?.failedPrompt?.failedAt !== before) {
      claim?.release()
      return sent
    }
    // The snapshot above still carries the failure that this send answers, so
    // whatever comes back from clearing it is what the caller is given. Left
    // as it was, the browser dropped its own copy while every reader went on
    // being told the prompt was still waiting to be handed back.
    // The send has already been delivered or queued by this point, so a write
    // that fails here is not a failed send. Reporting it as one had the
    // browser put the accepted text back as a draft, while the rollback
    // restored the marker that invites it to be sent a second time.
    const settled = await this.acknowledgeFailedPrompt(
      sessionId,
      content,
      acknowledgedFailure,
    ).catch((error: unknown) => {
      // The send has already been delivered or queued, so this is not a failed
      // send and must not be reported as one. It is not forgotten either: the
      // marker is still on disk holding the queue, so clearing it is left
      // outstanding and tried again rather than logged and abandoned.
      console.warn(
        `Could not clear the recovery marker for ${sessionId} after an accepted send:`,
        error,
      )
      this.scheduleFailureAcknowledgement(sessionId, content, acknowledgedFailure)
      return undefined
    })
    claim?.release(true)
    return settled ?? sent
  }

  /**
   * Reserves a failure so only one resend of it can be admitted.
   *
   * Two readers can be holding the same recovered prompt, and the marker is
   * only cleared once the send has gone out. Both passed that check and both
   * were accepted, so the prompt was delivered twice.
   */
  private claimFailure(
    sessionId: string,
    submitted: string,
    failedAt: string | undefined,
    acknowledged?: string,
  ): { release: (accepted?: boolean) => void } | undefined {
    // Asked first, and whatever the store now says. A window still showing a
    // recovered prompt reaches this after another has answered for it, finds
    // no marker left to reserve, and would send the prompt a second time.
    //
    // Both the reservation and the record of one already answered, because
    // clearing the marker changes memory before it reaches disk: a resend
    // arriving inside that window saw neither a marker nor an answer.
    if (acknowledged) {
      const token = `${sessionId}:${acknowledged}`
      if (this.claimedFailures.has(token) || this.answeredFailures.has(token)) {
        throw Object.assign(
          new Error('This message has already been sent from another window.'),
          { statusCode: 409 },
        )
      }
    }
    const stored = this.store.get(sessionId)?.failedPrompt
    if (acknowledged && stored?.failedAt !== acknowledged) {
      // Naming a failure that is not the one waiting. It has been answered, or
      // replaced by a newer one, and this text is not the answer to either.
      throw Object.assign(
        new Error(
          'That message has already been dealt with. Check the conversation before sending it again.',
        ),
        { statusCode: 409 },
      )
    }
    if (!failedAt || !stored) {
      return undefined
    }
    // The same rule the acknowledgement uses. Reserving on the words alone
    // let an independently written message that happens to read the same take
    // the reservation, and the real resend was then refused.
    const isResend =
      acknowledged === stored.failedAt ||
      (stored.failedAt === undefined &&
        stored.content.trim() === submitted.trim())
    if (!isResend) {
      // Not a resend of the failure at all, so there is nothing to reserve.
      return undefined
    }
    const key = `${sessionId}:${failedAt}`
    if (this.claimedFailures.has(key) || this.answeredFailures.has(key)) {
      throw Object.assign(
        new Error('This message has already been sent from another window.'),
        { statusCode: 409 },
      )
    }
    this.claimedFailures.add(key)
    let released = false
    return {
      release: (accepted = false) => {
        if (released) {
          return
        }
        released = true
        this.claimedFailures.delete(key)
        if (accepted) {
          // Remembered after the marker has gone. A second window still
          // holding the same recovered text reached the check after the first
          // had cleared it, found nothing to reserve, and sent the prompt
          // again.
          this.answeredFailures.add(key)
          if (this.answeredFailures.size > 200) {
            const oldest = this.answeredFailures.values().next().value
            if (oldest !== undefined) {
              this.answeredFailures.delete(oldest)
            }
          }
        }
      },
    }
  }

  /**
   * Keeps trying to clear a marker whose send has already been accepted.
   *
   * The marker holds the queue, and is offered again after a reload and to
   * every other reader, so leaving it behind invites the accepted prompt to be
   * sent a second time.
   */
  private scheduleFailureAcknowledgement(
    sessionId: string,
    submitted: string,
    acknowledged?: string,
  ): void {
    if (this.pendingAcknowledgements.has(sessionId)) {
      return
    }
    // Kept up until it works or the service stops. Giving up after a few
    // tries left the marker holding the queue with its own resend refused,
    // and nothing to start it again once storage came back.
    const attempt = async (wait: number): Promise<void> => {
      let current = sessionId
      while (!this.stopped) {
        if (!this.store.get(current)) {
          // Cleared while this was sleeping. The replacement inherits the
          // marker, so the retry follows it rather than giving up and leaving
          // the accepted prompt recoverable all over again.
          const successor = this.replacedInto.get(current)
          if (!successor) {
            return
          }
          current = successor
          continue
        }
        if (!this.store.get(current)?.failedPrompt) {
          return
        }
        try {
          await this.acknowledgeFailedPrompt(current, submitted, acknowledged)
          return
        } catch (error) {
          console.warn(
            `Still could not clear the recovery marker for ${current}:`,
            error,
          )
          await new Promise((resolve) => {
            // Unreferenced so a retry that is sleeping cannot hold the process
            // open after everything else has finished shutting down.
            const timer = setTimeout(resolve, wait)
            timer.unref?.()
            this.acknowledgementTimers.add(timer)
          })
          // Backed off, so an outage costs one attempt a minute rather than
          // two a second.
          wait = Math.min(wait * 2, 60_000)
        }
      }
    }
    const running = attempt(500).finally(() => {
      this.pendingAcknowledgements.delete(sessionId)
    })
    this.pendingAcknowledgements.set(sessionId, running)
  }

  private async sendAdmitted(
    sessionId: string,
    content: string,
    enqueue: boolean,
    // The failure this send answers, so a prompt that goes on the queue and
    // the marker it answers are written together rather than one after the
    // other with a crash possible in between.
    answers?: string,
  ): Promise<SessionDetail> {
    const terminalBacked = await this.terminalController.has(sessionId)
    // Detection is awaited, and suspending can finish while it is: the guard
    // above spoke for a session that was still running.
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    if (terminalBacked) {
      // A full-screen view takes the keyboard, so a prompt sent now is typed
      // into its search box: it filters a list, a stray Enter can pick from
      // it, and nothing says the prompt was never delivered. Refusing is
      // recoverable in a way that silently losing it is not.
      const pane = await this.terminalController.capture?.(sessionId)
      if (pane && isTerminalOverlay(pane)) {
        // Carries a status so the reason reaches the reader: an unclassified
        // failure is reported as a generic server error, which would leave
        // them no better off than the silent loss this replaces.
        throw Object.assign(
          new Error(
            'The terminal is showing a full-screen view. Close it there, then send this again.',
          ),
          { statusCode: 409 },
        )
      }
    }
    if (
      enqueue &&
      terminalBacked &&
      (await this.shouldEnqueueTerminalPrompt(sessionId))
    ) {
      return this.enqueueTerminalPrompt(sessionId, content, false, answers)
    }
    const nativeEnqueue = this.shouldUseNativeTerminalQueue(sessionId, enqueue)
    const dispatchedAt = new Date().toISOString()
    if (await this.terminalController.send(sessionId, content, nativeEnqueue)) {
      // The terminal has it. Anything that fails from here leaves a send that
      // went out, however ordinary the failure.
      this.deliveredSends.add(sessionId)
      if (nativeEnqueue) {
        const queued = await this.store.update(sessionId, (session) => {
          session.activity = 'Queued in terminal'
        })
        this.publish(queued)
        return queued
      }
      const delivered = await this.store.markTerminalPromptDispatched(
        sessionId,
        dispatchedAt,
        'Sent to terminal',
      )
      this.publish(delivered)
      if (await this.waitForTerminalEventLog(sessionId)) {
        return this.store.get(sessionId) || delivered
      }
      const untracked = await this.store.clearUntrackedTerminalDispatch(
        sessionId,
        dispatchedAt,
      )
      this.publish(untracked)
      return untracked
    }
    if (
      this.activePrompts.has(sessionId) ||
      this.drainingSessions.has(sessionId)
    ) {
      if (!enqueue) {
        throw new Error('This session is already responding')
      }
      return this.enqueuePrompt(sessionId, content, false, answers)
    }

    return this.startMessage(sessionId, content)
  }

  async removeQueuedPrompt(
    sessionId: string,
    promptId: string,
  ): Promise<RemovedQueuedPrompt> {
    return this.serializeQueue(sessionId, async () => {
      const { session, prompt } = await this.store.removeQueuedPrompt(
        sessionId,
        promptId,
      )
      if (!prompt) {
        throw new Error('Queued prompt not found')
      }
      this.publish(session)
      return { session, prompt }
    })
  }

  async updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    rawContent: string,
  ): Promise<RemovedQueuedPrompt> {
    const content = rawContent.trim()
    if (!content) {
      throw new Error('Message cannot be empty')
    }
    // In the queue's own lane, so a rewrite cannot land while a drain is
    // taking the same prompt off to send it.
    return this.serializeQueue(sessionId, async () => {
      const { session, prompt } = await this.store.updateQueuedPrompt(
        sessionId,
        promptId,
        content,
      )
      if (!prompt) {
        throw new Error('Queued prompt not found')
      }
      this.publish(session)
      return { session, prompt }
    })
  }

  async reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail> {
    return this.serializeQueue(sessionId, async () => {
      const session = await this.store.reorderQueuedPrompts(sessionId, order)
      this.publish(session)
      return session
    })
  }

  /**
   * Sends a message that is waiting in the queue, now, instead of in its turn.
   */
  // Taking it off and sending it are one operation here rather than three
  // requests from the browser. Between a read, a delete and a send, another
  // client can queue work or start a turn: the delete lands, and the send is
  // either appended behind what arrived or never happens at all, with the
  // message already gone.
  //
  // The sending itself is the session's own drain, not a dispatch written
  // again here. The drain is what knows a terminal-backed session from an SDK
  // one, closes admission for the turn it starts, runs a queued command as a
  // command, and puts the prompt back if it cannot go. Reaching past it meant
  // answering all of that a second time, in a copy that had already drifted.
  async sendQueuedPrompt(
    sessionId: string,
    promptId: string,
    rawContent?: string,
  ): Promise<SessionDetail> {
    const content = rawContent?.trim()
    if (rawContent !== undefined && !content) {
      throw new Error('Message cannot be empty')
    }
    await this.serializeQueue(sessionId, async () => {
      const session = this.store.get(sessionId)
      if (!session) {
        throw new Error('Session not found')
      }
      if (session.suspended || this.suspendingSessions.has(sessionId)) {
        throw Object.assign(
          new Error('Session is suspended, so nothing can be sent to it'),
          { statusCode: 409 },
        )
      }
      const queue = session.queuedPrompts || []
      const index = queue.findIndex((waiting) => waiting.id === promptId)
      if (index < 0) {
        throw Object.assign(
          new Error('That message is no longer waiting to be sent'),
          { statusCode: 409 },
        )
      }
      // Nothing can be sent ahead of work already waiting: the provider
      // appends, so "send now" would quietly mean "send last". Said plainly
      // while the message is still safely in the queue.
      if (queue.length > 1) {
        throw Object.assign(
          new Error(
            'Other messages are waiting, so this cannot be sent ahead of them. Save it to keep its place, or remove the others first.',
          ),
          { statusCode: 409 },
        )
      }
      // The rewriting goes in before it is sent. Sending by id alone sent
      // whatever was stored, so a message rewritten and then sent went out as
      // the text it used to be.
      if (content !== undefined) {
        const { prompt } = await this.store.updateQueuedPrompt(
          sessionId,
          promptId,
          content,
        )
        if (!prompt) {
          throw Object.assign(
            new Error('That message is no longer waiting to be sent'),
            { statusCode: 409 },
          )
        }
      }
    })
    // Outside the lane, because the drain takes it for itself.
    await (this.store.backend(sessionId) === 'terminal'
      ? this.drainTerminalQueue(sessionId)
      : this.drainSdkQueue(sessionId))
    const after = this.store.get(sessionId)
    if (!after) {
      throw new Error('Session not found')
    }
    return after
  }

  private async enqueuePrompt(
    sessionId: string,
    content: string,
    command = false,
    answers?: string,
  ): Promise<SessionDetail> {
    const prompt: QueuedPrompt = {
      id: randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      ...(command ? { command: true } : {}),
    }
    return this.serializeQueue(sessionId, async () => {
      // One write when this is the answer to a failure. Queued first and the
      // marker let go of afterwards, a crash in between leaves both on disk,
      // and after a restart the reader is handed the text again while the
      // copy they already sent is still waiting to go.
      const queued = answers
        ? await this.store.enqueueAnsweringPrompt(sessionId, prompt, answers)
        : await this.store.enqueuePrompt(sessionId, prompt)
      this.publish(queued)
      return queued
    })
  }

  private async enqueueTerminalPrompt(
    sessionId: string,
    content: string,
    command = false,
    answers?: string,
  ): Promise<SessionDetail> {
    const wasIdle = this.store.get(sessionId)?.status === 'idle'
    const queued = await this.enqueuePrompt(sessionId, content, command, answers)
    if (!wasIdle) {
      return queued
    }
    await this.drainTerminalQueue(sessionId)
    return this.store.get(sessionId) || queued
  }

  private async shouldEnqueueTerminalPrompt(
    sessionId: string,
  ): Promise<boolean> {
    const stored = this.store.get(sessionId)
    const status = stored?.status
    const eligible =
      status === 'idle' ||
      status === 'running' ||
      status === 'waiting' ||
      this.drainingSessions.has(sessionId)
    if (!eligible) {
      return false
    }
    // Anything already waiting goes first. Sending straight out past a queue
    // that a failed drain left behind would put this message in front of one
    // written before it.
    if (stored?.queuedPrompts?.length) {
      return true
    }
    return Boolean(await this.sessionEventVersion(sessionId))
  }

  private shouldUseNativeTerminalQueue(
    sessionId: string,
    enqueue: boolean,
  ): boolean {
    const status = this.store.get(sessionId)?.status
    return (
      enqueue &&
      (status === 'running' ||
        status === 'waiting' ||
        this.drainingSessions.has(sessionId))
    )
  }

  private async waitForTerminalEventLog(sessionId: string): Promise<boolean> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      if (await this.sessionEventVersion(sessionId)) {
        return true
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    return false
  }

  private async reconcileUntrackedTerminalDispatches(): Promise<void> {
    await Promise.all(
      this.store.list().map(async (session) => {
        const dispatchedAt = this.store.queueDispatchAt(session.id)
        if (
          !dispatchedAt ||
          (await this.sessionEventVersion(session.id))
        ) {
          return
        }
        const reconciled = await this.store.clearUntrackedTerminalDispatch(
          session.id,
          dispatchedAt,
        )
        this.publish(reconciled)
      }),
    )
  }

  private async startMessage(
    sessionId: string,
    content: string,
    fromQueue = false,
  ): Promise<SessionDetail> {
    // Anything already waiting goes first. A resume whose drain failed leaves
    // the prompt back on the queue, and a message written afterwards would
    // otherwise start straight away and run ahead of one written before it.
    if (!fromQueue && this.store.get(sessionId)?.queuedPrompts?.length) {
      const queued = await this.enqueuePrompt(sessionId, content)
      // A drain that failed put its prompt back and left nothing running to
      // take it off again. Without this the queue stays where it is, and every
      // message written afterwards joins it rather than starting anything.
      void this.drainSdkQueue(sessionId).catch(() => undefined)
      return queued
    }
    const sdkSession = await this.ensureLoaded(sessionId)
    const createdAt = new Date().toISOString()
    await this.store.addMessage(sessionId, {
      id: randomUUID(),
      role: 'user',
      content,
      createdAt,
    })
    const assistantMessageId = randomUUID()
    await this.store.addMessage(sessionId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      streaming: true,
    })
    const updated = await this.store.update(sessionId, (session) => {
      session.status = 'running'
      session.activity = 'Thinking'
      if (session.messages.filter((message) => message.role === 'user').length === 1) {
        session.title = content.length > 52 ? `${content.slice(0, 52)}…` : content
      }
    })
    this.activePrompts.set(sessionId, { assistantMessageId })
    this.publish(updated)

    // runPrompt writes to the store from its own catch and finally paths, so a
    // failure there would escape this fire-and-forget call as an unhandled
    // rejection and abort the process.
    void this.runPrompt(sdkSession, content, assistantMessageId).catch(
      (error: unknown) => {
        this.publishError(sessionId, error)
      },
    )
    return updated
  }

  async listCommands(sessionId: string): Promise<SlashCommand[]> {
    const commands = await this.commandCatalog(sessionId)
    return commands.map((command) => ({
      name: command.name,
      aliases: command.aliases,
      description: command.description,
      inputHint: command.input?.hint,
      inputRequired: command.input?.required,
      allowDuringAgentExecution: command.allowDuringAgentExecution,
    }))
  }

  private async commandCatalog(sessionId: string) {
    if (await this.terminalController.has(sessionId)) {
      const stored = this.store.get(sessionId)
      if (!stored) {
        throw new Error('Session not found')
      }
      const cacheKey = stored.cwd
      const cached = this.externalCommandCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        return cached.commands
      }
      const temporarySession = await this.client.createSession({
        workingDirectory: stored.cwd,
        streaming: false,
        infiniteSessions: { enabled: false },
        onPermissionRequest: () => ({ kind: 'user-not-available' }),
      })
      try {
        const commands = (
          await temporarySession.rpc.commands.list({
            includeBuiltins: true,
            includeSkills: true,
            includeClientCommands: true,
          })
        ).commands
        this.externalCommandCache.set(cacheKey, {
          expiresAt: Date.now() + 60_000,
          commands,
        })
        return commands
      } finally {
        await temporarySession.disconnect().catch(() => undefined)
        await this.client
          .deleteSession(temporarySession.sessionId)
          .catch(() => undefined)
      }
    }
    const session = await this.ensureLoaded(sessionId)
    return (
      await session.rpc.commands.list({
        includeBuiltins: true,
        includeSkills: true,
        includeClientCommands: true,
      })
    ).commands
  }

  private async sessionCommandCatalog(sessionId: string) {
    if (await this.terminalController.has(sessionId)) {
      return {
        commands: await this.commandCatalog(sessionId),
        session: undefined,
      }
    }
    const session = await this.ensureLoaded(sessionId)
    const result = await session.rpc.commands.list({
      includeBuiltins: true,
      includeSkills: true,
      includeClientCommands: true,
    })
    return { commands: result.commands, session }
  }

  /**
   * Marks a prompt handed back to the reader as dealt with.
   *
   * Submitting again is them saying they have it, whether it goes out as a
   * message or as the slash command it was. Left set, the next snapshot puts
   * the text they have just sent back into the composer.
   */
  private async acknowledgeFailedPrompt(
    sessionId: string,
    submitted: string,
    acknowledged?: string,
  ): Promise<SessionDetail | undefined> {
    const failed = this.store.get(sessionId)?.failedPrompt
    if (!failed) {
      return undefined
    }
    // Only when this is the text going back out. A reader whose composer
    // already held something newer never saw the failed prompt, so it lives
    // only here; clearing it because they sent that other thing would delete
    // the one copy without ever showing it to them.
    // The text going back out, or the reader saying outright that they have
    // it. Matching alone held the marker for good when they edited or
    // abandoned the recovered draft, and the marker stops the queue draining.
    // The reader saying outright which failure they are answering, or -- only
    // where there is nothing to say it with -- the text itself.
    //
    // A failure the browser never saw is one it cannot acknowledge, and it
    // deliberately does not attach a stamp to writing of its own. Taking the
    // words alone as proof cleared that unseen failure when an identical draft
    // was sent, and one of the two intended messages was never delivered.
    if (
      acknowledged !== failed.failedAt &&
      (failed.failedAt !== undefined ||
        failed.content.trim() !== submitted.trim())
    ) {
      return undefined
    }
    // The store changes memory before it writes, so swallowing a failed write
    // would report a marker as cleared that is still on disk, and start
    // draining a queue a restart would find blocked again.
    const cleared = await this.store.clearFailedPrompt(sessionId)
    this.publish(cleared)
    // The marker was holding the queue shut. Nothing else will come back to
    // it, so the prompts it was blocking are started here.
    if (cleared.queuedPrompts?.length) {
      void this.drainTerminalQueue(sessionId).catch(() => undefined)
    }
    return cleared
  }

  async executeCommand(
    sessionId: string,
    rawCommand: string,
    enqueue = false,
    acknowledgedFailure?: string,
  ): Promise<SessionDetail> {
    const command = rawCommand.trim()
    // Answered only once the command has actually been taken, like a message,
    // and reserved before it is taken for the same reason.
    const before = this.store.get(sessionId)?.failedPrompt?.failedAt
    const claim = this.claimFailure(sessionId, command, before, acknowledgedFailure)
    let ran: SessionDetail
    try {
      ran = await this.runCommand(
        sessionId,
        command,
        enqueue,
        claim ? before : undefined,
      )
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'uncertainDelivery' in error
      ) {
        // Already taken by the terminal, so this cannot simply be run again.
        claim?.release(true)
      } else {
        claim?.release()
      }
      throw error
    }
    if (this.store.get(sessionId)?.failedPrompt?.failedAt !== before) {
      claim?.release()
      return ran
    }
    // The command has already run or been queued, so a marker that will not
    // clear is not a failed command. Rejecting here had the browser hand back
    // a command that had already been carried out, and running some of them
    // twice changes the session.
    const settled = await this.acknowledgeFailedPrompt(
      sessionId,
      command,
      acknowledgedFailure,
    ).catch((error: unknown) => {
      console.warn(
        `Could not clear the recovery marker for ${sessionId} after an accepted command:`,
        error,
      )
      this.scheduleFailureAcknowledgement(sessionId, command, acknowledgedFailure)
      return undefined
    })
    claim?.release(true)
    return settled ?? ran
  }

  private async runCommand(
    sessionId: string,
    command: string,
    enqueue: boolean,
    // The failure this command answers, so a queued one and the marker it
    // answers are written together rather than one after the other.
    answers?: string,
    // The queue dispatching its own command. It holds the draining marker for
    // the whole of it, and that marker reads as busy, so a command taken off
    // the queue would be refused and put back for ever.
    fromQueue = false,
  ): Promise<SessionDetail> {

    if (!command.startsWith('/')) {
      throw new Error('Slash command must start with /')
    }
    const body = command.slice(1)
    const name = body.split(/\s+/, 1)[0]
    if (!name) {
      throw new Error('Slash command name is required')
    }
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    if (!fromQueue && this.admissionClosed.has(sessionId)) {
      // Resuming, and the prompt already queued has not been claimed yet.
      // A command allowed during execution would otherwise slip past it.
      //
      // The queue's own command is the very work this gate is held for, so it
      // goes past rather than into it: refused here it was put back, and the
      // reader was told the session was still resuming when it was the resume
      // that had asked for it.
      throw Object.assign(new Error('The session is still resuming'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    // Kept exactly as it was written. Splitting on whitespace and rejoining
    // with single spaces rewrote the argument, and `/cwd` carries a directory
    // that was validated before it got here: a folder whose name holds two
    // spaces became a different folder, or none at all.
    const argument = body.slice(name.length).replace(/^\s/, '')
    // A command reaches the same runtime as a message and takes just as long
    // to get there, so it holds the session for the whole of it.
    const releaseDispatch = this.holdDispatch(sessionId)
    try {
      return await this.dispatchCommand(
        sessionId,
        name,
        argument,
        enqueue,
        answers,
        fromQueue,
      )
    } finally {
      releaseDispatch()
    }
  }

  private async dispatchCommand(
    sessionId: string,
    name: string,
    argument: string,
    enqueue: boolean,
    // The failure this command answers, so a queued one and the marker it
    // answers are written together rather than one after the other.
    answers?: string,
    fromQueue = false,
  ): Promise<SessionDetail> {
    const catalog = await this.sessionCommandCatalog(sessionId)
    const commandInfo = catalog.commands.find(
      (candidate) =>
        candidate.name.toLowerCase() === name.toLowerCase() ||
        candidate.aliases?.some(
          (alias) => alias.toLowerCase() === name.toLowerCase(),
        ) ||
        commandShortcut(candidate.name) === name.toLowerCase(),
    )
    const canonicalName = commandInfo?.name || name
    const canonicalCommand = `/${canonicalName}${
      argument ? ` ${argument}` : ''
    }`
    const stored = this.store.get(sessionId)
    const busy =
      this.activePrompts.has(sessionId) ||
      // The queue's own command is the work the drain marker stands for, so it
      // goes past that gate rather than into it.
      (!fromQueue && this.drainingSessions.has(sessionId)) ||
      // A terminal the CLI owns is worked in directly, so a turn can be
      // running that this process never dispatched. Its recorded status is
      // the only account of that, and a command sent rather than queued would
      // otherwise be typed straight into it.
      ((this.externalSessionIds.has(sessionId) ||
        this.store.backend(sessionId) === 'terminal') &&
        (stored?.status === 'running' || stored?.status === 'waiting'))
    if (
      !enqueue &&
      busy &&
      !commandInfo?.allowDuringAgentExecution
    ) {
      throw new Error(`/${name} must be queued while the agent is running`)
    }
    if (
      !catalog.session &&
      enqueue &&
      (await this.shouldEnqueueTerminalPrompt(sessionId))
    ) {
      return this.enqueueTerminalPrompt(
        sessionId,
        canonicalCommand,
        true,
        answers,
      )
    }
    const nativeEnqueue =
      !catalog.session &&
      this.shouldUseNativeTerminalQueue(sessionId, enqueue)
    // Taken before the command is sent so the response can be told apart from
    // content the pane was already showing. While the agent is working its own
    // streaming output arrives in the same pane and cannot be told apart from
    // the command's response, so no attempt is made to report one.
    const before =
      nativeEnqueue || busy || this.store.get(sessionId)?.status === 'running'
        ? undefined
        : await this.terminalController.capture?.(sessionId)
    // Capturing the pane is awaited, and another reader's prompt can start a
    // turn while it is. The keystrokes themselves are serialized, but that
    // only orders them: it does not stop this one being typed into a turn
    // that began after the check above said there was none.
    if (!nativeEnqueue && !enqueue && !commandInfo?.allowDuringAgentExecution) {
      const now = this.store.get(sessionId)
      if (
        this.activePrompts.has(sessionId) ||
        // As above: the queue's own command is the work this marker stands
        // for, so it is not something for that command to wait behind.
        (!fromQueue && this.drainingSessions.has(sessionId)) ||
        // Another prompt already inside the controller has not come back to
        // record itself yet, so the stored status still says idle. The
        // controller knows, and asking it is the only reading that is true at
        // the moment the keystrokes would go in.
        this.terminalController.sending?.(sessionId) === true ||
        now?.status === 'running' ||
        now?.status === 'waiting'
      ) {
        throw new Error(`/${name} must be queued while the agent is running`)
      }
    }
    if (
      await this.terminalController.send(
        sessionId,
        canonicalCommand,
        nativeEnqueue,
      )
    ) {
      const feedback = await this.terminalCommandFeedback(
        sessionId,
        canonicalCommand,
        before,
      )
      const notice = await this.store.addMessage(sessionId, {
        id: randomUUID(),
        role: 'notice',
        content: feedback.notice,
        createdAt: new Date().toISOString(),
      })
      this.publish(notice)
      if (!feedback.startedTurn) {
        return notice
      }
      // A command sent directly can start a turn just as a queued one can, and
      // the session has to read as busy for it too, or the next prompt is sent
      // into the turn before polling notices it.
      const started = await this.store.markTerminalPromptDispatched(
        sessionId,
        new Date().toISOString(),
      )
      this.publish(started)
      return started
    }
    const session = catalog.session
    if (!session) {
      throw new Error('External terminal is no longer available')
    }
    if (enqueue) {
      const result = await session.rpc.commands.enqueue({
        command: canonicalCommand,
      })
      if (!result.queued) {
        throw new Error('This session does not support command queueing')
      }
    } else {
      const result = await session.rpc.commands.invoke({
        name: canonicalName,
        input: argument,
      })
      if (result.kind === 'agent-prompt') {
        const notice = await this.store.addMessage(sessionId, {
          id: randomUUID(),
          role: 'notice',
          content: result.notice || canonicalCommand,
          createdAt: new Date().toISOString(),
        })
        this.publish(notice)
        // A command the queue dispatched holds the drain marker, and the
        // ordinary send path reads that as the session already responding. The
        // prompt this command generated is the same piece of work, so it goes
        // in the way the queue's own messages do -- otherwise the command ran,
        // said so, and then produced nothing.
        return fromQueue
          ? this.startMessage(sessionId, result.prompt, true)
          : this.sendMessage(sessionId, result.prompt, busy)
      }
      const content =
        result.kind === 'text'
          ? stripAnsi(result.text)
          : result.kind === 'completed'
            ? result.message || canonicalCommand
            : `${result.title}\n\n${result.options
                .map(
                  (option) =>
                    `- /${canonicalName} ${option.name} — ${option.description}`,
                )
                .join('\n')}`
      const notice = await this.store.addMessage(sessionId, {
        id: randomUUID(),
        role: 'notice',
        content,
        createdAt: new Date().toISOString(),
      })
      this.publish(notice)
      return notice
    }
    const notice = await this.store.addMessage(sessionId, {
      id: randomUUID(),
      role: 'notice',
      content: enqueue ? `Queued ${canonicalCommand}` : canonicalCommand,
      createdAt: new Date().toISOString(),
    })
    this.publish(notice)
    return notice
  }

  /**
   * The CLI writes a slash command's response into the terminal rather than
   * the event log, so without this the conversation only shows the command
   * that was sent. Polls briefly for the response and falls back to the
   * command itself when there is nothing to report.
   */
  /**
   * The notice a command produced, and what it left the terminal doing. Both
   * matter apart from the text: a command that began a turn, and one that
   * opened a full-screen view, each keep the keyboard, so nothing further may
   * be sent until they release it.
   */
  private async terminalCommandFeedback(
    sessionId: string,
    command: string,
    before: string | undefined,
  ): Promise<{ notice: string; startedTurn: boolean; overlayOpen: boolean }> {
    if (before === undefined || !this.terminalController.capture) {
      return { notice: command, startedTurn: false, overlayOpen: false }
    }
    let previous: string | undefined
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      const after = await this.terminalController.capture(sessionId)
      if (!after) {
        continue
      }
      if (isTerminalOverlay(after)) {
        // The view takes the keyboard: anything sent now lands in its search
        // box instead of the composer, so the terminal counts as held.
        return {
          notice: `${command}\n\nOpened an interactive view in the terminal. Continue there; it cannot be shown here.`,
          startedTurn: false,
          overlayOpen: true,
        }
      }
      // The command started a turn, so anything appearing now is the agent
      // writing rather than the command answering.
      if (isTerminalAgentWorking(after)) {
        return { notice: command, startedTurn: true, overlayOpen: false }
      }
      const output = terminalCommandOutput(before, after, command)
      // A response can be captured mid-paint, so report it only once it stops
      // growing; otherwise a multi-line response is cut short.
      if (output && output === previous) {
        return {
          notice: `${command}\n\n${output}`,
          startedTurn: false,
          overlayOpen: false,
        }
      }
      previous = output
    }
    return {
      notice: previous ? `${command}\n\n${previous}` : command,
      startedTurn: false,
      overlayOpen: false,
    }
  }

  async cancel(sessionId: string): Promise<void> {
    if (await this.terminalController.cancel(sessionId)) {
      return
    }
    const session = this.sessions.get(sessionId)
    if (!session || !this.activePrompts.has(sessionId)) {
      return
    }
    await session.abort()
  }

  async listBackgroundTasks(
    sessionId: string,
  ): Promise<BackgroundTaskSnapshot> {
    const stored = this.store.get(sessionId)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (this.externalSessionIds.has(sessionId)) {
      // Projected from an event log rather than owned over RPC, so there is no
      // channel to cancel through and loading one would attach an SDK owner to
      // a session the live CLI already owns.
      const projected = backgroundTasksFromEvents(
        await this.sessionEventReader(sessionId),
        { assumeBackground: true },
      )
      return this.replaceBackgroundTasks(sessionId, projected, true)
    }
    if (stored.suspended) {
      // Attaching to find out would start the runtime that suspending just
      // put down, and the panel asks for every session as the app loads.
      return this.backgroundTaskTracker.get(sessionId)
    }
    if (!this.sessions.has(sessionId) && !this.loadingSessions.has(sessionId)) {
      // Nothing is attached, and an SDK session's tasks belong to the runtime
      // that is not there: no process, nothing it started still running.
      // Attaching to ask would be starting the very process the caller is
      // about to put down, and while a suspension is under way `ensureLoaded`
      // refuses outright, so a session that had simply never been opened could
      // not be suspended at all.
      //
      // Answered rather than left unknown. An unread list refuses a suspension
      // on the grounds that something may be running, and here nothing can be.
      return this.replaceBackgroundTasks(sessionId, [], true)
    }
    return this.syncBackgroundTasks(sessionId, await this.ensureLoaded(sessionId))
  }

  async cancelBackgroundTask(
    sessionId: string,
    taskId: string,
  ): Promise<BackgroundTaskSnapshot> {
    const current = await this.listBackgroundTasks(sessionId)
    const task = current.tasks.find((candidate) => candidate.id === taskId)
    if (!task) {
      throw new Error('Background task not found')
    }
    if (!task.canCancel) {
      throw new Error('Background task cannot be cancelled')
    }
    // Checked again before loading: ensureLoaded would attach an SDK owner to a
    // session the live CLI owns.
    if (this.externalSessionIds.has(sessionId)) {
      throw new Error('Background task cannot be cancelled')
    }
    const session = await this.ensureLoaded(sessionId)
    const cancel = session.rpc.tasks?.cancel
    if (!cancel) {
      throw new Error('Background task cancellation is not supported')
    }
    const result = await cancel({ id: taskId })
    if (!result.cancelled) {
      throw new Error('Background task could not be cancelled')
    }
    return this.listBackgroundTasks(sessionId)
  }

  async deleteSession(sessionId: string): Promise<void> {
    // In the same queue as the rest. Deleting takes the runtime and the state
    // with it, so a resume running beside it could build a new owner for a
    // session whose files are already going.
    return this.serializeLifecycle(sessionId, () =>
      this.deleteSerialized(sessionId),
    )
  }

  private async deleteSerialized(sessionId: string): Promise<void> {
    const stored = this.store.get(sessionId)
    if (!stored) {
      throw new Error('Session not found')
    }
    const terminalBacked = this.store.backend(sessionId) === 'terminal'

    this.deletingSessions.add(sessionId)
    this.deletedSessionIds.add(sessionId)
    forgetSessionEvents(sessionId)
    let completed = false
    try {
      await this.activeSessionStopper(sessionId)
      const active = this.sessions.get(sessionId)
      if (active) {
        if (this.activePrompts.has(sessionId)) {
          this.activePrompts.delete(sessionId)
          await active.abort()
        }
        await active.disconnect()
        this.sessions.delete(sessionId)
      }
      for (const [requestId, permission] of this.permissions) {
        if (permission.sessionId === sessionId) {
          permission.resolve({ kind: 'user-not-available' })
          this.permissions.delete(requestId)
        }
      }
      for (const [requestId, input] of this.userInputs) {
        if (input.sessionId === sessionId) {
          input.resolve({ answer: '', wasFreeform: true })
          this.userInputs.delete(requestId)
        }
      }
      for (const [requestId, elicitation] of this.elicitations) {
        if (elicitation.sessionId === sessionId) {
          elicitation.resolve({ action: 'cancel' })
          this.elicitations.delete(requestId)
        }
      }

      if (terminalBacked) {
        await removeCopilotSessionFiles(sessionId)
      } else {
        try {
          await this.client.deleteSession(sessionId)
        } catch (error) {
          if (!isMissingSessionError(error)) {
            throw error
          }
        }
      }
      await this.store.remove(sessionId)
      this.hydratedSessions.delete(sessionId)
      this.loadingSessions.delete(sessionId)
      this.hydratingSessions.delete(sessionId)
      this.activePrompts.delete(sessionId)
      this.drainingSessions.delete(sessionId)
      this.queueOperations.delete(sessionId)
      this.workspaceVersions.delete(sessionId)
      this.backgroundTaskSyncs.delete(sessionId)
      this.backgroundTaskTracker.remove(sessionId)
      this.liveActivityEvents.delete(sessionId)
      this.terminalUserInputChecks.delete(sessionId)
      this.terminalUpdateChecks.delete(sessionId)
      this.answeredTerminalPermissions.delete(sessionId)
      this.answeredTerminalInputs.delete(sessionId)
      completed = true
      this.emit('event', { type: 'session.removed', sessionId })
    } finally {
      this.deletingSessions.delete(sessionId)
      if (!completed) {
        this.deletedSessionIds.delete(sessionId)
      }
    }
  }

  async replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail> {
    const stored = this.store.get(sessionId)
    const request = stored?.pendingPermission
    if (!stored || !request || request.requestId !== requestId) {
      throw new Error('Permission request is no longer pending')
    }
    if (!request.options.some((option) => option.optionId === optionId)) {
      throw new Error('The selected permission option is not available')
    }
    const sdkPending = this.permissions.get(requestId)
    let terminalReplied = false
    if (sdkPending) {
      if (sdkPending.sessionId !== sessionId) {
        throw new Error('Permission request belongs to another session')
      }
      const result: PermissionRequestResult =
        optionId === 'allow-once'
          ? { kind: 'approve-once' }
          : { kind: 'reject', feedback: 'Rejected from Agentic Remote' }
      this.permissions.delete(requestId)
      sdkPending.resolve(result)
    } else {
      if (
        !requestId.startsWith('terminal-permission:') ||
        !this.terminalController.replyPermission
      ) {
        throw new Error('Terminal permission reply is not available')
      }
      const repliedAt = new Date().toISOString()
      this.answeredTerminalPermissions.set(sessionId, {
        requestId,
        expiresAt: Date.now() + 5_000,
        repliedAt,
      })
      let replied = false
      try {
        replied = await this.terminalController.replyPermission(
          sessionId,
          request,
          optionId,
        )
      } catch (error) {
        this.answeredTerminalPermissions.delete(sessionId)
        throw error
      }
      if (!replied) {
        this.answeredTerminalPermissions.delete(sessionId)
        throw new Error('External terminal is no longer available')
      }
      terminalReplied = true
      this.liveTranscriptWatermarks.set(sessionId, repliedAt)
    }

    const continuation = terminalReplied
      ? await this.terminalContinuationState(
          sessionId,
          this.answeredTerminalPermissions.get(sessionId)?.repliedAt,
        )
      : { status: 'running' as const, activity: 'Continuing' }
    const updated = await this.store.update(sessionId, (session) => {
      session.pendingPermission = undefined
      session.status = continuation.status
      session.activity = continuation.activity
    })
    this.publish(updated)
    return updated
  }

  async replyUserInput(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    const stored = this.store.get(sessionId)
    const request = stored?.pendingUserInput
    if (!stored || !request || request.requestId !== requestId) {
      throw new Error('User input request is no longer pending')
    }
    const action = input.action || 'accept'
    const sdkElicitation = this.elicitations.get(requestId)
    if (sdkElicitation) {
      if (sdkElicitation.sessionId !== sessionId) {
        throw new Error('Elicitation request belongs to another session')
      }
      if (action === 'accept') {
        if (!request.form || !input.values) {
          throw new Error('Structured elicitation values are required')
        }
        validateUserInputForm(request.form, input.values)
        sdkElicitation.resolve({ action, content: input.values })
      } else {
        sdkElicitation.resolve({ action })
      }
      this.elicitations.delete(requestId)
      const updated = await this.store.update(sessionId, (session) => {
        session.pendingUserInput = undefined
        session.status = 'running'
        session.activity = 'Continuing'
      })
      this.publish(updated)
      return updated
    }
    if (action !== 'accept') {
      if (requestId.startsWith('persisted-user-input:')) {
        this.answeredPersistedInputs.set(sessionId, {
          requestId,
          expiresAt: Date.now() + 60_000,
        })
        const cleared = await this.store.update(sessionId, (session) => {
          session.pendingUserInput = undefined
          session.status = 'idle'
          session.activity = undefined
        })
        this.publish(cleared)
        return cleared
      }
      throw new Error('This user input request cannot be dismissed')
    }
    const answer = input.answer.trim()
    if (!answer) {
      throw new Error('Answer cannot be empty')
    }
    if (request.form) {
      if (!input.values) {
        throw new Error('Structured elicitation values are required')
      }
      validateUserInputForm(request.form, input.values)
    } else {
      if (input.wasFreeform && !request.allowFreeform) {
        throw new Error('This question does not allow a freeform response')
      }
      if (!input.wasFreeform && !request.choices.includes(answer)) {
        throw new Error('The selected answer is not available')
      }
    }
    const sdkPending = this.userInputs.get(requestId)
    let terminalReplied = false
    if (sdkPending) {
      if (sdkPending.sessionId !== sessionId) {
        throw new Error('User input request belongs to another session')
      }
      this.userInputs.delete(requestId)
      sdkPending.resolve({ answer, wasFreeform: input.wasFreeform })
    } else if (requestId.startsWith('persisted-user-input:')) {
      this.answeredPersistedInputs.set(sessionId, {
        requestId,
        expiresAt: Date.now() + 60_000,
      })
      // The agent is still showing this prompt in its terminal. Typing the
      // answer while a structured form is open fills that form's focused
      // field and submits every other field at its default, which silently
      // turns confirmations into `false`. Close the prompt first, then answer.
      const toolCallId = requestId.slice('persisted-user-input:'.length)
      const terminalBacked = await this.terminalController.has(sessionId)
      if (
        terminalBacked &&
        (await this.isToolCallComplete(sessionId, toolCallId))
      ) {
        // The agent already stopped waiting on this request, so it was
        // answered or cancelled in the terminal. Whatever is on screen now
        // belongs to something else, and filling it would answer the wrong
        // prompt; the reply is dropped and the stale request cleared instead.
        this.answeredPersistedInputs.delete(sessionId)
        const settled = await this.store.update(sessionId, (session) => {
          session.pendingUserInput = undefined
        })
        this.publish(settled)
        return settled
      }
      if (terminalBacked && request.form) {
        // Filling the agent's own form answers the tool it is waiting on, so
        // the values arrive as the result it asked for.
        const steps = terminalFormSteps(request.form, input.values || {})
        const identity = {
          question: request.question,
          fields: request.form.fields.map((field) => field.title),
        }
        const filled =
          steps &&
          (await this.terminalController
            .fillUserInputForm?.(sessionId, steps, identity)
            .catch(() => false))
        // Filling reports failure for a capture that timed out as well as for
        // keys never sent, and the last Enter may already have submitted the
        // form. Answering again would then submit a second time, so the agent
        // is asked whether the request it was waiting on has finished.
        if (
          !filled &&
          (await this.isToolCallComplete(sessionId, toolCallId))
        ) {
          const submitted = await this.store.update(sessionId, (session) => {
            session.pendingUserInput = undefined
            session.status = 'running'
            session.activity = 'Continuing'
          })
          this.publish(submitted)
          return submitted
        }
        if (filled) {
          const answeredSession = await this.store.update(
            sessionId,
            (session) => {
              session.pendingUserInput = undefined
              session.status = 'running'
              session.activity = 'Continuing'
            },
          )
          this.publish(answeredSession)
          return answeredSession
        }
      }
      if (terminalBacked) {
        const dismissed =
          (await this.terminalController
            .dismissUserInput?.(
              sessionId,
              request.form && {
                question: request.question,
                fields: request.form.fields.map((field) => field.title),
              },
            )
            .catch(() => false)) ?? false
        const closed =
          dismissed && (await this.waitForToolCompletion(sessionId, toolCallId))
        // The answer is about to be typed at the prompt. A form that is still
        // open captures those keystrokes into its fields and submits the rest
        // at their defaults, which is the corruption this path exists to
        // avoid, so nothing is sent unless the form is known to have closed.
        if (request.form && !closed) {
          this.answeredPersistedInputs.delete(sessionId)
          throw new Error(
            'The agent is still showing its prompt, so the answer was not sent. Try again.',
          )
        }
      }
      const cleared = await this.store.update(sessionId, (session) => {
        session.pendingUserInput = undefined
        session.status = 'idle'
        session.activity = undefined
      })
      this.publish(cleared)
      return this.sendMessage(
        sessionId,
        request.form
          ? persistedFormAnswer(request, input.values || {})
          : answer,
        false,
      )
    } else {
      if (!this.terminalController.replyUserInput) {
        throw new Error('Terminal user input is not available')
      }
      const repliedAt = new Date().toISOString()
      this.answeredTerminalInputs.set(sessionId, {
        requestId,
        expiresAt: Date.now() + 5_000,
        repliedAt,
      })
      let replied = false
      try {
        replied = await this.terminalController.replyUserInput(
          sessionId,
          request,
          answer,
          input.wasFreeform,
        )
      } catch (error) {
        this.answeredTerminalInputs.delete(sessionId)
        throw error
      }
      if (!replied) {
        this.answeredTerminalInputs.delete(sessionId)
        throw new Error('External terminal is no longer available')
      }
      terminalReplied = true
      this.liveTranscriptWatermarks.set(sessionId, repliedAt)
    }
    const continuation = terminalReplied
      ? await this.terminalContinuationState(
          sessionId,
          this.answeredTerminalInputs.get(sessionId)?.repliedAt,
        )
      : { status: 'running' as const, activity: 'Continuing' }
    const updated = await this.store.update(sessionId, (session) => {
      session.pendingUserInput = undefined
      session.status = continuation.status
      session.activity = continuation.activity
    })
    this.publish(updated)
    return updated
  }

  private async ensureLoaded(sessionId: string): Promise<CopilotSessionLike> {
    const active = this.sessions.get(sessionId)
    if (active) {
      return active
    }
    const alreadyLoading = this.loadingSessions.get(sessionId)
    if (alreadyLoading) {
      // Already on its way. Joining it rather than refusing keeps a read that
      // started before the suspension from failing for a reason that was not
      // true when it began.
      return alreadyLoading
    }
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      // Attaching would start the runtime this session was suspended to be
      // rid of, so it is asked for rather than assumed. A suspension still
      // under way counts: the pane is killed before the flag is written, and
      // anything reaching here in that gap would attach an SDK owner that
      // outlives the suspension.
      throw new Error('Resume the session before using it')
    }
    const inFlight = this.loadingSessions.get(sessionId)
    if (inFlight) {
      return inFlight
    }
    const loading = this.attachSdkSession(sessionId)
    this.loadingSessions.set(sessionId, loading)
    try {
      return await loading
    } finally {
      this.loadingSessions.delete(sessionId)
    }
  }

  private async attachSdkSession(sessionId: string): Promise<CopilotSessionLike> {
    const stored = this.store.get(sessionId)
    if (!stored) {
      throw new Error('Session not found')
    }
    let sdkSession: CopilotSessionLike
    try {
      sdkSession = await this.client.resumeSession(sessionId, {
        workingDirectory: stored.cwd,
        streaming: true,
        onPermissionRequest: stored.runtime?.allowAllPermissions
          ? async () => ({ kind: 'approve-once' })
          : (request, invocation) =>
              this.requestPermission(invocation.sessionId, request),
        onUserInputRequest: (request, invocation) =>
          this.requestUserInput(invocation.sessionId, request),
        onElicitationRequest: (context) => this.requestElicitation(context),
        suppressResumeEvent: true,
      })
    } catch (error) {
      if (stored.messages.length > 0 || !isMissingSessionError(error)) {
        throw error
      }
      sdkSession = await this.client.createSession({
        sessionId,
        workingDirectory: stored.cwd,
        streaming: true,
        onPermissionRequest: stored.runtime?.allowAllPermissions
          ? async () => ({ kind: 'approve-once' })
          : (request, invocation) =>
              this.requestPermission(invocation.sessionId, request),
        onUserInputRequest: (request, invocation) =>
          this.requestUserInput(invocation.sessionId, request),
        onElicitationRequest: (context) => this.requestElicitation(context),
      })
    }
    this.attachSession(sdkSession)
    this.sessions.set(sessionId, sdkSession)
    return sdkSession
  }

  private async recoverTerminalSessions(): Promise<number> {
    if (!this.terminalController.create) {
      return 0
    }
    let recovered = 0
    for (const session of this.store.terminalRecoverySessions()) {
      let launching = false
      try {
        if (await this.terminalController.has(session.id)) {
          this.externalSessionIds.add(session.id)
          continue
        }
        this.launchingTerminalSessionIds.add(session.id)
        this.discoveryGeneration += 1
        launching = true
        await this.terminalController.create(
          session.id,
          session.cwd,
          session.title,
          session.runtime?.allowAllPermissions ?? true,
          session.runtime,
        )
        this.externalSessionIds.add(session.id)
        recovered += 1
        const restored = await this.store.update(session.id, (stored) => {
          stored.status = 'idle'
          stored.activity = undefined
        })
        this.publish(restored)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (this.store.get(session.id)) {
          try {
            await this.store.setOpen(session.id, false, true)
            const failed = await this.store.update(session.id, (stored) => {
              stored.status = 'error'
              stored.activity = 'Boot recovery failed'
            })
            this.publish(failed)
          } catch (storeError) {
            console.warn(
              `Unable to persist terminal recovery failure for ${session.id}:`,
              storeError,
            )
          }
        }
        this.publishError(
          session.id,
          new Error(`Unable to recover terminal session: ${message}`),
        )
      } finally {
        if (launching) {
          this.launchingTerminalSessionIds.delete(session.id)
          this.discoveryGeneration += 1
        }
      }
    }
    return recovered
  }

  private async hydrateSession(sessionId: string): Promise<SessionDetail> {
    const session = await this.ensureLoaded(sessionId)
    const hydrated = await this.store.replaceMessages(
      sessionId,
      messagesFromHistory(await session.getEvents()),
    )
    this.hydratedSessions.add(sessionId)
    this.publish(hydrated)
    return hydrated
  }

  private async discoverSessions(): Promise<void> {
    let sessions: SessionMetadata[]
    let activeSessions: DiscoveredSession[]
    while (true) {
      const generation = this.discoveryGeneration
      const discovery = await Promise.all([
        this.client.listSessions(),
        this.activeSessionFinder(),
      ])
      sessions = discovery[0]
      activeSessions = discovery[1]
      if (generation === this.discoveryGeneration) {
        break
      }
    }
    const storedBeforeDiscovery = this.store.list()
    const storedIds = new Set(storedBeforeDiscovery.map((session) => session.id))
    const previouslyExternal = this.externalSessionIds
    this.externalSessionIds = new Set(
      [
        ...activeSessions
          .filter((session) => !this.deletedSessionIds.has(session.id))
          .map((session) => session.id),
        ...this.launchingTerminalSessionIds,
      ],
    )
    await this.clearUpdateNoticeForExited(previouslyExternal)
    const indexedSessions = sessions.flatMap((session) => {
      if (this.deletedSessionIds.has(session.sessionId)) {
        return []
      }
      const cwd = session.context?.workingDirectory?.trim()
      if (!cwd) {
        return []
      }
      return [
        {
          id: session.sessionId,
          cwd,
          title: normalizedTitle(
            session.summary,
            path.basename(cwd) || 'Untitled session',
          ),
          updatedAt: session.modifiedTime.toISOString(),
        },
      ]
    })
    const indexedIds = new Set(indexedSessions.map((session) => session.id))
    await this.store.syncDiscovered(
      [
        ...indexedSessions,
        ...activeSessions
          .filter(
            (session) =>
              !this.deletedSessionIds.has(session.id) &&
              !indexedIds.has(session.id) && !storedIds.has(session.id),
          )
          .map((session) => ({
            ...session,
            title: path.basename(session.cwd) || session.title,
          })),
      ],
    )
    await this.store.syncBackends(
      activeSessions.map((session) => session.id),
      indexedSessions.map((session) => session.id),
    )
    const renameTerminal = this.terminalController.rename?.bind(
      this.terminalController,
    )
    if (renameTerminal) {
      await Promise.all(
        activeSessions.map(async (session) => {
          const currentTitle = this.store.get(session.id)?.title
          if (currentTitle) {
            await renameTerminal(session.id, currentTitle)
              .catch((error: unknown) => this.publishError(session.id, error))
          }
        }),
      )
    }
    await this.store.syncOpen([
      ...this.externalSessionIds,
      ...this.sessions.keys(),
    ])
  }

  refreshDiscovery(): Promise<void> {
    if (this.discoveryInFlight) {
      return this.discoveryInFlight
    }
    const refresh = this.discoverSessions()
      .catch((error: unknown) => {
        this.publishError('', error)
      })
      .finally(() => {
        this.discoveryInFlight = undefined
      })
    this.discoveryInFlight = refresh
    return refresh
  }

  refreshTranscripts(): Promise<void> {
    if (this.transcriptInFlight) {
      return this.transcriptInFlight
    }
    const refresh = this.syncTranscripts()
      .catch((error: unknown) => {
        this.publishError('', error)
      })
      .finally(() => {
        this.transcriptInFlight = undefined
      })
    this.transcriptInFlight = refresh
    return refresh
  }

  private async syncTranscripts(): Promise<void> {
    const sessionIds = new Set([
      ...this.externalSessionIds,
      ...this.sessions.keys(),
    ])
    await Promise.all(
      [...sessionIds].map(async (sessionId) => {
        if (
          this.activePrompts.has(sessionId) ||
          this.deletedSessionIds.has(sessionId) ||
          !this.store.get(sessionId)
        ) {
          return
        }
        if (this.externalSessionIds.has(sessionId)) {
          await this.syncExternalWorkspace(sessionId)
          await this.syncTerminalUserInput(sessionId)
          await this.syncTerminalUpdateNotice(sessionId)
        }
        const version = await this.sessionEventVersion(sessionId)
        if (!version || this.eventLogVersions.get(sessionId) === version) {
          await this.recoverHiddenUserInput(sessionId)
          return
        }
        const events = await this.sessionEventReader(sessionId)
        const terminalTasks = this.externalSessionIds.has(sessionId)
          ? backgroundTasksFromEvents(events, { assumeBackground: true })
          : []
        if (this.externalSessionIds.has(sessionId)) {
          this.replaceBackgroundTasks(
            sessionId,
            terminalTasks,
            true,
          )
        }
        const fingerprint = `${events.length}:${events.at(-1)?.id || ''}`
        if (this.eventLogFingerprints.get(sessionId) === fingerprint) {
          await this.recoverHiddenUserInput(sessionId, events)
          return
        }
        const stored = this.store.get(sessionId)
        const storedUserInput =
          !this.externalSessionIds.has(sessionId) ||
          stored?.pendingUserInput?.requestId.startsWith('terminal:')
            ? stored?.pendingUserInput
            : undefined
        const syncedUserInput =
          storedUserInput || pendingUserInputFromEvents(events) || null
        const messages = [
          ...messagesFromHistory(events),
          ...(stored?.messages.filter((message) => message.role === 'notice') ||
            []),
        ].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        const watermark = this.liveTranscriptWatermarks.get(sessionId)
        const lastEventTimestamp = events.at(-1)?.timestamp
        if (
          watermark &&
          (!lastEventTimestamp ||
            Date.parse(lastEventTimestamp) < Date.parse(watermark))
        ) {
          this.eventLogVersions.set(sessionId, version)
          await this.recoverHiddenUserInput(sessionId, events)
          return
        }
        let status = syncedUserInput
          ? 'waiting'
          : statusFromEvents(events)
        const queueDispatchAt = this.store.queueDispatchAt(sessionId)
        if (queueDispatchAt) {
          const dispatchTime = Date.parse(queueDispatchAt)
          const completion = events.some(
            (event) =>
              Date.parse(event.timestamp) >= dispatchTime &&
              isForegroundCompletionEvent(event),
          )
          if (completion) {
            await this.store.clearQueueDispatch(sessionId, queueDispatchAt)
          } else {
            status = 'running'
          }
        }
        const activity = messages
          .findLast(
            (message) =>
              message.role === 'activity' &&
              message.activityStatus === 'running',
          )
          ?.content.split('\n', 1)[0]
        const runtime = runtimeInfoFromEvents(
          events,
          stored?.runtime,
          this.modelPromptLimits,
        )
        const cwd = workingDirectoryFromEvents(events, stored?.cwd)
        const contextCwd = events.some(
          (event) =>
            event.type === 'session.context_changed' &&
            !eventAgentId(event),
        )
        if (
          this.activePrompts.has(sessionId) ||
          this.deletedSessionIds.has(sessionId) ||
          !this.store.get(sessionId)
        ) {
          return
        }
        const updated = await this.store.replaceTranscript(
          sessionId,
          messages,
          status,
          activity,
          runtime,
          cwd,
          contextCwd,
          syncedUserInput,
          queueDispatchAt,
        )
        this.eventLogFingerprints.set(sessionId, fingerprint)
        this.eventLogVersions.set(sessionId, version)
        this.liveTranscriptWatermarks.delete(sessionId)
        this.publish(updated)
        const latestCompletionAt = events.findLast(
          (event) =>
            // A turn that handed its work to background agents ends before
            // they do, so the last agent finishing is the completion a prompt
            // queued behind them is waiting on.
            isForegroundCompletionEvent(event) ||
            event.type === 'subagent.completed' ||
            event.type === 'subagent.failed',
        )?.timestamp
        const firstQueuedAt = updated.queuedPrompts?.[0]?.createdAt
        if (
          status === 'idle' &&
          this.externalSessionIds.has(sessionId) &&
          firstQueuedAt &&
          latestCompletionAt &&
          Date.parse(latestCompletionAt) >= Date.parse(firstQueuedAt)
        ) {
          await this.drainTerminalQueue(sessionId)
        }
      }),
    )
  }

  /**
   * The notice is only true while the terminal that painted it is running.
   * Once discovery drops the session nothing polls it again, so a stale offer
   * would otherwise stay on screen until the terminal came back.
   */
  private async clearUpdateNoticeForExited(
    previouslyExternal: Set<string>,
  ): Promise<void> {
    for (const sessionId of previouslyExternal) {
      if (this.externalSessionIds.has(sessionId)) {
        continue
      }
      this.terminalUpdateChecks.delete(sessionId)
      if (this.store.get(sessionId)?.runtime?.updateAvailable === undefined) {
        continue
      }
      const updated = await this.store.update(sessionId, (session) => {
        session.runtime = { ...session.runtime, updateAvailable: undefined }
      })
      this.publish(updated)
    }
  }

  /**
   * Mirrors the update the CLI is advertising in its own status bar, so a
   * session supervised from the web is not the only place the recommendation
   * is invisible. The CLI checks rarely, so this does too.
   */
  private async syncTerminalUpdateNotice(sessionId: string): Promise<void> {
    if (!this.terminalController.updateNotice) {
      return
    }
    const stored = this.store.get(sessionId)
    if (!stored || this.deletedSessionIds.has(sessionId)) {
      return
    }
    const now = Date.now()
    const lastCheck = this.terminalUpdateChecks.get(sessionId) || 0
    if (now - lastCheck < 60_000) {
      return
    }
    this.terminalUpdateChecks.set(sessionId, now)
    const updateAvailable = await this.terminalController
      .updateNotice(sessionId)
      .catch(() => undefined)
    if ((stored.runtime?.updateAvailable ?? undefined) === updateAvailable) {
      return
    }
    const updated = await this.store.update(sessionId, (session) => {
      session.runtime = { ...session.runtime, updateAvailable }
    })
    this.publish(updated)
  }

  /**
   * An ask-user request only reaches the UI through a transcript sync, but the
   * agent stops writing events while it waits for the answer. Every sync
   * short-circuit therefore ends here, so a request recovered from the event
   * log cannot stay invisible while the session waits forever.
   */
  private async recoverHiddenUserInput(
    sessionId: string,
    events?: SessionEvent[],
  ): Promise<void> {
    const stored = this.store.get(sessionId)
    if (
      !stored ||
      stored.pendingUserInput ||
      stored.pendingPermission ||
      this.activePrompts.has(sessionId) ||
      this.deletedSessionIds.has(sessionId) ||
      !this.hasUnansweredUserInputRow(stored)
    ) {
      return
    }
    const now = Date.now()
    const answered = this.answeredPersistedInputs.get(sessionId)
    if (answered && answered.expiresAt <= now) {
      this.answeredPersistedInputs.delete(sessionId)
    }
    const pending = pendingUserInputFromEvents(
      events || (await this.sessionEventReader(sessionId)),
    )
    if (
      !pending ||
      this.answeredPersistedInputs.get(sessionId)?.requestId ===
        pending.requestId
    ) {
      return
    }
    const updated = await this.store.update(sessionId, (session) => {
      if (session.pendingUserInput || session.pendingPermission) {
        return
      }
      session.pendingUserInput = pending
      session.status = 'waiting'
      session.activity = pending.question
    })
    this.publish(updated)
  }

  /**
   * Reads the newest running tool row only: an ask-user request that reached
   * the transcript but not the session keeps this cheap for every other poll.
   */
  private hasUnansweredUserInputRow(stored: SessionDetail): boolean {
    for (let index = stored.messages.length - 1; index >= 0; index -= 1) {
      const message = stored.messages[index]
      if (
        message?.role !== 'activity' ||
        message.activityStatus !== 'running'
      ) {
        continue
      }
      return message.content.startsWith('Ask User')
    }
    return false
  }

  /**
   * Whether the agent has already recorded this tool call as finished. A
   * request answered or cancelled in an attached terminal completes there, so
   * this is what tells a reply that it is answering a prompt the agent has
   * stopped waiting on.
   */
  private async isToolCallComplete(
    sessionId: string,
    toolCallId: string,
  ): Promise<boolean> {
    const events = await this.sessionEventReader(sessionId).catch(() => [])
    return events.some(
      (event) =>
        event.type === 'tool.execution_complete' &&
        !event.agentId &&
        stringValue(recordValue(event.data).toolCallId) === toolCallId,
    )
  }

  /**
   * Waits for the agent to record the prompt as finished, so the answer that
   * follows is typed at the prompt instead of into the closing form.
   */
  private async waitForToolCompletion(
    sessionId: string,
    toolCallId: string,
    attempts = 20,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      if (await this.isToolCallComplete(sessionId, toolCallId)) {
        return true
      }
    }
    return false
  }

  private async syncTerminalUserInput(sessionId: string): Promise<void> {
    if (
      !this.terminalController.pendingUserInput &&
      !this.terminalController.pendingPermission
    ) {
      return
    }
    const stored = this.store.get(sessionId)
    if (!stored || this.deletedSessionIds.has(sessionId)) {
      return
    }
    const now = Date.now()
    const lastCheck = this.terminalUserInputChecks.get(sessionId) || 0
    if (
      !stored.pendingUserInput &&
      !stored.pendingPermission &&
      now - lastCheck < 2_000
    ) {
      return
    }
    this.terminalUserInputChecks.set(sessionId, now)
    const permission =
      await this.terminalController.pendingPermission?.(sessionId)
    if (permission) {
      const answered = this.answeredTerminalPermissions.get(sessionId)
      if (answered && answered.expiresAt <= now) {
        this.answeredTerminalPermissions.delete(sessionId)
      } else if (answered?.requestId === permission.requestId) {
        return
      }
      if (stored.pendingPermission?.requestId === permission.requestId) {
        return
      }
      const updated = await this.store.update(sessionId, (session) => {
        session.pendingPermission = permission
        session.pendingUserInput = undefined
        session.status = 'waiting'
        session.activity = permission.title
      })
      this.publish(updated)
      return
    }
    if (
      stored.pendingPermission?.requestId.startsWith('terminal-permission:')
    ) {
      const continuation = await this.terminalContinuationState(
        sessionId,
        this.answeredTerminalPermissions.get(sessionId)?.repliedAt,
      )
      const updated = await this.store.update(sessionId, (session) => {
        session.pendingPermission = undefined
        session.status = continuation.status
        session.activity = continuation.activity
      })
      this.publish(updated)
    }
    const pending = await this.terminalController.pendingUserInput?.(sessionId)
    if (pending) {
      const answered = this.answeredTerminalInputs.get(sessionId)
      if (answered && answered.expiresAt <= now) {
        this.answeredTerminalInputs.delete(sessionId)
      } else if (answered?.requestId === pending.requestId) {
        return
      }
      if (stored.pendingUserInput?.requestId === pending.requestId) {
        return
      }
      const updated = await this.store.update(sessionId, (session) => {
        session.pendingUserInput = pending
        session.status = 'waiting'
        session.activity = pending.question
      })
      this.publish(updated)
      return
    }
    if (stored.pendingUserInput?.requestId.startsWith('terminal:')) {
      const continuation = await this.terminalContinuationState(
        sessionId,
        this.answeredTerminalInputs.get(sessionId)?.repliedAt,
      )
      const updated = await this.store.update(sessionId, (session) => {
        session.pendingUserInput = undefined
        session.status = continuation.status
        session.activity = continuation.activity
      })
      this.publish(updated)
    }
  }

  private async terminalContinuationState(
    sessionId: string,
    since?: string,
  ): Promise<{ status: SessionStatus; activity?: string }> {
    try {
      const events = await this.sessionEventReader(sessionId)
      const relevant = since
        ? events.filter(
            (event) =>
              Date.parse(event.timestamp) >= Date.parse(since),
          )
        : events
      const hasLifecycleEvent = relevant.some(isForegroundLifecycleEvent)
      if (!hasLifecycleEvent) {
        const hasBackgroundTaskActivity =
          relevant.some(isBackgroundTaskEvent) ||
          backgroundTasksFromEvents(relevant, { assumeBackground: true }).some(
            (task) => task.executionMode === 'background',
          )
        if (
          hasBackgroundTaskActivity &&
          events.some(isForegroundLifecycleEvent)
        ) {
          // Background work can keep the session running after the turn that
          // launched it ended. That is the agents' own state rather than a
          // continuation of the turn just answered, so no activity is shown.
          return { status: statusFromEvents(events) }
        }
        return { status: 'running', activity: 'Continuing' }
      }
      const status = statusFromEvents(relevant)
      if (status === 'waiting' || status === 'running') {
        return { status: 'running', activity: 'Continuing' }
      }
      return { status }
    } catch (error) {
      console.warn('Unable to derive terminal continuation state:', error)
      return { status: 'running', activity: 'Continuing' }
    }
  }

  private async syncExternalWorkspace(sessionId: string): Promise<void> {
    const version = await this.workspaceVersion(sessionId)
    if (!version || this.workspaceVersions.get(sessionId) === version) {
      return
    }
    const metadata = await this.workspaceReader(sessionId)
    this.workspaceVersions.set(sessionId, version)
    if (!metadata || this.deletedSessionIds.has(sessionId)) {
      return
    }
    const stored = this.store.get(sessionId)
    if (
      !stored ||
      (metadata.cwd === stored.cwd &&
        (!metadata.title || metadata.title === stored.title))
    ) {
      return
    }
    const updated = await this.store.syncWorkspaceMetadata(sessionId, metadata)
    this.publish(updated)
    if (metadata.title && this.terminalController.rename) {
      await this.terminalController
        .rename(sessionId, updated.title)
        .catch((error: unknown) => this.publishError(sessionId, error))
    }
  }

  private syncBackgroundTasks(
    sessionId: string,
    sdkSession = this.sessions.get(sessionId),
  ): Promise<BackgroundTaskSnapshot> {
    const existing = this.backgroundTaskSyncs.get(sessionId)
    if (existing) {
      this.backgroundTaskResyncNeeded.add(sessionId)
      return existing
    }
    let sync: Promise<BackgroundTaskSnapshot>
    sync = (async () => {
      let snapshot: BackgroundTaskSnapshot
      do {
        this.backgroundTaskResyncNeeded.delete(sessionId)
        snapshot = await this.readBackgroundTasks(sessionId, sdkSession)
      } while (this.backgroundTaskResyncNeeded.has(sessionId))
      return snapshot
    })().finally(() => {
      if (this.backgroundTaskSyncs.get(sessionId) === sync) {
        this.backgroundTaskSyncs.delete(sessionId)
      }
      this.backgroundTaskResyncNeeded.delete(sessionId)
    })
    this.backgroundTaskSyncs.set(sessionId, sync)
    return sync
  }

  private async readBackgroundTasks(
    sessionId: string,
    sdkSession = this.sessions.get(sessionId),
  ): Promise<BackgroundTaskSnapshot> {
    const tasks = sdkSession?.rpc.tasks
    if (!tasks?.list) {
      return this.replaceBackgroundTasks(sessionId, [], false)
    }

    try {
      await tasks.refresh?.()
    } catch (error) {
      if (!isUnsupportedBackgroundTaskError(error)) {
        throw error
      }
    }

    let listed: { tasks: CopilotTaskInfo[] }
    try {
      listed = await tasks.list()
    } catch (error) {
      if (isUnsupportedBackgroundTaskError(error)) {
        return this.replaceBackgroundTasks(sessionId, [], false)
      }
      throw error
    }

    const entries = [...listed.tasks]
      .sort(
        (left, right) =>
          Number(
            right.status === 'running' ||
              right.status === 'idle' ||
              right.status === 'queued',
          ) -
            Number(
              left.status === 'running' ||
                left.status === 'idle' ||
                left.status === 'queued',
            ) ||
          right.startedAt.localeCompare(left.startedAt),
      )
      .slice(0, MAX_BACKGROUND_TASKS)
    const normalized = await Promise.all(
      entries.map(async (task) => {
        let progress: CopilotTaskProgress | null | undefined
        if (tasks.getProgress) {
          try {
            progress = (await tasks.getProgress({ id: task.id })).progress
          } catch (error) {
            if (!isUnsupportedBackgroundTaskError(error)) {
              throw error
            }
          }
        }
        return normalizeBackgroundTask(
          task,
          progress,
          typeof tasks.cancel === 'function',
        )
      }),
    )
    return this.replaceBackgroundTasks(sessionId, normalized, true)
  }

  private replaceBackgroundTasks(
    sessionId: string,
    tasks: BackgroundTask[],
    supported: boolean,
  ): BackgroundTaskSnapshot {
    // An externally owned session is projected from its event log, so there is
    // no channel to cancel a task through however that projection was
    // produced. Enforcing it here rather than at each call site keeps a path
    // that publishes a raw projection from re-enabling the control.
    const owned = this.externalSessionIds.has(sessionId)
      ? tasks.map((task) =>
          task.canCancel ? { ...task, canCancel: false } : task,
        )
      : tasks
    const update = this.backgroundTaskTracker.replace(
      sessionId,
      owned,
      supported,
    )
    if (update.changed) {
      const snapshot = update.snapshot
      this.emit('event', {
        type: 'session.tasks.updated',
        sessionId,
        ...snapshot,
      })
    }
    return update.snapshot
  }

  private rememberLiveActivityEvent(
    sessionId: string,
    event: SessionEvent,
    kind?: ActivityKind,
    toolCallId?: string,
  ): void {
    const events =
      this.liveActivityEvents.get(sessionId) ||
      new Map<
        string,
        {
          agentId?: string
          parentToolCallId?: string
          kind?: ActivityKind
          toolCallId?: string
          subagentToolCallId?: string
        }
      >()
    const data = recordValue(event.data)
    events.set(event.id, {
      agentId: event.agentId,
      parentToolCallId: stringValue(data.parentToolCallId),
      kind,
      toolCallId,
      subagentToolCallId:
        event.type === 'subagent.started'
          ? stringValue(data.toolCallId)
          : undefined,
    })
    while (events.size > 2_000) {
      const oldest = events.keys().next().value
      if (!oldest) {
        break
      }
      events.delete(oldest)
    }
    this.liveActivityEvents.set(sessionId, events)
  }

  private liveActivityGroupId(
    sessionId: string,
    event: SessionEvent,
  ): string | undefined {
    const events = this.liveActivityEvents.get(sessionId)
    const toolStartsByCallId = new Map<string, ActivityToolStart>()
    const subagentParentsByAgentId = new Map<string, string>()
    for (const activity of events?.values() || []) {
      if (activity.toolCallId && activity.kind) {
        toolStartsByCallId.set(activity.toolCallId, {
          kind: activity.kind,
          parentToolCallId: activity.parentToolCallId,
          toolCallId: activity.toolCallId,
        })
      }
      if (activity.agentId && activity.subagentToolCallId) {
        subagentParentsByAgentId.set(
          activity.agentId,
          activity.subagentToolCallId,
        )
      }
    }
    return activityGroupIdFor(
      stringValue(recordValue(event.data).parentToolCallId),
      event.agentId,
      toolStartsByCallId,
      subagentParentsByAgentId,
    )
  }

  private attachSession(session: CopilotSessionLike): void {
    session.on((event) => {
      this.handleSessionEvent(session.sessionId, event)
    })
  }

  private handleSessionEvent(sessionId: string, event: SessionEvent): void {
    const activePrompt = this.activePrompts.get(sessionId)
    const stored = this.store.get(sessionId)
    this.rememberLiveActivityEvent(sessionId, event)

    if (
      (event.type === 'session.background_tasks_changed' ||
        event.type === 'subagent.started' ||
        event.type === 'subagent.completed' ||
        event.type === 'subagent.failed') &&
      stored &&
      !this.deletingSessions.has(sessionId)
    ) {
      void this.syncBackgroundTasks(sessionId).catch((error: unknown) =>
        this.publishError(sessionId, error),
      )
    }

    if (
      event.type === 'session.context_changed' &&
      !eventAgentId(event) &&
      stored &&
      !this.deletingSessions.has(sessionId)
    ) {
      const cwd = event.data.cwd?.trim()
      if (cwd && cwd !== stored.cwd) {
        void this.store
          .updateWorkingDirectory(sessionId, cwd, event.timestamp)
          .then((session) => this.publish(session))
          .catch((error: unknown) => this.publishError(sessionId, error))
      }
      return
    }

    if (
      event.type === 'session.title_changed' &&
      !eventAgentId(event) &&
      stored &&
      !this.deletingSessions.has(sessionId)
    ) {
      const title = event.data.title.trim()
      if (title && title !== stored.title) {
        void this.store
          .updateAutomaticTitle(sessionId, title, event.timestamp)
          .then((session) => this.publish(session))
          .catch((error: unknown) => this.publishError(sessionId, error))
      }
      return
    }

    if (
      runtimeEventTypes.has(event.type) &&
      stored &&
      !this.deletingSessions.has(sessionId)
    ) {
      const runtime = runtimeInfoFromEvents(
        [event],
        stored.runtime,
        this.modelPromptLimits,
        false,
      )
      if (runtime && !runtimeInfoMatches(stored.runtime, runtime)) {
        void this.store
          .update(sessionId, (session) => {
            session.runtime = runtime
          })
          .then((session) => this.publish(session))
          .catch((error: unknown) => this.publishError(sessionId, error))
      }
    }

    if (
      event.type === 'assistant.message_delta' &&
      !eventAgentId(event) &&
      activePrompt
    ) {
      this.publish(
        this.store.streamMessage(
          sessionId,
          activePrompt.assistantMessageId,
          event.data.deltaContent,
        ),
      )
      return
    }

    if (
      event.type === 'assistant.message' &&
      !eventAgentId(event) &&
      activePrompt
    ) {
      this.liveTranscriptWatermarks.set(sessionId, event.timestamp)
      this.publish(
        this.store.setMessageContent(
          sessionId,
          activePrompt.assistantMessageId,
          event.data.content,
        ),
      )
      return
    }

    if (event.type === 'tool.execution_start') {
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
      const toolName = event.data.toolName
        .toLowerCase()
        .replaceAll('-', '_')
      if (toolName === 'task_complete' && !event.agentId) {
        this.liveTaskCompletionSummaries.set(
          `${sessionId}:${event.data.toolCallId}`,
          stringValue(recordValue(event.data.arguments).summary)?.trim() || '',
        )
      }
      this.rememberLiveActivityEvent(
        sessionId,
        event,
        activityKind(event.data),
        event.data.toolCallId,
      )
      void this.store
        .startToolActivity(
          sessionId,
          event.data.toolCallId,
          toolActivityContent(event.data),
          event.timestamp,
          activityKind(event.data),
          this.liveActivityGroupId(sessionId, event),
        )
        .then((stored) => this.publish(stored))
        .catch((error: unknown) => this.publishError(sessionId, error))
      return
    }

    if (event.type === 'tool.execution_complete') {
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
      const completionKey = `${sessionId}:${event.data.toolCallId}`
      const isTaskCompletion =
        this.liveTaskCompletionSummaries.has(completionKey)
      const fallbackSummary =
        this.liveTaskCompletionSummaries.get(completionKey) || ''
      this.liveTaskCompletionSummaries.delete(completionKey)
      const resultContent =
        stringValue(
          recordValue(recordValue(event.data).result).content,
        )?.trim() || fallbackSummary
      const presentationResult = activityResult(event.data, event.data.success)
      const update =
        isTaskCompletion && event.data.success && resultContent
          ? this.store.finishTaskCompletion(
              sessionId,
              event.data.toolCallId,
              resultContent,
              event.timestamp,
              activePrompt?.assistantMessageId,
            )
          : this.store.finishToolActivity(
              sessionId,
              event.data.toolCallId,
              event.data.success,
              event.timestamp,
              presentationResult,
            )
      void update
        .then((stored) => this.publish(stored))
        .catch((error: unknown) => this.publishError(sessionId, error))
    }
  }

  private async runPrompt(
    sdkSession: CopilotSessionLike,
    content: string,
    assistantMessageId: string,
  ): Promise<void> {
    const sessionId = sdkSession.sessionId
    try {
      const response = await sdkSession.sendAndWait(content, 60 * 60 * 1000)
      if (response?.timestamp) {
        this.liveTranscriptWatermarks.set(sessionId, response.timestamp)
      }
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
      if (response?.data.content) {
        this.store.setMessageContent(
          sessionId,
          assistantMessageId,
          response.data.content,
        )
      }
      await this.store.finishMessage(sessionId, assistantMessageId)
      const updated = await this.store.update(sessionId, (session) => {
        for (const message of session.messages) {
          if (
            message.role === 'activity' &&
            message.activityStatus === 'running'
          ) {
            message.activityStatus = 'completed'
          }
        }
        session.status = 'idle'
        session.activity = undefined
      })
      this.publish(updated)
    } catch (error) {
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
      const message = error instanceof Error ? error.message : String(error)
      const updated = await this.store.update(sessionId, (session) => {
        for (const entry of session.messages) {
          if (
            entry.role === 'activity' &&
            entry.activityStatus === 'running'
          ) {
            entry.activityStatus = 'failed'
            entry.activityResult = `Error: ${message}`
          }
        }
        const assistant = session.messages.find(
          (entry) => entry.id === assistantMessageId,
        )
        if (assistant) {
          assistant.streaming = false
          if (!assistant.content) {
            assistant.content = `Unable to complete the response: ${message}`
          }
        }
        session.status = 'error'
        session.activity = undefined
      })
      this.publish(updated)
      this.emit('event', { type: 'error', sessionId, message })
    } finally {
      this.activePrompts.delete(sessionId)
      await this.drainSdkQueue(sessionId)
    }
  }

  private async drainSdkQueue(sessionId: string): Promise<void> {
    if (this.drainingSessions.has(sessionId)) {
      return
    }
    if (
      this.suspendingSessions.has(sessionId) ||
      this.store.get(sessionId)?.suspended
    ) {
      // As above: a drain starting beside a suspension marks the session as
      // working after the runtime has gone.
      return
    }
    this.drainingSessions.add(sessionId)
    // Whether this pass took a prompt off the queue and it stayed off. A
    // prompt that failed goes back, and treating that as progress is what
    // turns "carry on" into a loop.
    let consumed = false
    try {
      if (!this.deletingSessions.has(sessionId) && this.store.get(sessionId)) {
        const { session: queued, prompt: next } = await this.serializeQueue(
          sessionId,
          () => this.store.shiftQueuedPrompt(sessionId),
        )
        this.publish(queued)
        if (next) {
          try {
            if (next.command) {
              // A queued slash command has to run as one. Handed to the
              // ordinary message path it reaches the model as text, so a
              // queued `/clear` became a sentence about clearing rather than
              // the command it was queued as.
              await this.runCommand(
                sessionId,
                next.content,
                false,
                undefined,
                true,
              )
            } else {
              await this.startMessage(sessionId, next.content, true)
            }
            consumed = true
          } catch (error) {
            const restored = await this.serializeQueue(
              sessionId,
              () => this.store.enqueuePrompt(sessionId, next, true),
            )
            this.publish(restored)
            this.publishError(sessionId, error)
          }
        }
      }
    } catch (error) {
      this.publishError(sessionId, error)
    } finally {
      this.drainingSessions.delete(sessionId)
    }
    // A command that answered without starting a turn leaves nothing to call
    // this again when the turn ends, because there was no turn. Everything
    // behind it would wait for an unrelated send, resume or restart.
    //
    // Only when this pass actually consumed something. Carrying on regardless
    // retried a prompt that had just failed and been put back -- for ever,
    // repeating whatever it had already done on the way.
    const remaining = this.store.get(sessionId)
    if (
      consumed &&
      remaining?.queuedPrompts?.length &&
      remaining.status === 'idle' &&
      !this.activePrompts.has(sessionId) &&
      !this.drainingSessions.has(sessionId)
    ) {
      void this.drainSdkQueue(sessionId).catch(() => undefined)
    }
  }

  private async drainTerminalQueue(sessionId: string): Promise<void> {
    if (this.drainingSessions.has(sessionId)) {
      return
    }
    if (
      this.suspendingSessions.has(sessionId) ||
      this.store.get(sessionId)?.suspended
    ) {
      // A drain starting now would wait behind the teardown and then mark the
      // session as working, which the last idleness check reads as a turn
      // having begun -- the pane already killed, and the suspension abandoned
      // with nothing running it.
      return
    }
    this.drainingSessions.add(sessionId)
    try {
      // A command answers in the pane instead of starting a turn, so it adds
      // no completion event and nothing else would drain what is queued behind
      // it. Draining continues here until the queue is empty or a turn begins.
      while (await this.drainNextTerminalPrompt(sessionId)) {
        // Keep draining while commands keep answering.
      }
    } catch (error) {
      this.publishError(sessionId, error)
    } finally {
      this.drainingSessions.delete(sessionId)
    }
  }

  /**
   * Sends the next queued entry. Returns true when the caller should drain
   * again immediately, which is only the case for a command that answered
   * without starting a turn: a dispatched prompt and a command that began a
   * turn both leave the terminal busy, and their completion drains the rest.
   */
  private async drainNextTerminalPrompt(sessionId: string): Promise<boolean> {
    return await this.serializeQueue(sessionId, async () => {
      const stored = this.store.get(sessionId)
      const next = stored?.queuedPrompts?.[0]
      if (!next || stored.status !== 'idle') {
        return false
      }
      // One unacknowledged failure at a time. Sending the next prompt while
      // the previous one is still waiting to be handed back would overwrite
      // it, and the first would be gone with nothing holding it.
      if (stored.failedPrompt) {
        return false
      }
      const dispatchedAt = new Date().toISOString()
      // A command reports what it printed instead of starting a turn, so its
      // pane is captured before the keystrokes go in, exactly as it would be
      // had the command not been queued.
      const before = next.command
        ? await this.terminalController.capture?.(sessionId)
        : undefined
      try {
        if (
          !(await this.terminalController.send(sessionId, next.content, false))
        ) {
          throw new Error('External terminal is no longer available')
        }
      } catch (error) {
        // The queue drains again whenever the session next falls idle, so a
        // prompt left on it after a failed send is sent a second time without
        // anyone asking. It is taken off and reported instead, which is what
        // the reader can act on.
        // Recorded on the session before the queue entry goes, so the text is
        // never absent from both at once. A snapshot carries it to a browser
        // that was not listening when it failed, which a one-off event
        // cannot.
        // One write: the prompt leaves the queue and is recorded as needing
        // recovery together. Done separately, a restart between them finds
        // both copies on disk, and the prompt is delivered again while the
        // reader has already been handed the text back.
        let session: SessionDetail | undefined
        try {
          session = await this.store.setFailedPrompt(
            sessionId,
            next.id,
            next.content,
            // tmux may have taken the paste even though it was never seen to
            // arrive, so this is not known to have failed. Carried with the
            // text, because after a reload a bare draft looks like anything
            // else waiting to be sent.
            Boolean(
              error &&
                typeof error === 'object' &&
                'uncertainDelivery' in error,
            ),
          )
        } catch {
          session = undefined
        }
        const recovered = Boolean(session)
        if (session) {
          // The queue changed, and a browser told only about the error would
          // go on showing a prompt that is no longer waiting for anything.
          this.publish(session)
        }
        // Announced only when it was actually recorded. Saying the text is
        // being held while the write that holds it failed hands a browser a
        // draft the server cannot answer for, and leaves the queued copy on
        // disk to be delivered again after a restart.
        if (!recovered) {
          throw new Error(
            `${
              error instanceof Error ? error.message : String(error)
            } The prompt could not be set aside for recovery, so it may still be queued.`,
          )
        }
        this.emit('event', {
          type: 'error',
          sessionId,
          message: error instanceof Error ? error.message : String(error),
          failedPrompt: next.content,
          // The same identity the snapshot uses, so a client that sees both
          // knows they are one failure rather than two.
          failedPromptAt: session?.failedPrompt?.failedAt,
        })
        if (!recovered) {
          // Saying the prompt was taken off the queue while it may still be on
          // disk would let a restart deliver it again beside the draft the
          // reader has been handed back.
          throw new Error(
            `${
              error instanceof Error ? error.message : String(error)
            } The prompt could not be set aside for recovery, so it may still be queued.`,
          )
        }
        throw error
      }
      const { prompt } = await this.store.removeQueuedPrompt(sessionId, next.id)
      if (!prompt) {
        return false
      }
      if (next.command) {
        const feedback = await this.terminalCommandFeedback(
          sessionId,
          next.content,
          before,
        )
        const notice = await this.store.addMessage(sessionId, {
          id: randomUUID(),
          role: 'notice',
          content: feedback.notice,
          createdAt: new Date().toISOString(),
        })
        this.publish(notice)
        if (feedback.startedTurn) {
          // The command began a turn instead of answering, so the terminal is
          // busy until it ends. Recording the dispatch now keeps anything else
          // from being sent into that turn before polling observes it.
          const started = await this.store.markTerminalPromptDispatched(
            sessionId,
            dispatchedAt,
          )
          this.publish(started)
          return false
        }
        // A full-screen view owns the keyboard without starting a turn, so the
        // session stays idle while the rest of the queue waits for it to close
        // rather than being typed into its search box.
        return !feedback.overlayOpen
      }
      const running = await this.store.markTerminalPromptDispatched(
        sessionId,
        dispatchedAt,
      )
      this.publish(running)
      return false
    })
  }

  private async serializeQueue<T>(
    sessionId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = this.queueOperations.get(sessionId) || Promise.resolve()
    const current = previous.catch(() => undefined).then(operation)
    this.queueOperations.set(sessionId, current)
    try {
      return await current
    } finally {
      if (this.queueOperations.get(sessionId) === current) {
        this.queueOperations.delete(sessionId)
      }
    }
  }

  private requestPermission(
    sessionId: string,
    request: PermissionRequest,
  ): Promise<PermissionRequestResult> {
    if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      return Promise.resolve({ kind: 'user-not-available' })
    }
    const requestId = randomUUID()
    const permission: PendingPermission = {
      requestId,
      title: permissionTitle(request),
      kind: request.kind,
      options: [
        { optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' },
        { optionId: 'reject', name: 'Reject', kind: 'reject_once' },
      ],
    }

    return new Promise<PermissionRequestResult>((resolve) => {
      this.permissions.set(requestId, { sessionId, resolve })
      void this.store
        .update(sessionId, (session) => {
          session.pendingPermission = permission
          session.status = 'waiting'
          session.activity = permission.title
        })
        .then((session) => this.publish(session))
        .catch((error: unknown) => {
          this.permissions.delete(requestId)
          resolve({ kind: 'user-not-available' })
          this.publishError(sessionId, error)
        })
    })
  }

  private requestElicitation(
    context: ElicitationContext,
  ): Promise<ElicitationResult> {
    const sessionId = context.sessionId
    if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return Promise.resolve({ action: 'cancel' })
    }
    if (context.mode === 'url') {
        return Promise.reject(
          new Error('URL elicitation is not supported by Agentic Remote'),
        )
    }
    const question = context.message.trim()
    const form = userInputFormFromSchema(context.requestedSchema)
    if (!question || !form) {
        return Promise.reject(
          new Error('Agentic Remote received an unsupported elicitation form'),
        )
    }
    const requestId = randomUUID()
    const pending: PendingUserInput = {
        requestId,
        question,
        choices: [],
        allowFreeform: false,
        form,
    }
    return new Promise<ElicitationResult>((resolve) => {
        this.elicitations.set(requestId, { sessionId, resolve })
        void this.store
          .update(sessionId, (session) => {
            session.pendingUserInput = pending
            session.status = 'waiting'
            session.activity = pending.question
          })
          .then((session) => this.publish(session))
          .catch((error: unknown) => {
            this.elicitations.delete(requestId)
            resolve({ action: 'cancel' })
            this.publishError(sessionId, error)
          })
    })
  }

  private requestUserInput(
    sessionId: string,
    request: UserInputRequest,
  ): Promise<UserInputResponse> {
    if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      return Promise.resolve({ answer: '', wasFreeform: true })
    }
    const requestId = randomUUID()
    const pending: PendingUserInput = {
      requestId,
      question: request.question,
      choices: request.choices || [],
      allowFreeform: request.allowFreeform ?? true,
    }
    return new Promise<UserInputResponse>((resolve) => {
      this.userInputs.set(requestId, { sessionId, resolve })
      void this.store
        .update(sessionId, (session) => {
          session.pendingUserInput = pending
          session.status = 'waiting'
          session.activity = pending.question
        })
        .then((session) => this.publish(session))
        .catch((error: unknown) => {
          this.userInputs.delete(requestId)
          resolve({ answer: '', wasFreeform: true })
          this.publishError(sessionId, error)
        })
    })
  }

  private publish(session: SessionDetail): void {
    this.emit('event', { type: 'session.upserted', session })
  }

  private publishError(sessionId: string, error: unknown): void {
    this.emit('event', {
      type: 'error',
      sessionId,
      message: error instanceof Error ? error.message : String(error),
    })
  }

  private async validateDirectory(inputPath: string): Promise<string> {
    return validateSessionDirectory(inputPath)
  }
}
