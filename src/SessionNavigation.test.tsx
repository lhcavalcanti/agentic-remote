// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
} from '../shared/contracts'
import { SessionNavigation, type PendingSessionCreation } from './SessionNavigation'
import type { SessionSort } from './session-presentation'
import { sessionNavigationView, type CategorizedSessions, type SessionFilter } from './session-navigation-view'

const computers: ComputerSummary[] = [
  { id: 'studio', name: 'Studio', isLocal: true, online: true },
  { id: 'worker', name: 'Build node', isLocal: false, online: true },
  { id: 'travel', name: 'Travel laptop', isLocal: false, online: false },
]
const session: ManagedSession = {
  id: 'review',
  computerId: 'studio',
  computerName: 'Studio',
  title: 'Review the release',
  cwd: '/home/demo/notes',
  executionMode: 'tmux',
  status: 'idle',
  messages: [],
  updatedAt: '2026-09-01T00:00:00Z',
}
const question: ManagedSession = {
  ...session,
  id: 'question',
  title: 'Choose a direction',
  provider: 'claude',
  executionMode: 'sdk',
  pendingUserInput: {
    requestId: 'input', question: 'Which layout?', choices: ['Docked'], allowFreeform: true,
  },
}
const worker: ManagedSession = {
  ...session, id: 'build', computerId: 'worker', computerName: 'Build node', title: 'Build docs',
}
const offline: ManagedSession = {
  ...session,
  id: 'offline',
  computerId: 'travel',
  computerName: 'Travel laptop',
  title: 'Last known work',
  status: 'running',
}
const sessionsByComputer = new Map([
  ['studio', [session, question]],
  ['worker', [worker]],
  ['travel', [offline]],
])
const backgroundTasks: Record<string, BackgroundTaskSnapshot> = {
  'worker:build': { tasks: [], runningCount: 1, supported: true },
}
const actions = {
  onSelectSession: vi.fn(),
  onOpenSessionTasks: vi.fn(),
  onCloseSession: vi.fn(),
  closingSessions: new Set<string>(),
  hiddenSessions: new Set<string>(),
  hidingSessions: new Set<string>(),
  onToggleSessionHidden: vi.fn(),
  unreadSessions: new Set<string>(),
  markingUnreadSessions: new Set<string>(),
  onToggleSessionUnread: vi.fn(),
  onSortChange: vi.fn(),
  onNewSession: vi.fn(),
}
const hiddenVisibility = vi.fn()
const categoryActions = {
  onToggleCategory: vi.fn(),
  onMarkCategoryRead: vi.fn(),
  onRenameCategory: vi.fn(),
  onMoveCategory: vi.fn(),
  onDeleteCategory: vi.fn(),
  onNewCategory: vi.fn(),
}
const sessionHidden = vi.fn()
const sessionUnread = vi.fn()

function NavigationHarness({
  sessions = sessionsByComputer,
  sort = 'custom',
  computerList = computers,
  snapshots = backgroundTasks,
  loading = false,
  loadingError,
  initialHidden = [],
  initialShowHidden = false,
  showHiddenSaving = false,
  hidingSessions = new Set<string>(),
  initialUnread = [],
  markingUnreadSessions = new Set<string>(),
  pendingCreations,
  closingSessions = new Set<string>(),
  recentlyClosedCount,
  onOpenRecentlyClosed,
  onRefresh,
  categories,
}: {
  categories?: CategorizedSessions['categories']
  sessions?: Map<string, ManagedSession[]>
  sort?: SessionSort
  computerList?: ComputerSummary[]
  snapshots?: Record<string, BackgroundTaskSnapshot>
  loading?: boolean
  loadingError?: string
  initialHidden?: string[]
  initialShowHidden?: boolean
  showHiddenSaving?: boolean
  hidingSessions?: ReadonlySet<string>
  initialUnread?: string[]
  markingUnreadSessions?: ReadonlySet<string>
  pendingCreations?: PendingSessionCreation[]
  closingSessions?: ReadonlySet<string>
  recentlyClosedCount?: number
  onOpenRecentlyClosed?: () => void
  onRefresh?: () => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SessionFilter>('all')
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(initialHidden))
  const [showHidden, setShowHidden] = useState(initialShowHidden)
  const [unread, setUnread] = useState<ReadonlySet<string>>(() => new Set(initialUnread))
  return (
    <DndContext>
      <SessionNavigation
        {...actions}
        closingSessions={closingSessions}
        hiddenSessions={hidden}
        hidingSessions={hidingSessions}
        onToggleSessionHidden={(target) => {
          sessionHidden(target)
          const key = `${target.computerId}:${target.id}`
          setHidden((current) => {
            const next = new Set(current)
            if (!next.delete(key)) next.add(key)
            return next
          })
        }}
        unreadSessions={unread}
        markingUnreadSessions={markingUnreadSessions}
        onToggleSessionUnread={(target) => {
          sessionUnread(target)
          const key = `${target.computerId}:${target.id}`
          setUnread((current) => {
            const next = new Set(current)
            if (!next.delete(key)) next.add(key)
            return next
          })
        }}
        backgroundTasks={snapshots}
        view={sessionNavigationView(
          computerList,
          sessions,
          snapshots,
          query,
          filter,
          { keys: hidden, shown: showHidden },
          unread,
          categories ? { categories, selectedKey: 'studio:review' } : undefined,
        )}
        categoryActions={categories ? categoryActions : undefined}
        query={query}
        filter={filter}
        showHidden={showHidden}
        showHiddenSaving={showHiddenSaving}
        onQueryChange={setQuery}
        onFilterChange={setFilter}
        onShowHiddenChange={(show) => {
          hiddenVisibility(show)
          setShowHidden(show)
        }}
        loading={loading}
        loadingError={loadingError}
        pendingCreations={pendingCreations}
        selectedKey="studio:review"
        sort={sort}
        recentlyClosedCount={recentlyClosedCount}
        onOpenRecentlyClosed={onOpenRecentlyClosed}
        onRefresh={onRefresh}
      />
    </DndContext>
  )
}

function navigation(sessions = sessionsByComputer, sort: SessionSort = 'custom') {
  return <NavigationHarness sessions={sessions} sort={sort} />
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})

describe('session navigation', () => {
  it('uses the projected origin in row accessibility instead of guessing from titles or providers', () => {
    const listed = new Map([['studio', [
      { ...session, id: 'user', provenance: { origin: 'user' as const } },
      { ...session, id: 'oracle', provenance: { origin: 'manager' as const } },
      { ...session, id: 'external', provenance: { origin: 'discovered' as const } },
      { ...session, id: 'schedule', provenance: { origin: 'schedule' as const, scheduleName: 'Morning review', scheduleRunId: 'run' } },
      { ...session, id: 'unknown', title: 'Oracle schedule title without provenance' },
    ]]])
    render(navigation(listed))
    expect(screen.getByRole('button', { name: /Review the release, Started by you/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Review the release, Started by Oracle/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Review the release, Found on this computer/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Review the release, Started by schedule Morning review/ })).toBeVisible()
    expect(screen.getAllByRole('img')).toHaveLength(4)
    expect(screen.queryByRole('link', { name: /View run from schedule/ })).not.toBeInTheDocument()
  })

  it('distinguishes loading from a failed connection without showing an empty list', () => {
    const rendered = render(
      <NavigationHarness loading computerList={[]} sessions={new Map()} />,
    )
    expect(screen.getByText('Connecting...')).toBeVisible()
    expect(screen.getByText('Loading sessions...')).toBeVisible()

    rendered.rerender(
      <DndContext>
        <SessionNavigation
          {...actions}
          backgroundTasks={{}}
          view={sessionNavigationView([], new Map(), {}, '', 'all')}
          query=""
          filter="all"
          showHidden={false}
          showHiddenSaving={false}
          onQueryChange={vi.fn()}
          onFilterChange={vi.fn()}
          onShowHiddenChange={vi.fn()}
          loading={false}
          loadingError="The gateway could not reach Agentic Remote."
          selectedKey={undefined}
          sort="custom"
        />
      </DndContext>,
    )
    expect(screen.getByText('Connection failed')).toBeVisible()
    expect(screen.queryByText('Loading sessions...')).toBeNull()
    expect(screen.queryByText('No sessions here.')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Retry loading sessions' })).toBeNull()
  })

  it('offers one refresh action with explicit freshness and retry state', () => {
    const onRefresh = vi.fn()
    render(
      <DndContext>
        <SessionNavigation
          {...actions}
          backgroundTasks={backgroundTasks}
          view={sessionNavigationView(
            computers,
            sessionsByComputer,
            backgroundTasks,
            '',
            'all',
          )}
          query=""
          filter="all"
          showHidden={false}
          showHiddenSaving={false}
          onQueryChange={vi.fn()}
          onFilterChange={vi.fn()}
          onShowHiddenChange={vi.fn()}
          loading={false}
          onRefresh={onRefresh}
          refreshState="stale"
          refreshMessage="Sessions could not be refreshed."
          selectedKey="studio:review"
          sort="custom"
        />
      </DndContext>,
    )

    expect(screen.getByRole('status', { name: 'Session data freshness' }))
      .toHaveTextContent('Data may be stale')
    fireEvent.click(screen.getByRole('button', {
      name: 'Retry refreshing sessions and Oracle',
    }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('restores the session-list scroll position after a remount', () => {
    const first = render(navigation())
    const list = document.querySelector<HTMLElement>('.session-list__scroll')!
    list.scrollTop = 147
    fireEvent.scroll(list)
    first.unmount()

    render(navigation())
    expect(document.querySelector<HTMLElement>('.session-list__scroll')?.scrollTop)
      .toBe(147)
  })

  it('restores saved scroll after sessions finish loading', () => {
    localStorage.setItem('agentic-remote:session-list-scroll-v1', '147')
    const rendered = render(
      <NavigationHarness loading computerList={[]} sessions={new Map()} />,
    )
    const list = document.querySelector<HTMLElement>('.session-list__scroll')!
    // Browsers clamp an empty scroll container back to zero.
    list.scrollTop = 0

    rendered.rerender(<NavigationHarness />)

    expect(document.querySelector<HTMLElement>('.session-list__scroll')?.scrollTop)
      .toBe(147)
  })

  it('draws each pending creation where its session will appear', () => {
    const scrolled: Element[] = []
    const scrollIntoView = vi.fn(function (this: Element) {
      scrolled.push(this)
    })
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
    try {
      const creating = (id: string, cwd: string, before?: string): PendingSessionCreation => ({
        id, computerId: 'studio', cwd, provider: 'copilot', executionMode: 'tmux', before,
      })
      render(
        <NavigationHarness
          pendingCreations={[
            creating('first', '~/kiln', 'studio:question'),
            creating('last', '~/zinc'),
            creating('hidden-follower', '~/atlas', 'studio:gone'),
          ]}
        />,
      )
      const studio = screen.getByRole('region', { name: 'Studio' })
      const rows = within(studio).getAllByRole('button', { name: /,/ })
        .concat(within(studio).getAllByRole('status'))
        .sort((left, right) =>
          left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
        .map((row) => row.getAttribute('aria-label')?.split(',')[0])
      expect(rows).toEqual([
        'Review the release',
        'Creating GitHub Copilot session on Studio in ~/kiln',
        'Choose a direction',
        'Creating GitHub Copilot session on Studio in ~/zinc',
        'Creating GitHub Copilot session on Studio in ~/atlas',
      ])
      expect(scrolled).toHaveLength(3)
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    } finally {
      Element.prototype.scrollIntoView = original
    }
  })

  it('brings a pending creation back into view only when its place changes', () => {
    const scrollIntoView = vi.fn()
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
    try {
      const creating = (before?: string): PendingSessionCreation[] => [{
        id: 'pending', computerId: 'studio', cwd: '~/kiln', provider: 'copilot', before,
      }]
      const rendered = render(<NavigationHarness pendingCreations={creating()} />)
      expect(scrollIntoView).toHaveBeenCalledOnce()
      rendered.rerender(<NavigationHarness pendingCreations={creating()} />)
      expect(scrollIntoView).toHaveBeenCalledOnce()
      rendered.rerender(<NavigationHarness pendingCreations={creating('studio:review')} />)
      expect(scrollIntoView).toHaveBeenCalledTimes(2)
      const row = screen.getByRole('status', { name: /in ~\/kiln$/ })
      expect(scrollIntoView.mock.contexts.at(-1)).toBe(row)
    } finally {
      Element.prototype.scrollIntoView = original
    }
  })

  it('offers explicit ordering without mutating the custom list or selection', () => {
    render(navigation())
    const order = screen.getByRole('combobox', { name: 'Session order' })
    expect(order).toHaveValue('custom')
    fireEvent.change(order, { target: { value: 'recent' } })
    expect(actions.onSortChange).toHaveBeenCalledWith('recent')
    expect(actions.onSelectSession).not.toHaveBeenCalled()
    expect(sessionsByComputer.get('studio')).toEqual([session, question])
  })

  it('does not allow dragging a computed order while keeping every computer visible', () => {
    render(navigation(sessionsByComputer, 'attention'))
    expect(screen.getByLabelText('Reorder Review the release')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('region', { name: 'Studio' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Build node' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Travel laptop' })).toBeVisible()
  })

  it('filters attention without changing selection or hiding any computer', () => {
    render(navigation())
    fireEvent.click(screen.getByRole('button', { name: 'Needs you' }))
    expect(screen.getByRole('button', { name: /^Choose a direction,/ })).toBeVisible()
    expect(screen.queryByRole('button', { name: /^Review the release,/ })).toBeNull()
    expect(screen.getByRole('region', { name: 'Studio' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Build node' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Travel laptop' })).toBeVisible()
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('1 of 4 sessions')
    expect(actions.onSelectSession).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Reorder Choose a direction')).toHaveAttribute(
      'aria-disabled', 'true',
    )
  })

  it('finds sessions by multiple metadata terms and can clear a no-match search', () => {
    render(navigation())
    const search = screen.getByRole('searchbox', { name: 'Search sessions' })
    fireEvent.change(search, { target: { value: 'STUDIO claude' } })
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('1 of 4 sessions')
    expect(screen.getByRole('button', { name: /^Choose a direction,/ })).toBeVisible()
    fireEvent.change(search, { target: { value: 'missing' } })
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('0 of 4 sessions')
    expect(screen.getAllByText('No matching sessions')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(search).toHaveValue('')
    expect(screen.getByRole('button', { name: /^Review the release,/ })).toHaveAttribute(
      'aria-current', 'page',
    )
    expect(actions.onSelectSession).not.toHaveBeenCalled()
  })

  it('includes background work and excludes cached offline activity from Working', () => {
    render(navigation())
    fireEvent.click(screen.getByRole('button', { name: 'Working' }))
    expect(screen.getByRole('button', { name: /^Build docs,/ })).toBeVisible()
    expect(screen.queryByRole('button', { name: /^Last known work,/ })).toBeNull()
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('1 of 4 sessions')
    fireEvent.click(screen.getByRole('button', { name: 'View background tasks for Build docs' }))
    expect(actions.onOpenSessionTasks).toHaveBeenCalledWith(worker)
  })

  it('hides a session from the list without a filter, and shows it again on request', () => {
    render(navigation())
    // Nothing to show until something is hidden.
    expect(screen.queryByRole('button', { name: 'Include hidden sessions' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Hide Build docs from the list' }))

    expect(sessionHidden).toHaveBeenCalledWith(worker)
    expect(screen.queryByRole('button', { name: /^Build docs,/ })).toBeNull()
    const toggle = screen.getByRole('button', { name: 'Include hidden sessions' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).toHaveTextContent('Hidden1')
    const node = screen.getByRole('region', { name: 'Build node' })
    expect(node).toBeVisible()
    expect(node).toHaveTextContent('1 hidden session')
    expect(screen.getByRole('heading', { name: 'Sessions 3' })).toBeVisible()
    // Leaving a session out is curation, not a filter that needs clearing.
    expect(screen.queryByRole('status', { name: 'Session filter results' })).toBeNull()
    expect(screen.getByRole('button', { name: /^Review the release,/ }))
      .toHaveAttribute('aria-current', 'page')
    expect(actions.onSelectSession).not.toHaveBeenCalled()

    fireEvent.click(toggle)

    expect(hiddenVisibility).toHaveBeenCalledWith(true)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    const shown = screen.getByRole('button', { name: /^Build docs,/ })
    expect(shown).toHaveAccessibleName(/hidden from the list/)
    expect(within(shown).getByText('Hidden')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Show Build docs in the list' }))
    expect(within(screen.getByRole('button', { name: /^Build docs,/ })).queryByText('Hidden'))
      .toBeNull()
    // Still offered while it is on, so it can be turned off again.
    expect(toggle).toHaveTextContent(/^Hidden$/)
    fireEvent.click(toggle)
    expect(screen.queryByRole('button', { name: 'Include hidden sessions' })).toBeNull()
  })

  it('keeps a hidden session that needs you listed, tagged, and counted', () => {
    render(<NavigationHarness initialHidden={['studio:question']} />)

    const waiting = screen.getByRole('button', { name: /^Choose a direction,/ })
    expect(waiting).toHaveAccessibleName(/hidden from the list/)
    expect(within(waiting).getByText('Hidden')).toBeVisible()
    expect(waiting.closest('.session-item')).toHaveClass('session-item--hidden')
    expect(screen.getByRole('button', { name: 'Show Choose a direction in the list' }))
      .toBeEnabled()
    expect(screen.getByRole('button', { name: 'Needs you' })).toHaveTextContent('Needs you1')
    fireEvent.click(screen.getByRole('button', { name: 'Needs you' }))
    expect(screen.getByRole('button', { name: /^Choose a direction,/ })).toBeVisible()
  })

  it('marks a listed hidden row apart from ordinary rows', () => {
    const ordinary = { ...session, id: 'ordinary', title: 'Sort the inbox' }
    const tidy = { ...session, id: 'tidy', title: 'Tidy the reading list' }
    render(
      <NavigationHarness
        initialHidden={['studio:review', 'studio:tidy']}
        initialShowHidden
        sessions={new Map([['studio', [session, ordinary, tidy]]])}
      />,
    )
    const row = (title: string) => {
      const item = screen.getByRole('button', { name: new RegExp(`^${title},`) })
        .closest<HTMLElement>('.session-item')
      if (!item) throw new Error(`No row for ${title}`)
      return item
    }

    const hidden = row('Tidy the reading list')
    expect(hidden).toHaveClass('session-item--hidden')
    // Told by an icon and the word as well as by the outline.
    const tag = within(hidden).getByText('Hidden')
    expect(tag).toHaveAttribute('title', 'Hidden from the list; the session keeps running')
    expect(tag.querySelector('svg.lucide-eye-off')).toHaveAttribute('aria-hidden', 'true')

    expect(row('Sort the inbox')).not.toHaveClass('session-item--hidden')
    // Hiding the open session leaves it marked as the open one.
    expect(row('Review the release')).toHaveClass('session-item--hidden', 'session-item--active')
  })

  it('says how many sessions are hidden rather than that there are none', () => {
    render(
      <NavigationHarness
        initialHidden={['studio:review']}
        sessions={new Map([['studio', [session]]])}
      />,
    )
    expect(screen.queryByText('No sessions here.')).toBeNull()
    expect(screen.getByRole('region', { name: 'Studio' })).toHaveTextContent('1 hidden session')
    expect(screen.getByRole('region', { name: 'Build node' })).toHaveTextContent('No open sessions')
  })

  it('keeps hidden sessions hidden when filters are cleared', () => {
    render(<NavigationHarness initialHidden={['worker:build']} />)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search sessions' }), {
      target: { value: 'docs' },
    })
    expect(screen.getByRole('region', { name: 'Build node' }))
      .toHaveTextContent('No matching sessions')

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(hiddenVisibility).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /^Build docs,/ })).toBeNull()
  })

  it('places Hide after Close, and keeps it usable while a computer is offline', () => {
    render(<NavigationHarness hidingSessions={new Set(['studio:question'])} />)
    const close = screen.getByRole('button', { name: 'Close Review the release' })
    const hide = screen.getByRole('button', { name: 'Hide Review the release from the list' })
    expect(close.compareDocumentPosition(hide) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(hide).toHaveAttribute('title', 'Hide from the list; the session keeps running')
    expect(hide.closest('.session-item__open')).toBeNull()

    expect(screen.getByRole('button', { name: 'Close Last known work' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Hide Last known work from the list' }))
      .toBeEnabled()

    // Only the session being saved waits.
    const saving = screen.getByRole('button', { name: 'Hide Choose a direction from the list' })
    expect(saving).toBeDisabled()
    expect(saving).toHaveAttribute('aria-busy', 'true')
    expect(saving).toHaveAttribute('title', 'Hiding this session from the list')
  })

  it('holds the Hidden toggle while its visibility is being saved', () => {
    render(<NavigationHarness initialHidden={['worker:build']} showHiddenSaving />)
    const toggle = screen.getByRole('button', { name: 'Include hidden sessions' })
    expect(toggle).toBeDisabled()
    expect(toggle).toHaveAttribute('aria-busy', 'true')
    expect(toggle).toHaveAttribute('title', 'Saving hidden-session visibility')
  })

  it('marks an unread row with a bold title, an accent dot, and the word in its name', () => {
    const parked = { ...session, id: 'parked', title: 'Parked planning' }
    render(
      <NavigationHarness
        initialHidden={['studio:parked']}
        initialShowHidden
        initialUnread={['studio:review', 'studio:parked']}
        sessions={new Map([['studio', [session, question, parked]], ['worker', [worker]]])}
      />,
    )
    const row = (title: string) => {
      const item = screen.getByRole('button', { name: new RegExp(`^${title},`) })
        .closest<HTMLElement>('.session-item')
      if (!item) throw new Error(`No row for ${title}`)
      return item
    }

    const open = screen.getByRole('button', { name: /^Review the release,/ })
    expect(open).toHaveAccessibleName(/^Review the release, unread, /)
    const unread = row('Review the release')
    expect(unread).toHaveClass('session-item--unread')
    // The dot repeats what the name already says, so it is not announced.
    const dot = unread.querySelector('.session-item__unread-dot')
    expect(dot).toHaveAttribute('aria-hidden', 'true')
    expect(open.querySelector('strong')).toContainElement(dot as HTMLElement)
    // The status keeps its own dot and label.
    expect(within(open).getByText('Idle')).toBeVisible()

    const read = row('Choose a direction')
    expect(read).not.toHaveClass('session-item--unread')
    expect(read.querySelector('.session-item__unread-dot')).toBeNull()
    expect(screen.getByRole('button', { name: /^Choose a direction,/ }))
      .not.toHaveAccessibleName(/unread/)

    // Unread combines with the hidden cue rather than replacing it.
    const both = row('Parked planning')
    expect(both).toHaveClass('session-item--unread', 'session-item--hidden')
    expect(within(both).getByText('Hidden')).toBeVisible()
  })

  it('marks a session read or unread beside Hide, without opening it', () => {
    render(
      <NavigationHarness
        initialUnread={['studio:review']}
        markingUnreadSessions={new Set(['worker:build'])}
      />,
    )
    const markRead = screen.getByRole('button', { name: 'Mark Review the release as read' })
    expect(markRead.closest('.session-item__open')).toBeNull()
    expect(markRead).toHaveAttribute('title', 'Mark as read')
    expect(markRead.querySelector('svg.lucide-mail-open')).toHaveAttribute('aria-hidden', 'true')

    const markUnread = screen.getByRole('button', { name: 'Mark Choose a direction as unread' })
    expect(markUnread).toHaveAttribute('title', 'Mark as unread')
    expect(markUnread.querySelector('svg.lucide-mail')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(markUnread)
    expect(sessionUnread).toHaveBeenCalledWith(question)
    expect(actions.onSelectSession).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /^Choose a direction,/ }))
      .toHaveAccessibleName(/^Choose a direction, unread, /)
    fireEvent.click(screen.getByRole('button', { name: 'Mark Choose a direction as read' }))
    expect(screen.getByRole('button', { name: 'Mark Choose a direction as unread' })).toBeEnabled()

    // The hub keeps it, so an offline computer's session can be marked too.
    expect(screen.getByRole('button', { name: 'Mark Last known work as unread' })).toBeEnabled()

    // Only the session being saved waits.
    const saving = screen.getByRole('button', { name: 'Mark Build docs as unread' })
    expect(saving).toBeDisabled()
    expect(saving).toHaveAttribute('aria-busy', 'true')
    expect(saving).toHaveAttribute('title', 'Marking this session as read')
  })

  it('orders every row\'s controls Close, Hide, then Read, as they are shown', () => {
    render(
      <NavigationHarness
        initialHidden={['studio:question']}
        initialShowHidden
        initialUnread={['studio:review']}
      />,
    )
    const controls = (title: string) => {
      const row = screen.getByRole('button', { name: new RegExp(`^${title},`) })
        .closest<HTMLElement>('.session-item')
      const group = row?.querySelector<HTMLElement>('.session-item__controls')
      if (!group) throw new Error(`No controls for ${title}`)
      return within(group).getAllByRole('button').map((button) => button.getAttribute('aria-label'))
    }

    expect(controls('Review the release')).toEqual([
      'Close Review the release',
      'Hide Review the release from the list',
      'Mark Review the release as read',
    ])
    expect(controls('Choose a direction')).toEqual([
      'Close Choose a direction',
      'Show Choose a direction in the list',
      'Mark Choose a direction as unread',
    ])
    // A disabled Close keeps its place, so the order is the same offline.
    expect(controls('Last known work')).toEqual([
      'Close Last known work',
      'Hide Last known work from the list',
      'Mark Last known work as unread',
    ])
  })

  it('offers an Unread filter with its count, counting hidden sessions only while shown', () => {
    render(
      <NavigationHarness
        initialHidden={['worker:build']}
        initialUnread={['studio:review', 'worker:build']}
      />,
    )
    const working = screen.getByRole('button', { name: 'Working' })
    const filter = screen.getByRole('button', { name: 'Unread' })
    expect(working.compareDocumentPosition(filter) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy()
    expect(filter).toHaveAttribute('aria-pressed', 'false')
    expect(filter).toHaveTextContent('Unread1')

    fireEvent.click(filter)
    expect(filter).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^Review the release,/ })).toBeVisible()
    expect(screen.queryByRole('button', { name: /^Choose a direction,/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Build docs,/ })).toBeNull()
    expect(screen.getByRole('status', { name: 'Session filter results' }))
      .toHaveTextContent('1 of 3 sessions')
    expect(screen.getByRole('region', { name: 'Travel laptop' })).toBeVisible()
    expect(screen.getByLabelText('Reorder Review the release'))
      .toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Include hidden sessions' }))
    expect(filter).toHaveTextContent('Unread2')
    expect(screen.getByRole('button', { name: /^Build docs,/ })).toBeVisible()

    // Marking it read takes it out of what Unread shows.
    fireEvent.click(screen.getByRole('button', { name: 'Mark Review the release as read' }))
    expect(screen.queryByRole('button', { name: /^Review the release,/ })).toBeNull()
    expect(filter).toHaveTextContent('Unread1')

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^Review the release,/ })).toBeVisible()
  })

  it('keeps the session time and opens background tasks from the status chip', () => {
    render(navigation())
    const task = screen.getByRole('button', { name: 'View background tasks for Build docs' })
    const open = screen.getByRole('button', { name: /^Build docs,/ })

    expect(task.closest('.session-item__body')).not.toBeNull()
    expect(task.closest('.session-item__where')).toBeNull()
    expect(open).not.toContainElement(task)
    expect(task).toHaveTextContent('Tasks')
    expect(task).toHaveClass('session-state', 'session-state--tasks')
    expect(open.querySelector('.session-item__time')).toBeVisible()
    expect(task.closest('.session-item__body')).not.toHaveClass('session-item__body--tasks')
    fireEvent.click(within(open).getByText('~/notes'))
    expect(actions.onSelectSession).toHaveBeenCalledWith(worker)
    fireEvent.click(task)
    expect(actions.onOpenSessionTasks).toHaveBeenCalledWith(worker)
  })

  it('shows Working alongside the Tasks status until foreground work ends', () => {
    const running = { ...worker, status: 'running' as const }
    const sessions = new Map(sessionsByComputer)
    sessions.set('worker', [running])
    const rendered = render(navigation(sessions))
    const task = screen.getByRole('button', { name: 'View background tasks for Build docs' })
    const open = screen.getByRole('button', { name: /^Build docs,/ })

    expect(within(open).getByText('Working')).toBeVisible()
    expect(open).toHaveAccessibleName(/Working/)
    expect(open.closest('.session-item')).toHaveClass('session-item--background-running')
    expect(task).toHaveTextContent('Tasks')
    fireEvent.click(task)
    expect(actions.onOpenSessionTasks).toHaveBeenCalledWith(running)

    rendered.rerender(navigation())
    const idleOpen = screen.getByRole('button', { name: /^Build docs,/ })
    expect(idleOpen.closest('.session-item')).toHaveClass('session-item--background-running')
    const idleTasks = screen.getByRole('button', {
      name: 'View background tasks for Build docs',
    })
    expect(idleTasks).toBeVisible()
    expect(idleTasks).toHaveTextContent('Tasks')

    rendered.rerender(<NavigationHarness sessions={sessions} snapshots={{}} />)
    const foregroundOnly = screen.getByRole('button', { name: /^Build docs,/ })
    expect(within(foregroundOnly).getByText('Working')).toBeVisible()
    expect(foregroundOnly.closest('.session-item')).not.toHaveClass('session-item--background-running')
    expect(screen.queryByRole('button', { name: 'View background tasks for Build docs' }))
      .toBeNull()
  })

  it('updates the filtered list when an answer is no longer pending', () => {
    const rendered = render(navigation())
    fireEvent.click(screen.getByRole('button', { name: 'Needs you' }))
    const updated = new Map(sessionsByComputer)
    updated.set('studio', [session, { ...question, pendingUserInput: undefined }])
    rendered.rerender(navigation(updated))
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('0 of 4 sessions')
    expect(screen.getByRole('button', { name: 'Needs you' })).toHaveAttribute(
      'aria-pressed', 'true',
    )
  })

  it('keeps Close accessible beside the row without opening it', () => {
    render(navigation())
    const open = screen.getByRole('button', { name: /^Review the release,/ })
    expect(within(open).queryByRole('button')).toBeNull()
    fireEvent.click(open)
    expect(actions.onSelectSession).toHaveBeenCalledWith(session)
    const close = screen.getByRole('button', { name: 'Close Review the release' })
    expect(close).toHaveAttribute(
      'title',
      'Permanently delete this session and its history',
    )
    fireEvent.click(close)
    expect(actions.onCloseSession).toHaveBeenCalledWith(session)
    expect(screen.getByText('2/3 online')).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Travel laptop' }))
      .getAllByText('Offline')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Close Last known work' })).toBeDisabled()
  })

  it('says Close keeps a session reopenable where its computer keeps closed sessions', () => {
    const keeping = computers.map((computer) => computer.id === 'studio'
      ? {
          ...computer,
          providers: [{
            id: 'copilot' as const, name: 'GitHub Copilot', available: true,
            terminalBacked: true, supportsRecoverableClose: true,
          }],
        }
      : computer)
    render(<NavigationHarness computerList={keeping} />)

    expect(screen.getByRole('button', { name: 'Close Review the release' })).toHaveAttribute(
      'title', 'Close this session; you can reopen it from Recently closed',
    )
    expect(screen.getByRole('button', { name: 'Close Build docs' })).toHaveAttribute(
      'title', 'Permanently delete this session and its history',
    )
  })

  it('offers Recently closed in the header between Refresh and New session, with how many it holds', () => {
    const onOpen = vi.fn()
    const header = (count?: number) => (
      <NavigationHarness onOpenRecentlyClosed={onOpen} onRefresh={vi.fn()} recentlyClosedCount={count} />
    )
    const { rerender } = render(header(3))
    const list = screen.getByRole('navigation', { name: 'Sessions' })
    const entry = within(list).getByRole('button', { name: 'Recently closed, 3 sessions' })

    // Document order is keyboard order, and the list no longer ends with it.
    expect(within(list).getAllByRole('button').slice(0, 3).map((button) => button.getAttribute('aria-label')))
      .toEqual(['Refresh sessions and Oracle', 'Recently closed, 3 sessions', 'New session'])
    expect(within(list).getAllByRole('button', { name: /^Recently closed/ })).toEqual([entry])
    expect(entry).toHaveAttribute('title', 'Reopen a session closed in the last 14 days')
    expect(within(entry).getByText('3')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(entry)
    expect(onOpen).toHaveBeenCalledOnce()

    rerender(header(1))
    expect(screen.getByRole('button', { name: 'Recently closed, 1 session' })).toHaveTextContent('1')
    rerender(header(140))
    expect(screen.getByRole('button', { name: 'Recently closed, 140 sessions' }).textContent).toBe('99+')
    for (const count of [0, undefined]) {
      rerender(header(count))
      expect(screen.getByRole('button', { name: 'Recently closed' }).textContent).toBe('')
    }
  })

  it('holds back only the session that is closing', () => {
    const other: ManagedSession = { ...session, id: 'other', title: 'Other work' }
    render(
      <NavigationHarness
        sessions={new Map([['studio', [session, other]]])}
        closingSessions={new Set(['studio:review'])}
      />,
    )

    const closing = screen.getByRole('button', { name: 'Close Review the release' })
    expect(closing).toBeDisabled()
    expect(closing).toHaveAttribute('title', 'Closing this session')
    expect(closing.closest('.session-item')).toHaveClass('session-item--closing')
    const open = screen.getByRole('button', { name: 'Close Other work' })
    expect(open).toBeEnabled()
    expect(open).toHaveAttribute(
      'title',
      'Permanently delete this session and its history',
    )
    expect(open.closest('.session-item')).not.toHaveClass('session-item--closing')
  })

  it('keeps empty computers and qualifies cached offline task status', () => {
    const offlineTasks = {
      ...backgroundTasks,
      'travel:offline': { tasks: [], runningCount: 2, supported: true },
    }
    render(
      <NavigationHarness
        snapshots={offlineTasks}
        computerList={[...computers, { ...computers[0], id: 'empty', name: 'Empty computer' }]}
      />,
    )
    expect(screen.getByRole('region', { name: 'Empty computer' })).toHaveTextContent('No open sessions')
    const cachedTasks = screen.getByRole('button', { name: 'View background tasks for Last known work' })
    expect(cachedTasks).toHaveTextContent('Tasks')
    expect(cachedTasks).toHaveAttribute('title', 'Last known background tasks; reconnect to refresh their state')
    fireEvent.click(screen.getByRole('button', { name: 'Working' }))
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('1 of 4 sessions')
    expect(screen.getByRole('region', { name: 'Empty computer' })).toHaveTextContent('No matching sessions')
  })

  it('clears a search with Escape without dismissing the workspace', () => {
    const bubble = vi.fn()
    render(<div onKeyDown={bubble}>{navigation()}</div>)
    const search = screen.getByRole('searchbox', { name: 'Search sessions' })
    fireEvent.change(search, { target: { value: 'notes' } })
    fireEvent.keyDown(search, { key: 'Escape' })
    expect(search).toHaveValue('')
    expect(bubble).not.toHaveBeenCalled()
    fireEvent.change(search, { target: { value: 'notes' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear session search' }))
    expect(search).toHaveFocus()
  })

  it('uses authoritative computer names for filtering and accessible ownership labels', () => {
    render(
      <NavigationHarness
        computerList={computers.map((computer) =>
          computer.id === 'studio' ? { ...computer, name: 'Renamed Studio' } : computer,
        )}
      />,
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search sessions' }), {
      target: { value: 'Renamed Studio' },
    })
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('2 of 4 sessions')
    expect(screen.getByRole('button', { name: /^Review the release,/ })).toHaveAccessibleName(/Renamed Studio/)
    expect(session.computerName).toBe('Studio')
  })
})

describe('session categories in the list', () => {
  const lab = (sessions: ManagedSession[], collapsed = false) => ({
    category: { id: 'lab', name: 'Homelab', collapsed, sessions: sessions.map((entry) => `${entry.computerId}:${entry.id}`) },
    sessions,
  })
  const plans = { category: { id: 'plans', name: 'Plans', collapsed: false, sessions: [] }, sessions: [] }
  const list = () => screen.getByRole('navigation', { name: 'Sessions' })
  const sectionNamed = (name: string) => screen.getByRole('region', { name: `Category ${name}` })

  it('lists categories above the computers, each under a header that opens and closes it', () => {
    render(<NavigationHarness categories={[lab([worker, question]), plans]} />)

    const homelab = sectionNamed('Homelab')
    const toggle = within(homelab).getByRole('button', { name: 'Homelab, 2 sessions' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(within(homelab).getByRole('button', { name: /^Build docs,/ })).toBeVisible()
    expect(within(homelab).getByRole('button', { name: /^Choose a direction,/ })).toBeVisible()
    // Rows from several computers sit together there, so each names its own.
    expect(within(homelab).getByText('Build node', { selector: '.session-item__computer' })).toBeVisible()
    expect(within(homelab).getByText('Studio', { selector: '.session-item__computer' })).toBeVisible()
    // Each session is listed once: under its category rather than its computer.
    const studio = screen.getByRole('region', { name: 'Studio' })
    expect(within(studio).queryByRole('button', { name: /^Choose a direction,/ })).toBeNull()
    expect(within(studio).getByRole('button', { name: /^Review the release,/ })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Build node' })).toHaveTextContent('1 session in a category')
    expect(homelab.compareDocumentPosition(studio) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(sectionNamed('Plans')).getByText('Drag sessions here, or use Move to category in a session\'s actions'))
      .toBeVisible()

    fireEvent.click(toggle)
    expect(categoryActions.onToggleCategory).toHaveBeenCalledWith('lab', true)
  })

  it('sums up a closed category and keeps what needs you in sight, with how many more it holds', () => {
    const quiet = { ...worker, id: 'quiet', title: 'Quiet work' }
    const busy = { ...worker, id: 'busy', title: 'Busy work', status: 'running' as const }
    render(<NavigationHarness
      categories={[lab([quiet, question, busy, worker], true)]}
      initialUnread={['worker:build']}
      sessions={new Map([['studio', [session, question]], ['worker', [quiet, busy, worker]], ['travel', []]])}
    />)

    const homelab = sectionNamed('Homelab')
    const toggle = within(homelab).getByRole('button', {
      name: 'Homelab, 1 needs you, 1 unread, working, 4 sessions',
    })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(homelab).getByRole('button', { name: /^Choose a direction,/ })).toBeVisible()
    expect(within(homelab).getByRole('button', { name: /^Build docs, unread,/ })).toBeVisible()
    expect(within(homelab).queryByRole('button', { name: /^Quiet work,/ })).toBeNull()
    expect(homelab.querySelector('.session-category__signal--attention')).toHaveTextContent('1')
    expect(homelab.querySelector('.session-category__signal--unread')).toHaveTextContent('1')
    expect(homelab.querySelector('.session-category__ring')).not.toBeNull()

    fireEvent.click(within(homelab).getByRole('button', { name: 'Show 2 more sessions in Homelab' }))
    expect(categoryActions.onToggleCategory).toHaveBeenCalledWith('lab', false)
  })

  it('offers a category\'s actions in a menu that keeps the focus with it', () => {
    render(<NavigationHarness categories={[lab([worker]), plans]} initialUnread={['worker:build']} />)

    const trigger = within(sectionNamed('Homelab')).getByRole('button', { name: 'Category actions for Homelab' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    fireEvent.click(trigger)
    const menu = screen.getByRole('menu', { name: 'Category actions for Homelab' })
    const items = within(menu).getAllByRole('menuitem')
    expect(items.map((item) => item.textContent)).toEqual([
      'Mark all as read', 'Rename…', 'Move up', 'Move down', 'Delete category…',
    ])
    expect(within(menu).getByRole('menuitem', { name: 'Move up' })).toBeDisabled()
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(items[1], { key: 'End' })
    expect(document.activeElement).toBe(items[4])
    fireEvent.keyDown(items[4], { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Move down' }))
    expect(categoryActions.onMoveCategory).toHaveBeenCalledWith('lab', 1)
    expect(document.activeElement).toBe(trigger)
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Mark all as read' }))
    expect(categoryActions.onMarkCategoryRead).toHaveBeenCalledWith('lab')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename…' }))
    expect(categoryActions.onRenameCategory).toHaveBeenCalledWith('lab')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete category…' }))
    expect(categoryActions.onDeleteCategory).toHaveBeenCalledWith('lab')

    fireEvent.click(within(sectionNamed('Plans')).getByRole('button', { name: 'Category actions for Plans' }))
    expect(screen.getByRole('menuitem', { name: 'Mark all as read' })).toBeDisabled()
    expect(screen.getByRole('menuitem', { name: 'Move down' })).toBeDisabled()
  })

  it('opens a category\'s menu upward when the list has no room for it below', () => {
    render(<NavigationHarness categories={[lab([worker])]} />)
    const trigger = within(sectionNamed('Homelab')).getByRole('button', { name: 'Category actions for Homelab' })
    const scroll = trigger.closest('.session-list__scroll') as HTMLElement
    const rect = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 300, width: 300, height: bottom - top, x: 0, y: top, toJSON: () => ({}) })
    vi.spyOn(scroll, 'getBoundingClientRect').mockReturnValue(rect(0, 600))
    const place = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rect(540, 568))

    fireEvent.click(trigger)
    expect(screen.getByRole('menu')).toHaveClass('session-category__menu-panel--upward')
    fireEvent.click(trigger)
    place.mockReturnValue(rect(40, 68))
    fireEvent.click(trigger)
    expect(screen.getByRole('menu')).not.toHaveClass('session-category__menu-panel--upward')
  })

  it('offers New category where the categories end, and not while the list is filtered', () => {
    render(<NavigationHarness categories={[]} />)
    const create = within(list()).getByRole('button', { name: 'New category' })
    fireEvent.click(create)
    expect(categoryActions.onNewCategory).toHaveBeenCalledTimes(1)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search sessions' }), { target: { value: 'docs' } })
    expect(within(list()).queryByRole('button', { name: 'New category' })).toBeNull()
  })

  it('shows matches inside their categories, open, and leaves out categories with none', () => {
    render(<NavigationHarness categories={[lab([worker, question], true), plans]} />)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search sessions' }), { target: { value: 'docs' } })

    const homelab = sectionNamed('Homelab')
    const toggle = within(homelab).getByRole('button', { name: 'Homelab, 1 of 2 sessions' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toBeDisabled()
    expect(within(homelab).getByRole('button', { name: /^Build docs,/ })).toBeVisible()
    expect(within(homelab).queryByRole('button', { name: /^Choose a direction,/ })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Category Plans' })).toBeNull()
  })

  it('moves no category while the list is filtered, which lists only some of them', () => {
    const design = {
      category: { id: 'design', name: 'Design', collapsed: false, sessions: ['studio:question'] },
      sessions: [question],
    }
    render(<NavigationHarness categories={[lab([worker]), design]} />)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search sessions' }), { target: { value: 'notes' } })

    expect(screen.getAllByRole('region', { name: /^Category / })).toHaveLength(2)
    fireEvent.click(within(sectionNamed('Homelab')).getByRole('button', { name: 'Category actions for Homelab' }))
    expect(screen.getByRole('menuitem', { name: 'Move up' })).toBeDisabled()
    expect(screen.getByRole('menuitem', { name: 'Move down' })).toBeDisabled()
  })

  it('leaves categories out on a hub without them', () => {
    render(<NavigationHarness />)
    expect(within(list()).queryByRole('button', { name: 'New category' })).toBeNull()
  })
})
