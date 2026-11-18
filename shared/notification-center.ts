export const notificationKinds = [
  'session.completed',
  'session.failed',
  'session.needs-input',
  'oracle.message',
  'host.alert',
  'computer.offline',
  'schedule.run.succeeded',
  'schedule.run.failed',
  'schedule.run.needs-input',
  'schedule.run.missed',
  'schedule.run.interrupted',
] as const

export type NotificationKind = (typeof notificationKinds)[number] | `schedule.run.${string}`
export type NotificationSeverity = 'info' | 'warning' | 'error'

export interface NotificationRecord {
  id: string
  kind: NotificationKind
  severity: NotificationSeverity
  computerId?: string
  sessionId?: string
  title: string
  body: string
  url: string
  createdAt: string
  readAt?: string
  dismissedAt?: string
  coalesceKey: string
  /** Session mute at admission, not a reason to discard the in-app record. */
  muted: boolean
}

export interface NotificationFilter {
  unread?: boolean
  kind?: NotificationKind
  sessionId?: string
  computerId?: string
  failed?: boolean
}

/** Invalidation only: clients refetch the filtered list they are displaying. */
export interface NotificationsChanged {
  type: 'notifications.changed'
  revision: number
  unreadCount: number
}

/**
 * Reserved for per-kind settings. Delivery still uses the existing push scope,
 * mute/presence checks and native-shell rules; no new channel is enabled here.
 */
export interface NotificationKindPreference {
  push: boolean
  inApp: boolean
  native: boolean
}

export const defaultNotificationKindPreference: Readonly<NotificationKindPreference> =
  Object.freeze({ push: true, inApp: true, native: true })

export type NotificationKindPreferences = Partial<Record<NotificationKind, NotificationKindPreference>>

export interface ScheduleRunNotification {
  type: 'schedule.run.notification'
  notification: NotificationRecord
}
