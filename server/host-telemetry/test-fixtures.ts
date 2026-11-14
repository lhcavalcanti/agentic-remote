import type { HostInfo } from '../../shared/host-telemetry.js'
import type { HostTelemetryReading } from './reader.js'

export const hostInfoFixture: HostInfo = {
  hostname: 'test-computer',
  os: 'Linux',
  kernel: '6.8.0-test',
  cpuModel: 'Test CPU',
  logicalCpus: 4,
  totalMemoryBytes: 16_384_000,
  uptimeSeconds: 100,
  isWsl: false,
}

export const cpuFixture = `cpu  100 20 30 400 50 10 5 5 90 10
cpu0 25 5 8 100 12 3 1 1 22 2
intr 12345
`
export const meminfoFixture = `MemTotal:       16000 kB
MemFree:          100 kB
MemAvailable:    6000 kB
Buffers:          200 kB
Cached:          4000 kB
SwapTotal:       2000 kB
SwapFree:        1500 kB
`
export const netDevFixture = `Inter-|   Receive                                                |  Transmit
 face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed
    lo: 9000000 1 0 0 0 0 0 0 9000000 1 0 0 0 0 0 0
  eth0: 1000 2 0 0 0 0 0 0 2000 3 0 0 0 0 0 0
 wlan0: 3000 4 0 0 0 0 0 0 4000 5 0 0 0 0 0 0
`
export const diskstatsFixture = `   8       0 sda 10 0 100 0 20 0 200 0 0 0 0
   8       1 sda1 10 0 100 0 20 0 200 0 0 0 0
 259       0 nvme0n1 10 0 300 0 20 0 400 0 0 0 0 0 0 0 0 0 0
 259       1 nvme0n1p1 10 0 300 0 20 0 400 0 0 0 0
 253       0 vda 10 0 500 0 20 0 600 0 0 0 0
 253       1 vda1 10 0 500 0 20 0 600 0 0 0 0
 202       0 xvda 10 0 700 0 20 0 800 0 0 0 0
 202       1 xvda1 10 0 700 0 20 0 800 0 0 0 0
 179       0 mmcblk0 10 0 900 0 20 0 1000 0 0 0 0
 179       1 mmcblk0p1 10 0 900 0 20 0 1000 0 0 0 0
   7       0 loop0 10 0 999999 0 20 0 999999 0 0 0 0
   1       0 ram0 10 0 999999 0 20 0 999999 0 0 0 0
 252       0 zram0 10 0 999999 0 20 0 999999 0 0 0 0
 254       0 dm-0 10 0 999999 0 20 0 999999 0 0 0 0
   9       0 md0 10 0 999999 0 20 0 999999 0 0 0 0
`
export const mountinfoFixture = `21 0 8:0 / / rw - ext4 /dev/sda rw
22 21 8:16 / /data rw - ext4 /dev/sdb rw
23 22 8:32 / /data/with\\040space rw - ext4 /dev/sdc rw
`

export function readingFixture(files: HostTelemetryReading['files'] = {}): HostTelemetryReading {
  return {
    info: { ...hostInfoFixture },
    files: {
      stat: cpuFixture,
      meminfo: meminfoFixture,
      netDev: netDevFixture,
      diskstats: diskstatsFixture,
      loadavg: '1.00 2.50 3.75 1/100 1234\n',
      ...files,
    },
    disk: { mount: '/data', totalBytes: 100_000, freeBytes: 60_000 },
    errors: [],
  }
}
