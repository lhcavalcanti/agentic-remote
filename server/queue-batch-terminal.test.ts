import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PendingPermission, PendingUserInput } from '../shared/contracts.js'
import type { CopilotClientLike } from './agent-service.js'
import { AgentService } from './agent-service.js'
import { SessionStore } from './session-store.js'
import type { TerminalSessionController } from './terminal-session.js'

/**
 * A batch on tmux-backed Copilot sessions, in each state such a session can be
 * in. The client refuses to attach an SDK owner, so any path that would put a
 * second owner on a terminal session fails the test.
 */

const idleComposer = ['Copilot', '╻▄▄▄▄▄▄▄▄▄▄', '┃ ', '╹▀▀▀▀▀▀▀▀▀▀', ' / commands'].join('\n')
const directories: string[] = []
const services: AgentService[] = []

afterEach(async () => {
  await Promise.allSettled(services.splice(0).map((service) => service.stop()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

interface World {
  directory: string
  owners: Set<string>
  events: SessionEvent[]
  version: number
  clock: number
  sent: string[]
}

function world(): World {
  const directory = path.resolve(`.queue-batch-terminal-${randomUUID()}`)
  directories.push(directory)
  return { directory, owners: new Set(), events: [], version: 0, clock: Date.now(), sent: [] }
}

async function boot(w: World, options: { create?: boolean; discovery?: boolean } = {}) {
  vi.stubEnv('COPILOT_HOME', path.join(w.directory, 'copilot'))
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const store = new SessionStore(path.join(w.directory, 'state'))
  await store.initialize()
  if (options.create !== false) {
    await store.create({
      id: 'tmux', cwd: w.directory, title: 'tmux', updatedAt: new Date().toISOString(),
      status: 'idle', isOpen: true, messages: [],
      runtime: { allowAllPermissions: true, model: 'fixture-model' },
    }, { backend: 'terminal', managedOpen: true })
  }
  const attach = vi.fn<CopilotClientLike['resumeSession']>(async () => {
    throw new Error('A terminal session must never acquire an SDK owner')
  })
  const client: CopilotClientLike = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => []),
    listSessions: vi.fn(async () => []),
    deleteSession: vi.fn(async () => {}),
    resumeSession: attach,
    createSession: vi.fn(async () => { throw new Error('Unexpected SDK creation') }),
    rpc: { commands: { list: async () => ({ commands: [] }) }, models: { list: async () => ({ models: [] }) } },
  }
  let pane = idleComposer
  const asking: { permission?: PendingPermission; question?: PendingUserInput } = {}
  const terminal = {
    pendingPermission: vi.fn(async () => asking.permission),
    pendingUserInput: vi.fn(async () => asking.question),
    has: vi.fn<TerminalSessionController['has']>(async (id) => w.owners.has(id)),
    create: vi.fn<NonNullable<TerminalSessionController['create']>>(async (id) => {
      w.owners.add(id)
      return { sessionName: 'fixture', windowId: '@1' }
    }),
    reopen: vi.fn(async (id: string) => {
      w.owners.add(id)
      return { sessionName: 'fixture', windowId: '@2' }
    }),
    inputReady: vi.fn(async () => true),
    send: vi.fn(async (_id: string, content: string) => {
      w.sent.push(content)
      return true
    }),
    capture: vi.fn<NonNullable<TerminalSessionController['capture']>>(async (id) => (w.owners.has(id) ? pane : undefined)),
    cancel: vi.fn(async () => true),
    stop: vi.fn<NonNullable<TerminalSessionController['stop']>>(async (id, beforeStop) => {
      await beforeStop?.()
      w.owners.delete(id)
      return true
    }),
  }
  const discovery = { ready: options.discovery !== false }
  const service = new AgentService(
    store, client,
    async () => {
      if (!discovery.ready) throw new Error('Discovery has not run yet')
      return [...w.owners].map((id) => ({ id, cwd: w.directory, title: id, updatedAt: new Date().toISOString() }))
    },
    async (id) => { w.owners.delete(id) },
    async () => w.events,
    async () => `events-${w.version}`,
    terminal, async () => undefined, async () => undefined,
  )
  services.push(service)
  await service.start()
  return {
    store, service, terminal, attach, discovery, asking,
    setPane: (next: string) => { pane = next },
    external: () => (service as unknown as { externalSessionIds: Set<string> }).externalSessionIds.has('tmux'),
    queue: () => (store.get('tmux')?.queuedPrompts ?? []).map((prompt) => prompt.content),
  }
}

type Booted = Awaited<ReturnType<typeof boot>>

/** Copilot ran `content` to completion: its message, then idle, in the log. */
async function finishTurn(w: World, f: Booted, content: string) {
  const user = randomUUID()
  w.clock += 1_000
  w.events.push(...[
    { type: 'user.message', id: user, parentId: null, timestamp: new Date(w.clock).toISOString(), data: { content } },
    { type: 'session.idle', id: randomUUID(), parentId: user, timestamp: new Date(w.clock + 1).toISOString(), data: {} },
  ] as unknown as SessionEvent[])
  w.version += 1
  await f.service.refreshTranscripts()
}

/** The session goes idle after whatever was running before the batch. */
async function finishRunning(w: World, f: Booted) {
  w.clock += 1_000
  w.events.push({
    type: 'session.idle', id: randomUUID(), parentId: null, timestamp: new Date(w.clock).toISOString(), data: {},
  } as unknown as SessionEvent)
  w.version += 1
  await f.service.refreshTranscripts()
}

async function connected(w = world()) {
  w.owners.add('tmux')
  const f = await boot(w)
  await f.service.refreshDiscovery()
  expect(f.external()).toBe(true)
  return { w, f }
}

const prompts = (size: number) => Array.from({ length: size }, (_, index) => `terminal prompt ${index + 1}`)

describe('queueing a batch to a tmux-backed session', () => {
  it.each([1, 5, 10, 50])(
    'runs %i prompts behind a running turn, one per idle, exactly once and in order',
    async (size) => {
      const { w, f } = await connected()
      await f.store.updateStatus('tmux', 'running')
      w.clock = Date.now()
      const { batch } = await f.service.queueBatch('tmux', { batchId: `batch-${size}-items`, prompts: prompts(size) })
      expect(batch.promptIds).toHaveLength(size)
      // Kept in the app's FIFO, never typed into Copilot's own queue.
      expect(f.terminal.send).not.toHaveBeenCalled()
      expect(f.queue()).toEqual(prompts(size))

      await finishRunning(w, f)
      for (let turn = 0; turn < size; turn += 1) {
        expect(w.sent).toEqual(prompts(size).slice(0, turn + 1))
        await finishTurn(w, f, prompts(size)[turn])
      }
      expect(w.sent).toEqual(prompts(size))
      expect(f.queue()).toEqual([])
      expect(f.attach).not.toHaveBeenCalled()
    },
  )

  it('starts the first prompt at once when the terminal is idle', async () => {
    const { w, f } = await connected()
    await f.service.queueBatch('tmux', { batchId: 'batch-idle-01', prompts: ['first', 'second'] })
    await vi.waitFor(() => expect(w.sent).toEqual(['first']))
    expect(f.queue()).toEqual(['second'])
    await finishTurn(w, f, 'first')
    expect(w.sent).toEqual(['first', 'second'])
  })

  it.each([
    ['permission', {
      permission: { requestId: 'terminal-permission:1', title: 'Run tests', options: [{ optionId: '1', name: 'Yes', kind: 'allow_once' }] },
    }],
    ['question', {
      question: { requestId: 'terminal:1', question: 'Which branch?', choices: ['main'], allowFreeform: true },
    }],
  ] as const)('holds every item while a %s is pending, then carries on in order', async (_kind, prompt) => {
    const { w, f } = await connected()
    // A turn is under way and has stopped to ask.
    const user = randomUUID()
    w.clock = Date.now() - 5_000
    w.events.push(...[
      { type: 'user.message', id: user, parentId: null, timestamp: new Date(w.clock).toISOString(), data: { content: 'earlier work' } },
      { type: 'assistant.turn_start', id: randomUUID(), parentId: user, timestamp: new Date(w.clock + 1).toISOString(), data: { turnId: '1' } },
    ] as unknown as SessionEvent[])
    w.version += 1
    Object.assign(f.asking, prompt)
    // The pane is read for prompts at most every two seconds; this is the next read.
    ;(f.service as unknown as { terminalUserInputChecks: Map<string, number> }).terminalUserInputChecks.clear()
    await f.service.refreshTranscripts()
    const asked = f.store.get('tmux')
    expect(asked?.pendingPermission ?? asked?.pendingUserInput).toBeDefined()
    expect(asked?.status).not.toBe('idle')

    w.clock = Date.now()
    await f.service.queueBatch('tmux', { batchId: 'batch-gated-1', prompts: ['first', 'second'] })
    await f.service.refreshTranscripts()
    expect(w.sent).toEqual([])
    expect(f.queue()).toEqual(['first', 'second'])

    // Answered in the pane; the turn finishes.
    f.asking.permission = undefined
    f.asking.question = undefined
    await finishRunning(w, f)
    await vi.waitFor(() => expect(w.sent).toEqual(['first']))
    await finishTurn(w, f, 'first')
    expect(w.sent).toEqual(['first', 'second'])
  })

  it('refuses a closed session without reopening it or attaching another owner', async () => {
    const { f } = await connected()
    await f.store.setOpen('tmux', false, true)
    await expect(f.service.queueBatch('tmux', { batchId: 'batch-closed', prompts: ['first'] }))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false, message: expect.stringMatching(/Reopen.*Nothing was queued/) })
    expect(f.queue()).toEqual([])
    expect(f.terminal.reopen).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.attach).not.toHaveBeenCalled()
  })

  it('refuses a terminal that is not connected yet, without attaching an SDK owner', async () => {
    const w = world()
    w.owners.add('tmux')
    const f = await boot(w, { discovery: false })
    expect(f.external()).toBe(false)
    await expect(f.service.queueBatch('tmux', { batchId: 'batch-early-1', prompts: ['first', 'second'] }))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(f.queue()).toEqual([])
    expect(f.attach).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
  })

  it('keeps a batch when a restart loses the terminal, and runs it after reopening, exactly once', async () => {
    const { w, f } = await connected()
    await f.store.updateStatus('tmux', 'running')
    await f.service.queueBatch('tmux', { batchId: 'batch-restart', prompts: ['first', 'second', 'third'] })
    await f.service.stop()
    services.splice(services.indexOf(f.service), 1)

    // The host restarted and tmux went with it.
    w.owners.clear()
    const restarted = await boot(w, { create: false })
    await restarted.service.refreshDiscovery()
    expect(restarted.store.get('tmux')).toMatchObject({ isOpen: false })
    expect(restarted.queue()).toEqual(['first', 'second', 'third'])
    expect(restarted.terminal.create).not.toHaveBeenCalled()
    expect(restarted.terminal.send).not.toHaveBeenCalled()
    // The retry of the same batch is still recognised, and adds nothing.
    await expect(restarted.service.queueBatch('tmux', { batchId: 'batch-restart', prompts: ['first', 'second', 'third'] }))
      .resolves.toMatchObject({ batch: { duplicate: true } })

    w.clock = Date.now()
    await restarted.service.activateSession('tmux')
    expect(restarted.terminal.reopen).toHaveBeenCalledOnce()
    expect(w.sent).toEqual(['first'])
    await finishTurn(w, restarted, 'first')
    await finishTurn(w, restarted, 'second')
    await finishTurn(w, restarted, 'third')
    expect(w.sent).toEqual(['first', 'second', 'third'])
    expect(restarted.queue()).toEqual([])
    expect(restarted.attach).not.toHaveBeenCalled()
  })
})
