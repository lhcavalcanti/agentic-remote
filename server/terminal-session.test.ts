import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isTerminalSessionInUsePrompt,
  paneEvidenceCount,
  paneShowsText,
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
  it('detects the Copilot session-in-use startup dialog', () => {
    expect(
      isTerminalSessionInUsePrompt(`
│ Session in use
│ This session appears to be in use by another CLI or application.
│ ❯ 1. Resume anyway
│   2. Go back (Esc)
      `),
    ).toBe(true)
    expect(isTerminalSessionInUsePrompt('❯ Ready for a prompt')).toBe(false)
  })

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
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    await execFileAsync('tmux', [
      'set-environment',
      '-t',
      tmuxSession,
      'COPILOT_HOME',
      copilotHome,
    ])
    const sessionId = randomUUID()

    const controller = new TmuxTerminalSessionController()
    const location = await controller.create(
      sessionId,
      directory,
      'Project workspace',
      true,
      {
        model: 'gpt-boot',
        reasoningEffort: 'medium',
        contextTier: 'default',
        mode: 'plan',
      },
    )
    const initialPanePid = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        location.windowId,
        '#{pane_pid}',
      ])
    ).stdout.trim()
    const initialCommandLine = (
      await readFile(`/proc/${initialPanePid}/cmdline`, 'utf8')
    )
      .replaceAll('\0', ' ')
      .trim()
    expect(initialCommandLine).toContain('--model gpt-boot')
    expect(initialCommandLine).toContain('--effort medium')
    expect(initialCommandLine).toContain('--context default')
    expect(initialCommandLine).toContain('--mode plan')
    expect(await controller.rename(sessionId, 'Renamed project')).toBe(true)
    expect(
      await controller.configure(sessionId, directory, {
        model: 'gpt-test',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
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
    expect(commandLine).toContain('--mode autopilot')
    await expect(
      controller.configure(sessionId, path.join(directory, 'missing'), {
        model: 'gpt-broken',
        reasoningEffort: 'low',
        contextTier: 'default',
        mode: 'interactive',
      }),
    ).rejects.toThrow()
    expect(await controller.has(sessionId)).toBe(true)
    expect(await controller.restart(sessionId, directory)).toBe(true)
    let cleared = false
    const replacementId = randomUUID()
    expect(
      await controller.reset(
        sessionId,
        replacementId,
        directory,
        {
          model: 'gpt-test',
          reasoningEffort: 'high',
          contextTier: 'long_context',
          mode: 'plan',
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

describe('paneShowsText', () => {
  it('recognises a long line the pane wrapped inside a word', () => {
    const message =
      'Please refactor the deployment-orchestration-controller module today'
    // The pane wraps at its own width, which lands in the middle of a word.
    const pane = [
      '> Please refactor the deployment-orchestrat',
      'ion-controller module today',
      '',
    ].join('\n')
    expect(paneShowsText(pane, message)).toBe(true)
  })

  it('recognises a paste Copilot replaced with a placeholder', () => {
    expect(
      paneShowsText('> [Pasted text #1 +40 lines]', 'a very long message'),
    ).toBe(true)
  })

  it('does not accept the same message sent earlier as this one arriving', () => {
    const message = 'Retry the deployment'
    const before = `> ${message}\n  done\n`
    // The reader sent it once already, so the pane held it before this paste.
    expect(
      paneShowsText(before, message, paneEvidenceCount(before, message)),
    ).toBe(false)
    expect(
      paneShowsText(
        `${before}> ${message}`,
        message,
        paneEvidenceCount(before, message),
      ),
    ).toBe(true)
  })

  it('does not accept an earlier large paste as this one arriving', () => {
    const before = '> [Pasted text #1 +40 lines]\n  done\n'
    expect(
      paneShowsText(before, 'a different long message', paneEvidenceCount(before, 'a different long message')),
    ).toBe(false)
  })

  it('does not claim an empty prompt is showing the message', () => {
    expect(paneShowsText('> \n', 'Deploy the treatment engine')).toBe(false)
  })

  it('treats a message of only whitespace as already shown', () => {
    expect(paneShowsText('> \n', '   ')).toBe(true)
  })
})
