// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnowledgeRootSelector } from './KnowledgeRootSelector'

const root = {
  id: 'one', name: 'Notes', computerId: 'studio', computerName: 'Studio',
  path: '/home/demo/notes', createdAt: '2026-09-01T00:00:00Z',
}
afterEach(cleanup)

describe('knowledge root selector', () => {
  it('shows the root owner and session scope without an adjacent destructive action', () => {
    const choose = vi.fn()
    render(<KnowledgeRootSelector root={root} status="Saved for this session" onChoose={choose} />)
    const button = screen.getByRole('button', { name: 'Choose Knowledge root' })
    expect(button).toHaveAccessibleDescription(/Saved for this session.*Studio: \/home\/demo\/notes/)
    expect(screen.getByText('Notes')).toBeVisible()
    expect(screen.getByText('Studio / ~/notes')).toBeVisible()
    expect(screen.queryByRole('button', { name: /remove/i })).toBeNull()
    fireEvent.click(button)
    expect(choose).toHaveBeenCalledOnce()
  })

  it('does not silently choose a folder for an unassigned session', () => {
    const choose = vi.fn()
    render(<KnowledgeRootSelector status="No root assigned" onChoose={choose} />)
    expect(screen.getByText('Choose a session root')).toBeVisible()
    expect(choose).not.toHaveBeenCalled()
  })

  it('distinguishes a pending lookup from a confirmed saved root', () => {
    render(<KnowledgeRootSelector status="Loading the session root" loading onChoose={() => {}} />)
    expect(screen.getByRole('button', { name: 'Choose Knowledge root' })).toBeDisabled()
    expect(screen.getByText('Opening session root')).toBeVisible()
    expect(screen.queryByText('Saved for this session')).toBeNull()
  })
})
