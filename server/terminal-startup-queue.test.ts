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

async function fixture() {
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
  }, (receipt) => receipt?.pid === pid)
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
    const native = await fixture()
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
  }, 15_000)

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
    const delivered = await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 3_000)
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
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 3_000)).submits)
      .toEqual(['Retry after observation'])
  }, 15_000)

  it('keeps pending startup work after an inconclusive boot owner probe', async () => {
    const native = await fixture()
    await native.seed(['Native owner survived'])
    const runtime = native.connect()
    vi.spyOn(runtime.terminal, 'has').mockRejectedValueOnce(new Error('Transient owner probe failure'))
    await runtime.service.start()
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 3_000)).submits)
      .toEqual(['Native owner survived'])
    expect(runtime.store.isManagedOpen(native.id)).toBe(true)
    expect(runtime.creates).not.toHaveBeenCalled()
  }, 15_000)

  it.each(['incomplete', 'rejected'])('waits for %s initial discovery and recovers on the existing schedule', async (failure) => {
    const native = await fixture()
    await native.seed(['Await complete discovery'])
    const runtime = native.connect()
    if (failure === 'incomplete') runtime.finder.mockResolvedValueOnce([])
    else runtime.finder.mockRejectedValueOnce(new Error('Transient initial discovery failure'))
    await runtime.service.start()
    expect((await native.receipt()).submits).toEqual([])
    expect(runtime.service['pendingTerminalQueueClaims'].has(native.id)).toBe(true)
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 13_000)).submits)
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
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 3_000)).submits)
      .toEqual(['Retry durable claim'])
    expect((await native.persisted()).queuedPrompts).toEqual([])
  }, 15_000)

  it('recovers initial discovery persistence failure on the existing bounded schedules', async () => {
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
    await runtime.service.start()
    expect(refused).toBe(true)
    expect((await native.receipt()).pastes).toEqual([])
    expect((await native.persisted()).queuedPrompts).toEqual(before.queuedPrompts)
    expect(runtime.service['nativeStartupDiscoveryReady']).toBe(false)
    expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 13_000)).submits)
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
      expect((await eventually(native.receipt, (receipt) => receipt.submits.length === 1, 3_000)).pastes)
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
