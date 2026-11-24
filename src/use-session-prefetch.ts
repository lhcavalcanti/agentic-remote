import { useEffect, useRef } from 'react'
import { sessionKey } from './session-presentation'
import { SessionPrefetcher, type SessionPrefetcherOptions } from './session-prefetch'

export interface SessionPrefetchOptions extends SessionPrefetcherOptions {
  /**
   * Whether reading ahead may run: the page is visible, its event socket is
   * open, the open session has been drawn, and the reader is not waiting on a
   * request of their own.
   */
  ready: boolean
}

/**
 * Reads ahead the sessions `candidates` names while `ready`. Losing `ready`
 * abandons the read on its way; regaining it starts a new pass.
 */
export function useSessionPrefetch(options: SessionPrefetchOptions): void {
  const { ready, candidates } = options
  const latest = useRef(options)
  const prefetcher = useRef<SessionPrefetcher | undefined>(undefined)
  useEffect(() => {
    latest.current = options
  })
  useEffect(() => {
    const current = new SessionPrefetcher({
      candidates: () => latest.current.candidates(),
      read: (session, signal) => latest.current.read(session, signal),
      install: (session) => latest.current.install(session),
      idle: latest.current.idle,
      size: latest.current.size,
      budget: latest.current.budget,
    })
    prefetcher.current = current
    return () => {
      current.stop()
      prefetcher.current = undefined
    }
  }, [])
  useEffect(() => {
    if (!ready) return
    const current = prefetcher.current
    current?.start()
    return () => current?.stop()
  }, [ready])
  // A session that comes to need reading -- listed, or moved up -- is read in
  // the pass under way.
  const signature = ready ? candidates().map(sessionKey).join('\n') : ''
  useEffect(() => {
    if (ready) prefetcher.current?.start()
  }, [ready, signature])
}
