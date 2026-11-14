import { createHash } from 'node:crypto'
import type { HubEvent, ManagedSession, SessionStatus } from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import type { NotificationKind, NotificationRecord } from '../shared/notification-center.js'
import { alertNotification, notificationBrief, ORACLE_NOTIFICATION_URL } from '../shared/notifications.js'

export interface NotificationCursor {
  status?: SessionStatus
  revision?: number
  rootPromptId?: string
  actions?: string[]
  online?: boolean
  episode?: number
  touchedAt: string
}

export type NotificationCursors = Record<string, NotificationCursor>

/** Length-delimited by JSON, so colons or other delimiters in IDs cannot alias. */
export function notificationIdentity(kind: NotificationKind, ...parts: (string | undefined)[]): string {
  return createHash('sha256').update(JSON.stringify([kind, ...parts])).digest('hex')
}

function record(
  kind: NotificationKind,
  identity: (string | undefined)[],
  fields: Omit<NotificationRecord, 'id' | 'kind' | 'muted'>,
): NotificationRecord {
  return { ...fields, kind, id: notificationIdentity(kind, ...identity), muted: false }
}

function sessionRecord(
  session: ManagedSession,
  kind: NotificationKind,
  anchor: string,
  body: string,
  createdAt: string,
  source: 'root' | 'permission' | 'question' = 'root',
): NotificationRecord {
  const { computerId, id: sessionId } = session
  const title = kind === 'session.completed' ? 'Finished' : kind === 'session.failed' ? 'Failed' : 'Action needed'
  return record(kind, [computerId, sessionId, source, anchor], {
    computerId,
    sessionId,
    severity: kind === 'session.failed' ? 'error' : kind === 'session.needs-input' ? 'warning' : 'info',
    title: `${title} · ${notificationBrief(session.title)}`,
    body: `${notificationBrief(session.computerName)} · ${notificationBrief(body)}`,
    url: `/?computer=${encodeURIComponent(computerId)}&session=${encodeURIComponent(sessionId)}`,
    createdAt,
    coalesceKey: JSON.stringify(['session', computerId, sessionId]),
  })
}

/**
 * Runs on hub signals, before delivery suppression. Cursors are committed with
 * the records, so reconnect snapshots and startup pending requests are replays.
 */
export function classifyHubNotification(
  event: HubEvent,
  cursors: NotificationCursors,
  now: string,
  baseline = false,
): NotificationRecord[] {
  if (event.type === 'session.upserted') {
    const session = event.session
    const key = JSON.stringify(['session', session.computerId, session.id])
    const before = cursors[key]
    if (before?.revision !== undefined && session.revision !== undefined && session.revision < before.revision) return []
    // User message IDs are durable root-prompt identities. Roster summaries
    // omit messages, so keep the previous anchor rather than replacing it.
    const user = session.messages.findLast((message) => message.role === 'user')
    const startsTurn = session.status === 'running' && before?.status !== 'running'
    const rootPromptId = user?.id ?? session.queuedDispatch?.promptId ?? (startsTurn ? undefined : before?.rootPromptId)
    const actions = [
      ...(session.pendingPermission ? [`permission:${session.pendingPermission.requestId}`] : []),
      ...(session.pendingUserInput ? [`question:${session.pendingUserInput.requestId}`] : []),
    ]
    cursors[key] = {
      status: session.status,
      revision: session.revision ?? before?.revision,
      rootPromptId,
      actions,
      touchedAt: now,
    }
    const results: NotificationRecord[] = []
    for (const action of actions) {
      if (before?.actions?.includes(action)) continue
      const body = action.startsWith('permission:') ? session.pendingPermission!.title : session.pendingUserInput!.question
      results.push(sessionRecord(session, 'session.needs-input', action, body, now,
        action.startsWith('permission:') ? 'permission' : 'question'))
    }
    // Never invent a finished turn from initial history, queued work, a
    // suspension or recovery. Missing root IDs are resolved by the service.
    if (baseline || !before || !rootPromptId || actions.length) return results
    if (before.status === 'running' && session.status === 'idle' && !session.queuedCount &&
        !session.suspended && session.restartRecovery?.state !== 'recovering' && !session.recoverySeedState &&
        !session.queuedDispatch && !session.terminalQueueDispatchPending && !session.recoveryAcknowledgementPending) {
      results.push(sessionRecord(session, 'session.completed', rootPromptId, 'No action needed', now))
    } else if (session.status === 'error' && before.status !== 'error') {
      results.push(sessionRecord(session, 'session.failed', JSON.stringify([rootPromptId, session.failedPrompt?.failedAt]),
        session.activity || 'The session failed. Open it for details.', now))
    } else if (session.status === 'waiting' && before.status !== 'waiting') {
      results.push(sessionRecord(session, 'session.needs-input', rootPromptId, 'Waiting for your input.', now))
    }
    return results
  }
  if (event.type === 'error' && event.notify) {
    const payload = alertNotification(event.computerId, event.message)
    return [record('host.alert', [event.computerId, event.message], {
      computerId: event.computerId,
      sessionId: event.sessionId,
      severity: 'error',
      title: payload.title,
      body: payload.body,
      url: payload.data.url,
      createdAt: now,
      coalesceKey: JSON.stringify(['host', event.computerId]),
    })]
  }
  if (event.type === 'computer.updated') {
    const computer = event.computer
    const key = JSON.stringify(['computer', computer.id, computer.lifecycleGeneration])
    const before = cursors[key]
    const offline = before?.online === true && !computer.online
    const episode = (before?.episode ?? 0) + (offline ? 1 : 0)
    cursors[key] = { online: computer.online, episode, touchedAt: now }
    if (offline) return [record('computer.offline', [computer.id, computer.lifecycleGeneration, String(episode)], {
      computerId: computer.id,
      severity: 'warning',
      title: `${notificationBrief(computer.name)} is offline`,
      body: 'Sessions on this computer may be unavailable until it reconnects.',
      url: '/',
      createdAt: now,
      coalesceKey: JSON.stringify(['computer', computer.id]),
    })]
  }
  return []
}

/** Oracle's work inbox is not consumed or acknowledged by notification reads. */
export function classifyOracleNotification(event: ManagerEvent, now: string): NotificationRecord[] {
  if (event.type !== 'manager.message') return []
  const message = event.message
  let suffix: string
  let title: string
  let body: string
  let severity: NotificationRecord['severity'] = 'info'
  if (message.role === 'activity' && message.confirmation?.state === 'pending') {
    suffix = 'confirm'
    title = 'Oracle needs your OK'
    body = message.content
    severity = 'warning'
  } else if (message.role === 'assistant' && message.content.trim()) {
    suffix = 'done'
    title = 'Oracle replied'
    body = message.content
  } else if (message.role === 'user' && message.state === 'done') {
    suffix = 'done'
    title = 'Oracle replied'
    body = 'Open Oracle to see what it did.'
  } else if (message.role === 'user' && message.state === 'failed') {
    suffix = 'failed'
    title = 'Oracle couldn’t answer'
    body = message.error || 'Your message is kept; press Retry.'
    severity = 'error'
  } else return []
  return [record('oracle.message', [message.role === 'assistant' ? message.replyTo ?? message.id : message.id, suffix], {
    severity,
    title,
    body: notificationBrief(body),
    url: ORACLE_NOTIFICATION_URL,
    createdAt: Number.isFinite(Date.parse(message.updatedAt ?? message.createdAt)) ? message.updatedAt ?? message.createdAt : now,
    coalesceKey: 'oracle',
  })]
}
