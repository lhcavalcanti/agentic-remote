// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { effectivePreviewFeatures, defaultHubFeatureFlags } from '../../shared/feature-flags'
import { PreviewFeaturesContext } from '../preview-features'
import { ShellNavigation } from './ShellNavigation'
import { initials } from './display-name'
import { DisplayNameSetting } from './DisplayNameSetting'

afterEach(cleanup)
it('keeps the existing shell unchanged by default', () => {
  render(<ShellNavigation onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} />)
  expect(screen.queryByRole('navigation')).toBeNull()
})
it('gates entries with both previews and authoritative flags and orders actions', () => {
  const onSettings = vi.fn()
  const onOracle = vi.fn()
  const preferences = { desktopRail: true, hostMonitorView: true, notificationPanel: true }
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={onSettings} onOracle={onOracle} /></PreviewFeaturesContext>)
  expect(screen.getByText('AM')).toBeTruthy()
  expect(screen.getByText('Alex Morgan')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Host monitor' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Notifications' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
  expect(onSettings).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: 'Open Oracle' }))
  expect(onOracle).toHaveBeenCalledOnce()
  expect(initials('  Zoë   Lee ')).toBe('ZL')
})

it('saves a trimmed display-name edit and refuses invalid names', () => {
  const onChange = vi.fn()
  const preferences = { desktopRail: true }
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }}><DisplayNameSetting value="Alex Morgan" onChange={onChange} /></PreviewFeaturesContext>)
  const input = screen.getByRole('textbox', { name: 'Display name' })
  fireEvent.change(input, { target: { value: '  Sam Lee  ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save display name' }))
  expect(onChange).toHaveBeenCalledWith('Sam Lee')
  fireEvent.change(input, { target: { value: ' ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save display name' }))
  expect(screen.getByRole('alert').textContent).toContain('1–60')
  expect(onChange).toHaveBeenCalledOnce()
})
