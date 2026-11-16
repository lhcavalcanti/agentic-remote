import type { Page, Route, WebSocketRoute } from '@playwright/test'
import { describe, expect, it, vi } from 'vitest'
import type { KnowledgeRoot, ManagedSession, SessionKnowledgeBinding } from '../shared/contracts'
import { ORACLE_VOICE_PROTOCOL, type VoiceCapabilities } from '../shared/oracle-voice'
import type { SettingsProfileSnapshot, SettingsUpdateResult } from '../shared/settings-profile'
import {
  createWorkspaceFixtureState,
  fixtureKnowledgeRoots,
  KNOWLEDGE_FILE_PATH,
  KNOWLEDGE_ROOT_ID,
  SELECTED_SESSION_ID,
  setupWorkspaceFixture,
} from './workspace-fixtures'

async function fixtureApi() {
  let handler!: (route: Route) => Promise<void>
  let socketHandler!: (socket: WebSocketRoute) => void
  const context = {
    addInitScript: vi.fn(),
    routeWebSocket: vi.fn((_pattern: string, callback: typeof socketHandler) => { socketHandler = callback }),
    route: vi.fn(async (_pattern: string, callback: typeof handler) => { handler = callback }),
  }
  const page = {
    on: vi.fn(),
    clock: { setFixedTime: vi.fn() },
    context: () => context,
  } as unknown as Page
  const state = createWorkspaceFixtureState()
  const fixture = await setupWorkspaceFixture(page, { baseUrl: 'http://127.0.0.1:4840', state })
  async function request<T = Record<string, unknown>>(path: string, method = 'GET', body?: object) {
    const fulfill = vi.fn<(response: { status?: number; body?: string }) => Promise<void>>()
      .mockResolvedValue(undefined)
    await handler({
      request: () => ({
        url: () => `http://127.0.0.1:4840${path}`,
        method: () => method,
        postDataJSON: () => body,
      }),
      fulfill,
    } as unknown as Route)
    const response = fulfill.mock.calls[0][0]
    return { status: response.status ?? 200, body: JSON.parse(response.body ?? '{}') as T }
  }
  /** Opens the app's event socket and returns what the fixture sends on it. */
  function openEvents() {
    const sent: unknown[] = []
    socketHandler({
      url: () => 'ws://127.0.0.1:4840/api/events?patches=1',
      onClose: vi.fn(),
      onMessage: vi.fn(),
      send: (message: string) => { sent.push(JSON.parse(message)) },
      close: vi.fn(),
    } as unknown as WebSocketRoute)
    return sent
  }
  return { fixture, openEvents, request, state }
}

describe('workspace fixture directory routing', () => {
  it.each([
    ['fixture-studio', '~', '/home/demo'],
    ['fixture-studio', '/home/demo', '/home/demo'],
    ['fixture-studio', '/home/demo/field-notes', '/home/demo/field-notes'],
    ['fixture-build', '/home/demo/workspace-checks/docs', '/home/demo/workspace-checks/docs'],
  ])('lists an allowed directory independently of Knowledge file routes: %s %s', async (computerId, path, expected) => {
    const { fixture, request } = await fixtureApi()
    const response = await request(`/api/computers/${computerId}/directories?path=${encodeURIComponent(path)}`)
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ path: expected, directories: expect.any(Array) })
    fixture.assertHealthy()
  })

  it('keeps directory discovery, root creation, conflict, and explicit retry coherent', async () => {
    const { fixture, request, state } = await fixtureApi()
    expect((await request('/api/computers/fixture-studio/directories?path=~')).status).toBe(200)
    const created = await request<{ root: KnowledgeRoot }>('/api/knowledge/roots', 'POST', {
      computerId: 'fixture-studio', path: '/home/demo',
    })
    expect(created.status).toBe(201)
    expect(created.body.root.id).toBe('fixture-created-1')
    const key = `fixture-studio:${SELECTED_SESSION_ID}`
    const latest: SessionKnowledgeBinding = {
      ...state.bindings.get(key)!,
      rootId: fixtureKnowledgeRoots[1].id,
      root: fixtureKnowledgeRoots[1],
      revision: 2,
    }
    fixture.emit({
      type: 'session.knowledge.updated', computerId: 'fixture-studio',
      sessionId: SELECTED_SESSION_ID, binding: latest,
    })
    const path = `/api/computers/fixture-studio/sessions/${SELECTED_SESSION_ID}/knowledge-root`
    const conflict = await request<{ binding: SessionKnowledgeBinding }>(path, 'PUT', {
      rootId: created.body.root.id, expectedRevision: 1,
    })
    expect(conflict.status).toBe(409)
    expect(conflict.body.binding).toEqual(latest)
    expect(state.bindings.get(key)).toEqual(latest)
    const retry = await request<{ binding: SessionKnowledgeBinding }>(path, 'PUT', {
      rootId: created.body.root.id, expectedRevision: 2,
    })
    expect(retry.status).toBe(200)
    expect(retry.body.binding).toMatchObject({ rootId: created.body.root.id, revision: 3, available: true })
    fixture.assertHealthy()
  })

  it('keeps Knowledge entries and files reachable', async () => {
    const { fixture, request } = await fixtureApi()
    expect((await request(`/api/knowledge/roots/${KNOWLEDGE_ROOT_ID}/entries?path=.`)).status).toBe(200)
    expect((await request(`/api/knowledge/roots/${KNOWLEDGE_ROOT_ID}/file?path=${KNOWLEDGE_FILE_PATH}`)).status).toBe(200)
    fixture.assertHealthy()
  })

  it.each([
    ['/api/computers/fixture-studio/directories?path=/not-in-the-fixture', 'GET'],
    ['/api/computers/unknown/directories?path=~', 'GET'],
    ['/api/computers/fixture-studio/directories?path=~', 'POST'],
  ])('fails closed for unsupported directory requests: %s %s', async (path, method) => {
    const { fixture, request } = await fixtureApi()
    expect((await request(path, method)).status).toBe(501)
    expect(fixture.failures).toHaveLength(1)
    expect(() => fixture.assertHealthy()).toThrow()
  })
})

describe('workspace fixture hub protocol', () => {
  it('answers settings and voice as a current hub with voice switched off', async () => {
    const { fixture, request } = await fixtureApi()
    const initial = await request<{ settings: SettingsProfileSnapshot }>('/api/settings')
    expect(initial).toEqual({
      status: 200,
      body: { settings: { profileId: expect.any(String), revision: 0, values: {} } },
    })
    const imported = await request<{ settings: SettingsProfileSnapshot }>('/api/settings/import', 'POST', {
      deviceId: 'device-a', values: { appearance: 'graphite' },
    })
    expect(imported.body.settings).toMatchObject({ revision: 1, values: { appearance: 'graphite' } })
    const ignored = await request<{ settings: SettingsProfileSnapshot }>('/api/settings/import', 'POST', {
      deviceId: 'device-b', values: { appearance: 'light' },
    })
    expect(ignored.body.settings).toMatchObject({ revision: 1, values: { appearance: 'graphite' } })
    const updated = await request<SettingsUpdateResult>('/api/settings', 'PATCH', {
      deviceId: 'device-a', changes: { appearance: { value: 'light', baseRevision: 1 } },
    })
    expect(updated.body).toMatchObject({ settings: { revision: 2, values: { appearance: 'light' } }, conflicts: [] })
    const voice = await request<VoiceCapabilities>('/api/oracle-voice/capabilities')
    expect(voice.status).toBe(200)
    expect(voice.body).toMatchObject({ protocol: ORACLE_VOICE_PROTOCOL, available: false })
    fixture.assertHealthy()
  })

  it('tells open devices about a settings commit only when it changed something', async () => {
    const { fixture, openEvents, request } = await fixtureApi()
    const sent = openEvents()
    await request('/api/settings/import', 'POST', { deviceId: 'device-a', values: { accent: 'ocean' } })
    await request('/api/settings/import', 'POST', { deviceId: 'device-b', values: { accent: 'violet' } })
    await request('/api/settings', 'PATCH', {
      deviceId: 'device-b', changes: { accent: { value: 'violet', baseRevision: 1 } },
    })
    expect(sent).toEqual([
      { type: 'settings.updated', settings: expect.objectContaining({ revision: 1, values: { accent: 'ocean' } }) },
      { type: 'settings.updated', settings: expect.objectContaining({ revision: 2, values: { accent: 'violet' } }) },
    ])
    fixture.assertHealthy()
  })

  it('refuses a settings request the hub would refuse', async () => {
    const { fixture, request } = await fixtureApi()
    const refused = await request('/api/settings', 'PATCH', {
      changes: { appearance: { value: 'neon', baseRevision: 0 } },
    })
    expect(refused.status).toBe(400)
    expect(() => fixture.assertHealthy()).toThrow()
  })

  it('closes a session to reopen, reopens it, and deletes one for good', async () => {
    const { fixture, openEvents, request, state } = await fixtureApi()
    const sent = openEvents()
    const path = `/api/computers/fixture-studio/sessions/${SELECTED_SESSION_ID}`
    const ids = async (list: string) =>
      (await request<{ sessions: ManagedSession[] }>(list)).body.sessions.map((session) => session.id)

    const closed = await request<{ session: ManagedSession }>(`${path}/close`, 'POST', {})
    expect(closed.body.session).toMatchObject({
      id: SELECTED_SESSION_ID,
      isOpen: false,
      closedAt: expect.any(String),
      closedContext: { title: 'Plan the knowledge workspace', prompts: expect.any(Array) },
    })
    expect(await ids('/api/sessions')).not.toContain(SELECTED_SESSION_ID)
    expect(await ids('/api/closed-sessions')).toEqual([SELECTED_SESSION_ID])

    const reopened = await request<{ session: ManagedSession }>(`${path}/open`, 'POST', {})
    expect(reopened.body.session).toMatchObject({ id: SELECTED_SESSION_ID, isOpen: true })
    expect(reopened.body.session).not.toHaveProperty('closedAt')
    expect(await ids('/api/closed-sessions')).toEqual([])

    expect((await request(path, 'DELETE')).status).toBe(204)
    expect(state.sessions.map((session) => session.id)).not.toContain(SELECTED_SESSION_ID)
    expect(sent).toEqual([
      { type: 'session.removed', computerId: 'fixture-studio', sessionId: SELECTED_SESSION_ID, closed: true },
      { type: 'session.upserted', session: expect.objectContaining({ id: SELECTED_SESSION_ID, isOpen: true }) },
      { type: 'session.removed', computerId: 'fixture-studio', sessionId: SELECTED_SESSION_ID },
    ])
    fixture.assertHealthy()
  })
})
