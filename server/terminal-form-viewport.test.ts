import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  parseTerminalFormPrompt, terminalFormShowsFields,
  TerminalFormReplyError, TmuxTerminalSessionController,
} from './terminal-session.js'
import { createIsolatedTmuxRoot, eventually, stopIsolatedTmuxServer, waitForProcessCommand } from './tmux-test-helpers.js'

const exec = promisify(execFile)
let root: string

beforeEach(async () => {
  root = await createIsolatedTmuxRoot()
  vi.stubEnv('HOME', root)
  vi.stubEnv('TMUX_TMPDIR', root)
  vi.stubEnv('TMUX', '')
})

afterEach(async () => {
  await stopIsolatedTmuxServer(root)
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

async function formFixture(lines = 52, repaint = true, options: {
  footer?: string[]
  width?: number
  height?: number
} = {}) {
  const output = path.join(root, 'receipt.json')
  const executable = path.join(root, 'copilot-clipped-form.mjs')
  const question = [
    '**Synthetic confirmation — no operations will be executed.**',
    '```json',
    ...Array.from({ length: lines }, (_, index) => `  "setting_${index}": "retain every payload character",`),
    '```',
    'Please choose the non-default value.',
  ].join('\n')
  const field = 'Synthetic decision'
  await writeFile(executable, `
import { writeFileSync } from 'node:fs'
const output = ${JSON.stringify(output)}
let pending = '', selected = 0, closed = false, second = false
const receipt = { keys: [], actions: [], heights: [] }
function save() { writeFileSync(output, JSON.stringify(receipt)) }
function draw() {
  receipt.heights.push(process.stdout.rows)
  save()
  const lines = closed ? ['Finished', '╻▄▄▄▄▄▄▄▄', '┃', '╹▀▀▀▀▀▀▀▀', ' / commands'] : [
    ' Copilot needs information.',
    ...${JSON.stringify(question)}.split('\\n').map(line => ' ' + line),
    ...(second ? [' Second synthetic question.'] : []),
    '', ' ${field}:',
    ...['Default', 'Non-default'].map((label, index) => (index === selected ? ' ❯ ' : '   ') + label),
    '', ...${JSON.stringify(options.footer || [' ↑/↓ select · enter accept · ctrl+d decline · esc cancel'])},
    '─'.repeat(process.stdout.columns),
  ]
  process.stdout.write('\\x1b[2J\\x1b[H' + lines.slice(-(process.stdout.rows - 1)).join('\\r\\n'))
}
function finish(action) {
  receipt.actions.push({ action, selected })
  closed = true
  draw()
}
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?1049h')
process.stdout.on('resize', () => { if (${repaint}) draw() })
process.stdin.on('data', data => {
  pending += data.toString()
  while (pending) {
    if (pending[0] === '\\x1b') {
      if (pending.length < 3) {
        setTimeout(() => {
          if (pending === '\\x1b') {
            receipt.keys.push('Escape'); pending = ''; finish('cancel')
          }
        }, 25)
        return
      }
      const key = pending[2]
      receipt.keys.push(key === 'A' ? 'Up' : 'Down')
      selected = key === 'A' ? Math.max(0, selected - 1) : Math.min(1, selected + 1)
      pending = pending.slice(3)
      draw()
    } else {
      const key = pending[0]
      pending = pending.slice(1)
      if (closed && key === 'n') { second = true; closed = false; selected = 0; draw(); continue }
      receipt.keys.push(key === '\\x04' ? 'C-d' : 'Enter')
      finish(key === '\\x04' ? 'decline' : 'accept')
    }
  }
})
draw()
`)
  const sessionId = randomUUID()
  const tmux = `form-${sessionId.slice(0, 8)}`
  await exec('tmux', [
    'new-session', '-d', '-s', tmux, '-x', String(options.width || 120), '-y', String(options.height || 40),
    process.execPath, executable, '--session-id', sessionId,
  ])
  const pid = Number((await exec('tmux', ['display-message', '-p', '-t', tmux, '#{pane_pid}'])).stdout.trim())
  await waitForProcessCommand(pid, [executable])
  const home = path.join(root, 'copilot-home')
  const session = path.join(home, 'session-state', sessionId)
  await mkdir(session, { recursive: true })
  await writeFile(path.join(session, `inuse.${pid}.lock`), `${pid}\n`)
  vi.stubEnv('COPILOT_HOME', home)
  const controller = new TmuxTerminalSessionController()
  const identity = { question, fields: [field] }
  const steps = [{ kind: 'select' as const, optionCount: 2, index: 1 }]
  const capture = async (history = '-40') => (await exec('tmux', [
    'capture-pane', '-J', '-p', '-t', tmux, '-S', history,
  ])).stdout
  await eventually(capture, (pane) => pane.includes('esc cancel'))
  const geometry = async () => ({
    dimensions: (await exec('tmux', ['display-message', '-p', '-t', tmux, '#{window_width}x#{window_height}'])).stdout.trim(),
    localPolicy: (await exec('tmux', ['show-options', '-wqv', '-t', tmux, 'window-size'])).stdout.trim(),
  })
  const receipt = async () => JSON.parse(await readFile(output, 'utf8')) as {
    keys: string[]; actions: { action: string; selected: number }[]; heights: number[]
  }
  const next = async () => {
    await exec('tmux', ['send-keys', '-t', tmux, '-l', 'n'])
    await eventually(capture, (pane) => pane.includes('Second synthetic question.'))
    return { ...identity, question: question + '\nSecond synthetic question.' }
  }
  return { controller, identity, steps, sessionId, tmux, capture, geometry, receipt, next }
}

describe('bounded terminal form viewport', () => {
  it.each(['accept', 'cancel', 'decline'] as const)(
    '%s reads wrapped controls on successive clipped prompts and restores 80x24 each time', async (action) => {
      const f = await formFixture(52, true, {
        width: 80, height: 24,
        footer: [' ↑/↓ select · enter accept ·', ' ctrl+d decline · esc cancel'],
      })
      const before = await f.geometry()
      let identity = f.identity
      for (let stage = 0; stage < 2; stage += 1) {
        expect(parseTerminalFormPrompt(await f.capture('-200'))).toBe(false)
        if (stage === 1 && action === 'accept') {
          expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)).toBe(false)
          expect((await f.receipt()).actions).toHaveLength(1)
          expect(await f.geometry()).toEqual(before)
        }
        const result = action === 'accept'
          ? await f.controller.fillUserInputForm(f.sessionId, f.steps, identity)
          : await f.controller.dismissUserInput(f.sessionId, identity, action)
        expect(result).toBe(true)
        expect(await f.geometry()).toEqual(before)
        if (stage === 0) identity = await f.next()
      }
      expect((await f.receipt()).actions).toEqual([
        { action, selected: action === 'accept' ? 1 : 0 },
        { action, selected: action === 'accept' ? 1 : 0 },
      ])
    }, 20_000,
  )

  it.each([
    ['separator on the next line', [' ↑/↓ select · enter accept', ' · ctrl+d decline · esc cancel']],
    ['control words on separate lines', [' ↑/↓ select · enter', ' accept · ctrl+d decline · esc cancel']],
    ['all six trailing control lines', [' ↑/↓ select ·', ' space toggle ·', ' enter accept ·', ' tab next ·', ' shift+tab prev · ctrl+d decline ·', ' esc cancel']],
  ])('recognizes %s without relaxing exact question matching', async (_name, footer) => {
    const f = await formFixture(52, true, { footer: footer as string[] })
    const before = await f.geometry()
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)).toBe(true)
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).actions).toEqual([{ action: 'accept', selected: 1 }])
  }, 15_000)

  it.each([
    ['blockquote', [' > enter accept ·', ' > esc cancel']],
    ['quoted string', [' "enter accept ·', ' esc cancel"']],
    ['code fence', [' ```text', ' enter accept ·', ' esc cancel', ' ```']],
    ['arbitrary text', [' enter accept · malicious action ·', ' esc cancel']],
    ['text after controls', [' enter accept ·', ' esc cancel', ' unrelated output']],
    ['disconnected hints', [' enter accept ·', '', ' esc cancel']],
    ['unbounded controls', [' ↑/↓ select ·', ' space toggle ·', ' enter accept ·', ' tab next ·', ' shift+tab prev ·', ' ctrl+d', ' decline ·', ' esc cancel']],
    ['history above composer', [' enter accept ·', ' esc cancel', '╻▄▄▄▄▄▄▄▄', '┃', '╹▀▀▀▀▀▀▀▀', ' / commands']],
    ['history above rounded composer', [' enter accept ·', ' esc cancel', '╭────────╮', '│ >      │', '╰────────╯', ' / commands']],
  ])('does not enlarge a %s hint lookalike', async (_name, footer) => {
    const f = await formFixture(52, true, { footer: footer as string[] })
    const change = vi.spyOn(f.controller, 'changeFormViewport' as never)
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)).toBe(false)
    expect(change).not.toHaveBeenCalled()
    expect((await f.receipt()).keys).toEqual([])
  })

  it.each(['accept', 'cancel', 'decline'] as const)(
    '%s reads a clipped alternate-screen form and restores inherited size policy', async (action) => {
      const f = await formFixture()
      const before = await f.geometry()
      expect(before).toEqual({ dimensions: '120x40', localPolicy: '' })
      expect(parseTerminalFormPrompt(await f.capture())).toBe(false)
      expect(terminalFormShowsFields(await f.capture('-200'), f.identity)).toBe(false)

      const result = action === 'accept'
        ? await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)
        : await f.controller.dismissUserInput(f.sessionId, f.identity, action)

      expect(result).toBe(true)
      expect(await f.geometry()).toEqual(before)
      expect((await f.receipt()).actions).toEqual([{ action, selected: action === 'accept' ? 1 : 0 }])
      expect((await f.receipt()).keys.filter((key) => key === 'Enter')).toHaveLength(action === 'accept' ? 1 : 0)
      expect((await f.receipt()).heights).toContain(256)
    }, 15_000,
  )

  it.each(['manual', 'smallest', 'largest', 'latest'])('restores an explicit %s policy', async (policy) => {
    const f = await formFixture()
    await exec('tmux', ['set-option', '-w', '-t', f.tmux, 'window-size', policy])
    const before = await f.geometry()
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)).toBe(true)
    expect(await f.geometry()).toEqual(before)
  }, 15_000)

  it('does not resize a short form or submit a concurrent duplicate', async () => {
    const f = await formFixture(2)
    const change = vi.spyOn(f.controller, 'changeFormViewport' as never)
    const results = await Promise.all([
      f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
      f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ])
    expect(results).toEqual([true, false])
    expect(change).not.toHaveBeenCalled()
    expect((await f.receipt()).actions).toHaveLength(1)
  }, 15_000)

  it.each(['wrong question', 'no repaint', 'height limit'])('refuses %s without keys and restores size', async (problem) => {
    const f = await formFixture(problem === 'height limit' ? 300 : 52, problem !== 'no repaint')
    const before = await f.geometry()
    const identity = problem === 'wrong question'
      ? { ...f.identity, question: f.identity.question.replace('setting_0', 'different_0') }
      : f.identity
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, identity)).toBe(false)
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).keys).toEqual([])
  }, 15_000)

  it('refuses to enlarge a shared window', async () => {
    const f = await formFixture()
    await exec('tmux', ['split-window', '-d', '-t', f.tmux, 'sleep 300'])
    const before = await f.geometry()
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)).toBe(false)
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).keys).toEqual([])
    expect((await f.receipt()).heights).not.toContain(256)
  })

  it('refuses a window linked into another session with independently attached clients', async () => {
    const f = await formFixture()
    await exec('tmux', ['new-session', '-d', '-s', 'other-session', 'sleep 300'])
    await exec('tmux', ['link-window', '-s', `${f.tmux}:0`, '-t', 'other-session:1'])
    const before = await f.geometry()
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)).toBe(false)
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).keys).toEqual([])
  })

  it('does not resize a reused pane with a new process', async () => {
    const f = await formFixture()
    const change = f.controller['changeFormViewport'].bind(f.controller)
    f.controller['changeFormViewport'] = async (...args) => {
      if (!args[2]) await exec('tmux', ['respawn-pane', '-k', '-t', f.tmux, 'sleep 300'])
      return change(...args)
    }
    await expect(f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .rejects.toMatchObject({ outcome: 'not-submitted' })
    expect((await f.geometry()).dimensions).toBe('120x40')
    expect((await f.receipt()).keys).toEqual([])
  })

  it('restores size after a capture fails before any keys', async () => {
    const f = await formFixture()
    const read = f.controller['readFormViewport'].bind(f.controller)
    let fail = true
    f.controller['readFormViewport'] = async (...args) => {
      const viewport = await read(...args)
      if (viewport.height === 256 && fail) {
        fail = false
        throw new Error('Synthetic failed capture')
      }
      return viewport
    }
    await expect(f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .rejects.toMatchObject({ outcome: 'not-submitted' })
    expect(await f.geometry()).toEqual({ dimensions: '120x40', localPolicy: '' })
    expect((await f.receipt()).keys).toEqual([])
  })

  it('restores the viewport when its bounded operation budget expires', async () => {
    const f = await formFixture()
    const change = f.controller['changeFormViewport'].bind(f.controller)
    let clock: ReturnType<typeof vi.spyOn> | undefined
    f.controller['changeFormViewport'] = async (...args) => {
      await change(...args)
      if (!args[2]) clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 16_000)
    }
    try {
      await expect(f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
        .rejects.toMatchObject({ outcome: 'not-submitted', message: expect.stringContaining('timed out') })
    } finally {
      clock?.mockRestore()
    }
    expect(await f.geometry()).toEqual({ dimensions: '120x40', localPolicy: '' })
    expect((await f.receipt()).keys).toEqual([])
  })

  it.each(['owner', 'window'])('does not type or restore into a changed %s after expansion', async (changeKind) => {
    const f = await formFixture()
    const change = f.controller['changeFormViewport'].bind(f.controller)
    f.controller['changeFormViewport'] = async (...args) => {
      await change(...args)
      if (!args[2]) {
        if (changeKind === 'owner') {
          await exec('tmux', ['respawn-pane', '-k', '-t', f.tmux, 'sleep 300'])
        } else {
          const other = (await exec('tmux', [
            'new-window', '-d', '-P', '-F', '#{pane_id}', '-t', f.tmux, 'sleep 300',
          ])).stdout.trim()
          await exec('tmux', ['swap-pane', '-d', '-s', args[0].pane, '-t', other])
        }
      }
    }
    await expect(f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .rejects.toMatchObject({ outcome: 'not-submitted', uncertainDelivery: false })
    expect((await f.receipt()).keys).toEqual([])
  })

  it('does not overwrite sizing after an attached-client geometry change', async () => {
    const f = await formFixture()
    const read = f.controller['readFormViewport'].bind(f.controller)
    f.controller['readFormViewport'] = async (...args) => {
      const viewport = await read(...args)
      return viewport.height === 256
        ? { ...viewport, clients: 'synthetic-client\t1\t110\t70' }
        : viewport
    }
    await expect(f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .rejects.toMatchObject({ outcome: 'not-submitted' })
    expect(await f.geometry()).toEqual({ dimensions: '120x256', localPolicy: '' })
    expect((await f.receipt()).keys).toEqual([])
  })

  it.each(['size', 'policy'])('does not overwrite an external %s change at restoration', async (changeKind) => {
    const f = await formFixture()
    const change = f.controller['changeFormViewport'].bind(f.controller)
    f.controller['changeFormViewport'] = async (...args) => {
      if (args[2]) {
        await exec('tmux', changeKind === 'size'
          ? ['resize-window', '-t', f.tmux, '-x', '110', '-y', '70']
          : ['set-option', '-w', '-t', f.tmux, 'window-size', 'largest'])
      }
      return change(...args)
    }
    await expect(f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .rejects.toMatchObject({ outcome: 'submitted', uncertainDelivery: true })
    expect(await f.geometry()).toEqual(changeKind === 'size'
      ? { dimensions: '110x70', localPolicy: 'manual' }
      : { dimensions: '120x256', localPolicy: 'largest' })
    expect((await f.receipt()).actions).toEqual([{ action: 'accept', selected: 1 }])
  }, 15_000)

  it.each(['accept', 'cancel', 'decline'] as const)(
    'surfaces restoration failure without claiming %s was not sent', async (action) => {
    const f = await formFixture()
    const change = f.controller['changeFormViewport'].bind(f.controller)
    f.controller['changeFormViewport'] = async (...args) => {
      if (args[2]) throw new Error('Synthetic restoration failure')
      return change(...args)
    }
    const reply = action === 'accept'
      ? f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity)
      : f.controller.dismissUserInput(f.sessionId, f.identity, action)
    const error = await reply.catch((error) => error)
    expect(error).toBeInstanceOf(TerminalFormReplyError)
    expect(error).toMatchObject({ outcome: 'submitted', message: expect.stringContaining('cleanup failed') })
    expect((await f.receipt()).actions).toHaveLength(1)
    expect((await f.receipt()).keys.filter((key) => key === 'Enter')).toHaveLength(action === 'accept' ? 1 : 0)
  }, 15_000)
})
