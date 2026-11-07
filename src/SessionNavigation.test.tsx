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
import { sessionNavigationView, type SessionFilter } from './session-navigation-view'

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
  onToggleSessionSuspended: vi.fn(),
  deleting: false,
  suspending: false,
  onSortChange: vi.fn(),
  onNewSession: vi.fn(),
}

function NavigationHarness({
  sessions = sessionsByComputer,
  sort = 'custom',
  computerList = computers,
  snapshots = backgroundTasks,
  loading = false,
  loadingError,
  initialShowSuspended = true,
  showSuspendedSaving = false,
  pendingCreations,
  suspending = false,
}: {
  sessions?: Map<string, ManagedSession[]>
  sort?: SessionSort
  computerList?: ComputerSummary[]
  snapshots?: Record<string, BackgroundTaskSnapshot>
  loading?: boolean
  loadingError?: string
  initialShowSuspended?: boolean
  showSuspendedSaving?: boolean
  pendingCreations?: PendingSessionCreation[]
  suspending?: boolean
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SessionFilter>('all')
  const [showSuspended, setShowSuspended] = useState(initialShowSuspended)
  return (
    <DndContext>
      <SessionNavigation
        {...actions}
        suspending={suspending}
        backgroundTasks={snapshots}
        view={sessionNavigationView(
          computerList,
          sessions,
          snapshots,
          query,
          filter,
          showSuspended,
        )}
        query={query}
        filter={filter}
        showSuspended={showSuspended}
        showSuspendedSaving={showSuspendedSaving}
        onQueryChange={setQuery}
        onFilterChange={setFilter}
        onShowSuspendedChange={setShowSuspended}
        loading={loading}
        loadingError={loadingError}
        pendingCreations={pendingCreations}
        selectedKey="studio:review"
        sort={sort}
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
          showSuspended
          showSuspendedSaving={false}
          onQueryChange={vi.fn()}
          onFilterChange={vi.fn()}
          onShowSuspendedChange={vi.fn()}
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
          showSuspended
          showSuspendedSaving={false}
          onQueryChange={vi.fn()}
          onFilterChange={vi.fn()}
          onShowSuspendedChange={vi.fn()}
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

  it('allows custom dragging when only suspended sessions are hidden', () => {
    const suspended = {
      ...session,
      id: 'paused-review',
      title: 'Paused review',
      suspended: true,
    }
    const sessions = new Map(sessionsByComputer)
    sessions.set('studio', [session, suspended, question])

    render(
      <NavigationHarness
        initialShowSuspended={false}
        sessions={sessions}
      />,
    )

    expect(screen.queryByRole('button', { name: /^Paused review,/ })).toBeNull()
    expect(screen.getByLabelText('Reorder Review the release')).not
      .toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByLabelText('Reorder Choose a direction')).not
      .toHaveAttribute('aria-disabled', 'true')
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

  it('hides and restores sessions paused through the suspension control', () => {
    const suspended = {
      ...session,
      id: 'paused',
      title: 'Paused planning',
      suspended: true,
    }
    const sessions = new Map(sessionsByComputer)
    sessions.set('studio', [session, question, suspended])
    render(navigation(sessions))

    const toggle = screen.getByRole('button', { name: 'Include suspended sessions' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(toggle).toHaveTextContent('Suspended1')
    expect(screen.getByRole('button', { name: /^Paused planning,/ })).toBeVisible()

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: /^Paused planning,/ })).toBeNull()
    expect(screen.getByRole('status', { name: 'Session filter results' }))
      .toHaveTextContent('4 of 5 sessions')
    expect(screen.getByRole('region', { name: 'Studio' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Build node' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Travel laptop' })).toBeVisible()
    expect(screen.getByLabelText('Reorder Review the release'))
      .toHaveAttribute('aria-disabled', 'false')
    expect(actions.onSelectSession).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^Paused planning,/ })).toBeVisible()
    expect(screen.queryByRole('status', { name: 'Session filter results' })).toBeNull()
  })

  it('holds Clear filters while suspended visibility is being saved', () => {
    render(
      <NavigationHarness
        initialShowSuspended={false}
        showSuspendedSaving
      />,
    )

    const clear = screen.getByRole('button', { name: 'Clear filters' })
    expect(clear).toBeDisabled()
    fireEvent.click(clear)
    expect(screen.getByRole('button', { name: 'Include suspended sessions' }))
      .toHaveAttribute('aria-pressed', 'false')
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

  it('keeps accessible Close above Pause without changing either action', () => {
    render(navigation())
    const open = screen.getByRole('button', { name: /^Review the release,/ })
    expect(within(open).queryByRole('button')).toBeNull()
    fireEvent.click(open)
    expect(actions.onSelectSession).toHaveBeenCalledWith(session)
    const close = screen.getByRole('button', { name: 'Close Review the release' })
    const pause = screen.getByRole('button', { name: 'Suspend Review the release' })
    expect(close.compareDocumentPosition(pause) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy()
    expect(close).toHaveAttribute(
      'title',
      'Permanently delete this session and its history',
    )
    fireEvent.click(close)
    expect(actions.onCloseSession).toHaveBeenCalledWith(session)
    fireEvent.click(pause)
    expect(actions.onToggleSessionSuspended).toHaveBeenCalledWith(session)
    expect(screen.getByText('2/3 online')).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Travel laptop' }))
      .getAllByText('Offline')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Close Last known work' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Suspend Last known work' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Suspend Choose a direction' })).toBeDisabled()
  })

  it('offers Suspend only when the owning computer would accept it, and says why not', () => {
    const interrupted: ManagedSession = {
      ...session,
      id: 'interrupted',
      title: 'Interrupted work',
      status: 'error',
      interruption: { detectedAt: '2026-09-01T00:00:00Z', previousStatus: 'running' },
    }
    const waitingAgent: ManagedSession = { ...session, id: 'agent', title: 'Waiting agent' }
    const suspendTitle = (title: string) =>
      screen.getByRole('button', { name: `Suspend ${title}` })
    const { rerender } = render(
      <NavigationHarness
        sessions={new Map([
          ['studio', [session, interrupted, waitingAgent]],
          ['worker', [worker]],
        ])}
        snapshots={{
          ...backgroundTasks,
          // Queued work is refused too, though it is not counted as running.
          'studio:agent': {
            tasks: [{
              id: 'agent-1', type: 'agent', description: 'Review',
              status: 'queued', startedAt: '2026-09-01T00:00:00Z', canCancel: true,
            }],
            runningCount: 0,
            supported: true,
          },
        }}
      />,
    )

    expect(suspendTitle('Review the release')).toBeEnabled()
    expect(suspendTitle('Review the release')).toHaveAttribute(
      'title', 'Keep this session but stop what is running for it',
    )
    for (const title of ['Build docs', 'Waiting agent']) {
      expect(suspendTitle(title)).toBeDisabled()
      expect(suspendTitle(title)).toHaveAttribute(
        'title', 'Wait for its background tasks to finish before suspending it',
      )
    }
    expect(suspendTitle('Interrupted work')).toBeDisabled()
    expect(suspendTitle('Interrupted work')).toHaveAttribute(
      'title', 'Reopen this session before suspending it',
    )

    rerender(
      <NavigationHarness
        sessions={new Map([['studio', [session]]])}
        suspending
      />,
    )
    expect(suspendTitle('Review the release')).toBeDisabled()
    expect(suspendTitle('Review the release')).toHaveAttribute(
      'title', 'Wait for the current suspend or resume to finish',
    )
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
