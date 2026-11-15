import { randomUUID } from 'node:crypto'
import { mkdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary } from '../../shared/contracts.js'
import type { HostSnapshot } from '../../shared/host-telemetry.js'
import { buildApp } from '../app.js'
import {
  classifyHostNotification, HOST_ALERT_COOLDOWN_MS, notificationIdentity, type NotificationCursors,
} from '../notification-classifier.js'
import { NotificationCenterService } from '../notification-center-service.js'
import { NotificationStore } from '../notification-store.js'
import { HostAlertMonitor } from './alerts.js'
import { HostTelemetrySampler } from './sampler.js'
import { HostTelemetryService, type HostTelemetryTarget } from './service.js'
import { hostInfoFixture, readingFixture } from './test-fixtures.js'

const start = Date.parse('2026-11-14T18:00:00Z')
const computer: ComputerSummary = { id: 'studio', name: 'Studio', isLocal: true, online: true }
function snapshot(at: number, memory = 91, free = 10): HostSnapshot {
  return {
    info: { ...hostInfoFixture, totalMemoryBytes: 100 },
    latest: {
      at: new Date(at).toISOString(), cpuPercent: 0, memoryUsedBytes: memory, memoryAvailableBytes: 100 - memory,
      swapUsedBytes: 0, netRxBytesPerSec: null, netTxBytesPerSec: null,
      diskReadBytesPerSec: null, diskWriteBytesPerSec: null, load1: 0, load5: 0, load15: 0,
    },
    disk: { mount: '/data', totalBytes: 100, freeBytes: free }, live: [],
  }
}
function observe(cursors: NotificationCursors, ms: number, memory = 91, free = 10) {
  return classifyHostNotification(computer, snapshot(start + ms, memory, free), cursors, new Date(start + ms).toISOString())
}
function sustained(cursors: NotificationCursors, from = 0) {
  const records = []
  for (let ms = from; ms <= from + 120_000; ms += 15_000) records.push(...observe(cursors, ms))
  return records
}

describe('canonical resource alert episodes', () => {
  it.each([-3_600_000, 3_600_000])('uses monotonic sample age despite node clock skew %s', (skew) => {
    const cursors: NotificationCursors = {}
    const records = []
    for (let ms = 0; ms <= 120_000; ms += 15_000) {
      records.push(...classifyHostNotification({ ...computer, isLocal: false },
        { ...snapshot(start + ms + skew), sampleAgeMs: 1000 }, cursors, new Date(start + ms).toISOString()))
    }
    expect(records).toHaveLength(1)
    expect(records[0].title).toContain('Memory pressure')
    expect(classifyHostNotification(computer, { ...snapshot(start, 99, 1), sampleAgeMs: 31_000 },
      {}, new Date(start).toISOString())).toEqual([])
  })
  it('requires strictly over 90% memory for 2 minutes and latches until 85% recovery', () => {
    const cursors: NotificationCursors = {}
    expect(observe(cursors, 0, 90)).toEqual([])
    expect(observe(cursors, 15_000)).toEqual([])
    for (let ms = 30_000; ms < 135_000; ms += 15_000) expect(observe(cursors, ms)).toEqual([])
    const records = observe(cursors, 135_000)
    expect(records).toEqual([expect.objectContaining({ kind: 'host.alert', severity: 'warning', computerId: 'studio' })])
    expect(records[0].id).toBe(notificationIdentity('host.alert', 'studio', 'memory', new Date(start + 15_000).toISOString()))
    expect(observe(cursors, 150_000, 89)).toEqual([])
    expect(observe(cursors, 165_000, 91)).toEqual([])
    expect(observe(cursors, HOST_ALERT_COOLDOWN_MS + 150_000, 91)).toEqual([])
    expect(observe(cursors, HOST_ALERT_COOLDOWN_MS + 165_000, 85)).toEqual([])
    expect(sustained(cursors, HOST_ALERT_COOLDOWN_MS + 180_000)).toHaveLength(1)
  })

  it('resets pending memory pressure below the trigger, across gaps, missing readings and stale samples', () => {
    for (const reset of ['threshold', 'gap', 'missing', 'stale'] as const) {
      const cursors: NotificationCursors = {}
      observe(cursors, 0)
      observe(cursors, 30_000)
      observe(cursors, 60_000)
      if (reset === 'threshold') observe(cursors, 75_000, 90)
      if (reset === 'missing') classifyHostNotification(computer, undefined, cursors, new Date(start + 75_000).toISOString())
      if (reset === 'stale') classifyHostNotification(computer, snapshot(start + 60_000), cursors, new Date(start + 95_000).toISOString())
      const from = reset === 'gap' ? 120_000 : 90_000
      expect(observe(cursors, from)).toEqual([])
      expect(observe(cursors, from + 30_000)).toEqual([])
      expect(observe(cursors, from + 60_000)).toEqual([])
      expect(observe(cursors, from + 90_000)).toEqual([])
      expect(observe(cursors, from + 120_000)).toHaveLength(1)
    }
  })

  it('triggers disk below 5%, recovers at 7%, and suppresses a new episode for 30 minutes', () => {
    const cursors: NotificationCursors = {}
    expect(observe(cursors, 0, 50, 5)).toEqual([])
    const [first] = observe(cursors, 15_000, 50, 4)
    expect(first.body).toContain('4.0% free')
    expect(observe(cursors, 30_000, 50, 6)).toEqual([])
    expect(observe(cursors, 45_000, 50, 4)).toEqual([])
    observe(cursors, 60_000, 50, 7)
    expect(observe(cursors, 75_000, 50, 4)).toEqual([])
    expect(observe(cursors, HOST_ALERT_COOLDOWN_MS, 50, 4)).toEqual([])
    const [second] = observe(cursors, HOST_ALERT_COOLDOWN_MS + 15_000, 50, 4)
    expect(second.id).not.toBe(first.id)
    expect(second.coalesceKey).toBe(first.coalesceKey)
    expect(second.id).toBe(notificationIdentity('host.alert', 'studio', 'disk', new Date(start + 75_000).toISOString()))
    expect(observe(cursors, 2 * HOST_ALERT_COOLDOWN_MS, 50, 4)).toEqual([])
  })

  it('keeps computer/condition identities independent and ignores duplicate and out-of-order samples', () => {
    const cursors: NotificationCursors = {}
    const first = observe(cursors, 0, 50, 4)[0]
    expect(observe(cursors, 0, 50, 7)).toEqual([])
    expect(observe(cursors, -15_000, 50, 7)).toEqual([])
    expect(observe(cursors, 15_000, 50, 4)).toEqual([])
    const other = classifyHostNotification({ ...computer, id: 'other' }, snapshot(start, 50, 4), cursors, new Date(start).toISOString())[0]
    expect(other.id).not.toBe(first.id)
    expect(sustained(cursors, 30_000)[0].id).not.toBe(first.id)
  })

  it('does not turn absent, zero-total, stale or future readings into resource pressure', () => {
    for (const data of [
      undefined,
      { info: null, latest: null, live: [], disk: null },
      { ...snapshot(start), info: { ...hostInfoFixture, totalMemoryBytes: 0 }, disk: { mount: '/', totalBytes: 0, freeBytes: 0 } },
      snapshot(start - 31_000, 99, 1),
      snapshot(start + 6000, 99, 1),
    ]) expect(classifyHostNotification(computer, data, {}, new Date(start).toISOString())).toEqual([])
  })
})

describe('host alert monitor lifecycle', () => {
  afterEach(() => { vi.useRealTimers() })

  it('polls local/remote snapshots with no scans or viewers and stops without late admissions', async () => {
    vi.useFakeTimers()
    let finish!: (data: HostSnapshot) => void
    const target: HostTelemetryTarget = {
      snapshot: vi.fn(() => new Promise<HostSnapshot>((resolve) => { finish = resolve })),
      processes: vi.fn(), history: vi.fn(), subscribe: vi.fn(),
    }
    const host = vi.fn(async () => {})
    const monitor = new HostAlertMonitor({
      computers: () => [computer], resolve: vi.fn(async () => target),
      notifications: { host }, warn: vi.fn(),
    })
    monitor.start()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(target.snapshot).toHaveBeenCalledTimes(1)
    const stopping = monitor.stop()
    finish(snapshot(start))
    await stopping
    expect(host).not.toHaveBeenCalled()
    expect(target.processes).not.toHaveBeenCalled()
    expect(target.subscribe).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('polls every 15s, resets offline/unavailable observations, and isolates persistence failures', async () => {
    vi.useFakeTimers()
    const resolve = vi.fn(async () => { throw new Error('unavailable') })
    const host = vi.fn(async () => {})
    const warn = vi.fn()
    const monitor = new HostAlertMonitor({
      computers: () => [computer, { ...computer, id: 'offline', online: false }],
      resolve, notifications: { host }, warn,
    })
    monitor.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(host).toHaveBeenCalledWith(computer, undefined)
    expect(resolve).toHaveBeenCalledTimes(1)
    host.mockRejectedValueOnce(new Error('storage error'))
    await vi.advanceTimersByTimeAsync(15_000)
    expect(warn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(15_000)
    expect(resolve).toHaveBeenCalledTimes(3)
    await monitor.stop()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('bounds node fan-out to four and waits for every read even when another admission fails', async () => {
    vi.useFakeTimers()
    const finishes: Array<() => void> = []
    let active = 0
    let peak = 0
    const resolve = vi.fn(async () => ({
      snapshot: async () => {
        active += 1
        peak = Math.max(peak, active)
        await new Promise<void>((finish) => finishes.push(finish))
        active -= 1
        return snapshot(start)
      },
    } as HostTelemetryTarget))
    const host = vi.fn(async () => {})
    host.mockRejectedValueOnce(new Error('storage error'))
    const monitor = new HostAlertMonitor({
      computers: () => Array.from({ length: 9 }, (_, index) => ({ ...computer, id: `c-${index}` })),
      resolve, notifications: { host }, warn: vi.fn(),
    })
    monitor.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(resolve).toHaveBeenCalledTimes(4)
    finishes.shift()!()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(resolve).toHaveBeenCalledTimes(4)
    finishes.splice(0).forEach((finish) => finish())
    await vi.advanceTimersByTimeAsync(0)
    expect(resolve).toHaveBeenCalledTimes(8)
    finishes.splice(0).forEach((finish) => finish())
    await vi.advanceTimersByTimeAsync(0)
    expect(resolve).toHaveBeenCalledTimes(9)
    const stopping = monitor.stop()
    finishes.splice(0).forEach((finish) => finish())
    await stopping
    expect(peak).toBe(4)
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('durable resource alerts and flag wiring', () => {
  const directories: string[] = []
  const apps: Awaited<ReturnType<typeof buildApp>>[] = []
  afterEach(async () => {
    for (const runtime of apps.splice(0)) await runtime.app.close()
    for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true })
    vi.unstubAllEnvs()
  })
  async function directory() {
    const root = path.resolve(`.host-alert-test-${randomUUID()}`)
    await mkdir(root, { mode: 0o700 })
    directories.push(root)
    return root
  }

  it('persists episode/cooldown across restart without resurrecting read or dismissed records', async () => {
    const root = await directory()
    let at = start
    const make = async () => {
      const store = new NotificationStore(root, { now: () => at })
      await store.initialize()
      return new NotificationCenterService(store, {
        now: () => at, mutedSessions: () => [], readSession: vi.fn(),
      })
    }
    let service = await make()
    await service.host(computer, snapshot(at, 50, 4))
    const [first] = await service.store.list()
    await service.store.markRead(first.id)
    await service.store.dismiss(first.id)
    await service.flush()
    service = await make()
    at += 15_000
    await service.host(computer, snapshot(at, 50, 4))
    expect(await service.store.list()).toEqual([])
    await service.host(computer, snapshot(at += 15_000, 50, 7))
    await service.host(computer, snapshot(at += 15_000, 50, 4))
    await service.flush()
    service = await make()
    await service.host(computer, snapshot(at += 15_000, 50, 4))
    expect(await service.store.list()).toEqual([])
    at = start + HOST_ALERT_COOLDOWN_MS
    await service.host(computer, snapshot(at, 50, 4))
    const [next] = await service.store.list()
    expect(next.id).not.toBe(first.id)
    // Existing health-error alerts still use their original severity and classifier.
    await service.hub({ type: 'error', notify: true, computerId: 'studio', message: 'CLI unavailable' })
    expect(await service.store.list()).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'host.alert', severity: 'error' }),
      expect.objectContaining({ kind: 'host.alert', severity: 'warning' }),
    ]))
  })

  it('restarts pending memory duration after an unobserved restart gap', async () => {
    const root = await directory()
    let at = start
    const make = async () => {
      const store = new NotificationStore(root, { now: () => at })
      await store.initialize()
      return new NotificationCenterService(store, {
        now: () => at, mutedSessions: () => [], readSession: vi.fn(),
      })
    }
    let service = await make()
    for (let ms = 0; ms <= 60_000; ms += 15_000) {
      at = start + ms
      await service.host(computer, snapshot(at))
    }
    await service.flush()
    service = await make()
    for (let ms = 75_000; ms < 195_000; ms += 15_000) {
      at = start + ms
      await service.host(computer, snapshot(at))
      expect(await service.store.list()).toEqual([])
    }
    at = start + 195_000
    await service.host(computer, snapshot(at))
    expect(await service.store.list()).toEqual([expect.objectContaining({
      id: notificationIdentity('host.alert', 'studio', 'memory', new Date(start + 75_000).toISOString()),
    })])
  })

  it('does not rewrite notification storage for healthy samples or latched pressure', async () => {
    let at = start
    const store = new NotificationStore(await directory(), { now: () => at })
    await store.initialize()
    const service = new NotificationCenterService(store, {
      now: () => at, mutedSessions: () => [], readSession: vi.fn(),
    })
    const original = (await stat(store.statePath, { bigint: true })).ino
    for (let ms = 0; ms <= 120_000; ms += 15_000) {
      at = start + ms
      await service.host(computer, snapshot(at, 50, 50))
    }
    expect((await stat(store.statePath, { bigint: true })).ino).toBe(original)
    await service.host(computer, snapshot(at += 15_000, 50, 4))
    const alerted = (await stat(store.statePath, { bigint: true })).ino
    expect(alerted).not.toBe(original)
    for (let ms = 0; ms < 120_000; ms += 15_000) {
      await service.host(computer, snapshot(at += 15_000, 50, 4))
    }
    expect((await stat(store.statePath, { bigint: true })).ino).toBe(alerted)
  })

  it.each(['disk', 'memory'] as const)('retries a %s alert after a failed notification write', async (condition) => {
    let at = start
    const store = new NotificationStore(await directory(), { now: () => at })
    await store.initialize()
    const service = new NotificationCenterService(store, {
      now: () => at, mutedSessions: () => [], readSession: vi.fn(),
    })
    if (condition === 'memory') {
      for (let ms = 0; ms < 120_000; ms += 15_000) {
        at = start + ms
        await service.host(computer, snapshot(at))
      }
      at = start + 120_000
    }
    const reading = snapshot(at, condition === 'memory' ? 91 : 50, condition === 'disk' ? 4 : 50)
    const persist = vi.spyOn(store as unknown as { persist(state: unknown): Promise<void> }, 'persist')
      .mockRejectedValueOnce(new Error('Notification write failed'))
    try {
      await expect(service.host(computer, reading)).rejects.toThrow('Notification write failed')
      expect(await store.list()).toEqual([])
      at += 15_000
      await service.host(computer, reading)
      expect(await store.list()).toEqual([expect.objectContaining({
        kind: 'host.alert', title: expect.stringContaining(condition === 'disk' ? 'Low disk space' : 'Memory pressure'),
      })])
      await service.host(computer, reading)
      expect(await store.list()).toHaveLength(1)
      expect(persist).toHaveBeenCalledTimes(2)
    } finally { persist.mockRestore() }
  })

  it.each([
    ['off', 'off', 'hub', false],
    ['on', 'off', 'hub', false],
    ['off', 'on', 'hub', false],
    ['on', 'on', 'hub', true],
    ['on', 'on', 'node', false],
  ] as const)('constructs alerts only for both flags on the hub: host=%s notifications=%s role=%s', async (hostFlag, notificationFlag, role, enabled) => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', hostFlag)
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', notificationFlag)
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
    const phases: string[] = []
    const scan = vi.fn()
    const runtime = await buildApp({
      dataDirectory: await directory(), role, logger: false, managerAgent: false,
      transcriptionService: { initialize: async () => {}, stop: async () => {}, transcribe: vi.fn() },
      startupPhases: { run: async (name, work) => { phases.push(name); return work() } },
      hostTelemetryFactory: (dataDirectory, context) => new HostTelemetryService(
        new HostTelemetrySampler({ dataDirectory, reader: async () => readingFixture() }), context, scan,
      ),
    })
    apps.push(runtime)
    const record = runtime.notificationCenter ? vi.spyOn(runtime.notificationCenter, 'host') : undefined
    await runtime.app.ready()
    expect(Boolean(runtime.hostAlerts)).toBe(enabled)
    expect(phases.includes('hostAlerts.start')).toBe(enabled)
    if (enabled) {
      await vi.waitFor(() => expect(record).toHaveBeenCalled())
      expect(runtime.hostTelemetry!.sampler.status()).toMatchObject({ viewers: 0, intervalMs: 15_000 })
    } else if (record) expect(record).not.toHaveBeenCalled()
    expect(scan).not.toHaveBeenCalled()
  })
})
