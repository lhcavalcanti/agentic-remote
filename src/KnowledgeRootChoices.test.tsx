// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
const actions = { onChoice: vi.fn(), onBrowse: vi.fn(), onRemove: vi.fn() }
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('session root choices', () => {
  it('reuses a registered working folder rather than offering a duplicate root', () => {
    render(<KnowledgeRootChoices {...actions} roots={[root]} computers={computers} session={session}
      currentRootId={root.id} choice={{ kind: 'root', rootId: root.id }} disabled={false} />)
    expect(screen.getByRole('radio', { name: "Use this session's folder" })).toBeChecked()
    expect(screen.queryByRole('radio', { name: 'Notes on Studio: /home/demo/notes' })).toBeNull()
    expect(actions.onChoice).not.toHaveBeenCalled()
  })

  it('keeps computer/path identity explicit for equally named roots', () => {
    render(<KnowledgeRootChoices {...actions}
      roots={[root, { ...root, id: 'other', path: '/srv/notes' }]} computers={computers}
      disabled={false} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Notes on Studio: /srv/notes' }))
    expect(actions.onChoice).toHaveBeenCalledWith({ kind: 'root', rootId: 'other' })
    expect(actions.onRemove).not.toHaveBeenCalled()
  })

  it('retains offline folders visibly without offering an unreadable new selection', () => {
    render(<KnowledgeRootChoices {...actions}
      roots={[{ ...root, computerId: 'travel', computerName: 'Travel laptop' }]}
      computers={computers} disabled={false} />)
    expect(screen.getByRole('radio', { name: /Notes on Travel laptop/ })).toBeDisabled()
    expect(screen.getByText('Offline')).toBeVisible()
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
})
