import { createHash } from 'node:crypto'
import type {
  ManagerRegistry,
  RegistryEntry,
} from './manager-store.js'
import type {
  ManagerStructuredMemoryScope,
  ManagerStructuredMemoryMode,
} from '../shared/manager-structured-memory.js'
import type {
  DreamerPlanItem,
  DreamerPlanItemStatus,
} from '../shared/dreamer.js'

export const DREAMER_MAX_ITEMS = 20
export const DREAMER_DEFAULT_STALE_AFTER_MS = 24 * 60 * 60 * 1000
export const DREAMER_MIN_MEMORY_CONFIDENCE = 0.25

export class DreamerPlannerCapacityError extends Error {
  readonly statusCode = 507

  constructor() {
    super('Dreamer pending review capacity is full; resolve carried items before retrying.')
    this.name = 'DreamerPlannerCapacityError'
  }
}

export interface DreamerSessionMetadata {
  [key: string]: unknown
  computerId: string
  sessionId: string
  status?: 'idle' | 'running' | 'waiting' | 'error' | 'closed'
  lastSeenAt?: string
  removedAt?: string
  replacedBy?: string
  /**
   * A source adapter may provide a precomputed opaque fingerprint. The
   * planner hashes it before it can enter durable state.
   */
  fingerprint?: string
}

export interface DreamerMemoryMetadataRecord {
  id: string
  kind: 'preference' | 'fact' | 'procedure' | 'decision' | 'outcome'
  scope: ManagerStructuredMemoryScope
  authority:
    | 'direct-user-correction'
    | 'direct-user'
    | 'policy-authorized'
    | 'verified-outcome'
    | 'session-derived'
    | 'inference'
  confidence: number
  createdAt: string
  updatedAt: string
  validFrom?: string
  validUntil?: string
  supersededById?: string
}

export interface DreamerMemoryMetadata {
  mode: ManagerStructuredMemoryMode
  available: boolean
  records: DreamerMemoryMetadataRecord[]
  tombstones: Array<{ recordId: string }>
  lastError?: string
}

export interface DreamerPreviousItem extends DreamerPlanItem {
  fingerprint: string
}

export interface DreamerHistoryEntry {
  fingerprint: string
  status: Exclude<DreamerPlanItemStatus, 'pending'>
}

export interface DreamerPreviousPlan {
  items: DreamerPreviousItem[]
  history: DreamerHistoryEntry[]
}

export interface DreamerPlannerInput {
  now: Date
  registryAvailable: boolean
  sessions: DreamerSessionMetadata[]
  memory?: DreamerMemoryMetadata
  previous?: DreamerPreviousPlan
  staleAfterMs?: number
}

export interface DreamerStoredPlanItem extends DreamerPlanItem {
  fingerprint: string
}

export interface DreamerPlanDraft {
  items: DreamerStoredPlanItem[]
  coverage: string[]
  omitted: number
}

const SESSION_PRIORITY: Record<NonNullable<DreamerSessionMetadata['status']>, number> = {
  error: 0,
  waiting: 1,
  running: 2,
  idle: 3,
  closed: 99,
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function safeIdentifier(value: unknown): value is string {
  return typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 200 &&
    /^[A-Za-z0-9._:@-]+$/.test(value)
}

function addCoverage(coverage: string[], value: string): void {
  if (!coverage.includes(value)) coverage.push(value)
}

function validTimestamp(value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function sessionFingerprint(session: DreamerSessionMetadata): string {
  return typeof session.fingerprint === 'string' && session.fingerprint.length <= 200
    ? session.fingerprint
    : digest([
        'session',
        session.computerId,
        session.sessionId,
        session.status ?? 'idle',
        session.lastSeenAt ?? '',
        session.removedAt ?? '',
        session.replacedBy ?? '',
    ])
}

function memoryFingerprint(record: DreamerMemoryMetadataRecord): string {
  return digest([
    'memory',
    record.id,
    record.kind,
    JSON.stringify(record.scope),
    record.authority,
    record.confidence,
    record.createdAt,
    record.updatedAt,
    record.validFrom ?? '',
    record.validUntil ?? '',
    record.supersededById ?? '',
  ])
}

function validMemoryScope(scope: ManagerStructuredMemoryScope): boolean {
  if (!scope || typeof scope !== 'object') return false
  if (scope.type === 'global' || scope.type === 'user') return true
  if (scope.type === 'computer') return safeIdentifier(scope.computerId)
  if (scope.type === 'session') {
    return safeIdentifier(scope.computerId) && safeIdentifier(scope.sessionId)
  }
  return safeIdentifier(scope.computerId) &&
    typeof scope.projectRoot === 'string' &&
    scope.projectRoot.startsWith('/') &&
    scope.projectRoot.length <= 4096
}

function activeMemoryRecord(
  record: DreamerMemoryMetadataRecord,
  nowMs: number,
  tombstoneIds: ReadonlySet<string>,
): boolean {
  if (!safeIdentifier(record.id) || !validMemoryScope(record.scope)) return false
  if (tombstoneIds.has(record.id)) return false
  if (
    !['preference', 'fact', 'procedure', 'decision', 'outcome'].includes(record.kind) ||
    ![
      'direct-user-correction',
      'direct-user',
      'policy-authorized',
      'verified-outcome',
      'session-derived',
      'inference',
    ].includes(record.authority) ||
    record.supersededById
  ) return false
  if (!Number.isFinite(record.confidence) || record.confidence < DREAMER_MIN_MEMORY_CONFIDENCE) {
    return false
  }
  const updatedAt = validTimestamp(record.updatedAt)
  const validFrom = validTimestamp(record.validFrom)
  const validUntil = validTimestamp(record.validUntil)
  if (updatedAt === undefined || (record.validFrom && validFrom === undefined) ||
    (record.validUntil && validUntil === undefined)) return false
  if (updatedAt > nowMs || (validFrom !== undefined && validFrom > nowMs)) return false
  return validUntil === undefined || validUntil > nowMs
}

export function activeDreamerMemoryIds(
  memory: DreamerMemoryMetadata,
  now: Date,
): Set<string> {
  if (memory.mode !== 'on' || !memory.available) return new Set()
  const nowMs = now.getTime()
  const tombstoneIds = new Set(memory.tombstones.map(({ recordId }) => recordId))
  return new Set(
    memory.records
      .filter((record) => activeMemoryRecord(record, nowMs, tombstoneIds))
      .map(({ id }) => id),
  )
}

function projectRegistryEntry(entry: RegistryEntry): DreamerSessionMetadata {
  // Deliberately project only lifecycle metadata. Do not read title, task, cwd,
  // provider, or any other user-authored registry value here.
  return {
    computerId: entry.computerId,
    sessionId: entry.sessionId,
    ...(entry.lastStatus ? { status: entry.lastStatus } : {}),
    ...(entry.lastSeenAt ? { lastSeenAt: entry.lastSeenAt } : {}),
    ...(entry.removedAt ? { removedAt: entry.removedAt } : {}),
    ...(entry.replacedBy ? { replacedBy: entry.replacedBy } : {}),
  }
}

export function projectDreamerRegistry(
  registry: ManagerRegistry,
): DreamerSessionMetadata[] {
  return Object.values(registry).map(projectRegistryEntry)
}

export function projectDreamerMemory(
  mode: ManagerStructuredMemoryMode,
  available: boolean,
  snapshot?: {
    records: Array<{
      id: string
      kind: DreamerMemoryMetadataRecord['kind']
      scope: ManagerStructuredMemoryScope
      authority: DreamerMemoryMetadataRecord['authority']
      confidence: number
      createdAt: string
      updatedAt: string
      validFrom?: string
      validUntil?: string
      supersededById?: string
    }>
    tombstones: Array<{ recordId: string }>
  },
  lastError?: string,
): DreamerMemoryMetadata {
  return {
    mode,
    available,
    records: snapshot?.records.map((record) => ({
      id: record.id,
      kind: record.kind,
      scope: structuredClone(record.scope),
      authority: record.authority,
      confidence: record.confidence,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      ...(record.validFrom ? { validFrom: record.validFrom } : {}),
      ...(record.validUntil ? { validUntil: record.validUntil } : {}),
      ...(record.supersededById ? { supersededById: record.supersededById } : {}),
    })) ?? [],
    tombstones: snapshot?.tombstones.map(({ recordId }) => ({ recordId })) ?? [],
    ...(lastError ? { lastError } : {}),
  }
}

function candidateForSession(
  session: DreamerSessionMetadata,
  fingerprint: string,
): DreamerStoredPlanItem {
  const status = session.status ?? 'idle'
  const label = status === 'error'
    ? 'Session needs attention'
    : status === 'waiting'
      ? 'Session is waiting'
      : 'Open session review'
  const reason = status === 'error'
    ? 'Journal metadata reports an unresolved error.'
    : status === 'waiting'
      ? 'Journal metadata reports that the session is waiting.'
      : 'Journal metadata reports an open session.'
  return {
    id: `session-${digest([session.computerId, session.sessionId, fingerprint]).slice(0, 32)}`,
    label,
    reason,
    status: 'pending',
    source: 'session',
    computerId: session.computerId,
    sessionId: session.sessionId,
    fingerprint,
  }
}

function candidateForMemory(
  record: DreamerMemoryMetadataRecord,
  fingerprint: string,
): DreamerStoredPlanItem {
  return {
    id: `memory-${digest([record.id, fingerprint]).slice(0, 32)}`,
    label: 'Memory item needs review',
    reason: 'Structured-memory metadata identifies an active review candidate.',
    status: 'pending',
    source: 'memory',
    memoryId: record.id,
    fingerprint,
  }
}

function sessionIdentityKey(computerId: string, sessionId: string): string {
  return JSON.stringify([computerId, sessionId])
}

function carryItem(item: DreamerPreviousItem): DreamerStoredPlanItem {
  return {
    id: item.id,
    label: item.label,
    reason: item.reason,
    status: 'pending',
    source: 'carry',
    ...(item.computerId ? { computerId: item.computerId } : {}),
    ...(item.sessionId ? { sessionId: item.sessionId } : {}),
    ...(item.memoryId ? { memoryId: item.memoryId } : {}),
    fingerprint: item.fingerprint,
  }
}

export function planDreamer(input: DreamerPlannerInput): DreamerPlanDraft {
  const coverage: string[] = [
    input.registryAvailable
      ? 'journal-metadata-only'
      : 'journal-metadata-unavailable',
    'live-computer-state-unavailable',
    'background-todos-unavailable',
  ]
  const staleAfterMs = input.staleAfterMs ?? DREAMER_DEFAULT_STALE_AFTER_MS
  const nowMs = input.now.getTime()
  const previous = input.previous
  const previousHistory = new Map(
    previous?.history.map(({ fingerprint, status }) => [fingerprint, status]) ?? [],
  )
  for (const item of previous?.items ?? []) {
    if (item.status !== 'pending') previousHistory.set(item.fingerprint, item.status)
  }

  if (!input.memory) {
    addCoverage(coverage, 'structured-memory-unavailable')
  } else if (input.memory.mode !== 'on') {
    addCoverage(
      coverage,
      input.memory.mode === 'off'
        ? 'structured-memory-off'
        : 'structured-memory-shadow',
    )
  } else if (!input.memory.available) {
    addCoverage(coverage, 'structured-memory-unavailable')
  } else {
    addCoverage(coverage, 'structured-memory-metadata')
  }

  const carry: DreamerStoredPlanItem[] = []
  const carriedFingerprints = new Set<string>(
    (previous?.items ?? [])
      .filter((item) => item.status === 'pending' && !item.memoryId)
      .map((item) => item.fingerprint),
  )
  const sessionPriorityByIdentity = new Map(
    input.sessions.map((session) => [
      sessionIdentityKey(session.computerId, session.sessionId),
      SESSION_PRIORITY[session.status ?? 'idle'] ?? 98,
    ]),
  )
  const candidates: Array<{
    item: DreamerStoredPlanItem
    priority: number
  }> = []
  const sessions = [...input.sessions].sort((left, right) => {
    const leftRank = SESSION_PRIORITY[left.status ?? 'idle'] ?? 98
    const rightRank = SESSION_PRIORITY[right.status ?? 'idle'] ?? 98
    return leftRank - rightRank ||
      left.computerId.localeCompare(right.computerId) ||
      left.sessionId.localeCompare(right.sessionId)
  })
  for (const session of sessions) {
    if (!safeIdentifier(session.computerId) || !safeIdentifier(session.sessionId)) {
      addCoverage(coverage, 'invalid-scope')
      continue
    }
    if (session.removedAt || session.replacedBy) {
      addCoverage(coverage, 'removed-or-replaced')
      continue
    }
    if (session.status === 'closed') {
      addCoverage(coverage, 'closed-metadata')
      continue
    }
    if (session.status && !(session.status in SESSION_PRIORITY)) {
      addCoverage(coverage, 'invalid-metadata')
      continue
    }
    const seenAt = validTimestamp(session.lastSeenAt)
    if (session.lastSeenAt && seenAt === undefined) {
      addCoverage(coverage, 'invalid-metadata')
      continue
    }
    if (!session.lastSeenAt) addCoverage(coverage, 'journal-metadata-incomplete')
    if (seenAt !== undefined && seenAt > nowMs) {
      addCoverage(coverage, 'future-metadata')
      continue
    }
    if (seenAt !== undefined && nowMs - seenAt > staleAfterMs) {
      addCoverage(coverage, 'stale-metadata')
      continue
    }
    const fingerprint = sessionFingerprint(session)
    if (carriedFingerprints.has(fingerprint) || previousHistory.has(fingerprint)) continue
    candidates.push({
      item: candidateForSession(session, fingerprint),
      priority: sessionPriorityByIdentity.get(
        sessionIdentityKey(session.computerId, session.sessionId),
      ) ?? 98,
    })
  }

  const currentMemoryIds = new Set<string>()
  if (input.memory?.mode === 'on' && input.memory.available) {
    const tombstones = new Set(input.memory.tombstones.map(({ recordId }) => recordId))
    for (const record of input.memory.records) {
      if (!safeIdentifier(record.id) || !validMemoryScope(record.scope)) {
        addCoverage(coverage, 'invalid-scope')
        continue
      }
      if (tombstones.has(record.id)) {
        addCoverage(coverage, 'tombstoned-memory')
        continue
      }
      if (record.supersededById) {
        addCoverage(coverage, 'superseded-memory')
        continue
      }
      if (
        !['preference', 'fact', 'procedure', 'decision', 'outcome'].includes(record.kind) ||
        ![
          'direct-user-correction',
          'direct-user',
          'policy-authorized',
          'verified-outcome',
          'session-derived',
          'inference',
        ].includes(record.authority)
      ) {
        addCoverage(coverage, 'invalid-metadata')
        continue
      }
      if (!Number.isFinite(record.confidence) || record.confidence < DREAMER_MIN_MEMORY_CONFIDENCE) {
        addCoverage(coverage, 'low-confidence-memory')
        continue
      }
      const updatedAt = validTimestamp(record.updatedAt)
      const validFrom = validTimestamp(record.validFrom)
      const validUntil = validTimestamp(record.validUntil)
      if (updatedAt === undefined || (record.validFrom && validFrom === undefined) ||
        (record.validUntil && validUntil === undefined)) {
        addCoverage(coverage, 'invalid-metadata')
        continue
      }
      if (updatedAt > nowMs || (validFrom !== undefined && validFrom > nowMs)) {
        addCoverage(coverage, 'future-metadata')
        continue
      }
      if (validUntil !== undefined && validUntil <= nowMs) {
        addCoverage(coverage, 'expired-memory')
        continue
      }
      currentMemoryIds.add(record.id)
      const fingerprint = memoryFingerprint(record)
      if (previousHistory.has(fingerprint)) continue
      candidates.push({
        item: candidateForMemory(record, fingerprint),
        priority: 4,
      })
    }
  }

  for (const item of previous?.items ?? []) {
    if (item.status !== 'pending') continue
    if (item.memoryId && !currentMemoryIds.has(item.memoryId)) {
      addCoverage(coverage, 'memory-reference-stale')
      continue
    }
    carry.push(carryItem(item))
    carriedFingerprints.add(item.fingerprint)
  }
  if (carry.length > DREAMER_MAX_ITEMS) throw new DreamerPlannerCapacityError()
  const selectedCandidates = candidates.filter(
    ({ item }) => !carriedFingerprints.has(item.fingerprint),
  )

  selectedCandidates.sort((left, right) => {
    const leftPriority = left.priority
    const rightPriority = right.priority
    return leftPriority - rightPriority || left.item.id.localeCompare(right.item.id)
  })

  const availableSlots = Math.max(0, DREAMER_MAX_ITEMS - carry.length)
  const selected = selectedCandidates.slice(0, availableSlots)
  const omitted = selectedCandidates.length - selected.length
  if (omitted > 0) addCoverage(coverage, 'overflow')
  return {
    items: [...carry, ...selected.map(({ item }) => item)],
    coverage,
    omitted,
  }
}
