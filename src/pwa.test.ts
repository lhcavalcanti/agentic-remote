// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  activatePwaUpdate,
  activePushSubscription,
  checkForPwaUpdate,
  clearSessionPushNotifications,
  enablePushNotifications,
} from './pwa'

describe('PWA updates', () => {
  it('asks the waiting worker to activate and reloads after controller change', async () => {
    const serviceWorkerEvents = new EventTarget()
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: serviceWorkerEvents,
    })
    const postMessage = vi.fn(() => {
      queueMicrotask(() =>
        serviceWorkerEvents.dispatchEvent(new Event('controllerchange')),
      )
    })
    const registration = {
      waiting: { postMessage },
      update: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    const reload = vi.fn()

    await activatePwaUpdate(registration, reload)

    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(reload).toHaveBeenCalledOnce()
  })

  it('reloads a bundle-only update when no worker is waiting', async () => {
    const registration = {
      waiting: null,
      update: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    const reload = vi.fn()

    await activatePwaUpdate(registration, reload)

    expect(registration.update).toHaveBeenCalledOnce()
    expect(reload).toHaveBeenCalledOnce()
  })

  it('reports a waiting app update after checking the registration', async () => {
    const registration = {
      installing: null,
      waiting: { postMessage: vi.fn() },
      update: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistration: vi.fn().mockResolvedValue(registration),
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ version: __APP_VERSION__ }),
      ),
    )

    await expect(checkForPwaUpdate()).resolves.toEqual({
      registration,
      version: __APP_VERSION__,
    })
    expect(registration.update).toHaveBeenCalledOnce()
  })

  it('detects a deployed bundle update when the worker bytes are unchanged', async () => {
    const currentRegistration = {
      installing: null,
      waiting: null,
      update: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    const deployedRegistration = {
      ...currentRegistration,
      update: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    const register = vi.fn().mockResolvedValue(deployedRegistration)
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistration: vi.fn().mockResolvedValue(currentRegistration),
        register,
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ version: '99.0.0' })),
    )

    await expect(checkForPwaUpdate()).resolves.toEqual({
      registration: deployedRegistration,
      version: '99.0.0',
    })
    expect(register).toHaveBeenCalledWith('/sw.js?v=99.0.0', { scope: '/' })
    expect(deployedRegistration.update).toHaveBeenCalledOnce()
  })

  it('asks the worker to close notifications for an opened session', async () => {
    const postMessage = vi.fn()
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          active: { postMessage },
        }),
      },
    })

    await clearSessionPushNotifications('computer', 'session')

    expect(postMessage).toHaveBeenCalledWith({
      type: 'CLEAR_SESSION_NOTIFICATIONS',
      tags: [
        'agentic-action-computer-session',
        'agentic-question-computer-session',
        'agentic-finished-computer-session',
      ],
    })
  })
})

describe('push subscriptions across a hub change', () => {
  const OLD_KEY = 'BFhKxls-Uy_DZlfDG5dJJN3kRBUJ'
  const NEW_KEY = 'BNCEMkMlgyZAHlgRhKG0K3bCWoGW'

  function keyBuffer(value: string): ArrayBuffer {
    const padding = '='.repeat((4 - (value.length % 4)) % 4)
    const decoded = atob(
      (value + padding).replaceAll('-', '+').replaceAll('_', '/'),
    )
    const bytes = new Uint8Array(new ArrayBuffer(decoded.length))
    for (let index = 0; index < decoded.length; index += 1) {
      bytes[index] = decoded.charCodeAt(index)
    }
    return bytes.buffer
  }

  function install(existingKey: string | undefined, serverKey: string) {
    const unsubscribe = vi.fn(async () => true)
    const existing = existingKey
      ? ({
          endpoint: 'https://push.example.test/old',
          options: { applicationServerKey: keyBuffer(existingKey) },
          unsubscribe,
          toJSON: () => ({ endpoint: 'https://push.example.test/old' }),
        } as unknown as PushSubscription)
      : null
    const fresh = {
      endpoint: 'https://push.example.test/new',
      options: { applicationServerKey: keyBuffer(serverKey) },
      toJSON: () => ({ endpoint: 'https://push.example.test/new' }),
    } as unknown as PushSubscription
    const subscribe = vi.fn(async () => fresh)

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: async () => existing,
            subscribe,
          },
        }),
      },
    })
    Object.defineProperty(window, 'PushManager', {
      configurable: true,
      value: function PushManager() {},
    })
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { permission: 'granted', requestPermission: async () => 'granted' },
    })
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/push/public-key')) {
        return new Response(JSON.stringify({ publicKey: serverKey }), {
          headers: { 'content-type': 'application/json' },
        })
      }
      return new Response('{}', {
        headers: { 'content-type': 'application/json' },
      })
    }))
    return { subscribe, unsubscribe, fresh, existing }
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports a subscription from a previous hub as not enabled', async () => {
    install(OLD_KEY, NEW_KEY)
    await expect(activePushSubscription()).resolves.toBeNull()
  })

  it('reports a matching subscription as enabled', async () => {
    const { existing } = install(NEW_KEY, NEW_KEY)
    await expect(activePushSubscription()).resolves.toBe(existing)
  })

  it('replaces a subscription minted for a different hub key', async () => {
    const { subscribe, unsubscribe, fresh } = install(OLD_KEY, NEW_KEY)

    await expect(enablePushNotifications()).resolves.toBe(fresh)

    expect(unsubscribe).toHaveBeenCalledOnce()
    expect(subscribe).toHaveBeenCalledOnce()
  })

  it('keeps a subscription that already matches the current hub', async () => {
    const { subscribe, unsubscribe, existing } = install(NEW_KEY, NEW_KEY)

    await expect(enablePushNotifications()).resolves.toBe(existing)

    expect(unsubscribe).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })
})
