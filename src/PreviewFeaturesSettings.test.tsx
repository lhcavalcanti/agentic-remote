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
  const composer = usePreviewFeature('composerRefresh')
  const notifications = usePreviewFeature('notificationPanel')
  return <output aria-label="Effective previews">{JSON.stringify({ composer, notifications })}</output>
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
  it('starts off and persists a toggle through the hub profile and a remount', async () => {
    const server = hub()
    const view = settings(await server.client())
    expect(screen.getAllByRole('checkbox')).toHaveLength(8)
    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).not.toBeChecked()
    const composer = screen.getByRole('checkbox', { name: 'Composer refresh' })
    expect(composer).toHaveAccessibleDescription('Try the refreshed composer controls and session status.')
    fireEvent.click(composer)
    await waitFor(() => expect(server.snapshot().values.previewFeatures).toEqual({ composerRefresh: true }))
    expect(screen.getByLabelText('Effective previews')).toHaveTextContent('"composer":true')
    view.unmount()
    settings(await server.client())
    expect(screen.getByRole('checkbox', { name: 'Composer refresh' })).toBeChecked()
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
