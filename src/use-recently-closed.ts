import { useCallback, useRef, useState } from 'react'
import type { ManagedSession } from '../shared/contracts'
import { listClosedSessions } from './api'
import { sessionKey } from './session-presentation'

/**
 * The sessions closed on every reachable computer that can still be reopened.
 * Unknown until first read; a close made here shows at once, and anything a
 * session event reports reopened or deleted leaves the list without a read.
 */
export function useRecentlyClosed() {
  const [sessions, setSessions] = useState<ManagedSession[]>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const generation = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++generation.current
    setLoading(true)
    try {
      const listed = await listClosedSessions()
      if (request !== generation.current) return
      setSessions(listed)
      setError(undefined)
    } catch (caught) {
      if (request === generation.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === generation.current) setLoading(false)
    }
  }, [])

  const forget = useCallback((key: string) => {
    setSessions((current) => current?.some((session) => sessionKey(session) === key)
      ? current.filter((session) => sessionKey(session) !== key)
      : current)
  }, [])

  const remember = useCallback((closed: ManagedSession) => {
    // A read already on its way predates this close.
    generation.current += 1
    setLoading(false)
    setSessions((current) => [
      closed,
      ...(current ?? []).filter((session) => sessionKey(session) !== sessionKey(closed)),
    ])
  }, [])

  return { sessions, loading, error, refresh, forget, remember }
}
