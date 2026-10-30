export type DreamerPlanItemStatus = 'pending' | 'skipped' | 'done'
export type DreamerPlanItemSource = 'session' | 'memory' | 'carry'

export interface DreamerPlanItem {
  id: string
  label: string
  reason: string
  status: DreamerPlanItemStatus
  source: DreamerPlanItemSource
  computerId?: string
  sessionId?: string
  memoryId?: string
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
