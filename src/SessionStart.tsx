import { useEffect, useId, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import type { PendingSessionCreation } from './SessionNavigation'
import {
  computerTone,
  executionModeName,
  providerName,
  shortPath,
} from './session-presentation'

/** A session being started, shown as the open view until it exists. */
export type StartingSession = PendingSessionCreation & {
  computerName: string
  /** When its creation was asked for, to say how long it has taken. */
  startedAt: number
}

function elapsedSeconds(startedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - startedAt) / 1_000))
}

function minutesAndSeconds(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function keptLine(held: number, drafted: boolean): string | undefined {
  const messages = held === 1 ? 'the held message' : `the ${held} held messages`
  if (held && drafted) return `Your draft and ${messages} stay here until you try again or discard them.`
  if (held === 1) return 'The held message stays here until you try again or discard it.'
  if (held) return `The ${held} held messages stay here until you try again or discard them.`
  return drafted ? 'Your draft stays here until you try again or discard it.' : undefined
}

/**
 * The conversation area of a session that does not exist yet: what is
 * starting, where, and for how long, and what can be done if it fails.
 */
export function SessionStart({
  start,
  held,
  drafted,
  announceFailure,
  onRetry,
  onDiscard,
}: {
  start: StartingSession
  /** Messages waiting to be sent to it. */
  held: number
  drafted: boolean
  /** Off while another surface, such as the New session sheet, reports it. */
  announceFailure: boolean
  onRetry: () => void
  onDiscard: () => void
}) {
  const headingId = useId()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (start.failure) return
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [start.failure, start.startedAt])
  const seconds = elapsedSeconds(start.startedAt, now)
  const mode = executionModeName(start.executionMode)
  const what = (
    <>
      <strong>{providerName(start.provider)}</strong>
      {mode ? ` in ${mode}` : ''}
    </>
  )
  const where = (
    <>
      on <strong>{start.computerName}</strong> in <code>{shortPath(start.cwd)}</code>.
    </>
  )
  const kept = keptLine(held, drafted)
  return (
    <section
      aria-label="New session"
      className={`session-start session-start--tone-${computerTone(start.computerId)}${
        start.failure ? ' session-start--failed' : ''
      }`}
    >
      {start.failure ? (
        <>
          <div className="session-start__state" role={announceFailure ? 'alert' : undefined}>
            <span aria-hidden="true" className="session-start__mark">
              <CircleAlert size={22} />
            </span>
            <h2>Couldn’t start the session</h2>
            <p>{what} could not start {where}</p>
            <p className="session-start__error">{start.failure}</p>
          </div>
          <div className="session-start__actions">
            <button className="primary-button" onClick={onRetry} type="button">
              Try again
            </button>
            <button className="secondary-button" onClick={onDiscard} type="button">
              Discard
            </button>
          </div>
          {kept ? <small className="session-start__note">{kept}</small> : null}
        </>
      ) : (
        <>
          <div aria-labelledby={headingId} className="session-start__state" role="status">
            <span aria-hidden="true" className="session-start__dots">
              <i />
              <i />
              <i />
            </span>
            <h2 id={headingId}>Starting session</h2>
            <p>{what} is starting {where}</p>
          </div>
          {/* Outside the status, so the seconds are not read out as they pass. */}
          <p className="session-start__elapsed">
            <span className="visually-hidden">Starting for </span>
            <time dateTime={`PT${seconds}S`}>{minutesAndSeconds(seconds)}</time>
          </p>
          <small className="session-start__note">
            {held
              ? 'Messages you send now wait below and go to it in order once it is ready.'
              : 'Write your first message below. It sends once the session is ready.'}
          </small>
        </>
      )}
    </section>
  )
}
