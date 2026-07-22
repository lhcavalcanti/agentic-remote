export type SessionStatus = 'idle' | 'running' | 'waiting' | 'error'

export type MessageRole = 'user' | 'assistant' | 'activity'

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
  options: PermissionOption[]
}

export interface SessionSummary {
  id: string
  cwd: string
  title: string
  updatedAt: string
  status: SessionStatus
  isOpen?: boolean
  activity?: string
}

export interface SessionDetail extends SessionSummary {
  messages: ChatMessage[]
  pendingPermission?: PendingPermission
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
}

export interface SendMessageInput {
  content: string
}

export interface PermissionReplyInput {
  optionId: string
}

export interface AddComputerInput {
  baseUrl: string
  token: string
  name?: string
}
