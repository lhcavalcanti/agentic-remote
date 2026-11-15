import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HostHistorySchema, HostSnapshotSchema } from '../../shared/host-telemetry.js'
import { createLinuxHostTelemetryReader, type HostTelemetryReading, type HostTelemetryReader } from './reader.js'
import { HostTelemetrySampler } from './sampler.js'
import { hostInfoFixture, readingFixture } from './test-fixtures.js'

const startAt = Date.parse('2026-11-14T06:00:00Z')
const samplers: HostTelemetrySampler[] = []

function makeSampler(reader: HostTelemetryReader, extra: {
  sampleTimeoutMs?: number
  now?: () => number
  monotonicNow?: () => number
} = {}): HostTelemetrySampler {
  const sampler = new HostTelemetrySampler({
    dataDirectory: '/data',
    reader,
    sampleTimeoutMs: extra.sampleTimeoutMs,
    clock: { now: extra.now ?? Date.now, monotonicNow: extra.monotonicNow ?? Date.now },
  })
  samplers.push(sampler)
  return sampler
}

function deferredReading() {
  let resolve!: (reading: HostTelemetryReading) => void
  let reject!: (error: Error) => void
  const promise = new Promise<HostTelemetryReading>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

describe('HostTelemetrySampler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(startAt)
  })
  afterEach(() => {
    for (const sampler of samplers.splice(0)) sampler.stop()
    vi.useRealTimers()
  })

  it('is inert until started, starts once, and samples at 15 seconds without viewers', async () => {
    const reader = vi.fn(async () => readingFixture())
    const sampler = makeSampler(reader)
    expect(reader).not.toHaveBeenCalled()
    expect(sampler.snapshot()).toEqual({ info: null, latest: null, live: [], disk: null })
    sampler.start()
    sampler.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(reader).toHaveBeenCalledTimes(1)
    expect(sampler.snapshot().latest?.cpuPercent).toBeNull()
    expect(sampler.snapshot().latest?.netRxBytesPerSec).toBeNull()
    expect(sampler.snapshot().latest?.memoryUsedBytes).toBe(10_000 * 1024)
    expect(HostSnapshotSchema.safeParse(sampler.snapshot()).success).toBe(true)
    await vi.advanceTimersByTimeAsync(14_999)
    expect(reader).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(reader).toHaveBeenCalledTimes(2)
    sampler.stop()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(reader).toHaveBeenCalledTimes(2)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('switches cadence when viewers arrive/leave without duplicating timers', async () => {
    const reader = vi.fn(async () => readingFixture())
    const sampler = makeSampler(reader)
    sampler.start()
    await vi.advanceTimersByTimeAsync(5000)
    expect(reader).toHaveBeenCalledTimes(1)
    sampler.setViewers(1)
    await vi.advanceTimersByTimeAsync(0)
    expect(reader).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(999)
    sampler.setViewers(2)
    expect(reader).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(reader).toHaveBeenCalledTimes(3)
    sampler.setViewers(0)
    await vi.advanceTimersByTimeAsync(14_999)
    expect(reader).toHaveBeenCalledTimes(3)
    await vi.advanceTimersByTimeAsync(1)
    expect(reader).toHaveBeenCalledTimes(4)
    expect(sampler.status().intervalMs).toBe(15_000)
  })

  it('calculates CPU and per-device rates using the measured elapsed time', async () => {
    let index = 0
    const sampler = makeSampler(async () => readingFixture({
      stat: `cpu ${index * 50} 0 0 ${index * 50} 0 0 0 0 0 0`,
      netDev: `eth0: ${index * 2000} 0 0 0 0 0 0 0 ${index * 4000} 0 0 0 0 0 0 0`,
      diskstats: `8 0 sda 0 0 ${index * 10} 0 0 0 ${index++ * 20} 0 0 0 0`,
    }))
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(1000)
    expect(sampler.snapshot().latest).toMatchObject({
      cpuPercent: 50, netRxBytesPerSec: 2000, netTxBytesPerSec: 4000,
      diskReadBytesPerSec: 5120, diskWriteBytesPerSec: 10_240,
    })
  })

  it('does not overlap slow reads, even when viewer cadence changes mid-read', async () => {
    const first = deferredReading()
    const second = deferredReading()
    const reader = vi.fn().mockReturnValueOnce(first.promise).mockReturnValue(second.promise)
    const sampler = makeSampler(reader, { sampleTimeoutMs: 10_000 })
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(2500)
    sampler.setViewers(0)
    sampler.setViewers(1)
    expect(reader).toHaveBeenCalledTimes(1)
    expect(sampler.status().sampling).toBe(true)
    first.resolve(readingFixture())
    await vi.advanceTimersByTimeAsync(0)
    expect(reader).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(2500)
    expect(reader).toHaveBeenCalledTimes(2)
    sampler.stop()
    second.resolve(readingFixture())
    await vi.advanceTimersByTimeAsync(0)
    expect(sampler.status().samples).toBe(1)
  })

  it('times out/aborts a sample, retains the slot for an abort-ignoring reader, and discards late results', async () => {
    const first = deferredReading()
    let signal: AbortSignal | undefined
    const reader = vi.fn()
      .mockImplementationOnce((nextSignal: AbortSignal) => { signal = nextSignal; return first.promise })
      .mockResolvedValue(readingFixture({ loadavg: '9 8 7' }))
    const sampler = makeSampler(reader)
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(2000)
    expect(signal?.aborted).toBe(true)
    expect(sampler.status()).toMatchObject({ samples: 0, errorCount: 1, timeoutCount: 1, sampling: true })
    expect(sampler.status().lastError?.message).toContain('timed out')
    await vi.advanceTimersByTimeAsync(5000)
    expect(reader).toHaveBeenCalledTimes(1)
    first.resolve(readingFixture({ loadavg: '1 2 3' }))
    await vi.advanceTimersByTimeAsync(0)
    expect(reader).toHaveBeenCalledTimes(2)
    expect(sampler.status()).toMatchObject({ samples: 1, errorCount: 1, timeoutCount: 1 })
    expect(sampler.snapshot().latest?.load1).toBe(9)
    expect(sampler.snapshot().live).toHaveLength(1)
  })

  it('recovers after a timed-out reader cooperates with abort, counting the failure once', async () => {
    const reader = vi.fn()
      .mockImplementationOnce((signal: AbortSignal) => new Promise<HostTelemetryReading>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      }))
      .mockResolvedValue(readingFixture())
    const sampler = makeSampler(reader, { sampleTimeoutMs: 100 })
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(100)
    expect(sampler.status()).toMatchObject({ sampling: false, errorCount: 1, timeoutCount: 1 })
    await vi.advanceTimersByTimeAsync(900)
    expect(reader).toHaveBeenCalledTimes(2)
    expect(sampler.status()).toMatchObject({ samples: 1, errorCount: 1 })
  })

  it('holds the slot when aborted initial metadata still has a non-abortable disk read outstanding', async () => {
    let finish!: (value: { bsize: number; blocks: number; bavail: number }) => void
    const readSpace = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
      .mockResolvedValue({ bsize: 1, blocks: 10, bavail: 5 })
    let firstMetadata = true
    const reader = createLinuxHostTelemetryReader({
      dataDirectory: '/data', readSpace, systemInfo: () => hostInfoFixture,
      readText: async (path, signal) => {
        if (path === '/proc/version' && firstMetadata) {
          firstMetadata = false
          return new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
          })
        }
        return ''
      },
    })
    const sampler = makeSampler(reader, { sampleTimeoutMs: 100 })
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(2500)
    expect(readSpace).toHaveBeenCalledTimes(1)
    expect(sampler.status()).toMatchObject({ sampling: true, samples: 0, timeoutCount: 1 })
    finish({ bsize: 1, blocks: 10, bavail: 5 })
    await vi.advanceTimersByTimeAsync(0)
    expect(readSpace).toHaveBeenCalledTimes(2)
    expect(sampler.status()).toMatchObject({ sampling: false, samples: 1, timeoutCount: 1 })
  })

  it('contains synchronous/rejected reader errors and retries without throwing from its timer', async () => {
    const reader = vi.fn()
      .mockImplementationOnce(() => { throw new Error('private error text') })
      .mockRejectedValueOnce(Object.assign(new Error('private error text'), { code: 'EIO' }))
      .mockResolvedValue(readingFixture())
    const sampler = makeSampler(reader)
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(2000)
    expect(sampler.status()).toMatchObject({ samples: 1, errorCount: 2, timeoutCount: 0 })
    expect(sampler.status().lastError?.message).toBe('Sample failed: EIO')
    expect(sampler.snapshot().latest).not.toBeNull()
  })

  it('does not publish stopped reads or overlap one still settling when restarted', async () => {
    const first = deferredReading()
    const reader = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(readingFixture({ loadavg: '9 8 7' }))
    const sampler = makeSampler(reader)
    sampler.start()
    sampler.stop()
    sampler.start()
    await vi.advanceTimersByTimeAsync(1000)
    expect(reader).toHaveBeenCalledTimes(1)
    first.resolve(readingFixture())
    await vi.advanceTimersByTimeAsync(0)
    expect(sampler.snapshot().latest).toBeNull()
    await vi.advanceTimersByTimeAsync(14_000)
    expect(reader).toHaveBeenCalledTimes(2)
    expect(sampler.snapshot().latest?.load1).toBe(9)
  })

  it('keeps only the last 60 seconds and at most 61 live samples', async () => {
    const sampler = makeSampler(async () => readingFixture())
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(70_000)
    const snapshot = sampler.snapshot()
    expect(snapshot.live).toHaveLength(61)
    expect(snapshot.live[0].at).toBe(new Date(startAt + 10_000).toISOString())
    expect(snapshot.live.at(-1)).toEqual(snapshot.latest)
    sampler.stop()
    await vi.advanceTimersByTimeAsync(60_001)
    expect(sampler.snapshot().live).toEqual([])
    expect(sampler.snapshot().latest).toEqual(snapshot.latest)
  })

  it('caps the live ring even if an injected monotonic clock does not advance', async () => {
    const sampler = makeSampler(async () => readingFixture(), { monotonicNow: () => 0 })
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(65_000)
    expect(sampler.status().samples).toBe(66)
    expect(sampler.snapshot().live).toHaveLength(61)
  })

  it('rolls min/avg/max over minute boundaries, excluding unavailable readings', async () => {
    vi.setSystemTime(startAt + 58_000)
    let index = 0
    const sampler = makeSampler(async () => {
      const value = 1 + index++ * 2
      return readingFixture({ loadavg: `${value} 2 3`, netDev: index === 3 ? undefined : readingFixture().files.netDev })
    })
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(2000)
    const history = sampler.history()
    expect(HostHistorySchema.safeParse(history).success).toBe(true)
    expect(history).toHaveLength(2)
    expect(history[0]).toMatchObject({
      at: new Date(startAt).toISOString(), samples: 2,
      load1: { min: 1, avg: 2, max: 3 },
      netRxBytesPerSec: { min: 0, avg: 0, max: 0 },
    })
    expect(history[1]).toMatchObject({
      at: new Date(startAt + 60_000).toISOString(), samples: 1,
      load1: { min: 5, avg: 5, max: 5 }, netRxBytesPerSec: null,
    })
  })

  it('retains exactly 24 hours of minute buckets and expires history on idle reads', async () => {
    let minute = 0
    let wall = startAt
    const sampler = makeSampler(async () => {
      wall = startAt + minute++ * 60_000
      return readingFixture()
    }, { now: () => wall })
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(1_440_000)
    const history = sampler.history()
    expect(history).toHaveLength(1440)
    expect(history[0].at).toBe(new Date(startAt + 60_000).toISOString())
    expect(history.at(-1)?.at).toBe(new Date(startAt + 86_400_000).toISOString())
    sampler.stop()
    wall += 86_400_000
    expect(sampler.history()).toEqual([])
  })

  it('uses monotonic time for rates when the wall clock changes', async () => {
    let wall = startAt
    let value = 0
    const sampler = makeSampler(async () => readingFixture({
      netDev: `eth0: ${value++ * 1000} 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0`,
    }), { now: () => wall })
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(0)
    wall -= 3_600_000
    await vi.advanceTimersByTimeAsync(1000)
    expect(sampler.snapshot().latest?.netRxBytesPerSec).toBe(1000)
    expect(sampler.snapshot().latest?.at).toBe(new Date(wall).toISOString())
  })

  it('produces partial samples for missing files and clears rate baselines across gaps', async () => {
    let index = 0
    const reader = vi.fn(async () => {
      index += 1
      const reading = readingFixture()
      if (index === 2) {
        reading.files = { meminfo: reading.files.meminfo }
        reading.disk = null
        reading.errors = ['/proc/stat: ENOENT', '/proc/net/dev: ENOENT']
      }
      return reading
    })
    const sampler = makeSampler(reader)
    sampler.setViewers(1)
    sampler.start()
    await vi.advanceTimersByTimeAsync(1000)
    expect(sampler.snapshot().latest).toMatchObject({
      cpuPercent: null, memoryUsedBytes: 10_000 * 1024, netRxBytesPerSec: null, diskReadBytesPerSec: null, load1: null,
    })
    expect(sampler.snapshot().disk).toBeNull()
    expect(sampler.status().errorCount).toBe(1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(sampler.snapshot().latest?.netRxBytesPerSec).toBeNull()
    expect(sampler.snapshot().latest?.cpuPercent).toBeNull()
    await vi.advanceTimersByTimeAsync(1000)
    expect(sampler.snapshot().latest?.netRxBytesPerSec).toBe(0)
  })

  it('integrates the container-style reader without losing available data', async () => {
    const sampler = makeSampler(createLinuxHostTelemetryReader({
      dataDirectory: '/data',
      readText: async (path) => {
        if (path === '/proc/meminfo') return readingFixture().files.meminfo!
        throw Object.assign(new Error(), { code: 'ENOENT' })
      },
      readSpace: async () => { throw Object.assign(new Error(), { code: 'ENOSYS' }) },
      systemInfo: () => hostInfoFixture,
      uptime: () => 10,
      wslDistro: '',
    }))
    sampler.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(sampler.snapshot().latest).toMatchObject({
      memoryAvailableBytes: 6000 * 1024, swapUsedBytes: 500 * 1024, cpuPercent: null,
      netRxBytesPerSec: null, diskReadBytesPerSec: null, load1: null,
    })
    expect(sampler.status()).toMatchObject({ samples: 1, errorCount: 1 })
  })

  it('counts malformed source data without inventing metric values', async () => {
    const sampler = makeSampler(async () => readingFixture({ stat: 'bad', netDev: 'bad', loadavg: 'bad' }))
    sampler.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(sampler.status().errorCount).toBe(1)
    expect(sampler.status().lastError?.message).toContain('INVALID')
    expect(sampler.snapshot().latest).toMatchObject({ cpuPercent: null, netRxBytesPerSec: null, load1: null })
  })

  it('prevents consumers from mutating retained readings, info and aggregates', async () => {
    const sampler = makeSampler(async () => readingFixture())
    sampler.start()
    await vi.advanceTimersByTimeAsync(0)
    const snapshot = sampler.snapshot()
    snapshot.latest!.load1 = 999
    snapshot.live[0].load1 = 999
    snapshot.info!.hostname = 'changed'
    snapshot.disk!.freeBytes = 0
    sampler.history()[0].load1!.avg = 999
    expect(sampler.snapshot()).toMatchObject({
      latest: { load1: 1 }, live: [{ load1: 1 }], info: { hostname: 'test-computer' }, disk: { freeBytes: 60_000 },
    })
    expect(sampler.history()[0].load1?.avg).toBe(1)
  })
})
