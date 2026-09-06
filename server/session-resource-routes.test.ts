import { randomUUID } from 'node:crypto'
import { EventEmitter, getEventListeners } from 'node:events'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import type {
  AgentProvider,
  AgentProviderCapability,
  SessionDetail,
  SessionSkillsSnapshot,
  SessionMcpServersSnapshot,
} from '../shared/contracts.js'
import { buildApp } from './app.js'
import { ProviderSessionService } from './provider-session-service.js'
import { RemoteNodeClient } from './remote-node-client.js'
import type { SessionService } from './session-service.js'
import type { TranscriptionService } from './transcription-service.js'

const directories: string[] = []
const apps: FastifyInstance[] = []
const releases: (() => void)[] = []
const capturedAt = '2026-09-05T10:00:00.000Z'

class ResourceService extends EventEmitter {
  readonly session: SessionDetail
  present = true
  supported = true
  constructor(readonly provider: AgentProvider = 'copilot', readonly label = 'local') {
    super()
    this.session = {
      id: 'session', cwd: `/fixture/${label}`, title: 'Fixture', provider,
      status: 'idle', isOpen: true, messages: [], updatedAt: capturedAt,
    }
  }
  providers = (): AgentProviderCapability[] => [{
    id: this.provider, name: this.provider, available: true, terminalBacked: false,
    supportsSessionResources: this.supported,
  }]
  start = vi.fn(async () => {})
  stop = vi.fn(async () => {})
  getSession = (id: string) => this.present && id === this.session.id ? structuredClone(this.session) : undefined
  listSessions = () => this.present ? [structuredClone(this.session)] : []
  listHistory = this.listSessions
  openSession = vi.fn(async (): Promise<SessionDetail> => { throw new Error('Opening a session is forbidden in a resource view') })
  listCommands = vi.fn(async () => [])
  listSkills = vi.fn(async (_id: string, _signal?: AbortSignal): Promise<SessionSkillsSnapshot> => ({
    sessionId: this.session.id, provider: this.provider, scope: 'session', capturedAt,
    skills: [{ name: `${this.label}-skill`, enabled: false, source: 'project' }],
  }))
  listMcpServers = vi.fn(async (_id: string, _signal?: AbortSignal): Promise<SessionMcpServersSnapshot> => ({
    sessionId: this.session.id, provider: this.provider, scope: 'session', capturedAt,
    servers: [{ name: `${this.label}-server`, status: 'needs-auth', source: 'user' }],
  }))
  service(): SessionService { return this as unknown as SessionService }
}

function rememberApp(app: FastifyInstance) {
  apps.push(app)
  // Aborted fetches can open replacement idle pool sockets during shutdown.
  // Close only this fixture's sockets, including arrivals after close starts.
  let closing = false
  app.server.on('connection', (socket) => { if (closing) socket.destroy() })
  app.addHook('preClose', async () => {
    closing = true
    app.server.closeAllConnections()
  })
}

function blockSkills(service: ResourceService) {
  let signal: AbortSignal | undefined
  let pending = 0
  service.listSkills.mockImplementationOnce((_id, requestSignal) => {
    signal = requestSignal
    pending += 1
    return new Promise<SessionSkillsSnapshot>((resolve, reject) => {
      let settled = false
      const finish = (error?: unknown) => {
        if (settled) return
        settled = true
        pending -= 1
        signal?.removeEventListener('abort', abort)
        if (error) reject(error)
        else resolve({ sessionId: 'session', provider: service.provider, scope: 'session', capturedAt, skills: [] })
      }
      const abort = () => finish(signal?.reason)
      if (signal?.aborted) abort()
      else signal?.addEventListener('abort', abort, { once: true })
      releases.push(() => finish())
    })
  })
  return { signal: () => signal, pending: () => pending }
}

async function dataDirectory() {
  const relative = `.session-resource-route-${randomUUID()}`
  await mkdir(relative, { mode: 0o700 })
  const directory = path.resolve(relative)
  directories.push(directory)
  return directory
}

const transcription: TranscriptionService = {
  initialize: async () => {},
  stop: async () => {},
  transcribe: async () => { throw new Error('Unexpected transcription') },
}

async function pairedFixture() {
  const nodeService = new ResourceService('claude', 'node')
  const hubService = new ResourceService('copilot', 'hub')
  const node = await buildApp({
    role: 'node', logger: false, dataDirectory: await dataDirectory(),
    service: nodeService.service(), transcriptionService: transcription,
  })
  rememberApp(node.app)
  const redirect: { path?: string; status: 307 | 308 } = { status: 307 }
  let redirected = 0
  node.app.get('/resource-redirect-target', async () => {
    redirected += 1
    return { error: 'Unexpected redirect target' }
  })
  node.app.addHook('onSend', async (request, reply, payload) => {
    if (redirect.path && request.routeOptions.url === redirect.path) {
      reply.code(redirect.status).header('location', '/resource-redirect-target?secret=PRIVATE_LOCATION')
      return 'PRIVATE_REDIRECT_BODY'
    }
    return payload
  })
  const baseUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
  const hub = await buildApp({
    role: 'hub', logger: false, dataDirectory: await dataDirectory(),
    service: hubService.service(), transcriptionService: transcription,
  })
  rememberApp(hub.app)
  const pairing = { baseUrl, token: node.identity.token }
  const computer = await hub.manager!.registerComputer(pairing)
  const get = (kind: 'skills' | 'mcp', id = computer.id, sessionId = 'session') =>
    hub.app.inject({
      method: 'GET', url: `/api/computers/${id}/sessions/${sessionId}/${kind}`,
      headers: { host: 'localhost' },
    })
  return { node, hub, nodeService, hubService, computer, pairing, get, redirect, redirected: () => redirected }
}

function hold<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((accept) => { resolve = accept })
  return { promise, resolve }
}

beforeEach(() => { vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '') })

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  for (const app of apps.splice(0).reverse()) await app.close()
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('session resource hub and authenticated node routes', () => {
  it.each(['getInfo', 'listHistory'] as const)('cancels hub forwarding during %s without reaching provider inspection', async (stage) => {
    const { hub, computer, nodeService } = await pairedFixture()
    const getInfo = RemoteNodeClient.prototype.getInfo
    const listHistory = RemoteNodeClient.prototype.listHistory
    let signal: AbortSignal | undefined
    let pending = false
    const block = (supplied: AbortSignal): Promise<never> => {
      signal = supplied
      pending = true
      return new Promise<never>((_resolve, reject) => {
        const abort = () => { pending = false; reject(supplied.reason) }
        supplied.addEventListener('abort', abort, { once: true })
      })
    }
    if (stage === 'getInfo') {
      vi.spyOn(RemoteNodeClient.prototype, 'getInfo').mockImplementation(function (this: RemoteNodeClient, supplied) {
        return supplied ? block(supplied) : getInfo.call(this)
      })
    } else {
      vi.spyOn(RemoteNodeClient.prototype, 'listHistory').mockImplementation(function (this: RemoteNodeClient, supplied) {
        return supplied ? block(supplied) : listHistory.call(this)
      })
    }
    const controller = new AbortController()
    const reading = hub.manager!.listSkills(computer.id, 'session', controller.signal).catch((error: unknown) => error)
    await vi.waitFor(() => expect(pending).toBe(true))
    controller.abort()
    expect(await reading).toMatchObject({ statusCode: 499 })
    expect(pending).toBe(false)
    expect(getEventListeners(signal!, 'abort')).toHaveLength(0)
    expect(nodeService.listSkills).not.toHaveBeenCalled()
    expect(nodeService.openSession).not.toHaveBeenCalled()
  })

  it('changes its public registration lifetime on same-ID re-pair and cancels the old owner', async () => {
    const { hub, nodeService, computer, pairing, get } = await pairedFixture()
    const listeners = nodeService.listenerCount('event')
    const blocked = blockSkills(nodeService)
    const reading = get('skills')
    await vi.waitFor(() => expect(blocked.pending()).toBe(1))
    const replacement = await hub.manager!.registerComputer(pairing)
    expect(replacement.id).toBe(computer.id)
    expect(replacement.registrationId).toBeTruthy()
    expect(replacement.registrationId).not.toBe(computer.registrationId)
    expect(hub.manager!.listComputers().find((entry) => entry.id === computer.id)?.registrationId)
      .toBe(replacement.registrationId)
    expect((await reading).statusCode).toBe(409)
    await vi.waitFor(() => expect(blocked.pending()).toBe(0))
    expect(nodeService.listenerCount('event')).toBe(listeners)
  })

  it('bounds a hung paired provider read before the browser deadline', async () => {
    const { nodeService, get } = await pairedFixture()
    const listeners = nodeService.listenerCount('event')
    const blocked = blockSkills(nodeService)
    const response = await get('skills')
    expect(response.statusCode).toBe(504)
    expect(response.json().error).toContain('timed out')
    expect(response.headers['cache-control']).toBe('no-store')
    await vi.waitFor(() => expect(blocked.pending()).toBe(0))
    expect(blocked.signal()?.aborted).toBe(true)
    expect(getEventListeners(blocked.signal()!, 'abort')).toHaveLength(0)
    expect(nodeService.listenerCount('event')).toBe(listeners)
  }, 15_000)

  it.each(['disconnect', 'close'] as const)('releases paired provider work on browser %s', async (reason) => {
    const { hub, computer, nodeService } = await pairedFixture()
    const baseUrl = await hub.app.listen({ host: '127.0.0.1', port: 0 })
    const listeners = nodeService.listenerCount('event')
    const blocked = blockSkills(nodeService)
    const controller = new AbortController()
    const reading = fetch(`${baseUrl}/api/computers/${computer.id}/sessions/session/skills`, {
      signal: controller.signal, headers: { host: 'localhost' },
    }).catch((error: unknown) => error)
    await vi.waitFor(() => expect(blocked.pending()).toBe(1))
    if (reason === 'disconnect') controller.abort()
    else await hub.app.close()
    await reading
    await vi.waitFor(() => expect(blocked.pending()).toBe(0))
    expect(nodeService.listenerCount('event')).toBe(listeners)
    expect(getEventListeners(blocked.signal()!, 'abort')).toHaveLength(0)
    expect(nodeService.openSession).not.toHaveBeenCalled()
  })

  it.each([
    ['/node-api/info', 'skills', 307],
    ['/node-api/history', 'skills', 308],
    ['/node-api/sessions/:sessionId/skills', 'skills', 307],
    ['/node-api/sessions/:sessionId/mcp', 'mcp', 308],
  ] as const)('keeps the safe redirect reason through the hub for %s', async (path, kind, status) => {
    const fixture = await pairedFixture()
    fixture.redirect.path = path
    fixture.redirect.status = status
    const response = await fixture.get(kind)
    expect(response.statusCode).toBe(502)
    expect(response.json().error).toContain(`HTTP ${status} redirect`)
    expect(response.json().error).toContain('final node URL')
    expect(response.body).not.toContain('PRIVATE')
    expect(fixture.redirected()).toBe(0)
    expect(fixture.nodeService.openSession).not.toHaveBeenCalled()
  })

  it('forwards to the selected computer/provider without opening or prompting either session', async () => {
    const { computer, get, nodeService, hubService, hub } = await pairedFixture()
    const skills = await get('skills')
    const mcp = await get('mcp')
    expect(skills.statusCode).toBe(200)
    expect(mcp.statusCode).toBe(200)
    expect(skills.headers['cache-control']).toBe('no-store')
    expect(mcp.headers['cache-control']).toBe('no-store')
    expect(skills.json()).toMatchObject({
      computerId: computer.id, sessionId: 'session', provider: 'claude',
      scope: 'session', skills: [{ name: 'node-skill', enabled: false }],
    })
    expect(mcp.json()).toMatchObject({ computerId: computer.id, provider: 'claude', servers: [{ name: 'node-server', status: 'needs-auth' }] })
    expect((await get('skills', hub.identity.info.id)).json()).toMatchObject({
      computerId: hub.identity.info.id, provider: 'copilot', skills: [{ name: 'hub-skill' }],
    })
    expect(nodeService.listSkills).toHaveBeenCalledExactlyOnceWith('session', expect.any(AbortSignal))
    expect(nodeService.listMcpServers).toHaveBeenCalledExactlyOnceWith('session', expect.any(AbortSignal))
    expect(nodeService.openSession).not.toHaveBeenCalled()
    expect(hubService.openSession).not.toHaveBeenCalled()
    expect(nodeService.listCommands).not.toHaveBeenCalled()
  })

  it('preserves node authentication and hub Host/Origin rejection', async () => {
    const { node, hub, computer, nodeService } = await pairedFixture()
    for (const kind of ['skills', 'mcp']) {
      const url = `/node-api/sessions/session/${kind}`
      const unauthorized = await node.app.inject({ method: 'GET', url })
      expect(unauthorized.statusCode).toBe(401)
      expect(unauthorized.headers['cache-control']).toBe('no-store')
      expect((await node.app.inject({ method: 'GET', url, headers: { authorization: 'Bearer wrong-fixture-token' } })).statusCode).toBe(401)
      const direct = await node.app.inject({
        method: 'GET', url, headers: { authorization: `Bearer ${node.identity.token}` },
      })
      expect(direct.statusCode).toBe(200)
      expect(direct.headers['cache-control']).toBe('no-store')
      expect(direct.json().computerId).toBeUndefined()
      const hubUrl = `/api/computers/${computer.id}/sessions/session/${kind}`
      for (const headers of [
        { host: 'hostile.invalid' }, { host: 'localhost', origin: 'https://hostile.invalid' },
      ]) {
        const rejected = await hub.app.inject({ method: 'GET', url: hubUrl, headers })
        expect(rejected.statusCode).toBe(403)
        expect(rejected.headers['cache-control']).toBe('no-store')
      }
    }
    expect(nodeService.listSkills).toHaveBeenCalledTimes(1)
    expect(nodeService.listMcpServers).toHaveBeenCalledTimes(1)
  })

  it('distinguishes old nodes and optional fake methods from an authoritative empty catalog', async () => {
    const { nodeService, hubService, get, hub } = await pairedFixture()
    nodeService.supported = false
    expect((await get('skills')).json()).toMatchObject({ scope: 'unavailable', skills: [], message: 'Update the owning runtime to view session resources.' })
    expect((await get('mcp')).json()).toMatchObject({ scope: 'unavailable', servers: [] })
    expect(nodeService.listSkills).not.toHaveBeenCalled()
    expect(nodeService.listMcpServers).not.toHaveBeenCalled()
    nodeService.supported = true
    nodeService.listSkills.mockResolvedValueOnce({
      sessionId: 'session', provider: 'claude', scope: 'session', capturedAt, skills: [],
    })
    expect((await get('skills')).json()).toMatchObject({ scope: 'session', skills: [], totalCount: 0, truncated: false })
    Reflect.deleteProperty(hubService, 'listSkills')
    expect((await get('skills', hub.identity.info.id)).json()).toMatchObject({ scope: 'unavailable', skills: [] })
  })

  it('rejects incorrect identity and safely reports genuine provider failures', async () => {
    const { nodeService, get } = await pairedFixture()
    nodeService.listSkills.mockResolvedValueOnce({
      sessionId: 'another-session', provider: 'claude', scope: 'session', capturedAt, skills: [],
    })
    expect((await get('skills')).statusCode).toBe(502)
    nodeService.listMcpServers.mockRejectedValueOnce(
      Object.assign(new Error('PRIVATE_URL_TOKEN_AND_ACCOUNT'), { statusCode: 403 }),
    )
    const failed = await get('mcp')
    expect(failed.statusCode).toBe(502)
    expect(failed.headers['cache-control']).toBe('no-store')
    expect(failed.body).not.toContain('PRIVATE')
    expect(failed.json()).toEqual({ error: 'Unable to read session resource metadata.' })
    expect((await get('skills', 'missing-computer')).statusCode).toBe(404)
    expect((await get('skills', undefined, 'missing-session')).statusCode).toBe(404)
    expect(nodeService.openSession).not.toHaveBeenCalled()
  })

  it('re-whitelists a peer/client response before adding managed computer identity', async () => {
    const { computer, get } = await pairedFixture()
    const secret = 'PRIVATE_PEER_FIELDS'
    vi.spyOn(RemoteNodeClient.prototype, 'listSkills').mockResolvedValueOnce({
      sessionId: 'session', provider: 'claude', scope: 'workspace', capturedAt,
      message: secret, computerId: 'attacker', config: { secret }, env: { secret },
      skills: [{ name: 'safe', path: secret, description: 'Safe metadata', command: secret }],
    } as unknown as SessionSkillsSnapshot)
    const response = await get('skills')
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ computerId: computer.id, provider: 'claude', scope: 'workspace', skills: [{ name: 'safe' }] })
    expect(response.body).not.toContain(secret)
    expect(response.body).not.toContain('attacker')
  })

  it.each([false, true])('rejects outstanding metadata after unpairing (re-pair=%s)', async (repair) => {
    const { hub, computer, nodeService, pairing, get } = await pairedFixture()
    const pending = hold<SessionSkillsSnapshot>()
    const snapshot: SessionSkillsSnapshot = {
      sessionId: 'session', provider: 'claude', scope: 'session', capturedAt,
      skills: [{ name: 'stale-response' }],
    }
    releases.push(() => pending.resolve(snapshot))
    nodeService.listSkills.mockReturnValueOnce(pending.promise)
    const reading = get('skills').then((response) => response)
    await vi.waitFor(() => expect(nodeService.listSkills).toHaveBeenCalled())
    await hub.manager!.removeComputer(computer.id)
    if (repair) await hub.manager!.registerComputer(pairing)
    pending.resolve(snapshot)
    const response = await reading
    // Cancellation settles at removal, before any later registration exists.
    expect(response.statusCode).toBe(404)
    expect(response.body).not.toContain('stale-response')
    if (repair) expect((await get('skills')).json().skills[0].name).toBe('node-skill')
  })

  it.each(['cwd', 'provider', 'remove'] as const)('discards a resource read when the session changes %s', async (change) => {
    const { nodeService, get } = await pairedFixture()
    const pending = hold<SessionMcpServersSnapshot>()
    const snapshot: SessionMcpServersSnapshot = {
      sessionId: 'session', provider: 'claude', scope: 'session', capturedAt, servers: [{ name: 'old-server', status: 'connected' }],
    }
    releases.push(() => pending.resolve(snapshot))
    nodeService.listMcpServers.mockReturnValueOnce(pending.promise)
    const reading = get('mcp').then((response) => response)
    await vi.waitFor(() => expect(nodeService.listMcpServers).toHaveBeenCalled())
    if (change === 'remove') {
      nodeService.emit('event', { type: 'session.removed', sessionId: 'session' })
    } else {
      if (change === 'cwd') nodeService.session.cwd = '/fixture/new-folder'
      else nodeService.session.provider = 'copilot'
      nodeService.emit('event', { type: 'session.upserted', session: structuredClone(nodeService.session) })
    }
    pending.resolve(snapshot)
    const response = await reading
    expect(response.statusCode).toBe(409)
    expect(response.body).not.toContain('old-server')
  })

  it('refuses new and outstanding hub-local reads after manager stop', async () => {
    const { hub, hubService, get } = await pairedFixture()
    const pending = hold<SessionSkillsSnapshot>()
    const snapshot: SessionSkillsSnapshot = {
      sessionId: 'session', provider: 'copilot', scope: 'session', capturedAt, skills: [],
    }
    releases.push(() => pending.resolve(snapshot))
    hubService.listSkills.mockReturnValueOnce(pending.promise)
    const reading = get('skills', hub.identity.info.id).then((response) => response)
    await vi.waitFor(() => expect(hubService.listSkills).toHaveBeenCalled())
    hub.manager!.stop()
    pending.resolve(snapshot)
    expect((await reading).statusCode).toBe(503)
    expect((await get('mcp', hub.identity.info.id)).statusCode).toBe(503)
    expect(hubService.listMcpServers).not.toHaveBeenCalled()
  })
})

describe('provider resource aggregation', () => {
  it.each(['copilot', 'claude'] as const)('routes %s snapshots to the owning provider and advertises support', async (provider) => {
    const copilot = new ResourceService('copilot')
    const claude = new ResourceService('claude')
    copilot.session.id = 'copilot-session'
    claude.session.id = 'claude-session'
    const service = new ProviderSessionService(copilot.service(), claude.service())
    const own = provider === 'copilot' ? copilot : claude
    const other = provider === 'copilot' ? claude : copilot
    expect(await service.listSkills(own.session.id)).toMatchObject({ sessionId: own.session.id, provider })
    expect(await service.listMcpServers(own.session.id)).toMatchObject({ sessionId: own.session.id, provider })
    expect(other.listSkills).not.toHaveBeenCalled()
    expect(other.listMcpServers).not.toHaveBeenCalled()
    expect(service.providers().every((entry) => entry.supportsSessionResources)).toBe(true)
    await service.stop()
    await expect(service.listSkills(own.session.id)).rejects.toMatchObject({ statusCode: 503 })
  })

  it('reports optional missing methods, missing sessions, and provider replacement honestly', async () => {
    const copilot = new ResourceService('copilot')
    const claude = new ResourceService('claude')
    claude.present = false
    const service = new ProviderSessionService(copilot.service(), claude.service())
    await expect(service.listSkills('missing')).rejects.toMatchObject({ statusCode: 404 })
    copilot.supported = false
    expect(await service.listSkills('session')).toMatchObject({ scope: 'unavailable' })
    expect(copilot.listSkills).not.toHaveBeenCalled()
    copilot.supported = true
    const pending = hold<SessionSkillsSnapshot>()
    copilot.listSkills.mockReturnValueOnce(pending.promise)
    const reading = service.listSkills('session').catch((error: unknown) => error)
    copilot.present = false
    claude.present = true
    pending.resolve({ sessionId: 'session', provider: 'copilot', scope: 'session', capturedAt, skills: [] })
    expect(await reading).toMatchObject({ statusCode: 409 })
  })
})
