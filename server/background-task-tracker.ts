import type {
  BackgroundTask,
  BackgroundTaskSnapshot,
} from '../shared/contracts.js'
import type { SessionService } from './session-service.js'

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

/** Answered `404`: the task is not, or no longer, in its session's list. */
export function backgroundTaskNotFound(): Error {
  return Object.assign(new Error('Background task not found'), { statusCode: 404 })
}

/** One task of a list, or `backgroundTaskNotFound`. */
export function listedBackgroundTask(snapshot: BackgroundTaskSnapshot, taskId: string): BackgroundTask {
  const task = snapshot.tasks.find((candidate) => candidate.id === taskId)
  if (!task) throw backgroundTaskNotFound()
  return task
}

/** One task whole from a service, or from a fresh list when it cannot read one. */
export async function readBackgroundTaskFrom(
  service: Pick<SessionService, 'listBackgroundTasks' | 'readBackgroundTask'>,
  sessionId: string,
  taskId: string,
): Promise<BackgroundTask> {
  return service.readBackgroundTask
    ? service.readBackgroundTask(sessionId, taskId)
    : listedBackgroundTask(await service.listBackgroundTasks(sessionId), taskId)
}

export class BackgroundTaskTracker {
  private readonly snapshots = new Map<string, BackgroundTaskSnapshot>()

  get(sessionId: string): BackgroundTaskSnapshot {
    return cloneSnapshot(
      this.snapshots.get(sessionId) ||
        backgroundTaskSnapshot([], false),
    )
  }

  /** A copy of one task as last published, without copying the rest. */
  task(sessionId: string, taskId: string): BackgroundTask | undefined {
    const task = this.snapshots.get(sessionId)?.tasks.find((candidate) => candidate.id === taskId)
    return task && structuredClone(task)
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
