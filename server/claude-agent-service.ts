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
import { SessionReplacementCleanupError, SessionStore, type QueuedPromptReservation } from './session-store.js'
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
  /**
   * Settles when the run that owns this entry has finished tearing down.
   *
   * Suspending waits on it, so a resume cannot start a query while the
   * previous one is still unwinding.
   */
  done: Promise<void>
  /** Resolves `done`. */
  finish: () => void
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

interface PendingClaudeReply {
  sessionId: string
  kind: 'pendingPermission' | 'pendingUserInput'
  answer: string
  question?: ClaudeQuestion
  accepted: boolean
  completion?: Promise<SessionDetail>
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
  /**
   * Sessions whose turn has been started but has not registered its query yet.
   *
   * A turn asks the provider for its session before it has anything to
   * register, and work that only looks at `active` read that gap as nothing
   * running.
   */
  private readonly startingQueries = new Map<string, Promise<void>>()
  /** Sessions being deleted, closed to new work from before the first await. */
  private readonly deletingSessions = new Set<string>()
  /** Sends that have been admitted but have not finished being admitted. */
  private readonly admittingSends = new Map<string, Promise<void>[]>()
  /** Settles the matching `startingQueries` entry once a turn has registered. */
  private readonly startedQuery = new Map<string, () => void>()
  /** Sessions whose queue is being drained, so two drains cannot overlap. */
  private readonly drainingSessions = new Set<string>()
  private readonly permissions = new Map<string, PendingClaudePermission>()
  private readonly userInputs = new Map<string, PendingClaudeInput>()
  private readonly pendingReplies = new Map<string, PendingClaudeReply>()
  private stopped = false

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
    this.stopped = true
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
    await Promise.allSettled(this.claudeReplyWrites())
    this.pendingReplies.clear()
    await this.store.flush()
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
    const session = await this.store.readAfterWrites(id)
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
    const session = await this.store.readAfterWrites(id)
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
    const session = await this.store.readAfterWrites(id)
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
      if (stored.status !== 'idle') {
        throw new Error('Runtime settings can only change while the session is idle')
      }
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
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      throw new Error('Session is no longer available')
    }
    const replying = this.pendingReplies.get(requestId)
    if (replying) {
      if (replying.kind !== 'pendingUserInput' || !replying.question) {
        throw new Error('User input request is no longer pending')
      }
      return this.retryClaudeReply(
        sessionId, requestId, 'pendingUserInput',
        this.resolveAnswer(replying.question, input),
      )
    }
    const pending = this.userInputs.get(requestId)
    if (!pending || pending.sessionId !== sessionId ||
        this.store.get(sessionId)?.pendingUserInput?.requestId !== requestId) {
      throw new Error('User input request is no longer pending')
    }
    const question = pending.questions[pending.index]
    if (!question) {
      throw new Error('User input request is invalid')
    }
    const answer = this.resolveAnswer(question, input)
    const answers = { ...pending.answers, [question.question]: answer }
    const replyingNext: PendingClaudeReply = {
      sessionId, kind: 'pendingUserInput', answer, question, accepted: false,
    }
    if (pending.index + 1 < pending.questions.length) {
      const next: PendingClaudeInput = {
        ...pending,
        index: pending.index + 1,
        requestId: `claude-input:${randomUUID()}`,
        answers,
      }
      return this.persistClaudeReply(requestId, replyingNext, async () => {
        const updated = await this.store.updateIf(sessionId, (session) => {
          if (this.stopped || this.deletingSessions.has(sessionId) ||
              this.userInputs.get(requestId) !== pending ||
              session.pendingUserInput?.requestId !== requestId) {
            return false
          }
          session.pendingUserInput = this.pendingInput(next)
          session.status = 'waiting'
          session.activity = session.pendingPermission?.title || session.pendingUserInput.question
          return true
        })
        if (!updated || this.stopped || this.deletingSessions.has(sessionId) ||
            this.userInputs.get(requestId) !== pending ||
            this.store.get(sessionId)?.pendingUserInput?.requestId !== next.requestId) {
          throw new Error('User input request is no longer pending')
        }
        // Keep the visible old key and its answers until the next card commits.
        this.userInputs.delete(requestId)
        this.userInputs.set(next.requestId, next)
        return updated
      })
    }
    replyingNext.accepted = true
    this.pendingReplies.set(requestId, replyingNext)
    this.userInputs.delete(requestId)
    pending.resolve({
      behavior: 'allow',
      updatedInput: {
        ...pending.input,
        answers,
      },
    })
    return this.completeClaudeReply(requestId, replyingNext)
  }

  async clearConversation(id: string): Promise<SessionDetail> {
    // In the lifecycle queue with the rest: clearing replaces the session with
    // a new id, and a suspension starting while it awaits the provider would
    // then be recorded against a session that no longer exists.
    return this.serializeLifecycle(id, () => this.clearSerialized(id))
  }

  private async clearSerialized(id: string): Promise<SessionDetail> {
    await this.store.readAfterWrites(id)
    if (this.store.get(id)?.suspended || this.suspendingSessions.has(id)) {
      throw Object.assign(new Error('Resume the session before clearing it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    const session = this.requireIdle(id)
    const replacementId = randomUUID()
    let cleared: SessionDetail
    const cleanupErrors: unknown[] = []
    try {
      cleared = await this.store.replaceWithClearedSession(id, replacementId)
    } catch (error) {
      if (!(error instanceof SessionReplacementCleanupError)) throw error
      cleared = error.replacement
      cleanupErrors.push(error)
    }
    this.forgetClaudeReplies(id)
    this.emit('event', {
      type: 'session.removed',
      sessionId: id,
      replacedBy: replacementId,
    })
    this.publish(cleared)
    try {
      await this.sdk.deleteSession(id, { dir: session.cwd })
    } catch (error) {
      if (!isMissingClaudeSessionError(error)) cleanupErrors.push(error)
    }
    for (const error of cleanupErrors) {
      this.emit('event', {
        type: 'error', sessionId: replacementId,
        message: error instanceof Error ? error.message : String(error),
      })
    }
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
    try {
      await this.store.readAfterWrites(id)
      this.requireIdle(id)
      const active = this.active.get(id)
      if (active) {
        active.abortController.abort()
        if (this.active.get(id) === active) {
          this.active.delete(id)
        }
        // Waited for rather than abandoned. The run tears down after the abort,
        // and a resume that got in first would have registered its own query by
        // then -- which the old run's cleanup used to remove, leaving the live
        // query with nothing able to stop it.
        await active.done
      }
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
    const stored = await this.store.readAfterWrites(id)
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
    // In the same queue as suspend, resume and clear. Left outside it, a
    // restart could report success after suspension had claimed the session
    // but before the flag was written, and the suspension that finished
    // afterwards wrote over it.
    return this.serializeLifecycle(id, () => this.restartSerialized(id))
  }

  private async restartSerialized(id: string): Promise<SessionDetail> {
    await this.store.readAfterWrites(id)
    if (this.store.get(id)?.suspended || this.suspendingSessions.has(id)) {
      throw Object.assign(new Error('Resume the session before restarting it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
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
    if (this.stopped) throw new Error('The session service is stopping')
    if (this.deletingSessions.has(sessionId)) {
      // Deleting takes several awaits, and a send starting inside any of them
      // ran a turn against a conversation on its way out.
      throw new Error('Session not found')
    }
    // Claimed here, before the first await. A send that got past the check
    // above could then wait in authentication while deletion began, find its
    // only synchronisation point empty, and register a query afterwards --
    // provider work and tool side effects carrying on against a conversation
    // that was gone.
    let admitted = () => {}
    const admission = new Promise<void>((resolve) => {
      admitted = resolve
    })
    this.admittingSends.set(sessionId, [
      ...(this.admittingSends.get(sessionId) || []),
      admission,
    ])
    try {
      return await this.admitSend(sessionId, content, enqueue)
    } finally {
      admitted()
      this.admittingSends.set(
        sessionId,
        (this.admittingSends.get(sessionId) || []).filter(
          (entry) => entry !== admission,
        ),
      )
    }
  }

  private async admitSend(
    sessionId: string,
    content: string,
    enqueue: boolean,
  ): Promise<SessionDetail> {
    if (this.admissionClosed.has(sessionId)) {
      // Resuming, and the prompt already queued has not been claimed yet, or a
      // drain has taken its prompt off and not yet marked the session running.
      // Only the idle check consulted this, which a send can reach past.
      throw Object.assign(new Error('The session is still resuming'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    return this.dispatchQueued(sessionId, content, enqueue)
  }

  private async dispatchQueued(
    sessionId: string,
    content: string,
    enqueue = false,
    fromQueue = false,
    reservation?: QueuedPromptReservation,
  ): Promise<SessionDetail> {
    await this.store.readAfterWrites(sessionId)
    if (this.stopped || this.deletingSessions.has(sessionId)) {
      throw new Error('Session is no longer available')
    }
    if (!fromQueue && this.admissionClosed.has(sessionId)) {
      throw Object.assign(new Error('The session is still resuming'), { statusCode: 409 })
    }
    if (
      this.store.get(sessionId)?.suspended ||
      this.suspendingSessions.has(sessionId)
    ) {
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    // Anything already waiting goes first. A resume whose drain failed puts
    // the prompt back, and a message written after it must not overtake it.
    if (!fromQueue && this.store.get(sessionId)?.queuedPrompts?.length) {
      const queued = await this.store.enqueuePrompt(sessionId, {
        id: randomUUID(),
        content,
        createdAt: new Date().toISOString(),
      })
      this.publish(queued)
      // A drain that failed put its prompt back and left no query running to
      // take it off again. Without this the queue stands still and every
      // message written afterwards simply joins it. The drain does nothing at
      // all while the session is busy, so this is safe to ask for either way.
      void this.drainQueue(sessionId).catch(() => undefined)
      return queued
    }
    await this.refreshAuthentication()
    // Suspending may have finished while authentication was being refreshed,
    // and may still finish before the turn starts, so it is asked again there.
    if (this.store.get(sessionId)?.suspended) {
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
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
      throw Object.assign(new Error('Resume the session before sending to it'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
    }
    const assistantId = randomUUID()
    const running = await this.store.beginPrompt(
      sessionId, content, assistantId,
      () => !this.stopped && !this.deletingSessions.has(sessionId) &&
        !this.suspendingSessions.has(sessionId) && !this.active.has(sessionId) &&
        !this.startingQueries.has(sessionId) && (fromQueue || !this.admissionClosed.has(sessionId)),
      reservation,
    )
    this.publish(running)
    // Nothing waits on this, so a rejection escaping it would be unhandled and
    // could take the process down. The turn reports its own failures on the
    // session; the queue drain that runs after it puts its prompt back and
    // rethrows, and that has nowhere left to go but here.
    // Claimed before the turn is started, not once it has a query to show for
    // itself. Registering only after the provider has been asked for its
    // session left a window in which a delete found nothing running, took the
    // conversation away, and the turn then started against a session that no
    // longer existed.
    let started = () => {}
    this.startingQueries.set(
      sessionId,
      new Promise<void>((resolve) => {
        started = resolve
      }),
    )
    this.startedQuery.set(sessionId, started)
    void this.runQuery(sessionId, content, assistantId).catch((error) => {
      console.warn(
        `Claude turn for ${sessionId} ended in an unreported failure:`,
        error,
      )
    })
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
    // Marked before anything is awaited. Deleting takes several awaits, and a
    // send starting inside any of them ran a turn against a conversation that
    // was on its way out.
    this.deletingSessions.add(sessionId)
    try {
      await Promise.allSettled(this.claudeReplyWrites(sessionId))
      await this.deleteClaimed(sessionId, session)
    } finally {
      this.deletingSessions.delete(sessionId)
    }
  }

  private async deleteClaimed(
    sessionId: string,
    session: SessionDetail,
  ): Promise<void> {
    // A turn started a moment ago may not have registered its query yet. It is
    // waited for rather than polled for a while: a provider that is slow to
    // answer outlasted the polling and the turn then started against a
    // conversation already taken away.
    // Sends already inside admission, before whatever they are waiting on can
    // let them through. Sampling only the registered turns found nothing and
    // deleted the conversation out from under one that was still on its way.
    const admitting = this.admittingSends.get(sessionId) || []
    if (admitting.length) {
      await Promise.allSettled(admitting)
    }
    const starting = this.startingQueries.get(sessionId)
    if (starting) {
      await starting.catch(() => undefined)
    }
    this.active.get(sessionId)?.abortController.abort()
    const settling = this.active.get(sessionId)?.done
    this.resolvePending(sessionId, 'Session was deleted')
    if (settling) {
      // Waited for, so the turn is finished with the conversation before it is
      // removed rather than writing into it afterwards.
      await settling
    }
    let cleanupError: unknown
    try {
      await this.sdk.deleteSession(sessionId, { dir: session.cwd })
    } catch (error) {
      if (!isMissingClaudeSessionError(error)) {
        cleanupError = error
      }
    }
    await this.store.remove(sessionId)
    this.forgetClaudeReplies(sessionId)
    this.emit('event', { type: 'session.removed', sessionId })
    if (cleanupError) {
      throw cleanupError
    }
  }

  private claudeReplyWrites(sessionId?: string): Promise<SessionDetail>[] {
    return [...this.pendingReplies.values()].flatMap((reply) =>
      reply.completion && (!sessionId || reply.sessionId === sessionId)
        ? [reply.completion]
        : [],
    )
  }

  private forgetClaudeReplies(sessionId: string): void {
    for (const [requestId, reply] of this.pendingReplies) {
      if (reply.sessionId === sessionId) this.pendingReplies.delete(requestId)
    }
  }

  private persistClaudeReply(
    requestId: string,
    reply: PendingClaudeReply,
    persist: () => Promise<SessionDetail>,
  ): Promise<SessionDetail> {
    this.pendingReplies.set(requestId, reply)
    const completion = persist().then((updated) => {
      if (this.pendingReplies.get(requestId) === reply) this.pendingReplies.delete(requestId)
      if (!this.stopped && !this.deletingSessions.has(reply.sessionId) && this.store.get(reply.sessionId)) {
        this.publish(updated)
      }
      return updated
    }, (error: unknown) => {
      if (!reply.accepted) {
        if (this.pendingReplies.get(requestId) === reply) this.pendingReplies.delete(requestId)
        throw error
      }
      throw Object.assign(new Error(
        `The reply was accepted, but its confirmation could not be saved: ${
          error instanceof Error ? error.message : String(error)
        }. Retry the same reply; it will not be sent to the agent again.`,
        { cause: error },
      ), { statusCode: 503 })
    }).finally(() => {
      reply.completion = undefined
    })
    reply.completion = completion
    return completion
  }

  private completeClaudeReply(
    requestId: string,
    reply: PendingClaudeReply,
  ): Promise<SessionDetail> {
    return this.persistClaudeReply(requestId, reply, () => this.store.clearPendingRequest(
      reply.sessionId, reply.kind, requestId, { status: 'running', activity: 'Continuing' },
    ))
  }

  private retryClaudeReply(
    sessionId: string,
    requestId: string,
    kind: PendingClaudeReply['kind'],
    answer: string,
  ): Promise<SessionDetail> {
    const reply = this.pendingReplies.get(requestId)!
    if (reply.sessionId !== sessionId || reply.kind !== kind || reply.answer !== answer) {
      throw Object.assign(new Error(
        'A different reply is already being processed or was accepted. Retry the original reply.',
      ), { statusCode: 409 })
    }
    return reply.completion || this.completeClaudeReply(requestId, reply)
  }

  async replyPermission(
    sessionId: string,
    requestId: string,
    optionId: string,
  ): Promise<SessionDetail> {
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      throw new Error('Session is no longer available')
    }
    if (this.pendingReplies.has(requestId)) {
      return this.retryClaudeReply(sessionId, requestId, 'pendingPermission', optionId)
    }
    const pending = this.permissions.get(requestId)
    if (!pending || pending.sessionId !== sessionId ||
        this.store.get(sessionId)?.pendingPermission?.requestId !== requestId) {
      throw new Error('Permission request is no longer pending')
    }
    if (!['allow-once', 'deny'].includes(optionId)) {
      throw new Error('The selected permission option is not available')
    }
    const reply: PendingClaudeReply = {
      sessionId, kind: 'pendingPermission', answer: optionId, accepted: true,
    }
    this.pendingReplies.set(requestId, reply)
    this.permissions.delete(requestId)
    pending.resolve(
      optionId === 'allow-once'
        ? { behavior: 'allow', updatedInput: pending.input }
        : { behavior: 'deny', message: 'User denied this tool request' },
    )
    return this.completeClaudeReply(requestId, reply)
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
    // This run's own entry, so cleanup cannot remove a newer one.
    let owned: ActiveClaudeQuery | undefined
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
      let finish = () => {}
      const done = new Promise<void>((resolve) => {
        finish = resolve
      })
      const entry: ActiveClaudeQuery = {
        abortController,
        query: activeQuery,
        done,
        finish,
      }
      owned = entry
      this.active.set(sessionId, entry)
      this.startedQuery.get(sessionId)?.()
      this.startedQuery.delete(sessionId)
      this.startingQueries.delete(sessionId)
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
      // Only this run's own entry is removed. A suspension that abandoned this
      // query, followed by a resume that started another, leaves a newer entry
      // here, and deleting by id alone took the live query's handle away and
      // left nothing able to stop it.
      if (owned && this.active.get(sessionId) === owned) {
        this.active.delete(sessionId)
      }
      owned?.finish()
      this.startedQuery.get(sessionId)?.()
      this.startedQuery.delete(sessionId)
      this.startingQueries.delete(sessionId)
      this.resolvePending(sessionId, 'Claude Agent stopped')
      if (!aborted) {
        // The drain puts its own prompt back before rethrowing, and there is
        // nobody above this to tell. Reported rather than thrown out of a
        // finally block, which would replace whatever this turn was already
        // saying.
        await this.drainQueue(sessionId).catch((drainError: unknown) => {
          this.emit('event', {
            type: 'error',
            sessionId,
            message:
              drainError instanceof Error
                ? drainError.message
                : String(drainError),
          })
        })
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
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      return Promise.resolve({ behavior: 'deny', message: 'Session is no longer available' })
    }
    if (toolName === 'AskUserQuestion') {
      return this.requestUserInput(sessionId, input)
    }
    if (this.requireSession(sessionId).runtime?.allowAllPermissions) {
      return Promise.resolve({ behavior: 'allow', updatedInput: input })
    }
    const requestId = `claude-permission:${randomUUID()}`
    return new Promise((resolve) => {
      const pending = { sessionId, input, resolve }
      this.permissions.set(requestId, pending)
      void this.store
        .update(sessionId, (session) => {
          if (this.stopped || this.deletingSessions.has(sessionId) ||
              this.permissions.get(requestId) !== pending) {
            throw new Error('Permission request is no longer pending')
          }
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
        .then((session) => {
          if (this.permissions.get(requestId) === pending) this.publish(session)
        })
        .catch((error: unknown) => {
          if (this.permissions.get(requestId) !== pending) return
          this.permissions.delete(requestId)
          pending.resolve({
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
    if (this.stopped || this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      return Promise.resolve({ behavior: 'deny', message: 'Session is no longer available' })
    }
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
          if (this.stopped || this.deletingSessions.has(sessionId) ||
              this.userInputs.get(requestId) !== pending) {
            throw new Error('User input request is no longer pending')
          }
          session.pendingUserInput = this.pendingInput(pending)
          session.status = 'waiting'
          session.activity = session.pendingUserInput.question
        })
        .then((session) => {
          if (this.userInputs.get(requestId) === pending) this.publish(session)
        })
        .catch((error: unknown) => {
          if (this.userInputs.get(requestId) !== pending) return
          this.userInputs.delete(requestId)
          pending.resolve({
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
    if (input.action && input.action !== 'accept') {
      throw Object.assign(new Error('This user input request cannot be dismissed'), { statusCode: 409 })
    }
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
    // One drain at a time. Two sends reaching an idle session with a prompt
    // already waiting each took a different head off the queue before either
    // marked the session running, and started concurrent turns: the queue lost
    // its order, and the second registration hid the first from cancellation.
    if (this.stopped || this.deletingSessions.has(sessionId) || this.drainingSessions.has(sessionId)) {
      return
    }
    this.drainingSessions.add(sessionId)
    try {
      await this.drainSerialized(sessionId)
    } finally {
      this.drainingSessions.delete(sessionId)
    }
  }

  private async drainSerialized(sessionId: string): Promise<void> {
    const session = this.store.get(sessionId)
    if (!session || session.status !== 'idle') {
      return
    }
    if (session.suspended || this.suspendingSessions.has(sessionId)) {
      // Suspending leaves a session idle, so the queue would take a prompt off
      // and then be refused for being suspended, losing it for good.
      return
    }
    if (!session.queuedPrompts?.length) {
      return
    }
    // Reserve admission before the first await. The FIFO item stays durable
    // until its transcript and running state commit in the same write.
    this.admissionClosed.add(sessionId)
    // The drain's own prompt is a send too, and it goes straight to the
    // dispatch rather than through the public path. Deletion looked only at
    // sends that came in that way, so a drain between taking its prompt off
    // the queue and registering its turn was invisible to it.
    let drained = () => {}
    const draining = new Promise<void>((resolve) => {
      drained = resolve
    })
    this.admittingSends.set(sessionId, [
      ...(this.admittingSends.get(sessionId) || []),
      draining,
    ])
    try {
      const { reservation } = await this.store.reserveQueuedPrompt(
        sessionId,
        () => !this.stopped && !this.deletingSessions.has(sessionId) &&
          !this.suspendingSessions.has(sessionId) && !this.active.has(sessionId) &&
          !this.startingQueries.has(sessionId),
      )
      if (!reservation) return
      // The queue's own prompt is the one admission is being held for, so it
      // goes past that gate rather than into it. Sending through the public
      // path refused it on the very flag that exists to keep newer work out
      // until this has gone in, so resume finished having sent nothing.
      await this.dispatchQueued(sessionId, reservation.prompt.content, false, true, reservation)
    } finally {
      // Let go of only once the turn is registered, or once it has failed and
      // its prompt is back where it was.
      const starting = this.startingQueries.get(sessionId)
      if (starting) {
        await starting.catch(() => undefined)
      }
      this.admissionClosed.delete(sessionId)
      drained()
      this.admittingSends.set(
        sessionId,
        (this.admittingSends.get(sessionId) || []).filter(
          (entry) => entry !== draining,
        ),
      )
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
      throw Object.assign(new Error('The session is still resuming'), {
        // Carries a status so the reason reaches the reader. Left
        // unclassified it was reported as a generic server error,
        // which says nothing about what to do next.
        statusCode: 409,
      })
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
