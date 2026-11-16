import type { ManagerEvent } from './manager.js'
import type { SettingsProfileSnapshot } from './settings-profile.js'
import type { NotificationsChanged } from './notification-center.js'
import type { SchedulerChanged } from './schedules.js'
import type { PromptAcceptanceReceipt, TerminationAcknowledgement } from './launch-identity.js'

export type SessionStatus = 'idle' | 'running' | 'waiting' | 'error'
export type AgentMode = 'interactive' | 'plan' | 'autopilot'
export type AgentProvider = 'copilot' | 'claude'
export type SessionExecutionMode = 'tmux' | 'sdk'
export type RuntimeReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface AgentProviderCapability {
  id: AgentProvider
  name: string
  available: boolean
  terminalBacked: boolean
  supportsTmuxMigration?: boolean
  supportsBackgroundTasks?: boolean
  supportsQueuedPromptDispatch?: boolean
  supportsSessionResources?: boolean
  supportsContextRecovery?: boolean
  supportsSessionRetention?: boolean
  /** Close keeps the session reopenable instead of deleting it. */
  supportsRecoverableClose?: boolean
  /** Answers side questions about a session without prompting it. */
  supportsSideQuestions?: boolean
  supportsLaunchIdentity?: boolean
  unavailableReason?: string
}

export type SessionResourceScope = 'session' | 'workspace' | 'last-known' | 'unavailable'

export interface SessionResourceSnapshot {
  sessionId: string
  provider: AgentProvider
  scope: SessionResourceScope
  capturedAt: string
  message?: string
  totalCount?: number
  truncated?: boolean
}

export type SessionResourceSource =
  | 'project' | 'inherited' | 'user' | 'plugin' | 'builtin' | 'custom' | 'unknown'

export interface SessionSkillSummary {
  name: string
  description?: string
  commandName?: string
  argumentHint?: string
  source?: SessionResourceSource
  enabled?: boolean
  userInvocable?: boolean
  pluginName?: string
}

export interface SessionSkillsSnapshot extends SessionResourceSnapshot {
  skills: SessionSkillSummary[]
}

export interface ManagedSessionSkillsSnapshot extends SessionSkillsSnapshot {
  computerId: string
}

export type SessionMcpStatus =
  | 'connected' | 'failed' | 'needs-auth' | 'pending' | 'disabled'
  | 'stopped' | 'not_configured' | 'unknown'

export interface SessionMcpServerSummary {
  name: string
  status: SessionMcpStatus
  source?: SessionResourceSource
  transport?: 'stdio' | 'http' | 'sse' | 'memory'
  enabled?: boolean
  toolCount?: number
  pluginName?: string
}

export interface SessionMcpServersSnapshot extends SessionResourceSnapshot {
  servers: SessionMcpServerSummary[]
}

export interface ManagedSessionMcpServersSnapshot extends SessionMcpServersSnapshot {
  computerId: string
}

export type MessageRole = 'user' | 'assistant' | 'activity' | 'notice'
export type ActivityStatus = 'pending' | 'running' | 'completed' | 'failed'
export type ActivityKind = 'tool' | 'skill' | 'agent'

export interface TaskCompletionEvidence {
  source: 'root-task-complete'
  toolCallId: string
  completedAt: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  /** Positive provider handoff evidence; admission or a retained user row is not delivery. */
  deliveryConfirmed?: boolean
  /** Locally retained user echoes, unlike records read from the provider's transcript. */
  deliveryState?: 'pending' | 'refused' | 'uncertain'
  /** App-owned context/control input, not a prompt authored by the user. */
  appGenerated?: boolean
  streaming?: boolean
  activityStatus?: ActivityStatus
  activityKind?: ActivityKind
  activityGroupId?: string
  activityResult?: string
  activityDurationMs?: number
  taskCompletion?: TaskCompletionEvidence
}

export interface PermissionOption {
  optionId: string
  name: string
  kind: string
}

export interface PendingPermission {
  requestId: string
  title: string
  kind?: string
  choiceCount?: number
  options: PermissionOption[]
  stale?: boolean
}

export type UserInputFieldValue = string | number | boolean | string[]

export interface UserInputFieldOption {
  value: string
  label: string
}

export interface UserInputField {
  name: string
  title: string
  description?: string
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array'
  required: boolean
  default?: UserInputFieldValue
  options?: UserInputFieldOption[]
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  minItems?: number
  maxItems?: number
  format?: 'email' | 'uri' | 'date' | 'date-time'
}

export interface UserInputForm {
  fields: UserInputField[]
}

export interface PendingUserInput {
  requestId: string
  question: string
  choices: string[]
  allowFreeform: boolean
  multiSelect?: boolean
  form?: UserInputForm
  stale?: boolean
}

export type SessionRecoveryReason =
  | 'provider-error'
  | 'stale-sdk-interaction'
  | 'manual'

export interface SessionRecoveryInfo {
  recoveredAt: string
  archivedMessageCount: number
  contextMessageCount: number
  contextTruncated: boolean
  reason: SessionRecoveryReason
}

export interface SessionRestartRecovery {
  state: 'recovering' | 'waiting-permission' | 'interrupted' | 'failed'
  detectedAt: string
  message?: string
}

export interface QueuedPrompt {
  id: string
  content: string
  createdAt: string
  // A slash command reports what it printed rather than starting a turn, so
  // draining it has to follow the command path and not the prompt one.
  command?: boolean
  // A steer the busy terminal could not take yet. It is typed into the
  // running turn as soon as the composer is back, rather than after the turn.
  steer?: boolean
}

export interface QueuedPromptDispatch {
  attemptId: string
  promptId: string
  content: string
  command?: boolean
  startedAt: string
  state: 'dispatching' | 'uncertain'
  message?: string
  original?: QueuedPrompt
  originalIndex?: number
  recoveryFailedAt?: string
  prepared?: {
    status: SessionStatus
    activity?: string
    updatedAt: string
    revision: number
  }
}

export interface DispatchQueuedPromptInput {
  content: string
}

export interface QueuedPromptDispatchResult {
  promptId: string
  attemptId?: string
  outcome: 'sent' | 'refused' | 'uncertain'
  session?: SessionDetail
  message?: string
  /** True only after the original queue item has durably been released. */
  restored?: boolean
  /** An accepted delivery can still have an uncommitted queue disposition. */
  delivery?: 'accepted' | 'unknown'
}

export interface QueueState {
  state: 'waiting' | 'error'
  promptId: string
  message: string
  updatedAt: string
  retryAt?: string
}

export interface SessionRuntimeInfo {
  model?: string
  reasoningEffort?: string
  contextTier?: string
  contextTokens?: number
  contextTokenLimit?: number
  contextEstimated?: boolean
  mode?: string
  allowAllPermissions?: boolean
  updateAvailable?: string
}

export type BackgroundTaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
export type BackgroundTaskKind = 'agent' | 'shell'
export type BackgroundTaskExecutionMode = 'sync' | 'background'
export type BackgroundTaskAttachmentMode = 'attached' | 'detached'

export interface BackgroundTaskProgressLine {
  message: string
  timestamp: string
}

export interface BackgroundTaskProgress {
  type: BackgroundTaskKind
  recentActivity?: BackgroundTaskProgressLine[]
  latestIntent?: string
  recentOutput?: string
  pid?: number
}

export interface BackgroundTask {
  id: string
  type: BackgroundTaskKind
  description: string
  status: BackgroundTaskStatus
  startedAt: string
  completedAt?: string
  activeTimeMs?: number
  activeStartedAt?: string
  error?: string
  agentType?: string
  prompt?: string
  result?: string
  latestResponse?: string
  model?: string
  resolvedModel?: string
  executionMode?: BackgroundTaskExecutionMode
  command?: string
  attachmentMode?: BackgroundTaskAttachmentMode
  pid?: number
  progress?: BackgroundTaskProgress
  canCancel: boolean
}

export interface BackgroundTaskSnapshot {
  tasks: BackgroundTask[]
  runningCount: number
  supported: boolean
}

export interface RuntimeModelOption {
  id: string
  name: string
  description?: string
  reasoningEfforts: RuntimeReasoningEffort[]
  contextTiers: Array<'default' | 'long_context'>
  contextTokenLimits?: {
    default?: number
    long_context?: number
  }
}

export interface RuntimeOptions {
  current: SessionRuntimeInfo
  models: RuntimeModelOption[]
  status?: SessionStatus
}

export interface ProviderRuntimeOptions {
  models: RuntimeModelOption[]
}

export interface ConfigureRuntimeInput {
  model: string
  reasoningEffort?: RuntimeReasoningEffort
  contextTier: 'default' | 'long_context'
  mode?: AgentMode
}

export interface SessionRetention {
  pinned: boolean
  idleDays?: number
}

/**
 * A field-level retention edit. Omitted fields keep their current value and
 * `idleDays: null` disables archival, so concurrent edits of different fields
 * from separate devices never overwrite each other.
 */
export interface SessionRetentionPatch {
  pinned?: boolean
  idleDays?: number | null
}

/**
 * What a closed session was about, kept with it so it can be recognised and
 * reopened: worked out from its transcript when it closed, with no model call.
 */
export interface ClosedSessionContext {
  title: string
  cwd: string
  /** The last few prompts, oldest first, each on one line and bounded. */
  prompts: string[]
  /** An excerpt of the last reply, when there was one. */
  reply?: string
}

/**
 * Why a session was interrupted:
 * - `terminal-stopped`: its terminal was not running when the session was
 *   viewed or recovered.
 * - `restart`: the service restarted while the session was working, or while
 *   an SDK reply was in flight.
 * - `relaunch-failed`: starting its terminal again failed.
 * - `queue-held`: queued work waits for an explicit Reopen.
 * - `recovery-cancelled`: a recovered SDK turn was cancelled.
 */
export type SessionInterruptionCause =
  | 'terminal-stopped'
  | 'restart'
  | 'relaunch-failed'
  | 'queue-held'
  | 'recovery-cancelled'

export interface SessionInterruption {
  detectedAt: string
  previousStatus: SessionStatus
  /** Absent on interruptions recorded before causes were kept. */
  cause?: SessionInterruptionCause
  /** The error behind the cause, bounded; only a failed relaunch has one. */
  message?: string
}

export interface SessionSummary {
  id: string
  launchId?: string
  promptReceipts?: PromptAcceptanceReceipt[]
  /** Durable admission fence for acknowledged cancellation. */
  launchStopping?: boolean
  launchTermination?: TerminationAcknowledgement
  revision?: number
  provider?: AgentProvider
  executionMode?: SessionExecutionMode
  cwd: string
  title: string
  updatedAt: string
  status: SessionStatus
  isOpen?: boolean
  retention?: SessionRetention
  retentionLastUsedAt?: string
  interruption?: SessionInterruption
  archivedAt?: string
  /**
   * Closed through Agentic Remote: nothing runs for it, and it stays
   * reopenable until it is deleted for good once its retention ends.
   */
  closedAt?: string
  closedContext?: ClosedSessionContext
  queuedCount?: number
  queuedPrompts?: QueuedPrompt[]
  /** A claimed terminal queue head is still awaiting a safe delivery outcome. */
  terminalQueueDispatchPending?: boolean
  /**
   * An accepted recovery resend is still clearing its marker. The marker stays
   * hidden so it cannot be sent twice, but queued work waits until it clears.
   */
  recoveryAcknowledgementPending?: boolean
  queueState?: QueueState
  /** A durable dispatch intent. It must never be retried automatically. */
  queuedDispatch?: QueuedPromptDispatch
  /**
   * A prompt the queue accepted and then could not deliver.
   *
   * The browser cleared its draft the moment the queue took the prompt, and a
   * failure afterwards leaves the text nowhere else. Carried on the session so
   * it survives a disconnected socket and reaches the next snapshot, rather
   * than only being announced once to whoever happened to be listening.
   */
  failedPrompt?: {
    content: string
    /** Opaque recovery decision token; older records use an ISO timestamp. */
    failedAt: string
    /**
     * Set when the text may still be sitting in the terminal's prompt.
     *
     * A paste tmux accepted but that was never seen to arrive is not known to
     * have failed, so sending again can put a second copy beside the first.
     * Carried with the text so the warning survives a reload or a reconnect,
     * where a bare draft looks like anything else waiting to be sent.
     */
    uncertain?: boolean
  }
  activity?: string
  runtime?: SessionRuntimeInfo
  /**
   * The sessions this one replaced, oldest first, as its conversation was
   * cleared over and over.
   *
   * Clearing is announced as a removal and an arrival, which a client that is
   * asleep or offline never sees. Carrying the lineage in the session itself
   * means a client can still tell, from a snapshot alone, that what it is
   * holding for a session that is gone belongs to this one. It is the whole
   * ancestry rather than the last step because a client can miss several
   * clears in a row, and the ones in between are gone with them.
   */
  replacedSessionIds?: string[]
  recovery?: SessionRecoveryInfo
  /** Recovery of the durable part of an SDK session after its runtime stopped. */
  restartRecovery?: SessionRestartRecovery
  /** A recovery brief that still owns the session and must settle first. */
  recoverySeedState?: 'pending' | 'dispatching' | 'failed'
  /**
   * Whether the session is being kept without anything running for it.
   *
   * The conversation is on disk, so the process holding it is the expendable
   * part: a suspended session keeps its id, its history and its place in the
   * list, and gives back the memory and CPU until it is wanted again.
   */
  suspended?: boolean
}

export interface SessionDetail extends SessionSummary {
  messages: ChatMessage[]
  pendingPermission?: PendingPermission
  pendingUserInput?: PendingUserInput
}

export interface ComputerSummary {
  id: string
  name: string
  isLocal: boolean
  online: boolean
  baseUrl?: string
  /** Durable pairing lifetime; stable across reconnects and process restarts. */
  lifecycleGeneration?: string
  /** Opaque runtime registration lifetime; changes on a same-ID re-pair. */
  registrationId?: string
  providers?: AgentProviderCapability[]
  voice?: VoiceBackendCapability
}

export interface ManagedSession extends SessionDetail {
  computerId: string
  computerName: string
}

export interface ManagedRemovedQueuedPrompt {
  session: ManagedSession
  prompt: QueuedPrompt
}

export interface ManagedQueuedPromptDispatchResult
  extends Omit<QueuedPromptDispatchResult, 'session'> {
  session?: ManagedSession
}

export interface PushSettings {
  mutedSessions: string[]
}

export interface NodeInfo {
  id: string
  name: string
  version: string
  providers?: AgentProviderCapability[]
  voice?: VoiceBackendCapability
  hostTelemetry?: import('./host-telemetry.js').HostTelemetryCapability
}

export type VoiceBackendCapability =
  | {
      available: false
      reason: string
    }
  | {
      available: true
      sampleRate: 16_000
      playbackSampleRate: number
      languages: string[]
      sttProfile: string
      ttsVoice: string
      resourceClass: 'low' | 'quality'
    }

export type ServerEvent =
  | { type: 'session.upserted'; session: SessionDetail }
  | {
      type: 'session.removed'
      sessionId: string
      /**
       * Set when the session was replaced rather than deleted, as clearing a
       * conversation does. Without it a client cannot tell the two apart, and
       * discards state that should have moved to the replacement.
       */
      replacedBy?: string
      /** Set when the session was closed and stays reopenable, not deleted. */
      closed?: boolean
    }
  | {
      type: 'session.tasks.updated'
      sessionId: string
      tasks: BackgroundTask[]
      runningCount: number
      supported: boolean
    }
  | {
      type: 'error'
      sessionId?: string
      message: string
      /** Needs attention even with the app closed, so it is also notified. */
      notify?: boolean
      /**
       * A prompt the reader had already handed over and can no longer see. The
       * browser cleared its draft when the queue accepted it, so a send that
       * fails afterwards has to give the text back for the draft to be
       * restored.
       */
      failedPrompt?: string
      /** Identifies the same failure the session snapshot carries. */
      failedPromptAt?: string
    }

export type HubEvent =
  | ManagerEvent
  | NotificationsChanged
  | SchedulerChanged
  | {
      type: 'session.upserted'
      session: ManagedSession
      /**
       * A roster summary whose `messages` were never read, as a node resync
       * sends. Its metadata applies; the transcript already held is kept.
       */
      summary?: true
    }
  | {
      type: 'session.order.updated'
      order: SessionOrderSnapshot
    }
  | { type: 'settings.updated'; settings: SettingsProfileSnapshot }
  | {
      type: 'session.knowledge.updated'
      computerId: string
      sessionId: string
      binding: SessionKnowledgeBinding
    }
  | {
      type: 'session.removed'
      computerId: string
      sessionId: string
      /** See the node event above. */
      replacedBy?: string
      closed?: boolean
    }
  | {
      type: 'session.tasks.updated'
      computerId: string
      sessionId: string
      tasks: BackgroundTask[]
      runningCount: number
      supported: boolean
    }
  | { type: 'computer.updated'; computer: ComputerSummary }
  | { type: 'computer.removed'; computerId: string }
  | {
      type: 'error'
      computerId?: string
      sessionId?: string
      message: string
      /** See the node event above. */
      notify?: boolean
      /** See the node event above. */
      failedPrompt?: string
      /** See the node event above. */
      failedPromptAt?: string
    }

/**
 * What changed in a session's messages since the publication a socket was
 * last sent: the first `keep` messages it already holds, then `messages`.
 */
export interface SessionMessagesPatch {
  /** The publication this applies to. */
  from: number
  /** The publication this produces. */
  to: number
  keep: number
  /** How many messages the session has once applied. */
  count: number
  messages: ChatMessage[]
}

/**
 * The browser event stream. A socket opened with `?patches=1` is sent a
 * session it already holds as `session.patched`, and every whole session
 * with the `patchVersion` patches build on. Any other socket is sent whole
 * sessions only, exactly as before.
 */
export type HubWireEvent =
  | Exclude<HubEvent, { type: 'session.upserted' }>
  | { type: 'session.upserted'; session: ManagedSession; patchVersion?: number; summary?: true }
  | {
      type: 'session.patched'
      session: Omit<ManagedSession, 'messages'>
      patch: SessionMessagesPatch
    }

/** Sent by a socket whose patch did not apply, for the whole session again. */
export interface HubResyncRequest {
  type: 'session.resync'
  computerId: string
  sessionId: string
}

export interface CreateSessionInput {
  cwd: string
  launchId?: string
  provider?: AgentProvider
  terminalBacked?: boolean
  allowAllPermissions?: boolean
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
  contextTier?: 'default' | 'long_context'
  /** A session started without one is Interactive. */
  mode?: AgentMode
}

/** An earlier side question and its answer, carried by a follow-up. */
export interface SideQuestionExchange {
  question: string
  answer: string
}

export interface SideQuestionInput {
  question: string
  /** Earlier side answers in this thread, oldest first. */
  earlier?: SideQuestionExchange[]
}

export interface SideQuestionAnswer {
  answer: string
}

export interface SendMessageInput {
  content: string
  deliveryId?: string
  enqueue?: boolean
  /** Explicitly replace verified unsent text in a tmux composer before sending. */
  replaceTerminalDraft?: boolean
  /**
   * The failure this submission is the reader's answer to.
   *
   * Carries the `failedAt` of the prompt they were handed back, so an edited
   * or abandoned one can be let go of. Matching on the text alone held the
   * marker for good, and the marker stops the queue draining.
   */
  acknowledgesFailure?: string
}

export interface AudioTranscription {
  transcript: string
  durationSeconds: number
}

export interface SessionFileUpload {
  name: string
  path: string
  size: number
}

export interface RenameSessionInput {
  title: string
}

export interface RemovedQueuedPrompt {
  session: SessionDetail
  prompt: QueuedPrompt
}

export interface PermissionReplyInput {
  optionId: string
}

export interface UserInputReplyInput {
  answer: string
  wasFreeform: boolean
  answers?: string[]
  values?: Record<string, UserInputFieldValue>
  action?: 'accept' | 'decline' | 'cancel'
}

export interface AddComputerInput {
  baseUrl: string
  token: string
  name?: string
}

export interface SlashCommand {
  name: string
  aliases?: string[]
  description: string
  inputHint?: string
  inputRequired?: boolean
  allowDuringAgentExecution: boolean
}

export interface ExecuteCommandInput {
  command: string
  enqueue?: boolean
  /** See `SendMessageInput`. */
  replaceTerminalDraft?: boolean
  /** See `SendMessageInput`. */
  acknowledgesFailure?: string
}

export interface DirectoryListing {
  path: string
  parent?: string
  directories: Array<{
    name: string
    path: string
  }>
}

export type WorkspaceEntryKind =
  | 'directory'
  | 'markdown'
  | 'html'
  | 'pdf'
  | 'image'
  | 'file'

export interface WorkspaceEntry {
  name: string
  path: string
  kind: WorkspaceEntryKind
  size?: number
}

export interface WorkspaceListing {
  path: string
  parent?: string
  entries: WorkspaceEntry[]
}

export interface WorkspaceFile {
  name: string
  path: string
  kind: Exclude<WorkspaceEntryKind, 'directory'>
  mimeType: string
  size: number
  content?: string
  base64?: string
}

export interface WorkspaceSearchResult {
  name: string
  path: string
  kind: Exclude<WorkspaceEntryKind, 'directory'>
  line?: number
  snippet?: string
}

export interface WorkspaceSearchResponse {
  results: WorkspaceSearchResult[]
  truncated: boolean
}

/**
 * The custom session order the hub owns on behalf of every browser client
 * connected to it.
 *
 * Keys are the canonical `computerId:sessionId` form, grouped into one lane per
 * computer so a session id cannot collide across computers. `revision` is the
 * hub's ordering authority: clients apply a snapshot only when it is at least
 * as new as the one they already hold, which is what makes concurrent writes
 * from several devices converge instead of fighting.
 */
export interface SessionOrderSnapshot {
  revision: number
  /**
   * Whether a browser's pre-hub order has already been taken. Discovery
   * appends on its own, so a non-empty order does not mean a migration ran.
   */
  bootstrapped: boolean
  /** Shared visibility for sessions paused through Agentic Remote. */
  showSuspended: boolean
  /** Shared visibility for hidden sessions. A hub that predates it sends none: false. */
  showHidden?: boolean
  /**
   * Keys of the sessions left out of the Sessions list, in the same canonical
   * form as `order`. Hiding changes nothing about a session's runtime. A hub
   * that predates it sends none: nothing is hidden.
   */
  hidden?: string[]
  order: Record<string, string[]>
}

/** A folder on a computer that is browsable without any session existing. */
export interface KnowledgeRoot {
  id: string
  computerId: string
  computerName: string
  /** Absolute path on the owning computer. */
  path: string
  name: string
  createdAt: string
}

export interface AddKnowledgeRootInput {
  computerId: string
  path: string
  name?: string
}

export interface SessionKnowledgeBinding {
  /** The session's owning computer, which may differ from the root's. */
  computerId: string
  sessionId: string
  rootId: string | null
  /** Relative folder within the saved root that acts as this session's root. */
  rootPath?: string
  /**
   * Canonical absolute folder represented by the retained root snapshot.
   * Older hubs omit this additive field.
   */
  knowledgeBasePath?: string | null
  /** Zero means never linked; an explicit unlink retains a newer revision. */
  revision: number
  /** Retained metadata, including when the shared root has been removed. */
  root?: KnowledgeRoot
  /** Whether the shared catalog still contains this root, not its online status. */
  available: boolean
}

export interface UpdateSessionKnowledgeRootInput {
  rootId: string | null
  rootPath?: string
  expectedRevision: number
}

export interface UpdateSessionKnowledgeBasePathInput {
  knowledgeBasePath: string
  create?: boolean
  expectedRevision: number
}

export type SessionKnowledgeRootMutationInput =
  | UpdateSessionKnowledgeRootInput
  | UpdateSessionKnowledgeBasePathInput
