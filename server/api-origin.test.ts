import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'
import type { SessionDetail } from '../shared/contracts.js'
import { HostTelemetryService } from './host-telemetry/service.js'
import { HostTelemetrySampler } from './host-telemetry/sampler.js'
import { readingFixture } from './host-telemetry/test-fixtures.js'

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
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', 'on')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'on')
  vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', 'on')
  directory = await mkdtemp(path.join(process.cwd(), '.agentic-origin-review-'))
  // Services are never started; no provider process or inference is needed.
  runtime = await buildApp({
    dataDirectory: directory,
    logger: false,
    hostTelemetryFactory: (dataDirectory, context) => new HostTelemetryService(
      new HostTelemetrySampler({ dataDirectory, reader: async () => readingFixture() }), context,
    ),
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
  it.each(prefixes)('guards host reads and live subscriptions through %s', async (prefix) => {
    const base = `${prefix}/computers/${runtime.identity.info.id}/host`
    for (const headers of untrusted) {
      for (const suffix of ['', '/history?range=24h', '/processes', '/live']) {
        expect((await runtime.app.inject({ url: base + suffix, headers })).statusCode).toBe(403)
      }
      await expect(runtime.app.injectWS(`${base}/live`, { headers })).rejects.toThrow('403')
    }
    expect(runtime.hostTelemetry!.sampler.status().viewers).toBe(0)
    expect((await runtime.app.inject({ url: base, headers: trusted })).statusCode).toBe(200)
    expect((await runtime.app.inject({ url: `${base}/history?range=24h`, headers: trusted })).statusCode).toBe(200)
    const socket = await runtime.app.injectWS(`${base}/live`, { headers: trusted })
    expect(runtime.hostTelemetry!.sampler.status().viewers).toBe(1)
    socket.terminate()
  })

  it.each(prefixes)('guards every schedule and run route through %s', async (prefix) => {
    for (const [method, suffix] of [
      ['GET', ''], ['POST', ''], ['GET', '/example'], ['PATCH', '/example'], ['DELETE', '/example'],
      ['POST', '/example/enabled'], ['POST', '/example/archived'], ['POST', '/example/run'],
      ['GET', '/example/runs'], ['GET', '/runs'], ['GET', '/runs/run-id'], ['POST', '/runs/run-id/stop'],
    ] as const) {
      for (const headers of untrusted) {
        expect((await runtime.app.inject({ method, url: `${prefix}/schedules${suffix}`, headers })).statusCode).toBe(403)
      }
    }
    const listed = await runtime.app.inject({ url: `${prefix}/schedules`, headers: trusted })
    expect(listed.statusCode).toBe(200)
    expect(listed.json()).toEqual({ schedules: [] })
  })
  it.each(prefixes)('guards notification reads and every mutation through %s', async (prefix) => {
    for (const [method, suffix] of [
      ['GET', ''], ['GET', '/unread-count'], ['POST', '/read-all'],
      ['POST', `/${'a'.repeat(64)}/read`], ['POST', `/${'a'.repeat(64)}/dismiss`],
    ] as const) {
      for (const headers of untrusted) {
        expect((await runtime.app.inject({ method, url: `${prefix}/notifications${suffix}`, headers })).statusCode).toBe(403)
      }
    }
    const listed = await runtime.app.inject({ url: `${prefix}/notifications`, headers: trusted })
    expect(listed.statusCode).toBe(200)
    expect(listed.json()).toEqual({ notifications: [] })
    expect(await runtime.notificationCenter!.store.unreadCount()).toBe(0)
  })
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

  it.each(prefixes)('guards launch reconciliation and acknowledged cancellation through %s', async (prefix) => {
    for (const headers of untrusted) {
      expect((await runtime.app.inject({
        url: `${prefix}/computers/${runtime.identity.info.id}/launches/launch-identity`, headers,
      })).statusCode).toBe(403)
      expect((await runtime.app.inject({
        method: 'POST', url: `${prefix}/computers/${runtime.identity.info.id}/sessions/${session.id}/cancel-with-ack`,
        headers, payload: {},
      })).statusCode).toBe(403)
    }
  })

  it('guards separately registered APIs before parsing their payloads', async () => {
    for (const [method, route] of [
      ['GET', '/version'],
      ['GET', '/push/settings'],
      ['POST', '/push/subscriptions'],
      ['POST', '/transcriptions'],
      ['POST', `/computers/${runtime.identity.info.id}/sessions/${session.id}/files`],
      ['GET', `/computers/${runtime.identity.info.id}/launches/launch-identity`],
      ['POST', `/computers/${runtime.identity.info.id}/sessions/${session.id}/cancel-with-ack`],
    ] as const) {
      const response = await runtime.app.inject({
        method, url: `/%61pi${route}`, headers: untrusted[0],
      })
      expect(response.statusCode, route).toBe(403)
    }
  })

  it.each(prefixes)('guards the settings profile through %s and serves it to the trusted origin', async (prefix) => {
    for (const headers of untrusted) {
      const read = await runtime.app.inject({ url: `${prefix}/settings`, headers })
      expect(read.statusCode).toBe(403)
      const write = await runtime.app.inject({
        method: 'PATCH',
        url: `${prefix}/settings`,
        headers,
        payload: { changes: { accent: { value: 'rose', baseRevision: 0 } } },
      })
      expect(write.statusCode).toBe(403)
    }
    expect(runtime.settingsProfileStore?.snapshot().revision).toBe(0)
    const trustedRead = await runtime.app.inject({ url: `${prefix}/settings`, headers: trusted })
    expect(trustedRead.statusCode).toBe(200)
    expect(trustedRead.json().settings).toMatchObject({ revision: 0, values: {} })
  })

  it.each(prefixes)('guards effective feature flags through %s', async (prefix) => {
    for (const headers of untrusted) {
      expect((await runtime.app.inject({ url: `${prefix}/features`, headers })).statusCode).toBe(403)
    }
    const response = await runtime.app.inject({ url: `${prefix}/features`, headers: trusted })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      hubFlags: { notificationCenter: expect.any(Boolean), hostMonitor: expect.any(Boolean), scheduler: expect.any(Boolean) },
    })
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
