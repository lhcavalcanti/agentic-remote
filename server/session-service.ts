import type { ServerEvent, SessionDetail } from '../shared/contracts.js'

export interface SessionService {
  start(): Promise<void>
  stop(): Promise<void>
  listSessions(): SessionDetail[]
  getSession(id: string): SessionDetail | undefined
  openSession(id: string): Promise<SessionDetail>
  createSession(cwd: string): Promise<SessionDetail>
  sendMessage(sessionId: string, content: string): Promise<SessionDetail>
  cancel(sessionId: string): Promise<void>
  deleteSession(sessionId: string): Promise<void>
  replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail>
  on(event: 'event', listener: (event: ServerEvent) => void): unknown
  off(event: 'event', listener: (event: ServerEvent) => void): unknown
}
