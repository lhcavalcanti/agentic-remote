import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  ChatMessage,
  QueuedPrompt,
  SessionDetail,
  SessionStatus,
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
  customTitle?: boolean
  queueDispatchAt?: string
}

function cloneSession(session: StoredSession): SessionDetail {
  const {
    managedOpen: _managedOpen,
    customTitle: _customTitle,
    queueDispatchAt: _queueDispatchAt,
    ...detail
  } = structuredClone(session)
  return detail
}

export class SessionStore {
  private readonly directory: string
  private readonly statePath: string
  private state: StoredState = { version: 1, sessions: {} }
  private writeQueue: Promise<void> = Promise.resolve()

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
      session.isOpen = session.managedOpen === true
      session.queuedPrompts ??= []
      session.queuedCount = session.queuedPrompts.length
      if (session.queueDispatchAt) {
        session.status = 'running'
        session.activity = 'Sent queued prompt'
      } else if (session.status !== 'idle') {
        session.status = 'idle'
        session.activity = undefined
        session.pendingPermission = undefined
      }
      for (const message of session.messages) {
        message.streaming = false
      }
    }
  }

  list(): SessionDetail[] {
    return Object.values(this.state.sessions)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(cloneSession)
  }

  get(id: string): SessionDetail | undefined {
    const session = this.state.sessions[id]
    return session ? cloneSession(session) : undefined
  }

  async create(
    session: SessionDetail,
    options: { managedOpen?: boolean } = {},
  ): Promise<SessionDetail> {
    this.state.sessions[session.id] = {
      ...cloneSession(session),
      managedOpen: options.managedOpen,
    }
    await this.persist()
    return cloneSession(session)
  }

  async syncDiscovered(sessions: DiscoveredSession[]): Promise<void> {
    for (const discovered of sessions) {
      const existing = this.state.sessions[discovered.id]
      if (existing) {
        existing.cwd = discovered.cwd
        if (!existing.customTitle) {
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
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.messages = messages
      session.status = status
      session.activity = activity
      session.updatedAt =
        messages.at(-1)?.createdAt || session.updatedAt
    })
  }

  async syncOpen(sessionIds: string[]): Promise<void> {
    const active = new Set(sessionIds)
    for (const session of Object.values(this.state.sessions)) {
      session.isOpen = session.managedOpen === true || active.has(session.id)
    }
    await this.persist()
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

  async renameSession(sessionId: string, title: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.title = title
      session.customTitle = true
      session.updatedAt = new Date().toISOString()
    })
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

  async markQueueDispatched(
    sessionId: string,
    dispatchedAt: string,
  ): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.queueDispatchAt = dispatchedAt
      session.status = 'running'
      session.activity = 'Sent queued prompt'
    })
  }

  async clearQueueDispatch(sessionId: string): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.queueDispatchAt = undefined
    })
  }

  async remove(sessionId: string): Promise<void> {
    delete this.state.sessions[sessionId]
    await this.persist()
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<SessionDetail> {
    return this.mutate(sessionId, (session) => {
      session.messages.push(message)
      session.updatedAt = message.createdAt
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

  private persist(): Promise<void> {
    const snapshot = JSON.stringify(this.state, null, 2)
    const task = this.writeQueue.then(async () => {
      const temporaryPath = `${this.statePath}.tmp`
      await writeFile(temporaryPath, snapshot, { mode: 0o600 })
      await rename(temporaryPath, this.statePath)
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }
}
