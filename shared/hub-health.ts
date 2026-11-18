import type { AppVersion } from './app-version.js'
import type { HubFeatureFlags } from './feature-flags.js'

export interface HubHealth {
  hub: { id: string; name: string; role: 'hub'; version: string }
  release?: AppVersion
  startup: Array<{
    startupPhase: string
    event: 'begin' | 'complete' | 'fail'
    elapsedMs: number
    durationMs?: number
    error?: string
    code?: string
  }>
  computers: Array<{ id: string; name: string; role: 'hub' | 'node'; version?: string; online: boolean }>
  hubFlags: HubFeatureFlags
}
