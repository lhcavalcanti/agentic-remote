import { randomUUID } from 'node:crypto'
import { EventEmitter, once } from 'node:events'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import type { SessionConfig } from '@github/copilot-sdk'
import type { Query, SDKMessage } from '@anthropic-ai/claude-agent-sdk'
import WebSocket from 'ws'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, SessionDetail } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { buildApp } from './app.js'
import type { SessionService } from './session-service.js'
import { SessionStore } from './session-store.js'
import type { CopilotResourceMethod } from './session-resource-transport.js'

const directories: string[] = []
const apps: FastifyInstance[] = []
const sockets: WebSocket[] = []
const providers: SessionService[] = []
const stores: SessionStore[] = []
const cleanupMessage = 'Conversation cleared, but previous uploads could not be removed.'
const oldId = 'old-resource-owner'
type Variant = 'copilot-sdk' | 'copilot-tmux' | 'claude'

async function directory() {
  const root = path.resolve(`.resource-clear-fixture-${randomUUID()}`)
  await mkdir(root)
  directories.push(root)
  return root
}

function seed(cwd: string, provider: 'copilot' | 'claude'): SessionDetail {
  return {
    id: oldId, provider, cwd, title: 'Resource owner', isOpen: true, status: 'idle',
    updatedAt: '2026-09-06T00:00:00.000Z', messages: [],
  }
}

async function providerFixture(variant: Variant) {
  const root = await directory()
  const data = path.join(root, 'provider')
  const store = new SessionStore(data)
  await store.initialize()
  stores.push(store)
  vi.stubEnv('COPILOT_HOME', path.join(root, 'synthetic-copilot-home'))
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  await store.create(seed(root, variant === 'claude' ? 'claude' : 'copilot'), {
    managedOpen: true, backend: variant === 'copilot-tmux' ? 'terminal' : 'sdk',
  })
  if (variant === 'claude') {
    const sdk = {
      query: (() => Object.assign((async function* () {
        yield {
          type: 'system', subtype: 'init', session_id: oldId, cwd: root,
          skills: ['original-skill'], mcp_servers: [{ name: 'original-tools', status: 'connected' }],
        } as unknown as SDKMessage
        yield {
          type: 'result', subtype: 'success', is_error: false, session_id: oldId, modelUsage: {},
        } as unknown as SDKMessage
      })(), {
        initializationResult: async () => ({ commands: [] }),
      }) as unknown as Query) as ClaudeSdk['query'],
      getSessionInfo: vi.fn(async () => undefined),
      renameSession: vi.fn(async () => {}),
      deleteSession: vi.fn(async () => {}),
    }
    const service = new ClaudeAgentService(store, '/synthetic/not-executed', sdk, async () => ({ loggedIn: true }))
    providers.push(service)
    await service.start()
    await service.sendMessage(oldId, 'A normal synthetic turn')
    await vi.waitFor(() => expect(service.getSession(oldId)?.status).toBe('idle'))
    await new Promise((resolve) => setImmediate(resolve))
    return { root, data, store, service, sdkSessions: undefined, client: undefined }
  }
  const sdkSessions = new Map<string, CopilotSessionLike>()
  const makeSdk = (id: string): CopilotSessionLike => ({
    sessionId: id, on: vi.fn(() => () => {}), getEvents: vi.fn(async () => []),
    sendAndWait: vi.fn(async () => undefined), abort: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    rpc: {
      commands: {
        list: vi.fn(async () => ({ commands: [] })),
        invoke: vi.fn(async () => ({ kind: 'text' as const, text: '' })),
        enqueue: vi.fn(async () => ({ queued: true })),
      },
      name: { set: vi.fn(async () => {}) }, mode: { set: vi.fn(async () => {}) },
      model: {
        getCurrent: vi.fn(async () => ({ modelId: 'fixture' })),
        switchTo: vi.fn(async () => ({ modelId: 'fixture' })),
      },
      skills: { list: vi.fn(async () => ({ skills: [{
        name: id === oldId ? 'original-skill' : 'replacement-skill',
        description: 'Synthetic metadata', source: 'project' as const, enabled: true, userInvocable: true,
      }] })) },
      mcp: { list: vi.fn(async () => ({ servers: [{ name: 'tools', status: 'connected' as const }] })) },
    },
  })
  sdkSessions.set(oldId, makeSdk(oldId))
  const client = {
    start: vi.fn(async () => {}), stop: vi.fn(async () => []),
    createSession: vi.fn(async (config: SessionConfig) => {
      const sdk = makeSdk(config.sessionId!)
      sdkSessions.set(sdk.sessionId, sdk)
      return sdk
    }),
    resumeSession: vi.fn(async (id: string) => sdkSessions.get(id)!),
    deleteSession: vi.fn(async (id: string) => { sdkSessions.delete(id) }),
    listSessions: vi.fn(async () => []),
    requestResource: vi.fn(async (method: CopilotResourceMethod, params: Record<string, unknown>, signal: AbortSignal) => {
      signal.throwIfAborted()
      if (method === 'session.skills.list') return sdkSessions.get(String(params.sessionId))!.rpc.skills!.list()
      if (method === 'session.mcp.list') return sdkSessions.get(String(params.sessionId))!.rpc.mcp!.list()
      if (method === 'skills.discover') return { skills: [{
        name: 'configured-skill', description: 'Configured fixture', source: 'project', enabled: true, userInvocable: true,
      }] }
      return { servers: [] }
    }),
    rpc: {
      commands: { list: vi.fn(async () => ({ commands: [] })) },
      models: { list: vi.fn(async () => ({ models: [] })) },
      skills: { discover: vi.fn(async () => ({ skills: [] })) },
      mcp: { discover: vi.fn(async () => ({ servers: [] })) },
    },
  } satisfies CopilotClientLike
  const terminal = {
    has: vi.fn(async () => variant === 'copilot-tmux'),
    send: vi.fn(async () => false), cancel: vi.fn(async () => false),
    reset: vi.fn(async (_id: string, _replacement: string, _cwd: string, _runtime: unknown, retire?: () => Promise<void>) => {
      await retire?.()
      return true
    }),
    rename: vi.fn(async () => true),
  }
  const service = new AgentService(store, client, async () => [], async () => {}, async () => [],
    async () => undefined, terminal, async () => undefined, async () => undefined)
  providers.push(service)
  if (variant === 'copilot-tmux') {
    // Model an already-discovered terminal owner without touching real tmux.
    const terminalOwners = Reflect.get(service, 'externalSessionIds') as Set<string>
    terminalOwners.add(oldId)
  } else {
    await service.openSession(oldId)
  }
  return { root, data, store, service, sdkSessions, client }
}

function trackApp(app: FastifyInstance) {
  apps.push(app)
  let closing = false
  app.server.on('connection', (socket) => { if (closing) socket.destroy() })
  app.addHook('preClose', async () => { closing = true; app.server.closeAllConnections() })
}

async function pairedFixture(variant: Variant) {
  const fixture = await providerFixture(variant)
  const transcription = {
    initialize: async () => {}, stop: async () => {},
    transcribe: async () => { throw new Error('No transcription in this fixture') },
  }
  const node = await buildApp({
    role: 'node', logger: false, dataDirectory: path.join(fixture.root, 'node'),
    service: fixture.service, transcriptionService: transcription,
  })
  trackApp(node.app)
  const nodeUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
  const empty = Object.assign(new EventEmitter(), {
    providers: () => [], getSession: () => undefined, listSessions: () => [], listHistory: () => [],
    start: async () => {}, stop: async () => {},
  }) as unknown as SessionService
  const hub = await buildApp({
    role: 'hub', logger: false, dataDirectory: path.join(fixture.root, 'hub'),
    service: empty, transcriptionService: transcription,
  })
  trackApp(hub.app)
  const hubUrl = await hub.app.listen({ host: '127.0.0.1', port: 0 })
  const computer = await hub.manager!.registerComputer({ baseUrl: nodeUrl, token: node.identity.token })
  await vi.waitFor(() => expect(hub.manager!.listComputers().find((entry) => entry.id === computer.id)?.online).toBe(true))
  const events: HubEvent[] = []
  const socket = new WebSocket(`${hubUrl.replace('http:', 'ws:')}/api/events`)
  sockets.push(socket)
  socket.on('message', (data) => events.push(JSON.parse(data.toString()) as HubEvent))
  await once(socket, 'open')
  const route = (id: string, action: string) => `/api/computers/${computer.id}/sessions/${id}/${action}`
  const resources = (id = oldId) => hub.app.inject({ method: 'GET', url: route(id, 'skills'), headers: { host: 'localhost' } })
  const clear = () => hub.app.inject({ method: 'POST', url: route(oldId, 'clear'), headers: { host: 'localhost' } })
  return { ...fixture, computer, events, resources, clear }
}

async function obstructUploads(data: string, service: SessionService) {
  await service.uploadFile(oldId, 'fixture.txt', Buffer.from('Synthetic upload'))
  await rename(path.join(data, 'uploads'), path.join(data, 'preserved-uploads'))
  await writeFile(path.join(data, 'uploads'), 'Synthetic non-directory obstruction')
}

afterEach(async () => {
  for (const root of directories) await rm(path.join(root, 'provider', 'state.json.tmp'), { recursive: true, force: true })
  for (const socket of sockets.splice(0)) socket.terminate()
  // Recover the intentionally failed checkpoint before closing fixture stores.
  for (const store of stores.splice(0)) {
    const session = store.list()[0]
    if (session) await store.update(session.id, () => {})
  }
  for (const app of apps.splice(0).reverse()) {
    for (const socket of app.websocketServer.clients) socket.terminate()
    await app.close()
  }
  for (const service of providers.splice(0)) await service.stop()
  for (const root of directories.splice(0)) await rm(root, { recursive: true, force: true })
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('resource owner publication after clear cleanup failure', () => {
  it('carries the exact committed replacement when real upload removal fails', async () => {
    const { data, service, store } = await providerFixture('copilot-sdk')
    await obstructUploads(data, service)
    const error = await store.replaceWithClearedSession(oldId, 'exact-replacement').catch((error: unknown) => error) as
      Error & { replacement: SessionDetail; cause: NodeJS.ErrnoException }
    expect(error.name).toBe('SessionReplacementCleanupError')
    expect(error.cause.code).toBe('ENOTDIR')
    expect(store.get(oldId)).toBeUndefined()
    expect(error.replacement).toEqual(store.get('exact-replacement'))
    const captured = structuredClone(error.replacement)
    await store.update('exact-replacement', (session) => { session.title = 'A later committed update' })
    expect(error.replacement).toEqual(captured)
    expect(error.replacement.title).not.toBe(store.get('exact-replacement')!.title)
  })

  it.each(['copilot-sdk', 'copilot-tmux', 'claude'] as const)(
    'publishes the accepted %s replacement over the hub websocket despite real upload cleanup failure',
    async (variant) => {
      const { data, service, store, sdkSessions, client, computer, events, resources, clear } = await pairedFixture(variant)
      expect((await resources()).statusCode).toBe(200)
      await obstructUploads(data, service)
      const response = await clear()
      expect(response.statusCode).toBe(200)
      const replacement = response.json().session as SessionDetail
      expect(replacement.id).not.toBe(oldId)
      expect(store.get(oldId)).toBeUndefined()
      expect(replacement).toMatchObject({ replacedSessionIds: [oldId], messages: [], status: 'idle' })
      await vi.waitFor(() => expect(events).toContainEqual({
        type: 'error', computerId: computer.id, sessionId: replacement.id, message: cleanupMessage,
      }))
      const removal = events.findIndex((event) => event.type === 'session.removed' && event.sessionId === oldId)
      const arrival = events.findIndex((event) => event.type === 'session.upserted' && event.session.id === replacement.id)
      const warning = events.findIndex((event) => event.type === 'error' && event.sessionId === replacement.id && event.message === cleanupMessage)
      expect(removal).toBeGreaterThanOrEqual(0)
      expect(events[removal]).toMatchObject({ computerId: computer.id, replacedBy: replacement.id })
      expect(arrival).toBeGreaterThan(removal)
      expect(warning).toBeGreaterThan(arrival)
      expect(events.filter((event) => event.type === 'session.removed' && event.sessionId === oldId)).toHaveLength(1)
      expect((await resources()).statusCode).toBe(404)
      const fresh = await resources(replacement.id)
      expect(fresh.statusCode).toBe(200)
      expect(fresh.json()).toMatchObject({ computerId: computer.id, sessionId: replacement.id })
      if (variant === 'claude') expect(fresh.json().scope).toBe('unavailable')
      if (variant === 'copilot-sdk') {
        expect(sdkSessions!.has(replacement.id)).toBe(true)
        expect(sdkSessions!.get(replacement.id)!.disconnect).not.toHaveBeenCalled()
        expect(client!.deleteSession).not.toHaveBeenCalledWith(replacement.id)
      }
    },
  )

  it.each(['copilot-sdk', 'copilot-tmux', 'claude'] as const)(
    'retains the %s resource owner and emits no replacement on a real pre-commit write failure',
    async (variant) => {
      const { data, store, events, resources, clear } = await pairedFixture(variant)
      const before = (await resources()).json()
      const stateBefore = await readFile(path.join(data, 'state.json'), 'utf8')
      await mkdir(path.join(data, 'state.json.tmp'))
      const response = await clear()
      expect(response.statusCode).toBe(500)
      expect(store.get(oldId)).toBeDefined()
      expect(await readFile(path.join(data, 'state.json'), 'utf8')).toBe(stateBefore)
      expect(events.filter((event) => event.type === 'session.removed' && event.sessionId === oldId)).toEqual([])
      expect(events.filter((event) => event.type === 'session.upserted' && event.session.id !== oldId)).toEqual([])
      const after = (await resources()).json()
      expect(after).toMatchObject({ sessionId: oldId, scope: before.scope, skills: before.skills })
      if (variant === 'claude') expect(after.capturedAt).toBe(before.capturedAt)
    },
  )
})
