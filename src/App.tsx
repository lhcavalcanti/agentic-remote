import {
  Fragment,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import ReaderWorkspace, { READER_WIDTH_MIN } from './ReaderWorkspace'
import { Composer } from './composer/Composer'
import { useForegroundHandoff } from './composer/use-foreground-handoff'
import type { ComposerAttachment } from './composer/types'
import {
  activeComposerPastes,
  applyComposerEdit,
  collapsedPasteLabel,
  collapsedPasteLineThreshold,
  composerInputValue,
  composerTextPosition,
  expandComposerPastes,
  hasComposerAcceptanceReceipt,
  isComposerPastePayload,
  mergeUnresolvedComposerPastes,
  pastedLineCount,
  prependComposerContent,
  queuedEditOwners,
  reconcileAcceptedComposerDrafts,
  reconcileComposerEdit,
  recoverPendingComposerDraft,
  resolveComposerPastes,
  writeComposerContent,
  writeComposerEdit,
} from './composer/composer-state'
import type {
  CollapsedPaste,
  ComposerAcceptanceReceipt,
  ComposerContent,
  ComposerDraft,
  ComposerDrafts,
  ComposerEdit,
  ComposerSubmission,
  UnresolvedComposerPaste,
} from './composer/composer-state'
import {
  ManagerAssistant,
  ORACLE_CONVERSATION_WIDTH_MIN,
  ORACLE_PANEL_WIDTH_MIN,
  OracleButton,
} from './ManagerAssistant'
import type { OracleControl, OracleIndicator } from './ManagerAssistant'
import { oracleCommand } from './oracle-command'
import {
  binding,
  bindingLabel,
  capturableCode,
  sameBinding,
  shortcutAcceptsBinding,
  shortcutDefaults,
} from './app-shortcuts'
import type { ShortcutBinding, ShortcutId } from './app-shortcuts'
import { AppSettingsDialog } from './settings/AppSettingsDialog'
import { ShellNavigation } from './rail/ShellNavigation'
import { publishFeatureEvent } from './features/events'
import { NotificationPanel } from './notifications/NotificationPanel'
import { useNotifications } from './notifications/use-notifications'
import { readScheduleLink } from './notifications/schedule-link'
import { HostMonitorView } from './host-monitor/HostMonitorView'
import { SchedulerView } from './scheduler/SchedulerView'
import { usePreviewFeature } from './preview-features'
import { emptyRuntimeSelection } from './settings/runtime-defaults'
import { StatuslineControls } from './settings/StatuslineControls'
import type {
  AccentTheme,
  StatuslineSettings,
} from './settings/types'
import { PreviewFeaturesProvider } from './PreviewFeaturesProvider'
import {
  coordinatedAuthoritativeRefresh,
  dispatchAuthoritativeRefresh,
  DreamerRefreshOwner,
  waitUntilAuthoritativeRefresh,
} from './OracleDreamer'
import { isManagerEvent } from '../shared/manager'
import type { ManagerClientDefaults, ManagerEvent, ManagerSessionRef } from '../shared/manager'
import type {
  CSSProperties,
  ChangeEvent,
  ClipboardEvent as ReactClipboardEvent,
  DragEvent as ReactDragEvent,
  FormEvent,
  KeyboardEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  SyntheticEvent,
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
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import {
  ArrowUp,
  Bell,
  BellOff,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  Command,
  Eraser,
  Folder,
  FolderInput,
  FolderOpen,
  FileText,
  History,
  LoaderCircle,
  Maximize2,
  Menu,
  MessageCircleQuestion,
  MessageSquare,
  Minimize2,
  MonitorCog,
  Pencil,
  Plus,
  Plug,
  RefreshCw,
  Search,
  Settings,
  SquareTerminal,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { DocumentViewControls } from './DocumentViewControls'
import { HtmlPreview } from './HtmlPreview'
import { MarkdownCodeBlock } from './MarkdownCodeBlock'
import { WorkspaceFileIcon } from './WorkspaceFileIcon'
import { KnowledgeRootSelector } from './KnowledgeRootSelector'
import {
  KnowledgeRootChoices,
  type KnowledgeRootChoice,
  type KnowledgeRootSession,
} from './KnowledgeRootChoices'
import {
  knowledgePositionForBinding,
  useSessionKnowledgeRoot,
} from './use-session-knowledge-root'
import { SessionActions } from './SessionActions'
import { ActivityRow } from './ActivityRow'
import { activityKindFromMessage, activityPresentation } from './activity-presentation'
import { SessionOriginBadge } from './SessionOriginBadge'
import { SessionOriginRunLink } from './SessionOriginRunLink'
import { SubagentCount } from './SubagentCount'
import { SessionRetentionSettings } from './SessionRetentionSettings'
import { SessionResources } from './SessionResources'
import {
  isSessionResourceCommandName,
  sessionResourceCommand,
  sessionResourceCommands,
  sessionResourceOwner,
  type SessionResourceTab,
} from './session-resource-commands'
import {
  SessionNavigation,
  type PendingSessionCreation,
} from './SessionNavigation'
import {
  reorderSessionLaneWithHiddenFollowers,
  sessionNavigationView,
  stepVisibleSession,
  type SessionFilter,
} from './session-navigation-view'
import {
  computerTone,
  executionModeName,
  orderSessionLane,
  pendingSessionPlacements,
  providerName,
  retainedSessionNotice,
  sessionKey,
  shortPath,
  taskSnapshot,
} from './session-presentation'
import type { SessionSort } from './session-presentation'
import { MermaidDiagram } from './MermaidDiagram.js'
import {
  breadcrumbSegments,
  resolveDocumentPath,
  resolveDocumentLink,
  scrollToDocumentFragment,
  scrollToDocumentHeading,
  isExternalSource,
  isReaderScroll,
  pushNavigation,
  rememberScroll,
  type NavigationEntry,
} from './markdown-navigation'
import remarkGfm from 'remark-gfm'
import { remarkSafeBreaks } from './remark-safe-breaks'
import { SideQuestionPanel } from './SideQuestions'
import { sideQuestionCommand } from './side-question-command'
import { phoneEnterCreatesNewline } from './enter-behavior'
import type { SideQuestionEntry, SideThread } from './SideQuestions'
import {
  SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH,
  SIDE_QUESTION_EARLIER_LIMIT,
} from '../shared/side-question'
import type {
  AgentProvider,
  BackgroundTaskSnapshot,
  ChatMessage,
  ComputerSummary,
  DirectoryListing,
  HubWireEvent,
  ManagedSession,
  KnowledgeRoot,
  SessionKnowledgeBinding,
  SessionOrderSnapshot,
  SessionStatus,
  QueuedPrompt,
  UserInputReplyInput,
  SlashCommand,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResult,
} from '../shared/contracts'
import {
  hasActiveBackgroundTasks,
  hasForegroundTurn,
  hasRunningBackgroundAgent,
} from '../shared/background-tasks'
import { terminalSendOptions } from '../shared/send-policy'
import { turnEnded } from '../shared/session-unread'
import {
  createPendingEcho,
  nextPendingEchoDeadline,
  prunePendingEchoMap,
  unloggedPendingEchoes,
  type PendingEcho,
} from './pending-echo'
import {
  knowledgeAbsolutePath,
  normalizeKnowledgeRelativePath,
} from '../shared/knowledge-path'
import {
  deliveryUncertaintyFromError,
  SubmissionError,
  submissionReceiptFromError,
} from '../shared/submission-error'
import {
  sessionFileValidationError,
  supportsSessionFile,
} from '../shared/session-files'
import {
  activateSession,
  cancelBackgroundTask,
  askSession,
  cancelSession,
  checkHubSignIn,
  clearConversation,
  recoverConversation,
  configureRetention,
  deleteSession,
  closeSession,
  executeCommand,
  getPushSettings,
  getSession,
  SessionKnowledgeRequestError,
  listComputers,
  listCommands,
  listBackgroundTasks,
  listKnowledgeEntries,
  listKnowledgeRoots,
  addKnowledgeRoot,
  deleteKnowledgeRoot,
  readKnowledgeFile,
  listDirectories,
  validateSessionDirectory,
  listSessionListing,
  listWorkspace,
  moveSessionToTmux,
  removeQueuedPrompt,
  reorderQueuedPrompts,
  updateQueuedPrompt,
  dispatchQueuedPrompt,
  renameSession,
  readWorkspaceFile,
  restartSession,
  resumeSession,
  saveSessionVisibility,
  saveHiddenSessionVisibility,
  saveSessionHidden,
  saveSessionUnread,
  suspendSession,
  fetchSessionOrder,
  fetchSettingsProfile,
  importSettingsProfile,
  saveSettingsChanges,
  saveSessionOrderLane,
  bootstrapSessionOrder,
  replyPermission,
  replyUserInput,
  sendMessage,
  searchWorkspace,
  setSessionNotificationsMuted,
  transcribeAudio,
  uploadSessionFile,
} from './api'
import {
  HUB_SIGN_IN_EXPIRED_MESSAGE,
  hubSignInExpired,
  subscribeHubSignIn,
} from './hub-sign-in'
import { isHubUnreachable } from './hub-reachability'
import { SignInExpiredNotice } from './SignInExpiredNotice'
import { innermostDialogFrame, subscribeDialogFrames } from './components/dialog-stack'
import {
  currentSessionEventSequence,
  nextSessionEventSequence,
  carrySnapshotTranscripts,
  projectSessionResponse,
  sessionResponseStartedAt,
} from './session-response-order'
import type { Appearance } from './appearance'
import {
  readLegacySettings,
  resolveAppearance,
  SettingsProfileClient,
  settingsProfileCacheKey,
  type SettingsCacheStorage,
  type SettingsProfileState,
} from './settings-profile'
import {
  alertNotification,
  notificationAllowed,
  OracleNotifier,
  oracleNotificationTags,
} from '../shared/notifications'
import {
  type AppearanceSetting,
  type NewSessionBackendSetting,
  type SettingsProfileKey,
  type SettingsProfileValues,
} from '../shared/settings-profile'
import { knowledgeRestoreAction } from './knowledge-restore'
import {
  collapseKnowledgeFolder,
  expandKnowledgeFolder,
  knowledgeCrumbs,
  knowledgePathChain,
  knowledgeRootPath,
  knowledgeTreeRows,
  orderedWorkspaceEntries,
  type KnowledgeFolders,
} from './knowledge-tree'
import { composerMaximumHeight } from './composer-sizing'
import { appKeyboardOpen, appViewportGeometry } from './app-viewport'
import {
  activatePwaUpdate,
  clearSessionPushNotifications,
  clearPushNotifications,
  installedAsApp,
  PWA_UPDATE_EVENT,
  sessionNotificationTags,
} from './pwa'
import {
  attentionCount,
  nativeShell,
  onShellDeepLink,
  sendShellNotification,
  setShellBadge,
  withdrawShellNotifications,
} from './shell'
import {
  notificationState,
  ScheduleShellNotifier,
  shellNotifications,
  type SessionNotificationState,
} from './shell-notifications'
import { DialogFrame } from './components/DialogFrame'
import { CloseSessionDialog, RecentlyClosedDialog } from './RecentlyClosed'
import { useRecentlyClosed } from './use-recently-closed'
import { CLOSED_SESSION_RETENTION_DAYS } from '../shared/closed-sessions'
import { ComputersDialog } from './computers/ComputersDialog'
import { MessageTime } from './MessageTime'
import { drawnInParts } from './markdown-document/drawing'
import { useMarkdownDocument } from './markdown-document/use-markdown-document'
import { PauseFollowingContext } from './sent-message'
import { SentMessageContent } from './SentMessageContent'
import { SessionPatchReceiver } from './session-patches'
import { BackgroundTasksDialog } from './features/background-tasks/BackgroundTasksDialog'
import {
  PermissionCard,
  StaleInteractionRecoveryCard,
  UserInputCard,
} from './features/prompts/PromptCards'
import { NewSessionDialog } from './session-setup/NewSessionDialog'
import { RuntimeDialog } from './session-setup/RuntimeDialog'
import {
  compactTokens,
  computerProviders,
} from './session-setup/runtime-presentation'
import type {
  DefaultRuntimeSettings,
  DefaultSessionFolders,
  SessionCreationHandle,
} from './session-setup/types'

function scopedKnowledgeRoot(
  root: KnowledgeRoot,
  rootPath: string,
): KnowledgeRoot {
  const normalized = normalizeKnowledgeRelativePath(rootPath)
  if (normalized === knowledgeRootPath) {
    return root
  }
  return {
    ...root,
    name: normalized.split('/').at(-1) || root.name,
    path: knowledgeAbsolutePath(root.path, normalized),
  }
}

function knowledgeExpansionKey(rootId: string, rootPath: string): string {
  const normalized = normalizeKnowledgeRelativePath(rootPath)
  return normalized === knowledgeRootPath
    ? rootId
    : `${rootId}:${normalized}`
}

function isAudioFile(file: File): boolean {
  return (
    file.type.startsWith('audio/') ||
    file.type === 'video/mp4' ||
    /\.(?:aac|flac|m4a|mp3|mp4|ogg|wav|webm)$/i.test(file.name)
  )
}

let attachmentSequence = 0

function attachmentId(): string {
  attachmentSequence += 1
  return `attachment-${Date.now().toString(36)}-${attachmentSequence.toString(36)}-${Math.random().toString(36).slice(2)}`
}

const clipboardImageExtensions: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const normalizedClipboardFiles = new WeakMap<File, File>()

function normalizedClipboardFile(file: File): File {
  if (supportsSessionFile(file.name)) {
    return file
  }
  const extension = clipboardImageExtensions[file.type]
  if (!extension || /\.[^./\\]+$/.test(file.name)) {
    return file
  }
  const cached = normalizedClipboardFiles.get(file)
  if (cached) {
    return cached
  }
  const normalized = new File([file], `clipboard-image.${extension}`, {
    type: file.type,
    lastModified: file.lastModified,
  })
  normalizedClipboardFiles.set(file, normalized)
  return normalized
}

function pastedFiles(data: DataTransfer): File[] {
  const files = Array.from(data.files || [])
  if (files.length > 0) {
    return files.map(normalizedClipboardFile)
  }
  return Array.from(data.items || [])
    .filter((item) => item.kind === 'file')
    .flatMap((item) => {
      const file = item.getAsFile()
      return file ? [normalizedClipboardFile(file)] : []
    })
}

function attachmentSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MiB`
  }
  if (size >= 1024) {
    return `${Math.ceil(size / 1024)} KiB`
  }
  return `${size} B`
}

async function clipboardFileFingerprint(file: File): Promise<string> {
  const metadata = [
    file.name,
    file.type,
    file.size.toString(),
    file.lastModified.toString(),
  ]
  if (isAudioFile(file)) {
    return metadata.join('\u0000')
  }
  const buffer = typeof file.arrayBuffer === 'function'
    ? await file.arrayBuffer()
    : await new Response(file).arrayBuffer()
  let hash = 2_166_136_261
  for (const byte of new Uint8Array(buffer)) {
    hash ^= byte
    hash = Math.imul(hash, 16_777_619)
  }
  return [...metadata, (hash >>> 0).toString(36)].join('\u0000')
}

function recordingDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
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
const SIDEBAR_WIDTH_DEFAULT = 320
const SIDEBAR_WIDTH_MIN = 220
const SIDEBAR_WIDTH_MAX = 560
const SESSION_NAVIGATION_STORAGE_KEY = 'agentic-remote:session-navigation-v1'
// How long looking at a session waits for the hub to show it unread. Its mark
// follows the session event within moments; a first snapshot can take longer.
const READ_INTENT_MS = 15_000

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

function readStoredSessionNavigation(): {
  query: string
  filter: SessionFilter
} {
  const fallback = { query: '', filter: 'all' as const }
  try {
    const raw = localStorage.getItem(SESSION_NAVIGATION_STORAGE_KEY)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    const query = Reflect.get(parsed as object, 'query')
    const filter = Reflect.get(parsed as object, 'filter')
    if (
      typeof query !== 'string'
      || !['all', 'attention', 'working', 'unread'].includes(String(filter))
    ) return fallback
    return { query, filter: filter as SessionFilter }
  } catch {
    return fallback
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

/**
 * Remembering something is a convenience, and storage is not always there to
 * remember it in. Safari with cookies blocked throws on the first access, and
 * a full quota throws on the write; both happen inside effects, where an
 * exception unmounts the whole tree and leaves a blank page. Reads were
 * already guarded, so the writes are guarded the same way.
 */
function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Losing a remembered preference is not a reason to take the app down.
  }
}

function clearStored(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // As above.
  }
}

const settingNames: Record<SettingsProfileKey, string> = {
  appearance: 'Appearance',
  accent: 'Accent',
  statusline: 'Status line',
  newSessionRuntimes: 'New-session models',
  newSessionFolders: 'New-session folders',
  newSessionBackend: 'New-session backend',
  sessionSort: 'Session sort',
  computerOrder: 'Computer order',
  oracleResponseStyle: 'Oracle’s response style',
  notificationScope: 'What notifies you',
  previewFeatures: 'Preview features',
  schedulerAllowAllForOracle: 'Oracle schedule permissions',
  displayName: 'Display name',
}

/** Storage that may be blocked outright, as some private modes do. */
function browserStorage(kind: 'localStorage' | 'sessionStorage'): SettingsCacheStorage {
  try {
    const storage = window[kind]
    if (storage) return storage
  } catch {
    // Fall through to a store that keeps nothing.
  }
  return { getItem: () => null, setItem: () => undefined }
}

function createSettingsProfileClient(): SettingsProfileClient {
  const local = browserStorage('localStorage')
  return new SettingsProfileClient({
    transport: {
      fetch: fetchSettingsProfile,
      update: saveSettingsChanges,
      import: importSettingsProfile,
    },
    storage: local,
    legacy: () => readLegacySettings(local, browserStorage('sessionStorage')),
  })
}

const prefersLightQuery = '(prefers-color-scheme: light)'

function subscribePrefersLight(notify: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined
  const media = window.matchMedia(prefersLightQuery)
  media.addEventListener?.('change', notify)
  return () => media.removeEventListener?.('change', notify)
}

function prefersLightNow(): boolean {
  return typeof window.matchMedia === 'function' && Boolean(window.matchMedia(prefersLightQuery)?.matches)
}

function settingsNotice(state: SettingsProfileState): string | undefined {
  if (state.conflicts.length) {
    const names = state.conflicts.map((key) => settingNames[key])
    return `${names.join(', ')} ${names.length === 1 ? 'was' : 'were'} changed on another device first, so this device now uses that choice.`
  }
  if (!state.refused) return undefined
  return state.refusedKey
    ? `${settingNames[state.refusedKey]} wasn’t saved: ${state.refused}`
    : `Couldn’t save a setting: ${state.refused}`
}

function currentAppViewportGeometry(keyboardOpen: boolean) {
  if (typeof window === 'undefined') {
    return { height: 800, offsetTop: 0 }
  }
  const viewport = window.visualViewport
  return appViewportGeometry({
    innerHeight: window.innerHeight,
    visualHeight: viewport?.height,
    visualOffsetTop: viewport?.offsetTop,
    standalone: installedAsApp(),
    keyboardOpen,
  })
}

type ComposerHistoryState = {
  messages: string[]
  index: number
  draft: string
  draftPastes: CollapsedPaste[]
}

type ComposerPersistenceResult =
  | { ok: true }
  | { ok: false; error: string }

type ComposerStorageSnapshot = {
  drafts: ComposerDrafts
  legacyDrafts: Record<string, string>
  legacyPastes: Record<string, unknown[]>
  queuedEdits: Record<string, string>
  queuedDispatches: Record<string, string>
  receipts: ComposerAcceptanceReceipt[]
  generationPresent: boolean
  failureStamps: Record<string, string>
  recoveredContents: Record<string, string>
}

const composerDraftsStorageKey = 'agentic-remote:composer-drafts-v2'
const composerAttachmentsStorageKey = 'agentic-remote:composer-attachments-v1'
const queuedEditsStorageKey = 'agentic-remote:queued-edit'
const queuedDispatchPendingStorageKey = 'agentic-remote:queued-dispatch-pending'
// Set the first time this build persists, and never cleared. Its presence is
// what tells a first upgrade from a return to one.
const composerDraftsGenerationKey = 'agentic-remote:composer-drafts-generation'
const composerAcceptanceReceiptLimit = 64
let collapsedPasteKeySequence = 0

function newCollapsedPasteKey(): string {
  collapsedPasteKeySequence += 1
  return `${Date.now().toString(36)}-${collapsedPasteKeySequence.toString(36)}-${Math.random().toString(36).slice(2)}`
}

class ComposerStorageFormatError extends Error {
  constructor(key: string, detail: string) {
    super(`${key}: ${detail}`)
    this.name = 'ComposerStorageFormatError'
  }
}

function isComposerObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isComposerOwnerKey(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }
  const separator = value.indexOf(':')
  return separator > 0 && separator < value.length - 1
}

function isComposerRecord(value: unknown, item: (value: unknown) => boolean): boolean {
  return isComposerObject(value) &&
    Object.entries(value).every(([key, entry]) => isComposerOwnerKey(key) && item(entry))
}

function isStoredComposerPaste(value: unknown): boolean {
  if (!isComposerObject(value)) {
    return false
  }
  const { key, start, unresolved } = value
  if (!isComposerPastePayload(value)) {
    return false
  }
  // A missing or displaced anchor is recoverable, not evidence that its
  // payload can be discarded. Wrong structural types are not a valid record.
  return (key === undefined || typeof key === 'string') &&
    (start === undefined || Number.isInteger(start)) &&
    (unresolved === undefined || typeof unresolved === 'boolean')
}

function isStoredComposerContent(value: unknown): value is Record<string, unknown> {
  return isComposerObject(value) && typeof value.text === 'string' &&
    Array.isArray(value.pastes) && value.pastes.every(isStoredComposerPaste)
}

function isStoredComposerDraft(value: unknown): boolean {
  if (!isStoredComposerContent(value)) {
    return false
  }
  const pending = value.pendingSubmission
  const unresolved = value.unresolvedPastes
  const unresolvedKeys = Array.isArray(unresolved)
    ? unresolved.flatMap((paste) =>
        isComposerObject(paste) && typeof paste.key === 'string' ? [paste.key] : [])
    : []
  const queuedEdit = value.queuedEdit
  return (value.deliveryUncertain === undefined || typeof value.deliveryUncertain === 'boolean') &&
    (queuedEdit === undefined || (
      isComposerObject(queuedEdit) &&
      typeof queuedEdit.promptId === 'string' && queuedEdit.promptId.length > 0 &&
      (queuedEdit.dispatchPending === undefined ||
        typeof queuedEdit.dispatchPending === 'boolean') &&
      (queuedEdit.attachmentIds === undefined || (
        Array.isArray(queuedEdit.attachmentIds) &&
        queuedEdit.attachmentIds.every((id) =>
          typeof id === 'string' && id.length > 0,
        ) &&
        new Set(queuedEdit.attachmentIds).size === queuedEdit.attachmentIds.length
      ))
    )) &&
    (unresolved === undefined ||
      (Array.isArray(unresolved) && unresolved.every((paste) =>
        isComposerObject(paste) && typeof paste.key === 'string' &&
        paste.key.length > 0 && isComposerPastePayload(paste),
      ) && new Set(unresolvedKeys).size === unresolved.length)) &&
    (pending === undefined || (
      isStoredComposerContent(pending) &&
      typeof pending.id === 'string' && pending.id.length > 0 &&
      typeof pending.text === 'string' && pending.text.length > 0 &&
      (pending.originKey === undefined || isComposerOwnerKey(pending.originKey)) &&
      (pending.acknowledgesFailure === undefined || typeof pending.acknowledgesFailure === 'string') &&
      (pending.queuedPromptId === undefined ||
        (typeof pending.queuedPromptId === 'string' && pending.queuedPromptId.length > 0)) &&
      (pending.accepted === undefined || typeof pending.accepted === 'boolean')
    ))
}

function readComposerStorageValue<T>(
  key: string,
  missing: T,
  valid: (value: unknown) => boolean,
): { value: T; present: boolean } {
  const raw = localStorage.getItem(key)
  if (raw === null) {
    return { value: missing, present: false }
  }
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    throw new ComposerStorageFormatError(key, 'invalid JSON')
  }
  if (!valid(value)) {
    throw new ComposerStorageFormatError(key, 'invalid saved composer schema')
  }
  return { value: value as T, present: true }
}

function readComposerStorageSnapshot(): ComposerStorageSnapshot {
  const generation = readComposerStorageValue<
    1 | { version: 1; accepted: ComposerAcceptanceReceipt[] }
  >(composerDraftsGenerationKey, 1, (value) =>
    value === 1 || (isComposerObject(value) && value.version === 1 &&
      Array.isArray(value.accepted) && value.accepted.length <= composerAcceptanceReceiptLimit &&
      value.accepted.every((receipt) => isComposerObject(receipt) &&
        isComposerOwnerKey(receipt.key) &&
        typeof receipt.id === 'string' && receipt.id.length > 0)),
  )
  const strings = (value: unknown) => isComposerRecord(value, (entry) => typeof entry === 'string')
  const queuedOwners = (value: unknown) => isComposerRecord(
    value, (entry) => typeof entry === 'string' && entry.length > 0,
  )
  return {
    drafts: readComposerStorageValue<ComposerDrafts>(
      composerDraftsStorageKey, {}, (value) => isComposerRecord(value, isStoredComposerDraft),
    ).value,
    legacyDrafts: readComposerStorageValue<Record<string, string>>(
      'agentic-remote:composer-drafts', {}, strings,
    ).value,
    legacyPastes: readComposerStorageValue<Record<string, unknown[]>>(
      'agentic-remote:composer-pastes', {}, (value) => isComposerRecord(
        value, (entry) => Array.isArray(entry) && entry.every(isStoredComposerPaste),
      ),
    ).value,
    queuedEdits: readComposerStorageValue<Record<string, string>>(
      queuedEditsStorageKey, {}, queuedOwners,
    ).value,
    queuedDispatches: readComposerStorageValue<Record<string, string>>(
      queuedDispatchPendingStorageKey, {}, queuedOwners,
    ).value,
    failureStamps: readComposerStorageValue<Record<string, string>>(
      'agentic-remote:composer-draft-failures', {}, strings,
    ).value,
    recoveredContents: readComposerStorageValue<Record<string, string>>(
      'agentic-remote:composer-draft-recovered', {}, strings,
    ).value,
    receipts: generation.value === 1 ? [] : generation.value.accepted,
    generationPresent: generation.present,
  }
}

function composerReadFailureMessage(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error)
  return `Saved drafts could not be read (${detail}). Copy new text and reload after storage is available.`
}

function readComposerAttachments(
  drafts: ComposerDrafts,
): Record<string, ComposerAttachment[]> {
  try {
    const raw = localStorage.getItem(composerAttachmentsStorageKey)
    if (!raw) {
      return {}
    }
    const parsed: unknown = JSON.parse(raw)
    if (!isComposerRecord(parsed, (value) =>
      Array.isArray(value) && value.every((attachment) =>
        isComposerObject(attachment) &&
        typeof attachment.id === 'string' && attachment.id.length > 0 &&
        typeof attachment.name === 'string' && attachment.name.length > 0 &&
        typeof attachment.size === 'number' && attachment.size >= 0 &&
        Number.isFinite(attachment.size) &&
        (
          attachment.migratedFrom === undefined ||
          (
            typeof attachment.migratedFrom === 'string' &&
            attachment.migratedFrom.length > 0
          )
        ) &&
        typeof attachment.promptText === 'string' &&
        attachment.promptText.length > 0,
      ))) {
      return {}
    }
    return Object.fromEntries(
      Object.entries(parsed as Record<string, Array<{
        id: string
        name: string
        size: number
        migratedFrom?: string
        promptText: string
      }>>).flatMap(([ownerKey, attachments]) => {
        const draft = drafts[ownerKey]
        const restored = attachments
          .filter((attachment) =>
            composerDraftContainsAttachment(draft, attachment.promptText),
          )
          .map((attachment) => {
            const separator = ownerKey.indexOf(':')
            return {
              ...attachment,
              ownerKey,
              computerId: ownerKey.slice(0, separator),
              sessionId: ownerKey.slice(separator + 1),
              status: 'attached' as const,
            }
          })
        return restored.length > 0 ? [[ownerKey, restored]] : []
      }),
    )
  } catch {
    return {}
  }
}

function composerDraftContainsAttachment(
  draft: ComposerDraft | undefined,
  promptText: string,
): boolean {
  return Boolean(
    draft?.text.includes(promptText) ||
    (
      draft?.pendingSubmission?.accepted !== true &&
      draft?.pendingSubmission?.text.includes(promptText)
    ),
  )
}

function readComposerDrafts(snapshot: ComposerStorageSnapshot): ComposerDrafts {
  const stored = snapshot.drafts
  const result: ComposerDrafts = {}
  const receipts = snapshot.receipts
  const acceptedLegacySnapshots: Record<string, string> = {}
  for (const [key, candidate] of Object.entries(stored)) {
    const decoded = resolveComposerPastes(candidate.text, candidate.pastes, key)
    const draft: ComposerDraft = {
      text: candidate.text,
      pastes: decoded.pastes,
    }

    const savedUnresolved = candidate.unresolvedPastes
    if (savedUnresolved || decoded.unresolvedPastes.length > 0) {
      draft.unresolvedPastes = mergeUnresolvedComposerPastes(
        savedUnresolved, decoded.unresolvedPastes,
      )
    }
    if (candidate.deliveryUncertain === true) {
      draft.deliveryUncertain = true
    }
    if (
      candidate.queuedEdit &&
      typeof candidate.queuedEdit.promptId === 'string' &&
      candidate.queuedEdit.promptId
    ) {
      draft.queuedEdit = {
        promptId: candidate.queuedEdit.promptId,
        ...(candidate.queuedEdit.dispatchPending === true ? { dispatchPending: true } : {}),
        ...(candidate.queuedEdit.attachmentIds?.length
          ? { attachmentIds: candidate.queuedEdit.attachmentIds }
          : {}),
      }
    }
    const pending = candidate.pendingSubmission
    let unresolvedPending: UnresolvedComposerPaste[] = []
    if (pending) {
      const decodedPending = resolveComposerPastes(
        pending.text, pending.pastes, `${key}:submission:${pending.id}`,
      )
      unresolvedPending = decodedPending.unresolvedPastes
      draft.pendingSubmission = {
        id: pending.id,
        ...(typeof pending.originKey === 'string' ? { originKey: pending.originKey } : {}),
        text: pending.text,
        pastes: decodedPending.pastes,
        ...(typeof pending.acknowledgesFailure === 'string'
          ? { acknowledgesFailure: pending.acknowledgesFailure }
          : {}),
        ...(typeof pending.queuedPromptId === 'string' && pending.queuedPromptId
          ? { queuedPromptId: pending.queuedPromptId }
          : {}),
      }
      if (draft.pendingSubmission.queuedPromptId) {
        draft.queuedEdit = {
          promptId: draft.pendingSubmission.queuedPromptId,
          dispatchPending: true,
          ...(candidate.queuedEdit?.attachmentIds?.length
            ? { attachmentIds: candidate.queuedEdit.attachmentIds }
            : {}),
        }
      }
    }
    if (draft.pendingSubmission && hasComposerAcceptanceReceipt(receipts, key, draft.pendingSubmission)) {
      const beforeAcceptance = recoverPendingComposerDraft(draft)
      acceptedLegacySnapshots[key] = expandComposerPastes(
        beforeAcceptance.text,
        beforeAcceptance.pastes,
      )
      draft.pendingSubmission.accepted = true
    }
    if (!draft.pendingSubmission?.accepted && unresolvedPending.length > 0) {
      draft.unresolvedPastes = mergeUnresolvedComposerPastes(
        draft.unresolvedPastes, unresolvedPending,
      )
    }
    const recovered = draft.pendingSubmission?.accepted
      ? draft
      : recoverPendingComposerDraft(draft)
    if (recovered.text || recovered.queuedEdit ||
        recovered.pendingSubmission?.accepted || recovered.unresolvedPastes?.length) {
      result[key] = recovered
    }
  }
  const legacy = readLegacyComposerDrafts(snapshot)
  // An older build writes only the legacy key, so after a rollback and back
  // again its drafts are the newer ones -- and taking this state whenever it
  // held anything at all wrote the stale copy straight back over them. Where
  // the two disagree about a session, the legacy text is what was written
  // last.
  // Whether this build has ever written here. Without it, a legacy map and a
  // v2 map are the same picture whether this is a first upgrade or a return
  // from one -- and the two want opposite answers. On a first upgrade the
  // legacy map is everything there is. On a return, the older build has been
  // writing it in full ever since, so a session it holds nothing for is one
  // whose draft was sent or cleared over there, and keeping ours brought that
  // draft back from the dead.
  const returning = snapshot.generationPresent
  if (returning) {
    for (const key of Object.keys(result)) {
      if (!legacy[key] && !result[key].queuedEdit) {
        delete result[key]
      }
    }
  }
  for (const [key, draft] of Object.entries(legacy)) {
    const mine = result[key]
    // The legacy copy may still contain the accepted submission if cleanup
    // stopped between writes. Only this exact old snapshot is superseded;
    // writing from an older build still wins when it differs.
    if (mine?.pendingSubmission?.accepted && acceptedLegacySnapshots[key] === draft.text) {
      continue
    }
    // An unconfirmed queued send keeps its target even if compatibility writes
    // were interrupted. A plain legacy draft cannot authorize another send.
    if (mine?.queuedEdit?.dispatchPending && !mine.pendingSubmission?.accepted) {
      continue
    }
    if (!mine || expandComposerPastes(mine.text, mine.pastes) !== draft.text) {
      result[key] = {
        ...draft,
        ...(mine?.queuedEdit ? { queuedEdit: mine.queuedEdit } : {}),
        ...(mine?.pendingSubmission?.accepted ? { pendingSubmission: mine.pendingSubmission } : {}),
      }
    }
  }
  return Object.keys(result).length > 0 ? result : legacy
}

function readLegacyComposerDrafts(
  snapshot: ComposerStorageSnapshot,
): ComposerDrafts {
  const stored = snapshot.legacyDrafts
  const storedPastes = snapshot.legacyPastes
  const edits = snapshot.queuedEdits
  const pending = snapshot.queuedDispatches
  return Object.fromEntries(
    Object.entries({
      ...Object.fromEntries(Object.keys({ ...edits, ...pending }).map((key) => [key, ''])),
      ...stored,
    })
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([key, text]) => {
        const decoded = resolveComposerPastes(
          text, storedPastes[key] || [], key, true,
        )
        const promptId = pending[key] || edits[key]
        return [key, {
          text,
          pastes: decoded.pastes,
          ...(decoded.unresolvedPastes.length
            ? { unresolvedPastes: decoded.unresolvedPastes }
            : {}),
          ...(promptId ? {
            queuedEdit: { promptId, ...(pending[key] ? { dispatchPending: true } : {}) },
          } : {}),
        }]
      }),
  )
}

function writeQueuedEditOwners(storageKey: string, owners: Record<string, string>) {
  if (Object.keys(owners).length) {
    localStorage.setItem(storageKey, JSON.stringify(owners))
  } else {
    localStorage.removeItem(storageKey)
  }
}

/**
 * How much room a session's Knowledge panel takes. `expanded` covers the
 * conversation so a document can be read at full width without losing the
 * session it belongs to.
 */
const shortcutsStorageKey = 'agentic-remote:shortcuts'
const oraclePlacementStorageKey = 'agentic-remote:oracle-placement'
type OraclePlacement = 'overlay' | 'docked'

function readOraclePlacement(): OraclePlacement {
  try {
    const stored = localStorage.getItem(oraclePlacementStorageKey)
    if (!stored || stored === 'overlay') return 'overlay'
    if (stored === 'docked') return 'docked'
    clearStored(oraclePlacementStorageKey)
    return 'overlay'
  } catch {
    return 'overlay'
  }
}

function bindingMatches(
  event: Pick<
    globalThis.KeyboardEvent,
    'code' | 'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey'
  >,
  wanted: ShortcutBinding,
): boolean {
  return (
    event.code === wanted.code &&
    event.altKey === wanted.alt &&
    event.shiftKey === wanted.shift &&
    event.ctrlKey === wanted.ctrl &&
    event.metaKey === wanted.meta
  )
}

/** Whether a binding is one the editor would have accepted. */
// Storage is not a trusted source: an older version of the app, a hand edit,
// or another tab can leave anything here. What comes back has to clear the
// same bar as something typed into the editor, or a rule the reader cannot
// break by hand is one they can break by reloading.
function usableBinding(value: unknown): value is ShortcutBinding {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const candidate = value as Partial<ShortcutBinding>
  if (typeof candidate.code !== 'string' || !candidate.code) {
    return false
  }
  // Booleans, not merely things that look true. `alt: "no"` is a string, and
  // reading it through `Boolean` turned it into a shortcut nobody asked for.
  for (const flag of [
    candidate.alt,
    candidate.shift,
    candidate.ctrl,
    candidate.meta,
  ]) {
    if (flag !== undefined && typeof flag !== 'boolean') {
      return false
    }
  }
  if (!capturableCode(candidate.code)) {
    return false
  }
  // Held with nothing, it would fire while typing anywhere outside a text box.
  return Boolean(candidate.alt || candidate.ctrl || candidate.meta)
}

function readStoredShortcuts(): Partial<Record<ShortcutId, ShortcutBinding>> {
  const stored: unknown = readStoredOrder<unknown>(shortcutsStorageKey, {})
  // `null` parses happily out of storage and is an object to `typeof`, so
  // reading its entries threw before anything had rendered.
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {}
  }
  const known = new Map(shortcutDefaults.map((entry) => [entry.id, entry]))
  const clean: Partial<Record<ShortcutId, ShortcutBinding>> = {}
  for (const [id, value] of Object.entries(stored)) {
    const shortcutId = id as ShortcutId
    if (
      !known.has(shortcutId) ||
      !usableBinding(value) ||
      !shortcutAcceptsBinding(shortcutId, value)
    ) {
      continue
    }
    clean[shortcutId] = binding(value.code, {
      alt: Boolean(value.alt),
      shift: Boolean(value.shift),
      ctrl: Boolean(value.ctrl),
      meta: Boolean(value.meta),
    })
  }
  // Two rows answering to the same keys means only the first is ever reached,
  // and the other can no longer be pressed at all. What matters is the set the
  // handler ends up with, defaults included -- checking the overrides against
  // each other left one free to collide with a default that had been fallen
  // back to, which is the same fault one step along.
  //
  // Dropping an override is always enough, because the defaults are unique
  // among themselves: with every override gone the set is sound, so removing
  // them until nothing collides terminates.
  for (;;) {
    const effective = shortcutDefaults.map((entry) => ({
      id: entry.id,
      binding: clean[entry.id] || entry.binding,
    }))
    const clash = effective.find((entry, index) =>
      effective.some(
        (other, otherIndex) =>
          otherIndex < index && sameBinding(other.binding, entry.binding),
      ),
    )
    // Whichever of the pair was chosen rather than inherited gives way; if
    // both were, it is the later one.
    const giving =
      clash && clean[clash.id]
        ? clash.id
        : effective.find(
            (entry) =>
              clash &&
              entry.id !== clash.id &&
              clean[entry.id] &&
              sameBinding(entry.binding, clash.binding),
          )?.id
    if (!clash || !giving) {
      break
    }
    delete clean[giving]
  }
  return clean
}

type KnowledgePanelMode = 'hidden' | 'docked' | 'expanded'
type VisibleKnowledgePanelMode = Exclude<KnowledgePanelMode, 'hidden'>

type LocationSelection = {
  selection?: string
  file?: string
}

/** Panel state when no session is selected, so roots stay browsable. */
const sessionlessKnowledgeKey = 'knowledge:no-session'

function readSelectionFromLocation(): LocationSelection {
  if (typeof window === 'undefined') {
    return {}
  }
  const parameters = new URLSearchParams(window.location.search)
  const computerId = parameters.get('computer')
  const sessionId = parameters.get('session')
  const selection = computerId && sessionId
    ? sessionKey({ computerId, id: sessionId })
    : undefined
  return {
    selection,
    file: selection ? parameters.get('file') || undefined : undefined,
  }
}

function readVisibleKnowledgeMode(): VisibleKnowledgePanelMode {
  return readStoredOrder<unknown>(
    'agentic-remote:knowledge-open-mode',
    'docked',
  ) === 'expanded'
    ? 'expanded'
    : 'docked'
}

function readKnowledgeMode(file?: string): KnowledgePanelMode {
  const stored = readStoredOrder<unknown>(
    'agentic-remote:knowledge-mode',
    'hidden',
  )
  if (stored === 'docked' || stored === 'expanded') {
    return stored
  }
  return file ? readVisibleKnowledgeMode() : 'hidden'
}

function knowledgeFolderForFile(path: string) {
  const separator = path.lastIndexOf('/')
  return separator < 0 ? knowledgeRootPath : path.slice(0, separator) || knowledgeRootPath
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
  rootPath?: string
  path?: string
  file?: string
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
const keyboardFocusGapMs = 200

/** Drops the side questions of the sessions `gone` names. */
function withoutSideQuestions(gone: (key: string) => boolean) {
  return (current: Record<string, SideThread>) => {
    const kept = Object.entries(current).filter(([key]) => !gone(key))
    return kept.length === Object.keys(current).length ? current : Object.fromEntries(kept)
  }
}

const sideQuestionWebCommand: SlashCommand = {
  name: 'ask',
  aliases: ['btw'],
  description: 'Ask a side question without sending it to the session',
  inputHint: '<question>',
  allowDuringAgentExecution: true,
}

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
  sideQuestionWebCommand,
  {
    name: 'oracle',
    description: 'Ask Oracle in Ask mode; this session and its work are left alone',
    inputHint: '<question>',
    allowDuringAgentExecution: true,
  },
  ...sessionResourceCommands,
]

function sortSessions(sessions: ManagedSession[]): ManagedSession[] {
  // Stored observations must not inherit the provenance of a pending HTTP
  // result when a later snapshot reconciliation reuses them.
  return sessions.map((entry) =>
    sessionResponseStartedAt(entry) === undefined ? entry : { ...entry },
  ).sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )
}

function upsertSessionSnapshot(
  sessions: ManagedSession[],
  session: ManagedSession,
  lastEventAt = 0,
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
  const projected = projectSessionResponse(session, existing, lastEventAt)
  return sortSessions([
    projected,
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

interface SessionResourcesView {
  id: number
  ownerKey: string
  signature: string
  computerId: string
  provider: AgentProvider
  lifetime: number
  registrationId?: string
  tab: SessionResourceTab
  filter: string
}

function SessionResourcesDialog({
  view,
  session,
  lifetime,
  registrationId,
  online,
  supported,
  onClose,
}: {
  view?: SessionResourcesView
  session?: ManagedSession
  lifetime: number
  registrationId?: string
  online: boolean
  supported: boolean
  onClose: () => void
}) {
  const sameOwner = Boolean(view && session &&
    view.ownerKey === sessionKey(session) &&
    view.signature === sessionResourceOwner(session) &&
    view.provider === (session.provider || 'copilot') &&
    view.lifetime === lifetime && view.registrationId === registrationId)
  useEffect(() => {
    if (view && !sameOwner) onClose()
  }, [view, sameOwner, onClose])
  if (!view || !session || !sameOwner) return null
  return (
    <DialogFrame
      className="session-resources-dialog"
      eyebrow={session.title}
      key={view.id}
      onClose={onClose}
      title="Skills and MCP servers"
    >
      <SessionResources
        initialFilter={view.filter}
        initialTab={view.tab}
        key={view.id}
        online={online}
        session={session}
        supported={supported}
      />
    </DialogFrame>
  )
}

function workspaceAbsolutePath(cwd: string, relativePath: string): string {
  if (relativePath === '.') {
    return cwd
  }
  return `${cwd === '/' ? '' : cwd.replace(/\/+$/, '')}/${relativePath}`
}

function workspaceFilePrompt(root: string, path: string, ask: boolean): string {
  const absolutePath = workspaceAbsolutePath(root, path)
  return ask
    ? `Please review \`${absolutePath}\` and help me with it.`
    : `File: \`${absolutePath}\``
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
  const body = message.content ? (
    <ReactMarkdown
      components={mermaidComponents}
      remarkPlugins={[remarkGfm, remarkSafeBreaks]}
    >
      {message.content}
    </ReactMarkdown>
  ) : (
    <span className="typing-indicator">
      <i />
      <i />
      <i />
    </span>
  )
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
        <MessageTime value={message.createdAt} />
      </div>
      {message.role === 'user' ? (
        <SentMessageContent className="message__content" content={message.content}>
          {body}
        </SentMessageContent>
      ) : (
        <div className="message__content">{body}</div>
      )}
    </article>
  )
}, (previous, next) => sameMessage(previous.message, next.message))

/**
 * A message the terminal took that Copilot has not logged yet. Typed while it
 * is mid-response, Copilot holds it as pending and logs it only when the turn
 * reaches it, so it is shown here, sent, until the transcript has it.
 */
function PendingEchoMessage({ content }: { content: string }) {
  return (
    <article
      aria-label="Your message was sent to the terminal and is waiting for the agent"
      className="message message--user message--pending"
    >
      <div className="message__metadata">
        <span className="message__label">You</span>
        <span
          className="message__pending"
          title="Sent to the terminal. Copilot takes it in when the current step finishes."
        >
          Pending in terminal
        </span>
      </div>
      <SentMessageContent className="message__content message__content--plain" content={content}>
        {content}
      </SentMessageContent>
    </article>
  )
}

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
  pendingEchoes,
  currentToolId,
  showAll,
  onShowAll,
  computerId,
  sessionId,
  openActivityIds,
  onToggleActivity,
}: {
  messages: ChatMessage[]
  pendingEchoes: PendingEcho[]
  currentToolId?: string
  // Held by the conversation rather than here. A snapshot refresh installs
  // session summaries, which carry no messages on purpose, so this component
  // is unmounted and mounted again around every reconnect and every return to
  // the tab. State of its own would not survive that, and a transcript the
  // reader had opened would close under them.
  showAll: boolean
  onShowAll: () => void
  computerId: string
  sessionId: string
  // The tool rows the reader has opened, held by the conversation for the
  // same reason as `showAll`.
  openActivityIds?: readonly string[]
  onToggleActivity: (messageId: string) => void
}) {
  const cut = showAll
    ? 0
    : Math.max(0, allMessages.length - RENDERED_HISTORY)
  const tail = cut ? allMessages.slice(cut) : allMessages
  const openActivities = new Set(openActivityIds)
  // Some rows from before the cut have to come with it. An activity that is
  // still running is one: the separate activity indicator is suppressed while
  // one exists, so dropping the row leaves nothing on screen saying anything
  // is happening. One the reader has opened is another, or it vanishes from
  // under them. The parent of a visible child is a third, or the child is
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
      if (
        message.activityStatus === 'running' ||
        openActivities.has(message.id) ||
        wanted.has(message.id)
      ) {
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
  const activityRow = (message: ChatMessage, key?: string): ReactNode => (
    <ActivityRow
      computerId={computerId}
      current={message.id === currentToolId}
      expanded={openActivities.has(message.id)}
      key={key}
      message={message}
      onToggle={onToggleActivity}
      sessionId={sessionId}
    />
  )
  const renderActivity = (message: ChatMessage): ReactNode => {
    const children = activityChildren.get(message.id) || []
    if (children.length === 0) {
      return activityRow(message, message.id)
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
        {activityRow(message)}
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
  for (const echo of pendingEchoes) {
    rendered.push(
      <PendingEchoMessage content={echo.content} key={echo.id} />,
    )
  }
  return <div className="message-stack">{rendered}</div>
})

function EmptyConversation({ onCreate, onKnowledge }: {
  onCreate: () => void
  onKnowledge: () => void
}) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <MessageSquare size={26} />
      </span>
      <span className="empty-state__eyebrow">A workspace, wherever you are</span>
      <h2>Your agents. Your knowledge.</h2>
      <p>
        Start an agent on a trusted computer, or pick up your notes.
        Keep the conversation and its context side by side.
      </p>
      <div className="empty-state__actions">
        <button className="primary-button" onClick={onCreate} type="button">
          <Plus size={17} />
          New session
        </button>
        <button className="secondary-button" onClick={onKnowledge} type="button">
          <BookOpen size={17} />
          Open Knowledge
        </button>
      </div>
      <small>Copilot or Claude Agent. Files stay on their owning computer.</small>
    </div>
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

function AddKnowledgeRootDialog({
  computers,
  initialComputerId,
  initialPath,
  onClose,
  onCreate,
}: {
  computers: ComputerSummary[]
  initialComputerId?: string
  initialPath?: string
  onClose: () => void
  onCreate: (computerId: string, path: string) => Promise<void>
}) {
  const online = computers.filter((computer) => computer.online)
  const startingComputerId =
    online.find((computer) => computer.id === initialComputerId)?.id ||
    online[0]?.id ||
    ''
  const [computerId, setComputerId] = useState(startingComputerId)
  const [computerSelectionRevision, setComputerSelectionRevision] = useState(0)
  const [startingLocation] = useState({
    computerId: startingComputerId,
    path:
      startingComputerId === initialComputerId && initialPath
        ? initialPath
        : '~',
  })
  const [listing, setListing] = useState<DirectoryListing>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const directoryRequest = useRef(0)

  async function browse(path: string) {
    if (!computerId) {
      return
    }
    const request = ++directoryRequest.current
    setLoading(true)
    setError(undefined)
    try {
      const next = await listDirectories(computerId, path, 'all')
      if (request === directoryRequest.current) {
        setListing(next)
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

  useEffect(() => {
    let active = true
    const request = ++directoryRequest.current
    const path =
      computerSelectionRevision === 0 &&
      startingLocation.computerId === computerId
        ? startingLocation.path
        : '~'
    setLoading(true)
    setListing(undefined)
    setError(undefined)
    void listDirectories(computerId, path, 'all')
      .catch(async (caught: unknown) => {
        if (
          path === '~' ||
          !active ||
          request !== directoryRequest.current
        ) {
          throw caught
        }
        const fallback = await listDirectories(computerId, '~', 'all')
        if (active && request === directoryRequest.current) {
          const reason =
            caught instanceof Error ? caught.message : String(caught)
          setError(
            `Could not open ${path}: ${reason}. Showing the home folder instead.`,
          )
        }
        return fallback
      })
      .then((next) => {
        if (active && request === directoryRequest.current) {
          setListing(next)
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
  }, [computerId, computerSelectionRevision, startingLocation])

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
          onChange={(event) => {
            directoryRequest.current += 1
            setComputerSelectionRevision((current) => current + 1)
            setComputerId(event.target.value)
            setListing(undefined)
            setLoading(true)
            setError(undefined)
          }}
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
    ...mermaidComponents,
    // A long fence is drawn in pieces; its copy waits until it is all drawn.
    pre: drawnInParts(function DocumentFence({
      children,
      drawing,
      node: _node,
      ...rest
    }: { children?: ReactNode; drawing?: boolean; node?: unknown }) {
      const mermaid = mermaidFencedSource(children)
      if (mermaid !== undefined) return <MermaidDiagram source={mermaid} />
      const fence = codeFenceProps(children)
      if (!fence) return <pre {...rest}>{children}</pre>
      return (
        <MarkdownCodeBlock
          drawing={drawing}
          language={fence.className?.match(/\blanguage-([^\s]+)/)?.[1]}
          source={fencedSource(fence.children)}
        >
          <pre {...rest}>{children}</pre>
        </MarkdownCodeBlock>
      )
    }),
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

/** Children as a flat list, arrays and fragments opened: a long fence arrives in fragments, a piece each. */
function flatChildren(children: ReactNode): ReactNode[] {
  if (Array.isArray(children)) return children.flatMap((child) => flatChildren(child as ReactNode))
  if (isValidElement<{ children?: ReactNode }>(children) && children.type === Fragment) {
    return flatChildren(children.props.children)
  }
  return [children]
}

/** Reads the text of a fenced block, which arrives as its children. */
function fencedSource(children: ReactNode): string {
  return flatChildren(children).map((child) => (typeof child === 'string' ? child : '')).join('')
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
  code: drawnInParts(function MarkdownCode({
    children,
    className,
    // React Markdown hands every custom component its own syntax tree node,
    // and a document still being drawn says so; neither is a DOM attribute.
    node: _node,
    drawing: _drawing,
    ...rest
  }: {
    children?: ReactNode
    className?: string
    node?: unknown
    drawing?: boolean
  }) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  }),
}

/** The text of a fenced mermaid block, or nothing if that is not what it is. */
function codeFenceProps(children: ReactNode) {
  const fence = flatChildren(children).find((child) => isValidElement(child))
  return isValidElement<{ className?: string; children?: ReactNode }>(fence)
    ? fence.props
    : undefined
}

function mermaidFencedSource(children: ReactNode): string | undefined {
  const props = codeFenceProps(children)
  if (!props) return undefined
  if (!/\blanguage-mermaid\b/.test(props.className || '')) {
    return undefined
  }
  return fencedSource(props.children).trimEnd()
}

function missingDocumentFragment(fragment: string): string {
  return `Section "${fragment}" was not found in this document.`
}

function followMarkdownLink(
  event: ReactMouseEvent<HTMLDivElement>,
  documentPath: string,
  onOpen: (path: string, fragment?: string) => void,
  onError: (message: string | undefined) => void,
  onSection: (fragment: string) => void,
) {
  if (
    event.defaultPrevented || event.button !== 0 ||
    event.metaKey || event.ctrlKey || event.altKey || event.shiftKey
  ) {
    return
  }
  const link = event.target instanceof Element ? event.target.closest('a') : null
  const href = link?.getAttribute('href')
  if (!link || href == null || !event.currentTarget.contains(link)) {
    return
  }
  const target = resolveDocumentLink(documentPath, href)
  if (target.kind === 'external') {
    return
  }
  event.preventDefault()
  if (target.kind === 'invalid') {
    onError(target.error)
    return
  }
  onError(undefined)
  if (target.path === documentPath) onSection(target.fragment || '')
  else onOpen(target.path, target.fragment)
}

function knowledgeTreeVisible(node: HTMLElement): boolean {
  const panel = node.closest('.sidebar-knowledge')
  return node.isConnected && !node.closest('[hidden]') &&
    (!panel || getComputedStyle(panel).display !== 'none')
}

function KnowledgeReader({
  file,
  fragment,
  listing,
  loading,
  mode,
  root,
  onOpenFolder,
  onOpenFile,
  onLoadAsset,
  onAsk,
  askUnavailableReason,
  onShowFiles,
  onClose,
  oracle,
  sessionTitle,
}: {
  file?: WorkspaceFile
  fragment?: string
  listing?: WorkspaceListing
  loading: boolean
  mode: KnowledgePanelMode
  root: KnowledgeRoot
  onOpenFolder: (path: string) => void
  onOpenFile: (path: string, fragment?: string) => void
  onLoadAsset: MarkdownImageLoader
  onAsk: (file: WorkspaceFile) => void
  askUnavailableReason?: string
  onShowFiles: () => void
  onClose: () => void
  /** Oracle's button, for the phone header that replaces Knowledge's own. */
  oracle?: ReactNode
  sessionTitle?: string
}) {
  const [raw, setRaw] = useState(false)
  const [linkError, setLinkError] = useState<string>()
  const contentRef = useRef<HTMLDivElement>(null)
  const contentScrollTop = useRef(0)
  const previousFilePath = useRef(file?.path)
  const components = useMemo(
    () => markdownComponentsFor(file?.path || '.', onLoadAsset),
    [file?.path, onLoadAsset],
  )
  const markdownDocument = useMarkdownDocument(
    file?.kind === 'markdown' && !raw ? file.content || '' : undefined,
    components,
  )
  // A Markdown preview is drawn in the background; until then its anchors,
  // headings, and full height are not on the page.
  const documentReady = markdownDocument.ready || !(file?.kind === 'markdown' && !raw)
  // Sections are looked for in a Markdown file's drawn Preview.
  const previewReady = file?.kind !== 'markdown' || (!raw && markdownDocument.ready)

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) {
      previousFilePath.current = file?.path
      return
    }
    if (previousFilePath.current !== file?.path) {
      contentScrollTop.current = 0
    } else if (mode !== 'hidden' && documentReady) {
      if (contentScrollTop.current === 0) {
        contentScrollTop.current = content.scrollTop
      }
      content.scrollTop = contentScrollTop.current
    }
    previousFilePath.current = file?.path
  }, [file, mode, documentReady])

  // Opening a file or a section is a navigation. The top is there at once. A
  // section waits for the drawn Preview, through a switch to Source and back,
  // so one further down is never reported missing. A reader who scrolls the
  // Preview before then keeps their place.
  const navigation = useRef<{ handled: boolean; fragment?: string }>({ handled: true })
  // Taken before the browser handles more input, so a reader's first scroll counts.
  useLayoutEffect(() => {
    navigation.current = { handled: false, fragment }
  }, [file?.path, fragment])
  useEffect(() => {
    const pending = navigation.current
    if (pending.handled || (pending.fragment !== undefined && !previewReady)) return undefined
    const frame = requestAnimationFrame(() => {
      pending.handled = true
      if (pending.fragment !== undefined) {
        if (!scrollToDocumentFragment(contentRef.current, pending.fragment)) {
          setLinkError(missingDocumentFragment(pending.fragment))
        }
      } else if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [file?.path, fragment, previewReady])
  // A section of this document: shown now if it is drawn, else once it is.
  const showSection = (section: string) => {
    navigation.current.handled = true
    if (scrollToDocumentFragment(contentRef.current, section)) return
    if (previewReady) setLinkError(missingDocumentFragment(section))
    else navigation.current = { handled: false, fragment: section }
  }
  const keepReaderPlace = (event: SyntheticEvent<HTMLDivElement>) => {
    if (documentReady || !isReaderScroll(event)) return
    navigation.current.handled = true
    // Nor is a remembered offset restored over the reader's own.
    contentScrollTop.current = 0
  }

  const outline = markdownDocument.outline
  const crumbs = breadcrumbSegments(file?.path ?? listing?.path ?? '.', root.name)

  if (!file) {
    return (
      <div className="knowledge-reader knowledge-reader--empty">
        <BookOpen size={26} />
        <h3>{loading ? 'Opening your knowledge' : 'Choose a document'}</h3>
        <p>
          {loading
            ? 'Loading...'
            : 'Open the file explorer to choose a document. Your conversation and draft stay in place.'}
        </p>
        {!loading ? (
          <button className="primary-button" onClick={onShowFiles} type="button">
            <FolderOpen aria-hidden="true" size={16} />
            Browse files
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="knowledge-reader">
      <div className="workspace-preview__header">
        <button
          aria-label="Back to files"
          className="icon-button knowledge-reader__back"
          onClick={onShowFiles}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={19} />
        </button>
        <WorkspaceFileIcon kind={file.kind} size={18} />
        <div>
          <strong title={`${root.computerName}: ${workspaceAbsolutePath(root.path, file.path)}`}>
            {file.name}
          </strong>
          {sessionTitle ? <small className="knowledge-reader__session">{sessionTitle}</small> : null}
        </div>
        <DocumentViewControls
          markdown={file.kind === 'markdown'}
          previewable={file.kind === 'markdown' || file.kind === 'html'}
          onRawChange={setRaw}
          onSelectHeading={(heading) => {
            if (!scrollToDocumentHeading(contentRef.current, heading.index)) {
              setLinkError(missingDocumentFragment(heading.id))
            }
          }}
          outline={outline}
          raw={raw}
        />
        {oracle}
        <button
          aria-label="Return to conversation"
          className="icon-button knowledge-reader__close"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <nav
        aria-label="Knowledge breadcrumb"
        className="workspace-crumbs knowledge-reader__crumbs"
      >
        {crumbs.map((crumb, index) => (
          <span
            className={index === crumbs.length - 1 ? 'knowledge-reader__file-crumb' : undefined}
            key={crumb.path}
          >
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
      {linkError ? <p className="form-error" role="alert">{linkError}</p> : null}
      <div
        className={`workspace-preview__content${
          file.kind === 'markdown' && !raw ? ' markdown-body' : ''
        }${
          file.kind === 'html' && !raw
            ? ' workspace-preview__content--html'
            : ''
        }`}
        onClick={(event) =>
          followMarkdownLink(event, file.path, onOpenFile, setLinkError, showSection)
        }
        onKeyDown={keepReaderPlace}
        onPointerDown={keepReaderPlace}
        onScroll={(event) => {
          // While a document is still being drawn its height is short, and
          // the clamped position must not replace the reader's place.
          if (documentReady) {
            contentScrollTop.current = event.currentTarget.scrollTop
          }
        }}
        onTouchMove={keepReaderPlace}
        onWheel={keepReaderPlace}
        ref={contentRef}
      >
        {file.kind === 'pdf' ? (
          <PdfViewer file={file} />
        ) : file.kind === 'image' ? (
          <WorkspaceImage file={file} />
        ) : file.kind === 'html' && !raw ? (
          <HtmlPreview name={file.name} source={file.content || ''} />
        ) : file.kind === 'markdown' && !raw ? (
          markdownDocument.content
        ) : (
          <pre>{file.content}</pre>
        )}
      </div>
      <div className="knowledge-reader__context">
        <div>
          <span className="knowledge-reader__read-only">Read-only on {root.computerName}</span>
          <p className="knowledge-reader__hint" id="knowledge-ask-hint">
            {askUnavailableReason || 'Adds to your draft. You choose when to send.'}
          </p>
        </div>
        <button
          aria-describedby="knowledge-ask-hint"
          aria-label="Ask agent about file"
          disabled={loading || Boolean(askUnavailableReason)}
          onClick={() => onAsk(file)}
          title={askUnavailableReason || 'Add a file reference to your draft without sending'}
          type="button"
        >
          <MessageSquare size={14} />
          Add to draft
        </button>
      </div>
    </div>
  )
}

function WorkspaceDialog({
  initialKind,
  initialPath,
  insertUnavailableReason,
  session,
  onClose,
  onInsert,
  onMoved,
}: {
  initialKind?: 'file' | 'folder'
  initialPath?: string
  insertUnavailableReason?: string
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
  const documentHistoryRef = useRef<NavigationEntry[]>([])
  const documentIndexRef = useRef(-1)
  const pendingScrollRef = useRef<number | undefined>(undefined)
  const pendingFragmentRef = useRef<string | undefined>(undefined)

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
    async (
      path: string,
      restoreScroll?: number,
      fragment?: string,
    ): Promise<boolean> => {
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
          pendingFragmentRef.current = fragment
          setFile(nextFile)
          setRaw(false)
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

  const markdownComponents = useMemo(
    () =>
      markdownComponentsFor(file?.path || '.', (assetPath) =>
        readWorkspaceFile(session.computerId, session.id, assetPath),
      ),
    [file?.path, session.computerId, session.id],
  )
  const markdownDocument = useMarkdownDocument(
    file?.kind === 'markdown' && !raw ? file.content || '' : undefined,
    markdownComponents,
  )
  // A Markdown preview is drawn in the background; until then its anchors,
  // headings, and full height are not on the page.
  const documentReady = markdownDocument.ready || !(file?.kind === 'markdown' && !raw)
  // Sections and offsets are looked for in a Markdown file's drawn Preview.
  const previewReady = file?.kind !== 'markdown' || (!raw && markdownDocument.ready)

  // What a newly opened document should show is taken when it arrives. Its
  // top is there at once. A remembered offset or a section waits for the drawn
  // Preview, through a switch to Source and back, unless the reader scrolls
  // the Preview before then.
  const arrival = useRef<{ handled: boolean; top: number; fragment?: string }>({ handled: true, top: 0 })
  // Taken before the browser handles more input, so a reader's first scroll counts.
  useLayoutEffect(() => {
    arrival.current = { handled: false, top: pendingScrollRef.current ?? 0, fragment: pendingFragmentRef.current }
    pendingScrollRef.current = undefined
    pendingFragmentRef.current = undefined
  }, [file?.path])
  useEffect(() => {
    const pending = arrival.current
    if (pending.handled || ((pending.fragment !== undefined || pending.top > 0) && !previewReady)) {
      return undefined
    }
    const frame = requestAnimationFrame(() => {
      pending.handled = true
      const element = previewContentRef.current
      if (pending.fragment !== undefined) {
        if (!scrollToDocumentFragment(element, pending.fragment)) {
          setError(missingDocumentFragment(pending.fragment))
        }
      } else if (element) {
        element.scrollTop = pending.top
      }
    })
    return () => cancelAnimationFrame(frame)
    // Toggling Rendered/Raw is not navigation: it only lets an arrival still
    // waiting for the Preview complete, and never throws the reader to the top.
  }, [file?.path, previewReady])
  // A section of this document: shown now if it is drawn, else once it is.
  const showSection = (section: string) => {
    arrival.current.handled = true
    if (scrollToDocumentFragment(previewContentRef.current, section)) return
    if (previewReady) setError(missingDocumentFragment(section))
    else arrival.current = { handled: false, top: 0, fragment: section }
  }
  const keepReaderPlace = (event: SyntheticEvent<HTMLDivElement>) => {
    if (!documentReady && isReaderScroll(event)) arrival.current.handled = true
  }

  const outline = markdownDocument.outline

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
            (listing ? orderedWorkspaceEntries(listing.entries) : []).map((entry) => (
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
                ) : (
                  <WorkspaceFileIcon kind={entry.kind} size={15} />
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
              <p>Select an HTML, Markdown, text, image, or PDF file.</p>
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
                <WorkspaceFileIcon kind={file.kind} size={18} />
                <div>
                  <strong title={file.name}>{file.name}</strong>
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
                <DocumentViewControls
                  key={file.path}
                  markdown={file.kind === 'markdown'}
                  previewable={file.kind === 'markdown' || file.kind === 'html'}
                  onRawChange={setRaw}
                  onSelectHeading={(heading) => {
                    if (!scrollToDocumentHeading(previewContentRef.current, heading.index)) {
                      setError(missingDocumentFragment(heading.id))
                    }
                  }}
                  outline={outline}
                  raw={raw}
                />
              </div>
              <div className="workspace-preview__actions">
                <button
                  aria-describedby={insertUnavailableReason ? 'workspace-insert-hint' : undefined}
                  disabled={loading || Boolean(insertUnavailableReason)}
                  onClick={() => onInsert(file, false)}
                  type="button"
                >
                  Insert path
                </button>
                <button
                  aria-describedby={insertUnavailableReason ? 'workspace-insert-hint' : undefined}
                  disabled={loading || Boolean(insertUnavailableReason)}
                  onClick={() => onInsert(file, true)}
                  type="button"
                >
                  Ask agent about file
                </button>
              </div>
              {insertUnavailableReason ? (
                <p className="workspace-preview__hint" id="workspace-insert-hint" role="status">
                  {insertUnavailableReason}
                </p>
              ) : null}
              <div
                className={`workspace-preview__content${
                  file.kind === 'markdown' && !raw ? ' markdown-body' : ''
                }${
                  file.kind === 'html' && !raw
                    ? ' workspace-preview__content--html'
                    : ''
                }`}
                onClick={(event) =>
                  followMarkdownLink(
                    event,
                    file.path,
                    (path, fragment) => void openFile(path, undefined, fragment),
                    setError,
                    showSection,
                  )
                }
                onKeyDown={keepReaderPlace}
                onPointerDown={keepReaderPlace}
                onScroll={() => {
                  // A document still being drawn is short; its clamped
                  // offset must not replace the reader's place.
                  if (documentReady) rememberCurrentScroll()
                }}
                onTouchMove={keepReaderPlace}
                onWheel={keepReaderPlace}
                ref={previewContentRef}
              >
                {file.kind === 'pdf' ? (
                  <PdfViewer file={file} />
                ) : file.kind === 'image' ? (
                  <WorkspaceImage file={file} />
                ) : file.kind === 'html' && !raw ? (
                  <HtmlPreview name={file.name} source={file.content || ''} />
                ) : file.kind === 'markdown' && !raw ? (
                  markdownDocument.content
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

/**
 * The session to show when the selection names none that exists: the first
 * listed, passing over any whose close is in flight, or none when every one is.
 */
function fallbackSessionKey(
  sessions: readonly ManagedSession[],
  closing: ReadonlySet<string>,
): string | undefined {
  const fallback = sessions.find((session) => !closing.has(sessionKey(session)))
  return fallback ? sessionKey(fallback) : undefined
}

// After the page returns (unlock, wake), requests can fail before the network or
// tunnel is back. Such failures only mark the data stale and retry; an error is
// shown only if the hub stays unreachable this long after the page returned.
const HUB_UNREACHABLE_GRACE_MS = 30_000
const HUB_UNREACHABLE_MESSAGE = "Can't reach the hub. Retrying automatically…"
const HUB_RECONNECTING_MESSAGE = 'reconnecting to the hub'

function AppWorkspace({ settingsClient }: { settingsClient: SettingsProfileClient }) {
  const desktopRail = usePreviewFeature('desktopRail')
  const notificationPanel = usePreviewFeature('notificationPanel')
  const schedulerView = usePreviewFeature('schedulerView')
  const hostMonitorView = usePreviewFeature('hostMonitorView')
  const notifications = useNotifications(notificationPanel)
  const [scheduleLink, setScheduleLink] = useState(() => readScheduleLink(window.location.href))
  const [shellView, setShellView] = useState<string>()
  const initialScheduleLink = useRef(scheduleLink)
  useEffect(() => {
    if (!schedulerView || !initialScheduleLink.current) return
    setScheduleLink(initialScheduleLink.current)
    setShellView('scheduler')
    initialScheduleLink.current = undefined
  }, [schedulerView])
  const composerRefresh = usePreviewFeature('composerRefresh')
  const initialLocationSelection = useRef(readSelectionFromLocation())
  const initialSessionNavigation = useRef(readStoredSessionNavigation())
  const [sessions, setSessions] = useState<ManagedSession[]>([])
  const [computers, setComputers] = useState<ComputerSummary[]>([])
  const managerListenersRef = useRef(new Set<(event: ManagerEvent) => void>())
  const [scheduleProposalEpoch, setScheduleProposalEpoch] = useState(0)
  const authoritativeRefreshRef = useRef<() => Promise<void>>(async () => undefined)
  const authoritativeRefreshGeneration = useRef(0)
  const [refreshState, setRefreshState] = useState<'fresh' | 'refreshing' | 'stale'>('fresh')
  const [refreshMessage, setRefreshMessage] = useState<string>()
  const [managedSessionKeys, setManagedSessionKeys] = useState<ReadonlySet<string>>(() => new Set())
  const subscribeManager = useCallback((listener: (event: ManagerEvent) => void) => {
    managerListenersRef.current.add(listener)
    return () => {
      managerListenersRef.current.delete(listener)
    }
  }, [])
  // A notification about Oracle opens the app at its panel.
  const [oracleOpen, setOracleOpen] = useState(
    () => new URLSearchParams(window.location.search).get('oracle') === 'open',
  )
  const [oraclePlacement, setOraclePlacement] = useState<OraclePlacement>(
    readOraclePlacement,
  )
  const [oracleFocusRequest, setOracleFocusRequest] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const desktopLayout = viewportWidth > 960
  // The open Oracle panel's width; the timeline dock moves beside it.
  const [oraclePanelWidth, setOraclePanelWidth] = useState<number>()
  const [oracleIndicator, setOracleIndicator] = useState<OracleIndicator>({
    available: false,
    status: 'idle',
    unread: false,
    queued: 0,
  })
  const oracleControlRef = useRef<OracleControl | undefined>(undefined)
  const toggleOracle = useCallback(() => setOracleOpen((current) => !current), [])
  const changeOraclePlacement = useCallback((next: OraclePlacement) => {
    setOraclePlacement(next)
    writeStored(oraclePlacementStorageKey, next)
  }, [])
  useEffect(() => {
    const measureDesktop = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', measureDesktop)
    return () => window.removeEventListener('resize', measureDesktop)
  }, [])
  const changeManagedSessions = useCallback((keys: string[]) => {
    setManagedSessionKeys(new Set(keys))
  }, [])
  const [backgroundTaskSnapshots, setBackgroundTaskSnapshots] = useState<
    Record<string, BackgroundTaskSnapshot>
  >({})
  const [selectedKey, setSelectedKey] = useState<string>()
  const queuedDispatchInFlight = useRef(new Map<string, string>())
  const composerInitialReadFailure = useRef<string | undefined>(undefined)
  const initialComposerStorage = useRef<ComposerStorageSnapshot | undefined>(
    undefined,
  )
  const [composerDrafts, setComposerDrafts] = useState<ComposerDrafts>(() => {
    if (initialComposerStorage.current) {
      return readComposerDrafts(initialComposerStorage.current)
    }
    try {
      const snapshot = readComposerStorageSnapshot()
      initialComposerStorage.current = snapshot
      return readComposerDrafts(snapshot)
    } catch (error) {
      composerInitialReadFailure.current = composerReadFailureMessage(error)
      return {}
    }
  })
  const [composerStorageError, setComposerStorageError] =
    useState<string | undefined>(composerInitialReadFailure.current)
  const initialComposerDraftText = useRef<Record<string, string> | undefined>(
    undefined,
  )
  if (!initialComposerDraftText.current) {
    initialComposerDraftText.current = Object.fromEntries(
      Object.entries(composerDrafts)
        .filter(([, draft]) => Boolean(draft.text))
        .map(([key, draft]) => [key, draft.text]),
    )
  }
  const composerDraftsRef = useRef(composerDrafts)
  const editingQueuedPrompts = useMemo(() => queuedEditOwners(composerDrafts), [composerDrafts])
  const unconfirmedQueuedPrompts = useMemo(() => queuedEditOwners(composerDrafts, true), [composerDrafts])
  const composerAcceptanceReceipts = useRef(
    initialComposerStorage.current?.receipts || [],
  )
  const composerMounted = useRef(true)
  const composerHistoryRef = useRef<Record<string, ComposerHistoryState>>({})
  const composerEditRef = useRef<
    | {
        key: string
        before: string
        start: number
        end: number
        inputType: string
      }
    | undefined
  >(undefined)
  const [renameOpen, setRenameOpen] = useState(false)
  const [runtimeOpen, setRuntimeOpen] = useState(false)
  // Side questions belong to the session they were asked about and live only
  // as long as this page: they are never part of the conversation.
  // Per session, so a question keeps running while another session is open
  // and its answer is waiting on return. Held for the life of the page only.
  const [sideQuestions, setSideQuestions] = useState<Record<string, SideThread>>({})
  const sideQuestionIdRef = useRef(0)
  const [resourcesView, setResourcesView] = useState<SessionResourcesView>()
  const resourcesViewId = useRef(0)
  const closeSessionResources = useCallback(() => setResourcesView(undefined), [])
  const [cwdOpen, setCwdOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [workspaceInitialPath, setWorkspaceInitialPath] = useState<string>()
  const [workspaceInitialKind, setWorkspaceInitialKind] = useState<
    'file' | 'folder'
  >()
  // Reading is a workspace mode: it survives a session switch so a document
  // being read full width is not dismissed by moving to another session.
  const [knowledgeMode, setKnowledgeModeState] = useState<KnowledgePanelMode>(
    () => readKnowledgeMode(initialLocationSelection.current.file),
  )
  const [locationKnowledgeTarget, setLocationKnowledgeTarget] = useState<
    { key: string; file: string } | undefined
  >(() => {
    const target = initialLocationSelection.current
    return target.selection && target.file
      ? { key: target.selection, file: target.file }
      : undefined
  })
  const [knowledgePositions, setKnowledgePositions] = useState<
    Record<string, KnowledgePosition>
  >(() => readStoredOrder('agentic-remote:knowledge-session-positions', {}))
  // Roots are browsable without a session, so reading position is kept under
  // a reserved key rather than being unreachable.
  const knowledgePanelKey = selectedKey || sessionlessKnowledgeKey
  const [roots, setRootsState] = useState<KnowledgeRoot[]>([])
  const [knowledgeRootsLoaded, setKnowledgeRootsLoaded] = useState(false)
  const [activeRootId, setActiveRootId] = useState<string | undefined>(() =>
    readStoredOrder<string | undefined>(
      'agentic-remote:knowledge-root',
      undefined,
    ),
  )
  // Folders are cached per path and loaded only when expanded, so the tree can
  // show structure without refetching a branch every time it reopens.
  const [knowledgeFolders, setKnowledgeFolders] = useState<KnowledgeFolders>({})
  const [knowledgeExpansion, setKnowledgeExpansion] = useState<{
    scope?: string
    paths: string[]
  }>({ paths: [] })
  const expandedKnowledge = knowledgeExpansion.paths
  const setExpandedKnowledge = useCallback((
    update: string[] | ((current: string[]) => string[]),
  ) => {
    setKnowledgeExpansion((current) => ({
      ...current,
      paths:
        typeof update === 'function'
          ? update(current.paths)
          : update,
    }))
  }, [])
  const [knowledgePath, setKnowledgePath] = useState(knowledgeRootPath)
  const [knowledgeFile, setKnowledgeFile] = useState<WorkspaceFile>()
  const [knowledgeFragment, setKnowledgeFragment] = useState<string>()
  const knowledgeFileStateRef = useRef(knowledgeFile)
  knowledgeFileStateRef.current = knowledgeFile
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const knowledgeLoadingRef = useRef(knowledgeLoading)
  knowledgeLoadingRef.current = knowledgeLoading
  const [addRootOpen, setAddRootOpen] = useState(false)
  const [rootPicker, setRootPicker] = useState<{
    id: number
    ownerKey?: string
    session?: KnowledgeRootSession
    revision?: number
  }>()
  const [rootChoice, setRootChoice] = useState<KnowledgeRootChoice>()
  const rootPickerSequence = useRef(0)
  const [rootPickerError, setRootPickerError] = useState<{ id: number; message: string }>()
  const [rootPickerSaving, setRootPickerSaving] = useState(false)
  const rootPickerSavingRef = useRef(false)
  const rootCreationOwner = useRef<{ key?: string; revision?: number } | undefined>(undefined)
  const [rootRemovalTarget, setRootRemovalTarget] = useState<KnowledgeRoot>()
  const [removingRoot, setRemovingRoot] = useState(false)
  const [rootRemovalError, setRootRemovalError] = useState<string>()
  const appliedSessionRootScope = useRef<string | undefined>(undefined)
  // Read from the socket handler, which is bound once and would otherwise
  // close over whichever roots existed when it was bound.
  const rootsRef = useRef<KnowledgeRoot[]>([])
  const setRoots = useCallback((
    update: KnowledgeRoot[] | ((current: KnowledgeRoot[]) => KnowledgeRoot[]),
  ) => {
    const next = typeof update === 'function' ? update(rootsRef.current) : update
    rootsRef.current = next
    setRootsState(next)
  }, [])
  const activeRootIdRef = useRef<string | undefined>(undefined)
  // Computers this browser has been told to forget. Held so an answer still
  // on its way can be discarded rather than restoring what was removed.
  const forgottenComputers = useRef(new Set<string>())
  const knowledgeComputerLifetimes = useRef(new Map<string, number>())
  const removedKnowledgeRoots = useRef(new Map<string, number>())
  const knowledgeRootRemovalSequence = useRef(0)
  const markKnowledgeRootRemoved = useCallback((rootId: string) => {
    removedKnowledgeRoots.current.set(rootId, ++knowledgeRootRemovalSequence.current)
  }, [])
  const knowledgeCatalogRequest = useRef(0)
  useEffect(() => {
    activeRootIdRef.current = activeRootId
  }, [activeRootId])
  const [addRootInitialLocation, setAddRootInitialLocation] = useState<{
    computerId: string
    path: string
  }>()
  const promptForEmptyKnowledgeRoot = useRef(false)
  // A single generation for every asynchronous knowledge operation. Anything
  // that changes what the panel should show bumps it once; every loader
  // captures it and checks it before writing. Three separate counters could
  // be bumped in different combinations, and each wrong combination was a
  // race.
  const knowledgeRequest = useRef(0)
  // Background file refreshes do not change the requested view. They still
  // need ordering of their own so a mode toggle cannot cancel navigation or
  // let an older refresh replace a newer one.
  const knowledgeFileRefreshRequest = useRef(0)
  // A view generation can contain several refreshes of the same branch.
  // Only the latest request owns its payload and loading indicator.
  const knowledgeFolderRequestId = useRef(0)
  const knowledgeFolderLoads = useRef(new Map<string, number>())
  const knowledgeRestoredKey = useRef<string>(undefined)
  const knowledgeOwnerKey = useRef<string>(undefined)
  // The session whose content the panel is actually showing.
  const knowledgeViewOwnerKey = useRef<string>(undefined)
  const knowledgeOpenModeRef = useRef<VisibleKnowledgePanelMode>(
    knowledgeMode === 'hidden' ? readVisibleKnowledgeMode() : knowledgeMode,
  )
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
  // Which tool rows the reader has opened, by session, and stable per session
  // for the same reason as above.
  const [openActivities, setOpenActivities] = useState<
    Record<string, readonly string[]>
  >({})
  const toggleSelectedActivity = useCallback((messageId: string) => {
    if (!selectedKey) {
      return
    }
    setOpenActivities((current) => {
      const open = current[selectedKey] ?? []
      return {
        ...current,
        [selectedKey]: open.includes(messageId)
          ? open.filter((id) => id !== messageId)
          : [...open, messageId],
      }
    })
  }, [selectedKey])
  // The socket is bound once, so it reaches the restore through a ref.
  const restoreFailedPromptRef = useRef<
    (key: string, content: string, failedAt?: string) => void
  >(() => {})
  // Which failure each session has already had handed back, and when the
  // reader last submitted, so a stale one is not put back on top of it.
  const handledFailures = useRef(new Map<string, string>())
  const submissionsInFlight = useRef(new Set<string>())
  // Keep the session row through the response cleanup. The in-flight marker
  // is cleared as soon as the composer is restored, but a refresh can have
  // omitted the row before that cleanup runs.
  const submissionAnchors = useRef(new Set<string>())
  // Failures that could not be shown because newer text was in the way, and
  // the stamp of the one a session's composer is currently holding.
  const unshownFailures = useRef(
    new Map<string, { content: string; stamp: string }>(),
  )
  const restoredFailures = useRef(new Map<string, string>())
  // Which draft was put in the composer by a recovery, and for which failure.
  // Survives a reload beside the draft itself, because after one the text is
  // all that is left and identical text is not proof of where it came from.
  const restoredDraftStamps = useRef<Record<string, string>>(
    readStoredOrder('agentic-remote:composer-draft-failures', {}),
  )
  // The exact text that was handed back, so an untouched recovery can be told
  // from one the reader has since edited.
  // Which uncertain failure the reader has already been warned about, so the
  // warning is repeated when the text comes back but not on every render.
  const warnedUncertain = useRef(new Map<string, string>())
  const restoredDraftContents = useRef<Record<string, string>>(
    readStoredOrder('agentic-remote:composer-draft-recovered', {}),
  )
  const composerRecoveryStorageDirty = useRef(false)
  const failedSubmissionBindings = useRef<Record<string, string>>(
    readStoredOrder('agentic-remote:composer-submission-failures', {}),
  )
  const acceptedSubmissionTokens = useRef(new Map<string, Set<string>>())
  // The history listener is bound once, so it reads the resolver through a ref
  // rather than closing over the first one.
  const followReplacementsRef = useRef<(key: string) => string>((key) => key)
  // Which refresh is the newest, so a slower one cannot land after it.
  // Ordered by when each was asked for, not by when it happened to answer: a
  // request that stalled on a paired node was otherwise treated as the newer
  // one simply because it finished last.
  const snapshotGeneration = useRef(0)
  const snapshotApplied = useRef(0)
  const computerRecordsSnapshotApplied = useRef(0)
  // The newest refresh that actually reached each computer.
  const computerSnapshotApplied = useRef(new Map<string, number>())
  // Computers whose sessions the most recent list actually reached. A computer
  // that answered before and cannot be reached now is saying nothing about a
  // session announced since, so absence is only news while it is in here.
  const authoritativeNow = useRef(new Map<string, number>())
  // The newest listing that has been applied at all. A computer is speaking
  // for itself only if it answered that one.
  const latestListing = useRef(0)
  // Sessions somebody said outright are gone, as opposed to ones a list did
  // not mention. Absence and removal are different things.
  const removedSessions = useRef(new Set<string>())
  // Tombstones that exist only because their computer was unpaired; pairing it again lifts them.
  const unpairedTombstones = useRef(new Map<string, Set<string>>())
  // Of those, the ones closed to reopen: coming back lifts their removal.
  const closedSessionKeys = useRef(new Set<string>())
  // One reorder at a time for a session, so a second drag does not take its
  // snapshot from a queue the server has not accepted yet.
  const reorderInFlight = useRef(new Map<string, Promise<void>>())
  const loadKnowledgeFolderRef = useRef<
    (rootId: string, path: string, generation?: number, throwOnError?: boolean) =>
      Promise<WorkspaceListing | undefined>
  >(async () => undefined)
  const selectKnowledgeRootRef = useRef<
    (rootId: string, fromRestore?: boolean) =>
      Promise<KnowledgeFolders | undefined>
  >(async () => undefined)
  // Replacements announced by a removal but not yet delivered by their upsert.
  // The fallback below must not treat one as a missing session and select
  // something unrelated in the gap.
  const pendingReplacements = useRef(new Set<string>())
  const pendingAttachmentReplacements = useRef(
    new Map<string, Set<string>>(),
  )
  // Lineage is carried in every snapshot, so a replacement is claimed once
  // rather than again on each refresh.
  const adoptedReplacements = useRef(new Set<string>())
  // What each claimed ancestor became, so a reader sitting on one can be taken
  // to it rather than to whatever happens to sort first.
  const replacedInto = useRef(new Map<string, string>())
  // The generation a root listing was last requested under, so a load
  // abandoned by a newer generation is retried instead of waited on.
  const knowledgeRootLoadGeneration = useRef(-1)
  // Captured before the first synchronisation, so a direct session link is not
  // erased by the address being rewritten while sessions are still loading.
  const initialUrlSelection = useRef(initialLocationSelection.current.selection)
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
    (position: KnowledgePosition, key: string, sameViewOwner: boolean) => void
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
  const openedFromLink = useRef(
    initialLocationSelection.current.selection !== undefined,
  )
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
  const commandCatalogEpoch = useRef(0)
  // Which session the list above belongs to. It is fetched per session, so
  // until the new one has arrived the old one is still on hand -- and reading
  // it as though it described the session now open let a command only the
  // previous provider has be saved into this one's queue.
  const [commandsKey, setCommandsKey] = useState<string>()
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sessionLoadError, setSessionLoadError] = useState<string>()
  const [sessionLoadAttempt, setSessionLoadAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  // Messages the terminal took that its CLI has not logged yet, per session.
  const [pendingEchoes, setPendingEchoes] = useState<Record<string, PendingEcho[]>>({})
  const [cancelling, setCancelling] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [composerAttachments, setComposerAttachments] = useState<
    Record<string, ComposerAttachment[]>
  >(() => readComposerAttachments(composerDrafts))
  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [permissionBusy, setPermissionBusy] = useState(false)
  const [userInputBusy, setUserInputBusy] = useState(false)
  // The waiting message the composer is currently rewriting, and the session
  // it belongs to. Held together because the composer follows the selection: a
  // bare id left the next session in edit mode, and Enter, Send and Escape all
  // acted on a message that was not in front of the reader.
  const [queueActionId, setQueueActionId] = useState<string>()
  // Keyed by session: the owning computer serializes lifecycle work per
  // session, so closing or suspending one never has to hold back another. The
  // refs answer a second click before React has rendered the first one.
  const [closingSessions, setClosingSessions] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const closingSessionsRef = useRef(new Set<string>())
  // The session whose Close is being confirmed.
  const [closeRequest, setCloseRequest] = useState<ManagedSession>()
  const recentlyClosed = useRecentlyClosed()
  const recentlyClosedRef = useRef(recentlyClosed)
  recentlyClosedRef.current = recentlyClosed
  const [recentlyClosedOpen, setRecentlyClosedOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [suspendingSessions, setSuspendingSessions] = useState<
    ReadonlySet<string>
  >(() => new Set())
  const suspendingSessionsRef = useRef(new Set<string>())
  const [retentionOpen, setRetentionOpen] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [movingToTmux, setMovingToTmux] = useState(false)
  const [movingSessionFolder, setMovingSessionFolder] = useState(false)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarView, setSidebarView] = useState<'sessions' | 'knowledge'>('sessions')
  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth)
  const [resizingSidebar, setResizingSidebar] = useState(false)
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [pendingSessionCreations, setPendingSessionCreations] = useState<
    PendingSessionCreation[]
  >([])
  const [sessionCreationError, setSessionCreationError] = useState<string>()
  const [computersOpen, setComputersOpen] = useState(false)
  const settingsNavigation = usePreviewFeature('settingsNavigation')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigationWidth = sidebarWidth + (desktopRail && desktopLayout ? 64 : 0)
  const oracleDockReservedLeft =
    navigationWidth + (knowledgeMode === 'docked' ? READER_WIDTH_MIN : 0)
  const oracleDockAvailable =
    desktopLayout &&
    viewportWidth - oracleDockReservedLeft >=
      ORACLE_PANEL_WIDTH_MIN + ORACLE_CONVERSATION_WIDTH_MIN
  const effectiveOraclePlacement =
    oraclePlacement === 'docked' && oracleDockAvailable
      ? 'docked'
      : 'overlay'
  const previousEffectiveOraclePlacement = useRef(effectiveOraclePlacement)
  const responsiveOracleFocusPending = useRef(false)
  useEffect(() => {
    const previousPlacement = previousEffectiveOraclePlacement.current
    previousEffectiveOraclePlacement.current = effectiveOraclePlacement
    if (
      previousPlacement === 'docked' &&
      effectiveOraclePlacement === 'overlay' &&
      oraclePlacement === 'docked' &&
      oracleOpen
    ) {
      responsiveOracleFocusPending.current = true
    }
    if (!oracleOpen || effectiveOraclePlacement === 'docked') {
      responsiveOracleFocusPending.current = false
      return
    }
    if (
      document.getElementById('oracle-panel')?.contains(document.activeElement)
    ) {
      responsiveOracleFocusPending.current = false
      return
    }
    const modalOwnsFocus = Boolean(
      document.querySelector(
        '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]',
      ),
    )
    if (
      responsiveOracleFocusPending.current &&
      !settingsOpen &&
      !modalOwnsFocus
    ) {
      responsiveOracleFocusPending.current = false
      setOracleFocusRequest((request) => request + 1)
    }
  }, [effectiveOraclePlacement, oracleOpen, oraclePlacement, settingsOpen])
  // Where App settings opens: Oracle's model when opened from Oracle's panel.
  const [settingsSection, setSettingsSection] = useState<string>()
  const [statuslineOpen, setStatuslineOpen] = useState(false)
  const [backgroundTasksOpen, setBackgroundTasksOpen] = useState(false)
  const [loadingBackgroundTasks, setLoadingBackgroundTasks] = useState(false)
  const [cancellingBackgroundTask, setCancellingBackgroundTask] =
    useState<{ ownerKey: string; taskId: string }>()
  const [mutedSessions, setMutedSessions] = useState<string[]>([])
  const mutedSessionsRef = useRef<string[]>([])
  const [mutingSession, setMutingSession] = useState(false)
  const [updateRegistration, setUpdateRegistration] =
    useState<ServiceWorkerRegistration>()
  const [updatingApp, setUpdatingApp] = useState(false)
  const [updateToastDismissed, setUpdateToastDismissed] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const keyboardOpenRef = useRef(false)
  const keyboardFocusGapUntilRef = useRef(0)
  // Escape put the command menu away. Kept until what is being typed changes,
  // so the menu does not spring back on the next keystroke.
  const [commandMenuDismissed, setCommandMenuDismissed] = useState(false)
  const [shortcutOverrides, setShortcutOverrides] = useState<
    Partial<Record<ShortcutId, ShortcutBinding>>
  >(() => readStoredShortcuts())
  const [viewportHeight, setViewportHeight] = useState(() =>
    currentAppViewportGeometry(false).height,
  )
  const [viewportOffsetTop, setViewportOffsetTop] = useState(() =>
    currentAppViewportGeometry(false).offsetTop,
  )
  const viewportBaselineHeightRef = useRef(
    typeof window === 'undefined'
      ? 800
      : Math.max(
          window.innerHeight,
          window.visualViewport?.height || 0,
        ),
  )
  // Preferences that follow you to every device on this hub. This device's
  // copy renders at once; the hub's profile and other devices' changes
  // arrive through the client.
  const settingsProfile = useSyncExternalStore(
    settingsClient.subscribe,
    settingsClient.getState,
  )
  const profile = settingsProfile.values
  useEffect(() => {
    settingsClient.start()
    const reconnect = () => void settingsClient.sync()
    // Another tab changed the shared copy; null means storage was cleared.
    const otherTab = (event: StorageEvent) => {
      if (event.key === settingsProfileCacheKey || event.key === null) {
        settingsClient.refreshFromStorage()
      }
    }
    window.addEventListener('online', reconnect)
    window.addEventListener('storage', otherTab)
    return () => {
      window.removeEventListener('online', reconnect)
      window.removeEventListener('storage', otherTab)
      settingsClient.stop()
    }
  }, [settingsClient])
  const saveSetting = useCallback(
    <K extends SettingsProfileKey>(key: K, value: SettingsProfileValues[K] | null) => {
      try {
        settingsClient.set(key, value)
      } catch (caught) {
        setError(`Could not save ${settingNames[key].toLowerCase()}: ${
          caught instanceof Error ? caught.message : String(caught)
        }`)
      }
    },
    [settingsClient],
  )
  const statusline = useMemo<StatuslineSettings>(
    () => ({ ...defaultStatusline, ...profile.statusline }),
    [profile.statusline],
  )
  const statuslineRef = useRef(statusline)
  statuslineRef.current = statusline
  const setStatusline = useCallback(
    (next: StatuslineSettings | ((current: StatuslineSettings) => StatuslineSettings)) =>
      saveSetting('statusline', typeof next === 'function' ? next(statuslineRef.current) : next),
    [saveSetting],
  )
  const defaultRuntimes = useMemo<DefaultRuntimeSettings>(
    () => ({
      copilot: { ...emptyRuntimeSelection, ...profile.newSessionRuntimes?.copilot },
      claude: { ...emptyRuntimeSelection, ...profile.newSessionRuntimes?.claude },
    }),
    [profile.newSessionRuntimes],
  )
  const setDefaultRuntimes = useCallback(
    (next: DefaultRuntimeSettings) => saveSetting('newSessionRuntimes', next),
    [saveSetting],
  )
  const newSessionBackend: NewSessionBackendSetting =
    profile.newSessionBackend ?? 'terminal'
  const setNewSessionBackend = useCallback(
    (next: NewSessionBackendSetting) =>
      saveSetting('newSessionBackend', next === 'sdk' ? next : null),
    [saveSetting],
  )
  const defaultSessionFolders = useMemo<DefaultSessionFolders>(
    () => profile.newSessionFolders ?? {},
    [profile.newSessionFolders],
  )
  const setDefaultSessionFolders = useCallback(
    (next: DefaultSessionFolders) =>
      saveSetting('newSessionFolders', Object.keys(next).length ? next : null),
    [saveSetting],
  )
  // Oracle reads the New-session runtime from the hub's settings profile as
  // each session starts; a message carries only this device's computer and folders.
  const managerDefaults = useMemo<ManagerClientDefaults>(() => {
    const folders = Object.fromEntries(
      Object.entries(defaultSessionFolders).filter(([, folder]) => folder.trim()),
    )
    const local = computers.find((computer) => computer.isLocal)
    return {
      ...(local ? { computerId: local.id } : {}),
      ...(Object.keys(folders).length ? { folders } : {}),
    }
  }, [computers, defaultSessionFolders])
  const accentTheme: AccentTheme = profile.accent ?? 'agentic'
  const appearanceSetting: AppearanceSetting = profile.appearance ?? 'system'
  const prefersLight = useSyncExternalStore(subscribePrefersLight, prefersLightNow)
  const appearance: Appearance = resolveAppearance(profile.appearance, prefersLight)
  useLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.dataset.appearance
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousColor = themeColor?.content
    root.dataset.appearance = appearance
    if (themeColor) themeColor.content = appearance === 'light' ? '#f5f7f9' : '#181d24'
    return () => {
      if (previous === undefined) delete root.dataset.appearance
      else root.dataset.appearance = previous
      if (themeColor && previousColor !== undefined) themeColor.content = previousColor
    }
  }, [appearance])
  const brandIcon = '/icon.svg'
  const [error, setError] = useState<string>()
  const signInExpired = useSyncExternalStore(subscribeHubSignIn, hubSignInExpired)
  // An open modal carries the notice itself.
  const modalOpen = useSyncExternalStore(
    subscribeDialogFrames,
    () => innermostDialogFrame() !== undefined,
  )
  useEffect(() => {
    // A refusal the gateway has stopped making is no longer an error.
    if (!signInExpired) {
      setError((current) => current === HUB_SIGN_IN_EXPIRED_MESSAGE ? undefined : current)
    }
  }, [signInExpired])
  // Computers this profile has not placed yet follow in pairing order, which
  // is derived here rather than written back: only a drag is a choice.
  const computerOrder = useMemo(() => {
    const ids = computers.map((computer) => computer.id)
    const saved: string[] = profile.computerOrder ?? []
    return [
      ...saved.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !saved.includes(id)),
    ]
  }, [computers, profile.computerOrder])
  const [sessionOrder, setSessionOrder] = useState<Record<string, string[]>>(
    () => readStoredOrder('agentic-remote:session-order', {}),
  )
  // The hub owns the custom order. Until its first snapshot arrives the value
  // above is only what this browser last saw, so it is offered as a bootstrap
  // rather than written back. -1 means "nothing acknowledged yet", which keeps
  // revision 0 (an empty hub) from looking like a snapshot already applied.
  const [sessionOrderRevision, setSessionOrderRevision] = useState(-1)
  const [showSuspendedSessions, setShowSuspendedSessions] = useState(true)
  const [savingSuspendedVisibility, setSavingSuspendedVisibility] = useState(false)
  const savingSuspendedVisibilityRef = useRef(false)
  // Hidden sessions keep running; only the list leaves them out.
  const [hiddenSessionKeys, setHiddenSessionKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [showHiddenSessions, setShowHiddenSessions] = useState(false)
  const [savingHiddenVisibility, setSavingHiddenVisibility] = useState(false)
  const savingHiddenVisibilityRef = useRef(false)
  const [hidingSessions, setHidingSessions] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const hidingSessionsRef = useRef(new Set<string>())
  // Unread is hub-owned as well. Each save in flight shows its outcome at
  // once and keeps the row's control busy until the hub answers.
  const [unreadSessionKeys, setUnreadSessionKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const unreadSessionKeysRef = useRef(unreadSessionKeys)
  const [unreadSaves, setUnreadSaves] = useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  )
  const unreadSavesRef = useRef(new Map<string, boolean>())
  // Looking at a session reads it, but the hub may only mark it unread after
  // you have already looked: its mark follows the session event that ended
  // the turn. So looking leaves an intent to read it, used up by the first
  // snapshot that shows it unread while it is still open, or soon dropped.
  const readIntentRef = useRef<{ key: string; until: number } | undefined>(undefined)
  // The open session you marked unread yourself, which stays unread until you
  // open it again or the app comes back into view.
  const unreadHoldRef = useRef<string | undefined>(undefined)
  const requestReadRef = useRef((_key: string) => {})
  const settleReadIntentRef = useRef(() => {})
  // While this browser clears or recovers a hidden session, sessions that
  // appear on its computer stay out of the list until the hub's snapshot says
  // whether they are hidden: a node that predates replacement links names the
  // successor only in its response. A clear and a recovery can overlap, so
  // each keeps its own hold.
  const [replacementHolds, setReplacementHolds] = useState<readonly {
    computerId: string
    known: ReadonlySet<string>
  }[]>([])
  const sessionOrderRef = useRef(sessionOrder)
  sessionOrderRef.current = sessionOrder
  const sessionOrderRevisionRef = useRef(sessionOrderRevision)
  sessionOrderRevisionRef.current = sessionOrderRevision
  // The last order the hub confirmed, which is what a refused drag returns to.
  const acknowledgedSessionOrderRef = useRef(sessionOrder)
  const applySessionOrderSnapshot = useCallback(
    (snapshot: SessionOrderSnapshot) => {
      // An older revision is a late delivery, not a correction.
      if (snapshot.revision < sessionOrderRevisionRef.current) return
      sessionOrderRevisionRef.current = snapshot.revision
      acknowledgedSessionOrderRef.current = snapshot.order
      setSessionOrderRevision(snapshot.revision)
      setSessionOrder(snapshot.order)
      setShowSuspendedSessions(snapshot.showSuspended !== false)
      // A hub that predates hiding sends neither field.
      setHiddenSessionKeys(new Set(Array.isArray(snapshot.hidden) ? snapshot.hidden : []))
      setShowHiddenSessions(snapshot.showHidden === true)
      // Nor unread: nothing is.
      unreadSessionKeysRef.current = new Set(Array.isArray(snapshot.unread) ? snapshot.unread : [])
      setUnreadSessionKeys(unreadSessionKeysRef.current)
      // In the same update, so the session on screen never shows as unread.
      settleReadIntentRef.current()
    },
    [],
  )
  const sessionSort: SessionSort = profile.sessionSort ?? 'custom'
  const [sessionQuery, setSessionQuery] = useState(initialSessionNavigation.current.query)
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>(
    initialSessionNavigation.current.filter,
  )
  useEffect(() => {
    writeStored(SESSION_NAVIGATION_STORAGE_KEY, JSON.stringify({
      query: sessionQuery,
      filter: sessionFilter,
    }))
  }, [sessionFilter, sessionQuery])
  const refreshAuthoritative = useCallback(() => {
    void authoritativeRefreshRef.current().catch(() => undefined)
  }, [])
  const timelineRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)
  const [followingLatest, setFollowingLatest] = useState(true)
  const autoScrollSessionRef = useRef<string | undefined>(undefined)
  const previousPendingActionRef = useRef<string | undefined>(undefined)
  const requiredActionScrollRef = useRef(false)
  // Where the view last put the timeline's end. A scroll read there is the
  // content moving under a reader who stayed put, not the reader leaving.
  const pinnedScrollTopRef = useRef<number | undefined>(undefined)
  // Expanding a long sent message is the reader going somewhere, as a scroll
  // up would be: the view stops following the end until they return to it.
  const pauseFollowing = useCallback(() => {
    autoScrollRef.current = false
    pinnedScrollTopRef.current = undefined
    setFollowingLatest(false)
  }, [])
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const attachmentQueueRef = useRef<Promise<void> | undefined>(undefined)
  // Attachment work with no composer row yet: a file being fingerprinted or
  // waiting its turn, or audio being transcribed. A queued edit's baseline is
  // the rows, so whatever this work adds during a rewrite is discarded with it.
  const pendingAttachmentIntakeRef = useRef(0)
  const composerAttachmentsRef = useRef<
    Record<string, ComposerAttachment[]>
  >(composerAttachments)
  const attachmentFilesRef = useRef(
    new Map<string, Set<File>>(),
  )
  const clipboardPasteBatchesRef = useRef(
    new Map<string, { at: number; fingerprints: Set<string> }>(),
  )
  const attachmentTargetWaitersRef = useRef(
    new Map<
      string,
      Set<(target: ManagedSession | undefined) => void>
    >(),
  )
  const mediaRecorderRef = useRef<MediaRecorder | undefined>(undefined)
  const recordingStreamRef = useRef<MediaStream | undefined>(undefined)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingSessionRef = useRef<ManagedSession | undefined>(undefined)
  const recordingIntakeSequenceRef = useRef(0)
  const recordingTimerRef = useRef<number | undefined>(undefined)
  const recordingStartedAtRef = useRef(0)
  const discardRecordingRef = useRef(false)
  const selectedRef = useRef<ManagedSession | undefined>(undefined)
  const eventSequenceRef = useRef(currentSessionEventSequence())
  const backgroundTaskSnapshotsRef = useRef(backgroundTaskSnapshots)
  const computersRef = useRef(computers)
  // The sessions as last committed, so reconciliation can be worked out
  // without depending on a state updater having already run.
  const sessionsRef = useRef(sessions)
  // What each session's composer holds, readable from a request that has
  // already been sent. The state a callback closed over is the state as it was
  // when the callback was made, which is exactly the wrong answer for "has
  // this changed since?".
  const backgroundTasksOpenRef = useRef(backgroundTasksOpen)
  const selectedKeyStateRef = useRef(selectedKey)
  const pendingSessionCreationIdRef = useRef(0)
  // Creations on one computer are sent one after another. Their computer seats
  // each session as it is stored, so this is what lets every one finish in the
  // place its pending row was drawn. There is deliberately no timeout: going
  // ahead early would let a later creation take an earlier row's place, and a
  // creation that never answers is already showing as stuck on that computer.
  const sessionCreationQueues = useRef(new Map<string, Promise<void>>())
  const sessionCreationIntentRef = useRef(0)
  const sessionSelectionIntentRef = useRef(0)
  const newSessionOpenRef = useRef(false)
  const backgroundTaskRequestsRef = useRef(new Map<string, Promise<void>>())
  // Set from the page returning until the hub answers; see the hub event effect.
  const resumeRecoveringRef = useRef(false)
  const queuedBackgroundTaskRefreshesRef = useRef(new Set<string>())
  const backgroundTaskEventSequenceRef = useRef(new Map<string, number>())
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
  /**
   * Follows a session key through every clear it has been through.
   *
   * Clears chain: a session cleared twice leaves a link from the first id to
   * the second and from the second to the third, and a browser that was away
   * is holding the first. Answering with the next step alone opens a session
   * that is itself gone.
   */
  const followReplacements = useCallback((key: string) => {
    const seen = new Set<string>()
    let current = key
    while (!seen.has(current)) {
      seen.add(current)
      const next = replacedInto.current.get(current)
      if (!next) {
        break
      }
      current = next
    }
    return current
  }, [])

  /**
   * Opens what the address asked for, if nothing is open yet.
   *
   * Startup and the socket's own refresh race, and either can be the one that
   * lands first, so both have to be able to honour a link.
   */
  const applyInitialSelection = useCallback(
    (loaded: ManagedSession[], answeredFor?: Set<string>) => {
      const requestedKey = initialUrlSelection.current
        ? followReplacementsRef.current(initialUrlSelection.current)
        : undefined
      const requested = loaded.find(
        (session) => sessionKey(session) === requestedKey,
      )
      // A computer that did not answer has said nothing about the session the
      // address names. Falling through to whatever sorted first took the
      // reader somewhere they never asked for, and the replacement arriving
      // later only redirects a reader still sitting on the ancestor.
      const unanswered =
        requestedKey !== undefined &&
        answeredFor !== undefined &&
        !answeredFor.has(requestedKey.slice(0, requestedKey.indexOf(':')))
      setSelectedKey(
        (current) =>
          current ||
          (requested
            ? sessionKey(requested)
            : requestedKey &&
                (pendingReplacements.current.has(requestedKey) || unanswered)
              ? requestedKey
              : fallbackSessionKey(loaded, closingSessionsRef.current)),
      )
    },
    [],
  )

  /**
   * Records what a session says it replaced, and nothing else.
   *
   * A list rejects sessions that changed while it was in flight, because it
   * cannot speak for them. Their ancestry is not an opinion about the present
   * though -- a session names what it replaced for good -- and dropping it
   * with the rest of the record left a deep link to an ancestor with no way to
   * reach the replacement, so it opened an unrelated session instead.
   *
   * Only the links are taken. Moving state across is a claim about what is
   * current, and that is what the rejection was about.
   */
  const recordReplacementLinks = useCallback((loaded: ManagedSession[]) => {
    for (const session of loaded) {
      const replacement = sessionKey(session)
      for (const ancestorId of [
        ...(session.replacedSessionIds || []),
      ].reverse()) {
        const ancestor = sessionKey({
          computerId: session.computerId,
          id: ancestorId,
        })
        if (!replacedInto.current.has(ancestor)) {
          replacedInto.current.set(ancestor, replacement)
        }
        // The address is read once the list has been applied, and a link to a
        // session that has since been cleared should open what it became.
        if (initialUrlSelection.current === ancestor) {
          initialUrlSelection.current = followReplacementsRef.current(ancestor)
        }
        setLocationKnowledgeTarget((current) =>
          current?.key === ancestor
            ? { ...current, key: followReplacementsRef.current(ancestor) }
            : current,
        )
      }
    }
  }, [])

  const claimReplacedSessions = useCallback((loaded: ManagedSession[]) => {    for (const session of loaded) {
      const replacement = sessionKey(session)
      const migratedAttachmentIds = new Set<string>()
      // Newest first. Each ancestor only fills what the replacement does not
      // already have, so the most recent one has to be offered first or an
      // older ancestor takes the place it should have had.
      for (const ancestorId of [...(session.replacedSessionIds || [])].reverse()) {
        const ancestor = sessionKey({
          computerId: session.computerId,
          id: ancestorId,
        })
        // The link is recorded every time. Only moving state across is once:
        // a second pass would overwrite the replacement's own newer state with
        // what the ancestor had, while the link is still needed to answer a
        // later Back or deep link to the session that is gone.
        replacedInto.current.set(ancestor, replacement)
        for (const attachment of composerAttachmentsRef.current[replacement] || []) {
          if (attachment.migratedFrom === ancestor) {
            migratedAttachmentIds.add(attachment.id)
          }
        }
        if (!adoptedReplacements.current.has(ancestor)) {
          adoptedReplacements.current.add(ancestor)
          for (const attachment of composerAttachmentsRef.current[ancestor] || []) {
            migratedAttachmentIds.add(attachment.id)
          }
          migrateSessionStateRef.current(ancestor, replacement)
        }
        setSelectedKey((current) =>
          current === ancestor ? replacement : current,
        )
        // A link to a session that has since been cleared should open what it
        // became. Nothing is selected yet on the first load, so the address
        // the loader is about to read is what has to follow the lineage.
        if (initialUrlSelection.current === ancestor) {
          initialUrlSelection.current = replacement
        }
        setLocationKnowledgeTarget((current) =>
          current?.key === ancestor ? { ...current, key: replacement } : current,
        )
      }
      if (session.replacedSessionIds?.length) {
        rebindAttachments(replacement, session)
        const pendingCleanup =
          pendingAttachmentReplacements.current.get(replacement)
        pendingAttachmentReplacements.current.delete(replacement)
        for (const id of pendingCleanup || []) {
          migratedAttachmentIds.add(id)
        }
        if (!session.recovery && migratedAttachmentIds.size > 0) {
          discardAttachmentsById(migratedAttachmentIds)
        }
      }
      settleAttachmentTargetWaiters(
        replacement,
        session.recovery ? session : undefined,
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
  // Advanced only when a computer is removed, which does speak for its
  // sessions. Ordinary status changes are tracked separately.
  const computerEventSequenceRef = useRef(new Map<string, number>())
  const computerRecordSequenceRef = useRef(new Map<string, number>())
  const upsertSession = useCallback((current: ManagedSession[], incoming: ManagedSession) => {
    const key = sessionKey(incoming)
    const startedAt = sessionResponseStartedAt(incoming)
    const lastEventAt = sessionEventSequenceRef.current.get(key) || 0
    if (
      startedAt !== undefined &&
      (((computerEventSequenceRef.current.get(incoming.computerId) || 0) > startedAt) ||
        (lastEventAt > startedAt && removedSessions.current.has(key)))
    ) return current
    return upsertSessionSnapshot(current, incoming, lastEventAt)
  }, [])
  const currentSessionResponse = useCallback((incoming: ManagedSession) =>
    projectSessionResponse(
      incoming,
      sessionsRef.current.find((entry) => sessionKey(entry) === sessionKey(incoming)),
      sessionEventSequenceRef.current.get(sessionKey(incoming)) || 0,
    ), [])
  const sidebarResizeRef = useRef<
    | { pointerId: number; startX: number; startWidth: number; width: number }
    | undefined
  >(undefined)

  function commitSidebarWidth(width: number) {
    const next = clampSidebarWidth(width)
    setSidebarWidth(next)
    writeStored(SIDEBAR_WIDTH_KEY, String(next))
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
      grouped.set(
        computer.id,
        orderSessionLane(
          sessions.filter((session) => session.computerId === computer.id),
          sessionOrder[computer.id] || [],
          sessionSort,
          backgroundTaskSnapshots,
        ),
      )
    }
    return grouped
  }, [orderedComputers, sessionOrder, sessions, sessionSort, backgroundTaskSnapshots])
  const listedHiddenKeys = useMemo(() => {
    if (replacementHolds.length === 0) return hiddenSessionKeys
    const keys = new Set(hiddenSessionKeys)
    for (const session of sessions) {
      const key = sessionKey(session)
      if (replacementHolds.some((hold) =>
        hold.computerId === session.computerId && !hold.known.has(key))) {
        keys.add(key)
      }
    }
    return keys
  }, [hiddenSessionKeys, replacementHolds, sessions])
  const listedUnreadKeys = useMemo(() => {
    if (unreadSaves.size === 0) return unreadSessionKeys
    const keys = new Set(unreadSessionKeys)
    for (const [key, unread] of unreadSaves) {
      if (unread) keys.add(key)
      else keys.delete(key)
    }
    return keys
  }, [unreadSaves, unreadSessionKeys])
  const markingUnreadKeys = useMemo(() => new Set(unreadSaves.keys()), [unreadSaves])
  const navigationView = useMemo(
    () => sessionNavigationView(
      orderedComputers,
      sessionsByComputer,
      backgroundTaskSnapshots,
      sessionQuery,
      sessionFilter,
      showSuspendedSessions,
      { keys: listedHiddenKeys, shown: showHiddenSessions },
      listedUnreadKeys,
    ),
    [
      orderedComputers,
      sessionsByComputer,
      backgroundTaskSnapshots,
      sessionQuery,
      sessionFilter,
      showSuspendedSessions,
      listedHiddenKeys,
      showHiddenSessions,
      listedUnreadKeys,
    ],
  )
  // A pending row stands where its session will appear, so finishing the
  // creation does not move it.
  const placedSessionCreations = useMemo(
    () => orderedComputers.flatMap((computer) => {
      const creations = pendingSessionCreations.filter(
        (creation) => creation.computerId === computer.id,
      )
      if (!creations.length) return []
      const shown = new Set(
        navigationView.groups
          .find((group) => group.computer.id === computer.id)
          ?.sessions.map(sessionKey),
      )
      return pendingSessionPlacements(
        sessions.filter((session) => session.computerId === computer.id),
        creations,
        sessionOrder[computer.id] || [],
        sessionSort,
        backgroundTaskSnapshots,
      ).flatMap(({ id, followers }) => {
        const creation = creations.find((entry) => entry.id === id)
        return creation
          ? [{ ...creation, before: followers.find((key) => shown.has(key)) }]
          : []
      })
    }),
    [
      backgroundTaskSnapshots,
      navigationView,
      orderedComputers,
      pendingSessionCreations,
      sessionOrder,
      sessionSort,
      sessions,
    ],
  )
  const selected = useMemo(
    () => sessions.find((session) => sessionKey(session) === selectedKey),
    [selectedKey, sessions],
  )
  const hasSelectedSession = Boolean(selected)
  // Drops a pending message once its session's transcript has it, or once the
  // session has settled for a while without ever logging it.
  useEffect(() => {
    if (Object.keys(pendingEchoes).length === 0) return
    const owner = (key: string) => sessions.find((session) => sessionKey(session) === key)
    const prune = () => setPendingEchoes((current) =>
      prunePendingEchoMap(current, owner, Date.now()))
    const now = Date.now()
    const pruned = prunePendingEchoMap(pendingEchoes, owner, now)
    const deadline = nextPendingEchoDeadline(pruned)
    if (pruned === pendingEchoes && deadline === undefined) return
    const timer = window.setTimeout(
      prune,
      pruned === pendingEchoes ? Math.max(0, deadline! - now) : 0,
    )
    return () => window.clearTimeout(timer)
  }, [pendingEchoes, sessions])
  const selectedPendingEchoes = useMemo(
    // Whatever the transcript has already logged is hidden at once, so the
    // message never shows twice; the effect above retires the rest.
    () => selected
      ? unloggedPendingEchoes(pendingEchoes[sessionKey(selected)] || [], selected.messages)
      : [],
    [pendingEchoes, selected],
  )
  const acceptKnowledgeRoot = useCallback((binding: SessionKnowledgeBinding) => {
    if (!binding.rootId) return
    if (!binding.available) {
      markKnowledgeRootRemoved(binding.rootId)
      setRoots((current) => current.some((root) => root.id === binding.rootId)
        ? current.filter((root) => root.id !== binding.rootId) : current)
      return
    }
    const root = binding.root
    if (
      !root || root.id !== binding.rootId ||
      forgottenComputers.current.has(binding.computerId) ||
      forgottenComputers.current.has(root.computerId) ||
      removedKnowledgeRoots.current.has(root.id)
    ) return
    setRoots((current) => current.some((entry) => entry.id === root.id)
      ? current : [structuredClone(root), ...current])
  }, [markKnowledgeRootRemoved, setRoots])
  const sessionKnowledgeRoot = useSessionKnowledgeRoot(selected, knowledgeMode !== 'hidden' || addRootOpen, acceptKnowledgeRoot)
  const sessionKnowledgeRootRef = useRef(sessionKnowledgeRoot)
  sessionKnowledgeRootRef.current = sessionKnowledgeRoot
  const locationKnowledgeFile =
    locationKnowledgeTarget &&
    locationKnowledgeTarget.key === selectedKey
      ? locationKnowledgeTarget.file
      : undefined
  const rememberedKnowledgePosition = locationKnowledgeFile
    ? {
        rootId:
          sessionKnowledgeRoot.binding?.rootId ||
          (selectedKey ? knowledgePositions[selectedKey]?.rootId : undefined),
        ...(normalizeKnowledgeRelativePath(
          sessionKnowledgeRoot.binding?.rootPath,
        ) === knowledgeRootPath
          ? {}
          : {
              rootPath: normalizeKnowledgeRelativePath(
                sessionKnowledgeRoot.binding?.rootPath,
              ),
            }),
        path: knowledgeFolderForFile(locationKnowledgeFile),
        file: locationKnowledgeFile,
      }
    : selectedKey
      ? knowledgePositions[selectedKey]
      : undefined
  const resolvedKnowledgePosition = useMemo(
    () => knowledgePositionForBinding(sessionKnowledgeRoot.binding, rememberedKnowledgePosition),
    [sessionKnowledgeRoot.binding, rememberedKnowledgePosition],
  )
  const expectedKnowledgeRootId = selected ? resolvedKnowledgePosition?.rootId : undefined
  const selectedKnowledgeBinding = selected
    ? sessionKnowledgeRoot.binding
    : undefined
  const sessionKnowledgeBasePath =
    selectedKnowledgeBinding &&
    selectedKnowledgeBinding.rootId === expectedKnowledgeRootId
      ? normalizeKnowledgeRelativePath(selectedKnowledgeBinding.rootPath)
      : knowledgeRootPath
  const activeKnowledgeBasePath =
    selectedKnowledgeBinding &&
    selectedKnowledgeBinding.rootId === activeRootId
      ? normalizeKnowledgeRelativePath(selectedKnowledgeBinding.rootPath)
      : knowledgeRootPath
  const sessionRootReady = !selected || Boolean(sessionKnowledgeRoot.binding)
  const sessionRootUnavailable = Boolean(selected && expectedKnowledgeRootId && (
    (sessionKnowledgeRoot.binding?.rootId && !sessionKnowledgeRoot.binding.available) ||
    (knowledgeRootsLoaded && !roots.some((root) => root.id === expectedKnowledgeRootId))
  ))
  const sessionRootUnassigned = Boolean(selected && sessionRootReady && !expectedKnowledgeRootId)
  const sessionRootSwitching = Boolean(selected && (
    !sessionRootReady ||
    (expectedKnowledgeRootId && activeRootId !== expectedKnowledgeRootId && !sessionRootUnavailable)
  ))
  useLayoutEffect(() => {
    const binding = sessionKnowledgeRoot.binding
    if (
      !rootPicker?.session ||
      rootPicker.ownerKey !== selectedKey ||
      rootPicker.revision !== undefined ||
      !binding
    ) return
    setRootPicker((current) => current?.id === rootPicker.id
      ? { ...current, revision: binding.revision } : current)
    setRootChoice(expectedKnowledgeRootId
      ? {
          kind: 'root',
          rootId: expectedKnowledgeRootId,
          rootPath: sessionKnowledgeBasePath,
        }
      : { kind: 'working-folder', rootPath: knowledgeRootPath })
  }, [
    expectedKnowledgeRootId,
    rootPicker,
    selectedKey,
    sessionKnowledgeBasePath,
    sessionKnowledgeRoot.binding,
  ])

  useLayoutEffect(() => {
    const owner = rootCreationOwner.current
    const binding = sessionKnowledgeRoot.binding
    if (addRootOpen && owner && owner.key === selectedKey && owner.revision === undefined && binding) {
      owner.revision = binding.revision
    }
  }, [addRootOpen, selectedKey, sessionKnowledgeRoot.binding])

  useLayoutEffect(() => {
    if (!selectedKey || !hasSelectedSession || !sessionRootReady || !knowledgeRootsLoaded || knowledgeMode === 'hidden') return
    const scope = `${selectedKey}:${expectedKnowledgeRootId || ''}:${sessionKnowledgeBasePath}:${sessionRootUnavailable}`
    if (appliedSessionRootScope.current === scope) return
    appliedSessionRootScope.current = scope
    if (expectedKnowledgeRootId) {
      setKnowledgePositions((current) =>
        current[selectedKey]?.rootId === expectedKnowledgeRootId &&
        normalizeKnowledgeRelativePath(current[selectedKey]?.rootPath) ===
          sessionKnowledgeBasePath
        ? current
        : {
            ...current,
            [selectedKey]: {
              rootId: expectedKnowledgeRootId,
              ...(sessionKnowledgeBasePath === knowledgeRootPath
                ? {}
                : { rootPath: sessionKnowledgeBasePath }),
              path: knowledgeRootPath,
            },
          },
      )
    }
    knowledgeRequest.current += 1
    knowledgeRestoreStartedKey.current = undefined
    knowledgePendingScrollKey.current = undefined
    knowledgeRestoredKey.current = undefined
    setKnowledgeLoading(false)
    if (!expectedKnowledgeRootId || sessionRootUnavailable) {
      setActiveRootId(undefined)
      setKnowledgeFolders({})
      setKnowledgeExpansion({ paths: [] })
      setKnowledgePath(knowledgeRootPath)
      setKnowledgeFile(undefined)
      setKnowledgeFragment(undefined)
      knowledgeViewOwnerKey.current = selectedKey
      knowledgeRestoredKey.current = selectedKey
    } else {
      setKnowledgeFolders({})
      const expansionScope = knowledgeExpansionKey(
        expectedKnowledgeRootId,
        sessionKnowledgeBasePath,
      )
      setKnowledgeExpansion({
        scope: expansionScope,
        paths: rememberedKnowledgeExpansion(
          expectedKnowledgeRootId,
          sessionKnowledgeBasePath,
        ),
      })
      setKnowledgePath(knowledgeRootPath)
      setKnowledgeFile(undefined)
      setKnowledgeFragment(undefined)
    }
  }, [
    expectedKnowledgeRootId, knowledgeMode, knowledgeRootsLoaded,
    hasSelectedSession, selectedKey, sessionKnowledgeBasePath,
    sessionRootReady, sessionRootUnavailable,
  ])

  useLayoutEffect(() => {
    selectKnowledgeRootRef.current = selectRoot
  })

  useLayoutEffect(() => {
    if (
      selected ||
      !activeRootId ||
      !knowledgeRootsLoaded ||
      knowledgeMode === 'hidden'
    ) {
      return
    }
    const scope = knowledgeExpansionKey(activeRootId, knowledgeRootPath)
    if (knowledgeExpansion.scope === scope) {
      return
    }
    void selectKnowledgeRootRef.current(activeRootId, true)
  }, [
    activeRootId,
    knowledgeExpansion.scope,
    knowledgeMode,
    knowledgeRootsLoaded,
    selected,
  ])

  // The native shell shows how many sessions are blocked on the user. This is
  // a no-op in a browser, so the badge never needs a capability check here.
  useEffect(() => {
    setShellBadge(attentionCount(sessions))
  }, [sessions, selectedKey])
  // An embedded webview gets no Web Push, so inside the shell the app raises
  // its own notifications from the live session stream. A browser keeps using
  // the hub's Web Push and must not double-notify, hence the shell check.
  // Which notifications may be raised, and whether Oracle is on screen, which
  // makes Oracle's own redundant. The event socket's handlers read these.
  const notificationScopeRef = useRef(profile.notificationScope)
  notificationScopeRef.current = profile.notificationScope
  const oracleOnScreenRef = useRef(false)
  const eventSocketRef = useRef<WebSocket | undefined>(undefined)
  /** Tells the hub whether Oracle is on screen, so it holds Oracle's pushes. */
  const reportOraclePresenceRef = useRef(() => {})
  reportOraclePresenceRef.current = () => {
    const socket = eventSocketRef.current
    if (socket?.readyState !== 1 || typeof socket.send !== 'function') return
    socket.send(JSON.stringify({ type: 'presence', oracleVisible: oracleOnScreenRef.current }))
  }
  useEffect(() => {
    const report = () => {
      const onScreen = oracleOpen && document.visibilityState === 'visible'
      const changed = onScreen !== oracleOnScreenRef.current
      oracleOnScreenRef.current = onScreen
      if (changed) reportOraclePresenceRef.current()
      if (onScreen) {
        // Opening Oracle clears what it raised, as opening a session does. A
        // desktop shell has no withdrawal API, so there this does nothing.
        withdrawShellNotifications(oracleNotificationTags)
        void clearPushNotifications(oracleNotificationTags).catch((caught: unknown) => {
          console.warn('Unable to clear Oracle notifications:', caught)
        })
      }
    }
    report()
    document.addEventListener('visibilitychange', report)
    // The hub forgets a report after 90 seconds, so one from a phone that
    // froze cannot hold Oracle's notifications back for long.
    const renew = window.setInterval(() => {
      if (oracleOnScreenRef.current) reportOraclePresenceRef.current()
    }, 30_000)
    return () => {
      document.removeEventListener('visibilitychange', report)
      window.clearInterval(renew)
    }
  }, [oracleOpen])
  // The shell has no Web Push, so it raises Oracle's notifications itself,
  // classified exactly as the hub classifies them.
  const oracleShellNotifierRef = useRef<OracleNotifier | undefined>(undefined)
  const raiseOracleShellNotificationRef = useRef((_event: ManagerEvent) => {})
  raiseOracleShellNotificationRef.current = (event) => {
    if (!nativeShell()) return
    oracleShellNotifierRef.current ??= new OracleNotifier()
    const payload = oracleShellNotifierRef.current.next(event)
    if (!payload || oracleOnScreenRef.current) return
    if (!notificationAllowed(notificationScopeRef.current, 'oracle')) return
    sendShellNotification({
      tag: payload.tag,
      title: payload.title,
      body: payload.body,
      urgent: payload.priority === 'high',
    })
  }
  // Hub alerts reach a browser by Web Push; the shell raises them itself.
  const raiseAlertShellNotificationRef = useRef((_computerId: string | undefined, _message: string) => {})
  raiseAlertShellNotificationRef.current = (computerId, message) => {
    if (!nativeShell() || !notificationAllowed(notificationScopeRef.current, 'alert')) return
    const payload = alertNotification(computerId, message)
    sendShellNotification({ tag: payload.tag, title: payload.title, body: payload.body, urgent: true })
  }
  const notificationStateRef = useRef<Map<string, SessionNotificationState>>(
    new Map(),
  )
  const scheduleShellNotifierRef = useRef(new ScheduleShellNotifier())
  const raiseScheduleShellNotificationRef = useRef((_record: import('../shared/notification-center').NotificationRecord) => {})
  raiseScheduleShellNotificationRef.current = (record) => {
    if (!nativeShell()) return
    const notification = scheduleShellNotifierRef.current.next(record, {
      scope: notificationScopeRef.current, mutedKeys: mutedSessions, activeKey: selectedKey,
      documentVisible: document.visibilityState === 'visible',
    })
    if (notification) sendShellNotification(notification)
  }
  useEffect(() => {
    if (!nativeShell()) {
      return
    }
    const previous = notificationStateRef.current
    notificationStateRef.current = notificationState(sessions)
    // The hub applies the scope to Web Push; the shell raises its own, so it
    // applies the same scope here.
    if (!notificationAllowed(notificationScopeRef.current, 'session')) {
      return
    }
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
        setLocationKnowledgeTarget(undefined)
        // A link written before a clear names a session that is gone, exactly
        // as a Back entry can, so it follows the same lineage rather than
        // falling through to whichever session happens to be first.
        setSelectedKey(
          followReplacementsRef.current(
            sessionKey({ computerId: target.computerId, id: target.sessionId }),
          ),
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
  const selectedHasRunningBackgroundAgent =
    hasRunningBackgroundAgent(selectedBackgroundTasks)
  const selectedHasActiveBackgroundTasks =
    hasActiveBackgroundTasks(selectedBackgroundTasks)
  const foregroundHandoff = useForegroundHandoff(
    selected, selected ? sessionEventSequenceRef.current.get(sessionKey(selected)) || 0 : 0,
  )
  const selectedForegroundTurnActive = useMemo(
    () => foregroundHandoff.active || Boolean(selected && hasForegroundTurn(selected, selectedBackgroundTasks)),
    [foregroundHandoff.active, selected, selectedBackgroundTasks],
  )
  const selectedQueueAvailable =
    selected?.status === 'running' ||
    (selected?.executionMode === 'sdk' && selectedHasRunningBackgroundAgent)
  const composer = selectedKey ? composerDrafts[selectedKey]?.text || '' : ''
  const selectedAttachments = selectedKey
    ? composerAttachments[selectedKey] || []
    : []
  const composerDraftRecovered = Boolean(
    selectedKey
    && composer
    && initialComposerDraftText.current?.[selectedKey] === composer,
  )
  const missingAcceptanceOwners = Object.entries(composerDrafts).flatMap(
    ([key, draft]) => {
      const pending = draft.pendingSubmission
      if (!pending?.accepted || hasComposerAcceptanceReceipt(
        composerAcceptanceReceipts.current, key, pending,
      )) {
        return []
      }
      const owner = sessions.find((session) => sessionKey(session) === key)
      const separator = key.indexOf(':')
      const computerId = key.slice(0, separator)
      const computerName = owner?.computerName ||
        computers.find((computer) => computer.id === computerId)?.name ||
        computerId
      return [`${owner?.title || key.slice(separator + 1)} on ${computerName}`]
    },
  )
  const acceptanceReceiptMissing = missingAcceptanceOwners.length > 0
  // What each shortcut answers to now: its default unless the reader has
  // changed it.
  const shortcuts = shortcutDefaults.map((entry) => ({
    ...entry,
    binding: shortcutOverrides[entry.id] || entry.binding,
  }))

  const selectedSupportsSideQuestions = Boolean(selected) && computerProviders(
    computers.find((computer) => computer.id === selected?.computerId),
  ).find((provider) => provider.id === (selected?.provider || 'copilot'))
    ?.supportsSideQuestions === true
  const selectedSideThread = selected ? sideQuestions[sessionKey(selected)] : undefined
  // The message bar asks aside while the selected session's thread is open.
  const askingAside = Boolean(selectedSupportsSideQuestions && selectedSideThread?.open)
  const sideQuestionPending = Boolean(
    selectedSideThread?.entries.some((entry) => entry.status === 'pending'),
  )
  const sideQuestionDraft = askingAside ? selectedSideThread?.draft || '' : undefined
  // The confirmation lasts only while its session is still listed, so a session
  // closed elsewhere does not bring it back when it is reopened. Settled while
  // rendering, before anything can show the stale question.
  const closeRequestSession = closeRequest
    ? sessions.find((session) => sessionKey(session) === sessionKey(closeRequest))
    : undefined
  if (closeRequest && !closeRequestSession) {
    setCloseRequest(undefined)
  }
  const hasBlockingUi =
    Boolean(shellView) ||
    newSessionOpen ||
    Boolean(closeRequestSession) ||
    recentlyClosedOpen ||
    computersOpen ||
    statuslineOpen ||
    settingsOpen ||
    runtimeOpen ||
    Boolean(resourcesView) ||
    (renameOpen && Boolean(selected)) ||
    (cwdOpen && Boolean(selected)) ||
    (workspaceOpen && Boolean(selected)) ||
    addRootOpen ||
    Boolean(rootPicker || rootRemovalTarget) ||
    Boolean(selected?.pendingPermission || selected?.pendingUserInput)
  selectedRef.current = selected
  sessionsRef.current = sessions
  // Only the running tool is wanted, but finding it walks the whole
  // transcript, and this sits in the render path -- which every composer
  // keystroke runs. Held against the messages so typing does not re-scan a
  // long session for something that has not changed.
  const currentTool = useMemo(
    () =>
      selected?.messages.findLast(
        (message) =>
          message.role === 'activity' && message.activityStatus === 'running',
      ),
    [selected?.messages],
  )
  const hasRunningTool = currentTool?.activityStatus === 'running'
  const pendingActionId =
    selected?.pendingPermission?.requestId ||
    selected?.pendingUserInput?.requestId
  const selectedComputerId = selected?.computerId
  const selectedSessionId = selected?.id
  const selectedComputerOnline = computers.some(
    (computer) => computer.id === selectedComputerId && computer.online,
  )
  // An interrupted or archived record is read-only until it is reopened; the
  // server refuses these actions too.
  const selectedRetained = Boolean(selected?.interruption || selected?.archivedAt)
  const selectedClosing = Boolean(selected && closingSessions.has(sessionKey(selected)))
  const selectedSuspending = Boolean(
    selected && suspendingSessions.has(sessionKey(selected)),
  )
  const selectedQueueHeadIsSteering = Boolean(
    selected?.status === 'running' &&
    selected.executionMode === 'tmux' &&
    selectedComputerOnline &&
    !selectedRetained &&
    selected?.suspended !== true &&
    !selected.pendingUserInput &&
    !selected.pendingPermission &&
    !selected.failedPrompt &&
    !selected.recoveryAcknowledgementPending &&
    !selected.queuedDispatch &&
    !selected.terminalQueueDispatchPending &&
    selected.queueState?.state !== 'error' &&
    selected.recoverySeedState !== 'pending' &&
    selected.recoverySeedState !== 'dispatching' &&
    selected.queuedPrompts?.[0]?.steer === true &&
    !selected.queuedPrompts[0].command,
  )
  const selectedLifecycleBlocked = !selectedComputerOnline ||
    selectedRetained ||
    selected?.status !== 'idle' ||
    selected?.suspended === true ||
    Boolean(selected?.pendingUserInput || selected?.pendingPermission)
  const selectedRestartBlocked = !selectedComputerOnline ||
    selectedRetained ||
    (selected?.status !== 'idle' && selected?.status !== 'error') ||
    selected?.suspended === true ||
    Boolean(selected?.pendingUserInput || selected?.pendingPermission)
  const workspaceInsertUnavailableReason = selected && !selectedComputerOnline
    ? `Reconnect ${selected.computerName} to add a file reference.`
    : undefined
  const selectedNotificationsMuted = selected
    ? mutedSessions.includes(sessionKey(selected))
    : false
  const selectedProviderCapability = selected
    ? computerProviders(
        computers.find((computer) => computer.id === selected.computerId),
      ).find((provider) => provider.id === (selected.provider || 'copilot'))
    : undefined
  const selectedHasStaleInteraction =
    selected?.pendingPermission?.stale === true ||
    selected?.pendingUserInput?.stale === true
  const selectedShowsRecovery =
    selected?.provider !== 'claude' &&
    selectedProviderCapability?.supportsContextRecovery === true
  const selectedSupportsBackgroundTasks = selected
    ? supportsBackgroundTasks(
        computers.find((computer) => computer.id === selected.computerId),
        selected.provider,
      ) || selectedBackgroundTasks?.supported === true
    : false
  const selectedCanRecover =
    selectedShowsRecovery &&
    selectedComputerOnline &&
    !selectedRetained &&
    selected?.suspended !== true &&
    (selected?.status === 'idle' ||
      selected?.status === 'error') &&
    ((!selected?.pendingPermission &&
      !selected?.pendingUserInput) ||
      selectedHasStaleInteraction) &&
    !selected?.queuedDispatch &&
    selected?.recoverySeedState !== 'pending' &&
    selected?.recoverySeedState !== 'dispatching' &&
    !hasRunningTool &&
    (!selectedSupportsBackgroundTasks || selectedBackgroundTasks !== undefined) &&
    !selectedHasActiveBackgroundTasks
  const commandQuery = composer.startsWith('/')
    ? composer.slice(1).split(/\s/, 1)[0].toLowerCase()
    : ''
  // The list is replaced only once the selected session's own arrives. Until
  // then a session that does not answer side questions is offered no /ask at
  // all, since the one on hand, the app's or the agent's, is another session's.
  const sessionCommands = useMemo(
    () => selectedSupportsSideQuestions
      ? commands
      : commands.filter((command) => command !== sideQuestionWebCommand &&
        (commandsKey === selectedKey ||
          ![command.name, ...(command.aliases || [])]
            .some((name) => sideQuestionCommand(`/${name}`)))),
    [commands, commandsKey, selectedKey, selectedSupportsSideQuestions],
  )
  const commandSuggestions = useMemo(
    () =>
      composer.startsWith('/')
        ? sessionCommands
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
    [commandQuery, composer, sessionCommands],
  )
  const showCommandMenu =
    !askingAside &&
    commandSuggestions.length > 0 &&
    !composer.slice(1).includes(' ') &&
    !commandMenuDismissed
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
      const active = backgroundTaskRequestsRef.current.get(key)
      if (active) {
        if (force) {
          queuedBackgroundTaskRefreshesRef.current.add(key)
        }
        return active
      }
      if (!force && backgroundTaskSnapshotsRef.current[key]) {
        return
      }
      const request = (async () => {
        const startedAtSequence = eventSequenceRef.current
        let failure: unknown
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
          failure = caught
          // While the page recovers from a return, unreachability is retried, not shown.
          if (!(resumeRecoveringRef.current && isHubUnreachable(caught))) {
            setError(caught instanceof Error ? caught.message : String(caught))
          }
        } finally {
          backgroundTaskRequestsRef.current.delete(key)
          if (
            backgroundTasksOpenRef.current &&
            selectedKeyStateRef.current === key
          ) {
            setLoadingBackgroundTasks(false)
          }
        }
        if (queuedBackgroundTaskRefreshesRef.current.delete(key)) {
          return loadBackgroundTasks(session, true)
        }
        if (failure) throw failure
      })()
      backgroundTaskRequestsRef.current.set(key, request)
      return request
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
      const visibleHeight = viewport?.height || window.innerHeight
      const viewportOffsetTop = viewport?.offsetTop || 0
      const focusGapActive =
        !editorFocused &&
        Date.now() < keyboardFocusGapUntilRef.current
      const open = appKeyboardOpen({
        editorFocused,
        focusGapActive,
        baselineHeight: viewportBaselineHeightRef.current,
        viewportHeight: visibleHeight,
        viewportOffsetTop,
      })
      if (!editorFocused && !open) {
        viewportBaselineHeightRef.current = Math.max(
          window.innerHeight,
          visibleHeight,
        )
      }
      keyboardOpenRef.current = open
      const geometry = currentAppViewportGeometry(open)
      setKeyboardOpen(open)
      setViewportHeight(geometry.height)
      setViewportOffsetTop(geometry.offsetTop)
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
    const handleFocusIn = () => {
      keyboardFocusGapUntilRef.current = 0
      handleViewportChange()
    }
    const handleFocusOut = () => {
      keyboardFocusGapUntilRef.current = keyboardOpenRef.current
        ? Date.now() + keyboardFocusGapMs
        : 0
      handleViewportChange()
    }
    window.visualViewport?.addEventListener('resize', handleViewportChange)
    window.visualViewport?.addEventListener('scroll', handleViewportChange)
    window.addEventListener('resize', handleViewportChange)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange)
      window.visualViewport?.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
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
    writeStored(
      'agentic-remote:knowledge-root',
      JSON.stringify(activeRootId),
    )
  }, [activeRootId])

  useEffect(() => {
    if (!knowledgeHydrated.current || !knowledgeExpansion.scope) {
      return
    }
    const stored = {
      ...restoredKnowledgeExpansion.current,
      [knowledgeExpansion.scope]: knowledgeExpansion.paths,
    }
    restoredKnowledgeExpansion.current = stored
    writeStored(
      'agentic-remote:knowledge-expanded',
      JSON.stringify(stored),
    )
  }, [knowledgeExpansion])

  useEffect(() => {
    writeStored(
      'agentic-remote:knowledge-mode',
      JSON.stringify(knowledgeMode),
    )
  }, [knowledgeMode])

  // The session and open Knowledge file live in the URL, so reloads, links,
  // and browser history return to the same reading context.
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
      // A selected session that is not in the list yet is not proof there is
      // nothing to name. Its computer may not have answered, or its
      // replacement may still be on its way, and rewriting the address to a
      // bare path loses the link outright: reloading before it arrives opens
      // something else, and the lineage that would have redirected the reader
      // has nobody left to redirect.
      const unresolved =
        !selectedSession && selectedKey && selectedKey.includes(':')
          ? {
              computer: selectedKey.slice(0, selectedKey.indexOf(':')),
              session: selectedKey.slice(selectedKey.indexOf(':') + 1),
            }
          : undefined
      const named = selectedSession
        ? { computer: selectedSession.computerId, session: selectedSession.id }
        : unresolved
      const namedKey = selectedSession
        ? sessionKey(selectedSession)
        : selectedKey
      const pendingFile =
        locationKnowledgeTarget &&
        locationKnowledgeTarget.key === namedKey
          ? locationKnowledgeTarget.file
          : undefined
      const openFile =
        knowledgeViewOwnerKey.current === namedKey
          ? knowledgeFile?.path
          : undefined
      const file =
        knowledgeMode === 'hidden' ? undefined : pendingFile || openFile
      const next = named
        ? `${window.location.pathname}?${new URLSearchParams(
            {
              ...named,
              ...(file ? { file } : {}),
            },
          ).toString()}`
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
  }, [
    knowledgeFile?.path,
    knowledgeMode,
    loading,
    locationKnowledgeTarget,
    selectedKey,
    sessions,
  ])

  useEffect(() => {
    const followHistory = () => {
      const target = readSelectionFromLocation()
      historyIntentRef.current = 'replace'
      if (!target.selection) {
        setLocationKnowledgeTarget(undefined)
        // An entry that names no session cannot select one, so the address is
        // brought back in step with what is actually open.
        syncSelectionAddressRef.current()
        return
      }
      // Going back to a session that has since been cleared should open what
      // it became rather than nothing.
      const key = followReplacementsRef.current(target.selection)
      if (target.file) {
        setLocationKnowledgeTarget({ key, file: target.file })
        knowledgeRequest.current += 1
        const binding = sessionKnowledgeRootRef.current.binding
        const restoreCurrentSession = Boolean(
          key === selectedKeyStateRef.current &&
          binding?.rootId &&
          binding.available &&
          sessionKey({
            computerId: binding.computerId,
            id: binding.sessionId,
          }) === key,
        )
        knowledgePendingScrollKey.current = key
        knowledgeRestoreStartedKey.current = restoreCurrentSession
          ? key
          : undefined
        knowledgeRestoredKey.current = undefined
        knowledgeViewOwnerKey.current = restoreCurrentSession ? key : undefined
        setKnowledgeLoading(false)
        setKnowledgeFile(undefined)
        setKnowledgeFragment(undefined)
        setKnowledgeModeState(knowledgeOpenModeRef.current)
        if (restoreCurrentSession && binding?.rootId) {
          restoreKnowledgeRef.current(
            {
              rootId: binding.rootId,
              path: knowledgeFolderForFile(target.file),
              file: target.file,
            },
            key,
            false,
          )
        }
      } else {
        setLocationKnowledgeTarget(undefined)
        // A read that has not landed yet still counts as a reader to close.
        // Waiting for a rendered file would let the read arrive afterwards
        // and reopen the document the reader just went back from, so the
        // generation is retired here as well: a restore is in flight while it
        // owns this key, and any file read while `knowledgeLoading` is set.
        const readPending =
          knowledgeRestoreStartedKey.current === key ||
          knowledgeLoadingRef.current
        if (
          key === selectedKeyStateRef.current &&
          (knowledgeFileStateRef.current || readPending)
        ) {
          knowledgeRequest.current += 1
          knowledgePendingScrollKey.current = undefined
          knowledgeRestoreStartedKey.current = undefined
          knowledgeRestoredKey.current = key
          knowledgeViewOwnerKey.current = key
          setKnowledgeLoading(false)
          setKnowledgeFile(undefined)
          setKnowledgeFragment(undefined)
        }
      }
      setSelectedKey(key)
    }
    window.addEventListener('popstate', followHistory)
    return () => window.removeEventListener('popstate', followHistory)
  }, [])

  // Refreshed after every render so the shortcut always sees current state.
  useEffect(() => {
    // Bound to the window rather than the shell: closing a panel moves focus
    // back to the body, and the next shortcut must still work from there.
    appShortcutRef.current = (event: globalThis.KeyboardEvent) => {
      // Escape puts away whatever is on top. Before the guards below, because
      // an open dialog is exactly when this is wanted, and it has to work from
      // a field inside that dialog as much as from anywhere else.
      //
      // `defaultPrevented` is still respected: a menu or an unfinished edit
      // that has already answered Escape has said so that way, and closing the
      // panel around it as well would put two things away at one press.
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !event.isComposing
      ) {
        if (closeTopmostLayer(event.target)) {
          event.preventDefault()
        }
        return
      }
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.getModifierState('AltGraph') ||
        document.querySelector('.dialog[aria-modal="true"], [role="alertdialog"]') ||
        hasBlockingUi
      ) {
        return
      }
      // Which shortcut this is, asked of the list the reader can see and
      // change, rather than of keys written into this handler.
      const pressed = shortcuts.find((entry) =>
        bindingMatches(event, entry.binding),
      )
      if (!pressed) {
        return
      }
      if (pressed.id === 'toggleOracle') {
        if (!oracleIndicator.available) return
        const sessionComposer = composerRef.current
        const oracleComposer =
          event.target instanceof HTMLTextAreaElement &&
          event.target.getAttribute('aria-label') === 'Message Oracle'
        const fromSessionComposer = event.target === sessionComposer
        if (
          isEditableTarget(event.target) &&
          !fromSessionComposer &&
          !oracleComposer
        ) {
          return
        }
        event.preventDefault()
        if (oracleOpen && effectiveOraclePlacement === 'docked') {
          if (oracleComposer) {
            if (!focusActiveSessionComposer()) setOracleOpen(false)
          }
          else if (fromSessionComposer) oracleControlRef.current?.focusComposer()
          else {
            setOracleOpen(false)
            focusActiveSessionComposer()
          }
          return
        }
        if (oracleOpen) {
          setOracleOpen(false)
          focusActiveSessionComposer()
        } else {
          setOracleFocusRequest((request) => request + 1)
          setOracleOpen(true)
        }
        return
      }
      if (pressed.id === 'toggleOracleDock') {
        if (!oracleIndicator.available || !oracleOpen) return
        const sessionComposer = composerRef.current
        const oracleComposer =
          event.target instanceof HTMLTextAreaElement &&
          event.target.getAttribute('aria-label') === 'Message Oracle'
        const fromSessionComposer = event.target === sessionComposer
        if (
          isEditableTarget(event.target) &&
          !fromSessionComposer &&
          !oracleComposer
        ) {
          return
        }
        event.preventDefault()
        const nextPlacement =
          oraclePlacement === 'docked' ? 'overlay' : 'docked'
        changeOraclePlacement(nextPlacement)
        const nextEffectivePlacement =
          nextPlacement === 'docked' && oracleDockAvailable
            ? 'docked'
            : 'overlay'
        if (nextEffectivePlacement === 'overlay' && fromSessionComposer) {
          setOracleFocusRequest((request) => request + 1)
        }
        return
      }
      if (isEditableTarget(event.target)) {
        return
      }
      event.preventDefault()
      switch (pressed.id) {
        case 'nextSession':
          stepSession(1)
          return
        case 'previousSession':
          stepSession(-1)
          return
        case 'toggleKnowledge':
          toggleKnowledgePanel()
          return
        case 'expandKnowledge':
          toggleKnowledgeExpanded()
          return
        // The status line is the usual way in, but it is a display preference
        // and can be turned off while background tasks keep running, so the
        // panel needs a way in that does not depend on what is on screen.
        case 'backgroundTasks':
          openBackgroundTasks()
          return
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
    writeStored(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify(knowledgePositions),
    )
  }, [knowledgePositions])

  // What is being typed has changed, so the menu is offering something else
  // and is worth seeing again.
  useEffect(() => {
    setCommandMenuDismissed(false)
  }, [commandQuery, selectedKey])

  useEffect(() => {
    writeStored(
      shortcutsStorageKey,
      JSON.stringify(shortcutOverrides),
    )
  }, [shortcutOverrides])

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
      !sessionRootReady ||
      sessionRootUnavailable ||
      (hasSelectedSession && activeRootId !== expectedKnowledgeRootId) ||
      knowledgeRestoredKey.current !== selectedKey
    ) {
      return
    }
    setKnowledgePositions((current) => {
      const existing = current[selectedKey]
      const next: KnowledgePosition = {
        rootId: activeRootId,
        ...(sessionKnowledgeBasePath === knowledgeRootPath
          ? {}
          : { rootPath: sessionKnowledgeBasePath }),
        path: knowledgePath,
        file: knowledgeFile?.path,
      }
      return existing &&
        existing.rootId === next.rootId &&
        normalizeKnowledgeRelativePath(existing.rootPath) ===
          sessionKnowledgeBasePath &&
        existing.path === next.path &&
        existing.file === next.file
        ? current
        : { ...current, [selectedKey]: next }
    })
  }, [
    activeRootId, expectedKnowledgeRootId, knowledgeFile?.path, knowledgePath,
    hasSelectedSession, selectedKey, sessionKnowledgeBasePath,
    sessionRootReady, sessionRootUnavailable,
  ])

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
          knowledgeTreeVisible(node) &&
          key === knowledgePanelKey
        ) {
          node.scrollTop = remembered
        }
      })
    }
    forgetKnowledgeSessionRef.current = forgetKnowledgeSession
    moveKnowledgeSessionRef.current = moveKnowledgePosition
    migrateSessionStateRef.current = migrateSessionState
    restoreFailedPromptRef.current = restoreFailedPrompt
    followReplacementsRef.current = followReplacements
    loadKnowledgeFolderRef.current = loadKnowledgeFolder
    restoreKnowledgeRef.current = (position, key, sameViewOwner) => {
      const rootId = position.rootId
      if (!rootId) {
        return
      }
      const token = ++knowledgeRequest.current
      const current = () => token === knowledgeRequest.current
      void (async () => {
        try {
          // A file handoff hides the phone reader, not its document. Rebuilding
          // an unchanged view would discard its scroll, anchor and raw mode.
          if (
            sameViewOwner &&
            activeRootId === rootId &&
            knowledgePath === (position.path || knowledgeRootPath) &&
            knowledgeFile?.path === position.file &&
            knowledgeFile
          ) {
            if (
              !(await reloadKnowledgeFile(
                rootId,
                knowledgeFile.path,
                token,
              ))
            ) {
              return
            }
            applyKnowledgeScrollRef.current(key)
            return
          }
          const switchedRoot = rootId !== activeRootId
          let loadedRoot: KnowledgeFolders | undefined
          if (switchedRoot) {
            loadedRoot = await selectRoot(rootId, true)
            if (!loadedRoot) return
          } else if (
            // The root is already active, but its listing may be missing or
            // have failed, and skipping every loader would call that restored.
            !knowledgeFolders[knowledgeRootPath]?.listing
          ) {
            const listing = await loadKnowledgeFolder(rootId, knowledgeRootPath)
            if (!listing) return
            loadedRoot = { ...knowledgeFolders, [knowledgeRootPath]: { listing, loading: false } }
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
              // Use the listings fetched for this root, never the old closure's
              // cache. An empty override would fetch the new root twice.
              loadedRoot,
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
      loading ||
      !activeRootId ||
      (hasSelectedSession && (!sessionRootReady || sessionRootUnavailable || activeRootId !== expectedKnowledgeRootId)) ||
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
  }, [
    activeRootId, expectedKnowledgeRootId, knowledgeFolders, knowledgeMode, loading,
    hasSelectedSession, selectedKey, sessionRootReady, sessionRootUnavailable,
  ])

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
      knowledgeRestoredKey.current = undefined
      setKnowledgeLoading(false)
      setKnowledgeFile(undefined)
      setKnowledgeFragment(undefined)
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
    // Owner changes were cancelled by the layout effect. Wait for this
    // session's metadata only while open; closing must still reset a restore.
    if (hasSelectedSession && knowledgeMode !== 'hidden' && !sessionRootReady) return
    const position = selectedKey ? resolvedKnowledgePosition : undefined
    const action = knowledgeRestoreAction({
      selectedKey,

      panelOpen: knowledgeMode !== 'hidden',
      rootsLoaded: roots.length > 0,
      remembered: position,
      rememberedRootExists: !sessionRootUnavailable && roots.some((root) => root.id === position?.rootId),
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
    const sameViewOwner = knowledgeViewOwnerKey.current === action.key
    if (!sameViewOwner) {
      // Whatever is on screen belongs to another session, so it goes before
      // this one's content arrives — and stays gone if the remembered
      // position names no document.
      setKnowledgeFile(undefined)
    }
    knowledgeViewOwnerKey.current = action.key
    setKnowledgeLoading(false)
    restoreKnowledgeRef.current(action.position, action.key, sameViewOwner)
  }, [
    knowledgeMode, hasSelectedSession, selectedKey, roots,
    resolvedKnowledgePosition, sessionRootReady, sessionRootUnavailable,
  ])

  useEffect(() => {
    if (
      !locationKnowledgeTarget ||
      locationKnowledgeTarget.key !== selectedKey ||
      knowledgeViewOwnerKey.current !== selectedKey ||
      knowledgeRestoredKey.current !== selectedKey ||
      knowledgeFile?.path !== locationKnowledgeTarget.file
    ) {
      return
    }
    setLocationKnowledgeTarget((current) =>
      current?.key === locationKnowledgeTarget.key &&
      current.file === locationKnowledgeTarget.file
        ? undefined
        : current,
    )
  }, [knowledgeFile?.path, locationKnowledgeTarget, selectedKey])

  // Reopening the panel puts the tree back where it was left, so switching
  // between a session and its files does not lose the reader's place.
  useLayoutEffect(() => {
    const node = knowledgeTreeRef.current
    const key = knowledgePanelKey
    if (!node || knowledgeMode === 'hidden' || !knowledgeTreeVisible(node)) {
      return
    }
    const remembered = knowledgeScrollTops.current[key]
    if (remembered !== undefined) {
      node.scrollTop = remembered
      // The tree grows as folders finish loading, so the offset is applied
      // again once that layout settles.
      requestAnimationFrame(() => {
        if (knowledgeTreeVisible(node)) {
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
        knowledgeTreeVisible(node) &&
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
  }, [knowledgeMode, knowledgePanelKey, sidebarOpen, sidebarView])


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
    clearStored('agentic-remote:knowledge-position')
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

  const loadKnowledgeRoots = useCallback(async () => {
    const request = ++knowledgeCatalogRequest.current
    const lifetimes = new Map(knowledgeComputerLifetimes.current)
    const before = new Map(rootsRef.current.map((root) => [root.id, root]))
    let loaded: KnowledgeRoot[]
    try {
      loaded = await listKnowledgeRoots()
    } catch (caught) {
      if (request !== knowledgeCatalogRequest.current) return
      throw caught
    }
    if (request !== knowledgeCatalogRequest.current) return
    const live = loaded.filter((root) =>
      !forgottenComputers.current.has(root.computerId) &&
      !removedKnowledgeRoots.current.has(root.id) &&
      (lifetimes.get(root.computerId) || 0) ===
        (knowledgeComputerLifetimes.current.get(root.computerId) || 0))
    // Bindings and local additions can teach us a root while this snapshot is
    // in flight. Keep those newer entries, but never revive a known removal.
    const changed = rootsRef.current.filter((root) => before.get(root.id) !== root)
    const changedIds = new Set(changed.map((root) => root.id))
    const liveIds = new Set(live.map((root) => root.id))
    for (const id of before.keys()) {
      if (!liveIds.has(id) && !changedIds.has(id)) markKnowledgeRootRemoved(id)
    }
    const reconciled = [...changed, ...live.filter((root) => !changedIds.has(root.id))]
    setRoots(reconciled)
    setKnowledgeRootsLoaded(true)
    if (!knowledgeHydrated.current && !selectedKeyStateRef.current) {
      const root = reconciled.find((entry) => entry.id === restoredKnowledge.current.rootId) || reconciled[0]
      setActiveRootId(root?.id)
    }
    knowledgeHydrated.current = true
  }, [markKnowledgeRootRemoved, setRoots])

  useEffect(() => {
    void loadKnowledgeRoots().catch((caught: unknown) =>
      setError(caught instanceof Error ? caught.message : String(caught)))
    return () => { knowledgeCatalogRequest.current += 1 }
  }, [loadKnowledgeRoots])

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
    if (computers.length === 0) {
      return
    }
    // Only append what this browser can see. Pruning belongs to the hub, which
    // is told when a session is actually deleted: a listing that is filtered,
    // still loading, or missing an offline computer's sessions is not evidence
    // that anything was removed, and dropping keys here would delete another
    // device's arrangement.
    setSessionOrder((current) => {
      const next = { ...current }
      let changed = false
      for (const computer of computers) {
        const existing = next[computer.id] || []
        const missing = sessions
          .filter((session) => session.computerId === computer.id)
          .map(sessionKey)
          .filter((key) => !existing.includes(key))
        if (missing.length === 0) continue
        next[computer.id] = [...existing, ...missing]
        changed = true
      }
      return changed ? next : current
    })
  }, [computers, sessions])

  // The hub is the source of truth for the session order, so nothing writes
  // agentic-remote:session-order any more. The existing value is read once at
  // startup and offered to an empty hub as a bootstrap.
  const syncSessionOrder = useCallback(async () => {
    try {
      let snapshot = await fetchSessionOrder()
      // Discovery appends on its own, so a non-empty hub order is not proof a
      // migration ran; the hub reports whether it ever took one.
      if (!snapshot.bootstrapped) {
        const legacy = readStoredOrder<Record<string, string[]>>(
          'agentic-remote:session-order',
          {},
        )
        if (Object.keys(legacy).length > 0) {
          snapshot = await bootstrapSessionOrder(legacy)
        }
      }
      applySessionOrderSnapshot(snapshot)
    } catch {
      // Rendering falls back to the order this browser already held. The next
      // committed change or reconnect replaces it.
    }
  }, [applySessionOrderSnapshot])
  const syncSessionOrderRef = useRef(syncSessionOrder)
  syncSessionOrderRef.current = syncSessionOrder

  useEffect(() => {
    void syncSessionOrder()
  }, [syncSessionOrder])

  // Reading the session on screen. Opening it, coming back to the app with it
  // open, or its turn ending while you watch each leave an intent to read it;
  // settling that intent is what tells the hub. Oracle's reads and anything
  // else in the background never get here.
  requestReadRef.current = (key) => {
    if (document.visibilityState !== 'visible') return
    readIntentRef.current = { key, until: Date.now() + READ_INTENT_MS }
    settleReadIntentRef.current()
  }
  settleReadIntentRef.current = () => {
    // A hold only keeps an unread mark you made. Once the hub shows none --
    // the save was refused, or another device read it -- there is nothing
    // left to keep, and the open session is read as usual again.
    const held = unreadHoldRef.current
    if (held && !unreadSavesRef.current.has(held) && !unreadSessionKeysRef.current.has(held)) {
      unreadHoldRef.current = undefined
    }
    const intent = readIntentRef.current
    if (!intent) return
    const open = selectedRef.current
    if (Date.now() > intent.until || (open && sessionKey(open) !== intent.key)) {
      readIntentRef.current = undefined
      return
    }
    if (
      !open ||
      document.visibilityState !== 'visible' ||
      unreadHoldRef.current === intent.key ||
      // A save in flight settles this again once the hub answers it.
      unreadSavesRef.current.has(intent.key) ||
      !unreadSessionKeysRef.current.has(intent.key)
    ) return
    readIntentRef.current = undefined
    changeSessionUnread(open, false, false)
  }
  useEffect(() => {
    // Opening another session ends the hold on the last one.
    unreadHoldRef.current = undefined
    readIntentRef.current = undefined
    if (selectedKey) requestReadRef.current(selectedKey)
  }, [selectedKey])
  const selectedTurnRef = useRef<{ key?: string; status?: SessionStatus }>({})
  useEffect(() => {
    const key = selected ? sessionKey(selected) : undefined
    const previous = selectedTurnRef.current.key === key
      ? selectedTurnRef.current.status
      : undefined
    selectedTurnRef.current = { key, status: selected?.status }
    if (key && selected && turnEnded(previous, selected)) requestReadRef.current(key)
    // Otherwise the open session may only now have arrived for an intent.
    else settleReadIntentRef.current()
  }, [selected])
  useEffect(() => {
    const returned = () => {
      if (document.visibilityState !== 'visible') return
      unreadHoldRef.current = undefined
      const key = selectedKeyStateRef.current
      if (key) requestReadRef.current(key)
    }
    document.addEventListener('visibilitychange', returned)
    return () => document.removeEventListener('visibilitychange', returned)
  }, [])

  function durableComposerDraft(key: string, draft: ComposerDraft): ComposerDraft {
    const history = composerHistoryRef.current[key]
    return history
      ? { ...draft, text: history.draft, pastes: history.draftPastes }
      : draft
  }

  function persistComposerDrafts(drafts: ComposerDrafts): ComposerPersistenceResult {
    if (composerInitialReadFailure.current) {
      return { ok: false, error: composerInitialReadFailure.current }
    }
    try {
      // Admission and receipts must fail visibly, unlike best-effort settings.
      const snapshot = readComposerStorageSnapshot()
      let receipts = snapshot.receipts
      composerAcceptanceReceipts.current = [...receipts]
      if (receipts.length > 0) {
        receipts = receipts.filter((receipt) =>
          Object.entries(snapshot.drafts).some(([key, draft]) =>
            draft?.pendingSubmission &&
            hasComposerAcceptanceReceipt([receipt], key, draft.pendingSubmission),
          ),
        )
      }
      for (const [key, draft] of [
        ...Object.entries(composerDraftsRef.current),
        ...Object.entries(drafts),
      ]) {
        const pending = draft.pendingSubmission
        if (!pending?.accepted) {
          continue
        }
        // A preview has no acknowledgement: its hidden recovery still owns
        // that token. An accepted recovery detaches it even if storage fails.
        const acknowledged = pending.acknowledgesFailure
        if (acknowledged !== undefined) {
          if (restoredFailures.current.get(key) === acknowledged) {
            restoredFailures.current.delete(key)
          }
          if (restoredDraftStamps.current[key] === acknowledged) {
            const { [key]: _stamp, ...stamps } = restoredDraftStamps.current
            const { [key]: _content, ...contents } = restoredDraftContents.current
            restoredDraftStamps.current = stamps
            restoredDraftContents.current = contents
            composerRecoveryStorageDirty.current = true
          }
        }
        if (!hasComposerAcceptanceReceipt(receipts, key, pending)) {
          if (receipts.length >= composerAcceptanceReceiptLimit) {
            throw new Error('Browser acceptance receipt storage is full; keep this tab open')
          }
          receipts.push({ key: pending.originKey || key, id: pending.id })
        }
      }
      // The existing generation marker remains non-null and is still "1"
      // when empty. Receipts contain only bounded identities, never payloads.
      if (receipts.length > composerAcceptanceReceiptLimit) {
        throw new Error('Browser acceptance receipt storage is full; keep this tab open')
      }
      localStorage.setItem(
        composerDraftsGenerationKey,
        receipts.length > 0 ? JSON.stringify({ version: 1, accepted: receipts }) : '1',
      )
      composerAcceptanceReceipts.current = receipts
      if (composerRecoveryStorageDirty.current) {
        localStorage.setItem(
          'agentic-remote:composer-draft-failures',
          JSON.stringify(restoredDraftStamps.current),
        )
        localStorage.setItem(
          'agentic-remote:composer-draft-recovered',
          JSON.stringify(restoredDraftContents.current),
        )
        composerRecoveryStorageDirty.current = false
      }
      const durable = reconcileAcceptedComposerDrafts(
        Object.fromEntries(
          Object.entries(drafts).map(([key, draft]) => [
            key,
            durableComposerDraft(key, draft),
          ]),
        ),
        receipts,
        true,
      )
      const legacy = JSON.stringify(
        Object.fromEntries(
          Object.entries(durable).map(([key, draft]) => {
            const recoverable = recoverPendingComposerDraft(draft)
            return [key, expandComposerPastes(recoverable.text, recoverable.pastes)]
          }),
        ),
      )
      // Install new ownership before exposing its compatibility text, and
      // retire old ownership only after the old text has been removed.
      for (const [storageKey, pendingOnly] of [
        [queuedEditsStorageKey, false],
        [queuedDispatchPendingStorageKey, true],
      ] as const) {
        const savedOwners = storageKey === queuedEditsStorageKey
          ? snapshot.queuedEdits
          : snapshot.queuedDispatches
        writeQueuedEditOwners(storageKey, {
          ...savedOwners,
          ...queuedEditOwners(composerDraftsRef.current, pendingOnly),
          ...queuedEditOwners(drafts, pendingOnly),
        })
      }
      // During retirement, keep the pending identity in v2 until its legacy
      // copy is clean. Otherwise a failed legacy write would resurrect an
      // accepted payload with no pending identity left to match to its receipt.
      if (receipts.length > 0) {
        localStorage.setItem('agentic-remote:composer-drafts', legacy)
        localStorage.setItem(composerDraftsStorageKey, JSON.stringify(durable))
      } else {
        localStorage.setItem(composerDraftsStorageKey, JSON.stringify(durable))
        localStorage.setItem('agentic-remote:composer-drafts', legacy)
      }
      writeQueuedEditOwners(queuedEditsStorageKey, queuedEditOwners(durable))
      writeQueuedEditOwners(queuedDispatchPendingStorageKey, queuedEditOwners(durable, true))
      const unresolved = Object.fromEntries(
        Object.entries(durable)
          .filter(([, draft]) => draft.unresolvedPastes?.length)
          .map(([key, draft]) => [
            key,
            draft.unresolvedPastes!.map((paste) => ({
              ...paste,
              unresolved: true,
            })),
          ]),
      )
      // Keep unresolved copies readable by older builds, but retire only
      // copies the user has explicitly inserted or discarded.
      if (Object.keys(unresolved).length > 0) {
        localStorage.setItem(
          'agentic-remote:composer-pastes',
          JSON.stringify(unresolved),
        )
      } else {
        localStorage.removeItem('agentic-remote:composer-pastes')
      }
      return { ok: true }
    } catch (caught) {
      if (caught instanceof ComposerStorageFormatError) {
        composerInitialReadFailure.current = composerReadFailureMessage(caught)
        return { ok: false, error: composerInitialReadFailure.current }
      }
      return {
        ok: false,
        error: caught instanceof Error
          ? `${caught.name}: ${caught.message}`
          : String(caught),
      }
    }
  }

  function reportComposerStorageFailure(
    error: string,
    admissionBlocked = false,
    originalRestored = false,
  ) {
    setComposerStorageError(
      `${admissionBlocked ? 'Message was not sent. ' : ''}` +
      `Draft changes could not be saved (${error}). ` +
      (originalRestored
        ? 'Your original draft is still editable. Retry sending when storage is available.'
        : 'Your text is still editable. Keep this page open and copy it before reloading; the saved copy may be out of date.'),
    )
  }

  useEffect(() => {
    composerMounted.current = true
    updateComposerDrafts([], (current) => ({ ...current }))
    return () => { composerMounted.current = false }
  }, [])

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
    // The first load takes a generation like every other refresh: the socket
    // opening starts one of its own, and without this the slower of the two
    // applies last and reinstates whatever the newer one already replaced.
    const asked = ++snapshotGeneration.current
    const startedAtSequence = eventSequenceRef.current
    void Promise.all([listSessionListing(), listComputers()])
      .then(([listing, loadedComputers]) => {
        if (!active) {
          return
        }
        setSessionLoadError(undefined)
        // Overtaken as a whole is not overtaken for every computer. A refresh
        // that came back first without reaching a node has said nothing about
        // it, and discarding this answer threw away the only word anyone had
        // -- the returning client's own sessions, on first load.
        const mine = listing.answeredComputerIds.filter(
          (id) => asked > (computerSnapshotApplied.current.get(id) || 0),
        )
        if (asked <= snapshotApplied.current && !mine.length) {
          return
        }
        const whole = asked > snapshotApplied.current
        if (whole) {
          snapshotApplied.current = asked
        }
        const loadedSessions = listing.sessions
        latestListing.current = Math.max(latestListing.current, asked)
        for (const id of listing.answeredComputerIds) {
          if (asked > (authoritativeNow.current.get(id) || 0)) {
            authoritativeNow.current.set(id, asked)
          }
        }
        for (const id of mine) {
          computerSnapshotApplied.current.set(id, asked)
        }
        if (!whole) {
          // Only the computers nobody newer reached.
          const speaksFor = new Set(mine)
          const merge = (current: ManagedSession[]) => {
            let merged = current
            for (const session of loadedSessions) {
              if (speaksFor.has(session.computerId)) {
                merged = upsertSession(merged, session)
              }
            }
            return merged
          }
          const merged = merge(sessionsRef.current)
          sessionsRef.current = merged
          setSessions(merge)
          recordReplacementLinks(loadedSessions)
          claimReplacedSessions(merged)
          return
        }
        // Events that arrived while this was in flight describe those sessions
        // more recently than it does. A session cleared again in that window
        // is only still here because the answer predates its removal, and
        // following its lineage would move state into a session that is
        // already gone, where its own replacement never looks.
        const reconcile = (existingSessions: ManagedSession[]) => {
          let reconciled = sortSessions(
            carrySnapshotTranscripts(loadedSessions, existingSessions).filter(
              (session) =>
                (sessionEventSequenceRef.current.get(sessionKey(session)) ||
                  0) <= startedAtSequence &&
                (computerEventSequenceRef.current.get(session.computerId) ||
                  0) <= startedAtSequence,
            ),
          )
          for (const existing of existingSessions) {
            reconciled = upsertSession(reconciled, existing)
          }
          return reconciled
        }
        const reconciled = reconcile(sessionsRef.current)
        setSessions(reconcile)
        // Every session the response named, including the ones reconciliation
        // rejected. A session that was cleared again while this was in flight
        // is dropped from the list, but what it replaced is still true, and
        // without it a deep link to its ancestor has no way through.
        recordReplacementLinks(loadedSessions)
        claimReplacedSessions(reconciled)
        applyComputerSnapshot(loadedComputers, startedAtSequence, asked)
        // A live removal can arrive before this list does, so the address may
        // name a session that has already been replaced, possibly more than
        // once. Falling through to `sessions[0]` would open something the
        // reader never asked for.
        // Resolved and looked for in the reconciled list, not the response.
        // A clear announced while this request was in flight leaves the
        // replacement out of the response entirely, and searching the stale
        // list finds nothing and falls through to an unrelated conversation.
        applyInitialSelection(
          reconciled,
          new Set(listing.answeredComputerIds),
        )
      })
      .catch((caught: unknown) => {
        if (active) {
          setSessionLoadError(
            caught instanceof Error ? caught.message : String(caught),
          )
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
  }, [sessionLoadAttempt, upsertSession])

  useEffect(() => {
    if (loading) {
      return
    }
    // An upsert can settle the pending ref before this render's fallback runs.
    // Its session membership must come from the same latest snapshot.
    setSelectedKey((current) =>
      current &&
      (sessionsRef.current.some((session) => sessionKey(session) === current) ||
        pendingReplacements.current.has(current) ||
        clearingSessions.current.has(current) ||
        // A refresh can briefly omit the session that owns an active
        // submission. Keep its identity selected until the response or live
        // upsert puts it back; choosing the first row here loses the message
        // and the work that follows it to the reader.
        ((submissionsInFlight.current.has(current) ||
          submissionAnchors.current.has(current)) &&
          !removedSessions.current.has(current)) ||
        // Its computer did not answer the most recent time it was asked, so
        // nobody has said this session is not there. Moving the reader off it
        // sends them somewhere they never asked for, and the session arriving
        // later only redirects a reader still sitting where the address put
        // them.
        //
        // The latest word, not whether the computer has ever spoken: one that
        // answered an hour ago and cannot be reached now is saying nothing
        // about a session announced in between.
        //
        // Unless it has been removed outright. A removal is somebody saying so
        // rather than a list failing to mention it, and holding the reader on
        // it left them looking at a blank conversation for good.
        ((authoritativeNow.current.get(
          current.slice(0, current.indexOf(':')),
        ) || 0) < latestListing.current &&
          !removedSessions.current.has(current)))
        ? current
        : fallbackSessionKey(sessionsRef.current, closingSessionsRef.current),
    )
    // `selectedKey` is a dependency because history can name a session that
    // has since been deleted, and that has to fall back to a real one.
  }, [clearing, loading, selectedKey, sessions])

  useEffect(() => {
    if (loading) {
      return
    }
    for (const session of sessions) {
      void loadBackgroundTasks(session).catch(() => undefined)
    }
  }, [
    computers,
    loading,
    loadBackgroundTasks,
    sessions,
  ])

  useEffect(() => {
    if (!selectedComputerId || !selectedSessionId) {
      setCommands([])
      setCommandsKey(selectedKey)
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
  }, [selectedComputerId, selectedSessionId, upsertSession])

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
      setCommandsKey(selectedKey)
      return
    }
    if (selected?.suspended || selected?.interruption || selected?.archivedAt) {
      // A suspended session has no runtime to ask, and asking would start the
      // one that suspending put down. Only local read-only resource views are
      // offered until it is resumed.
      //
      // The flag is a dependency on purpose. Resuming is meant to bring the
      // session back the way reopening the CLI does, so the runtime coming up
      // on resume is the feature rather than a side effect of this read: the
      // list is only knowable from a live runtime, and a resumed session that
      // offered no commands until its first message would be the bug.
      setCommands(sessionResourceCommands)
      setCommandsKey(selectedKey)
      return
    }
    let active = true
    const catalogEpoch = commandCatalogEpoch.current
    void listCommands(selectedComputerId, selectedSessionId)
      .then((availableCommands) => {
        if (active) {
          const nativeCommands = availableCommands
            .filter((command) => !isSessionResourceCommandName(command.name))
            .map((command) => ({
              ...command,
              aliases: command.aliases?.filter((alias) => !isSessionResourceCommandName(alias)),
            }))
          setCommandsKey(selectedKey)
          setCommands([
            ...nativeCommands,
            ...webCommands.filter(
              (webCommand) =>
                (selected?.provider !== 'claude' || webCommand.name !== 'cwd') &&
                (webCommand.name !== 'ask' || selectedSupportsSideQuestions) &&
                !nativeCommands.some(
                  (command) => command.name === webCommand.name,
                ),
            ),
          ])
        }
      })
      .catch((caught) => {
        if (active && commandCatalogEpoch.current === catalogEpoch) {
          setCommands([])
          setCommandsKey(selectedKey)
          setError((current) =>
            current ?? (caught instanceof Error ? caught.message : String(caught)))
        }
      })
    return () => {
      active = false
    }
  }, [
    selected?.provider,
    selected?.suspended,
    selected?.interruption,
    selected?.archivedAt,
    selectedComputerId,
    selectedSessionId,
    selectedSupportsSideQuestions,
  ])

  useEffect(() => {
    setSelectedCommandIndex(0)
  }, [commandQuery])

  useEffect(() => {
    let socket: WebSocket | undefined
    let retry: number | undefined
    let stopped = false
    // Set while reconnects wait for the sign-in to be renewed.
    let paused = false
    let reconnectDelay = 1_000
    // From the page returning until a refresh gets through to the hub, refreshes
    // that cannot reach it are retried with backoff, whoever started them.
    let resumeSince: number | undefined
    let resumeRetry: number | undefined
    let resumeDelay = 1_000
    // The error this recovery showed; it only ever replaces nothing or itself.
    let resumeError: string | undefined
    const stopResumeRetry = () => {
      if (resumeRetry !== undefined) window.clearTimeout(resumeRetry)
      resumeRetry = undefined
      resumeDelay = 1_000
    }
    const showResumeError = (message: string) => {
      const previous = resumeError
      resumeError = message
      setError((current) => current === undefined || current === previous ? message : current)
    }
    const endResume = () => {
      stopResumeRetry()
      resumeSince = undefined
      resumeRecoveringRef.current = false
      if (resumeError === undefined) return
      const shown = resumeError
      resumeError = undefined
      // Only its own message: anything shown since is newer news.
      setError((current) => current === shown ? undefined : current)
    }

    const refreshSnapshot = async (
      onListingFailed?: (caught: unknown) => void,
    ): Promise<ManagedSession[]> => {
      // Refreshes overlap: a reconnect and a tab becoming visible can each
      // start one. Without a generation the slower response applies last and
      // reinstates whatever the newer one already replaced, including a
      // session that has since been cleared away.
      //
      // Numbered when asked for, applied only if nothing newer has already
      // landed. A refresh that fails never applies, so it cannot cancel a
      // load that succeeded, and one that stalls cannot overwrite an answer
      // that was asked for after it.
      const asked = ++snapshotGeneration.current
      // Authority is per computer, so being overtaken is too. A newer refresh
      // that could not reach a node has said nothing about it, and discarding
      // this answer wholesale threw away the only word anyone had -- a
      // replacement it had just discovered was never in the browser at all, so
      // reconciliation could not keep it either.
      const claimGeneration = (answeredIds: string[]) => {
        const mine = answeredIds.filter(
          (id) => asked > (computerSnapshotApplied.current.get(id) || 0),
        )
        latestListing.current = Math.max(latestListing.current, asked)
        for (const id of answeredIds) {
          if (asked > (authoritativeNow.current.get(id) || 0)) {
            authoritativeNow.current.set(id, asked)
          }
        }
        for (const id of mine) {
          computerSnapshotApplied.current.set(id, asked)
        }
        if (asked > snapshotApplied.current) {
          snapshotApplied.current = asked
          return { generation: asked, whole: true, speaksFor: new Set(mine) }
        }
        return { generation: asked, whole: false, speaksFor: new Set(mine) }
      }
      const startedAtSequence = eventSequenceRef.current
      const startedAtMuteRevision = muteRevisionRef.current
      const [listing, loadedComputers, pushSettings] = await Promise.all([
        listSessionListing(),
        listComputers(),
        getPushSettings().catch((caught: unknown) => {
          console.warn('Unable to refresh notification mute settings:', caught)
          return undefined
        }),
      ]).catch((caught: unknown) => {
        onListingFailed?.(caught)
        throw caught
      })
      setSessionLoadError(undefined)
      const claim = claimGeneration(listing.answeredComputerIds)
      if (!claim.whole && !claim.speaksFor.size) {
        // Overtaken, and it reached nothing the newer answer did not.
        return []
      }
      const generation = claim.generation
      const loadedSessions = listing.sessions
      const snapshotSessions = loadedSessions.filter(
        (session) =>
          (sessionEventSequenceRef.current.get(sessionKey(session)) || 0) <=
            startedAtSequence &&
          (computerEventSequenceRef.current.get(session.computerId) || 0) <=
            startedAtSequence,
      )
      const answeredFor = new Set(listing.answeredComputerIds)
      // Archived records are not listed. Only the one being read stays, and
      // only until its detail is checked below: a deletion event this browser
      // missed would otherwise leave it forever.
      const keepsArchivedSelection = (session: ManagedSession) =>
        Boolean(session.archivedAt) &&
        !removedSessions.current.has(sessionKey(session)) &&
        selectedRef.current !== undefined &&
        sessionKey(selectedRef.current) === sessionKey(session)
      if (!claim.whole) {
        // Only the computers this answer reached that the newer one did not.
        // Everything else in it has already been spoken for more recently.
        //
        // A proper reconciliation for those computers, not just an addition:
        // a session it does not list is one it looked for and did not find, so
        // leaving it in place kept a cleared conversation beside the one that
        // replaced it, with the draft and reading position still underneath it.
        const speaksForKeys = new Set(
          snapshotSessions
            .filter((session) => claim.speaksFor.has(session.computerId))
            .map((session) => sessionKey(session)),
        )
        const merge = (current: ManagedSession[]) => {
          let merged = current.filter(
            (session) => {
              const key = sessionKey(session)
              return (
                !claim.speaksFor.has(session.computerId) ||
                speaksForKeys.has(key) ||
                keepsArchivedSelection(session) ||
                (sessionEventSequenceRef.current.get(key) || 0) >
                  startedAtSequence ||
                ((submissionsInFlight.current.has(key) ||
                  submissionAnchors.current.has(key)) &&
                  !removedSessions.current.has(key))
              )
            },
          )
          for (const session of carrySnapshotTranscripts(snapshotSessions, current)) {
            if (claim.speaksFor.has(session.computerId)) {
              merged = upsertSession(merged, session)
            }
          }
          return merged
        }
        const merged = merge(sessionsRef.current)
        sessionsRef.current = merged
        setSessions(merge)
        const kept = new Set(merged.map((session) => sessionKey(session)))
        setSideQuestions(withoutSideQuestions((key) =>
          !kept.has(key) && claim.speaksFor.has(key.slice(0, key.indexOf(':')))))
        // What these sessions say they replaced is true whoever else answered.
        recordReplacementLinks(loadedSessions)
        claimReplacedSessions(merged)
        return merged
      }
      const reconcile = (existingSessions: ManagedSession[]) => {
        // Only rows from computers that were actually asked. A hub answers for
        // an unreachable node out of its own cache, and an in-flight node list
        // can refill that cache after a live removal, so a cached row here put
        // a cleared session back and gave stale lineage a say in selection.
        let reconciled = sortSessions(
          carrySnapshotTranscripts(snapshotSessions, existingSessions).filter(
            (session) => answeredFor.has(session.computerId),
          ),
        )
        for (const existing of existingSessions) {
          const changedAt =
            sessionEventSequenceRef.current.get(sessionKey(existing)) || 0
          // A computer that did not answer is not saying its sessions are
          // gone; nothing looked for them. Reading a cached answer as the
          // whole truth evicted sessions the browser already had, and after a
          // hub restart the cache is empty, so it removed all of them.
          if (
            changedAt > startedAtSequence ||
            keepsArchivedSelection(existing) ||
            !answeredFor.has(existing.computerId) ||
            ((submissionsInFlight.current.has(sessionKey(existing)) ||
              submissionAnchors.current.has(sessionKey(existing))) &&
              !removedSessions.current.has(sessionKey(existing)))
          ) {
            reconciled = upsertSession(reconciled, existing)
          }
        }
        return reconciled
      }
      setSessions(reconcile)
      // Lineage is followed from the sessions that survived reconciliation. A
      // snapshot session the refresh already rejected as stale may have been
      // replaced again while it was in flight, and moving state into it would
      // put it under a session that no longer exists, where the replacement
      // that took its place will never look for it. Worked out from the last
      // committed sessions rather than inside the updater, which React is free
      // to run whenever it likes.
      const reconciledForClaim = reconcile(sessionsRef.current)
      // A replacement confirmed by a snapshot is no longer pending, even if
      // its own arrival event was never seen. Left pending for good, selection
      // cleanup goes on treating it as expected and can leave nothing open.
      // A list can only speak for what it was asked after. A replacement
      // announced while this request was already in flight cannot be in the
      // answer, so its absence says nothing; one announced before it and
      // still missing has genuinely gone, and waiting for it forever leaves
      // selection treating it as on its way.
      const present = new Set(reconciledForClaim.map((s) => sessionKey(s)))
      setSideQuestions(withoutSideQuestions((key) =>
        !present.has(key) && answeredFor.has(key.slice(0, key.indexOf(':')))))
      // A hub answers for a paired computer out of its own cache when the node
      // does not reply, and says so alongside the list. Such an answer has not
      // looked at the node at all, so a replacement missing from it has not
      // been shown to be missing: settling on that let selection cleanup move
      // to an unrelated session, and the upsert that arrived afterwards had
      // nobody left to redirect. A computer that is merely offline is a
      // different thing from one whose list was never fetched, and the hub is
      // the only one that knows which happened.
      for (const key of [...pendingReplacements.current]) {
        const announcedAt = sessionEventSequenceRef.current.get(key) || 0
        if (present.has(key)) {
          pendingReplacements.current.delete(key)
          continue
        }
        const computerId = key.slice(0, key.indexOf(':'))
        if (announcedAt <= startedAtSequence && answeredFor.has(computerId)) {
          pendingReplacements.current.delete(key)
          settleAttachmentTargetWaiters(key, undefined)
        }
      }
      // As above: the links a rejected session carries are still the truth
      // about what it replaced, and they are what a deep link follows.
      recordReplacementLinks(loadedSessions)
      // The silences this answer captured go in before the lineage is claimed.
      // Claiming first meant migration read a list that did not yet hold the
      // ancestor's mute, marked it adopted without moving it, and the settings
      // were then installed under a session that had already been replaced --
      // the replacement left unmuted, notifying on a conversation the reader
      // had silenced.
      if (pushSettings) {
        applyMutedSessions(pushSettings.mutedSessions, startedAtMuteRevision)
      }
      claimReplacedSessions(reconciledForClaim)
      // Whichever load arrives first is the one that has to answer the
      // address. The socket opening starts a refresh of its own, and when it
      // overtakes the first list — likely, because that request waits on
      // paired nodes — the startup path is discarded as stale and the deep
      // link the reader followed is replaced by whichever session sorts
      // first. Selection is only set when nothing has been chosen yet, so
      // this never moves a reader who is already somewhere.
      applyInitialSelection(reconciledForClaim, answeredFor)
      applyComputerSnapshot(loadedComputers, startedAtSequence, asked)
      // A session that changed while the refresh was in flight is described
      // more recently by the event than by the snapshot, exactly as the two
      // reconciliations above assume. A clear moves the mute to a replacement
      // the snapshot has never heard of, so the snapshot must not speak for
      // either session.
      const changedSinceRefresh = (key: string) =>
        (sessionEventSequenceRef.current.get(key) || 0) > startedAtSequence
      const selectedAtRefresh = selectedRef.current
      // A replacement selected while the refresh was in flight is missing
      // from the snapshot by definition, and dropping it would jump the
      // reader to an unrelated session.
      // Removed while this refresh ran (for example, its computer was found
      // unpaired by the snapshot above): it is gone, not newly changed.
      const selectedRemovedSinceRefresh = Boolean(selectedAtRefresh &&
        removedSessions.current.has(sessionKey(selectedAtRefresh)) &&
        changedSinceRefresh(sessionKey(selectedAtRefresh)))
      const selectedStillExists =
        selectedAtRefresh && !selectedRemovedSinceRefresh &&
        (snapshotSessions.some(
          (session) => sessionKey(session) === sessionKey(selectedAtRefresh),
        ) ||
          keepsArchivedSelection(selectedAtRefresh) ||
          changedSinceRefresh(sessionKey(selectedAtRefresh)) ||
          pendingReplacements.current.has(sessionKey(selectedAtRefresh)) ||
          // Its computer said nothing about it, so its absence is not news.
          // Reconciliation keeps it in the list for the same reason, and
          // moving the reader off a session that is still there is worse than
          // leaving them on one that has gone.
          !answeredFor.has(selectedAtRefresh.computerId))
      // The whole chain, not one step of it. A session cleared twice while the
      // selection was still catching up leaves the first link pointing at an
      // id that is itself gone, and selecting that opens nothing.
      const followedSelection = selectedAtRefresh
        ? followReplacements(sessionKey(selectedAtRefresh))
        : undefined
      if (
        selectedAtRefresh &&
        followedSelection &&
        followedSelection !== sessionKey(selectedAtRefresh)
      ) {
        // The session the reader was on was cleared, and its replacement is
        // already here. Falling through would look for a session that no
        // longer exists and then open an unrelated one.
        setSelectedKey(followedSelection)
      } else if (selectedAtRefresh && selectedStillExists) {
        const detailStartedAtSequence = eventSequenceRef.current
        let detail: ManagedSession
        try {
          detail = await getSession(
            selectedAtRefresh.computerId,
            selectedAtRefresh.id,
            undefined,
            { passive: true },
          )
        } catch (caught) {
          const goneKey = sessionKey(selectedAtRefresh)
          if (
            !(caught instanceof SubmissionError && caught.statusCode === 404) ||
            !selectedAtRefresh.archivedAt ||
            snapshotSessions.some((session) => sessionKey(session) === goneKey)
          ) {
            throw caught
          }
          if (
            generation < snapshotApplied.current ||
            (sessionEventSequenceRef.current.get(goneKey) || 0) > detailStartedAtSequence
          ) {
            return []
          }
          // The archived record was deleted and its removal event never
          // arrived here; the list and the detail now agree it is gone.
          removedSessions.current.add(goneKey)
          claimTombstone(goneKey)
          setSessions((current) => current.filter((session) => sessionKey(session) !== goneKey))
          if (selectedRef.current && sessionKey(selectedRef.current) === goneKey) {
            setSelectedKey(
              fallbackSessionKey(snapshotSessions, closingSessionsRef.current),
            )
          }
          return reconciledForClaim.filter((session) => sessionKey(session) !== goneKey)
        }
        const detailKey = sessionKey(detail)
        if (generation < snapshotApplied.current) {
          // Checked again here, not only before the request: a newer refresh
          // starting while this was in flight has already spoken, and putting
          // this answer in would bring back a session it removed.
          return []
        }
        if (
          (sessionEventSequenceRef.current.get(detailKey) || 0) >
          detailStartedAtSequence
        ) {
          // The socket has the newer selected-session detail, but this list is
          // still the authoritative set whose background tasks need refresh.
          return reconciledForClaim
        }
        setSessions((current) => upsertSession(current, detail))
      } else if (
        selectedAtRefresh &&
        !clearingSessions.current.has(sessionKey(selectedAtRefresh)) &&
        !pendingReplacements.current.has(sessionKey(selectedAtRefresh)) &&
        !replacedInto.current.has(sessionKey(selectedAtRefresh)) &&
        // The refresh may be older than the response for a submission that is
        // still in flight. Keep the identity anchored until that response or
        // its live upsert restores the row.
        !(
          (submissionsInFlight.current.has(sessionKey(selectedAtRefresh)) ||
            submissionAnchors.current.has(sessionKey(selectedAtRefresh))) &&
          !removedSessions.current.has(sessionKey(selectedAtRefresh))
        )
      ) {
        setSelectedKey(
          fallbackSessionKey(snapshotSessions, closingSessionsRef.current),
        )
      }
      return reconciledForClaim
    }

    // Only the listing failing is a failure to load sessions. The selected
    // session's detail, Oracle and Dreamer only leave the data stale; Oracle
    // and Dreamer also report their own failures.
    const refreshAllAuthoritativeState = async (
      onSessionListFailed?: (message: string, caught: unknown) => void,
    ) => {
      const generation = authoritativeRefreshGeneration.current + 1
      authoritativeRefreshGeneration.current = generation
      setRefreshState('refreshing')
      setRefreshMessage(undefined)
      // Beside the snapshot, not part of it: an unreadable list of closed
      // sessions must not mark the open ones stale.
      void recentlyClosedRef.current.refresh()
      try {
        const settled = await Promise.allSettled([
          refreshSnapshot((caught) => {
            if (authoritativeRefreshGeneration.current === generation) {
              onSessionListFailed?.(
                caught instanceof Error ? caught.message : String(caught),
                caught,
              )
            }
          }).then((refreshedSessions) =>
            Promise.all(refreshedSessions.map((session) =>
              loadBackgroundTasks(session, true)))),
          dispatchAuthoritativeRefresh(),
        ])
        const failed = settled.find(
          (result): result is PromiseRejectedResult =>
            result.status === 'rejected',
        )
        if (failed) throw failed.reason
        if (authoritativeRefreshGeneration.current === generation) {
          setRefreshState('fresh')
          endResume()
        }
      } catch (caught) {
        if (authoritativeRefreshGeneration.current !== generation) return
        const message = caught instanceof Error ? caught.message : String(caught)
        const unreachable = isHubUnreachable(caught)
        setRefreshState('stale')
        if (unreachable && resumeSince !== undefined) {
          setRefreshMessage(HUB_RECONNECTING_MESSAGE)
          continueResume()
        } else {
          setRefreshMessage(message)
          // The hub answered, so it is reachable again.
          if (!unreachable) endResume()
        }
        throw caught
      }
    }
    authoritativeRefreshRef.current = refreshAllAuthoritativeState
    const handleCoordinatedAuthoritativeRefresh = (event: Event) => {
      waitUntilAuthoritativeRefresh(event, refreshAllAuthoritativeState())
    }

    const connect = () => {
      // The gateway would turn every attempt away until the sign-in is renewed.
      if (hubSignInExpired()) {
        paused = true
        return
      }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      // Asks to be sent what changed in a session rather than all of it. Its
      // patches only apply to what this socket was itself sent, so every new
      // socket starts from whole sessions; an older hub ignores the request.
      const current = new WebSocket(`${protocol}//${window.location.host}/api/events?patches=1`)
      socket = current
      eventSocketRef.current = current
      const patches = new SessionPatchReceiver((request) => {
        if (current.readyState === WebSocket.OPEN) current.send(JSON.stringify(request))
      })
      socket.onopen = () => {
        publishFeatureEvent({ type: 'hub.connected' })
        reportOraclePresenceRef.current()
        reconnectDelay = 1_000
        sessionKnowledgeRootRef.current.refresh()
        // Order events are not replayed, so a reorder committed while this
        // socket was down would otherwise stay invisible until the next one.
        void syncSessionOrderRef.current()
        // Settings events are not replayed either.
        void settingsClient.sync()
        setScheduleProposalEpoch((current) => current + 1)
        void refreshAllAuthoritativeState((message, caught) => {
          // While the page is recovering from a return, unreachability is retried, not shown.
          if (resumeSince === undefined || !isHubUnreachable(caught)) setSessionLoadError(message)
        }).catch(() => undefined)
      }
      socket.onmessage = (message) => {
        const event = patches.receive(JSON.parse(message.data as string) as HubWireEvent)
        if (!event) return
        publishFeatureEvent(event)
        if (isManagerEvent(event)) {
          // The manager's conversation, not session lifecycle: it must not
          // move the transcript sequence either.
          for (const listener of managerListenersRef.current) listener(event)
          raiseOracleShellNotificationRef.current(event)
        } else if (event.type === 'schedule-proposals.changed' || event.type === 'schedules.changed') {
          setScheduleProposalEpoch((current) => current + 1)
        } else if (event.type === 'schedule.run.notification') {
          raiseScheduleShellNotificationRef.current(event.notification)
        } else if (event.type === 'session.knowledge.updated') {
          sessionKnowledgeRootRef.current.applyUpdate(event.binding)
        } else if (event.type === 'session.order.updated') {
          // Preference state, not session lifecycle: it must not advance the
          // transcript sequence the snapshot reconciliation depends on.
          applySessionOrderSnapshot(event.order)
        } else if (event.type === 'settings.updated') {
          settingsClient.receive(event.settings)
        } else if (event.type === 'session.upserted') {
          setResourcesView((view) => view?.ownerKey === sessionKey(event.session) &&
            view.signature !== sessionResourceOwner(event.session) ? undefined : view)
          eventSequenceRef.current = nextSessionEventSequence()
          sessionEventSequenceRef.current.set(
            sessionKey(event.session),
            eventSequenceRef.current,
          )
          pendingReplacements.current.delete(sessionKey(event.session))
          // A closed session reopened, here or on another device.
          if (closedSessionKeys.current.delete(sessionKey(event.session))) {
            removedSessions.current.delete(sessionKey(event.session))
          }
          recentlyClosedRef.current.forget(sessionKey(event.session))
          // Written straight through as well as scheduled. The ref is assigned
          // during render, so a request that finishes before React commits
          // would reconcile against a list this event is not in yet and drop
          // the replacement it is announcing.
          // A node resync's roster summary never read the transcript; the one
          // already shown stays rather than being blanked.
          const arrived = (current: ManagedSession[]) => event.summary
            ? carrySnapshotTranscripts([event.session], current)[0]
            : event.session
          sessionsRef.current = upsertSession(
            sessionsRef.current,
            arrived(sessionsRef.current),
          )
          setSessions((current) => upsertSession(current, arrived(current)))
          // The arrival is the newest word on its own ancestry, and the loads
          // only ever see what the server last listed. Without this, state
          // under an ancestor waits for a reload that may never come.
          claimReplacedSessions([event.session])
        } else if (event.type === 'session.removed') {
          sessionKnowledgeRootRef.current.forgetSession(event.computerId, event.sessionId)
          setResourcesView((view) => view?.ownerKey === `${event.computerId}:${event.sessionId}` ? undefined : view)
          const removedKey = `${event.computerId}:${event.sessionId}`
          // Answers were about the conversation that is gone, and a cleared
          // session's replacement starts without it.
          setSideQuestions(withoutSideQuestions((key) => key === removedKey))
          // Said outright, so a later answer that simply does not mention it
          // is not what settles it, and a delayed clear response must not put
          // it back.
          removedSessions.current.add(removedKey)
          claimTombstone(removedKey)
          if (event.closed) {
            closedSessionKeys.current.add(removedKey)
            void recentlyClosedRef.current.refresh()
          } else {
            closedSessionKeys.current.delete(removedKey)
            recentlyClosedRef.current.forget(removedKey)
          }
          // Whatever this session was itself promised as, it is not on its way
          // any more. Left pending, selection cleanup went on preserving a
          // session that had been deleted and the reader sat on a blank
          // conversation, with the overlapping snapshot unable to settle it
          // because this very removal moved its watermark on.
          pendingReplacements.current.delete(removedKey)
          settleAttachmentTargetWaiters(removedKey, undefined)
          eventSequenceRef.current = nextSessionEventSequence()
          sessionEventSequenceRef.current.set(
            removedKey,
            eventSequenceRef.current,
          )
          // Removal reaches every client. A cleared session was replaced
          // rather than deleted, so everything it was carrying moves across on
          // all of them instead of being discarded on any of them.
          if (event.replacedBy) {
            const replacementKey = `${event.computerId}:${event.replacedBy}`
            const movedAttachmentIds = new Set(
              (composerAttachmentsRef.current[removedKey] || []).map(
                (attachment) => attachment.id,
              ),
            )
            migrateSessionStateRef.current(removedKey, replacementKey)
            if (movedAttachmentIds.size > 0) {
              const pending =
                pendingAttachmentReplacements.current.get(replacementKey) ||
                new Set<string>()
              for (const id of movedAttachmentIds) {
                pending.add(id)
              }
              pendingAttachmentReplacements.current.set(replacementKey, pending)
            }
            // Removal and upsert are separate events. Following the
            // replacement now stops the fallback from selecting an unrelated
            // session in the gap, which the later upsert would not undo.
            pendingReplacements.current.add(replacementKey)
            replacedInto.current.set(removedKey, replacementKey)
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
            submissionAnchors.current.delete(removedKey)
            updateComposerDrafts([removedKey], (current) => {
              const { [removedKey]: _removed, ...remaining } = current
              return remaining
            })
            forgetKnowledgeSessionRef.current(removedKey)
            forgetAttachments(removedKey)
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
          // The session is gone, so nothing here can ever be settled against
          // it again. Left behind, the text of a prompt that failed stayed in
          // this browser's storage for good.
          forgetRestoredDraft(removedKey)
          handledFailures.current.delete(removedKey)
          restoredFailures.current.delete(removedKey)
          unshownFailures.current.delete(removedKey)
          acceptedSubmissionTokens.current.delete(removedKey)
        } else if (event.type === 'session.tasks.updated') {
          const key = `${event.computerId}:${event.sessionId}`
          eventSequenceRef.current = nextSessionEventSequence()
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
          setResourcesView((view) => view?.computerId === event.computer.id &&
            view.registrationId !== event.computer.registrationId ? undefined : view)
          // The hub filters retired clients before publishing this event.
          // A new pairing may be announced by another tab without a refresh.
          forgottenComputers.current.delete(event.computer.id)
          liftUnpairedTombstones(event.computer.id)
          eventSequenceRef.current = nextSessionEventSequence()
          // Only the computer record is newer, not its sessions. A paired node
          // going offline is an ordinary update, and treating it as reason to
          // reject the snapshot discards every session that computer has.
          computerRecordSequenceRef.current.set(
            event.computer.id,
            eventSequenceRef.current,
          )
          computersRef.current = upsertComputer(computersRef.current, event.computer)
          setComputers(computersRef.current)
        } else if (event.type === 'computer.removed') {
          eventSequenceRef.current = nextSessionEventSequence()
          computerEventSequenceRef.current.set(
            event.computerId,
            eventSequenceRef.current,
          )
          discardComputerLocalState(event.computerId)
          computersRef.current = computersRef.current.filter(
            (computer) => computer.id !== event.computerId,
          )
          setComputers(computersRef.current)
          // A root names a folder on a computer. The hub drops the roots of a
          // computer that has been unpaired, so a tab still listing one would
          // offer a document it can no longer fetch.
          forgetComputerKnowledge(event.computerId)
          for (const session of sessionsRef.current) {
            if (session.computerId === event.computerId) tombstoneUnpairedSession(event.computerId, sessionKey(session))
          }
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
        } else if (event.type === 'error') {
          // A prompt that was handed over and then failed to send is gone from
          // the queue and was never in the composer, so the text comes back
          // here or nowhere. Anything typed since is newer and is left alone.
          if (event.type === 'error' && event.notify) {
            raiseAlertShellNotificationRef.current(event.computerId, event.message)
          }
          if (event.type === 'error' && event.failedPrompt && event.sessionId) {
            restoreFailedPromptRef.current(
              `${event.computerId || ''}:${event.sessionId}`,
              event.failedPrompt,
              event.failedPromptAt,
            )
          }
          setError(event.message)
        }
      }
      socket.onclose = () => {
        if (eventSocketRef.current === current) eventSocketRef.current = undefined
        if (!stopped) {
          // A WebSocket the gateway refused fails without saying why.
          void checkHubSignIn()
          const delay = reconnectDelay
          reconnectDelay = Math.min(reconnectDelay * 2, 30_000)
          retry = window.setTimeout(connect, delay)
        }
      }
    }

    // Session-list failures the hub answered with still show at once, and so
    // does any failure once the page hides again and recovery has stopped.
    const reportResumeListingFailure = (message: string, caught: unknown) => {
      if (resumeSince === undefined || !isHubUnreachable(caught)) setError(message)
    }
    const refreshAfterResume = () => {
      resumeRetry = undefined
      void refreshAllAuthoritativeState(reportResumeListingFailure).catch(() => undefined)
    }
    // Called by any refresh that could not reach the hub during a resume episode.
    function continueResume() {
      if (resumeSince === undefined || stopped || document.visibilityState !== 'visible') return
      if (Date.now() - resumeSince >= HUB_UNREACHABLE_GRACE_MS) showResumeError(HUB_UNREACHABLE_MESSAGE)
      if (resumeRetry !== undefined) return
      resumeRetry = window.setTimeout(refreshAfterResume, resumeDelay)
      resumeDelay = Math.min(resumeDelay * 2, 10_000)
    }
    const handleVisibility = () => {
      stopResumeRetry()
      if (document.visibilityState === 'visible') {
        resumeSince = Date.now()
        resumeRecoveringRef.current = true
        refreshAfterResume()
      } else {
        // Hidden pages do not retry, so failures meanwhile report as before.
        resumeSince = undefined
        resumeRecoveringRef.current = false
      }
    }
    // The browser reports its network back: retry now rather than after the backoff.
    const handleOnline = () => {
      if (resumeRetry === undefined) return
      window.clearTimeout(resumeRetry)
      refreshAfterResume()
    }
    // Renewed, perhaps in another tab: catch up on what was refused meanwhile.
    const handleSignIn = () => {
      if (stopped || hubSignInExpired()) return
      if (paused) {
        paused = false
        reconnectDelay = 1_000
        connect()
      } else {
        void refreshAllAuthoritativeState(setError).catch(() => undefined)
      }
    }
    const unsubscribeSignIn = subscribeHubSignIn(handleSignIn)

    connect()
    window.addEventListener(
      coordinatedAuthoritativeRefresh,
      handleCoordinatedAuthoritativeRefresh,
    )
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)
    return () => {
      stopped = true
      stopResumeRetry()
      resumeRecoveringRef.current = false
      window.removeEventListener('online', handleOnline)
      if (authoritativeRefreshRef.current === refreshAllAuthoritativeState) {
        authoritativeRefreshRef.current = async () => undefined
      }
      window.removeEventListener(
        coordinatedAuthoritativeRefresh,
        handleCoordinatedAuthoritativeRefresh,
      )
      document.removeEventListener('visibilitychange', handleVisibility)
      unsubscribeSignIn()
      if (retry !== undefined) {
        window.clearTimeout(retry)
      }
      socket?.close()
    }
  }, [loadBackgroundTasks, settingsClient, upsertSession])

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
      } else {
        pinTimeline()
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

  // Whatever changes the open session -- the agent's activity, a card, the
  // queue under the conversation -- or a sent message waiting in its terminal
  // keeps a reader who is following at the end. Done before the browser
  // paints, so the new end never shows below the fold first.
  useLayoutEffect(() => {
    if (autoScrollRef.current) {
      pinTimeline()
    }
  }, [selected, selectedPendingEchoes])

  function timelineScrolled() {
    const timeline = timelineRef.current
    if (!timeline) {
      return
    }
    if (requiredActionScrollRef.current) {
      setFollowsLatest(false)
      return
    }
    // Still where the view last put the end: the content grew or moved under
    // the reader, who did not go anywhere.
    const pinnedAt = pinnedScrollTopRef.current
    if (pinnedAt !== undefined && Math.abs(timeline.scrollTop - pinnedAt) < 1) {
      if (autoScrollRef.current) {
        pinTimeline()
      }
      return
    }
    const distanceFromBottom =
      timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight
    // Scrolling up stops the view following the conversation, and scrolling
    // back to the end takes it up again.
    const following = distanceFromBottom <= timelineBottomThreshold
    pinnedScrollTopRef.current = following ? timeline.scrollTop : undefined
    setFollowsLatest(following)
  }

  /** Puts the timeline's end in view and remembers where that left it. */
  function pinTimeline() {
    const timeline = timelineRef.current
    if (!timeline) {
      return
    }
    timeline.scrollTop = timeline.scrollHeight
    pinnedScrollTopRef.current = timeline.scrollTop
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
    pinTimeline()
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
      pinTimeline()
    }
  }, [composer, sideQuestionDraft, viewportHeight])

  // Puts text in the composer as a thing of its own, with no paste metadata
  // carried over. Reconciling would keep a tracked label that happens to match
  // one in the new text, so a queued message holding a literal label was sent
  // with somebody else's pasted payload hidden behind it.
  function replaceComposer(value: string) {
    if (!selectedKey) {
      return
    }
    const targetKey = followReplacementsRef.current(selectedKey)
    updateComposerDrafts([targetKey], (current) =>
      writeComposerContent(current, targetKey, { text: value, pastes: [] }),
    )
  }

  function setComposer(value: string) {
    if (!selectedKey) {
      return
    }
    const targetKey = followReplacementsRef.current(selectedKey)
    let cursor: number | undefined
    updateComposerDrafts([targetKey], (current) => {
      const existing = current[targetKey] || { text: '', pastes: [] }
      const edited = reconcileComposerEdit(existing, value)
      if (edited.content.text !== value) {
        cursor = edited.cursor
      }
      return writeComposerEdit(current, targetKey, edited)
    })
    if (cursor !== undefined) {
      focusComposer(targetKey, cursor)
    }
  }

  function rememberComposerEdit(
    textarea: HTMLTextAreaElement,
    inputType: string,
  ) {
    if (!selectedKey) {
      return
    }
    const targetKey = followReplacementsRef.current(selectedKey)
    composerEditRef.current = {
      key: targetKey,
      before: textarea.value,
      start: textarea.selectionStart ?? textarea.value.length,
      end: textarea.selectionEnd ?? textarea.selectionStart ?? textarea.value.length,
      inputType,
    }
  }

  function composerBeforeInput(event: FormEvent<HTMLTextAreaElement>) {
    rememberComposerEdit(
      event.currentTarget,
      (event.nativeEvent as InputEvent).inputType || '',
    )
  }

  function composerCut(event: ReactClipboardEvent<HTMLTextAreaElement>) {
    composerEditRef.current = undefined
    const textarea = event.currentTarget
    if (event.defaultPrevented ||
        textarea.selectionStart === textarea.selectionEnd) {
      return
    }
    rememberComposerEdit(textarea, 'deleteByCut')
    const captured = composerEditRef.current
    const native = event.nativeEvent
    queueMicrotask(() => {
      if (native.defaultPrevented && composerEditRef.current === captured) {
        composerEditRef.current = undefined
      }
    })
  }

  function composerChanged(value: string, inputType?: string) {
    if (!selectedKey) {
      return
    }
    const targetKey = followReplacementsRef.current(selectedKey)
    const edit = composerEditRef.current
    composerEditRef.current = undefined
    let cursor: number | undefined
    updateComposerDrafts([targetKey], (current) => {
      const existing = current[targetKey] || { text: '', pastes: [] }
      if (!value) {
        return writeComposerContent(current, targetKey, { text: '', pastes: [] })
      }
      let edited: ComposerEdit | undefined
      if (
        edit?.key === targetKey &&
        edit.before === composerInputValue(existing.text) &&
        (edit.inputType !== 'deleteByCut' || inputType === 'deleteByCut')
      ) {
        let start = edit.start
        let end = edit.end
        const removed = edit.before.length - value.length
        if (start === end && removed > 0) {
          if (edit.inputType.endsWith('Backward')) {
            start = Math.max(0, start - removed)
          } else if (edit.inputType.endsWith('Forward')) {
            end = Math.min(edit.before.length, end + removed)
          }
        }
        const insertedLength =
          value.length - (edit.before.length - (end - start))
        if (
          insertedLength >= 0 &&
          (edit.inputType !== 'deleteByCut' || insertedLength === 0) &&
          edit.before.slice(0, start) === value.slice(0, start) &&
          edit.before.slice(end) === value.slice(start + insertedLength)
        ) {
          edited = applyComposerEdit(
            existing,
            composerTextPosition(existing.text, start),
            composerTextPosition(existing.text, end),
            { text: value.slice(start, start + insertedLength), pastes: [] },
          )
        }
      }
      edited ??= reconcileComposerEdit(existing, value)
      if (edited.content.text !== value) {
        cursor = edited.cursor
      }
      return writeComposerEdit(current, targetKey, edited)
    })
    reconcileComposerAttachmentRows(targetKey)
    if (cursor !== undefined) {
      focusComposer(targetKey, cursor)
    }
  }

  function failureStampFor(key: string): string | undefined {
    const current = sessionsRef.current.find((session) =>
      sessionKey(session) === followReplacementsRef.current(key),
    )
    return current?.failedPrompt?.failedAt || current?.failedPrompt?.content
  }

  function reofferFailedPrompt(key: string) {
    key = followReplacementsRef.current(key)
    const failed = sessionsRef.current.find((session) => sessionKey(session) === key)?.failedPrompt
    if (!failed?.content) {
      return
    }
    // The token stays. A reader who edits what they were handed and then
    // fails to send it still has that failure's text in front of them, and
    // dropping the token means no later submission can be recognised as the
    // answer to it, because the words no longer match.
    handledFailures.current.delete(key)
    restoreFailedPrompt(key, failed.content, failed.failedAt)
  }

  function restoreFailedPrompt(rawKey: string, content: string, failedAt?: string) {
    const key = followReplacementsRef.current(rawKey)
    if (removedSessions.current.has(key)) {
      return
    }
    const stamp = failedAt || content
    if (handledFailures.current.get(key) === stamp || acceptedSubmissionTokens.current.get(key)?.has(stamp)) {
      return
    }
    // An empty editor while a submission is pending is not a free draft.
    // Only the response to that request can release its ownership.
    if (
      submissionInFlight(key) ||
      (composerDraftsRef.current[key]?.pendingSubmission &&
        !composerDraftsRef.current[key]?.pendingSubmission?.accepted)
    ) {
      // Kept rather than dropped: if that submission then fails, nothing else
      // comes back to this, and the text would stay invisible while its
      // marker holds the queue.
      unshownFailures.current.set(key, { content, stamp })
      return
    }
    const existing = composerDraftsRef.current[key]
    const draft = existing ? durableComposerDraft(key, existing) : undefined
    if (restoredDraftStamps.current[key] === stamp) {
      // Provenance, rather than matching words, keeps an edited recovery
      // answering its failure without claiming unrelated newer writing.
      handledFailures.current.set(key, stamp)
      unshownFailures.current.delete(key)
      restoredFailures.current.set(key, stamp)
      // A browser-only command can empty a recovery without answering it.
      if (!draft?.text) {
        updateComposerDrafts([key], (current) =>
          writeComposerContent(current, key, { text: content, pastes: [] }),
        )
      }
      return
    }
    if (draft?.text) {
      // Merely observing a failure must not turn a history preview into the
      // user's draft by invalidating the unsent text behind it.
      unshownFailures.current.set(key, { content, stamp })
      return
    }
    handledFailures.current.set(key, stamp)
    unshownFailures.current.delete(key)
    restoredFailures.current.set(key, stamp)
    rememberRestoredDraft(key, stamp, content)
    updateComposerDrafts([key], (current) =>
      writeComposerContent(current, key, { text: content, pastes: [] }),
    )
  }

  function removeUntouchedRecovery(key: string, handed: string) {
    const existing = composerDraftsRef.current[key]
    if (!existing) {
      return
    }
    const draft = durableComposerDraft(key, existing)
    // A missing failure marker does not acknowledge an HTTP submission.
    // Neither its restored text nor writing begun while it was in flight is
    // owned by the old failure, even when the words happen to be identical.
    if (
      (draft.pendingSubmission && !draft.pendingSubmission.accepted) ||
      draft.deliveryUncertain ||
      draft.text !== handed
    ) {
      return
    }
    updateComposerDrafts([key], (current) =>
      writeComposerContent(current, key, { text: '', pastes: [] }),
    )
  }

  function submissionInFlight(key: string): boolean {
    return [...submissionsInFlight.current].some((submittedKey) =>
      followReplacementsRef.current(submittedKey) === key,
    )
  }

  // A browser that was not listening when the send failed learns about it from
  // the session itself. The event covers the connected case; this covers the
  // reconnect, and doing both means neither has to be relied on alone.
  useEffect(() => {
    for (const session of sessions) {
      const key = sessionKey(session)
      const failed = session.failedPrompt
      const stamped = failed?.failedAt || failed?.content || ''
      if (submissionInFlight(key)) {
        if (failed?.content) unshownFailures.current.set(key, { content: failed.content, stamp: stamped })
        continue
      }
      if (acceptedSubmissionTokens.current.get(key)?.has(stamped)) continue
      const protectedDraft = Boolean(
        composerDrafts[key] &&
        failedSubmissionBindings.current[key] === restoredDraftStamps.current[key] &&
        failedSubmissionBindings.current[key] !== undefined,
      )
      if (failed?.content) {
        // A different failure from the one this client is holding. The one it
        // was handed has been answered by somebody, and leaving that text on
        // screen has an offline tab resending it when it comes back.
        const held = restoredDraftStamps.current[key]
        const stamp = failed.failedAt || failed.content
        if (held !== undefined && held !== stamp && !protectedDraft) {
          const handed = restoredDraftContents.current[key]
          if (handed !== undefined) {
            removeUntouchedRecovery(key, handed)
          }
          forgetRestoredDraft(key)
          handledFailures.current.delete(key)
          restoredFailures.current.delete(key)
        }
        restoreFailedPromptRef.current(key, failed.content, failed.failedAt)
        // Said again every time the text comes back. A reload, a reconnect or
        // switching away and back leaves an ordinary-looking draft, and
        // sending it puts a second copy beside whatever is already in the
        // terminal's prompt.
        // Only for the conversation the reader is looking at. Said for one
        // they are not, it was consumed on their behalf: selecting that
        // session cleared the banner, and this would not say it again.
        if (
          failed.uncertain &&
          selectedRef.current &&
          sessionKey(selectedRef.current) === key &&
          warnedUncertain.current.get(key) !== stamped
        ) {
          warnedUncertain.current.set(key, stamped)
          setError(
            'This message may still be in the terminal. Check there before sending it again.',
          )
        }
        continue
      }
      acceptedSubmissionTokens.current.delete(key)
      // A failed request's draft must keep its token even if a newer snapshot
      // no longer offers it. Otherwise the next retry becomes an anonymous send.
      if (protectedDraft) continue
      // Gone, so somebody has answered for it -- another tab, another device,
      // or this one. What was remembered about it here goes with it, or a
      // submission from this client would carry a token for a failure that no
      // longer exists and let go of whichever one has taken its place.
      // The draft this client was handed goes too, but only while it is still
      // the text that was handed over. Left on screen it reads as something
      // waiting to be sent, and sending it delivers the prompt a second time.
      // Anything the reader has written since is theirs and stays.
      const handed = restoredDraftContents.current[key]
      if (handed !== undefined) {
        removeUntouchedRecovery(key, handed)
      }
      handledFailures.current.delete(key)
      restoredFailures.current.delete(key)
      unshownFailures.current.delete(key)
      forgetRestoredDraft(key)
    }
  }, [sessions, sending, composerDrafts])

  // A failure that had to wait is offered again as soon as the composer it
  // was meant for is free. Without this it stayed invisible while its marker
  // went on holding the queue.
  useEffect(() => {
    for (const [key, pending] of unshownFailures.current) {
      const draft = composerDrafts[key]
      if (draft && (
        (draft.pendingSubmission && !draft.pendingSubmission.accepted) ||
        durableComposerDraft(key, draft).text
      )) {
        continue
      }
      handledFailures.current.delete(key)
      restoreFailedPromptRef.current(key, pending.content, pending.stamp)
    }
  }, [composerDrafts])

  function rememberRestoredDraft(key: string, stamp: string, content: string, submitted = false) {
    restoredDraftStamps.current = {
      ...restoredDraftStamps.current,
      [key]: stamp,
    }
    restoredDraftContents.current = {
      ...restoredDraftContents.current,
      [key]: content,
    }
    if (submitted) {
      failedSubmissionBindings.current = {
        ...failedSubmissionBindings.current,
        [key]: stamp,
      }
      writeStored(
        'agentic-remote:composer-submission-failures',
        JSON.stringify(failedSubmissionBindings.current),
      )
    }
    persistComposerRecoveryIdentity()
  }

  function forgetRestoredDraft(key: string) {
    if (!(key in restoredDraftStamps.current) && !(key in failedSubmissionBindings.current)) {
      return
    }
    const { [key]: _stamp, ...remainingStamps } = restoredDraftStamps.current
    const { [key]: _content, ...remainingContents } =
      restoredDraftContents.current
    restoredDraftStamps.current = remainingStamps
    restoredDraftContents.current = remainingContents
    const { [key]: _submission, ...remainingSubmissions } =
      failedSubmissionBindings.current
    failedSubmissionBindings.current = remainingSubmissions
    writeStored(
      'agentic-remote:composer-submission-failures',
      JSON.stringify(remainingSubmissions),
    )
    persistComposerRecoveryIdentity()
  }

  function persistComposerRecoveryIdentity() {
    // A failed identity write must not turn accepted delivery into a send
    // failure. Keep its in-memory ownership and retry with the next draft save.
    composerRecoveryStorageDirty.current = true
    const persisted = persistComposerDrafts(composerDraftsRef.current)
    if (persisted.ok) {
      setComposerStorageError(undefined)
    } else {
      reportComposerStorageFailure(persisted.error)
    }
  }

  /** Carries a recovery's identity to the session that replaced it. */
  function moveRestoredDraft(fromKey: string, toKey: string) {
    const stamp = restoredDraftStamps.current[fromKey]
    if (stamp !== undefined) {
      const content = restoredDraftContents.current[fromKey]
      const submitted = failedSubmissionBindings.current[fromKey] === stamp
      forgetRestoredDraft(fromKey)
      if (restoredDraftStamps.current[toKey] === undefined) {
        rememberRestoredDraft(toKey, stamp, content ?? '', submitted)
      }
    }
    const handled = handledFailures.current.get(fromKey)
    const restored = restoredFailures.current.get(fromKey)
    const unshown = unshownFailures.current.get(fromKey)
    handledFailures.current.delete(fromKey)
    restoredFailures.current.delete(fromKey)
    unshownFailures.current.delete(fromKey)
    if (handled !== undefined && !handledFailures.current.has(toKey)) {
      handledFailures.current.set(toKey, handled)
    }
    if (
      restored !== undefined &&
      restoredDraftStamps.current[toKey] === restored &&
      !restoredFailures.current.has(toKey)
    ) {
      restoredFailures.current.set(toKey, restored)
    }
    if (unshown !== undefined && !unshownFailures.current.has(toKey)) {
      unshownFailures.current.set(toKey, unshown)
    }
  }

  function updateComposerDrafts(
    invalidateKeys: string[],
    update: (current: ComposerDrafts) => ComposerDrafts,
    requirePersistence = false,
    allowVolatileRecoveryAdmission = false,
  ) {
    if (!composerMounted.current) {
      return false
    }
    const current = composerDraftsRef.current
    const next = update(current)
    if (next === current) {
      return false
    }
    const histories = invalidateKeys.map(
      (key) => [key, composerHistoryRef.current[key]] as const,
    )
    for (const key of invalidateKeys) {
      resetComposerHistory(key)
    }
    const persisted = persistComposerDrafts(next)
    if (!persisted.ok && requirePersistence && !allowVolatileRecoveryAdmission) {
      // Admission never owns the editor until every compatibility write has
      // succeeded. Undo any partial disk write without pretending that this
      // best-effort repair makes the rejected submission safe to dispatch.
      for (const [key, history] of histories) {
        if (history) {
          composerHistoryRef.current[key] = history
        }
      }
      const restored = persistComposerDrafts(current)
      reportComposerStorageFailure(persisted.error, true, restored.ok)
      return false
    }
    // Editing remains in memory even when storage is unavailable. Commit the
    // ref and React state together so a failed save cannot split their text.
    const committed = reconcileAcceptedComposerDrafts(
      next,
      composerAcceptanceReceipts.current,
      persisted.ok,
    )
    composerDraftsRef.current = committed
    setComposerDrafts(committed)
    if (persisted.ok) {
      setComposerStorageError(undefined)
    } else {
      reportComposerStorageFailure(persisted.error)
    }
    return persisted.ok || allowVolatileRecoveryAdmission
  }

  function setComposerForKey(
    rawTargetKey: string,
    value: string,
    fromHistory = false,
    replacementPastes?: CollapsedPaste[],
  ) {
    // The key was taken before whatever this is finishing awaited. A clear
    // during that wait leaves it naming a session that is gone, and writing
    // there puts the text somewhere nothing will look for it again.
    const targetKey = followReplacementsRef.current(rawTargetKey)
    if (!value && !fromHistory && !submissionInFlight(targetKey)) {
      forgetRestoredDraft(targetKey)
      handledFailures.current.delete(targetKey)
      restoredFailures.current.delete(targetKey)
    }
    updateComposerDrafts(fromHistory ? [] : [targetKey], (current) => {
      const existing = current[targetKey] || { text: '', pastes: [] }
      return writeComposerContent(current, targetKey, {
        text: value,
        pastes: replacementPastes ?? (fromHistory ? existing.pastes : []),
      })
    })
  }

  function resetComposerHistory(targetKey: string) {
    delete composerHistoryRef.current[targetKey]
  }

  function navigateMessageHistory(
    direction: -1 | 1,
    force = false,
    messageId?: string,
  ): boolean {
    if (!selected || !selectedKey) {
      return false
    }
    const userTurns = selected.messages
      .filter((message) => message.role === 'user' && !message.appGenerated && message.content.trim())
    const messages = userTurns.map((message) => message.content)
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
            draft: existing?.draft ?? composer,
            draftPastes:
              existing?.draftPastes ?? composerDrafts[selectedKey]?.pastes ?? [],
          }
    const nextIndex = messageId ? userTurns.findIndex((message) => message.id === messageId) : Math.min(
      Math.max(history.index + direction, 0),
      messages.length,
    )
    if (nextIndex < 0) return false
    history.index = nextIndex
    composerHistoryRef.current[selectedKey] = history
    const value =
      nextIndex === messages.length ? history.draft : messages[nextIndex] || ''
    setComposerForKey(
      selectedKey,
      value,
      true,
      nextIndex === messages.length ? history.draftPastes : [],
    )
    if (messageId) return true
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

  function restoreComposerSubmission(
    rawTargetKey: string,
    submission: ComposerSubmission,
    deliveryUncertain = true,
  ) {
    const targetKey = followReplacementsRef.current(rawTargetKey)
    updateComposerDrafts([targetKey], (current) => {
      const existing = current[targetKey]
      if (existing?.pendingSubmission?.id !== submission.id) {
        return current
      }
      return {
        ...current,
        [targetKey]: recoverPendingComposerDraft(
          durableComposerDraft(targetKey, existing),
          deliveryUncertain,
        ),
      }
    })
  }

  function appendComposerForKey(
    rawTargetKey: string,
    value: string,
    // Text belongs to whoever is writing it, so it follows a clear. A path
    // does not: an upload lives in the storage of the session it went to, and
    // handing its name to the replacement names a file that session has no
    // copy of.
    followsLineage = true,
  ) {
    const targetKey = followsLineage
      ? followReplacementsRef.current(rawTargetKey)
      : rawTargetKey
    // A transcription or upload can finish after its session (or computer) is gone.
    if (removedSessions.current.has(targetKey)) return
    updateComposerDrafts([targetKey], (current) => {
      const existing = durableComposerDraft(
        targetKey,
        current[targetKey] || { text: '', pastes: [] },
      )
      const separator = existing.text
        ? existing.text.endsWith('\n')
          ? '\n'
          : '\n\n'
        : ''
      return writeComposerContent(current, targetKey, {
        text: `${existing.text}${separator}${value}`,
        pastes: existing.pastes,
      })
    })
  }

  function removeComposerBlock(targetKey: string, value: string) {
    updateComposerDrafts([targetKey], (current) => {
      const removeBlock = (content: ComposerContent): ComposerContent => {
        const at = content.text.indexOf(value)
        if (at < 0) {
          return content
        }
        let start = at
        let end = at + value.length
        if (content.text.slice(Math.max(0, start - 2), start) === '\n\n') {
          start -= 2
        } else if (content.text.slice(end, end + 2) === '\n\n') {
          end += 2
        }
        return applyComposerEdit(
          content,
          start,
          end,
          { text: '', pastes: [] },
        ).content
      }
      const draft = current[targetKey]
      const existing = durableComposerDraft(
        targetKey,
        draft || { text: '', pastes: [] },
      )
      const content = removeBlock(existing)
      const pendingSubmission = draft?.pendingSubmission
      const pending = pendingSubmission
        ? removeBlock(pendingSubmission)
        : undefined
      if (content === existing && pending === pendingSubmission) {
        return current
      }
      const updated = writeComposerContent(current, targetKey, content)
      return pendingSubmission && pending !== pendingSubmission
        ? {
            ...updated,
            [targetKey]: {
              ...(updated[targetKey] || { text: '', pastes: [] }),
              pendingSubmission: { ...pendingSubmission, ...pending },
            },
          }
        : updated
    })
  }

  function updateAttachment(
    ownerKey: string,
    id: string,
    update: Partial<ComposerAttachment>,
  ) {
    updateComposerAttachments((current) => ({
      ...current,
      [ownerKey]: (current[ownerKey] || []).map((attachment) =>
        attachment.id === id ? { ...attachment, ...update } : attachment,
      ),
    }))
  }

  function currentAttachment(id: string): ComposerAttachment | undefined {
    for (const attachments of Object.values(composerAttachmentsRef.current)) {
      const attachment = attachments.find((candidate) => candidate.id === id)
      if (attachment) {
        return attachment
      }
    }
    return undefined
  }

  function reconcileComposerAttachmentRows(ownerKey: string) {
    const storedDraft = composerDraftsRef.current[ownerKey]
    const draft = storedDraft
      ? durableComposerDraft(ownerKey, storedDraft)
      : undefined
    retireAttachments(
      (composerAttachmentsRef.current[ownerKey] || []).filter(
        (attachment) =>
          attachment.status === 'attached' &&
          attachment.promptText !== undefined &&
          !composerDraftContainsAttachment(draft, attachment.promptText),
      ),
    )
  }

  function updateComposerAttachments(
    update: (
      current: Record<string, ComposerAttachment[]>,
    ) => Record<string, ComposerAttachment[]>,
  ) {
    const current = composerAttachmentsRef.current
    const next = update(current)
    if (next === current) {
      return
    }
    composerAttachmentsRef.current = next
    setComposerAttachments(next)
    try {
      const stored = Object.fromEntries(
        Object.entries(next).flatMap(([ownerKey, attachments]) => {
          const storedDraft = composerDraftsRef.current[ownerKey]
          const draft = storedDraft
            ? durableComposerDraft(ownerKey, storedDraft)
            : undefined
          const durable = attachments
            .filter((attachment) =>
              attachment.status === 'attached' &&
              attachment.promptText !== undefined &&
              composerDraftContainsAttachment(draft, attachment.promptText),
            )
            .map(({ id, name, size, migratedFrom, promptText }) => ({
              id,
              name,
              size,
              ...(migratedFrom ? { migratedFrom } : {}),
              promptText: promptText!,
            }))
          return durable.length > 0 ? [[ownerKey, durable]] : []
        }),
      )
      if (Object.keys(stored).length > 0) {
        localStorage.setItem(composerAttachmentsStorageKey, JSON.stringify(stored))
      } else {
        localStorage.removeItem(composerAttachmentsStorageKey)
      }
    } catch (caught) {
      setComposerStorageError(
        `Attachment previews could not be saved (${
          caught instanceof Error ? `${caught.name}: ${caught.message}` : String(caught)
        }). The attached file path remains in your draft; keep this page open to retain its preview.`,
      )
    }
  }

  function removeAttachment(attachment: ComposerAttachment) {
    if (attachment.status === 'uploading') {
      return
    }
    clipboardPasteBatchesRef.current.delete(attachment.ownerKey)
    if (attachment.promptText) {
      removeComposerBlock(attachment.ownerKey, attachment.promptText)
    }
    if (attachment.file) {
      attachmentFilesRef.current
        .get(attachment.ownerKey)
        ?.delete(attachment.file)
    }
    updateComposerAttachments((current) => {
      const remaining = (current[attachment.ownerKey] || []).filter(
        (candidate) => candidate.id !== attachment.id,
      )
      if (remaining.length > 0) {
        return { ...current, [attachment.ownerKey]: remaining }
      }
      const { [attachment.ownerKey]: _removed, ...rest } = current
      return rest
    })
    window.requestAnimationFrame(() => focusComposer(attachment.ownerKey))
  }

  function attachmentsInContent(
    ownerKey: string,
    content: string,
  ): ComposerAttachment[] {
    return (composerAttachmentsRef.current[ownerKey] || []).filter(
      (attachment) =>
        attachment.status === 'attached' &&
        attachment.promptText !== undefined &&
        content.includes(attachment.promptText),
    )
  }

  function retireAttachments(attachments: ComposerAttachment[]) {
    if (attachments.length === 0) {
      return
    }
    const retiredIds = new Set(attachments.map((attachment) => attachment.id))
    for (const attachment of attachments) {
      const liveAttachment = currentAttachment(attachment.id)
      if (liveAttachment?.file) {
        attachmentFilesRef.current
          .get(liveAttachment.ownerKey)
          ?.delete(liveAttachment.file)
      }
      if (liveAttachment) {
        clipboardPasteBatchesRef.current.delete(liveAttachment.ownerKey)
      }
    }
    updateComposerAttachments((current) => {
      let changed = false
      const next = Object.fromEntries(
        Object.entries(current).flatMap(([ownerKey, currentAttachments]) => {
          const remaining = currentAttachments.filter(
            (attachment) => !retiredIds.has(attachment.id),
          )
          if (remaining.length === currentAttachments.length) {
            return [[ownerKey, currentAttachments]]
          }
          changed = true
          return remaining.length > 0 ? [[ownerKey, remaining]] : []
        }),
      )
      return changed
        ? next
        : current
    })
  }

  function resolveAttachmentTarget(
    targetSession: ManagedSession,
  ): ManagedSession | undefined {
    const requestedKey = sessionKey(targetSession)
    const liveKey = followReplacementsRef.current(requestedKey)
    if (requestedKey === liveKey) {
      return removedSessions.current.has(requestedKey)
        ? undefined
        : targetSession
    }
    return sessionsRef.current.find(
      (candidate) =>
        sessionKey(candidate) === liveKey &&
        candidate.recovery !== undefined,
    )
  }

  function waitForAttachmentTarget(
    targetSession: ManagedSession,
  ): Promise<ManagedSession | undefined> {
    const immediate = resolveAttachmentTarget(targetSession)
    if (immediate) {
      return Promise.resolve(immediate)
    }
    const liveKey = followReplacementsRef.current(sessionKey(targetSession))
    if (!pendingReplacements.current.has(liveKey)) {
      return Promise.resolve(undefined)
    }
    return new Promise((resolve) => {
      const waiters = attachmentTargetWaitersRef.current.get(liveKey) ||
        new Set<(target: ManagedSession | undefined) => void>()
      waiters.add(resolve)
      attachmentTargetWaitersRef.current.set(liveKey, waiters)
    })
  }

  function settleAttachmentTargetWaiters(
    key: string,
    target: ManagedSession | undefined,
  ) {
    const waiters = attachmentTargetWaitersRef.current.get(key)
    if (!waiters) {
      return
    }
    attachmentTargetWaitersRef.current.delete(key)
    for (const resolve of waiters) {
      resolve(target)
    }
  }

  function forgetAttachments(ownerKey: string) {
    attachmentFilesRef.current.delete(ownerKey)
    clipboardPasteBatchesRef.current.delete(ownerKey)
    updateComposerAttachments((current) => {
      if (!current[ownerKey]) {
        return current
      }
      const { [ownerKey]: _removed, ...rest } = current
      return rest
    })
  }

  function discardAttachments(ownerKey: string) {
    discardAttachmentsById(
      (composerAttachmentsRef.current[ownerKey] || []).map(
        (attachment) => attachment.id,
      ),
    )
  }

  function discardAttachmentsById(ids: Iterable<string>) {
    const attachments = Array.from(ids).flatMap((id) => {
      const attachment = currentAttachment(id)
      return attachment ? [attachment] : []
    })
    for (const attachment of attachments) {
      if (attachment.promptText) {
        removeComposerBlock(attachment.ownerKey, attachment.promptText)
      }
    }
    retireAttachments(attachments)
  }

  function moveAttachments(fromKey: string, toKey: string) {
    if (fromKey === toKey) {
      return
    }
    const sourceFiles = attachmentFilesRef.current.get(fromKey)
    if (sourceFiles) {
      const destinationFiles = attachmentFilesRef.current.get(toKey) ||
        new Set<File>()
      for (const file of sourceFiles) {
        destinationFiles.add(file)
      }
      attachmentFilesRef.current.set(toKey, destinationFiles)
      attachmentFilesRef.current.delete(fromKey)
    }
    const clipboardBatch = clipboardPasteBatchesRef.current.get(fromKey)
    if (clipboardBatch) {
      clipboardPasteBatchesRef.current.set(toKey, clipboardBatch)
      clipboardPasteBatchesRef.current.delete(fromKey)
    }
    updateComposerAttachments((current) => {
      const source = current[fromKey]
      if (!source) {
        return current
      }
      const { [fromKey]: _moved, ...rest } = current
      return {
        ...rest,
        [toKey]: [
          ...(current[toKey] || []),
          ...source.map((attachment) => ({
            ...attachment,
            ownerKey: toKey,
            migratedFrom: fromKey,
          })),
        ],
      }
    })
  }

  function rebindAttachments(ownerKey: string, target: ManagedSession) {
    updateComposerAttachments((current) => {
      const attachments = current[ownerKey]
      if (!attachments) {
        return current
      }
      return {
        ...current,
        [ownerKey]: attachments.map((attachment) => ({
          ...attachment,
          computerId: target.computerId,
          sessionId: target.id,
        })),
      }
    })
  }

  function moveComposerDraft(fromKey: string, toKey: string) {
    if (fromKey === toKey) {
      return
    }
    if (submissionsInFlight.current.delete(fromKey)) {
      submissionsInFlight.current.add(toKey)
    }
    if (submissionAnchors.current.delete(fromKey)) {
      submissionAnchors.current.add(toKey)
    }
    updateComposerDrafts([fromKey, toKey], (current) => {
      const source = current[fromKey]
        ? durableComposerDraft(fromKey, current[fromKey])
        : undefined
      const destination = current[toKey]
        ? durableComposerDraft(toKey, current[toKey])
        : undefined
      if (!source) {
        return current
      }
      const { [fromKey]: _removed, ...remaining } = current
      if (destination) {
        // A pending request belongs to its submission, not to the empty
        // composer it left behind. Newer writing at the destination wins the
        // draft, but cannot throw away a submission still awaiting acceptance.
        const merged = source.deliveryUncertain
          ? {
              ...destination,
              ...prependComposerContent(source, destination),
              deliveryUncertain: true,
            }
          : destination
        return {
          ...remaining,
          [toKey]: source.pendingSubmission
            ? { ...merged, pendingSubmission: source.pendingSubmission }
            : merged,
        }
      }
      return { ...remaining, [toKey]: source }
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
    setLocationKnowledgeTarget((current) =>
      current?.key === key ? undefined : current,
    )
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
    // The reading position decides the rest. If the replacement already has
    // one of its own, the ancestor's markers stay where they are: moving them
    // across would point the replacement's own document at a place it never
    // came from, and the position that gets written back would overwrite what
    // the reader actually has open.
    // Decided here and recorded here. Ancestors are claimed one after another
    // in the same batch, and the ref is only refreshed by an effect that runs
    // after all of them, so each claim used to see a replacement that nothing
    // had taken yet. The newest ancestor rightly won the position while an
    // older one still moved the ownership markers across, and the document the
    // reader could see was then written back over the newer position.
    const takesPosition =
      knowledgePositionsRef.current[fromKey] !== undefined &&
      knowledgePositionsRef.current[toKey] === undefined
    if (takesPosition) {
      knowledgePositionsRef.current = {
        ...knowledgePositionsRef.current,
        [toKey]: knowledgePositionsRef.current[fromKey],
      }
    }
    if (knowledgePositionsRef.current[fromKey] !== undefined) {
      const { [fromKey]: _taken, ...rest } = knowledgePositionsRef.current
      knowledgePositionsRef.current = rest
    }
    const offset = knowledgeScrollTops.current[fromKey]
    delete knowledgeScrollTops.current[fromKey]
    if (
      takesPosition &&
      offset !== undefined &&
      knowledgeScrollTops.current[toKey] === undefined
    ) {
      knowledgeScrollTops.current[toKey] = offset
    }
    if (knowledgeRestoredKey.current === fromKey) {
      knowledgeRestoredKey.current = takesPosition ? toKey : undefined
    }
    if (knowledgeViewOwnerKey.current === fromKey) {
      // Without this the replacement treats the document already on screen as
      // another session's, clears it, and fetches it again — and loses it
      // entirely if the root has become unreachable.
      knowledgeViewOwnerKey.current = takesPosition ? toKey : undefined
    }
    if (knowledgeOwnerKey.current === fromKey) {
      knowledgeOwnerKey.current = takesPosition ? toKey : undefined
    }
    setLocationKnowledgeTarget((current) =>
      current?.key === fromKey ? { ...current, key: toKey } : current,
    )
    setKnowledgePositions((current) => {
      const position = current[fromKey]
      const { [fromKey]: _removed, ...remaining } = current
      // Newer reading under the replacement stays; the ancestor only fills a
      // gap it left behind.
      return position && !current[toKey]
        ? { ...remaining, [toKey]: position }
        : remaining
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
    moveAttachments(fromKey, toKey)
    // The draft moves, so what it is answering has to move with it. Left
    // behind, an edited recovery arrived under the replacement with no
    // identity, could not clear the marker the replacement still carries, and
    // the prompt it was answering came back.
    moveRestoredDraft(fromKey, toKey)
    const accepted = acceptedSubmissionTokens.current.get(fromKey)
    if (accepted) {
      acceptedSubmissionTokens.current.set(toKey, new Set([
        ...(acceptedSubmissionTokens.current.get(toKey) ?? []), ...accepted,
      ]))
      acceptedSubmissionTokens.current.delete(fromKey)
    }
    moveKnowledgePosition(fromKey, toKey)
    // The ref is moved on here rather than left to the effect that refreshes
    // it. Two clears in a row -- A to B, then B to C, both arriving before that
    // effect runs -- read the same stale list twice, so C was never marked as
    // changed and a settings answer asked for before either clear went on to
    // speak for it and took the silence away.
    if (mutedSessionsRef.current.includes(fromKey)) {
      mutedSessionsRef.current = [
        ...mutedSessionsRef.current.filter((key) => key !== fromKey),
        toKey,
      ]
      recordMuteChange(fromKey, toKey)
    }
    setMutedSessions((current) =>
      current.includes(fromKey)
        ? [...current.filter((key) => key !== fromKey), toKey]
        : current,
    )
    // The hub carries this too; moving it here keeps the replacement out of
    // the list until that snapshot arrives.
    setHiddenSessionKeys((current) => {
      if (!current.has(fromKey)) return current
      const next = new Set(current)
      next.delete(fromKey)
      next.add(toKey)
      return next
    })
  }

  function focusComposer(targetKey: string | undefined, cursor?: number): boolean {
    const current = selectedRef.current
    if (
      !targetKey ||
      !current ||
      sessionKey(current) !== targetKey ||
      document.querySelector('.dialog[aria-modal="true"]')
    ) {
      return false
    }

    const textarea = composerRef.current
    if (
      !textarea ||
      textarea.disabled ||
      textarea.readOnly ||
      textarea.closest('[hidden], [inert]')
    ) {
      return false
    }
    window.requestAnimationFrame(() => {
      const latest = selectedRef.current
      if (
        !latest ||
        sessionKey(latest) !== targetKey ||
        latest.pendingPermission ||
        latest.pendingUserInput ||
        composerRef.current !== textarea ||
        !textarea.isConnected ||
        textarea.disabled ||
        textarea.readOnly ||
        textarea.closest('[hidden], [inert]') ||
        document.querySelector('.dialog[aria-modal="true"]')
      ) {
        return
      }

      textarea.focus({ preventScroll: true })
      const end = cursor === undefined
        ? textarea.value.length
        : composerInputValue(
            (composerDraftsRef.current[targetKey]?.text || '').slice(0, cursor),
          ).length
      textarea.setSelectionRange(end, end)
    })
    return true
  }

  function focusActiveSessionComposer(): boolean {
    const current = selectedRef.current
    if (
      !current ||
      current.pendingPermission ||
      current.pendingUserInput ||
      (sidebarOpen && drawerIsOverlay())
    ) {
      return false
    }
    return focusComposer(sessionKey(current))
  }

  const activeCatalogRoot =
    roots.find((root) => root.id === activeRootId) ||
    (
      selected &&
      selectedKnowledgeBinding &&
      selectedKnowledgeBinding.rootId === activeRootId
        ? selectedKnowledgeBinding.root
        : undefined
    )
  const activeRoot = activeCatalogRoot
    ? scopedKnowledgeRoot(
        activeCatalogRoot,
        selected &&
        selectedKnowledgeBinding?.rootId === activeRootId
          ? activeKnowledgeBasePath
          : knowledgeRootPath,
      )
    : undefined
  const displayedKnowledgeRoot = selected
    ? (() => {
        const root =
          roots.find((candidate) => candidate.id === expectedKnowledgeRootId) ||
          selectedKnowledgeBinding?.root
        return root
          ? scopedKnowledgeRoot(root, sessionKnowledgeBasePath)
          : undefined
      })()
    : activeRoot
  const knowledgeRootStatus = !selected
    ? 'Knowledge library'
    : !sessionRootReady
      ? sessionKnowledgeRoot.error ? 'Could not load the saved root' : 'Loading this session\'s root'
      : sessionRootUnavailable
        ? 'Saved folder unavailable'
        : sessionKnowledgeRoot.binding?.rootId
          ? 'Saved for this session'
          : expectedKnowledgeRootId
            ? 'Remembered in this browser'
            : 'No root assigned'
  const rootPickerCurrent = rootPicker?.ownerKey === selectedKey &&
    Boolean(rootPicker?.session) === hasSelectedSession
  const rootDialogError = rootPicker && rootPickerError?.id === rootPicker.id
    ? rootPickerError.message
    : rootPickerCurrent ? sessionKnowledgeRoot.error : undefined
  const knowledgeAskUnavailableReason = activeRoot
    ? !selected || selected.computerId !== activeRoot.computerId
      ? `Open a session on ${activeRoot.computerName} to ask about this file.`
      : !computers.some(
          (computer) => computer.id === activeRoot.computerId && computer.online,
        )
        ? `Reconnect ${activeRoot.computerName} to ask about this file.`
        : undefined
    : undefined

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
    if (knowledgeMode === 'hidden' && mode !== 'hidden') {
      promptForEmptyKnowledgeRoot.current = true
    } else if (mode === 'hidden') {
      promptForEmptyKnowledgeRoot.current = false
    }
    if (mode !== 'hidden') {
      knowledgeOpenModeRef.current = mode
      writeStored(
        'agentic-remote:knowledge-open-mode',
        JSON.stringify(mode),
      )
    }
    const file = knowledgeFileStateRef.current
    const visibleModeChanged =
      knowledgeMode !== 'hidden' &&
      mode !== 'hidden' &&
      mode !== knowledgeMode
    const sessionlessReopen =
      knowledgeMode === 'hidden' &&
      mode !== 'hidden' &&
      !selectedKey
    if (
      (visibleModeChanged || sessionlessReopen) &&
      !knowledgeLoadingRef.current &&
      !knowledgeRestoreStartedKey.current &&
      activeRootId &&
      file
    ) {
      void reloadKnowledgeFile(activeRootId, file.path)
    }
    setKnowledgeModeState(mode)
  }

  useEffect(() => {
    if (
      !promptForEmptyKnowledgeRoot.current ||
      knowledgeMode === 'hidden' ||
      !knowledgeRootsLoaded
    ) {
      return
    }
    const selectedComputerOnline =
      selected &&
      computers.some(
        (computer) =>
          computer.id === selected.computerId && computer.online,
      )
    if (roots.length === 0 && selected && selectedComputerOnline && !sessionKnowledgeRoot.binding) {
      return
    }
    promptForEmptyKnowledgeRoot.current = false
    if (roots.length === 0 && selected && selectedComputerOnline) {
      setAddRootInitialLocation({
        computerId: selected.computerId,
        path: selected.cwd,
      })
      rootCreationOwner.current = { key: selectedKey, revision: sessionKnowledgeRoot.binding?.revision }
      setAddRootOpen(true)
    }
  }, [computers, knowledgeMode, knowledgeRootsLoaded, roots.length, selected, selectedKey, sessionKnowledgeRoot.binding])

  /** Whether the sidebar is the drawer that slides over everything. */
  function drawerIsOverlay(): boolean {
    return typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 960px)').matches
      : window.innerWidth <= 960
  }

  /** What a shortcut answers to now, for anything that tells the reader. */
  // Read rather than written out, or a remapped shortcut goes on being
  // advertised by keys that no longer do anything.
  function shortcutKeys(id: ShortcutId): string {
    const entry = shortcuts.find((candidate) => candidate.id === id)
    return entry ? bindingLabel(entry.binding) : ''
  }

  /**
   * Puts away whatever is on top, and says whether there was anything.
   */
  // In the order they are stacked, so one press puts away one thing: the
  // dialog over the panel before the panel, the panel before the drawer
  // behind it.
  //
  // A permission request and a question from the agent are deliberately not
  // here. Both are waiting on an answer, and dismissing one leaves the session
  // stopped with nothing on screen to say why.
  function closeTopmostLayer(target?: EventTarget | null): boolean {
    if (addRootOpen) {
      rootCreationOwner.current = undefined
      setAddRootOpen(false)
      return true
    }
    if (rootRemovalTarget) {
      setRootRemovalTarget(undefined)
      return true
    }
    if (rootPicker) {
      closeRootPicker()
      return true
    }
    if (resourcesView) {
      closeSessionResources()
      return true
    }
    const dialogs: [boolean, () => void][] = [
      [Boolean(shellView), closeShellView],
      [Boolean(closeRequestSession), () => setCloseRequest(undefined)],
      [recentlyClosedOpen, () => setRecentlyClosedOpen(false)],
      [newSessionOpen, closeNewSession],
      [computersOpen, () => setComputersOpen(false)],
      [settingsOpen, () => setSettingsOpen(false)],
      [statuslineOpen, () => setStatuslineOpen(false)],
      [runtimeOpen, () => setRuntimeOpen(false)],
      [retentionOpen, () => setRetentionOpen(false)],
      [backgroundTasksOpen, () => setBackgroundTasksOpen(false)],
      [renameOpen, () => setRenameOpen(false)],
      [cwdOpen, () => setCwdOpen(false)],
      [workspaceOpen, () => setWorkspaceOpen(false)],
    ]
    const open = dialogs.find(([isOpen]) => isOpen)
    if (open) {
      open[1]()
      return true
    }
    // Before the knowledge panel, but only where it is actually an overlay.
    // Widening the window past the breakpoint leaves the drawer flag set while
    // the sidebar is simply part of the layout, and Escape then spent the
    // press on something invisible instead of closing what was in front.
    if (sidebarOpen && drawerIsOverlay()) {
      setSidebarOpen(false)
      return true
    }
    // The side-question dock belongs to the conversation, so it goes before
    // a knowledge panel beside it -- unless the panel is over the
    // conversation or is where the reader is.
    const inKnowledge = target instanceof Element && Boolean(target.closest('.knowledge-panel'))
    if (askingAside && knowledgeMode !== 'expanded' && !inKnowledge) {
      closeSideQuestion()
      return true
    }
    if (knowledgeMode !== 'hidden') {
      setKnowledgeMode('hidden')
      return true
    }
    if (askingAside) {
      closeSideQuestion()
      return true
    }
    return false
  }

  function toggleKnowledgePanel() {
    setKnowledgeMode(
      knowledgeMode === 'hidden' ? knowledgeOpenModeRef.current : 'hidden',
    )
  }

  function toggleKnowledgeExpanded() {
    // Expanding from a closed panel opens it directly at full width, so one
    // shortcut is enough to start reading.
    setKnowledgeMode(knowledgeMode === 'expanded' ? 'docked' : 'expanded')
  }

  function openSidebar(view: 'sessions' | 'knowledge') {
    setSidebarView(view)
    setSidebarOpen(true)
  }

  function openRootPicker() {
    const choice: KnowledgeRootChoice = selected &&
      selectedKnowledgeBinding?.rootId
      ? {
          kind: 'root',
          rootId: selectedKnowledgeBinding.rootId,
          rootPath: sessionKnowledgeBasePath,
        }
      : displayedKnowledgeRoot
        ? {
            kind: 'root',
            rootId: displayedKnowledgeRoot.id,
            rootPath: knowledgeRootPath,
          }
        : selected
          ? { kind: 'working-folder', rootPath: knowledgeRootPath }
          : { kind: 'none' }
    setRootPicker({
      id: ++rootPickerSequence.current,
      ownerKey: selectedKey,
      revision: sessionKnowledgeRoot.binding?.revision,
      session: selected ? {
        id: selected.id,
        computerId: selected.computerId,
        computerName: selected.computerName,
        title: selected.title,
        cwd: selected.cwd,
      } : undefined,
    })
    setRootChoice(choice.kind === 'none' && !selected ? undefined : choice)
    setRootPickerError(undefined)
  }

  function closeRootPicker() {
    if (rootPickerSavingRef.current) {
      rootCreationOwner.current = undefined
    }
    setRootPicker(undefined)
  }

  function beginRootCreation(location?: { computerId: string; path: string }, revision?: number) {
    rootCreationOwner.current = { key: selectedKey, revision: revision ?? sessionKnowledgeRoot.binding?.revision }
    if (selected && !sessionKnowledgeRoot.binding) sessionKnowledgeRoot.refresh()
    promptForEmptyKnowledgeRoot.current = false
    setRootPicker(undefined)
    setAddRootInitialLocation(location)
    setAddRootOpen(true)
  }

  async function applyRootChoice() {
    if (!rootPicker || !rootChoice || rootPickerSavingRef.current) return
    if (!rootPickerCurrent) {
      setRootPickerError({
        id: rootPicker.id,
        message: 'The selected session changed. Reopen this chooser before changing its root.',
      })
      return
    }
    rootPickerSavingRef.current = true
    setRootPickerSaving(true)
    setRootPickerError(undefined)
    const ownerKey = rootPicker.ownerKey
    const expectedRevision = rootPicker.revision ?? sessionKnowledgeRoot.binding?.revision
    try {
      if (rootChoice.kind === 'working-folder') {
        if (!rootPicker.session) throw new Error('Choose a session before using its working folder.')
        rootCreationOwner.current = { key: ownerKey, revision: expectedRevision }
        await createRoot(
          rootPicker.session.computerId,
          rootPicker.session.cwd,
          expectedRevision,
          rootChoice.rootPath,
        )
      } else if (rootPicker.session) {
        await sessionKnowledgeRoot.saveRoot(
          rootChoice.kind === 'none' ? null : rootChoice.rootId,
          expectedRevision,
          rootChoice.kind === 'none'
            ? knowledgeRootPath
            : rootChoice.rootPath,
        )
      } else if (rootChoice.kind === 'root') {
        if (!(await selectRoot(rootChoice.rootId))) return
      }
      setRootPicker((current) => current?.id === rootPicker.id ? undefined : current)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      setRootPickerError({ id: rootPicker.id, message })
      setError(`Could not save the Knowledge root for ${rootPicker.session?.title || 'the library'}: ${message}`)
      if (caught instanceof SessionKnowledgeRequestError && caught.binding) {
        const latest = caught.binding
        if (`${latest.computerId}:${latest.sessionId}` === ownerKey) {
          setRootPicker((current) => current?.ownerKey === ownerKey
            ? { ...current, revision: latest.revision } : current)
        }
      }
    } finally {
      rootPickerSavingRef.current = false
      setRootPickerSaving(false)
    }
  }

  async function saveRootPickerFolder(location: {
    computerId: string
    path: string
  }) {
    if (!rootPicker?.session || rootPickerSavingRef.current || !rootPickerCurrent) return
    rootPickerSavingRef.current = true
    setRootPickerSaving(true)
    setRootPickerError(undefined)
    const ownerKey = rootPicker.ownerKey
    const expectedRevision =
      rootPicker.revision ?? sessionKnowledgeRoot.binding?.revision
    try {
      rootCreationOwner.current = { key: ownerKey, revision: expectedRevision }
      await createRoot(
        location.computerId,
        location.path,
        expectedRevision,
        knowledgeRootPath,
      )
      setRootPicker((current) =>
        current?.id === rootPicker.id ? undefined : current,
      )
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      setRootPickerError({ id: rootPicker.id, message })
      setError(`Could not save this Knowledge root: ${message}`)
    } finally {
      rootPickerSavingRef.current = false
      setRootPickerSaving(false)
    }
  }

  async function retrySessionKnowledge() {
    appliedSessionRootScope.current = undefined
    knowledgeRestoredKey.current = undefined
    knowledgeRequest.current += 1
    sessionKnowledgeRoot.refresh()
    try {
      await loadKnowledgeRoots()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  function stepSession(direction: -1 | 1) {
    const next = stepVisibleSession(navigationView.visible, selectedKey, direction)
    if (next) {
      selectSession(next)
    }
  }

  // Stable identity: a new loader each render would remount every image and
  // restart its download.
  const loadKnowledgeAsset = useCallback(
    (assetPath: string) => activeKnowledgeBasePath === knowledgeRootPath
      ? readKnowledgeFile(activeRootId || '', assetPath)
      : readKnowledgeFile(
          activeRootId || '',
          assetPath,
          activeKnowledgeBasePath,
        ),
    [activeKnowledgeBasePath, activeRootId],
  )

  function knowledgeBasePathFor(rootId: string): string {
    return selected && sessionKnowledgeRoot.binding?.rootId === rootId
      ? sessionKnowledgeBasePath
      : knowledgeRootPath
  }

  function rememberedKnowledgeExpansion(
    rootId: string,
    basePath: string,
  ): string[] {
    return (
      restoredKnowledgeExpansion.current[
        knowledgeExpansionKey(rootId, basePath)
      ] ||
      (basePath === knowledgeRootPath
        ? restoredKnowledgeExpansion.current[rootId]
        : undefined) ||
      []
    ).slice(0, 24)
  }

  async function loadKnowledgeFolder(
    rootId: string,
    path: string,
    generation = knowledgeRequest.current,
    throwOnError = false,
  ): Promise<WorkspaceListing | undefined> {
    if (generation !== knowledgeRequest.current) return undefined
    const requestId = ++knowledgeFolderRequestId.current
    knowledgeFolderLoads.current.set(path, requestId)
    if (path === knowledgeRootPath) {
      knowledgeRootLoadGeneration.current = generation
    }
    const currentRequest = () =>
      generation === knowledgeRequest.current &&
      knowledgeFolderLoads.current.get(path) === requestId
    const ownsLoading = (folders: KnowledgeFolders) => {
      const latest = knowledgeFolderLoads.current.get(path)
      return folders[path]?.loadingRequest === requestId &&
        (latest === undefined || latest === requestId)
    }
    setKnowledgeFolders((current) => ({
      ...current,
      [path]: { ...current[path], loading: true, loadingRequest: requestId, error: undefined },
    }))
    try {
      const basePath = knowledgeBasePathFor(rootId)
      const listing = basePath === knowledgeRootPath
        ? await listKnowledgeEntries(rootId, path)
        : await listKnowledgeEntries(rootId, path, basePath)
      // Switching roots invalidates every folder in flight, so a late reply
      // cannot graft one root's entries onto another root's tree.
      if (!currentRequest()) {
        return undefined
      }
      setKnowledgeFolders((current) => {
        if (generation !== knowledgeRequest.current || !ownsLoading(current)) return current
        return { ...current, [path]: { listing, loading: false } }
      })
      return listing
    } catch (caught) {
      if (currentRequest()) {
        // Kept beside the folder that failed: one unreachable branch must not
        // blank the rest of the tree.
        setKnowledgeFolders((current) => {
          if (generation !== knowledgeRequest.current || !ownsLoading(current)) return current
          return {
            ...current,
            [path]: {
              ...current[path],
              error: caught instanceof Error ? caught.message : String(caught),
            },
          }
        })
        if (throwOnError) throw caught
      }
      return undefined
    } finally {
      // View changes reject the payload, but do not leave this request's
      // cached branch busy. A newer request or root owns its own flag.
      if (knowledgeFolderLoads.current.get(path) === requestId) {
        knowledgeFolderLoads.current.delete(path)
        setKnowledgeFolders((current) => {
          if (!ownsLoading(current)) return current
          const { loadingRequest: _request, ...folder } = current[path]
          return { ...current, [path]: { ...folder, loading: false } }
        })
      }
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
      if (
        knowledgeFileStateRef.current ||
        (locationKnowledgeTarget &&
          locationKnowledgeTarget.key === selectedKey)
      ) {
        historyIntentRef.current = 'push'
        setLocationKnowledgeTarget(undefined)
      }
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

  async function refreshKnowledgeFolder(path = knowledgePath) {
    if (!activeRootId) {
      setError('Choose a knowledge root before refreshing files.')
      return
    }
    cancelKnowledgeRestore()
    await loadKnowledgeFolder(activeRootId, path)
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
    fragment?: string,
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
      const basePath = knowledgeBasePathFor(rootId)
      const opened = basePath === knowledgeRootPath
        ? await readKnowledgeFile(rootId, path)
        : await readKnowledgeFile(rootId, path, basePath)
      // Checked before any state write, so a read left over from the previous
      // session cannot land in the one that replaced it.
      if (request !== knowledgeRequest.current) {
        return false
      }
      if (!fromRestore) {
        historyIntentRef.current = 'push'
        setLocationKnowledgeTarget(undefined)
      }
      setKnowledgeFile(opened)
      setKnowledgeFragment(fragment)
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

  async function reloadKnowledgeFile(
    rootId: string,
    path: string,
    generation = knowledgeRequest.current,
  ): Promise<boolean> {
    const refresh = ++knowledgeFileRefreshRequest.current
    const ownerKey = knowledgePanelKey
    const current = () =>
      generation === knowledgeRequest.current &&
      refresh === knowledgeFileRefreshRequest.current &&
      knowledgeViewOwnerKey.current === ownerKey &&
      knowledgeFileStateRef.current?.path === path
    if (!current()) {
      return false
    }
    setError(undefined)
    try {
      const basePath = knowledgeBasePathFor(rootId)
      const refreshed = basePath === knowledgeRootPath
        ? await readKnowledgeFile(rootId, path)
        : await readKnowledgeFile(rootId, path, basePath)
      if (!current()) {
        return false
      }
      setKnowledgeFile(refreshed)
      return true
    } catch (caught) {
      if (current()) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
      return false
    }
  }

  async function selectRoot(
    rootId: string,
    fromRestore = false,
  ): Promise<KnowledgeFolders | undefined> {
    knowledgeHydrated.current = true
    if (!fromRestore) {
      if (
        knowledgeFileStateRef.current ||
        (locationKnowledgeTarget &&
          locationKnowledgeTarget.key === selectedKey)
      ) {
        historyIntentRef.current = 'push'
        setLocationKnowledgeTarget(undefined)
      }
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
    const basePath = knowledgeBasePathFor(rootId)
    const remembered = rememberedKnowledgeExpansion(rootId, basePath)
    setKnowledgeExpansion({
      scope: knowledgeExpansionKey(rootId, basePath),
      paths: remembered,
    })
    const opened = await loadKnowledgeFolder(
      rootId,
      knowledgeRootPath,
      generation,
    )
    const loaded: KnowledgeFolders = opened
      ? { [knowledgeRootPath]: { listing: opened, loading: false } }
      : {}
    for (const folder of remembered) {
      if (generation !== knowledgeRequest.current) {
        return undefined
      }
      const listing = await loadKnowledgeFolder(rootId, folder, generation)
      if (listing) loaded[folder] = { listing, loading: false }
    }
    return opened && generation === knowledgeRequest.current ? loaded : undefined
  }

  async function removeRoot(rootId: string) {
    await deleteKnowledgeRoot(rootId)
    markKnowledgeRootRemoved(rootId)
    setRoots((current) => current.filter((root) => root.id !== rootId))
    sessionKnowledgeRoot.refresh()
    if (rootId === activeRootId) {
      knowledgeRequest.current += 1
      setActiveRootId(undefined)
      setKnowledgeFolders({})
      setKnowledgeExpansion({ paths: [] })
      setKnowledgePath(knowledgeRootPath)
      setKnowledgeFile(undefined)
    }
  }

  async function createRoot(
    computerId: string,
    path: string,
    expectedRevision?: number,
    bindingRootPath = knowledgeRootPath,
  ) {
    const owner = rootCreationOwner.current || { key: selectedKey, revision: expectedRevision }
    rootCreationOwner.current = owner
    const ownerKey = owner.key
    if (ownerKey !== selectedKey) {
      throw new Error('The selected session changed. Reopen the folder picker before adding a root.')
    }
    const saveRoot = selected ? sessionKnowledgeRoot.saveRoot : undefined
    const revision = expectedRevision ?? owner.revision
    if (saveRoot && revision === undefined) {
      sessionKnowledgeRoot.refresh()
      throw new Error(sessionKnowledgeRoot.error || 'Wait for this session\'s saved root to load before adding a folder.')
    }
    const lifetime = knowledgeComputerLifetimes.current.get(computerId) || 0
    const removalSequence = knowledgeRootRemovalSequence.current
    const root = await addKnowledgeRoot({ computerId, path })
    // Adding a root is a round trip, and the computer can be unpaired while
    // it is in flight. The hub drops the root in that case, so accepting this
    // answer would put back something that no longer exists.
    if (
      forgottenComputers.current.has(computerId) ||
      lifetime !== (knowledgeComputerLifetimes.current.get(computerId) || 0)
    ) {
      throw new Error('The computer pairing changed while adding this folder. Choose the computer again.')
    }
    if ((removedKnowledgeRoots.current.get(root.id) || 0) > removalSequence) {
      throw new Error('This Knowledge folder was removed while it was being added. Choose the folder again.')
    }
    // An explicit add has revalidated the folder in this pairing. Earlier
    // removals block stale observations, not a new deliberate add.
    removedKnowledgeRoots.current.delete(root.id)
    setRoots((current) =>
      current.some((entry) => entry.id === root.id)
        ? current
        : [root, ...current],
    )
    if (rootCreationOwner.current !== owner || ownerKey !== selectedKeyStateRef.current) {
      throw new Error('The folder was added to Knowledge, but its originating view changed before it could be linked.')
    }
    if (saveRoot) {
      try {
        await saveRoot(root.id, revision, bindingRootPath)
      } catch (caught) {
        if (
          caught instanceof SessionKnowledgeRequestError &&
          caught.binding &&
          rootCreationOwner.current === owner &&
          `${caught.binding.computerId}:${caught.binding.sessionId}` === ownerKey
        ) {
          owner.revision = caught.binding.revision
        }
        throw caught
      }
    } else await selectRoot(root.id)
    if (rootCreationOwner.current === owner) {
      rootCreationOwner.current = undefined
      setAddRootOpen(false)
      setAddRootInitialLocation(undefined)
    }
  }

  function applyComputerSnapshot(
    loaded: ComputerSummary[],
    startedAtSequence: number,
    generation: number,
  ) {
    const forgotten = new Set<string>()
    if (generation <= computerRecordsSnapshotApplied.current) return forgotten
    computerRecordsSnapshotApplied.current = generation
    const changedAt = (id: string) => Math.max(
      computerEventSequenceRef.current.get(id) || 0,
      computerRecordSequenceRef.current.get(id) || 0,
    )
    const accepted = loaded.filter((computer) =>
      changedAt(computer.id) <= startedAtSequence,
    )
    for (const computer of accepted) {
      forgottenComputers.current.delete(computer.id)
      liftUnpairedTombstones(computer.id)
    }
    const listedIds = new Set(loaded.map((computer) => computer.id))
    const knownIds = new Set([
      ...computersRef.current.map((computer) => computer.id),
      ...rootsRef.current.map((root) => root.computerId),
      ...sessionsRef.current.map((session) => session.computerId),
    ])
    for (const id of knownIds) {
      if (
        !listedIds.has(id) &&
        changedAt(id) <= startedAtSequence
      ) {
        forgotten.add(id)
        if (!forgottenComputers.current.has(id)) forgetComputerKnowledge(id)
      }
    }
    let reconciled = accepted
    for (const computer of computersRef.current) {
      if (changedAt(computer.id) > startedAtSequence) {
        reconciled = upsertComputer(reconciled, computer)
      }
    }
    computersRef.current = reconciled
    setComputers(reconciled)
    discardUnpairedComputers(forgotten)
    return forgotten
  }

  /**
   * Everything this browser holds for a computer that is no longer paired.
   *
   * Reached from the socket event and from the button that does the removing,
   * because only one of those two arrives when the hub is the one being asked.
   * Pending work is invalidated as well: a listing or a newly created root
   * still on its way would otherwise land afterwards and put the computer's
   * knowledge back.
   */
  function forgetComputerKnowledge(computerId: string) {
    sessionKnowledgeRootRef.current.forgetComputer(computerId)
    setResourcesView((current) => current?.computerId === computerId ? undefined : current)
    forgottenComputers.current.add(computerId)
    knowledgeComputerLifetimes.current.set(
      computerId,
      (knowledgeComputerLifetimes.current.get(computerId) || 0) + 1,
    )
    const orphaned = new Set(
      rootsRef.current
        .filter((root) => root.computerId === computerId)
        .map((root) => root.id),
    )
    for (const id of orphaned) markKnowledgeRootRemoved(id)
    setRoots((current) =>
      current.filter((root) => root.computerId !== computerId),
    )
    if (activeRootIdRef.current && orphaned.has(activeRootIdRef.current)) {
      knowledgeRequest.current += 1
      setKnowledgeLoading(false)
      setActiveRootId(undefined)
      setKnowledgeFolders({})
      setKnowledgeExpansion({ paths: [] })
      setKnowledgePath(knowledgeRootPath)
      setKnowledgeFile(undefined)
    }
  }

  /** Opens a session the manager linked to; false when it is not listed. */
  function openManagedSession(target: ManagerSessionRef): boolean {
    // A computer's name is accepted too, as a reply may name it instead.
    const wanted = target.computerId.toLowerCase()
    const session = sessionsRef.current.find(
      (candidate) => candidate.id === target.sessionId &&
        (candidate.computerId === target.computerId || candidate.computerName.toLowerCase() === wanted),
    )
    if (!session) {
      setError('That session is no longer open.')
      return false
    }
    selectSession(session)
    return true
  }

  function selectSession(session: ManagedSession) {
    sessionSelectionIntentRef.current += 1
    historyIntentRef.current = 'push'
    setLocationKnowledgeTarget(undefined)
    if (sessionKey(session) === selectedKey) {
      // Opening the open session again reads it, even one you marked unread.
      unreadHoldRef.current = undefined
      requestReadRef.current(selectedKey)
    }
    setSelectedKey(sessionKey(session))
    setSidebarOpen(false)
    setError(undefined)
  }

  function updateSideThread(key: string, change: (thread: SideThread) => SideThread) {
    setSideQuestions((current) => ({
      ...current,
      [key]: change(current[key] || { open: false, draft: '', entries: [] }),
    }))
  }

  async function askSideQuestion(session: ManagedSession, question: string) {
    const key = sessionKey(session)
    const id = `side-question-${++sideQuestionIdRef.current}`
    // Every answer comes from a fresh fork that knows nothing of this thread,
    // so a follow-up takes the earlier answers with it.
    const earlier = (sideQuestions[key]?.entries || [])
      .filter((entry) => entry.status === 'answered' && entry.answer?.trim())
      .slice(-SIDE_QUESTION_EARLIER_LIMIT)
      .map((entry) => ({
        question: entry.question,
        answer: entry.answer!.trim().slice(0, SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH),
      }))
    const settle = (change: Partial<SideQuestionEntry>) =>
      setSideQuestions((current) => current[key]
        ? {
            ...current,
            [key]: {
              ...current[key],
              entries: current[key].entries.map((entry) =>
                entry.id === id ? { ...entry, ...change } : entry),
            },
          }
        : current)
    updateSideThread(key, (thread) => ({
      ...thread,
      entries: [...thread.entries, { id, question, status: 'pending' }],
    }))
    try {
      settle({
        status: 'answered',
        answer: await askSession(session.computerId, session.id, question, earlier),
      })
    } catch (caught) {
      settle({
        status: 'failed',
        error: caught instanceof Error ? caught.message : String(caught),
      })
    }
  }

  /**
   * Turns the message bar to side questions for the selected session, asking
   * `question` straight away when it can be asked.
   */
  function openSideQuestion(question = '') {
    if (!selected || !selectedSupportsSideQuestions) return
    const key = sessionKey(selected)
    const canAsk = Boolean(question) && selectedComputerOnline && !sideQuestionPending
    // One that cannot be asked yet waits in the bar rather than being dropped
    // with the message text it came from.
    updateSideThread(key, (thread) => ({
      ...thread,
      open: true,
      draft: question && !canAsk ? question : thread.draft,
    }))
    if (canAsk) void askSideQuestion(selected, question)
    window.requestAnimationFrame(() => composerRef.current?.focus({ preventScroll: true }))
  }

  /** Returns the message bar to the session; the thread and its draft stay. */
  function closeSideQuestion() {
    if (!selected) return
    updateSideThread(sessionKey(selected), (thread) => ({ ...thread, open: false }))
    window.requestAnimationFrame(() => composerRef.current?.focus({ preventScroll: true }))
  }

  function submitSideQuestion() {
    if (!selected || !askingAside || !selectedSideThread) return
    const typed = selectedSideThread.draft.trim()
    const question = (sideQuestionCommand(typed)?.question ?? typed).trim()
    if (!question || sideQuestionPending || !selectedComputerOnline) return
    updateSideThread(sessionKey(selected), (thread) => ({ ...thread, draft: '' }))
    void askSideQuestion(selected, question)
  }

  function sideQuestionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Escape') {
      event.preventDefault()
      closeSideQuestion()
      return
    }
    if (event.key !== 'Enter') return
    // As for messages: Return asks on a desktop and adds a line on a phone,
    // where the Ask button sends; Ctrl/Cmd+Enter asks on either.
    if (event.ctrlKey || event.metaKey || (!event.shiftKey && !phoneEnterCreatesNewline())) {
      event.preventDefault()
      submitSideQuestion()
    }
  }

  function openSessionResources(tab: SessionResourceTab, filter = '') {
    if (!selected || !stillListed(selected)) {
      setError('Choose an available session before inspecting its resources.')
      return
    }
    setResourcesView({
      id: ++resourcesViewId.current,
      ownerKey: sessionKey(selected),
      signature: sessionResourceOwner(selected),
      computerId: selected.computerId,
      provider: selected.provider || 'copilot',
      lifetime: knowledgeComputerLifetimes.current.get(selected.computerId) || 0,
      registrationId: computers.find((computer) => computer.id === selected.computerId)?.registrationId,
      tab,
      filter,
    })
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
    if (!selected || cancellingBackgroundTask) {
      return
    }
    const task = selectedBackgroundTasks?.tasks.find(
      (candidate) => candidate.id === taskId,
    )
    if (
      !task?.canCancel ||
      !window.confirm(
        `Stop "${task.description}"?\n\nAny in-progress work from this task may be lost.`,
      )
    ) {
      return
    }
    const target = selected
    const ownerKey = sessionKey(target)
    setCancellingBackgroundTask({ ownerKey, taskId })
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
      setCancellingBackgroundTask((current) =>
        current?.ownerKey === ownerKey && current.taskId === taskId
          ? undefined
          : current,
      )
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
      openSidebar(knowledgeMode === 'hidden' ? 'sessions' : 'knowledge')
    } else if (gesture.action === 'close' && horizontal < 0) {
      setSidebarOpen(false)
    }
  }

  function openNewSession() {
    sessionCreationIntentRef.current += 1
    newSessionOpenRef.current = true
    setNewSessionOpen(true)
  }

  function closeNewSession() {
    newSessionOpenRef.current = false
    setNewSessionOpen(false)
  }

  function sessionCreationStarted(
    creation: Omit<PendingSessionCreation, 'id'>,
  ): SessionCreationHandle {
    const id = `pending-session-${++pendingSessionCreationIdRef.current}`
    const turn =
      sessionCreationQueues.current.get(creation.computerId) ?? Promise.resolve()
    let finish = () => {}
    const finished = new Promise<void>((resolve) => {
      finish = resolve
    })
    const queued = turn.then(() => finished)
    sessionCreationQueues.current.set(creation.computerId, queued)
    void queued.then(() => {
      if (sessionCreationQueues.current.get(creation.computerId) === queued) {
        sessionCreationQueues.current.delete(creation.computerId)
      }
    })
    const handle = {
      id,
      intent: sessionCreationIntentRef.current,
      selectionIntent: sessionSelectionIntentRef.current,
      selectedKey: selectedKeyStateRef.current,
      turn,
      finish,
    }
    setPendingSessionCreations((current) => [...current, { ...creation, id }])
    setSessionCreationError(undefined)
    closeNewSession()
    setSidebarView('sessions')
    setSidebarOpen(true)
    return handle
  }

  function sessionCreationFailed(
    creation: SessionCreationHandle,
    message: string,
  ) {
    creation.finish()
    setPendingSessionCreations((current) =>
      current.filter((pending) => pending.id !== creation.id),
    )
    setSessionCreationError(message)
    if (!newSessionOpenRef.current) {
      setSidebarView('sessions')
    }
  }

  function created(
    session: ManagedSession,
    creation?: SessionCreationHandle,
  ) {
    if (creation) {
      setPendingSessionCreations((current) =>
        current.filter((pending) => pending.id !== creation.id),
      )
    }
    setSessions((current) => upsertSession(current, session))
    creation?.finish()
    const shouldSelect =
      !creation ||
      (
        creation.intent === sessionCreationIntentRef.current &&
        creation.selectionIntent === sessionSelectionIntentRef.current &&
        creation.selectedKey === selectedKeyStateRef.current &&
        !newSessionOpenRef.current
      )
    if (!shouldSelect) {
      return
    }
    historyIntentRef.current = 'push'
    setLocationKnowledgeTarget(undefined)
    setSelectedKey(sessionKey(session))
    closeNewSession()
    setSidebarOpen(false)
  }

  async function submitMessage(enqueue = false) {
    const displayContent = composer
    const trimmedDisplay = displayContent.trim()
    if (
      !selected ||
      !trimmedDisplay ||
      sending ||
      transcribing ||
      uploadingFile
    ) {
      return
    }
    // Sending is asking to see what happens next. A reader who had scrolled
    // back to read something older stayed there, so the message they just sent
    // and the status that follows it -- queued, sent to the terminal, the
    // reply arriving -- all happened somewhere off screen.
    followLatest()
    const targetKey = sessionKey(selected)
    const submittedRecoveryToken =
      restoredFailures.current.get(targetKey) ??
      restoredDraftStamps.current[targetKey]
    const history = composerHistoryRef.current[targetKey]
    const preview = history && history.index < history.messages.length
      ? history
      : undefined
    const consumeLocalCommand = () => {
      if (!preview) {
        setComposer('')
      } else {
        const liveKey = followReplacementsRef.current(targetKey)
        updateComposerDrafts([liveKey], (current) =>
          writeComposerContent(current, liveKey, {
            text: preview.draft,
            pastes: preview.draftPastes,
          }),
        )
      }
      retireAttachments(submittedAttachments)
    }
    const submittedPastes = activeComposerPastes(
      displayContent,
      composerDrafts[targetKey]?.pastes || [],
    )
    const content = expandComposerPastes(displayContent, submittedPastes)
    const submittedAttachments = attachmentsInContent(
      targetKey,
      displayContent,
    )
    if (editingQueuedPromptId) {
      if (enqueue || selectedProviderCapability?.supportsQueuedPromptDispatch !== true) {
        await saveQueuedPromptEdit()
      } else {
        await sendQueuedPromptEdit()
      }
      return
    }
    // Sending clears the composer before the request is answered, so a failure
    // that arrives during it must not be put back on top of what was just
    // sent. The mark is set after draft admission and cleared once the request
    // settles.
    const settleSubmission = () => {
      submissionsInFlight.current.delete(targetKey)
      submissionsInFlight.current.delete(followReplacementsRef.current(targetKey))
      submissionAnchors.current.delete(targetKey)
      submissionAnchors.current.delete(followReplacementsRef.current(targetKey))
    }

    // Asked of the text that is actually sent, not of what the composer shows.
    // A pasted command longer than the threshold is shown as a placeholder, so
    // reading the display meant it was never recognised as a command and went
    // as an ordinary message.
    const trimmedContent = content.trim()
    const isCommand = trimmedContent.startsWith('/')
    const commandName = isCommand
      ? trimmedContent.slice(1).split(/\s+/, 1)[0].toLowerCase()
      : ''
    const resourceCommand = sessionResourceCommand(content)
    if (resourceCommand) {
      consumeLocalCommand()
      settleSubmission()
      reofferFailedPrompt(targetKey)
      openSessionResources(resourceCommand.tab, resourceCommand.filter)
      return
    }
    // Answered beside the session, never by it: a tmux pane would open its own
    // modal for `/ask`, and an SDK session would take it as a prompt.
    const sideQuestion = selectedSupportsSideQuestions ? sideQuestionCommand(content) : undefined
    if (sideQuestion) {
      consumeLocalCommand()
      settleSubmission()
      reofferFailedPrompt(targetKey)
      openSideQuestion(sideQuestion.question)
      return
    }
    // Goes to Oracle alone: never to this session, and Oracle answers it
    // without starting or steering any session.
    const oraclePrompt = oracleCommand(content)
    if (oraclePrompt) {
      const control = oracleControlRef.current
      if (!oracleIndicator.available || !control) {
        // Never handed to the session instead, which would take it as a
        // prompt. The words stay in the message bar for when Oracle is back.
        settleSubmission()
        setError(
          oracleIndicator.unavailableReason ??
            'Oracle is still connecting. Try again in a moment.',
        )
        return
      }
      consumeLocalCommand()
      settleSubmission()
      reofferFailedPrompt(targetKey)
      // A failure keeps the question in Oracle's own message bar.
      await control.ask(oraclePrompt.prompt, { answerOnly: true })
      return
    }
    const command = isCommand
      ? sessionCommands.find(
          (candidate) =>
            candidate.name.toLowerCase() === commandName ||
            slashShortcut(candidate.name) === commandName ||
            candidate.aliases?.some(
              (alias) => alias.toLowerCase() === commandName,
            ),
        )
      : undefined
    const effectiveCommandName = command?.name || commandName
    const appLocalCommand =
      Boolean(resourceCommand) ||
      ['statusline', 'clear', 'restart'].includes(effectiveCommandName) ||
      (
        commandName === 'cwd' &&
        !trimmedContent.slice(commandName.length + 1).trim()
      )
    if (effectiveCommandName === 'statusline') {
      const input = trimmedContent.slice(commandName.length + 1).trim().toLowerCase()
      if (input === 'off') {
        setStatusline((current) => ({ ...current, enabled: false }))
      } else if (input === 'on') {
        setStatusline((current) => ({ ...current, enabled: true }))
      } else {
        setStatuslineOpen(true)
      }
      consumeLocalCommand()
      settleSubmission()
      reofferFailedPrompt(targetKey)
      return
    }
    if (effectiveCommandName === 'clear') {
      consumeLocalCommand()
      // The session this became. Everything the recovery was carrying has just
      // moved here, and offering it against the key that is gone left the
      // replacement holding an empty, already-answered recovery while its
      // marker went on holding the queue.
      const replacementKey = await clearSelectedConversation()
      focusComposer(replacementKey)
      settleSubmission()
      reofferFailedPrompt(replacementKey ?? targetKey)
      return
    }
    if (effectiveCommandName === 'restart') {
      consumeLocalCommand()
      await restartSelectedSession()
      focusComposer(targetKey)
      settleSubmission()
      reofferFailedPrompt(targetKey)
      return
    }
    if (
      commandName === 'cwd' &&
      !trimmedContent.slice(commandName.length + 1).trim()
    ) {
      consumeLocalCommand()
      setCwdOpen(true)
      settleSubmission()
      reofferFailedPrompt(targetKey)
      return
    }
    const shouldEnqueue =
      enqueue ||
      (selected.status === 'running' &&
        isCommand &&
        !command?.allowDuringAgentExecution)
    setError(undefined)
    const submission: ComposerSubmission = {
      id: newCollapsedPasteKey(),
      originKey: targetKey,
      text: displayContent,
      pastes: submittedPastes,
      acknowledgesFailure: preview ? undefined : submittedRecoveryToken,
    }
    // Which failure this send is answering, so the recovery that runs after it
    // can tell that one from a failure it has not answered.
    let acknowledgedStamp: string | undefined
    const acknowledgedFailure = submission.acknowledgesFailure
    let admitted = false
    try {
      admitted = updateComposerDrafts([targetKey], (current) => ({
        ...current,
        [targetKey]: {
          // Sending a history preview does not submit the draft behind it.
          text: preview?.draft || '',
          pastes: preview?.draftPastes || [],
          ...(preview && current[targetKey]?.deliveryUncertain
            ? { deliveryUncertain: true }
            : {}),
          ...(preview && current[targetKey]?.unresolvedPastes
            ? { unresolvedPastes: current[targetKey].unresolvedPastes }
            : {}),
          pendingSubmission: submission,
        },
      }), true)
      if (!admitted) {
        return
      }
      submissionsInFlight.current.add(targetKey)
      submissionAnchors.current.add(targetKey)
      setSending(true)
      const sendOptions = terminalSendOptions({
        status: selected.status,
        provider: selected.provider,
        executionMode: selected.executionMode,
        enqueue: shouldEnqueue,
        appLocalCommand,
      })
      const response = await (isCommand
        ? executeCommand(selected.computerId, selected.id, {
            // A restored prompt can be a slash command, and it answers the
            // failure just as a message does.
            acknowledgesFailure: acknowledgedFailure,
            command: content,
            ...sendOptions,
          })
        : sendMessage(selected.computerId, selected.id, {
            // Whatever they were handed back is answered by this, whether
            // they sent it as it was, edited it, or replaced it outright.
            acknowledgesFailure: acknowledgedFailure,
            content,
            ...sendOptions,
          }))
      const updated = currentSessionResponse(response)
      if (!composerMounted.current) {
        return
      }
      const liveKey = followReplacementsRef.current(targetKey)
      // The terminal took it, but Copilot may hold it as pending and log it
      // only later. A send the app queued instead is already shown in the
      // queue, as a prompt that was not there before this send.
      const queuedBefore = new Set((selected.queuedPrompts || []).map((prompt) => prompt.id))
      const queuedInstead = Boolean(updated.queuedPrompts?.some((prompt) =>
        !queuedBefore.has(prompt.id) && prompt.content.trim() === content.trim()))
      if (
        !isCommand &&
        !shouldEnqueue &&
        !appLocalCommand &&
        selected.executionMode === 'tmux' &&
        !queuedInstead
      ) {
        const echo = createPendingEcho(submission.id, content, selected.messages, Date.now())
        setPendingEchoes((current) => ({
          ...current,
          [liveKey]: [...(current[liveKey] || []), echo],
        }))
      }
      updateComposerDrafts([], (current) => {
        const draft = current[liveKey]
        if (draft?.pendingSubmission?.id !== submission.id) {
          return current
        }
        return {
          ...current,
          [liveKey]: {
            ...draft,
            pendingSubmission: { ...draft.pendingSubmission, accepted: true },
          },
        }
      })
      retireAttachments(submittedAttachments)
      const acknowledged = acknowledgedFailure
      acknowledgedStamp = acknowledged
      if (restoredFailures.current.get(liveKey) === acknowledged) {
        restoredFailures.current.delete(liveKey)
      }
      if (restoredDraftStamps.current[liveKey] === acknowledged) {
        forgetRestoredDraft(liveKey)
      }
      // Only the failure this send was answering. A prompt that failed while
      // this one was in flight was held back precisely because the composer
      // was busy, and this answer is older than it: the session rejects the
      // stale record, so dropping the deferred text here left it invisible
      // for good, with the marker on the server still holding the queue.
      const deferred = unshownFailures.current.get(liveKey)
      if (
        !deferred ||
        deferred.stamp === acknowledged ||
        deferred.stamp !== updated.failedPrompt?.failedAt
      ) {
        unshownFailures.current.delete(liveKey)
      }
      const updatedKey = sessionKey(updated)
      if (
        !removedSessions.current.has(updatedKey) &&
        followReplacementsRef.current(updatedKey) === updatedKey
      ) {
        sessionsRef.current = upsertSession(sessionsRef.current, updated)
        setSessions((current) => upsertSession(current, updated))
      }
      if (composerRefresh && !isCommand && !shouldEnqueue && !queuedInstead) {
        foregroundHandoff.accepted(updated, sessionEventSequenceRef.current.get(liveKey) || 0)
      }
    } catch (caught) {
      if (!composerMounted.current) {
        return
      }
      foregroundHandoff.clear()
      const liveKey = followReplacementsRef.current(targetKey)
      if (
        liveKey === targetKey &&
        !removedSessions.current.has(targetKey) &&
        !sessionsRef.current.some((entry) => sessionKey(entry) === targetKey)
      ) {
        // A refresh can omit the session while the request is in flight. Put
        // its last known row back before releasing the anchor so the restored
        // draft and error remain reachable after a rejection.
        sessionsRef.current = upsertSession(sessionsRef.current, selected)
        setSessions((current) =>
          current.some((entry) => sessionKey(entry) === targetKey)
            ? current
            : upsertSession(current, selected),
        )
      }
      const receipt = submissionReceiptFromError(caught)
      const awaitingReplacement = receipt && receipt.sessionId !== selected.id && liveKey === targetKey &&
        !removedSessions.current.has(`${selected.computerId}:${receipt.sessionId}`)
      if (!removedSessions.current.has(liveKey) || clearingSessions.current.has(liveKey) || awaitingReplacement) {
        if (receipt?.accepted) {
          acknowledgedStamp = submission.acknowledgesFailure
          updateComposerDrafts([], (current) => {
            const draft = current[liveKey]
            if (draft?.pendingSubmission?.id !== submission.id) {
              return current
            }
            return {
              ...current,
              [liveKey]: {
                ...draft,
                pendingSubmission: { ...draft.pendingSubmission, accepted: true },
              },
            }
          })
          retireAttachments(submittedAttachments)
          const tokens = acceptedSubmissionTokens.current.get(liveKey) ?? new Set<string>()
          if (submittedRecoveryToken) tokens.add(submittedRecoveryToken)
          if (receipt.failedAt) tokens.add(receipt.failedAt)
          acceptedSubmissionTokens.current.set(liveKey, tokens)
          const held = restoredDraftStamps.current[liveKey]
          if (held && tokens.has(held)) {
            forgetRestoredDraft(liveKey)
            restoredFailures.current.delete(liveKey)
          }
          const deferred = unshownFailures.current.get(liveKey)
          if (deferred && tokens.has(deferred.stamp)) unshownFailures.current.delete(liveKey)
          if (receipt.failedAt) warnedUncertain.current.set(liveKey, receipt.failedAt)
        } else {
          const token =
            receipt?.failedAt ??
            acknowledgedFailure ??
            submittedRecoveryToken
          if (token) {
            rememberRestoredDraft(liveKey, token, displayContent, true)
            handledFailures.current.set(liveKey, token)
            restoredFailures.current.set(liveKey, token)
            if (unshownFailures.current.get(liveKey)?.stamp === token) unshownFailures.current.delete(liveKey)
          }
          restoreComposerSubmission(
            targetKey,
            submission,
            deliveryUncertaintyFromError(caught) ?? true,
          )
        }
        if (
          (selectedRef.current && sessionKey(selectedRef.current) === liveKey) ||
          (!selectedRef.current && selectedKey === liveKey)
        ) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      }
    } finally {
      if (composerMounted.current) {
        const liveKey = followReplacementsRef.current(targetKey)
        settleSubmission()
        setSending(false)
        // The composer is free again, so anything held back while it was busy
        // is offered now. Waiting for the next draft change left a failure
        // holding the queue with nothing on screen to answer it.
        const stillDeferred = unshownFailures.current.get(liveKey)
        if (admitted && stillDeferred) {
          handledFailures.current.delete(liveKey)
          restoreFailedPromptRef.current(
            liveKey,
            stillDeferred.content,
            stillDeferred.stamp,
          )
        } else if (admitted && (
          // A response can precede the event that clears its failure marker.
          // Reoffering that same failure would put an accepted prompt back.
          acknowledgedStamp === undefined ||
          failureStampFor(liveKey) !== acknowledgedStamp
        )) {
          reofferFailedPrompt(liveKey)
        }
        focusComposer(liveKey)
      }
    }
  }

  /** Unpairing discards a computer's drafts, even if it is paired again before queued work runs. */
  function unpairedSince(computerId: string, intakeSequence: number) {
    return (computerEventSequenceRef.current.get(computerId) || 0) > intakeSequence
  }

  async function transcribeFile(
    file: File,
    targetSession: ManagedSession | undefined = selected,
    intakeSequence = eventSequenceRef.current,
  ) {
    if (!targetSession || unpairedSince(targetSession.computerId, intakeSequence)) {
      return
    }
    const targetKey = sessionKey(targetSession)
    setTranscribing(true)
    setError(undefined)
    try {
      const result = await transcribeAudio(file)
      if (unpairedSince(targetSession.computerId, intakeSequence)) return
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
      recordingIntakeSequenceRef.current = eventSequenceRef.current
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
        const intakeSequence = recordingIntakeSequenceRef.current
        const releaseIntake = holdAttachmentIntake()
        void queueAttachmentWork(() => transcribeFile(file, targetSession, intakeSequence))
          .then(releaseIntake, releaseIntake)
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

  async function uploadFile(attachment: ComposerAttachment) {
    if (!attachment.file) {
      updateAttachment(attachment.ownerKey, attachment.id, {
        status: 'failed',
        error: 'Select the file again before retrying this upload.',
        retryable: false,
      })
      return
    }
    setUploadingFile(true)
    setError(undefined)
    updateAttachment(attachment.ownerKey, attachment.id, {
      status: 'uploading',
      error: undefined,
      retryable: undefined,
    })
    try {
      const uploaded = await uploadSessionFile(
        attachment.computerId,
        attachment.sessionId,
        attachment.file,
      )
      const promptText = `Attached file: \`${uploaded.path}\``
      const liveAttachment = currentAttachment(attachment.id)
      if (!liveAttachment) {
        return
      }
      appendComposerForKey(
        liveAttachment.ownerKey,
        promptText,
        false,
      )
      updateAttachment(liveAttachment.ownerKey, attachment.id, {
        status: 'attached',
        promptText,
      })
      if (
        selectedRef.current &&
        sessionKey(selectedRef.current) === liveAttachment.ownerKey
      ) {
        window.requestAnimationFrame(() => focusComposer(liveAttachment.ownerKey))
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      const liveAttachment = currentAttachment(attachment.id)
      if (liveAttachment) {
        updateAttachment(liveAttachment.ownerKey, attachment.id, {
          status: 'failed',
          error: message,
          retryable: true,
        })
        setError(message)
      }
    } finally {
      setUploadingFile(false)
      if (audioInputRef.current) {
        audioInputRef.current.value = ''
      }
    }
  }

  async function processAttachedFiles(
    files: File[],
    targetSession: ManagedSession,
    preflightErrors = new Map<
      File,
      { message: string; retryable: boolean }
    >(),
    releaseIntake?: () => void,
    intakeSequence = eventSequenceRef.current,
  ) {
    if (unpairedSince(targetSession.computerId, intakeSequence)) return
    const targetKey = sessionKey(targetSession)
    const liveKey = followReplacementsRef.current(targetKey)
    const lineageAvailable =
      !removedSessions.current.has(targetKey) || liveKey !== targetKey
    let liveTarget = resolveAttachmentTarget(targetSession)
    if (!liveTarget && !lineageAvailable) {
      return
    }
    if (!liveTarget && files.some((file) => !isAudioFile(file))) {
      liveTarget = await waitForAttachmentTarget(targetSession)
      if (unpairedSince(targetSession.computerId, intakeSequence)) return
    }
    if (!liveTarget && files.some((file) => !isAudioFile(file))) {
      clipboardPasteBatchesRef.current.delete(liveKey)
    }
    const processableFiles = liveTarget
      ? files
      : files.filter(isAudioFile)
    if (processableFiles.length === 0) {
      return
    }
    const ownerKey = liveTarget ? sessionKey(liveTarget) : liveKey
    const attachedFiles = attachmentFilesRef.current.get(ownerKey) ||
      new Set<File>()
    attachmentFilesRef.current.set(ownerKey, attachedFiles)
    const work: Array<
      | { file: File; audio: true }
      | { attachment: ComposerAttachment; audio: false }
    > = []
    const attachments: ComposerAttachment[] = []
    for (const file of processableFiles) {
      if (attachedFiles.has(file)) {
        continue
      }
      attachedFiles.add(file)
      if (isAudioFile(file)) {
        work.push({ file, audio: true })
      } else if (liveTarget) {
        const preflightError = preflightErrors.get(file)
        const error = preflightError?.message || sessionFileValidationError(file)
        const attachment: ComposerAttachment = {
          id: attachmentId(),
          ownerKey,
          computerId: liveTarget.computerId,
          sessionId: liveTarget.id,
          name: file.name,
          size: file.size,
          file,
          status: error ? 'failed' : 'uploading',
          ...(error ? { error } : {}),
          ...(preflightError?.retryable ? { retryable: true } : {}),
        }
        attachments.push(attachment)
        work.push({ attachment, audio: false })
      }
    }
    if (attachments.length > 0) {
      updateComposerAttachments((current) => ({
        ...current,
        [ownerKey]: [...(current[ownerKey] || []), ...attachments],
      }))
    }
    // Every file now has its row. Audio has none and holds until transcribed.
    if (!work.some((item) => item.audio)) {
      releaseIntake?.()
    }
    for (const item of work) {
      if (item.audio) {
        try {
          if (
            !removedSessions.current.has(targetKey) ||
            followReplacementsRef.current(targetKey) !== targetKey
          ) {
            await transcribeFile(item.file, targetSession, intakeSequence)
          }
        } finally {
          for (const key of new Set([
            ownerKey,
            followReplacementsRef.current(ownerKey),
          ])) {
            const retained = attachmentFilesRef.current.get(key)
            retained?.delete(item.file)
            if (retained?.size === 0) {
              attachmentFilesRef.current.delete(key)
            }
          }
        }
      } else if (item.attachment.status !== 'failed') {
        const current = currentAttachment(item.attachment.id)
        if (current) {
          await uploadFile(current)
        }
      }
    }
  }

  function queueAttachmentWork(run: () => Promise<void>): Promise<void> {
    const queued = attachmentQueueRef.current
      ? attachmentQueueRef.current.then(run)
      : run()
    const tracked = queued.finally(() => {
      if (attachmentQueueRef.current === tracked) {
        attachmentQueueRef.current = undefined
      }
    })
    attachmentQueueRef.current = tracked
    return tracked
  }

  function holdAttachmentIntake(): () => void {
    pendingAttachmentIntakeRef.current += 1
    let held = true
    return () => {
      if (held) {
        held = false
        pendingAttachmentIntakeRef.current -= 1
      }
    }
  }

  function attachedFiles(
    files: File[],
    targetSession: ManagedSession | undefined = selected,
    deduplicateClipboard = false,
  ): Promise<void> {
    if (!targetSession) {
      return Promise.resolve()
    }
    if (recording) {
      setError('Stop recording before attaching files.')
      return Promise.resolve()
    }
    const intakeSequence = eventSequenceRef.current
    if (deduplicateClipboard) {
      const ownerKey = followReplacementsRef.current(sessionKey(targetSession))
      const now = Date.now()
      const releaseIntake = holdAttachmentIntake()
      const work = queueAttachmentWork(async () => {
        setUploadingFile(true)
        try {
          const preflightErrors = new Map<
            File,
            { message: string; retryable: boolean }
          >()
          const validFiles: File[] = []
          for (const file of files) {
            const validationError = isAudioFile(file)
              ? undefined
              : sessionFileValidationError(file)
            if (validationError) {
              preflightErrors.set(file, {
                message: validationError,
                retryable: false,
              })
            } else {
              validFiles.push(file)
            }
          }
          const fingerprintResults: PromiseSettledResult<string>[] = []
          for (const file of validFiles) {
            try {
              fingerprintResults.push({
                status: 'fulfilled',
                value: await clipboardFileFingerprint(file),
              })
            } catch (reason) {
              fingerprintResults.push({ status: 'rejected', reason })
            }
          }
          const fingerprints = new Map<File, string>()
          for (const [index, result] of fingerprintResults.entries()) {
            const file = validFiles[index]!
            if (result.status === 'fulfilled') {
              fingerprints.set(file, result.value)
            } else {
              preflightErrors.set(file, {
                message: result.reason instanceof Error
                  ? result.reason.message
                  : String(result.reason),
                retryable: true,
              })
            }
          }
          const recent = clipboardPasteBatchesRef.current.get(ownerKey)
          const queuedFiles = files.filter((file) => {
            const fingerprint = fingerprints.get(file)
            return preflightErrors.has(file) ||
              fingerprint === undefined ||
              !recent ||
              now - recent.at >= 1_500 ||
              !recent.fingerprints.has(fingerprint)
          })
          clipboardPasteBatchesRef.current.set(ownerKey, {
            at: now,
            fingerprints: new Set(fingerprints.values()),
          })
          if (queuedFiles.length > 0) {
            await processAttachedFiles(
              queuedFiles,
              targetSession,
              preflightErrors,
              releaseIntake,
              intakeSequence,
            )
          }
        } finally {
          setUploadingFile(false)
        }
      })
      void work.then(releaseIntake, releaseIntake)
      return work
    }
    if (files.length === 0) {
      return Promise.resolve()
    }
    const releaseIntake = holdAttachmentIntake()
    const work = queueAttachmentWork(() =>
      processAttachedFiles(files, targetSession, undefined, releaseIntake, intakeSequence),
    )
    void work.then(releaseIntake, releaseIntake)
    return work
  }

  function retryAttachment(attachment: ComposerAttachment): Promise<void> {
    return queueAttachmentWork(() => uploadFile(attachment))
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


  function insertWorkspaceFile(target: ManagedSession, file: WorkspaceFile, ask: boolean) {
    const current = selectedRef.current
    const targetKey = sessionKey(target)
    if (
      !current ||
      sessionKey(current) !== targetKey ||
      current.cwd !== target.cwd ||
      removedSessions.current.has(targetKey)
    ) {
      setError('Reopen this file from the current session before adding a reference.')
      return
    }
    if (!computersRef.current.some((computer) => computer.id === target.computerId && computer.online)) {
      setError(`Reconnect ${target.computerName} to add a file reference.`)
      return
    }
    appendComposerForKey(
      targetKey,
      workspaceFilePrompt(target.cwd, file.path, ask),
    )
    setWorkspaceOpen(false)
    setWorkspaceInitialPath(undefined)
    setWorkspaceInitialKind(undefined)
    window.requestAnimationFrame(() => focusComposer(targetKey))
  }

  function askAboutKnowledgeFile(file: WorkspaceFile) {
    if (
      !selected ||
      !activeRoot ||
      !rootsRef.current.some((root) => root.id === activeRoot.id) ||
      !computersRef.current.some((computer) => computer.id === activeRoot.computerId && computer.online) ||
      knowledgeAskUnavailableReason ||
      knowledgeLoading ||
      knowledgeFile !== file ||
      knowledgeViewOwnerKey.current !== selectedKey ||
      removedSessions.current.has(sessionKey(selected))
    ) {
      setError(
        knowledgeAskUnavailableReason ||
          'Wait for the file to finish opening in this session before asking about it.',
      )
      return
    }
    const targetKey = sessionKey(selected)
    appendComposerForKey(
      targetKey,
      workspaceFilePrompt(activeRoot.path, file.path, true),
    )
    setKnowledgeMode(drawerIsOverlay() ? 'hidden' : 'docked')
    setSidebarOpen(false)
    window.requestAnimationFrame(() => focusComposer(targetKey))
  }



  /**
   * Opens a waiting message for rewriting without taking it out of the queue.
   *
   * Editing used to remove it, so a reader who changed their mind, or simply
   * closed the app, had silently taken their own message off the queue. It
   * stays where it is; Enter writes the change back to it, and the send button
   * is what takes it out and sends it now.
   */
  /**
   * Why an edited message cannot be sent now, if it cannot.
   *
   * Send means send. Nothing can go ahead of work already waiting, and a
   * command the agent will not take mid-turn is queued rather than run, so
   * offering Send in those cases promised something that could not happen and
   * quietly put the message at the back instead. Saving keeps its place, which
   * is what the reader wanted from a queued message anyway.
   */
  // Only while the message being rewritten belongs to the session on screen.
  const editingQueuedPromptId = selectedKey
    ? editingQueuedPrompts[selectedKey]
    : undefined
  const queuedEditUnconfirmed = Boolean(selectedKey && editingQueuedPromptId &&
    unconfirmedQueuedPrompts[selectedKey] === editingQueuedPromptId)
  const selectedComposerPastes = selectedKey ? composerDrafts[selectedKey]?.pastes : undefined
  const terminalDraftExpandedContent = expandComposerPastes(
    composer,
    activeComposerPastes(composer, selectedComposerPastes || []),
  )
  const readonlyResourceCommand = useMemo(() => editingQueuedPromptId ? undefined : sessionResourceCommand(
    terminalDraftExpandedContent,
  ), [editingQueuedPromptId, terminalDraftExpandedContent])
  function forgetQueuedEdit(key: string, promptId: string) {
    updateComposerDrafts([], (current) => {
      const draft = current[key]
      if (draft?.queuedEdit?.promptId !== promptId) return current
      const { queuedEdit: _released, ...remaining } = draft
      return writeComposerContent({ ...current, [key]: remaining }, key, remaining)
    })
  }

  function editQueuedPrompt(prompt: QueuedPrompt) {
    if (!selected || queueActionId || sending || selected.queuedDispatch || selectedRetained) {
      return
    }
    // Already rewriting this one. Starting again would put the queued text
    // back over whatever has been typed since.
    if (editingQueuedPromptId === prompt.id) {
      return
    }
    // Work begun before the rewrite would otherwise land inside it with no
    // row in its baseline, so canceling would discard it.
    if (recording) {
      setError('Stop recording before editing a queued message.')
      return
    }
    if (pendingAttachmentIntakeRef.current > 0) {
      setError(
        'Wait for the attachment or transcription to finish before editing a queued message.',
      )
      return
    }
    // Rewriting a different one, with changes that have not been saved.
    // Replacing the marker silently detaches that rewrite and leaves it in the
    // composer beside a message still waiting, which is how the same thing
    // gets sent twice.
    //
    // Asked of the marker itself rather than of this session's view of it: it
    // becomes undefined when the reader is looking elsewhere, so checking that
    // let an edit started in another session quietly replace one in progress.
    // Whatever was already written here is not this queued message, and the
    // composer holds one draft per session. Overwriting it loses that writing,
    // and Escape would then clear what was left in its place.
    //
    // What the reader actually wrote, not what is on screen: while they are
    // walking back through what they sent, the composer shows an old message
    // and their own text is held in the history record.
    const history = selectedKey
      ? composerHistoryRef.current[selectedKey]
      : undefined
    const unsent = history ? history.draft : composer
    if (unsent.trim() || (selectedKey && composerDraftsRef.current[selectedKey]?.pendingSubmission)) {
      setError(
        'There is already something written here. Send it or clear it before editing a queued message.',
      )
      return
    }
    const key = sessionKey(selected)
    const attachmentIds = (composerAttachmentsRef.current[key] || []).map(
      (attachment) => attachment.id,
    )
    if (updateComposerDrafts([key], (current) => ({
      ...current,
      [key]: {
        text: prompt.content,
        pastes: [],
        queuedEdit: {
          promptId: prompt.id,
          ...(attachmentIds.length > 0 ? { attachmentIds } : {}),
        },
      },
    }), true)) {
      focusComposer(key)
    }
  }

  function cancelQueuedPromptEdit() {
    // Not while the rewriting is being written back. Leaving is meant to leave
    // the message as it was, and letting go here only closes the editor -- the
    // request already on its way still lands, and the message changes anyway,
    // with nothing on screen saying so.
    if (queueActionId) {
      setError(selectedKey && queuedDispatchInFlight.current.has(selectedKey)
        ? 'This message is still being dispatched. Wait for its outcome.'
        : 'This message is still being saved. Try again in a moment.')
      return
    }
    if (queuedEditUnconfirmed && !window.confirm(
      'Delivery was not confirmed. Check the provider before discarding this rewrite. Leaving the editor does not cancel provider work.',
    )) return
    if (!selectedKey) return
    const baseline = new Set(
      composerDraftsRef.current[selectedKey]?.queuedEdit?.attachmentIds || [],
    )
    const attachments = composerAttachmentsRef.current[selectedKey] || []
    discardAttachmentsById(
      attachments
        .filter((attachment) => !baseline.has(attachment.id))
        .map((attachment) => attachment.id),
    )
    const retainedPromptText = attachments
      .filter((attachment) =>
        baseline.has(attachment.id) && attachment.promptText !== undefined,
      )
      .map((attachment) => attachment.promptText!)
      .join('\n\n')
    updateComposerDrafts([selectedKey], (current) => {
      if (retainedPromptText) {
        return writeComposerContent(current, selectedKey, {
          text: retainedPromptText,
          pastes: [],
        })
      }
      const { [selectedKey]: _left, ...rest } = current
      return rest
    })
  }

  /** Writes the composer back to the message it was opened from. */
  // A message being rewritten is still an ordinary waiting message: the agent
  // can reach it and send it, and it can be removed from the row beside the
  // composer. Either way it is no longer there to be written back to, and the
  // banner would go on offering a Save that could not succeed.
  //
  // The rewriting is not thrown away. Whatever has been typed stays in the
  // composer as an ordinary draft, so nothing the reader wrote is lost to a
  // race they could not see.
  useEffect(() => {
    const keys = Object.keys(editingQueuedPrompts)
    if (!keys.length || !sessions.length) {
      return
    }
    // A marker is only let go of when the session it belongs to is here and
    // has actually said the message is gone. Absent is not gone: a listing
    // that never reached that computer carries none of its sessions, and a
    // terminal session that is merely not open is still stored with its queue
    // and comes back on recovery. Reading either as deletion turned the
    // rewrite into an ordinary draft standing beside a message still queued,
    // which is how the same thing gets delivered twice.
    //
    // A marker left behind costs nothing now that each session has its own: it
    // blocks no other session, and it is answered the moment its own comes
    // back.
    const stale = keys.filter((key) => {
      const owner = sessions.find((session) => sessionKey(session) === key)
      if (!owner || !owner.queuedPrompts) {
        return false
      }
      if (
        owner.queuedDispatch?.promptId === editingQueuedPrompts[key] ||
        queuedDispatchInFlight.current.get(key) === editingQueuedPrompts[key] ||
        submissionsInFlight.current.has(key) ||
        unconfirmedQueuedPrompts[key] === editingQueuedPrompts[key]
      ) return false
      // Not while the session is working. A drain takes the prompt off before
      // it dispatches and puts it back if it cannot go, so an absence seen
      // then says nothing -- and letting the marker go in that window left the
      // rewrite as an ordinary draft beside the message that came back.
      if (owner.status === 'running' || owner.status === 'waiting') {
        return false
      }
      return !owner.queuedPrompts.some(
        (prompt) => prompt.id === editingQueuedPrompts[key],
      )
    })
    if (!stale.length) {
      return
    }
    updateComposerDrafts([], (current) => {
      let next = current
      for (const key of stale) {
        const draft = next[key]
        if (draft?.queuedEdit?.promptId !== editingQueuedPrompts[key]) continue
        const { queuedEdit: _released, ...remaining } = draft
        next = writeComposerContent({ ...next, [key]: remaining }, key, remaining)
      }
      return next
    })
  }, [editingQueuedPrompts, unconfirmedQueuedPrompts, sessions])

  /** Applies a session to the list, and to what this turn can read back. */
  // `setSessions` schedules; `sessionsRef` is what anything already running
  // reads. Without both, the next drag in the lane resumed from the order that
  // had just been refused and asked for it again.
  function applySession(session: ManagedSession) {
    sessionsRef.current = upsertSession(sessionsRef.current, session)
    setSessions((current) => upsertSession(current, session))
  }

  /** Whether a session is still one the app knows about. */
  // A response can come back after the session it is about has been deleted.
  // Upserting then puts the session back: one nothing can be done with, that
  // no later event will clear, because its removal has already been and gone.
  function stillListed(session: ManagedSession): boolean {
    const key = sessionKey(session)
    // The tombstone first. A removal event and this reply can arrive between
    // renders, and the list read here is the one from the last render -- so a
    // session already known to be gone was still found in it.
    if (removedSessions.current.has(key)) {
      return false
    }
    return sessionsRef.current.some(
      (candidate) => sessionKey(candidate) === key,
    )
  }

  /** Whether the text names a command this app answers rather than the agent. */
  function isWebOnlyCommand(text: string): boolean {
    if (!text.startsWith('/')) {
      return false
    }
    const name = text.slice(1).split(/\s+/, 1)[0].toLowerCase()
    return webCommands.some(
      (candidate) =>
        (candidate.name !== 'ask' || selectedSupportsSideQuestions) &&
        (candidate.name.toLowerCase() === name ||
          candidate.aliases?.some((alias) => alias.toLowerCase() === name)),
    )
  }

  /** The command this session knows by that name, shortcut or alias. */
  function knownCommand(name: string): SlashCommand | undefined {
    const wanted = name.toLowerCase()
    return sessionCommands.find(
      (candidate) =>
        candidate.name.toLowerCase() === wanted ||
        slashShortcut(candidate.name) === wanted ||
        candidate.aliases?.some((alias) => alias.toLowerCase() === wanted),
    )
  }

  function queuedEditSubmission() {
    const promptId = editingQueuedPromptId
    // What the composer held when the save was asked for, and what is sent.
    // The draft is only cleared if it is still exactly this, so a newline
    // typed while the request was in flight is not thrown away.
    if (!selected || !promptId || queueActionId || uploadingFile || transcribing ||
      submissionsInFlight.current.has(sessionKey(selected))) {
      return false
    }
    const key = sessionKey(selected)
    const draft = composerDraftsRef.current[key]
    const history = composerHistoryRef.current[key]
    if (history && history.index < history.messages.length) {
      setError('Return to your queued rewrite before saving or sending a history preview.')
      return false
    }
    if (!draft || draft.queuedEdit?.promptId !== promptId) return false
    const submitted: ComposerContent = {
      text: draft.text,
      pastes: activeComposerPastes(draft.text, draft.pastes),
    }
    let content = expandComposerPastes(submitted.text, submitted.pastes)
    if (!content.trim()) return false
    if (selected.queuedDispatch || draft.queuedEdit.dispatchPending) {
      setError('Delivery is unconfirmed. Check the provider and resolve the queued dispatch before changing or resending it.')
      return false
    }
    if (content.trimStart().startsWith('/')) {
      content = content.trim()
      const name = content.slice(1).split(/\s+/, 1)[0]
      // A lone slash names nothing, and every single-word command has an empty
      // shortcut -- so it matched the first of them and would have run it.
      if (!name) {
        setError('That is not a command.')
        return false
      }
      // The queue is drained by the agent, so a command it does not have stops
      // the drain when it reaches it -- and everything behind it waits. The
      // ones this app answers are never the agent's; the rest are checked
      // against what this session actually offers, because a session that
      // advertises no commands at all, as Claude does, can run none of them.
      if (isWebOnlyCommand(content)) {
        setError(
          `/${name} is answered by this app rather than the agent, so it cannot wait in the queue. Cancel the edit and run it instead.`,
        )
        return false
      }
      // Only against this session's own list. While the new one is still
      // arriving the previous session's is what is on hand, and reading it as
      // though it described this session let a command only the other provider
      // has be saved into this queue -- where its drain stops on it.
      if (commandsKey !== sessionKey(selected)) {
        setError(
          'Still reading what this session can do. Try again in a moment.',
        )
        return false
      }
      const known = knownCommand(name)
      if (!known) {
        setError(
          `This session has no /${name}, so a message saved as one would stop the queue when it was reached.`,
        )
        return false
      }
      // Written out in full. A shortcut is something this app expands on its
      // way to the runtime, and the queue's own drain does not expand
      // anything -- so `/aa on` stored as typed reached the runtime as `/aa`,
      // which it has never heard of, and the message was consumed without
      // being carried out.
      if (name.toLowerCase() !== known.name.toLowerCase()) {
        content = `/${known.name}${content.slice(name.length + 1)}`
      }
    }
    const target = selected
    const savedKey = sessionKey(target)
    return {
      target,
      savedKey,
      promptId,
      submitted,
      content,
      attachments: attachmentsInContent(savedKey, submitted.text),
    }
  }

  async function saveQueuedPromptEdit(): Promise<boolean> {
    const submission = queuedEditSubmission()
    if (!submission) return false
    const {
      target,
      savedKey,
      promptId,
      submitted,
      content,
      attachments,
    } = submission
    if (!updateComposerDrafts([], (current) => ({ ...current }), true)) return false
    submissionsInFlight.current.add(savedKey)
    submissionAnchors.current.add(savedKey)
    setQueueActionId(promptId)
    setError(undefined)
    try {
      const result = await updateQueuedPrompt(
        target.computerId,
        target.id,
        promptId,
        content,
      )
      if (stillListed(result.session)) {
        applySession(result.session)
      }
      // Kept open when the writing moved on while the request was in flight:
      // the server has the text that was submitted, and the newer writing is
      // still here to be saved in its turn. Closing it left that writing as an
      // ordinary draft beside a message still queued.
      //
      // Read from the draft belonging to the session this was saved for. The
      // mounted textarea shows whatever session is open now, so switching away
      // during the request compared this rewrite against another session's
      // text -- which normally differs, leaving the marker set over an empty
      // composer and blocking every other edit.
      // Only what was actually saved, and only from the session it was saved
      // for. The composer stays writable while the request is in flight, so
      // clearing it regardless threw away anything typed meanwhile -- and
      // reading the live composer cleared the wrong session's draft when the
      // reader moved on before the answer came back.
      updateComposerDrafts([], (drafts) => {
        // Exactly what was submitted. Comparing trimmed values threw away a
        // newline typed while the request was in flight, which on a phone is
        // what Enter puts there.
        const current = drafts[savedKey]
        if (!current || current.queuedEdit?.promptId !== promptId) return drafts
        const durable = durableComposerDraft(savedKey, current)
        if (
          durable.text !== submitted.text ||
          JSON.stringify(durable.pastes) !== JSON.stringify(submitted.pastes)
        ) {
          return drafts
        }
        resetComposerHistory(savedKey)
        const { [savedKey]: _saved, ...rest } = drafts
        return rest
      })
      if (!composerDraftsRef.current[savedKey]) {
        retireAttachments(attachments)
      }
      return true
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      // It went out, or somebody took it off, while it was being rewritten.
      // Saying only "not found" leaves the reader wondering what became of
      // their text; it is still in the composer, and this says so.
      if (/not found/i.test(message)) {
        setError(
          'That message left the queue while you were editing it. Your text is still here.',
        )
        // The row on screen is stale, and edit mode is still pointing at an id
        // that is gone, so every later Save and Send would fail the same way.
        // The queue is read again, which retires the row and, through it, the
        // marker -- leaving the rewriting in the composer.
        try {
          const fresh = await getSession(target.computerId, target.id)
          if (stillListed(fresh)) {
            applySession(fresh)
          }
        } catch {
          // Left as it is. A re-read that failed says nothing about the
          // message, and letting the marker go on the strength of it detached
          // the rewrite from a message that may still be waiting.
          setError(message)
        }
        return false
      }
      setError(message)
      return false
    } finally {
      submissionsInFlight.current.delete(savedKey)
      submissionsInFlight.current.delete(followReplacementsRef.current(savedKey))
      submissionAnchors.current.delete(savedKey)
      submissionAnchors.current.delete(followReplacementsRef.current(savedKey))
      setQueueActionId(undefined)
    }
  }

  async function sendQueuedPromptEdit(): Promise<boolean> {
    const submission = queuedEditSubmission()
    if (!submission) return false
    const {
      target,
      savedKey,
      promptId,
      submitted,
      content,
      attachments,
    } = submission
    if (target.interruption || target.archivedAt) {
      setError('Reopen this session before sending its queued work.')
      return false
    }
    if (selectedProviderCapability?.supportsQueuedPromptDispatch !== true) {
      setError('Update the owning runtime before sending a queued edit immediately.')
      return false
    }
    const pending: ComposerSubmission = {
      ...submitted, id: newCollapsedPasteKey(), originKey: savedKey, queuedPromptId: promptId,
    }
    // Use the same atomic draft/receipt ownership as ordinary submissions.
    // New writing belongs to the now-empty editor, not to this request.
    if (!updateComposerDrafts([savedKey], (current) => ({
      ...current,
      [savedKey]: {
        text: '', pastes: [],
        queuedEdit: {
          promptId,
          dispatchPending: true,
          ...(composerDraftsRef.current[savedKey]?.queuedEdit?.attachmentIds
            ? {
                attachmentIds:
                  composerDraftsRef.current[savedKey]?.queuedEdit?.attachmentIds,
              }
            : {}),
        },
        pendingSubmission: pending,
      },
    }), true)) return false
    queuedDispatchInFlight.current.set(savedKey, promptId)
    submissionsInFlight.current.add(savedKey)
    submissionAnchors.current.add(savedKey)
    setQueueActionId(promptId)
    setError(undefined)
    const restore = (uncertain: boolean) => {
      const liveKey = followReplacementsRef.current(savedKey)
      updateComposerDrafts([liveKey], (current) => {
        const draft = current[liveKey]
        if (draft?.pendingSubmission?.id !== pending.id) return current
        return {
          ...current,
          [liveKey]: {
            ...recoverPendingComposerDraft(durableComposerDraft(liveKey, draft)),
            queuedEdit: {
              promptId,
              ...(uncertain ? { dispatchPending: true } : {}),
              ...(draft.queuedEdit?.attachmentIds
                ? { attachmentIds: draft.queuedEdit.attachmentIds }
                : {}),
            },
            deliveryUncertain: uncertain || undefined,
          },
        }
      })
    }
    try {
      const result = await dispatchQueuedPrompt(target.computerId, target.id, promptId, content)
      if (!composerMounted.current) return result.outcome === 'sent'
      if (result.session && stillListed(result.session)) applySession(result.session)
      if (result.outcome === 'sent' ||
        (result.outcome === 'uncertain' && result.delivery === 'accepted')) {
        const liveKey = followReplacementsRef.current(savedKey)
        updateComposerDrafts([], (drafts) => {
          const draft = drafts[liveKey]
          if (draft?.pendingSubmission?.id !== pending.id) return drafts
          return {
            ...drafts,
            [liveKey]: {
              ...draft,
              pendingSubmission: { ...draft.pendingSubmission, accepted: true },
            },
          }
        })
        retireAttachments(attachments)
        if (result.outcome !== 'sent') setError(result.message || 'The provider accepted this work, but its queue receipt could not be saved. Do not resend it.')
        return true
      }
      restore(!(result.outcome === 'refused' && result.restored))
      setError(result.message || 'Delivery was not confirmed. Your rewrite is still here; do not resend without checking the provider.')
      return false
    } catch (caught) {
      if (!composerMounted.current) return false
      restore(!(caught && typeof caught === 'object' && Reflect.get(caught, 'uncertainDelivery') === false))
      setError(caught instanceof Error ? caught.message : String(caught))
      return false
    } finally {
      if (queuedDispatchInFlight.current.get(savedKey) === promptId) queuedDispatchInFlight.current.delete(savedKey)
      submissionsInFlight.current.delete(savedKey)
      submissionsInFlight.current.delete(followReplacementsRef.current(savedKey))
      submissionAnchors.current.delete(savedKey)
      submissionAnchors.current.delete(followReplacementsRef.current(savedKey))
      setQueueActionId(undefined)
    }
  }

  async function queueDragEnded(event: DragEndEvent) {
    const { active, over } = event
    if (!selected || !over || active.id === over.id || selectedRetained) {
      return
    }
    if (selected.queuedDispatch) {
      setError('Resolve the pending queued dispatch before changing its order.')
      return
    }
    // One drag at a time for a session, and the whole of it inside that lane:
    // the list it is worked out from, the order shown while it is in flight,
    // the request, and whatever is shown if it is refused. Reading the list
    // before waiting for the drag ahead meant working from an arrangement the
    // server had not accepted -- and then persisting it, or putting it back
    // when the recovery read failed.
    const lane = sessionKey(selected)
    let settle: () => void = () => {}
    const mine = new Promise<void>((resolve) => {
      settle = resolve
    })
    const ahead = reorderInFlight.current.get(lane)
    reorderInFlight.current.set(lane, mine)
    try {
      if (ahead) {
        await ahead.catch(() => undefined)
      }
      // Now that whatever was ahead has settled, this is the queue as it
      // actually stands.
      const target = sessionsRef.current.find(
        (candidate) => sessionKey(candidate) === lane,
      )
      const queue = target?.queuedPrompts
      if (!target || !queue) {
        return
      }
      const ids = queue.map((prompt) => `queued:${prompt.id}`)
      const from = ids.indexOf(String(active.id))
      const to = ids.indexOf(String(over.id))
      // Either end of the drag has gone: sent, removed, or moved by the drag
      // ahead of this one. There is no order to build from it.
      if (from < 0 || to < 0) {
        return
      }
      const next = [...queue]
      next.splice(to, 0, ...next.splice(from, 1))
      const order = next.map((prompt) => prompt.id)
      // Shown in the new order straight away: the drag is the answer, and
      // waiting for the round trip makes the list snap back under the pointer.
      applySession({ ...target, queuedPrompts: next })
      setError(undefined)
      try {
        const updated = await reorderQueuedPrompts(
          target.computerId,
          target.id,
          order,
        )
        if (stillListed(updated)) {
          applySession(updated)
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught))
        // Asked for rather than assumed. The refusal usually means the queue
        // has moved on, so putting back the list as it was before the drag
        // would show work that is already gone, or hide work that has just
        // arrived.
        try {
          const fresh = await getSession(target.computerId, target.id)
          if (stillListed(fresh)) {
            applySession(fresh)
          }
        } catch {
          // Even the re-read failed, so the best available answer is the queue
          // as it stood when this drag began -- which, inside the lane, is an
          // order the server had accepted. Only if it is still a session at
          // all: put back after its removal has been seen, the snapshot
          // reappears as one nothing can act on and no later event will clear.
          if (stillListed(target)) {
            applySession(target)
          }
        }
      }
    } finally {
      settle()
      // Only while it is still this operation's. Deleting whatever is there
      // threw away a later drag's place in the lane, and the two then ran
      // together after all.
      if (reorderInFlight.current.get(lane) === mine) {
        reorderInFlight.current.delete(lane)
      }
    }
  }


  async function manageQueuedPrompt(promptId: string, edit: boolean) {
    if (!selected || queueActionId || selectedRetained) {
      return
    }

    const target = selected
    const claim = target.queuedDispatch?.promptId === promptId ? target.queuedDispatch : undefined
    if (claim && !window.confirm(
      'This prompt may already have been delivered. Check the provider before discarding this queue item. Discarding will not resend it or cancel provider work.',
    )) return
    setQueueActionId(promptId)
    setError(undefined)
    try {
      const result = await removeQueuedPrompt(
        target.computerId,
        target.id,
        promptId,
        ...(claim ? [claim.attemptId] as const : []),
      )
      if (stillListed(result.session)) {
        setSessions((current) => upsertSession(current, result.session))
      }
      // Taken off deliberately, and acknowledged, so this is the one absence
      // that is not a drain's doing. The marker goes with it: left set while
      // the session was working, the banner offered to save into a message
      // that was not there and no other could be edited until it settled.
      const removedKey = sessionKey(target)
      forgetQueuedEdit(removedKey, promptId)
      if (edit) {
        replaceComposer(result.prompt.content)
        window.requestAnimationFrame(() => composerRef.current?.focus())
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setQueueActionId(undefined)
    }
  }

  function adoptConversationReplacement(
    target: ManagedSession,
    replacement: ManagedSession,
  ): string | undefined {
    const targetKey = sessionKey(target)
    const replacementKey = sessionKey(replacement)
    replacedInto.current.set(targetKey, replacementKey)
    const liveKey = followReplacementsRef.current(replacementKey)
    const liveIsGone = removedSessions.current.has(liveKey)
    adoptedReplacements.current.add(targetKey)
    const migratedAttachmentIds = new Set(
      (composerAttachmentsRef.current[targetKey] || []).map(
        (attachment) => attachment.id,
      ),
    )
    migrateSessionState(targetKey, liveKey)
    if (liveKey === replacementKey) {
      const pendingCleanup = pendingAttachmentReplacements.current.get(liveKey)
      pendingAttachmentReplacements.current.delete(liveKey)
      for (const id of pendingCleanup || []) {
        migratedAttachmentIds.add(id)
      }
      rebindAttachments(liveKey, replacement)
      if (!replacement.recovery && migratedAttachmentIds.size > 0) {
        discardAttachmentsById(migratedAttachmentIds)
      }
    }
    eventSequenceRef.current = nextSessionEventSequence()
    sessionEventSequenceRef.current.set(targetKey, eventSequenceRef.current)
    sessionEventSequenceRef.current.set(replacementKey, eventSequenceRef.current)
    const retire = (current: ManagedSession[]) => {
      const without = current.filter(
        (session) =>
          session.id !== target.id ||
          session.computerId !== target.computerId,
      )
      return liveKey === replacementKey && !liveIsGone
        ? upsertSession(without, replacement)
        : without
    }
    sessionsRef.current = retire(sessionsRef.current)
    setSessions(retire)
    if (!liveIsGone) {
      setSelectedKey((current) =>
        current === undefined ||
        current === targetKey ||
        current === replacementKey
          ? liveKey
          : current,
      )
    }
    return liveIsGone ? undefined : liveKey
  }

  /** Holds the list for a hidden session's replacement; the result lets go. */
  function holdHiddenReplacement(target: ManagedSession): () => void {
    if (!hiddenSessionKeys.has(sessionKey(target))) return () => {}
    const hold = {
      computerId: target.computerId,
      known: new Set(
        sessionsRef.current
          .filter((session) => session.computerId === target.computerId)
          .map(sessionKey),
      ),
    }
    setReplacementHolds((current) => [...current, hold])
    return () => {
      void syncSessionOrderRef.current().finally(() =>
        setReplacementHolds((current) => current.filter((entry) => entry !== hold)),
      )
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
    const releaseHold = holdHiddenReplacement(target)
    setClearing(true)
    setError(undefined)
    try {
      const cleared = await clearConversation(target.computerId, target.id)
      discardAttachments(targetKey)
      return adoptConversationReplacement(target, cleared)
    } catch (caught) {
      if (
        removedSessions.current.has(targetKey) &&
        followReplacementsRef.current(targetKey) === targetKey
      ) {
        updateComposerDrafts([targetKey], (current) => {
          const { [targetKey]: _removed, ...remaining } = current
          return remaining
        })
      }
      setError(caught instanceof Error ? caught.message : String(caught))
      return sessionKey(target)
    } finally {
      // Released only once the replacement is known, so a removal arriving
      // first cannot discard the position on its way across.
      clearingSessions.current.delete(targetKey)
      releaseHold()
      setClearing(false)
    }
  }

  async function recoverSelectedConversation(): Promise<string | undefined> {
    if (
      !selected ||
      recovering ||
      !selectedCanRecover ||
      !window.confirm(
        `Recover the conversation in "${selected.title}"?\n\nA fresh provider conversation will be created. Old messages remain visible as read-only history, and a bounded text-only context brief will be sent first. Connection-specific tool state cannot be restored.`,
      )
    ) {
      return undefined
    }

    const target = selected
    const targetKey = sessionKey(target)
    clearingSessions.current.add(targetKey)
    const releaseHold = holdHiddenReplacement(target)
    setRecovering(true)
    setError(undefined)
    try {
      const recovered = await recoverConversation(
        target.computerId,
        target.id,
        selectedHasStaleInteraction
          ? 'stale-sdk-interaction'
          : target.status === 'error'
            ? 'provider-error'
            : 'manual',
      )
      const replacementKey = adoptConversationReplacement(target, recovered)
      if (recovered.status === 'error' && recovered.activity) {
        setError(recovered.activity)
      }
      return replacementKey
    } catch (caught) {
      if (
        removedSessions.current.has(targetKey) &&
        followReplacementsRef.current(targetKey) === targetKey
      ) {
        updateComposerDrafts([targetKey], (current) => {
          const { [targetKey]: _removed, ...remaining } = current
          return remaining
        })
      }
      setError(caught instanceof Error ? caught.message : String(caught))
      return sessionKey(target)
    } finally {
      clearingSessions.current.delete(targetKey)
      releaseHold()
      setRecovering(false)
    }
  }

  async function toggleSelectedSessionSuspended(
    // Any session, not only the open one: the list offers this beside each
    // conversation so it can be put down or picked up without opening it.
    session?: ManagedSession,
  ) {
    const target = session || selected
    if (!target) {
      return
    }
    const targetKey = sessionKey(target)
    if (suspendingSessionsRef.current.has(targetKey)) {
      return
    }
    const wasSuspended = target.suspended === true
    if (!wasSuspended && targetKey === selectedKey) {
      // Synchronous before suspendSession's first await: any later selected
      // catalog rejection belongs to the runtime being put down.
      commandCatalogEpoch.current += 1
    }
    suspendingSessionsRef.current.add(targetKey)
    setSuspendingSessions(new Set(suspendingSessionsRef.current))
    setError(undefined)
    try {
      const updated = wasSuspended
        ? await resumeSession(target.computerId, target.id)
        : await suspendSession(target.computerId, target.id)
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      // Offered from the list on purpose, so a session that is not open can be
      // put down without navigating to it. A refusal has to be seen, though,
      // and the error banner belongs to the conversation -- which on a narrow
      // screen is behind the sidebar the reader is looking at.
      //
      // So a failure, and only a failure, opens the session it is about. The
      // sidebar closes either way: a refusal for the session already open left
      // the drawer sitting over the very message explaining it.
      if (targetKey !== selectedKey) {
        selectSession(target)
      } else {
        setSidebarOpen(false)
      }
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      suspendingSessionsRef.current.delete(targetKey)
      setSuspendingSessions(new Set(suspendingSessionsRef.current))
    }
  }

  async function reopenInterruptedSession() {
    if (!selected || reopening) return
    const target = selected
    setReopening(true)
    setError(undefined)
    try {
      const updated = await activateSession(target.computerId, target.id)
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setReopening(false)
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
      selected.suspended === true ||
      suspendingSessionsRef.current.has(sessionKey(selected)) ||
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

  function composerPasted(event: ReactClipboardEvent<HTMLTextAreaElement>) {
    if (!selectedKey) {
      return
    }
    const files = pastedFiles(event.clipboardData)
    if (files.length > 0) {
      event.preventDefault()
      void attachedFiles(files, selected, true)
      return
    }
    const content = event.clipboardData.getData('text/plain')
    if (!content) {
      return
    }
    const lineCount = pastedLineCount(content)
    const textarea = event.currentTarget
    const value = textarea.value
    const targetKey = followReplacementsRef.current(selectedKey)
    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? start
    const existing =
      composerDraftsRef.current[targetKey] || { text: value, pastes: [] }
    const from = composerTextPosition(existing.text, start)
    const to = composerTextPosition(existing.text, end)
    const touchesPaste = activeComposerPastes(
      existing.text, existing.pastes,
    ).some((paste) => {
      const pasteEnd = paste.start + collapsedPasteLabel(paste).length
      return from === to
        ? from > paste.start && from < pasteEnd
        : from < pasteEnd && to > paste.start
    })
    // Ordinary short pastes keep native undo. Capture their actual range so a
    // literal label inserted before an identical owned one cannot steal it.
    if (lineCount <= collapsedPasteLineThreshold && !touchesPaste) {
      rememberComposerEdit(textarea, 'insertFromPaste')
      return
    }
    event.preventDefault()
    const currentPastes = composerDrafts[targetKey]?.pastes || []
    const paste = lineCount > collapsedPasteLineThreshold ? {
      key: newCollapsedPasteKey(),
      id: Math.max(0, ...currentPastes.map((entry) => entry.id)) + 1,
      content,
      lineCount,
      start: 0,
    } : undefined
    let cursor = start
    updateComposerDrafts([targetKey], (current) => {
      const existing = current[targetKey] || { text: value, pastes: [] }
      const edited = applyComposerEdit(
        existing,
        composerTextPosition(existing.text, start),
        composerTextPosition(existing.text, end),
        {
          text: paste ? collapsedPasteLabel(paste) : content,
          pastes: paste ? [paste] : [],
        },
      )
      cursor = edited.cursor
      return writeComposerContent(current, targetKey, edited.content)
    })
    focusComposer(targetKey, cursor)
  }

  function insertComposerNewline() {
    if (!selectedKey) {
      return
    }
    const textarea = composerRef.current
    const start = textarea?.selectionStart ?? composer.length
    const end = textarea?.selectionEnd ?? start
    const targetKey = followReplacementsRef.current(selectedKey)
    let cursor = start + 1
    updateComposerDrafts([targetKey], (current) => {
      const existing = current[targetKey] || { text: '', pastes: [] }
      const edited = applyComposerEdit(
        existing,
        composerTextPosition(existing.text, start),
        composerTextPosition(existing.text, end),
        { text: '\n', pastes: [] },
      )
      cursor = edited.cursor
      return writeComposerContent(current, targetKey, edited.content)
    })
    focusComposer(targetKey, cursor)
  }

  function composerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) {
      return
    }
    // The menu is what Escape is about while it is open -- it sits over the
    // composer, and over the rewriting too, so it is put away first.
    if (event.key === 'Escape' && showCommandMenu) {
      event.preventDefault()
      setCommandMenuDismissed(true)
      return
    }
    if (editingQueuedPromptId) {
      // Rewriting a message that is already waiting. Enter puts the change
      // back where it came from rather than sending it, because the reader
      // queued it on purpose.
      if (event.key === 'Escape') {
        event.preventDefault()
        cancelQueuedPromptEdit()
        return
      }
      if (event.key === 'Enter' && !event.shiftKey && !phoneEnterCreatesNewline()) {
        event.preventDefault()
        void saveQueuedPromptEdit()
        return
      }
    }
    if (!event.altKey && !event.ctrlKey && !event.metaKey) {
      if (event.key.length === 1) {
        rememberComposerEdit(event.currentTarget, 'insertText')
      } else if (event.key === 'Backspace') {
        rememberComposerEdit(event.currentTarget, 'deleteContentBackward')
      } else if (event.key === 'Delete') {
        rememberComposerEdit(event.currentTarget, 'deleteContentForward')
      }
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
    const exactCommand = Boolean(sessionResourceCommand(composer)) ||
      (selectedSuggestion && composer === `/${selectedSuggestion.name}`)
    if (
      (event.key === 'Tab' ||
        (event.key === 'Enter' && !exactCommand)) &&
      selectedSuggestion &&
      !/\s/.test(composer.slice(1))
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
      // The bar is asking aside; recalling a message would write into the
      // session draft it is keeping out of sight.
      askingAside ||
      isEditableTarget(event.target) ||
      sortableDragActiveRef.current
    ) {
      return
    }
    const target = event.target
    if (
      target instanceof Element &&
      target.closest(
        '[role="dialog"], .composer, .side-thread, .user-input-card, .permission-card, .drag-handle, .knowledge-panel, .sidebar-knowledge, .session-actions',
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

  /** Whether the session's computer keeps a closed session to reopen. */
  function keepsClosedSessions(session: ManagedSession): boolean {
    return computers.find((computer) => computer.id === session.computerId)?.providers?.some(
      (provider) => provider.supportsRecoverableClose === true,
    ) === true
  }

  /** Asks how to close a session: to reopen later, or for good. */
  function requestSessionClose(session?: ManagedSession) {
    const target = session || selected
    if (!target || closingSessionsRef.current.has(sessionKey(target))) {
      return
    }
    setCloseRequest(target)
  }

  async function closeSelectedSession(target: ManagedSession, permanently: boolean) {
    const closedKey = sessionKey(target)
    if (closingSessionsRef.current.has(closedKey)) {
      return
    }
    closingSessionsRef.current.add(closedKey)
    setClosingSessions(new Set(closingSessionsRef.current))
    setError(undefined)
    try {
      if (permanently) {
        await deleteSession(target.computerId, target.id)
        closedSessionKeys.current.delete(closedKey)
      } else {
        const closed = await closeSession(target.computerId, target.id)
        const startedAt = sessionResponseStartedAt(closed)
        // Announced again after this close left, and not removed since: it
        // was reopened, here or elsewhere, and is open now.
        if (
          startedAt !== undefined &&
          (sessionEventSequenceRef.current.get(closedKey) || 0) > startedAt &&
          !removedSessions.current.has(closedKey)
        ) {
          return
        }
        recentlyClosed.remember(closed)
        closedSessionKeys.current.add(closedKey)
      }
      removedSessions.current.add(closedKey)
      claimTombstone(closedKey)
      forgetAttachments(closedKey)
      updateComposerDrafts([closedKey], (current) => {
        const { [closedKey]: _removed, ...remaining } = current
        return remaining
      })
      forgetRestoredDraft(closedKey)
      handledFailures.current.delete(closedKey)
      restoredFailures.current.delete(closedKey)
      unshownFailures.current.delete(closedKey)
      // Drafts are cleared for a closed session, and so is everything the
      // knowledge panel remembered about it.
      forgetKnowledgeSession(closedKey)
      setSideQuestions(withoutSideQuestions((key) => key === closedKey))
      // The list and the selection may both have moved on while the delete was
      // in flight, so the removal applies to what is current now.
      const withoutClosed = (current: ManagedSession[]) =>
        current.filter((session) => sessionKey(session) !== closedKey)
      const remaining = withoutClosed(sessionsRef.current)
      sessionsRef.current = remaining
      setSessions(withoutClosed)
      // Only a reader still on the closed session is moved, and never onto
      // another session that is closing too; with none left, nothing is
      // selected. One who picked another session while it closed stays where
      // they chose.
      const next = fallbackSessionKey(remaining, closingSessionsRef.current)
      setSelectedKey((current) =>
        current === closedKey ? next : current,
      )
    } catch (caught) {
      if (sessionKey(target) !== selectedKey) {
        selectSession(target)
      } else {
        setSidebarOpen(false)
      }
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      closingSessionsRef.current.delete(closedKey)
      setClosingSessions(new Set(closingSessionsRef.current))
    }
  }

  function openRecentlyClosed() {
    setRecentlyClosedOpen(true)
    void recentlyClosed.refresh()
  }

  async function reopenClosedSession(session: ManagedSession) {
    const opened = await activateSession(session.computerId, session.id)
    const key = sessionKey(opened)
    closedSessionKeys.current.delete(key)
    removedSessions.current.delete(key)
    recentlyClosed.forget(key)
    setRecentlyClosedOpen(false)
    created(opened)
  }

  async function deleteClosedSession(session: ManagedSession) {
    await deleteSession(session.computerId, session.id)
    closedSessionKeys.current.delete(sessionKey(session))
    recentlyClosed.forget(sessionKey(session))
  }

  async function applyPwaUpdate() {
    if (!updateRegistration || updatingApp) {
      return
    }
    setUpdatingApp(true)
    setError(undefined)
    try {
      await activatePwaUpdate()
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
      const from = computerOrder.indexOf(activeComputer)
      const to = computerOrder.indexOf(overComputer)
      if (from < 0 || to < 0) return
      saveSetting('computerOrder', arrayMove(computerOrder, from, to))
      return
    }
    if (!activeId.startsWith('session:') || !overId.startsWith('session:')) {
      return
    }
    if (sessionSort !== 'custom') {
      setError('Choose Custom order before rearranging sessions.')
      return
    }
    if (navigationView.reorderDisabled) {
      setError('Clear session search and choose All before rearranging sessions.')
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
    const order = sessionOrder[activeSession.computerId] || []
    const from = order.indexOf(activeKey)
    const to = order.indexOf(overKey)
    if (from < 0 || to < 0) return
    const computerId = activeSession.computerId
    // Each listed session carries the hidden or suspended sessions after it
    // that the list leaves out, so they stay where they were relative to it.
    const lane = reorderSessionLaneWithHiddenFollowers(
      order,
      activeKey,
      overKey,
      new Set(
        navigationView.groups
          .find((group) => group.computer.id === computerId)
          ?.sessions.map(sessionKey),
      ),
    )
    // Move it now so the drag lands where it was dropped, but keep what the
    // hub last acknowledged: if the write fails the list has to go back, not
    // sit in a position no other device will ever agree with.
    const acknowledgedRevision = sessionOrderRevisionRef.current
    setSessionOrder({ ...sessionOrderRef.current, [computerId]: lane })
    void (async () => {
      try {
        applySessionOrderSnapshot(await saveSessionOrderLane(computerId, lane))
      } catch (caught) {
        // Another client's update, or a later drag, may have been acknowledged
        // while this was in flight. Undoing to the order captured before the
        // drag would throw that away, so only this attempt is withdrawn.
        if (sessionOrderRevisionRef.current === acknowledgedRevision) {
          setSessionOrder(acknowledgedSessionOrderRef.current)
        }
        // The hub refuses a lane arranged from a view that has moved on, so
        // the list is fetched again rather than left disagreeing with it.
        void syncSessionOrderRef.current()
        setSidebarOpen(false)
        setError(
          `Could not save the session order: ${
            caught instanceof Error ? caught.message : String(caught)
          }`,
        )
      }
    })()
  }

  function changeSessionSort(sort: SessionSort) {
    saveSetting('sessionSort', sort)
  }

  function changeShowHiddenSessions(showHidden: boolean) {
    if (savingHiddenVisibilityRef.current || showHidden === showHiddenSessions) return
    savingHiddenVisibilityRef.current = true
    setSavingHiddenVisibility(true)
    void (async () => {
      try {
        applySessionOrderSnapshot(await saveHiddenSessionVisibility(showHidden))
      } catch (caught) {
        void syncSessionOrderRef.current()
        setError(
          `Could not save hidden-session visibility: ${
            caught instanceof Error ? caught.message : String(caught)
          }`,
        )
      } finally {
        savingHiddenVisibilityRef.current = false
        setSavingHiddenVisibility(false)
      }
    })()
  }

  // Selection, draft, and reading position stay put: a hidden session is
  // still open and still reachable by address or from Oracle.
  function toggleSessionHidden(session: ManagedSession) {
    const key = sessionKey(session)
    if (hidingSessionsRef.current.has(key)) return
    const hide = !hiddenSessionKeys.has(key)
    hidingSessionsRef.current.add(key)
    setHidingSessions(new Set(hidingSessionsRef.current))
    void (async () => {
      try {
        applySessionOrderSnapshot(await saveSessionHidden(session.computerId, session.id, hide))
      } catch (caught) {
        void syncSessionOrderRef.current()
        // The report is in the conversation, which a phone's drawer covers.
        setSidebarOpen(false)
        setError(
          `Could not ${hide ? 'hide' : 'show'} ${session.title} ${
            hide ? 'from' : 'in'
          } the list: ${caught instanceof Error ? caught.message : String(caught)}`,
        )
      } finally {
        hidingSessionsRef.current.delete(key)
        setHidingSessions(new Set(hidingSessionsRef.current))
      }
    })()
  }

  // Shown at once; a refusal puts back what the hub last committed. Only a
  // change you asked for reports one: a read that fails on its own just
  // leaves the session unread.
  function changeSessionUnread(session: ManagedSession, unread: boolean, requested: boolean) {
    const key = sessionKey(session)
    if (unreadSavesRef.current.has(key)) return
    unreadSavesRef.current.set(key, unread)
    setUnreadSaves(new Map(unreadSavesRef.current))
    void (async () => {
      try {
        applySessionOrderSnapshot(await saveSessionUnread(session.computerId, session.id, unread))
      } catch (caught) {
        void syncSessionOrderRef.current()
        if (requested) {
          // The report is in the conversation, which a phone's drawer covers.
          setSidebarOpen(false)
          setError(
            `Could not mark ${session.title} as ${unread ? 'unread' : 'read'}: ${
              caught instanceof Error ? caught.message : String(caught)
            }`,
          )
        } else {
          console.warn('Unable to mark the open session read:', caught)
        }
      } finally {
        unreadSavesRef.current.delete(key)
        setUnreadSaves(new Map(unreadSavesRef.current))
        settleReadIntentRef.current()
      }
    })()
  }

  function toggleSessionUnread(session: ManagedSession) {
    const key = sessionKey(session)
    if (unreadSavesRef.current.has(key)) return
    const unread = !unreadSessionKeysRef.current.has(key)
    if (readIntentRef.current?.key === key) readIntentRef.current = undefined
    // Marked unread while open, it stays so until you open it again or come
    // back to the app; reading it straight away would undo the choice.
    if (unread && key === selectedKey) unreadHoldRef.current = key
    else if (unreadHoldRef.current === key) unreadHoldRef.current = undefined
    changeSessionUnread(session, unread, true)
  }

  function changeShowSuspendedSessions(showSuspended: boolean) {
    if (
      savingSuspendedVisibilityRef.current ||
      showSuspended === showSuspendedSessions
    ) return
    savingSuspendedVisibilityRef.current = true
    setSavingSuspendedVisibility(true)
    void (async () => {
      try {
        applySessionOrderSnapshot(await saveSessionVisibility(showSuspended))
      } catch (caught) {
        void syncSessionOrderRef.current()
        setError(
          `Could not save suspended-session visibility: ${
            caught instanceof Error ? caught.message : String(caught)
          }`,
        )
      } finally {
        savingSuspendedVisibilityRef.current = false
        setSavingSuspendedVisibility(false)
      }
    })()
  }

  function closeShellView() {
    setShellView(undefined)
    if (!desktopLayout) setSidebarOpen(true)
  }
  const shellNavigation = <ShellNavigation displayName={profile.displayName} onNewSession={openNewSession}
    oracleAvailable={oracleIndicator.available}
    unreadCount={notifications.unreadCount} offscreen={!desktopLayout && !sidebarOpen}
    onSettings={() => { setSidebarOpen(false); setSettingsSection(undefined); setSettingsOpen(true) }}
    onOpen={(id) => { if (id === 'scheduler') setScheduleLink(undefined); setSidebarOpen(false); setShellView(id) }}
    onOracle={() => { setSidebarOpen(false); setOracleFocusRequest((request) => request + 1); setOracleOpen(true) }} />

  function computerAdded(computer: ComputerSummary) {
    forgottenComputers.current.delete(computer.id)
    liftUnpairedTombstones(computer.id)
    eventSequenceRef.current = nextSessionEventSequence()
    computerRecordSequenceRef.current.set(computer.id, eventSequenceRef.current)
    computersRef.current = upsertComputer(computersRef.current, computer)
    setComputers(computersRef.current)
  }

  function computerRemoved(computerId: string) {
    eventSequenceRef.current = nextSessionEventSequence()
    computerEventSequenceRef.current.set(computerId, eventSequenceRef.current)
    computersRef.current = computersRef.current.filter((computer) => computer.id !== computerId)
    setComputers(computersRef.current)
    forgetComputerKnowledge(computerId)
    // The removal event may never arrive (socket down), so fence late responses
    // and drop browser-held state here exactly as a snapshot removal does.
    discardUnpairedComputers(new Set([computerId]))
  }


  /**
   * Browser-held state for a computer that is no longer paired: its sessions
   * go with it, so nothing held for them can ever be settled again. Left
   * behind, the text of a prompt that failed stayed in this browser's storage
   * for good, and side answers stayed on screen. Shared by the removal event
   * and a connection check that finds the computer unpaired.
   */
  function discardComputerLocalState(computerId: string) {
    const owned = (key: string) => key.startsWith(`${computerId}:`)
    for (const key of Object.keys(restoredDraftStamps.current)) {
      if (owned(key)) {
        forgetRestoredDraft(key)
        handledFailures.current.delete(key)
        restoredFailures.current.delete(key)
        unshownFailures.current.delete(key)
      }
    }
    for (const key of acceptedSubmissionTokens.current.keys()) {
      if (owned(key)) acceptedSubmissionTokens.current.delete(key)
    }
    setSideQuestions(withoutSideQuestions(owned))
    // Nothing on a computer that has gone is still on its way.
    for (const key of [...pendingReplacements.current]) {
      if (owned(key)) {
        pendingReplacements.current.delete(key)
        settleAttachmentTargetWaiters(key, undefined)
      }
    }
    for (const session of sessionsRef.current) {
      if (session.computerId === computerId) {
        submissionAnchors.current.delete(sessionKey(session))
        forgetAttachments(sessionKey(session))
      }
    }
    updateComposerDrafts(
      Object.keys(composerDraftsRef.current).filter(owned),
      (current) => Object.fromEntries(Object.entries(current).filter(([key]) => !owned(key))),
    )
  }

  /**
   * Sessions, task caches and browser-held state for computers a snapshot
   * found unpaired. Shared by every snapshot (connection check, reconnect,
   * startup), so whichever one wins still cleans up.
   */
  function tombstoneUnpairedSession(computerId: string, key: string) {
    if (removedSessions.current.has(key)) return
    removedSessions.current.add(key)
    const keys = unpairedTombstones.current.get(computerId) ?? new Set<string>()
    keys.add(key)
    unpairedTombstones.current.set(computerId, keys)
  }

  /** A deletion or close owns the tombstone from now on, so pairing again does not lift it. */
  function claimTombstone(key: string) {
    unpairedTombstones.current.get(key.slice(0, key.indexOf(':')))?.delete(key)
  }

  function liftUnpairedTombstones(computerId: string) {
    for (const key of unpairedTombstones.current.get(computerId) ?? []) removedSessions.current.delete(key)
    unpairedTombstones.current.delete(computerId)
  }

  function discardUnpairedComputers(forgotten: ReadonlySet<string>) {
    if (!forgotten.size) return
    // Only a newer computer event can keep a computer; a newer session event does not re-pair its owner.
    const keepSession = (session: ManagedSession) => !forgotten.has(session.computerId)
    const keepTasks = (key: string) => !forgotten.has(key.slice(0, key.indexOf(':')))
    // Fence older responses even if the same computer is paired again before they finish.
    const removedAtSequence = nextSessionEventSequence()
    eventSequenceRef.current = removedAtSequence
    for (const id of forgotten) computerEventSequenceRef.current.set(id, removedAtSequence)
    for (const id of forgotten) discardComputerLocalState(id)
    for (const session of sessionsRef.current) {
      if (!keepSession(session)) {
        const key = sessionKey(session)
        tombstoneUnpairedSession(session.computerId, key)
        sessionEventSequenceRef.current.set(key, removedAtSequence)
      }
    }
    for (const key of new Set([
      ...Object.keys(backgroundTaskSnapshotsRef.current),
      ...backgroundTaskRequestsRef.current.keys(),
    ])) {
      if (!keepTasks(key)) {
        backgroundTaskEventSequenceRef.current.set(key, removedAtSequence)
        if (backgroundTaskRequestsRef.current.has(key)) queuedBackgroundTaskRefreshesRef.current.add(key)
      }
    }
    sessionsRef.current = sessionsRef.current.filter(keepSession)
    setSessions((current) => current.filter(keepSession))
    const tasks = (current: Record<string, BackgroundTaskSnapshot>) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => keepTasks(key)))
    backgroundTaskSnapshotsRef.current = tasks(backgroundTaskSnapshotsRef.current)
    setBackgroundTaskSnapshots(tasks)
  }

  async function checkComputerConnections() {
    const generation = ++snapshotGeneration.current
    const startedAtSequence = eventSequenceRef.current
    const loaded = await listComputers()
    applyComputerSnapshot(loaded, startedAtSequence, generation)
    return computersRef.current
  }

  return (
    <div
      className={`app-shell ${desktopRail ? 'app-shell--rail' : ''} ${
        keyboardOpen ? 'app-shell--keyboard-open' : ''
      } ${signInExpired ? 'app-shell--signed-out' : ''} ${
        oracleOpen &&
        oracleIndicator.available &&
        effectiveOraclePlacement === 'docked'
          ? 'app-shell--oracle-docked'
          : ''
      }`}
      data-accent-theme={accentTheme}
      data-appearance={appearance}
      data-sidebar-view={sidebarView}
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
          '--oracle-panel-width': `${oraclePanelWidth ?? 440}px`,
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
        {desktopLayout ? shellNavigation : null}
        <div className="mobile-knowledge-heading" hidden={sidebarView !== 'knowledge'}>
          <button
            aria-label="Back to sessions"
            className="icon-button"
            onClick={() => setSidebarView('sessions')}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <div>
            <strong>Knowledge</strong>
            <small>{selected?.title || 'Knowledge library'}</small>
          </div>
          <button
            aria-label="New Knowledge folder"
            className="icon-button"
            onClick={() => beginRootCreation()}
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Close files"
            className="icon-button"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <div className="brand">
          <img
            alt=""
            className="brand__mark"
            height={36}
            src={brandIcon}
            width={36}
          />
          <div>
            <strong>Agentic Remote</strong>
            <span>Agents &amp; knowledge, together</span>
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

        <div className="sidebar__body">
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
              <SessionNavigation
                managedSessions={managedSessionKeys}
                onOpenScheduleRun={(target) => {
                  setScheduleLink(target); setSidebarOpen(false); setShellView('scheduler')
                }}
                backgroundTasks={backgroundTaskSnapshots}
                view={navigationView}
                query={sessionQuery}
                filter={sessionFilter}
                showSuspended={showSuspendedSessions}
                showSuspendedSaving={savingSuspendedVisibility}
                showHidden={showHiddenSessions}
                showHiddenSaving={savingHiddenVisibility}
                onQueryChange={setSessionQuery}
                onFilterChange={setSessionFilter}
                onShowSuspendedChange={changeShowSuspendedSessions}
                onShowHiddenChange={changeShowHiddenSessions}
                onRefresh={refreshAuthoritative}
                refreshMessage={refreshMessage}
                refreshState={refreshState}
                creationError={
                  !signInExpired && !newSessionOpen && sidebarOpen && sidebarView === 'sessions'
                    ? sessionCreationError
                    : undefined
                }
                signInExpired={signInExpired}
                loadingError={sessionLoadError}
                onDismissCreationError={() => setSessionCreationError(undefined)}
                onNewSession={openNewSession}
                loading={loading}
                pendingCreations={placedSessionCreations}
                onOpenSessionTasks={openTasksForSession}
                onCloseSession={requestSessionClose}
                onSelectSession={selectSession}
                onToggleSessionSuspended={(session) =>
                  void toggleSelectedSessionSuspended(session)
                }
                selectedKey={selectedKey}
                sort={sessionSort}
                onSortChange={changeSessionSort}
                closingSessions={closingSessions}
                suspendingSessions={suspendingSessions}
                hiddenSessions={hiddenSessionKeys}
                hidingSessions={hidingSessions}
                onToggleSessionHidden={toggleSessionHidden}
                unreadSessions={listedUnreadKeys}
                markingUnreadSessions={markingUnreadKeys}
                onToggleSessionUnread={toggleSessionUnread}
                recentlyClosedCount={recentlyClosed.sessions?.length}
                onOpenRecentlyClosed={openRecentlyClosed}
              />
            </DndContext>
        </div>
        {knowledgeMode !== 'hidden' ? (
          <div className="sidebar-knowledge">
          <div className="sidebar-knowledge__heading">
            <BookOpen aria-hidden="true" size={14} />
            <strong>Knowledge</strong>
            <span>Read-only</span>
            <button
              aria-label="Add a Knowledge folder"
              className="icon-button sidebar-knowledge__add"
              onClick={() => beginRootCreation()}
              type="button"
            >
              <Plus aria-hidden="true" size={16} />
            </button>
          </div>
          <nav aria-label="Knowledge" className="knowledge-tree" ref={knowledgeTreeRef}>
            <KnowledgeRootSelector
                  root={displayedKnowledgeRoot}
                  status={knowledgeRootStatus}
                  loading={sessionKnowledgeRoot.loading}
                  onChoose={openRootPicker}
                  emptyLabel={selected ? 'Choose a session root' : 'Choose a Knowledge folder'}
            />
            {activeRoot && !sessionRootSwitching && !sessionRootUnassigned && !sessionRootUnavailable ? (
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
                    aria-label="Refresh current folder"
                    className="icon-button"
                    disabled={knowledgeLoading || knowledgeFolders[knowledgePath]?.loading}
                    onClick={() => void refreshKnowledgeFolder()}
                    title="Refresh files in the current folder"
                    type="button"
                  >
                    <RefreshCw size={14} />
                  </button>
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
                        <div
                          className={`knowledge-node__status${
                            row.variant === 'error'
                              ? ' knowledge-node__status--error'
                              : ''
                          }`}
                          key={`${row.variant}:${row.path}`}
                          role={row.variant === 'error' ? 'alert' : 'status'}
                          style={
                            {
                              '--knowledge-depth': row.depth,
                            } as CSSProperties
                          }
                        >
                          <span>{row.variant === 'loading'
                            ? row.message || 'Loading...'
                            : row.variant === 'empty'
                              ? 'Empty folder'
                              : row.message}</span>
                          {row.variant === 'error' ? (
                            <button
                              aria-label={`Retry loading ${row.path === '.' ? 'root folder' : row.path}`}
                              disabled={knowledgeFolders[row.path]?.loading}
                              onClick={() => void refreshKnowledgeFolder(row.path)}
                              type="button"
                            >
                              Retry
                            </button>
                          ) : null}
                        </div>
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
                          title={row.path}
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
                          {row.entry.kind === 'directory' ? (
                            row.expanded ? (
                              <FolderOpen aria-hidden="true" size={16} />
                            ) : (
                              <Folder aria-hidden="true" size={16} />
                            )
                          ) : (
                            <WorkspaceFileIcon kind={row.entry.kind} />
                          )}
                          <span className="knowledge-node__name">
                            {row.entry.name}
                          </span>
                        </button>
                      ),
                  )}
                </div>
              </>
            ) : (
              <div className="knowledge-navigation-empty">
                <FolderOpen aria-hidden="true" size={24} />
                <strong>{sessionRootUnavailable ? 'This folder is unavailable' : 'A root for this session'}</strong>
                <p>{sessionRootUnavailable
                  ? 'The saved reference has not been replaced. Retry or choose another folder.'
                  : 'Use the session folder or link an existing Knowledge folder.'}</p>
                <button className="secondary-button" onClick={openRootPicker} type="button">Choose a folder</button>
              </div>
            )}
          </nav>
          </div>
        ) : null}
        {knowledgeMode !== 'hidden' ? (
          <button
            className="mobile-knowledge-entry"
            onClick={() => openSidebar('knowledge')}
            type="button"
          >
            <BookOpen aria-hidden="true" size={17} />
            Knowledge files
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        ) : null}
        <div className="sidebar-settings">
          {!desktopRail && <button
            aria-label="App settings"
            className="sidebar-settings__button"
            onClick={() => {
              setSidebarOpen(false)
              setSettingsSection(undefined)
              setSettingsOpen(true)
            }}
            type="button"
          >
            <Settings size={18} />
            <span>
              <strong>App settings</strong>
              <small>Notifications, updates, and display</small>
            </span>
          </button>}
          {/* On a phone the session list covers the conversation and its
              Oracle bubble, so Oracle is offered here too; CSS shows this
              copy only there. */}
          <OracleButton
            className="sidebar-settings__oracle"
            compact
            indicator={oracleIndicator}
            offscreen={!sidebarOpen}
            onToggle={toggleOracle}
            open={oracleOpen}
            shortcutLabel={shortcutKeys('toggleOracle')}
          />
          <button
            aria-label="Manage computers"
            className="icon-button manage-computers-button"
            onClick={() => {
              if (settingsNavigation) {
                setSettingsSection('settings-computers')
                setSettingsOpen(true)
              } else setComputersOpen(true)
            }}
            type="button"
          >
            <MonitorCog aria-hidden="true" size={18} />
          </button>
        </div>
        {!desktopLayout ? shellNavigation : null}
      </aside>

      {sidebarOpen ? (
        <button
          aria-label="Close sessions"
          className="sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}


      <ReaderWorkspace mode={knowledgeMode}>
      <main className="conversation" hidden={knowledgeMode === 'expanded'}>
        <header className="conversation-header">
          <button
            aria-label="Open sessions"
            className="icon-button mobile-menu"
            onClick={() => openSidebar('sessions')}
            type="button"
          >
            <Menu size={21} />
          </button>
          <div className="conversation-header__title">
            <strong>
              {selected ? (
                <span className="conversation-header__origin">
                  <SessionOriginBadge compact provenance={selected.provenance} />
                  <SessionOriginRunLink provenance={selected.provenance} onOpenRun={(target) => {
                    setScheduleLink(target); setShellView('scheduler')
                  }} />
                </span>
              ) : null}
              {selected?.title || 'Agentic Remote'}
            </strong>
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
            className={`icon-button knowledge-toggle ${
              knowledgeMode !== 'hidden' ? 'icon-button--active' : ''
            }`}
            onClick={toggleKnowledgePanel}
            title={
              selected
                ? `Knowledge for this session (${shortcutKeys('toggleKnowledge')})`
                : `Knowledge (${shortcutKeys('toggleKnowledge')})`
            }
            type="button"
          >
            <BookOpen size={18} />
            <span className="header-action-label">Knowledge</span>
          </button>
          {selected && selectedSupportsSideQuestions ? (
            <button
              aria-label="Ask a side question"
              aria-pressed={askingAside}
              className={`icon-button side-question-toggle ${
                askingAside ? 'icon-button--active' : ''
              }`}
              disabled={!askingAside && (Boolean(editingQueuedPromptId) || recording)}
              onClick={() => askingAside ? closeSideQuestion() : openSideQuestion()}
              title={askingAside
                ? 'Back to your message (Esc)'
                : 'Ask about this session without sending it a prompt (/ask)'}
              type="button"
            >
              <MessageCircleQuestion size={18} />
              <span className="header-action-label">Ask</span>
            </button>
          ) : null}
          <button
            aria-label="New session"
            className="icon-button"
            onClick={openNewSession}
            type="button"
          >
            <Plus size={21} />
          </button>
          {selected ? (
            <SessionActions key={selectedKey}>
              {selectedProviderCapability?.supportsSessionRetention ? (
                <button
                  className="session-action"
                  disabled={!selectedComputerOnline}
                  onClick={() => setRetentionOpen(true)}
                  type="button"
                >
                  <History size={17} />
                  <span>{selected.retention?.pinned ? 'Kept for review' : 'Session retention'}</span>
                </button>
              ) : null}
              <button
                aria-label="View session skills"
                className="session-action"
                onClick={() => openSessionResources('skills')}
                type="button"
              >
                <Command aria-hidden="true" size={17} />
                <span>Skills</span>
              </button>
              <button
                aria-label="View session MCP servers"
                className="session-action"
                onClick={() => openSessionResources('mcp')}
                type="button"
              >
                <Plug aria-hidden="true" size={17} />
                <span>MCP servers</span>
              </button>
              <hr className="session-actions__separator" />
              <button
                aria-label="Rename session"
                className="session-action"
                disabled={!selectedComputerOnline}
                onClick={() => setRenameOpen(true)}
                type="button"
              >
                <Pencil size={17} />
                <span>Rename session</span>
              </button>
              <button
                aria-label={
                  selectedNotificationsMuted
                    ? 'Unmute session notifications'
                    : 'Mute session notifications'
                }
                aria-pressed={selectedNotificationsMuted}
                className={`session-action ${
                  selectedNotificationsMuted ? 'session-action--active' : ''
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
                <span>
                  {selectedNotificationsMuted
                    ? 'Unmute notifications'
                    : 'Mute notifications'}
                </span>
              </button>
              {selected.provider !== 'claude' &&
              selected.executionMode === 'sdk' &&
              selectedProviderCapability?.supportsTmuxMigration === true ? (
                <button
                  aria-label="Move session to tmux"
                  className="session-action"
                  disabled={
                    movingToTmux ||
                    selectedLifecycleBlocked ||
                    selectedSuspending
                  }
                  onClick={() => void moveSelectedSessionToTmux()}
                  title={
                    selected.suspended
                      ? 'Resume the session before moving it to tmux'
                      : 'Move this Copilot session to tmux'
                  }
                  type="button"
                >
                  <SquareTerminal size={18} />
                  <span>Move session to tmux</span>
                </button>
              ) : null}
              <button
                aria-label="Restart session"
                className="session-action"
                disabled={
                  restarting || selectedRestartBlocked
                }
                onClick={() => void restartSelectedSession()}
                type="button"
              >
                <RefreshCw size={17} />
                <span>Restart session</span>
              </button>
              {selectedShowsRecovery ? (
                <button
                  aria-label="Recover conversation"
                  className="session-action"
                  disabled={!selectedCanRecover || recovering}
                  onClick={() => void recoverSelectedConversation()}
                  type="button"
                >
                  <RefreshCw size={17} />
                  <span>Recover conversation</span>
                </button>
              ) : null}
              <hr className="session-actions__separator" />
              <button
                aria-label="Clear conversation"
                className="session-action session-action--danger"
                disabled={
                  clearing || selectedLifecycleBlocked
                }
                onClick={() => void clearSelectedConversation()}
                type="button"
              >
                <Eraser size={17} />
                <span>Clear conversation</span>
              </button>
              <button
                aria-describedby="close-session-description"
                aria-label="Close session"
                className="session-action session-action--danger"
                disabled={selectedClosing || !selectedComputerOnline}
                onClick={() => requestSessionClose()}
                type="button"
              >
                <Trash2 size={18} />
                <span>
                  Close session
                  <small id="close-session-description">
                    {selected && keepsClosedSessions(selected)
                      ? `Stops it; reopen it from Recently closed for ${CLOSED_SESSION_RETENTION_DAYS} days`
                      : 'Permanently deletes this session and history'}
                  </small>
                </span>
              </button>
            </SessionActions>
          ) : null}
        </header>

        {sessionLoadError && !signInExpired ? (
          <div className="error-banner" role="alert">
            <span>{sessionLoadError}</span>
            <button
              aria-label="Retry loading sessions"
              className="error-banner__retry"
              onClick={() => {
                setLoading(true)
                setSessionLoadError(undefined)
                setSessionLoadAttempt((current) => current + 1)
              }}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : null}
        {signInExpired ? null : selected?.restartRecovery?.state === 'recovering' ? (
          <div className="error-banner error-banner--recovery" role="status">
            <span>{selected.restartRecovery.message || 'Recovering the SDK session. Queued work will wait until recovery finishes.'}</span>
          </div>
        ) : selected?.restartRecovery?.state === 'waiting-permission' ? null
          : selected?.interruption || selected?.archivedAt ? (
          <div className="error-banner" role="status">
            <span>{selected.restartRecovery?.message || retainedSessionNotice(selected)}</span>
            <button
              className="error-banner__retry"
              disabled={!selectedComputerOnline || reopening}
              onClick={() => void reopenInterruptedSession()}
              type="button"
            >
              {reopening ? 'Reopening...' : 'Reopen session'}
            </button>
          </div>
        ) : null}
        {error && !signInExpired ? (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError(undefined)}>
              <X size={16} />
            </button>
          </div>
        ) : null}
        {sessionCreationError &&
        !signInExpired &&
        !newSessionOpen &&
        (!sidebarOpen || sidebarView !== 'sessions') ? (
          <div className="error-banner" role="alert">
            <span>{sessionCreationError}</span>
            <button
              aria-label="Dismiss session creation error"
              onClick={() => setSessionCreationError(undefined)}
            >
              <X size={16} />
            </button>
          </div>
        ) : null}

        <div className="timeline" onScroll={timelineScrolled} ref={timelineRef}>
          {!selected ? (
            <EmptyConversation
              onCreate={openNewSession}
              onKnowledge={() => setKnowledgeMode('docked')}
            />
          ) : loadingTranscript &&
          selected.messages.length === 0 &&
          selectedPendingEchoes.length === 0 ? (
            <div className="empty-chat">
              <span className="typing-indicator" aria-label="Loading conversation">
                <i />
                <i />
                <i />
              </span>
            </div>
          ) : selected.messages.length === 0 && selectedPendingEchoes.length === 0 ? (
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
            <PauseFollowingContext.Provider value={pauseFollowing}>
              <ConversationMessages
                computerId={selected.computerId}
                currentToolId={currentTool?.id}
                onShowAll={expandSelectedTranscript}
                onToggleActivity={toggleSelectedActivity}
                openActivityIds={openActivities[sessionKey(selected)]}
                sessionId={selected.id}
                showAll={expandedTranscripts[sessionKey(selected)] === true}
                // Identity is the computer and the session together: two
                // computers can hand out the same provider session id, and
                // keying on the id alone reuses this component between them,
                // carrying an expanded transcript across.
                key={sessionKey(selected)}
                messages={selected.messages}
                pendingEchoes={selectedPendingEchoes}
              />
            </PauseFollowingContext.Provider>
          )}
          {selectedHasStaleInteraction && selectedShowsRecovery ? (
            <StaleInteractionRecoveryCard
              disabled={!selectedCanRecover || recovering}
              onRecover={() => void recoverSelectedConversation()}
              title={
                selected?.pendingPermission?.title ||
                selected?.pendingUserInput?.question ||
                'The provider is waiting on an expired request'
              }
            />
          ) : null}
          {selectedHasStaleInteraction && !selectedShowsRecovery ? (
            <div className="error-banner" role="status">
              <span>Previous request expired: {selected?.pendingPermission?.title || selected?.pendingUserInput?.question}. Reopen the session, then send a new prompt to continue. Queued work remains retained.</span>
            </div>
          ) : null}
          {selected?.pendingPermission && !selected.pendingPermission.stale ? (
            <PermissionCard
              disabled={permissionBusy || selectedRetained}
              onReply={(optionId) => void replyToPermission(optionId)}
              permission={selected.pendingPermission}
            />
          ) : null}
          {selected?.pendingUserInput && !selected.pendingUserInput.stale ? (
            <UserInputCard
              disabled={userInputBusy || selectedRetained}
              // The answer being composed belongs to this question on this
              // session. Keying on it lets a new question start from a blank
              // card, and keeps the card being filled in from being emptied
              // by the session upserts that carry the same request through.
              // The session is part of the key because a terminal request id
              // describes the question, not the session, so the same question
              // on two sessions would otherwise share one card -- and the
              // answer typed into the first would appear in the second.
              key={`${selected.computerId}:${selected.id}:${selected.pendingUserInput.requestId}`}
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
        {/* Over the timeline's bottom right, outside its scroll, so Oracle's
            bubble stays in the corner however short the conversation, and
            Scroll to latest stacks above it instead of underneath. While
            Oracle's panel covers that corner, the dock sits just left of it. */}
        <div
          className="timeline-dock"
          data-oracle-open={
            oraclePanelWidth === undefined ||
            effectiveOraclePlacement === 'docked'
              ? undefined
              : ''
          }
          style={oraclePanelWidth === undefined
            ? undefined
            : { '--oracle-panel-width': `${oraclePanelWidth}px` } as CSSProperties}
        >
          {selected && !followingLatest ? (
            <button
              aria-label="Scroll to latest"
              className="timeline-follow__button"
              onClick={followLatest}
              title="Scroll to latest"
              type="button"
            >
              <ChevronDown size={18} />
            </button>
          ) : null}
          <OracleButton
            floating
            indicator={oracleIndicator}
            onToggle={toggleOracle}
            open={oracleOpen}
            shortcutLabel={shortcutKeys('toggleOracle')}
          />
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
            {statusline.backgroundTasks && selectedSupportsBackgroundTasks ? (
              <SubagentCount snapshot={selectedBackgroundTasks} onOpen={openBackgroundTasks} />
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
          <Composer
            selected={selected}
            selectedRetained={selectedRetained}
            selectedQueueHeadIsSteering={selectedQueueHeadIsSteering}
            selectedQueueAvailable={selectedQueueAvailable}
            foregroundTurnActive={selectedForegroundTurnActive}
            selectedComputerOnline={selectedComputerOnline}
            supportsQueuedPromptDispatch={selectedProviderCapability?.supportsQueuedPromptDispatch === true}
            providerCapability={selectedProviderCapability}
            queueActionId={queueActionId}
            sending={sending}
            editingQueuedPromptId={editingQueuedPromptId}
            queuedEditUnconfirmed={queuedEditUnconfirmed}
            composer={composer}
            expandedComposer={terminalDraftExpandedContent}
            uploadingFile={uploadingFile}
            transcribing={transcribing}
            deliveryUncertain={Boolean(selectedKey && composerDrafts[selectedKey]?.deliveryUncertain)}
            composerStorageError={composerStorageError}
            acceptanceReceiptMissing={acceptanceReceiptMissing}
            missingAcceptanceOwners={missingAcceptanceOwners}
            askingAside={askingAside}
            sideQuestionDraft={sideQuestionDraft}
            sideQuestionPending={sideQuestionPending}
            sideQuestionHasEntries={Boolean(selectedSideThread?.entries.length)}
            sideQuestionPanel={askingAside && selectedSideThread ? (
              <SideQuestionPanel
                entries={selectedSideThread.entries}
                markdownComponents={mermaidComponents}
                onClear={() => updateSideThread(sessionKey(selected), (thread) => ({
                  ...thread,
                  entries: [],
                }))}
                onClose={closeSideQuestion}
                onRetry={(entry) => {
                  updateSideThread(sessionKey(selected), (thread) => ({
                    ...thread,
                    entries: thread.entries.filter((candidate) => candidate.id !== entry.id),
                  }))
                  void askSideQuestion(selected, entry.question)
                }}
                unavailableReason={selectedComputerOnline
                  ? undefined
                  : `Reconnect ${selected.computerName} to ask about this session.`}
              />
            ) : null}
            showCommandMenu={showCommandMenu}
            commandSuggestions={commandSuggestions}
            selectedCommandIndex={selectedCommandIndex}
            selectedAttachments={selectedAttachments}
            recording={recording}
            recordingSeconds={recordingSeconds}
            cancelling={cancelling}
            readonlyResourceCommand={readonlyResourceCommand}
            composerDraftRecovered={composerDraftRecovered}
            statusline={statusline}
            phoneEnterCreatesNewline={phoneEnterCreatesNewline()}
            composerRef={composerRef}
            audioInputRef={audioInputRef}
            sensors={sensors}
            attachmentSize={attachmentSize}
            recordingDuration={recordingDuration}
            compactTokens={compactTokens}
            onQueueDragEnd={(event) => void queueDragEnded(event)}
            onEditQueuedPrompt={editQueuedPrompt}
            onRemoveQueuedPrompt={(promptId) => void manageQueuedPrompt(promptId, false)}
            onDiscardUnconfirmed={() => void manageQueuedPrompt(selected.queuedDispatch!.promptId, false)}
            onSaveQueuedPromptEdit={() => void saveQueuedPromptEdit()}
            onCancelQueuedPromptEdit={cancelQueuedPromptEdit}
            // A file is for the session; while the bar asks aside it would
            // land in the draft it is keeping out of sight. The drop is
            // still taken here, so the browser does not open the file.
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes('Files')) {
                event.preventDefault()
                if (askingAside) event.dataTransfer.dropEffect = 'none'
              }
            }}
            onDrop={askingAside ? (event) => event.preventDefault() : audioDropped}
            onSelectCommand={selectCommand}
            onRetryAttachment={(attachment) => void retryAttachment(attachment)}
            onRemoveAttachment={removeAttachment}
            onBeforeInput={composerBeforeInput}
            onCut={composerCut}
            onChange={(event) => {
              if (askingAside) {
                const draft = event.target.value
                updateSideThread(sessionKey(selected), (thread) => ({ ...thread, draft }))
                return
              }
              composerChanged(event.target.value, (event.nativeEvent as InputEvent).inputType)
            }}
            onKeyDown={askingAside ? sideQuestionKeyDown : composerKeyDown}
            onPaste={composerPasted}
            onFileChange={audioFileChanged}
            onStopRecording={stopRecording}
            onSubmitSideQuestion={submitSideQuestion}
            onStopSession={() => void stopSelectedSession()}
            onOpenAttachmentInput={() => audioInputRef.current?.click()}
            onStartRecording={() => void startRecording()}
            onSubmitMessage={(enqueue) => void submitMessage(enqueue)}
            onOpenRuntime={() => setRuntimeOpen(true)}
            onRecallSentMessage={(id) => { navigateMessageHistory(-1, true, id) }}
            onUseSentMessage={() => {
              if (!selectedKey || !composerDraftsRef.current[selectedKey]) return false
              const history = composerHistoryRef.current[selectedKey]
              if (!history || history.index >= history.messages.length) return false
              // Invalidate the parked preview before serializing the visible draft.
              const committed = updateComposerDrafts([selectedKey], (current) => ({ ...current }), true)
              if (committed) focusComposer(selectedKey)
              return committed
            }}
            onCancelSentMessage={() => {
              if (!selectedKey) return
              const history = composerHistoryRef.current[selectedKey]
              if (!history) return
              setComposerForKey(selectedKey, history.draft, false, history.draftPastes)
              focusComposer(selectedKey)
            }}
            sessionActions={[
              { label: 'Background tasks', onClick: openBackgroundTasks, disabled: !selectedSupportsBackgroundTasks },
              { label: 'Skills', onClick: () => openSessionResources('skills') },
              { label: 'MCP servers', onClick: () => openSessionResources('mcp') },
              ...(selectedProviderCapability?.supportsSessionRetention
                ? [{ label: 'Session retention', onClick: () => setRetentionOpen(true), disabled: !selectedComputerOnline }] : []),
              { label: 'Rename', onClick: () => setRenameOpen(true), disabled: !selectedComputerOnline },
              { label: selectedNotificationsMuted ? 'Unmute notifications' : 'Mute notifications', onClick: () => void toggleSelectedSessionMute(), disabled: mutingSession },
              ...(selected.provider !== 'claude' && selected.executionMode === 'sdk' && selectedProviderCapability?.supportsTmuxMigration
                ? [{ label: 'Move session to tmux', onClick: () => void moveSelectedSessionToTmux(), disabled: movingToTmux || selectedLifecycleBlocked || selectedSuspending }] : []),
              { label: 'Restart', onClick: () => void restartSelectedSession(), disabled: restarting || selectedRestartBlocked },
              ...(selectedShowsRecovery
                ? [{ label: 'Recover conversation', onClick: () => void recoverSelectedConversation(), disabled: !selectedCanRecover || recovering }] : []),
              { label: 'Clear conversation', onClick: () => void clearSelectedConversation(), disabled: clearing || selectedLifecycleBlocked },
              { label: 'Close session', onClick: () => requestSessionClose(), disabled: selectedClosing || !selectedComputerOnline },
            ]}
          />
        ) : null}
      </main>

      <aside
        aria-label="Session knowledge"
        className="knowledge-panel"
        data-document-open={Boolean(knowledgeFile)}
        hidden={knowledgeMode === 'hidden'}
        id="knowledge-panel"
      >
        <header className="knowledge-panel__header">
          <BookOpen aria-hidden="true" size={16} />
          <div className="knowledge-panel__title">
            <strong>Knowledge</strong>
            <small title={activeRoot?.path}>
              {displayedKnowledgeRoot
                ? `${displayedKnowledgeRoot.name} · ${displayedKnowledgeRoot.computerName}`
                : 'Add a root to read files beside this session'}
            </small>
          </div>
          <button
            aria-label="Show files"
            className="icon-button knowledge-panel__files"
            onClick={() => openSidebar('knowledge')}
            type="button"
          >
            <FolderOpen size={16} />
            <span>Files</span>
          </button>
          <button
            aria-label="New knowledge root"
            className="icon-button"
            onClick={() => beginRootCreation()}
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
            title={shortcutKeys('expandKnowledge')}
            type="button"
          >
            {knowledgeMode === 'expanded' ? (
              <Minimize2 size={16} />
            ) : (
              <Maximize2 size={16} />
            )}
          </button>
          {/* Knowledge covers the conversation, and its Oracle bubble,
              whenever it is expanded, and on a phone whenever it is open;
              CSS hides this copy where the conversation is still in view. */}
          <OracleButton
            className="knowledge-panel__oracle"
            compact
            indicator={oracleIndicator}
            onToggle={toggleOracle}
            open={oracleOpen}
            shortcutLabel={shortcutKeys('toggleOracle')}
          />
          <button
            aria-label="Close knowledge panel"
            className="icon-button"
            onClick={() => setKnowledgeMode('hidden')}
            title={shortcutKeys('toggleKnowledge')}
            type="button"
          >
            <X size={16} />
          </button>
        </header>
        {error && !signInExpired ? (
          <div className="error-banner knowledge-panel__error">
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError(undefined)}>
              <X size={16} />
            </button>
          </div>
        ) : null}
        <div className="knowledge-panel__body">
          <div className="knowledge-panel__reader">
            {sessionRootSwitching && !sessionKnowledgeRoot.error ? (
              <div className="knowledge-reader knowledge-reader--empty">
                <LoaderCircle aria-hidden="true" size={26} />
                <h3>Opening this session's Knowledge</h3>
                <p>The previous session's document stays separate.</p>
              </div>
            ) : sessionRootUnavailable || sessionRootUnassigned || (selected && !sessionRootReady) ? (
              <div className="knowledge-reader knowledge-reader--empty knowledge-reader--unassigned">
                {sessionRootUnavailable ? <WifiOff aria-hidden="true" size={28} /> : <FolderOpen aria-hidden="true" size={28} />}
                <h3>{sessionRootUnavailable
                  ? 'Your Knowledge folder is still saved'
                  : sessionKnowledgeRoot.error
                    ? 'Could not load the session root'
                    : 'Give this session a place to read'}</h3>
                <p>{sessionRootUnavailable
                  ? 'The folder is no longer available in this library. Choose another root or retry without replacing its saved reference.'
                  : sessionKnowledgeRoot.error || 'Use the current working folder or choose a folder already in Knowledge.'}</p>
                {displayedKnowledgeRoot ? (
                  <p className="knowledge-root-location">{displayedKnowledgeRoot.computerName}<br />{displayedKnowledgeRoot.path}</p>
                ) : selected ? (
                  <p className="knowledge-root-location">{selected.computerName}<br />{selected.cwd}</p>
                ) : null}
                <div className="knowledge-empty-actions">
                  <button className="primary-button" onClick={openRootPicker} type="button">Choose a session root</button>
                  {sessionRootUnavailable || sessionKnowledgeRoot.error ? (
                    <button className="secondary-button" onClick={() => void retrySessionKnowledge()} type="button">Retry saved root</button>
                  ) : null}
                </div>
                <p className="knowledge-reader__hint">Files stay on their computer. This does not change the agent's working directory.</p>
              </div>
            ) : activeRoot ? (
              <KnowledgeReader
                askUnavailableReason={knowledgeAskUnavailableReason}
                file={knowledgeFile}
                fragment={knowledgeFragment}
                key={`${activeRoot.id}:${knowledgeFile?.path || '.'}`}
                listing={knowledgeListing}
                loading={knowledgeLoading}
                mode={knowledgeMode}
                onLoadAsset={loadKnowledgeAsset}
                onAsk={askAboutKnowledgeFile}
                onShowFiles={() => openSidebar('knowledge')}
                onClose={() => setKnowledgeMode('hidden')}
                oracle={
                  <OracleButton
                    className="knowledge-reader__oracle"
                    compact
                    indicator={oracleIndicator}
                    onToggle={toggleOracle}
                    open={oracleOpen}
                    shortcutLabel={shortcutKeys('toggleOracle')}
                  />
                }
                sessionTitle={selected?.title}
                onOpenFolder={(path) => void openKnowledgeFolder(path)}
                onOpenFile={(path, fragment) =>
                  void openKnowledgeFile(path, undefined, false, fragment)
                }
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
      </ReaderWorkspace>

      {rootPicker ? (
        <DialogFrame
          title={rootPicker.session ? 'Choose a session root' : 'Choose a Knowledge folder'}
          eyebrow={rootPicker.session?.title || 'Knowledge library'}
          onClose={closeRootPicker}
          className="session-root-dialog session-root-dialog--chooser"
        >
          <p className="dialog-message">
            {rootPicker.session ? 'Only this session changes. Files and the working directory stay where they are.' : 'Browse a readable folder without creating a session.'}
          </p>
          {!rootPickerCurrent ? <p className="form-error" role="alert">The selected session changed. Close and reopen this chooser.</p> : null}
          {rootDialogError ? (
            <p className="form-error" role="alert">{rootDialogError}</p>
          ) : null}
          <KnowledgeRootChoices
            roots={roots}
            computers={computers}
            session={rootPicker.session}
            currentRootId={sessionKnowledgeRoot.binding?.rootId}
            currentRootPath={sessionKnowledgeBasePath}
            choice={rootChoice}
            disabled={rootPickerSaving || !rootPickerCurrent || (hasSelectedSession && !sessionRootReady)}
            onChoice={setRootChoice}
            onBrowse={() => beginRootCreation(undefined, rootPicker.revision ?? sessionKnowledgeRoot.binding?.revision)}
            onSaveRoot={(location) => void saveRootPickerFolder(location)}
            savingRoot={rootPickerSaving}
            onRemove={(root) => {
              setRootRemovalError(undefined)
              setRootRemovalTarget(root)
            }}
          />
          <div className="session-root-dialog__actions">
            <button className="secondary-button" onClick={closeRootPicker} type="button">Cancel</button>
            <button
              className="primary-button"
              disabled={rootPickerSaving || !rootPickerCurrent || !rootChoice || (hasSelectedSession && !sessionRootReady)}
              onClick={() => void applyRootChoice()}
              type="button"
            >
              {rootPickerSaving ? 'Saving...' : rootChoice?.kind === 'none' ? 'Unlink this session' : rootPicker.session ? 'Use for this session' : 'Open folder'}
            </button>
          </div>
        </DialogFrame>
      ) : null}
      {rootRemovalTarget ? (
        <DialogFrame
          title="Remove Knowledge folder?"
          eyebrow="Shared Knowledge library"
          onClose={() => setRootRemovalTarget(undefined)}
          className="session-root-dialog"
        >
          <p className="dialog-message">Remove <strong>{rootRemovalTarget.name}</strong> on {rootRemovalTarget.computerName} from Knowledge?</p>
          <p className="knowledge-root-location">{rootRemovalTarget.path}</p>
          <p className="dialog-message">Other sessions may use this root. Their saved references will become unavailable. The files will not be deleted.</p>
          {rootRemovalError ? <p className="form-error" role="alert">{rootRemovalError}</p> : null}
          <div className="session-root-dialog__actions">
            <button className="secondary-button" onClick={() => setRootRemovalTarget(undefined)} type="button">Keep folder</button>
            <button
              className="danger-button"
              disabled={removingRoot}
              onClick={() => {
                const root = rootRemovalTarget
                setRemovingRoot(true)
                setRootRemovalError(undefined)
                void removeRoot(root.id).then(() => {
                  setRootRemovalTarget(undefined)
                  setRootChoice((choice) => choice?.kind === 'root' && choice.rootId === root.id
                    ? undefined : choice)
                }).catch((caught: unknown) => {
                  setRootRemovalError(caught instanceof Error ? caught.message : String(caught))
                }).finally(() => setRemovingRoot(false))
              }}
              type="button"
            >
              {removingRoot ? 'Removing...' : 'Remove from Knowledge'}
            </button>
          </div>
        </DialogFrame>
      ) : null}

      {closeRequestSession ? (
        <CloseSessionDialog
          onCancel={() => setCloseRequest(undefined)}
          onCloseSession={() => {
            setCloseRequest(undefined)
            void closeSelectedSession(closeRequestSession, false)
          }}
          onDelete={() => {
            setCloseRequest(undefined)
            void closeSelectedSession(closeRequestSession, true)
          }}
          recoverable={keepsClosedSessions(closeRequestSession)}
          session={closeRequestSession}
        />
      ) : null}
      {recentlyClosedOpen ? (
        <RecentlyClosedDialog
          computers={computers}
          error={recentlyClosed.error}
          loading={recentlyClosed.loading}
          onClose={() => setRecentlyClosedOpen(false)}
          onDelete={deleteClosedSession}
          onReopen={reopenClosedSession}
          onRetry={() => void recentlyClosed.refresh()}
          sessions={recentlyClosed.sessions}
        />
      ) : null}
      <NewSessionDialog
        computers={computers}
        creationError={newSessionOpen ? sessionCreationError : undefined}
        defaultComputerId={defaultComputerId}
        defaultRuntimes={defaultRuntimes}
        defaultSessionFolders={defaultSessionFolders}
        defaultBackend={newSessionBackend}
        onClose={closeNewSession}
        onCreating={sessionCreationStarted}
        onCreationFailed={sessionCreationFailed}
        onCreated={created}
        open={newSessionOpen}
      />
      <ComputersDialog
        computers={computers}
        onAdded={computerAdded}
        onClose={() => setComputersOpen(false)}
        onRemoved={computerRemoved}
        onCheckConnection={checkComputerConnections}
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
          cancellingTaskId={
            cancellingBackgroundTask?.ownerKey === sessionKey(selected)
              ? cancellingBackgroundTask.taskId
              : undefined
          }
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
          stopActionsDisabled={Boolean(cancellingBackgroundTask)}
        />
      ) : null}
      <AppSettingsDialog
        onDisplayNameChange={(name) => saveSetting('displayName', name)}
        onComputerAdded={computerAdded}
        onComputerRemoved={computerRemoved}
        onCheckComputerConnections={checkComputerConnections}
        onOpenHostMonitor={hostMonitorView ? () => {
          setSettingsOpen(false)
          setSidebarOpen(false)
          setShellView('host')
        } : undefined}
        accentTheme={accentTheme}
        initialSection={settingsSection}
        onApplyUpdate={() => void applyPwaUpdate()}
        onAccentThemeChange={(next) => saveSetting('accent', next)}
        appearance={appearanceSetting}
        onAppearanceChange={(next) => saveSetting('appearance', next)}
        settingsSync={settingsProfile}
        oracleResponseStyle={profile.oracleResponseStyle ?? 'balanced'}
        onOracleResponseStyleChange={(next) => saveSetting('oracleResponseStyle', next)}
        notificationScope={profile.notificationScope ?? 'all'}
        onNotificationScopeChange={(next) => saveSetting('notificationScope', next)}
        schedulerAllowAllForOracle={profile.schedulerAllowAllForOracle === true}
        onSchedulerAllowAllForOracleChange={(next) => saveSetting('schedulerAllowAllForOracle', next)}
        onClose={() => setSettingsOpen(false)}
        computers={computers}
        defaultRuntimes={defaultRuntimes}
        defaultSessionFolders={defaultSessionFolders}
        onDefaultRuntimesChange={setDefaultRuntimes}
        onDefaultSessionFoldersChange={setDefaultSessionFolders}
        newSessionBackend={newSessionBackend}
        onNewSessionBackendChange={setNewSessionBackend}
        onShortcutsChange={setShortcutOverrides}
        onStatuslineChange={setStatusline}
        shortcutOverrides={shortcutOverrides}
        shortcuts={shortcuts}
        onUpdateReady={setUpdateRegistration}
        open={settingsOpen}
        statusline={statusline}
        updateRegistration={updateRegistration}
        updatingApp={updatingApp}
      />
      {shellView === 'notifications' && <NotificationPanel enabled={notificationPanel} notifications={notifications}
        onClose={closeShellView} onOpen={(record) => {
          const target = record.kind.startsWith('schedule.run.') ? readScheduleLink(record.url) : undefined
          if (target && schedulerView) { setScheduleLink(target); setShellView('scheduler') }
          else if (record.kind === 'oracle.message') { setOracleOpen(true); setShellView(undefined) }
          else if (record.sessionId && record.computerId && openManagedSession({ computerId: record.computerId, sessionId: record.sessionId })) setShellView(undefined)
        }} />}
      {shellView === 'host' && <HostMonitorView computers={computers} enabled={hostMonitorView}
        onClose={closeShellView} onOpenSession={(computerId, sessionId) => {
          if (openManagedSession({ computerId, sessionId })) setShellView(undefined)
        }} />}
      {shellView === 'scheduler' && <SchedulerView key={`${scheduleLink?.scheduleId ?? shellView}:${scheduleLink?.runId ?? ''}`} enabled={schedulerView} computers={computers}
        initialScheduleId={scheduleLink?.scheduleId} initialRunId={scheduleLink?.runId}
        onOpenOracle={oracleIndicator.available ? () => { setShellView(undefined); setOracleOpen(true) } : undefined}
        onClose={closeShellView} onOpenSession={(computerId, sessionId) => {
          if (openManagedSession({ computerId, sessionId })) setShellView(undefined)
        }} />}
      <RuntimeDialog
        onClose={() => setRuntimeOpen(false)}
        onConfigured={(session) => {
          setSessions((current) => upsertSession(current, session))
          setRuntimeOpen(false)
        }}
        open={runtimeOpen}
        session={selected}
      />
      {retentionOpen && selected ? (
        <DialogFrame eyebrow="Session" title="Session retention" onClose={() => setRetentionOpen(false)}>
          <SessionRetentionSettings
            key={selectedKey}
            disabled={!selectedComputerOnline}
            value={selected.retention}
            save={async (input) => {
              const updated = await configureRetention(selected.computerId, selected.id, input)
              setSessions((current) => upsertSession(current, updated))
            }}
          />
        </DialogFrame>
      ) : null}
      {signInExpired && !modalOpen ? (
        // Everything else would fail the same way, so this stands alone.
        <SignInExpiredNotice placement="floating" />
      ) : null}
      {settingsNotice(settingsProfile) && !(updateRegistration && !updateToastDismissed) ? (
        <div className="update-toast settings-toast" role="status">
          <span>{settingsNotice(settingsProfile)}</span>
          <button
            aria-label="Dismiss settings notice"
            className="update-toast__dismiss"
            onClick={() => settingsClient.dismissNotice()}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}
      {updateRegistration && !updateToastDismissed ? (
        <div className="update-toast" role="status">
          <span>An Agentic Remote update is ready.</span>
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
          insertUnavailableReason={workspaceInsertUnavailableReason}
          key={`${selectedKey}:${selected.cwd}`}
          onClose={() => {
            setWorkspaceOpen(false)
            setWorkspaceInitialPath(undefined)
            setWorkspaceInitialKind(undefined)
          }}
          onInsert={(file, ask) => insertWorkspaceFile(selected, file, ask)}
          onMoved={(session) => {
            setSessions((current) => upsertSession(current, session))
            setWorkspaceOpen(false)
            setWorkspaceInitialPath(undefined)
            setWorkspaceInitialKind(undefined)
          }}
          session={selected}
        />
      ) : null}
      <SessionResourcesDialog
        lifetime={resourcesView ? knowledgeComputerLifetimes.current.get(resourcesView.computerId) || 0 : 0}
        registrationId={computers.find((computer) => computer.id === selected?.computerId)?.registrationId}
        onClose={closeSessionResources}
        online={selectedComputerOnline}
        session={selected}
        supported={selectedProviderCapability?.supportsSessionResources === true}
        view={resourcesView}
      />
      {addRootOpen ? (
        <AddKnowledgeRootDialog
          computers={computers}
          initialComputerId={addRootInitialLocation?.computerId}
          initialPath={addRootInitialLocation?.path}
          onClose={() => {
            rootCreationOwner.current = undefined
            promptForEmptyKnowledgeRoot.current = false
            setAddRootOpen(false)
            setAddRootInitialLocation(undefined)
          }}
          onCreate={createRoot}
        />
      ) : null}
      <ManagerAssistant
        connectionEpoch={0}
        scheduleProposalEpoch={scheduleProposalEpoch}
        controlRef={oracleControlRef}
        defaults={managerDefaults}
        onIndicatorChange={setOracleIndicator}
        onManagedSessionsChange={changeManagedSessions}
        onOpenChange={setOracleOpen}
        onOpenSession={openManagedSession}
        onOpenSettings={() => {
          setSettingsSection('settings-oracle-model')
          setSettingsOpen(true)
        }}
        onWidthChange={setOraclePanelWidth}
        open={oracleOpen}
        focusRequest={oracleFocusRequest}
        onRequestSessionFocus={focusActiveSessionComposer}
        onPlacementChange={changeOraclePlacement}
        placement={effectiveOraclePlacement}
        placementShortcutLabel={shortcutKeys('toggleOracleDock')}
        preferredPlacement={oraclePlacement}
        reservedLeft={
          effectiveOraclePlacement === 'docked'
            ? oracleDockReservedLeft
            : navigationWidth
        }
        openSessions={sessions.filter((session) => session.isOpen !== false).length}
        subscribe={subscribeManager}
      />
      <DreamerRefreshOwner />
    </div>
  )
}

export default function App() {
  const [settingsClient] = useState(createSettingsProfileClient)
  return (
    <PreviewFeaturesProvider settingsClient={settingsClient}>
      <AppWorkspace settingsClient={settingsClient} />
    </PreviewFeaturesProvider>
  )
}
