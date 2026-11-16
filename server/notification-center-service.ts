import type { ComputerSummary, HubEvent, ManagedSession } from '../shared/contracts.js'
import type { HostSnapshot } from '../shared/host-telemetry.js'
import type { ManagerEvent } from '../shared/manager.js'
import {
  defaultNotificationKindPreference,
  type NotificationKindPreferences,
  type NotificationRecord,
} from '../shared/notification-center.js'
import {
  classifyHubNotification,
  classifyHostNotification,
  classifyOracleNotification,
  type NotificationCursors,
} from './notification-classifier.js'
import { NotificationStore } from './notification-store.js'

/** Optional push ingress: absent when the hub feature is off. */
export interface NotificationRecorder {
  hub(event: HubEvent, baseline?: boolean): Promise<void>
  oracle(event: ManagerEvent): Promise<void>
}

export class NotificationCenterService implements NotificationRecorder {
  private work: Promise<unknown> = Promise.resolve()
  private readonly preferences: NotificationKindPreferences = {}
  private readonly admissions = new WeakMap<object, Promise<void>>()
  private readonly hostArrivals = new Map<string, { sample: string; at: number }>()
  private hostObservations: NotificationCursors = {}
  private readonly oracleReplies = new Map<string, string>()

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
    const admitted = this.enqueue(async () => {
      if (snapshot.type === 'session.upserted' && !snapshot.session.messages.some((message) => message.role === 'user') &&
          !snapshot.session.pendingPermission && !snapshot.session.pendingUserInput &&
          (!baseline || snapshot.session.status === 'running')) {
        // Roster snapshots contain no transcript. Read passively; never open,
        // resume, or activate a session merely to identify its root prompt.
        const detail = await this.options.readSession(snapshot.session.computerId, snapshot.session.id).catch(() => undefined)
        if (detail && detail.status === snapshot.session.status &&
            (detail.revision !== undefined && snapshot.session.revision !== undefined
              ? detail.revision === snapshot.session.revision
              : detail.updatedAt === snapshot.session.updatedAt)) snapshot.session.messages = detail.messages
      }
      const now = this.now()
      await this.store.ingest((cursors) => classifyHubNotification(snapshot, cursors, now, baseline)
        .filter((record) => this.inApp(record))
        .map((record) => ({ ...record, muted })))
    })
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

  host(computer: ComputerSummary, snapshot: HostSnapshot | undefined): Promise<void> {
    const receivedAt = this.now()
    const observation = structuredClone({ computer, snapshot })
    if (!computer.isLocal && observation.snapshot?.latest && observation.snapshot.sampleAgeMs === undefined) {
      const sample = observation.snapshot.latest.at
      const at = Date.parse(receivedAt)
      const previous = this.hostArrivals.get(computer.id)
      const arrival = previous?.sample === sample ? previous : { sample, at }
      this.hostArrivals.set(computer.id, arrival)
      observation.snapshot.sampleAgeMs = Math.max(0, at - arrival.at)
    }
    return this.enqueue(async () => {
      // Episode state must not outrun a failed durable alert admission.
      const observations = structuredClone(this.hostObservations)
      await this.store.ingest((cursors) =>
        classifyHostNotification(observation.computer, observation.snapshot, cursors, this.now(), observations, receivedAt)
          .filter((record) => this.inApp(record)))
      this.hostObservations = observations
    })
  }

  /** The native producer receives the original signal only after admission. */
  admission(event: HubEvent): Promise<void> | undefined {
    return this.admissions.get(event)
  }

  async sessionOpened(computerId: string, sessionId: string): Promise<void> {
    // Queued event classification must settle before the read acknowledgment.
    await this.work
    await this.store.readAll({ computerId, sessionId })
  }

  async flush(): Promise<void> {
    await this.work
    await this.store.flush()
  }

  private now(): string {
    return new Date((this.options.now ?? Date.now)()).toISOString()
  }

  private inApp(record: NotificationRecord): boolean {
    return (this.preferences[record.kind] ?? defaultNotificationKindPreference).inApp
  }

  private enqueue(work: () => Promise<void>): Promise<void> {
    const task = this.work.then(work)
    this.work = task.catch(() => undefined)
    return task
  }
}
