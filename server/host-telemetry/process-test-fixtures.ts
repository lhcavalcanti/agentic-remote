import { vi } from 'vitest'
import type { ProcessProcReader } from './process-proc.js'

export interface ProcessFixture {
  pid: number
  ppid?: number
  startTime?: number
  utime?: number
  stime?: number
  rssPages?: number
  uid?: number
  executable?: string
  comm?: string
}

export function processStatFixture(process: ProcessFixture): string {
  const fields = Array<string>(22).fill('0')
  fields[0] = 'S'
  fields[1] = String(process.ppid ?? 1)
  fields[11] = String(process.utime ?? 0)
  fields[12] = String(process.stime ?? 0)
  fields[19] = String(process.startTime ?? process.pid)
  fields[21] = String(process.rssPages ?? 2)
  return `${process.pid} (${process.comm ?? 'process (with) spaces'}) ${fields.join(' ')}\n`
}

export function processTreeFixture(processes: ProcessFixture[]) {
  const tree = new Map(processes.map((process) => [process.pid, process]))
  const calls: string[] = []
  const failure = (code = 'ENOENT') => Object.assign(new Error('fixture process is unavailable'), { code })
  const lookup = (path: string) => {
    calls.push(path)
    if (!/^\/proc\/[1-9]\d*(?:\/(?:stat|comm|exe))?$/u.test(path)) throw new Error(`Unexpected process read: ${path}`)
    const process = tree.get(Number(path.split('/')[2]))
    if (!process) throw failure()
    return process
  }
  const reader: ProcessProcReader = {
    readdir: vi.fn(async (path) => {
      expectProc(path)
      return [...tree.keys()].map(String).concat(['self', 'net', '1garbage', '0', '-1'])
    }),
    readText: vi.fn(async (path) => {
      const process = lookup(path)
      if (path.endsWith('/stat')) return processStatFixture(process)
      if (path.endsWith('/comm')) return `${process.comm ?? 'fallback'}\n`
      throw new Error(`Unexpected text read: ${path}`)
    }),
    readlink: vi.fn(async (path) => {
      const process = lookup(path)
      if (!path.endsWith('/exe')) throw new Error(`Unexpected symlink read: ${path}`)
      return process.executable ?? '/usr/bin/sleep'
    }),
    stat: vi.fn(async (path) => ({ uid: lookup(path).uid ?? 1000 })),
    parameters: vi.fn(async () => ({ clockTicksPerSecond: 100, pageSizeBytes: 4096 })),
  }
  return { tree, calls, failure, reader }
}

function expectProc(path: string): void {
  if (path !== '/proc') throw new Error(`Unexpected directory read: ${path}`)
}
