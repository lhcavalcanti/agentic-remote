import { createHash } from 'node:crypto'
import type { ComputerSummary, HubEvent, ManagedSession, SessionStatus } from '../shared/contracts.js'
import type { HostSnapshot } from '../shared/host-telemetry.js'
import type { ManagerEvent } from '../shared/manager.js'
import type { NotificationKind, NotificationRecord } from '../shared/notification-center.js'
import { alertNotification, notificationBrief, notificationPlainText, ORACLE_NOTIFICATION_URL } from '../shared/notifications.js'
import type { Schedule, ScheduleRun } from '../shared/schedules.js'

export interface NotificationCursor {
  status?: SessionStatus
  revision?: number
  rootPromptId?: string
  actions?: string[]
  online?: boolean
  episode?: number
  hostAlert?: {
    sampleAt?: string
    since?: string
    active: boolean
    notified: boolean
    lastNotifiedAt?: string
  }
  touchedAt: string
}

export type NotificationCursors = Record<string, NotificationCursor>
export const HOST_ALERT_COOLDOWN_MS = 30 * 60_000
export const HOST_ALERT_MEMORY_DURATION_MS = 2 * 60_000
const HOST_ALERT_MAX_SAMPLE_AGE_MS = 30_000
const HOST_ALERT_MAX_SAMPLE_GAP_MS = 45_000

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
  scheduledSession = false,
): NotificationRecord[] {
  if (event.type === 'schedule.run.notification') return [event.notification]
  if (event.type === 'session.upserted') {
    // The scheduler's owning-session bridge admits attention; ordinary delivery must not duplicate it.
    if (scheduledSession) return []
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
    // Never invent a finished turn from initial history, queued work or
    // recovery. Missing root IDs are resolved by the service.
    if (baseline || !before || !rootPromptId || actions.length) return results
    if (before.status === 'running' && session.status === 'idle' && !session.queuedCount &&
        session.restartRecovery?.state !== 'recovering' && !session.recoverySeedState &&
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
    const offline = !baseline && before?.online === true && !computer.online
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

/** Resource episodes share canonical admission/deduplication, not health-error delivery. */
export function classifyHostNotification(
  computer: ComputerSummary,
  snapshot: HostSnapshot | undefined,
  cursors: NotificationCursors,
  now: string,
  observations: NotificationCursors = cursors,
  receivedAt = now,
): NotificationRecord[] {
  const nowMs = Date.parse(now)
  const queueAgeMs = Math.max(0, nowMs - Date.parse(receivedAt))
  const sampleMs = snapshot?.latest
    ? snapshot.sampleAgeMs === undefined ? Date.parse(snapshot.latest.at) : nowMs - snapshot.sampleAgeMs - queueAgeMs
    : NaN
  const sampleAt = Number.isFinite(sampleMs) ? new Date(sampleMs).toISOString() : undefined
  const fresh = Number.isFinite(sampleMs) && sampleMs <= nowMs + 5000 && nowMs - sampleMs <= HOST_ALERT_MAX_SAMPLE_AGE_MS
  const used = snapshot?.latest?.memoryUsedBytes
  const total = snapshot?.info?.totalMemoryBytes
  const disk = snapshot?.disk
  const conditions = [
    { name: 'memory', value: used != null && total ? used / total * 100 : null,
      breached: (value: number) => value > 90, recovered: (value: number) => value <= 85,
      duration: HOST_ALERT_MEMORY_DURATION_MS },
    { name: 'disk', value: disk?.totalBytes ? disk.freeBytes / disk.totalBytes * 100 : null,
      breached: (value: number) => value < 5, recovered: (value: number) => value >= 7, duration: 0 },
  ]
  const records: NotificationRecord[] = []
  for (const condition of conditions) {
    const key = JSON.stringify(['host-condition', computer.id, condition.name])
    const before = observations[key]?.hostAlert ?? cursors[key]?.hostAlert
    const state = { active: false, notified: false, ...before }
    // A restart cannot prove uninterrupted pressure during the unobserved gap.
    if (observations !== cursors && !observations[key] && !state.active) delete state.since
    const save = () => {
      observations[key] = { hostAlert: state, touchedAt: now }
      const { sampleAt: _sampleAt, ...episode } = state
      const { sampleAt: _beforeSampleAt, ...previousEpisode } = cursors[key]?.hostAlert ?? { active: false, notified: false }
      if (JSON.stringify(episode) !== JSON.stringify(previousEpisode)) {
        cursors[key] = { hostAlert: { ...state }, touchedAt: now }
      }
    }
    if (!fresh || condition.value === null || !Number.isFinite(condition.value)) {
      // Missing readings cannot prove two minutes of uninterrupted pressure.
      if (state.since && !state.active) {
        delete state.since
        save()
      }
      continue
    }
    if (state.sampleAt && sampleMs <= Date.parse(state.sampleAt)) continue
    if (!state.active && state.sampleAt && sampleMs - Date.parse(state.sampleAt) > HOST_ALERT_MAX_SAMPLE_GAP_MS) {
      delete state.since
    }
    state.sampleAt = sampleAt
    if (state.active && condition.recovered(condition.value)) {
      state.active = false
      state.notified = false
      delete state.since
    } else if (!state.active) {
      if (condition.breached(condition.value)) {
        state.since ??= sampleAt
        state.active = sampleMs - Date.parse(state.since!) >= condition.duration
      } else {
        delete state.since
      }
    }
    if (state.active && !state.notified && condition.breached(condition.value) &&
        (!state.lastNotifiedAt || nowMs - Date.parse(state.lastNotifiedAt) >= HOST_ALERT_COOLDOWN_MS)) {
      const memory = condition.name === 'memory'
      records.push(record('host.alert', [computer.id, condition.name, state.since], {
        computerId: computer.id,
        severity: 'warning',
        title: `${notificationBrief(computer.name)} · ${memory ? 'Memory pressure' : 'Low disk space'}`,
        body: memory
          ? `Memory usage stayed above 90% for at least 2 minutes (${condition.value.toFixed(1)}% used).`
          : `The data mount has less than 5% free space (${condition.value.toFixed(1)}% free).`,
        url: '/',
        createdAt: now,
        coalesceKey: JSON.stringify(['host-condition', computer.id, condition.name]),
      }))
      state.notified = true
      state.lastNotifiedAt = now
    }
    save()
  }
  return records
}

type ScheduleAttention = NonNullable<ScheduleRun['attention']>
export type ScheduleAttentionSession = Pick<ManagedSession,
  'computerId' | 'id' | 'launchId' | 'status' | 'revision' | 'pendingPermission' | 'pendingUserInput'>
const attentionClosed = (status: ScheduleRun['status']) => ['stopping', 'stopped', 'missed', 'interrupted'].includes(status)

function attentionSeed(run: ScheduleRun, notified: boolean): ScheduleAttention {
  return run.attention ?? {
    episode: run.status === 'needs-input' || notified ? 1 : 0,
    active: run.status === 'needs-input', bound: false, requests: {},
  }
}

export function scheduleAttentionAfterStatus(run: ScheduleRun, status: ScheduleRun['status'], notified = false): ScheduleRun['attention'] {
  if (status === run.status) return run.attention
  if (status === 'needs-input') {
    const attention = attentionSeed(run, notified)
    return attention.active ? attention : { ...attention, episode: attention.episode + 1, active: true, bound: false }
  }
  if (run.attention || run.status === 'needs-input') return { ...attentionSeed(run, notified), active: false }
  return undefined
}

/** Request aliases merge the session signal with its later generic run transition. */
export function scheduleAttentionFromSession(run: ScheduleRun, session: ScheduleAttentionSession, notified = false): ScheduleRun['attention'] {
  if (attentionClosed(run.status)) return undefined
  const before = attentionSeed(run, notified)
  if (before.sessionId === session.id && before.sessionRevision !== undefined &&
      session.revision !== undefined && session.revision < before.sessionRevision) return undefined
  const requests = [
    ...(session.pendingPermission && !session.pendingPermission.stale
      ? [notificationIdentity('session.needs-input', session.computerId, session.id, 'permission', session.pendingPermission.requestId)] : []),
    ...(session.pendingUserInput && !session.pendingUserInput.stale
      ? [notificationIdentity('session.needs-input', session.computerId, session.id, 'question', session.pendingUserInput.requestId)] : []),
  ]
  const fresh = requests.filter((id) => !Object.hasOwn(before.requests, id))
  let attention: ScheduleAttention
  if (requests.length) {
    if (!fresh.length) return undefined
    attention = {
      ...before, episode: before.episode + (!before.active || before.bound ? 1 : 0),
      active: true, bound: true, requests: { ...before.requests },
    }
    for (const id of fresh) attention.requests[id] = attention.episode
  } else if (session.status === 'waiting' && !session.pendingPermission && !session.pendingUserInput) {
    if (before.active || (before.sessionId === session.id && before.sessionStatus === 'waiting')) return undefined
    attention = { ...before, episode: before.episode + 1, active: true, bound: false }
  } else {
    if (!before.active || (!run.attention && run.status !== 'needs-input')) return undefined
    attention = { ...before, active: false }
  }
  attention.sessionId = session.id
  attention.sessionStatus = session.status
  attention.sessionRevision = session.revision
  return attention
}

/** The accepted run definition, never today's edited schedule, owns policy. */
export function classifyScheduleNotification(schedule: Schedule, run: ScheduleRun, now: string): NotificationRecord[] {
  if (schedule.notify === 'never') return []
  const outcomes: string[] = [run.status === 'stopped' ? 'interrupted' : run.status]
  if (run.attention?.active && run.status !== 'needs-input' && !attentionClosed(run.status)) outcomes.push('needs-input')
  return outcomes.filter((outcome) => ['succeeded', 'failed', 'needs-input', 'missed', 'interrupted'].includes(outcome) &&
    !(schedule.notify === 'attention' && outcome === 'succeeded')).map((outcome) => {
    const kind = `schedule.run.${outcome}` as NotificationKind
    const severity = outcome === 'succeeded' ? 'info' : outcome === 'failed' ? 'error' : 'warning'
    const label = outcome === 'needs-input' ? 'needs input' : outcome
    const sessionId = run.sessionId ?? run.attention?.sessionId
    const params = new URLSearchParams({ schedule: schedule.id, run: run.id, computer: run.computerId })
    if (sessionId) params.set('session', sessionId)
    const identity = [schedule.id, run.id, outcome]
    if (outcome === 'needs-input' && (run.attention?.episode ?? 1) > 1) identity.push(String(run.attention!.episode))
    return record(kind, identity, {
      computerId: run.computerId, ...(sessionId ? { sessionId } : {}),
      title: `${notificationBrief(schedule.name)} · ${label}`,
      body: notificationBrief(outcome === 'needs-input' ? 'Open the scheduled session to continue.'
        : (outcome === 'succeeded' ? run.summary : run.error || run.summary) || `Scheduled run ${label}.`),
      severity, createdAt: outcome === 'needs-input' ? now : run.endedAt ?? now,
      url: `/?${params}`, coalesceKey: JSON.stringify(['schedule', schedule.id]),
    })
  })
}

/** Oracle's work inbox is not consumed or acknowledged by notification reads. */
export function classifyOracleNotification(event: ManagerEvent, now: string, replies: Map<string, string>): NotificationRecord[] {
  if (event.type === 'manager.reset') replies.clear()
  if (event.type !== 'manager.message') return []
  const message = event.message
  if (message.role === 'assistant') {
    // Stop also stores a partial assistant reply. Only the user's terminal
    // outcome proves that this text belongs to a successfully completed turn.
    if (message.replyTo && message.content.trim()) {
      replies.delete(message.replyTo)
      replies.set(message.replyTo, message.content)
      if (replies.size > 50) replies.delete(replies.keys().next().value!)
    }
    return []
  }
  const reply = message.role === 'user' ? replies.get(message.id) : undefined
  if (message.role === 'user') replies.delete(message.id)
  if (message.role === 'user' && (message.suppressNotification || message.source === 'proactive' ||
      message.automatic?.kind === 'proactive')) return []
  let suffix: string
  let title: string
  let body: string
  let severity: NotificationRecord['severity'] = 'info'
  if (message.role === 'activity' && message.confirmation?.state === 'pending') {
    suffix = 'confirm'
    title = 'Oracle needs your OK'
    body = message.content
    severity = 'warning'
  } else if (message.role === 'user' && message.state === 'done') {
    suffix = 'done'
    title = 'Oracle replied'
    body = (reply && notificationBrief(notificationPlainText(reply))) || 'Open Oracle to see what it did.'
  } else if (message.role === 'user' && message.state === 'failed') {
    suffix = 'failed'
    title = 'Oracle couldn’t answer'
    body = message.error || 'Your message is kept; press Retry.'
    severity = 'error'
  } else return []
  return [record('oracle.message', [message.id, suffix], {
    severity,
    title,
    body: notificationBrief(body),
    url: ORACLE_NOTIFICATION_URL,
    createdAt: Number.isFinite(Date.parse(message.updatedAt ?? message.createdAt)) ? message.updatedAt ?? message.createdAt : now,
    coalesceKey: 'oracle',
  })]
}
