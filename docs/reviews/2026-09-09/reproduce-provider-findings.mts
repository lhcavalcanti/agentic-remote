// These assertions reproduce the dated defects; corrected code should invalidate them.
import assert from 'node:assert/strict'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from '../../../server/agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from '../../../server/claude-agent-service.js'
import type { SessionStore } from '../../../server/session-store.js'
import type { SessionDetail } from '../../../shared/contracts.js'
import { deliveryUncertaintyFromError } from '../../../shared/submission-error.js'

const timestamp = '2026-09-09T18:44:41.944Z'
const reports: object[] = []

class MemoryStore {
  readonly calls: string[] = []
  refuseRename = false
  session: SessionDetail

  constructor(provider: 'copilot' | 'claude' = 'copilot') {
    this.session = {
      id: 'functional-review-session',
      provider,
      executionMode: 'sdk',
      cwd: process.cwd(),
      title: 'Original title',
      updatedAt: timestamp,
      status: 'idle',
      isOpen: true,
      messages: [],
      queuedPrompts: [],
      queuedCount: 0,
    }
  }

  get() { return structuredClone(this.session) }
  async readAfterWrites() { return this.get() }
  backend() { return 'sdk' as const }
  terminalQueueDispatch() { return undefined }
  recoveryResend() { return undefined }
  failedPrompt() { return this.session.failedPrompt }
  list() { return [this.get()] }
  async renameSession(_id: string, title: string) {
    this.calls.push(`store.rename:${title}`)
    if (this.refuseRename) throw new Error('Synthetic admission write refusal')
    this.session.title = title
    return this.get()
  }
  async updateStatus(_id: string, status: SessionDetail['status']) {
    this.session.status = status
    return this.get()
  }
}

function copilotFixture() {
  const store = new MemoryStore()
  const provider = { title: store.session.title, commands: [] as string[] }
  const sdk = {
    sessionId: store.session.id,
    on: () => () => {},
    sendAndWait: async () => undefined,
    getEvents: async () => [],
    abort: async () => {},
    disconnect: async () => {},
    rpc: {
      name: { set: async ({ name }: { name: string }) => {
        store.calls.push(`sdk.rename:${name}`)
        provider.title = name
      } },
      commands: {
        list: async () => ({
          commands: [{ name: 'fixture', description: 'Synthetic command', allowDuringAgentExecution: true }],
        }),
        enqueue: async ({ command }: { command: string }) => {
          provider.commands.push(command)
          throw new Error('Synthetic receipt lost after native enqueue')
        },
        invoke: async () => {
          provider.commands.push('/fixture')
          throw new Error('Synthetic receipt lost after invocation')
        },
      },
      model: {
        getCurrent: async () => ({ modelId: 'fixture' }),
        switchTo: async () => ({ modelId: 'fixture' }),
      },
      mode: { set: async () => ({ mode: 'interactive' }) },
    },
  } as unknown as CopilotSessionLike
  const terminal = {
    has: async () => false,
    send: async () => false,
    cancel: async () => false,
    rename: async (_id: string, title: string) => {
      store.calls.push(`terminal.rename:${title}`)
      provider.title = title
      return true
    },
  }
  const service = new AgentService(
    store as unknown as SessionStore,
    {} as CopilotClientLike,
    async () => [],
    async () => {},
    async () => [],
    async () => undefined,
    terminal,
    async () => undefined,
    async () => undefined,
  )
  Reflect.get(service, 'sessions').set(store.session.id, sdk)
  return { store, provider, sdk, service }
}

function claudeFixture() {
  const store = new MemoryStore('claude')
  const provider = { title: store.session.title }
  const unavailable = () => { throw new Error('Unexpected provider query') }
  const sdk = {
    query: unavailable,
    getSessionInfo: unavailable,
    deleteSession: unavailable,
    renameSession: async (_id: string, title: string) => {
      store.calls.push(`claude.rename:${title}`)
      provider.title = title
    },
  } as unknown as ClaudeSdk
  const service = new ClaudeAgentService(
    store as unknown as SessionStore,
    '/functional-review-not-executed',
    sdk,
    async () => { throw new Error('Unexpected authentication call') },
  )
  return { store, provider, service }
}

for (const mode of ['sdk', 'terminal', 'claude'] as const) {
  const { store, provider, service } = mode === 'claude' ? claudeFixture() : copilotFixture()
  if (mode === 'terminal') {
    Reflect.get(service, 'externalSessionIds').add(store.session.id)
    store.session.executionMode = 'tmux'
  }
  store.refuseRename = true
  await assert.rejects(service.renameSession(store.session.id, 'Refused title'), /admission write refusal/)
  assert.equal(store.session.title, 'Original title')
  assert.equal(provider.title, 'Refused title')
  assert.equal(store.calls.length, 2)
  assert.match(store.calls[0], /^(sdk|terminal|claude)\.rename:/)
  reports.push({
    case: `207-${mode}-refusal`,
    result: 'reproduced',
    calls: store.calls,
    durableTitle: store.session.title,
    providerTitle: provider.title,
  })
}

{
  const { store, provider, service } = copilotFixture()
  store.session.suspended = true
  store.refuseRename = true
  await assert.rejects(service.renameSession(store.session.id, 'Refused title'), /admission write refusal/)
  assert.deepEqual(store.calls, ['store.rename:Refused title'])
  assert.equal(provider.title, 'Original title')
  reports.push({ case: '207-suspended-copilot-counterexample', result: 'no provider effect', calls: store.calls })
}

{
  const { store, provider, service } = copilotFixture()
  const renamed = await service.renameSession(store.session.id, 'Accepted title')
  assert.equal(renamed.title, 'Accepted title')
  assert.equal(provider.title, 'Accepted title')
  reports.push({ case: '207-success-counterexample', result: 'both titles updated' })
}

for (const enqueue of [true, false]) {
  const { store, provider, service } = copilotFixture()
  const error = await service.executeCommand(store.session.id, '/fixture', enqueue)
    .then(() => { throw new Error('Expected a lost receipt') }, (error: unknown) => error)
  assert.deepEqual(provider.commands, ['/fixture'])
  assert.equal(deliveryUncertaintyFromError(error), !enqueue)
  reports.push({
    case: enqueue ? 'native-sdk-command-enqueue-receipt-loss' : 'sdk-command-invoke-counterexample',
    result: enqueue ? 'reproduced false definite refusal' : 'correctly uncertain',
    queuedOrInvokedCopies: provider.commands.length,
    uncertainDelivery: deliveryUncertaintyFromError(error),
  })
}

for (const status of ['error', 'idle'] as const) {
  const { store, service } = claudeFixture()
  store.session.status = status
  if (status === 'error') {
    await assert.rejects(service.restartSession(store.session.id), /Session must be idle/)
    assert.equal(store.session.status, 'error')
    reports.push({ case: 'claude-error-restart', result: 'reproduced refusal', providerCalls: store.calls.length })
  } else {
    const restarted = await service.restartSession(store.session.id)
    assert.equal(restarted.id, store.session.id)
    assert.equal(restarted.status, 'idle')
    reports.push({ case: 'claude-idle-restart-counterexample', result: 'succeeds without query' })
  }
}

console.log(JSON.stringify({
  baseline: '15a043e57234f7addfd8160f990dd22b38f1882a',
  environment: 'in-memory stores; fake provider methods; no start(), authentication, terminal, network or filesystem mutation',
  reports,
}, null, 2))
