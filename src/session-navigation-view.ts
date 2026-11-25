import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
} from '../shared/contracts'
import type { SessionCategory } from '../shared/session-categories'
import { DEFAULT_SESSION_PROVIDER } from '../shared/settings-profile'
import { computerProviders } from './session-setup/runtime-presentation'
import {
  matchesSessionSearch,
  sessionKey,
  sessionPresentation,
  sortSessionView,
  taskSnapshot,
} from './session-presentation'

export type SessionFilter = 'all' | 'attention' | 'working' | 'unread'

/** How many sessions a collapsed category keeps in sight beside the open one. */
export const COLLAPSED_CATEGORY_ROWS = 3

export interface SessionCategorySection {
  category: Pick<SessionCategory, 'id' | 'name' | 'collapsed'>
  /** Whether it shows collapsed: never while the list is filtered. */
  collapsed: boolean
  /**
   * The rows it shows: every listed session expanded, or the matches while
   * filtering; collapsed, those that need you or are unread and the open one.
   */
  sessions: ManagedSession[]
  /** Its sessions the list includes, whether or not they are shown. */
  total: number
  attention: number
  unread: number
  working: boolean
  /** Collapsed, how many of its sessions are not shown. */
  more: number
  /**
   * The most recently active of its sessions the list includes, whether or
   * not it is shown: a new session in the category starts beside it.
   */
  latest?: ManagedSession
}

/** Where a new session in a category starts, or why one cannot start there now. */
export type CategoryNewSession =
  | { computer: ComputerSummary; cwd: string }
  | { unavailable: string }

/**
 * A new session in a category starts on the computer and in the folder of
 * its most recently active session, with the New session dialog's default
 * provider, which that computer has to be online and offer.
 */
export function categoryNewSession(
  latest: ManagedSession | undefined,
  computers: ReadonlyMap<string, ComputerSummary>,
): CategoryNewSession {
  if (!latest) return { unavailable: 'Needs a session in it first' }
  const computer = computers.get(latest.computerId)
  if (!computer) return { unavailable: 'Its computer is no longer paired' }
  if (!computer.online) return { unavailable: `${computer.name} is offline` }
  const provider = computerProviders(computer).find((entry) => entry.id === DEFAULT_SESSION_PROVIDER)
  if (!provider?.available) {
    return { unavailable: `${provider?.name ?? 'GitHub Copilot'} is unavailable on ${computer.name}` }
  }
  return { computer, cwd: latest.cwd }
}

export interface CategorizedSessions {
  /** In display order, each with its sessions in the order the list shows them. */
  categories: readonly {
    category: Pick<SessionCategory, 'id' | 'name' | 'collapsed' | 'sessions'>
    sessions: readonly ManagedSession[]
  }[]
  /** The open session, which a collapsed category keeps in sight. */
  selectedKey?: string
}

export interface SessionNavigationView {
  /** Above the computers, in their order. */
  categories: SessionCategorySection[]
  groups: {
    computer: ComputerSummary
    /** The sessions in no category. */
    sessions: ManagedSession[]
    total: number
    /** Sessions left out of the list because they are hidden. */
    hidden: number
    /** Its open sessions in categories, listed there or hidden. */
    categorized: number
  }[]
  counts: Record<SessionFilter, number> & { hidden: number }
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
const noUnreadSessions: ReadonlySet<string> = new Set()
const noCategories: CategorizedSessions = { categories: [] }

export function sessionNavigationView(
  computers: readonly ComputerSummary[],
  sessionsByComputer: ReadonlyMap<string, ManagedSession[]>,
  backgroundTasks: Record<string, BackgroundTaskSnapshot>,
  query: string,
  filter: SessionFilter,
  hiddenSessions: HiddenSessions = noHiddenSessions,
  /** `computerId:sessionId` of the sessions not read since their last turn ended. */
  unreadSessions: ReadonlySet<string> = noUnreadSessions,
  /** Categories with their sessions; a session in one is listed there instead of under its computer. */
  categorized: CategorizedSessions = noCategories,
): SessionNavigationView {
  const filtering = query.trim().length > 0 || filter !== 'all'
  const counts = { all: 0, attention: 0, working: 0, unread: 0, hidden: 0 }
  const online = new Map(computers.map((computer) => [computer.id, computer]))
  const classify = (session: ManagedSession, computer: ComputerSummary) => ({
    session,
    hidden: hiddenSessions.keys.has(sessionKey(session)),
    unread: unreadSessions.has(sessionKey(session)),
    state: sessionPresentation(session, taskSnapshot(backgroundTasks, session), computer.online),
  })
  // Hiding is curation rather than a filter: a hidden session leaves the
  // list, and its counts, unless shown -- or while it needs you, so a
  // question or permission is never out of sight.
  const listed = (entry: ReturnType<typeof classify>) =>
    !entry.hidden || hiddenSessions.shown || entry.state.needsAttention
  const matches = ({ session, state, unread }: ReturnType<typeof classify>, computer: ComputerSummary) =>
    matchesSessionSearch(session, query, computer.name) &&
      (filter === 'all' ||
        (filter === 'attention' && state.needsAttention) ||
        (filter === 'working' && state.working) ||
        (filter === 'unread' && unread))
  const inCategory = new Set<string>()
  const categories = categorized.categories.flatMap(({ category, sessions }) => {
    const states = sessions.flatMap((session) => {
      const computer = online.get(session.computerId)
      if (!computer || session.isOpen === false || inCategory.has(sessionKey(session))) return []
      inCategory.add(sessionKey(session))
      return [{ ...classify(session, computer), computer }]
    })
    const included = states.filter(listed)
    const section = {
      category: { id: category.id, name: category.name, collapsed: category.collapsed },
      total: included.length,
      attention: included.filter(({ state }) => state.needsAttention).length,
      unread: included.filter((entry) => entry.unread).length,
      working: included.some(({ state }) => state.working),
      latest: sortSessionView(included.map(({ session }) => session), 'recent', backgroundTasks)[0],
    }
    if (filtering) {
      const shown = included.filter((entry) => matches(entry, entry.computer)).map(({ session }) => session)
      return shown.length ? [{ ...section, collapsed: false, sessions: shown, more: 0 }] : []
    }
    if (!category.collapsed) {
      return [{ ...section, collapsed: false, sessions: included.map(({ session }) => session), more: 0 }]
    }
    // Needs you before unread, then the open session, each in the list's order.
    const kept = new Set([
      ...included.filter(({ state }) => state.needsAttention),
      ...included.filter((entry) => entry.unread && !entry.state.needsAttention),
    ].slice(0, COLLAPSED_CATEGORY_ROWS).map(({ session }) => sessionKey(session)))
    if (categorized.selectedKey && included.some(({ session }) => sessionKey(session) === categorized.selectedKey)) {
      kept.add(categorized.selectedKey)
    }
    const shown = included.filter(({ session }) => kept.has(sessionKey(session))).map(({ session }) => session)
    return [{ ...section, collapsed: true, sessions: shown, more: included.length - shown.length }]
  })
  const groups = computers.map((computer) => {
    const open = (sessionsByComputer.get(computer.id) || []).filter((session) => session.isOpen !== false)
    const states = open.map((session) => classify(session, computer))
    const classified = states.filter(listed)
    counts.hidden += states.filter((entry) => entry.hidden).length
    counts.all += classified.length
    counts.attention += classified.filter(({ state }) => state.needsAttention).length
    counts.working += classified.filter(({ state }) => state.working).length
    counts.unread += classified.filter((entry) => entry.unread).length
    const own = (entry: ReturnType<typeof classify>) => !inCategory.has(sessionKey(entry.session))
    return {
      computer,
      total: classified.filter(own).length,
      hidden: states.filter(own).length - classified.filter(own).length,
      categorized: states.length - states.filter(own).length,
      sessions: classified.filter((entry) => own(entry) && matches(entry, computer)).map(({ session }) => session),
    }
  })
  const visible = [
    ...categories.flatMap((section) => section.sessions),
    ...groups.flatMap((group) => group.sessions),
  ]
  return {
    categories,
    groups,
    counts,
    visible,
    shown: visible.length,
    filtering,
    reorderDisabled: filtering,
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
