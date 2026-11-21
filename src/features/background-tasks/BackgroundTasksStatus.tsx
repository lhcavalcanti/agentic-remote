import type { BackgroundTaskSnapshot } from '../../../shared/contracts'
import {
  backgroundTaskCountLabel,
  backgroundTaskCountText,
  backgroundTaskCounts,
} from './task-summary'

/** The status line's one item for background work. It opens the tasks sheet. */
export function BackgroundTasksStatus({
  snapshot,
  onOpen,
}: {
  snapshot?: BackgroundTaskSnapshot
  onOpen: () => void
}) {
  const counts = backgroundTaskCounts(snapshot)
  return (
    <button
      aria-label={backgroundTaskCountLabel(counts)}
      className={`web-statusline__tasks${
        counts.tasks > 0 ? ' web-statusline__tasks--running' : ''
      }`}
      onClick={onOpen}
      title="View background tasks"
      type="button"
    >
      {backgroundTaskCountText(counts)}
    </button>
  )
}
