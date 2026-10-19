/**
 * Synthetic before/after benchmark for normal (terminal-backed) session
 * latency. Real application services, HTTP routes and the browser WebSocket
 * contract; a fake terminal/provider with fixed timings. Only generated
 * fixture text is used, and all state lives in a temporary directory.
 *
 *   node --import tsx scripts/session-latency-benchmark.ts \
 *     --section all --samples 60 --output /tmp/after.json
 *
 * Works against builds with and without session patches: the event socket
 * asks for patches, and an older hub simply keeps sending full sessions.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { monitorEventLoopDelay, performance } from 'node:perf_hooks'
import { parseArgs } from 'node:util'
import type { SessionEvent } from '@github/copilot-sdk'
import WebSocket from 'ws'
import type { ChatMessage, HubWireEvent, SessionDetail } from '../shared/contracts.js'
import { AgentService, messagesFromHistory, type CopilotClientLike } from '../server/agent-service.js'
import { buildApp } from '../server/app.js'
import { SessionStore } from '../server/session-store.js'
import { SessionPatchReceiver } from '../src/session-patches.js'

const { values } = parseArgs({ options: {
  output: { type: 'string' },
  samples: { type: 'string', default: '30' },
  section: { type: 'string', default: 'all' },
  port: { type: 'string', default: '4398' },
} })
const count = Number(values.samples)
assert(values.output && Number.isInteger(count) && count >= 3 && count <= 500)
assert(['all', 'storage', 'projection', 'normal'].includes(values.section!))
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const root = await mkdtemp(path.join(tmpdir(), 'agentic-session-benchmark-'))
const records: Array<Record<string, string | number | boolean>> = []
const now = () => performance.now()
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const timestamp = '2026-01-01T00:00:00.000Z'

function message(index: number, bytes = 512): ChatMessage {
  return {
    id: `synthetic-${index}`, role: index % 2 ? 'assistant' : 'user',
    content: 'x'.repeat(bytes), createdAt: timestamp,
  }
}

function session(id: string, messages: ChatMessage[]): SessionDetail {
  return {
    id, cwd: root, title: 'Synthetic performance fixture', status: 'idle',
    updatedAt: timestamp, isOpen: false, messages, provider: 'copilot',
  }
}

function record(scenario: string, stage: string, start: number, extra: Record<string, number | boolean> = {}) {
  records.push({ scenario, stage, durationMs: now() - start, ...extra })
}

/** A transcript with tool activity, so activity completion is exercised. */
function historyEvents(length: number, prefix: string, at = timestamp): SessionEvent[] {
  const events: SessionEvent[] = []
  for (let i = 0; events.length < length; i += 1) {
    const base = `${prefix}-${i}`
    events.push({ type: 'user.message', id: `${base}-u`, parentId: null, timestamp: at, data: { content: 'x'.repeat(256) } } as SessionEvent)
    events.push({ type: 'tool.execution_start', id: `${base}-ts`, parentId: null, timestamp: at, data: { toolCallId: `${base}-t`, toolName: 'bash', arguments: { command: 'true' } } } as SessionEvent)
    events.push({ type: 'tool.execution_complete', id: `${base}-tc`, parentId: null, timestamp: at, data: { toolCallId: `${base}-t`, success: true, result: { content: 'ok' } } } as SessionEvent)
    events.push({ type: 'assistant.message', id: `${base}-a`, parentId: null, timestamp: at, data: { messageId: `${base}-m`, content: 'x'.repeat(512) } } as SessionEvent)
    events.push({ type: 'assistant.turn_end', id: `${base}-e`, parentId: null, timestamp: at, data: { turnId: base } } as SessionEvent)
  }
  return events.slice(0, length)
}

async function storage() {
  for (const targetBytes of [10_000_000, 50_000_000]) {
    const directory = path.join(root, `store-${targetBytes}`)
    await mkdir(directory)
    const messages = Array.from({ length: Math.ceil(targetBytes / 30 / 640) }, (_, i) => message(i))
    const sessions = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`s${i}`, session(`s${i}`, messages)]))
    const statePath = path.join(directory, 'state.json')
    await writeFile(statePath, JSON.stringify({ version: 1, sessions }))
    const bytes = (await stat(statePath)).size
    const store = new SessionStore(directory)
    const scenario = `storage-${targetBytes}`
    await store.initialize()
    for (let i = 0; i < count + 3; i += 1) {
      const beforeCpu = process.cpuUsage()
      const start = now()
      await store.update('s0', (draft) => { draft.activity = `synthetic-${i}` })
      if (i >= 3) {
        const cpu = process.cpuUsage(beforeCpu)
        record(scenario, 'durable-mutation', start, { bytes, cpuMs: (cpu.user + cpu.system) / 1000, rssBytes: process.memoryUsage().rss })
      }
    }
    for (let i = 0; i < count; i += 1) {
      const start = now()
      await Promise.all(Array.from({ length: 8 }, async (_, index) => {
        await store.update(`s${index}`, (draft) => { draft.title = `synthetic-${i}` })
      }))
      record(scenario, 'concurrent-eight-mutations', start, { bytes })
      for (let index = 0; index < 8; index += 1) assert.equal(store.get(`s${index}`)?.title, `synthetic-${i}`)
    }
    for (let i = 0; i < count; i += 1) {
      const next = [...messages, message(messages.length + i)]
      const beforeCpu = process.cpuUsage()
      const start = now()
      await store.replaceTranscript('s1', next, 'idle')
      const cpu = process.cpuUsage(beforeCpu)
      record(scenario, 'transcript-install', start, { bytes, cpuMs: (cpu.user + cpu.system) / 1000 })
    }
    await store.close()
    const restored = new SessionStore(directory)
    await restored.initialize()
    assert.equal(restored.get('s7')?.title, `synthetic-${count - 1}`)
    assert.equal(restored.get('s1')?.messages.length, messages.length + 1)
    await restored.close()
  }
}

function projection() {
  for (const length of [2500, 10000]) {
    const plain: SessionEvent[] = Array.from({ length }, (_, i) => ({
      type: 'assistant.message', id: `event-${i}`, parentId: null, timestamp,
      data: { messageId: `message-${i}`, content: 'x'.repeat(512) },
    }) as SessionEvent)
    const tools = historyEvents(length, 'projection')
    for (const [kind, events] of [['plain', plain], ['tools', tools]] as const) {
      for (let i = 0; i < count; i += 1) {
        const start = now()
        messagesFromHistory(events)
        record(`projection-${kind}-${length}`, 'history-reduction', start, { events: length })
      }
    }
  }
}

interface Pending {
  start: number
  providerStart: number
  firstProvider: number
  completeProvider: number
  userAt: number
  finalAt: number
  userId: string
  replyId: string
  wireBytes: number
  wireEvents: number
  fullEvents: number
}

async function normal() {
  const directory = path.join(root, 'normal')
  await mkdir(directory)
  const history = Array.from({ length: 520 }, (_, index) => message(index))
  const ids = Array.from({ length: 8 }, (_, index) => `synthetic-terminal-${index}`)
  const largeId = 'synthetic-terminal-large'
  const terminalIds = [...ids, largeId]
  const sessions = Object.fromEntries([
    ...Array.from({ length: 30 }, (_, index) => [`closed-${index}`, session(`closed-${index}`, history)]),
    ...terminalIds.map((id) => [id, { ...session(id, []), isOpen: true, backend: 'terminal' }]),
  ])
  await writeFile(path.join(directory, 'state.json'), JSON.stringify({ version: 1, sessions }))
  const events = new Map(terminalIds.map((id) => [id, [] as SessionEvent[]]))
  events.set(largeId, historyEvents(2500, 'large-history'))
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let chunks = 4
  let turn = 0
  const pending = new Map<string, Pending>()
  const client: CopilotClientLike = {
    start: async () => undefined, stop: async () => [], listSessions: async () => [],
    createSession: async () => { throw new Error('No real SDK is permitted in this fixture') },
    resumeSession: async () => { throw new Error('No real SDK is permitted in this fixture') },
    deleteSession: async () => undefined,
    rpc: {
      models: { list: async () => ({ models: [{
        id: 'synthetic-model', name: 'Synthetic model',
        capabilities: {
          family: 'synthetic', limits: { max_prompt_tokens: 100000, max_context_window_tokens: 120000 },
          supports: { vision: false, reasoningEffort: false }, tokenizer: 'synthetic', type: 'chat',
        },
      }] }) },
      commands: { list: async () => ({ commands: [] }) },
    },
  }
  const service = new AgentService(
    new SessionStore(directory), client,
    async () => terminalIds.map((id) => ({ id, cwd: root, title: 'Synthetic performance fixture', updatedAt: timestamp })),
    async () => undefined,
    async (id) => [...events.get(id)!],
    async (id) => String(events.get(id)!.length),
    {
      has: async (id) => events.has(id),
      cancel: async () => true,
      send: async (id) => {
        const current = pending.get(id)!
        turn += 1
        current.userId = `synthetic-user-${turn}`
        current.replyId = `synthetic-response-${turn}`
        current.providerStart = now()
        const append = (event: SessionEvent) => events.get(id)!.push(event)
        const after = (ms: number, action: () => void) => {
          const timer = setTimeout(() => { timers.delete(timer); action() }, ms)
          timers.add(timer)
        }
        after(20, () => {
          append({ type: 'user.message', id: current.userId, parentId: null, timestamp: new Date().toISOString(), data: { content: 'Synthetic performance fixture' } } as SessionEvent)
          append({ type: 'assistant.turn_start', id: `${current.replyId}-start`, parentId: null, timestamp: new Date().toISOString(), data: { turnId: current.replyId } } as SessionEvent)
        })
        for (let index = 0; index < chunks; index += 1) {
          after(200 + index * 50, () => {
            if (index === 0) current.firstProvider = now()
            if (index === chunks - 1) {
              current.completeProvider = now()
              append({ type: 'assistant.message', id: `${current.replyId}-complete`, parentId: null, timestamp: new Date().toISOString(), data: { messageId: current.replyId, content: 'x'.repeat(chunks * 512) } } as SessionEvent)
              append({ type: 'assistant.turn_end', id: `${current.replyId}-idle`, parentId: null, timestamp: new Date().toISOString(), data: { turnId: current.replyId } } as SessionEvent)
            }
          })
        }
        return true
      },
    },
    async () => undefined, async () => undefined,
  )
  const port = Number(values.port)
  const previousHome = process.env.COPILOT_HOME
  const previousOrigins = process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
  process.env.COPILOT_HOME = path.join(root, 'empty-copilot-home')
  process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = `http://127.0.0.1:${port}`
  let app: Awaited<ReturnType<typeof buildApp>>['app'] | undefined
  let socket: WebSocket | undefined
  const loop = monitorEventLoopDelay({ resolution: 10 })
  try {
    const runtime = await buildApp({ service, dataDirectory: directory, logger: false, managerAgent: false, cliCanary: false })
    app = runtime.app
    const { identity } = runtime
    await service.start()
    const address = await app.listen({ host: '127.0.0.1', port })
    // Asks for patches; a hub without them ignores the parameter.
    const connected = new WebSocket(`${address.replace('http:', 'ws:')}/api/events?patches=1`, { headers: { origin: address } })
    socket = connected
    await new Promise<void>((resolve, reject) => { connected.once('open', resolve); connected.once('error', reject) })
    const known = new Map<string, SessionDetail>()
    // The browser's own receiver: a patch that does not apply is never
    // guessed at, and is counted, because an in-order stream needs none.
    let resyncs = 0
    const receiver = new SessionPatchReceiver((request) => {
      resyncs += 1
      connected.send(JSON.stringify(request))
    })
    connected.on('message', (data) => {
      const payload = data.toString()
      const wire = JSON.parse(payload) as HubWireEvent
      const event = receiver.receive(wire)
      if (event?.type !== 'session.upserted') return
      const detail = event.session as SessionDetail
      known.set(detail.id, detail)
      const current = pending.get(detail.id)
      if (!current) return
      current.wireBytes += Buffer.byteLength(payload)
      current.wireEvents += 1
      if (wire.type === 'session.upserted') current.fullEvents += 1
      if (!current.userAt && detail.messages.some((entry) => entry.id === current.userId)) current.userAt = now()
      if (!current.finalAt && detail.messages.some((entry) => entry.id === current.replyId)) current.finalAt = now()
    })
    // Let the large history be taken in before measuring.
    const warmDeadline = now() + 15_000
    while (!(known.get(largeId)?.messages.length) && now() < warmDeadline) await sleep(20)
    loop.enable()
    for (const size of ['short', 'long', 'concurrent-eight', 'large-history'] as const) {
      chunks = size === 'long' ? 20 : 4
      for (let i = 0; i < count + 1; i += 1) {
        await sleep((i * 137) % 751)
        const cpu = process.cpuUsage()
        const start = now()
        const selected = size === 'concurrent-eight' ? ids : size === 'large-history' ? [largeId] : ids.slice(0, 1)
        const results = await Promise.all(selected.map(async (id) => {
          const current: Pending = {
            start: now(), providerStart: 0, firstProvider: 0, completeProvider: 0,
            userAt: 0, finalAt: 0, userId: '', replyId: '', wireBytes: 0, wireEvents: 0, fullEvents: 0,
          }
          pending.set(id, current)
          const response = await fetch(`${address}/api/computers/${identity.info.id}/sessions/${id}/messages`, {
            method: 'POST', headers: { 'content-type': 'application/json', origin: address },
            body: JSON.stringify({ content: 'Synthetic performance fixture' }),
          })
          assert.equal(response.status, 202, await response.clone().text())
          await response.arrayBuffer()
          const ack = now()
          const deadline = now() + 8000
          while (!current.finalAt && now() < deadline) await sleep(2)
          assert(current.userAt && current.finalAt && current.completeProvider, `turn did not complete for ${id}`)
          if (i > 0) {
            records.push({
              scenario: `normal-${size}`, stage: 'turn',
              ackMs: ack - current.start, visibleUserEventMs: current.userAt - current.start,
              firstVisibleResponseMs: current.finalAt - current.start,
              providerCompleteToVisibleMs: current.finalAt - current.completeProvider,
              userLoggedToVisibleMs: current.userAt - current.providerStart - 20,
              wireBytes: current.wireBytes, wireEvents: current.wireEvents, fullEvents: current.fullEvents,
            })
          }
          return current
        }))
        if (i > 0) {
          const used = process.cpuUsage(cpu)
          record(`normal-${size}`, 'round', start, { turns: results.length, cpuMs: (used.user + used.system) / 1000, rssBytes: process.memoryUsage().rss })
        }
      }
    }
    loop.disable()
    records.push({ scenario: 'normal', stage: 'event-loop', p50Ms: loop.percentile(50) / 1e6, p99Ms: loop.percentile(99) / 1e6, maxMs: loop.max / 1e6 })
    for (const id of terminalIds) {
      const projected = service.store.get(id)!.messages
      const logged = events.get(id)!.filter((event) => event.type === 'user.message').length
      assert.equal(projected.filter((entry) => entry.role === 'user').length, logged, `user messages lost or duplicated for ${id}`)
      assert.equal(new Set(projected.map((entry) => entry.id)).size, projected.length, `duplicate ids for ${id}`)
      const seen = known.get(id)!
      // As JSON carries it: keys holding `undefined` are not sent.
      const wire = JSON.parse(JSON.stringify(projected)) as ChatMessage[]
      const diverged = wire.findIndex((entry, index) => JSON.stringify(entry) !== JSON.stringify(seen.messages[index]))
      assert(diverged < 0 && seen.messages.length === wire.length, `client view diverged for ${id} at ${diverged}`)
    }
    assert.equal(resyncs, 0, 'an in-order stream needed a resync')
    records.push({ scenario: 'normal', stage: 'correctness', turns: turn, resyncs, stateBytes: (await stat(path.join(directory, 'state.json'))).size })
  } finally {
    for (const timer of timers) clearTimeout(timer)
    socket?.terminate()
    try {
      await Promise.all([service.stop(), app?.close()])
    } finally {
      if (previousHome === undefined) delete process.env.COPILOT_HOME
      else process.env.COPILOT_HOME = previousHome
      if (previousOrigins === undefined) delete process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
      else process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = previousOrigins
    }
  }
}

function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))]
}

function summarize() {
  const groups = new Map<string, number[]>()
  for (const entry of records) {
    for (const [key, value] of Object.entries(entry)) {
      if (typeof value !== 'number' || key === 'turns' || key === 'events') continue
      const name = `${entry.scenario} ${entry.stage} ${key}`
      groups.set(name, [...(groups.get(name) ?? []), value])
    }
  }
  return Object.fromEntries([...groups].map(([name, list]) => {
    const sorted = [...list].sort((a, b) => a - b)
    return [name, { n: sorted.length, p50: percentile(sorted, 50), p95: percentile(sorted, 95), p99: percentile(sorted, 99) }]
  }))
}

try {
  if (values.section === 'all' || values.section === 'projection') projection()
  if (values.section === 'all' || values.section === 'storage') await storage()
  if (values.section === 'all' || values.section === 'normal') await normal()
  const summary = summarize()
  await writeFile(values.output!, JSON.stringify({
    sourceCommit, node: process.version, samples: count, section: values.section, summary, records,
  }, null, 1))
  for (const [name, value] of Object.entries(summary)) {
    console.log(`${name.padEnd(70)} n=${String(value.n).padStart(4)}  ${value.p50.toFixed(1)} / ${value.p95.toFixed(1)} / ${value.p99.toFixed(1)}`)
  }
} finally {
  await rm(root, { recursive: true, force: true })
}
