import { EventEmitter } from 'node:events'
import type { ScheduleRunNotification } from '../shared/notification-center.js'
import type { Schedule, ScheduleRun, SchedulerChanged } from '../shared/schedules.js'
import { classifyScheduleNotification } from './notification-classifier.js'
import type { SchedulerStore } from './scheduler-store.js'

/** One canonical outcome feeds all channels; fences also exist without the notification-center flag. */
export class ScheduleNotificationService extends EventEmitter<{ event: [event: ScheduleRunNotification] }> {
  private work: Promise<unknown> = Promise.resolve()
  private readonly changed = (event: SchedulerChanged) => {
    if (event.runId) this.enqueue(this.store.scheduleForRun(event.runId), this.store.getRun(event.runId))
  }
  constructor(
    private readonly store: SchedulerStore,
    private readonly options: {
      admit?: (event: ScheduleRunNotification) => Promise<void>
      mutedSessions: () => readonly string[]
      now?: () => number
      warn?: (error: unknown) => void
    },
  ) {
    super()
    store.on('changed', this.changed)
  }
  async start(): Promise<void> {
    for (const run of this.store.allRuns()) this.enqueue(this.store.scheduleForRun(run.id), run)
    await this.flush()
  }
  async stop(): Promise<void> {
    this.store.off('changed', this.changed)
    await this.flush()
  }
  async flush(): Promise<void> { await this.work }
  private enqueue(schedule: Schedule, run: ScheduleRun): void {
    const now = new Date((this.options.now ?? Date.now)()).toISOString()
    const records = classifyScheduleNotification(schedule, run, now)
    for (const notification of records) {
      notification.muted = Boolean(notification.sessionId &&
        this.options.mutedSessions().includes(`${notification.computerId}:${notification.sessionId}`))
      const event: ScheduleRunNotification = { type: 'schedule.run.notification', notification }
      this.work = this.work.then(async () => {
        // Admission precedes every external channel, even a replay of a read/dismissed row.
        await this.options.admit?.(event)
        if (await this.store.claimNotification(notification.id)) this.emit('event', event)
      }).catch((error: unknown) => this.options.warn?.(error))
    }
  }
}
