import { useEffect, useState } from 'react'
import { CalendarClock, History, Plus } from 'lucide-react'
import type { ComputerSummary } from '../../shared/contracts'
import { nextOccurrences } from '../../shared/schedule-recurrence'
import type { Schedule, ScheduleRun } from '../../shared/schedules'
import { request } from '../api'
import { DialogFrame } from '../components/DialogFrame'
import { editableSchedule, recurrenceSummary, runDuration, scheduleError, scheduleTime } from './format'
import { ScheduleForm, type ScheduleDefinition } from './ScheduleForm'
import { useScheduler } from './use-scheduler'
import './scheduler.css'

function nextRun(schedule: Schedule, now: Date): string {
  try {
    const next = nextOccurrences(schedule.recurrence, schedule.timezone, now, 1)[0]
    return next ? `${scheduleTime(next, schedule.timezone)} · ${schedule.timezone}` : 'No future occurrences'
  } catch { return 'Invalid recurrence — edit this schedule' }
}

export function SchedulerView({ enabled, computers, onClose, onOpenSession }: {
  enabled: boolean
  computers: ComputerSummary[]
  onClose(): void
  onOpenSession(computerId: string, sessionId: string): void
}) {
  const [historyId, setHistoryId] = useState<string>()
  const scheduler = useScheduler(enabled, historyId)
  const [form, setForm] = useState<{ initial?: ScheduleDefinition; editing?: Schedule }>()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [showArchived, setShowArchived] = useState(false)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [enabled])
  async function mutate(path: string, body: unknown, method = 'POST') {
    setPending(true)
    setError(undefined)
    try {
      await request(path, { method, body: JSON.stringify(body) })
      await scheduler.refresh()
    } catch (caught) {
      const message = scheduleError(caught)
      setError(message)
      throw caught
    } finally { setPending(false) }
  }
  const act = (path: string, body: unknown) => void mutate(path, body).catch(() => undefined)
  const historySchedule = scheduler.schedules.find((schedule) => schedule.id === historyId)
  const list = scheduler.schedules.filter((schedule) => schedule.archived === showArchived)
  return <DialogFrame title="Scheduler" eyebrow="Hub" onClose={onClose} className="scheduler-view">
    {!enabled ? <p className="dialog-message">Scheduler is turned off on this hub.</p> : <>
      <div className="scheduler-toolbar">
        <p className="schedule-caption">Run saved prompts on your computers. Permissions default to Ask.</p>
        {!form && <button className="primary-button" type="button" onClick={() => { setError(undefined); setForm({}) }}><Plus size={17} />Create schedule</button>}
      </div>
      {(error || scheduler.error) && <div role="alert" className="error-banner">
        <p>{error ?? scheduler.error}</p>
        <button type="button" className="secondary-button" disabled={pending} onClick={async () => {
          if (form?.editing) {
            try {
              const { schedule } = await request<{ schedule: Schedule }>(`/api/schedules/${encodeURIComponent(form.editing.id)}`, { cache: 'no-store' })
              setForm({ editing: schedule, initial: editableSchedule(schedule) })
              setError(undefined)
            } catch (caught) { setError(scheduleError(caught)) }
          } else { await scheduler.refresh(); setError(undefined) }
        }}>Reload latest{form ? ' (replace draft)' : ''}</button>
      </div>}
      {form ? <>
        <h3>{form.editing ? `Edit ${form.editing.name}` : 'Create schedule'}</h3>
        <ScheduleForm key={form.editing ? `${form.editing.id}:${form.editing.revision}` : 'new'}
          initial={form.initial} editing={form.editing} computers={computers} pending={pending}
          onCancel={() => { setForm(undefined); setError(undefined) }}
          onSave={async (definition) => {
            if (form.editing) {
              const previous = editableSchedule(form.editing)
              const changes = Object.fromEntries(Object.entries(definition).filter(([key, value]) =>
                JSON.stringify(value) !== JSON.stringify(previous[key as keyof ScheduleDefinition])))
              await mutate(`/api/schedules/${encodeURIComponent(form.editing.id)}`, { ...changes, revision: form.editing.revision }, 'PATCH')
            } else await mutate('/api/schedules', definition)
            setForm(undefined)
          }} />
      </> : <>
        <label className="schedule-check"><input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />Show archived schedules</label>
        {scheduler.loading && <p role="status">Loading schedules…</p>}
        {!list.length && !scheduler.loading && <p className="scheduler-empty">{showArchived ? 'No archived schedules.' : 'No schedules yet. Create a saved prompt to get started.'}</p>}
        <ul className="schedule-list">{list.map((schedule) => {
          const last = scheduler.recent.filter((run) => run.scheduleId === schedule.id)
            .sort((a, b) => b.occurrenceAt.localeCompare(a.occurrenceAt))[0]
          const path = `/api/schedules/${encodeURIComponent(schedule.id)}`
          return <li className="schedule-card" key={schedule.id}>
            <div className="schedule-card__heading"><CalendarClock size={20} aria-hidden="true" />
              <div><h3>{schedule.name}</h3><p className="schedule-caption">{recurrenceSummary(schedule.recurrence)}{schedule.createdBy === 'oracle' ? ' · Oracle-created' : ''}</p></div>
              <label className="schedule-enable"><input type="checkbox" aria-label={`Enable ${schedule.name}`} checked={schedule.enabled} disabled={pending || schedule.archived}
                onChange={(event) => act(`${path}/enabled`, { revision: schedule.revision, enabled: event.target.checked })} /><span>{schedule.enabled ? 'Enabled' : 'Paused'}</span></label>
            </div>
            <p className="schedule-next">{schedule.enabled ? 'Next' : 'Next if enabled'}: {nextRun(schedule, now)}</p>
            <p className="schedule-caption">{computers.find((computer) => computer.id === schedule.target.computerId)?.name ?? schedule.target.computerId} · {schedule.target.folder} · {schedule.target.provider} · {schedule.target.permissionPolicy}</p>
            <div className="schedule-card__footer"><span>{last ? <RunStatus run={last} /> : <small>No recent run</small>}</span>
              <div className="schedule-actions">
                {!schedule.archived && <button type="button" className="secondary-button" disabled={pending} onClick={() => act(`${path}/run`, {})} aria-label={`Run ${schedule.name} now`}>Run now</button>}
                <button type="button" className="secondary-button" disabled={pending} onClick={() => setForm({ initial: editableSchedule(schedule), editing: schedule })} aria-label={`Edit ${schedule.name}`}>Edit</button>
                <button type="button" className="secondary-button" disabled={pending} onClick={() => {
                  setError(undefined)
                  setForm({ initial: { ...editableSchedule(schedule), name: `${schedule.name.slice(0, 193)} (copy)`, enabled: false } })
                }} aria-label={`Duplicate ${schedule.name}`}>Duplicate</button>
                <button type="button" className="secondary-button" disabled={pending} onClick={() => act(`${path}/archived`, { revision: schedule.revision, archived: !schedule.archived })} aria-label={`${schedule.archived ? 'Restore' : 'Archive'} ${schedule.name}`}>{schedule.archived ? 'Restore paused' : 'Archive'}</button>
                <button type="button" className="secondary-button" aria-label={`History for ${schedule.name}`} aria-pressed={historyId === schedule.id} onClick={() => setHistoryId(historyId === schedule.id ? undefined : schedule.id)}><History size={15} />History</button>
              </div>
            </div>
          </li>
        })}</ul>
        {historySchedule && <section className="schedule-history" aria-label={`Run history for ${historySchedule.name}`}>
          <h3>Run history · {historySchedule.name}</h3>
          <p className="schedule-caption">Up to 200 retained runs. Launching and stopping are not terminal outcomes.</p>
          {!scheduler.history.length && <p>No runs yet.</p>}
          <ul>{scheduler.history.map((run) => <li key={run.id}>
            <div><RunStatus run={run} /><small>{scheduleTime(run.occurrenceAt, historySchedule.timezone)} · {historySchedule.timezone} · {run.trigger} · {runDuration(run, now)}</small>
              {(run.error || run.summary) && <p>{run.error ?? run.summary}</p>}</div>
            {run.sessionId && <button type="button" className="secondary-button" onClick={() => onOpenSession(run.computerId, run.sessionId!)}>Open session</button>}
          </li>)}</ul>
        </section>}
      </>}
    </>}
  </DialogFrame>
}

function RunStatus({ run }: { run: ScheduleRun }) {
  return <span className="schedule-status" data-status={run.status}>{run.status}</span>
}
