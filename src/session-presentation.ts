import type {
  AgentProvider,
  BackgroundTaskSnapshot,
  ManagedSession,
} from '../shared/contracts'

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

type SessionState =
  | 'question'
  | 'permission'
  | 'waiting'
  | 'error'
  | 'suspended'
  | 'tasks'
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
  error: 'Error',
  suspended: 'Suspended',
  tasks: 'Tasks',
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
      : session.status === 'waiting'
        ? 'waiting'
        : session.status === 'error'
          ? 'error'
          : session.suspended
            ? 'suspended'
            : (snapshot?.runningCount || 0) > 0
              ? 'tasks'
              : session.status === 'running'
                ? 'running'
                : 'idle'
  const needsAttention = ['question', 'permission', 'waiting', 'error'].includes(
    state,
  )
  return {
    state: online ? state : 'offline',
    label: stateLabels[online ? state : 'offline'],
    description: online
      ? stateLabels[state]
      : `Computer offline. Last known state: ${stateLabels[state].toLowerCase()}.`,
    needsAttention,
    working: online && (state === 'running' || state === 'tasks'),
  }
}

export function matchesSessionSearch(
  session: ManagedSession,
  query: string,
): boolean {
  const searchable = [
    session.title,
    session.cwd,
    shortPath(session.cwd),
    session.computerName,
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
  error: 3,
  tasks: 4,
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
