import type { NotificationRecord } from '../shared/notification-center'
import type { Schedule, ScheduleRun } from '../shared/schedules'
import type { ScheduleProposal } from '../shared/schedule-proposals'
import { FIXTURE_NOW, SELECTED_SESSION_ID } from './workspace-fixtures'

export const fixtureNotifications: NotificationRecord[] = [
  { kind: 'schedule.run.missed', title: 'Daily workspace review · missed', body: 'The fictional workstation was offline at the scheduled time.',
    computerId: 'fixture-studio', severity: 'warning', url: '/?schedule=fixture-daily-review&run=fictional-run-1&computer=fixture-studio' },
  { kind: 'session.completed', title: 'Workspace review complete', body: 'The fictional field guide checks are ready to review.', sessionId: SELECTED_SESSION_ID, computerId: 'fixture-studio', severity: 'info' },
  { kind: 'session.needs-input', title: 'Workspace review needs you', body: 'Choose which section to review next.', sessionId: SELECTED_SESSION_ID, computerId: 'fixture-studio', severity: 'warning' },
  { kind: 'session.failed', title: 'Document check failed', body: 'The fictional build could not find a sample document.', sessionId: 'fixture-documents', computerId: 'fixture-build', severity: 'error' },
  { kind: 'oracle.message', title: 'Oracle has an update', body: 'Your recovery checklist is ready.', severity: 'info' },
].map((record, index) => ({
  ...record, id: (index + 1).toString(16).padStart(64, '0'),
  kind: record.kind as NotificationRecord['kind'], severity: record.severity as NotificationRecord['severity'],
  createdAt: new Date(Date.parse(FIXTURE_NOW) - index * 60_000).toISOString(),
  coalesceKey: `fictional-${index}`, url: ('url' in record ? record.url : undefined) ?? '/', muted: false,
}))

export const fixtureSchedules: Schedule[] = [
  {
    id: 'fixture-daily-review', name: 'Daily workspace review', prompt: 'Review the fictional field guide and summarize outstanding checks.',
    target: { computerId: 'fixture-studio', folder: '/home/demo/field-notes', provider: 'copilot', mode: 'autopilot', permissionPolicy: 'ask', folderTrust: 'ask' },
    workspace: 'checkout', recurrence: { type: 'weekdays', time: '09:00' }, timezone: 'America/Los_Angeles',
    catchUp: 'skip', overlap: 'skip', maxRuntimeMin: 60, notify: 'attention', enabled: true, archived: false,
    createdBy: 'user', revision: 1, createdAt: FIXTURE_NOW, updatedAt: FIXTURE_NOW,
  },
  {
    id: 'fixture-weekly-digest', name: 'Weekly release digest', prompt: 'Summarize the fictional release notes without changing files.',
    target: { computerId: 'fixture-build', folder: '/home/demo/workspace-checks', provider: 'claude', mode: 'plan', permissionPolicy: 'ask', folderTrust: 'ask' },
    workspace: 'worktree', recurrence: { type: 'weekly', time: '17:00', days: [5] }, timezone: 'America/Los_Angeles',
    catchUp: 'once', overlap: 'queue', maxRuntimeMin: 30, notify: 'always', enabled: false, archived: false,
    createdBy: 'oracle', revision: 2, createdAt: FIXTURE_NOW, updatedAt: FIXTURE_NOW,
  },
]
export const fixtureScheduleRuns: ScheduleRun[] = (['succeeded', 'missed', 'interrupted', 'launching', 'stopping'] as const).map((status, index) => {
  const at = new Date(Date.parse(FIXTURE_NOW) - (5 - index) * 3_600_000).toISOString()
  return {
    id: `fictional-run-${index}`, scheduleId: 'fixture-daily-review', occurrenceAt: at, trigger: 'schedule',
    status, computerId: 'fixture-studio', launchId: `fictional-launch-${index}`,
    ...(status !== 'missed' ? { startedAt: at } : {}),
    ...(['succeeded', 'interrupted'].includes(status) ? { endedAt: new Date(Date.parse(at) + 60_000).toISOString() } : {}),
    ...(status === 'succeeded' ? { sessionId: SELECTED_SESSION_ID, summary: 'Fictional checks completed.' } : {}),
  }
})

export const fixtureScheduleProposals: ScheduleProposal[] = [{
  id: 'fictional-morning-review', operation: 'create', createdBy: 'oracle', status: 'pending',
  createdAt: FIXTURE_NOW, expiresAt: new Date(Date.parse(FIXTURE_NOW) + 86_400_000).toISOString(),
  payload: {
    name: 'Morning workspace review', prompt: 'Review the fictional guide and summarize outstanding checks.',
    target: { computerId: 'fixture-studio', folder: '/fictional/workspace', provider: 'copilot', mode: 'autopilot', permissionPolicy: 'ask', folderTrust: 'ask' },
    recurrence: { type: 'weekdays', time: '09:00' }, timezone: 'America/Los_Angeles', workspace: 'checkout',
    catchUp: 'skip', overlap: 'skip', maxRuntimeMin: 60, notify: 'attention', enabled: true,
  },
}]
