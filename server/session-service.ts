import type {
  DirectoryListing,
  RemovedQueuedPrompt,
  ServerEvent,
  SessionDetail,
  SlashCommand,
} from '../shared/contracts.js'

export interface SessionService {
  start(): Promise<void>
  stop(): Promise<void>
  listSessions(): SessionDetail[]
  listHistory(): SessionDetail[]
  getSession(id: string): SessionDetail | undefined
  openSession(id: string): Promise<SessionDetail>
  activateSession(id: string): Promise<SessionDetail>
  createSession(cwd: string, terminalBacked?: boolean): Promise<SessionDetail>
  renameSession(id: string, title: string): Promise<SessionDetail>
  removeQueuedPrompt(
    sessionId: string,
    promptId: string,
  ): Promise<RemovedQueuedPrompt>
  sendMessage(
    sessionId: string,
    content: string,
    enqueue?: boolean,
  ): Promise<SessionDetail>
  listCommands(sessionId: string): Promise<SlashCommand[]>
  executeCommand(
    sessionId: string,
    command: string,
    enqueue?: boolean,
  ): Promise<SessionDetail>
  cancel(sessionId: string): Promise<void>
  deleteSession(sessionId: string): Promise<void>
  replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail>
  on(event: 'event', listener: (event: ServerEvent) => void): unknown
  off(event: 'event', listener: (event: ServerEvent) => void): unknown
  listDirectories(path?: string): Promise<DirectoryListing>
}
