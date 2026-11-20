import { Clock3, SquareTerminal, UserRound } from 'lucide-react'
import type { SessionProvenance } from '../shared/contracts'
import { usePreviewFeature } from './preview-features'
import { OracleIcon } from './oracle-icon'
import { sessionOriginDescription } from './session-origin'

const icons = { manager: OracleIcon, schedule: Clock3, discovered: SquareTerminal, user: UserRound }
const labels = { manager: 'Oracle', schedule: 'Schedule', discovered: 'External', user: '' }

export function SessionOriginBadge({
  provenance, legacyManaged = false, compact = false,
}: { provenance?: SessionProvenance; legacyManaged?: boolean; compact?: boolean }) {
  const enabled = usePreviewFeature('composerRefresh')
  if (!enabled) return legacyManaged
    ? <em className="provider-badge manager-badge" title="Started by Oracle">Oracle</em> : null
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
