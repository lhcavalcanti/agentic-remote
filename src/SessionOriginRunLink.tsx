import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink } from 'lucide-react'
import type { SessionProvenance } from '../shared/contracts'
import type { ScheduleRun } from '../shared/schedules'
import { getScheduleRun } from './api'
import { DialogFrame } from './components/DialogFrame'
import { usePreviewFeature } from './preview-features'

function RunDetails({ provenance, onClose }: { provenance: SessionProvenance; onClose: () => void }) {
  const [run, setRun] = useState<ScheduleRun>()
  const [error, setError] = useState<string>()
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    void getScheduleRun(provenance.scheduleRunId!, controller.signal).then(
      (value) => { if (!controller.signal.aborted) { setRun(value); setError(undefined) } },
      (failure: unknown) => {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'The run could not be loaded.')
      },
    )
    return () => controller.abort()
  }, [provenance.scheduleRunId, attempt])
  return createPortal(
    <div onKeyDown={(event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose() }
    }}>
      <DialogFrame title="Schedule run" eyebrow={provenance.scheduleName || 'Scheduled session'} onClose={onClose}>
        {error ? (
          <div role="alert">
            <p>{error}</p>
            <button className="secondary-button" onClick={() => setAttempt((value) => value + 1)} type="button">Retry</button>
          </div>
        ) : !run ? <p role="status">Loading run…</p> : (
          <dl className="session-origin-run">
            <dt>Status</dt><dd>{run.status}</dd>
            <dt>Trigger</dt><dd>{run.trigger}</dd>
            <dt>Scheduled for</dt><dd><time dateTime={run.occurrenceAt}>{new Date(run.occurrenceAt).toLocaleString()}</time></dd>
            {run.startedAt ? <><dt>Started</dt><dd>{new Date(run.startedAt).toLocaleString()}</dd></> : null}
            {run.endedAt ? <><dt>Ended</dt><dd>{new Date(run.endedAt).toLocaleString()}</dd></> : null}
            {run.summary ? <><dt>Summary</dt><dd>{run.summary}</dd></> : null}
            {run.error ? <><dt>Error</dt><dd>{run.error}</dd></> : null}
          </dl>
        )}
      </DialogFrame>
    </div>,
    document.body,
  )
}

function RunLink({ provenance }: { provenance: SessionProvenance }) {
  const [open, setOpen] = useState(false)
  const description = `View run from schedule${provenance.scheduleName ? ` ${provenance.scheduleName}` : ''}`
  return (
    <>
      <a
        aria-haspopup="dialog"
        aria-label={description}
        className="session-origin-run-link"
        href={`/api/schedules/runs/${encodeURIComponent(provenance.scheduleRunId!)}`}
        onClick={(event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
          event.preventDefault()
          setOpen(true)
        }}
        title={description}
      ><ExternalLink aria-hidden="true" size={13} /></a>
      {open ? <RunDetails key={provenance.scheduleRunId} provenance={provenance} onClose={() => setOpen(false)} /> : null}
    </>
  )
}

export function SessionOriginRunLink({ provenance }: { provenance?: SessionProvenance }) {
  const enabled = usePreviewFeature('composerRefresh')
  const scheduler = usePreviewFeature('schedulerView')
  if (!enabled || !scheduler || provenance?.origin !== 'schedule' || !provenance.scheduleRunId) return null
  return <RunLink key={provenance.scheduleRunId} provenance={provenance} />
}
