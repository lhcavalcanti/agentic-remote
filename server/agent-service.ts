import { randomUUID } from 'node:crypto'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import {
  CopilotClient,
  RuntimeConnection,
  type AssistantMessageEvent,
  type PermissionRequest,
  type PermissionRequestResult,
  type ResumeSessionConfig,
  type SessionConfig,
  type SessionEvent,
  type SessionMetadata,
} from '@github/copilot-sdk'
import type {
  ChatMessage,
  PendingPermission,
  ServerEvent,
  SessionDetail,
} from '../shared/contracts.js'
import { SessionStore } from './session-store.js'
import {
  findActiveCopilotSessions,
  stopActiveCopilotSession,
} from './active-sessions.js'

interface ActivePrompt {
  assistantMessageId: string
}

interface PendingSdkPermission {
  sessionId: string
  resolve: (result: PermissionRequestResult) => void
}

export interface CopilotSessionLike {
  sessionId: string
  on(handler: (event: SessionEvent) => void): () => void
  sendAndWait(
    content: string,
    timeout?: number,
  ): Promise<AssistantMessageEvent | undefined>
  getEvents(): Promise<SessionEvent[]>
  abort(): Promise<void>
  disconnect(): Promise<void>
}

export interface CopilotClientLike {
  start(): Promise<void>
  stop(): Promise<Error[]>
  createSession(config: SessionConfig): Promise<CopilotSessionLike>
  resumeSession(
    sessionId: string,
    config: ResumeSessionConfig,
  ): Promise<CopilotSessionLike>
  listSessions(): Promise<SessionMetadata[]>
  deleteSession(sessionId: string): Promise<void>
}

export interface AgentServiceEvents {
  event: [event: ServerEvent]
}

export function messagesFromHistory(events: SessionEvent[]): ChatMessage[] {
  const messages: ChatMessage[] = []
  for (const event of events) {
    if (event.type === 'user.message') {
      const content = event.data.content.trim()
      if (content) {
        messages.push({
          id: event.id,
          role: 'user',
          content,
          createdAt: event.timestamp,
        })
      }
      continue
    }
    if (event.type === 'assistant.message' && !event.agentId) {
      const content = event.data.content.trim()
      if (content) {
        messages.push({
          id: event.data.messageId || event.id,
          role: 'assistant',
          content,
          createdAt: event.timestamp,
        })
      }
    }
  }
  return messages
}

function isMissingSessionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  const message = error.message.toLowerCase()
  return (
    message.includes('session') &&
    (message.includes('not found') || message.includes('does not exist'))
  )
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
  private readonly client: CopilotClientLike
  private readonly sessions = new Map<string, CopilotSessionLike>()
  private readonly hydratedSessions = new Set<string>()
  private readonly loadingSessions = new Map<
    string,
    Promise<CopilotSessionLike>
  >()
  private readonly hydratingSessions = new Map<string, Promise<SessionDetail>>()
  private readonly activePrompts = new Map<string, ActivePrompt>()
  private readonly deletingSessions = new Set<string>()
  private readonly deletedSessionIds = new Set<string>()
  private readonly permissions = new Map<string, PendingSdkPermission>()
  private discoveryTimer?: NodeJS.Timeout
  private discoveryInFlight?: Promise<void>

  constructor(
    readonly store: SessionStore,
    client: CopilotClientLike = new CopilotClient({
      connection: RuntimeConnection.forStdio({
        path: process.env.COPILOT_BIN?.trim() || '/usr/local/bin/copilot',
      }),
      logLevel: 'error',
      useLoggedInUser: true,
    }),
    private readonly activeSessionFinder = findActiveCopilotSessions,
    private readonly activeSessionStopper = stopActiveCopilotSession,
  ) {
    super()
    this.client = client
  }

  async start(): Promise<void> {
    await this.store.initialize()
    await this.client.start()
    await this.discoverSessions()
    this.discoveryTimer = setInterval(() => {
      void this.refreshDiscovery()
    }, 10_000)
    this.discoveryTimer.unref()
  }

  async stop(): Promise<void> {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer)
      this.discoveryTimer = undefined
    }
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
    return this.store
      .list()
      .filter((session) => session.isOpen)
      .map((session) => ({
        ...session,
        messages: [],
      }))
  }

  listHistory(): SessionDetail[] {
    return this.store.list().map((session) => ({
      ...session,
      messages: [],
    }))
  }

  getSession(id: string): SessionDetail | undefined {
    return this.store.get(id)
  }

  async openSession(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (this.hydratedSessions.has(id)) {
      return stored
    }

    const inFlight = this.hydratingSessions.get(id)
    if (inFlight) {
      return inFlight
    }
    const hydration = this.hydrateSession(id)
    this.hydratingSessions.set(id, hydration)
    try {
      return await hydration
    } finally {
      this.hydratingSessions.delete(id)
    }
  }

  async activateSession(id: string): Promise<SessionDetail> {
    const session = await this.openSession(id)
    const opened = await this.store.setOpen(id, true)
    this.publish(opened)
    return {
      ...opened,
      messages: session.messages,
    }
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
    this.hydratedSessions.add(sdkSession.sessionId)

    const now = new Date().toISOString()
    const session = await this.store.create({
      id: sdkSession.sessionId,
      cwd,
      title: path.basename(cwd) || 'New session',
      updatedAt: now,
      status: 'idle',
      isOpen: true,
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

  async deleteSession(sessionId: string): Promise<void> {
    const stored = this.store.get(sessionId)
    if (!stored) {
      throw new Error('Session not found')
    }

    this.deletingSessions.add(sessionId)
    this.deletedSessionIds.add(sessionId)
    let completed = false
    try {
      await this.activeSessionStopper(sessionId)
      const active = this.sessions.get(sessionId)
      if (active) {
        if (this.activePrompts.has(sessionId)) {
          this.activePrompts.delete(sessionId)
          await active.abort()
        }
        await active.disconnect()
        this.sessions.delete(sessionId)
      }
      for (const [requestId, permission] of this.permissions) {
        if (permission.sessionId === sessionId) {
          permission.resolve({ kind: 'user-not-available' })
          this.permissions.delete(requestId)
        }
      }

      try {
        await this.client.deleteSession(sessionId)
      } catch (error) {
        if (!isMissingSessionError(error)) {
          throw error
        }
      }
      await this.store.remove(sessionId)
      this.hydratedSessions.delete(sessionId)
      this.loadingSessions.delete(sessionId)
      this.hydratingSessions.delete(sessionId)
      this.activePrompts.delete(sessionId)
      completed = true
      this.emit('event', { type: 'session.removed', sessionId })
    } finally {
      this.deletingSessions.delete(sessionId)
      if (!completed) {
        this.deletedSessionIds.delete(sessionId)
      }
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

  private async ensureLoaded(sessionId: string): Promise<CopilotSessionLike> {
    const active = this.sessions.get(sessionId)
    if (active) {
      return active
    }
    const inFlight = this.loadingSessions.get(sessionId)
    if (inFlight) {
      return inFlight
    }
    const loading = this.resumeSession(sessionId)
    this.loadingSessions.set(sessionId, loading)
    try {
      return await loading
    } finally {
      this.loadingSessions.delete(sessionId)
    }
  }

  private async resumeSession(sessionId: string): Promise<CopilotSessionLike> {
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

  private async hydrateSession(sessionId: string): Promise<SessionDetail> {
    const session = await this.ensureLoaded(sessionId)
    const hydrated = await this.store.replaceMessages(
      sessionId,
      messagesFromHistory(await session.getEvents()),
    )
    this.hydratedSessions.add(sessionId)
    this.publish(hydrated)
    return hydrated
  }

  private async discoverSessions(): Promise<void> {
    const [sessions, activeSessions] = await Promise.all([
      this.client.listSessions(),
      this.activeSessionFinder(),
    ])
    const storedIds = new Set(this.store.list().map((session) => session.id))
    const indexedSessions = sessions.flatMap((session) => {
      if (this.deletedSessionIds.has(session.sessionId)) {
        return []
      }
      const cwd = session.context?.workingDirectory?.trim()
      if (!cwd) {
        return []
      }
      return [
        {
          id: session.sessionId,
          cwd,
          title:
            session.summary?.trim() || path.basename(cwd) || 'Untitled session',
          updatedAt: session.modifiedTime.toISOString(),
        },
      ]
    })
    const indexedIds = new Set(indexedSessions.map((session) => session.id))
    await this.store.syncDiscovered(
      [
        ...indexedSessions,
        ...activeSessions
          .filter(
            (session) =>
              !this.deletedSessionIds.has(session.id) &&
              !indexedIds.has(session.id) && !storedIds.has(session.id),
          )
          .map((session) => ({
            ...session,
            title: path.basename(session.cwd) || session.title,
          })),
      ],
    )
    await this.store.syncOpen([
      ...activeSessions.map((session) => session.id),
      ...this.sessions.keys(),
    ])
  }

  refreshDiscovery(): Promise<void> {
    if (this.discoveryInFlight) {
      return this.discoveryInFlight
    }
    const refresh = this.discoverSessions()
      .catch((error: unknown) => {
        this.publishError('', error)
      })
      .finally(() => {
        this.discoveryInFlight = undefined
      })
    this.discoveryInFlight = refresh
    return refresh
  }

  private attachSession(session: CopilotSessionLike): void {
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
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
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
    sdkSession: CopilotSessionLike,
    content: string,
    assistantMessageId: string,
  ): Promise<void> {
    const sessionId = sdkSession.sessionId
    try {
      const response = await sdkSession.sendAndWait(content, 60 * 60 * 1000)
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
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
      if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
        return
      }
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
    if (this.deletingSessions.has(sessionId) || !this.store.get(sessionId)) {
      return Promise.resolve({ kind: 'user-not-available' })
    }
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
