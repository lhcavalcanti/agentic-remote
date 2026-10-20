import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import {
  mkdir,
  open,
  lstat,
  rename,
  rm,
} from 'node:fs/promises'
import path from 'node:path'
import type { SessionStatus } from '../shared/contracts.js'
import type { SessionOrigin } from './manager-store.js'

export const MANAGER_PROACTIVE_INBOX_MAX_PENDING_EVENTS = 1_000
export const MANAGER_PROACTIVE_INBOX_MAX_SCOPES = 2_000
export const MANAGER_PROACTIVE_INBOX_MAX_EVENT_RECORDS = 10_000
export const MANAGER_PROACTIVE_INBOX_MAX_STORE_BYTES = 16 * 1024 * 1024
export const MANAGER_PROACTIVE_INBOX_MAX_PENDING_READ = 20
export const MANAGER_PROACTIVE_INBOX_TERMINAL_RETENTION_MS =
  7 * 24 * 60 * 60 * 1000

const STATE_VERSION = 1 as const
const STATE_FILE_NAME = 'manager-proactive-inbox.json'
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~+=:@-]{0,127}$/
const EVENT_KINDS = ['failed', 'finished'] as const
const DISPOSITIONS = [
  'handled',
  'irrelevant',
  'superseded',
  'expired',
] as const

export type ManagerProactiveInboxEventKind = (typeof EVENT_KINDS)[number]
export type ManagerProactiveInboxDisposition = (typeof DISPOSITIONS)[number]

export interface ManagerProactiveInboxObservation {
  computerId: string
  computerGeneration: string
  sessionId: string
  revision: number
  origin: SessionOrigin
  status: SessionStatus
  queuedCount: number
  hasPendingRequest: boolean
  isOpen: boolean
  suspended: boolean
  recovering: boolean
}

export interface ManagerProactiveInboxEvent {
  id: string
  namespaceId: string
  hubId: string
  computerId: string
  computerGeneration: string
  sessionId: string
  taskGeneration: number
  kind: ManagerProactiveInboxEventKind
  revision: number
  createdAt: string
  sequence: number
}

export type ManagerProactiveInboxObserveResult =
  | {
      outcome: 'disabled' | 'ignored'
      reason: 'disabled' | 'ineligible-origin' | 'stale-revision'
      taskGeneration?: number
    }
  | {
      outcome: 'baseline' | 'observed'
      taskGeneration: number
    }
  | {
      outcome: 'admitted'
      taskGeneration: number
      event: ManagerProactiveInboxEvent
    }

export interface ManagerProactiveInboxBindResult {
  changed: boolean
  computerId: string
  generation: string
  supersededCount: number
}

export interface ManagerProactiveInboxAcknowledgeResult {
  acknowledged: number
  idempotent: boolean
}

export interface ManagerProactiveInboxPruneResult {
  pruned: number
}

export interface ManagerProactiveInboxOptions {
  hubId: string
  enabled?: boolean
  now?: () => Date
  maxPendingEvents?: number
  maxCursorsAndBindings?: number
  maxEventRecords?: number
  maxStateBytes?: number
  terminalEventRetentionMs?: number
  syncDirectory?: () => Promise<void>
  randomUUID?: () => string
}

export class ManagerProactiveInboxError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = 'ManagerProactiveInboxError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class ManagerProactiveInboxValidationError extends ManagerProactiveInboxError {
  constructor(message = 'The proactive inbox input is invalid.') {
    super(message, 400, 'INVALID_INPUT')
    this.name = 'ManagerProactiveInboxValidationError'
  }
}

export class ManagerProactiveInboxScopeError extends ManagerProactiveInboxError {
  constructor(message = 'The proactive inbox scope is not current.') {
    super(message, 409, 'STALE_SCOPE')
    this.name = 'ManagerProactiveInboxScopeError'
  }
}

export class ManagerProactiveInboxReferenceError extends ManagerProactiveInboxError {
  constructor(message = 'The proactive inbox event reference is invalid.') {
    super(message, 409, 'INVALID_REFERENCE')
    this.name = 'ManagerProactiveInboxReferenceError'
  }
}

export class ManagerProactiveInboxCapacityError extends ManagerProactiveInboxError {
  constructor(message = 'The proactive inbox capacity was reached.') {
    super(message, 507, 'CAPACITY')
    this.name = 'ManagerProactiveInboxCapacityError'
  }
}

export class ManagerProactiveInboxPersistenceError extends ManagerProactiveInboxError {
  constructor(message = 'The proactive inbox could not commit its state.') {
    super(message, 503, 'PERSISTENCE_FAILURE')
    this.name = 'ManagerProactiveInboxPersistenceError'
  }
}

export class ManagerProactiveInboxRecoveryError extends ManagerProactiveInboxError {
  constructor(message = 'The proactive inbox state is unavailable.') {
    super(message, 503, 'RECOVERY_FAILURE')
    this.name = 'ManagerProactiveInboxRecoveryError'
  }
}

interface PersistedBinding {
  computerId: string
  generation: string
  boundAt: string
}

interface PersistedCursor {
  namespaceId: string
  computerId: string
  computerGeneration: string
  sessionId: string
  revision: number
  taskGeneration: number
  active: boolean
  lastStatus: SessionStatus
  queuedCount: number
  hasPendingRequest: boolean
  isOpen: boolean
  suspended: boolean
  recovering: boolean
  observedAt: string
}

interface PersistedEvent {
  id: string
  namespaceId: string
  hubId: string
  computerId: string
  computerGeneration: string
  sessionId: string
  taskGeneration: number
  kind: ManagerProactiveInboxEventKind
  revision: number
  createdAt: string
  sequence: number
  lifecycle: 'pending' | 'terminal'
  disposition?: ManagerProactiveInboxDisposition
  acknowledgedAt?: string
}

interface PersistedState {
  version: typeof STATE_VERSION
  hubId: string
  bindings: PersistedBinding[]
  cursors: PersistedCursor[]
  events: PersistedEvent[]
  nextEventSequence: number
}

interface Mutation<T> {
  changed: boolean
  value: T
}

type RecordLike = Record<string, unknown>

function isRecord(value: unknown): value is RecordLike {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(value: RecordLike, keys: readonly string[]): boolean {
  const actual = Object.keys(value)
  return actual.length === keys.length && keys.every((key) => actual.includes(key))
}

function assertExactKeys(
  value: unknown,
  keys: readonly string[],
): asserts value is RecordLike {
  if (!isRecord(value) || !hasExactKeys(value, keys)) {
    throw new Error('unsupported state shape')
  }
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && ID_PATTERN.test(value)
}

function requireId(value: unknown, label: string): string {
  if (!isId(value)) {
    throw new ManagerProactiveInboxValidationError(
      `The proactive inbox ${label} is invalid.`,
    )
  }
  return value
}

function isStatus(value: unknown): value is SessionStatus {
  return value === 'idle' ||
    value === 'running' ||
    value === 'waiting' ||
    value === 'error'
}

function isOrigin(value: unknown): value is SessionOrigin {
  return value === 'manager' || value === 'user' || value === 'discovered'
}

function isEventKind(value: unknown): value is ManagerProactiveInboxEventKind {
  return value === 'failed' || value === 'finished'
}

function isDisposition(
  value: unknown,
): value is ManagerProactiveInboxDisposition {
  return value === 'handled' ||
    value === 'irrelevant' ||
    value === 'superseded' ||
    value === 'expired'
}

function isSafeCounter(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function isPositiveSafeCounter(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0
}

function isTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    return new Date(value).toISOString() === value
  } catch {
    return false
  }
}

function nowIso(now: () => Date): string {
  const value = now()
  if (!(value instanceof Date) || Number.isNaN(value.valueOf())) {
    throw new ManagerProactiveInboxPersistenceError(
      'The proactive inbox clock returned an invalid time.',
    )
  }
  return value.toISOString()
}

function canonicalHash(tuple: readonly unknown[]): string {
  return createHash('sha256')
    .update(JSON.stringify(tuple))
    .digest('hex')
}

function namespaceId(
  hubId: string,
  computerId: string,
  computerGeneration: string,
  sessionId: string,
): string {
  return canonicalHash([
    'oracle-proactive-inbox-namespace',
    hubId,
    computerId,
    computerGeneration,
    sessionId,
  ])
}

function eventId(
  hubId: string,
  computerId: string,
  computerGeneration: string,
  sessionId: string,
  taskGeneration: number,
  kind: ManagerProactiveInboxEventKind,
): string {
  return canonicalHash([
    'oracle-proactive-inbox-event',
    hubId,
    computerId,
    computerGeneration,
    sessionId,
    taskGeneration,
    kind,
  ])
}

function emptyState(hubId: string): PersistedState {
  return {
    version: STATE_VERSION,
    hubId,
    bindings: [],
    cursors: [],
    events: [],
    nextEventSequence: 1,
  }
}

function cloneState(state: PersistedState): PersistedState {
  return structuredClone(state)
}

function publicEvent(event: PersistedEvent): ManagerProactiveInboxEvent {
  return {
    id: event.id,
    namespaceId: event.namespaceId,
    hubId: event.hubId,
    computerId: event.computerId,
    computerGeneration: event.computerGeneration,
    sessionId: event.sessionId,
    taskGeneration: event.taskGeneration,
    kind: event.kind,
    revision: event.revision,
    createdAt: event.createdAt,
    sequence: event.sequence,
  }
}

function validatePersistedState(
  value: unknown,
  limits: {
    maxPendingEvents: number
    maxCursorsAndBindings: number
    maxEventRecords: number
  },
  expectedHubId: string,
): PersistedState {
  assertExactKeys(value, [
    'version',
    'hubId',
    'bindings',
    'cursors',
    'events',
    'nextEventSequence',
  ])
  if (
    value.version !== STATE_VERSION ||
    !isId(value.hubId) ||
    value.hubId !== expectedHubId ||
    !Array.isArray(value.bindings) ||
    !Array.isArray(value.cursors) ||
    !Array.isArray(value.events) ||
    !isPositiveSafeCounter(value.nextEventSequence)
  ) {
    throw new Error('unsupported state header')
  }
  if (
    value.bindings.length + value.cursors.length >
    limits.maxCursorsAndBindings
  ) {
    throw new Error('state scope capacity exceeded')
  }
  if (value.events.length > limits.maxEventRecords) {
    throw new Error('state event capacity exceeded')
  }

  const bindings: PersistedBinding[] = []
  const bindingByComputer = new Map<string, PersistedBinding>()
  for (const rawBinding of value.bindings) {
    assertExactKeys(rawBinding, ['computerId', 'generation', 'boundAt'])
    const binding: PersistedBinding = {
      computerId: requireId(rawBinding.computerId, 'computer ID'),
      generation: requireId(rawBinding.generation, 'computer generation'),
      boundAt: rawBinding.boundAt as string,
    }
    if (
      !isTimestamp(binding.boundAt) ||
      bindingByComputer.has(binding.computerId)
    ) {
      throw new Error('unsupported binding')
    }
    bindings.push(binding)
    bindingByComputer.set(binding.computerId, binding)
  }

  const cursors: PersistedCursor[] = []
  const cursorIds = new Set<string>()
  for (const rawCursor of value.cursors) {
    assertExactKeys(rawCursor, [
      'namespaceId',
      'computerId',
      'computerGeneration',
      'sessionId',
      'revision',
      'taskGeneration',
      'active',
      'lastStatus',
      'queuedCount',
      'hasPendingRequest',
      'isOpen',
      'suspended',
      'recovering',
      'observedAt',
    ])
    if (
      typeof rawCursor.namespaceId !== 'string' ||
      !/^[a-f0-9]{64}$/.test(rawCursor.namespaceId) ||
      !isId(rawCursor.computerId) ||
      !isId(rawCursor.computerGeneration) ||
      !isId(rawCursor.sessionId) ||
      !isPositiveSafeCounter(rawCursor.revision) &&
        rawCursor.revision !== 0 ||
      !isSafeCounter(rawCursor.taskGeneration) ||
      typeof rawCursor.active !== 'boolean' ||
      !isStatus(rawCursor.lastStatus) ||
      !isSafeCounter(rawCursor.queuedCount) ||
      typeof rawCursor.hasPendingRequest !== 'boolean' ||
      typeof rawCursor.isOpen !== 'boolean' ||
      typeof rawCursor.suspended !== 'boolean' ||
      typeof rawCursor.recovering !== 'boolean' ||
      !isTimestamp(rawCursor.observedAt)
    ) {
      throw new Error('unsupported cursor')
    }
    const cursor = rawCursor as unknown as PersistedCursor
    if (
      cursor.namespaceId !== namespaceId(
        expectedHubId,
        cursor.computerId,
        cursor.computerGeneration,
        cursor.sessionId,
      ) ||
      cursorIds.has(cursor.namespaceId) ||
      bindingByComputer.get(cursor.computerId)?.generation !==
        cursor.computerGeneration ||
      (cursor.active && cursor.taskGeneration === 0)
    ) {
      throw new Error('unsupported cursor namespace')
    }
    cursorIds.add(cursor.namespaceId)
    cursors.push(cursor)
  }

  const events: PersistedEvent[] = []
  const eventIds = new Set<string>()
  const eventSequences = new Set<number>()
  let pendingCount = 0
  for (const rawEvent of value.events) {
    if (!isRecord(rawEvent)) throw new Error('unsupported event')
    const baseKeys = [
      'id',
      'namespaceId',
      'hubId',
      'computerId',
      'computerGeneration',
      'sessionId',
      'taskGeneration',
      'kind',
      'revision',
      'createdAt',
      'sequence',
      'lifecycle',
    ]
    if (
      rawEvent.lifecycle === 'pending' &&
      !hasExactKeys(rawEvent, baseKeys)
    ) {
      throw new Error('unsupported pending event')
    }
    if (
      rawEvent.lifecycle === 'terminal' &&
      !hasExactKeys(rawEvent, [
        ...baseKeys,
        'disposition',
        'acknowledgedAt',
      ])
    ) {
      throw new Error('unsupported terminal event')
    }
    if (
      typeof rawEvent.id !== 'string' ||
      !/^[a-f0-9]{64}$/.test(rawEvent.id) ||
      typeof rawEvent.namespaceId !== 'string' ||
      !/^[a-f0-9]{64}$/.test(rawEvent.namespaceId) ||
      rawEvent.hubId !== expectedHubId ||
      !isId(rawEvent.computerId) ||
      !isId(rawEvent.computerGeneration) ||
      !isId(rawEvent.sessionId) ||
      !isPositiveSafeCounter(rawEvent.taskGeneration) ||
      !isEventKind(rawEvent.kind) ||
      (!isSafeCounter(rawEvent.revision) ||
        (rawEvent.revision as number) < 0) ||
      !isTimestamp(rawEvent.createdAt) ||
      !isPositiveSafeCounter(rawEvent.sequence) ||
      (rawEvent.lifecycle !== 'pending' &&
        rawEvent.lifecycle !== 'terminal') ||
      (rawEvent.lifecycle === 'terminal' &&
        (!isDisposition(rawEvent.disposition) ||
          !isTimestamp(rawEvent.acknowledgedAt)))
    ) {
      throw new Error('unsupported event')
    }
    const event = rawEvent as unknown as PersistedEvent
    if (
      event.namespaceId !== namespaceId(
        expectedHubId,
        event.computerId,
        event.computerGeneration,
        event.sessionId,
      ) ||
      event.id !== eventId(
        expectedHubId,
        event.computerId,
        event.computerGeneration,
        event.sessionId,
        event.taskGeneration,
        event.kind,
      ) ||
      eventIds.has(event.id) ||
      eventSequences.has(event.sequence)
    ) {
      throw new Error('unsupported event identity')
    }
    eventIds.add(event.id)
    eventSequences.add(event.sequence)
    if (event.lifecycle === 'pending') pendingCount += 1
    events.push(event)
  }
  if (pendingCount > limits.maxPendingEvents) {
    throw new Error('state pending capacity exceeded')
  }
  const highestSequence = events.reduce(
    (highest, event) => Math.max(highest, event.sequence),
    0,
  )
  if (value.nextEventSequence <= highestSequence) {
    throw new Error('unsupported event sequence')
  }

  return {
    version: STATE_VERSION,
    hubId: expectedHubId,
    bindings,
    cursors,
    events,
    nextEventSequence: value.nextEventSequence,
  }
}

function validateObservation(
  value: unknown,
): ManagerProactiveInboxObservation {
  assertExactKeys(value, [
    'computerId',
    'computerGeneration',
    'sessionId',
    'revision',
    'origin',
    'status',
    'queuedCount',
    'hasPendingRequest',
    'isOpen',
    'suspended',
    'recovering',
  ])
  if (
    !isId(value.computerId) ||
    !isId(value.computerGeneration) ||
    !isId(value.sessionId) ||
    !isSafeCounter(value.revision) ||
    !isOrigin(value.origin) ||
    !isStatus(value.status) ||
    !isSafeCounter(value.queuedCount) ||
    typeof value.hasPendingRequest !== 'boolean' ||
    typeof value.isOpen !== 'boolean' ||
    typeof value.suspended !== 'boolean' ||
    typeof value.recovering !== 'boolean'
  ) {
    throw new ManagerProactiveInboxValidationError(
      'The proactive inbox observation is invalid.',
    )
  }
  return value as unknown as ManagerProactiveInboxObservation
}

function validateLimit(limit: number): void {
  if (
    !Number.isSafeInteger(limit) ||
    limit <= 0 ||
    limit > MANAGER_PROACTIVE_INBOX_MAX_PENDING_READ
  ) {
    throw new ManagerProactiveInboxValidationError(
      'The proactive inbox pending limit is invalid.',
    )
  }
}

function validateOptions(
  options: ManagerProactiveInboxOptions,
): {
  enabled: boolean
  maxPendingEvents: number
  maxCursorsAndBindings: number
  maxEventRecords: number
  maxStateBytes: number
  terminalEventRetentionMs: number
} {
  if (typeof options.enabled !== 'undefined' && typeof options.enabled !== 'boolean') {
    throw new ManagerProactiveInboxValidationError(
      'The proactive inbox enabled option is invalid.',
    )
  }
  const bounded = (
    value: number | undefined,
    fallback: number,
    maximum: number,
    label: string,
  ): number => {
    const resolved = value ?? fallback
    if (
      !Number.isSafeInteger(resolved) ||
      resolved <= 0 ||
      resolved > maximum
    ) {
      throw new ManagerProactiveInboxValidationError(
        `The proactive inbox ${label} limit is invalid.`,
      )
    }
    return resolved
  }
  return {
    enabled: options.enabled ?? false,
    maxPendingEvents: bounded(
      options.maxPendingEvents,
      MANAGER_PROACTIVE_INBOX_MAX_PENDING_EVENTS,
      MANAGER_PROACTIVE_INBOX_MAX_PENDING_EVENTS,
      'pending event',
    ),
    maxCursorsAndBindings: bounded(
      options.maxCursorsAndBindings,
      MANAGER_PROACTIVE_INBOX_MAX_SCOPES,
      MANAGER_PROACTIVE_INBOX_MAX_SCOPES,
      'scope',
    ),
    maxEventRecords: bounded(
      options.maxEventRecords,
      MANAGER_PROACTIVE_INBOX_MAX_EVENT_RECORDS,
      MANAGER_PROACTIVE_INBOX_MAX_EVENT_RECORDS,
      'event record',
    ),
    maxStateBytes: bounded(
      options.maxStateBytes,
      MANAGER_PROACTIVE_INBOX_MAX_STORE_BYTES,
      MANAGER_PROACTIVE_INBOX_MAX_STORE_BYTES,
      'state',
    ),
    terminalEventRetentionMs: bounded(
      options.terminalEventRetentionMs,
      MANAGER_PROACTIVE_INBOX_TERMINAL_RETENTION_MS,
      MANAGER_PROACTIVE_INBOX_TERMINAL_RETENTION_MS,
      'terminal retention',
    ),
  }
}

function isMissing(error: unknown): boolean {
  return isRecord(error) && error.code === 'ENOENT'
}

export class ManagerProactiveInbox {
  private readonly statePath: string
  private readonly enabled: boolean
  private readonly now: () => Date
  private readonly limits: ReturnType<typeof validateOptions>
  private readonly injectedDirectorySync?: () => Promise<void>
  private readonly nextId: () => string
  private state: PersistedState
  private serialized: string | null = null
  private commits: Promise<void> = Promise.resolve()
  private initialized = false
  private failure?: ManagerProactiveInboxRecoveryError

  constructor(
    private readonly directory: string,
    options: ManagerProactiveInboxOptions,
  ) {
    if (!isRecord(options)) {
      throw new ManagerProactiveInboxValidationError(
        'The proactive inbox options are invalid.',
      )
    }
    const hubId = requireId(options.hubId, 'hub ID')
    this.limits = validateOptions(options)
    if (options.now !== undefined && typeof options.now !== 'function') {
      throw new ManagerProactiveInboxValidationError(
        'The proactive inbox clock is invalid.',
      )
    }
    if (
      options.syncDirectory !== undefined &&
      typeof options.syncDirectory !== 'function'
    ) {
      throw new ManagerProactiveInboxValidationError(
        'The proactive inbox directory synchronizer is invalid.',
      )
    }
    if (
      options.randomUUID !== undefined &&
      typeof options.randomUUID !== 'function'
    ) {
      throw new ManagerProactiveInboxValidationError(
        'The proactive inbox temporary-name generator is invalid.',
      )
    }
    this.enabled = this.limits.enabled
    this.now = options.now ?? (() => new Date())
    this.statePath = path.join(directory, STATE_FILE_NAME)
    this.injectedDirectorySync = options.syncDirectory
    this.nextId = options.randomUUID ?? randomUUID
    this.state = emptyState(hubId)
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.requireAvailable()
      return
    }
    if (!this.enabled) {
      this.initialized = true
      return
    }
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      const directoryMetadata = await lstat(this.directory)
      if (
        directoryMetadata.isSymbolicLink() ||
        !directoryMetadata.isDirectory()
      ) {
        throw new Error('inbox directory is not a regular directory')
      }

      let serialized: string
      try {
        serialized = await this.readStateFile()
      } catch (error) {
        if (isMissing(error)) {
          this.initialized = true
          return
        }
        if (error instanceof ManagerProactiveInboxRecoveryError) {
          throw error
        }
        throw new Error('inbox state could not be read')
      }
      let loaded: PersistedState
      try {
        loaded = validatePersistedState(
          JSON.parse(serialized) as unknown,
          this.limits,
          this.state.hubId,
        )
      } catch {
        throw new ManagerProactiveInboxRecoveryError(
          'The proactive inbox state is corrupt or unsupported; no files were changed.',
        )
      }
      this.state = loaded
      this.serialized = JSON.stringify(loaded)
      this.initialized = true
    } catch (error) {
      if (error instanceof ManagerProactiveInboxError) throw error
      throw new ManagerProactiveInboxRecoveryError(
        'The proactive inbox could not initialize; no files were changed.',
      )
    }
  }

  async bindComputer(
    computerId: string,
    generation: string,
  ): Promise<ManagerProactiveInboxBindResult> {
    const validComputerId = requireId(computerId, 'computer ID')
    const validGeneration = requireId(generation, 'computer generation')
    this.requireInitialized()
    if (!this.enabled) {
      return {
        changed: false,
        computerId: validComputerId,
        generation: validGeneration,
        supersededCount: 0,
      }
    }
    return this.commit<ManagerProactiveInboxBindResult>((candidate) => {
      const current = candidate.bindings.find(
        (binding) => binding.computerId === validComputerId,
      )
      if (current?.generation === validGeneration) {
        return {
          changed: false,
          value: {
            changed: false,
            computerId: validComputerId,
            generation: validGeneration,
            supersededCount: 0,
          },
        }
      }
      const retainedCursors = candidate.cursors.filter(
        (cursor) =>
          cursor.computerId !== validComputerId ||
          cursor.computerGeneration === validGeneration,
      )
      const bindingCount = candidate.bindings.length
      const nextBindingCount = current ? bindingCount : bindingCount + 1
      if (nextBindingCount + retainedCursors.length > this.limits.maxCursorsAndBindings) {
        throw new ManagerProactiveInboxCapacityError(
          'The proactive inbox scope capacity was reached.',
        )
      }
      const boundAt = nowIso(this.now)
      let supersededCount = 0
      for (const event of candidate.events) {
        if (
          event.computerId === validComputerId &&
          event.computerGeneration !== validGeneration &&
          event.lifecycle === 'pending'
        ) {
          event.lifecycle = 'terminal'
          event.disposition = 'superseded'
          event.acknowledgedAt = boundAt
          supersededCount += 1
        }
      }
      candidate.cursors = retainedCursors
      if (current) {
        current.generation = validGeneration
        current.boundAt = boundAt
      } else {
        candidate.bindings.push({
          computerId: validComputerId,
          generation: validGeneration,
          boundAt,
        })
      }
      return {
        changed: true,
        value: {
          changed: true,
          computerId: validComputerId,
          generation: validGeneration,
          supersededCount,
        },
      }
    })
  }

  observe(
    value: unknown,
  ): Promise<ManagerProactiveInboxObserveResult> {
    const observation = validateObservation(value)
    this.requireInitialized()
    if (!this.enabled) {
      return Promise.resolve({
        outcome: 'disabled',
        reason: 'disabled',
      })
    }
    return this.commit<ManagerProactiveInboxObserveResult>((candidate) => {
      const binding = candidate.bindings.find(
        (item) => item.computerId === observation.computerId,
      )
      if (!binding || binding.generation !== observation.computerGeneration) {
        throw new ManagerProactiveInboxScopeError()
      }
      if (observation.origin !== 'manager') {
        return {
          changed: false,
          value: {
            outcome: 'ignored',
            reason: 'ineligible-origin',
          },
        }
      }

      const currentNamespaceId = namespaceId(
        candidate.hubId,
        observation.computerId,
        observation.computerGeneration,
        observation.sessionId,
      )
      const current = candidate.cursors.find(
        (cursor) => cursor.namespaceId === currentNamespaceId,
      )
      if (current && observation.revision <= current.revision) {
        return {
          changed: false,
          value: {
            outcome: 'ignored',
            reason: 'stale-revision',
            taskGeneration: current.taskGeneration,
          },
        }
      }

      const observedAt = nowIso(this.now)
      if (!current) {
        if (
          candidate.bindings.length + candidate.cursors.length >=
          this.limits.maxCursorsAndBindings
        ) {
          throw new ManagerProactiveInboxCapacityError(
            'The proactive inbox scope capacity was reached.',
          )
        }
        const taskGeneration = observation.status === 'running' ? 1 : 0
        candidate.cursors.push({
          namespaceId: currentNamespaceId,
          computerId: observation.computerId,
          computerGeneration: observation.computerGeneration,
          sessionId: observation.sessionId,
          revision: observation.revision,
          taskGeneration,
          active: observation.status === 'running',
          lastStatus: observation.status,
          queuedCount: observation.queuedCount,
          hasPendingRequest: observation.hasPendingRequest,
          isOpen: observation.isOpen,
          suspended: observation.suspended,
          recovering: observation.recovering,
          observedAt,
        })
        return {
          changed: true,
          value: {
            outcome: 'baseline',
            taskGeneration,
          },
        }
      }

      let taskGeneration = current.taskGeneration
      let active = current.active
      if (observation.status === 'running' && !active) {
        if (taskGeneration === Number.MAX_SAFE_INTEGER) {
          throw new ManagerProactiveInboxCapacityError(
            'The proactive inbox task generation capacity was reached.',
          )
        }
        taskGeneration += 1
        active = true
      }

      let admitted: PersistedEvent | undefined
      if (active && observation.status === 'error') {
        admitted = this.createEvent(
          candidate,
          observation,
          taskGeneration,
          'failed',
          observedAt,
        )
        active = false
      } else if (
        active &&
        observation.status === 'idle' &&
        observation.isOpen &&
        !observation.suspended &&
        !observation.recovering &&
        !observation.hasPendingRequest &&
        observation.queuedCount === 0
      ) {
        admitted = this.createEvent(
          candidate,
          observation,
          taskGeneration,
          'finished',
          observedAt,
        )
        active = false
      }

      current.revision = observation.revision
      current.taskGeneration = taskGeneration
      current.active = active
      current.lastStatus = observation.status
      current.queuedCount = observation.queuedCount
      current.hasPendingRequest = observation.hasPendingRequest
      current.isOpen = observation.isOpen
      current.suspended = observation.suspended
      current.recovering = observation.recovering
      current.observedAt = observedAt

      if (admitted) {
        return {
          changed: true,
          value: {
            outcome: 'admitted',
            taskGeneration,
            event: publicEvent(admitted),
          },
        }
      }
      return {
        changed: true,
        value: {
          outcome: 'observed',
          taskGeneration,
        },
      }
    })
  }

  pending(limit = MANAGER_PROACTIVE_INBOX_MAX_PENDING_READ): ManagerProactiveInboxEvent[] {
    validateLimit(limit)
    this.requireInitialized()
    if (!this.enabled) return []
    const events = this.state.events
      .filter((event) => event.lifecycle === 'pending')
      .sort((left, right) => {
        const priority = (event: PersistedEvent): number =>
          event.kind === 'failed' ? 0 : 1
        return priority(left) - priority(right) ||
          left.createdAt.localeCompare(right.createdAt) ||
          left.sequence - right.sequence
      })
      .slice(0, limit)
      .map(publicEvent)
    return structuredClone(events)
  }

  acknowledge(
    ids: readonly string[],
    disposition: ManagerProactiveInboxDisposition,
  ): Promise<ManagerProactiveInboxAcknowledgeResult> {
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some((id) => typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) ||
      new Set(ids).size !== ids.length ||
      !isDisposition(disposition)
    ) {
      throw new ManagerProactiveInboxValidationError(
        'The proactive inbox acknowledgment is invalid.',
      )
    }
    this.requireInitialized()
    if (!this.enabled) {
      return Promise.resolve({ acknowledged: 0, idempotent: true })
    }
    return this.commit<ManagerProactiveInboxAcknowledgeResult>((candidate) => {
      const events = ids.map((id) => {
        const event = candidate.events.find((item) => item.id === id)
        if (!event) {
          throw new ManagerProactiveInboxReferenceError()
        }
        return event
      })
      for (const event of events) {
        if (
          event.lifecycle === 'terminal' &&
          event.disposition !== disposition
        ) {
          throw new ManagerProactiveInboxReferenceError(
            'The proactive inbox event was already terminal with another disposition.',
          )
        }
      }
      const pending = events.filter((event) => event.lifecycle === 'pending')
      if (pending.length === 0) {
        return {
          changed: false,
          value: { acknowledged: 0, idempotent: true },
        }
      }
      const acknowledgedAt = nowIso(this.now)
      for (const event of pending) {
        event.lifecycle = 'terminal'
        event.disposition = disposition
        event.acknowledgedAt = acknowledgedAt
      }
      return {
        changed: true,
        value: {
          acknowledged: pending.length,
          idempotent: false,
        },
      }
    })
  }

  prune(): Promise<ManagerProactiveInboxPruneResult> {
    this.requireInitialized()
    if (!this.enabled) return Promise.resolve({ pruned: 0 })
    return this.commit<ManagerProactiveInboxPruneResult>((candidate) => {
      const cutoff = this.now().valueOf() - this.limits.terminalEventRetentionMs
      if (!Number.isFinite(cutoff)) {
        throw new ManagerProactiveInboxPersistenceError(
          'The proactive inbox clock returned an invalid time.',
        )
      }
      const retained = candidate.events.filter(
        (event) =>
          event.lifecycle === 'pending' ||
          new Date(event.acknowledgedAt as string).valueOf() >= cutoff,
      )
      const pruned = candidate.events.length - retained.length
      if (pruned === 0) {
        return {
          changed: false,
          value: { pruned: 0 },
        }
      }
      candidate.events = retained
      return {
        changed: true,
        value: { pruned },
      }
    })
  }

  failureReason(): string | undefined {
    return this.failure?.message
  }

  private createEvent(
    candidate: PersistedState,
    observation: ManagerProactiveInboxObservation,
    taskGeneration: number,
    kind: ManagerProactiveInboxEventKind,
    createdAt: string,
  ): PersistedEvent {
    const id = eventId(
      candidate.hubId,
      observation.computerId,
      observation.computerGeneration,
      observation.sessionId,
      taskGeneration,
      kind,
    )
    const repeated = candidate.events.find((event) => event.id === id)
    if (repeated) return repeated
    const pendingCount = candidate.events.filter(
      (event) => event.lifecycle === 'pending',
    ).length
    if (pendingCount >= this.limits.maxPendingEvents) {
      throw new ManagerProactiveInboxCapacityError(
        'The proactive inbox pending event capacity was reached.',
      )
    }
    if (candidate.events.length >= this.limits.maxEventRecords) {
      throw new ManagerProactiveInboxCapacityError(
        'The proactive inbox event record capacity was reached.',
      )
    }
    if (candidate.nextEventSequence === Number.MAX_SAFE_INTEGER) {
      throw new ManagerProactiveInboxCapacityError(
        'The proactive inbox event sequence capacity was reached.',
      )
    }
    const event: PersistedEvent = {
      id,
      namespaceId: namespaceId(
        candidate.hubId,
        observation.computerId,
        observation.computerGeneration,
        observation.sessionId,
      ),
      hubId: candidate.hubId,
      computerId: observation.computerId,
      computerGeneration: observation.computerGeneration,
      sessionId: observation.sessionId,
      taskGeneration,
      kind,
      revision: observation.revision,
      createdAt,
      sequence: candidate.nextEventSequence,
      lifecycle: 'pending',
    }
    candidate.nextEventSequence += 1
    candidate.events.push(event)
    return event
  }

  private requireInitialized(): void {
    if (this.failure) throw this.failure
    if (!this.initialized) {
      throw new ManagerProactiveInboxError(
        'The proactive inbox must be initialized before use.',
        409,
        'NOT_INITIALIZED',
      )
    }
  }

  private requireAvailable(): void {
    if (this.failure) throw this.failure
  }

  private commit<T>(
    mutate: (candidate: PersistedState) => Mutation<T> | Promise<Mutation<T>>,
  ): Promise<T> {
    this.requireInitialized()
    const task = this.commits.then(async () => {
      this.requireInitialized()
      const candidate = cloneState(this.state)
      const mutation = await mutate(candidate)
      if (!mutation.changed) return structuredClone(mutation.value)
      validatePersistedState(
        candidate,
        this.limits,
        this.state.hubId,
      )
      await this.persist(candidate)
      this.state = candidate
      return structuredClone(mutation.value)
    })
    this.commits = task.then(() => undefined, () => undefined)
    return task
  }

  private async persist(candidate: PersistedState): Promise<void> {
    const serialized = JSON.stringify(candidate)
    if (Buffer.byteLength(serialized, 'utf8') > this.limits.maxStateBytes) {
      throw new ManagerProactiveInboxCapacityError(
        'The proactive inbox state size capacity was reached.',
      )
    }
    const pendingPath = `${this.statePath}.${this.nextId()}.pending`
    const previousSerialized = this.serialized
    let primaryPublished = false
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      await this.writeSynced(pendingPath, serialized)
      await rename(pendingPath, this.statePath)
      primaryPublished = true
      await this.syncDirectory()
      this.serialized = serialized
    } catch {
      await rm(pendingPath, { force: true }).catch(() => undefined)
      if (primaryPublished) {
        try {
          await this.restorePrimary(previousSerialized)
        } catch {
          this.failure = new ManagerProactiveInboxRecoveryError(
            'The proactive inbox could not roll back an incomplete publication and is unavailable until the hub restarts.',
          )
          throw this.failure
        }
      }
      throw new ManagerProactiveInboxPersistenceError()
    }
  }

  private async readStateFile(): Promise<string> {
    const metadata = await lstat(this.statePath)
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new Error('inbox state is not a regular file')
    }
    const handle = await open(
      this.statePath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    )
    try {
      const opened = await handle.stat()
      if (
        !opened.isFile() ||
        opened.ino !== metadata.ino ||
        opened.dev !== metadata.dev
      ) {
        throw new Error('inbox state changed while opening')
      }
      if (opened.size > this.limits.maxStateBytes) {
        throw new ManagerProactiveInboxRecoveryError(
          'The proactive inbox state exceeds the supported size; no files were changed.',
        )
      }
      if ((opened.mode & 0o077) !== 0) {
        const uid = process.getuid?.()
        if (uid !== undefined && opened.uid !== uid) {
          throw new ManagerProactiveInboxRecoveryError(
            'The proactive inbox state is accessible to other users and not owned by the hub; no files were changed.',
          )
        }
        await handle.chmod(0o600)
      }
      const buffer = Buffer.alloc(opened.size + 1)
      let length = 0
      for (;;) {
        const { bytesRead } = await handle.read(
          buffer,
          length,
          buffer.length - length,
          length,
        )
        if (bytesRead === 0) break
        length += bytesRead
        if (length > opened.size) {
          throw new ManagerProactiveInboxRecoveryError(
            'The proactive inbox state changed while reading; no files were changed.',
          )
        }
      }
      return buffer.toString('utf8', 0, length)
    } finally {
      await handle.close()
    }
  }

  private async writeSynced(
    filePath: string,
    contents: string,
  ): Promise<void> {
    const handle = await open(filePath, 'wx', 0o600)
    try {
      await handle.writeFile(contents, 'utf8')
      await handle.sync()
    } finally {
      await handle.close()
    }
  }

  private async syncDirectory(): Promise<void> {
    if (this.injectedDirectorySync) {
      await this.injectedDirectorySync()
      return
    }
    const handle = await open(this.directory, 'r')
    try {
      await handle.sync()
    } finally {
      await handle.close()
    }
  }

  private async restorePrimary(serialized: string | null): Promise<void> {
    if (serialized === null) {
      await rm(this.statePath, { force: true })
      await this.syncDirectory()
      return
    }
    const rollbackPath = `${this.statePath}.${this.nextId()}.rollback.pending`
    try {
      await this.writeSynced(rollbackPath, serialized)
      await rename(rollbackPath, this.statePath)
      await this.syncDirectory()
    } catch (error) {
      await rm(rollbackPath, { force: true }).catch(() => undefined)
      throw error
    }
  }
}
