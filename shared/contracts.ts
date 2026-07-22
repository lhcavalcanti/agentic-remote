export type SessionStatus = 'idle' | 'running' | 'waiting' | 'error'

export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  streaming?: boolean
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
  activity?: string
}

export interface SessionDetail extends SessionSummary {
  messages: ChatMessage[]
  pendingPermission?: PendingPermission
}

export type ServerEvent =
  | { type: 'session.upserted'; session: SessionDetail }
  | { type: 'session.removed'; sessionId: string }
  | { type: 'error'; sessionId?: string; message: string }

export interface CreateSessionInput {
  cwd: string
}

export interface SendMessageInput {
  content: string
}

export interface PermissionReplyInput {
  optionId: string
}
