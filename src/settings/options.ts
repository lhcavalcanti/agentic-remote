import type { NotificationScope } from '../../shared/notifications'
import type { CollapsedCategoryShows } from '../../shared/session-categories'
import type { AppearanceSetting } from '../../shared/settings-profile'

export const accentThemes = [
  { id: 'agentic', name: 'Agentic', color: '#b8f36b' },
  { id: 'ocean', name: 'Ocean', color: '#6eb7ff' },
  { id: 'violet', name: 'Violet', color: '#ad92ff' },
  { id: 'ember', name: 'Ember', color: '#ff9c64' },
  { id: 'rose', name: 'Rose', color: '#ff83b6' },
  { id: 'teal', name: 'Teal', color: '#63d6c0' },
] as const

export const notificationScopeOptions: Array<{ id: NotificationScope; name: string; description: string }> = [
  {
    id: 'all',
    name: 'All activity',
    description: 'Sessions that need you or finish, hub alerts, and Oracle.',
  },
  {
    id: 'oracle',
    name: 'Oracle only',
    description: 'Oracle’s replies and its requests for your OK. Sessions stay quiet, including ones Oracle started.',
  },
  {
    id: 'off',
    name: 'Disabled',
    description: 'Nothing, on any device. Each device stays set up, so turning them back on is instant.',
  },
]

export const appearanceOptions: Array<{ id: AppearanceSetting; name: string }> = [
  { id: 'system', name: 'System' },
  { id: 'graphite', name: 'Graphite' },
  { id: 'light', name: 'Light' },
]

export const collapsedCategoryOptions: Array<{ id: CollapsedCategoryShows; name: string; description: string }> = [
  {
    id: 'attention-unread',
    name: 'Sessions that need you or are unread',
    description: 'Up to three, those that need you first, and the open session.',
  },
  {
    id: 'attention',
    name: 'Only sessions that need you',
    description: 'Up to three, and the open session. Unread ones collapse with the rest.',
  },
  {
    id: 'none',
    name: 'Counts only',
    description: 'Nothing below the header, not even the open session. The header is marked while it is inside.',
  },
]
