import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { findActiveCopilotSessions } from './active-sessions.js'
import { forgetSessionEvents, readSessionEvents, sessionEventLogVersion } from './event-log.js'
import { SessionStore } from './session-store.js'
import { composerHoldsText, isTerminalAgentWorking, isTerminalOverlay, TmuxTerminalSessionController } from './terminal-session.js'
import { createIsolatedTmuxRoot, eventually, stopIsolatedTmuxServer, waitForProcessCommand } from './tmux-test-helpers.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile) }
})
const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const exec = promisify(execFile)
const services: AgentService[] = []
const releases: Array<() => void> = []
let root = ''
// A retry discovering a fresh owner also waits for the controller's stable-composer window.
const retryReadinessTimeout = 6_000
const discoveryReadinessTimeout = 16_000

function gate() {
  let finish = () => {}
  const promise = new Promise<void>((resolve) => { finish = resolve })
  releases.push(finish)
  return { promise, finish }
}

function client(): CopilotClientLike {
  const session = (sessionId: string): CopilotSessionLike => ({
    sessionId, on: () => () => {}, getEvents: async () => [],
    abort: async () => {}, disconnect: vi.fn(async () => {}),
    sendAndWait: vi.fn(async () => { throw new Error('Native work must never use the SDK') }),
    rpc: {
      commands: {
        list: async () => ({ commands: [{
          name: 'usage', description: 'Synthetic usage', kind: 'builtin', allowDuringAgentExecution: true,
        }] }),
        invoke: vi.fn(), enqueue: vi.fn(),
      },
      model: {
        getCurrent: async () => ({ modelId: 'synthetic' }),
        switchTo: async () => ({ modelId: 'synthetic' }),
      },
      name: { set: async () => {} }, mode: { set: async () => {} },
    },
  })
  return {
    start: vi.fn(async () => {}), stop: vi.fn(async () => []),
    createSession: vi.fn(async (config) => session(config.sessionId || randomUUID())),
    resumeSession: vi.fn(async () => { throw new Error('Native sessions must not be resumed through the SDK') }),
    listSessions: vi.fn(async () => []), deleteSession: vi.fn(async () => {}),
    rpc: {
      models: { list: async () => ({ models: [] }) },
      commands: { list: async () => ({ commands: [] }) },
    },
  }
}

async function fixture(readinessTimeoutMs = 10_000) {
  const id = randomUUID()
  const workspace = path.join(root, 'workspace')
  const stateDirectory = path.join(root, 'state')
  const copilotHome = path.join(root, 'copilot')
  const receiptFile = path.join(root, 'native-receipt.json')
  const controlFile = path.join(root, 'native-control.json')
  const executable = path.join(workspace, 'copilot-startup-fixture.mjs')
  await mkdir(workspace)
  vi.stubEnv('COPILOT_HOME', copilotHome)
  await writeFile(executable, `
import { writeFileSync, renameSync, existsSync, readFileSync } from 'node:fs'
const file = ${JSON.stringify(receiptFile)}
const controlFile = ${JSON.stringify(controlFile)}
const state = { pid: process.pid, pastes: [], submits: [], working: false, mode: 'idle', control: 0 }
let input = '', draft, response = 'Synthetic native startup fixture'
function save() {
  writeFileSync(file + '.tmp', JSON.stringify(state))
  renameSync(file + '.tmp', file)
}
function draw() {
  if (state.mode === 'overlay') {
    process.stdout.write('\\x1b[2J\\x1b[HSelect a session\\r\\n- session one\\r\\n\\u2191/\\u2193 to navigate \\u00b7 enter to select \\u00b7 esc to cancel')
    return
  }
  process.stdout.write('\\x1b[2J\\x1b[H' + [
    response, '\\u257b\\u2584\\u2584\\u2584\\u2584\\u2584',
    '\\u2503 ' + (draft || ''), '\\u2579\\u2580\\u2580\\u2580\\u2580\\u2580',
    state.working ? 'Working - esc interrupt' : ' / commands',
  ].join('\\r\\n'))
}
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdout.write('\\x1b[?2004h')
process.stdin.on('data', (data) => {
  input += data.toString()
  const end = input.indexOf('\\x1b[201~')
  if (draft === undefined && end >= 0) {
    draft = input.slice(input.indexOf('\\x1b[200~') + 6, end)
    input = input.slice(end + 6)
    state.pastes.push(draft)
    draw(); save()
  }
  if (draft !== undefined && /[\\r\\x11]/.test(input)) {
    const content = draft
    state.submits.push(content)
    draft = undefined; input = ''
    state.working = !content.startsWith('/usage')
    response = 'Synthetic response ' + state.submits.length
    draw(); save()
  }
})
setInterval(() => {
  if (!existsSync(controlFile)) return
  const control = JSON.parse(readFileSync(controlFile, 'utf8'))
  if (control.sequence <= state.control) return
  state.control = control.sequence
  state.mode = control.mode
  state.working = control.mode === 'busy'
  draft = control.mode === 'draft' ? 'Unsent native draft' : undefined
  input = ''
  draw(); save()
}, 20)
draw(); save()
`)
  const name = `startup-${randomUUID().slice(0, 8)}`
  await exec('tmux', ['new-session', '-d', '-s', name, process.execPath, executable, '--session-id', id])
  const pid = Number((await exec('tmux', ['display-message', '-p', '-t', name, '#{pane_pid}'])).stdout.trim())
  await waitForProcessCommand(pid, [executable])
  const ready = await eventually(async () => {
    try { return JSON.parse(await readFile(receiptFile, 'utf8')) }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      return undefined
    }
  }, (receipt) => receipt?.pid === pid, readinessTimeoutMs)
  expect(ready?.pid).toBe(pid)
  const directory = path.join(copilotHome, 'session-state', id)
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, `inuse.${pid}.lock`), `${pid}\n`)
  const eventsFile = path.join(directory, 'events.jsonl')
  await writeFile(eventsFile, JSON.stringify({
    type: 'session.idle', id: 'old-idle', parentId: null,
    timestamp: '2026-09-06T00:00:00.000Z', data: {},
  }) + '\n')
  const initial = new SessionStore(stateDirectory)
  await initial.initialize()
  await initial.create({
    id, provider: 'copilot', cwd: workspace, title: 'Native startup queue',
    updatedAt: '2026-09-06T00:00:00.000Z', status: 'idle', isOpen: true, messages: [],
  }, { backend: 'terminal', managedOpen: true })
  await initial.close()
  const connect = () => {
    const store = new SessionStore(stateDirectory)
    const terminal = new TmuxTerminalSessionController()
    const sdk = client()
    const finder = vi.fn(async () => (await findActiveCopilotSessions()).filter((session) => session.id === id))
    const service = new AgentService(
      store, sdk, finder, async () => {}, readSessionEvents, sessionEventLogVersion,
      terminal, async () => undefined, async () => undefined,
    )
    const creates = vi.spyOn(terminal, 'create')
    services.push(service)
    return { service, store, terminal, sdk, finder, creates }
  }
  let controlSequence = 0
  const seed = async (
    contents: string[],
    mutate?: (store: SessionStore) => Promise<unknown>,
  ) => {
    const store = new SessionStore(stateDirectory)
    await store.initialize()
    for (const content of contents) {
      await store.enqueuePrompt(id, {
        id: randomUUID(), content, createdAt: new Date().toISOString(),
        ...(content.startsWith('/') ? { command: true } : {}),
      })
    }
    await mutate?.(store)
    await store.close()
  }
  return {
    id, pid, connect, seed, stateDirectory, eventsFile,
    control: async (mode: 'idle' | 'busy' | 'overlay' | 'draft') => {
      controlSequence += 1
      await writeFile(`${controlFile}.tmp`, JSON.stringify({ mode, sequence: controlSequence }))
      await rename(`${controlFile}.tmp`, controlFile)
      await eventually(
        async () => JSON.parse(await readFile(receiptFile, 'utf8')),
        (receipt) => receipt.control === controlSequence,
      )
    },
    receipt: async () => JSON.parse(await readFile(receiptFile, 'utf8')) as {
      pid: number; pastes: string[]; submits: string[]; working: boolean
    },
    persisted: async () => JSON.parse(await readFile(path.join(stateDirectory, 'state.json'), 'utf8')).sessions[id],
  }
}

async function drainWithCoalescedMetadata(
  native: Awaited<ReturnType<typeof fixture>>,
  runtime: ReturnType<Awaited<ReturnType<typeof fixture>>['connect']>,
  refuse: boolean,
) {
  const marker = 'Rejected coalesced metadata candidate'
  let refusals = 0
  let mutation: Promise<unknown> | undefined
  vi.mocked(writeFile).mockImplementation(async (...args) => {
    if (refuse && String(args[0]) === path.join(native.stateDirectory, 'state.json.tmp') &&
        JSON.parse(String(args[1])).sessions[native.id]?.activity === marker) {
      refusals += 1
      throw Object.assign(new Error('Coalesced metadata persistence refused'), { code: 'EACCES' })
    }
    return disk.writeFile(...args)
  })
  const read = runtime.store.readAfterWrites.bind(runtime.store)
  vi.spyOn(runtime.store, 'readAfterWrites').mockImplementationOnce((id) => {
    mutation = runtime.store.update(id, (session) => { session.activity = marker })
      .then(() => ({ committed: true }), (error: unknown) => ({ error }))
    return read(id)
  })
  await runtime.service['drainTerminalQueue'](native.id)
  expect(mutation).toBeDefined()
  expect(await mutation).toMatchObject(refuse ? { error: { code: 'EACCES' } } : { committed: true })
  expect(refusals).toBe(refuse ? 1 : 0)
}

async function acceptedStartupRecovery(
  readiness: 'ready' | 'unreadable' | 'no owner' = 'unreadable',
  prepare?: (store: SessionStore, id: string) => Promise<unknown>,
) {
  const native = await fixture()
  const accepted = 'Already accepted before restart; never resend'
  const queued = 'FIFO behind accepted recovery'
  const token = `resend:${randomUUID()}`
  await native.seed([queued], async (store) => {
    const failed = { content: accepted, failedAt: '2026-09-06T01:00:00.000Z', uncertain: true }
    await store.update(native.id, (session) => { session.failedPrompt = failed })
    await store.claimFailedPrompt(native.id, failed, accepted, token)
    await store.acceptRecoveryResend(native.id, token)
    await prepare?.(store, native.id)
  })
  const runtime = native.connect()
  const acknowledging = gate()
  const releaseAcknowledgement = gate()
  const acknowledge = runtime.store.clearFailedPrompt.bind(runtime.store)
  vi.spyOn(runtime.store, 'clearFailedPrompt').mockImplementationOnce(async (...args) => {
    acknowledging.finish()
    await releaseAcknowledgement.promise
    return acknowledge(...args)
  })
  let readable = readiness !== 'unreadable'
  const capture = runtime.terminal.capture.bind(runtime.terminal)
  const captures = vi.spyOn(runtime.terminal, 'capture').mockImplementation((...args) =>
    readable ? capture(...args) : Promise.resolve(undefined))
  if (readiness === 'no owner') {
    runtime.finder.mockResolvedValue([])
    vi.spyOn(runtime.terminal, 'has').mockResolvedValue(false)
  }
  const claims = vi.spyOn(runtime.store, 'claimTerminalQueuedPrompt')
  await runtime.service.start()
  await acknowledging.promise
  return {
    native, runtime, accepted, queued, token, claims, captures, releaseAcknowledgement,
    setReadable: () => { readable = true },
  }
}

beforeEach(async () => {
  root = await createIsolatedTmuxRoot()
  vi.stubEnv('HOME', root)
  vi.stubEnv('TMUX_TMPDIR', root)
  vi.stubEnv('TMUX', '')
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
})

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  vi.mocked(writeFile).mockImplementation(disk.writeFile)
  for (const service of services.splice(0)) await service.stop()
  await stopIsolatedTmuxServer(root)
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('Persisted native queue startup', () => {
  it.each([
    { kind: 'message', history: 'none' },
    { kind: 'message', history: 'older completion' },
    { kind: 'command', history: 'none' },
    { kind: 'command', history: 'older completion' },
  ])('resumes a $kind committed during stop with $history after NEW service startup', async ({ kind, history }) => {
    const native = await fixture()
    const old = native.connect()
    await old.service.start()
    expect(old.creates).not.toHaveBeenCalled()
    const content = kind === 'command' ? '/usage queued before stop' : 'Message queued before stop'
    const entered = gate()
    const release = gate()
    let held = false
    vi.mocked(writeFile).mockImplementation(async (...args) => {
      if (!held && String(args[0]) === path.join(native.stateDirectory, 'state.json.tmp') &&
          JSON.parse(String(args[1])).sessions[native.id]?.queuedPrompts?.some(
            (prompt: { content: string }) => prompt.content === content,
          )) {
        held = true
        entered.finish()
        await release.promise
      }
      return disk.writeFile(...args)
    })
    const enqueuing = kind === 'command'
      ? old.service.executeCommand(native.id, content, true)
      : old.service.sendMessage(native.id, content, true)
    await entered.promise
    const stopping = old.service.stop()
    release.finish()
    await Promise.all([enqueuing, stopping])
    const before = await native.persisted()
    expect(before.queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual([content])
    expect((await native.receipt()).submits).toEqual([])
    const bytes = await readFile(path.join(native.stateDirectory, 'state.json'), 'utf8')
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(await readFile(path.join(native.stateDirectory, 'state.json'), 'utf8')).toBe(bytes)
    expect((await native.receipt()).pastes).toEqual([])
    if (history === 'none') await rm(native.eventsFile)
    forgetSessionEvents(native.id)
    const restarted = native.connect()
    await restarted.service.start()
    const delivered = await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 2_000)
    expect(delivered.submits).toEqual([content])
    expect(delivered.pastes).toEqual([content])
    expect(delivered.pid).toBe(native.pid)
    expect(restarted.creates).not.toHaveBeenCalled()
    expect(restarted.sdk.resumeSession).not.toHaveBeenCalled()
    expect((await native.persisted()).queuedPrompts).toEqual([])
  }, 15_000)

  it.each(['none', 'older completion'])('starts canonical command-command-message FIFO once with %s', async (history) => {
    const native = await fixture()
    const contents = ['/usage first', '/usage second', 'Final native message']
    await native.seed(contents)
    if (history === 'none') await rm(native.eventsFile)
    const runtime = native.connect()
    const initialize = vi.spyOn(runtime.store, 'initialize')
    const first = runtime.service.start()
    const simultaneous = runtime.service.start()
    expect(simultaneous).toBe(first)
    await Promise.all([first, simultaneous])
    expect((await native.receipt()).submits).toEqual(contents)
    expect((await native.receipt()).pastes).toEqual(contents)
    await runtime.service.start()
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect((await native.receipt()).submits).toEqual(contents)
    expect(initialize).toHaveBeenCalledTimes(1)
    expect(runtime.sdk.start).toHaveBeenCalledTimes(1)
    expect(runtime.creates).not.toHaveBeenCalled()
    expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
    expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(false)
  }, 15_000)

  it('does not create, reopen or dispatch merely because a queue exists without a live owner', async () => {
    const native = await fixture(20_000)
    await native.seed(['Must stay queued'])
    const runtime = native.connect()
    runtime.finder.mockResolvedValue([])
    vi.spyOn(runtime.terminal, 'has').mockResolvedValue(false)
    await runtime.service.start()
    await new Promise((resolve) => setTimeout(resolve, 900))
    expect((await native.receipt()).pastes).toEqual([])
    expect(runtime.creates).not.toHaveBeenCalled()
    expect(runtime.sdk.resumeSession).not.toHaveBeenCalled()
    expect(runtime.store.get(native.id)?.isOpen).toBe(false)
    expect((await native.persisted()).queuedPrompts).toHaveLength(1)
    expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(true)
  }, 30_000)

  it('does not retain stale startup intent when a failed start is retried after closure', async () => {
    const native = await fixture()
    await native.seed(['Closed after failed startup'])
    const runtime = native.connect()
    vi.mocked(runtime.sdk.start).mockRejectedValueOnce(new Error('Provider startup refused'))
    await expect(runtime.service.start()).rejects.toThrow('Provider startup refused')
    await runtime.store.setOpen(native.id, false, true)
    await runtime.service.start()
    expect((await native.receipt()).pastes).toEqual([])
    expect((await native.persisted()).queuedPrompts).toHaveLength(1)
    expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
    expect(runtime.sdk.start).toHaveBeenCalledTimes(2)
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 15_000)

  it.each(['closed', 'unmanaged', 'suspended', 'deleted', 'uncertain recovery', 'pending claim'])(
    'does not automatically dispatch an initially %s queue',
    async (state) => {
      const native = await fixture()
      await native.seed(['Protected A', 'Protected B'], async (store) => {
        if (state === 'closed') await store.setOpen(native.id, false, true)
        else if (state === 'unmanaged') {
          await store.update(native.id, (session) => {
            Object.assign(session, { managedOpen: false })
          })
        } else if (state === 'suspended') await store.setSuspended(native.id, true)
        else if (state === 'deleted') await store.remove(native.id)
        else if (state === 'uncertain recovery') {
          await store.update(native.id, (session) => {
            session.failedPrompt = { content: 'Uncertain prior work', failedAt: new Date().toISOString(), uncertain: true }
          })
        } else if (state === 'pending claim') {
          const head = store.get(native.id)!.queuedPrompts![0]
          await store.claimTerminalQueuedPrompt(native.id, head, () => true)
        }
      })
      const runtime = native.connect()
      await runtime.service.start()
      await runtime.service.start()
      await new Promise((resolve) => setTimeout(resolve, 850))
      expect((await native.receipt()).pastes).toEqual([])
      expect(runtime.creates).not.toHaveBeenCalled()
      if (state === 'deleted') expect(runtime.store.get(native.id)).toBeUndefined()
      else expect(runtime.store.get(native.id)?.queuedPrompts?.length).toBeGreaterThan(0)
    }, 15_000,
  )

  it.each(['busy', 'overlay', 'draft'] as const)('waits for a real %s native pane, then retries without an event', async (mode) => {
    const native = await fixture()
    await native.seed(['Held for native readiness'])
    await native.control(mode)
    const runtime = native.connect()
    const pane = (await runtime.terminal.capture(native.id))!
    if (mode === 'busy') expect(isTerminalAgentWorking(pane)).toBe(true)
    else if (mode === 'overlay') expect(isTerminalOverlay(pane)).toBe(true)
    else expect(composerHoldsText(pane)).toBe(true)
    await runtime.service.start()
    expect((await native.receipt()).submits).toEqual([])
    expect((await native.persisted()).queuedPrompts).toHaveLength(1)
    expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(true)
    await native.control('idle')
    const delivered = await eventually(native.receipt, (receipt) => receipt.submits.length === 1, retryReadinessTimeout)
    expect(delivered.submits).toEqual(['Held for native readiness'])
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 15_000)

  it.each(['missing', 'unrecognized', 'throws'])('retries a transient %s capture without claiming or sending early', async (failure) => {
    const native = await fixture()
    await native.seed(['Retry after observation'])
    const runtime = native.connect()
    const capture = vi.spyOn(runtime.terminal, 'capture')
    if (failure === 'missing') capture.mockResolvedValueOnce(undefined)
    else if (failure === 'unrecognized') capture.mockResolvedValueOnce('Native pane is still loading')
    else capture.mockRejectedValueOnce(new Error('Transient native capture failure'))
    await runtime.service.start()
    expect((await native.receipt()).submits).toEqual([])
    expect((await native.persisted()).queuedPrompts).toHaveLength(1)
    expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(true)
    const delivered = await eventually(native.receipt, (receipt) => receipt.submits.length === 1, retryReadinessTimeout)
    expect(delivered.submits).toEqual(['Retry after observation'])
  }, 15_000)

  it('keeps pending startup work after an inconclusive boot owner probe', async () => {
    const native = await fixture()
    await native.seed(['Native owner survived'])
    const runtime = native.connect()
    vi.spyOn(runtime.terminal, 'has').mockRejectedValueOnce(new Error('Transient owner probe failure'))
    await runtime.service.start()
    expect((await native.receipt()).pastes).toEqual([])
    expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(true)
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, discoveryReadinessTimeout)).submits)
      .toEqual(['Native owner survived'])
    expect(runtime.store.isManagedOpen(native.id)).toBe(true)
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 20_000)

  it('accepts a positively identified owner omitted from the initial aggregate listing', async () => {
    const native = await fixture()
    await native.seed(['Use the confirmed native owner'])
    const before = await native.receipt()
    const runtime = native.connect()
    runtime.finder.mockResolvedValueOnce([])
    const has = vi.spyOn(runtime.terminal, 'has')
    await runtime.service.start()
    expect(await runtime.finder.mock.results[0].value).toEqual([])
    expect(await has.mock.results[0].value).toBe(true)
    expect((await native.receipt()).submits).toEqual(['Use the confirmed native owner'])
    expect((await native.receipt()).pid).toBe(before.pid)
    expect(runtime.store.isManagedOpen(native.id)).toBe(true)
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 20_000)

  it('waits for rejected initial discovery and recovers on the existing schedule', async () => {
    const native = await fixture()
    await native.seed(['Await complete discovery'])
    const runtime = native.connect()
    runtime.finder.mockRejectedValueOnce(new Error('Transient initial discovery failure'))
    await runtime.service.start()
    expect((await native.receipt()).submits).toEqual([])
    expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(true)
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, discoveryReadinessTimeout)).submits)
      .toEqual(['Await complete discovery'])
    expect(runtime.finder.mock.calls.length).toBeGreaterThan(1)
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 20_000)

  it('retains the exact FIFO head on a real claim-write refusal and retries once', async () => {
    const native = await fixture()
    await native.seed(['Retry durable claim'])
    const before = await native.persisted()
    let refused = false
    vi.mocked(writeFile).mockImplementation(async (...args) => {
      const target = path.join(native.stateDirectory, 'state.json.tmp')
      if (!refused && String(args[0]) === target &&
          JSON.parse(String(args[1])).sessions[native.id]?.terminalQueueDispatch) {
        refused = true
        await disk.mkdir(target)
        try { return await disk.writeFile(...args) }
        finally { await disk.rm(target, { recursive: true }) }
      }
      return disk.writeFile(...args)
    })
    const runtime = native.connect()
    await runtime.service.start()
    expect(refused).toBe(true)
    expect((await native.receipt()).pastes).toEqual([])
    expect((await native.persisted()).queuedPrompts).toEqual(before.queuedPrompts)
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, retryReadinessTimeout)).submits)
      .toEqual(['Retry durable claim'])
    expect((await native.persisted()).queuedPrompts).toEqual([])
  }, 15_000)

  it('rejects initial discovery persistence failure without consuming work and permits explicit startup retry', async () => {
    const native = await fixture()
    await native.seed(['Await durable discovery'])
    const before = await native.persisted()
    let refused = false
    vi.mocked(writeFile).mockImplementation(async (...args) => {
      const target = path.join(native.stateDirectory, 'state.json.tmp')
      if (!refused && String(args[0]) === target) {
        refused = true
        await disk.mkdir(target)
        try { return await disk.writeFile(...args) }
        finally { await disk.rm(target, { recursive: true }) }
      }
      return disk.writeFile(...args)
    })
    const runtime = native.connect()
    await expect(runtime.service.start()).rejects.toMatchObject({ code: 'EISDIR' })
    expect(refused).toBe(true)
    expect((await native.receipt()).pastes).toEqual([])
    expect((await native.persisted()).queuedPrompts).toEqual(before.queuedPrompts)
    expect(runtime.service['nativeStartupDiscoveryReady']).toBe(false)
    expect(runtime.creates).not.toHaveBeenCalled()
    await runtime.service.start()
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, discoveryReadinessTimeout)).submits)
      .toEqual(['Await durable discovery'])
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 20_000)

  it('backs off a persistent missing observation rather than hot-looping', async () => {
    const native = await fixture()
    await native.seed(['Wait for readable owner'])
    const runtime = native.connect()
    const capture = vi.spyOn(runtime.terminal, 'capture').mockResolvedValue(undefined)
    await runtime.service.start()
    const first = runtime.service['pendingTerminalQueueClaims'].get(native.id)!
    expect(first.retryDelay).toBe(1500)
    for (let index = 0; index < 8; index += 1) await runtime.service.refreshTranscripts()
    expect(capture).toHaveBeenCalledTimes(1)
    expect((await native.receipt()).pastes).toEqual([])
    expect((await native.persisted()).queuedPrompts).toHaveLength(1)
  }, 15_000)

  it('revalidates managed-open state after the native observation and before claiming', async () => {
    const native = await fixture()
    await native.seed(['Must not reopen this session'])
    const runtime = native.connect()
    const entered = gate()
    const release = gate()
    const capture = runtime.terminal.capture.bind(runtime.terminal)
    vi.spyOn(runtime.terminal, 'capture').mockImplementationOnce(async (...args) => {
      entered.finish()
      await release.promise
      return capture(...args)
    })
    const starting = runtime.service.start()
    await entered.promise
    await runtime.store.setOpen(native.id, false, true)
    release.finish()
    await starting
    expect((await native.receipt()).pastes).toEqual([])
    expect(runtime.store.isManagedOpen(native.id)).toBe(false)
    expect((await native.persisted()).queuedPrompts).toHaveLength(1)
    expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 15_000)

  it.each(['stop', 'suspend', 'delete', 'clear'] as const)('respects %s during the startup observation boundary', async (action) => {
    const native = await fixture()
    await native.seed(['Do not outlive the owner'])
    const runtime = native.connect()
    const entered = gate()
    const release = gate()
    const capture = runtime.terminal.capture.bind(runtime.terminal)
    vi.spyOn(runtime.terminal, 'capture').mockImplementationOnce(async (...args) => {
      entered.finish()
      await release.promise
      return capture(...args)
    })
    const starting = runtime.service.start()
    await entered.promise
    const changing = action === 'stop' ? runtime.service.stop()
      : action === 'suspend' ? runtime.service.suspendSession(native.id).then((value) => ({ value }), (error: unknown) => ({ error }))
        : action === 'delete' ? runtime.service.deleteSession(native.id)
          : runtime.service.clearConversation(native.id).then((value) => ({ value }), (error: unknown) => ({ error }))
    release.finish()
    const [, changed] = await Promise.all([starting, changing])
    if (action === 'clear' || action === 'suspend') {
      expect(changed).toMatchObject({ error: { statusCode: 409 } })
      expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, retryReadinessTimeout)).pastes)
        .toEqual(['Do not outlive the owner'])
      expect(runtime.store.isRetiredSession(native.id)).toBe(false)
    } else {
      expect((await native.receipt()).pastes).toEqual([])
      if (action === 'delete') expect(runtime.store.get(native.id)).toBeUndefined()
      else expect((await native.persisted()).queuedPrompts).toHaveLength(1)
    }
    if (action === 'stop') {
      await expect(runtime.service.start()).rejects.toMatchObject({ statusCode: 503 })
      const bytes = await readFile(path.join(native.stateDirectory, 'state.json'), 'utf8')
      await new Promise((resolve) => setTimeout(resolve, 80))
      expect(await readFile(path.join(native.stateDirectory, 'state.json'), 'utf8')).toBe(bytes)
    }
  }, 15_000)
})

describe('PR162 startup pump composition', () => {
  it.each(['message', 'command'] as const)(
    'resumes an answering %s committed during stop once across coalesced wakes and Clear',
    async (kind) => {
      const native = await fixture()
      const old = native.connect()
      await old.service.start()
      const content = kind === 'command' ? '/usage recovered before stop' : 'Recovered message before stop'
      const token = '2026-09-06T01:00:00.000Z'
      await old.store.update(native.id, (session) => {
        session.failedPrompt = { content, failedAt: token, uncertain: true }
      })
      const writing = gate()
      const releaseWrite = gate()
      let held = false
      vi.mocked(writeFile).mockImplementation(async (...args) => {
        if (!held && String(args[0]) === path.join(native.stateDirectory, 'state.json.tmp') &&
            JSON.parse(String(args[1])).sessions[native.id]?.queuedPrompts?.some(
              (prompt: { content: string }) => prompt.content === content,
            )) {
          held = true
          writing.finish()
          await releaseWrite.promise
        }
        return disk.writeFile(...args)
      })
      const sending = kind === 'command'
        ? old.service.executeCommand(native.id, content, true, token)
        : old.service.sendMessage(native.id, content, true, token)
      await writing.promise
      const stopping = old.service.stop()
      releaseWrite.finish()
      await Promise.all([sending, stopping])
      const before = await native.persisted()
      expect(before.queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual([content])
      expect(before.failedPrompt).toBeUndefined()
      expect(before.recoveryResend).toBeUndefined()
      expect((await native.receipt()).pastes).toEqual([])
      await rm(native.eventsFile)
      forgetSessionEvents(native.id)

      const restarted = native.connect()
      const observing = gate()
      const releaseObservation = gate()
      const capture = restarted.terminal.capture.bind(restarted.terminal)
      vi.spyOn(restarted.terminal, 'capture').mockImplementationOnce(async (...args) => {
        observing.finish()
        await releaseObservation.promise
        return capture(...args)
      })
      const claims = vi.spyOn(restarted.store, 'claimTerminalQueuedPrompt')
      const starting = restarted.service.start()
      await observing.promise
      expect(restarted.service.start()).toBe(starting)
      restarted.service['wakeTerminalQueue'](native.id)
      restarted.service['wakeTerminalQueue'](native.id)
      restarted.service['wakeTerminalQueue'](native.id)
      const clearing = restarted.service.clearConversation(native.id)
        .then((value) => ({ value }), (error: unknown) => ({ error }))
      releaseObservation.finish()
      await starting
      expect(await clearing).toMatchObject({ error: { statusCode: 409 } })
      await vi.waitFor(() => expect(restarted.service['terminalQueueWakeups'].size).toBe(0))
      expect((await native.receipt()).submits).toEqual([content])
      expect((await native.receipt()).pastes).toEqual([content])
      expect((await native.receipt()).pid).toBe(native.pid)
      expect(claims).toHaveBeenCalledOnce()
      expect(claims.mock.calls[0][3]).toBe(true)
      expect((await native.persisted()).queuedPrompts).toEqual([])
      expect(restarted.service['startupTerminalQueues'].has(native.id)).toBe(false)
      await expect(kind === 'command'
        ? restarted.service.executeCommand(native.id, content, true, token)
        : restarted.service.sendMessage(native.id, content, true, token))
        .rejects.toMatchObject({ statusCode: 409 })
      expect(restarted.creates).not.toHaveBeenCalled()
      expect(restarted.sdk.resumeSession).not.toHaveBeenCalled()
    }, 15_000,
  )

  it.each([
    { readiness: 'ready', coalescedBatch: 'none' },
    { readiness: 'unreadable', coalescedBatch: 'none' },
    { readiness: 'no owner', coalescedBatch: 'none' },
    { readiness: 'unreadable', coalescedBatch: 'success' },
    { readiness: 'unreadable', coalescedBatch: 'refusal' },
  ] as const)(
    'retains startup eligibility until an accepted recovery acknowledgement settles ($readiness/$coalescedBatch)',
    async ({ readiness, coalescedBatch }) => {
      const { native, runtime, accepted, queued, token, claims, releaseAcknowledgement, setReadable } =
        await acceptedStartupRecovery(readiness)
      expect(runtime.service.getSession(native.id)?.failedPrompt).toBeUndefined()
      expect(runtime.store.recoveryResend(native.id)?.accepted).toBe(true)
      expect((await native.receipt()).pastes).toEqual([])
      expect.soft(runtime.service['startupTerminalQueues'].has(native.id)).toBe(true)
      if (coalescedBatch !== 'none') {
        await drainWithCoalescedMetadata(native, runtime, coalescedBatch === 'refusal')
        expect.soft(runtime.service['startupTerminalQueues'].has(native.id)).toBe(true)
        const persisted = await native.persisted()
        expect(persisted.recoveryResend).toMatchObject({ failedAt: token, accepted: true })
        expect(persisted.failedPrompt.failedAt).toBe(token)
        expect((await native.receipt()).pastes).toEqual([])
      }
      releaseAcknowledgement.finish()
      await vi.waitFor(() => expect(runtime.store.get(native.id)?.failedPrompt).toBeUndefined())
      if (readiness !== 'ready') {
        await vi.waitFor(() => expect(
          runtime.service['pendingTerminalQueueClaims'].has(native.id) || claims.mock.calls.length > 0,
        ).toBe(true))
        expect(claims).not.toHaveBeenCalled()
        expect((await native.receipt()).pastes).toEqual([])
        expect((await native.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content))
          .toEqual([queued])
        setReadable()
      }
      if (readiness !== 'no owner') {
        // A refused coalesced read adds a bounded retry before native readiness.
        const completionTimeout = coalescedBatch === 'refusal' ? discoveryReadinessTimeout : retryReadinessTimeout
        expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, completionTimeout)).submits)
          .toEqual([queued])
        expect(claims).toHaveBeenCalledOnce()
        expect(claims.mock.calls[0][3]).toBe(true)
        await vi.waitFor(() =>
          expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false),
        )
      }
      await expect(runtime.service.sendMessage(native.id, accepted, false, token))
        .rejects.toMatchObject({ statusCode: 409 })
      expect((await native.receipt()).pastes).not.toContain(accepted)
      expect(runtime.creates).not.toHaveBeenCalled()
    }, 20_000,
  )

  it.each(['newer recovery', 'unknown attempt'] as const)(
    'does not preserve the accepted exception for a %s after a coalesced refusal',
    async (replacement) => {
      const context = await acceptedStartupRecovery()
      const { native, runtime, accepted, queued, token, claims } = context
      const next = {
        content: replacement === 'unknown attempt' ? accepted : 'Newer recovery text',
        failedAt: `resend:${randomUUID()}`, uncertain: true,
      }
      await runtime.store.update(native.id, (session) => {
        session.failedPrompt = next
        if (replacement === 'unknown attempt') Object.assign(session, {
          recoveryResend: { failedAt: next.failedAt, content: next.content, accepted: false },
        })
      })
      expect(runtime.service['recoveryClaims'].get(token)?.accepted).toBe(true)
      await drainWithCoalescedMetadata(native, runtime, true)
      expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
      expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(false)
      const acknowledgement = [...runtime.service['pendingAcknowledgements'].values()]
      context.releaseAcknowledgement.finish()
      await Promise.all(acknowledgement)
      context.setReadable()
      await runtime.service.refreshTranscripts()
      expect(runtime.service.getSession(native.id)?.failedPrompt).toEqual(next)
      expect((await native.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content))
        .toEqual([queued])
      expect(claims).not.toHaveBeenCalled()
      expect((await native.receipt()).pastes).toEqual([])
    }, 15_000,
  )

  it('backs off coalesced accepted-recovery reads without relaxing the startup guard', async () => {
    const context = await acceptedStartupRecovery()
    const { native, runtime, claims, captures } = context
    await drainWithCoalescedMetadata(native, runtime, true)
    expect(runtime.service['pendingTerminalQueueClaims'].get(native.id)?.retryDelay).toBe(1500)
    for (let attempt = 0; attempt < 8; attempt += 1) {
      runtime.service['retryTerminalQueueClaim'](native.id, true)
    }
    const retry = runtime.service['pendingTerminalQueueClaims'].get(native.id)
    expect(retry?.retryDelay).toBe(60_000)
    const captureCount = captures.mock.calls.length
    for (let attempt = 0; attempt < 4; attempt += 1) await runtime.service.refreshTranscripts()
    expect(runtime.service['pendingTerminalQueueClaims'].get(native.id)).toEqual(retry)
    expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(true)
    expect(captures).toHaveBeenCalledTimes(captureCount)
    expect(claims).not.toHaveBeenCalled()
    expect((await native.receipt()).pastes).toEqual([])
    const stopping = runtime.service.stop()
    context.releaseAcknowledgement.finish()
    await stopping
    expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
    expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(false)
    expect((await native.receipt()).pastes).toEqual([])
  }, 15_000)

  it.each([
    { lifecycle: 'stop', cleanup: 'retry' },
    { lifecycle: 'suspend', cleanup: 'retry' },
    { lifecycle: 'delete', cleanup: 'retry' },
    { lifecycle: 'closed', cleanup: 'retry' },
    { lifecycle: 'unmanaged', cleanup: 'retry' },
    { lifecycle: 'backend changed', cleanup: 'retry' },
    { lifecycle: 'closed', cleanup: 'normal drain' },
    { lifecycle: 'unmanaged', cleanup: 'normal drain' },
    { lifecycle: 'backend changed', cleanup: 'normal drain' },
  ] as const)(
    'retires startup intent and cancels its accepted-ack wake after $lifecycle ($cleanup)',
    async ({ lifecycle, cleanup }) => {
      const context = await acceptedStartupRecovery()
      const { native, runtime, queued, claims } = context
      let changing: Promise<unknown> | undefined
      if (lifecycle === 'stop') changing = runtime.service.stop()
      else if (lifecycle === 'suspend') {
        changing = runtime.service.suspendSession(native.id)
        await vi.waitFor(() => expect(runtime.service['suspendingSessions'].has(native.id)).toBe(true))
      } else if (lifecycle === 'delete') {
        changing = runtime.service.deleteSession(native.id)
        await vi.waitFor(() => expect(runtime.service['deletingSessions'].has(native.id)).toBe(true))
      } else if (lifecycle === 'closed') await runtime.store.setOpen(native.id, false, true)
      else if (lifecycle === 'unmanaged') {
        await runtime.store.update(native.id, (session) => { Object.assign(session, { managedOpen: false }) })
      } else await runtime.store.setBackend(native.id, 'sdk')
      if (cleanup === 'normal drain') await runtime.service['drainTerminalQueue'](native.id)
      else runtime.service['retryTerminalQueueClaim'](native.id, true)
      expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
      expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(false)
      const acknowledgement = [...runtime.service['pendingAcknowledgements'].values()]
      context.setReadable()
      context.releaseAcknowledgement.finish()
      await Promise.all(acknowledgement)
      await changing
      await Promise.all([...runtime.service['terminalQueueWakeups'].values()])
      expect(claims).not.toHaveBeenCalled()
      expect((await native.receipt()).pastes).toEqual([])
      if (lifecycle === 'delete') expect(runtime.store.get(native.id)).toBeUndefined()
      else expect((await native.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content))
        .toEqual([queued])
    }, 15_000,
  )

  it.each(['closed', 'unmanaged'] as const)(
    'does not turn an initially %s accepted receipt into ordinary startup delivery',
    async (lifecycle) => {
      const context = await acceptedStartupRecovery('ready', (store, id) =>
        lifecycle === 'closed' ? store.setOpen(id, false, true)
          : store.update(id, (session) => { Object.assign(session, { managedOpen: false }) }))
      const { native, runtime, queued, claims } = context
      expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
      const acknowledgement = [...runtime.service['pendingAcknowledgements'].values()]
      context.releaseAcknowledgement.finish()
      await Promise.all(acknowledgement)
      await Promise.all([...runtime.service['terminalQueueWakeups'].values()])
      expect(claims).not.toHaveBeenCalled()
      expect((await native.receipt()).pastes).toEqual([])
      expect((await native.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content))
        .toEqual([queued])
    }, 15_000,
  )

  it('does not resurrect a cancelled acknowledgement wake when discovery reopens its metadata', async () => {
    const context = await acceptedStartupRecovery('ready')
    const { native, runtime, queued, claims } = context
    await runtime.store.setOpen(native.id, false, true)
    runtime.service['retryTerminalQueueClaim'](native.id, true)
    expect(runtime.service['startupTerminalQueues'].has(native.id)).toBe(false)
    await runtime.service.refreshDiscovery()
    expect(runtime.store.isManagedOpen(native.id)).toBe(true)
    const acknowledgement = [...runtime.service['pendingAcknowledgements'].values()]
    context.releaseAcknowledgement.finish()
    await Promise.all(acknowledgement)
    await Promise.all([...runtime.service['terminalQueueWakeups'].values()])
    expect(claims).not.toHaveBeenCalled()
    expect((await native.receipt()).pastes).toEqual([])
    expect((await native.persisted()).queuedPrompts.map((prompt: { content: string }) => prompt.content))
      .toEqual([queued])
  }, 15_000)
})
