import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SettingsProfileStore } from './settings-profile-store.js'

const directories: string[] = []

async function store(): Promise<{ store: SettingsProfileStore; directory: string }> {
  const directory = await mkdtemp(path.join(tmpdir(), 'settings-profile-test-'))
  directories.push(directory)
  const created = new SettingsProfileStore(directory)
  await created.initialize()
  return { store: created, directory }
}

async function statusOf(promise: Promise<unknown>): Promise<number | undefined> {
  try {
    await promise
    return undefined
  } catch (error) {
    return (error as { statusCode?: number }).statusCode
  }
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('SettingsProfileStore', () => {
  it('starts empty with a stable profile identity', async () => {
    const { store: profile, directory } = await store()
    const first = profile.snapshot()
    expect(first).toEqual({ profileId: expect.any(String), revision: 0, values: {} })
    expect(first.profileId.length).toBeGreaterThan(8)

    const reloaded = new SettingsProfileStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot().profileId).toBe(first.profileId)
  })

  it('commits a change, persists it privately, and reloads it', async () => {
    const { store: profile, directory } = await store()
    const result = await profile.update({
      appearance: { value: 'light', baseRevision: 0 },
      accent: { value: 'ocean', baseRevision: 0 },
    })
    expect(result.conflicts).toEqual([])
    expect(result.settings).toMatchObject({
      revision: 1,
      values: { appearance: 'light', accent: 'ocean' },
    })

    const file = path.join(directory, 'settings-profile.json')
    expect((await stat(file)).mode & 0o777).toBe(0o600)
    const reloaded = new SettingsProfileStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot()).toEqual(result.settings)
  })

  it('keeps the revision when a change sets what is already there', async () => {
    const { store: profile } = await store()
    await profile.update({ sessionSort: { value: 'name', baseRevision: 0 } })
    const repeat = await profile.update({ sessionSort: { value: 'name', baseRevision: 1 } })
    expect(repeat.settings.revision).toBe(1)
    expect(repeat.conflicts).toEqual([])
  })

  it('keeps a newer value from another device and reports the stale key', async () => {
    const { store: profile } = await store()
    // The phone and the computer both saw revision 0.
    const phone = await profile.update({ accent: { value: 'rose', baseRevision: 0 } })
    expect(phone.settings.revision).toBe(1)

    const computer = await profile.update({
      accent: { value: 'teal', baseRevision: 0 },
      sessionSort: { value: 'recent', baseRevision: 0 },
    })
    expect(computer.conflicts).toEqual(['accent'])
    // A different key in the same request is not held back by the conflict.
    expect(computer.settings.values).toEqual({ accent: 'rose', sessionSort: 'recent' })
    expect(computer.settings.revision).toBe(2)
  })

  it("treats a device's retry of its own committed write as its own, not a conflict", async () => {
    const { store: profile, directory } = await store()
    // The phone's write commits, but its response never arrives.
    await profile.update({ accent: { value: 'teal', baseRevision: 0 } }, 'phone')
    // It retries from the base it last saw, now with a newer choice.
    const retry = await profile.update({ accent: { value: 'rose', baseRevision: 0 } }, 'phone')
    expect(retry.conflicts).toEqual([])
    expect(retry.settings).toMatchObject({ revision: 2, values: { accent: 'rose' } })

    // The writer survives a restart, and another device is still told.
    const reloaded = new SettingsProfileStore(directory)
    await reloaded.initialize()
    const other = await reloaded.update({ accent: { value: 'ember', baseRevision: 0 } }, 'computer')
    expect(other.conflicts).toEqual(['accent'])
    const anonymous = await reloaded.update({ accent: { value: 'ember', baseRevision: 0 } })
    expect(anonymous.conflicts).toEqual(['accent'])
    expect(reloaded.snapshot().values.accent).toBe('rose')
  })

  it("keeps a device's newer edit when its older one, from another tab, arrives later", async () => {
    const { store: profile, directory } = await store()
    // Two tabs of one browser: rose (edit 2) overtakes teal (edit 1).
    await profile.update({ accent: { value: 'rose', baseRevision: 0, seq: 2 } }, 'phone')
    const late = await profile.update({ accent: { value: 'teal', baseRevision: 0, seq: 1 } }, 'phone')
    expect(late.conflicts).toEqual([])
    expect(late.settings).toMatchObject({ revision: 1, values: { accent: 'rose' } })

    // The order survives a restart; a later edit from the same tab still lands.
    const reloaded = new SettingsProfileStore(directory)
    await reloaded.initialize()
    const repeat = await reloaded.update({ accent: { value: 'teal', baseRevision: 1, seq: 2 } }, 'phone')
    expect(repeat.settings.values.accent).toBe('rose')
    const newer = await reloaded.update({ accent: { value: 'teal', baseRevision: 1, seq: 3 } }, 'phone')
    expect(newer.settings.values.accent).toBe('teal')
    // Edit numbers are this device's own: another device is judged by revision.
    const other = await reloaded.update({ accent: { value: 'ember', baseRevision: 2, seq: 1 } }, 'computer')
    expect(other.settings.values.accent).toBe('ember')
  })

  it("keeps a device's newer choice of the current value when its older edit lands later", async () => {
    for (const firstWriter of ['phone', 'computer']) {
      const { store: profile, directory } = await store()
      await profile.update({ accent: { value: 'rose', baseRevision: 0, seq: 1 } }, firstWriter)
      // Tab 2 chooses rose again (edit 3) while tab 1's teal (edit 2) is slow.
      const again = await profile.update({ accent: { value: 'rose', baseRevision: 1, seq: 3 } }, 'phone')
      // No value changed, so no revision and no news.
      expect(again).toMatchObject({ settings: { revision: 1 }, conflicts: [] })

      const reloaded = new SettingsProfileStore(directory)
      await reloaded.initialize()
      const late = await reloaded.update({ accent: { value: 'teal', baseRevision: 1, seq: 2 } }, 'phone')
      expect(late.settings, firstWriter).toMatchObject({ revision: 1, values: { accent: 'rose' } })
      expect(late.conflicts).toEqual([])
    }
  })

  it('keeps a newer write from another device even after this device wrote that key earlier', async () => {
    const { store: profile } = await store()
    await profile.update({ accent: { value: 'teal', baseRevision: 0 } }, 'phone')
    await profile.update({ accent: { value: 'violet', baseRevision: 1 } }, 'computer')
    const stale = await profile.update({ accent: { value: 'rose', baseRevision: 0 } }, 'phone')
    expect(stale.conflicts).toEqual(['accent'])
    expect(stale.settings.values.accent).toBe('violet')
  })

  it('records the importing device, so its later edit from an old base still lands', async () => {
    const { store: profile } = await store()
    await profile.import({ accent: 'teal' }, 'phone')
    const edit = await profile.update({ accent: { value: 'rose', baseRevision: 0 } }, 'phone')
    expect(edit.conflicts).toEqual([])
    expect(edit.settings.values.accent).toBe('rose')
  })

  it('accepts a change made after seeing the other device', async () => {
    const { store: profile } = await store()
    await profile.update({ accent: { value: 'rose', baseRevision: 0 } })
    const later = await profile.update({ accent: { value: 'teal', baseRevision: 1 } })
    expect(later.conflicts).toEqual([])
    expect(later.settings.values.accent).toBe('teal')
  })

  it('resets a key to its default and keeps that reset from being imported over', async () => {
    const { store: profile } = await store()
    await profile.update({ appearance: { value: 'light', baseRevision: 0 } })
    const reset = await profile.update({ appearance: { value: null, baseRevision: 1 } })
    expect(reset.settings.values).toEqual({})
    expect(reset.settings.revision).toBe(2)

    const imported = await profile.import({ appearance: 'graphite', accent: 'violet' })
    expect(imported.values).toEqual({ accent: 'violet' })
  })

  it('imports only settings no device has chosen yet', async () => {
    const { store: profile } = await store()
    await profile.update({ accent: { value: 'ember', baseRevision: 0 } })
    const imported = await profile.import({
      accent: 'ocean',
      statusline: { sessionId: true },
      computerOrder: ['b', 'a'],
    })
    expect(imported.values).toEqual({
      accent: 'ember',
      statusline: { sessionId: true },
      computerOrder: ['b', 'a'],
    })
    expect(imported.revision).toBe(2)

    // A second device arriving later does not replace what the first set.
    const second = await profile.import({ computerOrder: ['a', 'b'] })
    expect(second.values.computerOrder).toEqual(['b', 'a'])
    expect(second.revision).toBe(2)
  })

  it('refuses unknown keys and malformed values without applying any of the request', async () => {
    const { store: profile } = await store()
    const cases: Array<Record<string, { value: unknown; baseRevision: number; seq?: number }>> = [
      { theme: { value: 'light', baseRevision: 0 } },
      { appearance: { value: 'neon', baseRevision: 0 } },
      { accent: { value: 7, baseRevision: 0 } },
      { statusline: { value: { sessionId: 'yes' }, baseRevision: 0 } },
      { statusline: { value: { password: true }, baseRevision: 0 } },
      { statusline: { value: [true], baseRevision: 0 } },
      { sessionSort: { value: 'random', baseRevision: 0 } },
      { oracleResponseStyle: { value: 'verbose', baseRevision: 0 } },
      { notificationScope: { value: 'sessions', baseRevision: 0 } },
      { notificationScope: { value: true, baseRevision: 0 } },
      { newSessionBackend: { value: 'tmux', baseRevision: 0 } },
      { newSessionBackend: { value: true, baseRevision: 0 } },
      { oracleResponseStyle: { value: 'Answer in one word.', baseRevision: 0 } },
      { computerOrder: { value: ['a', 'a'], baseRevision: 0 } },
      { computerOrder: { value: ['a', ''], baseRevision: 0 } },
      { computerOrder: { value: 'a', baseRevision: 0 } },
      { newSessionFolders: { value: { pc: '   ' }, baseRevision: 0 } },
      { newSessionFolders: { value: { pc: 'x'.repeat(4097) }, baseRevision: 0 } },
      { newSessionRuntimes: { value: { gemini: {} }, baseRevision: 0 } },
      {
        newSessionRuntimes: {
          value: {
            copilot: { model: 'gpt', reasoningEffort: 'turbo', contextTier: 'default', mode: '' },
          },
          baseRevision: 0,
        },
      },
      { accent: { value: 'ocean', baseRevision: -1 } },
      { accent: { value: 'ocean', baseRevision: 1.5 } },
      { accent: { value: 'ocean', baseRevision: 0, seq: -1 } },
      { accent: { value: 'ocean', baseRevision: 0, seq: 0.5 } },
    ]
    for (const changes of cases) {
      expect(
        await statusOf(profile.update({ sessionSort: { value: 'name', baseRevision: 0 }, ...changes })),
        JSON.stringify(changes),
      ).toBe(400)
    }
    expect(await statusOf(profile.import({ theme: 'light' }))).toBe(400)
    expect(profile.snapshot()).toMatchObject({ revision: 0, values: {} })
  })

  it('accepts every documented setting at its bounds', async () => {
    const { store: profile } = await store()
    const folders = Object.fromEntries(
      Array.from({ length: 64 }, (_, index) => [`computer-${index}`, `/home/me/src/${index}`]),
    )
    const result = await profile.update({
      appearance: { value: 'system', baseRevision: 0 },
      accent: { value: 'teal', baseRevision: 0 },
      statusline: { value: { enabled: true, sessionId: true, update: false }, baseRevision: 0 },
      newSessionRuntimes: {
        value: {
          copilot: {
            model: 'gpt-5-mini', reasoningEffort: 'high', contextTier: 'long_context', mode: 'plan',
          },
          claude: { model: '', reasoningEffort: '', contextTier: 'default', mode: '' },
        },
        baseRevision: 0,
      },
      newSessionFolders: { value: folders, baseRevision: 0 },
      sessionSort: { value: 'attention', baseRevision: 0 },
      oracleResponseStyle: { value: 'concise', baseRevision: 0 },
      notificationScope: { value: 'oracle', baseRevision: 0 },
      newSessionBackend: { value: 'sdk', baseRevision: 0 },
      computerOrder: {
        value: Array.from({ length: 200 }, (_, index) => `computer-${index}`),
        baseRevision: 0,
      },
    })
    expect(result.conflicts).toEqual([])
    expect(Object.keys(result.settings.values).sort()).toEqual([
      'accent', 'appearance', 'computerOrder', 'newSessionBackend', 'newSessionFolders',
      'newSessionRuntimes', 'notificationScope', 'oracleResponseStyle', 'sessionSort', 'statusline',
    ])
    expect(
      await statusOf(profile.update({
        newSessionFolders: {
          value: { ...folders, extra: '/tmp' },
          baseRevision: 1,
        },
      })),
    ).toBe(400)
    expect(
      await statusOf(profile.update({
        computerOrder: {
          value: Array.from({ length: 201 }, (_, index) => `computer-${index}`),
          baseRevision: 1,
        },
      })),
    ).toBe(400)
  })

  it('refuses a profile larger than its size limit', async () => {
    const { store: profile } = await store()
    const folders = Object.fromEntries(
      Array.from({ length: 64 }, (_, index) => [`computer-${index}`, `/${'x'.repeat(4000)}`]),
    )
    expect(
      await statusOf(profile.update({ newSessionFolders: { value: folders, baseRevision: 0 } })),
    ).toBe(413)
    expect(profile.snapshot().revision).toBe(0)
  })

  it('serializes overlapping commits so neither is lost', async () => {
    const { store: profile, directory } = await store()
    const results = await Promise.all([
      profile.update({ accent: { value: 'violet', baseRevision: 0 } }),
      profile.update({ sessionSort: { value: 'recent', baseRevision: 0 } }),
      profile.update({ appearance: { value: 'light', baseRevision: 0 } }),
    ])
    expect(results.map((result) => result.settings.revision)).toEqual([1, 2, 3])
    const reloaded = new SettingsProfileStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot().values).toEqual({
      accent: 'violet', sessionSort: 'recent', appearance: 'light',
    })
  })

  it('drops stored values it no longer understands rather than serving them', async () => {
    const { directory } = await store()
    await writeFile(
      path.join(directory, 'settings-profile.json'),
      JSON.stringify({
        version: 1,
        profileId: 'kept-id',
        revision: 4,
        values: { accent: 'infrared', appearance: 'light', retired: true },
        keyRevisions: { accent: 2, appearance: 3, retired: 1 },
      }),
    )
    const reloaded = new SettingsProfileStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot()).toEqual({
      profileId: 'kept-id', revision: 4, values: { appearance: 'light' },
    })
  })

  it('refuses to start from an unreadable or newer profile instead of discarding it', async () => {
    const { directory } = await store()
    const file = path.join(directory, 'settings-profile.json')
    await writeFile(file, '{not json')
    await expect(new SettingsProfileStore(directory).initialize()).rejects.toThrow(/not readable JSON/)
    await writeFile(file, JSON.stringify({ version: 2, revision: 1, values: {} }))
    await expect(new SettingsProfileStore(directory).initialize()).rejects.toThrow(/unsupported version 2/)
    expect(await readFile(file, 'utf8')).toContain('"version":2')
  })

  it('keeps the previous profile when a write fails', async () => {
    const { store: profile, directory } = await store()
    await profile.update({ accent: { value: 'violet', baseRevision: 0 } })
    await rm(directory, { recursive: true, force: true })
    await writeFile(directory, 'not a directory')
    await expect(profile.update({ accent: { value: 'rose', baseRevision: 1 } })).rejects.toThrow()
    expect(profile.snapshot()).toMatchObject({ revision: 1, values: { accent: 'violet' } })
    await rm(directory, { force: true })
  })
})
