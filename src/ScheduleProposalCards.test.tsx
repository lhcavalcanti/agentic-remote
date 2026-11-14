// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags, effectivePreviewFeatures } from '../shared/feature-flags'
import { scheduleProposalSchema } from '../shared/schedule-proposals'
import { listScheduleProposals, resolveScheduleProposal } from './api'
import { PreviewFeaturesContext } from './preview-features'
import { ScheduleProposalCards } from './ScheduleProposalCards'
import { SchedulerPermissionSettings } from './settings/SchedulerPermissionSettings'

vi.mock('./api', () => ({ listScheduleProposals: vi.fn(), resolveScheduleProposal: vi.fn() }))
const proposal = scheduleProposalSchema.parse({
  id: 'proposal-review', operation: 'create', createdBy: 'oracle', status: 'pending',
  createdAt: '2026-11-14T18:00:00Z', expiresAt: '2026-11-15T18:00:00Z',
  payload: {
    name: 'Fictional review', prompt: 'Review the fictional guide.',
    target: { computerId: 'fictional-studio', folder: '/fictional/repo', provider: 'copilot' },
    recurrence: { type: 'daily', time: '09:00' },
  },
})
beforeEach(() => {
  vi.mocked(listScheduleProposals).mockReset().mockResolvedValue([proposal])
  vi.mocked(resolveScheduleProposal).mockReset().mockResolvedValue({ ...proposal, status: 'applied' })
})
afterEach(cleanup)
const context = (flag = true, preview = true) => {
  const hubFlags = { ...defaultHubFeatureFlags, scheduler: flag }
  const preferences = { schedulerView: preview }
  return { hubFlags, preferences, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn() }
}
function cards({ flag = true, preview = true, active = true } = {}) {
  return render(<PreviewFeaturesContext value={context(flag, preview)}><ScheduleProposalCards active={active} /></PreviewFeaturesContext>)
}
describe('schedule confirmation cards', () => {
  it.each([{ flag: false }, { preview: false }, { active: false }])('does not read or render when gated: %j', async (options) => {
    cards(options)
    expect(listScheduleProposals).not.toHaveBeenCalled()
    expect(screen.queryByRole('region', { name: 'Schedule approvals' })).not.toBeInTheDocument()
  })
  it('renders the exact proposal, revision and expiry', async () => {
    cards()
    expect(await screen.findByText(/Create “Fictional review”/)).toBeVisible()
    fireEvent.click(screen.getByText('Exact payload to approve'))
    expect(screen.getByText(/"permissionPolicy": "ask"/)).toBeVisible()
    expect(screen.getByText(/Review the fictional guide/, { exact: false })).toBeVisible()
  })
  it.each([['Approve', true], ['Reject', false]] as const)('sends only the exact proposal id when clicking %s', async (label, approve) => {
    cards()
    fireEvent.click(await screen.findByRole('button', { name: label }))
    await waitFor(() => expect(resolveScheduleProposal).toHaveBeenCalledExactlyOnceWith(proposal.id, approve))
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Schedule approvals' })).not.toBeInTheDocument())
  })
  it('keeps the card and exposes a revision rejection rather than claiming success', async () => {
    vi.mocked(resolveScheduleProposal).mockRejectedValue(new Error('Schedule revision conflict'))
    cards()
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('revision conflict')
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled()
  })
  it('keeps allow-all off by default and changes only the hub profile setting', () => {
    const changed = vi.fn()
    render(<PreviewFeaturesContext value={context()}><SchedulerPermissionSettings onChange={changed} /></PreviewFeaturesContext>)
    const checkbox = screen.getByRole('checkbox', { name: 'Allow Oracle to propose allow-all schedules' })
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(changed).toHaveBeenCalledExactlyOnceWith(true)
    expect(resolveScheduleProposal).not.toHaveBeenCalled()
  })
})
