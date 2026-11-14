import type { Schedule, ScheduleRecurrence, ScheduleRun } from '../../shared/schedules'

export function recurrenceSummary(recurrence: ScheduleRecurrence): string {
  switch (recurrence.type) {
    case 'once': return 'Once'
    case 'hourly': return `Every ${recurrence.everyHours} h · ${recurrence.windowStart ?? '00:00'}–${recurrence.windowEnd ?? '24:00'}`
    case 'daily': return `Daily at ${recurrence.time}`
    case 'weekdays': return `Weekdays at ${recurrence.time}`
    case 'weekly': return `${recurrence.days.map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ')} at ${recurrence.time}`
    case 'cron': return `Cron · ${recurrence.expression}`
  }
}

export function scheduleTime(instant: Date | string, timezone: string): string {
  return new Intl.DateTimeFormat(undefined, { timeZone: timezone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(instant))
}

export function runDuration(run: ScheduleRun, now: Date): string {
  if (!run.startedAt) return 'Not started'
  const seconds = Math.max(0, Math.floor(((run.endedAt ? Date.parse(run.endedAt) : now.getTime()) - Date.parse(run.startedAt)) / 1000))
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

export function editableSchedule(schedule: Schedule) {
  const { id: _id, revision: _revision, createdAt: _createdAt, updatedAt: _updatedAt, createdBy: _createdBy, archived: _archived, ...definition } = schedule
  return definition
}

export function scheduleError(caught: unknown): string {
  if (caught && typeof caught === 'object' && 'statusCode' in caught && caught.statusCode === 409) {
    return 'Conflict: this schedule changed on the hub or the action is no longer valid. Your draft is preserved. Reload the latest version before retrying.'
  }
  return caught instanceof Error ? caught.message : 'Scheduler is unavailable'
}
