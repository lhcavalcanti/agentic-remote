export type DreamerPlanItemStatus = 'pending' | 'skipped' | 'done'
import type { OracleTaskView } from './oracle-task.js'

export type DreamerPlanItemSource = 'session' | 'memory' | 'carry' | 'task'

export interface DreamerTaskCompletionProvenance {
  source: 'root-task-complete'
  computerId: string
  sessionId: string
  sessionRevision: number
  messageId: string
  toolCallId: string
  resultDigest: string
  completedAt: string
  confirmedAt: string
}

export interface DreamerCompletionCandidate {
  source: 'root-task-complete'
  computerId: string
  sessionId: string
  sessionRevision: number
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
  taskId?: string
  completion?: DreamerTaskCompletionProvenance
  /** Transient API projection; never persisted in Dreamer state. */
  completionCandidate?: DreamerCompletionCandidate
  /** Transient projection; the owning session could not be read for evidence. */
  completionSourceUnavailable?: boolean
  /** Transient authoritative source state; never persisted in Dreamer state. */
  sourceState?: 'verified-completion' | 'pending' | 'unavailable'
  /** Transient user-facing explanation of the authoritative source state. */
  sourceStateReason?: string
}

export function isDreamerSessionItem<
  T extends Pick<DreamerPlanItem, 'source' | 'computerId' | 'sessionId'>,
>(item: T): boolean {
  return item.source === 'session' || hasDreamerSessionIdentity(item)
}

export function hasDreamerSessionIdentity<
  T extends Pick<DreamerPlanItem, 'computerId' | 'sessionId'>,
>(item: T): item is T & { computerId: string; sessionId: string } {
  return Boolean(item.computerId && item.sessionId)
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

/** How often Dreamer refreshes session progress while enabled. */
export const DREAMER_PROGRESS_REFRESH_MS = 5 * 60_000

/** How current Dreamer's view of session progress is; present while enabled. */
export interface DreamerProgressStatus {
  refreshedAt?: string
  nextRefreshAt?: string
  /** Names of computers whose sessions could not be listed in the last refresh. */
  staleComputers: string[]
  error?: string
}

export interface DreamerSnapshot {
  available: boolean
  revision: number
  settings: DreamerSettings
  plan?: DreamerPlan
  tasks?: OracleTaskView[]
  progress?: DreamerProgressStatus
  lastError?: string
}
