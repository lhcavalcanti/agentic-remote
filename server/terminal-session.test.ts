import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isTerminalOverlay,
  isTerminalSessionInUsePrompt,
  parseTerminalPermission,
  parseTerminalUpdateNotice,
  parseTerminalUserInput,
  terminalCommandOutput,
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

// The notice below is the status bar the CLI paints when it is offering an
// update, reproduced from github/copilot-cli#2307.
describe('terminal update notice', () => {
  const composer = [
    '\u257b\u2584\u2584\u2584\u2584',
    '\u2503  Type @ to mention files, # for issues/PRs, / for commands',
    '\u2579\u2580\u2580\u2580\u2580',
  ].join('\n')

  it('reports the version the CLI is offering', () => {
    const pane = [
      ' \u25cf Ready',
      composer,
      ' v1.0.12-1 available \u00b7 run /update \u00b7 shift+tab switch mode',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBe('1.0.12-1')
  })

  it('reports nothing when the status bar offers no update', () => {
    const pane = [
      ' \u25cf Ready',
      composer,
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help \u00b7 tab next tab',
      ' GPT-5.6 Sol \u00b7 High \u00b7 1.1M context (0%)',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBeUndefined()
  })

  // Without the /update requirement any sentence mentioning a version would
  // be mistaken for the CLI offering one.
  it('does not treat transcript text as an update offer', () => {
    const pane = [
      ' \u25cf I checked whether v2.1.0 available upstream fixes the crash.',
      composer,
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBeUndefined()
  })

  // The agent's own transcript can quote the notice. It sits directly above
  // the composer with nothing separating it, so only the status bar the CLI
  // paints below the composer counts as an offer.
  it('does not treat a quoted notice in the transcript as an offer', () => {
    const pane = [
      ' \u25cf The CLI told me: v9.9.9 available \u00b7 run /update',
      ' ~/src/project',
      composer,
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help \u00b7 tab next tab',
      ' GPT-5.6 Sol \u00b7 High \u00b7 1.1M context (0%)',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBeUndefined()
  })

  // tmux pads a capture out to the full pane height, so the status bar is not
  // always the last line of the capture.
  it('finds the notice above trailing blank lines', () => {
    const pane = [
      ' \u25cf Ready',
      composer,
      ' v1.0.83 available \u00b7 run /update \u00b7 shift+tab switch mode',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBe('1.0.83')
  })

  // Text typed into the composer is not the CLI offering an update.
  it('does not treat composer input as an offer', () => {
    const pane = [
      ' \u25cf Ready',
      ' ~/src/project',
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503 v9.9.9 available \u00b7 run /update',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
      ' GPT-5.6 Sol \u00b7 High \u00b7 1.1M context (0%)',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBeUndefined()
  })

  it('reads the notice through a panel border', () => {
    const pane = [
      composer,
      ' \u2503 v1.2.3 available \u00b7 run /update                      \u2503',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBe('1.2.3')
  })
})

// Panes below are trimmed captures from a real Copilot CLI session.
describe('terminal slash command output', () => {
  const composer = [
    '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
    '┃',
    '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
    ' ← open sidebar · / commands · ? help · tab next tab',
    ' GPT-5.6 Sol · High · 1.1M context (0%)',
  ].join('\n')

  it('reports the response a command printed', () => {
    const before = [' ● Tip: /plugin', '   └ Manage plugins', composer].join('\n')
    const after = [
      ' ● Tip: /plugin',
      '   └ Manage plugins',
      ' ● Current working directory: /home/user/project',
      composer,
    ].join('\n')

    expect(terminalCommandOutput(before, after, '/cwd')).toBe(
      'Current working directory: /home/user/project',
    )
  })

  it('ignores a redraw that added nothing', () => {
    const pane = [' ● Tip: /plugin', composer].join('\n')

    expect(terminalCommandOutput(pane, pane, '/cwd')).toBeUndefined()
  })

  it('does not report the echoed command as its own output', () => {
    const before = [' ● Tip: /plugin', composer].join('\n')
    const after = [' ● Tip: /plugin', ' /cwd', composer].join('\n')

    expect(terminalCommandOutput(before, after, '/cwd')).toBeUndefined()
  })

  // The footer carries live counters, so it differs on every frame and a plain
  // diff mistakes it for a response the command printed.
  it('ignores a status footer that changed between frames', () => {
    const before = [
      ' ● Tip: /plugin',
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '┃',
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' Changes    +0 -0',
      ' GPT-5.6 Sol · High · 1.1M context (0%)',
    ].join('\n')
    const after = [
      ' ● Tip: /plugin',
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '┃',
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' Changes    +12 -3',
      ' GPT-5.6 Sol · High · 1.1M context (7%)',
    ].join('\n')

    expect(terminalCommandOutput(before, after, '/config')).toBeUndefined()
  })

  // The banner and tip paint after the pane is first captured, so the first
  // command in a session would otherwise report them as its own output.
  it('ignores the startup banner and tip', () => {
    const before = [' ● Ready', composer].join('\n')
    const after = [
      ' ● Ready',
      '  ╭─╮╭─╮',
      '  ╰─╯╰─╯  Copilot v1.0.82 uses AI.',
      '  █ ▘▝ █  Check for mistakes.',
      '   ▔▔▔▔',
      ' ● Tip: /plugin',
      '   └ Manage plugins and plugin marketplaces',
      ' ● Allowed directories for file access:',
      composer,
    ].join('\n')

    expect(terminalCommandOutput(before, after, '/list-dirs')).toBe(
      'Allowed directories for file access:',
    )
  })

  // Earlier output is redrawn with different padding and panel borders, so
  // comparing the captured text verbatim reports it again as a new response.
  it('ignores earlier output that was redrawn with different borders', () => {
    const before = [
      ' ● Current working directory: /home/user/project',
      composer,
    ].join('\n')
    const after = [
      '   Current working directory: /home/user/project              ┃',
      ' ● Allowed directories for file access:',
      composer,
    ].join('\n')

    expect(terminalCommandOutput(before, after, '/list-dirs')).toBe(
      'Allowed directories for file access:',
    )
  })

  // Running a command twice prints the same text again. Treating prior output
  // as a set would discard the second response and report only the command.
  it('reports a repeated response the command printed again', () => {
    const before = [
      ' \u25cf Current working directory: /home/user/project',
      composer,
    ].join('\n')
    const after = [
      ' \u25cf Current working directory: /home/user/project',
      ' \u25cf Current working directory: /home/user/project',
      composer,
    ].join('\n')

    expect(terminalCommandOutput(before, after, '/cwd')).toBe(
      'Current working directory: /home/user/project',
    )
  })

  it('recognises a full-screen view', () => {
    const settings = [
      ' Settings',
      '  User   Repo   Repo (local)   Problems',
      ' ❯ allowedUrls                          (default)',
      ' 1 of 156',
      ' / search · ↑/↓ navigate · tab switch scope · enter edit · ctrl+r reset ·',
      ' ctrl+e editor · esc close',
    ].join('\n')

    expect(isTerminalOverlay(settings)).toBe(true)
  })

  it('recognises a picker whose footer spells out the keys', () => {
    // The model picker phrases every hint with a connecting word.
    const picker = [
      ' \u276f Auto                       \u2014          \u2014',
      ' \u276f  Search models\u2026',
      ' \u2191/\u2193 to navigate \u00b7 \u2190/\u2192 reasoning effort \u00b7 tab context window \u00b7',
      ' recommended \u00b7 enter to select \u00b7 esc to cancel',
    ].join('\n')

    expect(isTerminalOverlay(picker)).toBe(true)
  })

  it('does not mistake an ordinary transcript for a full-screen view', () => {
    const pane = [
      ' ● Current working directory: /home/user/project',
      composer,
    ].join('\n')

    expect(isTerminalOverlay(pane)).toBe(false)
  })
})
