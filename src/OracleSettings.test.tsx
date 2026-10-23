// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getManager, updateManagerSettings } from './api'
import type { RuntimeModelOption } from '../shared/contracts'
import { OracleModelSettings, OracleSettingsStatus } from './OracleSettings'
import { useOracleSettings } from './use-oracle-settings'

type HarnessProps = Omit<Parameters<typeof OracleModelSettings>[0], 'oracle'> & {
  computers?: { id: string; name: string }[]
}

/** Oracle's settings as App settings places them: the model with the models, folders with the folders. */
function OracleSettings({ computers = [], ...props }: HarnessProps) {
  const oracle = useOracleSettings()
  return (
    <>
      <OracleModelSettings oracle={oracle} {...props} />
      {computers.length && oracle.settings ? (
        <section aria-label="Folders">
          {computers.map((computer) => (
            <div data-testid={`folder-${computer.id}`} key={computer.id}>
              <span>{oracle.settings?.sessionFolders?.[computer.id] ?? 'default'}</span>
              <button onClick={() => void oracle.saveFolder(computer.id, '/home/me/src/next')} type="button">Choose for {computer.name}</button>
              <button onClick={() => void oracle.saveFolder(computer.id)} type="button">Clear for {computer.name}</button>
            </div>
          ))}
          <OracleSettingsStatus oracle={oracle} part="folders" />
        </section>
      ) : null}
    </>
  )
}

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

  it("says when the hub's models cannot be read and retries them", async () => {
    const onRetryModels = vi.fn()
    const view = render(<OracleSettings modelsError="Copilot runtime is restarting" onRetryModels={onRetryModels} />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Could not load the hub's models: Copilot runtime is restarting")
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetryModels).toHaveBeenCalledTimes(1)
    view.rerender(<OracleSettings models={models} onRetryModels={onRetryModels} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'GPT-6 Sol' })).toBeInTheDocument()
  })

  it("names the hub's default model when it is the one that could not start", async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { defaultModel: 'env-model', modelUnavailable: true },
    })
    render(<OracleSettings models={models} />)
    expect(await screen.findByText(/env-model could not start/)).toBeInTheDocument()
  })

  it('keeps where Oracle starts sessions, per computer, on the hub', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { sessionFolders: { hub: '/home/me/src/oracle' } },
    })
    vi.mocked(updateManagerSettings)
      .mockResolvedValueOnce({ sessionFolders: { hub: '/home/me/src/next' } })
      .mockResolvedValueOnce({})
    const computers = [
      { id: 'hub', name: 'development', isLocal: true, online: true },
      { id: 'node', name: 'production', isLocal: false, online: true },
    ]
    render(<OracleSettings computers={computers} models={models} />)
    expect(await screen.findByTestId('folder-hub')).toHaveTextContent('/home/me/src/oracle')
    expect(screen.getByTestId('folder-node')).toHaveTextContent('default')
    fireEvent.click(screen.getByRole('button', { name: 'Choose for development' }))
    await waitFor(() => expect(updateManagerSettings).toHaveBeenCalledWith({ sessionFolders: { hub: '/home/me/src/next' } }))
    // The result shows with the folders, not with the model.
    const folders = screen.getByRole('region', { name: 'Folders' })
    expect(await within(folders).findByText('Saved. Oracle starts new sessions there.')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Oracle settings' })).queryByRole('status')).toBeNull()
    expect(screen.getByTestId('folder-hub')).toHaveTextContent('/home/me/src/next')
    fireEvent.click(screen.getByRole('button', { name: 'Clear for development' }))
    await waitFor(() => expect(updateManagerSettings).toHaveBeenLastCalledWith({ sessionFolders: { hub: null } }))
    await waitFor(() => expect(screen.getByTestId('folder-hub')).toHaveTextContent('default'))
    expect(within(folders).getByText('Saved. Oracle uses your folder for new sessions there.')).toBeInTheDocument()
  })

  it('opens Oracle\'s sessions with the Copilot SDK by default and lets you choose a terminal', async () => {
    vi.mocked(updateManagerSettings)
      .mockResolvedValueOnce({ defaultModel: 'hub-default', sessionBackend: 'terminal' })
      .mockResolvedValueOnce({ defaultModel: 'hub-default', sessionBackend: 'sdk' })
    render(<OracleSettings models={models} />)
    const backend = await screen.findByRole('combobox', { name: 'How Oracle opens sessions' })
    // A hub that does not report it opens them with the SDK.
    expect(backend).toHaveValue('sdk')
    expect(screen.getByRole('option', { name: 'Copilot SDK (default)' })).toBeInTheDocument()
    fireEvent.change(backend, { target: { value: 'terminal' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenCalledWith({ sessionBackend: 'terminal' }))
    expect(await screen.findByText('Saved. Oracle opens its next sessions in a terminal.')).toBeInTheDocument()
    expect(backend).toHaveValue('terminal')
    fireEvent.change(backend, { target: { value: 'sdk' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenLastCalledWith({ sessionBackend: 'sdk' }))
    expect(await screen.findByText('Saved. Oracle opens its next sessions with the Copilot SDK.')).toBeInTheDocument()
    expect(backend).toHaveValue('sdk')
  })

  it('shows a model change where the model is chosen', async () => {
    vi.mocked(updateManagerSettings).mockResolvedValueOnce({ model: 'gpt-6-sol', defaultModel: 'hub-default' })
    render(<OracleSettings computers={[{ id: 'hub', name: 'development' }]} models={models} />)
    fireEvent.change(await screen.findByRole('combobox', { name: 'Oracle model' }), { target: { value: 'gpt-6-sol' } })
    const model = screen.getByRole('region', { name: 'Oracle settings' })
    expect(await within(model).findByText('Saved. Oracle uses it from its next answer.')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Folders' })).queryByRole('status')).toBeNull()
  })
})
