import { useState } from 'react'
import { Bell, Bot, CalendarClock, CheckCheck, CircleCheck, CircleHelp, CircleX, Monitor, Trash2 } from 'lucide-react'
import type { NotificationRecord } from '../../shared/notification-center'
import { DialogFrame } from '../components/DialogFrame'
import { notificationGroups, type NotificationTab } from './grouping'
import type { useNotifications } from './use-notifications'
import { scheduleNotificationLabel } from './schedule-link'
import './notifications.css'

function kindIcon(record: NotificationRecord) {
  if (record.kind === 'oracle.message') return Bot
  if (record.kind === 'schedule.run.succeeded') return CircleCheck
  if (record.kind === 'schedule.run.failed' || record.kind === 'schedule.run.interrupted') return CircleX
  if (record.kind === 'schedule.run.needs-input') return CircleHelp
  if (record.kind.startsWith('schedule.run.')) return CalendarClock
  if (record.kind === 'session.failed') return CircleX
  if (record.kind === 'session.completed') return CircleCheck
  if (record.kind === 'session.needs-input') return CircleHelp
  if (record.kind === 'computer.offline' || record.kind === 'host.alert') return Monitor
  return Bell
}

export function NotificationPanel({ notifications, enabled, onClose, onOpen }: {
  notifications: ReturnType<typeof useNotifications>
  enabled: boolean
  onClose(): void
  onOpen(record: NotificationRecord): void
}) {
  const [tab, setTab] = useState<NotificationTab>('All')
  const [search, setSearch] = useState('')
  const groups = notificationGroups(notifications.records, tab, search)
  const visible = groups.flatMap((group) => group.records)
  const { mutate, mutating } = notifications
  return <DialogFrame title="Notifications" eyebrow="Hub" onClose={onClose} className="notification-panel">
    {!enabled ? <p className="dialog-message">Notification center is turned off on this hub.</p> : <>
      <div className="notification-tools">
        <label className="notification-search">Search notifications<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="notification-tabs" role="tablist" aria-label="Notification filters">
          {(['All', 'Unread', 'Failed', 'Oracle'] as const).map((name) =>
            <button type="button" role="tab" aria-selected={tab === name} key={name} onClick={() => setTab(name)}>{name}</button>)}
        </div>
        <button type="button" className="secondary-button" disabled={mutating || !visible.some((record) => !record.readAt)}
          onClick={() => {
            const scope = tab === 'Unread' ? '?unread=true' : tab === 'Failed' ? '?failed=true' : tab === 'Oracle' ? '?kind=oracle.message' : ''
            void mutate(visible.filter((record) => !record.readAt).map((record) => record.id), 'read', search.trim() ? undefined : scope)
          }}><CheckCheck size={16} aria-hidden="true" /> Mark all read in {search.trim() ? 'search' : tab}</button>
      </div>
      {notifications.error && <p role="alert" className="error-banner">{notifications.error}</p>}
      {notifications.loading && !notifications.records.length ? <p role="status">Loading notifications…</p> : null}
      {!groups.length && !notifications.loading && <p className="notification-empty">No notifications {tab === 'All' && !search ? 'yet. You’re all caught up.' : 'match this view.'}</p>}
      <ul className="notification-list">
        {groups.map(({ key, latest, records }) => {
          const Icon = kindIcon(latest)
          const unread = records.some((record) => !record.readAt)
          return <li key={key} className="notification-row" data-unread={unread} data-severity={latest.severity}>
            <Icon size={20} aria-hidden="true" />
            <div className="notification-row__body">
              {scheduleNotificationLabel(latest.kind) && <small className="notification-kind">{scheduleNotificationLabel(latest.kind)}</small>}
              <button type="button" className="notification-link" onClick={() => {
                void mutate(records.map((record) => record.id), 'read')
                onOpen(latest)
              }}><strong>{latest.title}</strong></button>
              <p>{latest.body}</p>
              <small>{new Date(latest.createdAt).toLocaleString()} {records.length > 1 ? `· ${records.length} notifications` : ''}</small>
              <div className="notification-row__actions">
                <button type="button" className="secondary-button" disabled={mutating || !unread}
                  onClick={() => void mutate(records.map((record) => record.id), 'read')}>Mark read</button>
                <button type="button" className="icon-button" disabled={mutating} aria-label={`Dismiss ${latest.title}`}
                  onClick={() => void mutate(records.map((record) => record.id), 'dismiss')}><Trash2 size={16} /></button>
              </div>
            </div>
          </li>
        })}
      </ul>
    </>}
  </DialogFrame>
}
