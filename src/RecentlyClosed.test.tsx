// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import { CloseSessionDialog, RecentlyClosedDialog } from './RecentlyClosed'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const now = Date.parse('2026-11-14T12:00:00.000Z')

const computers: ComputerSummary[] = [
  { id: 'hub', name: 'development', isLocal: true, online: true },
  { id: 'node', name: 'production', isLocal: false, online: false },
]

function session(id: string, change: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id, computerId: 'hub', computerName: 'development', cwd: '/home/tester/src/app',
    title: `Session ${id}`, status: 'idle', updatedAt: '2026-11-14T10:00:00.000Z',
    isOpen: true, provider: 'copilot', messages: [], ...change,
  }
}

const closed = session('release', {
  title: 'Release review',
  isOpen: false,
  closedAt: '2026-11-14T10:00:00.000Z',
  closedContext: {
    title: 'Release review',
    cwd: '/home/tester/src/app',
    prompts: ['Draft the release notes', 'Add the migration step'],
    reply: 'The notes are ready.',
  },
})

describe('closing a session', () => {
  it('offers a close that can be undone for 14 days, a permanent delete, and a way back', () => {
    const onCloseSession = vi.fn()
    const onDelete = vi.fn()
    const onCancel = vi.fn()
    render(
      <CloseSessionDialog
        onCancel={onCancel}
        onCloseSession={onCloseSession}
        onDelete={onDelete}
        recoverable
        session={session('one', { title: 'Release review', queuedCount: 2 })}
      />,
    )
    const dialog = screen.getByRole('dialog', { name: 'Close session' })

    expect(dialog).toHaveTextContent(
      'Close “Release review” on development? You can reopen it from Recently closed for 14 days.',
    )
    expect(dialog).toHaveTextContent('Its 2 queued messages are discarded.')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close session' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete permanently' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(onCloseSession).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('only deletes on a computer that cannot keep closed sessions', () => {
    render(
      <CloseSessionDialog
        onCancel={vi.fn()}
        onCloseSession={vi.fn()}
        onDelete={vi.fn()}
        recoverable={false}
        session={session('one', { title: 'Release review' })}
      />,
    )
    const dialog = screen.getByRole('dialog', { name: 'Close session' })

    expect(dialog).toHaveTextContent(
      'development deletes closed sessions for good: this removes the GitHub Copilot session and its history.',
    )
    expect(within(dialog).queryByRole('button', { name: 'Close session' })).not.toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Delete permanently' })).toBeInTheDocument()
  })
})

describe('recently closed sessions', () => {
  function renderList(change: Partial<Parameters<typeof RecentlyClosedDialog>[0]> = {}) {
    const props = {
      computers,
      error: undefined,
      loading: false,
      now: () => now,
      onClose: vi.fn(),
      onDelete: vi.fn(async () => undefined),
      onReopen: vi.fn(async () => undefined),
      onRetry: vi.fn(),
      sessions: [closed],
      ...change,
    }
    render(<RecentlyClosedDialog {...props} />)
    return { ...props, dialog: screen.getByRole('dialog', { name: 'Recently closed' }) }
  }

  it('shows each session with when it closed, when it goes, and what it was about', () => {
    const { dialog } = renderList()
    const card = within(dialog).getByRole('article', { name: 'Release review' })

    expect(within(card).getByText('development')).toBeInTheDocument()
    expect(within(card).getByText('~/src/app')).toBeInTheDocument()
    expect(card).toHaveTextContent('Closed 2 hours ago')
    expect(card).toHaveTextContent('Deleted in 14 days')
    expect(within(card).getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(['Draft the release notes', 'Add the migration step'])
    expect(card).toHaveTextContent('The notes are ready.')
    expect(dialog).toHaveTextContent('Sessions closed on production appear here once it reconnects.')
  })

  it('reopens a session and reports a reopen that failed', async () => {
    const onReopen = vi.fn()
      .mockRejectedValueOnce(new Error('Unable to reopen terminal session'))
      .mockResolvedValueOnce(undefined)
    const { dialog } = renderList({ onReopen })
    const reopen = within(dialog).getByRole('button', { name: 'Reopen Release review' })

    fireEvent.click(reopen)
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Unable to reopen terminal session')
    fireEvent.click(reopen)

    await waitFor(() => expect(onReopen).toHaveBeenCalledTimes(2))
    expect(onReopen).toHaveBeenLastCalledWith(closed)
  })

  it('deletes a session permanently only after confirming', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    const { dialog, onDelete } = renderList()
    const remove = within(dialog).getByRole('button', { name: 'Delete Release review permanently' })

    fireEvent.click(remove)
    expect(onDelete).not.toHaveBeenCalled()
    fireEvent.click(remove)

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(closed))
    expect(confirm).toHaveBeenLastCalledWith(
      'Delete “Release review” permanently? Its history is removed from development and it can no longer be reopened.',
    )
  })

  it('says when nothing was closed, and offers a retry when the list could not load', () => {
    const onRetry = vi.fn()
    const { dialog } = renderList({ sessions: [], computers: [computers[0]!] })
    expect(dialog).toHaveTextContent('Nothing closed in the last 14 days.')
    cleanup()

    const failed = renderList({ sessions: undefined, error: 'Hub unavailable', onRetry })
    expect(within(failed.dialog).getByRole('alert')).toHaveTextContent('Hub unavailable')
    fireEvent.click(within(failed.dialog).getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
