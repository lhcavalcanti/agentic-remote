import {
  parseSettingValue,
  sameSettingValue,
  settingsProfileKeys,
  settingsValuesFrom,
  SETTINGS_MAX_COMPUTERS,
  statuslineItems,
  type AppearanceSetting,
  type NewSessionRuntime,
  type SettingsChange,
  type SettingsProfileKey,
  type SettingsProfileSnapshot,
  type SettingsProfileValues,
  type SettingsUpdateResult,
} from '../shared/settings-profile'
import type { Appearance } from './appearance'

/**
 * This device's copy of the hub's settings profile. The inline script in
 * index.html reads it too, to paint the right appearance before the app loads,
 * so its shape is part of that contract.
 */
export const settingsProfileCacheKey = 'agentic-remote:settings-profile'

export interface SettingsProfileTransport {
  fetch(): Promise<SettingsProfileSnapshot>
  update(changes: Partial<Record<SettingsProfileKey, SettingsChange>>): Promise<SettingsUpdateResult>
  import(values: SettingsProfileValues): Promise<SettingsProfileSnapshot>
}

export interface SettingsCacheStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** `loading` until the hub first answers; `offline` while it cannot be reached. */
export type SettingsSyncStatus = 'loading' | 'saving' | 'synced' | 'offline'

export interface SettingsProfileState {
  /** What this device shows: the hub's profile with its own unsent edits on top. */
  values: SettingsProfileValues
  status: SettingsSyncStatus
  /** Settings another device changed first; their newer value was kept. */
  conflicts: SettingsProfileKey[]
  /** Why the hub refused a change, which was dropped rather than retried. */
  refused?: string
  /** Whether this device can keep a copy to start from and to hold offline edits. */
  deviceCopy: boolean
}

type PendingChange = { value: unknown; baseRevision: number }
type Pending = Partial<Record<SettingsProfileKey, PendingChange>>

interface CachedProfile {
  version: 1
  profileId?: string
  revision: number
  values: SettingsProfileValues
  pending: Pending
  /** Earlier settings still to be offered to the hub. */
  imports?: SettingsProfileValues
}

export interface SettingsProfileClientOptions {
  transport: SettingsProfileTransport
  storage?: SettingsCacheStorage
  /** This device's settings from before the hub kept them, offered once. */
  legacy?: () => SettingsProfileValues
  retryDelaysMs?: number[]
}

const defaultRetryDelaysMs = [1_000, 3_000, 10_000, 30_000, 60_000]

function isRefusal(error: unknown): boolean {
  const status = (error as { statusCode?: unknown } | undefined)?.statusCode
  return (
    typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429
  )
}

function pendingFrom(value: unknown): Pending {
  const pending: Pending = {}
  if (!value || typeof value !== 'object') return pending
  for (const key of settingsProfileKeys) {
    const change = (value as Record<string, unknown>)[key] as Partial<PendingChange> | undefined
    if (!change || typeof change !== 'object') continue
    const baseRevision = change.baseRevision
    if (typeof baseRevision !== 'number' || !Number.isInteger(baseRevision) || baseRevision < 0) {
      continue
    }
    if (change.value === null) {
      pending[key] = { value: null, baseRevision }
      continue
    }
    const parsed = parseSettingValue(key, change.value)
    if (parsed.ok) pending[key] = { value: parsed.value, baseRevision }
  }
  return pending
}

function cacheFrom(raw: string | null): CachedProfile | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as Partial<CachedProfile> | null
    if (!parsed || parsed.version !== 1) return undefined
    const imports = settingsValuesFrom(parsed.imports)
    return {
      version: 1,
      profileId: typeof parsed.profileId === 'string' ? parsed.profileId : undefined,
      revision:
        typeof parsed.revision === 'number' && Number.isInteger(parsed.revision)
          ? Math.max(parsed.revision, -1)
          : -1,
      values: settingsValuesFrom(parsed.values),
      pending: pendingFrom(parsed.pending),
      ...(Object.keys(imports).length ? { imports } : {}),
    }
  } catch {
    return undefined
  }
}

/**
 * Keeps this device in step with the hub's settings profile.
 *
 * An edit shows at once and is remembered with the revision this device had
 * seen, then sent one request at a time. The hub keeps a newer value another
 * device committed in the meantime and says so, which surfaces as a conflict
 * rather than a silent overwrite either way. Unreachable hubs keep edits on
 * this device and retry with a bounded backoff.
 */
export class SettingsProfileClient {
  private profileId?: string
  /** -1 until the hub (or this device's copy) has said anything. */
  private revision = -1
  private confirmed: SettingsProfileValues = {}
  private pending: Pending = {}
  private imports?: SettingsProfileValues
  private ready = false
  private unreachable = false
  private flushing = false
  private syncing?: Promise<void>
  private resync = false
  private conflicts: SettingsProfileKey[] = []
  private refused?: string
  private storageWorks = true
  private retryTimer?: ReturnType<typeof setTimeout>
  private retryAttempt = 0
  private active = true
  private readonly listeners = new Set<() => void>()
  private readonly retryDelaysMs: number[]
  private readonly options: SettingsProfileClientOptions
  private state: SettingsProfileState

  constructor(options: SettingsProfileClientOptions) {
    this.options = options
    this.retryDelaysMs = options.retryDelaysMs?.length ? options.retryDelaysMs : defaultRetryDelaysMs
    let cache: CachedProfile | undefined
    try {
      cache = cacheFrom(options.storage?.getItem(settingsProfileCacheKey) ?? null)
    } catch {
      cache = undefined
    }
    if (cache) {
      this.profileId = cache.profileId
      this.revision = cache.revision
      this.confirmed = cache.values
      this.pending = cache.pending
      this.imports = cache.imports
    } else {
      // Only a device with no copy yet brings its earlier settings, so a
      // stale browser cannot keep re-offering them after the first sync.
      const legacy = settingsValuesFrom(options.legacy?.() ?? {})
      if (Object.keys(legacy).length) this.imports = legacy
    }
    this.state = this.compute()
    this.persist()
  }

  getState = (): SettingsProfileState => this.state

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Records a choice on this device at once and sends it to the hub. */
  set<K extends SettingsProfileKey>(key: K, value: SettingsProfileValues[K] | null): void {
    let next: unknown = null
    if (value !== null && value !== undefined) {
      const parsed = parseSettingValue(key, value)
      if (!parsed.ok) throw new Error(parsed.error)
      next = parsed.value
    }
    const current = this.state.values[key]
    if (next === null ? current === undefined : sameSettingValue(current, next)) return
    const existing = this.pending[key]
    // A second edit to a key not yet sent still answers to the revision the
    // first one was made from: nothing newer has been seen for it.
    this.pending[key] = {
      value: next,
      baseRevision: existing ? existing.baseRevision : Math.max(this.revision, 0),
    }
    this.refused = undefined
    this.emit()
    void this.flush()
  }

  /** Applies a profile another device committed. */
  receive(snapshot: SettingsProfileSnapshot): void {
    const recreated = this.profileId !== undefined && snapshot.profileId !== this.profileId
    this.adopt(snapshot)
    if (recreated) void this.sync()
  }

  /** Reads the hub's profile, offers anything still to import, then sends edits. */
  sync(): Promise<void> {
    if (this.syncing) {
      this.resync = true
      return this.syncing
    }
    const run = (async () => {
      do {
        this.resync = false
        try {
          this.adopt(await this.options.transport.fetch())
          const imports = this.imports
          if (imports) {
            try {
              this.adopt(await this.options.transport.import(imports))
            } catch (error) {
              // A refused import would be refused again; the hub's profile stands.
              if (!isRefusal(error)) throw error
            }
            if (this.imports === imports) this.imports = undefined
          }
          this.ready = true
          this.reachable()
        } catch {
          this.unreachableNow()
          return
        }
      } while (this.resync && this.active)
    })().finally(() => {
      this.syncing = undefined
    })
    this.syncing = run
    return run.then(() => (this.ready && !this.unreachable ? this.flush() : undefined))
  }

  dismissNotice(): void {
    if (!this.conflicts.length && !this.refused) return
    this.conflicts = []
    this.refused = undefined
    this.emit()
  }

  /** Stops retrying; `start` resumes, which also lets React remount it. */
  stop(): void {
    this.active = false
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = undefined
  }

  start(): void {
    this.active = true
    void this.sync()
  }

  private async flush(): Promise<void> {
    if (!this.ready) return this.sync()
    if (this.flushing) return
    this.flushing = true
    try {
      while (this.active) {
        const sent = { ...this.pending }
        const keys = Object.keys(sent) as SettingsProfileKey[]
        if (!keys.length) break
        this.emit()
        let result: SettingsUpdateResult
        try {
          result = await this.options.transport.update(
            Object.fromEntries(
              keys.map((key) => [key, { value: sent[key]!.value, baseRevision: sent[key]!.baseRevision }]),
            ),
          )
        } catch (error) {
          if (!isRefusal(error)) {
            this.unreachableNow()
            return
          }
          for (const key of keys) if (this.pending[key] === sent[key]) delete this.pending[key]
          this.refused = error instanceof Error ? error.message : String(error)
          continue
        }
        for (const key of keys) {
          const now = this.pending[key]
          if (now === sent[key] || result.conflicts.includes(key)) {
            // A conflict also drops a newer edit to the same key: it was made
            // on top of the value that just lost.
            delete this.pending[key]
          } else if (now) {
            this.pending[key] = { ...now, baseRevision: result.settings.revision }
          }
        }
        if (result.conflicts.length) {
          this.conflicts = [...new Set([...this.conflicts, ...result.conflicts])]
        }
        this.reachable()
        this.adopt(result.settings)
      }
    } finally {
      this.flushing = false
      this.emit()
    }
  }

  private adopt(snapshot: SettingsProfileSnapshot): void {
    if (this.profileId !== undefined && snapshot.profileId !== this.profileId) {
      // The hub's profile was recreated. Offer what this device knew, and keep
      // its unsent edits as changes on top of the new profile.
      this.imports = { ...this.confirmed, ...this.imports }
      for (const key of Object.keys(this.pending) as SettingsProfileKey[]) {
        this.pending[key] = { ...this.pending[key]!, baseRevision: snapshot.revision }
      }
    } else if (snapshot.revision < this.revision) {
      // A late delivery, not a correction.
      return
    }
    this.profileId = snapshot.profileId
    this.revision = snapshot.revision
    this.confirmed = settingsValuesFrom(snapshot.values)
    this.emit()
  }

  private reachable(): void {
    this.unreachable = false
    this.retryAttempt = 0
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = undefined
  }

  private unreachableNow(): void {
    this.unreachable = true
    this.emit()
    if (!this.active || this.retryTimer) return
    const delay = this.retryDelaysMs[Math.min(this.retryAttempt, this.retryDelaysMs.length - 1)]
    this.retryAttempt += 1
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined
      if (this.active) void this.sync()
    }, delay)
  }

  private compute(): SettingsProfileState {
    const values: Record<string, unknown> = { ...this.imports, ...this.confirmed }
    for (const [key, change] of Object.entries(this.pending)) {
      if (change.value === null) delete values[key]
      else values[key] = change.value
    }
    const status: SettingsSyncStatus = this.unreachable
      ? 'offline'
      : !this.ready
        ? 'loading'
        : this.flushing || Object.keys(this.pending).length
          ? 'saving'
          : 'synced'
    return {
      values: values as SettingsProfileValues,
      status,
      conflicts: this.conflicts,
      ...(this.refused ? { refused: this.refused } : {}),
      deviceCopy: this.storageWorks,
    }
  }

  private persist(): void {
    if (!this.options.storage) return
    const cache: CachedProfile = {
      version: 1,
      ...(this.profileId ? { profileId: this.profileId } : {}),
      revision: this.revision,
      values: this.confirmed,
      pending: this.pending,
      ...(this.imports ? { imports: this.imports } : {}),
    }
    try {
      this.options.storage.setItem(settingsProfileCacheKey, JSON.stringify(cache))
      this.storageWorks = true
    } catch {
      // The hub still keeps the setting; this device just cannot start from
      // it or hold an offline edit across a reload.
      this.storageWorks = false
    }
  }

  private emit(): void {
    this.persist()
    const next = this.compute()
    if (
      sameSettingValue(next.values, this.state.values) &&
      next.status === this.state.status &&
      next.conflicts === this.state.conflicts &&
      next.refused === this.state.refused &&
      next.deviceCopy === this.state.deviceCopy
    ) {
      return
    }
    this.state = next
    for (const listener of this.listeners) listener()
  }
}

/** The light or dark surface a setting means on a device with this preference. */
export function resolveAppearance(
  setting: AppearanceSetting | undefined,
  prefersLight: boolean,
): Appearance {
  if (setting === 'light' || setting === 'graphite') return setting
  return prefersLight ? 'light' : 'graphite'
}

function readJson(storage: SettingsCacheStorage, key: string): unknown {
  try {
    const raw = storage.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

function legacyRuntime(value: unknown): NewSessionRuntime | undefined {
  if (typeof value === 'string') {
    return { model: value, reasoningEffort: '', contextTier: 'default', mode: '' }
  }
  if (!value || typeof value !== 'object') return undefined
  const fields = value as Record<string, unknown>
  const effort = fields.reasoningEffort
  return {
    model: typeof fields.model === 'string' ? fields.model : '',
    reasoningEffort:
      effort === 'low' || effort === 'medium' || effort === 'high' || effort === 'xhigh' || effort === 'max'
        ? effort
        : '',
    contextTier: fields.contextTier === 'long_context' ? 'long_context' : 'default',
    mode: fields.mode === 'plan' || fields.mode === 'autopilot' ? fields.mode : '',
  }
}

/**
 * The settings this browser chose before the hub kept them, normalized the
 * way the old readers did. Anything that would not validate is left behind.
 */
export function readLegacySettings(
  local: SettingsCacheStorage,
  session: SettingsCacheStorage,
): SettingsProfileValues {
  const candidates: Record<string, unknown> = {}
  const appearance = readJson(local, 'agentic-remote:appearance')
  if (appearance !== undefined) candidates.appearance = appearance
  try {
    const accent = session.getItem('agentic-remote:accent-theme')
    if (accent !== null) candidates.accent = accent
  } catch {
    // A blocked tab store has nothing to bring.
  }
  const statusline = readJson(local, 'agentic-remote:statusline')
  if (statusline && typeof statusline === 'object' && !Array.isArray(statusline)) {
    // An item a later version retired would otherwise invalidate the rest.
    candidates.statusline = Object.fromEntries(
      Object.entries(statusline).filter(
        ([item, shown]) =>
          (statuslineItems as readonly string[]).includes(item) && typeof shown === 'boolean',
      ),
    )
  }
  const runtimes = readJson(local, 'agentic-remote:default-models')
  if (runtimes && typeof runtimes === 'object' && !Array.isArray(runtimes)) {
    const selections: Record<string, NewSessionRuntime> = {}
    for (const provider of ['copilot', 'claude'] as const) {
      const selection = legacyRuntime((runtimes as Record<string, unknown>)[provider])
      if (selection) selections[provider] = selection
    }
    if (Object.keys(selections).length) candidates.newSessionRuntimes = selections
  }
  const folders = readJson(local, 'agentic-remote:default-session-folders') as
    | { version?: unknown; folders?: unknown }
    | undefined
  if (folders?.version === 1 && folders.folders && typeof folders.folders === 'object') {
    const kept = Object.entries(folders.folders as Record<string, unknown>).filter(
      ([, folder]) => typeof folder === 'string' && folder.trim(),
    )
    if (kept.length) candidates.newSessionFolders = Object.fromEntries(kept)
  }
  const sort = readJson(local, 'agentic-remote:session-sort')
  if (sort !== undefined) candidates.sessionSort = sort
  const order = readJson(local, 'agentic-remote:computer-order')
  if (Array.isArray(order)) {
    candidates.computerOrder = [
      ...new Set(order.filter((id): id is string => typeof id === 'string' && id.length > 0)),
    ].slice(0, SETTINGS_MAX_COMPUTERS)
  }
  return settingsValuesFrom(candidates)
}
