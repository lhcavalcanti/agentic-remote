import { readFileSync, readlinkSync, statSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { endianness } from 'node:os'

export interface ProcessStat {
  pid: number
  ppid: number
  startTime: number
  cpuTicks: number
  rssPages: number
}

export interface ProcessProcReader {
  readdir(path: string): Promise<string[]>
  readText(path: string): Promise<string>
  readlink(path: string): Promise<string>
  stat(path: string): Promise<{ uid: number }>
  parameters(): Promise<{ clockTicksPerSecond: number; pageSizeBytes: number }>
}

export function parseProcessStat(text: string): ProcessStat | undefined {
  const open = text.indexOf('(')
  const close = text.lastIndexOf(')')
  if (open < 1 || close < open) return undefined
  const pid = Number(text.slice(0, open).trim())
  const fields = text.slice(close + 1).trim().split(/\s+/u)
  if (fields.length < 22) return undefined
  const [ppid, utime, stime, startTime, rssPages] = [1, 11, 12, 19, 21].map((index) =>
    /^\d+$/u.test(fields[index]) ? Number(fields[index]) : NaN)
  if (pid <= 0 || ![pid, ppid, utime, stime, startTime, rssPages, utime + stime]
    .every((value) => Number.isSafeInteger(value) && value >= 0)) return undefined
  return { pid, ppid, startTime, cpuTicks: utime + stime, rssPages }
}

/** Only the two public scalar auxv entries are retained, never pointer values. */
export function parseProcessParameters(
  buffer: Buffer,
  wordBytes: 4 | 8,
  littleEndian: boolean,
): { clockTicksPerSecond: number; pageSizeBytes: number } {
  const word = (offset: number) => wordBytes === 8
    ? Number(littleEndian ? buffer.readBigUInt64LE(offset) : buffer.readBigUInt64BE(offset))
    : littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset)
  let pageSizeBytes = 0
  let clockTicksPerSecond = 0
  for (let offset = 0; offset + wordBytes * 2 <= buffer.length; offset += wordBytes * 2) {
    const tag = word(offset)
    if (tag === 0) break
    if (tag === 6) pageSizeBytes = word(offset + wordBytes)
    if (tag === 17) clockTicksPerSecond = word(offset + wordBytes)
  }
  if (![pageSizeBytes, clockTicksPerSecond].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new Error('Process clock ticks and page size are unavailable')
  }
  return { clockTicksPerSecond, pageSizeBytes }
}

export function createProcessProcReader(): ProcessProcReader {
  let parameters: ReturnType<ProcessProcReader['parameters']> | undefined
  return {
    readdir: (path) => readdir(path),
    // Tiny proc metadata reads avoid thread-pool overhead; the scanner yields between bounded batches.
    readText: async (path) => readFileSync(path, 'utf8'),
    readlink: async (path) => readlinkSync(path),
    stat: async (path) => statSync(path),
    parameters: () => parameters ??= readFile('/proc/self/auxv').then((buffer) =>
      parseProcessParameters(buffer, ['ia32', 'arm'].includes(process.arch) ? 4 : 8, endianness() === 'LE'),
    ).catch((error: unknown) => {
      parameters = undefined
      throw error
    }),
  }
}

export function isUnavailableProcess(error: unknown): boolean {
  return ['ENOENT', 'ESRCH', 'EACCES', 'EPERM'].includes((error as NodeJS.ErrnoException)?.code ?? '')
}
