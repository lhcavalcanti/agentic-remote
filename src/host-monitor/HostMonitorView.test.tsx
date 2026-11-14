// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { hostMetricNames, type HostSnapshot } from '../../shared/host-telemetry'
import { request } from '../api'
import { HostMonitorView } from './HostMonitorView'
import { useHostMonitor } from './use-host-monitor'
import { bytes, sparkPath } from './metrics'

vi.mock('../api', () => ({ request: vi.fn() }))
class Socket {
  static instances: Socket[] = []
  onmessage?: (event: { data: string }) => void
  onclose?: () => void
  onerror?: () => void
  close = vi.fn()
  readonly url: string
  constructor(url: string) { this.url = url; Socket.instances.push(this) }
}
const metrics = Object.fromEntries(hostMetricNames.map((metric) => [metric, null]))
const snapshot = {
  info: { hostname: 'fictional-studio', os: 'Linux', kernel: 'fictional', cpuModel: 'Fictional CPU',
    logicalCpus: 8, totalMemoryBytes: 32e9, uptimeSeconds: 100, isWsl: true, wslDistro: 'Fictional' },
  latest: { ...metrics, at: '2026-11-14T18:00:00Z', cpuPercent: 18 },
  live: [{ ...metrics, at: '2026-11-14T18:00:00Z', cpuPercent: 18 }],
  disk: { mount: '/fictional', totalBytes: 100e9, freeBytes: 50e9 },
} as HostSnapshot
const computer = { id: 'studio', name: 'Studio', online: true, isLocal: true }
beforeEach(() => {
  vi.mocked(request).mockReset()
  Socket.instances = []
  vi.stubGlobal('WebSocket', Socket)
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  vi.mocked(request).mockImplementation(async (path) => {
    if (path.includes('/processes')) return { rows: [
      { pid: 1, startTime: 1, executable: 'copilot', cpuPercent: 10, rssBytes: 1e6, owner: 'session', sessionId: 'session-one' },
      { pid: 2, startTime: 1, executable: 'copilot-runtime', cpuPercent: 5, rssBytes: 1e6, owner: 'shared-runtime', label: 'Shared Copilot runtime' },
    ], scannedAt: '2026-11-14T18:00:00Z', truncated: false, othersCount: 0 }
    if (path.includes('/history')) return []
    return structuredClone(snapshot)
  })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('preserves unavailable samples as gaps and formats small nonzero values', () => {
  expect(sparkPath([1, null, 2])).toMatch(/^M.* M/)
  expect(sparkPath([null])).toBe('')
  expect(bytes(null)).toBe('Unavailable')
  expect(bytes(0.001)).toBe('0.01 B')
})

it('freezes only the presentation while the stream remains subscribed', async () => {
  render(<HostMonitorView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  await screen.findByText('18.0%')
  expect(screen.getByText(/WSL VM, not the Windows host/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
  const changed = structuredClone(snapshot)
  changed.latest!.cpuPercent = 45
  act(() => Socket.instances[0].onmessage?.({ data: JSON.stringify({ type: 'host.snapshot', snapshot: changed }) }))
  expect(screen.getByText('18.0%')).toBeTruthy()
  expect(Socket.instances[0].close).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
  expect(screen.getByText('45.0%')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '24 h · minute averages' }))
  await waitFor(() => expect(request).toHaveBeenCalledWith('/api/computers/studio/host/history?range=24h', expect.anything()))
})

it('shows executable-only process inventory and only proven session links', async () => {
  const onOpen = vi.fn()
  render(<HostMonitorView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={onOpen} />)
  await screen.findByText('18.0%')
  expect(vi.mocked(request).mock.calls.some(([path]) => path.endsWith('/processes'))).toBe(false)
  fireEvent.click(screen.getByRole('tab', { name: 'Processes' }))
  await screen.findByText(/Shared Copilot runtime/)
  expect(screen.getAllByRole('button', { name: 'Open session' })).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: 'Open session' }))
  expect(onOpen).toHaveBeenCalledWith('studio', 'session-one')
})

it('disconnects on hidden pages and on unmount, without opening disabled streams', async () => {
  const { rerender, unmount } = renderHook(({ active }) => useHostMonitor('studio', active, false, false), { initialProps: { active: false } })
  expect(request).not.toHaveBeenCalled()
  rerender({ active: true })
  await waitFor(() => expect(Socket.instances).toHaveLength(1))
  act(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(Socket.instances[0].close).toHaveBeenCalledOnce()
  unmount()
})

it('renders compatibility, disabled-computer and offline states explicitly', async () => {
  vi.mocked(request).mockRejectedValue(new Error('Update this computer to enable host telemetry'))
  const props = { computers: [computer], enabled: true, onClose: vi.fn(), onOpenSession: vi.fn() }
  const { unmount } = render(<HostMonitorView {...props} />)
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Update this computer to enable host telemetry')
  expect(Socket.instances).toHaveLength(0)
  unmount()
  vi.mocked(request).mockRejectedValue(new Error('Host monitor is turned off on this computer'))
  const second = render(<HostMonitorView {...props} />)
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Host monitor is turned off on this computer')
  second.unmount()
  render(<HostMonitorView {...props} computers={[{ ...computer, online: false }]} />)
  expect(screen.getByRole('status').textContent).toContain('offline')
})
