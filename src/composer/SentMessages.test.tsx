// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../../shared/contracts'
import { SentMessages } from './SentMessages'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const messages: ChatMessage[] = [
  { id: 'one', role: 'user', content: 'First full message', createdAt: '2026-11-13T12:00:00Z' },
  { id: 'two', role: 'user', content: 'Newest full message', createdAt: '2026-11-14T12:00:00Z' },
]

describe('SentMessages', () => {
  it.each([
    ['ArrowUp', 'one'],
    ['ArrowDown', 'two'],
  ])('starts %s at the correct end of a multi-result list', (key, expectedId) => {
    const onChoose = vi.fn()
    render(<SentMessages messages={messages} onChoose={onChoose} onCancel={vi.fn()} onUse={vi.fn()} />)
    const search = screen.getByRole('combobox', { name: 'Search sent messages' })
    fireEvent.keyDown(search, { key })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(onChoose).toHaveBeenCalledExactlyOnceWith(expectedId)
  })

  it('focuses the dialog rather than summoning a touch keyboard', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    render(<SentMessages messages={messages} onChoose={vi.fn()} onCancel={vi.fn()} onUse={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Search sent messages' })).not.toHaveFocus()
    expect(screen.getByRole('dialog', { name: 'Sent messages' })).toHaveFocus()
  })

  it('searches, previews by keyboard without sending, then cancels the parked preview', () => {
    const onChoose = vi.fn()
    const onCancel = vi.fn()
    render(<SentMessages messages={messages} onChoose={onChoose} onCancel={onCancel} onUse={vi.fn()} />)
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      expect.stringContaining('Newest full message'), expect.stringContaining('First full message'),
    ])
    const search = screen.getByRole('combobox', { name: 'Search sent messages' })
    expect(search).toHaveFocus()
    fireEvent.change(search, { target: { value: 'FIRST' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(onChoose).toHaveBeenCalledExactlyOnceWith('one')
    expect(screen.getByText('Loaded into the composer, not sent. Cancel restores your draft.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use message' })).toBeEnabled()
    fireEvent.keyDown(search, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledOnce()
  })
  it('shows an empty state and requires a selection before accepting it', () => {
    render(<SentMessages messages={[]} onChoose={vi.fn()} onCancel={vi.fn()} onUse={vi.fn()} />)
    expect(screen.getByText('No sent messages yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use message' })).toBeDisabled()
  })
})
