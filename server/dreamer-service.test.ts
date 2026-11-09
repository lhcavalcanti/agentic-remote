import { createHash, randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DreamerService,
  type DreamerServiceOptions,
} from './dreamer-service.js'
import type { DreamerMemoryMetadataRecord } from './dreamer-planner.js'
import type { ManagerStructuredMemoryRuntime } from './manager-structured-memory-runtime.js'
import { DreamerStore, dreamerRunKey } from './dreamer-store.js'
import type { DreamerProgressSource } from './dreamer-progress.js'
import type { ManagedSession } from '../shared/contracts.js'
import type { ManagerInternalSubmission, ManagerMessage } from '../shared/manager.js'
import { OracleTaskStore } from './oracle-task-store.js'

const directories: string[] = []

async function root(): Promise<string> {
  const value = path.join(process.cwd(), `.dreamer-service-test-${randomUUID()}`)
  await mkdir(value, { recursive: true })
  directories.push(value)
  return value
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((value) => rm(value, { recursive: true, force: true })))
})

function options(now: () => Date, overrides: Partial<DreamerServiceOptions> = {}): DreamerServiceOptions {
  return {
    now,
    registry: () => ({
      'computer-a:session-error': {
        computerId: 'computer-a',
        sessionId: 'session-error',
        title: 'SECRET TITLE',
        task: 'SECRET PROMPT',
        cwd: '/secret/path',
        origin: 'user',
        firstSeenAt: '2026-10-29T00:00:00.000Z',
        lastStatus: 'error',
        lastSeenAt: '2026-10-29T03:00:00.000Z',
      },
    }),
    memory: () => ({
      mode: 'off',
      available: false,
      records: [],
      tombstones: [],
    }),
    ...overrides,
  }
}

function activeMemory(recordId = 'memory-a') {
  return {
    mode: 'on' as const,
    available: true,
    records: [{
      id: recordId,
      kind: 'fact' as const,
      scope: { type: 'user' as const },
      authority: 'direct-user' as const,
      confidence: 1,
      createdAt: '2026-10-28T00:00:00.000Z',
      updatedAt: '2026-10-29T03:00:00.000Z',
    }],
    tombstones: [] as Array<{ recordId: string }>,
  }
}

function completionSession(
  taskCompletion = true,
  content = '**Done.** The requested change passed its focused checks.',
  overrides: Partial<ManagedSession> = {},
): ManagedSession {
  return {
    id: 'session-error',
    revision: 7,
    computerId: 'computer-a',
    computerName: 'development',
    cwd: '/home/tester/project',
    title: 'Review failed session',
    updatedAt: '2026-10-29T03:30:00.000Z',
    status: 'error',
    messages: [{
      id: 'completion-message',
      role: 'assistant',
      content,
      createdAt: '2026-10-29T03:20:00.000Z',
      ...(taskCompletion ? {
        taskCompletion: {
          source: 'root-task-complete' as const,
          toolCallId: 'task-complete-call',
          completedAt: '2026-10-29T03:20:00.000Z',
        },
      } : {}),
    }],
    ...overrides,
  }
}

describe('DreamerService', () => {
  it('keeps journal suggestions separate from durable execution tasks', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now))
    await service.start()
    await service.updateSettings({
      revision: service.snapshot().revision,
      enabled: true,
      timeZone: 'UTC',
    })

    const snapshot = await service.snapshotForApi()
    const suggestion = snapshot.plan!.items.find(({ source }) => source === 'session')
    expect(suggestion?.taskId).toBeUndefined()
    expect(snapshot.tasks).toEqual([])
  })

  it('dispatches once and reconciles only exact execution evidence', async () => {
    const directory = await root()
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
    const enqueueManagerTask = vi.fn(async (input: ManagerInternalSubmission) => {
      const message: ManagerMessage = {
        ...input,
        role: 'user',
        createdAt: now().toISOString(),
        state: 'queued',
      }
      managerMessages.push(message)
      return message
    })
    let execution = completionSession(true, 'Old tests passed.', {
      id: 'execution-a',
      revision: 1,
      status: 'idle',
      messages: [{
        id: 'old-prompt',
        role: 'user',
        content: 'Earlier unrelated work.',
        createdAt: '2026-10-29T03:00:00.000Z',
      }, {
        id: 'old-completion',
        role: 'assistant',
        content: 'Old tests passed.',
        createdAt: '2026-10-29T03:20:00.000Z',
        taskCompletion: {
          source: 'root-task-complete',
          toolCallId: 'old-task-complete-call',
          completedAt: '2026-10-29T03:20:00.000Z',
        },
      }],
    })
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask,
      managerMessages: () => managerMessages,
      readSession: async () => execution,
    }))
    await service.initialize()
    const requestId = 'd8f12b3f-d670-4ed8-bd61-c488f87a9a8f'

    const first = await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId,
    })
    const replay = await service.dispatchTask({
      revision: first.tasks![0]!.revision,
      taskId: task.id,
      requestId,
    })

    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)
    expect(replay.tasks![0]!.attempts).toHaveLength(1)
    const attempt = replay.tasks![0]!.attempts[0]!
    const managerMessage = managerMessages[0]!
    managerMessage.state = 'done'
    managerMessages.push({
      id: 'activity-a',
      role: 'activity',
      content: 'Started execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessage.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-a',
        title: 'Queue execution',
        promptId: 'task-prompt',
      }],
    })

    await service.reconcileTasks()
    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'blocked',
      attempts: [expect.objectContaining({
        id: attempt.id,
        status: 'blocked',
      })],
    })

    execution = completionSession(true, 'Focused queue test passed.', {
      id: 'execution-a',
      revision: 2,
      status: 'idle',
      messages: [{
        id: 'task-prompt',
        role: 'user',
        content: 'Run the focused queue test.',
        createdAt: '2026-10-29T04:00:00.000Z',
      }, {
        id: 'task-completion',
        role: 'assistant',
        content: 'Focused queue test passed.',
        createdAt: '2026-10-29T04:01:00.000Z',
        taskCompletion: {
          source: 'root-task-complete',
          toolCallId: 'task-complete-call',
          completedAt: '2026-10-29T04:01:00.000Z',
        },
      }],
    })
    managerMessage.state = 'failed'
    managerMessage.error = 'Oracle turn ended after starting the execution session.'
    const reviewed = await service.snapshotForApi()
    expect(reviewed.tasks![0]).toMatchObject({
      status: 'review',
      completionCandidate: {
        source: 'root-task-complete',
        attemptId: attempt.id,
        sessionId: 'execution-a',
      },
    })
    const candidate = reviewed.tasks![0]!.completionCandidate!
    const completed = await service.confirmTaskCompletion({
      revision: reviewed.tasks![0]!.revision,
      taskId: task.id,
      attemptId: candidate.attemptId,
      computerId: candidate.computerId,
      sessionId: candidate.sessionId,
      sessionRevision: candidate.sessionRevision,
      messageId: candidate.messageId,
      resultDigest: candidate.resultDigest,
    })
    expect(completed.tasks![0]).toMatchObject({
      status: 'completed',
      completion: {
        source: 'root-task-complete',
        attemptId: attempt.id,
        messageId: candidate.messageId,
      },
    })
    const replayedCompletion = await service.confirmTaskCompletion({
      revision: reviewed.tasks![0]!.revision,
      taskId: task.id,
      attemptId: candidate.attemptId,
      computerId: candidate.computerId,
      sessionId: candidate.sessionId,
      sessionRevision: candidate.sessionRevision,
      messageId: candidate.messageId,
      resultDigest: candidate.resultDigest,
    })
    expect(replayedCompletion.tasks![0]!.revision).toBe(completed.tasks![0]!.revision)
  })

  it('answers reconciles requested mid-pass with one later pass that sees the change', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['f'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'The execution session finishes while a pass is reading it.',
      nextAction: 'Review the execution result.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const prompt = {
      id: 'task-prompt',
      role: 'user' as const,
      content: 'Run the focused queue test.',
      createdAt: '2026-10-29T04:00:00.000Z',
    }
    let execution = completionSession(false, 'Still working.', {
      id: 'execution-a',
      revision: 1,
      status: 'running',
      messages: [prompt],
    })
    let held: Promise<void> | undefined
    let active = 0
    let overlapping = 0
    const readSession = vi.fn(async () => {
      const read = execution
      active += 1
      overlapping = Math.max(overlapping, active)
      await held
      active -= 1
      return read
    })
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'done',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession,
    }))
    await service.initialize()
    await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '0d4f1f5e-7f1c-4a8e-9a43-2b6f3c1d5e70',
    })
    managerMessages.push({
      id: 'execution-link',
      role: 'activity',
      content: 'Started execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{ computerId: 'computer-a', sessionId: 'execution-a', promptId: 'task-prompt' }],
    })
    let release = () => {}
    held = new Promise<void>((resolve) => { release = resolve })
    const running = service.reconcileTasks()
    await vi.waitFor(() => expect(readSession).toHaveBeenCalledOnce())

    // The session finishes after the running pass has read it.
    held = undefined
    execution = completionSession(true, 'Focused queue test passed.', {
      id: 'execution-a',
      revision: 2,
      status: 'idle',
      messages: [prompt, {
        id: 'task-completion',
        role: 'assistant',
        content: 'Focused queue test passed.',
        createdAt: '2026-10-29T04:01:00.000Z',
        taskCompletion: {
          source: 'root-task-complete',
          toolCallId: 'task-complete-call',
          completedAt: '2026-10-29T04:01:00.000Z',
        },
      }],
    })
    const requested = Promise.all([service.reconcileTasks(), service.reconcileTasks(), service.reconcileTasks()])
    release()
    await Promise.all([running, requested])

    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'review',
      attempts: [{ status: 'review' }],
    })
    expect(readSession).toHaveBeenCalledTimes(2)
    expect(overlapping).toBe(1)
  })

  it('keeps a task running when its linked execution outlives a failed Oracle turn', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['e'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'The execution session is still working.',
      nextAction: 'Wait for the linked execution session.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(false, 'Still working.', {
        id: 'execution-running',
        status: 'running',
        messages: [{
          id: 'task-prompt',
          role: 'user',
          content: 'Run the focused queue test.',
          createdAt: now().toISOString(),
        }],
      }),
    }))
    await service.initialize()
    const dispatched = await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '9ee57a8b-43f5-4db4-b16d-b030585115f6',
    })
    const managerMessage = managerMessages[0]!
    managerMessage.state = 'failed'
    managerMessage.error = 'Oracle lost its own turn after dispatch.'
    managerMessages.push({
      id: 'running-session-link',
      role: 'activity',
      content: 'Started execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessage.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-running',
        promptId: 'task-prompt',
      }],
    })

    await service.reconcileTasks()

    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'running',
      attempts: [{
        id: dispatched.tasks![0]!.attempts[0]!.id,
        status: 'running',
      }],
    })
  })

  it('keeps a newly linked idle execution running with its active Oracle turn', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['a'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'Oracle is still dispatching the linked execution.',
      nextAction: 'Wait for the active Oracle turn.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(false, 'No result yet.', {
        id: 'execution-linking',
        status: 'idle',
        messages: [],
      }),
    }))
    await service.initialize()
    const dispatched = await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '1dc6cd0e-a913-444a-bbd6-a97145e102b1',
    })
    managerMessages[0]!.state = 'running'
    managerMessages.push({
      id: 'linking-session-link',
      role: 'activity',
      content: 'Started execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-linking',
        promptId: 'task-prompt',
      }],
    })

    await service.reconcileTasks()

    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'running',
      attempts: [{
        id: dispatched.tasks![0]!.attempts[0]!.id,
        status: 'running',
      }],
    })
  })

  it('keeps a linked idle execution queued with its recovered Oracle turn', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['b'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'The recovered Oracle turn is still queued.',
      nextAction: 'Wait for the recovered Oracle queue.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(false, 'No result yet.', {
        id: 'execution-recovered-queue',
        status: 'idle',
        messages: [],
      }),
    }))
    await service.initialize()
    const dispatched = await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: 'ecda856c-4415-48ac-96fd-d44bfc2c05b6',
    })
    managerMessages.push({
      id: 'recovered-queue-session-link',
      role: 'activity',
      content: 'Linked execution session before restart',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-recovered-queue',
        promptId: 'task-prompt',
      }],
    })

    await service.reconcileTasks()

    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'queued',
      attempts: [{
        id: dispatched.tasks![0]!.attempts[0]!.id,
        status: 'queued',
      }],
    })
  })

  it('keeps a task queued while its exact linked execution prompt awaits delivery', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['d'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'The execution prompt is waiting for the linked session.',
      nextAction: 'Wait for the linked session queue to drain.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(false, 'Earlier work completed.', {
        id: 'execution-queued',
        status: 'idle',
        queuedCount: 1,
        queuedPrompts: [{
          id: 'queued-task-prompt',
          content: 'Run the focused queue test.',
          createdAt: now().toISOString(),
        }],
        queueState: {
          state: 'waiting',
          promptId: 'queued-task-prompt',
          message: 'Waiting for the terminal composer. Delivery will retry automatically.',
          updatedAt: now().toISOString(),
        },
        messages: [],
      }),
    }))
    await service.initialize()
    const dispatched = await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: 'fef46906-87a8-4701-ab37-d98086d9bc8d',
    })
    managerMessages[0]!.state = 'done'
    managerMessages.push({
      id: 'queued-session-link',
      role: 'activity',
      content: 'Queued execution prompt',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-queued',
        promptId: 'queued-task-prompt',
      }],
    })

    await service.reconcileTasks()

    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'queued',
      attempts: [{
        id: dispatched.tasks![0]!.attempts[0]!.id,
        status: 'queued',
      }],
    })
  })

  it('matches completion to the exact dispatched prompt despite clock skew', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['f'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'The worker clock is behind the hub.',
      nextAction: 'Review the exact execution result.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(true, 'Focused queue test passed.', {
        id: 'execution-skewed',
        status: 'idle',
        messages: [{
          id: 'task-prompt-skewed',
          role: 'user',
          content: 'Run the focused queue test.',
          createdAt: '2026-10-29T03:59:00.000Z',
        }, {
          id: 'task-completion-skewed',
          role: 'assistant',
          content: 'Focused queue test passed.',
          createdAt: '2026-10-29T03:59:30.000Z',
          taskCompletion: {
            source: 'root-task-complete',
            toolCallId: 'task-complete-skewed',
            completedAt: '2026-10-29T03:59:30.000Z',
          },
        }],
      }),
    }))
    await service.initialize()
    const dispatched = await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '98417852-7aca-4bfc-a131-8d16c10401bf',
    })
    managerMessages[0]!.state = 'done'
    managerMessages.push({
      id: 'skewed-session-reopened',
      role: 'activity',
      content: 'Reopened execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-skewed',
      }],
    }, {
      id: 'skewed-session-link',
      role: 'activity',
      content: 'Started execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-skewed',
        promptId: 'task-prompt-skewed',
      }],
    })

    const snapshot = await service.snapshotForApi()

    expect(snapshot.tasks![0]).toMatchObject({
      status: 'review',
      completionCandidate: {
        attemptId: dispatched.tasks![0]!.attempts[0]!.id,
        messageId: 'task-completion-skewed',
      },
    })
  })

  it('resolves a queued prompt receipt to its later root transcript message', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['9'.repeat(64)],
      title: 'Run the queued focused test',
      summary: 'The task prompt waited behind existing work.',
      nextAction: 'Review the queued execution result.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(true, 'Queued focused test passed.', {
        id: 'execution-queued',
        status: 'idle',
        messages: [{
          id: 'previous-root',
          role: 'user',
          content: 'Finish the existing work.',
          createdAt: '2026-10-29T03:55:00.000Z',
        }, {
          id: 'previous-reply',
          role: 'assistant',
          content: 'Existing work finished.',
          createdAt: '2026-10-29T03:56:00.000Z',
        }, {
          id: 'earlier-queued-root',
          role: 'user',
          content: 'Run the earlier queued check.',
          createdAt: '2026-10-29T03:57:00.000Z',
        }, {
          id: 'earlier-queued-reply',
          role: 'assistant',
          content: 'Earlier queued check passed.',
          createdAt: '2026-10-29T03:58:00.000Z',
        }, {
          id: 'transcript-task-prompt',
          role: 'user',
          content: 'Run the focused queue test.',
          createdAt: '2026-10-29T03:59:00.000Z',
        }, {
          id: 'queued-task-completion',
          role: 'assistant',
          content: 'Queued focused test passed.',
          createdAt: '2026-10-29T03:59:30.000Z',
          taskCompletion: {
            source: 'root-task-complete',
            toolCallId: 'queued-task-complete',
            completedAt: '2026-10-29T03:59:30.000Z',
          },
        }],
      }),
    }))
    await service.initialize()
    await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: 'f137172b-34e9-4cd7-81bf-b4c17660126a',
    })
    managerMessages[0]!.state = 'done'
    managerMessages.push({
      id: 'queued-session-link',
      role: 'activity',
      content: 'Queued execution prompt',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-queued',
        promptId: 'queued-task-receipt',
        promptAnchorId: 'previous-root',
        promptQueuePosition: 2,
        promptDigest: createHash('sha256')
          .update('Run the focused queue test.')
          .digest('hex'),
      }],
    })

    const snapshot = await service.snapshotForApi()

    expect(snapshot.tasks![0]).toMatchObject({
      status: 'review',
      completionCandidate: {
        messageId: 'queued-task-completion',
        sessionId: 'execution-queued',
      },
    })
  })

  it('does not use a later unrelated prompt completion for a task attempt', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['1'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'Only the dispatched task turn can complete this attempt.',
      nextAction: 'Retry the task turn.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask: async (input) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      },
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(true, 'Unrelated cleanup completed.', {
        id: 'execution-unrelated',
        status: 'idle',
        messages: [{
          id: 'task-prompt-exact',
          role: 'user',
          content: 'Run the focused queue test.',
          createdAt: '2026-10-29T04:00:00.000Z',
        }, {
          id: 'task-test-evidence',
          role: 'activity',
          content: 'vitest focused queue test passed',
          createdAt: '2026-10-29T04:00:30.000Z',
          activityStatus: 'completed',
        }, {
          id: 'unrelated-prompt',
          role: 'user',
          content: 'Clean up an unrelated file.',
          createdAt: '2026-10-29T04:01:00.000Z',
        }, {
          id: 'unrelated-test-evidence',
          role: 'activity',
          content: 'vitest unrelated cleanup test passed',
          createdAt: '2026-10-29T04:01:30.000Z',
          activityStatus: 'completed',
        }, {
          id: 'unrelated-completion',
          role: 'assistant',
          content: 'Unrelated cleanup completed.',
          createdAt: '2026-10-29T04:02:00.000Z',
          taskCompletion: {
            source: 'root-task-complete',
            toolCallId: 'unrelated-task-complete',
            completedAt: '2026-10-29T04:02:00.000Z',
          },
        }],
      }),
    }))
    await service.initialize()
    await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '6a47ec02-c52a-4abc-9968-f7f34a969dd7',
    })
    managerMessages[0]!.state = 'done'
    managerMessages.push({
      id: 'unrelated-session-link',
      role: 'activity',
      content: 'Started execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-unrelated',
        promptId: 'task-prompt-exact',
      }],
    })

    const snapshot = await service.snapshotForApi()

    expect(snapshot.tasks![0]).toMatchObject({ status: 'blocked' })
    expect(snapshot.tasks![0]!.completionCandidate).toBeUndefined()
    expect(snapshot.tasks![0]!.evidence).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'computer-a:execution-unrelated:task-test-evidence',
        kind: 'test',
      }),
    ]))
    expect(snapshot.tasks![0]!.evidence).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'computer-a:execution-unrelated:unrelated-test-evidence',
      }),
    ]))
  })

  it('reconciles an exact durable manager message outside the public snapshot', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['2'.repeat(64)],
      title: 'Recover the exact terminal Oracle turn',
      summary: 'The manager transcript window no longer contains it.',
      nextAction: 'Show the durable terminal failure.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const attempted = await taskStore.beginAttempt({
      revision: task.revision,
      taskId: task.id,
      requestId: '32edc0f1-fc56-4937-9853-70cf891cebd6',
      managerMessageId: 'task-message-outside-snapshot',
    })
    const exactMessage: ManagerMessage = {
      id: 'task-message-outside-snapshot',
      role: 'user',
      content: 'Run the focused queue test.',
      createdAt: now().toISOString(),
      state: 'failed',
      error: 'Oracle terminal failure retained durably.',
      source: 'task',
      automatic: { kind: 'task', taskId: task.id },
    }
    const service = new DreamerService(directory, options(now, {
      taskStore,
      managerMessages: () => [],
      ...({
        managerMessage: (id: string) => id === exactMessage.id ? exactMessage : undefined,
      } as Partial<DreamerServiceOptions>),
    }))
    await service.initialize()

    await service.reconcileTasks()

    expect(service.snapshot().tasks![0]).toMatchObject({
      revision: attempted.revision + 1,
      status: 'failed',
      attempts: [{
        status: 'failed',
        error: 'Oracle terminal failure retained durably.',
      }],
    })
  })

  it('retries failed execution without allowing late older attempts to replace it', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['b'.repeat(64)],
      title: 'Retry the failed queue test',
      summary: 'The first execution could not start.',
      nextAction: 'Retry execution.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const enqueueManagerTask = vi.fn(async (input: ManagerInternalSubmission) => {
      const message: ManagerMessage = {
        ...input,
        role: 'user',
        createdAt: now().toISOString(),
        state: 'queued',
      }
      managerMessages.push(message)
      return message
    })
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask,
      managerMessages: () => managerMessages,
    }))
    await service.initialize()
    const first = await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '3cf0f598-9f48-4f69-88b6-49c215aca1f9',
    })
    managerMessages[0]!.state = 'failed'
    managerMessages[0]!.error = 'Execution backend unavailable.'
    managerMessages.push({
      id: 'failed-session-link',
      role: 'activity',
      content: 'Linked the failed execution session.',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-failed',
      }],
    })
    await service.reconcileTasks()
    const failed = service.snapshot().tasks![0]!
    expect(failed).toMatchObject({
      status: 'failed',
      attempts: [{ status: 'failed', error: 'Execution backend unavailable.' }],
    })

    await service.dispatchTask({
      revision: failed.revision,
      taskId: task.id,
      requestId: '0ca3a2aa-e399-4e31-b809-13996c0f1dcb',
    })
    const retried = service.snapshot().tasks![0]!
    expect(retried).toMatchObject({
      status: 'queued',
      attempts: [{ status: 'failed' }, { status: 'queued' }],
    })
    expect(enqueueManagerTask).toHaveBeenCalledTimes(2)
    expect(enqueueManagerTask.mock.calls[1]![0].content).toContain(
      'Previous execution sessions: computer-a/execution-failed.',
    )

    await taskStore.reconcileAttempt({
      revision: retried.revision,
      taskId: task.id,
      attemptId: first.tasks![0]!.attempts[0]!.id,
      status: 'failed',
      error: 'Late failure from the old attempt.',
    })
    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'queued',
      attempts: [
        { status: 'failed', error: 'Late failure from the old attempt.' },
        { status: 'queued' },
      ],
    })
  })

  it('keeps an enqueue failure failed until the user explicitly retries', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['d'.repeat(64)],
      title: 'Retry the failed dispatch',
      summary: 'Oracle could not persist its manager message.',
      nextAction: 'Retry execution explicitly.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const enqueueManagerTask = vi.fn()
      .mockRejectedValueOnce(new Error('manager store unavailable'))
      .mockImplementation(async (input: ManagerInternalSubmission) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      })
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask,
      managerMessages: () => managerMessages,
    }))
    await service.initialize()

    await expect(service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: 'fc088477-e2ef-41a3-a421-f235729e9a43',
    })).rejects.toThrow('manager store unavailable')
    await service.reconcileTasks()
    await service.reconcileTasks()

    const failed = service.snapshot().tasks![0]!
    expect(failed).toMatchObject({
      status: 'failed',
      attempts: [{
        status: 'failed',
        error: 'Oracle could not queue this task: manager store unavailable',
      }],
    })
    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)

    await service.dispatchTask({
      revision: failed.revision,
      taskId: task.id,
      requestId: 'e7744556-fb8f-49a7-b10b-28ee68fc07d5',
    })
    expect(enqueueManagerTask).toHaveBeenCalledTimes(2)
    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'queued',
      attempts: [{ status: 'failed' }, { status: 'queued' }],
    })
  })

  it('re-enqueues a persisted queued attempt once during reconciliation', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['c'.repeat(64)],
      title: 'Recover queued investigation',
      summary: 'The hub stopped after persisting dispatch intent.',
      nextAction: 'Resume the queued Oracle turn.',
      owner: 'oracle',
      executionPrompt: 'Continue the queued investigation.',
    })
    await taskStore.beginAttempt({
      revision: task.revision,
      taskId: task.id,
      requestId: '8ad2254d-8be8-4239-aa3a-a80dd862987d',
      managerMessageId: 'task-attempt-recovery',
    })
    const managerMessages: ManagerMessage[] = []
    const enqueueManagerTask = vi.fn(async (input: ManagerInternalSubmission) => {
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
    })
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask,
      managerMessages: () => managerMessages,
    }))
    await service.initialize()

    await service.reconcileTasks()
    await service.reconcileTasks()

    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)
    expect(managerMessages).toHaveLength(1)
    expect(service.snapshot().tasks![0]).toMatchObject({ status: 'queued' })
  })

  it.each([
    {
      state: 'done' as const,
      before: 'blocked',
      after: {
        status: 'blocked',
        error: 'Oracle did not attach an execution session with verified results.',
      },
    },
    {
      state: 'running' as const,
      before: 'running',
      after: {
        status: 'failed',
        error: expect.stringContaining('left the Oracle conversation'),
      },
    },
  ])(
    'never re-dispatches a $before attempt whose dispatch left the conversation',
    async ({ state, before, after }) => {
      const directory = await root()
      const now = () => new Date('2026-10-29T04:00:00.000Z')
      const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
      await taskStore.initialize()
      const task = await taskStore.upsertFinding({
        sourceEventIds: ['d'.repeat(64)],
        title: 'Investigate the stalled queue',
        summary: 'Oracle dispatched this before Start over.',
        nextAction: 'Run the focused queue test.',
        owner: 'oracle',
        executionPrompt: 'Run the focused queue test.',
      })
      await taskStore.beginAttempt({
        revision: task.revision,
        taskId: task.id,
        requestId: '2f0b8f8e-8b8f-4f0e-9c55-3f4a8f8e8b8f',
        managerMessageId: 'task-attempt-start-over',
      })
      const managerMessages: ManagerMessage[] = [{
        id: 'task-attempt-start-over',
        role: 'user',
        content: 'Run the focused queue test.',
        createdAt: now().toISOString(),
        state,
      }]
      const enqueueManagerTask = vi.fn(async (input: ManagerInternalSubmission) => {
        const message: ManagerMessage = {
          ...input,
          role: 'user',
          createdAt: now().toISOString(),
          state: 'queued',
        }
        managerMessages.push(message)
        return message
      })
      const service = new DreamerService(directory, options(now, {
        taskStore,
        enqueueManagerTask,
        managerMessages: () => managerMessages,
      }))
      await service.initialize()
      await service.reconcileTasks()
      expect(service.snapshot().tasks![0]!.attempts[0]).toMatchObject({ status: before })

      // Start over, or trimming the conversation, removes the dispatch.
      managerMessages.length = 0
      await service.reconcileTasks()
      await service.reconcileTasks()

      expect(enqueueManagerTask).not.toHaveBeenCalled()
      const settled = service.snapshot().tasks![0]!
      expect(settled).toMatchObject({ status: after.status, attempts: [after] })

      await service.dispatchTask({
        revision: settled.revision,
        taskId: task.id,
        requestId: '6c1d2f4e-2a7b-4c3d-8e9f-0a1b2c3d4e5f',
      })
      expect(enqueueManagerTask).toHaveBeenCalledTimes(1)
    },
  )

  it('follows a linked execution after its dispatch leaves the conversation', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['b'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'Oracle linked an execution session before Start over.',
      nextAction: 'Run the focused queue test.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const prompt = {
      id: 'linked-task-prompt',
      role: 'user' as const,
      content: 'Run the focused queue test.',
      createdAt: now().toISOString(),
    }
    let execution = completionSession(false, '', {
      id: 'execution-linked',
      status: 'idle',
      queuedCount: 1,
      queuedPrompts: [prompt],
      messages: [],
    })
    const managerMessages: ManagerMessage[] = []
    const enqueueManagerTask = vi.fn(async (input: ManagerInternalSubmission) => {
      const message: ManagerMessage = {
        ...input,
        role: 'user',
        createdAt: now().toISOString(),
        state: 'queued',
      }
      managerMessages.push(message)
      return message
    })
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask,
      managerMessages: () => managerMessages,
      readSession: async () => execution,
    }))
    await service.initialize()
    await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '0d6c1f2e-3b4a-4c5d-8e6f-7a8b9c0d1e2f',
    })
    managerMessages[0]!.state = 'done'
    managerMessages.push({
      id: 'linked-session',
      role: 'activity',
      content: 'Queued execution prompt',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{
        computerId: 'computer-a',
        sessionId: 'execution-linked',
        promptId: prompt.id,
      }],
    })
    // The message bound drops the dispatch before its newer link is persisted.
    managerMessages.shift()
    await service.reconcileTasks()
    const status = () => service.snapshot().tasks![0]!.attempts[0]
    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)
    expect(status()).toMatchObject({ status: 'queued' })

    // Start over removes the link too; the prompt still waits in its session.
    managerMessages.length = 0
    await service.reconcileTasks()
    await service.reconcileTasks()
    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)
    expect(status()).toMatchObject({ status: 'queued' })

    execution = { ...execution, status: 'running', queuedCount: 0, queuedPrompts: [], messages: [prompt] }
    await service.reconcileTasks()
    expect(status()).toMatchObject({ status: 'running' })

    execution = { ...execution, status: 'idle' }
    await service.reconcileTasks()
    await service.reconcileTasks()
    expect(status()).toMatchObject({
      status: 'failed',
      error: expect.stringContaining('left the Oracle conversation'),
    })
    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)

    await service.dispatchTask({
      revision: service.snapshot().tasks![0]!.revision,
      taskId: task.id,
      requestId: '1e7d2a3f-4c5b-4d6e-9f7a-8b9c0d1e2f3a',
    })
    expect(enqueueManagerTask).toHaveBeenCalledTimes(2)
  })

  it('keeps a linked failure reason after its dispatch leaves the conversation', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['c'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'Oracle failed after linking an execution session.',
      nextAction: 'Run the focused queue test.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    const managerMessages: ManagerMessage[] = []
    const enqueueManagerTask = vi.fn(async (input: ManagerInternalSubmission) => {
      const message: ManagerMessage = {
        ...input,
        role: 'user',
        createdAt: now().toISOString(),
        state: 'queued',
      }
      managerMessages.push(message)
      return message
    })
    const service = new DreamerService(directory, options(now, {
      taskStore,
      enqueueManagerTask,
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(false, '', {
        id: 'execution-failed',
        status: 'idle',
        messages: [],
      }),
    }))
    await service.initialize()
    await service.dispatchTask({
      revision: task.revision,
      taskId: task.id,
      requestId: '2a8e3b4f-5d6c-4e7f-8a9b-0c1d2e3f4a5b',
    })
    managerMessages[0]!.state = 'failed'
    managerMessages[0]!.error = 'Oracle lost its own turn after dispatch.'
    managerMessages.push({
      id: 'failed-session-link',
      role: 'activity',
      content: 'Started execution session',
      createdAt: now().toISOString(),
      replyTo: managerMessages[0]!.id,
      sessionRefs: [{ computerId: 'computer-a', sessionId: 'execution-failed' }],
    })
    await service.reconcileTasks()
    const failed = {
      status: 'failed',
      error: 'Oracle lost its own turn after dispatch.',
    }
    expect(service.snapshot().tasks![0]!.attempts[0]).toMatchObject(failed)

    managerMessages.length = 0
    await service.reconcileTasks()

    expect(service.snapshot().tasks![0]).toMatchObject({
      status: 'failed',
      attempts: [failed],
    })
    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)
  })

  it('links carried suggestions to one durable task and replays investigation idempotently', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const store = new DreamerStore(directory, { now, randomUUID: () => 'carry-claim' })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected carried-plan claim')
    await store.commitRun(claim.claim, {
      id: 'carried-plan',
      localDate: '2026-10-29',
      timeZone: 'UTC',
      createdAt: '2026-10-29T02:00:00.000Z',
      items: [{
        id: 'carried-session-item',
        label: 'Investigate the carried session',
        reason: 'The prior plan still has unresolved session work.',
        status: 'pending',
        source: 'carry',
        computerId: 'computer-a',
        sessionId: 'session-error',
      }],
      coverage: ['carried-forward'],
      omitted: 0,
    }, [])
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const managerMessages: ManagerMessage[] = []
    const enqueueManagerTask = vi.fn(async (input: ManagerInternalSubmission) => {
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
    })
    const service = new DreamerService(directory, options(now, {
      store,
      taskStore,
      enqueueManagerTask,
      managerMessages: () => managerMessages,
      readSession: async () => completionSession(false, '', {
        status: 'running',
        isOpen: true,
        messages: [],
      }),
    }))
    await service.initialize()
    const original = service.snapshot()
    const request = {
      revision: original.revision,
      planId: original.plan!.id,
      investigate: {
        itemId: 'carried-session-item',
        requestId: '3d497b62-1df4-4c64-baf0-06fa2715df9a',
      },
    }

    const first = await service.editPlan(request)
    expect(first.plan!.items[0]).toMatchObject({
      id: 'carried-session-item',
      source: 'carry',
      status: 'skipped',
      taskId: expect.stringMatching(/^oracle-task-/),
    })
    expect(service.snapshot().plan!.items[0]).toMatchObject({
      status: 'skipped',
      taskId: first.plan!.items[0]!.taskId,
    })
    const replay = await service.editPlan(request)

    expect(enqueueManagerTask).toHaveBeenCalledTimes(1)
    expect(replay.plan!.items[0]!.taskId).toBe(first.plan!.items[0]!.taskId)
    expect(replay.tasks).toHaveLength(1)
    expect(replay.tasks![0]).toMatchObject({
      id: first.plan!.items[0]!.taskId,
      sourcePlan: {
        planId: 'carried-plan',
        itemId: 'carried-session-item',
      },
      attempts: [{ requestId: request.investigate.requestId }],
    })

    await expect(service.editPlan({
      revision: first.revision,
      planId: first.plan!.id,
      item: { id: 'carried-session-item', status: 'pending' },
    })).rejects.toMatchObject({ statusCode: 409 })

    const firstTask = taskStore.snapshot().tasks[0]!
    const firstAttempt = firstTask.attempts[0]!
    await taskStore.confirmCompletion({
      revision: firstTask.revision,
      taskId: firstTask.id,
      completion: {
        source: 'root-task-complete',
        attemptId: firstAttempt.id,
        computerId: 'computer-a',
        sessionId: 'execution-a',
        sessionRevision: 1,
        messageId: 'completion-a',
        toolCallId: 'task-complete-a',
        resultDigest: 'f'.repeat(64),
        completedAt: now().toISOString(),
        confirmedAt: now().toISOString(),
      },
    })
    const restored = await service.editPlan({
      revision: first.revision,
      planId: first.plan!.id,
      item: { id: 'carried-session-item', status: 'pending' },
    })
    expect(restored.plan!.items[0]).toMatchObject({
      status: 'pending',
      taskId: undefined,
    })

    const reinvestigated = await service.editPlan({
      revision: restored.revision,
      planId: restored.plan!.id,
      investigate: {
        itemId: 'carried-session-item',
        requestId: '5c02c9f5-c8c1-4d79-aab9-b84ee8a7f465',
      },
    })
    expect(reinvestigated.plan!.items[0]!.taskId).not.toBe(firstTask.id)
    expect(reinvestigated.tasks).toHaveLength(2)
    expect(enqueueManagerTask).toHaveBeenCalledTimes(2)
  })

  it('returns reconciled task evidence after a plan mutation', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now })
    await taskStore.initialize()
    const task = await taskStore.upsertFinding({
      sourceEventIds: ['3'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'Evidence should remain visible after plan edits.',
      nextAction: 'Review the task activity.',
      owner: 'oracle',
      executionPrompt: 'Run the focused queue test.',
    })
    await taskStore.beginAttempt({
      revision: task.revision,
      taskId: task.id,
      requestId: '58b25644-4ba7-437e-8ee8-115e939f1e4f',
      managerMessageId: 'task-evidence-message',
    })
    const managerMessages: ManagerMessage[] = [{
      id: 'task-evidence-message',
      role: 'user',
      content: 'Run the focused queue test.',
      createdAt: now().toISOString(),
      state: 'running',
      source: 'task',
      automatic: { kind: 'task', taskId: task.id },
    }, {
      id: 'task-evidence-activity',
      role: 'activity',
      content: 'vitest focused queue test passed',
      createdAt: now().toISOString(),
      replyTo: 'task-evidence-message',
      tool: 'vitest',
    }]
    const service = new DreamerService(directory, options(now, {
      taskStore,
      managerMessages: () => managerMessages,
    }))
    await service.start()
    await service.updateSettings({
      revision: service.snapshot().revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const current = await service.snapshotForApi()

    const mutated = await service.editPlan({
      revision: current.revision,
      planId: current.plan!.id,
      item: { id: current.plan!.items[0]!.id, status: 'skipped' },
    })

    expect(mutated.tasks![0]).toMatchObject({
      evidence: [{
        id: 'task-evidence-activity',
        kind: 'test',
        status: 'completed',
      }],
    })
  })

  it('offers only authoritative task completion evidence and confirms it idempotently', async () => {
    const directory = await root()
    let currentNow = new Date('2026-10-29T04:00:00.000Z')
    const queuedNow: Date[] = []
    const now = () => queuedNow.shift() ?? currentNow
    const readSession = vi.fn(async () => completionSession())
    const service = new DreamerService(directory, options(now, { readSession }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    const proposed = await service.snapshotForApi()
    const item = proposed.plan!.items[0]
    expect(item).toMatchObject({
      status: 'pending',
      source: 'session',
      computerId: 'computer-a',
      sessionId: 'session-error',
    })
    expect(readSession).toHaveBeenCalledWith('computer-a', 'session-error')
    await expect(readSession.mock.results[0].value).resolves.toMatchObject({
      messages: [expect.objectContaining({
        taskCompletion: expect.objectContaining({ source: 'root-task-complete' }),
      })],
    })
    expect(item.completionCandidate).toEqual({
      source: 'root-task-complete',
      computerId: 'computer-a',
      sessionId: 'session-error',
      sessionRevision: 7,
      messageId: 'completion-message',
      toolCallId: 'task-complete-call',
      completedAt: '2026-10-29T03:20:00.000Z',
      resultDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
      summary: '**Done.** The requested change passed its focused checks.',
    })

    const reordered = await service.editPlan({
      revision: proposed.revision,
      planId: proposed.plan!.id,
      order: proposed.plan!.items.map(({ id }) => id).reverse(),
    })
    const projectedItem = reordered.plan!.items.find(({ id }) => id === item.id)!
    expect(projectedItem.completionCandidate).toEqual(item.completionCandidate)

    queuedNow.push(
      new Date('2026-10-29T04:00:00.000Z'),
      new Date('2026-10-29T04:00:01.000Z'),
    )
    const confirmation = {
      revision: reordered.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        computerId: item.completionCandidate!.computerId,
        sessionId: item.completionCandidate!.sessionId,
        sessionRevision: item.completionCandidate!.sessionRevision,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    }
    const [confirmed, concurrentDuplicate] = await Promise.all([
      service.editPlan(confirmation),
      service.editPlan(confirmation),
    ])
    expect(concurrentDuplicate.revision).toBe(confirmed.revision)
    expect(confirmed.plan!.items.find(({ id }) => id === item.id)).toMatchObject({
      status: 'done',
      completion: {
        computerId: 'computer-a',
        sessionId: 'session-error',
        sessionRevision: 7,
        messageId: 'completion-message',
        toolCallId: 'task-complete-call',
        resultDigest: item.completionCandidate!.resultDigest,
        completedAt: '2026-10-29T03:20:00.000Z',
        confirmedAt: '2026-10-29T04:00:00.000Z',
      },
    })

    currentNow = new Date('2026-10-29T04:05:00.000Z')
    const readsAfterConfirmation = readSession.mock.calls.length
    readSession.mockRejectedValue(new Error('remote computer is offline'))
    const duplicate = await service.editPlan({
      revision: reordered.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        computerId: item.completionCandidate!.computerId,
        sessionId: item.completionCandidate!.sessionId,
        sessionRevision: item.completionCandidate!.sessionRevision,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })
    expect(duplicate.revision).toBe(confirmed.revision)
    expect(readSession).toHaveBeenCalledTimes(readsAfterConfirmation)

    const persisted = await import('node:fs/promises').then(({ readFile }) =>
      readFile(`${directory}/dreamer.json`, 'utf8'))
    expect(persisted).not.toContain('requested change passed')
    await service.stop()

    const reopened = new DreamerService(directory, options(now, { readSession }))
    await reopened.initialize()
    expect(reopened.snapshot().plan!.items.find(({ id }) => id === item.id)?.completion).toEqual(
      confirmed.plan!.items.find(({ id }) => id === item.id)?.completion,
    )
    await reopened.stop()
  })

  it('requires trusted completion evidence for carried session items', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-30T04:00:00.000Z')
    const store = new DreamerStore(directory, {
      now,
      randomUUID: () => 'carry-claim',
    })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-30'),
      localDate: '2026-10-30',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected carried-plan claim')
    await store.commitRun(claim.claim, {
      id: 'carried-plan',
      localDate: '2026-10-30',
      timeZone: 'UTC',
      createdAt: '2026-10-30T04:00:00.000Z',
      items: [{
        id: 'carried-session',
        label: 'Session needs attention',
        reason: 'Carried from the previous daily review.',
        status: 'pending',
        source: 'carry',
        computerId: 'computer-a',
        sessionId: 'session-error',
      }],
      coverage: ['journal-metadata-only'],
      omitted: 0,
    }, [])

    const service = new DreamerService(directory, options(now, {
      readSession: async () => completionSession(),
    }))
    await service.initialize()
    const snapshot = await service.snapshotForApi()
    const item = snapshot.plan!.items[0]
    expect(item.completionCandidate).toMatchObject({
      messageId: 'completion-message',
      toolCallId: 'task-complete-call',
    })
    await expect(service.editPlan({
      revision: snapshot.revision,
      planId: snapshot.plan!.id,
      item: { id: item.id, status: 'done' },
    })).rejects.toMatchObject({ statusCode: 409 })

    const confirmed = await service.editPlan({
      revision: snapshot.revision,
      planId: snapshot.plan!.id,
      completion: {
        itemId: item.id,
        computerId: item.completionCandidate!.computerId,
        sessionId: item.completionCandidate!.sessionId,
        sessionRevision: item.completionCandidate!.sessionRevision,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })
    expect(confirmed.plan!.items[0]).toMatchObject({
      source: 'carry',
      status: 'done',
      completion: {
        computerId: 'computer-a',
        sessionId: 'session-error',
      },
    })
  })

  it('refuses plain assistant text as task completion evidence', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now, {
      readSession: async () => completionSession(false),
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const snapshot = await service.snapshotForApi()
    expect(snapshot.plan!.items[0].completionCandidate).toBeUndefined()
    expect(snapshot.plan!.items[0]).toMatchObject({
      sourceState: 'pending',
      sourceStateReason: expect.stringMatching(/no verified root task completion/i),
    })
    await expect(service.editPlan({
      revision: snapshot.revision,
      planId: snapshot.plan!.id,
      completion: {
        itemId: snapshot.plan!.items[0].id,
        computerId: 'computer-a',
        sessionId: 'session-error',
        sessionRevision: 7,
        messageId: 'completion-message',
        resultDigest: 'a'.repeat(64),
      },
    })).rejects.toMatchObject({ statusCode: 409 })
    await service.stop()
  })

  it('refuses historical completion evidence after a newer root user turn', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now, {
      readSession: async () => completionSession(true, undefined, {
        status: 'waiting',
        revision: 8,
        messages: [
          completionSession().messages[0],
          {
            id: 'newer-user-turn',
            role: 'user',
            content: 'Now handle the follow-up task.',
            createdAt: '2026-10-29T03:25:00.000Z',
          },
        ],
      }),
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    const snapshot = await service.snapshotForApi()
    expect(snapshot.plan!.items[0].completionCandidate).toBeUndefined()
    expect(snapshot.plan!.items[0]).toMatchObject({
      sourceState: 'pending',
      sourceStateReason: expect.stringMatching(/no verified root task completion/i),
    })
    await service.stop()
  })

  it('reports an unavailable completion source and refuses confirmation until it can be re-read', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now, {
      readSession: async () => {
        throw new Error('remote computer is offline')
      },
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    const snapshot = await service.snapshotForApi()
    expect(snapshot.plan!.items[0]).toMatchObject({
      source: 'session',
      completionSourceUnavailable: true,
      sourceState: 'unavailable',
      sourceStateReason: expect.stringMatching(/offline or unavailable/i),
    })
    expect(snapshot.plan!.items[0].completionCandidate).toBeUndefined()
    await expect(service.editPlan({
      revision: snapshot.revision,
      planId: snapshot.plan!.id,
      completion: {
        itemId: snapshot.plan!.items[0].id,
        computerId: 'computer-a',
        sessionId: 'session-error',
        sessionRevision: 7,
        messageId: 'completion-message',
        resultDigest: 'a'.repeat(64),
      },
    })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringMatching(/could not be re-read/i),
    })
    await service.stop()
  })

  it('revalidates the exact authoritative result before confirming completion', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    let result = completionSession()
    const service = new DreamerService(directory, options(now, {
      readSession: async () => result,
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const proposed = await service.snapshotForApi()
    const item = proposed.plan!.items[0]
    result = completionSession(true, '**Changed.** This is not the reviewed result.')

    await expect(service.editPlan({
      revision: proposed.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        computerId: item.completionCandidate!.computerId,
        sessionId: item.completionCandidate!.sessionId,
        sessionRevision: item.completionCandidate!.sessionRevision,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })).rejects.toMatchObject({ statusCode: 409 })
    expect(service.snapshot().plan!.items[0].status).toBe('pending')
    expect(service.snapshot().plan!.items[0].completion).toBeUndefined()
    await service.stop()
  })

  it('refuses completion when the reviewed session identity or revision changed', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    let result = completionSession()
    const service = new DreamerService(directory, options(now, {
      readSession: async () => result,
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const proposed = await service.snapshotForApi()
    const item = proposed.plan!.items[0]
    result = completionSession(true, item.completionCandidate!.summary, { revision: 8 })

    await expect(service.editPlan({
      revision: proposed.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        computerId: item.completionCandidate!.computerId,
        sessionId: item.completionCandidate!.sessionId,
        sessionRevision: item.completionCandidate!.sessionRevision,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringMatching(/changed/i),
    })

    await expect(service.editPlan({
      revision: proposed.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        computerId: 'wrong-computer',
        sessionId: 'wrong-session',
        sessionRevision: item.completionCandidate!.sessionRevision,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringMatching(/no longer available/i),
    })
    expect(service.snapshot().plan!.items[0].status).toBe('pending')
    await service.stop()
  })

  it('filters an authoritatively closed session instead of rendering stale journal metadata', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now, {
      readSession: async () => completionSession(false, '', {
        status: 'idle',
        isOpen: false,
        messages: [],
      }),
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    const snapshot = await service.snapshotForApi()
    expect(snapshot.plan!.items).toEqual([])
    expect(snapshot.plan!.coverage).toContain(
      'Excluded 1 session that is authoritatively closed or missing.',
    )
    await service.stop()
  })

  it('keeps an actionable carry pending when its authoritative session is running', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const store = new DreamerStore(directory, { now, randomUUID: () => 'running-claim' })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected running-carry claim')
    await store.commitRun(claim.claim, {
      id: 'running-carry-plan',
      localDate: '2026-10-29',
      timeZone: 'UTC',
      createdAt: '2026-10-29T02:00:00.000Z',
      items: [{
        id: 'running-carry',
        label: 'Session needs attention',
        reason: 'Journal metadata reports an unresolved error.',
        status: 'pending',
        source: 'carry',
        computerId: 'computer-a',
        sessionId: 'running-session',
      }],
      coverage: ['journal-metadata-only'],
      omitted: 0,
    }, [])

    const service = new DreamerService(directory, options(now, {
      readSession: async () => completionSession(false, '', {
        id: 'running-session',
        status: 'running',
        isOpen: true,
        messages: [],
      }),
    }))
    await service.initialize()

    const snapshot = await service.snapshotForApi()
    expect(snapshot.plan!.items).toEqual([
      expect.objectContaining({
        id: 'running-carry',
        sessionId: 'running-session',
        source: 'carry',
        sourceState: 'pending',
      }),
    ])
    expect(service.snapshot().plan!.items).toEqual([
      expect.objectContaining({ id: 'running-carry', sessionId: 'running-session' }),
    ])
    await service.stop()
  })

  it('durably removes hidden sessions before visible reorder and status edits', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const store = new DreamerStore(directory, { now, randomUUID: () => 'reconcile-claim' })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected reconciliation-plan claim')
    await store.commitRun(claim.claim, {
      id: 'reconciliation-plan',
      localDate: '2026-10-29',
      timeZone: 'UTC',
      createdAt: '2026-10-29T02:00:00.000Z',
      items: [
        {
          id: 'waiting-session',
          label: 'Session is waiting',
          reason: 'Journal metadata reports that the session is waiting.',
          status: 'pending',
          source: 'session',
          computerId: 'computer-a',
          sessionId: 'waiting-session',
        },
        {
          id: 'duplicate-waiting-session',
          label: 'pending',
          reason: 'Duplicate generated proposal.',
          status: 'pending',
          source: 'carry',
          computerId: 'computer-a',
          sessionId: 'waiting-session',
        },
        {
          id: 'closed-session',
          label: 'Review completion',
          reason: 'Historical orphan metadata.',
          status: 'pending',
          source: 'session',
          computerId: 'computer-a',
          sessionId: 'closed-session',
        },
      ],
      coverage: ['journal-metadata-only'],
      omitted: 0,
    }, [])
    const unreconciledRevision = store.snapshot().revision

    const service = new DreamerService(directory, options(now, {
      readSession: async (_computerId, sessionId) => completionSession(false, '', {
        id: sessionId,
        status: sessionId === 'closed-session' ? 'idle' : 'waiting',
        isOpen: sessionId !== 'closed-session',
        messages: [],
      }),
    }))
    await service.initialize()

    const snapshot = await service.snapshotForApi()
    expect(snapshot.revision).toBeGreaterThan(unreconciledRevision)
    expect(snapshot.plan!.items.map(({ sessionId }) => sessionId)).toEqual(['waiting-session'])
    expect(service.snapshot().plan!.items.map(({ sessionId }) => sessionId))
      .toEqual(['waiting-session'])
    expect(snapshot.plan!.coverage).toEqual(expect.arrayContaining([
      'Excluded 1 duplicate session proposal.',
      'Excluded 1 session that is authoritatively closed or missing.',
    ]))
    await expect(service.editPlan({
      revision: unreconciledRevision,
      planId: snapshot.plan!.id,
      order: snapshot.plan!.items.map(({ id }) => id),
    })).rejects.toMatchObject({ statusCode: 409 })

    const reordered = await service.editPlan({
      revision: snapshot.revision,
      planId: snapshot.plan!.id,
      order: snapshot.plan!.items.map(({ id }) => id),
    })
    expect(reordered.plan!.items.map(({ sessionId }) => sessionId)).toEqual(['waiting-session'])

    const skipped = await service.editPlan({
      revision: reordered.revision,
      planId: reordered.plan!.id,
      item: { id: reordered.plan!.items[0].id, status: 'skipped' },
    })
    expect(skipped.plan!.items).toEqual([
      expect.objectContaining({ sessionId: 'waiting-session', status: 'skipped' }),
    ])

    const refreshed = await service.snapshotForApi()
    expect(refreshed.plan!.items).toEqual([
      expect.objectContaining({ sessionId: 'waiting-session', status: 'skipped' }),
    ])
    expect(service.snapshot().plan!.items).toEqual([
      expect.objectContaining({ sessionId: 'waiting-session', status: 'skipped' }),
    ])
    await service.stop()
  })

  it('does not read sources or create a timer while disabled', async () => {
    const directory = await root()
    const registry = vi.fn(() => ({}))
    const memory = vi.fn(() => ({ mode: 'off' as const, available: false, records: [], tombstones: [] }))
    const service = new DreamerService(directory, { now: () => new Date('2026-10-29T04:00:00.000Z'), registry, memory })
    await service.start()
    expect(registry).not.toHaveBeenCalled()
    expect(memory).not.toHaveBeenCalled()
    expect(service.timerActive()).toBe(false)
    await service.stop()
  })

  it('runs the deterministic plan immediately after enabling during the catch-up window', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now))
    await service.start()
    const disabled = service.snapshot()
    const enabled = await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    expect(enabled.plan?.localDate).toBe('2026-10-29')
    expect(enabled.plan?.items[0]).toMatchObject({
      source: 'session',
      sessionId: 'session-error',
      label: 'Session needs attention',
    })
    expect(JSON.stringify(enabled)).not.toContain('SECRET')
    expect(service.timerActive()).toBe(true)
    await service.stop()
  })

  it.each([
    ['Europe/Berlin', '2026-10-29T01:05:00.000Z', '2026-10-29'],
    ['Asia/Kathmandu', '2026-10-28T20:20:00.000Z', '2026-10-29'],
  ])('reopens a durable %s run without rejecting its encoded key', async (timeZone, instant, localDate) => {
    const directory = await root()
    const now = () => new Date(instant)
    const first = new DreamerService(directory, {
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })
    await first.initialize()
    const initial = first.snapshot()
    const enabled = await first.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone,
    })
    expect(enabled.plan?.localDate).toBe(localDate)
    await first.stop()

    const reopened = new DreamerService(directory, {
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })
    await expect(reopened.start()).resolves.toBeUndefined()
    expect(reopened.snapshot().plan?.localDate).toBe(localDate)
    const persisted = new DreamerStore(directory, { now })
    await persisted.initialize()
    expect(persisted.snapshot().runs).toHaveLength(1)
    await reopened.stop()
  })

  it('contains a claim persistence failure and stops its timer without raw error leakage', async () => {
    const directory = await root()
    let failWrites = false
    let currentNow = new Date('2026-10-29T01:00:00.000Z')
    const store = new DreamerStore(directory, {
      now: () => currentNow,
      writeFile: async (filePath, data, options) => {
        if (failWrites) throw new Error('/secret/provider/path must not reach UI')
        return writeFile(filePath, data, options)
      },
    })
    let tick: (() => void) | undefined
    const service = new DreamerService(directory, {
      store,
      now: () => currentNow,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
      setInterval: ((callback: (...args: unknown[]) => void) => {
        tick = callback as () => void
        return { unref: () => undefined } as unknown as ReturnType<typeof setInterval>
      }) as typeof setInterval,
      clearInterval: (() => undefined) as typeof clearInterval,
    })
    await service.initialize()
    const initial = service.snapshot()
    await service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    currentNow = new Date('2026-10-29T04:00:00.000Z')
    failWrites = true
    const unhandled: unknown[] = []
    const onUnhandled = (error: unknown) => unhandled.push(error)
    process.on('unhandledRejection', onUnhandled)
    tick?.()
    await vi.waitFor(() => {
      expect(service.timerActive()).toBe(false)
    })
    process.off('unhandledRejection', onUnhandled)
    expect(unhandled).toEqual([])
    await expect(service.snapshotForApi()).rejects.toMatchObject({ statusCode: 503 })
    expect(JSON.stringify(unhandled)).not.toContain('provider/path')
  })

  it('does not report success when recording a planner failure also loses storage', async () => {
    const directory = await root()
    let currentNow = new Date('2026-10-29T01:00:00.000Z')
    let failWrites = false
    const store = new DreamerStore(directory, {
      now: () => currentNow,
      writeFile: async (filePath, data, options) => {
        if (failWrites) throw new Error('/secret/failure/path must not reach UI')
        return writeFile(filePath, data, options)
      },
    })
    const service = new DreamerService(directory, {
      store,
      now: () => currentNow,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
      planner: () => {
        failWrites = true
        throw new Error('planner failed with a sensitive internal cause')
      },
    })
    await service.initialize()
    const initial = service.snapshot()
    await service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    currentNow = new Date('2026-10-29T04:00:00.000Z')
    const result = await service.runIfDue()
    expect(result.available).toBe(false)
    expect(result.lastError).toBe('Dreamer storage is unavailable.')
    expect(service.timerActive()).toBe(false)
  })

  it('fences an in-flight plan after disable and keeps the previous plan', async () => {
    const directory = await root()
    let release: (() => void) | undefined
    let started: (() => void) | undefined
    const blocked = new Promise<void>((resolve) => { release = resolve })
    const plannerStarted = new Promise<void>((resolve) => { started = resolve })
    const service = new DreamerService(directory, options(
      () => new Date('2026-10-29T04:00:00.000Z'),
      {
        planner: async (input) => {
          started?.()
          await blocked
          return input.defaultPlan
        },
      },
    ))
    await service.start()
    const initial = service.snapshot()
    const enabling = service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    // Enabling commits twice: the settings, then the claimed run. Only once the
    // planner is running is the revision the disable must name settled.
    await plannerStarted
    expect(service.snapshot().settings.enabled).toBe(true)

    const beforeDisable = service.snapshot()
    const disabling = service.updateSettings({
      revision: beforeDisable.revision,
      enabled: false,
      timeZone: 'UTC',
    })
    release?.()
    await enabling
    await disabling
    expect(service.snapshot().settings.enabled).toBe(false)
    expect(service.snapshot().plan).toBeUndefined()
    await service.stop()
  })

  it('does not wait indefinitely for a fenced planner when disabling', async () => {
    const directory = await root()
    let release: (() => void) | undefined
    let started: (() => void) | undefined
    const blocked = new Promise<void>((resolve) => { release = resolve })
    const plannerStarted = new Promise<void>((resolve) => { started = resolve })
    const service = new DreamerService(directory, options(
      () => new Date('2026-10-29T04:00:00.000Z'),
      {
        planner: async (input) => {
          started?.()
          await blocked
          return input.defaultPlan
        },
      },
    ))
    await service.start()
    const initial = service.snapshot()
    const enabling = service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    await plannerStarted
    expect(service.snapshot().settings.enabled).toBe(true)
    const disabling = service.updateSettings({
      revision: service.snapshot().revision,
      enabled: false,
      timeZone: 'UTC',
    })
    await expect(Promise.race([
      disabling.then(() => 'done'),
      new Promise((resolve) => setTimeout(() => resolve('timeout'), 50)),
    ])).resolves.toBe('done')
    release?.()
    await enabling
    await disabling
  })

  it('waits for an admitted commit critical section but not a paused planner on stop', async () => {
    const directory = await root()
    let currentNow = new Date('2026-10-29T01:00:00.000Z')
    let blockCommit = false
    let releaseCommit: (() => void) | undefined
    let commitStarted: (() => void) | undefined
    const commitReady = new Promise<void>((resolve) => { commitStarted = resolve })
    const commitGate = new Promise<void>((resolve) => { releaseCommit = resolve })
    const store = new DreamerStore(directory, {
      now: () => currentNow,
      writeFile: async (filePath, data, options) => {
        if (blockCommit) {
          commitStarted?.()
          await commitGate
          blockCommit = false
        }
        return writeFile(filePath, data, options)
      },
    })
    const service = new DreamerService(directory, {
      store,
      now: () => currentNow,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
      planner: async (input) => {
        blockCommit = true
        return input.defaultPlan
      },
    })
    await service.initialize()
    const initial = service.snapshot()
    await service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    currentNow = new Date('2026-10-29T04:00:00.000Z')
    const worker = service.runIfDue()
    await commitReady
    const stopping = service.stop()
    await expect(Promise.race([
      stopping.then(() => 'done'),
      new Promise((resolve) => setTimeout(() => resolve('timeout'), 50)),
    ])).resolves.toBe('timeout')
    releaseCommit?.()
    await worker
    await stopping
    expect(service.snapshot().plan?.localDate).toBe('2026-10-29')
  })

  it('marks a persisted memory reference stale before exposing it as an active suggestion', async () => {
    const directory = await root()
    let memory = {
      mode: 'on' as const,
      available: true,
      records: [{
        id: 'memory-a',
        kind: 'fact' as const,
        scope: { type: 'user' as const },
        authority: 'direct-user' as const,
        confidence: 1,
        createdAt: '2026-10-28T00:00:00.000Z',
        updatedAt: '2026-10-29T03:00:00.000Z',
      }],
      tombstones: [] as Array<{ recordId: string }>,
    }
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      memory: () => memory,
    })
    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    expect(enabled.plan?.items[0]).toMatchObject({ memoryId: 'memory-a', status: 'pending' })
    memory = {
      ...memory,
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }
    const refreshed = await service.snapshotForApi()
    expect(refreshed.plan?.items[0]).toMatchObject({ memoryId: 'memory-a', status: 'skipped' })
  })

  it('captures only the structured-memory metadata projection', async () => {
    const directory = await root()
    const fullSnapshot = vi.fn(() => {
      throw new Error('full structured-memory snapshot must not be read')
    })
    const metadataSnapshot = vi.fn(() => ({
      records: [{
        id: 'memory-a',
        kind: 'fact' as const,
        scope: { type: 'user' as const },
        authority: 'direct-user' as const,
        confidence: 1,
        createdAt: '2026-10-28T00:00:00.000Z',
        updatedAt: '2026-10-29T03:00:00.000Z',
      }],
      tombstones: [],
    }))
    const structuredMemory = {
      mode: 'on' as const,
      store: {
        failureReason: () => undefined,
        snapshot: fullSnapshot,
        metadataSnapshot,
      },
    } as unknown as ManagerStructuredMemoryRuntime
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      structuredMemory,
    })

    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    expect(metadataSnapshot).toHaveBeenCalled()
    expect(fullSnapshot).not.toHaveBeenCalled()
    expect(enabled.plan?.items[0]).toMatchObject({ memoryId: 'memory-a' })
  })

  it('does not clone extra sensitive fields from a direct metadata adapter', async () => {
    const directory = await root()
    const record: DreamerMemoryMetadataRecord = {
      id: 'memory-a',
      kind: 'fact',
      scope: { type: 'user' },
      authority: 'direct-user',
      confidence: 1,
      createdAt: '2026-10-28T00:00:00.000Z',
      updatedAt: '2026-10-29T03:00:00.000Z',
    }
    Object.defineProperty(record, 'content', {
      configurable: true,
      enumerable: true,
      get: () => {
        throw new Error('content was read')
      },
    })
    Object.defineProperty(record, 'canonicalKey', {
      configurable: true,
      enumerable: true,
      get: () => {
        throw new Error('canonicalKey was read')
      },
    })
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      memory: () => ({
        mode: 'on',
        available: true,
        records: [record],
        tombstones: [],
      }),
    })

    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    expect(enabled.plan?.items[0]).toMatchObject({ memoryId: 'memory-a' })
  })

  it('derives a missed current-window status without rewriting state', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T09:00:00.000Z')
    const store = new DreamerStore(directory, { now })
    const recordError = vi.spyOn(store, 'recordError')
    const service = new DreamerService(directory, {
      store,
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })

    await service.initialize()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const revision = enabled.revision
    const missed = await service.snapshotForApi()

    expect(missed.lastError).toBe('Dreamer missed the current review window.')
    expect(store.snapshot().revision).toBe(revision)
    expect(recordError).not.toHaveBeenCalled()
    await service.stop()
  })

  it('keeps an existing error instead of deriving a missed status', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T09:00:00.000Z')
    const store = new DreamerStore(directory, { now })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    await store.recordError('An existing safe Dreamer error.')
    const service = new DreamerService(directory, {
      store,
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })
    await service.initialize()

    await expect(service.snapshotForApi()).resolves.toMatchObject({
      lastError: 'An existing safe Dreamer error.',
    })
  })

  it('reports an abandoned overnight claim as missed after restart outside the window', async () => {
    const directory = await root()
    let now = new Date('2026-10-29T02:00:00.000Z')
    const store = new DreamerStore(directory, { now: () => now })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })
    now = new Date('2026-10-29T09:00:00.000Z')
    const registry = vi.fn(() => ({}))
    const restarted = new DreamerService(directory, { now: () => now, registry })
    await restarted.start()
    try {
      await expect(restarted.snapshotForApi()).resolves.toMatchObject({
        lastError: 'Dreamer missed the current review window.',
      })
      expect(registry).not.toHaveBeenCalled()
    } finally {
      await restarted.stop()
    }
  })

  it('coalesces concurrent stale-memory GET reconciliation without losing revisions', async () => {
    const directory = await root()
    let memory = activeMemory()
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      memory: () => memory,
    })
    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    expect(enabled.plan?.items[0].status).toBe('pending')
    memory = {
      ...memory,
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }

    const snapshots = await Promise.all(
      Array.from({ length: 4 }, () => service.snapshotForApi()),
    )
    expect(snapshots.every((snapshot) =>
      snapshot.plan?.items[0].status === 'skipped')).toBe(true)
    expect(new Set(snapshots.map(({ revision }) => revision)).size).toBe(1)
  })

  it.each([
    ['forgotten', {
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }],
    ['expired', {
      records: [{
        ...activeMemory().records[0],
        validUntil: '2026-10-29T03:00:00.000Z',
      }],
      tombstones: [],
    }],
    ['tombstoned', {
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }],
    ['superseded', {
      records: [{
        ...activeMemory().records[0],
        supersededById: 'memory-new',
      }],
      tombstones: [],
    }],
  ])('rejects restoring a %s memory item while enabled and disabled', async (_label, stale) => {
    for (const enabledState of [true, false]) {
      const directory = await root()
      let memory = activeMemory()
      const service = new DreamerService(directory, {
        now: () => new Date('2026-10-29T04:00:00.000Z'),
        registry: () => ({}),
        memory: () => memory,
      })
      await service.start()
      const initial = service.snapshot()
      await service.updateSettings({
        revision: initial.revision,
        enabled: true,
        timeZone: 'UTC',
      })
      if (!enabledState) {
        const beforeDisable = service.snapshot()
        await service.updateSettings({
          revision: beforeDisable.revision,
          enabled: false,
          timeZone: 'UTC',
        })
      }
      const beforeEdit = service.snapshot()
      const item = beforeEdit.plan!.items[0]
      memory = {
        mode: 'on',
        available: true,
        records: stale.records,
        tombstones: stale.tombstones,
      }

      await expect(service.editPlan({
        revision: beforeEdit.revision,
        planId: beforeEdit.plan!.id,
        item: { id: item.id, status: 'pending' },
      })).rejects.toMatchObject({ statusCode: 409 })
      expect(service.snapshot().plan?.items[0].status).toBe('skipped')
      await service.stop()
    }
  })

  it.each(['off', 'shadow'] as const)(
    'does not read structured-memory state while refusing a restore in %s mode',
    async (mode) => {
      const directory = await root()
      const store = new DreamerStore(directory, {
        now: () => new Date('2026-10-29T04:00:00.000Z'),
      })
      await store.initialize()
      await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
      const claim = await store.claimRun({
        key: dreamerRunKey('UTC', '2026-10-29'),
        localDate: '2026-10-29',
        timeZone: 'UTC',
        generation: 1,
      })
      if (claim.kind !== 'claimed') throw new Error('expected a Dreamer claim')
      await store.commitRun(claim.claim, {
        id: 'plan-a',
        localDate: '2026-10-29',
        timeZone: 'UTC',
        createdAt: '2026-10-29T02:00:00.000Z',
        items: [{
          id: 'memory-item',
          label: 'Memory item needs review',
          reason: 'Structured-memory metadata identifies an active review candidate.',
          status: 'pending',
          source: 'memory',
          memoryId: 'memory-a',
          fingerprint: 'memory-fingerprint',
        }],
        coverage: [],
        omitted: 0,
      }, [])
      const disabled = store.snapshot()
      await store.updateSettings(disabled.revision, { enabled: false, timeZone: 'UTC' })
      const metadataSnapshot = vi.fn(() => {
        throw new Error('structured-memory state must not be read')
      })
      const structuredMemory = {
        mode,
        store: {
          failureReason: () => undefined,
          metadataSnapshot,
        },
      } as unknown as ManagerStructuredMemoryRuntime
      const service = new DreamerService(directory, {
        store,
        now: () => new Date('2026-10-29T04:00:00.000Z'),
        structuredMemory,
      })
      await service.initialize()
      const current = service.snapshot()

      await expect(service.editPlan({
        revision: current.revision,
        planId: 'plan-a',
        item: { id: 'memory-item', status: 'pending' },
      })).rejects.toMatchObject({ statusCode: 503 })
      expect(metadataSnapshot).not.toHaveBeenCalled()
    },
  )
})

const progressNow = () => new Date('2026-10-29T04:00:00.000Z')
const enabledSettings = (service: DreamerService, enabled = true) => ({
  revision: service.snapshot().revision,
  enabled,
  timeZone: 'UTC',
})

function progressSession(overrides: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id: 'session-progress',
    revision: 3,
    computerId: 'computer-a',
    computerName: 'development',
    cwd: '/home/tester/project',
    title: 'Queue regression',
    updatedAt: '2026-10-29T03:50:00.000Z',
    status: 'idle',
    isOpen: true,
    messages: [],
    ...overrides,
  }
}

function progressSource(sessions: () => ManagedSession[] = () => [progressSession()]) {
  return {
    listSessionsWithAuthority: vi.fn(async () => ({
      sessions: sessions(),
      answeredComputerIds: ['computer-a'],
    })),
    listComputers: vi.fn((): Array<{ id: string; name: string; lifecycleGeneration?: string }> => [
      { id: 'computer-a', name: 'development' },
    ]),
    readSession: vi.fn(async (computerId: string, sessionId: string) => {
      const session = sessions().find((candidate) =>
        candidate.computerId === computerId && candidate.id === sessionId)
      if (!session) throw new Error('The session is gone.')
      return session
    }),
  } satisfies DreamerProgressSource
}

function fakeIntervals() {
  const timers: Array<{ callback: () => void; ms: number; handle: object; cleared: boolean }> = []
  return {
    active: (ms: number) => timers.filter((timer) => timer.ms === ms && !timer.cleared),
    setInterval: ((callback: () => void, ms: number) => {
      const handle = { unref: () => undefined }
      timers.push({ callback, ms, handle, cleared: false })
      return handle
    }) as unknown as typeof setInterval,
    clearInterval: ((handle: object) => {
      const timer = timers.find((candidate) => candidate.handle === handle)
      if (timer) timer.cleared = true
    }) as unknown as typeof clearInterval,
  }
}

function gate() {
  let release = () => undefined as void
  const promise = new Promise<void>((resolve) => { release = resolve })
  return { promise, release: () => release() }
}

describe('DreamerService session progress', () => {
  it('refreshes at start and on its own interval while enabled', async () => {
    const directory = await root()
    const first = new DreamerService(directory, options(progressNow))
    await first.initialize()
    await first.updateSettings(enabledSettings(first))
    await first.stop()

    const source = progressSource()
    const intervals = fakeIntervals()
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: source,
      progressRefreshMs: 60_000,
      setInterval: intervals.setInterval,
      clearInterval: intervals.clearInterval,
    }))
    await service.start()
    expect(source.listSessionsWithAuthority).toHaveBeenCalledTimes(1)
    expect(intervals.active(60_000)).toHaveLength(1)

    await vi.waitFor(() => {
      expect(service.snapshot().progress).toEqual({
        refreshedAt: '2026-10-29T04:00:00.000Z',
        nextRefreshAt: '2026-10-29T04:01:00.000Z',
        staleComputers: [],
      })
    })
    await service.refreshProgress()
    const before = source.listSessionsWithAuthority.mock.calls.length
    intervals.active(60_000)[0]!.callback()
    await service.refreshProgress()
    expect(source.listSessionsWithAuthority).toHaveBeenCalledTimes(before + 1)
    await service.stop()
    expect(intervals.active(60_000)).toEqual([])
  })

  it('stays idle while disabled and forgets progress when disabled', async () => {
    const directory = await root()
    const source = progressSource()
    const intervals = fakeIntervals()
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: source,
      progressRefreshMs: 60_000,
      setInterval: intervals.setInterval,
      clearInterval: intervals.clearInterval,
    }))
    await service.start()
    expect(source.listSessionsWithAuthority).not.toHaveBeenCalled()
    expect(intervals.active(60_000)).toEqual([])
    expect(service.snapshot().progress).toBeUndefined()
    expect(service.progressView()).toBeUndefined()

    await service.updateSettings(enabledSettings(service))
    await vi.waitFor(() => {
      expect(service.progressView()?.entries).toEqual([
        expect.objectContaining({ sessionId: 'session-progress' }),
      ])
    })
    expect(intervals.active(60_000)).toHaveLength(1)

    await service.updateSettings(enabledSettings(service, false))
    expect(intervals.active(60_000)).toEqual([])
    expect(service.snapshot().progress).toBeUndefined()
    expect(service.progressView()).toBeUndefined()

    const listing = gate()
    source.listSessionsWithAuthority.mockImplementationOnce(async () => {
      await listing.promise
      return { sessions: [], answeredComputerIds: ['computer-a'] }
    })
    await service.updateSettings(enabledSettings(service))
    expect(service.progressView()?.entries).toEqual([])
    listing.release()
    await service.stop()
  })

  it('keeps no progress without a source', async () => {
    const service = new DreamerService(await root(), options(progressNow))
    await service.start()
    await service.updateSettings(enabledSettings(service))
    expect(service.snapshot().progress).toBeUndefined()
    expect(service.progressView()).toBeUndefined()
    await service.stop()
  })

  it.each(['disable', 'stop'] as const)(
    'publishes nothing from a refresh still in flight after %s',
    async (action) => {
      const directory = await root()
      const listing = gate()
      const source = progressSource()
      source.listSessionsWithAuthority.mockImplementationOnce(async () => {
        await listing.promise
        return { sessions: [progressSession()], answeredComputerIds: ['computer-a'] }
      })
      const sweepLifecycle = vi.fn(async () => undefined)
      const service = new DreamerService(directory, options(progressNow, {
        progressSource: source,
        sweepLifecycle,
      }))
      await service.start()
      await service.updateSettings(enabledSettings(service))
      await vi.waitFor(() => expect(source.listSessionsWithAuthority).toHaveBeenCalledTimes(1))
      const reconcile = vi.spyOn(service, 'reconcileTasks')

      if (action === 'disable') {
        await service.updateSettings(enabledSettings(service, false))
      } else {
        await service.stop()
      }
      listing.release()
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(sweepLifecycle).not.toHaveBeenCalled()
      expect(reconcile).not.toHaveBeenCalled()
      expect(service.progressView()).toBeUndefined()
      expect(service.snapshot().progress).toBeUndefined()
      expect(source.readSession).not.toHaveBeenCalled()
    },
  )

  it('reports a failed refresh without stopping Dreamer and clears it on the next tick', async () => {
    const directory = await root()
    const source = progressSource()
    source.listSessionsWithAuthority.mockRejectedValueOnce(
      new Error('/secret/node/path refused the listing'),
    )
    const intervals = fakeIntervals()
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: source,
      progressRefreshMs: 60_000,
      setInterval: intervals.setInterval,
      clearInterval: intervals.clearInterval,
    }))
    await service.start()
    await service.updateSettings(enabledSettings(service))

    await vi.waitFor(() => {
      expect(service.snapshot().progress?.error).toBe('Dreamer could not refresh session progress.')
    })
    expect(service.snapshot().available).toBe(true)
    expect(service.timerActive()).toBe(true)
    expect(JSON.stringify(service.snapshot())).not.toContain('/secret/node/path')
    expect(service.progressView()?.error).toBe('Dreamer could not refresh session progress.')

    await new Promise((resolve) => setTimeout(resolve, 0))
    intervals.active(60_000)[0]!.callback()
    await service.refreshProgress()
    expect(service.snapshot().progress?.refreshedAt).toBe('2026-10-29T04:00:00.000Z')
    expect(service.snapshot().progress?.error).toBeUndefined()
    await service.stop()
  })

  it('reconciles tasks, then sweeps lifecycle with only the sessions computers answered for', async () => {
    const directory = await root()
    const answered = progressSession()
    const cached = progressSession({
      id: 'session-cached',
      computerId: 'computer-b',
      computerName: 'production',
    })
    const source = progressSource(() => [answered, cached])
    source.listComputers.mockReturnValue([
      { id: 'computer-a', name: 'development', lifecycleGeneration: 'pairing-a' },
      { id: 'computer-b', name: 'production' },
    ])
    const order: string[] = []
    const sweepLifecycle = vi.fn(async (_sessions: ManagedSession[]) => {
      order.push('sweep')
    })
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: source,
      sweepLifecycle,
    }))
    await service.start()
    vi.spyOn(service, 'reconcileTasks').mockImplementation(async () => {
      order.push('reconcile')
    })
    await service.updateSettings(enabledSettings(service))

    await vi.waitFor(() => expect(sweepLifecycle).toHaveBeenCalledTimes(1))
    expect(sweepLifecycle).toHaveBeenCalledWith(
      [answered],
      new Map([['computer-a', 'pairing-a']]),
    )
    expect(order).toEqual(['reconcile', 'sweep'])
    expect(service.snapshot().progress?.staleComputers).toEqual(['production'])
    await service.stop()
  })

  it('still reconciles tasks, but sweeps nothing, when the listing fails', async () => {
    const directory = await root()
    const source = progressSource()
    const sweepLifecycle = vi.fn(async () => undefined)
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: source,
      sweepLifecycle,
    }))
    await service.start()
    await service.updateSettings(enabledSettings(service))
    await service.refreshProgress()
    const reconcile = vi.spyOn(service, 'reconcileTasks')
    const sweeps = sweepLifecycle.mock.calls.length
    source.listSessionsWithAuthority.mockRejectedValueOnce(new Error('the listing failed'))

    await service.refreshProgress()

    expect(reconcile).toHaveBeenCalledTimes(1)
    expect(sweepLifecycle).toHaveBeenCalledTimes(sweeps)
    expect(service.snapshot().progress?.error).toBe('Dreamer could not refresh session progress.')
    await service.stop()
  })

  it('contains upkeep failures', async () => {
    const directory = await root()
    const sweepLifecycle = vi.fn(async () => {
      throw new Error('the proactive inbox is full')
    })
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: progressSource(),
      sweepLifecycle,
    }))
    await service.start()
    vi.spyOn(service, 'reconcileTasks').mockRejectedValue(new Error('task storage failed'))
    await service.updateSettings(enabledSettings(service))
    await vi.waitFor(() => expect(sweepLifecycle).toHaveBeenCalledTimes(1))

    await expect(service.refreshProgress()).resolves.toBeUndefined()
    expect(service.snapshot().progress?.error).toBeUndefined()
    await service.stop()
  })

  it('shares one refresh between concurrent callers', async () => {
    const directory = await root()
    const source = progressSource()
    const sweepLifecycle = vi.fn(async () => undefined)
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: source,
      sweepLifecycle,
    }))
    await service.start()
    await service.updateSettings(enabledSettings(service))
    await service.refreshProgress()
    const listings = source.listSessionsWithAuthority.mock.calls.length
    const sweeps = sweepLifecycle.mock.calls.length

    await Promise.all([service.refreshProgress(), service.refreshProgress()])

    expect(source.listSessionsWithAuthority).toHaveBeenCalledTimes(listings + 1)
    expect(sweepLifecycle).toHaveBeenCalledTimes(sweeps + 1)
    await service.stop()
  })

  it('starts afresh when re-enabled and drops the cancelled refresh', async () => {
    const directory = await root()
    const listing = gate()
    const source = progressSource()
    source.listSessionsWithAuthority.mockImplementationOnce(async () => {
      await listing.promise
      throw new Error('the cancelled listing failed late')
    })
    const service = new DreamerService(directory, options(progressNow, { progressSource: source }))
    await service.start()
    await service.updateSettings(enabledSettings(service))
    expect(source.listSessionsWithAuthority).toHaveBeenCalledTimes(1)

    await service.updateSettings(enabledSettings(service, false))
    await service.updateSettings(enabledSettings(service))
    expect(source.listSessionsWithAuthority).toHaveBeenCalledTimes(2)
    await service.refreshProgress()
    listing.release()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(service.progressView()?.entries.map(({ sessionId }) => sessionId))
      .toEqual(['session-progress'])
    expect(service.snapshot().progress?.error).toBeUndefined()
    await service.stop()
  })

  it('does not sweep once disabled while reconciling', async () => {
    const directory = await root()
    const sweepLifecycle = vi.fn(async () => undefined)
    const service = new DreamerService(directory, options(progressNow, {
      progressSource: progressSource(),
      sweepLifecycle,
    }))
    await service.start()
    const reconciling = gate()
    const reconcile = vi.spyOn(service, 'reconcileTasks').mockReturnValue(reconciling.promise)
    await service.updateSettings(enabledSettings(service))
    await vi.waitFor(() => expect(reconcile).toHaveBeenCalledTimes(1))

    await service.updateSettings(enabledSettings(service, false))
    reconciling.release()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(sweepLifecycle).not.toHaveBeenCalled()
    await service.stop()
  })

  it('stops refreshing progress when Dreamer storage fails', async () => {
    const directory = await root()
    let currentNow = new Date('2026-10-29T01:00:00.000Z')
    let failWrites = false
    const store = new DreamerStore(directory, {
      now: () => currentNow,
      writeFile: async (filePath, data, writeOptions) => {
        if (failWrites) throw new Error('disk failed')
        return writeFile(filePath, data, writeOptions)
      },
    })
    const intervals = fakeIntervals()
    const service = new DreamerService(directory, options(() => currentNow, {
      store,
      progressSource: progressSource(),
      progressRefreshMs: 60_000,
      setInterval: intervals.setInterval,
      clearInterval: intervals.clearInterval,
      planner: () => {
        failWrites = true
        throw new Error('planner failed')
      },
    }))
    await service.initialize()
    await service.updateSettings(enabledSettings(service))
    await service.refreshProgress()
    expect(service.progressView()).toBeDefined()

    currentNow = new Date('2026-10-29T04:00:00.000Z')
    expect((await service.runIfDue()).available).toBe(false)

    expect(service.progressView()).toBeUndefined()
    expect(intervals.active(60_000)).toEqual([])
  })

  it('offers open tasks as follow-ups, most recently changed first', async () => {
    const directory = await root()
    let taskNow = new Date('2026-10-29T03:00:00.000Z')
    const taskStore = new OracleTaskStore(directory, { hubId: 'hub-a', now: () => taskNow })
    await taskStore.initialize()
    const finding = (title: string) => taskStore.upsertFinding({
      sourceEventIds: [createHash('sha256').update(title).digest('hex')],
      title,
      summary: `${title}.`,
      nextAction: `Next: ${title}.`,
      owner: 'user',
    })
    await finding('Review the queue fix')
    const completed = await finding('Confirm the rollout')
    const dismissed = await finding('Retry the flaky test')
    taskNow = new Date('2026-10-29T03:30:00.000Z')
    await finding('Answer the migration question')
    await taskStore.resolveUserTask({ taskId: completed.id, revision: completed.revision, status: 'completed' })
    await taskStore.resolveUserTask({ taskId: dismissed.id, revision: dismissed.revision, status: 'dismissed' })
    const service = new DreamerService(directory, options(progressNow, {
      taskStore,
      progressSource: progressSource(),
    }))
    await service.start()
    await service.updateSettings(enabledSettings(service))

    expect(service.progressView()?.followUps).toEqual([
      {
        title: 'Answer the migration question',
        owner: 'user',
        status: 'ready',
        nextAction: 'Next: Answer the migration question.',
      },
      {
        title: 'Review the queue fix',
        owner: 'user',
        status: 'ready',
        nextAction: 'Next: Review the queue fix.',
      },
    ])
    await service.updateSettings(enabledSettings(service, false))
    expect(service.progressView()).toBeUndefined()
    await service.stop()
  })

  it('applies hub events only while enabled', async () => {
    const directory = await root()
    const listing = gate()
    const source = progressSource(() => [])
    source.listSessionsWithAuthority.mockImplementation(async () => {
      await listing.promise
      return { sessions: [], answeredComputerIds: ['computer-a'] }
    })
    const service = new DreamerService(directory, options(progressNow, { progressSource: source }))
    await service.start()

    service.handleHubEvent({
      type: 'session.upserted',
      session: progressSession({ id: 'while-disabled' }),
    })
    await service.updateSettings(enabledSettings(service))
    service.handleHubEvent({
      type: 'session.upserted',
      session: progressSession({ id: 'while-enabled' }),
    })

    expect(service.progressView()?.entries.map(({ sessionId }) => sessionId))
      .toEqual(['while-enabled'])
    await service.stop()
    listing.release()
  })
})
