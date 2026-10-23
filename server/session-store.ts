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
  SessionRecoveryReason,
  SessionStatus,
  SessionRetentionPatch,
  ActivityKind,
} from '../shared/contracts.js'
import { resolveDataDirectory } from './paths.js'
import { canArchiveSession, mergeSessionRetention, sessionRetentionSchema } from './session-retention.js'

export interface DiscoveredSession {
  id: string
  cwd: string
  title: string
  updatedAt: string
}

export interface TerminalQueueDispatch {
  id: string
  startedAt: string
  prompt: QueuedPrompt
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

export interface RecoverySeed {
  prompt: string
  state: 'pending' | 'dispatching' | 'failed'
  startedAt?: string
  error?: string
}

export interface TranscriptObservation {
  epoch: string | undefined
  isCurrent?: () => boolean
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

/**
 * Refuses work on a session kept for review: an interrupted or archived
 * record's queue, runtime, and pending briefs stay exactly as they are until
 * the reader reopens it.
 */
export class RetainedSessionError extends Error {
  readonly statusCode = 409
  readonly uncertainDelivery = false
  readonly reasonCode: `retained-session.${'archived' | 'interrupted'}`

  constructor(state: 'archived' | 'interrupted', action: string) {
    super(`Reopen the ${state} session before ${action}. Nothing was changed.`)
    this.name = 'RetainedSessionError'
    this.reasonCode = `retained-session.${state}`
  }
}

export function assertSessionNotRetained(
  session: Pick<SessionDetail, 'archivedAt' | 'interruption'> | undefined,
  action: string,
  archivedOnly = false,
): void {
  if (session?.archivedAt) throw new RetainedSessionError('archived', action)
  if (!archivedOnly && session?.interruption) throw new RetainedSessionError('interrupted', action)
}

export function isRetainedRefusal(error: unknown): error is RetainedSessionError {
  return error instanceof RetainedSessionError
}

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
  archivedMessages?: ChatMessage[]
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
  recoverySeed?: RecoverySeed
  uploadOwnerIds?: string[]
  transcriptEpoch?: string
  lastClaimedRecovery?: string
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

function archivedMessage(message: ChatMessage): ChatMessage {
  const archived = {
    ...message,
    streaming: false,
  }
  if (
    archived.role === 'activity' &&
    archived.activityStatus === 'running'
  ) {
    archived.activityStatus = 'failed'
    archived.activityResult =
      'Stopped when the provider conversation was recovered.'
  }
  return archived
}

function ownsRecoverySeedFailure(session: StoredSession): boolean {
  return Boolean(session.recoverySeed && session.failedPrompt &&
    session.failedPrompt.failedAt === session.recovery?.recoveredAt)
}

function clearRecoverySeedFailure(session: StoredSession): void {
  if (!ownsRecoverySeedFailure(session)) return
  const failedAt = session.failedPrompt!.failedAt
  session.failedPrompt = undefined
  if (session.recoveryResend?.failedAt === failedAt) {
    session.recoveryResend = undefined
  }
}

/**
 * A live tmux session the app sends work or answers to, relaunches, clears,
 * suspends, or resumes is one the app now owns, so it joins boot recovery
 * like one the app created there. Discovery alone never calls this.
 */
function grantTerminalRecovery(session: StoredSession): void {
  if (session.backend === 'terminal' && session.isOpen === true) {
    session.managedOpen = true
  }
}

// A committed session is never changed in place: every change installs a new
// object for the session it changes. Each one's encoded form can therefore be
// reused by every later write it is still part of, so a write serializes and
// encodes only what changed rather than the whole state.
const serializedSessions = new WeakMap<object, Buffer>()

function encode(value: unknown): Buffer | undefined {
  const serialized = JSON.stringify(value) as string | undefined
  return serialized === undefined ? undefined : Buffer.from(serialized, 'utf8')
}

/** Byte-for-byte the UTF-8 encoding of `JSON.stringify(state)`. */
export function serializeState(state: StoredState): Buffer {
  return Buffer.concat(serializeStateChunks(state))
}

// Small pieces are joined into writes of up to `JOINED_WRITE_BYTES`; a larger
// one, such as a large session, is written as views of its cached bytes of up
// to `WRITE_LIMIT_BYTES`, never copied. Views much smaller than that make a
// large store measurably slower to write, for no benefit.
const JOINED_WRITE_BYTES = 64 * 1024
const WRITE_LIMIT_BYTES = 1024 * 1024

/**
 * The same bytes as `serializeState`, in pieces of at most `WRITE_LIMIT_BYTES`
 * to write one after another, each whole UTF-8, so a large state is never
 * copied into one buffer just to be written.
 */
export function serializeStateChunks(state: StoredState): Buffer[] {
  const chunks: Buffer[] = [Buffer.from('{')]
  let first = true
  for (const [key, value] of Object.entries(state)) {
    const serialized = key === 'sessions' && value && typeof value === 'object' && !Array.isArray(value)
      ? serializeSessions(value as Record<string, StoredSession>)
      : encode(value)
    if (serialized === undefined) continue
    chunks.push(Buffer.from(`${first ? '' : ','}${JSON.stringify(key)}:`, 'utf8'))
    chunks.push(...(Array.isArray(serialized) ? serialized : [serialized]))
    first = false
  }
  chunks.push(Buffer.from('}'))
  const writes: Buffer[] = []
  let small: Buffer[] = []
  let smallBytes = 0
  const flush = () => {
    if (small.length) writes.push(small.length === 1 ? small[0] : Buffer.concat(small, smallBytes))
    small = []
    smallBytes = 0
  }
  for (const chunk of chunks) {
    if (chunk.length >= JOINED_WRITE_BYTES) {
      flush()
      let start = 0
      while (chunk.length - start > WRITE_LIMIT_BYTES) {
        let end = start + WRITE_LIMIT_BYTES
        // Back off continuation bytes so no character is split.
        while ((chunk[end] & 0xc0) === 0x80) end -= 1
        writes.push(chunk.subarray(start, end))
        start = end
      }
      writes.push(chunk.subarray(start))
      continue
    }
    if (smallBytes + chunk.length > JOINED_WRITE_BYTES) flush()
    small.push(chunk)
    smallBytes += chunk.length
  }
  flush()
  return writes
}

function serializeSessions(sessions: Record<string, StoredSession>): Buffer[] {
  const chunks: Buffer[] = [Buffer.from('{')]
  let first = true
  for (const [id, session] of Object.entries(sessions)) {
    const cacheable = session !== null && typeof session === 'object'
    let serialized = cacheable ? serializedSessions.get(session) : undefined
    if (serialized === undefined) {
      serialized = encode(session)
      if (serialized === undefined) continue
      if (cacheable) serializedSessions.set(session, serialized)
    }
    chunks.push(Buffer.from(`${first ? '' : ','}${JSON.stringify(id)}:`, 'utf8'), serialized)
    first = false
  }
  chunks.push(Buffer.from('}'))
  return chunks
}

// Tests freeze every committed session, so a change made in place -- which
// would leave a stale serialized copy behind -- fails where it happens.
const freezeCommittedSessions = process.env.AGENTIC_REMOTE_STORE_FREEZE === '1'

function freezeDeep(value: unknown): void {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return
  Object.freeze(value)
  for (const entry of Object.values(value)) freezeDeep(entry)
}

function freezeCommitted(state: StoredState): void {
  if (!freezeCommittedSessions) return
  for (const session of Object.values(state.sessions)) freezeDeep(session)
}

function cloneSession(session: StoredSession): SessionDetail {
  const {
    archivedMessages,
    managedOpen: _managedOpen,
    backend,
    customTitle: _customTitle,
    queueDispatchAt: _queueDispatchAt,
    terminalQueueDispatch,
    queuedPromptReservation: _queuedPromptReservation,
    sdkQueueAdmission,
    recoveryResend: _recoveryResend,
    recoverySeed,
    uploadOwnerIds: _uploadOwnerIds,
    transcriptEpoch: _transcriptEpoch,
    lastClaimedRecovery: _lastClaimedRecovery,
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
  if (ownsRecoverySeedFailure(session)) detail.failedPrompt = undefined
  if (detail.interruption) {
    detail.status = 'error'
    detail.activity = 'Session process stopped. History and queued work are retained. Reopen to continue.'
  }
  if (recoverySeed?.state === 'failed') {
    detail.status = 'error'
    detail.activity = recoverySeed.error ||
      'Recovery brief delivery failed. The preserved queue is blocked.'
  } else if (recoverySeed?.state === 'pending') {
    detail.activity = 'Waiting to rebuild provider context. Preserved queued work is blocked.'
  } else if (recoverySeed?.state === 'dispatching' && detail.status === 'idle') {
    detail.activity = 'Rebuilding provider context. Preserved queued work is blocked.'
  }
  return {
    ...detail,
    messages: [...(archivedMessages || []), ...detail.messages],
    executionMode: backend === 'terminal' ? 'tmux' : 'sdk',
    ...(recoverySeed ? { recoverySeedState: recoverySeed.state } : {}),
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
  private readonly observationOwners = new Map<string, symbol>()

  constructor(
    directory = resolveDataDirectory(),
    private readonly now: () => number = Date.now,
  ) {
    this.directory = directory
    this.statePath = path.join(directory, 'state.json')
  }

  async initialize(): Promise<void> {
    if (this.closed) throw new Error('Session store is closed')
    this.observationOwners.clear()
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
    let staleSdkInteractionMarked = false
    for (const session of Object.values(loaded.sessions)) {
      if (session.retention !== undefined && !sessionRetentionSchema.safeParse(session.retention).success) {
        throw new Error('Invalid session retention metadata')
      }
      if (session.retentionLastUsedAt !== undefined && !Number.isFinite(Date.parse(session.retentionLastUsedAt))) {
        throw new Error('Invalid session retention activity timestamp')
      }
      if (session.interruption !== undefined && (
        !session.interruption || typeof session.interruption !== 'object' ||
        !Number.isFinite(Date.parse(session.interruption.detectedAt)) ||
        !['idle', 'running', 'waiting', 'error'].includes(session.interruption.previousStatus)
      )) throw new Error('Invalid session interruption metadata')
      if (session.replacedSessionIds !== undefined) {
        if (!isSessionIdList(session.replacedSessionIds)) {
          throw new Error('Invalid session retirement metadata')
        }
        for (const id of session.replacedSessionIds) legacyRetirements.push(id)
      }
      session.revision ??= 0
      if (session.transcriptEpoch !== undefined &&
          (typeof session.transcriptEpoch !== 'string' || !session.transcriptEpoch)) {
        throw new Error('Invalid transcript admission metadata')
      }
      if (session.lastClaimedRecovery !== undefined &&
          (typeof session.lastClaimedRecovery !== 'string' || !session.lastClaimedRecovery)) {
        throw new Error('Invalid recovery claim metadata')
      }
      session.provider ??= 'copilot'
      session.isOpen = session.managedOpen === true || (session.isOpen === true && Boolean(
        session.retention?.pinned || session.queuedPrompts?.length || session.pendingPermission ||
        session.pendingUserInput || session.failedPrompt || session.recoverySeed ||
        session.queuedDispatch || session.terminalQueueDispatch || session.sdkQueueAdmission,
      ))
      if (session.managedOpen && !session.interruption &&
          (session.status === 'running' || session.status === 'waiting' || session.status === 'error')) {
        session.interruption = {
          detectedAt: new Date(this.now()).toISOString(), previousStatus: session.status,
        }
        staleSdkInteractionMarked = true
      }
      session.queuedPrompts ??= []
      session.queuedCount = session.queuedPrompts.length
      session.queuedPromptReservation = undefined
      const staleSdkInteraction =
        session.backend === 'sdk' &&
        Boolean(session.pendingPermission || session.pendingUserInput)
      if (staleSdkInteraction) {
        if (session.pendingPermission) session.pendingPermission.stale = true
        if (session.pendingUserInput) session.pendingUserInput.stale = true
        session.status = 'error'
        session.activity = 'Provider interaction expired. Recover the conversation to continue.'
        staleSdkInteractionMarked = true
      } else if (session.backend !== 'terminal') {
        session.pendingUserInput = undefined
      }
      const resend = session.recoveryResend
      if (resend !== undefined && (
        !resend || typeof resend !== 'object' || Array.isArray(resend) ||
        typeof resend.failedAt !== 'string' || !resend.failedAt ||
        typeof resend.content !== 'string' || !resend.content.trim() ||
        typeof resend.accepted !== 'boolean'
      )) throw new Error('Invalid recovery resend metadata')
      const seed = session.recoverySeed
      if (seed !== undefined && (
        !seed || typeof seed !== 'object' || Array.isArray(seed) ||
        typeof seed.prompt !== 'string' || !seed.prompt.trim() ||
        !['pending', 'dispatching', 'failed'].includes(seed.state) ||
        (seed.startedAt !== undefined &&
          (typeof seed.startedAt !== 'string' || !Number.isFinite(Date.parse(seed.startedAt)))) ||
        (seed.error !== undefined && typeof seed.error !== 'string')
      )) throw new Error('Invalid recovery seed metadata')
      if (session.uploadOwnerIds !== undefined && !isSessionIdList(session.uploadOwnerIds)) {
        throw new Error('Invalid upload ownership metadata')
      }
      if (seed?.state === 'dispatching') {
        seed.state = 'failed'
        seed.error = 'Recovery brief delivery was interrupted after dispatch began; delivery is uncertain and was not retried.'
        session.status = 'error'
        session.activity = seed.error
        staleSdkInteractionMarked = true
      } else if (seed?.state === 'failed') {
        session.status = 'error'
        session.activity = seed.error || 'Recovery brief delivery failed. The preserved queue is blocked.'
      }
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
      } else if (!staleSdkInteraction && !session.recoverySeed && session.status !== 'idle') {
        session.status = 'idle'
        session.activity = undefined
        if (session.backend !== 'terminal') {
          session.pendingPermission = undefined
          session.pendingUserInput = undefined
        }
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
    freezeCommitted(loaded)
    this.state = loaded
    this.checkpoint = loaded
    this.liveMutableSessions = new WeakSet()
    if (staleSdkInteractionMarked) {
      const temporaryPath = `${this.statePath}.tmp`
      await writeFile(temporaryPath, JSON.stringify(loaded), { mode: 0o600 })
      await rename(temporaryPath, this.statePath)
    }
  }

  list(): SessionDetail[] {
    return Object.values(this.state.sessions)
      .filter((session) => !this.isRetiredSession(session.id))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(cloneSession)
  }

  /**
   * Each listed session's identity and open state, in `list()` order, without
   * copying its history, for work that runs on every discovery cycle.
   */
  discoveryIndex(): { id: string; isOpen: boolean; revision: number; interruptedAt?: string; archivedAt?: string }[] {
    return Object.values(this.state.sessions)
      .filter((session) => !this.isRetiredSession(session.id))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map((session) => ({
        id: session.id, isOpen: session.isOpen === true, revision: session.revision ?? 0,
        interruptedAt: session.interruption?.detectedAt, archivedAt: session.archivedAt,
      }))
  }

  /** A listed session's title, without copying its history. */
  title(id: string): string | undefined {
    if (!Object.hasOwn(this.state.sessions, id) || this.isRetiredSession(id)) {
      return undefined
    }
    return this.state.sessions[id]?.title
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

  /** An in-memory lifetime, independent of streaming revisions and persistence. */
  captureOwnership(id: string): () => boolean {
    if (this.closed || !Object.hasOwn(this.state.sessions, id) || this.isRetiredSession(id)) {
      return () => false
    }
    const owner = this.observationOwners.get(id) ?? Symbol()
    this.observationOwners.set(id, owner)
    return () => !this.closed && this.observationOwners.get(id) === owner &&
      Object.hasOwn(this.state.sessions, id) && !this.isRetiredSession(id)
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
      return () => {
        this.observationOwners.delete(incoming.id)
        return this.requireSession(incoming.id)
      }
    }, retired.length > 0)
  }

  async syncDiscovered(
    sessions: DiscoveredSession[],
    isCurrent?: () => boolean,
  ): Promise<void> {
    return this.change((state) => {
      if (isCurrent && !isCurrent()) return () => undefined
      const changedOwners: string[] = []
      for (const discovered of sessions) {
        if (this.retiredIds(state).has(discovered.id)) continue
        const previous = state.sessions[discovered.id]
        if (previous) {
          const cwd = previous.contextCwd ? previous.cwd : discovered.cwd
          const title =
            previous.customTitle || previous.workspaceTitle || !discovered.title
              ? previous.title
              : discovered.title
          const updatedAt =
            discovered.updatedAt > previous.updatedAt
              ? discovered.updatedAt
              : previous.updatedAt
          const isOpen = previous.isOpen ?? false
          if (
            cwd === previous.cwd &&
            title === previous.title &&
            updatedAt === previous.updatedAt &&
            isOpen === previous.isOpen
          ) {
            continue
          }
          const existing = {
            ...previous,
            revision: (previous.revision ?? 0) + 1,
            cwd,
            title,
            updatedAt,
            isOpen,
          }
          if (cwd !== previous.cwd) changedOwners.push(discovered.id)
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
      return () => {
        for (const id of changedOwners) this.observationOwners.delete(id)
      }
    })
  }

  async replaceMessages(
    sessionId: string,
    messages: ChatMessage[],
    observation = this.observeTranscript(sessionId),
  ): Promise<SessionDetail | undefined> {
    return this.installTranscript(sessionId, observation, (session) => {
      session.messages = messages
      return true
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
    observation = this.observeTranscript(sessionId),
  ): Promise<SessionDetail | undefined> {
    return this.installTranscript(sessionId, observation, (session) => {
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
      return true
    })
  }

  observeTranscript(sessionId: string, isCurrent?: () => boolean): TranscriptObservation {
    const session = this.state.sessions[sessionId]
    if (!session || this.isRetiredSession(sessionId)) {
      throw new Error(`Session ${sessionId} does not exist`)
    }
    return { epoch: session.transcriptEpoch, isCurrent }
  }

  isCurrentTranscript(sessionId: string, observation: TranscriptObservation): boolean {
    const session = this.state.sessions[sessionId]
    return Boolean(session && !this.isRetiredSession(sessionId) &&
      session.transcriptEpoch === observation.epoch && (observation.isCurrent?.() ?? true))
  }

  async updateTranscriptIfCurrent(
    sessionId: string,
    observation: TranscriptObservation,
    mutation: (session: SessionDetail) => boolean,
  ): Promise<SessionDetail | undefined> {
    return this.installTranscript(sessionId, observation, mutation)
  }

  private installTranscript(
    sessionId: string,
    observation: TranscriptObservation,
    mutation: (session: StoredSession) => boolean,
  ): Promise<SessionDetail | undefined> {
    return this.change((state) => {
      const existing = state.sessions[sessionId]
      if (!existing || this.retiredIds(state).has(sessionId) ||
          existing.transcriptEpoch !== observation.epoch || observation.isCurrent?.() === false) {
        return () => undefined
      }
      const session = structuredClone(existing)
      if (!mutation(session)) return () => undefined
      session.revision = Math.max(existing.revision ?? 0, session.revision ?? 0) + 1
      state.sessions[sessionId] = session
      return () => this.requireSession(sessionId)
    })
  }

  private isProtectedRecord(session: StoredSession): boolean {
    return Boolean(session.retention?.pinned ||
      session.queuedPrompts?.length || session.pendingPermission || session.pendingUserInput ||
      session.failedPrompt || session.recoverySeed || session.queuedDispatch ||
      session.terminalQueueDispatch || session.sdkQueueAdmission || session.queuedPromptReservation)
  }

  private isArchivable(session: StoredSession): boolean {
    return !this.isProtectedRecord(session) && canArchiveSession(session, this.now())
  }

  /**
   * Sessions an archival pass would retire now, given the owners it saw. The
   * caller confirms each one's absence before the decision is committed.
   */
  archivalCandidates(presentIds: Iterable<string>): string[] {
    const present = new Set(presentIds)
    const retired = this.retiredIds(this.state)
    return Object.values(this.state.sessions)
      .filter((session) => !present.has(session.id) && !retired.has(session.id) && this.isArchivable(session))
      .map((session) => session.id)
  }

  /**
   * Archives one record whose owner was just confirmed absent. Eligibility and
   * `canArchive` are both evaluated when the write commits, never from a copy
   * read before the probe.
   */
  async archiveIfExpired(sessionId: string, canArchive: () => boolean): Promise<SessionDetail | undefined> {
    return this.change((state) => {
      const session = state.sessions[sessionId]
      if (!session || this.retiredIds(state).has(sessionId) || !this.isArchivable(session) || !canArchive()) {
        return () => undefined
      }
      const archivedAt = new Date(this.now()).toISOString()
      state.sessions[sessionId] = {
        ...session, revision: (session.revision ?? 0) + 1, isOpen: false, managedOpen: false, archivedAt,
      }
      return () => this.requireSession(sessionId)
    })
  }

  /**
   * `canArchive` is consulted when the write commits, after every earlier
   * write has landed, so an owner, admission or probe that appeared after the
   * caller took its snapshot still prevents archival.
   */
  async syncOpen(
    sessionIds: string[],
    isCurrent?: () => boolean,
    canArchive?: (sessionId: string) => boolean,
  ): Promise<void> {
    const active = new Set(sessionIds)
    return this.change((state) => {
      if (isCurrent && !isCurrent()) return () => undefined
      for (const session of Object.values(state.sessions)) {
        if (this.retiredIds(state).has(session.id)) continue
        const present = active.has(session.id)
        const protectedRecord = this.isProtectedRecord(session)
        const archive = !present && !protectedRecord && canArchiveSession(session, this.now()) &&
          (canArchive?.(session.id) ?? true)
        const isOpen = !archive && (
          present ||
          // A suspended session has nothing running by design. Reading that as
          // closed would hide it from the list, and the only way back to it is
          // the button on the session itself.
          (session.suspended === true && !session.archivedAt) ||
          session.managedOpen === true ||
          (session.isOpen === true && protectedRecord))
        const interruption = present ? undefined
          : isOpen && session.backend === 'terminal' && !session.suspended
            ? session.interruption ?? {
              detectedAt: new Date(this.now()).toISOString(), previousStatus: session.status,
            }
            : session.interruption
        const stalePermission = Boolean(interruption && session.pendingPermission && !session.pendingPermission.stale)
        const staleInput = Boolean(interruption && session.pendingUserInput && !session.pendingUserInput.stale)
        if (session.isOpen === isOpen && session.interruption === interruption && !stalePermission && !staleInput) continue
        state.sessions[session.id] = {
          ...session,
          revision: (session.revision ?? 0) + 1,
          isOpen,
          interruption,
          pendingPermission: stalePermission ? { ...session.pendingPermission!, stale: true } : session.pendingPermission,
          pendingUserInput: staleInput ? { ...session.pendingUserInput!, stale: true } : session.pendingUserInput,
          ...(archive ? { managedOpen: false, archivedAt: new Date(this.now()).toISOString() } : {}),
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
          if (session.backend === 'terminal' && session.isOpen === true && !session.interruption) {
            continue
          }
          // Observed presence only. Any Copilot process in a tmux pane is
          // listed here, including one-shot runs another tool started, and
          // those must not come back as windows after a restart. Recovery
          // intent is granted by the app paths that create or drive a session.
          state.sessions[session.id] = {
            ...session,
            revision: (session.revision ?? 0) + 1,
            backend: 'terminal',
            isOpen: true,
            interruption: undefined,
            archivedAt: undefined,
          }
        } else if (
          !session.backend &&
          (knownSdk.has(session.id) || session.managedOpen === true)
        ) {
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
      .filter((session) => this.shouldRecoverTerminalSession(session.id))
      .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt))
      .map(cloneSession)
  }

  shouldRecoverTerminalSession(id: string): boolean {
    const session = this.state.sessions[id]
    return this.isManagedOpen(id) && session?.backend === 'terminal' &&
      session.suspended !== true
  }

  /**
   * Records that the app has just acted on a live tmux session's process.
   * Called before anything else that can fail afterwards, so the session it
   * drove is never left out of boot recovery. Writes only when that changes.
   */
  async claimTerminalRecovery(sessionId: string): Promise<void> {
    const claimable = (session: StoredSession | undefined) =>
      session?.managedOpen !== true && session?.backend === 'terminal' &&
      session.isOpen === true
    if (this.isRetiredSession(sessionId) || !claimable(this.state.sessions[sessionId])) return
    await this.mutate(sessionId, grantTerminalRecovery, claimable)
  }

  isManagedOpen(sessionId: string): boolean {
    return this.state.sessions[sessionId]?.managedOpen === true && !this.isRetiredSession(sessionId)
  }

  async setOpen(
    sessionId: string,
    isOpen: boolean,
    managedOpen = false,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.isOpen = isOpen
      if (isOpen) {
        session.retentionLastUsedAt = new Date(this.now()).toISOString()
        if (session.interruption && (session.backend === 'sdk' ||
            session.pendingPermission?.stale || session.pendingUserInput?.stale)) {
          session.status = 'error'
          session.activity = 'Previous provider runtime stopped. Send a new prompt or recover to continue.'
        }
        session.interruption = undefined
        session.archivedAt = undefined
      }
      if (managedOpen) {
        session.managedOpen = isOpen
      }
    })
  }

  /**
   * Applies a field-level edit to the current durable value at commit time,
   * so concurrent edits of different fields compose instead of clobbering.
   */
  async configureRetention(sessionId: string, input: SessionRetentionPatch): Promise<SessionDetail> {
    mergeSessionRetention(undefined, input)
    return this.mutate(sessionId, (session) => {
      session.retention = mergeSessionRetention(session.retention, input)
    })
  }

  async markInterrupted(sessionId: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.interruption ??= {
        detectedAt: new Date(this.now()).toISOString(),
        previousStatus: session.status,
      }
      if (session.pendingPermission) session.pendingPermission.stale = true
      if (session.pendingUserInput) session.pendingUserInput.stale = true
    }, (session) => !session.interruption ||
      Boolean(session.pendingPermission && !session.pendingPermission.stale) ||
      Boolean(session.pendingUserInput && !session.pendingUserInput.stale))
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
      grantTerminalRecovery(session)
      session.status = 'idle'
      session.interruption = undefined
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
      clearRecoverySeedFailure(session)
      session.transcriptEpoch = randomUUID()
      session.archivedMessages = undefined
      session.messages = []
      session.status = 'idle'
      session.isOpen = true
      session.activity = undefined
      session.pendingPermission = undefined
      session.pendingUserInput = undefined
      session.recovery = undefined
      session.recoverySeed = undefined
      session.queuedPrompts = []
      session.queuedCount = 0
      session.queueDispatchAt = undefined
      session.terminalQueueDispatch = undefined
      if (session.runtime) {
        session.runtime.contextTokens = undefined
        session.runtime.contextEstimated = undefined
      }
      session.updatedAt = new Date().toISOString()
    }, undefined, true)
  }

  async replaceWithClearedSession(
    sessionId: string,
    replacementId: string,
    observation = this.observeTranscript(sessionId),
    // The app relaunched the session's own tmux pane for the replacement.
    terminalReset = false,
  ): Promise<SessionDetail> {
    let uploadOwnerIds: string[] = []
    const replacement = await this.change((state) => {
      const existing = state.sessions[sessionId]
      if (!existing || this.retiredIds(state).has(sessionId)) {
        throw new Error(`Session ${sessionId} does not exist`)
      }
      if (existing.id !== sessionId || existing.transcriptEpoch !== observation.epoch ||
          observation.isCurrent?.() === false ||
          existing.status === 'running' || existing.status === 'waiting' ||
          existing.pendingPermission || existing.pendingUserInput ||
          existing.sdkQueueAdmission || existing.terminalQueueDispatch) {
        throw Object.assign(new Error('Conversation changed before clearing; no replacement was committed'), { statusCode: 409 })
      }
      if (
        sessionId === replacementId ||
        Object.hasOwn(state.sessions, replacementId) ||
        this.retiredIds(state).has(replacementId)
      ) {
        throw new Error('Replacement session identity is not available')
      }
      uploadOwnerIds = [...new Set([...(existing.uploadOwnerIds || []), sessionId])]
      const clearSeedFailure = ownsRecoverySeedFailure(existing)
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
        archivedMessages: undefined,
        messages: [],
        status: 'idle',
        isOpen: true,
        interruption: undefined,
        archivedAt: undefined,
        activity: undefined,
        pendingPermission: undefined,
        pendingUserInput: undefined,
        recovery: undefined,
        failedPrompt: clearSeedFailure ? undefined : existing.failedPrompt,
        recoveryResend: clearSeedFailure ? undefined : existing.recoveryResend,
        queuedPrompts: [],
        queuedCount: 0,
        queueDispatchAt: undefined,
        terminalQueueDispatch: undefined,
        queuedPromptReservation: undefined,
        sdkQueueAdmission: undefined,
        recoverySeed: undefined,
        uploadOwnerIds: undefined,
        transcriptEpoch: undefined,
        updatedAt: new Date().toISOString(),
        runtime: existing.runtime
          ? {
              ...existing.runtime,
              contextTokens: undefined,
              contextEstimated: undefined,
            }
          : undefined,
      }
      if (terminalReset) grantTerminalRecovery(state.sessions[replacementId])
      this.retire(state, [...(existing.replacedSessionIds || []), sessionId])
      delete state.sessions[sessionId]
      return () => {
        this.observationOwners.delete(sessionId)
        this.observationOwners.delete(replacementId)
        return this.requireSession(replacementId)
      }
    }, true)
    try {
      await this.removeUploadOwners(uploadOwnerIds)
    } catch (error) {
      throw new SessionReplacementCleanupError(replacement, error)
    }
    return replacement
  }

  async replaceWithRecoveredSession(
    sessionId: string,
    replacementId: string,
    reason: SessionRecoveryReason,
    contextMessageCount: number,
    contextTruncated: boolean,
    recoveryPrompt: string,
    observation = this.observeTranscript(sessionId),
    // The app relaunched the session's own tmux pane for the replacement.
    terminalReset = false,
  ): Promise<SessionDetail> {
    const replacement = await this.change((state) => {
      const existing = state.sessions[sessionId]
      if (!existing || this.retiredIds(state).has(sessionId)) {
        throw new Error(`Session ${sessionId} does not exist`)
      }
      const pendingIsStale =
        existing.pendingPermission?.stale === true ||
        existing.pendingUserInput?.stale === true
      const hasLivePendingInteraction =
        Boolean(existing.pendingPermission || existing.pendingUserInput) &&
        !pendingIsStale
      if (
        existing.id !== sessionId ||
        existing.transcriptEpoch !== observation.epoch ||
        observation.isCurrent?.() === false ||
        existing.status === 'running' ||
        (existing.status === 'waiting' && !pendingIsStale) ||
        hasLivePendingInteraction ||
        existing.sdkQueueAdmission ||
        existing.terminalQueueDispatch
      ) {
        throw Object.assign(
          new Error('Conversation changed before recovery; no replacement was committed'),
          { statusCode: 409 },
        )
      }
      if (
        sessionId === replacementId ||
        Object.hasOwn(state.sessions, replacementId) ||
        this.retiredIds(state).has(replacementId)
      ) {
        throw new Error('Replacement session identity is not available')
      }
      const recoveredAt = new Date().toISOString()
      const priorMessages = [
        ...(existing.archivedMessages || []),
        ...existing.messages,
      ].map(archivedMessage)
      const boundary: ChatMessage = {
        id: randomUUID(),
        role: 'notice',
        content: 'Provider conversation was replaced. Earlier messages are read-only history; a bounded text-only recovery brief must be admitted before preserved queued work can continue. Connection-specific tool state is not restored.',
        createdAt: recoveredAt,
      }
      state.sessions[replacementId] = {
        ...existing,
        id: replacementId,
        replacedSessionIds: [
          ...(existing.replacedSessionIds || []),
          sessionId,
        ],
        revision: (existing.revision ?? 0) + 1,
        customTitle: true,
        archivedMessages: [...priorMessages, boundary],
        messages: [],
        status: 'idle',
        isOpen: true,
        interruption: undefined,
        archivedAt: undefined,
        activity: undefined,
        pendingPermission: undefined,
        pendingUserInput: undefined,
        // Older readers do not understand recoverySeed, but preserve this
        // existing queue barrier even when startup resets status to idle.
        failedPrompt: { content: recoveryPrompt, failedAt: recoveredAt },
        recoveryResend: undefined,
        lastClaimedRecovery: undefined,
        queuedPrompts: [...(existing.queuedPrompts || [])],
        queuedCount: existing.queuedPrompts?.length || 0,
        queueDispatchAt: undefined,
        terminalQueueDispatch: undefined,
        queuedPromptReservation: undefined,
        sdkQueueAdmission: undefined,
        transcriptEpoch: undefined,
        recoverySeed: {
          prompt: recoveryPrompt,
          state: 'pending',
        },
        uploadOwnerIds: [
          ...new Set([
            ...(existing.uploadOwnerIds || []),
            sessionId,
          ]),
        ],
        updatedAt: recoveredAt,
        recovery: {
          recoveredAt,
          archivedMessageCount: priorMessages.length,
          contextMessageCount,
          contextTruncated,
          reason,
        },
        runtime: existing.runtime
          ? {
              ...existing.runtime,
              contextTokens: undefined,
              contextEstimated: undefined,
            }
          : undefined,
      }
      if (terminalReset) grantTerminalRecovery(state.sessions[replacementId])
      this.retire(state, [...(existing.replacedSessionIds || []), sessionId])
      delete state.sessions[sessionId]
      return () => {
        this.observationOwners.delete(sessionId)
        this.observationOwners.delete(replacementId)
        return this.requireSession(replacementId)
      }
    }, true)
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
      grantTerminalRecovery(session)
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
      assertSessionNotRetained(existing, 'dispatching its queue')
      if (
        !isCurrent() || existing.suspended ||
        (existing.status !== 'idle' && existing.status !== 'error') ||
        existing.failedPrompt || existing.recoverySeed || existing.terminalQueueDispatch ||
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
    options: {
      preserveTitle?: boolean
      recoverySeedPrompt?: string
    } = {},
  ): Promise<SessionDetail> {
    const userId = randomUUID()
    return this.mutate(sessionId, (session) => {
      this.lastSdkAdmissionAt = Math.max(
        Date.now(), this.lastSdkAdmissionAt + 1,
        (Date.parse(session.lastClaimedRecovery || '') || 0) + 1,
      )
      const createdAt = new Date(this.lastSdkAdmissionAt).toISOString()
      if (session.interruption || session.archivedAt) {
        throw Object.assign(new Error('Reopen the interrupted session before sending. Nothing was sent.'), {
          statusCode: 409, uncertainDelivery: false,
        })
      }
      if (session.suspended) {
        throw Object.assign(new Error('Resume the session before sending to it'), { statusCode: 409, uncertainDelivery: false })
      }
      if (!isCurrent()) {
        throw Object.assign(new Error('The session changed before turn admission; nothing was sent'), { statusCode: 409 })
      }
      if (session.status !== 'idle' && session.status !== 'error') {
        throw Object.assign(new Error('A turn can only start while the session is idle'), { statusCode: 409 })
      }
      if (options.recoverySeedPrompt) {
        if (
          session.recoverySeed?.state !== 'dispatching' ||
          session.recoverySeed.prompt !== options.recoverySeedPrompt
        ) {
          throw Object.assign(new Error('The recovery seed is no longer dispatching'), { statusCode: 409 })
        }
      } else if (session.recoverySeed) {
        throw Object.assign(new Error('The recovery brief must be admitted before other work can run'), { statusCode: 409 })
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
      session.transcriptEpoch = assistantId
      session.updatedAt = createdAt
      session.status = 'running'
      session.activity = 'Thinking'
      if (
        !options.preserveTitle &&
        session.messages.filter((message) => message.role === 'user').length === 1
      ) {
        session.title = content.length > 52 ? `${content.slice(0, 52)}…` : content
      }
    })
  }

  recoverySeed(sessionId: string): RecoverySeed | undefined {
    const seed = this.state.sessions[sessionId]?.recoverySeed
    return !this.isRetiredSession(sessionId) && seed ? structuredClone(seed) : undefined
  }

  async claimRecoverySeed(sessionId: string, prompt: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (session.recoverySeed?.state !== 'pending' || session.recoverySeed.prompt !== prompt) {
        throw Object.assign(new Error('The recovery seed is no longer pending'), { statusCode: 409 })
      }
      assertSessionNotRetained(session, 'sending its context brief')
      session.recoverySeed = {
        prompt,
        state: 'dispatching',
        startedAt: new Date().toISOString(),
      }
      if (session.failedPrompt && ownsRecoverySeedFailure(session)) session.failedPrompt.uncertain = true
    })
  }

  async admitRecoverySeed(
    sessionId: string,
    prompt: string,
    terminalDispatchedAt?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (session.recoverySeed?.state !== 'dispatching' || session.recoverySeed.prompt !== prompt) {
        throw Object.assign(new Error('The recovery seed is no longer dispatching'), { statusCode: 409 })
      }
      clearRecoverySeedFailure(session)
      session.recoverySeed = undefined
      if (terminalDispatchedAt) {
        session.queueDispatchAt = terminalDispatchedAt
        session.status = 'running'
        session.activity = 'Rebuilding provider context'
      }
    })
  }

  async failRecoverySeed(
    sessionId: string,
    prompt: string,
    error: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (!session.recoverySeed || session.recoverySeed.prompt !== prompt) return
      session.recoverySeed = {
        ...session.recoverySeed,
        state: 'failed',
        error,
      }
      session.status = 'error'
      session.activity = error
    })
  }

  async beginSdkFollowUp(
    sessionId: string,
    content: string,
    assistantId: string,
    previousAssistantId: string,
    isCurrent: () => boolean,
  ): Promise<SessionDetail> {
    const userId = randomUUID()
    return this.mutate(sessionId, (session) => {
      this.lastSdkAdmissionAt = Math.max(
        Date.now(),
        this.lastSdkAdmissionAt + 1,
      )
      const createdAt = new Date(this.lastSdkAdmissionAt).toISOString()
      if (session.suspended) {
        throw Object.assign(
          new Error('Resume the session before sending to it'),
          { statusCode: 409 },
        )
      }
      if (!isCurrent()) {
        throw Object.assign(
          new Error(
            'The session changed before follow-up admission; nothing was sent',
          ),
          { statusCode: 409 },
        )
      }
      const previous = session.messages.find(
        (message) => message.id === previousAssistantId,
      )
      if (!previous || previous.role !== 'assistant') {
        throw Object.assign(
          new Error('The active response changed before follow-up admission'),
          { statusCode: 409 },
        )
      }
      previous.streaming = false
      session.messages.push(
        { id: userId, role: 'user', content, createdAt },
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt,
          streaming: true,
        },
      )
      session.transcriptEpoch = assistantId
      session.updatedAt = createdAt
      session.status = 'running'
      session.activity = 'Thinking'
    })
  }

  async cancelSdkFollowUp(
    sessionId: string,
    assistantId: string,
    previousAssistantId: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const assistantIndex = session.messages.findIndex(
        (message) => message.id === assistantId,
      )
      if (assistantIndex < 1) {
        throw new Error('The follow-up admission is no longer current')
      }
      const user = session.messages[assistantIndex - 1]
      if (user?.role !== 'user') {
        throw new Error('The follow-up admission has no matching user message')
      }
      session.messages.splice(assistantIndex - 1, 2)
      const previous = session.messages.find(
        (message) => message.id === previousAssistantId,
      )
      if (previous?.role === 'assistant') {
        previous.streaming = true
      }
      session.transcriptEpoch = previousAssistantId
      session.status = 'running'
      session.activity = 'Thinking'
      session.updatedAt = new Date().toISOString()
    })
  }

  async failSdkFollowUp(
    sessionId: string,
    assistantId: string,
    message: string,
    uncertainContent?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const assistant = session.messages.find(
        (entry) => entry.id === assistantId,
      )
      if (assistant?.role === 'assistant') {
        assistant.streaming = false
        assistant.content =
          `Follow-up delivery is uncertain: ${message}`
      }
      if (uncertainContent) {
        session.failedPrompt = {
          content: uncertainContent,
          failedAt: randomUUID(),
          uncertain: true,
        }
        session.recoveryResend = undefined
      }
      session.status = 'error'
      session.activity = undefined
      session.updatedAt = new Date().toISOString()
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
    failure?: { message: string; uncertain?: boolean },
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const index = session.messages.findIndex((message) => message.id === assistantId)
      const assistant = session.messages[index]
      const user = session.messages[index - 1]
      if (!assistant || assistant.role !== 'assistant' || user?.role !== 'user') return
      assistant.streaming = false
      assistant.content = failure?.message || 'Not sent: the session service stopped before provider dispatch.'
      if (canBecomeIdle()) {
        session.status = session.pendingPermission || session.pendingUserInput ? 'waiting' : 'idle'
        session.activity = session.pendingPermission?.title || session.pendingUserInput?.question
      }
      if (!session.failedPrompt) {
        const failedAt = new Date(Math.max(
          Date.now(), (Date.parse(session.lastClaimedRecovery || '') || 0) + 1,
        )).toISOString()
        session.failedPrompt = {
          content: user.content, failedAt, ...(failure?.uncertain ? { uncertain: true } : {}),
        }
      }
    })
  }

  async failSdkQueueAdmission(
    sessionId: string,
    assistantId: string,
    message: string,
    canBecomeIdle: () => boolean = () => true,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const admission = session.sdkQueueAdmission!
      if (session.failedPrompt?.failedAt === admission.startedAt) session.failedPrompt.uncertain = true
      const assistant = session.messages.find((entry) => entry.id === assistantId)
      if (assistant) {
        assistant.streaming = false
        assistant.content = message
      }
      session.sdkQueueAdmission = undefined
      if (canBecomeIdle()) {
        session.status = session.pendingPermission || session.pendingUserInput ? 'waiting' : 'error'
        session.activity = session.pendingPermission?.title || session.pendingUserInput?.question
      }
    }, (session) => session.sdkQueueAdmission?.assistantId === assistantId)
  }

  terminalQueueDispatch(sessionId: string): TerminalQueueDispatch | undefined {
    const dispatch = this.state.sessions[sessionId]?.terminalQueueDispatch
    return !this.isRetiredSession(sessionId) && dispatch ? { ...dispatch } : undefined
  }

  async claimTerminalQueuedPrompt(
    sessionId: string,
    expected: QueuedPrompt,
    isCurrent: () => boolean,
    requireManagedTerminal = false,
    // A steer typed into the running turn: the turn's status is left alone.
    midTurnSteer = false,
  ): Promise<{ session: SessionDetail; dispatch: TerminalQueueDispatch }> {
    this.lastTerminalQueueDispatchAt = Math.max(Date.now(), this.lastTerminalQueueDispatchAt + 1)
    const dispatch = {
      id: randomUUID(),
      startedAt: new Date(this.lastTerminalQueueDispatchAt).toISOString(),
      prompt: structuredClone(expected),
    }
    const session = await this.mutate(sessionId, (stored) => {
      // Retention committed after the drain's check still wins: nothing is claimed.
      assertSessionNotRetained(stored, 'dispatching its queue')
      const head = stored.queuedPrompts?.[0]
      if (
        !isCurrent() || stored.suspended ||
        (midTurnSteer ? stored.status !== 'running' || head?.steer !== true : stored.status !== 'idle') ||
        (requireManagedTerminal && (!stored.isOpen || stored.managedOpen !== true || stored.backend !== 'terminal')) ||
        stored.pendingPermission || stored.pendingUserInput || stored.recoverySeed ||
        stored.terminalQueueDispatch || stored.failedPrompt || stored.recoverySeed ||
        !head || head.id !== expected.id || head.content !== expected.content ||
        head.createdAt !== expected.createdAt || head.command !== expected.command ||
        head.steer !== expected.steer
      ) {
        throw Object.assign(new Error('The queued prompt changed before delivery; nothing was sent'), { statusCode: 409 })
      }
      stored.queuedPrompts = stored.queuedPrompts!.slice(1)
      stored.queuedCount = stored.queuedPrompts.length
      // Existing recovery state also protects against automatic replay by older runtimes.
      stored.failedPrompt = { content: head.content, failedAt: dispatch.startedAt, uncertain: true }
      stored.terminalQueueDispatch = dispatch
      if (midTurnSteer) return
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
      } else if (outcome.uncertain) {
        stored.failedPrompt.uncertain = outcome.uncertain || undefined
      } else {
        stored.queuedPrompts = [dispatch.prompt, ...(stored.queuedPrompts || [])]
        stored.queuedCount = stored.queuedPrompts.length
        stored.failedPrompt = undefined
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
      assertSessionNotRetained(stored, 'changing its queue')
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

  /** Rewrites a queued prompt where it stands, keeping its place in line. */
  async updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<{ session: SessionDetail; prompt?: QueuedPrompt }> {
    let updated: QueuedPrompt | undefined
    const session = await this.mutate(sessionId, (stored) => {
      assertSessionNotRetained(stored, 'changing its queue')
      const queue = stored.queuedPrompts || []
      const index = queue.findIndex((prompt) => prompt.id === promptId)
      if (index < 0) {
        return
      }
      // The flag says whether this waits as a slash command, and it is decided
      // by the text. Kept from before, a message rewritten into a command --
      // or a command rewritten into plain text -- waited as the thing it used
      // to be, and the queue then ran it as the wrong kind.
      const isCommand = content.startsWith('/')
      updated = { ...queue[index], content }
      if (isCommand) {
        updated.command = true
      } else {
        delete updated.command
      }
      stored.queuedPrompts = queue.map((prompt, at) =>
        at === index ? updated! : prompt,
      )
    })
    return { session, prompt: updated }
  }

  /**
   * Puts the queue in the order given.
   *
   * Only a rearrangement: every prompt named has to be one that is already
   * waiting, and every prompt waiting has to be named. Anything else is an
   * order built from a list the caller has since stopped agreeing with -- a
   * prompt sent or removed while they were dragging -- and applying it would
   * drop work or resurrect it.
   */
  async reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (stored) => {
      assertSessionNotRetained(stored, 'changing its queue')
      const queue = stored.queuedPrompts || []
      if (order.length !== queue.length) {
        throw Object.assign(
          new Error('The queue changed while it was being reordered'),
          // Carries a status so the reason reaches the reader: unclassified it
          // arrives as a generic server error, which says nothing about what
          // happened or what to do about it.
          { statusCode: 409 },
        )
      }
      const byId = new Map(queue.map((prompt) => [prompt.id, prompt]))
      const next: QueuedPrompt[] = []
      for (const id of order) {
        const prompt = byId.get(id)
        if (!prompt) {
          throw Object.assign(
          new Error('The queue changed while it was being reordered'),
          // Carries a status so the reason reaches the reader: unclassified it
          // arrives as a generic server error, which says nothing about what
          // happened or what to do about it.
          { statusCode: 409 },
        )
        }
        byId.delete(id)
        next.push(prompt)
      }
      stored.queuedPrompts = next
    })
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
      grantTerminalRecovery(session)
      if (
        !session.recoverySeed &&
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
        stored.recoverySeed || stored.terminalQueueDispatch || stored.sdkQueueAdmission ||
        !stored.failedPrompt ||
        stored.failedPrompt.failedAt !== expected.failedAt ||
        stored.failedPrompt.content !== expected.content
      ) {
        throw Object.assign(
          new Error('That recovery decision has already been used. Review the current recovered prompt.'),
          { statusCode: 409 },
        )
      }
      // Checked in the same write that consumes the token: an interruption or
      // archive committed after the caller's precheck must leave it intact.
      if (stored.interruption || stored.archivedAt) {
        throw Object.assign(
          new Error('Reopen the retained session before resending. Nothing was sent.'),
          { statusCode: 409, uncertainDelivery: false },
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
    const session = this.state.sessions[sessionId]
    const failed = session?.failedPrompt
    return !this.isRetiredSession(sessionId) && failed && !ownsRecoverySeedFailure(session)
      ? structuredClone(failed) : undefined
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
      // The receipt is of a resend the app delivered, so intent rides with it.
      grantTerminalRecovery(stored)
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

  async claimRecoveryPrompt(
    sessionId: string,
    prompt: QueuedPrompt,
    token: string,
    isCurrent: (session: Readonly<SessionDetail>) => boolean,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (!token || session.failedPrompt?.failedAt !== token || session.lastClaimedRecovery === token) {
        throw Object.assign(new Error('That recovery has already been handled or replaced; refresh before retrying.'), { statusCode: 409 })
      }
      if (session.recoverySeed || session.terminalQueueDispatch || session.sdkQueueAdmission ||
          session.suspended || !isCurrent(session)) {
        throw Object.assign(new Error('The session changed before recovery admission; the recovery was not consumed.'), { statusCode: 409 })
      }
      // Consumption and retained work are one durable operation. A replay
      // cannot append another copy or clear a different recovery.
      session.queuedPrompts = [...(session.queuedPrompts || []), prompt]
      session.queuedCount = session.queuedPrompts.length
      session.lastClaimedRecovery = token
      session.failedPrompt = undefined
      session.recoveryResend = undefined
      if (session.status === 'error') {
        session.status = session.pendingPermission || session.pendingUserInput ? 'waiting' : 'idle'
        session.activity = session.pendingPermission?.title || session.pendingUserInput?.question
      }
    })
  }

  async clearFailedPrompt(sessionId: string, expected?: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (stored) => {
      if (stored.recoverySeed) {
        throw Object.assign(new Error('The recovery brief must be admitted before its queue barrier can be cleared'), { statusCode: 409 })
      }
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
      assertSessionNotRetained(stored, 'dispatching its queue')
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
      grantTerminalRecovery(session)
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

  /**
   * Retires identities that never became sessions here, such as a temporary
   * fork that could not be deleted, so discovery never adopts them.
   */
  async retireSessionIds(ids: readonly string[]): Promise<void> {
    if (!ids.length) return
    await this.change((state) => {
      this.retire(state, ids)
      return () => undefined
    }, true)
  }

  async remove(sessionId: string): Promise<void> {
    let uploadOwnerIds: string[] = []
    await this.change((state) => {
      const existing = state.sessions[sessionId]
      if (existing) {
        uploadOwnerIds = [...new Set([...(existing.uploadOwnerIds || []), sessionId])]
        // Retirement must outlive the last descendant, even if provider cleanup failed.
        this.retire(state, [...(existing.replacedSessionIds || []), sessionId])
      }
      delete state.sessions[sessionId]
      return () => { this.observationOwners.delete(sessionId) }
    }, true)
    await this.removeUploadOwners(uploadOwnerIds)
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
    replaceOwner = false,
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
      const ownerChanged = replaceOwner || existing.cwd !== session.cwd ||
        existing.provider !== session.provider || existing.backend !== session.backend ||
        Boolean(existing.suspended) !== Boolean(session.suspended)
      return () => {
        if (ownerChanged) this.observationOwners.delete(sessionId)
        return this.requireSession(sessionId)
      }
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

  /**
   * Proves the state file can still be replaced before startup recovery acts.
   *
   * Periodic discovery skips unchanged state, but cold startup must fail
   * before touching terminal ownership when persistence is unavailable.
   */
  async verifyPersistence(): Promise<void> {
    if (this.closed) throw new Error('Session store is closed')
    await this.flush()
    await this.persist(true)
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
        const snapshot = serializeStateChunks(candidate)
        this.writingState = candidate
        const temporaryPath = `${this.statePath}.tmp`
        await writeFile(temporaryPath, snapshot.length === 1 ? snapshot[0] : snapshot, { mode: 0o600 })
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
        freezeCommitted(candidate)
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

  private async removeUploadOwners(sessionIds: string[]): Promise<void> {
    await Promise.all(sessionIds.map((sessionId) => this.removeUploads(sessionId)))
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
