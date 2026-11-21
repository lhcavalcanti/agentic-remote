import type {
  AgentProvider,
  BackgroundTaskSnapshot,
  ManagedSession,
  SessionExecutionMode,
  SessionInterruptionCause,
} from '../shared/contracts'
import { hasActiveBackgroundTasks } from '../shared/background-tasks'

export function sessionKey(
  session: Pick<ManagedSession, 'computerId' | 'id'>,
): string {
  return `${session.computerId}:${session.id}`
}

export function computerTone(computerId: string): number {
  let hash = 0
  for (const character of computerId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }
  return hash % 6
}

export function shortPath(value: string): string {
  if (value.startsWith('/home/')) {
    return `~/${value.split('/').slice(3).join('/')}`
  }
  return value
}

export function providerName(provider: AgentProvider | undefined): string {
  return provider === 'claude' ? 'Claude Agent' : 'GitHub Copilot'
}

export function executionModeName(
  executionMode: ManagedSession['executionMode'],
): string | undefined {
  return executionMode === 'tmux'
    ? 'tmux'
    : executionMode === 'sdk'
      ? 'SDK'
      : undefined
}

export function taskSnapshot(
  snapshots: Record<string, BackgroundTaskSnapshot>,
  session: Pick<ManagedSession, 'computerId' | 'id'>,
): BackgroundTaskSnapshot | undefined {
  return snapshots[sessionKey(session)]
}

const interruptionReasons: Record<SessionInterruptionCause, string> = {
  'terminal-stopped': 'its terminal had stopped',
  restart: 'the service restarted while it was working',
  'relaunch-failed': 'its terminal could not be started again',
  'queue-held': 'queued work waits for you to reopen it',
  'recovery-cancelled': 'the recovered turn was cancelled',
}

/** What the banner over an interrupted or archived session says. */
export function retainedSessionNotice(
  session: Pick<ManagedSession, 'archivedAt' | 'interruption'>,
): string {
  const retained = 'History, folder, and queued work are retained.'
  if (session.archivedAt) return `Session archived. ${retained}`
  const cause = session.interruption?.cause
  // A cause this version does not know, or none from before causes were kept.
  if (!cause || !Object.hasOwn(interruptionReasons, cause)) return `Session interrupted. ${retained}`
  const message = session.interruption?.message
  const detail = cause === 'relaunch-failed' && typeof message === 'string'
    ? message.trim().replace(/\.+$/, '')
    : ''
  return `Session interrupted: ${interruptionReasons[cause]}${detail ? ` (${detail})` : ''}. ${retained}`
}

/**
 * Whether Pause or Resume can be used for a session, and the title saying what
 * it does or why it cannot. The session's row and the open session's menu both
 * offer it, so they answer alike.
 */
export function suspendAvailability(
  session: ManagedSession,
  backgroundTasks: BackgroundTaskSnapshot | undefined,
  { computerName, online, suspending }: {
    computerName: string
    online: boolean
    /** Only this session's own suspend or resume in flight; another's is no reason. */
    suspending: boolean
  },
): { available: boolean; title: string } {
  // The owning computer refuses on any of these, so offering the button only
  // led to an error. Queued work counts although runningCount leaves it out.
  const retained = Boolean(session.interruption || session.archivedAt)
  const busy = session.status !== 'idle' ||
    Boolean(session.pendingUserInput || session.pendingPermission)
  const ownsTasks = (backgroundTasks?.runningCount || 0) > 0 ||
    hasActiveBackgroundTasks(backgroundTasks)
  return {
    available: online && !suspending &&
      (Boolean(session.suspended) || !(retained || busy || ownsTasks)),
    title: !online
      ? `Reconnect ${computerName} to manage this session`
      : suspending
        ? 'Wait for this suspend or resume to finish'
        : session.suspended
          ? 'Start this session up again'
          : retained
            ? 'Reopen this session before suspending it'
            : busy
              ? 'Wait for the session to finish before suspending it'
              : ownsTasks
                ? 'Wait for its background tasks to finish before suspending it'
                : 'Keep this session but stop what is running for it',
  }
}

type SessionState =
  | 'question'
  | 'permission'
  | 'waiting'
  | 'unconfirmed'
  | 'error'
  | 'suspended'
  | 'tasks'
  | 'recovering'
  | 'running'
  | 'idle'
  | 'offline'

export type SessionPresentation = {
  state: SessionState
  label: string
  description: string
  needsAttention: boolean
  working: boolean
}

const stateLabels: Record<SessionState, string> = {
  question: 'Question',
  permission: 'Permission',
  waiting: 'Waiting',
  unconfirmed: 'Check delivery',
  error: 'Error',
  suspended: 'Suspended',
  tasks: 'Tasks',
  recovering: 'Recovering',
  running: 'Working',
  idle: 'Idle',
  offline: 'Offline',
}

export function sessionPresentation(
  session: ManagedSession,
  snapshot?: BackgroundTaskSnapshot,
  online = true,
): SessionPresentation {
  // A pending answer wins even if a provider's passive status is stale.
  const state: SessionState = session.pendingUserInput
    ? 'question'
    : session.pendingPermission
      ? 'permission'
      : session.restartRecovery?.state === 'recovering'
        ? 'recovering'
      : session.status === 'waiting'
        ? 'waiting'
        : session.queueState?.state === 'waiting'
          ? 'waiting'
          : session.queueState?.state === 'error'
            ? 'error'
        : session.queuedDispatch?.state === 'uncertain'
          ? 'unconfirmed'
          : session.status === 'error' || session.failedPrompt || session.interruption
            ? 'error'
            : session.suspended
              ? 'suspended'
              : session.status === 'running'
                ? 'running'
                : (snapshot?.runningCount || 0) > 0
                  ? 'tasks'
                  : 'idle'
  const needsAttention = ['question', 'permission', 'waiting', 'unconfirmed', 'error'].includes(
    state,
  )
  return {
    state: online ? state : 'offline',
    label: online && state === 'error' && session.restartRecovery?.state === 'failed'
      ? 'Recovery failed'
      : online && state === 'error' && session.interruption
        ? 'Interrupted'
        : stateLabels[online ? state : 'offline'],
    description: online
      ? session.restartRecovery?.message || session.queueState?.message || stateLabels[state]
      : `Computer offline. Last known state: ${stateLabels[state].toLowerCase()}.`,
    needsAttention,
    working: online && (state === 'running' || state === 'tasks' || state === 'recovering'),
  }
}

export function matchesSessionSearch(
  session: ManagedSession,
  query: string,
  computerName = session.computerName,
): boolean {
  const searchable = [
    session.title,
    session.cwd,
    shortPath(session.cwd),
    computerName,
    providerName(session.provider),
    executionModeName(session.executionMode),
  ].join(' ').toLowerCase()
  return query.trim().toLowerCase().split(/\s+/).every(
    (term) => searchable.includes(term),
  )
}

export type SessionSort = 'custom' | 'recent' | 'attention' | 'name'

export function sessionSortFrom(value: unknown): SessionSort {
  return value === 'recent' || value === 'attention' || value === 'name'
    ? value
    : 'custom'
}

const attentionRank: Record<SessionState, number> = {
  question: 0,
  permission: 1,
  waiting: 2,
  unconfirmed: 3,
  error: 3,
  tasks: 4,
  recovering: 4,
  running: 4,
  idle: 5,
  suspended: 6,
  offline: 7,
}

function recentFirst(left: ManagedSession, right: ManagedSession): number {
  const leftTime = Date.parse(left.updatedAt)
  const rightTime = Date.parse(right.updatedAt)
  if (!Number.isFinite(leftTime)) return Number.isFinite(rightTime) ? 1 : 0
  if (!Number.isFinite(rightTime)) return -1
  return rightTime - leftTime
}

export function sortSessionView(
  sessions: readonly ManagedSession[],
  sort: SessionSort,
  snapshots: Record<string, BackgroundTaskSnapshot>,
): ManagedSession[] {
  const ordered = [...sessions]
  if (sort === 'custom') return ordered
  return ordered.sort((left, right) => {
    if (sort === 'name') {
      return left.title.localeCompare(right.title, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    }
    if (sort === 'attention') {
      const leftState = sessionPresentation(left, taskSnapshot(snapshots, left))
      const rightState = sessionPresentation(right, taskSnapshot(snapshots, right))
      const priority = attentionRank[leftState.state] - attentionRank[rightState.state]
      if (priority) return priority
    }
    return recentFirst(left, right)
  })
}

/**
 * One computer's sessions in display order. `sessions` arrive newest first,
 * which is also the order of any the custom order does not rank yet.
 */
export function orderSessionLane(
  sessions: readonly ManagedSession[],
  customOrder: readonly string[],
  sort: SessionSort,
  snapshots: Record<string, BackgroundTaskSnapshot>,
): ManagedSession[] {
  const rank = new Map(customOrder.map((key, index) => [key, index]))
  return sortSessionView(
    [...sessions].sort(
      (left, right) =>
        (rank.get(sessionKey(left)) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(sessionKey(right)) ?? Number.MAX_SAFE_INTEGER),
    ),
    sort,
    snapshots,
  )
}

export interface SessionCreationDraft {
  id: string
  computerId: string
  cwd: string
  provider?: AgentProvider
  executionMode?: SessionExecutionMode
}

// Computers name a new session after its folder. A bare `~` resolves to a home
// folder this browser cannot see, so that name is only an estimate.
function newSessionTitle(cwd: string, provider?: AgentProvider): string {
  return cwd.replace(/\/+$/u, '').split('/').pop() ||
    (provider === 'claude' ? 'New Claude session' : 'New session')
}

/**
 * Where sessions being created will appear, in display order.
 *
 * A new session starts idle, named after its folder and newer than anything
 * else on its computer, and the custom order appends it once it exists. Each
 * placement lists the existing sessions that will follow it, nearest first.
 *
 * Creations on one computer are sent one after another, so they finish in
 * the order they started.
 *
 * @param sessions One computer's sessions, newest first.
 * @param creations That computer's pending creations, oldest first.
 */
export function pendingSessionPlacements(
  sessions: readonly ManagedSession[],
  creations: readonly SessionCreationDraft[],
  customOrder: readonly string[],
  sort: SessionSort,
  snapshots: Record<string, BackgroundTaskSnapshot>,
): { id: string; followers: string[] }[] {
  if (!creations.length) return []
  const newest = sessions.reduce((latest, session) => {
    const time = Date.parse(session.updatedAt)
    return Number.isFinite(time) && time > latest ? time : latest
  }, 0)
  const standIns = creations.map((creation, index): ManagedSession => ({
    id: creation.id,
    computerId: creation.computerId,
    computerName: '',
    provider: creation.provider,
    executionMode: creation.executionMode,
    cwd: creation.cwd,
    title: newSessionTitle(creation.cwd, creation.provider),
    updatedAt: new Date(newest + index + 1).toISOString(),
    status: 'idle',
    messages: [],
  }))
  const pending = new Set(standIns.map(sessionKey))
  // The browser appends sessions it has not ordered yet, newest first, and
  // each creation once it finishes.
  const ranked = new Set(customOrder)
  const lane = [
    ...customOrder,
    ...sessions.map(sessionKey).filter((key) => !ranked.has(key)),
    ...standIns.map(sessionKey),
  ]
  const ordered = orderSessionLane(
    [...standIns].reverse().concat(sessions),
    lane,
    sort,
    snapshots,
  )
  return ordered.flatMap((session, index) =>
    pending.has(sessionKey(session))
      ? [{
          id: session.id,
          followers: ordered
            .slice(index + 1)
            .map(sessionKey)
            .filter((key) => !pending.has(key)),
        }]
      : [],
  )
}

const sessionDay = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const sessionTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export function sessionActivityTime(updatedAt: string, now = new Date()): {
  label: string
  title: string
  dateTime?: string
} {
  const date = new Date(updatedAt)
  if (!Number.isFinite(date.getTime())) {
    return { label: '--', title: 'Activity time unavailable' }
  }
  return {
    label: date.toDateString() === now.toDateString()
      ? sessionTime.format(date)
      : sessionDay.format(date),
    title: `Last activity: ${date.toLocaleString()}`,
    dateTime: updatedAt,
  }
}
