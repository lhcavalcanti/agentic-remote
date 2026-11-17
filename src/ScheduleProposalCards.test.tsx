// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags, effectivePreviewFeatures } from '../shared/feature-flags'
import { scheduleProposalSchema } from '../shared/schedule-proposals'
import { scheduleSchema } from '../shared/schedules'
import { getSchedule, listScheduleProposals, resolveScheduleProposal } from './api'
import { PreviewFeaturesContext } from './preview-features'
import { ScheduleProposalCards } from './ScheduleProposalCards'
import { SchedulerPermissionSettings } from './settings/SchedulerPermissionSettings'

vi.mock('./api', () => ({ getSchedule: vi.fn(), listScheduleProposals: vi.fn(), resolveScheduleProposal: vi.fn() }))
const proposal = scheduleProposalSchema.parse({
  id: 'proposal-review', operation: 'create', createdBy: 'oracle', status: 'pending',
  createdAt: '2026-11-14T18:00:00Z', expiresAt: '2026-11-15T18:00:00Z',
  payload: {
    name: 'Fictional review', prompt: 'Review the fictional guide.',
    target: { computerId: 'fictional-studio', folder: '/fictional/repo', provider: 'copilot' },
    recurrence: { type: 'daily', time: '09:00' },
  },
})
const base = scheduleSchema.parse({
  ...proposal.payload, id: 'existing-review', revision: 7, createdBy: 'user', archived: false,
  createdAt: proposal.createdAt, updatedAt: proposal.createdAt,
})
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-04T16:20:00Z'))
  vi.mocked(getSchedule).mockReset().mockResolvedValue(base)
  vi.mocked(listScheduleProposals).mockReset().mockResolvedValue([proposal])
  vi.mocked(resolveScheduleProposal).mockReset().mockResolvedValue({ ...proposal, status: 'applied' })
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })
const context = (flag = true, preview = true) => {
  const hubFlags = { ...defaultHubFeatureFlags, scheduler: flag }
  const preferences = { schedulerView: preview }
  return { hubFlags, preferences, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn() }
}
function cards({ flag = true, preview = true, active = true } = {}) {
  return render(<PreviewFeaturesContext value={context(flag, preview)}><ScheduleProposalCards active={active} /></PreviewFeaturesContext>)
}
describe('schedule confirmation cards', () => {
  it.each([
    ['daily', 'Daily', 'Sat, Sep 5'], ['weekdays', 'Weekdays', 'Mon, Sep 7'],
  ] as const)('advances the next %s occurrence while the approval stays open', async (type, label, nextDay) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const at = Date.parse('2026-09-04T15:59:59Z')
    vi.mocked(Date.now).mockReturnValue(at)
    vi.mocked(listScheduleProposals).mockResolvedValue([scheduleProposalSchema.parse({
      ...proposal, payload: { ...proposal.payload, recurrence: { type, time: '09:00' } },
    })])
    await act(async () => { cards() })
    expect(screen.getByText(`${label} at 9:00 AM PT · next Fri, Sep 4, 9:00 AM PDT`)).toBeVisible()
    vi.mocked(Date.now).mockReturnValue(at + 1000)
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(screen.getByText(`${label} at 9:00 AM PT · next ${nextDay}, 9:00 AM PDT`)).toBeVisible()
    expect(listScheduleProposals).toHaveBeenCalledOnce()
  })

  it.each(['edited', 'deleted'] as const)('disables stale facts during refresh and keeps an %s base unapprovable', async (change) => {
    const pending = scheduleProposalSchema.parse({
      ...proposal, operation: 'update', scheduleId: base.id, baseRevision: base.revision, payload: { prompt: 'Revised review' },
    })
    vi.mocked(listScheduleProposals).mockResolvedValue([pending])
    const view = cards()
    expect(await screen.findByRole('button', { name: 'Approve' })).toBeEnabled()
    let finish!: (proposals: typeof pending[]) => void
    vi.mocked(listScheduleProposals).mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    if (change === 'edited') vi.mocked(getSchedule).mockResolvedValue({ ...base, revision: base.revision + 1 })
    else vi.mocked(getSchedule).mockRejectedValue(new Error('Schedule not found'))
    try {
      view.rerender(<PreviewFeaturesContext value={context()}><ScheduleProposalCards active refreshKey={1} /></PreviewFeaturesContext>)
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
      expect(screen.getByRole('status')).toHaveTextContent('Refreshing schedule details')
      expect(screen.queryByText(/^Computer:/)).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
      expect(resolveScheduleProposal).not.toHaveBeenCalled()
      await act(async () => { finish([pending]) })
      expect(await screen.findByRole('alert')).toHaveTextContent(change === 'edited' ? 'Schedule changed since revision 7' : 'Cannot verify')
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
      expect(getSchedule).toHaveBeenCalledTimes(2)
    } finally { finish([pending]) }
  })

  it.each(['expiry', 'one-off'] as const)('disables approval exactly at the %s boundary without a refresh', async (boundary) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const at = Date.parse('2026-09-04T16:20:00Z')
    const pending = scheduleProposalSchema.parse({
      ...proposal, expiresAt: new Date(at + (boundary === 'expiry' ? 1000 : 86_400_000)).toISOString(),
      payload: { ...proposal.payload, ...(boundary === 'one-off' ? { recurrence: { type: 'once', at: new Date(at + 1000).toISOString() } } : {}) },
    })
    vi.mocked(listScheduleProposals).mockResolvedValue([pending])
    await act(async () => { cards() })
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
    vi.mocked(Date.now).mockReturnValue(at + 1000)
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(boundary === 'expiry' ? 'proposal expired' : 'one-off time has passed')
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(resolveScheduleProposal).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled()
  })

  it.each(['disable', 'archive'] as const)('shows the full one-off target time before %s approval', async (operation) => {
    vi.mocked(getSchedule).mockResolvedValue({ ...base, recurrence: { type: 'once', at: '2026-09-07T16:00:00Z' } })
    vi.mocked(listScheduleProposals).mockResolvedValue([scheduleProposalSchema.parse({
      ...proposal, operation, scheduleId: base.id, baseRevision: base.revision, payload: {},
    })])
    cards()
    expect(await screen.findByText(/Once at Sep 7, 2026, 9:00 AM PDT/)).toBeVisible()
  })

  it.each([{ flag: false }, { preview: false }, { active: false }])('does not read or render when gated: %j', async (options) => {
    cards(options)
    expect(listScheduleProposals).not.toHaveBeenCalled()
    expect(screen.queryByRole('region', { name: 'Schedule approvals' })).not.toBeInTheDocument()
  })
  it('renders the exact proposal, revision and expiry', async () => {
    cards()
    expect(await screen.findByText(/Create “Fictional review”/)).toBeVisible()
    expect(screen.getByText(/^Computer:/)).toHaveTextContent('Computer: fictional-studio · Folder: /fictional/repo · Permissions: Ask · Folder trust: Ask · Workspace: checkout')
    expect(screen.getByText('Prompt: Review the fictional guide.')).toBeVisible()
    fireEvent.click(screen.getByText('Exact payload to approve'))
    expect(screen.getByText(/"permissionPolicy": "ask"/)).toBeVisible()
    expect(getSchedule).not.toHaveBeenCalled()
  })
  it('shows human recurrence, timezone and the next weekday without opening the payload', async () => {
    const weekdays = scheduleProposalSchema.parse({ ...proposal, payload: { ...proposal.payload, recurrence: { type: 'weekdays', time: '09:00' } } })
    vi.mocked(listScheduleProposals).mockResolvedValue([weekdays])
    cards()
    expect(await screen.findByText('Weekdays at 9:00 AM PT · next Mon, Sep 7, 9:00 AM PDT')).toBeVisible()
    expect(screen.getByText('Exact payload to approve').closest('details')).not.toHaveAttribute('open')
  })
  it('uses the recurrence engine first-occurrence DST rule in the visible next run', async () => {
    vi.mocked(Date.now).mockReturnValue(Date.parse('2026-10-31T12:00:00Z'))
    const weekly = scheduleProposalSchema.parse({ ...proposal, payload: {
      ...proposal.payload, recurrence: { type: 'weekly', days: [0], time: '01:30' },
    } })
    vi.mocked(listScheduleProposals).mockResolvedValue([weekly])
    cards()
    expect(await screen.findByText(/next Sun, Nov 1, 1:30 AM PDT/)).toBeVisible()
  })
  it('shows compact before-to-after changes and an explicit allow-all warning', async () => {
    const update = scheduleProposalSchema.parse({
      ...proposal, operation: 'update', scheduleId: base.id, baseRevision: base.revision,
      payload: { prompt: 'Review the revised guide.', target: { ...base.target, permissionPolicy: 'allow-all' } },
    })
    vi.mocked(listScheduleProposals).mockResolvedValue([update])
    cards()
    const changes = await screen.findByRole('list', { name: 'Changes to approve' })
    expect(changes).toHaveTextContent('Prompt: Review the fictional guide. → Review the revised guide.')
    expect(changes).toHaveTextContent('Permissions: Ask → Allow all')
    expect(changes).not.toHaveTextContent('Computer:')
    expect(screen.getByText('Runs tools without asking')).toBeVisible()
    expect(screen.getByText(/^Computer:/)).toHaveTextContent('Permissions: Allow all')
    expect(getSchedule).toHaveBeenCalledExactlyOnceWith(base.id)
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
    expect(screen.getByText('Exact payload to approve').closest('details')).not.toHaveAttribute('open')
  })
  it.each([
    ['enable', 'Enables automatic runs on fictional-studio; accepted runs are unchanged.'],
    ['disable', 'Pauses future automatic runs; accepted runs continue.'],
    ['run-now', 'Runs once now on fictional-studio.'],
    ['archive', 'Archives and disables automatic runs; unlaunched runs stop, running sessions continue.'],
  ] as const)('explains the %s consequence without opening the payload', async (operation, consequence) => {
    vi.mocked(listScheduleProposals).mockResolvedValue([scheduleProposalSchema.parse({
      ...proposal, operation, scheduleId: base.id, baseRevision: base.revision, payload: {},
    })])
    cards()
    expect(await screen.findByText(consequence)).toBeVisible()
    expect(screen.getByText(/^Computer:/)).toHaveTextContent('Folder trust: Ask')
  })
  it('includes optional target fields removed by replacing the target in its diff', async () => {
    vi.mocked(getSchedule).mockResolvedValue({ ...base, target: { ...base.target, model: 'fictional-model', effort: 'high' } })
    vi.mocked(listScheduleProposals).mockResolvedValue([scheduleProposalSchema.parse({
      ...proposal, operation: 'update', scheduleId: base.id, baseRevision: base.revision, payload: { target: base.target },
    })])
    cards()
    const changes = await screen.findByRole('list', { name: 'Changes to approve' })
    expect(changes).toHaveTextContent('Model: fictional-model → Default')
    expect(changes).toHaveTextContent('Effort: high → Default')
  })
  it('distinguishes one-off timestamps in a recurrence diff', async () => {
    vi.mocked(getSchedule).mockResolvedValue({ ...base, recurrence: { type: 'once', at: '2026-09-07T16:00:00Z' } })
    vi.mocked(listScheduleProposals).mockResolvedValue([scheduleProposalSchema.parse({
      ...proposal, operation: 'update', scheduleId: base.id, baseRevision: base.revision,
      payload: { recurrence: { type: 'once', at: '2026-09-08T17:00:00Z' } },
    })])
    cards()
    const changes = await screen.findByRole('list', { name: 'Changes to approve' })
    expect(changes).toHaveTextContent('Sep 7, 2026, 9:00 AM PDT')
    expect(changes).toHaveTextContent('Sep 8, 2026, 10:00 AM PDT')
  })
  it.each(['stale', 'unavailable'] as const)('refuses approval when before-state is %s', async (state) => {
    vi.mocked(listScheduleProposals).mockResolvedValue([scheduleProposalSchema.parse({
      ...proposal, operation: 'update', scheduleId: base.id, baseRevision: base.revision, payload: { enabled: false },
    })])
    if (state === 'stale') vi.mocked(getSchedule).mockResolvedValue({ ...base, revision: base.revision + 1 })
    else vi.mocked(getSchedule).mockRejectedValue(new Error('Offline'))
    cards()
    expect(await screen.findByRole('alert')).toHaveTextContent(state === 'stale' ? 'Schedule changed since revision 7' : 'Cannot verify')
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled()
    expect(resolveScheduleProposal).not.toHaveBeenCalled()
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
