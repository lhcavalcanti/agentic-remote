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

export async function stopIsolatedTmuxServer(root: string): Promise<void> {
  await execFileAsync('tmux', ['kill-server']).catch(() => undefined)
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
