import { useState } from 'react'
import { History, RotateCcw, Trash2 } from 'lucide-react'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import {
  CLOSED_SESSION_RETENTION_DAYS,
  closedSessionExpiresAt,
} from '../shared/closed-sessions'
import { DialogFrame } from './components/DialogFrame'
import { computerTone, providerName, sessionKey, shortPath } from './session-presentation'

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
const minute = 60_000
const hour = 60 * minute
const day = 24 * hour

/** `at` relative to `now`, in the largest unit that reads naturally. */
function relative(at: number, now: number): string {
  const elapsed = at - now
  const distance = Math.abs(elapsed)
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
  onReopen,
  onDelete,
}: {
  session: ManagedSession
  now: number
  onReopen: (session: ManagedSession) => Promise<void>
  onDelete: (session: ManagedSession) => Promise<void>
}) {
  const [pending, setPending] = useState<'reopen' | 'delete'>()
  const [error, setError] = useState<string>()
  const context = session.closedContext
  const closedAt = Date.parse(session.closedAt ?? '')
  const expiresAt = closedSessionExpiresAt(session.closedAt ?? '')
  const titleId = `recently-closed-${sessionKey(session)}`

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

  return (
    <li>
      <article
        aria-labelledby={titleId}
        className={`recently-closed-card recently-closed-card--tone-${computerTone(session.computerId)}`}
      >
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
        {context?.prompts.length ? (
          <div className="recently-closed-card__context">
            <h4>You asked</h4>
            <ul>
              {context.prompts.map((prompt, index) => <li key={index}>{prompt}</li>)}
            </ul>
          </div>
        ) : null}
        {context?.reply ? (
          <div className="recently-closed-card__context">
            <h4>Last reply</h4>
            <p>{context.reply}</p>
          </div>
        ) : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
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
        <ul aria-label="Recently closed sessions" className="recently-closed-list">
          {sessions.map((session) => (
            <RecentlyClosedCard
              key={sessionKey(session)}
              now={at}
              onDelete={onDelete}
              onReopen={onReopen}
              session={session}
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
