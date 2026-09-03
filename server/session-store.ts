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

interface StoredState {
  version: 1
  sessions: Record<string, StoredSession>
}

interface StoredSession extends SessionDetail {
  managedOpen?: boolean
  backend?: 'sdk' | 'terminal'
  customTitle?: boolean
  queueDispatchAt?: string
  contextCwd?: boolean
  workspaceTitle?: boolean
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
    contextCwd: _contextCwd,
    workspaceTitle: _workspaceTitle,
    executionMode: _executionMode,
    ...detail
  } = structuredClone(session)
  return {
    ...detail,
    executionMode: backend === 'terminal' ? 'tmux' : 'sdk',
  }
}

export class SessionStore {
  private readonly directory: string
  private readonly statePath: string
  private state: StoredState = { version: 1, sessions: {} }
  private writeQueue: Promise<void> = Promise.resolve()
  private pendingPersist?: Promise<void>

  constructor(
    directory = resolveDataDirectory(),
  ) {
    this.directory = directory
    this.statePath = path.join(directory, 'state.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    try {
      const raw = await readFile(this.statePath, 'utf8')
      const parsed = JSON.parse(raw) as StoredState
      if (parsed.version !== 1 || typeof parsed.sessions !== 'object') {
        throw new Error('Unsupported Agentic Remote state format')
      }
      this.state = parsed
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') {
        throw error
      }
      await this.persist()
    }

    for (const session of Object.values(this.state.sessions)) {
      session.revision ??= 0
      session.provider ??= 'copilot'
      session.isOpen = session.managedOpen === true
      session.queuedPrompts ??= []
      session.queuedCount = session.queuedPrompts.length
      session.pendingUserInput = undefined
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
  }

  list(): SessionDetail[] {
    return Object.values(this.state.sessions)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(cloneSession)
  }

  get(id: string): SessionDetail | undefined {
    if (!Object.hasOwn(this.state.sessions, id)) {
      return undefined
    }
    const session = this.state.sessions[id]
    return session ? cloneSession(session) : undefined
  }

  backend(id: string): StoredSession['backend'] | undefined {
    return this.state.sessions[id]?.backend
  }

  async create(
    session: SessionDetail,
    options: {
      managedOpen?: boolean
      backend?: 'sdk' | 'terminal'
    } = {},
  ): Promise<SessionDetail> {
    this.state.sessions[session.id] = {
      ...cloneSession(session),
      provider: session.provider || 'copilot',
      revision: session.revision ?? 1,
      managedOpen: options.managedOpen,
      executionMode: undefined,
      backend: options.backend,
    }
    await this.persist()
    return cloneSession(this.state.sessions[session.id])
  }

  async syncDiscovered(sessions: DiscoveredSession[]): Promise<void> {
    for (const discovered of sessions) {
      const existing = this.state.sessions[discovered.id]
      if (existing) {
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
        continue
      }
      this.state.sessions[discovered.id] = {
        ...discovered,
        provider: 'copilot',
        status: 'idle',
        isOpen: false,
        messages: [],
      }
    }
    await this.persist()
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
    messages: ChatMessage[],
    status: SessionStatus,
    activity?: string,
    runtime?: SessionRuntimeInfo,
    cwd?: string,
    contextCwd = false,
    pendingUserInput?: PendingUserInput | null,
    observedQueueDispatchAt?: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.messages = messages
      if (pendingUserInput !== undefined) {
        session.pendingUserInput = pendingUserInput || undefined
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
      if (runtime) {
        session.runtime = runtime
      }
      if (cwd && (!session.contextCwd || contextCwd)) {
        session.cwd = cwd
        session.contextCwd ||= contextCwd
      }
      session.updatedAt =
        messages.at(-1)?.createdAt || session.updatedAt
    })
  }

  async syncOpen(sessionIds: string[]): Promise<void> {
    const active = new Set(sessionIds)
    for (const session of Object.values(this.state.sessions)) {
      session.isOpen =
        active.has(session.id) ||
        // A suspended session has nothing running by design. Reading that as
        // closed would hide it from the list, and the only way back to it is
        // the button on the session itself.
        session.suspended === true ||
        (session.managedOpen === true && session.backend !== 'terminal')
    }
    await this.persist()
  }

  async syncBackends(
    terminalSessionIds: string[],
    sdkSessionIds: string[],
  ): Promise<void> {
    const activeTerminal = new Set(terminalSessionIds)
    const knownSdk = new Set(sdkSessionIds)
    for (const session of Object.values(this.state.sessions)) {
      if (activeTerminal.has(session.id)) {
        session.backend = 'terminal'
        session.managedOpen = true
        session.isOpen = true
      } else if (!session.backend && knownSdk.has(session.id)) {
        session.backend = 'sdk'
      }
    }
    await this.persist()
  }

  terminalRecoverySessions(): SessionDetail[] {
    return Object.values(this.state.sessions)
      .filter(
        (session) =>
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
      session.updatedAt = updatedAt
    })
  }

  async updateAutomaticTitle(
    sessionId: string,
    title: string,
    updatedAt: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      if (!session.customTitle) {
        session.title = title
        session.workspaceTitle = true
        session.updatedAt = updatedAt
      }
    })
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
    })
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
    const existing = this.state.sessions[sessionId]
    if (!existing) {
      throw new Error(`Session ${sessionId} does not exist`)
    }
    const replacement: StoredSession = {
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
      updatedAt: new Date().toISOString(),
      runtime: existing.runtime
        ? {
            ...existing.runtime,
            contextTokens: undefined,
            contextEstimated: undefined,
          }
        : undefined,
    }
    delete this.state.sessions[sessionId]
    this.state.sessions[replacementId] = replacement
    await this.persist()
    await this.removeUploads(sessionId)
    return cloneSession(replacement)
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

  async shiftQueuedPrompt(
    sessionId: string,
  ): Promise<{ session: SessionDetail; prompt?: QueuedPrompt }> {
    const first = this.state.sessions[sessionId]?.queuedPrompts?.[0]
    return first
      ? this.removeQueuedPrompt(sessionId, first.id)
      : { session: this.requireSession(sessionId) }
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
    delete this.state.sessions[sessionId]
    await this.persist()
    await this.removeUploads(sessionId)
  }

  async saveUpload(
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
    return this.mutateInMemory(sessionId, (session) => {
      const message = session.messages.find((entry) => entry.id === messageId)
      if (!message) {
        throw new Error(`Message ${messageId} does not exist`)
      }
      message.content += chunk
      session.updatedAt = new Date().toISOString()
    })
  }

  setMessageContent(
    sessionId: string,
    messageId: string,
    content: string,
  ): SessionDetail {
    return this.mutateInMemory(sessionId, (session) => {
      const message = session.messages.find((entry) => entry.id === messageId)
      if (!message) {
        throw new Error(`Message ${messageId} does not exist`)
      }
      message.content = content
      for (const entry of session.messages) {
        if (
          entry.role === 'activity' &&
          entry.activityStatus === 'running'
        ) {
          entry.activityStatus = 'completed'
        }
      }
      session.activity = undefined
      session.updatedAt = new Date().toISOString()
    })
  }

  async finishMessage(sessionId: string, messageId: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      const message = session.messages.find((entry) => entry.id === messageId)
      if (!message) {
        throw new Error(`Message ${messageId} does not exist`)
      }
      message.streaming = false
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

  async update(
    sessionId: string,
    mutation: (session: SessionDetail) => void,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, mutation)
  }

  private mutateInMemory(
    sessionId: string,
    mutation: (session: StoredSession) => void,
  ): SessionDetail {
    const session = this.state.sessions[sessionId]
    if (!session) {
      throw new Error(`Session ${sessionId} does not exist`)
    }
    mutation(session)
    session.revision = (session.revision ?? 0) + 1
    return cloneSession(session)
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
  ): Promise<SessionDetail> {
    const session = this.mutateInMemory(sessionId, mutation)
    await this.persist()
    return session
  }

  // Settle outstanding writes so a caller can know that stopping is complete.
  // Without this a write can land after shutdown, against a directory the
  // caller believes it is free to remove.
  async flush(): Promise<void> {
    await this.writeQueue
  }

  private persist(): Promise<void> {
    // Collapse writes queued behind an in-flight one: they would each
    // re-serialise every session, and the snapshot is taken when the write
    // starts, so a single write covers all mutations made until then.
    if (this.pendingPersist) {
      return this.pendingPersist
    }
    const task = this.writeQueue.then(async () => {
      this.pendingPersist = undefined
      const snapshot = JSON.stringify(this.state)
      const temporaryPath = `${this.statePath}.tmp`
      await writeFile(temporaryPath, snapshot, { mode: 0o600 })
      await rename(temporaryPath, this.statePath)
    })
    this.pendingPersist = task
    this.writeQueue = task.catch(() => undefined)
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
