import { useCallback, useEffect, useRef, useState } from 'react'
import type { DreamerPlanItem, DreamerSnapshot } from '../shared/dreamer'
import { DreamerApiError, getDreamer, saveDreamerSettings, updateDreamerPlan } from './dreamer-api'
import type { DreamerPlanEdit } from './dreamer-api'
import './dreamer.css'

const reason = (error: unknown) => error instanceof Error ? error.message : 'Dreamer could not be reached.'
const dreamerChanged = 'oracle-dreamer-changed'

function useDreamer(active: boolean, onRefreshed?: () => void) {
  const [snapshot, publishSnapshot] = useState<DreamerSnapshot>()
  const [error, setError] = useState<string>()
  const [unavailable, setUnavailable] = useState(false)
  const latest = useRef<DreamerSnapshot | undefined>(undefined)
  const current = useRef(0)
  const acceptSnapshot = useCallback((next: DreamerSnapshot) => {
    if (latest.current && next.revision < latest.current.revision) return false
    latest.current = next
    publishSnapshot(next)
    setUnavailable(!next.available)
    setError(undefined)
    return true
  }, [])
  const setSnapshot = useCallback((next: DreamerSnapshot) => {
    current.current += 1
    acceptSnapshot(next)
  }, [acceptSnapshot])
  const failMutation = useCallback((caught: unknown) => {
    current.current += 1
    if (!(caught instanceof DreamerApiError) || caught.status >= 500) setUnavailable(true)
  }, [])
  const refresh = useCallback(async () => {
    const request = ++current.current
    try {
      const next = await getDreamer()
      if (request === current.current) {
        if (acceptSnapshot(next) && next.available) onRefreshed?.()
        return latest.current
      }
      return undefined
    } catch (caught) {
      if (request === current.current) {
        setError(reason(caught))
        if (!(caught instanceof DreamerApiError) || caught.status >= 500) setUnavailable(true)
      }
      return undefined
    }
  }, [acceptSnapshot, onRefreshed])
  useEffect(() => {
    if (!active) return
    let disposed = false
    void Promise.resolve().then(() => { if (!disposed) void refresh() })
    const update = () => { if (!disposed) void refresh() }
    const timer = window.setInterval(update, 30_000)
    window.addEventListener(dreamerChanged, update)
    window.addEventListener('focus', update)
    return () => {
      disposed = true
      current.current += 1
      window.clearInterval(timer)
      window.removeEventListener(dreamerChanged, update)
      window.removeEventListener('focus', update)
    }
  }, [active, refresh])
  return { snapshot, setSnapshot, error, unavailable, failMutation, refresh }
}

export function DreamerSettings({ active = true }: { active?: boolean }) {
  const { snapshot, setSnapshot, error: loadError, failMutation, refresh } = useDreamer(active)
  const [draft, setDraft] = useState<{ revision: number; enabled: boolean; timeZone: string }>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const [saved, setSaved] = useState(false)
  const enabled = draft?.enabled ?? snapshot?.settings.enabled ?? false
  const timeZone = draft?.timeZone ?? snapshot?.settings.timeZone ?? ''
  function change(input: Partial<{ enabled: boolean; timeZone: string }>) {
    setDraft({ revision: draft?.revision ?? snapshot?.revision ?? 0, enabled, timeZone, ...input })
    setSaved(false)
  }

  async function save() {
    if (!snapshot || saving) return
    setSaving(true)
    setError(undefined)
    setSaved(false)
    try {
      setSnapshot(await saveDreamerSettings({ revision: draft?.revision ?? snapshot.revision, enabled, timeZone: timeZone.trim() }))
      setDraft(undefined)
      setSaved(true)
      window.dispatchEvent(new Event(dreamerChanged))
    } catch (caught) {
      failMutation(caught)
      if (caught instanceof DreamerApiError && caught.status === 409) {
        if (await refresh()) {
          setDraft(undefined)
          setError('Dreamer settings changed elsewhere. Review the refreshed settings before saving again.')
        } else {
          setError('Could not refresh Dreamer settings. Your changes are kept; refresh before saving again.')
        }
      } else setError(reason(caught))
    } finally { setSaving(false) }
  }

  return (
    <section aria-label="Dreamer settings" className="app-settings-section" id="settings-dreamer">
      <h4>Dreamer</h4>
      <p className="dialog-message">
        A local, metadata-only morning review at 02:00 in the saved timezone.
        No model calls, session actions or overnight notifications.
      </p>
      {!snapshot && !loadError ? <p className="dialog-message">Loading Dreamer...</p> : null}
      {snapshot?.available ? (
        <form onSubmit={(event) => { event.preventDefault(); void save() }}>
          <label className="dreamer-toggle">
            <input checked={enabled} disabled={saving} onChange={(event) => change({ enabled: event.target.checked })} type="checkbox" />
            Enable Dreamer
          </label>
          <label className="field">
            <span>Dreamer timezone</span>
            <input
              aria-describedby="dreamer-zone-hint"
              autoCapitalize="none"
              autoComplete="off"
              className="dialog-input"
              disabled={saving}
              maxLength={100}
              onChange={(event) => change({ timeZone: event.target.value })}
              required
              spellCheck={false}
              value={timeZone}
            />
          </label>
          <p className="dialog-message" id="dreamer-zone-hint">
            Use an IANA zone such as Europe/Berlin. This hub-wide choice stays fixed when a device travels.
          </p>
          <div className="dreamer-actions">
            <button className="secondary-button" disabled={saving} onClick={() => change({ timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })} type="button">
              Use this device&apos;s timezone
            </button>
            <button className="primary-button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Dreamer'}</button>
          </div>
        </form>
      ) : null}
      {error || loadError || snapshot?.lastError ? (
        <p className="form-error" role="alert">{error ?? loadError ?? snapshot?.lastError}</p>
      ) : null}
      {snapshot && !snapshot.available && !snapshot.lastError ? <p role="alert">Dreamer is unavailable on this hub.</p> : null}
      {loadError ? (
        <button className="secondary-button" onClick={() => {
          void refresh().then((next) => {
            if (!next) return
            setDraft(undefined)
            setError(undefined)
            setSaved(false)
          })
        }} type="button">Retry Dreamer</button>
      ) : null}
      {saved ? <p className="dialog-message" role="status">Dreamer settings saved.</p> : null}
    </section>
  )
}

export function DreamerMorningPlan({ active = true }: { active?: boolean }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const [saved, setSaved] = useState(false)
  const onRefreshed = useCallback(() => setError(undefined), [])
  const { snapshot, setSnapshot, error: loadError, unavailable, failMutation, refresh } = useDreamer(active, onRefreshed)
  const plan = snapshot?.plan
  const readOnly = saving || unavailable || !snapshot?.available

  async function edit(change: Pick<DreamerPlanEdit, 'order' | 'item'>) {
    if (!snapshot || !plan || readOnly) return
    setSaving(true)
    setError(undefined)
    setSaved(false)
    try {
      setSnapshot(await updateDreamerPlan({ revision: snapshot.revision, planId: plan.id, ...change }))
      setSaved(true)
    } catch (caught) {
      failMutation(caught)
      if (caught instanceof DreamerApiError && caught.status === 409) {
        if (await refresh()) {
          setError('The morning plan changed elsewhere. Review the refreshed plan before trying again.')
        } else {
          setError('Could not refresh the morning plan. Refresh before trying again.')
        }
      } else setError(reason(caught))
    } finally { setSaving(false) }
  }
  function move(index: number, direction: number) {
    if (!plan) return
    const order = plan.items.map((item) => item.id)
    const target = index + direction
    if (target < 0 || target >= order.length) return
    const previous = order[index]
    order[index] = order[target]
    order[target] = previous
    void edit({ order })
  }
  function disposition(item: DreamerPlanItem, status: DreamerPlanItem['status']) {
    void edit({ item: { id: item.id, status } })
  }
  if (snapshot && !snapshot.settings.enabled && !plan && !snapshot.lastError && !loadError) return null

  return (
    <details className="dreamer-morning">
      <summary>Morning plan</summary>
      <div className="dreamer-morning__body">
        {plan ? <p className="dreamer-date">{plan.localDate} ({plan.timeZone})</p> : null}
        <p className="dialog-message">Changes only this plan, not your sessions or tasks. Metadata-only suggestions, not verified outcomes.</p>
        {error || loadError || snapshot?.lastError ? <p className="form-error" role="alert">{error ?? loadError ?? snapshot?.lastError}</p> : null}
        {plan ? (
          <>
            <ol aria-label="Dreamer priorities" className="dreamer-priorities">
              {plan.items.map((item, index) => (
                <li className="dreamer-item" data-status={item.status} key={item.id}>
                  <div className="dreamer-item__heading"><strong>{item.label}</strong><span>{item.status}</span></div>
                  <p>{item.reason}</p>
                  {item.sessionId ? <p className="dreamer-item__source">Session {item.sessionId.slice(0, 12)}</p> : null}
                  {item.memoryId ? <p className="dreamer-item__source">Memory {item.memoryId.slice(0, 12)}</p> : null}
                  <div className="dreamer-actions">
                    <button aria-label={`Move ${item.label} up`} className="secondary-button" disabled={readOnly || index === 0} onClick={() => move(index, -1)} type="button">Up</button>
                    <button aria-label={`Move ${item.label} down`} className="secondary-button" disabled={readOnly || index === plan.items.length - 1} onClick={() => move(index, 1)} type="button">Down</button>
                    {item.status === 'pending' ? (
                      <>
                        <button className="secondary-button" disabled={readOnly} onClick={() => disposition(item, 'skipped')} type="button">Skip</button>
                        <button className="secondary-button" disabled={readOnly} onClick={() => disposition(item, 'done')} type="button">Done</button>
                      </>
                    ) : <button aria-label={`Restore ${item.label}`} className="secondary-button" disabled={readOnly} onClick={() => disposition(item, 'pending')} type="button">Restore</button>}
                  </div>
                </li>
              ))}
            </ol>
            {!plan.items.length ? <p>No review candidates were found in the available metadata.</p> : null}
            {plan.omitted > 0 ? <p>{plan.omitted} additional candidates did not fit in this plan.</p> : null}
            <details className="dreamer-coverage">
              <summary>Review coverage</summary>
              {plan.coverage.map((line) => <p key={line}>{line}</p>)}
            </details>
          </>
        ) : snapshot ? <p>No morning plan yet. When enabled, Dreamer runs at 02:00 in its saved timezone; same-day catch-up ends at 08:00.</p> : !loadError ? <p>Loading Dreamer...</p> : null}
        <button className="secondary-button" disabled={saving} onClick={() => {
          setSaved(false)
          void refresh().then((next) => { if (next) setError(undefined) })
        }} type="button">Refresh morning plan</button>
        {saved ? <p className="dialog-message" role="status">Plan saved.</p> : null}
      </div>
    </details>
  )
}
