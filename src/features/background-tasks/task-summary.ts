import type {
  BackgroundTask,
  BackgroundTaskSnapshot,
} from '../../../shared/contracts'

export interface BackgroundTaskCounts {
  /** Running tasks, subagents included. */
  tasks: number
  /** Running subagents. */
  subagents: number
}

/**
 * The running work the status line and the tasks sheet both describe. The
 * runtime counts only background work, so a synchronous subagent, which it
 * leaves out, is added to that count: every subagent is one of the tasks.
 */
export function backgroundTaskCounts(
  snapshot: BackgroundTaskSnapshot | undefined,
): BackgroundTaskCounts {
  const running = snapshot?.runningCount ?? 0
  if (!snapshot?.supported) {
    return { tasks: running, subagents: 0 }
  }
  const subagents = new Set<string>()
  const uncounted = new Set<string>()
  for (const task of snapshot.tasks) {
    if (task.type !== 'agent' || task.status !== 'running') {
      continue
    }
    subagents.add(task.id)
    if (task.executionMode !== 'background') {
      uncounted.add(task.id)
    }
  }
  return { tasks: running + uncounted.size, subagents: subagents.size }
}

const counted = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

/** The short form shown on screen, such as "4 tasks · 1 subagent". */
export function backgroundTaskCountText({
  tasks,
  subagents,
}: BackgroundTaskCounts): string {
  return subagents > 0
    ? `${counted(tasks, 'task')} · ${counted(subagents, 'subagent')}`
    : counted(tasks, 'task')
}

/** The same counts in words, such as "4 background tasks running, 1 subagent". */
export function backgroundTaskCountLabel({
  tasks,
  subagents,
}: BackgroundTaskCounts): string {
  const running = `${counted(tasks, 'background task')} running`
  return subagents > 0 ? `${running}, ${counted(subagents, 'subagent')}` : running
}

/**
 * A request, for the user to send, that the agent stop a task the app has no
 * handle to stop itself. It names the task the way the runtime reported it.
 */
export function backgroundTaskStopRequest(
  task: Pick<BackgroundTask, 'id' | 'description'>,
): string {
  const title = task.description.replace(/\s+/g, ' ').trim()
  return `Stop the background task \`${task.id}\`${
    title ? ` (${title})` : ''
  } and tell me when it has stopped.`
}
