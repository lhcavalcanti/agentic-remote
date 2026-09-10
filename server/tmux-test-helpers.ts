import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { noTmuxServer } from './tmux-errors.js'

const execFileAsync = promisify(execFile)
const retirementTimeoutMs = 2000

interface ServerIdentity {
  pid: number
  startTicks: string
  state: string
}

/**
 * Gives each test its own tmux socket namespace. Reusing tmux's default socket
 * lets one test race a 3.6 server that is still exiting after the prior test.
 */
export async function createIsolatedTmuxRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), 'agentic-remote-tmux-test-'))
}

/**
 * The environment a tmux command has to run in to stay inside the test's own
 * socket namespace.
 *
 * `TMUX_TMPDIR` is not enough on its own. A client started inside a tmux
 * session reads the socket out of `TMUX` and talks to that server whatever the
 * temporary directory says, so a suite run from a terminal that is itself
 * inside tmux would address the developer's own server -- and `kill-server`
 * would take every session they had running with it.
 */
export function isolatedTmuxEnv(root: string): NodeJS.ProcessEnv {
  return { ...process.env, TMUX_TMPDIR: root, TMUX: '' }
}

export async function stopIsolatedTmuxServer(root: string): Promise<void> {
  const pid = await ownedServerPid(root)
  if (pid !== undefined) {
    const identity = await serverIdentity(pid)
    if (!identity) throw new Error(`Unable to capture owned tmux server PID ${pid}`)

    const confirmedPid = await ownedServerPid(root)
    if (confirmedPid !== undefined && confirmedPid !== pid) {
      throw new Error('Owned tmux server identity changed before shutdown')
    }
    const current = await serverIdentity(pid)
    assertSameIdentity(identity, current)
    if (confirmedPid !== undefined && !retired(current)) {
      try {
        await execFileAsync('tmux', ['kill-server'], { env: isolatedTmuxEnv(root) })
      } catch (error) {
        if (!(await noTmuxServer(error))) throw error
      }
    }

    // The client can exit before its server. Keep the namespace intact until
    // the exact process has retired, so the next fixture cannot probe it mid-exit.
    const stopped = await eventually(async () => {
      const remaining = await serverIdentity(pid)
      assertSameIdentity(identity, remaining)
      return retired(remaining)
    }, Boolean, retirementTimeoutMs)
    if (!stopped) throw new Error(`Timed out waiting for owned tmux server PID ${pid} to retire`)
  }
  await rm(root, { recursive: true, force: true })
}

async function ownedServerPid(root: string): Promise<number | undefined> {
  let stdout: string
  try {
    stdout = (await execFileAsync('tmux', ['display-message', '-p', '#{pid}'], {
      env: isolatedTmuxEnv(root),
    })).stdout
  } catch (error) {
    if (await noTmuxServer(error)) return undefined
    throw error
  }
  const pid = Number(stdout.trim())
  if (!/^\d+$/.test(stdout.trim()) || !Number.isSafeInteger(pid) || pid <= 0) {
    throw new Error('Unable to read the owned tmux server PID')
  }
  return pid
}

async function serverIdentity(pid: number): Promise<ServerIdentity | undefined> {
  let stat: string
  try {
    stat = await readFile(`/proc/${pid}/stat`, 'utf8')
  } catch (error) {
    if (['ENOENT', 'ESRCH'].includes((error as NodeJS.ErrnoException).code ?? '')) {
      return undefined
    }
    throw error
  }
  const processId = /^(\d+) \(/.exec(stat)?.[1]
  const fields = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/)
  if (Number(processId) !== pid || !/^[A-Za-z]$/.test(fields[0] ?? '') || !/^\d+$/.test(fields[19] ?? '')) {
    throw new Error(`Unable to read owned tmux server identity for PID ${pid}`)
  }
  return { pid, state: fields[0], startTicks: fields[19] }
}

function assertSameIdentity(expected: ServerIdentity, actual: ServerIdentity | undefined): void {
  if (actual && actual.startTicks !== expected.startTicks) {
    throw new Error(`Owned tmux server PID ${expected.pid} changed start identity`)
  }
}

function retired(identity: ServerIdentity | undefined): boolean {
  return !identity || identity.state === 'Z' || identity.state === 'X'
}

/**
 * Reads state produced by another process until the expected state is visible
 * or the deadline passes.
 */
export async function eventually<T>(
  read: () => Promise<T>,
  matches: (value: T) => boolean,
  timeoutMs = 10_000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs
  let value = await read()
  while (!matches(value) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    value = await read()
  }
  return value
}

export async function waitForProcessCommand(
  pid: number,
  expected: string[],
): Promise<void> {
  const commandLine = await eventually(
    async () =>
      (await readFile(`/proc/${pid}/cmdline`, 'utf8'))
        .replaceAll('\0', ' ')
        .trim(),
    (commandLine) => expected.every((part) => commandLine.includes(part)),
  )
  const missing = expected.filter((part) => !commandLine.includes(part))
  if (missing.length > 0) {
    throw new Error(
      `PID ${pid} did not become ready; missing ${missing.join(', ')} from ${commandLine}`,
    )
  }
}
