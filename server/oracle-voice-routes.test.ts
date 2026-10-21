import { EventEmitter } from 'node:events'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import type {
  ManagerClientDefaults,
  ManagerMessage,
  ManagerSubmissionOptions,
  ManagerSnapshot,
} from '../shared/manager.js'
import type { VoiceBackendCapability } from '../shared/contracts.js'
import { buildApp } from './app.js'
import type { ManagerAgent } from './manager-agent.js'
import type { OracleVoiceManager } from './oracle-voice-coordinator.js'
import {
  FakeVoiceEngine,
  type VoiceEngineFactory,
  type VoiceEngineSession,
} from './oracle-voice-engine.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import { registerOracleVoiceRoutes } from './oracle-voice-routes.js'
import {
  LocalVoiceBackend,
  VoiceSessionError,
  type VoiceBackend,
  type VoiceBackendSession,
  type VoiceBackendSessionOpenOptions,
} from './oracle-voice-session.js'

const trusted = {
  host: 'hub.test',
  origin: 'https://hub.test',
}
const testRoots: string[] = []
const openSockets = new Set<WebSocket>()
const openApps: Array<Awaited<ReturnType<typeof buildApp>>['app']> = []
const voiceConfig: EnabledOracleVoiceConfig = {
  enabled: true,
  language: 'en',
  threads: 1,
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

class GatedVoiceEngineFactory implements VoiceEngineFactory {
  readonly engine = new FakeVoiceEngine()
  initializeStarted = false
  initializeResolved = false
  private releaseInitialize!: () => void
  private readonly initializeGate = new Promise<void>((resolve) => {
    this.releaseInitialize = resolve
  })

  async initialize(): Promise<VoiceEngineSession> {
    this.initializeStarted = true
    await this.initializeGate
    this.initializeResolved = true
    return this.engine
  }

  release(): void {
    this.releaseInitialize()
  }

  capability(): VoiceBackendCapability {
    if (!this.initializeResolved) {
      return {
        available: false,
        reason: 'Voice engine initialization is still pending',
      }
    }
    return {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    }
  }

  async stop(): Promise<void> {
    await this.engine.close()
  }
}

class ObservedLocalVoiceBackend extends LocalVoiceBackend {
  readonly openAttempts: string[] = []
  readonly opened: string[] = []
  readonly cancelled: string[] = []
  readonly closed: string[] = []

  override async open(
    options: VoiceBackendSessionOpenOptions,
  ): Promise<VoiceBackendSession> {
    this.openAttempts.push(options.streamId)
    try {
      const session = await super.open(options)
      this.opened.push(options.streamId)
      let closed = false
      return {
        control: (message) => session.control(message),
        audio: (frame) => session.audio(frame),
        close: async (reason) => {
          await session.close(reason)
          if (closed) return
          closed = true
          this.closed.push(options.streamId)
        },
      }
    } catch (error) {
      if (options.signal?.aborted) this.cancelled.push(options.streamId)
      throw error
    }
  }
}

class RouteManager extends EventEmitter {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)
  readonly cancel = vi.fn(async () => undefined)
  readonly cancelMessage = vi.fn(async (messageId: string): Promise<ManagerMessage> => ({
    id: messageId,
    role: 'user',
    content: 'Voice request',
    createdAt: '2026-10-17T00:00:00.000Z',
    state: 'cancelled',
    source: 'voice',
  }))
  readonly send = vi.fn(async (
    content: string,
    _defaults?: ManagerClientDefaults,
    options?: ManagerSubmissionOptions,
  ): Promise<ManagerMessage> => ({
    id: randomUUID(),
    role: 'user',
    content,
    createdAt: '2026-10-17T00:00:00.000Z',
    state: 'queued',
    ...(options?.answerOnly ? { answerOnly: true } : {}),
  }))

  snapshot(): ManagerSnapshot {
    return {
      available: true,
      status: 'idle',
      messages: [],
      queued: 0,
      managedSessions: [],
    }
  }

  hiddenSessionIds(): string[] {
    return []
  }
}

class RouteVoiceBackend implements VoiceBackend {
  readonly opened: string[] = []
  readonly closed: string[] = []
  readonly stopped = vi.fn(async () => {
    await this.active?.close('Voice service stopped')
  })
  private active: VoiceBackendSession | undefined
  private terminate: VoiceBackendSessionOpenOptions['terminate'] | undefined

  capability(): VoiceBackendCapability {
    return {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    }
  }

  limits() {
    return {
      maxFrameBytes: 32 * 1024,
      maxQueueBytes: 64 * 1024,
      maxOutputQueueBytes: 589_824,
      maxUtteranceMs: 30_000,
      idleTimeoutMs: 30_000,
    }
  }

  busy(): boolean {
    return this.active !== undefined
  }

  async open(options: VoiceBackendSessionOpenOptions): Promise<VoiceBackendSession> {
    if (this.active) throw new VoiceSessionError('Oracle voice is already in use', 1013)
    let closed = false
    const session: VoiceBackendSession = {
      control: async (message: VoiceClientControl) => {
        if (message.type === 'start') {
          await options.send({
            type: 'state',
            protocol: ORACLE_VOICE_PROTOCOL,
            streamId: options.streamId,
            generation: message.generation,
            state: 'ready',
          })
        }
      },
      audio: async () => undefined,
      close: async (reason: string) => {
        if (closed) return
        closed = true
        this.closed.push(reason)
        if (this.active === session) this.active = undefined
      },
    }
    this.active = session
    this.terminate = options.terminate
    this.opened.push(options.streamId)
    return session
  }

  disconnect(failure: {
    code: number
    reason: string
    retryable: boolean
    cause: 'transport' | 'internal'
  }): void {
    ;(this.terminate as unknown as (value: {
      code: number
      reason: string
      retryable: boolean
      cause: 'transport' | 'internal'
    }) => void)?.(failure)
  }

  stop(): Promise<void> {
    return this.stopped()
  }
}

async function testRoot(): Promise<string> {
  const root = path.join(process.cwd(), 'test-results', `oracle-voice-routes-${randomUUID()}`)
  await mkdir(root, { recursive: true })
  testRoots.push(root)
  return root
}

async function runtime(voiceBackend?: VoiceBackend) {
  const manager = new RouteManager()
  const built = await buildApp({
    dataDirectory: await testRoot(),
    logger: false,
    managerAgent: manager as unknown as ManagerAgent,
    transcriptionService: {
      initialize: async () => undefined,
      stop: async () => undefined,
      transcribe: vi.fn(),
    },
    ...(voiceBackend ? { voiceBackend } : {}),
  })
  openApps.push(built.app)
  return { ...built, routeManager: manager }
}

async function listen(app: Awaited<ReturnType<typeof buildApp>>['app']): Promise<string> {
  const address = await app.listen({ host: '127.0.0.1', port: 0 })
  return address.replace(/^http/, 'ws')
}

function connect(
  url: string,
): Promise<{ socket: WebSocket; first: Promise<VoiceServerControl> }> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, {
      headers: { host: trusted.host },
      origin: trusted.origin,
    })
    openSockets.add(socket)
    socket.once('unexpected-response', (_request, response) => {
      response.resume()
      reject(Object.assign(new Error(`upgrade failed (${response.statusCode})`), {
        statusCode: response.statusCode,
      }))
    })
    socket.once('error', reject)
    socket.once('open', () => {
      const first = new Promise<VoiceServerControl>((resolveMessage, rejectMessage) => {
        socket.once('message', (data, isBinary) => {
          if (isBinary) {
            rejectMessage(new Error('Expected a JSON hello'))
            return
          }
          resolveMessage(JSON.parse(data.toString()) as VoiceServerControl)
        })
      })
      resolve({ socket, first })
    })
    socket.once('close', () => openSockets.delete(socket))
  })
}

async function ticket(app: Awaited<ReturnType<typeof buildApp>>['app']): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/oracle-voice/tickets',
    headers: trusted,
  })
  expect(response.statusCode).toBe(201)
  expect(response.headers['cache-control']).toBe('no-store')
  expect(response.json()).toMatchObject({
    ticket: expect.any(String),
    expiresAt: expect.stringMatching(/Z$/),
  })
  return response.json().ticket as string
}

async function closeSocket(socket: WebSocket): Promise<void> {
  if (socket.readyState === WebSocket.CLOSED) return
  await new Promise<void>((resolve) => {
    socket.once('close', () => resolve())
    socket.close(1000, 'test complete')
  })
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', trusted.origin)
  vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
})

afterEach(async () => {
  for (const socket of openSockets) socket.terminate()
  openSockets.clear()
  await Promise.all(openApps.splice(0).map((app) => app.close()))
  await Promise.all(testRoots.splice(0).map((root) =>
    rm(root, { recursive: true, force: true })))
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('Oracle voice hub routes', () => {
  it('returns an explicit disabled capability without minting a ticket', async () => {
    const { app } = await runtime()

    const capability = await app.inject({
      url: '/api/oracle-voice/capabilities',
      headers: trusted,
    })
    const unavailableTicket = await app.inject({
      method: 'POST',
      url: '/api/oracle-voice/tickets',
      headers: trusted,
    })

    expect(capability.statusCode).toBe(200)
    expect(capability.headers['cache-control']).toBe('no-store')
    expect(capability.json()).toMatchObject({
      protocol: ORACLE_VOICE_PROTOCOL,
      available: false,
      reason: expect.stringContaining('disabled'),
    })
    expect(unavailableTicket.statusCode).toBe(503)
  })

  it('keeps the ticket route under the existing Host and Origin policy', async () => {
    const backend = new RouteVoiceBackend()
    const { app } = await runtime(backend)

    const response = await app.inject({
      method: 'POST',
      url: '/api/oracle-voice/tickets',
      headers: { host: 'hub.test', origin: 'https://evil.test' },
    })

    expect(response.statusCode).toBe(403)
    expect(backend.opened).toEqual([])
  })

  it('selects a paired voice computer by exact configured name', async () => {
    const app = Fastify({ logger: false })
    openApps.push(app)
    await app.register(fastifyWebsocket)
    const availableVoice: Omit<
      Extract<VoiceBackendCapability, { available: true }>,
      'ttsVoice'
    > = {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      resourceClass: 'low',
    }
    await registerOracleVoiceRoutes(app, {
      identity: {
        info: { id: 'hub', name: 'Hub', version: '1.17.0' },
      },
      computers: {
        listComputers: () => [
          { id: 'hub', name: 'Hub', isLocal: true, online: true },
          {
            id: 'lowercase',
            name: 'speech node',
            isLocal: false,
            online: true,
            voice: { ...availableVoice, ttsVoice: 'wrong-case' },
          },
          {
            id: 'exact',
            name: 'Speech node',
            isLocal: false,
            online: true,
            voice: { ...availableVoice, ttsVoice: 'exact-match' },
          },
        ],
        connectVoice: vi.fn(),
      },
      manager: new RouteManager() as unknown as OracleVoiceManager,
      selectedComputerName: 'Speech node',
      unavailableReason: 'Voice unavailable',
    })

    const response = await app.inject({
      url: '/api/oracle-voice/capabilities',
    })

    expect(response.json()).toMatchObject({
      available: true,
      computerId: 'exact',
      computerName: 'Speech node',
      ttsVoice: 'exact-match',
    })
    expect(response.json().limits).toEqual({
      maxFrameBytes: 32 * 1024,
      maxQueueBytes: 64_000,
      maxUtteranceMs: 30_000,
    })
  })

  it('never includes the bearer ticket in automatic request logs', async () => {
    const logs: string[] = []
    const app = Fastify({
      logger: {
        level: 'info',
        stream: {
          write: (line: string) => logs.push(line),
        },
      },
    })
    openApps.push(app)
    await app.register(fastifyWebsocket)
    const manager = new RouteManager()
    await registerOracleVoiceRoutes(app, {
      identity: {
        info: { id: 'hub', name: 'Hub', version: '1.17.0' },
      },
      computers: {
        listComputers: () => [],
        connectVoice: vi.fn(),
      },
      manager: manager as unknown as OracleVoiceManager,
      managerEvents: manager,
      localBackend: new RouteVoiceBackend(),
      unavailableReason: 'Voice unavailable',
    })
    const issued = await app.inject({
      method: 'POST',
      url: '/api/oracle-voice/tickets',
      headers: { origin: trusted.origin },
    })
    const bearer = issued.json().ticket as string
    const endpoint = await listen(app)
    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(bearer)}`,
    )
    await connected.first
    await closeSocket(connected.socket)
    await new Promise((resolve) => setImmediate(resolve))

    expect(logs.join('')).not.toContain(bearer)
  })

  it('requires a single-use bound ticket for a listening WebSocket', async () => {
    const backend = new RouteVoiceBackend()
    const { app } = await runtime(backend)
    const endpoint = await listen(app)

    await expect(connect(`${endpoint}/api/oracle-voice`))
      .rejects.toMatchObject({ statusCode: 401 })

    const issued = await ticket(app)
    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )
    expect(await connected.first).toMatchObject({
      type: 'hello',
      capabilities: { available: true, computerName: expect.any(String) },
    })
    expect(backend.opened).toHaveLength(1)

    await closeSocket(connected.socket)
    await vi.waitFor(() => expect(backend.closed).toHaveLength(1))
    await expect(connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )).rejects.toMatchObject({ statusCode: 401 })
  })

  it('rejects a second active browser stream and releases the backend on close', async () => {
    const backend = new RouteVoiceBackend()
    const { app } = await runtime(backend)
    const endpoint = await listen(app)
    const firstTicket = await ticket(app)
    const first = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(firstTicket)}`,
    )
    await first.first

    const secondTicket = await ticket(app)
    await expect(connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(secondTicket)}`,
    )).rejects.toMatchObject({ statusCode: 409 })

    await closeSocket(first.socket)
    await vi.waitFor(() => expect(backend.busy()).toBe(false))
    const thirdTicket = await ticket(app)
    const third = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(thirdTicket)}`,
    )
    await expect(third.first).resolves.toMatchObject({ type: 'hello' })
    await closeSocket(third.socket)
  })

  it('cancels an unresolved local acquisition and starts its replacement immediately', async () => {
    const factory = new GatedVoiceEngineFactory()
    const backend = new ObservedLocalVoiceBackend(factory, voiceConfig)
    const { app } = await runtime(backend)
    const endpoint = await listen(app)
    const oldMessages: VoiceServerControl[] = []
    const oldTicket = await ticket(app)
    const old = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(oldTicket)}`,
    )
    old.socket.on('message', (data, isBinary) => {
      if (!isBinary) oldMessages.push(JSON.parse(data.toString()) as VoiceServerControl)
    })
    await vi.waitFor(() => {
      expect(factory.initializeStarted).toBe(true)
      expect(factory.initializeResolved).toBe(false)
      expect(backend.openAttempts).toHaveLength(1)
      expect(backend.opened).toEqual([])
    })

    await closeSocket(old.socket)
    expect(factory.initializeResolved).toBe(false)
    expect(oldMessages).toEqual([])

    const replacementTicket = await ticket(app)
    let replacement: Awaited<ReturnType<typeof connect>> | undefined
    try {
      replacement = await connect(
        `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(replacementTicket)}`,
      )
      expect(factory.initializeResolved).toBe(false)
      expect(backend.openAttempts).toHaveLength(2)
      expect(backend.cancelled).toEqual([backend.openAttempts[0]])
      expect(backend.opened).toEqual([])

      factory.release()
      await expect(replacement.first).resolves.toMatchObject({
        type: 'hello',
        streamId: backend.openAttempts[1],
      })
      expect(oldMessages).toEqual([])
      expect(backend.opened).toEqual([backend.openAttempts[1]])

      await closeSocket(replacement.socket)
      await vi.waitFor(() => {
        expect(backend.closed).toEqual([backend.openAttempts[1]])
        expect(backend.busy()).toBe(false)
      })
    } finally {
      factory.release()
      if (replacement) await closeSocket(replacement.socket)
    }
  })

  it('aborts an unresolved paired-node connection when the browser disconnects', async () => {
    let connectSignal: AbortSignal | undefined
    let connectStarted!: () => void
    const started = new Promise<void>((resolve) => {
      connectStarted = resolve
    })
    const connectVoice = vi.fn(
      async (
        _computerId: string,
        _streamId: string,
        signal?: AbortSignal,
      ): Promise<never> => {
        connectSignal = signal
        connectStarted()
        return new Promise((_, reject) => {
          const timer = setTimeout(
            () => reject(new Error('paired voice test fallback')),
            250,
          )
          signal?.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('paired voice connection aborted'))
          }, { once: true })
        })
      },
    )
    const app = Fastify({ logger: false })
    openApps.push(app as unknown as Awaited<ReturnType<typeof buildApp>>['app'])
    await app.register(fastifyWebsocket)
    const manager = new RouteManager()
    await registerOracleVoiceRoutes(app, {
      identity: {
        info: { id: 'hub', name: 'Hub', version: '1.17.0' },
      },
      computers: {
        listComputers: () => [{
          id: 'speech-node',
          name: 'Speech node',
          isLocal: false,
          online: true,
          voice: {
            available: true,
            sampleRate: ORACLE_VOICE_SAMPLE_RATE,
            playbackSampleRate: 22_050,
            languages: ['en'],
            sttProfile: 'zipformer',
            ttsVoice: 'lessac',
            resourceClass: 'low',
          },
        }],
        connectVoice,
      },
      manager: manager as unknown as OracleVoiceManager,
      managerEvents: manager,
      selectedComputerName: 'Speech node',
      unavailableReason: 'Voice unavailable',
    })
    const endpoint = await listen(app as Awaited<ReturnType<typeof buildApp>>['app'])
    const issued = await ticket(app as Awaited<ReturnType<typeof buildApp>>['app'])
    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )
    await started

    await closeSocket(connected.socket)

    await vi.waitFor(() => expect(connectSignal?.aborted).toBe(true))
  })

  it('closes an upgraded race with 1013 when the backend becomes busy', async () => {
    const backend = new RouteVoiceBackend()
    vi.spyOn(backend, 'busy').mockReturnValue(false)
    vi.spyOn(backend, 'open').mockRejectedValue(
      new VoiceSessionError('Oracle voice is already in use', 1013),
    )
    const { app } = await runtime(backend)
    const endpoint = await listen(app)
    const issued = await ticket(app)

    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )
    const closed = new Promise<{ code: number; reason: string }>((resolve) => {
      connected.socket.once('close', (code, reason) => {
        resolve({ code, reason: reason.toString() })
      })
    })

    await expect(closed).resolves.toEqual({
      code: 1013,
      reason: 'Oracle voice is already in use',
    })
  })

  it('makes a local backend startup failure terminal instead of reconnectable 1011', async () => {
    const backend = new RouteVoiceBackend()
    vi.spyOn(backend, 'open').mockRejectedValue(new Error('native backend failed'))
    const { app } = await runtime(backend)
    const endpoint = await listen(app)
    const issued = await ticket(app)

    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )
    const closed = new Promise<{ code: number; reason: string }>((resolve) => {
      connected.socket.once('close', (code, reason) => {
        resolve({ code, reason: reason.toString() })
      })
    })

    await expect(closed).resolves.toEqual({
      code: 1008,
      reason: 'native backend failed',
    })
  })

  it('maps an abnormal selected-backend loss to a valid browser close code', async () => {
    const backend = new RouteVoiceBackend()
    const { app } = await runtime(backend)
    const endpoint = await listen(app)
    const issued = await ticket(app)
    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )
    await connected.first
    const closed = new Promise<{ code: number; reason: string }>((resolve) => {
      connected.socket.once('close', (code, reason) => {
        resolve({ code, reason: reason.toString() })
      })
    })

    backend.disconnect({
      code: 1006,
      reason: 'Selected voice computer disconnected',
      retryable: true,
      cause: 'transport',
    })

    await expect(closed).resolves.toEqual({
      code: 1011,
      reason: 'Selected voice computer disconnected',
    })
  })

  it('reports a local internal 1011 as fatal before closing the browser', async () => {
    const backend = new RouteVoiceBackend()
    const { app } = await runtime(backend)
    const endpoint = await listen(app)
    const issued = await ticket(app)
    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )
    await connected.first
    const fatal = new Promise<VoiceServerControl>((resolve) => {
      connected.socket.on('message', (data, isBinary) => {
        if (isBinary) return
        const message = JSON.parse(data.toString()) as VoiceServerControl
        if (message.type === 'error') resolve(message)
      })
    })
    const closed = new Promise<{ code: number; reason: string }>((resolve) => {
      connected.socket.once('close', (code, reason) => {
        resolve({ code, reason: reason.toString() })
      })
    })

    backend.disconnect({
      code: 1011,
      reason: 'stt accept rejected',
      retryable: false,
      cause: 'internal',
    })

    await expect(fatal).resolves.toMatchObject({
      type: 'error',
      code: 'voice_backend_disconnected',
      message: 'stt accept rejected',
      fatal: true,
    })
    await expect(closed).resolves.toEqual({
      code: 1011,
      reason: 'stt accept rejected',
    })
  })

  it('closes a browser that outruns the bounded coordinator input queue', async () => {
    const backend = new RouteVoiceBackend()
    vi.spyOn(backend, 'limits').mockReturnValue({
      maxFrameBytes: 512,
      maxQueueBytes: 1_024,
      maxOutputQueueBytes: 589_824,
      maxUtteranceMs: 30_000,
      idleTimeoutMs: 30_000,
    })
    const originalOpen = backend.open.bind(backend)
    let releaseStart!: () => void
    const startGate = new Promise<void>((resolve) => {
      releaseStart = resolve
    })
    vi.spyOn(backend, 'open').mockImplementation(async (options) => {
      const session = await originalOpen(options)
      return {
        ...session,
        control: async (message) => {
          if (message.type === 'start') {
            await startGate
          }
          await session.control(message)
        },
      }
    })
    const { app } = await runtime(backend)
    const endpoint = await listen(app)
    const issued = await ticket(app)
    const connected = await connect(
      `${endpoint}/api/oracle-voice?ticket=${encodeURIComponent(issued)}`,
    )
    const hello = await connected.first
    if (hello.type !== 'hello') throw new Error('Expected voice hello')
    const streamId = hello.streamId
    const closed = new Promise<{ code: number; reason: string }>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Timed out waiting for bounded input close')),
        1_000,
      )
      connected.socket.once('close', (code, reason) => {
        clearTimeout(timer)
        resolve({ code, reason: reason.toString() })
      })
    })
    connected.socket.send(JSON.stringify({
      type: 'start',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId,
      generation: 0,
      language: 'en',
      defaults: {},
      answerOnly: false,
    }))
    for (let timestamp = 0; timestamp < 30; timestamp += 1) {
      connected.socket.send(JSON.stringify({
        type: 'heartbeat',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId,
        generation: 0,
        timestamp,
      }))
    }
    try {
      await expect(closed).resolves.toEqual({
        code: 1013,
        reason: 'Browser voice input queue is full',
      })
    } finally {
      releaseStart()
    }
    await vi.waitFor(() => expect(backend.busy()).toBe(false), {
      timeout: 1_000,
    })
  })

  it('stops the configured voice service before app shutdown completes', async () => {
    const backend = new RouteVoiceBackend()
    const { app } = await runtime(backend)

    await app.close()

    expect(backend.stopped).toHaveBeenCalledOnce()
  })
})
