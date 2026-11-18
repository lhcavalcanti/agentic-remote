import { describe, expect, it, vi } from 'vitest'
import { createLinuxHostTelemetryReader, hostTelemetryProcFiles } from './reader.js'
import { hostInfoFixture, mountinfoFixture, readingFixture } from './test-fixtures.js'

describe('Linux host telemetry reader', () => {
  it('reads proc metrics and user-available disk space without shelling out, caching metadata', async () => {
    const fixture = readingFixture()
    const files = new Map<string, string>(Object.entries(hostTelemetryProcFiles)
      .map(([name, path]) => [path, fixture.files[name as keyof typeof fixture.files]!]))
    files.set('/proc/sys/kernel/osrelease', '6.6.87-microsoft-standard-WSL2\n')
    files.set('/proc/version', 'Linux version 6.6.87 WSL2')
    files.set('/proc/self/mountinfo', mountinfoFixture)
    const readText = vi.fn(async (path: string) => files.get(path)!)
    const readSpace = vi.fn(async () => ({ bsize: 4096, blocks: 1000, bavail: 500 }))
    const systemInfo = vi.fn(() => hostInfoFixture)
    let up = 10
    const reader = createLinuxHostTelemetryReader({
      dataDirectory: '/data/store', readText, readSpace, systemInfo, uptime: () => up, wslDistro: 'Ubuntu',
    })
    expect(readText).not.toHaveBeenCalled()
    const reading = await reader(new AbortController().signal)
    expect(reading.info).toEqual({
      ...hostInfoFixture, kernel: '6.6.87-microsoft-standard-WSL2', uptimeSeconds: 10, isWsl: true, wslDistro: 'Ubuntu',
    })
    expect(reading.disk).toEqual({ mount: '/data', totalBytes: 4_096_000, freeBytes: 2_048_000 })
    expect(reading.files).toEqual(fixture.files)
    expect(reading.errors).toEqual([])
    expect(readSpace).toHaveBeenCalledWith('/data/store')
    expect(readText).toHaveBeenCalledTimes(8)
    up = 20
    expect((await reader(new AbortController().signal)).info.uptimeSeconds).toBe(20)
    expect(systemInfo).toHaveBeenCalledTimes(1)
    expect(readText).toHaveBeenCalledTimes(13)
  })

  it('returns a partial reading when container-style proc files and statfs are unavailable', async () => {
    const reader = createLinuxHostTelemetryReader({
      dataDirectory: '/data',
      readText: async (path) => {
        if (path === '/proc/meminfo') return readingFixture().files.meminfo!
        throw Object.assign(new Error('private path detail'), { code: 'ENOENT' })
      },
      readSpace: async () => { throw Object.assign(new Error('private path detail'), { code: 'EACCES' }) },
      systemInfo: () => hostInfoFixture,
      uptime: () => 10,
      wslDistro: '',
    })
    const result = await reader(new AbortController().signal)
    expect(result.files).toEqual({ meminfo: readingFixture().files.meminfo })
    expect(result.disk).toBeNull()
    expect(result.info).toEqual({ ...hostInfoFixture, uptimeSeconds: 10 })
    expect(result.errors).toHaveLength(8)
    expect(result.errors.join(' ')).not.toContain('private')
    expect(result.errors).toContain('/proc/stat: ENOENT')
    expect(result.errors).toContain('statfs: EACCES')
  })

  it('honors aborts before reading and discards a non-abortable statfs result', async () => {
    const controller = new AbortController()
    const readText = vi.fn(async () => '')
    let finish!: (value: { bsize: number; blocks: number; bavail: number }) => void
    const reader = createLinuxHostTelemetryReader({
      dataDirectory: '/data', readText, systemInfo: () => hostInfoFixture,
      readSpace: () => new Promise((resolve) => { finish = resolve }),
    })
    const pending = reader(controller.signal)
    controller.abort()
    finish({ bsize: 1, blocks: 10, bavail: 5 })
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    const calls = readText.mock.calls.length
    await expect(reader(controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
    expect(readText).toHaveBeenCalledTimes(calls)
  })

  it('timestamps individual proc captures before slow disk-space I/O finishes', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(10_000)
      const reader = createLinuxHostTelemetryReader({
        dataDirectory: '/data', systemInfo: () => hostInfoFixture, monotonicNow: Date.now,
        readText: async (path) => {
          if (path === '/proc/net/dev') await new Promise((resolve) => setTimeout(resolve, 10))
          if (path === '/proc/diskstats') await new Promise((resolve) => setTimeout(resolve, 20))
          return ''
        },
        readSpace: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return { bsize: 1, blocks: 10, bavail: 5 }
        },
      })
      const pending = reader(new AbortController().signal)
      await vi.advanceTimersByTimeAsync(100)
      expect((await pending).capturedAt).toMatchObject({ netDev: 10_010, diskstats: 10_020 })
    } finally { vi.useRealTimers() }
  })
})
