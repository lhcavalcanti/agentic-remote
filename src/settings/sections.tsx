import type { CSSProperties, ReactNode } from 'react'
import { Bell, BookOpen, Bot, Clock, Folder, MessageSquare, MonitorCog, Settings, SlidersHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AgentProvider, RuntimeModelOption } from '../../shared/contracts'
import type { NewSessionBackendSetting, OracleResponseStyle } from '../../shared/settings-profile'
import { previewFeatureCatalogue, previewFeatureNames } from '../../shared/feature-flags'
import type { SettingsProfileState } from '../settings-profile'
import type { useOracleSettings } from '../use-oracle-settings'
import { DreamerSettings } from '../OracleDreamer'
import { OracleModelSettings, OracleSettingsStatus } from '../OracleSettings'
import { PreviewFeaturesSettings } from '../PreviewFeaturesSettings'
import { SchedulerPermissionSettings } from './SchedulerPermissionSettings'
import { openShellSettings, shellSettingsAvailable } from '../shell'
import { DefaultRuntimeControls, DefaultSessionFolderControl, SettingScope, ShortcutEditor } from './controls'
import { accentThemes, appearanceOptions, notificationScopeOptions } from './options'
import { StatuslineControls, statuslineOptions } from './StatuslineControls'
import type { AppSettingsDialogProps } from './types'
import { DisplayNameSetting } from '../rail/DisplayNameSetting'
import { ComputersBody } from '../computers/ComputersDialog'
import { HealthCard } from './HealthCard'
import { SkillsSettings } from './SkillsSettings'
import { providerName } from '../session-presentation'

export type SettingsSectionProps = AppSettingsDialogProps & {
  categoryNavigation?: boolean
  healthCardEnabled?: boolean
  oracle: ReturnType<typeof useOracleSettings>
  runtimeErrors: Partial<Record<AgentProvider, string>>
  runtimeLoading: boolean
  runtimeModels: Partial<Record<AgentProvider, RuntimeModelOption[]>>
  hubCopilotModels?: RuntimeModelOption[]
  hubCopilotError?: string
  retryHubCopilotModels: () => Promise<void>
  supported: boolean
  requiresInstall: boolean
  permissionBlocked: boolean
  enabled: boolean
  loading: boolean
  submitting: boolean
  toggle: () => Promise<void>
  testingNotification: boolean
  testNotification: () => Promise<void>
  testMessage?: string
  error?: string
  checkingUpdate: boolean
  checkForUpdate: () => Promise<void>
  updateMessage?: string
}

export type SettingsSection = {
  id: string
  title: string
  icon: LucideIcon
  scope: 'hub' | 'device'
  searchLabels?: readonly string[] | ((props: SettingsSectionProps) => readonly string[])
  render: (props: SettingsSectionProps) => ReactNode
}

export function settingsSectionLabels(section: SettingsSection, props: SettingsSectionProps): readonly string[] {
  return [section.title, ...(typeof section.searchLabels === 'function' ? section.searchLabels(props) : section.searchLabels ?? [])]
}

function settingsSyncMessage(state: SettingsProfileState): string {
  switch (state.status) {
    case 'loading':
      return 'Loading your settings from the hub…'
    case 'saving':
      return 'Saving to the hub…'
    case 'offline':
      return state.deviceCopy
        ? 'The hub can’t be reached. Changes are kept on this device and sync when it’s back.'
        : 'The hub can’t be reached, and this browser can’t keep a copy. Changes made now last until this page closes.'
    default:
      return state.deviceCopy
        ? 'Saved on this hub.'
        : 'Saved on this hub. This browser can’t keep a copy, so settings load from the hub each time.'
  }
}

export const settingsSections: readonly SettingsSection[] = [
  {
    id: 'settings-models',
    title: 'Models',
    icon: Bot,
    scope: 'hub',
    searchLabels: [
      'New sessions', 'Model', 'Reasoning effort', 'Context size', 'Agent mode', 'Start new sessions in', 'How new sessions start',
      ...(['copilot', 'claude'] as const).flatMap((provider) =>
        ['model', 'reasoning effort', 'context size', 'agent mode'].map((field) => `${providerName(provider)} default ${field}`)),
    ],
    render: ({
      runtimeErrors,
      runtimeLoading,
      runtimeModels,
      onDefaultRuntimesChange,
      defaultRuntimes,
      onNewSessionBackendChange,
      newSessionBackend,
    }) => (
      <>
        <div className="app-settings-group__body">
          <section className="app-settings-section">
            <div className="app-settings-section__title">
              <h4>New sessions</h4>
              <SettingScope synced />
            </div>
            <p className="dialog-message">
              New sessions, including those Oracle starts, use these provider
              settings. Oracle keeps the context size for a model you name when
              that model offers it. Existing sessions keep their current model,
              effort, context, and agent mode.
            </p>
            {(['copilot', 'claude'] as const).map((provider) => (
              <DefaultRuntimeControls
                error={runtimeErrors[provider]}
                key={provider}
                loading={runtimeLoading}
                models={runtimeModels[provider] || []}
                onChange={(selection) =>
                  onDefaultRuntimesChange({
                    ...defaultRuntimes,
                    [provider]: selection,
                  })
                }
                provider={provider}
                selection={defaultRuntimes[provider]}
              />
            ))}
            <label className="field">
              <span>Start new sessions in</span>
              <select
                aria-label="How new sessions start"
                className="dialog-select"
                onChange={(event) =>
                  onNewSessionBackendChange(event.target.value as NewSessionBackendSetting)}
                value={newSessionBackend}
              >
                <option value="terminal">Terminal (tmux)</option>
                <option value="sdk">Copilot SDK</option>
              </select>
            </label>
            <p className="dialog-message">
              New Session starts here, and you can still change it for one
              session. Oracle has its own setting.
            </p>
          </section>
        </div>
      </>
    ),
  },
  {
    id: 'settings-folders',
    title: 'Folders',
    icon: Folder,
    scope: 'hub',
    searchLabels: ({ computers }) => [
      'New sessions', 'Oracle', "Oracle's session folder",
      ...computers.flatMap((computer) => [
        `Session folders on ${computer.name}`,
        ...['default session folder', "Oracle's session folder"].flatMap((label) =>
          [`Browse ${label} for ${computer.name}`, `Remove ${label} for ${computer.name}`]),
      ]),
    ],
    render: ({ computers, defaultSessionFolders, onDefaultSessionFoldersChange, oracle }) => (
      <>
        <p className="dialog-message">
          Where new sessions start on each computer, and where Oracle starts
          the sessions it hands work to. Existing sessions keep their folders.
          A blank folder is the computer&apos;s home directory, and a blank
          Oracle folder follows yours. Oracle can change its own when you ask.
        </p>
        <div className="app-settings-group__body app-settings-group__body--folders">
          {computers.map((computer) => (
            <div
              aria-label={`Session folders on ${computer.name}`}
              className="settings-computer-folders"
              key={computer.id}
              role="group"
            >
              <strong className="settings-computer-folders__name">{computer.name}</strong>
              <DefaultSessionFolderControl
                computer={computer}
                offlineNote={false}
                onChange={(path) => {
                  const next = { ...defaultSessionFolders }
                  if (path) {
                    next[computer.id] = path
                  } else {
                    delete next[computer.id]
                  }
                  onDefaultSessionFoldersChange(next)
                }}
                title="New sessions"
                value={defaultSessionFolders[computer.id]}
              />
              {oracle.settings && !oracle.unavailable ? (
                <DefaultSessionFolderControl
                  blankLabel="Same as new sessions"
                  computer={computer}
                  label="Oracle's session folder"
                  offlineNote={false}
                  onChange={(path) => void oracle.saveFolder(computer.id, path)}
                  purpose="Oracle"
                  selectHint="where Oracle starts new sessions"
                  title="Oracle"
                  value={oracle.settings.sessionFolders?.[computer.id]}
                />
              ) : null}
              {!computer.online ? (
                <small className="default-session-folder__offline">
                  Connect to browse this computer.
                </small>
              ) : null}
            </div>
          ))}
        </div>
        <OracleSettingsStatus oracle={oracle} part="folders" />
      </>
    ),
  },
  {
    id: 'settings-oracle',
    title: 'Oracle',
    icon: MessageSquare,
    scope: 'hub',
    searchLabels: [
      'Model', 'Oracle settings', 'Oracle model', 'Reasoning effort', 'Oracle reasoning effort',
      'Response style', 'Oracle response style', 'Notify me about', 'What notifies you', 'Memory', 'Voice',
      'Dreamer', 'Dreamer settings', 'Enable Dreamer', 'Dreamer timezone', 'Opens new sessions with',
      'How Oracle opens sessions', "Closing Oracle's sessions",
      ...notificationScopeOptions.map((option) => option.name),
    ],
    render: ({
      hubCopilotModels,
      hubCopilotError,
      retryHubCopilotModels,
      oracle,
      open,
      onOracleResponseStyleChange,
      oracleResponseStyle,
      notificationScope,
      onNotificationScopeChange,
    }) => (
      <>
        <div className="app-settings-group__body">
          <OracleModelSettings
            models={hubCopilotModels}
            modelsError={hubCopilotError}
            onRetryModels={retryHubCopilotModels}
            oracle={oracle}
          />
          <DreamerSettings active={open} />
          {oracle.settings && !oracle.unavailable ? (
            <section className="app-settings-section" id="settings-oracle-style">
              <div className="app-settings-section__title">
                <h4>Response style</h4>
                <SettingScope synced />
              </div>
              <p className="dialog-message">
                How much Oracle writes. Every style keeps errors, uncertainty,
                what Oracle did, and anything waiting for you.
              </p>
              <label className="field">
                <span>Response style</span>
                <select
                  aria-label="Oracle response style"
                  className="dialog-select"
                  onChange={(event) =>
                    onOracleResponseStyleChange(event.target.value as OracleResponseStyle)}
                  value={oracleResponseStyle}
                >
                  <option value="concise">Concise</option>
                  <option value="balanced">Balanced</option>
                  <option value="detailed">Detailed</option>
                </select>
              </label>
            </section>
          ) : null}
          <section className="app-settings-section">
            <div className="app-settings-section__title">
              <h4>Notify me about</h4>
              <SettingScope synced />
            </div>
            <fieldset className="notification-scope-options">
              <legend>What notifies you</legend>
              {notificationScopeOptions.map((option) => (
                <label className="notification-scope-option" key={option.id}>
                  <input
                    aria-describedby={`notification-scope-${option.id}`}
                    aria-label={option.name}
                    checked={notificationScope === option.id}
                    name="notification-scope"
                    onChange={() => onNotificationScopeChange(option.id)}
                    type="radio"
                  />
                  <span>
                    <strong>{option.name}</strong>
                    <small id={`notification-scope-${option.id}`}>{option.description}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        </div>
      </>
    ),
  },
  {
    id: 'settings-notifications',
    title: 'Notifications',
    icon: Bell,
    scope: 'device',
    searchLabels: ['Enable notifications', 'Disable notifications', 'Send test notification', 'This device'],
    render: ({
      supported,
      requiresInstall,
      permissionBlocked,
      enabled,
      loading,
      submitting,
      toggle,
      testingNotification,
      testNotification,
      testMessage,
      error,
    }) => (
      <>
        <div className="app-settings-group__body">
        <section className="app-settings-section">
          <div className="app-settings-section__title">
            <h4>This device</h4>
            <SettingScope synced={false} />
          </div>
        {!supported ? (
          <p className="dialog-message">
            Push notifications are not supported in this browser.
          </p>
        ) : requiresInstall ? (
          <p className="dialog-message">
            On iPhone, open this page in Safari, choose Share → Add to Home
            Screen, then open the installed app to enable notifications.
          </p>
        ) : permissionBlocked ? (
          <p className="dialog-message">
            Notifications are blocked. On iPhone, open Settings → Notifications
            → Agentic Remote and allow notifications.
          </p>
        ) : (
          <>
            <p className="dialog-message">
              Let this device receive what you chose above. Individual sessions
              can be muted from their bell icon.
            </p>
            <button
              className={
                enabled
                  ? 'secondary-button app-settings-section__action'
                  : 'primary-button app-settings-section__action'
              }
              disabled={loading || submitting}
              onClick={() => void toggle()}
              type="button"
            >
              {loading
                ? 'Checking…'
                : submitting
                  ? 'Updating…'
                  : enabled
                    ? 'Disable notifications'
                    : 'Enable notifications'}
            </button>
            {enabled ? (
              <button
                className="secondary-button app-settings-section__action"
                disabled={testingNotification}
                onClick={() => void testNotification()}
                type="button"
              >
                {testingNotification ? 'Sending…' : 'Send test notification'}
              </button>
            ) : null}
            {testMessage ? (
              <p className="app-settings-section__result" role="status">
                {testMessage}
              </p>
            ) : null}
          </>
        )}
        {error ? <p className="form-error">{error}</p> : null}
        </section>
        </div>
      </>
    ),
  },
  {
    id: 'settings-interface',
    title: 'Interface',
    icon: SlidersHorizontal,
    scope: 'hub',
    searchLabels: ({ shortcuts }) => [
      'Appearance', 'Reading surfaces', 'Accent color', 'Status line', 'Show status line', 'Keyboard shortcuts',
      'Recall previous message', 'Preview features',
      ...appearanceOptions.flatMap((option) => [option.name, `${option.name} appearance`]),
      ...accentThemes.flatMap((theme) => [theme.name, `${theme.name} accent`]),
      ...statuslineOptions.map((option) => option.label),
      ...previewFeatureNames.map((name) => previewFeatureCatalogue[name].label),
      ...shortcuts.flatMap((shortcut) => [shortcut.label, `Change the keys for ${shortcut.label}`, `Reset the keys for ${shortcut.label}`]),
    ],
    render: ({
      appearance,
      onAppearanceChange,
      accentTheme,
      onAccentThemeChange,
      statusline,
      onStatuslineChange,
      onShortcutsChange,
      shortcutOverrides,
      shortcuts,
      schedulerAllowAllForOracle,
      onSchedulerAllowAllForOracleChange,
      categoryNavigation,
    }) => (
      <>
        <div className="app-settings-group__body">
          <section className="app-settings-section">
            <div className="app-settings-section__title">
              <h4>Appearance</h4>
              <SettingScope synced />
            </div>
            <fieldset className="appearance-options">
              <legend>Reading surfaces</legend>
              {appearanceOptions.map((option) => (
                <label className="appearance-option" data-appearance={option.id} key={option.id}>
                  <input
                    aria-label={`${option.name} appearance`}
                    checked={appearance === option.id}
                    name="appearance"
                    onChange={() => onAppearanceChange(option.id)}
                    type="radio"
                  />
                  <span aria-hidden="true" className="appearance-option__preview" />
                  <strong>{option.name}</strong>
                </label>
              ))}
            </fieldset>
            <p className="dialog-message">
              System follows each device&apos;s light or dark setting. The accent
              colors buttons, focus, and activity.
            </p>
            <div
              aria-label="Accent color"
              className="accent-theme-list"
              role="radiogroup"
            >
              {accentThemes.map((theme) => (
                <label
                  className={`accent-theme-option ${
                    accentTheme === theme.id
                      ? 'accent-theme-option--selected'
                      : ''
                  }`}
                  key={theme.id}
                >
                  <input
                    aria-label={`${theme.name} accent`}
                    checked={accentTheme === theme.id}
                    name="accent-theme"
                    onChange={() => onAccentThemeChange(theme.id)}
                    type="radio"
                  />
                  <span
                    aria-hidden="true"
                    className="accent-theme-option__swatch"
                    style={{ '--accent-choice': theme.color } as CSSProperties}
                  />
                  <strong>{theme.name}</strong>
                </label>
              ))}
            </div>
          </section>
          <section className="app-settings-section">
            <div className="app-settings-section__title">
              <h4>Status line</h4>
              <SettingScope synced />
            </div>
            <p className="dialog-message">
              Choose the session and runtime details shown above the composer.
            </p>
            <StatuslineControls
              onChange={onStatuslineChange}
              settings={statusline}
            />
          </section>
          <section className="app-settings-section app-settings-section--wide">
            <div className="app-settings-section__title">
              <h4>Keyboard shortcuts</h4>
              <SettingScope synced={false} />
            </div>
            <p className="dialog-message">
              Available on a keyboard, outside dialogs and the message box. Choose
              one to give it different keys.
            </p>
            <ShortcutEditor
              onChange={onShortcutsChange}
              overrides={shortcutOverrides}
              shortcuts={shortcuts}
            />
            <ul className="shortcut-list">
              <li>
                <span>Recall previous message</span>
                <kbd>{'\u2191'}</kbd>
              </li>
            </ul>
            <p className="dialog-message">
              Recall works in the message box itself, so it is not one of the keys
              above.
            </p>
          </section>
          <PreviewFeaturesSettings />
          {!categoryNavigation ? <SchedulerPermissionSettings allowed={schedulerAllowAllForOracle} onChange={onSchedulerAllowAllForOracleChange} /> : null}
        </div>
      </>
    ),
  },
  {
    id: 'settings-app',
    title: 'App',
    icon: Settings,
    scope: 'device',
    searchLabels: ({ healthCardEnabled }) => [
      'Display name', 'Settings sync', 'Hub connection', 'App updates', 'Version', 'Check for updates',
      ...(healthCardEnabled ? ['Health', 'Refresh health'] : []),
    ],
    render: ({
      settingsSync,
      onDisplayNameChange,
      updateRegistration,
      onApplyUpdate,
      checkingUpdate,
      updatingApp,
      checkForUpdate,
      updateMessage,
    }) => (
      <>
        <div className="app-settings-group__body">
          <DisplayNameSetting value={settingsSync.values.displayName} onChange={onDisplayNameChange} />
          <section className="app-settings-section" id="settings-sync">
            <h4>Settings sync</h4>
            <p className="dialog-message">
              Appearance, accent, status line, new-session models and folders,
              session sort, computer order, Oracle&apos;s response style, and
              what notifies you and preview features follow you to every device that opens this hub.
              Keyboard shortcuts, panel placement and widths, and drafts stay
              on this device.
            </p>
            <p className="app-settings-section__result" role="status">
              {settingsSyncMessage(settingsSync)}
            </p>
          </section>
          <HealthCard />
          {shellSettingsAvailable() && (
            <section className="app-settings-section">
              <h4>Hub connection</h4>
              <p className="dialog-message">
                This app is connected to a hub you chose when you installed it.
                Change it if the hub moved or you entered the wrong address.
              </p>
              <button
                className="secondary-button"
                onClick={() => openShellSettings()}
                type="button"
              >
                Change hub…
              </button>
            </section>
          )}
          <section className="app-settings-section">
            <h4>App updates</h4>
            <p className="dialog-message">
              Version {__APP_VERSION__}. Updates are checked automatically when the
              app opens and returns to the foreground.
            </p>
            {updateRegistration ? (
              <p className="dialog-message">
                A new Agentic Remote version is ready.
              </p>
            ) : null}
            <button
              className="secondary-button app-settings-section__action"
              disabled={checkingUpdate || updatingApp}
              onClick={
                updateRegistration
                  ? onApplyUpdate
                  : () => void checkForUpdate()
              }
              type="button"
            >
              {updatingApp
                ? 'Updating…'
                : checkingUpdate
                  ? 'Checking…'
                  : updateRegistration
                    ? 'Update now'
                    : 'Check for updates'}
            </button>
            {updateMessage ? (
              <p className="app-settings-section__result" role="status">
                {updateMessage}
              </p>
            ) : null}
          </section>
        </div>
      </>
    ),
  },
]

export const navigableSettingsSections: readonly SettingsSection[] = [
  settingsSections[0],
  settingsSections[1],
  {
    id: 'settings-computers',
    title: 'Remote machines',
    icon: MonitorCog,
    scope: 'hub',
    searchLabels: ({ computers }) => [
      'Name (optional)', 'Node URL', 'Pairing token', 'Add computer', 'Remove', 'Check connection', 'Version', 'Status', 'Role', 'Host monitor',
      ...computers.map((computer) => `Remove ${computer.name}`),
    ],
    render: ({ computers, onComputerAdded, onComputerRemoved, onCheckComputerConnections, onOpenHostMonitor }) => (
      <>
        {onOpenHostMonitor ? <button className="secondary-button" onClick={onOpenHostMonitor} type="button">Open Host monitor</button> : null}
        <ComputersBody computers={computers} enhanced onAdded={onComputerAdded ?? (() => undefined)}
          onRemoved={onComputerRemoved ?? (() => undefined)} onCheckConnection={onCheckComputerConnections} />
      </>
    ),
  },
  settingsSections[3],
  settingsSections[2],
  settingsSections[4],
  settingsSections[5],
]

export const schedulerSettingsSection: SettingsSection = {
  id: 'settings-scheduler',
  title: 'Scheduler',
  icon: Clock,
  scope: 'hub',
  searchLabels: ['Allow Oracle to propose allow-all schedules'],
  render: ({ schedulerAllowAllForOracle, onSchedulerAllowAllForOracleChange }) => (
    <SchedulerPermissionSettings allowed={schedulerAllowAllForOracle} onChange={onSchedulerAllowAllForOracleChange} />
  ),
}

export const skillsSettingsSection: SettingsSection = {
  id: 'settings-skills',
  title: 'Skills',
  icon: BookOpen,
  scope: 'hub',
  searchLabels: ['Computer', 'Skills computer', 'Search skills', 'Enable', 'Disable', 'Refresh skills'],
  render: ({ computers }) => <SkillsSettings computers={computers} />,
}
