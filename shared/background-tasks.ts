import type { BackgroundTaskSnapshot } from './contracts.js'

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
