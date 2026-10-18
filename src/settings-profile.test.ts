import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applySettingsChanges,
  applySettingsImport,
  validateSettingsChanges,
  validateSettingsImport,
  type SettingsProfileRecord,
  type SettingsProfileSnapshot,
} from '../shared/settings-profile'
import {
  readLegacySettings,
  resolveAppearance,
  SettingsProfileClient,
  settingsProfileCacheKey,
  type SettingsProfileTransport,
} from './settings-profile'
import indexHtml from '../index.html?raw'

class MemoryStorage {
  readonly items = new Map<string, string>()
  getItem(key: string) {
    return this.items.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.items.set(key, value)
  }
  removeItem(key: string) {
    this.items.delete(key)
  }
}

/** The hub, reduced to its shared commit rules and a broadcast. */
class FakeHub {
  profileId = 'profile-1'
  record: SettingsProfileRecord = { revision: 0, values: {}, keyRevisions: {} }
  reachable = true
  devices = new Set<SettingsProfileClient>()
  calls: string[] = []

  snapshot(): SettingsProfileSnapshot {
    return {
      profileId: this.profileId,
      revision: this.record.revision,
      values: structuredClone(this.record.values),
    }
  }

  private check(call: string) {
    this.calls.push(call)
    if (!this.reachable) throw new TypeError('Failed to fetch')
  }

  private publish(before: number, from?: SettingsProfileClient) {
    if (this.record.revision === before) return
    const snapshot = this.snapshot()
    for (const device of this.devices) if (device !== from) device.receive(snapshot)
  }

  transport(device: () => SettingsProfileClient): SettingsProfileTransport {
    return {
      fetch: async () => {
        this.check('fetch')
        return this.snapshot()
      },
      update: async (changes, deviceId) => {
        this.check('update')
        const before = this.record.revision
        const result = applySettingsChanges(this.record, validateSettingsChanges(changes), deviceId)
        this.record = result.record
        this.publish(before, device())
        return { settings: this.snapshot(), conflicts: result.conflicts }
      },
      import: async (values, deviceId) => {
        this.check('import')
        const before = this.record.revision
        this.record = applySettingsImport(
          this.record,
          validateSettingsImport(values as Record<string, unknown>),
          deviceId,
        )
        this.publish(before, device())
        return this.snapshot()
      },
    }
  }

  device(storage = new MemoryStorage(), legacy = {}) {
    const client: SettingsProfileClient = new SettingsProfileClient({
      transport: this.transport(() => client),
      storage,
      legacy: () => legacy,
      retryDelaysMs: [1_000, 5_000],
    })
    this.devices.add(client)
    return { client, storage }
  }

  reset() {
    this.profileId = `profile-${Math.random()}`
    this.record = { revision: 0, values: {}, keyRevisions: {} }
  }
}

function cached(storage: MemoryStorage) {
  return JSON.parse(storage.getItem(settingsProfileCacheKey) || 'null')
}

describe('SettingsProfileClient', () => {
  let hub: FakeHub

  beforeEach(() => {
    hub = new FakeHub()
  })

  afterEach(() => {
    vi.useRealTimers()
    for (const device of hub.devices) device.stop()
  })

  it('starts a first visit from defaults and reports it in sync', async () => {
    const { client } = hub.device()
    expect(client.getState()).toMatchObject({ values: {}, status: 'loading' })
    await client.sync()
    expect(client.getState()).toMatchObject({ values: {}, status: 'synced', conflicts: [] })
    // Nothing to bring along, so nothing is imported.
    expect(hub.calls).toEqual(['fetch'])
  })

  it('applies an explicit choice at once and keeps it on the hub', async () => {
    const { client, storage } = hub.device()
    await client.sync()
    client.set('appearance', 'light')
    expect(client.getState().values.appearance).toBe('light')
    expect(cached(storage).pending.appearance.value).toBe('light')
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    expect(hub.record.values.appearance).toBe('light')
    expect(cached(storage)).toMatchObject({
      profileId: 'profile-1', revision: 1, values: { appearance: 'light' }, pending: {},
    })
  })

  it('renders the last known profile on reload before the hub answers', async () => {
    const first = hub.device()
    await first.client.sync()
    first.client.set('accent', 'violet')
    await vi.waitFor(() => expect(first.client.getState().status).toBe('synced'))
    first.client.stop()

    hub.reachable = false
    const reopened = new SettingsProfileClient({
      transport: hub.transport(() => reopened),
      storage: first.storage,
      legacy: () => ({ accent: 'rose' }),
    })
    // Read synchronously from this device's copy, not from the stale tab accent.
    expect(reopened.getState().values.accent).toBe('violet')
    reopened.stop()
  })

  it('loads everything from the hub after this device forgets its storage', async () => {
    const phone = hub.device()
    await phone.client.sync()
    phone.client.set('accent', 'teal')
    phone.client.set('sessionSort', 'recent')
    await vi.waitFor(() => expect(phone.client.getState().status).toBe('synced'))

    const signedBackIn = hub.device(new MemoryStorage())
    expect(signedBackIn.client.getState().values).toEqual({})
    await signedBackIn.client.sync()
    expect(signedBackIn.client.getState().values).toEqual({ accent: 'teal', sessionSort: 'recent' })
  })

  it('shows another device’s change as it happens without disturbing a different setting', async () => {
    const computer = hub.device()
    const phone = hub.device()
    await Promise.all([computer.client.sync(), phone.client.sync()])
    computer.client.set('accent', 'ember')
    phone.client.set('statusline', { sessionId: true })
    await vi.waitFor(() => {
      expect(computer.client.getState().status).toBe('synced')
      expect(phone.client.getState().status).toBe('synced')
    })
    for (const device of [computer, phone]) {
      expect(device.client.getState()).toMatchObject({
        values: { accent: 'ember', statusline: { sessionId: true } },
        conflicts: [],
      })
    }
  })

  it('keeps the newer choice from another device and says so instead of overwriting it', async () => {
    const computer = hub.device()
    const phone = hub.device()
    await Promise.all([computer.client.sync(), phone.client.sync()])
    // The phone loses its connection, so it does not hear about the computer's choice.
    hub.devices.delete(phone.client)
    hub.reachable = false
    phone.client.set('accent', 'teal')
    phone.client.set('sessionSort', 'name')
    await vi.waitFor(() => expect(phone.client.getState().status).toBe('offline'))
    hub.reachable = true
    computer.client.set('accent', 'rose')
    await vi.waitFor(() => expect(computer.client.getState().status).toBe('synced'))

    await phone.client.sync()
    await vi.waitFor(() => expect(phone.client.getState().status).toBe('synced'))
    expect(phone.client.getState()).toMatchObject({
      values: { accent: 'rose', sessionSort: 'name' },
      conflicts: ['accent'],
    })
    expect(hub.record.values).toEqual({ accent: 'rose', sessionSort: 'name' })
    phone.client.dismissNotice()
    expect(phone.client.getState().conflicts).toEqual([])
  })

  it('keeps offline changes on this device and sends them once the hub is back', async () => {
    vi.useFakeTimers()
    const { client, storage } = hub.device()
    hub.reachable = false
    await client.sync()
    expect(client.getState().status).toBe('offline')
    client.set('appearance', 'light')
    await vi.advanceTimersByTimeAsync(0)
    expect(client.getState()).toMatchObject({ status: 'offline', values: { appearance: 'light' } })
    expect(cached(storage).pending.appearance.value).toBe('light')

    hub.reachable = true
    await vi.advanceTimersByTimeAsync(1_000)
    expect(client.getState().status).toBe('synced')
    expect(hub.record.values).toEqual({ appearance: 'light' })
  })

  it('backs off between retries while the hub stays unreachable', async () => {
    vi.useFakeTimers()
    const { client } = hub.device()
    hub.reachable = false
    await client.sync()
    const attempts = () => hub.calls.filter((call) => call === 'fetch').length
    expect(attempts()).toBe(1)
    await vi.advanceTimersByTimeAsync(1_000)
    expect(attempts()).toBe(2)
    await vi.advanceTimersByTimeAsync(4_999)
    expect(attempts()).toBe(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(attempts()).toBe(3)
    // The last delay repeats rather than growing without bound.
    await vi.advanceTimersByTimeAsync(5_000)
    expect(attempts()).toBe(4)
  })

  it('sends the latest of several quick edits without reporting a conflict with itself', async () => {
    const { client } = hub.device()
    await client.sync()
    client.set('accent', 'ocean')
    client.set('accent', 'violet')
    client.set('accent', 'rose')
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    expect(hub.record.values.accent).toBe('rose')
    expect(client.getState()).toMatchObject({ values: { accent: 'rose' }, conflicts: [] })
  })

  it('brings this device’s earlier settings to the hub, first device first', async () => {
    const computer = hub.device(new MemoryStorage(), {
      appearance: 'light', accent: 'violet', computerOrder: ['b', 'a'],
    })
    expect(computer.client.getState().values).toEqual({
      appearance: 'light', accent: 'violet', computerOrder: ['b', 'a'],
    })
    await computer.client.sync()
    expect(hub.record.values).toEqual({
      appearance: 'light', accent: 'violet', computerOrder: ['b', 'a'],
    })

    const phone = hub.device(new MemoryStorage(), { accent: 'rose', sessionSort: 'name' })
    await phone.client.sync()
    expect(phone.client.getState().values).toEqual({
      appearance: 'light', accent: 'violet', computerOrder: ['b', 'a'], sessionSort: 'name',
    })
    // Once imported, a later sync on the same device offers nothing again.
    hub.calls.length = 0
    await phone.client.sync()
    expect(hub.calls).toEqual(['fetch'])
  })

  it('offers its last known profile to a hub whose profile was recreated', async () => {
    const { client } = hub.device()
    await client.sync()
    client.set('accent', 'teal')
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    hub.reset()
    await client.sync()
    expect(hub.record.values).toEqual({ accent: 'teal' })
    expect(client.getState()).toMatchObject({ values: { accent: 'teal' }, status: 'synced' })
  })

  it('ignores a late event older than what it already shows', async () => {
    const { client } = hub.device()
    await client.sync()
    client.set('accent', 'rose')
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    client.receive({ profileId: 'profile-1', revision: 0, values: { accent: 'ocean' } })
    expect(client.getState().values.accent).toBe('rose')
  })

  it('drops and reports a change the hub refuses instead of retrying it forever', async () => {
    const refusal = Object.assign(new Error('Setting accent is not a known accent'), {
      statusCode: 400,
    })
    const transport: SettingsProfileTransport = {
      fetch: async () => hub.snapshot(),
      update: vi.fn(async () => {
        throw refusal
      }),
      import: async () => hub.snapshot(),
    }
    const client = new SettingsProfileClient({ transport, storage: new MemoryStorage() })
    await client.sync()
    client.set('accent', 'ocean')
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    expect(client.getState()).toMatchObject({
      values: {},
      refused: 'Setting accent is not a known accent',
      refusedKey: 'accent',
    })
    expect(transport.update).toHaveBeenCalledTimes(1)
    client.stop()
  })

  it("keeps a newer edit when its earlier write committed but the answer was lost", async () => {
    vi.useFakeTimers()
    const storage = new MemoryStorage()
    const real = hub.transport(() => client)
    let loseNextAnswer = true
    const client: SettingsProfileClient = new SettingsProfileClient({
      transport: {
        ...real,
        update: async (changes, deviceId) => {
          const result = await real.update(changes, deviceId)
          if (loseNextAnswer) {
            loseNextAnswer = false
            throw new TypeError('Failed to fetch')
          }
          return result
        },
      },
      storage,
      retryDelaysMs: [1_000],
    })
    hub.devices.add(client)
    await client.sync()
    client.set('accent', 'teal')
    await vi.advanceTimersByTimeAsync(0)
    expect(hub.record.values.accent).toBe('teal')
    expect(client.getState().status).toBe('offline')
    // Still offline as far as it knows, the user changes their mind.
    client.set('accent', 'rose')
    await vi.advanceTimersByTimeAsync(1_000)
    expect(client.getState()).toMatchObject({ status: 'synced', conflicts: [], values: { accent: 'rose' } })
    expect(hub.record.values.accent).toBe('rose')
  })

  it('brings the earlier settings the hub can take when one of them is too large', async () => {
    const huge = Object.fromEntries(
      Array.from({ length: 64 }, (_, index) => [`pc-${index}`, `/${'x'.repeat(4000)}`]),
    )
    const { client } = hub.device(new MemoryStorage(), {
      accent: 'violet', newSessionFolders: huge, sessionSort: 'name',
    })
    await client.sync()
    expect(hub.record.values).toEqual({ accent: 'violet', sessionSort: 'name' })
    expect(client.getState()).toMatchObject({
      values: { accent: 'violet', sessionSort: 'name' },
      refused: 'Settings would exceed 32 KB',
      refusedKey: 'newSessionFolders',
      status: 'synced',
    })
    // Nothing is left to offer again on the next sync.
    hub.calls.length = 0
    await client.sync()
    expect(hub.calls).toEqual(['fetch'])
  })

  it('saves the other changes in a batch when the hub refuses one of them', async () => {
    const { client } = hub.device()
    await client.sync()
    hub.reachable = false
    client.set('accent', 'teal')
    client.set('newSessionFolders', Object.fromEntries(
      Array.from({ length: 64 }, (_, index) => [`pc-${index}`, `/${'x'.repeat(4000)}`]),
    ))
    client.set('sessionSort', 'recent')
    await vi.waitFor(() => expect(client.getState().status).toBe('offline'))
    hub.reachable = true
    await client.sync()
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    expect(hub.record.values).toEqual({ accent: 'teal', sessionSort: 'recent' })
    expect(client.getState()).toMatchObject({
      values: { accent: 'teal', sessionSort: 'recent' },
      refusedKey: 'newSessionFolders',
    })
  })

  it('keeps every tab’s offline edits, even after the tab that made one closes', async () => {
    const storage = new MemoryStorage()
    const first = hub.device(storage)
    const second = hub.device(storage)
    await Promise.all([first.client.sync(), second.client.sync()])
    hub.reachable = false
    first.client.set('accent', 'teal')
    first.client.stop()
    hub.devices.delete(first.client)
    // The second tab has not heard about the first tab's edit when it makes its own.
    second.client.set('sessionSort', 'name')
    expect(second.client.getState().values).toEqual({ accent: 'teal', sessionSort: 'name' })
    await vi.waitFor(() => expect(second.client.getState().status).toBe('offline'))
    second.client.stop()
    hub.devices.delete(second.client)

    // A reopened tab starts from both, and sends both once the hub is back.
    hub.reachable = true
    const reopened = hub.device(storage)
    expect(reopened.client.getState().values).toEqual({ accent: 'teal', sessionSort: 'name' })
    await reopened.client.sync()
    await vi.waitFor(() => expect(reopened.client.getState().status).toBe('synced'))
    expect(hub.record.values).toEqual({ accent: 'teal', sessionSort: 'name' })
    expect(reopened.client.getState().conflicts).toEqual([])
  })

  it.each([
    ['a new value', undefined],
    ['the value the hub already has', 'rose'],
  ] as const)('keeps the newer edit when two tabs change one setting to %s and the older request lands last', async (_case, already) => {
    if (already) {
      hub.record = applySettingsChanges(
        hub.record, validateSettingsChanges({ accent: { value: already, baseRevision: 0 } }),
      ).record
    }
    const storage = new MemoryStorage()
    let release!: () => void
    const held = new Promise<void>((resolve) => { release = resolve })
    let holdNext = true
    const tab = (hold: boolean) => {
      const real = hub.transport(() => client)
      const client: SettingsProfileClient = new SettingsProfileClient({
        transport: {
          ...real,
          update: async (changes, deviceId) => {
            // The first tab's request is slow to reach the hub.
            if (hold && holdNext) {
              holdNext = false
              await held
            }
            return real.update(changes, deviceId)
          },
        },
        storage,
      })
      hub.devices.add(client)
      return client
    }
    const first = tab(true)
    const second = tab(false)
    await Promise.all([first.sync(), second.sync()])
    first.set('accent', 'teal')
    await vi.waitFor(() => expect(first.getState().status).toBe('saving'))
    second.set('accent', 'rose')
    await vi.waitFor(() => expect(hub.record.values.accent).toBe('rose'))
    release()
    await vi.waitFor(() => {
      expect(first.getState().status).toBe('synced')
      expect(second.getState().status).toBe('synced')
    })
    expect(hub.record.values.accent).toBe('rose')
    first.refreshFromStorage()
    for (const client of [first, second]) {
      expect(client.getState()).toMatchObject({ values: { accent: 'rose' }, conflicts: [] })
    }
  })

  it('shows another tab’s change as soon as the shared copy changes', async () => {
    const storage = new MemoryStorage()
    const first = hub.device(storage)
    const second = hub.device(storage)
    await Promise.all([first.client.sync(), second.client.sync()])
    hub.devices.delete(second.client)
    first.client.set('appearance', 'light')
    expect(second.client.getState().values.appearance).toBeUndefined()
    second.client.refreshFromStorage()
    expect(second.client.getState().values.appearance).toBe('light')
  })

  it('refuses to record a malformed value locally', async () => {
    const { client } = hub.device()
    await client.sync()
    expect(() => client.set('accent', 'infrared' as never)).toThrow(/not a known accent/)
    expect(client.getState().values).toEqual({})
  })

  it('resets a setting to its default everywhere', async () => {
    const { client } = hub.device()
    await client.sync()
    client.set('appearance', 'light')
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    client.set('appearance', null)
    expect(client.getState().values.appearance).toBeUndefined()
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    expect(hub.record.values).toEqual({})
  })

  it('ignores a corrupted copy on this device and recovers from the hub', async () => {
    const storage = new MemoryStorage()
    storage.setItem(settingsProfileCacheKey, '{broken')
    hub.record = applySettingsImport(hub.record, [['accent', 'ember']])
    const { client } = hub.device(storage)
    expect(client.getState().values).toEqual({})
    await client.sync()
    expect(client.getState().values).toEqual({ accent: 'ember' })
  })

  it('still works when this device cannot keep a copy', async () => {
    const storage = new MemoryStorage()
    storage.setItem = () => {
      throw new Error('Storage unavailable')
    }
    const { client } = hub.device(storage)
    await client.sync()
    client.set('accent', 'ocean')
    expect(client.getState()).toMatchObject({ values: { accent: 'ocean' }, deviceCopy: false })
    await vi.waitFor(() => expect(client.getState().status).toBe('synced'))
    expect(hub.record.values.accent).toBe('ocean')
  })
})

describe('readLegacySettings', () => {
  it('collects the settings this browser chose before the hub kept them', () => {
    const local = new MemoryStorage()
    const session = new MemoryStorage()
    local.setItem('agentic-remote:appearance', JSON.stringify('light'))
    session.setItem('agentic-remote:accent-theme', 'rose')
    local.setItem('agentic-remote:statusline', JSON.stringify({ sessionId: true, model: false, retired: true }))
    local.setItem('agentic-remote:default-models', JSON.stringify({
      copilot: { model: 'gpt-5-mini', reasoningEffort: 'high', contextTier: 'long_context', mode: 'plan' },
      claude: 'sonnet',
    }))
    local.setItem('agentic-remote:default-session-folders', JSON.stringify({
      version: 1, folders: { pc: '/home/me/src', other: '  ' },
    }))
    local.setItem('agentic-remote:session-sort', JSON.stringify('attention'))
    local.setItem('agentic-remote:computer-order', JSON.stringify(['b', 'a', 'b', 7]))
    expect(readLegacySettings(local, session)).toEqual({
      appearance: 'light',
      accent: 'rose',
      statusline: { sessionId: true, model: false },
      newSessionRuntimes: {
        copilot: { model: 'gpt-5-mini', reasoningEffort: 'high', contextTier: 'long_context', mode: 'plan' },
        claude: { model: 'sonnet', reasoningEffort: '', contextTier: 'default', mode: '' },
      },
      newSessionFolders: { pc: '/home/me/src' },
      sessionSort: 'attention',
      computerOrder: ['b', 'a'],
    })
  })

  it('brings nothing for settings that were never chosen or no longer make sense', () => {
    const local = new MemoryStorage()
    const session = new MemoryStorage()
    local.setItem('agentic-remote:appearance', '{broken')
    session.setItem('agentic-remote:accent-theme', 'infrared')
    local.setItem('agentic-remote:statusline', JSON.stringify(null))
    local.setItem('agentic-remote:session-sort', JSON.stringify('random'))
    expect(readLegacySettings(local, session)).toEqual({})
  })
})

describe('resolveAppearance', () => {
  it('follows the device until a choice is made, then keeps the choice', () => {
    expect(resolveAppearance(undefined, true)).toBe('light')
    expect(resolveAppearance(undefined, false)).toBe('graphite')
    expect(resolveAppearance('system', true)).toBe('light')
    expect(resolveAppearance('graphite', true)).toBe('graphite')
    expect(resolveAppearance('light', false)).toBe('light')
  })
})

describe('index.html appearance bootstrap', () => {
  const inline = [...indexHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1])

  function boot(local: MemoryStorage, prefersLight: boolean) {
    const dataset: Record<string, string> = {}
    const meta = { content: '#111210' }
    const document = {
      documentElement: { dataset },
      querySelector: (selector: string) =>
        selector === 'meta[name="theme-color"]' ? meta : null,
    }
    const window = {
      matchMedia: (query: string) => ({
        matches: query === '(prefers-color-scheme: light)' ? prefersLight : !prefersLight,
      }),
    }
    expect(inline).toHaveLength(1)
    new Function('document', 'window', 'localStorage', inline[0])(document, window, local)
    return { appearance: dataset.appearance, themeColor: meta.content }
  }

  const cases: Array<{
    name: string
    cache?: unknown
    legacy?: unknown
    prefersLight: boolean
  }> = [
    { name: 'a first visit on a light device', prefersLight: true },
    { name: 'a first visit on a dark device', prefersLight: false },
    { name: 'an explicit Graphite on a light device', prefersLight: true, cache: { values: { appearance: 'graphite' } } },
    { name: 'an explicit Light on a dark device', prefersLight: false, cache: { values: { appearance: 'light' } } },
    { name: 'an unsent Light over Graphite', prefersLight: false, cache: { values: { appearance: 'graphite' }, pending: { appearance: { value: 'light', baseRevision: 0 } } } },
    { name: 'an unsent reset to System', prefersLight: true, cache: { values: { appearance: 'graphite' }, pending: { appearance: { value: null, baseRevision: 0 } } } },
    { name: 'System on a dark device', prefersLight: false, cache: { values: { appearance: 'system' } } },
    { name: 'a legacy Light before the first sync', prefersLight: false, legacy: 'light' },
    { name: 'a pending import', prefersLight: false, cache: { values: {}, imports: { appearance: 'light' } } },
    { name: 'a corrupted copy', prefersLight: true, cache: '{broken' },
  ]

  it.each(cases)('matches the app for $name', ({ cache, legacy, prefersLight }) => {
    const local = new MemoryStorage()
    if (cache !== undefined) {
      local.setItem(
        settingsProfileCacheKey,
        typeof cache === 'string'
          ? cache
          : JSON.stringify({ version: 1, revision: 0, values: {}, pending: {}, ...(cache as object) }),
      )
    }
    if (legacy !== undefined) local.setItem('agentic-remote:appearance', JSON.stringify(legacy))
    // The page paints before the app has touched this device's copy.
    const painted = boot(local, prefersLight)
    const client = new SettingsProfileClient({
      transport: {
        fetch: () => new Promise(() => {}),
        update: () => new Promise(() => {}),
        import: () => new Promise(() => {}),
      },
      storage: local,
      legacy: () => readLegacySettings(local, new MemoryStorage()),
    })
    const expected = resolveAppearance(client.getState().values.appearance, prefersLight)
    client.stop()
    expect(painted).toEqual({
      appearance: expected,
      themeColor: expected === 'light' ? '#f5f7f9' : '#181d24',
    })
  })
})
