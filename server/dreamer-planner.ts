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
    ? digest([
        'session',
        session.computerId,
        session.sessionId,
        'source-fingerprint',
        session.fingerprint,
      ])
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
  const status = session.status
  const label = status === 'error'
    ? 'Session needs attention'
    : 'Session is waiting'
  const reason = status === 'error'
    ? 'Journal metadata reports an unresolved error.'
    : 'Journal metadata reports that the session is waiting.'
  return {
    id: `session-${digest([session.computerId, session.sessionId]).slice(0, 32)}`,
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
    id: `memory-${digest([record.id]).slice(0, 32)}`,
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

function carryItem(
  item: DreamerPreviousItem,
  replacement?: DreamerStoredPlanItem,
): DreamerStoredPlanItem {
  return {
    id: replacement?.id ?? item.id,
    label: replacement?.label ?? item.label,
    reason: replacement?.reason ?? item.reason,
    status: 'pending',
    source: 'carry',
    ...(replacement?.computerId || item.computerId
      ? { computerId: replacement?.computerId ?? item.computerId }
      : {}),
    ...(replacement?.sessionId || item.sessionId
      ? { sessionId: replacement?.sessionId ?? item.sessionId }
      : {}),
    ...(replacement?.memoryId || item.memoryId
      ? { memoryId: replacement?.memoryId ?? item.memoryId }
      : {}),
    fingerprint: replacement?.fingerprint ?? item.fingerprint,
  }
}

function carrySessionItem(
  item: DreamerPreviousItem,
  session: DreamerSessionMetadata,
  fingerprint: string,
): DreamerStoredPlanItem {
  const actionable = session.status === 'error' || session.status === 'waiting'
  const carried = carryItem(
    item,
    actionable ? candidateForSession(session, fingerprint) : undefined,
  )
  return {
    ...carried,
    id: `session-${digest([session.computerId, session.sessionId]).slice(0, 32)}`,
    computerId: session.computerId,
    sessionId: session.sessionId,
    fingerprint,
  }
}

function sameSourceIdentity(
  left: DreamerStoredPlanItem,
  right: DreamerStoredPlanItem,
): boolean {
  if (
    left.computerId && left.sessionId &&
    right.computerId && right.sessionId
  ) {
    return left.computerId === right.computerId &&
      left.sessionId === right.sessionId
  }
  if (left.memoryId && right.memoryId) return left.memoryId === right.memoryId
  return false
}

function addCountedCoverage(
  coverage: string[],
  count: number,
  singular: string,
  plural = `${singular}s`,
): void {
  if (count > 0) addCoverage(coverage, `Excluded ${count} ${count === 1 ? singular : plural}.`)
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
  const candidates: Array<{
    item: DreamerStoredPlanItem
    priority: number
  }> = []
  const sessionsByIdentity = new Map<string, DreamerSessionMetadata>()
  let duplicateSessionProposals = 0
  let invalidSessionIdentities = 0
  let removedOrReplacedSessions = 0
  let closedSessions = 0
  let invalidSessionMetadata = 0
  let futureSessions = 0
  let staleSessions = 0
  for (const session of input.sessions) {
    if (!safeIdentifier(session.computerId) || !safeIdentifier(session.sessionId)) {
      addCoverage(coverage, 'invalid-scope')
      invalidSessionIdentities += 1
      continue
    }
    if (session.removedAt || session.replacedBy) {
      addCoverage(coverage, 'removed-or-replaced')
      removedOrReplacedSessions += 1
      continue
    }
    if (session.status === 'closed') {
      addCoverage(coverage, 'closed-metadata')
      closedSessions += 1
      continue
    }
    if (session.status && !(session.status in SESSION_PRIORITY)) {
      addCoverage(coverage, 'invalid-metadata')
      invalidSessionMetadata += 1
      continue
    }
    const seenAt = validTimestamp(session.lastSeenAt)
    if (session.lastSeenAt && seenAt === undefined) {
      addCoverage(coverage, 'invalid-metadata')
      invalidSessionMetadata += 1
      continue
    }
    if (!session.lastSeenAt) addCoverage(coverage, 'journal-metadata-incomplete')
    if (seenAt !== undefined && seenAt > nowMs) {
      addCoverage(coverage, 'future-metadata')
      futureSessions += 1
      continue
    }
    if (seenAt !== undefined && nowMs - seenAt > staleAfterMs) {
      addCoverage(coverage, 'stale-metadata')
      staleSessions += 1
      continue
    }
    const identity = sessionIdentityKey(session.computerId, session.sessionId)
    const existing = sessionsByIdentity.get(identity)
    if (!existing) {
      sessionsByIdentity.set(identity, session)
      continue
    }
    duplicateSessionProposals += 1
    const existingPriority = SESSION_PRIORITY[existing.status ?? 'idle'] ?? 98
    const nextPriority = SESSION_PRIORITY[session.status ?? 'idle'] ?? 98
    const existingSeenAt = validTimestamp(existing.lastSeenAt) ?? 0
    if (nextPriority < existingPriority || (
      nextPriority === existingPriority && (seenAt ?? 0) > existingSeenAt
    )) {
      sessionsByIdentity.set(identity, session)
    }
  }
  addCountedCoverage(
    coverage,
    invalidSessionIdentities,
    'session proposal with invalid identity',
    'session proposals with invalid identity',
  )
  addCountedCoverage(coverage, removedOrReplacedSessions, 'removed or replaced session proposal')
  addCountedCoverage(coverage, closedSessions, 'closed session proposal')
  addCountedCoverage(
    coverage,
    invalidSessionMetadata,
    'session proposal with invalid metadata',
    'session proposals with invalid metadata',
  )
  addCountedCoverage(coverage, futureSessions, 'future-dated session proposal')
  addCountedCoverage(coverage, staleSessions, 'stale session proposal')

  const currentMemoryIds = new Set<string>()
  const currentMemoryCandidates = new Map<string, {
    item: DreamerStoredPlanItem
    priority: number
    updatedAt: number
  }>()
  let duplicateMemoryProposals = 0
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
      const current = currentMemoryCandidates.get(record.id)
      if (current) {
        duplicateMemoryProposals += 1
        if (current.updatedAt >= updatedAt) continue
      }
      currentMemoryCandidates.set(record.id, {
        item: candidateForMemory(record, fingerprint),
        priority: 4,
        updatedAt,
      })
    }
  }
  candidates.push(
    ...[...currentMemoryCandidates.values()].map(({ item, priority }) => ({ item, priority })),
  )

  const selectedSessionIdentities = new Set<string>()
  const selectedMemoryIds = new Set<string>()
  let invalidPreviousSessionIdentities = 0
  let historicalSessionOrphans = 0
  for (const item of previous?.items ?? []) {
    if (item.status !== 'pending') continue
    const hasComputerId = Boolean(item.computerId)
    const hasSessionId = Boolean(item.sessionId)
    if (
      hasComputerId !== hasSessionId ||
      (item.source === 'session' && (!hasComputerId || !hasSessionId))
    ) {
      invalidPreviousSessionIdentities += 1
      continue
    }
    if (item.computerId && item.sessionId) {
      const identity = sessionIdentityKey(item.computerId, item.sessionId)
      if (selectedSessionIdentities.has(identity)) {
        duplicateSessionProposals += 1
        continue
      }
      const currentSession = sessionsByIdentity.get(identity)
      if (!currentSession) {
        if (input.registryAvailable) historicalSessionOrphans += 1
        else {
          carry.push(carryItem(item))
          selectedSessionIdentities.add(identity)
        }
        continue
      }
      const fingerprint = sessionFingerprint(currentSession)
      selectedSessionIdentities.add(identity)
      sessionsByIdentity.delete(identity)
      if (previousHistory.has(fingerprint)) continue
      if (currentSession.status === 'error' || currentSession.status === 'waiting') {
        duplicateSessionProposals += 1
      }
      carry.push(carrySessionItem(item, currentSession, fingerprint))
      continue
    }
    if (item.memoryId) {
      if (selectedMemoryIds.has(item.memoryId)) {
        duplicateMemoryProposals += 1
        continue
      }
      selectedMemoryIds.add(item.memoryId)
      if (!currentMemoryIds.has(item.memoryId)) {
        addCoverage(coverage, 'memory-reference-stale')
        continue
      }
      const current = currentMemoryCandidates.get(item.memoryId)
      if (current) {
        duplicateMemoryProposals += 1
        carry.push(carryItem(item, current.item))
      }
      continue
    }
    carry.push(carryItem(item))
  }
  let genericSessionMetadata = 0
  for (const session of [...sessionsByIdentity.values()].sort((left, right) => {
    const leftRank = SESSION_PRIORITY[left.status ?? 'idle'] ?? 98
    const rightRank = SESSION_PRIORITY[right.status ?? 'idle'] ?? 98
    return leftRank - rightRank ||
      left.computerId.localeCompare(right.computerId) ||
      left.sessionId.localeCompare(right.sessionId)
  })) {
    if (session.status !== 'error' && session.status !== 'waiting') {
      genericSessionMetadata += 1
      continue
    }
    const fingerprint = sessionFingerprint(session)
    if (previousHistory.has(fingerprint)) continue
    candidates.push({
      item: candidateForSession(session, fingerprint),
      priority: SESSION_PRIORITY[session.status] ?? 98,
    })
  }
  addCountedCoverage(
    coverage,
    genericSessionMetadata,
    'generic open-session metadata entry without an actionable source',
    'generic open-session metadata entries without an actionable source',
  )
  addCountedCoverage(
    coverage,
    historicalSessionOrphans,
    'historical session orphan',
    'historical session orphans',
  )
  addCountedCoverage(
    coverage,
    duplicateSessionProposals,
    'duplicate session proposal',
  )
  addCountedCoverage(
    coverage,
    duplicateMemoryProposals,
    'duplicate memory proposal',
  )
  addCountedCoverage(
    coverage,
    invalidPreviousSessionIdentities,
    'legacy session proposal with partial source identity',
    'legacy session proposals with partial source identity',
  )
  if (carry.length > DREAMER_MAX_ITEMS) throw new DreamerPlannerCapacityError()
  const selectedCandidates = candidates.filter(
    ({ item }) => !carry.some((carried) => sameSourceIdentity(carried, item)),
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
