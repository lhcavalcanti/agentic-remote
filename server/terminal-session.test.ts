import { execFile } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  parseTerminalPermission,
  parseTerminalUserInput,
  TmuxTerminalSessionController,
} from './terminal-session.js'

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

describe('TmuxTerminalSessionController', () => {
  it('parses Copilot ask-user choice and freeform dialogs', () => {
    expect(
      parseTerminalUserInput(`
│ Question                                      │
│ ────────────────────────────────────────────  │
│ Which environment do you prefer?              │
│                                               │
│ ❯ 1. Production                               │
│   2. Staging                                  │
│   3. Other (type your answer)                 │
│                                               │
│ ↑/↓ to select · enter to confirm · esc cancel │
      `),
    ).toMatchObject({
      question: 'Which environment do you prefer?',
      choices: ['Production', 'Staging'],
      allowFreeform: true,
    })

    expect(
      parseTerminalUserInput(`
│ Question                         │
│ Which package group?             │
│ ❯ 1. Standard                    │
│   2. Other package managers      │
│ ↑/↓ to select · enter to confirm │
      `),
    ).toMatchObject({
      choices: ['Standard', 'Other package managers'],
      allowFreeform: false,
    })
    expect(
      parseTerminalUserInput(`
│ Question                           │
│ Describe your deployment plan.     │
│                                    │
│ ❯ Type your answer...              │
│                                    │
│ enter to submit · esc to cancel    │
      `),
    ).toMatchObject({
      question: 'Describe your deployment plan.',
      choices: [],
      allowFreeform: true,
    })
  })

  it('parses Copilot terminal permission dialogs', () => {
    expect(
      parseTerminalPermission(`
Permission request (1 remaining)

╭────────────────────────────────────────────────────────────╮
│ Check DNS and credential presence                          │
│ ────────────────────────────────────────────────────────── │
│ printf 'files DNS: '; getent ahostsv4 files.example.test  │
│                                                            │
│ Do you want to run this command?                           │
│                                                            │
│ ❯ 1. Yes                                                   │
│   2. No, and tell Copilot what to do differently           │
│                                                            │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toMatchObject({
      requestId: expect.stringMatching(/^terminal-permission:/),
      title: 'Check DNS and credential presence',
      kind: 'terminal',
      choiceCount: 2,
      options: [
        { optionId: 'terminal:allow', name: 'Yes', kind: 'allow_once' },
        { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
      ],
    })
    expect(
      parseTerminalPermission(`
────────────────────────────────────────────────────────────
│ Query selected services
│ ──────────────────────────────────────────────────────────
│ ──────────────────────────────────────────────────────────
│ SELECT name FROM services
│ WHERE enabled = true
│ ──────────────────────────────────────────────────────────
│ Do you want to run this command?
│ ❯ 1. Yes
│   2. Yes, and allow similar commands this session
│   3. No, and tell Copilot what to do differently
│ ↑/↓ to navigate · enter to select · esc to cancel
      `),
    ).toMatchObject({
      title: 'Query selected services',
      choiceCount: 3,
      options: [
        { optionId: 'terminal:allow', name: 'Yes' },
        { optionId: 'terminal:stop', name: 'Stop' },
      ],
    })
  })

  it('creates a Copilot window in the configured existing tmux session', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const output = path.join(directory, 'cwd.txt')
    const executable = path.join(directory, 'copilot-window-fake')
    await writeFile(
      executable,
      `#!/usr/bin/env bash\nprintf '%s' "$PWD" >"${output}"\nsleep 60\n`,
    )
    await chmod(executable, 0o755)
    const tmuxSession = String(process.pid)
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      'sleep',
      '60',
    ])
    vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', tmuxSession)
    vi.stubEnv('COPILOT_BIN', executable)
    const sessionId = '01234567-89ab-cdef-0123-456789abcdef'

    const controller = new TmuxTerminalSessionController()
    const location = await controller.create(
      sessionId,
      directory,
      'Project workspace',
    )
    expect(await controller.rename(sessionId, 'Renamed project')).toBe(true)
    expect(
      await controller.configure(sessionId, directory, {
        model: 'gpt-test',
        reasoningEffort: 'high',
        contextTier: 'long_context',
      }),
    ).toBe(true)

    expect(location.sessionName).toBe(tmuxSession)
    expect(await readFile(output, 'utf8')).toBe(directory)
    const windows = (
      await execFileAsync('tmux', [
        'list-windows',
        '-t',
        tmuxSession,
        '-F',
        '#{window_name}',
      ])
    ).stdout
    expect(windows).toContain('Renamed project')
    const panePid = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        location.windowId,
        '#{pane_pid}',
      ])
    ).stdout.trim()
    const commandLine = (await readFile(`/proc/${panePid}/cmdline`, 'utf8'))
      .replaceAll('\0', ' ')
      .trim()
    expect(commandLine).toContain('--yolo')
    expect(commandLine).toContain('--model gpt-test')
    expect(commandLine).toContain('--effort high')
    expect(commandLine).toContain('--context long_context')
    expect(await controller.restart(sessionId, directory)).toBe(true)
    let cleared = false
    const replacementId = 'fedcba98-7654-3210-fedc-ba9876543210'
    expect(
      await controller.reset(
        sessionId,
        replacementId,
        directory,
        {
          model: 'gpt-test',
          reasoningEffort: 'high',
          contextTier: 'long_context',
        },
        async () => {
          cleared = true
        },
      ),
    ).toBe(true)
    expect(cleared).toBe(true)
  })

  it('delivers a prompt into the owning terminal pane', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const output = path.join(directory, 'received.txt')
    const executable = path.join(directory, 'copilot-fake')
    await writeFile(
      executable,
      `#!/usr/bin/env bash\nIFS= read -r line\nprintf '%s' "$line" >"${output}"\nsleep 60\n`,
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-test-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      executable,
    ])
    const panePid = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        tmuxSession,
        '#{pane_pid}',
      ])
    ).stdout.trim()
    const sessionId = 'abcdef12-abcd-abcd-abcd-abcdef123456'
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(
      copilotHome,
      'session-state',
      sessionId,
    )
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(
      path.join(sessionDirectory, `inuse.${panePid}.lock`),
      `${panePid}\n`,
    )
    vi.stubEnv('COPILOT_HOME', copilotHome)

    const controller = new TmuxTerminalSessionController()
    const delivered = await controller.send(
      sessionId,
      'terminal delivery works',
      false,
    )
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        if ((await readFile(output, 'utf8')) === 'terminal delivery works') {
          break
        }
      } catch {
        // The fake terminal has not consumed the line yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    expect(
      await new TmuxTerminalSessionController().has(sessionId),
    ).toBe(true)
    expect(delivered).toBe(true)
    expect(await readFile(output, 'utf8')).toBe('terminal delivery works')

    await controller.send(sessionId, 'queued text', true)
    const paneTty = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        tmuxSession,
        '#{pane_tty}',
      ])
    ).stdout.trim()
    const terminalState = (
      await execFileAsync('stty', ['-F', paneTty, '-a'])
    ).stdout
    expect(terminalState).toMatch(/(^|[\s;])ixon([\s;]|$)/)
  })

  it('serializes concurrent sends to the same pane', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const output = path.join(directory, 'received.txt')
    const executable = path.join(directory, 'copilot-concurrent-fake')
    await writeFile(
      executable,
      `#!/usr/bin/env bash\nIFS= read -r first\nIFS= read -r second\nprintf '%s\\n%s' "$first" "$second" >"${output}"\nsleep 60\n`,
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-concurrent-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      executable,
    ])
    const panePid = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        tmuxSession,
        '#{pane_pid}',
      ])
    ).stdout.trim()
    const sessionId = 'fedcba98-abcd-abcd-abcd-123456789abc'
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(
      copilotHome,
      'session-state',
      sessionId,
    )
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(
      path.join(sessionDirectory, `inuse.${panePid}.lock`),
      `${panePid}\n`,
    )
    vi.stubEnv('COPILOT_HOME', copilotHome)
    const controller = new TmuxTerminalSessionController()

    await Promise.all([
      controller.send(sessionId, 'MESSAGE-AAAA', false),
      controller.send(sessionId, 'MESSAGE-BBBB', false),
    ])
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        if ((await readFile(output, 'utf8')).includes('MESSAGE-BBBB')) {
          break
        }
      } catch {
        // The fake terminal has not consumed both lines yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    expect(await readFile(output, 'utf8')).toBe(
      'MESSAGE-AAAA\nMESSAGE-BBBB',
    )
  })
})
