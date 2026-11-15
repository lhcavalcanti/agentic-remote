import { readFile, statfs } from 'node:fs/promises'
import { cpus, hostname, release, totalmem, type, uptime } from 'node:os'
import { resolve } from 'node:path'
import type { DiskSpace, HostInfo } from '../../shared/host-telemetry.js'
import { detectWsl, parseDataMount } from './parsers.js'

export const hostTelemetryProcFiles = {
  stat: '/proc/stat',
  meminfo: '/proc/meminfo',
  netDev: '/proc/net/dev',
  diskstats: '/proc/diskstats',
  loadavg: '/proc/loadavg',
} as const
export type HostTelemetryProcFile = keyof typeof hostTelemetryProcFiles

export interface HostTelemetryReading {
  info: HostInfo
  files: Partial<Record<HostTelemetryProcFile, string>>
  disk: DiskSpace | null
  errors: string[]
}
export type HostTelemetryReader = (signal: AbortSignal) => Promise<HostTelemetryReading>

export interface HostTelemetryReaderOptions {
  dataDirectory: string
  readText?: (path: string, signal: AbortSignal) => Promise<string>
  readSpace?: (path: string) => Promise<{ bsize: number; blocks: number; bavail: number }>
  systemInfo?: () => HostInfo
  uptime?: () => number
  wslDistro?: string
}

function systemInfo(): HostInfo {
  const processors = cpus()
  return {
    hostname: hostname(),
    os: type(),
    kernel: release(),
    cpuModel: processors[0]?.model ?? 'Unknown',
    logicalCpus: processors.length,
    totalMemoryBytes: totalmem(),
    uptimeSeconds: uptime(),
    isWsl: false,
  }
}

function errorCode(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  return typeof code === 'string' && /^[A-Z0-9_]{1,40}$/.test(code) ? code : 'READ_FAILED'
}

/** Constructing the reader does no I/O. Static metadata is cached after its first read. */
export function createLinuxHostTelemetryReader(options: HostTelemetryReaderOptions): HostTelemetryReader {
  const dataDirectory = resolve(options.dataDirectory)
  const readText = options.readText ?? ((path, signal) => readFile(path, { encoding: 'utf8', signal }))
  const readSpace = options.readSpace ?? statfs
  let metadata: { info: HostInfo; mount: string } | undefined

  return async (signal) => {
    signal.throwIfAborted()
    const errors: string[] = []
    const text = async (path: string) => {
      try {
        return await readText(path, signal)
      } catch (error) {
        errors.push(`${path}: ${errorCode(error)}`)
        return undefined
      }
    }
    const readMetadata = async () => {
      if (metadata) return metadata
      const [osrelease, version, mounts] = await Promise.all([
        text('/proc/sys/kernel/osrelease'),
        text('/proc/version'),
        text('/proc/self/mountinfo'),
      ])
      signal.throwIfAborted()
      const info = (options.systemInfo ?? systemInfo)()
      metadata = {
        info: {
          ...info,
          kernel: osrelease?.trim() || info.kernel,
          ...detectWsl(osrelease ?? info.kernel, version ?? '', options.wslDistro ?? process.env.WSL_DISTRO_NAME),
        },
        mount: mounts === undefined ? dataDirectory : parseDataMount(mounts, dataDirectory) ?? dataDirectory,
      }
      return metadata
    }
    const readDisk = async () => {
      try {
        const space = await readSpace(dataDirectory)
        const totalBytes = space.bsize * space.blocks
        const freeBytes = space.bsize * space.bavail
        if (![totalBytes, freeBytes].every((value) => Number.isFinite(value) && value >= 0)) {
          errors.push('statfs: INVALID')
          return null
        }
        return { totalBytes, freeBytes: Math.min(totalBytes, freeBytes) }
      } catch (error) {
        errors.push(`statfs: ${errorCode(error)}`)
        return null
      }
    }
    const [metadataResult, entriesResult, diskResult] = await Promise.allSettled([
      readMetadata(),
      Promise.all(Object.entries(hostTelemetryProcFiles).map(async ([name, path]) => [name, await text(path)] as const)),
      readDisk(),
    ])
    signal.throwIfAborted()
    if (metadataResult.status === 'rejected') throw metadataResult.reason
    if (entriesResult.status === 'rejected') throw entriesResult.reason
    if (diskResult.status === 'rejected') throw diskResult.reason
    const staticInfo = metadataResult.value
    const entries = entriesResult.value
    const disk = diskResult.value
    return {
      info: { ...staticInfo.info, uptimeSeconds: (options.uptime ?? uptime)() },
      files: Object.fromEntries(entries.filter(([, value]) => value !== undefined)),
      disk: disk ? { mount: staticInfo.mount, ...disk } : null,
      errors,
    }
  }
}
