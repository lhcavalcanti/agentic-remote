import { useCallback, useEffect, useRef, useState } from 'react'
import { sessionKey } from './session-presentation'
import {
  browserConnection,
  connectionSparesData,
  SessionPrefetcher,
  type SessionPrefetcherOptions,
} from './session-prefetch'

export interface SessionPrefetchOptions extends Omit<SessionPrefetcherOptions, 'allowed'> {
  /**
   * Whether the app lets reading ahead run: its event socket is open, the
   * open session has been read and drawn, and the reader is not waiting on a
   * request of their own.
   */
  ready: boolean
}

const pageVisible = () => document.visibilityState === 'visible'
const allowed = () => pageVisible() && !connectionSparesData(browserConnection())

/**
 * Reads ahead the sessions `candidates` names while `ready`, the page is
 * visible and the connection does not ask to save data. Losing any of them
 * abandons the read on its way; regaining them starts a new pass.
 *
 * Returns what abandons it at once, for a request of the reader's that has to
 * go out alone before `ready` can follow.
 */
export function useSessionPrefetch(options: SessionPrefetchOptions): () => void {
  const { candidates } = options
  const [visible, setVisible] = useState(pageVisible)
  const [sparing, setSparing] = useState(() => connectionSparesData(browserConnection()))
  const ready = options.ready && visible && !sparing
  const latest = useRef(options)
  const prefetcher = useRef<SessionPrefetcher | undefined>(undefined)
  useEffect(() => {
    latest.current = options
  })
  useEffect(() => {
    const shown = () => setVisible(pageVisible())
    const connection = browserConnection()
    const changed = () => setSparing(connectionSparesData(connection))
    document.addEventListener('visibilitychange', shown)
    connection?.addEventListener?.('change', changed)
    return () => {
      document.removeEventListener('visibilitychange', shown)
      connection?.removeEventListener?.('change', changed)
    }
  }, [])
  useEffect(() => {
    const current = new SessionPrefetcher({
      candidates: () => latest.current.candidates(),
      read: (session, signal) => latest.current.read(session, signal),
      install: (session) => latest.current.install(session),
      allowed,
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
  return useCallback(() => prefetcher.current?.stop(), [])
}
