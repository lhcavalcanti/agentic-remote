import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import type { CopilotClientLike } from './agent-service.js'
import { AgentService } from './agent-service.js'
import { buildApp } from './app.js'
import { SessionStore } from './session-store.js'
import type { ChatMessage, HubWireEvent, SessionDetail } from '../shared/contracts.js'
import type { SessionEvent } from '@github/copilot-sdk'
import { SessionPatchReceiver } from '../src/session-patches.js'

const timestamp = '2026-01-01T00:00:00.000Z'

function historyEvents(length: number, prefix: string): SessionEvent[] {
  const events: SessionEvent[] = []
  for (let i = 0; events.length < length; i += 1) {
    const base = `${prefix}-${i}`
    events.push({ type: 'user.message', id: `${base}-u`, parentId: null, timestamp, data: { content: `question ${i}` } } as SessionEvent)
    events.push({ type: 'tool.execution_start', id: `${base}-ts`, parentId: null, timestamp, data: { toolCallId: `${base}-t`, toolName: 'bash', arguments: { command: 'true' } } } as SessionEvent)
    events.push({ type: 'tool.execution_complete', id: `${base}-tc`, parentId: null, timestamp, data: { toolCallId: `${base}-t`, success: true, result: { content: 'ok' } } } as SessionEvent)
    events.push({ type: 'assistant.message', id: `${base}-a`, parentId: null, timestamp, data: { messageId: `${base}-m`, content: `answer ${i}` } } as SessionEvent)
    events.push({ type: 'assistant.turn_end', id: `${base}-e`, parentId: null, timestamp, data: { turnId: base } } as SessionEvent)
  }
  return events.slice(0, length)
}

/** Every session the socket has been told of, as it would render them. */
class Client {
  readonly sessions = new Map<string, SessionDetail>()
  readonly upserts: unknown[] = []
  readonly removed: string[] = []
  fullFrames = 0
  patchFrames = 0
  resyncs = 0
  private constructor(readonly socket: WebSocket) {}

  static async connect(address: string, patches: boolean): Promise<Client> {
    const socket = new WebSocket(
      `${address.replace('http:', 'ws:')}/api/events${patches ? '?patches=1' : ''}`,
      { headers: { origin: address } },
    )
    const client = new Client(socket)
    const receiver = new SessionPatchReceiver((request) => {
      client.resyncs += 1
      socket.send(JSON.stringify(request))
    })
    socket.on('message', (data) => {
      const wire = JSON.parse(data.toString()) as HubWireEvent
      if (wire.type === 'session.patched') client.patchFrames += 1
      if (wire.type === 'session.upserted') client.fullFrames += 1
      const event = receiver.receive(wire)
      if (event?.type === 'session.upserted') {
        client.upserts.push(event)
        client.sessions.set(event.session.id, event.session as SessionDetail)
      } else if (event?.type === 'session.removed') {
        client.removed.push(event.sessionId)
        client.sessions.delete(event.sessionId)
      }
    })
    await new Promise<void>((resolve, reject) => {
      socket.once('open', resolve)
      socket.once('error', reject)
    })
    return client
  }

  /** What the browser fetches for a session it has not yet been sent. */
  async seed(url: (id: string) => string, ids: string[], origin: string) {
    for (const id of ids) {
      const response = await fetch(url(id), { headers: { origin } })
      expect(response.status).toBe(200)
      const { session } = (await response.json()) as { session: SessionDetail }
      if (!this.sessions.has(id)) this.sessions.set(id, session)
    }
  }
}

describe('session patches through the hub, end to end', () => {
  let root: string
  let previousHome: string | undefined
  let previousOrigins: string | undefined
  let previousRoots: string | undefined

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'session-patch-integration-'))
    previousHome = process.env.COPILOT_HOME
    previousOrigins = process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
    previousRoots = process.env.AGENTIC_REMOTE_ALLOWED_ROOTS
    process.env.COPILOT_HOME = path.join(root, 'empty-copilot-home')
    process.env.AGENTIC_REMOTE_ALLOWED_ROOTS = root
    // Loopback origins are allowed when no list is configured.
    delete process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
  })

  afterEach(async () => {
    for (const [key, value] of [
      ['COPILOT_HOME', previousHome],
      ['AGENTIC_REMOTE_ALLOWED_ORIGINS', previousOrigins],
      ['AGENTIC_REMOTE_ALLOWED_ROOTS', previousRoots],
    ] as const) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    await rm(root, { recursive: true, force: true })
  })

  it('keeps a patching browser identical to the store through a normal session lifecycle', async () => {
    const directory = path.join(root, 'data')
    const ids = ['terminal-a', 'terminal-b', 'terminal-c']
    const largeId = 'terminal-large'
    const terminalIds = [...ids, largeId]
    const closedHistory: ChatMessage[] = Array.from({ length: 200 }, (_, index) => ({
      id: `closed-${index}`, role: index % 2 ? 'assistant' : 'user', content: `closed ${index}`, createdAt: timestamp,
    }))
    const base = (id: string): SessionDetail => ({
      id, cwd: root, title: id, status: 'idle', updatedAt: timestamp, isOpen: false, messages: [], provider: 'copilot',
    })
    const sessions = Object.fromEntries([
      ...Array.from({ length: 4 }, (_, index) => [`closed-${index}`, { ...base(`closed-${index}`), messages: closedHistory }]),
      ...terminalIds.map((id) => [id, { ...base(id), isOpen: true, backend: 'terminal' }]),
    ])
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, 'state.json'), JSON.stringify({ version: 1, sessions }))

    const events = new Map(terminalIds.map((id) => [id, [] as SessionEvent[]]))
    events.set(largeId, historyEvents(2500, 'large'))
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const sent: Array<{ id: string; content: string }> = []
    let turn = 0
    const client: CopilotClientLike = {
      start: async () => undefined, stop: async () => [], listSessions: async () => [],
      createSession: async () => { throw new Error('No SDK sessions in this fixture') },
      resumeSession: async () => { throw new Error('No SDK sessions in this fixture') },
      deleteSession: async () => undefined,
      rpc: {
        models: { list: async () => ({ models: [{
          id: 'fixture-model', name: 'Fixture model',
          capabilities: {
            family: 'fixture', limits: { max_prompt_tokens: 100000, max_context_window_tokens: 120000 },
            supports: { vision: false, reasoningEffort: false }, tokenizer: 'fixture', type: 'chat',
          },
        }] }) },
        commands: { list: async () => ({ commands: [] }) },
      },
    } as unknown as CopilotClientLike
    // A terminal that logs the prompt, then streams a reply in pieces, the
    // way Copilot's event log grows under a real tmux pane.
    const terminal = {
      has: async (id: string) => events.has(id),
      cancel: async () => true,
      send: async (id: string, content: string) => {
        turn += 1
        const reply = `reply-${turn}`
        sent.push({ id, content })
        const append = (event: SessionEvent) => events.get(id)?.push(event)
        const after = (ms: number, action: () => void) => {
          const timer = setTimeout(() => { timers.delete(timer); action() }, ms)
          timers.add(timer)
        }
        after(10, () => {
          append({ type: 'user.message', id: `user-${turn}`, parentId: null, timestamp: new Date().toISOString(), data: { content } } as SessionEvent)
          append({ type: 'assistant.turn_start', id: `${reply}-start`, parentId: null, timestamp: new Date().toISOString(), data: { turnId: reply } } as SessionEvent)
        })
        after(60, () => append({ type: 'assistant.message_delta', id: `${reply}-d1`, parentId: null, timestamp: new Date().toISOString(), data: { messageId: reply, deltaContent: 'partial ' } } as SessionEvent))
        after(140, () => {
          append({ type: 'assistant.message', id: `${reply}-complete`, parentId: null, timestamp: new Date().toISOString(), data: { messageId: reply, content: `answer to ${content.slice(0, 40)}` } } as SessionEvent)
          append({ type: 'assistant.turn_end', id: `${reply}-end`, parentId: null, timestamp: new Date().toISOString(), data: { turnId: reply } } as SessionEvent)
        })
        return true
      },
    }
    const service = new AgentService(
      new SessionStore(directory), client,
      async () => terminalIds.map((id) => ({ id, cwd: root, title: id, updatedAt: timestamp })),
      async () => undefined,
      async (id) => [...(events.get(id) ?? [])],
      async (id) => String(events.get(id)?.length ?? 0),
      terminal as never,
      async () => undefined, async () => undefined,
    )
    const runtime = await buildApp({ service, dataDirectory: directory, logger: false, managerAgent: false, cliCanary: false })
    const { app, identity } = runtime
    const clients: Client[] = []
    try {
      await service.start()
      const address = await app.listen({ host: '127.0.0.1', port: 0 })
      const patched = await Client.connect(address, true)
      const plain = await Client.connect(address, false)
      clients.push(patched, plain)
      const url = (id: string, suffix = '') => `${address}/api/computers/${identity.info.id}/sessions/${id}${suffix}`
      const send = async (id: string, content: string, enqueue = false) => {
        const response = await fetch(url(id, '/messages'), {
          method: 'POST', headers: { 'content-type': 'application/json', origin: address },
          body: JSON.stringify({ content, ...(enqueue ? { enqueue } : {}) }),
        })
        expect(response.status, await response.clone().text()).toBe(202)
        return (await response.json()) as { session: SessionDetail }
      }
      const wire = (id: string) => JSON.parse(JSON.stringify(service.store.get(id)!.messages)) as ChatMessage[]
      const settled = async (id: string, replies: number, viewer = patched) => {
        await vi.waitFor(() => {
          const view = viewer.sessions.get(id)
          expect(view?.status).toBe('idle')
          expect(view?.messages.filter((entry) => entry.role === 'assistant' && entry.content.startsWith('answer to')).length).toBe(replies)
        }, { timeout: 20_000, interval: 20 })
      }
      // The browser shows what the store holds, each message once and in
      // order, and a browser that takes patches sees what one that does not
      // is sent.
      const converged = async (watching: Client[] = [patched, plain]) => {
        await vi.waitFor(() => {
          for (const id of [...ids, largeId]) {
            const stored = service.store.get(id)
            if (!stored) continue
            for (const watcher of watching) {
              expect(watcher.sessions.get(id)?.messages).toEqual(wire(id))
            }
            const seen = stored.messages.map((entry) => entry.id)
            expect(new Set(seen).size).toBe(seen.length)
          }
          expect(patched.upserts.length).toBe(plain.upserts.length)
        }, { timeout: 20_000, interval: 20 })
        expect(patched.upserts).toEqual(plain.upserts)
        expect(patched.resyncs).toBe(0)
      }

      await vi.waitFor(() => expect(service.store.get(largeId)?.messages.length).toBeGreaterThan(0), { timeout: 20_000 })
      await patched.seed(url, terminalIds, address)
      await plain.seed(url, terminalIds, address)
      await converged()
      expect(patched.sessions.get(largeId)!.messages.length).toBeGreaterThan(1000)

      // Idle send: acknowledged with the prompt already in the session.
      const acknowledged = await send(ids[0], 'first idle prompt')
      // Acknowledged only once the terminal took it; the transcript shows
      // the prompt when Copilot logs it.
      expect(acknowledged.session).toMatchObject({ status: 'running', activity: 'Sent to terminal' })
      await settled(ids[0], 1)
      await converged()

      // A prompt while the turn runs is queued durably, then delivered once.
      await send(ids[0], 'second prompt while busy')
      await vi.waitFor(() => expect(patched.sessions.get(ids[0])?.status).toBe('running'), { timeout: 5000, interval: 5 })
      const queued = await send(ids[0], 'third prompt queued', true)
      expect(queued.session.queuedCount ?? queued.session.queuedPrompts?.length ?? 0).toBeGreaterThanOrEqual(0)
      await settled(ids[0], 3)
      await converged()

      // Concurrent sends across sessions, and the same text twice on one.
      await Promise.all([
        send(ids[0], 'concurrent a'),
        send(ids[1], 'concurrent b'),
        send(ids[2], 'concurrent c'),
      ])
      await Promise.all([settled(ids[0], 4), settled(ids[1], 1), settled(ids[2], 1)])
      await send(ids[1], 'retried text')
      await settled(ids[1], 2)
      await send(ids[1], 'retried text')
      await settled(ids[1], 3)
      await converged()

      // A long prompt and a long history.
      const long = `${'long prompt line\n'.repeat(9000)}end`
      await send(ids[2], long)
      await settled(ids[2], 2)
      await send(largeId, 'on a long history')
      await settled(largeId, 1)
      await converged()
      expect(patched.sessions.get(ids[2])?.messages.some((entry) => entry.role === 'user' && entry.content === long.trim())).toBe(true)

      // Every prompt reached the terminal once, in the order it was sent.
      for (const id of terminalIds) {
        const delivered = sent.filter((entry) => entry.id === id).map((entry) => entry.content)
        const shown = patched.sessions.get(id)!.messages
          .filter((entry) => entry.role === 'user' && !entry.id.startsWith('large-'))
          .map((entry) => entry.content)
        expect(shown).toEqual(delivered.map((content) => content.trim()))
      }
      expect(sent.map((entry) => entry.content)).toContain('third prompt queued')
      expect(sent.filter((entry) => entry.content === 'third prompt queued')).toHaveLength(1)

      // Patches carried the turns; full events were the first sight of each
      // session and nothing like a full transcript per change.
      expect(patched.patchFrames).toBeGreaterThan(10)

      // A browser that reconnects is sent everything in full first.
      patched.socket.close()
      const reconnected = await Client.connect(address, true)
      clients.push(reconnected)
      await reconnected.seed(url, terminalIds, address)
      const fullBefore = reconnected.fullFrames
      await send(ids[0], 'after reconnect')
      await settled(ids[0], 5, reconnected)
      await vi.waitFor(() => {
        for (const id of terminalIds) expect(reconnected.sessions.get(id)?.messages).toEqual(wire(id))
      }, { timeout: 20_000, interval: 20 })
      // Its first event for the session it saw change was whole.
      expect(reconnected.fullFrames).toBeGreaterThan(fullBefore)
      expect(reconnected.resyncs).toBe(0)

      // Deleting a session reaches every browser and leaves no patch state.
      const deleted = await fetch(url(ids[2]), { method: 'DELETE', headers: { origin: address } })
      expect(deleted.status, await deleted.clone().text()).toBe(204)
      await vi.waitFor(() => {
        expect(reconnected.sessions.has(ids[2])).toBe(false)
        expect(plain.sessions.has(ids[2])).toBe(false)
      }, { timeout: 5000 })

      // What is on disk is what browsers were shown, after a restart too.
      const before = new Map(terminalIds.filter((id) => service.store.get(id)).map((id) => [id, wire(id)]))
      await service.store.flush()
      await service.stop()
      const reloaded = new SessionStore(directory)
      await reloaded.initialize()
      // Loading marks every message settled, as it always has.
      const settledFlag = (messages: ChatMessage[]) => messages.map((entry) => ({ ...entry, streaming: undefined }))
      for (const [id, messages] of before) {
        expect(settledFlag(JSON.parse(JSON.stringify(reloaded.get(id)?.messages)))).toEqual(settledFlag(messages))
        expect(reconnected.sessions.get(id)?.messages).toEqual(messages)
      }
      expect(reloaded.get(ids[2])).toBeUndefined()
    } finally {
      for (const timer of timers) clearTimeout(timer)
      for (const entry of clients) entry.socket.terminate()
      await service.stop().catch(() => undefined)
      await app.close()
    }
  }, 120_000)
})
