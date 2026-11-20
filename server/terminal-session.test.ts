import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { chmod, mkdir, mkdtemp, readFile, readlink, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isTerminalAgentWorking,
  isTerminalVisiblyIdle,
  isTerminalDesktopInstallPrompt,
  isTerminalOverlay,
  isTerminalSessionInUseConflict,
  isTerminalSessionInUsePrompt,
  composerHoldsOtherText,
  composerHoldsText,
  composerHasFocus,
  reportUnrecognisedComposer,
  reportUnrecognisedFooter,
  composerTookPaste,
  paneEvidenceCount,
  paneShowsText,
  parseTerminalFormActiveField,
  parseTerminalFormPrompt,
  parseTerminalPermission,
  terminalChecklistState,
  submitTerminalForm,
  terminalFormCommitKeys,
  parseTerminalUpdateNotice,
  parseTerminalUserInput,
  terminalCommandOutput,
  terminalFormShowsFields,
  terminalInputReady,
  terminalMayBeWaitingForBackgroundShells,
  TmuxTerminalSessionController,
  waitForTerminalStartup,
} from './terminal-session.js'
import {
  createIsolatedTmuxRoot,
  isolatedTmuxEnv,
  eventually,
  stopIsolatedTmuxServer,
  waitForProcessCommand,
} from './tmux-test-helpers.js'
import * as tmuxErrors from './tmux-errors.js'
import { sessionScopeAvailable } from './session-scope.js'
import { fixtureReceiptWriter, readyComposer } from './terminal-test-fixtures.js'

const execFileAsync = promisify(execFile)
const directories: string[] = []
const tmuxSessions: string[] = []
let tmuxRoot = ''

const sessionInUsePane = [
  '╭──────────────────────────────────────────────────────────────────────╮',
  '│ Session in use                                                       │',
  '│ This session was last active just now and appears to be in use by     │',
  '│ another CLI or application. Resuming it here may cause conflicts.     │',
  '│ ❯ 1. Resume anyway                                                   │',
  '│   2. Go back (Esc)                                                    │',
  '│ ↑/↓ to navigate · enter to select · esc to cancel                     │',
  '╰──────────────────────────────────────────────────────────────────────╯',
].join('\n')

const passiveSessionInUsePane = [
  ' /work/project                                      Session: 0 AIC used',
  '────────────────────────────────────────────────────────────',
  '❯',
  '────────────────────────────────────────────────────────────',
  ' IDE auto-connect skipped: session is already in use by another client',
  ' This session may already be in use by another CLI or application.',
].join('\n')

const folderTrustPane = [
  '╭────────────────────────────────────────────────────────────────────────╮',
  '│ Confirm folder trust                                                   │',
  '│ ────────────────────────────────────────────────────────────────────── │',
  '│ ╭────────────────────────────────────────────────────────────────────╮ │',
  '│ │ /work/checkout                                                     │ │',
  '│ ╰────────────────────────────────────────────────────────────────────╯ │',
  '│ Copilot can read files in this folder with your permission.             │',
  '│ Do you trust the files in this folder?                                 │',
  '│ ❯ 1. Yes                                                              │',
  '│   2. Yes, and remember this folder for future sessions                  │',
  '│   3. No (Esc)                                                         │',
  '│ ↑/↓ to navigate · enter to select · esc to cancel                      │',
  '╰────────────────────────────────────────────────────────────────────────╯',
].join('\n')

const desktopInstallPane = [
  '╭───────────────────────────────────────────────╮',
  'THE GITHUB COPILOT APP',
  'Now generally available!',
  'Install it now?',
  '❯ Yes, install      No, thanks',
  '←/→ to choose · Enter to select · Y / N',
  '╰───────────────────────────────────────────────╯',
].join('\n')

function flatReadyComposer(
  text = '',
  working = false,
  cwd = '/work/project',
): string {
  return [
    ` ${cwd}                                      Session: 0 AIC used`,
    '────────────────────────────────────────────────────────────',
    `❯${text ? ` ${text}` : ''}`,
    '────────────────────────────────────────────────────────────',
    working
      ? ' ◉ Working · esc interrupt'
      : ' ← open sidebar · / commands · ? help · tab next tab        ctrl+t show reasoning · GPT-6 Astra · 1M context',
  ].join('\n')
}

// A flat composer with no footer of its own, for footers drawn by the test.
function bareFlatComposer(
  text = '',
  working = false,
  cwd = '/work/project',
): string {
  return [
    ` ${cwd}                                      Session: 0 AIC used`,
    '────────────────────────────────────────────────────────────',
    `❯${text ? ` ${text}` : ''}`,
    '────────────────────────────────────────────────────────────',
    ...(working ? [' ◉ Working · esc interrupt'] : []),
  ].join('\n')
}

// Copilot as a later version might draw its prompt: rules, sides and a marker
// the grammar does not know.
function unfamiliarComposer(text = '', working = false): string {
  return [
    ' /work/project                                      Session: 0 AIC used',
    '════════════════════════════════════════════════════════════',
    `›${text ? ` ${text}` : ''}`,
    '════════════════════════════════════════════════════════════',
    working
      ? ' ◉ Working · esc interrupt'
      : ' ← open sidebar · / commands · ? help · tab next tab        ctrl+t show reasoning · GPT-6 Astra · 1M context',
  ].join('\n')
}

function unfamiliarBoxedComposer(text = '', working = false): string {
  return [
    '╔══════════════════════════════════════════════════════════╗',
    `║ »${text ? ` ${text}` : ''}`.padEnd(59) + '║',
    '╚══════════════════════════════════════════════════════════╝',
    working ? ' ◉ Working · esc interrupt' : ' / commands',
  ].join('\n')
}

const downloadedUpdateFooter = [
  ' v1.0.92 downloaded · next     · ← open    · Autopilot ·    · / commands · tab',
  ' launch or /restart              sidebar     Allow All        next tab',
  ' ctrl+t show reasoning · GPT-5.6 Sol Fast (Internal only) · 1.1M context',
].join('\n')

// Copilot 1.0.93 at 120 columns, captured from a live session.
const wideDownloadedUpdateFooter = [
  ' v1.0.94 downloaded · next launch or /     · ← open sidebar ·Interactive · Allow All· / commands · ? help · tab next   ',
  ' restart                                                                              tab',
  ' ctrl+t show reasoning · GPT-6 Sol · 872K context             ',
].join('\n')

const shellReadyComposer =
  "printf '\\033[2J\\033[H╻▄▄▄▄\\n┃ \\n╹▀▀▀▀\\n\\033[2A\\033[2C'"

async function deliveryFixture(
  working: boolean,
  nextPane?: string,
  repaintPane?: string,
  footer = '',
  initialText = '',
  composerStyle: 'boxed' | 'flat' = 'boxed',
  transcript = '',
  transientRepaintMs = 0,
  injectedText = '',
  transientPane = 'Loading terminal frame',
  composerStyleOrBare: 'bare' | 'unfamiliar' | 'unfamiliar-boxed' | undefined = undefined,
  // Where the CLI leaves the cursor: after the footer it drew, or on its
  // prompt row as Copilot does while the prompt has the keyboard, shown or
  // hidden.
  cursor: 'end' | 'prompt' | 'hidden' = 'end',
) {
  const directory = await mkdtemp(path.join(tmpdir(), 'terminal-delivery-test-'))
  directories.push(directory)
  const executable = path.join(directory, 'copilot-delivery.mjs')
  const output = path.join(directory, 'received.json')
  const sessionId = randomUUID()
  await writeFile(output, '')
  await writeFile(executable, `
${fixtureReceiptWriter(output)}
let input = ''
let pasted = ${JSON.stringify(initialText || undefined)}
const received = { pastes: [], submits: [] }
let replacementStable = true
const cursor = ${JSON.stringify(cursor)}
const draw = (pane) => {
  process.stdout.write('\\x1b[2J\\x1b[H' + pane.replaceAll('\\n', '\\r\\n'))
  if (cursor === 'end') return
  const row = pane.split('\\n').findIndex((line) => /^(?:❯|┃|›|║)/u.test(line))
  if (row >= 0) process.stdout.write('\\x1b[' + (row + 1) + ';3H')
  process.stdout.write(cursor === 'hidden' ? '\\x1b[?25l' : '\\x1b[?25h')
}
const makeComposer = ${(composerStyleOrBare === 'bare' ? bareFlatComposer : composerStyleOrBare === 'unfamiliar' ? unfamiliarComposer : composerStyleOrBare === 'unfamiliar-boxed' ? unfamiliarBoxedComposer : composerStyle === 'flat' ? flatReadyComposer : readyComposer).toString()}
const composer = (text = '', working = false) => ${JSON.stringify(transcript ? `${transcript}\n` : '')} + makeComposer(text, working) + ${JSON.stringify(footer ? `\n${footer}` : '')}
const repaint = ${JSON.stringify(repaintPane)}
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?2004h')
process.on('SIGUSR1', () => {
  pasted = ${JSON.stringify(injectedText || undefined)}
  draw(composer(pasted || '', ${working}))
})
process.on('SIGXCPU', () => draw(composer('', true)))
process.on('SIGUSR2', () => {
  draw(${JSON.stringify(transientPane)})
  setTimeout(() => draw(composer(pasted || '', ${working})), ${transientRepaintMs})
})
process.on('SIGURG', () => {
  replacementStable = false
  draw('Initial replacement repaint')
  setTimeout(() => draw(composer(pasted || '', ${working})), 100)
  setTimeout(() => draw(${JSON.stringify(transientPane)}), 800)
  setTimeout(() => {
    replacementStable = true
    process.stdout.write('\\x1b[3J')
    draw(composer(pasted || '', ${working}))
  }, ${800 + transientRepaintMs})
})
process.stdin.on('data', (data) => {
  if (repaint !== undefined && data.includes(29)) {
    draw(repaint)
    return
  }
  input += data.toString()
  if (input.includes('\\x15')) {
    received.clears = (received.clears || 0) + input.split('\\x15').length - 1
    if (!replacementStable) received.earlyClear = true
    input = input.replaceAll('\\x15', '')
    pasted = undefined
    writeReceipt(received)
    draw(composer('', ${working}))
  }
  const end = input.indexOf('\\x1b[201~')
  if (pasted === undefined && end >= 0) {
    pasted = input.slice(input.indexOf('\\x1b[200~') + 6, end).replace(/\\r\\n?/g, '\\n')
    input = input.slice(end + 6)
    received.pastes.push(pasted)
    writeReceipt(received)
    draw(composer(pasted, ${working}))
  }
  if (pasted !== undefined && /[\\r\\x11]/.test(input)) {
    received.submits.push(input.includes('\\x11') ? 'queue' : 'enter')
    writeReceipt(received)
    input = ''
    pasted = undefined
    draw(${JSON.stringify(nextPane)} ?? composer('', ${working}))
  }
})
draw(composer(${JSON.stringify(initialText)}, ${working}))
`)
  const tmuxSession = `agentic-delivery-${process.pid}`
  tmuxSessions.push(tmuxSession)
  await execFileAsync('tmux', [
    'new-session', '-d', '-s', tmuxSession,
    process.execPath, executable, '--session-id', sessionId,
  ])
  const panePid = (await execFileAsync('tmux', [
    'display-message', '-p', '-t', tmuxSession, '#{pane_pid}',
  ])).stdout.trim()
  await waitForProcessCommand(Number(panePid), [executable])
  const copilotHome = path.join(directory, 'copilot-home')
  const sessionDirectory = path.join(copilotHome, 'session-state', sessionId)
  await mkdir(sessionDirectory, { recursive: true })
  await writeFile(path.join(sessionDirectory, `inuse.${panePid}.lock`), `${panePid}\n`)
  vi.stubEnv('COPILOT_HOME', copilotHome)
  const controller = new TmuxTerminalSessionController()
  const readyMarker = composerStyleOrBare === 'bare'
    ? '❯'
    : composerStyleOrBare === 'unfamiliar' ? '›'
      : composerStyleOrBare === 'unfamiliar-boxed' ? '»'
        : composerStyle === 'flat' ? 'open sidebar' : '╹'
  await eventually(() => controller.capture(sessionId), (pane) => Boolean(pane?.includes(readyMarker)))
  return { controller, sessionId, output, directory, tmuxSession, panePid }
}

async function ownedStartupFixture(initialPane?: string, footer = '') {
  const directory = await mkdtemp(path.join(tmpdir(), 'terminal-startup-consent-'))
  directories.push(directory)
  const executable = path.join(directory, 'copilot-startup.mjs')
  const output = path.join(directory, 'received.json')
  const replacementPath = path.join(directory, 'replacement-pane.txt')
  await writeFile(output, JSON.stringify({ keys: '', pastes: [], submits: 0 }))
  await writeFile(executable, `#!/usr/bin/env node
${fixtureReceiptWriter(output)}
import { readFileSync } from 'node:fs'
const state = { keys: '', pastes: [], submits: 0 }
const save = () => writeReceipt(state)
const makeComposer = ${readyComposer.toString()}
const composer = (text = '') => makeComposer(text) + ${JSON.stringify(footer ? `\n${footer}` : '')}
const draw = (pane) => process.stdout.write('\\x1b[2J\\x1b[H' + pane.replaceAll('\\n', '\\r\\n'))
let confirmed = ${initialPane === undefined}
let desktop = ${initialPane === desktopInstallPane}
let replaced = false
let input = ''
let pasted
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?2004h')
process.on('SIGUSR2', () => {
  const pane = readFileSync(${JSON.stringify(replacementPath)}, 'utf8')
  replaced = true
  desktop = pane.includes('THE GITHUB COPILOT APP') && pane.includes('Install it now?')
  confirmed = pane.includes('╹')
  draw(pane)
})
process.stdin.on('data', (data) => {
  const text = data.toString()
  if (replaced) {
    state.keys += text
    save()
    if (desktop && text.includes('n')) {
      desktop = false
      confirmed = true
      draw(composer())
    } else if (confirmed) {
      draw(composer(state.keys))
    }
    return
  }
  if (!confirmed) {
    state.keys += text
    save()
    if (/[\\r\\n]/.test(text) || (desktop && text.includes('n'))) {
      desktop = false
      confirmed = true
      draw(composer())
    }
    return
  }
  input += text
  const end = input.indexOf('\\x1b[201~')
  if (pasted === undefined && end >= 0) {
    pasted = input.slice(input.indexOf('\\x1b[200~') + 6, end).replace(/\\r\\n?/g, '\\n')
    input = input.slice(end + 6)
    state.pastes.push(pasted)
    save()
    draw(composer(pasted))
  }
  if (pasted !== undefined && /[\\r\\x11]/.test(input)) {
    state.submits += 1
    save()
    pasted = undefined
    input = ''
    draw(composer())
  }
})
draw(${JSON.stringify(initialPane)} ?? composer())
`)
  await chmod(executable, 0o755)
  vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', '')
  vi.stubEnv('COPILOT_BIN', executable)
  vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot-home'))
  // Consent/owner tests need a live isolated server, not a host-wide cold
  // absence verdict that can be indeterminate while unrelated processes exit.
  const tmuxSession = `agentic-startup-${process.pid}`
  tmuxSessions.push(tmuxSession)
  await execFileAsync('tmux', [
    'new-session', '-d', '-s', tmuxSession, 'sleep', '60',
  ], { env: isolatedTmuxEnv(tmuxRoot) })
  const controller = new TmuxTerminalSessionController()
  const sessionId = randomUUID()
  await controller.create(sessionId, directory, 'Owned startup', false)
  return { controller, sessionId, output, replacementPath }
}

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

describe('tmux test isolation', () => {
  it('never lets a tmux command fall back to the caller\'s own server', () => {
    // Running the suite from inside tmux used to point every command at the
    // developer's own server, because a client reads its socket out of `TMUX`
    // before it looks at the temporary directory. The teardown kills whatever
    // it reaches, so that was every session they had open.
    const env = isolatedTmuxEnv('/tmp/example-root')
    expect(env.TMUX_TMPDIR).toBe('/tmp/example-root')
    expect(env.TMUX).toBe('')
  })

  it('creates owned startup fixtures without depending on a host-wide absence verdict', async () => {
    const absence = vi.spyOn(tmuxErrors, 'noTmuxServer').mockResolvedValue(false)
    try {
      const { controller, sessionId } = await ownedStartupFixture()
      expect(await controller.has(sessionId)).toBe(true)
      expect(absence).not.toHaveBeenCalled()
    } finally {
      absence.mockRestore()
    }
  }, 15_000)
})

describe('TmuxTerminalSessionController', () => {
  it("runs a session's Copilot as its pane's own process, in a scope an out-of-memory kill does not stop", async ({ skip }) => {
    skip(!(await sessionScopeAvailable()), 'This host cannot start a user systemd scope')
    const { controller, sessionId } = await ownedStartupFixture()
    const owner = await (controller as unknown as {
      owner(id: string, target?: string, fresh?: boolean): Promise<{
        pid: number
        target: string
        rootPid: number
      } | undefined>
    }).owner(sessionId, undefined, true)
    const panePid = Number.parseInt((await execFileAsync('tmux', [
      'display-message', '-p', '-t', owner?.target ?? '', '#{pane_pid}',
    ])).stdout.trim(), 10)

    // systemd-run becomes Copilot rather than starting it, so discovery and
    // tmux both still find the session as the pane's own process.
    expect(owner).toMatchObject({ pid: panePid, rootPid: panePid })
    const cgroup = (await readFile(`/proc/${panePid}/cgroup`, 'utf8')).trim()
    const unit = path.basename(cgroup.slice(cgroup.lastIndexOf(':') + 1))
    expect(unit).toMatch(/^run-.+\.scope$/u)
    expect((await execFileAsync('systemctl', [
      '--user', 'show', '--property=OOMPolicy', '--value', unit,
    ])).stdout.trim()).toBe('continue')
  }, 15_000)

  it('keeps startup ownership when a wrapper is replaced in the same pane', async () => {
    const overlay = [
      'Settings',
      '❯ allowedUrls (default)',
      '/ search · ↑/↓ navigate · tab switch scope · enter edit',
      'esc close',
    ].join('\n')
    const { controller, sessionId, replacementPath } =
      await ownedStartupFixture(overlay)
    const inspectable = controller as unknown as {
      owner(id: string, target?: string, fresh?: boolean): Promise<{
        pid: number
        target: string
        rootPid: number
      } | undefined>
      automaticStartupSessions: Map<string, {
        pid: number
        target: string
        rootPid: number
      }>
    }
    const owner = await inspectable.owner(sessionId, undefined, true)
    const automatic = inspectable.automaticStartupSessions.get(sessionId)
    expect(owner).toBeDefined()
    expect(automatic).toBeDefined()
    inspectable.automaticStartupSessions.set(sessionId, {
      ...automatic!,
      // The pane root is stable while Copilot replaces its wrapper process.
      pid: owner!.pid + 100_000,
      rootPid: owner!.rootPid,
    })
    await writeFile(replacementPath, readyComposer())
    process.kill(owner!.pid, 'SIGUSR2')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => Boolean(pane?.includes('╹')),
    )

    const originalOwner = inspectable.owner.bind(controller)
    let cachedMiss = true
    const spy = vi.spyOn(inspectable, 'owner').mockImplementation(
      async (id, target, fresh) => {
        if (cachedMiss && target === automatic!.target && !fresh) {
          cachedMiss = false
          return undefined
        }
        return originalOwner(id, target, fresh)
      },
    )
    try {
      await expect(controller.resolveStartupPrompt(sessionId)).resolves.toBe(true)
      expect(await controller.inputReady(sessionId)).toBe(true)
    } finally {
      spy.mockRestore()
    }
  }, 15_000)

  it('does not interrupt an idle composer when stale status offers Stop', async () => {
    const { controller, sessionId, output } = await ownedStartupFixture()

    await expect(controller.cancel(sessionId)).resolves.toBe(true)

    expect(JSON.parse(await readFile(output, 'utf8')).keys).toBe('')
    expect(await controller.has(sessionId)).toBe(true)
  }, 15_000)

  it('remembers an owner discovered by has so a later exit is confirmable', async () => {
    const { controller, sessionId } = await ownedStartupFixture()
    const inspectable = controller as unknown as {
      owner(id: string, target?: string, fresh?: boolean): Promise<{
        pid: number
        target: string
        rootPid: number
      } | undefined>
      inputReadySessions: Map<string, unknown>
      automaticStartupSessions: Map<string, unknown>
    }
    expect(await controller.has(sessionId)).toBe(true)
    const owner = await inspectable.owner(sessionId, undefined, true)
    expect(owner).toBeDefined()
    inspectable.inputReadySessions.delete(sessionId)
    inspectable.automaticStartupSessions.delete(sessionId)
    process.kill(owner!.pid, 'SIGTERM')

    await expect(eventually(
      () => controller.ownerStopped(sessionId),
      (stopped) => stopped,
    )).resolves.toBe(true)
  }, 15_000)

  it('does not confirm loss when the session reopened in another pane', async () => {
    const controller = new TmuxTerminalSessionController()
    const inspectable = controller as unknown as {
      owner(id: string, target?: string, fresh?: boolean): Promise<{
        pid: number
        target: string
        rootPid: number
      } | undefined>
      knownOwners: Map<string, {
        pid: number
        target: string
        rootPid: number
      }>
    }
    inspectable.knownOwners.set('moved', {
      pid: 10,
      target: '%old',
      rootPid: 10,
    })
    vi.spyOn(inspectable, 'owner')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        pid: 20,
        target: '%new',
        rootPid: 20,
      })

    await expect(controller.ownerStopped('moved')).resolves.toBe(false)
  })

  it('dismisses an overlay instead of terminating its idle CLI', async () => {
    const overlay = [
      'Working - esc interrupt',
      'Settings',
      '❯ allowedUrls (default)',
      '/ search · ↑/↓ navigate · tab switch scope · enter edit',
      'esc close',
    ].join('\n')
    const { controller, sessionId, output } = await ownedStartupFixture(overlay)

    await expect(controller.cancel(sessionId)).resolves.toBe(true)

    const dismissed = await eventually(
      () => readFile(output, 'utf8'),
      (receipt) => JSON.parse(receipt).keys === '\u001b',
    )
    expect(JSON.parse(dismissed).keys).toBe('\u001b')
    expect(await controller.has(sessionId)).toBe(true)
  }, 15_000)

  // A later Copilot may word its interrupt key differently, or drop it. Not
  // boxed, so the fixture leaves it on screen after a key arrives.
  const rewordedWorkingPane = [
    ' /work/project                                      Session: 0 AIC used',
    '────────────────────────────────────────────────────────────',
    '❯',
    '────────────────────────────────────────────────────────────',
    ' ◉ Working · 52.1 KiB · esc to stop',
  ].join('\n')

  async function showPane(
    controller: TmuxTerminalSessionController,
    sessionId: string,
    replacementPath: string,
    pane: string,
  ): Promise<void> {
    const inspectable = controller as unknown as {
      owner(id: string, target?: string, fresh?: boolean): Promise<{ pid: number } | undefined>
    }
    const owner = await inspectable.owner(sessionId, undefined, true)
    expect(owner).toBeDefined()
    await writeFile(replacementPath, pane)
    process.kill(owner!.pid, 'SIGUSR2')
    const last = pane.split('\n').at(-1)!.trim()
    await eventually(() => controller.capture(sessionId), (current) => Boolean(current?.includes(last)))
  }

  it('interrupts from the event log when the footer no longer offers the key', async () => {
    const { controller, sessionId, output, replacementPath } = await ownedStartupFixture()
    await showPane(controller, sessionId, replacementPath, rewordedWorkingPane)
    const turnOpen = vi.fn(async () => true)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      await expect(controller.cancel(sessionId, { turnOpen })).resolves.toBe(true)
      const interrupted = await eventually(
        () => readFile(output, 'utf8'),
        (receipt) => JSON.parse(receipt).keys === '\u0003',
      )
      expect(JSON.parse(interrupted).keys).toBe('\u0003')
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('event log had a turn open'))
      // A second press straight after could reach a prompt that has just
      // gone idle, where Ctrl+C is the first half of quitting.
      await expect(controller.cancel(sessionId, { turnOpen })).resolves.toBe(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      expect(JSON.parse(await readFile(output, 'utf8')).keys).toBe('\u0003')
      expect(turnOpen).toHaveBeenCalledTimes(1)
      expect(await controller.has(sessionId)).toBe(true)
    } finally {
      warn.mockRestore()
    }
  }, 15_000)

  // Ctrl+C at a prompt that is not working clears it, or starts quitting.
  it('presses nothing for a question that offers Ctrl+C while no turn is open', async () => {
    const { controller, sessionId, output, replacementPath } = await ownedStartupFixture()
    await showPane(controller, sessionId, replacementPath, [
      ' /work/project                                      Session: 0 AIC used',
      '────────────────────────────────────────────────────────────',
      '❯',
      '────────────────────────────────────────────────────────────',
      ' Autopilot · Allow All · ◉ Delete the folder? ctrl+c interrupt   Claude Opus 5.5 · Max · (58%)',
    ].join('\n'))
    const turnOpen = vi.fn(async () => false)

    await expect(controller.cancel(sessionId, { turnOpen })).resolves.toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(JSON.parse(await readFile(output, 'utf8')).keys).toBe('')
    expect(turnOpen).toHaveBeenCalledTimes(1)
  }, 15_000)

  async function probeFixture(script: string) {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-probe-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-probe.mjs')
    const receipt = path.join(directory, 'receipt.json')
    const workspace = path.join(directory, 'workspace')
    await mkdir(workspace)
    await writeFile(executable, `#!/usr/bin/env node
${fixtureReceiptWriter(receipt)}
const draw = (pane) => process.stdout.write('\\x1b[2J\\x1b[H' + pane.replaceAll('\\n', '\\r\\n'))
const state = { columns: process.stdout.columns, cwd: process.cwd(), keys: '' }
writeReceipt(state)
process.stdin.setRawMode(true)
${script}
`)
    await chmod(executable, 0o755)
    vi.stubEnv('COPILOT_BIN', executable)
    vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot-home'))
    await execFileAsync('tmux', ['new-session', '-d', '-s', `agentic-probe-${process.pid}`, 'sleep', '60'])
    tmuxSessions.push(`agentic-probe-${process.pid}`)
    return { controller: new TmuxTerminalSessionController(), receipt, workspace }
  }
  const probeSessions = async () =>
    (await execFileAsync('tmux', ['list-sessions', '-F', '#{session_name}'])).stdout
      .split('\n').filter((name) => name.startsWith('agentic-remote-canary-'))

  it('probes startup at 80 columns through folder trust, then removes its tmux session', async () => {
    const { controller, receipt, workspace } = await probeFixture(`
const makeComposer = ${readyComposer.toString()}
draw(${JSON.stringify(folderTrustPane)})
process.stdin.on('data', (data) => {
  state.keys += data.toString()
  writeReceipt(state)
  // Like Copilot, acts on the answer a moment later, and writes its session
  // files as it shuts down.
  if (data.includes(13)) setTimeout(() => draw(makeComposer()), 500)
})
process.stdin.on('error', () => undefined)
process.stdout.on('error', () => undefined)
// Work of its own keeps it running after its terminal closes.
setInterval(() => undefined, 1000)
process.on('SIGHUP', () => {
  setTimeout(() => {
    state.shutDown = true
    writeReceipt(state)
    process.exit(0)
  }, 1000)
})
`)
    const sessionId = randomUUID()

    await expect(controller.probeStartup(sessionId, workspace)).resolves.toBeUndefined()

    // Returned only once Copilot had finished shutting down.
    const seen = JSON.parse(await readFile(receipt, 'utf8'))
    expect(seen).toMatchObject({ columns: 80, cwd: workspace, shutDown: true })
    expect(seen.keys.endsWith('\r')).toBe(true)
    expect(await probeSessions()).toEqual([])
    expect(await controller.has(sessionId)).toBe(false)
  }, 30_000)

  it('fails a probe whose Copilot outlives its tmux session, even after reaching the prompt', async () => {
    const { controller, receipt, workspace } = await probeFixture(`
const makeComposer = ${readyComposer.toString()}
draw(${JSON.stringify(folderTrustPane)})
state.pid = process.pid
writeReceipt(state)
process.stdin.on('data', (data) => {
  if (data.includes(13)) setTimeout(() => draw(makeComposer()), 100)
})
process.stdin.on('error', () => undefined)
process.stdout.on('error', () => undefined)
setInterval(() => undefined, 1000)
process.on('SIGHUP', () => undefined)
`)
    let pid: number | undefined
    try {
      await expect(controller.probeStartup(randomUUID(), workspace)).rejects.toThrow(
        /^The probe's Copilot was still running 10 s after its tmux session ended$/u,
      )
      pid = JSON.parse(await readFile(receipt, 'utf8')).pid
      expect(() => process.kill(pid!, 0)).not.toThrow()
    } finally {
      pid ??= JSON.parse(await readFile(receipt, 'utf8')).pid
      if (pid) process.kill(pid, 'SIGKILL')
    }
    expect(await probeSessions()).toEqual([])
  }, 45_000)

  it('does not start a probe once the canary is stopping', async () => {
    const { controller, receipt, workspace } = await probeFixture('')
    const stopping = new AbortController()
    stopping.abort()

    await expect(controller.probeStartup(randomUUID(), workspace, stopping.signal))
      .rejects.toThrow('The probe was cancelled before it started')

    await expect(readFile(receipt, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await probeSessions()).toEqual([])
  })

  it('ends a probe that launched while the canary was stopping', async () => {
    const { controller, receipt, workspace } = await probeFixture(`
process.stdin.on('error', () => undefined)
setInterval(() => undefined, 1000)
process.on('SIGHUP', () => setTimeout(() => {
  state.shutDown = true
  writeReceipt(state)
  process.exit(0)
}, 300))
`)
    const stopping = new AbortController()
    const probing = controller.probeStartup(randomUUID(), workspace, stopping.signal)
    stopping.abort()

    await expect(probing).rejects.toThrow(/^The probe was cancelled as it started/u)

    expect(await probeSessions()).toEqual([])
    const seen = await readFile(receipt, 'utf8').catch(() => undefined)
    if (seen) expect(JSON.parse(seen).shutDown).toBe(true)
  }, 30_000)

  it('ends probes a stopped service left running, and only those', async () => {
    const { controller, receipt } = await probeFixture(`
process.stdin.on('error', () => undefined)
setInterval(() => undefined, 1000)
process.on('SIGHUP', () => setTimeout(() => {
  state.shutDown = true
  writeReceipt(state)
  process.exit(0)
}, 500))
`)
    const leftover = randomUUID()
    await execFileAsync('tmux', [
      'new-session', '-d', '-s', `agentic-remote-canary-${leftover.slice(0, 8)}`,
      process.env.COPILOT_BIN!, '--yolo', '--session-id', leftover,
    ])
    await eventually(() => readFile(receipt, 'utf8').catch(() => ''), Boolean)

    await expect(controller.endLeftoverProbes()).resolves.toEqual([leftover])

    expect(JSON.parse(await readFile(receipt, 'utf8')).shutDown).toBe(true)
    expect(await probeSessions()).toEqual([])
    const remaining = (await execFileAsync('tmux', ['list-sessions', '-F', '#{session_name}'])).stdout
    expect(remaining).toContain(`agentic-probe-${process.pid}`)
    await expect(controller.endLeftoverProbes()).resolves.toEqual([])
  }, 30_000)

  it('says what the terminal showed when a probe cannot reach the prompt', async () => {
    const { controller, workspace } = await probeFixture(`
draw(['Settings', '❯ allowedUrls (default)', '/ search · ↑/↓ navigate · tab switch scope · enter edit', 'esc close'].join('\\n'))
process.stdin.on('data', () => undefined)
`)

    await expect(controller.probeStartup(randomUUID(), workspace)).rejects.toThrow(
      /^Copilot is showing a prompt the app does not recognise\n[\s\S]*allowedUrls/u,
    )
    expect(await probeSessions()).toEqual([])
  }, 30_000)

  it('does not repeat an advertised interrupt within five seconds', async () => {
    const { controller, sessionId, output, replacementPath } = await ownedStartupFixture()
    // The footer can still offer the key for a moment after the first Ctrl+C.
    await showPane(controller, sessionId, replacementPath, rewordedWorkingPane.replace('52.1 KiB · esc to stop', 'esc interrupt'))

    await expect(controller.cancel(sessionId)).resolves.toBe(true)
    await eventually(
      () => readFile(output, 'utf8'),
      (receipt) => JSON.parse(receipt).keys === '\u0003',
    )
    await expect(controller.cancel(sessionId)).resolves.toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(JSON.parse(await readFile(output, 'utf8')).keys).toBe('\u0003')
  }, 15_000)

  it.each([
    ['the log has no turn open', rewordedWorkingPane, false],
    ['the pane shows an idle prompt it knows', readyComposer(), true],
    ['the pane shows a draft in an idle prompt it knows', readyComposer('Keep this native draft'), true],
  ])('does not interrupt from the event log when %s', async (_name, pane, open) => {
    const { controller, sessionId, output, replacementPath } = await ownedStartupFixture()
    await showPane(controller, sessionId, replacementPath, pane)
    const turnOpen = vi.fn(async () => open)

    await expect(controller.cancel(sessionId, { turnOpen })).resolves.toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(JSON.parse(await readFile(output, 'utf8')).keys).toBe('')
    expect(turnOpen).toHaveBeenCalledTimes(open ? 0 : 1)
  }, 15_000)

  it.each([
    ['an empty composer', readyComposer()],
    ['an existing draft', readyComposer('Keep this native draft')],
    ['a different permission dialog', folderTrustPane],
  ])('does not decline a desktop prompt replaced by %s during owner validation', async (_name, replacement) => {
    const { controller, sessionId, output, replacementPath } = await ownedStartupFixture(sessionInUsePane)
    const inspectable = controller as unknown as {
      owner(id: string, target?: string, fresh?: boolean): Promise<{ pid: number; target: string } | undefined>
    }
    const owner = await inspectable.owner(sessionId, undefined, true)
    expect(owner).toBeDefined()
    await writeFile(replacementPath, desktopInstallPane)
    process.kill(owner!.pid, 'SIGUSR2')
    await eventually(() => controller.capture(sessionId), (pane) => Boolean(pane && isTerminalDesktopInstallPrompt(pane)))
    const originalOwner = inspectable.owner.bind(controller)
    let initialOwnerRead = false
    let replaced = false
    const spy = vi.spyOn(inspectable, 'owner').mockImplementation(async (id, target, fresh) => {
      const current = await originalOwner(id, target, fresh)
      if (!fresh && current) initialOwnerRead = true
      if (fresh && current && initialOwnerRead && !replaced) {
        replaced = true
        await writeFile(replacementPath, replacement)
        process.kill(current.pid, 'SIGUSR2')
        await eventually(
          async () => (await execFileAsync('tmux', ['capture-pane', '-J', '-p', '-t', current.target])).stdout,
          (pane) => !isTerminalDesktopInstallPrompt(pane),
        )
      }
      return current
    })
    try {
      await controller.resolveStartupPrompt(sessionId)
      expect(replaced).toBe(true)
      expect(JSON.parse(await readFile(output, 'utf8'))).toEqual({ keys: '', pastes: [], submits: 0 })
      const pane = await controller.capture(sessionId)
      if (replacement.includes('Keep this native draft')) expect(pane).toContain('Keep this native draft')
      if (replacement === folderTrustPane) expect(pane).toContain('Confirm folder trust')
    } finally {
      spy.mockRestore()
    }
  }, 15000)

  // A hub that restarts forgets which terminals it last saw ready, and the
  // first message to each then proves the prompt stable again. Only a Copilot
  // that just started can still open a startup dialog over an empty prompt.
  it('sends at once to a Copilot that has been running a while', async () => {
    const { controller, sessionId, output } = await deliveryFixture(false)
    Reflect.set(controller, 'settledOwnerAgeMs', 0)
    const started = performance.now()
    expect(await controller.send(sessionId, 'First after a hub restart', false)).toBe(true)
    expect(performance.now() - started).toBeLessThan(1_500)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length))
    expect(JSON.parse(received)).toEqual({ pastes: ['First after a hub restart'], submits: ['enter'] })
  }, 15_000)

  // Steering a long-running turn after a hub restart used to wait out the whole
  // startup timeout under the send lock, then fail as a server error.
  it('releases a steer promptly when a settled working Copilot shows no composer', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      true, undefined, undefined, '', '', 'flat',
      undefined, undefined, undefined, undefined, 'unfamiliar', 'end',
    )
    Reflect.set(controller, 'settledOwnerAgeMs', 0)
    for (const attempt of ['First steer', 'Second steer']) {
      const started = performance.now()
      await expect(controller.send(sessionId, attempt, false, { allowDuringAgentExecution: true }))
        .rejects.toMatchObject({
          statusCode: 409,
          uncertainDelivery: false,
          reasonCode: 'terminal-not-ready.steer',
        })
      expect(performance.now() - started).toBeLessThan(1_500)
    }
    expect(await readFile(output, 'utf8')).toBe('')
  }, 30_000)

  it('classifies a cold idle-only composer timeout as a retryable queue wait', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, '', '', 'flat',
      undefined, undefined, undefined, undefined, 'unfamiliar', 'end',
    )
    Reflect.set(controller, 'settledOwnerAgeMs', 0)
    Reflect.set(controller, 'startupTimeoutMs', 200)

    await expect(controller.sendWhenIdle(sessionId, 'Queue after restart'))
      .rejects.toMatchObject({
        statusCode: 409,
        uncertainDelivery: false,
        reasonCode: 'terminal-not-ready.queue',
      })
    expect(await readFile(output, 'utf8')).toBe('')
  }, 15_000)

  it.each([
    ['a plain send', 'Sent once the prompt is back', false, undefined, 'enter'],
    ['a natively queued command', '/compact', true, { allowDuringAgentExecution: true }, 'queue'],
  ] as const)('still waits for a late composer for %s', async (_case, text, enqueue, options, submit) => {
    const { controller, sessionId, output, panePid } = await deliveryFixture(
      false, undefined, undefined, '', '', 'boxed',
      '', 7_000,
    )
    Reflect.set(controller, 'settledOwnerAgeMs', 0)
    process.kill(Number(panePid), 'SIGUSR2')
    await eventually(() => controller.capture(sessionId), (pane) => Boolean(pane?.includes('Loading terminal frame')))
    const started = performance.now()
    expect(await controller.send(sessionId, text, enqueue, options)).toBe(true)
    expect(performance.now() - started).toBeGreaterThanOrEqual(5_500)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length))
    expect(JSON.parse(received)).toEqual({ pastes: [text], submits: [submit] })
  }, 30_000)

  it('still lets a Copilot that just started settle before its first message', async () => {
    const { controller, sessionId } = await deliveryFixture(false)
    Reflect.set(controller, 'settledOwnerAgeMs', 600_000)
    const started = performance.now()
    expect(await controller.send(sessionId, 'First after launch', false)).toBe(true)
    expect(performance.now() - started).toBeGreaterThanOrEqual(2_900)
  }, 15_000)

  it('declines an unchanged live desktop prompt exactly once after owner validation', async () => {
    const { controller, sessionId, output } = await ownedStartupFixture(desktopInstallPane)
    expect(await controller.inputReady(sessionId)).toBe(true)
    expect(JSON.parse(await readFile(output, 'utf8'))).toEqual({ keys: 'n', pastes: [], submits: 0 })
  }, 15000)

  it.each([
    ['Fixture Model · High · 1.1M context (0%)', false, false],
    ['Fixture preview · 128k context (37%)', false, false],
    ['Fixture Model · Medium · 262,144 context (100%)', false, false],
    ['Fixture Model · High · 1.1M context (7.5%)', true, true],
    ['ctrl+t show reasoning · GPT-5.6 Sol Fast (Internal only) · 1.1M context', false, false],
    ['GPT-5.6 Sol Fast (Internal only)', false, false],
  ] as const)('admits a complete model/context footer: %s (working=%s, queue=%s)', async (footer, working, enqueue) => {
    const { controller, sessionId, output } = await deliveryFixture(working, undefined, undefined, footer)
    expect(await controller.capture(sessionId)).toContain(footer)
    expect(await controller.inputReady(sessionId)).toBe(!working)
    await expect(controller.send(sessionId, 'One footer-aware message', enqueue)).resolves.toBe(true)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['One footer-aware message'], submits: [enqueue ? 'queue' : 'enter'],
    })
  }, 15_000)

  it('replaces a stale draft from a cache-cold Copilot 1.0.89 workspace composer', async () => {
    const footer =
      ' @ files · # issues                 ctrl+t show reasoning · GPT-5.6 Sol'
    const { controller, sessionId, output } = await deliveryFixture(
      false,
      undefined,
      undefined,
      footer,
      'stale terminal text',
    )

    await expect(controller.send(
      sessionId,
      'Replacement from the app',
      false,
      { replaceExistingInput: true },
    )).resolves.toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      clears: 1,
      pastes: ['Replacement from the app'],
      submits: ['enter'],
    })
  }, 15_000)

  it.each([
    'GPT-5.6 Sol',
    'GPT-5.6 Sol Fast (Internal only)',
  ])('recognizes the wrapped reasoning/model footer in Copilot 1.0.90: %s', async (model) => {
    const footer = [
      ' ← open sidebar · Interactive · Allow All · / commands · ? help · tab next tab',
      ` ctrl+t show reasoning · ${model}`,
    ].join('\n')
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(true)
    expect(await controller.send(sessionId, 'Wrapped footer proof', false)).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Wrapped footer proof'], submits: ['enter'],
    })
  }, 15_000)

  // Copilot 1.0.96 drops hint cells to keep the model on the same row, and
  // cuts the last hint and the model mid-word at the narrowest widths.
  // Copilot 1.0.98 ends the footer row with the model, its reasoning effort and
  // how much context is used, and cuts the last cell short when narrow.
  it.each([
    ' ← open sidebar · Interactive · Allow All · / commands GPT-5 mini · Low · (19%)',
    ' Interactive · Allow All · / commands    GPT-5.6 Sol · High · 922K context (0%)',
    ' Interactive · Manual Approval · / commands            GPT-5 mini · Low · (17%)',
    ' Autopilot · Allow All · / commands      GPT-5.6 Sol Fast (Internal only) · Ext',
    ' Autopilot · Allow All · / commands      Claude Opus 5.5 · Extra High · 1M cont',
  ])('recognizes the one-row idle footer of Copilot 1.0.98: %s', async (footer) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const { controller, sessionId, output } = await deliveryFixture(
        false, undefined, undefined, footer, '', 'flat',
        undefined, undefined, undefined, undefined, 'bare',
      )
      expect(await controller.inputReady(sessionId)).toBe(true)
      expect(await controller.send(sessionId, 'Idle 1.0.98 footer proof', false)).toBe(true)
      const received = await eventually(
        () => readFile(output, 'utf8'),
        (value) => Boolean(value && JSON.parse(value).submits.length),
      )
      expect(JSON.parse(received)).toEqual({
        pastes: ['Idle 1.0.98 footer proof'], submits: ['enter'],
      })
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  }, 15_000)

  // While a turn runs it says so on the same row, the cursor away from the
  // prompt, which still takes a message.
  it.each([
    ' ● Working esc edit prompt                             GPT-5 mini · Low · (19%)',
    ' ○ Working · 138 B esc interrupt                       GPT-5 mini · Low · (19%)',
    ' ● Working esc interrupt · ctrl+q enqueue              GPT-5 mini · Low · (20%)',
    ' ◎ Writing evidence and phased plan -  esc interrupt GPT-6.1 Sol · High · (51%)',
    ' ◎ Working - autopilot · 4 esc interrupt Claude Opus 5.5 · Extra High · 1M cont',
    ' ◉ Building conversation U esc interrupt GPT-5.6 Sol Fast (Internal only) · Hig',
  ])('takes a message while Copilot 1.0.98 works: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
      undefined, undefined, undefined, undefined, 'bare',
    )
    expect(isTerminalAgentWorking((await controller.capture(sessionId))!)).toBe(true)
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await controller.send(
      sessionId, 'Steer during 1.0.98 work', false, { allowDuringAgentExecution: true },
    )).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Steer during 1.0.98 work'], submits: ['enter'],
    })
  }, 15_000)

  // Once a turn hands its work to background agents and ends, Copilot 1.0.101
  // keeps its prompt open and offers to stop them. A message sent then is a
  // new prompt Copilot answers at once, not a steer into a turn.
  it.each([
    ' ● Waiting for background agents · 273 B esc esc stop agents                                  GPT-6.1 Sol · High · (9%)',
    ' ◉ Waiting for background agents · 1.2 KB esc esc stop agents GPT-5 mini · Low · (19%)',
    ' ○ Waiting for background agents esc esc stop agents   Claude Opus 5.5 · Extra High · 1M cont',
    ' ◎ Waiting for background agents · 4 B esc esc stop agents',
  ])('takes a message while Copilot waits for background agents: %s', async (footer) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const { controller, sessionId, output } = await deliveryFixture(
        false, undefined, undefined, footer, '', 'flat',
        undefined, undefined, undefined, undefined, 'bare',
      )
      const pane = (await controller.capture(sessionId))!
      expect(isTerminalAgentWorking(pane)).toBe(false)
      expect(isTerminalVisiblyIdle(pane)).toBe(true)
      expect(await controller.inputReady(sessionId)).toBe(true)
      expect(await controller.send(sessionId, 'Background agents footer proof', false)).toBe(true)
      const received = await eventually(
        () => readFile(output, 'utf8'),
        (value) => Boolean(value && JSON.parse(value).submits.length),
      )
      expect(JSON.parse(received)).toEqual({
        pastes: ['Background agents footer proof'], submits: ['enter'],
      })
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  }, 15_000)

  it.each([
    ' ● Waiting for background agents · 273 B esc esc stop agents · enter to approve     GPT-6.1 Sol',
    ' ● Waiting for background agents · 273 B esc esc stop agents   Delete the folder? · y/n',
    ' ● Stop all background agents? esc esc stop agents            GPT-6.1 Sol · High · (9%)',
    ' ● Waiting for background agents · 273 B esc esc stop agents   GPT- · High · (9%)',
    ' ● Waiting for background agents · 273 B esc stop agents       GPT-6.1 Sol · High · (9%)',
  ])('still refuses a row that only resembles the background agents footer: %s', async (footer) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const rule = '─'.repeat(60)
      const resembling = [
        ' /work/project                                      Session: 0 AIC used',
        rule, '❯', rule, footer,
      ].join('\n')
      const { controller, sessionId, output } = await deliveryFixture(
        false, resembling, undefined, '', '', 'flat',
      )
      expect(await controller.send(sessionId, 'Known footer first', false)).toBe(true)
      await eventually(() => controller.capture(sessionId), (pane) => Boolean(pane?.includes(footer.trim())))
      expect(isTerminalVisiblyIdle((await controller.capture(sessionId))!)).toBe(false)
      await expect(controller.send(sessionId, 'Must not be typed', false))
        .rejects.toMatchObject({ statusCode: 409 })
      expect(JSON.parse(await readFile(output, 'utf8')).pastes).toEqual(['Known footer first'])
    } finally {
      warn.mockRestore()
    }
  }, 15_000)

  it.each([
    ' ● Working · 230 B esc interrupt                       Delete the folder? · y/n',
    ' ● Working esc edit prompt · enter to approve          GPT-5 mini · Low · (19%)',
    ' Interactive · Allow All · / commands   GPT-5 mini · Low · (19%) · enter to approve',
    ' ● Delete the folder? esc edit prompt                  GPT-5 mini · Low · (19%)',
    ' Interactive · Allow All · / commands   GPT- · Low · (19%)',
    ' ○ Working · 138 B esc interrupt        GPT- · Low · (19%)',
    ' Interactive · Allow All · / commands   GPT-5 mini · (19%) · (20%)',
  ])('still refuses a row that only resembles the 1.0.98 footer: %s', async (footer) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const rule = '─'.repeat(60)
      const resembling = [
        ' /work/project                                      Session: 0 AIC used',
        rule, '❯', rule, footer,
      ].join('\n')
      // One message under a footer the grammar knows, then the look-alike.
      const { controller, sessionId, output } = await deliveryFixture(
        false, resembling, undefined, '', '', 'flat',
      )
      expect(await controller.send(sessionId, 'Known footer first', false)).toBe(true)
      await eventually(() => controller.capture(sessionId), (pane) => Boolean(pane?.includes(footer.trim())))
      await expect(controller.send(
        sessionId, 'Must not be typed', false, { allowDuringAgentExecution: true },
      )).rejects.toMatchObject({ statusCode: 409 })
      expect(JSON.parse(await readFile(output, 'utf8')).pastes).toEqual(['Known footer first'])
    } finally {
      warn.mockRestore()
    }
  }, 15_000)

  // Copilot 1.0.106 names Ctrl+C as its interrupt key. To fit the row it
  // shrinks the status to its spinner or to nothing, wraps the key's word and
  // the queue key away or cuts them mid-word, drops the hints at the narrowest
  // widths, and ends a cut model hint with an ellipsis. These rows are as
  // Copilot 1.0.107 drew them at widths from 60 to 160 columns.
  describe('the Copilot 1.0.106 busy row', () => {
    const rule = '─'.repeat(60)
    const pane = (footer: string) => [
      ' /work/project                                      Session: 0 AIC used',
      rule, '❯', rule, footer,
    ].join('\n')

    it.each([
      ' ◉ Working · 83 B ctrl+c interrupt',
      ' ◉ Running bash · 26s · 8 ctrl+c interrupt · ctrl+q enqueue',
      ' ● Running bash · 27s · 83 B ctrl+c interrupt · ctrl+q enqueue',
      ' Autopilot · Allow All · ◉ Wor ctrl+c    Claude Sonnet 5.5 · High · 936K conte…',
      ' Autopilot · Allow All · ◎ Run ctrl+c    Claude Sonnet 5.5 · High · 936K conte…',
      ' Autopilot · Allow All ·  ctrl+c       · Claude Sonnet 5.5 · High · 936K conte…',
      ' Autopilot · Allow All ·  ctrl+c interrupt ·  Claude Sonnet 5.5 · High · 936K context (4…',
      ' Autopilot · Allow All · ◉ Running    ctrl+c interrupt Claude Sonnet 5.5 · High · 936K context (4%)',
      ' Autopilot · Allow All ·  ctrl+c interrupt · ctrl+q en Claude Sonnet 5.5 · High · 936K context (4%)',
      ' Autopilot · Allow All · ○ Running bash · 16s · 83 B ctrl+c interrupt      Claude Sonnet 5.5 · High · 936K context (4%)',
      ' Autopilot · Allow All · ◉ Running bash  ctrl+c interrupt · ctrl+q enqueue Claude Sonnet 5.5 · High · 936K context (4%)',
      ' Autopilot · Allow All · ◉ Running bash · 33s · 83 B ctrl+c interrupt · ctrl+q enqueue          Claude Sonnet 5.5 · High · 936K context (4%)',
      ' Autopilot · Allow All · ◉       ctrl+c interrupt Claude Opus 5.5 · Max · (58%)',
      // Under the Kitty keyboard protocol the queue key is Ctrl+Enter.
      ' Plan · Allow All · ◉ Running bash  ctrl+c interrupt · ctrl+enter enqueue GPT-5.6 Sol Fast (Internal…',
      // Background shells still running after the turn keep the key's word.
      ' ← open sidebar · Interactive · Manual Approval · ● Waiting for background shells ctrl+c interrupt GPT-5 mini · Low · (19%)',
    ])('reads a turn at work, whose prompt takes a steer: %s', (footer) => {
      const busy = pane(footer)
      expect(isTerminalAgentWorking(busy)).toBe(true)
      expect(isTerminalVisiblyIdle(busy)).toBe(false)
      expect(terminalInputReady(busy)).toBe(false)
      expect(terminalInputReady(busy, true)).toBe(true)
    })

    // A turn can end with shells it started still running. The row then keeps
    // the interrupt key and says what Copilot waits for, cut to fit, down to
    // nothing; the pane can only be consistent with that wait, and the event
    // log has to say whether it is the one.
    it.each([
      ' ← open sidebar · Interactive · Manual Approval · ● Waiting for background shells ctrl+c interrupt GPT-5 mini · Low · (19%)',
      // As Copilot drew them in 80-column panes.
      ' ● Waiting for background s… · 136 B ctrl+c interrupt GPT-6.1 Sol · High · (9%)',
      ' ● Waiting for bac… · 1m 06s · 136 B ctrl+c interrupt GPT-6.1 Sol · High · (9%)',
      ' Autopilot · Allow All · ◉ Wai… ctrl+c    Claude Opus 5.5 · Max · 1M context (6…',
      ' Autopilot · Allow All · ◉ ctrl+c    Claude Opus 5.5 · Max · 1M context (6…',
    ])('reads a prompt that may be left to background shells: %s', (footer) => {
      expect(terminalMayBeWaitingForBackgroundShells(pane(footer))).toBe(true)
    })

    it.each([
      ' Autopilot · Allow All · ◉ Wor ctrl+c    Claude Opus 5.5 · Max · 1M context (6…',
      ' ◉ Working · 83 B ctrl+c interrupt',
      ' ◉ Running bash · 26s · 8 ctrl+c interrupt',
      ' ◉ Waiting for background agents ctrl+c stop agents',
      ' Autopilot · Allow All · ◎ Waiting for backgr ctrl+c stop agents  Claude Opus 5.5 · Max · (58%)',
      ' ● Waiting for background a… · 273 B ctrl+c interrupt GPT-6.1 Sol · High · (9%)',
      ' Autopilot · Allow All · / commands      Claude Sonnet 5.5 · High · 936K conte…',
    ])('does not read a row naming anything else as that wait: %s', (footer) => {
      expect(terminalMayBeWaitingForBackgroundShells(pane(footer))).toBe(false)
    })

    it('reads that wait only below an empty live prompt', () => {
      const typing = pane(
        ' ● Waiting for ba… · 136 B ctrl+c interrupt · ctrl+q enqueue GPT-6.1 Sol · High · (9%)',
      ).replace('\n❯\n', '\n❯ an unsent draft\n')
      expect(terminalInputReady(typing, true)).toBe(true)
      expect(terminalMayBeWaitingForBackgroundShells(typing)).toBe(false)
      expect(terminalMayBeWaitingForBackgroundShells('Waiting for background shells')).toBe(false)
    })

    // With only background agents left the key offers to stop them, and a
    // message sent then starts a new turn.
    it.each([
      ' ◉ Waiting for background agents ctrl+c stop agents',
      ' Autopilot · Allow All · ● Waiting for background agents · 273 B ctrl+c stop agents GPT-6.1 Sol · High · (9%)',
      ' Autopilot · Allow All · ◎ Waiting for backgr ctrl+c stop agents  Claude Opus 5.5 · Max · (58%)',
      ' Autopilot · Allow All · ○ Waiting for background agents ctrl+c stop ag Claude Sonnet 5.5 · High · 936K conte…',
    ])('reads a prompt left to background agents as idle: %s', (footer) => {
      const idle = pane(footer)
      expect(isTerminalAgentWorking(idle)).toBe(false)
      expect(isTerminalVisiblyIdle(idle)).toBe(true)
      expect(terminalInputReady(idle)).toBe(true)
    })

    it.each([
      // Shell mode runs what is typed as a command.
      ' Shell · Allow All · ◉ Working ctrl+c interrupt   Claude Opus 5.5 · Max · (58%)',
      ' Shell · Allow All ·  ctrl+c       · Claude Sonnet 5.5 · High · 936K conte…',
      ' ◉ Working ctrl+c exit shell mode',
      // Offered only while the prompt holds text.
      ' Autopilot · Allow All · ◉ Waiting for background agents ctrl+c clear input · ctrl+q enqueue',
      // Escape armed, or a turn to recall.
      ' Autopilot · Allow All · ◉ Working esc again to interrupt   Claude Opus 5.5 · Max · (58%)',
      ' Autopilot · Allow All · ◉ Delete the folder? ctrl+c interrupt   Claude Opus 5.5 · Max · (58%)',
      ' ◉ Overwrite [y/n] ctrl+c interrupt',
      ' ◉ Working ctrl+c interrupt · enter to approve   Claude Opus 5.5 · Max · (58%)',
      ' ◉ Working ctrl+c interrupt   Delete the folder? · y/n',
      ' ◉ Working ctrl+c interrupt   GPT- · High · (9%)',
      ' ◉ Working ctrl+c interrupt now   Claude Opus 5.5 · Max · (58%)',
      ' ◉ Working ctrl+c to interrupt   Claude Opus 5.5 · Max · (58%)',
      ' ◉ Working ctrl+c interrupt · ctrl+q enqueue · ctrl+q enqueue',
      ' ◉ Working ctrl+c interrupt   Claude Opus 5.5 · Max… · (58%)',
      ' ◉ Working ctrl+c interrupt   Claude Opus 5.5 · Max · (58%) · enter…',
      ' Autopilot · Allow All · Working ctrl+c interrupt   Claude Opus 5.5 · Max · (58%)',
      ' Allow All · Autopilot · ◉ Working ctrl+c interrupt   Claude Opus 5.5 · Max · (58%)',
      ' ◉ Working ctrl+c stop agents · enter to confirm',
      ' ◉ Waiting for background agents ctrl+c stop agents   Delete the folder? · y/n',
    ])('refuses a row that only resembles it: %s', (footer) => {
      expect(terminalInputReady(pane(footer), true)).toBe(false)
      // Nor does it read as work, which Stop would answer with Ctrl+C.
      expect(isTerminalAgentWorking(pane(footer))).toBe(false)
    })

    // The idle row cuts the model hint the same way.
    it.each([
      ' Autopilot · Allow All · / commands      Claude Sonnet 5.5 · High · 936K conte…',
      ' Autopilot · Allow All · / commands      Claude Sonnet 5.5 · High · 936K context (4…',
      ' Autopilot · Allow All · / commands      GPT-5.6 Sol Fast (Internal only) · Hi…',
      ' Autopilot · Allow All · / commands      GPT-5.6 Sol Fast (Internal…',
      ' Autopilot · Allow All · / commands      Claude Opus 5.5 · Max · …',
    ])('reads an idle row whose model hint was cut: %s', (footer) => {
      const idle = pane(footer)
      expect(isTerminalVisiblyIdle(idle)).toBe(true)
      expect(terminalInputReady(idle)).toBe(true)
    })

    it.each([
      ' ◉ Working · 83 B ctrl+c interrupt',
      ' Autopilot · Allow All · ◉ Wor ctrl+c    Claude Sonnet 5.5 · High · 936K conte…',
      ' Autopilot · Allow All · ◉       ctrl+c interrupt Claude Opus 5.5 · Max · (58%)',
    ])('types a steer into the turn at once: %s', async (footer) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      try {
        const { controller, sessionId, output } = await deliveryFixture(
          false, undefined, undefined, footer, '', 'flat',
          undefined, undefined, undefined, undefined, 'bare',
        )
        expect(await controller.inputReady(sessionId)).toBe(false)
        expect(await controller.send(
          sessionId, 'Steer during 1.0.106 work', false, { allowDuringAgentExecution: true },
        )).toBe(true)
        const received = await eventually(
          () => readFile(output, 'utf8'),
          (value) => Boolean(value && JSON.parse(value).submits.length),
        )
        expect(JSON.parse(received)).toEqual({
          pastes: ['Steer during 1.0.106 work'], submits: ['enter'],
        })
        expect(warn).not.toHaveBeenCalled()
      } finally {
        warn.mockRestore()
      }
    }, 15_000)

    it('sends a new prompt while only background agents run', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      try {
        const { controller, sessionId, output } = await deliveryFixture(
          false, undefined, undefined,
          ' Autopilot · Allow All · ◉ Waiting for background agents ctrl+c stop agents  Claude Opus 5.5 · Max · (58%)',
          '', 'flat', undefined, undefined, undefined, undefined, 'bare',
        )
        expect(await controller.inputReady(sessionId)).toBe(true)
        expect(await controller.send(sessionId, 'New prompt beside background agents', false)).toBe(true)
        const received = await eventually(
          () => readFile(output, 'utf8'),
          (value) => Boolean(value && JSON.parse(value).submits.length),
        )
        expect(JSON.parse(received)).toEqual({
          pastes: ['New prompt beside background agents'], submits: ['enter'],
        })
        expect(warn).not.toHaveBeenCalled()
      } finally {
        warn.mockRestore()
      }
    }, 15_000)

    it('still refuses a steer under a look-alike row', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      try {
        const footer = ' ◉ Working ctrl+c interrupt · enter to approve   Claude Opus 5.5 · Max · (58%)'
        const { controller, sessionId, output } = await deliveryFixture(
          false, pane(footer), undefined, '', '', 'flat',
        )
        expect(await controller.send(sessionId, 'Known footer first', false)).toBe(true)
        await eventually(() => controller.capture(sessionId), (current) => Boolean(current?.includes(footer.trim())))
        await expect(controller.send(
          sessionId, 'Must not be typed', false, { allowDuringAgentExecution: true },
        )).rejects.toMatchObject({ statusCode: 409 })
        expect(JSON.parse(await readFile(output, 'utf8')).pastes).toEqual(['Known footer first'])
      } finally {
        warn.mockRestore()
      }
    }, 15_000)
  })

  it.each([
    ' Interactive · Allow All · / commands       ctrl+t show reasoning · GPT-6.1 Sol',
    ' Plan · Allow All · / commands              ctrl+t show reasoning · GPT-6.1 Sol',
    ' Autopilot · Allow All · / commands         ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · Allow All · / command ctrl+t show reasoning · GPT-6.1 So',
    ' Interactive · Allow All · / c ctrl+t show reasoning · GPT-',
    ' Interactive · Allow All · / commands ctrl+t show reasoning · G',
    ' Interactive · Allow All · / commands ctrl+t show reas',
    ' ← open sidebar · Plan · Manual Approval · / commands          ctrl+t show reasoning · Claude Sonnet 5',
    ' ← open sidebar · Interactive · Allow All · / commands · ? help · tab next tab',
    ' Interactive · A ctrl+t show reasoning · GPT-',
    ' Interactive · Allow All · / commands ctrl+t show reasoning · o',
    ' Interactive · Allow All · / commands ctrl+t show reasoning · o3-mini',
    ' Interactive · Allow All · / commands ctrl+t show reasoning ·',
  ])('recognizes the one-row footer of Copilot 1.0.96: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(true)
    expect(await controller.send(sessionId, 'One-row footer proof', false)).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['One-row footer proof'], submits: ['enter'],
    })
  }, 15_000)

  it.each([
    ' Interactive · Deploy now · / commands       ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · Interactive · / commands      ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · Plan · / commands             ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · Allow All · Manual Approval   ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · Allow All · / cx ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · / c · Allow All      ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · Allow All · / commands   ctrl+t show reasoning · Unknown footer',
    ' Interactive · Allow All · / commands   ctrl+t delete everything',
    ' Interactive · Allow All · / commands   ctrl+t show reasoning · Xy',
    ' Allow All · Interactive · / commands       ctrl+t show reasoning · GPT-6.1 Sol',
    ' / commands · Interactive · Allow All       ctrl+t show reasoning · GPT-6.1 Sol',
    ' Interactive · Allow All · ? help · / commands   ctrl+t show reasoning · GPT-6.1 Sol',
    ' / commands · Interactive · A ctrl+t show reasoning · GPT-',
    ' / commands · Interactive · Allow All',
    ' Allow All · Interactive',
    ' ← open sidebar · Unknown view · / commands',
    ' / commands · Deploy now',
    ' Interactive',
    ' Interactive · Allow All · / commands\nUnrelated output',
  ])('refuses one-row footer lookalikes without input: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe('')
  })

  it('logs each unrecognised footer once while it is among the recent ones', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const footer = (index: number) => `Fixture hint ${'x'.repeat(index % 7)}${String.fromCharCode(97 + (index % 26))}${index}`
      const shapes = Array.from({ length: 300 }, (_, index) => `${footer(index)} · ${'·'.repeat(index)}`)
      expect(reportUnrecognisedFooter(shapes[0])).toBe(true)
      expect(reportUnrecognisedFooter(shapes[0].replace(/\d+/u, '99'))).toBe(false)
      for (const shape of shapes.slice(1, 40)) expect(reportUnrecognisedFooter(shape)).toBe(true)
      expect(reportUnrecognisedFooter(shapes[39])).toBe(false)
      for (const shape of shapes.slice(40)) expect(reportUnrecognisedFooter(shape)).toBe(true)
      // Evicted after 256 newer shapes, so it is logged again rather than
      // never logging anything new.
      expect(reportUnrecognisedFooter(shapes[0])).toBe(true)
      expect(warn).toHaveBeenCalledTimes(301)
    } finally {
      warn.mockRestore()
    }
  })

  it('logs each unrecognised prompt shape once, apart from footers', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const shape = 'rules ═/═ marker ‡ fixture 1'
      expect(reportUnrecognisedComposer(shape)).toBe(true)
      expect(reportUnrecognisedComposer(shape.replace('1', '2'))).toBe(false)
      expect(reportUnrecognisedFooter(shape)).toBe(true)
      expect(warn).toHaveBeenNthCalledWith(1, expect.stringContaining('prompt this version does not recognise'))
      expect(warn).toHaveBeenNthCalledWith(2, expect.stringContaining('footer this version does not recognise'))
    } finally {
      warn.mockRestore()
    }
  })

  describe('composerHasFocus', () => {
    const edge = '─'.repeat(60)
    const flat = (footer: string[], text = '') => [
      ' /work/project                                      Session: 0 AIC used',
      edge,
      `❯${text ? ` ${text}` : ''}`,
      edge,
      ...footer,
    ]
    const newFooter = [' ← sidebar · Autopilot · /help        ctrl+r reasoning · Claude Opus 6']

    it('needs the cursor shown on a row inside the composer', () => {
      expect(composerHasFocus(flat(newFooter), true, 2)).toBe(true)
      expect(composerHasFocus(flat(newFooter, 'a draft'), true, 2)).toBe(true)
      expect(composerHasFocus(flat(newFooter), false, 2)).toBe(false)
      for (const row of [0, 1, 3, 4, -1, 99]) {
        expect(composerHasFocus(flat(newFooter), true, row)).toBe(false)
      }
    })

    it('finds a boxed composer as well', () => {
      const boxed = ['╻▄▄▄▄▄▄▄▄▄▄', '┃ ', '╹▀▀▀▀▀▀▀▀▀▀', ...newFooter]
      expect(composerHasFocus(boxed, true, 1)).toBe(true)
      expect(composerHasFocus(boxed, true, 3)).toBe(false)
    })

    it.each([
      [' ↑/↓ select · enter accept · esc cancel'],
      [' ❯ Confirm write', '   Cancel'],
      [' /model   Select a model'],
      [' Allow this tool to run?'],
      [' Continue? (y/n)'],
      [' ctrl+t delete everything'],
      [' a', ' b', ' c', ' d'],
    ])('refuses rows that could own the keyboard: %s', (...footer) => {
      expect(composerHasFocus(flat(footer), true, 2)).toBe(false)
    })

    it.each([
      ['rules and a marker', ['════════════', '› ', '════════════']],
      ['blocks with sides', ['▛▀▀▀▀▀▀▀▀▀▀▀▜', '▌ » a draft ▐', '▙▄▄▄▄▄▄▄▄▄▄▄▟']],
      ['a placeholder and no marker', [
        '╔══════════════╗',
        '║ Type @ to mention files, # for issues/PRs, / for commands ║',
        '╚══════════════╝',
      ]],
    ])('finds a prompt drawn with characters the grammar does not know: %s', (_, frame) => {
      const rows = [' transcript', ...frame, ...newFooter]
      expect(composerHasFocus(rows, true, 2)).toBe(true)
      expect(composerHasFocus(rows, false, 2)).toBe(false)
      for (const row of [0, 1, 3, 4]) expect(composerHasFocus(rows, true, row)).toBe(false)
    })

    it.each([
      ['no marker', ['════════════', 'Name your branch', '════════════', ...newFooter]],
      ['a marker joined to text', ['════════════', '›draft', '════════════', ...newFooter]],
      ['a form below', ['════════════', '› ', '════════════', ' ↑/↓ select · enter accept · esc cancel']],
      ['a question below', ['════════════', '› ', '════════════', ' Allow this tool to run?']],
      ['one rule', [' more transcript', '› ', '════════════', ...newFooter]],
      ['short rules', ['═══════', '› ', '═══════', ...newFooter]],
      // Line and block characters draw frames; a side is never the marker.
      ['a box with no marker', ['╭──────────────╮', '│ Name         │', '╰──────────────╯', ...newFooter]],
      ['an open box with no marker', ['════════════', '║ Name', '════════════', ...newFooter]],
      ['a block character in place of a marker', ['════════════', '▌ a draft', '════════════', ...newFooter]],
      ['a line character in place of a marker', ['════════════', '│ ', '════════════', ...newFooter]],
      ['a side on the first row only', ['════════════', '│ Name', '  more', '════════════', ...newFooter]],
      // Copilot's shell mode marks its prompt with `!`, and Enter there runs
      // the text as a command, even while a turn runs.
      ['shell mode', [edge, '! ', edge, ...newFooter]],
      ['shell mode while a turn runs', [edge, '! Execute shell command', edge, ' ◉ Working · 83 B ctrl+c interrupt']],
      ['a dialog field', [
        '╭──────────────────────────╮',
        '│ › new name               │',
        '│ enter save · esc cancel  │',
        '╰──────────────────────────╯',
        ...newFooter,
      ]],
      ['more quiet rows after a field than an unknown footer may have', [
        '╭──────────────────────────╮',
        '│ › new name               │',
        '│ Your branch              │',
        '│ will be                  │',
        '│ created                  │',
        '│ shortly                  │',
        '╰──────────────────────────╯',
      ]],
    ])('refuses a region with the cursor in it that is not a prompt: %s', (_, frame) => {
      expect(composerHasFocus([' transcript', ...frame], true, 2)).toBe(false)
    })

    it('finds a draft over several rows with the cursor at its end', () => {
      const rows = [
        ' transcript',
        '════════════',
        '› a draft that asks',
        '  whether to deploy?',
        '════════════',
        ...newFooter,
      ]
      expect(composerHasFocus(rows, true, 3)).toBe(true)
      // Moved back into it, what follows the cursor is judged like footer.
      expect(composerHasFocus(rows, true, 2)).toBe(false)
    })
  })

  // Copilot 1.0.96 at 80 columns, captured from live sessions mid-turn.
  it.each([
    ' ◉ Working · 52.1 KiB esc interrupt      ctrl+t show reasoning · GPT-5.6 Sol Fa',
    ' ○ Resolving current       esc interrupt ctrl+t show reasoning · GPT-6.1 Sol ·',
    ' ● Working · 47.6 KiB esc interrupt      ctrl+t show reasoning · GPT-6 Sol · 87',
    ' ◉ Working - autopilot · 3 esc interrupt ctrl+t show reasoning · GPT-6.1 Sol ·',
    ' ◉ Working · esc interrupt',
  ])('queues beneath the one-row working footer of Copilot 1.0.96: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
      undefined, undefined, undefined, undefined, 'bare',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await controller.send(sessionId, 'Queued mid-turn', true)).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({ pastes: ['Queued mid-turn'], submits: ['queue'] })
  }, 20_000)

  it.each([
    ' ◉ Working · esc interrupt      ctrl+t delete everything',
    ' ◉ Working · esc interrupt      Deploy now',
    ' ◉ Working · esc interrupt      ctrl+t show reasoning · Unknown footer',
  ])('refuses a working footer lookalike: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
      undefined, undefined, undefined, undefined, 'bare',
    )
    await expect(controller.send(sessionId, 'Not queued', true)).rejects.toThrow()
    expect(await readFile(output, 'utf8')).toBe('')
  }, 120_000)

  // Copilot shows the cursor on its prompt row while the prompt has the
  // keyboard, so a footer from a newer CLI does not stop input there.
  it.each([
    ' ← sidebar · Autopilot · Allow All · /help        ctrl+r reasoning · Claude Opus 6',
    ' Interactive · Allow All · / commands   ctrl+t show reasoning · Unknown footer',
    ' A new version available · Autopilot · ctrl+r reasoning',
    ' Downloading a new version · Autopilot · ctrl+r reasoning',
    ' v1.1.0 downloaded · restart to update\n Autopilot · Allow All · ? help\n Fixture Model · 2M context (3%)',
  ])('accepts an unrecognised footer while the cursor is in the prompt: %s', async (footer) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const { controller, sessionId, output } = await deliveryFixture(
        false, undefined, undefined, footer, '', 'flat',
        undefined, undefined, undefined, undefined, 'bare', 'prompt',
      )
      expect(await controller.inputReady(sessionId)).toBe(true)
      expect(await controller.send(sessionId, 'Unknown footer proof', false)).toBe(true)
      const received = await eventually(
        () => readFile(output, 'utf8'),
        (value) => Boolean(value && JSON.parse(value).submits.length),
      )
      expect(JSON.parse(received)).toEqual({
        pastes: ['Unknown footer proof'], submits: ['enter'],
      })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('does not recognise'))
    } finally {
      warn.mockRestore()
    }
  }, 20_000)

  it('queues under an unrecognised footer while the agent works', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      true, undefined, undefined, ' ⏵ autopilot on · ctrl+r reasoning · Claude Opus 6', '', 'flat',
      undefined, undefined, undefined, undefined, 'bare', 'prompt',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await controller.send(sessionId, 'Queued under a new footer', true)).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Queued under a new footer'], submits: ['queue'],
    })
  }, 20_000)

  // A later Copilot may draw its prompt with characters the grammar does not
  // know. The cursor in it still says the prompt has the keyboard.
  it.each([
    ['unfamiliar', ''],
    ['unfamiliar', ' ⏵ autopilot on · ctrl+r reasoning · Claude Opus 6'],
    ['unfamiliar-boxed', ''],
  ] as const)('accepts a prompt drawn with unfamiliar glyphs while the cursor is in it: %s %s', async (style, footer) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const { controller, sessionId, output } = await deliveryFixture(
        false, undefined, undefined, footer, '', 'flat',
        undefined, undefined, undefined, undefined, style, 'prompt',
      )
      expect(await controller.inputReady(sessionId)).toBe(true)
      expect(await controller.send(sessionId, 'Unfamiliar prompt proof', false)).toBe(true)
      const received = await eventually(
        () => readFile(output, 'utf8'),
        (value) => Boolean(value && JSON.parse(value).submits.length),
      )
      expect(JSON.parse(received)).toEqual({
        pastes: ['Unfamiliar prompt proof'], submits: ['enter'],
      })
    } finally {
      warn.mockRestore()
    }
  }, 20_000)

  it('queues beneath a prompt drawn with unfamiliar glyphs while the agent works', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      true, undefined, undefined, '', '', 'flat',
      undefined, undefined, undefined, undefined, 'unfamiliar', 'prompt',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await controller.send(sessionId, 'Queued under a new prompt', true)).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Queued under a new prompt'], submits: ['queue'],
    })
  }, 20_000)

  it('keeps a draft in a prompt drawn with unfamiliar glyphs', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, '', 'Keep this native draft', 'flat',
      undefined, undefined, undefined, undefined, 'unfamiliar', 'prompt',
    )
    expect(await controller.inputReady(sessionId)).toBe(true)
    await expect(controller.send(sessionId, 'Do not append', false))
      .rejects.toMatchObject({ statusCode: 409, terminalDraftConflict: true, uncertainDelivery: false })
    expect(await readFile(output, 'utf8')).toBe('')
  }, 15_000)

  it.each(['end', 'hidden'] as const)(
    'refuses a prompt drawn with unfamiliar glyphs when the cursor is not shown in it: %s',
    async (cursor) => {
      const { controller, sessionId, output } = await deliveryFixture(
        false, undefined, undefined, '', '', 'flat',
        undefined, undefined, undefined, undefined, 'unfamiliar', cursor,
      )
      expect(await controller.inputReady(sessionId)).toBe(false)
      expect(await readFile(output, 'utf8')).toBe('')
    },
  )

  it.each([
    [' ❯ Confirm write\n   Cancel', 'a list'],
    [' 1. Yes, proceed', 'a numbered choice'],
    [' /model   Select a model', 'a command picker'],
    [' @src/App.tsx', 'a file picker'],
    [' Do you want to keep going?', 'a question'],
    [' Choose a model:', 'a prompt for an answer'],
    [' choose with ↑/↓ · ⏎ run', 'list navigation'],
    [' esc to close · tab to switch', 'keys for another view'],
    [' enter to confirm', 'a confirmation'],
    [' one hint\n two hint\n three hint\n four hint', 'too many unknown rows'],
    [' Interactive · Allow All · / commands   ctrl+t delete everything', 'a destructive shortcut'],
    [' Interactive · Deploy now · / commands       ctrl+t show reasoning · GPT-6.1 Sol', 'an action'],
    [' Continue? (y/n)', 'a question mid-row'],
    [' Overwrite notes.md [Y/n]', 'answers to choose between'],
    [' ⏎ run · ctrl+r reasoning', 'a job for Enter'],
    [' ctrl+q stop queue · ctrl+r reasoning', 'a job for a key this app sends'],
    [' space mark · ctrl+r reasoning', 'a job for Space'],
    [' y keep · ctrl+r reasoning', 'a job for a plain key'],
    [' press y to keep the file', 'a pressed plain key'],
    [' [y] keep · [n] skip', 'a bracketed plain key'],
    [' q to leave · ctrl+r reasoning', 'a plain key given a job'],
    [' y keep the file · ctrl+r reasoning', 'a plain key with a longer job'],
    [' Autopilot · then y keep the file', 'a plain key inside a cell'],
  ])('refuses an unrecognised footer that could own the keyboard: %s (%s)', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
      undefined, undefined, undefined, undefined, 'bare', 'prompt',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe('')
  })

  // The same footers are accepted above only because the cursor was there.
  it.each([
    ['end', ' ← sidebar · Autopilot · /help        Claude Opus 6'],
    ['hidden', ' ← sidebar · Autopilot · /help        Claude Opus 6'],
    ['end', ' Interactive · Allow All · / commands   ctrl+t show reasoning · Unknown footer'],
    ['hidden', ' Interactive · Allow All · / commands   ctrl+t show reasoning · Unknown footer'],
  ] as const)(
    'refuses an unrecognised footer when the cursor is not shown in the prompt: %s, %s',
    async (cursor, footer) => {
      const { controller, sessionId, output } = await deliveryFixture(
        false, undefined, undefined, footer, '', 'flat',
        undefined, undefined, undefined, undefined, 'bare', cursor,
      )
      expect(await controller.inputReady(sessionId)).toBe(false)
      expect(await readFile(output, 'utf8')).toBe('')
    },
  )

  it.each([
    'ctrl+t show reasoning · Unknown footer',
    'ctrl+t show reasoning: GPT-5.6 Sol',
  ])('rejects malformed wrapped reasoning/model metadata: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe('')
  })

  it('preserves an existing draft under the wrapped reasoning/model footer', async () => {
    const footer = ' ctrl+t show reasoning · GPT-5.6 Sol'
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, 'Preserve this native draft', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(true)
    await expect(controller.send(sessionId, 'Do not append', false))
      .rejects.toMatchObject({ statusCode: 409, terminalDraftConflict: true, uncertainDelivery: false })
    expect(await readFile(output, 'utf8')).toBe('')
    expect(await controller.capture(sessionId)).toContain('Preserve this native draft')
  }, 15_000)

  it.each([
    downloadedUpdateFooter,
    wideDownloadedUpdateFooter,
    'v1.0.94 downloaded · next launch or /res     · ← open sidebar · / commands · tab next\ntart                                tab',
    'v1.0.94 downloaded · next launch or /restart · ← open sidebar · Plan · · / commands · tab next tab\n                                                Allow All',
    'v1.0.94 downloaded · next launch or /restart · ← open sidebar · / commands · ? help · tab next tab',
    ' v1.0.94                 · ← open sidebar · / commands · tab next tab\n downloaded · next launch or /restart',
    ' v1.0.94 downloaded · next launch or /restart · ← open side · / commands · tab next tab\n                                                bar',
    [
      ' v1.0.94     · ← open  · Autopilot ·      · / commands · tab',
      ' downloaded    sidebar               Allow   next tab',
      ' · next launch                       All',
      ' or /restart',
    ].join('\n'),
    ' v1.0.94 · ← open · / commands · tab next tab\n downloaded   sidebar\n · next\n launch\n or\n /restart',
    'v1.0.92 downloaded · next launch or /restart',
    'v1.0.92-1 downloaded · next\nlaunch or /restart',
    'v1.0.92-alpha.1 downloaded · next\nlaunch or /restart',
    'v1.0.92-01alpha+build.01 downloaded · next\nlaunch or /restart',
  ])('admits the exact downloaded-update footer: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(true)
    expect(await controller.send(sessionId, 'Downloaded footer proof', false)).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Downloaded footer proof'], submits: ['enter'],
    })
  }, 15_000)

  it.each([
    'v1.0.92 downloaded · next',
    'v1.0.92 downloaded · next\nlaunch or /update',
    'downloaded · next\nlaunch or /restart',
    'v1.0.92unknown downloaded · next\nlaunch or /restart',
    'v1.0.92 downloaded · next\nlaunch or /restart unrelated output',
    downloadedUpdateFooter.replace('launch or /restart', 'approve or /restart'),
    downloadedUpdateFooter.replace('Allow All', 'Approve deployment'),
    downloadedUpdateFooter.replace('Autopilot', 'Unknown view'),
    `${downloadedUpdateFooter}\nUnrelated output`,
    wideDownloadedUpdateFooter.replace(' restart ', ' rest '),
    wideDownloadedUpdateFooter.replace(' restart ', ' restart approve '),
    wideDownloadedUpdateFooter.replace(' tab\n', ' tab tab\n'),
    wideDownloadedUpdateFooter.replace('Allow All', 'Allow'),
    wideDownloadedUpdateFooter.replace('Interactive', 'Interactive · Autopilot'),
    wideDownloadedUpdateFooter.replace('? help', '? help me'),
    wideDownloadedUpdateFooter.replace('← open', 'open'),
    wideDownloadedUpdateFooter.replace('v1.0.94', 'v1.0.94-'),
    'v1.0.94 downloaded · next launch or /restart · ← sidebar open · / commands · tab next tab',
    'v1.0.94 downloaded · next launch or /restart · ← open sidebar · tab next tab · / commands',
    'v1.0.94 downloaded · next launch or /restart · ← open sidebar · / commands · tab next tab\n← unknown',
    wideDownloadedUpdateFooter.replace(' restart ', ' tab ').replace(' tab\n', ' restart\n'),
    `v1.0.94 downloaded · next · ← open sidebar · / commands · tab next tab\n${'launch or tab '.repeat(60)}`,
    ' v1.0.94 · ← open · / commands · tab next tab\n downloaded   sidebar\n · next\n launch\n or\n /approve',
    ' v1.0.94 · ← open · / commands · tab next tab\n downloaded   sidebar\n · next launch\n or /restart\n tab',
  ])('refuses downloaded-update footer lookalikes without input: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe('')
  })

  it.each([
    '1.0.92', 'V1.0.92', 'v01.0.92', 'v1.00.92', 'v1.0.092',
    'v1.0.92-', 'v1.0.92-alpha..1', 'v1.0.92-alpha_1', 'v1.0.92-01',
    'v1.0.92-alpha.01', 'v1.0.92+build..1', 'v1.0.92+',
  ])('refuses invalid downloaded-update version %s even beside valid command hints', async (version) => {
    const footer = downloadedUpdateFooter.replace('v1.0.92', version)
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe('')
  })

  it('preserves native drafts beneath the downloaded-update footer', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, downloadedUpdateFooter, 'Keep my native text', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(true)
    await expect(controller.send(sessionId, 'Do not append', false))
      .rejects.toMatchObject({ statusCode: 409, terminalDraftConflict: true, uncertainDelivery: false })
    expect(await readFile(output, 'utf8')).toBe('')
    expect(await controller.capture(sessionId)).toContain('Keep my native text')
  }, 15_000)

  it('does not admit an overlay below the downloaded-update footer', async () => {
    const footer = `${downloadedUpdateFooter}\nSettings\n↑/↓ navigate · enter edit · esc close`
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, footer, '', 'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe('')
  })

  it('finishes owned terminal startup beneath the downloaded-update footer', async () => {
    const { controller, sessionId, output } = await ownedStartupFixture(undefined, downloadedUpdateFooter)
    expect(await controller.inputReady(sessionId)).toBe(true)
    expect(JSON.parse(await readFile(output, 'utf8'))).toEqual({
      keys: '', pastes: [], submits: 0,
    })
  }, 15_000)

  it('replaces a stale draft beneath the wide downloaded-update footer of a boxed composer', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, wideDownloadedUpdateFooter, 'stale terminal text',
    )
    await expect(controller.send(
      sessionId, 'Wide footer replacement', false, { replaceExistingInput: true },
    )).resolves.toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      clears: 1, pastes: ['Wide footer replacement'], submits: ['enter'],
    })
  }, 15_000)

  it('sends through the flat composer used by Copilot v1.0.87', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      '',
      'flat',
    )
    expect(await controller.inputReady(sessionId)).toBe(true)
    await expect(
      controller.send(sessionId, 'Message through the flat composer', false),
    ).resolves.toBe(true)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Message through the flat composer'],
      submits: ['enter'],
    })
  }, 15_000)

  it('ignores an older flat composer above the live boxed composer', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      '',
      'boxed',
      flatReadyComposer('Earlier terminal text'),
    )
    await expect(
      controller.send(sessionId, 'Message through the boxed composer', false),
    ).resolves.toBe(true)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Message through the boxed composer'],
      submits: ['enter'],
    })
  }, 15_000)

  it('replaces a multiline flat draft containing a horizontal rule', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      'first line\n────────────\nsecond line',
      'flat',
    )
    await expect(
      controller.send(sessionId, 'Replacement message', false),
    ).rejects.toMatchObject({
      statusCode: 409,
      terminalDraftConflict: true,
    })
    await expect(controller.send(
      sessionId,
      'Replacement message',
      false,
      { replaceExistingInput: true },
    )).resolves.toBe(true)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      clears: 1,
      pastes: ['Replacement message'],
      submits: ['enter'],
    })
  }, 15_000)

  it('clears a verified existing draft only after explicit replacement and sends once', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      'stale terminal text',
    )
    await expect(controller.send(sessionId, 'Preserved app draft', false))
      .rejects.toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    expect(await readFile(output, 'utf8')).toBe('')

    await expect(controller.send(
      sessionId,
      'Preserved app draft',
      false,
      { replaceExistingInput: true },
    )).resolves.toBe(true)

    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      clears: 1,
      pastes: ['Preserved app draft'],
      submits: ['enter'],
    })
  }, 15_000)

  it('waits through a transient non-composer frame before replacing a draft', async () => {
    const { controller, sessionId, output, panePid } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      '',
      'boxed',
      '',
      500,
      'stale terminal text',
    )
    await expect(controller.send(sessionId, 'Warm up owner', false))
      .resolves.toBe(true)
    process.kill(Number(panePid), 'SIGUSR1')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => composerHoldsText(pane || ''),
    )
    await expect(controller.send(sessionId, 'Preserved app draft', false))
      .rejects.toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    process.kill(Number(panePid), 'SIGUSR2')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => pane?.includes('Loading terminal frame') === true,
    )

    await expect(controller.send(
      sessionId,
      'Preserved app draft',
      false,
      { replaceExistingInput: true },
    )).resolves.toBe(true)

    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      clears: 1,
      pastes: ['Warm up owner', 'Preserved app draft'],
      submits: ['enter', 'enter'],
    })
  }, 20_000)

  it('does not clear through a briefly painted composer before delayed loading', async () => {
    const loadingPane = [
      'Loading Copilot session',
      '◎ Loading: 1 instruction, 1 plugin, 6 hooks, 27 skills, 2 MCP servers',
    ].join('\n')
    const { controller, sessionId, output, panePid } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      '',
      'boxed',
      '',
      1_000,
      'stale terminal text',
      loadingPane,
    )
    await expect(controller.send(sessionId, 'Warm up owner', false))
      .resolves.toBe(true)
    process.kill(Number(panePid), 'SIGUSR1')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => composerHoldsText(pane || ''),
    )
    await expect(controller.send(sessionId, 'Preserved app draft', false))
      .rejects.toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    process.kill(Number(panePid), 'SIGURG')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => pane?.includes('Initial replacement repaint') === true,
    )

    let accepted = false
    try {
      accepted = await controller.send(
        sessionId,
        'Preserved app draft',
        false,
        { replaceExistingInput: true },
      )
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    }

    const received = JSON.parse(await readFile(output, 'utf8'))
    expect(received.earlyClear).toBeUndefined()
    expect(received).toEqual(accepted
      ? {
          clears: 1,
          pastes: ['Warm up owner', 'Preserved app draft'],
          submits: ['enter', 'enter'],
        }
      : {
          pastes: ['Warm up owner'],
          submits: ['enter'],
        })
  }, 20_000)

  it('classifies a persistent non-composer replacement timeout without clearing', async () => {
    const { controller, sessionId, output, panePid } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      '',
      'boxed',
      '',
      60_000,
      'stale terminal text',
    )
    await expect(controller.send(sessionId, 'Warm up owner', false))
      .resolves.toBe(true)
    process.kill(Number(panePid), 'SIGUSR1')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => composerHoldsText(pane || ''),
    )
    await expect(controller.send(sessionId, 'Preserved app draft', false))
      .rejects.toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    process.kill(Number(panePid), 'SIGUSR2')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => pane?.includes('Loading terminal frame') === true,
    )

    await expect(controller.send(
      sessionId,
      'Preserved app draft',
      false,
      { replaceExistingInput: true },
    )).rejects.toMatchObject({
      statusCode: 409,
      terminalDraftConflict: true,
      uncertainDelivery: false,
      message: expect.stringContaining('Nothing was cleared or pasted'),
    })

    expect(JSON.parse(await readFile(output, 'utf8'))).toEqual({
      pastes: ['Warm up owner'],
      submits: ['enter'],
    })
  }, 45_000)

  it('waits through delayed Copilot loading before replacing a draft', async () => {
    const loadingPane = [
      'Loading Copilot session',
      '◎ Loading: 1 instruction, 1 plugin, 6 hooks, 27 skills, 2 MCP servers',
    ].join('\n')
    const { controller, sessionId, output, panePid } = await deliveryFixture(
      false,
      undefined,
      undefined,
      '',
      '',
      'boxed',
      '',
      9_000,
      'stale terminal text',
      loadingPane,
    )
    await expect(controller.send(sessionId, 'Warm up owner', false))
      .resolves.toBe(true)
    process.kill(Number(panePid), 'SIGUSR1')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => composerHoldsText(pane || ''),
    )
    await expect(controller.send(sessionId, 'Preserved app draft', false))
      .rejects.toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    process.kill(Number(panePid), 'SIGUSR2')
    await eventually(
      () => controller.capture(sessionId),
      (pane) => pane?.includes('◎ Loading:') === true,
    )

    await expect(controller.send(
      sessionId,
      'Preserved app draft',
      false,
      { replaceExistingInput: true },
    )).resolves.toBe(true)

    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length > 1),
    )
    expect(JSON.parse(received)).toEqual({
      clears: 1,
      pastes: ['Warm up owner', 'Preserved app draft'],
      submits: ['enter', 'enter'],
    })
  }, 25_000)

  it('does not clear an existing draft while the terminal is working', async () => {
    const { controller, sessionId, output } = await deliveryFixture(
      true,
      undefined,
      undefined,
      '',
      'terminal owner draft',
    )

    await expect(controller.send(
      sessionId,
      'Do not replace this',
      false,
      {
        allowDuringAgentExecution: true,
        replaceExistingInput: true,
      },
    )).rejects.toMatchObject({
      statusCode: 409,
      terminalDraftConflict: true,
      uncertainDelivery: false,
    })
    expect(await readFile(output, 'utf8')).toBe('')
  }, 15_000)

  it('sends once to a working terminal when replacement found no draft to clear', async () => {
    const { controller, sessionId, output } = await deliveryFixture(true)

    await expect(controller.send(
      sessionId,
      'Steer the working agent',
      false,
      {
        allowDuringAgentExecution: true,
        replaceExistingInput: true,
      },
    )).resolves.toBe(true)

    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['Steer the working agent'], submits: ['enter'],
    })
  }, 15_000)

  it('refuses to paste when the agent starts working after a draft was cleared', async () => {
    const { controller, sessionId, output, panePid } = await deliveryFixture(
      false, undefined, undefined, '', 'stale terminal draft',
    )
    const owner = controller['owner'].bind(controller)
    let started = false
    controller['owner'] = async (...args: Parameters<typeof owner>) => {
      const value = await readFile(output, 'utf8')
      if (!started && value && JSON.parse(value).clears) {
        started = true
        process.kill(Number(panePid), 'SIGXCPU')
        await eventually(
          () => controller.capture(sessionId),
          (pane) => isTerminalAgentWorking(pane || ''),
        )
      }
      return owner(...args)
    }

    await expect(controller.send(
      sessionId,
      'Not into the new turn',
      false,
      { allowDuringAgentExecution: true, replaceExistingInput: true },
    )).rejects.toMatchObject({
      message: 'New terminal text appeared before the app draft could be sent. Nothing new was pasted.',
      statusCode: 409,
      terminalDraftConflict: true,
    })
    expect(started).toBe(true)
    expect(JSON.parse(await readFile(output, 'utf8'))).toEqual({
      clears: 1, pastes: [], submits: [],
    })
  }, 15_000)

  it.each([
    'Fixture Model · High · 1.1M context (0%)',
    'GPT-5.6 Sol Fast (Internal only)',
  ])('returns a fresh owned session with footer: %s', async (footer) => {
    const { controller, sessionId } = await ownedStartupFixture(undefined, footer)
    expect(await controller.capture(sessionId)).toContain(footer)
    expect(await controller.inputReady(sessionId)).toBe(true)
  }, 15_000)

  it.each([
    [' Changes    +0 -0', false, false],
    ['Changes +12 -3', false, false],
    [' Changes    +0 -3\n Fixture Model · High · 1.1M context (7%)', false, false],
    [' Changes    +12 -0\n Fixture Model · High · 1.1M context (0%)\n 0.0.999 available · /update', true, true],
  ] as const)('admits an exact change-summary footer: %s (working=%s, queue=%s)', async (footer, working, enqueue) => {
    const { controller, sessionId, output } = await deliveryFixture(working, undefined, undefined, footer)
    expect(await controller.capture(sessionId)).toContain(footer)
    expect(await controller.inputReady(sessionId)).toBe(!working)
    await expect(controller.send(sessionId, 'One change-summary message', enqueue)).resolves.toBe(true)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({
      pastes: ['One change-summary message'], submits: [enqueue ? 'queue' : 'enter'],
    })
  }, 15_000)

  it.each(['Changes +0 -0', ' Changes    +12 -3'])(
    'returns a fresh owned session with a change-summary footer: %s',
    async (changes) => {
      const footer = `${changes}\n Fixture Model · High · 1.1M context (0%)`
      const { controller, sessionId, output } = await ownedStartupFixture(undefined, footer)
      expect(await controller.capture(sessionId)).toContain(footer)
      expect(await controller.inputReady(sessionId)).toBe(true)
      await expect(controller.send(sessionId, 'First message after startup', false)).resolves.toBe(true)
      const received = await eventually(() => readFile(output, 'utf8'), (value) =>
        JSON.parse(value).submits === 1,
      )
      expect(JSON.parse(received)).toEqual({
        keys: '', pastes: ['First message after startup'], submits: 1,
      })
    },
    15_000,
  )

  it.each([
    'Changes +1 -2 and more',
    'Summary: Changes +1 -2',
    'Changes +1 -2 · Are you sure?',
    'Changes +1 -2\nA different view is loading',
    'Change +1 -2',
    'changes +1 -2',
    'Changes +1',
    'Changes -1 +2',
    'Changes +1 --2',
    'Changes +1.5 -2',
    'Changes +1 -2.5',
    'Changes +1,000 -2',
    'Changes +1e3 -2',
  ])('rejects a change-summary near-match footer: %s', async (footer) => {
    const { controller, sessionId, output } = await deliveryFixture(false, `${readyComposer()}\n${footer}`)
    await controller.send(sessionId, 'Warmup', true)
    const before = await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length),
    )
    expect(await controller.inputReady(sessionId)).toBe(false)
    await expect(controller.send(sessionId, 'Do not paste this', true))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(await readFile(output, 'utf8')).toBe(before)
  }, 15_000)

  it('requires explicit consent for session-use confirmation in an owned startup', async () => {
    const { controller, sessionId, output } = await ownedStartupFixture(sessionInUsePane)
    expect(JSON.parse(await readFile(output, 'utf8')).keys).toBe('')
    const permission = await controller.pendingPermission(sessionId)
    expect(permission).toMatchObject({
      options: [
        { optionId: 'terminal:allow', name: 'Resume anyway' },
        { optionId: 'terminal:stop', name: 'Go back' },
      ],
    })
    expect(await controller.canHandleStartupPrompt(sessionId, sessionInUsePane)).toBe(false)
    expect(await controller.resolveStartupPrompt(sessionId)).toBe(false)
    await expect(controller.send(sessionId, 'Do not consent for me', false))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(JSON.parse(await readFile(output, 'utf8'))).toEqual({ keys: '', pastes: [], submits: 0 })
    if (!permission) throw new Error('The startup fixture did not expose its permission')
    expect(await controller.replyPermission(sessionId, permission, 'terminal:allow')).toBe(true)
    expect(await controller.resolveStartupPrompt(sessionId)).toBe(true)
    await controller.send(sessionId, 'Only after explicit consent', false)
    const received = await eventually(() => readFile(output, 'utf8'), (value) =>
      JSON.parse(value).submits === 1,
    )
    expect(JSON.parse(received)).toMatchObject({ pastes: ['Only after explicit consent'], submits: 1 })
  }, 15_000)

  it('classifies a passive session-use warning during startup wait', async () => {
    const { controller, sessionId, output } =
      await deliveryFixture(false, passiveSessionInUsePane)
    await controller.send(sessionId, 'Warmup', true)
    const pane = await eventually(
      () => controller.capture(sessionId),
      (pane) => Boolean(pane?.includes('IDE auto-connect skipped')),
    )
    expect({
      detected: isTerminalSessionInUseConflict(pane || ''),
      pane,
    }).toMatchObject({ detected: true })
    const inspectable = controller as unknown as {
      owner(id: string, target?: string, fresh?: boolean): Promise<{
        target: string
      } | undefined>
    }
    const owner = await inspectable.owner(sessionId, undefined, true)
    expect(owner).toBeDefined()

    await expect(waitForTerminalStartup(
      owner!.target,
      true,
      async () => undefined,
      5_000,
      1,
    )).resolves.toBe('action-required')
    expect(JSON.parse(await readFile(output, 'utf8'))).toEqual({
      pastes: ['Warmup'],
      submits: ['queue'],
    })
  }, 15_000)

  it('refuses a passive session-use conflict without typing', async () => {
    const { controller, sessionId, output } =
      await deliveryFixture(false, passiveSessionInUsePane)
    await controller.send(sessionId, 'Warmup', true)
    await eventually(
      () => controller.capture(sessionId),
      (pane) => Boolean(pane?.includes('IDE auto-connect skipped')),
    )
    const before = await readFile(output, 'utf8')

    await expect(controller.send(sessionId, 'Do not type this', false))
      .rejects.toMatchObject({
        statusCode: 409,
        uncertainDelivery: false,
        message:
          'Copilot says this session is already in use by another client or application. Close or resume it there before sending here.',
      })
    expect(await readFile(output, 'utf8')).toBe(before)
  }, 15_000)

  async function clearFixture() {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-clear-test-'))
    directories.push(directory)
    const originalCwd = path.join(directory, 'original')
    const replacementCwd = path.join(directory, 'replacement')
    await mkdir(originalCwd)
    await mkdir(replacementCwd)
    const executable = path.join(directory, 'copilot-clear-fake')
    await writeFile(executable, `#!/usr/bin/env bash\n${shellReadyComposer}\nsleep 60\n`)
    await chmod(executable, 0o755)
    vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', '')
    vi.stubEnv('COPILOT_BIN', executable)
    vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot-home'))
    const controller = new TmuxTerminalSessionController()
    const sessionId = randomUUID()
    const location = await controller.create(sessionId, originalCwd, 'Original conversation', false, {
      model: 'original-model', contextTier: 'default', reasoningEffort: 'high', mode: 'plan',
    })
    const snapshot = async () => {
      const pid = Number((await execFileAsync('tmux', [
        'display-message', '-p', '-t', location.windowId, '#{pane_pid}',
      ])).stdout.trim())
      await waitForProcessCommand(pid, [executable])
      return {
        pid,
        command: (await readFile(`/proc/${pid}/cmdline`, 'utf8')).split('\0').filter(Boolean),
        cwd: await readlink(`/proc/${pid}/cwd`),
      }
    }
    return { controller, sessionId, replacementCwd, executable, snapshot, location }
  }

  it('restores the original terminal command and cwd when replacement commit rejects', async () => {
    const { controller, sessionId, replacementCwd, snapshot } = await clearFixture()
    const original = await snapshot()
    const replacementId = randomUUID()
    await expect(controller.reset(sessionId, replacementId, replacementCwd, {
      model: 'replacement-model', contextTier: 'long_context', reasoningEffort: 'low', mode: 'autopilot',
    }, async () => {
      expect(await controller.has(replacementId)).toBe(true)
      expect((await snapshot()).cwd).toBe(replacementCwd)
      throw new Error('Replacement write refused')
    })).rejects.toThrow('Replacement write refused')
    const restored = await snapshot()
    expect(restored.pid).not.toBe(original.pid)
    // A command started in a scope of its own runs by its absolute path:
    // systemd-run resolves the program before it execs it.
    const program = ([executable = '', ...rest]: string[]) => [path.basename(executable), ...rest]
    expect(program(restored.command)).toEqual(program(original.command))
    expect(restored.cwd).toBe(original.cwd)
    expect(await controller.has(sessionId)).toBe(true)
    expect(await controller.has(replacementId)).toBe(false)
  })

  it('reports both the rejected replacement and a failed terminal restoration', async () => {
    const { controller, sessionId, replacementCwd, location } = await clearFixture()
    const failure = new Error('Replacement write refused')
    await expect(controller.reset(sessionId, randomUUID(), replacementCwd, undefined, async () => {
      await execFileAsync('tmux', ['kill-pane', '-t', location.windowId])
      throw failure
    })).rejects.toMatchObject({
      name: 'AggregateError',
      errors: [failure, expect.any(Error)],
      message: 'Conversation clear failed and the original terminal session could not be restored',
    })
  }, 25_000)

  it.each([
    ['current', 0, false],
    ['current', 2400, false],
    ['current', 0, true],
    ['legacy', 0, false],
    ['clipped', 0, false],
    ['previous-send-clearing', 0, false],
    ['existing-draft', 0, false],
  ] as const)('handles %s paste rendering after %dms (queue=%s) without duplicate input', async (format, delay, enqueue) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'paste-receipt-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-paste.mjs')
    const output = path.join(directory, 'received.json')
    const sessionId = randomUUID()
    const content = format === 'legacy'
      ? 'legacy text '.repeat(100)
      : format === 'clipped'
        ? 'prefix-' + 'content-'.repeat(160) + '-distinct-tail'
        : Array.from({ length: 32 }, (_, index) => `line ${index}`).join('\n')
    await writeFile(output, '')
    await writeFile(executable, `
${fixtureReceiptWriter(output)}
let input = ''
let pasted
let enters = 0
function draw(text) {
  process.stdout.write('\\x1b[2J\\x1b[H╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\\r\\n┃ ' +
    text + '\\r\\n╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\\r\\n / commands')
}
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?2004h')
process.stdin.on('data', (data) => {
  input += data.toString()
  const end = input.indexOf('\\x1b[201~')
  if (pasted === undefined && end >= 0) {
    pasted = input.slice(input.indexOf('\\x1b[200~') + 6, end).replace(/\\r\\n?/g, '\\n')
    input = input.slice(end + 6)
    setTimeout(() => draw(${JSON.stringify(format)} === 'clipped'
      ? pasted.slice(-200)
      : ${JSON.stringify(format)} === 'legacy'
        ? '[Pasted text #1 +32 lines]'
        : '[Paste #1 - 32 lines]'), ${delay})
  }
  if (pasted !== undefined && /[\\r\\x11]/.test(input)) {
    enters += 1
    writeReceipt({ content: pasted, enters, queued: input.includes('\\x11') })
    input = ''
    draw('')
  }
})
draw(${JSON.stringify(format === 'existing-draft' ? '[Paste #1 - 32 lines][Paste #2 - 32 lines]' : format === 'previous-send-clearing' ? 'Previously submitted prompt' : '')})
if (${JSON.stringify(format)} === 'previous-send-clearing') setTimeout(() => draw(''), 200)
`)
    const tmuxSession = `agentic-paste-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session', '-d', '-s', tmuxSession,
      process.execPath, executable, '--session-id', sessionId,
    ])
    const panePid = (await execFileAsync('tmux', [
      'display-message', '-p', '-t', tmuxSession, '#{pane_pid}',
    ])).stdout.trim()
    await waitForProcessCommand(Number(panePid), [executable])
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(copilotHome, 'session-state', sessionId)
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(path.join(sessionDirectory, `inuse.${panePid}.lock`), `${panePid}\n`)
    vi.stubEnv('COPILOT_HOME', copilotHome)
    const controller = new TmuxTerminalSessionController()
    await eventually(() => controller.capture(sessionId), (pane) => Boolean(pane?.includes('╹')))
    if (format === 'existing-draft') {
      await expect(controller.send(sessionId, content, enqueue)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('already has unsent text'),
      })
      expect(await readFile(output, 'utf8')).toBe('')
      expect(await controller.capture(sessionId)).toContain('[Paste #1 - 32 lines][Paste #2 - 32 lines]')
    } else {
      expect(await controller.send(sessionId, content, enqueue)).toBe(true)
      const received = await eventually(() => readFile(output, 'utf8'), (text) => text.length > 0)
      expect(JSON.parse(received)).toEqual({ content, enters: 1, queued: enqueue })
    }
  }, 15_000)

  it.each([
    ['queued prompt', 'Continue after this turn', true, undefined, 'queue'],
    ['steering prompt', 'Refine the current turn', false, { allowDuringAgentExecution: true }, 'enter'],
    ['permitted slash command', '/usage', false, { allowDuringAgentExecution: true }, 'enter'],
  ] as const)('delivers a %s to a working composer exactly once', async (_name, content, enqueue, options, key) => {
    const { controller, sessionId, output } = await deliveryFixture(true)
    expect(await controller.inputReady(sessionId)).toBe(false)
    await expect(controller.send(sessionId, content, enqueue, options)).resolves.toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    expect(JSON.parse(received)).toEqual({ pastes: [content], submits: [key] })
  }, 15_000)

  it.each([
    ['ordinary message while working', readyComposer('', true), 'Do not interrupt', false, undefined],
    ['unapproved slash command while working', readyComposer('', true), '/model', false, undefined],
    ['an existing draft', readyComposer('unfinished draft', true), 'Queue this', true, undefined],
    ['an uncertain paste', readyComposer('[Paste #1 - 32 lines]', true), '/usage', false, { allowDuringAgentExecution: true }],
    ['a settings overlay', 'Settings\n↑/↓ navigate · enter edit · esc close', 'Queue this', true, undefined],
    ['a session-use confirmation', sessionInUsePane, '/usage', false, { allowDuringAgentExecution: true }],
    ['a folder-trust confirmation', folderTrustPane, 'Queue this', true, undefined],
    ['a structured form', 'Copilot needs information.\nWhich target?\nTarget:\n╭────────╮\n│        │\n╰────────╯\nenter accept · esc cancel', '/usage', false, { allowDuringAgentExecution: true }],
    ['a startup screen without a composer', 'Starting Copilot…', 'Queue this', true, undefined],
    ['a non-composer frame', '╭────────╮\n│        │\n╰────────╯', 'Queue this', true, undefined],
    ['an incomplete composer frame', '╻▄▄▄▄\n┃', 'Queue this', true, undefined],
    ['a replaced composer', `${readyComposer()}\nLoading a new view…`, '/usage', false, { allowDuringAgentExecution: true }],
    ['a footer with unrelated output', `${readyComposer()}\nFixture Model · High · 1.1M context (0%)\nLoading a different view...`, 'Must not be pasted', false, undefined],
    ['a change-summary footer over a working composer', `${readyComposer('', true)}\nChanges +12 -3`, 'Do not interrupt', false, undefined],
    ['a change-summary footer over an existing draft', `${readyComposer('unfinished draft')}\nChanges +12 -3`, 'Queue this', true, undefined],
    ['a change-summary footer over a settings overlay', `${readyComposer()}\nSettings\n↑/↓ navigate · enter edit · esc close\nChanges +12 -3`, 'Queue this', true, undefined],
    ['a change-summary footer over a session-use confirmation', `${sessionInUsePane}\nChanges +12 -3`, 'Do not consent', false, undefined],
    ['a change-summary footer over a folder-trust confirmation', `${folderTrustPane}\nChanges +12 -3`, 'Do not consent', false, undefined],
    ['a change-summary footer over a non-composer frame', '╭────────╮\n│        │\n╰────────╯\nChanges +12 -3', 'Queue this', true, undefined],
    ['working hints without a composer', 'Working\nesc interrupt', 'Queue this', true, undefined],
  ] as const)('does not paste into %s after a previously ready send', async (_name, pane, content, enqueue, options) => {
    const { controller, sessionId, output } = await deliveryFixture(false, pane)
    await expect(controller.send(sessionId, 'Warmup', true)).resolves.toBe(true)
    await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    const before = await readFile(output, 'utf8')
    const captured = await controller.capture(sessionId)
    await expect(controller.send(sessionId, content, enqueue, options))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(await readFile(output, 'utf8')).toBe(before)
    expect(await controller.capture(sessionId)).toBe(captured)
  }, 15_000)

  it('rechecks the composer after awaited owner validation', async () => {
    const overlay = 'Settings\n↑/↓ navigate · enter edit · esc close'
    const { controller, sessionId, output, tmuxSession } = await deliveryFixture(false, undefined, overlay)
    await controller.send(sessionId, 'Warmup', true)
    await eventually(() => readFile(output, 'utf8'), (value) =>
      Boolean(value && JSON.parse(value).submits.length))
    const before = await readFile(output, 'utf8')
    const internals = controller as unknown as {
      owner(id: string, target?: string, refresh?: boolean): Promise<{ pid: number; target: string } | undefined>
    }
    const original = internals.owner.bind(controller)
    let repainted = false
    vi.spyOn(internals, 'owner').mockImplementation(async (id, target, refresh) => {
      const owner = await original(id, target, refresh)
      if (refresh && !repainted) {
        repainted = true
        await execFileAsync('tmux', ['send-keys', '-t', tmuxSession, 'C-]'])
        await eventually(
          async () => (await execFileAsync('tmux', ['capture-pane', '-p', '-t', tmuxSession])).stdout,
          (pane) => pane.includes('Settings'),
        )
      }
      return owner
    })
    await expect(controller.sendWhenIdle(sessionId, 'Must not reach the overlay'))
      .rejects.toMatchObject({
        statusCode: 409,
        uncertainDelivery: false,
        reasonCode: 'terminal-not-ready.queue',
      })
    expect(repainted).toBe(true)
    expect(await readFile(output, 'utf8')).toBe(before)
  }, 15_000)

  it('classifies a cached-owner overlay as retryable for idle-only delivery', async () => {
    const overlay = 'Settings\n↑/↓ navigate · enter edit · esc close'
    const { controller, sessionId, output } = await deliveryFixture(false, overlay)
    await controller.send(sessionId, 'Warmup', true)
    await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    const before = await readFile(output, 'utf8')

    await expect(controller.sendWhenIdle(sessionId, 'Wait behind the overlay'))
      .rejects.toMatchObject({
        statusCode: 409,
        uncertainDelivery: false,
        reasonCode: 'terminal-not-ready.queue',
      })
    expect(await readFile(output, 'utf8')).toBe(before)
  }, 15_000)

  it('classifies a startup overlay as retryable for idle-only delivery', async () => {
    const overlay = 'Settings\n↑/↓ navigate · enter edit · esc close'
    const { controller, sessionId, output } = await deliveryFixture(
      false, undefined, undefined, overlay,
    )

    await expect(controller.sendWhenIdle(sessionId, 'Wait for startup overlay'))
      .rejects.toMatchObject({
        statusCode: 409,
        uncertainDelivery: false,
        reasonCode: 'terminal-not-ready.queue',
      })
    expect(await readFile(output, 'utf8')).toBe('')
  }, 15_000)

  it('classifies work starting after readiness but before idle-only paste as retryable', async () => {
    const { controller, sessionId, output, panePid } = await deliveryFixture(false)
    await controller.send(sessionId, 'Warmup', true)
    await eventually(
      () => readFile(output, 'utf8'),
      (value) => Boolean(value && JSON.parse(value).submits.length),
    )
    const before = await readFile(output, 'utf8')
    const owner = controller['owner'].bind(controller)
    let started = false
    controller['owner'] = async (...args: Parameters<typeof owner>) => {
      const current = await owner(...args)
      if (!started && args[2] === true) {
        started = true
        process.kill(Number(panePid), 'SIGXCPU')
        await eventually(
          () => controller.capture(sessionId),
          (pane) => isTerminalAgentWorking(pane || ''),
        )
      }
      return current
    }

    await expect(controller.sendWhenIdle(sessionId, 'Keep this queued'))
      .rejects.toMatchObject({
        statusCode: 409,
        uncertainDelivery: false,
        reasonCode: 'terminal-not-ready.queue',
      })
    expect(started).toBe(true)
    expect(await readFile(output, 'utf8')).toBe(before)
  }, 15_000)

  it('reports a lost paste acknowledgement as uncertain and does not paste again', async () => {
    const { controller, sessionId, output, directory } = await deliveryFixture(false)
    const realTmux = (await execFileAsync('sh', ['-c', 'command -v tmux'])).stdout.trim()
    const bin = path.join(directory, 'bin')
    await mkdir(bin)
    const wrapper = path.join(bin, 'tmux')
    await writeFile(wrapper, [
      '#!/usr/bin/env bash',
      '"$REAL_TMUX" "$@" || exit "$?"',
      'if [[ "$1" == paste-buffer ]]; then echo "acknowledgement lost after paste" >&2; exit 1; fi',
    ].join('\n'))
    await chmod(wrapper, 0o755)
    vi.stubEnv('REAL_TMUX', realTmux)
    vi.stubEnv('PATH', `${bin}:${process.env.PATH}`)
    await expect(controller.send(sessionId, 'One possibly delivered paste', false))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: true })
    const received = await eventually(() => readFile(output, 'utf8'), (value) => value.length > 0)
    expect(JSON.parse(received)).toEqual({ pastes: ['One possibly delivered paste'], submits: [] })
    await expect(controller.send(sessionId, 'Do not append a duplicate', false))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(await readFile(output, 'utf8')).toBe(received)
  }, 15_000)

  it('exposes session-use warnings without approving a concurrent takeover', () => {
    const permission = parseTerminalPermission(sessionInUsePane)
    expect(permission).toMatchObject({
      title: expect.stringContaining('may conflict'),
      choiceCount: 2,
      options: [
        { optionId: 'terminal:allow', name: 'Resume anyway', kind: 'allow_once' },
        { optionId: 'terminal:stop', name: 'Go back', kind: 'reject_once' },
      ],
    })
    expect(isTerminalSessionInUsePrompt(sessionInUsePane)).toBe(true)
    expect(parseTerminalPermission(sessionInUsePane
      .replace('just now', 'a minute ago')
      .replace('❯ 1.', '  1.')
      .replace('  2.', '❯ 2.'))?.requestId).toBe(permission?.requestId)
    expect(parseTerminalPermission(
      sessionInUsePane.replace('1. Resume anyway', '1. Delete session'),
    )).toBeUndefined()
  })

  it('ignores a prior session-use confirmation above the active composer', () => {
    const pane = [
      sessionInUsePane,
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '┃ Unsaved draft',
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' ← open sidebar · / commands · tab next tab',
    ].join('\n')
    expect(isTerminalSessionInUsePrompt(pane)).toBe(false)
    expect(parseTerminalPermission(pane)).toBeUndefined()
    expect(isTerminalOverlay(pane)).toBe(false)
  })

  it.each(['terminal:allow', 'terminal:stop'])(
    'delivers only the explicit %s decision to the session-use confirmation',
    async (optionId) => {
      const directory = await mkdtemp(path.join(tmpdir(), 'session-use-test-'))
      directories.push(directory)
      const executable = path.join(directory, 'copilot-confirm.mjs')
      const output = path.join(directory, 'decision.json')
      const sessionId = randomUUID()
      await writeFile(output, '')
      await writeFile(executable, `
${fixtureReceiptWriter(output)}
let selected = 1
let pending = ''
function finish(decision) {
  writeReceipt({ decision })
  process.stdout.write('\\x1b[2J\\x1b[HReady\\r\\n╻▄▄▄▄▄▄▄▄\\r\\n┃\\r\\n╹▀▀▀▀▀▀▀▀\\r\\n / commands')
}
process.stdin.setRawMode(true)
process.stdin.on('data', (data) => {
  pending += data.toString()
  while (pending) {
    if (pending[0] === '\\x1b') {
      if (pending.length < 3) {
        setTimeout(() => {
          if (pending === '\\x1b') { pending = ''; finish('back') }
        }, 25)
        return
      }
      selected = pending[2] === 'A' ? Math.max(0, selected - 1) : Math.min(1, selected + 1)
      pending = pending.slice(3)
    } else if (pending[0] === '\\r' || pending[0] === '\\n') {
      pending = pending.slice(1)
      finish(selected === 0 ? 'resume' : 'back')
    } else {
      finish('unexpected text')
      pending = ''
    }
  }
})
process.stdout.write(${JSON.stringify(sessionInUsePane.replace('❯ 1.', '  1.').replace('  2.', '❯ 2.'))}.replaceAll('\\n', '\\r\\n'))
`)
      const tmuxSession = `agentic-session-use-${process.pid}`
      tmuxSessions.push(tmuxSession)
      await execFileAsync('tmux', [
        'new-session', '-d', '-s', tmuxSession,
        process.execPath, executable, '--session-id', sessionId,
      ])
      const panePid = (await execFileAsync('tmux', [
        'display-message', '-p', '-t', tmuxSession, '#{pane_pid}',
      ])).stdout.trim()
      await waitForProcessCommand(Number(panePid), [executable])
      const copilotHome = path.join(directory, 'copilot-home')
      const sessionDirectory = path.join(copilotHome, 'session-state', sessionId)
      await mkdir(sessionDirectory, { recursive: true })
      await writeFile(path.join(sessionDirectory, `inuse.${panePid}.lock`), `${panePid}\n`)
      vi.stubEnv('COPILOT_HOME', copilotHome)
      const controller = new TmuxTerminalSessionController()
      const request = await eventually(
        () => controller.pendingPermission(sessionId),
        (value) => Boolean(value),
      )
      if (!request) throw new Error('Session-use prompt was not detected')
      await expect(controller.send(sessionId, 'Do not paste this', false))
        .rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('confirmation') })
      expect(await readFile(output, 'utf8')).toBe('')
      await expect(controller.replyPermission(
        sessionId, { ...request, requestId: 'stale-request' }, optionId,
      )).rejects.toThrow('no longer active')
      expect(await readFile(output, 'utf8')).toBe('')

      expect(await controller.replyPermission(sessionId, request, optionId)).toBe(true)
      const decision = await eventually(() => readFile(output, 'utf8'), (text) => text.length > 0)
      expect(JSON.parse(decision)).toEqual({
        decision: optionId === 'terminal:allow' ? 'resume' : 'back',
      })
      expect(isTerminalSessionInUsePrompt(await controller.capture(sessionId) || '')).toBe(false)
    },
  )

  it('exposes the folder-trust prompt as an explicit one-session permission', () => {
    const permission = parseTerminalPermission(folderTrustPane)
    expect(permission).toMatchObject({
      title: 'Trust folder for this session: /work/checkout',
      kind: 'terminal',
      choiceCount: 3,
      options: [
        { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
        { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
      ],
    })
    expect(isTerminalOverlay(folderTrustPane)).toBe(true)
    expect(parseTerminalPermission(
      folderTrustPane.replace('❯ 1.', '  1.').replace('  2.', '❯ 2.'),
    )?.requestId).toBe(permission?.requestId)
    expect(parseTerminalPermission(
      folderTrustPane.replace('/work/checkout', '/work/other'),
    )?.requestId).not.toBe(permission?.requestId)
  })

  it('does not trust a changed option layout or a folder prompt in scrollback', () => {
    expect(parseTerminalPermission(
      folderTrustPane.replace('1. Yes', '1. Yes, permanently'),
    )).toBeUndefined()
    expect(parseTerminalPermission([
      folderTrustPane,
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '┃',
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' ← open sidebar · / commands · tab next tab',
    ].join('\n'))).toBeUndefined()
  })

  it.each(['accept', 'cancel', 'decline'] as const)(
    '%s a wrapped boolean question in its own pane without accepting the default',
    async (action) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-form-test-'))
    directories.push(directory)
    const output = path.join(directory, 'answer.json')
    const executable = path.join(directory, 'copilot-form.mjs')
    const sessionId = randomUUID()
    const question =
      'The repository clone is waiting in the credential manager for authentication. ' +
      'Please complete the sign-in prompt so the clone can continue.'
    const field = 'Repository authentication completed'
    const pane = [
      ' Copilot needs information.',
      ' The repository clone is waiting in the credential manager for authentication. Please complete the sign-in',
      ' prompt so the clone can continue.',
      '',
      ` ${field}:`,
      ' Confirm after completing the sign-in window.',
    ]
    await writeFile(output, '')
    await writeFile(executable, `
${fixtureReceiptWriter(output)}
let selected = 0
let pending = ''
function finish(action) {
  writeReceipt(action === 'accept' ? { accepted: selected === 0 } : { action })
  process.stdout.write('\\x1b[2J\\x1b[HFinished\\r\\n╻▄▄▄▄▄▄▄▄\\r\\n┃\\r\\n╹▀▀▀▀▀▀▀▀\\r\\n / commands')
}
function draw() {
  process.stdout.write('\\x1b[2J\\x1b[H' + [
    ...${JSON.stringify(pane)},
    ...['Yes', 'No', 'Other (type your answer)'].map((label, index) =>
      (index === selected ? ' ❯ ' : '   ') + label),
    '',
    ' ↑/↓ select · enter accept · ctrl+d decline · esc cancel',
  ].join('\\r\\n'))
}
process.stdin.setRawMode(true)
process.stdin.on('data', (data) => {
  pending += data.toString()
  while (pending) {
    if (pending[0] === '\\x1b') {
      if (pending.length < 3) {
        setTimeout(() => {
          if (pending === '\\x1b') {
            pending = ''
            finish('cancel')
          }
        }, 25)
        return
      }
      selected = pending[2] === 'A' ? Math.max(0, selected - 1) : Math.min(2, selected + 1)
      pending = pending.slice(3)
      draw()
    } else if (pending[0] === '\\r' || pending[0] === '\\n') {
      pending = pending.slice(1)
      finish('accept')
    } else if (pending[0] === '\\x04') {
      pending = pending.slice(1)
      finish('decline')
    } else {
      throw new Error('Unexpected input into form')
    }
  }
})
draw()
`)
    const tmuxSession = `agentic-form-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session', '-d', '-s', tmuxSession,
      process.execPath, executable, '--session-id', sessionId,
    ])
    const panePid = (
      await execFileAsync('tmux', [
        'display-message', '-p', '-t', tmuxSession, '#{pane_pid}',
      ])
    ).stdout.trim()
    await waitForProcessCommand(Number(panePid), [executable])
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(copilotHome, 'session-state', sessionId)
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(path.join(sessionDirectory, `inuse.${panePid}.lock`), `${panePid}\n`)
    vi.stubEnv('COPILOT_HOME', copilotHome)
    const controller = new TmuxTerminalSessionController()
    const identity = { question, fields: [field] }
    expect(await eventually(
      () => controller.capture(sessionId),
      (captured) => Boolean(captured && terminalFormShowsFields(captured, identity)),
    )).toContain('Copilot needs information.')

    const steps = [{ kind: 'select' as const, optionCount: 3, index: 1 }]
    expect(await controller.fillUserInputForm(sessionId, steps, {
      ...identity, question: 'An unrelated request',
    })).toBe(false)
    expect(await controller.dismissUserInput(sessionId, {
      ...identity, question: 'An unrelated request',
    })).toBe(false)
    expect(await readFile(output, 'utf8')).toBe('')
    if (action === 'accept') {
      expect(await controller.fillUserInputForm(sessionId, steps, identity)).toBe(true)
    } else {
      expect(await controller.dismissUserInput(sessionId, identity, action)).toBe(true)
    }
    const answer = await eventually(() => readFile(output, 'utf8'), (text) => text.length > 0)
    expect(JSON.parse(answer)).toEqual(action === 'accept' ? { accepted: false } : { action })
    expect(parseTerminalFormPrompt(await controller.capture(sessionId) || '')).toBe(false)
    },
  )

  it('detects the Copilot session-in-use startup dialog', () => {
    expect(
      isTerminalSessionInUsePrompt(`
╭────────────────────────────────────────────────────────────╮
│ Session in use
│ This session appears to be in use by another CLI or application.
│ ❯ 1. Resume anyway
│   2. Go back (Esc)
│ ↑/↓ to navigate · enter to select · esc to cancel
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBe(true)
    expect(
      isTerminalSessionInUsePrompt(`
╭────────────────────────────────────╮
│ Session in use                     │
│ ❯ 1. Resume anyway                 │
│   2. Go back (Esc)                 │
│ ↑/↓ to navigate · enter to         │
│ select · esc to cancel             │
╰────────────────────────────────────╯
      `),
    ).toBe(true)
    expect(isTerminalSessionInUsePrompt('❯ Ready for a prompt')).toBe(false)
    expect(
      isTerminalSessionInUsePrompt(`
● The old panel said Session in use.
● It offered 1. Resume anyway and 2. Go back.
╻▄▄▄▄
┃
╹▀▀▀▀
      `),
    ).toBe(false)
    expect(
      isTerminalSessionInUsePrompt(`
╭────────────────────────────────────────────────────────────╮
│ > Session in use                                           │
│ This session appears to be in use by another CLI.          │
│ 1. Resume anyway                                           │
│ 2. Go back                                                  │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalSessionInUsePrompt(`
╭────────────────────────────────────────────────────────────╮
│ >                                                          │
│ Session in use                                             │
│ 1. Resume anyway                                           │
│ 2. Go back                                                  │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalSessionInUsePrompt(`
╭────────────────────────────────────────────────────────────╮
│ Session in use                                             │
│ This session appears to be in use by another CLI.          │
│ 1. Resume anyway                                           │
│ 2. Go back                                                  │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalSessionInUsePrompt(`
╭────────────────────────────────────────────────────────────╮
│ Run session recovery                                      │
│ ────────────────────────────────────────────────────────── │
│ Session in use                                             │
│ ❯ 1. Resume anyway                                        │
│   2. Go back                                               │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
│ ────────────────────────────────────────────────────────── │
│ Do you want to run this                                    │
│ command?                                                   │
│ ❯ 1. Yes                                                   │
│   2. No, and tell Copilot what to do differently           │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalSessionInUsePrompt(`
● The old panel said Session in use.
● It offered 1. Resume anyway and 2. Go back.
╭────
│
╰────
      `),
    ).toBe(false)
  })

  it('detects only active passive session-use warnings', () => {
    expect(isTerminalSessionInUseConflict(passiveSessionInUsePane)).toBe(true)
    expect(isTerminalSessionInUsePrompt(passiveSessionInUsePane)).toBe(false)
    expect(isTerminalSessionInUseConflict(
      passiveSessionInUsePane.replace(
        ' IDE auto-connect skipped: session is already in use by another client\n',
        '',
      ),
    )).toBe(true)
    expect(isTerminalSessionInUseConflict(
      passiveSessionInUsePane.replace(
        ' This session may already be in use by another CLI or application.',
        ' This session may already be in use by another CLI\n or application.',
      ),
    )).toBe(true)
    expect(parseTerminalPermission(passiveSessionInUsePane)).toBeUndefined()
    expect(isTerminalSessionInUseConflict([
      '● IDE auto-connect skipped: session is already in use by another client',
      '● This session may already be in use by another CLI or application.',
      readyComposer(),
    ].join('\n'))).toBe(false)
  })

  it('detects the Copilot desktop-app startup promotion', () => {
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
│ THE GITHUB COPILOT APP                         │
│ Now generally available!                       │
│ Install it now?                               │
│ ❯ Yes, install      No, thanks                │
│ ←/→ to choose · Enter to select · Y / N       │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(true)
    expect(
      isTerminalDesktopInstallPrompt(`
╭────────────────────────────────────╮
│ THE GITHUB COPILOT APP             │
│ Now generally available!           │
│ Install it now?                    │
│ ❯ Yes, install      No, thanks     │
│ ←/→ to choose · Enter to           │
│ select · Y / N                     │
╰────────────────────────────────────╯
      `),
    ).toBe(true)
    // Both choices share a row, so the marker sits mid-line when the second
    // one is selected. Anchoring it to the start of the line refused a panel
    // that was really being shown, and startup then timed out.
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
│ THE GITHUB COPILOT APP                         │
│ Now generally available!                       │
│ Install it now?                               │
│ Yes, install    ❯ No, thanks                  │
│ ←/→ to choose · Enter to select · Y / N       │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(true)
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
│ THE GITHUB COPILOT APP                         │
│ Now generally available!                       │
│ Install it now?                               │
│ Yes, install      ❯ No, thanks                │
│ ←/→ to choose · Enter to select · Y / N       │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(true)
    expect(
      isTerminalDesktopInstallPrompt('❯ Ready for a prompt'),
    ).toBe(false)
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
┃ THE GITHUB COPILOT APP
┃ Now generally available!
┃ Install it now?
┃ ❯ Yes, install      No, thanks
┃ ←/→ to choose · Enter to select · Y / N
╰───────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      parseTerminalUserInput(`
╭───────────────────────────────────────────────╮
┃ Question
┃ Which environment?
┃ ❯ 1. Production
┃   2. Development
┃ ↑/↓ to select · enter to confirm · esc cancel
╰───────────────────────────────────────────────╯
      `),
    ).toBeUndefined()
    expect(
      parseTerminalUserInput(`
╭─────────────────────────────────────────────────╮
│ ╭─────────────────────────────────────────────╮ │
│ │ Question                                    │ │
│ │ Which environment?                          │ │
│ │ ❯ 1. Production                             │ │
│ │   2. Development                            │ │
│ │ ↑/↓ to select · enter to confirm · esc cancel│ │
│ ╰─────────────────────────────────────────────╯ │
╰─────────────────────────────────────────────────╯
      `),
    ).toBeUndefined()
    expect(
      parseTerminalPermission(`
╭─────────────────────────────────────────────────╮
│ ╭─────────────────────────────────────────────╮ │
│ │ Confirm folder trust                        │ │
│ │ Do you trust the files in this              │ │
│ │ folder?                                     │ │
│ │ ❯ 1. Yes                                    │ │
│ │   2. Yes, and remember this folder for      │ │
│ │      future sessions                        │ │
│ │   3. No (Esc)                               │ │
│ │ ↑/↓ to navigate · enter to select · esc to  │ │
│ │ cancel                                      │ │
│ ╰─────────────────────────────────────────────╯ │
╰─────────────────────────────────────────────────╯
      `),
    ).toBeUndefined()
    // The composer draws itself as a frame too, and what is typed in it can be
    // anything -- this panel's own words among them, pasted or recalled. It is
    // drawn without a prompt marker while it holds no caret, which is exactly
    // when it looked most like the panel. Answering it would send Enter or `n`
    // into somebody's draft.
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
│ THE GITHUB COPILOT APP                         │
│ Now generally available!                       │
│ Install it now?                               │
│ Yes, install      No, thanks                  │
│ ←/→ to choose · Enter to select · Y / N       │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalDesktopInstallPrompt(`
╭─────────────────────────────────────────────────╮
│ ╭─────────────────────────────────────────────╮ │
│ │ THE GITHUB COPILOT APP                      │ │
│ │ Now generally available!                    │ │
│ │ Install it now?                             │ │
│ │ ❯ Yes, install      No, thanks              │ │
│ │ ←/→ to choose · Enter to select · Y / N     │ │
│ │ esc to cancel                               │ │
│ ╰─────────────────────────────────────────────╯ │
╰─────────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
│ > THE GITHUB COPILOT APP                      │
│ Install it now?                               │
│ Yes, install · No, thanks · Y / N             │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
│ THE GITHUB COPILOT APP                         │
│ Install it now?                               │
│ Yes, install · No, thanks · Y / N             │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalDesktopInstallPrompt(`
╭───────────────────────────────────────────────╮
│ Settings                                      │
│ Search: Install it now? Yes, install No,      │
│ thanks Y / N                                  │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(false)
    expect(
      isTerminalDesktopInstallPrompt(`
● Earlier output: THE GITHUB COPILOT APP
╭───────────────────────────────────────────────╮
│ Settings: Install it now?                     │
│ Yes, install · No, thanks · Y / N             │
╰───────────────────────────────────────────────╯
      `),
    ).toBe(false)
  })

  it('parses Copilot ask-user choice and freeform dialogs', () => {
    expect(
      parseTerminalUserInput(`
╭────────────────────────────────────────────────╮
│ Question                                      │
│ ────────────────────────────────────────────  │
│ Which environment do you prefer?              │
│                                               │
│ ❯ 1. Production                               │
│   2. Staging                                  │
│   3. Other (type your answer)                 │
│                                               │
│ ↑/↓ to select · enter to confirm · esc cancel │
╰────────────────────────────────────────────────╯
      `),
    ).toMatchObject({
      question: 'Which environment do you prefer?',
      choices: ['Production', 'Staging'],
      allowFreeform: true,
    })

    expect(
      parseTerminalUserInput(`
╭────────────────────────────────────╮
│ Question                         │
│ Which package group?             │
│ ❯ 1. Standard                    │
│   2. Other package managers      │
│ ↑/↓ to select · enter to confirm │
╰────────────────────────────────────╯
      `),
    ).toMatchObject({
      choices: ['Standard', 'Other package managers'],
      allowFreeform: false,
    })
    expect(
      parseTerminalUserInput(`
╭──────────────────────────────────────╮
│ Question                           │
│ Describe your deployment plan.     │
│                                    │
│ ❯ Type your answer...              │
│                                    │
│ enter to submit · esc to cancel    │
╰──────────────────────────────────────╯
      `),
    ).toMatchObject({
      question: 'Describe your deployment plan.',
      choices: [],
      allowFreeform: true,
    })
    expect(
      parseTerminalUserInput(`
╭──────────────────────────────────────╮
│ Question                             │
│ Old question?                        │
│ 1. Yes                               │
│ enter to confirm · esc to cancel     │
╰──────────────────────────────────────╯
╻▄▄▄▄
┃
╹▀▀▀▀
      `),
    ).toBeUndefined()
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
╭────────────────────────────────────────────────────────────╮
│ Run stale diagnostics                                      │
│ ────────────────────────────────────────────────────────── │
│ printf 'stale'                                             │
│ Do you want to run this command?                           │
│ ❯ 1. Yes                                                   │
│   2. No, and tell Copilot what to do differently           │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
╻▄▄▄▄
┃
╹▀▀▀▀
      `),
    ).toBeUndefined()
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Confirm folder trust                                       │
│ Do you trust the files in this folder?                     │
│ 1. Yes                                                     │
│ 2. Yes, and remember this folder for future sessions       │
│ 3. No (Esc)                                                │
╰────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────────────────────╮
│ Settings                                                   │
│ esc close                                                  │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBeUndefined()
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Confirm folder trust                                       │
│ Do you trust the files in this folder?                     │
│ ❯ 1. Yes                                                   │
│   2. Yes, and remember this folder for future sessions     │
│   3. No (Esc)                                              │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────────────────────╮
│ Run diagnostics                                            │
│ ────────────────────────────────────────────────────────── │
│ printf 'ready'                                             │
│ Do you want to run this command?                           │
│ ❯ 1. Yes                                                   │
│   2. No, and tell Copilot what to do differently           │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toMatchObject({ kind: 'terminal', title: 'Run diagnostics' })
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Run copied trust text                                      │
│ Confirm folder trust                                       │
│ Do you trust the files in this folder?                     │
│ 1. Yes                                                     │
│ 2. Yes, and remember this folder for future sessions       │
│ 3. No (Esc)                                                │
│ Do you want to run this command?                           │
│ 1. Yes                                                     │
│ 2. No                                                      │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBeUndefined()
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Confirm folder trust                                       │
│ Do you trust the files in this folder?                     │
│ 1. Yes                                                     │
│ 2. Yes, and remember this folder for future sessions       │
│ 3. No (Esc)                                                │
╰────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────────────────────╮
│ Do you trust the files in this folder?                     │
│ Unrelated recovery view                                    │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBeUndefined()
    expect(
      parseTerminalPermission(`
● Earlier output quoted:
  Confirm folder trust
  Do you trust the files in this folder?
  1. Yes
  2. Yes, and remember this folder for future sessions
  3. No (Esc)
╭────
│
╰────
      `),
    ).toBeUndefined()
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Confirm folder trust                                       │
│ /home/user/project                                         │
│ ────────────────────────────────────────────────────────── │
│ Do you trust the files in this                             │
│ folder?                                                    │
│ ❯ 1. Yes                                                   │
│   2. Yes, and remember this folder for                     │
│      future sessions                                       │
│   3. No (Esc)                                              │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toMatchObject({
      kind: 'terminal',
      options: [
        { optionId: 'terminal:allow' },
        { optionId: 'terminal:stop' },
      ],
    })
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────╮
│ Confirm folder trust               │
│ /work/checkout                     │
│ ────────────────────────────────── │
│ Do you trust the files in this     │
│ folder?                            │
│ ❯ 1. Yes                           │
│   2. Yes, and remember this folder │
│      for future sessions           │
│   3. No (Esc)                      │
│ ↑/↓ to navigate · enter to         │
│ select · esc to cancel             │
╰────────────────────────────────────╯
      `),
    ).toMatchObject({ kind: 'terminal', title: 'Trust folder for this session: /work/checkout' })
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
    // A command permission frame can display any text at all, the command's
    // own included. One printing the trust dialog word for word would be
    // answered as trust, and "Trust once" would send Enter to whatever the
    // command dialog actually had selected. The command's own question wraps
    // like any other line, so it is looked for the same way.
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Run a script                                               │
│ ────────────────────────────────────────────────────────── │
│ Confirm folder trust                                       │
│ Do you trust the files in this folder?                     │
│ \u276F 1. Yes                                                   │
│   2. Yes, and remember this folder for future sessions     │
│   3. No (Esc)                                              │
│ ────────────────────────────────────────────────────────── │
│ Do you want to run this                                    │
│ command?                                                   │
│ \u276F 1. Yes                                                   │
│   2. Yes, and allow similar commands this session          │
│   3. No, and tell Copilot what to do differently           │
│ \u2191/\u2193 to navigate \u00B7 enter to select \u00B7 esc to cancel          │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toMatchObject({ kind: 'terminal', title: 'Run a script' })

    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Confirm folder trust                                       │
│ ────────────────────────────────────────────────────────── │
│ ╭────────────────────────────────────────────────────────╮ │
│ │ /home/user/project                                     │ │
│ ╰────────────────────────────────────────────────────────╯ │
│                                                            │
│ Do you trust the files in this folder?                     │
│                                                            │
│ ❯ 1. Yes                                                   │
│   2. Yes, and remember this folder for future sessions     │
│   3. No (Esc)                                              │
│                                                            │
│ ↑/↓ to navigate · enter to select · esc to cancel          │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toMatchObject({
      requestId: expect.stringMatching(/^terminal-permission:/),
      title: 'Trust folder for this session: /home/user/project',
      kind: 'terminal',
      choiceCount: 3,
      options: [
        {
          optionId: 'terminal:allow',
          name: 'Trust for this session',
          kind: 'allow_once',
        },
        {
          optionId: 'terminal:stop',
          name: 'Stop',
          kind: 'reject_once',
        },
      ],
    })
    expect(
      parseTerminalPermission(`
╭────────────────────────────────────────────────────────────╮
│ Confirm folder trust                                       │
│ Do you trust the files in this folder?                     │
│ 1. Yes                                                     │
│ 2. Yes, and remember this folder for future sessions       │
│ 3. No (Esc)                                                │
╰────────────────────────────────────────────────────────────╯
      `),
    ).toBeUndefined()
  })

  it('creates a Copilot window in the configured existing tmux session', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const output = path.join(directory, 'cwd.txt')
    const executable = path.join(directory, 'copilot-window-fake')
    await writeFile(
      executable,
      `#!/usr/bin/env bash\nprintf '%s' "$PWD" >"${output}"\nprintf '╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'\nsleep 60\n`,
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
        model: 'fixture-boot',
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
    const initialCommandLine = await eventually(
      async () =>
        (await readFile(`/proc/${initialPanePid}/cmdline`, 'utf8'))
          .replaceAll('\0', ' ')
          .trim(),
      (line) => line.includes('--model fixture-boot'),
    )
    // Copilot draws its composer with half-block glyphs only when the
    // terminal advertises truecolor, and that frame is what says the composer
    // is live. A window inheriting no COLORTERM showed plain rules instead and
    // never looked ready. This holds the invariant the window must satisfy; on
    // a host that exports COLORTERM itself the pane would inherit one anyway,
    // so it is the hosts that do not which this protects.
    expect(
      (await readFile(`/proc/${initialPanePid}/environ`, 'utf8')).split('\0'),
    ).toContain('COLORTERM=truecolor')
    expect(initialCommandLine).toContain('--model fixture-boot')
    expect(initialCommandLine).toContain('--effort medium')
    expect(initialCommandLine).toContain('--context default')
    expect(initialCommandLine).toContain('--mode plan')
    expect(await controller.rename(sessionId, 'Renamed project')).toBe(true)
    expect(
      await controller.configure(sessionId, directory, {
        model: 'fixture-test',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      }),
    ).toBe(true)

    expect(location.sessionName).toBe(tmuxSession)
    expect(
      await eventually(
        () => readFile(output, 'utf8'),
        (written) => written === directory,
      ),
    ).toBe(directory)
    const windows = await eventually(
      async () =>
        (
          await execFileAsync('tmux', [
            'list-windows',
            '-t',
            tmuxSession,
            '-F',
            '#{window_name}',
          ])
        ).stdout,
      (names) => names.includes('Renamed project'),
    )
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
    expect(commandLine).toContain('--model fixture-test')
    expect(commandLine).toContain('--effort high')
    expect(commandLine).toContain('--context long_context')
    expect(commandLine).toContain('--mode autopilot')
    await expect(
      controller.configure(sessionId, path.join(directory, 'missing'), {
        model: 'fixture-broken',
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
          model: 'fixture-test',
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
  }, 20_000)

  it('starts a relaunched Copilot only after the one it replaces has exited', async () => {
    // Copilot holds its session until it has finished shutting down, and one
    // started on a session still held asks whether to resume a session "in
    // use by another CLI or application". A relaunch that started the new
    // Copilot as it hung up on the old one asked that about its own
    // predecessor, and the session sat waiting on a card nobody expected.
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const events = path.join(directory, 'events.log')
    const executable = path.join(directory, 'copilot-slow-exit')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        `log="${events}"`,
        'echo "start $$" >>"$log"',
        'finish() { kill "$child" 2>/dev/null; sleep 1; echo "exit $$" >>"$log"; exit 0; }',
        'trap finish HUP TERM',
        "printf '╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'",
        'sleep 60 & child=$!',
        'wait "$child"',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `relaunch-order-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', ['new-session', '-d', '-s', tmuxSession, 'sleep', '60'])
    vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', tmuxSession)
    vi.stubEnv('COPILOT_BIN', executable)
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    await execFileAsync('tmux', ['set-environment', '-t', tmuxSession, 'COPILOT_HOME', copilotHome])
    const sessionId = randomUUID()
    const controller = new TmuxTerminalSessionController()
    await controller.create(sessionId, directory, 'Relaunch order', true)
    const lines = (count: number) =>
      eventually(
        async () => (await readFile(events, 'utf8').catch(() => '')).trim().split('\n'),
        (read) => read.length >= count,
      )
    const [first] = await lines(1)

    expect(await controller.restart(sessionId, directory)).toBe(true)
    const restarted = await lines(3)
    expect(restarted.slice(0, 2)).toEqual([first, `exit ${first.split(' ')[1]}`])
    expect(restarted[2]).toMatch(/^start \d+$/)

    expect(
      await controller.configure(sessionId, directory, {
        model: 'fixture-next',
        reasoningEffort: 'high',
        contextTier: 'default',
        mode: 'interactive',
      }),
    ).toBe(true)
    const configured = await lines(5)
    expect(configured[3]).toBe(`exit ${restarted[2].split(' ')[1]}`)
    expect(configured[4]).toMatch(/^start \d+$/)
  }, 30_000)

  it('reopens a saved Copilot session with explicit resume semantics', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-resume-fake')
    await writeFile(
      executable,
      "#!/usr/bin/env bash\nprintf '╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'\nsleep 60\n",
    )
    await chmod(executable, 0o755)
    const tmuxSession = `resume-${process.pid}`
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
    const sessionId = randomUUID()

    const controller = new TmuxTerminalSessionController()
    const location = await controller.reopen(
      sessionId,
      directory,
      'Saved conversation',
      true,
      {
        model: 'fixture-resume',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      },
    )
    const panePid = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        location.windowId,
        '#{pane_pid}',
      ])
    ).stdout.trim()
    const commandLine = await eventually(
      async () =>
        (await readFile(`/proc/${panePid}/cmdline`, 'utf8'))
          .replaceAll('\0', ' ')
          .trim(),
      (line) => line.includes(`--resume ${sessionId}`),
    )

    expect(commandLine).toContain(`--resume ${sessionId}`)
    expect(commandLine).not.toContain('--session-id')
    expect(commandLine).toContain('--model fixture-resume')
    expect(commandLine).toContain('--effort high')
    expect(commandLine).toContain('--context long_context')
    expect(commandLine).toContain('--mode autopilot')
  }, 20_000)

  it('reauthorizes the restored owner when reset fails', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const count = path.join(directory, 'starts.txt')
    const response = path.join(directory, 'response.txt')
    const executable = path.join(directory, 'copilot-reset-rollback')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        `starts=$(cat "${count}" 2>/dev/null || printf 0)`,
        'starts=$((starts + 1))',
        `printf '%s' "$starts" >"${count}"`,
        'if [[ "$starts" -eq 1 ]]; then',
        "  printf '╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'",
        '  sleep 60',
        'fi',
        "printf '╭───────────────────────────────────────────────╮\\nTHE GITHUB COPILOT APP\\nNow generally available!\\nInstall it now?\\n❯ Yes, install      No, thanks\\n←/→ to choose · Enter to select · Y / N\\n╰───────────────────────────────────────────────╯\\n'",
        'IFS= read -r -n 1 answer',
        `printf '%s' "$answer" >"${response}"`,
        "printf '\\033[2J\\033[H╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'",
        'sleep 60',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-reset-rollback-${process.pid}`
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
    await controller.create(sessionId, directory, 'Reset rollback', true)

    await expect(
      controller.reset(
        sessionId,
        randomUUID(),
        directory,
        undefined,
        async () => {
          throw new Error('state clear failed')
        },
      ),
    ).rejects.toThrow('state clear failed')
    await expect(
      controller.resolveStartupPrompt(sessionId),
    ).resolves.toBe(true)

    expect(await readFile(response, 'utf8')).toBe('n')
    // Two Copilot starts against a real tmux session, and a startup panel
    // answered after the second: more than the five seconds a test is given by
    // default, and it fails on time alone.
  }, 30_000)

  it('declines the desktop-app promotion before returning a new session', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const response = path.join(directory, 'response.txt')
    const executable = path.join(directory, 'copilot-promotion-fake')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        "printf '╭───────────────────────────────────────────────╮\\nTHE GITHUB COPILOT APP\\nNow generally available!\\nInstall it now?\\n❯ Yes, install      No, thanks\\n←/→ to choose · Enter to select · Y / N\\n╰───────────────────────────────────────────────╯\\n'",
        'IFS= read -r -n 1 answer',
        `printf '%s' "$answer" >"${response}"`,
        'sleep 0.5',
        "printf '\\033[2J\\033[H╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'",
        `if IFS= read -r -t 0.2 -n 1 extra; then printf '%s' "$extra" >"${response}.extra"; fi`,
        'sleep 60',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-promotion-${process.pid}`
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

    const controller = new TmuxTerminalSessionController()
    await controller.create(
      randomUUID(),
      directory,
      'Promotion prompt',
      true,
    )

    expect(await readFile(response, 'utf8')).toBe('n')
    expect(existsSync(`${response}.extra`)).toBe(false)
  })

  it('removes a newly created window when owner enumeration fails', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-owner-failure-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-window-fake')
    await writeFile(executable, '#!/usr/bin/env bash\nsleep 60\n')
    await chmod(executable, 0o755)
    const ps = path.join(directory, 'ps')
    await writeFile(ps, '#!/usr/bin/env bash\nexit 19\n')
    await chmod(ps, 0o755)
    const tmuxSession = `owner-failure-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', ['new-session', '-d', '-s', tmuxSession, 'sleep', '60'])
    vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', tmuxSession)
    vi.stubEnv('COPILOT_BIN', executable)
    vi.stubEnv('PATH', `${directory}:${process.env.PATH}`)

    await expect(
      new TmuxTerminalSessionController().create(
        randomUUID(), directory, 'Owner failure', true,
      ),
    ).rejects.toThrow('Unable to list processes')
    const windows = (
      await execFileAsync('tmux', ['list-windows', '-t', tmuxSession, '-F', '#{window_id}'])
    ).stdout.trim().split('\n')
    expect(windows).toHaveLength(1)
  })

  it('returns a recovered session that is already showing a structured form', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-structured-form')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        "printf 'Copilot needs information.\\nChoose a target.\\n\\nTarget\\n\\nenter accept · esc cancel\\n'",
        'sleep 60',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-structured-form-${process.pid}`
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
    await expect(
      controller.create(sessionId, directory, 'Structured form', true),
    ).resolves.toMatchObject({ sessionName: tmuxSession })
    await expect(
      controller.send(sessionId, 'must not enter the form', false),
    ).rejects.toMatchObject({
      message: expect.stringContaining('waiting for user input'),
      statusCode: 409,
    })
  })

  it('returns a new session that is already showing a generic overlay', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-settings-overlay')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        "for _ in $(seq 1 40); do printf '\\n'; done",
        "printf 'Settings\\n❯ allowedUrls (default)\\n/ search · ↑/↓ navigate · tab switch scope · enter edit\\nesc close\\n'",
        'sleep 60',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-settings-overlay-${process.pid}`
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

    await expect(
      controller.create(sessionId, directory, 'Settings overlay', true),
    ).resolves.toMatchObject({ sessionName: tmuxSession })
    await expect(
      controller.send(sessionId, 'must not enter settings', false),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('rechecks readiness after an actionable startup prompt is answered', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const output = path.join(directory, 'received.txt')
    const executable = path.join(directory, 'copilot-trust-then-promotion')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        "printf '╭────────────────────────────────────────────────────────────╮\\nConfirm folder trust\\nDo you trust the files in this folder?\\n❯ 1. Yes\\n  2. Yes, and remember this folder for future sessions\\n  3. No (Esc)\\n↑/↓ to navigate · enter to select · esc to cancel\\n╰────────────────────────────────────────────────────────────╯\\n'",
        'IFS= read -r trust',
        "printf '\\033[2J\\033[H╻▄▄▄▄\\n┃\\n'",
        'sleep 0.5',
        "printf '\\033[2J\\033[H╭───────────────────────────────────────────────╮\\nTHE GITHUB COPILOT APP\\nNow generally available!\\nInstall it now?\\n❯ Yes, install      No, thanks\\n←/→ to choose · Enter to select · Y / N\\n╰───────────────────────────────────────────────╯\\n'",
        'IFS= read -r -n 1 answer',
        '[[ "$answer" == n ]] || exit 2',
        shellReadyComposer,
        'IFS= read -r line',
        'sleep 0.2',
        `printf '%s' "$line" >"${output}"`,
        shellReadyComposer,
        'sleep 60',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-trust-promotion-${process.pid}`
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
      'Trust then promotion',
      true,
    )
    await execFileAsync('tmux', [
      'send-keys',
      '-t',
      location.windowId,
      'Enter',
    ])
    await expect(
      Promise.all([
        controller.resolveStartupPrompt(sessionId),
        controller.resolveStartupPrompt(sessionId),
      ]),
    ).resolves.toEqual([true, true])

    const delivered = await controller.send(
      sessionId,
      'arrives after both prompts',
      false,
    )

    expect(delivered).toBe(true)
    const received = await eventually(
      () => readFile(output, 'utf8').catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return undefined
        throw error
      }),
      (value) => value === 'arrives after both prompts',
    )
    expect(received).toBe('arrives after both prompts')
  }, 15_000)

  it('captures an owned startup prompt from its expected pane', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const sessionId = randomUUID()
    const copilotHome = path.join(directory, 'copilot-home')
    const bystander = path.join(directory, 'copilot-bystander')
    const executable = path.join(directory, 'copilot-owned-startup')
    await writeFile(
      bystander,
      [
        '#!/usr/bin/env bash',
        "printf 'Settings\\n❯ allowedUrls (default)\\nesc close\\n'",
        'sleep 60',
      ].join('\n'),
    )
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        "printf '╭────────────────────────────────────────────────────────────╮\\nConfirm folder trust\\nDo you trust the files in this folder?\\n❯ 1. Yes\\n  2. Yes, and remember this folder for future sessions\\n  3. No (Esc)\\n↑/↓ to navigate · enter to select · esc to cancel\\n╰────────────────────────────────────────────────────────────╯\\n'",
        'sleep 60',
      ].join('\n'),
    )
    await Promise.all([chmod(bystander, 0o755), chmod(executable, 0o755)])
    const tmuxSession = `agentic-owned-capture-${process.pid}`
    tmuxSessions.push(tmuxSession)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      '-e',
      `COPILOT_HOME=${copilotHome}`,
      bystander,
      '--session-id',
      sessionId,
    ])
    vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', tmuxSession)
    vi.stubEnv('COPILOT_BIN', executable)
    vi.stubEnv('COPILOT_HOME', copilotHome)
    await execFileAsync('tmux', [
      'set-environment',
      '-t',
      tmuxSession,
      'COPILOT_HOME',
      copilotHome,
    ])
    const controller = new TmuxTerminalSessionController()

    await controller.create(sessionId, directory, 'Owned startup', true)

    await expect(controller.capture(sessionId)).resolves.toContain(
      'Confirm folder trust',
    )
  })

  it('removes a new window when startup readiness fails', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-startup-failure')
    await writeFile(
      executable,
      '#!/usr/bin/env bash\nsleep 1\nexit 1\n',
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-startup-failure-${process.pid}`
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
    const controller = new TmuxTerminalSessionController()

    await expect(
      controller.create(randomUUID(), directory, 'Failed startup', true),
    ).rejects.toThrow()

    const windows = (
      await execFileAsync('tmux', [
        'list-windows',
        '-t',
        tmuxSession,
        '-F',
        '#{window_name}',
      ])
    ).stdout.trim().split('\n')
    expect(windows).not.toContain('Failed startup')
  })

  it('kills only the owning pane when panes are renumbered while confirming', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-fake')
    await writeFile(executable, '#!/usr/bin/env bash\nsleep 60\n')
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-kill-${process.pid}`
    tmuxSessions.push(tmuxSession)
    // A pane that is not the owner's, created first so it holds index 0.
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      'sleep 60',
    ])
    const bystanderTarget = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        tmuxSession,
        '-F',
        '#{pane_id}',
      ])
    ).stdout.trim()
    const [ownerPid, ownerTarget] = (
      await execFileAsync('tmux', [
        'split-window',
        '-d',
        '-P',
        '-F',
        '#{pane_pid}\t#{pane_id}',
        '-t',
        tmuxSession,
        '--',
        executable,
      ])
    ).stdout.trim().split('\t')
    await waitForProcessCommand(Number.parseInt(ownerPid, 10), [executable])
    const sessionId = 'abcdef12-abcd-abcd-abcd-abcdef654321'
    const copilotHome = path.join(directory, 'copilot-home')
    const sessionDirectory = path.join(copilotHome, 'session-state', sessionId)
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(
      path.join(sessionDirectory, `inuse.${ownerPid}.lock`),
      `${ownerPid}\n`,
    )
    vi.stubEnv('COPILOT_HOME', copilotHome)

    // Confirmation does I/O, and the pane numbering can change underneath it.
    // A target resolved beforehand as `session:window.pane` then names a
    // different pane, and killing it takes somebody else's work.
    const closed = await new TmuxTerminalSessionController().stop(
      sessionId,
      async () => {
        await execFileAsync('tmux', [
          'swap-pane',
          '-d',
          '-s',
          bystanderTarget,
          '-t',
          ownerTarget,
        ])
      },
    )

    expect(closed).toBe(true)
    const remaining = (
      await execFileAsync('tmux', [
        'list-panes',
        '-t',
        tmuxSession,
        '-F',
        '#{pane_id}',
      ])
    ).stdout.trim()
    expect(remaining).toBe(bystanderTarget)
  })

  it('delivers a prompt into the owning terminal pane', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const output = path.join(directory, 'received.txt')
    const executable = path.join(directory, 'copilot-fake')
    await writeFile(
      executable,
      `#!/usr/bin/env bash\n${shellReadyComposer}\nIFS= read -r line\nprintf '%s' "$line" >"${output}"\nsleep 0.5\n${shellReadyComposer}\nsleep 60\n`,
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
    await waitForProcessCommand(Number.parseInt(panePid, 10), [executable])
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
    expect(
      await eventually(
        () => controller.has(sessionId),
        (available) => available,
      ),
    ).toBe(true)
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
      `#!/usr/bin/env bash\n${shellReadyComposer}\nIFS= read -r first\n${shellReadyComposer}\nIFS= read -r second\nprintf '%s\\n%s' "$first" "$second" >"${output}"\n${shellReadyComposer}\nsleep 60\n`,
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
    await waitForProcessCommand(Number.parseInt(panePid, 10), [executable])
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
    expect(
      await eventually(
        () => controller.has(sessionId),
        (available) => available,
      ),
    ).toBe(true)

    await Promise.all([
      controller.send(sessionId, 'MESSAGE-AAAA', false),
      controller.send(sessionId, 'MESSAGE-BBBB', false),
    ])
    const received = await eventually(
      () => readFile(output, 'utf8').catch(() => ''),
      (value) => value.includes('MESSAGE-BBBB'),
    )
    expect(received).toBe('MESSAGE-AAAA\nMESSAGE-BBBB')
  }, 15_000)

  it('rejects a cached session owner that reopened in another pane', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const executable = path.join(directory, 'copilot-reopened-fake')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        shellReadyComposer,
        'IFS= read -r line',
        shellReadyComposer,
        'sleep 60',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-reopened-${process.pid}`
    tmuxSessions.push(tmuxSession)
    const sessionId = randomUUID()
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    const originalWindow = (
      await execFileAsync('tmux', [
        'new-session',
        '-d',
        '-P',
        '-F',
        '#{window_id}',
        '-s',
        tmuxSession,
        '-e',
        `COPILOT_HOME=${copilotHome}`,
        executable,
        '--session-id',
        sessionId,
      ])
    ).stdout.trim()
    const controller = new TmuxTerminalSessionController()
    expect(
      await eventually(
        () => controller.has(sessionId),
        (available) => available,
      ),
    ).toBe(true)
    await expect(
      controller.send(sessionId, 'establish cached owner', false),
    ).resolves.toBe(true)
    await expect(controller.has(sessionId)).resolves.toBe(true)
    await execFileAsync('tmux', [
      'new-window',
      '-d',
      '-t',
      `=${tmuxSession}:`,
      'sleep',
      '60',
    ])
    await execFileAsync('tmux', ['kill-window', '-t', originalWindow])
    const reopenedPanePid = (
      await execFileAsync('tmux', [
        'new-window',
        '-d',
        '-P',
        '-F',
        '#{pane_pid}',
        '-t',
        `=${tmuxSession}:`,
        '-e',
        `COPILOT_HOME=${copilotHome}`,
        executable,
        '--session-id',
        sessionId,
      ])
    ).stdout.trim()
    await waitForProcessCommand(Number.parseInt(reopenedPanePid, 10), [
      executable,
    ])

    let replacementAvailable = false
    for (let attempt = 0; attempt < 5; attempt += 1) {
      replacementAvailable = await controller.has(sessionId)
      if (replacementAvailable) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    expect(replacementAvailable).toBe(true)
    await expect(
      controller.send(sessionId, 'must not trust the replacement', false),
    ).rejects.toMatchObject({ statusCode: 409 })
    await expect(
      controller.send(sessionId, 'replacement can be rediscovered', false),
    ).resolves.toBe(true)
  }, 15_000)

  it('does not paste after the owner changes during readiness', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const initial = path.join(directory, 'copilot-readiness-initial')
    const replacement = path.join(directory, 'copilot-readiness-replacement')
    const received = path.join(directory, 'replacement-received.txt')
    await writeFile(
      initial,
      [
        '#!/usr/bin/env bash',
        "printf '╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'",
        'sleep 60',
      ].join('\n'),
    )
    await writeFile(
      replacement,
      [
        '#!/usr/bin/env bash',
        "printf '╻▄▄▄▄\\n┃\\n╹▀▀▀▀\\n'",
        'if IFS= read -r -t 5 line; then',
        `  printf '%s' "$line" >"${received}"`,
        'fi',
        'sleep 60',
      ].join('\n'),
    )
    await Promise.all([chmod(initial, 0o755), chmod(replacement, 0o755)])
    const tmuxSession = `agentic-readiness-owner-${process.pid}`
    tmuxSessions.push(tmuxSession)
    const sessionId = randomUUID()
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    await execFileAsync('tmux', [
      'new-session',
      '-d',
      '-s',
      tmuxSession,
      '-e',
      `COPILOT_HOME=${copilotHome}`,
      initial,
      '--session-id',
      sessionId,
    ])
    const controller = new TmuxTerminalSessionController()
    expect(
      await eventually(
        () => controller.has(sessionId),
        (available) => available,
      ),
    ).toBe(true)

    const sending = controller.send(
      sessionId,
      'must not reach the replacement',
      false,
    )
    await new Promise((resolve) => setTimeout(resolve, 500))
    await execFileAsync('tmux', [
      'respawn-pane',
      '-k',
      '-t',
      tmuxSession,
      '-e',
      `COPILOT_HOME=${copilotHome}`,
      replacement,
      '--session-id',
      sessionId,
    ])

    await expect(sending).rejects.toMatchObject({ statusCode: 409 })
    expect(existsSync(received)).toBe(false)
  })

  it('does not dismiss a delayed startup promotion for a discovered session', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'terminal-session-test-'))
    directories.push(directory)
    const output = path.join(directory, 'received.txt')
    const executable = path.join(directory, 'copilot-delayed-promotion')
    await writeFile(
      executable,
      [
        '#!/usr/bin/env bash',
        "printf '╻▄▄▄▄\\n┃\\n'",
        'sleep 0.5',
        "printf '\\033[2J\\033[H╭───────────────────────────────────────────────╮\\nTHE GITHUB COPILOT APP\\nNow generally available!\\nInstall it now?\\n❯ Yes, install      No, thanks\\n←/→ to choose · Enter to select · Y / N\\n╰───────────────────────────────────────────────╯\\n'",
        'sleep 60',
      ].join('\n'),
    )
    await chmod(executable, 0o755)
    const tmuxSession = `agentic-delayed-promotion-${process.pid}`
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
    await waitForProcessCommand(Number.parseInt(panePid, 10), [executable])
    const sessionId = 'fedcba98-abcd-abcd-abcd-abcdef654321'
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
    expect(
      await eventually(
        () => controller.has(sessionId),
        (available) => available,
      ),
    ).toBe(true)

    await expect(
      controller.send(
        sessionId,
        'must not enter startup',
        false,
      ),
    ).rejects.toMatchObject({
      message: expect.stringContaining('waiting for user input'),
      statusCode: 409,
    })
    expect(existsSync(output)).toBe(false)
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

  it('recognises text wrapped across bordered composer lines', () => {
    const message =
      'Please inspect the deployment-orchestration-controller module today'
    const pane = [
      '\u256d\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256e',
      '\u2503 > Please inspect the deployment-orchestration- \u2503',
      '\u2503 controller module today                         \u2503',
      '\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256f',
    ].join('\n')

    expect(paneShowsText(pane, message)).toBe(true)
  })

  it('recognises a paste Copilot replaced with a placeholder', () => {
    // Only a send too large to echo can account for a placeholder.
    const huge = 'a very long message '.repeat(60)
    expect(paneShowsText('> [Pasted text #1 +40 lines]', huge)).toBe(true)
    const multiline = Array.from({ length: 24 }, () => 'a long message').join('\n')
    expect(paneShowsText('> [Paste #1 - 24 lines]', multiline)).toBe(true)
    expect(paneShowsText('> [Paste #1 - 24 lines]', huge)).toBe(false)
    expect(paneShowsText('> [Paste recipe]', huge)).toBe(false)
  })

  it('recognises a placeholder for a long paste ending in a short line', () => {
    // Only the final line is looked for on the pane, and a long paste can end
    // in a short one. Judged by that line alone the placeholder this send
    // really did produce went unrecognised, the paste was left behind, and the
    // retry put a second copy in the prompt.
    const content = `${'a very long message '.repeat(60)}\nok`
    expect(
      paneShowsText('> [Pasted text #1 +40 lines]', 'ok', 0, content),
    ).toBe(true)
    expect(
      paneShowsText('> [Paste #1 - 2 lines]', 'ok', 0, content),
    ).toBe(true)
  })

  it('recognises a short eleven-line paste placeholder', () => {
    const content = Array.from({ length: 11 }, (_, index) =>
      index === 10 ? 'final token z' : `line ${index + 1}`,
    ).join('\n')
    expect(content.length).toBeLessThan(801)
    expect(
      paneShowsText('> [Paste #1 - 11 lines]', 'final token z', 0, content),
    ).toBe(true)
    expect(
      paneShowsText(
        '> [Pasted text #1 +11 lines]',
        'final token z',
        0,
        content,
      ),
    ).toBe(false)
    expect(
      composerTookPaste(
        '> ',
        '> [Paste #1 - 11 lines] [Pasted text #2 +11 lines]',
        'final token z',
        content,
      ),
    ).toBe(false)
  })

  it('measures a paste by what the CLI received, not by what it renders', () => {
    // Hundreds of one-character lines are a large paste that all but vanishes
    // once whitespace is removed. Judged by the compacted text, the
    // placeholder the CLI really did draw was refused as evidence, the paste
    // was left in the prompt, and the retry put a second copy beside it.
    const content = Array.from({ length: 500 }, () => 'q').join('\n')
    expect(content.length).toBeGreaterThan(800)
    expect(content.replace(/\s+/gu, '').length).toBeLessThan(800)
    expect(
      paneShowsText('> [Pasted text #1 +500 lines]', 'q', 0, content),
    ).toBe(true)
  })

  it('does not read the CLI\'s own hint as the paste arriving', () => {
    // The empty-composer hint names files and commands. A prompt sharing a
    // word with it was found on the pane before it had arrived, and replacing
    // the hint with the paste left the count where it was -- so the send was
    // reported as never landing while the text sat in the prompt.
    const hint =
      '\u256d\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256e\n' +
      '\u2502 Type @ to mention files, # for issues/PRs, / for commands\n' +
      '\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256f'
    // Nothing has changed in the composer, so nothing has arrived.
    expect(composerTookPaste(hint, hint, 'files')).toBe(false)

    // And the other way round: the hint is not text that was already there,
    // so a paste of one of its own words is still the paste arriving.
    const pasted = hint.replace(
      'Type @ to mention files, # for issues/PRs, / for commands',
      '> files',
    )
    expect(composerTookPaste(hint, pasted, 'files')).toBe(true)
  })

  it('does not read a terminal user\'s placeholder as a short send landing', () => {
    // The send is small enough that Copilot would have echoed it, so the
    // placeholder on the pane is somebody else's paste. Treating it as this
    // send arriving pressed Enter on whatever they had written.
    expect(
      paneShowsText('> [Pasted text #1 +40 lines]', 'ship it'),
    ).toBe(false)
    expect(paneShowsText('> [Paste #1 - 24 lines]', 'ship it')).toBe(false)
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
    expect(paneShowsText('> \n', 'Deploy the staging service')).toBe(false)
  })

  it('treats a message of only whitespace as already shown', () => {
    expect(paneShowsText('> \n', '   ')).toBe(true)
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
      ' Fixture Model \u00b7 High \u00b7 1.1M context (0%)',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBeUndefined()
  })

  it('reads an update below the flat composer', () => {
    const pane = [
      ' ● Ready',
      flatReadyComposer(),
      ' v1.0.88 available · run /update · shift+tab switch mode',
    ].join('\n')

    expect(parseTerminalUpdateNotice(pane)).toBe('1.0.88')
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
      ' Fixture Model \u00b7 High \u00b7 1.1M context (0%)',
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
      ' Fixture Model \u00b7 High \u00b7 1.1M context (0%)',
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
    ' Fixture Model · High · 1.1M context (0%)',
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

  it('reports command output above a flat composer', () => {
    const before = [
      '  ╭─╮╭─╮',
      '  ╰─╯╰─╯  Copilot v1.0.87 uses AI.',
      flatReadyComposer(),
    ].join('\n')
    const after = [
      '  ╭─╮╭─╮',
      '  ╰─╯╰─╯  Copilot v1.0.87 uses AI.',
      ' ● Current working directory: /work/project',
      flatReadyComposer(),
    ].join('\n')

    expect(terminalCommandOutput(before, after, '/cwd')).toBe(
      'Current working directory: /work/project',
    )
  })

  it('ignores a changed flat composer path/status row', () => {
    expect(terminalCommandOutput(
      flatReadyComposer('', false, '/work/one'),
      flatReadyComposer('', false, '/work/two'),
      '/cwd',
    )).toBeUndefined()
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
      ' Fixture Model · High · 1.1M context (0%)',
    ].join('\n')
    const after = [
      ' ● Tip: /plugin',
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '┃',
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' Changes    +12 -3',
      ' Fixture Model · High · 1.1M context (7%)',
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

  // Only offered while a turn is in flight, so it marks the frames whose new
  // lines belong to the agent rather than to a command.
  it('recognises the pane while the agent is working', () => {
    const working = [
      ' \u25cf Reading files',
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u25c9 Working - autopilot \u00b7 132.7 KiB esc interrupt',
      ' Fixture Model \u00b7 High \u00b7 1.1M context (18%)',
    ].join('\n')

    expect(isTerminalAgentWorking(working)).toBe(true)
  })

  it('does not think an idle pane is working', () => {
    const idle = [
      ' \u25cf Ready',
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help \u00b7 tab next tab',
      ' Fixture Model \u00b7 High \u00b7 1.1M context (0%)',
    ].join('\n')

    expect(isTerminalAgentWorking(idle)).toBe(false)
  })

  it('does not mistake an ordinary transcript for a full-screen view', () => {
    const pane = [
      ' ● Current working directory: /home/user/project',
      composer,
    ].join('\n')

    expect(isTerminalOverlay(pane)).toBe(false)
  })

  it('ignores keyboard hints quoted immediately above the composer', () => {
    const pane = [
      ' The picker says enter select and esc cancel.',
      composer,
    ].join('\n')

    expect(isTerminalOverlay(pane)).toBe(false)
  })

  it('ignores keyboard hints typed inside the composer', () => {
    const pane = [
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '┃ Explain enter select and esc cancel.',
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' ← open sidebar · / commands · tab next tab',
    ].join('\n')

    expect(isTerminalOverlay(pane)).toBe(false)
  })

  it('recognises a real overlay after an older composer in scrollback', () => {
    const pane = [
      composer,
      ' Settings',
      ' ❯ allowedUrls',
      ' ↑/↓ navigate · enter edit · esc close',
      ...Array<string>(12).fill(''),
    ].join('\n')

    expect(isTerminalOverlay(pane)).toBe(true)
  })

  it('recognises a single-field form that has no tab navigation hint', () => {
    expect(isTerminalOverlay(singleFieldPane)).toBe(true)
    expect(isTerminalOverlay([singleFieldPane, composer].join('\n'))).toBe(false)
  })
})

// Captured from a real Copilot CLI form: a text field focused, with the tabs
// naming every field above it.
const formPaneFirstField = [
  ' Copilot needs information.',
  ' Configure the deployment request.',
  '',
  '  Deployment name   Catalog scope   Confirm deployment',
  '',
  ' Deployment name',
  ' ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
  '  ❯ swec-default',
  ' ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
  '',
  ' enter accept · tab next · ctrl+d decline · esc cancel',
].join('\n')

// The same form after an attached client moved to the last field, which is a
// list and so prints its title with a colon.
const formPaneLastField = [
  ' Copilot needs information.',
  ' Configure the deployment request.',
  '',
  '  Deployment name   Catalog scope   Confirm deployment',
  '',
  ' Confirm deployment:',
  '   Yes',
  ' ❯ No',
  '   Other (type your answer)',
  '',
  ' ↑/↓ select · enter accept · shift+tab prev · ctrl+d decline · esc cancel',
].join('\n')

// Captured from a real Copilot CLI form with a single field. There is no row
// of tabs: the field's own heading is all the form prints.
const singleFieldPane = [
  ' Copilot needs information.',
  ' Which meaning of \u201Csucceeded\u201D should the status file use?',
  '',
  ' Rows to retain:',
  ' Successful executions keeps completed healthy benchmark runs.',
  ' \u276F Successful executions: historical runs plus completed TSF-0.5',
  '   Successful experiment outcomes: retained T1 plus C1 control only',
  '   Other (type your answer)',
  '',
  ' \u2191/\u2193 select \u00B7 enter accept \u00B7 ctrl+d decline \u00B7 esc cancel',
].join('\n')

// A neutral reproduction of a CLI form whose focused tab is bracketed.
const bracketedTabPane = [
  ' Copilot needs information.',
  ' Choose how to handle the unpublished work.',
  '',
  ' [Active project]  Service configuration   App changes',
  '',
  ' Active project:',
  ' \u276F Preserve local changes (Recommended)',
  '   Commit and push the project changes',
  '   Other (type your answer)',
  '',
  ' \u2191/\u2193 select \u00B7 enter accept \u00B7 tab next \u00B7 esc cancel',
].join('\n')

describe('forms whose focused tab is marked', () => {
  const form = {
    question: 'Choose how to handle the unpublished work.',
    fields: [
      'Active project',
      'Service configuration',
      'App changes',
    ],
  }

  it('reads the tab name from under its marking', () => {
    expect(terminalFormShowsFields(bracketedTabPane, form)).toBe(true)
    expect(parseTerminalFormActiveField(bracketedTabPane, form)).toBe(0)
  })

  it('keeps wrapped-question matching with bracketed focus tabs', () => {
    const pane = bracketedTabPane.replace(
      'Choose how to handle the unpublished work.',
      'Choose how to handle the\n unpublished work.',
    )
    expect(terminalFormShowsFields(pane, form)).toBe(true)
    expect(parseTerminalFormActiveField(pane, form)).toBe(0)
    expect(terminalFormShowsFields(pane, {
      ...form, question: 'Choose how to handle the',
    })).toBe(false)
  })

  it('matches a question the CLI wrapped through a long token', () => {
    // The CLI wraps inside its own box. A URL has nowhere to break, so the
    // line ends mid-token and the next one continues it with no space: the
    // question cannot be rebuilt by joining the rows with spaces.
    const question =
      "Run the command below, then report what happened:\n\n" +
      "curl -i --max-time 5 'http://10.0.0.181:54342/?key=5ef1638a24d8fa391e8cdc43c019d06d447e459c62bd935337e6115d208441b5'"
    const rule = '\u2500'.repeat(80)
    const pad = (line: string) => line.padEnd(80, ' ')
    const pane = [
      rule,
      pad(' Copilot needs information.'),
      pad(' Run the command below, then report what happened:'),
      '',
      // Filled to the edge of the box: the CLI had to break the URL here.
      pad(" curl -i --max-time 5 'http://10.0.0.181:54342/?key=5ef1638a24d8fa391e8cdc43c01"),
      pad(" 9d06d447e459c62bd935337e6115d208441b5'"),
      '',
      '  Device showing the browser error   Mac curl result',
      '',
      ' Device showing the browser error:',
      ' \u276F Mac only',
      '   Phone only',
      '',
      ' \u2191/\u2193 select \u00B7 enter accept \u00B7 tab next \u00B7 esc cancel',
      rule,
    ].join('\n')
    const wrapped = {
      question,
      fields: ['Device showing the browser error', 'Mac curl result'],
    }

    expect(terminalFormShowsFields(pane, wrapped)).toBe(true)
    expect(parseTerminalFormActiveField(pane, wrapped)).toBe(0)
    // A break at the edge of a token cannot say whether the question had a
    // space there, so both readings of the URL are accepted. A question that
    // differs in its own words is still refused.
    expect(
      terminalFormShowsFields(pane, {
        ...wrapped,
        question: question.replace('report what happened', 'report the output'),
      }),
    ).toBe(false)
  })

  it('matches a token broken with a wide gap left behind', () => {
    // The CLI breaks a token when what follows will not fit, so the row it
    // leaves can stop well short of the edge. The gap is not evidence of a
    // space; the length of what continues on the next row is.
    const question =
      'Please review `docs/visual-design-spec-v0.2.md` and its linked ' +
      '`docs/mockups/*.html` files before planning.'
    const rule = '\u2500'.repeat(80)
    const pad = (line: string) => line.padEnd(80, ' ')
    const pane = [
      rule,
      pad(' Copilot needs information.'),
      // Stops two columns short: `*.html`` could not have fitted there.
      pad(' Please review `docs/visual-design-spec-v0.2.md` and its linked `docs/mockups/'),
      pad(' *.html` files before planning.'),
      '',
      '  Written UX specification   Requested changes',
      '',
      ' Written UX specification:',
      ' \u276F Approve',
      '   Request changes',
      '',
      ' \u2191/\u2193 select \u00B7 enter accept \u00B7 tab next \u00B7 esc cancel',
      rule,
    ].join('\n')
    const wide = {
      question,
      fields: ['Written UX specification', 'Requested changes'],
    }

    expect(terminalFormShowsFields(pane, wide)).toBe(true)
    expect(parseTerminalFormActiveField(pane, wide)).toBe(0)
  })

  it('still reads a wide gap as a space when the continuation would have fitted', () => {
    const rule = '\u2500'.repeat(80)
    const pad = (line: string) => line.padEnd(80, ' ')
    const pane = [
      rule,
      pad(' Copilot needs information.'),
      pad(' Choose user'),
      pad(' name'),
      '',
      '  Written UX specification   Requested changes',
      '',
      ' Written UX specification:',
      ' \u276F Approve',
      '',
      ' \u2191/\u2193 select \u00B7 enter accept \u00B7 tab next \u00B7 esc cancel',
      rule,
    ].join('\n')
    const fields = ['Written UX specification', 'Requested changes']

    // "name" had ample room on the row above, so the break was a space.
    expect(terminalFormShowsFields(pane, { question: 'Choose username', fields })).toBe(false)
    expect(terminalFormShowsFields(pane, { question: 'Choose user name', fields })).toBe(true)
  })

  it('keeps a title that is written in brackets of its own', () => {
    const pane = [
      ' Copilot needs information.',
      ' Configure the run.',
      '',
      ' [Environment]  Region',
      '',
      ' [Environment]:',
      ' \u276F Production',
      '',
      ' \u2191/\u2193 select \u00B7 enter accept \u00B7 tab next \u00B7 esc cancel',
    ].join('\n')

    // The brackets belong to the name here, not to the marking, and the two
    // are written identically.
    expect(
      terminalFormShowsFields(pane, {
        question: 'Configure the run.',
        fields: ['[Environment]', 'Region'],
      }),
    ).toBe(true)
  })

  it('still refuses a marked form belonging to another question', () => {
    expect(
      terminalFormShowsFields(bracketedTabPane, {
        question: 'Something else entirely?',
        fields: [
          'Active project',
          'Service configuration',
          'App changes',
        ],
      }),
    ).toBe(false)
  })
})

describe('single field forms', () => {
  const form = {
    question: 'Which meaning of \u201Csucceeded\u201D should the status file use?',
    fields: ['Rows to retain'],
  }

  it('recognises a question that prints no row of tabs', () => {
    // Without this the form is never identified, so it is never filled, and
    // the reply falls back to a path that cannot close a form: the reader
    // answers and the question stays exactly where it was.
    expect(parseTerminalFormPrompt(singleFieldPane)).toBe(true)
    expect(terminalFormShowsFields(singleFieldPane, form)).toBe(true)
    expect(parseTerminalFormActiveField(singleFieldPane, form)).toBe(0)
  })

  it('answers a single-field form whose value holds a run of spaces', () => {
    // A prefilled value is just text, and text can contain two spaces. Reading
    // any such line as a row of tabs made an ordinary one-field form look like
    // a form of several, so it could be neither filled nor dismissed.
    const pane = [
      ' Copilot needs information.',
      ' Which company is this for?',
      '',
      ' Company:',
      ' \u276F ACME  Corp',
      '   Other (type your answer)',
      '',
      ' \u2191/\u2193 select \u00B7 enter accept \u00B7 esc cancel',
    ].join('\n')
    const form = {
      question: 'Which company is this for?',
      fields: ['Company'],
    }
    expect(terminalFormShowsFields(pane, form)).toBe(true)
    expect(parseTerminalFormActiveField(pane, form)).toBe(0)
  })

  it('refuses a one-field identity against a form of several fields', () => {
    // The heading of the focused field is printed on its own line inside a
    // multi-field form too. Treated as the whole of a one-field form, the
    // controller answers it and submits that form -- every other field left at
    // whatever it defaulted to.
    expect(
      terminalFormShowsFields(formPaneFirstField, {
        question: 'Configure the deployment request.',
        fields: ['Deployment name'],
      }),
    ).toBe(false)
  })

  it('keeps a multi-field title that ends in a colon', () => {
    // The colon a single-field heading is printed with is structural. A title
    // that ends in one is not, and taking the colon off every tab stopped such
    // a form from ever matching the row it prints.
    const pane = formPaneFirstField.replace(
      '  Deployment name   Catalog scope   Confirm deployment',
      '  Deployment name:   Catalog scope   Confirm deployment',
    )
    expect(
      terminalFormShowsFields(pane, {
        question: 'Configure the deployment request.',
        fields: ['Deployment name:', 'Catalog scope', 'Confirm deployment'],
      }),
    ).toBe(true)
  })

  it('still refuses a single-field form belonging to another question', () => {
    expect(
      terminalFormShowsFields(singleFieldPane, {
        question: 'Something else entirely?',
        fields: ['Rows to retain'],
      }),
    ).toBe(false)
  })

  const wrappedQuestion =
    'The repository clone is waiting in the credential manager for authentication. ' +
    'Please complete the sign-in prompt so the clone can continue.'
  const wrappedForm = {
    question: wrappedQuestion,
    fields: ['Repository authentication completed'],
  }
  const wrappedPane = [
    ' Copilot needs information.',
    ' The repository clone is waiting in the credential manager for authentication. Please complete the sign-in',
    ' prompt so the clone can continue.',
    '',
    ' Repository authentication completed:',
    ' Confirm after completing the sign-in window.',
    ' ❯ Yes',
    '   No',
    '   Other (type your answer)',
    '',
    ' ↑/↓ select · enter accept · ctrl+d decline · esc cancel',
  ].join('\n')

  it('recognises the complete question across wrapped terminal lines', () => {
    expect(parseTerminalFormPrompt(wrappedPane)).toBe(true)
    expect(terminalFormShowsFields(wrappedPane, wrappedForm)).toBe(true)
    expect(parseTerminalFormActiveField(wrappedPane, wrappedForm)).toBe(0)
  })

  it('ignores a completed form left in scrollback above the current composer', () => {
    const pane = [
      wrappedPane,
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '┃',
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' ← open sidebar · / commands · tab next tab',
    ].join('\n')
    expect(parseTerminalFormPrompt(pane)).toBe(false)
    expect(terminalFormShowsFields(pane, wrappedForm)).toBe(false)
    expect(parseTerminalFormActiveField(pane, wrappedForm)).toBeUndefined()
  })

  it('requires a joined capture for a wrap inside a word', () => {
    const pane = wrappedPane.replace(
      'authentication. Please complete the sign-in\n prompt',
      'authentica\n tion.\n\n Please complete the sign-in\n prompt',
    )
    expect(terminalFormShowsFields(pane, wrappedForm)).toBe(false)
    expect(parseTerminalFormActiveField(pane, wrappedForm)).toBeUndefined()
    const joined = pane.replace('authentica\n tion.', 'authentication.')
    expect(terminalFormShowsFields(joined, wrappedForm)).toBe(true)
    expect(parseTerminalFormActiveField(joined, wrappedForm)).toBe(0)
  })

  it('requires the whole wrapped question, not a prefix or text in a field', () => {
    expect(terminalFormShowsFields(wrappedPane, {
      ...wrappedForm,
      question: wrappedPane.split('\n')[1].trim(),
    })).toBe(false)
    expect(terminalFormShowsFields(wrappedPane, {
      ...wrappedForm,
      question: wrappedQuestion.slice(0, -10),
    })).toBe(false)
    expect(terminalFormShowsFields(
      wrappedPane.replace('prompt so the clone', 'prompt before the clone'),
      wrappedForm,
    )).toBe(false)
    expect(terminalFormShowsFields(
      wrappedPane.replace('Confirm after completing the sign-in window.', 'Unrelated question'),
      { ...wrappedForm, question: 'Unrelated question' },
    )).toBe(false)
  })

  it('does not erase spaces within a question line when comparing identities', () => {
    expect(terminalFormShowsFields(
      wrappedPane.replace('credential manager', 'credentialmanager'),
      wrappedForm,
    )).toBe(false)
  })

  it('recognises wrapped questions above multi-field tabs without changing focus', () => {
    const pane = formPaneLastField.replace(
      ' Configure the deployment request.',
      wrappedPane.split('\n').slice(1, 3).join('\n'),
    )
    const form = {
      question: wrappedQuestion,
      fields: ['Deployment name', 'Catalog scope', 'Confirm deployment'],
    }
    expect(terminalFormShowsFields(pane, form)).toBe(true)
    expect(parseTerminalFormActiveField(pane, form)).toBe(2)
  })
})

describe('terminal form identity', () => {
  const form = {
    question: 'Configure the deployment request.',
    fields: ['Deployment name', 'Catalog scope', 'Confirm deployment'],
  }

  it('recognizes the form the given request describes', () => {
    expect(terminalFormShowsFields(formPaneFirstField, form)).toBe(true)
    expect(terminalFormShowsFields(formPaneLastField, form)).toBe(true)
  })

  it('recognizes a question wrapped to the terminal width', () => {
    const wrapped = formPaneFirstField.replace(
      ' Configure the deployment request.',
      [
        ' Configure the deployment request with a long explanation that',
        ' wraps across terminal lines before the fields are shown.',
      ].join('\n'),
    )
    const wrappedForm = {
      ...form,
      question:
        'Configure the deployment request with a long explanation that wraps across terminal lines before the fields are shown.',
    }

    expect(terminalFormShowsFields(wrapped, wrappedForm)).toBe(true)
    expect(parseTerminalFormActiveField(wrapped, wrappedForm)).toBe(0)
  })

  it('recognizes a tmux-joined question containing an unbroken URL', () => {
    const question =
      'Inspect https://example.test/a-very-long-unbroken-resource-identifier before continuing.'
    const wrapped = formPaneFirstField.replace(
      ' Configure the deployment request.',
      ` ${question}`,
    )
    const wrappedForm = { ...form, question }

    expect(terminalFormShowsFields(wrapped, wrappedForm)).toBe(true)
    expect(parseTerminalFormActiveField(wrapped, wrappedForm)).toBe(0)
  })

  it('does not conflate a word boundary with an unbroken identifier', () => {
    const wrapped = formPaneFirstField.replace(
      ' Configure the deployment request.',
      [' Choose user', ' name'].join('\n'),
    )

    expect(
      terminalFormShowsFields(wrapped, {
        ...form,
        question: 'Choose username',
      }),
    ).toBe(false)
    expect(
      terminalFormShowsFields(wrapped, {
        ...form,
        question: 'Choose user name',
      }),
    ).toBe(true)
  })

  it('does not hard-join a soft wrap after punctuation', () => {
    const wrapped = formPaneFirstField.replace(
      ' Configure the deployment request.',
      [' Choose foo-bar', ' baz'].join('\n'),
    )

    expect(
      terminalFormShowsFields(wrapped, {
        ...form,
        question: 'Choose foo-barbaz',
      }),
    ).toBe(false)
    expect(
      terminalFormShowsFields(wrapped, {
        ...form,
        question: 'Choose foo-bar baz',
      }),
    ).toBe(true)
  })

  it('does not hard-join a soft wrap before a digit', () => {
    const wrapped = formPaneFirstField.replace(
      ' Configure the deployment request.',
      [' Choose version', ' 2'].join('\n'),
    )

    expect(
      terminalFormShowsFields(wrapped, {
        ...form,
        question: 'Choose version2',
      }),
    ).toBe(false)
    expect(
      terminalFormShowsFields(wrapped, {
        ...form,
        question: 'Choose version 2',
      }),
    ).toBe(true)
  })

  it('keeps the exact question after tmux joins several URL wraps', () => {
    const question =
      'Inspect https://example.test/a-very-long-resource-identifier-that-spans-several-terminal-lines before continuing.'
    const wrapped = formPaneFirstField.replace(
      ' Configure the deployment request.',
      ` ${question}`,
    )

    expect(
      terminalFormShowsFields(wrapped, { ...form, question }),
    ).toBe(true)
  })

  it('rejects a form that belongs to another request', () => {
    // A prompt that replaced the one being answered shows its own fields, so
    // an answer written for the old form must not reach it.
    const other = formPaneFirstField.replace(
      '  Deployment name   Catalog scope   Confirm deployment',
      '  Branch name   Force push',
    )
    expect(terminalFormShowsFields(other, form)).toBe(false)
    expect(
      terminalFormShowsFields(other, {
        question: form.question,
        fields: ['Branch name', 'Force push'],
      }),
    ).toBe(true)
  })

  it('rejects a repeat of the same schema asked for something else', () => {
    // Two requests can share a schema, so the fields alone cannot tell them
    // apart; the question the CLI prints above them is what does.
    const reasked = formPaneFirstField.replace(
      ' Configure the deployment request.',
      ' Configure the rollback request.',
    )
    expect(terminalFormShowsFields(reasked, form)).toBe(false)
  })

  it('rejects a stale question that prefixes the live question', () => {
    const replacement = formPaneFirstField.replace(
      ' Configure the deployment request.',
      [
        ' Configure the deployment request.',
        ' Include the regional override.',
      ].join('\n'),
    )

    expect(terminalFormShowsFields(replacement, form)).toBe(false)
  })

  it('rejects a different wrapped question with the same fields', () => {
    const wrapped = formPaneFirstField.replace(
      ' Configure the deployment request.',
      [
        ' Configure the rollback request with a long explanation that',
        ' wraps across terminal lines before the fields are shown.',
      ].join('\n'),
    )

    expect(
      terminalFormShowsFields(wrapped, {
        ...form,
        question:
          'Configure the deployment request with a long explanation that wraps across terminal lines before the fields are shown.',
      }),
    ).toBe(false)
  })

  it('reads which field the form has focused, by position', () => {
    expect(parseTerminalFormActiveField(formPaneFirstField, form)).toBe(0)
    expect(parseTerminalFormActiveField(formPaneLastField, form)).toBe(2)
  })

  it('refuses to guess focus when a title is repeated', () => {
    // Answers are written per position, so an ambiguous title would shift
    // every one of them.
    const duplicated = formPaneFirstField.replace(
      '  Deployment name   Catalog scope   Confirm deployment',
      '  Name   Name   Confirm deployment',
    )
    expect(
      parseTerminalFormActiveField(duplicated, {
        question: form.question,
        fields: ['Name', 'Name', 'Confirm deployment'],
      }),
    ).toBeUndefined()
  })

  it('reports no focus for a pane that is not this form', () => {
    expect(parseTerminalFormActiveField('nothing here', form)).toBeUndefined()
  })
})

describe('terminalFormCommitKeys', () => {
  it('moves between fields with Tab and accepts once at the end', () => {
    // The CLI prints its own contract: `enter accept · tab next`. Enter
    // between fields would accept the form with every field after it left at
    // whatever it opened with.
    expect(terminalFormCommitKeys(3)).toEqual(['Tab', 'Tab', 'Enter'])
  })

  it('accepts immediately when the form has one field', () => {
    expect(terminalFormCommitKeys(1)).toEqual(['Enter'])
  })

  it('accepts single-choice values before advancing, rather than dropping the highlight', () => {
    expect(terminalFormCommitKeys(3, [
      { kind: 'select', optionCount: 3, index: 1 },
      { kind: 'text', value: 'Exact text' },
      { kind: 'select', optionCount: 3, index: 0 },
    ])).toEqual(['Enter', 'Tab', 'Enter'])
  })
})

describe('submitTerminalForm', () => {
  const openForm = [
    ' Copilot needs information.',
    ' Which sessions get the button',
    ' enter accept · esc cancel',
  ].join('\n')
  const closed = '❯ \n'

  it('reports the form closing', async () => {
    await expect(
      submitTerminalForm(async () => closed, async () => {}),
    ).resolves.toBe(true)
  })

  it('gives up on a form that will not close', async () => {
    await expect(
      submitTerminalForm(async () => openForm, async () => {}, 10),
    ).resolves.toBe(false)
  })

  it('recognizes a single-field form whose footer wraps', () => {
    expect(
      parseTerminalFormPrompt([
        ' Copilot needs information.',
        ' Choose a target.',
        ' Target:',
        ' ↑/↓ select · enter accept',
        ' · esc cancel',
      ].join('\n')),
    ).toBe(true)
  })

  it('ignores cancel text before the actual form footer', () => {
    expect(
      parseTerminalFormPrompt([
        ' Copilot needs information.',
        ' Explain why the cancel operation is needed.',
        ' Target:',
        ' Cancel deployment',
        ' enter accept · esc cancel',
      ].join('\n')),
    ).toBe(true)
  })

  it('does not mistake a round-framed field for the composer', () => {
    expect(
      parseTerminalFormPrompt([
        ' Copilot needs information.',
        ' Choose a target.',
        ' Target:',
        ' ╭────────╮',
        ' │ value  │',
        ' ╰────────╯',
        ' enter accept · esc cancel',
      ].join('\n')),
    ).toBe(true)
  })

  it('rejects a quoted structured form above a live composer', () => {
    expect(
      parseTerminalFormPrompt([
        ' Copilot needs information.',
        ' Choose a target.',
        ' enter accept · esc cancel',
        '╻▄▄▄▄',
        '┃',
        '╹▀▀▀▀',
      ].join('\n')),
    ).toBe(false)
    expect(
      parseTerminalFormPrompt([
        ' Copilot needs information.',
        ' Choose a target.',
        ' enter accept · esc cancel',
        '╭────',
        '│',
        '╰────',
      ].join('\n')),
    ).toBe(false)
  })
})

describe('terminalChecklistState', () => {
  // Captured from a real Copilot CLI checklist, cursor on the ticked row.
  const pane = [
    ' Wiki operations to authorize:',
    ' Confirm both page updates, or select only one operation.',
    ' ❯ ✓ Confirm all (Recommended)',
    '   • Upsert experiment child page and upload charts',
    '   • Upsert Experiments parent index',
    '   • Cancel',
    '   • Other (type your answer)',
    '',
    ' ↑/↓ select · space toggle · enter accept · esc cancel',
  ].join('\n')

  it('reads which rows the list is showing as ticked', () => {
    // The freeform row is one of them, so a four-option list has five rows.
    expect(terminalChecklistState(pane, 5)).toEqual([
      true,
      false,
      false,
      false,
      false,
    ])
  })

  it('refuses a screen that is not showing a list of that size', () => {
    expect(terminalChecklistState(pane, 3)).toBeUndefined()
    expect(terminalChecklistState('❯ \n', 4)).toBeUndefined()
  })
})

describe('composerHoldsText', () => {
  const framed = (body: string[]) =>
    ['transcript line', '╭──────────────╮', ...body, '╰──────────────╯'].join(
      '\n',
    )

  it('reads an empty composer as empty', () => {
    expect(
      composerHoldsText(framed(['│ > Message agent on development\u2026 │'])),
    ).toBe(false)
    expect(composerHoldsText(framed(['│                   │']))).toBe(false)
    expect(composerHoldsText([
      '  ╭─╮╭─╮',
      '  ╰─╯╰─╯  Copilot v1.0.87 uses AI.',
      flatReadyComposer(),
    ].join('\n'))).toBe(false)
  })

  it('reads typed input as held text', () => {
    expect(composerHoldsText(framed(['│ > half a thought  │']))).toBe(true)
    expect(composerHoldsText(flatReadyComposer('half a thought'))).toBe(true)
  })

  it('treats an unreadable pane as holding text', () => {
    // Ctrl+U takes the whole composer, so anything that cannot be read has to
    // count as someone's unsent message rather than be typed over.
    expect(composerHoldsText('no composer drawn here')).toBe(true)
  })

  it('reads a real message that opens with the placeholder word', () => {
    // "Message the team about the deploy" is someone's message, not an empty
    // composer, and Ctrl+U would take it.
    expect(
      composerHoldsText(framed(['│ > Message the team about the deploy │'])),
    ).toBe(true)
    // The placeholder must end in an ellipsis, or every draft opening with
    // one of these words reads as an empty composer.
    expect(composerHoldsText(framed(['│ > Ask the team first │']))).toBe(true)
    expect(
      composerHoldsText(framed(['│ > Message agent on development\u2026 │'])),
    ).toBe(false)
  })

  it('reads the prefix reminder as an empty composer', () => {
    // What the CLI actually writes into an empty composer. Taken for
    // somebody's message, a paste could never be taken back.
    expect(
      composerHoldsText(
        framed(['│ Type @ to mention files, # for issues/PRs, / for commands │']),
      ),
    ).toBe(false)
  })

})

describe('composerHoldsOtherText', () => {
  const framed = (body: string[]) =>
    ['transcript line', '╭──────────────╮', ...body, '╰──────────────╯'].join(
      '\n',
    )

  it('ignores the paste it is about to take back', () => {
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > deploy the thing │']),
        'deploy the thing',
      ),
    ).toBe(false)
  })

  describe('current CLI paste receipt', () => {
    const framed = (text = '') => [
      '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      ...text.split('\n').map((line) => `┃ ${line}`),
      '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      ' / commands',
    ].join('\n')
    const shortMultiline = Array(32).fill('p').join('\n')

    it('recognizes current markers for small multiline payloads, including trailing newlines', () => {
      for (const content of [shortMultiline, shortMultiline + '\n']) {
        const after = framed('[Paste #1 - 32 lines]')
        expect(composerTookPaste(framed(), after, content, content)).toBe(true)
        expect(paneShowsText(after, content, 0, content)).toBe(true)
        expect(composerHoldsOtherText(framed(), after, content)).toBe(false)
      }
    })

    it('recognizes markers wrapped inside their labels without crediting an existing marker', () => {
      const after = framed('[Pa\nste #1 - 32 li\nnes]')
      expect(composerTookPaste(framed(), after, shortMultiline)).toBe(true)
      expect(composerTookPaste(after, after, shortMultiline)).toBe(false)
    })

    it('rejects wrong line counts, two new markers, or unrelated text beside a marker', () => {
      for (const text of [
        '[Paste #1 - 31 lines]',
        '[Paste #1 - 32 lines][Paste #2 - 32 lines]',
        '[Paste #1 - 32 lines]another draft',
      ]) {
        expect(composerTookPaste(framed(), framed(text), shortMultiline)).toBe(false)
        expect(composerHoldsOtherText(framed(), framed(text), shortMultiline)).toBe(true)
      }
    })

    it('does not count marker metadata as receipt of a short literal word', () => {
      for (const marker of ['[Paste #1 - 32 lines]', '[Pasted text #1 +32 lines]']) {
        expect(composerTookPaste(framed(), framed(marker), 'Paste')).toBe(false)
        expect(paneShowsText(framed(marker), 'Paste')).toBe(false)
      }
    })

    it('recognizes a scrolled long line only from substantial matching suffix text', () => {
      const content = 'start-' + 'abcdefgh'.repeat(150) + '-distinct-end'
      expect(composerTookPaste(framed(), framed(content.slice(-200)), content)).toBe(true)
      expect(composerTookPaste(framed(), framed(content.slice(0, 200)), content)).toBe(false)
      expect(composerTookPaste(framed(), framed(content.slice(-12)), content)).toBe(false)
      expect(composerTookPaste(framed('existing draft'), framed(content.slice(-200)), content)).toBe(false)
    })
  })

  it('sees text typed beside the paste', () => {
    // Cleanup can happen seconds after the send, which is long enough for
    // someone to have started writing next to it.
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > deploy the thing and also this │']),
        'deploy the thing',
      ),
    ).toBe(true)
  })


  it('takes back a paste too large to echo', () => {
    // A large paste is shown as its placeholder, not its text, so removing the
    // lines that were sent leaves the placeholder looking like someone else's
    // writing and the paste is never taken back.
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > [Pasted text #3] │']),
        'a very long message '.repeat(60),
      ),
    ).toBe(false)
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > [Paste #1 - 24 lines] │']),
        Array.from({ length: 24 }, () => 'a very long message').join('\n'),
      ),
    ).toBe(false)
  })

  it('keeps a placeholder that was already there', () => {
    expect(
      composerHoldsOtherText(
        framed(['│ > [Pasted text #2] │']),
        framed(['│ > [Pasted text #2] [Pasted text #3] │']),
        'a very long message '.repeat(60),
      ),
    ).toBe(true)
  })


  it('leaves the composer alone when someone else pasted too', () => {
    // Two placeholders appeared during the wait and there is no telling which
    // belongs to this paste, so nothing is taken back.
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > [Pasted text #3] [Pasted text #4] │']),
        'a very long message '.repeat(60),
      ),
    ).toBe(true)
  })

  it('does not discount text the composer already showed', () => {
    expect(
      composerHoldsOtherText(
        framed(['│ > deploy │']),
        framed(['│ > deploy deploy │']),
        'deploy',
      ),
    ).toBe(true)
  })


  it('recognizes a paste the composer wrapped inside a word', () => {
    // The composer wraps mid-word, so a single pasted line can be rendered as
    // two. Compared line by line the paste is never found, cleanup is skipped
    // and retrying leaves a second copy.
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > deployment-orches │', '│ tration-controller │']),
        'deployment-orchestration-controller',
      ),
    ).toBe(false)
  })

  it('keeps punctuation somebody typed beside the paste', () => {
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > deploy ... │']),
        'deploy',
      ),
    ).toBe(true)
  })

  it('discounts one copy of the paste, not a second someone typed', () => {
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > deploy deploy │']),
        'deploy',
      ),
    ).toBe(true)
  })


  it('does not claim a placeholder a short send cannot have made', () => {
    // The send never landed and a terminal user made a large paste of their
    // own during the wait. Crediting this send with their placeholder takes
    // it away with the cleanup.
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > [Pasted text #7] │']),
        'short',
      ),
    ).toBe(true)
  })

  it('does not claim a legacy placeholder from an eleven-line paste', () => {
    const content = Array.from({ length: 11 }, (_, index) =>
      `line ${index + 1}`,
    ).join('\n')
    expect(
      composerHoldsOtherText(
        framed(['│ >  │']),
        framed(['│ > [Pasted text #7 +11 lines] │']),
        content,
      ),
    ).toBe(true)
  })

})
