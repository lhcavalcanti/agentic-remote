export type SessionStatus = 'idle' | 'running' | 'waiting' | 'error'

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

export interface PendingUserInput {
  requestId: string
  question: string
  choices: string[]
  allowFreeform: boolean
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
}

export interface RuntimeModelOption {
  id: string
  name: string
  reasoningEfforts: string[]
  contextTiers: Array<'default' | 'long_context'>
}

export interface RuntimeOptions {
  current: SessionRuntimeInfo
  models: RuntimeModelOption[]
}

export interface ConfigureRuntimeInput {
  model: string
  reasoningEffort: string
  contextTier: 'default' | 'long_context'
}

export interface SessionSummary {
  id: string
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
  terminalBacked?: boolean
  allowAllPermissions?: boolean
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
