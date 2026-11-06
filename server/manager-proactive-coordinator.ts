import { createHash } from 'node:crypto'
import type {
  ComputerSummary,
  HubEvent,
  ManagedSession,
} from '../shared/contracts.js'
import type {
  ManagerEvent,
  ManagerInternalSubmission,
  ManagerMessage,
  ManagerProactiveOutcome,
  ManagerSnapshot,
} from '../shared/manager.js'
import type { ManagerAgent } from './manager-agent.js'
import {
  ManagerProactiveInbox,
  type ManagerProactiveInboxEvent,
  type ManagerProactiveInboxObservation,
} from './manager-proactive-inbox.js'
import { registryKey, type ManagerRegistry } from './manager-store.js'
import { OracleTaskStore } from './oracle-task-store.js'

interface ProactiveManager {
  enqueueInternal(input: ManagerInternalSubmission): Promise<ManagerMessage>
  retry(messageId: string): Promise<ManagerMessage>
  snapshot(): ManagerSnapshot
  on(event: 'event', listener: (event: ManagerEvent) => void): unknown
  off(event: 'event', listener: (event: ManagerEvent) => void): unknown
}

export interface ManagerProactiveCoordinatorOptions {
  inbox: ManagerProactiveInbox
  taskStore: OracleTaskStore
  agent: ProactiveManager | Pick<
    ManagerAgent,
    'enqueueInternal' | 'retry' | 'snapshot' | 'on' | 'off'
  >
  computers: () => ComputerSummary[]
  registry: () => ManagerRegistry
  listSessions?: () => Promise<ManagedSession[]>
  readSession?: (
    computerId: string,
    sessionId: string,
  ) => Promise<ManagedSession>
  debounceMs?: number
}

function batchMessageId(events: readonly ManagerProactiveInboxEvent[]): string {
  const digest = createHash('sha256')
    .update(events.map(({ id }) => id).join('\0'))
    .digest('hex')
    .slice(0, 40)
  return `proactive-${digest}`
}

function oneLine(value: string | undefined, maximum: number): string | undefined {
  if (!value) return undefined
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > maximum ? `${text.slice(0, maximum - 1)}…` : text
}

function isTerminal(message: ManagerMessage): boolean {
  return message.role === 'user' &&
    message.source === 'proactive' &&
    !['queued', 'running'].includes(message.state ?? '')
}

export class ManagerProactiveCoordinator {
  private readonly inbox: ManagerProactiveInbox
  private readonly taskStore: OracleTaskStore
  private readonly agent: ProactiveManager
  private readonly computers: () => ComputerSummary[]
  private readonly registry: () => ManagerRegistry
  private readonly listSessions?: () => Promise<ManagedSession[]>
  private readonly readSession?: (
    computerId: string,
    sessionId: string,
  ) => Promise<ManagedSession>
  private readonly debounceMs: number
  private readonly pendingEvents: HubEvent[] = []
  private queue: Promise<unknown> = Promise.resolve()
  private timer?: ReturnType<typeof setTimeout>
  private initialized = false
  private enabled = false
  private stopped = false

  constructor(options: ManagerProactiveCoordinatorOptions) {
    this.inbox = options.inbox
    this.taskStore = options.taskStore
    this.agent = options.agent
    this.computers = options.computers
    this.registry = options.registry
    this.listSessions = options.listSessions
    this.readSession = options.readSession
    this.debounceMs = options.debounceMs ?? 25
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    await Promise.all([
      this.inbox.initialize(),
      this.taskStore.initialize(),
    ])
    this.initialized = true
    this.stopped = false
    this.agent.on('event', this.handleManagerEvent)
  }

  handle(event: HubEvent): void {
    if (
      !this.initialized ||
      this.stopped ||
      !this.enabled ||
      event.type !== 'session.upserted'
    ) return
    this.pendingEvents.push(structuredClone(event))
    this.schedule()
  }

  setEnabled(enabled: boolean): Promise<void> {
    this.requireReady()
    return this.enqueue(async () => {
      this.enabled = enabled
      if (!enabled) {
        this.pendingEvents.length = 0
        this.clearTimer()
        return
      }
      await this.reconcileCurrentSessions()
      await this.flushEvents()
      await this.drainNow()
    })
  }

  drain(): Promise<void> {
    this.requireReady()
    this.clearTimer()
    return this.enqueue(async () => {
      await this.flushEvents()
      await this.drainNow()
    })
  }

  recordProactiveOutcomes(input: {
    message: ManagerMessage
    outcomes: ManagerProactiveOutcome[]
  }): Promise<string> {
    this.requireReady()
    return this.enqueue(async () => {
      const eventIds = input.message.automatic?.kind === 'proactive'
        ? input.message.automatic.eventIds ?? []
        : []
      if (input.message.source !== 'proactive' || eventIds.length === 0) {
        throw Object.assign(
          new Error('The active Oracle message is not a proactive event batch.'),
          { statusCode: 409 },
        )
      }
      const referenced = input.outcomes.flatMap((outcome) => outcome.eventIds)
      if (
        referenced.length !== eventIds.length ||
        new Set(referenced).size !== referenced.length ||
        [...referenced].sort().join('\0') !== [...eventIds].sort().join('\0')
      ) {
        throw Object.assign(
          new Error('Every proactive event must appear exactly once.'),
          { statusCode: 409 },
        )
      }
      const pendingById = new Map(
        this.inbox.pending(20).map((event) => [event.id, event]),
      )
      if (eventIds.some((id) => !pendingById.has(id))) {
        throw Object.assign(
          new Error('The proactive event batch is no longer current.'),
          { statusCode: 409 },
        )
      }

      const handled: string[] = []
      const irrelevant: string[] = []
      let tasks = 0
      for (const outcome of input.outcomes) {
        if (outcome.kind === 'no-action') {
          irrelevant.push(...outcome.eventIds)
          continue
        }
        const events = outcome.eventIds.map((id) => pendingById.get(id)!)
        const first = events[0]!
        const oneSource = events.every((event) =>
          event.computerId === first.computerId &&
          event.sessionId === first.sessionId &&
          event.taskGeneration === first.taskGeneration
        )
        await this.taskStore.upsertFinding({
          sourceEventIds: outcome.eventIds,
          ...(oneSource
            ? {
                sourceSession: {
                  computerId: first.computerId,
                  sessionId: first.sessionId,
                  taskGeneration: first.taskGeneration,
                },
              }
            : {}),
          title: outcome.title,
          summary: outcome.summary,
          nextAction: outcome.nextAction,
          owner: outcome.owner,
          ...(outcome.executionPrompt
            ? { executionPrompt: outcome.executionPrompt }
            : {}),
        })
        tasks += 1
        handled.push(...outcome.eventIds)
      }
      if (handled.length) await this.inbox.acknowledge(handled, 'handled')
      if (irrelevant.length) {
        await this.inbox.acknowledge(irrelevant, 'irrelevant')
      }
      this.schedule()
      return `Recorded ${tasks} proactive ${tasks === 1 ? 'task' : 'tasks'} and ${irrelevant.length} no-action ${irrelevant.length === 1 ? 'event' : 'events'}.`
    })
  }

  async stop(): Promise<void> {
    if (!this.initialized) return
    this.stopped = true
    this.enabled = false
    this.pendingEvents.length = 0
    this.clearTimer()
    this.agent.off('event', this.handleManagerEvent)
    await this.queue.catch(() => undefined)
  }

  isEnabled(): boolean {
    return this.enabled
  }

  private readonly handleManagerEvent = (event: ManagerEvent): void => {
    if (
      event.type === 'manager.message' &&
      event.message.source === 'proactive' &&
      isTerminal(event.message)
    ) {
      this.schedule()
    }
  }

  private schedule(): void {
    if (this.timer || this.stopped || !this.enabled) return
    this.timer = setTimeout(() => {
      this.timer = undefined
      void this.enqueue(async () => {
        await this.flushEvents()
        await this.drainNow()
      }).catch(() => undefined)
    }, this.debounceMs)
    this.timer.unref?.()
  }

  private clearTimer(): void {
    if (!this.timer) return
    clearTimeout(this.timer)
    this.timer = undefined
  }

  private async reconcileCurrentSessions(): Promise<void> {
    if (!this.listSessions) return
    const sessions = await this.listSessions()
    for (const session of sessions) {
      await this.observeSession(session)
    }
  }

  private async flushEvents(): Promise<void> {
    const events = this.pendingEvents.splice(0)
    for (const event of events) {
      if (event.type === 'session.upserted') {
        await this.observeSession(event.session)
      }
    }
  }

  private async observeSession(session: ManagedSession): Promise<void> {
    const computer = this.computers().find(({ id }) => id === session.computerId)
    const generation = computer?.lifecycleGeneration
    if (!computer || !generation || !Number.isSafeInteger(session.revision)) return
    await this.inbox.bindComputer(computer.id, generation)
    const origin = this.registry()[
      registryKey(session.computerId, session.id)
    ]?.origin ?? 'discovered'
    const observation: ManagerProactiveInboxObservation = {
      computerId: session.computerId,
      computerGeneration: generation,
      sessionId: session.id,
      revision: session.revision!,
      origin,
      status: session.status,
      queuedCount: session.queuedCount ?? session.queuedPrompts?.length ?? 0,
      hasPendingRequest: Boolean(
        session.pendingPermission || session.pendingUserInput,
      ),
      isOpen: session.isOpen !== false,
      suspended: session.suspended === true,
      recovering:
        session.restartRecovery?.state === 'recovering' ||
        session.recoverySeedState === 'pending' ||
        session.recoverySeedState === 'dispatching',
    }
    await this.inbox.observe(observation)
  }

  private async drainNow(): Promise<void> {
    if (!this.enabled || this.stopped) return
    const active = this.agent.snapshot().messages.some((message) =>
      message.role === 'user' &&
      message.source === 'proactive' &&
      (message.state === 'queued' || message.state === 'running')
    )
    if (active) return
    const events = this.inbox.pending(20)
    if (events.length === 0) return
    const message = await this.agent.enqueueInternal({
      id: batchMessageId(events),
      content: await this.prompt(events),
      source: 'proactive',
      answerOnly: true,
      automatic: {
        kind: 'proactive',
        eventIds: events.map(({ id }) => id),
      },
    })
    if (isTerminal(message)) await this.agent.retry(message.id)
  }

  private async prompt(
    events: readonly ManagerProactiveInboxEvent[],
  ): Promise<string> {
    const lines = [
      'Review these durable manager-owned lifecycle events. Read state only, then record exactly one outcome for every event.',
    ]
    for (const event of events) {
      lines.push(
        `Event ${event.id}: kind=${event.kind}; computer=${event.computerId}; session=${event.sessionId}; taskGeneration=${event.taskGeneration}; revision=${event.revision}.`,
      )
      if (!this.readSession) continue
      const session = await this.readSession(
        event.computerId,
        event.sessionId,
      ).catch(() => undefined)
      if (!session) continue
      const details = [
        `status=${session.status}`,
        oneLine(session.title, 120)
          ? `title=${oneLine(session.title, 120)}`
          : undefined,
        oneLine(session.activity, 240)
          ? `activity=${oneLine(session.activity, 240)}`
          : undefined,
        session.pendingPermission ? 'pending=permission' : undefined,
        session.pendingUserInput ? 'pending=user-input' : undefined,
      ].filter(Boolean)
      lines.push(`Current passive projection: ${details.join('; ')}.`)
    }
    return lines.join('\n')
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const run = this.queue.then(operation)
    this.queue = run.then(() => undefined, () => undefined)
    return run
  }

  private requireReady(): void {
    if (!this.initialized || this.stopped) {
      throw new Error('The proactive coordinator is not running.')
    }
  }
}
