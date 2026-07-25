import { randomUUID } from 'node:crypto'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import {
  CopilotClient,
  RuntimeConnection,
  type AssistantMessageEvent,
  type CopilotSession,
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
  SessionStatus,
  SlashCommand,
} from '../shared/contracts.js'
import { SessionStore, type DiscoveredSession } from './session-store.js'
import {
  findActiveCopilotSessions,
  stopActiveCopilotSession,
} from './active-sessions.js'
import { readSessionEvents, sessionEventLogVersion } from './event-log.js'
import { listHomeDirectories } from './directory-browser.js'
import {
  TmuxTerminalSessionController,
  type TerminalSessionController,
} from './terminal-session.js'

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
  rpc: {
    commands: Pick<
      CopilotSession['rpc']['commands'],
      'list' | 'invoke' | 'enqueue'
    >
    name: Pick<CopilotSession['rpc']['name'], 'set'>
  }
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
  rpc: Pick<CopilotClient['rpc'], 'commands'>
}

export interface AgentServiceEvents {
  event: [event: ServerEvent]
}

export function messagesFromHistory(events: SessionEvent[]): ChatMessage[] {
  const messages: ChatMessage[] = []
  type ToolGroup = {
    messageIndex: number
    names: Set<string>
    active: Set<string>
    failed: boolean
  }
  const tools = new Map<string, ToolGroup>()
  let currentToolGroup: ToolGroup | undefined

  const updateToolGroup = (group: ToolGroup) => {
    const message = messages[group.messageIndex]
    if (!message) {
      return
    }
    const names = [...group.names]
    message.content =
      names.length === 1
        ? `Tool · ${names[0]}`
        : `Tools · ${names.slice(0, 3).join(', ')}${
            names.length > 3 ? ` +${names.length - 3}` : ''
          }`
    message.activityStatus =
      group.active.size > 0 ? 'running' : group.failed ? 'failed' : 'completed'
  }

  for (const event of events) {
    if (event.type === 'user.message') {
      const content = visibleUserContent(event.data.content)
      if (content) {
        currentToolGroup = undefined
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
        currentToolGroup = undefined
        messages.push({
          id: event.data.messageId || event.id,
          role: 'assistant',
          content,
          createdAt: event.timestamp,
        })
      }
      continue
    }
    if (event.type === 'tool.execution_start' && !event.agentId) {
      const toolCallId = event.data.toolCallId
      if (!currentToolGroup) {
        currentToolGroup = {
          messageIndex: messages.length,
          names: new Set(),
          active: new Set(),
          failed: false,
        }
        messages.push({
          id: `tools:${event.id}`,
          role: 'activity',
          content: '',
          createdAt: event.timestamp,
          activityStatus: 'running',
        })
      }
      currentToolGroup.names.add(readableToolName(event.data.toolName))
      currentToolGroup.active.add(toolCallId)
      tools.set(toolCallId, currentToolGroup)
      messages[currentToolGroup.messageIndex].createdAt = event.timestamp
      updateToolGroup(currentToolGroup)
      continue
    }
    if (event.type === 'tool.execution_complete' && !event.agentId) {
      const group = tools.get(event.data.toolCallId)
      if (group) {
        group.active.delete(event.data.toolCallId)
        group.failed ||= !event.data.success
        messages[group.messageIndex].createdAt = event.timestamp
        updateToolGroup(group)
      }
    }
  }
  return messages
}

function visibleUserContent(content: string): string {
  const direct = content.trim()
  if (direct) {
    return direct.startsWith('<skill-context') ||
      direct.startsWith('<system_reminder')
      ? ''
      : direct
  }
  return ''
}

function readableToolName(value: string): string {
  return value
    .replace(/^github-mcp-server-/, 'GitHub · ')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function commandShortcut(value: string): string {
  const parts = value.split(/[-_]/)
  return parts.length > 1
    ? parts
    .map((part) => part[0] || '')
    .join('')
    .toLowerCase()
    : ''
}

const ansiSequence = new RegExp(
  `${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`,
  'g',
)

function stripAnsi(value: string): string {
  return value.replace(ansiSequence, '')
}

function statusFromEvents(events: SessionEvent[]): SessionStatus {
  let status: SessionStatus = 'idle'
  for (const event of events) {
    switch (event.type) {
      case 'assistant.turn_start':
        status = 'running'
        break
      case 'permission.requested':
        status = 'waiting'
        break
      case 'permission.completed':
        status = 'running'
        break
      case 'session.error':
        status = 'error'
        break
      case 'assistant.turn_end':
      case 'session.idle':
      case 'abort':
        status = 'idle'
        break
    }
  }
  return status
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

function normalizedTitle(value: string | undefined, fallback: string): string {
  const firstLine = value?.trim().split(/\r?\n/, 1)[0]?.trim() || fallback
  return firstLine.length > 72 ? `${firstLine.slice(0, 72)}…` : firstLine
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
  private readonly drainingSessions = new Set<string>()
  private readonly promptQueues = new Map<string, string[]>()
  private readonly deletingSessions = new Set<string>()
  private readonly deletedSessionIds = new Set<string>()
  private readonly permissions = new Map<string, PendingSdkPermission>()
  private discoveryTimer?: NodeJS.Timeout
  private discoveryInFlight?: Promise<void>
  private transcriptTimer?: NodeJS.Timeout
  private transcriptInFlight?: Promise<void>
  private externalSessionIds = new Set<string>()
  private readonly launchingTerminalSessionIds = new Set<string>()
  private discoveryGeneration = 0
  private readonly eventLogFingerprints = new Map<string, string>()
  private readonly eventLogVersions = new Map<string, string>()
  private readonly liveTranscriptWatermarks = new Map<string, string>()
  private readonly externalCommandCache = new Map<
    string,
    {
      expiresAt: number
      commands: Awaited<
        ReturnType<CopilotSessionLike['rpc']['commands']['list']>
      >['commands']
    }
  >()

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
    private readonly sessionEventReader = readSessionEvents,
    private readonly sessionEventVersion = sessionEventLogVersion,
    private readonly terminalController: TerminalSessionController =
      new TmuxTerminalSessionController(),
  ) {
    super()
    this.client = client
  }

  async start(): Promise<void> {
    await this.store.initialize()
    await this.client.start()
    await this.discoverSessions()
    await this.refreshTranscripts()
    this.discoveryTimer = setInterval(() => {
      void this.refreshDiscovery()
    }, 10_000)
    this.discoveryTimer.unref()
    this.transcriptTimer = setInterval(() => {
      void this.refreshTranscripts()
    }, 750)
    this.transcriptTimer.unref()
  }

  async stop(): Promise<void> {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer)
      this.discoveryTimer = undefined
    }
    if (this.transcriptTimer) {
      clearInterval(this.transcriptTimer)
      this.transcriptTimer = undefined
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

  listDirectories(path?: string) {
    return listHomeDirectories(path)
  }

  getSession(id: string): SessionDetail | undefined {
    return this.store.get(id)
  }

  async openSession(id: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (this.externalSessionIds.has(id)) {
      return stored
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
    const opened = await this.store.setOpen(id, true, true)
    this.publish(opened)
    return {
      ...opened,
      messages: session.messages,
    }
  }

  async createSession(
    inputPath: string,
    terminalBacked = false,
  ): Promise<SessionDetail> {
    const cwd = await this.validateDirectory(inputPath)
    if (terminalBacked) {
      return this.createTerminalSession(cwd)
    }
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
    const session = await this.store.create(
      {
        id: sdkSession.sessionId,
        cwd,
        title: path.basename(cwd) || 'New session',
        updatedAt: now,
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true },
    )
    this.publish(session)
    return session
  }

  async renameSession(id: string, title: string): Promise<SessionDetail> {
    const stored = this.store.get(id)
    if (!stored) {
      throw new Error('Session not found')
    }
    if (this.externalSessionIds.has(id)) {
      await this.terminalController.rename?.(id, title)
    } else {
      const session = await this.ensureLoaded(id)
      await session.rpc.name.set({ name: title })
    }
    const renamed = await this.store.renameSession(id, title)
    this.publish(renamed)
    return renamed
  }

  private async createTerminalSession(cwd: string): Promise<SessionDetail> {
    if (!this.terminalController.create) {
      throw new Error('Terminal-backed sessions are not available')
    }
    const sessionId = randomUUID()
    const title = path.basename(cwd) || 'New session'
    this.launchingTerminalSessionIds.add(sessionId)
    this.discoveryGeneration += 1
    try {
      await this.terminalController.create(sessionId, cwd, title)
      const now = new Date().toISOString()
      const session = await this.store.create({
        id: sessionId,
        cwd,
        title,
        updatedAt: now,
        status: 'idle',
        isOpen: true,
        messages: [],
      })
      this.externalSessionIds.add(sessionId)
      this.publish(session)
      return session
    } catch (error) {
      await this.activeSessionStopper(sessionId)
      throw error
    } finally {
      this.launchingTerminalSessionIds.delete(sessionId)
      this.discoveryGeneration += 1
    }
  }

  async sendMessage(
    sessionId: string,
    rawContent: string,
    enqueue = false,
  ): Promise<SessionDetail> {
    const content = rawContent.trim()
    if (!content) {
      throw new Error('Message cannot be empty')
    }
    if (await this.terminalController.send(sessionId, content, enqueue)) {
      const delivered = await this.store.update(sessionId, (session) => {
        session.activity = enqueue ? 'Queued in terminal' : 'Sent to terminal'
      })
      this.publish(delivered)
      return delivered
    }
    if (
      this.activePrompts.has(sessionId) ||
      this.drainingSessions.has(sessionId)
    ) {
      if (!enqueue) {
        throw new Error('This session is already responding')
      }
      const queue = this.promptQueues.get(sessionId) || []
      queue.push(content)
      this.promptQueues.set(sessionId, queue)
      const queued = await this.store.update(sessionId, (session) => {
        session.queuedCount = queue.length
      })
      this.publish(queued)
      return queued
    }

    return this.startMessage(sessionId, content)
  }

  private async startMessage(
    sessionId: string,
    content: string,
  ): Promise<SessionDetail> {
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

  async listCommands(sessionId: string): Promise<SlashCommand[]> {
    const commands = await this.commandCatalog(sessionId)
    return commands.map((command) => ({
      name: command.name,
      aliases: command.aliases,
      description: command.description,
      inputHint: command.input?.hint,
      inputRequired: command.input?.required,
      allowDuringAgentExecution: command.allowDuringAgentExecution,
    }))
  }

  private async commandCatalog(sessionId: string) {
    if (await this.terminalController.has(sessionId)) {
      const stored = this.store.get(sessionId)
      if (!stored) {
        throw new Error('Session not found')
      }
      const cacheKey = stored.cwd
      const cached = this.externalCommandCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        return cached.commands
      }
      const temporarySession = await this.client.createSession({
        workingDirectory: stored.cwd,
        streaming: false,
        infiniteSessions: { enabled: false },
        onPermissionRequest: () => ({ kind: 'user-not-available' }),
      })
      try {
        const commands = (
          await temporarySession.rpc.commands.list({
            includeBuiltins: true,
            includeSkills: true,
            includeClientCommands: true,
          })
        ).commands
        this.externalCommandCache.set(cacheKey, {
          expiresAt: Date.now() + 60_000,
          commands,
        })
        return commands
      } finally {
        await temporarySession.disconnect().catch(() => undefined)
        await this.client
          .deleteSession(temporarySession.sessionId)
          .catch(() => undefined)
      }
    }
    const session = await this.ensureLoaded(sessionId)
    return (
      await session.rpc.commands.list({
        includeBuiltins: true,
        includeSkills: true,
        includeClientCommands: true,
      })
    ).commands
  }

  private async sessionCommandCatalog(sessionId: string) {
    if (await this.terminalController.has(sessionId)) {
      return {
        commands: await this.commandCatalog(sessionId),
        session: undefined,
      }
    }
    const session = await this.ensureLoaded(sessionId)
    const result = await session.rpc.commands.list({
      includeBuiltins: true,
      includeSkills: true,
      includeClientCommands: true,
    })
    return { commands: result.commands, session }
  }

  async executeCommand(
    sessionId: string,
    rawCommand: string,
    enqueue = false,
  ): Promise<SessionDetail> {
    const command = rawCommand.trim()
    if (!command.startsWith('/')) {
      throw new Error('Slash command must start with /')
    }
    const [name, ...parts] = command.slice(1).split(/\s+/)
    if (!name) {
      throw new Error('Slash command name is required')
    }
    const catalog = await this.sessionCommandCatalog(sessionId)
    const commandInfo = catalog.commands.find(
      (candidate) =>
        candidate.name.toLowerCase() === name.toLowerCase() ||
        candidate.aliases?.some(
          (alias) => alias.toLowerCase() === name.toLowerCase(),
        ) ||
        commandShortcut(candidate.name) === name.toLowerCase(),
    )
    const canonicalName = commandInfo?.name || name
    const canonicalCommand = `/${canonicalName}${
      parts.length > 0 ? ` ${parts.join(' ')}` : ''
    }`
    const busy =
      this.activePrompts.has(sessionId) ||
      this.drainingSessions.has(sessionId)
    if (
      !enqueue &&
      busy &&
      !commandInfo?.allowDuringAgentExecution
    ) {
      throw new Error(`/${name} must be queued while the agent is running`)
    }
    if (
      await this.terminalController.send(
        sessionId,
        canonicalCommand,
        enqueue,
      )
    ) {
      const notice = await this.store.addMessage(sessionId, {
        id: randomUUID(),
        role: 'notice',
        content: enqueue ? `Queued ${canonicalCommand}` : canonicalCommand,
        createdAt: new Date().toISOString(),
      })
      this.publish(notice)
      return notice
    }
    const session = catalog.session
    if (!session) {
      throw new Error('External terminal is no longer available')
    }
    if (enqueue) {
      const result = await session.rpc.commands.enqueue({
        command: canonicalCommand,
      })
      if (!result.queued) {
        throw new Error('This session does not support command queueing')
      }
    } else {
      const result = await session.rpc.commands.invoke({
        name: canonicalName,
        input: parts.join(' '),
      })
      if (result.kind === 'agent-prompt') {
        const notice = await this.store.addMessage(sessionId, {
          id: randomUUID(),
          role: 'notice',
          content: result.notice || canonicalCommand,
          createdAt: new Date().toISOString(),
        })
        this.publish(notice)
        return this.sendMessage(sessionId, result.prompt, busy)
      }
      const content =
        result.kind === 'text'
          ? stripAnsi(result.text)
          : result.kind === 'completed'
            ? result.message || canonicalCommand
            : `${result.title}\n\n${result.options
                .map(
                  (option) =>
                    `- /${canonicalName} ${option.name} — ${option.description}`,
                )
                .join('\n')}`
      const notice = await this.store.addMessage(sessionId, {
        id: randomUUID(),
        role: 'notice',
        content,
        createdAt: new Date().toISOString(),
      })
      this.publish(notice)
      return notice
    }
    const notice = await this.store.addMessage(sessionId, {
      id: randomUUID(),
      role: 'notice',
      content: enqueue ? `Queued ${canonicalCommand}` : canonicalCommand,
      createdAt: new Date().toISOString(),
    })
    this.publish(notice)
    return notice
  }

  async cancel(sessionId: string): Promise<void> {
    if (await this.terminalController.cancel(sessionId)) {
      return
    }
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
      this.drainingSessions.delete(sessionId)
      this.promptQueues.delete(sessionId)
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
    let sdkSession: CopilotSessionLike
    try {
      sdkSession = await this.client.resumeSession(sessionId, {
        workingDirectory: stored.cwd,
        streaming: true,
        onPermissionRequest: (request, invocation) =>
          this.requestPermission(invocation.sessionId, request),
        suppressResumeEvent: true,
      })
    } catch (error) {
      if (stored.messages.length > 0 || !isMissingSessionError(error)) {
        throw error
      }
      sdkSession = await this.client.createSession({
        sessionId,
        workingDirectory: stored.cwd,
        streaming: true,
        onPermissionRequest: (request, invocation) =>
          this.requestPermission(invocation.sessionId, request),
      })
    }
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
    let sessions: SessionMetadata[]
    let activeSessions: DiscoveredSession[]
    while (true) {
      const generation = this.discoveryGeneration
      const discovery = await Promise.all([
        this.client.listSessions(),
        this.activeSessionFinder(),
      ])
      sessions = discovery[0]
      activeSessions = discovery[1]
      if (generation === this.discoveryGeneration) {
        break
      }
    }
    const storedIds = new Set(this.store.list().map((session) => session.id))
    this.externalSessionIds = new Set(
      [
        ...activeSessions.map((session) => session.id),
        ...this.launchingTerminalSessionIds,
      ],
    )
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
          title: normalizedTitle(
            session.summary,
            path.basename(cwd) || 'Untitled session',
          ),
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
      ...this.externalSessionIds,
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

  refreshTranscripts(): Promise<void> {
    if (this.transcriptInFlight) {
      return this.transcriptInFlight
    }
    const refresh = this.syncTranscripts()
      .catch((error: unknown) => {
        this.publishError('', error)
      })
      .finally(() => {
        this.transcriptInFlight = undefined
      })
    this.transcriptInFlight = refresh
    return refresh
  }

  private async syncTranscripts(): Promise<void> {
    const sessionIds = new Set([
      ...this.externalSessionIds,
      ...this.sessions.keys(),
    ])
    await Promise.all(
      [...sessionIds].map(async (sessionId) => {
        if (
          this.activePrompts.has(sessionId) ||
          this.deletedSessionIds.has(sessionId) ||
          !this.store.get(sessionId)
        ) {
          return
        }
        const version = await this.sessionEventVersion(sessionId)
        if (!version || this.eventLogVersions.get(sessionId) === version) {
          return
        }
        const events = await this.sessionEventReader(sessionId)
        const fingerprint = `${events.length}:${events.at(-1)?.id || ''}`
        if (this.eventLogFingerprints.get(sessionId) === fingerprint) {
          return
        }
        const stored = this.store.get(sessionId)
        const messages = [
          ...messagesFromHistory(events),
          ...(stored?.messages.filter((message) => message.role === 'notice') ||
            []),
        ].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        const watermark = this.liveTranscriptWatermarks.get(sessionId)
        const lastEventTimestamp = events.at(-1)?.timestamp
        if (
          watermark &&
          (!lastEventTimestamp ||
            Date.parse(lastEventTimestamp) < Date.parse(watermark))
        ) {
          this.eventLogVersions.set(sessionId, version)
          return
        }
        const status = statusFromEvents(events)
        const lastMessage = messages.at(-1)
        const activity =
          lastMessage?.role === 'activity' &&
          lastMessage.activityStatus === 'running'
            ? lastMessage.content
            : undefined
        if (
          this.activePrompts.has(sessionId) ||
          this.deletedSessionIds.has(sessionId) ||
          !this.store.get(sessionId)
        ) {
          return
        }
        const updated = await this.store.replaceTranscript(
          sessionId,
          messages,
          status,
          activity,
        )
        this.eventLogFingerprints.set(sessionId, fingerprint)
        this.eventLogVersions.set(sessionId, version)
        this.liveTranscriptWatermarks.delete(sessionId)
        this.publish(updated)
      }),
    )
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
      this.liveTranscriptWatermarks.set(sessionId, event.timestamp)
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
      if (response?.timestamp) {
        this.liveTranscriptWatermarks.set(sessionId, response.timestamp)
      }
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
      this.drainingSessions.add(sessionId)
      this.activePrompts.delete(sessionId)
      try {
        if (!this.deletingSessions.has(sessionId) && this.store.get(sessionId)) {
          const queue = this.promptQueues.get(sessionId) || []
          const next = queue.shift()
          if (queue.length === 0) {
            this.promptQueues.delete(sessionId)
          }
          const queued = await this.store.update(sessionId, (session) => {
            session.queuedCount = queue.length
          })
          this.publish(queued)
          if (next) {
            try {
              await this.startMessage(sessionId, next)
            } catch (error) {
              const pending = this.promptQueues.get(sessionId) || []
              pending.unshift(next)
              this.promptQueues.set(sessionId, pending)
              const restored = await this.store.update(
                sessionId,
                (session) => {
                  session.queuedCount = pending.length
                },
              )
              this.publish(restored)
              this.publishError(sessionId, error)
            }
          }
        }
      } catch (error) {
        this.publishError(sessionId, error)
      } finally {
        this.drainingSessions.delete(sessionId)
      }
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
