import type { SessionStatus } from './contracts.js'

/** What a session's status update says about the turn it was on. */
export interface SessionTurnState {
  status: SessionStatus
  pendingPermission?: unknown
  pendingUserInput?: unknown
  queuedCount?: number
}

/**
 * Whether this update ends a turn someone has not seen yet: the session went
 * idle with nothing left for it or you to do -- the rule the "finished" push
 * follows -- or it failed. Without a previous status nothing is known about
 * the turn, so a session seen for the first time never counts.
 */
export function turnEnded(
  previous: SessionStatus | undefined,
  session: SessionTurnState,
): boolean {
  if (previous === undefined || previous === session.status) return false
  if (session.status === 'error') return true
  return (
    session.status === 'idle' &&
    (previous === 'running' || previous === 'waiting') &&
    !session.pendingPermission &&
    !session.pendingUserInput &&
    !session.queuedCount
  )
}
