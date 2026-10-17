import { execFile } from 'node:child_process'
import { readdir, readFile, readlink, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import type { DiscoveredSession } from './session-store.js'
import { noTmuxServer, tmuxNotInstalled } from './tmux-errors.js'

const execFileAsync = promisify(execFile)
const sessionPattern =
  /(?:^|\s)(?:--session-id|--resume|-r)(?:=|\s+)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s|$)/i
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
    const result = await execFileAsync('ps', ['-eo', 'pid=,ppid=,args='], {
      maxBuffer: 4 * 1024 * 1024,
    })
    output = result.stdout
  } catch (error) {
    // Failing to enumerate processes is not the same as there being none.
    // Returning an empty list here reported every running session as stopped.
    throw new Error(
      `Unable to list processes: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    )
  }

  const tmuxPanePids = await listTmuxPanePids()
  // Parents come from the same listing, so placing a candidate in a pane is a
  // lookup rather than a /proc read for every pane, ancestor and candidate --
  // hundreds of sequential reads on a host with a few stray processes.
  const parents = new Map<number, number>()
  const listed: { pid: number; args: string }[] = []
  for (const line of output.split('\n')) {
    const row = /^\s*(\d+)\s+(\d+)(?:\s(.*))?$/.exec(line)
    if (!row) {
      continue
    }
    const pid = Number.parseInt(row[1], 10)
    parents.set(pid, Number.parseInt(row[2], 10))
    listed.push({ pid, args: row[3] ?? '' })
  }
  const argumentCandidates: ActiveProcess[] = []
  const argumentPids = new Set<number>()
  for (const { pid, args } of listed) {
    const match = args.match(sessionPattern)
    if (!match) {
      continue
    }
    if (
      (await processRunsInTmux(pid, tmuxPanePids, parents)) &&
      (await processUsesSessionState(pid)) &&
      (await isCopilotProcess(pid))
    ) {
      argumentCandidates.push({
        pid,
        sessionId: match[1],
        source: 'argument',
      })
    }
  }
  const processes = await removeArgumentWrappers(argumentCandidates, parents)
  for (const processInfo of processes) {
    argumentPids.add(processInfo.pid)
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
            (await processRunsInTmux(pid, tmuxPanePids, parents)) &&
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

async function processUsesSessionState(pid: number): Promise<boolean> {
  try {
    const environment = (await readFile(`/proc/${pid}/environ`, 'utf8')).split(
      '\0',
    )
    const configuredHome = environment
      .find((entry) => entry.startsWith('COPILOT_HOME='))
      ?.slice('COPILOT_HOME='.length)
      .trim()
    const processHome = environment
      .find((entry) => entry.startsWith('HOME='))
      ?.slice('HOME='.length)
      .trim()
    const configured =
      configuredHome || (processHome ? path.join(processHome, '.copilot') : '')
    if (!configured) {
      return false
    }
    return (
      path.resolve(configured, 'session-state') ===
      path.resolve(sessionStateDirectory())
    )
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      (error as NodeJS.ErrnoException).code === 'ESRCH' ||
      (error as NodeJS.ErrnoException).code === 'EACCES' ||
      (error as NodeJS.ErrnoException).code === 'EPERM'
    ) {
      return false
    }
    throw error
  }
}

async function isCopilotProcess(pid: number): Promise<boolean> {
  try {
    const command = (await readFile(`/proc/${pid}/cmdline`, 'utf8'))
      .split('\0')
      .filter(Boolean)
    return command.some((argument) =>
      path.basename(argument).toLowerCase().includes('copilot'),
    )
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      (error as NodeJS.ErrnoException).code === 'ESRCH' ||
      (error as NodeJS.ErrnoException).code === 'EACCES' ||
      (error as NodeJS.ErrnoException).code === 'EPERM'
    ) {
      return false
    }
    throw error
  }
}

async function listTmuxPanePids(): Promise<number[]> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { stdout } = await execFileAsync('tmux', [
        'list-panes',
        '-a',
        '-F',
        '#{pane_pid}',
      ])
      return stdout
        .split('\n')
        .map((value) => Number.parseInt(value, 10))
        .filter(Number.isInteger)
    } catch (error) {
      // A computer without tmux, or without a server running, genuinely has
      // no panes. Anything else is a socket that could not be reached or
      // read, and answering "no panes" for it says every terminal-backed
      // session has exited: discovery would drop them all, and stopping one
      // would report success without having killed anything.
      if (tmuxNotInstalled(error) || (await noTmuxServer(error))) {
        return []
      }
      lastError = error
      // Reading the pane list is the only thing that tells a live session
      // apart from a stopped one, so a momentary failure is retried before it
      // is allowed to become the caller's answer.
      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)))
    }
  }
  throw lastError
}

async function processRunsInTmux(
  pid: number,
  panePids: number[],
  parents: ReadonlyMap<number, number>,
): Promise<boolean> {
  const panes = new Set(panePids)
  let current = pid
  const seen = new Set<number>()
  while (current > 1 && !seen.has(current)) {
    if (panes.has(current)) {
      return true
    }
    seen.add(current)
    const parent = await parentOf(current, parents)
    if (parent === undefined) {
      return false
    }
    current = parent
  }
  return false
}

async function removeArgumentWrappers(
  candidates: ActiveProcess[],
  parents: ReadonlyMap<number, number>,
): Promise<ActiveProcess[]> {
  const selected: ActiveProcess[] = []
  for (const candidate of candidates) {
    const wrapsMatchingProcess = (
      await Promise.all(
        candidates.map(
          async (other) =>
            other.pid !== candidate.pid &&
            other.sessionId === candidate.sessionId &&
            (await isDescendantOf(other.pid, candidate.pid, parents)),
        ),
      )
    ).some(Boolean)
    if (!wrapsMatchingProcess) {
      selected.push(candidate)
    }
  }
  return selected
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

/** Fresh identity proof for a leaf CLI; wrappers and lock-only owners need discovery. */
export async function isDirectCopilotSessionProcess(
  pid: number,
  sessionId: string,
): Promise<boolean> {
  if (
    !(await processStillMatches({ pid, sessionId, source: 'argument' }, sessionId)) ||
    !(await processUsesSessionState(pid)) ||
    !(await isCopilotProcess(pid))
  ) {
    return false
  }
  return !(await readFile(`/proc/${pid}/task/${pid}/children`, 'utf8')).trim()
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
  parents: ReadonlyMap<number, number>,
): Promise<boolean> {
  let current = candidatePid
  const seen = new Set<number>()
  while (current > 1 && !seen.has(current)) {
    if (current === ancestorPid) {
      return true
    }
    seen.add(current)
    const parent = await parentOf(current, parents)
    if (parent === undefined) {
      return false
    }
    current = parent
  }
  return false
}

/**
 * A process's parent from the listing it was found in, or read from /proc
 * for one that started after it. Undefined once the process has gone.
 */
async function parentOf(
  pid: number,
  parents: ReadonlyMap<number, number>,
): Promise<number | undefined> {
  const listed = parents.get(pid)
  if (listed !== undefined) {
    return listed
  }
  try {
    const stat = await readFile(`/proc/${pid}/stat`, 'utf8')
    const fields = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/)
    return Number.parseInt(fields[1], 10)
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      (error as NodeJS.ErrnoException).code === 'ESRCH'
    ) {
      return undefined
    }
    throw error
  }
}
