import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { ChatMessage, SessionDetail, SessionStatus } from '../shared/contracts.js'

interface StoredState {
  version: 1
  sessions: Record<string, SessionDetail>
}

function cloneSession(session: SessionDetail): SessionDetail {
  return structuredClone(session)
}

export class SessionStore {
  private readonly directory: string
  private readonly statePath: string
  private state: StoredState = { version: 1, sessions: {} }
  private writeQueue: Promise<void> = Promise.resolve()

  constructor(
    directory =
      process.env.AGENTIC_REMOTE_DATA_DIR?.trim() ||
      path.join(process.env.HOME || process.cwd(), '.agentic-remote'),
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
      if (session.status !== 'idle') {
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

  async create(session: SessionDetail): Promise<SessionDetail> {
    this.state.sessions[session.id] = cloneSession(session)
    await this.persist()
    return cloneSession(session)
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
    mutation: (session: SessionDetail) => void,
  ): SessionDetail {
    const session = this.state.sessions[sessionId]
    if (!session) {
      throw new Error(`Session ${sessionId} does not exist`)
    }
    mutation(session)
    return cloneSession(session)
  }

  private async mutate(
    sessionId: string,
    mutation: (session: SessionDetail) => void,
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
