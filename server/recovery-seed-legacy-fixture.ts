import { randomUUID } from 'node:crypto'
import { realpath, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'
import type { TerminalSessionController } from './terminal-session.js'

const [directory, backend, resultPath, phase = 'idle'] = process.argv.slice(2)
if (!directory || !resultPath || !['sdk', 'terminal'].includes(backend) ||
    !['idle', 'busy'].includes(phase)) {
  throw new Error('Expected isolated state directory, backend, and result path')
}
const fixtureRoot = path.dirname(directory)
if (
  path.dirname(fixtureRoot) !== path.resolve(tmpdir()) ||
  !path.basename(fixtureRoot).startsWith('recovery-guards-') ||
  path.basename(directory) !== 'state' ||
  path.dirname(resultPath) !== fixtureRoot ||
  await realpath(fixtureRoot) !== fixtureRoot
) throw new Error('Legacy startup is restricted to an owned synthetic recovery fixture')

const boots = []
for (let boot = 0; boot < 2; boot += 1) {
  const store = new SessionStore(directory)
  await store.initialize()
  const calls: string[] = []
  const listeners = new Set<(event: SessionEvent) => void>()
  const session: CopilotSessionLike = {
    sessionId: 'replacement',
    on: (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    send: async ({ prompt }) => {
      calls.push(prompt)
      setImmediate(() => {
        for (const listener of listeners) listener({
          id: randomUUID(), type: 'session.idle', data: {},
          timestamp: new Date().toISOString(), ephemeral: true, parentId: null,
        } as SessionEvent)
      })
      return randomUUID()
    },
    sendAndWait: async (prompt) => { calls.push(prompt); return undefined },
    getEvents: async () => [],
    abort: async () => {},
    disconnect: async () => {},
    rpc: {
      commands: {
        list: async () => ({ commands: [] }),
        invoke: async () => ({ kind: 'text', text: 'Synthetic command' }),
        enqueue: async () => ({ queued: true }),
      },
      model: {
        getCurrent: async () => ({ modelId: 'fixture' }),
        switchTo: async () => ({ modelId: 'fixture' }),
      },
      name: { set: async () => {} },
      mode: { set: async () => {} },
    },
  }
  const client: CopilotClientLike = {
    start: async () => {},
    stop: async () => [],
    createSession: async () => { throw new Error('Legacy fixture must never create a provider') },
    resumeSession: async () => session,
    listSessions: async () => [],
    deleteSession: async () => {},
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
    },
  }
  const terminal: TerminalSessionController = {
    has: async () => backend === 'terminal',
    inputReady: async () => phase === 'idle',
    capture: async () => `Synthetic owner\n╻▄▄▄▄▄▄▄▄▄▄\n┃ \n╹▀▀▀▀▀▀▀▀▀▀\n ${phase === 'busy' ? 'esc interrupt' : '/ commands'}`,
    send: async (_id, prompt) => { calls.push(prompt); return true },
    sendWhenIdle: async (_id, prompt) => { calls.push(prompt); return true },
    cancel: async () => backend === 'terminal',
  }
  const service = new AgentService(
    store, client,
    async () => backend === 'terminal' ? [{
      id: 'replacement', cwd: directory, title: 'Synthetic legacy owner',
      updatedAt: new Date().toISOString(),
    }] : [],
    async () => {},
    async () => [],
    async () => phase === 'busy' ? 'synthetic-active-transcript' : undefined,
    terminal,
    async () => undefined,
    async () => undefined,
  )
  try {
    await service.start()
    await service['drainSdkQueue']('replacement')
    await service['drainTerminalQueue']('replacement')
    await new Promise<void>((resolve) => setImmediate(resolve))
    await store.flush()
    boots.push({
      calls,
      session: store.get('replacement'),
      failedPrompt: store.failedPrompt('replacement'),
    })
  } finally {
    await service.stop()
  }
}
await writeFile(resultPath, JSON.stringify(boots), { mode: 0o600 })
