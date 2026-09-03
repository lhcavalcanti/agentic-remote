import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import {
  deleteSession as deleteClaudeSession,
  getSessionInfo as getClaudeSessionInfo,
  query,
  renameSession as renameClaudeSession,
  type EffortLevel,
  type ModelInfo,
  type PermissionResult,
  type Query,
  type SDKMessage,
} from '@anthropic-ai/claude-agent-sdk'
import type {
  AgentProvider,
  AgentProviderCapability,
  BackgroundTaskSnapshot,
  ConfigureRuntimeInput,
  PendingUserInput,
  ProviderRuntimeOptions,
  RemovedQueuedPrompt,
  RuntimeModelOption,
  RuntimeOptions,
  RuntimeReasoningEffort,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SlashCommand,
  UserInputReplyInput,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import { listHomeDirectories,
  type DirectoryScope,
} from './directory-browser.js'
import {
  validateKnowledgeRoot,
  validateSessionDirectory,
} from './session-directory.js'
import type { SessionService } from './session-service.js'
import { SessionStore } from './session-store.js'
import {
  listWorkspace,
  readWorkspaceFile,
  searchWorkspace,
} from './workspace-browser.js'

const execFileAsync = promisify(execFile)

function isMissingClaudeSessionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes('session') &&
    (error.message.toLowerCase().includes('not found') ||
      error.message.toLowerCase().includes('no conversation'))
  )
}

function isClaudeAuthenticationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  const message = error.message.toLowerCase()
  return (
    message.includes('authentication') ||
    message.includes('oauth') ||
    message.includes('not logged in') ||
    message.includes('unauthorized')
  )
}

function toolResultText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  if (Array.isArray(value)) {
    const text = value
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry
        }
        if (entry && typeof entry === 'object') {
          const block = entry as Record<string, unknown>
          return typeof block.text === 'string' ? block.text : ''
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')
      .trim()
    return text || undefined
  }
  if (value && typeof value === 'object') {
    const text = Reflect.get(value, 'text')
    return typeof text === 'string' && text.trim() ? text.trim() : undefined
  }
  return undefined
}

export interface ClaudeSdk {
  query: typeof query
  deleteSession: typeof deleteClaudeSession
  getSessionInfo: typeof getClaudeSessionInfo
  renameSession: typeof renameClaudeSession
}

type AuthStatusRunner = (
  executable: string,
) => Promise<{ loggedIn: boolean }>

interface ClaudeAgentServiceEvents {
  event: [event: ServerEvent]
}

interface ActiveClaudeQuery {
  abortController: AbortController
  query: Query
}

interface PendingClaudePermission {
  sessionId: string
  input: Record<string, unknown>
  resolve: (result: PermissionResult) => void
}

interface ClaudeQuestion {
  question: string
  options: string[]
  multiSelect: boolean
}

interface PendingClaudeInput {
  sessionId: string
  requestId: string
  input: Record<string, unknown>
  questions: ClaudeQuestion[]
  index: number
  answers: Record<string, string>
  resolve: (result: PermissionResult) => void
}

export class ClaudeAgentService
  extends EventEmitter<ClaudeAgentServiceEvents>
  implements SessionService
{
  private available = false
  private unavailableReason = 'Claude Agent is not initialized'
  private models: RuntimeModelOption[] = []
  /** Sessions being put down, which nothing may start a query into. */
  private readonly suspendingSessions = new Set<string>()
  private readonly dispatchingSessions = new Map<string, number>()
  // Not open for new work yet: resuming clears the suspended flag before the
  // queue has been claimed, and that flag is what reopens sending.
  private readonly admissionClosed = new Set<string>()
  private readonly lifecycleLocks = new Map<string, Promise<unknown>>()

  /** Runs lifecycle work for a session one at a time, in arrival order. */
  private serializeLifecycle<T>(
    sessionId: string,
    run: () => Promise<T>,
  ): Promise<T> {
    const previous = this.lifecycleLocks.get(sessionId) ?? Promise.resolve()
    const next = previous.catch(() => undefined).then(run)
    // Only that it finished, never what it produced.
    const settled = next.then(
      () => undefined,
      () => undefined,
    )
    this.lifecycleLocks.set(sessionId, settled)
    void settled.then(() => {
      if (this.lifecycleLocks.get(sessionId) === settled) {
        this.lifecycleLocks.delete(sessionId)
      }
    })
    return next
  }

  /** Marks a session as having a prompt on its way, and gives back the undo. */
  private holdDispatch(sessionId: string): () => void {
    this.dispatchingSessions.set(
      sessionId,
      (this.dispatchingSessions.get(sessionId) || 0) + 1,
    )
    let released = false
    return () => {
      if (released) {
        return
      }
      released = true
      const held = (this.dispatchingSessions.get(sessionId) || 1) - 1
      if (held > 0) {
        this.dispatchingSessions.set(sessionId, held)
      } else {
        this.dispatchingSessions.delete(sessionId)
      }
    }
  }

  private readonly active = new Map<string, ActiveClaudeQuery>()
  private readonly permissions = new Map<string, PendingClaudePermission>()
  private readonly userInputs = new Map<string, PendingClaudeInput>()

  constructor(
    readonly store: SessionStore,
    private readonly executable =
      process.env.CLAUDE_BIN?.trim() ||
      path.join(process.env.HOME || '', '.local', 'bin', 'claude'),
    private readonly sdk: ClaudeSdk = {
      query,
      deleteSession: deleteClaudeSession,
      getSessionInfo: getClaudeSessionInfo,
      renameSession: renameClaudeSession,
    },
    private readonly authStatus: AuthStatusRunner = async (executable) => {
      const { stdout } = await execFileAsync(executable, ['auth', 'status'], {
        timeout: 10_000,
      })
      return JSON.parse(stdout) as { loggedIn: boolean }
    },
  ) {
    super()
  }

  providers(): AgentProviderCapability[] {
    return [
      {
        id: 'claude',
        name: 'Claude Agent',
        available: this.available,
        terminalBacked: false,
        supportsTmuxMigration: false,
        supportsBackgroundTasks: false,
        unavailableReason: this.available ? undefined : this.unavailableReason,
      },
    ]
  }

  async start(): Promise<void> {
    await this.store.initialize()
    await this.detectAvailability()
    if (this.available) {
      await Promise.all(
        this.store
          .list()
          .filter(
            (session) =>
              session.status === 'idle' &&
              // A suspended session has nothing to send to. Draining it would
              // take the prompt off the queue and then refuse it, losing the
              // work and failing the provider's own startup.
              !session.suspended &&
              session.queuedPrompts?.length,
          )
          .map((session) => this.drainQueue(session.id)),
      )
    }
  }

  async stop(): Promise<void> {
    for (const active of this.active.values()) {
      active.abortController.abort()
    }
    this.active.clear()
    for (const permission of this.permissions.values()) {
      permission.resolve({
        behavior: 'deny',
        message: 'Agentic Remote is shutting down',
      })
    }
    this.permissions.clear()
    for (const input of this.userInputs.values()) {
      input.resolve({
        behavior: 'deny',
        message: 'Agentic Remote is shutting down',
      })
    }
    this.userInputs.clear()
  }

  listSessions(): SessionDetail[] {
    return this.store
      .list()
      .filter((session) => session.isOpen)
      .map((session) => ({ ...session, messages: [] }))
  }

  listHistory(): SessionDetail[] {
    return this.store.list().map((session) => ({ ...session, messages: [] }))
  }

  getSession(id: string): SessionDetail | undefined {
    return this.store.get(id)
  }

  async openSession(id: string): Promise<SessionDetail> {
    return this.requireSession(id)
  }

  async activateSession(id: string): Promise<SessionDetail> {
    const opened = await this.store.setOpen(id, true, true)
    this.publish(opened)
    return opened
  }

  async createSession(
    inputPath: string,
    _terminalBacked = false,
    allowAllPermissions = true,
    provider: AgentProvider = 'claude',
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
  ): Promise<SessionDetail> {
    if (provider !== 'claude') {
      throw new Error(`Provider ${provider} is not handled by Claude Agent`)
    }
    this.requireAvailable()
    const cwd = await this.validateDirectory(inputPath)
    const id = randomUUID()
    const now = new Date().toISOString()
    const modelId = model?.trim()
    const defaultModel = modelId
      ? this.models.find((candidate) => candidate.id === modelId)
      : undefined
    if (modelId && !defaultModel) {
      throw new Error('Selected Claude model is not available')
    }
    const effort =
      reasoningEffort ||
      (defaultModel?.reasoningEfforts.includes('high') === true
        ? 'high'
        : defaultModel?.reasoningEfforts[0])
    const tier = contextTier || 'default'
    if (
      defaultModel &&
      effort &&
      !defaultModel.reasoningEfforts.includes(effort)
    ) {
      throw new Error('Selected reasoning effort is not supported by this model')
    }
    if (defaultModel && !defaultModel.contextTiers.includes(tier)) {
      throw new Error('Selected context tier is not supported by this model')
    }
    const session = await this.store.create(
      {
        id,
        provider: 'claude',
        cwd,
        title: path.basename(cwd) || 'New Claude session',
        updatedAt: now,
        status: 'idle',
        isOpen: true,
        messages: [],
        runtime: {
          allowAllPermissions,
          ...(defaultModel ? { model: defaultModel.id } : {}),
          ...(effort ? { reasoningEffort: effort } : {}),
          contextTier: tier,
          mode: 'interactive',
        },
      },
      { managedOpen: true, backend: 'sdk' },
    )
    this.publish(session)
    return session
  }

  uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    return this.store.saveUpload(sessionId, filename, data)
  }

  async renameSession(id: string, title: string): Promise<SessionDetail> {
    const session = this.requireSession(id)
    try {
      await this.sdk.renameSession(id, title, { dir: session.cwd })
    } catch (error) {
      if (!isMissingClaudeSessionError(error)) {
        throw error
      }
    }
    const renamed = await this.store.renameSession(id, title)
    this.publish(renamed)
    return renamed
  }

  async runtimeOptions(id: string): Promise<RuntimeOptions> {
    const session = this.requireSession(id)
    const options = await this.providerRuntimeOptions('claude')
    return {
      current: session.runtime || {},
      models: options.models,
      status: session.status,
    }
  }

  async providerRuntimeOptions(
    provider: AgentProvider,
  ): Promise<ProviderRuntimeOptions> {
    if (provider !== 'claude') {
      throw new Error(`Provider ${provider} is not handled by Claude Agent`)
    }
    if (!this.available) {
      await this.detectAvailability()
      this.requireAvailable()
      return { models: this.models }
    }
    this.models = await this.loadModels()
    return { models: this.models }
  }

  async configureRuntime(
    id: string,
    input: ConfigureRuntimeInput,
  ): Promise<SessionDetail> {
    const session = this.requireSession(id)
    if (session.status !== 'idle') {
      throw new Error('Runtime settings can only change while the session is idle')
    }
    await this.providerRuntimeOptions('claude')
    const model = this.models.find((candidate) => candidate.id === input.model)
    if (!model) {
      throw new Error('Selected Claude model is not available')
    }
    if (
      input.reasoningEffort &&
      !model.reasoningEfforts.includes(input.reasoningEffort)
    ) {
      throw new Error('Selected reasoning effort is not supported by this model')
    }
    if (input.contextTier !== 'default') {
      throw new Error('Claude Agent manages its context window automatically')
    }
    const updated = await this.store.update(id, (stored) => {
      stored.runtime = {
        ...stored.runtime,
        model: input.model,
        reasoningEffort: input.reasoningEffort,
        contextTier: 'default',
        mode: input.mode || 'interactive',
      }
    })
    this.publish(updated)
    return updated
  }

  async replyUserInput(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    const pending = this.userInputs.get(requestId)
    if (!pending || pending.sessionId !== sessionId) {
      throw new Error('User input request is no longer pending')
    }
    const question = pending.questions[pending.index]
    if (!question) {
      throw new Error('User input request is invalid')
    }
    pending.answers[question.question] = this.resolveAnswer(question, input)
    this.userInputs.delete(requestId)
    pending.index += 1
    if (pending.index < pending.questions.length) {
      pending.requestId = `claude-input:${randomUUID()}`
      this.userInputs.set(pending.requestId, pending)
      const updated = await this.store.update(sessionId, (session) => {
        session.pendingUserInput = this.pendingInput(pending)
        session.status = 'waiting'
        session.activity = session.pendingUserInput.question
      })
      this.publish(updated)
      return updated
    }
    pending.resolve({
      behavior: 'allow',
      updatedInput: {
        ...pending.input,
        answers: pending.answers,
      },
    })
    const updated = await this.store.update(sessionId, (session) => {
      session.pendingUserInput = undefined
      session.status = 'running'
      session.activity = 'Continuing'
    })
    this.publish(updated)
    return updated
  }

  async clearConversation(id: string): Promise<SessionDetail> {
    // In the lifecycle queue with the rest: clearing replaces the session with
    // a new id, and a suspension starting while it awaits the provider would
    // then be recorded against a session that no longer exists.
    return this.serializeLifecycle(id, () => this.clearSerialized(id))
  }

  private async clearSerialized(id: string): Promise<SessionDetail> {
    if (this.store.get(id)?.suspended || this.suspendingSessions.has(id)) {
      throw new Error('Resume the session before clearing it')
    }
    const session = this.requireIdle(id)
    try {
      await this.sdk.deleteSession(id, { dir: session.cwd })
    } catch (error) {
      if (!isMissingClaudeSessionError(error)) {
        throw error
      }
    }
    const replacementId = randomUUID()
    const cleared = await this.store.replaceWithClearedSession(id, replacementId)
    this.emit('event', {
      type: 'session.removed',
      sessionId: id,
      replacedBy: replacementId,
    })
    this.publish(cleared)
    return cleared
  }

  async suspendSession(id: string): Promise<SessionDetail> {
    return this.serializeLifecycle(id, () => this.suspendQueued(id))
  }

  private async suspendQueued(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (stored.suspended) {
      return stored
    }
    this.requireIdle(id)
    // Claimed before anything is awaited: a message that got past the check on
    // its way in would otherwise start a query into a session on its way down.
    this.suspendingSessions.add(id)
    // The conversation is held on disk and a query is started again for the
    // next message, so letting go of it costs nothing but starting one.
    const active = this.active.get(id)
    if (active) {
      active.abortController.abort()
      this.active.delete(id)
    }
    try {
      const suspended = await this.store.setSuspended(id, true)
      this.publish(suspended)
      return suspended
    } finally {
      this.suspendingSessions.delete(id)
    }
  }

  async resumeSession(id: string): Promise<SessionDetail> {
    return this.serializeLifecycle(id, () => this.resumeQueued(id))
  }

  private async resumeQueued(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (!stored.suspended) {
      return stored
    }
    const hasQueue = Boolean(this.store.get(id)?.queuedPrompts?.length)
    if (hasQueue) {
      this.admissionClosed.add(id)
    }
    const resumed = await this.store.setSuspended(id, false)
    this.publish(resumed)
    // A prompt queued before the suspension is waiting with nothing to run
    // it. Draining now keeps the queue in the order it was written: left
    // until some later query happens to finish, a message sent after the
    // resume would go first.
    if (resumed.queuedPrompts?.length) {
      // The drain requeues and rethrows when authentication, persistence or
      // sending fails. Discarded, that rejection has nowhere to go and takes
      // the process with it.
      const releaseDispatch = this.holdDispatch(id)
      try {
        await this.drainQueue(id).catch((error: unknown) => {
          this.emit('event', {
            type: 'error',
            sessionId: id,
            message: error instanceof Error ? error.message : String(error),
          })
        })
      } finally {
        this.admissionClosed.delete(id)
        releaseDispatch()
      }
    } else if (hasQueue) {
      this.admissionClosed.delete(id)
    }
    return resumed
  }

  async restartSession(id: string): Promise<SessionDetail> {
    if (this.store.get(id)?.suspended) {
      throw new Error('Resume the session before restarting it')
    }
    this.requireIdle(id)
    const restarted = await this.store.updateStatus(id, 'idle')
    this.publish(restarted)
    return restarted
  }

  async moveToTerminal(_id: string): Promise<SessionDetail> {
    throw new Error('Claude Agent sessions cannot move to tmux')
  }

  async removeQueuedPrompt(
    sessionId: string,
    promptId: string,
  ): Promise<RemovedQueuedPrompt> {
    const result = await this.store.removeQueuedPrompt(sessionId, promptId)
    if (!result.prompt) {
      throw new Error('Queued prompt not found')
    }
    this.publish(result.session)
    return { session: result.session, prompt: result.prompt }
  }

  async sendMessage(
    sessionId: string,
    content: string,
    enqueue = false,
  ): Promise<SessionDetail> {
    if (this.admissionClosed.has(sessionId)) {
      // Resuming, and the prompt already queued has not been claimed yet.
      // Only the idle check consulted this, which a send can reach past.
      throw new Error('The session is still resuming')
    }
    return this.dispatchQueued(sessionId, content, enqueue)
  }

  private async dispatchQueued(
    sessionId: string,
    content: string,
    enqueue = false,
  ): Promise<SessionDetail> {
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw new Error('Resume the session before sending to it')
    }
    await this.refreshAuthentication()
    // Suspending may have finished while authentication was being refreshed,
    // and may still finish before the turn starts, so it is asked again there.
    if (this.store.get(sessionId)?.suspended) {
      throw new Error('Resume the session before sending to it')
    }
    const session = this.requireSession(sessionId)
    if (session.status === 'running' || session.status === 'waiting') {
      if (!enqueue) {
        throw new Error('Claude Agent is already running; queue this message instead')
      }
      const queued = await this.store.enqueuePrompt(sessionId, {
        id: randomUUID(),
        content,
        createdAt: new Date().toISOString(),
      })
      this.publish(queued)
      return queued
    }
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw new Error('Resume the session before sending to it')
    }
    const createdAt = new Date().toISOString()
    const userId = randomUUID()
    await this.store.addMessage(sessionId, {
      id: userId,
      role: 'user',
      content,
      createdAt,
    })
    const assistantId = randomUUID()
    await this.store.addMessage(sessionId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      streaming: true,
    })
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      // Suspending saw an idle session and took it down while the message was
      // being recorded. Starting the query now would run it against a session
      // the app describes as having nothing running.
      //
      // Both entries go back out together. Refusing the send while keeping
      // them leaves the prompt in the transcript and an assistant reply that
      // is blank for good, and the client restores the draft on top of it.
      let repaired = true
      await this.store
        .update(sessionId, (stored) => {
          stored.messages = stored.messages.filter(
            (message) => message.id !== userId && message.id !== assistantId,
          )
        })
        .catch(() => {
          repaired = false
        })
      if (!repaired) {
        // Saying only that the send was refused would describe a transcript
        // that is still holding a prompt and a reply that stays blank as
        // though it had been put back the way it was found.
        throw new Error(
          'Resume the session before sending to it. The message could not be taken back out of the transcript.',
        )
      }
      throw new Error('Resume the session before sending to it')
    }
    const running = await this.store.update(sessionId, (stored) => {
      stored.status = 'running'
      stored.activity = 'Thinking'
      if (stored.messages.filter((message) => message.role === 'user').length === 1) {
        stored.title =
          content.length > 52 ? `${content.slice(0, 52)}…` : content
      }
    })
    this.publish(running)
    void this.runQuery(sessionId, content, assistantId)
    return running
  }

  async listCommands(_sessionId: string): Promise<SlashCommand[]> {
    return []
  }

  async executeCommand(
    _sessionId: string,
    command: string,
    _enqueue = false,
  ): Promise<SessionDetail> {
    throw new Error(`Claude Agent command ${command.split(/\s/, 1)[0]} is not available`)
  }

  async cancel(sessionId: string): Promise<void> {
    this.active.get(sessionId)?.abortController.abort()
  }

  async listBackgroundTasks(
    sessionId: string,
  ): Promise<BackgroundTaskSnapshot> {
    this.requireSession(sessionId)
    return {
      tasks: [],
      runningCount: 0,
      supported: false,
    }
  }

  async cancelBackgroundTask(
    sessionId: string,
    _taskId: string,
  ): Promise<BackgroundTaskSnapshot> {
    this.requireSession(sessionId)
    throw new Error('Background tasks are not supported for Claude Agent sessions')
  }

  async deleteSession(sessionId: string): Promise<void> {
    // Deleting takes the provider session and the stored state with it, so a
    // resume running beside it could start a query against files that are
    // already going.
    return this.serializeLifecycle(sessionId, () =>
      this.deleteSerialized(sessionId),
    )
  }

  private async deleteSerialized(sessionId: string): Promise<void> {
    const session = this.requireSession(sessionId)
    this.active.get(sessionId)?.abortController.abort()
    this.resolvePending(sessionId, 'Session was deleted')
    let cleanupError: unknown
    try {
      await this.sdk.deleteSession(sessionId, { dir: session.cwd })
    } catch (error) {
      if (!isMissingClaudeSessionError(error)) {
        cleanupError = error
      }
    }
    await this.store.remove(sessionId)
    this.emit('event', { type: 'session.removed', sessionId })
    if (cleanupError) {
      throw cleanupError
    }
  }

  async replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail> {
    const pending = this.permissions.get(requestId)
    if (!pending || pending.sessionId !== sessionId) {
      throw new Error('Permission request is no longer pending')
    }
    this.permissions.delete(requestId)
    pending.resolve(
      optionId === 'allow-once'
        ? { behavior: 'allow', updatedInput: pending.input }
        : { behavior: 'deny', message: 'User denied this tool request' },
    )
    const updated = await this.store.update(sessionId, (session) => {
      session.pendingPermission = undefined
      session.status = 'running'
      session.activity = 'Continuing'
    })
    this.publish(updated)
    return updated
  }

  listDirectories(path?: string, scope?: DirectoryScope) {
    return listHomeDirectories(path, scope)
  }

  validateSessionDirectory(inputPath: string): Promise<string> {
    return this.validateDirectory(inputPath)
  }

  // Confine the root exactly as a session working directory is confined, so
  // this stays safe even though the provider aggregator routes to Copilot.
  async listKnowledge(root: string, path = '.') {
    return listWorkspace(await validateKnowledgeRoot(root), path)
  }

  async readKnowledgeFile(root: string, path: string) {
    return readWorkspaceFile(await validateKnowledgeRoot(root), path)
  }

  listWorkspace(
    sessionId: string,
    requestedPath?: string,
  ): Promise<WorkspaceListing> {
    return listWorkspace(this.requireSession(sessionId).cwd, requestedPath)
  }

  readWorkspaceFile(
    sessionId: string,
    requestedPath: string,
  ): Promise<WorkspaceFile> {
    return readWorkspaceFile(this.requireSession(sessionId).cwd, requestedPath)
  }

  searchWorkspace(
    sessionId: string,
    searchQuery: string,
    requestedPath?: string,
  ): Promise<WorkspaceSearchResponse> {
    return searchWorkspace(
      this.requireSession(sessionId).cwd,
      searchQuery,
      requestedPath,
    )
  }

  private async detectAvailability(): Promise<void> {
    try {
      await access(this.executable)
      const status = await this.authStatus(this.executable)
      if (!status.loggedIn) {
        this.unavailableReason = 'Run claude auth login on this computer'
        return
      }
      this.models = await this.loadModels()
      this.available = true
      this.unavailableReason = ''
    } catch (error) {
      this.available = false
      this.unavailableReason =
        (error as NodeJS.ErrnoException).code === 'ENOENT'
          ? 'Claude Code is not installed on this computer'
          : 'Claude authentication or model discovery failed'
    }
  }

  private async refreshAuthentication(): Promise<void> {
    try {
      const status = await this.authStatus(this.executable)
      if (!status.loggedIn) {
        this.available = false
        this.unavailableReason = 'Run claude auth login on this computer'
        throw new Error(this.unavailableReason)
      }
      this.available = true
      this.unavailableReason = ''
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Run claude auth login on this computer'
      ) {
        throw error
      }
      this.available = false
      this.unavailableReason = 'Claude authentication check failed'
      throw new Error(this.unavailableReason, { cause: error })
    }
  }

  private async loadModels(): Promise<RuntimeModelOption[]> {
    async function* emptyPrompt() {}
    const abortController = new AbortController()
    const modelQuery = this.sdk.query({
      prompt: emptyPrompt(),
      options: {
        abortController,
        cwd: process.cwd(),
        pathToClaudeCodeExecutable: this.executable,
      },
    })
    try {
      return (await modelQuery.supportedModels()).map((model) =>
        this.runtimeModel(model),
      )
    } finally {
      abortController.abort()
      await modelQuery.return(undefined).catch(() => undefined)
    }
  }

  private runtimeModel(model: ModelInfo): RuntimeModelOption {
    return {
      id: model.value,
      name: model.displayName,
      description: model.description,
      reasoningEfforts:
        model.supportedEffortLevels?.length
          ? [...model.supportedEffortLevels]
          : [],
      contextTiers: ['default'],
    }
  }

  private async runQuery(
    sessionId: string,
    prompt: string,
    assistantId: string,
  ): Promise<void> {
    const session = this.requireSession(sessionId)
    const abortController = new AbortController()
    const runtime = session.runtime
    const toolIds = new Set<string>()
    let aborted = false
    try {
      const hasProviderSession = Boolean(
        await this.sdk.getSessionInfo(sessionId, { dir: session.cwd }),
      )
      const activeQuery = this.sdk.query({
        prompt,
        options: {
          abortController,
          allowDangerouslySkipPermissions:
            runtime?.allowAllPermissions === true,
          canUseTool: (toolName, input) =>
            this.canUseTool(sessionId, toolName, input),
          cwd: session.cwd,
          effort: this.effort(runtime?.reasoningEffort),
          includePartialMessages: true,
          model: runtime?.model,
          pathToClaudeCodeExecutable: this.executable,
          permissionMode: this.permissionMode(
            runtime?.mode,
            runtime?.allowAllPermissions,
          ),
          ...(hasProviderSession ? { resume: sessionId } : { sessionId }),
        },
      })
      this.active.set(sessionId, {
        abortController,
        query: activeQuery,
      })
      for await (const message of activeQuery) {
        if (!this.store.get(sessionId)) {
          return
        }
        await this.handleMessage(sessionId, assistantId, message, toolIds)
      }
      if (!this.store.get(sessionId)) {
        return
      }
      const finished = await this.store.finishMessage(sessionId, assistantId)
      const idle = await this.store.update(finished.id, (stored) => {
        stored.status = 'idle'
        stored.activity = undefined
        stored.pendingPermission = undefined
        stored.pendingUserInput = undefined
      })
      this.publish(idle)
      await this.sdk.renameSession(sessionId, idle.title, {
        dir: idle.cwd,
      }).catch(() => undefined)
    } catch (error) {
      if (!this.store.get(sessionId)) {
        return
      }
      aborted = abortController.signal.aborted
      if (isClaudeAuthenticationError(error)) {
        this.available = false
        this.unavailableReason = 'Run claude auth login on this computer'
      }
      await this.store.finishMessage(sessionId, assistantId).catch(() => undefined)
      const failed = await this.store.update(sessionId, (stored) => {
        stored.status = aborted ? 'idle' : 'error'
        stored.activity = undefined
        stored.pendingPermission = undefined
        stored.pendingUserInput = undefined
        // A cancelled turn ends its tools too. Leaving them running would show
        // work still going on in a session that has already stopped.
        for (const entry of stored.messages) {
          if (entry.role === 'activity' && entry.activityStatus === 'running') {
            entry.activityStatus = 'failed'
            entry.activityResult = aborted
              ? 'Cancelled'
              : `Error: ${
                  error instanceof Error ? error.message : String(error)
                }`
          }
        }
      })
      this.publish(failed)
      if (!aborted) {
        this.emit('event', {
          type: 'error',
          sessionId,
          message: isClaudeAuthenticationError(error)
            ? this.unavailableReason
            : error instanceof Error
              ? error.message
              : String(error),
        })
      }
    } finally {
      this.active.delete(sessionId)
      this.resolvePending(sessionId, 'Claude Agent stopped')
      if (!aborted) {
        await this.drainQueue(sessionId)
      }
    }
  }

  private async handleMessage(
    sessionId: string,
    assistantId: string,
    message: SDKMessage,
    toolIds: Set<string>,
  ): Promise<void> {
    if (message.type === 'stream_event') {
      const event = message.event
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        this.publish(
          this.store.streamMessage(sessionId, assistantId, event.delta.text),
        )
      } else if (
        event.type === 'content_block_start' &&
        event.content_block.type === 'tool_use'
      ) {
        await this.startTool(
          sessionId,
          event.content_block.id,
          event.content_block.name,
          toolIds,
        )
      }
      return
    }
    if (message.type === 'assistant') {
      if (message.error) {
        throw new Error(`Claude request failed: ${message.error}`)
      }
      for (const block of message.message.content) {
        if (block.type === 'tool_use') {
          await this.startTool(sessionId, block.id, block.name, toolIds)
        }
      }
      return
    }
    if (message.type === 'user' && Array.isArray(message.message.content)) {
      for (const block of message.message.content) {
        if (
          typeof block === 'object' &&
          block !== null &&
          Reflect.get(block, 'type') === 'tool_result'
        ) {
          const toolUseId = Reflect.get(block, 'tool_use_id')
          if (typeof toolUseId === 'string' && toolIds.has(toolUseId)) {
            const result = toolResultText(Reflect.get(block, 'content'))
            const finished = await this.store.finishToolActivity(
              sessionId,
              toolUseId,
              Reflect.get(block, 'is_error') !== true,
              new Date().toISOString(),
              result,
            )
            this.publish(finished)
          }
        }
      }
      return
    }
    if (message.type === 'result') {
      if (message.subtype !== 'success' || message.is_error) {
        throw new Error(
          'errors' in message && message.errors.length > 0
            ? message.errors.join('; ')
            : `Claude request failed: ${message.subtype}`,
        )
      }
      const usage = Object.values(message.modelUsage || {})
      const contextTokens = usage.reduce(
        (total, model) =>
          total +
          model.inputTokens +
          model.cacheReadInputTokens +
          model.cacheCreationInputTokens,
        0,
      )
      const contextTokenLimit = Math.max(
        0,
        ...usage.map((model) => model.contextWindow),
      )
      const updated = await this.store.update(sessionId, (session) => {
        session.runtime = {
          ...session.runtime,
          contextTokens: contextTokens || undefined,
          contextTokenLimit: contextTokenLimit || undefined,
          contextEstimated: false,
        }
      })
      this.publish(updated)
    }
  }

  private async startTool(
    sessionId: string,
    toolUseId: string,
    name: string,
    toolIds: Set<string>,
  ): Promise<void> {
    if (toolIds.has(toolUseId)) {
      return
    }
    toolIds.add(toolUseId)
    const updated = await this.store.startToolActivity(
      sessionId,
      toolUseId,
      name,
      new Date().toISOString(),
    )
    this.publish(updated)
  }

  private canUseTool(
    sessionId: string,
    toolName: string,
    input: Record<string, unknown>,
  ): Promise<PermissionResult> {
    if (toolName === 'AskUserQuestion') {
      return this.requestUserInput(sessionId, input)
    }
    if (this.requireSession(sessionId).runtime?.allowAllPermissions) {
      return Promise.resolve({ behavior: 'allow', updatedInput: input })
    }
    const requestId = `claude-permission:${randomUUID()}`
    return new Promise((resolve) => {
      this.permissions.set(requestId, { sessionId, input, resolve })
      void this.store
        .update(sessionId, (session) => {
          session.pendingPermission = {
            requestId,
            title: this.permissionTitle(toolName, input),
            kind: toolName,
            options: [
              { optionId: 'allow-once', name: 'Allow', kind: 'allow_once' },
              { optionId: 'deny', name: 'Deny', kind: 'reject_once' },
            ],
          }
          session.status = 'waiting'
          session.activity = session.pendingPermission.title
        })
        .then((session) => this.publish(session))
        .catch((error: unknown) => {
          this.permissions.delete(requestId)
          resolve({
            behavior: 'deny',
            message: error instanceof Error ? error.message : String(error),
          })
        })
    })
  }

  private requestUserInput(
    sessionId: string,
    input: Record<string, unknown>,
  ): Promise<PermissionResult> {
    const questions = this.claudeQuestions(input)
    if (questions.length === 0) {
      return Promise.resolve({
        behavior: 'deny',
        message: 'Claude requested unsupported user input',
      })
    }
    const requestId = `claude-input:${randomUUID()}`
    return new Promise((resolve) => {
      const pending: PendingClaudeInput = {
        sessionId,
        requestId,
        input,
        questions,
        index: 0,
        answers: {},
        resolve,
      }
      this.userInputs.set(requestId, pending)
      void this.store
        .update(sessionId, (session) => {
          session.pendingUserInput = this.pendingInput(pending)
          session.status = 'waiting'
          session.activity = session.pendingUserInput.question
        })
        .then((session) => this.publish(session))
        .catch((error: unknown) => {
          this.userInputs.delete(requestId)
          resolve({
            behavior: 'deny',
            message: error instanceof Error ? error.message : String(error),
          })
        })
    })
  }

  private claudeQuestions(input: Record<string, unknown>): ClaudeQuestion[] {
    const questions = input.questions
    if (!Array.isArray(questions)) {
      return []
    }
    return questions.flatMap((value) => {
      if (typeof value !== 'object' || value === null) {
        return []
      }
      const question = Reflect.get(value, 'question')
      const rawOptions = Reflect.get(value, 'options')
      if (typeof question !== 'string' || !Array.isArray(rawOptions)) {
        return []
      }
      const options = rawOptions.flatMap((option) => {
        if (typeof option !== 'object' || option === null) {
          return []
        }
        const label = Reflect.get(option, 'label')
        return typeof label === 'string' ? [label] : []
      })
      return [
        {
          question,
          options,
          multiSelect: Reflect.get(value, 'multiSelect') === true,
        },
      ]
    })
  }

  private resolveAnswer(
    question: ClaudeQuestion,
    input: UserInputReplyInput,
  ): string {
    if (!question.multiSelect) {
      return input.answer
    }
    const selected = input.answers?.length ? input.answers : [input.answer]
    const unknown = selected.filter(
      (value) => !question.options.includes(value),
    )
    if (unknown.length > 0) {
      throw new Error(`Unknown option: ${unknown[0]}`)
    }
    // The SDK expects multi-select answers as a comma-separated string.
    return [...new Set(selected)].join(', ')
  }

  private pendingInput(pending: PendingClaudeInput): PendingUserInput {
    const question = pending.questions[pending.index]
    return {
      requestId: pending.requestId,
      question: question.question,
      choices: question.options,
      allowFreeform: !question.multiSelect,
      multiSelect: question.multiSelect,
    }
  }

  private permissionTitle(
    toolName: string,
    input: Record<string, unknown>,
  ): string {
    const description = input.description
    if (typeof description === 'string' && description.trim()) {
      return `${toolName}: ${description.trim()}`
    }
    const command = input.command
    if (toolName === 'Bash' && typeof command === 'string') {
      return `Run ${command.slice(0, 160)}`
    }
    return `Use ${toolName}`
  }

  private resolvePending(sessionId: string, message: string): void {
    for (const [requestId, permission] of this.permissions) {
      if (permission.sessionId === sessionId) {
        permission.resolve({ behavior: 'deny', message })
        this.permissions.delete(requestId)
      }
    }
    for (const [requestId, input] of this.userInputs) {
      if (input.sessionId === sessionId) {
        input.resolve({ behavior: 'deny', message })
        this.userInputs.delete(requestId)
      }
    }
  }

  private async drainQueue(sessionId: string): Promise<void> {
    const session = this.store.get(sessionId)
    if (!session || session.status !== 'idle') {
      return
    }
    if (session.suspended || this.suspendingSessions.has(sessionId)) {
      // Suspending leaves a session idle, so the queue would take a prompt off
      // and then be refused for being suspended, losing it for good.
      return
    }
    const next = session.queuedPrompts?.[0]
    if (!next) {
      return
    }
    await this.store.removeQueuedPrompt(sessionId, next.id)
    try {
      // The queue's own prompt is the one admission is being held for, so it
      // goes past that gate rather than into it. Sending through the public
      // path refused it on the very flag that exists to keep newer work out
      // until this has gone in, so resume finished having sent nothing.
      await this.dispatchQueued(sessionId, next.content)
    } catch (error) {
      // The prompt is off the queue and was never sent, so it goes back where
      // it was rather than disappearing.
      await this.store
        .enqueuePrompt(sessionId, next, true)
        .catch(() => undefined)
      throw error
    }
  }

  private permissionMode(
    mode: string | undefined,
    allowAllPermissions: boolean | undefined,
  ): 'default' | 'bypassPermissions' | 'plan' | 'auto' {
    if (mode === 'plan') {
      return 'plan'
    }
    if (mode === 'autopilot') {
      return 'auto'
    }
    return allowAllPermissions ? 'bypassPermissions' : 'default'
  }

  private effort(value: string | undefined): EffortLevel | undefined {
    return value === 'low' ||
      value === 'medium' ||
      value === 'high' ||
      value === 'xhigh' ||
      value === 'max'
      ? value
      : undefined
  }

  private requireAvailable(): void {
    if (!this.available) {
      throw new Error(this.unavailableReason)
    }
  }

  private requireSession(id: string): SessionDetail {
    const session = this.store.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    return session
  }

  private requireIdle(id: string): SessionDetail {
    const session = this.requireSession(id)
    if (this.admissionClosed.has(id)) {
      // Resuming, and the prompt already queued has not been claimed yet.
      throw new Error('The session is still resuming')
    }
    if (session.status !== 'idle') {
      throw new Error('Session must be idle')
    }
    if (this.dispatchingSessions.has(id)) {
      // A prompt is already on its way. The status only turns to running once
      // the turn is recorded, so without this a second one starts beside it.
      throw new Error('Session must be idle')
    }
    return session
  }

  private publish(session: SessionDetail): void {
    this.emit('event', { type: 'session.upserted', session })
  }

  private async validateDirectory(inputPath: string): Promise<string> {
    return validateSessionDirectory(inputPath)
  }
}
