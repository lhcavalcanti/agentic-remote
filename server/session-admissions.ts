import { AsyncLocalStorage } from 'node:async_hooks'
import type { SessionDetail } from '../shared/contracts.js'

export interface PendingQueueAdmission {
  assistantId: string
  started: boolean
  uncertain?: string
  completion?: Promise<SessionDetail>
}

interface Admission {
  done: Promise<void>
  active: boolean
  committed: boolean
  parent?: Admission
}

export interface ExclusiveAdmission {
  joinedActivity: boolean
  isCurrent: () => boolean
}

export class SessionAdmissions {
  private readonly pending = new Map<string, Set<Admission>>()
  private readonly context = new AsyncLocalStorage<ReadonlyMap<string, Admission>>()
  private readonly exclusiveOwners = new Map<string, object>()
  private readonly transcriptAdmissions = new Map<string, number>()
  private readonly stoppedLaunches = new Set<string>()

  constructor(private readonly isClosed: () => boolean) {}

  canEnter(sessionId: string): boolean {
    return !this.isClosed() && !this.stoppedLaunches.has(sessionId) && (!this.exclusiveOwners.has(sessionId) ||
      this.context.getStore()?.get(sessionId)?.active === true)
  }

  /** Immediate process-local fence, retained even if its durable write fails. */
  blockLaunch(sessionId: string): void {
    this.stoppedLaunches.add(sessionId)
  }

  launchBlocked(sessionId: string): boolean {
    return this.stoppedLaunches.has(sessionId)
  }

  /** True while any admitted or exclusive operation still holds the session. */
  hasPending(sessionId: string): boolean {
    return Boolean(this.pending.get(sessionId)?.size) || this.exclusiveOwners.has(sessionId)
  }

  protectsTranscript(sessionId: string): boolean {
    return (this.transcriptAdmissions.get(sessionId) || 0) > 0
  }

  markCommitted(sessionId: string): void {
    let admission = this.context.getStore()?.get(sessionId)
    if (!admission?.active) return
    // A detached nested handoff can outlive its caller. Preserve its outcome
    // on the ancestors an exclusive operation may already be joining.
    while (admission) {
      admission.committed = true
      admission = admission.parent
    }
  }

  async run<T>(
    sessionId: string,
    operation: () => Promise<T>,
    protectTranscript = false,
  ): Promise<T> {
    if (this.isClosed()) {
      throw Object.assign(new Error('The session service is stopping'), { statusCode: 503 })
    }
    if (this.launchBlocked(sessionId)) {
      throw Object.assign(new Error('The launch is stopping; no new work can start.'), { statusCode: 409, uncertainDelivery: false })
    }
    if (!this.canEnter(sessionId)) {
      throw Object.assign(new Error('The session is being cleared; try again once it settles'), { statusCode: 409 })
    }
    let finish = () => {}
    const pending = new Promise<void>((resolve) => { finish = resolve })
    const parent = this.context.getStore()?.get(sessionId)
    const admission: Admission = {
      done: pending, active: true, committed: false,
      parent: parent?.active ? parent : undefined,
    }
    const entries = this.pending.get(sessionId) || new Set<Admission>()
    entries.add(admission)
    this.pending.set(sessionId, entries)
    if (protectTranscript) {
      this.transcriptAdmissions.set(sessionId, (this.transcriptAdmissions.get(sessionId) || 0) + 1)
    }
    const context = new Map(this.context.getStore())
    context.set(sessionId, admission)
    try {
      return await this.context.run(context, operation)
    } finally {
      admission.active = false
      entries.delete(admission)
      if (!entries.size) this.pending.delete(sessionId)
      if (protectTranscript) {
        const remaining = (this.transcriptAdmissions.get(sessionId) || 1) - 1
        if (remaining) this.transcriptAdmissions.set(sessionId, remaining)
        else this.transcriptAdmissions.delete(sessionId)
      }
      finish()
    }
  }

  async exclusive<T>(
    sessionId: string,
    operation: (ownership: ExclusiveAdmission) => Promise<T>,
  ): Promise<T> {
    if (this.isClosed()) {
      throw Object.assign(new Error('The session service is stopping'), { statusCode: 503 })
    }
    if (this.launchBlocked(sessionId)) {
      throw Object.assign(new Error('The launch is stopping; no new work can start.'), { statusCode: 409, uncertainDelivery: false })
    }
    if (this.exclusiveOwners.has(sessionId) || this.context.getStore()?.get(sessionId)?.active) {
      throw Object.assign(new Error('The session already has an operation in progress'), { statusCode: 409 })
    }
    const owner = {}
    this.exclusiveOwners.set(sessionId, owner)
    const joined = [...(this.pending.get(sessionId) || [])]
    try {
      await this.wait(sessionId)
      if (this.isClosed()) {
        throw Object.assign(new Error('The session service is stopping'), { statusCode: 503 })
      }
      if (this.launchBlocked(sessionId)) {
        throw Object.assign(new Error('The launch is stopping; no new work can start.'), { statusCode: 409, uncertainDelivery: false })
      }
      return await operation({
        joinedActivity: joined.some((admission) => admission.committed),
        isCurrent: () => !this.isClosed() && !this.launchBlocked(sessionId) && this.exclusiveOwners.get(sessionId) === owner,
      })
    } finally {
      if (this.exclusiveOwners.get(sessionId) === owner) this.exclusiveOwners.delete(sessionId)
    }
  }

  async wait(sessionId?: string): Promise<void> {
    // An admitted operation can create its registration/cleanup work before
    // finishing. Drain to quiescence, not just one pre-await snapshot.
    while (true) {
      const pending = sessionId
        ? [...(this.pending.get(sessionId) || [])]
        : [...this.pending.values()].flatMap((entries) => [...entries])
      if (!pending.length) return
      await Promise.all(pending.map((admission) => admission.done))
    }
  }
}
