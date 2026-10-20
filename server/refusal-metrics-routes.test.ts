import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApp, type BuildAppOptions } from './app.js'
import { SubmissionError } from '../shared/submission-error.js'
import { TerminalDraftConflictError } from './terminal-session.js'
import { WorkspaceBrowserError } from './workspace-browser.js'

const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }
const sendRoute = '/api/computers/:computerId/sessions/:sessionId/messages'
const sessionId = 'synthetic-session-7f3a'
const prompt = 'Synthetic secret prompt, never dispatched'
const conflictMessage =
  'New terminal text appeared before the app draft could be sent. Nothing new was pasted.'

const directories: string[] = []
const runtimes: Awaited<ReturnType<typeof buildApp>>[] = []

async function start(options: Partial<BuildAppOptions> = {}) {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-refusals-'))
  directories.push(directory)
  // Services are never started; no provider process or inference is needed.
  const runtime = await buildApp({
    dataDirectory: directory,
    logger: false,
    managerAgent: false,
    transcriptionService: {
      initialize: async () => undefined,
      stop: async () => undefined,
      transcribe: vi.fn(),
    },
    ...options,
  })
  runtimes.push(runtime)
  return runtime
}

async function refusals(runtime: Awaited<ReturnType<typeof buildApp>>) {
  const response = await runtime.app.inject({ url: '/api/diagnostics/refusals', headers: trusted })
  expect(response.statusCode).toBe(200)
  return response.json() as {
    since: string
    refusals: Array<{
      route: string
      method: string
      status: number
      reason: string
      count: number
      firstAt: string
      lastAt: string
    }>
  }
}

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.app.close()))
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('refusal counting', () => {
  it('counts a refused send under its route template and reason, without content', async () => {
    const runtime = await start()
    vi.spyOn(runtime.service, 'sendMessage')
      .mockRejectedValue(new TerminalDraftConflictError('new-text'))
    const computerId = runtime.identity.info.id

    const response = await runtime.app.inject({
      method: 'POST',
      url: `/api/computers/${computerId}/sessions/${sessionId}/messages?draft=1`,
      headers: trusted,
      payload: { content: prompt },
    })

    expect(response.statusCode).toBe(409)
    // The refusal body is unchanged by counting.
    expect(response.body).toBe(
      `{"error":"${conflictMessage}","uncertainDelivery":false,"terminalDraftConflict":true}`,
    )
    const snapshot = await refusals(runtime)
    expect(snapshot.refusals).toEqual([{
      route: sendRoute,
      method: 'POST',
      status: 409,
      reason: 'terminal-draft-conflict.new-text',
      count: 1,
      firstAt: expect.any(String),
      lastAt: expect.any(String),
    }])
    expect(Date.parse(snapshot.since)).not.toBeNaN()
    const serialized = JSON.stringify(snapshot)
    for (const content of [conflictMessage, prompt, sessionId, computerId, 'draft=1']) {
      expect(serialized).not.toContain(content)
    }
  })

  it('counts a wrapped draft conflict under the conflict reason', async () => {
    const runtime = await start()
    vi.spyOn(runtime.service, 'sendMessage').mockRejectedValue(
      new SubmissionError(conflictMessage, 409, { sessionId, accepted: false, failedAt: 'synthetic' }, {
        cause: new TerminalDraftConflictError('new-text'),
        terminalDraftConflict: true,
        uncertainDelivery: false,
      }),
    )

    const response = await runtime.app.inject({
      method: 'POST',
      url: `/api/computers/${runtime.identity.info.id}/sessions/${sessionId}/messages`,
      headers: trusted,
      payload: { content: prompt },
    })

    expect(response.statusCode).toBe(409)
    expect(response.body).toBe(
      `{"error":"${conflictMessage}","submission":{"sessionId":"${sessionId}","accepted":false,"failedAt":"synthetic"},"uncertainDelivery":false,"terminalDraftConflict":true}`,
    )
    expect((await refusals(runtime)).refusals).toEqual([
      expect.objectContaining({
        route: sendRoute,
        status: 409,
        reason: 'terminal-draft-conflict.new-text',
        count: 1,
      }),
    ])
  })

  it('counts a policy 403 raised by a route', async () => {
    const runtime = await start()
    vi.spyOn(runtime.manager!, 'listWorkspace').mockRejectedValue(
      new WorkspaceBrowserError('Workspace browsing is restricted to the session folder', 403),
    )

    const response = await runtime.app.inject({
      url: `/api/computers/${runtime.identity.info.id}/sessions/${sessionId}/workspace?path=..%2Fsecret`,
      headers: trusted,
    })

    expect(response.statusCode).toBe(403)
    expect(response.body).toBe('{"error":"Workspace browsing is restricted to the session folder"}')
    const snapshot = await refusals(runtime)
    expect(snapshot.refusals).toEqual([
      expect.objectContaining({
        route: '/api/computers/:computerId/sessions/:sessionId/workspace',
        method: 'GET',
        status: 403,
        reason: 'http-403',
        count: 1,
      }),
    ])
    expect(JSON.stringify(snapshot)).not.toContain('secret')
  })

  it('counts a validation refusal as validation', async () => {
    const runtime = await start()
    const send = vi.spyOn(runtime.service, 'sendMessage')

    const response = await runtime.app.inject({
      method: 'POST',
      url: `/api/computers/${runtime.identity.info.id}/sessions/${sessionId}/messages`,
      headers: trusted,
      payload: { content: '   ' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toBe('{"error":"Message cannot be blank"}')
    expect(send).not.toHaveBeenCalled()
    expect((await refusals(runtime)).refusals).toEqual([
      expect.objectContaining({ route: sendRoute, method: 'POST', status: 400, reason: 'validation', count: 1 }),
    ])
  })

  it('counts direct refusals from hub routes', async () => {
    const runtime = await start()
    vi.spyOn(runtime.manager!, 'listKnowledge')
      .mockRejectedValue(Object.assign(new Error('Not Found'), { statusCode: 404 }))

    const conflict = await runtime.app.inject({
      method: 'POST',
      url: '/api/knowledge/roots',
      headers: trusted,
      payload: { computerId: runtime.identity.info.id, path: '/srv/synthetic' },
    })
    expect(conflict.statusCode).toBe(409)
    expect(conflict.body).toBe(
      `{"error":"${runtime.identity.info.name} does not support knowledge roots yet. Update it to the latest release."}`,
    )
    for (let index = 0; index < 2; index += 1) {
      const missing = await runtime.app.inject({
        method: 'DELETE',
        url: '/api/knowledge/roots/synthetic-root',
        headers: trusted,
      })
      expect(missing.statusCode).toBe(404)
      expect(missing.body).toBe('{"error":"Knowledge root not found"}')
    }

    expect((await refusals(runtime)).refusals).toEqual([
      expect.objectContaining({
        route: '/api/knowledge/roots/:rootId',
        method: 'DELETE',
        status: 404,
        reason: 'http-404',
        count: 2,
      }),
      expect.objectContaining({
        route: '/api/knowledge/roots',
        method: 'POST',
        status: 409,
        reason: 'knowledge-root.unsupported-node',
        count: 1,
      }),
    ])
  })

  it('does not count auth failures, origin refusals, unknown routes, or successes', async () => {
    const runtime = await start()

    expect((await runtime.app.inject({
      url: '/api/computers', headers: { host: 'attacker.example.test' },
    })).statusCode).toBe(403)
    expect((await runtime.app.inject({
      url: '/api/computers',
      headers: { host: trusted.host, origin: 'https://attacker.example.test' },
    })).statusCode).toBe(403)
    expect((await runtime.app.inject({ url: '/node-api/info' })).statusCode).toBe(401)
    expect((await runtime.app.inject({ url: '/api/wp-login.php', headers: trusted })).statusCode).toBe(404)
    expect((await runtime.app.inject({ url: '/.env' })).statusCode).toBe(404)
    expect((await runtime.app.inject({ url: '/api/computers', headers: trusted })).statusCode).toBe(200)

    expect((await refusals(runtime)).refusals).toEqual([])
  })

  it('logs one line per refusal with only the key fields', async () => {
    const lines: string[] = []
    const runtime = await start({
      logger: { level: 'info', stream: { write: (line: string) => lines.push(line) } },
    })
    vi.spyOn(runtime.service, 'sendMessage')
      .mockRejectedValue(new TerminalDraftConflictError('new-text'))
    const computerId = runtime.identity.info.id

    await runtime.app.inject({
      method: 'POST',
      url: `/api/computers/${computerId}/sessions/${sessionId}/messages`,
      headers: trusted,
      payload: { content: prompt },
    })

    const refused = lines
      .map((line) => JSON.parse(line) as Record<string, unknown>)
      .filter((entry) => entry.event === 'request.refused')
    expect(refused).toHaveLength(1)
    const [entry] = refused
    expect(entry).toMatchObject({
      level: 30,
      event: 'request.refused',
      route: sendRoute,
      method: 'POST',
      status: 409,
      reason: 'terminal-draft-conflict.new-text',
    })
    expect(Object.keys(entry).sort()).toEqual(
      ['event', 'hostname', 'level', 'method', 'pid', 'reason', 'route', 'status', 'time'],
    )
    const serialized = JSON.stringify(entry)
    for (const content of [conflictMessage, prompt, sessionId, computerId, trusted.host]) {
      expect(serialized).not.toContain(content)
    }
  })
})

describe('node refusals', () => {
  it('are logged by the node that refused them', async () => {
    const lines: string[] = []
    const runtime = await start({
      role: 'node',
      logger: { level: 'info', stream: { write: (line: string) => lines.push(line) } },
    })
    vi.spyOn(runtime.service, 'sendMessage')
      .mockRejectedValue(new TerminalDraftConflictError('unsent-text'))

    const response = await runtime.app.inject({
      method: 'POST',
      url: `/node-api/sessions/${sessionId}/messages`,
      headers: { authorization: `Bearer ${runtime.identity.token}` },
      payload: { content: prompt },
    })

    expect(response.statusCode).toBe(409)
    const refused = lines
      .map((line) => JSON.parse(line) as Record<string, unknown>)
      .filter((entry) => entry.event === 'request.refused')
    expect(refused).toEqual([expect.objectContaining({
      route: '/node-api/sessions/:sessionId/messages',
      method: 'POST',
      status: 409,
      reason: 'terminal-draft-conflict.unsent-text',
    })])
  })
})

describe('refusal diagnostics endpoint', () => {
  it('is guarded like the other hub API reads', async () => {
    const runtime = await start()
    for (const headers of [
      { host: 'attacker.example.test' },
      { host: 'attacker.example.test', origin: 'https://hub.example.test' },
      { host: trusted.host, origin: 'https://attacker.example.test' },
      {},
    ]) {
      const response = await runtime.app.inject({ url: '/api/diagnostics/refusals', headers })
      expect(response.statusCode).toBe(403)
      expect(response.body).toBe('{"error":"Origin is not allowed"}')
    }
    const allowed = await runtime.app.inject({ url: '/api/diagnostics/refusals', headers: trusted })
    expect(allowed.statusCode).toBe(200)
    expect(allowed.headers['cache-control']).toBe('no-store')
    expect(allowed.json()).toEqual({ since: expect.any(String), refusals: [] })
  })

  it('is not served by a node', async () => {
    const runtime = await start({ role: 'node' })
    const response = await runtime.app.inject({ url: '/api/diagnostics/refusals', headers: trusted })
    expect(response.statusCode).toBe(404)
  })
})
