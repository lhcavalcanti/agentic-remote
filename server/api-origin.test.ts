import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'
import type { SessionDetail } from '../shared/contracts.js'

const prefixes = ['/api', '/%61pi', '/a%70i', '/ap%69', '/%61%70%69']
const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }
const untrusted = [
  { host: 'hub.example.test', origin: 'https://attacker.example.test' },
  { host: 'attacker.example.test' },
  { host: 'attacker.example.test', origin: 'https://hub.example.test' },
]
const session: SessionDetail = {
  id: 'review-session', cwd: '/', title: 'Synthetic review session',
  updatedAt: '2026-09-04T00:00:00.000Z', status: 'idle', isOpen: true, messages: [],
}
let directory: string
let runtime: Awaited<ReturnType<typeof buildApp>>

beforeEach(async () => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  directory = await mkdtemp(path.join(tmpdir(), 'agentic-origin-review-'))
  // Services are never started; no provider process or inference is needed.
  runtime = await buildApp({
    dataDirectory: directory,
    logger: false,
    transcriptionService: {
      initialize: async () => undefined,
      stop: async () => undefined,
      transcribe: vi.fn(),
    },
  })
  vi.spyOn(runtime.service, 'sendMessage').mockResolvedValue(session)
})

afterEach(async () => {
  await runtime?.app.close()
  if (directory) await rm(directory, { recursive: true, force: true })
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('canonical API origin enforcement', () => {
  it.each(prefixes)('rejects untrusted reads and mutations through %s', async (prefix) => {
    for (const headers of untrusted) {
      const read = await runtime.app.inject({
        url: `${prefix}/computers`, headers,
      })
      expect(read.statusCode).toBe(403)
      const write = await runtime.app.inject({
        method: 'POST',
        url: `${prefix}/computers/${runtime.identity.info.id}/sessions/${session.id}/messages`,
        headers,
        payload: { content: 'Synthetic message, never dispatched' },
      })
      expect(write.statusCode).toBe(403)
    }
    expect(runtime.service.sendMessage).not.toHaveBeenCalled()
  })

  it.each(prefixes)('rejects an untrusted event WebSocket through %s', async (prefix) => {
    await runtime.app.ready()
    for (const headers of untrusted) {
      await expect(
        runtime.app.injectWS(`${prefix}/events`, { headers }).then((socket) => {
          socket.terminate()
          throw new Error('The untrusted WebSocket was accepted')
        }),
      ).rejects.toThrow(/403/)
    }
  })

  it('guards separately registered APIs before parsing their payloads', async () => {
    for (const [method, route] of [
      ['GET', '/version'],
      ['GET', '/push/settings'],
      ['POST', '/push/subscriptions'],
      ['POST', '/transcriptions'],
      ['POST', `/computers/${runtime.identity.info.id}/sessions/${session.id}/files`],
    ] as const) {
      const response = await runtime.app.inject({
        method, url: `/%61pi${route}`, headers: untrusted[0],
      })
      expect(response.statusCode, route).toBe(403)
    }
  })

  it('allows trusted encoded HTTP routes and event upgrades', async () => {
    const response = await runtime.app.inject({
      url: '/%61pi/computers', headers: trusted,
    })
    expect(response.statusCode).toBe(200)
    const socket = await runtime.app.injectWS('/%61pi/events', { headers: trusted })
    try {
      const received = new Promise<string>((resolve) =>
        socket.once('message', (data) => resolve(data.toString())),
      )
      runtime.manager?.emit('event', {
        type: 'session.upserted',
        session: {
          ...session, computerId: runtime.identity.info.id, computerName: 'Review hub',
        },
      })
      expect(JSON.parse(await received)).toMatchObject({
        type: 'session.upserted', session: { id: session.id },
      })
    } finally {
      socket.terminate()
    }
  })

  it('preserves node-token protection and non-API health access', async () => {
    const unknownApi = await runtime.app.inject({
      url: '/api/not-registered', headers: untrusted[0],
    })
    expect(unknownApi.statusCode).toBe(403)
    const node = await runtime.app.inject({
      url: '/%6eode-api/info', headers: untrusted[0],
    })
    expect(node.statusCode).toBe(401)
    const health = await runtime.app.inject({
      url: '/health', headers: untrusted[0],
    })
    expect(health.statusCode).toBe(200)
  })
})
