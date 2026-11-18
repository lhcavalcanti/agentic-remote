import { basename } from 'node:path'
import { setImmediate as yieldToEventLoop } from 'node:timers/promises'
import type { ProcessRow } from '../../shared/host-telemetry.js'
import { createProcessProcReader, isUnavailableProcess, parseProcessStat, type ProcessProcReader, type ProcessStat } from './process-proc.js'
import type { SessionPaneRoot } from './session-pane-roots.js'

export const MAX_PROCESS_SCAN = 4096
const SCAN_CONCURRENCY = 32

interface ProcessReading extends ProcessStat {
  executable: string
  executableVerified: boolean
}

export interface ProcessScanContext {
  reader?: ProcessProcReader
  uid?: number
  servicePid?: number
  listSessionPaneRoots?: () => Promise<SessionPaneRoot[]>
  now?: () => number
  monotonicNow?: () => number
}

interface CpuBaseline {
  at: number
  processes: Map<number, ProcessStat>
}

const defaultReader = createProcessProcReader()
const baselines = new WeakMap<ProcessScanContext, CpuBaseline>()

function executableName(value: string): string {
  return [...basename(value.replace(/ \(deleted\)$/u, ''))]
    .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
    .join('').slice(0, 256)
}

async function readStat(reader: ProcessProcReader, pid: number): Promise<ProcessStat | undefined> {
  try {
    const result = parseProcessStat(await reader.readText(`/proc/${pid}/stat`))
    return result?.pid === pid ? result : undefined
  } catch (error) {
    if (isUnavailableProcess(error)) return undefined
    throw error
  }
}

type Attribution = Pick<ProcessRow, 'owner' | 'sessionId' | 'label'>
const OTHER: Attribution = { owner: 'other' }

function attribute(
  processes: Map<number, ProcessReading>,
  service: ProcessStat | undefined,
  sessions: Map<number, string>,
): Map<number, Attribution> {
  const result = new Map<number, Attribution>()
  for (const process of processes.values()) {
    const path: ProcessReading[] = []
    const visited = new Set<number>()
    let current: ProcessReading | undefined = process
    let owner = OTHER
    while (current && !visited.has(current.pid)) {
      const known = result.get(current.pid)
      if (known) {
        owner = known
        break
      }
      visited.add(current.pid)
      path.push(current)
      const sessionId = sessions.get(current.pid)
      if (sessionId) {
        owner = { owner: 'session', sessionId }
        break
      }
      if (current.pid === service?.pid && current.startTime === service.startTime) {
        owner = { owner: 'agentic-remote' }
        break
      }
      const parent = processes.get(current.ppid)
      current = parent && parent.startTime <= current.startTime ? parent : undefined
    }
    for (const entry of path.reverse()) {
      if (owner.owner === 'agentic-remote' && entry.pid !== service?.pid && entry.executableVerified) {
        if (entry.executable === 'copilot' || entry.executable === 'copilot-runtime') {
          owner = { owner: 'shared-runtime', label: 'Shared Copilot runtime' }
        }
        if (entry.executable === 'claude') owner = { owner: 'shared-runtime', label: 'Claude runtime' }
      }
      result.set(entry.pid, owner)
    }
  }
  return result
}

/** Reuse the same context for CPU deltas. Construction/import starts no timers or providers. */
export async function scanProcesses(context: ProcessScanContext): Promise<{
  rows: ProcessRow[]
  truncated: boolean
  othersCount: number
  scannedAt: string
}> {
  const reader = context.reader ?? defaultReader
  const uid = context.uid ?? process.getuid?.()
  if (uid === undefined) throw new Error('Process inventory requires a user ID')
  const servicePid = context.servicePid ?? process.pid
  const at = (context.monotonicNow ?? (() => performance.now()))()
  const scannedAt = new Date((context.now ?? Date.now)()).toISOString()
  const [{ clockTicksPerSecond, pageSizeBytes }, names] = await Promise.all([
    reader.parameters(),
    reader.readdir('/proc'),
  ])
  const pids = [...new Set(names.filter((name) => /^[1-9]\d*$/u.test(name))
    .map(Number).filter(Number.isSafeInteger))].sort((a, b) => a - b)
  const truncated = pids.length > MAX_PROCESS_SCAN
  const processes = new Map<number, ProcessReading>()
  let othersCount = 0
  const selected = pids.slice(0, MAX_PROCESS_SCAN)
  let serviceBefore: ProcessStat | undefined
  if (selected.includes(servicePid)) {
    try {
      if ((await reader.stat(`/proc/${servicePid}`)).uid === uid) serviceBefore = await readStat(reader, servicePid)
    } catch (error) {
      if (!isUnavailableProcess(error)) throw error
    }
  }
  const roots = await context.listSessionPaneRoots?.().catch(() => []) ?? []
  for (let offset = 0; offset < selected.length; offset += SCAN_CONCURRENCY) {
    await Promise.all(selected.slice(offset, offset + SCAN_CONCURRENCY).map(async (pid) => {
      const path = `/proc/${pid}`
      try {
        if ((await reader.stat(path)).uid !== uid) {
          othersCount += 1
          return
        }
        const before = await readStat(reader, pid)
        if (!before) return
        let executable: string
        let executableVerified = true
        try {
          executable = executableName(await reader.readlink(`${path}/exe`))
        } catch (error) {
          if (!isUnavailableProcess(error)) throw error
          executable = executableName((await reader.readText(`${path}/comm`)).trim())
          executableVerified = false
        }
        const after = await readStat(reader, pid)
        if (!after || after.startTime !== before.startTime || after.ppid !== before.ppid ||
          (await reader.stat(path)).uid !== uid || !executable) return
        processes.set(pid, { ...after, executable, executableVerified })
      } catch (error) {
        if (!isUnavailableProcess(error)) throw error
      }
    }))
    if (offset + SCAN_CONCURRENCY < selected.length) await yieldToEventLoop()
  }
  const serviceAfter = serviceBefore && await readStat(reader, servicePid)
  const service = serviceAfter?.startTime === serviceBefore?.startTime ? serviceAfter : undefined
  const sessions = new Map<number, string>()
  const ambiguous = new Set<number>()
  for (const root of roots.slice(0, MAX_PROCESS_SCAN)) {
    const observed = processes.get(root.panePid)
    if (root.paneStartTime === undefined || observed?.startTime !== root.paneStartTime) continue
    const verified = await readStat(reader, root.panePid)
    if (verified?.startTime !== root.paneStartTime) continue
    const previous = sessions.get(root.panePid)
    if (previous && previous !== root.sessionId) ambiguous.add(root.panePid)
    sessions.set(root.panePid, root.sessionId)
  }
  for (const pid of ambiguous) sessions.delete(pid)
  const owners = attribute(processes, service, sessions)
  const baseline = baselines.get(context)
  const elapsedSeconds = baseline ? (at - baseline.at) / 1000 : 0
  const rows = [...processes.values()].sort((a, b) => a.pid - b.pid).map((process): ProcessRow => {
    const previous = baseline?.processes.get(process.pid)
    const delta = previous?.startTime === process.startTime ? process.cpuTicks - previous.cpuTicks : -1
    return {
      pid: process.pid,
      startTime: process.startTime,
      executable: process.executable,
      cpuPercent: delta >= 0 && elapsedSeconds > 0 ? delta / clockTicksPerSecond / elapsedSeconds * 100 : 0,
      rssBytes: process.rssPages * pageSizeBytes,
      ...owners.get(process.pid)!,
    }
  })
  baselines.set(context, { at, processes })
  return { rows, truncated, othersCount, scannedAt }
}
