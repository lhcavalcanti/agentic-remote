// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Schedule, ScheduleRun } from '../../shared/schedules'
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
    path === '/api/schedules' ? { schedules: [schedule] } : path.includes('/runs') ? { runs: [] } : { schedule })
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
  await waitFor(() => expect(request).toHaveBeenCalledTimes(calls + 2))
  unmount()
  act(() => publishFeatureEvent({ type: 'schedules.changed', scheduleId: 'review', revision: 3 }))
  expect(request).toHaveBeenCalledTimes(calls + 2)
})

it('sends only changed fields with the original revision, preserves conflicts and reloads explicitly', async () => {
  const latest = { ...schedule, name: 'Changed remotely', revision: 2 }
  vi.mocked(request).mockImplementation(async (path, init) => {
    if (init?.method === 'PATCH') throw new SubmissionError('Revision conflict', 409)
    if (path === '/api/schedules/review') return { schedule: latest }
    return path === '/api/schedules' ? { schedules: [schedule] } : { runs: [] }
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

it('shows nonterminal and interrupted history without inventing success and opens bound sessions', async () => {
  const statuses = ['launching', 'stopping', 'missed', 'interrupted'] as const
  const runs: ScheduleRun[] = statuses.map((status, index) => ({
    id: String(index), scheduleId: 'review', computerId: 'studio', occurrenceAt: '2026-11-14T18:00:00Z',
    trigger: 'manual', status, launchId: `launch-${index}`, ...(index === 0 ? { sessionId: 'session-one' } : {}),
  }))
  vi.mocked(request).mockImplementation(async (path) => path === '/api/schedules' ? { schedules: [schedule] } : { runs })
  const onOpen = vi.fn()
  render(<SchedulerView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={onOpen} />)
  fireEvent.click(await screen.findByRole('button', { name: 'History for Morning review' }))
  const history = await screen.findByRole('region', { name: 'Run history for Morning review' })
  await waitFor(() => expect(within(history).getByText('interrupted', { exact: true })).toBeTruthy())
  for (const status of statuses) expect(within(history).getByText(status, { exact: true })).toBeTruthy()
  fireEvent.click(within(history).getByRole('button', { name: 'Open session' }))
  expect(onOpen).toHaveBeenCalledWith('studio', 'session-one')
  fireEvent.click(screen.getByRole('button', { name: 'Run Morning review now' }))
  await waitFor(() => expect(request).toHaveBeenCalledWith('/api/schedules/review/run', expect.objectContaining({ method: 'POST', body: '{}' })))
})
