import { useEffect, useState } from 'react'
import type { ScheduleProposal } from '../shared/schedule-proposals'
import type { Schedule } from '../shared/schedules'
import { getSchedule, listScheduleProposals, resolveScheduleProposal } from './api'
import { usePreviewFeature } from './preview-features'
import { proposalChanges, proposalConsequence, proposalSchedule, proposalTiming } from './schedule-proposal-presentation'
import './schedule-proposals.css'

function ProposalFacts({ proposal, base }: { proposal: ScheduleProposal; base?: Schedule }) {
  const schedule = proposalSchedule(proposal, base)
  const operation = { create: 'Create', update: 'Update', enable: 'Enable', disable: 'Disable', 'run-now': 'Run now', archive: 'Archive' }[proposal.operation]
  const title = schedule?.name ?? (proposal.operation === 'create' ? proposal.payload.name : proposal.scheduleId)
  if (!schedule) return (
    <>
      <strong>{operation} “{title}”</strong>
      <p className="schedule-proposal__warning" role="alert">
        {base ? `Schedule changed since revision ${proposal.operation === 'create' ? '' : proposal.baseRevision}. Request a fresh proposal.`
          : 'Cannot verify the schedule details. Reload before approving.'}
      </p>
    </>
  )
  const target = schedule.target
  const changes = proposal.operation === 'update' && base ? proposalChanges(proposal, base) : undefined
  const consequence = proposalConsequence(proposal.operation, schedule)
  return (
    <>
      <strong>{operation} “{title}”</strong>
      <p className="schedule-proposal__facts">
        Computer: {target.computerId} · Folder: {target.folder} · Permissions: {target.permissionPolicy === 'allow-all' ? 'Allow all' : 'Ask'} · Folder trust: {target.folderTrust === 'ask' ? 'Ask' : 'Auto-approve'} · Workspace: {schedule.workspace}
      </p>
      {target.permissionPolicy === 'allow-all' ? <p className="schedule-proposal__warning">Runs tools without asking</p> : null}
      <p title={schedule.timezone}>{proposalTiming(schedule, proposal.operation, new Date(Date.now()))}</p>
      {consequence ? <p>{consequence}</p> : null}
      {proposal.operation === 'create' ? <p>Prompt: {schedule.prompt.length > 160 ? `${schedule.prompt.slice(0, 157)}… (${schedule.prompt.length} characters; full text below)` : schedule.prompt}</p> : null}
      {changes ? (
        <ul aria-label="Changes to approve" className="schedule-proposal__changes">
          {changes.length ? changes.map((change) => (
            <li key={change.field}><b>{change.field}:</b> <del>{change.before}</del> → <ins>{change.after}</ins></li>
          )) : <li>No fields change.</li>}
        </ul>
      ) : null}
    </>
  )
}

export function ScheduleProposalCards({ active, refreshKey = 0 }: { active: boolean; refreshKey?: number }) {
  const enabled = usePreviewFeature('schedulerView')
  const [proposals, setProposals] = useState<ScheduleProposal[]>([])
  const [bases, setBases] = useState<Record<string, Schedule>>({})
  const [busy, setBusy] = useState<string>()
  const [error, setError] = useState<string>()
  useEffect(() => {
    if (!active || !enabled) return
    let disposed = false
    void listScheduleProposals().then(async (next) => {
      const ids = [...new Set(next.flatMap((proposal) => proposal.operation === 'create' ? [] : [proposal.scheduleId]))]
      const schedules = await Promise.all(ids.map((id) => getSchedule(id).catch(() => undefined)))
      return { next, bases: Object.fromEntries(schedules.filter((schedule): schedule is Schedule => Boolean(schedule)).map((schedule) => [schedule.id, schedule])) }
    }).then(({ next, bases }) => {
      if (!disposed) { setProposals(next); setBases(bases); setError(undefined) }
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
          <ProposalFacts proposal={proposal} base={proposal.operation === 'create' ? undefined : bases[proposal.scheduleId]} />
          <p>Oracle proposal · {proposal.operation} · {proposal.operation === 'create' ? 'New schedule' : `Base revision ${proposal.baseRevision}`}</p>
          <details>
            <summary>Exact payload to approve</summary>
            <pre>{JSON.stringify(proposal.payload, null, 2)}</pre>
          </details>
          <p className="schedule-proposal__expiry">Expires{' '}<time dateTime={proposal.expiresAt}>{new Date(proposal.expiresAt).toLocaleString()}</time></p>
          <div className="manager-confirmation__actions">
            <button className="primary-button" disabled={Boolean(busy) || !proposalSchedule(proposal, proposal.operation === 'create' ? undefined : bases[proposal.scheduleId])} onClick={() => void resolve(proposal.id, true)} type="button">
              {busy === proposal.id ? 'Saving…' : 'Approve'}
            </button>
            <button className="secondary-button" disabled={Boolean(busy)} onClick={() => void resolve(proposal.id, false)} type="button">Reject</button>
          </div>
        </article>
      ))}
    </section>
  )
}
