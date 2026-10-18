import type { DirectoryScope } from './directory-browser.js'
import type {
  AgentMode,
  AgentProvider,
  AgentProviderCapability,
  BackgroundTaskSnapshot,
  DirectoryListing,
  ConfigureRuntimeInput,
  ProviderRuntimeOptions,
  RuntimeOptions,
  RuntimeReasoningEffort,
  SessionRecoveryReason,
  SessionFileUpload,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
  UserInputReplyInput,
  RemovedQueuedPrompt,
  QueuedPromptDispatchResult,
  ServerEvent,
  SessionDetail,
  SessionSkillsSnapshot,
  SessionMcpServersSnapshot,
  SlashCommand,
  SideQuestionExchange,
  QueuedBatch,
} from '../shared/contracts.js'
import type { QueueBatchInput } from '../shared/queue-batch.js'
import type { StartupPhases } from './startup-phases.js'

export interface SessionService {
  providers(): AgentProviderCapability[]
  /** Starts the provider, labelling its awaited startup phases on `phases`. */
  start(phases?: StartupPhases): Promise<void>
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
    mode?: AgentMode,
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
  recoverConversation(id: string, reason: SessionRecoveryReason): Promise<SessionDetail>
  suspendSession(id: string): Promise<SessionDetail>
  resumeSession(id: string): Promise<SessionDetail>
  restartSession(id: string): Promise<SessionDetail>
  moveToTerminal(id: string): Promise<SessionDetail>
  removeQueuedPrompt(
    sessionId: string,
    promptId: string,
    acknowledgesDispatch?: string,
  ): Promise<RemovedQueuedPrompt>
  updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<RemovedQueuedPrompt>
  reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail>
  dispatchQueuedPrompt?(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<QueuedPromptDispatchResult>
  /** Queues several prompts in one admission; see docs/design/queue-batch.md. */
  queueBatch?(sessionId: string, input: QueueBatchInput): Promise<QueuedBatch>
  sendMessage(
    sessionId: string,
    content: string,
    enqueue?: boolean,
    acknowledgesFailure?: string,
    replaceTerminalDraft?: boolean,
  ): Promise<SessionDetail>
  listCommands(sessionId: string): Promise<SlashCommand[]>
  /** Resource readers must settle and release their own work on cancellation. */
  listSkills?(sessionId: string, signal?: AbortSignal): Promise<SessionSkillsSnapshot>
  listMcpServers?(sessionId: string, signal?: AbortSignal): Promise<SessionMcpServersSnapshot>
  executeCommand(
    sessionId: string,
    command: string,
    enqueue?: boolean,
    acknowledgesFailure?: string,
    replaceTerminalDraft?: boolean,
  ): Promise<SessionDetail>
  cancel(sessionId: string): Promise<void>
  /** Answers a side question from the conversation without prompting it. */
  askSession?(
    sessionId: string,
    question: string,
    earlier?: readonly SideQuestionExchange[],
  ): Promise<string>
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
