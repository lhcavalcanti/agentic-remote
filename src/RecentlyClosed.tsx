import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { History, RotateCcw, Trash2 } from 'lucide-react'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import {
  CLOSED_SESSION_RETENTION_DAYS,
  closedSessionExpiresAt,
} from '../shared/closed-sessions'
import { DialogFrame } from './components/DialogFrame'
import { markdownPlainText } from './markdown-plain-text'
import { computerTone, providerName, sessionKey, shortPath } from './session-presentation'

// English like the rest of the interface, rather than the browser's language
// inside an English sentence.
const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const minute = 60_000
const hour = 60 * minute
const day = 24 * hour

/** Wider than the app's phone layout, as the stylesheet's desktop rules are. */
const wideQuery = '(min-width: 961px)'

function subscribeWide(notify: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined
  const media = window.matchMedia(wideQuery)
  media.addEventListener?.('change', notify)
  return () => media.removeEventListener?.('change', notify)
}

function wideNow(): boolean {
  return typeof window.matchMedia === 'function'
    ? Boolean(window.matchMedia(wideQuery)?.matches)
    : window.innerWidth > 960
}

/** `at` relative to `now`, in the largest unit that reads naturally. */
function relative(at: number, now: number): string {
  const elapsed = at - now
  const distance = Math.abs(elapsed)
  if (distance < minute) return elapsed > 0 ? 'in under a minute' : 'just now'
  if (distance < hour) return relativeTime.format(Math.round(elapsed / minute), 'minute')
  if (distance < day) return relativeTime.format(Math.round(elapsed / hour), 'hour')
  return relativeTime.format(Math.round(elapsed / day), 'day')
}

export function CloseSessionDialog({
  session,
  recoverable,
  onCloseSession,
  onDelete,
  onCancel,
}: {
  session: ManagedSession
  /** The owning computer keeps closed sessions to reopen. */
  recoverable: boolean
  onCloseSession: () => void
  onDelete: () => void
  onCancel: () => void
}) {
  const queued = session.queuedCount || session.queuedPrompts?.length || 0
  return (
    <DialogFrame
      className="close-session-dialog"
      eyebrow={session.computerName}
      onClose={onCancel}
      title="Close session"
    >
      {recoverable ? (
        <p className="close-session-dialog__message">
          Close “{session.title}” on {session.computerName}? You can reopen it from
          Recently closed for {CLOSED_SESSION_RETENTION_DAYS} days.
          {queued > 0
            ? ` Its ${queued} queued message${queued === 1 ? ' is' : 's are'} discarded.`
            : null}
        </p>
      ) : (
        <p className="close-session-dialog__message">
          {session.computerName} deletes closed sessions for good: this removes the{' '}
          {providerName(session.provider)} session and its history.
        </p>
      )}
      <div className="close-session-dialog__actions">
        {recoverable ? (
          <button className="primary-button" onClick={onCloseSession} type="button">
            Close session
          </button>
        ) : (
          <button className="danger-button" onClick={onDelete} type="button">
            <Trash2 aria-hidden="true" size={15} />
            Delete permanently
          </button>
        )}
        <button className="secondary-button" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
      {recoverable ? (
        <div className="close-session-dialog__permanent">
          <p className="dialog-message">
            Delete permanently removes it and its history now; it cannot be reopened.
          </p>
          <button className="danger-button" onClick={onDelete} type="button">
            <Trash2 aria-hidden="true" size={15} />
            Delete permanently
          </button>
        </div>
      ) : null}
    </DialogFrame>
  )
}

function RecentlyClosedCard({
  session,
  now,
  wide,
  onReopen,
  onDelete,
}: {
  session: ManagedSession
  now: number
  /** A desktop's layout: the actions sit in the header, beside the title. */
  wide: boolean
  onReopen: (session: ManagedSession) => Promise<void>
  onDelete: (session: ManagedSession) => Promise<void>
}) {
  const [pending, setPending] = useState<'reopen' | 'delete'>()
  const [error, setError] = useState<string>()
  const [expanded, setExpanded] = useState(false)
  const [cut, setCut] = useState(false)
  const promptsRef = useRef<HTMLUListElement>(null)
  const replyRef = useRef<HTMLParagraphElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const collapsedByReader = useRef(false)
  const contextId = useId()
  const context = session.closedContext
  // A prompt that was only an image or markup says nothing in words.
  const prompts = useMemo(() => context?.prompts.map(markdownPlainText).filter(Boolean) ?? [], [context])
  const reply = useMemo(() => (context?.reply ? markdownPlainText(context.reply) : ''), [context])
  const closedAt = Date.parse(session.closedAt ?? '')
  const expiresAt = closedSessionExpiresAt(session.closedAt ?? '')
  const titleId = `recently-closed-${sessionKey(session)}`

  // Whether three lines each hide some of the context, once it is laid out
  // and again whenever a resize or a late web font rewraps it. Measuring only
  // reads, so every card measures against the same layout. Show less stays
  // while the card is open.
  useLayoutEffect(() => {
    if (expanded) return
    if (collapsedByReader.current) {
      collapsedByReader.current = false
      // Shortening the card pulls Show more up, which a scrolled list can
      // leave above the view; bring it back to where the reader is.
      toggleRef.current?.scrollIntoView?.({ block: 'nearest' })
    }
    const parts = [promptsRef.current, replyRef.current].filter((part) => part !== null)
    let current = true
    const measure = () => {
      if (current) setCut(parts.some((part) => part.scrollHeight > part.clientHeight + 1))
    }
    measure()
    void document.fonts?.ready.then(measure)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : undefined
    for (const part of parts) observer?.observe(part)
    return () => {
      current = false
      observer?.disconnect()
    }
  }, [expanded, prompts, reply])

  async function act(kind: 'reopen' | 'delete') {
    if (
      kind === 'delete' &&
      !window.confirm(
        `Delete “${session.title}” permanently? Its history is removed from ${session.computerName} and it can no longer be reopened.`,
      )
    ) {
      return
    }
    setPending(kind)
    setError(undefined)
    try {
      await (kind === 'reopen' ? onReopen(session) : onDelete(session))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setPending(undefined)
    }
  }

  const actions = (
    <div className="recently-closed-card__actions">
      <button
        aria-label={`Reopen ${session.title}`}
        className="primary-button"
        disabled={pending !== undefined}
        onClick={() => void act('reopen')}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={15} />
        {pending === 'reopen' ? 'Reopening…' : 'Reopen'}
      </button>
      <button
        aria-label={`Delete ${session.title} permanently`}
        className="danger-button"
        disabled={pending !== undefined}
        onClick={() => void act('delete')}
        type="button"
      >
        <Trash2 aria-hidden="true" size={15} />
        {pending === 'delete' ? 'Deleting…' : 'Delete permanently'}
      </button>
    </div>
  )
  const failure = error ? <p className="form-error" role="alert">{error}</p> : null

  // The actions and their error come where they are seen, so the keyboard
  // reaches them in the same order: beside the title on a desktop, after the
  // context on a phone.
  return (
    <li>
      <article
        aria-labelledby={titleId}
        className={`recently-closed-card recently-closed-card--tone-${computerTone(session.computerId)}`}
      >
        <header className="recently-closed-card__header">
          <div className="recently-closed-card__summary">
            <h3 id={titleId}>{session.title}</h3>
            <p className="recently-closed-card__where">
              <span className="recently-closed-card__computer">{session.computerName}</span>
              <span className="recently-closed-card__folder">{shortPath(session.cwd)}</span>
            </p>
            <p className="recently-closed-card__when">
              {Number.isFinite(closedAt) ? (
                <time dateTime={session.closedAt} title={new Date(closedAt).toLocaleString()}>
                  Closed {relative(closedAt, now)}
                </time>
              ) : null}
              {Number.isFinite(expiresAt) ? (
                <time dateTime={new Date(expiresAt).toISOString()} title={new Date(expiresAt).toLocaleString()}>
                  Deleted {relative(expiresAt, now)}
                </time>
              ) : null}
            </p>
          </div>
          {wide ? actions : null}
        </header>
        {wide ? failure : null}
        {prompts.length || reply ? (
          <div
            className={`recently-closed-card__context${expanded ? ' recently-closed-card__context--expanded' : ''}`}
            id={contextId}
          >
            {prompts.length ? (
              <div className="recently-closed-card__part">
                <h4>You asked</h4>
                <ul ref={promptsRef}>
                  {prompts.map((prompt, index) => <li key={index}>{prompt}</li>)}
                </ul>
              </div>
            ) : null}
            {reply ? (
              <div className="recently-closed-card__part">
                <h4>Last reply</h4>
                <p ref={replyRef}>{reply}</p>
              </div>
            ) : null}
          </div>
        ) : null}
        {cut || expanded ? (
          <button
            aria-controls={contextId}
            aria-expanded={expanded}
            className="recently-closed-card__more"
            onClick={() => {
              collapsedByReader.current = expanded
              setExpanded(!expanded)
            }}
            ref={toggleRef}
            type="button"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        ) : null}
        {wide ? null : failure}
        {wide ? null : actions}
      </article>
    </li>
  )
}

export function RecentlyClosedDialog({
  sessions,
  loading,
  error,
  computers,
  now = Date.now,
  onRetry,
  onReopen,
  onDelete,
  onClose,
}: {
  sessions?: ManagedSession[]
  loading: boolean
  error?: string
  computers: ComputerSummary[]
  now?: () => number
  onRetry: () => void
  onReopen: (session: ManagedSession) => Promise<void>
  onDelete: (session: ManagedSession) => Promise<void>
  onClose: () => void
}) {
  const offline = computers.filter((computer) => !computer.online).map((computer) => computer.name)
  const at = now()
  const listRef = useRef<HTMLUListElement>(null)
  const refocus = useRef<{ card: string; label: string }>(undefined)
  // Crossing the desktop width moves each card's actions, which remounts
  // them, so the one that had the focus is noted first and given it back.
  const subscribe = useCallback((notify: () => void) => subscribeWide(() => {
    const active = document.activeElement
    const card = active instanceof HTMLElement && listRef.current?.contains(active)
      ? active.closest('article')?.getAttribute('aria-labelledby')
      : undefined
    refocus.current = card ? { card, label: active?.getAttribute('aria-label') ?? '' } : undefined
    notify()
  }), [])
  const wide = useSyncExternalStore(subscribe, wideNow, () => false)
  useLayoutEffect(() => {
    const target = refocus.current
    refocus.current = undefined
    if (!target || listRef.current?.contains(document.activeElement)) return
    const card = [...(listRef.current?.querySelectorAll('article') ?? [])]
      .find((article) => article.getAttribute('aria-labelledby') === target.card)
    ;[...(card?.querySelectorAll('button') ?? [])]
      .find((button) => button.getAttribute('aria-label') === target.label)
      ?.focus()
  }, [wide])
  return (
    <DialogFrame
      className="recently-closed-dialog"
      eyebrow="Sessions"
      onClose={onClose}
      title="Recently closed"
    >
      <p className="dialog-message recently-closed-dialog__intro">
        <History aria-hidden="true" size={14} />
        Closed sessions can be reopened for {CLOSED_SESSION_RETENTION_DAYS} days, then they are
        deleted for good.
      </p>
      {error ? (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button className="error-banner__retry" onClick={onRetry} type="button">
            Retry
          </button>
        </div>
      ) : null}
      {sessions === undefined ? (
        loading ? <p className="sidebar-message" role="status">Loading recently closed sessions…</p> : null
      ) : sessions.length === 0 ? (
        <p className="sidebar-message">
          Nothing closed in the last {CLOSED_SESSION_RETENTION_DAYS} days. Closing a session keeps
          it here so you can reopen it.
        </p>
      ) : (
        <ul aria-label="Recently closed sessions" className="recently-closed-list" ref={listRef}>
          {sessions.map((session) => (
            <RecentlyClosedCard
              key={sessionKey(session)}
              now={at}
              onDelete={onDelete}
              onReopen={onReopen}
              session={session}
              wide={wide}
            />
          ))}
        </ul>
      )}
      {offline.length ? (
        <p className="dialog-message">
          Sessions closed on {offline.join(', ')} appear here once{' '}
          {offline.length === 1 ? 'it reconnects' : 'they reconnect'}.
        </p>
      ) : null}
    </DialogFrame>
  )
}
