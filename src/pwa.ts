import {
  deletePushSubscription,
  getPushPublicKey,
  savePushSubscription,
} from './api'

export const PWA_UPDATE_EVENT = 'agentic-remote:update-ready'

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
  const update = () => void registration.update().catch(() => undefined)
  window.setInterval(update, 60 * 60 * 1_000)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      update()
    }
  })
}

export function activatePwaUpdate(
  registration: ServiceWorkerRegistration,
): void {
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading) {
      reloading = true
      window.location.reload()
    }
  })
  registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
}
