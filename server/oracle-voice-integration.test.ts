import { EventEmitter } from 'node:events'
import { mkdir, readdir, readFile, rm } from 'node:fs/promises'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
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
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSnapshot,
} from '../shared/manager.js'
import { buildApp } from './app.js'
import type { ManagerAgent } from './manager-agent.js'
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
    options?: { answerOnly?: boolean },
  ): Promise<ManagerMessage> {
    if (this.failSend) throw this.failSend
    const message: ManagerMessage = {
      id: `voice-user-${this.send.mock.calls.length}`,
      role: 'user',
      content,
      createdAt: '2026-10-18T00:00:00.000Z',
      state: 'running',
      ...(options?.answerOnly ? { answerOnly: true } : {}),
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

async function createManager(root: string): Promise<StoredManager> {
  const store = new ManagerStore(path.join(root, 'oracle-manager'))
  await store.initialize()
  return new StoredManager(store)
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
    const test = await createLocalHarness()
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
      answerOnly: true,
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
    expect(test.manager.send).not.toHaveBeenCalled()

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

    await vi.waitFor(() => expect(test.manager.send).toHaveBeenCalledOnce())
    expect(test.manager.send).toHaveBeenCalledWith(
      'Run the focused tests.',
      defaults,
      { answerOnly: true },
    )
    const userMessage = test.manager.submitted[0]
    expect(userMessage).toMatchObject({
      id: 'voice-user-1',
      role: 'user',
      content: 'Run the focused tests.',
      state: 'running',
      answerOnly: true,
    })
    expect(await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.message'
        && event.message.id === userMessage.id,
    )).toEqual({
      type: 'manager.message',
      message: userMessage,
    })
    expect(test.browserInbox.controls<VoiceServerControl>(
      (message) => message.type === 'final',
    )).toEqual([])

    const firstSnapshot = 'First stable sentence.'
    test.manager.emitDelta('assistant-1', firstSnapshot)
    expect(await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.delta'
        && event.content === firstSnapshot,
    )).toEqual({
      type: 'manager.delta',
      messageId: 'assistant-1',
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

    const secondSnapshot =
      'First stable sentence. Second stable sentence.'
    test.manager.emitDelta('assistant-1', secondSnapshot)
    expect(await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.delta'
        && event.content === secondSnapshot,
    )).toMatchObject({
      type: 'manager.delta',
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

    const finalContent = `${secondSnapshot} Final stored suffix.`
    const assistant: ManagerMessage = {
      id: 'assistant-1',
      role: 'assistant',
      replyTo: userMessage.id,
      content: finalContent,
      createdAt: '2026-10-18T00:00:01.000Z',
    }
    await test.manager.emitAssistant(assistant)
    expect(await test.events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.message'
        && event.message.id === assistant.id,
    )).toEqual({ type: 'manager.message', message: assistant })
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
    expect(visibleSnapshots).toEqual([firstSnapshot, secondSnapshot])
    const spoken = engineCalls(test.engine, 'tts.synthesize').map((call) => call.text)
    expect(spoken.slice(0, 2)).toEqual([
      'First stable sentence.',
      'Second stable sentence.',
    ])
    expect(spoken.every((text) => finalContent.includes(text))).toBe(true)
    expect(test.manager.store.messages()).toEqual([userMessage, assistant])
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

  it('returns one failed final for composer recovery but never echoes a successful final', async () => {
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
    failed.engine.emit({
      type: 'final',
      streamId: failed.streamId,
      generation: 1,
      utteranceId: 'failed-1',
      text: 'Recover this transcript.',
    })
    const returned = await failed.browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'final',
    )
    expect(returned).toMatchObject({
      type: 'final',
      text: 'Recover this transcript.',
    })
    await failed.browserInbox.waitForControl<VoiceServerControl>(
      (message) => message.type === 'error'
        && message.code === 'oracle_send_failed',
    )
    expect(failed.browserInbox.controls<VoiceServerControl>(
      (message) => message.type === 'final',
    )).toHaveLength(1)
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
  })

  it('relays incrementally through an authenticated paired node without hub-local models', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_VOICE_COMPUTER', 'Speech node')

    const nodeRoot = await testRoot('oracle-voice-node')
    const nodeVoice = availableBackend()
    const nodeBuilt = await buildApp({
      dataDirectory: nodeRoot,
      logger: false,
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
      logger: false,
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
      defaults,
      answerOnly: true,
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

    browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(21, 0))))
    await vi.waitFor(() => {
      expect(engineCalls(nodeVoice.engine, 'stt.accept').map((call) => call.sequence))
        .toEqual([0])
    })
    expect(engineCalls(nodeVoice.engine, 'stt.end')).toEqual([])
    browser.send(Buffer.from(encodeVoiceAudioFrame(microphone(21, 1))))
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
    nodeVoice.engine.emit({
      type: 'final',
      streamId: hello.streamId,
      generation: 21,
      utteranceId: 'remote-21',
      text: 'Run on the paired node.',
    })
    await vi.waitFor(() => expect(manager.send).toHaveBeenCalledOnce())
    expect(manager.send).toHaveBeenCalledWith(
      'Run on the paired node.',
      defaults,
      { answerOnly: true },
    )
    const user = manager.submitted[0]
    manager.emitDelta('remote-assistant', 'Remote reply streams.')
    await events.waitForControl<ManagerEvent>(
      (event) => event.type === 'manager.delta'
        && event.content === 'Remote reply streams.',
    )
    await vi.waitFor(() => {
      expect(engineCalls(nodeVoice.engine, 'tts.synthesize').map((call) => call.text))
        .toEqual(['Remote reply streams.'])
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
      content: 'Remote reply streams.',
      createdAt: '2026-10-18T00:00:02.000Z',
    })

    expect(await fileInventory(nodeRoot)).toEqual(nodeFilesBefore)
    expect(Object.keys(await fileInventory(nodeRoot)).filter(
      (name) => /\.(?:pcm|wav|webm|ogg|mp3)$/i.test(name),
    )).toEqual([])

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
    expect(manager.send).toHaveBeenCalledOnce()
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
      test.manager.emitDelta('phase-assistant', 'One spoken sentence.')
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
    await vi.waitFor(() => expect(rapid.manager.cancel).toHaveBeenCalledOnce())
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
    rapid.manager.emitDelta('current-assistant', 'Current spoken reply.')
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
    slow.manager.emitDelta('slow-assistant', 'Slow playback sentence.')
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
    timeout.manager.emitStatus('working')
    await new Promise<void>((resolve) => setImmediate(resolve))
    let releaseCancel!: () => void
    timeout.manager.cancel.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        releaseCancel = resolve
      }),
    )
    vi.useFakeTimers()
    const timeoutClose = closeEvent(timeout.browser)
    sendControl(timeout.browser, timeout.streamId, 'speech_confirmed', 51, {
      utteranceId: 'timeout-51',
    })
    await vi.waitFor(() => expect(timeout.manager.cancel).toHaveBeenCalledOnce())
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
    expect(timeout.manager.send).not.toHaveBeenCalled()
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
