import { describe, expect, it, vi } from 'vitest'
import type { ComputerSummary } from '../../shared/contracts.js'
import type { HostProcesses, HostSnapshot, ProcessRow } from '../../shared/host-telemetry.js'
import type { ManagerMessageSource } from '../../shared/manager.js'
import { createManagerTools, managerToolMutability, type ManagerToolHost } from '../manager-tools.js'
import { hostInfoFixture } from './test-fixtures.js'
import { HOST_STATUS_MAX_LENGTH, oracleHostStatus } from './oracle-status.js'
import type { HostTelemetryTarget } from './service.js'

const now = Date.parse('2026-11-14T18:00:15Z')
const computers: ComputerSummary[] = [
  { id: 'hub', name: 'Studio', isLocal: true, online: true },
  { id: 'node', name: 'Build node', isLocal: false, online: true },
]
const snapshot: HostSnapshot = {
  info: { ...hostInfoFixture, hostname: 'studio-host', isWsl: true, wslDistro: 'Ubuntu' },
  latest: {
    at: '2026-11-14T18:00:00Z', cpuPercent: 92, memoryUsedBytes: 15e9, memoryAvailableBytes: 1e9,
    swapUsedBytes: 0, netRxBytesPerSec: null, netTxBytesPerSec: null, diskReadBytesPerSec: null,
    diskWriteBytesPerSec: null, load1: 4, load5: 3, load15: 2,
  },
  disk: { mount: '/data', freeBytes: 20e9, totalBytes: 100e9 }, live: [],
}
const row = (pid: number, cpuPercent: number, extra: Partial<ProcessRow> = {}): ProcessRow => ({
  pid, startTime: 123, executable: `worker-${pid}`, cpuPercent, rssBytes: 1e9, owner: 'other', ...extra,
})
const inventory: HostProcesses = {
  rows: [
    row(1, 1),
    row(2, 60, { owner: 'session', sessionId: 'session-a' }),
    row(3, 80, { owner: 'shared-runtime', label: 'Shared Copilot runtime', sessionId: 'unproven' }),
    row(4, 90, { owner: 'shared-runtime', label: 'Claude runtime' }),
    row(5, 200, { owner: 'agentic-remote' }),
    row(6, 40, { owner: 'other', sessionId: 'unproven' }),
  ], scannedAt: snapshot.latest!.at, truncated: false, othersCount: 0,
}
function target(data = snapshot, rows = inventory): HostTelemetryTarget {
  return {
    snapshot: vi.fn(async () => data), processes: vi.fn(async () => rows),
    history: vi.fn(async () => []), subscribe: vi.fn(() => () => {}),
  }
}

describe('Oracle host status', () => {
  it('summarizes local and remote targets without opening viewers or requesting history', async () => {
    const local = target()
    const remote = target({ ...snapshot, info: { ...hostInfoFixture, hostname: 'build-host' } })
    const resolve = vi.fn(async (id: string) => id === 'hub' ? local : remote)
    const result = await oracleHostStatus(computers, resolve, () => now)
    expect(resolve.mock.calls).toEqual([['hub'], ['node']])
    expect(result).toContain('studio-host · hub')
    expect(result).toContain('build-host · node')
    expect(result).toContain('WSL VM, not the Windows host · Ubuntu')
    expect(result).toContain('CPU 92% · memory used 15 GB, available 1 GB')
    expect(result).toContain('Data mount /data · disk free 20 GB (20%)')
    expect(result).toContain('Load 1/5/15m 4/3/2 · sample age 15s')
    expect(result).not.toContain('worker-1 ')
    expect(result.indexOf('worker-5')).toBeLessThan(result.indexOf('worker-4'))
    expect(result).toContain('session [session-a](/?computer=hub&session=session-a)')
    expect(result).toContain('shared Copilot runtime')
    expect(result).toContain('Claude runtime')
    expect(result).not.toContain('unproven')
    expect(local.subscribe).not.toHaveBeenCalled()
    expect(local.history).not.toHaveBeenCalled()
  })

  it('reports old nodes, disabled monitoring and offline targets explicitly without exposing errors', async () => {
    const resolve = vi.fn(async (id: string) => {
      if (id === 'hub') return undefined
      throw Object.assign(new Error('secret connection information'), { statusCode: 409 })
    })
    const result = await oracleHostStatus(computers, resolve, () => now)
    expect(result).toContain('Studio (hub): not available on this computer; host monitoring is turned off.')
    expect(result).toContain('Build node (node): not available on this computer; update this computer')
    expect(result).not.toContain('secret')
    expect(await oracleHostStatus([computers[1]], async () => { throw new Error('secret') }, () => now))
      .toContain('not available on this computer; it may be offline')
  })

  it('preserves host metrics when a process scan is rate limited and marks missing or stale samples', async () => {
    const host = target()
    vi.mocked(host.processes).mockRejectedValue(new Error('429'))
    const result = await oracleHostStatus([computers[0]], async () => host, () => now + 60_000)
    expect(result).toContain('CPU 92%')
    expect(result).toContain('Stale sample')
    expect(result).toContain('Processes not available on this computer')
    const missing = await oracleHostStatus([computers[0]], async () => target({
      info: null, latest: null, disk: null, live: [],
    }), () => now)
    expect(missing).toContain('CPU unavailable')
    expect(missing).toContain('sample age unavailable')
    expect(missing).not.toContain('NaN')
  })

  it('bounds computers, fields, process rows and total output while indicating incomplete inventories', async () => {
    const many = Array.from({ length: 10 }, (_, index) => ({
      ...computers[0], id: `computer-${index}`, name: 'x'.repeat(100_000),
    }))
    const host = target({ ...snapshot, info: { ...hostInfoFixture, hostname: 'z'.repeat(100_000) } }, {
      ...inventory, truncated: true, othersCount: 20,
      rows: Array.from({ length: 4096 }, (_, index) => row(index + 1, index, {
        executable: 'long'.repeat(1000), owner: 'session', sessionId: '🧑'.repeat(100),
      })),
    })
    const resolve = vi.fn(async () => host)
    const result = await oracleHostStatus(many, resolve, () => now)
    expect(resolve).toHaveBeenCalledTimes(8)
    expect(result.length).toBeLessThanOrEqual(HOST_STATUS_MAX_LENGTH)
    expect(result).toContain('truncated')
    expect(result).not.toContain('z'.repeat(101))
    expect(result).not.toContain('long'.repeat(26))
    const short = await oracleHostStatus(many, async () => target(), () => now)
    expect(short).toContain('2 computers omitted')
    expect(short).toContain('worker-2')
  })

  it.each([
    ['typed', true], ['typed', false], ['voice', true], ['proactive', false],
  ] as const)('is read-only and available to %s turns (Ask=%s)', async (source: ManagerMessageSource, ask: boolean) => {
    const resolve = vi.fn(async () => target())
    const host = {
      computers: () => computers,
      findComputer: (id: string) => computers.find((computer) => computer.id === id || computer.name === id),
      hostTelemetryTarget: resolve,
      messageSource: () => source, answerOnly: () => ask, now: () => new Date(now),
    } as ManagerToolHost
    const tool = createManagerTools(host, () => {}).find(({ name }) => name === 'get_host_status')!
    const result = await tool.handler({ computerId: 'Build node' }, {
      sessionId: 'manager', toolCallId: 'status', toolName: tool.name, arguments: {},
    })
    expect(managerToolMutability(tool.name)).toBe('read')
    expect(tool.description).toContain('slow')
    expect(result).toContain('studio-host · node')
    expect(resolve).toHaveBeenCalledExactlyOnceWith('node')
  })

  it('returns a disabled response through the tool without requiring host access', async () => {
    const host = {
      computers: () => computers, hostTelemetryTarget: vi.fn(async () => undefined),
      messageSource: () => 'typed', now: () => new Date(now),
    } as unknown as ManagerToolHost
    const tool = createManagerTools(host, () => {}).find(({ name }) => name === 'get_host_status')!
    expect(await tool.handler({}, { sessionId: 'manager', toolCallId: 'status', toolName: tool.name, arguments: {} }))
      .toContain('not available on this computer; host monitoring is turned off.')
  })
})
