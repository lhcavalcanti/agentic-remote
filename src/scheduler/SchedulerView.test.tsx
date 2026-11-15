// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Schedule, ScheduleRun } from '../../shared/schedules'
import type { ScheduleProposal } from '../../shared/schedule-proposals'
import { SubmissionError } from '../../shared/submission-error'
import { getProviderRuntimeOptions, listDirectories, request } from '../api'
import { publishFeatureEvent } from '../features/events'
import { ScheduleForm, newSchedule } from './ScheduleForm'
import { SchedulerView } from './SchedulerView'
import { scheduleError } from './format'
import { useScheduler } from './use-scheduler'

vi.mock('../api', () => ({ request: vi.fn(), getProviderRuntimeOptions: vi.fn(), listDirectories: vi.fn() }))
afterEach(cleanup)
const computer = { id: 'studio', name: 'Fictional Studio', isLocal: true, online: true }
const definition = { ...newSchedule('studio'), name: 'Morning review', prompt: 'Review fictional notes.', target: { ...newSchedule('studio').target, folder: '/fictional' } }
const schedule: Schedule = { ...definition, id: 'review', revision: 1, archived: false, createdBy: 'user',
  createdAt: '2026-11-14T18:00:00Z', updatedAt: '2026-11-14T18:00:00Z' }
beforeEach(() => {
  vi.mocked(request).mockReset()
  vi.mocked(getProviderRuntimeOptions).mockResolvedValue({ models: [{
    id: 'fictional-model', name: 'Fictional model', reasoningEfforts: ['medium', 'high'], contextTiers: ['default'],
  }] })
  vi.mocked(listDirectories).mockResolvedValue({ path: '/fictional', directories: [{ name: 'notes', path: '/fictional/notes' }] })
  vi.mocked(request).mockImplementation(async (path) =>
    path === '/api/schedules/proposals' ? { proposals: [] } : path === '/api/schedules' ? { schedules: [schedule] } : path.includes('/runs') ? { runs: [] } : { schedule })
})

it('defaults to Ask, previews five occurrences and requires explicit Allow-all confirmation', async () => {
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={definition} computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  expect(within(screen.getByRole('region', { name: 'Next five occurrences' })).getAllByRole('listitem')).toHaveLength(5)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  await screen.findByRole('option', { name: 'Fictional model' })
  fireEvent.click(screen.getByRole('button', { name: 'Browse folders' }))
  await screen.findByRole('button', { name: 'Use this folder' })
  fireEvent.click(screen.getByRole('button', { name: 'Use this folder' }))
  expect(screen.getByRole('textbox', { name: 'Folder' })).toHaveProperty('value', '/fictional')
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  const permissions = screen.getByRole('combobox', { name: 'Permission policy' })
  expect(permissions).toHaveProperty('value', 'ask')
  fireEvent.change(permissions, { target: { value: 'allow-all' } })
  expect(screen.getByRole('button', { name: 'Save schedule' })).toHaveProperty('disabled', true)
  fireEvent.click(screen.getByRole('checkbox', { name: /I explicitly allow all tool permissions/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
    target: expect.objectContaining({ permissionPolicy: 'allow-all', folderTrust: 'ask' }), workspace: 'checkout',
  })))
})

it('offers every recurrence preset and rejects too-frequent schedules before sending', async () => {
  const onSave = vi.fn()
  render(<ScheduleForm initial={definition} computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  const recurrence = screen.getByRole('combobox', { name: 'Recurrence' })
  for (const [value, field] of [['once', 'Once at (ISO timestamp with offset)'], ['hourly', 'Every N hours'], ['daily', 'Local time'], ['weekdays', 'Local time'], ['weekly', 'Local time'], ['cron', 'Cron expression (5 fields)']]) {
    fireEvent.change(recurrence, { target: { value } })
    expect(screen.getByLabelText(field!)).toBeTruthy()
  }
  fireEvent.change(screen.getByRole('textbox', { name: 'Cron expression (5 fields)' }), { target: { value: '* * * * *' } })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await screen.findByRole('alert')
  expect(onSave).not.toHaveBeenCalled()
})

it('refreshes live schedule invalidations only when enabled', async () => {
  const { result, rerender, unmount } = renderHook(({ enabled }) => useScheduler(enabled), { initialProps: { enabled: false } })
  expect(request).not.toHaveBeenCalled()
  rerender({ enabled: true })
  await waitFor(() => expect(result.current.schedules).toHaveLength(1))
  const calls = vi.mocked(request).mock.calls.length
  act(() => publishFeatureEvent({ type: 'schedules.changed', scheduleId: 'review', revision: 2 }))
  await waitFor(() => expect(request).toHaveBeenCalledTimes(calls + 3))
  unmount()
  act(() => publishFeatureEvent({ type: 'schedules.changed', scheduleId: 'review', revision: 3 }))
  await result.current.refresh()
  expect(request).toHaveBeenCalledTimes(calls + 3)
})

it('refreshes the current history after a mutation callback outlives a selection change', async () => {
  vi.mocked(request).mockImplementation(async (path) => path === '/api/schedules/proposals' ? { proposals: [] } : path === '/api/schedules' ? { schedules: [schedule] } : {
    runs: [{ id: 'one', scheduleId: path.includes('/first/') ? 'first' : 'second', computerId: 'studio',
      occurrenceAt: '2026-11-14T18:00:00Z', trigger: 'manual', status: 'running', launchId: 'launch-one' }],
  })
  const { result, rerender } = renderHook(({ historyId }) => useScheduler(true, historyId), { initialProps: { historyId: 'first' } })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.history[0]?.scheduleId).toBe('first')
  const capturedRefresh = result.current.refresh
  rerender({ historyId: 'second' })
  expect(result.current.history).toEqual([])
  await waitFor(() => expect(request).toHaveBeenCalledWith('/api/schedules/second/runs?limit=200', expect.anything()))
  vi.mocked(request).mockClear()
  await act(() => capturedRefresh())
  expect(request).toHaveBeenCalledWith('/api/schedules/second/runs?limit=200', expect.anything())
  expect(vi.mocked(request).mock.calls.some(([path]) => path.includes('/first/runs'))).toBe(false)
})

it('sends only changed fields with the original revision, preserves conflicts and reloads explicitly', async () => {
  const historical = { ...schedule, recurrence: { type: 'once' as const, at: '2020-01-01T00:00:00Z' } }
  const latest = { ...historical, name: 'Changed remotely', revision: 2 }
  vi.mocked(request).mockImplementation(async (path, init) => {
    if (init?.method === 'PATCH') throw new SubmissionError('Revision conflict', 409)
    if (path === '/api/schedules/review') return { schedule: latest }
    if (path === '/api/schedules/proposals') return { proposals: [] }
    return path === '/api/schedules' ? { schedules: [historical] } : { runs: [] }
  })
  render(<SchedulerView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Edit Morning review' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Local draft' } })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(screen.getAllByRole('alert')[0].textContent).toContain('Conflict'))
  const mutation = vi.mocked(request).mock.calls.find(([, init]) => init?.method === 'PATCH')!
  expect(JSON.parse(mutation[1]!.body as string)).toEqual({ name: 'Local draft', revision: 1 })
  fireEvent.click(screen.getByRole('button', { name: 'Details' }))
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveProperty('value', 'Local draft')
  fireEvent.click(screen.getByRole('button', { name: 'Reload latest (replace draft)' }))
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveProperty('value', 'Changed remotely'))
  expect(scheduleError(new SubmissionError('Revision conflict', 409))).toContain('Your draft is preserved')
})

it('keeps unavailable model settings visible rather than silently displaying another value', async () => {
  const initial = { ...definition, target: { ...definition.target, model: 'fictional-model', effort: 'max' as const, context: 'long_context' as const } }
  render(<ScheduleForm initial={initial} computers={[computer]} pending={false} onSave={vi.fn()} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  await screen.findByRole('option', { name: 'max (not in current catalog)' })
  expect(screen.getByRole('combobox', { name: 'Effort' })).toHaveProperty('value', 'max')
  expect(screen.getByRole('combobox', { name: 'Context' })).toHaveProperty('value', 'long_context')
})

it('revision-checks toggles and archive actions and starts duplicate definitions paused', async () => {
  render(<SchedulerView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable Morning review' }))
  await waitFor(() => expect(request).toHaveBeenCalledWith('/api/schedules/review/enabled', expect.objectContaining({
    method: 'POST', body: JSON.stringify({ revision: 1, enabled: false }),
  })))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Duplicate Morning review' })).toHaveProperty('disabled', false))
  fireEvent.click(screen.getByRole('button', { name: 'Duplicate Morning review' }))
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  expect(screen.getByRole('checkbox', { name: 'Enabled after save' })).toHaveProperty('checked', false)
  fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }))
  fireEvent.click(screen.getByRole('button', { name: 'Archive Morning review' }))
  await waitFor(() => expect(request).toHaveBeenCalledWith('/api/schedules/review/archived', expect.objectContaining({
    method: 'POST', body: JSON.stringify({ revision: 1, archived: true }),
  })))
})

it('shows nonterminal and interrupted history without inventing success and opens bound sessions', async () => {
  const statuses = ['launching', 'stopping', 'missed', 'interrupted'] as const
  const runs: ScheduleRun[] = statuses.map((status, index) => ({
    id: String(index), scheduleId: 'review', computerId: 'studio', occurrenceAt: '2026-11-14T18:00:00Z',
    trigger: 'manual', status, launchId: `launch-${index}`, ...(index === 0 ? { sessionId: 'session-one' } : {}),
  }))
  vi.mocked(request).mockImplementation(async (path) => path === '/api/schedules/proposals' ? { proposals: [] } : path === '/api/schedules' ? { schedules: [schedule] } : { runs })
  const onOpen = vi.fn()
  render(<SchedulerView computers={[computer]} enabled initialScheduleId="review" initialRunId="0" onClose={vi.fn()} onOpenSession={onOpen} />)
  const history = await screen.findByRole('region', { name: 'Run history for Morning review' })
  await waitFor(() => expect(within(history).getByText('interrupted', { exact: true })).toBeTruthy())
  for (const status of statuses) expect(within(history).getByText(status, { exact: true })).toBeTruthy()
  expect(history.querySelector('li[data-linked="true"]')?.textContent).toContain('launching')
  fireEvent.click(within(history).getByRole('button', { name: 'Open session' }))
  expect(onOpen).toHaveBeenCalledWith('studio', 'session-one')
  fireEvent.click(screen.getByRole('button', { name: 'Run Morning review now' }))
  await waitFor(() => expect(request).toHaveBeenCalledWith('/api/schedules/review/run', expect.objectContaining({ method: 'POST', body: '{}' })))
})

it('shows pending Oracle proposals without approving them and refreshes approval invalidations', async () => {
  const proposal: ScheduleProposal = { id: 'proposal-one', operation: 'create', payload: { ...definition, name: 'Suggested review' },
    createdBy: 'oracle', status: 'pending', createdAt: '2026-11-14T18:00:00Z', expiresAt: '2030-01-01T00:00:00Z' }
  let pending = true
  vi.mocked(request).mockImplementation(async (path) => path === '/api/schedules/proposals'
    ? { proposals: pending ? [proposal] : [] } : path === '/api/schedules' ? { schedules: [schedule] } : { runs: [] })
  const onOpenOracle = vi.fn()
  render(<SchedulerView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} onOpenOracle={onOpenOracle} />)
  const proposals = await screen.findByRole('region', { name: 'Pending Oracle proposals' })
  expect(proposals.textContent).toContain('Suggested review')
  fireEvent.click(within(proposals).getByRole('button', { name: 'Review in Oracle' }))
  expect(onOpenOracle).toHaveBeenCalledOnce()
  expect(vi.mocked(request).mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
  pending = false
  act(() => publishFeatureEvent({ type: 'schedule-proposals.changed', revision: 2, proposalId: proposal.id }))
  await waitFor(() => expect(screen.queryByRole('region', { name: 'Pending Oracle proposals' })).toBeNull())
})

it('keeps schedule management available on hubs without the optional proposal API', async () => {
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/api/schedules/proposals') throw new SubmissionError('Not found', 404)
    return path === '/api/schedules' ? { schedules: [schedule] } : { runs: [] }
  })
  render(<SchedulerView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  expect(await screen.findByRole('button', { name: 'Edit Morning review' })).toBeTruthy()
  expect(screen.queryByRole('region', { name: 'Pending Oracle proposals' })).toBeNull()
  expect(screen.queryByRole('alert')).toBeNull()
})

it.each([
  'A non-archived schedule already has this name',
  'Archived schedules cannot run',
  'At most 20 active Oracle-created schedules are allowed',
])('preserves the actual non-revision conflict reason: %s', (reason) => {
  const message = scheduleError(new SubmissionError(reason, 409))
  expect(message).toContain(reason)
  expect(message).not.toContain('Reload')
  expect(message).not.toContain('changed on the hub')
})

it.each([404, 503])('retains the schedule list when selected history returns %s', async (status) => {
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/api/schedules/proposals') return { proposals: [] }
    if (path === '/api/schedules') return { schedules: [schedule] }
    if (path.includes('/deleted/runs')) throw new SubmissionError(status === 404 ? 'Schedule not found' : 'Temporarily unavailable', status)
    return { runs: [] }
  })
  render(<SchedulerView computers={[computer]} enabled initialScheduleId="deleted" onClose={vi.fn()} onOpenSession={vi.fn()} />)
  expect(await screen.findByRole('button', { name: 'Edit Morning review' })).toBeTruthy()
  expect(await screen.findByText(status === 404 ? /This schedule no longer exists/ : /Run history is unavailable/)).toBeTruthy()
  expect(screen.queryByText('No schedules yet. Create a saved prompt to get started.')).toBeNull()
  expect(screen.queryByRole('alert')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Show all schedules' }))
  await waitFor(() => expect(screen.queryByText(/This schedule no longer exists|Run history is unavailable/)).toBeNull())
})

it.each([false, true])('requires explicit reselection of an unpaired target (removed while editing: %s)', async (removedWhileEditing) => {
  const onSave = vi.fn().mockResolvedValue(undefined)
  const retired = { ...computer, id: 'retired-node', name: 'Retired node', isLocal: false }
  const initial = { ...definition, target: { ...definition.target, computerId: retired.id } }
  const props = { initial, pending: false, onSave, onCancel: vi.fn() }
  const { rerender, container } = render(<ScheduleForm {...props} computers={removedWhileEditing ? [computer, retired] : [computer]} />)
  if (removedWhileEditing) rerender(<ScheduleForm {...props} computers={[computer]} />)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  const target = screen.getByRole('combobox', { name: 'Computer' })
  expect(target).toHaveProperty('value', retired.id)
  expect(screen.getByRole('option', { name: 'retired-node (not paired)' })).toHaveProperty('selected', true)
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  expect(screen.getByRole('button', { name: 'Save schedule' })).toHaveProperty('disabled', true)
  await act(async () => { fireEvent.submit(container.querySelector('form')!) })
  expect(onSave).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toContain('Choose a paired computer')
  fireEvent.change(screen.getByRole('combobox', { name: 'Computer' }), { target: { value: computer.id } })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    target: expect.objectContaining({ computerId: computer.id }),
  })))
})

it.each([true, false])('clears the linked run when opening another schedule history (run retained: %s)', async (retained) => {
  const other = { ...schedule, id: 'other', name: 'Other review' }
  const run: ScheduleRun = { id: 'linked-run', scheduleId: schedule.id, computerId: computer.id,
    occurrenceAt: '2026-11-14T18:00:00Z', trigger: 'manual', status: 'succeeded', launchId: 'linked-launch' }
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/api/schedules/proposals') return { proposals: [] }
    if (path === '/api/schedules') return { schedules: [schedule, other] }
    return { runs: path.includes('/review/runs') && retained ? [run] : [] }
  })
  render(<SchedulerView computers={[computer]} enabled initialScheduleId={schedule.id} initialRunId={run.id}
    onClose={vi.fn()} onOpenSession={vi.fn()} />)
  const initialHistory = await screen.findByRole('region', { name: 'Run history for Morning review' })
  await waitFor(() => expect(within(initialHistory).queryByText('Loading run history…')).toBeNull())
  if (retained) expect(initialHistory.querySelectorAll('li[data-linked="true"]')).toHaveLength(1)
  else expect(within(initialHistory).getByText('The linked run is no longer in retained history.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'History for Other review' }))
  const otherHistory = await screen.findByRole('region', { name: 'Run history for Other review' })
  await within(otherHistory).findByText('No runs yet.')
  expect(screen.queryByText('The linked run is no longer in retained history.')).toBeNull()
  expect(otherHistory.querySelectorAll('li[data-linked="true"]')).toHaveLength(0)
  fireEvent.click(screen.getByRole('button', { name: 'History for Morning review' }))
  const returnedHistory = await screen.findByRole('region', { name: 'Run history for Morning review' })
  await waitFor(() => expect(within(returnedHistory).queryByText('Loading run history…')).toBeNull())
  expect(returnedHistory.querySelectorAll('li[data-linked="true"]')).toHaveLength(0)
  expect(screen.queryByText('The linked run is no longer in retained history.')).toBeNull()
})

it('keeps management usable when recent-run enrichment fails and clears the warning on recovery', async () => {
  let recentUnavailable = true
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/api/schedules/proposals') return { proposals: [] }
    if (path === '/api/schedules') return { schedules: [schedule] }
    if (path === '/api/schedules/runs?limit=200' && recentUnavailable) throw new SubmissionError('Temporary recent-run outage', 503)
    return { runs: [] }
  })
  render(<SchedulerView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  expect(await screen.findByRole('button', { name: 'Run Morning review now' })).toBeTruthy()
  expect(screen.getByRole('status').textContent).toContain('Recent runs are unavailable: Temporary recent-run outage')
  expect(screen.getByText('Recent run unavailable')).toBeTruthy()
  expect(screen.queryByText('No recent run')).toBeNull()
  expect(screen.queryByRole('alert')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Run Morning review now' }))
  await waitFor(() => expect(request).toHaveBeenCalledWith('/api/schedules/review/run', expect.objectContaining({ method: 'POST' })))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Morning review' })).toHaveProperty('disabled', false))
  recentUnavailable = false
  act(() => publishFeatureEvent({ type: 'schedules.changed', scheduleId: 'review', revision: 2 }))
  await waitFor(() => expect(screen.queryByText(/Recent runs are unavailable/)).toBeNull())
  expect(screen.getByText('No recent run')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Edit Morning review' }))
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveProperty('value', 'Morning review')
})

it('keeps schedule-list failures at the top level', async () => {
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === '/api/schedules/proposals') return { proposals: [] }
    if (path === '/api/schedules') throw new SubmissionError('Schedule list unavailable', 503)
    return { runs: [] }
  })
  render(<SchedulerView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  expect((await screen.findByRole('alert')).textContent).toContain('Schedule list unavailable')
  expect(screen.queryByRole('button', { name: 'Edit Morning review' })).toBeNull()
  expect(screen.queryByText(/Recent runs are unavailable/)).toBeNull()
})

it('ignores aborted recent-run enrichment after a newer refresh', async () => {
  let rejectOldRecent!: (error: Error) => void
  let firstSignal: AbortSignal | undefined
  let recentRequests = 0
  let listRequests = 0
  const freshRun: ScheduleRun = { id: 'fresh-run', scheduleId: schedule.id, computerId: computer.id,
    occurrenceAt: '2026-11-15T18:00:00Z', trigger: 'manual', status: 'succeeded', launchId: 'fresh-launch' }
  vi.mocked(request).mockImplementation(async (path, init) => {
    if (path === '/api/schedules/proposals') return { proposals: [] }
    if (path === '/api/schedules') return { schedules: [{ ...schedule, name: ++listRequests === 1 ? 'Old list' : 'Fresh list' }] }
    if (path === '/api/schedules/runs?limit=200' && ++recentRequests === 1) {
      firstSignal = init?.signal ?? undefined
      return new Promise<{ runs: ScheduleRun[] }>((_resolve, reject) => { rejectOldRecent = reject })
    }
    return { runs: [freshRun] }
  })
  const { result } = renderHook(() => useScheduler(true))
  await waitFor(() => expect(firstSignal).toBeDefined())
  await act(async () => { await result.current.refresh() })
  expect(firstSignal?.aborted).toBe(true)
  expect(result.current.schedules[0]?.name).toBe('Fresh list')
  expect(result.current.recent).toEqual([freshRun])
  await act(async () => { rejectOldRecent(new DOMException('Aborted', 'AbortError')) })
  expect(result.current.schedules[0]?.name).toBe('Fresh list')
  expect(result.current.recent).toEqual([freshRun])
  expect(result.current.error).toBeUndefined()
  expect(result.current.recentError).toBeUndefined()
  expect(result.current.loading).toBe(false)
})
