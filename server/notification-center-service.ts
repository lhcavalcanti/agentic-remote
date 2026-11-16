import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import {
  defaultNotificationKindPreference,
  type NotificationKindPreferences,
  type NotificationRecord,
} from '../shared/notification-center.js'
import {
  classifyHubNotification,
  classifyOracleNotification,
} from './notification-classifier.js'
import { NotificationStore } from './notification-store.js'

const DETAIL_READ_CONCURRENCY = 2
const DETAIL_READ_QUEUE_LIMIT = 32
const DETAIL_READ_TIMEOUT_MS = 1000

/** Optional push ingress: absent when the hub feature is off. */
export interface NotificationRecorder {
  hub(event: HubEvent, baseline?: boolean): Promise<void>
  oracle(event: ManagerEvent): Promise<void>
}

export class NotificationCenterService implements NotificationRecorder {
  private work: Promise<unknown> = Promise.resolve()
  private readonly preferences: NotificationKindPreferences = {}
  private readonly admissions = new WeakMap<object, Promise<void>>()
  private readonly oracleReplies = new Map<string, string>()
  private readonly sessions = new Map<string, Promise<void>>()
  private readonly detailReads = new Map<string, Promise<ManagedSession | undefined>>()
  private readonly detailQueue = new Map<string, () => void>()
  private activeDetailReads = 0

  constructor(
    readonly store: NotificationStore,
    private readonly options: {
      mutedSessions: () => readonly string[]
      readSession: (computerId: string, sessionId: string) => Promise<ManagedSession>
      now?: () => number
    },
  ) {}

  hub(event: HubEvent, baseline = false): Promise<void> {
    const snapshot = structuredClone(event)
    const muted = event.type === 'session.upserted' &&
      this.options.mutedSessions().includes(`${event.session.computerId}:${event.session.id}`)
    const ingest = () => this.enqueue(() => this.store.ingest((cursors) =>
      classifyHubNotification(snapshot, cursors, this.now(), baseline)
        .filter((record) => this.inApp(record))
        .map((record) => ({ ...record, muted }))))
    let admitted: Promise<void>
    if (snapshot.type === 'session.upserted') {
      const { computerId, id: sessionId } = snapshot.session
      const key = JSON.stringify([computerId, sessionId])
      // Start bounded enrichment outside the commit/publication queue. Roster
      // summaries never justify fetching a transcript that they did not read.
      const detailRead = !snapshot.summary && !snapshot.session.messages.some((message) => message.role === 'user') &&
        !snapshot.session.pendingPermission && !snapshot.session.pendingUserInput &&
        (!baseline || snapshot.session.status === 'running')
        ? this.detail(computerId, sessionId) : undefined
      const previous = this.sessions.get(key)
      if (!previous && !detailRead) admitted = ingest()
      else {
        admitted = (previous ?? Promise.resolve()).then(async () => {
          const detail = await detailRead
          if (detail && detail.status === snapshot.session.status &&
              (detail.revision !== undefined && snapshot.session.revision !== undefined
                ? detail.revision === snapshot.session.revision
                : detail.updatedAt === snapshot.session.updatedAt)) snapshot.session.messages = detail.messages
          await ingest()
        })
        const settled = admitted.catch(() => undefined)
        this.sessions.set(key, settled)
        void settled.then(() => {
          if (this.sessions.get(key) === settled) this.sessions.delete(key)
        })
      }
    } else admitted = ingest()
    this.admissions.set(event, admitted)
    return admitted
  }

  oracle(event: ManagerEvent): Promise<void> {
    const snapshot = structuredClone(event)
    const admitted = this.enqueue(() => this.store.ingest(() => classifyOracleNotification(snapshot, this.now(), this.oracleReplies)
      .filter((record) => this.inApp(record))))
    this.admissions.set(event, admitted)
    return admitted
  }

  /** The native producer receives the original signal only after admission. */
  admission(event: HubEvent): Promise<void> | undefined {
    return this.admissions.get(event)
  }

  async sessionOpened(computerId: string, sessionId: string): Promise<void> {
    // Queued event classification must settle before the read acknowledgment.
    await this.sessions.get(JSON.stringify([computerId, sessionId]))
    await this.work
    await this.store.readAll({ computerId, sessionId })
  }

  async flush(): Promise<void> {
    await Promise.all(this.sessions.values())
    await this.work
    await this.store.flush()
  }

  private now(): string {
    return new Date((this.options.now ?? Date.now)()).toISOString()
  }

  private inApp(record: NotificationRecord): boolean {
    return (this.preferences[record.kind] ?? defaultNotificationKindPreference).inApp
  }

  private detail(computerId: string, sessionId: string): Promise<ManagedSession | undefined> {
    const key = JSON.stringify([computerId, sessionId])
    const existing = this.detailReads.get(key)
    if (existing) return existing
    if (this.detailQueue.size >= DETAIL_READ_QUEUE_LIMIT) return Promise.resolve(undefined)
    let resolve!: (session: ManagedSession | undefined) => void
    const result = new Promise<ManagedSession | undefined>((done) => { resolve = done })
    let settled = false
    let started = false
    const finish = (session: ManagedSession | undefined) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      resolve(session)
    }
    // Queue time counts toward the deadline too; timed-out queued work is
    // removed rather than starting an obsolete read when a slot opens.
    const timeout = setTimeout(() => {
      finish(undefined)
      if (!started) {
        this.detailQueue.delete(key)
        this.detailReads.delete(key)
      }
    }, DETAIL_READ_TIMEOUT_MS)
    timeout.unref?.()
    this.detailReads.set(key, result)
    this.detailQueue.set(key, () => {
      started = true
      this.activeDetailReads += 1
      void Promise.resolve().then(() => this.options.readSession(computerId, sessionId))
        .then(finish, () => finish(undefined)).finally(() => {
          // A non-abortable read keeps its real slot even after callers time
          // out. Never turn a deadline into overlapping physical requests.
          this.activeDetailReads -= 1
          this.detailReads.delete(key)
          this.drainDetails()
        })
    })
    this.drainDetails()
    return result
  }

  private drainDetails(): void {
    while (this.activeDetailReads < DETAIL_READ_CONCURRENCY && this.detailQueue.size) {
      const [key, start] = this.detailQueue.entries().next().value!
      this.detailQueue.delete(key)
      start()
    }
  }

  private enqueue(work: () => Promise<void>): Promise<void> {
    const task = this.work.then(work)
    this.work = task.catch(() => undefined)
    return task
  }
}
