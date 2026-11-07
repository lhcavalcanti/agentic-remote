import type { AgentProvider, RuntimeReasoningEffort } from './contracts.js'
import { notificationScopes, type NotificationScope } from './notifications.js'

/**
 * The hub-owned settings profile: preferences that follow the user to every
 * device that opens the same hub. Device-specific choices (shortcuts, panel
 * widths) and content (drafts) never belong here. See docs/design/settings-profile.md.
 */
export const settingsProfileKeys = [
  'appearance',
  'accent',
  'statusline',
  'newSessionRuntimes',
  'newSessionFolders',
  'newSessionBackend',
  'sessionSort',
  'computerOrder',
  'oracleResponseStyle',
  'notificationScope',
] as const

export type SettingsProfileKey = (typeof settingsProfileKeys)[number]

export const appearanceSettings = ['system', 'graphite', 'light'] as const
export type AppearanceSetting = (typeof appearanceSettings)[number]

export const accentSettings = ['agentic', 'ocean', 'violet', 'ember', 'rose', 'teal'] as const
export type AccentSetting = (typeof accentSettings)[number]

export const statuslineItems = [
  'enabled',
  'computer',
  'provider',
  'path',
  'status',
  'queue',
  'backgroundTasks',
  'sessionId',
  'model',
  'effort',
  'contextTier',
  'contextUsage',
  'mode',
  'permissions',
  'update',
] as const
export type StatuslineItem = (typeof statuslineItems)[number]
export type StatuslineSetting = Partial<Record<StatuslineItem, boolean>>

export interface NewSessionRuntime {
  model: string
  reasoningEffort: RuntimeReasoningEffort | ''
  contextTier: 'default' | 'long_context'
  /** Blank starts Interactive, as a provider does without one. */
  mode: 'plan' | 'autopilot' | ''
}
export type NewSessionRuntimesSetting = Partial<Record<AgentProvider, NewSessionRuntime>>
/**
 * The provider a new session uses unless one is chosen: Copilot, which hosts
 * Claude, GPT, and other model families. The New session dialog and Oracle share it.
 */
export const DEFAULT_SESSION_PROVIDER: AgentProvider = 'copilot'
/** Computer ID to the folder new sessions start in there. */
export type NewSessionFoldersSetting = Record<string, string>

/** Where new sessions run. Unset starts them in a terminal (tmux). */
export const newSessionBackendSettings = ['terminal', 'sdk'] as const
export type NewSessionBackendSetting = (typeof newSessionBackendSettings)[number]

export const sessionSortSettings = ['custom', 'recent', 'attention', 'name'] as const
export type SessionSortSetting = (typeof sessionSortSettings)[number]

/** How much Oracle writes. Unset answers Balanced. */
export const oracleResponseStyles = ['concise', 'balanced', 'detailed'] as const
export type OracleResponseStyle = (typeof oracleResponseStyles)[number]

export interface SettingsProfileValues {
  appearance?: AppearanceSetting
  accent?: AccentSetting
  statusline?: StatuslineSetting
  newSessionRuntimes?: NewSessionRuntimesSetting
  newSessionFolders?: NewSessionFoldersSetting
  newSessionBackend?: NewSessionBackendSetting
  sessionSort?: SessionSortSetting
  computerOrder?: string[]
  oracleResponseStyle?: OracleResponseStyle
  /** Unset sends every notification, as before the setting existed. */
  notificationScope?: NotificationScope
}

export interface SettingsProfileSnapshot {
  /** Changes only when the hub's profile file is recreated. */
  profileId: string
  revision: number
  values: SettingsProfileValues
}

/** `value: null` resets the key to its default. */
export interface SettingsChange {
  value: unknown
  /** The profile revision this device had seen when the change was made. */
  baseRevision: number
  /**
   * The device's own edit counter. Tabs share a device ID, so this is what
   * keeps an older edit that arrives late from replacing a newer one.
   */
  seq?: number
}

export interface SettingsUpdateResult {
  settings: SettingsProfileSnapshot
  /** Keys another device changed after `baseRevision`; their newer value was kept. */
  conflicts: SettingsProfileKey[]
}

export const SETTINGS_PROFILE_MAX_BYTES = 32 * 1024
export const SETTINGS_MAX_FOLDERS = 64
export const SETTINGS_MAX_COMPUTERS = 200
const MAX_ID_LENGTH = 200
const MAX_FOLDER_LENGTH = 4096
const MAX_MODEL_LENGTH = 200

const reasoningEfforts = ['', 'low', 'medium', 'high', 'xhigh', 'max'] as const
const providers = ['copilot', 'claude'] as const

export type SettingParseResult<K extends SettingsProfileKey = SettingsProfileKey> =
  | { ok: true; value: NonNullable<SettingsProfileValues[K]> }
  | { ok: false; error: string }

export function isSettingsProfileKey(key: string): key is SettingsProfileKey {
  return (settingsProfileKeys as readonly string[]).includes(key)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function oneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
}

function parseRuntime(value: unknown): NewSessionRuntime | undefined {
  if (!isRecord(value)) return undefined
  const fields = ['model', 'reasoningEffort', 'contextTier', 'mode']
  if (Object.keys(value).some((field) => !fields.includes(field))) return undefined
  const { model, reasoningEffort, contextTier, mode } = value
  if (typeof model !== 'string' || model.length > MAX_MODEL_LENGTH) return undefined
  if (!oneOf(reasoningEfforts, reasoningEffort)) return undefined
  if (contextTier !== 'default' && contextTier !== 'long_context') return undefined
  if (mode !== '' && mode !== 'plan' && mode !== 'autopilot') return undefined
  return { model, reasoningEffort, contextTier, mode }
}

/**
 * Validates one setting. Objects are copied field by field, so nothing the
 * allowlist does not name can ride along into the profile.
 */
export function parseSettingValue<K extends SettingsProfileKey>(
  key: K,
  value: unknown,
): SettingParseResult<K> {
  const invalid = (detail: string): SettingParseResult<K> => ({
    ok: false,
    error: `Setting ${key} ${detail}`,
  })
  const valid = (parsed: unknown): SettingParseResult<K> => ({
    ok: true,
    value: parsed as NonNullable<SettingsProfileValues[K]>,
  })
  switch (key) {
    case 'appearance':
      return oneOf(appearanceSettings, value) ? valid(value) : invalid('is not a known appearance')
    case 'accent':
      return oneOf(accentSettings, value) ? valid(value) : invalid('is not a known accent')
    case 'newSessionBackend':
      return oneOf(newSessionBackendSettings, value) ? valid(value) : invalid('is not a known backend')
    case 'sessionSort':
      return oneOf(sessionSortSettings, value) ? valid(value) : invalid('is not a known sort')
    case 'oracleResponseStyle':
      return oneOf(oracleResponseStyles, value) ? valid(value) : invalid('is not a known response style')
    case 'notificationScope':
      return oneOf(notificationScopes, value) ? valid(value) : invalid('is not a known notification scope')
    case 'statusline': {
      if (!isRecord(value)) return invalid('must be an object')
      const parsed: StatuslineSetting = {}
      for (const [item, shown] of Object.entries(value)) {
        if (!oneOf(statuslineItems, item)) return invalid(`has an unknown item ${item.slice(0, 40)}`)
        if (typeof shown !== 'boolean') return invalid(`item ${item} must be true or false`)
        parsed[item] = shown
      }
      return valid(parsed)
    }
    case 'newSessionRuntimes': {
      if (!isRecord(value)) return invalid('must be an object')
      const parsed: NewSessionRuntimesSetting = {}
      for (const [provider, runtime] of Object.entries(value)) {
        if (!oneOf(providers, provider)) return invalid(`has an unknown provider ${provider.slice(0, 40)}`)
        const selection = parseRuntime(runtime)
        if (!selection) return invalid(`for ${provider} is malformed`)
        parsed[provider] = selection
      }
      return valid(parsed)
    }
    case 'newSessionFolders': {
      if (!isRecord(value)) return invalid('must be an object')
      const entries = Object.entries(value)
      if (entries.length > SETTINGS_MAX_FOLDERS) {
        return invalid(`may name at most ${SETTINGS_MAX_FOLDERS} computers`)
      }
      const parsed: NewSessionFoldersSetting = {}
      for (const [computerId, folder] of entries) {
        if (!computerId || computerId.length > MAX_ID_LENGTH) return invalid('has an invalid computer')
        if (typeof folder !== 'string' || !folder.trim() || folder.length > MAX_FOLDER_LENGTH) {
          return invalid(`for ${computerId.slice(0, 40)} must be a folder path`)
        }
        parsed[computerId] = folder
      }
      return valid(parsed)
    }
    case 'computerOrder': {
      if (!Array.isArray(value)) return invalid('must be a list')
      if (value.length > SETTINGS_MAX_COMPUTERS) {
        return invalid(`may list at most ${SETTINGS_MAX_COMPUTERS} computers`)
      }
      const seen = new Set<string>()
      for (const id of value) {
        if (typeof id !== 'string' || !id || id.length > MAX_ID_LENGTH) {
          return invalid('has an invalid computer')
        }
        // A duplicate would give one computer two positions.
        if (seen.has(id)) return invalid(`lists ${id.slice(0, 40)} twice`)
        seen.add(id)
      }
      return valid([...value])
    }
    default:
      return { ok: false, error: `Unknown setting ${String(key).slice(0, 40)}` }
  }
}

/** Keeps only the settings that validate, for reading stored or cached profiles. */
export function settingsValuesFrom(value: unknown): SettingsProfileValues {
  if (!isRecord(value)) return {}
  const values: SettingsProfileValues = {}
  for (const key of settingsProfileKeys) {
    if (!(key in value)) continue
    const parsed = parseSettingValue(key, value[key])
    if (parsed.ok) (values as Record<string, unknown>)[key] = parsed.value
  }
  return values
}

/** Order-insensitive for object keys, so a reordered object is not news. */
export function sameSettingValue(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((entry, index) => sameSettingValue(entry, right[index]))
    )
  }
  if (!isRecord(left) || !isRecord(right)) return false
  const leftKeys = Object.keys(left)
  return (
    leftKeys.length === Object.keys(right).length &&
    leftKeys.every((key) => key in right && sameSettingValue(left[key], right[key]))
  )
}

/** A refused settings request; `statusCode` is what the hub answers with. */
export class SettingsRequestError extends Error {
  readonly statusCode: 400 | 413

  constructor(message: string, statusCode: 400 | 413) {
    super(message)
    this.name = 'SettingsRequestError'
    this.statusCode = statusCode
  }
}

/** The conflict-relevant part of a profile, without its storage details. */
export interface SettingsProfileRecord {
  revision: number
  values: SettingsProfileValues
  /**
   * The revision each key last changed at, kept after a reset so an import
   * cannot bring back a value the user deliberately cleared.
   */
  keyRevisions: Partial<Record<SettingsProfileKey, number>>
  /**
   * The device that last wrote each key. A device whose own write committed
   * but whose response was lost retries from an older base; that is its own
   * change, not another device's, so it must not read as a conflict.
   */
  keyWriters?: Partial<Record<SettingsProfileKey, string>>
  /** The writer's `seq` for each key, compared only with that same writer. */
  keySeqs?: Partial<Record<SettingsProfileKey, number>>
}

/** A browser's own ID, so the hub can tell its retries from other devices. */
export const SETTINGS_DEVICE_ID_MAX_LENGTH = 100

export function isSettingsDeviceId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= SETTINGS_DEVICE_ID_MAX_LENGTH
}

export interface ValidatedSettingsChange {
  key: SettingsProfileKey
  /** `null` resets the key to its default. */
  value: unknown
  baseRevision: number
  seq?: number
}

export function isSettingsRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

/** Validates a whole request first, so a bad entry cannot half-apply the rest. */
export function validateSettingsChanges(
  changes: Record<string, unknown>,
): ValidatedSettingsChange[] {
  const parsed: ValidatedSettingsChange[] = []
  for (const [key, change] of Object.entries(changes)) {
    if (!isSettingsProfileKey(key)) {
      throw new SettingsRequestError(`Unknown setting ${key.slice(0, 40)}`, 400)
    }
    if (!isRecord(change) || !isSettingsRevision(change.baseRevision)) {
      throw new SettingsRequestError(`Setting ${key} needs the revision it was changed from`, 400)
    }
    if (change.seq !== undefined && !isSettingsRevision(change.seq)) {
      throw new SettingsRequestError(`Setting ${key} has an invalid edit number`, 400)
    }
    const seq = change.seq === undefined ? {} : { seq: change.seq }
    if (change.value === null) {
      parsed.push({ key, value: null, baseRevision: change.baseRevision, ...seq })
      continue
    }
    const result = parseSettingValue(key, change.value)
    if (!result.ok) throw new SettingsRequestError(result.error, 400)
    parsed.push({ key, value: result.value, baseRevision: change.baseRevision, ...seq })
  }
  return parsed
}

export function validateSettingsImport(
  values: Record<string, unknown>,
): Array<[SettingsProfileKey, unknown]> {
  const parsed: Array<[SettingsProfileKey, unknown]> = []
  for (const [key, value] of Object.entries(values)) {
    if (!isSettingsProfileKey(key)) {
      throw new SettingsRequestError(`Unknown setting ${key.slice(0, 40)}`, 400)
    }
    const result = parseSettingValue(key, value)
    if (!result.ok) throw new SettingsRequestError(result.error, 400)
    parsed.push([key, result.value])
  }
  return parsed
}

function sizeChecked(record: SettingsProfileRecord): SettingsProfileRecord {
  if (new TextEncoder().encode(JSON.stringify(record.values)).length > SETTINGS_PROFILE_MAX_BYTES) {
    throw new SettingsRequestError(
      `Settings would exceed ${SETTINGS_PROFILE_MAX_BYTES / 1024} KB`,
      413,
    )
  }
  return record
}

/**
 * Applies the changes whose base is current. A key another device committed
 * after a change's base keeps its newer value and is reported as a conflict;
 * the other keys still apply. Returns the same record when nothing changed,
 * so the revision only advances for news.
 */
export function applySettingsChanges(
  record: SettingsProfileRecord,
  changes: ValidatedSettingsChange[],
  /** Who is writing. Without one, any newer write is another device's. */
  writer?: string,
): { record: SettingsProfileRecord; conflicts: SettingsProfileKey[] } {
  const revision = record.revision + 1
  const values: Record<string, unknown> = { ...record.values }
  const keyRevisions = { ...record.keyRevisions }
  const keyWriters = { ...record.keyWriters }
  const keySeqs = { ...record.keySeqs }
  const conflicts: SettingsProfileKey[] = []
  let changed = false
  let owned = false
  const own = (key: SettingsProfileKey, seq: number | undefined) => {
    if (writer === undefined) delete keyWriters[key]
    else keyWriters[key] = writer
    if (writer !== undefined && seq !== undefined) keySeqs[key] = seq
    else delete keySeqs[key]
  }
  for (const { key, value, baseRevision, seq } of changes) {
    const sameWriter = writer !== undefined && keyWriters[key] === writer
    if ((keyRevisions[key] ?? 0) > baseRevision && !sameWriter) {
      conflicts.push(key)
      continue
    }
    // This device already wrote a later edit of its own: this one is older,
    // delivered late, and the newer value stands.
    const recorded = keySeqs[key]
    if (sameWriter && seq !== undefined && recorded !== undefined && seq <= recorded) continue
    if (value === null ? !(key in values) : sameSettingValue(values[key], value)) {
      // Choosing the value already there is still this device's latest edit,
      // so an older edit of its own delivered later must not undo it. It
      // changes no value, so the revision stays and nobody is told.
      if (writer !== undefined && (keyWriters[key] !== writer || keySeqs[key] !== seq)) {
        own(key, seq)
        owned = true
      }
      continue
    }
    if (value === null) delete values[key]
    else values[key] = value
    keyRevisions[key] = revision
    own(key, seq)
    changed = true
  }
  if (!changed && !owned) return { record, conflicts }
  if (!changed) return { record: { ...record, keyWriters, keySeqs }, conflicts }
  return {
    record: sizeChecked({
      revision, values: values as SettingsProfileValues, keyRevisions, keyWriters, keySeqs,
    }),
    conflicts,
  }
}

/** Fills only keys no device has ever chosen, so the first device wins per setting. */
export function applySettingsImport(
  record: SettingsProfileRecord,
  imports: Array<[SettingsProfileKey, unknown]>,
  writer?: string,
): SettingsProfileRecord {
  const revision = record.revision + 1
  const values: Record<string, unknown> = { ...record.values }
  const keyRevisions = { ...record.keyRevisions }
  const keyWriters = { ...record.keyWriters }
  const keySeqs = { ...record.keySeqs }
  let changed = false
  for (const [key, value] of imports) {
    if (keyRevisions[key] !== undefined) continue
    values[key] = value
    keyRevisions[key] = revision
    if (writer !== undefined) keyWriters[key] = writer
    delete keySeqs[key]
    changed = true
  }
  if (!changed) return record
  return sizeChecked({
    revision, values: values as SettingsProfileValues, keyRevisions, keyWriters, keySeqs,
  })
}
