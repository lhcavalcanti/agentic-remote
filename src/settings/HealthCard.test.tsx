// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags } from '../../shared/feature-flags'
import { getHubHealth } from '../api'
import { HealthCard } from './HealthCard'
import { PreviewFeaturesSettings } from '../PreviewFeaturesSettings'
import { SettingsNavigation } from './SettingsNavigation'
import { navigableSettingsSections, type SettingsSectionProps } from './sections'

vi.mock('../api', () => ({ getHubHealth: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
describe('Health card', () => {
  it('routes Health search to the App card without a preview toggle', () => {
    vi.mocked(getHubHealth).mockReturnValue(new Promise(() => undefined))
    const sections = navigableSettingsSections.filter((section) => ['settings-interface', 'settings-app'].includes(section.id))
      .map((section) => ({ ...section, render: () => section.id === 'settings-app' ? <HealthCard /> : <PreviewFeaturesSettings /> }))
    render(<SettingsNavigation sections={sections} sectionProps={{ shortcuts: [] } as unknown as SettingsSectionProps} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Health' } })
    expect(screen.queryByRole('checkbox', { name: 'Health card' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Interface/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^App/ }))
    expect(screen.getByRole('heading', { name: 'Health' })).toBeVisible()
    expect(getHubHealth).toHaveBeenCalledOnce()
  })

  it('shows hub facts with unknown versions explicitly', async () => {
    vi.mocked(getHubHealth).mockResolvedValue({
      hub: { id: 'hub', name: 'Studio', role: 'hub', version: '1.54.0' },
      startup: [{ startupPhase: 'service.start', event: 'complete', elapsedMs: 42, durationMs: 30 }],
      computers: [{ id: 'old', name: 'Build node', role: 'node', online: false }],
      hubFlags: defaultHubFeatureFlags,
    })
    render(<HealthCard />)
    await screen.findByText('30 ms')
    expect(screen.getByText('Release: Not reported')).toBeVisible()
    expect(screen.getByText(/node · Offline · Version not reported/)).toBeVisible()
    expect(screen.getByText('agentic-remote doctor')).toBeVisible()
  })
})
