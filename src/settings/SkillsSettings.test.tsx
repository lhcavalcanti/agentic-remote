// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { listComputerSkills, toggleComputerSkill } from '../api'
import { SkillsSettings } from './SkillsSettings'

vi.mock('../api', () => ({ listComputerSkills: vi.fn(), toggleComputerSkill: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
const computers = [
  { id: 'hub', name: 'Studio', isLocal: true, online: true },
  { id: 'node', name: 'Build node', isLocal: false, online: true },
  { id: 'offline', name: 'Travel laptop', isLocal: false, online: false },
]
const snapshot = {
  revision: 'a'.repeat(64), warnings: [],
  skills: [{ name: 'review', description: 'A review skill', source: 'user' as const, location: '~/.copilot/skills/review', enabled: true }],
}
describe('per-computer skill controls', () => {
  it('does not write until the global CLI effect is confirmed and supports cancelling', async () => {
    vi.mocked(listComputerSkills).mockResolvedValue(snapshot)
    vi.mocked(toggleComputerSkill).mockResolvedValue({ ...snapshot, skills: [{ ...snapshot.skills[0], enabled: false }] })
    render(<SkillsSettings computers={computers} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Disable review' }))
    expect(screen.getByText(/every session on Studio/)).toBeVisible()
    expect(toggleComputerSkill).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(toggleComputerSkill).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Disable review' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }))
    await screen.findByRole('button', { name: 'Enable review' })
    expect(toggleComputerSkill).toHaveBeenCalledWith('hub', { name: 'review', enabled: false, confirmed: true, revision: snapshot.revision })
  })

  it('negotiates the selected computer, shows update errors, and never reads an offline computer', async () => {
    vi.mocked(listComputerSkills).mockImplementation(async (id) => {
      if (id === 'node') throw new Error('Update this computer (Build node) to manage skills.')
      return snapshot
    })
    render(<SkillsSettings computers={computers} />)
    await screen.findByRole('button', { name: 'Disable review' })
    fireEvent.change(screen.getByRole('combobox', { name: 'Skills computer' }), { target: { value: 'node' } })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Update this computer'))
    fireEvent.change(screen.getByRole('combobox', { name: 'Skills computer' }), { target: { value: 'offline' } })
    expect(screen.getByRole('status')).toHaveTextContent('offline')
    expect(listComputerSkills).toHaveBeenCalledTimes(2)
    expect(toggleComputerSkill).not.toHaveBeenCalled()
  })
})
