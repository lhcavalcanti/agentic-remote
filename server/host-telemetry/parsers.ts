const UINT64_MAX = (1n << 64n) - 1n

function counter(value: string | undefined): bigint | undefined {
  if (!value || !/^\d{1,20}$/.test(value)) return undefined
  const parsed = BigInt(value)
  return parsed <= UINT64_MAX ? parsed : undefined
}

function nonnegative(value: string | undefined): number | undefined {
  if (!value || !/^\d+(?:\.\d+)?$/.test(value)) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export interface CpuCounters {
  busy: bigint
  idle: bigint
  iowait: bigint
}

export function parseCpuStat(text: string): CpuCounters | undefined {
  const line = text.split('\n').find((entry) => /^cpu\s/.test(entry))
  if (!line) return undefined
  const fields = line.trim().split(/\s+/).slice(1)
  if (fields.length < 4) return undefined
  const ticks = fields.slice(0, 8).map(counter)
  if (ticks.some((value) => value === undefined)) return undefined
  const [user, nice, system, idle, iowait = 0n, irq = 0n, softirq = 0n, steal = 0n] = ticks as bigint[]
  // guest and guest_nice are already included in user and nice.
  return { busy: user + nice + system + irq + softirq + steal, idle, iowait }
}

export function cpuUtilization(previous: CpuCounters | undefined, current: CpuCounters | undefined): number | null {
  if (!previous || !current) return null
  const busy = current.busy - previous.busy
  const idle = current.idle - previous.idle
  // The kernel documents that iowait may decrease; do not make busy time negative.
  const iowait = current.iowait > previous.iowait ? current.iowait - previous.iowait : 0n
  if (busy < 0n || idle < 0n || busy + idle + iowait === 0n) return null
  return 100 * Number(busy) / Number(busy + idle + iowait)
}

export interface MemoryReading {
  totalMemoryBytes: number | null
  memoryUsedBytes: number | null
  memoryAvailableBytes: number | null
  swapUsedBytes: number | null
}

export function parseMeminfo(text: string): MemoryReading {
  const values = new Map<string, number>()
  for (const line of text.split('\n')) {
    const match = /^(MemTotal|MemAvailable|SwapTotal|SwapFree):\s+(\d+)\s+kB\s*$/.exec(line)
    if (!match) continue
    const value = Number(match[2]) * 1024
    if (Number.isFinite(value)) values.set(match[1], value)
  }
  const total = values.get('MemTotal') ?? null
  const available = values.get('MemAvailable') ?? null
  const swapTotal = values.get('SwapTotal')
  const swapFree = values.get('SwapFree')
  const memoryAvailableBytes = available === null ? null : total === null ? available : Math.min(total, available)
  return {
    totalMemoryBytes: total,
    memoryAvailableBytes,
    memoryUsedBytes: total === null || memoryAvailableBytes === null ? null : total - memoryAvailableBytes,
    swapUsedBytes: swapTotal === undefined || swapFree === undefined ? null : Math.max(0, swapTotal - swapFree),
  }
}

export interface DeviceByteCounters {
  readBytes: bigint
  writeBytes: bigint
}
export type DeviceCounters = Map<string, DeviceByteCounters>

export function parseNetDev(text: string): DeviceCounters | undefined {
  const devices: DeviceCounters = new Map()
  let recognized = /Inter-\||face\s*\|/.test(text)
  for (const line of text.split('\n')) {
    const colon = line.lastIndexOf(':')
    if (colon < 0) continue
    const name = line.slice(0, colon).trim()
    const fields = line.slice(colon + 1).trim().split(/\s+/)
    if (!name || fields.length < 16) continue
    const readBytes = counter(fields[0])
    const writeBytes = counter(fields[8])
    if (readBytes === undefined || writeBytes === undefined) continue
    recognized = true
    if (name !== 'lo') devices.set(name, { readBytes, writeBytes })
  }
  return recognized ? devices : undefined
}

/** Only physical/VM disk namespaces: no partitions or stacked device-mapper I/O. */
export function isWholeDisk(name: string): boolean {
  return /^(?:sd[a-z]+|vd[a-z]+|xvd[a-z]+|nvme\d+n\d+|mmcblk\d+)$/.test(name)
}

export function parseDiskstats(text: string): DeviceCounters | undefined {
  const devices: DeviceCounters = new Map()
  let recognized = text.trim() === ''
  for (const line of text.split('\n')) {
    const fields = line.trim().split(/\s+/)
    if (fields.length < 14 || !/^\d+$/.test(fields[0]) || !/^\d+$/.test(fields[1])) continue
    const readSectors = counter(fields[5])
    const writeSectors = counter(fields[9])
    if (readSectors === undefined || writeSectors === undefined) continue
    recognized = true
    if (isWholeDisk(fields[2])) {
      devices.set(`${fields[0]}:${fields[1]}:${fields[2]}`, {
        readBytes: readSectors * 512n,
        writeBytes: writeSectors * 512n,
      })
    }
  }
  return recognized ? devices : undefined
}

/** A reset is not traffic. Recognize only a rollover close to a 32/64-bit boundary. */
export function counterDelta(previous: bigint, current: bigint): bigint {
  if (current >= previous) return current - previous
  for (const bits of [32n, 64n]) {
    const modulus = 1n << bits
    if (previous < modulus && previous >= modulus * 9n / 10n && current <= modulus / 10n) {
      return modulus - previous + current
    }
  }
  return 0n
}

export function deviceRates(
  previous: DeviceCounters | undefined,
  current: DeviceCounters | undefined,
  elapsedMs: number,
  unitBytes = 1n,
): { readBytesPerSec: number; writeBytesPerSec: number } | null {
  if (!previous || !current || elapsedMs <= 0) return null
  let read = 0n
  let write = 0n
  for (const [name, next] of current) {
    const before = previous.get(name)
    if (!before) continue
    // Divide disk byte counters before rollover detection, since sectors wrap.
    read += counterDelta(before.readBytes / unitBytes, next.readBytes / unitBytes) * unitBytes
    write += counterDelta(before.writeBytes / unitBytes, next.writeBytes / unitBytes) * unitBytes
  }
  return {
    readBytesPerSec: Number(read) * 1000 / elapsedMs,
    writeBytesPerSec: Number(write) * 1000 / elapsedMs,
  }
}

export function parseLoadavg(text: string): { load1: number; load5: number; load15: number } | undefined {
  const fields = text.trim().split(/\s+/)
  const [load1, load5, load15] = fields.slice(0, 3).map(nonnegative)
  if (load1 === undefined || load5 === undefined || load15 === undefined) return undefined
  return { load1, load5, load15 }
}

export function detectWsl(osrelease: string, version: string, distro?: string): { isWsl: boolean; wslDistro?: string } {
  const wslDistro = distro?.trim()
  const isWsl = /microsoft|wsl/i.test(`${osrelease}\n${version}`) || Boolean(wslDistro)
  return { isWsl, ...(isWsl && wslDistro ? { wslDistro } : {}) }
}

export function parseDataMount(text: string, dataDirectory: string): string | undefined {
  let best: string | undefined
  for (const line of text.split('\n')) {
    const fields = line.split(' ')
    if (fields.length < 10 || !line.includes(' - ')) continue
    const mount = fields[4].replace(/\\(040|011|012|134)/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)))
    if ((dataDirectory === mount || dataDirectory.startsWith(mount === '/' ? '/' : `${mount}/`)) &&
        (!best || mount.length > best.length)) best = mount
  }
  return best
}
