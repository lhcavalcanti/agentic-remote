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
