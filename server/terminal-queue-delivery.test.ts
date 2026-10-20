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

  it.each([
    ['before paste', 'sendWhenIdle'],
    ['after paste', 'sendWhenIdle'],
    // A retained form answer is held to the same idle-only admission.
    ['before paste', 'send idleOnly'],
    ['after paste', 'send idleOnly'],
  ] as const)('does not steer work that starts %s via %s', async (timing, via) => {
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
const draw = (text = '', working = false) => process.stdout.write(
  '\\x1b[2J\\x1b[H' + [
    '\\u257b\\u2584\\u2584\\u2584\\u2584',
    '\\u2503 ' + text,
    '\\u2579\\u2580\\u2580\\u2580\\u2580',
    working ? 'Working - esc interrupt' : ' / commands',
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
    const sending = via === 'sendWhenIdle'
      ? controller.sendWhenIdle(id, 'Keep this queued work')
      : controller.send(id, 'Keep this queued work', false, { idleOnly: true })
    await expect(sending).rejects.toMatchObject({
      statusCode: 409,
      ...(timing === 'after paste' ? { uncertainDelivery: true } : {}),
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
