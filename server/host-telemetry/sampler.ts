import { performance } from 'node:perf_hooks'
import {
  HOST_TELEMETRY_LIVE_WINDOW_MS,
  HOST_TELEMETRY_MAX_LIVE_SAMPLES,
  HOST_TELEMETRY_MAX_MINUTES,
  hostMetricNames,
  type HostInfo,
  type HostMetric,
  type HostMinuteAggregate,
  type HostSample,
  type HostSnapshot,
  type DiskSpace,
} from '../../shared/host-telemetry.js'
import {
  cpuUtilization,
  deviceRates,
  parseCpuStat,
  parseDiskstats,
  parseLoadavg,
  parseMeminfo,
  parseNetDev,
  type CpuCounters,
  type DeviceCounters,
} from './parsers.js'
import { createLinuxHostTelemetryReader, hostTelemetryProcFiles, type HostTelemetryReader, type HostTelemetryReading } from './reader.js'

export const HOST_TELEMETRY_ACTIVE_INTERVAL_MS = 1000
export const HOST_TELEMETRY_IDLE_INTERVAL_MS = 15_000
export const HOST_TELEMETRY_SAMPLE_TIMEOUT_MS = 2000
const MINUTE_MS = 60_000

export interface HostTelemetryClock {
  now(): number
  monotonicNow(): number
  setTimeout(callback: () => void, delayMs: number): ReturnType<typeof setTimeout>
  clearTimeout(timer: ReturnType<typeof setTimeout>): void
}

export interface HostTelemetrySamplerOptions {
  dataDirectory: string
  reader?: HostTelemetryReader
  clock?: Partial<HostTelemetryClock>
  sampleTimeoutMs?: number
}

export interface HostTelemetrySamplerStatus {
  running: boolean
  sampling: boolean
  viewers: number
  intervalMs: number
  samples: number
  errorCount: number
  timeoutCount: number
  lastError: { at: string; message: string } | null
}

interface MetricAccumulator {
  min: number
  max: number
  sum: number
  count: number
}
interface MinuteAccumulator {
  samples: number
  metrics: Partial<Record<HostMetric, MetricAccumulator>>
}
interface SamplingAttempt {
  controller: AbortController
  cancelled: boolean
  timedOut: boolean
  timeout?: ReturnType<typeof setTimeout>
}

/**
 * Standalone and inert until start(). The owning feature must construct/start
 * it only when the effective hostMonitor hub flag is on.
 */
export class HostTelemetrySampler {
  private readonly reader: HostTelemetryReader
  private readonly clock: HostTelemetryClock
  private readonly sampleTimeoutMs: number
  private running = false
  private viewers = 0
  private timer?: ReturnType<typeof setTimeout>
  private attempt?: SamplingAttempt
  private lastStartedAt = 0
  private previous?: { networkAt: number; diskAt: number; cpu?: CpuCounters; network?: DeviceCounters; disk?: DeviceCounters }
  private info: HostInfo | null = null
  private latest: HostSample | null = null
  private disk: DiskSpace | null = null
  private live: { at: number; sample: HostSample }[] = []
  private readonly minutes = new Map<number, MinuteAccumulator>()
  private samples = 0
  private errorCount = 0
  private timeoutCount = 0
  private lastError: HostTelemetrySamplerStatus['lastError'] = null
  private readonly listeners = new Set<(snapshot: HostSnapshot) => void>()

  constructor(options: HostTelemetrySamplerOptions) {
    this.clock = {
      now: () => Date.now(),
      monotonicNow: () => performance.now(),
      setTimeout: (callback, delayMs) => setTimeout(callback, delayMs),
      clearTimeout: (timer) => clearTimeout(timer),
      ...options.clock,
    }
    this.reader = options.reader ?? createLinuxHostTelemetryReader({
      dataDirectory: options.dataDirectory,
      monotonicNow: this.clock.monotonicNow,
    })
    this.sampleTimeoutMs = options.sampleTimeoutMs ?? HOST_TELEMETRY_SAMPLE_TIMEOUT_MS
    if (!Number.isFinite(this.sampleTimeoutMs) || this.sampleTimeoutMs <= 0) {
      throw new RangeError('sampleTimeoutMs must be positive and finite')
    }
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.previous = undefined
    if (!this.attempt) void this.collect()
  }

  stop(): void {
    this.running = false
    this.clearTimer()
    if (this.attempt) {
      this.attempt.cancelled = true
      if (this.attempt.timeout !== undefined) this.clock.clearTimeout(this.attempt.timeout)
      this.attempt.controller.abort()
    }
  }

  setViewers(count: number): void {
    const wasActive = this.viewers > 0
    this.viewers = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
    if (wasActive !== (this.viewers > 0)) this.schedule()
  }

  subscribe(listener: (snapshot: HostSnapshot) => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  snapshot(): HostSnapshot {
    this.pruneLive(this.clock.monotonicNow())
    return {
      info: this.info ? { ...this.info } : null,
      latest: this.latest ? { ...this.latest } : null,
      live: this.live.map(({ sample }) => ({ ...sample })),
      disk: this.disk ? { ...this.disk } : null,
    }
  }

  /** Includes the current partial minute; gaps and unavailable metrics stay empty. */
  history(): HostMinuteAggregate[] {
    this.pruneMinutes(this.clock.now())
    return [...this.minutes.entries()]
      .sort(([left], [right]) => left - right)
      .map(([at, minute]) => ({
        at: new Date(at).toISOString(),
        samples: minute.samples,
        ...Object.fromEntries(hostMetricNames.map((name) => {
          const metric = minute.metrics[name]
          return [name, metric ? { min: metric.min, avg: metric.sum / metric.count, max: metric.max } : null]
        })) as Pick<HostMinuteAggregate, HostMetric>,
      }))
  }

  status(): HostTelemetrySamplerStatus {
    return {
      running: this.running,
      sampling: this.attempt !== undefined,
      viewers: this.viewers,
      intervalMs: this.intervalMs,
      samples: this.samples,
      errorCount: this.errorCount,
      timeoutCount: this.timeoutCount,
      lastError: this.lastError ? { ...this.lastError } : null,
    }
  }

  private get intervalMs(): number {
    return this.viewers > 0 ? HOST_TELEMETRY_ACTIVE_INTERVAL_MS : HOST_TELEMETRY_IDLE_INTERVAL_MS
  }

  private clearTimer(): void {
    if (this.timer !== undefined) this.clock.clearTimeout(this.timer)
    this.timer = undefined
  }

  private schedule(): void {
    this.clearTimer()
    if (!this.running || this.attempt) return
    const delay = Math.max(0, this.lastStartedAt + this.intervalMs - this.clock.monotonicNow())
    this.timer = this.clock.setTimeout(() => {
      this.timer = undefined
      void this.collect()
    }, delay)
    this.timer.unref?.()
  }

  private async collect(): Promise<void> {
    if (!this.running || this.attempt) return
    const attempt: SamplingAttempt = { controller: new AbortController(), cancelled: false, timedOut: false }
    this.attempt = attempt
    this.lastStartedAt = this.clock.monotonicNow()
    try {
      attempt.timeout = this.clock.setTimeout(() => {
        attempt.timedOut = true
        this.timeoutCount += 1
        this.recordError(`Sample timed out after ${this.sampleTimeoutMs}ms`)
        attempt.controller.abort()
      }, this.sampleTimeoutMs)
      attempt.timeout.unref?.()
      const reading = await this.reader(attempt.controller.signal)
      if (!attempt.cancelled && !attempt.timedOut && this.running) this.accept(reading)
    } catch (error) {
      if (!attempt.cancelled && !attempt.timedOut) {
        const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
        this.recordError(typeof code === 'string' && /^[A-Z0-9_]{1,40}$/.test(code)
          ? `Sample failed: ${code}` : 'Sample failed')
      }
    } finally {
      if (attempt.timeout !== undefined) this.clock.clearTimeout(attempt.timeout)
      // An abort-ignoring reader still owns the slot until it really settles.
      this.attempt = undefined
      this.schedule()
    }
  }

  private accept(reading: HostTelemetryReading): void {
    const at = this.clock.now()
    const monotonicAt = this.clock.monotonicNow()
    const files = reading.files
    const cpu = files.stat === undefined ? undefined : parseCpuStat(files.stat)
    const memory = parseMeminfo(files.meminfo ?? '')
    const network = files.netDev === undefined ? undefined : parseNetDev(files.netDev)
    const disk = files.diskstats === undefined ? undefined : parseDiskstats(files.diskstats)
    const load = files.loadavg === undefined ? undefined : parseLoadavg(files.loadavg)
    const errors = [...reading.errors]
    for (const [file, valid] of [
      ['stat', cpu !== undefined],
      ['meminfo', memory.totalMemoryBytes !== null || memory.memoryAvailableBytes !== null],
      ['netDev', network !== undefined],
      ['diskstats', disk !== undefined],
      ['loadavg', load !== undefined],
    ] as const) {
      if (files[file] !== undefined && !valid) errors.push(`${hostTelemetryProcFiles[file]}: INVALID`)
    }
    if (errors.length) this.recordError(errors.join('; ').slice(0, 1000))
    const networkAt = reading.capturedAt?.netDev ?? this.lastStartedAt
    const diskAt = reading.capturedAt?.diskstats ?? this.lastStartedAt
    const networkElapsed = this.previous ? networkAt - this.previous.networkAt : 0
    const diskElapsed = this.previous ? diskAt - this.previous.diskAt : 0
    const networkRate = deviceRates(this.previous?.network, network, networkElapsed)
    const diskRate = deviceRates(this.previous?.disk, disk, diskElapsed, 512n)
    const sample: HostSample = {
      at: new Date(at).toISOString(),
      cpuPercent: cpuUtilization(this.previous?.cpu, cpu),
      memoryUsedBytes: memory.memoryUsedBytes,
      memoryAvailableBytes: memory.memoryAvailableBytes,
      swapUsedBytes: memory.swapUsedBytes,
      netRxBytesPerSec: networkRate?.readBytesPerSec ?? null,
      netTxBytesPerSec: networkRate?.writeBytesPerSec ?? null,
      diskReadBytesPerSec: diskRate?.readBytesPerSec ?? null,
      diskWriteBytesPerSec: diskRate?.writeBytesPerSec ?? null,
      load1: load?.load1 ?? null,
      load5: load?.load5 ?? null,
      load15: load?.load15 ?? null,
    }
    this.previous = { networkAt, diskAt, cpu, network, disk }
    this.info = {
      ...reading.info,
      totalMemoryBytes: memory.totalMemoryBytes ?? reading.info.totalMemoryBytes,
    }
    this.latest = sample
    this.disk = reading.disk ? { ...reading.disk } : null
    this.live.push({ at: monotonicAt, sample })
    this.pruneLive(monotonicAt)
    this.aggregate(at, sample)
    this.samples += 1
    if (this.listeners.size) {
      const snapshot = this.snapshot()
      for (const listener of this.listeners) listener(snapshot)
    }
  }

  private recordError(message: string): void {
    this.errorCount += 1
    this.lastError = { at: new Date(this.clock.now()).toISOString(), message }
  }

  private pruneLive(at: number): void {
    this.live = this.live.filter((entry) => entry.at >= at - HOST_TELEMETRY_LIVE_WINDOW_MS)
      .slice(-HOST_TELEMETRY_MAX_LIVE_SAMPLES)
  }

  private aggregate(at: number, sample: HostSample): void {
    const minuteAt = Math.floor(at / MINUTE_MS) * MINUTE_MS
    let minute = this.minutes.get(minuteAt)
    if (!minute) {
      minute = { samples: 0, metrics: {} }
      this.minutes.set(minuteAt, minute)
    }
    minute.samples += 1
    for (const name of hostMetricNames) {
      const value = sample[name]
      if (value === null) continue
      const metric = minute.metrics[name]
      if (metric) {
        metric.min = Math.min(metric.min, value)
        metric.max = Math.max(metric.max, value)
        metric.sum += value
        metric.count += 1
      } else {
        minute.metrics[name] = { min: value, max: value, sum: value, count: 1 }
      }
    }
    this.pruneMinutes(at)
  }

  private pruneMinutes(at: number): void {
    const currentMinute = Math.floor(at / MINUTE_MS) * MINUTE_MS
    const oldestMinute = currentMinute - (HOST_TELEMETRY_MAX_MINUTES - 1) * MINUTE_MS
    for (const minute of this.minutes.keys()) {
      if (minute < oldestMinute || minute > currentMinute) this.minutes.delete(minute)
    }
    while (this.minutes.size > HOST_TELEMETRY_MAX_MINUTES) {
      this.minutes.delete(Math.min(...this.minutes.keys()))
    }
  }
}
