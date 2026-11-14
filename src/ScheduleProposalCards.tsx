import { useEffect, useState } from 'react'
import { scheduleProposalSummary, type ScheduleProposal } from '../shared/schedule-proposals'
import { listScheduleProposals, resolveScheduleProposal } from './api'
import { usePreviewFeature } from './preview-features'
import './schedule-proposals.css'

export function ScheduleProposalCards({ active, refreshKey = 0 }: { active: boolean; refreshKey?: number }) {
  const enabled = usePreviewFeature('schedulerView')
  const [proposals, setProposals] = useState<ScheduleProposal[]>([])
  const [busy, setBusy] = useState<string>()
  const [error, setError] = useState<string>()
  useEffect(() => {
    if (!active || !enabled) return
    let disposed = false
    void listScheduleProposals().then((next) => {
      if (!disposed) { setProposals(next); setError(undefined) }
    }, (caught: unknown) => {
      if (!disposed) setError(caught instanceof Error ? caught.message : String(caught))
    })
    return () => { disposed = true }
  }, [active, enabled, refreshKey])
  if (!enabled || !active || (!proposals.length && !error)) return null
  const resolve = async (id: string, approve: boolean) => {
    setBusy(id)
    setError(undefined)
    try {
      await resolveScheduleProposal(id, approve)
      setProposals((current) => current.filter((entry) => entry.id !== id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally { setBusy(undefined) }
  }
  return (
    <section aria-label="Schedule approvals" className="schedule-proposals">
      <h3>Schedule approvals</h3>
      <p>Nothing changes until you approve. Approval rechecks permissions, limits and the exact revision.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {proposals.map((proposal) => (
        <article className="manager-confirmation schedule-proposal" key={proposal.id}>
          <strong>{scheduleProposalSummary(proposal)}</strong>
          <p>Oracle proposal · {proposal.operation} · {proposal.operation === 'create' ? 'New schedule' : `Base revision ${proposal.baseRevision}`}</p>
          <details>
            <summary>{proposal.operation === 'update' ? 'Exact changes to approve' : 'Exact payload to approve'}</summary>
            <pre>{JSON.stringify(proposal.payload, null, 2)}</pre>
          </details>
          <p className="schedule-proposal__expiry">Expires <time dateTime={proposal.expiresAt}>{new Date(proposal.expiresAt).toLocaleString()}</time></p>
          <div className="manager-confirmation__actions">
            <button className="primary-button" disabled={Boolean(busy)} onClick={() => void resolve(proposal.id, true)} type="button">
              {busy === proposal.id ? 'Saving…' : 'Approve'}
            </button>
            <button className="secondary-button" disabled={Boolean(busy)} onClick={() => void resolve(proposal.id, false)} type="button">Reject</button>
          </div>
        </article>
      ))}
    </section>
  )
}
