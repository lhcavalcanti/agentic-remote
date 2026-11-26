// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activatePwaUpdate,
  activePushSubscription,
  checkForPwaUpdate,
  clearSessionPushNotifications,
  enablePushNotifications,
  PWA_UPDATE_EVENT,
  registerPwa,
  runningAppVersion,
} from './pwa'
import { HubSignInExpiredError, hubSignInExpired, setHubSignInExpired } from './hub-sign-in'

// The release that served this page, as its index.html records it.
const running = { version: '3.1.4', buildId: 'running-build' }

function servePage(identity: { version?: string, buildId?: string }) {
  for (const [name, content] of [
    ['agentic-remote-version', identity.version],
    ['agentic-remote-build', identity.buildId],
  ]) {
    document.head.querySelector(`meta[name="${name}"]`)?.remove()
    if (content !== undefined) {
      document.head.append(Object.assign(document.createElement('meta'), { name, content }))
    }
  }
}

describe('running app version', () => {
  it('reads the build from the page that loaded the bundle', () => {
    servePage(running)
    expect(runningAppVersion()).toEqual(running)
    servePage({ version: '3.1.5', buildId: 'next-build' })
    expect(runningAppVersion()).toEqual({ version: '3.1.5', buildId: 'next-build' })
  })

  it.each([
    {},
    { version: running.version },
    { buildId: running.buildId },
    { version: ' ', buildId: running.buildId },
    { version: running.version, buildId: '../private/path' },
  ])('reports no identity for a page that does not record a valid one: %j', (identity) => {
    servePage(identity)
    expect(runningAppVersion()).toBeUndefined()
  })
})

describe('PWA updates', () => {
  beforeEach(() => servePage(running))

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  function mockUpdateCheck(payload: unknown) {
    const registration = {
      installing: null,
      waiting: null,
      update: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    const serviceWorker = Object.assign(new EventTarget(), {
      getRegistration: vi.fn().mockResolvedValue(registration),
      register: vi.fn().mockResolvedValue(registration),
    })
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: serviceWorker,
    })
    const fetch = vi.fn(async () => Response.json(payload))
    vi.stubGlobal('fetch', fetch)
    return { registration, serviceWorker, fetch }
  }

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
    Object.assign(serviceWorkerEvents, {
      register: vi.fn().mockResolvedValue(registration),
    })
    vi.stubGlobal('fetch', vi.fn(async () =>
      Response.json({ version: running.version, buildId: 'new-bundle' }),
    ))
    const reload = vi.fn()

    await activatePwaUpdate(reload)

    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(reload).toHaveBeenCalledOnce()
  })

  it('reloads a bundle-only update when no worker is waiting', async () => {
    const { registration } = mockUpdateCheck({
      version: running.version, buildId: 'new-bundle',
    })
    const reload = vi.fn()

    await activatePwaUpdate(reload)

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
        register: vi.fn().mockResolvedValue(registration),
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ version: running.version }),
      ),
    )

    await expect(checkForPwaUpdate()).resolves.toEqual({
      registration,
      version: running.version,
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
    expect(register).toHaveBeenCalledWith('/sw.js?v=99.0.0', {
      scope: '/',
      updateViaCache: 'none',
    })
    expect(deployedRegistration.update).toHaveBeenCalledOnce()
  })

  it('detects a new build without a package-version or worker-byte change', async () => {
    const registration = {
      installing: null,
      waiting: null,
      update: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    const register = vi.fn().mockResolvedValue(registration)
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistration: vi.fn().mockResolvedValue(registration),
        register,
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ version: running.version, buildId: 'new-bundle' }),
      ),
    )

    await expect(checkForPwaUpdate()).resolves.toMatchObject({
      registration,
      version: running.version,
      buildId: 'new-bundle',
    })
    expect(register).toHaveBeenCalledWith('/sw.js?v=new-bundle', {
      scope: '/',
      updateViaCache: 'none',
    })
  })

  it('does not offer an update for the currently running build', async () => {
    const { registration, serviceWorker, fetch } = mockUpdateCheck({
      version: running.version,
      buildId: running.buildId,
    })

    await expect(checkForPwaUpdate()).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith('/api/version', expect.objectContaining({ cache: 'no-store' }))
    expect(serviceWorker.register).toHaveBeenCalledWith(
      `/sw.js?v=${running.buildId}`,
      { scope: '/', updateViaCache: 'none' },
    )
    expect(registration.update).toHaveBeenCalledOnce()
  })

  it('compares the deployed build with the one the page records', async () => {
    const { fetch } = mockUpdateCheck({ version: running.version, buildId: 'build-b' })

    servePage({ version: running.version, buildId: 'build-a' })
    await expect(checkForPwaUpdate()).resolves.toMatchObject({ buildId: 'build-b' })
    // The same bundle, reloaded from build B's index.html, is current.
    servePage({ version: running.version, buildId: 'build-b' })
    await expect(checkForPwaUpdate()).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('refuses to judge updates from a page that does not record its build', async () => {
    const { serviceWorker } = mockUpdateCheck({ version: running.version, buildId: running.buildId })
    serviceWorker.getRegistration.mockResolvedValue(undefined)
    servePage({})

    await expect(checkForPwaUpdate()).rejects.toThrow('does not record its build')
    await expect(registerPwa()).rejects.toThrow('does not record its build')
    expect(serviceWorker.register).not.toHaveBeenCalled()
  })

  it('keeps version-only legacy hubs compatible', async () => {
    const { serviceWorker } = mockUpdateCheck({ version: running.version })

    await expect(checkForPwaUpdate()).resolves.toBeUndefined()
    expect(serviceWorker.register).toHaveBeenCalledWith(
      `/sw.js?v=${running.version}`,
      { scope: '/', updateViaCache: 'none' },
    )
  })

  it('does not report a changed build as current when no worker is registered yet', async () => {
    const { registration, serviceWorker } = mockUpdateCheck({
      version: running.version,
      buildId: 'new-bundle',
    })
    serviceWorker.getRegistration.mockResolvedValue(undefined)

    await expect(checkForPwaUpdate()).resolves.toEqual({
      registration,
      version: running.version,
      buildId: 'new-bundle',
    })
  })

  it('retargets a persistent registration after a same-version rollback', async () => {
    const { registration, serviceWorker } = mockUpdateCheck({
      version: running.version,
      buildId: running.buildId,
    })
    const staleRegistration = {
      waiting: { scriptURL: 'https://example.test/sw.js?v=rolled-back-build' },
      update: vi.fn(),
    }
    serviceWorker.getRegistration.mockResolvedValue(staleRegistration)

    await expect(checkForPwaUpdate()).resolves.toBeUndefined()
    expect(serviceWorker.register).toHaveBeenCalledWith(
      `/sw.js?v=${running.buildId}`,
      { scope: '/', updateViaCache: 'none' },
    )
    expect(staleRegistration.update).not.toHaveBeenCalled()
    expect(registration.update).toHaveBeenCalledOnce()
  })

  it('rechecks the deployment before activating a prompt left over from a rollback', async () => {
    const { serviceWorker } = mockUpdateCheck({
      version: running.version, buildId: running.buildId,
    })
    const postMessage = vi.fn(() => queueMicrotask(() =>
      serviceWorker.dispatchEvent(new Event('controllerchange')),
    ))
    const obsolete = {
      waiting: { postMessage }, update: vi.fn(),
    } as unknown as ServiceWorkerRegistration
    serviceWorker.getRegistration.mockResolvedValue(obsolete)
    const reload = vi.fn()

    await activatePwaUpdate(reload)

    expect(serviceWorker.register).toHaveBeenCalledWith(
      `/sw.js?v=${running.buildId}`, { scope: '/', updateViaCache: 'none' },
    )
    expect(postMessage).not.toHaveBeenCalled()
    expect(reload).toHaveBeenCalledOnce()
  })

  it('leaves the current app in place when the activation recheck fails', async () => {
    const { fetch, serviceWorker } = mockUpdateCheck({
      version: running.version, buildId: 'new-bundle',
    })
    fetch.mockResolvedValue(new Response('Unavailable', { status: 503 }))
    const reload = vi.fn()
    await expect(activatePwaUpdate(reload)).rejects.toThrow('(503)')
    expect(serviceWorker.register).not.toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
  })

  it.each([
    null,
    [],
    {},
    { version: '' },
    { version: running.version, buildId: '' },
    { version: running.version, buildId: null },
    { version: running.version, buildId: 123 },
    { version: running.version, buildId: '../private/path' },
    { version: running.version, buildId: 'x'.repeat(129) },
  ])('rejects invalid version metadata instead of reporting up to date: %j', async (payload) => {
    const { serviceWorker } = mockUpdateCheck(payload)

    await expect(checkForPwaUpdate()).rejects.toThrow('invalid app')
    expect(serviceWorker.register).not.toHaveBeenCalled()
  })

  it('reports an expired hub sign-in from the update check', async () => {
    const { fetch } = mockUpdateCheck({})
    fetch.mockResolvedValueOnce(new Response(null, {
      status: 401,
      headers: { 'www-authenticate': 'Cloudflare-Access resource_metadata="https://hub.example/"' },
    }))
    try {
      await expect(checkForPwaUpdate()).rejects.toBeInstanceOf(HubSignInExpiredError)
      expect(hubSignInExpired()).toBe(true)
    } finally {
      setHubSignInExpired(false)
    }
  })

  it('surfaces HTTP and worker registration failures', async () => {
    const { fetch, serviceWorker } = mockUpdateCheck({
      version: running.version,
      buildId: 'new-bundle',
    })
    fetch.mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
    await expect(checkForPwaUpdate()).rejects.toThrow('(503)')
    serviceWorker.register.mockRejectedValueOnce(new Error('Worker unavailable'))
    await expect(checkForPwaUpdate()).rejects.toThrow('Worker unavailable')
  })

  it('registers a first-time worker with the build identity of the page', async () => {
    vi.useFakeTimers()
    const { serviceWorker } = mockUpdateCheck({
      version: running.version,
      buildId: running.buildId,
    })
    serviceWorker.getRegistration.mockResolvedValueOnce(undefined)
    vi.spyOn(document, 'addEventListener').mockImplementation(() => undefined)

    await registerPwa()
    await vi.advanceTimersByTimeAsync(751)

    expect(serviceWorker.register).toHaveBeenNthCalledWith(
      1,
      `/sw.js?v=${running.buildId}`,
      { scope: '/', updateViaCache: 'none' },
    )
  })

  it('announces successive same-version builds on startup and foreground return', async () => {
    vi.useFakeTimers()
    const { registration, serviceWorker, fetch } = mockUpdateCheck({
      version: running.version,
      buildId: 'bundle-b',
    })
    let foreground: (() => void) | undefined
    vi.spyOn(document, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'visibilitychange') {
        foreground = listener as () => void
      }
    })
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    const updateEvents = () => dispatch.mock.calls.filter(
      ([event]) => event.type === PWA_UPDATE_EVENT,
    )

    await registerPwa()
    await vi.advanceTimersByTimeAsync(751)
    expect(updateEvents()).toHaveLength(1)
    // Do not overwrite an existing worker with this old page's build ID.
    expect(serviceWorker.register).toHaveBeenNthCalledWith(
      1, '/sw.js?v=bundle-b', { scope: '/', updateViaCache: 'none' },
    )
    expect((updateEvents()[0][0] as CustomEvent).detail).toBe(registration)

    foreground?.()
    await vi.advanceTimersByTimeAsync(751)
    expect(serviceWorker.register).toHaveBeenCalledTimes(2)
    expect(updateEvents()).toHaveLength(1)

    fetch.mockImplementation(async () => Response.json({
      version: running.version,
      buildId: 'bundle-c',
    }))
    foreground?.()
    await vi.advanceTimersByTimeAsync(751)
    expect(updateEvents()).toHaveLength(2)
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
