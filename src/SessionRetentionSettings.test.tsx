// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useState } from 'react'
import type { SessionRetention } from '../shared/contracts'
import { SessionRetentionSettings } from './SessionRetentionSettings'

afterEach(cleanup)

it('defaults to never archive and persists a review pin independently of age', async () => {
  const saved: SessionRetention[] = []
  function Harness() {
    const [value, setValue] = useState<SessionRetention>()
    return <SessionRetentionSettings value={value} disabled={false} save={async (next) => {
      saved.push(next)
      setValue(next)
    }} />
  }
  render(<Harness />)
  expect(screen.getByRole('combobox', { name: 'Archive inactive session' })).toHaveValue('')
  fireEvent.change(screen.getByRole('combobox', { name: 'Archive inactive session' }), { target: { value: '7' } })
  await waitFor(() => expect(saved).toEqual([{ pinned: false, idleDays: 7 }]))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Keep for review' }))
  await waitFor(() => expect(saved.at(-1)).toEqual({ pinned: true, idleDays: 7 }))
  expect(screen.getByText(/Never deletes history or worktrees/)).toBeInTheDocument()
})

it('shows a save failure without pretending the new policy was saved', async () => {
  render(<SessionRetentionSettings disabled={false} save={vi.fn(async () => {
    throw new Error('Computer is offline')
  })} />)
  fireEvent.click(screen.getByRole('checkbox', { name: 'Keep for review' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Computer is offline')
  expect(screen.getByRole('checkbox', { name: 'Keep for review' })).not.toBeChecked()
})

it('applies authoritative changes from another device and disables offline edits', () => {
  const save = vi.fn()
  const { rerender } = render(<SessionRetentionSettings disabled={false} save={save} />)
  rerender(<SessionRetentionSettings value={{ pinned: true, idleDays: 30 }} disabled save={save} />)
  expect(screen.getByRole('checkbox', { name: 'Keep for review' })).toBeChecked()
  expect(screen.getByRole('combobox', { name: 'Archive inactive session' })).toHaveValue('30')
  expect(screen.getByRole('combobox')).toBeDisabled()
})
