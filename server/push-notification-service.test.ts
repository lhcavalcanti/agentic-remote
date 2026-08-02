import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { PushSubscription, RequestOptions } from 'web-push'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HubEvent } from '../shared/contracts.js'
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
      urgency: 'very-low',
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
})
