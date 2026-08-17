import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import type {
  ConfigureRuntimeInput,
  DirectoryListing,
  HubEvent,
  ServerEvent,
  SessionDetail,
  SlashCommand,
  UserInputReplyInput,
  RuntimeOptions,
  SessionFileUpload,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import { buildApp } from './app.js'
import type { SessionService } from './session-service.js'

class FakeSessionService extends EventEmitter implements SessionService {
  private readonly sessions = new Map<string, SessionDetail>()
  lastCreateTerminalBacked?: boolean
  lastCreateAllowAllPermissions?: boolean
  lastUpload?: { sessionId: string; filename: string; data: Buffer }

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

  async createSession(
    cwd: string,
    terminalBacked?: boolean,
    allowAllPermissions?: boolean,
  ): Promise<SessionDetail> {
    this.lastCreateTerminalBacked = terminalBacked
    this.lastCreateAllowAllPermissions = allowAllPermissions
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
      models: [
        {
          id: 'remote-model',
          name: 'Remote model',
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
    vi.stubEnv('HOST', '10.0.0.181')
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
        headers: { host: '10.0.0.181:4317' },
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
    // Exactly what `agentic-remote setup --host 10.0.0.181 --port 4317` writes.
    vi.stubEnv(
      'AGENTIC_REMOTE_ALLOWED_ORIGINS',
      'http://10.0.0.181:4317,http://localhost:4317,http://127.0.0.1:4317',
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
        '10.0.0.181:4317',
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
          name: 'homelab-prod',
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

      const directories = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/directories?path=~`,
      })
      expect(directories.json()).toMatchObject({
        path: '~',
        directories: [{ name: 'src', path: '~/src' }],
      })

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

      const savedKnowledge = await hub.app.inject({
        method: 'POST',
        url: '/api/knowledge',
        payload: {
          computerId: remoteComputerId,
          sessionId: 'remote-session',
          path: 'README.md',
          name: 'README.md',
          kind: 'file',
        },
      })
      expect(savedKnowledge.statusCode, savedKnowledge.body).toBe(201)
      expect(savedKnowledge.json().bookmark).toMatchObject({
        computerId: remoteComputerId,
        computerName: 'homelab-prod',
        sessionId: 'remote-session',
        path: 'README.md',
        kind: 'file',
      })
      const bookmarkId = savedKnowledge.json().bookmark.id
      const knowledge = await hub.app.inject({
        method: 'GET',
        url: '/api/knowledge',
      })
      expect(knowledge.json().bookmarks).toHaveLength(1)
      const removedKnowledge = await hub.app.inject({
        method: 'DELETE',
        url: `/api/knowledge/${bookmarkId}`,
      })
      expect(removedKnowledge.statusCode).toBe(204)

      const sessions = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
      })
      expect(
        sessions
          .json()
          .sessions.map((entry: { computerName: string }) => entry.computerName),
      ).toEqual(expect.arrayContaining(['homelab-prod', hub.identity.info.name]))

      const created = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions`,
        payload: { cwd: '/srv/new-session' },
      })
      expect(created.statusCode, created.body).toBe(201)
      expect(remoteService.lastCreateTerminalBacked).toBe(true)
      expect(remoteService.lastCreateAllowAllPermissions).toBe(true)

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
        computerName: 'homelab-prod',
        messages: [{ content: 'Remote history' }],
      })
      const answered = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/user-input/remote-question`,
        payload: { answer: 'Two', wasFreeform: false },
      })
      expect(answered.json().session).toMatchObject({
        computerName: 'homelab-prod',
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
        computerName: 'homelab-prod',
      })
      const removedQueue = await hub.app.inject({
        method: 'DELETE',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/queue/remote-queue`,
      })
      expect(removedQueue.json()).toMatchObject({
        session: { queuedCount: 0, computerName: 'homelab-prod' },
        prompt: { content: 'Queued remote prompt' },
      })
      const runtimeOptions = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/runtime`,
      })
      expect(runtimeOptions.json().models).toEqual([
        expect.objectContaining({ id: 'remote-model' }),
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
        computerName: 'homelab-prod',
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
        computerName: 'homelab-prod',
        messages: [],
      })
      const restarted = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/restart`,
        payload: {},
      })
      expect(restarted.json().session).toMatchObject({
        id: 'remote-session',
        computerName: 'homelab-prod',
      })
      const movedToTmux = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/tmux`,
        payload: {},
      })
      expect(movedToTmux.json().session).toMatchObject({
        id: 'remote-session',
        computerName: 'homelab-prod',
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
            computerName: 'homelab-prod',
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
        payload: { command: '/model gpt-5.6-sol' },
      })
      expect(command.json().session.messages.at(-1)).toMatchObject({
        role: 'notice',
        content: '/model gpt-5.6-sol',
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
        session: { computerName: 'homelab-prod' },
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
})
