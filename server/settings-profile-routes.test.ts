import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent } from '../shared/contracts.js'
import type { ComputerManager } from './computer-manager.js'
import type { KnowledgeStore } from './knowledge-store.js'
import { registerHubRoutes } from './hub-routes.js'
import { SettingsProfileStore } from './settings-profile-store.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

async function profileStore(): Promise<SettingsProfileStore> {
  const directory = await mkdtemp(path.join(tmpdir(), 'hub-settings-profile-'))
  directories.push(directory)
  const store = new SettingsProfileStore(directory)
  await store.initialize()
  return store
}

function fakeManager() {
  return Object.assign(new EventEmitter(), {
    captureComputerRegistration: () => () => true,
    listSessions: async () => [],
  }) as unknown as ComputerManager & EventEmitter
}

async function hub(store: SettingsProfileStore | undefined) {
  const app = Fastify()
  await app.register(fastifyWebsocket)
  await registerHubRoutes(
    app, fakeManager(), {} as KnowledgeStore, undefined, undefined, undefined, undefined, store,
  )
  return app
}

const local = { host: 'localhost' }

describe('hub settings profile routes', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('serves the profile and commits a change with its conflicts', async () => {
    const store = await profileStore()
    const app = await hub(store)

    const empty = await app.inject({ method: 'GET', url: '/api/settings', headers: local })
    expect(empty.statusCode).toBe(200)
    expect(empty.headers['cache-control']).toBe('no-store')
    expect(empty.json()).toEqual({
      settings: { profileId: store.snapshot().profileId, revision: 0, values: {} },
    })

    const saved = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      headers: local,
      payload: { changes: { accent: { value: 'ocean', baseRevision: 0 } } },
    })
    expect(saved.statusCode).toBe(200)
    expect(saved.json()).toEqual({
      settings: { profileId: store.snapshot().profileId, revision: 1, values: { accent: 'ocean' } },
      conflicts: [],
    })

    const stale = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      headers: local,
      payload: { changes: { accent: { value: 'rose', baseRevision: 0 } } },
    })
    expect(stale.json()).toMatchObject({
      settings: { revision: 1, values: { accent: 'ocean' } },
      conflicts: ['accent'],
    })
    await app.close()
  })

  it("passes the device along, so a device's own lost write is not a conflict", async () => {
    const store = await profileStore()
    const app = await hub(store)
    const send = (value: string) => app.inject({
      method: 'PATCH',
      url: '/api/settings',
      headers: local,
      payload: { deviceId: 'phone-1', changes: { accent: { value, baseRevision: 0 } } },
    })
    await send('teal')
    const retry = await send('rose')
    expect(retry.json()).toMatchObject({ settings: { values: { accent: 'rose' } }, conflicts: [] })
    await app.close()
  })

  it('persists validated preview preferences without accepting hub flags as preferences', async () => {
    const store = await profileStore()
    const app = await hub(store)
    try {
      const saved = await app.inject({
        method: 'PATCH', url: '/api/settings', headers: local,
        payload: { changes: { previewFeatures: { value: { composerRefresh: true, schedulerView: true }, baseRevision: 0 } } },
      })
      expect(saved.statusCode).toBe(200)
      expect(saved.json().settings.values.previewFeatures).toEqual({ composerRefresh: true, schedulerView: true })
      for (const value of [{ schedulerView: 'on' }]) {
        expect((await app.inject({
          method: 'PATCH', url: '/api/settings', headers: local,
          payload: { changes: { previewFeatures: { value, baseRevision: 1 } } },
        })).statusCode).toBe(400)
      }
      const future = await app.inject({
        method: 'PATCH', url: '/api/settings', headers: local,
        payload: { changes: { previewFeatures: {
          value: { composerRefresh: true, schedulerView: true, scheduler: true, futurePreview: true }, baseRevision: 1,
        } } },
      })
      expect(future.statusCode).toBe(200)
      expect(future.json().settings.values.previewFeatures).toEqual({ composerRefresh: true, schedulerView: true })
      expect(store.snapshot().revision).toBe(1)
    } finally {
      await app.close()
    }
  })

  it('imports only settings that were never chosen', async () => {
    const store = await profileStore()
    await store.update({ accent: { value: 'teal', baseRevision: 0 } })
    const app = await hub(store)
    const imported = await app.inject({
      method: 'POST',
      url: '/api/settings/import',
      headers: local,
      payload: { values: { accent: 'rose', appearance: 'light' } },
    })

    expect(imported.statusCode).toBe(200)
    expect(imported.json().settings.values).toEqual({ accent: 'teal', appearance: 'light' })
    await app.close()
  })

  it('exposes only the hub display-name default on the opt-in settings read', async () => {
    const app = await hub(await profileStore())
    const response = await app.inject({ url: '/api/settings?defaults=displayName', headers: local })
    expect(response.statusCode).toBe(200)
    expect(Object.keys(response.json()).sort()).toEqual(['defaultDisplayName', 'settings'])
    expect(response.json().defaultDisplayName).toEqual(expect.any(String))
    expect((await app.inject({ url: '/api/settings?defaults=displayName',
      headers: { host: 'localhost', origin: 'https://evil.example' } })).statusCode).toBe(403)
    await app.close()
  })

  it('refuses malformed, unknown, and oversized requests without changing anything', async () => {
    const store = await profileStore()
    const app = await hub(store)
    const attempts = [
      { method: 'PATCH', payload: { changes: { theme: { value: 'light', baseRevision: 0 } } } },
      { method: 'PATCH', payload: { changes: { accent: { value: 'infrared', baseRevision: 0 } } } },
      { method: 'PATCH', payload: { changes: { accent: { value: 'ocean' } } } },
      { method: 'PATCH', payload: { changes: { accent: 'ocean' } } },
      { method: 'PATCH', payload: { accent: 'ocean' } },
      { method: 'PATCH', payload: { changes: {}, extra: true } },
      { method: 'POST', url: '/api/settings/import', payload: { values: { accent: 4 } } },
      { method: 'POST', url: '/api/settings/import', payload: { values: [] } },
      {
        method: 'PATCH',
        payload: { deviceId: 'x'.repeat(101), changes: { accent: { value: 'ocean', baseRevision: 0 } } },
      },
      { method: 'POST', url: '/api/settings/import', payload: { deviceId: '', values: {} } },
      { method: 'PATCH', payload: { changes: { accent: { value: 'ocean', baseRevision: 0, seq: -1 } } } },
    ] as const
    for (const attempt of attempts) {
      const response = await app.inject({
        method: attempt.method,
        url: 'url' in attempt ? attempt.url : '/api/settings',
        headers: local,
        payload: attempt.payload,
      })
      expect(response.statusCode, JSON.stringify(attempt)).toBe(400)
    }
    const oversized = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      headers: local,
      payload: {
        changes: {
          newSessionFolders: {
            value: Object.fromEntries(
              Array.from({ length: 20 }, (_, index) => [`pc-${index}`, `/${'x'.repeat(4000)}`]),
            ),
            baseRevision: 0,
          },
        },
      },
    })
    expect(oversized.statusCode).toBe(413)
    expect(store.snapshot()).toMatchObject({ revision: 0, values: {} })
    await app.close()
  })

  it('refuses a foreign origin before reading or writing the profile', async () => {
    const store = await profileStore()
    const app = await hub(store)
    const foreign = { host: 'localhost:4317', origin: 'https://evil.example' }
    const read = await app.inject({ method: 'GET', url: '/api/settings', headers: foreign })
    const write = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      headers: foreign,
      payload: { changes: { accent: { value: 'ocean', baseRevision: 0 } } },
    })
    expect(read.statusCode).toBe(403)
    expect(write.statusCode).toBe(403)
    expect(store.snapshot().revision).toBe(0)
    await app.close()
  })

  it('answers 503 when the hub has no profile store', async () => {
    const app = await hub(undefined)
    const response = await app.inject({ method: 'GET', url: '/api/settings', headers: local })
    expect(response.statusCode).toBe(503)
    await app.close()
  })

  it('tells every connected device about a committed change, and only then', async () => {
    const store = await profileStore()
    const app = await hub(store)
    await app.ready()
    const socket = await app.injectWS('/api/events', { headers: local })
    const events: HubEvent[] = []
    socket.on('message', (data) => events.push(JSON.parse(String(data)) as HubEvent))

    await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      headers: local,
      payload: { changes: { appearance: { value: 'light', baseRevision: 0 } } },
    })
    // Repeating it changes nothing and must not look like news.
    await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      headers: local,
      payload: { changes: { appearance: { value: 'light', baseRevision: 1 } } },
    })
    await vi.waitFor(() => expect(events).toHaveLength(1))
    expect(events[0]).toEqual({
      type: 'settings.updated',
      settings: { profileId: store.snapshot().profileId, revision: 1, values: { appearance: 'light' } },
    })
    socket.terminate()
    await app.close()
  })
})
