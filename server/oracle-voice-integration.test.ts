import { EventEmitter } from 'node:events'
import { mkdir, readdir, readFile, rm } from 'node:fs/promises'
import http from 'node:http'
import type { AddressInfo, Socket } from 'node:net'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  voiceAudioFrameByteLength,
  type VoiceAudioFrame,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import type { ComputerSummary, ManagedSession } from '../shared/contracts.js'
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSubmissionOptions,
  ManagerSnapshot,
} from '../shared/manager.js'
import { buildApp } from './app.js'
import {
  ManagerAgent,
  type ManagerHub,
  type ManagerSdkClient,
  type ManagerSdkEvent,
  type ManagerSdkSession,
  type ManagerSdkSessionConfig,
} from './manager-agent.js'
import { JournalRecorder } from './manager-journal.js'
import { ManagerStore } from './manager-store.js'
import {
  FakeVoiceEngine,
  FakeVoiceEngineFactory,
  type FakeVoiceEngineCall,
  type VoiceEngineEvent,
} from './oracle-voice-engine.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import {
  DEFAULT_VOICE_BACKEND_LIMITS,
  LocalVoiceBackend,
  type VoiceBackendSessionLimits,
} from './oracle-voice-session.js'
import type { SessionService } from './session-service.js'

const trusted = {
  host: 'hub.test',
  origin: 'https://hub.test',
}

const defaults: ManagerClientDefaults = {
  computerId: 'hub',
  mode: 'autopilot',
  provider: 'copilot',
  model: 'gpt-6-sol',
  reasoningEffort: 'high',
  folders: { hub: '/home/tester/src' },
}

const config: EnabledOracleVoiceConfig = {
  enabled: true,
  language: 'en',
  threads: 2,
  endpointMs: 800,
  stt: {
    profile: 'zipformer',
    modelDirectory: '/not-used/test-stt',
  },
  tts: {
    binary: '/not-used/test-piper',
    model: '/not-used/test-voice.onnx',
    config: '/not-used/test-voice.json',
    sampleRate: 22_050,
  },
}

const roots: string[] = []
const sockets = new Set<WebSocket>()
const apps: Array<Awaited<ReturnType<typeof buildApp>>['app']> = []

class TestSessionService extends EventEmitter {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)

  providers() {
    return []
  }

  listSessions() {
    return []
  }

  listHistory() {
    return []
  }
}

class StoredManager extends EventEmitter<{ event: [event: ManagerEvent] }> {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)
  readonly cancel = vi.fn<() => Promise<void>>(async () => undefined)
  readonly cancelMessage = vi.fn(async (messageId: string): Promise<ManagerMessage> => {
    const message = this.store.message(messageId)
    if (!message || message.role !== 'user') throw new Error('Message not found')
    if (['done', 'failed', 'cancelled', 'interrupted'].includes(message.state ?? '')) {
      return message
    }
    const cancelled = { ...message, state: 'cancelled' as const }
    await this.store.upsertMessage(cancelled)
    this.emit('event', { type: 'manager.message', message: cancelled })
    return cancelled
  })
  readonly send = vi.fn(this.sendMessage.bind(this))
  readonly submitted: ManagerMessage[] = []
  failSend: Error | undefined

  constructor(readonly store: ManagerStore) {
    super()
  }

  snapshot(): ManagerSnapshot {
    return {
      available: true,
      status: 'idle',
      messages: this.store.messages(),
      queued: 0,
      managedSessions: [],
    }
  }

  hiddenSessionIds(): string[] {
    return []
  }

  async emitAssistant(message: ManagerMessage): Promise<void> {
    await this.store.upsertMessage(message)
    this.emit('event', { type: 'manager.message', message })
  }

  emitDelta(messageId: string, content: string): void {
    this.emit('event', { type: 'manager.delta', messageId, content })
  }

  emitStatus(status: ManagerSnapshot['status']): void {
    this.emit('event', { type: 'manager.status', status, queued: 0 })
  }

  private async sendMessage(
    content: string,
    _defaults?: ManagerClientDefaults,
    options?: ManagerSubmissionOptions,
  ): Promise<ManagerMessage> {
    if (this.failSend) throw this.failSend
    const message: ManagerMessage = {
      id: `voice-user-${this.send.mock.calls.length}`,
      role: 'user',
      content,
      createdAt: '2026-10-18T00:00:00.000Z',
      state: 'running',
      ...(options?.answerOnly ? { answerOnly: true } : {}),
      ...(options?.source ? { source: options.source } : {}),
    }
    await this.store.upsertMessage(message)
    this.submitted.push(message)
    this.emit('event', { type: 'manager.message', message })
    return message
  }

  readonly retry = vi.fn(async () => {
    throw new Error('not used')
  })
  readonly removeQueued = vi.fn(async () => {
    throw new Error('not used')
  })
  readonly editQueued = vi.fn(async () => {
    throw new Error('not used')
  })
  readonly updateSettings = vi.fn(async () => ({}))
  readonly resolveConfirmation = vi.fn(async () => {
    throw new Error('not used')
  })
  readonly reset = vi.fn(async () => undefined)
}

class DeterministicManagerSession implements ManagerSdkSession {
  readonly prompts: string[] = []
  readonly abort = vi.fn(async () => {
    this.emit({ type: 'session.idle' })
  })
  readonly disconnect = vi.fn(async () => undefined)
  readonly rpc = {
    model: {
      switchTo: vi.fn(async () => undefined),
    },
  }
  readonly disconnected = false
  private readonly handlers = new Set<(event: ManagerSdkEvent) => void>()

  constructor(
    readonly sessionId: string,
    readonly config: Omit<ManagerSdkSessionConfig, 'sessionId'>,
  ) {}

  on(handler: (event: ManagerSdkEvent) => void): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  emit(event: ManagerSdkEvent): void {
    for (const handler of [...this.handlers]) handler(event)
  }

  async send({ prompt }: { prompt: string }): Promise<string> {
    this.prompts.push(prompt)
    return 'deterministic-manager-accepted'
  }
}

class DeterministicManagerClient implements ManagerSdkClient {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => [])
  readonly deleteSession = vi.fn(async () => undefined)
  readonly sessions: DeterministicManagerSession[] = []
  readonly createSession = vi.fn(async (config: ManagerSdkSessionConfig) => {
    const session = new DeterministicManagerSession(
      config.sessionId ?? `manager-sdk-${this.sessions.length + 1}`,
      config,
    )
    this.sessions.push(session)
    return session
  })
  readonly resumeSession = vi.fn(async (
    sessionId: string,
    config: Omit<ManagerSdkSessionConfig, 'sessionId'>,
  ) => {
    const session = new DeterministicManagerSession(sessionId, config)
    this.sessions.push(session)
    return session
  })
  readonly rpc = {
    skills: {
      discover: vi.fn(async () => ({ skills: [] })),
    },
  }
}

interface SocketMessage {
  control?: VoiceServerControl | ManagerEvent
  audio?: VoiceAudioFrame
}

class SocketInbox {
  readonly messages: SocketMessage[] = []
  private readonly waiters = new Set<() => void>()

  constructor(readonly socket: WebSocket, decodeAudio = true) {
    socket.on('message', (data, isBinary) => {
      if (isBinary && decodeAudio) {
        const buffer = rawBuffer(data)
        this.messages.push({
          audio: decodeVoiceAudioFrame(
            buffer.buffer.slice(
              buffer.byteOffset,
              buffer.byteOffset + buffer.byteLength,
            ) as ArrayBuffer,
          ),
        })
      } else {
        this.messages.push({
          control: JSON.parse(rawBuffer(data).toString('utf8')) as
            VoiceServerControl | ManagerEvent,
        })
      }
      for (const wake of this.waiters) wake()
    })
  }

  controls<T extends VoiceServerControl | ManagerEvent>(
    predicate?: (control: T) => boolean,
  ): T[] {
    const controls = this.messages
      .flatMap((message) => message.control ? [message.control as T] : [])
    return predicate ? controls.filter(predicate) : controls
  }

  audio(): VoiceAudioFrame[] {
    return this.messages.flatMap((message) => message.audio ? [message.audio] : [])
  }

  async waitForControl<T extends VoiceServerControl | ManagerEvent>(
    predicate: (control: T) => boolean,
  ): Promise<T> {
    return this.waitFor(() => this.controls<T>().find(predicate))
  }

  async waitForAudio(
    predicate: (audio: VoiceAudioFrame) => boolean,
  ): Promise<VoiceAudioFrame> {
    return this.waitFor(() => this.audio().find(predicate))
  }

  private async waitFor<T>(read: () => T | undefined): Promise<T> {
    const current = read()
    if (current !== undefined) return current
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters.delete(check)
        reject(new Error('Timed out waiting for WebSocket evidence'))
      }, 5_000)
      const check = () => {
        const value = read()
        if (value === undefined) return
        clearTimeout(timer)
        this.waiters.delete(check)
        resolve(value)
      }
      this.waiters.add(check)
    })
  }
}

interface BrowserCaptureOptions {
  streamId: string
  initialGeneration: number
  sendControl(control: VoiceClientControl): void
  sendAudio(frame: VoiceAudioFrame): void | Promise<void>
  onSpeechConfirmed?(generation: number): void
}

interface BrowserPlaybackOptions {
  initialGeneration: number
  maxQueuedSeconds: number
}

interface BrowserClient {
  readonly currentState: string
  readonly currentGeneration: number
  start(): Promise<void>
  stop(): Promise<void>
}

interface BrowserClientConstructor {
  new(options: {
    language: string
    defaults: ManagerClientDefaults
    answerOnly: boolean
    dependencies: {
      fetch(input: string | URL | Request, init?: RequestInit): Promise<Response>
      createSocket(url: string): BrowserSocket
      createCapture(options: BrowserCaptureOptions): BrowserCapture
      createPlayback(options: BrowserPlaybackOptions): BrowserPlayback
      baseUrl(): URL
    }
    onState(state: string): void
    onError(error: Error & { code: string; fatal: boolean }): void
    onFinal(event: { text: string }): void
  }): BrowserClient
}

class BrowserSocket {
  readonly CONNECTING = WebSocket.CONNECTING
  readonly OPEN = WebSocket.OPEN
  readonly CLOSING = WebSocket.CLOSING
  readonly CLOSED = WebSocket.CLOSED
  binaryType: 'blob' | 'arraybuffer' = 'blob'
  onopen: ((event: object) => void) | null = null
  onmessage: ((event: { data: string | ArrayBuffer }) => void) | null = null
  onerror: ((event: object) => void) | null = null
  onclose: ((event: {
    code: number
    reason: string
    wasClean: boolean
  }) => void) | null = null
  private readonly socket: WebSocket

  constructor(url: string) {
    this.socket = new WebSocket(url, {
      headers: { host: trusted.host },
      origin: trusted.origin,
    })
    sockets.add(this.socket)
    this.socket.on('open', () => this.onopen?.({}))
    this.socket.on('message', (data, isBinary) => {
      const buffer = rawBuffer(data)
      const payload = isBinary
        ? buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength,
          ) as ArrayBuffer
        : buffer.toString('utf8')
      this.onmessage?.({ data: payload })
    })
    this.socket.on('error', () => this.onerror?.({}))
    this.socket.on('close', (code, reason) => {
      sockets.delete(this.socket)
      this.onclose?.({
        code,
        reason: reason.toString(),
        wasClean: code === 1000,
      })
    })
  }

  get readyState(): number {
    return this.socket.readyState
  }

  get bufferedAmount(): number {
    return this.socket.bufferedAmount
  }

  send(data: string | ArrayBufferLike | ArrayBufferView): void {
    if (typeof data === 'string') {
      this.socket.send(data)
      return
    }
    if (ArrayBuffer.isView(data)) {
      this.socket.send(Buffer.from(data.buffer, data.byteOffset, data.byteLength))
      return
    }
    if (data instanceof ArrayBuffer) {
      this.socket.send(Buffer.from(data))
      return
    }
    throw new Error('Unexpected Blob in node Oracle voice integration')
  }

  close(code?: number, reason?: string): void {
    this.socket.close(code, reason)
  }
}

class BrowserCapture {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)

  constructor(readonly options: BrowserCaptureOptions) {}
}

class BrowserPlayback {
  readonly start = vi.fn(async () => undefined)
  readonly enqueue = vi.fn(() => true)
  readonly tentativeSpeech = vi.fn()
  readonly restoreAfterMisfire = vi.fn()
  readonly cancelCurrent = vi.fn()
  readonly confirmSpeech = vi.fn(() => true)
  readonly endSegment = vi.fn()
  readonly close = vi.fn(async () => undefined)

  constructor(readonly options: BrowserPlaybackOptions) {}
}

interface ListeningRuntime {
  app: Awaited<ReturnType<typeof buildApp>>['app']
  baseUrl: string
  wsUrl: string
  root: string
}

interface LocalHarness extends ListeningRuntime {
  backend: LocalVoiceBackend
  engine: FakeVoiceEngine
  events: SocketInbox
  manager: StoredManager
  browser: WebSocket
  browserInbox: SocketInbox
  streamId: string
}

function availableBackend(
  engine = new FakeVoiceEngine(),
  limits?: VoiceBackendSessionLimits,
): {
  backend: LocalVoiceBackend
  engine: FakeVoiceEngine
} {
  return {
    engine,
    backend: new LocalVoiceBackend(
      new FakeVoiceEngineFactory(engine, {
        available: true,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        playbackSampleRate: 22_050,
        languages: ['en'],
        sttProfile: 'zipformer',
        ttsVoice: 'lessac-medium',
        resourceClass: 'low',
      }),
      config,
      limits,
    ),
  }
}

async function testRoot(label: string): Promise<string> {
  const root = path.join(
    process.cwd(),
    'test-results',
    `${label}-${randomUUID()}`,
  )
  await mkdir(root, { recursive: true })
  roots.push(root)
  return root
}

async function listen(
  built: Awaited<ReturnType<typeof buildApp>>,
  root: string,
): Promise<ListeningRuntime> {
  apps.push(built.app)
  await built.app.listen({ host: '127.0.0.1', port: 0 })
  const address = built.app.server.address() as AddressInfo
  return {
    app: built.app,
    baseUrl: `http://127.0.0.1:${address.port}`,
    wsUrl: `ws://127.0.0.1:${address.port}`,
    root,
  }
}

async function listenAtPort(
  built: Awaited<ReturnType<typeof buildApp>>,
  root: string,
  port: number,
): Promise<ListeningRuntime> {
  apps.push(built.app)
  await built.app.listen({ host: '127.0.0.1', port })
  return {
    app: built.app,
    baseUrl: `http://127.0.0.1:${port}`,
    wsUrl: `ws://127.0.0.1:${port}`,
    root,
  }
}

async function createManager(root: string): Promise<StoredManager> {
  const store = new ManagerStore(path.join(root, 'oracle-manager'))
  await store.initialize()
  return new StoredManager(store)
}

function deterministicManagerHub(): ManagerHub {
  const computer: ComputerSummary = {
    id: 'hub',
    name: 'development',
    isLocal: true,
    online: true,
    providers: [{
      id: 'copilot',
      name: 'GitHub Copilot',
      available: true,
      terminalBacked: true,
    }],
  }
  const managed = (
    id: string,
    changes: Partial<ManagedSession> = {},
  ): ManagedSession => ({
    id,
    computerId: computer.id,
    computerName: computer.name,
    cwd: '/home/tester/src',
    title: `Session ${id}`,
    status: 'idle',
    updatedAt: '2026-10-18T00:00:00.000Z',
    isOpen: true,
    provider: 'copilot',
    messages: [],
    ...changes,
  })
  return {
    listComputers: () => [computer],
    findComputer: (nameOrId) =>
      [computer].find((entry) => entry.id === nameOrId || entry.name === nameOrId),
    listSessionsWithAuthority: vi.fn(async () => ({
      sessions: [],
      answeredComputerIds: [computer.id],
    })),
    listSessions: vi.fn(async () => []),
    listHistory: vi.fn(async () => []),
    readSession: vi.fn(async (_computerId, sessionId) => managed(sessionId)),
    askSession: vi.fn(async () => 'Not used'),
    validateSessionDirectory: vi.fn(async (_computerId, directory) => directory),
    createSession: vi.fn(async () => managed('created')),
    renameSession: vi.fn(async (_computerId, sessionId, input) =>
      managed(sessionId, { title: input.title })),
    sendMessage: vi.fn(async (_computerId, sessionId) => managed(sessionId)),
    replyPermission: vi.fn(async (_computerId, sessionId) => managed(sessionId)),
    replyUserInput: vi.fn(async (_computerId, sessionId) => managed(sessionId)),
    activateSession: vi.fn(async (_computerId, sessionId) => managed(sessionId)),
    resumeSession: vi.fn(async (_computerId, sessionId) => managed(sessionId)),
    cancel: vi.fn(async () => undefined),
    deleteSession: vi.fn(async () => undefined),
    providerRuntimeOptions: vi.fn(async () => ({ models: [] })),
  }
}

async function createRealManager(root: string): Promise<{
  agent: ManagerAgent
  store: ManagerStore
  client: DeterministicManagerClient
  events: ManagerEvent[]
}> {
  const store = new ManagerStore(path.join(root, 'oracle-manager'))
  await store.initialize()
  const client = new DeterministicManagerClient()
  const agent = new ManagerAgent({
    store,
    recorder: new JournalRecorder(store, { flushDelayMs: 0 }),
    hub: deterministicManagerHub(),
    clientFactory: () => client,
    retryDelaysMs: [0, 0],
    idleStopMs: 60_000,
    sessionIdFactory: () => 'deterministic-manager-session',
    now: () => new Date('2026-10-18T00:00:00.000Z'),
  })
  const events: ManagerEvent[] = []
  agent.on('event', (event) => events.push(structuredClone(event)))
  return { agent, store, client, events }
}

async function createLocalHarness(
  engine = new FakeVoiceEngine(),
  limits?: VoiceBackendSessionLimits,
): Promise<LocalHarness> {
  const root = await testRoot('oracle-voice-integration')
  const manager = await createManager(root)
  const voice = availableBackend(engine, limits)
  const built = await buildApp({
    dataDirectory: root,
    logger: false,
    service: new TestSessionService() as unknown as SessionService,
    managerAgent: manager as unknown as ManagerAgent,
    voiceBackend: voice.backend,
  })
  const runtime = await listen(built, root)
  const eventSocket = await openSocket(`${runtime.wsUrl}/api/events`, trusted)
  const events = new SocketInbox(eventSocket, false)
  const ticket = await issueTicket(runtime.baseUrl)
  const { socket: browser, inbox: browserInbox } = await openSocketWithInbox(
    `${runtime.wsUrl}/api/oracle-voice?ticket=${encodeURIComponent(ticket)}`,
    trusted,
  )
  const hello = await browserInbox.waitForControl<VoiceServerControl>(
    (message) => message.type === 'hello',
  )
  if (hello.type !== 'hello') throw new Error('Expected Oracle voice hello')
  return {
    ...runtime,
    backend: voice.backend,
    engine,
    events,
    manager,
    browser,
    browserInbox,
    streamId: hello.streamId,
  }
}

async function issueTicket(baseUrl: string): Promise<string> {
  const response = await requestJson(
    baseUrl,
    'POST',
    '/api/oracle-voice/tickets',
    trusted,
  )
  expect(response.statusCode).toBe(201)
  expect(response.headers['cache-control']).toBe('no-store')
  return (response.body as { ticket: string }).ticket
}

function requestJson(
  baseUrl: string,
  method: string,
  pathname: string,
  headers: Record<string, string> = {},
  body?: unknown,
): Promise<{
  statusCode: number
  headers: http.IncomingHttpHeaders
  body: unknown
}> {
  const url = new URL(pathname, baseUrl)
  const payload = body === undefined ? undefined : JSON.stringify(body)
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: url.hostname,
      port: url.port,
      method,
      path: `${url.pathname}${url.search}`,
      agent: false,
      headers: {
        connection: 'close',
        ...headers,
        ...(payload
          ? {
              'content-type': 'application/json',
              'content-length': String(Buffer.byteLength(payload)),
            }
          : {}),
      },
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve({
          statusCode: response.statusCode ?? 0,
          headers: response.headers,
          body: text ? JSON.parse(text) as unknown : undefined,
        })
      })
    })
    request.once('error', reject)
    if (payload) request.write(payload)
    request.end()
  })
}

function rawBuffer(data: WebSocket.RawData): Buffer {
  if (Array.isArray(data)) return Buffer.concat(data)
  if (data instanceof ArrayBuffer) return Buffer.from(data)
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength)
}

function openSocket(
  url: string,
  headers: { host?: string; origin?: string; authorization?: string } = {},
): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, {
      headers: {
        ...(headers.host ? { host: headers.host } : {}),
        ...(headers.authorization ? { authorization: headers.authorization } : {}),
      },
      ...(headers.origin ? { origin: headers.origin } : {}),
    })
    sockets.add(socket)
    socket.once('open', () => resolve(socket))
    socket.once('unexpected-response', (_request, response) => {
      response.resume()
      sockets.delete(socket)
      reject(Object.assign(
        new Error(`WebSocket upgrade failed (${response.statusCode})`),
        { statusCode: response.statusCode },
      ))
    })
    socket.once('error', reject)
    socket.once('close', () => sockets.delete(socket))
  })
}

function openSocketWithInbox(
  url: string,
  headers: { host?: string; origin?: string; authorization?: string } = {},
): Promise<{ socket: WebSocket; inbox: SocketInbox }> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, {
      headers: {
        ...(headers.host ? { host: headers.host } : {}),
        ...(headers.authorization ? { authorization: headers.authorization } : {}),
      },
      ...(headers.origin ? { origin: headers.origin } : {}),
    })
    const inbox = new SocketInbox(socket)
    sockets.add(socket)
    socket.once('open', () => resolve({ socket, inbox }))
    socket.once('unexpected-response', (_request, response) => {
      response.resume()
      sockets.delete(socket)
      reject(Object.assign(
        new Error(`WebSocket upgrade failed (${response.statusCode})`),
        { statusCode: response.statusCode },
      ))
    })
    socket.once('error', reject)
    socket.once('close', () => sockets.delete(socket))
  })
}

function sendControl(
  socket: WebSocket,
  streamId: string,
  type: VoiceClientControl['type'],
  generation: number,
  fields: Record<string, unknown> = {},
): void {
  socket.send(JSON.stringify({
    type,
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId,
    generation,
    ...fields,
  }))
}

function microphone(
  generation: number,
  sequence: number,
  samples = new Int16Array([100, -100, 200, -200]),
): VoiceAudioFrame {
  return {
    direction: 'microphone',
    generation,
    sequence,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    samples,
  }
}

function playback(
  streamId: string,
  generation: number,
  segmentId: string,
  sequence: number,
  samples: Int16Array,
): VoiceEngineEvent {
  return {
    type: 'audio',
    streamId,
    generation,
    segmentId,
    sequence,
    sampleRate: 22_050,
    samples,
  }
}

function engineCalls<T extends FakeVoiceEngineCall['type']>(
  engine: FakeVoiceEngine,
  type: T,
): Array<Extract<FakeVoiceEngineCall, { type: T }>> {
  return engine.calls.filter(
    (call): call is Extract<FakeVoiceEngineCall, { type: T }> =>
      call.type === type,
  )
}

function closeEvent(socket: WebSocket): Promise<{ code: number; reason: string }> {
  return new Promise((resolve) => {
    socket.once('close', (code, reason) => {
      resolve({ code, reason: reason.toString() })
    })
  })
}

async function closeSocket(socket: WebSocket): Promise<void> {
  if (socket.readyState === WebSocket.CLOSED) return
  await new Promise<void>((resolve) => {
    socket.once('close', () => resolve())
    socket.close(1000, 'test complete')
  })
}

async function fileInventory(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const walk = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name)
      const relative = path.relative(root, full)
      if (entry.isDirectory()) await walk(full)
      else result[relative] = (await readFile(full)).toString('base64')
    }
  }
  await walk(root)
  return result
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', trusted.origin)
  vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
})

afterEach(async () => {
  vi.useRealTimers()
  await Promise.allSettled([...sockets].map((socket) => {
    if (socket.readyState === WebSocket.CLOSED) return Promise.resolve()
    return new Promise<void>((resolve) => {
      socket.once('close', () => resolve())
      socket.terminate()
    })
  }))
  sockets.clear()
  await Promise.allSettled(apps.splice(0).map((app) => app.close()))
  await Promise.all(roots.splice(0).map((root) =>
    rm(root, { recursive: true, force: true })))
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('Oracle voice cross-layer integration', () => {
  it('streams one local Oracle turn through the same visible manager deltas used for TTS', async () => {
    const root = await testRoot('oracle-voice-real-manager')
    const manager = await createRealManager(root)
    const send = vi.spyOn(manager.agent, 'send')
    const voice = availableBackend()
    const built = await buildApp({
      dataDirectory: root,
      logger: false,
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: manager.agent,
      voiceBackend: voice.backend,
    })
    const runtime = await listen(built, root)
    const eventSocket = await openSocket(`${runtime.wsUrl}/api/events`, trusted)
    const events = new SocketInbox(eventSocket, false)
    const ticket = await issueTicket(runtime.baseUrl)
    const { socket: browser, inbox: browserInbox } = await openSocketWithInbox(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${encodeURIComponent(ticket)}`,
      trusted,
    )
    const hello = await browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'hello',
    )
    if (hello.type !== 'hello') throw new Error('Expected Oracle voice hello')
    const test = {
      ...runtime,
      backend: voice.backend,
      engine: voice.engine,
      events,
      manager,
      browser,
      browserInbox,
      streamId: hello.streamId,
    }
    const initialFiles = await fileInventory(test.root)

    const capabilities = await requestJson(
      test.baseUrl,
      'GET',
      '/api/oracle-voice/capabilities',
      trusted,
    )
    expect(capabilities.statusCode).toBe(200)
    expect(capabilities.body).toMatchObject({
      available: true,
      protocol: ORACLE_VOICE_PROTOCOL,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
    })

    sendControl(test.browser, test.streamId, 'start', 7, {
      language: 'en',
      defaults,
      answerOnly: false,
    })
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'stt.start')).toEqual([])
      expect(test.browserInbox.controls<VoiceServerControl>(
        (message) => message.type === 'state' && message.state === 'ready',
      )).toHaveLength(1)
    })

    sendControl(test.browser, test.streamId, 'speech_confirmed', 8, {
      utteranceId: 'utterance-8',
    })
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'stt.start')).toEqual([
        expect.objectContaining({
          streamId: test.streamId,
          generation: 8,
          utteranceId: 'utterance-8',
        }),
      ])
    })

    test.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(8, 0))))
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'stt.accept')).toEqual([
        expect.objectContaining({ generation: 8, sequence: 0, sampleCount: 4 }),
      ])
    })
    test.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(8, 1))))
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'stt.accept').map((call) => call.sequence))
        .toEqual([0, 1])
    })

    test.engine.emit({
      type: 'partial',
      streamId: test.streamId,
      generation: 8,
      utteranceId: 'utterance-8',
      text: 'Run the focused',
    })
    expect(await test.browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'partial',
    )).toMatchObject({
      type: 'partial',
      generation: 8,
      text: 'Run the focused',
    })
    expect(test.manager.store.messages()).toEqual([])

    sendControl(test.browser, test.streamId, 'speech_end', 8, {
      utteranceId: 'utterance-8',
    })
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'stt.end')).toEqual([
        expect.objectContaining({ generation: 8, utteranceId: 'utterance-8' }),
      ])
    })
    test.engine.emit({
      type: 'final',
      streamId: test.streamId,
      generation: 8,
      utteranceId: 'utterance-8',
      text: 'Run the focused tests.',
    })
    test.engine.emit({
      type: 'final',
      streamId: test.streamId,
      generation: 8,
      utteranceId: 'utterance-8',
      text: 'Run the focused tests.',
    })

    await vi.waitFor(() => {
      expect(test.manager.client.sessions).toHaveLength(1)
      expect(test.manager.client.sessions[0].prompts).toHaveLength(1)
      expect(test.manager.store.messages().filter(
        (message) => message.role === 'user',
      )).toHaveLength(1)
    })
    const userMessage = test.manager.store.messages().find(
      (message) => message.role === 'user',
    )!
    expect(send).toHaveBeenCalledWith(
      'Run the focused tests.',
      defaults,
      { answerOnly: true, source: 'voice' },
    )
    expect(userMessage).toMatchObject({
      role: 'user',
      content: 'Run the focused tests.',
      state: 'running',
      answerOnly: true,
      source: 'voice',
    })
    expect(await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.message'
        && event.message.id === userMessage.id
        && event.message.state === 'running',
    )).toMatchObject({
      type: 'manager.message',
      message: {
        id: userMessage.id,
        role: 'user',
        content: 'Run the focused tests.',
        state: 'running',
        source: 'voice',
      },
    })
    const liveUserIds = test.events.controls<ManagerEvent>(
      (event) => event.type === 'manager.message'
        && event.message.role === 'user',
    ).flatMap((event) =>
      event.type === 'manager.message' && event.message.role === 'user'
        ? [event.message.id]
        : [])
    expect(new Set(liveUserIds)).toEqual(new Set([userMessage.id]))
    expect(test.manager.client.sessions[0].prompts[0]).toContain(
      '<untrusted_voice_transcript acoustic_identity="unverified">\nRun the focused tests.\n</untrusted_voice_transcript>',
    )
    const reopened = new ManagerStore(path.join(
      test.root,
      'oracle-manager',
    ))
    await reopened.initialize()
    expect(reopened.message(userMessage.id)).toMatchObject({
      source: 'voice',
      answerOnly: true,
    })
    expect(test.browserInbox.controls<VoiceServerControl>(
      (message) => message.type === 'final',
    )).toEqual([])

    const firstSnapshot = 'First stable sentence. Sec'
    const sdkSession = test.manager.client.sessions[0]
    sdkSession.emit({
      type: 'assistant.message_delta',
      data: {
        messageId: 'sdk-assistant-1',
        deltaContent: firstSnapshot,
      },
    })
    const firstDelta = await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.delta'
        && event.content === firstSnapshot,
    )
    expect(firstDelta).toEqual({
      type: 'manager.delta',
      messageId: expect.any(String),
      content: firstSnapshot,
    })
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'tts.synthesize')).toEqual([
        expect.objectContaining({
          generation: 8,
          text: 'First stable sentence.',
        }),
      ])
    })
    const firstSpeech = engineCalls(test.engine, 'tts.synthesize')[0]
    test.engine.emit(playback(
      test.streamId,
      8,
      firstSpeech.segmentId,
      0,
      new Int16Array([1, 2, 3]),
    ))
    test.engine.emit(playback(
      test.streamId,
      8,
      firstSpeech.segmentId,
      1,
      new Int16Array([4, 5]),
    ))
    expect(await test.browserInbox.waitForAudio(
      (frame) => frame.direction === 'playback'
        && frame.segmentId === firstSpeech.segmentId
        && frame.sequence === 1,
    )).toMatchObject({
      direction: 'playback',
      generation: 8,
      sequence: 1,
      sampleRate: 22_050,
    })
    test.engine.emit({
      type: 'audio_end',
      streamId: test.streamId,
      generation: 8,
      segmentId: firstSpeech.segmentId,
    })

    const stableSecondSnapshot =
      'First stable sentence. Second stable sentence.'
    const secondSnapshot = `${stableSecondSnapshot} Fin`
    sdkSession.emit({
      type: 'assistant.message_delta',
      data: {
        messageId: 'sdk-assistant-1',
        deltaContent: 'ond stable sentence. Fin',
      },
    })
    const secondDelta = await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.delta'
        && event.content === secondSnapshot,
    )
    expect(secondDelta).toMatchObject({
      type: 'manager.delta',
      messageId: firstDelta.type === 'manager.delta'
        ? firstDelta.messageId
        : undefined,
      content: secondSnapshot,
    })
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'tts.synthesize').map((call) => call.text))
        .toEqual([
          'First stable sentence.',
          'Second stable sentence.',
        ])
    })
    const secondSpeech = engineCalls(test.engine, 'tts.synthesize')[1]
    test.engine.emit(playback(
      test.streamId,
      8,
      secondSpeech.segmentId,
      0,
      new Int16Array([6, 7, 8]),
    ))
    test.engine.emit({
      type: 'audio_end',
      streamId: test.streamId,
      generation: 8,
      segmentId: secondSpeech.segmentId,
    })

    const finalContent = `${stableSecondSnapshot} Final stored suffix.`
    sdkSession.emit({
      type: 'assistant.message',
      data: {
        messageId: 'sdk-assistant-1',
        content: finalContent,
      },
    })
    sdkSession.emit({ type: 'session.idle' })
    const storedAssistantEvent = await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.message'
        && event.message.role === 'assistant'
        && event.message.replyTo === userMessage.id,
    )
    if (
      storedAssistantEvent.type !== 'manager.message'
      || storedAssistantEvent.message.role !== 'assistant'
    ) {
      throw new Error('Expected stored ManagerAgent assistant message')
    }
    const assistant = storedAssistantEvent.message
    expect(assistant).toMatchObject({
      id: firstDelta.type === 'manager.delta'
        ? firstDelta.messageId
        : undefined,
      role: 'assistant',
      replyTo: userMessage.id,
      content: finalContent,
    })
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'tts.synthesize').map((call) => call.text))
        .toEqual([
          'First stable sentence.',
          'Second stable sentence.',
          'Final stored suffix.',
        ])
    })
    const suffixSpeech = engineCalls(test.engine, 'tts.synthesize')[2]
    test.engine.emit(playback(
      test.streamId,
      8,
      suffixSpeech.segmentId,
      0,
      new Int16Array([9]),
    ))
    test.engine.emit({
      type: 'audio_end',
      streamId: test.streamId,
      generation: 8,
      segmentId: suffixSpeech.segmentId,
    })
    await test.browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'audio_end'
        && message.segmentId === suffixSpeech.segmentId,
    )

    const visibleSnapshots = test.events.controls<ManagerEvent>(
      (event) => event.type === 'manager.delta',
    ).flatMap((event) => event.type === 'manager.delta' ? [event.content] : [])
    expect(visibleSnapshots).toEqual([
      firstSnapshot,
      secondSnapshot,
      finalContent,
    ])
    const actualManagerSnapshots = test.manager.events.flatMap((event) =>
      event.type === 'manager.delta' ? [event.content] : [])
    expect(visibleSnapshots).toEqual(actualManagerSnapshots)
    const spoken = engineCalls(test.engine, 'tts.synthesize').map((call) => call.text)
    expect(spoken.slice(0, 2)).toEqual([
      'First stable sentence.',
      'Second stable sentence.',
    ])
    expect(spoken.every((text) => finalContent.includes(text))).toBe(true)
    await vi.waitFor(() => {
      expect(test.manager.store.messages()).toEqual([
        expect.objectContaining({
          id: userMessage.id,
          role: 'user',
          content: 'Run the focused tests.',
          state: 'done',
          answerOnly: true,
        }),
        assistant,
      ])
    })
    expect(test.browserInbox.audio().every(
      (frame) => voiceAudioFrameByteLength(frame) <= 32 * 1024,
    )).toBe(true)
    expect(test.browserInbox.audio().map((frame) => frame.sequence))
      .toEqual([0, 1, 0, 0])

    const closed = closeEvent(test.browser)
    sendControl(test.browser, test.streamId, 'stop', 8, {
      reason: 'Conversation complete',
    })
    await expect(closed).resolves.toEqual({
      code: 1000,
      reason: 'Conversation complete',
    })
    await vi.waitFor(() => expect(test.backend.busy()).toBe(false))
    expect(Object.keys(await fileInventory(test.root)).filter(
      (name) => /\.(?:pcm|wav|webm|ogg|mp3)$/i.test(name),
    )).toEqual([])
    expect(Object.keys(initialFiles).every(
      (name) => !/\.(?:pcm|wav|webm|ogg|mp3)$/i.test(name),
    )).toBe(true)
  })

  it('fails closed for an uncertain send and never echoes a successful final', async () => {
    const failed = await createLocalHarness()
    failed.manager.failSend = new Error('manager unavailable')
    sendControl(failed.browser, failed.streamId, 'start', 0, {
      language: 'en',
      defaults,
      answerOnly: false,
    })
    sendControl(failed.browser, failed.streamId, 'speech_confirmed', 1, {
      utteranceId: 'failed-1',
    })
    await vi.waitFor(() => expect(engineCalls(failed.engine, 'stt.start')).toHaveLength(1))
    failed.engine.emit({
      type: 'partial',
      streamId: failed.streamId,
      generation: 1,
      utteranceId: 'failed-1',
      text: 'Recover',
    })
    const failedClose = closeEvent(failed.browser)
    failed.engine.emit({
      type: 'final',
      streamId: failed.streamId,
      generation: 1,
      utteranceId: 'failed-1',
      text: 'Recover this transcript.',
    })
    expect(await failed.browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'error'
        && message.code === 'oracle_send_failed',
    )).toMatchObject({ fatal: true })
    await expect(failedClose).resolves.toEqual({
      code: 1011,
      reason: 'Could not send to Oracle: manager unavailable',
    })
    expect(failed.browserInbox.controls<VoiceServerControl>(
      (message) => message.type === 'transcript_restore',
    )).toEqual([])
    expect(failed.manager.send).toHaveBeenCalledOnce()
    expect(failed.manager.store.messages()).toEqual([])

    const successful = await createLocalHarness()
    sendControl(successful.browser, successful.streamId, 'start', 3, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(successful.browser, successful.streamId, 'speech_confirmed', 4, {
      utteranceId: 'success-4',
    })
    await vi.waitFor(() => expect(engineCalls(successful.engine, 'stt.start')).toHaveLength(1))
    successful.engine.emit({
      type: 'final',
      streamId: successful.streamId,
      generation: 4,
      utteranceId: 'success-4',
      text: 'Send this once.',
    })
    await vi.waitFor(() => expect(successful.manager.send).toHaveBeenCalledOnce())
    expect(successful.browserInbox.controls<VoiceServerControl>(
      (message) => message.type === 'final',
    )).toEqual([])
    expect(successful.browserInbox.controls<VoiceServerControl>(
      (message) => message.type === 'transcript_restore',
    )).toEqual([])
  })

  it.each([
    'mid-utterance',
    'after-speech-end',
    'after-early-final',
  ] as const)(
    'keeps the local voice session usable when Oracle resets %s',
    async (resetPoint) => {
      const test = await createLocalHarness()
      sendControl(test.browser, test.streamId, 'start', 0, {
        language: 'en',
        defaults,
        answerOnly: true,
      })
      sendControl(test.browser, test.streamId, 'speech_confirmed', 1, {
        utteranceId: 'reset-utterance',
      })
      await vi.waitFor(() => expect(engineCalls(test.engine, 'stt.start'))
        .toHaveLength(1))
      test.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(
        1,
        0,
        new Int16Array([101, -102]),
      ))))
      await vi.waitFor(() => expect(engineCalls(test.engine, 'stt.accept'))
        .toHaveLength(1))

      if (resetPoint === 'after-speech-end') {
        sendControl(test.browser, test.streamId, 'speech_end', 1, {
          utteranceId: 'reset-utterance',
        })
        await vi.waitFor(() => expect(engineCalls(test.engine, 'stt.end'))
          .toHaveLength(1))
      } else if (resetPoint === 'after-early-final') {
        test.engine.emit({
          type: 'final',
          streamId: test.streamId,
          generation: 1,
          utteranceId: 'reset-utterance',
          text: 'Continue after reset.',
        })
        await vi.waitFor(() => expect(test.manager.send).toHaveBeenCalledOnce())
      }

      const listeningBefore = test.browserInbox.controls<VoiceServerControl>(
        (message) => message.type === 'state' && message.state === 'listening',
      ).length
      test.manager.emit('event', {
        type: 'manager.reset',
        snapshot: test.manager.snapshot(),
      })
      await vi.waitFor(() => expect(
        test.browserInbox.controls<VoiceServerControl>(
          (message) => message.type === 'state' && message.state === 'listening',
        ).length,
      ).toBeGreaterThan(listeningBefore))

      if (resetPoint === 'mid-utterance') {
        test.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(
          1,
          1,
          new Int16Array([103, -104]),
        ))))
      }
      if (resetPoint !== 'after-speech-end') {
        sendControl(test.browser, test.streamId, 'speech_end', 1, {
          utteranceId: 'reset-utterance',
        })
        await vi.waitFor(() => expect(engineCalls(test.engine, 'stt.end'))
          .toHaveLength(resetPoint === 'after-early-final' ? 0 : 1))
      }
      if (resetPoint !== 'after-early-final') {
        test.engine.emit({
          type: 'final',
          streamId: test.streamId,
          generation: 1,
          utteranceId: 'reset-utterance',
          text: 'Continue after reset.',
        })
        await vi.waitFor(() => expect(test.manager.send).toHaveBeenCalledOnce())
      }

      sendControl(test.browser, test.streamId, 'speech_confirmed', 2, {
        utteranceId: 'next-utterance',
      })
      await vi.waitFor(() => expect(engineCalls(test.engine, 'stt.start')
        .some((call) => call.generation === 2)).toBe(true))
      expect(test.browser.readyState).toBe(WebSocket.OPEN)
      expect(test.browserInbox.controls<VoiceServerControl>(
        (message) => message.type === 'error'
          && (message.fatal || message.code === 'stt_final_timeout'),
      )).toEqual([])
    },
  )

  it('relays incrementally through an authenticated paired node without hub-local models', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_VOICE_COMPUTER', 'Speech node')
    const privateFolder = `/private/${'x'.repeat(4_000)}`
    const pairedDefaults: ManagerClientDefaults = {
      ...defaults,
      folders: Object.fromEntries(Array.from(
        { length: 18 },
        (_, index) => [`computer-${index}`, `${privateFolder}-${index}`],
      )),
    }
    const nodeLogs: string[] = []
    const hubLogs: string[] = []
    const capturedLogger = (lines: string[]) => ({
      level: 'trace',
      stream: { write: (line: string) => lines.push(line) },
    })

    const nodeRoot = await testRoot('oracle-voice-node')
    const nodeVoice = availableBackend()
    const nodeBuilt = await buildApp({
      dataDirectory: nodeRoot,
      logger: capturedLogger(nodeLogs) as unknown as boolean,
      role: 'node',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: false,
      voiceBackend: nodeVoice.backend,
    })
    const node = await listen(nodeBuilt, nodeRoot)
    const nodeFilesBefore = await fileInventory(nodeRoot)

    const hubRoot = await testRoot('oracle-voice-hub')
    const manager = await createManager(hubRoot)
    const hubBuilt = await buildApp({
      dataDirectory: hubRoot,
      logger: capturedLogger(hubLogs) as unknown as boolean,
      role: 'hub',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: manager as unknown as ManagerAgent,
    })
    const hub = await listen(hubBuilt, hubRoot)
    expect(hubBuilt.voiceEngineFactory).toBeUndefined()
    expect(hubBuilt.voiceConfig).toEqual({
      enabled: true,
      computerName: 'Speech node',
    })

    const paired = await requestJson(
      hub.baseUrl,
      'POST',
      '/api/computers',
      trusted,
      {
        baseUrl: node.baseUrl,
        token: nodeBuilt.identity.token,
        name: 'Speech node',
      },
    )
    expect(paired.statusCode).toBe(201)
    await vi.waitFor(async () => {
      const capability = await requestJson(
        hub.baseUrl,
        'GET',
        '/api/oracle-voice/capabilities',
        trusted,
      )
      expect(capability.body).toMatchObject({
        available: true,
        computerId: nodeBuilt.identity.info.id,
        computerName: 'Speech node',
      })
    })

    const eventsSocket = await openSocket(`${hub.wsUrl}/api/events`, trusted)
    const events = new SocketInbox(eventsSocket, false)
    const ticket = await issueTicket(hub.baseUrl)
    const { socket: browser, inbox } = await openSocketWithInbox(
      `${hub.wsUrl}/api/oracle-voice?ticket=${encodeURIComponent(ticket)}`,
      trusted,
    )
    const hello = await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'hello',
    )
    if (hello.type !== 'hello') throw new Error('Expected paired-node hello')

    sendControl(browser, hello.streamId, 'start', 20, {
      language: 'en',
      defaults: pairedDefaults,
      answerOnly: false,
    })
    sendControl(browser, hello.streamId, 'speech_confirmed', 21, {
      utteranceId: 'remote-21',
    })
    await vi.waitFor(() => {
      expect(engineCalls(nodeVoice.engine, 'stt.start')).toEqual([
        expect.objectContaining({
          streamId: hello.streamId,
          generation: 21,
          utteranceId: 'remote-21',
        }),
      ])
    })

    const pcmSentinel = new Int16Array([29_101, -29_102, 29_103, -29_104])
    browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(
      21,
      0,
      pcmSentinel,
    ))))
    await vi.waitFor(() => {
      expect(engineCalls(nodeVoice.engine, 'stt.accept').map((call) => call.sequence))
        .toEqual([0])
    })
    expect(engineCalls(nodeVoice.engine, 'stt.end')).toEqual([])
    browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(
      21,
      1,
      new Int16Array([29_105, -29_106]),
    ))))
    await vi.waitFor(() => {
      expect(engineCalls(nodeVoice.engine, 'stt.accept').map((call) => call.sequence))
        .toEqual([0, 1])
    })
    nodeVoice.engine.emit({
      type: 'partial',
      streamId: hello.streamId,
      generation: 21,
      utteranceId: 'remote-21',
      text: 'Node partial',
    })
    await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'partial'
        && message.text === 'Node partial',
    )
    sendControl(browser, hello.streamId, 'speech_end', 21, {
      utteranceId: 'remote-21',
    })
    await vi.waitFor(() => expect(engineCalls(nodeVoice.engine, 'stt.end')).toHaveLength(1))
    const transcriptSentinel = 'paired-final-c8ea17b4'
    nodeVoice.engine.emit({
      type: 'final',
      streamId: hello.streamId,
      generation: 21,
      utteranceId: 'remote-21',
      text: transcriptSentinel,
    })
    await vi.waitFor(() => expect(manager.send).toHaveBeenCalledOnce())
    expect(manager.send).toHaveBeenCalledWith(
      transcriptSentinel,
      pairedDefaults,
      { answerOnly: true, source: 'voice' },
    )
    const user = manager.submitted[0]
    expect(user).toMatchObject({
      content: transcriptSentinel,
      source: 'voice',
      answerOnly: true,
    })
    const reopenedHubManager = new ManagerStore(path.join(
      hubRoot,
      'oracle-manager',
    ))
    await reopenedHubManager.initialize()
    expect(reopenedHubManager.message(user.id)).toMatchObject({
      source: 'voice',
      answerOnly: true,
    })
    const managerDeltaSentinel = 'paired-manager-tts-4b027dc1.'
    const managerDelta = `${managerDeltaSentinel} Pending`
    manager.emitDelta('remote-assistant', managerDelta)
    await events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.delta'
        && event.content === managerDelta,
    )
    await vi.waitFor(() => {
      expect(engineCalls(nodeVoice.engine, 'tts.synthesize').map((call) => call.text))
        .toEqual([managerDeltaSentinel])
    })
    const speech = engineCalls(nodeVoice.engine, 'tts.synthesize')[0]
    nodeVoice.engine.emit(playback(
      hello.streamId,
      21,
      speech.segmentId,
      0,
      new Int16Array([10, 11]),
    ))
    await inbox.waitForAudio(
      (frame) => frame.direction === 'playback'
        && frame.segmentId === speech.segmentId
        && frame.sequence === 0,
    )
    nodeVoice.engine.emit(playback(
      hello.streamId,
      21,
      speech.segmentId,
      1,
      new Int16Array([12]),
    ))
    await inbox.waitForAudio(
      (frame) => frame.direction === 'playback'
        && frame.segmentId === speech.segmentId
        && frame.sequence === 1,
    )
    nodeVoice.engine.emit({
      type: 'audio_end',
      streamId: hello.streamId,
      generation: 21,
      segmentId: speech.segmentId,
    })
    await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'audio_end'
        && message.segmentId === speech.segmentId,
    )
    await manager.emitAssistant({
      id: 'remote-assistant',
      role: 'assistant',
      replyTo: user.id,
      content: managerDeltaSentinel,
      createdAt: '2026-10-18T00:00:02.000Z',
    })

    sendControl(browser, hello.streamId, 'speech_confirmed', 22, {
      utteranceId: 'remote-22',
    })
    await vi.waitFor(() => expect(engineCalls(nodeVoice.engine, 'stt.start')
      .some((call) => call.generation === 22)).toBe(true))
    nodeVoice.engine.emit({
      type: 'final',
      streamId: hello.streamId,
      generation: 22,
      utteranceId: 'remote-22',
      text: 'Paired cancellation target.',
    })
    await vi.waitFor(() => expect(manager.send).toHaveBeenCalledTimes(2))
    const cancelTarget = manager.submitted[1]
    sendControl(browser, hello.streamId, 'speech_confirmed', 23, {
      utteranceId: 'remote-23',
    })
    await vi.waitFor(() => expect(manager.cancelMessage)
      .toHaveBeenCalledWith(cancelTarget.id))
    expect(manager.cancel).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(engineCalls(nodeVoice.engine, 'cancel'))
      .toContainEqual(expect.objectContaining({ generation: 22 })))

    expect(await fileInventory(nodeRoot)).toEqual(nodeFilesBefore)
    const hubFiles = await fileInventory(hubRoot)
    const nodeFiles = await fileInventory(nodeRoot)
    for (const files of [hubFiles, nodeFiles]) {
      expect(Object.keys(files).filter(
        (name) => /\.(?:pcm|wav|webm|ogg|mp3|m4a)$/i.test(name),
      )).toEqual([])
      expect(Object.values(files).some((contents) =>
        Buffer.from(contents, 'base64').includes(
          Buffer.from(pcmSentinel.buffer),
        ))).toBe(false)
    }
    const pcmBytes = Buffer.from(pcmSentinel.buffer)
    const sensitiveLogValues = [
      transcriptSentinel,
      managerDeltaSentinel,
      ticket,
      hello.streamId,
      nodeBuilt.identity.token,
      privateFolder,
      pcmSentinel.join(','),
      pcmBytes.toString('hex'),
      pcmBytes.toString('base64'),
    ]
    for (const logs of [hubLogs.join(''), nodeLogs.join('')]) {
      for (const value of sensitiveLogValues) {
        expect(logs).not.toContain(value)
      }
    }

    const disconnected = closeEvent(browser)
    nodeVoice.engine.emit({
      type: 'fatal_error',
      message: 'Node voice worker crashed',
    })
    expect(await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'error' && message.fatal,
    )).toMatchObject({
      type: 'error',
      code: 'voice_backend_failed',
      message: 'Node voice worker crashed',
      fatal: true,
    })
    const browserClose = await disconnected
    expect(browserClose.code).toBe(1011)
    expect(browserClose.reason).toContain('Node voice worker crashed')
    expect(manager.send).toHaveBeenCalledTimes(2)
  })

  it('reconnects the production browser client after a paired node restart without replay', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_VOICE_COMPUTER', 'Restartable speech node')
    const browserClientModule = '../src/oracle-voice/client.js'
    const { OracleVoiceClient } = await import(browserClientModule) as {
      OracleVoiceClient: BrowserClientConstructor
    }

    const nodeRoot = await testRoot('oracle-voice-restart-node')
    const firstVoice = availableBackend()
    const firstNodeBuilt = await buildApp({
      dataDirectory: nodeRoot,
      logger: false,
      role: 'node',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: false,
      voiceBackend: firstVoice.backend,
    })
    const firstNode = await listen(firstNodeBuilt, nodeRoot)
    const nodePort = Number(new URL(firstNode.baseUrl).port)
    const nodeConnections = new Set<Socket>()
    firstNode.app.server.on('connection', (socket) => {
      nodeConnections.add(socket)
      socket.once('close', () => nodeConnections.delete(socket))
    })

    const hubRoot = await testRoot('oracle-voice-restart-hub')
    const manager = await createManager(hubRoot)
    const hubBuilt = await buildApp({
      dataDirectory: hubRoot,
      logger: false,
      role: 'hub',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: manager as unknown as ManagerAgent,
    })
    const hub = await listen(hubBuilt, hubRoot)
    expect((await requestJson(
      hub.baseUrl,
      'POST',
      '/api/computers',
      trusted,
      {
        baseUrl: firstNode.baseUrl,
        token: firstNodeBuilt.identity.token,
        name: 'Restartable speech node',
      },
    )).statusCode).toBe(201)
    await vi.waitFor(async () => {
      expect((await requestJson(
        hub.baseUrl,
        'GET',
        '/api/oracle-voice/capabilities',
        trusted,
      )).body).toMatchObject({ available: true })
    })

    const captures: BrowserCapture[] = []
    const playbacks: BrowserPlayback[] = []
    const states: string[] = []
    const errors: Array<Error & { code: string; fatal: boolean }> = []
    const finals: string[] = []
    let ticketRequests = 0
    const client = new OracleVoiceClient({
      language: 'en',
      defaults,
      answerOnly: true,
      dependencies: {
        fetch: async (input, init) => {
          const url = new URL(String(input), hub.baseUrl)
          if (url.pathname.endsWith('/tickets')) ticketRequests += 1
          const response = await requestJson(
            hub.baseUrl,
            init?.method ?? 'GET',
            `${url.pathname}${url.search}`,
            trusted,
          )
          return new Response(
            response.body === undefined ? undefined : JSON.stringify(response.body),
            {
              status: response.statusCode,
              headers: { 'content-type': 'application/json' },
            },
          )
        },
        createSocket: (url) => new BrowserSocket(url),
        createCapture: (options) => {
          const capture = new BrowserCapture(options)
          captures.push(capture)
          return capture
        },
        createPlayback: (options) => {
          const playback = new BrowserPlayback(options)
          playbacks.push(playback)
          return playback
        },
        baseUrl: () => new URL(hub.baseUrl),
      },
      onState: (state) => states.push(state),
      onError: (error) => errors.push(error),
      onFinal: (event) => finals.push(event.text),
    })
    await client.start()
    expect(captures).toHaveLength(1)
    const firstCapture = captures[0]
    const firstStreamId = firstCapture.options.streamId
    const activeGeneration = client.currentGeneration + 1
    firstCapture.options.onSpeechConfirmed?.(activeGeneration)
    firstCapture.options.sendControl({
      type: 'speech_confirmed',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: firstStreamId,
      generation: activeGeneration,
      utteranceId: 'restart-utterance',
    })
    await firstCapture.options.sendAudio(microphone(
      activeGeneration,
      0,
      new Int16Array([301, -302, 303, -304]),
    ))
    await vi.waitFor(() => {
      expect(engineCalls(firstVoice.engine, 'stt.accept')).toEqual([
        expect.objectContaining({ sequence: 0 }),
      ])
    })
    firstVoice.engine.emit({
      type: 'final',
      streamId: firstStreamId,
      generation: activeGeneration,
      utteranceId: 'restart-utterance',
      text: 'Submit this restart turn once.',
    })
    await vi.waitFor(() => expect(manager.send).toHaveBeenCalledOnce())

    for (const socket of nodeConnections) socket.destroy()
    await vi.waitFor(() => expect(client.currentState).toBe('reconnecting'), {
      timeout: 5_000,
    })
    await firstNode.app.close()

    const restartedVoice = availableBackend()
    const restartedNodeBuilt = await buildApp({
      dataDirectory: nodeRoot,
      logger: false,
      role: 'node',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: false,
      voiceBackend: restartedVoice.backend,
    })
    await listenAtPort(restartedNodeBuilt, nodeRoot, nodePort)
    await vi.waitFor(() => expect(client.currentState).toBe('listening'), {
      timeout: 8_000,
      interval: 50,
    })

    expect(states).toContain('reconnecting')
    expect(captures).toHaveLength(2)
    expect(captures[1].options.streamId).not.toBe(firstStreamId)
    expect(captures[1].options.initialGeneration).toBeGreaterThan(activeGeneration)
    expect(ticketRequests).toBeGreaterThanOrEqual(2)
    expect(captures[0].stop).toHaveBeenCalledOnce()
    expect(engineCalls(restartedVoice.engine, 'stt.accept')).toEqual([])
    expect(manager.send).toHaveBeenCalledOnce()
    expect(finals).toEqual([])
    expect(errors).toContainEqual(expect.objectContaining({
      code: 'server-error',
      fatal: false,
    }))
    await client.stop()
    expect(playbacks.at(-1)?.close).toHaveBeenCalledOnce()
  })

  it('keeps a paired-node STT worker rejection terminal despite close code 1011', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_VOICE_COMPUTER', 'Rejecting speech node')

    class RejectingNodeEngine extends FakeVoiceEngine {
      override async accept(_frame: Parameters<FakeVoiceEngine['accept']>[0]): Promise<void> {
        throw new Error('paired stt accept rejected')
      }
    }

    const nodeRoot = await testRoot('oracle-voice-rejecting-node')
    const nodeVoice = availableBackend(new RejectingNodeEngine())
    const nodeBuilt = await buildApp({
      dataDirectory: nodeRoot,
      logger: false,
      role: 'node',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: false,
      voiceBackend: nodeVoice.backend,
    })
    const node = await listen(nodeBuilt, nodeRoot)

    const hubRoot = await testRoot('oracle-voice-rejecting-node-hub')
    const manager = await createManager(hubRoot)
    const hubBuilt = await buildApp({
      dataDirectory: hubRoot,
      logger: false,
      role: 'hub',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: manager as unknown as ManagerAgent,
    })
    const hub = await listen(hubBuilt, hubRoot)
    expect((await requestJson(
      hub.baseUrl,
      'POST',
      '/api/computers',
      trusted,
      {
        baseUrl: node.baseUrl,
        token: nodeBuilt.identity.token,
        name: 'Rejecting speech node',
      },
    )).statusCode).toBe(201)
    await vi.waitFor(async () => {
      expect((await requestJson(
        hub.baseUrl,
        'GET',
        '/api/oracle-voice/capabilities',
        trusted,
      )).body).toMatchObject({ available: true })
    })

    const ticket = await issueTicket(hub.baseUrl)
    const { socket: browser, inbox } = await openSocketWithInbox(
      `${hub.wsUrl}/api/oracle-voice?ticket=${encodeURIComponent(ticket)}`,
      trusted,
    )
    const hello = await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'hello',
    )
    if (hello.type !== 'hello') throw new Error('Expected paired voice hello')
    sendControl(browser, hello.streamId, 'start', 70, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(browser, hello.streamId, 'speech_confirmed', 71, {
      utteranceId: 'rejecting-node-71',
    })
    const closed = closeEvent(browser)
    browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(
      71,
      0,
      new Int16Array([401, -402, 403, -404]),
    ))))

    expect(await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'error'
        && message.code === 'voice_backend_disconnected',
    )).toMatchObject({
      type: 'error',
      message: 'Paired node voice socket disconnected (1011)',
      fatal: true,
    })
    expect(await closed).toMatchObject({
      code: 1011,
      reason: 'Paired node voice socket disconnected (1011)',
    })
    expect(manager.send).not.toHaveBeenCalled()
  })

  it('fails closed when a paired node cannot consume incremental microphone frames', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_VOICE_COMPUTER', 'Slow speech node')

    let releaseAccept!: () => void
    const acceptGate = new Promise<void>((resolve) => {
      releaseAccept = resolve
    })
    class SlowNodeEngine extends FakeVoiceEngine {
      override async accept(
        frame: Parameters<FakeVoiceEngine['accept']>[0],
      ): Promise<void> {
        await acceptGate
        await super.accept(frame)
      }
    }
    const nodeRoot = await testRoot('oracle-voice-slow-node')
    const nodeEngine = new SlowNodeEngine()
    const nodeBackend = availableBackend(
      nodeEngine,
      {
        ...DEFAULT_VOICE_BACKEND_LIMITS,
        maxQueueBytes: 2_048,
      },
    )
    const nodeBuilt = await buildApp({
      dataDirectory: nodeRoot,
      logger: false,
      role: 'node',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: false,
      voiceBackend: nodeBackend.backend,
    })
    const node = await listen(nodeBuilt, nodeRoot)

    const hubRoot = await testRoot('oracle-voice-slow-node-hub')
    const manager = await createManager(hubRoot)
    const hubBuilt = await buildApp({
      dataDirectory: hubRoot,
      logger: false,
      role: 'hub',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: manager as unknown as ManagerAgent,
    })
    const hub = await listen(hubBuilt, hubRoot)
    expect((await requestJson(
      hub.baseUrl,
      'POST',
      '/api/computers',
      trusted,
      {
        baseUrl: node.baseUrl,
        token: nodeBuilt.identity.token,
        name: 'Slow speech node',
      },
    )).statusCode).toBe(201)
    await vi.waitFor(async () => {
      expect((await requestJson(
        hub.baseUrl,
        'GET',
        '/api/oracle-voice/capabilities',
        trusted,
      )).body).toMatchObject({ available: true })
    })

    const ticket = await issueTicket(hub.baseUrl)
    const { socket: browser, inbox } = await openSocketWithInbox(
      `${hub.wsUrl}/api/oracle-voice?ticket=${encodeURIComponent(ticket)}`,
      trusted,
    )
    const hello = await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'hello',
    )
    if (hello.type !== 'hello') throw new Error('Expected slow-node hello')
    sendControl(browser, hello.streamId, 'start', 60, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(browser, hello.streamId, 'speech_confirmed', 61, {
      utteranceId: 'slow-node-61',
    })
    await vi.waitFor(() => expect(engineCalls(nodeEngine, 'stt.start')).toHaveLength(1))

    const closed = closeEvent(browser)
    for (let sequence = 0; sequence < 16; sequence += 1) {
      browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(
        61,
        sequence,
        new Int16Array(400),
      ))))
    }
    expect(await inbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'error'
        && message.code === 'voice_backend_disconnected'
        && message.fatal,
    )).toMatchObject({
      type: 'error',
      fatal: true,
      message: 'Paired node voice socket disconnected (1013)',
    })
    expect((await closed).code).toBe(1013)
    releaseAccept()
    await vi.waitFor(() => expect(nodeBackend.backend.busy()).toBe(false))
    expect(manager.send).not.toHaveBeenCalled()
  })

  it.each([
    'capture',
    'stt',
    'manager-thinking',
    'tts',
    'playback',
  ] as const)('cleans up a browser disconnect during %s without duplicate submission', async (phase) => {
    const test = await createLocalHarness()
    sendControl(test.browser, test.streamId, 'start', 30, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(test.browser, test.streamId, 'speech_confirmed', 31, {
      utteranceId: 'phase-31',
    })
    await vi.waitFor(() => expect(engineCalls(test.engine, 'stt.start')).toHaveLength(1))

    if (phase !== 'capture') {
      test.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(31, 0))))
      await vi.waitFor(() => expect(engineCalls(test.engine, 'stt.accept')).toHaveLength(1))
    }
    if (phase !== 'capture' && phase !== 'stt') {
      test.engine.emit({
        type: 'final',
        streamId: test.streamId,
        generation: 31,
        utteranceId: 'phase-31',
        text: 'Only one manager submission.',
      })
      await vi.waitFor(() => expect(test.manager.send).toHaveBeenCalledOnce())
    }
    if (phase === 'tts' || phase === 'playback') {
      test.manager.emitDelta('phase-assistant', 'One spoken sentence. Pending')
      await vi.waitFor(() => expect(engineCalls(test.engine, 'tts.synthesize')).toHaveLength(1))
    }
    if (phase === 'playback') {
      const speech = engineCalls(test.engine, 'tts.synthesize')[0]
      test.engine.emit(playback(
        test.streamId,
        31,
        speech.segmentId,
        0,
        new Int16Array([1, 2, 3]),
      ))
      await test.browserInbox.waitForAudio(
        (frame) => frame.direction === 'playback',
      )
    }

    await closeSocket(test.browser)
    await vi.waitFor(() => expect(test.backend.busy()).toBe(false))
    await vi.waitFor(() => {
      expect(engineCalls(test.engine, 'cancel')).toContainEqual({
        type: 'cancel',
        streamId: test.streamId,
        generation: 31,
      })
    })
    expect(test.manager.send).toHaveBeenCalledTimes(
      ['manager-thinking', 'tts', 'playback'].includes(phase) ? 1 : 0,
    )
  })

  it('rejects duplicate microphone frames before they can reach Oracle', async () => {
    const ordering = await createLocalHarness()
    sendControl(ordering.browser, ordering.streamId, 'start', 6, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(ordering.browser, ordering.streamId, 'speech_confirmed', 7, {
      utteranceId: 'ordered-7',
    })
    await vi.waitFor(() => expect(engineCalls(ordering.engine, 'stt.start')).toHaveLength(1))
    ordering.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(7, 0))))
    await vi.waitFor(() => expect(engineCalls(ordering.engine, 'stt.accept')).toHaveLength(1))
    ordering.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(7, 0))))
    const orderingClose = closeEvent(ordering.browser)
    ordering.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(7, 2))))
    const orderingFailure = await orderingClose
    expect(orderingFailure.code).toBe(1008)
    expect(engineCalls(ordering.engine, 'stt.accept').map((call) => call.sequence))
      .toEqual([0])
    expect(ordering.manager.send).not.toHaveBeenCalled()
  })

  it('continues current microphone ingress while local synthesis cancellation is blocked', async () => {
    let releaseCancel!: () => void
    const cancelGate = new Promise<void>((resolve) => {
      releaseCancel = resolve
    })
    let blocked = false
    class BlockingCancelEngine extends FakeVoiceEngine {
      override async cancelGeneration(
        input: Parameters<FakeVoiceEngine['cancelGeneration']>[0],
      ): Promise<void> {
        if (input.generation === 1 && !blocked) {
          blocked = true
          await cancelGate
        }
        await super.cancelGeneration(input)
      }
    }
    const engine = new BlockingCancelEngine()
    const retained = await createLocalHarness(engine)
    sendControl(retained.browser, retained.streamId, 'start', 0, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(retained.browser, retained.streamId, 'speech_confirmed', 1, {
      utteranceId: 'retained-1',
    })
    await vi.waitFor(() => expect(engineCalls(engine, 'stt.start')).toHaveLength(1))
    engine.emit({
      type: 'final',
      streamId: retained.streamId,
      generation: 1,
      utteranceId: 'retained-1',
      text: 'Interrupt this response.',
    })
    await vi.waitFor(() => expect(retained.manager.send).toHaveBeenCalledOnce())

    let closed = false
    void closeEvent(retained.browser).then(() => {
      closed = true
    })
    sendControl(retained.browser, retained.streamId, 'speech_confirmed', 2, {
      utteranceId: 'retained-2',
    })
    await vi.waitFor(() => expect(blocked).toBe(true))
    for (let sequence = 0; sequence < 30; sequence += 1) {
      retained.browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(
        2,
        sequence,
        new Int16Array(1_280),
      ))))
    }
    await vi.waitFor(() => {
      expect(engineCalls(engine, 'stt.accept').filter(
        (call) => call.generation === 2,
      ).map((call) => call.sequence)).toEqual(
        Array.from({ length: 30 }, (_, sequence) => sequence),
      )
    })
    expect(closed).toBe(false)

    releaseCancel()
    await vi.waitFor(() => expect(engineCalls(engine, 'cancel'))
      .toContainEqual(expect.objectContaining({ generation: 1 })))
    expect(closed).toBe(false)
  })

  it('rejects stale manager and audio work across rapid 7 to 8 to 9 turns', async () => {
    const rapid = await createLocalHarness()
    sendControl(rapid.browser, rapid.streamId, 'start', 7, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(rapid.browser, rapid.streamId, 'speech_confirmed', 8, {
      utteranceId: 'rapid-8',
    })
    await vi.waitFor(() => expect(engineCalls(rapid.engine, 'stt.start')).toHaveLength(1))
    rapid.engine.emit({
      type: 'final',
      streamId: rapid.streamId,
      generation: 8,
      utteranceId: 'rapid-8',
      text: 'First generation.',
    })
    await vi.waitFor(() => expect(rapid.manager.send).toHaveBeenCalledOnce())
    const first = rapid.manager.submitted[0]

    sendControl(rapid.browser, rapid.streamId, 'speech_confirmed', 9, {
      utteranceId: 'rapid-9',
    })
    await vi.waitFor(() => expect(rapid.manager.cancelMessage)
      .toHaveBeenCalledWith(first.id))
    expect(rapid.manager.cancel).not.toHaveBeenCalled()
    rapid.manager.emitDelta('stale-assistant', 'Stale manager delta.')
    rapid.engine.emit(playback(
      rapid.streamId,
      8,
      'stale-segment',
      0,
      new Int16Array([99]),
    ))
    rapid.engine.emit({
      type: 'final',
      streamId: rapid.streamId,
      generation: 8,
      utteranceId: 'rapid-8',
      text: 'Duplicate stale final.',
    })
    await Promise.resolve()
    expect(engineCalls(rapid.engine, 'tts.synthesize')).toEqual([])
    expect(rapid.browserInbox.audio()).toEqual([])

    rapid.engine.emit({
      type: 'final',
      streamId: rapid.streamId,
      generation: 9,
      utteranceId: 'rapid-9',
      text: 'Current generation.',
    })
    await vi.waitFor(() => expect(rapid.manager.send).toHaveBeenCalledTimes(2))
    const second = rapid.manager.submitted[1]
    expect([first.content, second.content]).toEqual([
      'First generation.',
      'Current generation.',
    ])
    rapid.manager.emitDelta('current-assistant', 'Current spoken reply. Pending')
    await vi.waitFor(() => {
      expect(engineCalls(rapid.engine, 'tts.synthesize').map((call) => ({
        generation: call.generation,
        text: call.text,
      }))).toEqual([
        { generation: 9, text: 'Current spoken reply.' },
      ])
    })
    await rapid.manager.emitAssistant({
      id: 'stale-assistant',
      role: 'assistant',
      replyTo: first.id,
      content: 'Stale final reply.',
      createdAt: '2026-10-18T00:00:03.000Z',
    })
    expect(engineCalls(rapid.engine, 'tts.synthesize')).toHaveLength(1)
  })

  it('turns a worker crash into an explicit fatal browser failure', async () => {
    const crash = await createLocalHarness()
    const crashClose = closeEvent(crash.browser)
    crash.engine.emit({ type: 'fatal_error', message: 'worker exited' })
    await crash.browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'error'
        && message.code === 'voice_backend_failed'
        && message.fatal,
    )
    expect((await crashClose).code).toBe(1011)
    expect(crash.manager.send).not.toHaveBeenCalled()
  })

  it('fails closed when the browser consumes playback too slowly', async () => {
    const slow = await createLocalHarness(
      new FakeVoiceEngine(),
      {
        ...DEFAULT_VOICE_BACKEND_LIMITS,
        maxFrameBytes: 1_024,
        maxQueueBytes: 2_048,
        maxOutputQueueBytes: 2_048,
      },
    )
    sendControl(slow.browser, slow.streamId, 'start', 40, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(slow.browser, slow.streamId, 'speech_confirmed', 41, {
      utteranceId: 'slow-41',
    })
    await vi.waitFor(() => expect(engineCalls(slow.engine, 'stt.start')).toHaveLength(1))
    slow.engine.emit({
      type: 'final',
      streamId: slow.streamId,
      generation: 41,
      utteranceId: 'slow-41',
      text: 'Create playback.',
    })
    await vi.waitFor(() => expect(slow.manager.send).toHaveBeenCalledOnce())
    slow.manager.emitDelta('slow-assistant', 'Slow playback sentence. Pending')
    await vi.waitFor(() => expect(engineCalls(slow.engine, 'tts.synthesize')).toHaveLength(1))
    const slowSpeech = engineCalls(slow.engine, 'tts.synthesize')[0]
    const slowClose = closeEvent(slow.browser)
    const maximumSamples = Math.floor(
      (1_024 - 24 - Buffer.byteLength(slowSpeech.segmentId)) / 2,
    )
    for (let sequence = 0; sequence < 16; sequence += 1) {
      slow.engine.emit(playback(
        slow.streamId,
        41,
        slowSpeech.segmentId,
        sequence,
        new Int16Array(maximumSamples),
      ))
    }
    await vi.waitFor(() => expect(slow.backend.busy()).toBe(false))
    expect((await slowClose).code).toBe(1013)
    expect(slow.manager.send).toHaveBeenCalledOnce()
    const eventClosed = closeEvent(slow.events.socket)
    slow.events.socket.terminate()
    await eventClosed
    await slow.app.close()
  })

  it('closes explicitly when Oracle cancellation exceeds its timeout', async () => {
    const timeout = await createLocalHarness()
    sendControl(timeout.browser, timeout.streamId, 'start', 50, {
      language: 'en',
      defaults,
      answerOnly: true,
    })
    sendControl(timeout.browser, timeout.streamId, 'speech_confirmed', 51, {
      utteranceId: 'timeout-51',
    })
    await vi.waitFor(() => expect(engineCalls(timeout.engine, 'stt.start')).toHaveLength(1))
    timeout.engine.emit({
      type: 'final',
      streamId: timeout.streamId,
      generation: 51,
      utteranceId: 'timeout-51',
      text: 'Start a voice-owned manager turn.',
    })
    await vi.waitFor(() => expect(timeout.manager.send).toHaveBeenCalledOnce())
    let releaseCancel!: () => void
    timeout.manager.cancelMessage.mockImplementationOnce(
      () => new Promise<ManagerMessage>((resolve) => {
        releaseCancel = () => resolve(timeout.manager.submitted[0])
      }),
    )
    vi.useFakeTimers()
    const timeoutClose = closeEvent(timeout.browser)
    sendControl(timeout.browser, timeout.streamId, 'speech_confirmed', 52, {
      utteranceId: 'timeout-52',
    })
    await vi.waitFor(() => expect(timeout.manager.cancelMessage).toHaveBeenCalledOnce())
    await vi.advanceTimersByTimeAsync(5_001)
    releaseCancel()
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(1_001)
    vi.useRealTimers()
    await timeout.browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'error'
        && message.code === 'oracle_cancel_timeout',
    )
    expect((await timeoutClose).code).toBe(1011)
    expect(timeout.manager.send).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(timeout.backend.busy()).toBe(false))
    const eventClosed = closeEvent(timeout.events.socket)
    timeout.events.socket.terminate()
    await eventClosed
    await timeout.app.close()
  })

  it('reports unavailable voice for deterministic dictation fallback', async () => {
    const root = await testRoot('oracle-voice-unavailable')
    const manager = await createManager(root)
    const built = await buildApp({
      dataDirectory: root,
      logger: false,
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: manager as unknown as ManagerAgent,
    })
    const unavailable = await listen(built, root)
    const capability = await requestJson(
      unavailable.baseUrl,
      'GET',
      '/api/oracle-voice/capabilities',
      trusted,
    )
    expect(capability.body).toMatchObject({
      available: false,
      reason: expect.stringContaining('disabled'),
    })
    expect((await requestJson(
      unavailable.baseUrl,
      'POST',
      '/api/oracle-voice/tickets',
      trusted,
    )).statusCode).toBe(503)
    expect(manager.send).not.toHaveBeenCalled()
  })
})
