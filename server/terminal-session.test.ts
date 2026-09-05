import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isTerminalAgentWorking,
  isTerminalDesktopInstallPrompt,
  isTerminalOverlay,
  isTerminalSessionInUsePrompt,
  composerHoldsOtherText,
  composerHoldsText,
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
  TmuxTerminalSessionController,
} from './terminal-session.js'
import {
  createIsolatedTmuxRoot,
  isolatedTmuxEnv,
  eventually,
  stopIsolatedTmuxServer,
  waitForProcessCommand,
} from './tmux-test-helpers.js'

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

function readyComposer(text = '', working = false): string {
  return [
    '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
    `┃ ${text}`,
    '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
    working ? ' ◉ Working · esc interrupt' : ' / commands',
  ].join('\n')
}

const shellReadyComposer =
  "printf '\\033[2J\\033[H╻▄▄▄▄\\n┃ \\n╹▀▀▀▀\\n\\033[2A\\033[2C'"

async function deliveryFixture(working: boolean, nextPane?: string, repaintPane?: string) {
  const directory = await mkdtemp(path.join(tmpdir(), 'terminal-delivery-test-'))
  directories.push(directory)
  const executable = path.join(directory, 'copilot-delivery.mjs')
  const output = path.join(directory, 'received.json')
  const sessionId = randomUUID()
  await writeFile(output, '')
  await writeFile(executable, `
import { writeFileSync } from 'node:fs'
let input = ''
let pasted
const received = { pastes: [], submits: [] }
const draw = (pane) => process.stdout.write('\\x1b[2J\\x1b[H' + pane.replaceAll('\\n', '\\r\\n'))
const composer = ${readyComposer.toString()}
const repaint = ${JSON.stringify(repaintPane)}
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?2004h')
process.stdin.on('data', (data) => {
  if (repaint !== undefined && data.includes(29)) {
    draw(repaint)
    return
  }
  input += data.toString()
  const end = input.indexOf('\\x1b[201~')
  if (pasted === undefined && end >= 0) {
    pasted = input.slice(input.indexOf('\\x1b[200~') + 6, end).replace(/\\r\\n?/g, '\\n')
    input = input.slice(end + 6)
    received.pastes.push(pasted)
    writeFileSync(${JSON.stringify(output)}, JSON.stringify(received))
    draw(composer(pasted, ${working}))
  }
  if (pasted !== undefined && /[\\r\\x11]/.test(input)) {
    received.submits.push(input.includes('\\x11') ? 'queue' : 'enter')
    writeFileSync(${JSON.stringify(output)}, JSON.stringify(received))
    input = ''
    pasted = undefined
    draw(${JSON.stringify(nextPane)} ?? composer('', ${working}))
  }
})
draw(composer('', ${working}))
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
  await eventually(() => controller.capture(sessionId), (pane) => Boolean(pane?.includes('╹')))
  return { controller, sessionId, output, directory, tmuxSession }
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
})

describe('TmuxTerminalSessionController', () => {
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
import { writeFileSync } from 'node:fs'
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
    writeFileSync(${JSON.stringify(output)}, JSON.stringify({ content: pasted, enters, queued: input.includes('\\x11') }))
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
    ['ordinary text with a command allowance', readyComposer('', true), 'Do not interrupt', false, { allowDuringAgentExecution: true }],
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
    await expect(controller.send(sessionId, 'Must not reach the overlay', true))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(repainted).toBe(true)
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
import { writeFileSync } from 'node:fs'
let selected = 1
let pending = ''
function finish(decision) {
  writeFileSync(${JSON.stringify(output)}, JSON.stringify({ decision }))
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
import { writeFileSync } from 'node:fs'
let selected = 0
let pending = ''
function finish(action) {
  writeFileSync(${JSON.stringify(output)}, JSON.stringify(
    action === 'accept' ? { accepted: selected === 0 } : { action }))
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
    expect(await readFile(output, 'utf8')).toBe('arrives after both prompts')
  })

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
  })

  it('reads typed input as held text', () => {
    expect(composerHoldsText(framed(['│ > half a thought  │']))).toBe(true)
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
