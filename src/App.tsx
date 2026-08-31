import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  ChangeEvent,
  DragEvent as ReactDragEvent,
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
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  Eraser,
  Folder,
  FolderOpen,
  File as FileIcon,
  FileText,
  GripVertical,
  History,
  List,
  LoaderCircle,
  ListPlus,
  Menu,
  MessageSquare,
  Mic,
  MonitorCog,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Square,
  SquareTerminal,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  breadcrumbSegments,
  headingSlug,
  headingText,
  outlineFromMarkdown,
  resolveDocumentPath,
  isExternalSource,
  pushNavigation,
  rememberScroll,
  type DocumentHeading,
  type NavigationEntry,
} from './markdown-navigation'
import remarkGfm from 'remark-gfm'
import type {
  AgentProvider,
  AgentProviderCapability,
  ComputerSummary,
  ConfigureRuntimeInput,
  DirectoryListing,
  HubEvent,
  ManagedSession,
  KnowledgeRoot,
  PendingPermission,
  PendingUserInput,
  UserInputField,
  UserInputFieldValue,
  UserInputReplyInput,
  RuntimeOptions,
  RuntimeModelOption,
  RuntimeReasoningEffort,
  SlashCommand,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResult,
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
  getProviderRuntimeOptions,
  getRuntimeOptions,
  listComputers,
  listCommands,
  listHistory,
  listKnowledgeEntries,
  listKnowledgeRoots,
  addKnowledgeRoot,
  deleteKnowledgeRoot,
  readKnowledgeFile,
  listDirectories,
  listSessions,
  listWorkspace,
  moveSessionToTmux,
  removeComputer,
  removeQueuedPrompt,
  renameSession,
  readWorkspaceFile,
  restartSession,
  replyPermission,
  replyUserInput,
  sendMessage,
  sendTestPushNotification,
  searchWorkspace,
  setSessionNotificationsMuted,
  transcribeAudio,
  uploadSessionFile,
} from './api'
import { composerMaximumHeight } from './composer-sizing'
import {
  activatePwaUpdate,
  activePushSubscription,
  checkForPwaUpdate,
  clearSessionPushNotifications,
  disablePushNotifications,
  enablePushNotifications,
  installedAsApp,
  pushNotificationsSupported,
  PWA_UPDATE_EVENT,
} from './pwa'

function sessionKey(session: Pick<ManagedSession, 'computerId' | 'id'>): string {
  return `${session.computerId}:${session.id}`
}

function isAudioFile(file: File): boolean {
  return (
    file.type.startsWith('audio/') ||
    file.type === 'video/mp4' ||
    /\.(?:aac|flac|m4a|mp3|mp4|ogg|wav|webm)$/i.test(file.name)
  )
}

function recordingDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

const messageTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

const messageDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function phoneEnterCreatesNewline(): boolean {
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    window.innerWidth <= 960
  )
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
  provider: boolean
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

type DefaultRuntimeSelection = {
  model: string
  reasoningEffort: RuntimeReasoningEffort | ''
  contextTier: 'default' | 'long_context'
}

type DefaultRuntimeSettings = Record<AgentProvider, DefaultRuntimeSelection>

const emptyRuntimeSelection: DefaultRuntimeSelection = {
  model: '',
  reasoningEffort: '',
  contextTier: 'default',
}

type ComposerHistoryState = {
  messages: string[]
  index: number
  draft: string
}

function isRuntimeReasoningEffort(
  value: unknown,
): value is RuntimeReasoningEffort {
  return (
    value === 'low' ||
    value === 'medium' ||
    value === 'high' ||
    value === 'xhigh' ||
    value === 'max'
  )
}

function readDefaultRuntimeSettings(): DefaultRuntimeSettings {
  const parsed = readStoredOrder<unknown>(
    'agentic-remote:default-models',
    {},
  )
  const stored =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  const selection = (provider: AgentProvider): DefaultRuntimeSelection => {
    const value = stored[provider]
    if (typeof value === 'string') {
      return { ...emptyRuntimeSelection, model: value }
    }
    if (!value || typeof value !== 'object') {
      return { ...emptyRuntimeSelection }
    }
    const fields = value as Record<string, unknown>
    return {
      model: typeof fields.model === 'string' ? fields.model : '',
      reasoningEffort: isRuntimeReasoningEffort(fields.reasoningEffort)
        ? fields.reasoningEffort
        : '',
      contextTier:
        fields.contextTier === 'long_context' ? 'long_context' : 'default',
    }
  }
  return {
    copilot: selection('copilot'),
    claude: selection('claude'),
  }
}

const defaultStatusline: StatuslineSettings = {
  enabled: true,
  computer: true,
  provider: true,
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

const timelineBottomThreshold = 48

const statuslineOptions: Array<{
  key: keyof Omit<StatuslineSettings, 'enabled'>
  label: string
}> = [
  { key: 'computer', label: 'Computer' },
  { key: 'provider', label: 'Agent provider' },
  { key: 'path', label: 'Working directory' },
  { key: 'status', label: 'Agent status' },
  { key: 'queue', label: 'Queued prompts' },
  { key: 'sessionId', label: 'Session ID' },
  { key: 'model', label: 'Model' },
  { key: 'effort', label: 'Reasoning effort' },
  { key: 'contextTier', label: 'Context size' },
  { key: 'contextUsage', label: 'Context usage' },
  { key: 'mode', label: 'Agent mode' },
  { key: 'permissions', label: 'Permission mode' },
]

const webCommands: SlashCommand[] = [
  {
    name: 'cwd',
    description: 'Change the session working directory',
    inputHint: '[path]',
    allowDuringAgentExecution: false,
  },
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
  const existing = sessions.find((entry) => sessionKey(entry) === key)
  if (
    existing &&
    existing.revision !== undefined &&
    session.revision !== undefined &&
    existing.revision > session.revision
  ) {
    return sessions
  }
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

function providerName(provider: AgentProvider | undefined): string {
  return provider === 'claude' ? 'Claude Agent' : 'GitHub Copilot'
}

function executionModeName(
  executionMode: ManagedSession['executionMode'],
): string | undefined {
  return executionMode === 'tmux'
    ? 'tmux'
    : executionMode === 'sdk'
      ? 'SDK'
      : undefined
}

function computerProviders(
  computer: ComputerSummary | undefined,
): AgentProviderCapability[] {
  return (
    computer?.providers || [
      {
        id: 'copilot',
        name: 'GitHub Copilot',
        available: true,
        terminalBacked: true,
      },
    ]
  )
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

function contextSizeLabel(
  model: RuntimeOptions['models'][number],
  tier: 'default' | 'long_context',
): string {
  const limit = model.contextTokenLimits?.[tier]
  return limit ? `${compactTokens(limit)} tokens` : 'Automatic'
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
  defaultRuntimes,
  onClose,
  onCreated,
}: {
  open: boolean
  computers: ComputerSummary[]
  defaultComputerId?: string
  defaultRuntimes: DefaultRuntimeSettings
  onClose: () => void
  onCreated: (session: ManagedSession) => void
}) {
  const [computerId, setComputerId] = useState('')
  const [provider, setProvider] = useState<AgentProvider>('copilot')
  const [cwd, setCwd] = useState('~')
  const [directoryListing, setDirectoryListing] =
    useState<DirectoryListing>()
  const [loadingDirectories, setLoadingDirectories] = useState(false)
  const directoryRequest = useRef(0)
  const [terminalBacked, setTerminalBacked] = useState(true)
  const [allowAllPermissions, setAllowAllPermissions] = useState(true)
  const [mode, setMode] = useState<'new' | 'previous'>('new')
  const [history, setHistory] = useState<ManagedSession[]>([])
  const [historyKey, setHistoryKey] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [runtimeLoading, setRuntimeLoading] = useState(false)
  const [runtimeError, setRuntimeError] = useState<string>()
  const [providerRuntimeModels, setProviderRuntimeModels] =
    useState<RuntimeModelOption[]>()
  const available = useMemo(
    () => computers.filter((computer) => computer.online),
    [computers],
  )

  useEffect(() => {
    if (open) {
      setComputerId(defaultComputerId || available[0]?.id || '')
      setProvider('copilot')
      setCwd('~')
      setDirectoryListing(undefined)
      setTerminalBacked(true)
      setAllowAllPermissions(true)
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

  useEffect(() => {
    if (!open || mode !== 'new' || !computerId) {
      return
    }
    let active = true
    setRuntimeLoading(true)
    setRuntimeError(undefined)
    setProviderRuntimeModels(undefined)
    void getProviderRuntimeOptions(computerId, provider)
      .then(({ models }) => {
        if (active) {
          setProviderRuntimeModels(models)
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setRuntimeError(
            caught instanceof Error ? caught.message : String(caught),
          )
        }
      })
      .finally(() => {
        if (active) {
          setRuntimeLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [
    computerId,
    mode,
    open,
    provider,
  ])

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
        const defaultRuntime = providerRuntimeModels
          ? normalizedRuntimeSelection(
              defaultRuntimes[provider],
              providerRuntimeModels,
            )
          : undefined
        const defaultModel = defaultRuntime?.model.trim()
        onCreated(
          await createSession(computerId, {
            cwd,
            provider,
            terminalBacked:
              computerProviders(
                available.find((computer) => computer.id === computerId),
              ).find((entry) => entry.id === provider)?.terminalBacked === true
                ? terminalBacked
                : false,
            allowAllPermissions,
            ...(defaultModel && defaultRuntime
              ? {
                  model: defaultModel,
                  ...(defaultRuntime.reasoningEffort
                    ? {
                        reasoningEffort: defaultRuntime.reasoningEffort,
                      }
                    : {}),
                  contextTier: defaultRuntime.contextTier,
                }
              : {}),
          }),
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
  const selectedComputer = available.find(
    (computer) => computer.id === computerId,
  )
  const providers = computerProviders(selectedComputer)
  const selectedProvider = providers.find((entry) => entry.id === provider)
  const savedDefaultRuntime = defaultRuntimes[provider]
  const defaultRuntime = providerRuntimeModels
    ? normalizedRuntimeSelection(savedDefaultRuntime, providerRuntimeModels)
    : savedDefaultRuntime
  const defaultModel = defaultRuntime?.model.trim() || ''

  return (
    <DialogFrame
      className="new-session-dialog"
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
              setProvider('copilot')
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
          <label className="field">
            <span>Agent provider</span>
            <select
              aria-label="Agent provider"
              className="dialog-select"
              onChange={(event) =>
                setProvider(event.target.value as AgentProvider)
              }
              value={provider}
            >
              {providers.map((entry) => (
                <option
                  disabled={!entry.available}
                  key={entry.id}
                  value={entry.id}
                >
                  {entry.name}
                  {entry.available ? '' : ' — unavailable'}
                </option>
              ))}
            </select>
            {!selectedProvider?.available && selectedProvider?.unavailableReason ? (
              <small className="field__hint">
                {selectedProvider.unavailableReason}
              </small>
            ) : null}
            {defaultModel ? (
              <small className="field__hint">
                New sessions use <strong>{defaultModel}</strong> with{' '}
                {defaultRuntime?.reasoningEffort ? (
                  <>
                    <strong>{defaultRuntime.reasoningEffort}</strong> effort and{' '}
                  </>
                ) : null}
                <strong>
                  {defaultRuntime?.contextTier.replace('_', ' ')}
                </strong>{' '}
                context.
              </small>
            ) : null}
            {runtimeError ? (
              <small className="field__hint">{runtimeError}</small>
            ) : null}
          </label>
        ) : null}
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
            {selectedProvider?.terminalBacked ? (
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
            ) : null}
            <label className="tmux-session-option">
              <input
                checked={allowAllPermissions}
                onChange={(event) =>
                  setAllowAllPermissions(event.target.checked)
                }
                type="checkbox"
              />
              <span>
                <strong>Allow all permissions</strong>
                <small>
                  Runs tools without asking for individual approval.
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
                  {session.title} — {providerName(session.provider)} —{' '}
                  {shortPath(session.cwd)}
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
            Boolean(defaultModel && runtimeLoading) ||
            Boolean(defaultModel && runtimeError) ||
            (mode === 'new' && !selectedProvider?.available) ||
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

function workspaceAbsolutePath(cwd: string, relativePath: string): string {
  if (relativePath === '.') {
    return cwd
  }
  return `${cwd === '/' ? '' : cwd.replace(/\/+$/, '')}/${relativePath}`
}

function ChangeDirectoryDialog({
  onChanged,
  onClose,
  session,
}: {
  onChanged: (session: ManagedSession) => void
  onClose: () => void
  session: ManagedSession
}) {
  const [listing, setListing] = useState<WorkspaceListing>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const directoryRequest = useRef(0)

  useEffect(() => {
    let active = true
    const request = ++directoryRequest.current
    setLoading(true)
    setError(undefined)
    void listWorkspace(session.computerId, session.id, '.')
      .then((nextListing) => {
        if (active && request === directoryRequest.current) {
          setListing(nextListing)
        }
      })
      .catch((caught: unknown) => {
        if (active && request === directoryRequest.current) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active && request === directoryRequest.current) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [session.computerId, session.id])

  async function browseDirectory(path: string) {
    const request = ++directoryRequest.current
    setLoading(true)
    setError(undefined)
    try {
      const nextListing = await listWorkspace(
        session.computerId,
        session.id,
        path,
      )
      if (request === directoryRequest.current) {
        setListing(nextListing)
      }
    } catch (caught) {
      if (request === directoryRequest.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === directoryRequest.current) {
        setLoading(false)
      }
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!listing) {
      return
    }
    const nextCwd = workspaceAbsolutePath(session.cwd, listing.path)
    if (/[\r\n]/.test(nextCwd)) {
      setError('Folder paths cannot contain line breaks')
      return
    }
    setSubmitting(true)
    setError(undefined)
    try {
      onChanged(
        await executeCommand(session.computerId, session.id, {
          command: `/cwd ${nextCwd}`,
          enqueue: false,
        }),
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  const directories =
    listing?.entries.filter((entry) => entry.kind === 'directory') || []
  const selectedPath = workspaceAbsolutePath(
    session.cwd,
    listing?.path || '.',
  )

  return (
    <DialogFrame
      eyebrow={`${session.computerName} · ${shortPath(session.cwd)}`}
      onClose={onClose}
      title="Change working directory"
    >
      <form onSubmit={submit}>
        <div className="folder-picker">
          <div className="folder-picker__toolbar">
            <button
              aria-label="Parent folder"
              className="icon-button"
              disabled={!listing?.parent || loading}
              onClick={() => void browseDirectory(listing?.parent || '.')}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="folder-picker__path">
              <Folder size={15} />
              <strong>{shortPath(selectedPath)}</strong>
            </div>
          </div>
          <div
            aria-label="Folders"
            className="folder-picker__list"
            role="listbox"
          >
            {loading ? (
              <p>Loading folders…</p>
            ) : directories.length ? (
              directories.map((directory) => (
                <button
                  key={directory.path}
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
            Copilot will continue in <strong>{shortPath(selectedPath)}</strong>.
          </p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={loading || !listing || submitting}
          type="submit"
        >
          {submitting ? 'Changing…' : 'Change directory'}
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
            placeholder="worker-node"
            value={name}
          />
        </label>
        <label className="field">
          <span>Node URL</span>
          <input
            className="dialog-input"
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="http://192.168.1.11:4317"
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

function normalizedRuntimeSelection(
  selection: DefaultRuntimeSelection,
  models: RuntimeModelOption[],
): DefaultRuntimeSelection | undefined {
  const modelId = selection.model.trim()
  if (!modelId) {
    return undefined
  }

  const model =
    models.find((candidate) => candidate.id === modelId) || models[0]
  if (!model) {
    return undefined
  }

  return {
    model: model.id,
    reasoningEffort:
      selection.reasoningEffort !== '' &&
      model.reasoningEfforts.includes(selection.reasoningEffort)
      ? selection.reasoningEffort
      : model.reasoningEfforts[0] || '',
    contextTier: model.contextTiers.includes(selection.contextTier)
      ? selection.contextTier
      : 'default',
  }
}

function mergeRuntimeModelOptions(
  catalogs: RuntimeModelOption[][],
): RuntimeModelOption[] {
  const merged = new Map<string, RuntimeModelOption>()
  for (const catalog of catalogs) {
    for (const model of catalog) {
      const existing = merged.get(model.id)
      if (!existing) {
        merged.set(model.id, {
          ...model,
          reasoningEfforts: [...model.reasoningEfforts],
          contextTiers: [...model.contextTiers],
          contextTokenLimits: model.contextTokenLimits
            ? { ...model.contextTokenLimits }
            : undefined,
        })
        continue
      }
      merged.set(model.id, {
        ...existing,
        description: existing.description || model.description,
        reasoningEfforts: [
          ...new Set([
            ...existing.reasoningEfforts,
            ...model.reasoningEfforts,
          ]),
        ],
        contextTiers: [
          ...new Set([...existing.contextTiers, ...model.contextTiers]),
        ],
        contextTokenLimits: {
          ...model.contextTokenLimits,
          ...existing.contextTokenLimits,
        },
      })
    }
  }
  return [...merged.values()]
}

function sameRuntimeSelection(
  left: DefaultRuntimeSelection,
  right: DefaultRuntimeSelection,
): boolean {
  return (
    left.model === right.model &&
    left.reasoningEffort === right.reasoningEffort &&
    left.contextTier === right.contextTier
  )
}

function DefaultRuntimeControls({
  error,
  loading,
  models,
  onChange,
  provider,
  selection,
}: {
  error?: string
  loading: boolean
  models: RuntimeModelOption[]
  onChange: (selection: DefaultRuntimeSelection) => void
  provider: AgentProvider
  selection: DefaultRuntimeSelection
}) {
  const name = providerName(provider)
  const selectedModel = models.find((model) => model.id === selection.model)
  const unavailableModel = selection.model.trim() && !selectedModel

  return (
    <div className="default-runtime">
      <h4>{name}</h4>
      {loading ? <p className="dialog-message">Loading models…</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && models.length === 0 ? (
        <p className="dialog-message">No models are available.</p>
      ) : null}
      {models.length > 0 ? (
        <>
          <label className="field">
            <span>Model</span>
            <select
              aria-label={`${name} default model`}
              className="dialog-select"
              onChange={(event) => {
                if (!event.target.value) {
                  onChange({ ...emptyRuntimeSelection })
                  return
                }
                const model = models.find(
                  (candidate) => candidate.id === event.target.value,
                )
                if (!model) {
                  return
                }
                onChange({
                  model: model.id,
                  reasoningEffort: model.reasoningEfforts[0] || '',
                  contextTier: 'default',
                })
              }}
              value={selection.model.trim()}
            >
              <option value="">Provider default</option>
              {unavailableModel ? (
                <option value={selection.model.trim()}>
                  {selection.model.trim()} (unavailable)
                </option>
              ) : null}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>
          {selectedModel?.description ? (
            <div className="default-runtime__description">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedModel.description}
              </ReactMarkdown>
            </div>
          ) : null}
          {selectedModel && selectedModel.reasoningEfforts.length > 0 ? (
            <label className="field">
              <span>Reasoning effort</span>
              <select
                aria-label={`${name} default reasoning effort`}
                className="dialog-select"
                onChange={(event) =>
                  isRuntimeReasoningEffort(event.target.value)
                    ? onChange({
                        ...selection,
                        reasoningEffort: event.target.value,
                      })
                    : undefined
                }
                value={selection.reasoningEffort}
              >
                {selectedModel.reasoningEfforts.map((effort) => (
                  <option key={effort} value={effort}>
                    {effort}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {selectedModel ? (
            <label className="field">
              <span>Context size</span>
              <select
                aria-label={`${name} default context size`}
                className="dialog-select"
                onChange={(event) =>
                  onChange({
                    ...selection,
                    contextTier: event.target.value as
                      | 'default'
                      | 'long_context',
                  })
                }
                value={selection.contextTier}
              >
                {selectedModel.contextTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {contextSizeLabel(selectedModel, tier)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function AppSettingsDialog({
  open,
  computers,
  onClose,
  onApplyUpdate,
  onUpdateReady,
  defaultRuntimes,
  onDefaultRuntimesChange,
  statusline,
  onStatuslineChange,
  updateRegistration,
  updatingApp,
}: {
  open: boolean
  computers: ComputerSummary[]
  onClose: () => void
  onApplyUpdate: () => void
  onUpdateReady: (registration: ServiceWorkerRegistration) => void
  defaultRuntimes: DefaultRuntimeSettings
  onDefaultRuntimesChange: (settings: DefaultRuntimeSettings) => void
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
  const [runtimeModels, setRuntimeModels] = useState<
    Partial<Record<AgentProvider, RuntimeModelOption[]>>
  >({})
  const [runtimeCatalogsComplete, setRuntimeCatalogsComplete] = useState<
    Partial<Record<AgentProvider, boolean>>
  >({})
  const [runtimeLoading, setRuntimeLoading] = useState(false)
  const [runtimeErrors, setRuntimeErrors] = useState<
    Partial<Record<AgentProvider, string>>
  >({})
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
    void activePushSubscription()
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

  useEffect(() => {
    if (!open) {
      return
    }
    let active = true
    const providers: AgentProvider[] = ['copilot', 'claude']
    const sources = providers.flatMap((provider) => {
      const providerComputers = computers.filter(
        (candidate) =>
          candidate.online &&
          computerProviders(candidate).some(
            (capability) =>
              capability.id === provider && capability.available,
          ),
      )
      return providerComputers.map((computer) => ({ provider, computer }))
    })
    setRuntimeLoading(true)
    setRuntimeModels({})
    setRuntimeCatalogsComplete({})
    setRuntimeErrors(
      Object.fromEntries(
        providers
          .filter(
            (provider) =>
              !sources.some((source) => source.provider === provider),
          )
          .map((provider) => [
            provider,
            `${providerName(provider)} is not available on an online computer.`,
          ]),
      ),
    )
    void Promise.allSettled(
      sources.map(async ({ provider, computer }) => ({
        provider,
        options: await getProviderRuntimeOptions(computer.id, provider),
      })),
    ).then((results) => {
      if (!active) {
        return
      }
      const models: Partial<Record<AgentProvider, RuntimeModelOption[]>> = {}
      const complete: Partial<Record<AgentProvider, boolean>> = {}
      const errors: Partial<Record<AgentProvider, string>> = {}
      for (const provider of providers) {
        const providerResults = results.filter(
          (_result, index) => sources[index].provider === provider,
        )
        const catalogs = providerResults.flatMap((result) =>
          result.status === 'fulfilled'
            ? [result.value.options.models]
            : [],
        )
        if (catalogs.length > 0) {
          models[provider] = mergeRuntimeModelOptions(catalogs)
          complete[provider] = providerResults.every(
            (result) => result.status === 'fulfilled',
          )
        } else if (providerResults.length === 0) {
          errors[provider] =
            `${providerName(provider)} is not available on an online computer.`
        } else {
          const failure = providerResults.find(
            (result) => result.status === 'rejected',
          )
          errors[provider] =
            failure?.status === 'rejected'
              ? failure.reason instanceof Error
                ? failure.reason.message
                : String(failure.reason)
              : `Unable to load ${providerName(provider)} models.`
        }
      }
      setRuntimeModels(models)
      setRuntimeCatalogsComplete(complete)
      setRuntimeErrors(errors)
      setRuntimeLoading(false)
    })
    return () => {
      active = false
    }
  }, [computers, open])

  useEffect(() => {
    let changed = false
    const next = { ...defaultRuntimes }
    for (const provider of ['copilot', 'claude'] as const) {
      const models = runtimeModels[provider]
      if (!models || !runtimeCatalogsComplete[provider]) {
        continue
      }
      const normalized = normalizedRuntimeSelection(
        defaultRuntimes[provider],
        models,
      )
      if (
        normalized &&
        !sameRuntimeSelection(normalized, defaultRuntimes[provider])
      ) {
        next[provider] = normalized
        changed = true
      }
    }
    if (changed) {
      onDefaultRuntimesChange(next)
    }
  }, [
    defaultRuntimes,
    onDefaultRuntimesChange,
    runtimeCatalogsComplete,
    runtimeModels,
  ])

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
        onUpdateReady(registration.registration)
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
        <h3>Session defaults</h3>
        <p className="dialog-message">
          New sessions use these provider settings. Existing sessions keep
          their current model, effort, and context.
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
      </section>

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

function initialUserInputValues(
  form: PendingUserInput['form'],
): Record<string, UserInputFieldValue> {
  const values: Record<string, UserInputFieldValue> = {}
  for (const field of form?.fields || []) {
    if (field.default !== undefined) {
      values[field.name] = field.default
    } else if (field.type === 'boolean') {
      values[field.name] = false
    } else if (field.type === 'array') {
      values[field.name] = []
    }
  }
  return values
}

function userInputFieldHasValue(
  field: UserInputField,
  value: UserInputFieldValue | undefined,
): boolean {
  if (value === undefined) {
    return false
  }
  if (field.type === 'string') {
    return typeof value === 'string' && value.trim().length > 0
  }
  if (field.type === 'array') {
    return (
      Array.isArray(value) &&
      (field.minItems === undefined || value.length >= field.minItems)
    )
  }
  return true
}

function UserInputFieldControl({
  field,
  value,
  disabled,
  onChange,
}: {
  field: UserInputField
  value: UserInputFieldValue | undefined
  disabled: boolean
  onChange: (value: UserInputFieldValue | undefined) => void
}) {
  const [optionIndex, setOptionIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const requiredMark = field.required ? ' *' : ''
  const options = field.options || []
  const selectedIndex =
    typeof value === 'string'
      ? options.findIndex((option) => option.value === value)
      : -1

  useEffect(() => {
    if (menuOpen) {
      setOptionIndex(selectedIndex >= 0 ? selectedIndex : 0)
      menuRef.current?.focus()
    }
  }, [menuOpen, selectedIndex])

  function moveOption(direction: 1 | -1) {
    if (options.length === 0) {
      return
    }
    setOptionIndex(
      (current) => (current + direction + options.length) % options.length,
    )
  }

  function chooseOption(index: number) {
    const option = options[index]
    if (!option) {
      return
    }
    onChange(option.value)
    setMenuOpen(false)
    triggerRef.current?.focus()
  }

  function optionDirection(event: KeyboardEvent): 1 | -1 | undefined {
    const key = event.key.toLowerCase()
    const plainVimKey =
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey
    if (
      event.key === 'ArrowDown' ||
      (plainVimKey && key === 'j') ||
      (event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        key === 'n')
    ) {
      return 1
    }
    if (
      event.key === 'ArrowUp' ||
      (plainVimKey && key === 'k') ||
      (event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        key === 'p')
    ) {
      return -1
    }
    return undefined
  }

  function toggleOption(option: string) {
    const selected = Array.isArray(value) ? value : []
    onChange(
      selected.includes(option)
        ? selected.filter((entry) => entry !== option)
        : [...selected, option],
    )
  }

  function handleMultiSelectKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = optionDirection(event)
    if (direction) {
      event.preventDefault()
      moveOption(direction)
      return
    }
    if (event.key === ' ' && event.target !== event.currentTarget) {
      return
    }
    if (event.key === ' ') {
      event.preventDefault()
      const option = options[optionIndex]
      if (option) {
        toggleOption(option.value)
      }
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const direction = optionDirection(event)
    if (direction) {
      event.preventDefault()
      if (!menuOpen) {
        setMenuOpen(true)
      } else {
        moveOption(direction)
      }
      return
    }
    if (event.key === 'Escape') {
      if (menuOpen) {
        event.preventDefault()
        event.stopPropagation()
        setMenuOpen(false)
      }
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!menuOpen) {
        setMenuOpen(true)
      } else {
        chooseOption(optionIndex)
      }
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = optionDirection(event)
    if (direction) {
      event.preventDefault()
      moveOption(direction)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setMenuOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (event.key === 'Tab') {
      setMenuOpen(false)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      chooseOption(optionIndex)
    }
  }

  if (field.type === 'boolean') {
    return (
      <label className="user-input-card__field user-input-card__field--checkbox">
        <input
          checked={value === true}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>
          <strong>
            {field.title}
            {requiredMark}
          </strong>
          {field.description ? <small>{field.description}</small> : null}
        </span>
      </label>
    )
  }

  if (field.type === 'array' && options.length > 0) {
    const selected = Array.isArray(value) ? value : []
    return (
      <fieldset className="user-input-card__field">
        <legend>
          {field.title}
          {requiredMark}
        </legend>
        {field.description ? (
          <small className="user-input-card__field-description">
            {field.description}
          </small>
        ) : null}
        <div
          aria-label={`${field.title} options`}
          aria-keyshortcuts="ArrowDown ArrowUp j k Control+N Control+P Space"
          className="user-input-card__field-options"
          onKeyDown={handleMultiSelectKeyDown}
          role="group"
          tabIndex={0}
        >
          {options.map((option, index) => (
            <label
              className={`user-input-card__option ${
                index === optionIndex
                  ? 'user-input-card__option--highlighted'
                  : ''
              }`}
              key={`${field.name}:${option.value}`}
              onMouseEnter={() => setOptionIndex(index)}
            >
              <input
                checked={selected.includes(option.value)}
                disabled={disabled}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, option.value]
                      : selected.filter((entry) => entry !== option.value),
                  )
                }
                type="checkbox"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (options.length > 0) {
    return (
      <div className="user-input-card__field">
        <span>
          <strong>
            {field.title}
            {requiredMark}
          </strong>
          {field.description ? <small>{field.description}</small> : null}
        </span>
        <div className="user-input-card__select">
          <button
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            aria-label={field.title}
            aria-keyshortcuts="ArrowDown ArrowUp j k Control+N Control+P Enter Space Escape"
            className="user-input-card__select-trigger"
            disabled={disabled}
            onClick={() => setMenuOpen((current) => !current)}
            onKeyDown={handleTriggerKeyDown}
            ref={triggerRef}
            type="button"
          >
            <span>{options[selectedIndex]?.label || 'Select an option…'}</span>
            <ChevronDown aria-hidden="true" size={15} />
          </button>
          {menuOpen ? (
            <div
              aria-label={`${field.title} options`}
              aria-keyshortcuts="ArrowDown ArrowUp j k Control+N Control+P Enter Space Escape"
              className="user-input-card__select-menu"
              onKeyDown={handleMenuKeyDown}
              ref={menuRef}
              role="listbox"
              tabIndex={0}
            >
              {options.map((option, index) => (
                <button
                  aria-selected={index === selectedIndex}
                  className={`user-input-card__select-option ${
                    index === selectedIndex
                      ? 'user-input-card__select-option--selected'
                      : ''
                  } ${
                    index === optionIndex
                      ? 'user-input-card__select-option--highlighted'
                      : ''
                  }`}
                  key={`${field.name}:${option.value}`}
                  onClick={() => chooseOption(index)}
                  onMouseEnter={() => setOptionIndex(index)}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const inputType =
    field.type === 'number' || field.type === 'integer'
      ? 'number'
      : field.format === 'email'
        ? 'email'
        : field.format === 'uri'
          ? 'url'
          : field.format === 'date'
            ? 'date'
            : field.format === 'date-time'
              ? 'datetime-local'
              : 'text'
  const inputValue =
    typeof value === 'string' || typeof value === 'number' ? String(value) : ''
  return (
    <label className="user-input-card__field">
      <span>
        <strong>
          {field.title}
          {requiredMark}
        </strong>
        {field.description ? <small>{field.description}</small> : null}
      </span>
      <input
        aria-label={field.title}
        disabled={disabled}
        max={field.maximum}
        maxLength={field.maxLength}
        min={field.minimum}
        minLength={field.minLength}
        onChange={(event) => {
          const next = event.target.value
          if (!next) {
            onChange(field.type === 'array' ? [] : undefined)
          } else if (field.type === 'array') {
            onChange(
              next
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean),
            )
          } else if (field.type === 'number' || field.type === 'integer') {
            const numeric = Number(next)
            onChange(Number.isFinite(numeric) ? numeric : undefined)
          } else {
            onChange(next)
          }
        }}
        placeholder={field.type === 'array' ? 'value 1, value 2' : undefined}
        required={field.required}
        step={field.type === 'integer' ? 1 : undefined}
        type={inputType}
        value={inputValue}
      />
    </label>
  )
}

function UserInputCard({
  request,
  disabled,
  onReply,
}: {
  request: PendingUserInput
  disabled: boolean
  onReply: (input: UserInputReplyInput) => void
}) {
  const [answer, setAnswer] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [values, setValues] = useState<Record<string, UserInputFieldValue>>(
    () => initialUserInputValues(request.form),
  )

  useEffect(() => {
    setSelected([])
    setAnswer('')
    setValues(initialUserInputValues(request.form))
  }, [request.requestId, request.form])

  if (request.form) {
    const canSubmit = request.form.fields.every(
      (field) =>
        !field.required || userInputFieldHasValue(field, values[field.name]),
    )
    return (
      <section className="user-input-card">
        <p className="eyebrow">Agent input</p>
        <h3>{request.question}</h3>
        <form
          aria-keyshortcuts="Control+Enter Enter Escape"
          className="user-input-card__structured-form"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onReply({
                action: 'cancel',
                answer: '',
                wasFreeform: false,
              })
              return
            }
            const target =
              event.target instanceof HTMLElement
                ? event.target
                : undefined
            const inMultiSelect = Boolean(target?.closest('[role="group"]'))
            if (
              event.key === 'Enter' &&
              (event.ctrlKey || event.metaKey || inMultiSelect)
            ) {
              event.preventDefault()
              if (canSubmit) {
                event.currentTarget.requestSubmit()
              }
            }
          }}
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSubmit) {
              return
            }
            const content: Record<string, UserInputFieldValue> = {}
            for (const field of request.form?.fields || []) {
              const value = values[field.name]
              if (value !== undefined) {
                content[field.name] = value
              }
            }
            onReply({
              answer: JSON.stringify(content),
              wasFreeform: false,
              values: content,
            })
          }}
        >
          <p className="user-input-card__shortcut-hint">
            ↑/↓ or j/k navigate · Ctrl+P/N move · Space select · Enter submit ·
            Esc cancel
          </p>
          <div className="user-input-card__fields">
            {request.form.fields.map((field) => (
              <UserInputFieldControl
                disabled={disabled}
                field={field}
                key={field.name}
                onChange={(value) =>
                  setValues((current) => {
                    const next = { ...current }
                    if (value === undefined) {
                      delete next[field.name]
                    } else {
                      next[field.name] = value
                    }
                    return next
                  })
                }
                value={values[field.name]}
              />
            ))}
          </div>
          <div className="user-input-card__actions">
            <button
              className="primary-button"
              disabled={disabled || !canSubmit}
              type="submit"
            >
              Submit
            </button>
            <button
              className="secondary-button"
              disabled={disabled}
              onClick={() =>
                onReply({
                  action: 'cancel',
                  answer: '',
                  wasFreeform: false,
                })
              }
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    )
  }

  const multiSelect = request.multiSelect === true

  return (
    <section className="user-input-card">
      <p className="eyebrow">Agent question</p>
      <h3>{request.question}</h3>
      {multiSelect && request.choices.length > 0 ? (
        <div className="user-input-card__options">
          {request.choices.map((choice) => (
            <label className="user-input-card__option" key={choice}>
              <input
                checked={selected.includes(choice)}
                disabled={disabled}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, choice]
                      : current.filter((value) => value !== choice),
                  )
                }
                type="checkbox"
              />
              <span>{choice}</span>
            </label>
          ))}
          <button
            className="primary-button"
            disabled={disabled || selected.length === 0}
            onClick={() =>
              onReply({
                answer: selected.join(', '),
                wasFreeform: false,
                answers: selected,
              })
            }
            type="button"
          >
            Answer
          </button>
        </div>
      ) : null}
      {!multiSelect && request.choices.length > 0 ? (
        <div className="user-input-card__choices">
          {request.choices.map((choice) => (
            <button
              className="secondary-button"
              disabled={disabled}
              key={choice}
              onClick={() => onReply({ answer: choice, wasFreeform: false })}
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
              onReply({ answer: answer.trim(), wasFreeform: true })
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
  const isMcp = title.startsWith('MCP ·')
  const icon =
    status === 'failed' ? (
      <XCircle size={14} />
    ) : status === 'completed' ? (
      <CheckCircle2 size={14} />
    ) : (
      <LoaderCircle className="activity-message__spinner" size={14} />
    )
  return (
    <div
      className={`activity-message activity-message--${status || 'running'}${
        isMcp ? ' activity-message--mcp' : ''
      }`}
    >
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
      <p>Choose a computer and continue a Copilot or Claude Agent conversation.</p>
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
        <span className="session-item__badges">
          <em className="provider-badge">
            {session.provider === 'claude' ? 'Claude' : 'Copilot'}
          </em>
          {executionModeName(session.executionMode) ? (
            <em className="provider-badge session-mode-badge">
              {executionModeName(session.executionMode)}
            </em>
          ) : null}
        </span>
        <strong>
          {session.title}
        </strong>
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
  const [runtimeStatus, setRuntimeStatus] =
    useState<ManagedSession['status']>()
  const computerId = session?.computerId
  const sessionId = session?.id
  const sessionStatus = session?.status

  useEffect(() => {
    if (!open || !computerId || !sessionId) {
      return
    }
    let active = true
    setLoading(true)
    setOptions(undefined)
    setConfiguration(undefined)
    setRuntimeStatus(sessionStatus)
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
        setRuntimeStatus(loaded.status || sessionStatus)
        if (model) {
          setConfiguration({
            model: model.id,
            reasoningEffort:
              isRuntimeReasoningEffort(loaded.current.reasoningEffort) &&
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
            mode:
              loaded.current.mode === 'plan' ||
              loaded.current.mode === 'autopilot'
                ? loaded.current.mode
                : 'interactive',
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
  }, [computerId, open, sessionId, sessionStatus])

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
    if (runtimeStatus !== 'idle') {
      setError('Runtime settings can only change while the session is idle')
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
      eyebrow={`${providerName(session.provider)} runtime`}
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
                  mode: configuration.mode,
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
          {selectedModel.reasoningEfforts.length > 0 ? (
            <label className="field">
              <span>Reasoning effort</span>
              <select
                className="dialog-select"
                onChange={(event) => {
                  if (isRuntimeReasoningEffort(event.target.value)) {
                    setConfiguration({
                      ...configuration,
                      reasoningEffort: event.target.value,
                    })
                  }
                }}
                value={configuration.reasoningEffort}
              >
                {selectedModel.reasoningEfforts.map((effort) => (
                  <option key={effort} value={effort}>
                    {effort}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
                  {contextSizeLabel(selectedModel, tier)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Agent mode</span>
            <select
              className="dialog-select"
              onChange={(event) =>
                setConfiguration({
                  ...configuration,
                  mode: event.target.value as
                    | 'interactive'
                    | 'plan'
                    | 'autopilot',
                })
              }
              value={configuration.mode || 'interactive'}
            >
              <option value="interactive">Interactive</option>
              <option value="plan">Plan</option>
              <option value="autopilot">
                {session.provider === 'claude' ? 'Auto' : 'Autopilot'}
              </option>
            </select>
          </label>
          <p className="runtime-dialog__hint">
            {session.provider === 'claude'
              ? 'Claude settings apply to the next turn. Change settings only while the agent is idle.'
              : 'Tmux sessions restart their Copilot pane with the same session ID. Change settings only while the agent is idle.'}
          </p>
          {runtimeStatus !== 'idle' ? (
            <p className="form-error" role="status">
              Finish or stop the current response before changing runtime
              settings.
            </p>
          ) : null}
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="primary-button dialog__submit"
            disabled={submitting || runtimeStatus !== 'idle'}
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

function PdfViewer({ file }: { file: WorkspaceFile }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!file.base64) {
      return
    }
    let active = true
    let cancelRender: (() => void) | undefined
    let destroyDocument: (() => Promise<void>) | undefined
    setError(undefined)
    const data = Uint8Array.from(atob(file.base64), (character) =>
      character.charCodeAt(0),
    )
    void import('pdfjs-dist')
      .then(async (pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()
        const loadingTask = pdfjs.getDocument({ data })
        destroyDocument = () => loadingTask.destroy()
        const document = await loadingTask.promise
        if (!active) return
        setPageCount(document.numPages)
        const pdfPage = await document.getPage(page)
        if (!active || !canvasRef.current) return
        const viewport = pdfPage.getViewport({ scale: 1.25 })
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Canvas rendering is not available')
        }
        canvas.width = viewport.width
        canvas.height = viewport.height
        const renderTask = pdfPage.render({
          canvas,
          canvasContext: context,
          viewport,
        })
        cancelRender = () => renderTask.cancel()
        await renderTask.promise
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
    return () => {
      active = false
      cancelRender?.()
      void destroyDocument?.()
    }
  }, [file.base64, page])

  useEffect(() => {
    setPage(1)
  }, [file.path])

  return (
    <div className="pdf-viewer">
      {error ? <p className="form-error">{error}</p> : null}
      <canvas ref={canvasRef} />
      {pageCount > 1 ? (
        <div className="pdf-viewer__controls">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            disabled={page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Slugs come from the heading text alone so an id stays stable across
 * re-renders; a render-time counter would renumber on every pass.
 */
function AddKnowledgeRootDialog({
  computers,
  onClose,
  onCreate,
}: {
  computers: ComputerSummary[]
  onClose: () => void
  onCreate: (computerId: string, path: string) => Promise<void>
}) {
  const online = computers.filter((computer) => computer.online)
  const [computerId, setComputerId] = useState(online[0]?.id || '')
  const [listing, setListing] = useState<DirectoryListing>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  async function browse(path: string) {
    if (!computerId) {
      return
    }
    setLoading(true)
    setError(undefined)
    try {
      setListing(await listDirectories(computerId, path, 'all'))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    void listDirectories(computerId, '~', 'all')
      .then((next) => {
        if (active) {
          setListing(next)
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
  }, [computerId])

  return (
    <DialogFrame
      className="add-root-dialog"
      eyebrow="Any folder on the computer"
      onClose={onClose}
      title="Add knowledge root"
    >
      <label className="dialog-field">
        <span>Computer</span>
        <select
          className="dialog-select"
          onChange={(event) => setComputerId(event.target.value)}
          value={computerId}
        >
          {online.map((computer) => (
            <option key={computer.id} value={computer.id}>
              {computer.name}
            </option>
          ))}
        </select>
      </label>
      <p className="dialog-message">{listing?.path || 'Loading…'}</p>
      <div className="add-root-dialog__list">
        {listing?.parent !== undefined ? (
          <button
            className="workspace-entry"
            disabled={loading}
            onClick={() => void browse(listing.parent || '~')}
            type="button"
          >
            <ArrowUp size={15} />
            <span>
              <strong>Parent folder</strong>
            </span>
          </button>
        ) : null}
        {listing?.directories.map((directory) => (
          <button
            className="workspace-entry"
            disabled={loading}
            key={directory.path}
            onClick={() => void browse(directory.path)}
            type="button"
          >
            <FolderOpen size={15} />
            <span>
              <strong>{directory.name}</strong>
            </span>
          </button>
        ))}
      </div>
      {error ? <p className="dialog-error">{error}</p> : null}
      <div className="dialog-actions">
        <button className="secondary-button" onClick={onClose} type="button">
          Cancel
        </button>
        <button
          className="primary-button"
          disabled={!listing || submitting || loading}
          onClick={() => {
            if (!listing) {
              return
            }
            setSubmitting(true)
            setError(undefined)
            void onCreate(computerId, listing.path)
              .catch((caught: unknown) =>
                setError(
                  caught instanceof Error ? caught.message : String(caught),
                ),
              )
              .finally(() => setSubmitting(false))
          }}
          type="button"
        >
          {submitting ? 'Adding…' : 'Add this folder'}
        </button>
      </div>
    </DialogFrame>
  )
}

function WorkspaceImage({ file }: { file: WorkspaceFile }) {
  if (!file.base64) {
    return <p className="workspace-preview__empty">This image cannot be shown.</p>
  }
  return (
    <img
      alt={file.name}
      className="workspace-image"
      src={`data:${file.mimeType};base64,${file.base64}`}
    />
  )
}

type MarkdownImageLoader = (path: string) => Promise<WorkspaceFile>

/**
 * Markdown images live beside their document, so a relative source has to be
 * resolved against it and fetched through the owning computer. The bytes are
 * rendered as a data URL: there is no same-origin asset URL to navigate to,
 * which keeps a scripted SVG inert.
 */
function MarkdownImage({
  alt,
  documentPath,
  load,
  src,
  title,
}: {
  alt?: string
  documentPath: string
  load: MarkdownImageLoader
  src?: string
  title?: string
}) {
  // The loaded target is stored alongside the result so a changed source is
  // simply stale rather than needing a synchronous reset.
  const [loaded, setLoaded] = useState<{
    target: string
    source?: string
  }>()
  const target = src && !isExternalSource(src)
    ? resolveDocumentPath(documentPath, src)
    : undefined

  useEffect(() => {
    if (!target) {
      return
    }
    let active = true
    void load(target)
      .then((file) => {
        if (active) {
          setLoaded({
            target,
            source: file.base64
              ? `data:${file.mimeType};base64,${file.base64}`
              : undefined,
          })
        }
      })
      .catch(() => {
        if (active) {
          setLoaded({ target })
        }
      })
    return () => {
      active = false
    }
  }, [load, target])

  const current = loaded?.target === target ? loaded : undefined
  const failed = current !== undefined && current.source === undefined
  const source = current?.source

  if (src && isExternalSource(src)) {
    return <img alt={alt || ''} loading="lazy" src={src} title={title} />
  }
  if (!target || failed) {
    // Degrade to the alt text instead of a broken image.
    return <span className="markdown-image markdown-image--missing">{alt || src}</span>
  }
  if (!source) {
    return <span className="markdown-image markdown-image--loading">{alt || 'Loading image…'}</span>
  }
  return <img alt={alt || ''} loading="lazy" src={source} title={title} />
}

function markdownComponentsFor(
  documentPath: string,
  load: MarkdownImageLoader,
) {
  return {
    ...knowledgeHeadingComponents,
    img({ alt, src, title }: { alt?: string; src?: unknown; title?: string }) {
      return (
        <MarkdownImage
          alt={alt}
          documentPath={documentPath}
          load={load}
          src={typeof src === 'string' ? src : undefined}
          title={title}
        />
      )
    },
  }
}

function markdownHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return function Heading({ children }: { children?: ReactNode }) {
    const Tag = `h${level}` as const
    return <Tag id={headingSlug(headingText(children))}>{children}</Tag>
  }
}

const knowledgeHeadingComponents = {
  h1: markdownHeading(1),
  h2: markdownHeading(2),
  h3: markdownHeading(3),
  h4: markdownHeading(4),
  h5: markdownHeading(5),
  h6: markdownHeading(6),
}

function KnowledgeReader({
  file,
  listing,
  loading,
  root,
  onOpenFolder,
  onLoadAsset,
}: {
  file?: WorkspaceFile
  listing?: WorkspaceListing
  loading: boolean
  root: KnowledgeRoot
  onOpenFolder: (path: string) => void
  onLoadAsset: MarkdownImageLoader
}) {
  const [raw, setRaw] = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Raw and outline state reset through the component key, so this only has
    // to put the new document back at the top.
    const frame = requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [file?.path])

  const outline = useMemo<DocumentHeading[]>(
    () =>
      file?.kind === 'markdown' && !raw
        ? outlineFromMarkdown(file.content || '')
        : [],
    [file, raw],
  )
  const crumbs = breadcrumbSegments(file?.path ?? listing?.path ?? '.', root.name)
  const components = useMemo(
    () => markdownComponentsFor(file?.path || '.', onLoadAsset),
    [file?.path, onLoadAsset],
  )

  if (!file) {
    return (
      <div className="knowledge-reader knowledge-reader--empty">
        <BookOpen size={26} />
        <p>
          {loading
            ? 'Loading…'
            : 'Select a Markdown, text, or PDF file to read it here.'}
        </p>
      </div>
    )
  }

  return (
    <div className="knowledge-reader">
      <div className="workspace-preview__header">
        <div>
          <strong>{file.name}</strong>
          <small>
            {root.computerName} · {root.path}/{file.path}
          </small>
        </div>
        {outline.length > 1 ? (
          <button
            aria-expanded={outlineOpen}
            aria-label="Document outline"
            onClick={() => setOutlineOpen(!outlineOpen)}
            type="button"
          >
            <List size={15} />
          </button>
        ) : null}
        {file.kind === 'markdown' ? (
          <button onClick={() => setRaw(!raw)} type="button">
            {raw ? 'Rendered' : 'Raw'}
          </button>
        ) : null}
      </div>
      <nav
        aria-label="Knowledge breadcrumb"
        className="workspace-crumbs knowledge-reader__crumbs"
      >
        {crumbs.map((crumb, index) => (
          <span key={crumb.path}>
            {index > 0 ? (
              <span aria-hidden="true" className="workspace-crumbs__sep">
                /
              </span>
            ) : null}
            <button
              aria-current={index === crumbs.length - 1 ? 'page' : undefined}
              disabled={loading}
              onClick={() => {
                if (index === crumbs.length - 1) {
                  return
                }
                onOpenFolder(crumb.path)
              }}
              type="button"
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>
      {outlineOpen && outline.length > 0 ? (
        <nav aria-label="Document outline" className="workspace-outline">
          {outline.map((heading) => (
            <button
              className={`workspace-outline__item workspace-outline__item--${Math.min(
                heading.level,
                3,
              )}`}
              key={`${heading.index}-${heading.id}`}
              onClick={() => {
                contentRef.current
                  ?.querySelectorAll('h1, h2, h3, h4, h5, h6')
                  ?.[heading.index]?.scrollIntoView({ block: 'start' })
                setOutlineOpen(false)
              }}
              type="button"
            >
              {heading.text}
            </button>
          ))}
        </nav>
      ) : null}
      <div
        className={`workspace-preview__content${
          file.kind === 'markdown' && !raw ? ' markdown-body' : ''
        }`}
        ref={contentRef}
      >
        {file.kind === 'pdf' ? (
          <PdfViewer file={file} />
        ) : file.kind === 'image' ? (
          <WorkspaceImage file={file} />
        ) : file.kind === 'markdown' && !raw ? (
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
          >
            {file.content || ''}
          </ReactMarkdown>
        ) : (
          <pre>{file.content}</pre>
        )}
      </div>
    </div>
  )
}

function WorkspaceDialog({
  initialKind,
  initialPath,
  session,
  onClose,
  onInsert,
  onMoved,
}: {
  initialKind?: 'file' | 'folder'
  initialPath?: string
  session: ManagedSession
  onClose: () => void
  onInsert: (file: WorkspaceFile, ask: boolean) => void
  onMoved: (session: ManagedSession) => void
}) {
  const [listing, setListing] = useState<WorkspaceListing>()
  const [file, setFile] = useState<WorkspaceFile>()
  const [raw, setRaw] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<WorkspaceSearchResult[]>()
  const [loading, setLoading] = useState(true)
  const [moving, setMoving] = useState(false)
  const [error, setError] = useState<string>()
  const [directoryHistory, setDirectoryHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const previewContentRef = useRef<HTMLDivElement>(null)
  const workspaceRequest = useRef(0)
  const directoryHistoryRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const [documentHistory, setDocumentHistory] = useState<NavigationEntry[]>([])
  const [documentIndex, setDocumentIndex] = useState(-1)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const documentHistoryRef = useRef<NavigationEntry[]>([])
  const documentIndexRef = useRef(-1)
  const pendingScrollRef = useRef<number | undefined>(undefined)

  const updateDocumentHistory = useCallback(
    (history: NavigationEntry[], index: number) => {
      documentHistoryRef.current = history
      documentIndexRef.current = index
      setDocumentHistory(history)
      setDocumentIndex(index)
    },
    [],
  )

  const updateDirectoryHistory = useCallback(
    (history: string[], index: number) => {
      directoryHistoryRef.current = history
      historyIndexRef.current = index
      setDirectoryHistory(history)
      setHistoryIndex(index)
    },
    [],
  )

  const openDirectory = useCallback(
    async (
      path = '.',
      navigation:
        | { kind: 'history'; index: number }
        | { kind: 'push' | 'refresh' | 'reset' } = { kind: 'push' },
    ) => {
      const request = ++workspaceRequest.current
      setLoading(true)
      setError(undefined)
      setFile(undefined)
      setResults(undefined)
      try {
        const nextListing = await listWorkspace(
          session.computerId,
          session.id,
          path,
        )
        if (request !== workspaceRequest.current) {
          return false
        }
        setListing(nextListing)
        if (navigation.kind === 'reset') {
          updateDirectoryHistory([nextListing.path], 0)
        } else if (navigation.kind === 'history') {
          updateDirectoryHistory(
            directoryHistoryRef.current,
            navigation.index,
          )
        } else if (navigation.kind === 'push') {
          const current = directoryHistoryRef.current
          const currentIndex = historyIndexRef.current
          if (current[currentIndex] !== nextListing.path) {
            const next = [
              ...current.slice(0, currentIndex + 1),
              nextListing.path,
            ]
            updateDirectoryHistory(next, next.length - 1)
          }
        }
        return true
      } catch (caught) {
        if (request === workspaceRequest.current) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
        return false
      } finally {
        if (request === workspaceRequest.current) {
          setLoading(false)
        }
      }
    },
    [session.computerId, session.id, updateDirectoryHistory],
  )

  const openFile = useCallback(
    async (path: string, restoreScroll?: number): Promise<boolean> => {
      const request = ++workspaceRequest.current
      setLoading(true)
      setError(undefined)
      try {
        const nextFile = await readWorkspaceFile(
          session.computerId,
          session.id,
          path,
        )
        if (request === workspaceRequest.current) {
          if (restoreScroll === undefined) {
            // Remember where the reader was before leaving the current entry.
            // The preview may already be unmounted (Back to files), in which
            // case the offset recorded while scrolling is still the right one.
            const leaving = previewContentRef.current
            const remembered = leaving
              ? rememberScroll(
                  documentHistoryRef.current,
                  documentIndexRef.current,
                  leaving.scrollTop,
                )
              : documentHistoryRef.current
            const pushed = pushNavigation(remembered, documentIndexRef.current, {
              path,
              kind: 'file',
            })
            updateDocumentHistory(pushed.history, pushed.index)
          }
          pendingScrollRef.current = restoreScroll
          setFile(nextFile)
          setRaw(false)
          setOutlineOpen(false)
          return true
        }
        return false
      } catch (caught) {
        if (request === workspaceRequest.current) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
        return false
      } finally {
        if (request === workspaceRequest.current) {
          setLoading(false)
        }
      }
    },
    [session.computerId, session.id, updateDocumentHistory],
  )

  function rememberCurrentScroll() {
    const element = previewContentRef.current
    const index = documentIndexRef.current
    const history = documentHistoryRef.current
    if (!element || !history[index]) {
      return
    }
    // Mutating the mirror keeps Back accurate without re-rendering on scroll.
    history[index] = { ...history[index], scrollTop: element.scrollTop }
  }

  function navigateDocument(index: number) {
    const entry = documentHistoryRef.current[index]
    if (!entry || loading) {
      return
    }
    const leaving = previewContentRef.current
    const remembered = leaving
      ? rememberScroll(
          documentHistoryRef.current,
          documentIndexRef.current,
          leaving.scrollTop,
        )
      : documentHistoryRef.current
    updateDocumentHistory(remembered, documentIndexRef.current)
    void openFile(entry.path, entry.scrollTop ?? 0).then((opened) => {
      // Move the cursor only after the document is actually on screen,
      // otherwise a failed read leaves the index pointing at the wrong entry.
      if (opened) {
        updateDocumentHistory(documentHistoryRef.current, index)
      }
    })
  }

  function navigateHistory(index: number) {
    const path = directoryHistoryRef.current[index]
    if (!path || loading) {
      return
    }
    void openDirectory(path, { kind: 'history', index })
  }

  async function submitSearch(event: FormEvent) {
    event.preventDefault()
    if (search.trim().length < 2) return
    const request = ++workspaceRequest.current
    setLoading(true)
    setError(undefined)
    setFile(undefined)
    try {
      const response = await searchWorkspace(
        session.computerId,
        session.id,
        search,
        listing?.path,
      )
      if (request === workspaceRequest.current) {
        setResults(response.results)
      }
    } catch (caught) {
      if (request === workspaceRequest.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === workspaceRequest.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    updateDirectoryHistory([], -1)
    void (async () => {
      if (!initialPath) {
        await openDirectory('.', { kind: 'reset' })
        return
      }
      if (initialKind === 'folder') {
        await openDirectory(initialPath, { kind: 'reset' })
        return
      }
      const separator = initialPath.lastIndexOf('/')
      const opened = await openDirectory(
        separator >= 0 ? initialPath.slice(0, separator) : '.',
        { kind: 'reset' },
      )
      if (opened) {
        await openFile(initialPath)
      }
    })()
    return () => {
      workspaceRequest.current += 1
    }
  }, [
    initialKind,
    initialPath,
    openDirectory,
    openFile,
    updateDirectoryHistory,
  ])

  useEffect(() => {
    const top = pendingScrollRef.current ?? 0
    pendingScrollRef.current = undefined
    // Wait for the rendered document before restoring its offset.
    const frame = requestAnimationFrame(() => {
      const element = previewContentRef.current
      if (element) {
        element.scrollTop = top
      }
    })
    return () => cancelAnimationFrame(frame)
    // Deliberately not keyed on `raw`: toggling Rendered/Raw is not navigation
    // and must not throw the reader back to the top.
  }, [file?.path])

  const outline = useMemo<DocumentHeading[]>(
    () =>
      file?.kind === 'markdown' && !raw
        ? outlineFromMarkdown(file.content || '')
        : [],
    [file, raw],
  )

  const markdownComponents = useMemo(
    () =>
      markdownComponentsFor(file?.path || '.', (assetPath) =>
        readWorkspaceFile(session.computerId, session.id, assetPath),
      ),
    [file?.path, session.computerId, session.id],
  )

  const crumbs = breadcrumbSegments(
    listing?.path ?? '.',
    session.cwd.split('/').filter(Boolean).at(-1) || '~',
  )
  const selectedFolder = workspaceAbsolutePath(
    session.cwd,
    listing?.path || '.',
  )
  const sessionBusy =
    session.status === 'running' || session.status === 'waiting'

  async function moveHere() {
    if (!listing || sessionBusy) {
      return
    }
    if (/[\r\n]/.test(selectedFolder)) {
      setError('Folder paths cannot contain line breaks')
      return
    }
    setMoving(true)
    setError(undefined)
    try {
      onMoved(
        await executeCommand(session.computerId, session.id, {
          command: `/cwd ${selectedFolder}`,
          enqueue: false,
        }),
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setMoving(false)
    }
  }

  return (
    <DialogFrame
      className={`workspace-dialog ${
        file ? 'workspace-dialog--previewing' : ''
      }`}
      eyebrow={`${session.computerName} · ${shortPath(session.cwd)}`}
      onClose={onClose}
      title="Session files"
    >
      <form className="workspace-search" onSubmit={submitSearch}>
        <Search size={16} />
        <input
          aria-label="Search workspace"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search files and text"
          value={search}
        />
        <button disabled={search.trim().length < 2} type="submit">
          Search
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
      <div
        className={`workspace-layout ${
          file ? 'workspace-layout--previewing' : ''
        }`}
      >
        <aside className="workspace-tree">
          <div className="workspace-tree__path">
            <div className="workspace-tree__navigation">
              <button
                aria-label="Back folder"
                disabled={historyIndex <= 0 || loading}
                onClick={() => navigateHistory(historyIndex - 1)}
                type="button"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                aria-label="Forward folder"
                disabled={
                  historyIndex < 0 ||
                  historyIndex >= directoryHistory.length - 1 ||
                  loading
                }
                onClick={() => navigateHistory(historyIndex + 1)}
                type="button"
              >
                <ChevronRight size={15} />
              </button>
              <button
                aria-label="Parent folder"
                disabled={!listing?.parent || loading}
                onClick={() =>
                  void openDirectory(listing?.parent || '.', { kind: 'push' })
                }
                type="button"
              >
                <ArrowUp size={15} />
              </button>
              <nav aria-label="Folder breadcrumb" className="workspace-crumbs">
                {crumbs.map((crumb, index) => (
                  <span key={crumb.path}>
                    {index > 0 ? (
                      <span aria-hidden="true" className="workspace-crumbs__sep">
                        /
                      </span>
                    ) : null}
                    <button
                      aria-current={
                        index === crumbs.length - 1 ? 'page' : undefined
                      }
                      disabled={loading}
                      onClick={() => {
                        if (index === crumbs.length - 1) {
                          return
                        }
                        void openDirectory(crumb.path, { kind: 'push' })
                      }}
                      title={workspaceAbsolutePath(session.cwd, crumb.path)}
                      type="button"
                    >
                      {crumb.name}
                    </button>
                  </span>
                ))}
              </nav>
            </div>
            <div className="workspace-tree__actions">
              {results ? (
                <button
                  onClick={() =>
                    void openDirectory(listing?.path, { kind: 'refresh' })
                  }
                  type="button"
                >
                  <ChevronLeft size={15} /> Files
                </button>
              ) : listing ? (
                <>
                  <button
                    disabled={loading || moving || sessionBusy}
                    onClick={() => void moveHere()}
                    title={
                      sessionBusy
                        ? 'Wait for the current agent turn to finish'
                        : `Move chat to ${selectedFolder}`
                    }
                    type="button"
                  >
                    <FolderOpen size={14} />
                    {moving ? 'Moving…' : 'Move here'}
                  </button>
                </>
              ) : null}
            </div>
          </div>
          {loading ? (
            <LoaderCircle className="activity-message__spinner" size={18} />
          ) : results ? (
            results.map((result) => (
              <button
                className="workspace-entry"
                key={result.path}
                onClick={() => void openFile(result.path)}
                type="button"
              >
                <FileText size={15} />
                <span>
                  <strong>{result.name}</strong>
                  <small>{result.snippet || result.path}</small>
                </span>
              </button>
            ))
          ) : (
            listing?.entries.map((entry) => (
              <button
                className="workspace-entry"
                key={entry.path}
                onClick={() =>
                  entry.kind === 'directory'
                    ? void openDirectory(entry.path)
                    : void openFile(entry.path)
                }
                type="button"
              >
                {entry.kind === 'directory' ? (
                  <Folder size={15} />
                ) : entry.kind === 'markdown' ? (
                  <FileText size={15} />
                ) : (
                  <FileIcon size={15} />
                )}
                <span>
                  <strong>{entry.name}</strong>
                  {entry.size !== undefined ? (
                    <small>{Math.max(1, Math.ceil(entry.size / 1024))} KiB</small>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </aside>
        <section className="workspace-preview">
          {!file ? (
            <div className="workspace-preview__empty">
              <BookOpen size={24} />
              <p>Select a Markdown, text, or PDF file.</p>
            </div>
          ) : (
            <>
              <div className="workspace-preview__header">
                <button
                  aria-label="Back to files"
                  className="workspace-preview__back"
                  onClick={() => setFile(undefined)}
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>
                <div>
                  <strong>{file.name}</strong>
                  <small>{file.path}</small>
                </div>
                {documentHistory.length > 1 ? (
                  <>
                    <button
                      aria-label="Previous document"
                      disabled={documentIndex <= 0 || loading}
                      onClick={() => navigateDocument(documentIndex - 1)}
                      type="button"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      aria-label="Next document"
                      disabled={
                        documentIndex < 0 ||
                        documentIndex >= documentHistory.length - 1 ||
                        loading
                      }
                      onClick={() => navigateDocument(documentIndex + 1)}
                      type="button"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </>
                ) : null}
                {outline.length > 1 ? (
                  <button
                    aria-expanded={outlineOpen}
                    aria-label="Document outline"
                    onClick={() => setOutlineOpen(!outlineOpen)}
                    type="button"
                  >
                    <List size={15} />
                  </button>
                ) : null}
                {file.kind === 'markdown' ? (
                  <button onClick={() => setRaw(!raw)} type="button">
                    {raw ? 'Rendered' : 'Raw'}
                  </button>
                ) : null}
              </div>
              <div className="workspace-preview__actions">
                <button onClick={() => onInsert(file, false)} type="button">
                  Insert path
                </button>
                <button onClick={() => onInsert(file, true)} type="button">
                  Ask agent about file
                </button>
              </div>
              {outlineOpen && outline.length > 0 ? (
                <nav aria-label="Document outline" className="workspace-outline">
                  {outline.map((heading) => (
                    <button
                      className={`workspace-outline__item workspace-outline__item--${Math.min(
                        heading.level,
                        3,
                      )}`}
                      key={`${heading.index}-${heading.id}`}
                      onClick={() => {
                        // Headings are matched by position, so repeated
                        // heading text still scrolls to the right one.
                        previewContentRef.current
                          ?.querySelectorAll('h1, h2, h3, h4, h5, h6')
                          ?.[heading.index]?.scrollIntoView({ block: 'start' })
                        setOutlineOpen(false)
                      }}
                      type="button"
                    >
                      {heading.text}
                    </button>
                  ))}
                </nav>
              ) : null}
              <div
                className={`workspace-preview__content${
                  file.kind === 'markdown' && !raw ? ' markdown-body' : ''
                }`}
                onScroll={rememberCurrentScroll}
                ref={previewContentRef}
              >
                {file.kind === 'pdf' ? (
                  <PdfViewer file={file} />
                ) : file.kind === 'image' ? (
                  <WorkspaceImage file={file} />
                ) : file.kind === 'markdown' && !raw ? (
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm]}
                  >
                    {file.content || ''}
                  </ReactMarkdown>
                ) : (
                  <pre>{file.content}</pre>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </DialogFrame>
  )
}


function App() {
  const [sessions, setSessions] = useState<ManagedSession[]>([])
  const [computers, setComputers] = useState<ComputerSummary[]>([])
  const [selectedKey, setSelectedKey] = useState<string>()
  const [composerDrafts, setComposerDrafts] = useState<Record<string, string>>(
    () => readStoredOrder('agentic-remote:composer-drafts', {}),
  )
  const composerHistoryRef = useRef<Record<string, ComposerHistoryState>>({})
  const [renameOpen, setRenameOpen] = useState(false)
  const [runtimeOpen, setRuntimeOpen] = useState(false)
  const [cwdOpen, setCwdOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [workspaceInitialPath, setWorkspaceInitialPath] = useState<string>()
  const [workspaceInitialKind, setWorkspaceInitialKind] = useState<
    'file' | 'folder'
  >()
  const [sidebarMode, setSidebarMode] = useState<'sessions' | 'knowledge'>(
    'sessions',
  )
  const [roots, setRoots] = useState<KnowledgeRoot[]>([])
  const [activeRootId, setActiveRootId] = useState<string | undefined>(() =>
    readStoredOrder<string | undefined>(
      'agentic-remote:knowledge-root',
      undefined,
    ),
  )
  const [knowledgeListing, setKnowledgeListing] = useState<WorkspaceListing>()
  const [knowledgeFile, setKnowledgeFile] = useState<WorkspaceFile>()
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [addRootOpen, setAddRootOpen] = useState(false)
  const knowledgeRequest = useRef(0)
  // Where the reader was left, so the next visit reopens it instead of asking
  // for the folder again.
  // Persisting is held back until the remembered position has been applied, so
  // a slow or failed restore cannot erase it.
  const knowledgeHydrated = useRef(false)
  const restoredKnowledge = useRef(
    readStoredOrder<{ rootId?: string; path?: string; file?: string }>(
      'agentic-remote:knowledge-position',
      {},
    ),
  )
  const [commands, setCommands] = useState<SlashCommand[]>([])
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [permissionBusy, setPermissionBusy] = useState(false)
  const [userInputBusy, setUserInputBusy] = useState(false)
  const [queueActionId, setQueueActionId] = useState<string>()
  const [deleting, setDeleting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [movingToTmux, setMovingToTmux] = useState(false)
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
  const [defaultRuntimes, setDefaultRuntimes] = useState<DefaultRuntimeSettings>(
    readDefaultRuntimeSettings,
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
  const autoScrollRef = useRef(true)
  const autoScrollSessionRef = useRef<string | undefined>(undefined)
  const previousPendingActionRef = useRef<string | undefined>(undefined)
  const requiredActionScrollRef = useRef(false)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | undefined>(undefined)
  const recordingStreamRef = useRef<MediaStream | undefined>(undefined)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingSessionRef = useRef<ManagedSession | undefined>(undefined)
  const recordingTimerRef = useRef<number | undefined>(undefined)
  const recordingStartedAtRef = useRef(0)
  const discardRecordingRef = useRef(false)
  const selectedRef = useRef<ManagedSession | undefined>(undefined)
  const eventSequenceRef = useRef(0)
  const sessionEventSequenceRef = useRef(new Map<string, number>())
  const computerEventSequenceRef = useRef(new Map<string, number>())
  const sidebarGestureRef = useRef<
    | {
        startX: number
        startY: number
        startedAt: number
        action: 'open' | 'close'
      }
    | undefined
  >(undefined)

  const orderedComputers = useMemo(() => {
    const rank = new Map(computerOrder.map((id, index) => [id, index]))
    return [...computers].sort(
      (left, right) =>
        (rank.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    )
  }, [computerOrder, computers])
  const sessionsByComputer = useMemo(() => {
    const grouped = new Map<string, ManagedSession[]>()
    for (const computer of orderedComputers) {
      const rank = new Map(
        (sessionOrder[computer.id] || []).map((key, index) => [key, index]),
      )
      grouped.set(
        computer.id,
        sessions
          .filter((session) => session.computerId === computer.id)
          .sort(
            (left, right) =>
              (rank.get(sessionKey(left)) ?? Number.MAX_SAFE_INTEGER) -
              (rank.get(sessionKey(right)) ?? Number.MAX_SAFE_INTEGER),
          ),
      )
    }
    return grouped
  }, [orderedComputers, sessionOrder, sessions])
  const selected = useMemo(
    () => sessions.find((session) => sessionKey(session) === selectedKey),
    [selectedKey, sessions],
  )
  const composer = selectedKey ? composerDrafts[selectedKey] || '' : ''
  selectedRef.current = selected
  const currentTool = selected?.messages.findLast(
    (message) =>
      message.role === 'activity' && message.activityStatus === 'running',
  )
  const hasRunningTool = currentTool?.activityStatus === 'running'
  const pendingActionId =
    selected?.pendingPermission?.requestId ||
    selected?.pendingUserInput?.requestId
  const selectedComputerId = selected?.computerId
  const selectedSessionId = selected?.id
  const selectedNotificationsMuted = selected
    ? mutedSessions.includes(sessionKey(selected))
    : false
  const selectedProviderCapability = selected
    ? computerProviders(
        computers.find((computer) => computer.id === selected.computerId),
      ).find((provider) => provider.id === (selected.provider || 'copilot'))
    : undefined
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
    (selectedComputerId &&
    computers.some(
      (computer) => computer.id === selectedComputerId && computer.online,
    )
      ? selectedComputerId
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
      setViewportOffsetTop(viewport?.offsetTop || 0)
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


  useEffect(() => {
    if (!knowledgeHydrated.current) {
      return
    }
    localStorage.setItem(
      'agentic-remote:knowledge-root',
      JSON.stringify(activeRootId),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-position',
      JSON.stringify({
        rootId: activeRootId,
        path: knowledgeListing?.path,
        file: knowledgeFile?.path,
      }),
    )
  }, [activeRootId, knowledgeFile?.path, knowledgeListing?.path])

  useEffect(() => {
    void listKnowledgeRoots()
      .then(async (loaded) => {
        setRoots(loaded)
        // Reopen whatever was being read, so returning to Knowledge does not
        // mean picking the folder and the document again.
        const remembered = restoredKnowledge.current
        const root =
          loaded.find((entry) => entry.id === remembered.rootId) || loaded[0]
        if (!root) {
          // Nothing to restore, so later changes are safe to persist.
          knowledgeHydrated.current = true
          return
        }
        setActiveRootId(root.id)
        const request = ++knowledgeRequest.current
        const folder =
          root.id === remembered.rootId && remembered.path
            ? remembered.path
            : '.'
        try {
          const listing = await listKnowledgeEntries(root.id, folder).catch(
            () => listKnowledgeEntries(root.id, '.'),
          )
          if (request !== knowledgeRequest.current) {
            return
          }
          setKnowledgeListing(listing)
          if (root.id === remembered.rootId && remembered.file) {
            const opened = await readKnowledgeFile(
              root.id,
              remembered.file,
            ).catch(() => undefined)
            if (opened && request === knowledgeRequest.current) {
              setKnowledgeFile(opened)
            }
          }
          knowledgeHydrated.current = true
        } catch (caught) {
          // Leave the position unhydrated so a transient failure — an offline
          // computer, say — keeps it for the next visit instead of clearing it.
          if (request === knowledgeRequest.current) {
            setError(caught instanceof Error ? caught.message : String(caught))
          }
        }
      })
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
  }, [])

  useEffect(
    () => () => {
      discardRecordingRef.current = true
      if (recordingTimerRef.current !== undefined) {
        window.clearInterval(recordingTimerRef.current)
      }
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop()
      }
      for (const track of recordingStreamRef.current?.getTracks() || []) {
        track.stop()
      }
    },
    [],
  )
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    // `computers` is empty until the initial load resolves; reconciling against
    // it would discard the persisted order before it can be applied.
    if (computers.length === 0) {
      return
    }
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
    if (computers.length === 0) {
      return
    }
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
      'agentic-remote:default-models',
      JSON.stringify(defaultRuntimes),
    )
  }, [defaultRuntimes])

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
        setSessions((current) => {
          let reconciled = sortSessions(loadedSessions)
          for (const existing of current) {
            reconciled = upsertSession(reconciled, existing)
          }
          return reconciled
        })
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
    if (loading) {
      return
    }
    setSelectedKey((current) =>
      current && sessions.some((session) => sessionKey(session) === current)
        ? current
        : sessions[0]
          ? sessionKey(sessions[0])
          : undefined,
    )
  }, [loading, sessions])

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
                (selected?.provider !== 'claude' ||
                  webCommand.name !== 'cwd') &&
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
  }, [selected?.provider, selectedComputerId, selectedSessionId])

  useEffect(() => {
    setSelectedCommandIndex(0)
  }, [commandQuery])

  useEffect(() => {
    let socket: WebSocket | undefined
    let retry: number | undefined
    let stopped = false
    let reconnectDelay = 1_000

    const refreshSnapshot = async () => {
      const startedAtSequence = eventSequenceRef.current
      const [loadedSessions, loadedComputers, pushSettings] = await Promise.all([
        listSessions(),
        listComputers(),
        getPushSettings().catch((caught: unknown) => {
          console.warn('Unable to refresh notification mute settings:', caught)
          return undefined
        }),
      ])
      const snapshotSessions = loadedSessions.filter(
        (session) =>
          (sessionEventSequenceRef.current.get(sessionKey(session)) || 0) <=
            startedAtSequence &&
          (computerEventSequenceRef.current.get(session.computerId) || 0) <=
            startedAtSequence,
      )
      const snapshotComputers = loadedComputers.filter(
        (computer) =>
          (computerEventSequenceRef.current.get(computer.id) || 0) <=
          startedAtSequence,
      )
      setSessions((current) => {
        let reconciled = sortSessions(snapshotSessions)
        for (const existing of current) {
          const changedAt =
            sessionEventSequenceRef.current.get(sessionKey(existing)) || 0
          if (changedAt > startedAtSequence) {
            reconciled = upsertSession(reconciled, existing)
          }
        }
        return reconciled
      })
      setComputers((current) => {
        let reconciled = snapshotComputers
        for (const existing of current) {
          const changedAt =
            computerEventSequenceRef.current.get(existing.id) || 0
          if (changedAt > startedAtSequence) {
            reconciled = upsertComputer(reconciled, existing)
          }
        }
        return reconciled
      })
      if (pushSettings) {
        setMutedSessions(pushSettings.mutedSessions)
      }
      const selectedAtRefresh = selectedRef.current
      const selectedStillExists =
        selectedAtRefresh &&
        snapshotSessions.some(
          (session) => sessionKey(session) === sessionKey(selectedAtRefresh),
        )
      if (selectedAtRefresh && selectedStillExists) {
        const detailStartedAtSequence = eventSequenceRef.current
        const detail = await getSession(
          selectedAtRefresh.computerId,
          selectedAtRefresh.id,
        )
        const detailKey = sessionKey(detail)
        if (
          (sessionEventSequenceRef.current.get(detailKey) || 0) >
          detailStartedAtSequence
        ) {
          return
        }
        setSessions((current) => upsertSession(current, detail))
      } else if (selectedAtRefresh) {
        setSelectedKey(
          snapshotSessions[0] ? sessionKey(snapshotSessions[0]) : undefined,
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
          eventSequenceRef.current += 1
          sessionEventSequenceRef.current.set(
            sessionKey(event.session),
            eventSequenceRef.current,
          )
          setSessions((current) => upsertSession(current, event.session))
        } else if (event.type === 'session.removed') {
          const removedKey = `${event.computerId}:${event.sessionId}`
          eventSequenceRef.current += 1
          sessionEventSequenceRef.current.set(
            removedKey,
            eventSequenceRef.current,
          )
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
          eventSequenceRef.current += 1
          computerEventSequenceRef.current.set(
            event.computer.id,
            eventSequenceRef.current,
          )
          setComputers((current) => upsertComputer(current, event.computer))
        } else if (event.type === 'computer.removed') {
          eventSequenceRef.current += 1
          computerEventSequenceRef.current.set(
            event.computerId,
            eventSequenceRef.current,
          )
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
    if (autoScrollSessionRef.current !== selectedKey) {
      autoScrollSessionRef.current = selectedKey
      autoScrollRef.current = true
    }
    const pendingActionArrived =
      pendingActionId !== undefined &&
      pendingActionId !== previousPendingActionRef.current
    previousPendingActionRef.current = pendingActionId
    if (!autoScrollRef.current && !pendingActionArrived) {
      return
    }
    const preserveDisabledAutoScroll =
      !autoScrollRef.current && pendingActionArrived
    let releaseFrame: number | undefined
    const frame = window.requestAnimationFrame(() => {
      requiredActionScrollRef.current = preserveDisabledAutoScroll
      bottomRef.current?.scrollIntoView({ block: 'end' })
      if (preserveDisabledAutoScroll) {
        releaseFrame = window.requestAnimationFrame(() => {
          requiredActionScrollRef.current = false
        })
      }
    })
    return () => {
      window.cancelAnimationFrame(frame)
      if (releaseFrame !== undefined) {
        window.cancelAnimationFrame(releaseFrame)
      }
      requiredActionScrollRef.current = false
    }
  }, [
    selectedKey,
    selected?.messages.length,
    latestContent,
    pendingActionId,
  ])

  function timelineScrolled() {
    const timeline = timelineRef.current
    if (!timeline) {
      return
    }
    if (requiredActionScrollRef.current) {
      autoScrollRef.current = false
      return
    }
    const distanceFromBottom =
      timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight
    autoScrollRef.current = distanceFromBottom <= timelineBottomThreshold
  }

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

  // Every composer write goes through here so none can skip invalidation. Any
  // write other than history navigation replaces the draft that navigation is
  // tracking, so navigating afterwards would overwrite text the user never
  // typed here and could not recover. Editing a queued prompt, dictation,
  // uploads, and path insertion all reach the composer by different routes.
  function updateComposerDrafts(
    invalidateKeys: string[],
    update: (current: Record<string, string>) => Record<string, string>,
  ) {
    for (const key of invalidateKeys) {
      resetComposerHistory(key)
    }
    setComposerDrafts(update)
  }

  function setComposerForKey(targetKey: string, value: string, fromHistory = false) {
    updateComposerDrafts(fromHistory ? [] : [targetKey], (current) => {
      if (!value) {
        const { [targetKey]: _removed, ...remaining } = current
        return remaining
      }
      return { ...current, [targetKey]: value }
    })
  }

  function resetComposerHistory(targetKey: string) {
    delete composerHistoryRef.current[targetKey]
  }

  function navigateMessageHistory(direction: -1 | 1): boolean {
    if (!selected || !selectedKey) {
      return false
    }
    const messages = selected.messages
      .filter((message) => message.role === 'user' && message.content.trim())
      .map((message) => message.content)
    if (messages.length === 0) {
      return false
    }

    const existing = composerHistoryRef.current[selectedKey]
    if (!existing && (direction > 0 || composer.trim())) {
      return false
    }
    const history =
      existing && existing.messages.join('\0') === messages.join('\0')
        ? existing
        : {
            messages,
            index: messages.length,
            draft: composer,
          }
    const nextIndex = Math.min(
      Math.max(history.index + direction, 0),
      messages.length,
    )
    history.index = nextIndex
    composerHistoryRef.current[selectedKey] = history
    const value =
      nextIndex === messages.length ? history.draft : messages[nextIndex] || ''
    setComposerForKey(selectedKey, value, true)
    window.requestAnimationFrame(() => {
      if (
        selectedRef.current &&
        sessionKey(selectedRef.current) === selectedKey
      ) {
        const textarea = composerRef.current
        textarea?.focus()
        textarea?.setSelectionRange(value.length, value.length)
      }
    })
    return true
  }

  function prependComposerForKey(targetKey: string, value: string) {
    updateComposerDrafts([targetKey], (current) => {
      const existing = current[targetKey] || ''
      const separator = existing
        ? value.endsWith('\n')
          ? '\n'
          : '\n\n'
        : ''
      return {
        ...current,
        [targetKey]: `${value}${separator}${existing}`,
      }
    })
  }

  function appendComposerForKey(targetKey: string, value: string) {
    updateComposerDrafts([targetKey], (current) => {
      const existing = current[targetKey] || ''
      const separator = existing
        ? existing.endsWith('\n')
          ? '\n'
          : '\n\n'
        : ''
      return {
        ...current,
        [targetKey]: `${existing}${separator}${value}`,
      }
    })
  }

  function moveComposerDraft(fromKey: string, toKey: string) {
    if (fromKey === toKey) {
      return
    }
    updateComposerDrafts([fromKey, toKey], (current) => {
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

  const activeRoot = roots.find((root) => root.id === activeRootId)

  // Stable identity: a new loader each render would remount every image and
  // restart its download.
  const loadKnowledgeAsset = useCallback(
    (assetPath: string) => readKnowledgeFile(activeRootId || '', assetPath),
    [activeRootId],
  )

  async function openKnowledgeFolder(path = '.', rootId = activeRootId) {
    if (!rootId) {
      return
    }
    // Responses can land out of order while roots or folders are switched, so
    // only the newest request is allowed to write shared state.
    const request = ++knowledgeRequest.current
    setKnowledgeLoading(true)
    setError(undefined)
    try {
      const listing = await listKnowledgeEntries(rootId, path)
      if (request !== knowledgeRequest.current) {
        return
      }
      setKnowledgeListing(listing)
      setKnowledgeFile(undefined)
    } catch (caught) {
      if (request === knowledgeRequest.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === knowledgeRequest.current) {
        setKnowledgeLoading(false)
      }
    }
  }

  async function openKnowledgeFile(path: string) {
    knowledgeHydrated.current = true
    const rootId = activeRootId
    if (!rootId) {
      return
    }
    const request = ++knowledgeRequest.current
    setKnowledgeLoading(true)
    setError(undefined)
    try {
      const opened = await readKnowledgeFile(rootId, path)
      if (request !== knowledgeRequest.current) {
        return
      }
      setKnowledgeFile(opened)
      // Reading is full-screen on a phone, matching how selecting a session
      // hands the view over to the conversation.
      setSidebarOpen(false)
    } catch (caught) {
      if (request === knowledgeRequest.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === knowledgeRequest.current) {
        setKnowledgeLoading(false)
      }
    }
  }

  async function selectRoot(rootId: string) {
    knowledgeHydrated.current = true
    setActiveRootId(rootId)
    setKnowledgeFile(undefined)
    setKnowledgeListing(undefined)
    await openKnowledgeFolder('.', rootId)
  }

  async function removeRoot(rootId: string) {
    try {
      await deleteKnowledgeRoot(rootId)
      setRoots((current) => current.filter((root) => root.id !== rootId))
      if (rootId === activeRootId) {
        knowledgeRequest.current += 1
        setActiveRootId(undefined)
        setKnowledgeListing(undefined)
        setKnowledgeFile(undefined)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  async function createRoot(computerId: string, path: string) {
    const root = await addKnowledgeRoot({ computerId, path })
    setRoots((current) =>
      current.some((entry) => entry.id === root.id)
        ? current
        : [root, ...current],
    )
    setAddRootOpen(false)
    await selectRoot(root.id)
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
      if (horizontalScroller || ios) {
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
    const command = isCommand
      ? commands.find(
          (candidate) =>
            candidate.name.toLowerCase() === commandName ||
            slashShortcut(candidate.name) === commandName ||
            candidate.aliases?.some(
              (alias) => alias.toLowerCase() === commandName,
            ),
        )
      : undefined
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
    if (
      commandName === 'cwd' &&
      !content.slice(commandName.length + 1).trim()
    ) {
      setComposer('')
      setCwdOpen(true)
      return
    }
    const shouldEnqueue =
      enqueue ||
      (selected.status === 'running' &&
        isCommand &&
        !command?.allowDuringAgentExecution)
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
      prependComposerForKey(targetKey, content)
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSending(false)
      focusComposer(targetKey)
    }
  }

  async function transcribeFile(
    file: File,
    targetSession: ManagedSession | undefined = selected,
  ) {
    if (!targetSession || transcribing) {
      return
    }
    const targetKey = sessionKey(targetSession)
    setTranscribing(true)
    setError(undefined)
    try {
      const result = await transcribeAudio(file)
      appendComposerForKey(targetKey, result.transcript)
      if (
        selectedRef.current &&
        sessionKey(selectedRef.current) === targetKey
      ) {
        window.requestAnimationFrame(() => focusComposer(targetKey))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setTranscribing(false)
      if (audioInputRef.current) {
        audioInputRef.current.value = ''
      }
    }
  }

  function releaseRecording() {
    if (recordingTimerRef.current !== undefined) {
      window.clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = undefined
    }
    for (const track of recordingStreamRef.current?.getTracks() || []) {
      track.stop()
    }
    recordingStreamRef.current = undefined
    mediaRecorderRef.current = undefined
    setRecording(false)
    setRecordingSeconds(0)
  }

  async function startRecording() {
    if (
      !selected ||
      recording ||
      transcribing ||
      uploadingFile ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined'
      ) {
        setError('Microphone recording is not supported in this browser')
      }
      return
    }
    setError(undefined)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredType = [
        'audio/mp4',
        'audio/webm;codecs=opus',
        'audio/webm',
      ].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(
        stream,
        preferredType ? { mimeType: preferredType } : undefined,
      )
      recordingStreamRef.current = stream
      mediaRecorderRef.current = recorder
      recordingChunksRef.current = []
      recordingSessionRef.current = selected
      discardRecordingRef.current = false
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      })
      recorder.addEventListener('stop', () => {
        const chunks = recordingChunksRef.current
        const targetSession = recordingSessionRef.current
        const discarded = discardRecordingRef.current
        const mimeType = recorder.mimeType || chunks[0]?.type || 'audio/webm'
        releaseRecording()
        recordingChunksRef.current = []
        recordingSessionRef.current = undefined
        if (discarded || chunks.length === 0) {
          return
        }
        const extension = mimeType.includes('mp4') ? 'm4a' : 'webm'
        const file = new File(chunks, `recording.${extension}`, {
          type: mimeType,
        })
        void transcribeFile(file, targetSession)
      })
      recorder.addEventListener('error', () => {
        releaseRecording()
        setError('The microphone recording failed')
      })
      recorder.start(1_000)
      recordingStartedAtRef.current = Date.now()
      setRecording(true)
      setRecordingSeconds(0)
      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - recordingStartedAtRef.current) / 1_000,
        )
        setRecordingSeconds(elapsed)
        if (elapsed >= 15 * 60 && recorder.state !== 'inactive') {
          recorder.stop()
        }
      }, 250)
    } catch (caught) {
      releaseRecording()
      setError(
        caught instanceof DOMException && caught.name === 'NotAllowedError'
          ? 'Microphone permission was denied'
          : caught instanceof Error
            ? caught.message
            : String(caught),
      )
    }
  }

  function stopRecording(discard = false) {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      releaseRecording()
      return
    }
    discardRecordingRef.current = discard
    recorder.stop()
  }

  async function uploadFile(file: File) {
    if (!selected || uploadingFile) {
      return
    }
    const targetKey = sessionKey(selected)
    setUploadingFile(true)
    setError(undefined)
    try {
      const uploaded = await uploadSessionFile(
        selected.computerId,
        selected.id,
        file,
      )
      appendComposerForKey(
        targetKey,
        `Attached file: \`${uploaded.path}\``,
      )
      if (
        selectedRef.current &&
        sessionKey(selectedRef.current) === targetKey
      ) {
        window.requestAnimationFrame(() => focusComposer(targetKey))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setUploadingFile(false)
      if (audioInputRef.current) {
        audioInputRef.current.value = ''
      }
    }
  }

  async function attachedFiles(files: File[]) {
    if (recording || transcribing || uploadingFile) {
      return
    }
    for (const file of files) {
      if (isAudioFile(file)) {
        await transcribeFile(file)
      } else {
        await uploadFile(file)
      }
    }
  }

  function audioFileChanged(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      void attachedFiles(files)
    }
  }

  function audioDropped(event: ReactDragEvent<HTMLDivElement>) {
    const files = Array.from(event.dataTransfer.files)
    if (files.length === 0) {
      return
    }
    event.preventDefault()
    void attachedFiles(files)
  }


  function insertWorkspaceFile(file: WorkspaceFile, ask: boolean) {
    if (!selected) return
    const targetKey = sessionKey(selected)
    const absolutePath = `${selected.cwd.replace(/\/$/, '')}/${file.path}`
    appendComposerForKey(
      targetKey,
      ask
        ? `Please review \`${absolutePath}\` and help me with it.`
        : `File: \`${absolutePath}\``,
    )
    setWorkspaceOpen(false)
    setWorkspaceInitialPath(undefined)
    setWorkspaceInitialKind(undefined)
    window.requestAnimationFrame(() => focusComposer(targetKey))
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

  async function moveSelectedSessionToTmux() {
    if (
      !selected ||
      movingToTmux ||
      selected.provider === 'claude' ||
      selected.executionMode !== 'sdk' ||
      selected.status !== 'idle' ||
      !window.confirm(
        `Move "${selected.title}" to tmux?\n\nThe Copilot SDK process will disconnect and the same session will resume in a tmux window.`,
      )
    ) {
      return
    }
    setMovingToTmux(true)
    setError(undefined)
    try {
      const migrated = await moveSessionToTmux(
        selected.computerId,
        selected.id,
      )
      setSessions((current) => upsertSession(current, migrated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setMovingToTmux(false)
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
    if (
      event.key === 'ArrowUp' &&
      !showCommandMenu &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      navigateMessageHistory(-1)
    ) {
      event.preventDefault()
      return
    }
    if (
      event.key === 'ArrowDown' &&
      !showCommandMenu &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      navigateMessageHistory(1)
    ) {
      event.preventDefault()
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
    if (event.key !== 'Enter') {
      return
    }
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault()
      void submitMessage(true)
      return
    }
    if (phoneEnterCreatesNewline()) {
      event.preventDefault()
      insertComposerNewline()
      return
    }
    if (!event.shiftKey) {
      event.preventDefault()
      void submitMessage()
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

  async function answerUserInput(input: UserInputReplyInput) {
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
        input,
      )
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setUserInputBusy(false)
    }
  }

  async function stopSelectedSession() {
    if (!selected || cancelling) {
      return
    }
    setCancelling(true)
    setError(undefined)
    try {
      await cancelSession(selected.computerId, selected.id)
      const updated = await getSession(selected.computerId, selected.id)
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setCancelling(false)
    }
  }

  async function closeSelectedSession() {
    if (
      !selected ||
      !window.confirm(
        `Close "${selected.title}" on ${selected.computerName}?\n\nThis permanently deletes the ${providerName(selected.provider)} session and its history from that computer.`,
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
      const next = remaining[0]
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

        <div aria-label="Sidebar section" className="sidebar-switch" role="tablist">
          <button
            aria-selected={sidebarMode === 'sessions'}
            className={sidebarMode === 'sessions' ? 'is-active' : ''}
            onClick={() => setSidebarMode('sessions')}
            role="tab"
            type="button"
          >
            Sessions
          </button>
          <button
            aria-selected={sidebarMode === 'knowledge'}
            className={sidebarMode === 'knowledge' ? 'is-active' : ''}
            onClick={() => setSidebarMode('knowledge')}
            role="tab"
            type="button"
          >
            Knowledge
          </button>
        </div>

        {sidebarMode === 'sessions' ? (
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
        ) : null}

        <div className="sidebar__body">
          {sidebarMode === 'knowledge' ? (
            <nav aria-label="Knowledge" className="session-list knowledge-tree">
              {roots.length === 0 ? (
                <p className="sidebar-message">
                  Add a knowledge root to browse a folder on any computer.
                </p>
              ) : null}
              {roots.length > 0 ? (
                <>
                  <p className="sidebar-label">Roots</p>
                  {roots.map((root) => (
                    <div className="knowledge-root" key={root.id}>
                      <button
                        aria-current={root.id === activeRootId ? 'true' : undefined}
                        className={root.id === activeRootId ? 'is-active' : ''}
                        onClick={() => void selectRoot(root.id)}
                        type="button"
                      >
                        <FolderOpen size={15} />
                        <span>
                          <strong>{root.name}</strong>
                          <small>
                            {root.computerName} · {root.path}
                          </small>
                        </span>
                      </button>
                      <button
                        aria-label={`Remove ${root.name} root`}
                        className="icon-button icon-button--danger"
                        onClick={() => void removeRoot(root.id)}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </>
              ) : null}
              {activeRoot && knowledgeListing ? (
                <>
                  <p className="sidebar-label">
                    {knowledgeListing.path === '.'
                      ? activeRoot.name
                      : knowledgeListing.path}
                  </p>
                  {knowledgeListing.parent !== undefined ? (
                    <button
                      className="workspace-entry"
                      onClick={() =>
                        void openKnowledgeFolder(knowledgeListing.parent)
                      }
                      type="button"
                    >
                      <ArrowUp size={15} />
                      <span>
                        <strong>Parent folder</strong>
                      </span>
                    </button>
                  ) : null}
                  {knowledgeListing.entries.length === 0 ? (
                    <p className="sidebar-message">This folder is empty.</p>
                  ) : null}
                  {knowledgeListing.entries.map((entry) => (
                    <button
                      className="workspace-entry"
                      key={entry.path}
                      onClick={() =>
                        entry.kind === 'directory'
                          ? void openKnowledgeFolder(entry.path)
                          : void openKnowledgeFile(entry.path)
                      }
                      type="button"
                    >
                      {entry.kind === 'directory' ? (
                        <FolderOpen size={15} />
                      ) : (
                        <FileText size={15} />
                      )}
                      <span>
                        <strong>{entry.name}</strong>
                      </span>
                    </button>
                  ))}
                </>
              ) : null}
            </nav>
          ) : null}

          <nav
            aria-label="Sessions"
            className="session-list"
            hidden={sidebarMode !== 'sessions'}
          >
            <p className="sidebar-label">Recent</p>
            {loading ? <p className="sidebar-message">Loading sessions…</p> : null}
            {!loading && sessions.length === 0 ? (
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
                      showComputerHandle
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </nav>
        </div>
        <div className="sidebar-settings">
          <button
            aria-label="Add knowledge root"
            className="sidebar-settings__button"
            onClick={() => {
              setSidebarMode('knowledge')
              setAddRootOpen(true)
            }}
            type="button"
          >
            <Plus size={18} />
            <span>
              <strong>Add knowledge root</strong>
              <small>Any folder on any computer</small>
            </span>
          </button>
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

      {sidebarMode === 'knowledge' ? (
        <main className="conversation conversation--knowledge">
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
              <strong>{activeRoot?.name || 'Knowledge'}</strong>
              <span>
                {activeRoot
                  ? `${activeRoot.computerName} · ${activeRoot.path}`
                  : 'Browse folders on any computer'}
              </span>
            </div>
          </header>
          {error ? (
            <div className="error-banner">
              <span>{error}</span>
              <button
                aria-label="Dismiss error"
                onClick={() => setError(undefined)}
              >
                <X size={16} />
              </button>
            </div>
          ) : null}
          {activeRoot ? (
            <KnowledgeReader
              file={knowledgeFile}
              key={knowledgeFile?.path || activeRoot.id}
              listing={knowledgeListing}
              loading={knowledgeLoading}
              onLoadAsset={loadKnowledgeAsset}
              onOpenFolder={(path) => void openKnowledgeFolder(path)}
              root={activeRoot}
            />
          ) : (
            <div className="knowledge-reader knowledge-reader--empty">
              <BookOpen size={26} />
              <p>
                Add a knowledge root to read Markdown from any computer without
                opening a session.
              </p>
            </div>
          )}
        </main>
      ) : null}

      <main className="conversation" hidden={sidebarMode === 'knowledge'}>
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
                ? `${providerName(selected.provider)}${
                    executionModeName(selected.executionMode)
                      ? ` · ${executionModeName(selected.executionMode)}`
                      : ''
                  } · ${selected.computerName} · ${shortPath(selected.cwd)}`
                : 'Ready when you are'}
            </span>
          </div>
          {selected ? (
            <button
              aria-label="Browse current session folder"
              className="icon-button"
              onClick={() => {
                setWorkspaceInitialPath(undefined)
                setWorkspaceInitialKind(undefined)
                setWorkspaceOpen(true)
              }}
              type="button"
            >
              <FolderOpen size={18} />
            </button>
          ) : null}
          {selected?.provider !== 'claude' &&
          selected?.executionMode === 'sdk' &&
          selectedProviderCapability?.supportsTmuxMigration === true ? (
            <button
              aria-label="Move session to tmux"
              className="icon-button"
              disabled={movingToTmux || selected.status !== 'idle'}
              onClick={() => void moveSelectedSessionToTmux()}
              title="Move this Copilot session to tmux"
              type="button"
            >
              <SquareTerminal size={18} />
            </button>
          ) : null}
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

        <div className="timeline" onScroll={timelineScrolled} ref={timelineRef}>
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
                <strong>{providerName(selected.provider)}</strong> runs on{' '}
                <strong>{selected.computerName}</strong> in{' '}
                <code>{shortPath(selected.cwd)}</code>.
              </p>
            </div>
          ) : (
            <div className="message-stack">
              {selected.messages
                .map((message) => (
                  message.role === 'activity' ? (
                    <article
                      className={`message message--activity ${
                        message.id === currentTool?.id
                          ? 'tool-activity-slot'
                          : 'tool-activity-history'
                      }`}
                      key={message.id}
                    >
                      <ActivityMessage
                        content={message.content}
                        status={message.activityStatus}
                      />
                    </article>
                  ) : (
                    <article
                      className={`message message--${message.role}`}
                      key={message.id}
                    >
                      <div className="message__metadata">
                        <span className="message__label">
                          {message.role === 'user'
                            ? 'You'
                            : message.role === 'notice'
                              ? 'Command'
                              : 'Agent'}
                        </span>
                        <time
                          className="message__timestamp"
                          dateTime={message.createdAt}
                          title={messageDateTimeFormatter.format(
                            new Date(message.createdAt),
                          )}
                        >
                          {messageTimeFormatter.format(
                            new Date(message.createdAt),
                          )}
                        </time>
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
                  )
                ))}
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
              onReply={(input) => void answerUserInput(input)}
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
            {statusline.provider ? (
              <span className="web-statusline__provider">
                {providerName(selected.provider)}
                {executionModeName(selected.executionMode)
                  ? ` · ${executionModeName(selected.executionMode)}`
                  : ''}
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
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes('Files')) {
                  event.preventDefault()
                }
              }}
              onDrop={audioDropped}
            >
              <div className="composer-text-panel">
                <textarea
                  aria-label="Message"
                  disabled={sending}
                  onChange={(event) => {
                    setComposer(event.target.value)
                  }}
                  onKeyDown={composerKeyDown}
                  placeholder={`Message agent on ${selected.computerName}…`}
                  ref={composerRef}
                  rows={1}
                  value={composer}
                />
              </div>
              <input
                accept="audio/*,.aac,.csv,.doc,.docx,.flac,.gif,.jpeg,.jpg,.json,.m4a,.md,.mp3,.mp4,.ofx,.ogg,.pdf,.png,.qfx,.tsv,.txt,.wav,.webm,.webp,.xls,.xlsx,.yaml,.yml"
                aria-label="File attachment"
                className="composer-audio-input"
                onChange={audioFileChanged}
                ref={audioInputRef}
                multiple
                type="file"
              />
              {recording ? (
                <div className="recording-panel" role="status">
                  <button
                    className="recording-panel__cancel"
                    onClick={() => stopRecording(true)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <span className="recording-panel__status">
                    <i />
                    Recording {recordingDuration(recordingSeconds)}
                  </span>
                  <button
                    className="recording-panel__stop"
                    onClick={() => stopRecording()}
                    type="button"
                  >
                    <Square fill="currentColor" size={12} />
                    Stop & transcribe
                  </button>
                </div>
              ) : (
                <div className="composer-actions">
                  <button
                    aria-label={
                      transcribing
                        ? 'Transcribing audio'
                        : uploadingFile
                          ? 'Uploading file'
                          : 'Attach file or audio recording'
                    }
                    className="send-button composer-attachment-button"
                    disabled={transcribing || uploadingFile}
                    onClick={() => audioInputRef.current?.click()}
                    type="button"
                  >
                    {transcribing || uploadingFile ? (
                      <LoaderCircle
                        className="activity-message__spinner"
                        size={17}
                      />
                    ) : (
                      <Paperclip size={17} />
                    )}
                  </button>
                  <button
                    aria-label="Start microphone recording"
                    className="send-button composer-record-button"
                    disabled={transcribing || uploadingFile}
                    onClick={() => void startRecording()}
                    title="Record and transcribe"
                    type="button"
                  >
                    <Mic size={17} />
                  </button>
                  <span className="composer-actions__spacer" />
                  {selected.status === 'running' ? (
                    <button
                      aria-label="Queue message"
                      className="send-button send-button--queue"
                      disabled={!composer.trim() || sending}
                      onClick={() => void submitMessage(true)}
                      title="Queue behind the current response"
                      type="button"
                    >
                      <ListPlus size={17} />
                    </button>
                  ) : null}
                  <button
                    aria-label="Send message"
                    className="send-button"
                    disabled={!composer.trim() || sending}
                    onClick={() => void submitMessage()}
                    title="Send immediately"
                    type="button"
                  >
                    <ArrowUp size={19} strokeWidth={2.4} />
                  </button>
                  {selected.status === 'running' ? (
                    <button
                      aria-label="Stop response"
                      className="send-button send-button--stop"
                      disabled={cancelling}
                      onClick={() => void stopSelectedSession()}
                      type="button"
                    >
                      <Square fill="currentColor" size={15} />
                    </button>
                  ) : null}
                </div>
              )}
            </div>
            {(statusline.provider ||
              (statusline.model && selected.runtime?.model) ||
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
                {statusline.provider ? (
                  <span>
                    {providerName(selected.provider)}
                    {executionModeName(selected.executionMode)
                      ? ` · ${executionModeName(selected.executionMode)}`
                      : ''}
                  </span>
                ) : null}
                {statusline.model && selected.runtime?.model ? (
                  <span>{selected.runtime.model}</span>
                ) : null}
                {statusline.effort && selected.runtime?.reasoningEffort ? (
                  <span>effort {selected.runtime.reasoningEffort}</span>
                ) : null}
                {statusline.contextTier && selected.runtime?.contextTier ? (
                  <span>
                    {selected.runtime.contextTokenLimit
                      ? `${compactTokens(
                          selected.runtime.contextTokenLimit,
                        )} context`
                      : 'auto context'}
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
              {recording
                ? `Recording ${recordingDuration(recordingSeconds)}…`
                : transcribing
                ? 'Transcribing audio…'
                : uploadingFile
                  ? 'Uploading file…'
                  : (
                    <>
                      <span className="composer-hint__desktop">
                        Enter send · Shift+Enter newline · Ctrl/⌘+Enter queue
                      </span>
                      <span className="composer-hint__mobile">
                        Tap ↑ to send · Return adds a line
                      </span>
                    </>
                  )}
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
        defaultRuntimes={defaultRuntimes}
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
        computers={computers}
        defaultRuntimes={defaultRuntimes}
        onDefaultRuntimesChange={setDefaultRuntimes}
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
      {cwdOpen && selected ? (
        <ChangeDirectoryDialog
          onChanged={(session) => {
            setSessions((current) => upsertSession(current, session))
            setCwdOpen(false)
          }}
          onClose={() => setCwdOpen(false)}
          session={selected}
        />
      ) : null}
      {workspaceOpen && selected ? (
        <WorkspaceDialog
          initialKind={workspaceInitialKind}
          initialPath={workspaceInitialPath}
          onClose={() => {
            setWorkspaceOpen(false)
            setWorkspaceInitialPath(undefined)
            setWorkspaceInitialKind(undefined)
          }}
          onInsert={insertWorkspaceFile}
          onMoved={(session) => {
            setSessions((current) => upsertSession(current, session))
            setWorkspaceOpen(false)
            setWorkspaceInitialPath(undefined)
            setWorkspaceInitialKind(undefined)
          }}
          session={selected}
        />
      ) : null}
      {addRootOpen ? (
        <AddKnowledgeRootDialog
          computers={computers}
          onClose={() => setAddRootOpen(false)}
          onCreate={createRoot}
        />
      ) : null}

    </div>
  )
}

export default App
