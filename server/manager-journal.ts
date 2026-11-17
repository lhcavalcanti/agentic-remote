import type { HubEvent, ManagedSession, SessionStatus } from '../shared/contracts.js'
import { scheduleProposalSummary, type ScheduleProposal } from '../shared/schedule-proposals.js'
import {
  registryKey,
  type JournalDraft,
  type ManagerRegistry,
  type ManagerStore,
  type RegistryEntry,
} from './manager-store.js'

/** A session's last known state, as far as the journal is concerned. */
interface Seen {
  title: string
  status: SessionStatus | 'closed'
}

const TASK_LIMIT = 400

/** Replayed at startup as well as after each durable proposal transition. */
export async function recordScheduleProposals(store: ManagerStore, proposals: ScheduleProposal[]): Promise<void> {
  await store.appendProposalJournal(proposals.map((proposal) => ({
    createdAt: proposal.createdAt,
    entry: {
      kind: 'schedule-proposal', computerId: 'hub', sessionId: proposal.id,
      title: scheduleProposalSummary(proposal),
      proposalId: proposal.id, proposalOperation: proposal.operation, proposalStatus: proposal.status,
      ...(proposal.error ? { to: proposal.error } : {}),
    },
  })))
}

export interface JournalRecorderOptions {
  /** How long changes gather before they are written together. */
  flushDelayMs?: number
}

/** What a session was started to do: its first prompt, shortened. */
export function sessionTask(session: Pick<ManagedSession, 'messages'>): string | undefined {
  const first = session.messages?.find((message) => message.role === 'user')?.content.trim()
  if (!first) return undefined
  return first.length > TASK_LIMIT ? `${first.slice(0, TASK_LIMIT)}…` : first
}

/**
 * Turns the hub's session events into the manager's journal and registry.
 *
 * Session upserts arrive for every transcript change, so only identity, title,
 * and status transitions are recorded, and writes are batched. Anything missed
 * while the hub was down is caught by `reconcile`, which the manager runs
 * against the live list before every turn.
 */
export class JournalRecorder {
  private readonly flushDelayMs: number
  private readonly seen = new Map<string, Seen>()
  private drafts: JournalDraft[] = []
  private changes: Array<(registry: ManagerRegistry) => void> = []
  private timer?: ReturnType<typeof setTimeout>
  private writing: Promise<void> = Promise.resolve()
  private stopped = false

  constructor(private readonly store: ManagerStore, options: JournalRecorderOptions = {}) {
    this.flushDelayMs = options.flushDelayMs ?? 500
    for (const [key, entry] of Object.entries(store.registry())) {
      if (!entry.removedAt && !entry.replacedBy) {
        this.seen.set(key, { title: entry.title, status: entry.lastStatus ?? 'idle' })
      }
    }
  }

  handle(event: HubEvent): void {
    if (this.stopped) return
    if (event.type === 'session.upserted') {
      // Until a baseline exists, sessions arriving are the ones that already
      // existed, which a first start announces all at once.
      this.observe(event.session, !this.store.state().baselineAt)
    } else if (event.type === 'session.removed') {
      this.remove(event.computerId, event.sessionId, event.replacedBy)
    } else {
      return
    }
    this.schedule()
  }

  /**
   * Brings the journal in line with a full listing. The first listing ever
   * seen becomes the baseline and is not reported as new. A session missing
   * from a computer that answered is reported closed; one whose computer did
   * not answer is left alone.
   */
  async reconcile(sessions: ManagedSession[], answeredComputerIds: string[]): Promise<void> {
    if (this.stopped) return
    const baseline = !this.store.state().baselineAt
    const listed = new Set<string>()
    for (const session of sessions) {
      listed.add(registryKey(session.computerId, session.id))
      this.observe(session, baseline)
    }
    const answered = new Set(answeredComputerIds)
    for (const [key, seen] of this.seen) {
      if (listed.has(key) || seen.status === 'closed') continue
      const computerId = key.slice(0, key.indexOf(':'))
      if (!answered.has(computerId)) continue
      const sessionId = key.slice(key.indexOf(':') + 1)
      this.seen.set(key, { ...seen, status: 'closed' })
      if (!baseline) {
        this.drafts.push({ kind: 'status', computerId, sessionId, title: seen.title, from: seen.status, to: 'closed' })
      }
      this.changes.push((registry) => {
        if (registry[key]) registry[key].lastStatus = 'closed'
      })
    }
    if (baseline) {
      await this.store.updateState((state) => {
        state.baselineAt = new Date().toISOString()
      })
    }
    await this.flush()
  }

  /** Attributes a session to the manager and remembers what it was asked. */
  async markManaged(session: ManagedSession, task: string): Promise<void> {
    const key = registryKey(session.computerId, session.id)
    if (this.store.registry()[key]?.origin === 'schedule') throw new Error('Schedule sessions are not owned by Oracle')
    this.observe(session)
    this.changes.push((registry) => {
      const entry = registry[key]
      if (entry) {
        entry.origin = 'manager'
        entry.task = task.length > TASK_LIMIT ? `${task.slice(0, TASK_LIMIT)}…` : task
      }
    })
    await this.flush()
  }

  /** `computerId:sessionId` of every live session the manager started. */
  managedSessions(): string[] {
    return Object.entries(this.store.registry())
      .filter(([, entry]) => entry.origin === 'manager' && !entry.removedAt && !entry.replacedBy)
      .map(([key]) => key)
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    const drafts = this.drafts
    const changes = this.changes
    this.drafts = []
    this.changes = []
    if (drafts.length || changes.length) {
      this.writing = this.writing.then(async () => {
        if (changes.length) {
          await this.store.updateRegistry((registry) => {
            for (const change of changes) change(registry)
          })
        }
        await this.store.appendJournal(drafts)
      }).catch((error: unknown) => {
        console.warn('Manager journal write failed:', error)
      })
    }
    await this.writing
  }

  async stop(): Promise<void> {
    await this.flush()
    this.stopped = true
  }

  private observe(session: ManagedSession, baseline = false): void {
    const key = registryKey(session.computerId, session.id)
    const previous = this.seen.get(key)
    const title = session.title
    const status = session.status
    const now = new Date().toISOString()
    if (!previous) {
      this.seen.set(key, { title, status })
      const task = sessionTask(session)
      this.changes.push((registry) => {
        const existing = registry[key]
        const entry: RegistryEntry = {
          ...existing,
          computerId: session.computerId,
          sessionId: session.id,
          title,
          computerName: session.computerName,
          cwd: session.cwd,
          provider: session.provider ?? 'copilot',
          origin: existing?.origin ?? (baseline ? 'discovered' : 'user'),
          task: existing?.task ?? task,
          firstSeenAt: existing?.firstSeenAt ?? now,
          lastStatus: status,
          lastSeenAt: now,
        }
        delete entry.removedAt
        registry[key] = entry
      })
      if (!baseline) {
        this.drafts.push({
          kind: 'created',
          computerId: session.computerId,
          sessionId: session.id,
          computerName: session.computerName,
          title,
        })
      }
      return
    }
    if (previous.title === title && previous.status === status) return
    this.seen.set(key, { title, status })
    if (!baseline && previous.title !== title) {
      this.drafts.push({ kind: 'renamed', computerId: session.computerId, sessionId: session.id, from: previous.title, to: title })
    }
    if (!baseline && previous.status !== status) {
      this.drafts.push({ kind: 'status', computerId: session.computerId, sessionId: session.id, title, from: previous.status, to: status })
    }
    this.changes.push((registry) => {
      const entry = registry[key]
      if (!entry) return
      entry.title = title
      entry.lastStatus = status
      entry.lastSeenAt = now
      if (!entry.task) entry.task = sessionTask(session)
    })
  }

  private remove(computerId: string, sessionId: string, replacedBy?: string): void {
    const key = registryKey(computerId, sessionId)
    const previous = this.seen.get(key)
    this.seen.delete(key)
    const now = new Date().toISOString()
    // The replacement continues this session; the replacement entry says so,
    // and announcing it as new as well would only repeat that.
    if (replacedBy && previous && !this.seen.has(registryKey(computerId, replacedBy))) {
      this.seen.set(registryKey(computerId, replacedBy), previous)
    }
    this.drafts.push({
      kind: replacedBy ? 'replaced' : 'removed',
      computerId,
      sessionId,
      title: previous?.title,
      ...(replacedBy ? { replacedBy } : {}),
    })
    this.changes.push((registry) => {
      const entry = registry[key]
      if (!entry) return
      if (replacedBy) {
        entry.replacedBy = replacedBy
        entry.removedAt = now
        const successorKey = registryKey(computerId, replacedBy)
        registry[successorKey] = {
          ...entry,
          ...registry[successorKey],
          sessionId: replacedBy,
          origin: entry.origin,
          task: entry.task,
          firstSeenAt: registry[successorKey]?.firstSeenAt ?? now,
        }
        delete registry[successorKey].removedAt
        delete registry[successorKey].replacedBy
      } else {
        entry.removedAt = now
      }
    })
  }

  private schedule(): void {
    if (this.timer || this.stopped) return
    this.timer = setTimeout(() => {
      this.timer = undefined
      void this.flush()
    }, this.flushDelayMs)
    this.timer.unref?.()
  }
}
