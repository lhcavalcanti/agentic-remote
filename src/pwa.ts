import {
  deletePushSubscription,
  getPushPublicKey,
  savePushSubscription,
} from './api'
import { parseAppVersion, type AppVersion } from '../shared/app-version'

export const PWA_UPDATE_EVENT = 'agentic-remote:update-ready'
let announcedUpdateIdentity: string | undefined

function workerUrl(version: AppVersion): string {
  return `/sw.js?v=${encodeURIComponent(version.buildId ?? version.version)}`
}

const workerOptions: RegistrationOptions = {
  scope: '/',
  updateViaCache: 'none',
}

function applicationServerKey(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const decoded = atob((value + padding).replaceAll('-', '+').replaceAll('_', '/'))
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length))
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index)
  }
  return bytes
}

function encodeServerKey(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

function normalizeServerKey(value: string): string {
  return value.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function subscriptionUsesKey(
  subscription: PushSubscription,
  serverKey: string,
): boolean {
  const applied = subscription.options?.applicationServerKey
  if (!applied) {
    return false
  }
  return encodeServerKey(applied) === normalizeServerKey(serverKey)
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

// A subscription is bound to the VAPID key of the hub that minted it, so one
// left over from a different hub can never receive a push. Treat it as absent
// rather than reporting notifications as enabled.
export async function activePushSubscription(): Promise<PushSubscription | null> {
  const subscription = await pushSubscription()
  if (!subscription) {
    return null
  }
  try {
    const serverKey = await getPushPublicKey()
    return subscriptionUsesKey(subscription, serverKey) ? subscription : null
  } catch {
    return subscription
  }
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
  const serverKey = await getPushPublicKey()
  let subscription = await registration.pushManager.getSubscription()
  if (subscription && !subscriptionUsesKey(subscription, serverKey)) {
    await subscription.unsubscribe()
    subscription = null
  }
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(serverKey),
  })
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

export function sessionNotificationTags(
  computerId: string,
  sessionId: string,
): string[] {
  return [
    `agentic-action-${computerId}-${sessionId}`,
    `agentic-question-${computerId}-${sessionId}`,
    `agentic-finished-${computerId}-${sessionId}`,
  ]
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
    tags: sessionNotificationTags(computerId, sessionId),
  })
}

export async function registerPwa(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }
  const registration =
    (await navigator.serviceWorker.getRegistration()) ??
    (await navigator.serviceWorker.register(
      workerUrl({ version: __APP_VERSION__, buildId: __APP_BUILD_ID__ }),
      workerOptions,
    ))
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
        if (!available) {
          announcedUpdateIdentity = undefined
          return
        }
        const updateIdentity = available.buildId ?? available.version
        if (updateIdentity !== announcedUpdateIdentity) {
          announcedUpdateIdentity = updateIdentity
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
  ({ registration: ServiceWorkerRegistration } & AppVersion) | undefined
> {
  if (!('serviceWorker' in navigator)) {
    return undefined
  }
  const versionResponse = await fetch('/api/version', { cache: 'no-store' })
  if (!versionResponse.ok) {
    throw new Error(`Unable to check app version (${versionResponse.status})`)
  }
  const deployed = parseAppVersion(await versionResponse.json())
  const bundleUpdate =
    deployed.version !== __APP_VERSION__ ||
    (deployed.buildId !== undefined && deployed.buildId !== __APP_BUILD_ID__)
  // Retarget even when this page is current: a waiting worker can belong to a
  // release that has since been rolled back.
  const registration = await navigator.serviceWorker.register(
    workerUrl(deployed),
    workerOptions,
  )
  await registration.update()
  if (registration.waiting) {
    return { registration, ...deployed }
  }
  const worker =
    registration.installing || (await waitForInstallingWorker(registration))
  if (worker) {
    await waitForWorkerInstalled(worker)
  }
  return registration.waiting || bundleUpdate
    ? { registration, ...deployed }
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
