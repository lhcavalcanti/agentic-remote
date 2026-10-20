import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { PushSubscription, RequestOptions } from 'web-push'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import type { NotificationScope } from '../shared/notifications.js'
import { PushNotificationService } from './push-notification-service.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('PushNotificationService', () => {
  it('notifies alerts that ask for it, and only those errors', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'push-service-alert-test-'))
    directories.push(directory)
    const sender = vi.fn(
      async (
        _subscription: PushSubscription,
        _payload?: string | Buffer | null,
        _options?: RequestOptions,
      ) => ({ statusCode: 201, headers: {}, body: '' }),
    )
    const service = new PushNotificationService(directory, sender)
    await service.initialize()
    await service.subscribe({
      endpoint: 'https://push.example.test/subscription',
      expirationTime: null,
      keys: { p256dh: 'public-key', auth: 'auth-key' },
    })
    const events = new EventEmitter<{ event: [HubEvent] }>()
    await service.attach(events)

    events.emit('event', { type: 'error', computerId: 'computer', message: 'A send failed' })
    events.emit('event', {
      type: 'error',
      computerId: 'computer',
      message: 'Copilot CLI 1.0.98 did not start in a way Agentic Remote can use, so new terminal sessions may fail: Copilot did not become ready for terminal input',
      notify: true,
    })

    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
    expect(JSON.parse(sender.mock.calls[0]?.[1] as string)).toEqual({
      title: 'Agentic Remote needs attention',
      body: 'Copilot CLI 1.0.98 did not start in a way Agentic Remote can use, so new terminal sessions may fail: Copilot did not become ready for termi…',
      tag: 'agentic-alert-computer',
      priority: 'high',
      data: { url: '/' },
    })
    expect(sender.mock.calls[0]?.[2]).toMatchObject({ urgency: 'high' })
    service.stop()
  })

  it('prioritizes action notifications and deduplicates requests', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'push-service-test-'))
    directories.push(directory)
    const sender = vi.fn(
      async (
        _subscription: PushSubscription,
        _payload?: string | Buffer | null,
        _options?: RequestOptions,
      ) => ({
        statusCode: 201,
        headers: {},
        body: '',
      }),
    )
    const service = new PushNotificationService(directory, sender)
    await service.initialize()
    const subscription = {
      endpoint: 'https://push.example.test/subscription',
      expirationTime: null,
      keys: { p256dh: 'public-key', auth: 'auth-key' },
    }
    await service.subscribe(subscription)
    const events = new EventEmitter<{ event: [HubEvent] }>()
    await service.attach(events)
    const event: HubEvent = {
      type: 'session.upserted',
      session: {
        id: 'session',
        computerId: 'computer',
        computerName: 'development',
        cwd: '/tmp',
        title: 'Project',
        updatedAt: new Date().toISOString(),
        status: 'waiting',
        isOpen: true,
        messages: [],
        pendingUserInput: {
          requestId: 'question',
          question: 'Hidden question text',
          choices: [],
          allowFreeform: true,
        },
      },
    }

    events.emit('event', event)
    events.emit('event', event)
    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
    const payloadText = sender.mock.calls[0]?.[1]
    if (typeof payloadText !== 'string') {
      throw new Error('Push payload was not sent')
    }
    const payload = JSON.parse(payloadText) as {
      title: string
      body: string
      data: { url: string }
    }
    expect(payload).toEqual({
      title: 'Action needed · Project',
      body: 'development · Hidden question text',
      data: {
        url: '/?computer=computer&session=session',
      },
      priority: 'high',
      tag: 'agentic-action-computer-session',
    })
    expect(sender.mock.calls[0]?.[2]).toEqual({
      TTL: 3_600,
      urgency: 'high',
    })

    events.emit('event', {
      ...event,
      session: {
        ...event.session,
        pendingUserInput: undefined,
        pendingPermission: {
          requestId: 'permission',
          title: 'Run deployment command',
          options: [],
        },
      },
    })
    await vi.waitFor(() => expect(sender).toHaveBeenCalledTimes(2))
    expect(JSON.parse(sender.mock.calls[1]?.[1] as string)).toMatchObject({
      title: 'Action needed · Project',
      body: 'development · Run deployment command',
      priority: 'high',
    })

    await service.setSessionMuted('computer', 'session', true)
    expect(service.settings()).toEqual({
      mutedSessions: ['computer:session'],
    })

    // Clearing replaces a session rather than ending it, and the mute belongs
    // to the conversation, so silence has to survive being cleared.
    events.emit('event', {
      type: 'session.removed',
      computerId: 'computer',
      sessionId: 'session',
      replacedBy: 'session-cleared',
    })
    await vi.waitFor(() =>
      expect(service.settings()).toEqual({
        mutedSessions: ['computer:session-cleared'],
      }),
    )
    await service.setSessionMuted('computer', 'session-cleared', false)
    await service.setSessionMuted('computer', 'session', true)
    events.emit('event', {
      ...event,
      session: {
        ...event.session,
        pendingUserInput: {
          ...event.session.pendingUserInput!,
          requestId: 'muted-question',
        },
      },
    })
    await new Promise((resolve) => setImmediate(resolve))
    expect(sender).toHaveBeenCalledTimes(2)

    await service.setSessionMuted('computer', 'session', false)
    events.emit('event', {
      ...event,
      session: {
        ...event.session,
        pendingUserInput: {
          ...event.session.pendingUserInput!,
          requestId: 'unmuted-question',
        },
      },
    })
    await vi.waitFor(() => expect(sender).toHaveBeenCalledTimes(3))

    events.emit('event', { type: 'computer.removed', computerId: 'computer' })
    events.emit('event', event)
    await vi.waitFor(() => expect(sender).toHaveBeenCalledTimes(4))

    events.emit('event', {
      ...event,
      session: {
        ...event.session,
        pendingUserInput: undefined,
        status: 'running',
      },
    })
    events.emit('event', {
      ...event,
      session: {
        ...event.session,
        pendingUserInput: undefined,
        queuedCount: 0,
        status: 'idle',
      },
    })
    await vi.waitFor(() => expect(sender).toHaveBeenCalledTimes(5))
    const completionPayload = JSON.parse(
      sender.mock.calls[4]?.[1] as string,
    ) as { title: string; body: string; data: { url: string } }
    expect(completionPayload).toMatchObject({
      title: 'Finished · Project',
      body: 'development · No action needed',
      priority: 'low',
      data: { url: '/?computer=computer&session=session' },
    })
    expect(sender.mock.calls[4]?.[2]).toEqual({
      TTL: 900,
      urgency: 'low',
    })

    events.emit('event', {
      ...event,
      session: {
        ...event.session,
        pendingUserInput: undefined,
        status: 'running',
      },
    })
    events.emit('event', {
      ...event,
      session: {
        ...event.session,
        pendingUserInput: undefined,
        queuedCount: 1,
        status: 'idle',
      },
    })
    await new Promise((resolve) => setImmediate(resolve))
    expect(sender).toHaveBeenCalledTimes(5)

    await expect(service.sendTestNotification()).resolves.toEqual({ sent: 1 })
    expect(JSON.parse(sender.mock.calls[5]?.[1] as string)).toMatchObject({
      title: 'Agentic Remote notifications work',
      priority: 'normal',
      data: { url: '/' },
    })
    expect(sender.mock.calls[5]?.[2]).toEqual({
      TTL: 900,
      urgency: 'normal',
    })

    service.stop()
    const reloaded = new PushNotificationService(directory, sender)
    await reloaded.initialize()
    expect(reloaded.publicKey()).toBe(service.publicKey())
    await reloaded.unsubscribe(subscription.endpoint)
  })

  it('prunes expired subscriptions even when another endpoint fails', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'push-service-test-'))
    directories.push(directory)
    const sender = vi.fn(
      async (
        subscription: PushSubscription,
        _payload?: string | Buffer | null,
        _options?: RequestOptions,
      ) => {
        if (subscription.endpoint.includes('gone')) {
          throw Object.assign(new Error('Gone'), { statusCode: 410 })
        }
        if (subscription.endpoint.includes('flaky')) {
          throw Object.assign(new Error('Server error'), { statusCode: 500 })
        }
        return { statusCode: 201, headers: {}, body: '' }
      },
    )
    const service = new PushNotificationService(directory, sender)
    await service.initialize()
    const keys = { p256dh: 'public-key', auth: 'auth-key' }
    for (const endpoint of [
      'https://push.example.test/gone',
      'https://push.example.test/flaky',
      'https://push.example.test/healthy',
    ]) {
      await service.subscribe({ endpoint, expirationTime: null, keys })
    }

    await expect(service.sendTestNotification()).rejects.toThrow(AggregateError)
    service.stop()

    sender.mockClear()
    const reloaded = new PushNotificationService(directory, sender)
    await reloaded.initialize()
    await expect(reloaded.sendTestNotification()).rejects.toThrow(
      AggregateError,
    )
    const endpoints = sender.mock.calls.map((call) => call[0].endpoint)
    expect(endpoints).toEqual([
      'https://push.example.test/flaky',
      'https://push.example.test/healthy',
    ])
    reloaded.stop()
  })

  it('sends completion notifications with an urgency FCM accepts', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'push-service-test-'))
    directories.push(directory)
    // FCM rejects RFC 8030's `very-low` with
    // "invalid urgency header defined. Valid options are: high, normal and low."
    const accepted = new Set(['high', 'normal', 'low'])
    const sender = vi.fn(
      async (
        _subscription: PushSubscription,
        _payload?: string | Buffer | null,
        options?: RequestOptions,
      ) => {
        if (!accepted.has(String(options?.urgency))) {
          throw Object.assign(new Error('Received unexpected response code'), {
            statusCode: 400,
          })
        }
        return { statusCode: 201, headers: {}, body: '' }
      },
    )
    const service = new PushNotificationService(directory, sender)
    await service.initialize()
    await service.subscribe({
      endpoint: 'https://fcm.googleapis.com/fcm/send/token',
      expirationTime: null,
      keys: { p256dh: 'public-key', auth: 'auth-key' },
    })
    const events = new EventEmitter<{ event: [HubEvent] }>()
    await service.attach(events)
    const running: HubEvent = {
      type: 'session.upserted',
      session: {
        id: 'session',
        computerId: 'computer',
        computerName: 'development',
        cwd: '/tmp',
        title: 'Project',
        updatedAt: new Date().toISOString(),
        status: 'running',
        isOpen: true,
        messages: [],
      },
    }

    events.emit('event', running)
    events.emit('event', {
      ...running,
      session: { ...running.session, queuedCount: 0, status: 'idle' },
    })

    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce())
    expect(sender.mock.calls[0]?.[2]?.urgency).toBe('low')
    expect(JSON.parse(sender.mock.calls[0]?.[1] as string)).toMatchObject({
      title: 'Finished · Project',
      priority: 'low',
    })
    service.stop()
  })

  describe('notification scope', () => {
    async function scoped(policy: Parameters<PushNotificationService['setPolicy']>[0] = {}) {
      const directory = await mkdtemp(path.join(tmpdir(), 'push-service-scope-'))
      directories.push(directory)
      const sender = vi.fn(async (
        _subscription: PushSubscription,
        _payload?: string | Buffer | null,
        _options?: RequestOptions,
      ) => ({ statusCode: 201, headers: {}, body: '' }))
      const service = new PushNotificationService(directory, sender)
      await service.initialize()
      await service.subscribe({
        endpoint: 'https://push.example.test/scope',
        expirationTime: null,
        keys: { p256dh: 'public-key', auth: 'auth-key' },
      })
      service.setPolicy(policy)
      const hub = new EventEmitter<{ event: [HubEvent] }>()
      const oracle = new EventEmitter<{ event: [ManagerEvent] }>()
      service.attach(hub)
      service.attachOracle(oracle)
      const titles = () => sender.mock.calls.map(([, payload]) => JSON.parse(String(payload)).title as string)
      return { service, sender, hub, oracle, titles }
    }

    const session = (id: string, change: Partial<ManagedSession> = {}): ManagedSession => ({
      id, computerId: 'computer', computerName: 'development', cwd: '/tmp', title: `Session ${id}`,
      updatedAt: '2026-10-18T00:00:00.000Z', status: 'running', isOpen: true, messages: [], ...change,
    })

    /** One of each: a question, a finish, a hub alert, and Oracle's reply. */
    function everything(hub: EventEmitter<{ event: [HubEvent] }>, oracle: EventEmitter<{ event: [ManagerEvent] }>, id: string) {
      hub.emit('event', { type: 'session.upserted', session: session(`${id}-q`, {
        status: 'waiting',
        pendingUserInput: { requestId: `${id}-r`, question: 'Which folder?', choices: [], allowFreeform: true },
      }) })
      hub.emit('event', { type: 'session.upserted', session: session(`${id}-f`) })
      hub.emit('event', { type: 'session.upserted', session: session(`${id}-f`, { status: 'idle' }) })
      hub.emit('event', { type: 'error', computerId: 'computer', message: 'Copilot CLI failed its check', notify: true })
      oracle.emit('event', { type: 'manager.message', message: {
        id: `${id}-a`, role: 'assistant', replyTo: `${id}-u`, content: 'All done.', createdAt: 't',
      } })
      oracle.emit('event', { type: 'manager.message', message: {
        id: `${id}-u`, role: 'user', content: 'Status?', createdAt: 't', state: 'done',
      } })
    }

    const all = [
      'Action needed · Session 1-q', 'Finished · Session 1-f', 'Agentic Remote needs attention', 'Oracle replied',
    ]

    it.each([
      ['unset, as on a hub that never chose', undefined, all],
      ['All activity', 'all', all],
      ['Oracle only', 'oracle', ['Oracle replied']],
      ['Disabled', 'off', []],
    ] as const)('sends what %s allows', async (_name, scope, expected) => {
      const { hub, oracle, titles, service } = await scoped({ scope: () => scope as NotificationScope | undefined })
      everything(hub, oracle, '1')
      await new Promise((resolve) => setTimeout(resolve, 20))
      expect(titles().sort()).toEqual([...expected].sort())
      service.stop()
    })

    it('applies a change of scope to the very next notification', async () => {
      let scope: NotificationScope = 'all'
      const { hub, oracle, titles, service } = await scoped({ scope: () => scope })
      everything(hub, oracle, '1')
      await vi.waitFor(() => expect(titles()).toHaveLength(4))
      scope = 'oracle'
      everything(hub, oracle, '2')
      await vi.waitFor(() => expect(titles()).toHaveLength(5))
      expect(titles().at(-1)).toBe('Oracle replied')
      scope = 'off'
      everything(hub, oracle, '3')
      await new Promise((resolve) => setTimeout(resolve, 20))
      expect(titles()).toHaveLength(5)
      service.stop()
    })

    it('still sends a test you asked for, whatever the scope', async () => {
      const { service, titles } = await scoped({ scope: () => 'off' })
      await expect(service.sendTestNotification()).resolves.toEqual({ sent: 1 })
      expect(titles()).toEqual(['Agentic Remote notifications work'])
      service.stop()
    })

    it("holds Oracle's notifications while you are watching Oracle, and never sends one twice", async () => {
      let watching = true
      const { oracle, titles, sender, service } = await scoped({ oracleWatched: () => watching })
      const done = { type: 'manager.message', message: {
        id: 'u1', role: 'user', content: 'Status?', createdAt: 't', state: 'done',
      } } as const
      oracle.emit('event', done)
      await new Promise((resolve) => setTimeout(resolve, 20))
      expect(titles()).toEqual([])
      // Watched when it happened, so it is not sent later either.
      watching = false
      oracle.emit('event', done)
      oracle.emit('event', { type: 'manager.message', message: {
        id: 'c1', role: 'activity', content: 'Close "Docs"? This permanently deletes it and its history.',
        createdAt: 't', confirmation: { kind: 'close-session', computerId: 'computer', sessionId: 's', title: 'Docs', state: 'pending' },
      } })
      await vi.waitFor(() => expect(titles()).toEqual(['Oracle needs your OK']))
      expect(sender.mock.calls[0]?.[2]).toMatchObject({ urgency: 'high' })
      expect(JSON.parse(String(sender.mock.calls[0]?.[1])).data).toEqual({ url: '/?oracle=open' })
      service.stop()
    })

    it("keeps Oracle's notifications out of a hub whose Oracle is off", async () => {
      const { hub, titles, service } = await scoped({ scope: () => 'oracle' })
      hub.emit('event', { type: 'session.upserted', session: session('q', {
        status: 'waiting',
        pendingUserInput: { requestId: 'r', question: 'Which folder?', choices: [], allowFreeform: true },
      }) })
      await new Promise((resolve) => setTimeout(resolve, 20))
      expect(titles()).toEqual([])
      service.stop()
    })
  })
})
