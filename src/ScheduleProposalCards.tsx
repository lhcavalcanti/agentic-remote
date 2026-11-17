import { useEffect, useState } from 'react'
import type { ScheduleProposal } from '../shared/schedule-proposals'
import type { Schedule } from '../shared/schedules'
import { nextOccurrences } from '../shared/schedule-recurrence'
import { getSchedule, listScheduleProposals, resolveScheduleProposal } from './api'
import { usePreviewFeature } from './preview-features'
import { proposalChanges, proposalConsequence, proposalSchedule, proposalTiming, proposalUnavailableReason } from './schedule-proposal-presentation'
import './schedule-proposals.css'

function ProposalFacts({ proposal, base, now, refreshing }: { proposal: ScheduleProposal; base?: Schedule; now: number; refreshing: boolean }) {
  const schedule = proposalSchedule(proposal, base)
  const operation = { create: 'Create', update: 'Update', enable: 'Enable', disable: 'Disable', 'run-now': 'Run now', archive: 'Archive' }[proposal.operation]
  const title = schedule?.name ?? (proposal.operation === 'create' ? proposal.payload.name : proposal.scheduleId)
  if (refreshing) return <strong>{operation} “{title}”</strong>
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
      <p title={schedule.timezone}>{proposalTiming(schedule, proposal.operation, new Date(now))}</p>
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
  const [now, setNow] = useState(() => Date.now())
  const [facts, setFacts] = useState<{ key: number; ready: boolean }>()
  const factsReady = facts?.key === refreshKey && facts.ready
  useEffect(() => {
    if (!active || !enabled) return
    let disposed = false
    void listScheduleProposals().then(async (next) => {
      const ids = [...new Set(next.flatMap((proposal) => proposal.operation === 'create' ? [] : [proposal.scheduleId]))]
      const schedules = await Promise.all(ids.map((id) => getSchedule(id).catch(() => undefined)))
      return { next, bases: Object.fromEntries(schedules.filter((schedule): schedule is Schedule => Boolean(schedule)).map((schedule) => [schedule.id, schedule])) }
    }).then(({ next, bases }) => {
      if (!disposed) {
        setProposals(next); setBases(bases); setError(undefined); setNow(Date.now())
        setFacts({ key: refreshKey, ready: true })
      }
    }, (caught: unknown) => {
      if (!disposed) {
        setError(caught instanceof Error ? caught.message : String(caught))
        setFacts({ key: refreshKey, ready: false })
      }
    })
    return () => { disposed = true }
  }, [active, enabled, refreshKey])
  useEffect(() => {
    if (!active || !enabled) return
    const refresh = () => setNow(Date.now())
    const boundaries = proposals.flatMap((proposal) => {
      const schedule = proposalSchedule(proposal, proposal.operation === 'create' ? undefined : bases[proposal.scheduleId])
      const next = schedule?.enabled && schedule.recurrence.type !== 'once' &&
        proposal.operation !== 'archive' && proposal.operation !== 'run-now'
        ? nextOccurrences(schedule.recurrence, schedule.timezone, new Date(now), 1)[0]?.getTime() : undefined
      return [
        Date.parse(proposal.expiresAt),
        ...(schedule?.recurrence.type === 'once' ? [Date.parse(schedule.recurrence.at)] : []),
        ...(next === undefined ? [] : [next]),
      ]
    }).filter((at) => at > now)
    const timer = boundaries.length ? setTimeout(refresh, Math.min(2_147_483_647, Math.max(0, Math.min(...boundaries) - Date.now()))) : undefined
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [active, enabled, proposals, bases, now])
  if (!enabled || !active || (!proposals.length && !error)) return null
  const resolve = async (id: string, approve: boolean) => {
    const proposal = proposals.find((entry) => entry.id === id)
    if (approve && (!factsReady || !proposal || !proposalSchedule(proposal, proposal.operation === 'create' ? undefined : bases[proposal.scheduleId]))) return
    if (approve && proposal && proposalUnavailableReason(proposal, proposal.operation === 'create' ? undefined : bases[proposal.scheduleId], Date.now())) {
      setNow(Date.now())
      return
    }
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
      {proposals.map((proposal) => {
        const base = proposal.operation === 'create' || !factsReady ? undefined : bases[proposal.scheduleId]
        const reason = !factsReady
          ? facts?.key !== refreshKey ? 'Refreshing schedule details before approval.' : 'Cannot verify schedule details. Reload before approving.'
          : proposalUnavailableReason(proposal, base, now)
        return (
        <article className="manager-confirmation schedule-proposal" key={proposal.id}>
          <ProposalFacts proposal={proposal} base={base} now={now} refreshing={!factsReady} />
          <p>Oracle proposal · {proposal.operation} · {proposal.operation === 'create' ? 'New schedule' : `Base revision ${proposal.baseRevision}`}</p>
          <details>
            <summary>Exact payload to approve</summary>
            <pre>{JSON.stringify(proposal.payload, null, 2)}</pre>
          </details>
          <p className="schedule-proposal__expiry">Expires{' '}<time dateTime={proposal.expiresAt}>{new Date(proposal.expiresAt).toLocaleString()}</time></p>
          {reason ? <p className="schedule-proposal__warning" id={`proposal-reason-${proposal.id}`} role="status">{reason}</p> : null}
          <div className="manager-confirmation__actions">
            <button className="primary-button" aria-describedby={reason ? `proposal-reason-${proposal.id}` : undefined} disabled={Boolean(busy) || Boolean(reason) || !proposalSchedule(proposal, base)} onClick={() => void resolve(proposal.id, true)} type="button">
              {busy === proposal.id ? 'Saving…' : 'Approve'}
            </button>
            <button className="secondary-button" disabled={Boolean(busy)} onClick={() => void resolve(proposal.id, false)} type="button">Reject</button>
          </div>
        </article>
      )})}
    </section>
  )
}
