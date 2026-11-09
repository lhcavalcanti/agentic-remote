import { execFile, spawn } from 'node:child_process'
import { once } from 'node:events'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { noTmuxServer } from './tmux-errors.js'

const execFileAsync = promisify(execFile)
const retirementTimeoutMs = 2000
// How long a `start-server` client may outlive the creator that ran it.
const abandonedStartSettleMs = 2000
const abandonedRetirementFailure = 'abandoned-retirement-failed'

interface ServerIdentity {
  pid: number
  startTicks: string
  state: string
}

interface ProcessStat extends ServerIdentity {
  ppid: number
  pgrp: number
}

const ownedServers = new Map<string, ServerIdentity>()
const lifelines = new Map<string, Writable>()

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
  let lifeline: Writable
  try {
    lifeline = await superviseAbandonment(root)
  } catch (error) {
    // Nothing has run in the namespace yet.
    try {
      await rm(root, { recursive: true, force: true })
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], `Unable to supervise or remove ${root}`)
    }
    throw error
  }
  lifelines.set(root, lifeline)
  try {
    const identity = await startOwnedServer(root)
    ownedServers.set(root, identity)
    await new Promise<void>((resolve, reject) => {
      lifeline.write(`${JSON.stringify(identity)}\n`, (error) => (error ? reject(error) : resolve()))
    })
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
  const pid = parsePid(reportedPid, 'owned tmux server')
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
 * Teardown never runs when an earlier `afterEach` step throws or times out,
 * which skips the rest of that test's hooks, or when the run is killed. With
 * `exit-empty` off, the server and its panes would then run indefinitely, so a
 * detached watchdog is armed before the server starts. It holds the other end
 * of a pipe, on which the fixture reports the server it started. The pipe
 * closes once teardown has removed the root, or when the creating process
 * ends however it ends, reaped or not.
 *
 * The watchdog then retires the namespace as teardown would: only the reported
 * server, or -- once a start in flight has had time to finish -- the one its
 * socket names. It stops each verified pane's process group first, because
 * some fake CLIs ignore SIGHUP. Any doubt fails closed: nothing is killed, and
 * the root stays with the reason in `abandoned-retirement-failed`.
 */
async function superviseAbandonment(root: string): Promise<Writable> {
  const watchdog = spawn(process.execPath, [
    '--import', import.meta.resolve('tsx'),
    fileURLToPath(new URL('./tmux-fixture-watchdog.ts', import.meta.url)),
    root,
  ], { detached: true, env: isolatedTmuxEnv(root), stdio: ['pipe', 'ignore', 'ignore'] })
  // A watchdog that has ended must not take the creating process with it.
  watchdog.stdin.on('error', () => {})
  try {
    await once(watchdog, 'spawn')
  } catch (error) {
    watchdog.stdin.destroy()
    throw error
  }
  watchdog.unref()
  return watchdog.stdin
}

/**
 * What the watchdog does once the process that created `root` has gone without
 * teardown releasing it; `reported` is the server identity that process sent.
 */
export async function retireAbandonedTmuxRoot(root: string, reported: string | undefined): Promise<void> {
  try {
    await access(root)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  try {
    const owned = reported === undefined ? undefined : reportedIdentity(reported)
    // A `start-server` client can outlive a creator killed while it ran.
    if (!owned) await new Promise((resolve) => setTimeout(resolve, abandonedStartSettleMs))
    await retireNamespace(root, owned, true)
    await rm(root, { recursive: true, force: true })
  } catch (error) {
    const reason = error instanceof Error ? error.stack : String(error)
    await writeFile(path.join(root, abandonedRetirementFailure), `${reason}\n`).catch(() => {})
    throw error
  }
}

function reportedIdentity(reported: string): ServerIdentity {
  const { pid, state, startTicks } = JSON.parse(reported) as Record<keyof ServerIdentity, unknown>
  if (
    typeof pid !== 'number' || !Number.isSafeInteger(pid) || pid <= 0
    || typeof state !== 'string' || !/^[A-Za-z]$/.test(state)
    || typeof startTicks !== 'string' || !/^\d+$/.test(startTicks)
  ) {
    throw new Error(`Malformed tmux server identity reported to the watchdog: ${reported}`)
  }
  return { pid, state, startTicks }
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
  await retireNamespace(root, ownedServers.get(root), false)
  ownedServers.delete(root)
  await rm(root, { recursive: true, force: true })
  // Only a teardown that succeeded may stop the watchdog watching.
  lifelines.get(root)?.destroy()
  lifelines.delete(root)
}

async function retireNamespace(root: string, owned: ServerIdentity | undefined, panes: boolean): Promise<void> {
  if (owned) {
    await retireOwnedServer(root, owned, panes)
  } else {
    await retireDiscoveredServer(root, panes)
  }
}

/**
 * The fixture recorded this server's identity when it started it, so the
 * exact process is the evidence: an unreachable or replaced server fails
 * teardown rather than being inferred absent from the rest of the host.
 */
async function retireOwnedServer(root: string, owned: ServerIdentity, panes: boolean): Promise<void> {
  const current = await serverIdentity(owned.pid)
  assertSameIdentity(owned, current)
  if (retired(current)) {
    throw new Error(`Owned tmux server PID ${owned.pid} exited before teardown`)
  }
  const { stdout } = await execFileAsync('tmux', ['display-message', '-p', '#{pid}'], {
    env: isolatedTmuxEnv(root),
  })
  if (parsePid(stdout, 'owned tmux server') !== owned.pid) {
    throw new Error('Owned tmux server identity changed before shutdown')
  }
  assertSameIdentity(owned, await serverIdentity(owned.pid))
  if (panes) await terminatePanes(root, owned.pid)
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

async function retireDiscoveredServer(root: string, panes: boolean): Promise<void> {
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
      if (panes) await terminatePanes(root, pid)
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
  return parsePid(stdout, 'owned tmux server')
}

/**
 * Stops the process group of each live pane the verified `server` runs, which
 * `kill-server` alone leaves behind when the pane ignores SIGHUP.
 */
async function terminatePanes(root: string, server: number): Promise<void> {
  const env = isolatedTmuxEnv(root)
  let listed: string
  try {
    listed = (await execFileAsync('tmux', ['list-panes', '-a', '-F', '#{?pane_dead,,#{pane_pid}}'], { env })).stdout
  } catch (error) {
    // A server without sessions has no current target to list panes from.
    if ((await execFileAsync('tmux', ['list-sessions'], { env })).stdout.trim()) throw error
    return
  }
  for (const line of listed.split('\n')) {
    if (!line.trim()) continue
    const pane = await processStat(parsePid(line, 'tmux pane'), 'tmux pane')
    if (!pane || retired(pane) || pane.ppid !== server || pane.pgrp !== pane.pid) continue
    try {
      process.kill(-pane.pid, 'SIGTERM')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error
    }
  }
}

function parsePid(reported: string | undefined, owner: string): number {
  const value = reported?.trim() ?? ''
  const pid = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(pid) || pid <= 0) {
    throw new Error(`Unable to read the ${owner} PID`)
  }
  return pid
}

async function serverIdentity(pid: number): Promise<ServerIdentity | undefined> {
  const stat = await processStat(pid, 'owned tmux server')
  return stat && { pid, state: stat.state, startTicks: stat.startTicks }
}

async function processStat(pid: number, owner: string): Promise<ProcessStat | undefined> {
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
  const [state = '', ppid = '', pgrp = '', ...rest] = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/)
  // The start time is the 22nd field of /proc/<pid>/stat.
  const startTicks = rest[16] ?? ''
  // ppid and pgrp are signed: a task the kernel is releasing reports pgrp -1.
  if (
    Number(processId) !== pid || !/^[A-Za-z]$/.test(state)
    || ![ppid, pgrp].every((field) => /^-?\d+$/.test(field)) || !/^\d+$/.test(startTicks)
  ) {
    throw new Error(`Unable to read ${owner} identity for PID ${pid}`)
  }
  return { pid, state, ppid: Number(ppid), pgrp: Number(pgrp), startTicks }
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
