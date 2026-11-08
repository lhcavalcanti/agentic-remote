// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getManager, updateManagerSettings } from './api'
import type { RuntimeModelOption } from '../shared/contracts'
import {
  OracleModelSettings,
  OracleProactiveSettings,
  OracleSettingsStatus,
} from './OracleSettings'
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
      <OracleProactiveSettings oracle={oracle} />
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
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { defaultModel: 'hub-default', sessionBackend: 'sdk' },
    })

    vi.mocked(updateManagerSettings)
      .mockResolvedValueOnce({ defaultModel: 'hub-default', sessionBackend: 'terminal' })
      .mockResolvedValueOnce({ defaultModel: 'hub-default', sessionBackend: 'sdk' })
    render(<OracleSettings models={models} />)
    const backend = await screen.findByRole('combobox', { name: 'How Oracle opens sessions' })
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

  it('configures and pauses read-only periodic checks on the hub', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: {
        proactive: {
          enabled: false,
          cadenceMinutes: 120,
          timeZone: 'UTC',
          quietStartHour: 22,
          quietEndHour: 7,
        },
      },
    })
    vi.mocked(updateManagerSettings)
      .mockResolvedValueOnce({
        proactive: {
          enabled: true,
          cadenceMinutes: 240,
          timeZone: 'Europe/Berlin',
          quietStartHour: 23,
          quietEndHour: 8,
          nextCheckAt: '2026-11-05T07:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        proactive: {
          enabled: false,
          cadenceMinutes: 240,
          timeZone: 'Europe/Berlin',
          quietStartHour: 23,
          quietEndHour: 8,
          latestCheckAt: '2026-11-04T12:00:00.000Z',
          latestCheckState: 'done',
        },
      })
    render(<OracleSettings models={models} />)

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable periodic checks' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Periodic check cadence' }), {
      target: { value: '240' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Periodic check timezone' }), {
      target: { value: 'Europe/Berlin' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Quiet hours start' }), {
      target: { value: '23' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Quiet hours end' }), {
      target: { value: '8' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save periodic checks' }))

    await waitFor(() => expect(updateManagerSettings).toHaveBeenCalledWith({
      proactive: {
        enabled: true,
        cadenceMinutes: 240,
        timeZone: 'Europe/Berlin',
        quietStartHour: 23,
        quietEndHour: 8,
      },
    }))
    expect(await screen.findByText(/Next check:/)).toHaveTextContent(
      '2026-11-05T07:00:00.000Z',
    )
    expect(screen.getByText('Periodic checks saved.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable periodic checks' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save periodic checks' }))
    await waitFor(() => expect(updateManagerSettings).toHaveBeenLastCalledWith({
      proactive: {
        enabled: false,
        cadenceMinutes: 240,
        timeZone: 'Europe/Berlin',
        quietStartHour: 23,
        quietEndHour: 8,
      },
    }))
    expect(await screen.findByText('Periodic checks paused.')).toBeInTheDocument()
  })

  it('does not offer the choice on a hub from before it, which opens terminals', async () => {
    render(<OracleSettings models={models} />)
    expect(await screen.findByText("This hub opens Oracle's sessions in a terminal. Update it to choose the Copilot SDK.")).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'How Oracle opens sessions' })).toBeNull()
    expect(screen.queryByRole('combobox', { name: "Closing Oracle's sessions" })).toBeNull()
  })

  it('asks before Oracle closes a session by default and lets you allow it for idle sessions Oracle started', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { sessionClosePolicy: 'ask' },
    })
    vi.mocked(updateManagerSettings)
      .mockResolvedValueOnce({ sessionClosePolicy: 'oracle-started' })
      .mockResolvedValueOnce({ sessionClosePolicy: 'ask' })
      .mockResolvedValueOnce({})
    render(<OracleSettings models={models} />)
    const policy = await screen.findByRole('combobox', { name: "Closing Oracle's sessions" })
    expect(policy).toHaveValue('ask')
    expect(screen.getByRole('option', { name: 'Ask me every time (default)' })).toBeInTheDocument()
    // Short enough for a phone to show the whole choice in the closed select.
    expect(screen.getByRole('option', { name: 'Close idle ones without asking' })).toBeInTheDocument()
    fireEvent.change(policy, { target: { value: 'oracle-started' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenCalledWith({ sessionClosePolicy: 'oracle-started' }))
    expect(await screen.findByText('Saved. Oracle closes idle sessions it started without asking.')).toBeInTheDocument()
    expect(policy).toHaveValue('oracle-started')
    fireEvent.change(policy, { target: { value: 'ask' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenLastCalledWith({ sessionClosePolicy: 'ask' }))
    expect(await screen.findByText('Saved. Oracle asks before closing any session.')).toBeInTheDocument()

    // A hub rolled back mid-change answers without the setting.
    fireEvent.change(policy, { target: { value: 'oracle-started' } })
    expect(await screen.findByText('This hub did not keep that choice; update it to let Oracle close sessions without asking.')).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: "Closing Oracle's sessions" })).toBeNull()
  })

  it('does not report Ask as saved by a rolled-back hub, which keeps the earlier opt-in', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { sessionClosePolicy: 'oracle-started' },
    })
    // A hub from before the setting drops it and answers without it.
    vi.mocked(updateManagerSettings).mockResolvedValueOnce({})
    render(<OracleSettings models={models} />)
    fireEvent.change(await screen.findByRole('combobox', { name: "Closing Oracle's sessions" }), { target: { value: 'ask' } })
    await waitFor(() => expect(updateManagerSettings).toHaveBeenCalledWith({ sessionClosePolicy: 'ask' }))
    expect(await screen.findByText('This hub did not keep that choice; update it, then choose again, or Oracle goes back to closing idle sessions without asking.')).toBeInTheDocument()
    expect(screen.queryByText('Saved. Oracle asks before closing any session.')).toBeNull()
  })

  it('says so when the hub does not keep the choice, rather than that it saved', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      settings: { sessionBackend: 'terminal' },
    })
    // A hub rolled back mid-change answers without the setting.
    vi.mocked(updateManagerSettings).mockResolvedValueOnce({})
    render(<OracleSettings models={models} />)
    fireEvent.change(await screen.findByRole('combobox', { name: 'How Oracle opens sessions' }), { target: { value: 'sdk' } })
    expect(await screen.findByText('This hub did not keep that choice; update it to choose how Oracle opens sessions.')).toBeInTheDocument()
    expect(screen.queryByText('Saved. Oracle opens its next sessions with the Copilot SDK.')).toBeNull()
    expect(screen.queryByRole('combobox', { name: 'How Oracle opens sessions' })).toBeNull()
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
