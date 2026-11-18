import type { NotificationScope } from '../../shared/notifications'
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
