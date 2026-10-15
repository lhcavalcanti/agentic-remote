import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  terminalFormReplyBudget,
  TerminalFormReplyError,
  TmuxTerminalSessionController,
  type TerminalFormStep,
} from './terminal-session.js'

// Every tmux call made by the controller is answered by an in-memory pane so
// each phase of a form reply can be held open while fake time runs out.
const tmux = vi.hoisted(() => ({
  handler: undefined as
    | undefined
    | ((args: string[]) => Promise<{ stdout: string; stderr: string }>),
}))

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  const { promisify } = await import('node:util')
  const execFile = Object.assign(
    () => { throw new Error('Unexpected callback execFile') },
    {
      [promisify.custom]: (file: string, args: string[]) => {
        if (file !== 'tmux' || !tmux.handler) {
          return Promise.reject(new Error(`Unexpected ${file} ${args.join(' ')}`))
        }
        return tmux.handler(args)
      },
    },
  )
  return { ...actual, execFile }
})

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  const stat = `4242 (copilot) S ${Array.from({ length: 30 }, (_, index) => index).join(' ')}`
  return {
    ...actual,
    readFile: vi.fn(async (...args: Parameters<typeof actual.readFile>) =>
      typeof args[0] === 'string' && /^\/proc\/\d+\/stat$/.test(args[0])
        ? stat
        : actual.readFile(...args)),
  }
})

const sessionId = 'synthetic-form-deadline'
const question = 'Synthetic confirmation; nothing will run.'
const openPane = (fields: string[]) => [
  ' Copilot needs information.',
  ` ${question}`,
  '',
  ...(fields.length > 1 ? [`  ${fields.join('   ')}`, ''] : []),
  ` ${fields[0]}:`,
  ' \u276F Default',
  '   Non-default',
  '   Other (type your answer)',
  '',
  ' \u2191/\u2193 select \u00B7 enter accept \u00B7 ctrl+d decline \u00B7 esc cancel',
].join('\n')
const clippedPane = (fields: string[]) => openPane(fields).split('\n').slice(2).join('\n')
const closedPane = ['Finished', '\u257B\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584', '\u2503', '\u2579\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580', ' / commands'].join('\n')
const commitKeys = new Set(['Enter', 'Escape', 'C-d'])
type Phase = 'capture' | 'commit' | 'cleanup'

function fixture(options: { fields?: number; clipped?: boolean } = {}) {
  const fields = Array.from(
    { length: options.fields ?? 1 },
    (_, index) => index === 0 ? 'Synthetic decision' : `Synthetic field ${index}`,
  )
  const identity = { question, fields }
  const steps: TerminalFormStep[] = fields.map(() => ({ kind: 'select', optionCount: 3, index: 1 }))
  const state = {
    pane: options.clipped ? clippedPane(fields) : openPane(fields),
    calls: [] as string[],
    keys: [] as string[],
  }
  const gates = new Map<Phase, Promise<void>>()
  const releases: (() => void)[] = []
  const block = (phase: Phase) => {
    let release = () => {}
    gates.set(phase, new Promise<void>((resolve) => { release = resolve }))
    releases.push(release)
    return () => {
      gates.delete(phase)
      release()
    }
  }
  const hold = async (phase: Phase) => {
    const gate = gates.get(phase)
    if (gate) {
      state.calls.push(`${phase}:held`)
      await gate
    }
  }
  tmux.handler = async (args) => {
    if (args[0] === 'capture-pane') {
      state.calls.push('capture')
      await hold('capture')
      return { stdout: state.pane, stderr: '' }
    }
    if (args[0] === 'if-shell') {
      const key = args[5].split(' ; ')[0].split(' ').at(-1)!
      state.calls.push(`key:${key}`)
      if (commitKeys.has(key)) await hold('commit')
      state.keys.push(key)
      if (commitKeys.has(key)) state.pane = closedPane
      return { stdout: 'sent\n', stderr: '' }
    }
    throw new Error(`Unexpected tmux ${args.join(' ')}`)
  }
  const controller = new TmuxTerminalSessionController()
  const owner = { pid: 4242, target: '%1', rootPid: 4242 }
  const boundOwner = vi.fn(async () => owner)
  controller['boundOwner'] = boundOwner
  controller['formOwner'] = vi.fn(async () => owner)
  const original = {
    window: '@1', pane: '%1', pid: owner.rootPid, width: 120, height: 40,
    panes: 1, linked: 0, policy: 'latest', localPolicy: '', clients: '',
  }
  let viewport = { ...original }
  controller['readFormViewport'] = vi.fn(async () => ({ ...viewport }))
  const changeViewport = vi.fn(async (
    _previous: typeof original,
    dimensions: Pick<typeof original, 'width' | 'height'>,
    restore = false,
  ) => {
    if (restore) {
      state.calls.push('restore')
      await hold('cleanup')
      viewport = { ...original }
      return
    }
    viewport = { ...(dimensions as typeof original) }
    if (state.pane === clippedPane(fields)) state.pane = openPane(fields)
  })
  controller['changeFormViewport'] = changeViewport
  const reply = (action: 'accept' | 'cancel' | 'decline', deadline?: number) =>
    action === 'accept'
      ? controller.fillUserInputForm(sessionId, steps, identity, deadline === undefined ? undefined : { deadline })
      : controller.dismissUserInput(sessionId, identity, action, deadline === undefined ? undefined : { deadline })
  return { controller, identity, steps, state, block, releases, boundOwner, changeViewport, reply }
}

function observe<T>(promise: Promise<T>) {
  const result: { settled: boolean; at?: number; value?: T; error?: unknown } = { settled: false }
  promise.then(
    (value) => Object.assign(result, { settled: true, at: Date.now(), value }),
    (error: unknown) => Object.assign(result, { settled: true, at: Date.now(), error }),
  )
  return result
}

const actions = ['accept', 'cancel', 'decline'] as const
const committed = { accept: 'Enter', cancel: 'Escape', decline: 'C-d' } as const

afterEach(() => {
  vi.useRealTimers()
  tmux.handler = undefined
  vi.restoreAllMocks()
})

describe('bounded persisted terminal form replies', () => {
  it('scales the reply budget by field count up to its ceiling', () => {
    expect(terminalFormReplyBudget(1)).toBe(15_000)
    expect(terminalFormReplyBudget(8)).toBe(32_500)
    expect(terminalFormReplyBudget(100)).toBe(60_000)
  })

  it.each([
    ...actions.map((action) => [action, 1] as const),
    ['accept', 8] as const,
  ])('settles a queued %s for a %i-field form at its budget and never starts it', async (action, fieldCount) => {
    vi.useFakeTimers()
    const f = fixture({ fields: fieldCount })
    let unblock = () => {}
    const busy = f.controller['serialize'](sessionId, () =>
      new Promise<void>((resolve) => { unblock = resolve }))
    const started = Date.now()
    const budget = terminalFormReplyBudget(fieldCount)
    const reply = observe(f.reply(action))

    await vi.advanceTimersByTimeAsync(budget - 1)
    expect(reply.settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(reply.at! - started).toBe(budget)
    expect(reply.error).toBeInstanceOf(TerminalFormReplyError)
    expect(reply.error).toMatchObject({
      outcome: 'not-submitted', statusCode: 409, uncertainDelivery: false,
      message: expect.stringMatching(/nothing was submitted.*try again/i),
    })

    unblock()
    await busy
    await vi.runAllTimersAsync()
    expect(f.boundOwner).not.toHaveBeenCalled()
    expect(f.state.calls).toEqual([])
  })

  it('applies a caller deadline that started before the terminal queue', async () => {
    vi.useFakeTimers()
    const f = fixture()
    f.controller['serialize'](sessionId, () => new Promise<void>(() => {}))
    const started = Date.now()
    const reply = observe(f.reply('accept', started + 500))
    await vi.advanceTimersByTimeAsync(499)
    expect(reply.settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(reply.error).toMatchObject({ outcome: 'not-submitted', uncertainDelivery: false })
  })

  it.each(actions)('refuses every key after a held capture outlives the %s budget', async (action) => {
    vi.useFakeTimers()
    const f = fixture()
    const release = f.block('capture')
    const started = Date.now()
    const reply = observe(f.reply(action))
    await vi.advanceTimersByTimeAsync(0)
    expect(f.state.calls).toContain('capture:held')

    await vi.advanceTimersByTimeAsync(terminalFormReplyBudget(1))
    expect(reply.at! - started).toBe(terminalFormReplyBudget(1))
    expect(reply.error).toMatchObject({
      outcome: 'not-submitted', statusCode: 409, uncertainDelivery: false,
      message: expect.stringMatching(/try again/i),
    })

    release()
    await vi.runAllTimersAsync()
    expect(f.state.calls.filter((call) => call.startsWith('key:'))).toEqual([])
    expect(f.state.keys).toEqual([])
  })

  it.each(actions)('reports a %s commit still in flight at the deadline as possibly submitted', async (action) => {
    vi.useFakeTimers()
    const f = fixture()
    const release = f.block('commit')
    const started = Date.now()
    const reply = observe(f.reply(action))
    await vi.advanceTimersByTimeAsync(2_000)
    expect(f.state.calls).toContain('commit:held')
    expect(reply.settled).toBe(false)

    await vi.advanceTimersByTimeAsync(terminalFormReplyBudget(1) - 2_000)
    expect(reply.at! - started).toBe(terminalFormReplyBudget(1))
    expect(reply.error).toMatchObject({
      outcome: 'uncertain', statusCode: 409, uncertainDelivery: true,
      message: expect.stringMatching(/do not resend/i),
    })

    release()
    await vi.runAllTimersAsync()
    expect(f.state.keys.filter((key) => commitKeys.has(key))).toEqual([committed[action]])
  })

  it.each(actions)('reports a closed %s as submitted when viewport cleanup outlives the budget', async (action) => {
    vi.useFakeTimers()
    const f = fixture({ clipped: true })
    const release = f.block('cleanup')
    const started = Date.now()
    const reply = observe(f.reply(action))
    await vi.advanceTimersByTimeAsync(terminalFormReplyBudget(1) - 1)
    expect(f.state.calls).toContain('cleanup:held')
    expect(reply.settled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(reply.at! - started).toBe(terminalFormReplyBudget(1))
    expect(reply.error).toMatchObject({
      outcome: 'submitted', statusCode: 409, uncertainDelivery: true,
      message: expect.stringMatching(/submitted.*cleanup/i),
    })
    // Restoration keeps the session serialized until it finishes, so no later
    // terminal operation can interleave with the window being resized back.
    expect(f.controller.sending(sessionId)).toBe(true)

    release()
    await vi.runAllTimersAsync()
    expect(f.controller.sending(sessionId)).toBe(false)
    expect(f.changeViewport).toHaveBeenLastCalledWith(
      expect.anything(), { width: 120, height: 40 }, true, false,
    )
    expect(f.state.keys.filter((key) => commitKeys.has(key))).toEqual([committed[action]])
  })

  it.each(actions)('confirms a %s closure within the budget and restores the viewport', async (action) => {
    vi.useFakeTimers()
    const f = fixture({ clipped: true })
    const reply = observe(f.reply(action))
    await vi.advanceTimersByTimeAsync(terminalFormReplyBudget(1))
    expect(reply).toMatchObject({ settled: true, value: true })
    expect(f.state.calls).toContain('restore')
    expect(f.state.keys.filter((key) => commitKeys.has(key))).toEqual([committed[action]])
  })
})
