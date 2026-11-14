import type { NotificationRecord } from '../shared/notification-center'
import { FIXTURE_NOW, SELECTED_SESSION_ID } from './workspace-fixtures'

export const fixtureNotifications: NotificationRecord[] = [
  { kind: 'session.completed', title: 'Workspace review complete', body: 'The fictional field guide checks are ready to review.', sessionId: SELECTED_SESSION_ID, computerId: 'fixture-studio', severity: 'info' },
  { kind: 'session.needs-input', title: 'Workspace review needs you', body: 'Choose which section to review next.', sessionId: SELECTED_SESSION_ID, computerId: 'fixture-studio', severity: 'warning' },
  { kind: 'session.failed', title: 'Document check failed', body: 'The fictional build could not find a sample document.', sessionId: 'fixture-documents', computerId: 'fixture-build', severity: 'error' },
  { kind: 'oracle.message', title: 'Oracle has an update', body: 'Your recovery checklist is ready.', severity: 'info' },
].map((record, index) => ({
  ...record, id: (index + 1).toString(16).padStart(64, '0'),
  kind: record.kind as NotificationRecord['kind'], severity: record.severity as NotificationRecord['severity'],
  createdAt: new Date(Date.parse(FIXTURE_NOW) - index * 60_000).toISOString(),
  coalesceKey: `fictional-${index}`, url: '/', muted: false,
}))
