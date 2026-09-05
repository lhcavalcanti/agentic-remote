import { once } from 'node:events'
import { createServer, type RequestListener, type Server } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RemoteNodeClient } from './remote-node-client.js'

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
  vi.restoreAllMocks()
  await Promise.all(servers.splice(0).map((server) => {
    const closed = new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
    server.closeAllConnections()
    return closed
  }))
})

describe('read-only remote resource requests', () => {
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
        response.end(JSON.stringify({ id: 'paired-node', name: 'Redirected node', version: '0.35.0' }))
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
