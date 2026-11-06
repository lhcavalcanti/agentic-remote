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
      },
    })
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
})
