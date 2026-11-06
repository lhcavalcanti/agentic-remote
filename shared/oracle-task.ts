import type { ManagerSessionRef } from './manager.js'

export type OracleTaskOwner = 'oracle' | 'user'
export type OracleTaskStatus =
  | 'ready'
  | 'queued'
  | 'running'
  | 'blocked'
  | 'failed'
  | 'review'
  | 'completed'
  | 'dismissed'

export interface OracleTaskSourceSession {
  computerId: string
  sessionId: string
  taskGeneration: number
}

export interface OracleTaskAttempt {
  id: string
  requestId: string
  managerMessageId: string
  status: Exclude<OracleTaskStatus, 'ready' | 'dismissed'>
  sessionRefs: ManagerSessionRef[]
  error?: string
  startedAt?: string
  finishedAt?: string
}

export interface OracleTaskCompletionProvenance {
  source: 'root-task-complete'
  attemptId: string
  computerId: string
  sessionId: string
  sessionRevision: number
  messageId: string
  toolCallId: string
  resultDigest: string
  completedAt: string
  confirmedAt: string
}

export interface OracleTaskCompletionCandidate {
  source: 'root-task-complete'
  attemptId: string
  computerId: string
  sessionId: string
  sessionRevision: number
  messageId: string
  toolCallId: string
  resultDigest: string
  completedAt: string
  summary: string
}

export interface OracleTaskEvidence {
  id: string
  kind: 'tool' | 'test' | 'completion'
  label: string
  status: 'running' | 'completed' | 'failed'
  result?: string
  durationMs?: number
}

export interface OracleTask {
  id: string
  revision: number
  title: string
  summary: string
  nextAction: string
  owner: OracleTaskOwner
  status: OracleTaskStatus
  sourceEventIds: string[]
  sourceSession?: OracleTaskSourceSession
  executionPrompt?: string
  attempts: OracleTaskAttempt[]
  completion?: OracleTaskCompletionProvenance
  createdAt: string
  updatedAt: string
}

export interface OracleTaskView extends OracleTask {
  evidence?: OracleTaskEvidence[]
  completionCandidate?: OracleTaskCompletionCandidate
  blockedReason?: string
}
