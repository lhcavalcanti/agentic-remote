// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { hostMetricNames, type HostSnapshot } from '../../shared/host-telemetry'
import { SubmissionError } from '../../shared/submission-error'
import { request } from '../api'
import { HostMonitorView } from './HostMonitorView'
import { useHostMonitor } from './use-host-monitor'
import { bytes, sparkPath, trend } from './metrics'

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
  latest: { ...metrics, at: '2026-11-14T18:00:00Z', cpuPercent: 18, load1: 1.25, load5: 2.5, load15: 3.75 },
  live: [{ ...metrics, at: '2026-11-14T18:00:00Z', cpuPercent: 18, load1: 1.25, load5: 2.5, load15: 3.75 }],
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
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers() })

it('preserves unavailable samples as gaps and formats small nonzero values', () => {
  expect(sparkPath([{ at: 0, value: 1 }, { at: 1000, value: null }, { at: 2000, value: 2 }])).toMatch(/^M.* M/)
  expect(sparkPath([{ at: 0, value: null }])).toBe('')
  expect(bytes(null)).toBe('Unavailable')
  expect(bytes(0.001)).toBe('0.01 B')
})

it('positions points by elapsed time and breaks missing seconds and minutes', () => {
  const live = [{ at: 0, value: 1 }, { at: 1000, value: 2 }, { at: 60_000, value: 3 }]
  const path = sparkPath(live)
  expect(path).toContain('M2.0,')
  expect(path).toContain('L3.9,')
  expect(path).toContain('M118.0,')
  expect(sparkPath([{ at: 0, value: 1 }, { at: 2000, value: 2 }]).match(/M/g)).toHaveLength(2)
  const history = sparkPath([{ at: 0, value: 1 }, { at: 60_000, value: 2 }, { at: 180_000, value: 3 }], undefined, 86_400_000)
  expect(history.match(/M/g)).toHaveLength(2)
  expect(history.match(/L/g)).toHaveLength(1)
  expect(trend(snapshot, [], '60s', ['load1'])[0]).toEqual({ at: Date.parse(snapshot.live[0].at), value: 1.25 })
})

it('renders current and trended 1, 5 and 15 minute load', async () => {
  render(<HostMonitorView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  await screen.findByText('1.25')
  expect(screen.getByText('2.50')).toBeTruthy()
  expect(screen.getByText('3.75')).toBeTruthy()
  for (const minutes of [1, 5, 15]) expect(screen.getByRole('img', { name: `Load · ${minutes} min trend` }).querySelector('path')?.getAttribute('d')).toMatch(/^M/)
})

it.each([true, false])('selects arriving computers, preferring the local hub when present (%s)', async (includeHub) => {
  const node = { ...computer, id: 'build', name: 'Build node', isLocal: false }
  const props = { enabled: true, onClose: vi.fn(), onOpenSession: vi.fn() }
  const { rerender } = render(<HostMonitorView {...props} computers={[]} />)
  expect(screen.getByText('No computer is selected.')).toBeTruthy()
  expect(request).not.toHaveBeenCalled()
  rerender(<HostMonitorView {...props} computers={includeHub ? [node, computer] : [node]} />)
  await screen.findByText('18.0%')
  const selected = includeHub ? computer.id : node.id
  expect(screen.getByRole('combobox', { name: 'Computer' })).toHaveProperty('value', selected)
  expect(request).toHaveBeenCalledWith(`/api/computers/${selected}/host`, expect.anything())
  expect(screen.queryByText('No computer is selected.')).toBeNull()
})

it.each([true, false])('replaces a removed selection with the local hub or first computer (%s)', async (includeHub) => {
  const removed = { ...computer, id: 'removed', name: 'Removed node', isLocal: false }
  const first = { ...computer, id: 'first', name: 'First node', isLocal: false }
  const props = { enabled: true, onClose: vi.fn(), onOpenSession: vi.fn() }
  const { rerender } = render(<HostMonitorView {...props} computers={[removed]} />)
  await screen.findByText('18.0%')
  const remaining = includeHub ? [first, computer] : [first]
  rerender(<HostMonitorView {...props} computers={remaining} />)
  const selected = includeHub ? computer.id : first.id
  await waitFor(() => expect(request).toHaveBeenCalledWith(`/api/computers/${selected}/host`, expect.anything()))
  expect(screen.getByRole('combobox', { name: 'Computer' })).toHaveProperty('value', selected)
  expect(Socket.instances[0].close).toHaveBeenCalledOnce()
  rerender(<HostMonitorView {...props} computers={[...remaining, removed]} />)
  expect(screen.getByRole('combobox', { name: 'Computer' })).toHaveProperty('value', selected)
  rerender(<HostMonitorView {...props} computers={[]} />)
  expect(screen.getByText('No computer is selected.')).toBeTruthy()
  rerender(<HostMonitorView {...props} computers={[removed]} />)
  await waitFor(() => expect(Socket.instances.at(-1)?.url).toContain('/removed/host/live'))
})

it('preserves a user-selected node when the computer list changes', async () => {
  const node = { ...computer, id: 'build', name: 'Build node', isLocal: false }
  const props = { enabled: true, onClose: vi.fn(), onOpenSession: vi.fn() }
  const { rerender } = render(<HostMonitorView {...props} computers={[computer, node]} />)
  await screen.findByText('18.0%')
  fireEvent.change(screen.getByRole('combobox', { name: 'Computer' }), { target: { value: node.id } })
  await waitFor(() => expect(Socket.instances.at(-1)?.url).toContain('/build/host/live'))
  const socketCount = Socket.instances.length
  rerender(<HostMonitorView {...props} computers={[{ ...node, name: 'Renamed build node' }, computer]} />)
  expect(screen.getByRole('combobox', { name: 'Computer' })).toHaveProperty('value', node.id)
  expect(Socket.instances).toHaveLength(socketCount)
  expect(Socket.instances.at(-1)?.close).not.toHaveBeenCalled()
})

it('retries failed initial snapshots with backoff and cancels retries when closed', async () => {
  vi.useFakeTimers()
  vi.mocked(request).mockRejectedValueOnce(new Error('503 unavailable')).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(snapshot)
  const { result, unmount } = renderHook(() => useHostMonitor('studio', true, false, false))
  await act(async () => {})
  expect(result.current.error).toContain('503')
  await act(async () => { await vi.advanceTimersByTimeAsync(999) })
  expect(request).toHaveBeenCalledTimes(1)
  await act(async () => { await vi.advanceTimersByTimeAsync(1) })
  expect(request).toHaveBeenCalledTimes(2)
  await act(async () => { await vi.advanceTimersByTimeAsync(1999) })
  expect(request).toHaveBeenCalledTimes(2)
  await act(async () => { await vi.advanceTimersByTimeAsync(1) })
  expect(request).toHaveBeenCalledTimes(3)
  expect(result.current.error).toBeUndefined()
  expect(Socket.instances).toHaveLength(1)
  act(() => Socket.instances[0].onclose?.())
  unmount()
  await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })
  expect(request).toHaveBeenCalledTimes(3)
})

it.each([
  [502, 'HOST_TELEMETRY_INVALID'],
  [409, undefined],
] as const)('requires a manual retry for incompatible telemetry (%s, %s)', async (status, code) => {
  vi.useFakeTimers()
  vi.mocked(request).mockRejectedValue(Object.assign(new SubmissionError(
    status === 409 ? 'Update this computer (Studio) to use host monitoring.' : 'This computer returned invalid host telemetry',
    status,
  ), { code }))
  const { result } = renderHook(() => useHostMonitor('studio', true, false, false))
  await act(async () => {})
  expect(result.current.error).toContain('Update this computer')
  if (status === 409) expect(result.current.error).toBe('Update this computer (Studio) to use host monitoring.')
  expect(result.current.retryRequired).toBe(true)
  await act(async () => { await vi.advanceTimersByTimeAsync(120_000) })
  expect(request).toHaveBeenCalledTimes(1)
  expect(Socket.instances).toHaveLength(0)
  act(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  act(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(request).toHaveBeenCalledTimes(1)
  vi.mocked(request).mockResolvedValue(snapshot)
  await act(async () => { result.current.retry() })
  expect(request).toHaveBeenCalledTimes(2)
  expect(result.current.error).toBeUndefined()
  expect(result.current.retryRequired).toBe(false)
  expect(Socket.instances).toHaveLength(1)
})

it.each([
  [502, undefined],
  [503, undefined],
  [502, 'OTHER_GATEWAY_ERROR'],
] as const)('keeps automatic retries for transient gateway errors (%s, %s)', async (status, code) => {
  vi.useFakeTimers()
  const error = Object.assign(new SubmissionError('Temporarily unavailable', status), { code })
  vi.mocked(request).mockRejectedValueOnce(error).mockRejectedValueOnce(error).mockResolvedValue(snapshot)
  const { result } = renderHook(() => useHostMonitor('studio', true, false, false))
  await act(async () => {})
  await act(async () => { await vi.advanceTimersByTimeAsync(999) })
  expect(request).toHaveBeenCalledTimes(1)
  await act(async () => { await vi.advanceTimersByTimeAsync(1) })
  expect(request).toHaveBeenCalledTimes(2)
  await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
  expect(request).toHaveBeenCalledTimes(3)
  expect(result.current.error).toBeUndefined()
  expect(Socket.instances).toHaveLength(1)
})

it('offers a working Retry control after the hub rejects invalid node telemetry', async () => {
  vi.mocked(request).mockRejectedValueOnce(Object.assign(
    new SubmissionError('This computer returned invalid host telemetry', 502), { code: 'HOST_TELEMETRY_INVALID' },
  ))
  render(<HostMonitorView computers={[computer]} enabled onClose={vi.fn()} onOpenSession={vi.fn()} />)
  expect((await screen.findByRole('alert')).textContent).toContain('Update this computer')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await screen.findByText('18.0%')
  expect(screen.queryByRole('alert')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
  expect(request).toHaveBeenCalledTimes(2)
})

it('stops auxiliary polling until an incompatible stream is manually retried', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useHostMonitor('studio', true, true, true))
  await act(async () => {})
  expect(request).toHaveBeenCalledTimes(3)
  act(() => Socket.instances[0].onmessage?.({ data: '{"type":"unsupported"}' }))
  await act(async () => { await vi.advanceTimersByTimeAsync(120_000) })
  expect(request).toHaveBeenCalledTimes(3)
  await act(async () => { result.current.retry() })
  expect(request).toHaveBeenCalledTimes(6)
  expect(result.current.error).toBeUndefined()
})

it('preserves update-required after an invalid frame closes and ignores later frames', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useHostMonitor('studio', true, false, false))
  await act(async () => {})
  act(() => {
    Socket.instances[0].onmessage?.({ data: '{"type":"unsupported"}' })
    Socket.instances[0].onclose?.()
    Socket.instances[0].onmessage?.({ data: JSON.stringify({ type: 'host.snapshot', snapshot }) })
  })
  expect(result.current.error).toContain('Update this computer')
  expect(Socket.instances[0].close).toHaveBeenCalledOnce()
  await act(async () => { await vi.advanceTimersByTimeAsync(120_000) })
  expect(request).toHaveBeenCalledTimes(1)
  expect(result.current.error).toContain('Update this computer')
})

it('does not retry an incompatible initial snapshot', async () => {
  vi.useFakeTimers()
  vi.mocked(request).mockResolvedValue({ futureVersion: true })
  const { result } = renderHook(() => useHostMonitor('studio', true, false, false))
  await act(async () => {})
  expect(result.current.error).toContain('Update this computer')
  await act(async () => { await vi.advanceTimersByTimeAsync(120_000) })
  expect(request).toHaveBeenCalledTimes(1)
  expect(Socket.instances).toHaveLength(0)
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
