import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { PushSubscription } from 'web-push'
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
  it('persists subscriptions and deduplicates ask-user notifications', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'push-service-test-'))
    directories.push(directory)
    const sender = vi.fn(
      async (
        _subscription: PushSubscription,
        _payload?: string | Buffer | null,
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
    service.attach(events)
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
      title: 'Agent needs your input',
      body: 'development · Project',
      data: {
        url: '/?computer=computer&session=session',
      },
      tag: 'agentic-question-computer-session',
    })
    expect(JSON.stringify(payload)).not.toContain('Hidden question text')

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
    expect(sender).toHaveBeenCalledOnce()

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
    await vi.waitFor(() => expect(sender).toHaveBeenCalledTimes(2))

    events.emit('event', { type: 'computer.removed', computerId: 'computer' })
    events.emit('event', event)
    await vi.waitFor(() => expect(sender).toHaveBeenCalledTimes(3))

    service.stop()
    const reloaded = new PushNotificationService(directory, sender)
    await reloaded.initialize()
    expect(reloaded.publicKey()).toBe(service.publicKey())
    await reloaded.unsubscribe(subscription.endpoint)
  })
})
