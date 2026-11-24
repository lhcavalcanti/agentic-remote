// Real-tmux send matrix (#435). Every cell sends through the real
// AgentService.sendMessage with the options the browser derives from
// shared/send-policy, so agent-service chooses allowDuringAgentExecution and
// replaceExistingInput exactly as it does in production. The fake Copilot
// draws real panes in an isolated tmux server and records every paste, clear,
// submit and stray key it receives.
//
// The service is never start()ed: startup reconciliation would overwrite the
// seeded app status, and the "working, app still sees idle" row (#433) depends
// on the app status lagging behind the pane.
import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { SessionStatus } from '../shared/contracts.js'
import { terminalSendOptions } from '../shared/send-policy.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { readSessionEvents, sessionEventLogVersion } from './event-log.js'
import { SessionStore } from './session-store.js'
import {
  isTerminalAgentWorking,
  isTerminalOverlay,
  isTerminalSessionInUseConflict,
  parseTerminalFormPrompt,
  parseTerminalPermission,
  parseTerminalUserInput,
  TmuxTerminalSessionController,
} from './terminal-session.js'
import { fixtureReceiptWriter, readyComposer } from './terminal-test-fixtures.js'
import { createIsolatedTmuxRoot, eventually, stopIsolatedTmuxServer, waitForProcessCommand } from './tmux-test-helpers.js'

const exec = promisify(execFile)

const dialogs = {
  question: [
    '╭────────────────────────────────────────────────╮',
    '│ Question                                      │',
    '│ ────────────────────────────────────────────  │',
    '│ Which environment do you prefer?              │',
    '│                                               │',
    '│ ❯ 1. Production                               │',
    '│   2. Staging                                  │',
    '│   3. Other (type your answer)                 │',
    '│                                               │',
    '│ ↑/↓ to select · enter to confirm · esc cancel │',
    '╰────────────────────────────────────────────────╯',
  ].join('\n'),
  permission: [
    'Permission request (1 remaining)',
    '',
    '╭────────────────────────────────────────────────────────────╮',
    '│ Check DNS and credential presence                          │',
    '│ ────────────────────────────────────────────────────────── │',
    "│ printf 'files DNS: '; getent ahostsv4 files.example.test  │",
    '│                                                            │',
    '│ Do you want to run this command?                           │',
    '│                                                            │',
    '│ ❯ 1. Yes                                                   │',
    '│   2. No, and tell Copilot what to do differently           │',
    '│                                                            │',
    '│ ↑/↓ to navigate · enter to select · esc to cancel          │',
    '╰────────────────────────────────────────────────────────────╯',
  ].join('\n'),
  form: [
    ' Copilot needs information.',
    ' Choose a target.',
    ' Target:',
    ' ↑/↓ select · enter accept · esc cancel',
  ].join('\n'),
  overlay: [
    'Select a session',
    '- session one',
    '↑/↓ to navigate · enter to select · esc to cancel',
  ].join('\n'),
  passive: [
    readyComposer(),
    ' IDE auto-connect skipped: session is already in use by another client',
    ' This session may already be in use by another CLI or application.',
  ].join('\n'),
}

// A working Copilot whose prompt is not drawn, as a long tool run can leave it.
const busyWithoutComposer = [
  ' ● Running a long tool',
  '   └ still running',
  '',
  ' ◉ Working · esc interrupt',
].join('\n')

// Copilot 1.0.101 once a turn has handed its work to background agents and
// ended: the prompt is back, and the footer offers only to stop the agents.
const backgroundAgentsFooter = ' ● Waiting for background agents · 273 B esc esc stop agents'

// Copilot 1.0.106 once a turn has ended with shells it started still running:
// the prompt is back, but the footer still offers the interrupt key, its
// status cut to fit an 80-column pane. While the prompt holds text the row
// adds the queue key, and cuts the status further.
const backgroundShellsFooter = ' ● Waiting for background s… · 136 B ctrl+c interrupt GPT-6.1 Sol · High · (9%)'
const backgroundShellsTypingFooter = ' ● Waitin… · 136 B ctrl+c interrupt · ctrl+q enqueue GPT-6.1 Sol · High · (9%)'

type PaneState = 'idle' | 'working' | 'busy' | 'background' | 'shells' | keyof typeof dialogs

// `logged` is what Copilot's event log says when it differs from the app.
interface Row { pane: PaneState; status: SessionStatus; logged?: SessionStatus }

// The app status is what the browser sees and feeds to the send policy.
const rows = {
  idle: { pane: 'idle', status: 'idle' },
  working: { pane: 'working', status: 'running' },
  // #433: the agent started before the app saw it, so the policy still asks
  // for draft replacement while the pane is working.
  'working, app still idle': { pane: 'working', status: 'idle' },
  // The turn ended with shells it started still running, so Copilot keeps
  // its busy row beside the prompt (#639).
  'background shells': { pane: 'shells', status: 'idle' },
  // The same row, while the log has a turn open the app has not seen.
  'background shells, turn open': { pane: 'shells', status: 'idle', logged: 'running' },
  question: { pane: 'question', status: 'waiting' },
  permission: { pane: 'permission', status: 'waiting' },
  form: { pane: 'form', status: 'waiting' },
  // Overlays the user opened, such as /session, do not change app status.
  overlay: { pane: 'overlay', status: 'idle' },
} satisfies Record<string, Row>
type RowName = keyof typeof rows

// "none" and "app-only" both leave the terminal composer empty: an app draft
// exists only in the browser until it is sent. They stay separate rows so the
// table reads the way the issue frames it.
type Draft = 'none' | 'app-only' | 'terminal-typed'

const typed = 'Typed at the terminal'
const message = 'Sent from the app'

// Each refusal keeps its current error class, message and HTTP status.
const BUSY = {
  name: 'TerminalDraftConflictError',
  message: 'The terminal already has unsent text or a pending paste. Review it there before sending another message.',
} as const
const CLEAR_REFUSED = {
  name: 'TerminalDraftConflictError',
  message: 'The terminal changed before its text could be cleared. The app draft was not sent.',
} as const
const FULL_SCREEN = {
  name: 'Error',
  message: 'The terminal is showing a full-screen view. Close it there, then send this again.',
} as const
const NEW_TEXT = {
  name: 'TerminalDraftConflictError',
  message: 'New terminal text appeared before the app draft could be sent. Nothing new was pasted.',
} as const
const PASSIVE_SESSION_CONFLICT = {
  name: 'Error',
  message:
    'Copilot says this session is already in use by another client or application. Close or resume it there before sending here.',
} as const
type Refusal =
  | typeof BUSY
  | typeof CLEAR_REFUSED
  | typeof FULL_SCREEN
  | typeof NEW_TEXT
  | typeof PASSIVE_SESSION_CONFLICT

type Expected =
  // Exactly one paste and one Enter of the message; `clears` stale drafts.
  | { outcome: 'delivered'; activity: 'Sent to terminal' | 'Sent queued prompt'; clears: 0 | 1 }
  // Held in the app FIFO; nothing typed, any terminal draft untouched.
  | { outcome: 'queued' }
  // HTTP 409, uncertainDelivery false, nothing typed, any terminal draft kept.
  | { outcome: 'refused'; refusal: Refusal }

const sent = { outcome: 'delivered', activity: 'Sent to terminal', clears: 0 } as const
const drained = { outcome: 'delivered', activity: 'Sent queued prompt', clears: 0 } as const
const replaced = { outcome: 'delivered', activity: 'Sent to terminal', clears: 1 } as const
const queued = { outcome: 'queued' } as const
const refused = (refusal: Refusal) => ({ outcome: 'refused', refusal }) as const

// Expected outcomes from docs/app-spec.md §6 and the existing tests. Queue
// columns use enqueue=true; Send columns use enqueue=false.
const table: Array<[RowName, Draft, 'Send' | 'Queue', Expected]> = [
  ['idle', 'none', 'Send', sent],
  ['idle', 'none', 'Queue', drained],
  ['idle', 'app-only', 'Send', sent],
  ['idle', 'app-only', 'Queue', drained],
  ['idle', 'terminal-typed', 'Send', replaced],
  ['idle', 'terminal-typed', 'Queue', queued],

  ['working', 'none', 'Send', sent],
  ['working', 'none', 'Queue', queued],
  ['working', 'app-only', 'Send', sent],
  ['working', 'app-only', 'Queue', queued],
  ['working', 'terminal-typed', 'Send', refused(BUSY)],
  ['working', 'terminal-typed', 'Queue', queued],

  ['working, app still idle', 'none', 'Send', sent],
  ['working, app still idle', 'none', 'Queue', queued],
  ['working, app still idle', 'app-only', 'Send', sent],
  ['working, app still idle', 'app-only', 'Queue', queued],
  ['working, app still idle', 'terminal-typed', 'Send', refused(CLEAR_REFUSED)],
  ['working, app still idle', 'terminal-typed', 'Queue', queued],

  // A message whose paste Copilot drew too late is left in the prompt; Send
  // replaces it while the event log has only the shells left running.
  ['background shells', 'none', 'Send', sent],
  ['background shells', 'terminal-typed', 'Send', replaced],
  ['background shells, turn open', 'terminal-typed', 'Send', refused(CLEAR_REFUSED)],

  // Dialog and overlay Queue cells are refused today; see the todos below.
  ...(['question', 'permission', 'form', 'overlay'] as const).flatMap((row) =>
    (['none', 'app-only', 'terminal-typed'] as const).flatMap((draft) =>
      (['Send', 'Queue'] as const).map((action) =>
        [row, draft, action, refused(FULL_SCREEN)] as [RowName, Draft, 'Send' | 'Queue', Expected],
      ),
    ),
  ),
]

interface Receipt {
  pastes: string[]
  submits: Array<{ key: 'enter' | 'queue'; text: string }>
  clears: number
  keys: string
  draft: string
}

function client(): CopilotClientLike {
  const session = (sessionId: string): CopilotSessionLike => ({
    sessionId, on: () => () => {}, getEvents: async () => [],
    abort: async () => {}, disconnect: vi.fn(async () => {}),
    sendAndWait: vi.fn(async () => { throw new Error('Terminal sends must never use the SDK') }),
    rpc: {
      commands: {
        list: async () => ({
          commands: [{
            name: 'usage',
            description: 'Synthetic usage',
            kind: 'builtin' as const,
            allowDuringAgentExecution: true,
          }],
        }),
        invoke: vi.fn(),
        enqueue: vi.fn(),
      },
      model: {
        getCurrent: async () => ({ modelId: 'synthetic' }),
        switchTo: async () => ({ modelId: 'synthetic' }),
      },
      name: { set: async () => {} }, mode: { set: async () => ({ status: 'applied', modelChanged: false }) },
    },
  })
  return {
    start: vi.fn(async () => {}), stop: vi.fn(async () => []),
    createSession: vi.fn(async (config) => session(config.sessionId || randomUUID())),
    resumeSession: vi.fn(async () => { throw new Error('Terminal sessions must not be resumed through the SDK') }),
    listSessions: vi.fn(async () => []), deleteSession: vi.fn(async () => {}),
    rpc: {
      models: { list: async () => ({ models: [] }) },
      commands: { list: async () => ({ commands: [] }) },
    },
  }
}

let root = ''
let directory = ''
const services: AgentService[] = []
const tmuxSessions: string[] = []

async function terminal(pane: PaneState, status: SessionStatus, draft: string, logged = status) {
  const id = randomUUID()
  const cell = path.join(directory, id)
  const workspace = path.join(cell, 'workspace')
  await mkdir(workspace, { recursive: true })
  const receiptFile = path.join(cell, 'receipt.json')
  const executable = path.join(cell, 'copilot-matrix.mjs')
  await writeFile(executable, `
${fixtureReceiptWriter(receiptFile)}
const makeComposer = ${readyComposer.toString()}
const dialogs = ${JSON.stringify(dialogs)}
const busy = ${JSON.stringify(busyWithoutComposer)}
const backgroundFooter = ${JSON.stringify(backgroundAgentsFooter)}
const shellsFooter = ${JSON.stringify(backgroundShellsFooter)}
const shellsTypingFooter = ${JSON.stringify(backgroundShellsTypingFooter)}
let mode = ${JSON.stringify(pane)}
let draft = ${JSON.stringify(draft)}
const received = { pastes: [], submits: [], clears: 0, keys: '', draft }
let input = ''
const composing = () => mode === 'idle' || mode === 'working' || mode === 'background' || mode === 'shells'
const draw = () => {
  const pane = mode === 'background'
    ? makeComposer(draft, false).replace(' / commands', backgroundFooter)
    : mode === 'shells'
      ? makeComposer(draft, false).replace(' / commands', draft ? shellsTypingFooter : shellsFooter)
      : composing() ? makeComposer(draft, mode === 'working') : mode === 'busy' ? busy : dialogs[mode]
  process.stdout.write('\\x1b[2J\\x1b[H' + pane.replaceAll('\\n', '\\r\\n'))
}
const save = () => { received.draft = draft; writeReceipt(received) }
process.stdin.setRawMode(true)
process.stdout.write('\\x1b[?2004h')
process.on('SIGXCPU', () => { mode = 'working'; draw() })
process.on('SIGUSR2', () => { mode = 'idle'; draw() })
process.stdin.on('data', (data) => {
  input += data.toString()
  while (input) {
    if (input.startsWith('\\x15')) {
      input = input.slice(1)
      received.clears += 1
      if (composing()) draft = ''
    } else if (input.startsWith('\\x1b[200~')) {
      const end = input.indexOf('\\x1b[201~')
      if (end < 0) break
      const text = input.slice(6, end).replace(/\\r\\n?/g, '\\n')
      input = input.slice(end + 6)
      received.pastes.push(text)
      if (composing()) draft += text
    } else if (input[0] === '\\r' || input[0] === '\\x11') {
      const key = input[0] === '\\r' ? 'enter' : 'queue'
      input = input.slice(1)
      if (composing() && draft) {
        received.submits.push({ key, text: draft })
        draft = ''
      } else {
        received.keys += key
      }
    } else {
      received.keys += input[0]
      input = input.slice(1)
    }
  }
  save()
  draw()
})
save()
draw()
`)
  const name = `matrix-${id.slice(0, 8)}`
  tmuxSessions.push(name)
  await exec('tmux', ['new-session', '-d', '-s', name, '-x', '100', '-y', '30', process.execPath, executable, '--session-id', id])
  const pid = Number((await exec('tmux', ['display-message', '-p', '-t', name, '#{pane_pid}'])).stdout.trim())
  await waitForProcessCommand(pid, [executable])
  const sessionState = path.join(process.env.COPILOT_HOME!, 'session-state', id)
  await mkdir(sessionState, { recursive: true })
  await writeFile(path.join(sessionState, `inuse.${pid}.lock`), `${pid}\n`)
  await writeFile(path.join(sessionState, 'events.jsonl'), [
    { type: 'session.start', id: 'start', parentId: null, timestamp: '2026-10-20T00:00:00.000Z', data: {} },
    { type: 'assistant.turn_start', id: 'turn', parentId: 'start', timestamp: '2026-10-20T00:00:01.000Z', data: {} },
    ...(pane === 'shells'
      ? [{
          type: 'tool.execution_start', id: 'sleep-start', parentId: 'turn', timestamp: '2026-10-20T00:00:01.500Z',
          data: {
            toolCallId: 'sleep-call', toolName: 'bash',
            arguments: { command: 'sleep 300', description: 'Sleep in the background', mode: 'async' },
          },
        }]
      : []),
    ...(pane === 'background'
      ? [
          { type: 'subagent.started', id: 'agent', parentId: 'turn', agentId: 'agent-1', timestamp: '2026-10-20T00:00:02.000Z', data: {} },
          { type: 'assistant.turn_end', id: 'turn-end', parentId: 'turn', timestamp: '2026-10-20T00:00:03.000Z', data: {} },
        ]
      : []),
    ...(logged === 'idle'
      ? [{ type: 'session.idle', id: 'idle', parentId: 'turn', timestamp: '2026-10-20T00:00:02.000Z', data: {} }]
      : []),
  ].map((event) => JSON.stringify(event)).join('\n') + '\n')
  const store = new SessionStore(path.join(cell, 'state'))
  await store.initialize()
  await store.create({
    id, provider: 'copilot', cwd: workspace, title: 'Send matrix',
    updatedAt: '2026-10-20T00:00:00.000Z', status, isOpen: true, messages: [],
  }, { backend: 'terminal', managedOpen: true })
  const controller = new TmuxTerminalSessionController()
  // A Copilot that has been running a while, as most sends find it.
  Reflect.set(controller, 'settledOwnerAgeMs', 0)
  const service = new AgentService(
    store, client(),
    // Only this cell's Copilot exists; never enumerate the host's processes.
    async () => [{ id, cwd: workspace, title: 'Send matrix', updatedAt: '2026-10-20T00:00:00.000Z' }],
    async () => {}, readSessionEvents, sessionEventLogVersion,
    controller, async () => undefined, async () => undefined,
  )
  services.push(service)
  const receipt = async () => {
    try { return JSON.parse(await readFile(receiptFile, 'utf8')) as Receipt } catch { return undefined }
  }
  await eventually(receipt, Boolean)
  return {
    id, pid, service, store, controller,
    receipt: async () => (await receipt())!,
  }
}

// Sends exactly as the browser does: the shared policy turns the selected
// session and the button into request options, and the node route passes them
// to sendMessage unchanged.
async function sendLikeTheApp(
  fixture: Awaited<ReturnType<typeof terminal>>,
  status: SessionStatus,
  enqueue: boolean,
) {
  const options = terminalSendOptions({
    status, provider: 'copilot', executionMode: 'tmux', enqueue, appLocalCommand: false,
  })
  return fixture.service.sendMessage(
    fixture.id, message, options.enqueue, undefined, options.replaceTerminalDraft,
  )
}

async function expectRefusal(attempt: Promise<unknown>, refusal: Refusal) {
  const error = await attempt.then(() => undefined, (failure: unknown) => failure)
  expect(error).toBeInstanceOf(Error)
  expect({
    name: (error as Error).name,
    message: (error as Error).message,
    statusCode: Reflect.get(error as Error, 'statusCode'),
    uncertainDelivery: Reflect.get(error as Error, 'uncertainDelivery'),
  }).toEqual({ ...refusal, statusCode: 409, uncertainDelivery: false })
}

// Starts a turn once the terminal has cleared its draft, before the send's
// final ownership check. Returns whether it has happened yet.
function startAgentAfterClear(fixture: Awaited<ReturnType<typeof terminal>>) {
  const owner = Reflect.get(fixture.controller, 'owner').bind(fixture.controller)
  let started = false
  Reflect.set(fixture.controller, 'owner', async (...args: unknown[]) => {
    if (!started && (await fixture.receipt()).clears) {
      started = true
      process.kill(fixture.pid, 'SIGXCPU')
      await eventually(
        () => fixture.controller.capture(fixture.id),
        (pane) => isTerminalAgentWorking(pane || ''),
      )
    }
    return owner(...args)
  })
  return () => started
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 300))

beforeAll(async () => {
  root = await createIsolatedTmuxRoot()
  directory = await mkdtemp(path.join(tmpdir(), 'send-matrix-'))
  vi.stubEnv('HOME', root)
  vi.stubEnv('TMUX_TMPDIR', root)
  vi.stubEnv('TMUX', '')
  vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot-home'))
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', directory)
})

afterEach(async () => {
  for (const service of services.splice(0)) await service.stop()
  for (const name of tmuxSessions.splice(0)) await exec('tmux', ['kill-session', '-t', name])
})

afterAll(async () => {
  await stopIsolatedTmuxServer(root)
  vi.unstubAllEnvs()
  await rm(directory, { recursive: true, force: true })
})

describe('send matrix with the app’s real send options', () => {
  it('draws panes the server recognizes', () => {
    expect(isTerminalAgentWorking(readyComposer('', true))).toBe(true)
    expect(isTerminalAgentWorking(readyComposer(''))).toBe(false)
    expect(parseTerminalUserInput(dialogs.question)).toBeTruthy()
    expect(parseTerminalPermission(dialogs.permission)).toBeTruthy()
    expect(parseTerminalFormPrompt(dialogs.form)).toBe(true)
    expect(isTerminalSessionInUseConflict(dialogs.passive)).toBe(true)
    for (const pane of Object.values(dialogs).filter((pane) => pane !== dialogs.passive)) {
      expect(isTerminalOverlay(pane)).toBe(true)
    }
  })

  it.each(table)('%s pane · %s draft · %s', async (rowName, draft, action, expected) => {
    const row: Row = rows[rowName]
    const { pane, status } = row
    const terminalDraft = draft === 'terminal-typed' ? typed : ''
    const fixture = await terminal(pane, status, terminalDraft, row.logged)

    const attempt = sendLikeTheApp(fixture, status, action === 'Queue')

    if (expected.outcome === 'refused') {
      await expectRefusal(attempt, expected.refusal)
      await settle()
      expect(await fixture.receipt()).toEqual({
        pastes: [], submits: [], clears: 0, keys: '', draft: terminalDraft,
      })
      expect(fixture.store.get(fixture.id)?.queuedPrompts ?? []).toEqual([])
      return
    }

    const session = await attempt
    if (expected.outcome === 'queued') {
      expect(session.queuedPrompts?.map((prompt) => prompt.content)).toEqual([message])
      await settle()
      expect(fixture.store.get(fixture.id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual([message])
      expect(await fixture.receipt()).toEqual({
        pastes: [], submits: [], clears: 0, keys: '', draft: terminalDraft,
      })
      return
    }

    expect(session.activity).toBe(expected.activity)
    await eventually(fixture.receipt, (receipt) => receipt.submits.length > 0)
    await settle()
    expect(await fixture.receipt()).toEqual({
      pastes: [message],
      submits: [{ key: 'enter', text: message }],
      clears: expected.clears,
      keys: '',
      draft: '',
    })
    expect(fixture.store.get(fixture.id)?.queuedPrompts ?? []).toEqual([])
  }, 30_000)

  // Replacement clears stale terminal text by design (§6). If the agent starts
  // after the clear, nothing may be pasted into the new turn; the browser
  // restores the app draft from the refusal.
  it('idle pane · terminal-typed draft · Send, agent starts after the clear', async () => {
    const fixture = await terminal('idle', 'idle', typed)
    const started = startAgentAfterClear(fixture)

    await expectRefusal(sendLikeTheApp(fixture, 'idle', false), NEW_TEXT)
    expect(started()).toBe(true)
    await settle()
    expect(await fixture.receipt()).toEqual({
      pastes: [], submits: [], clears: 1, keys: '', draft: '',
    })
  }, 30_000)

  // The service sees a working pane and grants working tolerance; the turn
  // ends before the terminal's own check, which clears the typed draft; then a
  // new turn starts. Tolerance granted before a clear must not carry past it.
  it('working → idle with a terminal-typed draft → working after the clear · Send', async () => {
    const fixture = await terminal('working', 'idle', typed)
    const capture = fixture.controller.capture.bind(fixture.controller)
    let finished = false
    Reflect.set(fixture.controller, 'capture', async (sessionId: string) => {
      const pane = await capture(sessionId)
      if (!finished && isTerminalAgentWorking(pane || '')) {
        finished = true
        process.kill(fixture.pid, 'SIGUSR2')
        await eventually(
          () => capture(sessionId),
          (current) => !isTerminalAgentWorking(current || '') && Boolean(current?.includes(typed)),
        )
      }
      return pane
    })
    const started = startAgentAfterClear(fixture)

    await expectRefusal(sendLikeTheApp(fixture, 'idle', false), NEW_TEXT)
    expect(finished).toBe(true)
    expect(started()).toBe(true)
    await settle()
    expect(await fixture.receipt()).toEqual({
      pastes: [], submits: [], clears: 1, keys: '', draft: '',
    })
  }, 30_000)

  // After a hub restart a settled, busy Copilot may not show its prompt. A
  // steer must neither hold the send lock for the startup timeout nor fail:
  // it joins the app FIFO once, with nothing typed into the pane (#449).
  it('busy pane without a composer · Send after a hub restart is queued, not refused', async () => {
    const fixture = await terminal('busy', 'running', '')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const started = performance.now()
      const session = await sendLikeTheApp(fixture, 'running', false)
      expect(performance.now() - started).toBeLessThan(8_000)
      expect(session.queuedPrompts?.map((prompt) => prompt.content)).toEqual([message])
      await settle()
      expect(fixture.store.get(fixture.id)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual([message])
      expect(await fixture.receipt()).toEqual({ pastes: [], submits: [], clears: 0, keys: '', draft: '' })
    } finally {
      warn.mockRestore()
    }
  }, 30_000)

  // The turn handed its work to a background agent and ended, so the session
  // is running while Copilot's prompt takes a new message at once. Send
  // delivers it rather than refusing the composer as not ready.
  it('background agents running · Send is delivered, not refused', async () => {
    const fixture = await terminal('background', 'running', '')
    const session = await sendLikeTheApp(fixture, 'running', false)
    expect(session.queuedPrompts ?? []).toEqual([])
    const receipt = await eventually(fixture.receipt, (value) => Boolean(value?.submits.length))
    expect(receipt).toEqual({
      pastes: [message], submits: [{ key: 'enter', text: message }], clears: 0, keys: '', draft: '',
    })
  }, 30_000)

  // The turn ended with shells it started still running, so the session is
  // idle while Copilot still offers its interrupt key. Queued text is typed
  // into the prompt at once rather than held until the shells finish.
  it('background shells running · Queue is delivered, not held', async () => {
    const fixture = await terminal('shells', 'idle', '')
    const session = await sendLikeTheApp(fixture, 'idle', true)
    expect(session.activity).toBe('Sent queued prompt')
    expect(session.queuedPrompts ?? []).toEqual([])
    await eventually(fixture.receipt, (value) => Boolean(value?.submits.length))
    await settle()
    expect(await fixture.receipt()).toEqual({
      pastes: [message], submits: [{ key: 'enter', text: message }], clears: 0, keys: '', draft: '',
    })
  }, 30_000)

  it('startup-owned passive session-use conflict · Queue waits without claiming, then drains once', async () => {
    const fixture = await terminal('passive', 'idle', '')
    const claims = vi.spyOn(fixture.store, 'claimTerminalQueuedPrompt')
    const owner = await Reflect.get(fixture.controller, 'owner').call(
      fixture.controller,
      fixture.id,
    )
    expect(owner).toBeTruthy()
    Reflect.get(fixture.controller, 'automaticStartupSessions').set(
      fixture.id,
      owner,
    )

    await expectRefusal(
      sendLikeTheApp(fixture, 'idle', false),
      PASSIVE_SESSION_CONFLICT,
    )
    expect(await fixture.receipt()).toEqual({
      pastes: [], submits: [], clears: 0, keys: '', draft: '',
    })

    const session = await sendLikeTheApp(fixture, 'idle', true)
    expect(session.queuedPrompts?.map((prompt) => prompt.content)).toEqual([message])
    await settle()
    expect(claims).not.toHaveBeenCalled()
    expect(fixture.store.get(fixture.id)?.queuedPrompts?.map((prompt) => prompt.content))
      .toEqual([message])
    expect(await fixture.receipt()).toEqual({
      pastes: [], submits: [], clears: 0, keys: '', draft: '',
    })

    process.kill(fixture.pid, 'SIGUSR2')
    await eventually(
      () => fixture.controller.inputReady(fixture.id),
      Boolean,
    )
    const retryAt = Reflect.get(
      fixture.service,
      'pendingTerminalQueueClaims',
    ).get(fixture.id)?.retryAt as number | undefined
    // A timer can fire just before Date.now() reaches its deadline, and an
    // early drain is a no-op here: this service's transcript poll never runs.
    while (retryAt && Date.now() < retryAt) {
      await new Promise((resolve) => setTimeout(resolve, retryAt - Date.now()))
    }
    await fixture.service['drainTerminalQueue'](fixture.id)
    const drained = await eventually(
      fixture.receipt,
      (receipt) => receipt.submits.length === 1,
    )

    expect(drained.submits).toHaveLength(1)
    expect(fixture.store.get(fixture.id)?.queuedPrompts ?? []).toEqual([])
    expect(await fixture.receipt()).toEqual({
      pastes: [message],
      submits: [{ key: 'enter', text: message }],
      clears: 0,
      keys: '',
      draft: '',
    })
  }, 30_000)

  it('startup-owned passive session-use conflict · queued command joins the FIFO without typing', async () => {
    const fixture = await terminal('passive', 'idle', '')
    const owner = await Reflect.get(fixture.controller, 'owner').call(
      fixture.controller,
      fixture.id,
    )
    expect(owner).toBeTruthy()
    Reflect.get(fixture.controller, 'automaticStartupSessions').set(
      fixture.id,
      owner,
    )

    const session = await fixture.service.executeCommand(
      fixture.id,
      '/usage queued while conflicted',
      true,
    )

    expect(session.queuedPrompts?.map((prompt) => ({
      content: prompt.content,
      command: prompt.command,
    }))).toEqual([{
      content: '/usage queued while conflicted',
      command: true,
    }])
    expect(await fixture.receipt()).toEqual({
      pastes: [], submits: [], clears: 0, keys: '', draft: '',
    })
  }, 30_000)

  // Suspected false refusals, recorded rather than fixed here (see #407).
  // Spec §6.2 says the Queue button MUST add to the app FIFO, and §6 says
  // explicit Queue requests MUST remain queued, yet the full-screen check runs
  // before queue routing. Nothing is lost: the browser restores the draft from
  // the 409.
  it.todo('question pane · Queue adds to the app FIFO instead of refusing as a full-screen view')
  it.todo('permission pane · Queue adds to the app FIFO instead of refusing as a full-screen view')
  it.todo('form pane · Queue adds to the app FIFO instead of refusing as a full-screen view')
  it.todo('overlay pane · Queue adds to the app FIFO instead of refusing as a full-screen view')
})
