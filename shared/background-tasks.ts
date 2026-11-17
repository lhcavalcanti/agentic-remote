import type { BackgroundTaskSnapshot, SessionDetail } from './contracts.js'

export function hasForegroundTurn(
  session: Pick<SessionDetail, 'status' | 'foregroundTurnActive' | 'messages' | 'pendingPermission' | 'pendingUserInput'>,
  snapshot?: BackgroundTaskSnapshot,
): boolean {
  if (session.status !== 'running') return false
  if (session.foregroundTurnActive !== undefined) return session.foregroundTurnActive
  if (!hasActiveBackgroundTasks(snapshot) && !snapshot?.runningCount) return true
  // Legacy nodes have no independent foreground bit. Background work alone
  // must not replace their valid direct-send path with an unavailable steer.
  return Boolean(session.pendingPermission || session.pendingUserInput ||
    session.messages.findLast((message) => message.role === 'assistant')?.streaming ||
    snapshot?.tasks.some((task) => task.status === 'running' && task.executionMode === 'sync'))
}

export function hasActiveBackgroundTasks(
  snapshot: BackgroundTaskSnapshot | undefined,
): boolean {
  return Boolean(
    snapshot?.tasks.some(
      (task) => task.status === 'queued' || task.status === 'running',
    ),
  )
}

export function hasRunningBackgroundAgent(
  snapshot: BackgroundTaskSnapshot | undefined,
): boolean {
  return Boolean(
    snapshot?.tasks.some(
      (task) =>
        task.type === 'agent' &&
        task.status === 'running' &&
        task.executionMode === 'background',
    ),
  )
}
