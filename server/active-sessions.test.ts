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
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  findActiveCopilotProcesses,
  stopActiveCopilotSession,
} from './active-sessions.js'

const execFileAsync = promisify(execFile)
const directories: string[] = []
const tmuxSessions: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    tmuxSessions.splice(0).map((session) =>
      execFileAsync('tmux', ['kill-session', '-t', session]).catch(
        () => undefined,
      ),
    ),
  )
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
    const sessionId = '12345678-1234-1234-1234-123456789abc'
    const tmuxSession = `agentic-argument-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      process.execPath,
      '-e',
      'setTimeout(() => {}, 60_000)',
      '--',
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

    await stopActiveCopilotSession(sessionId)

    expect(await waitForProcessExit(pid)).toBe(true)
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
        "require('node:fs').openSync(process.argv[2], 'r')\n" +
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
    await new Promise((resolve) => setTimeout(resolve, 100))
    await Promise.all([
      writeFile(path.join(staleDirectory, `inuse.${pid}.lock`), `${pid}\n`),
      writeFile(path.join(currentDirectory, `inuse.${pid}.lock`), `${pid}\n`),
    ])
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
})

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
