import { randomUUID } from 'node:crypto'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import {
  CopilotClient,
  RuntimeConnection,
  type CopilotSession,
  type PermissionRequest,
  type PermissionRequestResult,
  type SessionEvent,
} from '@github/copilot-sdk'
import type {
  PendingPermission,
  ServerEvent,
  SessionDetail,
} from '../shared/contracts.js'
import { SessionStore } from './session-store.js'

interface ActivePrompt {
  assistantMessageId: string
}

interface PendingSdkPermission {
  sessionId: string
  resolve: (result: PermissionRequestResult) => void
}

export interface AgentServiceEvents {
  event: [event: ServerEvent]
}

function permissionTitle(request: PermissionRequest): string {
  switch (request.kind) {
    case 'shell':
      return request.intention || request.fullCommandText
    case 'write':
      return request.intention || `Write ${request.fileName}`
    case 'read':
      return request.intention || `Read ${request.path}`
    case 'mcp':
      return `Use ${request.toolTitle || request.toolName}`
    case 'url':
      return request.intention || `Open ${request.url}`
    case 'memory':
      return request.subject || 'Update Copilot memory'
    case 'custom-tool':
      return request.toolDescription || `Use ${request.toolName}`
    case 'hook':
      return request.hookMessage || `Run hook for ${request.toolName}`
    case 'extension-management':
      return `Manage extension ${request.extensionName}`
    case 'extension-permission-access':
      return `Allow extension ${request.extensionName}`
  }
}

export class AgentService extends EventEmitter<AgentServiceEvents> {
  private readonly client: CopilotClient
  private readonly sessions = new Map<string, CopilotSession>()
  private readonly activePrompts = new Map<string, ActivePrompt>()
  private readonly permissions = new Map<string, PendingSdkPermission>()

  constructor(
    readonly store: SessionStore,
    client = new CopilotClient({
      connection: RuntimeConnection.forStdio({
        path: process.env.COPILOT_BIN?.trim() || '/usr/local/bin/copilot',
      }),
      logLevel: 'error',
      useLoggedInUser: true,
    }),
  ) {
    super()
    this.client = client
  }

  async start(): Promise<void> {
    await this.store.initialize()
    await this.client.start()
  }

  async stop(): Promise<void> {
    for (const permission of this.permissions.values()) {
      permission.resolve({ kind: 'user-not-available' })
    }
    this.permissions.clear()
    const errors = await this.client.stop()
    if (errors.length > 0) {
      throw new AggregateError(errors, 'Copilot SDK did not stop cleanly')
    }
  }

  listSessions(): SessionDetail[] {
    return this.store.list()
  }

  getSession(id: string): SessionDetail | undefined {
    return this.store.get(id)
  }

  async createSession(inputPath: string): Promise<SessionDetail> {
    const cwd = await this.validateDirectory(inputPath)
    const sdkSession = await this.client.createSession({
      workingDirectory: cwd,
      streaming: true,
      onPermissionRequest: (request, invocation) =>
        this.requestPermission(invocation.sessionId, request),
    })
    this.attachSession(sdkSession)
    this.sessions.set(sdkSession.sessionId, sdkSession)

    const now = new Date().toISOString()
    const session = await this.store.create({
      id: sdkSession.sessionId,
      cwd,
      title: path.basename(cwd) || 'New session',
      updatedAt: now,
      status: 'idle',
      messages: [],
    })
    this.publish(session)
    return session
  }

  async sendMessage(sessionId: string, rawContent: string): Promise<SessionDetail> {
    const content = rawContent.trim()
    if (!content) {
      throw new Error('Message cannot be empty')
    }
    if (this.activePrompts.has(sessionId)) {
      throw new Error('This session is already responding')
    }

    const sdkSession = await this.ensureLoaded(sessionId)
    const createdAt = new Date().toISOString()
    await this.store.addMessage(sessionId, {
      id: randomUUID(),
      role: 'user',
      content,
      createdAt,
    })
    const assistantMessageId = randomUUID()
    await this.store.addMessage(sessionId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      streaming: true,
    })
    const updated = await this.store.update(sessionId, (session) => {
      session.status = 'running'
      session.activity = 'Thinking'
      if (session.messages.filter((message) => message.role === 'user').length === 1) {
        session.title = content.length > 52 ? `${content.slice(0, 52)}…` : content
      }
    })
    this.activePrompts.set(sessionId, { assistantMessageId })
    this.publish(updated)

    void this.runPrompt(sdkSession, content, assistantMessageId)
    return updated
  }

  async cancel(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session || !this.activePrompts.has(sessionId)) {
      return
    }
    await session.abort()
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

    const result: PermissionRequestResult =
      optionId === 'allow-once'
        ? { kind: 'approve-once' }
        : { kind: 'reject', feedback: 'Rejected from Agentic Remote' }
    this.permissions.delete(requestId)
    pending.resolve(result)

    const updated = await this.store.update(sessionId, (session) => {
      session.pendingPermission = undefined
      session.status = 'running'
      session.activity = 'Continuing'
    })
    this.publish(updated)
    return updated
  }

  private async ensureLoaded(sessionId: string): Promise<CopilotSession> {
    const active = this.sessions.get(sessionId)
    if (active) {
      return active
    }
    const stored = this.store.get(sessionId)
    if (!stored) {
      throw new Error('Session not found')
    }
    const sdkSession = await this.client.resumeSession(sessionId, {
      workingDirectory: stored.cwd,
      streaming: true,
      onPermissionRequest: (request, invocation) =>
        this.requestPermission(invocation.sessionId, request),
      suppressResumeEvent: true,
    })
    this.attachSession(sdkSession)
    this.sessions.set(sessionId, sdkSession)
    return sdkSession
  }

  private attachSession(session: CopilotSession): void {
    session.on((event) => {
      this.handleSessionEvent(session.sessionId, event)
    })
  }

  private handleSessionEvent(sessionId: string, event: SessionEvent): void {
    const activePrompt = this.activePrompts.get(sessionId)

    if (
      event.type === 'assistant.message_delta' &&
      !event.agentId &&
      activePrompt
    ) {
      this.publish(
        this.store.streamMessage(
          sessionId,
          activePrompt.assistantMessageId,
          event.data.deltaContent,
        ),
      )
      return
    }

    if (event.type === 'assistant.message' && !event.agentId && activePrompt) {
      this.publish(
        this.store.setMessageContent(
          sessionId,
          activePrompt.assistantMessageId,
          event.data.content,
        ),
      )
      return
    }

    if (event.type === 'tool.execution_start') {
      void this.store
        .update(sessionId, (stored) => {
          stored.activity =
            event.data.toolDescription?.description || event.data.toolName
        })
        .then((stored) => this.publish(stored))
        .catch((error: unknown) => this.publishError(sessionId, error))
    }
  }

  private async runPrompt(
    sdkSession: CopilotSession,
    content: string,
    assistantMessageId: string,
  ): Promise<void> {
    const sessionId = sdkSession.sessionId
    try {
      const response = await sdkSession.sendAndWait(content, 60 * 60 * 1000)
      if (response?.data.content) {
        this.store.setMessageContent(
          sessionId,
          assistantMessageId,
          response.data.content,
        )
      }
      await this.store.finishMessage(sessionId, assistantMessageId)
      const updated = await this.store.update(sessionId, (session) => {
        session.status = 'idle'
        session.activity = undefined
      })
      this.publish(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const updated = await this.store.update(sessionId, (session) => {
        const assistant = session.messages.find(
          (entry) => entry.id === assistantMessageId,
        )
        if (assistant) {
          assistant.streaming = false
          if (!assistant.content) {
            assistant.content = `Unable to complete the response: ${message}`
          }
        }
        session.status = 'error'
        session.activity = undefined
      })
      this.publish(updated)
      this.emit('event', { type: 'error', sessionId, message })
    } finally {
      this.activePrompts.delete(sessionId)
    }
  }

  private requestPermission(
    sessionId: string,
    request: PermissionRequest,
  ): Promise<PermissionRequestResult> {
    const requestId = randomUUID()
    const permission: PendingPermission = {
      requestId,
      title: permissionTitle(request),
      kind: request.kind,
      options: [
        { optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' },
        { optionId: 'reject', name: 'Reject', kind: 'reject_once' },
      ],
    }

    return new Promise<PermissionRequestResult>((resolve) => {
      this.permissions.set(requestId, { sessionId, resolve })
      void this.store
        .update(sessionId, (session) => {
          session.pendingPermission = permission
          session.status = 'waiting'
          session.activity = permission.title
        })
        .then((session) => this.publish(session))
        .catch((error: unknown) => {
          this.permissions.delete(requestId)
          resolve({ kind: 'user-not-available' })
          this.publishError(sessionId, error)
        })
    })
  }

  private publish(session: SessionDetail): void {
    this.emit('event', { type: 'session.upserted', session })
  }

  private publishError(sessionId: string, error: unknown): void {
    this.emit('event', {
      type: 'error',
      sessionId,
      message: error instanceof Error ? error.message : String(error),
    })
  }

  private async validateDirectory(inputPath: string): Promise<string> {
    const trimmed = inputPath.trim()
    if (!trimmed) {
      throw new Error('Folder path is required')
    }
    const expanded =
      trimmed === '~' || trimmed.startsWith('~/')
        ? path.join(process.env.HOME || '', trimmed.slice(1))
        : trimmed
    if (!path.isAbsolute(expanded)) {
      throw new Error('Use an absolute folder path')
    }
    const resolved = await realpath(expanded)
    const metadata = await stat(resolved)
    if (!metadata.isDirectory()) {
      throw new Error('Folder path must point to a directory')
    }
    return resolved
  }
}
