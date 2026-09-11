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

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  streaming?: boolean
  activityStatus?: ActivityStatus
  activityKind?: ActivityKind
  activityGroupId?: string
  activityResult?: string
  activityDurationMs?: number
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

export interface QueuedPrompt {
  id: string
  content: string
  createdAt: string
  // A slash command reports what it printed rather than starting a turn, so
  // draining it has to follow the command path and not the prompt one.
  command?: boolean
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

export interface SessionSummary {
  id: string
  revision?: number
  provider?: AgentProvider
  executionMode?: SessionExecutionMode
  cwd: string
  title: string
  updatedAt: string
  status: SessionStatus
  isOpen?: boolean
  queuedCount?: number
  queuedPrompts?: QueuedPrompt[]
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
  /** Opaque runtime registration lifetime; changes on a same-ID re-pair. */
  registrationId?: string
  providers?: AgentProviderCapability[]
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
  | { type: 'session.upserted'; session: ManagedSession }
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
      failedPrompt?: string
      /** See the node event above. */
      failedPromptAt?: string
    }

export interface CreateSessionInput {
  cwd: string
  provider?: AgentProvider
  terminalBacked?: boolean
  allowAllPermissions?: boolean
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
  contextTier?: 'default' | 'long_context'
}

export interface SendMessageInput {
  content: string
  enqueue?: boolean
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
