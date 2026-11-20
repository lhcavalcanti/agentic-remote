import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ActivityDetail, ActivityDetailText, ActivityStatus } from '../shared/contracts'
import { ACTIVITY_DETAIL_TEXT_LIMIT_BYTES } from '../shared/activity-details'
import {
  activityDetailFailure,
  formatBytes,
  keptActivityDetail,
  loadActivityDetail,
  peekActivityDetail,
  type ActivityDetailFailure,
} from './activity-details'
import { activityStatusLabel, formatActivityDuration } from './activity-presentation'
import { MessageTime } from './MessageTime'

interface PanelState {
  detail?: ActivityDetail
  failure?: ActivityDetailFailure
  /** The read this state answers; a newer one is still loading. */
  settled?: string
}

/**
 * A tool call's complete arguments, output and error under its transcript
 * row, read from the owning computer when the row first opens. Every text is
 * shown as plain text.
 */
export function ActivityDetailsPanel({
  id,
  computerId,
  sessionId,
  toolCallId,
  status,
}: {
  id: string
  computerId: string
  sessionId: string
  toolCallId: string
  /** The row's own status, which the transcript keeps current. */
  status: ActivityStatus
}) {
  const finished = status === 'completed' || status === 'failed'
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<PanelState>({})
  // Read on opening, on request, and once more when a call that was running
  // while open finishes; a finished call is kept and never read again.
  const read = `${attempt}:${finished}`

  useEffect(() => {
    if (keptActivityDetail(computerId, sessionId, toolCallId)) return
    let active = true
    loadActivityDetail(computerId, sessionId, toolCallId, read).then(
      (detail) => {
        if (active) setState({ detail, settled: read })
      },
      (error: unknown) => {
        if (active) {
          setState((current) => ({ detail: current.detail, failure: activityDetailFailure(error), settled: read }))
        }
      },
    )
    return () => {
      active = false
    }
  }, [computerId, read, sessionId, toolCallId])

  const kept = peekActivityDetail(computerId, sessionId, toolCallId)
  const detail = kept ?? state.detail
  const loading = !kept && state.settled !== read
  const failure = kept || loading ? undefined : state.failure
  const retry = () => setAttempt((value) => value + 1)
  return (
    <div className="activity-details" id={id}>
      {detail ? <ActivityDetailBody detail={detail} /> : null}
      {!detail && loading ? (
        <p className="activity-details__note" role="status">Loading details…</p>
      ) : null}
      {detail?.status === 'running' && !failure ? (
        loading ? (
          <p className="activity-details__note" role="status">Loading the result…</p>
        ) : finished ? (
          <p className="activity-details__note" role="status">
            <span>The session log has no result for this call yet.</span>
            <button className="activity-details__retry" onClick={retry} type="button">Try again</button>
          </p>
        ) : (
          <p className="activity-details__note activity-details__note--running" role="status">Running…</p>
        )
      ) : null}
      {failure ? (
        <p
          className={`activity-details__note activity-details__note--${failure.kind}`}
          role={failure.kind === 'error' ? 'alert' : 'status'}
        >
          <span>{failure.message}</span>
          {failure.kind === 'unavailable' ? null : (
            <button className="activity-details__retry" onClick={retry} type="button">
              Try again
            </button>
          )}
        </p>
      ) : null}
    </div>
  )
}

function ActivityDetailBody({ detail }: { detail: ActivityDetail }) {
  const tool = detail.mcpServerName && detail.mcpToolName
    ? `${detail.mcpServerName} › ${detail.mcpToolName}`
    : detail.toolName
  return (
    <>
      <p className="activity-details__meta">
        <span className="activity-details__tool">{tool}</span>
        <span className={`activity-details__status activity-details__status--${detail.status}`}>
          {activityStatusLabel(detail.status)}
        </span>
        {detail.durationMs === undefined ? null : <span>{formatActivityDuration(detail.durationMs)}</span>}
        {detail.startedAt ? (
          <span>Started <MessageTime className="activity-details__time" value={detail.startedAt} /></span>
        ) : null}
        {detail.completedAt ? (
          <span>Finished <MessageTime className="activity-details__time" value={detail.completedAt} /></span>
        ) : null}
      </p>
      {detail.arguments ? (
        <ActivityTextBlock
          label={detail.arguments.format === 'command' ? 'Command' : 'Arguments'}
          tone={detail.arguments.format === 'command' ? 'command' : undefined}
          value={detail.arguments}
        />
      ) : null}
      {detail.result ? <ActivityTextBlock label="Output" value={detail.result} /> : null}
      {detail.error ? <ActivityTextBlock label="Error" tone="error" value={detail.error} /> : null}
      {detail.status !== 'running' && !detail.result && !detail.error ? (
        <p className="activity-details__note">No output.</p>
      ) : null}
    </>
  )
}

function ActivityTextBlock({
  label,
  value,
  tone,
}: {
  label: 'Command' | 'Arguments' | 'Output' | 'Error'
  value: ActivityDetailText
  tone?: 'command' | 'error'
}) {
  return (
    <figure className={`activity-details__block${tone ? ` activity-details__block--${tone}` : ''}`}>
      <figcaption>
        <span className="activity-details__label">{label}</span>
        <span className="activity-details__actions">
          <CopyTextButton label={label} text={value.text} />
        </span>
      </figcaption>
      {/* Focusable, so its own scrolling works from the keyboard too. */}
      <pre className="activity-details__text" tabIndex={0}>{value.text}</pre>
      {value.truncated ? (
        <p className="activity-details__truncated">
          {`Showing the first ${formatBytes(ACTIVITY_DETAIL_TEXT_LIMIT_BYTES)} of ${formatBytes(value.originalBytes)}.`}
        </p>
      ) : null}
    </figure>
  )
}

function CopyTextButton({ label, text }: { label: string; text: string }) {
  const [outcome, setOutcome] = useState<'copied' | 'failed'>()
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timeout.current)
    }
  }, [])

  async function copy() {
    clearTimeout(timeout.current)
    setOutcome(undefined)
    let copied = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        copied = true
      }
    } catch {
      copied = false
    }
    if (!mounted.current) return
    setOutcome(copied ? 'copied' : 'failed')
    timeout.current = setTimeout(() => setOutcome(undefined), copied ? 2000 : 5000)
  }

  return (
    <>
      {outcome === 'failed' ? (
        <span className="activity-details__copy-error" role="alert">
          Could not copy. Select the text instead.
        </span>
      ) : null}
      <button
        aria-label={outcome === 'copied' ? `${label} copied` : `Copy ${label.toLowerCase()}`}
        className="activity-details__copy"
        onClick={() => void copy()}
        type="button"
      >
        {outcome === 'copied' ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
        <span aria-live="polite">{outcome === 'copied' ? 'Copied' : 'Copy'}</span>
      </button>
    </>
  )
}
