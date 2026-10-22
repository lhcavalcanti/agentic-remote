import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import {
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  encodeVoiceAudioFrame,
  type VoiceAudioFrame,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSubmissionOptions,
  ManagerSnapshot,
} from '../shared/manager.js'
import { buildApp } from './app.js'
import type { ManagerAgent } from './manager-agent.js'
import { ManagerStore } from './manager-store.js'
import {
  FakeVoiceEngine,
  FakeVoiceEngineFactory,
  type FakeVoiceEngineCall,
  type VoiceStartUtterance,
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
const otherAllowed = {
  host: 'other.test',
  origin: 'https://other.test',
}
const roots: string[] = []
const apps: Array<Awaited<ReturnType<typeof buildApp>>['app']> = []
const sockets = new Set<WebSocket>()

const config: EnabledOracleVoiceConfig = {
  enabled: true,
  language: 'en',
  threads: 2,
  endpointMs: 800,
  stt: {
    profile: 'zipformer',
    modelDirectory: '/not-used/security-stt',
  },
  tts: {
    binary: '/not-used/security-piper',
    model: '/not-used/security-voice.onnx',
    config: '/not-used/security-voice.json',
    sampleRate: 22_050,
  },
}

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

class SecurityManager extends EventEmitter<{ event: [event: ManagerEvent] }> {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)
  readonly cancel = vi.fn(async () => undefined)
  readonly send = vi.fn(this.sendMessage.bind(this))

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

  private async sendMessage(
    content: string,
    _defaults?: ManagerClientDefaults,
    options?: ManagerSubmissionOptions,
  ): Promise<ManagerMessage> {
    const message: ManagerMessage = {
      id: `stored-${this.send.mock.calls.length}`,
      role: 'user',
      content,
      createdAt: '2026-10-18T00:00:00.000Z',
      state: 'running',
      ...(options?.answerOnly ? { answerOnly: true } : {}),
    }
    await this.store.upsertMessage(message)
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

class Inbox {
  readonly controls: VoiceServerControl[] = []
  private readonly waiters = new Set<() => void>()

  constructor(readonly socket: WebSocket) {
    socket.on('message', (data, isBinary) => {
      if (!isBinary) {
        this.controls.push(
          JSON.parse(rawBuffer(data).toString('utf8')) as VoiceServerControl,
        )
      }
      for (const wake of this.waiters) wake()
    })
  }

  async waitFor(
    predicate: (control: VoiceServerControl) => boolean,
  ): Promise<VoiceServerControl> {
    const current = this.controls.find(predicate)
    if (current) return current
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters.delete(check)
        reject(new Error('Timed out waiting for security WebSocket evidence'))
      }, 5_000)
      const check = () => {
        const value = this.controls.find(predicate)
        if (!value) return
        clearTimeout(timer)
        this.waiters.delete(check)
        resolve(value)
      }
      this.waiters.add(check)
    })
  }
}

interface Runtime {
  app: Awaited<ReturnType<typeof buildApp>>['app']
  baseUrl: string
  wsUrl: string
  root: string
  engine: FakeVoiceEngine
  manager: SecurityManager
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

async function createManager(root: string): Promise<SecurityManager> {
  const store = new ManagerStore(path.join(root, 'oracle-manager'))
  await store.initialize()
  return new SecurityManager(store)
}

function voiceBackend(
  engine = new FakeVoiceEngine(),
  limits?: VoiceBackendSessionLimits,
): LocalVoiceBackend {
  return new LocalVoiceBackend(
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
  )
}

async function localRuntime(options: {
  engine?: FakeVoiceEngine
  limits?: VoiceBackendSessionLimits
  logger?: false | {
    level: string
    stream: { write(line: string): void }
  }
} = {}): Promise<Runtime> {
  const root = await testRoot('oracle-voice-security')
  const manager = await createManager(root)
  const engine = options.engine ?? new FakeVoiceEngine()
  const built = await buildApp({
    dataDirectory: root,
    logger: (options.logger ?? false) as boolean,
    service: new TestSessionService() as unknown as SessionService,
    managerAgent: manager as unknown as ManagerAgent,
    voiceBackend: voiceBackend(engine, options.limits),
  })
  apps.push(built.app)
  await built.app.listen({ host: '127.0.0.1', port: 0 })
  const address = built.app.server.address() as AddressInfo
  return {
    app: built.app,
    baseUrl: `http://127.0.0.1:${address.port}`,
    wsUrl: `ws://127.0.0.1:${address.port}`,
    root,
    engine,
    manager,
  }
}

async function issueTicket(
  runtime: Pick<Runtime, 'baseUrl'>,
  headers = trusted,
): Promise<string> {
  const response = await requestJson(
    runtime.baseUrl,
    'POST',
    '/api/oracle-voice/tickets',
    headers,
  )
  expect(response.statusCode).toBe(201)
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

function connect(
  url: string,
  headers: {
    host?: string
    origin?: string
    authorization?: string
  } = {},
): Promise<{ socket: WebSocket; inbox: Inbox }> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, {
      headers: {
        ...(headers.host ? { host: headers.host } : {}),
        ...(headers.authorization ? { authorization: headers.authorization } : {}),
      },
      ...(headers.origin ? { origin: headers.origin } : {}),
    })
    const inbox = new Inbox(socket)
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

function largeManagerDefaults(): ManagerClientDefaults {
  return {
    folders: Object.fromEntries(Array.from({ length: 9 }, (_, index) => [
      `computer-${index}`,
      `/${'voice-control-path/'.repeat(200)}${index}`,
    ])),
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

async function allFiles(root: string): Promise<Array<{
  name: string
  contents: Buffer
}>> {
  const result: Array<{ name: string; contents: Buffer }> = []
  const walk = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) await walk(full)
      else result.push({
        name: path.relative(root, full),
        contents: await readFile(full),
      })
    }
  }
  await walk(root)
  return result
}

async function configFixture(): Promise<string> {
  const root = await testRoot('oracle-voice-config-security')
  await mkdir(path.join(root, 'models', 'stt'), { recursive: true })
  await mkdir(path.join(root, 'bin'), { recursive: true })
  await writeFile(path.join(root, 'models', 'stt', 'encoder.onnx'), 'model')
  await writeFile(path.join(root, 'bin', 'piper'), 'binary')
  await writeFile(path.join(root, 'models', 'voice.onnx'), 'voice')
  await writeFile(path.join(root, 'models', 'voice.json'), JSON.stringify({
    audio: { sample_rate: 22_050 },
  }))
  return root
}

function enabledEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    AGENTIC_REMOTE_ALLOWED_ORIGINS: trusted.origin,
    AGENTIC_REMOTE_ORACLE_VOICE: 'on',
    AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: 'models/stt',
    AGENTIC_REMOTE_VOICE_STT_PROFILE: 'zipformer',
    AGENTIC_REMOTE_VOICE_LANGUAGE: 'en',
    AGENTIC_REMOTE_VOICE_THREADS: '2',
    AGENTIC_REMOTE_VOICE_ENDPOINT_MS: '800',
    AGENTIC_REMOTE_VOICE_TTS_BIN: 'bin/piper',
    AGENTIC_REMOTE_VOICE_TTS_MODEL: 'models/voice.onnx',
    AGENTIC_REMOTE_VOICE_TTS_CONFIG: 'models/voice.json',
    ...overrides,
  }
}

beforeEach(() => {
  vi.stubEnv(
    'AGENTIC_REMOTE_ALLOWED_ORIGINS',
    `${trusted.origin},${otherAllowed.origin}`,
  )
  vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
})

afterEach(async () => {
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

describe('Oracle voice transport security and privacy', () => {
  it('binds Host, Origin, client, and one-time tickets while enforcing the cap', async () => {
    const runtime = await localRuntime()
    expect((await requestJson(
      runtime.baseUrl,
      'POST',
      '/api/oracle-voice/tickets',
      { host: 'evil.test', origin: trusted.origin },
    )).statusCode).toBe(403)
    expect((await requestJson(
      runtime.baseUrl,
      'POST',
      '/api/oracle-voice/tickets',
      { host: trusted.host, origin: 'https://evil.test' },
    )).statusCode).toBe(403)

    const mismatched = await issueTicket(runtime)
    await expect(connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${mismatched}`,
      otherAllowed,
    )).rejects.toMatchObject({ statusCode: 401 })
    await expect(connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${mismatched}`,
      trusted,
    )).rejects.toMatchObject({ statusCode: 401 })

    const badHost = await issueTicket(runtime)
    await expect(connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${badHost}`,
      { host: 'evil.test', origin: trusted.origin },
    )).rejects.toMatchObject({ statusCode: 403 })

    const singleUse = await issueTicket(runtime)
    const accepted = await connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${singleUse}`,
      trusted,
    )
    await accepted.inbox.waitFor((message) => message.type === 'hello')
    await expect(connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${singleUse}`,
      trusted,
    )).rejects.toMatchObject({ statusCode: 401 })
    await closeSocket(accepted.socket)

    const issued: string[] = []
    for (let index = 0; index < 65; index += 1) {
      issued.push(await issueTicket(runtime))
    }
    await expect(connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${issued[0]}`,
      trusted,
    )).rejects.toMatchObject({ statusCode: 401 })
    const newest = await connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${issued.at(-1)!}`,
      trusted,
    )
    await newest.inbox.waitFor((message) => message.type === 'hello')
  })

  it('requires a valid bearer for the actual node WebSocket upgrade', async () => {
    const root = await testRoot('oracle-voice-node-security')
    const engine = new FakeVoiceEngine()
    const logs: string[] = []
    const built = await buildApp({
      dataDirectory: root,
      logger: {
        level: 'info',
        stream: {
          write: (line: string) => {
            logs.push(line)
          },
        },
      } as unknown as boolean,
      role: 'node',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: false,
      voiceBackend: voiceBackend(engine),
    })
    apps.push(built.app)
    await built.app.listen({ host: '127.0.0.1', port: 0 })
    const address = built.app.server.address() as AddressInfo
    const endpoint = `ws://127.0.0.1:${address.port}/node-api/oracle-voice`
      + `?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=security-node`

    await expect(connect(endpoint)).rejects.toMatchObject({ statusCode: 401 })
    await expect(connect(endpoint, {
      authorization: 'Bearer invalid-node-token',
    })).rejects.toMatchObject({ statusCode: 401 })

    const valid = await connect(endpoint, {
      authorization: `Bearer ${built.identity.token}`,
    })
    expect(await valid.inbox.waitFor(
      (message) => message.type === 'hello',
    )).toMatchObject({
      type: 'hello',
      streamId: 'security-node',
      capabilities: {
        available: true,
        sttProfile: 'zipformer',
      },
    })
    const logText = logs.join('')
    expect(logText).not.toContain(built.identity.token)
    expect(logText).not.toContain('invalid-node-token')
  })

  it('accepts valid text controls larger than the binary frame limit', async () => {
    const runtime = await localRuntime()
    const ticket = await issueTicket(runtime)
    const hub = await connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${ticket}`,
      trusted,
    )
    const hubHello = await hub.inbox.waitFor((message) => message.type === 'hello')
    sendControl(hub.socket, hubHello.streamId, 'start', 0, {
      language: 'en',
      defaults: largeManagerDefaults(),
      answerOnly: true,
    })
    await expect(hub.inbox.waitFor(
      (message) => message.type === 'state' && message.state === 'ready',
    )).resolves.toMatchObject({ type: 'state', state: 'ready' })

    const root = await testRoot('oracle-voice-node-control-limit')
    const built = await buildApp({
      dataDirectory: root,
      logger: false,
      role: 'node',
      service: new TestSessionService() as unknown as SessionService,
      managerAgent: false,
      voiceBackend: voiceBackend(),
    })
    apps.push(built.app)
    await built.app.listen({ host: '127.0.0.1', port: 0 })
    const address = built.app.server.address() as AddressInfo
    const node = await connect(
      `ws://127.0.0.1:${address.port}/node-api/oracle-voice`
        + `?protocol=${ORACLE_VOICE_PROTOCOL}&streamId=large-node-control`,
      { authorization: ['Bearer', built.identity.token].join(' ') },
    )
    const nodeHello = await node.inbox.waitFor((message) => message.type === 'hello')
    sendControl(node.socket, nodeHello.streamId, 'start', 0, {
      language: 'en',
      defaults: largeManagerDefaults(),
      answerOnly: true,
    })
    await expect(node.inbox.waitFor(
      (message) => message.type === 'state' && message.state === 'ready',
    )).resolves.toMatchObject({ type: 'state', state: 'ready' })
  })

  it('rejects oversized and malformed binary plus invalid controls over the real socket', async () => {
    const oversized = await localRuntime()
    const oversizedTicket = await issueTicket(oversized)
    const oversizedClient = await connect(
      `${oversized.wsUrl}/api/oracle-voice?ticket=${oversizedTicket}`,
      trusted,
    )
    await oversizedClient.inbox.waitFor((message) => message.type === 'hello')
    const oversizedClose = closeEvent(oversizedClient.socket)
    oversizedClient.socket.send(Buffer.alloc(
      DEFAULT_VOICE_BACKEND_LIMITS.maxFrameBytes + 1,
    ))
    expect((await oversizedClose).code).toBe(1009)
    expect(oversized.manager.send).not.toHaveBeenCalled()

    const malformed = await localRuntime()
    const malformedTicket = await issueTicket(malformed)
    const malformedClient = await connect(
      `${malformed.wsUrl}/api/oracle-voice?ticket=${malformedTicket}`,
      trusted,
    )
    await malformedClient.inbox.waitFor((message) => message.type === 'hello')
    const malformedClose = closeEvent(malformedClient.socket)
    malformedClient.socket.send(Buffer.alloc(24, 0x7f))
    expect((await malformedClose).code).toBe(1008)
    expect(malformed.manager.send).not.toHaveBeenCalled()

    const invalidJson = await localRuntime()
    const invalidTicket = await issueTicket(invalidJson)
    const invalidClient = await connect(
      `${invalidJson.wsUrl}/api/oracle-voice?ticket=${invalidTicket}`,
      trusted,
    )
    await invalidClient.inbox.waitFor((message) => message.type === 'hello')
    const invalidClose = closeEvent(invalidClient.socket)
    invalidClient.socket.send('{not-json')
    expect((await invalidClose).code).toBe(1007)

    const forbiddenControl = await localRuntime()
    const forbiddenTicket = await issueTicket(forbiddenControl)
    const forbiddenClient = await connect(
      `${forbiddenControl.wsUrl}/api/oracle-voice?ticket=${forbiddenTicket}`,
      trusted,
    )
    const hello = await forbiddenClient.inbox.waitFor(
      (message) => message.type === 'hello',
    )
    const forbiddenClose = closeEvent(forbiddenClient.socket)
    sendControl(forbiddenClient.socket, hello.streamId, 'synthesize', 0, {
      segmentId: 'browser-injected',
      text: 'Browser must not synthesize arbitrary text',
    })
    expect((await forbiddenClose).code).toBe(1008)
    expect(engineCalls(forbiddenControl.engine, 'tts.synthesize')).toEqual([])
  })

  it('bounds a control flood while the speech engine is stalled', async () => {
    let releaseStart!: () => void
    const startGate = new Promise<void>((resolve) => {
      releaseStart = resolve
    })
    class BlockingEngine extends FakeVoiceEngine {
      override async start(input: VoiceStartUtterance): Promise<void> {
        await startGate
        await super.start(input)
      }
    }
    const runtime = await localRuntime({
      engine: new BlockingEngine(),
      limits: {
        ...DEFAULT_VOICE_BACKEND_LIMITS,
        maxQueueBytes: 1_024,
      },
    })
    const ticket = await issueTicket(runtime)
    const client = await connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${ticket}`,
      trusted,
    )
    const hello = await client.inbox.waitFor((message) => message.type === 'hello')
    sendControl(client.socket, hello.streamId, 'start', 0, {
      language: 'en',
      defaults: {},
      answerOnly: true,
    })
    sendControl(client.socket, hello.streamId, 'speech_confirmed', 1, {
      utteranceId: 'flood-1',
    })
    const closed = closeEvent(client.socket)
    for (let index = 0; index < 50; index += 1) {
      sendControl(client.socket, hello.streamId, 'heartbeat', 1, {
        timestamp: index,
      })
    }
    expect((await closed).code).toBe(1013)
    releaseStart()
    expect(runtime.manager.send).not.toHaveBeenCalled()
  })

  it('rejects a browser language absent from the advertised capability', async () => {
    const runtime = await localRuntime()
    const ticket = await issueTicket(runtime)
    const client = await connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${ticket}`,
      trusted,
    )
    const hello = await client.inbox.waitFor((message) => message.type === 'hello')
    expect(hello.type === 'hello' && hello.capabilities.languages).toEqual(['en'])
    const closed = closeEvent(client.socket)
    sendControl(client.socket, hello.streamId, 'start', 0, {
      language: 'pt-BR',
      defaults: {},
      answerOnly: true,
    })
    expect((await closed).code).toBe(1008)
    expect(runtime.manager.send).not.toHaveBeenCalled()
  })

  it('keeps invalid, forbidden, and escaping model configuration unavailable', async () => {
    const fixture = await configFixture()
    const outside = path.join(fixture, 'outside.onnx')
    await writeFile(outside, 'outside')
    await symlink(
      outside,
      path.join(fixture, 'models', 'stt', 'escape.onnx'),
    )

    const cases: Array<{
      name: string
      env: NodeJS.ProcessEnv
      reason: string
    }> = [
      {
        name: 'unsupported profile',
        env: enabledEnv({ AGENTIC_REMOTE_VOICE_STT_PROFILE: 'shell-command' }),
        reason: 'zipformer or nemotron',
      },
      {
        name: 'absolute forbidden path',
        env: enabledEnv({
          AGENTIC_REMOTE_VOICE_TTS_MODEL: '/etc/passwd',
        }),
        reason: 'must stay inside',
      },
      {
        name: 'escaping symlink',
        env: enabledEnv(),
        reason: 'must stay inside',
      },
      {
        name: 'unsupported TTS config',
        env: enabledEnv(),
        reason: 'from 8000 to 192000',
      },
    ]

    for (const scenario of cases) {
      if (scenario.name === 'escaping symlink') {
        await writeFile(
          path.join(fixture, 'models', 'voice.json'),
          JSON.stringify({ audio: { sample_rate: 22_050 } }),
        )
      }
      if (scenario.name === 'unsupported TTS config') {
        await rm(path.join(fixture, 'models', 'stt', 'escape.onnx'))
        await writeFile(
          path.join(fixture, 'models', 'voice.json'),
          JSON.stringify({ audio: { sample_rate: 7_999 } }),
        )
      }
      for (const [name, value] of Object.entries(scenario.env)) {
        vi.stubEnv(name, value)
      }
      const manager = await createManager(fixture)
      const built = await buildApp({
        dataDirectory: fixture,
        logger: false,
        service: new TestSessionService() as unknown as SessionService,
        managerAgent: manager as unknown as ManagerAgent,
      })
      apps.push(built.app)
      await built.app.listen({ host: '127.0.0.1', port: 0 })
      const address = built.app.server.address() as AddressInfo
      const baseUrl = `http://127.0.0.1:${address.port}`
      const capability = await requestJson(
        baseUrl,
        'GET',
        '/api/oracle-voice/capabilities',
        trusted,
      )
      expect(capability.body, scenario.name).toMatchObject({
        available: false,
        reason: expect.stringContaining(scenario.reason),
      })
      expect((await requestJson(
        baseUrl,
        'POST',
        '/api/oracle-voice/tickets',
        trusted,
      )).statusCode).toBe(503)
      await built.app.close()
      apps.splice(apps.indexOf(built.app), 1)
    }
  })

  it('persists one normal manager message while keeping voice artifacts and secrets out', async () => {
    const logs: string[] = []
    const runtime = await localRuntime({
      logger: {
        level: 'info',
        stream: { write: (line: string) => logs.push(line) },
      },
    })
    const ticket = await issueTicket(runtime)
    const client = await connect(
      `${runtime.wsUrl}/api/oracle-voice?ticket=${ticket}`,
      trusted,
    )
    const hello = await client.inbox.waitFor((message) => message.type === 'hello')
    const transcript = 'sensitive transcript 7f0efcc0'
    const samples = new Int16Array([31_111, -31_111, 12_345, -12_345])
    sendControl(client.socket, hello.streamId, 'start', 0, {
      language: 'en',
      defaults: {},
      answerOnly: true,
    })
    sendControl(client.socket, hello.streamId, 'speech_confirmed', 1, {
      utteranceId: 'privacy-1',
    })
    await vi.waitFor(() => expect(engineCalls(runtime.engine, 'stt.start')).toHaveLength(1))
    const frame: VoiceAudioFrame = {
      direction: 'microphone',
      generation: 1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples,
    }
    client.socket.send(Buffer.from(encodeVoiceAudioFrame(frame)))
    await vi.waitFor(() => expect(engineCalls(runtime.engine, 'stt.accept')).toHaveLength(1))
    runtime.engine.emit({
      type: 'final',
      streamId: hello.streamId,
      generation: 1,
      utteranceId: 'privacy-1',
      text: transcript,
    })
    runtime.engine.emit({
      type: 'final',
      streamId: hello.streamId,
      generation: 1,
      utteranceId: 'privacy-1',
      text: transcript,
    })
    await vi.waitFor(() => expect(runtime.manager.send).toHaveBeenCalledOnce())
    expect(runtime.manager.send).toHaveBeenCalledWith(
      transcript,
      {},
      { answerOnly: true, source: 'voice' },
    )
    await runtime.manager.store.flush()
    await closeSocket(client.socket)

    const logText = logs.join('')
    expect(logText).not.toContain(transcript)
    expect(logText).not.toContain(ticket)
    expect(logText).not.toContain(hello.streamId)
    expect(logText).not.toContain(samples.join(','))

    const files = await allFiles(runtime.root)
    expect(files.filter(({ name }) =>
      /\.(?:pcm|wav|webm|ogg|mp3|m4a)$/i.test(name),
    )).toEqual([])
    const pcmBytes = Buffer.from(
      samples.buffer,
      samples.byteOffset,
      samples.byteLength,
    )
    expect(files.some(({ contents }) => contents.includes(pcmBytes))).toBe(false)
    const transcriptFiles = files.filter(({ contents }) =>
      contents.includes(Buffer.from(transcript)),
    )
    expect(transcriptFiles.map(({ name }) => name)).toEqual([
      'oracle-manager/conversation.jsonl',
    ])
    expect(runtime.manager.store.messages()).toEqual([
      expect.objectContaining({
        role: 'user',
        content: transcript,
        answerOnly: true,
      }),
    ])
  })
})
