// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnowledgeRootSelector } from './KnowledgeRootSelector'

const roots = [
  { id: 'one', name: 'Notes', computerId: 'studio', computerName: 'Studio',
    path: '/home/demo/notes', createdAt: '2026-09-01T00:00:00Z' },
  { id: 'two', name: 'Handbook', computerId: 'worker', computerName: 'Worker',
    path: '/srv/handbook', createdAt: '2026-09-01T00:00:00Z' },
]
afterEach(cleanup)

describe('knowledge root selector', () => {
  it('keeps every root available, shows its owner/location, and removes only the selected root', () => {
    const select = vi.fn()
    const remove = vi.fn()
    render(<KnowledgeRootSelector roots={roots} activeId="one" onSelect={select} onRemove={remove} />)
    const picker = screen.getByRole('combobox', { name: 'Knowledge root' })
    expect(picker).toHaveValue('one')
    expect(screen.getByRole('option', { name: 'Notes · Studio' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Handbook · Worker' })).toBeInTheDocument()
    expect(screen.getByText('/home/demo/notes')).toBeVisible()
    fireEvent.change(picker, { target: { value: 'two' } })
    expect(select).toHaveBeenCalledWith('two')
    fireEvent.click(screen.getByRole('button', { name: 'Remove Notes root' }))
    expect(remove).toHaveBeenCalledWith('one')
  })

  it('disambiguates equally named folders on the same computer', () => {
    render(<KnowledgeRootSelector
      roots={[roots[0], { ...roots[0], id: 'other', path: '/srv/notes' }]}
      activeId="one" onSelect={() => {}} onRemove={() => {}}
    />)
    expect(screen.getByRole('option', { name: 'Notes · Studio · /srv/notes' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Notes · Studio · /home/demo/notes' })).toBeInTheDocument()
  })

  it('does not silently choose a different root while the selection is unresolved', () => {
    const select = vi.fn()
    render(<KnowledgeRootSelector roots={roots} onSelect={select} onRemove={() => {}} />)
    expect(screen.getByRole('combobox')).toHaveValue('')
    expect(screen.queryByRole('button')).toBeNull()
    expect(select).not.toHaveBeenCalled()
  })
})
