import {
  isValidElement,
  memo,
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
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
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
  ChevronsDownUp,
  Command,
  Eraser,
  Folder,
  FolderInput,
  FolderOpen,
  File as FileIcon,
  FileText,
  GripVertical,
  History,
  List,
  LoaderCircle,
  ListPlus,
  Maximize2,
  Menu,
  MessageSquare,
  Minimize2,
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
  X,
  XCircle,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { MermaidDiagram } from './MermaidDiagram.js'
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
  ActivityKind,
  ActivityStatus,
  BackgroundTask,
  BackgroundTaskSnapshot,
  ChatMessage,
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
  cancelBackgroundTask,
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
  listBackgroundTasks,
  listHistory,
  listKnowledgeEntries,
  listKnowledgeRoots,
  addKnowledgeRoot,
  deleteKnowledgeRoot,
  readKnowledgeFile,
  listDirectories,
  validateSessionDirectory,
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
import { knowledgeRestoreAction } from './knowledge-restore'
import {
  collapseKnowledgeFolder,
  expandKnowledgeFolder,
  knowledgeCrumbs,
  knowledgePathChain,
  knowledgeRootPath,
  knowledgeTreeRows,
  type KnowledgeFolders,
} from './knowledge-tree'
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
  sessionNotificationTags,
} from './pwa'
import {
  attentionCount,
  nativeShell,
  onShellDeepLink,
  openShellSettings,
  sendShellNotification,
  setShellBadge,
  shellSettingsAvailable,
  withdrawShellNotifications,
} from './shell'
import {
  notificationState,
  shellNotifications,
  type SessionNotificationState,
} from './shell-notifications'

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

const SIDEBAR_WIDTH_KEY = 'agentic-remote:sidebar-width'
const SIDEBAR_WIDTH_DEFAULT = 286
const SIDEBAR_WIDTH_MIN = 220
const SIDEBAR_WIDTH_MAX = 560

function clampSidebarWidth(value: number): number {
  return Math.min(Math.max(Math.round(value), SIDEBAR_WIDTH_MIN), SIDEBAR_WIDTH_MAX)
}

function readStoredSidebarWidth(): number {
  try {
    const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY))
    return Number.isFinite(stored) && stored > 0
      ? clampSidebarWidth(stored)
      : SIDEBAR_WIDTH_DEFAULT
  } catch {
    return SIDEBAR_WIDTH_DEFAULT
  }
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

type DefaultSessionFolders = Record<string, string>

type StoredDefaultSessionFolders = {
  version?: number
  folders?: Record<string, unknown>
}

const defaultSessionFoldersStorageKey =
  'agentic-remote:default-session-folders'

type ComposerHistoryState = {
  messages: string[]
  index: number
  draft: string
}

/**
 * How much room a session's Knowledge panel takes. `expanded` covers the
 * conversation so a document can be read at full width without losing the
 * session it belongs to.
 */
type KnowledgePanelMode = 'hidden' | 'docked' | 'expanded'

/** Panel state when no session is selected, so roots stay browsable. */
const sessionlessKnowledgeKey = 'knowledge:no-session'

function readSelectionFromLocation(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }
  const parameters = new URLSearchParams(window.location.search)
  const computerId = parameters.get('computer')
  const sessionId = parameters.get('session')
  return computerId && sessionId
    ? sessionKey({ computerId, id: sessionId })
    : undefined
}

/**
 * Text editing owns its keystrokes. Alt+Arrow moves the caret by word in a
 * composer, so a shortcut must not take it away.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return (
    target.isContentEditable ||
    ['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())
  )
}

/** Where a session's Knowledge panel was last reading. */
type KnowledgePosition = {
  rootId?: string
  path?: string
  file?: string
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

function readDefaultSessionFolders(): DefaultSessionFolders {
  const stored = readStoredOrder<StoredDefaultSessionFolders>(
    defaultSessionFoldersStorageKey,
    {},
  )
  if (
    !stored ||
    typeof stored !== 'object' ||
    stored.version !== 1 ||
    !stored.folders ||
    typeof stored.folders !== 'object' ||
    Array.isArray(stored.folders)
  ) {
    return {}
  }
  const folders: DefaultSessionFolders = {}
  for (const [computerId, value] of Object.entries(stored.folders)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      folders[computerId] = value
    }
  }
  return folders
}

const defaultStatusline: StatuslineSettings = {
  enabled: true,
  computer: true,
  provider: true,
  path: true,
  status: true,
  queue: true,
  backgroundTasks: true,
  sessionId: false,
  model: true,
  effort: true,
  contextTier: true,
  contextUsage: true,
  mode: true,
  permissions: true,
  update: true,
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
  { key: 'backgroundTasks', label: 'Running background tasks' },
  { key: 'sessionId', label: 'Session ID' },
  { key: 'model', label: 'Model' },
  { key: 'effort', label: 'Reasoning effort' },
  { key: 'contextTier', label: 'Context size' },
  { key: 'contextUsage', label: 'Context usage' },
  { key: 'mode', label: 'Agent mode' },
  { key: 'permissions', label: 'Permission mode' },
  { key: 'update', label: 'Agent update available' },
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

function supportsBackgroundTasks(
  computer: ComputerSummary | undefined,
  provider: AgentProvider | undefined,
): boolean {
  if (provider === 'claude' || !computer) {
    return false
  }
  const capability = computer.providers?.find(
    (candidate) => candidate.id === (provider || 'copilot'),
  )
  return capability?.supportsBackgroundTasks === true
}

function taskSnapshot(
  snapshots: Record<string, BackgroundTaskSnapshot>,
  session: Pick<ManagedSession, 'computerId' | 'id'>,
): BackgroundTaskSnapshot | undefined {
  return snapshots[sessionKey(session)]
}

function taskStatusLabel(status: BackgroundTask['status']): string {
  return status === 'queued'
    ? 'Queued'
    : status === 'running'
      ? 'Running'
      : status === 'completed'
        ? 'Completed'
        : status === 'failed'
          ? 'Failed'
          : 'Cancelled'
}

function taskDurationLabel(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1_000))
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
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
  defaultSessionFolders,
  onClose,
  onCreated,
}: {
  open: boolean
  computers: ComputerSummary[]
  defaultComputerId?: string
  defaultRuntimes: DefaultRuntimeSettings
  defaultSessionFolders: DefaultSessionFolders
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
      const initialComputerId = defaultComputerId || available[0]?.id || ''
      setComputerId(initialComputerId)
      setProvider('copilot')
      setCwd(defaultSessionFolders[initialComputerId]?.trim() || '~')
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
  }, [open, defaultComputerId, defaultSessionFolders, available])

  useEffect(() => {
    if (!open || mode !== 'new' || !computerId) {
      return
    }
    let active = true
    const request = ++directoryRequest.current
    const initialPath = defaultSessionFolders[computerId]?.trim() || '~'
    setLoadingDirectories(true)
    setError(undefined)
    const listingRequest = initialPath.startsWith('/')
      ? listDirectories(computerId, initialPath, 'all')
      : listDirectories(computerId, initialPath)
    void listingRequest
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
  }, [computerId, defaultSessionFolders, mode, open])

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
      const listing = await (cwd.startsWith('/')
        ? listDirectories(computerId, path, 'all')
        : listDirectories(computerId, path))
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
              const nextComputerId = event.target.value
              directoryRequest.current += 1
              setComputerId(nextComputerId)
              setProvider('copilot')
              setHistoryKey('')
              setCwd(defaultSessionFolders[nextComputerId]?.trim() || '~')
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

function DefaultSessionFolderControl({
  computer,
  value,
  onChange,
}: {
  computer: ComputerSummary
  value?: string
  onChange: (path?: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [listing, setListing] = useState<DirectoryListing>()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string>()
  const requestRef = useRef(0)

  useEffect(() => {
    if (!open || !computer.online) {
      return
    }
    let active = true
    const request = ++requestRef.current
    const path = value?.trim() || '~'
    setLoading(true)
    setError(undefined)
    void listDirectories(computer.id, path, 'all')
      .then((nextListing) => {
        if (active && request === requestRef.current) {
          setListing(nextListing)
        }
      })
      .catch((caught: unknown) => {
        if (active && request === requestRef.current) {
          setListing(undefined)
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active && request === requestRef.current) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [computer.id, computer.online, open, value])

  async function browse(path: string) {
    const request = ++requestRef.current
    setLoading(true)
    setError(undefined)
    try {
      const nextListing = await listDirectories(computer.id, path, 'all')
      if (request === requestRef.current) {
        setListing(nextListing)
      }
    } catch (caught) {
      if (request === requestRef.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === requestRef.current) {
        setLoading(false)
      }
    }
  }

  async function chooseFolder() {
    if (!listing) {
      return
    }
    setValidating(true)
    setError(undefined)
    try {
      const normalized = (await validateSessionDirectory(
        computer.id,
        listing.path,
      )).trim()
      if (!normalized) {
        throw new Error('The selected folder could not be validated')
      }
      onChange(normalized)
      setOpen(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="default-session-folder">
      <div className="default-session-folder__header">
        <span>
          <strong>{computer.name}</strong>
          <small>{value ? shortPath(value) : 'Home directory (blank)'}</small>
        </span>
        <div className="default-session-folder__actions">
          <button
            aria-expanded={open}
            aria-label={`Browse default session folder for ${computer.name}`}
            className="secondary-button"
            disabled={!computer.online}
            onClick={() => {
              setOpen((current) => !current)
              setError(undefined)
            }}
            type="button"
          >
            {open ? 'Close' : 'Browse'}
          </button>
          {value ? (
            <button
              aria-label={`Remove default session folder for ${computer.name}`}
              className="icon-button icon-button--danger"
              disabled={validating}
              onClick={() => {
                setOpen(false)
                setError(undefined)
                onChange()
              }}
              type="button"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>
      {!computer.online ? (
        <small className="default-session-folder__offline">
          Connect to browse this computer.
        </small>
      ) : null}
      {open ? (
        <div className="folder-picker default-session-folder__picker">
          <div className="folder-picker__toolbar">
            <button
              aria-label={`Parent folder for ${computer.name}`}
              className="icon-button"
              disabled={!listing?.parent || loading || validating}
              onClick={() => void browse(listing?.parent || '~')}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="folder-picker__path">
              <Folder size={15} />
              <strong>{listing?.path || value || '~'}</strong>
            </div>
          </div>
          <div
            aria-label={`Folders on ${computer.name}`}
            className="folder-picker__list"
            role="listbox"
          >
            {loading ? (
              <p>Loading folders…</p>
            ) : listing?.directories.length ? (
              listing.directories.map((directory) => (
                <button
                  disabled={validating}
                  key={directory.path}
                  onClick={() => void browse(directory.path)}
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
              <p>{listing ? 'No subfolders here.' : 'Folder unavailable.'}</p>
            )}
          </div>
          <p className="folder-picker__hint">
            Select <strong>{listing?.path || value || '~'}</strong> as the
            default for new sessions. The folder is checked against this
            computer’s session roots before it is saved.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="primary-button app-settings-section__action"
            disabled={!listing || loading || validating}
            onClick={() => void chooseFolder()}
            type="button"
          >
            {validating ? 'Validating…' : 'Use this folder'}
          </button>
        </div>
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
  defaultSessionFolders,
  onDefaultSessionFoldersChange,
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
  defaultSessionFolders: DefaultSessionFolders
  onDefaultSessionFoldersChange: (settings: DefaultSessionFolders) => void
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
        const hasOfflineProviderComputer = computers.some(
          (computer) => !computer.isLocal && !computer.online,
        )
        // Discovery only asks computers that advertise the provider, and a
        // node can synthesize Copilot-only metadata it never confirmed. Any
        // online computer left unasked is therefore an unknown rather than a
        // no, and a saved model must not be retired on an unknown.
        const queried = new Set(
          sources
            .filter((source) => source.provider === provider)
            .map((source) => source.computer.id),
        )
        const hasUnqueriedProviderComputer = computers.some(
          (computer) => computer.online && !queried.has(computer.id),
        )
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
          complete[provider] =
            !hasOfflineProviderComputer &&
            !hasUnqueriedProviderComputer &&
            providerResults.every((result) => result.status === 'fulfilled')
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
      <div className="app-settings-dialog__sections">
      {shellSettingsAvailable() && (
        <section className="app-settings-section">
          <h3>Hub connection</h3>
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
        <h3>Default session folders</h3>
        <p className="dialog-message">
          Choose one optional folder per computer for new sessions. Existing
          sessions keep their current working directories. Leave a computer
          blank to start in its home directory.
        </p>
        <div className="default-session-folder-list">
          {computers.map((computer) => (
            <DefaultSessionFolderControl
              computer={computer}
              key={computer.id}
              onChange={(path) => {
                const next = { ...defaultSessionFolders }
                if (path) {
                  next[computer.id] = path
                } else {
                  delete next[computer.id]
                }
                onDefaultSessionFoldersChange(next)
              }}
              value={defaultSessionFolders[computer.id]}
            />
          ))}
        </div>
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

      <section className="app-settings-section">
        <h3>Keyboard shortcuts</h3>
        <p className="dialog-message">
          Available on a keyboard, outside dialogs and the message box.
        </p>
        <ul className="shortcut-list">
          {[
            ['Next session', 'Alt + \u2193'],
            ['Previous session', 'Alt + \u2191'],
            ['Open or close knowledge', 'Alt + K'],
            ['Expand or minimize knowledge', 'Alt + Shift + K'],
            ['View background tasks', 'Alt + T'],
            ['Recall previous message', '\u2191'],
          ].map(([label, keys]) => (
            <li key={label}>
              <span>{label}</span>
              <kbd>{keys}</kbd>
            </li>
          ))}
        </ul>
      </section>
      </div>
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

function activityKindFromMessage(message: ChatMessage): ActivityKind {
  if (message.activityKind) {
    return message.activityKind
  }
  const title = message.content.split('\n', 1)[0] || ''
  if (/^Skill \(/.test(title)) {
    return 'skill'
  }
  if (/^Agent \(/.test(title)) {
    return 'agent'
  }
  return 'tool'
}

function activityStatusFromMessage(message: ChatMessage): ActivityStatus {
  return message.activityStatus || 'running'
}

function compactActivityText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function activityPresentation(message: ChatMessage): {
  title: string
  kind: ActivityKind
  name: string
  origin?: string
  summary?: string
  arguments?: string
} {
  const [title = '', ...detailLines] = message.content.split('\n')
  const detail = compactActivityText(detailLines.join('\n'))
  const kind = activityKindFromMessage(message)
  if (kind === 'skill') {
    const match = title.match(/^Skill \((.+)\)$/)
    return {
      title,
      kind,
      name: match ? `skill(${match[1]})` : 'skill',
      arguments: detail || undefined,
    }
  }
  if (kind === 'agent') {
    const match = title.match(/^Agent \(([^)]+)\)(?: · (.*))?$/)
    return {
      title,
      kind,
      name: match ? `agent(${match[1]})` : 'agent',
      summary: match?.[2],
      arguments: detail || undefined,
    }
  }
  if (title.startsWith('MCP ·')) {
    const parts = title.split(' · ')
    const hasServer = parts.length > 2
    const server = hasServer ? parts[1] || '' : ''
    const operation = hasServer ? parts[2] || 'tool' : parts[1] || 'tool'
    return {
      title,
      kind,
      name: operation,
      origin: server ? `(MCP: ${server})` : '(MCP)',
      summary: parts.slice(3).join(' · ') || undefined,
      arguments: detail || undefined,
    }
  }
  const [name = 'tool', ...summaryParts] = title.split(' · ')
  return {
    title,
    kind,
    name,
    summary: summaryParts.join(' · ') || undefined,
    arguments: detail || undefined,
  }
}

function formatActivityDuration(durationMs?: number): string {
  if (
    durationMs === undefined ||
    !Number.isFinite(durationMs) ||
    durationMs < 0
  ) {
    return '—'
  }
  const seconds = durationMs / 1_000
  if (seconds < 1) {
    return `${Math.round(durationMs)}ms`
  }
  if (seconds < 10) {
    return `${seconds.toFixed(1)}s`
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`
}

function activityStatusGlyph(status: ActivityStatus): string {
  switch (status) {
    case 'completed':
      return '●'
    case 'failed':
      return '×'
    case 'pending':
      return '·'
    case 'running':
      return '○'
  }
}

function activityStatusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    case 'pending':
      return 'Pending'
    case 'running':
      return 'Running'
  }
}

function ActivityMessage({ message }: { message: ChatMessage }) {
  const presentation = activityPresentation(message)
  const status = activityStatusFromMessage(message)
  const isMcp = message.content.startsWith('MCP ·')
  const isAgent = presentation.kind === 'agent'
  const isHeading =
    presentation.kind === 'skill' || presentation.kind === 'agent'
  const result =
    message.activityResult ||
    (status === 'failed'
      ? 'Error: tool failed; inspect the session log'
      : isAgent && status !== 'completed'
        ? 'still working'
        : undefined)
  const legacyTitle = presentation.title
  const duration = formatActivityDuration(message.activityDurationMs)
  const accessibleDetails = [
    `${activityStatusLabel(status)}: ${legacyTitle}`,
    result,
    message.activityDurationMs === undefined ? undefined : `${duration} duration`,
  ]
    .filter(Boolean)
    .join('; ')
  return (
    <div
      aria-label={accessibleDetails}
      className={`activity-message activity-message--${status}${
        isMcp ? ' activity-message--mcp' : ''
      }${isAgent ? ' activity-message--agent' : ''}${
        isHeading ? ' activity-message--heading' : ''
      }`}
      aria-level={isHeading ? 3 : undefined}
      role={isHeading ? 'heading' : undefined}
      title={legacyTitle}
    >
      <span
        aria-hidden="true"
        className="activity-message__glyph"
      >
        {activityStatusGlyph(status)}
      </span>
      <span className="activity-message__body">
        <strong className="activity-message__name">{presentation.name}</strong>
        {presentation.origin ? (
          <span className="activity-message__origin">
            {' '}
            {presentation.origin}
          </span>
        ) : null}
        {presentation.summary ? (
          <>
            <span className="activity-message__separator"> · </span>
            <span className="activity-message__summary">
              {compactActivityText(presentation.summary)}
            </span>
          </>
        ) : null}
        {presentation.arguments ? (
          <>
            <span className="activity-message__separator"> · </span>
            <span className="activity-message__arguments">
              {presentation.arguments}
            </span>
          </>
        ) : null}
        {result ? (
          <>
            <span className="activity-message__separator"> · </span>
            <span
              className="activity-message__result"
              title={result}
            >
              {compactActivityText(result)}
            </span>
          </>
        ) : null}
      </span>
      <span
        aria-label={
          message.activityDurationMs === undefined
            ? 'No duration recorded'
            : `${duration} duration`
        }
        className="activity-message__duration"
      >
        {duration}
      </span>
      {legacyTitle !== presentation.name ? (
        <span
          aria-hidden="true"
          className="activity-message__legacy-title"
        >
          {legacyTitle}
        </span>
      ) : null}
    </div>
  )
}

function ActivityArticle({
  message,
  currentToolId,
}: {
  message: ChatMessage
  currentToolId?: string
}) {
  return (
    <article
      className={`message message--activity ${
        message.id === currentToolId
          ? 'tool-activity-slot'
          : 'tool-activity-history'
      }`}
      key={message.id}
    >
      <ActivityMessage message={message} />
    </article>
  )
}

/**
 * One transcript row. Each parses its own Markdown, so a memo keeps a new
 * message from re-parsing every earlier one: the content is immutable once
 * written, and only a streaming row changes.
 */
function sameMessage(left: ChatMessage, right: ChatMessage): boolean {
  return (
    left.id === right.id &&
    left.role === right.role &&
    left.content === right.content &&
    left.createdAt === right.createdAt &&
    left.streaming === right.streaming
  )
}

const TranscriptMessage = memo(function TranscriptMessage({
  message,
}: {
  message: ChatMessage
}) {
  return (
    <article className={`message message--${message.role}`} key={message.id}>
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
          title={messageDateTimeFormatter.format(new Date(message.createdAt))}
        >
          {messageTimeFormatter.format(new Date(message.createdAt))}
        </time>
      </div>
      <div className="message__content">
        {message.content ? (
          <ReactMarkdown
            components={mermaidComponents}
            remarkPlugins={[remarkGfm]}
          >
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
}, (previous, next) => sameMessage(previous.message, next.message))

/**
 * The transcript is the largest thing on screen and does not change while the
 * composer is typed into, so it is kept out of that render. Rebuilding a few
 * thousand rows for every keystroke is what made typing lag.
 */
/**
 * How much history is rendered at once. Everything older is kept in memory and
 * revealed on request, so a long session does not pay for its whole past on
 * every switch.
 */
const RENDERED_HISTORY = 250

const ConversationMessages = memo(function ConversationMessages({
  messages: allMessages,
  currentToolId,
  showAll,
  onShowAll,
}: {
  messages: ChatMessage[]
  currentToolId?: string
  // Held by the conversation rather than here. A snapshot refresh installs
  // session summaries, which carry no messages on purpose, so this component
  // is unmounted and mounted again around every reconnect and every return to
  // the tab. State of its own would not survive that, and a transcript the
  // reader had opened would close under them.
  showAll: boolean
  onShowAll: () => void
}) {
  const cut = showAll
    ? 0
    : Math.max(0, allMessages.length - RENDERED_HISTORY)
  const tail = cut ? allMessages.slice(cut) : allMessages
  // Some rows from before the cut have to come with it. An activity that is
  // still running is one: the separate activity indicator is suppressed while
  // one exists, so dropping the row leaves nothing on screen saying anything
  // is happening. The parent of a visible child is another, or the child is
  // lifted out of the group it belongs to and read as work of its own.
  const carried: ChatMessage[] = []
  if (cut > 0) {
    const wanted = new Set<string>()
    for (const message of tail) {
      if (message.role === 'activity' && message.activityGroupId) {
        wanted.add(message.activityGroupId)
      }
    }
    for (let index = cut - 1; index >= 0; index -= 1) {
      const message = allMessages[index]
      if (message.role !== 'activity') {
        continue
      }
      if (message.activityStatus === 'running' || wanted.has(message.id)) {
        carried.unshift(message)
        // Groups nest, so the parent's own parent is needed as well.
        if (message.activityGroupId) {
          wanted.add(message.activityGroupId)
        }
      }
    }
  }
  const hidden = cut - carried.length
  const messages = carried.length ? [...carried, ...tail] : tail
  const activityMessages = new Map(
    messages
      .filter((message) => message.role === 'activity')
      .map((message) => [message.id, message]),
  )
  const activityIndexes = new Map(
    messages
      .map((message, index) => [message.id, index] as const)
      .filter(([id]) => activityMessages.has(id)),
  )
  const activityChildren = new Map<string, ChatMessage[]>()
  const groupedActivityIds = new Set<string>()
  for (const [parentId, parentIndex] of activityIndexes) {
    // A child can own activity of its own, and those entries are grouped under
    // it rather than this parent. Walking over them keeps the parent's later
    // tools in its group instead of stopping at the first nested one and
    // leaving them at the top level.
    const owned = new Set<string>([parentId])
    for (let index = parentIndex + 1; index < messages.length; index += 1) {
      const message = messages[index]
      if (
        !message ||
        message.role !== 'activity' ||
        !message.activityGroupId ||
        !owned.has(message.activityGroupId)
      ) {
        break
      }
      owned.add(message.id)
      if (message.activityGroupId !== parentId) {
        continue
      }
      const children = activityChildren.get(parentId) || []
      children.push(message)
      activityChildren.set(parentId, children)
      groupedActivityIds.add(message.id)
    }
  }
  const renderActivity = (message: ChatMessage): ReactNode => {
    const children = activityChildren.get(message.id) || []
    if (children.length === 0) {
      return (
        <ActivityArticle
          currentToolId={currentToolId}
          key={message.id}
          message={message}
        />
      )
    }
    const kind = activityKindFromMessage(message)
    const groupLabel =
      kind === 'skill' ? 'Skill' : kind === 'agent' ? 'Agent' : 'Activity'
    return (
      <div
        aria-label={`${groupLabel} ${
          activityPresentation(message).name
        } activity group`}
        className="activity-group"
        key={message.id}
      >
        <ActivityArticle
          currentToolId={currentToolId}
          message={message}
        />
        <div className="activity-group__children">
          {children.map((child) => renderActivity(child))}
        </div>
      </div>
    )
  }
  const rendered: ReactNode[] = []
  if (hidden > 0) {
    rendered.push(
      <button
        className="transcript-earlier"
        key="show-earlier"
        onClick={onShowAll}
        type="button"
      >
        {`Show ${hidden} earlier message${hidden === 1 ? '' : 's'}`}
      </button>,
    )
  }
  for (const message of messages) {
    if (message.role === 'activity') {
      if (groupedActivityIds.has(message.id)) {
        continue
      }
      rendered.push(renderActivity(message))
      continue
    }
    rendered.push(
      <TranscriptMessage key={message.id} message={message} />,
    )
  }
  return <div className="message-stack">{rendered}</div>
})

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
  backgroundTasks,
  onSelect,
  onOpenTasks,
}: {
  session: ManagedSession
  selected: boolean
  backgroundTasks?: BackgroundTaskSnapshot
  onSelect: () => void
  onOpenTasks?: () => void
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
  const runningBackgroundTasks = backgroundTasks?.runningCount || 0
  const taskCount = backgroundTasks?.tasks.length || 0
  const foregroundStatusAllowsTaskTreatment =
    session.status === 'idle' || session.status === 'running'
  const backgroundTaskActive =
    runningBackgroundTasks > 0 &&
    foregroundStatusAllowsTaskTreatment
  return (
    <button
      aria-current={selected ? 'page' : undefined}
      className={`session-item session-item--tone-${computerTone(
        session.computerId,
      )} ${backgroundTaskActive ? 'session-item--background-running' : ''} ${
        selected ? 'session-item--active' : ''
      } ${
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
        {taskCount > 0 ? (
          <span
            aria-label={
              onOpenTasks ? `View background tasks for ${session.title}` : undefined
            }
            className={`session-item__tasks ${
              onOpenTasks ? 'session-item__tasks--interactive' : ''
            }`}
            onClick={
              onOpenTasks
                ? (event) => {
                    event.stopPropagation()
                    onOpenTasks()
                  }
                : undefined
            }
            onKeyDown={
              onOpenTasks
                ? (event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') {
                      return
                    }
                    event.preventDefault()
                    event.stopPropagation()
                    onOpenTasks()
                  }
                : undefined
            }
            role={onOpenTasks ? 'button' : undefined}
            tabIndex={onOpenTasks ? 0 : undefined}
          >
            {runningBackgroundTasks > 0
              ? `${runningBackgroundTasks} running task${
                  runningBackgroundTasks === 1 ? '' : 's'
                }`
              : `${taskCount} task${taskCount === 1 ? '' : 's'}`}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function SortableComputerGroup({
  computer,
  sessions,
  backgroundTasks,
  selectedKey,
  showComputerHandle,
  onSelectSession,
  onOpenSessionTasks,
}: {
  computer: ComputerSummary
  sessions: ManagedSession[]
  backgroundTasks: Record<string, BackgroundTaskSnapshot>
  selectedKey?: string
  showComputerHandle: boolean
  onSelectSession: (session: ManagedSession) => void
  onOpenSessionTasks: (session: ManagedSession) => void
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
              backgroundTasks={taskSnapshot(backgroundTasks, session)}
              onOpenTasks={() => onOpenSessionTasks(session)}
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

function BackgroundTaskCard({
  task,
  cancelling,
  onCancel,
}: {
  task: BackgroundTask
  cancelling: boolean
  onCancel: () => void
}) {
  const statusIcon =
    task.status === 'failed' ? (
      <XCircle size={14} />
    ) : task.status === 'completed' ? (
      <CheckCircle2 size={14} />
    ) : task.status === 'running' ? (
      <LoaderCircle className="activity-message__spinner" size={14} />
    ) : (
      <List size={14} />
    )
  const progress = task.progress
  return (
    <article className={`background-task background-task--${task.status}`}>
      <header className="background-task__header">
        <div className="background-task__title">
          <span className="background-task__status-icon">{statusIcon}</span>
          <span>
            <strong>{task.description}</strong>
            <small>
              {task.type === 'agent'
                ? task.agentType || 'Background agent'
                : task.command || 'Background shell'}
            </small>
          </span>
        </div>
        <span className="background-task__status">
          {taskStatusLabel(task.status)}
        </span>
      </header>
      <dl className="background-task__metadata">
        <div>
          <dt>Started</dt>
          <dd>
            <time dateTime={task.startedAt}>
              {messageDateTimeFormatter.format(new Date(task.startedAt))}
            </time>
          </dd>
        </div>
        {task.completedAt ? (
          <div>
            <dt>Finished</dt>
            <dd>
              <time dateTime={task.completedAt}>
                {messageDateTimeFormatter.format(new Date(task.completedAt))}
              </time>
            </dd>
          </div>
        ) : null}
        {task.activeTimeMs !== undefined ? (
          <div>
            <dt>Active time</dt>
            <dd>{taskDurationLabel(task.activeTimeMs)}</dd>
          </div>
        ) : null}
        {task.pid !== undefined || progress?.pid !== undefined ? (
          <div>
            <dt>PID</dt>
            <dd>{task.pid || progress?.pid}</dd>
          </div>
        ) : null}
      </dl>
      {task.prompt ? (
        <details className="background-task__details">
          <summary>Prompt</summary>
          <pre>{task.prompt}</pre>
        </details>
      ) : null}
      {progress?.latestIntent ? (
        <p className="background-task__intent">{progress.latestIntent}</p>
      ) : null}
      {progress?.recentActivity?.length ? (
        <div className="background-task__progress">
          <strong>Recent activity</strong>
          <ul>
            {progress.recentActivity.map((line, index) => (
              <li key={`${line.timestamp}-${index}`}>
                <time dateTime={line.timestamp}>
                  {messageTimeFormatter.format(new Date(line.timestamp))}
                </time>
                <span>{line.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {progress?.recentOutput ? (
        <div className="background-task__output">
          <strong>Output</strong>
          <pre>{progress.recentOutput}</pre>
        </div>
      ) : null}
      {task.result || task.latestResponse ? (
        <div className="background-task__output">
          <strong>Result</strong>
          <pre>{task.result || task.latestResponse}</pre>
        </div>
      ) : null}
      {task.error ? (
        <div className="background-task__error" role="alert">
          <strong>Error</strong>
          <pre>{task.error}</pre>
        </div>
      ) : null}
      {task.canCancel ? (
        <button
          className="secondary-button background-task__cancel"
          disabled={cancelling}
          onClick={onCancel}
          type="button"
        >
          {cancelling ? 'Cancelling…' : 'Cancel task'}
        </button>
      ) : null}
    </article>
  )
}

function BackgroundTasksDialog({
  open,
  sessionTitle,
  snapshot,
  loading,
  cancellingTaskId,
  onClose,
  onRefresh,
  onCancel,
}: {
  open: boolean
  sessionTitle: string
  snapshot: BackgroundTaskSnapshot
  loading: boolean
  cancellingTaskId?: string
  onClose: () => void
  onRefresh: () => void
  onCancel: (taskId: string) => void
}) {
  if (!open) {
    return null
  }
  return (
    <DialogFrame
      className="background-tasks-dialog"
      eyebrow="Tasks"
      onClose={onClose}
      title={`Background tasks · ${sessionTitle}`}
    >
      <div className="background-tasks-dialog__toolbar">
        <p>
          <strong>{snapshot.runningCount}</strong>{' '}
          {snapshot.runningCount === 1
            ? 'background task is running'
            : 'background tasks are running'}
        </p>
        <button
          aria-label="Refresh background tasks"
          className="icon-button"
          disabled={loading}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCw
            className={loading ? 'activity-message__spinner' : ''}
            size={16}
          />
        </button>
      </div>
      {!snapshot.supported ? (
        <p className="dialog-message">
          This Copilot runtime does not expose background task monitoring.
        </p>
      ) : snapshot.tasks.length === 0 ? (
        <p className="background-tasks-dialog__empty">
          No background tasks are currently tracked.
        </p>
      ) : (
        <div aria-label="Background task list" className="background-task-list">
          {snapshot.tasks.map((task) => (
            <BackgroundTaskCard
              cancelling={cancellingTaskId === task.id}
              key={task.id}
              onCancel={() => onCancel(task.id)}
              task={task}
            />
          ))}
        </div>
      )}
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
    ...mermaidComponents,
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

/** Reads the text of a fenced block, which arrives as its children. */
function fencedSource(children: ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  if (Array.isArray(children)) {
    return children.map((child) => fencedSource(child as ReactNode)).join('')
  }
  return ''
}

const mermaidComponents = {
  // Replacing the fenced block at the `pre` level, not the `code` level: an
  // override on `code` leaves React Markdown's own `<pre>` around the result,
  // which boxes the diagram in a code block and doubles the one the source
  // fallback draws for itself.
  pre({
    children,
    node: _node,
    ...rest
  }: {
    children?: ReactNode
    node?: unknown
  }) {
    const source = mermaidFencedSource(children)
    if (source === undefined) {
      return <pre {...rest}>{children}</pre>
    }
    return <MermaidDiagram source={source} />
  },
  code({
    children,
    className,
    // React Markdown hands every custom component its own syntax tree node.
    // Forwarding it would put an object on a DOM attribute.
    node: _node,
    ...rest
  }: {
    children?: ReactNode
    className?: string
    node?: unknown
  }) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  },
}

/** The text of a fenced mermaid block, or nothing if that is not what it is. */
function mermaidFencedSource(children: ReactNode): string | undefined {
  const fence = Array.isArray(children)
    ? children.find((child) => isValidElement(child))
    : children
  if (!isValidElement(fence)) {
    return undefined
  }
  const props = fence.props as { className?: string; children?: ReactNode }
  if (!/\blanguage-mermaid\b/.test(props.className || '')) {
    return undefined
  }
  return fencedSource(props.children).trimEnd()
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
  const [backgroundTaskSnapshots, setBackgroundTaskSnapshots] = useState<
    Record<string, BackgroundTaskSnapshot>
  >({})
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
  // Reading is a workspace mode: it survives a session switch so a document
  // being read full width is not dismissed by moving to another session.
  const [knowledgeMode, setKnowledgeModeState] = useState<KnowledgePanelMode>(
    () => readStoredOrder('agentic-remote:knowledge-mode', 'hidden'),
  )
  const [knowledgePositions, setKnowledgePositions] = useState<
    Record<string, KnowledgePosition>
  >(() => readStoredOrder('agentic-remote:knowledge-session-positions', {}))
  // Roots are browsable without a session, so reading position is kept under
  // a reserved key rather than being unreachable.
  const knowledgePanelKey = selectedKey || sessionlessKnowledgeKey
  const [roots, setRoots] = useState<KnowledgeRoot[]>([])
  const [activeRootId, setActiveRootId] = useState<string | undefined>(() =>
    readStoredOrder<string | undefined>(
      'agentic-remote:knowledge-root',
      undefined,
    ),
  )
  // Folders are cached per path and loaded only when expanded, so the tree can
  // show structure without refetching a branch every time it reopens.
  const [knowledgeFolders, setKnowledgeFolders] = useState<KnowledgeFolders>({})
  const [expandedKnowledge, setExpandedKnowledge] = useState<string[]>([])
  const [knowledgePath, setKnowledgePath] = useState(knowledgeRootPath)
  const [knowledgeRootsOpen, setKnowledgeRootsOpen] = useState(() =>
    readStoredOrder('agentic-remote:knowledge-roots-open', true),
  )
  const [knowledgeFile, setKnowledgeFile] = useState<WorkspaceFile>()
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [addRootOpen, setAddRootOpen] = useState(false)
  // A single generation for every asynchronous knowledge operation. Anything
  // that changes what the panel should show bumps it once; every loader
  // captures it and checks it before writing. Three separate counters could
  // be bumped in different combinations, and each wrong combination was a
  // race.
  const knowledgeRequest = useRef(0)
  const knowledgeRestoredKey = useRef<string>(undefined)
  const knowledgeOwnerKey = useRef<string>(undefined)
  // The session whose content the panel is actually showing.
  const knowledgeViewOwnerKey = useRef<string>(undefined)
  // Sessions being cleared. Clear removes a session and creates a replacement,
  // and the removal reaches this client before the replacement id does, so
  // pruning has to wait or the position is lost on the way through.
  const clearingSessions = useRef(new Set<string>())
  const forgetKnowledgeSessionRef = useRef<(key: string) => void>(() => {})
  const moveKnowledgeSessionRef = useRef<(from: string, to: string) => void>(
    () => {},
  )
  const migrateSessionStateRef = useRef<(from: string, to: string) => void>(
    () => {},
  )
  // Which transcripts the reader has opened past the window, by session.
  const [expandedTranscripts, setExpandedTranscripts] = useState<
    Record<string, boolean>
  >({})
  // Stable per session. A fresh closure on every render defeats the memo the
  // transcript relies on, so every keystroke in the composer would rebuild
  // every row and walk the hidden history again.
  const expandSelectedTranscript = useCallback(() => {
    if (!selectedKey) {
      return
    }
    setExpandedTranscripts((current) => ({ ...current, [selectedKey]: true }))
  }, [selectedKey])
  const loadKnowledgeFolderRef = useRef<
    (rootId: string, path: string) => Promise<unknown>
  >(async () => undefined)
  // Replacements announced by a removal but not yet delivered by their upsert.
  // The fallback below must not treat one as a missing session and select
  // something unrelated in the gap.
  const pendingReplacements = useRef(new Set<string>())
  // Lineage is carried in every snapshot, so a replacement is claimed once
  // rather than again on each refresh.
  const adoptedReplacements = useRef(new Set<string>())
  // The generation a root listing was last requested under, so a load
  // abandoned by a newer generation is retried instead of waited on.
  const knowledgeRootLoadGeneration = useRef(-1)
  // Captured before the first synchronisation, so a direct session link is not
  // erased by the address being rewritten while sessions are still loading.
  const initialUrlSelection = useRef(readSelectionFromLocation())
  const knowledgeRestoreStartedKey = useRef<string>(undefined)
  const applyKnowledgeScrollRef = useRef<(key: string) => void>(() => {})
  // Whether the next selection change is the user navigating (a new history
  // entry) or the app resolving one for them (the same entry, corrected).
  const historyIntentRef = useRef<'push' | 'replace'>('replace')
  const appShortcutRef = useRef<(event: globalThis.KeyboardEvent) => void>(
    () => {},
  )
  const syncSelectionAddressRef = useRef<() => void>(() => {})
  // Restoring a session's panel reads the newest values without re-running
  // whenever the reader moves, which would fight the user's own navigation.
  const knowledgePositionsRef = useRef<Record<string, KnowledgePosition>>({})
  const restoreKnowledgeRef = useRef<
    (position: KnowledgePosition, key: string) => void
  >(() => {})
  // Toggling the panel must not send the tree back to the top, so its scroll
  // offset is kept across hides and session switches.
  const knowledgeTreeRef = useRef<HTMLDivElement>(null)
  const knowledgeScrollTops = useRef<Record<string, number>>({})
  // Set while a session's tree is still being rebuilt, so the saved offset is
  // applied to the new content instead of the tree that is going away.
  const knowledgePendingScrollKey = useRef<string>(undefined)
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
  const legacyKnowledgeAdopted = useRef(false)
  const openedFromLink = useRef(readSelectionFromLocation() !== undefined)
  const restoredKnowledgeExpansion = useRef(
    readStoredOrder<Record<string, string[]>>(
      'agentic-remote:knowledge-expanded',
      {},
    ),
  )
  // The folder the breadcrumb and the remembered position follow. It is only
  // meaningful once that folder actually loaded.
  const knowledgeListing = knowledgeFolders[knowledgePath]?.listing
  const knowledgeRows = useMemo(
    () => knowledgeTreeRows(knowledgeFolders, expandedKnowledge),
    [expandedKnowledge, knowledgeFolders],
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
  const [movingSessionFolder, setMovingSessionFolder] = useState(false)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth)
  const [resizingSidebar, setResizingSidebar] = useState(false)
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [computersOpen, setComputersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [statuslineOpen, setStatuslineOpen] = useState(false)
  const [backgroundTasksOpen, setBackgroundTasksOpen] = useState(false)
  const [backgroundTaskRefreshVersion, setBackgroundTaskRefreshVersion] =
    useState(0)
  const [loadingBackgroundTasks, setLoadingBackgroundTasks] = useState(false)
  const [cancellingBackgroundTaskId, setCancellingBackgroundTaskId] =
    useState<string>()
  const [mutedSessions, setMutedSessions] = useState<string[]>([])
  const mutedSessionsRef = useRef<string[]>([])
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
  const [defaultSessionFolders, setDefaultSessionFolders] =
    useState<DefaultSessionFolders>(readDefaultSessionFolders)
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
  const [followingLatest, setFollowingLatest] = useState(true)
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
  const backgroundTaskSnapshotsRef = useRef(backgroundTaskSnapshots)
  const computersRef = useRef(computers)
  const backgroundTasksOpenRef = useRef(backgroundTasksOpen)
  const selectedKeyStateRef = useRef(selectedKey)
  const backgroundTaskRequestsRef = useRef(new Set<string>())
  const queuedBackgroundTaskRefreshesRef = useRef(new Set<string>())
  const backgroundTaskEventSequenceRef = useRef(new Map<string, number>())
  const seenBackgroundTaskRefreshRef = useRef(0)
  const sessionEventSequenceRef = useRef(new Map<string, number>())

  // Silence changes on its own schedule: counting every session event would
  // treat an ordinary status update as one, and discard the answer's own
  // sessions for no reason. Only what actually moves a mute is counted.
  const muteRevisionRef = useRef(0)
  const muteSessionRevisionRef = useRef(new Map<string, number>())
  const recordMuteChange = useCallback((...keys: string[]) => {
    muteRevisionRef.current += 1
    for (const key of keys) {
      muteSessionRevisionRef.current.set(key, muteRevisionRef.current)
    }
  }, [])

  // A settings answer describes the world as it was when the request went out.
  // A session whose silence changed in the meantime is described more recently
  // by that change than by the answer, so the answer does not get to speak for
  // it: a clear moves the mute to a replacement it has never heard of.
  useEffect(() => {
    mutedSessionsRef.current = mutedSessions
  }, [mutedSessions])

  /**
   * Follows a clear this client never saw announced.
   *
   * Clearing is announced as a removal and an arrival, and a client that is
   * asleep or offline receives neither: it simply comes back to a session it
   * does not recognise. The replacement carries what it replaced, so what the
   * old session was holding is claimed from the snapshot alone instead of
   * being stranded under an id that is gone.
   */
  const claimReplacedSessions = useCallback((loaded: ManagedSession[]) => {
    for (const session of loaded) {
      if (!session.replacedSessionId) {
        continue
      }
      const predecessor = sessionKey({
        computerId: session.computerId,
        id: session.replacedSessionId,
      })
      if (adoptedReplacements.current.has(predecessor)) {
        continue
      }
      adoptedReplacements.current.add(predecessor)
      migrateSessionStateRef.current(predecessor, sessionKey(session))
      setSelectedKey((current) =>
        current === predecessor ? sessionKey(session) : current,
      )
    }
  }, [])

  const applyMutedSessions = useCallback(
    (incoming: string[], startedAtRevision: number) => {
      setMutedSessions((current) => {
        const reconciled = new Set(incoming)
        for (const key of new Set([...current, ...reconciled])) {
          if (
            (muteSessionRevisionRef.current.get(key) || 0) <= startedAtRevision
          ) {
            continue
          }
          if (current.includes(key)) {
            reconciled.add(key)
          } else {
            reconciled.delete(key)
          }
        }
        return [...reconciled]
      })
    },
    [],
  )
  const computerEventSequenceRef = useRef(new Map<string, number>())
  const sidebarResizeRef = useRef<
    | { pointerId: number; startX: number; startWidth: number; width: number }
    | undefined
  >(undefined)

  function commitSidebarWidth(width: number) {
    const next = clampSidebarWidth(width)
    setSidebarWidth(next)
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(next))
    } catch {
      // A blocked storage quota should not stop the drag from working.
    }
  }

  function sidebarResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    sidebarResizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: sidebarWidth,
      width: sidebarWidth,
    }
    // Not every environment implements pointer capture; the drag still works
    // without it because the move handler is bound to the same element.
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setResizingSidebar(true)
  }

  function sidebarResizeMove(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = sidebarResizeRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return
    }
    // Recorded on the gesture as well as in state: a release can arrive
    // before React commits this update, and the release must persist the width
    // the pointer actually ended on.
    const next = clampSidebarWidth(
      gesture.startWidth + (event.clientX - gesture.startX),
    )
    gesture.width = next
    setSidebarWidth(next)
  }

  function sidebarResizeEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = sidebarResizeRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return
    }
    sidebarResizeRef.current = undefined
    setResizingSidebar(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
    commitSidebarWidth(gesture.width)
  }

  function sidebarResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 32 : 8
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      commitSidebarWidth(sidebarWidth - step)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      commitSidebarWidth(sidebarWidth + step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      commitSidebarWidth(SIDEBAR_WIDTH_DEFAULT)
    }
  }

  const sidebarGestureRef = useRef<
    | {
        startX: number
        startY: number
        startedAt: number
        action: 'open' | 'close'
      }
    | undefined
  >(undefined)
  const sortableDragActiveRef = useRef(false)

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
  // The native shell shows how many sessions are blocked on the user. This is
  // a no-op in a browser, so the badge never needs a capability check here.
  useEffect(() => {
    setShellBadge(attentionCount(sessions))
  }, [sessions])
  // An embedded webview gets no Web Push, so inside the shell the app raises
  // its own notifications from the live session stream. A browser keeps using
  // the hub's Web Push and must not double-notify, hence the shell check.
  const notificationStateRef = useRef<Map<string, SessionNotificationState>>(
    new Map(),
  )
  useEffect(() => {
    if (!nativeShell()) {
      return
    }
    const previous = notificationStateRef.current
    notificationStateRef.current = notificationState(sessions)
    for (const notification of shellNotifications(sessions, {
      previous,
      computerNames: new Map(
        computers.map((computer) => [computer.id, computer.name]),
      ),
      mutedKeys: mutedSessions,
      activeKey: selectedKey,
      documentVisible: document.visibilityState === 'visible',
    })) {
      sendShellNotification(notification)
    }
  }, [computers, mutedSessions, selectedKey, sessions])
  // An `agentic://` link may arrive before the session list has loaded, so the
  // key is set optimistically and resolves once that session appears.
  useEffect(
    () =>
      onShellDeepLink((target) => {
        historyIntentRef.current = 'push'
        setSelectedKey(
          sessionKey({ computerId: target.computerId, id: target.sessionId }),
        )
        setSidebarOpen(false)
      }),
    [],
  )
  const selectedBackgroundTasks = selected
    ? taskSnapshot(backgroundTaskSnapshots, selected)
    : undefined
  const selectedRunningBackgroundTasks =
    selectedBackgroundTasks?.runningCount || 0
  const composer = selectedKey ? composerDrafts[selectedKey] || '' : ''
  const hasBlockingUi =
    newSessionOpen ||
    computersOpen ||
    statuslineOpen ||
    settingsOpen ||
    runtimeOpen ||
    (renameOpen && Boolean(selected)) ||
    (cwdOpen && Boolean(selected)) ||
    (workspaceOpen && Boolean(selected)) ||
    addRootOpen ||
    Boolean(selected?.pendingPermission || selected?.pendingUserInput)
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
  const selectedSupportsBackgroundTasks = selected
    ? supportsBackgroundTasks(
        computers.find((computer) => computer.id === selected.computerId),
        selected.provider,
      ) || selectedBackgroundTasks?.supported === true
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
    (selectedComputerId &&
    computers.some(
      (computer) => computer.id === selectedComputerId && computer.online,
    )
      ? selectedComputerId
      : computers.find((computer) => computer.isLocal)?.id) ||
    computers.find((computer) => computer.online)?.id

  const applyBackgroundTaskSnapshot = useCallback(
    (
      session: ManagedSession,
      snapshot: BackgroundTaskSnapshot,
      startedAtSequence: number,
    ) => {
      const key = sessionKey(session)
      if (
        (backgroundTaskEventSequenceRef.current.get(key) || 0) >
        startedAtSequence
      ) {
        return
      }
      setBackgroundTaskSnapshots((current) => ({
        ...current,
        [key]: snapshot,
      }))
    },
    [],
  )

  const loadBackgroundTasks = useCallback(
    async (session: ManagedSession, force = false): Promise<void> => {
      const key = sessionKey(session)
      if (
        !supportsBackgroundTasks(
          computersRef.current.find(
            (computer) => computer.id === session.computerId,
          ),
          session.provider,
        )
      ) {
        return
      }
      if (backgroundTaskRequestsRef.current.has(key)) {
        if (force) {
          queuedBackgroundTaskRefreshesRef.current.add(key)
        }
        return
      }
      if (!force && backgroundTaskSnapshotsRef.current[key]) {
        return
      }
      backgroundTaskRequestsRef.current.add(key)
      const startedAtSequence = eventSequenceRef.current
      if (
        backgroundTasksOpenRef.current &&
        selectedKeyStateRef.current === key
      ) {
        setLoadingBackgroundTasks(true)
      }
      try {
        const snapshot = await listBackgroundTasks(
          session.computerId,
          session.id,
        )
        if (snapshot) {
          applyBackgroundTaskSnapshot(session, snapshot, startedAtSequence)
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught))
      } finally {
        backgroundTaskRequestsRef.current.delete(key)
        if (
          backgroundTasksOpenRef.current &&
          selectedKeyStateRef.current === key
        ) {
          setLoadingBackgroundTasks(false)
        }
        if (queuedBackgroundTaskRefreshesRef.current.delete(key)) {
          void loadBackgroundTasks(session, true)
        }
      }
    },
    [applyBackgroundTaskSnapshot],
  )

  useEffect(() => {
    backgroundTaskSnapshotsRef.current = backgroundTaskSnapshots
    computersRef.current = computers
    backgroundTasksOpenRef.current = backgroundTasksOpen
    selectedKeyStateRef.current = selectedKey
  }, [
    backgroundTaskSnapshots,
    backgroundTasksOpen,
    computers,
    selectedKey,
    sessions,
  ])

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
    const startedAtRevision = muteRevisionRef.current
    void getPushSettings()
      .then((settings) => {
        if (active) {
          // This answer can be older than a clear that has since moved the
          // mute to a replacement it has never heard of, exactly as a
          // reconnect's answer can.
          applyMutedSessions(settings.mutedSessions, startedAtRevision)
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
  }, [activeRootId])

  useEffect(() => {
    if (!knowledgeHydrated.current || !activeRootId) {
      return
    }
    const stored = {
      ...restoredKnowledgeExpansion.current,
      [activeRootId]: expandedKnowledge,
    }
    restoredKnowledgeExpansion.current = stored
    localStorage.setItem(
      'agentic-remote:knowledge-expanded',
      JSON.stringify(stored),
    )
  }, [activeRootId, expandedKnowledge])

  useEffect(() => {
    localStorage.setItem(
      'agentic-remote:knowledge-roots-open',
      JSON.stringify(knowledgeRootsOpen),
    )
  }, [knowledgeRootsOpen])

  useEffect(() => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify(knowledgeMode),
    )
  }, [knowledgeMode])

  // The session lives in the URL, so a reload reopens it, a link opens it, and
  // back and forward move between the sessions that were visited.
  useEffect(() => {
    syncSelectionAddressRef.current = () => {
      // Rewriting while sessions are still loading would drop the deep link
      // the loader is about to read.
      if (loading) {
        return
      }
      const selectedSession = sessions.find(
        (session) => sessionKey(session) === selectedKey,
      )
      const next = selectedSession
        ? `${window.location.pathname}?${new URLSearchParams({
            computer: selectedSession.computerId,
            session: selectedSession.id,
          }).toString()}`
        : window.location.pathname
      const intent = historyIntentRef.current
      historyIntentRef.current = 'replace'
      if (next === `${window.location.pathname}${window.location.search}`) {
        return
      }
      if (intent === 'push') {
        window.history.pushState({}, '', next)
      } else {
        // Auto-selection and stale links correct the address without leaving
        // a history entry the user never navigated to.
        window.history.replaceState({}, '', next)
      }
    }
  })

  useEffect(() => {
    syncSelectionAddressRef.current()
  }, [loading, selectedKey, sessions])

  useEffect(() => {
    const followHistory = () => {
      const parameters = new URLSearchParams(window.location.search)
      const computerId = parameters.get('computer')
      const sessionId = parameters.get('session')
      historyIntentRef.current = 'replace'
      if (!computerId || !sessionId) {
        // An entry that names no session cannot select one, so the address is
        // brought back in step with what is actually open.
        syncSelectionAddressRef.current()
        return
      }
      setSelectedKey(sessionKey({ computerId, id: sessionId }))
    }
    window.addEventListener('popstate', followHistory)
    return () => window.removeEventListener('popstate', followHistory)
  }, [])

  // Refreshed after every render so the shortcut always sees current state.
  useEffect(() => {
    // Bound to the window rather than the shell: closing a panel moves focus
    // back to the body, and the next shortcut must still work from there.
    appShortcutRef.current = (event: globalThis.KeyboardEvent) => {
      if (
        !event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented ||
        event.isComposing ||
        hasBlockingUi ||
        isEditableTarget(event.target)
      ) {
        return
      }
      // Matched on `code`, so a macOS Option key that rewrites the character
      // still resolves to the same physical key.
      if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
        event.preventDefault()
        stepSession(event.code === 'ArrowDown' ? 1 : -1)
        return
      }
      if (event.code === 'KeyK') {
        event.preventDefault()
        if (event.shiftKey) {
          toggleKnowledgeExpanded()
        } else {
          toggleKnowledgePanel()
        }
        return
      }
      // The status line is the usual way in, but it is a display preference and
      // can be turned off while background tasks keep running, so the panel
      // needs a way in that does not depend on what is on screen.
      if (event.code === 'KeyT' && !event.shiftKey) {
        event.preventDefault()
        openBackgroundTasks()
      }
    }
  })

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      appShortcutRef.current(event)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify(knowledgePositions),
    )
  }, [knowledgePositions])

  // The panel belongs to the session, so what it was reading is recorded
  // against that session rather than globally.
  useEffect(() => {
    // Only the session whose position has already been restored may record
    // one, or selecting a session would immediately overwrite its saved
    // location with whatever the previous session was reading.
    if (
      !knowledgeHydrated.current ||
      !selectedKey ||
      !activeRootId ||
      knowledgeRestoredKey.current !== selectedKey
    ) {
      return
    }
    setKnowledgePositions((current) => {
      const existing = current[selectedKey]
      const next: KnowledgePosition = {
        rootId: activeRootId,
        path: knowledgePath,
        file: knowledgeFile?.path,
      }
      return existing &&
        existing.rootId === next.rootId &&
        existing.path === next.path &&
        existing.file === next.file
        ? current
        : { ...current, [selectedKey]: next }
    })
  }, [activeRootId, knowledgeFile?.path, knowledgePath, selectedKey])

  // Reopening a session with its panel open restores what that session was
  // reading, instead of whatever the previously selected session left behind.
  // Refreshed after every render so the restore below always sees the newest
  // reader position and loaders without re-running on each of them.
  useEffect(() => {
    knowledgePositionsRef.current = knowledgePositions
    // The offset is applied when the restore that asked for it finishes, so it
    // lands on the branch it belongs to rather than on a loading placeholder.
    applyKnowledgeScrollRef.current = (key: string) => {
      const remembered = knowledgeScrollTops.current[key]
      if (remembered === undefined) {
        return
      }
      requestAnimationFrame(() => {
        const node = knowledgeTreeRef.current
        if (
          node &&
          node.isConnected &&
          !node.closest('[hidden]') &&
          key === knowledgePanelKey
        ) {
          node.scrollTop = remembered
        }
      })
    }
    forgetKnowledgeSessionRef.current = forgetKnowledgeSession
    moveKnowledgeSessionRef.current = moveKnowledgePosition
    migrateSessionStateRef.current = migrateSessionState
    loadKnowledgeFolderRef.current = loadKnowledgeFolder
    restoreKnowledgeRef.current = (position: KnowledgePosition, key: string) => {
      const rootId = position.rootId
      if (!rootId) {
        return
      }
      const token = ++knowledgeRequest.current
      const current = () => token === knowledgeRequest.current
      void (async () => {
        try {
          const switchedRoot = rootId !== activeRootId
          if (switchedRoot) {
            if (!(await selectRoot(rootId, true))) {
              return
            }
          } else if (
            // The root is already active, but its listing may be missing or
            // have failed, and skipping every loader would call that restored.
            !knowledgeFolders[knowledgeRootPath]?.listing &&
            !(await loadKnowledgeFolder(rootId, knowledgeRootPath))
          ) {
            return
          }
          if (!current()) {
            return
          }
          // The remembered position names a folder even when that folder is
          // the root, and going there is what leaves the previous session's
          // folder behind. Skipping the navigation because there is nowhere
          // to descend to would keep that folder on screen, and the reader's
          // next move would then save it under this session.
          if (
            !(await openKnowledgeFolder(
              position.path || knowledgeRootPath,
              rootId,
              true,
              // After switching root the folder cache in this closure is the
              // one captured before the switch. Two roots can hold the same
              // relative path, so consulting it would skip loading the new
              // root's copy.
              switchedRoot ? {} : undefined,
            ))
          ) {
            return
          }
          if (!current()) {
            return
          }
          if (
            position.file &&
            !(await openKnowledgeFile(position.file, rootId, true))
          ) {
            return
          }
          if (!current()) {
            return
          }
          applyKnowledgeScrollRef.current(key)
        } finally {
          if (current()) {
            // The attempt is over either way: recording is handed back so the
            // reader's next choice becomes this session's position, and a
            // failure is retried when the panel is reopened.
            knowledgeRestoredKey.current = key
            knowledgeRestoreStartedKey.current = undefined
          }
          if (current() && knowledgePendingScrollKey.current === key) {
            // Released on success, failure, and an empty branch alike, or
            // recording would stay suppressed for good.
            knowledgePendingScrollKey.current = undefined
          }
        }
      })()
    }
  })

  // An open panel with an active root always ends up with a root listing. The
  // startup load can be superseded by a session change, and a superseded load
  // writes nothing, so without this the tree could sit blank until the root
  // was picked again by hand.
  useEffect(() => {
    const root = knowledgeFolders[knowledgeRootPath]
    if (
      knowledgeMode === 'hidden' ||
      !activeRootId ||
      root?.listing !== undefined ||
      root?.error !== undefined
    ) {
      return
    }
    // A superseded load leaves the entry marked loading with nothing on the
    // way, so waiting for it would wait for ever. Only a listing or a
    // reported failure counts as settled.
    if (
      root?.loading &&
      knowledgeRootLoadGeneration.current === knowledgeRequest.current
    ) {
      return
    }
    knowledgeRootLoadGeneration.current = knowledgeRequest.current
    void loadKnowledgeFolderRef.current(activeRootId, knowledgeRootPath)
    // `selectedKey` is what supersedes a load: the discarded reply changes no
    // state, so without it nothing would bring this effect back to notice.
  }, [activeRootId, knowledgeFolders, knowledgeMode, selectedKey])

  // Knowledge work belongs to the session that asked for it. Changing session
  // abandons all of it, whatever the decision below then chooses to do: a file
  // read left in flight would otherwise surface, and be saved, under the
  // session that replaced its owner.
  useLayoutEffect(() => {
    if (knowledgeOwnerKey.current === knowledgePanelKey) {
      return
    }
    if (knowledgeOwnerKey.current !== undefined) {
      knowledgeRequest.current += 1
      knowledgePendingScrollKey.current = undefined
      knowledgeRestoreStartedKey.current = undefined
      setKnowledgeLoading(false)
    }
    knowledgeOwnerKey.current = knowledgePanelKey
  }, [knowledgePanelKey])

  useEffect(() => {
    // No early return here: a restore belonging to a session that is no longer
    // selected has to be abandoned even when the panel is closed or the
    // session is gone, or it lands on whatever is selected next. The decision
    // covers those cases, so this only carries it out.
    // The decision itself lives in `knowledge-restore.ts`, where it can be
    // tested directly.
    const action = knowledgeRestoreAction({
      selectedKey,

      panelOpen: knowledgeMode !== 'hidden',
      rootsLoaded: roots.length > 0,
      remembered: selectedKey
        ? knowledgePositionsRef.current[selectedKey]
        : undefined,
      rememberedRootExists: roots.some(
        (root) =>
          root.id ===
          (selectedKey
            ? knowledgePositionsRef.current[selectedKey]?.rootId
            : undefined),
      ),
      restoredKey: knowledgeRestoredKey.current,
      runningKey: knowledgeRestoreStartedKey.current,
      viewOwner: knowledgeViewOwnerKey.current,
    })

    if (action.kind === 'none') {
      return
    }
    if (action.kind === 'reset') {
      // The panel closed, ending the episode: abandon anything running and
      // stop counting the session as handled, so reopening retries.
      knowledgeRequest.current += 1
      knowledgePendingScrollKey.current = undefined
      knowledgeRestoreStartedKey.current = undefined
      knowledgeRestoredKey.current = undefined
      setKnowledgeLoading(false)
      return
    }
    if (action.kind === 'cancel' || action.kind === 'cancel-and-settle') {
      // The abandoned restore's own cleanup can no longer run, so its state is
      // settled here.
      knowledgeRequest.current += 1
      knowledgePendingScrollKey.current = undefined
      knowledgeRestoreStartedKey.current = undefined
      setKnowledgeLoading(false)
      if (action.kind === 'cancel-and-settle' && selectedKey) {
        knowledgeRestoredKey.current = selectedKey
      }
      return
    }
    if (action.kind === 'settle') {
      // A session with nothing to restore must not be left showing the
      // document belonging to the session that was open before it. Only a
      // handover clears the reader: on the first load there is no previous
      // session, and the position restored from storage stands.
      // The view owner survives closing the panel, while the handled marker
      // is reset by it. Asking the owner is what still catches a document
      // left behind by the session that was open before this one.
      const handover =
        knowledgeViewOwnerKey.current !== undefined &&
        knowledgeViewOwnerKey.current !== selectedKey
      if (selectedKey) {
        knowledgeRestoredKey.current = selectedKey
        knowledgeViewOwnerKey.current = selectedKey
      }
      if (handover) {
        setKnowledgeFile(undefined)
      }
      return
    }
    knowledgeRequest.current += 1
    knowledgePendingScrollKey.current = action.key
    knowledgeRestoreStartedKey.current = action.key
    if (knowledgeViewOwnerKey.current !== action.key) {
      // Whatever is on screen belongs to another session, so it goes before
      // this one's content arrives — and stays gone if the remembered
      // position names no document.
      setKnowledgeFile(undefined)
    }
    knowledgeViewOwnerKey.current = action.key
    setKnowledgeLoading(false)
    restoreKnowledgeRef.current(action.position, action.key)
  }, [knowledgeMode, selectedKey, roots, knowledgePositions])

  // Reopening the panel puts the tree back where it was left, so switching
  // between a session and its files does not lose the reader's place.
  useLayoutEffect(() => {
    const node = knowledgeTreeRef.current
    const key = knowledgePanelKey
    if (!node || knowledgeMode === 'hidden') {
      return
    }
    const remembered = knowledgeScrollTops.current[key]
    if (remembered !== undefined) {
      node.scrollTop = remembered
      // The tree grows as folders finish loading, so the offset is applied
      // again once that layout settles.
      requestAnimationFrame(() => {
        if (node.isConnected && !node.closest('[hidden]')) {
          node.scrollTop = remembered
        }
      })
    }
    const record = () => {
      // A hidden or detached tree reports 0, which would erase the position
      // it is supposed to keep; the cleanup below runs after React has
      // already removed the node. A tree still waiting for its session's
      // content would record the outgoing session's offset.
      if (
        node.isConnected &&
        !node.closest('[hidden]') &&
        !knowledgePendingScrollKey.current
      ) {
        knowledgeScrollTops.current[key] = node.scrollTop
      }
    }
    node.addEventListener('scroll', record, { passive: true })
    return () => {
      record()
      node.removeEventListener('scroll', record)
    }
  }, [knowledgeMode, knowledgePanelKey])


  // An older build remembered one position for the whole app. It becomes the
  // first session's own position once there is a session to attribute it to,
  // and is then gone: nothing writes it again, so it can never resurface under
  // a session it did not belong to.
  useEffect(() => {
    if (legacyKnowledgeAdopted.current || !selectedKey) {
      return
    }
    legacyKnowledgeAdopted.current = true
    const legacy = restoredKnowledge.current
    restoredKnowledge.current = {}
    localStorage.removeItem('agentic-remote:knowledge-position')
    if (
      !legacy.rootId ||
      knowledgePositionsRef.current[selectedKey] ||
      // A link names the session to open, which says nothing about the one
      // the position was left in. Guessing would show one session's document
      // under another, so it is dropped rather than misfiled.
      openedFromLink.current
    ) {
      return
    }
    // The session was settled as having nothing to restore before this ran,
    // so that verdict is withdrawn along with the position it was missing.
    if (knowledgeRestoredKey.current === selectedKey) {
      knowledgeRestoredKey.current = undefined
    }
    setKnowledgePositions((current) => ({
      ...current,
      [selectedKey]: {
        rootId: legacy.rootId,
        path: legacy.path,
        file: legacy.file,
      },
    }))
  }, [selectedKey])

  useEffect(() => {
    void listKnowledgeRoots()
      .then(async (loaded) => {
        setRoots(loaded)
        // Only the root is reopened here. Where a session was reading belongs
        // to that session, and this runs before one is known, so applying it
        // would show one session's document under another.
        const remembered = restoredKnowledge.current
        const root =
          loaded.find((entry) => entry.id === remembered.rootId) || loaded[0]
        if (!root) {
          // Nothing to restore, so later changes are safe to persist.
          knowledgeHydrated.current = true
          return
        }
        setActiveRootId(root.id)
        // One token for the whole restoration: a second increment would make
        // the first stale, and the ancestor chain would reject its own results.
        const request = ++knowledgeRequest.current
        const generation = request
        const folder = knowledgeRootPath
        try {
          const listing = await listKnowledgeEntries(root.id, folder).catch(
            () => listKnowledgeEntries(root.id, knowledgeRootPath),
          )
          if (request !== knowledgeRequest.current) {
            return
          }
          setKnowledgeFolders({ [folder]: { listing } })
          setKnowledgePath(folder)
          // The remembered folder may sit deep in the tree, so everything
          // above it opens with it and the branch is visible on arrival.
          setExpandedKnowledge((current) =>
            expandKnowledgeFolder(current, folder),
          )
          void loadKnowledgeChain(root.id, folder, generation, {
            [folder]: { listing },
          })
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
      defaultSessionFoldersStorageKey,
      JSON.stringify({ version: 1, folders: defaultSessionFolders }),
    )
  }, [defaultSessionFolders])

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
        claimReplacedSessions(loadedSessions)
        setSessions((current) => {
          let reconciled = sortSessions(loadedSessions)
          for (const existing of current) {
            reconciled = upsertSession(reconciled, existing)
          }
          return reconciled
        })
        setComputers(loadedComputers)
        const requestedKey = initialUrlSelection.current
        const requested = loadedSessions.find(
          (session) => sessionKey(session) === requestedKey,
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
      current &&
      (sessions.some((session) => sessionKey(session) === current) ||
        pendingReplacements.current.has(current))
        ? current
        : sessions[0]
          ? sessionKey(sessions[0])
          : undefined,
    )
    // `selectedKey` is a dependency because history can name a session that
    // has since been deleted, and that has to fall back to a real one.
  }, [loading, selectedKey, sessions])

  useEffect(() => {
    if (loading) {
      return
    }
    const force = backgroundTaskRefreshVersion !==
      seenBackgroundTaskRefreshRef.current
    if (force) {
      seenBackgroundTaskRefreshRef.current = backgroundTaskRefreshVersion
    }
    for (const session of sessions) {
      void loadBackgroundTasks(session, force)
    }
  }, [
    backgroundTaskRefreshVersion,
    computers,
    loading,
    loadBackgroundTasks,
    sessions,
  ])

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
    const clearNotifications = () => {
      withdrawShellNotifications(
        sessionNotificationTags(selectedComputerId, selectedSessionId),
      )
      void clearSessionPushNotifications(
        selectedComputerId,
        selectedSessionId,
      ).catch((caught: unknown) => {
        console.warn('Unable to clear opened session notifications:', caught)
      })
    }
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
      const startedAtMuteRevision = muteRevisionRef.current
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
      claimReplacedSessions(loadedSessions)
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
      // A session that changed while the refresh was in flight is described
      // more recently by the event than by the snapshot, exactly as the two
      // reconciliations above assume. A clear moves the mute to a replacement
      // the snapshot has never heard of, so the snapshot must not speak for
      // either session.
      const changedSinceRefresh = (key: string) =>
        (sessionEventSequenceRef.current.get(key) || 0) > startedAtSequence
      if (pushSettings) {
        applyMutedSessions(pushSettings.mutedSessions, startedAtMuteRevision)
      }
      setBackgroundTaskRefreshVersion((current) => current + 1)
      const selectedAtRefresh = selectedRef.current
      // A replacement selected while the refresh was in flight is missing
      // from the snapshot by definition, and dropping it would jump the
      // reader to an unrelated session.
      const selectedStillExists =
        selectedAtRefresh &&
        (snapshotSessions.some(
          (session) => sessionKey(session) === sessionKey(selectedAtRefresh),
        ) ||
          changedSinceRefresh(sessionKey(selectedAtRefresh)) ||
          pendingReplacements.current.has(sessionKey(selectedAtRefresh)))
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
          pendingReplacements.current.delete(sessionKey(event.session))
          setSessions((current) => upsertSession(current, event.session))
        } else if (event.type === 'session.removed') {
          const removedKey = `${event.computerId}:${event.sessionId}`
          eventSequenceRef.current += 1
          sessionEventSequenceRef.current.set(
            removedKey,
            eventSequenceRef.current,
          )
          // Removal reaches every client. A cleared session was replaced
          // rather than deleted, so everything it was carrying moves across on
          // all of them instead of being discarded on any of them.
          if (event.replacedBy) {
            const replacementKey = `${event.computerId}:${event.replacedBy}`
            migrateSessionStateRef.current(removedKey, replacementKey)
            // Removal and upsert are separate events. Following the
            // replacement now stops the fallback from selecting an unrelated
            // session in the gap, which the later upsert would not undo.
            pendingReplacements.current.add(replacementKey)
            // Seen live, so the snapshot's lineage has nothing left to claim.
            adoptedReplacements.current.add(removedKey)
            // The replacement changed here too, so a snapshot taken before
            // this event cannot speak for it either.
            sessionEventSequenceRef.current.set(
              replacementKey,
              eventSequenceRef.current,
            )
            setSelectedKey((current) =>
              current === removedKey ? replacementKey : current,
            )
          } else if (!clearingSessions.current.has(removedKey)) {
            // A clear issued here has not returned its replacement yet. A node
            // on an older build sends no link, so everything this session
            // carries is held until the response names the replacement.
            setComposerDrafts((current) => {
              const { [removedKey]: _removed, ...remaining } = current
              return remaining
            })
            forgetKnowledgeSessionRef.current(removedKey)
          }
          setSessions((current) =>
            current.filter(
              (session) =>
                session.id !== event.sessionId ||
                session.computerId !== event.computerId,
            ),
          )
          setBackgroundTaskSnapshots((current) => {
          const { [removedKey]: _removed, ...remaining } = current
          return remaining
          })
        } else if (event.type === 'session.tasks.updated') {
          const key = `${event.computerId}:${event.sessionId}`
          eventSequenceRef.current += 1
          backgroundTaskEventSequenceRef.current.set(
          key,
          eventSequenceRef.current,
          )
          setBackgroundTaskSnapshots((current) => ({
          ...current,
          [key]: {
            tasks: event.tasks,
            runningCount: event.runningCount,
            supported: event.supported,
          },
          }))
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
          setBackgroundTaskSnapshots((current) =>
            Object.fromEntries(
              Object.entries(current).filter(
                ([key]) => !key.startsWith(`${event.computerId}:`),
              ),
            ),
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
      setFollowsLatest(true)
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
      setFollowsLatest(false)
      return
    }
    const distanceFromBottom =
      timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight
    // Scrolling up stops the view following the conversation, and scrolling
    // back to the end takes it up again.
    setFollowsLatest(distanceFromBottom <= timelineBottomThreshold)
  }

  function setFollowsLatest(following: boolean) {
    autoScrollRef.current = following
    setFollowingLatest((current) =>
      current === following ? current : following,
    )
  }

  /** Returns to the end of the conversation and follows it again. */
  function followLatest() {
    setFollowsLatest(true)
    bottomRef.current?.scrollIntoView({ block: 'end' })
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
    // The composer just took height from the transcript, which pushes the
    // newest message out of sight without the reader having gone anywhere.
    // Done here, before the browser paints, so the view does not jump.
    if (autoScrollRef.current) {
      const timeline = timelineRef.current
      if (timeline) {
        timeline.scrollTop = timeline.scrollHeight
      }
    }
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

  function navigateMessageHistory(
    direction: -1 | 1,
    force = false,
  ): boolean {
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
    if (!existing && (direction > 0 || (!force && composer.trim()))) {
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

  /** A session that is gone leaves nothing of its reading behind. */
  function forgetKnowledgeSession(key: string) {
    if (clearingSessions.current.has(key)) {
      // The removal carries its replacement, so this is normally unnecessary.
      // A node running an older build sends no link, and hosts update
      // independently, so the clear this client issued still protects itself.
      return
    }
    delete knowledgeScrollTops.current[key]
    if (knowledgeViewOwnerKey.current === key) {
      knowledgeViewOwnerKey.current = undefined
    }
    if (knowledgeRestoredKey.current === key) {
      knowledgeRestoredKey.current = undefined
    }
    if (knowledgeRestoreStartedKey.current === key) {
      knowledgeRestoreStartedKey.current = undefined
    }
    setKnowledgePositions((current) => {
      if (!(key in current)) {
        return current
      }
      const { [key]: _removed, ...remaining } = current
      return remaining
    })
  }

  /** Clearing a conversation gives it a new id; its reading position moves too. */
  function moveKnowledgePosition(fromKey: string, toKey: string) {
    if (fromKey === toKey) {
      return
    }
    const offset = knowledgeScrollTops.current[fromKey]
    delete knowledgeScrollTops.current[fromKey]
    if (offset !== undefined) {
      knowledgeScrollTops.current[toKey] = offset
    }
    if (knowledgeRestoredKey.current === fromKey) {
      knowledgeRestoredKey.current = toKey
    }
    if (knowledgeViewOwnerKey.current === fromKey) {
      // Without this the replacement treats the document already on screen as
      // another session's, clears it, and fetches it again — and loses it
      // entirely if the root has become unreachable.
      knowledgeViewOwnerKey.current = toKey
    }
    if (knowledgeOwnerKey.current === fromKey) {
      knowledgeOwnerKey.current = toKey
    }
    setKnowledgePositions((current) => {
      const position = current[fromKey]
      const { [fromKey]: _removed, ...remaining } = current
      return position ? { ...remaining, [toKey]: position } : remaining
    })
  }

  /**
   * Everything a session carries, moved in one step. Clearing replaces a
   * session's id, and each store that gets forgotten here is something the
   * conversation visibly loses, so they move together rather than one per
   * bug report.
   */
  function migrateSessionState(fromKey: string, toKey: string) {
    if (fromKey === toKey) {
      return
    }
    moveComposerDraft(fromKey, toKey)
    moveKnowledgePosition(fromKey, toKey)
    if (mutedSessionsRef.current.includes(fromKey)) {
      recordMuteChange(fromKey, toKey)
    }
    setMutedSessions((current) =>
      current.includes(fromKey)
        ? [...current.filter((key) => key !== fromKey), toKey]
        : current,
    )
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

  /**
   * Where the Knowledge panel is browsing, on the computer that owns it. The
   * tree works in paths relative to the root, and the session has to be told
   * an absolute one.
   */
  const browsedFolderPath =
    activeRoot && knowledgePath && knowledgePath !== knowledgeRootPath
      ? `${activeRoot.path.replace(/\/$/, '')}/${knowledgePath}`
      : activeRoot?.path
  // Moving the session means asking the CLI to change directory. That works
  // for any session the workspace browser would move, so the rules are the
  // same as its own: the root has to be on the session's computer, and the
  // agent has to be idle, because the command is sent rather than queued.
  const selectedMoveBusy =
    selected?.status === 'running' || selected?.status === 'waiting'
  const canMoveSessionHere = Boolean(
    selected &&
      browsedFolderPath &&
      // Claude refuses every slash command, so `/cwd` cannot land there and
      // offering the move only produces a failure.
      selected.provider !== 'claude' &&
      activeRoot &&
      activeRoot.computerId === selected.computerId &&
      browsedFolderPath !== selected.cwd,
  )

  async function moveSessionToBrowsedFolder() {
    if (
      !selected ||
      !browsedFolderPath ||
      movingSessionFolder ||
      selectedMoveBusy
    ) {
      return
    }
    setMovingSessionFolder(true)
    setError(undefined)
    try {
      // A knowledge root may sit anywhere the user can read, but a session
      // working directory is where an agent executes and stays confined to the
      // configured roots. `/cwd` reaches the CLI unchecked, so the boundary has
      // to be enforced here, on the computer that owns the root.
      const target = (
        await validateSessionDirectory(selected.computerId, browsedFolderPath)
      ).trim()
      if (!target) {
        throw new Error('The selected folder could not be validated')
      }
      if (/[\r\n]/.test(target)) {
        throw new Error('Folder paths cannot contain line breaks')
      }
      // Validation is a round trip to the owning computer, and a turn can
      // start while it is in flight -- from another reader, or from the
      // terminal itself. `/cwd` is sent rather than queued, so checking only
      // before the wait would type into a pane that is now working.
      const nowBusy = selectedRef.current
      if (
        nowBusy &&
        sessionKey(nowBusy) === sessionKey(selected) &&
        (nowBusy.status === 'running' || nowBusy.status === 'waiting')
      ) {
        throw new Error('Wait for the current agent turn to finish')
      }
      const updated = await executeCommand(selected.computerId, selected.id, {
        command: `/cwd ${target}`,
      })
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setMovingSessionFolder(false)
    }
  }

  function setKnowledgeMode(mode: KnowledgePanelMode) {
    setKnowledgeModeState(mode)
  }

  function toggleKnowledgePanel() {
    setKnowledgeMode(knowledgeMode === 'hidden' ? 'docked' : 'hidden')
  }

  function toggleKnowledgeExpanded() {
    // Expanding from a closed panel opens it directly at full width, so one
    // shortcut is enough to start reading.
    setKnowledgeMode(knowledgeMode === 'expanded' ? 'docked' : 'expanded')
  }

  function stepSession(direction: -1 | 1) {
    const ordered = orderedComputers.flatMap(
      (computer) => sessionsByComputer.get(computer.id) || [],
    )
    if (ordered.length === 0) {
      return
    }
    const index = ordered.findIndex(
      (session) => sessionKey(session) === selectedKey,
    )
    const next =
      ordered[
        index < 0
          ? 0
          : (index + direction + ordered.length) % ordered.length
      ]
    if (next) {
      selectSession(next)
    }
  }

  // Stable identity: a new loader each render would remount every image and
  // restart its download.
  const loadKnowledgeAsset = useCallback(
    (assetPath: string) => readKnowledgeFile(activeRootId || '', assetPath),
    [activeRootId],
  )

  async function loadKnowledgeFolder(
    rootId: string,
    path: string,
    generation = knowledgeRequest.current,
  ): Promise<WorkspaceListing | undefined> {
    setKnowledgeFolders((current) => ({
      ...current,
      [path]: { ...current[path], loading: true, error: undefined },
    }))
    try {
      const listing = await listKnowledgeEntries(rootId, path)
      // Switching roots invalidates every folder in flight, so a late reply
      // cannot graft one root's entries onto another root's tree.
      if (generation !== knowledgeRequest.current) {
        return undefined
      }
      setKnowledgeFolders((current) => ({
        ...current,
        [path]: { listing, loading: false },
      }))
      return listing
    } catch (caught) {
      if (generation === knowledgeRequest.current) {
        // Kept beside the folder that failed: one unreachable branch must not
        // blank the rest of the tree.
        setKnowledgeFolders((current) => ({
          ...current,
          [path]: {
            ...current[path],
            loading: false,
            error: caught instanceof Error ? caught.message : String(caught),
          },
        }))
      }
      return undefined
    }
  }

  /** Loads every folder above `path`, so a deep target is actually reachable. */
  async function loadKnowledgeChain(
    rootId: string,
    path: string,
    generation = knowledgeRequest.current,
    loaded: KnowledgeFolders = knowledgeFolders,
  ): Promise<boolean> {
    for (const folder of [knowledgeRootPath, ...knowledgePathChain(path)]) {
      if (loaded[folder]?.listing) {
        continue
      }
      const listing = await loadKnowledgeFolder(rootId, folder, generation)
      if (generation !== knowledgeRequest.current) {
        return false
      }
      if (!listing) {
        return false
      }
    }
    return true
  }

  async function toggleKnowledgeFolder(path: string) {
    knowledgeHydrated.current = true
    const rootId = activeRootId
    if (!rootId) {
      return
    }
    // Opening or closing a branch is the reader choosing where to be, so a
    // restore still on its way is abandoned rather than allowed to land on
    // top of that choice.
    cancelKnowledgeRestore()
    if (expandedKnowledge.includes(path)) {
      setExpandedKnowledge((current) => collapseKnowledgeFolder(current, path))
      // Following the collapse keeps the breadcrumb pointing at something the
      // tree still shows.
      if (knowledgePath === path || knowledgePath.startsWith(`${path}/`)) {
        setKnowledgePath(
          knowledgePathChain(path).slice(0, -1).pop() || knowledgeRootPath,
        )
      }
      return
    }
    setExpandedKnowledge((current) => expandKnowledgeFolder(current, path))
    setKnowledgePath(path)
    if (!knowledgeFolders[path]?.listing) {
      await loadKnowledgeFolder(rootId, path)
    }
  }

  async function openKnowledgeFolder(
    path = knowledgeRootPath,
    rootId = activeRootId,
    fromRestore = false,
    loadedOverride?: KnowledgeFolders,
  ): Promise<boolean> {
    knowledgeHydrated.current = true
    if (!rootId) {
      return false
    }
    if (!fromRestore) {
      // A file still being read belongs to where the reader just left, so it
      // is abandoned rather than allowed to arrive over the new folder. A
      // restore navigating its own steps must not invalidate itself.
      cancelKnowledgeRestore()
      knowledgeRequest.current += 1
      setKnowledgeLoading(false)
    }
    setExpandedKnowledge((current) => expandKnowledgeFolder(current, path))
    setKnowledgePath(path)
    setKnowledgeFile(undefined)
    return loadKnowledgeChain(
      rootId,
      path,
      knowledgeRequest.current,
      loadedOverride,
    )
  }


  /**
   * Abandons a restore that is still loading, so the folder or file the reader
   * just chose is not replaced when the remembered one finally arrives. The
   * session still counts as restored: its position is now whatever was chosen.
   */
  function cancelKnowledgeRestore() {
    // The reader is choosing what to show, so this session owns the view.
    // Before there is a session, the panel itself owns it: leaving it unowned
    // would let the first session inherit a document it never opened.
    knowledgeViewOwnerKey.current = knowledgePanelKey
    if (!knowledgeRestoreStartedKey.current) {
      return
    }
    knowledgeRequest.current += 1
    knowledgePendingScrollKey.current = undefined
    knowledgeRestoredKey.current = knowledgeRestoreStartedKey.current
    knowledgeRestoreStartedKey.current = undefined
  }

  function collapseKnowledgeTree() {
    cancelKnowledgeRestore()
    setExpandedKnowledge([])
    setKnowledgePath(knowledgeRootPath)
  }

  function knowledgeTreeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(
        event.key,
      )
    ) {
      return
    }
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="treeitem"]',
      ),
    )
    if (items.length === 0) {
      return
    }
    const index = items.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    const focusAt = (next: number) => {
      items[Math.min(Math.max(next, 0), items.length - 1)]?.focus()
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusAt(event.key === 'ArrowDown' ? index + 1 : index - 1)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusAt(event.key === 'Home' ? 0 : items.length - 1)
      return
    }
    const current = index >= 0 ? items[index] : undefined
    const path = current?.dataset.knowledgePath
    if (!current || !path) {
      return
    }
    const expanded = current.getAttribute('aria-expanded')
    event.preventDefault()
    if (event.key === 'ArrowRight') {
      // Right opens a closed folder, then steps into what it revealed.
      if (expanded === 'false') {
        void toggleKnowledgeFolder(path)
      } else if (expanded === 'true') {
        focusAt(index + 1)
      }
      return
    }
    if (expanded === 'true') {
      void toggleKnowledgeFolder(path)
      return
    }
    const parent = knowledgePathChain(path).slice(0, -1).pop()
    items
      .find((item) => item.dataset.knowledgePath === parent)
      ?.focus()
  }

  async function openKnowledgeFile(
    path: string,
    rootOverride?: string,
    fromRestore = false,
  ): Promise<boolean> {
    knowledgeHydrated.current = true
    const rootId = rootOverride || activeRootId
    if (!rootId) {
      return false
    }
    if (!fromRestore) {
      cancelKnowledgeRestore()
    }
    // A restore reads under the generation it started with, so its own steps
    // never invalidate it; anything user-driven starts a new one.
    const request = fromRestore
      ? knowledgeRequest.current
      : ++knowledgeRequest.current
    setKnowledgeLoading(true)
    setError(undefined)
    try {
      const opened = await readKnowledgeFile(rootId, path)
      // Checked before any state write, so a read left over from the previous
      // session cannot land in the one that replaced it.
      if (request !== knowledgeRequest.current) {
        return false
      }
      setKnowledgeFile(opened)
      // Reading is full-screen on a phone, matching how selecting a session
      // hands the view over to the conversation.
      setSidebarOpen(false)
      return true
    } catch (caught) {
      if (request === knowledgeRequest.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
      return false
    } finally {
      if (request === knowledgeRequest.current) {
        setKnowledgeLoading(false)
      }
    }
  }

  async function selectRoot(
    rootId: string,
    fromRestore = false,
  ): Promise<boolean> {
    knowledgeHydrated.current = true
    if (!fromRestore) {
      // Changing root invalidates the file being read as well as its folders,
      // or the old document would resolve its assets against the new root.
      cancelKnowledgeRestore()
      setKnowledgeLoading(false)
    }
    const generation = fromRestore
      ? knowledgeRequest.current
      : ++knowledgeRequest.current
    setActiveRootId(rootId)
    setKnowledgeFile(undefined)
    setKnowledgeFolders({})
    setKnowledgePath(knowledgeRootPath)
    // Reopening a root restores the branches that were open in it, bounded so
    // a very wide tree cannot fan out into unbounded requests.
    const remembered = (
      restoredKnowledgeExpansion.current[rootId] || []
    ).slice(0, 24)
    setExpandedKnowledge(remembered)
    const opened = await loadKnowledgeFolder(
      rootId,
      knowledgeRootPath,
      generation,
    )
    for (const folder of remembered) {
      if (generation !== knowledgeRequest.current) {
        return false
      }
      await loadKnowledgeFolder(rootId, folder, generation)
    }
    return Boolean(opened) && generation === knowledgeRequest.current
  }

  async function removeRoot(rootId: string) {
    try {
      await deleteKnowledgeRoot(rootId)
      setRoots((current) => current.filter((root) => root.id !== rootId))
      if (rootId === activeRootId) {
        knowledgeRequest.current += 1
        setActiveRootId(undefined)
        setKnowledgeFolders({})
        setExpandedKnowledge([])
        setKnowledgePath(knowledgeRootPath)
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
    historyIntentRef.current = 'push'
    setSelectedKey(sessionKey(session))
    setSidebarOpen(false)
    setError(undefined)
  }

  function openBackgroundTasks() {
    if (!selected || !selectedSupportsBackgroundTasks) {
      return
    }
    setBackgroundTasksOpen(true)
    void loadBackgroundTasks(selected, true)
  }

  // Reaching the panel from the sidebar count keeps it available by touch,
  // where a keyboard shortcut is not, and without depending on what the status
  // line happens to be configured to show.
  function openTasksForSession(session: ManagedSession) {
    selectSession(session)
    setBackgroundTasksOpen(true)
    void loadBackgroundTasks(session, true)
  }

  async function cancelSelectedBackgroundTask(taskId: string) {
    if (!selected || cancellingBackgroundTaskId) {
      return
    }
    const target = selected
    setCancellingBackgroundTaskId(taskId)
    setError(undefined)
    const startedAtSequence = eventSequenceRef.current
    try {
      const snapshot = await cancelBackgroundTask(
        target.computerId,
        target.id,
        taskId,
      )
      if (snapshot) {
        applyBackgroundTaskSnapshot(target, snapshot, startedAtSequence)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setCancellingBackgroundTaskId(undefined)
    }
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
    historyIntentRef.current = 'push'
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
    const targetKey = sessionKey(target)
    clearingSessions.current.add(targetKey)
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
      migrateSessionState(targetKey, sessionKey(cleared))
      setSelectedKey(sessionKey(cleared))
      return sessionKey(cleared)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
      return sessionKey(target)
    } finally {
      // Released only once the replacement is known, so a removal arriving
      // first cannot discard the position on its way across.
      clearingSessions.current.delete(targetKey)
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

  function appKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.key !== 'ArrowUp' ||
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      hasBlockingUi ||
      sortableDragActiveRef.current
    ) {
      return
    }
    const target = event.target
    if (
      target instanceof Element &&
      target.closest(
        '[role="dialog"], .composer, .user-input-card, .permission-card, .drag-handle, .knowledge-panel, .sidebar-knowledge',
      )
    ) {
      return
    }
    if (navigateMessageHistory(-1, true)) {
      event.preventDefault()
      setSidebarOpen(false)
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
      const closedKey = sessionKey(selected)
      setComposerForKey(closedKey, '')
      // Drafts are cleared for a closed session, and so is everything the
      // knowledge panel remembered about it.
      forgetKnowledgeSession(closedKey)
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
      recordMuteChange(sessionKey(selected))
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
      onKeyDown={appKeyDown}
      onTouchCancel={() => {
        sidebarGestureRef.current = undefined
      }}
      onTouchEnd={sidebarTouchEnd}
      onTouchStart={sidebarTouchStart}
      style={
        {
          '--visual-viewport-height': `${viewportHeight}px`,
          '--visual-viewport-top': `${viewportOffsetTop}px`,
          '--sidebar-width': `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <div
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuemax={SIDEBAR_WIDTH_MAX}
        aria-valuemin={SIDEBAR_WIDTH_MIN}
        aria-valuenow={sidebarWidth}
        className="sidebar-resizer"
        data-resizing={resizingSidebar ? 'true' : 'false'}
        onDoubleClick={() => commitSidebarWidth(SIDEBAR_WIDTH_DEFAULT)}
        onKeyDown={sidebarResizeKeyDown}
        onLostPointerCapture={sidebarResizeEnd}
        onPointerDown={sidebarResizeStart}
        onPointerMove={sidebarResizeMove}
        onPointerUp={sidebarResizeEnd}
        role="separator"
        tabIndex={0}
      />
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

        <div className="sidebar__body">

          <nav aria-label="Sessions" className="session-list">
            <p className="sidebar-label">Recent</p>
            {loading ? <p className="sidebar-message">Loading sessions…</p> : null}
            {!loading && sessions.length === 0 ? (
              <p className="sidebar-message">No sessions here.</p>
            ) : null}
            <DndContext
              collisionDetection={closestCenter}
              onDragCancel={() => {
                sortableDragActiveRef.current = false
              }}
              onDragEnd={(event) => {
                sortableDragActiveRef.current = false
                handleDragEnd(event)
              }}
              onDragStart={() => {
                sortableDragActiveRef.current = true
              }}
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
                      backgroundTasks={backgroundTaskSnapshots}
                      key={computer.id}
                      onOpenSessionTasks={openTasksForSession}
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
        {knowledgeMode !== 'hidden' ? (
          <div className="sidebar-knowledge">
          <nav aria-label="Knowledge" className="knowledge-tree" ref={knowledgeTreeRef}>
            {roots.length === 0 ? (
              <p className="sidebar-message">
                Add a knowledge root to browse a folder on any computer.
              </p>
            ) : null}
            {roots.length > 0 ? (
              <div className="knowledge-roots">
                <button
                  aria-expanded={knowledgeRootsOpen}
                  className="knowledge-roots__summary"
                  onClick={() => setKnowledgeRootsOpen(!knowledgeRootsOpen)}
                  type="button"
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={`knowledge-chevron${
                      knowledgeRootsOpen ? ' knowledge-chevron--open' : ''
                    }`}
                    size={13}
                  />
                  <span className="sidebar-label">Roots</span>
                  <em>{roots.length}</em>
                </button>
                {knowledgeRootsOpen
                  ? roots.map((root) => (
                      <div className="knowledge-root" key={root.id}>
                        <button
                          aria-current={
                            root.id === activeRootId ? 'true' : undefined
                          }
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
                          className="icon-button icon-button--danger knowledge-root__remove"
                          onClick={() => void removeRoot(root.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  : null}
              </div>
            ) : null}
            {activeRoot ? (
              <>
                <div className="knowledge-toolbar">
                  <div
                    aria-label="Knowledge folder"
                    className="knowledge-crumbs"
                    role="group"
                  >
                    {knowledgeCrumbs(knowledgePath, activeRoot.name).map(
                      (crumb, index, all) => (
                        <span key={crumb.path}>
                          {index > 0 ? (
                            <span
                              aria-hidden="true"
                              className="knowledge-crumbs__sep"
                            >
                              /
                            </span>
                          ) : null}
                          <button
                            aria-current={
                              index === all.length - 1 ? 'true' : undefined
                            }
                            onClick={() =>
                              void openKnowledgeFolder(crumb.path)
                            }
                            type="button"
                          >
                            {crumb.name}
                          </button>
                        </span>
                      ),
                    )}
                  </div>
                  {canMoveSessionHere ? (
                    <button
                      aria-label="Move session to this folder"
                      className="icon-button"
                      disabled={movingSessionFolder || selectedMoveBusy}
                      onClick={() => void moveSessionToBrowsedFolder()}
                      title={
                        selectedMoveBusy
                          ? 'Wait for the current agent turn to finish'
                          : `Move this session to ${browsedFolderPath}`
                      }
                      type="button"
                    >
                      <FolderInput size={14} />
                    </button>
                  ) : null}
                  <button
                    aria-label="Collapse all folders"
                    className="icon-button"
                    disabled={expandedKnowledge.length === 0}
                    onClick={collapseKnowledgeTree}
                    type="button"
                  >
                    <ChevronsDownUp size={14} />
                  </button>
                </div>
                <div
                  className="knowledge-nodes"
                  onKeyDown={knowledgeTreeKeyDown}
                  role="tree"
                >
                  {knowledgeRows.map(
                    (row) =>
                      row.type === 'status' ? (
                        <p
                          className={`knowledge-node__status${
                            row.variant === 'error'
                              ? ' knowledge-node__status--error'
                              : ''
                          }`}
                          key={`${row.variant}:${row.path}`}
                          style={
                            {
                              '--knowledge-depth': row.depth,
                            } as CSSProperties
                          }
                        >
                          {row.variant === 'loading'
                            ? 'Loading…'
                            : row.variant === 'empty'
                              ? 'Empty folder'
                              : row.message}
                        </p>
                      ) : (
                        <button
                          aria-current={
                            knowledgeFile?.path === row.path
                              ? 'page'
                              : undefined
                          }
                          aria-expanded={
                            row.expandable ? row.expanded : undefined
                          }
                          aria-level={row.depth + 1}
                          className={`knowledge-node${
                            knowledgeFile?.path === row.path
                              ? ' knowledge-node--active'
                              : ''
                          }`}
                          data-knowledge-path={row.path}
                          key={row.path}
                          onClick={() =>
                            row.expandable
                              ? void toggleKnowledgeFolder(row.path)
                              : void openKnowledgeFile(row.path)
                          }
                          role="treeitem"
                          style={
                            {
                              '--knowledge-depth': row.depth,
                            } as CSSProperties
                          }
                          type="button"
                        >
                          {row.expandable ? (
                            <ChevronRight
                              aria-hidden="true"
                              className={`knowledge-chevron${
                                row.expanded ? ' knowledge-chevron--open' : ''
                              }`}
                              size={13}
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="knowledge-chevron knowledge-chevron--leaf"
                            />
                          )}
                          {row.expandable ? (
                            row.expanded ? (
                              <FolderOpen size={14} />
                            ) : (
                              <Folder size={14} />
                            )
                          ) : (
                            <FileText size={14} />
                          )}
                          <span className="knowledge-node__name">
                            {row.entry.name}
                          </span>
                        </button>
                      ),
                  )}
                </div>
              </>
            ) : null}
          </nav>
          </div>
        ) : null}
        <div className="sidebar-settings">
          <button
            aria-label="Add knowledge root"
            className="sidebar-settings__button"
            onClick={() => {
              if (knowledgeMode === 'hidden') {
                setKnowledgeMode('docked')
              }
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


      <div className={`workspace workspace--${knowledgeMode}`}>
      <main className="conversation" hidden={knowledgeMode === 'expanded'}>
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
            {selected ? (
              <span className="conversation-header__meta">
                {/* The description shrinks; the folder does not. On a phone
                    the icons leave little room, and letting this prefix take
                    what it likes clipped the folder away entirely -- which is
                    the only way into the workspace by touch. */}
                <span className="conversation-header__describes">
                  {`${providerName(selected.provider)}${
                    executionModeName(selected.executionMode)
                      ? ` · ${executionModeName(selected.executionMode)}`
                      : ''
                  } · ${selected.computerName} · `}
                </span>
                {/* The folder the session is in is also the way into it, so it
                    does not need a button of its own in the header. */}
                <button
                  aria-label="Browse current session folder"
                  className="conversation-header__cwd"
                  onClick={() => {
                    setWorkspaceInitialPath(undefined)
                    setWorkspaceInitialKind(undefined)
                    setWorkspaceOpen(true)
                  }}
                  title={`Browse ${selected.cwd}`}
                  type="button"
                >
                  {shortPath(selected.cwd)}
                </button>
              </span>
            ) : (
              <span>Ready when you are</span>
            )}
          </div>
          <button
            aria-label="Session knowledge"
            aria-pressed={knowledgeMode !== 'hidden'}
            className={`icon-button ${
              knowledgeMode !== 'hidden' ? 'icon-button--active' : ''
            }`}
            onClick={toggleKnowledgePanel}
            title={
              selected
                ? 'Knowledge for this session (Alt+K)'
                : 'Knowledge (Alt+K)'
            }
            type="button"
          >
            <BookOpen size={18} />
          </button>
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
            <ConversationMessages
              currentToolId={currentTool?.id}
              onShowAll={expandSelectedTranscript}
              showAll={expandedTranscripts[sessionKey(selected)] === true}
              // Identity is the computer and the session together: two
              // computers can hand out the same provider session id, and
              // keying on the id alone reuses this component between them,
              // carrying an expanded transcript across.
              key={sessionKey(selected)}
              messages={selected.messages}
            />
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
          {selected && !followingLatest ? (
            <div className="timeline-follow">
              <button
                aria-label="Scroll to latest"
                className="timeline-follow__button"
                onClick={followLatest}
                title="Scroll to latest"
                type="button"
              >
                <ChevronDown size={18} />
              </button>
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
            {statusline.backgroundTasks && selectedSupportsBackgroundTasks ? (
              <button
                aria-label="View background tasks"
                className={`web-statusline__tasks ${
                  selectedRunningBackgroundTasks > 0
                    ? 'web-statusline__tasks--running'
                    : ''
                }`}
                onClick={openBackgroundTasks}
                title="View background tasks"
                type="button"
              >
                {selectedRunningBackgroundTasks} background task
                {selectedRunningBackgroundTasks === 1 ? '' : 's'} running
              </button>
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
            {statusline.update && selected.runtime?.updateAvailable ? (
              <span
                className="web-statusline__update"
                data-testid="web-statusline-update"
              >
                v{selected.runtime.updateAvailable} available · run /update
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

      <aside
        aria-label="Session knowledge"
        className="knowledge-panel"
        hidden={knowledgeMode === 'hidden'}
      >
        <header className="knowledge-panel__header">
          <BookOpen aria-hidden="true" size={16} />
          <div className="knowledge-panel__title">
            <strong>{activeRoot?.name || 'Knowledge'}</strong>
            <small>
              {activeRoot
                ? `${activeRoot.computerName} · ${activeRoot.path}`
                : 'Add a root to read files beside this session'}
            </small>
          </div>
          <button
            aria-label="Show files"
            className="icon-button knowledge-panel__files"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <FolderOpen size={16} />
          </button>
          <button
            aria-label="New knowledge root"
            className="icon-button"
            onClick={() => setAddRootOpen(true)}
            type="button"
          >
            <Plus size={16} />
          </button>
          <button
            aria-label={
              knowledgeMode === 'expanded'
                ? 'Minimize knowledge panel'
                : 'Expand knowledge panel'
            }
            aria-pressed={knowledgeMode === 'expanded'}
            className={`icon-button ${
              knowledgeMode === 'expanded' ? 'icon-button--active' : ''
            }`}
            onClick={toggleKnowledgeExpanded}
            title="Alt+Shift+K"
            type="button"
          >
            {knowledgeMode === 'expanded' ? (
              <Minimize2 size={16} />
            ) : (
              <Maximize2 size={16} />
            )}
          </button>
          <button
            aria-label="Close knowledge panel"
            className="icon-button"
            onClick={() => setKnowledgeMode('hidden')}
            title="Alt+K"
            type="button"
          >
            <X size={16} />
          </button>
        </header>
        {error ? (
          <div className="error-banner knowledge-panel__error">
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError(undefined)}>
              <X size={16} />
            </button>
          </div>
        ) : null}
        <div className="knowledge-panel__body">
          <div className="knowledge-panel__reader">
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
                  Add a knowledge root to read files from any computer beside
                  this session.
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
      </div>

      <NewSessionDialog
        computers={computers}
        defaultComputerId={defaultComputerId}
        defaultRuntimes={defaultRuntimes}
        defaultSessionFolders={defaultSessionFolders}
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
          setBackgroundTaskSnapshots((current) =>
            Object.fromEntries(
              Object.entries(current).filter(
                ([key]) => !key.startsWith(`${computerId}:`),
              ),
            ),
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
      {selected ? (
        <BackgroundTasksDialog
          cancellingTaskId={cancellingBackgroundTaskId}
          loading={loadingBackgroundTasks}
          onCancel={(taskId) => void cancelSelectedBackgroundTask(taskId)}
          onClose={() => setBackgroundTasksOpen(false)}
          onRefresh={() => void loadBackgroundTasks(selected, true)}
          open={backgroundTasksOpen}
          sessionTitle={selected.title}
          snapshot={
            selectedBackgroundTasks || {
              tasks: [],
              runningCount: 0,
              supported: selectedSupportsBackgroundTasks,
            }
          }
        />
      ) : null}
      <AppSettingsDialog
        onApplyUpdate={() => void applyPwaUpdate()}
        onClose={() => setSettingsOpen(false)}
        computers={computers}
        defaultRuntimes={defaultRuntimes}
        defaultSessionFolders={defaultSessionFolders}
        onDefaultRuntimesChange={setDefaultRuntimes}
        onDefaultSessionFoldersChange={setDefaultSessionFolders}
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
