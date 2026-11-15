// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags, effectivePreviewFeatures } from '../../shared/feature-flags'
import { getHubHealth } from '../api'
import { PreviewFeaturesContext } from '../preview-features'
import { HealthCard } from './HealthCard'
import { PreviewFeaturesSettings } from '../PreviewFeaturesSettings'
import { SettingsNavigation } from './SettingsNavigation'
import { settingsSections, type SettingsSectionProps } from './sections'

vi.mock('../api', () => ({ getHubHealth: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
describe('Health preview', () => {
  it.each([false, true])('routes Health search only to visible results when the card is %s', (enabled) => {
    vi.mocked(getHubHealth).mockReturnValue(new Promise(() => undefined))
    const preferences = { healthCard: enabled }
    const sections = settingsSections.filter((section) => ['settings-interface', 'settings-app'].includes(section.id))
      .map((section) => ({ ...section, render: () => section.id === 'settings-app' ? <HealthCard /> : <PreviewFeaturesSettings /> }))
    render(<PreviewFeaturesContext.Provider value={{
      hubFlags: defaultHubFeatureFlags, preferences,
      effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
    }}><SettingsNavigation sections={sections} sectionProps={{ shortcuts: [], healthCardEnabled: enabled } as unknown as SettingsSectionProps} /></PreviewFeaturesContext.Provider>)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Health' } })
    expect(screen.getByRole('checkbox', { name: 'Health card' })).toBeVisible()
    if (enabled) {
      fireEvent.click(screen.getByRole('button', { name: /^App/ }))
      expect(screen.getByRole('heading', { name: 'Health' })).toBeVisible()
    } else {
      expect(screen.queryByRole('button', { name: /^App/ })).not.toBeInTheDocument()
      expect(getHubHealth).not.toHaveBeenCalled()
    }
  })

  it('does not request diagnostics while off', () => {
    render(<HealthCard />)
    expect(getHubHealth).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: 'Health' })).not.toBeInTheDocument()
  })

  it('works without settingsNavigation and shows hub facts with unknown versions explicitly', async () => {
    vi.mocked(getHubHealth).mockResolvedValue({
      hub: { id: 'hub', name: 'Studio', role: 'hub', version: '1.54.0' },
      startup: [{ startupPhase: 'service.start', event: 'complete', elapsedMs: 42, durationMs: 30 }],
      computers: [{ id: 'old', name: 'Build node', role: 'node', online: false }],
      hubFlags: defaultHubFeatureFlags,
    })
    render(<PreviewFeaturesContext.Provider value={{
      hubFlags: defaultHubFeatureFlags, preferences: { healthCard: true },
      effective: effectivePreviewFeatures({ healthCard: true }, defaultHubFeatureFlags), set: vi.fn(),
    }}><HealthCard /></PreviewFeaturesContext.Provider>)
    await screen.findByText('30 ms')
    expect(screen.getByText('Release: Not reported')).toBeVisible()
    expect(screen.getByText(/node · Offline · Version not reported/)).toBeVisible()
    expect(screen.getByText('agentic-remote doctor')).toBeVisible()
  })
})
