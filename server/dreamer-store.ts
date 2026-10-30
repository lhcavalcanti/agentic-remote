import { constants } from 'node:fs'
import {
  chmod,
  lstat,
  mkdir,
  open,
  readdir,
  rename,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'
import type {
  DreamerPlan,
  DreamerPlanItem,
  DreamerPlanItemStatus,
  DreamerSettings,
} from '../shared/dreamer.js'
import {
  validateDreamerTimeZone,
} from './dreamer-schedule.js'

export const DREAMER_STATE_VERSION = 1
export const DREAMER_MAX_STATE_BYTES = 1_048_576
export const DREAMER_MAX_RUNS = 35
export const DREAMER_MAX_ITEMS = 20
export const DREAMER_LEASE_MS = 10 * 60 * 1000
export const DREAMER_MAX_HISTORY = DREAMER_MAX_RUNS * DREAMER_MAX_ITEMS
export const DREAMER_MAX_ZONES = 16
export const DREAMER_STAGING_PREFIX = 'dreamer.'

export interface DreamerRunRecord {
  key: string
  localDate: string
  timeZone: string
  generation: number
  status: 'claimed' | 'committed' | 'failed'
  attempts: number
  claimToken?: string
  claimedAt?: string
  expiresAt?: string
  retryAt?: string
  committedAt?: string
  planId?: string
}

export interface DreamerZoneFence {
  timeZone: string
  highWaterDate: string
}

export interface DreamerHistoryEntry {
  fingerprint: string
  status: Exclude<DreamerPlanItemStatus, 'pending'>
}

interface DreamerPersistedPlan {
  id: string
  localDate: string
  timeZone: string
  createdAt: string
  items: DreamerPlanItem[]
  coverage: string[]
  omitted: number
  fingerprints: Record<string, string>
}

export type DreamerPlanWithFingerprints = Omit<DreamerPlan, 'items'> & {
  items: Array<DreamerPlanItem & { fingerprint?: string }>
}

export interface DreamerStoreState {
  version: 1
  revision: number
  settings: DreamerSettings & { generation: number }
  plan?: DreamerPersistedPlan
  runs: DreamerRunRecord[]
  zoneFences: DreamerZoneFence[]
  history: DreamerHistoryEntry[]
  lastError?: string
}

export interface DreamerStoreSnapshot {
  revision: number
  settings: DreamerSettings & { generation: number }
  plan?: DreamerPlan
  runs: DreamerRunRecord[]
  zoneFences: DreamerZoneFence[]
  history: DreamerHistoryEntry[]
  lastError?: string
}

export interface DreamerRunClaim {
  key: string
  token: string
  generation: number
  localDate: string
  timeZone: string
  expiresAt: string
}

export type DreamerClaimResult =
  | { kind: 'claimed'; claim: DreamerRunClaim }
  | { kind: 'already-committed' }
  | { kind: 'busy' }
  | { kind: 'attempts-exhausted' }
  | { kind: 'disabled' }
  | { kind: 'stale-generation' }
  | { kind: 'retired' }
  | { kind: 'capacity' }

export interface DreamerStoreOptions {
  now?: () => Date
  randomUUID?: () => string
  syncDirectory?: (directory: string) => Promise<void>
  writeFile?: (
    filePath: string,
    data: string,
    options: { encoding: 'utf8'; flag: 'wx'; mode: number },
  ) => Promise<void>
}

export class DreamerRecoveryError extends Error {
  readonly statusCode = 503

  constructor(message = 'Dreamer storage is corrupt or unavailable; no state was reset.') {
    super(message)
    this.name = 'DreamerRecoveryError'
  }
}

export class DreamerPersistenceError extends Error {
  readonly statusCode = 503

  constructor(cause?: unknown) {
    super('Could not save Dreamer state. Restore writable storage and retry.', {
      cause,
    })
    this.name = 'DreamerPersistenceError'
  }
}

export class DreamerConflictError extends Error {
  readonly statusCode = 409

  constructor(message = 'Dreamer state changed; refresh and retry.') {
    super(message)
    this.name = 'DreamerConflictError'
  }
}

export class DreamerCapacityError extends Error {
  readonly statusCode = 507

  constructor(message = 'Dreamer reached its bounded storage capacity; resolve pending items and retry.') {
    super(message)
    this.name = 'DreamerCapacityError'
  }
}

function emptyState(): DreamerStoreState {
  return {
    version: DREAMER_STATE_VERSION,
    revision: 0,
    settings: {
      enabled: false,
      timeZone: 'UTC',
      generation: 0,
    },
    runs: [],
    zoneFences: [],
    history: [],
  }
}

export function dreamerRunKey(timeZone: string, localDate: string): string {
  return `run-${createHash('sha256').update(`${timeZone}\u0000${localDate}`).digest('hex')}`
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT'
}

function isSafeString(value: unknown, max = 4096): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max
}

function isSafeIdentifier(value: unknown): value is string {
  return isSafeString(value, 200) && /^[A-Za-z0-9._:@-]+$/.test(value)
}

function isLocalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
}

function assertInteger(value: unknown, name: string): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new DreamerRecoveryError(`Dreamer state has an invalid ${name}.`)
  }
}

function validatePlan(plan: unknown): DreamerPersistedPlan {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    throw new DreamerRecoveryError('Dreamer state has an invalid plan.')
  }
  const value = plan as Record<string, unknown>
  if (
    !isSafeIdentifier(value.id) ||
    !isLocalDate(value.localDate) ||
    !isSafeString(value.timeZone, 128) ||
    !validateDreamerTimeZone(value.timeZone) ||
    !isSafeString(value.createdAt, 64) ||
    !Number.isSafeInteger(value.omitted) ||
    (value.omitted as number) < 0 ||
    !Array.isArray(value.items) ||
    value.items.length > DREAMER_MAX_ITEMS ||
    !Array.isArray(value.coverage) ||
    value.coverage.length > 32 ||
    !value.coverage.every((entry) => isSafeString(entry, 120)) ||
    !value.fingerprints ||
    typeof value.fingerprints !== 'object' ||
    Array.isArray(value.fingerprints)
  ) {
    throw new DreamerRecoveryError('Dreamer state has an invalid plan.')
  }
  const items = value.items.map((item) => validatePlanItem(item))
  const fingerprints = Object.fromEntries(
    Object.entries(value.fingerprints as Record<string, unknown>)
      .map(([id, fingerprint]) => {
        if (!isSafeIdentifier(id) || !isSafeString(fingerprint, 200)) {
          throw new DreamerRecoveryError('Dreamer state has an invalid plan fingerprint.')
        }
        return [id, fingerprint]
      }),
  )
  if (
    Object.keys(fingerprints).length !== items.length ||
    items.some((item) => fingerprints[item.id] === undefined)
  ) {
    throw new DreamerRecoveryError('Dreamer state plan fingerprints do not match its items.')
  }
  return {
    id: value.id,
    localDate: value.localDate as string,
    timeZone: value.timeZone as string,
    createdAt: value.createdAt as string,
    items,
    coverage: value.coverage as string[],
    omitted: value.omitted as number,
    fingerprints,
  }
}

function validatePlanItem(item: unknown): DreamerPlanItem {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new DreamerRecoveryError('Dreamer state has an invalid plan item.')
  }
  const value = item as Record<string, unknown>
  if (
    !isSafeIdentifier(value.id) ||
    !isSafeString(value.label, 120) ||
    !isSafeString(value.reason, 240) ||
    !['pending', 'skipped', 'done'].includes(String(value.status)) ||
    !['session', 'memory', 'carry'].includes(String(value.source)) ||
    (value.computerId !== undefined && !isSafeIdentifier(value.computerId)) ||
    (value.sessionId !== undefined && !isSafeIdentifier(value.sessionId)) ||
    (value.memoryId !== undefined && !isSafeIdentifier(value.memoryId))
  ) {
    throw new DreamerRecoveryError('Dreamer state has an invalid plan item.')
  }
  return {
    id: value.id,
    label: value.label,
    reason: value.reason,
    status: value.status as DreamerPlanItemStatus,
    source: value.source as DreamerPlanItem['source'],
    ...(value.computerId ? { computerId: value.computerId as string } : {}),
    ...(value.sessionId ? { sessionId: value.sessionId as string } : {}),
    ...(value.memoryId ? { memoryId: value.memoryId as string } : {}),
  }
}

function validateState(raw: unknown): DreamerStoreState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new DreamerRecoveryError('Dreamer state is malformed; no state was reset.')
  }
  const value = raw as Record<string, unknown>
  if (value.version !== DREAMER_STATE_VERSION) {
    throw new DreamerRecoveryError('Dreamer state uses an unsupported version; no state was reset.')
  }
  assertInteger(value.revision, 'revision')
  if (!value.settings || typeof value.settings !== 'object' || Array.isArray(value.settings)) {
    throw new DreamerRecoveryError('Dreamer state has invalid settings.')
  }
  const settings = value.settings as Record<string, unknown>
  assertInteger(settings.generation, 'settings generation')
  if (
    typeof settings.enabled !== 'boolean' ||
    !isSafeString(settings.timeZone, 128) ||
    !validateDreamerTimeZone(settings.timeZone)
  ) {
    throw new DreamerRecoveryError('Dreamer state has invalid settings.')
  }
  if (!Array.isArray(value.runs) || value.runs.length > DREAMER_MAX_RUNS) {
    throw new DreamerRecoveryError('Dreamer state has too many run records.')
  }
  if (!Array.isArray(value.zoneFences) || value.zoneFences.length > DREAMER_MAX_ZONES) {
    throw new DreamerRecoveryError('Dreamer state has invalid zone fences.')
  }
  const zoneFences = value.zoneFences.map((fence) => {
    const value = fence as Record<string, unknown>
    if (
      !fence ||
      typeof fence !== 'object' ||
      Array.isArray(fence) ||
      !isSafeString(value.timeZone, 128) ||
      !validateDreamerTimeZone(value.timeZone as string) ||
      !isLocalDate(value.highWaterDate)
    ) {
      throw new DreamerRecoveryError('Dreamer state has invalid zone fences.')
    }
    return {
      timeZone: (fence as Record<string, unknown>).timeZone as string,
      highWaterDate: (fence as Record<string, unknown>).highWaterDate as string,
    }
  })
  if (new Set(zoneFences.map(({ timeZone }) => timeZone)).size !== zoneFences.length) {
    throw new DreamerRecoveryError('Dreamer state has duplicate zone fences.')
  }
  const runs = value.runs.map((run) => {
    if (!run || typeof run !== 'object' || Array.isArray(run)) {
      throw new DreamerRecoveryError('Dreamer state has an invalid run record.')
    }
    const entry = run as Record<string, unknown>
    assertInteger(entry.generation, 'run generation')
    if (
      !isSafeIdentifier(entry.key) ||
      !isLocalDate(entry.localDate) ||
      !isSafeString(entry.timeZone, 128) ||
      !validateDreamerTimeZone(entry.timeZone) ||
      entry.key !== dreamerRunKey(entry.timeZone as string, entry.localDate as string) ||
      !['claimed', 'committed', 'failed'].includes(String(entry.status)) ||
      !Number.isSafeInteger(entry.attempts) ||
      (entry.attempts as number) < 1 ||
      (entry.attempts as number) > 3
    ) {
      throw new DreamerRecoveryError('Dreamer state has an invalid run record.')
    }
    return {
      key: entry.key as string,
      localDate: entry.localDate as string,
      timeZone: entry.timeZone as string,
      generation: entry.generation as number,
      status: entry.status as DreamerRunRecord['status'],
      attempts: entry.attempts as number,
      ...(entry.claimToken ? { claimToken: String(entry.claimToken) } : {}),
      ...(entry.claimedAt ? { claimedAt: String(entry.claimedAt) } : {}),
      ...(entry.expiresAt ? { expiresAt: String(entry.expiresAt) } : {}),
      ...(entry.retryAt ? { retryAt: String(entry.retryAt) } : {}),
      ...(entry.committedAt ? { committedAt: String(entry.committedAt) } : {}),
      ...(entry.planId ? { planId: String(entry.planId) } : {}),
    }
  })
  if (!Array.isArray(value.history) || value.history.length > DREAMER_MAX_HISTORY) {
    throw new DreamerRecoveryError('Dreamer state has too much review history.')
  }
  const history = value.history.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new DreamerRecoveryError('Dreamer state has an invalid review history.')
    }
    const value = entry as Record<string, unknown>
    if (!isSafeString(value.fingerprint, 200) || !['skipped', 'done'].includes(String(value.status))) {
      throw new DreamerRecoveryError('Dreamer state has an invalid review history.')
    }
    return {
      fingerprint: value.fingerprint as string,
      status: value.status as DreamerHistoryEntry['status'],
    }
  })
  if (value.lastError !== undefined && !isSafeString(value.lastError, 240)) {
    throw new DreamerRecoveryError('Dreamer state has an invalid error status.')
  }
  return {
    version: 1,
    revision: value.revision as number,
    settings: {
      enabled: settings.enabled as boolean,
      timeZone: settings.timeZone as string,
      generation: settings.generation as number,
    },
    ...(value.plan === undefined ? {} : { plan: validatePlan(value.plan) }),
    runs,
    zoneFences,
    history,
    ...(value.lastError === undefined ? {} : { lastError: value.lastError as string }),
  }
}

function publicPlan(plan: DreamerPersistedPlan | undefined): DreamerPlan | undefined {
  if (!plan) return undefined
  const { fingerprints: _fingerprints, ...value } = plan
  return clone(value)
}

function toPersistedPlan(
  plan: DreamerPlanWithFingerprints,
): DreamerPersistedPlan {
  const fingerprints: Record<string, string> = {}
  for (const item of plan.items) fingerprints[item.id] = item.fingerprint ?? item.id
  return {
    ...clone(plan),
    items: plan.items.map(({ fingerprint: _fingerprint, ...item }) => item),
    fingerprints,
  }
}

function validatePlanForCommit(
  plan: DreamerPlanWithFingerprints,
): DreamerPersistedPlan {
  if (plan.items.length > DREAMER_MAX_ITEMS) {
    throw new DreamerCapacityError('Dreamer plans may contain at most 20 items.')
  }
  return validatePlan(toPersistedPlan(plan))
}

function terminalRun(run: DreamerRunRecord): boolean {
  return run.status === 'committed' || (run.status === 'failed' && run.attempts >= 3)
}

function sameIds(items: DreamerPlanItem[], order: string[]): boolean {
  if (items.length !== order.length || new Set(order).size !== order.length) return false
  const expected = [...items].map(({ id }) => id).sort()
  return expected.join('\u0000') === [...order].sort().join('\u0000')
}

async function defaultSyncDirectory(directory: string): Promise<void> {
  const handle = await open(directory, constants.O_RDONLY)
  try {
    await handle.sync()
  } finally {
    await handle.close()
  }
}

async function defaultWriteFile(
  filePath: string,
  data: string,
  options: { encoding: 'utf8'; flag: 'wx'; mode: number },
): Promise<void> {
  await writeFile(filePath, data, options)
}

export class DreamerStore {
  private readonly statePath: string
  private readonly now: () => Date
  private readonly nextUUID: () => string
  private readonly syncDirectoryImpl: (directory: string) => Promise<void>
  private readonly writeFileImpl: DreamerStoreOptions['writeFile']
  private state = emptyState()
  private serialized?: string
  private initialized = false
  private initializing?: Promise<void>
  private failure?: DreamerRecoveryError | DreamerPersistenceError
  private commits: Promise<unknown> = Promise.resolve()
  private directoryIdentity?: { dev: number; ino: number }

  constructor(
    private readonly directory: string,
    options: DreamerStoreOptions = {},
  ) {
    this.statePath = path.join(directory, 'dreamer.json')
    this.now = options.now ?? (() => new Date())
    this.nextUUID = options.randomUUID ?? randomUUID
    this.syncDirectoryImpl = options.syncDirectory ?? defaultSyncDirectory
    this.writeFileImpl = options.writeFile ?? defaultWriteFile
  }

  initialize(): Promise<void> {
    if (this.initialized) return Promise.resolve()
    if (this.initializing) return this.initializing
    const operation = this.load()
    this.initializing = operation
    operation.finally(() => {
      if (this.initializing === operation) this.initializing = undefined
    }).catch(() => undefined)
    return operation
  }

  private async load(): Promise<void> {
    this.failure = undefined
    try {
      await this.ensureDirectory()
      await this.cleanStaging()
      let serialized: string
      try {
        serialized = await this.readPrimary()
      } catch (error) {
        if (isMissing(error)) {
          this.state = emptyState()
          this.serialized = undefined
          this.initialized = true
          return
        }
        throw error
      }
      let parsed: DreamerStoreState
      try {
        parsed = validateState(JSON.parse(serialized))
      } catch (error) {
        if (error instanceof DreamerRecoveryError) throw error
        throw new DreamerRecoveryError('Dreamer state is corrupt; no state was reset.')
      }
      this.state = parsed
      this.serialized = serialized
      this.initialized = true
    } catch (error) {
      const failure = error instanceof DreamerRecoveryError
        ? error
        : new DreamerRecoveryError('Dreamer storage is unavailable; no state was reset.')
      this.failure = failure
      throw failure
    }
  }

  snapshot(): DreamerStoreSnapshot {
    this.requireReady()
    return {
      revision: this.state.revision,
      settings: clone(this.state.settings),
      ...(this.state.plan ? { plan: publicPlan(this.state.plan) } : {}),
      runs: clone(this.state.runs),
      zoneFences: clone(this.state.zoneFences),
      history: clone(this.state.history),
      ...(this.state.lastError ? { lastError: this.state.lastError } : {}),
    }
  }

  stateSnapshot(): DreamerStoreState {
    this.requireReady()
    return clone(this.state)
  }

  async updateSettings(
    revision: number,
    settings: DreamerSettings,
  ): Promise<void> {
    const expectedRevision = revision
    const nextSettings = {
      enabled: settings.enabled,
      timeZone: settings.timeZone,
    }
    return this.enqueue((candidate) => {
      this.requireRevision(candidate, expectedRevision)
      if (!validateDreamerTimeZone(nextSettings.timeZone)) {
        throw Object.assign(new Error('Dreamer requires a valid IANA timezone.'), { statusCode: 400 })
      }
      const changed = candidate.settings.enabled !== nextSettings.enabled ||
        candidate.settings.timeZone !== nextSettings.timeZone
      if (!changed) return { result: undefined, changed: false }
      candidate.settings = {
        enabled: nextSettings.enabled,
        timeZone: nextSettings.timeZone,
        generation: candidate.settings.generation + 1,
      }
      return { result: undefined, changed: true }
    })
  }

  async claimRun(input: {
    key: string
    localDate: string
    timeZone: string
    generation: number
  }): Promise<DreamerClaimResult> {
    const claimInput = {
      key: input.key,
      localDate: input.localDate,
      timeZone: input.timeZone,
      generation: input.generation,
    }
    if (
      !isLocalDate(claimInput.localDate) ||
      !validateDreamerTimeZone(claimInput.timeZone) ||
      claimInput.key !== dreamerRunKey(claimInput.timeZone, claimInput.localDate)
    ) {
      throw new DreamerConflictError('Dreamer run key is invalid.')
    }
    return this.enqueue<DreamerClaimResult>((candidate) => {
      if (!candidate.settings.enabled) return { result: { kind: 'disabled' }, changed: false }
      if (
        candidate.settings.generation !== claimInput.generation ||
        candidate.settings.timeZone !== claimInput.timeZone
      ) {
        return { result: { kind: 'stale-generation' }, changed: false }
      }
      const existing = candidate.runs.find(({ key }) => key === claimInput.key)
      if (existing?.status === 'committed') {
        return { result: { kind: 'already-committed' }, changed: false }
      }
      const now = this.now()
      const fence = candidate.zoneFences.find(
        ({ timeZone }) => timeZone === claimInput.timeZone,
      )
      if (fence && claimInput.localDate <= fence.highWaterDate) {
        return { result: { kind: 'retired' }, changed: false }
      }
      if (
        existing?.status === 'claimed' &&
        existing.generation === claimInput.generation &&
        existing.expiresAt &&
        Date.parse(existing.expiresAt) > now.getTime()
      ) {
        return { result: { kind: 'busy' }, changed: false }
      }
      if (
        existing?.status === 'failed' &&
        existing.generation === claimInput.generation &&
        existing.retryAt &&
        Date.parse(existing.retryAt) > now.getTime()
      ) {
        return { result: { kind: 'busy' }, changed: false }
      }
      if (existing && existing.attempts >= 3) {
        const exhaustionError = 'Dreamer exhausted its three attempts for this local day.'
        if (existing.status === 'claimed' && existing.expiresAt &&
          Date.parse(existing.expiresAt) <= now.getTime()) {
          this.advanceZoneFence(candidate, existing.timeZone, existing.localDate)
          existing.status = 'failed'
          delete existing.claimToken
          delete existing.claimedAt
          delete existing.expiresAt
          delete existing.retryAt
          candidate.lastError = exhaustionError
          return { result: { kind: 'attempts-exhausted' }, changed: true }
        }
        const changed = candidate.lastError !== exhaustionError
        candidate.lastError = exhaustionError
        return { result: { kind: 'attempts-exhausted' }, changed }
      }
      if (!existing && candidate.runs.length >= DREAMER_MAX_RUNS) {
        const highWaterByZone = new Map(
          candidate.zoneFences.map(({ timeZone, highWaterDate }) => [timeZone, highWaterDate]),
        )
        candidate.runs = candidate.runs.filter((run) =>
          !terminalRun(run) &&
          run.localDate > (highWaterByZone.get(run.timeZone) ?? ''),
        )
        if (candidate.runs.length >= DREAMER_MAX_RUNS) {
          return { result: { kind: 'capacity' }, changed: false }
        }
      }
      const token = this.nextUUID()
      const expiresAt = new Date(now.getTime() + DREAMER_LEASE_MS).toISOString()
      const run: DreamerRunRecord = {
        key: claimInput.key,
        localDate: claimInput.localDate,
        timeZone: claimInput.timeZone,
        generation: claimInput.generation,
        status: 'claimed',
        attempts: (existing?.attempts ?? 0) + 1,
        claimToken: token,
        claimedAt: now.toISOString(),
        expiresAt,
      }
      if (existing) {
        const index = candidate.runs.indexOf(existing)
        candidate.runs[index] = run
      } else {
        candidate.runs.push(run)
      }
      return {
        result: {
          kind: 'claimed',
          claim: {
            key: claimInput.key,
            token,
            generation: claimInput.generation,
            localDate: claimInput.localDate,
            timeZone: claimInput.timeZone,
            expiresAt,
          },
        },
        changed: true,
      }
    })
  }

  async commitRun(
    claim: DreamerRunClaim,
    plan: DreamerPlanWithFingerprints,
    history: DreamerHistoryEntry[],
  ): Promise<void> {
    const storedClaim = clone(claim)
    const storedPlan = clone(plan)
    const storedHistory = clone(history)
    return this.enqueue((candidate) => {
      const run = this.requireClaim(candidate, storedClaim)
      const persistedPlan = validatePlanForCommit(storedPlan)
      const historyMap = new Map(candidate.history.map((entry) => [entry.fingerprint, entry.status]))
      for (const entry of storedHistory) historyMap.set(entry.fingerprint, entry.status)
      if (historyMap.size > DREAMER_MAX_HISTORY) {
        throw new DreamerCapacityError()
      }
      this.advanceZoneFence(candidate, run.timeZone, run.localDate)
      run.status = 'committed'
      delete run.claimToken
      delete run.claimedAt
      delete run.expiresAt
      delete run.retryAt
      run.committedAt = this.now().toISOString()
      run.planId = persistedPlan.id
      candidate.plan = persistedPlan
      candidate.history = [...historyMap.entries()]
        .map(([fingerprint, status]) => ({ fingerprint, status }))
      delete candidate.lastError
      return { result: undefined, changed: true }
    })
  }

  async failRun(claim: DreamerRunClaim, safeError: string): Promise<void> {
    const storedClaim = clone(claim)
    const boundedError = safeError.slice(0, 240)
    return this.enqueue((candidate) => {
      const run = this.requireClaim(candidate, storedClaim)
      const exhausted = run.attempts >= 3
      if (exhausted) this.advanceZoneFence(candidate, run.timeZone, run.localDate)
      run.status = 'failed'
      delete run.claimToken
      delete run.claimedAt
      delete run.expiresAt
      if (exhausted) {
        delete run.retryAt
        candidate.lastError = 'Dreamer exhausted its three attempts for this local day.'
      } else {
        run.retryAt = new Date(this.now().getTime() + 60_000).toISOString()
        candidate.lastError = boundedError
      }
      return { result: undefined, changed: true }
    })
  }

  async recordError(safeError: string): Promise<void> {
    return this.enqueue((candidate) => {
      const bounded = safeError.slice(0, 240)
      const changed = candidate.lastError !== bounded
      candidate.lastError = bounded
      return { result: undefined, changed }
    })
  }

  async editPlan(
    revision: number,
    planId: string,
    input: { order?: string[]; item?: { id: string; status: DreamerPlanItemStatus } },
  ): Promise<void> {
    const expectedRevision = revision
    const expectedPlanId = planId
    const edit = {
      ...(input.order ? { order: [...input.order] } : {}),
      ...(input.item ? { item: { ...input.item } } : {}),
    }
    return this.enqueue((candidate) => {
      this.requireRevision(candidate, expectedRevision)
      if (!candidate.plan || candidate.plan.id !== expectedPlanId) {
        throw new DreamerConflictError('Dreamer plan changed; refresh and retry.')
      }
      if (!edit.order && !edit.item) {
        throw Object.assign(new Error('Dreamer plan edit is empty.'), { statusCode: 400 })
      }
      if (edit.order && !sameIds(candidate.plan.items, edit.order)) {
        throw new DreamerConflictError('Dreamer reorder must include every plan item exactly once.')
      }
      const next = clone(candidate.plan)
      if (edit.order) {
        const byId = new Map(next.items.map((item) => [item.id, item]))
        next.items = edit.order.map((id) => byId.get(id)!)
      }
      if (edit.item) {
        const item = next.items.find(({ id }) => id === edit.item!.id)
        if (!item) throw new DreamerConflictError('Dreamer plan item changed; refresh and retry.')
        item.status = edit.item.status
        const fingerprint = next.fingerprints[item.id]
        if (!fingerprint) {
          throw new DreamerRecoveryError('Dreamer plan item fingerprint is missing.')
        }
        const history = new Map(candidate.history.map((entry) => [entry.fingerprint, entry.status]))
        if (edit.item.status === 'pending') history.delete(fingerprint)
        else history.set(fingerprint, edit.item.status)
        if (history.size > DREAMER_MAX_HISTORY) throw new DreamerCapacityError()
        candidate.history = [...history.entries()]
          .map(([fingerprint, status]) => ({ fingerprint, status }))
      }
      candidate.plan = next
      return { result: undefined, changed: true }
    })
  }

  private advanceZoneFence(
    candidate: DreamerStoreState,
    timeZone: string,
    localDate: string,
  ): void {
    const fence = candidate.zoneFences.find(({ timeZone: zone }) => zone === timeZone)
    if (fence) {
      if (localDate < fence.highWaterDate) {
        throw new DreamerConflictError('Dreamer run date has been retired.')
      }
      if (localDate > fence.highWaterDate) fence.highWaterDate = localDate
      return
    }
    if (candidate.zoneFences.length >= DREAMER_MAX_ZONES) {
      throw new DreamerCapacityError('Dreamer reached its timezone fence capacity.')
    }
    candidate.zoneFences.push({ timeZone, highWaterDate: localDate })
  }

  private requireRevision(candidate: DreamerStoreState, revision: number): void {
    if (revision !== candidate.revision) {
      throw new DreamerConflictError('Dreamer revision is stale; refresh and retry.')
    }
  }

  private requireClaim(
    candidate: DreamerStoreState,
    claim: DreamerRunClaim,
  ): DreamerRunRecord {
    if (!candidate.settings.enabled || candidate.settings.generation !== claim.generation) {
      throw new DreamerConflictError('Dreamer run is no longer active.')
    }
    const run = candidate.runs.find(({ key }) => key === claim.key)
    if (
      !run ||
      run.status !== 'claimed' ||
      run.claimToken !== claim.token ||
      run.generation !== claim.generation ||
      run.localDate !== claim.localDate ||
      run.timeZone !== claim.timeZone ||
      (run.expiresAt ? Date.parse(run.expiresAt) <= this.now().getTime() : true)
    ) {
      throw new DreamerConflictError('Dreamer run lease is stale.')
    }
    return run
  }

  private requireReady(): void {
    if (!this.initialized) throw new DreamerRecoveryError('Dreamer storage is not initialized.')
    if (this.failure) throw this.failure
  }

  private enqueue<T>(
    operation: (
      candidate: DreamerStoreState,
    ) => { result: T; changed: boolean },
  ): Promise<T> {
    const run = this.commits.then(async () => {
      this.requireReady()
      const candidate = clone(this.state)
      const outcome = operation(candidate)
      if (!outcome.changed) return outcome.result
      candidate.revision += 1
      const serialized = await this.persist(candidate)
      this.state = candidate
      this.serialized = serialized
      return outcome.result
    })
    this.commits = run.then(() => undefined, () => undefined)
    return run
  }

  private async persist(candidate: DreamerStoreState): Promise<string> {
    const serialized = JSON.stringify(candidate)
    if (Buffer.byteLength(serialized, 'utf8') > DREAMER_MAX_STATE_BYTES) {
      throw new DreamerCapacityError('Dreamer durable state exceeds 1 MiB.')
    }
    try {
      await this.assertDirectoryIdentity()
    } catch (error) {
      if (error instanceof DreamerRecoveryError) this.failure = error
      throw error
    }
    const staging = path.join(
      this.directory,
      `${DREAMER_STAGING_PREFIX}${this.nextUUID()}.pending`,
    )
    let published = false
    try {
      try {
        await lstat(staging)
        throw new DreamerPersistenceError()
      } catch (error) {
        if (!isMissing(error)) throw error
      }
      await this.writeFileImpl!(staging, serialized, {
        encoding: 'utf8',
        flag: 'wx',
        mode: 0o600,
      })
      await chmod(staging, 0o600)
      await this.syncFile(staging)
      await this.syncDirectoryImpl(this.directory)
      try {
        await this.assertDirectoryIdentity()
        await this.assertPrimarySafe()
      } catch (error) {
        if (error instanceof DreamerRecoveryError) this.failure = error
        throw error
      }
      await rename(staging, this.statePath)
      published = true
      try {
        await this.syncDirectoryImpl(this.directory)
      } catch (error) {
        await this.rollback(serialized).catch((rollbackError: unknown) => {
          this.failure = new DreamerPersistenceError(rollbackError)
          throw rollbackError
        })
        throw new DreamerPersistenceError(error)
      }
      return serialized
    } catch (error) {
      if (
        error instanceof DreamerPersistenceError ||
        error instanceof DreamerCapacityError ||
        error instanceof DreamerRecoveryError
      ) throw error
      throw new DreamerPersistenceError(error)
    } finally {
      if (!published) {
        try {
          await rm(staging, { force: true })
          await this.syncDirectoryImpl(this.directory)
        } catch (cleanupError) {
          this.failure = new DreamerPersistenceError(cleanupError)
        }
      }
    }
  }

  private async rollback(nextSerialized: string): Promise<void> {
    await this.assertDirectoryIdentity()
    const previous = this.serialized
    if (previous === undefined) {
      await this.assertDirectoryIdentity()
      await unlink(this.statePath).catch((error: unknown) => {
        if (!isMissing(error)) throw error
      })
      await this.assertDirectoryIdentity()
      await this.syncDirectoryImpl(this.directory)
      return
    }
    const staging = path.join(
      this.directory,
      `${DREAMER_STAGING_PREFIX}${this.nextUUID()}.pending`,
    )
    await this.writeFileImpl!(staging, previous, {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600,
    })
    await chmod(staging, 0o600)
    await this.syncFile(staging)
    await this.assertDirectoryIdentity()
    await rename(staging, this.statePath)
    await this.syncDirectoryImpl(this.directory)
    void nextSerialized
  }

  private async syncFile(filePath: string): Promise<void> {
    const handle = await open(filePath, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0))
    try {
      await handle.sync()
    } finally {
      await handle.close()
    }
  }

  private async assertPrimarySafe(): Promise<void> {
    let metadata
    try {
      metadata = await lstat(this.statePath)
    } catch (error) {
      if (isMissing(error)) return
      throw error
    }
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new DreamerRecoveryError('Dreamer state is not a regular file; no files were changed.')
    }
    await this.assertOwnedPrivate(metadata, this.statePath, 'Dreamer state')
  }

  private async readPrimary(): Promise<string> {
    const metadata = await lstat(this.statePath)
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new DreamerRecoveryError('Dreamer state is not a regular file; no files were changed.')
    }
    await this.assertOwnedPrivate(metadata, this.statePath, 'Dreamer state')
    if (metadata.size > DREAMER_MAX_STATE_BYTES) {
      throw new DreamerRecoveryError('Dreamer state exceeds the supported size; no files were changed.')
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
        opened.dev !== metadata.dev ||
        opened.size > DREAMER_MAX_STATE_BYTES
      ) {
        throw new DreamerRecoveryError('Dreamer state changed while opening; no files were changed.')
      }
      const buffer = Buffer.alloc(opened.size + 1)
      let length = 0
      for (;;) {
        const read = await handle.read(buffer, length, buffer.length - length, length)
        if (read.bytesRead === 0) break
        length += read.bytesRead
        if (length > opened.size) {
          throw new DreamerRecoveryError('Dreamer state changed while reading; no files were changed.')
        }
      }
      return buffer.toString('utf8', 0, length)
    } finally {
      await handle.close()
    }
  }

  private async ensureDirectory(): Promise<void> {
    const missing: string[] = []
    let current = this.directory
    for (;;) {
      try {
        const metadata = await lstat(current)
        if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
          throw new DreamerRecoveryError('Dreamer directory must be a regular private directory.')
        }
        break
      } catch (error) {
        if (!isMissing(error)) throw error
        missing.push(current)
        const parent = path.dirname(current)
        if (parent === current) throw new DreamerRecoveryError('Dreamer directory has no usable parent.')
        current = parent
      }
    }
    for (const directory of missing.reverse()) {
      await mkdir(directory, { mode: 0o700 })
      const metadata = await lstat(directory)
      await this.assertOwnedPrivate(metadata, directory, 'Dreamer directory')
    }
    await this.syncDirectoryAncestry()
    const metadata = await lstat(this.directory)
    await this.assertOwnedPrivate(metadata, this.directory, 'Dreamer directory')
    this.directoryIdentity = { dev: Number(metadata.dev), ino: Number(metadata.ino) }
  }

  private async syncDirectoryAncestry(): Promise<void> {
    const directories: string[] = []
    let current = this.directory
    for (;;) {
      directories.push(current)
      const parent = path.dirname(current)
      if (parent === current) break
      current = parent
    }
    for (const directory of directories) {
      if (directory !== path.parse(directory).root) {
        await this.syncDirectoryImpl(directory)
      }
    }
  }

  private async assertDirectoryIdentity(): Promise<void> {
    let metadata
    try {
      metadata = await lstat(this.directory)
    } catch {
      throw new DreamerRecoveryError(
        'Dreamer directory disappeared; no files were changed.',
      )
    }
    if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
      throw new DreamerRecoveryError(
        'Dreamer directory was replaced; no files were changed.',
      )
    }
    await this.assertOwnedPrivate(metadata, this.directory, 'Dreamer directory')
    const identity = { dev: Number(metadata.dev), ino: Number(metadata.ino) }
    if (
      this.directoryIdentity &&
      (identity.dev !== this.directoryIdentity.dev ||
        identity.ino !== this.directoryIdentity.ino)
    ) {
      throw new DreamerRecoveryError(
        'Dreamer directory was replaced; no files were changed.',
      )
    }
  }

  private async assertOwnedPrivate(
    metadata: Awaited<ReturnType<typeof lstat>>,
    targetPath: string,
    label: string,
  ): Promise<void> {
    const uid = process.getuid?.()
    if (uid === undefined) {
      throw new DreamerRecoveryError(
        `${label} ownership could not be verified; no files were changed.`,
      )
    }
    if (metadata.uid !== uid) {
      throw new DreamerRecoveryError(`${label} is owned by another user; no files were changed.`)
    }
    if ((Number(metadata.mode) & 0o077) !== 0) {
      await chmod(
        targetPath,
        metadata.isDirectory() ? 0o700 : 0o600,
      )
    }
  }

  private async cleanStaging(): Promise<void> {
    const entries = await readdir(this.directory, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.name.startsWith(DREAMER_STAGING_PREFIX) || !entry.name.endsWith('.pending')) continue
      if (!/^dreamer\.[A-Za-z0-9-]{8,100}\.pending$/.test(entry.name)) continue
      const filePath = path.join(this.directory, entry.name)
      const metadata = await lstat(filePath)
      if (metadata.isSymbolicLink() || !metadata.isFile()) {
        throw new DreamerRecoveryError('Dreamer staging state is unsafe; no files were changed.')
      }
      await this.assertOwnedPrivate(metadata, filePath, 'Dreamer staging state')
      await unlink(filePath)
    }
    await this.syncDirectoryImpl(this.directory)
  }
}
