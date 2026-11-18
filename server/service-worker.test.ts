import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

async function worker(buildId?: string) {
  const listeners = new Map<string, (event: unknown) => void>()
  const cache = {
    addAll: vi.fn().mockResolvedValue(undefined),
    match: vi.fn().mockResolvedValue(new Response('this build')),
    put: vi.fn().mockResolvedValue(undefined),
  }
  const caches = {
    open: vi.fn().mockResolvedValue(cache),
    match: vi.fn(() => { throw new Error('Unscoped cache read') }),
    keys: vi.fn().mockResolvedValue([
      'agentic-remote-shell-legacy',
      'agentic-remote-shell-build-a',
      'agentic-remote-shell-build-b',
      'unrelated-cache',
    ]),
    delete: vi.fn().mockResolvedValue(true),
  }
  const fetch = vi.fn().mockResolvedValue(new Response('network'))
  const self = {
    AGENTIC_REMOTE_BUILD_ID: buildId,
    location: new URL('https://example.test/sw.js?v=legacy'),
    clients: {
      claim: vi.fn().mockResolvedValue(undefined),
      matchAll: vi.fn().mockResolvedValue([]),
      openWindow: vi.fn().mockResolvedValue(undefined),
    },
    addEventListener: (type: string, listener: (event: unknown) => void) => {
      listeners.set(type, listener)
    },
  }
  class WorkerRequest extends Request {
    constructor(input: string, init?: RequestInit) {
      super(new URL(input, self.location), init)
    }
  }
  vm.runInNewContext(
    await readFile(new URL('../public/sw.js', import.meta.url), 'utf8'),
    { self, caches, fetch, URL, Request: WorkerRequest },
  )
  const dispatch = (type: string, event = {}) => {
    let pending: Promise<unknown> | undefined
    const wait = (value: Promise<unknown>) => { pending = value }
    const listener = listeners.get(type)
    if (!listener) {
      throw new Error(`Worker did not register ${type}`)
    }
    listener({ waitUntil: wait, respondWith: wait, ...event })
    return pending
  }
  return { cache, caches, fetch, self, dispatch }
}

describe('service worker build caches', () => {
  it('uses its immutable embedded identity instead of a persistent registration URL', async () => {
    const { cache, caches, dispatch } = await worker('build-b')
    await dispatch('install')

    expect(caches.open).toHaveBeenCalledWith('agentic-remote-shell-build-b')
    const requests = cache.addAll.mock.calls[0][0] as Request[]
    expect(requests.map((request) => request.url)).toContain('https://example.test/')
    for (const size of [192, 512, 1024]) {
      expect(requests.map((request) => request.url)).toContain(
        `https://example.test/icons/relay-icon-${size}.png`,
      )
    }
    expect(requests.every((request) => request.cache === 'reload')).toBe(true)
  })

  it('still supports an unbuilt development worker', async () => {
    const { caches, dispatch } = await worker()
    await dispatch('install')
    expect(caches.open).toHaveBeenCalledWith('agentic-remote-shell-legacy')
  })

  it('removes other app build caches on activation, including after rollback', async () => {
    for (const buildId of ['build-b', 'build-a']) {
      const { caches, dispatch } = await worker(buildId)
      await dispatch('activate')
      expect(caches.delete).toHaveBeenCalledWith('agentic-remote-shell-legacy')
      expect(caches.delete).not.toHaveBeenCalledWith(`agentic-remote-shell-${buildId}`)
      expect(caches.delete).not.toHaveBeenCalledWith('unrelated-cache')
      expect(caches.delete).toHaveBeenCalledTimes(2)
    }
  })

  it('uses only this build cache for an offline navigation', async () => {
    const { caches, fetch, dispatch } = await worker('build-b')
    fetch.mockRejectedValue(new Error('offline'))
    const response = await dispatch('fetch', {
      request: { method: 'GET', mode: 'navigate', url: 'https://example.test/' },
    }) as Response

    expect(await response.text()).toBe('this build')
    expect(caches.open).toHaveBeenCalledWith('agentic-remote-shell-build-b')
    expect(caches.match).not.toHaveBeenCalled()
  })

  it('does not overwrite its installed shell with a navigation from a newer release', async () => {
    const { cache, dispatch } = await worker('build-a')
    const response = await dispatch('fetch', {
      request: { method: 'GET', mode: 'navigate', url: 'https://example.test/' },
    }) as Response

    expect(await response.text()).toBe('network')
    expect(cache.put).not.toHaveBeenCalled()
  })

  it.each(['/icons/icon-192.png', '/assets/app.js'])(
    'does not read %s from another installed build cache',
    async (pathname) => {
      const { caches, fetch, dispatch } = await worker('build-b')
      const response = await dispatch('fetch', {
        request: new Request(`https://example.test${pathname}`),
      }) as Response

      expect(await response.text()).toBe('this build')
      expect(caches.open).toHaveBeenCalledWith('agentic-remote-shell-build-b')
      expect(caches.match).not.toHaveBeenCalled()
      expect(fetch).not.toHaveBeenCalled()
    },
  )

  it('never caches the version API', async () => {
    const { caches, dispatch } = await worker('build-b')
    expect(dispatch('fetch', {
      request: new Request('https://example.test/api/version'),
    })).toBeUndefined()
    expect(caches.open).not.toHaveBeenCalled()
  })

  it.each([
    ['/?oracle=open', 'https://example.test/?oracle=open'],
    ['/?schedule=review&run=one', 'https://example.test/?schedule=review&run=one'],
    ['https://example.test/session?x=1#recent', 'https://example.test/session?x=1#recent'],
    ['/\\evil.example', 'https://example.test/'],
    ['//evil.example', 'https://example.test/'],
    ['https://evil.example/path', 'https://example.test/'],
    ['javascript:alert(1)', 'https://example.test/'],
    ['data:text/html,test', 'https://example.test/'],
    ['blob:https://example.test/opaque-id', 'https://example.test/'],
    ['http://[invalid', 'https://example.test/'],
    [17, 'https://example.test/'],
  ])('opens only a same-origin notification target for %j', async (url, expected) => {
    const { self, dispatch } = await worker()
    const close = vi.fn()
    await dispatch('notificationclick', { notification: { close, data: { url } } })
    expect(close).toHaveBeenCalledOnce()
    expect(self.clients.openWindow).toHaveBeenCalledExactlyOnceWith(expected)
  })

  it('does not navigate an existing client off-origin when a notification contains a backslash authority', async () => {
    const { self, dispatch } = await worker()
    const navigate = vi.fn().mockResolvedValue(undefined)
    const focus = vi.fn().mockResolvedValue(undefined)
    self.clients.matchAll.mockResolvedValue([{ navigate, focus }])
    await dispatch('notificationclick', { notification: { close: vi.fn(), data: { url: '/\\evil.example' } } })
    expect(navigate).toHaveBeenCalledExactlyOnceWith('https://example.test/')
    expect(focus).toHaveBeenCalledOnce()
    expect(self.clients.openWindow).not.toHaveBeenCalled()
  })
})
