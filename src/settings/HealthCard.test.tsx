// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags, effectivePreviewFeatures } from '../../shared/feature-flags'
import { getHubHealth } from '../api'
import { PreviewFeaturesContext } from '../preview-features'
import { HealthCard } from './HealthCard'

vi.mock('../api', () => ({ getHubHealth: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
describe('Health preview', () => {
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
