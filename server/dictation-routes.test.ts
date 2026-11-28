import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, readdir, readFile, rm } from 'node:fs/promises'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import path from 'node:path'
import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import {
  encodeDictationAudioFrame,
  parseDictationServerMessage,
  type DictationServerMessage,
} from '../shared/dictation.js'
import { ORACLE_VOICE_SAMPLE_RATE } from '../shared/oracle-voice.js'
import { buildApp } from './app.js'
import type { LiveDictationEngine, LiveDictationEngineState } from './live-dictation-host.js'
import type { LiveDecodeOptions, LiveDecodeResult } from './live-dictation-session.js'
import type { ManagerAgent } from './manager-agent.js'
import { FakeVoiceEngine, FakeVoiceEngineFactory } from './oracle-voice-engine.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import { LocalVoiceBackend } from './oracle-voice-session.js'
import type { SessionService } from './session-service.js'

const trusted = { host: 'hub.test', origin: 'https://hub.test' }
const other = { host: 'other.test', origin: 'https://other.test' }
const roots: string[] = []
const apps: Array<{ close(): Promise<unknown> }> = []
const sockets = new Set<WebSocket>()

class TestSessionService extends EventEmitter {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)
  providers() { return [] }
  listSessions() { return [] }
  listHistory() { return [] }
}

/** An Oracle that records any turn it would be given. */
class SpyManager extends EventEmitter {
  readonly send = vi.fn()
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)
  snapshot() {
    return { available: true, status: 'idle', messages: [], queued: 0, managedSessions: [] }
  }
  hiddenSessionIds(): string[] { return [] }
}

/** Hears "hello world" in every pass and "hello world again" at Stop. */
class FakeEngine implements LiveDictationEngine {
  state: LiveDictationEngineState = 'ready'
  readonly windows: number[] = []

  async tryDecode(samples: Float32Array, _options: LiveDecodeOptions): Promise<LiveDecodeResult | null> {
    this.windows.push(samples.length)
    return spoken('hello world')
  }

  async decode(samples: Float32Array, _options: LiveDecodeOptions): Promise<LiveDecodeResult> {
    this.windows.push(samples.length)
    return spoken('hello world again')
  }
}

function spoken(text: string): LiveDecodeResult {
  const words = text.split(' ')
  return {
    text,
    tokens: words.map((word) => ` ${word}`),
    timestamps: words.map((_word, index) => 0.05 + index * 0.25),
    durations: words.map(() => 0.2),
  }
}

class Inbox {
  readonly messages: DictationServerMessage[] = []
  readonly closed: Promise<{ code: number; reason: string }>
  private readonly waiters = new Set<() => void>()

  constructor(readonly socket: WebSocket) {
    socket.on('message', (data, isBinary) => {
      if (isBinary) throw new Error('Dictation sends no binary messages to the browser')
      this.messages.push(parseDictationServerMessage(rawText(data)))
      for (const wake of this.waiters) wake()
    })
    this.closed = new Promise((resolve) => {
      socket.once('close', (code, reason) => resolve({ code, reason: reason.toString() }))
    })
  }

  types(): string[] {
    return this.messages.filter((message) => message.type !== 'heartbeat').map((message) => message.type)
  }

  waitFor(predicate: (message: DictationServerMessage) => boolean): Promise<DictationServerMessage> {
    const found = this.messages.find(predicate)
    if (found) return Promise.resolve(found)
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters.delete(check)
        reject(new Error(`Timed out; received ${JSON.stringify(this.messages)}`))
      }, 8_000)
      const check = () => {
        const message = this.messages.find(predicate)
        if (!message) return
        clearTimeout(timer)
        this.waiters.delete(check)
        resolve(message)
      }
      this.waiters.add(check)
    })
  }
}

function rawText(data: WebSocket.RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString('utf8')
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8')
  return data.toString('utf8')
}

async function testRoot(label: string): Promise<string> {
  const root = path.join(process.cwd(), 'test-results', `${label}-${randomUUID()}`)
  await mkdir(root, { recursive: true })
  roots.push(root)
  return root
}

const voiceConfig: EnabledOracleVoiceConfig = {
  enabled: true,
  language: 'en',
  threads: 1,
  endpointMs: 800,
  stt: { profile: 'zipformer', modelDirectory: '/not-used/stt' },
  tts: { binary: '/not-used/piper', model: '/not-used/voice.onnx', config: '/not-used/voice.json', sampleRate: 22_050 },
}

interface Runtime {
  baseUrl: string
  wsUrl: string
  root: string
  identity: Awaited<ReturnType<typeof buildApp>>['identity']
  close(): Promise<unknown>
}

async function runtime(options: {
  role: 'hub' | 'node'
  engine?: FakeEngine
  manager?: SpyManager
  speech?: FakeVoiceEngine
  logs?: string[]
}): Promise<Runtime> {
  const root = await testRoot(`dictation-${options.role}`)
  const built = await buildApp({
    dataDirectory: root,
    logger: options.logs
      ? { level: 'info', stream: { write: (line: string) => options.logs!.push(line) } } as never
      : false,
    role: options.role,
    service: new TestSessionService() as unknown as SessionService,
    managerAgent: (options.manager as unknown as ManagerAgent) ?? false,
    liveDecoder: options.engine,
    liveDictationSession: { passIntervalMs: 100 },
    ...(options.speech
      ? {
          voiceBackend: new LocalVoiceBackend(new FakeVoiceEngineFactory(options.speech, {
            available: true,
            sampleRate: ORACLE_VOICE_SAMPLE_RATE,
            playbackSampleRate: 22_050,
            languages: ['en'],
            sttProfile: 'zipformer',
            ttsVoice: 'lessac-medium',
            resourceClass: 'low',
          }), voiceConfig),
        }
      : {}),
  })
  apps.push(built.app)
  await built.app.listen({ host: '127.0.0.1', port: 0 })
  const { port } = built.app.server.address() as AddressInfo
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    wsUrl: `ws://127.0.0.1:${port}`,
    root,
    identity: built.identity,
    close: () => built.app.close(),
  }
}

function requestJson(
  baseUrl: string,
  method: string,
  pathname: string,
  headers: Record<string, string> = trusted,
  body?: unknown,
): Promise<{ statusCode: number; body: unknown }> {
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
        ...(payload ? { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(payload)) } : {}),
      },
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve({ statusCode: response.statusCode ?? 0, body: text ? JSON.parse(text) as unknown : undefined })
      })
    })
    request.once('error', reject)
    if (payload) request.write(payload)
    request.end()
  })
}

async function ticket(baseUrl: string, headers = trusted): Promise<string> {
  const response = await requestJson(baseUrl, 'POST', '/api/dictation/tickets', headers)
  expect(response.statusCode).toBe(201)
  return (response.body as { ticket: string }).ticket
}

function connect(url: string, headers: { host?: string; origin?: string } = trusted): Promise<Inbox> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, {
      headers: headers.host ? { host: headers.host } : {},
      ...(headers.origin ? { origin: headers.origin } : {}),
    })
    sockets.add(socket)
    const inbox = new Inbox(socket)
    socket.once('open', () => resolve(inbox))
    socket.once('unexpected-response', (_request, response) => {
      response.resume()
      sockets.delete(socket)
      reject(Object.assign(new Error(`Upgrade failed (${response.statusCode})`), { statusCode: response.statusCode }))
    })
    socket.once('error', reject)
  })
}

async function open(runtime: Runtime): Promise<Inbox> {
  return connect(`${runtime.wsUrl}/api/dictation?ticket=${encodeURIComponent(await ticket(runtime.baseUrl))}`)
}

function start(inbox: Inbox, streamId = 'stream-1'): void {
  inbox.socket.send(JSON.stringify({ protocol: 1, type: 'start', streamId }))
}

function control(inbox: Inbox, type: 'stop' | 'cancel' | 'heartbeat'): void {
  inbox.socket.send(JSON.stringify({ protocol: 1, type }))
}

/** One second of 100 ms frames. */
function speak(inbox: Inbox, first = 1): number {
  for (let frame = 0; frame < 10; frame += 1) {
    inbox.socket.send(Buffer.from(encodeDictationAudioFrame(first + frame, new Int16Array(1_600).fill(900))))
  }
  return first + 10
}

async function fileInventory(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const walk = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) await walk(full)
      else result[path.relative(root, full)] = (await readFile(full)).toString('base64')
    }
  }
  await walk(root)
  return result
}

async function pair(hub: Runtime, node: { baseUrl: string; token: string }, name = 'Speech node'): Promise<void> {
  const paired = await requestJson(hub.baseUrl, 'POST', '/api/computers', trusted, {
    baseUrl: node.baseUrl, token: node.token, name,
  })
  expect(paired.statusCode).toBe(201)
}

/** A paired computer released before live dictation: it has no dictation routes. */
async function outdatedNode(): Promise<{ baseUrl: string; token: string }> {
  const app = Fastify({ logger: false })
  await app.register(fastifyWebsocket)
  const token = 'outdated-token'
  app.addHook('onRequest', async (request, reply) => {
    if (request.headers.authorization !== `Bearer ${token}`) return reply.code(401).send({ error: 'Invalid node token' })
  })
  app.get('/node-api/info', async () => ({ id: 'outdated-node', name: 'Old box', version: '2.0.0' }))
  app.get('/node-api/sessions', async () => ({ sessions: [] }))
  app.get('/node-api/history', async () => ({ sessions: [] }))
  app.get('/node-api/events', { websocket: true }, () => undefined)
  apps.push(app)
  await app.listen({ host: '127.0.0.1', port: 0 })
  const { port } = app.server.address() as AddressInfo
  return { baseUrl: `http://127.0.0.1:${port}`, token }
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', `${trusted.origin},${other.origin}`)
  vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
})

afterEach(async () => {
  await Promise.allSettled([...sockets].map((socket) => new Promise<void>((resolve) => {
    if (socket.readyState === WebSocket.CLOSED) return resolve()
    socket.once('close', () => resolve())
    socket.terminate()
  })))
  sockets.clear()
  await Promise.allSettled(apps.splice(0).map((app) => app.close()))
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
  vi.unstubAllEnvs()
})

describe('live dictation routes', () => {
  it('binds single-use tickets to the browser and refuses foreign origins and hosts', async () => {
    const hub = await runtime({ role: 'hub', engine: new FakeEngine() })
    expect((await requestJson(hub.baseUrl, 'POST', '/api/dictation/tickets', {
      host: trusted.host, origin: 'https://evil.test',
    })).statusCode).toBe(403)
    expect((await requestJson(hub.baseUrl, 'POST', '/api/dictation/tickets', {
      host: 'evil.test', origin: trusted.origin,
    })).statusCode).toBe(403)
    await expect(connect(`${hub.wsUrl}/api/dictation`)).rejects.toMatchObject({ statusCode: 401 })

    const issued = await ticket(hub.baseUrl)
    await expect(connect(`${hub.wsUrl}/api/dictation?ticket=${issued}`, other))
      .rejects.toMatchObject({ statusCode: 401 })
    // The failed attempt used the ticket up.
    await expect(connect(`${hub.wsUrl}/api/dictation?ticket=${issued}`))
      .rejects.toMatchObject({ statusCode: 401 })

    const once = await ticket(hub.baseUrl)
    await expect(connect(`${hub.wsUrl}/api/dictation?ticket=${once}`, { host: 'evil.test', origin: trusted.origin }))
      .rejects.toMatchObject({ statusCode: 403 })
    const reused = await ticket(hub.baseUrl)
    const first = await connect(`${hub.wsUrl}/api/dictation?ticket=${reused}`)
    await expect(connect(`${hub.wsUrl}/api/dictation?ticket=${reused}`)).rejects.toMatchObject({ statusCode: 401 })
    first.socket.close()
  })

  it('reports what the local engine can do', async () => {
    const none = await runtime({ role: 'hub' })
    const reply = await requestJson(none.baseUrl, 'GET', '/api/dictation/capabilities')
    expect(reply.body).toEqual({
      live: false,
      reason: `Live dictation needs the Parakeet engine on ${none.identity.info.name}`,
      computerName: none.identity.info.name,
    })
    const engine = new FakeEngine()
    engine.state = 'starting'
    const warming = await runtime({ role: 'hub', engine })
    expect((await requestJson(warming.baseUrl, 'GET', '/api/dictation/capabilities')).body)
      .toEqual({ live: true, computerName: warming.identity.info.name })
  })

  it('streams text only to the requesting browser, with no Oracle turn, speech, or stored data', async () => {
    const manager = new SpyManager()
    const speech = new FakeVoiceEngine()
    const logs: string[] = []
    const engine = new FakeEngine()
    const hub = await runtime({ role: 'hub', engine, manager, speech, logs })
    const before = await fileInventory(hub.root)

    const browser = await open(hub)
    start(browser)
    await browser.waitFor((message) => message.type === 'ready')
    const other = await open(hub)
    start(other, 'other')
    expect(await other.waitFor((message) => message.type === 'error')).toMatchObject({ code: 'busy', fatal: true })
    expect((await other.closed).code).toBe(1013)

    speak(browser)
    expect(await browser.waitFor((message) => message.type === 'text'))
      .toMatchObject({ committedAppend: '', tentative: 'hello world' })
    control(browser, 'stop')
    expect(await browser.waitFor((message) => message.type === 'final'))
      .toEqual({ protocol: 1, type: 'final', text: 'hello world again', reason: 'stop' })
    expect((await browser.closed).code).toBe(1000)

    expect(other.types()).toEqual(['error'])
    expect(manager.send).not.toHaveBeenCalled()
    expect(speech.calls).toEqual([])
    expect(await fileInventory(hub.root)).toEqual(before)
    const written = logs.join('\n')
    expect(written).toContain('Live dictation stream ended')
    expect(written).not.toMatch(/hello/)
  })

  it('relays a stream through the paired transcription computer', async () => {
    const engine = new FakeEngine()
    const node = await runtime({ role: 'node', engine })
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', 'Speech node')
    const hub = await runtime({ role: 'hub' })
    await pair(hub, { baseUrl: node.baseUrl, token: node.identity.token })
    await vi.waitFor(async () => {
      expect((await requestJson(hub.baseUrl, 'GET', '/api/dictation/capabilities')).body)
        .toEqual({ live: true, computerName: 'Speech node' })
    })
    const nodeBefore = await fileInventory(node.root)

    const browser = await open(hub)
    start(browser)
    await browser.waitFor((message) => message.type === 'ready')
    const next = speak(browser)
    expect(await browser.waitFor((message) => message.type === 'text'))
      .toMatchObject({ tentative: 'hello world' })
    speak(browser, next)
    control(browser, 'stop')
    expect(await browser.waitFor((message) => message.type === 'final'))
      .toMatchObject({ text: 'hello world again', reason: 'stop' })
    expect((await browser.closed).code).toBe(1000)
    // The node decoded the audio; 2 s of it plus 1 s of padding at Stop.
    expect(engine.windows.at(-1)).toBe(3 * 16_000)
    expect(await fileInventory(node.root)).toEqual(nodeBefore)
  })

  it('cancels a relayed stream on both sides without a final text', async () => {
    const engine = new FakeEngine()
    const node = await runtime({ role: 'node', engine })
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', 'Speech node')
    const hub = await runtime({ role: 'hub' })
    await pair(hub, { baseUrl: node.baseUrl, token: node.identity.token })
    await vi.waitFor(async () => {
      expect((await requestJson(hub.baseUrl, 'GET', '/api/dictation/capabilities')).body).toMatchObject({ live: true })
    })
    const browser = await open(hub)
    start(browser)
    await browser.waitFor((message) => message.type === 'ready')
    speak(browser)
    await browser.waitFor((message) => message.type === 'text')
    control(browser, 'cancel')
    expect((await browser.closed).code).toBe(1000)
    expect(browser.types()).not.toContain('final')
    // The node is free for the next stream at once.
    const again = await open(hub)
    start(again, 'again')
    expect(await again.waitFor((message) => message.type !== 'heartbeat')).toMatchObject({ type: 'ready' })
  })

  it('bounds relayed frames and keeps one relayed stream at a time', async () => {
    const engine = new FakeEngine()
    const node = await runtime({ role: 'node', engine })
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', 'Speech node')
    const hub = await runtime({ role: 'hub' })
    await pair(hub, { baseUrl: node.baseUrl, token: node.identity.token })
    await vi.waitFor(async () => {
      expect((await requestJson(hub.baseUrl, 'GET', '/api/dictation/capabilities')).body).toMatchObject({ live: true })
    })
    const browser = await open(hub)
    start(browser)
    await browser.waitFor((message) => message.type === 'ready')
    const second = await open(hub)
    start(second, 'second')
    expect(await second.waitFor((message) => message.type === 'error')).toMatchObject({
      code: 'busy', message: 'Live dictation is already in use on Speech node', fatal: true,
    })
    browser.socket.send(Buffer.from(encodeDictationAudioFrame(1, new Int16Array(20_000))))
    expect(await browser.waitFor((message) => message.type === 'error'))
      .toMatchObject({ code: 'frame_too_large', fatal: true })
    expect((await browser.closed).code).toBe(1009)
    expect(engine.windows).toEqual([])
  })

  it('reports an unpaired or offline transcription computer', async () => {
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', 'Speech node')
    const hub = await runtime({ role: 'hub', engine: new FakeEngine() })
    expect((await requestJson(hub.baseUrl, 'GET', '/api/dictation/capabilities')).body).toEqual({
      live: false, reason: 'Speech node is not paired', computerName: 'Speech node',
    })
    const unpaired = await open(hub)
    start(unpaired)
    expect(await unpaired.waitFor((message) => message.type === 'error'))
      .toMatchObject({ code: 'node_offline', fatal: true })

    const node = await runtime({ role: 'node', engine: new FakeEngine() })
    await pair(hub, { baseUrl: node.baseUrl, token: node.identity.token })
    await node.close()
    await vi.waitFor(async () => {
      expect((await requestJson(hub.baseUrl, 'GET', '/api/dictation/capabilities')).body).toEqual({
        live: false, reason: 'Speech node is offline', computerName: 'Speech node',
      })
    })
    const offline = await open(hub)
    start(offline)
    expect(await offline.waitFor((message) => message.type === 'error'))
      .toMatchObject({ code: 'node_offline', fatal: true })
  })

  it('asks for an update when the transcription computer predates live dictation', async () => {
    const node = await outdatedNode()
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', 'Old box')
    const hub = await runtime({ role: 'hub' })
    await pair(hub, node, 'Old box')
    await vi.waitFor(async () => {
      expect((await requestJson(hub.baseUrl, 'GET', '/api/dictation/capabilities')).body).toEqual({
        live: false, reason: 'Update Old box to use live dictation', computerName: 'Old box',
      })
    })
    const browser = await open(hub)
    start(browser)
    expect(await browser.waitFor((message) => message.type === 'error')).toEqual({
      protocol: 1, type: 'error', code: 'node_outdated', message: 'Update Old box to use live dictation', fatal: true,
    })
  })
})
