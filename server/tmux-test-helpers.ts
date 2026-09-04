import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

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
  // Addressed explicitly rather than left to the ambient environment: this is
  // the one command here that destroys whatever it reaches.
  await execFileAsync('tmux', ['kill-server'], {
    env: isolatedTmuxEnv(root),
  }).catch(() => undefined)
  await rm(root, { recursive: true, force: true })
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
