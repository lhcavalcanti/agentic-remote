import { useCallback, useEffect, useRef, useState } from 'react'
import {
  isDreamerSessionItem,
  type DreamerPlanItem,
  type DreamerSnapshot,
} from '../shared/dreamer'
import type { OracleTaskView } from '../shared/oracle-task'
import {
  completeDreamerTask,
  dispatchDreamerTask,
  DreamerApiError,
  getDreamer,
  saveDreamerSettings,
  resolveDreamerTask,
  updateDreamerPlan,
} from './dreamer-api'
import type { DreamerPlanEdit } from './dreamer-api'
import './dreamer.css'

const reason = (error: unknown) => error instanceof Error ? error.message : 'Dreamer could not be reached.'
const dreamerChanged = 'oracle-dreamer-changed'
export const authoritativeRefresh = 'agentic-remote:authoritative-refresh'
export const coordinatedAuthoritativeRefresh = 'agentic-remote:coordinated-authoritative-refresh'
let activeDreamerViews = 0

class AuthoritativeRefreshRequest extends Event {
  readonly pending: Promise<unknown>[] = []

  waitUntil(work: Promise<unknown>) {
    this.pending.push(work)
  }
}

export function waitUntilAuthoritativeRefresh(event: Event, work: Promise<unknown>) {
  if (event instanceof AuthoritativeRefreshRequest) {
    event.waitUntil(work)
  } else {
    void work.catch(() => undefined)
  }
}

async function settleAuthoritativeRefresh(event: AuthoritativeRefreshRequest): Promise<void> {
  const settled = await Promise.allSettled(event.pending)
  const failed = settled.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  )
  if (failed) throw failed.reason
}

export async function dispatchAuthoritativeRefresh(): Promise<void> {
  const event = new AuthoritativeRefreshRequest(authoritativeRefresh)
  window.dispatchEvent(event)
  await settleAuthoritativeRefresh(event)
}

export async function requestCoordinatedAuthoritativeRefresh(): Promise<void> {
  const event = new AuthoritativeRefreshRequest(coordinatedAuthoritativeRefresh)
  window.dispatchEvent(event)
  if (event.pending.length === 0) {
    await dispatchAuthoritativeRefresh()
    return
  }
  await settleAuthoritativeRefresh(event)
}

export function DreamerRefreshOwner() {
  useEffect(() => {
    const update = (event: Event) => {
      if (activeDreamerViews === 0) {
        waitUntilAuthoritativeRefresh(event, getDreamer())
      }
    }
    window.addEventListener(authoritativeRefresh, update)
    return () => window.removeEventListener(authoritativeRefresh, update)
  }, [])
  return null
}

function useDreamer(active: boolean, onRefreshed?: () => void) {
  const [snapshot, publishSnapshot] = useState<DreamerSnapshot>()
  const [error, setError] = useState<string>()
  const [unavailable, setUnavailable] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [stale, setStale] = useState(false)
  const latest = useRef<DreamerSnapshot | undefined>(undefined)
  const current = useRef(0)
  const acceptSnapshot = useCallback((next: DreamerSnapshot) => {
    if (latest.current && next.revision < latest.current.revision) return false
    latest.current = next
    publishSnapshot(next)
    setUnavailable(!next.available)
    setError(undefined)
    setStale(false)
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
  const refresh = useCallback(async (rejectOnError = false) => {
    const request = ++current.current
    setRefreshing(true)
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
        setStale(Boolean(latest.current))
        if (!(caught instanceof DreamerApiError) || caught.status >= 500) setUnavailable(true)
      }
      if (rejectOnError) throw caught
      return undefined
    } finally {
      if (request === current.current) setRefreshing(false)
    }
  }, [acceptSnapshot, onRefreshed])
  useEffect(() => {
    if (!active) return
    activeDreamerViews += 1
    let disposed = false
    void Promise.resolve().then(() => { if (!disposed) void refresh() })
    const update = () => { if (!disposed) void refresh() }
    const refreshAuthoritative = (event: Event) => {
      if (!disposed) waitUntilAuthoritativeRefresh(event, refresh(true))
    }
    const timer = window.setInterval(update, 30_000)
    window.addEventListener(dreamerChanged, update)
    window.addEventListener(authoritativeRefresh, refreshAuthoritative)
    window.addEventListener('focus', update)
    return () => {
      disposed = true
      activeDreamerViews -= 1
      current.current += 1
      window.clearInterval(timer)
      window.removeEventListener(dreamerChanged, update)
      window.removeEventListener(authoritativeRefresh, refreshAuthoritative)
      window.removeEventListener('focus', update)
    }
  }, [active, refresh])
  return { snapshot, setSnapshot, error, unavailable, refreshing, stale, failMutation, refresh }
}

export function DreamerSettings({ active = true }: { active?: boolean }) {
  const { snapshot, setSnapshot, error: loadError, failMutation, refresh } = useDreamer(active)
  const [draft, setDraft] = useState<{
    revision: number
    enabled: boolean
    timeZone: string
    base: { enabled: boolean; timeZone: string }
  }>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const [saved, setSaved] = useState(false)
  const enabled = draft?.enabled ?? snapshot?.settings.enabled ?? false
  const timeZone = draft?.timeZone ?? snapshot?.settings.timeZone ?? ''
  const draftRevision = draft && snapshot &&
    draft.base.enabled === snapshot.settings.enabled &&
    draft.base.timeZone === snapshot.settings.timeZone
    ? snapshot.revision
    : draft?.revision
  function change(input: Partial<{ enabled: boolean; timeZone: string }>) {
    setDraft({
      revision: draft?.revision ?? snapshot?.revision ?? 0,
      enabled,
      timeZone,
      base: draft?.base ?? {
        enabled: snapshot?.settings.enabled ?? enabled,
        timeZone: snapshot?.settings.timeZone ?? timeZone,
      },
      ...input,
    })
    setSaved(false)
  }

  async function save() {
    if (!snapshot || saving) return
    setSaving(true)
    setError(undefined)
    setSaved(false)
    try {
      setSnapshot(await saveDreamerSettings({ revision: draftRevision ?? snapshot.revision, enabled, timeZone: timeZone.trim() }))
      setDraft(undefined)
      setSaved(true)
      window.dispatchEvent(new Event(dreamerChanged))
    } catch (caught) {
      failMutation(caught)
      if (caught instanceof DreamerApiError && caught.status === 409) {
        const currentDraft = draft
        const refreshed = await refresh()
        if (refreshed) {
          if (
            currentDraft &&
            currentDraft.base.enabled === refreshed.settings.enabled &&
            currentDraft.base.timeZone === refreshed.settings.timeZone
          ) {
            setDraft({ ...currentDraft, revision: refreshed.revision })
            setError('Dreamer review data changed. Your settings are kept; save again.')
          } else {
            setDraft(undefined)
            setError('Dreamer settings changed elsewhere. Review the refreshed settings before saving again.')
          }
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
        Enabling Dreamer opts this hub into a 02:00 metadata review and proactive
        Oracle analysis. Oracle may use the selected model to turn lifecycle
        findings into follow-up tasks; session work still starts only when you
        choose it.
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
  const [confirmingCompletion, setConfirmingCompletion] = useState<string>()
  const [activeTask, setActiveTask] = useState<string>()
  const onRefreshed = useCallback(() => setError(undefined), [])
  const {
    snapshot,
    setSnapshot,
    error: loadError,
    unavailable,
    refreshing,
    stale,
    failMutation,
    refresh,
  } = useDreamer(active, onRefreshed)
  const plan = snapshot?.plan
  const readOnly = saving || unavailable || !snapshot?.available

  async function edit(
    change: Pick<
      DreamerPlanEdit,
      'order' | 'item' | 'completion' | 'investigate' | 'taskCompletion'
    >,
  ) {
    if (!snapshot || !plan || readOnly) return
    setSaving(true)
    setError(undefined)
    setSaved(false)
    try {
      setSnapshot(await updateDreamerPlan({ revision: snapshot.revision, planId: plan.id, ...change }))
      setConfirmingCompletion(undefined)
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
  function confirmCompletion(item: DreamerPlanItem) {
    const candidate = item.completionCandidate
    if (!candidate) return
    void edit({
      completion: {
        itemId: item.id,
        computerId: candidate.computerId,
        sessionId: candidate.sessionId,
        sessionRevision: candidate.sessionRevision,
        messageId: candidate.messageId,
        resultDigest: candidate.resultDigest,
      },
    })
  }
  async function investigate(item: DreamerPlanItem) {
    if (!snapshot || !plan || readOnly) return
    setActiveTask(item.id)
    await edit({
      investigate: {
        itemId: item.id,
        requestId: crypto.randomUUID(),
      },
    })
    setActiveTask(undefined)
  }
  async function dispatchTask(task: OracleTaskView) {
    if (!snapshot || readOnly || activeTask) return
    setActiveTask(task.id)
    setError(undefined)
    setSaved(false)
    try {
      setSnapshot(await dispatchDreamerTask(task.id, {
        revision: task.revision,
        requestId: crypto.randomUUID(),
      }))
    } catch (caught) {
      failMutation(caught)
      if (caught instanceof DreamerApiError && caught.status === 409) {
        if (await refresh()) {
          setError('This follow-up changed elsewhere. Review its current status before trying again.')
        } else {
          setError('Could not refresh this follow-up. Refresh before trying again.')
        }
      } else setError(reason(caught))
    } finally {
      setActiveTask(undefined)
    }
  }
  async function confirmTaskCompletion(task: OracleTaskView) {
    const candidate = task.completionCandidate
    if (!candidate || readOnly || activeTask) return
    setActiveTask(task.id)
    setError(undefined)
    try {
      setSnapshot(await completeDreamerTask(task.id, {
        revision: task.revision,
        attemptId: candidate.attemptId,
        computerId: candidate.computerId,
        sessionId: candidate.sessionId,
        sessionRevision: candidate.sessionRevision,
        messageId: candidate.messageId,
        resultDigest: candidate.resultDigest,
      }))
      setConfirmingCompletion(undefined)
    } catch (caught) {
      failMutation(caught)
      if (caught instanceof DreamerApiError && caught.status === 409) {
        if (await refresh()) {
          setError('This completion evidence changed. Review the refreshed result before confirming.')
        } else {
          setError('Could not refresh completion evidence. Refresh before confirming.')
        }
      } else setError(reason(caught))
    } finally {
      setActiveTask(undefined)
    }
  }
  async function resolveTask(
    task: OracleTaskView,
    status: 'completed' | 'dismissed',
  ) {
    if (readOnly || activeTask) return
    setActiveTask(task.id)
    setError(undefined)
    try {
      setSnapshot(await resolveDreamerTask(task.id, {
        revision: task.revision,
        status,
      }))
    } catch (caught) {
      failMutation(caught)
      if (caught instanceof DreamerApiError && caught.status === 409) {
        if (await refresh()) {
          setError('This follow-up changed elsewhere. Review its current status before trying again.')
        } else {
          setError('Could not refresh this follow-up. Refresh before trying again.')
        }
      } else setError(reason(caught))
    } finally {
      setActiveTask(undefined)
    }
  }
  if (
    snapshot &&
    !snapshot.settings.enabled &&
    !plan &&
    !snapshot.tasks?.length &&
    !snapshot.lastError &&
    !loadError
  ) return null

  return (
    <details className="dreamer-morning">
      <summary>Morning plan</summary>
      <div className="dreamer-morning__body">
        {refreshing || stale ? (
          <p aria-label="Dreamer data freshness" className="dialog-message" role="status">
            {refreshing ? 'Refreshing authoritative review data...' : 'Data may be stale'}
          </p>
        ) : null}
        {plan ? <p className="dreamer-date">{plan.localDate} ({plan.timeZone})</p> : null}
        <p className="dialog-message">
          Suggestions are observations, not proof that work ran. Follow-up work is
          durable and completes only from verified execution evidence.
        </p>
        {error || loadError || snapshot?.lastError ? <p className="form-error" role="alert">{error ?? loadError ?? snapshot?.lastError}</p> : null}
        {plan || snapshot?.tasks?.length ? (
          <>
            {snapshot.tasks?.length ? (
              <section aria-labelledby="dreamer-follow-up-heading" className="dreamer-follow-up">
                <h3 id="dreamer-follow-up-heading">Follow-up work</h3>
                <div className="dreamer-task-list">
                  {snapshot.tasks.map((task) => {
                    const latestAttempt = task.attempts.at(-1)
                    const canDispatch = task.owner === 'oracle' && (
                      task.status === 'ready' ||
                      task.status === 'failed' ||
                      task.status === 'blocked'
                    )
                    return (
                      <article
                        className="dreamer-task"
                        data-owner={task.owner}
                        data-status={task.status}
                        key={task.id}
                      >
                        <div className="dreamer-task__heading">
                          <div>
                            <strong>{task.title}</strong>
                            <p>{task.summary}</p>
                          </div>
                          <span className="dreamer-task__status">
                            {task.status} · {task.owner === 'oracle' ? 'Oracle' : 'Needs you'}
                          </span>
                        </div>
                        <div className="dreamer-task__next">
                          <span>Next action</span>
                          <p>{task.nextAction}</p>
                        </div>
                        {task.blockedReason ? (
                          <p className="dreamer-task__notice" role="status">
                            {task.blockedReason}
                          </p>
                        ) : null}
                        {latestAttempt ? (
                          <>
                            <p className="dreamer-item__source">
                              Attempt {task.attempts.length}: {latestAttempt.status}
                              {latestAttempt.sessionRefs.length
                                ? ` · ${latestAttempt.sessionRefs.length} execution session${
                                  latestAttempt.sessionRefs.length === 1 ? '' : 's'
                                }`
                                : ''}
                            </p>
                            {task.attempts.length > 1 ? (
                              <details className="dreamer-attempts">
                                <summary>Attempt history ({task.attempts.length})</summary>
                                <ol>
                                  {task.attempts.map((attempt, index) => (
                                    <li key={attempt.id}>
                                      Attempt {index + 1}: {attempt.status}
                                      {attempt.error ? ` — ${attempt.error}` : ''}
                                    </li>
                                  ))}
                                </ol>
                              </details>
                            ) : null}
                          </>
                        ) : null}
                        {task.evidence?.length ? (
                          <details className="dreamer-evidence">
                            <summary>Execution evidence ({task.evidence.length})</summary>
                            <ul>
                              {task.evidence.map((entry) => (
                                <li data-status={entry.status} key={entry.id}>
                                  <strong>{entry.label}</strong>
                                  {entry.result ? <p>{entry.result}</p> : null}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                        {confirmingCompletion === task.id && task.completionCandidate ? (
                          <div className="dreamer-completion" role="group">
                            <strong>Verified execution result</strong>
                            <p className="dreamer-completion__summary">
                              {task.completionCandidate.summary}
                            </p>
                            <div className="dreamer-actions">
                              <button
                                className="secondary-button"
                                disabled={readOnly}
                                onClick={() => setConfirmingCompletion(undefined)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="primary-button"
                                disabled={readOnly}
                                onClick={() => void confirmTaskCompletion(task)}
                                type="button"
                              >
                                Confirm completed
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="dreamer-actions">
                          {task.sourceSession ? (
                            <a
                              className="secondary-button"
                              href={`/?computer=${encodeURIComponent(task.sourceSession.computerId)}&session=${encodeURIComponent(task.sourceSession.sessionId)}`}
                            >
                              Open source
                            </a>
                          ) : null}
                          {latestAttempt?.sessionRefs.map((reference) => (
                            <a
                              className="secondary-button"
                              href={`/?computer=${encodeURIComponent(reference.computerId)}&session=${encodeURIComponent(reference.sessionId)}`}
                              key={`${reference.computerId}:${reference.sessionId}`}
                            >
                              Open session
                            </a>
                          ))}
                          {canDispatch ? (
                            <button
                              className="primary-button"
                              disabled={readOnly || Boolean(activeTask)}
                              onClick={() => void dispatchTask(task)}
                              type="button"
                            >
                              {activeTask === task.id
                                ? 'Starting...'
                                : task.attempts.length
                                  ? 'Retry'
                                  : 'Start work'}
                            </button>
                          ) : null}
                          {task.owner === 'user' &&
                          task.status !== 'completed' &&
                          task.status !== 'dismissed' ? (
                            <>
                              <button
                                className="secondary-button"
                                disabled={readOnly || Boolean(activeTask)}
                                onClick={() => void resolveTask(task, 'dismissed')}
                                type="button"
                              >
                                Dismiss
                              </button>
                              <button
                                className="primary-button"
                                disabled={readOnly || Boolean(activeTask)}
                                onClick={() => void resolveTask(task, 'completed')}
                                type="button"
                              >
                                Mark complete
                              </button>
                            </>
                          ) : null}
                          {task.status === 'review' && task.completionCandidate ? (
                            <button
                              className="primary-button"
                              disabled={readOnly}
                              onClick={() => setConfirmingCompletion(task.id)}
                              type="button"
                            >
                              Review result
                            </button>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ) : null}
            {plan ? (
              <>
                <h3 className="dreamer-suggestions">Suggestions</h3>
                <ol aria-label="Dreamer priorities" className="dreamer-priorities">
              {plan.items.map((item, index) => (
                <li className="dreamer-item" data-status={item.status} key={item.id}>
                  <div className="dreamer-item__heading"><strong>{item.label}</strong><span>{item.status}</span></div>
                  <p>{item.reason}</p>
                  {item.sessionId ? (
                    <p className="dreamer-item__source">
                      Session <code>{item.computerId} / {item.sessionId}</code>
                    </p>
                  ) : null}
                  {item.memoryId ? <p className="dreamer-item__source">Memory {item.memoryId.slice(0, 12)}</p> : null}
                  {isDreamerSessionItem(item) && !item.taskId ? (
                    <p className="dreamer-item__source">
                      Oracle has not investigated or assigned this work.
                    </p>
                  ) : null}
                  {item.completion ? (
                    <p className="dreamer-item__source">
                      Completed from verified session evidence at {item.completion.completedAt}
                    </p>
                  ) : null}
                  {item.sourceStateReason ? (
                    <p className="dreamer-item__source" role="status">
                      {item.sourceStateReason}
                    </p>
                  ) : item.completionSourceUnavailable ? (
                    <p className="dreamer-item__source" role="status">
                      The owning session is offline or unavailable. Reconnect it, then refresh.
                    </p>
                  ) : null}
                  {item.sourceState === 'unavailable' || item.completionSourceUnavailable ? (
                    <button
                      aria-label={`Retry evidence for ${item.label}`}
                      className="secondary-button"
                      disabled={saving || refreshing}
                      onClick={() => {
                        setSaved(false)
                        void requestCoordinatedAuthoritativeRefresh()
                          .then(() => setError(undefined))
                          .catch((caught) => setError(reason(caught)))
                      }}
                      type="button"
                    >
                      Retry evidence
                    </button>
                  ) : null}
                  {confirmingCompletion === item.id && item.completionCandidate ? (
                    <div
                      aria-label={`Completion evidence for ${item.label}`}
                      className="dreamer-completion"
                      role="group"
                    >
                      <strong>Verified session result</strong>
                      <p className="dreamer-completion__summary">
                        {item.completionCandidate.summary}
                      </p>
                      <p className="dreamer-item__source">
                        Session <code>
                          {item.completionCandidate.computerId} / {item.completionCandidate.sessionId}
                        </code> · revision {item.completionCandidate.sessionRevision}
                        {' '}· completed {item.completionCandidate.completedAt}
                      </p>
                      <div className="dreamer-actions">
                        <button
                          aria-label={`Cancel completion for ${item.label}`}
                          className="secondary-button"
                          disabled={readOnly}
                          onClick={() => setConfirmingCompletion(undefined)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          aria-label={`Confirm ${item.label} completed`}
                          className="primary-button"
                          disabled={readOnly}
                          onClick={() => confirmCompletion(item)}
                          type="button"
                        >
                          Confirm completed
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="dreamer-actions">
                    <button aria-label={`Move ${item.label} up`} className="secondary-button" disabled={readOnly || index === 0} onClick={() => move(index, -1)} type="button">Up</button>
                    <button aria-label={`Move ${item.label} down`} className="secondary-button" disabled={readOnly || index === plan.items.length - 1} onClick={() => move(index, 1)} type="button">Down</button>
                    {item.status === 'pending' ? (
                      <>
                        <button className="secondary-button" disabled={readOnly} onClick={() => disposition(item, 'skipped')} type="button">Skip</button>
                        {isDreamerSessionItem(item) ? (
                          item.completionCandidate ? (
                            <button
                              aria-label={`Review completion evidence for ${item.label}`}
                              className="secondary-button"
                              disabled={readOnly}
                              onClick={() => setConfirmingCompletion(item.id)}
                              type="button"
                            >
                              Review completion
                            </button>
                          ) : (
                            <button
                              className="primary-button"
                              disabled={readOnly || Boolean(activeTask)}
                              onClick={() => void investigate(item)}
                              type="button"
                            >
                              {activeTask === item.id ? 'Asking Oracle...' : 'Ask Oracle to investigate'}
                            </button>
                          )
                        ) : (
                          <button className="secondary-button" disabled={readOnly} onClick={() => disposition(item, 'done')} type="button">Done</button>
                        )}
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
            ) : <p>No morning suggestions yet.</p>}
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
