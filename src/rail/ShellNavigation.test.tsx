// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { effectivePreviewFeatures, defaultHubFeatureFlags } from '../../shared/feature-flags'
import { PreviewFeaturesContext } from '../preview-features'
import { ShellNavigation } from './ShellNavigation'
import { initials } from './display-name'
import { DisplayNameSetting } from './DisplayNameSetting'
import { request } from '../api'

vi.mock('../api', () => ({ request: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
vi.mocked(request).mockResolvedValue({ defaultDisplayName: 'Alex Morgan' })
it('keeps the existing shell unchanged by default', () => {
  render(<ShellNavigation onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} />)
  expect(screen.queryByRole('navigation')).toBeNull()
})
it('gates entries with both previews and authoritative flags and orders actions', () => {
  vi.mocked(request).mockResolvedValue({ defaultDisplayName: 'Alex Morgan' })
  const onSettings = vi.fn()
  const onOracle = vi.fn()
  const preferences = { desktopRail: true, hostMonitorView: true, notificationPanel: true }
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={onSettings} onOracle={onOracle} oracleAvailable /></PreviewFeaturesContext>)
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

it('offers Oracle only while its authoritative availability signal is true', () => {
  vi.mocked(request).mockResolvedValue({ defaultDisplayName: 'Alex Morgan' })
  const preferences = { desktopRail: true }
  const context = {
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }
  const onOracle = vi.fn()
  const navigation = (available: boolean) => <PreviewFeaturesContext value={context}>
    <ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={onOracle} oracleAvailable={available} />
  </PreviewFeaturesContext>
  const { rerender } = render(navigation(false))
  expect(screen.queryByRole('button', { name: 'Open Oracle' })).toBeNull()
  rerender(navigation(true))
  fireEvent.click(screen.getByRole('button', { name: 'Open Oracle' }))
  expect(onOracle).toHaveBeenCalledOnce()
  rerender(navigation(false))
  expect(screen.queryByRole('button', { name: 'Open Oracle' })).toBeNull()
})

it('renders navigation when only the desktop rail preview is enabled', () => {
  vi.mocked(request).mockResolvedValue({ defaultDisplayName: 'Alex Morgan' })
  const preferences = { desktopRail: true }
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} /></PreviewFeaturesContext>)
  expect(screen.getByRole('navigation', { name: 'App navigation' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'App settings' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Notifications' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Host monitor' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Scheduler' })).toBeNull()
})

it('keeps Notifications reachable when it is the only enabled preview', () => {
  const preferences = { notificationPanel: true }
  const hubFlags = { ...defaultHubFeatureFlags, notificationCenter: true }
  const onOpen = vi.fn()
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} onOpen={onOpen} /></PreviewFeaturesContext>)
  expect(screen.getByRole('navigation', { name: 'App navigation' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))
  expect(onOpen).toHaveBeenCalledWith('notifications')
  expect(screen.queryByRole('button', { name: 'New session' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Host monitor' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Scheduler' })).toBeNull()
})

it('keeps Host monitor reachable when it is the only enabled preview', () => {
  const preferences = { hostMonitorView: true }
  const hubFlags = { ...defaultHubFeatureFlags, hostMonitor: true }
  const onOpen = vi.fn()
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} onOpen={onOpen} /></PreviewFeaturesContext>)
  expect(screen.getByRole('navigation', { name: 'App navigation' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Host monitor' }))
  expect(onOpen).toHaveBeenCalledWith('host')
  expect(screen.queryByRole('button', { name: 'Notifications' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Scheduler' })).toBeNull()
})

it('keeps Scheduler reachable when it is the only enabled preview', () => {
  const preferences = { schedulerView: true }
  const hubFlags = { ...defaultHubFeatureFlags, scheduler: true }
  const onOpen = vi.fn()
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} onOpen={onOpen} /></PreviewFeaturesContext>)
  expect(screen.getByRole('navigation', { name: 'App navigation' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Scheduler' }))
  expect(onOpen).toHaveBeenCalledWith('scheduler')
  expect(screen.queryByRole('button', { name: 'Notifications' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Host monitor' })).toBeNull()
})

it('saves a trimmed display-name edit and refuses invalid names', () => {
  vi.mocked(request).mockResolvedValue({ defaultDisplayName: 'Alex Morgan' })
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

it('removes a closed drawer navigation from keyboard and accessibility reach', () => {
  vi.mocked(request).mockResolvedValue({ defaultDisplayName: 'Alex Morgan' })
  const preferences = { desktopRail: true }
  const { container } = render(<PreviewFeaturesContext value={{
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }}><ShellNavigation displayName="Alex Morgan" offscreen onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} onOpen={vi.fn()} /></PreviewFeaturesContext>)
  expect(container.querySelector('nav')?.hasAttribute('inert')).toBe(true)
  expect(screen.queryByRole('navigation')).toBeNull()
})

it('announces unread counts on the implemented notification launcher', () => {
  const preferences = { notificationPanel: true }
  const hubFlags = { ...defaultHubFeatureFlags, notificationCenter: true }
  const onOpen = vi.fn()
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn(),
  }}><ShellNavigation onNewSession={vi.fn()} onSettings={vi.fn()} onOracle={vi.fn()} onOpen={onOpen} unreadCount={7} /></PreviewFeaturesContext>)
  fireEvent.click(screen.getByRole('button', { name: 'Notifications, 7 unread' }))
  expect(onOpen).toHaveBeenCalledWith('notifications')
})

it.each(['pending', 'failed', 'resolved'] as const)('does not save a presentation placeholder while the default is %s', async (state) => {
  let resolve!: (value: { defaultDisplayName: string }) => void
  let reject!: (reason: Error) => void
  vi.mocked(request).mockReturnValue(new Promise((res, rej) => { resolve = res; reject = rej }))
  const onChange = vi.fn()
  const preferences = { desktopRail: true }
  render(<PreviewFeaturesContext value={{
    preferences, hubFlags: defaultHubFeatureFlags,
    effective: effectivePreviewFeatures(preferences, defaultHubFeatureFlags), set: vi.fn(),
  }}><DisplayNameSetting onChange={onChange} /></PreviewFeaturesContext>)
  const save = screen.getByRole('button', { name: 'Save display name' })
  expect(save).toHaveProperty('disabled', true)
  fireEvent.click(save)
  expect(onChange).not.toHaveBeenCalled()
  if (state === 'failed') await act(async () => reject(new Error('offline')))
  if (state === 'resolved') {
    await act(async () => resolve({ defaultDisplayName: 'Git Name' }))
    fireEvent.click(save)
    expect(onChange).toHaveBeenCalledWith('Git Name')
    return
  }
  fireEvent.change(screen.getByRole('textbox', { name: 'Display name' }), { target: { value: 'Explicit Name' } })
  fireEvent.click(save)
  expect(onChange).toHaveBeenCalledWith('Explicit Name')
})
