import { Clock3, SquareTerminal, UserRound } from 'lucide-react'
import type { SessionProvenance } from '../shared/contracts'
import { OracleIcon } from './oracle-icon'
import { sessionOriginDescription } from './session-origin'

const icons = { manager: OracleIcon, schedule: Clock3, discovered: SquareTerminal, user: UserRound }
const labels = { manager: 'Oracle', schedule: 'Schedule', discovered: 'External', user: '' }

export function SessionOriginBadge({
  provenance, compact = false,
}: { provenance?: SessionProvenance; compact?: boolean }) {
  if (!provenance) return null
  const Icon = icons[provenance.origin]
  if (!Icon) return null
  const description = sessionOriginDescription(provenance)
  return (
    <span
      aria-label={description}
      className="provider-badge session-origin-badge"
      data-session-origin={provenance.origin}
      role="img"
      title={description}
    >
      <Icon aria-hidden="true" size={12} />
      {compact ? null : labels[provenance.origin]}
    </span>
  )
}
