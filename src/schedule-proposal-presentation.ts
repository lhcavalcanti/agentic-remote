import { nextOccurrences } from '../shared/schedule-recurrence'
import type { ScheduleProposal } from '../shared/schedule-proposals'
import type { Schedule, ScheduleRecurrence } from '../shared/schedules'

export type ProposalSchedule = Omit<Schedule, 'id' | 'revision' | 'createdBy' | 'createdAt' | 'updatedAt' | 'archived'>
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const labels: Record<string, string> = {
  name: 'Name', prompt: 'Prompt', target: 'Target', computerId: 'Computer', folder: 'Folder',
  provider: 'Provider', model: 'Model', effort: 'Effort', context: 'Context', mode: 'Mode',
  permissionPolicy: 'Permissions', folderTrust: 'Folder trust', workspace: 'Workspace',
  recurrence: 'Recurrence', timezone: 'Timezone', catchUp: 'Catch-up', overlap: 'Overlap',
  maxRuntimeMin: 'Runtime limit (minutes)', notify: 'Notifications', enabled: 'Enabled',
}
function wallTime(value: string): string {
  if (value === '24:00') return 'midnight'
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' })
    .format(new Date(`2000-01-01T${value}:00Z`))
}
function zoneName(timezone: string, now: Date): string {
  if (timezone === 'UTC') return 'UTC'
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortGeneric' })
    .formatToParts(now).find((part) => part.type === 'timeZoneName')?.value ?? timezone
}
export function recurrenceLabel(recurrence: ScheduleRecurrence, timezone = 'UTC'): string {
  switch (recurrence.type) {
    case 'once': return `Once at ${new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    }).format(new Date(recurrence.at))}`
    case 'daily': return `Daily at ${wallTime(recurrence.time)}`
    case 'weekdays': return `Weekdays at ${wallTime(recurrence.time)}`
    case 'weekly': return `${[...recurrence.days].sort((a, b) => a - b).map((day) => days[day]).join(', ')} at ${wallTime(recurrence.time)}`
    case 'hourly': {
      const interval = recurrence.everyHours === 1 ? 'hour'
        : Number.isInteger(recurrence.everyHours) ? `${recurrence.everyHours} hours` : `${recurrence.everyHours * 60} minutes`
      const window = recurrence.windowStart || recurrence.windowEnd
        ? `, ${wallTime(recurrence.windowStart ?? '00:00')}–${wallTime(recurrence.windowEnd ?? '24:00')}` : ''
      return `Every ${interval}${window}`
    }
    case 'cron': return `Custom cron ${recurrence.expression} (minute hour day month weekday)`
  }
}
export function proposalSchedule(proposal: ScheduleProposal, base?: Schedule): ProposalSchedule | undefined {
  if (proposal.operation === 'create') return proposal.payload
  if (!base || base.id !== proposal.scheduleId || base.revision !== proposal.baseRevision) return
  return {
    ...base,
    ...(proposal.operation === 'update' ? proposal.payload : {}),
    ...(['enable', 'disable', 'archive'].includes(proposal.operation) ? { enabled: proposal.operation === 'enable' } : {}),
  }
}
export function proposalTiming(schedule: ProposalSchedule, operation: ScheduleProposal['operation'], now: Date): string {
  const recurrence = `${recurrenceLabel(schedule.recurrence, schedule.timezone)} ${zoneName(schedule.timezone, now)}`
  if (operation === 'run-now') return `Once after approval ${zoneName(schedule.timezone, now)} · next now`
  if (operation === 'archive') return `${recurrence} · no automatic run after archiving`
  if (!schedule.enabled) return `${recurrence} · paused; no automatic run`
  const next = nextOccurrences(schedule.recurrence, schedule.timezone, now, 1)[0]
  if (!next) return `${recurrence} · no future occurrence`
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: schedule.timezone, weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(next)
  return `${recurrence} · next ${formatted}`
}
export function proposalUnavailableReason(proposal: ScheduleProposal, base: Schedule | undefined, now: number): string | undefined {
  if (Date.parse(proposal.expiresAt) <= now) return 'This proposal expired. Request a fresh proposal.'
  const schedule = proposalSchedule(proposal, base)
  if (schedule?.recurrence.type === 'once' && ['create', 'update', 'enable'].includes(proposal.operation) &&
      Date.parse(schedule.recurrence.at) <= now) return 'The one-off time has passed. Request a fresh proposal with a future time.'
}
export function proposalConsequence(operation: ScheduleProposal['operation'], schedule: ProposalSchedule): string | undefined {
  switch (operation) {
    case 'run-now': return `Runs once now on ${schedule.target.computerId}.`
    case 'enable': return `Enables automatic runs on ${schedule.target.computerId}; accepted runs are unchanged.`
    case 'disable': return 'Pauses future automatic runs; accepted runs continue.'
    case 'archive': return 'Archives and disables automatic runs; unlaunched runs stop, running sessions continue.'
    default: return
  }
}
function valueLabel(key: string, value: unknown, timezone: string): string {
  if (value === undefined) return 'Default'
  if (key === 'permissionPolicy') return value === 'allow-all' ? 'Allow all' : 'Ask'
  if (key === 'folderTrust') return value === 'auto-approve' ? 'Auto-approve' : 'Ask'
  if (key === 'recurrence') return recurrenceLabel(value as ScheduleRecurrence, timezone)
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > 160 ? `${text.slice(0, 157)}… (${text.length} characters)` : text
}
export function proposalChanges(proposal: ScheduleProposal, base: Schedule): Array<{ field: string; before: string; after: string }> {
  if (proposal.operation !== 'update') return []
  const changes: Array<{ field: string; before: string; after: string }> = []
  const add = (key: string, before: unknown, after: unknown) => {
    if (JSON.stringify(before) !== JSON.stringify(after)) changes.push({
      field: labels[key] ?? key, before: valueLabel(key, before, base.timezone),
      after: valueLabel(key, after, proposal.payload.timezone ?? base.timezone),
    })
  }
  for (const [key, value] of Object.entries(proposal.payload)) {
    if (key === 'target') {
      const target = value as Schedule['target']
      for (const targetKey of new Set([...Object.keys(base.target), ...Object.keys(target)])) {
        const key = targetKey as keyof Schedule['target']
        add(key, base.target[key], target[key])
      }
    } else add(key, base[key as keyof Schedule], value)
  }
  return changes
}
