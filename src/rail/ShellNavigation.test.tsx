import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { effectivePreviewFeatures, defaultHubFeatureFlags } from '../../shared/feature-flags'
import { PreviewFeaturesContext } from '../preview-features'
import { ShellNavigation } from './ShellNavigation'
import { initials } from './display-name'

afterEach(cleanup)
it('keeps the existing shell unchanged by default', () => {
  render(<ShellNavigation onNewSession={vi.fn()} onSettings={vi.fn()} onOpen={vi.fn()} />)
  expect(screen.queryByRole('navigation')).toBeNull()
})
it('gates entries with both previews and authoritative flags and orders actions', () => {
  const onSettings = vi.fn()
  const preferences = { desktopRail: true, hostMonitorView: true, notificationPanel: true }
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={onSettings} onOpen={vi.fn()} /></PreviewFeaturesContext>)
  expect(screen.getByText('AM')).toBeTruthy()
  expect(screen.getByText('Alex Morgan')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Host monitor' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Notifications' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
  expect(onSettings).toHaveBeenCalledOnce()
  expect(initials('  Zoë   Lee ')).toBe('ZL')
})
