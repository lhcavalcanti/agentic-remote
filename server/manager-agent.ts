import { EventEmitter } from 'node:events'
import { createHash, randomUUID } from 'node:crypto'
import type {
  ComputerSummary,
  CreateSessionInput,
  ManagedSession,
  RenameSessionInput,
  RuntimeReasoningEffort,
  SendMessageInput,
} from '../shared/contracts.js'
import {
  MANAGER_MESSAGE_MAX_LENGTH,
  MANAGER_SNAPSHOT_MESSAGES,
  type ManagerClientDefaults,
  type ManagerEvent,
  type ManagerMessage,
  type ManagerSnapshot,
  type ManagerStatus,
} from '../shared/manager.js'
import {
  buildTurnContext,
  managerPrompt,
  MANAGER_SYSTEM_PROMPT,
  recoveryBrief,
} from './manager-context.js'
import type { JournalRecorder } from './manager-journal.js'
import type { ManagerStore } from './manager-store.js'
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
  getSession(computerId: string, sessionId: string): Promise<ManagedSession>
  askSession(computerId: string, sessionId: string, question: string): Promise<string>
  createSession(computerId: string, input: CreateSessionInput): Promise<ManagedSession>
  renameSession(computerId: string, sessionId: string, input: RenameSessionInput): Promise<ManagedSession>
  sendMessage(computerId: string, sessionId: string, input: SendMessageInput): Promise<ManagedSession>
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
  on(handler: (event: ManagerSdkEvent) => void): () => void
  send(options: { prompt: string }): Promise<string>
  abort(): Promise<void>
  disconnect(): Promise<void>
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
  sessionIdFactory?: () => string
  now?: () => Date
}

class TurnError extends Error {
  constructor(message: string, readonly kind: 'timeout' | 'runtime' | 'cancelled') {
    super(message)
    this.name = 'TurnError'
  }
}

type Rung = 'same' | 'restart' | 'fresh'

const KNOWN_SDK_SESSION_LIMIT = 200
const SKILL_CACHE_MS = 5 * 60 * 1000

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
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
  private readonly turnTimeoutMs: number
  private readonly retryDelaysMs: number[]
  private readonly idleStopMs: number
  private readonly operationTimeoutMs: number
  private readonly sessionIdFactory: () => string
  private readonly now: () => Date
  private readonly tools: ManagerTool[]
  private client?: ManagerSdkClient
  private session?: ManagerSdkSession
  private status: ManagerStatus = 'idle'
  private lastError?: string
  private running?: { messageId: string; cancel: () => void; cancelled: boolean }
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
  private omitModel = false
  private pendingAcknowledgement?: { journalSeq: number; memoryHash?: string }

  constructor(options: ManagerAgentOptions) {
    super()
    this.store = options.store
    this.recorder = options.recorder
    this.hub = options.hub
    this.clientFactory = options.clientFactory
    this.excludeFromDiscovery = options.excludeFromDiscovery ?? (() => undefined)
    this.model = options.model
    this.reasoningEffort = options.reasoningEffort
    this.turnTimeoutMs = options.turnTimeoutMs ?? 15 * 60 * 1000
    this.retryDelaysMs = options.retryDelaysMs ?? [1000, 4000]
    this.idleStopMs = options.idleStopMs ?? 10 * 60 * 1000
    this.operationTimeoutMs = options.operationTimeoutMs ?? 60_000
    this.sessionIdFactory = options.sessionIdFactory ?? randomUUID
    this.now = options.now ?? (() => new Date())
    this.tools = createManagerTools(this.toolHost(), (activity) => this.recordActivity(activity))
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
    const state = this.store.state()
    const interruptions = { ...(state.interruptions ?? {}) }
    for (const message of this.store.messages()) {
      if (message.role !== 'user' || message.state !== 'running') continue
      const count = (interruptions[message.id] ?? 0) + 1
      interruptions[message.id] = count
      if (count > 2) {
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
    if (!this.store.state().baselineAt) void this.takeBaseline()
    void this.pump()
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
    return {
      available: true,
      status: this.status,
      messages: messages.slice(-MANAGER_SNAPSHOT_MESSAGES),
      queued: messages.filter((message) => message.role === 'user' && message.state === 'queued').length,
      managedSessions: this.recorder.managedSessions(),
      ...(this.lastError ? { lastError: this.lastError } : {}),
      ...(this.streaming ? { streaming: { ...this.streaming } } : {}),
    }
  }

  async send(content: string, defaults?: ManagerClientDefaults): Promise<ManagerMessage> {
    if (!content.trim()) {
      throw Object.assign(new Error('Type a message first.'), { statusCode: 400 })
    }
    if (content.length > MANAGER_MESSAGE_MAX_LENGTH) {
      throw Object.assign(
        new Error(`Messages are limited to ${MANAGER_MESSAGE_MAX_LENGTH.toLocaleString('en-US')} characters.`),
        { statusCode: 413 },
      )
    }
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
    }
    await this.updateMessage(message)
    this.publishStatus()
    void this.pump()
    return message
  }

  async retry(messageId: string): Promise<ManagerMessage> {
    const message = this.store.message(messageId)
    if (!message || message.role !== 'user') {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 })
    }
    if (message.state === 'queued' || message.state === 'running') return message
    const next: ManagerMessage = { ...message, state: 'queued', updatedAt: this.now().toISOString() }
    delete next.error
    await this.updateMessage(next)
    this.publishStatus()
    void this.pump()
    return next
  }

  /** Stops the turn being answered. Queued messages still go after it. */
  async cancel(): Promise<void> {
    const running = this.running
    if (!running) return
    running.cancelled = true
    running.cancel()
    await withTimeout(this.session?.abort() ?? Promise.resolve(), 5000, 'abort').catch(() => undefined)
  }

  /** Starts a new conversation. Memory and the journal are kept. */
  async reset(): Promise<void> {
    for (const message of this.store.messages()) {
      if (message.role === 'user' && message.state === 'queued') {
        await this.updateMessage({ ...message, state: 'cancelled' })
      }
    }
    await this.cancel()
    await this.retireSession()
    await this.store.resetConversation()
    await this.store.updateState((state) => {
      delete state.memoryHashShown
    })
    this.lastError = undefined
    this.needsBrief = false
    this.emit('event', { type: 'manager.reset', snapshot: this.snapshot() })
  }

  private toolHost(): ManagerToolHost {
    const hub = this.hub
    return {
      computers: () => hub.listComputers(),
      findComputer: (nameOrId) => hub.findComputer(nameOrId),
      listSessions: () => hub.listSessions(),
      listHistory: () => hub.listHistory(),
      getSession: (computerId, sessionId) => hub.getSession(computerId, sessionId),
      askSession: (computerId, sessionId, question) => hub.askSession(computerId, sessionId, question),
      createSession: (computerId, input) => hub.createSession(computerId, input),
      renameSession: (computerId, sessionId, title) => hub.renameSession(computerId, sessionId, { title }),
      sendMessage: (computerId, sessionId, content) =>
        hub.sendMessage(computerId, sessionId, { content, enqueue: true }),
      cancel: (computerId, sessionId) => hub.cancel(computerId, sessionId),
      deleteSession: (computerId, sessionId) => hub.deleteSession(computerId, sessionId),
      discoverSkills: (projectPaths) => this.discoverSkills(projectPaths),
      markManaged: async (session, task) => {
        await this.recorder.markManaged(session, task)
        this.emit('event', { type: 'manager.sessions', managedSessions: this.recorder.managedSessions() })
      },
      registry: () => this.store.registry(),
      memory: this.store.memory,
      defaults: () => this.store.state().defaults ?? {},
      now: () => this.now(),
    }
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
    })
    if (activity.tool === 'close_session') {
      this.emit('event', { type: 'manager.sessions', managedSessions: this.recorder.managedSessions() })
    }
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
        await this.process(next)
      }
      if (this.status !== 'offline') this.setStatus('idle')
      this.scheduleIdleStop()
    } finally {
      this.pumping = false
    }
  }

  private async process(message: ManagerMessage): Promise<void> {
    this.currentReplyTo = message.id
    this.streaming = undefined
    const interrupted = (this.store.state().interruptions ?? {})[message.id] !== undefined
    await this.updateMessage({ ...message, state: 'running', updatedAt: this.now().toISOString() })
    this.setStatus('working')
    const rungs: Array<{ rung: Rung; wait: number }> = [
      { rung: 'same', wait: 0 },
      ...this.retryDelaysMs.slice(0, -1).map((wait) => ({ rung: 'same' as Rung, wait })),
      { rung: 'restart', wait: this.retryDelaysMs.at(-1) ?? 0 },
      { rung: 'fresh', wait: 0 },
    ]
    const failures: string[] = []
    const performed: string[] = []
    let reply = ''
    let succeeded = false
    for (let index = 0; index < rungs.length && !this.stopped; index += 1) {
      const { rung, wait } = rungs[index]
      if (index > 0) {
        this.setStatus('recovering')
        if (wait) await delay(wait)
        if (this.stopped) return
      }
      this.attemptActivities = []
      try {
        await this.prepare(rung)
        const prompt = await this.buildPrompt(message, {
          interrupted,
          performed,
          failure: failures.at(-1),
        })
        reply = await this.runTurn(prompt)
        succeeded = true
        break
      } catch (error) {
        performed.push(...this.attemptActivities)
        if (error instanceof TurnError && error.kind === 'cancelled') {
          await this.finishCancelled(message)
          return
        }
        if (this.stopped) return
        failures.push(errorMessage(error))
        console.warn(`Manager turn attempt ${index + 1} (${rung}) failed:`, errorMessage(error))
        // A stuck runtime is not helped by asking it again.
        if (error instanceof TurnError && error.kind === 'timeout' && rungs[index + 1]?.rung === 'same') {
          index = rungs.findIndex((candidate) => candidate.rung === 'restart') - 1
        }
        if (rung !== 'same') this.dropSession()
      } finally {
        this.flushDelta()
      }
    }
    if (this.stopped) return
    const finished = this.store.message(message.id) ?? message
    if (!succeeded) {
      this.lastError = failures.at(-1) ?? 'The manager could not answer.'
      await this.updateMessage({
        ...finished,
        state: 'failed',
        error: `The manager could not answer: ${this.lastError}. Your message is kept; press Retry.`,
        updatedAt: this.now().toISOString(),
      })
      await this.clearInterruption(message.id)
      this.setStatus('offline')
      return
    }
    this.lastError = undefined
    if (reply.trim()) {
      const timestamp = this.now().toISOString()
      await this.updateMessage({
        id: this.streamId() ?? randomUUID(),
        role: 'assistant',
        content: reply.trim(),
        createdAt: timestamp,
        replyTo: message.id,
      })
    }
    this.streaming = undefined
    await this.updateMessage({ ...finished, state: 'done', updatedAt: this.now().toISOString() })
    await this.clearInterruption(message.id)
    this.setStatus('working')
  }

  private async finishCancelled(message: ManagerMessage): Promise<void> {
    const partial = this.streaming?.content.trim()
    if (partial) {
      await this.updateMessage({
        id: this.streaming!.messageId,
        role: 'assistant',
        content: `${partial}\n\n_(stopped)_`,
        createdAt: this.now().toISOString(),
        replyTo: message.id,
      })
    }
    this.streaming = undefined
    const current = this.store.message(message.id) ?? message
    await this.updateMessage({ ...current, state: 'cancelled', updatedAt: this.now().toISOString() })
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
    let context = buildTurnContext({
      now: this.now(),
      computers: this.hub.listComputers(),
      sessions,
      registry: this.store.registry(),
      changes,
      ...(showIndex && !this.needsBrief ? { memoryIndex: index } : {}),
      notes,
    })
    if (this.needsBrief) {
      context = `${recoveryBrief({
        memoryIndex: index,
        messages: this.store.messages().filter((candidate) => candidate.id !== message.id),
      })}\n\n${context}`
    }
    this.pendingAcknowledgement = {
      journalSeq: changes.at(-1)?.seq ?? state.acknowledgedJournalSeq,
      memoryHash: showIndex || this.needsBrief ? indexHash : state.memoryHashShown,
    }
    return managerPrompt(context, message.content)
  }

  private async runTurn(prompt: string): Promise<string> {
    const session = this.session
    if (!session) throw new TurnError('The manager runtime is not ready', 'runtime')
    const segments = new Map<string, string>()
    const order: string[] = []
    const text = () => order.map((id) => segments.get(id) ?? '').filter((part) => part.trim()).join('\n\n')
    let unsubscribe: (() => void) | undefined
    let watchdog: ReturnType<typeof setTimeout> | undefined
    const outcome = new Promise<void>((resolve, reject) => {
      const cancel = () => reject(new TurnError('Stopped', 'cancelled'))
      this.running = { messageId: this.currentReplyTo ?? '', cancel, cancelled: false }
      watchdog = setTimeout(() => {
        void withTimeout(session.abort(), 5000, 'abort').catch(() => undefined)
        reject(new TurnError(`no answer within ${Math.round(this.turnTimeoutMs / 60_000) || 1} minutes`, 'timeout'))
      }, this.turnTimeoutMs)
      watchdog.unref?.()
      unsubscribe = session.on((event) => {
        if (event.agentId || event.data?.parentToolCallId) return
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
        } else if (event.type === 'session.compaction_complete') {
          this.needsMemoryIndex = true
        } else if (event.type === 'session.error') {
          reject(new TurnError(event.data?.message || event.data?.errorType || 'the runtime reported an error', 'runtime'))
        } else if (event.type === 'session.idle') {
          resolve()
        }
      })
    })
    try {
      await Promise.race([
        outcome,
        withTimeout(session.send({ prompt }), this.operationTimeoutMs, 'the runtime did not accept the message')
          .then(() => outcome),
      ])
    } finally {
      unsubscribe?.()
      if (watchdog) clearTimeout(watchdog)
      this.running = undefined
    }
    const acknowledgement = this.pendingAcknowledgement
    this.pendingAcknowledgement = undefined
    this.needsMemoryIndex = false
    this.needsBrief = false
    if (acknowledgement) {
      await this.store.updateState((state) => {
        state.acknowledgedJournalSeq = Math.max(state.acknowledgedJournalSeq, acknowledgement.journalSeq)
        if (acknowledgement.memoryHash) state.memoryHashShown = acknowledgement.memoryHash
      })
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
    if (this.session) return
    const client = await this.ensureClient()
    const state = this.store.state()
    if (state.sdkSessionId && rung !== 'fresh') {
      // A failure here leaves the next rung to restart the runtime, and the
      // last one to start a new conversation.
      this.session = await withTimeout(
        client.resumeSession(state.sdkSessionId, this.sessionConfig()),
        this.operationTimeoutMs,
        'resuming the manager conversation took too long',
      )
      return
    }
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
    const create = (withModel: boolean) => withTimeout(
      client.createSession({ ...this.sessionConfig(withModel), sessionId: id }),
      this.operationTimeoutMs,
      'starting the manager conversation took too long',
    )
    let session: ManagerSdkSession
    try {
      session = await create(!this.omitModel)
    } catch (error) {
      if (!this.model || this.omitModel) throw error
      // A configured model that is unavailable must not keep the manager down.
      console.warn(`Manager model ${this.model} failed; using the default model:`, errorMessage(error))
      this.omitModel = true
      session = await create(false)
    }
    this.session = session
    const hadConversation = this.store.messages().some((message) => message.role === 'assistant')
    // A new conversation that takes over from an earlier one is briefed on it.
    this.needsBrief = hadConversation
    this.needsMemoryIndex = true
    await this.store.updateState((state) => {
      state.sdkSessionId = id
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

  private sessionConfig(withModel = !this.omitModel): Omit<ManagerSdkSessionConfig, 'sessionId'> {
    return {
      clientName: 'agentic-remote-manager',
      ...(withModel && this.model ? { model: this.model } : {}),
      ...(withModel && this.reasoningEffort ? { reasoningEffort: this.reasoningEffort } : {}),
      streaming: true,
      workingDirectory: `${this.store.directory}/workspace`,
      systemMessage: { mode: 'append', content: MANAGER_SYSTEM_PROMPT },
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
