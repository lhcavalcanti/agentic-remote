import { describe, expect, it } from 'vitest'
import {
  HostHistorySchema,
  HostSampleSchema,
  HostSnapshotSchema,
  ProcessRowSchema,
} from './host-telemetry.js'

const sample = {
  at: '2026-11-14T06:00:00.000Z',
  cpuPercent: null,
  memoryUsedBytes: 1000,
  memoryAvailableBytes: 2000,
  swapUsedBytes: 0,
  netRxBytesPerSec: null,
  netTxBytesPerSec: null,
  diskReadBytesPerSec: null,
  diskWriteBytesPerSec: null,
  load1: 0,
  load5: 0.1,
  load15: 0.2,
}

describe('host telemetry contracts', () => {
  it('represents unavailable/initial readings explicitly and bounds the live ring', () => {
    expect(HostSnapshotSchema.parse({ info: null, latest: null, live: [], disk: null }).latest).toBeNull()
    const snapshot = { info: null, latest: sample, live: Array(61).fill(sample), disk: null }
    expect(HostSnapshotSchema.safeParse(snapshot).success).toBe(true)
    expect(HostSnapshotSchema.safeParse({ ...snapshot, live: Array(62).fill(sample) }).success).toBe(false)
  })

  it.each([
    { cpuPercent: 101 }, { cpuPercent: -1 }, { load1: Infinity },
    { memoryUsedBytes: -1 }, { at: 'not a date' }, { at: '2026-11-14' },
  ])('rejects invalid sample metrics: %j', (invalid) => {
    expect(HostSampleSchema.safeParse({ ...sample, ...invalid }).success).toBe(false)
  })

  it('defines proven and shared process ownership without collecting process arguments', () => {
    const row = { pid: 123, startTime: 123456, executable: 'node', cpuPercent: 250, rssBytes: 1024, owner: 'shared-runtime' }
    expect(ProcessRowSchema.parse(row)).toEqual(row)
    expect(ProcessRowSchema.safeParse({ ...row, owner: 'guessed' }).success).toBe(false)
    expect(ProcessRowSchema.safeParse({ ...row, pid: 0 }).success).toBe(false)
    expect(ProcessRowSchema.safeParse({ ...row, startTime: -1 }).success).toBe(false)
  })

  it('accepts bounded minute history with null metrics and per-metric aggregates', () => {
    const { at, ...metrics } = sample
    const minute = {
      at, samples: 2,
      ...Object.fromEntries(Object.keys(metrics).map((name) => [name, null])),
      cpuPercent: { min: 0, avg: 50, max: 100 },
    }
    expect(HostHistorySchema.safeParse([minute]).success).toBe(true)
    expect(HostHistorySchema.safeParse(Array(1441).fill(minute)).success).toBe(false)
  })
})
