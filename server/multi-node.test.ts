import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import type {
  AgentProvider,
  BackgroundTask,
  ConfigureRuntimeInput,
  BackgroundTaskSnapshot,
  DirectoryListing,
  HubEvent,
  ServerEvent,
  SessionDetail,
  SlashCommand,
  UserInputReplyInput,
  RuntimeOptions,
  ProviderRuntimeOptions,
  RuntimeReasoningEffort,
  SessionFileUpload,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import { buildApp } from './app.js'
import { ComputerManager } from './computer-manager.js'
import type { ComputerRegistry } from './computer-registry.js'
import type { NodeIdentityStore } from './node-identity.js'
import { SessionDirectoryError } from './session-directory.js'
import type { SessionService } from './session-service.js'
import type {
  AudioUpload,
  TranscriptionService,
} from './transcription-service.js'

class FakeSessionService extends EventEmitter implements SessionService {
  private readonly sessions = new Map<string, SessionDetail>()
  lastCreateTerminalBacked?: boolean
  lastCreateAllowAllPermissions?: boolean
  lastCreateModel?: string
  lastCreateReasoningEffort?: RuntimeReasoningEffort
  lastCreateContextTier?: 'default' | 'long_context'
  lastUpload?: { sessionId: string; filename: string; data: Buffer }
  readonly backgroundTaskSnapshots = new Map<string, BackgroundTaskSnapshot>()

  constructor(...sessions: SessionDetail[]) {
    super()
    for (const session of sessions) {
      this.sessions.set(session.id, structuredClone(session))
    }
  }

  providers() {
    return [
      {
        id: 'copilot' as const,
        name: 'GitHub Copilot',
        available: true,
        terminalBacked: true,
        supportsBackgroundTasks: true,
      },
    ]
  }

  async start() {}
  async stop() {}

  listSessions(): SessionDetail[] {
    return [...this.sessions.values()]
      .filter((session) => session.isOpen)
      .map((session) => ({
        ...structuredClone(session),
        messages: [],
      }))
  }

  listHistory(): SessionDetail[] {
    return [...this.sessions.values()].map((session) => ({
      ...structuredClone(session),
      messages: [],
    }))
  }

  async listDirectories(path = '~'): Promise<DirectoryListing> {
    return {
      path,
      parent: path === '~' ? undefined : '~',
      directories:
        path === '~'
          ? [{ name: 'src', path: '~/src' }]
          : [],
    }
  }

  async validateSessionDirectory(inputPath: string): Promise<string> {
    return inputPath
  }

  async listWorkspace(
    _sessionId: string,
    path = '.',
  ): Promise<WorkspaceListing> {
    return {
      path,
      entries: [
        { name: 'README.md', path: 'README.md', kind: 'markdown', size: 12 },
      ],
    }
  }

  async readWorkspaceFile(
    _sessionId: string,
    path: string,
  ): Promise<WorkspaceFile> {
    return {
      name: path,
      path,
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 12,
      content: '# Project',
    }
  }

  async searchWorkspace(
    _sessionId: string,
    query: string,
    _path?: string,
  ): Promise<WorkspaceSearchResponse> {
    return {
      results: [
        {
          name: 'README.md',
          path: 'README.md',
          kind: 'markdown',
          snippet: query,
        },
      ],
      truncated: false,
    }
  }

  getSession(id: string): SessionDetail | undefined {
    const session = this.sessions.get(id)
    return session ? structuredClone(session) : undefined
  }

  async openSession(id: string): Promise<SessionDetail> {
    const session = this.getSession(id)
    if (!session) {
      throw new Error('Session not found')
    }
    return session
  }

  async activateSession(id: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.isOpen = true
    return structuredClone(session)
  }

  createError?: Error

  knowledgeError?: Error

  async listKnowledge(root: string, path = '.') {
    if (this.knowledgeError) {
      throw this.knowledgeError
    }
    return { path, entries: [{ name: 'note.md', path: 'note.md', kind: 'markdown' as const, size: 12 }], root }
  }

  async readKnowledgeFile(root: string, path: string) {
    return {
      name: path.split('/').at(-1) || path,
      path,
      kind: 'markdown' as const,
      mimeType: 'text/plain; charset=utf-8',
      size: 12,
      content: `# ${root}/${path}`,
    }
  }

  async createSession(
    cwd: string,
    terminalBacked?: boolean,
    allowAllPermissions?: boolean,
    _provider?: AgentProvider,
    model?: string,
    reasoningEffort?: RuntimeReasoningEffort,
    contextTier?: 'default' | 'long_context',
  ): Promise<SessionDetail> {
    if (this.createError) {
      throw this.createError
    }
    this.lastCreateTerminalBacked = terminalBacked
    this.lastCreateAllowAllPermissions = allowAllPermissions
    this.lastCreateModel = model
    this.lastCreateReasoningEffort = reasoningEffort
    this.lastCreateContextTier = contextTier
    const session: SessionDetail = {
      id: randomUUID(),
      cwd,
      title: 'New session',
      updatedAt: new Date().toISOString(),
      status: 'idle',
      isOpen: true,
      messages: [],
    }
    this.sessions.set(session.id, session)
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    this.lastUpload = { sessionId, filename, data }
    return {
      name: filename,
      path: `/remote/uploads/${sessionId}/${filename}`,
      size: data.length,
    }
  }

  async renameSession(id: string, title: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.title = title
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async runtimeOptions(id: string): Promise<RuntimeOptions> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    return {
      current: session.runtime || {},
      models: (await this.providerRuntimeOptions('copilot')).models,
    }
  }

  async providerRuntimeOptions(
    _provider: AgentProvider,
  ): Promise<ProviderRuntimeOptions> {
    return {
      models: [
        {
          id: 'remote-model',
          name: 'Remote model',
          description: '**Remote** model description',
          reasoningEfforts: ['medium', 'high'],
          contextTiers: ['default', 'long_context'],
          contextTokenLimits: {
            default: 50_000,
            long_context: 100_000,
          },
        },
      ],
    }
  }

  async configureRuntime(
    id: string,
    input: ConfigureRuntimeInput,
  ): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.runtime = {
      model: input.model,
      reasoningEffort: input.reasoningEffort,
      contextTier: input.contextTier,
      mode: input.mode,
    }
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async clearConversation(id: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.messages = []
    session.status = 'idle'
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async suspendSession(id: string): Promise<SessionDetail> {
    return this.setSuspended(id, true)
  }

  async resumeSession(id: string): Promise<SessionDetail> {
    return this.setSuspended(id, false)
  }

  private setSuspended(id: string, suspended: boolean): SessionDetail {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.suspended = suspended
    return session
  }

  async restartSession(id: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.status = 'idle'
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async moveToTerminal(id: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.executionMode = 'tmux'
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async removeQueuedPrompt(sessionId: string, promptId: string) {
    const session = this.sessions.get(sessionId)
    const prompt = session?.queuedPrompts?.find((entry) => entry.id === promptId)
    if (!session || !prompt) {
      throw new Error('Queued prompt not found')
    }
    session.queuedPrompts = session.queuedPrompts?.filter(
      (entry) => entry.id !== promptId,
    )
    session.queuedCount = session.queuedPrompts?.length || 0
    this.emitEvent({ type: 'session.upserted', session })
    return { session: structuredClone(session), prompt }
  }

  async sendMessage(sessionId: string, content: string): Promise<SessionDetail> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    session.messages.push({
      id: randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    })

    session.updatedAt = new Date().toISOString()
    this.emitEvent({ type: 'session.upserted', session: structuredClone(session) })
    return structuredClone(session)
  }

  async listCommands(): Promise<SlashCommand[]> {
    return [
      {
        name: 'model',
        description: 'Select model',
        inputHint: 'model',
        allowDuringAgentExecution: false,
      },
    ]
  }

  async executeCommand(
    sessionId: string,
    command: string,
  ): Promise<SessionDetail> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    session.messages.push({
      id: randomUUID(),
      role: 'notice',
      content: command,
      createdAt: new Date().toISOString(),
    })
    return structuredClone(session)
  }

  async cancel() {}

  async listBackgroundTasks(
    sessionId: string,
  ): Promise<BackgroundTaskSnapshot> {
    if (!this.sessions.has(sessionId)) {
      throw new Error('Session not found')
    }
    return (
      this.backgroundTaskSnapshots.get(sessionId) || {
        tasks: [],
        runningCount: 0,
        supported: true,
      }
    )
  }

  async cancelBackgroundTask(
    sessionId: string,
    taskId: string,
  ): Promise<BackgroundTaskSnapshot> {
    if (!this.sessions.has(sessionId)) {
      throw new Error('Session not found')
    }
    const snapshot = this.backgroundTaskSnapshots.get(sessionId)
    if (!snapshot?.tasks.some((task) => task.id === taskId)) {
      throw new Error('Background task not found')
    }
    const tasks = snapshot.tasks.map((task) =>
      task.id === taskId
        ? { ...task, status: 'cancelled' as const, canCancel: false }
        : task,
    )
    const updated = {
      tasks,
      runningCount: tasks.filter((task) => task.status === 'running').length,
      supported: snapshot.supported,
    }
    this.backgroundTaskSnapshots.set(sessionId, updated)
    return updated
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.sessions.delete(sessionId)) {
      throw new Error('Session not found')
    }
    this.emitEvent({ type: 'session.removed', sessionId })
  }

  async replyPermission(
    sessionId: string,
    _requestId: string,
    _optionId: string,
  ): Promise<SessionDetail> {
    return this.openSession(sessionId)
  }

  async replyUserInput(
    sessionId: string,
    _requestId: string,
    _input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    session.pendingUserInput = undefined
    session.status = 'running'
    return structuredClone(session)
  }

  private emitEvent(event: ServerEvent) {
    this.emit('event', event)
  }
}

function session(id: string, title: string, isOpen = true): SessionDetail {
  return {
    id,
    cwd: `/srv/${id}`,
    title,
    updatedAt: '2026-07-22T00:00:00.000Z',
    status: 'idle',
    isOpen,
    messages: [
      {
        id: `${id}-message`,
        role: 'assistant',
        content: `${title} history`,
        createdAt: '2026-07-22T00:00:00.000Z',
      },
    ],
  }
}

function multipartFile(filename: string, content: string) {
  const boundary = 'agentic-remote-remote-file'
  return {
    boundary,
    payload: Buffer.from(
      [
        `--${boundary}`,
        `Content-Disposition: form-data; name="file"; filename="${filename}"`,
        'Content-Type: application/octet-stream',
        '',
        content,
        `--${boundary}--`,
        '',
      ].join('\r\n'),
    ),
  }
}

const directories: string[] = []

async function temporaryDirectory(label: string): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), `${label}-`))
  directories.push(directory)
  return directory
}

function multipartAudio(
  filename: string,
  mimeType: string,
  content: string,
): { boundary: string; payload: Buffer } {
  const boundary = 'agentic-remote-audio-boundary'
  const payload = Buffer.from(
    [
      `--${boundary}`,
      `Content-Disposition: form-data; name="audio"; filename="${filename}"`,
      `Content-Type: ${mimeType}`,
      '',
      content,
      `--${boundary}--`,
      '',
    ].join('\r\n'),
  )
  return { boundary, payload }
}

function waitForEvent(
  socket: WebSocket,
  predicate: (event: HubEvent) => boolean,
): Promise<HubEvent> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off('message', handleMessage)
      reject(new Error('Timed out waiting for hub event'))
    }, 5_000)
    const handleMessage = (raw: WebSocket.RawData) => {
      const event = JSON.parse(raw.toString()) as HubEvent
      if (!predicate(event)) {
        return
      }
      clearTimeout(timer)
      socket.off('message', handleMessage)
      resolve(event)
    }
    socket.on('message', handleMessage)
  })
}

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('multi-node hub', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('uses the application error handler for registered session routes', async () => {
    const service = new FakeSessionService(session('local-session', 'Local'))
    vi.spyOn(service, 'runtimeOptions').mockRejectedValue(
      Object.assign(new Error('Runtime models are temporarily unavailable'), {
        statusCode: 503,
      }),
    )
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-route-error'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      const response = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${hub.identity.info.id}/sessions/local-session/runtime`,
      })

      expect(response.statusCode).toBe(503)
      expect(response.json()).toEqual({
        error: 'Runtime models are temporarily unavailable',
      })
    } finally {
      await hub.app.close()
    }
  })

  it('rejects untrusted hub hosts and origins', async () => {
    vi.stubEnv(
      'AGENTIC_REMOTE_ALLOWED_ORIGINS',
      'https://agentic.example.test',
    )
    const service = new FakeSessionService(session('local-session', 'Local'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-origin'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      const rejectedOrigin = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: {
          host: 'agentic.example.test',
          origin: 'https://attacker.example.test',
        },
      })
      expect(rejectedOrigin.statusCode).toBe(403)
      const rejectedPort = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: {
          host: 'agentic.example.test',
          origin: 'https://agentic.example.test:444',
        },
      })
      expect(rejectedPort.statusCode).toBe(403)
      const rejectedHost = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: {
          host: 'attacker.example.test',
        },
      })
      expect(rejectedHost.statusCode).toBe(403)
      const acceptedOrigin = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: {
          host: 'agentic.example.test',
          origin: 'https://agentic.example.test',
        },
      })
      expect(acceptedOrigin.statusCode).toBe(200)
    } finally {
      await hub.app.close()
    }
  })

  it('falls back to the hub address when no allowlist is configured', async () => {
    vi.stubEnv('HOST', '192.0.2.10')
    vi.stubEnv('PORT', '4317')
    const service = new FakeSessionService(session('local-session', 'Local'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-default-origin'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      const rebinding = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: { host: 'attacker.example.test' },
      })
      expect(rebinding.statusCode).toBe(403)
      const ownAddress = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: { host: '192.0.2.10:4317' },
      })
      expect(ownAddress.statusCode).toBe(200)
      const loopback = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: { host: '127.0.0.1:4317' },
      })
      expect(loopback.statusCode).toBe(200)
    } finally {
      await hub.app.close()
    }
  })

  it('accepts loopback browsing with the allowlist written by setup', async () => {
    // Exactly what `agentic-remote setup --host 192.0.2.10 --port 4317` writes.
    vi.stubEnv(
      'AGENTIC_REMOTE_ALLOWED_ORIGINS',
      'http://192.0.2.10:4317,http://localhost:4317,http://127.0.0.1:4317',
    )
    const service = new FakeSessionService(session('local-session', 'Local'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-setup-origin'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      for (const host of [
        '192.0.2.10:4317',
        'localhost:4317',
        '127.0.0.1:4317',
      ]) {
        const response = await hub.app.inject({
          method: 'GET',
          url: '/api/sessions',
          headers: { host },
        })
        expect(response.statusCode, `host ${host}`).toBe(200)
      }
      const rejected = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
        headers: { host: 'attacker.example.test' },
      })
      expect(rejected.statusCode).toBe(403)
    } finally {
      await hub.app.close()
    }
  })

  it('reports a malformed origin allowlist entry', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'not-a-url')
    const service = new FakeSessionService(session('local-session', 'Local'))
    await expect(
      buildApp({
        dataDirectory: await temporaryDirectory('agentic-remote-bad-origin'),
        logger: false,
        role: 'hub',
        service,
      }),
    ).rejects.toThrow('Invalid AGENTIC_REMOTE_ALLOWED_ORIGINS entry')
  })

  it('rejects an origin entry that has no scheme', async () => {
    // `new URL('localhost:4317')` parses, but its origin is the opaque "null",
    // which would otherwise fail on every request rather than at startup.
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'localhost:4317')
    const service = new FakeSessionService(session('local-session', 'Local'))
    await expect(
      buildApp({
        dataDirectory: await temporaryDirectory('agentic-remote-scheme-origin'),
        logger: false,
        role: 'hub',
        service,
      }),
    ).rejects.toThrow('expected http(s)://host[:port]')
  })

  it('registers, aggregates, routes, and deletes remote sessions', async () => {
    const remoteSession = session('remote-session', 'Remote')
    remoteSession.queuedCount = 1
    remoteSession.queuedPrompts = [
      {
        id: 'remote-queue',
        content: 'Queued remote prompt',
        createdAt: '2026-07-25T01:00:00.000Z',
      },
    ]
    remoteSession.pendingUserInput = {
      requestId: 'remote-question',
      question: 'Choose remote option',
      choices: ['One', 'Two'],
      allowFreeform: true,
    }
    const remoteService = new FakeSessionService(
      remoteSession,
      session('historical-session', 'Historical', false),
    )
    remoteService.backgroundTaskSnapshots.set('remote-session', {
      tasks: [
        {
          id: 'remote-task',
          type: 'agent',
          description: 'Inspect remote files',
          status: 'running',
          startedAt: '2026-08-31T18:00:00.000Z',
          canCancel: true,
        } satisfies BackgroundTask,
      ],
      runningCount: 1,
      supported: true,
    })
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node'),
      logger: false,
      role: 'node',
      service: remoteService,
    })
    await remoteService.start()
    await remote.app.listen({ host: '127.0.0.1', port: 0 })
    const remoteAddress = remote.app.server.address() as AddressInfo
    const remoteUrl = `http://127.0.0.1:${remoteAddress.port}`

    const localService = new FakeSessionService(session('local-session', 'Local'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-hub'),
      logger: false,
      role: 'hub',
      service: localService,
    })
    await localService.start()
    await hub.app.listen({ host: '127.0.0.1', port: 0 })
    const hubAddress = hub.app.server.address() as AddressInfo
    let hubSocket: WebSocket | undefined

    try {
      const version = await hub.app.inject({
        method: 'GET',
        url: '/api/version',
      })
      expect(version.statusCode).toBe(200)
      expect(version.headers['cache-control']).toBe('no-store')
      expect(version.json().version).toBe(hub.identity.info.version)

      const unauthorized = await remote.app.inject({
        method: 'GET',
        url: '/node-api/info',
      })
      expect(unauthorized.statusCode).toBe(401)

      const registered = await hub.app.inject({
        method: 'POST',
        url: '/api/computers',
        payload: {
          baseUrl: remoteUrl,
          token: remote.identity.token,
          name: 'worker-node',
        },
      })
      expect(registered.statusCode).toBe(201)
      const remoteComputerId = registered.json().computer.id as string
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const status = await hub.app.inject({
          method: 'GET',
          url: '/api/computers',
        })
        const online = status
          .json()
          .computers.find(
            (entry: { id: string }) => entry.id === remoteComputerId,
          )?.online
        if (online) {
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      hubSocket = new WebSocket(
        `ws://127.0.0.1:${hubAddress.port}/api/events`,
      )
      await new Promise<void>((resolve, reject) => {
        hubSocket?.once('open', resolve)
        hubSocket?.once('error', reject)
      })

      const computers = await hub.app.inject({
        method: 'GET',
        url: '/api/computers',
      })
      expect(computers.json().computers).toHaveLength(2)

      const remoteTasks = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/tasks`,
      })
      expect(remoteTasks.statusCode, remoteTasks.body).toBe(200)
      expect(remoteTasks.json()).toMatchObject({
        runningCount: 1,
        tasks: [{ id: 'remote-task', status: 'running' }],
      })
      const isolatedTasks = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/historical-session/tasks`,
      })
      expect(isolatedTasks.json()).toMatchObject({
        runningCount: 0,
        tasks: [],
      })
      const cancelledTask = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/tasks/remote-task/cancel`,
        payload: {},
      })
      expect(cancelledTask.statusCode, cancelledTask.body).toBe(200)
      expect(cancelledTask.json()).toMatchObject({
        runningCount: 0,
        tasks: [{ id: 'remote-task', status: 'cancelled' }],
      })

      const directories = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/directories?path=~`,
      })
      expect(directories.json()).toMatchObject({
        path: '~',
        directories: [{ name: 'src', path: '~/src' }],
      })

      const validatedDirectory = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/directories/validate`,
        payload: { path: '/srv/new-session' },
      })
      expect(validatedDirectory.statusCode, validatedDirectory.body).toBe(200)
      expect(validatedDirectory.json()).toEqual({ path: '/srv/new-session' })

      const workspace = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/workspace?path=.`,
      })
      expect(workspace.statusCode, workspace.body).toBe(200)
      expect(workspace.json()).toMatchObject({
        path: '.',
        entries: [{ name: 'README.md', kind: 'markdown' }],
      })

      const workspaceFile = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/workspace/file?path=README.md`,
      })
      expect(workspaceFile.statusCode, workspaceFile.body).toBe(200)
      expect(workspaceFile.json()).toMatchObject({
        path: 'README.md',
        content: '# Project',
      })

      const workspaceSearch = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/workspace/search?query=Project`,
      })
      expect(workspaceSearch.statusCode, workspaceSearch.body).toBe(200)
      expect(workspaceSearch.json()).toMatchObject({
        results: [{ path: 'README.md', snippet: 'Project' }],
      })

      const sessions = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
      })
      expect(
        sessions
          .json()
          .sessions.map((entry: { computerName: string }) => entry.computerName),
      ).toEqual(expect.arrayContaining(['worker-node', hub.identity.info.name]))

      const created = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions`,
        payload: {
          cwd: '/srv/new-session',
          model: 'remote-model',
          reasoningEffort: 'high',
          contextTier: 'long_context',
        },
      })
      expect(created.statusCode, created.body).toBe(201)
      expect(remoteService.lastCreateTerminalBacked).toBe(true)
      expect(remoteService.lastCreateAllowAllPermissions).toBe(true)
      expect(remoteService.lastCreateModel).toBe('remote-model')
      expect(remoteService.lastCreateReasoningEffort).toBe('high')
      expect(remoteService.lastCreateContextTier).toBe('long_context')

      const document = multipartFile('statement.pdf', 'financial data')
      const uploaded = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/files`,
        headers: {
          'content-type': `multipart/form-data; boundary=${document.boundary}`,
        },
        payload: document.payload,
      })
      expect(uploaded.statusCode, uploaded.body).toBe(201)
      expect(uploaded.json().file).toEqual({
        name: 'statement.pdf',
        path: '/remote/uploads/remote-session/statement.pdf',
        size: 14,
      })
      expect(remoteService.lastUpload).toEqual({
        sessionId: 'remote-session',
        filename: 'statement.pdf',
        data: Buffer.from('financial data'),
      })

      const detail = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session`,
      })
      expect(detail.json().session).toMatchObject({
        computerName: 'worker-node',
        messages: [{ content: 'Remote history' }],
      })
      const answered = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/user-input/remote-question`,
        payload: { answer: 'Two', wasFreeform: false },
      })
      expect(answered.json().session).toMatchObject({
        computerName: 'worker-node',
        status: 'running',
      })
      expect(answered.json().session).not.toHaveProperty('pendingUserInput')
      const renamed = await hub.app.inject({
        method: 'PATCH',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session`,
        payload: { title: 'Renamed remote' },
      })
      expect(renamed.json().session).toMatchObject({
        title: 'Renamed remote',
        computerName: 'worker-node',
      })
      const removedQueue = await hub.app.inject({
        method: 'DELETE',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/queue/remote-queue`,
      })
      expect(removedQueue.json()).toMatchObject({
        session: { queuedCount: 0, computerName: 'worker-node' },
        prompt: { content: 'Queued remote prompt' },
      })
      const runtimeOptions = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/runtime`,
      })
      expect(runtimeOptions.json().models).toEqual([
        expect.objectContaining({ id: 'remote-model' }),
      ])
      const providerOptions = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/providers/copilot/runtime`,
      })
      expect(providerOptions.statusCode, providerOptions.body).toBe(200)
      expect(providerOptions.json().models).toEqual([
        expect.objectContaining({
          id: 'remote-model',
          description: '**Remote** model description',
        }),
      ])
      const configuredRuntime = await hub.app.inject({
        method: 'PATCH',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/runtime`,
        payload: {
          model: 'remote-model',
          reasoningEffort: 'high',
          contextTier: 'long_context',
          mode: 'autopilot',
        },
      })
      expect(configuredRuntime.json().session).toMatchObject({
        computerName: 'worker-node',
        runtime: {
          model: 'remote-model',
          reasoningEffort: 'high',
          contextTier: 'long_context',
          mode: 'autopilot',
        },
      })
      const cleared = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/clear`,
        payload: {},
      })
      expect(cleared.json().session).toMatchObject({
        id: 'remote-session',
        computerName: 'worker-node',
        messages: [],
      })
      const restarted = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/restart`,
        payload: {},
      })
      expect(restarted.json().session).toMatchObject({
        id: 'remote-session',
        computerName: 'worker-node',
      })
      const movedToTmux = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/tmux`,
        payload: {},
      })
      expect(movedToTmux.json().session).toMatchObject({
        id: 'remote-session',
        computerName: 'worker-node',
        executionMode: 'tmux',
      })

      const history = await hub.app.inject({
        method: 'GET',
        url: '/api/history',
      })
      expect(history.json().sessions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'historical-session',
            computerName: 'worker-node',
            isOpen: false,
          }),
        ]),
      )
      const opened = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/historical-session/open`,
        payload: {},
      })
      expect(opened.json().session).toMatchObject({
        id: 'historical-session',
        isOpen: true,
      })

      const commands = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/commands`,
      })
      expect(commands.json().commands).toEqual([
        expect.objectContaining({ name: 'model' }),
      ])
      const command = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/commands`,
        payload: { command: '/model fixture-model' },
      })
      expect(command.json().session.messages.at(-1)).toMatchObject({
        role: 'notice',
        content: '/model fixture-model',
      })

      const upserted = waitForEvent(
        hubSocket,
        (event) =>
          event.type === 'session.upserted' &&
          event.session.computerId === remoteComputerId &&
          event.session.id === 'remote-session',
      )
      const sent = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/messages`,
        payload: { content: 'hello remote' },
      })
      expect(sent.statusCode, sent.body).toBe(202)
      expect(sent.json().session.messages.at(-1)).toMatchObject({
        role: 'user',
        content: 'hello remote',
      })
      await expect(upserted).resolves.toMatchObject({
        type: 'session.upserted',
        session: { computerName: 'worker-node' },
      })

      const removed = waitForEvent(
        hubSocket,
        (event) =>
          event.type === 'session.removed' &&
          event.computerId === remoteComputerId &&
          event.sessionId === 'remote-session',
      )
      const deleted = await hub.app.inject({
        method: 'DELETE',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session`,
      })
      expect(deleted.statusCode, deleted.body).toBe(204)
      expect(remoteService.getSession('remote-session')).toBeUndefined()
      await expect(removed).resolves.toMatchObject({
        type: 'session.removed',
        computerId: remoteComputerId,
      })
    } finally {
      hubSocket?.close()
      await hub.app.close()
      await remote.app.close()
    }
  })
  it('surfaces a rejected folder as 400 with its reason', async () => {
    const service = new FakeSessionService(session('local-session', 'Local'))
    service.createError = new SessionDirectoryError(
      'Sessions are restricted to the user home directory',
    )
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-bad-cwd'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      const computerId = hub.app
        ? JSON.parse(
            (
              await hub.app.inject({ method: 'GET', url: '/api/computers' })
            ).body,
          ).computers[0].id
        : ''
      const rejected = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${computerId}/sessions`,
        payload: { cwd: '/', provider: 'copilot' },
      })
      expect(rejected.statusCode).toBe(400)
      expect(JSON.parse(rejected.body).error).toBe(
        'Sessions are restricted to the user home directory',
      )

      // A genuine fault must still be hidden behind a 500.
      service.createError = new Error('database on fire')
      const failed = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${computerId}/sessions`,
        payload: { cwd: '~', provider: 'copilot' },
      })
      expect(failed.statusCode).toBe(500)
      expect(JSON.parse(failed.body).error).toBe('Unexpected server error')
    } finally {
      await hub.app.close()
    }
  })
  it('browses a knowledge root on the owning computer', async () => {
    const service = new FakeSessionService(session('local-session', 'Local'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-knowledge'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      const computers = JSON.parse(
        (await hub.app.inject({ method: 'GET', url: '/api/computers' })).body,
      ).computers as Array<{ id: string }>

      const created = await hub.app.inject({
        method: 'POST',
        url: '/api/knowledge/roots',
        payload: { computerId: computers[0].id, path: '/home/tester/docs' },
      })
      expect(created.statusCode).toBe(201)
      const root = JSON.parse(created.body).root as {
        id: string
        name: string
        computerName: string
      }
      // The name defaults to the folder and the owning computer is recorded.
      expect(root.name).toBe('docs')
      expect(root.computerName).toBeTruthy()

      const listed = await hub.app.inject({
        method: 'GET',
        url: '/api/knowledge/roots',
      })
      expect(JSON.parse(listed.body).roots).toHaveLength(1)

      const entries = await hub.app.inject({
        method: 'GET',
        url: `/api/knowledge/roots/${root.id}/entries?path=.`,
      })
      expect(entries.statusCode).toBe(200)
      expect(JSON.parse(entries.body).entries[0].name).toBe('note.md')

      const file = await hub.app.inject({
        method: 'GET',
        url: `/api/knowledge/roots/${root.id}/file?path=note.md`,
      })
      expect(file.statusCode).toBe(200)
      expect(JSON.parse(file.body).content).toContain('/home/tester/docs')

      // A root survives having no sessions at all.
      expect(
        JSON.parse(
          (await hub.app.inject({ method: 'GET', url: '/api/knowledge/roots' }))
            .body,
        ).roots[0].id,
      ).toBe(root.id)

      const removed = await hub.app.inject({
        method: 'DELETE',
        url: `/api/knowledge/roots/${root.id}`,
      })
      expect(removed.statusCode).toBe(204)
      expect(
        (
          await hub.app.inject({
            method: 'GET',
            url: `/api/knowledge/roots/${root.id}/entries`,
          })
        ).statusCode,
      ).toBe(404)
    } finally {
      await hub.app.close()
    }
  })

  it('rejects a knowledge root on an unregistered computer', async () => {
    const service = new FakeSessionService(session('local-session', 'Local'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-knowledge-bad'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      const response = await hub.app.inject({
        method: 'POST',
        url: '/api/knowledge/roots',
        payload: { computerId: 'nope', path: '/tmp' },
      })
      expect(response.statusCode).toBe(404)
    } finally {
      await hub.app.close()
    }
  })
  it('explains that a legacy node cannot host knowledge roots', async () => {
    const service = new FakeSessionService(session('local-session', 'Local'))
    service.knowledgeError = Object.assign(new Error('Not Found'), {
      statusCode: 404,
    })
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-legacy-root'),
      logger: false,
      role: 'hub',
      service,
    })
    try {
      const computers = JSON.parse(
        (await hub.app.inject({ method: 'GET', url: '/api/computers' })).body,
      ).computers as Array<{ id: string }>
      const response = await hub.app.inject({
        method: 'POST',
        url: '/api/knowledge/roots',
        payload: { computerId: computers[0].id, path: '/home/tester/docs' },
      })
      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.body).error).toContain(
        'does not support knowledge roots yet',
      )
      // Nothing is stored when the owning computer cannot serve it.
      expect(
        JSON.parse(
          (await hub.app.inject({ method: 'GET', url: '/api/knowledge/roots' }))
            .body,
        ).roots,
      ).toHaveLength(0)
    } finally {
      await hub.app.close()
    }
  })

  it('transcribes hub audio on the assigned computer', async () => {
    const transcribe = vi.fn(async (upload: AudioUpload) => {
      const chunks: Buffer[] = []
      for await (const chunk of upload.stream) {
        chunks.push(Buffer.from(chunk))
      }
      expect(Buffer.concat(chunks).toString()).toBe('recorded audio')
      expect(upload.filename).toBe('memo.m4a')
      expect(upload.mimeType).toBe('audio/x-m4a')
      return { transcript: 'Ship the delegated transcriber', durationSeconds: 6 }
    })
    const workerTranscription: TranscriptionService = {
      initialize: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      transcribe,
    }
    const worker = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-voice-node'),
      logger: false,
      role: 'node',
      service: new FakeSessionService(),
      transcriptionService: workerTranscription,
    })
    await worker.app.listen({ host: '127.0.0.1', port: 0 })
    const workerAddress = worker.app.server.address() as AddressInfo

    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', 'workstation')
    const hubTranscription: TranscriptionService = {
      initialize: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      transcribe: vi.fn(async () => ({
        transcript: 'Hub transcript',
        durationSeconds: 1,
      })),
    }
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-voice-hub'),
      logger: false,
      role: 'hub',
      service: new FakeSessionService(),
      transcriptionService: hubTranscription,
    })

    try {
      const registered = await hub.app.inject({
        method: 'POST',
        url: '/api/computers',
        payload: {
          baseUrl: `http://127.0.0.1:${workerAddress.port}`,
          token: worker.identity.token,
          name: 'workstation',
        },
      })
      expect(registered.statusCode).toBe(201)
      const computerId = registered.json().computer.id as string
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const status = await hub.app.inject({
          method: 'GET',
          url: '/api/computers',
        })
        const online = status
          .json()
          .computers.find((entry: { id: string }) => entry.id === computerId)
          ?.online
        if (online) {
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      const { boundary, payload } = multipartAudio(
        'memo.m4a',
        'audio/x-m4a',
        'recorded audio',
      )
      const response = await hub.app.inject({
        method: 'POST',
        url: '/api/transcriptions',
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        transcript: 'Ship the delegated transcriber',
        durationSeconds: 6,
      })
      expect(transcribe).toHaveBeenCalledTimes(1)
      expect(hubTranscription.transcribe).not.toHaveBeenCalled()

      const authorization = { authorization: `Bearer ${worker.identity.token}` }
      const unauthenticated = await worker.app.inject({
        method: 'POST',
        url: '/node-api/transcriptions',
        headers: { 'content-type': 'application/octet-stream' },
        payload: Buffer.from('recorded audio'),
      })
      expect(unauthenticated.statusCode).toBe(401)

      const unnamed = await worker.app.inject({
        method: 'POST',
        url: '/node-api/transcriptions',
        headers: { ...authorization, 'content-type': 'application/octet-stream' },
        payload: Buffer.from('recorded audio'),
      })
      expect(unnamed.statusCode).toBe(400)
      expect(unnamed.json().error).toContain('name is required')

      const empty = await worker.app.inject({
        method: 'POST',
        url: '/node-api/transcriptions',
        headers: {
          ...authorization,
          'content-type': 'application/octet-stream',
          'x-agentic-audio-filename':
            Buffer.from('memo.m4a').toString('base64url'),
        },
        payload: Buffer.alloc(0),
      })
      expect(empty.statusCode).toBe(400)
      expect(empty.json().error).toContain('audio file is required')
      expect(transcribe).toHaveBeenCalledTimes(1)
    } finally {
      await hub.app.close()
      await worker.app.close()
    }
  })

  it('keeps transcribing on the hub when no computer is assigned', async () => {
    const hubTranscription: TranscriptionService = {
      initialize: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      transcribe: vi.fn(async () => ({
        transcript: 'Hub transcript',
        durationSeconds: 2,
      })),
    }
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-voice-local'),
      logger: false,
      role: 'hub',
      service: new FakeSessionService(),
      transcriptionService: hubTranscription,
    })

    try {
      const { boundary, payload } = multipartAudio(
        'memo.m4a',
        'audio/x-m4a',
        'recorded audio',
      )
      const response = await hub.app.inject({
        method: 'POST',
        url: '/api/transcriptions',
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ transcript: 'Hub transcript' })
      expect(hubTranscription.transcribe).toHaveBeenCalledTimes(1)
    } finally {
      await hub.app.close()
    }
  })

  it('reports an assigned computer that is not paired', async () => {
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', 'missing-workstation')
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-voice-missing'),
      logger: false,
      role: 'hub',
      service: new FakeSessionService(),
      transcriptionService: {
        initialize: vi.fn(async () => undefined),
        stop: vi.fn(async () => undefined),
        transcribe: vi.fn(),
      },
    })

    try {
      const { boundary, payload } = multipartAudio(
        'memo.m4a',
        'audio/x-m4a',
        'recorded audio',
      )
      const response = await hub.app.inject({
        method: 'POST',
        url: '/api/transcriptions',
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      })

      expect(response.statusCode).toBe(503)
      expect(response.json().error).toContain('missing-workstation')
    } finally {
      await hub.app.close()
    }
  })
})

describe('readiness endpoints by role', () => {
  it('removes sessions deleted while a node was disconnected', async () => {
    const computer = {
      id: 'node-1',
      name: 'Workshop',
      baseUrl: 'http://node-1.local:4319',
      token: 'node-token',
    }
    const manager = new ComputerManager(
      new FakeSessionService(),
      { info: { id: 'hub' } } as unknown as NodeIdentityStore,
      { list: () => [computer] } as unknown as ComputerRegistry,
    )
    // The node held two sessions when the connection dropped.
    manager['sessionCache'].set('node-1', [
      { ...session('kept-session', 'Kept'), computerId: 'node-1' },
      { ...session('deleted-session', 'Deleted'), computerId: 'node-1' },
    ] as never)
    const events: ServerEvent[] = []
    manager.on('event', (event) => events.push(event as ServerEvent))

    // One of them was deleted before it came back, so it is simply absent.
    await manager['resyncRemoteComputer'](computer, {
      listSessions: async () => [session('kept-session', 'Kept')],
      providers: [],
    } as never)

    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'session.removed',
        computerId: 'node-1',
        sessionId: 'deleted-session',
      }),
    )
    // The surviving session is refreshed rather than removed.
    expect(
      events.filter((event) => event.type === 'session.removed'),
    ).toHaveLength(1)
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'session.upserted',
        session: expect.objectContaining({ id: 'kept-session' }),
      }),
    )
  })

  it('serves /health on a node while /api/health stays hub-only', async () => {
    const node = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node-health'),
      logger: false,
      role: 'node',
      service: new FakeSessionService(),
    })

    try {
      const health = await node.app.inject({ method: 'GET', url: '/health' })
      expect(health.statusCode).toBe(200)
      expect(health.json()).toMatchObject({ ok: true, role: 'node' })

      const hubOnly = await node.app.inject({
        method: 'GET',
        url: '/api/health',
      })
      expect(hubOnly.statusCode).toBe(404)
    } finally {
      await node.app.close()
    }
  })

  it('serves both readiness endpoints on a hub', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://agentic.example.test')
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-hub-health'),
      logger: false,
      role: 'hub',
      service: new FakeSessionService(),
    })

    try {
      for (const url of ['/health', '/api/health']) {
        const response = await hub.app.inject({
          method: 'GET',
          url,
          headers: { host: 'agentic.example.test' },
        })
        expect(response.statusCode).toBe(200)
      }
    } finally {
      await hub.app.close()
    }
  })
})
