import {
  deletePushSubscription,
  getPushPublicKey,
  savePushSubscription,
} from './api'

export const PWA_UPDATE_EVENT = 'agentic-remote:update-ready'
let announcedUpdateVersion: string | undefined

function applicationServerKey(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const decoded = atob((value + padding).replaceAll('-', '+').replaceAll('_', '/'))
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length))
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index)
  }
  return bytes
}

export function pushNotificationsSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function installedAsApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}

export async function pushSubscription(): Promise<PushSubscription | null> {
  if (!pushNotificationsSupported()) {
    return null
  }
  return (await navigator.serviceWorker.ready).pushManager.getSubscription()
}

export async function enablePushNotifications(): Promise<PushSubscription> {
  if (!pushNotificationsSupported()) {
    throw new Error('Push notifications are not supported in this browser')
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted')
  }
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey(await getPushPublicKey()),
    }))
  await savePushSubscription(subscription.toJSON())
  return subscription
}

export async function disablePushNotifications(): Promise<void> {
  const subscription = await pushSubscription()
  if (!subscription) {
    return
  }
  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  await deletePushSubscription(endpoint)
}

export async function clearSessionPushNotifications(
  computerId: string,
  sessionId: string,
): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }
  const registration = await navigator.serviceWorker.ready
  registration.active?.postMessage({
    type: 'CLEAR_SESSION_NOTIFICATIONS',
    tags: [
      `agentic-action-${computerId}-${sessionId}`,
      `agentic-question-${computerId}-${sessionId}`,
      `agentic-finished-${computerId}-${sessionId}`,
    ],
  })
}

export async function registerPwa(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }
  const registration = await navigator.serviceWorker.register(
    `/sw.js?v=${encodeURIComponent(__APP_VERSION__)}`,
    { scope: '/' },
  )
  const announceUpdate = () => {
    window.dispatchEvent(
      new CustomEvent(PWA_UPDATE_EVENT, { detail: registration }),
    )
  }
  if (registration.waiting && navigator.serviceWorker.controller) {
    announceUpdate()
  }
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing
    worker?.addEventListener('statechange', () => {
      if (
        worker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        announceUpdate()
      }
    })
  })
  const update = () =>
    void checkForPwaUpdate()
      .then((available) => {
        if (
          available &&
          available.version !== announcedUpdateVersion
        ) {
          announcedUpdateVersion = available.version
          window.dispatchEvent(
            new CustomEvent(PWA_UPDATE_EVENT, {
              detail: available.registration,
            }),
          )
        }
      })
      .catch(() => undefined)
  update()
  window.setInterval(update, 60 * 60 * 1_000)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      update()
    }
  })
}

export async function checkForPwaUpdate(): Promise<
  { registration: ServiceWorkerRegistration; version: string } | undefined
> {
  if (!('serviceWorker' in navigator)) {
    return undefined
  }
  const versionResponse = await fetch('/api/version', { cache: 'no-store' })
  if (!versionResponse.ok) {
    throw new Error(`Unable to check app version (${versionResponse.status})`)
  }
  const payload = (await versionResponse.json()) as { version?: unknown }
  if (typeof payload.version !== 'string' || !payload.version.trim()) {
    throw new Error('The server returned an invalid app version')
  }
  const deployedVersion = payload.version.trim()
  let registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    return undefined
  }
  const bundleUpdate = deployedVersion !== __APP_VERSION__
  if (bundleUpdate) {
    registration = await navigator.serviceWorker.register(
      `/sw.js?v=${encodeURIComponent(deployedVersion)}`,
      { scope: '/' },
    )
  }
  await registration.update()
  if (registration.waiting) {
    return { registration, version: deployedVersion }
  }
  const worker =
    registration.installing || (await waitForInstallingWorker(registration))
  if (worker) {
    await waitForWorkerInstalled(worker)
  }
  return registration.waiting || bundleUpdate
    ? { registration, version: deployedVersion }
    : undefined
}

function waitForInstallingWorker(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorker | undefined> {
  return new Promise((resolve) => {
    const handleUpdateFound = () => {
      window.clearTimeout(timeout)
      resolve(registration.installing || undefined)
    }
    const timeout = window.setTimeout(() => {
      registration.removeEventListener('updatefound', handleUpdateFound)
      resolve(undefined)
    }, 750)
    registration.addEventListener('updatefound', handleUpdateFound, {
      once: true,
    })
  })
}

function waitForWorkerInstalled(
  worker: ServiceWorker,
): Promise<void> {
  if (worker.state === 'installed' || worker.state === 'activated') {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error('Timed out while preparing the update')),
      10_000,
    )
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' || worker.state === 'activated') {
        window.clearTimeout(timeout)
        resolve()
      } else if (worker.state === 'redundant') {
        window.clearTimeout(timeout)
        reject(new Error('The update worker became unavailable'))
      }
    })
  })
}

export async function activatePwaUpdate(
  registration: ServiceWorkerRegistration,
  reload: () => void = () => window.location.reload(),
): Promise<void> {
  if (!registration.waiting) {
    await registration.update()
    if (registration.installing) {
      await waitForWorkerInstalled(registration.installing)
    }
  }
  const worker = registration.waiting
  if (!worker) {
    reload()
    return
  }
  const controllerChanged = new Promise<void>((resolve) => {
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => resolve(),
      { once: true },
    )
  })
  worker.postMessage({ type: 'SKIP_WAITING' })
  await Promise.race([
    controllerChanged,
    new Promise<void>((resolve) => window.setTimeout(resolve, 4_000)),
  ])
  reload()
}
