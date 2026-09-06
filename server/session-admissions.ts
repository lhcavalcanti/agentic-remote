import type { SessionDetail } from '../shared/contracts.js'

export interface PendingQueueAdmission {
  assistantId: string
  started: boolean
  completion?: Promise<SessionDetail>
}

export class SessionAdmissions {
  private readonly pending = new Map<string, Set<Promise<void>>>()

  constructor(private readonly isClosed: () => boolean) {}

  async run<T>(sessionId: string, operation: () => Promise<T>): Promise<T> {
    if (this.isClosed()) {
      throw Object.assign(new Error('The session service is stopping'), { statusCode: 503 })
    }
    let finish = () => {}
    const pending = new Promise<void>((resolve) => { finish = resolve })
    const entries = this.pending.get(sessionId) || new Set<Promise<void>>()
    entries.add(pending)
    this.pending.set(sessionId, entries)
    try {
      return await operation()
    } finally {
      entries.delete(pending)
      if (!entries.size) this.pending.delete(sessionId)
      finish()
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
      await Promise.all(pending)
    }
  }
}
