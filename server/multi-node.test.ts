import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, mkdtemp, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import type {
  AgentMode,
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
  QueuedPromptDispatchResult,
  RuntimeReasoningEffort,
  SessionFileUpload,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
  SideQuestionExchange,
} from '../shared/contracts.js'
import { SessionPatchReceiver } from '../src/session-patches.js'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import { buildApp } from './app.js'
import { ComputerManager } from './computer-manager.js'
import { ComputerRegistry } from './computer-registry.js'
import { NodeIdentityStore } from './node-identity.js'
import {
  FakeVoiceEngine,
  FakeVoiceEngineFactory,
} from './oracle-voice-engine.js'
import {
  LocalVoiceBackend,
  type VoiceBackend,
  type VoiceBackendSession,
} from './oracle-voice-session.js'
import { RemoteNodeClient } from './remote-node-client.js'
import { RemoteNodeRequestError } from './remote-node-errors.js'
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
  lastCreateMode?: AgentMode
  lastSideQuestion?: { sessionId: string; question: string; earlier?: readonly SideQuestionExchange[] }
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
        supportsQueuedPromptDispatch: true,
        supportsContextRecovery: true,
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
    mode?: AgentMode,
  ): Promise<SessionDetail> {
    if (this.createError) {
      throw this.createError
    }
    this.lastCreateMode = mode
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

  readonly retentionPatches: import('../shared/contracts.js').SessionRetentionPatch[] = []

  async configureRetention(
    id: string,
    patch: import('../shared/contracts.js').SessionRetentionPatch,
  ): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) throw new Error('Session not found')
    this.retentionPatches.push(structuredClone(patch))
    const idleDays = patch.idleDays === undefined ? session.retention?.idleDays : patch.idleDays ?? undefined
    session.retention = {
      pinned: patch.pinned ?? session.retention?.pinned ?? false,
      ...(idleDays === undefined ? {} : { idleDays }),
    }
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
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

  async recoverConversation(
    id: string,
    reason: import('../shared/contracts.js').SessionRecoveryReason,
  ): Promise<SessionDetail> {
    const current = this.sessions.get(id)
    if (!current) throw new Error('Session not found')
    const recovered = {
      ...current,
      id: `${id}-recovered`,
      replacedSessionIds: [...(current.replacedSessionIds || []), id],
      recovery: {
        recoveredAt: new Date().toISOString(),
        archivedMessageCount: current.messages.length,
        contextMessageCount: current.messages.length,
        contextTruncated: false,
        reason,
      },
    }
    this.sessions.delete(id)
    this.sessions.set(recovered.id, recovered)
    return structuredClone(recovered)
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

  async updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ) {
    const session = this.sessions.get(sessionId)
    const prompt = session?.queuedPrompts?.find((entry) => entry.id === promptId)
    if (!session || !prompt) {
      throw new Error('Queued prompt not found')
    }
    prompt.content = content
    this.emitEvent({ type: 'session.upserted', session })
    return { session: structuredClone(session), prompt }
  }

  async reorderQueuedPrompts(sessionId: string, order: string[]) {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    const queue = session.queuedPrompts || []
    session.queuedPrompts = order.map(
      (id) => queue.find((entry) => entry.id === id)!,
    )
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async removeQueuedPrompt(sessionId: string, promptId: string, acknowledgesDispatch?: string) {
    const session = this.sessions.get(sessionId)
    const prompt = session?.queuedPrompts?.find((entry) => entry.id === promptId)
    if (!session || !prompt) {
      throw new Error('Queued prompt not found')
    }
    if (session.queuedDispatch && session.queuedDispatch.attemptId !== acknowledgesDispatch) {
      throw Object.assign(new Error('A fresh dispatch acknowledgement is required'), { statusCode: 409 })
    }
    session.queuedPrompts = session.queuedPrompts?.filter(
      (entry) => entry.id !== promptId,
    )
    session.queuedCount = session.queuedPrompts?.length || 0
    session.queuedDispatch = undefined
    this.emitEvent({ type: 'session.upserted', session })
    return { session: structuredClone(session), prompt }
  }

  async dispatchQueuedPrompt(
    sessionId: string,
    promptId: string,
    _content: string,
  ): Promise<QueuedPromptDispatchResult> {
    const session = this.sessions.get(sessionId)
    if (!session?.queuedPrompts?.some((prompt) => prompt.id === promptId)) {
      throw Object.assign(new Error('Queued prompt not found'), { statusCode: 409 })
    }
    session.queuedPrompts = session.queuedPrompts.filter((prompt) => prompt.id !== promptId)
    session.queuedCount = session.queuedPrompts.length
    return { outcome: 'sent', promptId, attemptId: randomUUID(), session: structuredClone(session) }
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

  async askSession(
    sessionId: string,
    question: string,
    earlier?: readonly SideQuestionExchange[],
  ): Promise<string> {
    this.lastSideQuestion = { sessionId, question, ...(earlier ? { earlier } : {}) }
    return `Remote answer: ${question}`
  }

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

function openNodeVoiceSocket(
  url: string,
  authorization?: string,
): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, {
      headers: authorization ? { authorization } : undefined,
    })
    voiceControlQueues.set(socket, [])
    socket.on('message', (data, isBinary) => {
      const waiter = voiceControlWaiters.get(socket)
      if (waiter) {
        voiceControlWaiters.delete(socket)
        waiter(data, isBinary)
      } else {
        voiceControlQueues.get(socket)?.push({ data, isBinary })
      }
    })
    socket.once('open', () => resolve(socket))
    socket.once('unexpected-response', (_request, response) => {
      response.resume()
      reject(Object.assign(
        new Error(`Voice upgrade failed (${response.statusCode})`),
        { statusCode: response.statusCode },
      ))
    })
    socket.once('error', reject)
  })
}

const voiceControlQueues = new WeakMap<
  WebSocket,
  Array<{ data: WebSocket.RawData; isBinary: boolean }>
>()
const voiceControlWaiters = new WeakMap<
  WebSocket,
  (data: WebSocket.RawData, isBinary: boolean) => void
>()

function nextVoiceControl(socket: WebSocket): Promise<VoiceServerControl> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      voiceControlWaiters.delete(socket)
      reject(new Error('Timed out waiting for node voice control'))
    }, 5_000)
    const receive = (data: WebSocket.RawData, isBinary: boolean) => {
      clearTimeout(timer)
      if (isBinary) {
        reject(new Error('Expected a voice control message'))
        return
      }
      resolve(JSON.parse(data.toString()) as VoiceServerControl)
    }
    const queued = voiceControlQueues.get(socket)?.shift()
    if (queued) receive(queued.data, queued.isBinary)
    else voiceControlWaiters.set(socket, receive)
  })
}

function voiceBackend(): VoiceBackend {
  return new LocalVoiceBackend(
    new FakeVoiceEngineFactory(new FakeVoiceEngine(), {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    }),
    {
      enabled: true,
      language: 'en',
      threads: 2,
      endpointMs: 800,
      stt: {
        profile: 'zipformer',
        modelDirectory: '/models/stt',
      },
      tts: {
        binary: '/bin/piper',
        model: '/models/lessac.onnx',
        config: '/models/lessac.json',
        sampleRate: 22_050,
      },
    },
  )
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
  it('includes archived metadata only in an explicitly requested authenticated node snapshot', async () => {
    const archived = {
      ...session('archived', 'Saved for history'), isOpen: false, archivedAt: '2026-10-19T06:52:00Z',
    }
    const service = new FakeSessionService(
      session('active', 'Active'), archived,
      { ...session('closed', 'Explicitly closed'), isOpen: false },
    )
    const node = await buildApp({
      dataDirectory: await temporaryDirectory('retention-node-snapshot'),
      logger: false, role: 'node', service,
    })
    try {
      const headers = { authorization: `Bearer ${node.identity.token}` }
      const active = await node.app.inject({ method: 'GET', url: '/node-api/sessions', headers })
      expect(active.json().sessions.map((entry: SessionDetail) => entry.id)).toEqual(['active'])
      const snapshot = await node.app.inject({
        method: 'GET', url: '/node-api/sessions?includeArchived=1', headers,
      })
      expect(snapshot.statusCode).toBe(200)
      expect(snapshot.json().sessions.map((entry: SessionDetail) => entry.id)).toEqual(['active', 'archived'])
      expect(snapshot.json().sessions.every((entry: SessionDetail) => entry.messages.length === 0)).toBe(true)
      expect((await node.app.inject({
        method: 'GET', url: '/node-api/sessions?includeArchived=invalid', headers,
      })).statusCode).toBe(400)
      expect((await node.app.inject({
        method: 'GET', url: '/node-api/sessions?includeArchived=1',
      })).statusCode).toBe(401)
    } finally {
      await node.app.close()
    }
  })

  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('authenticates node voice upgrades and advertises only non-sensitive capability', async () => {
    const backend = voiceBackend()
    const worker = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node-voice'),
      logger: false,
      role: 'node',
      service: new FakeSessionService(),
      voiceBackend: backend,
    })
    await worker.app.listen({ host: '127.0.0.1', port: 0 })
    const address = worker.app.server.address() as AddressInfo
    const endpoint = `ws://127.0.0.1:${address.port}/node-api/oracle-voice`
    const validUrl = `${endpoint}?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=voice-one`
    let socket: WebSocket | undefined
    try {
      await expect(openNodeVoiceSocket(validUrl)).rejects.toMatchObject({
        statusCode: 401,
      })
      await expect(openNodeVoiceSocket(
        `${endpoint}?protocol=${ORACLE_VOICE_PROTOCOL + 1}&streamId=voice-one`,
        `Bearer ${worker.identity.token}`,
      )).rejects.toMatchObject({ statusCode: 400 })

      const info = await worker.app.inject({
        method: 'GET',
        url: '/node-api/info',
        headers: { authorization: `Bearer ${worker.identity.token}` },
      })
      expect(info.statusCode).toBe(200)
      expect(info.json().voice).toEqual({
        available: true,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        playbackSampleRate: 22_050,
        languages: ['en'],
        sttProfile: 'zipformer',
        ttsVoice: 'lessac',
        resourceClass: 'low',
      })
      expect(JSON.stringify(info.json().voice)).not.toContain('/models/')
      expect(JSON.stringify(info.json().voice)).not.toContain('/bin/')

      socket = await openNodeVoiceSocket(
        validUrl,
        `Bearer ${worker.identity.token}`,
      )
      const hello = await nextVoiceControl(socket)
      expect(hello).toMatchObject({
        type: 'hello',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: 'voice-one',
        generation: 0,
        capabilities: {
          available: true,
          computerId: worker.identity.info.id,
          computerName: worker.identity.info.name,
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          playbackSampleRate: 22_050,
        },
      })
      if (hello.type !== 'hello') throw new Error('Expected node voice hello')
      expect(hello.capabilities.limits).toEqual({
        maxFrameBytes: 32 * 1024,
        maxQueueBytes: 64_000,
        maxUtteranceMs: 30_000,
      })
      await expect(openNodeVoiceSocket(
        `${endpoint}?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=voice-two`,
        `Bearer ${worker.identity.token}`,
      )).rejects.toMatchObject({ statusCode: 409 })

      socket.send(JSON.stringify({
        type: 'start',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: 'voice-one',
        generation: 1,
        language: 'en',
        defaults: {},
        answerOnly: false,
      }))
      expect(await nextVoiceControl(socket)).toMatchObject({
        type: 'state',
        state: 'ready',
      })
      const stopped = new Promise<{ code: number; reason: string }>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Timed out waiting for a clean node voice stop')),
          1_000,
        )
        socket!.once('close', (code, reason) => {
          clearTimeout(timer)
          resolve({ code, reason: reason.toString() })
        })
      })
      socket.send(JSON.stringify({
        type: 'stop',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: 'voice-one',
        generation: 1,
        reason: 'User stopped',
      }))
      await expect(stopped).resolves.toEqual({
        code: 1000,
        reason: 'User stopped',
      })
      socket = undefined
    } finally {
      socket?.close()
      await worker.app.close()
      await backend.stop()
    }
  })

  it('rejects a node voice upgrade when this runtime has no backend', async () => {
    const worker = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node-voice-missing'),
      logger: false,
      role: 'node',
      service: new FakeSessionService(),
    })
    await worker.app.listen({ host: '127.0.0.1', port: 0 })
    const address = worker.app.server.address() as AddressInfo
    try {
      await expect(openNodeVoiceSocket(
        `ws://127.0.0.1:${address.port}/node-api/oracle-voice`
          + `?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=voice-one`,
        `Bearer ${worker.identity.token}`,
      )).rejects.toMatchObject({ statusCode: 503 })
    } finally {
      await worker.app.close()
    }
  })

  it('rejects an oversized node microphone frame before decoding it', async () => {
    const backend = voiceBackend()
    const worker = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node-voice-oversized'),
      logger: false,
      role: 'node',
      service: new FakeSessionService(),
      voiceBackend: backend,
    })
    await worker.app.listen({ host: '127.0.0.1', port: 0 })
    const address = worker.app.server.address() as AddressInfo
    const socket = await openNodeVoiceSocket(
      `ws://127.0.0.1:${address.port}/node-api/oracle-voice`
        + `?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=voice-oversized`,
      `Bearer ${worker.identity.token}`,
    )
    try {
      const hello = await nextVoiceControl(socket)
      if (hello.type !== 'hello') throw new Error('Expected node voice hello')
      const closed = new Promise<{ code: number; reason: string }>((resolve) => {
        socket.once('close', (code, reason) => {
          resolve({ code, reason: reason.toString() })
        })
      })

      socket.send(Buffer.alloc(hello.capabilities.limits.maxFrameBytes + 1))

      await expect(closed).resolves.toEqual({
        code: 1009,
        reason: 'Node voice frame is too large',
      })
    } finally {
      socket.close()
      await worker.app.close()
      await backend.stop()
    }
  })

  it('closes a voice session that finishes opening after its socket disconnects', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const closeSession = vi.fn(async () => undefined)
    const session: VoiceBackendSession = {
      control: async () => undefined,
      audio: async () => undefined,
      close: closeSession,
    }
    const backend: VoiceBackend = {
      capability: () => ({
        available: true,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        playbackSampleRate: 22_050,
        languages: ['en'],
        sttProfile: 'zipformer',
        ttsVoice: 'lessac',
        resourceClass: 'low',
      }),
      limits: () => ({
        maxFrameBytes: 32 * 1024,
        maxQueueBytes: 64 * 1024,
        maxOutputQueueBytes: 589_824,
        maxUtteranceMs: 30_000,
        idleTimeoutMs: 30_000,
      }),
      busy: () => false,
      open: async () => {
        await gate
        return session
      },
      stop: async () => undefined,
    }
    const worker = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node-voice-opening'),
      logger: false,
      role: 'node',
      service: new FakeSessionService(),
      voiceBackend: backend,
    })
    await worker.app.listen({ host: '127.0.0.1', port: 0 })
    const address = worker.app.server.address() as AddressInfo
    const socket = await openNodeVoiceSocket(
      `ws://127.0.0.1:${address.port}/node-api/oracle-voice`
        + `?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=voice-opening`,
      `Bearer ${worker.identity.token}`,
    )
    try {
      await new Promise<void>((resolve) => {
        socket.once('close', () => resolve())
        socket.close()
      })
      release()

      await vi.waitFor(() => expect(closeSession).toHaveBeenCalledOnce())
    } finally {
      release()
      await worker.app.close()
    }
  })

  it('aborts blocked node voice acquisition and admits an immediate replacement', async () => {
    let initializeStarted!: () => void
    let releaseInitialize!: () => void
    const started = new Promise<void>((resolve) => {
      initializeStarted = resolve
    })
    const initializeGate = new Promise<void>((resolve) => {
      releaseInitialize = resolve
    })
    const engine = new FakeVoiceEngine()
    const factory = new FakeVoiceEngineFactory(engine, {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    })
    vi.spyOn(factory, 'initialize').mockImplementation(async () => {
      initializeStarted()
      await initializeGate
      return engine
    })
    const backend = new LocalVoiceBackend(factory, {
      enabled: true,
      language: 'en',
      threads: 1,
      endpointMs: 800,
      stt: {
        profile: 'zipformer',
        modelDirectory: '/not-used/node-stt',
      },
      tts: {
        binary: '/not-used/node-piper',
        model: '/not-used/node-voice.onnx',
        config: '/not-used/node-voice.json',
        sampleRate: 22_050,
      },
    })
    const worker = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node-voice-abort'),
      logger: false,
      role: 'node',
      service: new FakeSessionService(),
      voiceBackend: backend,
    })
    await worker.app.listen({ host: '127.0.0.1', port: 0 })
    const address = worker.app.server.address() as AddressInfo
    const endpoint = `ws://127.0.0.1:${address.port}/node-api/oracle-voice`
    const authorization = `Bearer ${worker.identity.token}`
    const oldMessages: VoiceServerControl[] = []
    const first = await openNodeVoiceSocket(
      `${endpoint}?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=voice-blocked`,
      authorization,
    )
    first.on('message', (data, isBinary) => {
      if (!isBinary) oldMessages.push(JSON.parse(data.toString()) as VoiceServerControl)
    })
    let second: WebSocket | undefined
    try {
      await started
      expect(backend.busy()).toBe(true)
      await new Promise<void>((resolve) => {
        first.once('close', () => resolve())
        first.close()
      })
      await vi.waitFor(() => expect(backend.busy()).toBe(false))

      second = await openNodeVoiceSocket(
        `${endpoint}?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=voice-replacement`,
        authorization,
      )
      expect(backend.busy()).toBe(true)
      expect(oldMessages).toEqual([])

      releaseInitialize()
      await expect(nextVoiceControl(second)).resolves.toMatchObject({
        type: 'hello',
        streamId: 'voice-replacement',
      })
      expect(oldMessages).toEqual([])
      await new Promise<void>((resolve) => {
        second!.once('close', () => resolve())
        second!.close()
      })
      await vi.waitFor(() => expect(backend.busy()).toBe(false))
    } finally {
      releaseInitialize()
      first.close()
      second?.close()
      await worker.app.close()
      await backend.stop()
    }
    expect(engine.calls.filter((call) => call.type === 'close')).toHaveLength(1)
  })

  it('fails closed when an older node does not advertise context recovery', async () => {
    const localService = new FakeSessionService(session('local-session', 'Local'))
    const remoteService = new FakeSessionService({
      ...session('remote-session', 'Remote'),
      status: 'error',
    })
    const olderProviders = remoteService.providers().map(
      ({ supportsContextRecovery: _recovery, ...provider }) => provider,
    )
    vi.spyOn(remoteService, 'providers').mockReturnValue(
      olderProviders as unknown as ReturnType<FakeSessionService['providers']>,
    )
    const recover = vi.spyOn(remoteService, 'recoverConversation')
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-recovery-hub'),
      logger: false,
      role: 'hub',
      service: localService,
    })
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-recovery-node'),
      logger: false,
      role: 'node',
      service: remoteService,
    })
    try {
      await remote.app.listen({ host: '127.0.0.1', port: 0 })
      const address = remote.app.server.address()
      if (!address || typeof address === 'string') throw new Error('Node has no TCP address')
      expect((await hub.app.inject({
        method: 'POST',
        url: '/api/computers',
        payload: {
          baseUrl: `http://127.0.0.1:${address.port}`,
          token: remote.identity.token,
          name: 'older-node',
        },
      })).statusCode).toBe(201)
      const response = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remote.identity.info.id}/sessions/remote-session/recover`,
        payload: { reason: 'provider-error' },
      })

      expect(response.statusCode).toBe(409)
      expect(response.json().error).toContain('does not support conversation recovery yet')
      expect(recover).not.toHaveBeenCalled()
    } finally {
      await Promise.all([hub.app.close(), remote.app.close()])
    }
  })

  it('reads sessions for Oracle without opening them, on the hub and on a node', async () => {
    const localService = new FakeSessionService(session('local-session', 'Local'))
    const remoteService = new FakeSessionService(session('remote-session', 'Remote'))
    const localOpen = vi.spyOn(localService, 'openSession')
    const remoteOpen = vi.spyOn(remoteService, 'openSession')
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-read-hub'),
      logger: false,
      role: 'hub',
      service: localService,
    })
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-read-node'),
      logger: false,
      role: 'node',
      service: remoteService,
    })
    try {
      await remote.app.listen({ host: '127.0.0.1', port: 0 })
      const address = remote.app.server.address()
      if (!address || typeof address === 'string') throw new Error('Node has no TCP address')
      expect((await hub.app.inject({
        method: 'POST',
        url: '/api/computers',
        payload: {
          baseUrl: `http://127.0.0.1:${address.port}`,
          token: remote.identity.token,
          name: 'worker-node',
        },
      })).statusCode).toBe(201)
      const manager = hub.manager
      if (!manager) throw new Error('Reading requires a hub manager')

      expect(await manager.readSession(hub.identity.info.id, 'local-session')).toMatchObject({
        id: 'local-session',
        computerId: hub.identity.info.id,
      })
      expect(await manager.readSession(remote.identity.info.id, 'remote-session')).toMatchObject({
        id: 'remote-session',
        computerId: remote.identity.info.id,
        computerName: 'worker-node',
      })
      // Opening loads or reconciles a session; a read for Oracle must not.
      expect(localOpen).not.toHaveBeenCalled()
      expect(remoteOpen).not.toHaveBeenCalled()
      await expect(manager.readSession(hub.identity.info.id, 'missing')).rejects.toMatchObject({ statusCode: 404 })
      await expect(manager.readSession(remote.identity.info.id, 'missing')).rejects.toMatchObject({ statusCode: 404 })
      expect(remoteOpen).not.toHaveBeenCalled()
    } finally {
      await Promise.all([hub.app.close(), remote.app.close()])
    }
  })

  it('routes context recovery through the authenticated node replacement chain', async () => {
    const localService = new FakeSessionService(session('local-session', 'Local'))
    const remoteService = new FakeSessionService({
      ...session('remote-session', 'Remote'),
      status: 'error',
    })
    const recover = vi.spyOn(remoteService, 'recoverConversation')
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-recovery-route-hub'),
      logger: false,
      role: 'hub',
      service: localService,
    })
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-recovery-route-node'),
      logger: false,
      role: 'node',
      service: remoteService,
    })
    try {
      await remote.app.listen({ host: '127.0.0.1', port: 0 })
      const address = remote.app.server.address()
      if (!address || typeof address === 'string') throw new Error('Node has no TCP address')
      expect((await hub.app.inject({
        method: 'POST',
        url: '/api/computers',
        payload: {
          baseUrl: `http://127.0.0.1:${address.port}`,
          token: remote.identity.token,
          name: 'recovery-node',
        },
      })).statusCode).toBe(201)
      await vi.waitFor(() => {
        expect(hub.manager?.listComputers().find(
          (computer) => computer.id === remote.identity.info.id,
        )?.providers?.[0]?.supportsContextRecovery).toBe(true)
      })
      const response = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remote.identity.info.id}/sessions/remote-session/recover`,
        payload: { reason: 'provider-error' },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().session).toMatchObject({
        id: 'remote-session-recovered',
        computerId: remote.identity.info.id,
        replacedSessionIds: ['remote-session'],
        recovery: { reason: 'provider-error' },
      })
      expect(recover).toHaveBeenCalledWith('remote-session', 'provider-error')
    } finally {
      await Promise.all([hub.app.close(), remote.app.close()])
    }
  })

  it.each([307, 308])('surfaces HTTP %i redirects during pairing and established-node writes', async (redirectStatus) => {
    const localService = new FakeSessionService(session('local-session', 'Local'))
    const remoteService = new FakeSessionService(session('remote-session', 'Remote'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-redirect-hub'),
      logger: false, role: 'hub', service: localService,
    })
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-redirect-node'),
      logger: false, role: 'node', service: remoteService,
    })
    const manager = hub.manager
    if (!manager) throw new Error('Redirect fixture requires a hub manager')
    let redirectedRequests = 0
    let redirectPath: string | undefined = '/node-api/info'
    let location = ''
    hub.app.all('/redirect-target', async () => {
      redirectedRequests += 1
      return { error: 'Redirect target must not be invoked' }
    })
    remote.app.addHook('onSend', async (request, reply, payload) => {
      if (request.routeOptions.url === redirectPath) {
        reply.code(redirectStatus).header('location', location)
        return 'Untrusted redirect response'
      }
      return payload
    })
    try {
      await hub.app.listen({ host: '127.0.0.1', port: 0 })
      await remote.app.listen({ host: '127.0.0.1', port: 0 })
      const hubAddress = hub.app.server.address()
      const remoteAddress = remote.app.server.address()
      if (!hubAddress || typeof hubAddress === 'string' ||
        !remoteAddress || typeof remoteAddress === 'string') {
        throw new Error('Redirect fixture has no TCP address')
      }
      location = `http://127.0.0.1:${hubAddress.port}/redirect-target?secret=do-not-display`
      const input = {
        baseUrl: `http://127.0.0.1:${remoteAddress.port}`,
        token: remote.identity.token,
        name: 'redirecting-worker',
      }
      const refused = await hub.app.inject({
        method: 'POST', url: '/api/computers', payload: input,
      })
      expect(refused.statusCode).toBe(502)
      expect(refused.json().error).toContain(`HTTP ${redirectStatus} redirect`)
      expect(refused.json().error).toContain('final node URL')
      expect(refused.body).not.toContain('do-not-display')
      expect((await hub.app.inject({ method: 'GET', url: '/api/computers' })).json().computers)
        .toHaveLength(1)
      expect(redirectedRequests).toBe(0)

      redirectPath = undefined
      expect((await hub.app.inject({
        method: 'POST', url: '/api/computers', payload: input,
      })).statusCode).toBe(201)
      await vi.waitFor(async () => {
        const computers = await manager.listComputers()
        expect(computers.find((computer) => computer.id === remote.identity.info.id)?.online).toBe(true)
      })

      const before = localService.getSession('local-session')
      const send = vi.spyOn(remoteService, 'sendMessage')
      redirectPath = '/node-api/sessions/:sessionId/messages'
      const unconfirmed = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remote.identity.info.id}/sessions/remote-session/messages`,
        payload: { content: 'Intended only for the node', enqueue: true },
      })
      expect(unconfirmed.statusCode).toBe(502)
      expect(unconfirmed.json().error).toContain(`HTTP ${redirectStatus} redirect`)
      expect(unconfirmed.json().error).toContain('final node URL')
      expect(unconfirmed.body).not.toContain('do-not-display')
      expect(send).toHaveBeenCalledOnce()
      expect(redirectedRequests).toBe(0)
      expect(localService.getSession('local-session')).toEqual(before)
    } finally {
      await hub.app.close()
      await remote.app.close()
    }
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
    let patchSocket: WebSocket | undefined
    // What a browser that takes patches rebuilds must be exactly what one that
    // does not is sent, event for event, including a node's sessions.
    const plainUpserts: unknown[] = []
    const rebuiltUpserts: unknown[] = []
    const patchFrames: string[] = []
    let resyncs = 0

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
      patchSocket = new WebSocket(
        `ws://127.0.0.1:${hubAddress.port}/api/events?patches=1`,
      )
      await Promise.all([hubSocket, patchSocket].map((socket) =>
        new Promise<void>((resolve, reject) => {
          socket.once('open', resolve)
          socket.once('error', reject)
        })))
      hubSocket.on('message', (data) => {
        const event = JSON.parse(data.toString()) as { type: string }
        if (event.type === 'session.upserted') plainUpserts.push(event)
      })
      const receiver = new SessionPatchReceiver(() => { resyncs += 1 })
      patchSocket.on('message', (data) => {
        const wire = JSON.parse(data.toString()) as Parameters<typeof receiver.receive>[0]
        if (wire.type === 'session.patched') patchFrames.push(data.toString())
        const event = receiver.receive(wire)
        if (event?.type === 'session.upserted') rebuiltUpserts.push(event)
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
          mode: 'plan',
        },
      })
      expect(created.statusCode, created.body).toBe(201)
      expect(remoteService.lastCreateMode).toBe('plan')
      const asked = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/ask`,
        payload: { question: '  What changed?  ' },
      })
      expect(asked.statusCode, asked.body).toBe(200)
      expect(asked.json()).toEqual({ answer: 'Remote answer: What changed?' })
      expect(remoteService.lastSideQuestion).toEqual({
        sessionId: 'remote-session',
        question: 'What changed?',
      })
      const followUp = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/ask`,
        payload: {
          question: 'And then?',
          earlier: [{ question: ' What changed? ', answer: ' The parser. ' }],
        },
      })
      expect(followUp.statusCode, followUp.body).toBe(200)
      expect(remoteService.lastSideQuestion).toEqual({
        sessionId: 'remote-session',
        question: 'And then?',
        earlier: [{ question: 'What changed?', answer: 'The parser.' }],
      })
      const exchange = { question: 'Q?', answer: 'A.' }
      for (const payload of [
        { question: '   ' },
        { question: 'x'.repeat(4_001) },
        { question: 'Next?', earlier: Array.from({ length: 7 }, () => exchange) },
        { question: 'Next?', earlier: [{ question: 'Q?', answer: 'x'.repeat(16_001) }] },
        { question: 'Next?', earlier: [{ question: 'Q?', answer: '  ' }] },
      ]) {
        const refused = await hub.app.inject({
          method: 'POST',
          url: `/api/computers/${remoteComputerId}/sessions/remote-session/ask`,
          payload,
        })
        expect(refused.statusCode).toBe(400)
      }
      expect(remoteService.lastSideQuestion?.question).toBe('And then?')
      const unknownMode = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions`,
        payload: { cwd: '/srv/new-session', mode: 'shell' },
      })
      expect(unknownMode.statusCode).toBe(400)
      expect(remoteService.lastCreateMode).toBe('plan')
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
      const pinned = await hub.app.inject({
        method: 'PATCH',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/retention`,
        payload: { pinned: true },
      })
      expect(pinned.statusCode, pinned.body).toBe(200)
      const retained = await hub.app.inject({
        method: 'PATCH',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/retention`,
        payload: { idleDays: 30 },
      })
      expect(retained.statusCode, retained.body).toBe(200)
      // Each device's edit reaches the owner as the field it changed.
      expect(remoteService.retentionPatches).toEqual([{ pinned: true }, { idleDays: 30 }])
      expect(retained.json().session).toMatchObject({
        computerId: remoteComputerId, retention: { pinned: true, idleDays: 30 },
      })
      expect(remoteService.getSession('remote-session')?.retention).toEqual({ pinned: true, idleDays: 30 })
      expect(localService.getSession('local-session')?.retention).toBeUndefined()
      await vi.waitFor(() => {
        for (const device of [plainUpserts, rebuiltUpserts]) {
          expect(device).toContainEqual(expect.objectContaining({
            type: 'session.upserted',
            session: expect.objectContaining({
              computerId: remoteComputerId, id: 'remote-session',
              retention: { pinned: true, idleDays: 30 },
            }),
          }))
        }
      })
      for (const payload of [{ pinned: false, idleDays: 0 }, {}, { pinned: true, extra: true }]) {
        const invalidRetention = await hub.app.inject({
          method: 'PATCH',
          url: `/api/computers/${remoteComputerId}/sessions/remote-session/retention`,
          payload,
        })
        expect(invalidRetention.statusCode).toBe(400)
      }
      expect(remoteService.retentionPatches).toHaveLength(2)
      expect(remoteService.getSession('remote-session')?.retention?.pinned).toBe(true)
      expect((await remote.app.inject({
        method: 'PATCH', url: '/node-api/sessions/remote-session/retention',
        payload: { pinned: false },
      })).statusCode).toBe(401)
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
        payload: { content: '\nhello remote\n' },
      })
      expect(sent.statusCode, sent.body).toBe(202)
      expect(sent.json().session.messages.at(-1)).toMatchObject({
        role: 'user',
        content: '\nhello remote\n',
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
      // Both sockets are sent each event in turn, so both have it by now.
      await vi.waitFor(() => expect(rebuiltUpserts.length).toBe(plainUpserts.length))
      expect(rebuiltUpserts).toEqual(plainUpserts)
      expect(patchFrames.length).toBeGreaterThan(0)
      expect(patchFrames.some((frame) => frame.includes(remoteComputerId))).toBe(true)
      expect(resyncs).toBe(0)
    } finally {
      hubSocket?.close()
      patchSocket?.close()
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

  it('does not reuse Knowledge validation from an earlier pairing of the same node', async () => {
    const remoteService = new FakeSessionService(session('remote-session', 'Remote'))
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-knowledge-lifetime-node'),
      logger: false,
      role: 'node',
      service: remoteService,
    })
    await remote.app.listen({ host: '127.0.0.1', port: 0 })
    const address = remote.app.server.address() as AddressInfo
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-knowledge-lifetime-hub'),
      logger: false,
      role: 'hub',
      service: new FakeSessionService(session('local-session', 'Local')),
    })
    let releaseValidation!: () => void
    const validationGate = new Promise<void>((resolve) => { releaseValidation = resolve })
    let markValidating!: () => void
    const validating = new Promise<void>((resolve) => { markValidating = resolve })
    const listing = remoteService.listKnowledge.bind(remoteService)
    vi.spyOn(remoteService, 'listKnowledge').mockImplementationOnce(async (root, folder) => {
      markValidating()
      await validationGate
      return listing(root, folder)
    })
    try {
      const pairing = {
        baseUrl: `http://127.0.0.1:${address.port}`,
        token: remote.identity.token,
        name: 'Original pairing',
      }
      const registered = await hub.app.inject({
        method: 'POST', url: '/api/computers', payload: pairing,
      })
      expect(registered.statusCode).toBe(201)
      const computerId = registered.json().computer.id as string
      const oldCreation = hub.app.inject({
        method: 'POST', url: '/api/knowledge/roots',
        payload: { computerId, path: '/home/tester/docs', name: 'Old validation' },
      }).then((response) => response)
      await validating
      expect((await hub.app.inject({
        method: 'DELETE', url: `/api/computers/${computerId}`,
      })).statusCode).toBe(204)
      const repaired = await hub.app.inject({
        method: 'POST', url: '/api/computers',
        payload: { ...pairing, name: 'Current pairing' },
      })
      expect(repaired.statusCode).toBe(201)
      expect(repaired.json().computer.id).toBe(computerId)
      const fresh = await hub.app.inject({
        method: 'POST', url: '/api/knowledge/roots',
        payload: { computerId, path: '/home/tester/docs', name: 'Fresh validation' },
      })
      expect(fresh.statusCode).toBe(201)
      releaseValidation()
      const stale = await oldCreation
      expect(stale.statusCode).toBe(409)
      expect(stale.json().error).toContain('pairing changed')
      const roots = (await hub.app.inject({
        method: 'GET', url: '/api/knowledge/roots',
      })).json().roots
      expect(roots).toEqual([fresh.json().root])
      expect(roots[0].computerName).toBe('Current pairing')
    } finally {
      releaseValidation()
      await hub.app.close()
      await remote.app.close()
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

function deferred<T>() {
  let finish: ((value: T) => void) | undefined
  const promise = new Promise<T>((resolve) => { finish = resolve })
  return {
    promise,
    resolve(value: T) {
      if (!finish) throw new Error('Deferred response was not initialized')
      finish(value)
    },
  }
}

async function remoteSnapshotFixture() {
  const directory = await temporaryDirectory('agentic-remote-snapshot')
  const identity = new NodeIdentityStore(directory)
  const registry = new ComputerRegistry(directory)
  await identity.initialize()
  await registry.initialize()
  const computer = {
    id: 'node-1',
    name: 'Workshop',
    baseUrl: 'http://127.0.0.1:1',
    token: 'review-test-token',
  }
  await registry.upsert(computer)
  const manager = new ComputerManager(new FakeSessionService(), identity, registry)
  const client = new RemoteNodeClient(computer)
  manager['clients'].set(computer.id, client)
  const events: HubEvent[] = []
  manager.on('event', (event) => events.push(event))
  const managed = (entry: SessionDetail) => ({
    ...entry, computerId: computer.id, computerName: computer.name,
  })
  return { manager, client, computer, events, managed }
}

function taskSnapshot(running: boolean): BackgroundTaskSnapshot {
  return {
    supported: true,
    runningCount: running ? 1 : 0,
    tasks: [{
      id: 'review-task', type: 'shell', description: 'Build project',
      startedAt: '2026-09-04T00:00:00.000Z',
      status: running ? 'running' : 'completed', canCancel: running,
    }],
  }
}

describe('remote snapshot consistency', () => {
  it('removes an archived cache entry explicitly deleted while the node was disconnected', async () => {
    const { manager, client, computer, managed, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsSessionRetention: true,
    }])
    manager['sessionCache'].set(computer.id, [managed({
      ...session('deleted', 'Previously archived'), isOpen: false, archivedAt: '2026-10-19T06:52:00Z',
    })])
    vi.spyOn(client, 'listSessions').mockResolvedValue([])
    vi.spyOn(client, 'getSession').mockRejectedValue(new RemoteNodeRequestError('Session not found', 404))
    await manager['resyncRemoteComputer'](computer, client)
    expect(events).toContainEqual({ type: 'session.removed', computerId: computer.id, sessionId: 'deleted' })
    expect(manager['sessionCache'].get(computer.id)).toEqual([])
    manager.stop()
  })

  it.each([true, false])('distinguishes archival from deletion on node reconnect, including missed upserts (%s)', async (sawArchive) => {
    const { manager, client, computer, managed, events } = await remoteSnapshotFixture()
    const archived = {
      ...session('kept', 'Retained history'), revision: 2, isOpen: false,
      archivedAt: '2026-10-19T06:52:00Z',
    }
    vi.spyOn(client, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsSessionRetention: true,
    }])
    manager['sessionCache'].set(computer.id, [managed(sawArchive ? archived : { ...archived, revision: 1, isOpen: true, archivedAt: undefined })])
    vi.spyOn(client, 'listSessions').mockResolvedValue([])
    vi.spyOn(client, 'getSession').mockResolvedValue(archived)
    await manager['resyncRemoteComputer'](computer, client)
    expect(events.some((event) => event.type === 'session.removed')).toBe(false)
    expect(events).toContainEqual(expect.objectContaining({
      type: 'session.upserted', session: expect.objectContaining({ isOpen: false, archivedAt: archived.archivedAt }),
    }))
    manager.stop()
  })

  it.each([true, false])('evicts a closed non-archived remote session and never probes it again (cached open: %s)', async (cachedOpen) => {
    const { manager, client, computer, managed, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsSessionRetention: true,
    }])
    const closed = { ...session('closed', 'History only'), revision: 2, isOpen: false }
    manager['sessionCache'].set(computer.id, [managed(cachedOpen ? { ...closed, revision: 1, isOpen: true } : closed)])
    vi.spyOn(client, 'listSessions').mockResolvedValue([])
    vi.spyOn(client, 'listBackgroundTasks').mockResolvedValue(taskSnapshot(false))
    vi.spyOn(client, 'getSession').mockResolvedValue(closed)
    await manager['resyncRemoteComputer'](computer, client)
    expect(events).toContainEqual({ type: 'session.removed', computerId: computer.id, sessionId: 'closed' })
    expect(manager['sessionCache'].get(computer.id)).toEqual([])
    const probes = vi.mocked(client.getSession).mock.calls.length
    expect(probes).toBe(cachedOpen ? 1 : 0)
    for (let read = 0; read < 3; read += 1) {
      expect((await manager.listSessionsWithAuthority()).answeredComputerIds).toContain(computer.id)
    }
    await manager['resyncRemoteComputer'](computer, client)
    expect(client.getSession).toHaveBeenCalledTimes(probes)
    expect(client.listBackgroundTasks).not.toHaveBeenCalled()
    manager.stop()
  })

  it('probes missing retained entries in parallel with a bounded number in flight', async () => {
    const { manager, client, computer, managed } = await remoteSnapshotFixture()
    vi.spyOn(client, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsSessionRetention: true,
    }])
    const archived = (id: string) => ({
      ...session(id, `Archived ${id}`), isOpen: false, archivedAt: '2026-10-19T06:52:00Z',
    })
    const ids = Array.from({ length: 24 }, (_, index) => `archived-${index}`)
    manager['sessionCache'].set(computer.id, ids.map((id) => managed(archived(id))))
    vi.spyOn(client, 'listSessions').mockResolvedValue([])
    let inFlight = 0
    let peak = 0
    vi.spyOn(client, 'getSession').mockImplementation(async (id) => {
      inFlight += 1
      peak = Math.max(peak, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 2))
      inFlight -= 1
      return archived(id)
    })
    await manager.listSessionsWithAuthority()
    expect(client.getSession).toHaveBeenCalledTimes(ids.length)
    expect(peak).toBeGreaterThan(1)
    expect(peak).toBeLessThanOrEqual(8)
    expect(manager['sessionCache'].get(computer.id)?.map((entry) => entry.id).sort()).toEqual([...ids].sort())
    manager.stop()
  })

  it('keeps the previous entry when one retention probe fails without failing the listing', async () => {
    const { manager, client, computer, managed, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsSessionRetention: true,
    }])
    const archived = (id: string) => ({
      ...session(id, `Archived ${id}`), isOpen: false, archivedAt: '2026-10-19T06:52:00Z',
    })
    manager['sessionCache'].set(computer.id, [managed(archived('flaky')), managed(archived('gone')), managed(archived('kept'))])
    vi.spyOn(client, 'listSessions').mockResolvedValue([session('open', 'Live')])
    vi.spyOn(client, 'listBackgroundTasks').mockResolvedValue(taskSnapshot(false))
    vi.spyOn(client, 'getSession').mockImplementation(async (id) => {
      if (id === 'flaky') throw new RemoteNodeRequestError('Bad gateway', 502)
      if (id === 'gone') throw new RemoteNodeRequestError('Session not found', 404)
      return archived(id)
    })
    const listing = await manager.listSessionsWithAuthority()
    expect(listing.answeredComputerIds).toContain(computer.id)
    expect(listing.sessions.map((entry) => entry.id)).toEqual(['open'])
    expect(manager['sessionCache'].get(computer.id)?.map((entry) => entry.id).sort()).toEqual(['flaky', 'kept', 'open'])
    manager['sessionCache'].set(computer.id, [managed(archived('flaky')), managed(archived('gone')), managed(archived('kept'))])
    await manager['resyncRemoteComputer'](computer, client)
    expect(events.filter((event) => event.type === 'session.removed')).toEqual([
      { type: 'session.removed', computerId: computer.id, sessionId: 'gone' },
    ])
    manager.stop()
  })

  it('keeps a cached session that reopened between the roster snapshot and its probe', async () => {
    const { manager, client, computer, managed, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsSessionRetention: true,
    }])
    manager['sessionCache'].set(computer.id, [managed({
      ...session('reopened', 'Reopened'), revision: 2, isOpen: false, archivedAt: '2026-10-19T06:52:00Z',
    })])
    vi.spyOn(client, 'listSessions').mockResolvedValue([])
    vi.spyOn(client, 'listBackgroundTasks').mockResolvedValue(taskSnapshot(false))
    vi.spyOn(client, 'getSession').mockResolvedValue({ ...session('reopened', 'Reopened'), revision: 3, isOpen: true })
    await manager['resyncRemoteComputer'](computer, client)
    expect(events.some((event) => event.type === 'session.removed')).toBe(false)
    expect(events).toContainEqual(expect.objectContaining({
      type: 'session.upserted', session: expect.objectContaining({ id: 'reopened', isOpen: true, revision: 3 }),
    }))
    expect(manager['sessionCache'].get(computer.id)?.map((entry) => entry.id)).toEqual(['reopened'])
    manager.stop()
  })

  it('resyncs roster summaries as transcript-less and reads tasks only for open sessions, bounded', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true,
      supportsSessionRetention: true, supportsBackgroundTasks: true,
    }])
    const open = Array.from({ length: 16 }, (_, index) => session(`open-${index}`, `Open ${index}`))
    const archived = { ...session('archived', 'Archived'), isOpen: false, archivedAt: '2026-10-19T06:52:00Z' }
    vi.spyOn(client, 'listSessions').mockResolvedValue([...open, archived])
    let inFlight = 0
    let peak = 0
    vi.spyOn(client, 'listBackgroundTasks').mockImplementation(async () => {
      inFlight += 1
      peak = Math.max(peak, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 2))
      inFlight -= 1
      return taskSnapshot(false)
    })
    await manager['resyncRemoteComputer'](computer, client)
    const upserted = events.filter((event) => event.type === 'session.upserted')
    expect(upserted).toHaveLength(open.length + 1)
    for (const event of upserted) expect(event).toMatchObject({ summary: true })
    expect(vi.mocked(client.listBackgroundTasks).mock.calls.map(([id]) => id).sort())
      .toEqual(open.map((entry) => entry.id).sort())
    expect(peak).toBeLessThanOrEqual(8)
    manager.stop()
  })

  it('does not resurrect an archived record from an in-flight or offline roster snapshot', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    const response = deferred<SessionDetail[]>()
    vi.spyOn(client, 'listSessions').mockReturnValue(response.promise)
    const listing = manager.listSessionsWithAuthority()
    await vi.waitFor(() => expect(client.listSessions).toHaveBeenCalledOnce())
    manager['emitNodeEvent'](computer, {
      type: 'session.upserted',
      session: { ...session('kept', 'Retained history'), revision: 2, isOpen: false, archivedAt: '2026-10-19T06:52:00Z' },
    })
    response.resolve([{ ...session('kept', 'Old active roster'), revision: 1, isOpen: true }])
    expect((await listing).sessions).toEqual([])
    vi.mocked(client.listSessions).mockRejectedValue(new Error('Offline'))
    expect((await manager.listSessionsWithAuthority()).sessions).toEqual([])
    expect(events).toEqual([expect.objectContaining({
      type: 'session.upserted', session: expect.objectContaining({ isOpen: false }),
    })])
    expect(manager['sessionCache'].get(computer.id)?.[0]).toMatchObject({ id: 'kept', isOpen: false })
    manager.stop()
  })

  it('reconciles live session events received while a listing is in flight', async () => {
    const { manager, client, computer, managed } = await remoteSnapshotFixture()
    const response = deferred<SessionDetail[]>()
    vi.spyOn(client, 'listSessions').mockReturnValue(response.promise)
    const listing = manager.listSessionsWithAuthority()
    await vi.waitFor(() => expect(client.listSessions).toHaveBeenCalledOnce())
    manager['emitNodeEvent'](computer, {
      type: 'session.upserted', session: session('kept', 'New title'),
    })
    manager['emitNodeEvent'](computer, {
      type: 'session.upserted', session: session('added', 'Created during read'),
    })
    manager['emitNodeEvent'](computer, { type: 'session.removed', sessionId: 'deleted' })
    response.resolve([session('kept', 'Old title'), session('deleted', 'Deleted')])

    const result = await listing
    expect(result.sessions).toEqual(expect.arrayContaining([
      managed(session('kept', 'New title')),
      managed(session('added', 'Created during read')),
    ]))
    expect(result.sessions.some((entry) => entry.id === 'deleted')).toBe(false)
    expect(result.answeredComputerIds).toContain(computer.id)
    manager.stop()
  })

  it('coalesces overlapping reconnect and browser session reads', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    const response = deferred<SessionDetail[]>()
    vi.spyOn(client, 'listSessions').mockReturnValue(response.promise)
    const first = manager['resyncRemoteComputer'](computer, client)
    const second = manager['resyncRemoteComputer'](computer, client)
    const listing = manager.listSessionsWithAuthority()
    response.resolve([session('kept', 'Current')])
    await Promise.all([first, second, listing])

    expect(client.listSessions).toHaveBeenCalledOnce()
    expect(events.filter((event) => event.type === 'session.upserted'))
      .toHaveLength(1)
    manager.stop()
  })

  it('keeps a snapshot revision newer than an event observed during its read', async () => {
    const { manager, client, computer } = await remoteSnapshotFixture()
    const response = deferred<SessionDetail[]>()
    vi.spyOn(client, 'listSessions').mockReturnValue(response.promise)
    const listing = manager.listSessionsWithAuthority()
    await vi.waitFor(() => expect(client.listSessions).toHaveBeenCalledOnce())
    manager['emitNodeEvent'](computer, {
      type: 'session.upserted',
      session: { ...session('kept', 'Revision two'), revision: 2 },
    })
    response.resolve([{ ...session('kept', 'Revision three'), revision: 3 }])
    expect((await listing).sessions).toEqual([
      expect.objectContaining({ id: 'kept', title: 'Revision three', revision: 3 }),
    ])
    manager.stop()
  })

  it('does not recreate an unpaired computer from a late listing', async () => {
    const { manager, client, computer } = await remoteSnapshotFixture()
    const response = deferred<SessionDetail[]>()
    vi.spyOn(client, 'listSessions').mockReturnValue(response.promise)
    const listing = manager.listSessionsWithAuthority()
    await vi.waitFor(() => expect(client.listSessions).toHaveBeenCalledOnce())
    await manager.removeComputer(computer.id)
    response.resolve([session('removed-node-session', 'No longer paired')])

    const result = await listing
    expect(result.sessions).toEqual([])
    expect(result.answeredComputerIds).not.toContain(computer.id)
    expect(manager['sessionCache'].has(computer.id)).toBe(false)
  })

  it('ignores an older event arriving after a newer snapshot revision', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'listSessions').mockResolvedValue([
      { ...session('kept', 'Revision three'), revision: 3 },
    ])
    await manager.listSessionsWithAuthority()
    manager['emitNodeEvent'](computer, {
      type: 'session.upserted',
      session: { ...session('kept', 'Revision two'), revision: 2 },
    })
    expect(manager['sessionCache'].get(computer.id)?.[0])
      .toMatchObject({ title: 'Revision three', revision: 3 })
    expect(events).toEqual([])
    manager.stop()
  })

  it('does not accept a listing from a replaced node client', async () => {
    const { manager, client, computer, managed } = await remoteSnapshotFixture()
    const response = deferred<SessionDetail[]>()
    vi.spyOn(client, 'listSessions').mockReturnValue(response.promise)
    const listing = manager.listSessionsWithAuthority()
    await vi.waitFor(() => expect(client.listSessions).toHaveBeenCalledOnce())
    manager['clients'].set(computer.id, new RemoteNodeClient(computer))
    manager['sessionCache'].set(computer.id, [managed(session('fresh', 'New client'))])
    response.resolve([session('old', 'Old client')])

    const result = await listing
    expect(result.sessions.map((entry) => entry.id)).toEqual(['fresh'])
    expect(result.answeredComputerIds).not.toContain(computer.id)
    manager.stop()
  })

  it('keeps a live task event newer than a reconnect task read', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'listSessions').mockResolvedValue([session('kept', 'Current')])
    vi.spyOn(client, 'providers', 'get').mockReturnValue(new FakeSessionService().providers())
    const response = deferred<BackgroundTaskSnapshot>()
    vi.spyOn(client, 'listBackgroundTasks').mockReturnValue(response.promise)
    const sync = manager['resyncRemoteComputer'](computer, client)
    await vi.waitFor(() => expect(client.listBackgroundTasks).toHaveBeenCalledOnce())
    manager['emitNodeEvent'](computer, {
      type: 'session.tasks.updated', sessionId: 'kept', ...taskSnapshot(false),
    })
    response.resolve(taskSnapshot(true))
    await sync

    const updates = events.filter((event) => event.type === 'session.tasks.updated')
    expect(updates).toHaveLength(1)
    expect(updates[0]).toMatchObject({ runningCount: 0 })
    manager.stop()
  })

  it('does not publish tasks from a superseded reconnect', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'listSessions').mockResolvedValue([session('kept', 'Current')])
    vi.spyOn(client, 'providers', 'get').mockReturnValue(new FakeSessionService().providers())
    const oldTasks = deferred<BackgroundTaskSnapshot>()
    vi.spyOn(client, 'listBackgroundTasks')
      .mockReturnValueOnce(oldTasks.promise)
      .mockResolvedValueOnce(taskSnapshot(false))
    const first = manager['resyncRemoteComputer'](computer, client)
    await vi.waitFor(() => expect(client.listBackgroundTasks).toHaveBeenCalledOnce())
    await manager['resyncRemoteComputer'](computer, client)
    oldTasks.resolve(taskSnapshot(true))
    await first

    const updates = events.filter((event) => event.type === 'session.tasks.updated')
    expect(updates).toHaveLength(1)
    expect(updates[0]).toMatchObject({ runningCount: 0 })
    manager.stop()
  })

  it('keeps offline fallback non-authoritative after a failed shared read', async () => {
    const { manager, client, computer, managed } = await remoteSnapshotFixture()
    const cached = managed(session('kept', 'Last known'))
    manager['sessionCache'].set(computer.id, [cached])
    vi.spyOn(client, 'listSessions').mockRejectedValue(new Error('Connection refused'))
    const result = await manager.listSessionsWithAuthority()
    expect(result.sessions).toEqual([cached])
    expect(result.answeredComputerIds).not.toContain(computer.id)
    manager.stop()
  })

  it('does not overwrite an explicit task refresh with an older reconnect read', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'listSessions').mockResolvedValue([session('kept', 'Current')])
    vi.spyOn(client, 'providers', 'get').mockReturnValue(new FakeSessionService().providers())
    const oldTasks = deferred<BackgroundTaskSnapshot>()
    vi.spyOn(client, 'listBackgroundTasks')
      .mockReturnValueOnce(oldTasks.promise)
      .mockResolvedValueOnce(taskSnapshot(false))
    const sync = manager['resyncRemoteComputer'](computer, client)
    await vi.waitFor(() => expect(client.listBackgroundTasks).toHaveBeenCalledOnce())
    expect(await manager.listBackgroundTasks(computer.id, 'kept'))
      .toEqual(taskSnapshot(false))
    oldTasks.resolve(taskSnapshot(true))
    await sync
    expect(events.filter((event) => event.type === 'session.tasks.updated'))
      .toEqual([])
    manager.stop()
  })

  it('does not emit tasks for a session removed during the reconnect read', async () => {
    const { manager, client, computer, events } = await remoteSnapshotFixture()
    vi.spyOn(client, 'listSessions').mockResolvedValue([session('kept', 'Current')])
    vi.spyOn(client, 'providers', 'get').mockReturnValue(new FakeSessionService().providers())
    const oldTasks = deferred<BackgroundTaskSnapshot>()
    vi.spyOn(client, 'listBackgroundTasks').mockReturnValue(oldTasks.promise)
    const sync = manager['resyncRemoteComputer'](computer, client)
    await vi.waitFor(() => expect(client.listBackgroundTasks).toHaveBeenCalledOnce())
    manager['emitNodeEvent'](computer, { type: 'session.removed', sessionId: 'kept' })
    oldTasks.resolve(taskSnapshot(true))
    await sync
    expect(events.filter((event) => event.type === 'session.tasks.updated'))
      .toEqual([])
    manager.stop()
  })
})

describe('queued dispatch routing', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  async function routingFixture(capability = true) {
    const queued = {
      ...session('queued-session', 'Queued'),
      queuedPrompts: ['first', 'middle/id', 'last'].map((id) => ({
        id, content: `original ${id}`, createdAt: '2026-09-05T00:00:00.000Z',
      })),
      queuedCount: 3,
    }
    const remoteService = new FakeSessionService(queued)
    const localService = new FakeSessionService(queued)
    if (!capability) {
      for (const service of [remoteService, localService]) {
        const providers = service.providers().map((provider) => ({
          ...provider, supportsQueuedPromptDispatch: false,
        }))
        vi.spyOn(service, 'providers').mockReturnValue(providers)
      }
    }
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('queued-routing-node'),
      logger: false, role: 'node', service: remoteService,
    })
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('queued-routing-hub'),
      logger: false, role: 'hub', service: localService,
    })
    const close = async () => {
      await hub.app.close()
      await remote.app.close()
    }
    try {
      await remote.app.listen({ host: '127.0.0.1', port: 0 })
      const address = remote.app.server.address() as AddressInfo
      const registered = await hub.app.inject({
        method: 'POST', url: '/api/computers',
        payload: {
          baseUrl: `http://127.0.0.1:${address.port}`,
          token: remote.identity.token,
          name: 'Queue worker',
        },
      })
      expect(registered.statusCode).toBe(201)
      await vi.waitFor(async () => {
        const computers = (await hub.app.inject({ method: 'GET', url: '/api/computers' })).json().computers
        const computer = computers.find((entry: { id: string }) => entry.id === registered.json().computer.id)
        expect(computer.providers?.[0]?.supportsQueuedPromptDispatch).toBe(capability)
      })
      return {
        hub, remote, remoteService, localService, close,
        remoteComputerId: registered.json().computer.id as string,
        original: queued,
      }
    } catch (error) {
      await close()
      throw error
    }
  }

  it('routes typed outcomes and exact rewritten content through the authenticated hub-to-node chain', async () => {
    const { hub, remote, remoteService, localService, remoteComputerId, original, close } = await routingFixture()
    const dispatch = vi.spyOn(remoteService, 'dispatchQueuedPrompt')
    const localDispatch = vi.spyOn(localService, 'dispatchQueuedPrompt')
    const content = '  exact rewrite\n    preserve indentation\n'
    try {
      const computers = (await hub.app.inject({ method: 'GET', url: '/api/computers' })).json().computers
      expect(computers.find((computer: { id: string }) => computer.id === remoteComputerId).providers)
        .toEqual(expect.arrayContaining([expect.objectContaining({ supportsQueuedPromptDispatch: true })]))
      const unauthorized = await remote.app.inject({
        method: 'POST', url: '/node-api/sessions/queued-session/queue/middle%2Fid/dispatch',
        payload: { content },
      })
      expect(unauthorized.statusCode).toBe(401)
      expect(dispatch).not.toHaveBeenCalled()
      for (const outcome of ['sent', 'refused', 'uncertain'] as const) {
        const attemptId = randomUUID()
        dispatch.mockResolvedValueOnce({
          outcome, promptId: 'middle/id', attemptId, session: original,
          ...(outcome === 'refused' ? { restored: false } : {}),
          ...(outcome === 'uncertain' ? { delivery: 'unknown' as const } : {}),
        })
        const response = await hub.app.inject({
          method: 'POST',
          url: `/api/computers/${remoteComputerId}/sessions/queued-session/queue/middle%2Fid/dispatch`,
          payload: { content },
        })
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchObject({
          outcome, promptId: 'middle/id', attemptId,
          session: { ...original, computerId: remoteComputerId },
          ...(outcome === 'refused' ? { restored: false } : {}),
          ...(outcome === 'uncertain' ? { delivery: 'unknown' } : {}),
        })
        expect(dispatch).toHaveBeenLastCalledWith('queued-session', 'middle/id', content)
      }
      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(localDispatch).not.toHaveBeenCalled()
    } finally {
      await close()
    }
  })

  it('rejects blank/oversized rewrites at both route boundaries without changing raw valid text', async () => {
    const { hub, remote, remoteService, remoteComputerId, close } = await routingFixture()
    const dispatch = vi.spyOn(remoteService, 'dispatchQueuedPrompt')
    try {
      for (const content of [' \n\t ', 'a'.repeat(200_001)]) {
        const hubResponse = await hub.app.inject({
          method: 'POST',
          url: `/api/computers/${remoteComputerId}/sessions/queued-session/queue/middle%2Fid/dispatch`,
          payload: { content },
        })
        expect(hubResponse.statusCode).toBe(400)
        const nodeResponse = await remote.app.inject({
          method: 'POST', url: '/node-api/sessions/queued-session/queue/middle%2Fid/dispatch',
          headers: { authorization: `Bearer ${remote.identity.token}` }, payload: { content },
        })
        expect(nodeResponse.statusCode).toBe(400)
      }
      expect(dispatch).not.toHaveBeenCalled()
    } finally {
      await close()
    }
  })

  it('requires the advertised capability for local, remote, and direct-node dispatch', async () => {
    const { hub, remote, remoteService, localService, remoteComputerId, close } = await routingFixture(false)
    const local = vi.spyOn(localService, 'dispatchQueuedPrompt')
    const remoteDispatch = vi.spyOn(remoteService, 'dispatchQueuedPrompt')
    try {
      for (const computerId of [hub.identity.info.id, remoteComputerId]) {
        const response = await hub.app.inject({
          method: 'POST',
          url: `/api/computers/${computerId}/sessions/queued-session/queue/middle%2Fid/dispatch`,
          payload: { content: 'rewrite' },
        })
        expect(response.statusCode).toBe(409)
      }
      const direct = await remote.app.inject({
        method: 'POST', url: '/node-api/sessions/queued-session/queue/middle%2Fid/dispatch',
        headers: { authorization: `Bearer ${remote.identity.token}` }, payload: { content: 'rewrite' },
      })
      expect(direct.statusCode).toBe(409)
      expect(local).not.toHaveBeenCalled()
      expect(remoteDispatch).not.toHaveBeenCalled()
    } finally {
      await close()
    }
  })

  it('forwards exact dispatch-discard acknowledgement without sending or cancelling work', async () => {
    const { hub, remote, remoteService, remoteComputerId, original, close } = await routingFixture()
    const attemptId = randomUUID()
    const remove = vi.spyOn(remoteService, 'removeQueuedPrompt')
    const dispatch = vi.spyOn(remoteService, 'dispatchQueuedPrompt')
    const cancel = vi.spyOn(remoteService, 'cancel')
    remove.mockImplementation(async (_sessionId, promptId, acknowledgement) => {
      if (acknowledgement !== attemptId) {
        throw Object.assign(new Error('Fresh dispatch acknowledgement required'), { statusCode: 409 })
      }
      return {
        session: { ...original, queuedPrompts: original.queuedPrompts.filter((prompt) => prompt.id !== promptId) },
        prompt: original.queuedPrompts.find((prompt) => prompt.id === promptId)!,
      }
    })
    try {
      const url = `/api/computers/${remoteComputerId}/sessions/queued-session/queue/middle%2Fid`
      const invalid = await hub.app.inject({
        method: 'DELETE', url, payload: { acknowledgesDispatch: 'not-a-uuid' },
      })
      expect(invalid.statusCode).toBe(400)
      expect(remove).not.toHaveBeenCalled()
      const wrong = await hub.app.inject({
        method: 'DELETE', url, payload: { acknowledgesDispatch: randomUUID() },
      })
      expect(wrong.statusCode).toBe(409)
      const unauthorized = await remote.app.inject({
        method: 'DELETE', url: '/node-api/sessions/queued-session/queue/middle%2Fid',
        payload: { acknowledgesDispatch: attemptId },
      })
      expect(unauthorized.statusCode).toBe(401)
      const response = await hub.app.inject({
        method: 'DELETE', url, payload: { acknowledgesDispatch: attemptId },
      })
      expect(response.statusCode).toBe(200)
      expect(remove).toHaveBeenLastCalledWith('queued-session', 'middle/id', attemptId)
      expect(response.json()).toMatchObject({
        prompt: original.queuedPrompts[1],
        session: { computerId: remoteComputerId },
      })
      expect(dispatch).not.toHaveBeenCalled()
      expect(cancel).not.toHaveBeenCalled()
    } finally {
      await close()
    }
  })

  it('returns typed uncertainty for an owning-node server failure but preserves preflight conflicts', async () => {
    const { hub, remoteService, remoteComputerId, close } = await routingFixture()
    const dispatch = vi.spyOn(remoteService, 'dispatchQueuedPrompt')
    try {
      dispatch.mockRejectedValueOnce(new Error('Provider connection failed'))
      const uncertain = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/queued-session/queue/middle%2Fid/dispatch`,
        payload: { content: 'rewrite' },
      })
      expect(uncertain.statusCode).toBe(200)
      expect(uncertain.json()).toMatchObject({ outcome: 'uncertain', delivery: 'unknown', promptId: 'middle/id' })
      dispatch.mockRejectedValueOnce(Object.assign(new Error('Session is not idle'), { statusCode: 409 }))
      const refused = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/queued-session/queue/middle%2Fid/dispatch`,
        payload: { content: 'rewrite' },
      })
      expect(refused.statusCode).toBe(409)
      expect(dispatch).toHaveBeenCalledTimes(2)
    } finally {
      await close()
    }
  })

  it.each(['transport', 'bad JSON', 'wrong target', 'wrong session', 'missing receipt'])(
    'conservatively rejects a remote %s response without a transport retry', async (failure) => {
      const client = new RemoteNodeClient({
        id: 'node', name: 'Fake node', baseUrl: 'http://127.0.0.1:1', token: 'test-only-token',
      })
      const fetch = vi.spyOn(globalThis, 'fetch')
      if (failure === 'transport') fetch.mockRejectedValueOnce(new Error('Transport timeout'))
      else if (failure === 'bad JSON') fetch.mockResolvedValueOnce(new Response('invalid JSON'))
      else fetch.mockResolvedValueOnce(Response.json({
        outcome: 'sent', promptId: failure === 'wrong target' ? 'other' : 'middle',
        ...(failure !== 'missing receipt' ? { attemptId: randomUUID() } : {}),
        ...(failure === 'wrong session' ? { session: session('other-session', 'Wrong owner') } : {}),
      }))
      try {
        expect(await client.dispatchQueuedPrompt('session', 'middle', 'rewrite'))
          .toMatchObject({ outcome: 'uncertain', delivery: 'unknown', promptId: 'middle' })
        expect(fetch).toHaveBeenCalledTimes(1)
      } finally {
        fetch.mockRestore()
        client.stop()
      }
    },
  )

  it.each([408, 418, 499, 500, 502, 503])(
    'keeps non-admission HTTP %s unconfirmed rather than reporting a definitive refusal', async (status) => {
      const client = new RemoteNodeClient({
        id: 'node', name: 'Fake node', baseUrl: 'http://127.0.0.1:1', token: 'test-only-token',
      })
      const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        Response.json({ error: 'No confirmed dispatch outcome' }, { status }),
      )
      try {
        expect(await client.dispatchQueuedPrompt('session', 'middle', 'rewrite'))
          .toMatchObject({ outcome: 'uncertain', delivery: 'unknown', promptId: 'middle' })
        expect(fetch).toHaveBeenCalledTimes(1)
      } finally {
        fetch.mockRestore()
        client.stop()
      }
    },
  )

  it.each([400, 401, 403, 404, 405, 409, 410, 413, 415, 422, 429])(
    'preserves explicit HTTP %s admission refusal without retrying', async (status) => {
      const client = new RemoteNodeClient({
        id: 'node', name: 'Fake node', baseUrl: 'http://127.0.0.1:1', token: 'test-only-token',
      })
      const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        Response.json({ error: 'Dispatch was not admitted' }, { status }),
      )
      try {
        await expect(client.dispatchQueuedPrompt('session', 'middle', 'rewrite'))
          .rejects.toMatchObject({ statusCode: status })
        expect(fetch).toHaveBeenCalledTimes(1)
      } finally {
        fetch.mockRestore()
        client.stop()
      }
    },
  )
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
    const client = new RemoteNodeClient(computer)
    vi.spyOn(client, 'listSessions').mockResolvedValue([session('kept-session', 'Kept')])
    manager['clients'].set(computer.id, client)
    await manager['resyncRemoteComputer'](computer, client)

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

describe('deployed app version', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('keeps non-static startup independent of build metadata', async () => {
    const directory = await temporaryDirectory('app-version-development')
    vi.stubEnv('AGENTIC_REMOTE_RELEASE_DIR', path.join(directory, 'not-built'))
    const hub = await buildApp({
      dataDirectory: directory,
      logger: false,
      serveStatic: false,
      service: new FakeSessionService(),
    })
    try {
      const response = await hub.app.inject('/api/version')
      expect(response.statusCode).toBe(200)
      expect(response.headers['cache-control']).toBe('no-store')
      expect(response.json()).toEqual({ version: hub.identity.info.version })
    } finally {
      await hub.app.close()
    }
  })

  it('does not require a UI build on a node', async () => {
    const directory = await temporaryDirectory('app-version-node')
    vi.stubEnv('AGENTIC_REMOTE_RELEASE_DIR', path.join(directory, 'not-built'))
    const node = await buildApp({
      dataDirectory: directory,
      logger: false,
      role: 'node',
      serveStatic: true,
      service: new FakeSessionService(),
    })
    try {
      expect((await node.app.inject('/health')).statusCode).toBe(200)
      expect((await node.app.inject('/api/version')).statusCode).toBe(404)
    } finally {
      await node.app.close()
    }
  })

  it('returns 404 for legacy Apple-touch probes instead of SPA HTML', async () => {
    const directory = await temporaryDirectory('app-icon-probes')
    const release = path.join(directory, 'release')
    await mkdir(release)
    await writeFile(path.join(release, 'index.html'), 'application shell')
    await writeFile(path.join(release, 'build-info.json'), JSON.stringify({
      version: '91.0.0',
      buildId: 'icon-probe-build',
    }))
    vi.stubEnv('AGENTIC_REMOTE_RELEASE_DIR', release)
    const hub = await buildApp({
      dataDirectory: path.join(directory, 'data'),
      logger: false,
      serveStatic: true,
      service: new FakeSessionService(),
    })
    try {
      for (const url of [
        '/apple-touch-icon.png',
        '/apple-touch-icon-precomposed.png',
        '/apple-touch-icon-120x120.png',
        '/apple-touch-icon-180x180-precomposed.png?cache=old',
        '/icons/apple-touch-icon-152x152.png',
      ]) {
        const response = await hub.app.inject(url)
        expect(response.statusCode).toBe(404)
        expect(response.json()).toEqual({ error: 'Not found' })
      }
      const clientRoute = await hub.app.inject('/sessions/example')
      expect(clientRoute.statusCode).toBe(200)
      expect(clientRoute.body).toBe('application shell')
    } finally {
      await hub.app.close()
    }
  })

  it('pins the configured static build and restores its original identity on rollback', async () => {
    const directory = await temporaryDirectory('app-version-releases')
    const releaseA = path.join(directory, 'release-a')
    const releaseB = path.join(directory, 'release-b')
    const current = path.join(directory, 'current')
    // The static release's version, not this server source's package, is served.
    const versionA = { version: '91.0.0', buildId: 'build-a' }
    const versionB = { version: '91.0.0', buildId: 'build-b' }
    for (const [release, version] of [[releaseA, versionA], [releaseB, versionB]] as const) {
      await mkdir(release)
      await writeFile(path.join(release, 'index.html'), version.buildId)
      await writeFile(path.join(release, 'build-info.json'), JSON.stringify(version))
    }
    vi.stubEnv('AGENTIC_REMOTE_RELEASE_DIR', current)
    const apps: Awaited<ReturnType<typeof buildApp>>[] = []
    const start = async () => {
      const hub = await buildApp({
        dataDirectory: path.join(directory, `data-${apps.length}`),
        logger: false,
        serveStatic: true,
        service: new FakeSessionService(),
      })
      apps.push(hub)
      return hub.app
    }
    const assertRelease = async (
      app: Awaited<ReturnType<typeof start>>,
      version: typeof versionA,
    ) => {
      const response = await app.inject('/api/version')
      expect(response.statusCode).toBe(200)
      expect(response.headers['cache-control']).toBe('no-store')
      expect(response.json()).toEqual(version)
      expect((await app.inject('/')).body).toBe(version.buildId)
    }
    try {
      await symlink(releaseA, current)
      const appA = await start()
      await assertRelease(appA, versionA)

      await unlink(current)
      await symlink(releaseB, current)
      const appB = await start()
      await assertRelease(appB, versionB)
      await assertRelease(appA, versionA)

      await unlink(current)
      await symlink(releaseA, current)
      await assertRelease(await start(), versionA)
      await assertRelease(appB, versionB)
    } finally {
      await Promise.all(apps.map(({ app }) => app.close()))
    }
  })

  it('loads metadata only at startup, not during version requests', async () => {
    const directory = await temporaryDirectory('app-version-startup')
    const version = { version: '91.0.0', buildId: 'immutable-build' }
    const metadata = path.join(directory, 'build-info.json')
    await writeFile(metadata, JSON.stringify(version))
    vi.stubEnv('AGENTIC_REMOTE_RELEASE_DIR', directory)
    const hub = await buildApp({
      dataDirectory: path.join(directory, 'data'),
      logger: false,
      serveStatic: true,
      service: new FakeSessionService(),
    })
    try {
      await unlink(metadata)
      expect((await hub.app.inject('/api/version')).json()).toEqual(version)
      expect((await hub.app.inject('/api/version')).json()).toEqual(version)
    } finally {
      await hub.app.close()
    }
  })

  it.each([
    undefined,
    '{',
    '{}',
    '{"version":"91.0.0"}',
    '{"version":"91.0.0","buildId":""}',
    '{"version":"91.0.0","buildId":"/private/path"}',
  ])('refuses missing or invalid production metadata: %s', async (metadata) => {
    const directory = await temporaryDirectory('app-version-invalid')
    if (metadata !== undefined) {
      await writeFile(path.join(directory, 'build-info.json'), metadata)
    }
    vi.stubEnv('AGENTIC_REMOTE_RELEASE_DIR', directory)
    await expect(buildApp({
      dataDirectory: path.join(directory, 'data'),
      logger: false,
      serveStatic: true,
      service: new FakeSessionService(),
    })).rejects.toThrow()
  })
})
