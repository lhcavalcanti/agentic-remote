/**
 * Bridge between the web app and the optional desktop shell.
 *
 * The shell injects `window.__AGENTIC_DESKTOP__` before the page loads. The web
 * app never imports a shell SDK, so it gains no dependency and keeps working
 * unchanged in a browser or as an installed PWA.
 *
 * Every capability is detected individually because a shell may be older or
 * newer than the hub it is pointed at. A shell that throws, or that is missing
 * a method entirely, must degrade to browser behavior rather than break the UI.
 */

export interface DesktopNotificationAction {
  id: string
  title: string
}

export interface DesktopNotification {
  /** Stable per-session tag so the shell can replace or withdraw it. */
  tag: string
  title: string
  body: string
  /** Questions and permissions are urgent; completions are not. */
  urgent?: boolean
  actions?: DesktopNotificationAction[]
}

export interface DesktopNotificationReply {
  tag: string
  actionId: string
}

export interface DesktopSessionTarget {
  computerId: string
  sessionId: string
}

export interface DesktopAttentionState {
  status?: string
  pendingPermission?: unknown
  pendingUserInput?: unknown
}

interface DesktopBridge {
  version?: unknown
  platform?: unknown
  setBadge?: (count: number) => unknown
  notify?: (notification: DesktopNotification) => unknown
  withdrawNotifications?: (tags: string[]) => unknown
  onNotificationReply?: (
    handler: (reply: DesktopNotificationReply) => void,
  ) => unknown
  onDeepLink?: (handler: (url: string) => void) => unknown
}

declare global {
  interface Window {
    __AGENTIC_DESKTOP__?: DesktopBridge
  }
}

const DEEP_LINK_SCHEME = 'agentic://'

function bridge(): DesktopBridge | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }
  const candidate = window.__AGENTIC_DESKTOP__
  return typeof candidate === 'object' && candidate !== null
    ? candidate
    : undefined
}

function method<TName extends keyof DesktopBridge>(
  name: TName,
): DesktopBridge[TName] | undefined {
  const value = bridge()?.[name]
  return typeof value === 'function' ? value : undefined
}

/** True when the UI is running inside the desktop shell. */
export function desktopShell(): boolean {
  return bridge() !== undefined
}

/** Shell version, which is independent of the hub's `__APP_VERSION__`. */
export function desktopShellVersion(): string | undefined {
  const value = bridge()?.version
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** `macos`, `windows`, or `linux` when the shell reports it. */
export function desktopPlatform(): string | undefined {
  const value = bridge()?.platform
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/**
 * Sessions that are blocked on the user. A pending permission or question
 * always counts, and `waiting` covers a terminal session whose dialog was
 * parsed from the pane rather than delivered as a structured request.
 */
export function attentionCount(
  sessions: readonly DesktopAttentionState[],
): number {
  return sessions.reduce(
    (total, session) =>
      session.pendingPermission != null ||
      session.pendingUserInput != null ||
      session.status === 'waiting'
        ? total + 1
        : total,
    0,
  )
}

let lastBadge: number | undefined

/**
 * Publish the attention count to the dock, taskbar, or launcher. Repeated calls
 * with an unchanged count are dropped so timeline updates do not produce a
 * stream of redundant IPC.
 */
export function setDesktopBadge(count: number): void {
  const setBadge = method('setBadge')
  if (!setBadge) {
    return
  }
  const normalized =
    Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
  if (normalized === lastBadge) {
    return
  }
  lastBadge = normalized
  try {
    setBadge(normalized)
  } catch {
    // A shell that cannot badge must not break the conversation view.
  }
}

/** Test seam: forget the coalesced badge value. */
export function resetDesktopBadge(): void {
  lastBadge = undefined
}

/**
 * Ask the shell to raise a native notification. Returns false when the shell is
 * absent or refused it, so the caller can fall back to Web Push.
 */
export function sendDesktopNotification(
  notification: DesktopNotification,
): boolean {
  const notify = method('notify')
  if (!notify) {
    return false
  }
  try {
    notify(notification)
    return true
  } catch {
    return false
  }
}

/**
 * Withdraw notifications for a session that the user has now opened, matching
 * the specification's requirement that opening a chat clears its notifications.
 */
export function withdrawDesktopNotifications(tags: readonly string[]): void {
  const withdraw = method('withdrawNotifications')
  if (!withdraw || tags.length === 0) {
    return
  }
  try {
    withdraw([...tags])
  } catch {
    // Clearing is best-effort; a stale notification is not worth an error.
  }
}

function subscribe<TPayload>(
  name: 'onNotificationReply' | 'onDeepLink',
  handler: (payload: TPayload) => void,
): () => void {
  const register = method(name)
  if (!register) {
    return () => undefined
  }
  let release: unknown
  try {
    release = (register as (fn: (payload: TPayload) => void) => unknown)(
      handler,
    )
  } catch {
    return () => undefined
  }
  return () => {
    if (typeof release !== 'function') {
      return
    }
    try {
      ;(release as () => void)()
    } catch {
      // An unsubscribe that fails must not propagate out of cleanup.
    }
  }
}

/**
 * Observe an action button pressed on a native notification, which lets a
 * permission be answered without focusing the app.
 */
export function onDesktopNotificationReply(
  handler: (reply: DesktopNotificationReply) => void,
): () => void {
  return subscribe<DesktopNotificationReply>('onNotificationReply', (reply) => {
    if (
      typeof reply?.tag === 'string' &&
      typeof reply?.actionId === 'string'
    ) {
      handler(reply)
    }
  })
}

/** Observe `agentic://` links opened while the app is running. */
export function onDesktopDeepLink(
  handler: (target: DesktopSessionTarget) => void,
): () => void {
  return subscribe<string>('onDeepLink', (url) => {
    const target = parseDesktopDeepLink(url)
    if (target) {
      handler(target)
    }
  })
}

function decodeSegment(value: string): string | undefined {
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

/**
 * Parse the canonical deep link
 * `agentic://computer/<computerId>/session/<sessionId>`.
 *
 * Anything else returns undefined rather than a partial target, so a malformed
 * link cannot navigate to the wrong session.
 */
export function parseDesktopDeepLink(
  value: string,
): DesktopSessionTarget | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  if (!trimmed.toLowerCase().startsWith(DEEP_LINK_SCHEME)) {
    return undefined
  }
  const path = trimmed.slice(DEEP_LINK_SCHEME.length).split(/[?#]/)[0] ?? ''
  const segments = path.split('/').filter(Boolean)
  if (segments.length !== 4) {
    return undefined
  }
  const [computerKeyword, rawComputerId, sessionKeyword, rawSessionId] =
    segments as [string, string, string, string]
  if (
    computerKeyword.toLowerCase() !== 'computer' ||
    sessionKeyword.toLowerCase() !== 'session'
  ) {
    return undefined
  }
  const computerId = decodeSegment(rawComputerId)
  const sessionId = decodeSegment(rawSessionId)
  if (!computerId || !sessionId) {
    return undefined
  }
  return { computerId, sessionId }
}

/** Build the deep link that addresses a session on a specific computer. */
export function desktopDeepLink(target: DesktopSessionTarget): string {
  return `${DEEP_LINK_SCHEME}computer/${encodeURIComponent(
    target.computerId,
  )}/session/${encodeURIComponent(target.sessionId)}`
}
