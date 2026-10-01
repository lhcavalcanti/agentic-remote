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
  argumentOwned?: boolean
  question?: string
  narrowQuestion?: string[]
  unverifiedWidths?: number[]
} = {}) {
  const output = path.join(root, 'receipt.json')
  const executable = path.join(root, 'copilot-clipped-form.mjs')
  const question = options.question || [
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
const receipt = { keys: [], actions: [], heights: [], widths: [] }
function save() { writeFileSync(output, JSON.stringify(receipt)) }
function draw() {
  receipt.heights.push(process.stdout.rows)
  receipt.widths.push(process.stdout.columns)
  save()
  const lines = closed ? ['Finished', '╻▄▄▄▄▄▄▄▄', '┃', '╹▀▀▀▀▀▀▀▀', ' / commands'] : [
    ' Copilot needs information.',
    ...((process.stdout.columns < 160 ||
      ${JSON.stringify(options.unverifiedWidths || [])}.includes(process.stdout.columns)) &&
      ${Boolean(options.narrowQuestion)}
      ? ${JSON.stringify(options.narrowQuestion || [])}
      : ${JSON.stringify(question)}.split('\\n')).map(line => ' ' + line),
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
  const home = path.join(root, 'copilot-home')
  await exec('tmux', [
    'new-session', '-d', '-s', tmux, '-x', String(options.width || 120), '-y', String(options.height || 40),
    ...(options.argumentOwned === false ? [] : ['-e', `COPILOT_HOME=${home}`]),
    process.execPath, executable, '--session-id', sessionId,
  ])
  const pid = Number((await exec('tmux', ['display-message', '-p', '-t', tmux, '#{pane_pid}'])).stdout.trim())
  await waitForProcessCommand(pid, [executable])
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
    keys: string[]; actions: { action: string; selected: number }[]; heights: number[]; widths: number[]
  }
  const next = async () => {
    await exec('tmux', ['send-keys', '-t', tmux, '-l', 'n'])
    await eventually(capture, (pane) => pane.includes('Second synthetic question.'))
    return { ...identity, question: question + '\nSecond synthetic question.' }
  }
  return { controller, identity, steps, sessionId, tmux, capture, geometry, receipt, next }
}

async function horizontalFormFixture(options: {
  activeField?: number
  fields?: string[]
  fullWidth?: number
  width?: number
  height?: number
  repaint?: boolean
  lookalikeTabs?: boolean
  textField?: number
  question?: string
  argumentOwned?: boolean
  nested?: boolean
} = {}) {
  const output = path.join(root, 'horizontal-receipt.json')
  const executable = path.join(root, 'copilot-horizontal-form.mjs')
  const question = options.question ||
    'The promotion script requires rollout metadata and an explicit M365 bypass. ' +
    'All three names contain `-m365`, so automation otherwise refuses them; GB200 ' +
    'also has the acknowledged API test failure. Confirm the exact rollout settings.'
  const fields = options.fields || [
    'Release tag',
    'Group tag',
    'Is this a livesite rollout?',
    'Approve M365 promotion bypass',
    'Continue on existing model-definition conflicts',
  ]
  await writeFile(executable, `
import { writeFileSync } from 'node:fs'
const output = ${JSON.stringify(output)}
const question = ${JSON.stringify(question)}
const fields = ${JSON.stringify(fields)}
const lookalikeTabs = ${options.lookalikeTabs === true}
const fullWidth = ${options.fullWidth || 200}
const textField = ${options.textField ?? -1}
let textValue = 'Default synthetic model IDs'
let pending = '', active = ${options.activeField || 0}, closed = false
const selected = Array(fields.length).fill(0)
const accepted = [...selected]
const receipt = { keys: [], actions: [], widths: [] }
function save() { writeFileSync(output, JSON.stringify(receipt)) }
function tabs() {
  if (lookalikeTabs) return '  Different release   Unrelated field  →'
  if (process.stdout.columns >= fullWidth) return '  ' + fields.join('   ')
  if (active === 0) return '  ' + fields.slice(0, 4).join('   ') + '  →'
  if (active === fields.length - 1) {
    return '  ←  ' + fields.slice(1).join('   ')
  }
  return '  ←  ' + fields.slice(1, 4).join('   ') + '  →'
}
function draw() {
  receipt.widths.push(process.stdout.columns)
  save()
  const lines = closed ? ['Finished', '╻▄▄▄▄▄▄▄▄', '┃', '╹▀▀▀▀▀▀▀▀', ' / commands'] : [
    ' Copilot needs information.',
    ...question.split('\\n').map(line => ' ' + line),
    '',
    tabs(),
    '',
    ' ' + fields[active] + ':',
    ...(active === textField ? [
      '─'.repeat(process.stdout.columns),
      ' ❯ ' + textValue,
      '─'.repeat(process.stdout.columns),
    ] : [
      selected[active] === 0 ? ' ❯ Yes' : accepted[active] === 0 ? ' ✓ Yes' : '   Yes',
      selected[active] === 1 ? ' ❯ No' : accepted[active] === 1 ? ' ✓ No' : '   No',
      '   Other (type your answer)',
    ]),
    '',
    active === textField
      ? ' enter accept · shift+tab prev · ctrl+d decline · esc cancel'
      : ' ↑/↓ select · enter accept · tab next · ctrl+d decline · esc cancel',
    '─'.repeat(process.stdout.columns),
  ]
  process.stdout.write(
    '\\x1b[2J\\x1b[H' +
    lines.slice(-(process.stdout.rows - 1)).join('\\r\\n'),
  )
}
function finish(action) {
  receipt.actions.push({
    action, selected: [...accepted],
    ...(textField >= 0 ? { textValue } : {}),
  })
  closed = true
  draw()
}
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?1049h\\x1b[?2004h')
process.stdout.on('resize', () => { if (${options.repaint !== false}) draw() })
process.stdin.on('data', data => {
  pending += data.toString()
  while (pending) {
    if (pending.startsWith('\\x1b[200~')) {
      const end = pending.indexOf('\\x1b[201~')
      if (end < 0) return
      if (active === textField) textValue += pending.slice(6, end)
      receipt.keys.push('paste')
      pending = pending.slice(end + 6)
      draw()
      continue
    }
    if (pending.length > 1 && '\\x1b[200~'.startsWith(pending)) return
    if (pending[0] === '\\x1b') {
      if (pending.length < 3) {
        setTimeout(() => {
          if (pending === '\\x1b') {
            receipt.keys.push('Escape')
            pending = ''
            finish('cancel')
          }
        }, 25)
        return
      }
      const key = pending[2]
      if (key === 'Z') {
        receipt.keys.push('BTab')
        active = Math.max(0, active - 1)
        selected[active] = accepted[active]
      } else {
        receipt.keys.push(key === 'A' ? 'Up' : 'Down')
        selected[active] = key === 'A'
          ? Math.max(0, selected[active] - 1)
          : Math.min(1, selected[active] + 1)
      }
      pending = pending.slice(3)
      draw()
      continue
    }
    const key = pending[0]
    pending = pending.slice(1)
    if (key === '\\x15') {
      receipt.keys.push('C-u')
      textValue = ''
      draw()
    } else if (key === '\\t') {
      receipt.keys.push('Tab')
      active = Math.min(fields.length - 1, active + 1)
      selected[active] = accepted[active]
      draw()
    } else if (key === '\\r') {
      receipt.keys.push('Enter')
      if (active !== textField) accepted[active] = selected[active]
      if (active === fields.length - 1) {
        finish('accept')
      } else {
        active += 1
        selected[active] = accepted[active]
        draw()
      }
    } else if (key === '\\x04') {
      receipt.keys.push('C-d')
      finish('decline')
    }
  }
})
draw()
`)
  const sessionId = randomUUID()
  const tmux = `horizontal-${sessionId.slice(0, 8)}`
  const home = path.join(root, 'copilot-home')
  const launcher = path.join(root, 'copilot-form-launcher.mjs')
  if (options.nested) {
    await writeFile(launcher, `
import { spawn } from 'node:child_process'
const child = spawn(process.execPath, process.argv.slice(2), { stdio: 'inherit' })
child.on('exit', () => process.exit())
`)
  }
  await exec('tmux', [
    'new-session', '-d', '-s', tmux, '-x', String(options.width || 120),
    '-y', String(options.height || 29),
    ...(options.argumentOwned === false ? [] : ['-e', `COPILOT_HOME=${home}`]),
    process.execPath, ...(options.nested ? [launcher] : []),
    executable, '--session-id', sessionId,
  ])
  const pid = Number((await exec(
    'tmux', ['display-message', '-p', '-t', tmux, '#{pane_pid}'],
  )).stdout.trim())
  await waitForProcessCommand(pid, [executable])
  const session = path.join(home, 'session-state', sessionId)
  await mkdir(session, { recursive: true })
  await writeFile(path.join(session, `inuse.${pid}.lock`), `${pid}\n`)
  vi.stubEnv('COPILOT_HOME', home)
  const controller = new TmuxTerminalSessionController()
  const identity = { question, fields }
  const steps = fields.map((_, index) => index === options.textField
    ? { kind: 'text' as const, value: 'control-model-001, treatment-model-001' }
    : { kind: 'select' as const, optionCount: 3, index: index % 2 })
  const capture = async () => (await exec('tmux', [
    'capture-pane', '-J', '-p', '-t', tmux, '-S', '-40',
  ])).stdout
  await eventually(capture, (pane) => pane.includes('esc cancel'))
  const geometry = async () => ({
    dimensions: (await exec(
      'tmux', ['display-message', '-p', '-t', tmux, '#{window_width}x#{window_height}'],
    )).stdout.trim(),
    localPolicy: (await exec(
      'tmux', ['show-options', '-wqv', '-t', tmux, 'window-size'],
    )).stdout.trim(),
  })
  const receipt = async () => JSON.parse(await readFile(output, 'utf8')) as {
    keys: string[]
    actions: { action: string; selected: number[]; textValue?: string }[]
    widths: number[]
  }
  return { controller, identity, steps, sessionId, tmux, capture, geometry, receipt }
}

async function textFieldFormFixture(clipped: boolean, activeField = 1, nested = false) {
  const question = clipped
    ? Array.from({ length: 24 }, (_, index) =>
        `Synthetic routing choice ${index}: retain the exact approved model identifiers.`).join('\n')
    : 'Choose the synthetic routing shape and model identifiers.'
  return horizontalFormFixture({
    activeField,
    fields: ['Routing paths', 'New dev model IDs'],
    textField: 1,
    fullWidth: 80,
    width: 80,
    height: 24,
    question,
    nested,
  })
}

describe('bounded terminal form viewport', () => {
  it('tries another bounded reflow when maximum-width wrapping remains ambiguous', async () => {
    const prefix = 'Synthetic confirmation only. The old catalog '.padEnd(65, 'x')
    const question = `${prefix}model/endpoint inventory remains historical.`
    const f = await formFixture(0, true, {
      width: 80, height: 40, question,
      narrowQuestion: [`${prefix}model/`, 'endpoint inventory remains historical.'],
      unverifiedWidths: [256],
    })
    const before = await f.geometry()
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .toBe(true)
    expect(await f.geometry()).toEqual(before)
    const receipt = await f.receipt()
    expect(receipt.widths).toContain(256)
    expect(receipt.widths).toContain(240)
    expect(Math.min(...receipt.widths)).toBeGreaterThanOrEqual(80)
    expect(receipt.actions).toEqual([{ action: 'accept', selected: 1 }])
    expect(receipt.keys.filter(key => key === 'Enter')).toHaveLength(1)
  }, 15_000)

  it.each([false, true])(
    'reflows a padded single-field question before exact verification (vertically clipped=%s)',
    async (clipped) => {
      const prefix = 'Synthetic confirmation only. The old catalog '.padEnd(65, 'x')
      const tail = Array.from({ length: 30 }, (_, index) =>
        `Synthetic payload ${index}: retain every exact identifier.`)
      const question = `${prefix}model/endpoint inventory remains historical.\n${tail.join('\n')}`
      const f = await formFixture(0, true, {
        width: 80, height: clipped ? 24 : 80, question,
        narrowQuestion: [`${prefix}model/`, 'endpoint inventory remains historical.', ...tail],
      })
      const before = await f.geometry()
      expect(terminalFormShowsFields(await f.capture(), f.identity)).toBe(false)
      expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
        .toBe(true)
      expect(await f.geometry()).toEqual(before)
      const receipt = await f.receipt()
      expect(receipt.widths).toContain(256)
      expect(receipt.actions).toEqual([{ action: 'accept', selected: 1 }])
      expect(receipt.keys.filter((key) => key === 'Enter')).toHaveLength(1)
    },
    20_000,
  )

  it.each(['added-space', 'removed-space', 'different-identifier'])(
    'does not authorize %s after read-only question reflow',
    async (difference) => {
      const prefix = 'Synthetic confirmation only. The old catalog '.padEnd(65, 'x')
      const question = `${prefix}model/endpoint inventory remains historical.`
      const liveQuestion = difference === 'added-space'
        ? question.replace('model/endpoint', 'model/ endpoint')
        : difference === 'removed-space'
          ? question.replace('inventory remains', 'inventoryremains')
          : question.replace('endpoint', 'different')
      const f = await formFixture(0, true, {
        width: 80, height: 40, question: liveQuestion,
        narrowQuestion: [`${prefix}model/`, liveQuestion.slice(prefix.length + 6).trim()],
      })
      const before = await f.geometry()
      expect(await f.controller.fillUserInputForm(
        f.sessionId, f.steps, { ...f.identity, question },
      )).toBe(false)
      expect(await f.geometry()).toEqual(before)
      const receipt = await f.receipt()
      expect(receipt.keys).toEqual([])
      expect(receipt.actions).toEqual([])
      if (difference !== 'different-identifier') expect(receipt.widths).toContain(256)
    },
    15_000,
  )

  it.each([
    { layout: 'complete', activeField: 0 },
    { layout: 'complete', activeField: 1 },
    { layout: 'clipped', activeField: 0 },
    { layout: 'clipped', activeField: 1 },
  ])(
    'recognizes a $layout form from field $activeField when its text field resembles a composer',
    async ({ layout, activeField }) => {
      const f = await textFieldFormFixture(layout === 'clipped', activeField)
      const before = await f.geometry()
      expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
        .toBe(true)
      expect(await f.geometry()).toEqual(before)
      const receipt = await f.receipt()
      expect(receipt.keys.filter((key) => key === 'Enter')).toHaveLength(2)
      expect(receipt.keys.filter((key) => key === 'Tab')).toHaveLength(0)
      expect(receipt.actions).toEqual([{
        action: 'accept',
        selected: [0, 0],
        textValue: 'control-model-001, treatment-model-001',
      }])
      expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
        .toBe(false)
      expect((await f.receipt()).actions).toHaveLength(1)
    },
    30_000,
  )

  it.each([false, true])(
    'commits a non-default choice before advancing to a text field (clipped=%s)',
    async (clipped) => {
      const f = await textFieldFormFixture(clipped)
      f.steps[0] = { kind: 'select', optionCount: 3, index: 1 }
      const before = await f.geometry()
      expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
        .toBe(true)
      expect(await f.geometry()).toEqual(before)
      const receipt = await f.receipt()
      expect(receipt.actions).toEqual([{
        action: 'accept',
        selected: [1, 0],
        textValue: 'control-model-001, treatment-model-001',
      }])
      expect(receipt.keys.filter((key) => key === 'Enter')).toHaveLength(2)
    },
    30_000,
  )

  it('does not classify intermediate choice acceptance as a submitted form', async () => {
    const f = await textFieldFormFixture(false)
    const owner = f.controller['formOwner'].bind(f.controller)
    f.controller['formOwner'] = async (...args) => {
      const receipt = await f.receipt()
      if (receipt.keys.includes('Enter') && receipt.actions.length === 0) {
        throw new Error('Synthetic owner read failure after field acceptance')
      }
      return owner(...args)
    }
    try {
      await expect(f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
        .rejects.toMatchObject({ outcome: 'not-submitted', uncertainDelivery: false })
    } finally {
      f.controller['formOwner'] = owner
    }
    expect((await f.receipt()).actions).toEqual([])
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .toBe(true)
    expect((await f.receipt()).actions).toHaveLength(1)
  }, 30_000)

  it.each([false, true])('finishes a clipped non-default form without repeating slow host-wide discovery (nested=%s)', async (nested) => {
    const f = await textFieldFormFixture(true, 1, nested)
    f.steps[0] = { kind: 'select', optionCount: 3, index: 1 }
    const discover = f.controller['activeProcesses'].bind(f.controller)
    const discoveryCalls: boolean[] = []
    f.controller['activeProcesses'] = async (fresh = false) => {
      discoveryCalls.push(fresh)
      await new Promise((resolve) => setTimeout(resolve, 500))
      return discover(fresh)
    }
    const before = await f.geometry()
    const started = performance.now()
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .toBe(true)
    expect(performance.now() - started).toBeLessThan(17_500)
    expect(discoveryCalls).toEqual([false])
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).actions).toEqual([{
      action: 'accept',
      selected: [1, 0],
      textValue: 'control-model-001, treatment-model-001',
    }])
  }, 30_000)

  it('retains fresh discovery for lock-only form owners', async () => {
    const f = await formFixture(52, true, { argumentOwned: false })
    const discover = f.controller['activeProcesses'].bind(f.controller)
    const discoveryCalls: boolean[] = []
    f.controller['activeProcesses'] = (fresh = false) => {
      discoveryCalls.push(fresh)
      return discover(fresh)
    }
    const before = await f.geometry()
    expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity))
      .toBe(true)
    expect(discoveryCalls).toContain(true)
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).actions).toEqual([{ action: 'accept', selected: 1 }])
  }, 15_000)

  it.each([false, true])(
    'refuses a different question in a free-text form (clipped=%s)',
    async (clipped) => {
      const f = await textFieldFormFixture(clipped)
      const before = await f.geometry()
      const other = { ...f.identity, question: `${f.identity.question} A different approval.` }
      expect(await f.controller.fillUserInputForm(f.sessionId, f.steps, other))
        .toBe(false)
      expect(await f.geometry()).toEqual(before)
      expect((await f.receipt()).keys).toEqual([])
      expect((await f.receipt()).actions).toEqual([])
    },
    15_000,
  )

  it.each(['cancel', 'decline'] as const)(
    '%s recognizes a free-text form without mistaking it for a composer',
    async (action) => {
      const f = await textFieldFormFixture(false)
      const before = await f.geometry()
      expect(await f.controller.dismissUserInput(f.sessionId, f.identity, action))
        .toBe(true)
      expect(await f.geometry()).toEqual(before)
      expect((await f.receipt()).actions).toEqual([{
        action,
        selected: [0, 0],
        textValue: 'Default synthetic model IDs',
      }])
    },
    15_000,
  )

  it('expands horizontally paginated five-field tabs and restores 120x29', async () => {
    const f = await horizontalFormFixture()
    const before = await f.geometry()
    const pane = await f.capture()
    expect(before).toEqual({ dimensions: '120x29', localPolicy: '' })
    expect(parseTerminalFormPrompt(pane)).toBe(true)
    expect(terminalFormShowsFields(pane, f.identity)).toBe(false)

    expect(
      await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ).toBe(true)

    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).widths).toContain(256)
    expect((await f.receipt()).keys.filter((key) => key === 'Tab')).toHaveLength(0)
    expect((await f.receipt()).keys.filter((key) => key === 'Enter')).toHaveLength(5)
    expect((await f.receipt()).actions).toEqual([
      { action: 'accept', selected: [0, 1, 0, 1, 0] },
    ])
  }, 15_000)

  it('scales the bounded operation budget for eight-field paginated forms', async () => {
    const f = await horizontalFormFixture({
      fields: [
        'Chat normal deployment',
        'Chat normal model',
        'Chat 0k deployment',
        'Chat 0k model',
        'Sol normal deployment',
        'Sol normal model',
        'Sol 0k deployment',
        'Sol 0k model',
      ],
    })
    const before = await f.geometry()
    const change = f.controller['changeFormViewport'].bind(f.controller)
    let clock: ReturnType<typeof vi.spyOn> | undefined
    f.controller['changeFormViewport'] = async (...args) => {
      await change(...args)
      if (!args[2] && !clock) {
        clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 16_000)
      }
    }
    try {
      expect(
        await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
      ).toBe(true)
    } finally {
      clock?.mockRestore()
    }
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).keys.filter((key) => key === 'Tab'))
      .toHaveLength(0)
    expect((await f.receipt()).keys.filter((key) => key === 'Enter'))
      .toHaveLength(8)
  }, 30_000)

  it.each([2, 4])(
    'expands pagination around field %i and normalizes attached focus',
    async (activeField) => {
      const f = await horizontalFormFixture({ activeField })
      const before = await f.geometry()
      expect(terminalFormShowsFields(await f.capture(), f.identity)).toBe(false)

      expect(
        await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
      ).toBe(true)

      expect(await f.geometry()).toEqual(before)
      expect((await f.receipt()).keys.filter((key) => key === 'BTab'))
        .toHaveLength(activeField)
      expect((await f.receipt()).actions).toEqual([
        { action: 'accept', selected: [0, 1, 0, 1, 0] },
      ])
    },
    15_000,
  )

  it.each(['cancel', 'decline'] as const)(
    '%s expands horizontally paginated tabs and restores 120x29',
    async (action) => {
      const f = await horizontalFormFixture()
      const before = await f.geometry()

      expect(
        await f.controller.dismissUserInput(f.sessionId, f.identity, action),
      ).toBe(true)

      expect(await f.geometry()).toEqual(before)
      expect((await f.receipt()).widths).toContain(256)
      expect((await f.receipt()).actions).toEqual([
        { action, selected: [0, 0, 0, 0, 0] },
      ])
    },
    15_000,
  )

  it('does not enlarge a tab-arrow lookalike or send keys', async () => {
    const f = await horizontalFormFixture({ lookalikeTabs: true })
    const before = await f.geometry()
    const change = vi.spyOn(f.controller, 'changeFormViewport' as never)

    expect(
      await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ).toBe(false)

    expect(change).not.toHaveBeenCalled()
    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).keys).toEqual([])
  })

  it('restores width without keys when a paginated form does not repaint', async () => {
    const f = await horizontalFormFixture({ repaint: false })
    const before = await f.geometry()

    expect(
      await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ).toBe(false)

    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).keys).toEqual([])
  }, 15_000)

  it('does not enlarge horizontally paginated tabs in a shared window', async () => {
    const f = await horizontalFormFixture()
    await exec('tmux', ['split-window', '-d', '-t', f.tmux, 'sleep 300'])
    const before = await f.geometry()

    expect(
      await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ).toBe(false)

    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).widths).not.toContain(256)
    expect((await f.receipt()).keys).toEqual([])
  })

  it('expands vertically then horizontally and restores both dimensions', async () => {
    const f = await horizontalFormFixture({ height: 8 })
    const before = await f.geometry()

    expect(
      await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ).toBe(true)

    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).widths).toContain(120)
    expect((await f.receipt()).widths).toContain(256)
    expect((await f.receipt()).actions).toEqual([
      { action: 'accept', selected: [0, 1, 0, 1, 0] },
    ])
  }, 30_000)

  it('restores without keys when every tab cannot fit within the width bound', async () => {
    const f = await horizontalFormFixture({ fullWidth: 300 })
    const before = await f.geometry()

    expect(
      await f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ).toBe(false)

    expect(await f.geometry()).toEqual(before)
    expect((await f.receipt()).widths).toContain(256)
    expect((await f.receipt()).keys).toEqual([])
  }, 15_000)

  it('surfaces a viewport change between vertical and horizontal expansion', async () => {
    const f = await horizontalFormFixture({ height: 8 })
    const read = f.controller['readFormViewport'].bind(f.controller)
    let expandedReads = 0
    f.controller['readFormViewport'] = async (...args) => {
      let viewport = await read(...args)
      if (viewport.width === 120 && viewport.height === 256) {
        expandedReads += 1
      }
      if (expandedReads === 31) {
        await exec('tmux', [
          'resize-window', '-t', f.tmux, '-x', '119', '-y', '255',
        ])
        expandedReads += 1
        viewport = await read(...args)
      }
      return viewport
    }

    await expect(
      f.controller.fillUserInputForm(f.sessionId, f.steps, f.identity),
    ).rejects.toMatchObject({
      outcome: 'not-submitted',
      uncertainDelivery: false,
    })

    expect(await f.geometry()).toEqual({
      dimensions: '119x255',
      localPolicy: 'manual',
    })
    expect((await f.receipt()).keys).toEqual([])
  }, 15_000)

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
