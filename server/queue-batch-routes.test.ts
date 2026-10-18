import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { buildApp } from './app.js'
import { ClaudeAgentService } from './claude-agent-service.js'
import { ProviderSessionService } from './provider-session-service.js'
import { SessionStore } from './session-store.js'

/** An SDK session whose turns stay open, so queued prompts stay queued. */
function heldSession(): CopilotSessionLike & { sent: string[] } {
  const handlers = new Set<(event: SessionEvent) => void>()
  const sent: string[] = []
  return {
    sessionId: randomUUID(),
    sent,
    on(handler) {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    async send({ prompt }) {
      sent.push(prompt)
      return randomUUID()
    },
    sendAndWait(prompt) {
      sent.push(prompt)
      return new Promise(() => {})
    },
    async getEvents() {
      return []
    },
    async abort() {},
    async disconnect() {},
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      name: { set: async () => undefined },
      model: { getCurrent: async () => ({ modelId: 'fixture' }), switchTo: async () => ({}) },
      mode: { set: async () => ({}) },
    } as unknown as CopilotSessionLike['rpc'],
  }
}

const directories: string[] = []
const closers: Array<() => Promise<unknown>> = []

afterEach(async () => {
  await Promise.allSettled(closers.splice(0).map((close) => close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.unstubAllEnvs()
})

async function runtime(role: 'hub' | 'node') {
  const directory = await mkdtemp(path.join(tmpdir(), `queue-batch-${role}-`))
  directories.push(directory)
  const session = heldSession()
  const client = {
    start: async () => {},
    stop: async () => [],
    createSession: async () => session,
    resumeSession: async () => session,
    deleteSession: async () => {},
    listSessions: async () => [],
    rpc: { commands: { list: async () => ({ commands: [] }) }, models: { list: async () => ({ models: [] }) } },
  } as unknown as CopilotClientLike
  const agent = new AgentService(
    new SessionStore(path.join(directory, 'state')),
    client,
    async () => [],
    async () => undefined,
    async () => [],
    async () => undefined,
    { has: async () => false, send: async () => false, capture: async () => '', cancel: async () => false } as never,
  )
  const service = new ProviderSessionService(agent, new ClaudeAgentService(new SessionStore(path.join(directory, 'claude'))))
  const built = await buildApp({
    dataDirectory: path.join(directory, 'app'), logger: false, role, service, cliCanary: false, managerAgent: false,
    transcriptionService: { initialize: async () => undefined, stop: async () => undefined, transcribe: vi.fn() } as never,
  })
  closers.push(() => built.app.close())
  await built.service.start()
  vi.stubEnv('HOME', directory)
  const created = await agent.createSession(directory)
  // A running turn, so the batch stays queued for the assertions.
  await agent.sendMessage(created.id, 'running turn')
  return { ...built, agent, session, sessionId: created.id }
}

const local = { host: 'localhost' }

describe('queue batch routes', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  })

  it('admits a batch once, answers its retry, and refuses what it must before writing', async () => {
    const hub = await runtime('hub')
    const url = `/api/computers/${hub.identity.info.id}/sessions/${hub.sessionId}/queue/batch`
    const post = (payload: unknown, headers: Record<string, string> = local) =>
      hub.app.inject({ method: 'POST', url, headers, payload: payload as object })
    const queue = () => (hub.agent.store.get(hub.sessionId)?.queuedPrompts ?? []).map((prompt) => prompt.content)

    const admitted = await post({ batchId: 'batch-0001', prompts: ['first', 'second'] })
    expect(admitted.statusCode).toBe(201)
    expect(admitted.json()).toMatchObject({
      session: { id: hub.sessionId, computerId: hub.identity.info.id, queuedCount: 2 },
      batch: { id: 'batch-0001', duplicate: false, promptIds: [expect.any(String), expect.any(String)] },
    })

    const retried = await post({ batchId: 'batch-0001', prompts: ['first', 'second'] })
    expect(retried.statusCode).toBe(200)
    expect(retried.json().batch).toEqual({ ...admitted.json().batch, duplicate: true })

    const reused = await post({ batchId: 'batch-0001', prompts: ['different'] })
    expect(reused.statusCode).toBe(409)
    expect(reused.json().error).toMatch(/already used for different prompts/)

    for (const malformed of [
      { batchId: 'batch-0002', prompts: [] },
      { batchId: 'batch-0002', prompts: ['ok', '  '] },
      { batchId: 'batch-0002', prompts: Array.from({ length: 51 }, () => 'p') },
      { batchId: 'batch-0002', prompts: Array.from({ length: 6 }, () => 'x'.repeat(200_000)) },
      { batchId: 'no', prompts: ['ok'] },
      { batchId: 'batch-0002', prompts: ['ok'], combine: true },
    ]) {
      const response = await post(malformed)
      expect(response.statusCode, JSON.stringify(malformed).slice(0, 80)).toBe(400)
    }
    const oversized = await hub.app.inject({
      method: 'POST', url, headers: { ...local, 'content-type': 'application/json' },
      payload: JSON.stringify({ batchId: 'batch-0003', prompts: ['x'.repeat(9 * 1024 * 1024)] }),
    })
    expect(oversized.statusCode).toBe(413)
    const foreign = await post({ batchId: 'batch-0004', prompts: ['ok'] }, {
      host: 'localhost:4317', origin: 'https://evil.example',
    })
    expect(foreign.statusCode).toBe(403)
    const missing = await hub.app.inject({
      method: 'POST', headers: local,
      url: `/api/computers/${hub.identity.info.id}/sessions/missing-session/queue/batch`,
      payload: { batchId: 'batch-0005', prompts: ['ok'] },
    })
    expect(missing.statusCode).toBeGreaterThanOrEqual(400)
    expect(queue()).toEqual(['first', 'second'])
    expect(hub.session.sent).toEqual(['running turn'])
  })

  it('forwards a batch to the computer that owns the session', async () => {
    const hub = await runtime('hub')
    const node = await runtime('node')
    await node.app.listen({ host: '127.0.0.1', port: 0 })
    const address = node.app.server.address()
    if (!address || typeof address === 'string') throw new Error('Node has no TCP address')
    expect((await hub.app.inject({
      method: 'POST', url: '/api/computers', headers: local,
      payload: { baseUrl: `http://127.0.0.1:${address.port}`, token: node.identity.token, name: 'remote' },
    })).statusCode).toBe(201)

    // The hub learns what a node can do once it has connected to it.
    await vi.waitFor(async () => {
      const computers = (await hub.app.inject({ url: '/api/computers', headers: local })).json().computers as Array<{
        id: string; providers?: Array<{ supportsQueueBatch?: boolean }>
      }>
      expect(computers.find((computer) => computer.id === node.identity.info.id)?.providers
        ?.some((provider) => provider.supportsQueueBatch)).toBe(true)
    }, { timeout: 5_000 })
    const response = await hub.app.inject({
      method: 'POST', headers: local,
      url: `/api/computers/${node.identity.info.id}/sessions/${node.sessionId}/queue/batch`,
      payload: { batchId: 'batch-0001', prompts: ['on the node', 'and again'] },
    })
    expect(response.statusCode, response.body).toBe(201)
    expect(response.json()).toMatchObject({
      session: { computerId: node.identity.info.id, computerName: 'remote', queuedCount: 2 },
      batch: { duplicate: false },
    })
    expect(node.agent.store.get(node.sessionId)?.queuedPrompts?.map((prompt) => prompt.content))
      .toEqual(['on the node', 'and again'])
  })

  it('refuses a batch for a computer too old to take one, without sending it there', async () => {
    const hub = await runtime('hub')
    const node = await runtime('node')
    const older = node.service.providers().map(({ supportsQueueBatch: _batch, ...provider }) => provider)
    vi.spyOn(node.service, 'providers').mockReturnValue(older)
    const forwarded = vi.spyOn(node.service, 'queueBatch')
    await node.app.listen({ host: '127.0.0.1', port: 0 })
    const address = node.app.server.address()
    if (!address || typeof address === 'string') throw new Error('Node has no TCP address')
    await hub.app.inject({
      method: 'POST', url: '/api/computers', headers: local,
      payload: { baseUrl: `http://127.0.0.1:${address.port}`, token: node.identity.token, name: 'older-node' },
    })
    // Wait for the node's own answer (it lists Claude; the hub's stand-in does
    // not), so the refusal is about the node and not about not knowing yet.
    await vi.waitFor(async () => {
      const computers = (await hub.app.inject({ url: '/api/computers', headers: local })).json().computers as Array<{
        id: string; providers?: Array<{ id: string }>
      }>
      expect(computers.find((computer) => computer.id === node.identity.info.id)?.providers
        ?.map((provider) => provider.id)).toContain('claude')
    }, { timeout: 5_000 })
    const response = await hub.app.inject({
      method: 'POST', headers: local,
      url: `/api/computers/${node.identity.info.id}/sessions/${node.sessionId}/queue/batch`,
      payload: { batchId: 'batch-0001', prompts: ['first'] },
    })
    expect(response.statusCode).toBe(409)
    expect(response.json().error).toBe('Update older-node to queue several prompts at once. Nothing was queued.')
    expect(forwarded).not.toHaveBeenCalled()
  })

  describe('retrying an unconfirmed item in place', () => {
    /** The head of a two-item batch was handed over, but its outcome is unknown. */
    async function unconfirmed(target: Awaited<ReturnType<typeof runtime>>) {
      const { batch } = await target.agent.queueBatch(target.sessionId, { batchId: 'batch-retry', prompts: ['first', 'second'] })
      const attemptId = randomUUID()
      await target.agent.store.update(target.sessionId, (session) => {
        const [head, ...rest] = session.queuedPrompts!
        session.queuedPrompts = rest
        session.queuedDispatch = {
          attemptId, promptId: head.id, content: head.content, startedAt: head.createdAt,
          state: 'uncertain', original: head, originalIndex: 0,
        }
      })
      return { attemptId, promptId: batch.promptIds[0] }
    }

    async function pair(hub: Awaited<ReturnType<typeof runtime>>, node: Awaited<ReturnType<typeof runtime>>, name: string) {
      await node.app.listen({ host: '127.0.0.1', port: 0 })
      const address = node.app.server.address()
      if (!address || typeof address === 'string') throw new Error('Node has no TCP address')
      await hub.app.inject({
        method: 'POST', url: '/api/computers', headers: local,
        payload: { baseUrl: `http://127.0.0.1:${address.port}`, token: node.identity.token, name },
      })
      await vi.waitFor(async () => {
        const computers = (await hub.app.inject({ url: '/api/computers', headers: local })).json().computers as Array<{
          id: string; providers?: Array<{ id: string }>
        }>
        expect(computers.find((computer) => computer.id === node.identity.info.id)?.providers
          ?.map((provider) => provider.id)).toContain('claude')
      }, { timeout: 5_000 })
    }

    it('puts it back where it was, only for the attempt the user checked', async () => {
      const hub = await runtime('hub')
      const { attemptId, promptId } = await unconfirmed(hub)
      const url = `/api/computers/${hub.identity.info.id}/sessions/${hub.sessionId}/queue/${promptId}/retry`
      expect((await hub.app.inject({ method: 'POST', url, headers: local, payload: {} })).statusCode).toBe(400)
      const stale = await hub.app.inject({ method: 'POST', url, headers: local, payload: { acknowledgesDispatch: randomUUID() } })
      expect(stale.statusCode).toBe(409)
      const foreign = await hub.app.inject({
        method: 'POST', url, headers: { host: 'localhost:4317', origin: 'https://evil.example' },
        payload: { acknowledgesDispatch: attemptId },
      })
      expect(foreign.statusCode).toBe(403)

      const retried = await hub.app.inject({ method: 'POST', url, headers: local, payload: { acknowledgesDispatch: attemptId } })
      expect(retried.statusCode, retried.body).toBe(200)
      expect(retried.json().session.queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual(['first', 'second'])
      expect(retried.json().session.queuedDispatch).toBeUndefined()
      expect((await hub.app.inject({ method: 'POST', url, headers: local, payload: { acknowledgesDispatch: attemptId } })).statusCode)
        .toBe(409)
    })

    it('forwards it to the computer that owns the session', async () => {
      const hub = await runtime('hub')
      const node = await runtime('node')
      await pair(hub, node, 'remote')
      const { attemptId, promptId } = await unconfirmed(node)
      const response = await hub.app.inject({
        method: 'POST', headers: local,
        url: `/api/computers/${node.identity.info.id}/sessions/${node.sessionId}/queue/${promptId}/retry`,
        payload: { acknowledgesDispatch: attemptId },
      })
      expect(response.statusCode, response.body).toBe(200)
      expect(response.json().session).toMatchObject({ computerId: node.identity.info.id, queuedCount: 2 })
      expect(node.agent.store.get(node.sessionId)?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['first', 'second'])
    })

    it('refuses a computer too old to retry in place, without sending it there', async () => {
      const hub = await runtime('hub')
      const node = await runtime('node')
      const older = node.service.providers().map(({ supportsQueueRetry: _retry, ...provider }) => provider)
      vi.spyOn(node.service, 'providers').mockReturnValue(older)
      const forwarded = vi.spyOn(node.service, 'retryQueuedDispatch')
      await pair(hub, node, 'older-node')
      const response = await hub.app.inject({
        method: 'POST', headers: local,
        url: `/api/computers/${node.identity.info.id}/sessions/${node.sessionId}/queue/prompt/retry`,
        payload: { acknowledgesDispatch: randomUUID() },
      })
      expect(response.statusCode).toBe(409)
      expect(response.json().error).toBe('Update older-node to retry a queue item in place.')
      expect(forwarded).not.toHaveBeenCalled()
    })
  })
})
