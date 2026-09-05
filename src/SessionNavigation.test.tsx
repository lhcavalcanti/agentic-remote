// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
} from '../shared/contracts'
import { SessionNavigation } from './SessionNavigation'

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
  onToggleSessionSuspended: vi.fn(),
  suspending: false,
}

function navigation(sessions = sessionsByComputer) {
  return (
    <DndContext>
      <SessionNavigation
        {...actions}
        backgroundTasks={backgroundTasks}
        computers={computers}
        loading={false}
        selectedKey="studio:review"
        sessionsByComputer={sessions}
      />
    </DndContext>
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('session navigation', () => {
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

  it('retains separate, accessible session, suspend, and task actions', () => {
    render(navigation())
    const open = screen.getByRole('button', { name: /^Review the release,/ })
    expect(within(open).queryByRole('button')).toBeNull()
    fireEvent.click(open)
    expect(actions.onSelectSession).toHaveBeenCalledWith(session)
    fireEvent.click(screen.getByRole('button', { name: 'Suspend Review the release' }))
    expect(actions.onToggleSessionSuspended).toHaveBeenCalledWith(session)
    expect(screen.getByText('2/3 online')).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Travel laptop' }))
      .getAllByText('Offline')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Suspend Last known work' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Suspend Choose a direction' })).toBeDisabled()
  })

  it('keeps empty computers and qualifies cached offline task counts', () => {
    const offlineTasks = {
      ...backgroundTasks,
      'travel:offline': { tasks: [], runningCount: 2, supported: true },
    }
    render(
      <DndContext>
        <SessionNavigation
          {...actions}
          backgroundTasks={offlineTasks}
          computers={[...computers, { ...computers[0], id: 'empty', name: 'Empty computer' }]}
          loading={false}
          selectedKey="studio:review"
          sessionsByComputer={sessionsByComputer}
        />
      </DndContext>,
    )
    expect(screen.getByRole('region', { name: 'Empty computer' })).toHaveTextContent('No open sessions')
    const cachedTasks = screen.getByRole('button', { name: 'View background tasks for Last known work' })
    expect(cachedTasks).toHaveTextContent('2 tasks · last known')
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
      <DndContext>
        <SessionNavigation
          {...actions}
          backgroundTasks={backgroundTasks}
          computers={computers.map((computer) =>
            computer.id === 'studio' ? { ...computer, name: 'Renamed Studio' } : computer,
          )}
          loading={false}
          selectedKey="studio:review"
          sessionsByComputer={sessionsByComputer}
        />
      </DndContext>,
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search sessions' }), {
      target: { value: 'Renamed Studio' },
    })
    expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('2 of 4 sessions')
    expect(screen.getByRole('button', { name: /^Review the release,/ })).toHaveAccessibleName(/Renamed Studio/)
    expect(session.computerName).toBe('Studio')
  })
})
