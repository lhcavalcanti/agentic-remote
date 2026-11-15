import { once } from 'node:events'
import { createServer, type RequestListener, type Server } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RemoteNodeClient } from './remote-node-client.js'
import { TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS } from '../shared/terminal-timing.js'

const servers: Server[] = []
const session = {
  id: 'local-session', title: 'Untouched hub session', cwd: '/fixture',
  updatedAt: '2026-09-05T00:00:00.000Z', status: 'idle', isOpen: true, messages: [],
}

async function listen(handler: RequestListener): Promise<string> {
  const server = createServer(handler)
  servers.push(server)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Fixture server has no TCP address')
  return `http://127.0.0.1:${address.port}`
}

function client(baseUrl: string): RemoteNodeClient {
  return new RemoteNodeClient({
    id: 'paired-node', name: 'Synthetic paired node', baseUrl, token: 'fixture-node-token',
  })
}

afterEach(async () => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  await Promise.all(servers.splice(0).map((server) => {
    const closed = new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
    server.closeAllConnections()
    return closed
  }))
})

describe('host telemetry request safety', () => {
  const info = { id: 'paired-node', name: 'Fictional node', version: '1.0.0', hostTelemetry: { version: 1, enabled: true } }

  it('classifies malformed capability JSON as invalid telemetry rather than a connection failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('{not-json', {
      headers: { 'content-type': 'application/json' },
    }))
    await expect(client('http://fixture.invalid').hostTelemetryTarget()).rejects.toMatchObject({
      statusCode: 502, message: 'This computer returned invalid host telemetry',
    })
  })

  it.each(['snapshot', 'history', 'processes'] as const)('keeps session connectivity online when a slow %s read times out', async (read) => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json(info))
    const owner = client('http://fixture.invalid')
    const target = await owner.hostTelemetryTarget()
    const status = vi.fn()
    owner.on('status', status)
    vi.useFakeTimers()
    const controller = new AbortController()
    vi.spyOn(AbortSignal, 'timeout').mockImplementationOnce((ms) => {
      setTimeout(() => controller.abort(new DOMException('Synthetic slow host read', 'TimeoutError')), ms)
      return controller.signal
    })
    fetch.mockImplementationOnce(async (_url, init) => new Promise((_resolve, reject) => {
      init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason), { once: true })
    }))
    const pending = expect(target[read]()).rejects.toMatchObject({ statusCode: 503 })
    await vi.advanceTimersByTimeAsync(5001)
    await pending
    expect(owner.online).toBe(true)
    expect(status).not.toHaveBeenCalled()
    fetch.mockResolvedValueOnce(Response.json({ session }))
    await expect(owner.getSession(session.id)).resolves.toEqual(session)
    owner.stop()
  })

  it('rejects malformed peer snapshots, history and inventories as upstream failures', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json(info))
    const target = await client('http://fixture.invalid').hostTelemetryTarget()
    for (const read of [target.snapshot, target.history, target.processes]) {
      fetch.mockResolvedValueOnce(Response.json({ unexpected: 'fictional' }))
      await expect(read()).rejects.toMatchObject({ statusCode: 502 })
    }
  })

  it('bounds every telemetry read, refuses redirects and authenticates without forwarding the token', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json(info))
    const owner = client('http://fixture.invalid')
    const target = await owner.hostTelemetryTarget()
    fetch.mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'http://elsewhere.invalid' } }))
    await expect(target.snapshot()).rejects.toMatchObject({ statusCode: 502 })
    expect(fetch).toHaveBeenCalledTimes(2)
    const init = fetch.mock.calls[1][1]!
    expect(init.redirect).toBe('manual')
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer fixture-node-token')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    owner.stop()
    expect(init.signal!.aborted).toBe(true)
  })

  it('maps connection failures and sampler request timeouts to a retryable computer-unavailable state', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Synthetic disconnect'))
    const owner = client('http://fixture.invalid')
    await expect(owner.hostTelemetryTarget()).rejects.toMatchObject({ statusCode: 503 })
    fetch.mockResolvedValueOnce(Response.json(info))
    const target = await owner.hostTelemetryTarget()
    fetch.mockRejectedValueOnce(new DOMException('Synthetic timeout', 'TimeoutError'))
    await expect(target.snapshot()).rejects.toMatchObject({ statusCode: 503 })
    owner.stop()
  })
})

describe('launch identity response safety', () => {
  it('does not silently accept creation or delivery responses that omitted required identity evidence', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json({ session }))
    const owner = client('http://fixture.invalid')
    await expect(owner.createSession({ cwd: '/fixture', launchId: 'run' })).rejects.toMatchObject({
      statusCode: 502, uncertainDelivery: true,
    })
    fetch.mockResolvedValueOnce(Response.json({ session }))
    await expect(owner.sendMessage(session.id, { content: 'Root', deliveryId: 'root' })).rejects.toMatchObject({
      statusCode: 502, uncertainDelivery: true,
    })
    fetch.mockResolvedValueOnce(Response.json({ session }))
    await expect(owner.sendMessage(session.id, { content: 'Legacy message' })).resolves.toEqual(session)
  })

  it.each([
    {},
    { launch: { launchId: 'other', sessionId: 'session', receipts: [] } },
    { launch: { launchId: 'run', sessionId: 'session', receipts: [{ deliveryId: 'root', sessionId: 'other' }] } },
  ])('does not turn a malformed or mismatched reconciliation into absence (%j)', async (payload) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json(payload))
    await expect(client('http://fixture.invalid').reconcileLaunch('run')).rejects.toThrow()
  })

  it('only treats an explicit null reconciliation as an unknown token', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json({ launch: null }))
    await expect(client('http://fixture.invalid').reconcileLaunch('run')).resolves.toBeUndefined()
  })

  it.each([
    {},
    { sessionId: 'other', outcome: 'stopped', checkedAt: '2026-11-14T06:00:00Z', scope: 'provider-owned' },
  ])('does not acknowledge termination on malformed or mismatched evidence (%j)', async (payload) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json(payload))
    await expect(client('http://fixture.invalid').cancelWithAck('session', 100)).resolves.toMatchObject({
      sessionId: 'session', outcome: 'unknown',
    })
  })

  it('keeps transport failure unknown instead of reporting the work stopped', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Synthetic disconnect'))
    await expect(client('http://fixture.invalid').cancelWithAck('session', 100)).resolves.toMatchObject({
      sessionId: 'session', outcome: 'unknown',
    })
  })
})

describe('session Knowledge base requests', () => {
  it('encodes the session, authenticates the PUT, and returns the canonical path', async () => {
    const requests: Array<{
      path?: string
      method?: string
      authenticated: boolean
      body: string
    }> = []
    const node = await listen((request, response) => {
      let body = ''
      request.setEncoding('utf8')
      request.on('data', (chunk) => { body += chunk })
      request.on('end', () => {
        requests.push({
          path: request.url,
          method: request.method,
          authenticated:
            request.headers.authorization ===
            ['Bearer', 'fixture-node-token'].join(' '),
          body,
        })
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify({
          path: '/srv/project/knowledge',
          confinementPath: '/srv/project',
        }))
      })
    })

    await expect(
      client(node).ensureSessionKnowledgeBase(
        'session/id',
        'docs/knowledge',
        true,
      ),
    ).resolves.toEqual({
      path: '/srv/project/knowledge',
      confinementPath: '/srv/project',
    })
    expect(requests).toEqual([{
      path: '/node-api/sessions/session%2Fid/knowledge-base',
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify({ path: 'docs/knowledge', create: true }),
    }])
  })

  it('maps an unreachable paired owner to a retryable service error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new TypeError('PRIVATE_TRANSPORT_DETAIL'),
    )

    const error = await client(
      'http://fixture.invalid',
    ).ensureSessionKnowledgeBase(
      'session',
      'knowledge',
      true,
    ).catch((caught: unknown) => caught)
    expect(error).toMatchObject({
      statusCode: 503,
      message: expect.not.stringContaining('PRIVATE_TRANSPORT_DETAIL'),
    })
    expect(error).not.toHaveProperty('uncertainDelivery')
  })

  it('maps an owner HTTP 503 to a non-submission service error', async () => {
    const node = await listen((_request, response) => {
      response.writeHead(503, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'PRIVATE_NODE_DETAIL' }))
    })

    const error = await client(node).ensureSessionKnowledgeBase(
      'session',
      'knowledge',
      true,
    ).catch((caught: unknown) => caught)

    expect(error).toMatchObject({
      statusCode: 503,
      message: expect.not.stringContaining('PRIVATE_NODE_DETAIL'),
    })
    expect(error).not.toHaveProperty('uncertainDelivery')
  })
})

describe('session Knowledge read confinement', () => {
  it('sends the original session cwd with every paired-node read', async () => {
    const paths: string[] = []
    const node = await listen((request, response) => {
      paths.push(request.url ?? '')
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(
        request.url?.includes('/file?')
          ? {
              name: 'note.md',
              path: 'note.md',
              kind: 'markdown',
              mimeType: 'text/plain; charset=utf-8',
              size: 4,
              content: 'note',
              confinementApplied: true,
            }
          : { path: '.', entries: [], confinementApplied: true },
      ))
    })
    const remote = client(node)

    await remote.listKnowledge(
      '/srv/project/knowledge',
      '.',
      '/srv/project',
    )
    await remote.readKnowledgeFile(
      '/srv/project/knowledge',
      'note.md',
      '/srv/project',
    )

    expect(paths).toEqual([
      '/node-api/knowledge/entries?root=%2Fsrv%2Fproject%2Fknowledge&path=.&confinement=%2Fsrv%2Fproject',
      '/node-api/knowledge/file?root=%2Fsrv%2Fproject%2Fknowledge&path=note.md&confinement=%2Fsrv%2Fproject',
    ])
  })

  it.each(['list', 'file'] as const)(
    'rejects a confined %s response from a node that did not enforce it',
    async (operation) => {
      const node = await listen((request, response) => {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(
          request.url?.includes('/file?')
            ? {
                name: 'private.md',
                path: 'private.md',
                kind: 'markdown',
                mimeType: 'text/plain; charset=utf-8',
                size: 7,
                content: 'private',
              }
            : { path: '.', entries: [] },
        ))
      })
      const remote = client(node)

      const reading = operation === 'list'
        ? remote.listKnowledge('/srv/project/knowledge', '.', '/srv/project')
        : remote.readKnowledgeFile(
            '/srv/project/knowledge',
            'private.md',
            '/srv/project',
          )

      await expect(reading).rejects.toMatchObject({ statusCode: 409 })
    },
  )
})

describe('read-only remote resource requests', () => {
  it.each([true, false])('requests archived snapshot metadata only from retention-capable nodes (%s)', async (retention) => {
    const paths: string[] = []
    const node = await listen((request, response) => {
      paths.push(request.url ?? '')
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ sessions: [] }))
    })

    const remote = client(node)
    vi.spyOn(remote, 'providers', 'get').mockReturnValue([{
      id: 'copilot', name: 'Copilot', available: true, terminalBacked: true,
      supportsSessionRetention: retention,
    }])
    await remote.listSessions()
    expect(paths).toEqual([retention ? '/node-api/sessions?includeArchived=1' : '/node-api/sessions'])
  })

  const snapshot = {
    sessionId: 'remote/session', provider: 'claude', scope: 'session', capturedAt: '2026-09-05T10:00:00.000Z',
  }

  it.each([307, 308])('preserves a trusted HTTP %i redirect diagnostic for resource reads', async (statusCode) => {
    let redirected = 0
    const node = await listen((request, response) => {
      if (request.url?.startsWith('/redirect-target')) {
        redirected += 1
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end('{}')
      } else {
        response.writeHead(statusCode, { location: '/redirect-target?secret=PRIVATE_LOCATION' })
        response.end('PRIVATE_REDIRECT_BODY')
      }
    })
    const error = await client(node).listSkills('remote/session', 'claude').catch((value: unknown) => value)
    expect(error).toMatchObject({
      statusCode: 502,
      message: expect.stringContaining(`HTTP ${statusCode} redirect`),
    })
    expect(String(error)).toContain('final node URL')
    expect(String(error)).not.toContain('PRIVATE')
    expect(redirected).toBe(0)
  })

  it('encodes the session identity, authenticates GETs, and strips arbitrary metadata', async () => {
    const requests: { path?: string; method?: string; authenticated: boolean }[] = []
    const node = await listen((request, response) => {
      requests.push({ path: request.url, method: request.method, authenticated: request.headers.authorization === 'Bearer fixture-node-token' })
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify({
        ...snapshot, computerId: 'PRIVATE_COMPUTER', env: { TOKEN: 'PRIVATE_ENV' },
        host: { fullConfig: { command: 'PRIVATE_COMMAND' } }, message: 'PRIVATE_ERROR',
        ...(request.url?.endsWith('/skills')
          ? { skills: [{ name: 'review', path: 'PRIVATE_PATH', description: 'Safe summary' }] }
          : { servers: [{ name: 'docs', status: 'failed', error: 'PRIVATE_ERROR', config: { url: 'PRIVATE_URL' } }] }),
      }))
    })
    const remote = client(node)
    const skills = await remote.listSkills('remote/session', 'claude')
    const mcp = await remote.listMcpServers('remote/session', 'claude')
    expect(JSON.stringify({ skills, mcp })).not.toContain('PRIVATE')
    expect(skills.skills).toMatchObject([{ name: 'review', description: 'Safe summary' }])
    expect(mcp.servers).toMatchObject([{ name: 'docs', status: 'failed' }])
    expect(requests).toEqual([
      { path: '/node-api/sessions/remote%2Fsession/skills', method: 'GET', authenticated: true },
      { path: '/node-api/sessions/remote%2Fsession/mcp', method: 'GET', authenticated: true },
    ])
  })

  it.each([401, 403, 404, 409, 500, 503])('never relays raw peer HTTP %i diagnostics', async (statusCode) => {
    const node = await listen((_request, response) => {
      response.writeHead(statusCode, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'PRIVATE_AUTH_HEADER_AND_URL' }))
    })
    const error = await client(node).listSkills('remote/session', 'claude').catch((error: unknown) => error)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).not.toContain('PRIVATE')
  })

  it('validates the returned provider and refuses all requests after stopping', async () => {
    let requests = 0
    const node = await listen((_request, response) => {
      requests += 1
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ ...snapshot, provider: 'copilot', skills: [] }))
    })
    const remote = client(node)
    await expect(remote.listSkills('remote/session', 'claude')).rejects.toMatchObject({ statusCode: 502 })
    remote.stop()
    await expect(remote.listMcpServers('remote/session', 'claude')).rejects.toMatchObject({ statusCode: 503 })
    expect(requests).toBe(1)
  })
})

describe('paired-node redirect isolation', () => {
  it('keeps startup-capable mutations alive for both readiness budgets without extending polls', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout')
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ session, sessions: [] }), {
        headers: { 'content-type': 'application/json' },
      }))
    const remote = client('http://fixture.invalid')
    for (const operation of [
      () => remote.createSession({ cwd: '/fixture', provider: 'copilot', terminalBacked: true }),
      () => remote.activateSession('fixture'),
      () => remote.clearConversation('fixture'),
      () => remote.resumeSession('fixture'),
      () => remote.restartSession('fixture'),
      () => remote.moveToTerminal('fixture'),
      () => remote.sendMessage('fixture', { content: 'Startup admission' }),
      () => remote.executeCommand('fixture', { command: '/usage' }),
    ]) {
      await operation()
      expect(timeout).toHaveBeenLastCalledWith(TERMINAL_REQUEST_TIMEOUT_MS)
    }
    expect(TERMINAL_REQUEST_TIMEOUT_MS).toBeGreaterThan(2 * TERMINAL_STARTUP_TIMEOUT_MS)
    await remote.listSessions()
    expect(timeout).toHaveBeenLastCalledWith(15_000)
  })

  it.each([307, 308])('keeps redirected queued delivery unknown without touching the hub after HTTP %i', async (status) => {
    let localMutations = 0
    const target = await listen((request, response) => {
      request.resume()
      localMutations += 1
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ session }))
    })
    let attempts = 0
    const node = await listen((request, response) => {
      attempts += 1
      request.resume()
      request.on('end', () => {
        response.writeHead(status, { location: `${target}/api/computers/hub/sessions/local/messages` })
        response.end()
      })
    })

    const result = await client(node).dispatchQueuedPrompt('remote-session', 'queued', 'Only for the node')
    expect(localMutations).toBe(0)
    expect(attempts).toBe(1)
    expect(result).toMatchObject({ outcome: 'uncertain', promptId: 'queued', delivery: 'unknown' })
    expect(result.attemptId).toBeUndefined()
  })

  it.each([false, true])('preserves paired-node delivery uncertainty=%s', async (uncertainDelivery) => {
    const node = await listen((request, response) => {
      request.resume()
      request.on('end', () => {
        response.writeHead(409, { 'content-type': 'application/json' })
        response.end(JSON.stringify({
          error: 'Synthetic node refusal',
          terminalDraftConflict: true,
          uncertainDelivery,
        }))
      })
    })

    await expect(client(node).sendMessage('remote-session', { content: 'Direct request' }))
      .rejects.toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery,
        message: 'Synthetic node refusal',
      })
  })

  it('keeps a legacy paired-node HTTP 409 conservative', async () => {
    const node = await listen((request, response) => {
      request.resume()
      request.on('end', () => {
        response.writeHead(409, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ error: 'Legacy node conflict' }))
      })
    })
    await expect(client(node).sendMessage('remote-session', { content: 'Direct request' }))
      .rejects.toMatchObject({
        statusCode: 409,
        uncertainDelivery: true,
        message: 'Legacy node conflict',
      })
  })

  it.each([307, 308])('does not replay a POST into a hub-local route after HTTP %i', async (status) => {
    const mutations: { url?: string; body: string }[] = []
    const target = await listen((request, response) => {
      const chunks: Buffer[] = []
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => {
        mutations.push({ url: request.url, body: Buffer.concat(chunks).toString() })
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ session }))
      })
    })
    const nodeRequests: { path?: string; body: string }[] = []
    const node = await listen((request, response) => {
      const chunks: Buffer[] = []
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => {
        nodeRequests.push({ path: request.url, body: Buffer.concat(chunks).toString() })
        response.writeHead(status, { location: `${target}/api/computers/hub/sessions/local/messages` })
        response.end()
      })
    })
    const remote = client(node)
    const input = { content: 'This belongs only to the paired node', enqueue: false }
    const result = await remote.sendMessage('remote-session', input).then(
      () => undefined,
      (error: unknown) => error,
    )

    expect(mutations).toEqual([])
    expect(result).toMatchObject({
      name: 'RemoteNodeRedirectError',
      statusCode: 502,
      message: expect.stringContaining(`HTTP ${status} redirect`),
    })
    expect(String(result)).toContain('final node URL')
    expect(nodeRequests).toEqual([{
      path: '/node-api/sessions/remote-session/messages', body: JSON.stringify(input),
    }])
    expect(remote.online).toBe(false)
  })

  it.each([307, 308])('does not forward binary upload data after HTTP %i', async (status) => {
    const leaked: Buffer[] = []
    const target = await listen((request, response) => {
      request.on('data', (chunk: Buffer) => leaked.push(chunk))
      request.on('end', () => {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ file: { name: 'fixture.txt', path: '/fixture', size: 16 } }))
      })
    })
    const received: Buffer[] = []
    let requests = 0
    const node = await listen((request, response) => {
      requests += 1
      request.on('data', (chunk: Buffer) => received.push(chunk))
      request.on('end', () => {
        response.writeHead(status, { location: `${target}/upload` })
        response.end()
      })
    })
    const bytes = Buffer.from('Synthetic private attachment')
    const result = await client(node).uploadFile('remote-session', 'fixture.txt', bytes).then(
      () => undefined,
      (error: unknown) => error,
    )

    expect(leaked).toEqual([])
    expect(result).toMatchObject({
      name: 'RemoteNodeRedirectError',
      statusCode: 502,
      message: expect.stringContaining(`HTTP ${status} redirect`),
    })
    expect(Buffer.concat(received)).toEqual(bytes)
    expect(requests).toBe(1)
  })

  it.each([301, 302, 303, 307, 308])('refuses same-origin information redirects after HTTP %i', async (status) => {
    const requests: (string | undefined)[] = []
    const node = await listen((request, response) => {
      requests.push(request.url)
      if (request.url === '/node-api/info') {
        response.writeHead(status, { location: '/redirected-info' })
        response.end()
      } else {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ id: 'paired-node', name: 'Redirected node', version: '1.0.0' }))
      }
    })

    await expect(client(node).getInfo()).rejects.toMatchObject({
      name: 'RemoteNodeRedirectError',
      statusCode: 502,
      message: expect.stringContaining(`HTTP ${status} redirect`),
    })
    expect(requests).toEqual(['/node-api/info'])
  })

  it('reports a redirect even when its Location header is missing', async () => {
    const node = await listen((_request, response) => {
      response.writeHead(307)
      response.end('A redirect without a destination')
    })
    await expect(client(node).getInfo()).rejects.toMatchObject({
      name: 'RemoteNodeRedirectError',
      statusCode: 502,
      message: expect.stringContaining('HTTP 307 redirect'),
    })
  })

  it('keeps the redirect reason when cancelling its unread body fails', async () => {
    const cleanupError = new Error('Synthetic body cancellation failure')
    const cancel = vi.fn(async () => { throw cleanupError })
    const response = new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"error":"Untrusted redirect body"}'))
        controller.close()
      },
      cancel,
    }), { status: 308, headers: { location: 'https://example.invalid/private?secret=do-not-display' } })
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
    const result = await client('http://fixture.invalid').getInfo().then(
      () => undefined,
      (error: unknown) => error,
    )
    expect(result).toMatchObject({
      name: 'RemoteNodeRedirectError',
      statusCode: 502,
      message: expect.stringContaining('HTTP 308 redirect'),
      cause: cleanupError,
    })
    expect(String(result)).not.toContain('do-not-display')
    expect(String(result)).not.toContain('Untrusted redirect body')
    expect(cancel).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(
      'http://fixture.invalid/node-api/info',
      expect.objectContaining({ redirect: 'manual' }),
    )
  })

  it('preserves direct authenticated requests without redirecting or retrying', async () => {
    const received: { path?: string; authorization?: string; body: string }[] = []
    const node = await listen((request, response) => {
      const chunks: Buffer[] = []
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => {
        received.push({
          path: request.url, authorization: request.headers.authorization,
          body: Buffer.concat(chunks).toString(),
        })
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ session }))
      })
    })
    const remote = client(node)
    await expect(remote.sendMessage('remote-session', { content: 'Direct request' })).resolves.toEqual(session)
    expect(received).toEqual([{
      path: '/node-api/sessions/remote-session/messages',
      authorization: 'Bearer fixture-node-token',
      body: JSON.stringify({ content: 'Direct request' }),
    }])
    expect(remote.online).toBe(true)
  })
})
