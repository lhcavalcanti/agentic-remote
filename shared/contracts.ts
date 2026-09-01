export type SessionStatus = 'idle' | 'running' | 'waiting' | 'error'
export type AgentMode = 'interactive' | 'plan' | 'autopilot'
export type AgentProvider = 'copilot' | 'claude'
export type SessionExecutionMode = 'tmux' | 'sdk'

export interface AgentProviderCapability {
  id: AgentProvider
  name: string
  available: boolean
  terminalBacked: boolean
  supportsTmuxMigration?: boolean
  unavailableReason?: string
}

export type MessageRole = 'user' | 'assistant' | 'activity' | 'notice'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  streaming?: boolean
  activityStatus?: 'running' | 'completed' | 'failed'
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
}

export interface QueuedPrompt {
  id: string
  content: string
  createdAt: string
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

export interface RuntimeModelOption {
  id: string
  name: string
  reasoningEfforts: string[]
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

export interface ConfigureRuntimeInput {
  model: string
  reasoningEffort: string
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
  activity?: string
  runtime?: SessionRuntimeInfo
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
  | { type: 'session.removed'; sessionId: string }
  | { type: 'error'; sessionId?: string; message: string }

export type HubEvent =
  | { type: 'session.upserted'; session: ManagedSession }
  | { type: 'session.removed'; computerId: string; sessionId: string }
  | { type: 'computer.updated'; computer: ComputerSummary }
  | { type: 'computer.removed'; computerId: string }
  | { type: 'error'; computerId?: string; sessionId?: string; message: string }

export interface CreateSessionInput {
  cwd: string
  provider?: AgentProvider
  terminalBacked?: boolean
  allowAllPermissions?: boolean
  model?: string
}

export interface SendMessageInput {
  content: string
  enqueue?: boolean
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

