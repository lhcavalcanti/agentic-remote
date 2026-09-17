import type { BackgroundTaskSnapshot } from './contracts.js'

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
