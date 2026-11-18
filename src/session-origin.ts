import type { SessionProvenance } from '../shared/contracts'

export function sessionOriginDescription(provenance: SessionProvenance | undefined): string | undefined {
  switch (provenance?.origin) {
    case 'manager': return 'Started by Oracle'
    case 'schedule': return provenance.scheduleName
      ? `Started by schedule ${provenance.scheduleName}` : 'Started by schedule'
    case 'discovered': return 'Found on this computer'
    case 'user': return 'Started by you'
    default: return undefined
  }
}
