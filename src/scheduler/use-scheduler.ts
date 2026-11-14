import { useCallback, useEffect, useRef, useState } from 'react'
import type { Schedule, ScheduleRun } from '../../shared/schedules'
import type { ScheduleProposal } from '../../shared/schedule-proposals'
import { request } from '../api'
import { subscribeFeatureEvents } from '../features/events'
import { scheduleError } from './format'

export function useScheduler(enabled: boolean, historyId?: string) {
  const [data, setData] = useState<{ schedules: Schedule[]; recent: ScheduleRun[]; history: ScheduleRun[]; historyId?: string; proposals: ScheduleProposal[]; proposalError?: string }>({ schedules: [], recent: [], history: [], proposals: [] })
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)
  const controller = useRef<AbortController | undefined>(undefined)
  const active = useRef(false)
  const selectedHistory = useRef<string | undefined>(undefined)
  const refresh = useCallback(async () => {
    if (!enabled || !active.current) return
    const requestedHistory = selectedHistory.current
    controller.current?.abort()
    const pending = new AbortController()
    controller.current = pending
    try {
      const init = { signal: pending.signal, cache: 'no-store' as const }
      const proposals = request<{ proposals: ScheduleProposal[] }>('/api/schedules/proposals', init)
        .then((response) => {
          if (!Array.isArray(response.proposals)) throw new Error('The hub returned invalid proposal data')
          return { proposals: response.proposals.filter((proposal) => proposal.status === 'pending'), proposalError: undefined }
        }).catch((caught: unknown) => ({
          proposals: [] as ScheduleProposal[],
          proposalError: caught && typeof caught === 'object' && 'statusCode' in caught && caught.statusCode === 404
            ? undefined : `Oracle proposals are unavailable: ${scheduleError(caught)}`,
        }))
      const [list, recent, history, proposalState] = await Promise.all([
        request<{ schedules: Schedule[] }>('/api/schedules', init),
        request<{ runs: ScheduleRun[] }>('/api/schedules/runs?limit=200', init),
        requestedHistory ? request<{ runs: ScheduleRun[] }>(`/api/schedules/${encodeURIComponent(requestedHistory)}/runs?limit=200`, init) : Promise.resolve({ runs: [] }),
        proposals,
      ])
      if (!pending.signal.aborted) {
        setData({ schedules: list.schedules, recent: recent.runs, history: history.runs, historyId: requestedHistory, ...proposalState })
        setError(undefined)
      }
    } catch (caught) { if (!pending.signal.aborted) setError(scheduleError(caught)) }
    finally { if (!pending.signal.aborted) setLoading(false) }
  }, [enabled])
  useEffect(() => {
    active.current = enabled
    selectedHistory.current = historyId
    if (!enabled) return
    void refresh()
    const unsubscribe = subscribeFeatureEvents((event) => {
      if (event.type === 'schedules.changed' || event.type === 'schedule-proposals.changed' || event.type === 'hub.connected') void refresh()
    })
    window.addEventListener('focus', refresh)
    return () => { active.current = false; controller.current?.abort(); unsubscribe(); window.removeEventListener('focus', refresh) }
  }, [enabled, historyId, refresh])
  return { ...data, history: data.historyId === historyId ? data.history : [], historyLoaded: data.historyId === historyId, error, loading, refresh }
}
