import { execFile } from 'node:child_process'
import { readFile, readlink } from 'node:fs/promises'
import { promisify } from 'node:util'
import type { DiscoveredSession } from './session-store.js'

const execFileAsync = promisify(execFile)
const sessionPattern =
  /(?:^|\s)--session-id(?:=|\s+)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s|$)/i

interface ActiveProcess {
  pid: number
  sessionId: string
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
  for (const line of output.split('\n')) {
    const match = line.match(sessionPattern)
    if (!match) {
      continue
    }
    const pid = Number.parseInt(line.trimStart().split(/\s+/, 1)[0], 10)
    if (!Number.isInteger(pid)) {
      continue
    }
    processes.push({ pid, sessionId: match[1] })
  }
  return processes
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
    return commandLine.match(sessionPattern)?.[1] === sessionId
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
