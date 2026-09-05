import type { DirectoryScope } from './directory-browser.js'
import { EventEmitter } from 'node:events'
import type {
  AgentProvider,
  AgentProviderCapability,
  BackgroundTaskSnapshot,
  ConfigureRuntimeInput,
  DirectoryListing,
  ProviderRuntimeOptions,
  RuntimeReasoningEffort,
  RemovedQueuedPrompt,
  QueuedPromptDispatchResult,
  RuntimeOptions,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SlashCommand,
  UserInputReplyInput,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import type { SessionService } from './session-service.js'

interface ProviderSessionServiceEvents {
  event: [event: ServerEvent]
}

export class ProviderSessionService
  extends EventEmitter<ProviderSessionServiceEvents>
  implements SessionService
{
  constructor(
    private readonly copilot: SessionService,
    private readonly claude: SessionService,
  ) {
    super()
    this.copilot.on('event', (event) => this.emit('event', event))
    this.claude.on('event', (event) => this.emit('event', event))
  }

  providers(): AgentProviderCapability[] {
    return [...this.copilot.providers(), ...this.claude.providers()]
  }

  async start(): Promise<void> {
    await this.copilot.start()
    try {
      await this.claude.start()
    } catch (error) {
      await this.copilot.stop()
      throw error
    }
  }

  async stop(): Promise<void> {
    const results = await Promise.allSettled([
      this.claude.stop(),
      this.copilot.stop(),
    ])
    const errors = results.flatMap((result) =>
      result.status === 'rejected'
        ? [result.reason instanceof Error ? result.reason : new Error(String(result.reason))]
        : [],
    )
    if (errors.length > 0) {
      throw new AggregateError(errors, 'Agent providers did not stop cleanly')
    }
  }

  listSessions(): SessionDetail[] {
    return this.sorted([
      ...this.copilot.listSessions(),
      ...this.claude.listSessions(),
    ])
  }

  listHistory(): SessionDetail[] {
    return this.sorted([
      ...this.copilot.listHistory(),
      ...this.claude.listHistory(),
    ])
  }

  getSession(id: string): SessionDetail | undefined {
    return this.copilot.getSession(id) || this.claude.getSession(id)
  }

  openSession(id: string): Promise<SessionDetail> {
    return this.serviceFor(id).openSession(id)
  }

  activateSession(id: string): Promise<SessionDetail> {
    return this.serviceFor(id).activateSession(id)
  }

  createSession(
    cwd: string,
    terminalBacked = true,
    allowAllPermissions = true,
    provider: AgentProvider = 'copilot',
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
  ): Promise<SessionDetail> {
    const service = provider === 'claude' ? this.claude : this.copilot
    return service.createSession(
      cwd,
      terminalBacked,
      allowAllPermissions,
      provider,
      model,
      reasoningEffort,
      contextTier,
    )
  }

  uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    return this.serviceFor(sessionId).uploadFile(sessionId, filename, data)
  }

  renameSession(id: string, title: string): Promise<SessionDetail> {
    return this.serviceFor(id).renameSession(id, title)
  }

  providerRuntimeOptions(
    provider: AgentProvider,
  ): Promise<ProviderRuntimeOptions> {
    const service = provider === 'claude' ? this.claude : this.copilot
    return service.providerRuntimeOptions(provider)
  }

  runtimeOptions(id: string): Promise<RuntimeOptions> {
    return this.serviceFor(id).runtimeOptions(id)
  }

  configureRuntime(
    id: string,
    input: ConfigureRuntimeInput,
  ): Promise<SessionDetail> {
    return this.serviceFor(id).configureRuntime(id, input)
  }

  replyUserInput(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    return this.serviceFor(sessionId).replyUserInput(
      sessionId,
      requestId,
      input,
    )
  }

  clearConversation(id: string): Promise<SessionDetail> {
    return this.serviceFor(id).clearConversation(id)
  }

  suspendSession(id: string): Promise<SessionDetail> {
    return this.serviceFor(id).suspendSession(id)
  }

  resumeSession(id: string): Promise<SessionDetail> {
    return this.serviceFor(id).resumeSession(id)
  }

  restartSession(id: string): Promise<SessionDetail> {
    return this.serviceFor(id).restartSession(id)
  }

  moveToTerminal(id: string): Promise<SessionDetail> {
    return this.serviceFor(id).moveToTerminal(id)
  }

  removeQueuedPrompt(
    sessionId: string,
    promptId: string,
    acknowledgesDispatch?: string,
  ): Promise<RemovedQueuedPrompt> {
    return this.serviceFor(sessionId).removeQueuedPrompt(sessionId, promptId, acknowledgesDispatch)
  }

  dispatchQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<QueuedPromptDispatchResult> {
    const service = this.serviceFor(sessionId)
    const provider = service.getSession(sessionId)?.provider || 'copilot'
    if (!service.dispatchQueuedPrompt || !service.providers().some((capability) =>
      capability.id === provider && capability.supportsQueuedPromptDispatch === true)) {
      throw Object.assign(new Error('Update the owning runtime to dispatch queued edits.'), { statusCode: 409 })
    }
    return service.dispatchQueuedPrompt(sessionId, promptId, content)
  }

  updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<RemovedQueuedPrompt> {
    return this.serviceFor(sessionId).updateQueuedPrompt(
      sessionId,
      promptId,
      content,
    )
  }

  reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail> {
    return this.serviceFor(sessionId).reorderQueuedPrompts(sessionId, order)
  }

  sendMessage(
    sessionId: string,
    content: string,
    enqueue?: boolean,
    acknowledgesFailure?: string,
  ): Promise<SessionDetail> {
    return this.serviceFor(sessionId).sendMessage(
      sessionId,
      content,
      enqueue,
      acknowledgesFailure,
    )
  }

  listCommands(sessionId: string): Promise<SlashCommand[]> {
    return this.serviceFor(sessionId).listCommands(sessionId)
  }

  executeCommand(
    sessionId: string,
    command: string,
    enqueue?: boolean,
    acknowledgesFailure?: string,
  ): Promise<SessionDetail> {
    return this.serviceFor(sessionId).executeCommand(
      sessionId,
      command,
      enqueue,
      acknowledgesFailure,
    )
  }

  cancel(sessionId: string): Promise<void> {
    return this.serviceFor(sessionId).cancel(sessionId)
  }

  listBackgroundTasks(sessionId: string): Promise<BackgroundTaskSnapshot> {
    return this.serviceFor(sessionId).listBackgroundTasks(sessionId)
  }

  cancelBackgroundTask(
    sessionId: string,
    taskId: string,
  ): Promise<BackgroundTaskSnapshot> {
    return this.serviceFor(sessionId).cancelBackgroundTask(sessionId, taskId)
  }

  deleteSession(sessionId: string): Promise<void> {
    return this.serviceFor(sessionId).deleteSession(sessionId)
  }

  replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail> {
    return this.serviceFor(sessionId).replyPermission(
      sessionId,
      requestId,
      optionId,
    )
  }

  listDirectories(
    path?: string,
    scope?: DirectoryScope,
  ): Promise<DirectoryListing> {
    return this.copilot.listDirectories(path, scope)
  }

  validateSessionDirectory(inputPath: string): Promise<string> {
    return this.copilot.validateSessionDirectory(inputPath)
  }

  listKnowledge(root: string, path?: string): Promise<WorkspaceListing> {
    return this.copilot.listKnowledge(root, path)
  }

  readKnowledgeFile(root: string, path: string): Promise<WorkspaceFile> {
    return this.copilot.readKnowledgeFile(root, path)
  }

  listWorkspace(
    sessionId: string,
    path?: string,
  ): Promise<WorkspaceListing> {
    return this.serviceFor(sessionId).listWorkspace(sessionId, path)
  }

  readWorkspaceFile(
    sessionId: string,
    path: string,
  ): Promise<WorkspaceFile> {
    return this.serviceFor(sessionId).readWorkspaceFile(sessionId, path)
  }

  searchWorkspace(
    sessionId: string,
    query: string,
    path?: string,
  ): Promise<WorkspaceSearchResponse> {
    return this.serviceFor(sessionId).searchWorkspace(sessionId, query, path)
  }

  private serviceFor(sessionId: string): SessionService {
    if (this.copilot.getSession(sessionId)) {
      return this.copilot
    }
    if (this.claude.getSession(sessionId)) {
      return this.claude
    }
    throw new Error('Session not found')
  }

  private sorted(sessions: SessionDetail[]): SessionDetail[] {
    return sessions.sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    )
  }
}
