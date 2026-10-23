import { EventEmitter } from 'node:events'
import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'
import type {
  ComputerSummary,
  CreateSessionInput,
  ManagedSession,
  PermissionReplyInput,
  RenameSessionInput,
  RuntimeReasoningEffort,
  SendMessageInput,
  UserInputReplyInput,
} from '../shared/contracts.js'
import type { OracleResponseStyle } from '../shared/settings-profile.js'
import {
  MANAGER_MESSAGE_MAX_LENGTH,
  MANAGER_SNAPSHOT_MESSAGES,
  type ManagerClientDefaults,
  type ManagerEvent,
  type ManagerMessage,
  type ManagerSessionBackend,
  type ManagerSettings,
  type ManagerSettingsSnapshot,
  type ManagerSnapshot,
  type ManagerStatus,
  type UpdateManagerSettingsInput,
} from '../shared/manager.js'
import {
  buildTurnContext,
  managerPrompt,
  MANAGER_SYSTEM_PROMPT,
  MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT,
  recoveryBrief,
} from './manager-context.js'
import type { JournalRecorder } from './manager-journal.js'
import type { ManagerStore } from './manager-store.js'
import {
  formatStructuredMemoryContext,
} from './manager-structured-memory-search.js'
import type { ManagerStructuredMemoryRuntime } from './manager-structured-memory-runtime.js'
import {
  hasExplicitStructuredMemoryIntent,
} from './manager-structured-memory-intent.js'
import type {
  ManagerStructuredMemoryScope,
  ManagerStructuredMemoryStatus,
} from '../shared/manager-structured-memory.js'
import {
  createManagerTools,
  type ManagerSkillSummary,
  type ManagerTool,
  type ManagerToolActivity,
  type ManagerToolHost,
} from './manager-tools.js'

/** The hub operations the manager acts through. ComputerManager provides them. */
export interface ManagerHub {
  listComputers(): ComputerSummary[]
  findComputer(nameOrId: string): ComputerSummary | undefined
  listSessionsWithAuthority(): Promise<{ sessions: ManagedSession[]; answeredComputerIds: string[] }>
  listSessions(): Promise<ManagedSession[]>
  listHistory(): Promise<ManagedSession[]>
  /** A session as recorded, never opened or resumed, so reading cannot change it. */
  readSession(computerId: string, sessionId: string): Promise<ManagedSession>
  askSession(computerId: string, sessionId: string, question: string): Promise<string>
  /** The folder as an absolute path on that computer, or an error saying why it cannot hold sessions. */
  validateSessionDirectory(computerId: string, path: string): Promise<string>
  createSession(computerId: string, input: CreateSessionInput): Promise<ManagedSession>
  renameSession(computerId: string, sessionId: string, input: RenameSessionInput): Promise<ManagedSession>
  sendMessage(computerId: string, sessionId: string, input: SendMessageInput): Promise<ManagedSession>
  replyPermission(computerId: string, sessionId: string, requestId: string, input: PermissionReplyInput): Promise<ManagedSession>
  replyUserInput(computerId: string, sessionId: string, requestId: string, input: UserInputReplyInput): Promise<ManagedSession>
  /** Opens a closed session again. */
  activateSession(computerId: string, sessionId: string): Promise<ManagedSession>
  resumeSession(computerId: string, sessionId: string): Promise<ManagedSession>
  cancel(computerId: string, sessionId: string): Promise<void>
  deleteSession(computerId: string, sessionId: string): Promise<void>
}

/** An SDK event, narrowed to the fields the manager reads. */
export interface ManagerSdkEvent {
  type: string
  agentId?: string
  data?: {
    content?: string
    deltaContent?: string
    messageId?: string
    parentToolCallId?: string
    message?: string
    errorType?: string
  }
}

export interface ManagerSdkSession {
  sessionId: string
  /** Set by the SDK once the runtime connection is gone. */
  readonly disconnected?: boolean
  on(handler: (event: ManagerSdkEvent) => void): () => void
  send(options: { prompt: string }): Promise<string>
  abort(): Promise<void>
  disconnect(): Promise<void>
  rpc?: {
    model?: {
      switchTo(params: { modelId: string; reasoningEffort?: RuntimeReasoningEffort }): Promise<unknown>
    }
  }
}

export interface ManagerSdkSessionConfig {
  sessionId?: string
  clientName: string
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
  streaming: boolean
  workingDirectory: string
  systemMessage: { mode: 'append'; content: string }
  tools: ManagerTool[]
  availableTools: string[]
  enableSkills: boolean
  onPermissionRequest: () => { kind: 'user-not-available' }
}

export interface ManagerSdkClient {
  start(): Promise<void>
  stop(): Promise<Error[]>
  createSession(config: ManagerSdkSessionConfig): Promise<ManagerSdkSession>
  resumeSession(sessionId: string, config: Omit<ManagerSdkSessionConfig, 'sessionId'>): Promise<ManagerSdkSession>
  deleteSession(sessionId: string): Promise<void>
  ping?(message?: string): Promise<unknown>
  rpc?: {
    skills?: {
      discover(params: { projectPaths?: string[] }): Promise<{ skills: Array<{ name: string; description?: string; source?: string; enabled?: boolean }> }>
    }
  }
}

export interface ManagerAgentOptions {
  store: ManagerStore
  recorder: JournalRecorder
  hub: ManagerHub
  clientFactory: () => ManagerSdkClient
  /** Keeps SDK sessions out of the session lists before they exist. */
  excludeFromDiscovery?: (ids: string[]) => void
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
  turnTimeoutMs?: number
  retryDelaysMs?: number[]
  idleStopMs?: number
  operationTimeoutMs?: number
  /** How often a running turn checks that its runtime is still there. */
  livenessIntervalMs?: number
  /** How long an idle that arrives before any activity waits to be believed. */
  earlyIdleMs?: number
  sessionIdFactory?: () => string
  now?: () => Date
  /** The user's response style, read as each turn's prompt is built. */
  responseStyle?: () => OracleResponseStyle | undefined
  structuredMemory?: ManagerStructuredMemoryRuntime
}

class TurnError extends Error {
  constructor(message: string, readonly kind: 'timeout' | 'runtime' | 'transport' | 'cancelled') {
    super(message)
    this.name = 'TurnError'
  }
}

type Rung = 'same' | 'restart' | 'fresh'

const KNOWN_SDK_SESSION_LIMIT = 200
/** Events that show a turn is under way, as opposed to leftovers of the one before. */
const TURN_ACTIVITY = new Set([
  'user.message',
  'assistant.turn_start',
  'assistant.intent',
  'assistant.message_delta',
  'assistant.message',
  'tool.execution_start',
])
const SKILL_CACHE_MS = 5 * 60 * 1000

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** A session that is already gone, which is what closing it was for. */
function isNotFound(error: unknown): boolean {
  const statusCode = typeof error === 'object' && error !== null ? Reflect.get(error, 'statusCode') : undefined
  return statusCode === 404 || /not found/i.test(errorMessage(error))
}

/** A message Oracle can take: not blank, and within the limit. */
function checkContent(content: string): void {
  if (!content.trim()) {
    throw Object.assign(new Error('Type a message first.'), { statusCode: 400 })
  }
  if (content.length > MANAGER_MESSAGE_MAX_LENGTH) {
    throw Object.assign(
      new Error(`Messages are limited to ${MANAGER_MESSAGE_MAX_LENGTH.toLocaleString('en-US')} characters.`),
      { statusCode: 413 },
    )
  }
}

function isQueued(message: ManagerMessage): boolean {
  return message.role === 'user' && message.state === 'queued'
}

function isPending(message: ManagerMessage): boolean {
  return message.role === 'user' && (message.state === 'queued' || message.state === 'running')
}

function sameRuntime(left: ManagerSettings, right: ManagerSettings): boolean {
  return (left.model ?? undefined) === (right.model ?? undefined)
    && (left.reasoningEffort ?? undefined) === (right.reasoningEffort ?? undefined)
}

function hash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}

function withTimeout<T>(work: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return Promise.race([
    work,
    new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new TurnError(message, 'timeout')), ms)
      timer.unref?.()
    }),
  ]).finally(() => clearTimeout(timer))
}

const delay = (ms: number) => new Promise<void>((resolve) => {
  const timer = setTimeout(resolve, ms)
  timer.unref?.()
})

/**
 * The session manager agent's runtime: one persistent Copilot SDK
 * conversation in a runtime process of its own, fed from a durable queue.
 *
 * A message is never refused for the manager's state. Each turn runs alone
 * under a watchdog, and a failed turn climbs a recovery ladder: retry on the
 * same SDK session, restart the runtime and resume it, then move to a new SDK
 * session briefed from memory and the transcript. Only when every rung fails
 * is the message marked failed, with Retry, and the next message starts over.
 */
export class ManagerAgent extends EventEmitter<{ event: [ManagerEvent] }> {
  private readonly store: ManagerStore
  private readonly recorder: JournalRecorder
  private readonly hub: ManagerHub
  private readonly clientFactory: () => ManagerSdkClient
  private readonly excludeFromDiscovery: (ids: string[]) => void
  private readonly model?: string
  private readonly reasoningEffort?: RuntimeReasoningEffort
  private readonly responseStyle: () => OracleResponseStyle | undefined
  private readonly turnTimeoutMs: number
  private readonly retryDelaysMs: number[]
  private readonly idleStopMs: number
  private readonly operationTimeoutMs: number
  private readonly livenessIntervalMs: number
  private readonly earlyIdleMs: number
  private readonly sessionIdFactory: () => string
  private readonly now: () => Date
  private readonly structuredMemory?: ManagerStructuredMemoryRuntime
  private readonly tools: ManagerTool[]
  private client?: ManagerSdkClient
  private session?: ManagerSdkSession
  private status: ManagerStatus = 'idle'
  private lastError?: string
  private running?: { messageId: string; cancel: () => void }
  /** Bumped by Start over; work for an earlier conversation stores nothing. */
  private epoch = 0
  private pumping = false
  private started = false
  private stopped = false
  private idleTimer?: ReturnType<typeof setTimeout>
  private streaming?: { messageId: string; content: string }
  private deltaTimer?: ReturnType<typeof setTimeout>
  private currentReplyTo?: string
  private attemptActivities: string[] = []
  private needsMemoryIndex = false
  private needsBrief = false
  private skillCache?: { at: number; key: string; skills: ManagerSkillSummary[] }
  /** Your model choice changed since the conversation's runtime was set up. */
  /** The message being answered asked for an answer only. */
  private currentAnswerOnly = false
  private pendingAcknowledgement?: { journalSeq: number; memoryHash?: string; notesShown: number }
  /** The turn being answered, settled once its outcome is stored. */
  private processing?: Promise<void>
  /** Set when Stop arrives between recovery attempts, when no turn is running. */
  private cancelledMessageId?: string
  /** The defaults each waiting message was sent with, while structured memory is enabled. */
  private readonly messageDefaults = new Map<string, ManagerClientDefaults | undefined>()
  /** Structured-memory scopes and authority fixed when the current turn started. */
  private turnStructuredMemory?: {
    messageId: string
    content: string
    scopes: ManagerStructuredMemoryScope[]
  }

  constructor(options: ManagerAgentOptions) {
    super()
    this.store = options.store
    this.recorder = options.recorder
    this.hub = options.hub
    this.clientFactory = options.clientFactory
    this.excludeFromDiscovery = options.excludeFromDiscovery ?? (() => undefined)
    this.model = options.model
    this.reasoningEffort = options.reasoningEffort
    this.responseStyle = options.responseStyle ?? (() => undefined)
    this.turnTimeoutMs = options.turnTimeoutMs ?? 15 * 60 * 1000
    this.retryDelaysMs = options.retryDelaysMs ?? [1000, 4000]
    this.idleStopMs = options.idleStopMs ?? 10 * 60 * 1000
    this.operationTimeoutMs = options.operationTimeoutMs ?? 60_000
    this.livenessIntervalMs = options.livenessIntervalMs ?? 2000
    this.earlyIdleMs = options.earlyIdleMs ?? 10_000
    this.sessionIdFactory = options.sessionIdFactory ?? randomUUID
    this.now = options.now ?? (() => new Date())
    this.structuredMemory = options.structuredMemory
    this.tools = createManagerTools(this.toolHost(), (activity) => this.recordActivity(activity))
  }

  structuredMemoryStatus(): ManagerStructuredMemoryStatus {
    return this.structuredMemory?.status() ?? {
      mode: 'off',
      availability: 'disabled',
    }
  }

  /** Every SDK session ID that must stay out of the session lists. */
  hiddenSessionIds(): string[] {
    const state = this.store.state()
    return [...new Set([...(state.sdkSessionId ? [state.sdkSessionId] : []), ...state.knownSdkSessionIds])]
  }

  async start(): Promise<void> {
    if (this.started) return
    this.started = true
    this.excludeFromDiscovery(this.hiddenSessionIds())
    try {
      await this.recoverQueue()
    } catch (error) {
      // A manager that cannot restore its queue still answers new messages,
      // and never keeps the hub from starting.
      console.error('Manager could not restore its queue:', error)
    }
    for (const message of this.store.messages()) {
      if (message.confirmation?.state === 'closing') void this.finishClosing(message)
    }
    if (!this.store.state().baselineAt) void this.takeBaseline()
    void this.pump()
  }

  private async recoverQueue(): Promise<void> {
    const state = this.store.state()
    const interruptions = { ...(state.interruptions ?? {}) }
    for (const message of this.store.messages()) {
      if (message.role !== 'user' || message.state !== 'running') continue
      const count = (interruptions[message.id] ?? 0) + 1
      interruptions[message.id] = count
      // Retried once; a second interruption hands it back to you.
      if (count > 1) {
        delete interruptions[message.id]
        await this.updateMessage({
          ...message,
          state: 'failed',
          error: 'Interrupted by restarts more than once. Press Retry when you are ready.',
        })
      } else {
        await this.updateMessage({ ...message, state: 'queued' })
      }
    }
    await this.store.updateState((next) => {
      next.interruptions = interruptions
    })
  }

  /** Records the sessions that exist on a first start, so they are not reported as new. */
  private async takeBaseline(): Promise<void> {
    try {
      const listing = await withTimeout(this.hub.listSessionsWithAuthority(), 30_000, 'Listing sessions took too long')
      if (!this.store.state().baselineAt) {
        await this.recorder.reconcile(listing.sessions, listing.answeredComputerIds)
      }
    } catch (error) {
      console.warn('Manager could not record the existing sessions yet:', errorMessage(error))
    }
  }

  async stop(): Promise<void> {
    this.stopped = true
    this.clearIdleTimer()
    if (this.deltaTimer) clearTimeout(this.deltaTimer)
    // The running message stays "running", so the next start resumes it.
    const session = this.session
    this.session = undefined
    if (session) {
      await withTimeout(session.abort(), 5000, 'abort').catch(() => undefined)
      await withTimeout(session.disconnect(), 5000, 'disconnect').catch(() => undefined)
    }
    await this.stopClient()
    await this.recorder.stop()
    await this.store.flush()
  }

  snapshot(): ManagerSnapshot {
    const messages = this.store.messages()
    const recent = messages.slice(-MANAGER_SNAPSHOT_MESSAGES)
    // However long the queue, every waiting message, and the one being
    // answered, is listed, so each can be seen and removed after a reload.
    const olderPending = messages.slice(0, messages.length - recent.length).filter(isPending)
    return {
      available: true,
      status: this.status,
      messages: [...olderPending, ...recent],
      queued: messages.filter(isQueued).length,
      managedSessions: this.recorder.managedSessions(),
      ...(this.lastError ? { lastError: this.lastError } : {}),
      ...(this.streaming ? { streaming: { ...this.streaming } } : {}),
      settings: this.settingsSnapshot(),
    }
  }

  settingsSnapshot(): ManagerSettingsSnapshot {
    const settings = this.store.state().settings ?? {}
    return {
      ...(settings.model ? { model: settings.model } : {}),
      ...(settings.model && settings.reasoningEffort ? { reasoningEffort: settings.reasoningEffort } : {}),
      ...(this.model ? { defaultModel: this.model } : {}),
      ...(this.reasoningEffort ? { defaultReasoningEffort: this.reasoningEffort } : {}),
      ...(this.modelFallback() ? { modelUnavailable: true } : {}),
      ...(this.store.state().sessionFolders ? { sessionFolders: { ...this.store.state().sessionFolders } } : {}),
      sessionBackend: this.sessionBackend(),
    }
  }

  /** How Oracle opens the sessions it starts. */
  sessionBackend(): ManagerSessionBackend {
    return this.store.state().sessionBackend === 'terminal' ? 'terminal' : 'sdk'
  }

  /** Chooses Oracle's model and effort; it applies from the next answer. */
  async updateSettings(input: UpdateManagerSettingsInput): Promise<ManagerSettingsSnapshot> {
    // Checked before anything is saved, so a folder that is refused changes nothing.
    const folders = input.sessionFolders ? await this.resolveFolders(input.sessionFolders) : undefined
    const before = this.runtime()
    await this.store.updateState((state) => {
      if (input.model !== undefined) {
        const model = input.model?.trim() || undefined
        const reasoningEffort = model ? input.reasoningEffort ?? undefined : undefined
        state.settings = {
          ...(model ? { model } : {}),
          ...(reasoningEffort ? { reasoningEffort } : {}),
        }
      }
      if (folders) {
        const next = { ...state.sessionFolders }
        for (const [computerId, folder] of Object.entries(folders)) {
          if (folder) next[computerId] = folder
          else delete next[computerId]
        }
        if (Object.keys(next).length) state.sessionFolders = next
        else delete state.sessionFolders
      }
      // Only a terminal is kept, so the default stays the Copilot SDK.
      if (input.sessionBackend === 'terminal') state.sessionBackend = 'terminal'
      else if (input.sessionBackend === 'sdk') delete state.sessionBackend
    })
    // A new choice is tried afresh. The next answer compares it with what
    // the conversation runs on, so nothing in flight can lose it.
    if (!sameRuntime(before, this.runtime())) {
      await this.store.updateState((state) => {
        delete state.unavailableRuntime
      })
    }
    const settings = this.settingsSnapshot()
    this.emit('event', { type: 'manager.settings', settings })
    return settings
  }

  /** Each folder as validated on its computer; undefined returns it to the default. */
  private async resolveFolders(input: Record<string, string | null>): Promise<Record<string, string | undefined>> {
    const resolved: Record<string, string | undefined> = {}
    const unpaired = () => Object.assign(new Error('That computer is not paired with this hub.'), { statusCode: 404 })
    for (const [computerId, folder] of Object.entries(input)) {
      const paired = this.hub.listComputers().some((computer) => computer.id === computerId)
      if (folder === null) {
        // A folder kept for a computer since unpaired can still be removed.
        if (!paired && !this.store.state().sessionFolders?.[computerId]) throw unpaired()
        resolved[computerId] = undefined
        continue
      }
      const path = folder.trim()
      if (!path) {
        throw Object.assign(new Error('Choose a folder, or clear it to use the default.'), { statusCode: 400 })
      }
      if (!paired) throw unpaired()
      resolved[computerId] = await this.hub.validateSessionDirectory(computerId, path)
    }
    return resolved
  }

  /** The model and effort in effect: your choice, else the hub default. */
  private runtime(): { model?: string; reasoningEffort?: RuntimeReasoningEffort } {
    const settings = this.store.state().settings
    if (settings?.model) return { model: settings.model, reasoningEffort: settings.reasoningEffort }
    return { model: this.model, reasoningEffort: this.reasoningEffort }
  }

  /** Whether the model in effect could not start, so Copilot's default answers. */
  private modelFallback(): boolean {
    const unavailable = this.store.state().unavailableRuntime
    return unavailable !== undefined && sameRuntime(unavailable, this.runtime())
  }

  /** What the conversation should run on now. */
  private target(): ManagerSettings {
    return this.modelFallback() ? {} : this.runtime()
  }

  async send(
    content: string,
    defaults?: ManagerClientDefaults,
    options: { answerOnly?: boolean } = {},
  ): Promise<ManagerMessage> {
    checkContent(content)
    // Read before any await, so an overlapping send cannot change them first.
    const sentWith = defaults ?? this.store.state().defaults
    if (defaults) {
      await this.store.updateState((state) => {
        state.defaults = defaults
      })
    }
    const timestamp = this.now().toISOString()
    const message: ManagerMessage = {
      id: randomUUID(),
      role: 'user',
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      state: 'queued',
      ...(options.answerOnly ? { answerOnly: true } : {}),
    }
    if (this.structuredMemoryEnabled()) {
      this.messageDefaults.set(message.id, sentWith)
    }
    try {
      await this.updateMessage(message)
    } catch (error) {
      // A message held in memory still runs, so it keeps the defaults it was sent with.
      if (!this.store.message(message.id)) this.messageDefaults.delete(message.id)
      throw error
    }
    this.publishStatus()
    void this.pump()
    return message
  }

  /**
   * Rewrites a waiting message where it stands: the same message, in the same
   * place in the queue, with new words. Once Oracle has started on it, even
   * if a restart interrupted that, it is no longer the user's to change.
   */
  async editQueued(messageId: string, content: string): Promise<ManagerMessage> {
    const message = this.store.message(messageId)
    if (!message || message.role !== 'user') {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 })
    }
    const started = message.state === 'running'
      || message.startedAt !== undefined
      || (this.store.state().interruptions ?? {})[messageId] !== undefined
    if (message.state !== 'queued' || started) {
      throw Object.assign(
        new Error(started
          ? 'Oracle has already started on this message, so it can no longer be edited.'
          : 'This message is no longer waiting, so it can no longer be edited.'),
        { statusCode: 409 },
      )
    }
    const text = content.trim()
    checkContent(text)
    const next: ManagerMessage = { ...message, content: text, updatedAt: this.now().toISOString() }
    await this.updateMessage(next)
    return next
  }

  /** Takes a message out of the queue before Oracle starts on it. */
  async removeQueued(messageId: string): Promise<ManagerMessage> {
    const message = this.store.message(messageId)
    if (!message || message.role !== 'user') {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 })
    }
    if (message.state !== 'queued') {
      throw Object.assign(
        new Error(message.state === 'running'
          ? 'Oracle is already answering this; use Stop instead.'
          : 'This message is no longer waiting.'),
        { statusCode: 409 },
      )
    }
    const next: ManagerMessage = { ...message, state: 'cancelled', updatedAt: this.now().toISOString() }
    await this.updateMessage(next)
    this.messageDefaults.delete(messageId)
    this.publishStatus()
    return next
  }

  async retry(messageId: string): Promise<ManagerMessage> {
    const message = this.store.message(messageId)
    if (!message || message.role !== 'user') {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 })
    }
    if (message.state === 'queued' || message.state === 'running') return message
    const timestamp = this.now().toISOString()
    // A message being retried has been tried, even one from before startedAt
    // was recorded, so it stays the user's no longer to edit.
    const next: ManagerMessage = { ...message, state: 'queued', startedAt: message.startedAt ?? timestamp, updatedAt: timestamp }
    delete next.error
    await this.updateMessage(next)
    this.publishStatus()
    void this.pump()
    return next
  }

  /** Stops the turn being answered. Queued messages still go after it. */
  async cancel(): Promise<void> {
    if (!this.processing) return
    this.cancelledMessageId = this.currentReplyTo
    // A running turn aborts and settles itself; otherwise the next checkpoint
    // in the turn's attempt sees the request.
    this.running?.cancel()
  }

  /** Starts a new conversation. Memory and the journal are kept. */
  async reset(): Promise<void> {
    for (const message of this.store.messages()) {
      if (message.role === 'user' && message.state === 'queued') {
        await this.updateMessage({ ...message, state: 'cancelled' })
        this.messageDefaults.delete(message.id)
      }
    }
    this.epoch += 1
    await this.cancel()
    // Settled before the conversation is cleared; being from an earlier
    // conversation, it stores nothing more.
    await this.processing?.catch(() => undefined)
    this.streaming = undefined
    await this.retireSession()
    await this.store.resetConversation()
    await this.store.updateState((state) => {
      delete state.memoryHashShown
      // Starting over gives a model that could not start another try.
      delete state.unavailableRuntime
    })
    this.lastError = undefined
    this.needsBrief = false
    this.emit('event', { type: 'manager.reset', snapshot: this.snapshot() })
  }

  /** Answers a decision the manager asked of you, such as closing a session. */
  async resolveConfirmation(messageId: string, accept: boolean): Promise<ManagerMessage> {
    const message = this.store.message(messageId)
    const confirmation = message?.confirmation
    if (!message || !confirmation) {
      throw Object.assign(new Error('Confirmation not found'), { statusCode: 404 })
    }
    if (confirmation.state !== 'pending') {
      throw Object.assign(new Error('This was already answered'), { statusCode: 409 })
    }
    if (!accept) {
      const next: ManagerMessage = {
        ...message,
        updatedAt: this.now().toISOString(),
        confirmation: { ...confirmation, state: 'declined' },
      }
      await this.updateMessage(next)
      await this.addNote(`The user declined closing "${confirmation.title}" (${confirmation.sessionId}); it stays open.`)
      return next
    }
    // Recorded before the deletion: a second answer is refused, and a restart
    // in between finishes the deletion instead of claiming it happened.
    const closing: ManagerMessage = {
      ...message,
      updatedAt: this.now().toISOString(),
      confirmation: { ...confirmation, state: 'closing' },
    }
    await this.updateMessage(closing)
    return this.finishClosing(closing)
  }

  /** Deletes a session you confirmed closing, and records how it went. */
  private async finishClosing(message: ManagerMessage): Promise<ManagerMessage> {
    const confirmation = message.confirmation!
    const name = `"${confirmation.title}" (${confirmation.sessionId})`
    let next: ManagerMessage
    let note: string
    try {
      await this.hub.deleteSession(confirmation.computerId, confirmation.sessionId).catch((error: unknown) => {
        // Deleted already, as when a restart came between the deletion and
        // recording it, or the session was closed elsewhere meanwhile.
        if (!isNotFound(error)) throw error
      })
      next = { ...message, updatedAt: this.now().toISOString(), confirmation: { ...confirmation, state: 'confirmed' } }
      note = `The user confirmed closing ${name}; it is deleted.`
    } catch (error) {
      next = {
        ...message,
        updatedAt: this.now().toISOString(),
        confirmation: { ...confirmation, state: 'failed', error: errorMessage(error) },
      }
      note = `Closing ${name} failed: ${errorMessage(error)}.`
    }
    try {
      await this.updateMessage(next)
      await this.addNote(note)
    } catch (error) {
      console.warn('Could not record the outcome of closing a session:', error)
    }
    if (next.confirmation?.state === 'confirmed') {
      this.emit('event', { type: 'manager.sessions', managedSessions: this.recorder.managedSessions() })
    }
    return next
  }

  private async addNote(note: string): Promise<void> {
    await this.store.updateState((state) => {
      state.pendingNotes = [...(state.pendingNotes ?? []), note].slice(-20)
    })
  }

  private async requestCloseConfirmation(session: ManagedSession, reason?: string): Promise<void> {
    this.attemptActivities.push(`Asked to close "${session.title}"`)
    await this.updateMessage({
      id: randomUUID(),
      role: 'activity',
      content: reason?.trim()
        ? `Close "${session.title}"? ${reason.trim()}`
        : `Close "${session.title}"? This permanently deletes it and its history.`,
      createdAt: this.now().toISOString(),
      tool: 'close_session',
      ...(this.currentReplyTo ? { replyTo: this.currentReplyTo } : {}),
      sessionRefs: [{ computerId: session.computerId, sessionId: session.id, title: session.title }],
      confirmation: {
        kind: 'close-session',
        computerId: session.computerId,
        sessionId: session.id,
        title: session.title,
        state: 'pending',
      },
    })
  }

  private toolHost(): ManagerToolHost {
    const hub = this.hub
    return {
      computers: () => hub.listComputers(),
      findComputer: (nameOrId) => hub.findComputer(nameOrId),
      listSessions: () => hub.listSessions(),
      listHistory: () => hub.listHistory(),
      readSession: (computerId, sessionId) => hub.readSession(computerId, sessionId),
      askSession: (computerId, sessionId, question) => hub.askSession(computerId, sessionId, question),
      createSession: (computerId, input) => hub.createSession(computerId, input),
      renameSession: (computerId, sessionId, title) => hub.renameSession(computerId, sessionId, { title }),
      sendMessage: (computerId, sessionId, content, options) =>
        hub.sendMessage(computerId, sessionId, { content, enqueue: !options?.steer }),
      replyPermission: (computerId, sessionId, requestId, optionId) =>
        hub.replyPermission(computerId, sessionId, requestId, { optionId }),
      replyUserInput: (computerId, sessionId, requestId, input) =>
        hub.replyUserInput(computerId, sessionId, requestId, input),
      reopenSession: (computerId, sessionId) => hub.activateSession(computerId, sessionId),
      resumeSession: (computerId, sessionId) => hub.resumeSession(computerId, sessionId),
      cancel: (computerId, sessionId) => hub.cancel(computerId, sessionId),
      requestCloseConfirmation: (session, reason) => this.requestCloseConfirmation(session, reason),
      discoverSkills: (projectPaths) => this.discoverSkills(projectPaths),
      markManaged: async (session, task) => {
        await this.recorder.markManaged(session, task)
        this.emit('event', { type: 'manager.sessions', managedSessions: this.recorder.managedSessions() })
      },
      registry: () => this.store.registry(),
      answerOnly: () => this.currentAnswerOnly,
      sessionFolders: () => ({ ...this.store.state().sessionFolders }),
      setSessionFolder: async (computerId, folder) =>
        (await this.updateSettings({ sessionFolders: { [computerId]: folder ?? null } })).sessionFolders?.[computerId],
      sessionBackend: () => this.sessionBackend(),
      setSessionBackend: async (backend) => (await this.updateSettings({ sessionBackend: backend })).sessionBackend ?? 'sdk',
      memory: this.store.memory,
      // Shadow must look exactly like off to the model, so only on exposes tools.
      ...(this.structuredMemory?.mode === 'on' && this.structuredMemory.store
        ? {
            structuredMemory: this.structuredMemory.store,
            structuredMemoryScopes: () =>
              this.currentTurnStructuredMemory()?.scopes ?? [],
            authorizeStructuredMemory: (
              operation: 'remember' | 'correct' | 'forget',
            ) => {
              const turn = this.currentTurnStructuredMemory()
              const message = turn
                ? { id: turn.messageId, content: turn.content }
                : undefined
              return {
                allowed: Boolean(
                  message &&
                    hasExplicitStructuredMemoryIntent(
                      message.content,
                      operation,
                    ),
                ),
                ...(message ? { sourceManagerMessageId: message.id } : {}),
              }
            },
          }
        : {}),
      defaults: () => this.store.state().defaults ?? {},
      now: () => this.now(),
    }
  }

  private structuredMemoryEnabled(): boolean {
    return Boolean(
      this.structuredMemory &&
        this.structuredMemory.mode !== 'off' &&
        this.structuredMemory.store,
    )
  }

  private currentTurnStructuredMemory() {
    const turn = this.turnStructuredMemory
    return turn && turn.messageId === this.currentReplyTo ? turn : undefined
  }

  private structuredMemoryScopes(
    defaults: ManagerClientDefaults | undefined,
  ): ManagerStructuredMemoryScope[] {
    const scopes: ManagerStructuredMemoryScope[] = [
      { type: 'global' },
      { type: 'user' },
    ]
    const computerId = defaults?.computerId
    if (!computerId || !this.hub.findComputer(computerId)) return scopes
    scopes.push({ type: 'computer', computerId })
    const folder =
      this.store.state().sessionFolders?.[computerId] ??
      defaults?.folders?.[computerId]
    if (folder && path.isAbsolute(folder)) {
      scopes.push({
        type: 'project',
        computerId,
        projectRoot: path.normalize(folder),
      })
    }
    return scopes
  }

  private async discoverSkills(projectPaths: string[]): Promise<ManagerSkillSummary[]> {
    const key = projectPaths.join('\0')
    if (this.skillCache && this.skillCache.key === key && Date.now() - this.skillCache.at < SKILL_CACHE_MS) {
      return this.skillCache.skills
    }
    const client = await this.ensureClient()
    const discover = client.rpc?.skills?.discover
    if (!discover) return []
    const listing = await withTimeout(discover({ projectPaths }), 30_000, 'Listing skills took too long')
    const skills = listing.skills
      .filter((skill) => skill.enabled !== false)
      .map((skill) => ({ name: skill.name, description: skill.description, source: skill.source }))
    this.skillCache = { at: Date.now(), key, skills }
    return skills
  }

  private recordActivity(activity: ManagerToolActivity): void {
    this.attemptActivities.push(activity.content)
    const timestamp = this.now().toISOString()
    void this.updateMessage({
      id: randomUUID(),
      role: 'activity',
      content: activity.content,
      createdAt: timestamp,
      tool: activity.tool,
      ...(this.currentReplyTo ? { replyTo: this.currentReplyTo } : {}),
      ...(activity.sessionRefs?.length ? { sessionRefs: activity.sessionRefs } : {}),
    }).catch((error: unknown) => console.warn('Could not record manager activity:', error))
  }

  private async pump(): Promise<void> {
    if (this.pumping || this.stopped || !this.started) return
    this.pumping = true
    try {
      for (;;) {
        if (this.stopped) return
        const next = this.store.messages().find((message) => message.role === 'user' && message.state === 'queued')
        if (!next) break
        this.clearIdleTimer()
        this.processing = this.process(next).catch((error: unknown) => this.failUnexpectedly(next, error))
        await this.processing
        this.processing = undefined
      }
      if (this.status !== 'offline') this.setStatus('idle')
      this.scheduleIdleStop()
    } catch (error) {
      // Nothing the manager does may take the hub down with it.
      console.error('Manager queue stopped unexpectedly:', error)
      this.lastError = errorMessage(error)
      this.setStatus('offline')
    } finally {
      this.processing = undefined
      this.pumping = false
    }
  }

  /** A turn that failed outside its recovery ladder, such as on a full disk. */
  private async failUnexpectedly(message: ManagerMessage, error: unknown): Promise<void> {
    console.error('Manager turn failed unexpectedly:', error)
    this.streaming = undefined
    this.lastError = errorMessage(error)
    await this.updateMessage({
      ...(this.store.message(message.id) ?? message),
      state: 'failed',
      error: `Oracle could not answer: ${this.lastError}. Your message is kept; press Retry.`,
      updatedAt: this.now().toISOString(),
    }).catch(() => undefined)
    this.setStatus('offline')
  }

  private async process(message: ManagerMessage): Promise<void> {
    const epoch = this.epoch
    const current = () => !this.stopped && this.epoch === epoch
    const cancelled = () => this.cancelledMessageId === message.id
    this.currentReplyTo = message.id
    this.currentAnswerOnly = message.answerOnly === true
    if (this.structuredMemoryEnabled()) {
      const defaults = this.messageDefaults.has(message.id)
        ? this.messageDefaults.get(message.id)
        : this.store.state().defaults
      this.messageDefaults.delete(message.id)
      this.turnStructuredMemory = {
        messageId: message.id,
        content: message.content,
        scopes: this.structuredMemoryScopes(defaults),
      }
    }
    this.cancelledMessageId = undefined
    this.streaming = undefined
    const interrupted = (this.store.state().interruptions ?? {})[message.id] !== undefined
    const startedAt = this.now().toISOString()
    await this.updateMessage({ ...message, state: 'running', startedAt: message.startedAt ?? startedAt, updatedAt: startedAt })
    this.setStatus('working')
    const rungs: Array<{ rung: Rung; wait: number }> = [
      { rung: 'same', wait: 0 },
      ...this.retryDelaysMs.slice(0, -1).map((wait) => ({ rung: 'same' as Rung, wait })),
      { rung: 'restart', wait: this.retryDelaysMs.at(-1) ?? 0 },
      { rung: 'fresh', wait: 0 },
    ]
    const failures: string[] = []
    const performed: string[] = []
    let turn: { text: string; acknowledgement?: { journalSeq: number; memoryHash?: string; notesShown: number } } | undefined
    for (let index = 0; index < rungs.length; index += 1) {
      const { rung, wait } = rungs[index]
      if (index > 0) {
        this.setStatus('recovering')
        if (wait) await delay(wait)
      }
      if (!current()) return this.leave()
      if (cancelled()) return this.finishCancelled(message, current)
      this.attemptActivities = []
      try {
        await this.prepare(rung)
        if (!current()) return this.leave()
        if (cancelled()) return this.finishCancelled(message, current)
        const prompt = await this.buildPrompt(message, {
          interrupted,
          performed,
          failure: failures.at(-1),
        })
        const acknowledgement = this.pendingAcknowledgement
        if (!current()) return this.leave()
        if (cancelled()) return this.finishCancelled(message, current)
        turn = { text: await this.runTurn(prompt), acknowledgement }
        break
      } catch (error) {
        performed.push(...this.attemptActivities)
        if (error instanceof TurnError && error.kind === 'cancelled') {
          return this.finishCancelled(message, current)
        }
        if (!current()) return this.leave()
        failures.push(errorMessage(error))
        console.warn(`Manager turn attempt ${index + 1} (${rung}) failed:`, errorMessage(error))
        // A stuck or unreachable runtime is not helped by asking it again.
        const runtimeGone = !(error instanceof TurnError) || error.kind === 'timeout' || error.kind === 'transport'
        if (runtimeGone && rungs[index + 1]?.rung === 'same') {
          index = rungs.findIndex((candidate) => candidate.rung === 'restart') - 1
        }
        if (rung !== 'same' || runtimeGone) this.dropSession()
      } finally {
        this.flushDelta()
      }
    }
    // A stopped hub retries the message after its restart; an earlier
    // conversation's turn has nowhere to go.
    if (!current()) return this.leave()
    const finished = this.store.message(message.id) ?? message
    if (!turn) {
      this.streaming = undefined
      this.lastError = failures.at(-1) ?? 'Oracle could not answer.'
      await this.updateMessage({
        ...finished,
        state: 'failed',
        error: `Oracle could not answer: ${this.lastError}. Your message is kept; press Retry.`,
        updatedAt: this.now().toISOString(),
      })
      await this.clearInterruption(message.id)
      this.setStatus('offline')
      return
    }
    this.lastError = undefined
    this.needsMemoryIndex = false
    this.needsBrief = false
    const acknowledgement = turn.acknowledgement
    if (acknowledgement) {
      await this.store.updateState((state) => {
        state.acknowledgedJournalSeq = Math.max(state.acknowledgedJournalSeq, acknowledgement.journalSeq)
        if (acknowledgement.memoryHash) state.memoryHashShown = acknowledgement.memoryHash
        // Notes added while the turn ran are still unseen.
        if (state.pendingNotes?.length) state.pendingNotes = state.pendingNotes.slice(acknowledgement.notesShown)
      })
    }
    if (turn.text.trim()) {
      await this.updateMessage({
        id: this.streamId() ?? randomUUID(),
        role: 'assistant',
        content: turn.text.trim(),
        createdAt: this.now().toISOString(),
        replyTo: message.id,
      })
    }
    this.streaming = undefined
    await this.updateMessage({ ...finished, state: 'done', updatedAt: this.now().toISOString() })
    await this.clearInterruption(message.id)
    this.setStatus('working')
  }

  /** Leaves a turn without storing anything more, as on stop or Start over. */
  private leave(): void {
    this.streaming = undefined
  }

  private async finishCancelled(message: ManagerMessage, current: () => boolean): Promise<void> {
    const partial = this.streaming?.content.trim()
    const partialId = this.streaming?.messageId
    this.streaming = undefined
    if (!current()) return
    if (partial && partialId) {
      await this.updateMessage({
        id: partialId,
        role: 'assistant',
        content: `${partial}\n\n_(stopped)_`,
        createdAt: this.now().toISOString(),
        replyTo: message.id,
      })
    }
    const stored = this.store.message(message.id) ?? message
    await this.updateMessage({ ...stored, state: 'cancelled', updatedAt: this.now().toISOString() })
    await this.clearInterruption(message.id)
  }

  private async clearInterruption(id: string): Promise<void> {
    if (this.store.state().interruptions?.[id] === undefined) return
    await this.store.updateState((state) => {
      if (state.interruptions) delete state.interruptions[id]
    })
  }

  private async buildPrompt(
    message: ManagerMessage,
    attempt: { interrupted: boolean; performed: string[]; failure?: string },
  ): Promise<string> {
    const state = this.store.state()
    const notes: string[] = []
    let sessions: ManagedSession[] = []
    try {
      const listing = await withTimeout(this.hub.listSessionsWithAuthority(), 15_000, 'Listing sessions took too long')
      sessions = listing.sessions
      await this.recorder.reconcile(listing.sessions, listing.answeredComputerIds)
    } catch (error) {
      notes.push(`The session list could not be read (${errorMessage(error)}); the roster may be incomplete. Try list_sessions.`)
      await this.recorder.flush()
    }
    const changes = this.store.journalSince(state.acknowledgedJournalSeq)
    const index = await this.store.memory.index().catch(() => undefined)
    const indexHash = index === undefined ? undefined : hash(index)
    const showIndex = index !== undefined && (this.needsMemoryIndex || this.needsBrief || indexHash !== state.memoryHashShown)
    if (attempt.interrupted) {
      notes.push('Your previous attempt at this message was interrupted by a restart. Some actions may already have happened; check the roster and changes before repeating any.')
    }
    if (attempt.performed.length) {
      notes.push(`A previous attempt at this message failed after: ${attempt.performed.join('; ')}. Do not repeat these; continue from there.`)
    }
    if (attempt.failure && !attempt.performed.length) {
      notes.push('A previous attempt at this message failed before finishing; answer it now.')
    }
    const pendingNotes = state.pendingNotes ?? []
    notes.push(...pendingNotes)
    if (message.answerOnly) {
      notes.push('The user asked this in Ask mode: answer it yourself from the current state, while their sessions keep working undisturbed. Read sessions and use ask_session as needed. Your own memory and settings stay yours to change, so use set_session_folder if they ask where new sessions should start and set_session_backend if they ask how new sessions open. Do not start, message, rename, stop, or close any session; if they ask for one of those, say what you would do and that switching Oracle to Delegate lets you do it.')
    }
    let context = buildTurnContext({
      now: this.now(),
      computers: this.hub.listComputers(),
      sessions,
      registry: this.store.registry(),
      changes,
      sessionFolders: this.store.state().sessionFolders,
      sessionBackend: this.sessionBackend(),
      ...(showIndex && !this.needsBrief ? { memoryIndex: index } : {}),
      notes,
      // A preference must never stop an answer; unreadable answers Balanced.
      responseStyle: (() => {
        try {
          return this.responseStyle()
        } catch {
          return undefined
        }
      })(),
    })
    if (this.needsBrief) {
      context = `${recoveryBrief({
        memoryIndex: index,
        messages: this.store.messages().filter((candidate) => candidate.id !== message.id),
      })}\n\n${context}`
    }
    const structuredMemory = this.structuredMemory
    if (
      structuredMemory &&
      structuredMemory.mode !== 'off' &&
      structuredMemory.store
    ) {
      const startedAt = performance.now()
      try {
        const formatted = formatStructuredMemoryContext(
          structuredMemory.store.search({
            query: message.content,
            scopes: this.currentTurnStructuredMemory()?.scopes ??
              this.structuredMemoryScopes(this.store.state().defaults),
            at: this.now().toISOString(),
          }),
        )
        structuredMemory.recordRetrieval({
          durationMs: performance.now() - startedAt,
          records: formatted.recordCount,
          promptCharacters: formatted.characterCount,
        })
        if (structuredMemory.mode === 'on' && formatted.text) {
          context = `${context}\n\n${formatted.text}`
        }
      } catch {
        structuredMemory.recordRetrievalFailure(
          performance.now() - startedAt,
        )
      }
    }
    this.pendingAcknowledgement = {
      journalSeq: changes.at(-1)?.seq ?? state.acknowledgedJournalSeq,
      memoryHash: showIndex || this.needsBrief ? indexHash : state.memoryHashShown,
      notesShown: pendingNotes.length,
    }
    return managerPrompt(context, message.content)
  }

  private async runTurn(prompt: string): Promise<string> {
    const session = this.session
    const client = this.client
    if (!session) throw new TurnError('The manager runtime is not ready', 'runtime')
    const segments = new Map<string, string>()
    const order: string[] = []
    const text = () => order.map((id) => segments.get(id) ?? '').filter((part) => part.trim()).join('\n\n')
    const timers: Array<ReturnType<typeof setTimeout>> = []
    const unref = <T extends ReturnType<typeof setTimeout>>(timer: T) => {
      timer.unref?.()
      timers.push(timer)
      return timer
    }
    let unsubscribe: (() => void) | undefined
    let settled = false
    const outcome = new Promise<void>((resolve, reject) => {
      const finish = (error?: TurnError) => {
        if (settled) return
        settled = true
        if (error) reject(error)
        else resolve()
      }
      // The idle that ends this turn follows its own activity. One that comes
      // first belongs to a turn that was stopped just before, so it is only
      // believed once nothing else has happened for a while.
      let started = false
      let stopping = false
      let idleSeen: (() => void) | undefined
      const idle = new Promise<void>((resolveIdle) => {
        idleSeen = resolveIdle
      })
      this.running = {
        messageId: this.currentReplyTo ?? '',
        cancel: () => {
          if (settled || stopping) return
          stopping = true
          void (async () => {
            await withTimeout(session.abort(), 5000, 'abort').catch(() => undefined)
            // Drained here, so the next turn never mistakes it for its own.
            await Promise.race([idle, delay(5000)])
            finish(new TurnError('Stopped', 'cancelled'))
          })()
        },
      }
      unref(setTimeout(() => {
        void withTimeout(session.abort(), 5000, 'abort').catch(() => undefined)
        finish(new TurnError(`no answer within ${Math.round(this.turnTimeoutMs / 60_000) || 1} minutes`, 'timeout'))
      }, this.turnTimeoutMs))
      // A runtime that dies mid-turn drops the session without a word.
      let pinging = false
      let lastPing = Date.now()
      const liveness = setInterval(() => {
        if (session.disconnected) {
          finish(new TurnError('the manager runtime disconnected', 'transport'))
          return
        }
        if (!client?.ping || pinging || Date.now() - lastPing < 60_000) return
        pinging = true
        lastPing = Date.now()
        void withTimeout(client.ping(), 15_000, 'the manager runtime stopped responding')
          .catch(() => finish(new TurnError('the manager runtime stopped responding', 'transport')))
          .finally(() => {
            pinging = false
          })
      }, this.livenessIntervalMs)
      liveness.unref?.()
      timers.push(liveness)
      unsubscribe = session.on((event) => {
        if (event.agentId || event.data?.parentToolCallId) return
        if (event.type === 'session.idle') {
          idleSeen?.()
          if (stopping) return
          if (started) {
            finish()
          } else {
            unref(setTimeout(() => {
              if (!started) finish()
            }, this.earlyIdleMs))
          }
          return
        }
        if (event.type === 'session.error') {
          finish(new TurnError(event.data?.message || event.data?.errorType || 'the runtime reported an error', 'runtime'))
          return
        }
        if (event.type === 'session.compaction_complete') {
          this.needsMemoryIndex = true
          return
        }
        if (TURN_ACTIVITY.has(event.type)) started = true
        if (event.type === 'assistant.message_delta' && event.data?.deltaContent) {
          const id = event.data.messageId ?? 'reply'
          if (!segments.has(id)) order.push(id)
          segments.set(id, `${segments.get(id) ?? ''}${event.data.deltaContent}`)
          this.updateStream(text())
        } else if (event.type === 'assistant.message') {
          const id = event.data?.messageId ?? `reply-${order.length}`
          if (!segments.has(id)) order.push(id)
          segments.set(id, event.data?.content ?? segments.get(id) ?? '')
          this.updateStream(text())
        }
      })
    })
    try {
      await Promise.race([
        outcome,
        withTimeout(session.send({ prompt }), this.operationTimeoutMs, 'the runtime did not accept the message')
          .catch((error: unknown) => {
            if (error instanceof TurnError) throw error
            // The message never reached the runtime: its connection is gone.
            throw new TurnError(errorMessage(error), 'transport')
          })
          .then(() => outcome),
      ])
    } finally {
      settled = true
      unsubscribe?.()
      for (const timer of timers) clearTimeout(timer)
      this.running = undefined
    }
    return text()
  }

  /** The streamed reply's id, so the stored reply replaces it in place. */
  private streamId(): string | undefined {
    return this.streaming?.messageId
  }

  private updateStream(content: string): void {
    if (!this.streaming) this.streaming = { messageId: randomUUID(), content }
    else this.streaming.content = content
    if (this.deltaTimer) return
    this.deltaTimer = setTimeout(() => this.flushDelta(), 100)
    this.deltaTimer.unref?.()
  }

  private flushDelta(): void {
    if (this.deltaTimer) {
      clearTimeout(this.deltaTimer)
      this.deltaTimer = undefined
    }
    if (this.streaming) {
      this.emit('event', { type: 'manager.delta', messageId: this.streaming.messageId, content: this.streaming.content })
    }
  }

  /** Gets the runtime and SDK session ready for the given recovery rung. */
  private async prepare(rung: Rung): Promise<void> {
    if (rung === 'restart') {
      this.dropSession()
      await this.stopClient()
    } else if (rung === 'fresh') {
      await this.retireSession()
    }
    const client = await this.ensureClient()
    if (!this.session) {
      const state = this.store.state()
      if (state.sdkSessionId && rung !== 'fresh') {
        // A failure here leaves the next rung to restart the runtime, and the
        // last one to start a new conversation.
        this.session = await withTimeout(
          client.resumeSession(state.sdkSessionId, this.sessionConfig()),
          this.operationTimeoutMs,
          'resuming the manager conversation took too long',
        )
      } else {
        await this.createSession(client)
      }
    }
    await this.applyRuntime(client)
  }

  /**
   * Puts your model choice into effect on the conversation when it runs on
   * something else. A chosen model is switched to in place; returning to the
   * default starts a new conversation, briefed on this one, since the runtime
   * offers no way back to its default. A failed switch is left to the
   * recovery ladder, whose last rung starts that new conversation.
   */
  private async applyRuntime(client: ManagerSdkClient): Promise<void> {
    const state = this.store.state()
    const current = state.sessionRuntime ?? { model: this.model, reasoningEffort: this.reasoningEffort }
    const target = this.target()
    if (sameRuntime(current, target)) return
    const switchTo = this.session?.rpc?.model?.switchTo
    if (target.model && switchTo) {
      await withTimeout(
        switchTo.call(this.session!.rpc!.model, {
          modelId: target.model,
          ...(target.reasoningEffort ? { reasoningEffort: target.reasoningEffort } : {}),
        }),
        this.operationTimeoutMs,
        'switching the model took too long',
      )
      // What was switched to, not the choice now: a change made meanwhile is
      // still different, so the next answer puts it into effect.
      await this.store.updateState((next) => {
        next.sessionRuntime = { ...target }
      })
      return
    }
    await this.retireSession()
    await this.createSession(client)
  }

  private async createSession(client: ManagerSdkClient): Promise<void> {
    const id = this.sessionIdFactory()
    // Recorded and excluded before it exists, so discovery can never list it.
    this.excludeFromDiscovery([id])
    await this.store.updateState((state) => {
      state.knownSdkSessionIds = [...state.knownSdkSessionIds.filter((known) => known !== id), id]
        .slice(-KNOWN_SDK_SESSION_LIMIT)
    })
    const create = (runtime: ManagerSettings) => withTimeout(
      client.createSession({ ...this.sessionConfig(runtime), sessionId: id }),
      this.operationTimeoutMs,
      'starting the manager conversation took too long',
    )
    let session: ManagerSdkSession
    const attempted = this.target()
    let runtime = attempted
    try {
      session = await create(runtime)
    } catch (error) {
      if (!attempted.model) throw error
      // A chosen model that is unavailable must not keep Oracle down.
      console.warn(`Oracle model ${attempted.model} failed; using Copilot's default model:`, errorMessage(error))
      runtime = {}
      session = await create(runtime)
      // Only a choice still in effect is marked; one made while this was
      // starting gets its own try on the next answer.
      if (sameRuntime(attempted, this.runtime())) {
        await this.store.updateState((state) => {
          state.unavailableRuntime = { ...attempted }
        })
        this.emit('event', { type: 'manager.settings', settings: this.settingsSnapshot() })
      }
    }
    this.session = session
    const hadConversation = this.store.messages().some((message) => message.role === 'assistant')
    // A new conversation that takes over from an earlier one is briefed on it.
    this.needsBrief = hadConversation
    this.needsMemoryIndex = true
    await this.store.updateState((state) => {
      state.sdkSessionId = id
      state.sessionRuntime = runtime
      state.generation += 1
    })
  }

  /** Moves off the current SDK session; it stays excluded from discovery. */
  private async retireSession(): Promise<void> {
    const state = this.store.state()
    const session = this.session
    this.session = undefined
    if (session) await withTimeout(session.disconnect(), 5000, 'disconnect').catch(() => undefined)
    if (!state.sdkSessionId) return
    const retired = state.sdkSessionId
    await this.store.updateState((next) => {
      delete next.sdkSessionId
      delete next.sessionRuntime
    })
    if (this.client) {
      await withTimeout(this.client.deleteSession(retired), 10_000, 'delete').catch((error: unknown) => {
        console.warn(`Could not delete retired manager session ${retired}:`, errorMessage(error))
      })
    }
  }

  private dropSession(): void {
    const session = this.session
    this.session = undefined
    if (session) void withTimeout(session.disconnect(), 5000, 'disconnect').catch(() => undefined)
  }

  private async ensureClient(): Promise<ManagerSdkClient> {
    if (this.client) return this.client
    const client = this.clientFactory()
    try {
      await withTimeout(client.start(), this.operationTimeoutMs, 'the manager runtime did not start in time')
    } catch (error) {
      void client.stop().catch(() => undefined)
      throw error
    }
    this.client = client
    return client
  }

  private async stopClient(): Promise<void> {
    const client = this.client
    this.client = undefined
    if (client) await withTimeout(client.stop(), 10_000, 'stop').catch(() => undefined)
  }

  private sessionConfig(runtime = this.target()): Omit<ManagerSdkSessionConfig, 'sessionId'> {
    const { model, reasoningEffort } = runtime
    return {
      clientName: 'agentic-remote-manager',
      ...(model ? { model } : {}),
      // An effort alone, from AGENTIC_REMOTE_MANAGER_REASONING_EFFORT, still applies.
      ...(reasoningEffort ? { reasoningEffort } : {}),
      streaming: true,
      workingDirectory: `${this.store.directory}/workspace`,
      systemMessage: {
        mode: 'append',
        content: this.structuredMemory?.mode === 'on'
          ? `${MANAGER_SYSTEM_PROMPT}\n\n${MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT}`
          : MANAGER_SYSTEM_PROMPT,
      },
      tools: this.tools,
      availableTools: this.tools.map((tool) => tool.name),
      enableSkills: false,
      onPermissionRequest: () => ({ kind: 'user-not-available' }),
    }
  }

  private scheduleIdleStop(): void {
    this.clearIdleTimer()
    if (!this.client || this.stopped) return
    this.idleTimer = setTimeout(() => {
      this.idleTimer = undefined
      if (this.pumping || this.running) return
      this.dropSession()
      void this.stopClient()
    }, this.idleStopMs)
    this.idleTimer.unref?.()
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = undefined
  }

  private setStatus(status: ManagerStatus): void {
    this.status = status
    this.publishStatus()
  }

  private publishStatus(): void {
    const snapshot = this.snapshot()
    this.emit('event', {
      type: 'manager.status',
      status: snapshot.status,
      queued: snapshot.queued,
      ...(snapshot.lastError ? { lastError: snapshot.lastError } : {}),
    })
  }

  private async updateMessage(message: ManagerMessage): Promise<void> {
    await this.store.upsertMessage(message)
    this.emit('event', { type: 'manager.message', message })
  }
}
