import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  OracleTaskConflictError,
  OracleTaskStore,
} from './oracle-task-store.js'

const directories: string[] = []

async function directory(): Promise<string> {
  const value = path.join(process.cwd(), `.oracle-task-store-test-${randomUUID()}`)
  await mkdir(value, { recursive: true })
  directories.push(value)
  return value
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((value) => rm(value, { recursive: true, force: true })),
  )
})

describe('OracleTaskStore', () => {
  it('upserts replayed source events into one durable task', async () => {
    const root = await directory()
    const store = new OracleTaskStore(root, {
      hubId: 'hub-a',
      now: () => new Date('2026-11-06T03:00:00.000Z'),
    })
    await store.initialize()

    const first = await store.upsertFinding({
      sourceEventIds: ['a'.repeat(64)],
      sourceSession: {
        computerId: 'computer-a',
        sessionId: 'session-a',
        taskGeneration: 1,
      },
      title: 'Run the focused queue test',
      summary: 'The delegated session reported a queue regression.',
      nextAction: 'Start a session and run the focused queue regression.',
      owner: 'oracle',
      executionPrompt: 'Reproduce and fix the queue regression, then run its focused test.',
    })
    const replay = await store.upsertFinding({
      sourceEventIds: ['a'.repeat(64)],
      sourceSession: {
        computerId: 'computer-a',
        sessionId: 'session-a',
        taskGeneration: 1,
      },
      title: 'Generated replacement title',
      summary: 'Generated replacement summary.',
      nextAction: 'Generated replacement action.',
      owner: 'oracle',
      executionPrompt: 'Generated replacement prompt.',
    })

    expect(replay.id).toBe(first.id)
    expect(store.snapshot().tasks).toEqual([
      expect.objectContaining({
        title: 'Run the focused queue test',
        nextAction: 'Start a session and run the focused queue regression.',
        status: 'ready',
        sourceEventIds: ['a'.repeat(64)],
      }),
    ])

    const reopened = new OracleTaskStore(root, { hubId: 'hub-a' })
    await reopened.initialize()
    expect(reopened.snapshot().tasks).toHaveLength(1)
  })

  it('creates one attempt for a repeated request id and refuses stale revisions', async () => {
    const root = await directory()
    const store = new OracleTaskStore(root, { hubId: 'hub-a' })
    await store.initialize()
    const task = await store.upsertFinding({
      sourceEventIds: ['b'.repeat(64)],
      title: 'Run tests',
      summary: 'The task needs execution.',
      nextAction: 'Run the focused tests.',
      owner: 'oracle',
      executionPrompt: 'Run the focused tests and report the result.',
    })

    const first = await store.beginAttempt({
      revision: store.snapshot().revision,
      taskId: task.id,
      requestId: 'd8f12b3f-d670-4ed8-bd61-c488f87a9a8f',
      managerMessageId: 'task-attempt-a',
    })
    const replay = await store.beginAttempt({
      revision: store.snapshot().revision,
      taskId: task.id,
      requestId: 'd8f12b3f-d670-4ed8-bd61-c488f87a9a8f',
      managerMessageId: 'task-attempt-a',
    })
    expect(replay.attempts).toEqual(first.attempts)
    expect(replay.attempts).toHaveLength(1)

    await expect(store.beginAttempt({
      revision: 0,
      taskId: task.id,
      requestId: 'f5f6071e-8938-46a2-bcda-f3d64e7461f1',
      managerMessageId: 'task-attempt-b',
    })).rejects.toBeInstanceOf(OracleTaskConflictError)
  })
})
