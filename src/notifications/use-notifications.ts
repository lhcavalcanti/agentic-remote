import { useCallback, useEffect, useRef, useState } from 'react'
import type { NotificationRecord } from '../../shared/notification-center'
import { request } from '../api'
import { subscribeFeatureEvents } from '../features/events'

export function useNotifications(enabled: boolean) {
  const [records, setRecords] = useState<NotificationRecord[]>([])
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [mutating, setMutating] = useState(false)
  const active = useRef(false)
  const controller = useRef<AbortController | undefined>(undefined)
  const refresh = useCallback(async () => {
    if (!active.current) return
    controller.current?.abort()
    const pending = new AbortController()
    controller.current = pending
    setLoading(true)
    try {
      const response = await request<{ notifications: NotificationRecord[] }>('/api/notifications', { cache: 'no-store', signal: pending.signal })
      if (!pending.signal.aborted && active.current) { setRecords(response.notifications); setError(undefined) }
    } catch (caught) {
      if (!pending.signal.aborted && active.current) setError(caught instanceof Error ? caught.message : 'Notifications are unavailable')
    } finally { if (!pending.signal.aborted && active.current) setLoading(false) }
  }, [])
  useEffect(() => {
    active.current = enabled
    if (!enabled) return
    void refresh()
    const unsubscribe = subscribeFeatureEvents((event) => {
      if (event.type === 'notifications.changed' || event.type === 'hub.connected') void refresh()
    })
    return () => { active.current = false; controller.current?.abort(); unsubscribe() }
  }, [enabled, refresh])
  async function mutate(ids: string[], action: 'read' | 'dismiss', scope?: string) {
    setMutating(true)
    try {
      if (scope !== undefined) await request(`/api/notifications/read-all${scope}`, { method: 'POST', body: '{}' })
      else await Promise.all(ids.map((id) => request(`/api/notifications/${encodeURIComponent(id)}/${action}`, { method: 'POST', body: '{}' })))
      await refresh()
    } catch (caught) { if (active.current) setError(caught instanceof Error ? caught.message : 'Could not update notifications') }
    finally { if (active.current) setMutating(false) }
  }
  return { records: enabled ? records : [], error, loading, mutating, mutate,
    unreadCount: enabled ? records.filter((record) => !record.readAt && !record.dismissedAt).length : 0 }
}
