import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isTerminalAgentWorking, TmuxTerminalSessionController } from './terminal-session.js'
import {
  createIsolatedTmuxRoot, eventually, stopIsolatedTmuxServer, waitForProcessCommand,
} from './tmux-test-helpers.js'

const exec = promisify(execFile)
let tmuxRoot = ''
const directories: string[] = []

beforeEach(async () => {
  tmuxRoot = await createIsolatedTmuxRoot()
  vi.stubEnv('HOME', tmuxRoot)
  vi.stubEnv('TMUX_TMPDIR', tmuxRoot)
  vi.stubEnv('TMUX', '')
})

afterEach(async () => {
  await stopIsolatedTmuxServer(tmuxRoot)
  vi.unstubAllEnvs()
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('Idle-only native queue delivery', () => {
  it('ignores pane padding when reading the native busy footer', () => {
    expect(isTerminalAgentWorking('\u257b\u2584\u2584\n\u2503\n\u2579\u2580\u2580\nWorking - esc interrupt\n' + '\n'.repeat(24)))
      .toBe(true)
  })

  it('does not treat quoted draft text as the native busy footer', () => {
    expect(isTerminalAgentWorking('\u257b\u2584\u2584\n\u2503 Explain esc interrupt\n\u2579\u2580\u2580\n / commands\n'))
      .toBe(false)
  })

  // What the fake Copilot draws below its prompt once busy, with the prompt
  // empty and then holding text, and what its event log says once the paste
  // has started that work. Until then the turn is over and a shell runs.
  const lagging = { turnOver: true, shellsRunning: true }
  const busyFooters = {
    work: { rows: ['Working - esc interrupt', 'Working - esc interrupt'], logged: lagging },
    'a wait for background agents': {
      rows: [
        ' ◉ Waiting for background agents ctrl+c stop agents',
        ' ◉ Waiting for background agents ctrl+c clear input · ctrl+q enqueue',
      ],
      logged: lagging,
    },
    // Cut short to fit beside a pasted message, these rows no longer say
    // what runs; only the event log can.
    'cut-short work': {
      rows: [' ◉ Working ctrl+c interrupt', '  ctrl+c interrupt · ctrl+q enqueue'],
      logged: { turnOver: false, shellsRunning: true },
    },
    'a cut-short wait for background agents': {
      rows: [
        ' ◉ Waiting for background agents ctrl+c stop agents',
        ' ◉ Waiting for backgr ctrl+c clear input · ctrl+q enqueue',
      ],
      logged: { turnOver: false, shellsRunning: true },
    },
    // A busy row no running shell explains, before the log has its turn.
    'cut-short work after the last shell': {
      rows: [' ◉ Working ctrl+c interrupt', '  ctrl+c interrupt · ctrl+q enqueue'],
      logged: { turnOver: true, shellsRunning: false },
    },
  }

  it.each([
    ['work', 'before paste', 'sendWhenIdle'],
    ['work', 'after paste', 'sendWhenIdle'],
    // A retained form answer is held to the same idle-only admission.
    ['work', 'before paste', 'send idleOnly'],
    ['work', 'after paste', 'send idleOnly'],
    // So is a queued prompt typed in while Copilot waits for background
    // shells, and background agents hold it however idle their prompt looks.
    ['work', 'before paste', 'send backgroundShellsOnly'],
    ['work', 'after paste', 'send backgroundShellsOnly'],
    ['a wait for background agents', 'before paste', 'send backgroundShellsOnly'],
    ['a wait for background agents', 'after paste', 'send backgroundShellsOnly'],
    ['cut-short work', 'after paste', 'send backgroundShellsOnly'],
    ['a cut-short wait for background agents', 'after paste', 'send backgroundShellsOnly'],
    ['cut-short work after the last shell', 'after paste', 'send backgroundShellsOnly'],
  ] as const)('does not steer %s that starts %s via %s', async (busy, timing, via) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'native-queue-admission-'))
    directories.push(directory)
    const id = randomUUID()
    const executable = path.join(directory, 'copilot-queue-admission.mjs')
    const receipt = path.join(directory, 'receipt.json')
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    await writeFile(receipt, JSON.stringify({ pastes: [], submits: 0 }))
    await writeFile(executable, `
import { writeFileSync, renameSync } from 'node:fs'
const receipt = ${JSON.stringify(receipt)}
const state = { pastes: [], submits: 0 }
const save = () => {
  writeFileSync(receipt + '.tmp', JSON.stringify(state))
  renameSync(receipt + '.tmp', receipt)
}
const busy = ${JSON.stringify(busyFooters[busy].rows)}
const draw = (text = '', working = false) => process.stdout.write(
  '\\x1b[2J\\x1b[H' + [
    '\\u257b\\u2584\\u2584\\u2584\\u2584',
    '\\u2503 ' + text,
    '\\u2579\\u2580\\u2580\\u2580\\u2580',
    working ? busy[text ? 1 : 0] : ' / commands',
  ].join('\\r\\n'),
)
let input = ''
let pasted
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?2004h')
process.stdin.on('data', (data) => {
  input += data.toString()
  const end = input.indexOf('\\x1b[201~')
  if (pasted === undefined && end >= 0) {
    pasted = input.slice(input.indexOf('\\x1b[200~') + 6, end)
    input = input.slice(end + 6)
    state.pastes.push(pasted)
    save()
    draw(pasted, true)
  }
  if (pasted !== undefined && /[\\r\\x11]/.test(input)) {
    state.submits += 1
    input = ''
    save()
  }
})
draw('', ${timing === 'before paste'})
`)
    const name = `queue-admission-${process.pid}`
    await exec('tmux', ['new-session', '-d', '-s', name, process.execPath, executable, '--session-id', id])
    const pid = Number((await exec('tmux', ['display-message', '-p', '-t', name, '#{pane_pid}'])).stdout.trim())
    await waitForProcessCommand(pid, [executable])
    const stateDirectory = path.join(copilotHome, 'session-state', id)
    await mkdir(stateDirectory, { recursive: true })
    await writeFile(path.join(stateDirectory, `inuse.${pid}.lock`), `${pid}\n`)
    const controller = new TmuxTerminalSessionController()
    await eventually(() => controller.capture(id), (pane) => Boolean(pane?.includes('\u2579')))
    const eventLog = async () =>
      JSON.parse(await readFile(receipt, 'utf8')).pastes.length ? busyFooters[busy].logged : lagging
    const sending = via === 'sendWhenIdle'
      ? controller.sendWhenIdle(id, 'Keep this queued work')
      : controller.send(id, 'Keep this queued work', false, via === 'send idleOnly'
        ? { idleOnly: true }
        : { allowDuringAgentExecution: true, backgroundShellsOnly: { eventLog } })
    await expect(sending).rejects.toMatchObject({
      statusCode: 409,
      ...(timing === 'after paste'
        ? { uncertainDelivery: true }
        : {
            uncertainDelivery: false,
            reasonCode: 'terminal-not-ready.queue',
          }),
    })
    expect(JSON.parse(await readFile(receipt, 'utf8'))).toEqual({
      pastes: timing === 'after paste' ? ['Keep this queued work'] : [],
      submits: 0,
    })
    if (timing === 'after paste') {
      expect(await controller.capture(id)).toContain('Keep this queued work')
    }
  }, 15_000)
})

describe('Queued delivery beside background shells', () => {
  // Copilot's prompt, free while it waits for shells its last turn started,
  // and what can take its place: somebody's draft, a question (empty, or
  // holding the pasted text as its freeform answer), or a full-screen view.
  // F5 opens the `opened` screen, as a question opening at any moment would.
  // The event log keeps saying the turn is over and a shell runs, as it does
  // while it lags behind the pane.
  type Screens = { start: string; pasted: string; submitted?: string; opened?: string }
  const fakeCopilot = (receipt: string, screens: Screens) => `
import { writeFileSync, renameSync } from 'node:fs'
const receipt = ${JSON.stringify(receipt)}
const screens = ${JSON.stringify(screens)}
const state = { pastes: [], submits: 0 }
const save = () => {
  writeFileSync(receipt + '.tmp', JSON.stringify(state))
  renameSync(receipt + '.tmp', receipt)
}
const composer = (text, footer) =>
  ['\\u257b\\u2584\\u2584\\u2584\\u2584', '\\u2503 ' + text, '\\u2579\\u2580\\u2580\\u2580\\u2580', footer]
const shells = ' \\u25cf Waiting for background shells ctrl+c interrupt'
const typing = ' \\u25cf Waitin\\u2026 \\u00b7 136 B ctrl+c interrupt \\u00b7 ctrl+q enqueue'
const question = (answer) => [
  '\\u256d' + '\\u2500'.repeat(40) + '\\u256e',
  ...['Question', 'Describe your deployment plan.', '', '\\u276f ' + answer, '', 'enter to submit \\u00b7 esc to cancel']
    .map((row) => '\\u2502 ' + row.padEnd(39) + '\\u2502'),
  '\\u2570' + '\\u2500'.repeat(40) + '\\u256f',
]
const draw = (name, text = '') => process.stdout.write('\\x1b[2J\\x1b[H' + {
  shells: () => composer('', shells),
  typing: () => composer(text, typing),
  draft: () => composer('My own unsent draft', typing),
  question: () => question('Type your answer...'),
  answered: () => question(text),
  overlay: () => [
    ' Session history', '', ' \\u276f Earlier conversation', '   Another conversation', '',
    ' \\u2191/\\u2193 to navigate \\u00b7 enter to select \\u00b7 esc to close',
  ],
}[name]().join('\\r\\n'))
let input = ''
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?2004h')
process.stdin.on('data', (data) => {
  input += data.toString()
  if (screens.opened && input.includes('\\x1b[15~')) {
    input = input.replace('\\x1b[15~', '')
    draw(screens.opened)
  }
  for (let end = input.indexOf('\\x1b[201~'); end >= 0; end = input.indexOf('\\x1b[201~')) {
    const pasted = input.slice(input.indexOf('\\x1b[200~') + 6, end)
    input = input.slice(end + 6)
    state.pastes.push(pasted)
    save()
    draw(screens.pasted, pasted)
  }
  if (state.pastes.length && /[\\r\\x11]/.test(input)) {
    state.submits += 1
    input = ''
    save()
    if (screens.submitted) draw(screens.submitted)
  }
})
draw(screens.start)
`
  const lagging = async () => ({ turnOver: true, shellsRunning: true })
  const quietRefusal = { statusCode: 409, uncertainDelivery: false, reasonCode: 'terminal-not-ready.queue' }

  async function startCopilot(screens: Screens, drawn: string) {
    const directory = await mkdtemp(path.join(tmpdir(), 'native-queue-shells-'))
    directories.push(directory)
    const id = randomUUID()
    const executable = path.join(directory, 'copilot-queue-shells.mjs')
    const receipt = path.join(directory, 'receipt.json')
    const copilotHome = path.join(directory, 'copilot-home')
    vi.stubEnv('COPILOT_HOME', copilotHome)
    await writeFile(receipt, JSON.stringify({ pastes: [], submits: 0 }))
    await writeFile(executable, fakeCopilot(receipt, screens))
    const name = `queue-shells-${process.pid}`
    await exec('tmux', ['new-session', '-d', '-s', name, process.execPath, executable, '--session-id', id])
    const pid = Number((await exec('tmux', ['display-message', '-p', '-t', name, '#{pane_pid}'])).stdout.trim())
    await waitForProcessCommand(pid, [executable])
    const stateDirectory = path.join(copilotHome, 'session-state', id)
    await mkdir(stateDirectory, { recursive: true })
    await writeFile(path.join(stateDirectory, `inuse.${pid}.lock`), `${pid}\n`)
    const controller = new TmuxTerminalSessionController()
    await eventually(() => controller.capture(id), (pane) => Boolean(pane?.includes(drawn)))
    const shows = (text: string) => eventually(() => controller.capture(id), (pane) => Boolean(pane?.includes(text)))
    return {
      send: (content: string, eventLog = lagging) =>
        controller.send(id, content, false, { allowDuringAgentExecution: true, backgroundShellsOnly: { eventLog } }),
      shows,
      // An event log whose `read`-th reading opens the question before it
      // answers, as the pane can change at any point while the log is read.
      questionOpensDuring: (read: number) => {
        let reads = 0
        return async () => {
          reads += 1
          if (reads === read) {
            await exec('tmux', ['send-keys', '-t', name, 'F5'])
            await shows('Question')
          }
          return lagging()
        }
      },
      received: async () => JSON.parse(await readFile(receipt, 'utf8')),
    }
  }

  // Nothing was typed, so the prompt waits at the head of the queue rather
  // than holding it in error.
  it.each([
    ['a draft', 'draft', 'My own unsent draft'],
    ['a question', 'question', 'Question'],
    ['a full-screen view', 'overlay', 'Session history'],
  ] as const)('refuses quietly when %s holds the prompt before the paste', async (_, start, drawn) => {
    const copilot = await startCopilot({ start, pasted: 'typing' }, drawn)
    await expect(copilot.send('Keep this queued work')).rejects.toMatchObject(quietRefusal)
    expect(await copilot.received()).toEqual({ pastes: [], submits: 0 })
  }, 15_000)

  it('refuses quietly when a question follows a delivered prompt', async () => {
    const copilot = await startCopilot({ start: 'shells', pasted: 'typing', submitted: 'question' }, 'shells')
    await expect(copilot.send('First queued work')).resolves.toBe(true)
    expect(await copilot.shows('Question')).toContain('Type your answer')
    await expect(copilot.send('Keep this queued work')).rejects.toMatchObject(quietRefusal)
    expect(await copilot.received()).toEqual({ pastes: ['First queued work'], submits: 1 })
  }, 15_000)

  // Enter would answer it with the queued text, and a freeform answer holding
  // that text no longer reads as a question at all.
  it('does not press Enter into a question opened after the paste', async () => {
    const copilot = await startCopilot({ start: 'shells', pasted: 'answered' }, 'shells')
    await expect(copilot.send('Keep this queued work')).rejects.toMatchObject({
      statusCode: 409,
      uncertainDelivery: true,
    })
    expect(await copilot.received()).toEqual({ pastes: ['Keep this queued work'], submits: 0 })
    expect(await copilot.shows('Question')).toContain('\u276f Keep this queued work')
  }, 15_000)

  // The pane is captured after the event log is read, so a question opened
  // while it was read is seen before the keys that would answer it.
  it('refuses quietly when a question opens while the event log is read before the paste', async () => {
    const copilot = await startCopilot({ start: 'shells', pasted: 'answered', opened: 'question' }, 'shells')
    await expect(copilot.send('Keep this queued work', copilot.questionOpensDuring(1)))
      .rejects.toMatchObject(quietRefusal)
    expect(await copilot.received()).toEqual({ pastes: [], submits: 0 })
  }, 15_000)

  it('does not press Enter when a question opens while the event log is read after the paste', async () => {
    const copilot = await startCopilot({ start: 'shells', pasted: 'typing', opened: 'question' }, 'shells')
    await expect(copilot.send('Keep this queued work', copilot.questionOpensDuring(2))).rejects.toMatchObject({
      statusCode: 409,
      uncertainDelivery: true,
    })
    expect(await copilot.received()).toEqual({ pastes: ['Keep this queued work'], submits: 0 })
  }, 15_000)
})
