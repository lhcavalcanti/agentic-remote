import { useCallback, useEffect, useRef, useState } from 'react'
import type { Schedule, ScheduleRun } from '../../shared/schedules'
import { request } from '../api'
import { subscribeFeatureEvents } from '../features/events'
import { scheduleError } from './format'

export function useScheduler(enabled: boolean, historyId?: string) {
  const [data, setData] = useState<{ schedules: Schedule[]; recent: ScheduleRun[]; history: ScheduleRun[] }>({ schedules: [], recent: [], history: [] })
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)
  const controller = useRef<AbortController | undefined>(undefined)
  const refresh = useCallback(async () => {
    if (!enabled) return
    controller.current?.abort()
    const pending = new AbortController()
    controller.current = pending
    try {
      const init = { signal: pending.signal, cache: 'no-store' as const }
      const [list, recent, history] = await Promise.all([
        request<{ schedules: Schedule[] }>('/api/schedules', init),
        request<{ runs: ScheduleRun[] }>('/api/schedules/runs?limit=200', init),
        historyId ? request<{ runs: ScheduleRun[] }>(`/api/schedules/${encodeURIComponent(historyId)}/runs?limit=200`, init) : Promise.resolve({ runs: [] }),
      ])
      if (!pending.signal.aborted) {
        setData({ schedules: list.schedules, recent: recent.runs, history: history.runs })
        setError(undefined)
      }
    } catch (caught) { if (!pending.signal.aborted) setError(scheduleError(caught)) }
    finally { if (!pending.signal.aborted) setLoading(false) }
  }, [enabled, historyId])
  useEffect(() => {
    if (!enabled) return
    void refresh()
    const unsubscribe = subscribeFeatureEvents((event) => {
      if (event.type === 'schedules.changed' || event.type === 'hub.connected') void refresh()
    })
    window.addEventListener('focus', refresh)
    return () => { controller.current?.abort(); unsubscribe(); window.removeEventListener('focus', refresh) }
  }, [enabled, refresh])
  return { ...data, error, loading, refresh }
}
