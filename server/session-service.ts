import type {
  AgentProvider,
  AgentProviderCapability,
  DirectoryListing,
  ConfigureRuntimeInput,
  RuntimeOptions,
  SessionFileUpload,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
  UserInputReplyInput,
  RemovedQueuedPrompt,
  ServerEvent,
  SessionDetail,
  SlashCommand,
} from '../shared/contracts.js'

export interface SessionService {
  providers(): AgentProviderCapability[]
  start(): Promise<void>
  stop(): Promise<void>
  listSessions(): SessionDetail[]
  listHistory(): SessionDetail[]
  getSession(id: string): SessionDetail | undefined
  openSession(id: string): Promise<SessionDetail>
  activateSession(id: string): Promise<SessionDetail>
  createSession(
    cwd: string,
    terminalBacked?: boolean,
    allowAllPermissions?: boolean,
    provider?: AgentProvider,
  ): Promise<SessionDetail>
  uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload>
  renameSession(id: string, title: string): Promise<SessionDetail>
  runtimeOptions(id: string): Promise<RuntimeOptions>
  configureRuntime(
    id: string,
    input: ConfigureRuntimeInput,
  ): Promise<SessionDetail>
  replyUserInput(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail>
  clearConversation(id: string): Promise<SessionDetail>
  restartSession(id: string): Promise<SessionDetail>
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
  listWorkspace(
    sessionId: string,
    path?: string,
  ): Promise<WorkspaceListing>
  readWorkspaceFile(
    sessionId: string,
    path: string,
  ): Promise<WorkspaceFile>
  searchWorkspace(
    sessionId: string,
    query: string,
    path?: string,
  ): Promise<WorkspaceSearchResponse>
}
