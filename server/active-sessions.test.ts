import { execFile, spawn } from 'node:child_process'
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  utimes,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  findActiveCopilotProcesses,
  stopActiveCopilotSession,
} from './active-sessions.js'
import {
  createIsolatedTmuxRoot,
  eventually,
  stopIsolatedTmuxServer,
  waitForProcessCommand,
} from './tmux-test-helpers.js'

const execFileAsync = promisify(execFile)
const directories: string[] = []
const tmuxSessions: string[] = []
let tmuxRoot = ''

beforeEach(async () => {
  tmuxRoot = await createIsolatedTmuxRoot()
  vi.stubEnv('HOME', tmuxRoot)
  vi.stubEnv('TMUX_TMPDIR', tmuxRoot)
  // A client started inside a tmux session reads its socket out of `TMUX` and
  // talks to that server whatever the temporary directory says. Left set, a
  // suite run from inside tmux drives the developer's own server -- and the
  // teardown would kill every session they had open.
  vi.stubEnv('TMUX', '')
})

afterEach(async () => {
  tmuxSessions.splice(0)
  await stopIsolatedTmuxServer(tmuxRoot)
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('active Copilot processes', () => {
  it('ignores Copilot-shaped descendants owned by the server', async () => {
    const sessionId = 'aaaaaaaa-1234-1234-1234-123456789abc'
    const child = spawn(
      process.execPath,
      ['-e', 'setTimeout(() => {}, 60_000)', '--', '--session-id', sessionId],
      { stdio: 'ignore' },
    )
    await new Promise((resolve) => setTimeout(resolve, 100))

    const processes = await findActiveCopilotProcesses()

    expect(processes.some((entry) => entry.pid === child.pid)).toBe(false)
    child.kill('SIGTERM')
  })

  it('terminates a tmux process carrying a matching session argument', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    const sessionId = '12345678-1234-1234-1234-123456789abc'
    const executable = path.join(directory, 'copilot-argument-test.cjs')
    await writeFile(executable, 'setTimeout(() => {}, 60_000)\n')
    const tmuxSession = `agentic-argument-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      '-e',
      `COPILOT_HOME=${copilotHome}`,
      process.execPath,
      executable,
      '--session-id',
      sessionId,
    ])
    const pid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          tmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    await waitForProcessCommand(pid, [executable, sessionId])

    expect(
      (await findActiveCopilotProcesses()).filter(
        (processInfo) => processInfo.sessionId === sessionId,
      ),
    ).toEqual([{ pid, sessionId, source: 'argument' }])

    await stopActiveCopilotSession(sessionId)

    expect(await waitForProcessExit(pid)).toBe(true)
  })

  it('selects the nested Copilot process instead of its argument wrapper', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    const wrapper = path.join(directory, 'copilot-wrapper.cjs')
    const childScript = path.join(directory, 'copilot-child.cjs')
    const childPidFile = path.join(directory, 'child.pid')
    await writeFile(childScript, 'setTimeout(() => {}, 60_000)\n')
    await writeFile(
      wrapper,
      [
        "const { spawn } = require('node:child_process')",
        "const { writeFileSync } = require('node:fs')",
        'const sessionId = process.argv[3]',
        'const child = spawn(process.execPath, [',
        `  ${JSON.stringify(childScript)},`,
        "  '--session-id',",
        '  sessionId,',
        "], { stdio: 'ignore' })",
        'writeFileSync(process.argv[4], String(child.pid))',
        'setTimeout(() => {}, 60_000)',
      ].join('\n'),
    )
    const sessionId = 'abababab-1234-1234-1234-123456789abc'
    const tmuxSession = `agentic-wrapper-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      '-e',
      `COPILOT_HOME=${copilotHome}`,
      process.execPath,
      wrapper,
      '--session-id',
      sessionId,
      childPidFile,
    ])
    let childPid = 0
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        childPid = Number.parseInt(await readFile(childPidFile, 'utf8'), 10)
        break
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
    }
    expect(childPid).toBeGreaterThan(0)
    await waitForProcessCommand(childPid, [childScript, sessionId])

    expect(
      (await findActiveCopilotProcesses()).filter(
        (processInfo) => processInfo.sessionId === sessionId,
      ),
    ).toEqual([{ pid: childPid, sessionId, source: 'argument' }])

    await stopActiveCopilotSession(sessionId)
    expect(await waitForProcessExit(childPid)).toBe(true)
  })

  it('ignores unrelated tmux processes carrying a session-shaped argument', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot-home'))
    const sessionId = 'acacacac-1234-1234-1234-123456789abc'
    const executable = path.join(directory, 'unrelated-process.cjs')
    await writeFile(executable, 'setTimeout(() => {}, 60_000)\n')
    const tmuxSession = `agentic-unrelated-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      process.execPath,
      executable,
      '--session-id',
      sessionId,
    ])
    const pid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          tmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    await waitForProcessCommand(pid, [executable, sessionId])

    expect(
      (await findActiveCopilotProcesses()).some(
        (processInfo) => processInfo.sessionId === sessionId,
      ),
    ).toBe(false)
  })

  it('terminates a lock-discovered external Copilot process', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-lock-test')
    await writeFile(executable, '#!/usr/bin/env bash\nsleep 60\n')
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-lock-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      executable,
    ])
    const pid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          tmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    await waitForProcessCommand(pid, [executable])
    const sessionId = 'bbbbbbbb-1234-1234-1234-123456789abc'
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(
      copilotHome,
      'session-state',
      sessionId,
    )
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(
      path.join(sessionDirectory, `inuse.${pid}.lock`),
      `${pid}\n`,
    )
    vi.stubEnv('COPILOT_HOME', copilotHome)

    await stopActiveCopilotSession(sessionId)

    expect(await waitForProcessExit(pid)).toBe(true)
  })

  it('ignores a stale lock that points at an unrelated reused PID', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-decoy')
    await writeFile(executable, '#!/usr/bin/env bash\nsleep 60\n')
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-stale-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      executable,
    ])
    const pid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          tmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    await waitForProcessCommand(pid, [executable])
    const sessionId = 'cccccccc-1234-1234-1234-123456789abc'
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(
      copilotHome,
      'session-state',
      sessionId,
    )
    await mkdir(sessionDirectory, { recursive: true })
    const lockPath = path.join(sessionDirectory, `inuse.${pid}.lock`)
    await writeFile(lockPath, `${pid}\n`)
    const staleTime = new Date(Date.now() - 60_000)
    await utimes(lockPath, staleTime, staleTime)
    vi.stubEnv('COPILOT_HOME', copilotHome)

    await stopActiveCopilotSession(sessionId)

    expect(await processExists(pid)).toBe(true)
  })

  it('selects the open session database when one PID has multiple locks', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-multiple-locks-test')
    await writeFile(
      executable,
      '#!/usr/bin/env node\n' +
        "const fs = require('node:fs')\n" +
        "fs.openSync(process.argv[2], 'r')\n" +
        "fs.writeFileSync(process.argv[3], 'ready')\n" +
        'setTimeout(() => {}, 60_000)\n',
    )
    await chmod(executable, 0o755)
    const copilotHome = path.join(directory, 'copilot-home')
    const staleSessionId = 'dddddddd-1234-1234-1234-123456789abc'
    const currentSessionId = 'eeeeeeee-1234-1234-1234-123456789abc'
    const staleDirectory = path.join(
      copilotHome,
      'session-state',
      staleSessionId,
    )
    const currentDirectory = path.join(
      copilotHome,
      'session-state',
      currentSessionId,
    )
    await Promise.all([
      mkdir(staleDirectory, { recursive: true }),
      mkdir(currentDirectory, { recursive: true }),
    ])
    const currentDatabase = path.join(currentDirectory, 'session.db')
    const readyFile = path.join(directory, 'multiple-locks-ready')
    await writeFile(currentDatabase, '')
    const tmuxSession = `agentic-multiple-locks-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      executable,
      currentDatabase,
      readyFile,
    ])
    const pid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          tmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    expect(
      await eventually(
        () =>
          readFile(readyFile, 'utf8').catch((error: NodeJS.ErrnoException) => {
            if (error.code === 'ENOENT') {
              return ''
            }
            throw error
          }),
        (value) => value === 'ready',
      ),
    ).toBe('ready')
    const staleLock = path.join(staleDirectory, `inuse.${pid}.lock`)
    const currentLock = path.join(currentDirectory, `inuse.${pid}.lock`)
    await Promise.all([
      writeFile(staleLock, `${pid}\n`),
      writeFile(currentLock, `${pid}\n`),
    ])
    const delayedLockTime = new Date(Date.now() + 45_000)
    await utimes(currentLock, delayedLockTime, delayedLockTime)
    vi.stubEnv('COPILOT_HOME', copilotHome)

    const processes = await findActiveCopilotProcesses()

    expect(
      processes.filter((processInfo) => processInfo.pid === pid),
    ).toEqual([
      {
        pid,
        sessionId: currentSessionId,
        source: 'lock',
      },
    ])
  })

  it('selects one owner when one session has locks from multiple PIDs', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-multiple-processes-test')
    await writeFile(executable, '#!/usr/bin/env bash\nsleep 60\n')
    await chmod(executable, 0o755)
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionId = 'ffffffff-1234-1234-1234-123456789abc'
    const sessionDirectory = path.join(
      copilotHome,
      'session-state',
      sessionId,
    )
    await mkdir(sessionDirectory, { recursive: true })

    const firstTmuxSession = `agentic-first-owner-${process.pid}`
    const secondTmuxSession = `agentic-second-owner-${process.pid}`
    tmuxSessions.push(firstTmuxSession, secondTmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      firstTmuxSession,
      executable,
    ])
    const firstPid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          firstTmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    await waitForProcessCommand(firstPid, [executable])
    await writeFile(
      path.join(sessionDirectory, `inuse.${firstPid}.lock`),
      `${firstPid}\n`,
    )
    await new Promise((resolve) => setTimeout(resolve, 20))
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      secondTmuxSession,
      executable,
    ])
    const secondPid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          secondTmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    await waitForProcessCommand(secondPid, [executable])
    await writeFile(
      path.join(sessionDirectory, `inuse.${secondPid}.lock`),
      `${secondPid}\n`,
    )
    vi.stubEnv('COPILOT_HOME', copilotHome)

    const processes = await findActiveCopilotProcesses()

    expect(
      processes.filter((processInfo) => processInfo.sessionId === sessionId),
    ).toEqual([
      {
        pid: secondPid,
        sessionId,
        source: 'lock',
      },
    ])
  })

  it('reports a tmux socket failure instead of reporting nothing running', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    await stubTmux(
      directory,
      'echo "error connecting to /tmp/tmux-1000/default (permission denied)" >&2\nexit 1\n',
    )

    await expect(findActiveCopilotProcesses()).rejects.toThrow(
      /permission denied/,
    )
  })

  it('reports nothing running when tmux has no server to ask', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    await stubTmux(
      directory,
      'echo "no server running on /tmp/tmux-1000/default" >&2\nexit 1\n',
    )

    await expect(findActiveCopilotProcesses()).resolves.toEqual([])
  })

  it('leaves a session running when tmux cannot say whether it is', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'active-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-unstoppable')
    await writeFile(executable, '#!/usr/bin/env bash\nsleep 60\n')
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-unstoppable-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      executable,
    ])
    const pid = Number.parseInt(
      (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          tmuxSession,
          '#{pane_pid}',
        ])
      ).stdout,
      10,
    )
    await waitForProcessCommand(pid, [executable])
    const sessionId = 'a1a1a1a1-1234-1234-1234-123456789abc'
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(copilotHome, 'session-state', sessionId)
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(path.join(sessionDirectory, `inuse.${pid}.lock`), `${pid}\n`)
    vi.stubEnv('COPILOT_HOME', copilotHome)
    await stubTmux(
      directory,
      'echo "error connecting to /tmp/tmux-1000/default (permission denied)" >&2\nexit 1\n',
    )

    // Stopping must not report success it cannot stand behind: the caller
    // deletes the session afterwards, and a silent no-op leaves the process
    // running with nothing left pointing at it.
    await expect(stopActiveCopilotSession(sessionId)).rejects.toThrow(
      /permission denied/,
    )
    expect(await processExists(pid)).toBe(true)
  })
})

/**
 * Puts a tmux that fails in a stated way ahead of the real one on `PATH`, so
 * the caller's handling of that failure can be observed. `ps` and the rest of
 * the environment are left reachable.
 */
async function stubTmux(directory: string, script: string): Promise<void> {
  const binDirectory = path.join(directory, 'bin')
  await mkdir(binDirectory, { recursive: true })
  const executable = path.join(binDirectory, 'tmux')
  await writeFile(executable, `#!/usr/bin/env bash\n${script}`)
  await chmod(executable, 0o755)
  vi.stubEnv('PATH', `${binDirectory}:${process.env.PATH ?? ''}`)
}

async function processExists(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 0)
    const stat = await readFile(`/proc/${pid}/stat`, 'utf8')
    const state = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/, 1)[0]
    return state !== 'Z'
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ESRCH' ||
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return false
    }
    throw error
  }
}

async function waitForProcessExit(pid: number): Promise<boolean> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (!(await processExists(pid))) {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  return false
}
