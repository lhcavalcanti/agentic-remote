// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { RuntimeModelOption } from '../../shared/contracts'
import type { ScheduleTarget } from '../../shared/schedules'
import { getProviderRuntimeOptions } from '../api'
import { ScheduleForm, newSchedule } from './ScheduleForm'

vi.mock('../api', () => ({ getProviderRuntimeOptions: vi.fn(), listDirectories: vi.fn() }))
afterEach(cleanup)
const computer = { id: 'studio', name: 'Studio', isLocal: true, online: true }
const definition = { ...newSchedule(computer.id), name: 'Fictional review', prompt: 'Review fictional notes.',
  target: { ...newSchedule(computer.id).target, folder: '/fictional/project' } }
const model: RuntimeModelOption = { id: 'fictional-model', name: 'Fictional model',
  reasoningEfforts: ['medium', 'high'], contextTiers: ['default'], contextTokenLimits: { default: 200_000 } }
const wideModel: RuntimeModelOption = { ...model, id: 'wide-model', name: 'Wide model',
  contextTiers: ['default', 'long_context'], contextTokenLimits: { default: 200_000, long_context: 1_000_000 } }
beforeEach(() => {
  vi.mocked(getProviderRuntimeOptions).mockReset().mockResolvedValue({ models: [model] })
})

it.each([false, true])('keeps worktree roots bound to their computer (retargeted: %s)', async (retargeted) => {
  const other = { ...computer, id: 'other', name: 'Other computer', isLocal: false }
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={{ ...definition, workspace: 'worktree', target: { ...definition.target, worktreeRoot: '/old-computer/worktrees' } }}
    computers={[computer, other]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  if (retargeted) fireEvent.change(screen.getByRole('combobox', { name: 'Computer' }), { target: { value: other.id } })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
  expect(onSave.mock.calls[0][0].target.computerId).toBe(retargeted ? other.id : computer.id)
  expect(onSave.mock.calls[0][0].target.worktreeRoot).toBe(retargeted ? undefined : '/old-computer/worktrees')
})

it.each([
  { provider: 'copilot', effort: 'high' },
  { provider: 'claude', context: 'long_context' },
  { provider: 'copilot', model: 'removed-model' },
  { provider: 'copilot', model: 'fictional-model', effort: 'max' },
  { provider: 'claude', model: 'fictional-model', context: 'long_context' },
] satisfies Partial<ScheduleTarget>[])('requires a compatible model for saved runtime overrides: %j', async (runtime) => {
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={{ ...definition, target: { ...definition.target, ...runtime } }}
    computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  await screen.findByRole('option', { name: 'Fictional model' })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save schedule' })) })
  expect(onSave).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toMatch(/model/i)
})

it('keeps provider defaults free of model-specific options and resets overrides when reselected', async () => {
  vi.mocked(getProviderRuntimeOptions).mockResolvedValue({ models: [wideModel] })
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={definition} computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  await screen.findByRole('option', { name: 'Wide model' })
  const effort = screen.getByRole('combobox', { name: 'Effort' })
  const context = screen.getByRole('combobox', { name: 'Context' })
  expect(effort).toHaveProperty('disabled', false)
  expect(context).toHaveProperty('disabled', false)
  expect(within(effort).getAllByRole('option')).toHaveLength(1)
  expect(within(context).getAllByRole('option')).toHaveLength(1)
  fireEvent.change(screen.getByRole('combobox', { name: 'Model' }), { target: { value: wideModel.id } })
  expect(effort).toHaveProperty('disabled', false)
  expect(context).toHaveProperty('disabled', false)
  fireEvent.change(effort, { target: { value: 'high' } })
  fireEvent.change(context, { target: { value: 'long_context' } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Model' }), { target: { value: '' } })
  expect(effort).toHaveProperty('disabled', false)
  expect(context).toHaveProperty('disabled', false)
  expect(within(effort).getAllByRole('option')).toHaveLength(1)
  expect(within(context).getAllByRole('option')).toHaveLength(1)
  expect(effort).toHaveProperty('value', '')
  expect(context).toHaveProperty('value', 'default')
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
  expect(onSave.mock.calls[0][0].target.model).toBeUndefined()
  expect(onSave.mock.calls[0][0].target.effort).toBeUndefined()
  expect(onSave.mock.calls[0][0].target.context).toBeUndefined()
})

it('labels context choices with each selected model capacity and saves supported explicit overrides', async () => {
  const compact: RuntimeModelOption = { id: 'compact-model', name: 'Compact model',
    reasoningEfforts: [], contextTiers: ['default'], contextTokenLimits: { default: 32_000 } }
  vi.mocked(getProviderRuntimeOptions).mockResolvedValue({ models: [wideModel, compact] })
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={{ ...definition, target: { ...definition.target, model: wideModel.id } }}
    computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  await screen.findByRole('option', { name: 'Wide model' })
  const context = screen.getByRole('combobox', { name: 'Context' })
  expect(within(context).getByRole('option', { name: '200k tokens' })).toBeTruthy()
  expect(within(context).getByRole('option', { name: '1.0m tokens' })).toBeTruthy()
  fireEvent.change(screen.getByRole('combobox', { name: 'Model' }), { target: { value: compact.id } })
  expect(within(context).getByRole('option', { name: '32k tokens' })).toBeTruthy()
  expect(within(context).queryByRole('option', { name: '1.0m tokens' })).toBeNull()
  fireEvent.change(screen.getByRole('combobox', { name: 'Model' }), { target: { value: wideModel.id } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Effort' }), { target: { value: 'high' } })
  fireEvent.change(context, { target: { value: 'long_context' } })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
    target: expect.objectContaining({ model: wideModel.id, effort: 'high', context: 'long_context' }),
  })))
})

it('uses the runtime Automatic fallback when a model has no advertised token limit', async () => {
  vi.mocked(getProviderRuntimeOptions).mockResolvedValue({ models: [{ ...model, contextTokenLimits: undefined }] })
  render(<ScheduleForm initial={{ ...definition, target: { ...definition.target, model: model.id } }}
    computers={[computer]} pending={false} onSave={vi.fn()} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  await screen.findByRole('option', { name: 'Fictional model' })
  expect(within(screen.getByRole('combobox', { name: 'Context' })).getByRole('option', { name: 'Automatic' })).toBeTruthy()
})

it.each([undefined, 'default'] as const)('saves provider-default context %s without creating a runtime override', async (context) => {
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={{ ...definition, target: { ...definition.target, context } }}
    computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
  expect(onSave.mock.calls[0][0].target.model).toBeUndefined()
  expect(onSave.mock.calls[0][0].target.context).toBeUndefined()
})

it.each([
  { effort: 'high' },
  { context: 'long_context' },
  { effort: 'high', context: 'long_context' },
] satisfies Partial<ScheduleTarget>[])('can reset stored runtime leftovers without a model or catalog: %j', async (runtime) => {
  vi.mocked(getProviderRuntimeOptions).mockRejectedValue(new Error('Catalog offline'))
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={{ ...definition, target: { ...definition.target, ...runtime } }}
    computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  await screen.findByText(/Runtime options could not be verified/)
  fireEvent.click(screen.getByRole('button', { name: 'Target' }))
  const effort = screen.getByRole('combobox', { name: 'Effort' })
  const context = screen.getByRole('combobox', { name: 'Context' })
  expect(effort).toHaveProperty('disabled', false)
  expect(context).toHaveProperty('disabled', false)
  if ('effort' in runtime) expect(within(effort).getByRole('option', { name: 'high (needs a model)' })).toBeTruthy()
  if ('context' in runtime) expect(within(context).getByRole('option', { name: 'long_context (needs a model)' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save schedule' })) })
  expect(onSave).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toMatch(/model/i)
  fireEvent.change(effort, { target: { value: '' } })
  fireEvent.change(context, { target: { value: 'default' } })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
  expect(onSave.mock.calls[0][0].target.effort).toBeUndefined()
  expect(onSave.mock.calls[0][0].target.context).toBeUndefined()
})

it.each(['loading', 'error', 'offline'] as const)('allows other edits while the catalog is %s', async (state) => {
  if (state === 'loading') vi.mocked(getProviderRuntimeOptions).mockReturnValue(new Promise<{ models: RuntimeModelOption[] }>(() => {}))
  else vi.mocked(getProviderRuntimeOptions).mockRejectedValue(new Error('Catalog offline'))
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={{ ...definition, target: { ...definition.target, model: 'saved-model', effort: 'high', context: 'long_context' } }}
    computers={[{ ...computer, online: state !== 'offline' }]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  await screen.findByText(state === 'loading' ? /Runtime options could not yet be verified/ : /Runtime options could not be verified: Catalog offline/)
  fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Renamed while catalog unavailable' } })
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Renamed while catalog unavailable',
    target: expect.objectContaining({ model: 'saved-model', effort: 'high', context: 'long_context' }),
  })))
  expect(screen.queryByRole('alert')).toBeNull()
})

it('treats a successfully loaded empty catalog as authoritative rather than unavailable', async () => {
  vi.mocked(getProviderRuntimeOptions).mockResolvedValue({ models: [] })
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<ScheduleForm initial={{ ...definition, target: { ...definition.target, model: 'removed-model' } }}
    computers={[computer]} pending={false} onSave={onSave} onCancel={vi.fn()} />)
  await act(async () => {})
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save schedule' })) })
  expect(onSave).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toMatch(/model/i)
})
