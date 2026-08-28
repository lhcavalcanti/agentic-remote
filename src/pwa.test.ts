// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import {
  activatePwaUpdate,
  checkForPwaUpdate,
  clearSessionPushNotifications,
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
