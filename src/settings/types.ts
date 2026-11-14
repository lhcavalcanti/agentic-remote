import type { ComputerSummary } from '../../shared/contracts'
import type { NotificationScope } from '../../shared/notifications'
import type { AppearanceSetting, NewSessionBackendSetting, OracleResponseStyle } from '../../shared/settings-profile'
import type { ShortcutBinding, ShortcutDefinition, ShortcutId } from '../app-shortcuts'
import type { SettingsProfileState } from '../settings-profile'
import type { DefaultRuntimeSettings, DefaultSessionFolders } from '../session-setup/types'
import type { accentThemes } from './options'

export type StatuslineSettings = {
  enabled: boolean
  computer: boolean
  provider: boolean
  path: boolean
  status: boolean
  queue: boolean
  backgroundTasks: boolean
  sessionId: boolean
  model: boolean
  effort: boolean
  contextTier: boolean
  contextUsage: boolean
  mode: boolean
  permissions: boolean
  update: boolean
}

export type AccentTheme = (typeof accentThemes)[number]['id']

export type AppSettingsDialogProps = {
  onDisplayNameChange?: (name: string) => void
  open: boolean
  computers: ComputerSummary[]
  onClose: () => void
  onApplyUpdate: () => void
  onUpdateReady: (registration: ServiceWorkerRegistration) => void
  defaultRuntimes: DefaultRuntimeSettings
  onDefaultRuntimesChange: (settings: DefaultRuntimeSettings) => void
  defaultSessionFolders: DefaultSessionFolders
  onDefaultSessionFoldersChange: (settings: DefaultSessionFolders) => void
  newSessionBackend: NewSessionBackendSetting
  onNewSessionBackendChange: (backend: NewSessionBackendSetting) => void
  accentTheme: AccentTheme
  onAccentThemeChange: (theme: AccentTheme) => void
  appearance: AppearanceSetting
  onAppearanceChange: (appearance: AppearanceSetting) => void
  settingsSync: SettingsProfileState
  oracleResponseStyle: OracleResponseStyle
  onOracleResponseStyleChange: (style: OracleResponseStyle) => void
  notificationScope: NotificationScope
  onNotificationScopeChange: (scope: NotificationScope) => void
  schedulerAllowAllForOracle?: boolean
  onSchedulerAllowAllForOracleChange?: (allowed: boolean) => void
  statusline: StatuslineSettings
  onStatuslineChange: (settings: StatuslineSettings) => void
  shortcuts: ShortcutDefinition[]
  shortcutOverrides: Partial<Record<ShortcutId, ShortcutBinding>>
  onShortcutsChange: (
    overrides: Partial<Record<ShortcutId, ShortcutBinding>>,
  ) => void
  updateRegistration?: ServiceWorkerRegistration
  updatingApp: boolean
  /** The element to open at, such as Oracle's model; the top when unset. */
  initialSection?: string
}
