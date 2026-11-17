import { performance } from 'node:perf_hooks'
import type { HostProcesses, HostSnapshot, HostMinuteAggregate } from '../../shared/host-telemetry.js'
import { scanProcesses, type ProcessScanContext } from './processes.js'
import { HostTelemetrySampler } from './sampler.js'

export const HOST_TELEMETRY_MAX_VIEWERS = 32
export const HOST_PROCESSES_INTERVAL_MS = 5000

export interface HostTelemetryTarget {
  snapshot(): HostSnapshot | Promise<HostSnapshot>
  history(): HostMinuteAggregate[] | Promise<HostMinuteAggregate[]>
  processes(): Promise<HostProcesses>
  subscribe(sample: (snapshot: HostSnapshot) => void, ended: () => void): (() => void) | Promise<() => void>
}

export function hostTelemetryError(message: string, statusCode: number, code?: string): Error & { statusCode: number; code?: string } {
  return Object.assign(new Error(message), { statusCode, ...(code === undefined ? {} : { code }) })
}

/** One instance per owning computer, never constructed with the feature off. */
export class HostTelemetryService implements HostTelemetryTarget {
  private readonly viewers = new Set<() => void>()
  private lastScan = -Infinity
  private scanning = false
  private stopped = false

  constructor(
    readonly sampler: HostTelemetrySampler,
    private readonly processContext: ProcessScanContext,
    private readonly scan = scanProcesses,
    private readonly now = () => performance.now(),
  ) {}

  start(): void {
    this.sampler.start()
  }

  stop(): void {
    this.stopped = true
    for (const close of [...this.viewers]) close()
    this.sampler.stop()
  }

  snapshot(): HostSnapshot {
    return this.sampler.snapshot()
  }

  history(): HostMinuteAggregate[] {
    return this.sampler.history()
  }

  subscribe(sample: (snapshot: HostSnapshot) => void, ended: () => void): () => void {
    if (this.stopped) throw hostTelemetryError('Host monitoring stopped', 503)
    if (this.viewers.size >= HOST_TELEMETRY_MAX_VIEWERS) {
      throw hostTelemetryError('Too many host monitor viewers', 429)
    }
    let active = true
    const unsubscribe = this.sampler.subscribe(sample)
    const close = () => {
      if (!active) return
      active = false
      unsubscribe()
      this.viewers.delete(close)
      this.sampler.setViewers(this.viewers.size)
      ended()
    }
    this.viewers.add(close)
    this.sampler.setViewers(this.viewers.size)
    try {
      sample(this.snapshot())
    } catch (error) {
      close()
      throw error
    }
    return close
  }

  async processes(): Promise<HostProcesses> {
    if (this.stopped) throw hostTelemetryError('Host monitoring stopped', 503)
    const at = this.now()
    // Apply the bound even with viewers: parallel tabs must not multiply /proc scans.
    if (this.scanning || at - this.lastScan < HOST_PROCESSES_INTERVAL_MS) {
      throw hostTelemetryError('Process inventory is limited to once every 5 seconds', 429)
    }
    this.lastScan = at
    this.scanning = true
    try {
      return await this.scan(this.processContext)
    } finally {
      this.scanning = false
    }
  }
}
