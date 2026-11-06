import { randomUUID } from 'node:crypto'
import Fastify from 'fastify'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { ManagerInternalSubmission, ManagerMessage } from '../shared/manager.js'
import {
  DreamerService,
} from './dreamer-service.js'
import { registerDreamerRoutes } from './dreamer-routes.js'
import { OracleTaskStore } from './oracle-task-store.js'

const directories: string[] = []
const apps: ReturnType<typeof Fastify>[] = []

async function setup() {
  const directory = path.join(process.cwd(), `.dreamer-routes-test-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  directories.push(directory)
  const now = () => new Date('2026-10-29T04:00:00.000Z')
  const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
  await taskStore.initialize()
  const task = await taskStore.upsertFinding({
    sourceEventIds: ['a'.repeat(64)],
    title: 'Run the focused queue test',
    summary: 'The queue regression needs execution.',
    nextAction: 'Start a session and run the focused queue test.',
    owner: 'oracle',
    executionPrompt: 'Reproduce the queue regression and run its focused test.',
  })
  const managerMessages: ManagerMessage[] = []
  const enqueueManagerTask = async (
    input: ManagerInternalSubmission,
  ): Promise<ManagerMessage> => {
    const existing = managerMessages.find(({ id }) => id === input.id)
    if (existing) return existing
    const message: ManagerMessage = {
      ...input,
      role: 'user',
      createdAt: now().toISOString(),
      state: 'queued',
    }
    managerMessages.push(message)
    return message
  }
  const service = new DreamerService(directory, {
    now,
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
        id: 'task-prompt',
        role: 'user',
        content: 'Run the focused queue test.',
        createdAt: '2026-10-29T04:00:00.000Z',
      }, {
        id: 'completion-message',
        role: 'assistant',
        content: '**Done.** Verified result.',
        createdAt: '2026-10-29T04:01:00.000Z',
        taskCompletion: {
          source: 'root-task-complete',
          toolCallId: 'task-complete-call',
          completedAt: '2026-10-29T04:01:00.000Z',
        },
      }],
    }),
    taskStore,
    enqueueManagerTask,
    managerMessages: () => managerMessages,
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
  return { app, service, task, managerMessages }
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('Dreamer routes', () => {
  it('dispatches durable tasks idempotently and validates task requests', async () => {
    const { app, task, managerMessages } = await setup()
    const payload = {
      revision: task.revision,
      requestId: 'd8f12b3f-d670-4ed8-bd61-c488f87a9a8f',
    }
    const first = await app.inject({
      method: 'POST',
      url: `/api/manager/dreamer/tasks/${task.id}/dispatch`,
      payload,
    })
    expect(first.statusCode).toBe(200)
    expect(first.headers['cache-control']).toBe('no-store')
    expect(first.json().tasks[0]).toMatchObject({
      id: task.id,
      status: 'queued',
      attempts: [{ requestId: payload.requestId }],
    })

    const replay = await app.inject({
      method: 'POST',
      url: `/api/manager/dreamer/tasks/${task.id}/dispatch`,
      payload: {
        revision: first.json().tasks[0].revision,
        requestId: payload.requestId,
      },
    })
    expect(replay.statusCode).toBe(200)
    expect(replay.json().tasks[0].attempts).toHaveLength(1)
    expect(managerMessages).toHaveLength(1)

    const duplicateWhileQueued = await app.inject({
      method: 'POST',
      url: `/api/manager/dreamer/tasks/${task.id}/dispatch`,
      payload: {
        revision: replay.json().tasks[0].revision,
        requestId: '91340f86-a5b1-42ae-bd0e-805d5419cb91',
      },
    })
    expect(duplicateWhileQueued.statusCode).toBe(200)
    expect(duplicateWhileQueued.json().tasks[0].attempts).toHaveLength(1)
    expect(managerMessages).toHaveLength(1)

    const malformed = await app.inject({
      method: 'POST',
      url: `/api/manager/dreamer/tasks/${task.id}/dispatch`,
      payload: { revision: task.revision, requestId: 'not-a-uuid' },
    })
    expect(malformed.statusCode).toBe(400)
  })

  it('turns a journal suggestion into durable assigned follow-up work', async () => {
    const { app, managerMessages } = await setup()
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
    const snapshot = enabled.json()
    const suggestion = snapshot.plan.items.find(
      (item: { source: string }) => item.source === 'session',
    )
    const investigated = await app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/plan',
      payload: {
        revision: snapshot.revision,
        planId: snapshot.plan.id,
        investigate: {
          itemId: suggestion.id,
          requestId: '4a166f61-022f-4b6a-9b77-ab856a84c4cf',
        },
      },
    })

    expect(investigated.statusCode).toBe(200)
    expect(investigated.json().plan.items.find(
      (item: { id: string }) => item.id === suggestion.id,
    )).toMatchObject({ status: 'skipped' })
    expect(investigated.json().tasks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        owner: 'oracle',
        status: 'queued',
        attempts: [expect.objectContaining({
          requestId: '4a166f61-022f-4b6a-9b77-ab856a84c4cf',
        })],
      }),
    ]))
    expect(managerMessages.some(({ source }) => source === 'task')).toBe(true)
  })

  it('confirms a durable task without requiring a daily plan', async () => {
    const { app, task, managerMessages } = await setup()
    const dispatched = await app.inject({
      method: 'POST',
      url: `/api/manager/dreamer/tasks/${task.id}/dispatch`,
      payload: {
        revision: task.revision,
        requestId: '51e5ab4f-884a-44af-9de8-45e3701b0c41',
      },
    })
    const managerMessage = managerMessages[0]!
    managerMessage.state = 'done'
    managerMessages.push({
      id: 'task-session-link',
      role: 'activity',
      content: 'Started the focused execution session.',
      createdAt: '2026-10-29T04:00:00.000Z',
      replyTo: managerMessage.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'session-a',
      }],
    })
    const reviewed = await app.inject({ url: '/api/manager/dreamer' })
    const reviewedTask = reviewed.json().tasks.find(
      (candidate: { id: string }) => candidate.id === task.id,
    )
    expect(reviewedTask).toMatchObject({
      status: 'review',
      completionCandidate: {
        attemptId: dispatched.json().tasks.find(
          (candidate: { id: string }) => candidate.id === task.id,
        ).attempts[0].id,
      },
    })

    const completed = await app.inject({
      method: 'POST',
      url: `/api/manager/dreamer/tasks/${task.id}/complete`,
      payload: {
        revision: reviewedTask.revision,
        attemptId: reviewedTask.completionCandidate.attemptId,
        computerId: reviewedTask.completionCandidate.computerId,
        sessionId: reviewedTask.completionCandidate.sessionId,
        sessionRevision: reviewedTask.completionCandidate.sessionRevision,
        messageId: reviewedTask.completionCandidate.messageId,
        resultDigest: reviewedTask.completionCandidate.resultDigest,
      },
    })
    expect(completed.statusCode).toBe(200)
    expect(completed.json().tasks.find(
      (candidate: { id: string }) => candidate.id === task.id,
    )).toMatchObject({
      status: 'completed',
      completion: {
        messageId: 'completion-message',
      },
    })
  })

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
