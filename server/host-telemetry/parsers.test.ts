import { describe, expect, it } from 'vitest'
import {
  counterDelta,
  cpuUtilization,
  detectWsl,
  deviceRates,
  isWholeDisk,
  parseCpuStat,
  parseDataMount,
  parseDiskstats,
  parseLoadavg,
  parseMeminfo,
  parseNetDev,
} from './parsers.js'
import { cpuFixture, diskstatsFixture, meminfoFixture, mountinfoFixture, netDevFixture } from './test-fixtures.js'

describe('host telemetry proc parsers', () => {
  it('uses the aggregate CPU line and excludes double-counted guest times', () => {
    const before = parseCpuStat(cpuFixture)
    const after = parseCpuStat('cpu  120 25 40 450 60 15 10 10 100 15\ncpu0 9999 0 0 0')
    expect(before).toEqual({ busy: 170n, idle: 400n, iowait: 50n })
    expect(after).toEqual({ busy: 220n, idle: 450n, iowait: 60n })
    expect(cpuUtilization(before, after)).toBeCloseTo(100 * 50 / 110)
    expect(cpuUtilization(undefined, after)).toBeNull()
    expect(cpuUtilization(before, before)).toBeNull()
    expect(cpuUtilization(after, before)).toBeNull()
  })

  it('accepts old four-field CPUs and ignores decreasing iowait', () => {
    expect(parseCpuStat('cpu 10 0 20 70')).toEqual({ busy: 30n, idle: 70n, iowait: 0n })
    expect(cpuUtilization(
      { busy: 100n, idle: 100n, iowait: 20n },
      { busy: 110n, idle: 110n, iowait: 10n },
    )).toBe(50)
    expect(parseCpuStat('cpu0 1 2 3 4')).toBeUndefined()
    expect(parseCpuStat('cpu -1 0 1 2')).toBeUndefined()
    expect(parseCpuStat('cpu 1 bad 1 2')).toBeUndefined()
  })

  it('uses MemAvailable instead of MemFree and converts kB to bytes', () => {
    expect(parseMeminfo(meminfoFixture)).toEqual({
      totalMemoryBytes: 16_000 * 1024,
      memoryAvailableBytes: 6000 * 1024,
      memoryUsedBytes: 10_000 * 1024,
      swapUsedBytes: 500 * 1024,
    })
    expect(parseMeminfo('MemTotal: 10 kB\nMemAvailable: 20 kB\nSwapTotal: 0 kB\nSwapFree: 0 kB')).toEqual({
      totalMemoryBytes: 10_240, memoryAvailableBytes: 10_240, memoryUsedBytes: 0, swapUsedBytes: 0,
    })
    expect(parseMeminfo('MemTotal: 10 kB\nMemFree: 2 kB').memoryAvailableBytes).toBeNull()
    expect(parseMeminfo('')).toEqual({
      totalMemoryBytes: null, memoryAvailableBytes: null, memoryUsedBytes: null, swapUsedBytes: null,
    })
  })

  it('sums non-loopback NIC deltas and establishes new NIC baselines', () => {
    const before = parseNetDev(netDevFixture)
    const after = parseNetDev(`eth0: 3000 0 0 0 0 0 0 0 6000 0 0 0 0 0 0 0
eth1: 99999999 0 0 0 0 0 0 0 99999999 0 0 0 0 0 0 0
lo: 999999999 0 0 0 0 0 0 0 999999999 0 0 0 0 0 0 0`)
    expect(before?.has('lo')).toBe(false)
    expect(before?.size).toBe(2)
    expect(deviceRates(before, after, 2000)).toEqual({ readBytesPerSec: 1000, writeBytesPerSec: 2000 })
    const next = parseNetDev('eth1: 100000099 0 0 0 0 0 0 0 100000199 0 0 0 0 0 0 0')
    expect(deviceRates(after, next, 1000)).toEqual({ readBytesPerSec: 100, writeBytesPerSec: 200 })
    expect(deviceRates(undefined, after, 1000)).toBeNull()
    expect(deviceRates(before, after, 0)).toBeNull()
    expect(parseNetDev('garbage')).toBeUndefined()
  })

  it('handles 32/64-bit counter wrap without interpreting ordinary resets as traffic', () => {
    expect(counterDelta((1n << 32n) - 10n, 15n)).toBe(25n)
    expect(counterDelta((1n << 64n) - 10n, 15n)).toBe(25n)
    expect(counterDelta(1000n, 10n)).toBe(0n)
    const before = parseNetDev('eth0: 4294967290 0 0 0 0 0 0 0 18446744073709551610 0 0 0 0 0 0 0')
    const after = parseNetDev('eth0: 4 0 0 0 0 0 0 0 4 0 0 0 0 0 0 0')
    expect(deviceRates(before, after, 1000)).toEqual({ readBytesPerSec: 10, writeBytesPerSec: 10 })
  })

  it('includes only whole disks and converts sectors to 512-byte units', () => {
    const parsed = parseDiskstats(diskstatsFixture)
    expect([...parsed!.keys()]).toEqual(['8:0:sda', '259:0:nvme0n1', '253:0:vda', '202:0:xvda', '179:0:mmcblk0'])
    expect(parsed?.get('8:0:sda')).toEqual({ readBytes: 51_200n, writeBytes: 102_400n })
    for (const name of ['sda12', 'nvme1n2p3', 'vda1', 'xvda2', 'mmcblk1p2', 'mmcblk1boot0', 'loop0', 'ram1', 'zram0', 'dm-0', 'md0', 'nvme0c0n1']) {
      expect(isWholeDisk(name), name).toBe(false)
    }
    expect(parseDiskstats('')).toEqual(new Map())
    expect(parseDiskstats('garbage')).toBeUndefined()
  })

  it('ignores removed/new disks and changed device identities without a rate spike', () => {
    const after = parseDiskstats(`8 0 sda 0 0 104 0 0 0 206 0 0 0 0
259 2 nvme0n1 0 0 999999 0 0 0 999999 0 0 0 0
8 16 sdb 0 0 999999 0 0 0 999999 0 0 0 0`)
    expect(deviceRates(parseDiskstats(diskstatsFixture), after, 2000, 512n)).toEqual({
      readBytesPerSec: 1024, writeBytesPerSec: 1536,
    })
    const wrapped = parseDiskstats('8 0 sda 0 0 4294967290 0 0 0 18446744073709551610 0 0 0 0')
    const next = parseDiskstats('8 0 sda 0 0 4 0 0 0 4 0 0 0 0')
    expect(deviceRates(wrapped, next, 1000, 512n)).toEqual({ readBytesPerSec: 5120, writeBytesPerSec: 5120 })
  })

  it('parses load averages and rejects malformed/negative metrics', () => {
    expect(parseLoadavg('0.12 1.50 20.25 1/100 12345\n')).toEqual({ load1: 0.12, load5: 1.5, load15: 20.25 })
    for (const text of ['', '1 2', '1 -2 3', 'NaN 2 3', 'Infinity 2 3']) {
      expect(parseLoadavg(text)).toBeUndefined()
    }
  })

  it.each([
    ['4.4.0-19041-Microsoft', 'Linux version 4.4.0', undefined, true],
    ['5.15.167.4-microsoft-standard-WSL2', 'Linux version 5.15.167.4', 'Ubuntu-24.04', true],
    ['6.6.1', 'Linux version 6.6.1 (Microsoft@buildhost)', undefined, true],
    ['6.6.1', 'Linux version 6.6.1 WSL2', undefined, true],
    ['6.6.1', 'Linux version 6.6.1', 'Debian', true],
    ['6.8.0-generic', 'Linux version 6.8.0-generic (build@linux)', undefined, false],
  ])('detects WSL from kernel release, version or distro (%s)', (release, version, distro, expected) => {
    expect(detectWsl(release, version, distro)).toEqual({
      isWsl: expected, ...(expected && distro ? { wslDistro: distro } : {}),
    })
  })

  it('resolves the longest mount boundary and decodes escaped mount names', () => {
    expect(parseDataMount(mountinfoFixture, '/data/store')).toBe('/data')
    expect(parseDataMount(mountinfoFixture, '/database')).toBe('/')
    expect(parseDataMount(mountinfoFixture, '/data/with space/store')).toBe('/data/with space')
    expect(parseDataMount('', '/data')).toBeUndefined()
  })
})
