/**
 * Turns session-list changes into native shell notifications.
 *
 * An embedded webview has no Web Push, so inside the shell the app must raise
 * its own notifications from the live event stream. In a browser or installed
 * PWA this module is never used and Web Push keeps working unchanged.
 *
 * Priority and urgency follow `docs/app-spec.md` §10, and the tags match
 * `sessionNotificationTags` in `pwa.ts` so opening a session withdraws whatever
 * it raised.
 */

import type { ShellNotification } from './shell'

export interface NotifiableSession {
  computerId: string
  id: string
  title?: string
  status?: string
  queuedCount?: number
  pendingPermission?: { requestId?: string } | undefined
  pendingUserInput?: { requestId?: string } | undefined
}

export interface SessionNotificationState {
  status?: string
  permission?: string
  question?: string
}

export interface ShellNotificationContext {
  /** Snapshot from the previous update; sessions absent from it never notify. */
  previous: ReadonlyMap<string, SessionNotificationState>
  /** Computer id to display name, so a notification names its computer. */
  computerNames?: ReadonlyMap<string, string>
  mutedKeys?: readonly string[]
  /** The session currently open, which is not worth announcing when visible. */
  activeKey?: string
  documentVisible?: boolean
}

function key(session: NotifiableSession): string {
  return `${session.computerId}:${session.id}`
}

/**
 * A pending request identifies itself by `requestId`. Fall back to a constant
 * so a request without one still registers as present rather than as absent.
 */
function requestId(pending: { requestId?: string } | undefined): string | undefined {
  if (pending == null) {
    return undefined
  }
  return typeof pending.requestId === 'string' && pending.requestId
    ? pending.requestId
    : 'pending'
}

/** Capture the state later updates are compared against. */
export function notificationState(
  sessions: readonly NotifiableSession[],
): Map<string, SessionNotificationState> {
  return new Map(
    sessions.map((session) => [
      key(session),
      {
        status: session.status,
        permission: requestId(session.pendingPermission),
        question: requestId(session.pendingUserInput),
      },
    ]),
  )
}

function label(
  session: NotifiableSession,
  computerNames: ReadonlyMap<string, string> | undefined,
): string {
  const name = session.title?.trim() || 'Untitled session'
  const computer = computerNames?.get(session.computerId)?.trim()
  return computer ? `${computer} · ${name}` : name
}

/**
 * Compare the current session list against the previous state and return the
 * notifications that should be raised, highest priority first and at most one
 * per session.
 */
export function shellNotifications(
  sessions: readonly NotifiableSession[],
  context: ShellNotificationContext,
): ShellNotification[] {
  const muted = new Set(context.mutedKeys ?? [])
  const notifications: ShellNotification[] = []

  for (const session of sessions) {
    const sessionKey = key(session)
    const before = context.previous.get(sessionKey)
    // A session seen for the first time is history, not news. This also stops
    // a burst of notifications on first load or after a reconnect snapshot.
    if (!before || muted.has(sessionKey)) {
      continue
    }
    // No point announcing the conversation the user is already reading.
    if (sessionKey === context.activeKey && context.documentVisible) {
      continue
    }

    const question = requestId(session.pendingUserInput)
    const permission = requestId(session.pendingPermission)
    const name = label(session, context.computerNames)

    if (question && question !== before.question) {
      notifications.push({
        tag: `agentic-question-${session.computerId}-${session.id}`,
        title: name,
        body: 'Waiting for your answer.',
        urgent: true,
      })
      continue
    }
    if (permission && permission !== before.permission) {
      notifications.push({
        tag: `agentic-action-${session.computerId}-${session.id}`,
        title: name,
        body: 'Waiting for permission.',
        urgent: true,
      })
      continue
    }
    // Going idle is only "finished" when nothing is left to do. A queued
    // prompt means the next one is about to start, and a request that is still
    // pending was already announced as the higher-priority event.
    if (
      before.status === 'running' &&
      session.status === 'idle' &&
      !(session.queuedCount && session.queuedCount > 0) &&
      !question &&
      !permission
    ) {
      notifications.push({
        tag: `agentic-finished-${session.computerId}-${session.id}`,
        title: name,
        body: 'Finished. No action needed.',
        urgent: false,
      })
    }
  }

  return notifications
}
