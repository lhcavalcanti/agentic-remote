// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags } from '../shared/feature-flags'
import {
  applySettingsChanges,
  validateSettingsChanges,
  type SettingsProfileRecord,
  type SettingsProfileSnapshot,
  type SettingsProfileValues,
} from '../shared/settings-profile'
import { fetchHubFeatureFlags } from './api'
import { dispatchAuthoritativeRefresh } from './OracleDreamer'
import { PreviewFeaturesSettings } from './PreviewFeaturesSettings'
import { PreviewFeaturesProvider } from './PreviewFeaturesProvider'
import { usePreviewFeature } from './preview-features'
import { SettingsProfileClient } from './settings-profile'

vi.mock('./api', () => ({ fetchHubFeatureFlags: vi.fn() }))
const clients: SettingsProfileClient[] = []

beforeEach(() => {
  localStorage.clear()
  vi.mocked(fetchHubFeatureFlags).mockReset().mockResolvedValue(defaultHubFeatureFlags)
})

afterEach(() => {
  cleanup()
  for (const client of clients.splice(0)) client.stop()
})

function hub(values: SettingsProfileValues = {}) {
  let record: SettingsProfileRecord = { revision: 0, values, keyRevisions: {} }
  const snapshot = (): SettingsProfileSnapshot => ({
    profileId: 'preview-test-hub', revision: record.revision, values: structuredClone(record.values),
  })
  const transport = {
    fetch: async () => snapshot(),
    update: vi.fn(async (changes, deviceId) => {
      const result = applySettingsChanges(record, validateSettingsChanges(changes), deviceId)
      record = result.record
      return { settings: snapshot(), conflicts: result.conflicts }
    }),
    import: async () => snapshot(),
  } satisfies ConstructorParameters<typeof SettingsProfileClient>[0]['transport']
  return {
    snapshot,
    transport,
    async client() {
      const client = new SettingsProfileClient({ transport, storage: localStorage })
      clients.push(client)
      await client.sync()
      return client
    },
  }
}

function EffectiveState() {
  const rail = usePreviewFeature('desktopRail')
  const notifications = usePreviewFeature('notificationPanel')
  return <output aria-label="Effective previews">{JSON.stringify({ rail, notifications })}</output>
}

function SchedulerDraft() {
  return usePreviewFeature('schedulerView') ? <input aria-label="Schedule draft" /> : null
}

function settings(client: SettingsProfileClient) {
  return render(
    <PreviewFeaturesProvider settingsClient={client}>
      <PreviewFeaturesSettings />
      <EffectiveState />
    </PreviewFeaturesProvider>,
  )
}

describe('Preview features settings', () => {
  it('keeps an open scheduler draft through failed refreshes but honors a successful disable', async () => {
    vi.mocked(fetchHubFeatureFlags)
      .mockResolvedValueOnce({ ...defaultHubFeatureFlags, scheduler: true })
      .mockRejectedValueOnce(new Error('Transient focus refresh failure'))
      .mockRejectedValueOnce(new Error('Transient reconnect failure'))
      .mockResolvedValueOnce(defaultHubFeatureFlags)
    const server = hub({ previewFeatures: { schedulerView: true } })
    render(<PreviewFeaturesProvider settingsClient={await server.client()}><SchedulerDraft /></PreviewFeaturesProvider>)
    const draft = await screen.findByRole('textbox', { name: 'Schedule draft' })
    fireEvent.change(draft, { target: { value: 'Keep this unfinished schedule' } })
    await act(async () => { window.dispatchEvent(new Event('focus')) })
    expect(draft).toBeInTheDocument()
    expect(draft).toHaveValue('Keep this unfinished schedule')
    await act(async () => { await dispatchAuthoritativeRefresh() })
    expect(draft).toBeInTheDocument()
    expect(draft).toHaveValue('Keep this unfinished schedule')
    await act(async () => { window.dispatchEvent(new Event('online')) })
    expect(screen.queryByRole('textbox', { name: 'Schedule draft' })).not.toBeInTheDocument()
    expect(server.snapshot().values.previewFeatures).toEqual({ schedulerView: true })
    expect(server.transport.update).not.toHaveBeenCalled()
  })

  it('starts off and persists a toggle through the hub profile and a remount', async () => {
    const server = hub()
    const view = settings(await server.client())
    expect(screen.getAllByRole('checkbox')).toHaveLength(4)
    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).not.toBeChecked()
    const rail = screen.getByRole('checkbox', { name: 'Desktop rail' })
    expect(rail).toHaveAccessibleDescription('Try compact navigation alongside the session list.')
    fireEvent.click(rail)
    await waitFor(() => expect(server.snapshot().values.previewFeatures).toEqual({ desktopRail: true }))
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"rail":true')
    view.unmount()
    settings(await server.client())
    expect(screen.getByRole('checkbox', { name: 'Desktop rail' })).toBeChecked()
    expect(server.transport.update).toHaveBeenCalledTimes(1)
  })

  it('disables unavailable previews without discarding an existing opt-in', async () => {
    const server = hub({ previewFeatures: { notificationPanel: true } })
    settings(await server.client())
    const notifications = screen.getByRole('checkbox', { name: 'Notification panel' })
    expect(notifications).toBeDisabled()
    expect(notifications).toBeChecked()
    expect(notifications).toHaveAccessibleDescription(/Turned off on this hub/)
    expect(screen.getAllByText(/Turned off on this hub/)).toHaveLength(3)
    expect(screen.getByRole('checkbox', { name: 'Desktop rail' })).toBeEnabled()
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":false')
    fireEvent.click(notifications)
    expect(server.transport.update).not.toHaveBeenCalled()
    expect(server.snapshot().values.previewFeatures).toEqual({ notificationPanel: true })
  })

  it('honors hub availability and refreshed authority independently of stored preferences', async () => {
    vi.mocked(fetchHubFeatureFlags).mockResolvedValueOnce({
      notificationCenter: true, hostMonitor: false, scheduler: false,
    })
    const server = hub()
    settings(await server.client())
    const notifications = screen.getByRole('checkbox', { name: 'Notification panel' })
    await waitFor(() => expect(notifications).toBeEnabled())
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":false')
    fireEvent.click(notifications)
    await waitFor(() => expect(server.snapshot().values.previewFeatures?.notificationPanel).toBe(true))
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":true')
    await act(async () => { window.dispatchEvent(new Event('focus')) })
    await waitFor(() => expect(notifications).toBeDisabled())
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":false')
    expect(server.snapshot().values.previewFeatures?.notificationPanel).toBe(true)
  })

  it('fails closed for an old or unreachable hub, then retries when online', async () => {
    vi.mocked(fetchHubFeatureFlags).mockRejectedValueOnce(new Error('Not found'))
    const server = hub({ previewFeatures: { notificationPanel: true } })
    settings(await server.client())
    await waitFor(() => expect(fetchHubFeatureFlags).toHaveBeenCalledTimes(1))
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":false')
    vi.mocked(fetchHubFeatureFlags).mockResolvedValue({
      notificationCenter: true, hostMonitor: false, scheduler: false,
    })
    await act(async () => { window.dispatchEvent(new Event('online')) })
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Notification panel' })).toBeEnabled())
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":true')
  })

  it('refreshes hub authority on reconnect without discarding the stored opt-in', async () => {
    const enabled = { notificationCenter: true, hostMonitor: false, scheduler: false }
    vi.mocked(fetchHubFeatureFlags).mockResolvedValueOnce(enabled)
    const server = hub({ previewFeatures: { notificationPanel: true } })
    settings(await server.client())
    const notifications = screen.getByRole('checkbox', { name: 'Notification panel' })
    await waitFor(() => expect(notifications).toBeEnabled())
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":true')

    await act(async () => { await dispatchAuthoritativeRefresh() })
    expect(notifications).toBeDisabled()
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":false')
    expect(server.snapshot().values.previewFeatures?.notificationPanel).toBe(true)

    vi.mocked(fetchHubFeatureFlags).mockResolvedValueOnce(enabled)
    await act(async () => { await dispatchAuthoritativeRefresh() })
    expect(notifications).toBeEnabled()
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"notifications":true')
    expect(server.transport.update).not.toHaveBeenCalled()
  })
})
