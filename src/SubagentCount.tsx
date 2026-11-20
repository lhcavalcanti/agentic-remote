import { UsersRound } from 'lucide-react'
import type { BackgroundTaskSnapshot } from '../shared/contracts'

export function SubagentCount({ snapshot, onOpen }: {
  snapshot?: BackgroundTaskSnapshot
  onOpen: () => void
}) {
  const count = snapshot?.supported ? new Set(snapshot.tasks.filter(
    (task) => task.type === 'agent' && task.status === 'running',
  ).map((task) => task.id)).size : 0
  if (!count) return null
  return (
    <button
      aria-label={`${count} subagent${count === 1 ? '' : 's'} running`}
      className="web-statusline__tasks web-statusline__tasks--running subagent-count"
      onClick={onOpen}
      title="Running subagents reported by this runtime"
      type="button"
    >
      <UsersRound aria-hidden="true" size={12} />
      {count} subagent{count === 1 ? '' : 's'}
    </button>
  )
}
