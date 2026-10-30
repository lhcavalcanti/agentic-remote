// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DreamerMorningPlan, DreamerSettings } from './OracleDreamer'
import { DreamerApiError, getDreamer, saveDreamerSettings, updateDreamerPlan } from './dreamer-api'

vi.mock('./dreamer-api', () => ({
  getDreamer: vi.fn(),
  saveDreamerSettings: vi.fn(),
  updateDreamerPlan: vi.fn(),
  DreamerApiError: class extends Error {
    readonly status: number
    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
}))

const initial = {
  available: true,
  revision: 3,
  settings: { enabled: false, timeZone: 'Europe/Berlin' },
}
const plan = {
  id: 'daily-plan',
  localDate: '2026-10-29',
  timeZone: 'Europe/Berlin',
  createdAt: '2026-10-29T01:00:00.000Z',
  coverage: ['Session journal metadata only.', 'Durable todos unavailable.'],
  omitted: 2,
  items: [
    { id: 'a', label: 'Review failed session', reason: 'Last observed status was error.', source: 'session' as const, status: 'pending' as const },
    { id: 'b', label: 'Review remembered decision', reason: 'Active memory metadata.', source: 'memory' as const, status: 'pending' as const },
  ],
}
const ready = { ...initial, settings: { ...initial.settings, enabled: true }, plan }

describe('Dreamer settings and morning review', () => {
  beforeEach(() => {
    vi.mocked(getDreamer).mockReset().mockResolvedValue(initial)
    vi.mocked(saveDreamerSettings).mockReset()
    vi.mocked(updateDreamerPlan).mockReset()
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('saves explicit enablement and the edited timezone at the loaded revision', async () => {
    vi.mocked(saveDreamerSettings).mockResolvedValue({ ...ready, revision: 4 })
    render(<DreamerSettings />)
    const enabled = await screen.findByRole('checkbox', { name: 'Enable Dreamer' })
    expect(enabled).not.toBeChecked()
    fireEvent.click(enabled)
    fireEvent.change(screen.getByLabelText('Dreamer timezone'), { target: { value: 'Asia/Kathmandu' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText('Dreamer settings saved.')
    expect(saveDreamerSettings).toHaveBeenCalledWith({
      revision: 3, enabled: true, timeZone: 'Asia/Kathmandu',
    })
    expect(screen.getByText(/02:00/)).toBeInTheDocument()
  })

  it('retains the input and shows a save failure instead of claiming success', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValue(new DreamerApiError('Invalid timezone.', 400))
    render(<DreamerSettings />)
    fireEvent.change(await screen.findByLabelText('Dreamer timezone'), { target: { value: 'Invalid/Zone' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid timezone.')
    expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('Invalid/Zone')
    expect(screen.queryByText('Dreamer settings saved.')).not.toBeInTheDocument()
  })

  it('allows disabling with the saved timezone', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(saveDreamerSettings).mockResolvedValue({ ...initial, revision: 4 })
    render(<DreamerSettings />)
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable Dreamer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText('Dreamer settings saved.')
    expect(saveDreamerSettings).toHaveBeenCalledWith({ revision: 3, enabled: false, timeZone: 'Europe/Berlin' })
  })

  it('refreshes conflicted settings and asks the user to review rather than overwrite', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValue(new DreamerApiError('Stale settings.', 409))
    render(<DreamerSettings />)
    await screen.findByLabelText('Dreamer timezone')
    vi.mocked(getDreamer).mockResolvedValue({ ...initial, revision: 9, settings: { enabled: true, timeZone: 'UTC' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/changed elsewhere/)
    expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('UTC')
  })

  it('keeps unsaved settings when conflict recovery cannot refresh', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValue(new DreamerApiError('Stale settings.', 409))
    render(<DreamerSettings />)
    fireEvent.change(await screen.findByLabelText('Dreamer timezone'), { target: { value: 'Asia/Kathmandu' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Dreamer' }))
    vi.mocked(getDreamer).mockRejectedValue(new Error('Hub offline.'))
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not refresh/i)
    expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('Asia/Kathmandu')
    expect(screen.getByRole('checkbox', { name: 'Enable Dreamer' })).toBeChecked()
  })

  it('adopts saved settings on successful retry rather than rebasing a stale draft', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValueOnce(new DreamerApiError('Stale settings.', 409))
    render(<DreamerSettings />)
    fireEvent.change(await screen.findByLabelText('Dreamer timezone'), { target: { value: 'Asia/Kathmandu' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Dreamer' }))
    vi.mocked(getDreamer).mockRejectedValueOnce(new Error('Hub offline.'))
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText(/Could not refresh Dreamer settings/)
    vi.mocked(getDreamer).mockResolvedValue({
      ...initial, revision: 9, settings: { enabled: false, timeZone: 'UTC' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Retry Dreamer' }))
    await waitFor(() => expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('UTC'))
    expect(screen.getByRole('checkbox', { name: 'Enable Dreamer' })).not.toBeChecked()
    vi.mocked(saveDreamerSettings).mockResolvedValue({
      ...initial, revision: 10, settings: { enabled: false, timeZone: 'UTC' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText('Dreamer settings saved.')
    expect(saveDreamerSettings).toHaveBeenLastCalledWith({
      revision: 9, enabled: false, timeZone: 'UTC',
    })
  })

  it('shows a dated priority list and honest coverage without claiming task completion', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    render(<DreamerMorningPlan />)
    fireEvent.click(await screen.findByText('Morning plan'))
    expect(screen.getByText(/2026-10-29/)).toBeInTheDocument()
    expect(screen.getByText('Durable todos unavailable.')).toBeInTheDocument()
    expect(screen.getByText(/2 additional candidates/)).toBeInTheDocument()
    expect(screen.getByText(/Changes only this plan/)).toBeInTheDocument()
    const items = within(screen.getByRole('list', { name: 'Dreamer priorities' })).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Review failed session')
    expect(items[1]).toHaveTextContent('Review remembered decision')
  })

  it('persists exact reordered IDs using the current plan and revision', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockResolvedValue({
      ...ready, revision: 4, plan: { ...plan, items: [plan.items[1], plan.items[0]] },
    })
    render(<DreamerMorningPlan />)
    fireEvent.click(await screen.findByText('Morning plan'))
    fireEvent.click(screen.getByRole('button', { name: 'Move Review remembered decision up' }))
    await waitFor(() => {
      expect(within(screen.getByRole('list', { name: 'Dreamer priorities' })).getAllByRole('listitem')[0])
        .toHaveTextContent('Review remembered decision')
    })
    expect(updateDreamerPlan).toHaveBeenCalledWith({ revision: 3, planId: 'daily-plan', order: ['b', 'a'] })
  })

  it.each(['done', 'skipped'] as const)('persists %s only in the plan and offers restore', async (status) => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockResolvedValue({
      ...ready, revision: 4, plan: { ...plan, items: [{ ...plan.items[0], status }, plan.items[1]] },
    })
    render(<DreamerMorningPlan />)
    fireEvent.click(await screen.findByText('Morning plan'))
    const first = within(screen.getByRole('list', { name: 'Dreamer priorities' })).getAllByRole('listitem')[0]
    fireEvent.click(within(first).getByRole('button', { name: status === 'done' ? 'Done' : 'Skip' }))
    await screen.findByRole('button', { name: 'Restore Review failed session' })
    expect(updateDreamerPlan).toHaveBeenCalledWith({
      revision: 3, planId: 'daily-plan', item: { id: 'a', status },
    })
    vi.mocked(updateDreamerPlan).mockResolvedValue({ ...ready, revision: 5 })
    fireEvent.click(screen.getByRole('button', { name: 'Restore Review failed session' }))
    await waitFor(() => expect(updateDreamerPlan).toHaveBeenLastCalledWith({
      revision: 4, planId: 'daily-plan', item: { id: 'a', status: 'pending' },
    }))
  })

  it('refreshes stale plans and does not replay a conflicting action', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockRejectedValue(new DreamerApiError('Stale plan.', 409))
    render(<DreamerMorningPlan />)
    fireEvent.click(await screen.findByText('Morning plan'))
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, revision: 8, plan: { ...plan, items: [plan.items[1]] } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0])
    expect(await screen.findByRole('alert')).toHaveTextContent(/changed elsewhere/)
    expect(screen.queryByText('Review failed session')).not.toBeInTheDocument()
    expect(updateDreamerPlan).toHaveBeenCalledTimes(1)
  })

  it('shows unavailable and failed-run states explicitly', async () => {
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, available: false, lastError: 'Dreamer storage is unavailable.' })
    render(<DreamerSettings />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Dreamer storage is unavailable.')
    expect(screen.queryByRole('button', { name: 'Save Dreamer' })).not.toBeInTheDocument()
  })

  it('keeps a retained plan read-only when storage becomes unavailable', async () => {
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, available: false, lastError: 'Dreamer storage is unavailable.' })
    render(<DreamerMorningPlan />)
    fireEvent.click(await screen.findByText('Morning plan'))
    expect(screen.getAllByRole('button', { name: 'Done' })[0]).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move Review failed session down' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Dreamer storage is unavailable.')
  })

  it('updates an already open morning view after settings enable Dreamer', async () => {
    render(<><DreamerSettings /><DreamerMorningPlan /></>)
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable Dreamer' }))
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(saveDreamerSettings).mockResolvedValue(ready)
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    fireEvent.click(await screen.findByText('Morning plan'))
    expect(await screen.findByText('Review failed session')).toBeInTheDocument()
  })

  it('refreshes overnight plans while Oracle stays open without executing an action', async () => {
    vi.useFakeTimers()
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, plan: undefined })
    render(<DreamerMorningPlan />)
    await act(async () => undefined)
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, revision: 4 })
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })
    expect(screen.getByText('Review failed session')).toBeInTheDocument()
    expect(updateDreamerPlan).not.toHaveBeenCalled()
  })

  it('does not replace a saved edit with an older delayed refresh response', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    render(<DreamerMorningPlan />)
    fireEvent.click(await screen.findByText('Morning plan'))
    let release!: (snapshot: typeof ready) => void
    vi.mocked(getDreamer).mockImplementationOnce(() => new Promise((resolve) => { release = resolve }))
    fireEvent.click(screen.getByRole('button', { name: 'Refresh morning plan' }))
    vi.mocked(updateDreamerPlan).mockResolvedValue({
      ...ready, revision: 4, plan: { ...plan, items: [{ ...plan.items[0], status: 'done' }, plan.items[1]] },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0])
    await screen.findByRole('button', { name: 'Restore Review failed session' })
    await act(async () => { release(ready) })
    expect(screen.getByRole('button', { name: 'Restore Review failed session' })).toBeInTheDocument()
  })

  it('locks stale edits after 503 and clears the error only after successful refresh', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockRejectedValue(new DreamerApiError('Storage offline.', 503))
    render(<DreamerMorningPlan />)
    fireEvent.click(await screen.findByText('Morning plan'))
    fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0])
    expect(await screen.findByRole('alert')).toHaveTextContent('Storage offline.')
    expect(screen.getAllByRole('button', { name: 'Done' })[0]).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh morning plan' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getAllByRole('button', { name: 'Done' })[0]).toBeEnabled()
  })
})
