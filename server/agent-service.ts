import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { SubmissionError } from '../shared/submission-error.js'
import { isDeepStrictEqual } from 'node:util'
import {
  CopilotClient,
  RuntimeConnection,
  type AssistantMessageEvent,
  type CopilotSession,
  type ElicitationResult,
  type PermissionRequest,
  type PermissionRequestResult,
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
  QueuedPromptDispatchResult,
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
import { isAppOnlyQueuedCommand } from '../shared/queued-commands.js'
import {
  acceptanceReceipt,
  explicitlyRefused,
  preparePrompt,
  queueConflict,
  QueuedDelivery,
  QueuedDispatches,
  terminalRefused,
} from './queued-dispatch.js'
import { queuedSdkPrompt } from './queued-sdk-prompt.js'
import {
  backgroundTasksFromEvents,
  MAX_BACKGROUND_TASKS,
  normalizeBackgroundTask,
  type CopilotTaskInfo,
  type CopilotTaskProgress,
  type CopilotTasksApi,
} from './background-task-adapter.js'
import { BackgroundTaskTracker } from './background-task-tracker.js'
import {
  SessionReplacementCleanupError,
  SessionStore,
  StaleQueuedPromptReservationError,
  type TranscriptObservation,
  type DiscoveredSession,
  type QueuedPromptReservation,
  type TerminalQueueOutcome,
} from './session-store.js'
import { SessionAdmissions, type PendingQueueAdmission } from './session-admissions.js'
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
  composerHoldsText,
  isTerminalAgentWorking,
  isTerminalOverlay,
  isTerminalSessionInUsePrompt,
  terminalCommandOutput,
  TmuxTerminalSessionController,
  type TerminalFormStep,
  type TerminalSendOptions,
  type TerminalSessionController,
} from './terminal-session.js'

interface ActivePrompt {
  assistantMessageId: string
}

class TerminalDiscoveryError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause), { cause })
    this.name = 'TerminalDiscoveryError'
  }
}

type TerminalRecoveryResult = 'created' | 'existing' | 'skipped' | 'deferred'

interface DeliveryBoundary {
  accepted: boolean
}

interface RecoveryResendClaim extends DeliveryBoundary {
  failedAt: string
  release(): void
}

interface PendingTerminalQueueSettlement {
  dispatchId: string
  outcome: TerminalQueueOutcome | { kind: 'feedback'; command: string; before: string | undefined }
  overlayOpen: boolean
  failureMessage?: string
  retryAt: number
  retryDelay: number
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

type SdkReplyChoice =
  | { kind: 'permission'; optionId: string }
  | {
      kind: 'input'
      action: NonNullable<UserInputReplyInput['action']>
      response: UserInputResponse
    }
  | { kind: 'elicitation'; response: ElicitationResult }

interface AcceptedSdkReply {
  sessionId: string
  choice: SdkReplyChoice
  promptId?: string
  completion?: Promise<SessionDetail>
}

export interface CopilotSessionLike {
  sessionId: string
  on(handler: (event: SessionEvent) => void): () => void
  send?(options: { prompt: string; mode: 'immediate' }): Promise<string>
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
  rpc: Pick<CopilotClient['rpc'], 'commands'> & {
    models: Pick<CopilotClient['rpc']['models'], 'list'>
  }
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

function isUncertainDelivery(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'uncertainDelivery' in error)
}

const sessionInUseMessage =
  'Copilot says this session is already in use. Choose Resume anyway or Go back in the permission card.'

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
  private readonly queuedDispatches: QueuedDispatches
  private readonly queuedPromptStops = new Map<string, () => void>()
  private readonly queuedPromptRuns = new Map<string, Promise<void>>()
  private readonly pendingSessionMetadata = new Map<string, SessionEvent[]>()
  private readonly sessionCreations = new Set<Promise<void>>()
  private readonly hydratedSessions = new Set<string>()
  private readonly loadingSessions = new Map<
    string,
    Promise<CopilotSessionLike>
  >()
  private readonly hydratingSessions = new Map<string, Promise<SessionDetail>>()
  private readonly activePrompts = new Map<string, ActivePrompt>()
  private readonly drainingSessions = new Set<string>()
  /** Old and replacement recovery tokens held by an in-flight dispatch. */
  private readonly claimedFailures = new Set<string>()
  private readonly recoveryClaims = new Map<string, RecoveryResendClaim>()
  /** What a cleared session became, so outstanding work can follow it. */
  private readonly replacedInto = new Map<string, string>()
  /** Sleeping acknowledgement retries, cleared when the service stops. */
  private readonly acknowledgementTimers = new Map<NodeJS.Timeout, () => void>()
  /** Marker clearances still outstanding after an accepted send. */
  private readonly pendingAcknowledgements = new Map<string, Promise<void>>()
  private readonly pendingTerminalQueueSettlements = new Map<string, PendingTerminalQueueSettlement>()
  private readonly pendingTerminalQueueClaims = new Map<string, { retryAt: number; retryDelay: number }>()
  /** Set when the service is shutting down, so retries stop with it. */
  private stopped = false
  private startupRecoveryPending = false
  // A settled owner must not be boot-recovered again while a peer is deferred.
  private terminalRecoveryStates?: Map<string, 'pending' | 'settled'>
  private startTask?: Promise<void>
  private stopTask?: Promise<void>
  private readonly admissions = new SessionAdmissions(() => this.stopped)
  private readonly sdkDrainRequested = new Set<string>()
  private readonly startupTerminalQueues = new Set<string>()
  private nativeStartupDiscoveryReady = false
  private readonly sdkQueueWakeups = new Map<string, Promise<void>>()
  private readonly terminalDrainRequested = new Set<string>()
  private readonly terminalQueueWakeups = new Map<string, Promise<void>>()
  private readonly pendingSdkQueueAdmissions = new Map<string, PendingQueueAdmission>()
  private readonly queueOperations = new Map<string, Promise<unknown>>()
  private readonly terminalAdmissionOperations = new Map<
    string,
    Promise<unknown>
  >()
  private readonly terminalAdmissionDispatched = new Set<string>()
  private readonly pendingTerminalPromptDispatches = new Map<string, string>()
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
  private readonly acceptedSdkReplies = new Map<string, AcceptedSdkReply>()
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

  private async runSessionCreation<T>(run: () => Promise<T>): Promise<T> {
    if (this.stopped) {
      throw new Error('The session service is stopping')
    }
    let finish!: () => void
    const pending = new Promise<void>((resolve) => { finish = resolve })
    this.sessionCreations.add(pending)
    this.discoveryGeneration += 1
    try {
      return await run()
    } finally {
      this.sessionCreations.delete(pending)
      this.discoveryGeneration += 1
      finish()
    }
  }

  private async disposeSdkIdentity(
    id: string,
    session?: CopilotSessionLike,
  ): Promise<void> {
    const current = this.sessions.get(id)
    if (current && current !== session) {
      throw new Error(`SDK ownership changed before cleaning up session ${id}`)
    }
    this.deletedSessionIds.add(id)
    this.discoveryGeneration += 1
    this.sessions.delete(id)
    this.hydratedSessions.delete(id)
    this.loadingSessions.delete(id)
    this.hydratingSessions.delete(id)
    this.pendingSessionMetadata.delete(id)
    const errors: unknown[] = []
    if (session) {
      try {
        await session.disconnect()
      } catch (error) {
        errors.push(error)
      }
    }
    try {
      await this.client.deleteSession(id)
    } catch (error) {
      if (!isMissingSessionError(error)) errors.push(error)
    }
    if (errors.length) {
      throw new AggregateError(errors, `SDK cleanup is incomplete for session ${id}`)
    }
  }

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
    if (this.stopped) {
      return Promise.reject(new Error('The session service is stopping'))
    }
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
    this.queuedDispatches = new QueuedDispatches(store, (session) => this.publish(session))
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
        supportsQueuedPromptDispatch: true,
      },
    ]
  }

  start(): Promise<void> {
    if (this.stopped) {
      return Promise.reject(Object.assign(new Error('The session service is stopping'), { statusCode: 503 }))
    }
    if (this.startTask) return this.startTask
    const starting = this.admissions.run('@startup', () => this.startAdmitted())
    this.startTask = starting
    void starting.catch(() => {
      if (this.startTask === starting) this.startTask = undefined
    })
    return starting
  }

  private async startAdmitted(): Promise<void> {
    await this.store.initialize()
    if (this.stopped) return
    this.startupRecoveryPending = true
    this.terminalRecoveryStates = undefined
    this.startupTerminalQueues.clear()
    this.nativeStartupDiscoveryReady = false
    // Capture persisted intent before discovery can mark other live terminals
    // open. A queue alone must not reopen an unmanaged or closed session.
    for (const session of this.store.terminalRecoverySessions()) {
      if (session.isOpen && session.queuedPrompts?.length) this.startupTerminalQueues.add(session.id)
    }
    await this.client.start()
    if (this.stopped) return
    await this.ensureRuntimeModels().catch((error: unknown) => {
      console.warn('Unable to load runtime models:', error)
    })
    if (this.stopped) return
    for (const session of this.store.list()) {
      const resend = this.store.recoveryResend(session.id)
      if (resend?.accepted) this.restoreRecoveryAcknowledgement(
        session.id, resend.failedAt, resend.content, this.store.backend(session.id) === 'terminal',
      )
    }
    try {
      if (await this.discoverSessions()) await this.finishStartupRecovery()
    } catch (error) {
      if (this.stopped) return
      if (!(error instanceof TerminalDiscoveryError)) throw error
      this.nativeStartupDiscoveryReady = false
      console.warn('Terminal discovery deferred during startup:', error)
      this.publishError('', error)
    }
    if (this.stopped) return
    await Promise.all([...this.startupTerminalQueues].map((id) => this.drainTerminalQueue(id)))
    if (this.stopped) return
    this.discoveryTimer = setInterval(() => {
      void this.refreshDiscovery()
    }, 10_000)
    this.discoveryTimer.unref()
    this.transcriptTimer = setInterval(() => {
      void this.refreshTranscripts()
    }, 750)
    this.transcriptTimer.unref()
  }

  private async finishStartupRecovery(): Promise<void> {
    if (
      (!this.startupRecoveryPending && !this.terminalRecoveryStates?.size) ||
      this.stopped || this.lifecycleLocks.size || this.sessionCreations.size
    ) return
    this.terminalRecoveryStates ??= new Map(
      (this.terminalController.create ? this.store.terminalRecoverySessions() : [])
        .map(({ id }) => [id, 'pending']),
    )
    const recovered = await this.recoverTerminalSessions()
    if (recovered > 0 && !(await this.discoverSessions())) return
    if (this.stopped) return
    if (this.startupRecoveryPending) {
      // Terminal recovery reconciles each confirmed owner before admitting it.
      // Do not revisit those owners, or touch an indeterminate one's state.
      await this.reconcileUntrackedTerminalDispatches(
        this.store.list()
          .filter((session) => !this.terminalRecoveryStates!.has(session.id))
          .map((session) => session.id),
      )
    }
    await this.refreshTranscripts()
    if (this.startupRecoveryPending) {
      await Promise.all(
        this.store.list()
          .filter((session) =>
            session.isOpen &&
            session.queuedPrompts?.length &&
            !session.suspended &&
            this.store.backend(session.id) !== 'terminal' &&
            !this.isTerminalRecoveryPending(session.id) &&
            !this.externalSessionIds.has(session.id),
          )
          .map((session) => this.drainSdkQueue(session.id)),
      )
    }
    this.startupRecoveryPending = false
    if (![...this.terminalRecoveryStates.values()].includes('pending')) {
      this.terminalRecoveryStates = undefined
    }
  }

  private isTerminalRecoveryPending(sessionId: string): boolean {
    const backend = this.store.backend(sessionId)
    if (this.startupRecoveryPending && backend === undefined) {
      return true
    }
    return backend === 'terminal' &&
      ((this.startupRecoveryPending && !this.terminalRecoveryStates) ||
        this.terminalRecoveryStates?.get(sessionId) === 'pending')
  }

  private assertTerminalRecoverySettled(sessionId: string): void {
    if (this.isTerminalRecoveryPending(sessionId)) {
      throw Object.assign(
        new Error('Terminal discovery has not settled. Wait for ownership to be confirmed before sending work.'),
        { statusCode: 409 },
      )
    }
  }

  stop(): Promise<void> {
    this.stopped = true
    this.stopTask ??= this.stopSettled()
    return this.stopTask
  }

  private async stopSettled(): Promise<void> {
    for (const stop of this.queuedPromptStops.values()) stop()
    for (const [timer, finish] of this.acknowledgementTimers) {
      clearTimeout(timer)
      finish()
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
    await this.admissions.wait()
    await Promise.allSettled([...this.pendingAcknowledgements.values()])
    await Promise.allSettled([
      ...this.sdkQueueWakeups.values(),
      ...this.terminalQueueWakeups.values(),
      ...this.loadingSessions.values(),
      ...this.hydratingSessions.values(),
      this.runtimeModelLoad,
    ])
    await Promise.allSettled(this.sdkReplyWrites())
    this.acceptedSdkReplies.clear()
    this.terminalUserInputChecks.clear()
    this.terminalUpdateChecks.clear()
    this.answeredTerminalPermissions.clear()
    this.answeredTerminalInputs.clear()
    this.backgroundTaskSyncs.clear()
    this.backgroundTaskResyncNeeded.clear()
    await Promise.all([...this.sessionCreations])
    await Promise.all([...this.lifecycleLocks.values()])
    await Promise.allSettled([...this.queueOperations.values()])
    const admissionSettlements = await Promise.allSettled(
      [...this.pendingSdkQueueAdmissions.keys()].map((id) => this.settleQueueAdmission(id)),
    )
    this.pendingSdkQueueAdmissions.clear()
    this.sdkDrainRequested.clear()
    this.terminalDrainRequested.clear()
    this.startupTerminalQueues.clear()
    this.pendingTerminalQueueSettlements.clear()
    this.pendingTerminalQueueClaims.clear()
    for (const session of this.store.list()) {
      this.backgroundTaskTracker.remove(session.id)
    }
    const disconnected = await Promise.allSettled(
      [...this.sessions.values()].map((session) => session.disconnect()),
    )
    this.sessions.clear()
    const runtimeErrors = await this.client.stop()
    this.activePrompts.clear()
    const synchronized = await Promise.allSettled([
      this.discoveryInFlight,
      this.transcriptInFlight,
    ])
    const errors = [
      ...[...disconnected, ...synchronized, ...admissionSettlements].flatMap((result) =>
        result.status === 'rejected'
          ? [
              result.reason instanceof Error
                ? result.reason
                : new Error(String(result.reason)),
            ]
          : [],
      ),
      ...runtimeErrors,
    ]
    // Sessions and the SDK are down, so settle any write they triggered. Once
    // stop() resolves no further write can land, which is what lets a caller
    // safely tear down the data directory.
    await Promise.allSettled([...this.queuedPromptRuns.values(), ...this.queueOperations.values()])
    await this.store.close()
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
        ...this.publicSession(session),
        messages: [],
      }))
  }

  listHistory(): SessionDetail[] {
    return this.store.list().map((session) => ({
      ...this.publicSession(session),
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
    if (this.stopped) return Promise.reject(new Error('The session service is stopping'))
    if (this.runtimeModels.size > 0) {
      return Promise.resolve()
    }
    return this.refreshRuntimeModels()
  }

  private refreshRuntimeModels(): Promise<void> {
    if (this.stopped) return Promise.reject(new Error('The session service is stopping'))
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
    // listModels() caches for the client's lifetime. Ask the CLI directly so
    // opening a settings panel discovers changes without restarting sessions.
    const { models } = await this.client.rpc.models.list({})
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
    const session = this.store.get(id)
    return session ? this.publicSession(session) : undefined
  }

  async openSession(id: string): Promise<SessionDetail> {
    const stored = await this.store.readAfterWrites(id)
    if (
      this.externalSessionIds.has(id) ||
      this.isTerminalRecoveryPending(id)
    ) {
      return this.publicSession(stored)
    }
    if (this.hydratedSessions.has(id)) {
      return this.publicSession(stored)
    }
    if (stored.suspended) {
      // Having nothing running is what was asked for, not evidence that the
      // session is gone. Closing it here would drop it from recovery and take
      // the conversation with it.
      return this.publicSession(stored)
    }
    if (this.store.backend(id) === 'terminal') {
      const closed = await this.store.setOpen(id, false, true)
      this.publish(closed)
      throw new Error('Terminal session is no longer available')
    }

    const inFlight = this.hydratingSessions.get(id)
    if (inFlight) {
      return this.publicSession(await inFlight)
    }
    const hydration = this.hydrateSession(id)
    this.hydratingSessions.set(id, hydration)
    try {
      return this.publicSession(await hydration)
    } finally {
      this.hydratingSessions.delete(id)
    }
  }

  async activateSession(id: string): Promise<SessionDetail> {
    this.assertTerminalQueueSettled(id)
    await this.openSession(id)
    const opened = await this.store.setOpen(id, true, true)
    this.publish(opened)
    return this.publicSession(opened)
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
    return this.publicSession(await this.runSessionCreation(() => terminalBacked
      ? this.createTerminalSession(cwd, allowAllPermissions, runtime)
      : this.createSdkSession(cwd, allowAllPermissions, runtime)))
  }

  private async createSdkSession(
    cwd: string,
    allowAllPermissions: boolean,
    runtime?: CreationRuntime,
  ): Promise<SessionDetail> {
    const sdkSession = await this.client.createSession({
      workingDirectory: cwd,
      streaming: true,
      ...runtime,
      onPermissionRequest: allowAllPermissions
        ? async () => ({ kind: this.stopped ? 'user-not-available' : 'approve-once' })
        : (request, invocation) =>
            this.requestPermission(invocation.sessionId, request),
      onUserInputRequest: (request, invocation) =>
        this.requestUserInput(invocation.sessionId, request),
      onElicitationRequest: (context) => this.requestElicitation(context),
    })
    if (this.store.get(sdkSession.sessionId) || this.sessions.has(sdkSession.sessionId)) {
      throw new Error('The provider returned an existing session identity')
    }
    this.deletedSessionIds.add(sdkSession.sessionId)
    this.pendingSessionMetadata.set(sdkSession.sessionId, [])
    let committed = false
    try {
      if (this.stopped) throw new Error('The session service is stopping')
      this.sessions.set(sdkSession.sessionId, sdkSession)
      this.hydratedSessions.add(sdkSession.sessionId)
      this.attachSession(sdkSession)

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
      committed = true
      this.deletedSessionIds.delete(sdkSession.sessionId)
      this.publish(session)
      this.flushSessionMetadata(sdkSession.sessionId)
      return session
    } catch (error) {
      if (!committed) {
        try {
          await this.disposeSdkIdentity(sdkSession.sessionId, sdkSession)
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            'Session creation failed and SDK cleanup is incomplete',
          )
        }
      }
      throw error
    } finally {
      this.pendingSessionMetadata.delete(sdkSession.sessionId)
    }
  }

  uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    return this.store.saveUpload(sessionId, filename, data)
  }

  async renameSession(id: string, title: string): Promise<SessionDetail> {
    const stored = await this.store.readAfterWrites(id)
    // A suspended session is renamed where it is: the name is ours to keep,
    // and telling a runtime about it would mean starting the one that
    // suspending put down. It is carried over whenever the session next runs.
    if (!stored.suspended && !this.suspendingSessions.has(id)) {
      if (this.externalSessionIds.has(id)) {
        await this.terminalController.rename?.(id, title)
      } else {
        const session = await this.ensureLoaded(id)
        await session.rpc.name.set({ name: title })
      }
    }
    const renamed = await this.store.renameSession(id, title)
    this.publish(renamed)
    return this.publicSession(renamed)
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
    // Join a concurrent catalog refresh before the ordered state read yields.
    const [stored, options] = await Promise.all([
      this.store.readAfterWrites(id).then((session) => this.reconcileRuntimeStatus(session)),
      this.providerRuntimeOptions('copilot'),
    ])
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
    let stored = await this.store.readAfterWrites(id)
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
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
      return this.publicSession(updated)
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
    return this.publicSession(await persistRuntime(mode))
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
    if (!latestLifecycle) {
      return stored
    }
    const status = statusFromEvents(events)
    if (status === 'waiting') {
      return stored
    }
    const reconciled = await this.store.updateIf(stored.id, (session) => {
      if (
        session.pendingPermission ||
        session.pendingUserInput ||
        session.suspended ||
        status === session.status ||
        Date.parse(latestLifecycle.timestamp) < Date.parse(session.updatedAt)
      ) {
        return false
      }
      session.status = status
      if (status !== 'running') {
        session.activity = undefined
      }
      return true
    })
    if (reconciled) {
      this.publish(reconciled)
      return reconciled
    }
    return this.store.readAfterWrites(stored.id)
  }

  /**
   * Keeps a session while giving back everything running for it.
   *
   * The conversation lives on disk, so the process holding it is the
   * expendable part. Suspending ends it and keeps the session, its id and its
   * history, which is what makes a machine full of sessions affordable.
   */
  async suspendSession(id: string): Promise<SessionDetail> {
    this.queuedDispatches.assertAvailable(id)
    return this.publicSession(await this.serializeLifecycle(id, () => this.suspendSerialized(id)))
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
      return await this.suspendClaimedSession(id, await this.store.readAfterWrites(id))
    } finally {
      this.suspendingSessions.delete(id)
    }
  }

  private async suspendClaimedSession(
    id: string,
    stored: SessionDetail,
  ): Promise<SessionDetail> {
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
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
    this.assertTerminalQueueSettled(id)
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
    return this.publicSession(await this.serializeLifecycle(id, () => this.resumeQueued(id)))
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
    const stored = await this.store.readAfterWrites(id)
    this.queuedDispatches.assertAvailable(id)
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
            ? this.drainTerminalQueue(id, true)
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
    this.queuedDispatches.assertAvailable(id)
    return this.publicSession(await this.serializeLifecycle(id, () => this.restartSerialized(id)))
  }

  private async restartSerialized(id: string): Promise<SessionDetail> {
    const stored = await this.store.readAfterWrites(id)
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
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
    this.queuedDispatches.assertAvailable(id)
    return this.publicSession(await this.serializeLifecycle(id, () => this.moveToTerminalSerialized(id)))
  }

  private async moveToTerminalSerialized(id: string): Promise<SessionDetail> {
    const stored = await this.store.readAfterWrites(id)
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
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
    this.queuedDispatches.assertAvailable(id)
    const observed = this.store.observeTranscript(id)
    try {
      return this.publicSession(await this.admissions.exclusive(id, (ownership) =>
        this.serializeLifecycle(id, async () => {
          if (ownership.joinedActivity) {
            throw Object.assign(new Error('A prompt or command was admitted while Clear waited; nothing was cleared'), { statusCode: 409 })
          }
          return this.clearSerialized(id, {
            ...observed,
            isCurrent: () => ownership.isCurrent() &&
              !this.activePrompts.has(id) && !this.drainingSessions.has(id) &&
              !(this.dispatchingSessions.get(id) || 0) && !this.suspendingSessions.has(id),
          })
        }),
      ))
    } finally {
      this.wakeDeferredQueue(id)
    }
  }

  private async clearSerialized(id: string, observed: TranscriptObservation): Promise<SessionDetail> {
    const stored = await this.store.readAfterWrites(id)
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
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
      stored.pendingPermission || stored.pendingUserInput ||
      this.drainingSessions.has(id) || this.activePrompts.has(id) ||
      (this.dispatchingSessions.get(id) || 0) > 0 ||
      !this.store.isCurrentTranscript(id, observed)
    ) {
      throw Object.assign(new Error('Conversation can only be cleared while the session is idle'), { statusCode: 409 })
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
    this.deletedSessionIds.add(replacementId)
    forgetSessionEvents(id)
    this.discoveryGeneration += 1
    this.pendingSessionMetadata.set(replacementId, [])
    let fresh: CopilotSessionLike | undefined
    let original: CopilotSessionLike | undefined
    let committed = false
    let cleared: SessionDetail | undefined
    const cleanupErrors: unknown[] = []
    const terminalBacked = this.externalSessionIds.has(id)
    const commitReplacement = async () => {
      try {
        cleared = await this.store.replaceWithClearedSession(id, replacementId, {
          ...observed,
          isCurrent: () => observed.isCurrent?.() !== false &&
            (terminalBacked || this.sessions.get(id) === original),
        })
      } catch (error) {
        if (!(error instanceof SessionReplacementCleanupError)) throw error
        cleared = error.replacement
        cleanupErrors.push(error)
      }
      committed = true
    }
    try {
      if (terminalBacked) {
        if (!this.terminalController.reset) {
          throw new Error('Terminal conversation reset is not available')
        }
        const reset = await this.terminalController.reset(
          id,
          replacementId,
          stored.cwd,
          runtime,
          commitReplacement,
        )
        if (!reset) {
          throw new Error('External terminal is no longer available')
        }
        if (!committed) {
          throw new Error('Terminal reset did not commit the replacement session')
        }
        this.externalSessionIds.delete(id)
        this.externalSessionIds.add(replacementId)
        try {
          if (this.terminalController.rename &&
            !(await this.terminalController.rename(replacementId, stored.title))) {
            throw new Error('The cleared terminal session is no longer available to rename')
          }
        } catch (error) {
          cleanupErrors.push(error)
        }
      } else {
        original = this.sessions.get(id)
        try {
          fresh = await this.client.createSession({
            sessionId: replacementId,
            workingDirectory: stored.cwd,
            streaming: true,
            model: runtime?.model,
            contextTier: runtime?.contextTier,
            onPermissionRequest: stored.runtime?.allowAllPermissions
              ? async () => ({ kind: this.stopped ? 'user-not-available' : 'approve-once' })
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
          this.sessions.set(replacementId, fresh)
          this.hydratedSessions.add(replacementId)
          this.attachSession(fresh, replacementId)
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
        await commitReplacement()
      }
      if (!cleared) throw new Error('Conversation replacement was not committed')
      this.deletedSessionIds.delete(replacementId)
      this.forgetSdkReplies(id)
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
      this.pendingTerminalQueueClaims.delete(id)
      this.startupTerminalQueues.delete(id)
      this.terminalUserInputChecks.delete(id)
      this.terminalUpdateChecks.delete(id)
      this.answeredTerminalPermissions.delete(id)
      this.answeredTerminalInputs.delete(id)
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
      this.flushSessionMetadata(replacementId)
      // Both terminal and SDK histories remain recoverable until replacement
      // commits. Cleanup failure cannot undo an already accepted clear.
      try {
        await this.disposeSdkIdentity(id, original)
        await removeCopilotSessionFiles(id)
      } catch (error) {
        cleanupErrors.push(error)
      }
      for (const error of cleanupErrors) this.publishError(replacementId, error)
      return cleared
    } catch (error) {
      if (!committed) {
        try {
          if (terminalBacked) await this.activeSessionStopper(replacementId)
          await this.disposeSdkIdentity(replacementId, fresh)
          await removeCopilotSessionFiles(replacementId)
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            `Clearing failed and replacement ${terminalBacked ? 'terminal' : 'SDK'} cleanup is incomplete`,
          )
        }
      }
      throw error
    } finally {
      this.pendingSessionMetadata.delete(replacementId)
      if (this.transcriptInFlight) {
        await this.transcriptInFlight
      }
      if (!committed) this.deletedSessionIds.delete(id)
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
    let committed = false
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
      if (this.stopped) throw new Error('The session service is stopping')
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
      committed = true
      this.externalSessionIds.add(sessionId)
      this.publish(session)
      return session
    } catch (error) {
      if (!committed) {
        this.deletedSessionIds.add(sessionId)
        try {
          await this.activeSessionStopper(sessionId)
          await removeCopilotSessionFiles(sessionId)
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            'Terminal creation failed and cleanup is incomplete',
          )
        }
      }
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
    try {
      return await this.admissions.run(sessionId, async () =>
        this.publicSession(await this.sendAdmittedMessage(sessionId, rawContent, enqueue, acknowledgedFailure)))
    } finally {
      this.wakeDeferredQueue(sessionId)
    }
  }

  private async sendAdmittedMessage(
    sessionId: string,
    rawContent: string,
    enqueue: boolean,
    acknowledgedFailure?: string,
  ): Promise<SessionDetail> {
    const content = rawContent.trim()
    if (this.stopped) throw queueConflict('The session service is stopping.')
    if (this.store.get(sessionId)?.queuedDispatch && (!enqueue || acknowledgedFailure)) {
      this.queuedDispatches.assertAvailable(sessionId)
    }
    if (!content) {
      throw new Error('Message cannot be empty')
    }
    await this.store.readAfterWrites(sessionId)
    this.assertTerminalQueueSettled(sessionId)
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
    const claim = await this.claimFailure(sessionId, content, acknowledgedFailure)
    const delivery: DeliveryBoundary = claim ?? { accepted: false }
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
          claim?.failedAt,
          delivery,
        )
      } finally {
        releaseDispatch()
      }
    } catch (error) {
      if (delivery.accepted) {
        await this.settleRecoveryResend(sessionId, content, claim, this.store.get(sessionId))
        throw this.submissionFailure(error, sessionId, claim, true)
      }
      claim?.release()
      throw this.submissionFailure(error, sessionId, claim, false)
    }
    return this.settleRecoveryResend(sessionId, content, claim, sent)
  }

  private async claimFailure(
    sessionId: string,
    submitted: string,
    acknowledged?: string,
  ): Promise<RecoveryResendClaim | undefined> {
    const outstanding = acknowledged === undefined ? undefined : this.recoveryClaims.get(acknowledged)
    if (outstanding) {
      throw new SubmissionError(
        outstanding.accepted
          ? 'That recovery was already delivered. Its acknowledgement is still pending; do not resend it.'
          : 'That recovery decision is still being dispatched. Check the conversation before trying again.',
        409,
        { sessionId: this.recoverySessionId(sessionId), failedAt: acknowledged, accepted: false },
      )
    }
    if (acknowledged !== undefined && this.claimedFailures.has(`${sessionId}:${acknowledged}`)) {
      throw Object.assign(new Error('That recovery decision is still being dispatched.'), { statusCode: 409 })
    }
    const stored = this.store.get(sessionId)?.failedPrompt
    if (acknowledged === undefined && stored?.failedAt?.startsWith('resend:') &&
      stored.content.trim() === submitted.trim()) {
      throw new SubmissionError(
        'This text belongs to an unresolved recovery. Check the conversation and use its current recovery decision before retrying.',
        409,
        { sessionId, failedAt: stored.failedAt, accepted: false },
      )
    }
    if (acknowledged !== undefined && stored?.failedAt !== acknowledged) {
      throw Object.assign(
        new Error(
          'That recovery decision has already been used. Review the current recovered prompt before sending it again.',
        ),
        { statusCode: 409 },
      )
    }
    if (!stored) {
      return undefined
    }
    const isResend =
      (acknowledged !== undefined && acknowledged === stored.failedAt) ||
      (stored.failedAt === undefined &&
        stored.content.trim() === submitted.trim())
    if (!isResend) {
      return undefined
    }
    const priorAttempt = this.store.recoveryResend(sessionId)
    if (priorAttempt) {
      if (priorAttempt.accepted) {
        this.restoreRecoveryAcknowledgement(sessionId, priorAttempt.failedAt, priorAttempt.content)
        throw new SubmissionError(
          'That recovery was already delivered. Only its saved acknowledgement will be retried; nothing was resent.',
          409, { sessionId, failedAt: priorAttempt.failedAt, accepted: false },
        )
      }
      // An attempted-delivery token is not another authorization. With no
      // durable receipt, prepare a distinct decision without sending input.
      const next = `resend:${randomUUID()}`
      const prepared = await this.store.prepareRecoveryDecision(sessionId, priorAttempt.failedAt, next)
      this.publish(prepared)
      throw new SubmissionError(
        'The earlier recovery attempt has an unresolved delivery receipt. Nothing was resent. A new decision is ready: check the conversation and terminal, then send again only if another attempt is needed.',
        409, { sessionId, failedAt: next, accepted: false }, { uncertainDelivery: true },
      )
    }
    const key = `${sessionId}:${stored.failedAt ?? 'legacy'}`
    if (this.claimedFailures.has(key)) {
      throw Object.assign(
        new Error('That recovery decision is still being dispatched.'),
        { statusCode: 409 },
      )
    }
    // Distinct from timestamp-based queue failures, including in the same
    // millisecond: this attempt's acknowledgement must not clear a later one.
    const failedAt = `resend:${randomUUID()}`
    const replacementKey = `${sessionId}:${failedAt}`
    this.claimedFailures.add(key)
    this.claimedFailures.add(replacementKey)
    const release = () => {
      this.claimedFailures.delete(key)
      this.claimedFailures.delete(replacementKey)
      this.recoveryClaims.delete(failedAt)
    }
    const claim: RecoveryResendClaim = { failedAt, accepted: false, release }
    let claimed: SessionDetail
    try {
      claimed = await this.store.claimFailedPrompt(sessionId, stored, submitted, failedAt)
    } catch (error) {
      release()
      throw error
    }
    this.recoveryClaims.set(failedAt, claim)
    try {
      this.publish(claimed)
      return claim
    } catch (error) {
      release()
      throw this.submissionFailure(error, sessionId, claim, false)
    }
  }

  private recoverySessionId(sessionId: string): string {
    let current = sessionId
    const seen = new Set<string>()
    while (this.replacedInto.has(current) && !seen.has(current)) {
      seen.add(current)
      current = this.replacedInto.get(current)!
    }
    if (this.store.get(current)) return current
    return this.store.list().find((session) => session.replacedSessionIds?.includes(sessionId))?.id ?? sessionId
  }

  private restoreRecoveryAcknowledgement(
    sessionId: string, failedAt: string, content: string, startupNative = false,
  ): void {
    if (this.recoveryClaims.has(failedAt)) return
    const claim: RecoveryResendClaim = {
      failedAt, accepted: true,
      release: () => { this.recoveryClaims.delete(failedAt) },
    }
    this.recoveryClaims.set(failedAt, claim)
    this.scheduleFailureAcknowledgement(sessionId, content, claim, startupNative)
  }

  private async recordDelivery(
    sessionId: string,
    answers: string | undefined,
    delivery: DeliveryBoundary | undefined,
  ): Promise<void> {
    if (delivery) delivery.accepted = true
    if (answers) {
      const claim = this.recoveryClaims.get(answers)
      if (claim) claim.accepted = true
      const currentId = this.recoverySessionId(sessionId)
      const current = this.store.get(currentId)
      if (current) this.publish(current)
      const accepted = await this.store.acceptRecoveryResend(currentId, answers)
      this.publish(accepted)
    }
  }

  private submissionFailure(
    error: unknown,
    sessionId: string,
    claim: RecoveryResendClaim | undefined,
    accepted: boolean,
  ): unknown {
    if (!claim && !accepted) return error
    const status = error && typeof error === 'object' ? Reflect.get(error, 'statusCode') : undefined
    const statusCode = accepted ? 409 : typeof status === 'number' && status >= 400 && status < 600 ? status : 500
    const message = accepted
      ? 'The request was accepted, but later bookkeeping failed. It was not resent. Check the conversation before sending anything else.'
      : statusCode < 500 && error instanceof Error
        ? error.message
        : 'The recovery attempt could not be completed. Check the terminal before retrying.'
    return new SubmissionError(message, statusCode, {
      sessionId: this.recoverySessionId(sessionId),
      ...(claim ? { failedAt: claim.failedAt } : {}),
      accepted,
    }, { cause: error, uncertainDelivery: accepted || isUncertainDelivery(error) })
  }

  private async settleRecoveryResend<T extends SessionDetail | undefined>(
    sessionId: string,
    submitted: string,
    claim: RecoveryResendClaim | undefined,
    delivered: T,
  ): Promise<SessionDetail | T> {
    if (!claim) return delivered
    claim.accepted = true
    try {
      const settled = await this.acknowledgeFailedPrompt(this.recoverySessionId(sessionId), submitted, claim.failedAt)
      claim.release()
      return settled ?? delivered
    } catch (error) {
      this.scheduleFailureAcknowledgement(sessionId, submitted, claim)
      throw new SubmissionError(
        'The resend was accepted, but its recovery acknowledgement did not complete. It will be retried without resending; check the conversation before sending more work.',
        409,
        { sessionId: this.recoverySessionId(sessionId), failedAt: claim.failedAt, accepted: true },
        { cause: error, uncertainDelivery: true },
      )
    }
  }

  /**
   * Keeps trying to clear a marker whose send has already been accepted.
   *
   * The durable accepted receipt keeps this token non-delivering across
   * restarts. Only clearing its marker releases the queue; this path never
   * enters dispatch.
   */
  private scheduleFailureAcknowledgement(
    sessionId: string,
    submitted: string,
    claim: RecoveryResendClaim,
    startupNative = false,
  ): void {
    const acknowledged = claim.failedAt
    const key = `${sessionId}:${acknowledged}`
    if (this.pendingAcknowledgements.has(key)) {
      return
    }
    const session = this.store.get(sessionId)
    const startupRecovery = startupNative && session?.queuedPrompts?.length
      ? this.startupTerminalQueues.has(sessionId) ? 'eligible' : 'ineligible'
      : this.awaitingAcceptedStartupRecovery(sessionId, session) ? 'eligible' : undefined
    // Kept up until it works or the service stops. Giving up after a few
    // tries left the marker holding the queue with its own resend refused,
    // and nothing to start it again once storage came back.
    const attempt = async (wait: number): Promise<void> => {
      let current = sessionId
      while (!this.stopped) {
        current = this.recoverySessionId(current)
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
          await this.admissions.run(current, () =>
            this.acknowledgeFailedPrompt(current, submitted, acknowledged, startupRecovery))
          return
        } catch (error) {
          console.warn(
            `Still could not clear the recovery marker for ${current}:`,
            error,
          )
          if (this.stopped) return
          await new Promise((resolve) => {
            // Unreferenced so a retry that is sleeping cannot hold the process
            // open after everything else has finished shutting down.
            const timer = setTimeout(() => {
              this.acknowledgementTimers.delete(timer)
              resolve(undefined)
            }, wait)
            timer.unref?.()
            this.acknowledgementTimers.set(timer, () => resolve(undefined))
          })
          // Backed off, so an outage costs one attempt a minute rather than
          // two a second.
          wait = Math.min(wait * 2, 60_000)
        }
      }
    }
    const running = attempt(500).finally(() => {
      this.pendingAcknowledgements.delete(key)
      claim.release()
    })
    this.pendingAcknowledgements.set(key, running)
  }

  private async sendAdmitted(
    sessionId: string,
    content: string,
    enqueue: boolean,
    // The failure this send answers, so a prompt that goes on the queue and
    // the marker it answers are written together rather than one after the
    // other with a crash possible in between.
    answers?: string,
    delivery?: DeliveryBoundary,
  ): Promise<SessionDetail> {
    await this.store.readAfterWrites(sessionId)
    this.assertTerminalQueueSettled(sessionId)
    if (
      this.drainingSessions.has(sessionId) ||
      this.store.get(sessionId)?.queuedDispatch
    ) {
      if (enqueue && !this.suspendingSessions.has(sessionId) &&
        !this.store.get(sessionId)?.suspended) {
        return this.enqueuePrompt(sessionId, content, false, answers)
      }
      throw queueConflict('The queue is dispatching or awaiting delivery confirmation. This message was not sent.')
    }
    if (this.admissionClosed.has(sessionId)) {
      throw Object.assign(new Error('The session is still resuming'), { statusCode: 409 })
    }
    if (
      this.terminalController.ownsStartupPrompt?.(sessionId) ||
      this.terminalAdmissionOperations.has(sessionId)
    ) {
      return this.serializeTerminalAdmission(sessionId, async () => {
        const terminalBacked = await this.terminalController.has(sessionId)
        return this.sendAdmittedWithBackend(
          sessionId,
          content,
          enqueue,
          answers,
          terminalBacked,
          true,
          delivery,
        )
      })
    }
    const terminalBacked = await this.terminalController.has(sessionId)
    return this.sendAdmittedWithBackend(
      sessionId,
      content,
      enqueue,
      answers,
      terminalBacked,
      false,
      delivery,
    )
  }

  private async sendAdmittedWithBackend(
    sessionId: string,
    content: string,
    enqueue: boolean,
    answers: string | undefined,
    terminalBacked: boolean,
    startupLocked = false,
    delivery?: DeliveryBoundary,
  ): Promise<SessionDetail> {
    if (!enqueue) {
      if (this.drainingSessions.has(sessionId)) {
        throw queueConflict('The queue is dispatching. This message was not sent.')
      }
      this.queuedDispatches.assertAvailable(sessionId)
    }
    if (this.stopped || this.deletingSessions.has(sessionId)) {
      throw queueConflict('The session is no longer available.')
    }
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
    let resolvedStartup = false
    let startupIdle = false
    let terminalWorking = false
    if (terminalBacked) {
      if (
        !startupLocked &&
        this.terminalAdmissionOperations.has(sessionId)
      ) {
        return this.serializeTerminalAdmission(sessionId, () =>
          this.sendAdmittedWithBackend(
            sessionId,
            content,
            enqueue,
            answers,
            terminalBacked,
            true,
            delivery,
          ),
        )
      }
      // A full-screen view takes the keyboard, so a prompt sent now is typed
      // into its search box: it filters a list, a stray Enter can pick from
      // it, and nothing says the prompt was never delivered. Refusing is
      // recoverable in a way that silently losing it is not.
      const pane = await this.terminalController.capture?.(sessionId)
      if (
        !startupLocked &&
        this.terminalAdmissionOperations.has(sessionId)
      ) {
        return this.serializeTerminalAdmission(sessionId, () =>
          this.sendAdmittedWithBackend(
            sessionId,
            content,
            enqueue,
            answers,
            terminalBacked,
            true,
            delivery,
          ),
        )
      }
      const ownsStartup =
        startupLocked &&
        (this.terminalController.ownsStartupPrompt?.(sessionId) ?? false)
      if (ownsStartup || (pane && isTerminalOverlay(pane))) {
        if (!startupLocked) {
          return this.serializeTerminalAdmission(sessionId, () =>
            this.sendAdmittedWithBackend(
              sessionId,
              content,
              enqueue,
              answers,
              terminalBacked,
              true,
              delivery,
            ),
          )
        }
        const canHandleStartup =
          !(pane && isTerminalSessionInUsePrompt(pane)) &&
          (ownsStartup ||
            (pane
              ? ((await this.terminalController.canHandleStartupPrompt?.(
                  sessionId,
                  pane,
                )) ?? false)
              : false))
        resolvedStartup =
          canHandleStartup &&
          ((await this.terminalController.resolveStartupPrompt?.(sessionId)) ??
            false)
        if (!resolvedStartup) {
          // Carries a status so the reason reaches the reader: an unclassified
          // failure is reported as a generic server error, which would leave
          // them no better off than the silent loss this replaces.
          throw Object.assign(
            new Error(
              pane && isTerminalSessionInUsePrompt(pane)
                ? sessionInUseMessage
                : 'The terminal is showing a full-screen view. Close it there, then send this again.',
            ),
            { statusCode: 409 },
          )
        }
        const currentPane = await this.terminalController.capture?.(sessionId)
        if (!currentPane || isTerminalOverlay(currentPane)) {
          throw Object.assign(
            new Error(
              'The terminal changed while its startup prompt was being resolved. Check it, then send this again.',
            ),
            { statusCode: 409 },
          )
        }
        startupIdle =
          (await this.terminalController.inputReady?.(sessionId)) ??
          !isTerminalAgentWorking(currentPane)
      } else if (startupLocked && pane) {
        terminalWorking = isTerminalAgentWorking(pane)
        startupIdle =
          ((await this.terminalController.inputReady?.(sessionId)) ??
            !terminalWorking) &&
          !this.terminalAdmissionDispatched.has(sessionId)
      }
    }
    const startupReady = (resolvedStartup || startupLocked) && startupIdle
    if (
      startupReady &&
      this.store.get(sessionId)?.status !== 'idle'
    ) {
      const idle = await this.store.update(sessionId, (session) => {
        session.status = 'idle'
        session.activity = undefined
      })
      this.publish(idle)
    }
    const current = await this.store.readAfterWrites(sessionId)
    this.assertTerminalQueueSettled(sessionId)
    if (current.suspended || this.suspendingSessions.has(sessionId) || this.deletingSessions.has(sessionId)) {
      throw Object.assign(new Error('The session is changing state; try again once it settles'), { statusCode: 409 })
    }
    if (terminalBacked) this.assertStartupDispatchSettled(sessionId, enqueue)
    // Startup and owner detection are awaited, so FIFO may have grown meanwhile.
    // Only the claimed failure holding that queue may be resent ahead of it.
    if (
      terminalBacked &&
      !enqueue &&
      current.queuedPrompts?.length &&
      (answers === undefined || current.failedPrompt?.failedAt !== answers)
    ) {
      throw Object.assign(
        new Error(
          'Older prompts are waiting in the queue. Wait for them to finish, or use Queue to add this message after them.',
        ),
        { statusCode: 409 },
      )
    }
    if (
      enqueue &&
      startupLocked &&
      (terminalWorking || this.terminalAdmissionDispatched.has(sessionId)) &&
      this.store.get(sessionId)?.status === 'idle'
    ) {
      const running = await this.store.update(sessionId, (session) => {
        session.status = 'running'
        session.activity = 'Working in terminal'
      })
      this.publish(running)
    }
    if (
      enqueue &&
      startupReady &&
      this.store.get(sessionId)?.queuedPrompts?.length
    ) {
      return this.enqueueTerminalPrompt(sessionId, content, false, answers, delivery)
    }
    if (
      enqueue &&
      !startupReady &&
      terminalBacked &&
      (await this.shouldEnqueueTerminalPrompt(sessionId))
    ) {
      return this.enqueueTerminalPrompt(sessionId, content, false, answers, delivery)
    }
    const nativeEnqueue = this.shouldUseNativeTerminalQueue(
      sessionId,
      enqueue && !startupReady,
    )
    const dispatchedAt = new Date().toISOString()
    if (await this.sendTerminalInput(sessionId, content, nativeEnqueue)) {
      // The terminal has it. Anything that fails from here leaves a send that
      // went out, however ordinary the failure.
      if (startupLocked && !nativeEnqueue) {
        this.terminalAdmissionDispatched.add(sessionId)
      }
      if (nativeEnqueue) {
        await this.recordDelivery(sessionId, answers, delivery)
        const queued = await this.store.update(sessionId, (session) => {
          session.activity = 'Queued in terminal'
        })
        this.publish(queued)
        return queued
      }
      if (delivery) delivery.accepted = true
      if (answers) {
        const claim = this.recoveryClaims.get(answers)
        if (claim) claim.accepted = true
      }
      // Receipt persistence may fail and release the recovery's FIFO. Install
      // its independent post-send barrier first, retaining failures for retry.
      this.pendingTerminalPromptDispatches.set(sessionId, dispatchedAt)
      const accepted = this.store.get(sessionId)
      if (accepted) this.publish(accepted)
      const delivered = await this.persistTerminalPromptDispatch(sessionId, dispatchedAt)
      await this.recordDelivery(sessionId, answers, delivery)
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
      return this.enqueuePrompt(sessionId, content, false, answers, delivery)
    }

    return this.startMessage(sessionId, content, false, undefined, answers, delivery)
  }

  private async sendTerminalInput(
    sessionId: string,
    content: string,
    enqueue: boolean,
    options?: TerminalSendOptions,
  ): Promise<boolean> {
    try {
      const sent = await this.terminalController.send(sessionId, content, enqueue, ...(options ? [options] : []))
      if (sent) this.admissions.markCommitted(sessionId)
      return sent
    } catch (error) {
      if (error && typeof error === 'object' &&
          'uncertainDelivery' in error && error.uncertainDelivery === true) {
        // The pane may have changed even though successful delivery is unknown.
        this.admissions.markCommitted(sessionId)
      }
      throw error
    }
  }

  async removeQueuedPrompt(
    sessionId: string,
    promptId: string,
    acknowledgesDispatch?: string,
  ): Promise<RemovedQueuedPrompt> {
    if (this.queuedDispatches.isActive(sessionId)) throw queueConflict('The queue is still dispatching.')
    return this.admissions.run(sessionId, () => this.serializeQueue(sessionId, async () => {
      const original = this.getSession(sessionId)?.queuedPrompts
        ?.find((prompt) => prompt.id === promptId)
      const discarded = await this.queuedDispatches.discard(sessionId, promptId, acknowledgesDispatch)
      if (discarded && original) return { session: discarded, prompt: original }
      const { session, prompt } = await this.store.removeQueuedPrompt(
        sessionId,
        promptId,
      )
      if (!prompt) {
        throw new Error('Queued prompt not found')
      }
      this.publish(session)
      return { session: this.publicSession(session), prompt }
    }))
  }

  async updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    rawContent: string,
  ): Promise<RemovedQueuedPrompt> {
    const content = await this.normalizeQueuedContent(sessionId, rawContent)
    return this.admissions.run(sessionId, () => this.serializeQueue(sessionId, async () => {
      this.queuedDispatches.assertAvailable(sessionId)
      const { session, prompt } = await this.store.updateQueuedPrompt(
        sessionId, promptId, content,
      )
      if (!prompt) throw queueConflict('Queued prompt not found')
      this.publish(session)
      return { session: this.publicSession(session), prompt }
    }))
  }

  private async normalizeQueuedContent(
    sessionId: string,
    rawContent: string,
    command = rawContent.trimStart().startsWith('/'),
  ): Promise<string> {
    let content = command ? rawContent.trim() : rawContent
    if (!content.trim()) {
      throw new Error('Message cannot be empty')
    }
    if (command && isAppOnlyQueuedCommand(content)) {
      throw queueConflict('That command is answered by this app, not the queued provider. Cancel the edit before running it.')
    }
    // Asked here rather than trusted from the browser. This is reachable
    // directly, and a client can be holding the command list of a session it
    // no longer has open -- and a command this session does not have stops the
    // drain when it reaches it, with everything behind it waiting.
    if (command) {
      if (content.length > 10_000) throw queueConflict('Queued commands cannot exceed 10000 characters.')
      const name = content.slice(1).split(/\s+/, 1)[0]
      // A catalog that cannot be read is not permission to store anything: an
      // invalid command goes back to the head of the queue after every failed
      // drain, and nothing behind it ever moves again. Better to refuse a
      // rewrite now, which the reader can repeat, than to wedge the queue.
      const known = await this.knownQueueCommand(sessionId, name).catch(
        () => undefined,
      )
      if (!known) {
        throw Object.assign(
          new Error(`This session has no /${name}`),
          { statusCode: 409 },
        )
      }
      // Written out in full. A shortcut is expanded on the way to the runtime
      // and the queue's drain expands nothing, so one stored as typed reached
      // the runtime as a command it has never heard of.
      if (name !== known) {
        content = `/${known}${content.slice(name.length + 1)}`
      }
      if (isAppOnlyQueuedCommand(content)) {
        throw queueConflict('An app-only command cannot be dispatched from this queue.')
      }
    }
    return content
  }

  async reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail> {
    return this.admissions.run(sessionId, () => this.serializeQueue(sessionId, async () => {
      this.queuedDispatches.assertAvailable(sessionId)
      const session = await this.store.reorderQueuedPrompts(sessionId, order)
      this.publish(session)
      return this.publicSession(session)
    }))
  }

  private async enqueuePrompt(
    sessionId: string,
    content: string,
    command = false,
    answers?: string,
    delivery?: DeliveryBoundary,
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
      if (delivery) delivery.accepted = true
      this.admissions.markCommitted(sessionId)
      if (this.externalSessionIds.has(sessionId)) this.terminalDrainRequested.add(sessionId)
      else this.sdkDrainRequested.add(sessionId)
      this.publish(queued)
      return queued
    })
  }

  private async enqueueTerminalPrompt(
    sessionId: string,
    content: string,
    command = false,
    answers?: string,
    delivery?: DeliveryBoundary,
  ): Promise<SessionDetail> {
    const wasIdle = this.store.get(sessionId)?.status === 'idle'
    const queued = await this.enqueuePrompt(sessionId, content, command, answers, delivery)
    if (!wasIdle) {
      return queued
    }
    await this.drainTerminalQueue(sessionId, true)
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
        this.terminalAdmissionDispatched.has(sessionId) ||
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

  private async persistTerminalPromptDispatch(
    sessionId: string,
    dispatchedAt: string,
  ): Promise<SessionDetail> {
    const delivered = await this.store.markTerminalPromptDispatched(
      sessionId, dispatchedAt, 'Sent to terminal',
    )
    if (this.pendingTerminalPromptDispatches.get(sessionId) === dispatchedAt) {
      this.pendingTerminalPromptDispatches.delete(sessionId)
    }
    return delivered
  }

  private async reconcileUntrackedTerminalDispatches(
    sessionIds: string[],
  ): Promise<void> {
    await Promise.all(
      sessionIds.map(async (sessionId) => {
        const dispatchedAt = this.store.queueDispatchAt(sessionId)
        if (
          !dispatchedAt ||
          (await this.sessionEventVersion(sessionId))
        ) {
          return
        }
        const reconciled = await this.store.clearUntrackedTerminalDispatch(
          sessionId,
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
    reservation?: QueuedPromptReservation,
    answers?: string,
    delivery?: DeliveryBoundary | QueuedDelivery,
  ): Promise<SessionDetail> {
    return this.admissions.run(sessionId, () =>
      this.startAdmittedMessage(sessionId, content, fromQueue, reservation, answers, delivery), true)
  }

  private async startAdmittedMessage(
    sessionId: string,
    content: string,
    fromQueue: boolean,
    reservation?: QueuedPromptReservation,
    answers?: string,
    delivery?: DeliveryBoundary | QueuedDelivery,
  ): Promise<SessionDetail> {
    // Anything already waiting goes first. A resume whose drain failed leaves
    // the prompt back on the queue, and a message written afterwards would
    // otherwise start straight away and run ahead of one written before it.
    if (!fromQueue && this.store.get(sessionId)?.queuedPrompts?.length) {
      const queued = await this.enqueuePrompt(sessionId, content, false, answers, delivery)
      // A drain that failed put its prompt back and left nothing running to
      // take it off again. Without this the queue stays where it is, and every
      // message written afterwards joins it rather than starting anything.
      this.wakeSdkQueue(sessionId)
      return queued
    }
    const sdkSession = await this.ensureLoaded(sessionId)
    const queuedDelivery = delivery instanceof QueuedDelivery ? delivery : undefined
    if (
      queuedDelivery?.closed || this.deletingSessions.has(sessionId) ||
      this.suspendingSessions.has(sessionId) || this.stopped ||
      (!fromQueue && this.drainingSessions.has(sessionId))
    ) {
      throw queueConflict('The session is no longer available for this dispatch.')
    }
    this.queuedDispatches.assertAvailable(sessionId, queuedDelivery?.attemptId)
    if (queuedDelivery && !sdkSession.send) {
      throw queueConflict('This SDK cannot confirm prompt acceptance. Update the runtime before dispatching queued work.')
    }
    const assistantMessageId = randomUUID()
    const updated = queuedDelivery
      ? await preparePrompt(
          this.store, sessionId, content, randomUUID(), assistantMessageId,
          (session) => {
            if (
              this.stopped || this.deletingSessions.has(sessionId) ||
              this.suspendingSessions.has(sessionId) || session.suspended
            ) throw queueConflict('The session is no longer available for this dispatch.')
            if (
              this.activePrompts.has(sessionId) || session.status === 'running' ||
              session.status === 'waiting' || session.pendingPermission || session.pendingUserInput
            ) throw queueConflict('The session is already running; queue this message instead.')
          },
          queuedDelivery,
        )
      : await this.store.beginPrompt(
          sessionId, content, assistantMessageId,
          () => !this.stopped && !this.deletingSessions.has(sessionId) &&
            !this.suspendingSessions.has(sessionId) && !this.activePrompts.has(sessionId) &&
            (fromQueue || !this.drainingSessions.has(sessionId)),
          reservation,
        )
    this.admissions.markCommitted(sessionId)
    if (reservation) {
      this.pendingSdkQueueAdmissions.set(sessionId, { assistantId: assistantMessageId, started: false })
    }
    if (this.stopped || this.deletingSessions.has(sessionId) || this.suspendingSessions.has(sessionId) ||
        this.activePrompts.has(sessionId)) {
      if (queuedDelivery) {
        throw queueConflict('The session is no longer available for this dispatch.')
      } else if (reservation) await this.settleQueueAdmission(sessionId)
      else await this.store.cancelPromptAdmission(
        sessionId, assistantMessageId, () => !this.activePrompts.has(sessionId),
      )
      throw Object.assign(new Error(this.stopped
        ? 'The session service stopped before provider dispatch; the prompt was retained'
        : 'The session changed before provider dispatch; the prompt was retained'),
      { statusCode: this.stopped ? 503 : 409 })
    }
    this.activePrompts.set(sessionId, { assistantMessageId })
    const admission = this.pendingSdkQueueAdmissions.get(sessionId)
    if (admission?.assistantId === assistantMessageId) admission.started = true
    this.publish(updated)

    // runPrompt writes to the store from its own catch and finally paths, so a
    // failure there would escape this fire-and-forget call as an unhandled
    // rejection and abort the process.
    const receipt = queuedDelivery ? acceptanceReceipt() : undefined
    const run = this.runPrompt(
      sdkSession, content, assistantMessageId, queuedDelivery, receipt,
    ).catch(
      (error: unknown) => {
        this.publishError(sessionId, error)
      },
    )
    if (queuedDelivery) {
      this.queuedPromptRuns.set(sessionId, run)
      void run.finally(() => {
        if (this.queuedPromptRuns.get(sessionId) === run) this.queuedPromptRuns.delete(sessionId)
      })
    } else {
      if (delivery) delivery.accepted = true
      await this.recordDelivery(sessionId, answers, delivery)
    }
    if (reservation) await this.settleQueueAdmission(sessionId)
    if (receipt) {
      try {
        await receipt.promise
      } finally {
        receipt.dispose()
      }
    }
    return this.store.get(sessionId) || updated
  }

  /** The full name of a command this session has, by name, shortcut or alias. */
  private async knownQueueCommand(
    sessionId: string,
    name: string,
  ): Promise<string | undefined> {
    const wanted = name.toLowerCase()
    // A lone slash names nothing. Every single-word command has an empty
    // shortcut, so an empty name matched the first of them.
    if (!wanted) {
      return undefined
    }
    const shortcut = (value: string) => {
      const parts = value.split(/[-_]/)
      return parts.length > 1
        ? parts.map((part) => part[0] || '').join('').toLowerCase()
        : ''
    }
    const commands = await this.listCommands(sessionId)
    return commands.find(
      (command) =>
        command.name.toLowerCase() === wanted ||
        shortcut(command.name) === wanted ||
        command.aliases?.some((alias) => alias.toLowerCase() === wanted),
    )?.name
  }

  async listCommands(sessionId: string): Promise<SlashCommand[]> {
    return this.admissions.run(sessionId, () => this.listAdmittedCommands(sessionId))
  }

  private async listAdmittedCommands(sessionId: string): Promise<SlashCommand[]> {
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
    this.assertTerminalRecoverySettled(sessionId)
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
    startupRecovery?: 'eligible' | 'ineligible',
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
    // Only a durable acknowledgement can release the queue. Propagate a
    // rejected transaction rather than reporting the marker as cleared.
    const pendingDispatchAt = this.pendingTerminalPromptDispatches.get(sessionId)
    if (pendingDispatchAt) {
      await this.persistTerminalPromptDispatch(sessionId, pendingDispatchAt)
    }
    if (failed.failedAt) await this.store.acceptRecoveryResend(sessionId, failed.failedAt)
    const cleared = await this.store.clearFailedPrompt(sessionId, failed.failedAt)
    this.publish(cleared)
    // The marker was holding the queue shut. Nothing else will come back to
    // it, so the prompts it was blocking are started here.
    if (cleared.queuedPrompts?.length &&
        (startupRecovery === undefined ||
          (startupRecovery === 'eligible' && this.startupTerminalQueues.has(sessionId) &&
            this.hasStartupQueueLifecycle(sessionId, cleared)))) {
      if (this.externalSessionIds.has(sessionId) || this.store.backend(sessionId) === 'terminal') {
        this.wakeTerminalQueue(sessionId)
      } else {
        this.wakeSdkQueue(sessionId)
      }
    }
    return cleared
  }

  async executeCommand(
    sessionId: string,
    rawCommand: string,
    enqueue = false,
    acknowledgedFailure?: string,
  ): Promise<SessionDetail> {
    try {
      return await this.admissions.run(sessionId, async () =>
        this.publicSession(await this.executeAdmittedCommand(sessionId, rawCommand, enqueue, acknowledgedFailure)))
    } finally {
      this.wakeDeferredQueue(sessionId)
    }
  }

  private async executeAdmittedCommand(
    sessionId: string,
    rawCommand: string,
    enqueue: boolean,
    acknowledgedFailure?: string,
  ): Promise<SessionDetail> {
    if (this.stopped) throw queueConflict('The session service is stopping.')
    this.queuedDispatches.assertAvailable(sessionId)
    const command = rawCommand.trim()
    if (!command.startsWith('/')) {
      throw new Error('Slash command must start with /')
    }
    if (!command.slice(1).split(/\s+/, 1)[0]) {
      throw new Error('Slash command name is required')
    }
    await this.store.readAfterWrites(sessionId)
    const claim = await this.claimFailure(sessionId, command, acknowledgedFailure)
    const delivery: DeliveryBoundary = claim ?? { accepted: false }
    let ran: SessionDetail
    try {
      ran = await this.runCommand(
        sessionId,
        command,
        enqueue,
        claim?.failedAt,
        false,
        delivery,
      )
    } catch (error) {
      if (delivery.accepted) {
        await this.settleRecoveryResend(sessionId, command, claim, this.store.get(sessionId))
        throw this.submissionFailure(error, sessionId, claim, true)
      }
      claim?.release()
      throw this.submissionFailure(error, sessionId, claim, false)
    }
    return this.settleRecoveryResend(sessionId, command, claim, ran)
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
    delivery?: DeliveryBoundary | QueuedDelivery,
  ): Promise<SessionDetail> {

    if (!command.startsWith('/')) {
      throw new Error('Slash command must start with /')
    }
    const body = command.slice(1)
    const name = body.split(/\s+/, 1)[0]
    if (!name) {
      throw new Error('Slash command name is required')
    }
    await this.store.readAfterWrites(sessionId)
    this.assertTerminalQueueSettled(sessionId)
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
    if (!fromQueue && this.drainingSessions.has(sessionId)) {
      throw queueConflict('The queue is dispatching a prompt. This command was not sent.')
    }
    const queuedDelivery = delivery instanceof QueuedDelivery ? delivery : undefined
    this.queuedDispatches.assertAvailable(sessionId, queuedDelivery?.attemptId)
    // Kept exactly as it was written. Splitting on whitespace and rejoining
    // with single spaces rewrote the argument, and `/cwd` carries a directory
    // that was validated before it got here: a folder whose name holds two
    // spaces became a different folder, or none at all.
    const argument = body.slice(name.length).replace(/^\s/, '')
    // A command reaches the same runtime as a message and takes just as long
    // to get there, so it holds the session for the whole of it.
    const releaseDispatch = this.holdDispatch(sessionId)
    try {
      if (
        this.terminalController.ownsStartupPrompt?.(sessionId) ||
        this.terminalAdmissionOperations.has(sessionId)
      ) {
        return await this.serializeTerminalAdmission(sessionId, async () => {
          await this.prepareTerminalCommandAdmission(sessionId)
          return this.dispatchCommand(
            sessionId,
            name,
            argument,
            enqueue,
            answers,
            fromQueue,
            delivery,
          )
        })
      }
      return await this.dispatchCommand(
        sessionId,
        name,
        argument,
        enqueue,
        answers,
        fromQueue,
        delivery,
      )
    } finally {
      releaseDispatch()
    }
  }

  private async prepareTerminalCommandAdmission(
    sessionId: string,
  ): Promise<void> {
    const pane = await this.terminalController.capture?.(sessionId)
    if (!pane) {
      return
    }
    let currentPane = pane
    const ownsStartup =
      this.terminalController.ownsStartupPrompt?.(sessionId) ?? false
    if (ownsStartup || isTerminalOverlay(currentPane)) {
      const canHandle =
        !isTerminalSessionInUsePrompt(currentPane) &&
        (ownsStartup ||
          ((await this.terminalController.canHandleStartupPrompt?.(
            sessionId,
            currentPane,
          )) ?? false))
      const resolved =
        canHandle &&
        ((await this.terminalController.resolveStartupPrompt?.(sessionId)) ??
          false)
      if (!resolved) {
        throw Object.assign(
          new Error(
            isTerminalSessionInUsePrompt(currentPane)
              ? sessionInUseMessage
              : 'The terminal is showing a full-screen view. Close it there, then run this command again.',
          ),
          { statusCode: 409 },
        )
      }
      const refreshed = await this.terminalController.capture?.(sessionId)
      if (!refreshed || isTerminalOverlay(refreshed)) {
        throw Object.assign(
          new Error(
            'The terminal changed while its startup prompt was being resolved. Check it, then run this command again.',
          ),
          { statusCode: 409 },
        )
      }
      currentPane = refreshed
    }
    const ready =
      (await this.terminalController.inputReady?.(sessionId)) ??
      !isTerminalAgentWorking(currentPane)
    const working =
      !ready || this.terminalAdmissionDispatched.has(sessionId)
    const current = this.store.get(sessionId)
    if (working && current?.status === 'idle') {
      const running = await this.store.update(sessionId, (session) => {
        session.status = 'running'
        session.activity = 'Working in terminal'
      })
      this.publish(running)
    } else if (!working && current?.status !== 'idle') {
      const idle = await this.store.update(sessionId, (session) => {
        session.status = 'idle'
        session.activity = undefined
      })
      this.publish(idle)
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
    delivery?: DeliveryBoundary | QueuedDelivery,
  ): Promise<SessionDetail> {
    const queuedDelivery =
      delivery instanceof QueuedDelivery ? delivery : undefined
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
    if (fromQueue && !commandInfo) {
      throw queueConflict(`This session has no /${name}. The queued message was not sent.`)
    }
    const canonicalCommand = `/${canonicalName}${
      argument ? ` ${argument}` : ''
    }`
    const stored = await this.store.readAfterWrites(sessionId)
    this.assertTerminalQueueSettled(sessionId)
    if (!catalog.session) this.assertStartupDispatchSettled(sessionId, enqueue)
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
        delivery,
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
    const now = await this.store.readAfterWrites(sessionId)
    this.assertTerminalQueueSettled(sessionId)
    if (now.suspended || this.suspendingSessions.has(sessionId)) {
      throw Object.assign(new Error('Resume the session before sending to it'), { statusCode: 409 })
    }
    if (this.admissionClosed.has(sessionId) || this.deletingSessions.has(sessionId)) {
      throw Object.assign(new Error('The session is changing state; try again once it settles'), { statusCode: 409 })
    }
    if (!catalog.session) this.assertStartupDispatchSettled(sessionId, enqueue)
    if (!nativeEnqueue && !enqueue && !commandInfo?.allowDuringAgentExecution) {
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
    if (!fromQueue && !catalog.session && !enqueue && now.queuedPrompts?.length &&
        (answers === undefined || now.failedPrompt?.failedAt !== answers)) {
      throw Object.assign(new Error(
        'Older prompts are waiting in the queue. Wait for them to finish, or use Queue to add this command after them.',
      ), { statusCode: 409 })
    }
    if (queuedDelivery) {
      const current = await this.store.readAfterWrites(sessionId)
      if (
        this.stopped || this.deletingSessions.has(sessionId) ||
        this.suspendingSessions.has(sessionId) || current.suspended ||
        current.status !== 'idle' || current.pendingPermission || current.pendingUserInput ||
        this.activePrompts.has(sessionId) ||
        current.queuedDispatch?.attemptId !== queuedDelivery.attemptId
      ) throw queueConflict('The session is no longer idle and available for this command.')
    }
    let terminalSent: boolean
    try {
      queuedDelivery?.submit()
      terminalSent = await this.sendTerminalInput(
        sessionId,
        canonicalCommand,
        nativeEnqueue,
        commandInfo?.allowDuringAgentExecution
          ? { allowDuringAgentExecution: true }
          : undefined,
      )
      if (!terminalSent && !catalog.session) queuedDelivery?.refuse()
    } catch (error) {
      if (queuedDelivery && terminalRefused(error)) queuedDelivery.refuse()
      throw error
    }
    if (terminalSent) {
      queuedDelivery?.accept()
      const ownsStartupDispatch = !nativeEnqueue &&
        this.terminalAdmissionOperations.has(sessionId) &&
        !this.terminalAdmissionDispatched.has(sessionId)
      if (ownsStartupDispatch) this.terminalAdmissionDispatched.add(sessionId)
      if (!queuedDelivery) await this.recordDelivery(sessionId, answers, delivery)
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
        if (ownsStartupDispatch && feedback.responseObserved && !feedback.overlayOpen) {
          this.terminalAdmissionDispatched.delete(sessionId)
        }
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
      let result: Awaited<ReturnType<typeof session.rpc.commands.enqueue>>
      try {
        queuedDelivery?.submit()
        result = await session.rpc.commands.enqueue({ command: canonicalCommand })
      } catch (error) {
        // A lost RPC result is uncertain; only an explicit refusal proves
        // that no command was accepted while Clear waited.
        this.admissions.markCommitted(sessionId)
        if (queuedDelivery && explicitlyRefused(error)) queuedDelivery.refuse()
        throw error
      }
      if (!result.queued) {
        queuedDelivery?.refuse()
        throw new Error('This session does not support command queueing')
      }
      this.admissions.markCommitted(sessionId)
      if (queuedDelivery) queuedDelivery.accept()
      else await this.recordDelivery(sessionId, answers, delivery)
    } else {
      this.admissions.markCommitted(sessionId)
      queuedDelivery?.submit()
      const result = await session.rpc.commands.invoke({
        name: canonicalName,
        input: argument,
      })
      queuedDelivery?.accept()
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
        if (fromQueue) {
          return this.startMessage(sessionId, result.prompt, true, undefined, undefined, delivery)
        }
        // Command dispatch already owns the terminal-admission slot. Re-entering
        // sendMessage here can queue behind that same slot when a stale terminal
        // owner disappeared and the command fell back to the SDK.
        return this.sendAdmittedWithBackend(
          sessionId, result.prompt, busy, answers, false, false, delivery,
        )
      }
      if (!queuedDelivery) await this.recordDelivery(sessionId, answers, delivery)
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
    requireObservation = false,
  ): Promise<{ notice: string; startedTurn: boolean; overlayOpen: boolean; responseObserved: boolean }> {
    if (before === undefined || !this.terminalController.capture) {
      if (requireObservation) {
        throw new Error('Queued command feedback is unavailable; waiting for a readable terminal')
      }
      return { notice: command, startedTurn: false, overlayOpen: false, responseObserved: false }
    }
    let previous: string | undefined
    let consecutiveReadable = 0
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      const after = await this.terminalController.capture(sessionId)
      if (!after?.trim()) {
        consecutiveReadable = 0
        previous = undefined
        continue
      }
      consecutiveReadable += 1
      if (isTerminalOverlay(after)) {
        // The view takes the keyboard: anything sent now lands in its search
        // box instead of the composer, so the terminal counts as held.
        return {
          notice: `${command}\n\nOpened an interactive view in the terminal. Continue there; it cannot be shown here.`,
          startedTurn: false,
          overlayOpen: true,
          responseObserved: false,
        }
      }
      // The command started a turn, so anything appearing now is the agent
      // writing rather than the command answering.
      if (isTerminalAgentWorking(after)) {
        return { notice: command, startedTurn: true, overlayOpen: false, responseObserved: false }
      }
      const output = terminalCommandOutput(before, after, command)
      // A response can be captured mid-paint, so report it only once it stops
      // growing; otherwise a multi-line response is cut short.
      if (output && output === previous) {
        return {
          notice: `${command}\n\n${output}`,
          startedTurn: false,
          overlayOpen: false,
          responseObserved: true,
        }
      }
      previous = output
    }
    if (requireObservation && consecutiveReadable < 2) {
      throw new Error('Queued command feedback is unavailable; waiting for a readable terminal')
    }
    return {
      notice: previous ? `${command}\n\n${previous}` : command,
      startedTurn: false,
      overlayOpen: false,
      responseObserved: false,
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
      this.queuedPromptStops.get(sessionId)?.()
      await this.admissions.wait(sessionId)
      await Promise.allSettled(this.sdkReplyWrites(sessionId))
      await this.queueOperations.get(sessionId)?.catch(() => undefined)
      await this.queuedPromptRuns.get(sessionId)?.catch(() => undefined)
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
      this.pendingSdkQueueAdmissions.delete(sessionId)
      this.forgetSdkReplies(sessionId)
      this.hydratedSessions.delete(sessionId)
      this.loadingSessions.delete(sessionId)
      this.hydratingSessions.delete(sessionId)
      this.activePrompts.delete(sessionId)
      this.drainingSessions.delete(sessionId)
      this.queueOperations.delete(sessionId)
      this.pendingTerminalQueueSettlements.delete(sessionId)
      this.pendingTerminalQueueClaims.delete(sessionId)
      this.startupTerminalQueues.delete(sessionId)
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

  private sdkReplyWrites(sessionId?: string): Promise<SessionDetail>[] {
    return [...this.acceptedSdkReplies.values()].flatMap((reply) =>
      reply.completion && (!sessionId || reply.sessionId === sessionId)
        ? [reply.completion]
        : [],
    )
  }

  private forgetSdkReplies(sessionId: string): void {
    for (const [requestId, reply] of this.acceptedSdkReplies) {
      if (reply.sessionId === sessionId) {
        this.acceptedSdkReplies.delete(requestId)
      }
    }
  }

  private sdkInputChoice(
    input: UserInputReplyInput,
    kind: 'input' | 'elicitation',
  ): SdkReplyChoice {
    const action = input.action || 'accept'
    return kind === 'elicitation'
      ? {
          kind,
          response: action === 'accept'
            ? { action, content: input.values }
            : { action },
        }
      : {
          kind,
          action,
          response: { answer: input.answer.trim(), wasFreeform: input.wasFreeform },
        }
  }

  private settleSdkReply(
    sessionId: string,
    requestId: string,
    choice: SdkReplyChoice,
  ): Promise<SessionDetail> {
    const accepted = this.acceptedSdkReplies.get(requestId)!
    if (accepted.sessionId !== sessionId || !isDeepStrictEqual(accepted.choice, choice)) {
      throw Object.assign(new Error(
        'A different reply was already accepted. Retry the original reply to finish saving it.',
      ), { statusCode: 409 })
    }
    if (accepted.completion) return accepted.completion
    let settled = false
    const completion = this.store.clearPendingRequest(
      sessionId,
      choice.kind === 'permission' ? 'pendingPermission' : 'pendingUserInput',
      requestId,
      (stored) => {
        // Completion can be admitted while this confirmation is waiting to write.
        if (stored.status === 'idle' || stored.status === 'error') {
          return { status: stored.status, activity: stored.activity }
        }
        const current = this.activePrompts.get(sessionId)
        if (!current) return { status: 'idle' }
        return {
          status: 'running',
          activity: current.assistantMessageId === accepted.promptId && stored.status === 'waiting'
            ? 'Continuing'
            : stored.activity,
        }
      },
    ).then((updated) => {
      settled = true
      if (this.acceptedSdkReplies.get(requestId) === accepted) {
        this.acceptedSdkReplies.delete(requestId)
      }
      if (!this.stopped && !this.deletingSessions.has(sessionId) && this.store.get(sessionId)) {
        this.publish(updated)
      }
      return updated
    }, (error: unknown) => {
      throw Object.assign(new Error(
        `The reply was accepted, but its confirmation could not be saved: ${
          error instanceof Error ? error.message : String(error)
        }. Retry the same reply; it will not be sent to the agent again.`,
        { cause: error },
      ), { statusCode: 503 })
    }).finally(() => {
      accepted.completion = undefined
      if (settled) this.wakeSdkQueue(sessionId)
    })
    accepted.completion = completion
    return completion
  }

  private acceptSdkReply(
    sessionId: string,
    requestId: string,
    choice: SdkReplyChoice,
    resolve: () => void,
  ): Promise<SessionDetail> {
    // A provider resolution cannot be rolled back with a refused state write.
    this.acceptedSdkReplies.set(requestId, {
      sessionId,
      choice: structuredClone(choice),
      promptId: this.activePrompts.get(sessionId)?.assistantMessageId,
    })
    resolve()
    return this.settleSdkReply(sessionId, requestId, choice)
  }

  async replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail> {
    return this.publicSession(await this.replyPermissionInternal(sessionId, requestId, optionId))
  }

  private async replyPermissionInternal(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail> {
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      throw new Error('Session is no longer available')
    }
    if (this.acceptedSdkReplies.has(requestId)) {
      return this.settleSdkReply(sessionId, requestId, { kind: 'permission', optionId })
    }
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
      return this.acceptSdkReply(
        sessionId, requestId, { kind: 'permission', optionId },
        () => sdkPending.resolve(result),
      )
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
    const updated = await this.store.clearPendingRequest(
      sessionId, 'pendingPermission', requestId, continuation,
    )
    this.publish(updated)
    return this.publicSession(updated)
  }

  async replyUserInput(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    return this.publicSession(await this.replyUserInputInternal(sessionId, requestId, input))
  }

  private async replyUserInputInternal(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      throw new Error('Session is no longer available')
    }
    const accepted = this.acceptedSdkReplies.get(requestId)
    if (accepted) {
      if (accepted.choice.kind === 'permission') {
        throw new Error('User input request is no longer pending')
      }
      return this.settleSdkReply(
        sessionId, requestId, this.sdkInputChoice(input, accepted.choice.kind),
      )
    }
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
      }
      this.elicitations.delete(requestId)
      return this.acceptSdkReply(
        sessionId, requestId, this.sdkInputChoice(input, 'elicitation'),
        () => sdkElicitation.resolve(action === 'accept'
          ? { action, content: input.values }
          : { action }),
      )
    }
    if (action !== 'accept') {
      if (requestId.startsWith('persisted-user-input:')) {
        const toolCallId = requestId.slice('persisted-user-input:'.length)
        if (
          (await this.terminalController.has(sessionId)) &&
          !(await this.isToolCallComplete(sessionId, toolCallId))
        ) {
          const dismissed =
            request.form &&
            (await this.terminalController.dismissUserInput?.(
              sessionId,
              {
                question: request.question,
                fields: request.form.fields.map((field) => field.title),
              },
              action,
            ))
          // Hiding the card cannot release the terminal's keyboard. Keep the
          // question actionable unless the owning CLI confirms it has ended.
          if (
            !dismissed ||
            !(await this.waitForToolCompletion(sessionId, toolCallId))
          ) {
            throw Object.assign(
              new Error(
                'The agent is still showing its prompt, so it was not dismissed. Try again.',
              ),
              { statusCode: 409 },
            )
          }
        }
        this.answeredPersistedInputs.set(sessionId, {
          requestId,
          expiresAt: Date.now() + 60_000,
        })
        const cleared = await this.store.clearPendingRequest(
          sessionId, 'pendingUserInput', requestId, { status: 'idle' },
        )
        this.publish(cleared)
        return this.publicSession(cleared)
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
      return this.acceptSdkReply(
        sessionId, requestId, this.sdkInputChoice(input, 'input'),
        () => sdkPending.resolve({ answer, wasFreeform: input.wasFreeform }),
      )
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
        const settled = await this.store.clearPendingRequest(
          sessionId, 'pendingUserInput', requestId,
        )
        this.publish(settled)
        return this.publicSession(settled)
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
          const submitted = await this.store.clearPendingRequest(
            sessionId, 'pendingUserInput', requestId, { status: 'running', activity: 'Continuing' },
          )
          this.publish(submitted)
          return this.publicSession(submitted)
        }
        if (filled) {
          const answeredSession = await this.store.clearPendingRequest(
            sessionId,
            'pendingUserInput',
            requestId,
            { status: 'running', activity: 'Continuing' },
          )
          this.publish(answeredSession)
          return this.publicSession(answeredSession)
        }
      }
      this.queuedDispatches.assertAvailable(sessionId)
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
          throw Object.assign(
            new Error(
              'The agent is still showing its prompt, so the answer was not sent. Try again.',
            ),
            { statusCode: 409 },
          )
        }
      }
      const cleared = await this.store.clearPendingRequest(
        sessionId, 'pendingUserInput', requestId, { status: 'idle' },
      )
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
    const updated = await this.store.clearPendingRequest(
      sessionId, 'pendingUserInput', requestId, continuation,
    )
    this.publish(updated)
    return this.publicSession(updated)
  }

  private async ensureLoaded(sessionId: string): Promise<CopilotSessionLike> {
    if (this.stopped || this.deletedSessionIds.has(sessionId)) {
      throw new Error('Session is no longer available')
    }
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
      if (this.loadingSessions.get(sessionId) === loading) this.loadingSessions.delete(sessionId)
    }
  }

  private async attachSdkSession(sessionId: string): Promise<CopilotSessionLike> {
    this.assertTerminalQueueSettled(sessionId)
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
          ? async () => ({ kind: this.stopped ? 'user-not-available' : 'approve-once' })
          : (request, invocation) =>
              this.requestPermission(invocation.sessionId, request),
        onUserInputRequest: (request, invocation) =>
          this.requestUserInput(invocation.sessionId, request),
        onElicitationRequest: (context) => this.requestElicitation(context),
        suppressResumeEvent: true,
      })
    } catch (error) {
      if (this.stopped || stored.messages.length > 0 || !isMissingSessionError(error)) {
        throw error
      }
      sdkSession = await this.client.createSession({
        sessionId,
        workingDirectory: stored.cwd,
        streaming: true,
        onPermissionRequest: stored.runtime?.allowAllPermissions
          ? async () => ({ kind: this.stopped ? 'user-not-available' : 'approve-once' })
          : (request, invocation) =>
              this.requestPermission(invocation.sessionId, request),
        onUserInputRequest: (request, invocation) =>
          this.requestUserInput(invocation.sessionId, request),
        onElicitationRequest: (context) => this.requestElicitation(context),
      })
    }
    if (this.stopped || this.deletedSessionIds.has(sessionId) || !this.store.get(sessionId)) {
      await sdkSession.disconnect()
      throw new Error('Session is no longer available')
    }
    const current = this.sessions.get(sessionId)
    if (current && current !== sdkSession) {
      await sdkSession.disconnect()
      return current
    }
    this.sessions.set(sessionId, sdkSession)
    this.attachSession(sdkSession, sessionId)
    return sdkSession
  }

  private async recoverTerminalSessions(): Promise<number> {
    const states = this.terminalRecoveryStates
    if (!states || this.stopped) return 0
    const recovered = await Promise.all(
      [...states]
        .filter(([, state]) => state === 'pending')
        .map(([id]) => {
          if (!this.admissions.canEnter(id)) return 0
          return this.admissions.run(id, () => this.serializeLifecycle(id, async () => {
            const result = await this.recoverTerminalSession(id)
            if (result === 'deferred' || this.stopped) return 0
            if (result === 'created' || result === 'existing') {
              await this.reconcileUntrackedTerminalDispatches([id])
            }
            states.set(id, 'settled')
            return result === 'created' ? 1 : 0
          }), true)
        }),
    )
    return recovered.reduce<number>((total, count) => total + count, 0)
  }

  private async recoverTerminalSession(id: string): Promise<TerminalRecoveryResult> {
    const create = this.terminalController.create?.bind(this.terminalController)
    if (this.stopped) return 'deferred'
    if (!create || !this.store.shouldRecoverTerminalSession(id)) return 'skipped'
    await this.store.readAfterWrites(id)
    if (this.stopped) return 'deferred'
    if (!this.store.shouldRecoverTerminalSession(id)) return 'skipped'
    let exists: boolean
    try {
      exists = await this.terminalController.has(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.publishError(
        id,
        new Error(`Terminal ownership probe deferred: ${message}`, { cause: error }),
      )
      return 'deferred'
    }
    if (this.stopped) return 'deferred'
    if (!this.store.shouldRecoverTerminalSession(id)) return 'skipped'
    if (exists) {
      this.externalSessionIds.add(id)
      return 'existing'
    }
    // Configuration and eligibility may have changed while ownership was read.
    const session = await this.store.readAfterWrites(id)
    if (this.stopped) return 'deferred'
    if (!this.store.shouldRecoverTerminalSession(id)) return 'skipped'
    // The startup pump needs a positive owner, even if recovery cleanup has
    // already removed its startup marker. A FIFO alone cannot launch one.
    if (this.startupTerminalQueues.has(id) || session.queuedPrompts?.length) {
      if (session.isOpen) this.publish(await this.store.setOpen(id, false))
      return 'deferred'
    }
    this.launchingTerminalSessionIds.add(id)
    this.discoveryGeneration += 1
    try {
      try {
        await create(
          id,
          session.cwd,
          session.title,
          session.runtime?.allowAllPermissions ?? true,
          session.runtime,
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        try {
          if (this.store.get(id)) {
            await this.store.setOpen(id, false, true)
            const failed = await this.store.update(id, (stored) => {
              stored.status = 'error'
              stored.activity = 'Boot recovery failed'
            })
            this.publish(failed)
          }
        } finally {
          this.publishError(
            id,
            new Error(`Unable to recover terminal session: ${message}`),
          )
        }
        return 'skipped'
      }
      this.externalSessionIds.add(id)
      const restored = await this.store.update(id, (stored) => {
        stored.status = 'idle'
        stored.activity = undefined
      })
      this.publish(restored)
      return 'created'
    } finally {
      this.launchingTerminalSessionIds.delete(id)
      this.discoveryGeneration += 1
    }
  }

  private async hydrateSession(sessionId: string): Promise<SessionDetail> {
    const observed = this.observeTranscript(sessionId)
    if (!this.store.isCurrentTranscript(sessionId, observed)) return this.store.readAfterWrites(sessionId)
    const session = await this.ensureLoaded(sessionId)
    const hydrated = await this.store.replaceMessages(
      sessionId,
      messagesFromHistory(await session.getEvents()),
      observed,
    )
    if (!hydrated || !this.store.isCurrentTranscript(sessionId, observed)) {
      return this.store.readAfterWrites(sessionId)
    }
    this.hydratedSessions.add(sessionId)
    this.publish(hydrated)
    return hydrated
  }

  private async discoverTerminalSessions(): Promise<DiscoveredSession[]> {
    try {
      return await this.activeSessionFinder()
    } catch (error) {
      throw new TerminalDiscoveryError(error)
    }
  }

  private async discoverSessions(): Promise<boolean> {
    if (this.stopped) return false
    this.nativeStartupDiscoveryReady = false
    let sessions: SessionMetadata[]
    let activeSessions: DiscoveredSession[]
    let generation: number
    while (true) {
      // A provider may list a new session before createSession() has returned
      // its ID. Do not discover it before its identity write and cleanup settle.
      while (this.sessionCreations.size) {
        await Promise.all([...this.sessionCreations])
      }
      if (this.stopped || this.lifecycleLocks.size) return false
      generation = this.discoveryGeneration
      const discovery = await Promise.allSettled([
        this.client.listSessions(),
        this.discoverTerminalSessions(),
      ])
      // Terminal uncertainty may be deferred, but an independent SDK listing
      // failure must still fail startup even when both probes reject.
      if (discovery[0].status === 'rejected') {
        throw discovery[0].reason
      }
      if (discovery[1].status === 'rejected') {
        throw discovery[1].reason
      }
      sessions = discovery[0].value
      activeSessions = discovery[1].value
      if (this.stopped) return false
      if (generation === this.discoveryGeneration) {
        break
      }
    }
    const isCurrent = () =>
      !this.stopped &&
      generation === this.discoveryGeneration &&
      this.sessionCreations.size === 0 &&
      this.lifecycleLocks.size === 0
    if (!isCurrent()) return false
    const storedBeforeDiscovery = this.store.list()
    const excluded = (id: string) =>
      this.deletedSessionIds.has(id) || this.store.isRetiredSession(id)
    activeSessions = activeSessions.filter((session) => !excluded(session.id))
    const storedIds = new Set(storedBeforeDiscovery.map((session) => session.id))
    const previouslyExternal = this.externalSessionIds
    this.externalSessionIds = new Set(
      [
        ...activeSessions.map((session) => session.id),
        ...this.launchingTerminalSessionIds,
      ],
    )
    await this.clearUpdateNoticeForExited(previouslyExternal, isCurrent)
    if (!isCurrent()) return false
    const indexedSessions = sessions.flatMap((session) => {
      if (excluded(session.sessionId)) {
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
              !excluded(session.id) &&
              !indexedIds.has(session.id) && !storedIds.has(session.id),
          )
          .map((session) => ({
            ...session,
            title: path.basename(session.cwd) || session.title,
          })),
      ],
      isCurrent,
    )
    if (!isCurrent()) return false
    await this.store.syncBackends(
      activeSessions.map((session) => session.id),
      indexedSessions.map((session) => session.id),
      isCurrent,
    )
    if (!isCurrent()) return false
    const renameTerminal = this.terminalController.rename?.bind(
      this.terminalController,
    )
    if (renameTerminal) {
      await Promise.all(
        activeSessions.map(async (session) => {
          if (!isCurrent()) return
          const currentTitle = this.store.get(session.id)?.title
          if (currentTitle) {
            await renameTerminal(session.id, currentTitle)
              .catch((error: unknown) => this.publishError(session.id, error))
          }
        }),
      )
    }
    if (!isCurrent()) return false
    await this.store.syncOpen([
      ...this.externalSessionIds,
      ...[...this.sessions.keys()].filter((id) => !excluded(id)),
      ...storedBeforeDiscovery
        .filter((session) =>
          this.terminalController.create &&
          session.isOpen &&
          this.isTerminalRecoveryPending(session.id) &&
          this.store.shouldRecoverTerminalSession(session.id),
        )
        .map((session) => session.id),
    ], isCurrent)
    this.nativeStartupDiscoveryReady = isCurrent()
    return this.nativeStartupDiscoveryReady
  }

  refreshDiscovery(): Promise<void> {
    if (this.discoveryInFlight) {
      return this.discoveryInFlight
    }
    const refresh = this.discoverSessions()
      .then(async (ready) => {
        if (ready) await this.finishStartupRecovery()
      })
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
    if (this.stopped) return
    const sessionIds = new Set([
      ...this.externalSessionIds,
      ...this.sessions.keys(),
      ...this.pendingTerminalPromptDispatches.keys(),
      ...this.pendingTerminalQueueSettlements.keys(),
      ...this.pendingTerminalQueueClaims.keys(),
    ])
    await Promise.all(
      [...sessionIds].map(async (sessionId) => {
        if (this.isTerminalRecoveryPending(sessionId)) return
        const pendingDispatchAt = this.pendingTerminalPromptDispatches.get(sessionId)
        if (pendingDispatchAt) {
          const current = this.store.get(sessionId)
          if (!current || current.suspended || this.deletedSessionIds.has(sessionId)) {
            this.pendingTerminalPromptDispatches.delete(sessionId)
          } else {
            if (!this.admissions.canEnter(sessionId)) return
            await this.admissions.run(sessionId, async () => {
              const delivered = await this.persistTerminalPromptDispatch(sessionId, pendingDispatchAt)
              this.publish(delivered)
            })
          }
        }
        const retry = this.pendingTerminalQueueClaims.get(sessionId)
        if (
          this.pendingTerminalQueueSettlements.has(sessionId) ||
          (retry && Date.now() >= retry.retryAt)
        ) {
          await this.drainTerminalQueue(sessionId)
        }
        if (
          this.stopped ||
          this.activePrompts.has(sessionId) ||
          this.deletedSessionIds.has(sessionId) ||
          !this.store.get(sessionId)
        ) {
          return
        }
        const observed = this.observeTranscript(sessionId)
        if (!this.store.isCurrentTranscript(sessionId, observed)) return
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
        if (!this.store.isCurrentTranscript(sessionId, observed)) return
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
        const historyMessages = messagesFromHistory(events)
        const eventUserInput = pendingUserInputFromEvents(events)
        const external = this.externalSessionIds.has(sessionId)
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
        let status = statusFromEvents(events)
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
        const activity = historyMessages
          .findLast(
            (message) =>
              message.role === 'activity' &&
              message.activityStatus === 'running',
          )
          ?.content.split('\n', 1)[0]
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
          (session) => [
            ...historyMessages,
            ...session.messages.filter((message) => message.role === 'notice'),
          ].sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
          status,
          activity,
          (session) => runtimeInfoFromEvents(events, session.runtime, this.modelPromptLimits),
          (session) => workingDirectoryFromEvents(events, session.cwd),
          contextCwd,
          (session) => {
            const storedUserInput =
              !external || session.pendingUserInput?.requestId.startsWith('terminal:')
                ? session.pendingUserInput
                : undefined
            return storedUserInput || eventUserInput || null
          },
          queueDispatchAt,
          observed,
        )
        if (!updated || !this.store.isCurrentTranscript(sessionId, observed)) return
        this.eventLogFingerprints.set(sessionId, fingerprint)
        this.eventLogVersions.set(sessionId, version)
        if (this.liveTranscriptWatermarks.get(sessionId) === watermark) {
          this.liveTranscriptWatermarks.delete(sessionId)
        }
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
    isCurrent: () => boolean = () => true,
  ): Promise<void> {
    for (const sessionId of previouslyExternal) {
      if (!isCurrent()) return
      if (this.externalSessionIds.has(sessionId) || this.isTerminalRecoveryPending(sessionId)) {
        continue
      }
      this.terminalUpdateChecks.delete(sessionId)
      if (!this.store.get(sessionId)) {
        continue
      }
      const updated = await this.store.updateIf(sessionId, (session) => {
        if (!isCurrent() || this.isTerminalRecoveryPending(sessionId)) return false
        if (session.runtime?.updateAvailable === undefined) {
          return false
        }
        session.runtime = { ...session.runtime, updateAvailable: undefined }
        return true
      })
      if (updated) this.publish(updated)
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
    try {
      const updated = await this.store.updateIf(sessionId, (session) => {
        if (session.runtime?.updateAvailable === updateAvailable) {
          return false
        }
        session.runtime = { ...session.runtime, updateAvailable }
        return true
      })
      if (updated) this.publish(updated)
    } catch (error) {
      if (this.terminalUpdateChecks.get(sessionId) === now) {
        this.terminalUpdateChecks.delete(sessionId)
      }
      throw error
    }
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
    const observed = this.observeTranscript(sessionId)
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
    const updated = await this.store.updateTranscriptIfCurrent(sessionId, observed, (session) => {
      if (session.pendingUserInput || session.pendingPermission) {
        return false
      }
      session.pendingUserInput = pending
      session.status = 'waiting'
      session.activity = pending.question
      return true
    })
    if (updated) this.publish(updated)
  }

  private observeTranscript(sessionId: string): TranscriptObservation {
    return this.store.observeTranscript(sessionId, () =>
      !this.stopped && !this.activePrompts.has(sessionId) &&
      !this.deletedSessionIds.has(sessionId) && !this.admissions.protectsTranscript(sessionId))
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
    if (!metadata || this.deletedSessionIds.has(sessionId)) {
      return
    }
    if (!this.store.get(sessionId)) {
      return
    }
    const updated = await this.store.syncWorkspaceMetadata(sessionId, metadata)
    this.workspaceVersions.set(sessionId, version)
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

  private attachSession(
    session: CopilotSessionLike,
    sessionId = session.sessionId,
  ): void {
    session.on((event) => {
      if (
        this.sessions.get(sessionId) !== session ||
        (this.deletedSessionIds.has(sessionId) &&
          !this.pendingSessionMetadata.has(sessionId))
      ) {
        return
      }
      this.handleSessionEvent(sessionId, event)
    })
  }

  private flushSessionMetadata(sessionId: string): void {
    const events = this.pendingSessionMetadata.get(sessionId)
    this.pendingSessionMetadata.delete(sessionId)
    if (!events?.length) {
      return
    }
    const exists = Boolean(this.store.get(sessionId))
    for (const event of events) {
      try {
        this.handleSessionMetadata(sessionId, event, exists)
      } catch (error) {
        this.publishError(sessionId, error)
      }
    }
  }

  private handleSessionMetadata(
    sessionId: string,
    event: SessionEvent,
    exists: boolean,
  ): void {
    if (
      this.deletingSessions.has(sessionId) ||
      (event.type !== 'session.context_changed' &&
        event.type !== 'session.title_changed' &&
        !runtimeEventTypes.has(event.type))
    ) {
      return
    }
    // Registering an SDK object does not admit its store identity. In particular,
    // clear configures the new runtime before queuing the replacement. Keep only
    // metadata here until that operation succeeds, without changing RPC ordering
    // or allowing an optional metadata write to change the lifecycle's outcome.
    const pending = this.pendingSessionMetadata.get(sessionId)
    if (pending) {
      pending.push(event)
      return
    }
    if (!exists) {
      return
    }

    if (
      event.type === 'session.context_changed' &&
      !eventAgentId(event)
    ) {
      const cwd = event.data.cwd?.trim()
      if (cwd) {
        void this.store
          .updateWorkingDirectory(sessionId, cwd, event.timestamp)
          .then((session) => this.publish(session))
          .catch((error: unknown) => this.publishError(sessionId, error))
      }
      return
    }

    if (
      event.type === 'session.title_changed' &&
      !eventAgentId(event)
    ) {
      const title = event.data.title.trim()
      if (title) {
        void this.store
          .updateAutomaticTitle(sessionId, title, event.timestamp)
          .then((session) => this.publish(session))
          .catch((error: unknown) => this.publishError(sessionId, error))
      }
      return
    }

    if (runtimeEventTypes.has(event.type)) {
      void this.store
        .updateIf(sessionId, (session) => {
          const runtime = runtimeInfoFromEvents(
            [event],
            session.runtime,
            this.modelPromptLimits,
            false,
          )
          if (!runtime || runtimeInfoMatches(session.runtime, runtime)) {
            return false
          }
          session.runtime = runtime
          return true
        })
        .then((session) => {
          if (session) this.publish(session)
        })
        .catch((error: unknown) => this.publishError(sessionId, error))
    }
  }

  private handleSessionEvent(sessionId: string, event: SessionEvent): void {
    const activePrompt = this.activePrompts.get(sessionId)
    const stored = this.store.get(sessionId)
    this.rememberLiveActivityEvent(sessionId, event)
    this.handleSessionMetadata(sessionId, event, Boolean(stored))

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
      if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
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
      if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
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
    delivery?: QueuedDelivery,
    receipt?: ReturnType<typeof acceptanceReceipt>,
  ): Promise<void> {
    const sessionId = sdkSession.sessionId
    try {
      if (this.stopped) return
      const response = delivery && receipt
        ? await queuedSdkPrompt(sdkSession, content, delivery, receipt, (stop) => {
            this.queuedPromptStops.set(sessionId, stop)
            return () => {
              if (this.queuedPromptStops.get(sessionId) === stop) this.queuedPromptStops.delete(sessionId)
            }
          })
        : await sdkSession.sendAndWait(content, 60 * 60 * 1000)
      if (response?.timestamp) {
        this.liveTranscriptWatermarks.set(sessionId, response.timestamp)
      }
      if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
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
      const updated = await this.store.updateIf(sessionId, (session) => {
        if (this.activePrompts.get(sessionId)?.assistantMessageId !== assistantMessageId) return false
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
        return true
      })
      if (updated) this.publish(updated)
    } catch (error) {
      receipt?.reject(error)
      if (delivery && !delivery.accepted &&
        (!delivery.submitted || delivery.refused || explicitlyRefused(error))) {
        return
      }
      if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
      const message = error instanceof Error ? error.message : String(error)
      const updated = await this.store.updateIf(sessionId, (session) => {
        if (this.activePrompts.get(sessionId)?.assistantMessageId !== assistantMessageId) return false
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
        return true
      })
      if (updated) {
        this.publish(updated)
        this.publishError(sessionId, new Error(message))
      }
    } finally {
      if (this.activePrompts.get(sessionId)?.assistantMessageId === assistantMessageId) {
        this.activePrompts.delete(sessionId)
        if (!delivery || delivery.accepted) this.wakeSdkQueue(sessionId)
      }
    }
  }

  private async settleQueueAdmission(sessionId: string): Promise<SessionDetail | undefined> {
    const pending = this.pendingSdkQueueAdmissions.get(sessionId)
    if (!pending) return
    if (pending.completion) return pending.completion
    const completion = this.store.settleSdkQueueAdmission(
      sessionId, pending.assistantId, pending.started, () => !this.activePrompts.has(sessionId),
    ).then((session) => {
      if (this.pendingSdkQueueAdmissions.get(sessionId) === pending) {
        this.pendingSdkQueueAdmissions.delete(sessionId)
      }
      this.publish(session)
      return session
    }).finally(() => { pending.completion = undefined })
    pending.completion = completion
    return completion
  }

  private wakeDeferredQueue(sessionId: string): void {
    const session = this.store.get(sessionId)
    if (this.stopped || !session) return
    if (this.externalSessionIds.has(sessionId) && session.status === 'idle' &&
        this.terminalDrainRequested.has(sessionId)) {
      this.wakeTerminalQueue(sessionId)
    } else if (!this.externalSessionIds.has(sessionId) && this.sdkDrainRequested.has(sessionId)) {
      this.wakeSdkQueue(sessionId)
    }
  }

  private wakeSdkQueue(sessionId: string): void {
    if (this.stopped || this.deletingSessions.has(sessionId)) return
    this.sdkDrainRequested.add(sessionId)
    if (!this.admissions.canEnter(sessionId)) return
    if (this.drainingSessions.has(sessionId) || this.sdkQueueWakeups.has(sessionId)) return
    const waking = Promise.resolve().then(async () => {
      if (!this.stopped) await this.drainSdkQueue(sessionId)
    }).catch((error: unknown) => this.publishError(sessionId, error)).finally(() => {
      this.sdkQueueWakeups.delete(sessionId)
      if (this.sdkDrainRequested.has(sessionId)) this.wakeSdkQueue(sessionId)
    })
    this.sdkQueueWakeups.set(sessionId, waking)
  }

  private wakeTerminalQueue(sessionId: string): void {
    if (this.stopped || this.deletingSessions.has(sessionId)) return
    this.terminalDrainRequested.add(sessionId)
    if (!this.admissions.canEnter(sessionId)) return
    if (this.drainingSessions.has(sessionId) || this.terminalQueueWakeups.has(sessionId)) return
    const waking = Promise.resolve().then(async () => {
      this.terminalDrainRequested.delete(sessionId)
      if (!this.stopped) {
        await this.drainTerminalQueue(sessionId)
      }
    }).catch((error: unknown) => this.publishError(sessionId, error)).finally(() => {
      this.terminalQueueWakeups.delete(sessionId)
      if (this.terminalDrainRequested.has(sessionId)) this.wakeTerminalQueue(sessionId)
    })
    this.terminalQueueWakeups.set(sessionId, waking)
  }

  private async drainSdkQueue(sessionId: string): Promise<void> {
    if (this.stopped || this.deletingSessions.has(sessionId)) return
    if (!this.admissions.canEnter(sessionId)) {
      this.sdkDrainRequested.add(sessionId)
      return
    }
    if (this.drainingSessions.has(sessionId)) {
      this.sdkDrainRequested.add(sessionId)
      return
    }
    this.sdkDrainRequested.delete(sessionId)
    if (
      this.store.get(sessionId)?.failedPrompt ||
      this.store.terminalQueueDispatch(sessionId)
    ) {
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
    try {
      await this.admissions.run(sessionId, async () => {
        await this.settleQueueAdmission(sessionId)
        if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) return
        const current = await this.store.readAfterWrites(sessionId)
        if (current.suspended || this.suspendingSessions.has(sessionId) ||
            current.pendingPermission || current.pendingUserInput || current.failedPrompt ||
            this.activePrompts.has(sessionId) ||
            (current.status !== 'idle' && current.status !== 'error')) return
        const assertIdle = (session: SessionDetail) => {
          if (
            this.stopped || this.deletingSessions.has(sessionId) ||
            this.suspendingSessions.has(sessionId) || session.suspended ||
            session.failedPrompt || session.pendingPermission ||
            session.pendingUserInput || this.activePrompts.has(sessionId) ||
            (session.status !== 'idle' && session.status !== 'error')
          ) {
            throw queueConflict(
              'The session changed before queued delivery; nothing was sent.',
            )
          }
        }
        const result = await this.serializeQueue(
          sessionId,
          () => this.queuedDispatches.run(
            sessionId,
            undefined,
            (content, command) => command
              ? this.normalizeQueuedContent(sessionId, content, true)
              : Promise.resolve(content),
            (prompt, delivery) => prompt.command
              ? this.runCommand(
                  sessionId, prompt.content, false, undefined, true, delivery,
                )
              : this.startMessage(
                  sessionId, prompt.content, true, undefined, undefined, delivery,
                ),
            assertIdle,
          ),
        )
        if (result && result.outcome !== 'sent') {
          this.publishError(sessionId, new Error(result.message))
        }
        const remaining = this.store.get(sessionId)
        if (result?.outcome === 'sent' && remaining?.queuedPrompts?.length &&
            remaining.status === 'idle' && !remaining.failedPrompt &&
            !remaining.queuedDispatch && !this.activePrompts.has(sessionId)) {
          this.sdkDrainRequested.add(sessionId)
        }
      })
    } catch (error) {
      if (error instanceof StaleQueuedPromptReservationError) this.sdkDrainRequested.add(sessionId)
      else {
        this.sdkDrainRequested.delete(sessionId)
        this.publishError(sessionId, error)
      }
    } finally {
      this.drainingSessions.delete(sessionId)
      if (this.sdkDrainRequested.has(sessionId)) this.wakeSdkQueue(sessionId)
      if (this.terminalDrainRequested.has(sessionId)) this.wakeTerminalQueue(sessionId)
    }
  }

  async dispatchQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<QueuedPromptDispatchResult> {
    if (this.stopped || this.deletingSessions.has(sessionId)) {
      throw queueConflict('The session is no longer available.')
    }
    if (this.drainingSessions.has(sessionId)) {
      throw queueConflict('This queue is already dispatching. Your rewrite was not sent.')
    }
    this.drainingSessions.add(sessionId)
    const releaseDispatch = this.holdDispatch(sessionId)
    try {
      return await this.serializeQueue(sessionId, async () => {
        const stored = await this.store.readAfterWrites(sessionId)
        let terminal = this.store.backend(sessionId) === 'terminal' ||
          this.externalSessionIds.has(sessionId)
        const assertIdle = (session: SessionDetail) => {
          if (
            this.stopped || this.deletingSessions.has(sessionId) ||
            this.suspendingSessions.has(sessionId) || session.suspended ||
            !session.isOpen || session.status !== 'idle' ||
            session.failedPrompt || session.pendingPermission ||
            session.pendingUserInput || this.activePrompts.has(sessionId) ||
            this.terminalController.sending?.(sessionId)
          ) {
            throw queueConflict(
              'The session is not idle and available. The original queued message has not been sent.',
            )
          }
        }
        assertIdle(stored)
        const result = await this.queuedDispatches.run(
          sessionId,
          { promptId, content },
          async (queuedContent, command) => {
            terminal ||= await this.terminalController.has(sessionId)
            return this.normalizeQueuedContent(
              sessionId, queuedContent, command,
            )
          },
          async (prompt, delivery) => {
            const current = this.store.get(sessionId)
            if (!current) throw queueConflict('The session was removed before dispatch.')
            assertIdle(this.queuedDispatches.view(current))
            if (terminal) {
              await this.dispatchTargetedTerminalPrompt(sessionId, prompt, delivery)
            } else if (prompt.command) {
              await this.runCommand(
                sessionId, prompt.content, false, undefined, true, delivery,
              )
            } else {
              await this.startMessage(
                sessionId, prompt.content, true, undefined, undefined, delivery,
              )
            }
          },
          assertIdle,
        )
        if (!result) throw queueConflict('The named queued prompt was not dispatched.')
        if (result.outcome !== 'sent') {
          this.publishError(sessionId, new Error(result.message))
        }
        return result
      })
    } finally {
      this.drainingSessions.delete(sessionId)
      releaseDispatch()
      const current = this.store.get(sessionId)
      if (current?.queuedPrompts?.length && current.status === 'idle' &&
          !current.failedPrompt && !current.queuedDispatch) {
        if (this.store.backend(sessionId) === 'terminal' ||
            this.externalSessionIds.has(sessionId)) {
          this.wakeTerminalQueue(sessionId)
        } else {
          this.wakeSdkQueue(sessionId)
        }
      }
    }
  }

  private async drainTerminalQueue(sessionId: string, withinAdmission = false): Promise<void> {
    if (this.stopped || this.deletingSessions.has(sessionId)) return
    if (this.isTerminalRecoveryPending(sessionId)) {
      // An in-flight suspension may still refuse without changing its owner.
      if (!this.suspendingSessions.has(sessionId)) this.retryTerminalQueueClaim(sessionId, true)
      return
    }
    if (!this.admissions.canEnter(sessionId)) {
      this.terminalDrainRequested.add(sessionId)
      return
    }
    return this.admissions.run(sessionId, () => this.drainAdmittedTerminalQueue(sessionId, withinAdmission))
  }

  private async drainAdmittedTerminalQueue(sessionId: string, withinAdmission: boolean): Promise<void> {
    if (this.stopped || this.deletingSessions.has(sessionId)) return
    if (this.drainingSessions.has(sessionId)) {
      this.terminalDrainRequested.add(sessionId)
      return
    }
    this.terminalDrainRequested.delete(sessionId)
    if (
      this.suspendingSessions.has(sessionId) ||
      this.store.get(sessionId)?.suspended
    ) {
      // A drain starting now would wait behind the teardown and then mark the
      // session as working, which the last idleness check reads as a turn
      // having begun -- the pane already killed, and the suspension abandoned
      // with nothing running it.
      if (this.startupTerminalQueues.delete(sessionId)) this.pendingTerminalQueueClaims.delete(sessionId)
      return
    }
    this.drainingSessions.add(sessionId)
    try {
      // A command answers in the pane instead of starting a turn, so it adds
      // no completion event and nothing else would drain what is queued behind
      // it. Draining continues here until the queue is empty or a turn begins.
      while (await this.drainNextTerminalPrompt(sessionId, withinAdmission)) {
        // Keep draining while commands keep answering.
      }
    } catch (error) {
      if (!this.stopped && !this.store.terminalQueueDispatch(sessionId)) {
        this.retryTerminalQueueClaim(sessionId, true)
      }
      this.publishError(sessionId, error)
    } finally {
      this.drainingSessions.delete(sessionId)
      if (this.terminalDrainRequested.has(sessionId)) this.wakeTerminalQueue(sessionId)
    }
  }

  /**
   * Sends the next queued entry. Returns true when the caller should drain
   * again immediately, which is only the case for a command that answered
   * without starting a turn: a dispatched prompt and a command that began a
   * turn both leave the terminal busy, and their completion drains the rest.
   */
  private async drainNextTerminalPrompt(sessionId: string, withinAdmission: boolean): Promise<boolean> {
    return await this.serializeQueue(sessionId, async () => {
      if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        this.pendingTerminalQueueClaims.delete(sessionId)
        this.startupTerminalQueues.delete(sessionId)
        return false
      }
      if (this.pendingTerminalQueueSettlements.has(sessionId)) {
        return this.settleTerminalQueue(sessionId)
      }
      const retry = this.pendingTerminalQueueClaims.get(sessionId)
      if (retry && Date.now() < retry.retryAt) return false
      const stored = await this.store.readAfterWrites(sessionId)
      const next = stored.queuedPrompts?.[0]
      const terminalDispatch = this.store.terminalQueueDispatch(sessionId)
      const startup = this.startupTerminalQueues.has(sessionId)
      if (startup && !this.hasStartupQueueLifecycle(sessionId, stored)) {
        this.startupTerminalQueues.delete(sessionId)
        this.pendingTerminalQueueClaims.delete(sessionId)
        return false
      }
      if (!next || stored.failedPrompt || terminalDispatch ||
          this.pendingTerminalPromptDispatches.has(sessionId)) {
        this.pendingTerminalQueueClaims.delete(sessionId)
        // The acknowledgement's later wake still needs startup owner/composer/claim checks.
        if (!this.awaitingAcceptedStartupRecovery(sessionId, stored)) this.startupTerminalQueues.delete(sessionId)
        return false
      }
      const isCurrent = () =>
        !this.stopped &&
        !this.deletingSessions.has(sessionId) &&
        !this.suspendingSessions.has(sessionId) &&
        (this.dispatchingSessions.get(sessionId) || 0) === (withinAdmission ? 1 : 0) &&
        !this.terminalController.sending?.(sessionId) &&
        (!startup || (this.nativeStartupDiscoveryReady && this.externalSessionIds.has(sessionId) &&
          !this.admissionClosed.has(sessionId) && !this.lifecycleLocks.has(sessionId)))
      if (startup && (!stored.isOpen || !this.nativeStartupDiscoveryReady ||
          !this.externalSessionIds.has(sessionId))) {
        this.retryTerminalQueueClaim(sessionId, true)
        return false
      }
      if (stored.status !== 'idle' || !isCurrent()) {
        this.retryTerminalQueueClaim(sessionId)
        return false
      }
      if (startup && !(await this.terminalController.has(sessionId))) {
        this.retryTerminalQueueClaim(sessionId, true)
        return false
      }
      const before = await this.terminalController.capture?.(sessionId)
      if (startup && (!before?.trim() || composerHoldsText(before) || isTerminalSessionInUsePrompt(before))) {
        this.retryTerminalQueueClaim(sessionId, !before?.trim())
        return false
      }
      if (next.command && !before?.trim()) {
        throw new Error('The terminal could not be read before command delivery; the command remains queued')
      }
      if (before && (isTerminalOverlay(before) || isTerminalAgentWorking(before))) {
        this.retryTerminalQueueClaim(sessionId)
        return false
      }
      const { session, dispatch } = startup
        ? await this.store.claimTerminalQueuedPrompt(sessionId, next, isCurrent, true)
        : await this.store.claimTerminalQueuedPrompt(sessionId, next, isCurrent)
      this.admissions.markCommitted(sessionId)
      this.pendingTerminalQueueClaims.delete(sessionId)
      if (this.stopped || this.deletingSessions.has(sessionId)) return false
      this.publish(session)

      // Once this claim is durable, neither a refused completion write nor a
      // process restart can put the externally delivered action back in FIFO.
      let outcome: PendingTerminalQueueSettlement['outcome']
      let failureMessage: string | undefined
      try {
        if (this.suspendingSessions.has(sessionId)) {
          throw new Error('The session began suspending before queued delivery; nothing was sent')
        }
        const sent = this.terminalController.sendWhenIdle
          ? await this.terminalController.sendWhenIdle(sessionId, next.content)
          : await this.terminalController.send(sessionId, next.content, false)
        if (!sent) {
          throw new Error('External terminal is no longer available')
        }
        outcome = next.command
          ? { kind: 'feedback', command: next.content, before }
          : { kind: 'accepted', startedTurn: true }
      } catch (error) {
        const uncertain = isUncertainDelivery(error)
        outcome = {
          kind: 'failed',
          uncertain,
        }
        failureMessage = `${error instanceof Error ? error.message : String(error)}${
          uncertain
            ? ''
            : ' The original queued message is unchanged; it was not sent.'
        }`
      }
      this.pendingTerminalQueueSettlements.set(sessionId, {
        dispatchId: dispatch.id,
        outcome,
        overlayOpen: false,
        failureMessage,
        retryAt: 0,
        retryDelay: 750,
      })
      return this.settleTerminalQueue(sessionId)
    })
  }

  private hasStartupQueueLifecycle(sessionId: string, session: SessionDetail | undefined): boolean {
    return Boolean(session && !this.stopped && !this.deletingSessions.has(sessionId) &&
      !this.suspendingSessions.has(sessionId) && !session.suspended &&
      this.store.isManagedOpen(sessionId) && this.store.backend(sessionId) === 'terminal')
  }

  private awaitingAcceptedStartupRecovery(sessionId: string, session: SessionDetail | undefined): boolean {
    const token = session?.failedPrompt?.failedAt
    const claim = token ? this.recoveryClaims.get(token) : undefined
    return this.startupTerminalQueues.has(sessionId) && Boolean(session?.queuedPrompts?.length) &&
      !this.store.terminalQueueDispatch(sessionId) && claim?.accepted === true && claim.failedAt === token
  }

  private retryTerminalQueueClaim(sessionId: string, failed = false): void {
    const session = this.store.get(sessionId)
    if (!session?.queuedPrompts?.length || this.stopped || this.deletingSessions.has(sessionId) ||
        (this.startupTerminalQueues.has(sessionId) && !this.hasStartupQueueLifecycle(sessionId, session)) ||
        (session.failedPrompt && !this.awaitingAcceptedStartupRecovery(sessionId, session))) {
      this.pendingTerminalQueueClaims.delete(sessionId)
      this.startupTerminalQueues.delete(sessionId)
      return
    }
    const delay = failed ? this.pendingTerminalQueueClaims.get(sessionId)?.retryDelay || 750 : 750
    this.pendingTerminalQueueClaims.set(sessionId, {
      retryAt: Date.now() + delay,
      retryDelay: failed ? Math.min(delay * 2, 60_000) : 750,
    })
  }

  private assertTerminalQueueSettled(sessionId: string): void {
    if (this.stopped) {
      throw new Error('The session service is stopping')
    }
    this.assertTerminalRecoverySettled(sessionId)
    if (this.store.terminalQueueDispatch(sessionId) ||
        this.pendingTerminalPromptDispatches.has(sessionId)) {
      throw Object.assign(
        new Error('A queued prompt is still awaiting durable delivery confirmation. Wait before sending more work.'),
        { statusCode: 409 },
      )
    }
  }

  private async settleTerminalQueue(sessionId: string): Promise<boolean> {
    const pending = this.pendingTerminalQueueSettlements.get(sessionId)
    if (!pending || this.stopped || this.deletingSessions.has(sessionId) || Date.now() < pending.retryAt) {
      return false
    }
    if (!this.store.get(sessionId)) {
      this.pendingTerminalQueueSettlements.delete(sessionId)
      this.startupTerminalQueues.delete(sessionId)
      return false
    }
    let settled: SessionDetail
    try {
      if (pending.outcome.kind === 'feedback') {
        const feedback = await this.terminalCommandFeedback(
          sessionId, pending.outcome.command, pending.outcome.before, true,
        )
        if (this.stopped) return false
        pending.outcome = { kind: 'accepted', startedTurn: feedback.startedTurn, notice: feedback.notice }
        pending.overlayOpen = feedback.overlayOpen
      }
      if (
        pending.retryAt > 0 &&
        pending.outcome.kind === 'accepted' &&
        !pending.outcome.startedTurn &&
        this.terminalController.capture
      ) {
        const pane = await this.terminalController.capture(sessionId)
        if (!pane) throw new Error('The terminal is unavailable for delivery confirmation')
        pending.overlayOpen = isTerminalOverlay(pane)
        if (isTerminalAgentWorking(pane)) {
          pending.outcome = { ...pending.outcome, startedTurn: true }
        }
      }
      settled = await this.store.settleTerminalQueuedPrompt(
        sessionId, pending.dispatchId, pending.outcome,
      )
    } catch (error) {
      pending.retryAt = Date.now() + pending.retryDelay
      pending.retryDelay = Math.min(pending.retryDelay * 2, 60_000)
      this.publishError(sessionId, new Error(
        pending.outcome.kind === 'feedback'
          ? 'The queued command was delivered, but its response could not be read. The queue is held while observation is retried; the command will not be sent again.'
          : 'The queued prompt is held pending durable delivery confirmation and will not be sent again automatically.',
        { cause: error },
      ))
      return false
    }
    this.pendingTerminalQueueSettlements.delete(sessionId)
    if (pending.outcome.kind === 'failed' ||
        (pending.outcome.kind === 'accepted' && pending.outcome.startedTurn) ||
        !settled.queuedPrompts?.length) {
      this.startupTerminalQueues.delete(sessionId)
    }
    if (this.stopped) return false
    this.publish(settled)
    if (pending.outcome.kind === 'failed') {
      this.emit('event', {
        type: 'error',
        sessionId,
        message: pending.failureMessage || 'The queued prompt could not be delivered',
        failedPrompt: settled.failedPrompt?.content,
        failedPromptAt: settled.failedPrompt?.failedAt,
      })
      return false
    }
    if (pending.overlayOpen) this.retryTerminalQueueClaim(sessionId)
    return !pending.overlayOpen && settled.status === 'idle' && !settled.suspended
  }

  private async dispatchTargetedTerminalPrompt(
    sessionId: string,
    prompt: QueuedPrompt,
    delivery: QueuedDelivery,
  ): Promise<void> {
    const before = await this.terminalController.capture?.(sessionId)
    if (before && (isTerminalOverlay(before) || isTerminalAgentWorking(before))) {
      throw queueConflict('The terminal is busy or showing a dialog. Close it or wait before sending this edit.')
    }
    const current = await this.store.readAfterWrites(sessionId)
    if (
      this.stopped || this.deletingSessions.has(sessionId) ||
      this.suspendingSessions.has(sessionId) || current.suspended ||
      current.status !== 'idle' || current.pendingPermission || current.pendingUserInput
    ) {
      throw queueConflict('The session is changing state. This edit was not sent.')
    }
    const dispatchedAt = new Date().toISOString()
    try {
      delivery.submit()
      if (!(await this.terminalController.send(sessionId, prompt.content, false))) {
        delivery.refuse()
        throw queueConflict('The owning terminal is no longer available.')
      }
    } catch (error) {
      if (terminalRefused(error)) delivery.refuse()
      throw error
    }
    delivery.accept()
    if (prompt.command) {
      const feedback = await this.terminalCommandFeedback(sessionId, prompt.content, before)
      this.publish(await this.store.addMessage(sessionId, {
        id: randomUUID(), role: 'notice', content: feedback.notice,
        createdAt: new Date().toISOString(),
      }))
      if (!feedback.startedTurn) return
    }
    this.publish(await this.store.markTerminalPromptDispatched(sessionId, dispatchedAt))
  }

  private async serializeQueue<T>(
    sessionId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (this.stopped) throw new Error('The session service is stopping')
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

  private async serializeTerminalAdmission<T>(
    sessionId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous =
      this.terminalAdmissionOperations.get(sessionId) || Promise.resolve()
    const current = previous.catch(() => undefined).then(operation)
    this.terminalAdmissionOperations.set(sessionId, current)
    try {
      return await current
    } finally {
      if (this.terminalAdmissionOperations.get(sessionId) === current) {
        this.terminalAdmissionOperations.delete(sessionId)
        this.terminalAdmissionDispatched.delete(sessionId)
      }
    }
  }

  private assertStartupDispatchSettled(sessionId: string, enqueue: boolean): void {
    if (!enqueue && this.terminalAdmissionDispatched.has(sessionId)) {
      throw Object.assign(new Error(
        'An earlier startup request was already dispatched. Wait for its turn or use Queue for this request.',
      ), { statusCode: 409 })
    }
  }

  private requestPermission(
    sessionId: string,
    request: PermissionRequest,
  ): Promise<PermissionRequestResult> {
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
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
      const pending = { sessionId, resolve }
      this.permissions.set(requestId, pending)
      void this.store
        .update(sessionId, (session) => {
          if (this.stopped || this.deletingSessions.has(sessionId) ||
              this.permissions.get(requestId) !== pending) {
            throw new Error('Permission request is no longer pending')
          }
          session.pendingPermission = permission
          session.status = 'waiting'
          session.activity = permission.title
        })
        .then((session) => {
          if (this.permissions.get(requestId) === pending) this.publish(session)
        })
        .catch((error: unknown) => {
          if (this.permissions.get(requestId) !== pending) return
          this.permissions.delete(requestId)
          pending.resolve({ kind: 'user-not-available' })
          this.publishError(sessionId, error)
        })
    })
  }

  private requestElicitation(
    context: ElicitationContext,
  ): Promise<ElicitationResult> {
    const sessionId = context.sessionId
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
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
        const owner = { sessionId, resolve }
        this.elicitations.set(requestId, owner)
        void this.store
          .update(sessionId, (session) => {
            if (this.stopped || this.deletingSessions.has(sessionId) ||
                this.elicitations.get(requestId) !== owner) {
              throw new Error('Elicitation request is no longer pending')
            }
            session.pendingUserInput = pending
            session.status = 'waiting'
            session.activity = pending.question
          })
          .then((session) => {
            if (this.elicitations.get(requestId) === owner) this.publish(session)
          })
          .catch((error: unknown) => {
            if (this.elicitations.get(requestId) !== owner) return
            this.elicitations.delete(requestId)
            owner.resolve({ action: 'cancel' })
            this.publishError(sessionId, error)
          })
    })
  }

  private requestUserInput(
    sessionId: string,
    request: UserInputRequest,
  ): Promise<UserInputResponse> {
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
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
      const owner = { sessionId, resolve }
      this.userInputs.set(requestId, owner)
      void this.store
        .update(sessionId, (session) => {
          if (this.stopped || this.deletingSessions.has(sessionId) ||
              this.userInputs.get(requestId) !== owner) {
            throw new Error('User input request is no longer pending')
          }
          session.pendingUserInput = pending
          session.status = 'waiting'
          session.activity = pending.question
        })
        .then((session) => {
          if (this.userInputs.get(requestId) === owner) this.publish(session)
        })
        .catch((error: unknown) => {
          if (this.userInputs.get(requestId) !== owner) return
          this.userInputs.delete(requestId)
          owner.resolve({ answer: '', wasFreeform: true })
          this.publishError(sessionId, error)
        })
    })
  }

  private publish(session: SessionDetail): void {
    if (this.stopped) return
    this.emit('event', { type: 'session.upserted', session: this.publicSession(session) })
  }

  private publicSession(session: SessionDetail): SessionDetail {
    session = this.queuedDispatches.view(session)
    const failed = session.failedPrompt
    if (!failed) return session
    const current = this.store.failedPrompt(session.id)
    const receipt = this.store.recoveryResend(session.id)
    const obsolete = !current || current.failedAt !== failed.failedAt || current.content !== failed.content
    const accepted = this.recoveryClaims.get(failed.failedAt)?.accepted ||
      (receipt && receipt.failedAt === failed.failedAt && receipt.accepted)
    return obsolete || accepted
      ? { ...session, failedPrompt: undefined }
      : { ...session, failedPrompt: current }
  }

  private publishError(sessionId: string, error: unknown): void {
    if (this.stopped) return
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
