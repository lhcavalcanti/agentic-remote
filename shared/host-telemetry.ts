import { z } from 'zod'

export const HOST_TELEMETRY_CAPABILITY_VERSION = 1
export const HOST_TELEMETRY_LIVE_WINDOW_MS = 60_000
export const HOST_TELEMETRY_MAX_LIVE_SAMPLES = 61
export const HOST_TELEMETRY_MAX_MINUTES = 24 * 60

const nonnegative = z.number().nonnegative()
const timestamp = z.iso.datetime({ offset: true })

export const HostInfoSchema = z.object({
  hostname: z.string(),
  os: z.string(),
  kernel: z.string(),
  cpuModel: z.string(),
  logicalCpus: nonnegative.int(),
  totalMemoryBytes: nonnegative,
  uptimeSeconds: nonnegative,
  isWsl: z.boolean(),
  wslDistro: z.string().optional(),
})
export type HostInfo = z.infer<typeof HostInfoSchema>

/** Unavailable readings and rates without a baseline are null, never fake zeroes. */
export const HostMetricsSchema = z.object({
  cpuPercent: nonnegative.max(100).nullable(),
  memoryUsedBytes: nonnegative.nullable(),
  memoryAvailableBytes: nonnegative.nullable(),
  swapUsedBytes: nonnegative.nullable(),
  netRxBytesPerSec: nonnegative.nullable(),
  netTxBytesPerSec: nonnegative.nullable(),
  diskReadBytesPerSec: nonnegative.nullable(),
  diskWriteBytesPerSec: nonnegative.nullable(),
  load1: nonnegative.nullable(),
  load5: nonnegative.nullable(),
  load15: nonnegative.nullable(),
})
export type HostMetrics = z.infer<typeof HostMetricsSchema>
export type HostMetric = keyof HostMetrics
export const hostMetricNames = Object.freeze(Object.keys(HostMetricsSchema.shape) as HostMetric[])

export const HostSampleSchema = HostMetricsSchema.extend({ at: timestamp })
export type HostSample = z.infer<typeof HostSampleSchema>

export const DiskSpaceSchema = z.object({
  mount: z.string(),
  totalBytes: nonnegative,
  freeBytes: nonnegative,
})
export type DiskSpace = z.infer<typeof DiskSpaceSchema>

export const ProcessRowSchema = z.object({
  pid: z.number().int().positive(),
  /** Linux /proc/<pid>/stat start ticks, used with pid to reject PID reuse. */
  startTime: nonnegative.int(),
  executable: z.string(),
  /** A multi-threaded process can use more than one core (over 100%). */
  cpuPercent: nonnegative,
  rssBytes: nonnegative,
  owner: z.enum(['agentic-remote', 'session', 'shared-runtime', 'other']),
  sessionId: z.string().optional(),
  label: z.string().optional(),
})
export type ProcessRow = z.infer<typeof ProcessRowSchema>

export const HostSnapshotSchema = z.object({
  info: HostInfoSchema.nullable(),
  latest: HostSampleSchema.nullable(),
  live: z.array(HostSampleSchema).max(HOST_TELEMETRY_MAX_LIVE_SAMPLES),
  disk: DiskSpaceSchema.nullable(),
})
export type HostSnapshot = z.infer<typeof HostSnapshotSchema>

export const HostMetricAggregateSchema = z.object({
  min: nonnegative,
  avg: nonnegative,
  max: nonnegative,
})
export type HostMetricAggregate = z.infer<typeof HostMetricAggregateSchema>

const aggregate = HostMetricAggregateSchema.nullable()
export const HostMinuteAggregateSchema = z.object({
  at: timestamp,
  samples: z.number().int().positive(),
  cpuPercent: aggregate,
  memoryUsedBytes: aggregate,
  memoryAvailableBytes: aggregate,
  swapUsedBytes: aggregate,
  netRxBytesPerSec: aggregate,
  netTxBytesPerSec: aggregate,
  diskReadBytesPerSec: aggregate,
  diskWriteBytesPerSec: aggregate,
  load1: aggregate,
  load5: aggregate,
  load15: aggregate,
})
export type HostMinuteAggregate = z.infer<typeof HostMinuteAggregateSchema>
export const HostHistorySchema = z.array(HostMinuteAggregateSchema).max(HOST_TELEMETRY_MAX_MINUTES)
