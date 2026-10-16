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
  Orbit,
  RotateCcw,
  SlidersHorizontal,
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

const suggestions = [
  'What is running right now?',
  'What needs my attention?',
  'What did my sessions finish today?',
]

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
const WIDTH_MIN = 340
const WIDTH_MAX = 960
/** The conversation keeps at least this much beside the panel. */
const CONVERSATION_MIN = 360

function boundWidth(value: number, limit = WIDTH_MAX): number {
  return Math.min(limit, Math.max(WIDTH_MIN, Math.round(value)))
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

  const limit = boundWidth(viewport - reservedLeft - CONVERSATION_MIN)
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
      'aria-valuemin': WIDTH_MIN,
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
}

/**
 * Opens Oracle: a floating bubble at the bottom right of the conversation,
 * or a compact icon where the conversation is out of view.
 */
export function OracleButton({
  indicator,
  open,
  onToggle,
  compact = false,
  floating = false,
  className = '',
  offscreen = false,
}: {
  indicator: OracleIndicator
  open: boolean
  onToggle: () => void
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
      title="Oracle: ask about your sessions or hand off work"
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
}) {
  const [snapshot, setSnapshot] = useState<ManagerSnapshot>()
  const [draft, setDraft] = useState('')
  const [answerOnly, setAnswerOnly] = useState(readAnswerOnly)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string>()
  const [confirmReset, setConfirmReset] = useState(false)
  const [busyMessage, setBusyMessage] = useState<string>()
  const [unread, setUnread] = useState(false)
  const [loadError, setLoadError] = useState<string>()
  const [announcement, setAnnouncement] = useState('')
  const listRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const panelWidth = usePanelWidth(reservedLeft)
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

  useEffect(() => {
    let cancelled = false
    // Oracle is an addition to the app; nothing about it may break the rest
    // of the page, so a failed or odd answer just leaves it hidden.
    void Promise.resolve()
      .then(() => getManager())
      .then((next) => {
        if (cancelled) return
        if (next && typeof next === 'object' && Array.isArray(next.messages)) {
          setSnapshot(next)
          setLoadError(undefined)
        } else {
          setLoadError('Oracle sent an answer this app cannot read.')
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(`Oracle could not be reached: ${caught instanceof Error ? caught.message : String(caught)}`)
      })
    return () => {
      cancelled = true
    }
  }, [connectionEpoch])

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
    wasOpenRef.current = open
    if (open) {
      const active = document.activeElement
      returnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null
      if (!phoneEnterCreatesNewline()) inputRef.current?.focus()
      return
    }
    // Only a panel that was open hands focus back; the first render must not take it.
    if (!wasOpen) return
    const target = returnFocusRef.current
    returnFocusRef.current = null
    // Safari does not focus a button on click, so the trigger is the fallback.
    const trigger = visibleTrigger()
    const destination = target && canTakeFocus(target) ? target : trigger
    if (destination && document.activeElement !== destination && !document.querySelector('[role="dialog"]:focus-within')) {
      destination.focus()
    }
  }, [open])

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
    }
    return () => {
      controlRef.current = undefined
    }
  }, [controlRef, onOpenChange, sendText])

  async function send(content = draft, onlyOracle = answerOnly) {
    const text = content.trim()
    if (!text || sending) return
    setSending(true)
    setSendError(undefined)
    try {
      await sendText(content, onlyOracle)
      if (content === draft) setDraft('')
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

  if (!snapshot?.available || !open) {
    return <p aria-live="polite" className="visually-hidden">{announcement}</p>
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
      className="manager-panel"
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
        <button aria-label="Close Oracle" className="icon-button" onClick={close} title="Close (Esc)" type="button">
          <X aria-hidden="true" size={19} />
        </button>
      </header>
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
            {queue.map((message, index) => (
              <li className="oracle-queue__item" key={message.id}>
                <span aria-hidden="true" className="oracle-queue__position">{index + 1}</span>
                <p className="oracle-queue__text">
                  <span className="visually-hidden">{`Number ${index + 1}: `}</span>
                  {message.content}
                </p>
                {message.answerOnly ? <span className="oracle-queue__tag">Ask</span> : null}
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
              </li>
            ))}
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
        <div className={`manager-composer__row${answerOnly ? ' manager-composer__row--only' : ''}`}>
          <textarea
            aria-label="Message Oracle"
            enterKeyHint={phoneEnterCreatesNewline() ? 'enter' : 'send'}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask me anything"
            ref={inputRef}
            rows={2}
            value={draft}
          />
          <div className="manager-composer__actions">
            {working ? (
              <button aria-label="Stop Oracle's reply" className="icon-button manager-composer__stop" onClick={() => void cancelManager()} title="Stop" type="button">
                <CircleStop aria-hidden="true" size={18} />
              </button>
            ) : null}
            <button
              aria-label={working ? 'Queue message' : 'Send message'}
              className="manager-composer__send"
              disabled={!draft.trim() || sending || tooLong}
              title={working ? 'Queue (answered after the current reply)' : 'Send'}
              type="submit"
            >
              {sending ? <LoaderCircle aria-hidden="true" className="activity-message__spinner" size={17} /> : <ArrowUp aria-hidden="true" size={18} />}
            </button>
          </div>
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
              {answerOnly ? 'Running work is left alone' : 'Can start and steer sessions'}
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
      <p aria-live="polite" className="visually-hidden">{announcement}</p>
    </section>
  )
}
