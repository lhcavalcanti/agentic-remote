import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
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
  X,
} from 'lucide-react'
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSessionRef,
  ManagerSnapshot,
} from '../shared/manager'
import { MANAGER_MESSAGE_MAX_LENGTH } from '../shared/manager'
import {
  cancelManager,
  getManager,
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
  if (snapshot.status === 'offline') return 'Could not answer the last message'
  return `Keeping track of ${openSessions} open session${openSessions === 1 ? '' : 's'}`
}

/** Places the bubble just above the composer, or at the corner when there is none. */
function useBubbleOffset(active: boolean): number {
  const [offset, setOffset] = useState(20)
  useLayoutEffect(() => {
    if (!active) return
    let observed: Element | null = null
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => measure())
    function measure() {
      const composer = document.querySelector('.composer-area')
      if (composer !== observed) {
        if (observed) observer?.unobserve(observed)
        if (composer) observer?.observe(composer)
        observed = composer
      }
      // The status line sits just above the composer and must stay readable.
      const tops = [composer, composer ? document.querySelector('.web-statusline') : null]
        .map((element) => element?.getBoundingClientRect())
        .filter((rect): rect is DOMRect => Boolean(rect && rect.height > 0))
        .map((rect) => rect.top)
      const viewport = window.visualViewport?.height ?? window.innerHeight
      setOffset(tops.length ? Math.max(20, Math.round(viewport - Math.min(...tops) + 10)) : 20)
    }
    measure()
    const interval = window.setInterval(measure, 1000)
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [active])
  return offset
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
      {message.state === 'queued' ? <span className="manager-message__state">Waiting its turn</span> : null}
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

export function ManagerAssistant({
  connectionEpoch,
  subscribe,
  defaults,
  openSessions,
  composerVisible,
  keyboardOpen,
  onOpenSession,
  onManagedSessionsChange,
}: {
  /** Changes each time the event socket reconnects, so the snapshot is reread. */
  connectionEpoch: number
  subscribe: (listener: (event: ManagerEvent) => void) => () => void
  defaults: ManagerClientDefaults
  openSessions: number
  composerVisible: boolean
  keyboardOpen: boolean
  onOpenSession: (ref: ManagerSessionRef) => boolean
  onManagedSessionsChange: (keys: string[]) => void
}) {
  const [snapshot, setSnapshot] = useState<ManagerSnapshot>()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string>()
  const [confirmReset, setConfirmReset] = useState(false)
  const [retrying, setRetrying] = useState<string>()
  const [unread, setUnread] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const listRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bubbleRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef(open)
  const managedRef = useRef(onManagedSessionsChange)
  useLayoutEffect(() => {
    openRef.current = open
    managedRef.current = onManagedSessionsChange
  })
  const offset = useBubbleOffset(!open)

  useEffect(() => {
    let cancelled = false
    // The manager is an addition to the app; nothing about it may break the
    // rest of the page, so a failed or odd answer just leaves it hidden.
    void Promise.resolve()
      .then(() => getManager())
      .then((next) => {
        if (!cancelled && next && typeof next === 'object' && Array.isArray(next.messages)) setSnapshot(next)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [connectionEpoch])

  useEffect(() => subscribe((event) => {
    setSnapshot((current) => current ? applyEvent(current, event) : current)
    if (event.type === 'manager.message' && event.message.role === 'assistant') {
      if (!openRef.current) setUnread(true)
      setAnnouncement('The manager replied.')
    }
  }), [subscribe])

  const managedKey = snapshot?.managedSessions.join('\n') ?? ''
  useEffect(() => {
    managedRef.current(managedKey ? managedKey.split('\n') : [])
  }, [managedKey])

  const messageCount = snapshot?.messages.length ?? 0
  const streamLength = snapshot?.streaming?.content.length ?? 0
  useEffect(() => {
    const list = listRef.current
    if (list && open) list.scrollTop = list.scrollHeight
  }, [messageCount, streamLength, open])

  useEffect(() => {
    if (open && !phoneEnterCreatesNewline()) inputRef.current?.focus()
  }, [open])

  function openPanel() {
    setUnread(false)
    setOpen(true)
  }

  const close = useCallback(() => {
    setOpen(false)
    setConfirmReset(false)
    window.setTimeout(() => bubbleRef.current?.focus(), 0)
  }, [])

  const openSession = useCallback((ref: ManagerSessionRef) => {
    if (onOpenSession(ref) && phoneEnterCreatesNewline()) setOpen(false)
  }, [onOpenSession])

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

  async function send(content = draft) {
    const text = content.trim()
    if (!text || sending) return
    setSending(true)
    setSendError(undefined)
    try {
      const message = await sendManagerMessage(content, defaults)
      setSnapshot((current) => current ? withReturnedMessage(current, message) : current)
      if (content === draft) setDraft('')
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSending(false)
    }
  }

  async function retry(message: ManagerMessage) {
    setRetrying(message.id)
    setSendError(undefined)
    try {
      const next = await retryManagerMessage(message.id)
      setSnapshot((current) => current ? withReturnedMessage(current, next) : current)
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setRetrying(undefined)
    }
  }

  async function answer(message: ManagerMessage, accept: boolean) {
    setRetrying(message.id)
    setSendError(undefined)
    try {
      const next = await resolveManagerConfirmation(message.id, accept)
      setSnapshot((current) => current ? withReturnedMessage(current, next) : current)
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setRetrying(undefined)
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

  if (!snapshot?.available) return null

  const working = snapshot.status === 'working' || snapshot.status === 'recovering'
  const streaming = snapshot.streaming?.content.trim() ? snapshot.streaming : undefined
  const tooLong = draft.length > MANAGER_MESSAGE_MAX_LENGTH

  return (
    <>
      {!open && !(keyboardOpen && composerVisible) ? (
        <button
          aria-expanded={false}
          aria-label={unread ? 'Open the manager (new reply)' : 'Open the manager'}
          className={`manager-bubble${working ? ' manager-bubble--working' : ''}${
            snapshot.status === 'offline' ? ' manager-bubble--offline' : ''
          }`}
          onClick={openPanel}
          ref={bubbleRef}
          style={{ bottom: `calc(${offset}px + env(safe-area-inset-bottom, 0px) * ${composerVisible ? 0 : 1})` }}
          title="Manager: ask about your sessions or hand off work"
          type="button"
        >
          <Orbit aria-hidden="true" size={22} strokeWidth={1.8} />
          {unread ? <span aria-hidden="true" className="manager-bubble__unread" /> : null}
        </button>
      ) : null}
      {open ? (
        <section
          aria-label="Manager"
          className="manager-panel"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !event.defaultPrevented) {
              event.preventDefault()
              close()
            }
          }}
          role="dialog"
        >
          <header className="manager-panel__header">
            <span aria-hidden="true" className={`manager-panel__mark${working ? ' manager-panel__mark--working' : ''}`}>
              <Orbit size={18} strokeWidth={1.8} />
            </span>
            <div className="manager-panel__title">
              <h2>Manager</h2>
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
            <button aria-label="Close the manager" className="icon-button" onClick={close} title="Close (Esc)" type="button">
              <X aria-hidden="true" size={19} />
            </button>
          </header>
          {confirmReset ? (
            <div className="manager-panel__confirm" role="alertdialog" aria-label="Start a new conversation">
              <p>Start a new conversation? Its notes and memory are kept.</p>
              <button className="primary-button" onClick={() => void startOver()} type="button">Start over</button>
              <button className="secondary-button" onClick={() => setConfirmReset(false)} type="button">Keep this one</button>
            </div>
          ) : null}
          {snapshot.messages.length || streaming || working ? (
            <ol aria-label="Manager conversation" className="manager-transcript" ref={listRef}>
              {snapshot.messages.map((message) => {
                if (message.role === 'user') {
                  return <UserMessage key={message.id} message={message} onRetry={(next) => void retry(next)} retrying={retrying === message.id} />
                }
                if (message.role === 'activity' && message.confirmation) {
                  return (
                    <ConfirmationCard
                      answering={retrying === message.id}
                      key={message.id}
                      message={message}
                      onAnswer={(next, accept) => void answer(next, accept)}
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
                I keep track of every session on your computers and start a new one for each piece of
                work you hand me, so you can open it and steer it yourself.
              </p>
              <div className="manager-empty__suggestions">
                {suggestions.map((suggestion) => (
                  <button className="secondary-button" key={suggestion} onClick={() => void send(suggestion)} type="button">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            <div className="manager-composer__row">
              <textarea
                aria-label="Message the manager"
                enterKeyHint={phoneEnterCreatesNewline() ? 'enter' : 'send'}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={working ? 'Add to the queue…' : 'Ask about sessions or hand off work…'}
                ref={inputRef}
                rows={2}
                value={draft}
              />
              <div className="manager-composer__actions">
                {working ? (
                  <button aria-label="Stop the manager's reply" className="icon-button manager-composer__stop" onClick={() => void cancelManager()} title="Stop" type="button">
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
          </form>
          <p aria-live="polite" className="visually-hidden">{announcement}</p>
        </section>
      ) : null}
    </>
  )
}
