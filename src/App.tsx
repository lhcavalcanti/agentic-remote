import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  FormEvent,
  KeyboardEvent,
  ReactNode,
  TouchEvent as ReactTouchEvent,
} from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowUp,
  Bell,
  BellOff,
  Bot,
  CheckCircle2,
  ChevronLeft,
  Command,
  CornerDownLeft,
  Eraser,
  Folder,
  FolderOpen,
  GripVertical,
  History,
  LoaderCircle,
  ListPlus,
  Menu,
  MessageSquare,
  MonitorCog,
  Pencil,
  Plus,
  RefreshCw,
  Server,
  Settings,
  SlidersHorizontal,
  Square,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type {
  ComputerSummary,
  ConfigureRuntimeInput,
  DirectoryListing,
  HubEvent,
  ManagedSession,
  PendingPermission,
  PendingUserInput,
  RuntimeOptions,
  SlashCommand,
} from '../shared/contracts'
import {
  activateSession,
  addComputer,
  cancelSession,
  clearConversation,
  configureRuntime,
  createSession,
  deleteSession,
  executeCommand,
  getPushSettings,
  getSession,
  getRuntimeOptions,
  listComputers,
  listCommands,
  listHistory,
  listDirectories,
  listSessions,
  removeComputer,
  removeQueuedPrompt,
  renameSession,
  restartSession,
  replyPermission,
  replyUserInput,
  sendMessage,
  sendTestPushNotification,
  setSessionNotificationsMuted,
} from './api'
import { composerMaximumHeight } from './composer-sizing'
import {
  activatePwaUpdate,
  checkForPwaUpdate,
  clearSessionPushNotifications,
  disablePushNotifications,
  enablePushNotifications,
  installedAsApp,
  pushNotificationsSupported,
  pushSubscription,
  PWA_UPDATE_EVENT,
} from './pwa'

function sessionKey(session: Pick<ManagedSession, 'computerId' | 'id'>): string {
  return `${session.computerId}:${session.id}`
}

function computerTone(computerId: string): number {
  let hash = 0
  for (const character of computerId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }
  return hash % 6
}

function slashShortcut(value: string): string {
  const parts = value.split(/[-_]/)
  return parts.length > 1
    ? parts
    .map((part) => part[0] || '')
    .join('')
    .toLowerCase()
    : ''
}

function readStoredOrder<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

type StatuslineSettings = {
  enabled: boolean
  computer: boolean
  path: boolean
  status: boolean
  queue: boolean
  sessionId: boolean
  model: boolean
  effort: boolean
  contextTier: boolean
  contextUsage: boolean
  mode: boolean
  permissions: boolean
}

const defaultStatusline: StatuslineSettings = {
  enabled: true,
  computer: true,
  path: true,
  status: true,
  queue: true,
  sessionId: false,
  model: true,
  effort: true,
  contextTier: true,
  contextUsage: true,
  mode: true,
  permissions: true,
}

const statuslineOptions: Array<{
  key: keyof Omit<StatuslineSettings, 'enabled'>
  label: string
}> = [
  { key: 'computer', label: 'Computer' },
  { key: 'path', label: 'Working directory' },
  { key: 'status', label: 'Agent status' },
  { key: 'queue', label: 'Queued prompts' },
  { key: 'sessionId', label: 'Session ID' },
  { key: 'model', label: 'Model' },
  { key: 'effort', label: 'Reasoning effort' },
  { key: 'contextTier', label: 'Context tier' },
  { key: 'contextUsage', label: 'Context usage' },
  { key: 'mode', label: 'Agent mode' },
  { key: 'permissions', label: 'Permission mode' },
]

const webCommands: SlashCommand[] = [
  {
    name: 'statusline',
    aliases: ['footer'],
    description: 'Configure the Agentic Remote status line',
    inputHint: '[on|off|show]',
    allowDuringAgentExecution: true,
  },
  {
    name: 'clear',
    description: 'Clear this session conversation and Copilot context',
    allowDuringAgentExecution: false,
  },
  {
    name: 'restart',
    description: 'Restart Copilot while preserving this conversation',
    allowDuringAgentExecution: false,
  },
]

function sortSessions(sessions: ManagedSession[]): ManagedSession[] {
  return [...sessions].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )
}

function upsertSession(
  sessions: ManagedSession[],
  session: ManagedSession,
): ManagedSession[] {
  const key = sessionKey(session)
  return sortSessions([
    session,
    ...sessions.filter((entry) => sessionKey(entry) !== key),
  ])
}

function upsertComputer(
  computers: ComputerSummary[],
  computer: ComputerSummary,
): ComputerSummary[] {
  return [
    computer,
    ...computers.filter((entry) => entry.id !== computer.id),
  ].sort((left, right) => Number(right.isLocal) - Number(left.isLocal))
}

function shortPath(value: string): string {
  if (value.startsWith('/home/')) {
    return `~/${value.split('/').slice(3).join('/')}`
  }
  return value
}

function compactTokens(value: number): string {
  if (value < 1_000) {
    return String(value)
  }
  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(value < 10_000 ? 1 : 0)}k`
  }
  return `${(value / 1_000_000).toFixed(1)}m`
}

function DialogFrame({
  title,
  eyebrow,
  onClose,
  children,
  className,
}: {
  title: string
  eyebrow: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label={title}
        aria-modal="true"
        className={`dialog ${className || ''}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog__header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button
            aria-label="Close"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function NewSessionDialog({
  open,
  computers,
  defaultComputerId,
  onClose,
  onCreated,
}: {
  open: boolean
  computers: ComputerSummary[]
  defaultComputerId?: string
  onClose: () => void
  onCreated: (session: ManagedSession) => void
}) {
  const [computerId, setComputerId] = useState('')
  const [cwd, setCwd] = useState('~')
  const [directoryListing, setDirectoryListing] =
    useState<DirectoryListing>()
  const [loadingDirectories, setLoadingDirectories] = useState(false)
  const directoryRequest = useRef(0)
  const [terminalBacked, setTerminalBacked] = useState(true)
  const [mode, setMode] = useState<'new' | 'previous'>('new')
  const [history, setHistory] = useState<ManagedSession[]>([])
  const [historyKey, setHistoryKey] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const available = useMemo(
    () => computers.filter((computer) => computer.online),
    [computers],
  )

  useEffect(() => {
    if (open) {
      setComputerId(defaultComputerId || available[0]?.id || '')
      setCwd('~')
      setDirectoryListing(undefined)
      setTerminalBacked(true)
      setMode('new')
      setHistoryKey('')
      setError(undefined)
      setLoadingHistory(true)
      void listHistory()
        .then(setHistory)
        .catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : String(caught))
        })
        .finally(() => setLoadingHistory(false))
    }
  }, [open, defaultComputerId, available])

  useEffect(() => {
    if (!open || mode !== 'new' || !computerId) {
      return
    }
    let active = true
    const request = ++directoryRequest.current
    setLoadingDirectories(true)
    setError(undefined)
    void listDirectories(computerId, '~')
      .then((listing) => {
        if (active && request === directoryRequest.current) {
          setDirectoryListing(listing)
          setCwd(listing.path)
        }
      })
      .catch((caught: unknown) => {
        if (active && request === directoryRequest.current) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active && request === directoryRequest.current) {
          setLoadingDirectories(false)
        }
      })
    return () => {
      active = false
    }
  }, [computerId, mode, open])

  if (!open) {
    return null
  }

  async function browseDirectory(path: string) {
    const request = ++directoryRequest.current
    setLoadingDirectories(true)
    setError(undefined)
    try {
      const listing = await listDirectories(computerId, path)
      if (request === directoryRequest.current) {
        setDirectoryListing(listing)
        setCwd(listing.path)
      }
    } catch (caught) {
      if (request === directoryRequest.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === directoryRequest.current) {
        setLoadingDirectories(false)
      }
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      if (mode === 'new') {
        onCreated(
          await createSession(computerId, { cwd, terminalBacked }),
        )
        setCwd('')
      } else {
        const previous = history.find(
          (session) => sessionKey(session) === historyKey,
        )
        if (!previous) {
          throw new Error('Choose a previous session')
        }

        onCreated(await activateSession(previous.computerId, previous.id))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  const previousSessions = history.filter(
    (session) => session.computerId === computerId && !session.isOpen,
  )

  return (
    <DialogFrame
      eyebrow="Conversation"
      onClose={onClose}
      title={mode === 'new' ? 'Choose a folder' : 'Open previous session'}
    >
      <form onSubmit={submit}>
        <div className="dialog-tabs" role="tablist" aria-label="Session type">
          <button
            aria-selected={mode === 'new'}
            className={mode === 'new' ? 'dialog-tab dialog-tab--active' : 'dialog-tab'}
            onClick={() => setMode('new')}
            role="tab"
            type="button"
          >
            <Plus size={15} />
            New session
          </button>
          <button
            aria-selected={mode === 'previous'}
            className={
              mode === 'previous' ? 'dialog-tab dialog-tab--active' : 'dialog-tab'
            }
            onClick={() => setMode('previous')}
            role="tab"
            type="button"
          >
            <History size={15} />
            Open previous
          </button>
        </div>
        <label className="field">
          <span>Computer</span>
          <select
            className="dialog-select"
            onChange={(event) => {
              directoryRequest.current += 1
              setComputerId(event.target.value)
              setHistoryKey('')
              setCwd('~')
            }}
            value={computerId}
          >
            {available.map((computer) => (
              <option key={computer.id} value={computer.id}>
                {computer.name}
              </option>
            ))}
          </select>
        </label>
        {mode === 'new' ? (
          <div className="folder-picker">
            <div className="folder-picker__toolbar">
              <button
                aria-label="Parent folder"
                className="icon-button"
                disabled={!directoryListing?.parent || loadingDirectories}
                onClick={() =>
                  void browseDirectory(directoryListing?.parent || '~')
                }
                type="button"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="folder-picker__path">
                <Folder size={15} />
                <strong>{directoryListing?.path || '~'}</strong>
              </div>
            </div>
            <div
              aria-label="Folders"
              className="folder-picker__list"
              role="listbox"
            >
              {loadingDirectories ? (
                <p>Loading folders…</p>
              ) : directoryListing?.directories.length ? (
                directoryListing.directories.map((directory) => (
                  <button
                    key={`${directory.name}:${directory.path}`}
                    onClick={() => void browseDirectory(directory.path)}
                    role="option"
                    type="button"
                  >
                    <FolderOpen size={17} />
                    <span>{directory.name}</span>
                    <ChevronLeft
                      className="folder-picker__chevron"
                      size={15}
                    />
                  </button>
                ))
              ) : (
                <p>No subfolders here.</p>
              )}
            </div>
            <p className="folder-picker__hint">
              The session will start in <strong>{cwd || '~'}</strong>.
            </p>
            <label className="tmux-session-option">
              <input
                checked={terminalBacked}
                onChange={(event) => setTerminalBacked(event.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Create in tmux</strong>
                <small>
                  Opens a new window that remains accessible from SSH.
                </small>
              </span>
            </label>
          </div>
        ) : (
          <label className="field">
            <span>Previous session</span>
            <select
              className="dialog-select history-select"
              disabled={loadingHistory || previousSessions.length === 0}
              onChange={(event) => setHistoryKey(event.target.value)}
              value={historyKey}
            >
              <option value="">
                {loadingHistory
                  ? 'Loading sessions…'
                  : previousSessions.length === 0
                    ? 'No closed sessions on this computer'
                    : 'Choose a session'}
              </option>
              {previousSessions.map((session) => (
                <option key={sessionKey(session)} value={sessionKey(session)}>
                  {session.title} — {shortPath(session.cwd)}
                </option>
              ))}
            </select>
          </label>
        )}
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={
            submitting ||
            !computerId ||
            (mode === 'new' ? !cwd.trim() : !historyKey)
          }
          type="submit"
        >
          {submitting
            ? mode === 'new'
              ? 'Creating…'
              : 'Opening…'
            : mode === 'new'
              ? 'Create session'
              : 'Open session'}
        </button>
      </form>
    </DialogFrame>
  )
}

function ComputersDialog({
  open,
  computers,
  onClose,
  onAdded,
  onRemoved,
}: {
  open: boolean
  computers: ComputerSummary[]
  onClose: () => void
  onAdded: (computer: ComputerSummary) => void
  onRemoved: (computerId: string) => void
}) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  if (!open) {
    return null
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      const computer = await addComputer({
        baseUrl,
        token,
        name: name.trim() || undefined,
      })
      onAdded(computer)
      setName('')
      setBaseUrl('')
      setToken('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this computer from the hub? Its sessions are not deleted.')) {
      return
    }
    setError(undefined)
    try {
      await removeComputer(id)
      onRemoved(id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  return (
    <DialogFrame eyebrow="Hub settings" onClose={onClose} title="Computers">
      <div className="computer-list">
        {computers.map((computer) => (
          <div className="computer-row" key={computer.id}>
            {computer.online ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>
              <strong>{computer.name}</strong>
              <small>{computer.isLocal ? 'This computer' : computer.baseUrl}</small>
            </span>
            {!computer.isLocal ? (
              <button
                aria-label={`Remove ${computer.name}`}
                className="icon-button icon-button--danger"
                onClick={() => void remove(computer.id)}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <form className="computer-form" onSubmit={submit}>
        <label className="field">
          <span>Name (optional)</span>
          <input
            className="dialog-input"
            onChange={(event) => setName(event.target.value)}
            placeholder="homelab-prod"
            value={name}
          />
        </label>
        <label className="field">
          <span>Node URL</span>
          <input
            className="dialog-input"
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="http://10.0.0.233:4317"
            spellCheck={false}
            value={baseUrl}
          />
        </label>
        <label className="field">
          <span>Pairing token</span>
          <input
            className="dialog-input"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste from agentic-remote pair-info"
            spellCheck={false}
            type="password"
            value={token}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={submitting || !baseUrl.trim() || !token.trim()}
          type="submit"
        >
          {submitting ? 'Connecting…' : 'Add computer'}
        </button>
      </form>
    </DialogFrame>
  )
}

function StatuslineControls({
  settings,
  onChange,
}: {
  settings: StatuslineSettings
  onChange: (settings: StatuslineSettings) => void
}) {
  return (
    <>
      <label className="statusline-toggle">
        <input
          checked={settings.enabled}
          onChange={(event) =>
            onChange({ ...settings, enabled: event.target.checked })
          }
          type="checkbox"
        />
        <span>Show status line</span>
      </label>
      <div className="statusline-options">
        {statuslineOptions.map((option) => (
          <label key={option.key}>
            <input
              checked={settings[option.key]}
              disabled={!settings.enabled}
              onChange={(event) =>
                onChange({
                  ...settings,
                  [option.key]: event.target.checked,
                })
              }
              type="checkbox"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </>
  )
}

function AppSettingsDialog({
  open,
  onClose,
  onApplyUpdate,
  onUpdateReady,
  statusline,
  onStatuslineChange,
  updateRegistration,
  updatingApp,
}: {
  open: boolean
  onClose: () => void
  onApplyUpdate: () => void
  onUpdateReady: (registration: ServiceWorkerRegistration) => void
  statusline: StatuslineSettings
  onStatuslineChange: (settings: StatuslineSettings) => void
  updateRegistration?: ServiceWorkerRegistration
  updatingApp: boolean
}) {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<string>()
  const [testingNotification, setTestingNotification] = useState(false)
  const [testMessage, setTestMessage] = useState<string>()
  const supported = pushNotificationsSupported()
  const ios =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  const requiresInstall = ios && !installedAsApp()
  const permissionBlocked =
    supported &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'denied'

  useEffect(() => {
    if (!open || !supported || requiresInstall) {
      return
    }
    let active = true
    setLoading(true)
    setError(undefined)
    void pushSubscription()
      .then((subscription) => {
        if (active) {
          setEnabled(Boolean(subscription))
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          console.warn('Unable to load notification mute settings:', caught)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [open, requiresInstall, supported])

  if (!open) {
    return null
  }

  async function toggle() {
    setSubmitting(true)
    setError(undefined)
    try {
      if (enabled) {
        await disablePushNotifications()
        setEnabled(false)
      } else {
        await enablePushNotifications()
        setEnabled(true)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function checkForUpdate() {
    setCheckingUpdate(true)
    setUpdateMessage(undefined)
    try {
      const registration = await checkForPwaUpdate()
      if (registration) {
        onUpdateReady(registration)
        setUpdateMessage('An update is ready to install.')
      } else {
        setUpdateMessage('Agentic Remote is up to date.')
      }
    } catch (caught) {
      setUpdateMessage(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setCheckingUpdate(false)
    }
  }

  async function testNotification() {
    setTestingNotification(true)
    setTestMessage(undefined)
    try {
      const result = await sendTestPushNotification()
      setTestMessage(
        result.sent > 0
          ? `Test notification sent to ${result.sent} device${
              result.sent === 1 ? '' : 's'
            }.`
          : 'No active notification subscriptions were found.',
      )
    } catch (caught) {
      setTestMessage(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setTestingNotification(false)
    }
  }

  return (
    <DialogFrame
      className="app-settings-dialog"
      eyebrow="Application"
      onClose={onClose}
      title="App settings"
    >
      <section className="app-settings-section">
        <h3>Notifications</h3>
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
              Notify this device when any agent needs your input or finishes
              working. Individual sessions can be muted from their bell icon.
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

      <section className="app-settings-section">
        <h3>App updates</h3>
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

      <section className="app-settings-section">
        <h3>Status line</h3>
        <p className="dialog-message">
          Choose the session and runtime details shown above the composer.
        </p>
        <StatuslineControls
          onChange={onStatuslineChange}
          settings={statusline}
        />
      </section>
    </DialogFrame>
  )
}

function PermissionCard({
  permission,
  disabled,
  onReply,
}: {
  permission: PendingPermission
  disabled: boolean
  onReply: (optionId: string) => void
}) {
  return (
    <section className="permission-card">
      <p className="eyebrow">Permission needed</p>
      <h3>{permission.title}</h3>
      <div className="permission-card__actions">
        {permission.options.map((option) => (
          <button
            className={
              option.kind.startsWith('allow')
                ? 'primary-button'
                : 'secondary-button'
            }
            disabled={disabled}
            key={option.optionId}
            onClick={() => onReply(option.optionId)}
            type="button"
          >
            {option.name}
          </button>
        ))}
      </div>
    </section>
  )
}

function UserInputCard({
  request,
  disabled,
  onReply,
}: {
  request: PendingUserInput
  disabled: boolean
  onReply: (answer: string, wasFreeform: boolean) => void
}) {
  const [answer, setAnswer] = useState('')

  return (
    <section className="user-input-card">
      <p className="eyebrow">Agent question</p>
      <h3>{request.question}</h3>
      {request.choices.length > 0 ? (
        <div className="user-input-card__choices">
          {request.choices.map((choice) => (
            <button
              className="secondary-button"
              disabled={disabled}
              key={choice}
              onClick={() => onReply(choice, false)}
              type="button"
            >
              {choice}
            </button>
          ))}
        </div>
      ) : null}
      {request.allowFreeform ? (
        <form
          className="user-input-card__form"
          onSubmit={(event) => {
            event.preventDefault()
            if (answer.trim()) {
              onReply(answer.trim(), true)
            }
          }}
        >
          <input
            aria-label="Your answer"
            disabled={disabled}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer…"
            value={answer}
          />
          <button
            className="primary-button"
            disabled={disabled || !answer.trim()}
            type="submit"
          >
            Answer
          </button>
        </form>
      ) : null}
    </section>
  )
}

function ActivityMessage({
  content,
  status,
}: {
  content: string
  status?: 'running' | 'completed' | 'failed'
}) {
  const [title, ...detailLines] = content.split('\n')
  const detail = detailLines.join('\n').trim()
  const icon =
    status === 'failed' ? (
      <XCircle size={14} />
    ) : status === 'completed' ? (
      <CheckCircle2 size={14} />
    ) : (
      <LoaderCircle className="activity-message__spinner" size={14} />
    )
  return (
    <div className={`activity-message activity-message--${status || 'running'}`}>
      {icon}
      <span>
        <strong>{title}</strong>
        {detail ? <code>{detail}</code> : null}
      </span>
    </div>
  )
}

function EmptyConversation({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <MessageSquare size={26} />
      </span>
      <h2>Your agents, within reach.</h2>
      <p>Choose a computer and continue any local Copilot conversation.</p>
      <button className="primary-button" onClick={onCreate} type="button">
        <Plus size={17} />
        New session
      </button>
    </div>
  )
}

function SortableSessionItem({
  session,
  selected,
  onSelect,
}: {
  session: ManagedSession
  selected: boolean
  onSelect: () => void
}) {
  const sortableId = `session:${sessionKey(session)}`
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId })
  return (
    <button
      aria-current={selected ? 'page' : undefined}
      className={`session-item session-item--tone-${computerTone(
        session.computerId,
      )} ${selected ? 'session-item--active' : ''} ${
        isDragging ? 'sortable-dragging' : ''
      }`}
      onClick={onSelect}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      type="button"
    >
      <span
        aria-label={`Reorder ${session.title}`}
        className="drag-handle"
        onClick={(event) => event.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={13} />
      </span>
      <span className={`status-dot status-dot--${session.status}`} />
      <span className="session-item__text">
        <strong>{session.title}</strong>
        <small>{shortPath(session.cwd)}</small>
      </span>
    </button>
  )
}

function SortableComputerGroup({
  computer,
  sessions,
  selectedKey,
  showComputerHandle,
  onSelectSession,
}: {
  computer: ComputerSummary
  sessions: ManagedSession[]
  selectedKey?: string
  showComputerHandle: boolean
  onSelectSession: (session: ManagedSession) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `computer:${computer.id}` })
  return (
    <section
      className={`computer-session-group computer-session-group--tone-${computerTone(
        computer.id,
      )} ${isDragging ? 'sortable-dragging' : ''}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <header className="computer-session-group__header">
        {showComputerHandle ? (
          <span
            aria-label={`Reorder ${computer.name}`}
            className="drag-handle"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </span>
        ) : null}
        <span
          className={`computer-session-group__status ${
            computer.online ? 'computer-session-group__status--online' : ''
          }`}
        />
        <strong>{computer.name}</strong>
        <small>{sessions.length}</small>
      </header>
      <SortableContext
        items={sessions.map((session) => `session:${sessionKey(session)}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="computer-session-group__sessions">
          {sessions.map((session) => (
            <SortableSessionItem
              key={sessionKey(session)}
              onSelect={() => onSelectSession(session)}
              selected={sessionKey(session) === selectedKey}
              session={session}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}

function StatuslineDialog({
  open,
  settings,
  onChange,
  onClose,
}: {
  open: boolean
  settings: StatuslineSettings
  onChange: (settings: StatuslineSettings) => void
  onClose: () => void
}) {
  if (!open) {
    return null
  }
  return (
    <DialogFrame
      eyebrow="Display"
      onClose={onClose}
      title="Status line"
    >
      <StatuslineControls onChange={onChange} settings={settings} />
    </DialogFrame>
  )
}

function RuntimeDialog({
  open,
  session,
  onClose,
  onConfigured,
}: {
  open: boolean
  session?: ManagedSession
  onClose: () => void
  onConfigured: (session: ManagedSession) => void
}) {
  const [options, setOptions] = useState<RuntimeOptions>()
  const [configuration, setConfiguration] = useState<ConfigureRuntimeInput>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const computerId = session?.computerId
  const sessionId = session?.id

  useEffect(() => {
    if (!open || !computerId || !sessionId) {
      return
    }
    let active = true
    setLoading(true)
    setOptions(undefined)
    setConfiguration(undefined)
    setError(undefined)
    void getRuntimeOptions(computerId, sessionId)
      .then((loaded) => {
        if (!active) {
          return
        }
        const model =
          loaded.models.find((entry) => entry.id === loaded.current.model) ||
          loaded.models[0]
        setOptions(loaded)
        if (model) {
          setConfiguration({
            model: model.id,
            reasoningEffort:
              loaded.current.reasoningEffort &&
              model.reasoningEfforts.includes(
                loaded.current.reasoningEffort,
              )
                ? loaded.current.reasoningEffort
                : model.reasoningEfforts[0],
            contextTier:
              loaded.current.contextTier === 'long_context' &&
              model.contextTiers.includes('long_context')
                ? 'long_context'
                : 'default',
          })
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [computerId, open, sessionId])

  if (!open || !session) {
    return null
  }
  const targetSession = session

  const selectedModel = options?.models.find(
    (model) => model.id === configuration?.model,
  )

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!configuration) {
      return
    }
    setSubmitting(true)
    setError(undefined)
    try {
      onConfigured(
        await configureRuntime(
          targetSession.computerId,
          targetSession.id,
          configuration,
        ),
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogFrame
      eyebrow="Agent runtime"
      onClose={onClose}
      title="Model and context"
    >
      {loading ? <p className="dialog-message">Loading runtime options…</p> : null}
      {!loading && options?.models.length === 0 ? (
        <p className="form-error">No runtime models are available.</p>
      ) : null}
      {configuration && selectedModel ? (
        <form onSubmit={submit}>
          <label className="field">
            <span>Model</span>
            <select
              className="dialog-select"
              onChange={(event) => {
                const model = options?.models.find(
                  (entry) => entry.id === event.target.value,
                )
                if (!model) {
                  return
                }
                setConfiguration({
                  model: model.id,
                  reasoningEffort: model.reasoningEfforts[0],
                  contextTier: model.contextTiers.includes('long_context')
                    ? configuration.contextTier
                    : 'default',
                })
              }}
              value={configuration.model}
            >
              {options?.models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Reasoning effort</span>
            <select
              className="dialog-select"
              onChange={(event) =>
                setConfiguration({
                  ...configuration,
                  reasoningEffort: event.target.value,
                })
              }
              value={configuration.reasoningEffort}
            >
              {selectedModel.reasoningEfforts.map((effort) => (
                <option key={effort} value={effort}>
                  {effort}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Context size</span>
            <select
              className="dialog-select"
              onChange={(event) =>
                setConfiguration({
                  ...configuration,
                  contextTier: event.target.value as
                    | 'default'
                    | 'long_context',
                })
              }
              value={configuration.contextTier}
            >
              {selectedModel.contextTiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier === 'long_context' ? 'Long context' : 'Default context'}
                </option>
              ))}
            </select>
          </label>
          <p className="runtime-dialog__hint">
            Tmux sessions restart their Copilot pane with the same session ID.
            Change settings only while the agent is idle.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="primary-button dialog__submit"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Applying…' : 'Apply runtime settings'}
          </button>
        </form>
      ) : null}
      {!loading && error && !configuration ? (
        <p className="form-error">{error}</p>
      ) : null}
    </DialogFrame>
  )
}

function RenameSessionDialog({
  open,
  session,
  onClose,
  onRenamed,
}: {
  open: boolean
  session?: ManagedSession
  onClose: () => void
  onRenamed: (session: ManagedSession) => void
}) {
  if (!open || !session) {
    return null
  }
  return (
    <RenameSessionForm
      key={sessionKey(session)}
      onClose={onClose}
      onRenamed={onRenamed}
      session={session}
    />
  )
}

function RenameSessionForm({
  session,
  onClose,
  onRenamed,
}: {
  session: ManagedSession
  onClose: () => void
  onRenamed: (session: ManagedSession) => void
}) {
  const [title, setTitle] = useState(session.title)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      onRenamed(
        await renameSession(session.computerId, session.id, {
          title: title.trim(),
        }),
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogFrame eyebrow="Session" onClose={onClose} title="Rename session">
      <form onSubmit={submit}>
        <label className="field">
          <span>Session name</span>
          <input
            autoFocus
            className="dialog-input"
            maxLength={100}
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={submitting || !title.trim()}
          type="submit"
        >
          {submitting ? 'Renaming…' : 'Rename session'}
        </button>
      </form>
    </DialogFrame>
  )
}

function App() {
  const [sessions, setSessions] = useState<ManagedSession[]>([])
  const [computers, setComputers] = useState<ComputerSummary[]>([])
  const [computerFilter, setComputerFilter] = useState('all')
  const [selectedKey, setSelectedKey] = useState<string>()
  const [composerDrafts, setComposerDrafts] = useState<Record<string, string>>(
    () => readStoredOrder('agentic-remote:composer-drafts', {}),
  )
  const [renameOpen, setRenameOpen] = useState(false)
  const [runtimeOpen, setRuntimeOpen] = useState(false)
  const [commands, setCommands] = useState<SlashCommand[]>([])
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [permissionBusy, setPermissionBusy] = useState(false)
  const [userInputBusy, setUserInputBusy] = useState(false)
  const [queueActionId, setQueueActionId] = useState<string>()
  const [deleting, setDeleting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [computersOpen, setComputersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [statuslineOpen, setStatuslineOpen] = useState(false)
  const [mutedSessions, setMutedSessions] = useState<string[]>([])
  const [mutingSession, setMutingSession] = useState(false)
  const [updateRegistration, setUpdateRegistration] =
    useState<ServiceWorkerRegistration>()
  const [updatingApp, setUpdatingApp] = useState(false)
  const [updateToastDismissed, setUpdateToastDismissed] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === 'undefined'
      ? 800
      : window.visualViewport?.height || window.innerHeight,
  )
  const [viewportOffsetTop, setViewportOffsetTop] = useState(() =>
    typeof window === 'undefined' ? 0 : window.visualViewport?.offsetTop || 0,
  )
  const [statusline, setStatusline] = useState<StatuslineSettings>(() =>
    ({
      ...defaultStatusline,
      ...readStoredOrder<Partial<StatuslineSettings>>(
        'agentic-remote:statusline',
        {},
      ),
    }),
  )
  const [error, setError] = useState<string>()
  const [computerOrder, setComputerOrder] = useState<string[]>(() =>
    readStoredOrder('agentic-remote:computer-order', []),
  )
  const [sessionOrder, setSessionOrder] = useState<Record<string, string[]>>(
    () => readStoredOrder('agentic-remote:session-order', {}),
  )
  const timelineRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const selectedRef = useRef<ManagedSession | undefined>(undefined)
  const sidebarGestureRef = useRef<
    | {
        startX: number
        startY: number
        startedAt: number
        action: 'open' | 'close'
      }
    | undefined
  >(undefined)

  const visibleSessions = useMemo(
    () =>
      computerFilter === 'all'
        ? sessions
        : sessions.filter((session) => session.computerId === computerFilter),
    [computerFilter, sessions],
  )
  const orderedComputers = useMemo(() => {
    const rank = new Map(computerOrder.map((id, index) => [id, index]))
    return computers
      .filter(
        (computer) =>
          computerFilter === 'all' || computer.id === computerFilter,
      )
      .sort(
        (left, right) =>
          (rank.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
          (rank.get(right.id) ?? Number.MAX_SAFE_INTEGER),
      )
  }, [computerFilter, computerOrder, computers])
  const sessionsByComputer = useMemo(() => {
    const grouped = new Map<string, ManagedSession[]>()
    for (const computer of orderedComputers) {
      const rank = new Map(
        (sessionOrder[computer.id] || []).map((key, index) => [key, index]),
      )
      grouped.set(
        computer.id,
        visibleSessions
          .filter((session) => session.computerId === computer.id)
          .sort(
            (left, right) =>
              (rank.get(sessionKey(left)) ?? Number.MAX_SAFE_INTEGER) -
              (rank.get(sessionKey(right)) ?? Number.MAX_SAFE_INTEGER),
          ),
      )
    }
    return grouped
  }, [orderedComputers, sessionOrder, visibleSessions])
  const selected = useMemo(
    () => sessions.find((session) => sessionKey(session) === selectedKey),
    [selectedKey, sessions],
  )
  const composer = selectedKey ? composerDrafts[selectedKey] || '' : ''
  selectedRef.current = selected
  const currentTool = selected?.messages.findLast(
    (message) => message.role === 'activity',
  )
  const hasRunningTool = currentTool?.activityStatus === 'running'
  const selectedComputerId = selected?.computerId
  const selectedSessionId = selected?.id
  const selectedNotificationsMuted = selected
    ? mutedSessions.includes(sessionKey(selected))
    : false
  const commandQuery = composer.startsWith('/')
    ? composer.slice(1).split(/\s/, 1)[0].toLowerCase()
    : ''
  const commandSuggestions = useMemo(
    () =>
      composer.startsWith('/')
        ? commands
            .filter(
              (command) =>
                command.name.toLowerCase().startsWith(commandQuery) ||
                slashShortcut(command.name).startsWith(commandQuery) ||
                command.aliases?.some((alias) =>
                  alias.toLowerCase().startsWith(commandQuery),
                ),
            )
            .slice(0, 8)
        : [],
    [commandQuery, commands, composer],
  )
  const showCommandMenu =
    commandSuggestions.length > 0 && !composer.slice(1).includes(' ')
  const defaultComputerId =
    (computerFilter !== 'all' &&
    computers.some(
      (computer) => computer.id === computerFilter && computer.online,
    )
      ? computerFilter
      : computers.find((computer) => computer.isLocal)?.id) ||
    computers.find((computer) => computer.online)?.id

  useEffect(() => {
    const updateViewport = () => {
      const viewport = window.visualViewport
      const activeElement = document.activeElement
      const editorFocused =
        activeElement instanceof HTMLElement &&
        activeElement.matches('input, textarea, select, [contenteditable="true"]')
      const open = Boolean(
        editorFocused &&
          viewport &&
          window.innerHeight - viewport.height > 80,
      )
      setKeyboardOpen(open)
      setViewportHeight(viewport?.height || window.innerHeight)
      setViewportOffsetTop(open ? viewport?.offsetTop || 0 : 0)
    }
    const timers = new Set<number>()
    const handleViewportChange = () => {
      updateViewport()
      for (const delay of [50, 250, 500]) {
        const timer = window.setTimeout(() => {
          timers.delete(timer)
          updateViewport()
        }, delay)
        timers.add(timer)
      }
    }
    window.visualViewport?.addEventListener('resize', handleViewportChange)
    window.visualViewport?.addEventListener('scroll', handleViewportChange)
    window.addEventListener('resize', handleViewportChange)
    document.addEventListener('focusin', handleViewportChange)
    document.addEventListener('focusout', handleViewportChange)
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange)
      window.visualViewport?.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
      document.removeEventListener('focusin', handleViewportChange)
      document.removeEventListener('focusout', handleViewportChange)
      for (const timer of timers) {
        window.clearTimeout(timer)
      }
    }
  }, [])

  useEffect(() => {
    let active = true
    void getPushSettings()
      .then((settings) => {
        if (active) {
          setMutedSessions(settings.mutedSessions)
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
    return () => {
      active = false
    }
  }, [])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    setComputerOrder((current) => {
      const ids = computers.map((computer) => computer.id)
      const next = [
        ...current.filter((id) => ids.includes(id)),
        ...ids.filter((id) => !current.includes(id)),
      ]
      return next.length === current.length &&
        next.every((id, index) => id === current[index])
        ? current
        : next
    })
  }, [computers])

  useEffect(() => {
    setSessionOrder((current) => {
      const next = { ...current }
      let changed = false
      const computerIds = new Set(computers.map((computer) => computer.id))
      for (const computerId of Object.keys(next)) {
        if (!computerIds.has(computerId)) {
          delete next[computerId]
          changed = true
        }
      }
      for (const computer of computers) {
        const keys = sessions
          .filter((session) => session.computerId === computer.id)
          .map(sessionKey)
        const existing = next[computer.id] || []
        const nextOrder = [
          ...existing.filter((key) => keys.includes(key)),
          ...keys.filter((key) => !existing.includes(key)),
        ]
        if (
          nextOrder.length !== existing.length ||
          nextOrder.some((key, index) => key !== existing[index])
        ) {
          next[computer.id] = nextOrder
          changed = true
        }
      }
      return changed ? next : current
    })
  }, [computers, sessions])

  useEffect(() => {
    localStorage.setItem(
      'agentic-remote:computer-order',
      JSON.stringify(computerOrder),
    )
  }, [computerOrder])

  useEffect(() => {
    localStorage.setItem(
      'agentic-remote:session-order',
      JSON.stringify(sessionOrder),
    )
  }, [sessionOrder])

  useEffect(() => {
    localStorage.setItem(
      'agentic-remote:statusline',
      JSON.stringify(statusline),
    )
  }, [statusline])

  useEffect(() => {
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify(composerDrafts),
    )
  }, [composerDrafts])

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      setUpdateRegistration(
        (event as CustomEvent<ServiceWorkerRegistration>).detail,
      )
      setUpdateToastDismissed(false)
    }
    window.addEventListener(PWA_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(PWA_UPDATE_EVENT, handleUpdate)
  }, [])

  useEffect(() => {
    let active = true
    void Promise.all([listSessions(), listComputers()])
      .then(([loadedSessions, loadedComputers]) => {
        if (!active) {
          return
        }
        setSessions(sortSessions(loadedSessions))
        setComputers(loadedComputers)
        const parameters = new URLSearchParams(window.location.search)
        const requestedComputer = parameters.get('computer')
        const requestedSession = parameters.get('session')
        const requested = loadedSessions.find(
          (session) =>
            session.computerId === requestedComputer &&
            session.id === requestedSession,
        )
        setSelectedKey(
          (current) =>
            current ||
            (requested
              ? sessionKey(requested)
              : loadedSessions[0]
                ? sessionKey(loadedSessions[0])
                : undefined),
        )
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedComputerId || !selectedSessionId) {
      setCommands([])
      return
    }
    let active = true
    setLoadingTranscript(true)
    void getSession(selectedComputerId, selectedSessionId)
      .then((session) => {
        if (active) {
          setSessions((current) => upsertSession(current, session))
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active) {
          setLoadingTranscript(false)
        }
      })
    return () => {
      active = false
    }
  }, [selectedComputerId, selectedSessionId])

  useEffect(() => {
    if (!selectedComputerId || !selectedSessionId) {
      return
    }
    const clearNotifications = () =>
      void clearSessionPushNotifications(
        selectedComputerId,
        selectedSessionId,
      ).catch((caught: unknown) => {
        console.warn('Unable to clear opened session notifications:', caught)
      })
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        clearNotifications()
      }
    }
    clearNotifications()
    const timers = [
      window.setTimeout(clearNotifications, 500),
      window.setTimeout(clearNotifications, 1_500),
    ]
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      for (const timer of timers) {
        window.clearTimeout(timer)
      }
    }
  }, [
    selectedComputerId,
    selectedSessionId,
    selected?.pendingUserInput?.requestId,
    selected?.status,
  ])

  useEffect(() => {
    if (!selectedComputerId || !selectedSessionId) {
      setCommands([])
      return
    }
    let active = true
    void listCommands(selectedComputerId, selectedSessionId)
      .then((availableCommands) => {
        if (active) {
          setCommands([
            ...availableCommands,
            ...webCommands.filter(
              (webCommand) =>
                !availableCommands.some(
                  (command) => command.name === webCommand.name,
                ),
            ),
          ])
        }
      })
      .catch(() => {
        if (active) {
          setCommands([])
        }
      })
    return () => {
      active = false
    }
  }, [selectedComputerId, selectedSessionId])

  useEffect(() => {
    setSelectedCommandIndex(0)
  }, [commandQuery])

  useEffect(() => {
    if (
      selected &&
      computerFilter !== 'all' &&
      selected.computerId !== computerFilter
    ) {
      setSelectedKey(visibleSessions[0] ? sessionKey(visibleSessions[0]) : undefined)
    }
  }, [computerFilter, selected, visibleSessions])

  useEffect(() => {
    let socket: WebSocket | undefined
    let retry: number | undefined
    let stopped = false
    let reconnectDelay = 1_000

    const refreshSnapshot = async () => {
      const [loadedSessions, loadedComputers, pushSettings] = await Promise.all([
        listSessions(),
        listComputers(),
        getPushSettings().catch((caught: unknown) => {
          console.warn('Unable to refresh notification mute settings:', caught)
          return undefined
        }),
      ])
      setSessions((current) =>
        sortSessions(
          loadedSessions.map((summary) => {
            const existing = current.find(
              (session) => sessionKey(session) === sessionKey(summary),
            )
            return existing
              ? { ...summary, messages: existing.messages }
              : summary
          }),
        ),
      )
      setComputers(loadedComputers)
      if (pushSettings) {
        setMutedSessions(pushSettings.mutedSessions)
      }
      const selectedAtRefresh = selectedRef.current
      const selectedStillExists =
        selectedAtRefresh &&
        loadedSessions.some(
          (session) => sessionKey(session) === sessionKey(selectedAtRefresh),
        )
      if (selectedAtRefresh && selectedStillExists) {
        const detail = await getSession(
          selectedAtRefresh.computerId,
          selectedAtRefresh.id,
        )
        setSessions((current) => upsertSession(current, detail))
      } else if (selectedAtRefresh) {
        setSelectedKey(
          loadedSessions[0] ? sessionKey(loadedSessions[0]) : undefined,
        )
      }
    }

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${protocol}//${window.location.host}/api/events`)
      socket.onopen = () => {
        reconnectDelay = 1_000
        void refreshSnapshot().catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : String(caught))
        })
      }
      socket.onmessage = (message) => {
        const event = JSON.parse(message.data as string) as HubEvent
        if (event.type === 'session.upserted') {
          setSessions((current) => upsertSession(current, event.session))
        } else if (event.type === 'session.removed') {
          const removedKey = `${event.computerId}:${event.sessionId}`
          setComposerDrafts((current) => {
            const { [removedKey]: _removed, ...remaining } = current
            return remaining
          })
          setSessions((current) =>
            current.filter(
              (session) =>
                session.id !== event.sessionId ||
                session.computerId !== event.computerId,
            ),
          )
        } else if (event.type === 'computer.updated') {
          setComputers((current) => upsertComputer(current, event.computer))
        } else if (event.type === 'computer.removed') {
          setComputers((current) =>
            current.filter((computer) => computer.id !== event.computerId),
          )
          setSessions((current) =>
            current.filter((session) => session.computerId !== event.computerId),
          )
          setComposerDrafts((current) =>
            Object.fromEntries(
              Object.entries(current).filter(
                ([key]) => !key.startsWith(`${event.computerId}:`),
              ),
            ),
          )
          setComputerFilter((current) =>
            current === event.computerId ? 'all' : current,
          )
        } else {
          setError(event.message)
        }
      }
      socket.onclose = () => {
        if (!stopped) {
          const delay = reconnectDelay
          reconnectDelay = Math.min(reconnectDelay * 2, 30_000)
          retry = window.setTimeout(connect, delay)
        }
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshSnapshot().catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : String(caught))
        })
      }
    }

    connect()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', handleVisibility)
      if (retry !== undefined) {
        window.clearTimeout(retry)
      }
      socket?.close()
    }
  }, [])

  const latestContent = selected?.messages.at(-1)?.content
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selectedKey, selected?.messages.length, latestContent])

  useLayoutEffect(() => {
    const textarea = composerRef.current
    if (!textarea) {
      return
    }
    const mobile =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(max-width: 960px)').matches
        : window.innerWidth <= 960
    const maximumHeight = composerMaximumHeight(mobile, viewportHeight)
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      maximumHeight,
    )}px`
  }, [composer, viewportHeight])

  function setComposer(value: string) {
    if (!selectedKey) {
      return
    }
    setComposerForKey(selectedKey, value)
  }

  function setComposerForKey(targetKey: string, value: string) {
    setComposerDrafts((current) => {
      if (!value) {
        const { [targetKey]: _removed, ...remaining } = current
        return remaining
      }
      return { ...current, [targetKey]: value }
    })
  }

  function moveComposerDraft(fromKey: string, toKey: string) {
    if (fromKey === toKey) {
      return
    }
    setComposerDrafts((current) => {
      const value = current[fromKey]
      const { [fromKey]: _removed, ...remaining } = current
      return value ? { ...remaining, [toKey]: value } : remaining
    })
  }

  function focusComposer(targetKey: string | undefined) {
    window.requestAnimationFrame(() => {
      const current = selectedRef.current
      if (!targetKey || !current || sessionKey(current) !== targetKey) {
        return
      }
      const textarea = composerRef.current
      textarea?.focus()
      const end = textarea?.value.length || 0
      textarea?.setSelectionRange(end, end)
    })
  }

  function selectSession(session: ManagedSession) {
    setSelectedKey(sessionKey(session))
    setSidebarOpen(false)
    setError(undefined)
  }

  function sidebarTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      sidebarGestureRef.current = undefined
      return
    }
    const touch = event.touches[0]
    if (!sidebarOpen) {
      const target = event.target
      const horizontalScroller =
        target instanceof Element &&
        target.closest(
          'pre, table, .web-statusline, .queued-prompts__list, .command-menu',
        )
      const ios =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !installedAsApp()
      if (touch.clientX > 24 || horizontalScroller || ios) {
        sidebarGestureRef.current = undefined
        return
      }
    }
    sidebarGestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startedAt: Date.now(),
      action: sidebarOpen ? 'close' : 'open',
    }
  }

  function sidebarTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    const gesture = sidebarGestureRef.current
    sidebarGestureRef.current = undefined
    const touch = event.changedTouches[0]
    if (!gesture || !touch || Date.now() - gesture.startedAt > 750) {
      return
    }
    const horizontal = touch.clientX - gesture.startX
    const vertical = Math.abs(touch.clientY - gesture.startY)
    if (vertical > 60 || Math.abs(horizontal) < 72) {
      return
    }
    if (gesture.action === 'open' && horizontal > 0) {
      setSidebarOpen(true)
    } else if (gesture.action === 'close' && horizontal < 0) {
      setSidebarOpen(false)
    }
  }

  function created(session: ManagedSession) {
    setSessions((current) => upsertSession(current, session))
    setSelectedKey(sessionKey(session))
    setComputerFilter(session.computerId)
    setNewSessionOpen(false)
    setSidebarOpen(false)
  }

  async function submitMessage(enqueue = false) {
    const content = composer.trim()
    if (!selected || !content || sending) {
      return
    }
    const targetKey = sessionKey(selected)

    const isCommand = content.startsWith('/')
    const commandName = isCommand
      ? content.slice(1).split(/\s+/, 1)[0].toLowerCase()
      : ''
    const command = commands.find(
      (candidate) =>
        candidate.name.toLowerCase() === commandName ||
        slashShortcut(candidate.name) === commandName ||
        candidate.aliases?.some(
          (alias) => alias.toLowerCase() === commandName,
        ),
    )
    if (command?.name === 'statusline') {
      const input = content.slice(commandName.length + 1).trim().toLowerCase()
      if (input === 'off') {
        setStatusline((current) => ({ ...current, enabled: false }))
      } else if (input === 'on') {
        setStatusline((current) => ({ ...current, enabled: true }))
      } else {
        setStatuslineOpen(true)
      }
      setComposer('')
      return
    }
    if (command?.name === 'clear') {
      setComposer('')
      focusComposer(await clearSelectedConversation())
      return
    }
    if (command?.name === 'restart') {
      setComposer('')
      await restartSelectedSession()
      focusComposer(targetKey)
      return
    }
    const shouldEnqueue =
      enqueue ||
      (selected.status === 'running' &&
        (!isCommand || !command?.allowDuringAgentExecution))
    setSending(true)
    setError(undefined)
    setComposer('')
    try {
      const updated = isCommand
        ? await executeCommand(selected.computerId, selected.id, {
            command: content,
            enqueue: shouldEnqueue,
          })
        : await sendMessage(selected.computerId, selected.id, {
            content,
            enqueue: shouldEnqueue,
          })
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setComposerForKey(targetKey, content)
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSending(false)
      focusComposer(targetKey)
    }
  }

  async function manageQueuedPrompt(promptId: string, edit: boolean) {
    if (!selected || queueActionId) {
      return
    }

    const target = selected
    setQueueActionId(promptId)
    setError(undefined)
    try {
      const result = await removeQueuedPrompt(
        target.computerId,
        target.id,
        promptId,
      )
      setSessions((current) => upsertSession(current, result.session))
      if (edit) {
        setComposer(result.prompt.content)
        window.requestAnimationFrame(() => composerRef.current?.focus())
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setQueueActionId(undefined)
    }
  }

  async function clearSelectedConversation(): Promise<string | undefined> {
    if (
      !selected ||
      clearing ||
      !window.confirm(
        `Clear the conversation in "${selected.title}"?\n\nThis removes Copilot context and Agentic Remote history but keeps the session open.`,
      )
    ) {
      return undefined
    }

    const target = selected
    setClearing(true)
    setError(undefined)
    try {
      const cleared = await clearConversation(target.computerId, target.id)
      setSessions((current) =>
        upsertSession(
          current.filter(
            (session) =>
              session.id !== target.id ||
              session.computerId !== target.computerId,
          ),
          cleared,
        ),
      )
      moveComposerDraft(sessionKey(target), sessionKey(cleared))
      setSelectedKey(sessionKey(cleared))
      return sessionKey(cleared)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
      return sessionKey(target)
    } finally {
      setClearing(false)
    }
  }

  async function restartSelectedSession() {
    if (!selected || restarting) {
      return
    }
    const target = selected
    setRestarting(true)
    setError(undefined)
    try {
      const restarted = await restartSession(target.computerId, target.id)
      setSessions((current) => upsertSession(current, restarted))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setRestarting(false)
    }
  }

  function selectCommand(command: SlashCommand) {
    setComposer(`/${command.name}${command.inputHint ? ' ' : ''}`)
    setSelectedCommandIndex(0)
  }

  function insertComposerNewline() {
    const textarea = composerRef.current
    const start = textarea?.selectionStart ?? composer.length
    const end = textarea?.selectionEnd ?? start
    setComposer(
      `${composer.slice(0, start)}\n${composer.slice(end)}`,
    )
    window.requestAnimationFrame(() => {
      composerRef.current?.focus()
      composerRef.current?.setSelectionRange(start + 1, start + 1)
    })
  }

  function composerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) {
      return
    }
    if (event.key === 'ArrowDown' && showCommandMenu) {
      event.preventDefault()
      setSelectedCommandIndex(
        (current) => (current + 1) % commandSuggestions.length,
      )
      return
    }
    if (event.key === 'ArrowUp' && showCommandMenu) {
      event.preventDefault()
      setSelectedCommandIndex(
        (current) =>
          (current - 1 + commandSuggestions.length) %
          commandSuggestions.length,
      )
      return
    }
    const selectedSuggestion =
      commandSuggestions[
        Math.min(selectedCommandIndex, commandSuggestions.length - 1)
      ]
    const exactCommand =
      selectedSuggestion && composer === `/${selectedSuggestion.name}`
    if (
      (event.key === 'Tab' ||
        (event.key === 'Enter' && !exactCommand)) &&
      selectedSuggestion &&
      !composer.slice(1).includes(' ')
    ) {
      event.preventDefault()
      selectCommand(selectedSuggestion)
      return
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submitMessage(event.metaKey || event.ctrlKey)
    }
  }

  async function replyToPermission(optionId: string) {
    if (!selected?.pendingPermission) {
      return
    }

    setPermissionBusy(true)
    setError(undefined)
    try {
      const updated = await replyPermission(
        selected.computerId,
        selected.id,
        selected.pendingPermission.requestId,
        { optionId },
      )
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setPermissionBusy(false)
    }
  }

  async function answerUserInput(answer: string, wasFreeform: boolean) {
    if (!selected?.pendingUserInput || userInputBusy) {
      return
    }
    setUserInputBusy(true)
    setError(undefined)
    try {
      const updated = await replyUserInput(
        selected.computerId,
        selected.id,
        selected.pendingUserInput.requestId,
        { answer, wasFreeform },
      )
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setUserInputBusy(false)
    }
  }

  async function closeSelectedSession() {
    if (
      !selected ||
      !window.confirm(
        `Close "${selected.title}" on ${selected.computerName}?\n\nThis permanently deletes the Copilot session and its history from that computer.`,
      )
    ) {
      return
    }

    setDeleting(true)
    setError(undefined)
    try {
      await deleteSession(selected.computerId, selected.id)
      setComposerForKey(sessionKey(selected), '')
      const remaining = sessions.filter(
        (session) => sessionKey(session) !== sessionKey(selected),
      )
      setSessions(remaining)
      const next = remaining.find(
        (session) =>
          computerFilter === 'all' || session.computerId === computerFilter,
      )
      setSelectedKey(next ? sessionKey(next) : undefined)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setDeleting(false)
    }
  }

  async function applyPwaUpdate() {
    if (!updateRegistration || updatingApp) {
      return
    }
    setUpdatingApp(true)
    setError(undefined)
    try {
      await activatePwaUpdate(updateRegistration)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
      setUpdatingApp(false)
    }
  }

  async function toggleSelectedSessionMute() {
    if (!selected || mutingSession) {
      return
    }
    setMutingSession(true)
    setError(undefined)
    try {
      const settings = await setSessionNotificationsMuted(
        selected.computerId,
        selected.id,
        !selectedNotificationsMuted,
      )
      setMutedSessions(settings.mutedSessions)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setMutingSession(false)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : ''
    if (!overId || activeId === overId) {
      return
    }
    if (activeId.startsWith('computer:') && overId.startsWith('computer:')) {
      const activeComputer = activeId.slice('computer:'.length)
      const overComputer = overId.slice('computer:'.length)
      setComputerOrder((current) => {
        const from = current.indexOf(activeComputer)
        const to = current.indexOf(overComputer)
        return from >= 0 && to >= 0 ? arrayMove(current, from, to) : current
      })
      return
    }
    if (!activeId.startsWith('session:') || !overId.startsWith('session:')) {
      return
    }
    const activeKey = activeId.slice('session:'.length)
    const overKey = overId.slice('session:'.length)
    const activeSession = sessions.find(
      (session) => sessionKey(session) === activeKey,
    )
    const overSession = sessions.find(
      (session) => sessionKey(session) === overKey,
    )
    if (
      !activeSession ||
      !overSession ||
      activeSession.computerId !== overSession.computerId
    ) {
      return
    }
    setSessionOrder((current) => {
      const order = current[activeSession.computerId] || []
      const from = order.indexOf(activeKey)
      const to = order.indexOf(overKey)
      if (from < 0 || to < 0) {
        return current
      }
      return {
        ...current,
        [activeSession.computerId]: arrayMove(order, from, to),
      }
    })
  }

  return (
    <div
      className={`app-shell ${
        keyboardOpen ? 'app-shell--keyboard-open' : ''
      }`}
      onTouchCancel={() => {
        sidebarGestureRef.current = undefined
      }}
      onTouchEnd={sidebarTouchEnd}
      onTouchStart={sidebarTouchStart}
      style={
        {
          '--visual-viewport-height': `${viewportHeight}px`,
          '--visual-viewport-top': `${viewportOffsetTop}px`,
        } as CSSProperties
      }
    >
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">
          <span className="brand__mark">
            <Bot size={19} />
          </span>
          <div>
            <strong>Agentic Remote</strong>
            <span>Multi-computer agent hub</span>
          </div>
          <button
            aria-label="Close sessions"
            className="icon-button sidebar__close"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-actions">
          <button
            className="new-session-button"
            onClick={() => setNewSessionOpen(true)}
            type="button"
          >
            <Plus size={18} />
            New session
          </button>
          <button
            aria-label="Manage computers"
            className="manage-computers-button"
            onClick={() => setComputersOpen(true)}
            type="button"
          >
            <MonitorCog size={18} />
          </button>
        </div>

        <label className="computer-filter">
          <Server size={15} />
          <select
            aria-label="Computer"
            onChange={(event) => setComputerFilter(event.target.value)}
            value={computerFilter}
          >
            <option value="all">All computers</option>
            {computers.map((computer) => (
              <option key={computer.id} value={computer.id}>
                {computer.name}{computer.online ? '' : ' (offline)'}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Sessions" className="session-list">
          <p className="sidebar-label">Recent</p>
          {loading ? <p className="sidebar-message">Loading sessions…</p> : null}
          {!loading && visibleSessions.length === 0 ? (
            <p className="sidebar-message">No sessions here.</p>
          ) : null}
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={orderedComputers.map(
                (computer) => `computer:${computer.id}`,
              )}
              strategy={verticalListSortingStrategy}
            >
              <div className="computer-session-groups">
                {orderedComputers.map((computer) => (
                  <SortableComputerGroup
                    computer={computer}
                    key={computer.id}
                    onSelectSession={selectSession}
                    selectedKey={selectedKey}
                    sessions={sessionsByComputer.get(computer.id) || []}
                    showComputerHandle={computerFilter === 'all'}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </nav>
        <div className="sidebar-settings">
          <button
            aria-label="App settings"
            className="sidebar-settings__button"
            onClick={() => {
              setSidebarOpen(false)
              setSettingsOpen(true)
            }}
            type="button"
          >
            <Settings size={18} />
            <span>
              <strong>App settings</strong>
              <small>Notifications, updates, and display</small>
            </span>
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          aria-label="Close sessions"
          className="sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <main className="conversation">
        <header className="conversation-header">
          <button
            aria-label="Open sessions"
            className="icon-button mobile-menu"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <Menu size={21} />
          </button>
          <div className="conversation-header__title">
            <strong>{selected?.title || 'Agentic Remote'}</strong>
            <span>
              {selected
                ? `${selected.computerName} · ${shortPath(selected.cwd)}`
                : 'Ready when you are'}
            </span>
          </div>
          {selected ? (
            <button
              aria-label="Restart session"
              className="icon-button"
              disabled={restarting || selected.status !== 'idle'}
              onClick={() => void restartSelectedSession()}
              type="button"
            >
              <RefreshCw size={17} />
            </button>
          ) : null}
          {selected ? (
            <button
              aria-label="Clear conversation"
              className="icon-button"
              disabled={clearing || selected.status !== 'idle'}
              onClick={() => void clearSelectedConversation()}
              type="button"
            >
              <Eraser size={17} />
            </button>
          ) : null}
          {selected ? (
            <button
              aria-label="Rename session"
              className="icon-button"
              onClick={() => setRenameOpen(true)}
              type="button"
            >
              <Pencil size={17} />
            </button>
          ) : null}
          {selected ? (
            <button
              aria-label="Close session"
              className="icon-button icon-button--danger"
              disabled={deleting}
              onClick={() => void closeSelectedSession()}
              type="button"
            >
              <Trash2 size={18} />
            </button>
          ) : null}
          {selected ? (
            <button
              aria-label={
                selectedNotificationsMuted
                  ? 'Unmute session notifications'
                  : 'Mute session notifications'
              }
              aria-pressed={selectedNotificationsMuted}
              className={`icon-button ${
                selectedNotificationsMuted ? 'icon-button--active' : ''
              }`}
              disabled={mutingSession}
              onClick={() => void toggleSelectedSessionMute()}
              type="button"
            >
              {selectedNotificationsMuted ? (
                <BellOff size={18} />
              ) : (
                <Bell size={18} />
              )}
            </button>
          ) : null}
          <button
            aria-label="New session"
            className="icon-button"
            onClick={() => setNewSessionOpen(true)}
            type="button"
          >
            <Plus size={21} />
          </button>
        </header>

        {error ? (
          <div className="error-banner">
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError(undefined)}>
              <X size={16} />
            </button>
          </div>
        ) : null}

        <div className="timeline" ref={timelineRef}>
          {!selected ? (
            <EmptyConversation onCreate={() => setNewSessionOpen(true)} />
          ) : loadingTranscript && selected.messages.length === 0 ? (
            <div className="empty-chat">
              <span className="typing-indicator" aria-label="Loading conversation">
                <i />
                <i />
                <i />
              </span>
            </div>
          ) : selected.messages.length === 0 ? (
            <div className="empty-chat">
              <span className="empty-chat__icon">
                <Bot size={24} />
              </span>
              <h2>What should we work on?</h2>
              <p>
                This agent runs on <strong>{selected.computerName}</strong> in{' '}
                <code>{shortPath(selected.cwd)}</code>.
              </p>
            </div>
          ) : (
            <div className="message-stack">
              {selected.messages
                .filter((message) => message.role !== 'activity')
                .map((message) => (
                <article className={`message message--${message.role}`} key={message.id}>
                  <div className="message__label">
                    {message.role === 'user'
                      ? 'You'
                      : message.role === 'notice'
                        ? 'Command'
                        : 'Agent'}
                  </div>
                  <div className="message__content">
                    {message.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <span className="typing-indicator">
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                  </div>
                </article>
              ))}
              {currentTool ? (
                <article
                  className="message message--activity tool-activity-slot"
                  key={currentTool.id}
                >
                  <ActivityMessage
                    content={currentTool.content}
                    status={currentTool.activityStatus}
                  />
                </article>
              ) : null}
            </div>
          )}
          {selected?.pendingPermission ? (
            <PermissionCard
              disabled={permissionBusy}
              onReply={(optionId) => void replyToPermission(optionId)}
              permission={selected.pendingPermission}
            />
          ) : null}
          {selected?.pendingUserInput ? (
            <UserInputCard
              disabled={userInputBusy}
              onReply={(answer, wasFreeform) =>
                void answerUserInput(answer, wasFreeform)
              }
              request={selected.pendingUserInput}
            />
          ) : null}
          {selected?.activity &&
          !selected.pendingPermission &&
          !selected.pendingUserInput &&
          !hasRunningTool ? (
            <div className="activity-line">
              <span className="activity-pulse" />
              {selected.activity}
            </div>
          ) : null}
          <div aria-hidden="true" className="timeline-bottom" ref={bottomRef} />
        </div>

        {selected && statusline.enabled ? (
          <div className="web-statusline" data-testid="web-statusline">
            {statusline.computer ? (
              <span className={`web-statusline__computer session-item--tone-${computerTone(
                selected.computerId,
              )}`}>
                {selected.computerName}
              </span>
            ) : null}
            {statusline.path ? <span>{shortPath(selected.cwd)}</span> : null}
            {statusline.status ? (
              <span
                className={`web-statusline__status web-statusline__status--${selected.status}`}
              >
                {selected.status}
              </span>
            ) : null}
            {statusline.queue ? (
              <span>{selected.queuedCount || 0} queued</span>
            ) : null}
            {statusline.sessionId ? (
              <span>{selected.id.slice(0, 8)}</span>
            ) : null}
            {statusline.mode && selected.runtime?.mode ? (
              <span>{selected.runtime.mode}</span>
            ) : null}
            {statusline.permissions &&
            selected.runtime?.allowAllPermissions !== undefined ? (
              <span>
                {selected.runtime.allowAllPermissions ? 'allow all' : 'ask'}
              </span>
            ) : null}
          </div>
        ) : null}

        {selected ? (
          <footer className="composer-area">
            {selected.queuedPrompts?.length ? (
              <section aria-label="Queued prompts" className="queued-prompts">
                <header>
                  <strong>Queued</strong>
                  <span>{selected.queuedPrompts.length}</span>
                </header>
                <div className="queued-prompts__list">
                  {selected.queuedPrompts.map((prompt, index) => (
                    <div className="queued-prompt" key={prompt.id}>
                      <span>{prompt.content}</span>
                      <button
                        aria-label={`Edit queued prompt ${index + 1}`}
                        className="icon-button"
                        disabled={Boolean(queueActionId)}
                        onClick={() =>
                          void manageQueuedPrompt(prompt.id, true)
                        }
                        type="button"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        aria-label={`Remove queued prompt ${index + 1}`}
                        className="icon-button icon-button--danger"
                        disabled={Boolean(queueActionId)}
                        onClick={() =>
                          void manageQueuedPrompt(prompt.id, false)
                        }
                        type="button"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {showCommandMenu ? (
              <div className="command-menu" role="listbox" aria-label="Commands">
                {commandSuggestions.map((command, index) => (
                  <button
                    aria-selected={index === selectedCommandIndex}
                    className={`command-menu__item ${
                      index === selectedCommandIndex
                        ? 'command-menu__item--selected'
                        : ''
                    }`}
                    key={command.name}
                    onClick={() => selectCommand(command)}
                    role="option"
                    type="button"
                  >
                    <Command size={14} />
                    <span>
                      <strong>/{command.name}</strong>
                      <small>{command.description}</small>
                    </span>
                    {command.inputHint ? <em>{command.inputHint}</em> : null}
                  </button>
                ))}
              </div>
            ) : null}
            <div
              className={`composer ${
                selected.status === 'running' ? 'composer--running' : ''
              }`}
            >
              <textarea
                aria-label="Message"
                disabled={sending}
                onChange={(event) => setComposer(event.target.value)}
                onKeyDown={composerKeyDown}
                placeholder={`Message agent on ${selected.computerName}…`}
                ref={composerRef}
                rows={1}
                value={composer}
              />
              <button
                aria-label="Insert newline"
                className="send-button composer-newline-button"
                onClick={insertComposerNewline}
                type="button"
              >
                <CornerDownLeft size={17} />
              </button>
              {selected.status === 'running' ? (
                <>
                  <button
                    aria-label="Queue message"
                    className="send-button send-button--queue"
                    disabled={!composer.trim() || sending}
                    onClick={() => void submitMessage(true)}
                    type="button"
                  >
                    <ListPlus size={17} />
                  </button>
                  <button
                    aria-label="Stop response"
                    className="send-button send-button--stop"
                    onClick={() =>
                      void cancelSession(selected.computerId, selected.id)
                    }
                    type="button"
                  >
                    <Square fill="currentColor" size={15} />
                  </button>
                </>
              ) : (
                <button
                  aria-label="Send message"
                  className="send-button"
                  disabled={!composer.trim() || sending}
                  onClick={() => void submitMessage()}
                  type="button"
                >
                  <ArrowUp size={19} strokeWidth={2.4} />
                </button>
              )}
            </div>
            {((statusline.model && selected.runtime?.model) ||
              (statusline.effort && selected.runtime?.reasoningEffort) ||
              (statusline.contextTier && selected.runtime?.contextTier) ||
              (statusline.contextUsage &&
                selected.runtime?.contextTokens !== undefined &&
                selected.runtime.contextTokenLimit)) ? (
              <button
                aria-label="Configure model, effort, and context"
                className="composer-runtime"
                data-testid="composer-runtime"
                onClick={() => setRuntimeOpen(true)}
                type="button"
              >
                <SlidersHorizontal aria-hidden="true" size={12} />
                {statusline.model && selected.runtime?.model ? (
                  <span>{selected.runtime.model}</span>
                ) : null}
                {statusline.effort && selected.runtime?.reasoningEffort ? (
                  <span>effort {selected.runtime.reasoningEffort}</span>
                ) : null}
                {statusline.contextTier && selected.runtime?.contextTier ? (
                  <span>
                    {selected.runtime.contextTier === 'long_context'
                      ? 'long context'
                      : `${selected.runtime.contextTier} context`}
                  </span>
                ) : null}
                {statusline.contextUsage &&
                selected.runtime?.contextTokens !== undefined &&
                selected.runtime.contextTokenLimit ? (
                  <span>
                      ctx {selected.runtime.contextEstimated ? '~' : ''}
                      {compactTokens(selected.runtime.contextTokens)}/
                      {compactTokens(selected.runtime.contextTokenLimit)} (
                      {Math.round(
                        (selected.runtime.contextTokens /
                          selected.runtime.contextTokenLimit) *
                          100,
                      )}
                      %)
                  </span>
                ) : null}
              </button>
            ) : null}
            <p className="composer-hint">
              Enter send · Shift+Enter newline · Ctrl/⌘+Enter queue
              {selected.queuedCount
                ? ` · ${selected.queuedCount} queued`
                : ''}
            </p>
          </footer>
        ) : null}
      </main>

      <NewSessionDialog
        computers={computers}
        defaultComputerId={defaultComputerId}
        onClose={() => setNewSessionOpen(false)}
        onCreated={created}
        open={newSessionOpen}
      />
      <ComputersDialog
        computers={computers}
        onAdded={(computer) =>
          setComputers((current) => upsertComputer(current, computer))
        }
        onClose={() => setComputersOpen(false)}
        onRemoved={(computerId) => {
          setComputers((current) =>
            current.filter((computer) => computer.id !== computerId),
          )
          setSessions((current) =>
            current.filter((session) => session.computerId !== computerId),
          )
          if (computerFilter === computerId) {
            setComputerFilter('all')
          }
        }}
        open={computersOpen}
      />
      <StatuslineDialog
        onChange={setStatusline}
        onClose={() => setStatuslineOpen(false)}
        open={statuslineOpen}
        settings={statusline}
      />
      <AppSettingsDialog
        onApplyUpdate={() => void applyPwaUpdate()}
        onClose={() => setSettingsOpen(false)}
        onStatuslineChange={setStatusline}
        onUpdateReady={setUpdateRegistration}
        open={settingsOpen}
        statusline={statusline}
        updateRegistration={updateRegistration}
        updatingApp={updatingApp}
      />
      <RuntimeDialog
        onClose={() => setRuntimeOpen(false)}
        onConfigured={(session) => {
          setSessions((current) => upsertSession(current, session))
          setRuntimeOpen(false)
        }}
        open={runtimeOpen}
        session={selected}
      />
      {updateRegistration && !updateToastDismissed ? (
        <div className="update-toast" role="status">
          <span>A new Agentic Remote version is ready.</span>
          <button
            className="primary-button"
            disabled={updatingApp}
            onClick={() => void applyPwaUpdate()}
            type="button"
          >
            {updatingApp ? 'Updating…' : 'Update now'}
          </button>
          <button
            aria-label="Dismiss update"
            className="update-toast__dismiss"
            onClick={() => setUpdateToastDismissed(true)}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}
      <RenameSessionDialog
        onClose={() => setRenameOpen(false)}
        onRenamed={(session) => {
          setSessions((current) => upsertSession(current, session))
          setRenameOpen(false)
        }}
        open={renameOpen}
        session={selected}
      />
    </div>
  )
}

export default App
