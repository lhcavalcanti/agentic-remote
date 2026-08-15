const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const CACHE_NAME = `agentic-remote-shell-${VERSION}`
const SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter(
                (key) =>
                  key.startsWith('agentic-remote-shell-') &&
                  key !== CACHE_NAME,
              )
              .map((key) => caches.delete(key)),
          ),
        ),
    ]),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting())
  } else if (
    event.data?.type === 'CLEAR_SESSION_NOTIFICATIONS' &&
    Array.isArray(event.data.tags)
  ) {
    const tags = new Set(
      event.data.tags.filter(
        (tag) => typeof tag === 'string' && tag.length <= 1024,
      ),
    )
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        for (const notification of notifications) {
          if (tags.has(notification.tag)) {
            notification.close()
          }
        }
      }),
    )
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') {
    return
  }
  const url = new URL(request.url)
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/node-api/')
  ) {
    return
  }
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy))
          }
          return response
        })
        .catch(() => caches.match('/')),
    )
    return
  }
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})

self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(
      payload.title || 'Agentic Remote',
      {
        body: payload.body || 'Open Agentic Remote for details.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: payload.tag || 'agentic-remote-question',
        data: payload.data || { url: '/' },
        renotify: payload.priority === 'high',
        requireInteraction: payload.priority === 'high',
      },
    ),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/', self.location.origin)
    .href
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (clients) => {
        for (const client of clients) {
          if ('navigate' in client) {
            await client.navigate(target)
          }
          if ('focus' in client) {
            return client.focus()
          }
        }
        return self.clients.openWindow(target)
      }),
  )
})
