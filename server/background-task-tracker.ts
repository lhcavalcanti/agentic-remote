import type {
  BackgroundTask,
  BackgroundTaskSnapshot,
} from '../shared/contracts.js'

export interface BackgroundTaskUpdate {
  snapshot: BackgroundTaskSnapshot
  changed: boolean
}

function cloneSnapshot(snapshot: BackgroundTaskSnapshot): BackgroundTaskSnapshot {
  return structuredClone(snapshot)
}

function taskFingerprint(task: BackgroundTask): string {
  return JSON.stringify(task)
}

export function backgroundTaskSnapshot(
  tasks: BackgroundTask[],
  supported: boolean,
): BackgroundTaskSnapshot {
  const unique = new Map<string, BackgroundTask>()
  for (const task of tasks) {
    unique.set(task.id, task)
  }
  const ordered = [...unique.values()].sort((left, right) =>
    right.startedAt.localeCompare(left.startedAt),
  )
  return {
    tasks: ordered,
    runningCount: ordered.filter(
      (task) =>
        task.status === 'running' && task.executionMode === 'background',
    ).length,
    supported,
  }
}

export class BackgroundTaskTracker {
  private readonly snapshots = new Map<string, BackgroundTaskSnapshot>()

  get(sessionId: string): BackgroundTaskSnapshot {
    return cloneSnapshot(
      this.snapshots.get(sessionId) ||
        backgroundTaskSnapshot([], false),
    )
  }

  replace(
    sessionId: string,
    tasks: BackgroundTask[],
    supported: boolean,
  ): BackgroundTaskUpdate {
    const next = backgroundTaskSnapshot(tasks, supported)
    const previous = this.snapshots.get(sessionId)
    const changed =
      !previous ||
      previous.supported !== next.supported ||
      previous.runningCount !== next.runningCount ||
      previous.tasks.length !== next.tasks.length ||
      previous.tasks.some(
        (task, index) => taskFingerprint(task) !== taskFingerprint(next.tasks[index]),
      )
    this.snapshots.set(sessionId, next)
    return { snapshot: cloneSnapshot(next), changed }
  }

  remove(sessionId: string): void {
    this.snapshots.delete(sessionId)
  }
}
