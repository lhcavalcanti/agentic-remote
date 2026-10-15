// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getManager, updateManagerSettings } from './api'
import type { RuntimeModelOption } from '../shared/contracts'
import { OracleSettings } from './OracleSettings'

vi.mock('./api', () => ({
  getManager: vi.fn(),
  updateManagerSettings: vi.fn(),
}))

const models: RuntimeModelOption[] = [
  { id: 'gpt-6-sol', name: 'GPT-6 Sol', reasoningEfforts: ['medium', 'high'], contextTiers: ['default'] },
  { id: 'claude-x', name: 'Claude X', reasoningEfforts: [], contextTiers: ['default'] },
]

describe('OracleSettings', () => {
  beforeEach(() => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { defaultModel: 'hub-default' },
    })
    vi.mocked(updateManagerSettings).mockReset()
  })

  afterEach(() => cleanup())

  it("chooses Oracle's model and effort on the hub", async () => {
    vi.mocked(updateManagerSettings)
      .mockResolvedValueOnce({ model: 'gpt-6-sol', defaultModel: 'hub-default' })
      .mockResolvedValueOnce({ model: 'gpt-6-sol', reasoningEffort: 'high', defaultModel: 'hub-default' })
      .mockResolvedValueOnce({ defaultModel: 'hub-default' })
    render(<OracleSettings models={models} />)
    const model = await screen.findByRole('combobox', { name: 'Oracle model' })
    expect(screen.getByRole('option', { name: 'GPT-6 Sol' })).toBeInTheDocument()
    expect(model).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Hub default (hub-default)' })).toBeInTheDocument()

    fireEvent.change(model, { target: { value: 'gpt-6-sol' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenCalledWith({ model: 'gpt-6-sol', reasoningEffort: null }))
    expect(await screen.findByText('Saved. Oracle uses it from its next answer.')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Oracle reasoning effort' }), { target: { value: 'high' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenLastCalledWith({ model: 'gpt-6-sol', reasoningEffort: 'high' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Oracle model' }), { target: { value: '' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenLastCalledWith({ model: null, reasoningEffort: null }))
    await waitFor(() => expect(screen.queryByRole('combobox', { name: 'Oracle reasoning effort' })).not.toBeInTheDocument())
  })

  it('says why when Oracle is not available on the hub', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: false, unavailableReason: 'Oracle is turned off on this hub (AGENTIC_REMOTE_MANAGER=off).',
      status: 'offline', messages: [], queued: 0, managedSessions: [],
    })
    render(<OracleSettings models={models} />)
    expect(await screen.findByText(/turned off on this hub/)).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Oracle model' })).not.toBeInTheDocument()
  })

  it('shows a save failure and a chosen model that could not start', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { model: 'retired-model', modelUnavailable: true },
    })
    vi.mocked(updateManagerSettings).mockRejectedValue(new Error('Origin is not allowed'))
    render(<OracleSettings models={models} />)
    expect(await screen.findByText(/retired-model could not start/)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'retired-model' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'Oracle model' }), { target: { value: 'gpt-6-sol' } })
    expect(await screen.findByRole('alert')).toHaveTextContent('Origin is not allowed')
  })
})
