import { randomUUID } from 'node:crypto'
import { EventEmitter, once } from 'node:events'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { gunzipSync } from 'node:zlib'
import Fastify, { type FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ActivityDetail, SessionDetail, WorkspaceFile } from '../shared/contracts.js'
import { buildApp } from './app.js'
import { registerResponseCompression } from './response-compression.js'
import type { SessionService } from './session-service.js'
import type { TranscriptionService } from './transcription-service.js'

const KIB = 1024
const apps: FastifyInstance[] = []
const directories: string[] = []
const sockets: WebSocket[] = []

afterEach(async () => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  for (const socket of sockets.splice(0)) socket.terminate()
  await Promise.all(apps.splice(0).map((app) => app.close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

/** JSON text of exactly `bytes` bytes. */
function jsonText(bytes: number): string {
  return `{"text":"${'a'.repeat(bytes - 11)}"}`
}

function gunzipText(payload: Buffer): string {
  return gunzipSync(payload).toString('utf8')
}

async function hookApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })
  apps.push(app)
  registerResponseCompression(app)
  const json = 'application/json; charset=utf-8'
  const large = jsonText(128 * KIB)
  app.get<{ Querystring: { bytes: string } }>('/json', async (request, reply) =>
    reply.type(json).send(jsonText(Number(request.query.bytes))))
  app.get('/vary', async (_request, reply) =>
    reply.header('vary', 'Origin').type(json).send(jsonText(64 * KIB)))
  app.get('/no-content', async (_request, reply) => reply.code(204).type(json).send(large))
  app.get('/not-modified', async (_request, reply) => reply.code(304).type(json).send(large))
  app.get('/encoded', async (_request, reply) =>
    reply.header('content-encoding', 'br').type(json).send(Buffer.from(large)))
  app.get('/no-transform', async (_request, reply) =>
    reply.header('cache-control', 'private, no-transform').type(json).send(large))
  app.get('/text', async (_request, reply) => reply.type('text/plain; charset=utf-8').send(large))
  app.get('/bytes', async (_request, reply) => reply.type('application/octet-stream').send(Buffer.from(large)))
  app.get('/stream', async (_request, reply) => reply.type(json).send(Readable.from([large])))
  app.get('/opted-out', { config: { compress: false } }, async (_request, reply) => reply.type(json).send(large))
  return app
}

describe('response compression', () => {
  it('gzips JSON of at least 64 KiB for a client that accepts gzip', async () => {
    const app = await hookApp()

    const response = await app.inject({ url: '/vary', headers: { 'accept-encoding': 'gzip, deflate, br' } })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-encoding']).toBe('gzip')
    expect(response.headers.vary).toBe('Origin, Accept-Encoding')
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.headers['content-length']).toBe(String(response.rawPayload.length))
    expect(response.rawPayload.length).toBeLessThan(KIB)
    expect(gunzipText(response.rawPayload)).toBe(jsonText(64 * KIB))
  })

  it('leaves JSON under 64 KiB as it is', async () => {
    const app = await hookApp()

    const response = await app.inject({ url: `/json?bytes=${64 * KIB - 1}`, headers: { 'accept-encoding': 'gzip' } })

    expect(response.headers['content-encoding']).toBeUndefined()
    expect(response.headers.vary).toBeUndefined()
    expect(response.body).toBe(jsonText(64 * KIB - 1))
  })

  it.each([
    [undefined, false],
    ['identity', false],
    ['deflate, br', false],
    ['gzip;q=0', false],
    ['br, gzip; q=0.000', false],
    ['*;q=0', false],
    ['gzip;q=0, *', false],
    ['gzip', true],
    ['GZIP;Q=0.5', true],
    ['x-gzip', true],
    ['*', true],
    ['br;q=1, *;q=0.1', true],
  ])('negotiates Accept-Encoding %s to gzip: %s', async (acceptEncoding, gzipped) => {
    const app = await hookApp()

    const response = await app.inject({
      url: `/json?bytes=${128 * KIB}`,
      headers: acceptEncoding === undefined ? {} : { 'accept-encoding': acceptEncoding },
    })

    expect(response.headers['content-encoding']).toBe(gzipped ? 'gzip' : undefined)
    // Either way the representation depended on the request's Accept-Encoding.
    expect(response.headers.vary).toBe('Accept-Encoding')
    expect(gzipped ? gunzipText(response.rawPayload) : response.body).toBe(jsonText(128 * KIB))
  })

  it.each([
    { name: 'HEAD', method: 'HEAD' as const, url: `/json?bytes=${128 * KIB}`, body: '' },
    { name: '204', url: '/no-content', body: '' },
    { name: '304', url: '/not-modified', body: jsonText(128 * KIB) },
    { name: 'already encoded', url: '/encoded', encoding: 'br', body: jsonText(128 * KIB) },
    { name: 'no-transform', url: '/no-transform', body: jsonText(128 * KIB) },
    { name: 'text', url: '/text', body: jsonText(128 * KIB) },
    { name: 'bytes', url: '/bytes', body: jsonText(128 * KIB) },
    { name: 'stream', url: '/stream', body: jsonText(128 * KIB) },
    { name: 'opted-out route', url: '/opted-out', body: jsonText(128 * KIB) },
    {
      name: 'upgrade', url: `/json?bytes=${128 * KIB}`, body: jsonText(128 * KIB),
      headers: { connection: 'Upgrade', upgrade: 'websocket' },
    },
  ])('leaves a $name response untouched', async ({ method, url, body, encoding, headers }) => {
    const app = await hookApp()

    const response = await app.inject({ method: method ?? 'GET', url, headers: { 'accept-encoding': 'gzip', ...headers } })

    expect(response.headers['content-encoding']).toBe(encoding)
    expect(response.body).toBe(body)
  })
})

const timestamp = '2026-11-20T00:00:00.000Z'
const transcript = Array.from({ length: 600 }, (_, index) => ({
  id: `message-${index}`,
  role: index % 2 ? 'assistant' as const : 'user' as const,
  content: `Synthetic message ${index}. ${'The quick brown fox jumps over the lazy dog. '.repeat(6)}`,
  createdAt: timestamp,
}))
const largeCallOutput = 'ok - synthetic check passed\n'.repeat(5_000)
const largeCall: ActivityDetail = {
  toolCallId: 'call_large', toolName: 'bash', kind: 'tool', status: 'completed',
  arguments: { format: 'command', text: 'pnpm test', truncated: false, originalBytes: 9 },
  result: { text: largeCallOutput, truncated: false, originalBytes: largeCallOutput.length },
}
const largeFile: WorkspaceFile = {
  name: 'notes.md', path: 'notes.md', kind: 'markdown', mimeType: 'text/markdown; charset=utf-8',
  size: 128 * KIB, content: `# Notes\n${'Plain synthetic prose for a large document. '.repeat(3_000)}`,
}

class LargeSessionService extends EventEmitter {
  readonly session: SessionDetail = {
    id: 'large', cwd: '/srv/large', title: 'Large', provider: 'copilot',
    status: 'idle', isOpen: true, updatedAt: timestamp, messages: transcript,
  }
  providers = () => [{
    id: 'copilot' as const, name: 'GitHub Copilot', available: true, terminalBacked: false, supportsActivityDetails: true,
  }]
  start = async () => {}
  stop = async () => {}
  getSession = (id: string) => id === this.session.id ? structuredClone(this.session) : undefined
  listSessions = () => [{ ...structuredClone(this.session), messages: [] }]
  listHistory = () => this.listSessions()
  openSession = async (id: string): Promise<SessionDetail> => {
    const session = this.getSession(id)
    if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 })
    return session
  }
  listBackgroundTasks = async () => ({ tasks: [], runningCount: 0, supported: false })
  readActivityDetail = async () => structuredClone(largeCall)
  readWorkspaceFile = async () => structuredClone(largeFile)
  readKnowledgeFile = async () => structuredClone(largeFile)
  validateKnowledgeRoot = async (inputPath: string) => inputPath
  listKnowledge = async (_root: string, listed = '.') => ({ path: listed, entries: [] })
  service(): SessionService { return this as unknown as SessionService }
}

const transcription: TranscriptionService = {
  initialize: async () => {},
  stop: async () => {},
  transcribe: async () => { throw new Error('Unexpected transcription') },
}

async function runtime(role: 'hub' | 'node', service = new LargeSessionService()) {
  const directory = path.resolve('graphify/.cache', `response-compression-${randomUUID()}`)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  directories.push(directory)
  const built = await buildApp({
    role, logger: false, dataDirectory: directory, managerAgent: false,
    service: service.service(), transcriptionService: transcription,
  })
  apps.push(built.app)
  return { ...built, fake: service }
}

describe('response compression on hub and node routes', () => {
  it('gzips a large session read on a node and on the hub', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
    const node = await runtime('node')
    const hub = await runtime('hub')

    const fromNode = await node.app.inject({
      url: '/node-api/sessions/large',
      headers: { authorization: `Bearer ${node.identity.token}`, 'accept-encoding': 'gzip' },
    })
    const fromHub = await hub.app.inject({
      url: `/api/computers/${hub.identity.info.id}/sessions/large`,
      headers: { 'accept-encoding': 'gzip' },
    })

    for (const response of [fromNode, fromHub]) {
      expect(response.statusCode).toBe(200)
      expect(response.headers['content-encoding']).toBe('gzip')
      expect(response.headers.vary).toBe('Accept-Encoding')
      expect(JSON.parse(gunzipText(response.rawPayload)).session.messages).toEqual(transcript)
    }
  })

  it('leaves workspace and Knowledge file reads uncompressed on a node and on the hub', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
    const node = await runtime('node')
    const hub = await runtime('hub')
    const created = await hub.app.inject({
      method: 'POST', url: '/api/knowledge/roots',
      payload: { computerId: hub.identity.info.id, path: '/srv/notes' },
    })
    expect(created.statusCode).toBe(201)
    const rootId = created.json().root.id as string
    const nodeHeaders = { authorization: `Bearer ${node.identity.token}`, 'accept-encoding': 'gzip' }

    const responses = await Promise.all([
      node.app.inject({ url: '/node-api/sessions/large/workspace/file?path=notes.md', headers: nodeHeaders }),
      node.app.inject({ url: '/node-api/knowledge/file?root=%2Fsrv%2Fnotes&path=notes.md', headers: nodeHeaders }),
      hub.app.inject({
        url: `/api/computers/${hub.identity.info.id}/sessions/large/workspace/file?path=notes.md`,
        headers: { 'accept-encoding': 'gzip' },
      }),
      hub.app.inject({ url: `/api/knowledge/roots/${rootId}/file?path=notes.md`, headers: { 'accept-encoding': 'gzip' } }),
    ])

    for (const response of responses) {
      expect(response.statusCode).toBe(200)
      expect(response.headers['content-encoding']).toBeUndefined()
      expect(response.json().content).toBe(largeFile.content)
    }
  })

  it('carries a large node session through the hub gzipped on both hops and intact', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
    const node = await runtime('node')
    const nodeUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
    const requested: Array<string | undefined> = []
    node.app.server.on('request', (request) => {
      if (request.url === '/node-api/sessions/large') requested.push(request.headers['accept-encoding'])
    })
    const hub = await runtime('hub')
    const registered = await hub.app.inject({
      method: 'POST', url: '/api/computers',
      payload: { baseUrl: nodeUrl, token: node.identity.token, name: 'Worker' },
    })
    expect(registered.statusCode).toBe(201)
    const computerId = registered.json().computer.id as string
    const received: Array<string | null> = []
    const fetchFromNode = globalThis.fetch
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const response = await fetchFromNode(input, init)
      if (String(input) === `${nodeUrl}/node-api/sessions/large`) {
        received.push(response.headers.get('content-encoding'))
      }
      return response
    })

    const response = await hub.app.inject({
      url: `/api/computers/${computerId}/sessions/large`,
      headers: { 'accept-encoding': 'gzip' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-encoding']).toBe('gzip')
    expect(JSON.parse(gunzipText(response.rawPayload)).session).toMatchObject({
      id: 'large', computerId, messages: transcript,
    })
    expect(requested).toEqual([expect.stringMatching(/\bgzip\b/)])
    expect(received).toEqual(['gzip'])
  })

  it('gzips a large tool call once on the hub, read locally or from a node, and keeps it uncached', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
    const node = await runtime('node')
    const nodeUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
    const hub = await runtime('hub')
    const registered = await hub.app.inject({
      method: 'POST', url: '/api/computers',
      payload: { baseUrl: nodeUrl, token: node.identity.token, name: 'Worker' },
    })
    expect(registered.statusCode).toBe(201)

    for (const computerId of [hub.identity.info.id, registered.json().computer.id as string]) {
      const response = await hub.app.inject({
        url: `/api/computers/${computerId}/sessions/large/activities/call_large`,
        headers: { 'accept-encoding': 'gzip' },
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-encoding']).toBe('gzip')
      expect(response.headers['cache-control']).toBe('no-store')
      expect(response.headers.vary).toBe('Accept-Encoding')
      // A single gunzip gives the call back: it was not encoded twice.
      expect(JSON.parse(gunzipText(response.rawPayload))).toEqual(largeCall)
    }
  })

  it('leaves node event sockets to WebSocket framing', async () => {
    const node = await runtime('node')
    const nodeUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
    const socket = new WebSocket(`${nodeUrl.replace(/^http/, 'ws')}/node-api/events`, {
      headers: { authorization: `Bearer ${node.identity.token}`, 'accept-encoding': 'gzip' },
      perMessageDeflate: false,
    })
    sockets.push(socket)
    await once(socket, 'open')
    const message = once(socket, 'message')
    const event = { type: 'session.upserted', session: node.fake.session }

    node.fake.emit('event', event)

    const [data, isBinary] = await message as [Buffer, boolean]
    expect(isBinary).toBe(false)
    expect(JSON.parse(data.toString('utf8'))).toEqual(event)
  })
})
