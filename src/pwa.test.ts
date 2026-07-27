// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { activatePwaUpdate } from './pwa'

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
})
