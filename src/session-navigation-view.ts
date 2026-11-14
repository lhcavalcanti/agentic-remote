import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
} from '../shared/contracts'
import {
  matchesSessionSearch,
  sessionKey,
  sessionPresentation,
  taskSnapshot,
} from './session-presentation'

export type SessionFilter = 'all' | 'attention' | 'working'

export interface SessionNavigationView {
  groups: {
    computer: ComputerSummary
    sessions: ManagedSession[]
    total: number
    /** Sessions left out of the list because they are hidden. */
    hidden: number
  }[]
  counts: Record<SessionFilter, number> & { suspended: number; hidden: number }
  visible: ManagedSession[]
  shown: number
  filtering: boolean
  reorderDisabled: boolean
}

export interface HiddenSessions {
  /** `computerId:sessionId` of the sessions left out of the list. */
  keys: ReadonlySet<string>
  /** Whether the list shows them anyway. */
  shown: boolean
}

const noHiddenSessions: HiddenSessions = { keys: new Set(), shown: false }

export function sessionNavigationView(
  computers: readonly ComputerSummary[],
  sessionsByComputer: ReadonlyMap<string, ManagedSession[]>,
  backgroundTasks: Record<string, BackgroundTaskSnapshot>,
  query: string,
  filter: SessionFilter,
  showSuspended = true,
  hiddenSessions: HiddenSessions = noHiddenSessions,
): SessionNavigationView {
  const counts = { all: 0, attention: 0, working: 0, suspended: 0, hidden: 0 }
  const groups = computers.map((computer) => {
    const open = (sessionsByComputer.get(computer.id) || []).filter((session) => session.isOpen !== false)
    const states = open.map((session) => ({
      session,
      hidden: hiddenSessions.keys.has(sessionKey(session)),
      state: sessionPresentation(
        session,
        taskSnapshot(backgroundTasks, session),
        computer.online,
      ),
    }))
    // Hiding is curation rather than a filter: a hidden session leaves the
    // list, and its counts, unless shown -- or while it needs you, so a
    // question or permission is never out of sight.
    const classified = states.filter((entry) =>
      !entry.hidden || hiddenSessions.shown || entry.state.needsAttention)
    counts.hidden += states.filter((entry) => entry.hidden).length
    counts.all += classified.length
    counts.attention += classified.filter(({ state }) => state.needsAttention).length
    counts.working += classified.filter(({ state }) => state.working).length
    counts.suspended += classified.filter(({ session }) => session.suspended === true).length
    return {
      computer,
      total: classified.length,
      hidden: states.length - classified.length,
      sessions: classified.filter(({ session, state }) =>
        (showSuspended || session.suspended !== true) &&
          matchesSessionSearch(session, query, computer.name) &&
          (filter === 'all' ||
            (filter === 'attention' && state.needsAttention) ||
            (filter === 'working' && state.working)),
      ).map(({ session }) => session),
    }
  })
  const visible = groups.flatMap((group) => group.sessions)
  return {
    groups,
    counts,
    visible,
    shown: visible.length,
    filtering: query.trim().length > 0 || filter !== 'all' || !showSuspended,
    reorderDisabled: query.trim().length > 0 || filter !== 'all',
  }
}

export function reorderSessionLaneWithHiddenFollowers(
  order: readonly string[],
  activeKey: string,
  overKey: string,
  visibleKeys: ReadonlySet<string>,
): string[] {
  const leadingHidden: string[] = []
  const blocks: string[][] = []
  for (const key of order) {
    if (visibleKeys.has(key)) {
      blocks.push([key])
    } else if (blocks.length > 0) {
      blocks[blocks.length - 1].push(key)
    } else {
      leadingHidden.push(key)
    }
  }
  const from = blocks.findIndex(([key]) => key === activeKey)
  const to = blocks.findIndex(([key]) => key === overKey)
  if (from < 0 || to < 0 || from === to) return [...order]
  const next = blocks.map((block) => [...block])
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return [...leadingHidden, ...next.flat()]
}

export function stepVisibleSession(
  visible: readonly ManagedSession[],
  selectedKey: string | undefined,
  direction: -1 | 1,
): ManagedSession | undefined {
  if (visible.length === 0) return undefined
  const current = visible.findIndex((session) => sessionKey(session) === selectedKey)
  const index = current < 0
    ? direction === 1 ? 0 : visible.length - 1
    : (current + direction + visible.length) % visible.length
  return visible[index]
}
