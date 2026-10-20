export const MANAGER_STRUCTURED_MEMORY_VERSION = 1
export const MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS = 200
export const MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS = 2_000
export const MANAGER_STRUCTURED_MEMORY_MAX_REQUEST_ID_CHARS = 200
export const MANAGER_STRUCTURED_MEMORY_MAX_RESULTS = 8
export const MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS = 1_000
export const MANAGER_STRUCTURED_MEMORY_PROMPT_MAX_CHARS = 6_000
export const MANAGER_STRUCTURED_MEMORY_MAX_RECORDS = 10_000
export const MANAGER_STRUCTURED_MEMORY_MAX_TOMBSTONES = 20_000
export const MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES = 5_000
export const MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS = 10_000
export const MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES = 32 * 1024 * 1024

export type ManagerStructuredMemoryMode = 'off' | 'shadow' | 'on'

export type ManagerStructuredMemoryKind =
  | 'preference'
  | 'fact'
  | 'procedure'
  | 'decision'
  | 'outcome'

export type ManagerStructuredMemoryScope =
  | { type: 'global' }
  | { type: 'user' }
  | { type: 'computer'; computerId: string }
  | { type: 'project'; computerId: string; projectRoot: string }
  | { type: 'session'; computerId: string; sessionId: string }

export type ManagerStructuredMemoryAuthority =
  | 'direct-user-correction'
  | 'direct-user'
  | 'policy-authorized'
  | 'verified-outcome'
  | 'session-derived'
  | 'inference'

export type ManagerStructuredMemoryOrigin =
  | 'direct-user'
  | 'policy'
  | 'session'
  | 'import'

export interface ManagerStructuredMemorySessionRef {
  computerId: string
  sessionId: string
}

export interface ManagerStructuredMemoryProvenance {
  origin: ManagerStructuredMemoryOrigin
  requestId: string
  sourceDigest: string
  sourceSession?: ManagerStructuredMemorySessionRef
  sourceManagerMessageId?: string
}

export interface ManagerStructuredMemoryRecord {
  schemaVersion: 1
  id: string
  kind: ManagerStructuredMemoryKind
  canonicalKey: string
  content: string
  scope: ManagerStructuredMemoryScope
  provenance: ManagerStructuredMemoryProvenance
  authority: ManagerStructuredMemoryAuthority
  confidence: number
  createdAt: string
  updatedAt: string
  validFrom?: string
  validUntil?: string
  supersedesId?: string
  supersededById?: string
}

export interface ManagerStructuredMemoryTombstone {
  schemaVersion: 1
  recordId: string
  scope: ManagerStructuredMemoryScope
  canonicalKey: string
  contentDigest: string
  sourceDigest: string
  requestId: string
  deletedAt: string
  sourceManagerMessageId?: string
}

export type ManagerStructuredMemoryOperation =
  | 'remember'
  | 'correct'
  | 'forget'
  | 'import'

export interface ManagerStructuredMemoryAuditEntry {
  id: string
  operation: ManagerStructuredMemoryOperation
  requestId: string
  recordId?: string
  occurredAt: string
  outcome: 'applied' | 'duplicate'
}

export interface ManagerStructuredMemoryAppliedRequest {
  requestId: string
  operation: ManagerStructuredMemoryOperation
  recordId?: string
  revision: number
  appliedAt: string
}

export interface ManagerStructuredMemoryState {
  version: 1
  revision: number
  records: ManagerStructuredMemoryRecord[]
  tombstones: ManagerStructuredMemoryTombstone[]
  audit: ManagerStructuredMemoryAuditEntry[]
  appliedRequests: ManagerStructuredMemoryAppliedRequest[]
}

export interface ManagerStructuredMemoryRememberInput {
  requestId: string
  kind: ManagerStructuredMemoryKind
  canonicalKey: string
  content: string
  scope: ManagerStructuredMemoryScope
  confidence?: number
  validFrom?: string
  validUntil?: string
  sourceSession?: ManagerStructuredMemorySessionRef
  sourceManagerMessageId?: string
}

export interface ManagerStructuredMemoryCorrectInput
  extends ManagerStructuredMemoryRememberInput {
  recordId: string
}

export interface ManagerStructuredMemoryForgetInput {
  requestId: string
  recordId: string
  sourceManagerMessageId?: string
}

export interface ManagerStructuredMemorySearchInput {
  query: string
  scopes: ManagerStructuredMemoryScope[]
  limit?: number
  at?: string
}

export interface ManagerStructuredMemoryImportInput {
  requestId: string
  state: ManagerStructuredMemoryState
}

export interface ManagerStructuredMemoryMutationResult {
  revision: number
  record?: ManagerStructuredMemoryRecord
  tombstone?: ManagerStructuredMemoryTombstone
  idempotent: boolean
}

export interface ManagerStructuredMemorySearchResult {
  revision: number
  records: ManagerStructuredMemoryRecord[]
}

export interface ManagerStructuredMemoryStatus {
  mode: ManagerStructuredMemoryMode
  availability: 'disabled' | 'ready' | 'unavailable'
  revision?: number
  records?: number
  tombstones?: number
  retrievals?: number
  lastRetrievalMs?: number
  lastRetrievalRecords?: number
  lastPromptCharacters?: number
  lastError?: string
}
