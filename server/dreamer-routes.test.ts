import { randomUUID } from 'node:crypto'
import Fastify from 'fastify'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DreamerService,
} from './dreamer-service.js'
import { registerDreamerRoutes } from './dreamer-routes.js'

const directories: string[] = []
const apps: ReturnType<typeof Fastify>[] = []

async function setup() {
  const directory = path.join(process.cwd(), `.dreamer-routes-test-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  directories.push(directory)
  const service = new DreamerService(directory, {
    now: () => new Date('2026-10-29T04:00:00.000Z'),
    registry: () => ({
      'computer-a:session-a': {
        computerId: 'computer-a',
        sessionId: 'session-a',
        title: 'not persisted',
        origin: 'user',
        firstSeenAt: '2026-10-29T00:00:00.000Z',
        lastStatus: 'waiting',
        lastSeenAt: '2026-10-29T03:00:00.000Z',
      },
    }),
    memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    readSession: async (computerId, sessionId) => ({
      id: sessionId,
      revision: 7,
      computerId,
      computerName: 'development',
      cwd: '/home/tester/project',
      title: 'Review failed session',
      updatedAt: '2026-10-29T03:30:00.000Z',
      status: 'waiting',
      messages: [{
        id: 'completion-message',
        role: 'assistant',
        content: '**Done.** Verified result.',
        createdAt: '2026-10-29T03:20:00.000Z',
        taskCompletion: {
          source: 'root-task-complete',
          toolCallId: 'task-complete-call',
          completedAt: '2026-10-29T03:20:00.000Z',
        },
      }],
    }),
  })
  await service.initialize()
  const app = Fastify({ logger: false })
  app.setErrorHandler((error: unknown, _request, reply) => {
    const statusCode = typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 500
    void reply.code(statusCode).send({
      error: error instanceof Error ? error.message : 'Request failed',
    })
  })
  await registerDreamerRoutes(app, service)
  apps.push(app)
  return { app, service }
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('Dreamer routes', () => {
  it('validates and idempotently confirms authoritative completion evidence', async () => {
    const { app } = await setup()
    const initial = await app.inject({ url: '/api/manager/dreamer' })
    const enabled = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/settings',
      payload: {
        revision: initial.json().revision,
        enabled: true,
        timeZone: 'UTC',
      },
    })
    const plan = enabled.json()
    const item = plan.plan.items[0]
    expect(item.completionCandidate).toMatchObject({
      messageId: 'completion-message',
      resultDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
    })

    const payload = {
      revision: plan.revision,
      planId: plan.plan.id,
      completion: {
        itemId: item.id,
        computerId: item.completionCandidate.computerId,
        sessionId: item.completionCandidate.sessionId,
        sessionRevision: item.completionCandidate.sessionRevision,
        messageId: item.completionCandidate.messageId,
        resultDigest: item.completionCandidate.resultDigest,
      },
    }
    const completed = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload,
    })
    expect(completed.statusCode).toBe(200)
    expect(completed.json().plan.items[0]).toMatchObject({
      status: 'done',
      completion: {
        messageId: 'completion-message',
        resultDigest: item.completionCandidate.resultDigest,
      },
    })

    const duplicate = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload,
    })
    expect(duplicate.statusCode).toBe(200)
    expect(duplicate.json().revision).toBe(completed.json().revision)

    const malformed = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        ...payload,
        completion: { ...payload.completion, resultDigest: 'not-a-digest' },
      },
    })
    expect(malformed.statusCode).toBe(400)

    const mixed = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        ...payload,
        item: { id: item.id, status: 'skipped' },
      },
    })
    expect(mixed.statusCode).toBe(400)
  })

  it('returns direct snapshots and supports settings, reorder, skip, done, and restore', async () => {
    const { app } = await setup()
    const initial = await app.inject({ url: '/api/manager/dreamer' })
    expect(initial.statusCode).toBe(200)
    expect(initial.headers['cache-control']).toBe('no-store')
    expect(initial.json()).toMatchObject({
      available: true,
      settings: { enabled: false, timeZone: 'UTC' },
    })

    const enabled = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/settings',
      payload: { revision: initial.json().revision, enabled: true, timeZone: 'UTC' },
    })
    expect(enabled.statusCode).toBe(200)
    expect(enabled.json()).toMatchObject({ available: true, plan: { items: [{ sessionId: 'session-a' }] } })

    const plan = enabled.json()
    const skipped = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        revision: plan.revision,
        planId: plan.plan.id,
        item: { id: plan.plan.items[0].id, status: 'skipped' },
      },
    })
    expect(skipped.statusCode).toBe(200)
    expect(skipped.json().plan.items[0].status).toBe('skipped')

    const repeatedSkip = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        revision: plan.revision,
        planId: plan.plan.id,
        item: { id: plan.plan.items[0].id, status: 'skipped' },
      },
    })
    expect(repeatedSkip.statusCode).toBe(200)
    expect(repeatedSkip.json().revision).toBe(skipped.json().revision)

    const restored = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        revision: skipped.json().revision,
        planId: skipped.json().plan.id,
        item: { id: skipped.json().plan.items[0].id, status: 'pending' },
      },
    })
    expect(restored.statusCode).toBe(200)
    expect(restored.json().plan.items[0].status).toBe('pending')

    const unverifiedDone = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        revision: restored.json().revision,
        planId: restored.json().plan.id,
        item: { id: restored.json().plan.items[0].id, status: 'done' },
      },
    })
    expect(unverifiedDone.statusCode).toBe(409)
    expect(unverifiedDone.json().error).toMatch(/verified session completion/i)

    const stale = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        revision: plan.revision,
        planId: plan.plan.id,
        item: { id: plan.plan.items[0].id, status: 'done' },
      },
    })
    expect(stale.statusCode).toBe(409)
  })

  it('rejects invalid settings and lossy reorder requests', async () => {
    const { app } = await setup()
    const initial = await app.inject({ url: '/api/manager/dreamer' })
    const invalidZone = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/settings',
      payload: { revision: initial.json().revision, enabled: true, timeZone: 'Not/AZone' },
    })
    expect(invalidZone.statusCode).toBe(400)

    const enabled = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/settings',
      payload: { revision: initial.json().revision, enabled: true, timeZone: 'UTC' },
    })
    const plan = enabled.json()
    const lossy = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: { revision: plan.revision, planId: plan.plan.id, order: [] },
    })
    expect(lossy.statusCode).toBe(409)
  })

  it('returns 503 when Dreamer is unavailable without taking down the route host', async () => {
    const app = Fastify({ logger: false })
    await registerDreamerRoutes(app, undefined, 'Dreamer storage is unavailable.')
    const response = await app.inject({ url: '/api/manager/dreamer' })
    expect(response.statusCode).toBe(503)
    expect(response.json()).toMatchObject({ statusCode: 503, message: 'Dreamer storage is unavailable.' })
    await app.close()
  })
})
