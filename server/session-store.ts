import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  ChatMessage,
  PendingUserInput,
  QueuedPrompt,
  SessionFileUpload,
  SessionDetail,
  SessionRuntimeInfo,
  SessionStatus,
  ActivityKind,
} from '../shared/contracts.js'
import { resolveDataDirectory } from './paths.js'

export interface DiscoveredSession {
  id: string
  cwd: string
  title: string
  updatedAt: string
}

export interface TerminalQueueDispatch {
  id: string
  startedAt: string
}

export interface QueuedPromptReservation {
  id: string
  prompt: QueuedPrompt
}

export interface RecoveryResend {
  failedAt: string
  content: string
  accepted: boolean
}

export class StaleQueuedPromptReservationError extends Error {
  readonly statusCode = 409

  constructor() {
    super('The queued prompt changed before turn admission; nothing was sent')
    this.name = 'StaleQueuedPromptReservationError'
  }
}

interface SdkQueueAdmission {
  assistantId: string
  userId: string
  prompt: QueuedPrompt
  startedAt: string
}

export type TerminalQueueOutcome =
  | { kind: 'accepted'; startedTurn: boolean; notice?: string }
  | { kind: 'failed'; uncertain: boolean }

export class SessionReplacementCleanupError extends Error {
  constructor(readonly replacement: SessionDetail, cause: unknown) {
    super('Conversation cleared, but previous uploads could not be removed.', { cause })
    this.name = 'SessionReplacementCleanupError'
  }
}

interface StoredState {
  version: 1
  sessions: Record<string, StoredSession>
  retiredSessionIds?: string[]
}

interface StoredSession extends SessionDetail {
  managedOpen?: boolean
  backend?: 'sdk' | 'terminal'
  customTitle?: boolean
  queueDispatchAt?: string
  contextCwd?: boolean
  workspaceTitle?: boolean
  terminalQueueDispatch?: TerminalQueueDispatch
  queuedPromptReservation?: { id: string; promptId: string }
  sdkQueueAdmission?: SdkQueueAdmission
  recoveryResend?: RecoveryResend
}

interface PendingMutation {
  kind: 'mutation'
  separateCommit?: boolean
  apply(state: StoredState): () => void
  reject(error: unknown): void
}

interface StreamMutation {
  kind: 'append' | 'content'
  sessionId: string
  messageId: string
  content: string
  updatedAt: string
  revisions: number
}

type PendingChange = PendingMutation | StreamMutation

type SessionProjection<T> = T | ((session: SessionDetail) => T)

const emptyRetirements: ReadonlySet<string> = new Set()

function isSessionIdList(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.every((id) => typeof id === 'string' && id.length > 0)
}

function activityDuration(startedAt: string, completedAt: string): number | undefined {
  const start = Date.parse(startedAt)
  const end = Date.parse(completedAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return undefined
  }
  return end - start
}

function activityResultPreview(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 320 ? `${normalized.slice(0, 319)}…` : normalized
}

function cloneSession(session: StoredSession): SessionDetail {
  const {
    managedOpen: _managedOpen,
    backend,
    customTitle: _customTitle,
    queueDispatchAt: _queueDispatchAt,
    terminalQueueDispatch,
    queuedPromptReservation: _queuedPromptReservation,
    sdkQueueAdmission,
    recoveryResend: _recoveryResend,
    contextCwd: _contextCwd,
    workspaceTitle: _workspaceTitle,
    executionMode: _executionMode,
    ...detail
  } = structuredClone(session)
  if (terminalQueueDispatch && terminalQueueDispatch.startedAt === detail.failedPrompt?.failedAt) {
    detail.failedPrompt = undefined
  }
  if (sdkQueueAdmission && sdkQueueAdmission.startedAt === detail.failedPrompt?.failedAt) {
    detail.failedPrompt = undefined
  }
  return {
    ...detail,
    executionMode: backend === 'terminal' ? 'tmux' : 'sdk',
  }
}

export class SessionStore {
  private readonly directory: string
  private readonly statePath: string
  private state: StoredState = { version: 1, sessions: {} }
  private checkpoint = this.state
  private writeQueue: Promise<void> = Promise.resolve()
  private closed = false
  private closing?: Promise<void>
  private readonly fileWrites = new Set<Promise<unknown>>()
  private pendingPersist?: Promise<void>
  private pendingChanges: PendingChange[] = []
  private writingState?: StoredState
  private liveMutableSessions = new WeakSet<StoredSession>()
  private readonly streamTargets = new WeakMap<ChatMessage[], Map<string, ChatMessage>>()
  private readonly retirementCache = new WeakMap<string[], ReadonlySet<string>>()
  private lastTerminalQueueDispatchAt = 0
  private lastSdkAdmissionAt = 0

  constructor(
    directory = resolveDataDirectory(),
  ) {
    this.directory = directory
    this.statePath = path.join(directory, 'state.json')
  }

  async initialize(): Promise<void> {
    if (this.closed) throw new Error('Session store is closed')
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    let loaded: StoredState
    try {
      const raw = await readFile(this.statePath, 'utf8')
      const parsed = JSON.parse(raw) as StoredState
      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        parsed.version !== 1 ||
        parsed.sessions === null ||
        typeof parsed.sessions !== 'object' ||
        Array.isArray(parsed.sessions) ||
        (parsed.retiredSessionIds !== undefined && !isSessionIdList(parsed.retiredSessionIds))
      ) {
        throw new Error('Unsupported Agentic Remote state format')
      }
      loaded = parsed
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') {
        throw error
      }
      await this.persist()
      loaded = structuredClone(this.state)
    }

    const legacyRetirements: string[] = []
    for (const session of Object.values(loaded.sessions)) {
      if (session.replacedSessionIds !== undefined) {
        if (!isSessionIdList(session.replacedSessionIds)) {
          throw new Error('Invalid session retirement metadata')
        }
        for (const id of session.replacedSessionIds) legacyRetirements.push(id)
      }
      session.revision ??= 0
      session.provider ??= 'copilot'
      session.isOpen = session.managedOpen === true
      session.queuedPrompts ??= []
      session.queuedCount = session.queuedPrompts.length
      session.queuedPromptReservation = undefined
      session.pendingUserInput = undefined
      const resend = session.recoveryResend
      if (resend !== undefined && (
        !resend || typeof resend !== 'object' || Array.isArray(resend) ||
        typeof resend.failedAt !== 'string' || !resend.failedAt ||
        typeof resend.content !== 'string' || !resend.content.trim() ||
        typeof resend.accepted !== 'boolean'
      )) throw new Error('Invalid recovery resend metadata')
      const admission = session.sdkQueueAdmission
      if (admission !== undefined) {
        if (
          !admission || typeof admission !== 'object' || Array.isArray(admission) ||
          typeof admission.assistantId !== 'string' || !admission.assistantId ||
          typeof admission.userId !== 'string' || !admission.userId ||
          typeof admission.startedAt !== 'string' || !Number.isFinite(Date.parse(admission.startedAt)) ||
          !admission.prompt || typeof admission.prompt !== 'object' || Array.isArray(admission.prompt) ||
          typeof admission.prompt.id !== 'string' || !admission.prompt.id ||
          typeof admission.prompt.content !== 'string' || !admission.prompt.content ||
          typeof admission.prompt.createdAt !== 'string' ||
          !Number.isFinite(Date.parse(admission.prompt.createdAt)) ||
          (admission.prompt.command !== undefined && typeof admission.prompt.command !== 'boolean')
        ) throw new Error('Invalid SDK queue admission metadata')
        if (session.failedPrompt?.failedAt === admission.startedAt) {
          session.failedPrompt.uncertain = true
        }
        session.sdkQueueAdmission = undefined
      }
      const dispatch = session.terminalQueueDispatch
      if (dispatch !== undefined) {
        if (
          !dispatch || typeof dispatch !== 'object' || Array.isArray(dispatch) ||
          typeof dispatch.id !== 'string' || !dispatch.id ||
          typeof dispatch.startedAt !== 'string' || !Number.isFinite(Date.parse(dispatch.startedAt))
        ) throw new Error('Invalid terminal queue dispatch metadata')
        if (session.failedPrompt?.failedAt === dispatch.startedAt) {
          session.failedPrompt.uncertain = true
        }
        if (session.queueDispatchAt === dispatch.startedAt) session.queueDispatchAt = undefined
        session.terminalQueueDispatch = undefined
        session.queuedPromptReservation = undefined
      }
      if (session.queueDispatchAt) {
        session.status = 'running'
        session.activity = 'Sent queued prompt'
      } else if (session.status !== 'idle') {
        session.status = 'idle'
        session.activity = undefined
        session.pendingPermission = undefined
        session.pendingUserInput = undefined
      }
      for (const message of session.messages) {
        message.streaming = false
        if (
          message.role === 'activity' &&
          message.activityStatus === 'running'
        ) {
          message.activityStatus = 'failed'
        }
      }
    }
    this.retire(loaded, legacyRetirements)
    this.state = loaded
    this.checkpoint = loaded
    this.liveMutableSessions = new WeakSet()
  }

  list(): SessionDetail[] {
    return Object.values(this.state.sessions)
      .filter((session) => !this.isRetiredSession(session.id))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(cloneSession)
  }

  get(id: string): SessionDetail | undefined {
    if (!Object.hasOwn(this.state.sessions, id) || this.isRetiredSession(id)) {
      return undefined
    }
    const session = this.state.sessions[id]
    return session ? cloneSession(session) : undefined
  }

  isRetiredSession(id: string): boolean {
    return this.retiredIds(this.state).has(id)
  }

  private retiredIds(state: StoredState): ReadonlySet<string> {
    if (!state.retiredSessionIds) return emptyRetirements
    let retired = this.retirementCache.get(state.retiredSessionIds)
    if (!retired) {
      retired = new Set(state.retiredSessionIds)
      this.retirementCache.set(state.retiredSessionIds, retired)
    }
    return retired
  }

  private retire(state: StoredState, ids: readonly string[]): void {
    if (!ids.length) return
    const retired = new Set(this.retiredIds(state))
    for (const id of ids) retired.add(id)
    const recorded = [...retired]
    state.retiredSessionIds = recorded
    // The array belongs to this snapshot, so rejected writes never publish it.
    this.retirementCache.set(recorded, retired)
  }

  /** Queue a read behind admitted mutations before making a provider-side decision. */
  async readAfterWrites(sessionId: string): Promise<SessionDetail> {
    return this.change((state) => {
      if (!state.sessions[sessionId] || this.retiredIds(state).has(sessionId)) {
        throw new Error(`Session ${sessionId} does not exist`)
      }
      return () => this.requireSession(sessionId)
    })
  }

  backend(id: string): StoredSession['backend'] | undefined {
    return this.isRetiredSession(id) ? undefined : this.state.sessions[id]?.backend
  }

  async create(
    session: SessionDetail,
    options: {
      managedOpen?: boolean
      backend?: 'sdk' | 'terminal'
    } = {},
  ): Promise<SessionDetail> {
    const incoming = cloneSession(session)
    const retired = incoming.replacedSessionIds === undefined ? [] : incoming.replacedSessionIds
    if (!isSessionIdList(retired) || retired.includes(incoming.id)) {
      throw new Error('Invalid session retirement metadata')
    }
    return this.change((state) => {
      if (this.retiredIds(state).has(incoming.id)) {
        throw new Error('Session identity has been retired')
      }
      state.sessions[incoming.id] = {
        ...incoming,
        provider: incoming.provider || 'copilot',
        revision: Math.max(
          incoming.revision ?? 1,
          (state.sessions[incoming.id]?.revision ?? 0) + 1,
        ),
        managedOpen: options.managedOpen,
        executionMode: undefined,
        backend: options.backend,
      }
      this.retire(state, retired)
      return () => this.requireSession(incoming.id)
    }, retired.length > 0)
  }

  async syncDiscovered(
    sessions: DiscoveredSession[],
    isCurrent?: () => boolean,
  ): Promise<void> {
    return this.change((state) => {
      if (isCurrent && !isCurrent()) return () => undefined
      for (const discovered of sessions) {
        if (this.retiredIds(state).has(discovered.id)) continue
        const previous = state.sessions[discovered.id]
        if (previous) {
          const existing = {
            ...previous,
            revision: (previous.revision ?? 0) + 1,
          }
          if (!existing.contextCwd) {
            existing.cwd = discovered.cwd
          }
          if (!existing.customTitle && !existing.workspaceTitle) {
            existing.title = discovered.title || existing.title
          }
          if (discovered.updatedAt > existing.updatedAt) {
            existing.updatedAt = discovered.updatedAt
          }
          existing.isOpen ??= false
          state.sessions[discovered.id] = existing
          continue
        }
        state.sessions[discovered.id] = {
          ...discovered,
          provider: 'copilot',
          revision: 1,
          status: 'idle',
          isOpen: false,
          messages: [],
        }
      }
      return () => undefined
    })
  }

  async replaceMessages(
    sessionId: string,
    messages: ChatMessage[],
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.messages = messages
    })
  }

  async replaceTranscript(
    sessionId: string,
    messages: SessionProjection<ChatMessage[]>,
    status: SessionStatus,
    activity?: string,
    runtime?: SessionProjection<SessionRuntimeInfo | undefined>,
    cwd?: SessionProjection<string | undefined>,
    contextCwd = false,
    pendingUserInput?: SessionProjection<PendingUserInput | null | undefined>,
    observedQueueDispatchAt?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const nextMessages = typeof messages === 'function' ? messages(session) : messages
      const nextRuntime = typeof runtime === 'function' ? runtime(session) : runtime
      const nextCwd = typeof cwd === 'function' ? cwd(session) : cwd
      const nextUserInput = typeof pendingUserInput === 'function'
        ? pendingUserInput(session)
        : pendingUserInput
      session.messages = nextMessages
      if (nextUserInput !== undefined) {
        session.pendingUserInput = nextUserInput || undefined
      }
      const newerTerminalDispatch =
        session.queueDispatchAt &&
        session.queueDispatchAt !== observedQueueDispatchAt
      session.status = session.pendingPermission || session.pendingUserInput
        ? 'waiting'
        : newerTerminalDispatch
          ? 'running'
          : status
      session.activity = session.pendingPermission?.title ||
        session.pendingUserInput?.question ||
        (newerTerminalDispatch ? session.activity : activity)
      if (nextRuntime) {
        session.runtime = nextRuntime
      }
      if (nextCwd && (!session.contextCwd || contextCwd)) {
        session.cwd = nextCwd
        session.contextCwd ||= contextCwd
      }
      session.updatedAt =
        nextMessages.at(-1)?.createdAt || session.updatedAt
    })
  }

  async syncOpen(sessionIds: string[], isCurrent?: () => boolean): Promise<void> {
    const active = new Set(sessionIds)
    return this.change((state) => {
      if (isCurrent && !isCurrent()) return () => undefined
      for (const session of Object.values(state.sessions)) {
        if (this.retiredIds(state).has(session.id)) continue
        state.sessions[session.id] = {
          ...session,
          revision: (session.revision ?? 0) + 1,
          isOpen:
            active.has(session.id) ||
            // A suspended session has nothing running by design. Reading that as
            // closed would hide it from the list, and the only way back to it is
            // the button on the session itself.
            session.suspended === true ||
            (session.managedOpen === true && session.backend !== 'terminal'),
        }
      }
      return () => undefined
    })
  }

  async syncBackends(
    terminalSessionIds: string[],
    sdkSessionIds: string[],
    isCurrent?: () => boolean,
  ): Promise<void> {
    const activeTerminal = new Set(terminalSessionIds)
    const knownSdk = new Set(sdkSessionIds)
    return this.change((state) => {
      if (isCurrent && !isCurrent()) return () => undefined
      for (const session of Object.values(state.sessions)) {
        if (this.retiredIds(state).has(session.id)) continue
        if (activeTerminal.has(session.id)) {
          state.sessions[session.id] = {
            ...session,
            revision: (session.revision ?? 0) + 1,
            backend: 'terminal',
            managedOpen: true,
            isOpen: true,
          }
        } else if (!session.backend && knownSdk.has(session.id)) {
          state.sessions[session.id] = {
            ...session,
            revision: (session.revision ?? 0) + 1,
            backend: 'sdk',
          }
        }
      }
      return () => undefined
    })
  }

  terminalRecoverySessions(): SessionDetail[] {
    return Object.values(this.state.sessions)
      .filter(
        (session) =>
          !this.isRetiredSession(session.id) &&
          session.backend === 'terminal' &&
          session.managedOpen === true &&
          // A suspended session is meant to have nothing running for it.
          // Starting one back up at boot is the opposite of what was asked.
          session.suspended !== true,
      )
      .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt))
      .map(cloneSession)
  }

  async setOpen(
    sessionId: string,
    isOpen: boolean,
    managedOpen = false,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.isOpen = isOpen
      if (managedOpen) {
        session.managedOpen = isOpen
      }
    })
  }

  async setSuspended(
    sessionId: string,
    suspended: boolean,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.suspended = suspended
      // A suspended session is put down on purpose, not found missing, and it
      // keeps its place in the list either way. Written here so the state is
      // the same however the teardown and a discovery pass interleaved:
      // without it a pass that saw the pane go marked the session closed, and
      // this call left that in place -- a session both suspended and gone.
      session.isOpen = true
      session.status = 'idle'
      session.activity = undefined
      session.pendingPermission = undefined
      session.pendingUserInput = undefined
      // `updatedAt` is when the conversation last moved, and the list is
      // ordered by it. Suspending is not the conversation moving, so touching
      // it here would send a session to the top of the list for being put
      // down -- the opposite of keeping the place it had.
    })
  }

  async setBackend(
    sessionId: string,
    backend: 'sdk' | 'terminal',
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.backend = backend
      session.managedOpen = true
      session.isOpen = true
      session.updatedAt = new Date().toISOString()
    })
  }

  async renameSession(sessionId: string, title: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.title = title
      session.customTitle = true
      session.updatedAt = new Date().toISOString()
    })
  }

  async updateWorkingDirectory(
    sessionId: string,
    cwd: string,
    updatedAt: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.cwd = cwd
      session.contextCwd = true
      if (updatedAt > session.updatedAt) session.updatedAt = updatedAt
    }, (session) =>
      session.cwd !== cwd || !session.contextCwd || updatedAt > session.updatedAt)
  }

  async updateAutomaticTitle(
    sessionId: string,
    title: string,
    updatedAt: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.title = title
      session.workspaceTitle = true
      if (updatedAt > session.updatedAt) session.updatedAt = updatedAt
    }, (session) =>
      !session.customTitle &&
      (session.title !== title || !session.workspaceTitle || updatedAt > session.updatedAt))
  }

  async syncWorkspaceMetadata(
    sessionId: string,
    metadata: { cwd?: string; title?: string; updatedAt?: string },
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (metadata.cwd) {
        session.cwd = metadata.cwd
        session.contextCwd = true
      }
      if (metadata.title && !session.customTitle) {
        session.title = metadata.title
        session.workspaceTitle = true
      }
      if (metadata.updatedAt && metadata.updatedAt > session.updatedAt) {
        session.updatedAt = metadata.updatedAt
      }
    }, (session) =>
      Boolean(metadata.cwd && (metadata.cwd !== session.cwd || !session.contextCwd)) ||
      Boolean(metadata.title && !session.customTitle &&
        (metadata.title !== session.title || !session.workspaceTitle)) ||
      Boolean(metadata.updatedAt && metadata.updatedAt > session.updatedAt),
    )
  }

  async clearConversation(sessionId: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.messages = []
      session.status = 'idle'
      session.isOpen = true
      session.activity = undefined
      session.pendingPermission = undefined
      session.queuedPrompts = []
      session.queuedCount = 0
      session.queueDispatchAt = undefined
      session.terminalQueueDispatch = undefined
      if (session.runtime) {
        session.runtime.contextTokens = undefined
        session.runtime.contextEstimated = undefined
      }
      session.updatedAt = new Date().toISOString()
    })
  }

  async replaceWithClearedSession(
    sessionId: string,
    replacementId: string,
  ): Promise<SessionDetail> {
    const replacement = await this.change((state) => {
      const existing = state.sessions[sessionId]
      if (!existing || this.retiredIds(state).has(sessionId)) {
        throw new Error(`Session ${sessionId} does not exist`)
      }
      if (
        sessionId === replacementId ||
        Object.hasOwn(state.sessions, replacementId) ||
        this.retiredIds(state).has(replacementId)
      ) {
        throw new Error('Replacement session identity is not available')
      }
      state.sessions[replacementId] = {
        ...existing,
        id: replacementId,
        // The predecessor's own ancestry comes too: a client that missed both
        // clears has state under a session the predecessor already replaced.
        // Kept whole rather than capped: what a browser is holding has no
        // matching expiry, and a client that was away long enough to miss many
        // clears is exactly the one still holding the oldest id. Dropping the
        // far end of the ancestry is what leaves that state with no way back.
        replacedSessionIds: [
          ...(existing.replacedSessionIds || []),
          sessionId,
        ],
        revision: (existing.revision ?? 0) + 1,
        messages: [],
        status: 'idle',
        isOpen: true,
        activity: undefined,
        pendingPermission: undefined,
        pendingUserInput: undefined,
        queuedPrompts: [],
        queuedCount: 0,
        queueDispatchAt: undefined,
        terminalQueueDispatch: undefined,
        queuedPromptReservation: undefined,
        sdkQueueAdmission: undefined,
        updatedAt: new Date().toISOString(),
        runtime: existing.runtime
          ? {
              ...existing.runtime,
              contextTokens: undefined,
              contextEstimated: undefined,
            }
          : undefined,
      }
      this.retire(state, [...(existing.replacedSessionIds || []), sessionId])
      delete state.sessions[sessionId]
      return () => this.requireSession(replacementId)
    }, true)
    try {
      await this.removeUploads(sessionId)
    } catch (error) {
      throw new SessionReplacementCleanupError(replacement, error)
    }
    return replacement
  }

  async enqueuePrompt(
    sessionId: string,
    prompt: QueuedPrompt,
    prepend = false,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const queue = session.queuedPrompts || []
      session.queuedPrompts = prepend ? [prompt, ...queue] : [...queue, prompt]
      session.queuedCount = session.queuedPrompts.length
    })
  }

  async reserveQueuedPrompt(
    sessionId: string,
    isCurrent: () => boolean,
  ): Promise<{ session: SessionDetail; reservation?: QueuedPromptReservation }> {
    return this.change((state) => {
      const existing = state.sessions[sessionId]
      if (!existing || this.retiredIds(state).has(sessionId)) {
        throw new Error(`Session ${sessionId} does not exist`)
      }
      const prompt = existing.queuedPrompts?.[0]
      if (!prompt) return () => ({ session: this.requireSession(sessionId) })
      if (
        !isCurrent() || existing.suspended ||
        (existing.status !== 'idle' && existing.status !== 'error') ||
        existing.failedPrompt || existing.terminalQueueDispatch ||
        existing.pendingPermission || existing.pendingUserInput
      ) {
        throw Object.assign(new Error('The session changed before queue reservation; nothing was sent'), { statusCode: 409 })
      }
      const reservation = { id: randomUUID(), prompt: structuredClone(prompt) }
      const session = structuredClone(existing)
      session.queuedPromptReservation = { id: reservation.id, promptId: prompt.id }
      session.revision = (session.revision ?? 0) + 1
      state.sessions[sessionId] = session
      return () => ({ session: this.requireSession(sessionId), reservation })
    })
  }

  async beginPrompt(
    sessionId: string,
    content: string,
    assistantId: string,
    isCurrent: () => boolean,
    reservation?: QueuedPromptReservation,
  ): Promise<SessionDetail> {
    this.lastSdkAdmissionAt = Math.max(Date.now(), this.lastSdkAdmissionAt + 1)
    const createdAt = new Date(this.lastSdkAdmissionAt).toISOString()
    const userId = randomUUID()
    return this.mutate(sessionId, (session) => {
      if (session.suspended) {
        throw Object.assign(new Error('Resume the session before sending to it'), { statusCode: 409 })
      }
      if (!isCurrent()) {
        throw Object.assign(new Error('The session changed before turn admission; nothing was sent'), { statusCode: 409 })
      }
      if (session.status !== 'idle' && session.status !== 'error') {
        throw Object.assign(new Error('A turn can only start while the session is idle'), { statusCode: 409 })
      }
      if (reservation) {
        const head = session.queuedPrompts?.[0]
        if (
          session.queuedPromptReservation?.id !== reservation.id ||
          !head || head.id !== reservation.prompt.id ||
          head.content !== reservation.prompt.content ||
          head.createdAt !== reservation.prompt.createdAt ||
          head.command !== reservation.prompt.command ||
          content !== head.content ||
          (session.status !== 'idle' && session.status !== 'error') ||
          session.failedPrompt || session.pendingPermission || session.pendingUserInput
        ) {
          throw new StaleQueuedPromptReservationError()
        }
        // A rejected turn write leaves the original FIFO item durable. No
        // compensating enqueue is needed while storage is still unavailable.
        session.queuedPrompts = session.queuedPrompts!.slice(1)
        session.queuedCount = session.queuedPrompts.length
        session.queuedPromptReservation = undefined
        // If shutdown interrupts the committed handoff, even a refused
        // cancellation write leaves its text recoverable after restart.
        session.sdkQueueAdmission = {
          assistantId, userId, prompt: structuredClone(head), startedAt: createdAt,
        }
        session.failedPrompt = { content: head.content, failedAt: createdAt, uncertain: true }
      }
      session.messages.push(
        { id: userId, role: 'user', content, createdAt },
        { id: assistantId, role: 'assistant', content: '', createdAt, streaming: true },
      )
      session.updatedAt = createdAt
      session.status = 'running'
      session.activity = 'Thinking'
      if (session.messages.filter((message) => message.role === 'user').length === 1) {
        session.title = content.length > 52 ? `${content.slice(0, 52)}…` : content
      }
    })
  }

  async settleSdkQueueAdmission(
    sessionId: string,
    assistantId: string,
    started: boolean,
    canBecomeIdle: () => boolean = () => true,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const admission = session.sdkQueueAdmission!
      if (!started) {
        const queue = session.queuedPrompts || []
        if (queue.some((prompt) => prompt.id === admission.prompt.id)) {
          throw new Error('A cancelled admission conflicts with the canonical queue')
        }
        session.queuedPrompts = [admission.prompt, ...queue]
        session.queuedCount = session.queuedPrompts.length
        session.messages = session.messages.filter((message) =>
          message.id !== admission.assistantId && message.id !== admission.userId)
        if (canBecomeIdle()) {
          session.status = session.pendingPermission || session.pendingUserInput ? 'waiting' : 'idle'
          session.activity = session.pendingPermission?.title || session.pendingUserInput?.question
        }
      }
      if (session.failedPrompt?.failedAt === admission.startedAt) session.failedPrompt = undefined
      session.sdkQueueAdmission = undefined
    }, (session) => session.sdkQueueAdmission?.assistantId === assistantId)
  }

  async cancelPromptAdmission(
    sessionId: string,
    assistantId: string,
    canBecomeIdle: () => boolean = () => true,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const index = session.messages.findIndex((message) => message.id === assistantId)
      const assistant = session.messages[index]
      const user = session.messages[index - 1]
      if (!assistant || assistant.role !== 'assistant' || user?.role !== 'user') return
      assistant.streaming = false
      assistant.content = 'Not sent: the session service stopped before provider dispatch.'
      if (canBecomeIdle()) {
        session.status = session.pendingPermission || session.pendingUserInput ? 'waiting' : 'idle'
        session.activity = session.pendingPermission?.title || session.pendingUserInput?.question
      }
      if (!session.failedPrompt) {
        session.failedPrompt = { content: user.content, failedAt: new Date().toISOString() }
      }
    })
  }

  terminalQueueDispatch(sessionId: string): TerminalQueueDispatch | undefined {
    const dispatch = this.state.sessions[sessionId]?.terminalQueueDispatch
    return !this.isRetiredSession(sessionId) && dispatch ? { ...dispatch } : undefined
  }

  async claimTerminalQueuedPrompt(
    sessionId: string,
    expected: QueuedPrompt,
    isCurrent: () => boolean,
  ): Promise<{ session: SessionDetail; dispatch: TerminalQueueDispatch }> {
    this.lastTerminalQueueDispatchAt = Math.max(Date.now(), this.lastTerminalQueueDispatchAt + 1)
    const dispatch = { id: randomUUID(), startedAt: new Date(this.lastTerminalQueueDispatchAt).toISOString() }
    const session = await this.mutate(sessionId, (stored) => {
      const head = stored.queuedPrompts?.[0]
      if (
        !isCurrent() || stored.suspended || stored.status !== 'idle' ||
        stored.pendingPermission || stored.pendingUserInput ||
        stored.terminalQueueDispatch || stored.failedPrompt ||
        !head || head.id !== expected.id || head.content !== expected.content ||
        head.createdAt !== expected.createdAt || head.command !== expected.command
      ) {
        throw Object.assign(new Error('The queued prompt changed before delivery; nothing was sent'), { statusCode: 409 })
      }
      stored.queuedPrompts = stored.queuedPrompts!.slice(1)
      stored.queuedCount = stored.queuedPrompts.length
      // Existing recovery state also protects against automatic replay by older runtimes.
      stored.failedPrompt = { content: head.content, failedAt: dispatch.startedAt, uncertain: true }
      stored.terminalQueueDispatch = dispatch
      stored.queueDispatchAt = dispatch.startedAt
      stored.status = 'running'
      stored.activity = 'Dispatching queued prompt'
    })
    return { session, dispatch }
  }

  async settleTerminalQueuedPrompt(
    sessionId: string,
    dispatchId: string,
    outcome: TerminalQueueOutcome,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (stored) => {
      const dispatch = stored.terminalQueueDispatch
      if (
        dispatch?.id !== dispatchId ||
        stored.failedPrompt?.failedAt !== dispatch.startedAt
      ) {
        throw Object.assign(new Error('The terminal queue dispatch no longer owns this recovery'), { statusCode: 409 })
      }
      stored.terminalQueueDispatch = undefined
      if (outcome.kind === 'accepted') {
        stored.failedPrompt = undefined
        if (outcome.notice) {
          const createdAt = new Date().toISOString()
          stored.messages.push({
            id: `terminal-command:${dispatch.id}`,
            role: 'notice',
            content: outcome.notice,
            createdAt,
          })
          stored.updatedAt = createdAt
        }
      } else {
        stored.failedPrompt.uncertain = outcome.uncertain || undefined
      }
      if (stored.queueDispatchAt !== dispatch.startedAt) return
      if (outcome.kind === 'accepted' && outcome.startedTurn) {
        if (stored.status === 'running') stored.activity = 'Sent queued prompt'
        return
      }
      stored.queueDispatchAt = undefined
      stored.status = stored.pendingPermission || stored.pendingUserInput ? 'waiting' : 'idle'
      stored.activity = stored.pendingPermission?.title || stored.pendingUserInput?.question
    })
  }

  async removeQueuedPrompt(
    sessionId: string,
    promptId: string,
  ): Promise<{ session: SessionDetail; prompt?: QueuedPrompt }> {
    let removed: QueuedPrompt | undefined
    const session = await this.mutate(sessionId, (stored) => {
      const queue = stored.queuedPrompts || []
      const index = queue.findIndex((prompt) => prompt.id === promptId)
      if (index >= 0) {
        removed = queue[index]
        stored.queuedPrompts = queue.filter((prompt) => prompt.id !== promptId)
        stored.queuedCount = stored.queuedPrompts.length
      }
    })
    return { session, prompt: removed }
  }

  /**
   * Takes a prompt off the queue and records it as needing recovery, together.
   *
   * Two writes would leave a window where both copies are on disk: a restart
   * between them delivers the prompt again while the reader has already been
   * handed the text back, so it arrives twice.
   */
  async setFailedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
    uncertain = false,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (stored) => {
      if (stored.terminalQueueDispatch || stored.sdkQueueAdmission) {
        throw Object.assign(new Error('The queued prompt is still awaiting delivery confirmation'), { statusCode: 409 })
      }
      const queue = stored.queuedPrompts || []
      stored.queuedPrompts = queue.filter((prompt) => prompt.id !== promptId)
      stored.queuedCount = stored.queuedPrompts.length
      stored.failedPrompt = {
        content,
        failedAt: new Date().toISOString(),
        ...(uncertain ? { uncertain: true } : {}),
      }
    })
  }

  /**
   * Queues a prompt and lets go of the failure it answers, in one write.
   *
   * Done as two, a crash in between leaves the retry on the queue and the
   * marker still on disk, and after a restart the reader is handed the text
   * again while the first copy is still waiting to go.
   */
  async enqueueAnsweringPrompt(
    sessionId: string,
    prompt: QueuedPrompt,
    answers: string | undefined,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (session.terminalQueueDispatch || session.sdkQueueAdmission) {
        throw Object.assign(new Error('The queued prompt is still awaiting delivery confirmation'), { statusCode: 409 })
      }
      const queue = session.queuedPrompts || []
      session.queuedPrompts = [...queue, prompt]
      session.queuedCount = session.queuedPrompts.length
      if (
        session.failedPrompt &&
        (answers === undefined || session.failedPrompt.failedAt === answers)
      ) {
        session.failedPrompt = undefined
        session.recoveryResend = undefined
      }
    })
  }

  async claimFailedPrompt(
    sessionId: string,
    expected: NonNullable<SessionDetail['failedPrompt']>,
    submitted: string,
    claimedAt: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (stored) => {
      if (
        !claimedAt || claimedAt === expected.failedAt ||
        stored.terminalQueueDispatch || stored.sdkQueueAdmission ||
        !stored.failedPrompt ||
        stored.failedPrompt.failedAt !== expected.failedAt ||
        stored.failedPrompt.content !== expected.content
      ) {
        throw Object.assign(
          new Error('That recovery decision has already been used. Review the current recovered prompt.'),
          { statusCode: 409 },
        )
      }
      // Consume the old token before delivery. The new token describes an
      // unresolved attempt, including the edited text, even if no later write
      // can commit or the process exits before it can record the receipt.
      stored.failedPrompt = { content: submitted, failedAt: claimedAt, uncertain: true }
      stored.recoveryResend = { content: submitted, failedAt: claimedAt, accepted: false }
    })
  }

  // Projection reads recovery metadata without cloning the session's history.
  failedPrompt(sessionId: string): SessionDetail['failedPrompt'] {
    const failed = this.state.sessions[sessionId]?.failedPrompt
    return !this.isRetiredSession(sessionId) && failed ? structuredClone(failed) : undefined
  }

  recoveryResend(sessionId: string): RecoveryResend | undefined {
    const session = this.state.sessions[sessionId]
    const resend = session?.recoveryResend
    return !this.isRetiredSession(sessionId) && resend?.failedAt === session?.failedPrompt?.failedAt
      ? structuredClone(resend)
      : undefined
  }

  async acceptRecoveryResend(sessionId: string, expected: string): Promise<SessionDetail> {
    if (this.closed) throw new Error('Session store is closed')
    if (this.recoveryResend(sessionId)?.accepted) return this.requireSession(sessionId)
    return this.mutate(sessionId, (stored) => {
      stored.recoveryResend!.accepted = true
    }, (stored) => stored.failedPrompt?.failedAt === expected && stored.recoveryResend?.failedAt === expected)
  }

  async prepareRecoveryDecision(sessionId: string, expected: string, next: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (stored) => {
      if (!next || next === expected || stored.failedPrompt?.failedAt !== expected ||
          stored.recoveryResend?.failedAt !== expected || stored.recoveryResend.accepted ||
          stored.sdkQueueAdmission || stored.terminalQueueDispatch) {
        throw Object.assign(new Error('That recovery attempt no longer owns this decision'), { statusCode: 409 })
      }
      stored.failedPrompt.failedAt = next
      stored.failedPrompt.uncertain = true
      stored.recoveryResend = undefined
    })
  }

  async clearFailedPrompt(sessionId: string, expected?: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (stored) => {
      if (stored.terminalQueueDispatch || stored.sdkQueueAdmission) {
        throw Object.assign(new Error('The queued prompt is still awaiting delivery confirmation'), { statusCode: 409 })
      }
      stored.failedPrompt = undefined
      stored.recoveryResend = undefined
    }, expected === undefined ? undefined : (stored) => stored.failedPrompt?.failedAt === expected)
  }

  async shiftQueuedPrompt(
    sessionId: string,
  ): Promise<{ session: SessionDetail; prompt?: QueuedPrompt }> {
    if (
      !this.pendingPersist &&
      !this.writingState &&
      !this.state.sessions[sessionId]?.queuedPrompts?.length
    ) {
      return { session: this.requireSession(sessionId) }
    }
    let prompt: QueuedPrompt | undefined
    const session = await this.mutate(sessionId, (stored) => {
      prompt = stored.queuedPrompts?.shift()
      stored.queuedCount = stored.queuedPrompts?.length || 0
    })
    return { session, prompt }
  }

  queueDispatchAt(sessionId: string): string | undefined {
    return this.state.sessions[sessionId]?.queueDispatchAt
  }

  async markTerminalPromptDispatched(
    sessionId: string,
    dispatchedAt: string,
    activity = 'Sent queued prompt',
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.queueDispatchAt = dispatchedAt
      session.status = 'running'
      session.activity = activity
    })
  }

  async clearQueueDispatch(
    sessionId: string,
    dispatchedAt: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (session.queueDispatchAt === dispatchedAt) {
        session.queueDispatchAt = undefined
      }
    })
  }

  async clearUntrackedTerminalDispatch(
    sessionId: string,
    dispatchedAt: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (session.queueDispatchAt !== dispatchedAt) {
        return
      }
      session.queueDispatchAt = undefined
      session.status = 'idle'
    })
  }

  async remove(sessionId: string): Promise<void> {
    await this.change((state) => {
      const existing = state.sessions[sessionId]
      if (existing) {
        // Retirement must outlive the last descendant, even if provider cleanup failed.
        this.retire(state, [...(existing.replacedSessionIds || []), sessionId])
      }
      delete state.sessions[sessionId]
      return () => undefined
    }, true)
    await this.removeUploads(sessionId)
  }

  async saveUpload(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    if (this.closed) throw new Error('Session store is closed')
    const writing = this.writeUpload(sessionId, filename, data)
    this.fileWrites.add(writing)
    try {
      return await writing
    } finally {
      this.fileWrites.delete(writing)
    }
  }

  private async writeUpload(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    this.requireSession(sessionId)
    const uploads = path.join(this.directory, 'uploads', sessionId)
    await mkdir(uploads, { recursive: true, mode: 0o700 })
    const name = safeUploadName(filename)
    const storedName = `${randomUUID()}-${name}`
    const filePath = path.join(uploads, storedName)
    await writeFile(filePath, data, { flag: 'wx', mode: 0o600 })
    return {
      name,
      path: filePath,
      size: data.length,
    }
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.messages.push(message)
      session.updatedAt = message.createdAt
    })
  }

  async startToolActivity(
    sessionId: string,
    toolCallId: string,
    content: string,
    createdAt: string,
    activityKind: ActivityKind = 'tool',
    activityGroupId?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const id = `tool:${toolCallId}`
      session.messages.push({
        id,
        role: 'activity',
        content,
        createdAt,
        activityStatus: 'running',
        activityKind,
        activityGroupId,
      })
      session.activity = content.split('\n', 1)[0]
      session.updatedAt = createdAt
    })
  }

  async finishToolActivity(
    sessionId: string,
    toolCallId: string,
    success: boolean,
    completedAt?: string,
    result?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const activity = session.messages.find(
        (message) => message.id === `tool:${toolCallId}`,
      )
      if (activity) {
        activity.activityStatus = success ? 'completed' : 'failed'
        const duration = completedAt
          ? activityDuration(activity.createdAt, completedAt)
          : undefined
        if (duration !== undefined) {
          activity.activityDurationMs = duration
        }
        if (result?.trim()) {
          activity.activityResult = activityResultPreview(result)
        } else if (!success) {
          activity.activityResult = 'Error: tool failed; inspect the session log'
        }
      }

      session.activity = session.messages
        .findLast(
          (message) =>
            message.role === 'activity' &&
            message.activityStatus === 'running',
        )
        ?.content.split('\n', 1)[0]
    })
  }

  async finishTaskCompletion(
    sessionId: string,
    toolCallId: string,
    content: string,
    completedAt: string,
    assistantMessageId?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const activityId = `tool:${toolCallId}`
      const activity = session.messages.find(
        (message) => message.id === activityId,
      )
      const assistant = assistantMessageId
        ? session.messages.find(
            (message) => message.id === assistantMessageId,
          )
        : undefined

      for (const message of session.messages) {
        if (
          message.role === 'activity' &&
          message.activityStatus === 'running'
        ) {
          message.activityStatus = 'completed'
        }
      }

      session.messages = session.messages.filter(
        (message) => message !== activity && message !== assistant,
      )
      session.messages.push({
        id: assistant?.id || activityId,
        role: 'assistant',
        content,
        createdAt: completedAt,
        streaming: false,
      })
      session.activity = undefined
      session.updatedAt = completedAt
    })
  }

  streamMessage(sessionId: string, messageId: string, chunk: string): SessionDetail {
    return this.mutateInMemory({
      kind: 'append',
      sessionId,
      messageId,
      content: chunk,
      updatedAt: new Date().toISOString(),
      revisions: 1,
    })
  }

  setMessageContent(
    sessionId: string,
    messageId: string,
    content: string,
  ): SessionDetail {
    return this.mutateInMemory({
      kind: 'content',
      sessionId,
      messageId,
      content,
      updatedAt: new Date().toISOString(),
      revisions: 1,
    })
  }

  async finishMessage(sessionId: string, messageId: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const message = session.messages.find((entry) => entry.id === messageId)
      if (!message) {
        throw new Error(`Message ${messageId} does not exist`)
      }
      message.streaming = false
      const admission = session.sdkQueueAdmission
      if (admission?.assistantId === messageId) {
        if (session.failedPrompt?.failedAt === admission.startedAt) session.failedPrompt = undefined
        session.sdkQueueAdmission = undefined
      }
      session.updatedAt = new Date().toISOString()
    })
  }

  async updateStatus(
    sessionId: string,
    status: SessionStatus,
    activity?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.status = status
      session.activity = activity
      session.updatedAt = new Date().toISOString()
    })
  }

  async clearPendingRequest(
    sessionId: string,
    kind: 'pendingPermission' | 'pendingUserInput',
    requestId: string,
    continuation?:
      | { status: SessionStatus; activity?: string }
      | ((session: Readonly<SessionDetail>) => { status: SessionStatus; activity?: string }),
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session[kind] = undefined
      if (continuation) {
        const next = typeof continuation === 'function' ? continuation(session) : continuation
        session.status = session.pendingPermission || session.pendingUserInput
          ? 'waiting'
          : next.status
        session.activity = session.pendingPermission?.title ||
          session.pendingUserInput?.question ||
          next.activity
      }
    }, (session) => session[kind]?.requestId === requestId)
  }

  async update(
    sessionId: string,
    mutation: (session: SessionDetail) => void,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, mutation)
  }

  /** A false result is an explicit no-op; validation and write errors still reject. */
  async updateIf(
    sessionId: string,
    mutation: (session: SessionDetail) => boolean,
  ): Promise<SessionDetail | undefined> {
    return this.change((state) => {
      const existing = state.sessions[sessionId]
      if (!existing || this.retiredIds(state).has(sessionId)) {
        throw new Error(`Session ${sessionId} does not exist`)
      }
      const session = structuredClone(existing)
      if (!mutation(session)) {
        return () => undefined
      }
      session.revision = Math.max(existing.revision ?? 0, session.revision ?? 0) + 1
      state.sessions[sessionId] = session
      return () => this.requireSession(sessionId)
    })
  }

  private mutateInMemory(change: StreamMutation): SessionDetail {
    const { sessionId, messageId } = change
    if (this.closed) return this.requireSession(sessionId)
    const session = this.state.sessions[sessionId]
    if (!session || this.isRetiredSession(sessionId)) {
      throw new Error(`Session ${sessionId} does not exist`)
    }
    if (!this.streamTarget(session.messages, messageId)) {
      throw new Error(`Message ${messageId} does not exist`)
    }
    if (this.state === this.checkpoint) {
      this.state = { ...this.state, sessions: { ...this.state.sessions } }
    }
    this.applyStream(this.state, change, this.liveMutableSessions)

    // Keep only changes, not history snapshots, between checkpoints. Consecutive
    // tokens share one entry; their position relative to awaited mutations is
    // preserved even when those mutations are still waiting to start writing.
    const previous = this.pendingChanges.at(-1)
    if (
      change.kind === 'append' &&
      previous?.kind === 'append' &&
      previous.sessionId === sessionId &&
      previous.messageId === messageId
    ) {
      previous.content += change.content
      previous.updatedAt = change.updatedAt
      previous.revisions += 1
    } else {
      this.pendingChanges.push(change)
    }
    return this.requireSession(sessionId)
  }

  private applyStream(
    state: StoredState,
    change: StreamMutation,
    mutableSessions: WeakSet<StoredSession>,
  ): void {
    let session = state.sessions[change.sessionId]
    if (!session || this.retiredIds(state).has(change.sessionId)) {
      return
    }
    if (!mutableSessions.has(session)) {
      // Detach once per live view/batch, not once per token. Neither the last
      // checkpoint nor an in-flight snapshot may share mutable messages.
      session = structuredClone(session)
      state.sessions[change.sessionId] = session
      mutableSessions.add(session)
    }
    const message = this.streamTarget(session.messages, change.messageId)
    if (message) {
      if (change.kind === 'append') {
        message.content += change.content
      } else {
        message.content = change.content
        for (const entry of session.messages) {
          if (entry.role === 'activity' && entry.activityStatus === 'running') {
            entry.activityStatus = 'completed'
          }
        }
        session.activity = undefined
      }
      session.updatedAt = change.updatedAt
    }
    // A clear may remove a message before its later deltas are checkpointed.
    // Its snapshot must still outrank the live view those deltas published.
    session.revision = (session.revision ?? 0) + change.revisions
  }

  private restoreStreams(changes: PendingChange[]): void {
    this.pendingChanges = [
      ...changes.filter((change) => change.kind !== 'mutation'),
      ...this.pendingChanges,
    ]
  }

  private streamTarget(messages: ChatMessage[], id: string): ChatMessage | undefined {
    let targets = this.streamTargets.get(messages)
    if (!targets) {
      targets = new Map()
      this.streamTargets.set(messages, targets)
    }
    const cached = targets.get(id)
    if (cached) {
      return cached
    }
    const message = messages.find((entry) => entry.id === id)
    if (message) {
      targets.set(id, message)
    }
    return message
  }

  private requireSession(sessionId: string): SessionDetail {
    const session = this.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} does not exist`)
    }
    return session
  }

  private async mutate(
    sessionId: string,
    mutation: (session: StoredSession) => void,
    condition?: (session: StoredSession) => boolean,
  ): Promise<SessionDetail> {
    return this.change((state) => {
      const existing = state.sessions[sessionId]
      if (!existing || this.retiredIds(state).has(sessionId)) {
        throw new Error(`Session ${sessionId} does not exist`)
      }
      if (condition && !condition(existing)) {
        return () => this.requireSession(sessionId)
      }
      const session = structuredClone(existing)
      mutation(session)
      session.revision = Math.max(existing.revision ?? 0, session.revision ?? 0) + 1
      state.sessions[sessionId] = session
      return () => this.requireSession(sessionId)
    })
  }

  private change<T>(
    mutation: (state: StoredState) => () => T,
    separateCommit = false,
  ): Promise<T> {
    if (this.closed) return Promise.reject(new Error('Session store is closed'))
    return new Promise((resolve, reject) => {
      this.pendingChanges.push({
        kind: 'mutation',
        separateCommit,
        apply: (state) => {
          const result = mutation(state)
          return () => {
            try {
              resolve(result())
            } catch (error) {
              reject(error)
            }
          }
        },
        reject,
      })
      // Only the batch that actually prepares this mutation may settle it.
      // A preceding destructive boundary can leave it waiting for another write.
      void this.persist()
    })
  }

  private takeBatch(): PendingChange[] {
    // Destructive operations commit alone. Earlier results are resolved while
    // their IDs still exist; following callers cannot inherit this write's error.
    const boundary = this.pendingChanges.findIndex(
      (change) => change.kind === 'mutation' && change.separateCommit,
    )
    const earlierMutation = boundary >= 0 && this.pendingChanges
      .slice(0, boundary)
      .some((change) => change.kind === 'mutation')
    const end = boundary < 0
      ? this.pendingChanges.length
      : earlierMutation ? boundary : boundary + 1
    const changes = this.pendingChanges.splice(0, end)
    if (this.pendingChanges.some((change) => change.kind === 'mutation')) {
      void this.persist()
    }
    return changes
  }

  // Settle outstanding writes so a caller can know that stopping is complete.
  // Without this a write can land after shutdown, against a directory the
  // caller believes it is free to remove.
  async flush(): Promise<void> {
    let current: Promise<void>
    let failure: unknown
    let failed = false
    do {
      current = this.writeQueue
      try {
        await current
      } catch (error) {
        failure = error
        failed = true
      }
    } while (current !== this.writeQueue)
    if (failed) {
      throw failure
    }
  }

  close(): Promise<void> {
    if (!this.closing) {
      this.closed = true
      this.closing = (async () => {
        const files = await Promise.allSettled([...this.fileWrites])
        await this.flush()
        if (this.pendingChanges.length) await this.persist(true)
        const failures = files.flatMap((result) => result.status === 'rejected' ? [result.reason] : [])
        if (failures.length) throw new AggregateError(failures, 'Session uploads did not finish cleanly')
      })()
    }
    return this.closing
  }

  private persist(checkpointStreams = false): Promise<void> {
    if (this.pendingPersist) {
      return this.pendingPersist
    }
    const task = this.writeQueue.catch(() => undefined).then(async () => {
      // Close the batch before preparing/serializing it. A call arriving during
      // I/O belongs to the next write, never to this write's acknowledgement.
      this.pendingPersist = undefined
      const changes = this.takeBatch()
      let candidate = {
        ...this.checkpoint,
        sessions: { ...this.checkpoint.sessions },
      }
      const mutableSessions = new WeakSet<StoredSession>()
      const applied: (() => void)[] = []
      let durableChange = false
      try {
        for (const change of changes) {
          if (change.kind !== 'mutation') {
            this.applyStream(candidate, change, mutableSessions)
            continue
          }
          const draft = { ...candidate, sessions: { ...candidate.sessions } }
          try {
            const resolve = change.apply(draft)
            durableChange ||= (
              draft.retiredSessionIds !== candidate.retiredSessionIds ||
              Object.keys(draft.sessions).length !== Object.keys(candidate.sessions).length ||
              Object.entries(draft.sessions).some(
                ([id, session]) => session !== candidate.sessions[id],
              )
            )
            candidate = draft
            applied.push(resolve)
          } catch (error) {
            change.reject(error)
          }
        }
        if (changes.length && !durableChange && !checkpointStreams) {
          this.restoreStreams(changes)
          for (const resolve of applied) {
            resolve()
          }
          return
        }
        const snapshot = JSON.stringify(candidate)
        this.writingState = candidate
        const temporaryPath = `${this.statePath}.tmp`
        await writeFile(temporaryPath, snapshot, { mode: 0o600 })
        await rename(temporaryPath, this.statePath)
        // Only replay live deltas over the committed candidate. Applying queued
        // mutations here would publish changes whose own write can still fail.
        const visible = { ...candidate, sessions: { ...candidate.sessions } }
        const liveMutableSessions = new WeakSet<StoredSession>()
        for (const change of this.pendingChanges) {
          if (change.kind !== 'mutation') {
            this.applyStream(visible, change, liveMutableSessions)
          }
        }
        this.checkpoint = candidate
        this.state = visible
        this.liveMutableSessions = liveMutableSessions
      } catch (error) {
        this.restoreStreams(changes)
        for (const change of changes) {
          if (change.kind === 'mutation') {
            change.reject(error)
          }
        }
        throw error
      } finally {
        this.writingState = undefined
      }
      // Read results only after installation, including newer live deltas and
      // the rest of this successful batch, never a later uncommitted mutation.
      for (const resolve of applied) {
        resolve()
      }
    })
    this.pendingPersist = task
    this.writeQueue = task
    void task.catch(() => undefined)
    return task
  }

  private removeUploads(sessionId: string): Promise<void> {
    return rm(path.join(this.directory, 'uploads', sessionId), {
      recursive: true,
      force: true,
    })
  }
}

function safeUploadName(filename: string): string {
  const basename = path.basename(filename.trim()) || 'upload'
  const normalized = basename
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 120)
  return normalized && normalized !== '.' && normalized !== '..'
    ? normalized
    : 'upload'
}
