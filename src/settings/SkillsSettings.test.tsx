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
  it('focuses confirmation and restores the toggled control after cancel and save', async () => {
    vi.mocked(listComputerSkills).mockResolvedValue(snapshot)
    vi.mocked(toggleComputerSkill).mockResolvedValue({ ...snapshot, skills: [{ ...snapshot.skills[0], enabled: false }] })
    render(<SkillsSettings computers={computers} />)
    const disable = await screen.findByRole('button', { name: 'Disable review' })
    disable.focus()
    fireEvent.click(disable)
    expect(screen.getByRole('button', { name: 'Confirm change' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Disable review' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Disable review' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enable review' })).toHaveFocus())
  })

  it('restores the originating duplicate skill control rather than the first matching name', async () => {
    vi.mocked(listComputerSkills).mockResolvedValue({
      ...snapshot, skills: [snapshot.skills[0], { ...snapshot.skills[0], location: '~/other/review' }],
    })
    render(<SkillsSettings computers={computers} />)
    const controls = await screen.findAllByRole('button', { name: 'Disable review' })
    controls[1].focus()
    fireEvent.click(controls[1])
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getAllByRole('button', { name: 'Disable review' })[1]).toHaveFocus()
  })

  it.each([false, true])('restores useful focus after a failed save or a disappearing skill (removed: %s)', async (removed) => {
    vi.mocked(listComputerSkills).mockResolvedValue(snapshot)
    if (removed) vi.mocked(toggleComputerSkill).mockResolvedValue({ ...snapshot, skills: [] })
    else vi.mocked(toggleComputerSkill).mockRejectedValue(new Error('Settings changed; refresh and try again.'))
    render(<SkillsSettings computers={computers} />)
    const disable = await screen.findByRole('button', { name: 'Disable review' })
    disable.focus()
    fireEvent.click(disable)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }))
    await waitFor(() => expect(removed
      ? screen.getByRole('searchbox', { name: 'Search skills' })
      : screen.getByRole('button', { name: 'Disable review' })).toHaveFocus())
  })

  it('shows why invalid or repository-disabled skills cannot be toggled', async () => {
    vi.mocked(listComputerSkills).mockResolvedValue({
      ...snapshot, skills: [{ ...snapshot.skills[0], manageable: false, enabled: false, reason: 'SKILL.md frontmatter description is required.' }],
    })
    render(<SkillsSettings computers={computers} />)
    expect(await screen.findByText('SKILL.md frontmatter description is required.')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Enable review' }))
    expect(screen.getByRole('button', { name: 'Enable review' })).toBeDisabled()
    expect(screen.queryByRole('group', { name: 'Confirm skill change' })).not.toBeInTheDocument()
    expect(toggleComputerSkill).not.toHaveBeenCalled()
  })

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
