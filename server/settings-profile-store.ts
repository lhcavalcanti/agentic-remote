import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  applySettingsChanges,
  applySettingsImport,
  isSettingsProfileKey,
  isSettingsRevision,
  settingsValuesFrom,
  validateSettingsChanges,
  validateSettingsImport,
  type SettingsProfileRecord,
  type SettingsProfileSnapshot,
  type SettingsUpdateResult,
} from '../shared/settings-profile.js'

/** Bumped only when a load-breaking shape change ships. */
const STATE_VERSION = 1

interface SettingsProfileState extends SettingsProfileRecord {
  version: number
  profileId: string
}

/**
 * The hub's settings profile, shared by every device that opens this hub.
 *
 * Every commit that changes something advances `revision` and persists before
 * it is reported. A change carries the revision its device had seen; a key
 * another device committed after that keeps its newer value and is reported
 * back as a conflict, so a stale device cannot silently undo a newer choice.
 */
export class SettingsProfileStore {
  private readonly statePath: string
  private state: SettingsProfileState = {
    version: STATE_VERSION,
    profileId: randomUUID(),
    revision: 0,
    values: {},
    keyRevisions: {},
  }
  /** Serializes whole read-modify-persist commits. */
  private commits: Promise<unknown> = Promise.resolve()

  constructor(private readonly directory: string) {
    this.statePath = path.join(directory, 'settings-profile.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    let raw: string
    try {
      raw = await readFile(this.statePath, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      await this.persist(this.state)
      return
    }
    let parsed: Partial<SettingsProfileState>
    try {
      parsed = JSON.parse(raw) as Partial<SettingsProfileState>
    } catch (error) {
      // Starting empty would silently discard every device's preferences.
      throw new Error(
        `Settings profile at ${this.statePath} is not readable JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
    if (parsed.version !== undefined && parsed.version !== STATE_VERSION) {
      throw new Error(
        `Settings profile at ${this.statePath} has unsupported version ${String(parsed.version)}`,
      )
    }
    const keyRevisions: SettingsProfileState['keyRevisions'] = {}
    for (const [key, revision] of Object.entries(parsed.keyRevisions ?? {})) {
      if (isSettingsProfileKey(key) && isSettingsRevision(revision)) keyRevisions[key] = revision
    }
    this.state = {
      version: STATE_VERSION,
      profileId:
        typeof parsed.profileId === 'string' && parsed.profileId ? parsed.profileId : randomUUID(),
      revision: isSettingsRevision(parsed.revision) ? parsed.revision : 0,
      // A value an older or newer build wrote that no longer validates is
      // dropped, not served: every device would otherwise reject it.
      values: settingsValuesFrom(parsed.values),
      keyRevisions,
    }
  }

  snapshot(): SettingsProfileSnapshot {
    return {
      profileId: this.state.profileId,
      revision: this.state.revision,
      values: structuredClone(this.state.values),
    }
  }

  /**
   * Applies the changes whose base is current. The whole request is validated
   * first, so a malformed entry cannot leave the others half applied.
   */
  async update(changes: Record<string, unknown>): Promise<SettingsUpdateResult> {
    const parsed = validateSettingsChanges(changes)
    let conflicts: SettingsUpdateResult['conflicts'] = []
    const settings = await this.commit((record) => {
      const result = applySettingsChanges(record, parsed)
      conflicts = result.conflicts
      return result.record
    })
    return { settings, conflicts }
  }

  /**
   * Takes a device's pre-hub settings for every key no device has chosen
   * yet, so the first device to bring a setting wins and later ones adopt it.
   */
  async import(values: Record<string, unknown>): Promise<SettingsProfileSnapshot> {
    const parsed = validateSettingsImport(values)
    return this.commit((record) => applySettingsImport(record, parsed))
  }

  /**
   * Persists the record a mutation returns before reporting it. Commits run
   * one at a time; a mutation that returns the record unchanged keeps the
   * revision, and a failed write leaves the previous profile in place.
   */
  private commit(
    mutate: (record: SettingsProfileRecord) => SettingsProfileRecord,
  ): Promise<SettingsProfileSnapshot> {
    const run = this.commits.then(async () => {
      const previous = this.state
      const record = mutate(previous)
      if (record === previous) return this.snapshot()
      const next: SettingsProfileState = {
        version: STATE_VERSION,
        profileId: previous.profileId,
        ...record,
      }
      await this.persist(next)
      this.state = next
      return this.snapshot()
    })
    this.commits = run.catch(() => undefined)
    return run
  }

  private async persist(state: SettingsProfileState): Promise<void> {
    const temporary = `${this.statePath}.tmp`
    await writeFile(temporary, JSON.stringify(state, null, 2), { mode: 0o600 })
    await rename(temporary, this.statePath)
  }
}
