import { EventEmitter } from 'node:events'
import type { ScheduleRunNotification } from '../shared/notification-center.js'
import type { Schedule, ScheduleRun, SchedulerChanged } from '../shared/schedules.js'
import { classifyScheduleNotification } from './notification-classifier.js'
import type { SchedulerStore } from './scheduler-store.js'

/** One canonical outcome feeds all channels; fences also exist without the notification-center flag. */
export class ScheduleNotificationService extends EventEmitter<{ event: [event: ScheduleRunNotification] }> {
  private work: Promise<unknown> = Promise.resolve()
  private readonly changed = (event: SchedulerChanged) => {
    const ids = new Set([...(event.runIds ?? []), ...(event.runId ? [event.runId] : [])])
    if (!ids.size) return
    const muted = new Set(this.options.mutedSessions())
    const notifications = [...ids].flatMap((id) =>
      this.notifications(this.store.scheduleForRun(id), this.store.getRun(id), muted))
    if (notifications.length) this.queue(() => this.deliver(notifications))
  }
  constructor(
    private readonly store: SchedulerStore,
    private readonly options: {
      admit?: (event: ScheduleRunNotification) => Promise<void>
      admitBatch?: (events: ScheduleRunNotification[]) => Promise<void>
      mutedSessions: () => readonly string[]
      now?: () => number
      warn?: (error: unknown) => void
    },
  ) {
    super()
    store.on('changed', this.changed)
  }
  async start(): Promise<void> {
    this.queue(async () => {
      const replay = this.store.notificationReplay()
      const muted = new Set(this.options.mutedSessions())
      const events = replay.runs.flatMap(({ schedule, run }) => this.notifications(schedule, run, muted))
        .filter((event) => !replay.claimed.has(event.notification.id))
      await this.deliver(events)
    })
    await this.flush()
  }
  async stop(): Promise<void> {
    this.store.off('changed', this.changed)
    await this.flush()
  }
  async flush(): Promise<void> { await this.work }
  private notifications(schedule: Schedule, run: ScheduleRun, muted?: ReadonlySet<string>): ScheduleRunNotification[] {
    const now = new Date((this.options.now ?? Date.now)()).toISOString()
    return classifyScheduleNotification(schedule, run, now).map((notification) => {
      const key = `${notification.computerId}:${notification.sessionId}`
      notification.muted = Boolean(notification.sessionId &&
        (muted ? muted.has(key) : this.options.mutedSessions().includes(key)))
      return { type: 'schedule.run.notification', notification }
    })
  }
  private async deliver(events: ScheduleRunNotification[]): Promise<void> {
    if (!events.length) return
    if (this.options.admitBatch) await this.options.admitBatch(events)
    else for (const event of events) await this.options.admit?.(event)
    // Both durable admission and the complete claim batch precede external delivery.
    const claimed = new Set(await this.store.claimNotifications(events.map((event) => event.notification.id)))
    for (const event of events) {
      if (claimed.delete(event.notification.id)) this.emit('event', event)
    }
  }
  private queue(work: () => Promise<void>): void {
    this.work = this.work.then(work).catch((error: unknown) => this.options.warn?.(error))
  }
}
