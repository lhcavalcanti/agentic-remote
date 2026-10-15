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

const ownedServers = new Map<string, ServerIdentity>()

/**
 * Gives each test its own tmux socket namespace. Reusing tmux's default socket
 * lets one test race a 3.6 server that is still exiting after the prior test.
 *
 * The namespace is served by a server the fixture starts and keeps until
 * teardown, even while it has no sessions. Left to exit with its last session
 * -- or never started, as in parser-only tests -- teardown had to prove the
 * server absent through a host-wide process scan, and any tmux in another
 * mount namespace (a sandboxed suite run on the same host) leaves that scan
 * indeterminate for as long as it runs.
 *
 * Requires tmux 3.4 or newer, the first release whose `update-environment`
 * copies every variable a pattern matches.
 *
 * Production's default `exit-empty` never leaves a server without sessions,
 * and such a server answers `list-panes -a` with "no current target". A test
 * whose code under test lists panes keeps a session of its own open.
 */
export async function createIsolatedTmuxRoot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'agentic-remote-tmux-test-'))
  try {
    ownedServers.set(root, await startOwnedServer(root))
  } catch (error) {
    try {
      await stopIsolatedTmuxServer(root)
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], `Unable to start or retire the tmux server owned by ${root}`)
    }
    throw error
  }
  return root
}

async function startOwnedServer(root: string): Promise<ServerIdentity> {
  const { stdout } = await execFileAsync('tmux', [
    // The fixture's settings alone, never the host's tmux configuration.
    '-f', '/dev/null', 'start-server',
    ';', 'set-option', '-g', 'exit-empty', 'off',
    // Panes take the server's environment, captured here before the test
    // stubs its own. Let each session take its creating client's instead, as
    // when that client was the one starting the server.
    ';', 'set-option', '-g', 'update-environment', '*',
    ';', 'display-message', '-p', '#{pid} #{version}',
    ';', 'show-options', '-gv', 'exit-empty',
  ], { env: isolatedTmuxEnv(root) })
  const [reported, exitEmpty] = stdout.trim().split('\n')
  const [reportedPid, version = ''] = (reported ?? '').trim().split(' ')
  const pid = serverPid(reportedPid)
  // Earlier releases copy only the first variable `*` matches, or none.
  const [, major, minor] = /^(?:next-)?(\d+)\.(\d+)/.exec(version) ?? []
  if (!major || Number(major) * 100 + Number(minor) < 304) {
    throw new Error(
      `Isolated tmux fixtures need tmux 3.4 or newer to give each session its creating client's environment; found ${version || 'no version'}`,
    )
  }
  if (exitEmpty?.trim() !== 'off') {
    throw new Error('Unable to keep the owned tmux server running while it has no sessions')
  }
  const identity = await serverIdentity(pid)
  if (!identity || retired(identity)) {
    throw new Error(`Owned tmux server PID ${pid} did not stay running`)
  }
  return identity
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
  const owned = ownedServers.get(root)
  if (owned) {
    await retireOwnedServer(root, owned)
    ownedServers.delete(root)
  } else {
    await retireDiscoveredServer(root)
  }
  await rm(root, { recursive: true, force: true })
}

/**
 * The fixture recorded this server's identity when it started it, so the
 * exact process is the evidence: an unreachable or replaced server fails
 * teardown rather than being inferred absent from the rest of the host.
 */
async function retireOwnedServer(root: string, owned: ServerIdentity): Promise<void> {
  const current = await serverIdentity(owned.pid)
  assertSameIdentity(owned, current)
  if (retired(current)) {
    throw new Error(`Owned tmux server PID ${owned.pid} exited before teardown`)
  }
  const { stdout } = await execFileAsync('tmux', ['display-message', '-p', '#{pid}'], {
    env: isolatedTmuxEnv(root),
  })
  if (serverPid(stdout) !== owned.pid) {
    throw new Error('Owned tmux server identity changed before shutdown')
  }
  assertSameIdentity(owned, await serverIdentity(owned.pid))
  let failure: unknown
  try {
    await execFileAsync('tmux', ['kill-server'], { env: isolatedTmuxEnv(root) })
  } catch (error) {
    // kill-server can fail once its server has begun exiting; the exact
    // process is the evidence either way.
    failure = error
  }
  if (!(await retirement(owned))) {
    throw failure ?? new Error(`Timed out waiting for owned tmux server PID ${owned.pid} to retire`)
  }
}

async function retireDiscoveredServer(root: string): Promise<void> {
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
    if (!(await retirement(identity))) {
      throw new Error(`Timed out waiting for owned tmux server PID ${pid} to retire`)
    }
  }
}

async function retirement(identity: ServerIdentity): Promise<boolean> {
  return eventually(async () => {
    const remaining = await serverIdentity(identity.pid)
    assertSameIdentity(identity, remaining)
    return retired(remaining)
  }, Boolean, retirementTimeoutMs)
}

async function ownedServerPid(root: string): Promise<number | undefined> {
  let stdout: string
  try {
    stdout = (await execFileAsync('tmux', ['display-message', '-p', '#{pid}'], {
      env: isolatedTmuxEnv(root),
    })).stdout
  } catch (error) {
    if (await noTmuxServer(error)) return undefined
    // A different server can retire during the read-only absence probe.
    // Require conclusive evidence within the fixture budget, never assume it.
    if (await eventually(() => noTmuxServer(error), Boolean, retirementTimeoutMs)) {
      return undefined
    }
    throw error
  }
  return serverPid(stdout)
}

function serverPid(reported: string | undefined): number {
  const value = reported?.trim() ?? ''
  const pid = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(pid) || pid <= 0) {
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
