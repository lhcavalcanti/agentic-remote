// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import { CloseSessionDialog, RecentlyClosedDialog } from './RecentlyClosed'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
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

const auditReply =
  'Yes. Ubuntu-26.04 went from 1,024 to 1,224 GiB of virtual disk capacity, exactly +200 GiB, ' +
  'and the Linux filesystem grew too: WSL now has 1,203.7 GiB, with 521.3 GiB free. Nothing else changed.'

// Closed with more to say than three lines hold.
function audit(title = 'Audit disk usage'): ManagedSession {
  return session(title.toLowerCase().replaceAll(' ', '-'), {
    title,
    isOpen: false,
    closedAt: '2026-11-14T11:00:00.000Z',
    closedContext: {
      title,
      cwd: '/home/tester/src/app',
      prompts: ['How do I give WSL 200 GB more?', 'Is it larger now? See the log'],
      reply: auditReply,
    },
  })
}

/** Lays text out at `perLine()` characters to an 18px line, cut after three lines. */
function layOut(perLine: () => number) {
  const height = (element: Element) => 18 * Math.ceil((element.textContent?.length ?? 0) / perLine())
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
    return height(this)
  })
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return Math.min(height(this), 3 * 18)
  })
}

/** Reports a resize to every ResizeObserver the page has made. */
function observeResizes() {
  const callbacks: ResizeObserverCallback[] = []
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) {
      callbacks.push(callback)
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  return () => act(() => {
    for (const callback of callbacks) callback([], {} as ResizeObserver)
  })
}

/** A window wider than 960px, or not; the returned function resizes it across. */
function windowWide(wide: boolean) {
  const listeners = new Set<() => void>()
  let current = wide
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query === '(min-width: 961px)' && current
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }))
  return (next: boolean) => {
    current = next
    act(() => listeners.forEach((listener) => listener()))
  }
}

/** Every button's name, in the order the keyboard reaches them. */
const buttonNames = (container: HTMLElement) =>
  within(container).queryAllByRole('button').map((button) => button.getAttribute('aria-label') ?? button.textContent)

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

  it('opens on Close session, so Enter closes the session to reopen later', async () => {
    const user = userEvent.setup()
    const onCloseSession = vi.fn()
    const onDelete = vi.fn()
    render(
      <CloseSessionDialog
        onCancel={vi.fn()}
        onCloseSession={onCloseSession}
        onDelete={onDelete}
        recoverable
        session={session('one', { title: 'Release review' })}
      />,
    )
    const dialog = screen.getByRole('dialog', { name: 'Close session' })

    expect(within(dialog).getByRole('button', { name: 'Close session' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onCloseSession).toHaveBeenCalledOnce()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('never opens on Delete permanently, so Enter cannot delete a session for good', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <CloseSessionDialog
        onCancel={vi.fn()}
        onCloseSession={vi.fn()}
        onDelete={onDelete}
        recoverable={false}
        session={session('one', { title: 'Release review' })}
      />,
    )
    const dialog = screen.getByRole('dialog', { name: 'Close session' })

    expect(dialog).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('gives the focus back to what opened it when cancelled', async () => {
    const user = userEvent.setup()
    function Row() {
      const [asking, setAsking] = useState(false)
      return (
        <>
          <button onClick={() => setAsking(true)} type="button">Close Release review</button>
          {asking ? (
            <CloseSessionDialog
              onCancel={() => setAsking(false)}
              onCloseSession={vi.fn()}
              onDelete={vi.fn()}
              recoverable
              session={session('one', { title: 'Release review' })}
            />
          ) : null}
        </>
      )
    }
    render(<Row />)
    const opener = screen.getByRole('button', { name: 'Close Release review' })

    await user.click(opener)
    const dialog = screen.getByRole('dialog', { name: 'Close session' })
    expect(within(dialog).getByRole('button', { name: 'Close session' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(dialog).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
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
    const { dialog } = renderList({
      sessions: [closed, session('fresh', { title: 'Fresh close', isOpen: false, closedAt: new Date(now).toISOString() })],
    })
    const card = within(dialog).getByRole('article', { name: 'Release review' })

    expect(within(card).getByText('development')).toBeInTheDocument()
    expect(within(card).getByText('~/src/app')).toBeInTheDocument()
    expect(card).toHaveTextContent('Closed 2 hours ago')
    expect(card).toHaveTextContent('Deleted in 14 days')
    expect(within(card).getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(['Draft the release notes', 'Add the migration step'])
    expect(card).toHaveTextContent('The notes are ready.')
    expect(within(dialog).getByRole('article', { name: 'Fresh close' })).toHaveTextContent('Closed just now')
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

  it('deletes a session permanently at once, and reports a delete that failed', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    let fail!: (error: Error) => void
    const onDelete = vi.fn(() => new Promise<void>((_resolve, reject) => { fail = reject }))
    const { dialog } = renderList({ onDelete })
    const remove = within(dialog).getByRole('button', { name: 'Delete Release review permanently' })

    fireEvent.click(remove)
    expect(confirm).not.toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(closed)
    expect(remove).toHaveTextContent('Deleting…')
    expect(remove).toBeDisabled()
    await act(async () => fail(new Error('Unable to delete session')))

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Unable to delete session')
    expect(remove).toHaveTextContent('Delete permanently')
    expect(remove).toBeEnabled()
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

  it('offers Show more only on a card whose context is cut, and opens that card alone', () => {
    layOut(() => 60)
    const { dialog } = renderList({ sessions: [closed, audit(), audit('Audit the backups')] })
    const card = (name: string) => within(dialog).getByRole('article', { name })

    expect(buttonNames(card('Release review'))).toEqual(['Reopen Release review', 'Delete Release review permanently'])
    const more = within(card('Audit disk usage')).getByRole('button', { name: 'Show more' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    const context = document.getElementById(more.getAttribute('aria-controls') ?? '')
    expect(context).toContainElement(within(card('Audit disk usage')).getByText(auditReply))
    expect(context).toContainElement(within(card('Audit disk usage')).getByText('How do I give WSL 200 GB more?'))

    fireEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')
    expect(more).toHaveTextContent('Show less')
    expect(within(card('Audit the backups')).getByRole('button', { name: 'Show more' }))
      .toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'false')
    expect(more).toHaveTextContent('Show more')
  })

  it('keeps Show more in view once Show less has shortened a card', () => {
    layOut(() => 60)
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
    try {
      const { dialog } = renderList({ sessions: [audit()] })
      const more = within(dialog).getByRole('button', { name: 'Show more' })

      fireEvent.click(more)
      expect(scrollIntoView).not.toHaveBeenCalled()
      fireEvent.click(more)
      expect(scrollIntoView.mock.contexts).toEqual([more])
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    } finally {
      delete (Element.prototype as Partial<Element>).scrollIntoView
    }
  })

  it('looks again for a cut context when a card changes size', () => {
    let perLine = 1000
    layOut(() => perLine)
    const resize = observeResizes()
    const { dialog } = renderList({ sessions: [audit()] })
    const card = within(dialog).getByRole('article', { name: 'Audit disk usage' })
    expect(within(card).queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument()

    perLine = 40
    resize()
    expect(within(card).getByRole('button', { name: 'Show more' })).toBeInTheDocument()

    perLine = 1000
    resize()
    expect(within(card).queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument()
  })

  it('puts Reopen and Delete permanently beside the title on a desktop, and below the context on a phone', () => {
    layOut(() => 60)
    const resizeWindow = windowWide(true)
    const { dialog } = renderList({ sessions: [audit()] })
    const card = within(dialog).getByRole('article', { name: 'Audit disk usage' })
    const header = () => card.querySelector('header') as HTMLElement
    const reopen = 'Reopen Audit disk usage'
    const remove = 'Delete Audit disk usage permanently'

    expect(header()).toContainElement(within(card).getByRole('heading', { name: 'Audit disk usage' }))
    expect(buttonNames(header())).toEqual([reopen, remove])
    expect(buttonNames(card)).toEqual([reopen, remove, 'Show more'])

    resizeWindow(false)
    expect(header()).toContainElement(within(card).getByRole('heading', { name: 'Audit disk usage' }))
    expect(buttonNames(header())).toEqual([])
    expect(buttonNames(card)).toEqual(['Show more', reopen, remove])
  })

  it('gives a moved Reopen or Delete permanently its focus back when the window crosses the desktop width', () => {
    const resizeWindow = windowWide(true)
    // Two sessions of one name, so the focus returns to the right one.
    const elsewhere = { ...audit(), id: 'audit-on-node', computerId: 'node', computerName: 'production' }
    const { dialog } = renderList({ sessions: [audit(), elsewhere] })
    const reopen = () => within(dialog).getAllByRole('button', { name: 'Reopen Audit disk usage' })[1]
    const remove = () => within(dialog).getAllByRole('button', { name: 'Delete Audit disk usage permanently' })[1]

    reopen().focus()
    resizeWindow(false)
    expect(reopen()).toHaveFocus()
    remove().focus()
    resizeWindow(true)
    expect(remove()).toHaveFocus()
  })
})
