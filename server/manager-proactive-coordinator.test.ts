import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type {
  ManagerEvent,
  ManagerInternalSubmission,
  ManagerMessage,
  ManagerSnapshot,
} from '../shared/manager.js'
import { ManagerProactiveCoordinator } from './manager-proactive-coordinator.js'
import { ManagerProactiveInbox } from './manager-proactive-inbox.js'
import { registryKey, type ManagerRegistry } from './manager-store.js'
import { OracleTaskStore } from './oracle-task-store.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

async function directory(): Promise<string> {
  const value = path.join(
    process.cwd(),
    `.manager-proactive-coordinator-test-${randomUUID()}`,
  )
  await mkdir(value, { recursive: true })
  directories.push(value)
  return value
}

function managed(status: ManagedSession['status'], revision: number): ManagedSession {
  return {
    id: 'session-a',
    revision,
    computerId: 'computer-a',
    computerName: 'development',
    cwd: '/redacted',
    title: 'Queue regression',
    status,
    updatedAt: '2026-11-06T03:00:00.000Z',
    isOpen: true,
    provider: 'copilot',
    messages: [],
  }
}

class FakeAgent extends EventEmitter<{ event: [ManagerEvent] }> {
  readonly submissions: ManagerInternalSubmission[] = []
  readonly messages: ManagerMessage[] = []
  readonly cancellations: string[] = []
  enqueueInternal = vi.fn(async (input: ManagerInternalSubmission) => {
    this.submissions.push(structuredClone(input))
    const existing = this.messages.find(({ id }) => id === input.id)
    if (existing) return existing
    const message: ManagerMessage = {
      ...input,
      role: 'user',
      createdAt: '2026-11-06T03:00:00.000Z',
      state: 'queued',
    }
    this.messages.push(message)
    return message
  })
  retry = vi.fn(async (id: string) => {
    const message = this.messages.find((candidate) => candidate.id === id)!
    message.state = 'queued'
    message.retryCount = (message.retryCount ?? 0) + 1
    delete message.error
    return message
  })
  cancelMessage = vi.fn(async (id: string) => {
    const message = this.messages.find((candidate) => candidate.id === id)!
    this.cancellations.push(id)
    message.state = 'cancelled'
    return message
  })
  snapshot(): ManagerSnapshot {
    return {
      available: true,
      status: 'idle',
      messages: structuredClone(this.messages),
      queued: this.messages.filter(({ state }) => state === 'queued').length,
      managedSessions: [],
    }
  }
}

async function fixture(root: string) {
  const inbox = new ManagerProactiveInbox(path.join(root, 'inbox'), {
    enabled: true,
    hubId: 'hub-a',
  })
  const taskStore = new OracleTaskStore(path.join(root, 'tasks'), {
    hubId: 'hub-a',
  })
  const agent = new FakeAgent()
  let current = managed('running', 1)
  const registry: ManagerRegistry = {
    [registryKey('computer-a', 'session-a')]: {
      computerId: 'computer-a',
      sessionId: 'session-a',
      title: 'Queue regression',
      origin: 'manager',
      firstSeenAt: '2026-11-06T02:00:00.000Z',
      task: 'Run the queue regression.',
    },
  }
  const coordinator = new ManagerProactiveCoordinator({
    inbox,
    taskStore,
    agent,
    computers: () => [{
      id: 'computer-a',
      name: 'development',
      isLocal: true,
      online: true,
      lifecycleGeneration: 'pairing-a',
    }],
    registry: () => registry,
    listSessions: async () => [current],
    readSession: async () => current,
    debounceMs: 1,
  })
  await coordinator.initialize()
  return {
    coordinator,
    inbox,
    taskStore,
    agent,
    setCurrent(session: ManagedSession) {
      current = session
    },
  }
}

function event(session: ManagedSession): HubEvent {
  return { type: 'session.upserted', session }
}

describe('ManagerProactiveCoordinator', () => {
  it('turns an admitted failed event into one deterministic Oracle message', async () => {
    const root = await directory()
    const { coordinator, agent, setCurrent } = await fixture(root)
    await coordinator.setEnabled(true)
    coordinator.handle(event(managed('running', 1)))
    setCurrent(managed('error', 2))
    coordinator.handle(event(managed('error', 2)))

    await coordinator.drain()

    expect(agent.enqueueInternal).toHaveBeenCalledTimes(1)
    expect(agent.submissions[0]).toMatchObject({
      source: 'proactive',
      id: expect.stringMatching(/^proactive-/),
      automatic: {
        kind: 'proactive',
        eventIds: [expect.stringMatching(/^[a-f0-9]{64}$/)],
        sessionRefs: [{
          computerId: 'computer-a',
          sessionId: 'session-a',
        }],
      },
    })
  })

  it('retries an unacknowledged proactive batch once without an automatic loop', async () => {
    const root = await directory()
    const { coordinator, inbox, agent, setCurrent } = await fixture(root)
    await coordinator.setEnabled(true)
    coordinator.handle(event(managed('running', 1)))
    setCurrent(managed('error', 2))
    coordinator.handle(event(managed('error', 2)))
    await coordinator.drain()
    const message = agent.messages[0]!
    message.state = 'failed'
    message.error = 'Oracle analysis failed.'
    agent.emit('event', { type: 'manager.message', message })

    await coordinator.drain()
    await new Promise((resolve) => setTimeout(resolve, 5))

    expect(agent.retry).toHaveBeenCalledTimes(1)
    expect(agent.retry).toHaveBeenCalledWith(message.id)
    message.state = 'failed'
    message.error = 'Oracle analysis failed again.'
    agent.emit('event', { type: 'manager.message', message })
    await coordinator.drain()
    await new Promise((resolve) => setTimeout(resolve, 5))

    expect(agent.retry).toHaveBeenCalledTimes(1)
    expect(agent.messages).toEqual([
      expect.objectContaining({ id: message.id, state: 'failed', retryCount: 1 }),
    ])
    expect(inbox.pending(20)).toHaveLength(1)
  })

  it('writes one task before acknowledging replayed events after restart', async () => {
    const root = await directory()
    const first = await fixture(root)
    await first.coordinator.setEnabled(true)
    first.coordinator.handle(event(managed('running', 1)))
    first.setCurrent(managed('error', 2))
    first.coordinator.handle(event(managed('error', 2)))
    await first.coordinator.drain()
    await first.coordinator.stop()

    const restarted = await fixture(root)
    restarted.setCurrent(managed('error', 2))
    await restarted.coordinator.setEnabled(true)
    await restarted.coordinator.drain()
    const message = restarted.agent.messages[0]!
    const eventId = message.automatic!.eventIds![0]!

    await restarted.coordinator.recordProactiveOutcomes({
      message,
      outcomes: [{
        kind: 'task',
        eventIds: [eventId],
        title: 'Run the focused queue test',
        summary: 'The queue regression needs execution.',
        nextAction: 'Start a session and run the focused queue test.',
        owner: 'oracle',
        executionPrompt: 'Reproduce the queue regression and run its focused test.',
      }],
    })

    expect(restarted.taskStore.snapshot().tasks).toHaveLength(1)
    expect(restarted.inbox.pending()).toHaveLength(0)
  })

  it('does not regroup events already durably linked before acknowledgement', async () => {
    const root = await directory()
    const first = await fixture(root)
    await first.coordinator.setEnabled(true)
    first.coordinator.handle(event(managed('running', 1)))
    first.setCurrent(managed('error', 2))
    first.coordinator.handle(event(managed('error', 2)))
    first.setCurrent(managed('running', 3))
    first.coordinator.handle(event(managed('running', 3)))
    first.setCurrent(managed('error', 4))
    first.coordinator.handle(event(managed('error', 4)))
    await first.coordinator.drain()
    const message = first.agent.messages[0]!
    const eventIds = message.automatic!.eventIds!
    expect(eventIds).toHaveLength(2)
    vi.spyOn(first.inbox, 'acknowledge')
      .mockRejectedValueOnce(new Error('Synthetic crash before acknowledgement.'))

    await expect(first.coordinator.recordProactiveOutcomes({
      message,
      outcomes: [{
        kind: 'task',
        eventIds,
        title: 'Investigate both queue failures',
        summary: 'Both lifecycle failures need one investigation.',
        nextAction: 'Run the focused queue tests.',
        owner: 'oracle',
        executionPrompt: 'Investigate both failures and run focused tests.',
      }],
    })).rejects.toThrow('Synthetic crash')
    expect(first.taskStore.snapshot().tasks).toHaveLength(1)
    expect(first.inbox.pending()).toHaveLength(2)
    await first.coordinator.stop()

    const restarted = await fixture(root)
    restarted.setCurrent(managed('error', 4))
    await restarted.coordinator.setEnabled(true)
    await restarted.coordinator.drain()
    const replay = restarted.agent.messages[0]!

    await restarted.coordinator.recordProactiveOutcomes({
      message: replay,
      outcomes: eventIds.map((eventId, index) => ({
        kind: 'task' as const,
        eventIds: [eventId],
        title: `Regrouped queue failure ${index + 1}`,
        summary: 'Replay proposed a narrower overlapping task.',
        nextAction: 'Run the focused queue test.',
        owner: 'oracle' as const,
        executionPrompt: 'Investigate this failure and run its focused test.',
      })),
    })

    expect(restarted.taskStore.snapshot().tasks).toHaveLength(1)
    expect(restarted.inbox.pending()).toHaveLength(0)
  })

  it.each(['queued', 'running'] as const)(
    'cancels admitted %s proactive work when Dreamer is disabled',
    async (state) => {
      const harness = await fixture(await directory())
      await harness.coordinator.setEnabled(true)
      harness.setCurrent(managed('error', 2))
      harness.coordinator.handle(event(managed('error', 2)))
      await harness.coordinator.drain()
      const message = harness.agent.messages[0]!
      message.state = state

      await harness.coordinator.setEnabled(false)

      expect(harness.agent.cancellations).toEqual([message.id])
      expect(message.state).toBe('cancelled')
      await expect(harness.coordinator.recordProactiveOutcomes({
        message,
        outcomes: [{
          kind: 'task',
          eventIds: message.automatic!.eventIds!,
          title: 'Post opt-out task',
          summary: 'This outcome arrived after Dreamer was disabled.',
          nextAction: 'Do not persist this task.',
          owner: 'oracle',
          executionPrompt: 'Do not run this prompt.',
        }],
      })).rejects.toMatchObject({ statusCode: 409 })
      expect(harness.taskStore.snapshot().tasks).toHaveLength(0)
      expect(harness.inbox.pending()).toHaveLength(1)
    },
  )
})
