/**
 * Queue admission benchmark: N separate Queue requests versus one batch.
 *
 * Runs the hub's real routes, session store, and queue drain in-process with
 * a fake Copilot SDK runtime or a fake tmux pane, so no tmux, model, network,
 * or host Copilot state is involved, and nothing outside a temporary
 * directory is touched. Round-trip time is modelled by waiting before each
 * request is answered; `--tmux-ms` charges each pane probe (`has`, `capture`)
 * what one costs on a real host. Every run checks each prompt was delivered
 * exactly once and in order, and fails otherwise.
 *
 *   npx tsx scripts/queue-batch-benchmark.ts [--backend=sdk,terminal]
 *     [--sizes=1,5,10,50] [--seed-mb=0,9.5] [--rtt=0,80] [--tmux-ms=0,20]
 *     [--repeats=5] [--json]
 */
import { randomUUID } from 'node:crypto'
import { watch } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import type { SessionEvent } from '@github/copilot-sdk'
import type { HubEvent } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from '../server/agent-service.js'
import { buildApp } from '../server/app.js'
import { ClaudeAgentService } from '../server/claude-agent-service.js'
import { ProviderSessionService } from '../server/provider-session-service.js'
import { SessionStore } from '../server/session-store.js'

function option(name: string, fallback: string): string {
  const prefix = `--${name}=`
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length) ?? fallback
}
const sizes = option('sizes', '1,5,10,50').split(',').map(Number)
const seeds = option('seed-mb', '0,9.5').split(',').map(Number)
const rtts = option('rtt', '0,80').split(',').map(Number)
const repeats = Number(option('repeats', '5'))
const backends = option('backend', 'sdk,terminal').split(',') as Array<'sdk' | 'terminal'>
const tmuxCosts = option('tmux-ms', '0,20').split(',').map(Number)
const asJson = process.argv.includes('--json')

/** A Copilot SDK session whose turns end when the benchmark says so. */
class BenchSession implements CopilotSessionLike {
  readonly sessionId = randomUUID()
  readonly sent: Array<{ prompt: string; at: number }> = []
  autoComplete = false
  private readonly handlers = new Set<(event: SessionEvent) => void>()
  private readonly open: Array<() => void> = []
  readonly rpc = {
    commands: {
      list: async () => ({ commands: [] }),
      invoke: async () => ({ kind: 'text' as const, text: '' }),
      enqueue: async () => ({ queued: true as const, queueId: 'q' }),
    },
    name: { set: async () => undefined },
    model: {
      getCurrent: async () => ({ modelId: 'gpt-5-mini' }),
      switchTo: async ({ modelId }: { modelId: string }) => ({ modelId }),
    },
    mode: { set: async () => ({ status: 'applied', modelChanged: false }) },
  } as unknown as CopilotSessionLike['rpc']

  on(handler: (event: SessionEvent) => void) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  async send({ prompt }: { prompt: string; mode: 'immediate' }): Promise<string> {
    this.sent.push({ prompt, at: performance.now() })
    const finish = () => {
      for (const handler of [...this.handlers]) {
        handler({
          id: randomUUID(), type: 'session.idle', timestamp: new Date().toISOString(),
          parentId: null, data: {},
        } as SessionEvent)
      }
    }
    if (this.autoComplete) setImmediate(finish)
    else this.open.push(finish)
    return randomUUID()
  }

  /** A direct turn, which the SDK answers when it ends. */
  sendAndWait(prompt: string): Promise<undefined> {
    this.sent.push({ prompt, at: performance.now() })
    return new Promise((resolve) => {
      if (this.autoComplete) setImmediate(() => resolve(undefined))
      else this.open.push(() => resolve(undefined))
    })
  }

  /** Ends every turn waiting, and every later one at once. */
  completeAll(): void {
    this.autoComplete = true
    for (const finish of this.open.splice(0)) setImmediate(finish)
  }

  async getEvents() {
    return []
  }
  async abort() {}
  async disconnect() {}
}

function benchClient(session: BenchSession): CopilotClientLike {
  return {
    start: async () => {},
    stop: async () => [],
    createSession: async () => session,
    resumeSession: async () => session,
    deleteSession: async () => {},
    listSessions: async () => [],
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: {
        list: async () => ({
          models: [{
            id: 'gpt-5-mini', name: 'GPT-5 mini', supportedReasoningEfforts: ['low'],
            capabilities: { limits: { max_prompt_tokens: 128_000 } },
          }],
        }),
      },
    },
  } as unknown as CopilotClientLike
}

/** Closed sessions sized like a long-lived hub's state file. */
async function seed(directory: string, megabytes: number): Promise<void> {
  if (megabytes <= 0) return
  const message = 'x'.repeat(560)
  const perSession = 30
  const count = Math.ceil((megabytes * 1024 * 1024) / perSession / (message.length + 120))
  const when = new Date(Date.now() - 86_400_000).toISOString()
  const sessions: Record<string, unknown> = {}
  for (let index = 0; index < perSession; index += 1) {
    const id = randomUUID()
    sessions[id] = {
      cwd: directory, id, isOpen: false, provider: 'copilot', queuedCount: 0, queuedPrompts: [],
      revision: 0, status: 'idle', title: `Synthetic history ${index}`, updatedAt: when,
      messages: Array.from({ length: count }, (_, message_) => ({
        id: randomUUID(), role: message_ % 2 ? 'assistant' : 'user', content: message, createdAt: when,
      })),
    }
  }
  await writeFile(
    path.join(directory, 'state.json'),
    JSON.stringify({ version: 1, sessions, retiredSessionIds: [] }),
    { mode: 0o600 },
  )
}

interface RunResult {
  backend: 'sdk' | 'terminal'
  tmuxMs: number
  /** Pane probes made while admitting. */
  paneReads: number
  mode: 'individual' | 'batch'
  path: 'busy' | 'idle'
  size: number
  seedMb: number
  rttMs: number
  admitMs: number
  requests: number
  stateWrites: number
  broadcasts: number
  broadcastBytes: number
  drainMs: number
  totalMs: number
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function run(
  mode: RunResult['mode'],
  path_: RunResult['path'],
  size: number,
  seedMb: number,
  rttMs: number,
): Promise<RunResult | undefined> {
  const root = await mkdtemp(path.join(process.env.HOME!, 'run-'))
  const stateDirectory = path.join(root, 'state')
  await mkdir(stateDirectory, { recursive: true, mode: 0o700 })
  await seed(stateDirectory, seedMb)
  const session = new BenchSession()
  const agent = new AgentService(
    new SessionStore(stateDirectory),
    benchClient(session),
    async () => [],
    async () => undefined,
    async () => [],
    async () => undefined,
    {
      has: async () => false,
      send: async () => false,
      capture: async () => '',
      cancel: async () => false,
    } as never,
  )
  const service = new ProviderSessionService(agent, new ClaudeAgentService(new SessionStore(path.join(root, 'claude'))))
  const runtime = await buildApp({
    logger: false, role: 'hub', service, dataDirectory: path.join(root, 'hub'),
    cliCanary: false, managerAgent: false,
    transcriptionService: { initialize: async () => undefined, stop: async () => undefined, transcribe: async () => ({ text: '' }) } as never,
  })
  try {
    await runtime.service.start()
    const created = await agent.createSession(root)
    const base = `/api/computers/${runtime.identity.info.id}/sessions/${created.id}`
    const headers = { host: 'localhost' }
    if (mode === 'batch') {
      const probe = await runtime.app.inject({ method: 'POST', url: `${base}/queue/batch`, headers, payload: {} })
      if (probe.statusCode === 404) return undefined
    }
    if (path_ === 'busy') {
      // A turn is running, so everything queues behind it.
      await runtime.app.inject({ method: 'POST', url: `${base}/messages`, headers, payload: { content: 'Running turn' } })
    }
    let stateWrites = 0
    const watcher = watch(stateDirectory, (_event, file) => {
      if (file === 'state.json') stateWrites += 1
    })
    let broadcasts = 0
    let broadcastBytes = 0
    const count = (event: HubEvent) => {
      if (event.type !== 'session.upserted') return
      broadcasts += 1
      broadcastBytes += JSON.stringify(event).length
    }
    runtime.manager!.on('event', count)
    const prompts = Array.from({ length: size }, (_, index) => `Queued prompt ${index + 1}: ${'detail '.repeat(40).trim()}`)
    const sentBefore = session.sent.length
    if (path_ === 'idle') session.completeAll()
    const started = performance.now()
    let requests = 0
    if (mode === 'individual') {
      for (const content of prompts) {
        await delay(rttMs)
        const response = await runtime.app.inject({
          method: 'POST', url: `${base}/messages`, headers, payload: { content, enqueue: true },
        })
        requests += 1
        if (response.statusCode >= 300) throw new Error(`Queue failed: ${response.body}`)
      }
    } else {
      await delay(rttMs)
      const response = await runtime.app.inject({
        method: 'POST', url: `${base}/queue/batch`, headers,
        payload: { batchId: randomUUID(), prompts },
      })
      requests += 1
      if (response.statusCode >= 300) throw new Error(`Batch failed: ${response.body}`)
    }
    const admitted = performance.now()
    await delay(20)
    watcher.close()
    runtime.manager!.off('event', count)
    // The running turn ends; each queued prompt then runs as its own turn.
    session.completeAll()
    const deadline = Date.now() + 60_000
    while (session.sent.length - sentBefore < size) {
      if (Date.now() > deadline) throw new Error(`Only ${session.sent.length - sentBefore} of ${size} prompts ran`)
      await delay(1)
    }
    const drained = session.sent.at(-1)!.at
    const order = session.sent.slice(sentBefore).map((entry) => entry.prompt)
    if (order.join('\n') !== prompts.join('\n')) throw new Error(`Prompts ran out of order (${path_} ${mode} ${size}): ${JSON.stringify(order.map((entry) => entry.slice(0, 18)))}`)
    await delay(50)
    const delivered = session.sent.slice(sentBefore).map((entry) => entry.prompt)
    if (delivered.length !== size) throw new Error(`Delivered ${delivered.length} of ${size}: a prompt was lost or duplicated`)
    return {
      backend: 'sdk', tmuxMs: 0, paneReads: 0,
      mode, path: path_, size, seedMb, rttMs,
      admitMs: admitted - started,
      requests,
      stateWrites,
      broadcasts,
      broadcastBytes,
      drainMs: Math.max(0, drained - admitted),
      totalMs: drained - started,
    }
  } finally {
    await runtime.app.close()
    await rm(root, { recursive: true, force: true })
  }
}

const idlePane = ['Copilot', '╻▄▄▄▄▄▄▄▄▄▄', '┃ ', '╹▀▀▀▀▀▀▀▀▀▀', ' / commands'].join('\n')
const workingPane = ['Copilot', '◐ Working (Esc to cancel)', '╻▄▄▄▄▄▄▄▄▄▄', '┃ ', '╹▀▀▀▀▀▀▀▀▀▀'].join('\n')

/**
 * The same comparison on a tmux-backed session: the app's own admission and
 * drain against a pane that runs one prompt at a time. Turns end when the
 * benchmark appends their completion to the session's event log.
 */
async function runTerminal(
  mode: RunResult['mode'],
  path_: RunResult['path'],
  size: number,
  seedMb: number,
  rttMs: number,
  tmuxMs: number,
): Promise<RunResult | undefined> {
  const root = await mkdtemp(path.join(process.env.HOME!, 'run-'))
  const stateDirectory = path.join(root, 'state')
  await mkdir(stateDirectory, { recursive: true, mode: 0o700 })
  await seed(stateDirectory, seedMb)
  const id = randomUUID()
  const store = new SessionStore(stateDirectory)
  await store.initialize()
  await store.create({
    id, cwd: root, title: 'tmux', updatedAt: new Date().toISOString(), status: 'idle', isOpen: true, messages: [],
    runtime: { allowAllPermissions: true, model: 'gpt-5-mini' },
  }, { backend: 'terminal', managedOpen: true })
  const events: SessionEvent[] = []
  let version = 0
  let clock = Date.now()
  /** Handed to Copilot and not finished yet, oldest first. */
  const running: string[] = []
  const delivered: string[] = []
  let paneReads = 0
  const probe = async () => {
    paneReads += 1
    if (tmuxMs) await delay(tmuxMs)
  }
  const terminal = {
    has: async () => { await probe(); return true },
    capture: async () => { await probe(); return running.length ? workingPane : idlePane },
    inputReady: async () => true,
    send: async (_session: string, content: string) => {
      if (tmuxMs) await delay(tmuxMs)
      delivered.push(content)
      running.push(content)
      return true
    },
    cancel: async () => true,
  }
  const agent = new AgentService(
    store, benchClient(new BenchSession()),
    async () => [{ id, cwd: root, title: 'tmux', updatedAt: new Date().toISOString() }],
    async () => undefined,
    async () => events,
    async () => `events-${version}`,
    terminal as never, async () => undefined, async () => undefined,
  )
  const service = new ProviderSessionService(agent, new ClaudeAgentService(new SessionStore(path.join(root, 'claude'))))
  const runtime = await buildApp({
    logger: false, role: 'hub', service, dataDirectory: path.join(root, 'hub'), cliCanary: false, managerAgent: false,
    transcriptionService: { initialize: async () => undefined, stop: async () => undefined, transcribe: async () => ({ text: '' }) } as never,
  })
  const finishTurn = async () => {
    const content = running.shift()
    const user = randomUUID()
    clock += 1_000
    events.push(...[
      ...(content ? [{ type: 'user.message', id: user, parentId: null, timestamp: new Date(clock).toISOString(), data: { content } }] : []),
      { type: 'session.idle', id: randomUUID(), parentId: content ? user : null, timestamp: new Date(clock + 1).toISOString(), data: {} },
    ] as unknown as SessionEvent[])
    version += 1
    await agent.refreshTranscripts()
  }
  try {
    await runtime.service.start()
    await agent.refreshDiscovery()
    const base = `/api/computers/${runtime.identity.info.id}/sessions/${id}`
    const headers = { host: 'localhost' }
    if (mode === 'batch') {
      const probe_ = await runtime.app.inject({ method: 'POST', url: `${base}/queue/batch`, headers, payload: {} })
      if (probe_.statusCode === 404) return undefined
    }
    if (path_ === 'busy') {
      // A turn typed in the pane is running, so everything queues behind it.
      running.push('Running turn')
      clock = Date.now()
      events.push(...[
        { type: 'user.message', id: 'running', parentId: null, timestamp: new Date(clock).toISOString(), data: { content: 'Running turn' } },
        { type: 'assistant.turn_start', id: randomUUID(), parentId: 'running', timestamp: new Date(clock + 1).toISOString(), data: { turnId: '1' } },
      ] as unknown as SessionEvent[])
      version += 1
      await agent.refreshTranscripts()
    }
    let stateWrites = 0
    const watcher = watch(stateDirectory, (_event, file) => {
      if (file === 'state.json') stateWrites += 1
    })
    let broadcasts = 0
    let broadcastBytes = 0
    const count = (event: HubEvent) => {
      if (event.type !== 'session.upserted') return
      broadcasts += 1
      broadcastBytes += JSON.stringify(event).length
    }
    runtime.manager!.on('event', count)
    const prompts = Array.from({ length: size }, (_, index) => `Queued prompt ${index + 1}: ${'detail '.repeat(40).trim()}`)
    paneReads = 0
    clock = Math.max(clock, Date.now())
    const started = performance.now()
    let requests = 0
    if (mode === 'individual') {
      for (const content of prompts) {
        await delay(rttMs)
        const response = await runtime.app.inject({
          method: 'POST', url: `${base}/messages`, headers, payload: { content, enqueue: true },
        })
        requests += 1
        if (response.statusCode >= 300) throw new Error(`Queue failed: ${response.body}`)
      }
    } else {
      await delay(rttMs)
      const response = await runtime.app.inject({
        method: 'POST', url: `${base}/queue/batch`, headers, payload: { batchId: randomUUID(), prompts },
      })
      requests += 1
      if (response.statusCode >= 300) throw new Error(`Batch failed: ${response.body}`)
    }
    const admitted = performance.now()
    const admissionReads = paneReads
    await delay(20)
    watcher.close()
    runtime.manager!.off('event', count)
    // Each turn ends in order; the app (or Copilot's own queue) starts the next.
    const deadline = Date.now() + 120_000
    while (prompts.some((prompt) => !delivered.includes(prompt)) || running.length) {
      if (Date.now() > deadline) throw new Error(`Only ${delivered.length} prompts reached the pane`)
      await finishTurn()
    }
    const drained = performance.now()
    await finishTurn()
    const order = delivered.filter((content) => content !== 'Running turn')
    if (order.join('\n') !== prompts.join('\n')) {
      throw new Error(`terminal ${mode} ${size}: delivered ${order.length} of ${size}, or out of order`)
    }
    return {
      backend: 'terminal', tmuxMs, paneReads: admissionReads,
      mode, path: path_, size, seedMb, rttMs,
      admitMs: admitted - started,
      requests, stateWrites, broadcasts, broadcastBytes,
      drainMs: drained - admitted,
      totalMs: drained - started,
    }
  } finally {
    await runtime.app.close()
    await rm(root, { recursive: true, force: true })
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)]
}

process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = ''
process.env.AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER = ''
// Sessions must start under HOME, so the whole run lives in a temporary one.
const benchHome = await mkdtemp(path.join(tmpdir(), 'queue-batch-bench-'))
process.env.HOME = benchHome
process.env.COPILOT_HOME = path.join(benchHome, '.copilot')

const rows: RunResult[] = []
for (const backend of backends) for (const tmuxMs of backend === 'terminal' ? tmuxCosts : [0]) {
for (const seedMb of seeds) {
  for (const rttMs of rtts) {
    for (const path_ of ['busy', 'idle'] as const) {
      for (const size of sizes) {
        for (const mode of ['individual', 'batch'] as const) {
          const runs: RunResult[] = []
          for (let attempt = 0; attempt < repeats; attempt += 1) {
            const result = backend === 'terminal'
              ? await runTerminal(mode, path_, size, seedMb, rttMs, tmuxMs)
              : await run(mode, path_, size, seedMb, rttMs)
            if (!result) break
            runs.push(result)
          }
          if (!runs.length) continue
          const pick = (key: keyof RunResult) => median(runs.map((result) => Number(result[key])))
          rows.push({
            ...runs[0],
            admitMs: pick('admitMs'),
            stateWrites: pick('stateWrites'),
            broadcasts: pick('broadcasts'),
            broadcastBytes: pick('broadcastBytes'),
            drainMs: pick('drainMs'),
            totalMs: pick('totalMs'),
            paneReads: pick('paneReads'),
          })
        }
      }
    }
  }
}
}
await rm(benchHome, { recursive: true, force: true })

if (asJson) {
  console.log(JSON.stringify(rows, null, 2))
} else {
  console.log(`median of ${repeats} runs; times in ms`)
  console.log('backend  tmux seedMB rtt  path  N   mode        admit   req panes writes bcasts  bcastKB  drain   total')
  for (const row of rows) {
    console.log([
      row.backend.padEnd(8), row.tmuxMs.toString().padStart(4), 
      row.seedMb.toString().padStart(6), row.rttMs.toString().padStart(4), row.path.padEnd(5),
      row.size.toString().padStart(3), row.mode.padEnd(10), row.admitMs.toFixed(1).padStart(7),
      row.requests.toString().padStart(5), row.paneReads.toString().padStart(5), row.stateWrites.toString().padStart(6),
      row.broadcasts.toString().padStart(6), (row.broadcastBytes / 1024).toFixed(1).padStart(8),
      row.drainMs.toFixed(1).padStart(7), row.totalMs.toFixed(1).padStart(7),
    ].join(' '))
  }
}
