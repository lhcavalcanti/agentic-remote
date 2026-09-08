import type { BackgroundTask } from '../../../shared/contracts'

export function orderTasksForReading(
  tasks: BackgroundTask[],
): BackgroundTask[] {
  const live = (task: BackgroundTask) =>
    task.status === 'running' || task.status === 'queued'
  const at = (value: string | undefined) => {
    const parsed = value ? Date.parse(value) : Number.NaN
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return [...tasks].sort((left, right) => {
    if (live(left) !== live(right)) {
      return live(left) ? -1 : 1
    }
    if (live(left)) {
      const started = (at(left.startedAt) ?? 0) - (at(right.startedAt) ?? 0)
      return started !== 0 ? started : left.id.localeCompare(right.id)
    }
    const leftAt = at(left.completedAt) ?? at(left.startedAt) ?? 0
    const rightAt = at(right.completedAt) ?? at(right.startedAt) ?? 0
    return rightAt !== leftAt
      ? rightAt - leftAt
      : left.id.localeCompare(right.id)
  })
}
