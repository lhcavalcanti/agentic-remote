import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { PushSubscription, RequestOptions } from 'web-push'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagerEvent } from '../shared/manager.js'
import { buildApp } from './app.js'
import type { ManagerAgent } from './manager-agent.js'
import { PushNotificationService } from './push-notification-service.js'

const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }
let directory: string
let runtime: Awaited<ReturnType<typeof buildApp>>

beforeEach(async () => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  directory = await mkdtemp(path.join(tmpdir(), 'agentic-notification-scope-'))
})

afterEach(async () => {
  await runtime?.app.close()
  await rm(directory, { recursive: true, force: true })
  vi.unstubAllEnvs()
})

describe('notification scope on a running hub', () => {
  it('applies the synced scope and Oracle presence to what the hub pushes', async () => {
    const sender = vi.fn(async (
      _subscription: PushSubscription,
      _payload?: string | Buffer | null,
      _options?: RequestOptions,
    ) => ({ statusCode: 201, headers: {}, body: '' }))
    const oracle = Object.assign(new EventEmitter(), {
      start: async () => undefined,
      stop: async () => undefined,
      snapshot: () => ({ available: true, status: 'idle', messages: [], queued: 0, managedSessions: [] }),
    })
    runtime = await buildApp({
      dataDirectory: directory,
      logger: false,
      pushService: new PushNotificationService(path.join(directory, 'push'), sender),
      managerAgent: oracle as unknown as ManagerAgent,
      transcriptionService: {
        initialize: async () => undefined,
        stop: async () => undefined,
        transcribe: vi.fn(),
      },
    })
    await runtime.pushService!.subscribe({
      endpoint: 'https://push.example.test/phone',
      expirationTime: null,
      keys: { p256dh: 'public-key', auth: 'auth-key' },
    })
    const titles = () => sender.mock.calls.map(([, payload]) => JSON.parse(String(payload)).title as string)
    const scope = async (value: string) => {
      const response = await runtime.app.inject({
        method: 'PATCH',
        url: '/api/settings',
        headers: trusted,
        payload: {
          changes: {
            notificationScope: { value, baseRevision: runtime.settingsProfileStore!.snapshot().revision },
          },
        },
      })
      expect(response.statusCode).toBe(200)
    }
    const question = (id: string) => runtime.manager!.emit('event', {
      type: 'session.upserted',
      session: {
        id, computerId: runtime.identity.info.id, computerName: 'development', cwd: '/tmp',
        title: `Session ${id}`, updatedAt: '2026-10-18T00:00:00.000Z', status: 'waiting', isOpen: true,
        messages: [],
        pendingUserInput: { requestId: `${id}-r`, question: 'Which folder?', choices: [], allowFreeform: true },
      },
    })
    const replied = (id: string) => oracle.emit('event', {
      type: 'manager.message',
      message: { id, role: 'user', content: 'Status?', createdAt: 't', state: 'done' },
    } satisfies ManagerEvent)
    const settle = () => new Promise((resolve) => setTimeout(resolve, 30))

    await scope('oracle')
    question('a')
    replied('u1')
    await vi.waitFor(() => expect(titles()).toEqual(['Oracle replied']))

    // An open app showing Oracle makes its reply's push redundant.
    await runtime.app.ready()
    const socket = await runtime.app.injectWS('/api/events', { headers: trusted })
    socket.send(JSON.stringify({ type: 'presence', oracleVisible: true }))
    await settle()
    replied('u2')
    await settle()
    expect(titles()).toEqual(['Oracle replied'])
    socket.terminate()
    await settle()
    replied('u3')
    await vi.waitFor(() => expect(titles()).toEqual(['Oracle replied', 'Oracle replied']))

    await scope('all')
    question('b')
    await vi.waitFor(() => expect(titles()).toContain('Action needed · Session b'))

    await scope('off')
    question('c')
    replied('u4')
    await settle()
    expect(titles()).toHaveLength(3)
  })
})
