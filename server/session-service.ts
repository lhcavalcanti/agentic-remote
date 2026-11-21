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
  SessionRetentionPatch,
  SessionSkillsSnapshot,
  SessionMcpServersSnapshot,
  SlashCommand,
  SideQuestionExchange,
} from '../shared/contracts.js'
import type { SessionKnowledgeBaseLocation } from './session-directory.js'
import type { StartupPhases } from './startup-phases.js'
import type { LaunchReconciliation, TerminationAcknowledgement } from '../shared/launch-identity.js'
import type { SessionPaneRoot } from './host-telemetry/session-pane-roots.js'

export interface SessionService {
  providers(): AgentProviderCapability[]
  /** Starts the provider, labelling its awaited startup phases on `phases`. */
  start(phases?: StartupPhases): Promise<void>
  stop(): Promise<void>
  /** Read-only ownership observations; must not start providers. */
  listSessionPaneRoots?(): Promise<SessionPaneRoot[]>
  listSessions(): SessionDetail[]
  listHistory(): SessionDetail[]
  /** Sessions closed through the app that can still be reopened. */
  listClosedSessions?(): SessionDetail[]
  getSession(id: string): SessionDetail | undefined
  /** Whether this provider owns a session, answered without copying it. */
  hasSession?(id: string): boolean
  openSession(id: string): Promise<SessionDetail>
  activateSession(id: string): Promise<SessionDetail>
  configureRetention?(id: string, input: SessionRetentionPatch): Promise<SessionDetail>
  createSession(
    cwd: string,
    terminalBacked?: boolean,
    allowAllPermissions?: boolean,
    provider?: AgentProvider,
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
    mode?: AgentMode,
    launchId?: string,
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
  sendMessage(
    sessionId: string,
    content: string,
    enqueue?: boolean,
    acknowledgesFailure?: string,
    replaceTerminalDraft?: boolean,
    deliveryId?: string,
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
  /** Durable authority, including deleted sessions and pruned receipt details. */
  deliveryIdentity?(deliveryId: string): { sessionId?: string; historyComplete: boolean }
  reconcileLaunch?(launchId: string): Promise<LaunchReconciliation | undefined>
  cancelWithAck?(sessionId: string, timeoutMs?: number): Promise<TerminationAcknowledgement>
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
  /** Stops a session but keeps it, with its provider data, to reopen. */
  closeSession?(sessionId: string): Promise<SessionDetail>
  /** Deletes a session still closed at or before `closedBefore`; false when it is not. */
  deleteExpiredClosedSession?(sessionId: string, closedBefore: number): Promise<boolean>
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
  validateKnowledgeRoot(
    inputPath: string,
    confinementPath?: string,
  ): Promise<string>
  ensureSessionKnowledgeBase(
    sessionId: string,
    relativePath: string,
    create: boolean,
  ): Promise<SessionKnowledgeBaseLocation>
  listKnowledge(
    root: string,
    path?: string,
    confinementPath?: string,
  ): Promise<WorkspaceListing>
  readKnowledgeFile(
    root: string,
    path: string,
    confinementPath?: string,
  ): Promise<WorkspaceFile>
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
