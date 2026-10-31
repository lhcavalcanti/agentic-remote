export type DreamerPlanItemStatus = 'pending' | 'skipped' | 'done'
export type DreamerPlanItemSource = 'session' | 'memory' | 'carry'

export interface DreamerTaskCompletionProvenance {
  computerId: string
  sessionId: string
  messageId: string
  toolCallId: string
  resultDigest: string
  completedAt: string
  confirmedAt: string
}

export interface DreamerCompletionCandidate {
  computerId: string
  sessionId: string
  messageId: string
  toolCallId: string
  resultDigest: string
  completedAt: string
  summary: string
}

export interface DreamerPlanItem {
  id: string
  label: string
  reason: string
  status: DreamerPlanItemStatus
  source: DreamerPlanItemSource
  computerId?: string
  sessionId?: string
  memoryId?: string
  completion?: DreamerTaskCompletionProvenance
  /** Transient API projection; never persisted in Dreamer state. */
  completionCandidate?: DreamerCompletionCandidate
  /** Transient projection; the owning session could not be read for evidence. */
  completionSourceUnavailable?: boolean
}

export interface DreamerPlan {
  id: string
  localDate: string
  timeZone: string
  createdAt: string
  items: DreamerPlanItem[]
  coverage: string[]
  omitted: number
}

export interface DreamerSettings {
  enabled: boolean
  timeZone: string
}

export interface DreamerSnapshot {
  available: boolean
  revision: number
  settings: DreamerSettings
  plan?: DreamerPlan
  lastError?: string
}
