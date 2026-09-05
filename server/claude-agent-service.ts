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
  QueuedPromptDispatchResult,
  RuntimeModelOption,
  RuntimeOptions,
  RuntimeReasoningEffort,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SessionSkillsSnapshot,
  SessionMcpServersSnapshot,
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
  acceptanceReceipt,
  explicitlyRefused,
  preparePrompt,
  queueConflict,
  QueuedDelivery,
  QueuedDispatches,
  type QueuedDispatchTarget,
} from './queued-dispatch.js'
import {
  listWorkspace,
  readWorkspaceFile,
  searchWorkspace,
} from './workspace-browser.js'
import {
  claudeMcp,
  claudeSkillNames,
  enrichClaudeSkills,
  isResourceMethodUnavailable,
  mcpSnapshot,
  resourceMessages,
  safeResourceError,
  sanitizeMcpSnapshot,
  sanitizeSkillsSnapshot,
  SessionResourceError,
  skillsSnapshot,
  unavailableMcp,
  unavailableSkills,
} from './session-resources.js'

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
  resourceOwner: symbol
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

interface ClaudeResources {
  owner: symbol
  isCurrent: () => boolean
  skills?: SessionSkillsSnapshot
  mcp?: SessionMcpServersSnapshot
  invalidSkills?: boolean
  invalidMcp?: boolean
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
  private readonly resourceObservations = new Map<string, ClaudeResources>()
  private resourceEpoch = 0
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
  private stopping = false
  private stopTask?: Promise<void>
  private readonly queuedDispatches: QueuedDispatches
  private readonly queueOperations = new Map<string, Promise<unknown>>()
  private readonly queueReceiptStops = new Map<string, () => void>()
  private readonly queryRuns = new Set<Promise<void>>()
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
    this.queuedDispatches = new QueuedDispatches(store, (session) => this.publish(session))
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
        supportsQueuedPromptDispatch: true,
        supportsSessionResources: true,
        unavailableReason: this.available ? undefined : this.unavailableReason,
      },
    ]
  }

  async start(): Promise<void> {
    this.resourceEpoch += 1
    this.resourceObservations.clear()
    this.stopping = false
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

  stop(): Promise<void> {
    this.resourceEpoch += 1
    this.resourceObservations.clear()
    this.stopping = true
    this.stopTask ??= this.stopSettled()
    return this.stopTask
  }

  private async stopSettled(): Promise<void> {
    for (const stop of this.queueReceiptStops.values()) stop()
    for (const active of this.active.values()) {
      active.abortController.abort()
    }
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
    await Promise.allSettled([
      ...[...this.admittingSends.values()].flat(),
      ...this.queueOperations.values(),
    ])
    await Promise.allSettled([...this.startingQueries.values()])
    const active = [...this.active.entries()]
    for (const [sessionId, query] of active) {
      query.abortController.abort()
      this.resolvePending(sessionId, 'Agentic Remote is shutting down')
    }
    // Streaming updates are in memory until the turn's completion path writes
    // them. Keep storage open until every admitted turn has settled.
    await Promise.allSettled(active.map(([, query]) => query.done))
    await Promise.allSettled([...this.queryRuns])
    this.active.clear()
    await this.store.close()
  }

  listSessions(): SessionDetail[] {
    return this.store
      .list()
      .filter((session) => session.isOpen)
      .map((session) => ({ ...this.queuedDispatches.view(session), messages: [] }))
  }

  listHistory(): SessionDetail[] {
    return this.store.list().map((session) => ({ ...this.queuedDispatches.view(session), messages: [] }))
  }

  getSession(id: string): SessionDetail | undefined {
    const session = this.store.get(id)
    return session ? this.queuedDispatches.view(session) : undefined
  }

  async openSession(id: string): Promise<SessionDetail> {
    return this.queuedDispatches.view(this.requireSession(id))
  }

  async activateSession(id: string): Promise<SessionDetail> {
    const opened = await this.store.setOpen(id, true, true)
    this.publish(opened)
    return this.queuedDispatches.view(opened)
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
    return this.queuedDispatches.view(renamed)
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
    this.queuedDispatches.assertAvailable(id)
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
      if (stored.queuedDispatch) throw queueConflict('Resolve the queued dispatch before changing runtime settings.')
      stored.runtime = {
        ...stored.runtime,
        model: input.model,
        reasoningEffort: input.reasoningEffort,
        contextTier: 'default',
        mode: input.mode || 'interactive',
      }
    })
    this.publish(updated)
    return this.queuedDispatches.view(updated)
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
      return this.queuedDispatches.view(updated)
    }
    pending.resolve({
      behavior: 'allow',
      updatedInput: {
        ...pending.input,
        answers: pending.answers,
      },
    })
    const updated = await this.store.clearPendingRequest(
      sessionId, 'pendingUserInput', requestId, { status: 'running', activity: 'Continuing' },
    )
    this.publish(updated)
    return this.queuedDispatches.view(updated)
  }

  async clearConversation(id: string): Promise<SessionDetail> {
    this.resourceObservations.delete(id)
    // In the lifecycle queue with the rest: clearing replaces the session with
    // a new id, and a suspension starting while it awaits the provider would
    // then be recorded against a session that no longer exists.
    return this.queuedDispatches.view(await this.serializeLifecycle(id, () => this.clearSerialized(id)))
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
    return this.queuedDispatches.view(await this.serializeLifecycle(id, () => this.suspendQueued(id)))
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
    return this.queuedDispatches.view(await this.serializeLifecycle(id, () => this.resumeQueued(id)))
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
    return this.queuedDispatches.view(await this.serializeLifecycle(id, () => this.restartSerialized(id)))
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
    acknowledgesDispatch?: string,
  ): Promise<RemovedQueuedPrompt> {
    if (this.queuedDispatches.isActive(sessionId)) throw queueConflict('The queue is still dispatching.')
    return this.serializeQueue(sessionId, async () => {
      const original = this.getSession(sessionId)?.queuedPrompts?.find((prompt) => prompt.id === promptId)
      const discarded = await this.queuedDispatches.discard(sessionId, promptId, acknowledgesDispatch)
      if (discarded && original) return { session: discarded, prompt: original }
      const result = await this.store.removeQueuedPrompt(sessionId, promptId)
      if (!result.prompt) throw queueConflict('Queued prompt not found')
      this.publish(result.session)
      return { session: result.session, prompt: result.prompt }
    })
  }

  async updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    rawContent: string,
  ): Promise<RemovedQueuedPrompt> {
    const content = this.normalizeQueuedContent(rawContent)
    return this.serializeQueue(sessionId, async () => {
      this.queuedDispatches.assertAvailable(sessionId)
      const result = await this.store.updateQueuedPrompt(sessionId, promptId, content)
      if (!result.prompt) throw queueConflict('Queued prompt not found')
      this.publish(result.session)
      return { session: result.session, prompt: result.prompt }
    })
  }

  private normalizeQueuedContent(
    rawContent: string,
    command = rawContent.trimStart().startsWith('/'),
  ): string {
    const content = command ? rawContent.trim() : rawContent
    if (!content.trim()) {
      throw new Error('Message cannot be empty')
    }
    // Claude has no commands of its own, and the store marks any slash-prefixed
    // text as one. Stored that way it reaches a drain that refuses every
    // command and puts it straight back, so the queue behind it never moves
    // again -- and a restart reads the same queue and stops there too.
    if (command) {
      throw Object.assign(
        new Error('This session has no commands, so this cannot be queued'),
        { statusCode: 409 },
      )
    }
    return content
  }

  async reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail> {
    // Under the same marker the drain holds. Without it a turn finishing while
    // the new order was still being written down let the drain take the head
    // of an arrangement that had not been accepted yet -- and if writing it
    // then failed, the prompt already sent was put back on the queue.
    if (this.drainingSessions.has(sessionId)) {
      throw Object.assign(
        new Error('The queue is being worked through; try again in a moment'),
        { statusCode: 409 },
      )
    }
    this.drainingSessions.add(sessionId)
    try {
      const session = await this.serializeQueue(sessionId, () => {
        this.queuedDispatches.assertAvailable(sessionId)
        return this.store.reorderQueuedPrompts(sessionId, order)
      })
      this.publish(session)
      return session
    } finally {
      this.drainingSessions.delete(sessionId)
      // A turn that finished while this held the marker found the drain
      // already marked as running and turned back, and nothing else was going
      // to call it -- so the queue stood still until something unrelated
      // happened. It is asked again now the marker is free; it does nothing
      // if the session is busy.
      void this.drainQueue(sessionId).catch(() => undefined)
    }
  }

  async sendMessage(
    sessionId: string,
    content: string,
    enqueue = false,
  ): Promise<SessionDetail> {
    this.assertNotStopping()
    if (this.store.get(sessionId)?.queuedDispatch && !enqueue) {
      this.queuedDispatches.assertAvailable(sessionId)
    }
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
    const releaseDispatch = this.holdDispatch(sessionId)
    try {
      return this.queuedDispatches.view(await this.admitSend(sessionId, content, enqueue))
    } finally {
      releaseDispatch()
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
    if (!content.trim()) throw queueConflict('Message cannot be empty')
    if (!enqueue && this.store.get(sessionId)?.queuedDispatch) {
      this.queuedDispatches.assertAvailable(sessionId)
    }
    if (this.admissionClosed.has(sessionId)) {
      if (enqueue || this.store.get(sessionId)?.queuedPrompts?.length) {
        const queued = await this.store.enqueuePrompt(sessionId, {
          id: randomUUID(), content, createdAt: new Date().toISOString(),
        })
        this.publish(queued)
        return queued
      }
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
    delivery?: QueuedDelivery,
  ): Promise<SessionDetail> {
    await this.store.readAfterWrites(sessionId)
    if (delivery?.closed || this.stopping) throw queueConflict('This dispatch attempt has ended.')
    if (!fromQueue && this.admissionClosed.has(sessionId) &&
      !enqueue && !this.store.get(sessionId)?.queuedPrompts?.length) {
      throw Object.assign(new Error('The session is still resuming'), { statusCode: 409 })
    }
    if (!fromQueue && this.store.get(sessionId)?.queuedDispatch &&
      !enqueue) {
      this.queuedDispatches.assertAvailable(sessionId)
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
    if (
      delivery?.closed || this.stopping || this.deletingSessions.has(sessionId) ||
      this.suspendingSessions.has(sessionId) || this.store.get(sessionId)?.suspended
    ) throw queueConflict('This dispatch attempt has ended.')
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
    const userId = randomUUID()
    const assistantId = randomUUID()
    const running = await preparePrompt(
      this.store, sessionId, content, userId, assistantId,
      (current) => {
        if (this.stopping || this.deletingSessions.has(sessionId)) {
          throw queueConflict('This dispatch attempt has ended.')
        }
        if (current.suspended || this.suspendingSessions.has(sessionId)) {
          throw queueConflict('Resume the session before sending to it')
        }
        if (
          this.active.has(sessionId) || current.status === 'running' ||
          current.status === 'waiting' || current.pendingPermission || current.pendingUserInput
        ) throw queueConflict('Claude Agent is already running; queue this message instead')
      },
      delivery,
    )
    if (
      delivery?.closed || this.stopping || this.deletingSessions.has(sessionId) ||
      this.suspendingSessions.has(sessionId) || this.store.get(sessionId)?.suspended
    ) throw queueConflict('This dispatch attempt has ended.')
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
    const starting = new Promise<void>((resolve) => { started = resolve })
    this.startingQueries.set(sessionId, starting)
    this.startedQuery.set(sessionId, started)
    const receipt = delivery ? acceptanceReceipt() : undefined
    const stopReceipt = () => receipt?.reject(new Error('Claude is stopping before delivery confirmation.'))
    if (receipt) this.queueReceiptStops.set(sessionId, stopReceipt)
    const run = this.runQuery(sessionId, content, assistantId, delivery, receipt).catch((error) => {
      console.warn(
        `Claude turn for ${sessionId} ended in an unreported failure:`,
        error,
      )
    })
    this.queryRuns.add(run)
    void run.finally(() => this.queryRuns.delete(run))
    if (receipt) {
      try {
        await receipt.promise
      } finally {
        receipt.dispose()
        if (this.queueReceiptStops.get(sessionId) === stopReceipt) this.queueReceiptStops.delete(sessionId)
      }
    }
    return this.store.get(sessionId) || running
  }

  async listCommands(_sessionId: string): Promise<SlashCommand[]> {
    return []
  }

  private resourceContext(sessionId: string) {
    if (this.stopping) throw new SessionResourceError('stopped')
    const session = this.store.get(sessionId)
    if (!session) throw new SessionResourceError('missing')
    if (session.provider !== 'claude') throw new SessionResourceError('changed')
    let observation = this.resourceObservations.get(sessionId)
    if (observation && !observation.isCurrent()) {
      this.resourceObservations.delete(sessionId)
      observation = undefined
    }
    const active = this.active.get(sessionId)
    const ownsSession = this.store.captureOwnership(sessionId)
    const epoch = this.resourceEpoch
    const assertCurrent = () => {
      if (this.stopping || epoch !== this.resourceEpoch) throw new SessionResourceError('stopped')
      if (!ownsSession() || this.active.get(sessionId) !== active ||
        this.resourceObservations.get(sessionId) !== observation ||
        this.lifecycleLocks.has(sessionId) || this.deletingSessions.has(sessionId) ||
        this.suspendingSessions.has(sessionId) ||
        (observation && !observation.isCurrent()) ||
        (active && observation?.owner !== active.resourceOwner)) {
        throw new SessionResourceError('changed')
      }
    }
    assertCurrent()
    return { observation, active, assertCurrent }
  }

  async listSkills(sessionId: string): Promise<SessionSkillsSnapshot> {
    const { observation, active, assertCurrent } = this.resourceContext(sessionId)
    if (observation?.invalidSkills) throw new SessionResourceError('invalid')
    if (!observation?.skills) return unavailableSkills(sessionId, 'claude', resourceMessages.unreported)
    let snapshot = observation.skills
    if (active && snapshot.skills.length && typeof active.query.supportedCommands === 'function') {
      try {
        const commands = await active.query.supportedCommands()
        assertCurrent()
        snapshot = {
          ...snapshot,
          skills: enrichClaudeSkills(snapshot.skills, commands),
          capturedAt: new Date().toISOString(),
        }
        observation.skills = snapshot
      } catch (error) {
        assertCurrent()
        if (!isResourceMethodUnavailable(error)) throw safeResourceError(error)
      }
    }
    return sanitizeSkillsSnapshot({
      ...snapshot,
      scope: active ? 'session' : 'last-known',
      message: active ? undefined : resourceMessages.lastKnown,
    }, sessionId, 'claude')
  }

  async listMcpServers(sessionId: string): Promise<SessionMcpServersSnapshot> {
    const { observation, active, assertCurrent } = this.resourceContext(sessionId)
    if (active && typeof active.query.mcpServerStatus === 'function') {
      try {
        const servers = await active.query.mcpServerStatus()
        assertCurrent()
        const snapshot = mcpSnapshot(sessionId, 'claude', 'session', claudeMcp(servers))
        if (observation) {
          observation.mcp = snapshot
          observation.invalidMcp = false
        }
        return snapshot
      } catch (error) {
        assertCurrent()
        if (!isResourceMethodUnavailable(error)) throw safeResourceError(error)
      }
    }
    if (observation?.invalidMcp) throw new SessionResourceError('invalid')
    if (!observation?.mcp) return unavailableMcp(sessionId, 'claude', resourceMessages.unreported)
    return sanitizeMcpSnapshot({
      ...observation.mcp,
      scope: active ? 'session' : 'last-known',
      message: active ? undefined : resourceMessages.lastKnown,
    }, sessionId, 'claude')
  }

  private observeResourceInit(
    sessionId: string,
    owner: ActiveClaudeQuery,
    message: Extract<SDKMessage, { type: 'system'; subtype: 'init' }>,
  ): void {
    const previous = this.resourceObservations.get(sessionId)
    if (this.stopping || this.active.get(sessionId) !== owner ||
      previous?.owner !== owner.resourceOwner || !previous.isCurrent() ||
      this.deletingSessions.has(sessionId)) return
    const observation: ClaudeResources = {
      owner: previous.owner, isCurrent: previous.isCurrent,
    }
    this.resourceObservations.set(sessionId, observation)
    const capturedAt = new Date().toISOString()
    if (message.session_id !== sessionId || message.cwd !== this.store.get(sessionId)?.cwd) {
      observation.invalidSkills = true
      observation.invalidMcp = true
      return
    }
    // Init is observed as part of an existing turn. Bad metadata belongs to the
    // resource view, never to the inference error path or the session store.
    if (message.skills !== undefined) {
      try {
        observation.skills = skillsSnapshot(sessionId, 'claude', 'session', claudeSkillNames(message.skills), capturedAt)
      } catch {
        observation.invalidSkills = true
      }
    }
    if (message.mcp_servers !== undefined) {
      try {
        observation.mcp = mcpSnapshot(sessionId, 'claude', 'session', claudeMcp(message.mcp_servers), capturedAt)
      } catch {
        observation.invalidMcp = true
      }
    }
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
    this.resourceObservations.delete(sessionId)
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
    this.queueReceiptStops.get(sessionId)?.()
    try {
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
    const updated = await this.store.clearPendingRequest(
      sessionId, 'pendingPermission', requestId, { status: 'running', activity: 'Continuing' },
    )
    this.publish(updated)
    return this.queuedDispatches.view(updated)
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
    delivery?: QueuedDelivery,
    receipt?: ReturnType<typeof acceptanceReceipt>,
  ): Promise<void> {
    const session = this.requireSession(sessionId)
    const ownsResources = this.store.captureOwnership(sessionId)
    const resourceEpoch = this.resourceEpoch
    const abortController = new AbortController()
    // This run's own entry, so cleanup cannot remove a newer one.
    let owned: ActiveClaudeQuery | undefined
    const runtime = session.runtime
    const toolIds = new Set<string>()
    const starting = this.startingQueries.get(sessionId)
    const started = this.startedQuery.get(sessionId)
    const settleStarting = () => {
      started?.()
      if (this.startingQueries.get(sessionId) === starting) this.startingQueries.delete(sessionId)
      if (this.startedQuery.get(sessionId) === started) this.startedQuery.delete(sessionId)
    }
    const accept = () => {
      delivery?.accept()
      receipt?.resolve()
    }
    let aborted = false
    try {
      const hasProviderSession = Boolean(
        await this.sdk.getSessionInfo(sessionId, { dir: session.cwd }),
      )
      if (this.stopping) {
        abortController.abort()
        throw new Error('Agentic Remote is shutting down')
      }
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        throw queueConflict('The session stopped before dispatch.')
      }
      delivery?.submit()
      const activeQuery = this.sdk.query({
        prompt,
        options: {
          abortController,
          allowDangerouslySkipPermissions:
            runtime?.allowAllPermissions === true,
          canUseTool: (toolName, input) => {
            accept()
            return this.canUseTool(sessionId, toolName, input)
          },
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
        resourceOwner: Symbol(),
        done,
        finish,
      }
      owned = entry
      this.active.set(sessionId, entry)
      this.resourceObservations.set(sessionId, {
        owner: entry.resourceOwner,
        isCurrent: () => ownsResources() && resourceEpoch === this.resourceEpoch && !this.stopping,
      })
      settleStarting()
      for await (const message of activeQuery) {
        if (this.stopping || !this.store.get(sessionId)) {
          return
        }
        if (
          message.type === 'stream_event' || message.type === 'user' ||
          (message.type === 'assistant' && !message.error) ||
          (message.type === 'result' && message.subtype === 'success' && !message.is_error)
        ) accept()
        if (message.type === 'system' && message.subtype === 'init') {
          this.observeResourceInit(sessionId, entry, message)
        } else {
          await this.handleMessage(sessionId, assistantId, message, toolIds)
        }
      }
      if (delivery && !delivery.accepted) {
        throw new Error('Claude ended without confirming that it accepted the prompt.')
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
      receipt?.reject(error)
      if (this.stopping || (delivery && !delivery.accepted &&
        (!delivery.submitted || explicitlyRefused(error)))) {
        return
      }
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
      settleStarting()
      if (!delivery || delivery.submitted) this.resolvePending(sessionId, 'Claude Agent stopped')
      if (!this.stopping && !aborted && (!delivery || delivery.accepted)) {
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
    if (this.stopping) {
      return Promise.resolve({
        behavior: 'deny',
        message: 'Agentic Remote is shutting down',
      })
    }
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

  async dispatchQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<QueuedPromptDispatchResult> {
    const result = await this.drainQueue(sessionId, { promptId, content })
    if (!result) throw queueConflict('The named queued prompt was not dispatched.')
    return result
  }

  private async drainQueue(
    sessionId: string,
    target?: QueuedDispatchTarget,
  ): Promise<QueuedPromptDispatchResult | undefined> {
    if (this.stopping || this.drainingSessions.has(sessionId)) {
      if (target) throw queueConflict('The queue is already dispatching. Your rewrite was not sent.')
      return undefined
    }
    const alreadyClosed = this.admissionClosed.has(sessionId)
    if (target && alreadyClosed) throw queueConflict('The session is still resuming.')
    this.drainingSessions.add(sessionId)
    this.admissionClosed.add(sessionId)
    const releaseDispatch = this.holdDispatch(sessionId)
    let admitted = () => {}
    const admission = new Promise<void>((resolve) => { admitted = resolve })
    this.admittingSends.set(sessionId, [
      ...(this.admittingSends.get(sessionId) || []), admission,
    ])
    let result: QueuedPromptDispatchResult | undefined
    try {
      result = await this.serializeQueue(sessionId, () => this.drainSerialized(sessionId, target))
      if (result && result.outcome !== 'sent') {
        this.emit('event', { type: 'error', sessionId, message: result.message || 'Queued dispatch failed' })
      }
    } catch (error) {
      if (target) throw error
      this.emit('event', {
        type: 'error', sessionId,
        message: error instanceof Error ? error.message : String(error),
      })
    } finally {
      this.drainingSessions.delete(sessionId)
      if (!alreadyClosed) this.admissionClosed.delete(sessionId)
      releaseDispatch()
      admitted()
      this.admittingSends.set(sessionId,
        (this.admittingSends.get(sessionId) || []).filter((entry) => entry !== admission))
    }
    const remaining = this.store.get(sessionId)
    if (
      !this.stopping && result?.outcome === 'sent' && remaining?.queuedPrompts?.length &&
      remaining.status === 'idle' && !remaining.queuedDispatch && !this.active.has(sessionId)
    ) void this.drainQueue(sessionId)
    return result
  }

  private async drainSerialized(
    sessionId: string,
    target?: QueuedDispatchTarget,
  ): Promise<QueuedPromptDispatchResult | undefined> {
    const session = await this.store.readAfterWrites(sessionId)
    if (!target && (
      session.queuedDispatch || session.status !== 'idle' || session.suspended ||
      session.failedPrompt || !session.queuedPrompts?.length ||
      this.suspendingSessions.has(sessionId)
    )) return undefined
    return this.queuedDispatches.run(
      sessionId, target,
      async (content, command) => this.normalizeQueuedContent(content, command),
      (prompt, delivery) => this.dispatchQueued(sessionId, prompt.content, false, true, delivery),
      (current) => {
        if (
          this.stopping || this.deletingSessions.has(sessionId) ||
          this.suspendingSessions.has(sessionId) || current.suspended ||
          (target && !current.isOpen) ||
          current.status !== 'idle' || current.failedPrompt ||
          current.pendingPermission || current.pendingUserInput || this.active.has(sessionId)
        ) throw queueConflict('Claude must be idle and available before this queued edit can be sent.')
      },
    )
  }

  private async serializeQueue<T>(sessionId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.queueOperations.get(sessionId) || Promise.resolve()
    const current = previous.catch(() => undefined).then(operation)
    this.queueOperations.set(sessionId, current)
    try {
      return await current
    } finally {
      if (this.queueOperations.get(sessionId) === current) this.queueOperations.delete(sessionId)
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
    this.assertNotStopping()
    if (!this.available) {
      throw new Error(this.unavailableReason)
    }
  }

  private assertNotStopping(): void {
    if (this.stopping) {
      throw Object.assign(new Error('Agentic Remote is shutting down'), {
        statusCode: 503,
      })
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
    this.queuedDispatches.assertAvailable(id)
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
    this.emit('event', { type: 'session.upserted', session: this.queuedDispatches.view(session) })
  }

  private async validateDirectory(inputPath: string): Promise<string> {
    return validateSessionDirectory(inputPath)
  }
}
