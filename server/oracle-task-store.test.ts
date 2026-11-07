import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { OracleTask } from '../shared/oracle-task.js'
import {
  ORACLE_TASK_MAX_ACTIVE,
  OracleTaskConflictError,
  OracleTaskStore,
  unfinishedOracleTaskSessions,
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

  it('requires executable prompts for Oracle-owned findings', async () => {
    const root = await directory()
    const store = new OracleTaskStore(root, { hubId: 'hub-a' })
    await store.initialize()

    expect(() => store.upsertFinding({
      sourceEventIds: ['c'.repeat(64)],
      title: 'Run tests',
      summary: 'The task needs execution.',
      nextAction: 'Run the focused tests.',
      owner: 'oracle',
    })).toThrow(OracleTaskConflictError)
  })

  it('migrates legacy promptless Oracle tasks to explicit user-owned follow-up', async () => {
    const root = await directory()
    const statePath = path.join(root, 'dreamer-tasks.json')
    await writeFile(statePath, JSON.stringify({
      version: 1,
      revision: 1,
      tasks: [{
        id: 'oracle-task-legacy',
        revision: 1,
        title: 'Review the legacy finding',
        summary: 'The old task has no executable prompt.',
        nextAction: 'Decide how to follow up.',
        owner: 'oracle',
        status: 'blocked',
        sourceEventIds: ['f'.repeat(64)],
        attempts: [],
        createdAt: '2026-11-06T02:00:00.000Z',
        updatedAt: '2026-11-06T02:00:00.000Z',
      }],
    }))
    const store = new OracleTaskStore(root, { hubId: 'hub-a' })

    await store.initialize()

    expect(store.snapshot().tasks).toEqual([
      expect.objectContaining({
        id: 'oracle-task-legacy',
        owner: 'user',
        status: 'ready',
      }),
    ])
    expect(JSON.parse(await readFile(statePath, 'utf8'))).toMatchObject({
      version: 2,
      revision: 2,
      tasks: [{
        id: 'oracle-task-legacy',
        revision: 2,
        owner: 'user',
        status: 'ready',
      }],
    })
  })

  it('releases active capacity when a user-owned task is completed', async () => {
    const root = await directory()
    const store = new OracleTaskStore(root, { hubId: 'hub-a' })
    await store.initialize()
    let first
    for (let index = 0; index < ORACLE_TASK_MAX_ACTIVE; index += 1) {
      const task = await store.upsertFinding({
        sourceEventIds: [index.toString(16).padStart(64, '0')],
        title: `User decision ${index}`,
        summary: 'Oracle needs an explicit user decision.',
        nextAction: 'Choose or dismiss this follow-up.',
        owner: 'user',
      })
      first ??= task
    }

    await store.resolveUserTask({
      revision: first!.revision,
      taskId: first!.id,
      status: 'completed',
    })

    await expect(store.upsertFinding({
      sourceEventIds: [(ORACLE_TASK_MAX_ACTIVE + 1).toString(16).padStart(64, '0')],
      title: 'Replacement user decision',
      summary: 'Resolved work should no longer consume active capacity.',
      nextAction: 'Review the replacement decision.',
      owner: 'user',
    })).resolves.toMatchObject({ status: 'ready' })
  })

  it('keeps verified completion terminal when stale reconciliation finishes later', async () => {
    const root = await directory()
    const store = new OracleTaskStore(root, {
      hubId: 'hub-a',
      now: () => new Date('2026-11-06T03:00:00.000Z'),
    })
    await store.initialize()
    const task = await store.upsertFinding({
      sourceEventIds: ['d'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'The task needs authoritative execution.',
      nextAction: 'Run the focused test.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test and report its result.',
    })
    const attempted = await store.beginAttempt({
      revision: task.revision,
      taskId: task.id,
      requestId: 'd8f12b3f-d670-4ed8-bd61-c488f87a9a8f',
      managerMessageId: 'task-attempt-terminal',
    })
    const attempt = attempted.attempts[0]!
    const linked = await store.reconcileAttempt({
      revision: attempted.revision,
      taskId: task.id,
      attemptId: attempt.id,
      status: 'review',
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-a',
        promptId: 'task-prompt-a',
      }],
    })
    const completed = await store.confirmCompletion({
      revision: linked.revision,
      taskId: task.id,
      completion: {
        source: 'root-task-complete',
        attemptId: attempt.id,
        computerId: 'computer-a',
        sessionId: 'execution-a',
        sessionRevision: 3,
        messageId: 'completion-a',
        toolCallId: 'task-complete-a',
        resultDigest: 'e'.repeat(64),
        completedAt: '2026-11-06T03:00:00.000Z',
        confirmedAt: '2026-11-06T03:00:00.000Z',
      },
    })

    const reconciled = await store.reconcileAttempt({
      revision: completed.revision,
      taskId: task.id,
      attemptId: attempt.id,
      status: 'blocked',
      error: 'Late stale reconciliation.',
    })

    expect(reconciled).toEqual(completed)
    expect(store.snapshot().tasks[0]).toMatchObject({
      status: 'completed',
      completion: { messageId: 'completion-a' },
      attempts: [{ status: 'completed' }],
    })
  })

  it('lists the sessions every unfinished task still uses', () => {
    const task = (id: string, status: OracleTask['status'], sessionIds: string[], source?: string): OracleTask => ({
      id, revision: 1, title: id, summary: '', nextAction: '', owner: 'oracle', status, sourceEventIds: [],
      ...(source ? { sourceSession: { computerId: 'hub', sessionId: source, taskGeneration: 1 } } : {}),
      attempts: [{
        id: `${id}-attempt`, requestId: 'r', managerMessageId: 'm', status: 'running',
        sessionRefs: sessionIds.map((sessionId) => ({ computerId: 'hub', sessionId })),
      }],
      createdAt: 't', updatedAt: 't',
    })
    expect(unfinishedOracleTaskSessions([
      task('running', 'running', ['worker-a'], 'source-a'),
      task('review', 'review', ['worker-b']),
      task('failed', 'failed', ['worker-c']),
      task('done', 'completed', ['worker-d'], 'source-d'),
      task('dropped', 'dismissed', ['worker-e']),
    ])).toEqual([
      { computerId: 'hub', sessionId: 'source-a' },
      { computerId: 'hub', sessionId: 'worker-a' },
      { computerId: 'hub', sessionId: 'worker-b' },
      { computerId: 'hub', sessionId: 'worker-c' },
    ])
  })
})
