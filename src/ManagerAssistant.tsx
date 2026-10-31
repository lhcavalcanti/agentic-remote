import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent, MutableRefObject, PointerEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowUp,
  CircleStop,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Mic,
  Orbit,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  Square,
  X,
} from 'lucide-react'
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSessionRef,
  ManagerSnapshot,
  ManagerStatus,
} from '../shared/manager'
import { MANAGER_MESSAGE_MAX_LENGTH } from '../shared/manager'
import {
  cancelManager,
  editQueuedManagerMessage,
  getManager,
  removeQueuedManagerMessage,
  resetManager,
  resolveManagerConfirmation,
  retryManagerMessage,
  sendManagerMessage,
} from './api'
import { phoneEnterCreatesNewline } from './enter-behavior'
import { sessionLinkTarget } from './manager-links'
import { remarkSafeBreaks } from './remark-safe-breaks'
import { useOracleConversation } from './use-oracle-conversation'
import type { OracleConversation } from './use-oracle-conversation'
import { recordingDuration, useVoiceRecorder } from './voice-recorder'
import {
  authoritativeRefresh,
  DreamerMorningPlan,
  waitUntilAuthoritativeRefresh,
} from './OracleDreamer'

const suggestions = [
  'What is running right now?',
  'What needs my attention?',
  'What did my sessions finish today?',
]

const oracleDraftStorageKey = 'agentic-remote:oracle-draft-v1'

type StoredOracleDraft = {
  version: 1
  draft: string
  editing?: { id: string; text: string }
}

function readStoredOracleDraft(): {
  value: StoredOracleDraft
  error?: string
} {
  const empty: StoredOracleDraft = { version: 1, draft: '' }
  try {
    const raw = window.localStorage.getItem(oracleDraftStorageKey)
    if (!raw) return { value: empty }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object'
      || parsed === null
      || Reflect.get(parsed, 'version') !== 1
      || typeof Reflect.get(parsed, 'draft') !== 'string'
    ) {
      return { value: empty, error: 'The saved Oracle draft could not be read. Copy any visible text before continuing.' }
    }
    const editing = Reflect.get(parsed, 'editing')
    if (
      editing !== undefined
      && (
        typeof editing !== 'object'
        || editing === null
        || typeof Reflect.get(editing, 'id') !== 'string'
        || typeof Reflect.get(editing, 'text') !== 'string'
      )
    ) {
      return { value: empty, error: 'The saved Oracle edit could not be read. Copy any visible text before continuing.' }
    }
    return {
      value: {
        version: 1,
        draft: Reflect.get(parsed, 'draft') as string,
        editing: editing as StoredOracleDraft['editing'],
      },
    }
  } catch {
    return { value: empty, error: 'Oracle could not access saved drafts on this device. Copy your text before leaving this page.' }
  }
}

function storeOracleDraft(draft: string, editing?: StoredOracleDraft['editing']): string | undefined {
  try {
    if (!draft && !editing) window.localStorage.removeItem(oracleDraftStorageKey)
    else window.localStorage.setItem(oracleDraftStorageKey, JSON.stringify({
      version: 1,
      draft,
      editing,
    } satisfies StoredOracleDraft))
    return undefined
  } catch {
    return 'Oracle could not save this draft on this device. Keep this page open or copy your text before leaving.'
  }
}

function conversationStateLabel(state: OracleConversation['state']): string {
  switch (state) {
    case 'off':
      return 'Conversation off'
    case 'starting':
      return 'Starting'
    case 'listening':
      return 'Listening'
    case 'speech':
      return 'Speech detected'
    case 'transcribing':
      return 'Transcribing'
    case 'thinking':
      return 'Oracle is thinking'
    case 'speaking':
      return 'Speaking'
    case 'interrupted':
      return 'Interrupted'
    case 'reconnecting':
      return 'Reconnecting'
    case 'stopping':
      return 'Stopping'
    case 'error':
      return 'Error'
  }
}

function applyEvent(snapshot: ManagerSnapshot, event: ManagerEvent): ManagerSnapshot {
  switch (event.type) {
    case 'manager.status':
      return {
        ...snapshot,
        status: event.status,
        queued: event.queued,
        lastError: event.lastError,
        streaming: event.status === 'working' || event.status === 'recovering' ? snapshot.streaming : undefined,
      }
    case 'manager.message': {
      const index = snapshot.messages.findIndex((message) => message.id === event.message.id)
      const messages = index === -1
        ? [...snapshot.messages, event.message]
        : snapshot.messages.map((message, position) => position === index ? event.message : message)
      const streaming = snapshot.streaming?.messageId === event.message.id ? undefined : snapshot.streaming
      return { ...snapshot, messages, streaming }
    }
    case 'manager.delta':
      return { ...snapshot, streaming: { messageId: event.messageId, content: event.content } }
    case 'manager.sessions':
      return { ...snapshot, managedSessions: event.managedSessions }
    case 'manager.reset':
      return event.snapshot
    case 'manager.settings':
      return { ...snapshot, settings: event.settings }
  }
}

/**
 * A message as a request returned it. The event socket can have delivered a
 * newer version first, which the response must not roll back.
 */
function withReturnedMessage(snapshot: ManagerSnapshot, message: ManagerMessage): ManagerSnapshot {
  const existing = snapshot.messages.find((candidate) => candidate.id === message.id)
  const stamp = (candidate: ManagerMessage) => candidate.updatedAt ?? candidate.createdAt
  if (existing && stamp(existing) >= stamp(message)) return snapshot
  return applyEvent(snapshot, { type: 'manager.message', message })
}

function statusLine(snapshot: ManagerSnapshot, openSessions: number): string {
  const queued = snapshot.queued > 0 ? ` · ${snapshot.queued} waiting` : ''
  if (snapshot.status === 'working') return `Working${queued}`
  if (snapshot.status === 'recovering') return `Reconnecting to its runtime${queued}`
  if (snapshot.status === 'offline') return "Couldn't answer the last message"
  return `Keeping track of ${openSessions} open session${openSessions === 1 ? '' : 's'}`
}

function ConfirmationCard({
  message,
  answering,
  onAnswer,
  onOpenSession,
}: {
  message: ManagerMessage
  answering: boolean
  onAnswer: (message: ManagerMessage, accept: boolean) => void
  onOpenSession: (ref: ManagerSessionRef) => void
}) {
  const confirmation = message.confirmation!
  const ref = message.sessionRefs?.[0]
  const outcome = {
    pending: undefined,
    closing: 'Closing…',
    confirmed: 'Closed. It is permanently deleted.',
    declined: 'Kept open.',
    failed: `Could not close it: ${confirmation.error ?? 'unknown error'}`,
  }[confirmation.state]
  return (
    <li className={`manager-confirmation manager-confirmation--${confirmation.state}`}>
      <p className="manager-confirmation__question">{message.content}</p>
      {confirmation.state === 'pending' ? (
        <div className="manager-confirmation__actions">
          <button
            className="manager-confirmation__close"
            disabled={answering}
            onClick={() => onAnswer(message, true)}
            type="button"
          >
            Close session
          </button>
          <button className="secondary-button" disabled={answering} onClick={() => onAnswer(message, false)} type="button">
            Keep it
          </button>
          {ref ? (
            <button className="manager-activity__open" onClick={() => onOpenSession(ref)} type="button">
              Open
              <ExternalLink aria-hidden="true" size={12} />
            </button>
          ) : null}
        </div>
      ) : (
        <p className="manager-confirmation__outcome" role="status">{outcome}</p>
      )}
    </li>
  )
}

function ActivityRow({
  message,
  onOpenSession,
}: {
  message: ManagerMessage
  onOpenSession: (ref: ManagerSessionRef) => void
}) {
  return (
    <li className="manager-activity">
      <span aria-hidden="true" className="manager-activity__mark" />
      <span className="manager-activity__text">{message.content}</span>
      {message.sessionRefs?.map((ref) => (
        <button
          aria-label={`Open ${ref.title || 'session'}`}
          className="manager-activity__open"
          key={`${ref.computerId}:${ref.sessionId}`}
          onClick={() => onOpenSession(ref)}
          type="button"
        >
          Open
          <ExternalLink aria-hidden="true" size={12} />
        </button>
      ))}
    </li>
  )
}

function UserMessage({
  message,
  onRetry,
  retrying,
}: {
  message: ManagerMessage
  onRetry: (message: ManagerMessage) => void
  retrying: boolean
}) {
  const retryable = message.state === 'failed' || message.state === 'interrupted' || message.state === 'cancelled'
  const long = message.content.length > 600 || message.content.split('\n').length > 12
  const [expanded, setExpanded] = useState(false)
  return (
    <li className={`manager-message manager-message--user manager-message--${message.state ?? 'done'}`}>
      <p className={`manager-message__text${long && !expanded ? ' manager-message__text--clamped' : ''}`}>
        {message.content}
      </p>
      {long ? (
        <button className="manager-message__expand" onClick={() => setExpanded((value) => !value)} type="button">
          {expanded ? 'Show less' : 'Show all'}
        </button>
      ) : null}
      {message.answerOnly ? <span className="manager-message__state">Ask</span> : null}
      {message.state === 'cancelled' ? <span className="manager-message__state">Stopped</span> : null}
      {message.state === 'failed' && message.error ? (
        <p className="manager-message__error" role="alert">{message.error}</p>
      ) : null}
      {retryable ? (
        <button className="secondary-button manager-message__retry" disabled={retrying} onClick={() => onRetry(message)} type="button">
          <RotateCcw aria-hidden="true" size={14} />
          Retry
        </button>
      ) : null}
    </li>
  )
}

const answerOnlyStorageKey = 'agentic-remote:oracle-answer-only'

function readAnswerOnly(): boolean {
  try {
    return window.localStorage.getItem(answerOnlyStorageKey) === 'true'
  } catch {
    return false
  }
}

const widthStorageKey = 'agentic-remote:oracle-width'
const WIDTH_DEFAULT = 440
export const ORACLE_PANEL_WIDTH_MIN = 340
const WIDTH_MAX = 960
/** The conversation keeps at least this much beside the panel. */
export const ORACLE_CONVERSATION_WIDTH_MIN = 360

function boundWidth(value: number, limit = WIDTH_MAX): number {
  return Math.min(limit, Math.max(ORACLE_PANEL_WIDTH_MIN, Math.round(value)))
}

/** The width chosen, which a narrow window may show narrower without forgetting it. */
function readWidth(): number {
  try {
    const stored = Number(window.localStorage.getItem(widthStorageKey))
    return Number.isFinite(stored) && stored > 0 ? boundWidth(stored) : WIDTH_DEFAULT
  } catch {
    return WIDTH_DEFAULT
  }
}

function storeWidth(width: number | undefined) {
  try {
    if (width === undefined) window.localStorage.removeItem(widthStorageKey)
    else window.localStorage.setItem(widthStorageKey, String(width))
  } catch {
    // Resizing still works without browser storage; it is just not remembered.
  }
}

/**
 * The desktop panel's width, dragged from its left edge or changed with the
 * arrow keys, and remembered per browser. Widening stops where the
 * conversation would have less than 360px beside `reservedLeft`, the sessions
 * list, and follows the window as it narrows. The panel never goes below
 * 340px, so a window without room for both keeps it usable and lets it
 * overlay more of the conversation, as a phone does. A phone always shows it
 * full width.
 */
function usePanelWidth(reservedLeft: number) {
  const [preferred, setPreferred] = useState(readWidth)
  const [viewport, setViewport] = useState(() => window.innerWidth)
  const [resizing, setResizing] = useState(false)
  const gesture = useRef<{ pointerId: number; startX: number; startWidth: number; width: number } | undefined>(undefined)

  useEffect(() => {
    const measure = () => setViewport(window.innerWidth)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const limit = boundWidth(
    viewport - reservedLeft - ORACLE_CONVERSATION_WIDTH_MIN,
  )
  const clampWidth = (value: number) => boundWidth(value, limit)
  const width = clampWidth(preferred)

  function commit(next: number | undefined) {
    const value = next === undefined ? WIDTH_DEFAULT : clampWidth(next)
    setPreferred(value)
    storeWidth(next === undefined ? undefined : value)
  }

  return {
    width,
    resizing,
    separator: {
      'aria-controls': 'oracle-panel',
      'aria-label': 'Resize Oracle',
      'aria-orientation': 'vertical' as const,
      'aria-valuemax': limit,
      'aria-valuemin': ORACLE_PANEL_WIDTH_MIN,
      'aria-valuenow': width,
      'data-resizing': resizing,
      onDoubleClick: () => commit(undefined),
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? 32 : 8
        // The panel sits on the right, so moving its edge left widens it.
        if (event.key === 'ArrowLeft') commit(width + step)
        else if (event.key === 'ArrowRight') commit(width - step)
        else if (event.key === 'Home') commit(undefined)
        else return
        event.preventDefault()
        event.stopPropagation()
      },
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || gesture.current) return
        event.preventDefault()
        gesture.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width, width }
        event.currentTarget.setPointerCapture?.(event.pointerId)
        setResizing(true)
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        const current = gesture.current
        if (!current || current.pointerId !== event.pointerId) return
        current.width = clampWidth(current.startWidth + current.startX - event.clientX)
        setPreferred(current.width)
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => finish(event),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finish(event),
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => finish(event),
      role: 'separator',
      tabIndex: 0,
      title: 'Drag or use arrow keys to resize · Shift for larger steps · Home or double-click to reset',
    },
  }

  function finish(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    gesture.current = undefined
    setResizing(false)
    if (current.width !== current.startWidth) storeWidth(current.width)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
  }
}

/** What the header button shows about Oracle without opening it. */
export interface OracleIndicator {
  available: boolean
  /** Why Oracle cannot take a message; unset while it is still loading. */
  unavailableReason?: string
  status: ManagerStatus
  unread: boolean
  queued: number
}

/** The model named in a warning that it could not start. */
function unavailableModelLabel(settings: ManagerSnapshot['settings']): string {
  return settings?.model ?? settings?.defaultModel ?? 'The chosen model'
}

/**
 * Whether focus can go back to an element. One in a hidden layer cannot, nor
 * one in a layer out of view, like the phone's closed session list. That
 * layer may still be sliding away, so it is marked rather than measured.
 */
function canTakeFocus(element: HTMLElement): boolean {
  if (!element.isConnected || element.closest('[hidden], [inert], [data-oracle-offscreen]')) return false
  if (typeof element.checkVisibility === 'function' && !element.checkVisibility()) return false
  const box = element.getBoundingClientRect()
  // Without layout, as in tests, every box is empty; only a laid-out one is placed.
  if (box.width === 0 && box.height === 0) return true
  return box.right > 0 && box.left < window.innerWidth && box.bottom > 0 && box.top < window.innerHeight
}

function visibleTrigger(): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>('[aria-controls="oracle-panel"]')].find(canTakeFocus)
}

/** Lets the rest of the app hand Oracle a prompt, as `/oracle` does. */
export interface OracleControl {
  ask(text: string, options: { answerOnly: boolean }): Promise<void>
  focusComposer(): boolean
}

/**
 * Opens Oracle: a floating bubble at the bottom right of the conversation,
 * or a compact icon where the conversation is out of view.
 */
export function OracleButton({
  indicator,
  open,
  onToggle,
  shortcutLabel,
  compact = false,
  floating = false,
  className = '',
  offscreen = false,
}: {
  indicator: OracleIndicator
  open: boolean
  onToggle: () => void
  shortcutLabel?: string
  compact?: boolean
  /** The round bubble that sits with Scroll to latest. */
  floating?: boolean
  className?: string
  /** In a layer that is out of view, such as a closed drawer; focus never returns here. */
  offscreen?: boolean
}) {
  if (!indicator.available) return null
  const working = indicator.status === 'working' || indicator.status === 'recovering'
  // Every state that holds at once is announced, not just the first.
  const states = [
    working ? 'working' : indicator.status === 'offline' ? "couldn't answer" : undefined,
    indicator.unread ? 'new reply' : undefined,
  ].filter(Boolean)
  return (
    <button
      aria-controls="oracle-panel"
      aria-expanded={open}
      aria-label={['Oracle', ...states].join(', ')}
      data-oracle-offscreen={offscreen ? '' : undefined}
      className={`${floating ? 'oracle-bubble' : 'icon-button'} oracle-toggle${open ? ' icon-button--active' : ''}${
        working ? ' oracle-toggle--working' : ''
      }${indicator.status === 'offline' ? ' oracle-toggle--offline' : ''}${className ? ` ${className}` : ''}`}
      onClick={onToggle}
      title={`Oracle: ask about your sessions or hand off work${
        shortcutLabel ? ` (${shortcutLabel})` : ''
      }`}
      type="button"
    >
      <span className="oracle-toggle__mark">
        <Orbit aria-hidden="true" size={floating ? 22 : 18} strokeWidth={1.8} />
        {indicator.unread ? <span aria-hidden="true" className="oracle-toggle__unread" /> : null}
      </span>
      {compact || floating ? null : <span className="header-action-label">Oracle</span>}
    </button>
  )
}

export function ManagerAssistant({
  connectionEpoch,
  subscribe,
  defaults,
  openSessions,
  open,
  onOpenChange,
  onIndicatorChange,
  onOpenSession,
  onManagedSessionsChange,
  onOpenSettings,
  controlRef,
  reservedLeft = 0,
  onWidthChange,
  placement = 'overlay',
  placementShortcutLabel,
  preferredPlacement = 'overlay',
  onPlacementChange,
  focusRequest = 0,
  onRequestSessionFocus,
}: {
  /** Changes each time the event socket reconnects, so the snapshot is reread. */
  connectionEpoch: number
  subscribe: (listener: (event: ManagerEvent) => void) => () => void
  defaults: ManagerClientDefaults
  openSessions: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onIndicatorChange: (indicator: OracleIndicator) => void
  onOpenSession: (ref: ManagerSessionRef) => boolean
  onManagedSessionsChange: (keys: string[]) => void
  onOpenSettings: () => void
  controlRef?: MutableRefObject<OracleControl | undefined>
  /** Width taken on the left, such as the sessions list, that the panel may not reach into. */
  reservedLeft?: number
  /** The open panel's width, or undefined while it is closed, for whatever it covers to move beside it. */
  onWidthChange?: (width: number | undefined) => void
  /** Desktop placement. Narrow layouts always pass overlay. */
  placement?: 'overlay' | 'docked'
  /** Shortcut shown with the placement action. */
  placementShortcutLabel?: string
  /** Stored desktop choice, even while a narrow layout falls back to overlay. */
  preferredPlacement?: 'overlay' | 'docked'
  /** Changes the stored desktop placement from the panel header. */
  onPlacementChange?: (placement: 'overlay' | 'docked') => void
  /** Changes when a keyboard shortcut explicitly requests the composer. */
  focusRequest?: number
  /** Lets App focus the active writable session composer after Oracle closes. */
  onRequestSessionFocus?: () => boolean
}) {
  const [storedDraft] = useState(readStoredOracleDraft)
  const [snapshot, setSnapshot] = useState<ManagerSnapshot>()
  const snapshotRef = useRef<ManagerSnapshot | undefined>(undefined)
  const [draft, setDraft] = useState(storedDraft.value.draft)
  const [answerOnly, setAnswerOnly] = useState(readAnswerOnly)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string>()
  const [confirmReset, setConfirmReset] = useState(false)
  const [busyMessage, setBusyMessage] = useState<string>()
  const [unread, setUnread] = useState(false)
  const [loadError, setLoadError] = useState<string>()
  const [refreshing, setRefreshing] = useState(true)
  const [snapshotStale, setSnapshotStale] = useState(false)
  const [refreshAttempt, setRefreshAttempt] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  // A waiting message being rewritten in place, and what it now says.
  const [editing, setEditing] = useState<{ id: string; text: string } | undefined>(
    storedDraft.value.editing,
  )
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string>()
  const [draftStorageError, setDraftStorageError] = useState(storedDraft.error)
  const [recoveredDraft, setRecoveredDraft] = useState(Boolean(storedDraft.value.draft))
  const [recoveredEdit, setRecoveredEdit] = useState(Boolean(storedDraft.value.editing))
  const draftStorageBlockedRef = useRef(Boolean(storedDraft.error))
  const draftRef = useRef(draft)
  const managerRefreshGeneration = useRef(0)
  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const editButtons = useRef(new Map<string, HTMLButtonElement>())
  const listRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const focusRequestRef = useRef(focusRequest)
  const sessionFocusRef = useRef(onRequestSessionFocus)
  const panelWidth = usePanelWidth(reservedLeft)
  const returnFinalTranscript = useCallback((text: string) => {
    const transcript = text.trim()
    if (!transcript) return
    setDraft((current) => {
      const draft = current.trimEnd()
      return draft ? `${draft}\n\n${transcript}` : transcript
    })
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [])
  const voice = useVoiceRecorder({
    onTranscript: (text) => {
      setDraft((current) => current.trim() ? `${current.trimEnd()} ${text}` : text)
      window.requestAnimationFrame(() => inputRef.current?.focus())
    },
    onError: (message) => setSendError(message),
  })
  const conversation = useOracleConversation({
    defaults,
    answerOnly: true,
    open,
    onFinalTranscript: returnFinalTranscript,
    onError: announce,
  })
  const { recording: voiceRecording, stop: stopVoice } = voice
  const conversationAvailable = conversation.capability?.available === true
  const conversationActive = conversation.state !== 'off'
  const conversationOwnsMicrophone = conversation.ownsResources
  const liveAnnouncement = [
    announcement,
    conversationActive
      ? `Conversation: ${conversationStateLabel(conversation.state)}`
      : '',
  ].filter(Boolean).join(' ')

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    if (draftStorageBlockedRef.current) return
    const error = storeOracleDraft(draft, editing)
    if (error) draftStorageBlockedRef.current = true
    setDraftStorageError(error)
  }, [draft, editing])

  // A closed panel never keeps the microphone on.
  useEffect(() => {
    if (!open && voiceRecording) stopVoice(true)
  }, [open, voiceRecording, stopVoice])

  const editingId = editing?.id
  useEffect(() => {
    const editor = editInputRef.current
    if (!editingId || !editor) return
    editor.focus()
    editor.closest('li')?.scrollIntoView?.({ block: 'nearest' })
  }, [editingId])

  // Oracle started on a message while it was being edited, or it left the
  // queue another way: the words go to the message bar rather than being lost.
  // Clearing the edit here means this happens once.
  // Not while saving: an edit that was saved and then taken by Oracle is not
  // to be copied back; the save itself says what happened.
  if (editing && !savingEdit && snapshot && !snapshot.messages.some(
    (message) => message.id === editing.id && message.role === 'user' && message.state === 'queued',
  )) {
    const kept = editing.text.trim()
    setEditing(undefined)
    if (kept) {
      setDraft((current) => current.trimEnd().endsWith(kept)
        ? current
        : current.trim() ? `${current.trimEnd()}\n\n${kept}` : kept)
    }
    setSendError('Oracle started on that message before your edit was saved. Your edit is in the message bar to send.')
  }
  const openRef = useRef(open)
  const managedRef = useRef(onManagedSessionsChange)
  const indicatorRef = useRef(onIndicatorChange)
  useEffect(() => {
    openRef.current = open
    managedRef.current = onManagedSessionsChange
    indicatorRef.current = onIndicatorChange
  })
  // Opening is reading: a reply waiting for you is seen once the panel shows.
  if (open && unread) setUnread(false)

  const refreshManager = useCallback(async () => {
    const generation = managerRefreshGeneration.current + 1
    managerRefreshGeneration.current = generation
    setRefreshing(true)
    try {
      const next = await getManager()
      if (managerRefreshGeneration.current !== generation) return
      if (!next || typeof next !== 'object' || !Array.isArray(next.messages)) {
        throw new Error('Oracle sent an answer this app cannot read.')
      }
      snapshotRef.current = next
      setSnapshot(next)
      setLoadError(undefined)
      setSnapshotStale(false)
    } catch (caught) {
      if (managerRefreshGeneration.current === generation) {
        const detail = caught instanceof Error ? caught.message : String(caught)
        setLoadError(snapshotRef.current
          ? `Oracle refresh failed: ${detail}`
          : `Oracle could not be reached: ${detail}`)
        setSnapshotStale(Boolean(snapshotRef.current))
      }
      throw caught
    } finally {
      if (managerRefreshGeneration.current === generation) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void refreshManager().catch(() => undefined)
    return () => {
      managerRefreshGeneration.current += 1
    }
  }, [connectionEpoch, refreshAttempt, refreshManager])

  useEffect(() => {
    const refresh = (event: Event) => {
      waitUntilAuthoritativeRefresh(event, refreshManager())
    }
    window.addEventListener(authoritativeRefresh, refresh)
    return () => window.removeEventListener(authoritativeRefresh, refresh)
  }, [refreshManager])

  useEffect(() => subscribe((event) => {
    setSnapshot((current) => current ? applyEvent(current, event) : current)
    if (event.type === 'manager.message' && event.message.role === 'assistant') {
      if (!openRef.current) setUnread(true)
      setAnnouncement('Oracle replied.')
    }
  }), [subscribe])

  const managedKey = snapshot?.managedSessions.join('\n') ?? ''
  useEffect(() => {
    managedRef.current(managedKey ? managedKey.split('\n') : [])
  }, [managedKey])

  const available = Boolean(snapshot?.available)
  const shownWidth = available && open ? panelWidth.width : undefined
  const widthRef = useRef(onWidthChange)
  useEffect(() => {
    widthRef.current = onWidthChange
  })
  useEffect(() => {
    widthRef.current?.(shownWidth)
  }, [shownWidth])
  const status = snapshot?.status ?? 'offline'
  const queuedCount = snapshot?.queued ?? 0
  const unavailableReason = available
    ? undefined
    : snapshot
      ? snapshot.unavailableReason || 'Oracle is not available on this hub.'
      : loadError
  useEffect(() => {
    indicatorRef.current({
      available,
      status,
      unread,
      queued: queuedCount,
      ...(unavailableReason ? { unavailableReason } : {}),
    })
  }, [available, status, unread, queuedCount, unavailableReason])

  const messageCount = snapshot?.messages.length ?? 0
  const streamLength = snapshot?.streaming?.content.length ?? 0
  useEffect(() => {
    const list = listRef.current
    if (list && open) list.scrollTop = list.scrollHeight
  }, [messageCount, streamLength, open])

  const wasOpenRef = useRef(false)
  useEffect(() => {
    const wasOpen = wasOpenRef.current
    const focusRequested = focusRequestRef.current !== focusRequest
    focusRequestRef.current = focusRequest
    wasOpenRef.current = open
    if (open) {
      const active = document.activeElement
      returnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null
      if (focusRequested || !phoneEnterCreatesNewline()) {
        const input = inputRef.current
        input?.focus()
        input?.setSelectionRange(input.value.length, input.value.length)
      }
      return
    }
    // Only a panel that was open hands focus back; the first render must not take it.
    if (!wasOpen) return
    const sessionFocus = sessionFocusRef.current
    if (sessionFocus?.()) {
      window.requestAnimationFrame(() => {
        const active = document.activeElement
        if (
          !(active instanceof HTMLElement) ||
          active === document.body ||
          !active.isConnected
        ) {
          visibleTrigger()?.focus()
        }
      })
      return
    }
    const target = sessionFocus ? null : returnFocusRef.current
    returnFocusRef.current = null
    // Safari does not focus a button on click, so the trigger is the fallback.
    const trigger = visibleTrigger()
    const destination = target && canTakeFocus(target) ? target : trigger
    if (destination && document.activeElement !== destination && !document.querySelector('[role="dialog"]:focus-within')) {
      destination.focus()
    }
  }, [focusRequest, open])

  useEffect(() => {
    sessionFocusRef.current = onRequestSessionFocus
  }, [onRequestSessionFocus])

  const close = useCallback(() => {
    setConfirmReset(false)
    onOpenChange(false)
  }, [onOpenChange])

  const openSession = useCallback((ref: ManagerSessionRef) => {
    if (onOpenSession(ref) && phoneEnterCreatesNewline()) onOpenChange(false)
  }, [onOpenChange, onOpenSession])

  const markdown = useMemo<Components>(() => ({
    a({ href, children }) {
      const target = sessionLinkTarget(href)
      if (target) {
        return (
          <a
            className="manager-session-link"
            href={href}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault()
              openSession(target)
            }}
          >
            {children}
          </a>
        )
      }
      return <a href={href} rel="noreferrer noopener" target="_blank">{children}</a>
    },
  }), [openSession])

  const sendText = useCallback(async (content: string, onlyOracle: boolean) => {
    const message = await sendManagerMessage(content, defaults, { answerOnly: onlyOracle })
    setSnapshot((current) => current ? withReturnedMessage(current, message) : current)
  }, [defaults])

  useEffect(() => {
    if (!controlRef) return
    controlRef.current = {
      ask: async (text, options) => {
        onOpenChange(true)
        if (!text.trim()) return
        setSendError(undefined)
        try {
          await sendText(text, options.answerOnly)
        } catch (caught) {
          // The question was already taken from the session's message bar, so
          // it waits here, as it was asked, to be sent again.
          setDraft((current) => current.trim() ? `${current.trimEnd()}\n\n${text}` : text)
          if (options.answerOnly) setAnswerOnly(true)
          const reason = (caught instanceof Error ? caught.message : String(caught)).replace(/[.\s]+$/, '')
          setSendError(`Could not send to Oracle: ${reason}. Your question is in the message bar to send again.`)
        }
      },
      focusComposer: () => {
        const input = inputRef.current
        if (!openRef.current || !input || input.disabled || input.readOnly) return false
        input.focus({ preventScroll: true })
        const end = input.value.length
        input.setSelectionRange(end, end)
        return document.activeElement === input
      },
    }
    return () => {
      controlRef.current = undefined
    }
  }, [controlRef, onOpenChange, sendText])

  async function send(content = draft, onlyOracle = answerOnly) {
    const text = content.trim()
    if (!text || sending || draftStorageError) return
    setSending(true)
    setSendError(undefined)
    try {
      await sendText(content, onlyOracle)
      setDraft((current) => {
        const next = current === content ? '' : current
        const storageError = storeOracleDraft(next, editing)
        setDraftStorageError(storageError)
        return storageError ? current : next
      })
      setRecoveredDraft(false)
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSending(false)
    }
  }

  async function act(message: ManagerMessage, work: () => Promise<ManagerMessage>) {
    setBusyMessage(message.id)
    setSendError(undefined)
    try {
      const next = await work()
      setSnapshot((current) => current ? withReturnedMessage(current, next) : current)
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setBusyMessage(undefined)
    }
  }

  async function startOver() {
    setConfirmReset(false)
    try {
      setSnapshot(await resetManager())
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  function startEdit(message: ManagerMessage) {
    setEditError(undefined)
    setRecoveredEdit(false)
    setEditing({ id: message.id, text: message.content })
  }

  function returnFocusToEdit(id: string) {
    window.requestAnimationFrame(() => editButtons.current.get(id)?.focus())
  }

  function cancelEdit() {
    const id = editing?.id
    setEditing(undefined)
    setRecoveredEdit(false)
    setEditError(undefined)
    if (id) returnFocusToEdit(id)
  }

  function announce(message: string) {
    // The same words twice in a row would not be read out again.
    setAnnouncement((current) => current === message ? `${message}\u200b` : message)
  }

  async function saveEdit() {
    if (!editing || savingEdit || draftStorageError) return
    const { id, text } = editing
    const original = snapshot?.messages.find((message) => message.id === id)
    // The same checks as the Save button, for Ctrl+Enter too.
    if (!text.trim() || text.length > MANAGER_MESSAGE_MAX_LENGTH || text.trim() === original?.content.trim()) return
    setSavingEdit(true)
    setEditError(undefined)
    try {
      const next = await editQueuedManagerMessage(id, text)
      setSnapshot((current) => current ? withReturnedMessage(current, next) : current)
      const storageError = storeOracleDraft(draftRef.current, undefined)
      if (storageError) {
        draftStorageBlockedRef.current = true
        setDraftStorageError(storageError)
        return
      }
      setEditing((current) => current?.id === id ? undefined : current)
      setRecoveredEdit(false)
      announce('Saved your edit. It keeps its place in the queue.')
      returnFocusToEdit(id)
    } catch (caught) {
      const reason = (caught instanceof Error ? caught.message : String(caught)).replace(/[.\s]+$/, '')
      if (Reflect.get(caught as object, 'statusCode') === 409) {
        // Too late, whatever the queue still shows: the words go to the message bar.
        const kept = text.trim()
        setEditing((current) => current?.id === id ? undefined : current)
        setRecoveredEdit(false)
        setDraft((current) => current.trimEnd().endsWith(kept)
          ? current
          : current.trim() ? `${current.trimEnd()}\n\n${kept}` : kept)
        setSendError(`${reason}. Your edit is in the message bar to send.`)
      } else {
        setEditError(reason)
      }
    } finally {
      setSavingEdit(false)
    }
  }

  function onEditKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      cancelEdit()
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      void saveEdit()
    }
  }

  function changeAnswerOnly(value: boolean) {
    setAnswerOnly(value)
    try {
      window.localStorage.setItem(answerOnlyStorageKey, String(value))
    } catch {
      // A browser that cannot store it simply forgets the choice.
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.ctrlKey || event.metaKey || !phoneEnterCreatesNewline()) {
      event.preventDefault()
      void send()
    }
  }

  async function startConversation() {
    voice.stop(true)
    await conversation.start()
  }

  if (!snapshot?.available || !open) {
    return <p aria-live="polite" className="visually-hidden">{liveAnnouncement}</p>
  }

  const working = snapshot.status === 'working' || snapshot.status === 'recovering'
  const streaming = snapshot.streaming?.content.trim() ? snapshot.streaming : undefined
  const tooLong = draft.length > MANAGER_MESSAGE_MAX_LENGTH
  // Waiting messages sit in the queue above the message bar, in the order
  // Oracle will answer them, rather than in the conversation.
  const queue = snapshot.messages.filter((message) => message.role === 'user' && message.state === 'queued')
  const transcript = snapshot.messages.filter((message) => !(message.role === 'user' && message.state === 'queued'))
  const settings = snapshot.settings
  const model = settings?.model ?? settings?.defaultModel
  const runtimeLabel = model
    ? `${model}${settings?.model ? settings.reasoningEffort ? ` · ${settings.reasoningEffort}` : '' : settings?.defaultReasoningEffort ? ` · ${settings.defaultReasoningEffort}` : ''}`
    : 'Copilot default model'

  return (
    <section
      aria-label="Oracle"
      className={`manager-panel manager-panel--${placement}`}
      data-placement={placement}
      data-resizing={panelWidth.resizing}
      id="oracle-panel"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault()
          close()
        }
      }}
      role="dialog"
      style={{ '--oracle-width': `${panelWidth.width}px` } as CSSProperties}
    >
      <div className="oracle-resizer" {...panelWidth.separator} />
      <header className="manager-panel__header">
        <span aria-hidden="true" className={`manager-panel__mark${working ? ' manager-panel__mark--working' : ''}`}>
          <Orbit size={18} strokeWidth={1.8} />
        </span>
        <div className="manager-panel__title">
          <h2>Oracle</h2>
          <p className={`manager-panel__status manager-panel__status--${snapshot.status}`} role="status">
            {statusLine(snapshot, openSessions)}
          </p>
        </div>
        <button
          aria-label="Start a new conversation"
          className="icon-button"
          disabled={!snapshot.messages.length}
          onClick={() => setConfirmReset(true)}
          title="Start a new conversation (memory is kept)"
          type="button"
        >
          <RotateCcw aria-hidden="true" size={17} />
        </button>
        {onPlacementChange ? (
          <button
            aria-label={
              preferredPlacement === 'docked' ? 'Undock Oracle' : 'Dock Oracle'
            }
            className="icon-button"
            onClick={() =>
              onPlacementChange(
                preferredPlacement === 'docked' ? 'overlay' : 'docked',
              )
            }
            title={`${preferredPlacement === 'docked' ? 'Undock' : 'Dock'} Oracle${
              placementShortcutLabel ? ` (${placementShortcutLabel})` : ''
            }`}
            type="button"
          >
            {preferredPlacement === 'docked' ? (
              <PanelRightOpen aria-hidden="true" size={18} />
            ) : (
              <PanelRightClose aria-hidden="true" size={18} />
            )}
          </button>
        ) : null}
        <button aria-label="Close Oracle" className="icon-button" onClick={close} title="Close (Esc)" type="button">
          <X aria-hidden="true" size={19} />
        </button>
      </header>
      {refreshing && snapshot ? (
        <p aria-label="Oracle freshness" className="manager-panel__freshness" role="status">
          Refreshing Oracle…
        </p>
      ) : snapshotStale && loadError ? (
        <p aria-label="Oracle freshness" className="manager-panel__freshness form-error" role="alert">
          <span>{loadError}. Showing the last loaded state.</span>
          <button
            className="secondary-button"
            onClick={() => setRefreshAttempt((current) => current + 1)}
            type="button"
          >
            Retry Oracle refresh
          </button>
        </p>
      ) : null}
      <DreamerMorningPlan active={open} />
      {confirmReset ? (
        <div className="manager-panel__confirm" role="alertdialog" aria-label="Start a new conversation">
          <p>Start a new conversation? Oracle keeps its notes and memory.</p>
          <button className="primary-button" onClick={() => void startOver()} type="button">Start over</button>
          <button className="secondary-button" onClick={() => setConfirmReset(false)} type="button">Keep this one</button>
        </div>
      ) : null}
      {transcript.length || streaming || working ? (
        <ol aria-label="Oracle conversation" className="manager-transcript" ref={listRef}>
          {transcript.map((message) => {
            if (message.role === 'user') {
              return (
                <UserMessage
                  key={message.id}
                  message={message}
                  onRetry={(next) => void act(next, () => retryManagerMessage(next.id))}
                  retrying={busyMessage === message.id}
                />
              )
            }
            if (message.role === 'activity' && message.confirmation) {
              return (
                <ConfirmationCard
                  answering={busyMessage === message.id}
                  key={message.id}
                  message={message}
                  onAnswer={(next, accept) => void act(next, () => resolveManagerConfirmation(next.id, accept))}
                  onOpenSession={openSession}
                />
              )
            }
            if (message.role === 'activity') {
              return <ActivityRow key={message.id} message={message} onOpenSession={openSession} />
            }
            return (
              <li className={`manager-message manager-message--${message.role}`} key={message.id}>
                <div className="manager-message__markdown message__content">
                  <ReactMarkdown components={markdown} remarkPlugins={[remarkGfm, remarkSafeBreaks]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </li>
            )
          })}
          {streaming ? (
            <li aria-busy="true" className="manager-message manager-message--assistant manager-message--streaming">
              <div className="manager-message__markdown message__content">
                <ReactMarkdown components={markdown} remarkPlugins={[remarkGfm, remarkSafeBreaks]}>
                  {streaming.content}
                </ReactMarkdown>
              </div>
            </li>
          ) : working ? (
            <li className="manager-message manager-message--thinking">
              <LoaderCircle aria-hidden="true" className="activity-message__spinner" size={14} />
              {snapshot.status === 'recovering' ? 'Reconnecting…' : 'Thinking…'}
            </li>
          ) : null}
        </ol>
      ) : (
        <div className="manager-empty">
          <h3>Ask about your sessions</h3>
          <p>
            Oracle keeps track of every session on your computers and starts a new one for each piece
            of work you hand it, so you can open it and steer it yourself.
          </p>
          <div className="manager-empty__suggestions">
            {suggestions.map((suggestion) => (
              <button className="secondary-button" key={suggestion} onClick={() => void send(suggestion, true)} type="button">
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      {queue.length ? (
        <section aria-label="Queued for Oracle" className="oracle-queue">
          <p className="oracle-queue__title">
            {queue.length} waiting · answered in this order
          </p>
          <ol className="oracle-queue__list">
            {queue.map((message, index) => {
              const rewriting = editing?.id === message.id ? editing : undefined
              const editTooLong = (rewriting?.text.length ?? 0) > MANAGER_MESSAGE_MAX_LENGTH
              const editUnchanged = rewriting?.text.trim() === message.content.trim()
              return (
                <li className={`oracle-queue__item${rewriting ? ' oracle-queue__item--editing' : ''}`} key={message.id}>
                  <span aria-hidden="true" className="oracle-queue__position">{index + 1}</span>
                  {rewriting ? (
                    <div className="oracle-queue__editor">
                      <textarea
                        aria-describedby={`oracle-edit-hint-${message.id}`}
                        aria-label={`Edit queued message ${index + 1}`}
                        disabled={savingEdit}
                        onChange={(event) => {
                          const text = event.target.value
                          setRecoveredEdit(false)
                          setEditing((current) => current?.id === message.id ? { ...current, text } : current)
                        }}
                        onKeyDown={onEditKeyDown}
                        ref={editInputRef}
                        rows={3}
                        value={rewriting.text}
                      />
                      {recoveredEdit ? (
                        <p className="manager-composer__status" role="status">Recovered saved edit</p>
                      ) : null}
                      {editTooLong ? (
                        <p className="form-error" role="alert">
                          Messages are limited to {MANAGER_MESSAGE_MAX_LENGTH.toLocaleString('en-US')} characters.
                        </p>
                      ) : null}
                      {editError ? <p className="form-error" role="alert">{editError}</p> : null}
                      <div className="oracle-queue__editor-actions">
                        <span className="oracle-queue__editor-hint" id={`oracle-edit-hint-${message.id}`}>
                          Keeps its place
                          <span className="oracle-queue__editor-keys"> · Ctrl+Enter saves · Esc cancels</span>
                        </span>
                        <button aria-label="Cancel edit" className="secondary-button" disabled={savingEdit} onClick={cancelEdit} type="button">
                          Cancel
                        </button>
                        <button
                          aria-label="Save edit"
                          className="primary-button"
                          disabled={savingEdit || Boolean(draftStorageError) || !rewriting.text.trim() || editTooLong || editUnchanged}
                          onClick={() => void saveEdit()}
                          type="button"
                        >
                          {savingEdit ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="oracle-queue__text">
                        <span className="visually-hidden">{`Number ${index + 1}: `}</span>
                        {message.content}
                      </p>
                      {message.answerOnly ? <span className="oracle-queue__tag">Ask</span> : null}
                      <button
                        aria-label={`Edit queued message: ${message.content.slice(0, 60)}`}
                        className="icon-button oracle-queue__edit"
                        disabled={Boolean(editing) || busyMessage === message.id}
                        onClick={() => startEdit(message)}
                        ref={(element) => {
                          if (element) editButtons.current.set(message.id, element)
                          else editButtons.current.delete(message.id)
                        }}
                        title="Edit; it keeps its place in the queue"
                        type="button"
                      >
                        <Pencil aria-hidden="true" size={14} />
                      </button>
                      <button
                        aria-label={`Remove from the queue: ${message.content.slice(0, 60)}`}
                        className="icon-button oracle-queue__remove"
                        disabled={busyMessage === message.id}
                        onClick={() => void act(message, () => removeQueuedManagerMessage(message.id))}
                        title="Remove from the queue"
                        type="button"
                      >
                        <X aria-hidden="true" size={15} />
                      </button>
                    </>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ) : null}
      <form
        className="manager-composer"
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        {sendError ? <p className="form-error manager-composer__error" role="alert">{sendError}</p> : null}
        {draftStorageError ? <p className="form-error manager-composer__error" role="alert">{draftStorageError}</p> : null}
        {conversation.error ? (
          <p className="form-error manager-composer__error" role="alert">
            {conversation.error}
          </p>
        ) : null}
        {tooLong ? (
          <p className="form-error manager-composer__error" role="alert">
            Messages are limited to {MANAGER_MESSAGE_MAX_LENGTH.toLocaleString('en-US')} characters.
          </p>
        ) : null}
        {working ? (
          <p className="manager-composer__status">
            Oracle is answering; anything you send now waits its turn.
          </p>
        ) : null}
        {voice.recording ? (
          <div className="recording-panel manager-composer__recording" role="status">
            <button className="recording-panel__cancel" onClick={() => voice.stop(true)} type="button">
              Cancel
            </button>
            <span className="recording-panel__status">
              <i />
              Recording {recordingDuration(voice.seconds)}
            </span>
            <button className="recording-panel__stop" onClick={() => voice.stop()} type="button">
              <Square fill="currentColor" size={12} />
              Stop & transcribe
            </button>
          </div>
        ) : conversationActive ? (
          <div
            aria-label="Conversation status"
            className={`manager-conversation-status manager-conversation-status--${conversation.state}`}
            role="group"
          >
            {conversation.state === 'error' ? null : (
              <LoaderCircle
                aria-hidden="true"
                className="activity-message__spinner manager-conversation-status__activity"
                size={17}
              />
            )}
            <div className="manager-conversation-status__content">
              <strong>{conversationStateLabel(conversation.state)}</strong>
              {conversation.partial ? (
                <p aria-label="Live transcript" className="manager-conversation-status__partial">
                  {conversation.partial}
                </p>
              ) : null}
              <p className="manager-conversation-status__privacy">
                Speech processing stays on your selected computer; Oracle uses remote Copilot. Final messages stay in Oracle history.
              </p>
              <p className="manager-conversation-security">
                Speaker identity is not verified. Nearby or replayed audio may be submitted. Conversation is Ask-only and can read session information. Finalized text is sent to remote Copilot.
              </p>
            </div>
            {conversation.ownsResources ? (
              <button
                aria-label="Stop conversation"
                className="manager-conversation-stop"
                disabled={conversation.state === 'stopping'}
                onClick={conversation.stop}
                type="button"
              >
                <Square aria-hidden="true" fill="currentColor" size={11} />
                {conversation.state === 'stopping' ? 'Stopping' : 'Stop'}
              </button>
            ) : null}
          </div>
        ) : null}
        {conversationAvailable && !conversationActive ? (
          <div
            aria-label="Conversation security notice"
            className="manager-conversation-policy"
            role="note"
          >
            <p>
              Speaker identity is not verified. Nearby or replayed audio may be submitted. Ask can read session information. Finalized text is sent to remote Copilot.
            </p>
            <p>
              Conversation voice is Ask-only and cannot delegate. The mode switch still controls typed messages.
            </p>
          </div>
        ) : null}
        <div className={`manager-composer__row${answerOnly ? ' manager-composer__row--only' : ''}${
          conversationAvailable ? ' manager-composer__row--conversation' : ''
        }`}>
          <textarea
            aria-label="Message Oracle"
            enterKeyHint={phoneEnterCreatesNewline() ? 'enter' : 'send'}
            onChange={(event) => {
              setRecoveredDraft(false)
              setDraft(event.target.value)
            }}
            onKeyDown={onKeyDown}
            placeholder="Ask me anything"
            ref={inputRef}
            rows={2}
            value={draft}
          />
          <div className={`manager-composer__actions${
            conversationAvailable ? ' manager-composer__actions--conversation' : ''
          }`}>
            {conversationAvailable && !conversation.ownsResources ? (
              <button
                aria-label="Start conversation"
                className="manager-conversation-toggle"
                disabled={voice.transcribing || voice.recording || voice.starting}
                onClick={() => void startConversation()}
                title="Start a hands-free conversation with Oracle"
                type="button"
              >
                <MessageCircle aria-hidden="true" size={16} />
                <span>Start conversation</span>
              </button>
            ) : null}
            <button
              aria-label={voice.transcribing ? 'Transcribing audio' : 'Dictate to Oracle'}
              className="icon-button manager-composer__mic"
              disabled={
                conversationOwnsMicrophone
                || voice.transcribing
                || voice.recording
                || voice.starting
              }
              onClick={() => void voice.start()}
              title={conversationOwnsMicrophone
                ? 'Stop Conversation before using dictation'
                : 'Record and transcribe'}
              type="button"
            >
              {voice.transcribing
                ? <LoaderCircle aria-hidden="true" className="activity-message__spinner" size={17} />
                : <Mic aria-hidden="true" size={17} />}
            </button>
            {working ? (
              <button aria-label="Stop Oracle's reply" className="icon-button manager-composer__stop" onClick={() => void cancelManager()} title="Stop" type="button">
                <CircleStop aria-hidden="true" size={18} />
              </button>
            ) : null}
            <button
              aria-label={working ? 'Queue message' : 'Send message'}
              className="manager-composer__send"
              disabled={!draft.trim() || sending || tooLong || Boolean(draftStorageError)}
              title={working ? 'Queue (answered after the current reply)' : 'Send'}
              type="submit"
            >
              {sending ? <LoaderCircle aria-hidden="true" className="activity-message__spinner" size={17} /> : <ArrowUp aria-hidden="true" size={18} />}
            </button>
          </div>
          {!draftStorageError && draft ? (
            <p className="manager-composer__status" role="status">
              {recoveredDraft ? 'Recovered saved draft' : 'Saved on this device'}
            </p>
          ) : null}
        </div>
        <div className="manager-composer__options">
          <div className="oracle-mode-field">
            <div aria-describedby="oracle-mode-hint" aria-label="Oracle mode" className="oracle-mode" role="group">
              <button
                aria-pressed={answerOnly}
                onClick={() => changeAnswerOnly(true)}
                title="Oracle answers from the current state of your sessions and never starts, messages, stops, or changes one"
                type="button"
              >
                Ask
              </button>
              <button
                aria-pressed={!answerOnly}
                onClick={() => changeAnswerOnly(false)}
                title="Oracle can also start sessions for work you hand it, and message, rename, stop, or close them"
                type="button"
              >
                Delegate
              </button>
            </div>
            <span className="oracle-mode__hint" id="oracle-mode-hint">
              {conversationActive
                ? `Conversation voice is Ask-only; typed messages use ${answerOnly ? 'Ask' : 'Delegate'}`
                : answerOnly ? 'Running work is left alone' : 'Can start and steer sessions'}
            </span>
          </div>
          <button
            aria-label={`Oracle model: ${runtimeLabel}. Change it in App settings`}
            className="oracle-runtime"
            onClick={onOpenSettings}
            title="Change Oracle's model in App settings"
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" size={13} />
            <span>{runtimeLabel}</span>
          </button>
        </div>
        {settings?.modelUnavailable ? (
          <p className="oracle-runtime__warning" role="status">
            {unavailableModelLabel(settings)} could not start, so Copilot’s default model is answering.
          </p>
        ) : null}
      </form>
      <p aria-live="polite" className="visually-hidden">{liveAnnouncement}</p>
    </section>
  )
}
