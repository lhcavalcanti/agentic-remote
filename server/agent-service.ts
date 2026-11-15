import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import {
  deliveryUncertaintyFromError,
  SubmissionError,
  terminalDraftConflictFromError,
} from '../shared/submission-error.js'
import {
  hasActiveBackgroundTasks,
  hasRunningBackgroundAgent,
} from '../shared/background-tasks.js'
import { isDeepStrictEqual } from 'node:util'
import {
  CopilotClient,
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
import {
  COPILOT_SDK_SESSION_DISCOVERY,
  COPILOT_SDK_SESSION_INTERACTION,
  createCopilotSdkClient,
  readCopilotSdkRuntimeDiagnostic,
  type CopilotSdkMissingSessionRetirement,
} from './copilot-sdk-client.js'
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
  QueueState,
  QueuedPromptDispatchResult,
  RemovedQueuedPrompt,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SessionSkillsSnapshot,
  SessionMcpServersSnapshot,
  SessionRuntimeInfo,
  SessionRecoveryReason,
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
  SideQuestionExchange,
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
  isBackgroundTaskInfo,
  isBackgroundTaskProgress,
  MAX_BACKGROUND_TASKS,
  normalizeBackgroundTask,
  type CopilotTaskInfo,
  type CopilotTaskProgress,
  type CopilotTasksApi,
} from './background-task-adapter.js'
import { BackgroundTaskTracker } from './background-task-tracker.js'
import {
  assertSessionNotRetained,
  isRetainedRefusal,
  SessionReplacementCleanupError,
  SessionStore,
  StaleQueuedPromptReservationError,
  type TranscriptObservation,
  type DiscoveredSession,
  type QueuedPromptReservation,
  type TerminalQueueOutcome,
} from './session-store.js'
import { SessionAdmissions, type PendingQueueAdmission } from './session-admissions.js'
import { LaunchCreations, awaitTermination } from './launch-identity.js'
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
import {
  SIDE_QUESTION_CLEANUP_MS,
  SIDE_QUESTION_MAX_LENGTH,
  SIDE_QUESTION_RUNTIME_IDLE_MS,
  SIDE_QUESTION_TIMEOUT_MS,
  SideQuestionError,
  sideQuestionBoundary,
  sideQuestionPrompt,
  withSideQuestionTimeout,
} from './side-question.js'
import { listHomeDirectories,
  type DirectoryScope,
} from './directory-browser.js'
import {
  ensureSessionKnowledgeBase as ensureKnowledgeDirectory,
  type SessionKnowledgeBaseLocation,
  validateKnowledgeRoot,
  validateSessionDirectory,
} from './session-directory.js'
import {
  listWorkspace,
  readWorkspaceFile,
  searchWorkspace,
} from './workspace-browser.js'
import {
  copilotSkills,
  copilotMcp,
  copilotWorkspaceMcp,
  isResourceMethodUnavailable,
  mcpSnapshot,
  safeResourceError,
  SessionResourceError,
  ResourceReads,
  skillsSnapshot,
  unavailableMcp,
  unavailableSkills,
} from './session-resources.js'
import { readCopilotResource, type CopilotResourceClient } from './session-resource-transport.js'
import {
  composerHoldsText,
  isTerminalAgentWorking,
  isTerminalOverlay,
  isTerminalSessionInUseConflict,
  terminalInputReady,
  isTerminalSessionInUsePrompt,
  isTerminalVisiblyIdle,
  terminalCommandOutput,
  terminalFormReplyBudget,
  TmuxTerminalSessionController,
  TerminalFormReplyError,
  type TerminalFormStep,
  type TerminalSendOptions,
  type TerminalSessionController,
} from './terminal-session.js'
import { buildRecoveryBrief } from './recovery-context.js'
import { silentStartupPhases, type StartupPhases } from './startup-phases.js'

interface ActivePrompt {
  assistantMessageId: string
}

interface PendingSdkFollowUp {
  settled: Promise<void>
  resolve: () => void
  previousCompleted: boolean
  /** Stopped while it was still being handed over, before it had a tracker. */
  stopped?: boolean
}

interface SdkFollowUpTracker {
  activate: () => void
  settleWhenIdle: () => void
  settled: Promise<void>
  settleForTeardown: () => void
  cancel: () => void
}

class TerminalDiscoveryError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause), { cause })
    this.name = 'TerminalDiscoveryError'
  }
}

class TerminalActivationSupersededError extends Error {
  readonly statusCode = 409

  constructor() {
    super('The session is reopening in a terminal')
    this.name = 'TerminalActivationSupersededError'
  }
}

type TerminalRecoveryResult = 'created' | 'existing' | 'skipped' | 'deferred'

interface DeliveryBoundary {
  accepted: boolean
  ordered?: () => void
}

interface RecoveryResendClaim extends DeliveryBoundary {
  failedAt: string
  release(): void
}

interface PendingTerminalQueueSettlement {
  dispatchId: string
  outcome: TerminalQueueOutcome | { kind: 'feedback'; command: string; before: string | undefined; handedAt: string }
  overlayOpen: boolean
  failureReason?: string
  failureMessage?: string
  retryAt: number
  retryDelay: number
  // Input refused before anything was typed goes back to the head of the queue
  // and waits for the composer again, without an error.
  quiet?: boolean
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

// Unlike the SDK's ElicitationResult, an accepted reply comes from a validated
// form, so none of its values is undefined; this is the shape a reply persists.
type ElicitationReply = Omit<ElicitationResult, 'content'> & {
  content?: Record<string, UserInputFieldValue>
}

type SdkReplyChoice =
  | { kind: 'permission'; optionId: string }
  | {
      kind: 'input'
      action: NonNullable<UserInputReplyInput['action']>
      response: UserInputResponse
    }
  | { kind: 'elicitation'; response: ElicitationReply }

interface AcceptedSdkReply {
  sessionId: string
  choice: SdkReplyChoice
  promptId?: string
  completion?: Promise<SessionDetail>
  terminal?: boolean
}

interface TerminalFormContinuation {
  input: UserInputReplyInput
  request: PendingUserInput
  content: string
  dismissed: boolean
  dismissalError: TerminalFormReplyError
  sendError?: TerminalFormReplyError | SubmissionError
  // Set the moment the terminal accepts the answer, so a retry after a later
  // failure only finishes the bookkeeping and never types it again.
  delivered?: boolean
  // Answering a card that outlived its form; a retry re-clears that card.
  stale?: boolean
}

// A retained form answer typed as an ordinary message. Readiness is checked
// under the terminal's send lock, so it is refused rather than steered into a
// turn or draft that appeared after the stale card was inspected.
interface TerminalAnswerDelivery {
  onAccepted: () => void
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
    skills?: Pick<CopilotSession['rpc']['skills'], 'list'>
    mcp?: Pick<CopilotSession['rpc']['mcp'], 'list'>
    name: Pick<CopilotSession['rpc']['name'], 'set'>
    model: Pick<CopilotSession['rpc']['model'], 'getCurrent' | 'switchTo'>
    mode: Pick<CopilotSession['rpc']['mode'], 'set'>
    ui?: Pick<CopilotSession['rpc']['ui'], 'ephemeralQuery'>
    permissions?: Pick<
      CopilotSession['rpc']['permissions'],
      'pendingRequests' | 'handlePendingPermissionRequest'
    >
  }
}

export interface CopilotClientLike extends CopilotResourceClient {
  start(): Promise<void>
  stop(): Promise<Error[]>
  getStatus?: CopilotClient['getStatus']
  getAuthStatus?: CopilotClient['getAuthStatus']
  retireMissingSession?: CopilotSdkMissingSessionRetirement['retireMissingSession']
  createSession(config: SessionConfig): Promise<CopilotSessionLike>
  resumeSession(
    sessionId: string,
    config: ResumeSessionConfig,
  ): Promise<CopilotSessionLike>
  listSessions(): Promise<SessionMetadata[]>
  deleteSession(sessionId: string): Promise<void>
  rpc: Pick<CopilotClient['rpc'], 'commands'> & {
    models: Pick<CopilotClient['rpc']['models'], 'list'>
    skills?: Pick<CopilotClient['rpc']['skills'], 'discover'>
    mcp?: Pick<CopilotClient['rpc']['mcp'], 'discover'>
    sessions?: Pick<CopilotClient['rpc']['sessions'], 'fork'>
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

function terminalAnswerRefused(cause?: unknown): Error {
  return Object.assign(new Error(
    'The terminal is no longer idle at an empty prompt, so the answer was not sent. The question is still open; try again once the terminal is idle.',
  ), { statusCode: 409, uncertainDelivery: false, ...(cause === undefined ? {} : { cause }) })
}

function suspendedRuntimeConflict(): Error {
  return Object.assign(
    new Error('Resume the session before using its provider runtime'),
    { statusCode: 409, uncertainDelivery: false },
  )
}

/**
 * A lifecycle change refused because of what the session is doing. Left
 * without a status, the refusal reached the reader -- through the hub too --
 * as "Unexpected server error", which says nothing about what to do next.
 */
function lifecycleRefusal(
  message: string,
  reasonCode: string,
  statusCode = 409,
  cause?: unknown,
): Error {
  return Object.assign(
    new Error(message, cause === undefined ? undefined : { cause }),
    { statusCode, reasonCode },
  )
}

const SUSPEND_REFUSALS = {
  'suspend.in-progress': 'Session is already being suspended',
  'suspend.not-idle': 'Session can only be suspended while idle',
  'suspend.delivery-in-flight':
    'Session can only be suspended while idle; a message is still being delivered to it',
  'suspend.background-tasks':
    'Session can only be suspended once its background tasks finish',
  'suspend.background-tasks-unreadable':
    'Session cannot be suspended until its background tasks can be read',
  'suspend.transcript-unreadable':
    'Session cannot be suspended until its transcript can be read',
  'suspend.terminal-not-closed': 'The terminal window could not be closed',
} as const

function suspendRefused(
  reasonCode: keyof typeof SUSPEND_REFUSALS,
  cause?: unknown,
): Error {
  return lifecycleRefusal(SUSPEND_REFUSALS[reasonCode], reasonCode, 409, cause)
}

/** Terminal input refused before typing anything for want of a composer. */
function isTerminalNotReadyRefusal(error: unknown): boolean {
  const reason = error && typeof error === 'object'
    ? Reflect.get(error, 'reasonCode')
    : undefined
  return Boolean(
    error &&
      typeof error === 'object' &&
      (reason === 'terminal-not-ready.steer' || reason === 'terminal-not-ready.queue') &&
      Reflect.get(error, 'uncertainDelivery') === false,
  )
}

// Upper bound on the read-only stale-card probe within a reply's budget.
const STALE_FORM_PROBE_MS = 5_000

function isUncertainDelivery(error: unknown): boolean {
  // The value, not the key. A refusal that says delivery was definite carries
  // the mark too, and reading its presence as doubt turned "this was not sent"
  // into "this may have been sent" for every producer honest enough to say so.
  return deliveryUncertaintyFromError(error) === true
}

// The watcher's pass over every session, and how often a session's event log
// is checked for something new between passes.
const TRANSCRIPT_POLL_MS = 750
const TRANSCRIPT_WAKE_MS = 100
// A session whose changes keep coming is taken in again no sooner than this
// many times what taking them in last cost, within the two intervals above.
// Cheap sessions are seen within a wake; costly ones keep the watcher's
// pace, so busy sessions cannot take over the process.
const TRANSCRIPT_PACE_COST_FACTOR = 8
// How long a message handed to a terminal is watched for in its event log.
const TRANSCRIPT_ECHO_WAIT_MS = 5_000
const TERMINAL_STEER_RETRY_MS = 250

const sessionInUseMessage =
  'Copilot says this session is already in use. Choose Resume anyway or Go back in the permission card.'
const passiveSessionInUseMessage =
  'Copilot says this session is already in use by another client or application. Close or resume it there before sending here.'

function sessionInUseConflictMessage(pane: string): string {
  return isTerminalSessionInUsePrompt(pane)
    ? sessionInUseMessage
    : passiveSessionInUseMessage
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

interface LiveTaskCompletion {
  assistantMessageId?: string
  canonicalSummary?: string
  completionAccepted?: boolean
  completedAt?: string
  completionEventReceived?: boolean
  fallbackSummary?: string
  toolCallId: string
}

function taskCompletionAccepted(event: SessionEvent): boolean {
  if (event.type !== 'session.task_complete') {
    return false
  }
  return (
    event.data.success !== false &&
    event.data.outcome !== 'continue' &&
    event.data.outcome !== 'blocked'
  )
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
  const pendingTaskCompletions = new Map<
    string,
    {
      activityContent: string
      completedAt: string
      fallbackSummary?: string
      message: ChatMessage
      startedAt: string
      toolCallId: string
    }
  >()
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
  // Every running activity, and the first message for each ID, so neither
  // finishing activities nor completing a tool rescans the whole transcript.
  // Long histories otherwise cost time quadratic in their length.
  const runningActivities = new Set<ChatMessage>()
  const messagesById = new Map<string, ChatMessage>()
  const append = (message: ChatMessage) => {
    messages.push(message)
    if (!messagesById.has(message.id)) messagesById.set(message.id, message)
    if (message.role === 'activity' && message.activityStatus === 'running') {
      runningActivities.add(message)
    }
  }
  const finishRunningActivities = (
    activityStatus: 'completed' | 'failed' = 'completed',
  ) => {
    for (const message of runningActivities) {
      message.activityStatus = activityStatus
    }
    runningActivities.clear()
  }
  const renderTaskCompletion = (
    message: ChatMessage,
    toolCallId: string,
    summary: string,
    completedAt: string,
    finishActivities = true,
  ) => {
    if (finishActivities) {
      finishRunningActivities()
    }
    message.role = 'assistant'
    message.content = summary
    message.createdAt = completedAt
    message.activityStatus = undefined
    message.taskCompletion = {
      source: 'root-task-complete',
      toolCallId,
      completedAt,
    }
  }
  for (const event of events) {
    if (event.type === 'user.message') {
      if (stringValue(recordValue(event.data).source)?.startsWith('agent-')) {
        continue
      }
      pendingTaskCompletions.clear()
      const content = visibleUserContent(event.data.content)
      if (content) {
        finishRunningActivities()
        append({
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
        append({
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
      if (toolName === 'task_complete' && !eventAgentId(event)) {
        const summary = stringValue(
          recordValue(event.data.arguments).summary,
        )?.trim()
        taskCompletionSummaries.set(toolCallId, summary || '')
      }
      append({
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
      const message = messagesById.get(`tool:${toolCallId}`)
      if (message) {
        runningActivities.delete(message)
        message.activityStatus = event.data.success ? 'completed' : 'failed'
        const resultContent = activityResult(event.data, event.data.success)
        const duration = activityDuration(message.createdAt, event.timestamp)
        if (resultContent) {
          message.activityResult = resultContent
        }
        if (duration !== undefined) {
          message.activityDurationMs = duration
        }
        if (event.data.success && taskCompletionSummaries.has(toolCallId)) {
          const fallbackSummary =
            taskCompletionSummaries.get(toolCallId) || undefined
          if (fallbackSummary) {
            finishRunningActivities()
          }
          pendingTaskCompletions.set(event.id, {
            activityContent: message.content,
            completedAt: event.timestamp,
            fallbackSummary,
            message,
            startedAt: message.createdAt,
            toolCallId,
          })
          if (fallbackSummary) {
            renderTaskCompletion(
              message,
              toolCallId,
              fallbackSummary,
              event.timestamp,
            )
          }
        }
      }
    }
    if (event.type === 'session.task_complete' && !eventAgentId(event)) {
      const completionEventId =
        event.parentId && pendingTaskCompletions.has(event.parentId)
          ? event.parentId
        : pendingTaskCompletions.size === 1
          ? pendingTaskCompletions.keys().next().value
          : undefined
      const completion = completionEventId
        ? pendingTaskCompletions.get(completionEventId)
        : undefined
      const summary =
        event.data.summary?.trim() || completion?.fallbackSummary
      if (completion && summary && taskCompletionAccepted(event)) {
        renderTaskCompletion(
          completion.message,
          completion.toolCallId,
          summary,
          completion.completedAt,
          !completion.fallbackSummary,
        )
      } else if (completion?.fallbackSummary) {
        completion.message.role = 'activity'
        completion.message.content = completion.activityContent
        completion.message.createdAt = completion.startedAt
        completion.message.activityStatus = 'completed'
        delete completion.message.taskCompletion
      }
      if (completionEventId) {
        pendingTaskCompletions.delete(completionEventId)
      }
    }
    if (
      event.type === 'assistant.turn_end' ||
      event.type === 'session.idle' ||
      event.type === 'abort' ||
      event.type === 'session.error' ||
      event.type === 'session.shutdown'
    ) {
      if (!eventAgentId(event)) {
        pendingTaskCompletions.clear()
      }
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

function hasUnresolvedPermissionEvent(events: SessionEvent[]): boolean {
  const pending = new Set<string>()
  for (const event of events) {
    if (event.type !== 'permission.requested' && event.type !== 'permission.completed') {
      continue
    }
    const requestId = stringValue(recordValue(event.data).requestId)
    if (!requestId) continue
    if (event.type === 'permission.requested') pending.add(requestId)
    else pending.delete(requestId)
  }
  return pending.size > 0
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

// Copilot's notice for a turn that ended without a word, matched in full so
// any other error, including the longer "No response was returned because
// ... exceed this model's context budget", stays visible.
const EMPTY_RESPONSE_NOTICE = 'No response was returned. Send your message again to retry.'

function isEmptyResponseNotice(event: SessionEvent): boolean {
  if (event.type !== 'session.error') return false
  const data = recordValue(event.data)
  return data.errorType === 'query' && data.message === EMPTY_RESPONSE_NOTICE
}

export function statusFromEvents(events: SessionEvent[]): SessionStatus {
  let status: SessionStatus = 'idle'
  // Work a turn handed to background agents outlives the turn itself, so the
  // agents still running are tracked separately from it.
  const workingAgents = new Set<string>()
  // Set while the latest foreground event is Copilot's empty-response notice:
  // where it is, and whether background agents were working when it came.
  let emptyResponse: { index: number; agentsWorking: boolean } | undefined
  for (const [index, event] of events.entries()) {
    if (event.type === 'session.start' || event.type === 'session.resume') {
      workingAgents.clear()
      status = 'idle'
      emptyResponse = undefined
      continue
    }
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
    emptyResponse = isEmptyResponseNotice(event)
      ? { index, agentsWorking: workingAgents.size > 0 }
      : undefined
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
  if (
    status === 'error' &&
    emptyResponse &&
    (emptyResponse.agentsWorking ||
      backgroundTasksFromEvents(events.slice(0, emptyResponse.index + 1), {
        assumeBackground: true,
      }).some((task) => task.status === 'running' || task.status === 'queued'))
  ) {
    // A steer typed over a foreground command makes Copilot move the command
    // to the background and tell the model to wait for it, so the turn that
    // reads the steer often returns nothing. The work it waits on finishing
    // starts the turn that answers, so this is the session waiting on its
    // background work, as when the turn says so in words. Decided as of the
    // notice: judged afresh, it would flash back to an error in the moment
    // between that work finishing and the next turn starting.
    status = 'idle'
  }
  // A turn that handed its work to background agents and then ended has not
  // finished it. Reporting the session as idle offers it for the next prompt
  // and calls the work done while it is still going on.
  return status === 'idle' && workingAgents.size > 0 ? 'running' : status
}

/**
 * Whether the CLI is in a turn of its own, by its event log rather than by
 * anything it draws. Background agents do not count: the prompt is back with
 * the person while they run. A process that started or resumed since closes
 * whatever the previous one left open.
 */
export function foregroundTurnOpen(events: SessionEvent[]): boolean {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event.type === 'session.start' || event.type === 'session.resume') {
      return false
    }
    if (isForegroundLifecycleEvent(event)) {
      return (
        event.type === 'assistant.turn_start' ||
        event.type === 'permission.completed'
      )
    }
  }
  return false
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
  const details = recordValue(error)
  const nestedDetails = recordValue(details.error)
  const detailData = recordValue(details.data)
  const nestedData = recordValue(nestedDetails.data)
  const codes = [
    details.code,
    nestedDetails.code,
    detailData.code,
    nestedData.code,
  ].flatMap((code) =>
    typeof code === 'string' || typeof code === 'number'
      ? [String(code).toLowerCase().replaceAll(/[\s_.-]+/g, '')]
      : [],
  )
  const message =
    error instanceof Error
      ? error.message
      : stringValue(details.message) ||
        stringValue(nestedDetails.message) ||
        stringValue(detailData.message) ||
        stringValue(nestedData.message)
  const normalizedMessage = message?.toLowerCase()

  if (
    codes.some((code) =>
      code === '32601' ||
      code === 'methodnotfound' ||
      code === 'endpointnotfound',
    ) ||
    (normalizedMessage &&
      (/\b(?:method|endpoint)\s+(?:was\s+)?not found\b/.test(normalizedMessage) ||
        /\b(?:unknown|unhandled|unsupported)\s+(?:rpc\s+)?(?:method|endpoint)\b/.test(
          normalizedMessage,
        ) ||
        /\bsession\.delete\b.*\bnot supported\b/.test(normalizedMessage)))
  ) {
    return false
  }
  if (
    codes.some((code) =>
      code === 'sessionnotfound' ||
      code === 'sessiondoesnotexist' ||
      code === 'nosuchsession',
    )
  ) {
    return true
  }
  return Boolean(
    normalizedMessage &&
      (/\bsession\s+(?:not found|does not exist)\b/.test(normalizedMessage) ||
        /\bsession\s+(?:(?:with\s+)?id\s+)?["'`]?[a-z0-9-]+["'`]?\s+(?:was\s+)?(?:not found|does not exist)\b/.test(
          normalizedMessage,
        ) ||
        /\bno such session\b/.test(normalizedMessage) ||
        /\bno session (?:was )?found\b/.test(normalizedMessage)),
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
  // Older runtimes still send factory permissions after SDK 1.0.16 dropped the kind.
  const legacy = request as { kind: string; operation?: string; name?: string }
  if (legacy.kind === 'factory') {
    return `${legacy.operation === 'author' ? 'Author' : 'Run'} factory ${legacy.name}`
  }
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
    case 'extension-permission-access':
      return `Allow extension ${request.extensionName}`
  }
  return 'Permission required'
}

function recoveredPermissionTitle(request: Record<string, unknown>): string {
  return stringValue(request.intention) ||
    stringValue(request.toolTitle) ||
    stringValue(request.toolDescription) ||
    stringValue(request.hookMessage) ||
    (stringValue(request.fileName) ? `Write ${stringValue(request.fileName)}` : undefined) ||
    (stringValue(request.path) ? `Access ${stringValue(request.path)}` : undefined) ||
    (stringValue(request.url) ? `Open ${stringValue(request.url)}` : undefined) ||
    (stringValue(request.toolName) ? `Use ${stringValue(request.toolName)}` : undefined) ||
    (stringValue(request.extensionName)
      ? `Allow extension ${stringValue(request.extensionName)}`
      : undefined) ||
    'Permission required'
}

export class AgentService extends EventEmitter<AgentServiceEvents> {
  private readonly client: CopilotClientLike
  private readonly sessions = new Map<string, CopilotSessionLike>()
  private readonly sdkOwnerGenerations = new Map<string, number>()
  private readonly queuedDispatches: QueuedDispatches
  private readonly queuedPromptStops = new Map<string, () => void>()
  private readonly queuedPromptRuns = new Map<string, Promise<void>>()
  private readonly sdkPromptRuns = new Map<string, Promise<void>>()
  private readonly recoverySeedPromptRuns = new Map<string, Promise<void>>()
  private readonly recoverySeedDispatches = new Map<string, Promise<SessionDetail | undefined>>()
  private readonly pendingSessionMetadata = new Map<string, SessionEvent[]>()
  private readonly sessionCreations = new Set<Promise<void>>()
  private readonly hydratedSessions = new Set<string>()
  private readonly loadingSessions = new Map<
    string,
    Promise<CopilotSessionLike>
  >()
  private readonly hydratingSessions = new Map<string, Promise<SessionDetail>>()
  private readonly activePrompts = new Map<string, ActivePrompt>()
  private readonly pendingSdkFollowUps = new Map<
    string,
    PendingSdkFollowUp
  >()
  // Sessions whose original turn is still being awaited, and the tracker the
  // live follow-up is watching with. The turn closes the assistant of a
  // follow-up accepted while it runs; once it has returned the follow-up has
  // to close its own, and one it supersedes must stop watching.
  private readonly sdkTurnsAwaited = new Map<string, string>()
  private readonly retiredSdkPromptRuns = new Set<string>()
  private readonly sdkFollowUpTrackers = new Map<string, SdkFollowUpTracker>()
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
  private readonly terminalQueueRetryTimers = new Map<string, NodeJS.Timeout>()
  private readonly terminalQueueStates = new Map<string, QueueState>()
  /** Set when the service is shutting down, so retries stop with it. */
  private stopped = false
  private startupRecoveryPending = false
  // A settled owner must not be boot-recovered again while a peer is deferred.
  private terminalRecoveryStates?: Map<string, 'pending' | 'settled'>
  private startTask?: Promise<void>
  private stopTask?: Promise<void>
  private readonly admissions = new SessionAdmissions(() => this.stopped)
  private readonly launchCreations = new LaunchCreations()
  private readonly sdkDrainRequested = new Set<string>()
  private readonly startupTerminalQueues = new Set<string>()
  private readonly rediscoveredTerminalQueues = new Map<string, 'resume' | 'reopen'>()
  // Live owners the app queued work to without owning them yet, keyed to the
  // admission's sequence number. The queue write never grants recovery, since
  // a snapshot taken before it commits may no longer list the owner. The next
  // pass that lists the owner grants it; one whose snapshot followed the
  // admission and no longer lists the owner forgets it.
  private readonly liveTerminalAdmissions = new Map<string, number>()
  private liveTerminalAdmissionSequence = 0
  private nativeStartupDiscoveryReady = false
  private nativeDiscoveryCompleted = false
  private readonly sdkQueueWakeups = new Map<string, Promise<void>>()
  private readonly sdkRecoveryRuns = new Map<string, Promise<void>>()
  private readonly recoveredPermissionReplies = new Map<
    string,
    { optionId: string; completion: Promise<SessionDetail> }
  >()
  private readonly terminalDrainRequested = new Set<string>()
  private readonly terminalQueueWakeups = new Map<string, Promise<void>>()
  private readonly pendingSdkQueueAdmissions = new Map<string, PendingQueueAdmission>()
  private resourceEpoch = 0
  private readonly resourceReads = new ResourceReads()
  private readonly queueOperations = new Map<string, Promise<unknown>>()
  private readonly terminalAdmissionOperations = new Map<
    string,
    Promise<unknown>
  >()
  private readonly terminalImmediateOperations = new Map<string, Promise<unknown>>()
  private readonly terminalAdmissionDispatched = new Set<string>()
  private readonly pendingTerminalPromptDispatches = new Map<string, string>()
  private readonly deletingSessions = new Set<string>()
  private readonly deletedSessionIds = new Set<string>()
  /** Being closed to reopen later: nothing may attach or wake its runtime. */
  private readonly closingSessions = new Set<string>()
  /** SDK sessions owned by something else on this computer, such as the manager agent. */
  private readonly hiddenSessionIds = new Set<string>()
  private sideQuestionTimeoutMs = SIDE_QUESTION_TIMEOUT_MS
  private sideQuestionIdleMs = SIDE_QUESTION_RUNTIME_IDLE_MS
  private sideQuestionCleanupMs = SIDE_QUESTION_CLEANUP_MS
  private readonly sideQuestionCleanups = new Set<Promise<void>>()
  private sideQuestionRuntime?: {
    client: CopilotClientLike
    started: Promise<void>
    active: number
    idleTimer?: ReturnType<typeof setTimeout>
  }
  private readonly backgroundTaskTracker = new BackgroundTaskTracker()
  private readonly backgroundTaskSyncs = new Map<
    string,
    Promise<BackgroundTaskSnapshot>
  >()
  private readonly backgroundTaskResyncNeeded = new Set<string>()
  // Bumped whenever the runtime a session's tasks describe is replaced. A read
  // already in flight then answers for a runtime that is gone, and installing
  // it would put a finished agent back and hold the queue closed again.
  private readonly backgroundTaskGenerations = new Map<string, number>()
  private readonly permissions = new Map<string, PendingSdkPermission>()
  private readonly userInputs = new Map<string, PendingSdkUserInput>()
  private readonly acceptedSdkReplies = new Map<string, AcceptedSdkReply>()
  private readonly terminalFormUncertainty = new Map<string, {
    error: TerminalFormReplyError
    choice: SdkReplyChoice
  }>()
  private readonly terminalFormContinuations = new Map<string, TerminalFormContinuation>()
  private readonly terminalInputReplies = new Map<string, {
    input: UserInputReplyInput
    completion: Promise<SessionDetail>
  }>()
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
  private readonly terminalActivations = new Set<string>()

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
    await this.deleteSdkProviderIdentity(id)
  }

  private async deleteSdkProviderIdentity(id: string): Promise<void> {
    try {
      await this.client.deleteSession(id)
    } catch (error) {
      if (!isMissingSessionError(error)) throw error
      await this.client.retireMissingSession?.(id)
    }
    this.removeSdkOwner(id)
    this.hydratedSessions.delete(id)
    this.loadingSessions.delete(id)
    this.hydratingSessions.delete(id)
    this.pendingSessionMetadata.delete(id)
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
  private transcriptWakeTimer?: NodeJS.Timeout
  private transcriptWake?: Promise<void>
  // One transcript sync per session at a time, whether the watcher or a wake
  // started it.
  private readonly transcriptSessionSyncs = new Map<string, Promise<void>>()
  // When each session last had a changed event log taken in.
  private readonly transcriptChangesTakenAt = new Map<string, number>()
  // What taking each session's changes in last cost, in milliseconds.
  private readonly transcriptTakeInCosts = new Map<string, number>()
  // Sessions just handed a message, and when: their changes are taken in at
  // once, even inside the watcher's interval, until that message is logged.
  private readonly awaitedTranscriptEchoes = new Map<string, number>()
  private externalSessionIds = new Set<string>()
  private readonly launchingTerminalSessionIds = new Set<string>()
  private discoveryGeneration = 0
  private readonly eventLogFingerprints = new Map<string, string>()
  private readonly eventLogVersions = new Map<string, string>()
  private readonly workspaceVersions = new Map<string, string>()
  private readonly liveTranscriptWatermarks = new Map<string, string>()
  private readonly liveTaskCompletions = new Map<string, LiveTaskCompletion>()
  private readonly completedTaskPromptMessages = new Set<string>()
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
    client: CopilotClientLike = createCopilotSdkClient(),
    private readonly activeSessionFinder = findActiveCopilotSessions,
    private readonly activeSessionStopper = stopActiveCopilotSession,
    private readonly sessionEventReader = readSessionEvents,
    private readonly sessionEventVersion = sessionEventLogVersion,
    private readonly terminalController: TerminalSessionController =
      new TmuxTerminalSessionController(),
    private readonly workspaceReader = readSessionWorkspaceMetadata,
    private readonly workspaceVersion = sessionWorkspaceVersion,
    // Side questions fork through a runtime of their own. One that has the
    // source session loaded records the fork in that session's history.
    private readonly sideQuestionClientFactory: () => CopilotClientLike = () =>
      createCopilotSdkClient(),
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
        supportsSteering: true,
        supportsLaunchIdentity: true,
        supportsSessionResources: true,
        supportsContextRecovery: true,
        supportsSessionRetention: true,
        supportsRecoverableClose: true,
        supportsSideQuestions: true,
      },
    ]
  }

  /**
   * Answers a question from a session's conversation without prompting it.
   *
   * The saved history is forked into a temporary SDK session, so neither an
   * SDK session nor a tmux one is touched; a turn still under way is left out
   * of the fork, since a question asked over it is answered as that turn.
   * Discovery waits while the fork exists, and the fork is always deleted.
   */
  async askSession(
    id: string,
    question: string,
    earlier: readonly SideQuestionExchange[] = [],
  ): Promise<string> {
    const text = question.trim()
    if (!text) throw new SideQuestionError('Ask a question first.', 400)
    if (text.length > SIDE_QUESTION_MAX_LENGTH) {
      throw new SideQuestionError(
        `Side questions are limited to ${SIDE_QUESTION_MAX_LENGTH} characters.`,
        400,
      )
    }
    if (this.stopped) throw new SideQuestionError('The session service is stopping', 503)
    if (!this.store.get(id)) throw new SideQuestionError('Session not found', 404)
    // One deadline covers every step, so neither the request nor shutdown,
    // which waits for it, can outlast it.
    const deadline = Date.now() + this.sideQuestionTimeoutMs
    const inTime = <T>(work: Promise<T>) =>
      withSideQuestionTimeout(work, Math.max(0, deadline - Date.now()))
    const boundary = sideQuestionBoundary(await inTime(this.sessionEventReader(id)))
    return this.runSessionCreation(() => this.withSideQuestionClient(inTime, async (client) => {
      const fork = client.rpc.sessions?.fork
      if (!fork) {
        throw new SideQuestionError(
          'Side questions need a newer GitHub Copilot on this computer.',
          501,
        )
      }
      const forks: string[] = []
      const forkFrom = async (sessionId: string, toEventId?: string) => {
        const forking = fork({ sessionId, ...(toEventId ? { toEventId } : {}) })
        let forkId: string
        try {
          forkId = (await inTime(forking)).sessionId
        } catch (error) {
          // Registered before this question's own hold on discovery ends, so
          // a fork that lands late is never listed before it is discarded.
          // Shutdown has no discovery left to hold, but still waits for it.
          const settle = () => this.settleLateSideQuestionFork(client, forking)
          const cleanup = (this.stopped ? settle() : this.runSessionCreation(settle))
            .catch(() => undefined)
          this.sideQuestionCleanups.add(cleanup)
          void cleanup.finally(() => this.sideQuestionCleanups.delete(cleanup))
          throw error
        }
        this.deletedSessionIds.add(forkId)
        forks.push(forkId)
        return forkId
      }
      let forked: CopilotSessionLike | undefined
      try {
        let forkId = await forkFrom(id, boundary)
        // A prompt can start between reading the history and forking it. The
        // fork's own copy says what it holds, and one that ends in an
        // unfinished turn is forked again before it.
        const late = sideQuestionBoundary(await inTime(this.sessionEventReader(forkId)))
        if (late) forkId = await forkFrom(forkId, late)
        const resuming = client.resumeSession(forkId, {
          streaming: false,
          onPermissionRequest: () => ({ kind: 'user-not-available' }),
        })
        forked = await inTime(resuming).catch((error: unknown) => {
          void resuming.then((late) => late.disconnect(), () => undefined).catch(() => undefined)
          throw error
        })
        const ask = forked.rpc.ui?.ephemeralQuery
        if (!ask) {
          throw new SideQuestionError(
            'Side questions need a newer GitHub Copilot on this computer.',
            501,
          )
        }
        return (await inTime(ask({ question: sideQuestionPrompt(text, earlier) }))).answer
      } finally {
        if (forked) {
          await withSideQuestionTimeout(forked.disconnect(), this.sideQuestionCleanupMs)
            .catch(() => undefined)
        }
        for (const forkId of forks) await this.discardSideQuestionFork(client, forkId)
      }
    }))
  }

  /**
   * Discards a fork that landed after its question gave up. A runtime that
   * still owes one after the cleanup bound is stopped, so it cannot land later.
   */
  private async settleLateSideQuestionFork(
    client: CopilotClientLike,
    forking: Promise<{ sessionId: string }>,
  ): Promise<void> {
    const landed = await withSideQuestionTimeout(forking, this.sideQuestionCleanupMs)
      .catch(() => undefined)
    if (landed) {
      this.deletedSessionIds.add(landed.sessionId)
      await this.discardSideQuestionFork(client, landed.sessionId)
      return
    }
    const runtime = this.sideQuestionRuntime
    if (runtime?.client !== client) return
    this.sideQuestionRuntime = undefined
    await this.closeSideQuestionRuntime(runtime)
  }

  /**
   * Deletes a fork. One that cannot be deleted is retired durably, so it is
   * never discovered as a session after a restart.
   */
  private async discardSideQuestionFork(client: CopilotClientLike, forkId: string): Promise<void> {
    forgetSessionEvents(forkId)
    try {
      await withSideQuestionTimeout(client.deleteSession(forkId), this.sideQuestionCleanupMs)
    } catch (error) {
      console.error(`Could not delete side-question fork ${forkId}`, error)
      await this.store.retireSessionIds([forkId]).catch((retireError: unknown) => {
        console.error(`Could not retire side-question fork ${forkId}`, retireError)
      })
    }
  }

  /** Runs with the side-question runtime, starting it if it is not running. */
  private async withSideQuestionClient<T>(
    inTime: <W>(work: Promise<W>) => Promise<W>,
    run: (client: CopilotClientLike) => Promise<T>,
  ): Promise<T> {
    let runtime = this.sideQuestionRuntime
    if (!runtime) {
      const client = this.sideQuestionClientFactory()
      const started = client.start()
      runtime = { client, started, active: 0 }
      this.sideQuestionRuntime = runtime
      const current = runtime
      started.catch(() => {
        if (this.sideQuestionRuntime === current) this.sideQuestionRuntime = undefined
      })
    }
    if (runtime.idleTimer) clearTimeout(runtime.idleTimer)
    runtime.idleTimer = undefined
    runtime.active += 1
    try {
      try {
        await inTime(runtime.started)
      } catch (error) {
        // A runtime that did not start in time is replaced on the next question
        // rather than waited on again.
        if (this.sideQuestionRuntime === runtime) this.sideQuestionRuntime = undefined
        throw error
      }
      return await run(runtime.client)
    } finally {
      runtime.active -= 1
      if (!runtime.active && this.sideQuestionRuntime !== runtime) {
        void this.closeSideQuestionRuntime(runtime)
      } else if (!runtime.active && !this.stopped) {
        const idle = runtime
        idle.idleTimer = setTimeout(() => void this.closeSideQuestionRuntime(idle), this.sideQuestionIdleMs)
        idle.idleTimer.unref?.()
      }
    }
  }

  private async closeSideQuestionRuntime(
    runtime = this.sideQuestionRuntime,
  ): Promise<void> {
    if (!runtime || runtime.active) return
    if (this.sideQuestionRuntime === runtime) this.sideQuestionRuntime = undefined
    if (runtime.idleTimer) clearTimeout(runtime.idleTimer)
    const started = await withSideQuestionTimeout(runtime.started, this.sideQuestionCleanupMs)
      .then(() => true, () => false)
    const errors = await withSideQuestionTimeout(
      runtime.client.stop(),
      started ? this.sideQuestionCleanupMs : Math.min(1_000, this.sideQuestionCleanupMs),
    ).catch((error: unknown) => [error])
    if (errors.length && started) console.error('Could not stop the side-question runtime', errors)
  }

  start(phases: StartupPhases = silentStartupPhases): Promise<void> {
    if (this.stopped) {
      return Promise.reject(Object.assign(new Error('The session service is stopping'), { statusCode: 503 }))
    }
    if (this.startTask) return this.startTask
    this.resourceReads.start()
    this.resourceEpoch += 1
    const starting = this.admissions.run('@startup', () => this.startAdmitted(phases))
    this.startTask = starting
    void starting.then(
      () => {
        if (this.stopped) return
        this.dispatchReadyRecoverySeeds()
      },
      () => undefined,
    )
    void starting.catch(() => {
      if (this.startTask === starting) this.startTask = undefined
    })
    return starting
  }

  private async startAdmitted(phases: StartupPhases): Promise<void> {
    await phases.run('copilot.store', () => this.store.initialize())
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
    await phases.run('copilot.sdk', () => this.client.start())
    if (this.stopped) return
    try {
      const diagnostic = await readCopilotSdkRuntimeDiagnostic(this.client)
      if (diagnostic) {
        console.info(
          `Copilot SDK runtime: runtimeVersion=${diagnostic.runtimeVersion} ` +
          `protocolVersion=${diagnostic.protocolVersion} ` +
          `authenticated=${diagnostic.authenticated} ` +
          `authType=${diagnostic.authType ?? 'unknown'}`,
        )
      }
    } catch {
      console.warn('Unable to read Copilot SDK runtime diagnostic')
    }
    if (this.stopped) return
    await phases.run('copilot.models', () => this.ensureRuntimeModels()).catch((error: unknown) => {
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
      if (await phases.run('copilot.discovery', () => this.discoverSessions())) {
        await phases.run('copilot.recovery', () => this.finishStartupRecovery(phases))
      }
    } catch (error) {
      if (this.stopped) return
      if (!(error instanceof TerminalDiscoveryError)) throw error
      this.nativeStartupDiscoveryReady = false
      console.warn('Terminal discovery deferred during startup:', error)
      this.publishError('', error)
      await phases.run('copilot.recovery.persistence', () =>
        this.store.verifyPersistence())
      if (this.stopped) return
      await phases.run('copilot.recovery.sdk', () => this.recoverSdkSessions())
    }
    if (this.stopped) return
    await phases.run('copilot.queue.terminal', () =>
      Promise.all([...this.startupTerminalQueues].map((id) => this.drainTerminalQueue(id))))
    if (this.stopped) return
    this.discoveryTimer = setInterval(() => {
      void this.refreshDiscovery()
    }, 10_000)
    this.discoveryTimer.unref()
    this.transcriptTimer = setInterval(() => {
      void this.refreshTranscripts(Date.now())
    }, TRANSCRIPT_POLL_MS)
    this.transcriptTimer.unref()
    this.transcriptWakeTimer = setInterval(() => {
      this.transcriptWake ??= this.wakeChangedTranscripts().finally(() => {
        this.transcriptWake = undefined
      })
    }, TRANSCRIPT_WAKE_MS)
    this.transcriptWakeTimer.unref()
  }

  private async finishStartupRecovery(phases: StartupPhases = silentStartupPhases): Promise<void> {
    if (
      (!this.startupRecoveryPending && !this.terminalRecoveryStates?.size) ||
      this.stopped || this.lifecycleLocks.size || this.sessionCreations.size
    ) return
    // Discovery that changes nothing no longer writes the state file, so it
    // says nothing about whether the file can still be replaced. Recovery takes
    // terminal ownership, so it proves that first -- on every route here,
    // including discovery that was deferred at startup and retried later. Only
    // while recovery is pending; once it settles, this returns above.
    try {
      await phases.run('copilot.recovery.persistence', () => this.store.verifyPersistence())
    } catch (error) {
      this.nativeStartupDiscoveryReady = false
      throw error
    }
    this.terminalRecoveryStates ??= new Map(
      (this.terminalController.create ? this.store.terminalRecoverySessions() : [])
        .map(({ id }) => [id, 'pending']),
    )
    const recovered = await phases.run('copilot.recovery.terminal', () => this.recoverTerminalSessions())
    if (
      recovered > 0 &&
      !(await phases.run('copilot.recovery.discovery', () => this.discoverSessions()))
    ) return
    if (this.stopped) return
    await phases.run('copilot.recovery.sdk', () => this.recoverSdkSessions())
    if (this.stopped) return
    if (this.startupRecoveryPending) {
      // Terminal recovery reconciles each confirmed owner before admitting it.
      // Do not revisit those owners, or touch an indeterminate one's state.
      await phases.run('copilot.recovery.dispatches', () => this.reconcileUntrackedTerminalDispatches(
        this.store.list()
          .filter((session) => !this.terminalRecoveryStates!.has(session.id))
          .map((session) => session.id),
      ))
    }
    await phases.run('copilot.recovery.transcripts', () => this.refreshTranscripts())
    if (this.startupRecoveryPending) {
      await phases.run('copilot.queue.sdk', () => Promise.all(
        this.store.list()
          .filter((session) =>
            session.isOpen &&
            session.queuedPrompts?.length &&
            !session.suspended &&
            !this.store.recoverySeed(session.id) &&
            this.store.backend(session.id) !== 'terminal' &&
            !this.isTerminalRecoveryPending(session.id) &&
            !this.externalSessionIds.has(session.id),
          )
          .map((session) => this.drainSdkQueue(session.id)),
      ))
    }
    this.startupRecoveryPending = false
    this.dispatchRediscoveredTerminalQueues()
    if (![...this.terminalRecoveryStates.values()].includes('pending')) {
      this.terminalRecoveryStates = undefined
    }
  }

  private dispatchReadyRecoverySeeds(): void {
    if (this.stopped) return
    // Runs after every discovery cycle, so it reads identities rather than
    // copying every session's history.
    for (const session of this.store.discoveryIndex()) {
      const seed = this.store.recoverySeed(session.id)
      if (seed?.state !== 'pending') continue
      // A retained session's brief waits for Reopen, which dispatches it.
      if (session.interruptedAt || session.archivedAt) continue
      const terminal = this.store.backend(session.id) === 'terminal'
      if (terminal && this.isTerminalRecoveryPending(session.id)) continue
      this.scheduleRecoverySeedDispatch(session.id)
    }
  }

  private scheduleRecoverySeedDispatch(sessionId: string): void {
    void this.runRecoverySeedDispatch(sessionId).catch(
      (error: unknown) => this.publishError(sessionId, error),
    )
  }

  private runRecoverySeedDispatch(
    sessionId: string,
  ): Promise<SessionDetail | undefined> {
    const existing = this.recoverySeedDispatches.get(sessionId)
    if (existing) return existing
    if (this.stopped) return Promise.resolve(undefined)
    const dispatch = this.dispatchRecoverySeed(sessionId)
    this.recoverySeedDispatches.set(sessionId, dispatch)
    void dispatch.then(
      () => this.recoverySeedDispatches.delete(sessionId),
      () => this.recoverySeedDispatches.delete(sessionId),
    )
    return dispatch
  }

  private async dispatchRecoverySeed(sessionId: string): Promise<SessionDetail | undefined> {
    let prompt: string | undefined
    let terminal = false
    let completion: Promise<void> | undefined
    let handedOff = false
    try {
      const slot = await this.serializeLifecycle(sessionId, async () => {
        const delivery = this.admissions.run(sessionId, async () => {
          // Register the handoff while owning lifecycle admission, but release
          // that lease before provider I/O so discovery remains nonblocking.
          const release = this.holdDispatch(sessionId)
          try {
            const current = await this.store.readAfterWrites(sessionId)
            const seed = this.store.recoverySeed(sessionId)
            if (!seed || seed.state !== 'pending') return current
            terminal = this.store.backend(sessionId) === 'terminal' ||
              this.externalSessionIds.has(sessionId)
            if (
              this.stopped || this.deletingSessions.has(sessionId) ||
              current.suspended || this.suspendingSessions.has(sessionId) ||
              current.interruption || current.archivedAt ||
              (terminal && this.isTerminalRecoveryPending(sessionId))
            ) return undefined
            let claimed: SessionDetail
            try {
              claimed = await this.store.claimRecoverySeed(sessionId, seed.prompt)
            } catch (error) {
              // Retained after the read above: the brief stays pending for Reopen.
              if (isRetainedRefusal(error)) return undefined
              prompt = seed.prompt
              throw error
            }
            prompt = seed.prompt
            this.publish(claimed)
            if (terminal) {
              let sent: boolean
              const handedAt = Date.now()
              try {
                sent = this.terminalController.sendWhenIdle
                  ? await this.terminalController.sendWhenIdle(sessionId, seed.prompt)
                  : await this.terminalController.send(sessionId, seed.prompt, false)
              } catch (error) {
                if (deliveryUncertaintyFromError(error) === true) {
                  handedOff = true
                  this.admissions.markCommitted(sessionId)
                }
                throw error
              }
              if (!sent) throw new Error('Fresh terminal session did not accept the recovery brief')
              this.awaitTranscriptEcho(sessionId, handedAt)
              handedOff = true
              this.admissions.markCommitted(sessionId)
              const admitted = await this.store.admitRecoverySeed(
                sessionId, seed.prompt, new Date().toISOString(),
              )
              this.publish(admitted)
              return admitted
            }
            handedOff = true
            await this.startMessage(
              sessionId, seed.prompt, true, undefined, undefined, undefined,
              { preserveTitle: true, recoverySeedPrompt: seed.prompt },
            )
            completion = this.recoverySeedPromptRuns.get(sessionId)
            return this.store.get(sessionId)
          } finally {
            release()
          }
        }, true)
        return { delivery }
      })
      const handoff = await slot.delivery
      if (terminal || prompt === undefined) return handoff
      await completion
      if (this.stopped) {
        throw new Error('The service stopped before the recovery brief completed')
      }
      const completed = this.store.get(sessionId)
      if (!completed) {
        throw new Error('The recovered session disappeared before the recovery brief completed')
      }
      if (completed.status !== 'idle') {
        throw new Error(
          completed.activity ||
          completed.messages.at(-1)?.content ||
          `The recovery brief did not complete successfully; session status is ${completed.status}`,
        )
      }
      const admitted = await this.store.admitRecoverySeed(sessionId, prompt)
      this.publish(admitted)
      if (admitted.queuedPrompts?.length) this.wakeSdkQueue(sessionId)
      return admitted
    } catch (error) {
      if (prompt === undefined) throw error
      const detail = error instanceof Error ? error.message : String(error)
      const message = handedOff
        ? `Conversation recovered, but recovery brief admission could not be recorded after provider handoff; delivery is uncertain: ${detail}`
        : `Conversation recovered, but the context brief could not be sent: ${detail}`
      try {
        const failed = await this.store.failRecoverySeed(sessionId, prompt, message)
        this.publish(failed)
        this.publishError(sessionId, new Error(message))
        return failed
      } catch (persistError) {
        throw new AggregateError(
          [error, persistError],
          'Recovery brief dispatch failed and its failure state could not be saved',
        )
      }
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

  /**
   * Anything that could own, attach, or be delivering to the session. Checked
   * when an archival write commits, so an owner gained after a discovery
   * snapshot still keeps the record visible. Startup recovery must probe a
   * managed owner before any archival can clear its recovery intent.
   */
  private archivalBlocked(sessionId: string, recovering = false): boolean {
    return this.stopped ||
      this.sessions.has(sessionId) || this.loadingSessions.has(sessionId) ||
      this.hydratingSessions.has(sessionId) || this.activePrompts.has(sessionId) ||
      this.externalSessionIds.has(sessionId) || this.launchingTerminalSessionIds.has(sessionId) ||
      this.dispatchingSessions.has(sessionId) || this.drainingSessions.has(sessionId) ||
      this.terminalActivations.has(sessionId) || this.resumingSessions.has(sessionId) ||
      this.recoverySeedDispatches.has(sessionId) || this.deletingSessions.has(sessionId) ||
      this.suspendingSessions.has(sessionId) ||
      // Queued, running, or detached background work is still active work.
      hasActiveBackgroundTasks(this.backgroundTaskTracker.get(sessionId)) ||
      (!recovering && (
        this.startupRecoveryPending || this.isTerminalRecoveryPending(sessionId) ||
        this.admissions.hasPending(sessionId) || this.lifecycleLocks.has(sessionId)))
  }

  /**
   * Archive candidates whose owner is confirmed absent. A terminal-backed
   * record is probed directly, because discovery lists only processes it
   * recognizes; a live or unreadable pane is never treated as absent.
   */
  private async confirmArchivalAbsence(present: string[]): Promise<Set<string>> {
    const confirmed = new Set<string>()
    if (this.startupRecoveryPending) return confirmed
    await Promise.all(this.store.archivalCandidates(present).map(async (id) => {
      if (this.archivalBlocked(id)) return
      if (this.store.backend(id) !== 'sdk') {
        try {
          if (await this.terminalController.has(id)) return
        } catch {
          return
        }
      }
      confirmed.add(id)
    }))
    return confirmed
  }

  private assertNotRetained(sessionId: string, action: string, archivedOnly = false): void {
    assertSessionNotRetained(this.store.get(sessionId), action, archivedOnly)
  }

  private assertSendNotHeld(sessionId: string): void {
    const session = this.store.get(sessionId)
    if (session?.closedAt) {
      throw Object.assign(
        queueConflict('Reopen the closed session before sending. Nothing was sent.'),
        { uncertainDelivery: false },
      )
    }
    if (session?.launchStopping) {
      throw Object.assign(queueConflict('The launch is stopping; no new work can start.'), { uncertainDelivery: false })
    }
    if (session?.interruption || session?.archivedAt) {
      throw Object.assign(
        queueConflict('Reopen the interrupted session before sending. Nothing was sent.'),
        { uncertainDelivery: false },
      )
    }
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
    this.resourceReads.stop()
    this.resourceEpoch += 1
    this.stopped = true
    this.stopTask ??= this.stopSettled()
    return this.stopTask
  }

  private async stopSettled(): Promise<void> {
    // stop() has already closed the service to new work, and provider teardown
    // is now guaranteed. SDK disconnect clears handlers without an event, so
    // release tracker-only waits before lifecycle shutdown waits on them.
    for (const tracker of [...this.sdkFollowUpTrackers.values()]) {
      tracker.settleForTeardown()
    }
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
    if (this.transcriptWakeTimer) {
      clearInterval(this.transcriptWakeTimer)
      this.transcriptWakeTimer = undefined
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
    await Promise.allSettled(
      [...this.recoverySeedPromptRuns.keys()].map(async (sessionId) => {
        const session = this.sessions.get(sessionId)
        if (!session) return
        await session.disconnect()
        this.removeSdkOwner(sessionId, session)
      }),
    )
    await this.admissions.wait()
    // An already-admitted send can register its tracker after the first sweep.
    // Admission quiescence guarantees nothing can register after this one.
    for (const tracker of [...this.sdkFollowUpTrackers.values()]) {
      tracker.settleForTeardown()
    }
    await Promise.allSettled([...this.pendingAcknowledgements.values()])
    await Promise.allSettled([
      this.transcriptWake,
      ...this.transcriptSessionSyncs.values(),
      ...this.sdkQueueWakeups.values(),
      ...this.terminalQueueWakeups.values(),
      ...this.loadingSessions.values(),
      ...this.hydratingSessions.values(),
      this.runtimeModelLoad,
    ])
    await Promise.allSettled([...this.terminalInputReplies.values()].map((reply) => reply.completion))
    await Promise.allSettled(this.sdkReplyWrites())
    this.acceptedSdkReplies.clear()
    this.terminalFormUncertainty.clear()
    this.terminalFormContinuations.clear()
    this.terminalUserInputChecks.clear()
    this.terminalUpdateChecks.clear()
    this.answeredTerminalPermissions.clear()
    this.answeredTerminalInputs.clear()
    this.backgroundTaskSyncs.clear()
    this.backgroundTaskResyncNeeded.clear()
    this.backgroundTaskGenerations.clear()
    await Promise.all([...this.sessionCreations])
    while (this.sideQuestionCleanups.size) await Promise.all([...this.sideQuestionCleanups])
    await this.closeSideQuestionRuntime()
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
    for (const timer of this.terminalQueueRetryTimers.values()) clearTimeout(timer)
    this.terminalQueueRetryTimers.clear()
    this.terminalQueueStates.clear()
    for (const session of this.store.list()) {
      this.backgroundTaskTracker.remove(session.id)
    }
    const disconnected = await Promise.allSettled(
      [...this.sessions.values()].map((session) => session.disconnect()),
    )
    this.sessions.clear()
    const runtimeErrors = await this.client.stop()
    this.activePrompts.clear()
    for (const pending of this.pendingSdkFollowUps.values()) {
      pending.resolve()
    }
    this.pendingSdkFollowUps.clear()
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
    await Promise.allSettled([
      ...this.queuedPromptRuns.values(),
      ...this.recoverySeedPromptRuns.values(),
      ...this.recoverySeedDispatches.values(),
      ...this.queueOperations.values(),
    ])
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
      .filter((session) => session.isOpen && !this.hiddenSessionIds.has(session.id))
      .map((session) => ({
        ...this.publicSession(session),
        messages: [],
      }))
  }

  listHistory(): SessionDetail[] {
    return this.store.list()
      .filter((session) => !this.hiddenSessionIds.has(session.id))
      .map((session) => ({
        ...this.publicSession(session),
        messages: [],
      }))
  }

  /** Sessions closed through the app that can still be reopened, newest closure first. */
  listClosedSessions(): SessionDetail[] {
    return this.listHistory()
      .filter((session) => session.closedAt)
      .sort((left, right) => right.closedAt!.localeCompare(left.closedAt!))
  }

  /**
   * Keeps SDK sessions that belong to something else on this computer, such
   * as the manager agent's conversation, out of discovery and every list.
   * Called before they are created, so no discovery cycle can see them.
   */
  excludeFromDiscovery(ids: Iterable<string>): void {
    for (const id of ids) this.hiddenSessionIds.add(id)
  }

  listDirectories(path?: string, scope?: DirectoryScope) {
    return listHomeDirectories(path, scope)
  }

  validateSessionDirectory(inputPath: string): Promise<string> {
    return this.validateDirectory(inputPath)
  }

  validateKnowledgeRoot(
    inputPath: string,
    confinementPath?: string,
  ): Promise<string> {
    return validateKnowledgeRoot(inputPath, confinementPath)
  }

  ensureSessionKnowledgeBase(
    sessionId: string,
    relativePath: string,
    create: boolean,
  ): Promise<SessionKnowledgeBaseLocation> {
    return ensureKnowledgeDirectory(
      this.requireWorkspaceRoot(sessionId),
      relativePath,
      create,
    )
  }

  /**
   * Browses a knowledge root. The root is confined exactly like a session
   * working directory, and the requested path is confined within it by
   * `listWorkspace`, so no session is involved.
   */
  async listKnowledge(
    root: string,
    path = '.',
    confinementPath?: string,
  ) {
    return listWorkspace(root, path, confinementPath)
  }

  async readKnowledgeFile(
    root: string,
    path: string,
    confinementPath?: string,
  ) {
    return readWorkspaceFile(root, path, confinementPath)
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
    // Read as kept: opening one of these must not start its runtime.
    if (stored.interruption || stored.archivedAt || stored.closedAt || this.closingSessions.has(id)) {
      return this.publicSession(stored)
    }
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
      const interrupted = await this.store.markInterrupted(id, 'terminal-stopped')
      this.publish(interrupted)
      return this.publicSession(interrupted)
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
    const activated = await this.serializeLifecycle(
      id,
      () => this.admissions.run(
        id,
        () => this.activateSerialized(id),
        this.store.backend(id) === 'terminal',
      ),
    )
    // A context brief held while the session was retained goes out now,
    // once, ahead of its queue; the dispatcher takes the lifecycle lock itself.
    if (this.store.recoverySeed(id)?.state === 'pending') this.scheduleRecoverySeedDispatch(id)
    return this.publicSession(activated)
  }

  async configureRetention(
    id: string,
    input: import('../shared/contracts.js').SessionRetentionPatch,
  ): Promise<SessionDetail> {
    return this.serializeLifecycle(id, async () => {
      const session = await this.store.configureRetention(id, input)
      this.publish(session)
      return this.publicSession(session)
    })
  }

  private async activateSerialized(id: string): Promise<SessionDetail> {
    const terminal = this.store.backend(id) === 'terminal'
    if (terminal) {
      this.terminalActivations.add(id)
      this.admissionClosed.add(id)
      let releaseDispatch: (() => void) | undefined
      try {
        const stored = await this.store.readAfterWrites(id)
        this.assertTerminalQueueSettled(id, true)
        if (stored.suspended) {
          await this.openSession(id)
          const opened = await this.store.setOpen(id, true, true)
          this.publish(opened)
          return opened
        }
        await this.retireSdkOwnerForTerminalActivation(id)
        const hasQueue = Boolean(stored.queuedPrompts?.length)
        releaseDispatch = hasQueue ? this.holdDispatch(id) : undefined
        let hasOwner: boolean
        try {
          hasOwner = await this.terminalController.has(id)
        } catch (error) {
          throw Object.assign(
            new Error(
              `Terminal discovery has not settled for this session: ${
                error instanceof Error ? error.message : String(error)
              }`,
              { cause: error },
            ),
            { statusCode: 409 },
          )
        }
        if (!hasOwner) {
          if (!this.terminalController.reopen) {
            throw Object.assign(
              new Error('Reopening saved terminal sessions is not available'),
              { statusCode: 409 },
            )
          }
          const reopenStored = await this.store.readAfterWrites(id)
          this.launchingTerminalSessionIds.add(id)
          this.discoveryGeneration += 1
          try {
            await this.terminalController.reopen(
              id,
              reopenStored.cwd,
              reopenStored.title,
              reopenStored.runtime?.allowAllPermissions ?? true,
              reopenStored.runtime,
            )
          } catch (error) {
            throw Object.assign(
              new Error(
                `Unable to reopen terminal session from its saved Copilot state: ${
                  error instanceof Error ? error.message : String(error)
                }`,
                { cause: error },
              ),
              { statusCode: 409 },
            )
          } finally {
            this.discoveryGeneration += 1
            this.launchingTerminalSessionIds.delete(id)
          }
        }
        this.externalSessionIds.add(id)
        const opened = await this.store.setOpen(id, true, true)
        const ready = await this.reconcileReopenedTerminalStatus(id, opened)
        this.settleTerminalRecoveryForActivation(id)
        this.publish(ready)
        if (ready.queuedPrompts?.length) {
          await this.drainTerminalQueue(id, true)
        }
        return this.store.readAfterWrites(id)
      } finally {
        this.admissionClosed.delete(id)
        this.terminalActivations.delete(id)
        releaseDispatch?.()
      }
    }
    await this.store.readAfterWrites(id)
    this.assertTerminalQueueSettled(id)
    await this.openSession(id)
    const opened = await this.store.setOpen(id, true, true)
    this.publish(opened)
    return opened
  }

  async createSession(
    inputPath: string,
    terminalBacked = false,
    allowAllPermissions = true,
    provider: AgentProvider = 'copilot',
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
    mode?: AgentMode,
    launchId?: string,
  ): Promise<SessionDetail> {
    return this.launchCreations.run(this.store, launchId, async () => {
      if (provider !== 'copilot') {
        throw new Error(`Provider ${provider} is not handled by Copilot`)
      }
      if (mode !== undefined && !agentMode(mode)) {
        throw new RuntimeConfigurationError('Selected agent mode is not supported', 400)
      }
      const cwd = await this.validateDirectory(inputPath)
      const runtime = await this.creationRuntime(
        model,
        reasoningEffort,
        contextTier,
      )
      return this.publicSession(await this.runSessionCreation(() => terminalBacked
        ? this.createTerminalSession(
            cwd,
            allowAllPermissions,
            runtime || mode ? { ...runtime, ...(mode ? { mode } : {}) } : undefined,
            launchId,
          )
        : this.createSdkSession(cwd, allowAllPermissions, runtime, mode, launchId)))
    })
  }

  private async createSdkSession(
    cwd: string,
    allowAllPermissions: boolean,
    runtime?: CreationRuntime,
    mode?: AgentMode,
    launchId?: string,
  ): Promise<SessionDetail> {
    const sdkSession = await this.client.createSession({
      ...COPILOT_SDK_SESSION_DISCOVERY,
      ...COPILOT_SDK_SESSION_INTERACTION,
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
      this.installSdkOwner(sdkSession)
      this.hydratedSessions.add(sdkSession.sessionId)
      // The SDK has no initial mode, so it is set before the session is kept;
      // a refusal discards the new session like any other creation failure.
      if (mode) await sdkSession.rpc.mode.set({ mode })

      const now = new Date().toISOString()
      const session = await this.store.create(
        {
          id: sdkSession.sessionId,
          ...(launchId !== undefined ? { launchId } : {}),
          cwd,
          title: path.basename(cwd) || 'New session',
          updatedAt: now,
          status: 'idle',
          isOpen: true,
          messages: [],
          runtime: {
            allowAllPermissions,
            ...runtime,
            ...(mode ? { mode } : {}),
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
    return this.serializeLifecycle(
      id,
      () => this.configureRuntimeSerialized(id, input),
    )
  }

  private async configureRuntimeSerialized(
    id: string,
    input: ConfigureRuntimeInput,
  ): Promise<SessionDetail> {
    let stored = await this.store.readAfterWrites(id)
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
    this.assertNotRetained(id, 'changing its runtime')
    if (stored.suspended || this.suspendingSessions.has(id)) {
      throw suspendedRuntimeConflict()
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
      return this.publicSession(updated)
    }

    if (this.externalSessionIds.has(id)) {
      if (!this.terminalController.configure) {
        throw new Error('Terminal runtime configuration is not available')
      }
      if (!(await this.terminalController.configure(id, stored.cwd, configuration))) {
        throw new Error('External terminal is no longer available')
      }
      // Reconfiguring relaunched its Copilot process from the app.
      await this.store.claimTerminalRecovery(id)
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

  private async replyRecoveredSdkPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
    generation: number,
    providerRequestId: string,
  ): Promise<SessionDetail> {
    const key = `${sessionId}:${requestId}`
    const inFlight = this.recoveredPermissionReplies.get(key)
    if (inFlight) {
      if (inFlight.optionId !== optionId) {
        throw Object.assign(
          new Error('A different permission response is already being delivered.'),
          { statusCode: 409 },
        )
      }
      return inFlight.completion
    }
    const completion = this.deliverRecoveredSdkPermission(
      sessionId,
      requestId,
      optionId,
      generation,
      providerRequestId,
    ).finally(() => {
      if (this.recoveredPermissionReplies.get(key)?.completion === completion) {
        this.recoveredPermissionReplies.delete(key)
      }
    })
    this.recoveredPermissionReplies.set(key, { optionId, completion })
    return completion
  }

  private async deliverRecoveredSdkPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
    generation: number,
    providerRequestId: string,
  ): Promise<SessionDetail> {
    const sdkSession = this.sessions.get(sessionId)
    const permissionApi = sdkSession?.rpc.permissions
    if (
      !sdkSession ||
      !permissionApi ||
      !this.isCurrentSdkOwner(sessionId, sdkSession, generation)
    ) {
      throw Object.assign(
        new Error('The recovered permission belongs to an older SDK runtime. Nothing was sent.'),
        { statusCode: 409 },
      )
    }
    const previous = this.store.sdkAcceptedReply(sessionId)
    if (
      previous &&
      (previous.generation !== generation ||
        previous.requestId !== requestId ||
        previous.kind !== 'permission' ||
        previous.optionId !== optionId)
    ) {
      throw Object.assign(
        new Error('A different permission response was already accepted. Nothing was sent.'),
        { statusCode: 409 },
      )
    }
    if (!previous) {
      const accepted = await this.store.acceptSdkReply(sessionId, generation, {
        requestId,
        kind: 'permission',
        optionId,
        providerRequestId,
      })
      if (!accepted) {
        throw Object.assign(
          new Error('The recovered permission changed before the response was saved. Nothing was sent.'),
          { statusCode: 409 },
        )
      }
    }
    const delivery = await permissionApi.handlePendingPermissionRequest({
      requestId: providerRequestId,
      result: optionId === 'allow-once'
        ? { kind: 'approve-once', approvedInteractively: true }
        : { kind: 'reject', feedback: 'Rejected from Agentic Remote' },
    })
    if (!delivery.success) {
      const pending = await permissionApi.pendingRequests()
      const settled = await this.store.settleSdkRecovery(
        sessionId,
        generation,
        {
          state: 'interrupted',
          message: pending.items.some((item) => item.requestId === providerRequestId)
            ? 'The provider did not confirm the saved permission response. Delivery is uncertain; it was not sent again.'
            : 'The provider no longer reports this permission request. The saved response remains unconfirmed and was not sent again.',
        },
      )
      if (settled) this.publish(settled)
      if (settled) return this.publicSession(settled)
      throw Object.assign(
        new Error('The recovered permission changed while its provider state was reconciled.'),
        { statusCode: 409, uncertainDelivery: true },
      )
    }
    if (!this.isCurrentSdkOwner(sessionId, sdkSession, generation)) {
      throw Object.assign(
        new Error('The SDK runtime changed while the permission response was being delivered.'),
        { statusCode: 409 },
      )
    }
    const remaining = await permissionApi.pendingRequests()
    if (remaining.items.some((item) => item.requestId === providerRequestId)) {
      throw Object.assign(
        new Error('The provider has not confirmed the permission response yet. Retry the same response.'),
        { statusCode: 409 },
      )
    }
    await this.store.clearPendingRequest(
      sessionId,
      'pendingPermission',
      requestId,
      { status: 'running', activity: 'Continuing recovered turn' },
    )
    await this.store.clearSdkReply(sessionId, generation, requestId)
    const observation = this.store.observeTranscript(
      sessionId,
      () => this.isCurrentSdkOwner(sessionId, sdkSession, generation),
    )
    const events = await sdkSession.getEvents()
    if (events.length) {
      await this.store.replaceMessages(
        sessionId,
        messagesFromHistory(events),
        observation,
      )
    }
    const lastLifecycle = events.findLast(isForegroundLifecycleEvent)
    const completed =
      lastLifecycle?.type === 'assistant.turn_end' ||
      lastLifecycle?.type === 'session.idle'
    const settled = await this.store.settleSdkRecovery(
      sessionId,
      generation,
      completed
        ? { state: 'ready' }
        : {
            state: 'recovering',
            message: 'Permission answered. Recovering the provider turn before queued work can continue.',
          },
    )
    if (!settled) {
      throw Object.assign(
        new Error('The SDK recovery generation changed before the response settled.'),
        { statusCode: 409 },
      )
    }
    this.publish(settled)
    if (completed) {
      this.wakeSdkQueue(sessionId)
    } else {
      await this.settleAttachedSdkRecovery(sessionId, sdkSession, generation)
    }
    return this.publicSession(settled)
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
      throw suspendRefused('suspend.in-progress')
    }
    const queueWasDraining = this.drainingSessions.has(id)
    const startupQueueWasPending = this.startupTerminalQueues.has(id)
    // A delivery already handed to the runtime cannot be drained safely, but
    // an admitted queue claim must see the reservation below and abort itself.
    // The exclusive admission then waits for that rollback before teardown.
    this.assertNoActiveTurn(id)
    // Claimed before anything is awaited, so a message arriving while the
    // background tasks are being read cannot start a turn into a session that
    // is on its way down.
    this.suspendingSessions.add(id)
    let suspended = false
    try {
      const result = await this.admissions.exclusive(id, async () => {
        const current = await this.store.readAfterWrites(id)
        this.assertStillIdle(id, queueWasDraining)
        return this.suspendClaimedSession(id, current)
      })
      suspended = true
      this.startupTerminalQueues.delete(id)
      this.clearTerminalQueueRetry(id)
      this.terminalQueueStates.delete(id)
      this.terminalDrainRequested.delete(id)
      return result
    } finally {
      this.suspendingSessions.delete(id)
      const current = this.store.get(id)
      if (!suspended && queueWasDraining && current?.queuedPrompts?.length &&
          this.store.backend(id) !== 'terminal' && !this.externalSessionIds.has(id)) {
        this.sdkDrainRequested.add(id)
      }
      if (!suspended && startupQueueWasPending && current?.queuedPrompts?.length &&
          this.hasStartupQueueLifecycle(id, current)) {
        this.startupTerminalQueues.add(id)
        this.clearTerminalQueueRetry(id)
        this.terminalDrainRequested.add(id)
      }
      if (!suspended) this.wakeDeferredQueue(id)
    }
  }

  private async suspendClaimedSession(
    id: string,
    stored: SessionDetail,
  ): Promise<SessionDetail> {
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
    this.assertNotRetained(id, 'suspending it')
    if (stored.status === 'running' || stored.status === 'waiting') {
      throw suspendRefused('suspend.not-idle')
    }
    // The row still reads idle while one of these is under way, so the
    // refusal names what is in the way rather than contradicting it.
    if (
      this.drainingSessions.has(id) ||
      this.dispatchingSessions.has(id) ||
      this.store.recoverySeed(id)?.state === 'dispatching'
    ) {
      throw suspendRefused('suspend.delivery-in-flight')
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
      const events = await this.sessionEventReader(id).catch((cause: unknown) => {
        throw suspendRefused('suspend.transcript-unreadable', cause)
      })
      if (statusFromEvents(events) !== 'idle') {
        throw suspendRefused('suspend.not-idle')
      }
    }
    // The stored backend as well as the discovery set. Discovery can miss a
    // live terminal for a pass, and taking that as an SDK session found no
    // runtime to put down and recorded the session as suspended with its pane
    // still running. The controller proves absence, or does the teardown.
    if (this.externalSessionIds.has(id) || this.store.backend(id) === 'terminal') {
      if (!this.terminalController.stop) {
        throw lifecycleRefusal(
          'Terminal session suspend is not available',
          'suspend.terminal-unsupported',
          501,
        )
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
        const live = await this.sessionEventReader(id).catch((cause: unknown) => {
          throw suspendRefused('suspend.transcript-unreadable', cause)
        })
        if (statusFromEvents(live) !== 'idle') {
          throw suspendRefused('suspend.not-idle')
        }
        const running = backgroundTasksFromEvents(live, {
          assumeBackground: true,
        }).filter(
          (task) => task.status === 'running' || task.status === 'queued',
        )
        if (running.length) {
          throw suspendRefused('suspend.background-tasks')
        }
        this.assertStillIdle(id)
      })
      this.discoveryGeneration += 1
      if (!closed) {
        throw suspendRefused('suspend.terminal-not-closed')
      }
      this.externalSessionIds.delete(id)
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
        this.removeSdkOwner(id, active)
      }
      this.activePrompts.delete(id)
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
    const tasks = await this.listBackgroundTasks(id).catch((cause: unknown) => {
      throw suspendRefused('suspend.background-tasks-unreadable', cause)
    })
    if (!tasks.supported) {
      // An empty list because the runtime could not be asked is not the same
      // as an empty list because nothing is running, and suspending on the
      // strength of it disconnects a session that still owns live work.
      throw suspendRefused('suspend.background-tasks-unreadable')
    }
    if (hasActiveBackgroundTasks(tasks)) {
      throw suspendRefused('suspend.background-tasks')
    }
  }

  /**
   * Refuses unless the session is still doing nothing.
   *
   * Suspending awaits twice over, and the session is only reserved against
   * other suspensions. Idleness is the whole precondition, so it is checked
   * again after each wait rather than once at the start.
   */
  private assertStillIdle(id: string, queueWasDraining = false): void {
    this.assertTerminalQueueSettled(id)
    if (queueWasDraining || this.drainingSessions.has(id)) {
      throw suspendRefused('suspend.delivery-in-flight')
    }
    this.assertNoActiveTurn(id)
  }

  private assertNoActiveTurn(id: string): void {
    const current = this.store.get(id)
    if (
      !current ||
      current.status === 'running' ||
      current.status === 'waiting' ||
      this.activePrompts.has(id)
    ) {
      throw suspendRefused('suspend.not-idle')
    }
    // A prompt already on its way to the runtime. The store still says idle
    // until the turn is recorded, so without this the teardown lands on a
    // turn that has already started.
    if (this.dispatchingSessions.has(id)) {
      throw suspendRefused('suspend.delivery-in-flight')
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
    // Resuming would start an owner for a record that stays archived.
    this.assertNotRetained(id, 'resuming it', true)
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
    // Restart attaches a provider owner; a retained record would be live yet
    // hidden or read-only. Reopen is the one path that clears retention.
    this.assertNotRetained(id, 'restarting it')
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
      this.drainingSessions.has(id) ||
      this.dispatchingSessions.has(id) ||
      this.store.recoverySeed(id)?.state === 'dispatching'
    ) {
      throw lifecycleRefusal('Session can only restart while idle', 'restart.not-idle')
    }
    let terminalRestarted = false
    if (this.externalSessionIds.has(id)) {
      let restartError: unknown
      try {
        terminalRestarted =
          Boolean(this.terminalController.restart) &&
          await this.terminalController.restart!(id, stored.cwd)
      } catch (error) {
        restartError = error
      }
      if (!terminalRestarted) {
        const ownerStopped =
          (await this.terminalController.ownerStopped?.(id)) === true
        if (!ownerStopped) {
          if (restartError) throw restartError
          throw new Error(
            'The terminal owner is still available or could not be confirmed stopped',
          )
        }
      }
      if (!terminalRestarted && !this.store.isManagedOpen(id)) {
        throw new Error('External terminal is no longer available')
      }
      // Restarted in place: the app relaunched its Copilot process.
      if (terminalRestarted) await this.store.claimTerminalRecovery(id)
    }
    if (!terminalRestarted) {
      // Retired before anything is torn down. A read that settles while the
      // old runtime is being disconnected still answers for it, and releasing
      // the queue on that answer sends the prompt into the runtime being
      // replaced.
      this.backgroundTaskGenerations.set(
        id, (this.backgroundTaskGenerations.get(id) ?? 0) + 1,
      )
      const active = this.sessions.get(id)
      if (active) {
        await active.disconnect()
        this.removeSdkOwner(id, active)
      }
      this.activePrompts.delete(id)
      const previousTasks = this.backgroundTaskTracker.get(id)
      this.backgroundTaskSyncs.delete(id)
      this.backgroundTaskResyncNeeded.delete(id)
      this.backgroundTaskTracker.remove(id)
      this.replaceBackgroundTasks(id, [], previousTasks.supported)
      const attached = await this.attachSdkSession(id)
      try {
        await this.store.setBackend(id, 'sdk')
      } catch (error) {
        if (this.sessions.get(id) === attached) {
          await attached.disconnect()
          this.removeSdkOwner(id, attached)
        }
        throw error
      }
      this.externalSessionIds.delete(id)
      await this.syncBackgroundTasks(id, attached, false).catch((error: unknown) =>
        this.publishError(id, error),
      )
    }
    if (stored.failedPrompt) {
      await this.store.clearFailedPrompt(id, stored.failedPrompt.failedAt)
    }
    const restarted = await this.store.update(id, (session) => {
      session.status = 'idle'
      session.activity = undefined
      session.pendingPermission = undefined
      session.updatedAt = new Date().toISOString()
    })
    this.publish(restarted)
    // Only an SDK session drains through this path. A tmux session keeps its
    // own runtime, and waking it here would start a second owner beside it.
    if (restarted.queuedPrompts?.length && !terminalRestarted) {
      this.wakeSdkQueue(id)
    }
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
    this.assertNotRetained(id, 'moving it to tmux')
    if (this.store.backend(id) === 'terminal') {
      return stored
    }
    if (stored.suspended || this.suspendingSessions.has(id)) {
      throw new Error('Resume the session before moving it to tmux')
    }
    if (
      stored.status !== 'idle' ||
      this.drainingSessions.has(id) ||
      this.dispatchingSessions.has(id) ||
      this.store.recoverySeed(id)?.state === 'dispatching'
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
      this.removeSdkOwner(id, active)
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
    this.assertRecoverySeedReplacementAvailable(id)
    if (this.suspendingSessions.has(id)) {
      throw suspendedRuntimeConflict()
    }
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

  async recoverConversation(
    id: string,
    reason: SessionRecoveryReason,
  ): Promise<SessionDetail> {
    this.queuedDispatches.assertAvailable(id)
    this.assertRecoverySeedReplacementAvailable(id)
    const observed = this.store.observeTranscript(id)
    let recovered: SessionDetail
    try {
      recovered = await this.admissions.exclusive(id, (ownership) =>
        this.serializeLifecycle(id, async () => {
          if (ownership.joinedActivity) {
            throw Object.assign(
              new Error('A prompt or command was admitted while recovery waited; nothing was replaced'),
              { statusCode: 409 },
            )
          }
          await this.assertRecoveryBackgroundTasksSettled(id)
          return this.clearSerialized(id, {
            ...observed,
            isCurrent: () => ownership.isCurrent() &&
              !this.activePrompts.has(id) && !this.drainingSessions.has(id) &&
              !(this.dispatchingSessions.get(id) || 0) && !this.suspendingSessions.has(id),
          }, reason)
        }),
      )
    } finally {
      this.wakeDeferredQueue(id)
    }
    // The identity is durable; provider completion must not hold the node
    // response (and the hub's replacement metadata carry-over) open.
    this.scheduleRecoverySeedDispatch(recovered.id)
    return this.publicSession(recovered)
  }

  private async clearSerialized(
    id: string,
    observed: TranscriptObservation,
    recoveryReason?: SessionRecoveryReason,
  ): Promise<SessionDetail> {
    const stored = await this.store.readAfterWrites(id)
    // Clearing builds a live replacement; from a retained record it would be
    // live yet hidden behind the archive or interruption.
    this.assertNotRetained(id, recoveryReason ? 'recovering its conversation' : 'clearing it')
    this.assertTerminalQueueSettled(id)
    this.queuedDispatches.assertAvailable(id)
    this.assertRecoverySeedReplacementAvailable(id)
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
    const stalePending =
      stored.pendingPermission?.stale === true ||
      stored.pendingUserInput?.stale === true
    if (
      recoveryReason &&
      hasActiveBackgroundTasks(this.backgroundTaskTracker.get(id))
    ) {
      throw Object.assign(new Error(
        'Wait for queued or running background tasks to finish before recovering the conversation',
      ), { statusCode: 409 })
    }
    if (
      stored.status === 'running' ||
      stored.status === 'waiting' ||
      ((stored.pendingPermission || stored.pendingUserInput) &&
        !(recoveryReason && stalePending)) ||
      this.drainingSessions.has(id) || this.activePrompts.has(id) ||
      (this.dispatchingSessions.get(id) || 0) > 0 ||
      !this.store.isCurrentTranscript(id, observed)
    ) {
      throw Object.assign(new Error(
        recoveryReason
          ? 'Conversation can only be recovered from an idle, error, or stale-interaction state'
          : 'Conversation can only be cleared while the session is idle',
      ), { statusCode: 409 })
    }
    const pendingContext = stored.pendingUserInput?.stale
      ? `Unresolved user-input request before restart: ${stored.pendingUserInput.question}`
      : undefined
    const recoveryBrief = recoveryReason
      ? buildRecoveryBrief([
          ...stored.messages,
          ...(pendingContext
            ? [{
                id: randomUUID(),
                role: 'notice' as const,
                content: pendingContext,
                createdAt: new Date().toISOString(),
              }]
            : []),
        ])
      : undefined
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
        const replacementObservation = {
          ...observed,
          isCurrent: () => observed.isCurrent?.() !== false &&
            (terminalBacked || this.sessions.get(id) === original),
        }
        cleared = recoveryReason && recoveryBrief
          ? await this.store.replaceWithRecoveredSession(
              id,
              replacementId,
              recoveryReason,
              recoveryBrief.messageCount,
              recoveryBrief.truncated,
              recoveryBrief.prompt,
              replacementObservation,
              terminalBacked,
            )
          : await this.store.replaceWithClearedSession(
              id,
              replacementId,
              replacementObservation,
              terminalBacked,
            )
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
            ...COPILOT_SDK_SESSION_DISCOVERY,
            ...COPILOT_SDK_SESSION_INTERACTION,
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
          this.installSdkOwner(fresh, replacementId)
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
        }
        // A session can keep a mode without a model, and a fresh one always
        // starts Interactive.
        const storedMode = runtime?.mode || agentMode(stored.runtime?.mode)
        if (fresh && (runtime || (storedMode && storedMode !== 'interactive'))) {
          await fresh.rpc.mode
            .set({ mode: storedMode || 'interactive' })
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
      this.transcriptChangesTakenAt.delete(id)
      this.transcriptTakeInCosts.delete(id)
      this.awaitedTranscriptEchoes.delete(id)
      this.workspaceVersions.delete(id)
      this.backgroundTaskSyncs.delete(id)
      this.backgroundTaskTracker.remove(id)
      this.liveTranscriptWatermarks.delete(id)
      this.liveActivityEvents.delete(id)
      this.activePrompts.delete(id)
      this.queueOperations.delete(id)
      this.clearTerminalQueueRetry(id)
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
      return this.store.get(replacementId) || cleared
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
    launchId?: string,
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
          ...(launchId !== undefined ? { launchId } : {}),
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
    replaceTerminalDraft = false,
    deliveryId?: string,
  ): Promise<SessionDetail> {
    try {
      if (deliveryId !== undefined) {
        if (replaceTerminalDraft || acknowledgedFailure) {
          throw Object.assign(queueConflict('Identified delivery cannot replace a draft or acknowledge another prompt.'), { uncertainDelivery: false })
        }
        return await this.admissions.run(sessionId, async () => {
          // A retry reads the durable receipt even after cancellation or retention.
          const existing = this.store.get(sessionId)
          if (!existing?.promptReceipts?.some((receipt) => receipt.deliveryId === deliveryId)) {
            if (this.stopped || this.deletingSessions.has(sessionId)) throw queueConflict('The session service is stopping.')
            this.assertSendNotHeld(sessionId)
          }
          const accepted = await this.store.acceptIdentifiedPrompt(sessionId, deliveryId, rawContent, enqueue)
          this.admissions.markCommitted(sessionId)
          if (this.externalSessionIds.has(sessionId)) this.terminalDrainRequested.add(sessionId)
          else this.sdkDrainRequested.add(sessionId)
          this.publish(accepted)
          return this.publicSession(accepted)
        })
      }
      return await this.admissions.run(sessionId, async () =>
        this.publicSession(await this.sendAdmittedMessage(
          sessionId,
          rawContent,
          enqueue,
          acknowledgedFailure,
          replaceTerminalDraft,
        )))
    } finally {
      this.wakeDeferredQueue(sessionId)
    }
  }

  private async sendAdmittedMessage(
    sessionId: string,
    rawContent: string,
    enqueue: boolean,
    acknowledgedFailure?: string,
    replaceTerminalDraft = false,
    answerDelivery?: TerminalAnswerDelivery,
    releaseTerminalImmediate?: () => void,
  ): Promise<SessionDetail> {
    const content = rawContent.trim()
    if (this.stopped) throw queueConflict('The session service is stopping.')
    if (this.store.get(sessionId)?.queuedDispatch && (!enqueue || acknowledgedFailure)) {
      this.queuedDispatches.assertAvailable(sessionId)
    }
    if (!content) {
      throw new Error('Message cannot be empty')
    }
    if (replaceTerminalDraft && enqueue) {
      throw Object.assign(
        new Error('Terminal draft replacement is only available for immediate sends.'),
        { statusCode: 409, uncertainDelivery: false },
      )
    }
    this.assertRecoveryClaimAvailable(sessionId, acknowledgedFailure)
    this.assertRecoveryAttemptAvailable(sessionId, acknowledgedFailure)
    if (
      !releaseTerminalImmediate &&
      !answerDelivery &&
      (
        this.store.backend(sessionId) === 'terminal' ||
        this.externalSessionIds.has(sessionId)
      )
    ) {
      return this.serializeTerminalImmediate(sessionId, (releaseOrder) =>
        this.sendAdmittedMessage(
          sessionId,
          rawContent,
          enqueue,
          acknowledgedFailure,
          replaceTerminalDraft,
          answerDelivery,
          releaseOrder,
        ))
    }
    await this.store.readAfterWrites(sessionId)
    this.assertTerminalQueueSettled(sessionId)
    // Before any recovery token is claimed: a queued send must not consume it.
    this.assertSendNotHeld(sessionId)
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
        // Refused before anything was handed over, so what was written is
        // safe to send again. Saying nothing leaves the reader with a warning
        // that it might already have gone.
        uncertainDelivery: false,
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
    delivery.ordered = releaseTerminalImmediate
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
          replaceTerminalDraft,
          answerDelivery,
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
    this.assertRecoveryClaimAvailable(sessionId, acknowledged)
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

  private assertRecoveryClaimAvailable(
    sessionId: string,
    acknowledged?: string,
  ): void {
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
  }

  private assertRecoveryAttemptAvailable(
    sessionId: string,
    acknowledged?: string,
  ): void {
    const attempt = this.store.recoveryResend(sessionId)
    if (!attempt || attempt.accepted || acknowledged !== undefined) return
    throw new SubmissionError(
      'A recovery attempt is still awaiting a durable delivery receipt. Resolve it before sending other work.',
      409,
      { sessionId, failedAt: attempt.failedAt, accepted: false },
      { uncertainDelivery: true },
    )
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
    delivery?.ordered?.()
  }

  private submissionFailure(
    error: unknown,
    sessionId: string,
    claim: RecoveryResendClaim | undefined,
    accepted: boolean,
  ): unknown {
    if (!claim && !accepted) {
      if (error instanceof SubmissionError) return error
      if (error && typeof error === 'object') {
        if (deliveryUncertaintyFromError(error) === undefined) {
          Reflect.set(error, 'uncertainDelivery', false)
        }
        return error
      }
      return new SubmissionError(
        'The request could not be completed. Check the session before retrying.',
        500,
        undefined,
        { uncertainDelivery: false },
      )
    }
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
    }, {
      cause: error,
      terminalDraftConflict: terminalDraftConflictFromError(error),
      uncertainDelivery: accepted || isUncertainDelivery(error),
    })
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
    replaceTerminalDraft = false,
    answerDelivery?: TerminalAnswerDelivery,
  ): Promise<SessionDetail> {
    await this.store.readAfterWrites(sessionId)
    if (this.store.get(sessionId)?.launchStopping) throw queueConflict('The launch is stopping; no new work can start.')
    this.assertTerminalQueueSettled(sessionId)
    if (this.store.recoverySeed(sessionId)) {
      if (enqueue) return this.enqueuePrompt(sessionId, content, false, answers, delivery)
      throw queueConflict('The recovery brief must be admitted before other work can run. Queue this message instead.')
    }
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
      throw Object.assign(new Error('The session is still resuming'), { statusCode: 409, uncertainDelivery: false })
    }
    if (
      this.terminalController.ownsStartupPrompt?.(sessionId) ||
      this.terminalAdmissionOperations.has(sessionId)
    ) {
      if (answerDelivery) throw terminalAnswerRefused()
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
          replaceTerminalDraft,
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
      replaceTerminalDraft,
      answerDelivery,
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
    replaceTerminalDraft = false,
    answerDelivery?: TerminalAnswerDelivery,
  ): Promise<SessionDetail> {
    if (answerDelivery && (enqueue || !terminalBacked)) throw terminalAnswerRefused()
    if (!enqueue) {
      if (this.drainingSessions.has(sessionId)) {
        throw queueConflict('The queue is dispatching. This message was not sent.')
      }
      this.queuedDispatches.assertAvailable(sessionId)
    }
    if (this.stopped || this.deletingSessions.has(sessionId)) {
      throw queueConflict('The session is no longer available.')
    }
    if (replaceTerminalDraft && !terminalBacked) {
      throw Object.assign(
        new Error('Terminal draft replacement is only available for tmux-backed Copilot sessions.'),
        { statusCode: 409, uncertainDelivery: false },
      )
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
        // Refused before anything was handed over, so what was written is
        // safe to send again. Saying nothing leaves the reader with a warning
        // that it might already have gone.
        uncertainDelivery: false,
      })
    }
    let resolvedStartup = false
    let startupIdle = false
    let terminalWorking = false
    let terminalPane: string | undefined
    if (terminalBacked) {
      if (
        answerDelivery &&
        (this.terminalAdmissionOperations.has(sessionId) ||
          this.terminalController.ownsStartupPrompt?.(sessionId))
      ) {
        throw terminalAnswerRefused()
      }
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
            replaceTerminalDraft,
          ),
        )
      }
      // A full-screen view takes the keyboard, so a prompt sent now is typed
      // into its search box: it filters a list, a stray Enter can pick from
      // it, and nothing says the prompt was never delivered. Refusing is
      // recoverable in a way that silently losing it is not.
      const pane = await this.terminalController.capture?.(sessionId)
      terminalPane = pane
      terminalWorking = Boolean(
        pane &&
          (isTerminalAgentWorking(pane) ||
            (!isTerminalVisiblyIdle(pane) &&
              (await this.terminalTurnOpen(sessionId)))),
      )
      // An answer is never steered into work that started after its stale
      // card was inspected; the terminal rechecks idleness under its lock.
      if (
        answerDelivery &&
        (!pane ||
          terminalWorking ||
          isTerminalOverlay(pane) ||
          this.terminalAdmissionOperations.has(sessionId) ||
          this.terminalController.ownsStartupPrompt?.(sessionId))
      ) {
        throw terminalAnswerRefused()
      }
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
            replaceTerminalDraft,
          ),
        )
      }
      const ownsStartup =
        startupLocked &&
        (this.terminalController.ownsStartupPrompt?.(sessionId) ?? false)
      if (ownsStartup || (pane && isTerminalOverlay(pane))) {
        if (
          enqueue &&
          pane &&
          isTerminalSessionInUseConflict(pane) &&
          !isTerminalSessionInUsePrompt(pane)
        ) {
          return this.enqueueTerminalPrompt(
            sessionId,
            content,
            false,
            answers,
            delivery,
          )
        }
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
              replaceTerminalDraft,
            ),
          )
        }
        const canHandleStartup =
          !(pane && isTerminalSessionInUseConflict(pane)) &&
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
          throw await this.startupRefusal(sessionId, pane, 'send this again')
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
      throw Object.assign(new Error('The session is changing state; try again once it settles'), { statusCode: 409, uncertainDelivery: false })
    }
    if (terminalBacked) this.assertStartupDispatchSettled(sessionId, enqueue)
    // Startup and owner detection are awaited, so FIFO may have grown meanwhile.
    // Only the claimed failure holding that queue may be resent ahead of it.
    // A retained answer replies to the question older prompts queued behind,
    // so it goes first and the queue drains after it.
    if (
      terminalBacked &&
      !enqueue &&
      !answerDelivery &&
      current.queuedPrompts?.length &&
      !terminalWorking &&
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
    const steer =
      terminalBacked && !answerDelivery && !nativeEnqueue && terminalWorking
    if (
      steer &&
      current.queuedPrompts?.length &&
      (answers === undefined || current.failedPrompt?.failedAt !== answers) &&
      (await this.shouldEnqueueTerminalPrompt(sessionId))
    ) {
      if (
        replaceTerminalDraft &&
        (!terminalPane || composerHoldsText(terminalPane))
      ) {
        throw Object.assign(
          new Error(
            'Older prompts are waiting in the queue. The terminal draft was not replaced.',
          ),
          { statusCode: 409, uncertainDelivery: false },
        )
      }
      return this.enqueueTerminalPrompt(sessionId, content, false, answers, delivery, true)
    }
    // Discovery can hold the queue behind Reopen while this send reads the
    // pane and decides, or while the controller reads it again before typing.
    // A held session is not eligible to queue, so the send would otherwise be
    // typed in front of the held work.
    const confirm = terminalBacked ? () => this.assertSendNotHeld(sessionId) : undefined
    confirm?.()
    const sendOptions: TerminalSendOptions | undefined = answerDelivery
      ? { idleOnly: true }
      : steer
        ? {
            allowDuringAgentExecution: true,
            ...(replaceTerminalDraft ? { replaceExistingInput: true } : {}),
          }
        : replaceTerminalDraft
          ? { replaceExistingInput: true }
          : undefined
    let terminalSent: boolean
    try {
      terminalSent = await this.sendTerminalInput(
        sessionId,
        content,
        nativeEnqueue,
        confirm ? { ...sendOptions, confirm } : sendOptions,
      )
    } catch (error) {
      // A steer the busy terminal could not take yet goes on the queue, just
      // as Queue would have put it, rather than coming back as an error. It
      // was refused before anything was typed, so it is queued exactly once.
      if (
        steer &&
        !replaceTerminalDraft &&
        !delivery?.accepted &&
        isTerminalNotReadyRefusal(error) &&
        this.canQueueRefusedSteer(sessionId) &&
        (await this.shouldEnqueueTerminalPrompt(sessionId))
      ) {
        console.warn('A steer found the terminal not ready, so it waits for the composer')
        const priorityRecovery =
          answers !== undefined &&
          this.store.get(sessionId)?.failedPrompt?.failedAt === answers
        return this.enqueueTerminalPrompt(
          sessionId,
          content,
          false,
          answers,
          delivery,
          true,
          priorityRecovery,
        )
      }
      throw error
    }
    if (terminalSent) {
      // The terminal has it. Anything that fails from here leaves a send that
      // went out, however ordinary the failure.
      if (startupLocked && !nativeEnqueue) {
        this.terminalAdmissionDispatched.add(sessionId)
      }
      if (nativeEnqueue) {
        await this.recordDelivery(sessionId, answers, delivery)
        await this.store.claimTerminalRecovery(sessionId)
        const queued = await this.store.update(sessionId, (session) => {
          session.activity = 'Queued in terminal'
        })
        this.publish(queued)
        return queued
      }
      if (delivery) delivery.accepted = true
      answerDelivery?.onAccepted()
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
    // The terminal declined the answer without typing it. It must never fall
    // through to the SDK or the queue, where it would run behind other work.
    if (answerDelivery) throw terminalAnswerRefused()
    const sdkBackgroundAgentRunning =
      !terminalBacked &&
      hasRunningBackgroundAgent(this.backgroundTaskTracker.get(sessionId))
    if (
      !terminalBacked &&
      current.status === 'error' &&
      current.failedPrompt?.uncertain &&
      current.failedPrompt.failedAt !== answers
    ) {
      throw Object.assign(
        new Error(
          'The previous SDK follow-up may already have been accepted. Resolve it or restart the session before sending again.',
        ),
        { statusCode: 409 },
      )
    }
    if (
      !terminalBacked &&
      !enqueue &&
      this.activePrompts.has(sessionId)
    ) {
      return this.sendSdkFollowUp(
        sessionId,
        content,
        answers,
        delivery,
      )
    }
    if (
      enqueue &&
      (this.activePrompts.has(sessionId) ||
        this.drainingSessions.has(sessionId) ||
        sdkBackgroundAgentRunning)
    ) {
      return this.enqueuePrompt(sessionId, content, false, answers, delivery)
    }
    if (
      this.activePrompts.has(sessionId) ||
      this.drainingSessions.has(sessionId)
    ) {
      throw Object.assign(new Error('This session is already responding'), {
        statusCode: 409,
        uncertainDelivery: false,
      })
    }

    return this.startMessage(sessionId, content, false, undefined, answers, delivery)
  }

  private async sendSdkFollowUp(
    sessionId: string,
    content: string,
    answers?: string,
    delivery?: DeliveryBoundary,
  ): Promise<SessionDetail> {
    const sdkSession = await this.ensureLoaded(sessionId)
    if (!sdkSession.send) {
      throw Object.assign(
        new Error(
          'This SDK runtime does not support immediate follow-up prompts. Use Queue instead.',
        ),
        { statusCode: 409, uncertainDelivery: false },
      )
    }
    const active = this.activePrompts.get(sessionId)
    if (!active) {
      return this.startMessage(
        sessionId,
        content,
        false,
        undefined,
        answers,
        delivery,
      )
    }
    if (this.pendingSdkFollowUps.has(sessionId)) {
      // Two follow-ups admitted at once would share one pending slot, so each
      // would take the turn the other is steering and the replies would attach
      // to whichever assistant message won the race. Nothing has been handed
      // over yet, so this is a plain refusal.
      throw Object.assign(
        new Error(
          'A follow-up prompt is already being sent. Wait for it, or use Queue to add this message after it.',
        ),
        { statusCode: 409, uncertainDelivery: false },
      )
    }
    let resolvePending = () => {}
    const pending: PendingSdkFollowUp = {
      settled: new Promise<void>((resolve) => {
        resolvePending = resolve
      }),
      resolve: () => resolvePending(),
      previousCompleted: false,
    }
    this.pendingSdkFollowUps.set(sessionId, pending)
    // Only ever releases this follow-up's own slot, so a release cannot take
    // away the one a later follow-up is relying on.
    const releasePending = () => {
      pending.resolve()
      if (this.pendingSdkFollowUps.get(sessionId) === pending) {
        this.pendingSdkFollowUps.delete(sessionId)
      }
    }
    const assistantId = randomUUID()
    let prepared: SessionDetail
    try {
      prepared = await this.store.beginSdkFollowUp(
        sessionId,
        content,
        assistantId,
        active.assistantMessageId,
        () =>
          this.pendingSdkFollowUps.get(sessionId) === pending &&
          this.activePrompts.get(sessionId)?.assistantMessageId ===
            active.assistantMessageId,
      )
    } catch (error) {
      releasePending()
      throw error
    }
    this.publish(prepared)
    const tracker = this.trackSdkFollowUp(sdkSession, assistantId)
    try {
      const messageId = await sdkSession.send({
        prompt: content,
        mode: 'immediate',
      })
      if (!messageId) {
        throw new Error('The SDK did not confirm the follow-up prompt')
      }
      this.admissions.markCommitted(sessionId)
      if (delivery) delivery.accepted = true
      this.activePrompts.set(sessionId, {
        assistantMessageId: assistantId,
      })
      if (pending.previousCompleted || !this.sdkTurnsAwaited.has(sessionId)) {
        tracker.activate()
        // Stopped while it was being handed over, so it may never write
        // anything and the idle is all that is left to end it.
        if (pending.stopped) tracker.settleWhenIdle()
        this.sdkFollowUpTrackers.get(sessionId)?.cancel()
        this.sdkFollowUpTrackers.set(sessionId, tracker)
      } else {
        tracker.cancel()
      }
      releasePending()
      await this.recordDelivery(sessionId, answers, delivery)
      return this.store.get(sessionId) || prepared
    } catch (error) {
      if (delivery?.accepted) {
        throw error
      }
      try {
        const definitive = explicitlyRefused(error)
        if (definitive) {
          tracker.cancel()
          const restored = await this.store.cancelSdkFollowUp(
            sessionId,
            assistantId,
            active.assistantMessageId,
          )
          this.publish(restored)
        } else {
          // Handed to the SDK before this failed, so it may already be
          // steering the turn. Committing the admission stops the same
          // steering going out twice, and stops a clear assuming nothing ran.
          this.admissions.markCommitted(sessionId)
          this.activePrompts.set(sessionId, {
            assistantMessageId: assistantId,
          })
          if (pending.previousCompleted || !this.sdkTurnsAwaited.has(sessionId)) {
            tracker.activate()
            if (pending.stopped) tracker.settleWhenIdle()
            this.sdkFollowUpTrackers.get(sessionId)?.cancel()
            this.sdkFollowUpTrackers.set(sessionId, tracker)
          } else {
            tracker.cancel()
          }
          if (
            error &&
            typeof error === 'object' &&
            deliveryUncertaintyFromError(error) === undefined
          ) {
            Reflect.set(error, 'uncertainDelivery', true)
          }
          const failed = await this.store.failSdkFollowUp(
            sessionId,
            assistantId,
            error instanceof Error ? error.message : String(error),
            content,
          )
          this.publish(failed)
        }
      } finally {
        releasePending()
      }
      throw error
    }
  }

  private trackSdkFollowUp(
    sdkSession: CopilotSessionLike,
    assistantMessageId: string,
  ): SdkFollowUpTracker {
    const sessionId = sdkSession.sessionId
    let active = false
    let closed = false
    let responseStarted = false
    let resolveSettled = () => {}
    const settled = new Promise<void>((resolve) => {
      resolveSettled = resolve
    })
    const complete = (completion: Promise<void>) => {
      void completion
        .catch((error: unknown) => this.publishError(sessionId, error))
        .finally(resolveSettled)
    }
    const unsubscribe = sdkSession.on((event) => {
      if (!active || closed || eventAgentId(event)) return
      if (
        event.type === 'assistant.message_delta' ||
        event.type === 'assistant.message' ||
        event.type === 'tool.execution_start' ||
        event.type === 'tool.execution_complete'
      ) {
        responseStarted = true
      }
      if (event.type === 'session.idle') {
        if (!responseStarted) return
        closed = true
        unsubscribe()
        forget()
        complete(this.finishSdkFollowUp(sessionId, assistantMessageId))
      } else if (
        event.type === 'session.error' ||
        event.type === 'session.shutdown'
      ) {
        closed = true
        unsubscribe()
        forget()
        const message =
          event.type === 'session.error'
            ? event.data.message
            : 'The SDK session shut down.'
        complete(this.failTrackedSdkFollowUp(
          sessionId,
          assistantMessageId,
          message,
        ))
      }
    })
    // Whatever ends this tracker -- an idle, a shutdown, or being superseded
    // -- it stops being the session's live one. Left behind it would hold the
    // SDK session for a conversation that has finished.
    const forget = () => {
      if (this.sdkFollowUpTrackers.get(sessionId) === handle) {
        this.sdkFollowUpTrackers.delete(sessionId)
      }
    }
    const handle = {
      activate: () => {
        active = true
      },
      // After an explicit Stop the turn may end without ever producing
      // anything, and an idle is then the only thing that will arrive. Waiting
      // for output first would keep the follow-up owning the session, leaving
      // it running with Restart blocked.
      settleWhenIdle: () => {
        responseStarted = true
      },
      settled,
      settleForTeardown: () => {
        forget()
        if (closed) return
        closed = true
        unsubscribe()
        resolveSettled()
      },
      cancel: () => {
        forget()
        if (closed) return
        closed = true
        unsubscribe()
      },
    }
    return handle
  }

  private async finishSdkFollowUp(
    sessionId: string,
    assistantMessageId: string,
  ): Promise<void> {
    await this.store.finishMessage(sessionId, assistantMessageId)
    const updated = await this.store.updateIf(sessionId, (session) => {
      if (
        this.activePrompts.get(sessionId)?.assistantMessageId !==
        assistantMessageId
      ) {
        return false
      }
      for (const message of session.messages) {
        if (
          message.role === 'activity' &&
          message.activityStatus === 'running'
        ) {
          message.activityStatus = 'completed'
        }
      }
      if (session.failedPrompt?.uncertain) {
        session.failedPrompt = undefined
      }
      session.status = 'idle'
      session.activity = undefined
      return true
    })
    if (updated) this.publish(updated)
    if (
      this.activePrompts.get(sessionId)?.assistantMessageId ===
      assistantMessageId
    ) {
      this.activePrompts.delete(sessionId)
      this.wakeSdkQueue(sessionId)
    }
  }

  private async failTrackedSdkFollowUp(
    sessionId: string,
    assistantMessageId: string,
    message: string,
  ): Promise<void> {
    const updated = await this.store.updateIf(sessionId, (session) => {
      if (
        this.activePrompts.get(sessionId)?.assistantMessageId !==
        assistantMessageId
      ) {
        return false
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
    if (
      this.activePrompts.get(sessionId)?.assistantMessageId ===
      assistantMessageId
    ) {
      this.activePrompts.delete(sessionId)
    }
  }

  private async sendTerminalInput(
    sessionId: string,
    content: string,
    enqueue: boolean,
    options?: TerminalSendOptions,
  ): Promise<boolean> {
    const handedAt = Date.now()
    try {
      const sent = await this.terminalController.send(sessionId, content, enqueue, ...(options ? [options] : []))
      if (sent) {
        this.admissions.markCommitted(sessionId)
        // A message Copilot queues itself is only logged when its turn comes.
        if (!enqueue) this.awaitTranscriptEcho(sessionId, handedAt)
      }
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
    this.assertNotRetained(sessionId, 'changing its queue')
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
      this.resumeQueueAfterMutation(sessionId, session)
      this.publish(session)
      return { session: this.publicSession(session), prompt }
    }))
  }

  async updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    rawContent: string,
  ): Promise<RemovedQueuedPrompt> {
    this.assertNotRetained(sessionId, 'changing its queue')
    const content = await this.normalizeQueuedContent(sessionId, rawContent)
    return this.admissions.run(sessionId, () => this.serializeQueue(sessionId, async () => {
      this.queuedDispatches.assertAvailable(sessionId)
      const { session, prompt } = await this.store.updateQueuedPrompt(
        sessionId, promptId, content,
      )
      if (!prompt) throw queueConflict('Queued prompt not found')
      this.resumeQueueAfterMutation(sessionId, session)
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
    this.assertNotRetained(sessionId, 'changing its queue')
    return this.admissions.run(sessionId, () => this.serializeQueue(sessionId, async () => {
      this.queuedDispatches.assertAvailable(sessionId)
      const session = await this.store.reorderQueuedPrompts(sessionId, order)
      this.resumeQueueAfterMutation(sessionId, session)
      this.publish(session)
      return this.publicSession(session)
    }))
  }

  private resumeQueueAfterMutation(
    sessionId: string,
    session: SessionDetail,
  ): void {
    this.clearTerminalQueueRetry(sessionId)
    if (!session.queueState) this.terminalQueueStates.delete(sessionId)
    const next = session.queuedPrompts?.[0]
    if (!next || session.suspended) return
    const terminalBacked =
      this.store.backend(sessionId) === 'terminal' ||
      this.externalSessionIds.has(sessionId)
    if (!terminalBacked) return
    if (this.terminalSteerRetryDelay(sessionId, session) !== undefined) {
      this.retryTerminalQueueClaim(sessionId)
    } else if (session.status === 'idle') {
      this.wakeTerminalQueue(sessionId)
    }
  }

  private async enqueuePrompt(
    sessionId: string,
    content: string,
    command = false,
    answers?: string,
    delivery?: DeliveryBoundary,
    steer = false,
    priority = false,
  ): Promise<SessionDetail> {
    const prompt: QueuedPrompt = {
      id: randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      ...(command ? { command: true } : {}),
      ...(steer ? { steer: true } : {}),
    }
    return this.serializeQueue(sessionId, async () => {
      // One write when this is the answer to a failure. Queued first and the
      // marker let go of afterwards, a crash in between leaves both on disk,
      // and after a restart the reader is handed the text again while the
      // copy they already sent is still waiting to go.
      const queued = answers
        ? await this.store.enqueueAnsweringPrompt(
            sessionId,
            prompt,
            answers,
            priority,
          )
        : await this.store.enqueuePrompt(sessionId, prompt)
      if (delivery) delivery.accepted = true
      this.admissions.markCommitted(sessionId)
      if (this.externalSessionIds.has(sessionId)) this.terminalDrainRequested.add(sessionId)
      else this.sdkDrainRequested.add(sessionId)
      this.publish(queued)
      delivery?.ordered?.()
      return queued
    })
  }

  private async enqueueTerminalPrompt(
    sessionId: string,
    content: string,
    command = false,
    answers?: string,
    delivery?: DeliveryBoundary,
    steer = false,
    priority = false,
  ): Promise<SessionDetail> {
    const wasIdle = this.store.get(sessionId)?.status === 'idle'
    // Every caller found the owner live, but only discovery grants it
    // recovery (see liveTerminalAdmissions). Recorded before the write so a
    // pass that lands with it still sees the admission.
    const previousAdmission = this.liveTerminalAdmissions.get(sessionId)
    const admission = this.store.isManagedOpen(sessionId)
      ? undefined
      : ++this.liveTerminalAdmissionSequence
    if (admission !== undefined) this.liveTerminalAdmissions.set(sessionId, admission)
    // Marks the committed write: publishing it can still throw, and the
    // admission is then what lets discovery grant the accepted work recovery.
    const boundary = delivery ?? { accepted: false }
    let queued: SessionDetail
    try {
      queued = await this.enqueuePrompt(
        sessionId,
        content,
        command,
        answers,
        boundary,
        steer,
        priority,
      )
    } catch (error) {
      if (
        !boundary.accepted && admission !== undefined &&
        this.liveTerminalAdmissions.get(sessionId) === admission
      ) {
        if (previousAdmission === undefined) this.liveTerminalAdmissions.delete(sessionId)
        else this.liveTerminalAdmissions.set(sessionId, previousAdmission)
      }
      throw error
    }
    if (this.store.isManagedOpen(sessionId)) this.liveTerminalAdmissions.delete(sessionId)
    if (!wasIdle) {
      // Nothing else drains mid-turn, so the queue is polled for the composer.
      if (steer) this.retryTerminalQueueClaim(sessionId)
      return queued
    }
    await this.drainTerminalQueue(sessionId, true)
    return this.store.get(sessionId) || queued
  }

  // Asked when the pane neither offers the interrupt key nor shows an idle
  // prompt the grammar knows, which is how a CLI update that rewords its
  // footer would look.
  private async terminalTurnOpen(sessionId: string): Promise<boolean> {
    try {
      return foregroundTurnOpen(await this.sessionEventReader(sessionId))
    } catch {
      return false
    }
  }

  private canQueueRefusedSteer(sessionId: string): boolean {
    const session = this.store.get(sessionId)
    return (
      !this.stopped &&
      !this.deletingSessions.has(sessionId) &&
      !this.suspendingSessions.has(sessionId) &&
      !session?.suspended &&
      session?.status === 'running'
    )
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
    options: {
      preserveTitle?: boolean
      recoverySeedPrompt?: string
    } = {},
  ): Promise<SessionDetail> {
    return this.admissions.run(sessionId, () =>
      this.startAdmittedMessage(
        sessionId, content, fromQueue, reservation, answers, delivery, options,
      ), true)
  }

  private async startAdmittedMessage(
    sessionId: string,
    content: string,
    fromQueue: boolean,
    reservation?: QueuedPromptReservation,
    answers?: string,
    delivery?: DeliveryBoundary | QueuedDelivery,
    options: {
      preserveTitle?: boolean
      recoverySeedPrompt?: string
    } = {},
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
          options,
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
    this.sdkPromptRuns.set(sessionId, run)
    void run.finally(() => {
      if (this.sdkPromptRuns.get(sessionId) === run) {
        this.sdkPromptRuns.delete(sessionId)
      }
    })
    if (options.recoverySeedPrompt) {
      this.recoverySeedPromptRuns.set(sessionId, run)
      void run.finally(() => {
        if (this.recoverySeedPromptRuns.get(sessionId) === run) {
          this.recoverySeedPromptRuns.delete(sessionId)
        }
      })
    }
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
    if (this.suspendingSessions.has(sessionId)) {
      throw suspendedRuntimeConflict()
    }
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

  private resourceOwner(sessionId: string) {
    if (this.stopped) throw new SessionResourceError('stopped')
    const stored = this.store.get(sessionId)
    if (!stored) throw new SessionResourceError('missing')
    if ((stored.provider ?? 'copilot') !== 'copilot') throw new SessionResourceError('changed')
    const epoch = this.resourceEpoch
    const ownsSession = this.store.captureOwnership(sessionId)
    const loaded = this.sessions.get(sessionId)
    if (loaded && loaded.sessionId !== sessionId) throw new SessionResourceError('changed')
    const terminal = this.externalSessionIds.has(sessionId)
    const assertCurrent = () => {
      if (this.stopped || epoch !== this.resourceEpoch) throw new SessionResourceError('stopped')
      if (!ownsSession() || this.sessions.get(sessionId) !== loaded ||
        this.externalSessionIds.has(sessionId) !== terminal ||
        this.lifecycleLocks.has(sessionId) || this.deletingSessions.has(sessionId) ||
        this.deletedSessionIds.has(sessionId) || this.suspendingSessions.has(sessionId)) {
        throw new SessionResourceError('changed')
      }
    }
    assertCurrent()
    const live = !stored.suspended && stored.executionMode !== 'tmux' && !terminal ? loaded : undefined
    return { stored, live, assertCurrent }
  }

  listSkills(sessionId: string, signal?: AbortSignal): Promise<SessionSkillsSnapshot> {
    return this.resourceReads.run(signal, (request) => this.readSkills(sessionId, request.signal))
  }

  private async readSkills(sessionId: string, signal: AbortSignal): Promise<SessionSkillsSnapshot> {
    const { stored, live, assertCurrent } = this.resourceOwner(sessionId)
    try {
      if (live?.rpc.skills?.list) {
        try {
          const result = await readCopilotResource<Awaited<ReturnType<NonNullable<typeof live.rpc.skills>['list']>>>(
            this.client, 'session.skills.list', { sessionId }, signal, live,
          )
          assertCurrent()
          return skillsSnapshot(sessionId, 'copilot', 'session', copilotSkills(result))
        } catch (error) {
          assertCurrent()
          if (!isResourceMethodUnavailable(error)) throw error
        }
      }
      if (this.client.rpc.skills?.discover) {
        try {
          assertCurrent()
          const result = await readCopilotResource<Awaited<ReturnType<CopilotClient['rpc']['skills']['discover']>>>(
            this.client, 'skills.discover', { projectPaths: [stored.cwd] }, signal,
          )
          assertCurrent()
          return skillsSnapshot(sessionId, 'copilot', 'workspace', copilotSkills(result))
        } catch (error) {
          assertCurrent()
          if (!isResourceMethodUnavailable(error)) throw error
        }
      }
      return unavailableSkills(sessionId, 'copilot')
    } catch (error) {
      throw safeResourceError(error)
    }
  }

  listMcpServers(sessionId: string, signal?: AbortSignal): Promise<SessionMcpServersSnapshot> {
    return this.resourceReads.run(signal, (request) => this.readMcpServers(sessionId, request.signal))
  }

  private async readMcpServers(sessionId: string, signal: AbortSignal): Promise<SessionMcpServersSnapshot> {
    const { stored, live, assertCurrent } = this.resourceOwner(sessionId)
    try {
      if (live?.rpc.mcp?.list) {
        try {
          const result = await readCopilotResource<Awaited<ReturnType<NonNullable<typeof live.rpc.mcp>['list']>>>(
            this.client, 'session.mcp.list', { sessionId }, signal, live,
          )
          assertCurrent()
          return mcpSnapshot(sessionId, 'copilot', 'session', copilotMcp(result))
        } catch (error) {
          assertCurrent()
          if (!isResourceMethodUnavailable(error)) throw error
        }
      }
      if (this.client.rpc.mcp?.discover) {
        try {
          assertCurrent()
          const result = await readCopilotResource<Awaited<ReturnType<CopilotClient['rpc']['mcp']['discover']>>>(
            this.client, 'mcp.discover', { workingDirectory: stored.cwd }, signal,
          )
          assertCurrent()
          return mcpSnapshot(sessionId, 'copilot', 'workspace', copilotWorkspaceMcp(result))
        } catch (error) {
          assertCurrent()
          if (!isResourceMethodUnavailable(error)) throw error
        }
      }
      return unavailableMcp(sessionId, 'copilot')
    } catch (error) {
      throw safeResourceError(error)
    }
  }

  private async commandCatalog(sessionId: string) {
    const retained = this.store.get(sessionId)
    if (retained?.suspended) {
      return []
    }
    this.assertTerminalRecoverySettled(sessionId)
    if (retained?.interruption || retained?.archivedAt) return []
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
        ...COPILOT_SDK_SESSION_DISCOVERY,
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
    replaceTerminalDraft = false,
  ): Promise<SessionDetail> {
    try {
      return await this.admissions.run(sessionId, async () =>
        this.publicSession(await this.executeAdmittedCommand(
          sessionId,
          rawCommand,
          enqueue,
          acknowledgedFailure,
          replaceTerminalDraft,
        )))
    } finally {
      this.wakeDeferredQueue(sessionId)
    }
  }

  private async executeAdmittedCommand(
    sessionId: string,
    rawCommand: string,
    enqueue: boolean,
    acknowledgedFailure?: string,
    replaceTerminalDraft = false,
    releaseTerminalImmediate?: () => void,
  ): Promise<SessionDetail> {
    if (this.store.get(sessionId)?.launchStopping) throw queueConflict('The launch is stopping; no new work can start.')
    if (this.stopped) throw queueConflict('The session service is stopping.')
    this.queuedDispatches.assertAvailable(sessionId)
    const command = rawCommand.trim()
    if (!command.startsWith('/')) {
      throw new Error('Slash command must start with /')
    }
    if (!command.slice(1).split(/\s+/, 1)[0]) {
      throw new Error('Slash command name is required')
    }
    if (replaceTerminalDraft && enqueue) {
      throw Object.assign(
        new Error('Terminal draft replacement is only available for immediate commands.'),
        { statusCode: 409, uncertainDelivery: false },
      )
    }
    if (
      !releaseTerminalImmediate &&
      (
        this.store.backend(sessionId) === 'terminal' ||
        this.externalSessionIds.has(sessionId)
      )
    ) {
      this.assertRecoveryClaimAvailable(sessionId, acknowledgedFailure)
      this.assertRecoveryAttemptAvailable(sessionId, acknowledgedFailure)
      return this.serializeTerminalImmediate(sessionId, (releaseOrder) =>
        this.executeAdmittedCommand(
          sessionId,
          rawCommand,
          enqueue,
          acknowledgedFailure,
          replaceTerminalDraft,
          releaseOrder,
        ))
    }
    await this.store.readAfterWrites(sessionId)
    if (
      replaceTerminalDraft &&
      !(await this.terminalController.has(sessionId))
    ) {
      throw Object.assign(
        new Error('Terminal draft replacement is only available for tmux-backed Copilot sessions.'),
        { statusCode: 409, uncertainDelivery: false },
      )
    }
    this.assertRecoverySeedSettled(sessionId)
    this.assertNotRetained(sessionId, 'running commands')
    this.assertRecoveryAttemptAvailable(sessionId, acknowledgedFailure)
    const claim = await this.claimFailure(sessionId, command, acknowledgedFailure)
    const delivery: DeliveryBoundary = claim ?? { accepted: false }
    delivery.ordered = releaseTerminalImmediate
    let ran: SessionDetail
    try {
      ran = await this.runCommand(
        sessionId,
        command,
        enqueue,
        claim?.failedAt,
        false,
        delivery,
        replaceTerminalDraft,
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
    replaceTerminalDraft = false,
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
    this.assertRecoverySeedSettled(sessionId)
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
        // Refused before anything was handed over, so what was written is
        // safe to send again. Saying nothing leaves the reader with a warning
        // that it might already have gone.
        uncertainDelivery: false,
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
          const queueForPassiveConflict =
            await this.prepareTerminalCommandAdmission(sessionId, enqueue)
          return this.dispatchCommand(
            sessionId,
            name,
            argument,
            enqueue,
            answers,
            fromQueue,
            delivery,
            replaceTerminalDraft,
            queueForPassiveConflict,
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
        replaceTerminalDraft,
      )
    } finally {
      releaseDispatch()
    }
  }

  /**
   * Explains refused startup input from the screen startup ended on as well as
   * the one captured before it: a relaunched Copilot draws nothing until it
   * finds its session in use, and that card has its own way out.
   */
  private async startupRefusal(
    sessionId: string,
    captured: string | undefined,
    retry: string,
  ): Promise<Error> {
    const settled = await this.terminalController.capture?.(sessionId)
    const inUse = [settled, captured].find(
      (pane): pane is string =>
        pane !== undefined && isTerminalSessionInUseConflict(pane),
    )
    return Object.assign(
      new Error(
        inUse
          ? sessionInUseConflictMessage(inUse)
          : `The terminal is showing a full-screen view. Close it there, then ${retry}.`,
      ),
      { statusCode: 409, uncertainDelivery: false },
    )
  }

  private async prepareTerminalCommandAdmission(
    sessionId: string,
    enqueue: boolean,
  ): Promise<boolean> {
    const pane = await this.terminalController.capture?.(sessionId)
    if (!pane) {
      return false
    }
    let currentPane = pane
    if (isTerminalSessionInUseConflict(currentPane)) {
      if (enqueue && !isTerminalSessionInUsePrompt(currentPane)) {
        return true
      }
      throw Object.assign(
        new Error(sessionInUseConflictMessage(currentPane)),
        { statusCode: 409, uncertainDelivery: false },
      )
    }
    const ownsStartup =
      this.terminalController.ownsStartupPrompt?.(sessionId) ?? false
    if (ownsStartup || isTerminalOverlay(currentPane)) {
      const canHandle =
        !isTerminalSessionInUseConflict(currentPane) &&
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
        throw await this.startupRefusal(
          sessionId,
          currentPane,
          'run this command again',
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
    return false
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
    replaceTerminalDraft = false,
    queueForPassiveConflict = false,
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
    if (!catalog.session && enqueue && queueForPassiveConflict) {
      return this.enqueueTerminalPrompt(
        sessionId,
        canonicalCommand,
        true,
        answers,
        delivery,
      )
    }
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
    this.assertRecoverySeedSettled(sessionId)
    if (now.suspended || this.suspendingSessions.has(sessionId)) {
      throw Object.assign(new Error('Resume the session before sending to it'), { statusCode: 409, uncertainDelivery: false })
    }
    if (this.admissionClosed.has(sessionId) || this.deletingSessions.has(sessionId)) {
      throw Object.assign(new Error('The session is changing state; try again once it settles'), { statusCode: 409, uncertainDelivery: false })
    }
    // As for messages: discovery can hold the queue behind Reopen while the
    // command is read and decided, or while the controller reads the pane
    // again before typing, and a held session is not eligible to queue.
    const confirmNotHeld = !fromQueue && !catalog.session
      ? () => this.assertNotRetained(sessionId, 'running commands')
      : undefined
    confirmNotHeld?.()
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
    const sendOptions: TerminalSendOptions | undefined = commandInfo?.allowDuringAgentExecution
      ? {
          allowDuringAgentExecution: true,
          ...(replaceTerminalDraft ? { replaceExistingInput: true } : {}),
        }
      : replaceTerminalDraft
        ? { replaceExistingInput: true }
        : undefined
    let terminalSent: boolean
    try {
      queuedDelivery?.submit()
      terminalSent = await this.sendTerminalInput(
        sessionId,
        canonicalCommand,
        nativeEnqueue,
        confirmNotHeld ? { ...sendOptions, confirm: confirmNotHeld } : sendOptions,
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
      // Before reading the feedback, which can fail after the command went in.
      await this.store.claimTerminalRecovery(sessionId)
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
      let result: Awaited<ReturnType<typeof session.rpc.commands.invoke>>
      try {
        result = await session.rpc.commands.invoke({
          name: canonicalName,
          input: argument,
        })
      } catch (error) {
        // The command was handed over before this failed. A lost result says
        // nothing about whether it ran, and only an explicit refusal proves it
        // did not, so the reply is left uncertain rather than reported as
        // definitely unsent -- which is what invites resending work the
        // provider already accepted.
        if (
          error &&
          typeof error === 'object' &&
          !explicitlyRefused(error) &&
          deliveryUncertaintyFromError(error) === undefined
        ) {
          Reflect.set(error, 'uncertainDelivery', true)
        }
        throw error
      }
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
            : result.kind === 'select-subcommand'
              ? `${result.title}\n\n${result.options
                  .map(
                    (option) =>
                      `- /${canonicalName} ${option.name} — ${option.description}`,
                  )
                  .join('\n')}`
              : result.kind === 'add-timeline-entry'
                ? stripAnsi(result.entry.text) || canonicalCommand
                : result.kind === 'set-plan-model'
                  ? result.message || canonicalCommand
                  : result.kind === 'set-model'
                    ? [`Model set to ${result.model}`, result.warning].filter(Boolean).join('\n\n')
                    : canonicalCommand
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
    if (
      await this.terminalController.cancel(sessionId, {
        turnOpen: () => this.terminalTurnOpen(sessionId),
      })
    ) {
      return
    }

    const session = this.sessions.get(sessionId)
    if (!session) {
      await this.settleCompletedSdkCancellation(sessionId)
      return
    }
    const recovery = this.store.sdkRecovery(sessionId)
    if (recovery) {
      if (!this.isCurrentSdkOwner(sessionId, session, recovery.generation)) return
      const cancelled = await this.store.cancelSdkRecovery(
        sessionId,
        recovery.generation,
      )
      if (!cancelled) return
      this.publish(cancelled)
      await session.abort()
      return
    }
    if (!this.activePrompts.has(sessionId)) {
      await this.settleCompletedSdkCancellation(sessionId)
      return
    }
    // Marked before the abort, so an idle that arrives straight after it
    // cannot reach the tracker while it is still waiting for output. A
    // follow-up still being handed over has no tracker yet, so the stop is
    // recorded on the admission it will be built from.
    const pendingFollowUp = this.pendingSdkFollowUps.get(sessionId)
    if (pendingFollowUp) pendingFollowUp.stopped = true
    this.sdkFollowUpTrackers.get(sessionId)?.settleWhenIdle()
    await session.abort()
  }

  async reconcileLaunch(launchId: string) {
    return this.store.reconcileLaunch(launchId)
  }

  deliveryIdentity(deliveryId: string) {
    return this.store.deliveryIdentity(deliveryId)
  }

  async cancelWithAck(sessionId: string, timeoutMs = 10_000) {
    return awaitTermination(sessionId, timeoutMs, async () => {
      await this.cancel(sessionId)
      this.queuedPromptStops.get(sessionId)?.()
      await this.admissions.wait(sessionId)
      await this.cancel(sessionId)
      const tasks = await this.listBackgroundTasks(sessionId)
      if (tasks.supported) {
        for (const task of tasks.tasks) {
          if (task.status === 'running' || task.status === 'queued') await this.cancelBackgroundTask(sessionId, task.id)
        }
      }
    }, async () => {
      const current = this.store.get(sessionId)
      if (!current || current.queuedPrompts?.length || this.activePrompts.has(sessionId) ||
          this.drainingSessions.has(sessionId) || this.dispatchingSessions.has(sessionId) ||
          this.admissions.hasPending(sessionId) ||
          current.pendingPermission || current.pendingUserInput) return false
      const tasks = await this.listBackgroundTasks(sessionId)
      if (!tasks.supported || tasks.tasks.some((task) => task.status === 'running' || task.status === 'queued')) return false
      const events = await this.sessionEventReader(sessionId)
      const lifecycle = events.findLast(isForegroundLifecycleEvent)
      const providerStatus = statusFromEvents(events)
      const admittedAt = Math.max(0,
        ...(current.promptReceipts || []).filter((receipt) => receipt.state === 'accepted' || receipt.state === 'delivered')
          .map((receipt) => receipt.handedAt ? Date.parse(receipt.handedAt)
            : receipt.rootTurnId ? Date.parse(receipt.acceptedAt) : Infinity),
        ...current.messages.filter((message) => message.role === 'user').map((message) => Date.parse(message.createdAt)),
      )
      // A store's idle projection, an abort RPC result or a missing log is not proof.
      const stopped = Boolean(lifecycle && isForegroundCompletionEvent(lifecycle) &&
        Date.parse(lifecycle.timestamp) >= admittedAt &&
        (providerStatus === 'idle' || providerStatus === 'error') && !foregroundTurnOpen(events))
      if (stopped) this.publish(await this.store.confirmLaunchTermination(sessionId))
      return stopped
    }, async () => {
      await this.store.readAfterWrites(sessionId)
      const fenced = await this.store.stopLaunchWork(sessionId)
      this.sdkDrainRequested.delete(sessionId)
      this.terminalDrainRequested.delete(sessionId)
      this.publish(fenced)
    })
  }

  private async settleCompletedSdkCancellation(
    sessionId: string,
  ): Promise<void> {
    const stored = this.store.get(sessionId)
    if (
      !stored ||
      this.externalSessionIds.has(sessionId) ||
      this.store.sdkRecovery(sessionId) ||
      stored.status === 'idle' ||
      stored.suspended ||
      stored.pendingPermission ||
      stored.pendingUserInput ||
      stored.queuedPrompts?.length ||
      this.drainingSessions.has(sessionId) ||
      this.dispatchingSessions.has(sessionId)
    ) {
      return
    }
    const tasks = await this.listBackgroundTasks(sessionId)
    if (
      !tasks.supported ||
      tasks.tasks.some(
        (task) => task.status === 'running' || task.status === 'queued',
      )
    ) {
      return
    }
    const events = await this.sessionEventReader(sessionId)
    const latestLifecycle = events.findLast(isForegroundLifecycleEvent)
    if (
      !latestLifecycle ||
      !isForegroundCompletionEvent(latestLifecycle) ||
      statusFromEvents(events) !== 'idle' ||
      backgroundTasksFromEvents(events).some(
        (task) => task.status === 'running' || task.status === 'queued',
      )
    ) {
      return
    }
    const settled = await this.store.updateIf(sessionId, (session) => {
      if (
        session.status === 'idle' ||
        session.suspended ||
        session.pendingPermission ||
        session.pendingUserInput ||
        session.queuedPrompts?.length ||
        this.activePrompts.has(sessionId) ||
        this.drainingSessions.has(sessionId) ||
        this.dispatchingSessions.has(sessionId)
      ) {
        return false
      }
      session.status = 'idle'
      session.activity = undefined
      return true
    })
    if (settled) this.publish(settled)
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

  /**
   * Deletes a closed session for good once its retention has ended. Decided
   * in the lifecycle queue, so a reopen that got there first keeps it.
   */
  async deleteExpiredClosedSession(sessionId: string, closedBefore: number): Promise<boolean> {
    return this.serializeLifecycle(sessionId, async () => {
      const closedAt = this.store.get(sessionId)?.closedAt
      if (!closedAt || !(Date.parse(closedAt) <= closedBefore)) return false
      await this.deleteSerialized(sessionId)
      return true
    })
  }

  /**
   * Closes a session so it can be reopened. What runs for it stops as a
   * delete would stop it, but its record, transcript, and provider data stay.
   */
  async closeSession(sessionId: string): Promise<SessionDetail> {
    return this.publicSession(await this.serializeLifecycle(sessionId, () =>
      this.closeSerialized(sessionId),
    ))
  }

  private async closeSerialized(sessionId: string): Promise<SessionDetail> {
    const stored = this.store.get(sessionId)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (stored.closedAt) return stored
    const terminalBacked = this.store.backend(sessionId) === 'terminal'

    this.deletingSessions.add(sessionId)
    this.closingSessions.add(sessionId)
    // Discovery that started before the runtime went holds an answer that
    // predates the close.
    this.discoveryGeneration += 1
    try {
      const stopped = await this.stopSessionRuntime(sessionId, terminalBacked)
      if (!terminalBacked) {
        // An attachment already on its way would land behind the close.
        await this.loadingSessions.get(sessionId)?.catch(() => undefined)
        const owner = this.sessions.get(sessionId)
        if (owner) {
          try {
            await owner.disconnect()
          } catch (error) {
            await Promise.all([stopped.interruptedSdkRun, stopped.interruptedSdkFollowUp?.settled])
            await this.reconcileRetainedSdkDeletion(
              sessionId,
              stopped.interruptedPrompt,
              stopped.interruptedSdkTurn,
              error,
              'close',
            )
            throw error
          }
          this.removeSdkOwner(sessionId, owner)
        }
      }
      stopped.interruptedSdkFollowUp?.cancel()
      this.sdkFollowUpTrackers.delete(sessionId)
      const closed = await this.store.closeSession(sessionId)
      this.forgetSessionRuntime(sessionId)
      this.externalSessionIds.delete(sessionId)
      this.pendingTerminalPromptDispatches.delete(sessionId)
      this.rediscoveredTerminalQueues.delete(sessionId)
      this.liveTerminalAdmissions.delete(sessionId)
      this.eventLogVersions.delete(sessionId)
      this.eventLogFingerprints.delete(sessionId)
      forgetSessionEvents(sessionId)
      this.emit('event', { type: 'session.removed', sessionId, closed: true })
      return closed
    } finally {
      this.deletingSessions.delete(sessionId)
      this.closingSessions.delete(sessionId)
      this.discoveryGeneration += 1
    }
  }

  /**
   * Stops what runs for a session that is leaving the open list: queued and
   * running turns, its terminal process, and the requests it is waiting on.
   * What becomes of its SDK owner and provider data is the caller's.
   */
  private async stopSessionRuntime(sessionId: string, terminalBacked: boolean) {
    const queuedSdkRun = this.queuedPromptRuns.get(sessionId)
    let interruptedPrompt = queuedSdkRun
      ? this.activePrompts.get(sessionId)
      : undefined
    let interruptedSdkTurn = queuedSdkRun
      ? this.sdkTurnsAwaited.get(sessionId)
      : undefined
    let interruptedSdkRun = queuedSdkRun
    this.queuedPromptStops.get(sessionId)?.()
    await this.admissions.wait(sessionId)
    await Promise.allSettled(this.sdkReplyWrites(sessionId))
    await this.queueOperations.get(sessionId)?.catch(() => undefined)
    await this.queuedPromptRuns.get(sessionId)?.catch(() => undefined)
    const active = this.sessions.get(sessionId)
    const currentPrompt = this.activePrompts.get(sessionId)
    if (currentPrompt) {
      interruptedPrompt = currentPrompt
      interruptedSdkTurn = this.sdkTurnsAwaited.get(sessionId)
      interruptedSdkRun = this.sdkPromptRuns.get(sessionId)
    }
    const interruptedSdkFollowUp =
      this.sdkFollowUpTrackers.get(sessionId)
    await this.activeSessionStopper(sessionId)
    if (active) {
      if (this.activePrompts.has(sessionId)) {
        interruptedSdkFollowUp?.settleWhenIdle()
        this.activePrompts.delete(sessionId)
        await active.abort()
      }
      if (terminalBacked) {
        await active.disconnect()
        this.removeSdkOwner(sessionId, active)
      }
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
    return { interruptedPrompt, interruptedSdkTurn, interruptedSdkRun, interruptedSdkFollowUp }
  }

  /** Drops what this service kept in memory for a session's runtime. */
  private forgetSessionRuntime(sessionId: string): void {
    this.pendingSdkQueueAdmissions.delete(sessionId)
    this.forgetSdkReplies(sessionId)
    this.hydratedSessions.delete(sessionId)
    this.loadingSessions.delete(sessionId)
    this.hydratingSessions.delete(sessionId)
    this.activePrompts.delete(sessionId)
    this.drainingSessions.delete(sessionId)
    this.queueOperations.delete(sessionId)
    this.pendingTerminalQueueSettlements.delete(sessionId)
    this.clearTerminalQueueRetry(sessionId)
    this.terminalQueueStates.delete(sessionId)
    this.startupTerminalQueues.delete(sessionId)
    this.workspaceVersions.delete(sessionId)
    this.transcriptTakeInCosts.delete(sessionId)
    this.backgroundTaskSyncs.delete(sessionId)
    this.backgroundTaskTracker.remove(sessionId)
    this.liveActivityEvents.delete(sessionId)
    this.terminalUserInputChecks.delete(sessionId)
    this.terminalUpdateChecks.delete(sessionId)
    this.answeredTerminalPermissions.delete(sessionId)
    this.answeredTerminalInputs.delete(sessionId)
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
      const {
        interruptedPrompt,
        interruptedSdkTurn,
        interruptedSdkRun,
        interruptedSdkFollowUp,
      } = await this.stopSessionRuntime(sessionId, terminalBacked)

      if (terminalBacked) {
        await removeCopilotSessionFiles(sessionId)
      } else {
        try {
          await this.deleteSdkProviderIdentity(sessionId)
        } catch (error) {
          await Promise.all([
            interruptedSdkRun,
            interruptedSdkFollowUp?.settled,
          ])
          await this.reconcileRetainedSdkDeletion(
            sessionId,
            interruptedPrompt,
            interruptedSdkTurn,
            error,
          )
          throw error
        }
      }
      // A successful destructive delete does not need a provider event to
      // retire the follow-up because no retry can reuse this SDK identity.
      interruptedSdkFollowUp?.cancel()
      this.sdkFollowUpTrackers.delete(sessionId)
      await this.store.remove(sessionId)
      this.forgetSessionRuntime(sessionId)
      completed = true
      this.emit('event', { type: 'session.removed', sessionId })
    } finally {
      this.deletingSessions.delete(sessionId)
      if (!completed) {
        this.deletedSessionIds.delete(sessionId)
      }
    }
  }

  private async reconcileRetainedSdkDeletion(
    sessionId: string,
    interruptedPrompt: ActivePrompt | undefined,
    interruptedSdkTurn: string | undefined,
    error: unknown,
    lifecycle: 'deletion' | 'close' = 'deletion',
  ): Promise<void> {
    const retained = this.store.get(sessionId)
    if (
      !retained ||
      (!interruptedPrompt &&
        retained.status !== 'running' &&
        retained.status !== 'waiting' &&
        !retained.pendingPermission &&
        !retained.pendingUserInput)
    ) {
      return
    }
    if (
      interruptedSdkTurn &&
      this.sdkTurnsAwaited.get(sessionId) === interruptedSdkTurn
    ) {
      this.retiredSdkPromptRuns.add(interruptedSdkTurn)
      this.sdkTurnsAwaited.delete(sessionId)
    }
    const message = error instanceof Error ? error.message : String(error)
    const explanation =
      `Unable to complete the response: Session ${lifecycle} failed before provider cleanup completed: ${message}`
    const queueAdmission = interruptedPrompt
      ? this.pendingSdkQueueAdmissions.get(sessionId)
      : undefined
    if (
      interruptedPrompt &&
      queueAdmission?.assistantId === interruptedPrompt.assistantMessageId
    ) {
      await this.store.failSdkQueueAdmission(
        sessionId,
        interruptedPrompt.assistantMessageId,
        explanation,
        () => false,
      )
    }
    const updated = await this.store.updateIf(sessionId, (session) => {
      const assistant = interruptedPrompt
        ? session.messages.find(
            (entry) => entry.id === interruptedPrompt.assistantMessageId,
          )
        : undefined
      if (assistant?.role === 'assistant') {
        assistant.streaming = false
        if (!assistant.content) assistant.content = explanation
      }
      for (const entry of session.messages) {
        if (
          entry.role === 'activity' &&
          entry.activityStatus === 'running'
        ) {
          entry.activityStatus = 'failed'
          entry.activityResult = `Error: ${message}`
        }
      }
      session.pendingPermission = undefined
      session.pendingUserInput = undefined
      session.status = 'error'
      session.activity = undefined
      return true
    })
    if (updated) this.publish(updated)
    this.pendingSdkQueueAdmissions.delete(sessionId)
    this.sdkFollowUpTrackers.get(sessionId)?.cancel()
    this.sdkFollowUpTrackers.delete(sessionId)
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
    for (const key of this.terminalFormUncertainty.keys()) {
      if (JSON.parse(key)[0] === sessionId) this.terminalFormUncertainty.delete(key)
    }
    for (const key of this.terminalFormContinuations.keys()) {
      if (JSON.parse(key)[0] === sessionId) this.terminalFormContinuations.delete(key)
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
        if (accepted.terminal) {
          return choice.kind === 'elicitation' && choice.response.action !== 'accept'
            ? { status: 'idle' }
            : { status: 'running', activity: 'Continuing' }
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
      if (settled && !accepted.terminal) this.wakeSdkQueue(sessionId)
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
    const accepted: AcceptedSdkReply = {
      sessionId,
      choice: structuredClone(choice),
      promptId: this.activePrompts.get(sessionId)?.assistantMessageId,
    }
    this.acceptedSdkReplies.set(requestId, accepted)
    const persisted = choice.kind === 'permission'
      ? { requestId, kind: choice.kind, optionId: choice.optionId } as const
      : choice.kind === 'input'
        ? {
            requestId,
            kind: 'user-input' as const,
            input: {
              answer: choice.response.answer,
              wasFreeform: choice.response.wasFreeform,
              action: choice.action,
            },
          }
        : {
            requestId,
            kind: choice.kind,
            input: {
              answer: '',
              wasFreeform: false,
              action: choice.response.action,
              values: choice.response.action === 'accept'
                ? choice.response.content
                : undefined,
            },
          }
    let delivered = false
    const completion = this.store.acceptLiveSdkReply(
      sessionId,
      persisted,
      choice.kind === 'permission' ? 'pendingPermission' : 'pendingUserInput',
      (currentRequestId) => choice.kind === 'permission'
        ? this.permissions.has(currentRequestId)
        : this.userInputs.has(currentRequestId) || this.elicitations.has(currentRequestId),
    ).then(() => {
      if (
        this.stopped || this.deletingSessions.has(sessionId) ||
        this.acceptedSdkReplies.get(requestId) !== accepted ||
        !this.store.get(sessionId) ||
        (choice.kind === 'permission'
          ? !this.permissions.has(requestId)
          : choice.kind === 'input'
            ? !this.userInputs.has(requestId)
            : !this.elicitations.has(requestId))
      ) {
        throw new Error('Session is no longer available')
      }
      if (choice.kind === 'permission') this.permissions.delete(requestId)
      else if (choice.kind === 'input') this.userInputs.delete(requestId)
      else this.elicitations.delete(requestId)
      resolve()
      delivered = true
      accepted.completion = undefined
      return this.settleSdkReply(sessionId, requestId, choice)
    }).catch((error: unknown) => {
      if (!delivered && this.acceptedSdkReplies.get(requestId) === accepted) {
        this.acceptedSdkReplies.delete(requestId)
      }
      throw error
    })
    accepted.completion = completion
    return completion
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
    if (this.store.get(sessionId)?.launchStopping) throw queueConflict('The launch is stopping; no input can resume it.')
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
    if (request.stale) {
      throw Object.assign(
        new Error('This SDK permission request expired when the service restarted. Recover the conversation to continue; the old callback cannot be resumed.'),
        { statusCode: 409 },
      )
    }
    if (!request.options.some((option) => option.optionId === optionId)) {
      throw new Error('The selected permission option is not available')
    }
    const restartRecovery = this.store.sdkRecovery(sessionId)
    if (
      restartRecovery?.state === 'waiting-permission' &&
      restartRecovery.providerRequestId
    ) {
      return this.replyRecoveredSdkPermission(
        sessionId,
        requestId,
        optionId,
        restartRecovery.generation,
        restartRecovery.providerRequestId,
      )
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
      await this.store.claimTerminalRecovery(sessionId)
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
    if (!requestId.startsWith('persisted-user-input:')) {
      return this.publicSession(await this.replyUserInputInternal(sessionId, requestId, input))
    }
    const key = JSON.stringify([sessionId, requestId])
    const pending = this.terminalInputReplies.get(key)
    if (pending) {
      if (!isDeepStrictEqual(pending.input, input)) {
        throw Object.assign(new Error('Another reply to this terminal question is still being processed'), { statusCode: 409 })
      }
      return this.publicSession(await pending.completion)
    }
    const completion = this.replyUserInputInternal(sessionId, requestId, input)
      .finally(() => this.terminalInputReplies.delete(key))
    this.terminalInputReplies.set(key, { input: structuredClone(input), completion })
    return this.publicSession(await completion)
  }

  private async handleTerminalFormReplyError(
    sessionId: string, requestId: string, input: UserInputReplyInput, error: unknown,
  ): Promise<boolean> {
    if (!(error instanceof TerminalFormReplyError)) return false
    this.publishError(sessionId, error)
    if (error.outcome === 'submitted') return true
    if (this.answeredPersistedInputs.get(sessionId)?.requestId === requestId) {
      this.answeredPersistedInputs.delete(sessionId)
    }
    if (error.outcome === 'uncertain') {
      this.terminalFormUncertainty.set(JSON.stringify([sessionId, requestId]), {
        error, choice: structuredClone(this.sdkInputChoice(input, 'elicitation')),
      })
      if (await this.isToolCallComplete(sessionId, requestId.slice('persisted-user-input:'.length))) return true
    }
    throw error
  }

  private acceptTerminalFormReply(
    sessionId: string, requestId: string, input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    this.terminalFormUncertainty.delete(JSON.stringify([sessionId, requestId]))
    this.answeredPersistedInputs.set(sessionId, { requestId, expiresAt: Date.now() + 60_000 })
    const choice = this.sdkInputChoice(input, 'elicitation')
    this.acceptedSdkReplies.set(requestId, {
      sessionId, choice: structuredClone(choice), terminal: true,
    })
    return this.settleSdkReply(sessionId, requestId, choice)
  }

  private async continueTerminalFormReply(
    sessionId: string, requestId: string, input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    const key = JSON.stringify([sessionId, requestId])
    const receipt = this.terminalFormContinuations.get(key)!
    if (!isDeepStrictEqual(receipt.input, input)) {
      throw Object.assign(new Error(
        'The original terminal answer is still pending. Retry that exact reply only; its values cannot be replaced.',
      ), { statusCode: 409, uncertainDelivery: true })
    }
    if (receipt.sendError) {
      if (receipt.stale) await this.clearAnsweredTerminalForm(sessionId, requestId).catch(() => undefined)
      throw receipt.sendError
    }
    if (receipt.delivered) return this.settleDeliveredTerminalFormAnswer(sessionId, requestId)
    if (!receipt.dismissed) {
      if (!(await this.isToolCallComplete(sessionId, requestId.slice('persisted-user-input:'.length)))) {
        throw receipt.dismissalError
      }
      receipt.dismissed = true
    }
    // The app's dismissal is confirmed, however late; record it before the
    // writes and send that follow can fail.
    await this.store.claimTerminalRecovery(sessionId)
    const current = await this.store.readAfterWrites(sessionId)
    if (current.pendingPermission || (current.pendingUserInput &&
        !isDeepStrictEqual(current.pendingUserInput, receipt.request))) {
      receipt.sendError = new TerminalFormReplyError(
        'The terminal question changed before its retained answer could be continued. Nothing was resent; check the conversation.',
        'uncertain',
      )
      throw receipt.sendError
    }
    // Escape only freed the keyboard; it did not deliver these values. Keep
    // the original continuation through a refused card write or send receipt.
    const cleared = await this.store.clearPendingRequest(
      sessionId, 'pendingUserInput', requestId, { status: 'idle' },
    )
    if (cleared.pendingUserInput || cleared.pendingPermission) {
      receipt.sendError = new TerminalFormReplyError(
        'A new terminal question arrived while saving the retained answer. Nothing was resent; check the conversation.',
        'uncertain',
      )
      throw receipt.sendError
    }
    this.publish(cleared)
    let sent: SessionDetail
    try {
      sent = await this.sendMessage(sessionId, receipt.content, false)
    } catch (error) {
      if (error instanceof SubmissionError && error.submission?.accepted) {
        receipt.sendError = error
        throw error
      }
      if (deliveryUncertaintyFromError(error) === false) throw error
      receipt.sendError = new TerminalFormReplyError(
        'The retained terminal answer may have been delivered, but its receipt was not confirmed. Do not resend it.',
        'uncertain', { cause: error },
      )
      this.publishError(sessionId, receipt.sendError)
      throw receipt.sendError
    }
    this.terminalFormContinuations.delete(key)
    return sent
  }

  /**
   * Read-only, so a probe that outlives its budget is abandoned and read as
   * not ready. Delivery rechecks readiness under the terminal's send lock.
   */
  private async terminalHasEmptyReadyComposer(sessionId: string, deadline: number): Promise<boolean> {
    const { capture, inputReady } = this.terminalController
    if (!capture || !inputReady) return false
    const budget = Math.min(deadline - Date.now(), STALE_FORM_PROBE_MS)
    if (!(budget > 0)) return false
    let timer: NodeJS.Timeout | undefined
    const expired = new Promise<false>((resolve) => { timer = setTimeout(() => resolve(false), budget) })
    const probe = (async () => {
      const pane = await capture.call(this.terminalController, sessionId)
      if (!pane || composerHoldsText(pane)) return false
      return (await inputReady.call(this.terminalController, sessionId)) === true
    })().catch(() => false)
    try {
      return await Promise.race([probe, expired])
    } finally {
      clearTimeout(timer)
    }
  }

  private async sendTerminalFormAnswer(
    sessionId: string,
    content: string,
    answerDelivery: TerminalAnswerDelivery,
  ): Promise<SessionDetail> {
    try {
      return await this.admissions.run(sessionId, () => this.sendAdmittedMessage(
        sessionId, content, false, undefined, false, answerDelivery,
      ))
    } finally {
      this.wakeDeferredQueue(sessionId)
    }
  }

  private async clearAnsweredTerminalForm(sessionId: string, requestId: string): Promise<SessionDetail> {
    // A card left behind by a delivered answer: keep the turn's status, or
    // release a session that was only waiting on this question.
    const cleared = await this.store.clearPendingRequest(
      sessionId, 'pendingUserInput', requestId,
      (session) => session.status === 'waiting'
        ? { status: 'idle' }
        : { status: session.status, activity: session.activity },
    )
    this.publish(cleared)
    return cleared
  }

  private async settleDeliveredTerminalFormAnswer(
    sessionId: string, requestId: string,
  ): Promise<SessionDetail> {
    let cleared: SessionDetail
    try {
      cleared = await this.clearAnsweredTerminalForm(sessionId, requestId)
    } catch (error) {
      throw Object.assign(new Error(
        'The answer was delivered, but its question could not be cleared. Retry to clear it; the answer will not be sent again.',
      ), { statusCode: 500, uncertainDelivery: true, cause: error })
    }
    this.terminalFormContinuations.delete(JSON.stringify([sessionId, requestId]))
    // The card held the queue back; let a deferred drain run after the answer.
    this.wakeDeferredQueue(sessionId)
    return cleared
  }

  /**
   * The card outlived its terminal form: tmux shows an empty composer that is
   * ready for input, and nothing was dismissed or submitted. The card stays
   * until the terminal accepts the answer, so a refusal leaves the question
   * open, and the queue cannot dispatch ahead of the answer meanwhile.
   */
  private async continueStaleTerminalFormReply(
    sessionId: string, requestId: string, input: UserInputReplyInput, receipt: TerminalFormContinuation,
  ): Promise<SessionDetail> {
    const key = JSON.stringify([sessionId, requestId])
    const forget = () => {
      this.terminalFormContinuations.delete(key)
      if (this.answeredPersistedInputs.get(sessionId)?.requestId === requestId) {
        this.answeredPersistedInputs.delete(sessionId)
      }
    }
    let complete: boolean
    try {
      // Rechecked immediately before delivery: completion recorded after the
      // parser miss means the agent already has its answer.
      complete = await this.isToolCallComplete(sessionId, requestId.slice('persisted-user-input:'.length))
    } catch (error) {
      forget()
      throw error
    }
    if (complete) {
      this.terminalFormContinuations.delete(key)
      return this.acceptTerminalFormReply(sessionId, requestId, input)
    }
    const current = this.store.get(sessionId)
    if (current?.pendingPermission || current?.pendingUserInput?.requestId !== requestId) {
      forget()
      throw Object.assign(new Error(
        'The terminal question changed before its answer could be sent. Nothing was sent; check the conversation.',
      ), { statusCode: 409, uncertainDelivery: false })
    }
    receipt.stale = true
    try {
      await this.sendTerminalFormAnswer(sessionId, receipt.content, {
        onAccepted: () => { receipt.delivered = true },
      })
    } catch (error) {
      // Only a paste whose outcome is unknown says otherwise; admission,
      // readiness, and lock refusals all happen before anything is typed.
      if (!receipt.delivered && !isUncertainDelivery(error)) {
        forget()
        if (terminalRefused(error)) throw terminalAnswerRefused(error)
        if (error && typeof error === 'object' && deliveryUncertaintyFromError(error) === undefined) {
          Reflect.set(error, 'uncertainDelivery', false)
        }
        throw error
      }
      receipt.sendError = error instanceof SubmissionError && error.submission?.accepted
        ? error
        : new TerminalFormReplyError(
          'The retained terminal answer may have been delivered, but its receipt was not confirmed. Do not resend it.',
          'uncertain', { cause: error },
        )
      // It may already be in the terminal; a card left open invites a second copy.
      await this.clearAnsweredTerminalForm(sessionId, requestId).catch(() => undefined)
      this.publishError(sessionId, receipt.sendError)
      throw receipt.sendError
    }
    return this.settleDeliveredTerminalFormAnswer(sessionId, requestId)
  }

  private async dismissTerminalFormForContinuation(
    sessionId: string, request: PendingUserInput, input: UserInputReplyInput, deadline: number,
  ): Promise<SessionDetail> {
    const requestId = request.requestId
    const key = JSON.stringify([sessionId, requestId])
    const receipt: TerminalFormContinuation = {
      input: structuredClone(input),
      request: structuredClone(request),
      content: persistedFormAnswer(request, input.values || {}),
      dismissed: false,
      dismissalError: new TerminalFormReplyError(
        'The fallback dismissal was sent, but completion was not confirmed. The original answer is retained; do not resend the dismissal.',
        'uncertain',
      ),
    }
    this.terminalFormContinuations.set(key, receipt)
    let dismissed = false
    try {
      // Escape only hides current CLI forms and leaves ask_user pending.
      // Decline completes the tool before the fallback answer is sent.
      dismissed = await this.terminalController.dismissUserInput?.(sessionId, {
        question: receipt.request.question,
        fields: receipt.request.form!.fields.map((field) => field.title),
      }, 'decline', { deadline }) ?? false
    } catch (error) {
      this.publishError(sessionId, error)
      if (error instanceof TerminalFormReplyError && error.outcome === 'not-submitted') {
        this.terminalFormContinuations.delete(key)
        this.answeredPersistedInputs.delete(sessionId)
        throw error
      }
      if (error instanceof TerminalFormReplyError) {
        dismissed = error.outcome === 'submitted'
        if (!dismissed) receipt.dismissalError = error
      } else {
        receipt.sendError = new TerminalFormReplyError(
          'The fallback dismissal outcome could not be verified. The original answer is retained; check the conversation before sending more work.',
          'uncertain', { cause: error },
        )
      }
      if (!dismissed) return this.continueTerminalFormReply(sessionId, requestId, input)
    }
    if (!dismissed && await this.terminalHasEmptyReadyComposer(sessionId, deadline)) {
      return this.continueStaleTerminalFormReply(sessionId, requestId, input, receipt)
    }
    if (!dismissed) {
      this.terminalFormContinuations.delete(key)
      this.answeredPersistedInputs.delete(sessionId)
      throw Object.assign(new Error(
        'The agent is still showing its prompt, so the answer was not sent. Try again.',
      ), { statusCode: 409, uncertainDelivery: false })
    }
    await this.store.claimTerminalRecovery(sessionId)
    receipt.dismissed = await this.waitForToolCompletion(
      sessionId, requestId.slice('persisted-user-input:'.length), deadline,
    )
    return this.continueTerminalFormReply(sessionId, requestId, input)
  }

  private async replyUserInputInternal(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    if (this.store.get(sessionId)?.launchStopping) throw queueConflict('The launch is stopping; no input can resume it.')
    const started = Date.now()
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      throw new Error('Session is no longer available')
    }
    if (this.terminalFormContinuations.has(JSON.stringify([sessionId, requestId]))) {
      return this.continueTerminalFormReply(sessionId, requestId, input)
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
    const uncertainKey = JSON.stringify([sessionId, requestId])
    const uncertain = this.terminalFormUncertainty.get(uncertainKey)
    if (uncertain) {
      if (!isDeepStrictEqual(uncertain.choice, this.sdkInputChoice(input, 'elicitation'))) {
        throw Object.assign(
          new Error('A different terminal reply may already have been submitted. Retry the original reply only to check its confirmation.'),
          { statusCode: 409, uncertainDelivery: true },
        )
      }
      if (!(await this.isToolCallComplete(sessionId, requestId.slice('persisted-user-input:'.length)))) {
        throw uncertain.error
      }
      // The app's uncertain fill or dismissal is now confirmed.
      await this.store.claimTerminalRecovery(sessionId)
      return this.acceptTerminalFormReply(sessionId, requestId, input)
    }
    const stored = this.store.get(sessionId)
    const request = stored?.pendingUserInput
    if (!stored || !request || request.requestId !== requestId) {
      throw new Error('User input request is no longer pending')
    }
    if (request.stale) {
      throw Object.assign(
        new Error('This SDK user-input request expired when the service restarted. Recover the conversation to continue; the old callback cannot be resumed.'),
        { statusCode: 409 },
      )
    }
    const action = input.action || 'accept'
    // One budget covers every terminal step of a persisted form reply,
    // including waiting behind other terminal work, so it always settles.
    const formDeadline = request.form
      ? started + terminalFormReplyBudget(request.form.fields.length)
      : Infinity
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
              { deadline: formDeadline },
            ).catch((error: unknown) => this.handleTerminalFormReplyError(sessionId, requestId, input, error)))
          if (dismissed) await this.store.claimTerminalRecovery(sessionId)
          // Hiding the card cannot release the terminal's keyboard. Keep the
          // question actionable unless the owning CLI confirms it has ended.
          if (dismissed && !(await this.waitForToolCompletion(sessionId, toolCallId, formDeadline))) {
            const uncertain = new TerminalFormReplyError(
              'The terminal dismissal was sent, but completion was not confirmed. Do not resend it.',
              'uncertain',
            )
            this.terminalFormUncertainty.set(uncertainKey, {
              error: uncertain, choice: structuredClone(this.sdkInputChoice(input, 'elicitation')),
            })
            throw uncertain
          }
          // A card that outlived its prompt is dismissed here only once tmux
          // shows an empty, input-ready composer; nothing is typed for it.
          if (!dismissed && !(await this.terminalHasEmptyReadyComposer(sessionId, formDeadline))) {
            throw Object.assign(
              new Error(
                'The agent is still showing its prompt, so it was not dismissed. Try again.',
              ),
              { statusCode: 409, uncertainDelivery: false },
            )
          }
        }
        this.answeredPersistedInputs.set(sessionId, {
          requestId,
          expiresAt: Date.now() + 60_000,
        })
        return this.acceptTerminalFormReply(sessionId, requestId, input)
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
            .fillUserInputForm?.(sessionId, steps, identity, { deadline: formDeadline })
            .catch((error: unknown) => this.handleTerminalFormReplyError(sessionId, requestId, input, error)))
        // Filling reports failure for a capture that timed out as well as for
        // keys never sent, and the last Enter may already have submitted the
        // form. Answering again would then submit a second time, so the agent
        // is asked whether the request it was waiting on has finished.
        if (
          !filled &&
          (await this.isToolCallComplete(sessionId, toolCallId))
        ) {
          return this.acceptTerminalFormReply(sessionId, requestId, input)
        }
        if (filled) {
          await this.store.claimTerminalRecovery(sessionId)
          return this.acceptTerminalFormReply(sessionId, requestId, input)
        }
      }
      this.queuedDispatches.assertAvailable(sessionId)
      if (terminalBacked && request.form) {
        return this.dismissTerminalFormForContinuation(sessionId, request, input, formDeadline)
      }
      if (terminalBacked) {
        const dismissed =
          (await this.terminalController
            .dismissUserInput?.(sessionId)
            .catch((error: unknown) => this.handleTerminalFormReplyError(sessionId, requestId, input, error))) ?? false
        if (dismissed) {
          await this.store.claimTerminalRecovery(sessionId)
          await this.waitForToolCompletion(sessionId, toolCallId)
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
      await this.store.claimTerminalRecovery(sessionId)
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
    const retained = this.store.get(sessionId)
    if (retained?.closedAt || this.closingSessions.has(sessionId)) {
      throw queueConflict('Reopen the closed session before using its provider runtime.')
    }
    if (retained?.interruption || retained?.archivedAt) {
      throw queueConflict('Reopen the retained session before using its provider runtime.')
    }
    if (this.terminalActivations.has(sessionId)) {
      throw Object.assign(
        new Error('The terminal session is still reopening'),
        { statusCode: 409 },
      )
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
      throw suspendedRuntimeConflict()
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

  private async retireSdkOwnerForTerminalActivation(
    sessionId: string,
  ): Promise<void> {
    const loading = this.loadingSessions.get(sessionId)
    if (loading) {
      await loading.catch((error: unknown) => {
        if (!(error instanceof TerminalActivationSupersededError)) throw error
      })
    }
    const active = this.sessions.get(sessionId)
    if (!active) return
    if (
      this.activePrompts.has(sessionId) ||
      this.dispatchingSessions.has(sessionId)
    ) {
      throw Object.assign(
        new Error('The SDK session is still handling work; wait before reopening it in the terminal'),
        { statusCode: 409 },
      )
    }
    await active.disconnect()
    if (this.sessions.get(sessionId) === active) {
      this.removeSdkOwner(sessionId, active)
      this.hydratedSessions.delete(sessionId)
    }
  }

  private async attachSdkSession(
    sessionId: string,
    ownerGeneration = 0,
    continuePendingWork = false,
  ): Promise<CopilotSessionLike> {
    this.assertTerminalQueueSettled(sessionId)
    const stored = this.store.get(sessionId)
    if (!stored) {
      throw new Error('Session not found')
    }
    let sdkSession: CopilotSessionLike
    try {
      sdkSession = await this.client.resumeSession(sessionId, {
        ...COPILOT_SDK_SESSION_DISCOVERY,
        ...COPILOT_SDK_SESSION_INTERACTION,
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
        continuePendingWork,
      })
    } catch (error) {
      if (this.stopped || stored.messages.length > 0 || !isMissingSessionError(error)) {
        throw error
      }
      sdkSession = await this.client.createSession({
        ...COPILOT_SDK_SESSION_DISCOVERY,
        ...COPILOT_SDK_SESSION_INTERACTION,
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
      // The replacement starts Interactive; the session keeps the mode it
      // was created or configured with.
      const storedMode = agentMode(stored.runtime?.mode)
      if (storedMode && storedMode !== 'interactive') {
        await sdkSession.rpc.mode
          .set({ mode: storedMode })
          .catch((error: unknown) => this.publishError(sessionId, error))
      }
    }
    // A close that began while this attached has already stopped the runtime.
    if (
      this.stopped || this.deletedSessionIds.has(sessionId) || !this.store.get(sessionId) ||
      this.closingSessions.has(sessionId) || this.store.isClosed(sessionId)
    ) {
      try {
        await sdkSession.disconnect()
      } catch (error) {
        // Still running, so kept where Close (and a later Reopen or Delete)
        // finds it rather than lost.
        if (
          (this.closingSessions.has(sessionId) || this.store.isClosed(sessionId)) &&
          !this.sessions.has(sessionId)
        ) {
          this.installSdkOwner(sdkSession, sessionId, ownerGeneration)
        }
        throw error
      }
      throw new Error('Session is no longer available')
    }
    if (this.terminalActivations.has(sessionId)) {
      try {
        await sdkSession.disconnect()
      } catch (error) {
        if (!this.sessions.has(sessionId)) {
          this.installSdkOwner(sdkSession, sessionId, ownerGeneration)
        }
        throw Object.assign(
          new Error(
            'Unable to retire the SDK owner before reopening the terminal',
            { cause: error },
          ),
          { statusCode: 409 },
        )
      }
      throw new TerminalActivationSupersededError()
    }
    const current = this.sessions.get(sessionId)
    if (current && current !== sdkSession) {
      await sdkSession.disconnect()
      return current
    }
    this.installSdkOwner(sdkSession, sessionId, ownerGeneration)
    return sdkSession
  }

  private async recoverSdkSessions(): Promise<void> {
    const candidates = this.store.list().filter((session) =>
      session.isOpen &&
      !session.suspended &&
      !session.archivedAt &&
      Boolean(session.interruption) &&
      this.store.backend(session.id) === 'sdk' &&
      !this.sessions.has(session.id) &&
      !this.externalSessionIds.has(session.id) &&
      !this.hiddenSessionIds.has(session.id))
    await Promise.all(candidates.map((session) => this.recoverSdkSessionOnce(session.id)))
  }

  private recoverSdkSessionOnce(sessionId: string): Promise<void> {
    const existing = this.sdkRecoveryRuns.get(sessionId)
    if (existing) return existing
    const run = this.admissions.run(
      sessionId,
      () => this.serializeLifecycle(sessionId, () => this.recoverSdkSession(sessionId)),
    ).finally(() => {
      if (this.sdkRecoveryRuns.get(sessionId) === run) {
        this.sdkRecoveryRuns.delete(sessionId)
      }
    })
    this.sdkRecoveryRuns.set(sessionId, run)
    return run
  }

  private async recoverSdkSession(sessionId: string): Promise<void> {
    const stored = await this.store.readAfterWrites(sessionId)
    const previousProviderRequestId = this.store.sdkRecovery(sessionId)?.providerRequestId
    if (
      this.stopped ||
      !stored.interruption ||
      stored.archivedAt ||
      stored.suspended ||
      this.store.backend(sessionId) !== 'sdk' ||
      this.externalSessionIds.has(sessionId) ||
      this.hiddenSessionIds.has(sessionId)
    ) {
      return
    }
    const recovery = await this.store.claimSdkRecovery(sessionId)
    const claimed = this.store.get(sessionId)
    if (claimed) this.publish(claimed)
    try {
      const sdkSession = await this.attachSdkSession(
        sessionId,
        recovery.generation,
        true,
      )
      if (!this.isCurrentSdkOwner(sessionId, sdkSession, recovery.generation)) {
        return
      }
      const observation = this.store.observeTranscript(
        sessionId,
        () => this.isCurrentSdkOwner(sessionId, sdkSession, recovery.generation),
      )
      const events = await sdkSession.getEvents()
      if (!this.isCurrentSdkOwner(sessionId, sdkSession, recovery.generation)) {
        return
      }
      if (events.length) {
        const reconciled = await this.store.replaceMessages(
          sessionId,
          messagesFromHistory(events),
          observation,
        )
        if (!reconciled ||
            !this.isCurrentSdkOwner(sessionId, sdkSession, recovery.generation)) {
          return
        }
      }
      this.hydratedSessions.add(sessionId)
      const lastLifecycle = events.findLast(isForegroundLifecycleEvent)
      const acceptedReply = this.store.sdkAcceptedReply(sessionId)
      if (acceptedReply &&
          (acceptedReply.kind !== 'permission' || !acceptedReply.providerRequestId)) {
        const interrupted = await this.store.settleSdkRecovery(
          sessionId,
          recovery.generation,
          {
            state: 'interrupted',
            message: `Your ${acceptedReply.kind === 'permission'
              ? 'permission choice' : 'answer'} was saved before the restart, but delivery to the lost provider callback is uncertain. It was not sent again.`,
          },
        )
        if (interrupted) this.publish(interrupted)
        return
      }
      if (this.store.get(sessionId)?.pendingUserInput?.stale) {
        const interrupted = await this.store.settleSdkRecovery(
          sessionId,
          recovery.generation,
          {
            state: 'interrupted',
            message: 'A provider question was pending when the runtime stopped. Its callback could not be recovered; queued work was not sent.',
          },
        )
        if (interrupted) this.publish(interrupted)
        return
      }
      const permissionApi = sdkSession.rpc.permissions
      if (permissionApi) {
        const pending = await permissionApi.pendingRequests()
        if (pending.items.length > 1) {
          const failed = await this.store.settleSdkRecovery(
            sessionId,
            recovery.generation,
            {
              state: 'failed',
              message: 'More than one provider permission is pending. Recovery cannot safely choose which request to present.',
            },
          )
          if (failed) this.publish(failed)
          return
        }
        const recoveredPermission = pending.items[0]
        if (recoveredPermission) {
          const acceptedMatches = acceptedReply?.kind === 'permission' &&
            acceptedReply.providerRequestId === recoveredPermission.requestId
          const existingCardMatches =
            previousProviderRequestId === recoveredPermission.requestId
          if (acceptedReply?.kind === 'permission' && !acceptedMatches) {
            const interrupted = await this.store.settleSdkRecovery(
              sessionId,
              recovery.generation,
              {
                state: 'interrupted',
                message: 'The saved permission response no longer matches the pending provider request. Delivery is uncertain; it was not sent again.',
              },
            )
            if (interrupted) this.publish(interrupted)
            return
          }
          const requestId =
            (acceptedMatches ? acceptedReply.requestId : undefined) ||
            (existingCardMatches
              ? this.store.get(sessionId)?.pendingPermission?.requestId
              : undefined) ||
            randomUUID()
          const request = recordValue(recoveredPermission.request)
          const bound = await this.store.bindRecoveredPermission(
            sessionId,
            recovery.generation,
            requestId,
            recoveredPermission.requestId,
            {
              requestId,
              title: recoveredPermissionTitle(request),
              kind: stringValue(request.kind),
              options: [
                { optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' },
                { optionId: 'reject', name: 'Reject', kind: 'reject_once' },
              ],
            },
          )
          if (bound) this.publish(bound)
          if (bound && acceptedMatches && acceptedReply.optionId) {
            await this.replyRecoveredSdkPermission(
              sessionId,
              requestId,
              acceptedReply.optionId,
              recovery.generation,
              recoveredPermission.requestId,
            )
          }
          return
        }
        if (acceptedReply?.kind === 'permission') {
          const interrupted = await this.store.settleSdkRecovery(
            sessionId,
            recovery.generation,
            {
              state: 'interrupted',
              message: 'The provider no longer reports the saved permission request. Delivery is uncertain; the response was not sent again.',
            },
          )
          if (interrupted) this.publish(interrupted)
          return
        }
      } else if (
        acceptedReply?.kind === 'permission' ||
        lastLifecycle?.type === 'permission.requested' ||
        this.store.get(sessionId)?.pendingPermission ||
        hasUnresolvedPermissionEvent(events)
      ) {
        const interrupted = await this.store.settleSdkRecovery(
          sessionId,
          recovery.generation,
          {
            state: 'interrupted',
            message: acceptedReply?.kind === 'permission'
              ? 'A permission response was saved, but provider recovery is unavailable. Delivery is uncertain; the response was not sent again.'
              : 'A provider permission was pending, but permission recovery is not available in this runtime. Queued work was not sent.',
          },
        )
        if (interrupted) this.publish(interrupted)
        return
      }
      const completed =
        lastLifecycle?.type === 'assistant.turn_end' ||
        lastLifecycle?.type === 'session.idle'
      const settled = await this.store.settleSdkRecovery(
        sessionId,
        recovery.generation,
        completed
          ? { state: 'ready' }
          : {
              state: 'interrupted',
              message: 'The provider history was restored, but the active model turn or stream could not be resumed. Queued work was not sent.',
            },
      )
      if (settled) this.publish(settled)
    } catch (error) {
      const failed = await this.store.settleSdkRecovery(
        sessionId,
        recovery.generation,
        {
          state: 'failed',
          message: 'The saved provider identity could not be resumed. History and queued work remain retained.',
        },
      )
      if (failed) {
        this.publish(failed)
        this.publishError(
          sessionId,
          new Error(
            'SDK restart recovery failed. The saved provider identity could not be resumed.',
            { cause: error },
          ),
        )
      }
    }
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
      const confirmed = await this.store.updateIf(id, (stored) => {
        if (stored.isOpen && !stored.interruption && !stored.archivedAt) return false
        stored.isOpen = true
        stored.interruption = undefined
        stored.archivedAt = undefined
        return true
      })
      if (confirmed) this.publish(confirmed)
      return 'existing'
    }
    // Configuration and eligibility may have changed while ownership was read.
    const session = await this.store.readAfterWrites(id)
    if (this.stopped) return 'deferred'
    if (!this.store.shouldRecoverTerminalSession(id)) return 'skipped'
    // The probe confirmed no owner, so an expired opted-in record archives
    // here instead of being relaunched only to be kept alive indefinitely.
    const archived = await this.store.archiveIfExpired(id, () => !this.archivalBlocked(id, true))
    if (archived) {
      this.publish(archived)
      console.info(JSON.stringify({ sessionLifecycle: 'archived', sessionId: id, at: archived.archivedAt }))
      return 'skipped'
    }
    // The startup pump needs a positive owner, even if recovery cleanup has
    // already removed its startup marker. A FIFO alone cannot launch one.
    if (this.startupTerminalQueues.has(id) || session.queuedPrompts?.length) {
      if (session.isOpen) this.publish(await this.store.markInterrupted(id, 'queue-held'))
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
            const failed = await this.store.markInterrupted(id, 'relaunch-failed', { message, replace: true })
              .catch((cause: unknown) => {
                // Already durably interrupted, the record stays reviewable;
                // only the more specific cause could not be written.
                if (this.store.get(id)?.interruption) return undefined
                throw cause
              })
            if (failed) this.publish(failed)
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
        stored.isOpen = true
        stored.interruption = undefined
        stored.archivedAt = undefined
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
    const hadCompletedDiscovery = this.nativeDiscoveryCompleted
    this.nativeStartupDiscoveryReady = false
    let sessions: SessionMetadata[]
    let activeSessions: DiscoveredSession[]
    let generation: number
    let admissionsBeforeSnapshot: number
    while (true) {
      // A provider may list a new session before createSession() has returned
      // its ID. Do not discover it before its identity write and cleanup settle.
      while (this.sessionCreations.size) {
        await Promise.all([...this.sessionCreations])
      }
      if (this.stopped || this.lifecycleLocks.size) return false
      generation = this.discoveryGeneration
      admissionsBeforeSnapshot = this.liveTerminalAdmissionSequence
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
    // Identities and open state only: copying every session's history on each
    // discovery cycle cost more than the discovery itself.
    const storedBeforeDiscovery = this.store.discoveryIndex()
    const excluded = (id: string) =>
      this.deletedSessionIds.has(id) || this.hiddenSessionIds.has(id) ||
      this.store.isRetiredSession(id) || this.store.isClosed(id)
    activeSessions = activeSessions.filter((session) => !excluded(session.id))
    const storedIds = new Set(storedBeforeDiscovery.map((session) => session.id))
    const previouslyExternal = this.externalSessionIds
    const rediscoveredTerminalQueues = hadCompletedDiscovery
      ? activeSessions
        .map((session) => session.id)
        .filter((id) => !previouslyExternal.has(id))
      : []
    // Capture intent before syncBackends marks every observed owner open.
    for (const id of rediscoveredTerminalQueues) {
      if (!this.store.get(id)?.queuedPrompts?.length) continue
      this.rediscoveredTerminalQueues.set(
        id,
        this.store.isManagedOpen(id) ? 'resume' : 'reopen',
      )
    }
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
    const released = await this.store.syncBackends(
      activeSessions.map((session) => session.id),
      indexedSessions.map((session) => session.id),
      isCurrent,
      (id) => this.liveTerminalAdmissions.has(id),
    )
    // A grant this pass made lifted their hold, and their queue stopped there.
    for (const id of released) this.rediscoveredTerminalQueues.set(id, 'resume')
    if (!isCurrent()) return false
    const listed = new Set(activeSessions.map((session) => session.id))
    for (const [id, admission] of [...this.liveTerminalAdmissions]) {
      // Admitted before this snapshot yet not listed: that owner is gone.
      if (
        this.store.isManagedOpen(id) || !this.store.get(id) ||
        (!listed.has(id) && admission <= admissionsBeforeSnapshot)
      ) {
        this.liveTerminalAdmissions.delete(id)
      }
    }
    const renameTerminal = this.terminalController.rename?.bind(
      this.terminalController,
    )
    if (renameTerminal) {
      await Promise.all(
        activeSessions.map(async (session) => {
          if (!isCurrent()) return
          const currentTitle = this.store.title(session.id)
          if (currentTitle) {
            await renameTerminal(session.id, currentTitle)
              .catch((error: unknown) => this.publishError(session.id, error))
          }
        }),
      )
    }
    if (!isCurrent()) return false
    const present = [
      ...this.externalSessionIds,
      ...[...this.sessions.keys()].filter((id) => !excluded(id)),
    ]
    const confirmedAbsent = await this.confirmArchivalAbsence(present)
    if (!isCurrent()) return false
    await this.store.syncOpen(
      present, isCurrent, (id) => confirmedAbsent.has(id) && !this.archivalBlocked(id),
    )
    if (!isCurrent()) return false
    const before = new Map(storedBeforeDiscovery.map((session) => [session.id, session]))
    for (const indexed of this.store.discoveryIndex()) {
      const previous = before.get(indexed.id)
      if (previous?.revision === indexed.revision) continue
      const archived = Boolean(indexed.archivedAt && indexed.archivedAt !== previous?.archivedAt)
      const lifecycleChanged = archived ||
        Boolean(indexed.interruptedAt && indexed.interruptedAt !== previous?.interruptedAt)
      // History-only and closed records are not roster entries; publishing
      // them made every hub cache and re-probe them on each read.
      if (!indexed.isOpen && !lifecycleChanged) continue
      const session = this.store.get(indexed.id)
      if (!session) continue
      this.publish(session)
      // The store logs each interruption when it records one.
      if (archived) {
        console.info(JSON.stringify({ sessionLifecycle: 'archived', sessionId: session.id, at: session.archivedAt }))
      }
    }
    this.nativeStartupDiscoveryReady = isCurrent()
    if (this.nativeStartupDiscoveryReady) {
      this.nativeDiscoveryCompleted = true
      for (const [id, recovery] of [...this.rediscoveredTerminalQueues]) {
        if (!this.externalSessionIds.has(id) || !this.store.get(id)?.queuedPrompts?.length) {
          this.rediscoveredTerminalQueues.delete(id)
          continue
        }
        if (recovery !== 'reopen') continue
        // A Reopen or recovery grant that settled during this pass owns the
        // queue now; interrupting it again would strand that queue.
        if (this.store.isManagedOpen(id)) {
          this.rediscoveredTerminalQueues.set(id, 'resume')
          continue
        }
        const interrupted = await this.store.markInterrupted(id, 'queue-held', { retainedQueueOnly: true })
        if (!isCurrent()) {
          this.nativeStartupDiscoveryReady = false
          return false
        }
        if (this.store.isManagedOpen(id)) {
          this.rediscoveredTerminalQueues.set(id, 'resume')
          continue
        }
        this.rediscoveredTerminalQueues.delete(id)
        this.publish(interrupted)
        this.wakeTerminalQueue(id)
      }
      this.dispatchRediscoveredTerminalQueues()
    }
    return this.nativeStartupDiscoveryReady
  }

  private dispatchRediscoveredTerminalQueues(): void {
    if (this.startupRecoveryPending) return
    for (const [id, recovery] of [...this.rediscoveredTerminalQueues]) {
      if (!this.externalSessionIds.has(id) || !this.store.get(id)?.queuedPrompts?.length) {
        this.rediscoveredTerminalQueues.delete(id)
        continue
      }
      if (recovery !== 'resume') continue
      if (!this.store.isManagedOpen(id)) continue
      this.rediscoveredTerminalQueues.delete(id)
      this.wakeTerminalQueue(id)
    }
  }

  refreshDiscovery(): Promise<void> {
    if (this.discoveryInFlight) {
      return this.discoveryInFlight
    }
    const refresh = this.discoverSessions()
      .then(async (ready) => {
        if (ready) {
          await this.finishStartupRecovery()
          this.dispatchReadyRecoverySeeds()
        }
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

  /**
   * Takes in every session's latest events. The watcher passes when it
   * started, so a session a wake took in within its interval waits for the
   * next pass; a direct call takes everything in now.
   */
  refreshTranscripts(passStartedAt?: number): Promise<void> {
    if (this.transcriptInFlight) {
      return this.transcriptInFlight
    }
    const refresh = this.syncTranscripts(passStartedAt)
      .catch((error: unknown) => {
        this.publishError('', error)
      })
      .finally(() => {
        this.transcriptInFlight = undefined
      })
    this.transcriptInFlight = refresh
    return refresh
  }

  private async syncTranscripts(passStartedAt?: number): Promise<void> {
    if (this.stopped) return
    const sessionIds = new Set([
      ...this.externalSessionIds,
      ...this.sessions.keys(),
      ...this.pendingTerminalPromptDispatches.keys(),
      ...this.pendingTerminalQueueSettlements.keys(),
      ...this.pendingTerminalQueueClaims.keys(),
    ])
    await Promise.all(
      [...sessionIds].map((sessionId) => this.syncSessionTranscript(sessionId, passStartedAt)),
    )
  }

  /**
   * Takes in a terminal session's newly logged events as soon as they land,
   * rather than on the watcher's next pass up to an interval later -- which
   * is most of the wait between sending a message and seeing it. Only the
   * event log's size and time are read until something changed, and a session
   * already taken in within the watcher's interval waits for its next pass, so
   * a busy session is not synced any more often than before.
   */
  private async wakeChangedTranscripts(): Promise<void> {
    if (this.stopped) return
    const wokeAt = Date.now()
    try {
      await Promise.all([...this.externalSessionIds].map(async (sessionId) => {
        if (this.transcriptSessionSyncs.has(sessionId) || this.transcriptPaced(sessionId, wokeAt)) return
        const version = await this.sessionEventVersion(sessionId)
        if (!version || this.eventLogVersions.get(sessionId) === version) return
        await this.syncSessionTranscript(sessionId, wokeAt)
      }))
    } catch (error) {
      this.publishError('', error)
    }
  }

  /**
   * Whether a session's changes were taken in too recently to take in again
   * at `at`, unless a message just handed to it is still to be logged.
   */
  private transcriptPaced(sessionId: string, at: number): boolean {
    const handedAt = this.awaitedTranscriptEchoes.get(sessionId)
    if (handedAt !== undefined) {
      if (at - handedAt <= TRANSCRIPT_ECHO_WAIT_MS) return false
      this.awaitedTranscriptEchoes.delete(sessionId)
    }
    const takenAt = this.transcriptChangesTakenAt.get(sessionId)
    return takenAt !== undefined && at - takenAt < this.transcriptPace(sessionId)
  }

  /** How long after taking a session's changes in it waits to take more. */
  transcriptPace(sessionId: string): number {
    const cost = this.transcriptTakeInCosts.get(sessionId)
    if (cost === undefined || !Number.isFinite(cost)) return TRANSCRIPT_POLL_MS
    return Math.min(
      TRANSCRIPT_POLL_MS,
      Math.max(TRANSCRIPT_WAKE_MS, cost * TRANSCRIPT_PACE_COST_FACTOR),
    )
  }

  /** Watches for a message handed to a terminal at `handedAt` to be logged. */
  private awaitTranscriptEcho(sessionId: string, handedAt: number): void {
    this.awaitedTranscriptEchoes.set(sessionId, handedAt)
  }

  private syncSessionTranscript(sessionId: string, pacedAt?: number): Promise<void> {
    const running = this.transcriptSessionSyncs.get(sessionId)
    if (running) return running
    const sync = this.syncTranscriptFor(sessionId, pacedAt).finally(() => {
      if (this.transcriptSessionSyncs.get(sessionId) === sync) {
        this.transcriptSessionSyncs.delete(sessionId)
      }
    })
    this.transcriptSessionSyncs.set(sessionId, sync)
    return sync
  }

  private async syncTranscriptFor(sessionId: string, pacedAt?: number): Promise<void> {
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
    // A change taken in moments ago by a wake; the next pass takes this in.
    if (pacedAt !== undefined && this.transcriptPaced(sessionId, pacedAt)) return
    this.transcriptChangesTakenAt.set(sessionId, pacedAt ?? Date.now())
    const takeIn = { startedAt: performance.now(), endedAt: undefined as number | undefined }
    try {
      await this.takeInTranscript(sessionId, observed, version, takeIn)
    } finally {
      // Not for a session deleted while it was being read.
      if (this.store.get(sessionId)) {
        this.transcriptTakeInCosts.set(
          sessionId,
          (takeIn.endedAt ?? performance.now()) - takeIn.startedAt,
        )
      }
    }
  }

  /** Reads, projects, installs and publishes a session's changed event log. */
  private async takeInTranscript(
    sessionId: string,
    observed: TranscriptObservation,
    version: string,
    takeIn: { endedAt?: number },
  ): Promise<void> {
    const events = await this.sessionEventReader(sessionId)
    const handedAt = this.awaitedTranscriptEchoes.get(sessionId)
    if (handedAt !== undefined && events.some((event) =>
      event.type === 'user.message' && Date.parse(event.timestamp) >= handedAt)) {
      this.awaitedTranscriptEchoes.delete(sessionId)
    }
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
    // What follows can wait on a terminal, which says nothing about how
    // costly taking this session's changes in is.
    takeIn.endedAt = performance.now()
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
   * follows is typed at the prompt instead of into the closing form. A reply
   * deadline ends the wait early, after one last look.
   */
  private async waitForToolCompletion(
    sessionId: string,
    toolCallId: string,
    deadline = Infinity,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const wait = Math.min(150, deadline - Date.now())
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
      if (await this.isToolCallComplete(sessionId, toolCallId)) {
        return true
      }
      if (Date.now() >= deadline) return false
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
    wakeQueue = true,
  ): Promise<BackgroundTaskSnapshot> {
    const existing = this.backgroundTaskSyncs.get(sessionId)
    if (existing) {
      this.backgroundTaskResyncNeeded.add(sessionId)
      return existing
    }
    const previous = this.backgroundTaskTracker.get(sessionId)
    const generation = this.backgroundTaskGenerations.get(sessionId) ?? 0
    let sync: Promise<BackgroundTaskSnapshot>
    sync = (async () => {
      let snapshot: BackgroundTaskSnapshot
      // Reads are coalesced, so a whole run of an agent can begin and end
      // inside one sync. Whether anything was seen running is carried across
      // the loop: judging it by the state this sync opened on missed a turn
      // that started and finished within it, and the prompt queued behind
      // that agent was never woken.
      let sawRunning = hasRunningBackgroundAgent(previous)
      // Everything this sync does belongs to the runtime it opened on. Once
      // that runtime is replaced it stops reading, stops answering, and stops
      // taking the resync request the sync that replaced it is waiting on.
      const owns = () =>
        (this.backgroundTaskGenerations.get(sessionId) ?? 0) === generation
      do {
        if (owns()) {
          this.backgroundTaskResyncNeeded.delete(sessionId)
        }
        snapshot = await this.readBackgroundTasks(sessionId, sdkSession, generation)
        sawRunning = sawRunning || hasRunningBackgroundAgent(snapshot)
      } while (owns() && this.backgroundTaskResyncNeeded.has(sessionId))
      if (
        !this.externalSessionIds.has(sessionId) &&
        wakeQueue &&
        owns() &&
        sawRunning &&
        !hasRunningBackgroundAgent(snapshot)
      ) {
        this.wakeSdkQueue(sessionId)
      }
      return snapshot
    })().finally(() => {
      if (this.backgroundTaskSyncs.get(sessionId) === sync) {
        this.backgroundTaskSyncs.delete(sessionId)
        this.backgroundTaskResyncNeeded.delete(sessionId)
      }
    })
    this.backgroundTaskSyncs.set(sessionId, sync)
    return sync
  }

  private async readBackgroundTasks(
    sessionId: string,
    sdkSession = this.sessions.get(sessionId),
    generation = this.backgroundTaskGenerations.get(sessionId) ?? 0,
  ): Promise<BackgroundTaskSnapshot> {
    const install = (tasks: BackgroundTask[], supported: boolean) =>
      (this.backgroundTaskGenerations.get(sessionId) ?? 0) === generation
        ? this.replaceBackgroundTasks(sessionId, tasks, supported)
        : this.backgroundTaskTracker.get(sessionId)
    const tasks = sdkSession?.rpc.tasks
    if (!tasks?.list) {
      return install([], false)
    }

    try {
      await tasks.refresh?.()
    } catch (error) {
      if (!isUnsupportedBackgroundTaskError(error)) {
        throw error
      }
    }

    let listed: CopilotTaskInfo[]
    try {
      listed = (await tasks.list()).tasks.filter(isBackgroundTaskInfo)
    } catch (error) {
      if (isUnsupportedBackgroundTaskError(error)) {
        return install([], false)
      }
      throw error
    }

    const entries = [...listed]
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
            const current = (await tasks.getProgress({ id: task.id })).progress
            progress = isBackgroundTaskProgress(current) ? current : current === null ? null : undefined
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
    return install(normalized, true)
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
    ownerGeneration = this.sdkOwnerGenerations.get(sessionId) ?? 0,
  ): void {
    session.on((event) => {
      if (
        !this.isCurrentSdkOwner(sessionId, session, ownerGeneration) ||
        (this.deletedSessionIds.has(sessionId) &&
          !this.pendingSessionMetadata.has(sessionId))
      ) {
        return
      }
      this.handleSessionEvent(sessionId, event)
      if (
        isForegroundLifecycleEvent(event) &&
        (event.type === 'assistant.turn_end' || event.type === 'session.idle')
      ) {
        void this.settleAttachedSdkRecovery(
          sessionId,
          session,
          ownerGeneration,
          true,
        ).catch((error: unknown) => this.publishError(sessionId, error))
      }
    })
  }

  private async settleAttachedSdkRecovery(
    sessionId: string,
    session: CopilotSessionLike,
    generation: number,
    terminalObserved = false,
  ): Promise<void> {
    if (
      !this.isCurrentSdkOwner(sessionId, session, generation) ||
      this.store.sdkRecovery(sessionId)?.state !== 'recovering'
    ) {
      return
    }
    if (this.store.sdkAcceptedReply(sessionId)) return
    const permissionApi = session.rpc.permissions
    if (permissionApi) {
      const pending = await permissionApi.pendingRequests()
      if (pending.items.length > 0) return
    }
    if (!terminalObserved) {
      const events = await session.getEvents()
      if (!this.isCurrentSdkOwner(sessionId, session, generation)) return
      const lastLifecycle = events.findLast(isForegroundLifecycleEvent)
      if (
        lastLifecycle?.type !== 'assistant.turn_end' &&
        lastLifecycle?.type !== 'session.idle'
      ) {
        return
      }
    }
    const settled = await this.store.settleSdkRecovery(
      sessionId,
      generation,
      { state: 'ready' },
    )
    if (!settled) return
    this.publish(settled)
    this.wakeSdkQueue(sessionId)
  }

  private installSdkOwner(
    session: CopilotSessionLike,
    sessionId = session.sessionId,
    generation = 0,
  ): void {
    this.sessions.set(sessionId, session)
    this.sdkOwnerGenerations.set(sessionId, generation)
    this.attachSession(session, sessionId, generation)
  }

  private removeSdkOwner(
    sessionId: string,
    expected?: CopilotSessionLike,
  ): boolean {
    if (expected && this.sessions.get(sessionId) !== expected) return false
    const removed = this.sessions.delete(sessionId)
    if (removed) this.sdkOwnerGenerations.delete(sessionId)
    return removed
  }

  private isCurrentSdkOwner(
    sessionId: string,
    session: CopilotSessionLike,
    generation: number,
  ): boolean {
    return this.sessions.get(sessionId) === session &&
      this.sdkOwnerGenerations.get(sessionId) === generation
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

  private finishLiveTaskCompletion(
    sessionId: string,
    completion: LiveTaskCompletion,
    summary: string,
  ): void {
    if (!completion.completedAt) {
      return
    }
    if (completion.assistantMessageId) {
      this.completedTaskPromptMessages.add(
        `${sessionId}:${completion.assistantMessageId}`,
      )
    }
    void this.store
      .finishTaskCompletion(
        sessionId,
        completion.toolCallId,
        summary,
        completion.completedAt,
        completion.assistantMessageId,
      )
      .then((stored) => this.publish(stored))
      .catch((error: unknown) => this.publishError(sessionId, error))
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
      if (toolName === 'task_complete' && !eventAgentId(event)) {
        this.liveTaskCompletions.set(sessionId, {
          fallbackSummary:
            stringValue(recordValue(event.data.arguments).summary)?.trim() ||
            undefined,
          toolCallId: event.data.toolCallId,
        })
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

    if (event.type === 'session.task_complete' && !eventAgentId(event)) {
      if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        this.liveTaskCompletions.delete(sessionId)
        return
      }
      const completion = this.liveTaskCompletions.get(sessionId)
      if (!completion) {
        return
      }
      completion.completionEventReceived = true
      completion.completionAccepted = taskCompletionAccepted(event)
      completion.canonicalSummary = event.data.summary?.trim() || undefined
      if (!completion.completedAt) {
        return
      }
      this.liveTaskCompletions.delete(sessionId)
      const summary =
        completion.canonicalSummary || completion.fallbackSummary
      if (!completion.completionAccepted || !summary) {
        return
      }
      this.finishLiveTaskCompletion(sessionId, completion, summary)
      return
    }

    if (event.type === 'tool.execution_complete') {
      if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
      const completion = this.liveTaskCompletions.get(sessionId)
      const isTaskCompletion =
        completion?.toolCallId === event.data.toolCallId
      if (isTaskCompletion) {
        completion.completedAt = event.timestamp
        completion.assistantMessageId = activePrompt?.assistantMessageId
      }
      const taskCompletionSummary =
        completion?.canonicalSummary || completion?.fallbackSummary
      const presentationResult = activityResult(event.data, event.data.success)
      const update =
        isTaskCompletion &&
        event.data.success &&
        completion.completionEventReceived &&
        completion.completionAccepted &&
        taskCompletionSummary
          ? this.store.finishTaskCompletion(
              sessionId,
              event.data.toolCallId,
              taskCompletionSummary,
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
      if (
        isTaskCompletion &&
        event.data.success &&
        completion.completionEventReceived &&
        completion.completionAccepted &&
        taskCompletionSummary &&
        activePrompt?.assistantMessageId
      ) {
        this.completedTaskPromptMessages.add(
          `${sessionId}:${activePrompt.assistantMessageId}`,
        )
      }
      if (
        isTaskCompletion &&
        (!event.data.success || completion.completionEventReceived)
      ) {
        this.liveTaskCompletions.delete(sessionId)
      }
      void update
        .then((stored) => this.publish(stored))
        .catch((error: unknown) => this.publishError(sessionId, error))
      return
    }

    if (
      !eventAgentId(event) &&
      (event.type === 'session.idle' ||
        event.type === 'abort' ||
        event.type === 'session.error' ||
        event.type === 'session.shutdown')
    ) {
      const completion = this.liveTaskCompletions.get(sessionId)
      this.liveTaskCompletions.delete(sessionId)
      if (
        event.type === 'session.idle' &&
        completion?.completedAt &&
        completion.fallbackSummary
      ) {
        this.finishLiveTaskCompletion(
          sessionId,
          completion,
          completion.fallbackSummary,
        )
      }
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
    let completionAssistantMessageId = assistantMessageId
    let providerOutcome: 'succeeded' | 'failed' | 'stopped' | 'unknown' = 'unknown'
    const unsubscribeOutcome = sdkSession.on((event) => {
      if (eventAgentId(event)) return
      if (event.type === 'abort') providerOutcome = 'stopped'
      else if (event.type === 'session.error') providerOutcome = 'failed'
      else if (event.type === 'session.idle' && providerOutcome === 'unknown') providerOutcome = 'succeeded'
    })
    this.sdkTurnsAwaited.set(sessionId, assistantMessageId)
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
      if (
        this.retiredSdkPromptRuns.has(assistantMessageId) ||
        this.stopped ||
        this.deletingSessions.has(sessionId) ||
        !this.store.get(sessionId)
      ) {
        return
      }
      const pendingFollowUp = this.pendingSdkFollowUps.get(sessionId)
      if (pendingFollowUp) pendingFollowUp.previousCompleted = true
      await pendingFollowUp?.settled
      if (
        this.retiredSdkPromptRuns.has(assistantMessageId) ||
        this.stopped ||
        this.deletingSessions.has(sessionId) ||
        !this.store.get(sessionId)
      ) {
        return
      }
      completionAssistantMessageId = pendingFollowUp
        ? assistantMessageId
        : this.activePrompts.get(sessionId)?.assistantMessageId ||
          assistantMessageId
      if (
        response?.data.content &&
        !this.completedTaskPromptMessages.has(
          `${sessionId}:${completionAssistantMessageId}`,
        )
      ) {
        this.store.setMessageContent(
          sessionId,
          completionAssistantMessageId,
          response.data.content,
        )
      }
      await this.store.finishMessage(sessionId, completionAssistantMessageId)
      await this.store.settlePromptOutcome(sessionId, assistantMessageId, providerOutcome)
      const updated = await this.store.updateIf(sessionId, (session) => {
        if (this.activePrompts.get(sessionId)?.assistantMessageId !== completionAssistantMessageId) return false
        for (const message of session.messages) {
          if (
            message.role === 'activity' &&
            message.activityStatus === 'running'
          ) {
            message.activityStatus = 'completed'
          }
        }
        if (
          completionAssistantMessageId !== assistantMessageId &&
          session.failedPrompt?.uncertain
        ) {
          session.failedPrompt = undefined
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
      if (
        this.retiredSdkPromptRuns.has(assistantMessageId) ||
        this.stopped ||
        this.deletingSessions.has(sessionId) ||
        !this.store.get(sessionId)
      ) {
        return
      }
      const message = error instanceof Error ? error.message : String(error)
      await this.store.settlePromptOutcome(sessionId, assistantMessageId, providerOutcome)
      const pendingFollowUp = this.pendingSdkFollowUps.get(sessionId)
      if (pendingFollowUp) pendingFollowUp.previousCompleted = true
      await pendingFollowUp?.settled
      if (
        this.retiredSdkPromptRuns.has(assistantMessageId) ||
        this.stopped ||
        this.deletingSessions.has(sessionId) ||
        !this.store.get(sessionId)
      ) {
        return
      }
      completionAssistantMessageId = pendingFollowUp
        ? assistantMessageId
        : this.activePrompts.get(sessionId)?.assistantMessageId ||
          assistantMessageId
      const updated = await this.store.updateIf(sessionId, (session) => {
        if (this.activePrompts.get(sessionId)?.assistantMessageId !== completionAssistantMessageId) return false
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
          (entry) => entry.id === completionAssistantMessageId,
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
      unsubscribeOutcome()
      // Released last: a follow-up accepted while this turn was awaited is
      // closed by it, and one accepted afterwards has to close itself.
      if (this.sdkTurnsAwaited.get(sessionId) === assistantMessageId) {
        this.sdkTurnsAwaited.delete(sessionId)
      }
      this.retiredSdkPromptRuns.delete(assistantMessageId)
      this.completedTaskPromptMessages.delete(
        `${sessionId}:${assistantMessageId}`,
      )
      this.completedTaskPromptMessages.delete(
        `${sessionId}:${completionAssistantMessageId}`,
      )
      if (this.activePrompts.get(sessionId)?.assistantMessageId === completionAssistantMessageId) {
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
    if (this.stopped || this.deletingSessions.has(sessionId) || this.store.get(sessionId)?.launchStopping) return
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
    if (this.stopped || this.deletingSessions.has(sessionId) || this.store.get(sessionId)?.launchStopping) return
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
    if (this.stopped || this.deletingSessions.has(sessionId) || this.store.get(sessionId)?.launchStopping) return
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
      this.store.recoverySeed(sessionId) ||
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
        if (current.interruption || current.archivedAt || current.suspended || this.suspendingSessions.has(sessionId) ||
            current.pendingPermission || current.pendingUserInput || current.failedPrompt ||
            this.store.recoverySeed(sessionId) ||
            this.activePrompts.has(sessionId) ||
            hasRunningBackgroundAgent(this.backgroundTaskTracker.get(sessionId)) ||
            (current.status !== 'idle' && current.status !== 'error')) return
        const assertIdle = (session: SessionDetail) => {
          if (
            this.stopped || this.deletingSessions.has(sessionId) ||
            this.suspendingSessions.has(sessionId) || session.suspended || session.interruption || session.archivedAt ||
            session.failedPrompt || session.pendingPermission ||
            session.pendingUserInput || this.store.recoverySeed(sessionId) ||
            this.activePrompts.has(sessionId) ||
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
            !remaining.queuedDispatch && !this.store.recoverySeed(sessionId) &&
            !this.activePrompts.has(sessionId)) {
          this.sdkDrainRequested.add(sessionId)
        }
      })
    } catch (error) {
      if (error instanceof StaleQueuedPromptReservationError) this.sdkDrainRequested.add(sessionId)
      // Retention landed at the claim: the queue is intact and Reopen drains it.
      else if (isRetainedRefusal(error)) this.sdkDrainRequested.delete(sessionId)
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
    this.assertNotRetained(sessionId, 'dispatching its queue')
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
            session.pendingUserInput || this.store.recoverySeed(sessionId) ||
            this.activePrompts.has(sessionId) ||
            this.terminalController.sending?.(sessionId)
          ) {
            throw queueConflict(
              'The session is not idle and available. The original queued message has not been sent.',
            )
          }
        }
        assertSessionNotRetained(stored, 'dispatching its queue')
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
          !current.failedPrompt && !current.queuedDispatch &&
          !this.store.recoverySeed(sessionId)) {
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
    if (this.stopped || this.deletingSessions.has(sessionId) || this.store.get(sessionId)?.launchStopping) return
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
      this.startupTerminalQueues.delete(sessionId)
      this.clearTerminalQueueRetry(sessionId)
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
        this.clearTerminalQueueRetry(sessionId)
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
      if (stored.interruption || stored.archivedAt) {
        // Retained work waits, untouched and unpolled, for Reopen to drain it.
        this.clearTerminalQueueRetry(sessionId)
        this.startupTerminalQueues.delete(sessionId)
        const previous = this.terminalQueueStates.get(sessionId)
        if (next) {
          this.terminalQueueStates.set(sessionId, {
            state: 'waiting',
            promptId: next.id,
            message: 'Reopen the session to resume queued delivery.',
            updatedAt: new Date().toISOString(),
          })
          if (previous?.state !== 'waiting' || previous.promptId !== next.id ||
              previous.message !== 'Reopen the session to resume queued delivery.') {
            this.publish(stored)
          }
        } else {
          this.terminalQueueStates.delete(sessionId)
        }
        return false
      }
      const terminalDispatch = this.store.terminalQueueDispatch(sessionId)
      const startup = this.startupTerminalQueues.has(sessionId)
      if (!next) {
        this.clearTerminalQueueRetry(sessionId)
        this.startupTerminalQueues.delete(sessionId)
        return false
      }
      if (startup && !this.hasStartupQueueLifecycle(sessionId, stored)) {
        this.startupTerminalQueues.delete(sessionId)
        this.clearTerminalQueueRetry(sessionId)
        const previous = this.terminalQueueStates.get(sessionId)
        this.terminalQueueStates.set(sessionId, {
          state: 'waiting',
          promptId: next.id,
          message: 'Reopen the session to resume queued delivery.',
          updatedAt: new Date().toISOString(),
        })
        if (previous?.state !== 'waiting' || previous.promptId !== next.id ||
            previous.message !== 'Reopen the session to resume queued delivery.') {
          this.publish(stored)
        }
        return false
      }
      if (stored.failedPrompt ||
          (stored.queueState?.state === 'error' && stored.queueState.promptId === next.id) ||
          terminalDispatch ||
          this.store.recoverySeed(sessionId) ||
          this.pendingTerminalPromptDispatches.has(sessionId)) {
        this.clearTerminalQueueRetry(sessionId)
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
      // A steer at the head goes into the running turn once the composer is
      // back, including a turn that outlived a hub restart. Anything queued
      // before it still waits for the turn to end, and the steer waits behind it.
      const midTurnSteer =
        next.steer === true && !next.command &&
        stored.status === 'running' &&
        !stored.pendingPermission && !stored.pendingUserInput
      if (stored.status !== 'idle' && !midTurnSteer) {
        this.retryTerminalQueueClaim(sessionId)
        return false
      }
      if (!isCurrent()) {
        this.retryTerminalQueueClaim(sessionId)
        return false
      }
      if (startup && !(await this.terminalController.has(sessionId))) {
        this.retryTerminalQueueClaim(sessionId, true)
        return false
      }
      const before = await this.terminalController.capture?.(sessionId)
      if (before && isTerminalSessionInUseConflict(before)) {
        this.retryTerminalQueueClaim(sessionId)
        return false
      }
      if (startup && (!before?.trim() || composerHoldsText(before))) {
        this.retryTerminalQueueClaim(sessionId, !before?.trim())
        return false
      }
      const currentQueueState = this.terminalQueueStates.get(sessionId)
      const composerKnownUnavailable = before !== undefined &&
        !terminalInputReady(before) &&
        (
          !before.trim() ||
          isTerminalOverlay(before) ||
          isTerminalAgentWorking(before) ||
          /waiting for background shells/i.test(before) ||
          (currentQueueState?.state === 'waiting' && currentQueueState.promptId === next.id)
        )
      if (!midTurnSteer && composerKnownUnavailable) {
        this.waitForTerminalQueueComposer(sessionId, stored, next.id)
        return false
      }
      if (next.command && !before?.trim()) {
        throw new Error('The terminal could not be read before command delivery; the command remains queued')
      }
      if (midTurnSteer
        ? !before || !terminalInputReady(before, true) || composerHoldsText(before)
        : before && (isTerminalOverlay(before) || isTerminalAgentWorking(before))) {
        this.retryTerminalQueueClaim(sessionId)
        return false
      }
      let claimed: Awaited<ReturnType<SessionStore['claimTerminalQueuedPrompt']>>
      try {
        claimed = await this.store.claimTerminalQueuedPrompt(sessionId, next, isCurrent, startup, midTurnSteer)
      } catch (error) {
        if (!isRetainedRefusal(error)) throw error
        this.clearTerminalQueueRetry(sessionId)
        this.startupTerminalQueues.delete(sessionId)
        return false
      }
      const { session, dispatch } = claimed
      this.admissions.markCommitted(sessionId)
      this.clearTerminalQueueRetry(sessionId)
      this.terminalQueueStates.delete(sessionId)
      if (this.stopped || this.deletingSessions.has(sessionId)) return false
      this.publish(session)

      // Once this claim is durable, neither a refused completion write nor a
      // process restart can put the externally delivered action back in FIFO.
      let outcome: PendingTerminalQueueSettlement['outcome']
      let failureReason: string | undefined
      let failureMessage: string | undefined
      let quiet = false
      try {
        if (this.suspendingSessions.has(sessionId)) {
          throw new Error('The session began suspending before queued delivery; nothing was sent')
        }
        const handedAt = Date.now()
        const sent = midTurnSteer
          ? await this.terminalController.send(sessionId, next.content, false, { allowDuringAgentExecution: true })
          : this.terminalController.sendWhenIdle
            ? await this.terminalController.sendWhenIdle(sessionId, next.content)
            : await this.terminalController.send(sessionId, next.content, false)
        if (!sent) {
          throw new Error('External terminal is no longer available')
        }
        this.awaitTranscriptEcho(sessionId, handedAt)
        // Use the confirmed handoff, not FIFO acceptance or a pre-readiness timestamp.
        const confirmedAt = new Date().toISOString()
        outcome = next.command
          ? { kind: 'feedback', command: next.content, before, handedAt: confirmedAt }
          // A steer joins the turn already running rather than starting one.
          : { kind: 'accepted', startedTurn: !midTurnSteer, handedAt: confirmedAt }
      } catch (error) {
        const uncertain = isUncertainDelivery(error)
        quiet = !uncertain && isTerminalNotReadyRefusal(error)
        failureReason = error instanceof Error ? error.message : String(error)
        outcome = {
          kind: 'failed',
          uncertain,
          ...(!uncertain && !quiet
            ? {
                queueState: {
                  state: 'error' as const,
                  promptId: next.id,
                  message: `${failureReason}${failureReason.endsWith('.') ? '' : '.'} The queued prompt was not sent.`,
                  updatedAt: new Date().toISOString(),
                },
              }
            : {}),
        }
        failureMessage = `${failureReason}${
          uncertain
            ? ''
            : ' The original queued message is unchanged; it was not sent.'
        }`
      }
      this.pendingTerminalQueueSettlements.set(sessionId, {
        dispatchId: dispatch.id,
        outcome,
        overlayOpen: false,
        failureReason,
        failureMessage,
        retryAt: 0,
        retryDelay: 750,
        ...(quiet ? { quiet } : {}),
      })
      return await this.settleTerminalQueue(sessionId)
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

  private clearTerminalQueueRetry(sessionId: string): void {
    this.pendingTerminalQueueClaims.delete(sessionId)
    const timer = this.terminalQueueRetryTimers.get(sessionId)
    if (timer) clearTimeout(timer)
    this.terminalQueueRetryTimers.delete(sessionId)
  }

  private terminalSteerRetryDelay(
    sessionId: string,
    session = this.store.get(sessionId),
  ): number | undefined {
    const next = session?.queuedPrompts?.[0]
    return session &&
      session.status === 'running' &&
      !session.interruption &&
      !session.archivedAt &&
      !session.suspended &&
      !session.pendingPermission &&
      !session.pendingUserInput &&
      !session.failedPrompt &&
      !session.queuedDispatch &&
      !(session.queueState?.state === 'error' && session.queueState.promptId === next?.id) &&
      !this.store.terminalQueueDispatch(sessionId) &&
      !this.store.recoverySeed(sessionId) &&
      !this.pendingTerminalPromptDispatches.has(sessionId) &&
      next?.steer === true &&
      !next.command &&
      (this.store.backend(sessionId) === 'terminal' || this.externalSessionIds.has(sessionId))
      ? TERMINAL_STEER_RETRY_MS
      : undefined
  }

  private retryTerminalQueueClaim(sessionId: string, failed = false): boolean {
    const session = this.store.get(sessionId)
    if (!session?.queuedPrompts?.length || this.stopped || this.deletingSessions.has(sessionId) ||
        (this.startupTerminalQueues.has(sessionId) && !this.hasStartupQueueLifecycle(sessionId, session)) ||
        (session.failedPrompt && !this.awaitingAcceptedStartupRecovery(sessionId, session))) {
      this.clearTerminalQueueRetry(sessionId)
      this.terminalQueueStates.delete(sessionId)
      this.startupTerminalQueues.delete(sessionId)
      return false
    }
    const readyDelay = this.terminalSteerRetryDelay(sessionId, session)
    const delay = readyDelay ?? (
      failed
        ? this.pendingTerminalQueueClaims.get(sessionId)?.retryDelay || 750
        : 750
    )
    const retryAt = Date.now() + delay
    this.pendingTerminalQueueClaims.set(sessionId, {
      retryAt,
      retryDelay: failed ? Math.min(delay * 2, 60_000) : 750,
    })
    const previous = this.terminalQueueRetryTimers.get(sessionId)
    if (previous) clearTimeout(previous)
    this.terminalQueueRetryTimers.delete(sessionId)
    if (readyDelay === undefined) return true
    let timer: NodeJS.Timeout
    const wake = () => {
      if (this.terminalQueueRetryTimers.get(sessionId) !== timer) return
      if (this.pendingTerminalQueueClaims.get(sessionId)?.retryAt !== retryAt) {
        this.terminalQueueRetryTimers.delete(sessionId)
        return
      }
      const remaining = retryAt - Date.now()
      if (remaining > 0) {
        timer = setTimeout(wake, remaining)
        timer.unref()
        this.terminalQueueRetryTimers.set(sessionId, timer)
        return
      }
      // The fired timer still owns liveness while its wake waits for queue
      // serialization. Claim, invalidation, or rearm clears or replaces it.
      this.wakeTerminalQueue(sessionId)
    }
    timer = setTimeout(wake, delay)
    timer.unref()
    this.terminalQueueRetryTimers.set(sessionId, timer)
    return true
  }

  private waitForTerminalQueueComposer(
    sessionId: string,
    session: SessionDetail,
    promptId: string,
  ): void {
    const previous = this.terminalQueueStates.get(sessionId)
    if (session.interruption || session.archivedAt) {
      this.clearTerminalQueueRetry(sessionId)
      this.startupTerminalQueues.delete(sessionId)
      this.terminalQueueStates.set(sessionId, {
        state: 'waiting',
        promptId,
        message: 'Reopen the session to resume queued delivery.',
        updatedAt: new Date().toISOString(),
      })
      if (previous?.state !== 'waiting' || previous.promptId !== promptId ||
          previous.message !== 'Reopen the session to resume queued delivery.') {
        this.publish(session)
      }
      return
    }
    const startup = this.startupTerminalQueues.has(sessionId)
    if (!this.retryTerminalQueueClaim(sessionId, true)) {
      const current = this.store.get(sessionId)
      if (!this.stopped && !this.deletingSessions.has(sessionId) &&
          current?.queuedPrompts?.[0]?.id === promptId &&
          (current.interruption || current.archivedAt ||
            (startup && !this.hasStartupQueueLifecycle(sessionId, current)))) {
        this.terminalQueueStates.set(sessionId, {
          state: 'waiting',
          promptId,
          message: 'Reopen the session to resume queued delivery.',
          updatedAt: new Date().toISOString(),
        })
        if (previous?.state !== 'waiting' || previous.promptId !== promptId ||
            previous.message !== 'Reopen the session to resume queued delivery.') {
          this.publish(current)
        }
        return
      }
      if (previous) this.publish(session)
      return
    }
    const retry = this.pendingTerminalQueueClaims.get(sessionId)
    this.terminalQueueStates.set(sessionId, {
      state: 'waiting',
      promptId,
      message: 'Waiting for the terminal composer. Delivery will retry automatically.',
      updatedAt: new Date().toISOString(),
      ...(retry ? { retryAt: new Date(retry.retryAt).toISOString() } : {}),
    })
    if (previous?.state !== 'waiting' || previous.promptId !== promptId ||
        previous.message !== 'Waiting for the terminal composer. Delivery will retry automatically.') {
      this.publish(session)
    }
  }

  private settleTerminalRecoveryForActivation(sessionId: string): void {
    if (!this.isTerminalRecoveryPending(sessionId)) return
    this.terminalRecoveryStates ??= new Map(
      (this.terminalController.create ? this.store.terminalRecoverySessions() : [])
        .map(({ id }) => [id, 'pending']),
    )
    this.terminalRecoveryStates.set(sessionId, 'settled')
    this.startupTerminalQueues.delete(sessionId)
    this.clearTerminalQueueRetry(sessionId)
    this.terminalQueueStates.delete(sessionId)
  }

  private async reconcileReopenedTerminalStatus(
    sessionId: string,
    session: SessionDetail,
  ): Promise<SessionDetail> {
    if (
      session.status === 'idle' ||
      session.pendingPermission ||
      session.pendingUserInput ||
      session.failedPrompt ||
      session.queuedDispatch
    ) {
      return session
    }
    if (await this.terminalController.inputReady?.(sessionId) !== true) {
      return session
    }
    this.liveTranscriptWatermarks.set(sessionId, new Date().toISOString())
    const updated = await this.store.updateIf(sessionId, (current) => {
      if (
        current.status === 'idle' ||
        current.pendingPermission ||
        current.pendingUserInput ||
        current.failedPrompt ||
        current.queuedDispatch
      ) {
        return false
      }
      current.status = 'idle'
      current.activity = undefined
      return true
    })
    return updated ?? this.store.readAfterWrites(sessionId)
  }

  private assertTerminalQueueSettled(
    sessionId: string,
    allowRecoveryPending = false,
  ): void {
    if (this.stopped) {
      throw new Error('The session service is stopping')
    }
    if (!allowRecoveryPending) this.assertTerminalRecoverySettled(sessionId)
    if (this.store.terminalQueueDispatch(sessionId) ||
        this.pendingTerminalPromptDispatches.has(sessionId)) {
      throw Object.assign(
        new Error('A queued prompt is still awaiting durable delivery confirmation. Wait before sending more work.'),
        { statusCode: 409 },
      )
    }
  }

  private assertRecoverySeedSettled(sessionId: string): void {
    if (this.store.recoverySeed(sessionId)) {
      throw queueConflict('The recovery brief must be admitted before slash commands can run. Recover the conversation if context rebuilding failed.')
    }
  }

  private assertRecoverySeedReplacementAvailable(sessionId: string): void {
    const seed = this.store.recoverySeed(sessionId)
    if (
      this.recoverySeedDispatches.has(sessionId) ||
      (seed && seed.state !== 'failed')
    ) {
      throw queueConflict('The recovery brief has not settled. Wait before replacing the conversation.')
    }
  }

  private async assertRecoveryBackgroundTasksSettled(
    sessionId: string,
  ): Promise<void> {
    let snapshot: BackgroundTaskSnapshot
    try {
      snapshot = await this.listBackgroundTasks(sessionId)
    } catch (error) {
      throw Object.assign(new Error(
        'Background tasks could not be checked. Retry before recovering the conversation.',
        { cause: error },
      ), { statusCode: 409 })
    }
    if (hasActiveBackgroundTasks(snapshot)) {
      throw Object.assign(new Error(
        'Wait for queued or running background tasks to finish before recovering the conversation',
      ), { statusCode: 409 })
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
        pending.outcome = {
          kind: 'accepted', startedTurn: feedback.startedTurn, notice: feedback.notice, handedAt: pending.outcome.handedAt,
        }
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
    if ((pending.outcome.kind === 'failed' && !pending.quiet) ||
        (pending.outcome.kind === 'accepted' && pending.outcome.startedTurn) ||
        !settled.queuedPrompts?.length) {
      this.startupTerminalQueues.delete(sessionId)
    }
    if (this.stopped) return false
    if (pending.outcome.kind === 'failed' && pending.quiet) {
      this.waitForTerminalQueueComposer(
        sessionId,
        settled,
        settled.queuedPrompts?.[0]?.id || '',
      )
      return false
    }
    if (pending.outcome.kind === 'failed' && pending.outcome.uncertain) {
      this.terminalQueueStates.delete(sessionId)
      this.publish(settled)
      this.emit('event', {
        type: 'error',
        sessionId,
        message: pending.failureMessage || 'The queued prompt delivery could not be confirmed',
        failedPrompt: settled.failedPrompt?.content,
        failedPromptAt: settled.failedPrompt?.failedAt,
      })
      return false
    }
    if (pending.outcome.kind === 'failed') {
      this.terminalQueueStates.delete(sessionId)
      this.publish(settled)
      this.emit('event', {
        type: 'error',
        sessionId,
        message: pending.failureMessage || 'The queued prompt could not be delivered',
        failedPrompt: settled.failedPrompt?.content,
        failedPromptAt: settled.failedPrompt?.failedAt,
      })
      return false
    }
    this.terminalQueueStates.delete(sessionId)
    this.publish(settled)
    // A steer now at the head is polled for while the turn runs: the one this
    // delivery started, or the one a delivered steer joined.
    if (pending.overlayOpen) {
      this.retryTerminalQueueClaim(sessionId)
    } else if (settled.queuedPrompts?.[0]?.steer) {
      this.retryTerminalQueueClaim(sessionId)
    }
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
      const handedAt = Date.now()
      if (!(await this.terminalController.send(sessionId, prompt.content, false))) {
        delivery.refuse()
        throw queueConflict('The owning terminal is no longer available.')
      }
      this.awaitTranscriptEcho(sessionId, handedAt)
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

  private async serializeTerminalImmediate<T>(
    sessionId: string,
    operation: (releaseOrder: () => void) => Promise<T>,
  ): Promise<T> {
    const previous =
      this.terminalImmediateOperations.get(sessionId) || Promise.resolve()
    let released = false
    let resolveOrder = () => {}
    const current = new Promise<void>((resolve) => {
      resolveOrder = resolve
    })
    const releaseOrder = () => {
      if (released) return
      released = true
      resolveOrder()
    }
    const result = previous.catch(() => undefined).then(() => operation(releaseOrder))
    this.terminalImmediateOperations.set(sessionId, current)
    try {
      return await result
    } finally {
      releaseOrder()
      if (this.terminalImmediateOperations.get(sessionId) === current) {
        this.terminalImmediateOperations.delete(sessionId)
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
    // A closed session left the list with its removal; a write that lands
    // afterwards must not put it back on any client.
    if (this.store.isClosed(session.id)) return
    this.emit('event', { type: 'session.upserted', session: this.publicSession(session) })
  }

  private publicSession(session: SessionDetail): SessionDetail {
    session = this.queuedDispatches.view(session)
    const queued = session.queuedPrompts?.[0]
    const retainedQueueState: QueueState | undefined =
      queued && (session.interruption || session.archivedAt)
        ? {
          state: 'waiting',
          promptId: queued.id,
          message: 'Reopen the session to resume queued delivery.',
          updatedAt: session.interruption?.detectedAt ?? session.archivedAt ?? session.updatedAt,
        }
        : undefined
    const queueState =
      retainedQueueState ?? this.terminalQueueStates.get(session.id) ?? session.queueState
    session = queueState && session.queuedPrompts?.[0]?.id === queueState.promptId
      ? { ...session, queueState }
      : session.queueState
        ? { ...session, queueState: undefined }
        : session
    const failed = session.failedPrompt
    if (!failed) return session
    const current = this.store.failedPrompt(session.id)
    const receipt = this.store.recoveryResend(session.id)
    const obsolete = !current || current.failedAt !== failed.failedAt || current.content !== failed.content
    const accepted = this.recoveryClaims.get(failed.failedAt)?.accepted ||
      (receipt && receipt.failedAt === failed.failedAt && receipt.accepted)
    return obsolete
      ? { ...session, failedPrompt: undefined }
      : accepted
        ? { ...session, failedPrompt: undefined, recoveryAcknowledgementPending: true }
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

  listSessionPaneRoots() {
    return this.terminalController.listSessionPaneRoots?.() ?? Promise.resolve([])
  }

  /**
   * Starts Copilot in a disposable tmux session to see whether this version
   * still starts in a way the app can drive, then removes it and its files.
   */
  async probeTerminalStartup(cwd: string, signal?: AbortSignal): Promise<void> {
    if (!this.terminalController.probeStartup) {
      throw new Error('This computer cannot start terminal sessions')
    }
    // A probe a stopped service left running is ended first. Its files are
    // removed only for a session retired as a probe would have been.
    for (const leftover of (await this.terminalController.endLeftoverProbes?.()) ?? []) {
      if (!this.store.isRetiredSession(leftover)) continue
      forgetSessionEvents(leftover)
      await removeCopilotSessionFiles(leftover)
    }
    const id = randomUUID()
    // Never offered as a session: discovery ignores it from the start, and it
    // stays retired should the service stop before it is removed.
    this.deletedSessionIds.add(id)
    await this.store.retireSessionIds([id])
    try {
      await this.terminalController.probeStartup(id, cwd, signal)
    } finally {
      forgetSessionEvents(id)
      await removeCopilotSessionFiles(id)
    }
  }

  /** Ends any probe still running; its own call then removes its files. */
  async endTerminalProbes(): Promise<void> {
    await this.terminalController.endLeftoverProbes?.()
  }

  /** A problem that needs someone's attention: shown and sent as a notification. */
  publishAlert(message: string): void {
    if (this.stopped) return
    this.emit('event', { type: 'error', message, notify: true })
  }

  private async validateDirectory(inputPath: string): Promise<string> {
    return validateSessionDirectory(inputPath)
  }
}
