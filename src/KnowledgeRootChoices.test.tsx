// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, KnowledgeRoot, ManagedSession } from '../shared/contracts'
import { KnowledgeRootChoices } from './KnowledgeRootChoices'

const computers: ComputerSummary[] = [
  { id: 'studio', name: 'Studio', isLocal: true, online: true },
  { id: 'travel', name: 'Travel laptop', isLocal: false, online: false },
]
const root: KnowledgeRoot = {
  id: 'notes', name: 'Notes', computerId: 'studio', computerName: 'Studio',
  path: '/home/demo/notes', createdAt: '2026-09-01T00:00:00Z',
}
const session: ManagedSession = {
  id: 'review', computerId: 'studio', computerName: 'Studio', title: 'Review notes',
  cwd: '/home/demo/notes', status: 'idle', messages: [], updatedAt: root.createdAt,
}
const actions = {
  onChoice: vi.fn(),
  onBrowse: vi.fn(),
  onRemove: vi.fn(),
  onList: vi.fn(async (_source, path: string) => ({
    path,
    entries: path === '.'
      ? [{ name: 'Guides', path: 'guides', kind: 'directory' as const }]
      : [{ name: 'Deep', path: 'guides/deep', kind: 'directory' as const }],
  })),
}
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('session root choices', () => {
  it('offers the session folder independently from an identical catalog root', () => {
    render(<KnowledgeRootChoices {...actions} roots={[root]} computers={computers} session={session}
      currentRootId={root.id}
      choice={{ kind: 'location', source: { kind: 'session-folder', path: session.cwd }, path: '.' }}
      disabled={false} />)
    expect(screen.getByRole('button', { name: "This session's folder on Studio: /home/demo/notes" })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Notes on Studio: /home/demo/notes' })).toBeVisible()
    expect(actions.onChoice).not.toHaveBeenCalled()
  })

  it('keeps computer/path identity explicit for equally named roots', () => {
    render(<KnowledgeRootChoices {...actions}
      roots={[root, { ...root, id: 'other', path: '/srv/notes' }]} computers={computers}
      disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Notes on Studio: /srv/notes' }))
    expect(actions.onChoice).toHaveBeenCalledWith({
      kind: 'location', source: { kind: 'catalog-root', rootId: 'other' }, path: '.',
    })
    expect(actions.onRemove).not.toHaveBeenCalled()
  })

  it('retains offline folders visibly without offering an unreadable new selection', () => {
    render(<KnowledgeRootChoices {...actions}
      roots={[{ ...root, computerId: 'travel', computerName: 'Travel laptop' }]}
      computers={computers} disabled={false} />)
    expect(screen.getByRole('button', { name: 'Notes on Travel laptop: /home/demo/notes' })).toBeDisabled()
    expect(screen.getByText('Offline')).toBeVisible()
  })

  it('expands nested folders inline and selects one with keyboard activation', async () => {
    render(<KnowledgeRootChoices {...actions} roots={[root]} computers={computers}
      session={session} disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Browse Notes' }))
    const guides = await screen.findByRole('treeitem', { name: /Guides/ })
    guides.focus()
    fireEvent.keyDown(guides, { key: 'Enter' })
    fireEvent.click(guides)
    expect(actions.onChoice).toHaveBeenCalledWith({
      kind: 'location', source: { kind: 'catalog-root', rootId: root.id }, path: 'guides',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Expand Guides' }))
    await waitFor(() => expect(screen.getByRole('treeitem', { name: /Deep/ })).toBeVisible())
  })

  it('keeps unassignment separate from shared-folder removal', () => {
    render(<KnowledgeRootChoices {...actions} roots={[root]} computers={computers} session={session}
      currentRootId={root.id} disabled={false} />)
    fireEvent.click(screen.getByRole('radio', { name: 'No root for this session' }))
    expect(actions.onChoice).toHaveBeenCalledWith({ kind: 'none' })
    expect(actions.onRemove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Manage shared folders'))
    fireEvent.click(screen.getByRole('button', { name: 'Review removal of Notes on Studio' }))
    expect(actions.onRemove).toHaveBeenCalledWith(root)
  })

  it('keeps unlink available for a session-folder binding without a catalog root', () => {
    render(<KnowledgeRootChoices {...actions} roots={[]} computers={computers} session={session}
      currentRootId={null} hasCurrentBinding disabled={false} />)
    fireEvent.click(screen.getByRole('radio', { name: 'No root for this session' }))
    expect(actions.onChoice).toHaveBeenCalledWith({ kind: 'none' })
  })

  it('reports a failed expansion once instead of retrying in a render loop', async () => {
    actions.onList.mockRejectedValueOnce(new Error('Folder is unavailable'))
    render(<KnowledgeRootChoices {...actions} roots={[root]} computers={computers}
      session={session} disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Browse Notes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Folder is unavailable')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(actions.onList).toHaveBeenCalledOnce()
  })
})
