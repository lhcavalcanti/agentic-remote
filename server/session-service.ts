import type { DirectoryScope } from './directory-browser.js'
import type {
  AgentProvider,
  AgentProviderCapability,
  BackgroundTaskSnapshot,
  DirectoryListing,
  ConfigureRuntimeInput,
  ProviderRuntimeOptions,
  RuntimeOptions,
  RuntimeReasoningEffort,
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
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
  ): Promise<SessionDetail>
  uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload>
  renameSession(id: string, title: string): Promise<SessionDetail>
  providerRuntimeOptions(provider: AgentProvider): Promise<ProviderRuntimeOptions>
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
  suspendSession(id: string): Promise<SessionDetail>
  resumeSession(id: string): Promise<SessionDetail>
  restartSession(id: string): Promise<SessionDetail>
  moveToTerminal(id: string): Promise<SessionDetail>
  removeQueuedPrompt(
    sessionId: string,
    promptId: string,
  ): Promise<RemovedQueuedPrompt>
  reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail>
  sendMessage(
    sessionId: string,
    content: string,
    enqueue?: boolean,
    acknowledgesFailure?: string,
  ): Promise<SessionDetail>
  listCommands(sessionId: string): Promise<SlashCommand[]>
  executeCommand(
    sessionId: string,
    command: string,
    enqueue?: boolean,
    acknowledgesFailure?: string,
  ): Promise<SessionDetail>
  cancel(sessionId: string): Promise<void>
  listBackgroundTasks(sessionId: string): Promise<BackgroundTaskSnapshot>
  cancelBackgroundTask(
    sessionId: string,
    taskId: string,
  ): Promise<BackgroundTaskSnapshot>
  deleteSession(sessionId: string): Promise<void>
  replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail>
  on(event: 'event', listener: (event: ServerEvent) => void): unknown
  off(event: 'event', listener: (event: ServerEvent) => void): unknown
  listDirectories(
    path?: string,
    scope?: DirectoryScope,
  ): Promise<DirectoryListing>
  validateSessionDirectory(inputPath: string): Promise<string>
  listKnowledge(root: string, path?: string): Promise<WorkspaceListing>
  readKnowledgeFile(root: string, path: string): Promise<WorkspaceFile>
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
