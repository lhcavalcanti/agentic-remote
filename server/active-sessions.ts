import { execFile } from 'node:child_process'
import { readdir, readFile, readlink, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import type { DiscoveredSession } from './session-store.js'

const execFileAsync = promisify(execFile)
const sessionPattern =
  /(?:^|\s)--session-id(?:=|\s+)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s|$)/i
let clockTicks: Promise<number> | undefined
let bootTimeMs: Promise<number> | undefined

interface ActiveProcess {
  pid: number
  sessionId: string
  source: 'argument' | 'lock'
}

interface LockCandidate extends ActiveProcess {
  lockPath: string
  modifiedAt: number
}

function sessionStateDirectory(): string {
  return path.join(
    process.env.COPILOT_HOME?.trim() ||
      path.join(process.env.HOME || process.cwd(), '.copilot'),
    'session-state',
  )
}

async function findActiveProcesses(): Promise<ActiveProcess[]> {
  if (process.platform === 'win32') {
    return []
  }
  let output = ''
  try {
    const result = await execFileAsync('ps', ['-eo', 'pid=,args='], {
      maxBuffer: 4 * 1024 * 1024,
    })
    output = result.stdout
  } catch {
    return []
  }

  const processes: ActiveProcess[] = []
  const argumentPids = new Set<number>()
  for (const line of output.split('\n')) {
    const match = line.match(sessionPattern)
    if (!match) {
      continue
    }
    const pid = Number.parseInt(line.trimStart().split(/\s+/, 1)[0], 10)
    if (!Number.isInteger(pid)) {
      continue
    }
    if (!(await isDescendantOf(pid, process.pid))) {
      processes.push({ pid, sessionId: match[1], source: 'argument' })
      argumentPids.add(pid)
    }
  }
  const lockCandidates: LockCandidate[] = []
  try {
    const sessionDirectories = await readdir(sessionStateDirectory(), {
      withFileTypes: true,
    })
    for (const sessionDirectory of sessionDirectories) {
      if (!sessionDirectory.isDirectory()) {
        continue
      }
      const files = await readdir(
        path.join(sessionStateDirectory(), sessionDirectory.name),
      )
      for (const file of files) {
        const lock = file.match(/^inuse\.(\d+)\.lock$/)
        if (!lock) {
          continue
        }
        const pid = Number.parseInt(lock[1], 10)
        if (
          !Number.isInteger(pid) ||
          (await isDescendantOf(pid, process.pid)) ||
          argumentPids.has(pid) ||
          processes.some(
            (processInfo) => processInfo.sessionId === sessionDirectory.name,
          )
        ) {
          continue
        }
        try {
          const commandLine = (
            await readFile(`/proc/${pid}/cmdline`, 'utf8')
          ).replaceAll('\0', ' ')
          const lockPath = path.join(
            sessionStateDirectory(),
            sessionDirectory.name,
            file,
          )
          if (
            commandLine.toLowerCase().includes('copilot') &&
            (await processMatchesLock(pid, lockPath))
          ) {
            lockCandidates.push({
              pid,
              sessionId: sessionDirectory.name,
              source: 'lock',
              lockPath,
              modifiedAt: (await stat(lockPath)).mtimeMs,
            })
          }
        } catch (error) {
          if (
            (error as NodeJS.ErrnoException).code !== 'ENOENT' &&
            (error as NodeJS.ErrnoException).code !== 'ESRCH'
          ) {
            throw error
          }
        }
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
  const selectedBySession = new Map<string, LockCandidate>()
  for (const candidates of groupLockCandidates(lockCandidates).values()) {
    const candidate = await selectCurrentLockCandidate(candidates)
    const selected = selectedBySession.get(candidate.sessionId)
    if (!selected || candidate.modifiedAt > selected.modifiedAt) {
      selectedBySession.set(candidate.sessionId, candidate)
    }
  }
  for (const selected of selectedBySession.values()) {
    processes.push({
      pid: selected.pid,
      sessionId: selected.sessionId,
      source: selected.source,
    })
  }
  return processes
}

function groupLockCandidates(
  candidates: LockCandidate[],
): Map<number, LockCandidate[]> {
  const grouped = new Map<number, LockCandidate[]>()
  for (const candidate of candidates) {
    const processCandidates = grouped.get(candidate.pid) || []
    processCandidates.push(candidate)
    grouped.set(candidate.pid, processCandidates)
  }
  return grouped
}

async function selectCurrentLockCandidate(
  candidates: LockCandidate[],
): Promise<LockCandidate> {
  if (candidates.length === 1) {
    return candidates[0]
  }
  const openSessions = await openSessionIds(candidates[0].pid)
  const openCandidate = candidates.find((candidate) =>
    openSessions.has(candidate.sessionId),
  )
  return (
    openCandidate ||
    candidates.toSorted(
      (left, right) => right.modifiedAt - left.modifiedAt,
    )[0]
  )
}

async function openSessionIds(pid: number): Promise<Set<string>> {
  const sessions = new Set<string>()
  let descriptors: string[]
  try {
    descriptors = await readdir(`/proc/${pid}/fd`)
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      (error as NodeJS.ErrnoException).code === 'ESRCH'
    ) {
      return sessions
    }
    throw error
  }
  const stateDirectory = `${sessionStateDirectory()}${path.sep}`
  await Promise.all(
    descriptors.map(async (descriptor) => {
      try {
        const target = await readlink(`/proc/${pid}/fd/${descriptor}`)
        if (
          !target.startsWith(stateDirectory) ||
          path.basename(target) !== 'session.db'
        ) {
          return
        }
        const relative = path.relative(stateDirectory, target)
        const sessionId = relative.split(path.sep, 1)[0]
        if (sessionId) {
          sessions.add(sessionId)
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )
  return sessions
}

export async function findActiveCopilotProcesses(): Promise<
  Array<{ pid: number; sessionId: string; source: 'argument' | 'lock' }>
> {
  return findActiveProcesses()
}

export async function findActiveCopilotSessions(): Promise<DiscoveredSession[]> {
  const sessions: DiscoveredSession[] = []
  for (const processInfo of await findActiveProcesses()) {
    let cwd = ''
    try {
      cwd = await readlink(`/proc/${processInfo.pid}/cwd`)
    } catch {
      continue
    }
    sessions.push({
      id: processInfo.sessionId,
      cwd,
      title: 'Active Copilot session',
      updatedAt: new Date().toISOString(),
    })
  }
  return sessions
}

export async function stopActiveCopilotSession(sessionId: string): Promise<void> {
  const processes = (await findActiveProcesses()).filter(
    (processInfo) => processInfo.sessionId === sessionId,
  )
  for (const processInfo of processes) {
    if (!(await processStillMatches(processInfo, sessionId))) {
      continue
    }
    try {
      process.kill(processInfo.pid, 'SIGTERM')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
        throw error
      }
    }
  }
  for (const processInfo of processes) {
    let running = true
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (!(await processStillMatches(processInfo, sessionId))) {
        running = false
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    if (running && (await processStillMatches(processInfo, sessionId))) {
      process.kill(processInfo.pid, 'SIGKILL')
    }
  }
}

async function processStillMatches(
  processInfo: ActiveProcess,
  sessionId: string,
): Promise<boolean> {
  try {
    const commandLine = (await readFile(`/proc/${processInfo.pid}/cmdline`, 'utf8'))
      .replaceAll('\0', ' ')
      .trim()
    if (processInfo.source === 'argument') {
      return commandLine.match(sessionPattern)?.[1] === sessionId
    }
    const lockPath = path.join(
      sessionStateDirectory(),
      sessionId,
      `inuse.${processInfo.pid}.lock`,
    )
    return (
      commandLine.toLowerCase().includes('copilot') &&
      (await processMatchesLock(processInfo.pid, lockPath))
    )
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      (error as NodeJS.ErrnoException).code === 'ESRCH'
    ) {
      return false
    }

    throw error
  }
}

async function processMatchesLock(
  pid: number,
  lockPath: string,
): Promise<boolean> {
  try {
    const [lockContent, lockMetadata, processStart] = await Promise.all([
      readFile(lockPath, 'utf8'),
      stat(lockPath),
      processStartTimeMs(pid),
    ])
    if (lockContent.trim() !== String(pid)) {
      return false
    }
    const lockDelay = lockMetadata.mtimeMs - processStart
    if (lockDelay >= -2_000 && lockDelay <= 30_000) {
      return true
    }
    const sessionId = path.basename(path.dirname(lockPath))
    return (await openSessionIds(pid)).has(sessionId)
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      (error as NodeJS.ErrnoException).code === 'ESRCH'
    ) {
      return false
    }
    throw error
  }
}

async function processStartTimeMs(pid: number): Promise<number> {
  const [processStat, boot, ticks] = await Promise.all([
    readFile(`/proc/${pid}/stat`, 'utf8'),
    getBootTimeMs(),
    getClockTicks(),
  ])
  const fields = processStat
    .slice(processStat.lastIndexOf(')') + 1)
    .trim()
    .split(/\s+/)
  const startTicks = Number.parseInt(fields[19], 10)
  if (!Number.isFinite(startTicks)) {
    throw new Error(`Unable to read start time for PID ${pid}`)
  }
  return boot + (startTicks * 1_000) / ticks
}

function getClockTicks(): Promise<number> {
  clockTicks ??= execFileAsync('getconf', ['CLK_TCK']).then(({ stdout }) => {
    const value = Number.parseInt(stdout.trim(), 10)
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('Unable to determine CLK_TCK')
    }
    return value
  })
  return clockTicks
}

function getBootTimeMs(): Promise<number> {
  bootTimeMs ??= readFile('/proc/stat', 'utf8').then((content) => {
    const match = content.match(/^btime\s+(\d+)$/m)
    if (!match) {
      throw new Error('Unable to determine system boot time')
    }
    return Number.parseInt(match[1], 10) * 1_000
  })
  return bootTimeMs
}

async function isDescendantOf(
  candidatePid: number,
  ancestorPid: number,
): Promise<boolean> {
  let current = candidatePid
  const seen = new Set<number>()
  while (current > 1 && !seen.has(current)) {
    if (current === ancestorPid) {
      return true
    }
    seen.add(current)
    try {
      const stat = await readFile(`/proc/${current}/stat`, 'utf8')
      const fields = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/)
      current = Number.parseInt(fields[1], 10)
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code === 'ENOENT' ||
        (error as NodeJS.ErrnoException).code === 'ESRCH'
      ) {
        return false
      }
      throw error
    }
  }
  return false
}
