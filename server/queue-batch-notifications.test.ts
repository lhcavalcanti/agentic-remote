import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import type { PushSubscription, RequestOptions } from 'web-push'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { buildApp } from './app.js'
import { ClaudeAgentService } from './claude-agent-service.js'
import { ProviderSessionService } from './provider-session-service.js'
import { PushNotificationService } from './push-notification-service.js'
import { SessionStore } from './session-store.js'

/** Turns that end only when the test ends them. */
function turns() {
  const handlers = new Set<(event: SessionEvent) => void>()
  const open: Array<() => void> = []
  const sent: string[] = []
  const idle = () => {
    for (const handler of [...handlers]) {
      handler({ id: randomUUID(), type: 'session.idle', timestamp: new Date().toISOString(), parentId: null, data: {} } as SessionEvent)
    }
  }
  const session: CopilotSessionLike = {
    sessionId: randomUUID(),
    on(handler) {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    async send({ prompt }) {
      sent.push(prompt)
      open.push(idle)
      return randomUUID()
    },
    sendAndWait(prompt) {
      sent.push(prompt)
      return new Promise((resolve) => open.push(() => resolve(undefined)))
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
  return { session, sent, finish: () => open.shift()?.() }
}

const directories: string[] = []
const closers: Array<() => Promise<unknown>> = []

afterEach(async () => {
  await Promise.allSettled(closers.splice(0).map((close) => close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.unstubAllEnvs()
})

describe('notifications while a batch drains', () => {
  it('sends one Finished notification for the whole batch, not one per prompt', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'queue-batch-push-'))
    directories.push(directory)
    vi.stubEnv('HOME', directory)
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
    const fake = turns()
    const client = {
      start: async () => {},
      stop: async () => [],
      createSession: async () => fake.session,
      resumeSession: async () => fake.session,
      deleteSession: async () => {},
      listSessions: async () => [],
      rpc: { commands: { list: async () => ({ commands: [] }) }, models: { list: async () => ({ models: [] }) } },
    } as unknown as CopilotClientLike
    const agent = new AgentService(
      new SessionStore(path.join(directory, 'state')), client,
      async () => [], async () => undefined, async () => [], async () => undefined,
      { has: async () => false, send: async () => false, capture: async () => '', cancel: async () => false } as never,
    )
    const service = new ProviderSessionService(agent, new ClaudeAgentService(new SessionStore(path.join(directory, 'claude'))))
    const hub = await buildApp({
      dataDirectory: path.join(directory, 'app'), logger: false, role: 'hub', service, cliCanary: false, managerAgent: false,
      transcriptionService: { initialize: async () => undefined, stop: async () => undefined, transcribe: vi.fn() } as never,
    })
    closers.push(() => hub.app.close())
    await hub.service.start()
    const sender = vi.fn(async (_subscription: PushSubscription, _payload?: string | Buffer | null, _options?: RequestOptions) => ({
      statusCode: 201, headers: {}, body: '',
    }))
    const push = new PushNotificationService(path.join(directory, 'push'), sender)
    await push.initialize()
    await push.subscribe({ endpoint: 'https://push.example.test/one', expirationTime: null, keys: { p256dh: 'p', auth: 'a' } })
    push.attach(hub.manager!)
    closers.push(async () => push.stop())

    const created = await agent.createSession(directory)
    await agent.sendMessage(created.id, 'running turn')
    const prompts = ['first', 'second', 'third', 'fourth', 'fifth']
    await agent.queueBatch(created.id, { batchId: 'batch-notify', prompts })
    for (let turn = 0; turn <= prompts.length; turn += 1) {
      await vi.waitFor(() => expect(fake.sent).toHaveLength(turn + 1))
      fake.finish()
    }
    await vi.waitFor(() => expect(agent.store.get(created.id)?.status).toBe('idle'))
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(fake.sent).toEqual(['running turn', ...prompts])
    const titles = sender.mock.calls.map((call) => (JSON.parse(call[1] as string) as { title: string }).title)
    expect(titles).toEqual([`Finished · ${agent.store.get(created.id)!.title}`])
  })
})
