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
import {
  ManagerProactiveInbox,
  type ManagerProactiveInboxOptions,
} from './manager-proactive-inbox.js'
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
  readonly proactiveEnabled: boolean[] = []
  enqueueInternal = vi.fn(async (input: ManagerInternalSubmission) => {
    this.submissions.push(structuredClone(input))
    const existing = this.messages.find(({ id }) => id === input.id)
    if (existing) {
      if (
        existing.content !== input.content ||
        existing.source !== input.source ||
        JSON.stringify(existing.automatic) !== JSON.stringify(input.automatic)
      ) {
        throw Object.assign(
          new Error('An Oracle message already uses this deterministic ID.'),
          { statusCode: 409 },
        )
      }
      return existing
    }
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
  setProactiveMessagesEnabled = vi.fn(async (enabled: boolean) => {
    this.proactiveEnabled.push(enabled)
    if (enabled) return
    for (const message of this.messages) {
      if (
        message.source === 'proactive' &&
        (message.state === 'queued' || message.state === 'running')
      ) {
        this.cancellations.push(message.id)
        message.state = 'cancelled'
      }
    }
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

async function fixture(
  root: string,
  agent = new FakeAgent(),
  inboxOptions: Pick<
    ManagerProactiveInboxOptions,
    'now' | 'terminalEventRetentionMs'
  > = {},
) {
  const inbox = new ManagerProactiveInbox(path.join(root, 'inbox'), {
    enabled: true,
    hubId: 'hub-a',
    ...inboxOptions,
  })
  const taskStore = new OracleTaskStore(path.join(root, 'tasks'), {
    hubId: 'hub-a',
  })
  let current = managed('running', 1)
  let generation = 'pairing-a'
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
      lifecycleGeneration: generation,
    }],
    registry: () => registry,
    listSessions: async () => [current],
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
    setGeneration(value: string) {
      generation = value
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

  it('admits a transition only a refresh listing saw, once', async () => {
    const root = await directory()
    const { coordinator, inbox, agent } = await fixture(root)
    await coordinator.setEnabled(true)

    await coordinator.sweep([managed('idle', 2)])
    await coordinator.sweep([managed('idle', 2)])

    expect(agent.enqueueInternal).toHaveBeenCalledTimes(1)
    expect(agent.submissions[0]!.content).toContain('kind=finished')
    expect(inbox.pending(20)).toEqual([
      expect.objectContaining({ kind: 'finished', revision: 2 }),
    ])
  })

  it('observes a refresh listing before events that arrived after it', async () => {
    const root = await directory()
    const { coordinator, inbox } = await fixture(root)
    await coordinator.setEnabled(true)

    coordinator.handle(event(managed('running', 3)))
    await coordinator.sweep([managed('idle', 2)])

    expect(inbox.pending(20)).toEqual([
      expect.objectContaining({ kind: 'finished', revision: 2 }),
    ])
  })

  it('ignores a refresh listing while disabled or stopped', async () => {
    const root = await directory()
    const { coordinator, inbox, agent } = await fixture(root)
    await coordinator.setEnabled(true)
    await coordinator.setEnabled(false)

    await coordinator.sweep([managed('idle', 2)])
    await coordinator.stop()
    await coordinator.sweep([managed('idle', 3)])

    expect(inbox.pending(20)).toEqual([])
    expect(agent.enqueueInternal).not.toHaveBeenCalled()
  })

  it.each(['disable', 'stop'] as const)(
    'drops a refresh listing still queued at %s',
    async (action) => {
      const root = await directory()
      const { coordinator, inbox, agent } = await fixture(root)
      await coordinator.setEnabled(true)

      const sweeping = coordinator.sweep([managed('idle', 2)])
      await (action === 'disable' ? coordinator.setEnabled(false) : coordinator.stop())
      await sweeping

      expect(inbox.pending(20)).toEqual([])
      expect(agent.enqueueInternal).not.toHaveBeenCalled()
    },
  )

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

  it('replays the same batch content after session projection changes', async () => {
    const root = await directory()
    const agent = new FakeAgent()
    const first = await fixture(root, agent)
    await first.coordinator.setEnabled(true)
    first.coordinator.handle(event(managed('running', 1)))
    first.setCurrent({
      ...managed('error', 2),
      activity: 'Initial failure details.',
    })
    first.coordinator.handle(event({
      ...managed('error', 2),
      activity: 'Initial failure details.',
    }))
    await first.coordinator.drain()
    const original = agent.messages[0]!
    original.state = 'failed'
    original.retryCount = 1
    await first.coordinator.stop()

    const restarted = await fixture(root, agent)
    restarted.setCurrent({
      ...managed('idle', 3),
      activity: 'Later unrelated session state.',
    })

    await expect(restarted.coordinator.setEnabled(true)).resolves.toBeUndefined()
    expect(agent.submissions).toHaveLength(2)
    expect(agent.submissions[1]).toEqual(agent.submissions[0])
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

  it('keeps disable final against an older queued enable callback', async () => {
    const harness = await fixture(await directory())

    const enabling = harness.coordinator.setEnabled(true)
    const disabling = harness.coordinator.setEnabled(false)
    await Promise.all([enabling, disabling])

    expect(harness.coordinator.isEnabled()).toBe(false)
    expect(harness.agent.proactiveEnabled.at(-1)).toBe(false)
  })

  it('records only lifecycle changes, not every streamed revision', async () => {
    const { coordinator, inbox } = await fixture(await directory())
    await coordinator.setEnabled(true)
    const observe = vi.spyOn(inbox, 'observe')
    const transcript = Array.from({ length: 50 }, (_, index) => ({
      id: `m-${index}`,
      role: 'assistant' as const,
      content: 'streamed '.repeat(100),
      createdAt: '2026-11-06T03:00:00.000Z',
    }))
    for (let revision = 2; revision <= 200; revision += 1) {
      coordinator.handle(event({ ...managed('running', revision), messages: transcript }))
    }
    const finished = managed('idle', 201)
    coordinator.handle(event(finished))
    // The event is observed as it was delivered, not as later mutated.
    finished.status = 'running'

    await coordinator.drain()

    expect(observe).toHaveBeenCalledTimes(1)
    expect(inbox.pending(20)).toEqual([
      expect.objectContaining({ kind: 'finished', revision: 201 }),
    ])
  })

  it('prunes acknowledged evidence past retention after recording outcomes', async () => {
    let clock = Date.parse('2026-11-06T03:00:00.000Z')
    const { coordinator, inbox, agent } = await fixture(
      await directory(),
      new FakeAgent(),
      { now: () => new Date(clock), terminalEventRetentionMs: 1_000 },
    )
    await coordinator.setEnabled(true)
    const answer = async () => {
      await coordinator.drain()
      const message = agent.messages.at(-1)!
      await coordinator.recordProactiveOutcomes({
        message,
        outcomes: [{
          kind: 'no-action',
          eventIds: message.automatic!.eventIds!,
          reason: 'Expected failure.',
        }],
      })
      message.state = 'done'
    }
    coordinator.handle(event(managed('error', 2)))
    await answer()
    clock += 1_001
    coordinator.handle(event(managed('running', 3)))
    coordinator.handle(event(managed('error', 4)))
    await answer()

    await expect(inbox.prune()).resolves.toEqual({ pruned: 0 })
  })

  it('observes a change between two identical lifecycles', async () => {
    const { coordinator, inbox } = await fixture(await directory())
    await coordinator.setEnabled(true)
    const waiting = (revision: number, requestId: string): ManagedSession => ({
      ...managed('waiting', revision),
      pendingPermission: { requestId, title: 'Run tests?', options: [] },
    })

    coordinator.handle(event(waiting(2, 'request-1')))
    coordinator.handle(event(managed('running', 3)))
    coordinator.handle(event(waiting(4, 'request-2')))
    coordinator.handle(event(waiting(5, 'request-2')))
    await coordinator.drain()

    expect(inbox.pending(20)).toMatchObject([
      { kind: 'blocked', taskGeneration: 1, revision: 2 },
      { kind: 'blocked', taskGeneration: 2, revision: 4 },
    ])
  })

  it('observes a re-paired computer afresh at a lower revision', async () => {
    const { coordinator, inbox, setGeneration } = await fixture(await directory())
    await coordinator.setEnabled(true)
    coordinator.handle(event(managed('running', 50)))
    await coordinator.drain()

    setGeneration('pairing-b')
    coordinator.handle(event(managed('running', 2)))
    coordinator.handle(event(managed('idle', 3)))
    await coordinator.drain()

    expect(inbox.pending(20)).toMatchObject([
      { kind: 'finished', revision: 3 },
    ])
  })

  it('skips a debounced upsert read under a retired pairing', async () => {
    const { coordinator, inbox, setGeneration } = await fixture(await directory())
    await coordinator.setEnabled(true)
    coordinator.handle(event(managed('idle', 50)))
    setGeneration('pairing-b')
    coordinator.handle(event(managed('idle', 3)))

    await expect(coordinator.sweep([managed('running', 2)])).resolves.toBeUndefined()

    expect(inbox.pending(20)).toMatchObject([
      { kind: 'finished', revision: 3 },
    ])
  })

  it('skips a swept listing read under a retired pairing', async () => {
    const { coordinator, inbox, setGeneration } = await fixture(await directory())
    await coordinator.setEnabled(true)
    const listedUnder = new Map([['computer-a', 'pairing-a']])
    setGeneration('pairing-b')
    coordinator.handle(event(managed('running', 2)))
    await coordinator.drain()

    await coordinator.sweep([managed('idle', 50)], listedUnder)
    coordinator.handle(event(managed('idle', 3)))
    await coordinator.drain()

    expect(inbox.pending(20)).toMatchObject([
      { kind: 'finished', revision: 3 },
    ])
  })

  it('does not observe a lifecycle whose pairing is replaced while binding it', async () => {
    const { coordinator, inbox, agent, setGeneration } = await fixture(await directory())
    await coordinator.setEnabled(true)
    const bind = inbox.bindComputer.bind(inbox)
    vi.spyOn(inbox, 'bindComputer').mockImplementationOnce(async (...args) => {
      const result = await bind(...args)
      setGeneration('pairing-b')
      return result
    })
    const observe = vi.spyOn(inbox, 'observe')

    coordinator.handle(event(managed('error', 2)))
    await coordinator.drain()

    expect(observe).not.toHaveBeenCalled()
    expect(inbox.pending(20)).toEqual([])
    expect(agent.enqueueInternal).not.toHaveBeenCalled()
  })

  it('withholds evidence whose pairing is replaced while it is admitted', async () => {
    const { coordinator, inbox, agent, setGeneration } = await fixture(await directory())
    await coordinator.setEnabled(true)
    const admit = inbox.observe.bind(inbox)
    const observe = vi.spyOn(inbox, 'observe').mockImplementationOnce(async (value) => {
      const result = await admit(value)
      setGeneration('pairing-b')
      return result
    })

    coordinator.handle(event(managed('error', 2)))
    coordinator.handle(event(managed('running', 3)))
    await coordinator.drain()

    expect(observe).toHaveBeenCalledTimes(1)
    expect(inbox.pending(20)).toEqual([])
    expect(agent.enqueueInternal).not.toHaveBeenCalled()

    coordinator.handle(event(managed('running', 1)))
    coordinator.handle(event(managed('idle', 2)))
    await coordinator.drain()

    expect(inbox.pending(20)).toMatchObject([
      { kind: 'finished', computerGeneration: 'pairing-b', revision: 2 },
    ])
  })

  it('refuses outcomes for a batch whose pairing is replaced during the turn', async () => {
    const { coordinator, inbox, agent, taskStore, setGeneration } =
      await fixture(await directory())
    await coordinator.setEnabled(true)
    coordinator.handle(event(managed('error', 2)))
    await coordinator.drain()
    const message = agent.messages[0]!
    setGeneration('pairing-b')

    await expect(coordinator.recordProactiveOutcomes({
      message,
      outcomes: [{
        kind: 'task',
        eventIds: message.automatic!.eventIds!,
        title: 'Run the focused queue test',
        summary: 'The queue regression needs execution.',
        nextAction: 'Start a session and run the focused queue test.',
        owner: 'oracle',
        executionPrompt: 'Reproduce the queue regression and run its focused test.',
      }],
    })).rejects.toMatchObject({ statusCode: 409 })

    expect(taskStore.snapshot().tasks).toEqual([])
    expect(inbox.pending(20)).toEqual([])
  })
})
