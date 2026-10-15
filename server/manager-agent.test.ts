import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import {
  ManagerAgent,
  type ManagerAgentOptions,
  type ManagerHub,
  type ManagerSdkClient,
  type ManagerSdkEvent,
  type ManagerSdkSession,
  type ManagerSdkSessionConfig,
} from './manager-agent.js'
import { JournalRecorder } from './manager-journal.js'
import { ManagerStore } from './manager-store.js'

type Behavior = (session: FakeSession, prompt: string) => void | Promise<void>

const reply = (text: string): Behavior => (session) => {
  session.emit({ type: 'assistant.message_delta', data: { messageId: 'r', deltaContent: text.slice(0, 3) } })
  session.emit({ type: 'assistant.message_delta', data: { messageId: 'r', deltaContent: text.slice(3) } })
  session.emit({ type: 'assistant.message', data: { messageId: 'r', content: text } })
  session.emit({ type: 'session.idle' })
}

const fail = (message: string): Behavior => (session) => {
  session.emit({ type: 'session.error', data: { errorType: 'runtime', message } })
}

class FakeSession implements ManagerSdkSession {
  readonly prompts: string[] = []
  private readonly handlers = new Set<(event: ManagerSdkEvent) => void>()
  abort = vi.fn(async () => undefined)
  disconnect = vi.fn(async () => undefined)

  constructor(
    readonly sessionId: string,
    readonly config: Omit<ManagerSdkSessionConfig, 'sessionId'>,
    private readonly fake: FakeSdk,
  ) {}

  on(handler: (event: ManagerSdkEvent) => void) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  emit(event: ManagerSdkEvent) {
    for (const handler of [...this.handlers]) handler(event)
  }

  async send({ prompt }: { prompt: string }) {
    this.prompts.push(prompt)
    this.fake.prompts.push(prompt)
    const behavior = this.fake.behaviors.shift() ?? reply('Okay.')
    setTimeout(() => void behavior(this, prompt), 0)
    return 'message-id'
  }

  tool(name: string) {
    const tool = this.config.tools.find((candidate) => candidate.name === name)
    if (!tool) throw new Error(`no tool ${name}`)
    return (args: unknown) => tool.handler(args, { sessionId: this.sessionId, toolCallId: 't', toolName: name, arguments: args })
  }
}

class FakeSdk {
  behaviors: Behavior[] = []
  prompts: string[] = []
  clients: FakeClient[] = []
  sessions = new Map<string, FakeSession>()
  createFailures: Array<(config: ManagerSdkSessionConfig) => Error | undefined> = []
  resumeFailures: Error[] = []

  factory = () => {
    const client = new FakeClient(this)
    this.clients.push(client)
    return client
  }
}

class FakeClient implements ManagerSdkClient {
  start = vi.fn(async () => undefined)
  stop = vi.fn(async () => [])
  deleteSession = vi.fn(async (_id: string) => undefined)
  createSession = vi.fn(async (config: ManagerSdkSessionConfig) => {
    const failure = this.fake.createFailures.shift()?.(config)
    if (failure) throw failure
    const session = new FakeSession(config.sessionId!, config, this.fake)
    this.fake.sessions.set(session.sessionId, session)
    return session
  })
  resumeSession = vi.fn(async (id: string, config: Omit<ManagerSdkSessionConfig, 'sessionId'>) => {
    const failure = this.fake.resumeFailures.shift()
    if (failure) throw failure
    const session = new FakeSession(id, config, this.fake)
    this.fake.sessions.set(id, session)
    return session
  })
  rpc = {
    skills: {
      discover: vi.fn(async () => ({ skills: [{ name: 'brainstorming', description: 'Explore first', source: 'personal' }] })),
    },
  }

  constructor(private readonly fake: FakeSdk) {}
}

const computers: ComputerSummary[] = [{
  id: 'hub', name: 'development', isLocal: true, online: true,
  providers: [{ id: 'copilot', name: 'GitHub Copilot', available: true, terminalBacked: true }],
}]

function session(id: string, change: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id, computerId: 'hub', computerName: 'development', cwd: '/home/me/src/app',
    title: `Session ${id}`, status: 'idle', updatedAt: '2026-10-15T11:55:00.000Z',
    isOpen: true, provider: 'copilot', messages: [], ...change,
  }
}

describe('ManagerAgent', () => {
  let root: string
  let sdk: FakeSdk
  let store: ManagerStore
  let sessions: ManagedSession[]
  let hub: ManagerHub
  let agent: ManagerAgent | undefined
  let events: ManagerEvent[]
  let excluded: string[]
  let ids: number

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-agent-'))
    sdk = new FakeSdk()
    sessions = [session('existing')]
    events = []
    excluded = []
    ids = 0
    hub = {
      listComputers: () => computers,
      findComputer: (nameOrId) => computers.find((computer) => computer.id === nameOrId || computer.name === nameOrId),
      listSessionsWithAuthority: vi.fn(async () => ({ sessions, answeredComputerIds: ['hub'] })),
      listSessions: vi.fn(async () => sessions),
      listHistory: vi.fn(async () => []),
      getSession: vi.fn(async (_computerId: string, id: string) => session(id)),
      askSession: vi.fn(async () => 'answer'),
      createSession: vi.fn(async () => {
        const created = session('worker-1', { cwd: '/home/me/src/web' })
        sessions = [...sessions, created]
        return created
      }),
      renameSession: vi.fn(async (_computerId: string, id: string, input: { title: string }) => session(id, { title: input.title })),
      sendMessage: vi.fn(async (_computerId: string, id: string) => session(id)),
      cancel: vi.fn(async () => undefined),
      deleteSession: vi.fn(async () => undefined),
    }
    store = await openStore()
  })

  afterEach(async () => {
    await agent?.stop()
    agent = undefined
    await rm(root, { recursive: true, force: true })
  })

  async function openStore() {
    const opened = new ManagerStore(path.join(root, 'manager'))
    await opened.initialize()
    return opened
  }

  async function start(options: Partial<ManagerAgentOptions> = {}) {
    agent = new ManagerAgent({
      store,
      recorder: new JournalRecorder(store, { flushDelayMs: 0 }),
      hub,
      clientFactory: sdk.factory,
      excludeFromDiscovery: (list) => excluded.push(...list),
      retryDelaysMs: [0, 0],
      idleStopMs: 60_000,
      sessionIdFactory: () => `sdk-${++ids}`,
      ...options,
    })
    agent.on('event', (event) => events.push(event))
    await agent.start()
    return agent
  }

  async function settled() {
    await vi.waitFor(() => {
      const snapshot = agent!.snapshot()
      expect(snapshot.messages.some((message) => message.role === 'user' && ['queued', 'running'].includes(message.state!))).toBe(false)
    }, { timeout: 4000 })
  }

  it('answers a queued message with the generated context and streams the reply', async () => {
    await start()
    const sent = await agent!.send('What is running?')
    expect(sent.state).toBe('queued')
    await settled()

    const snapshot = agent!.snapshot()
    expect(snapshot.messages.map(({ role, content, state }) => ({ role, content, state }))).toEqual([
      { role: 'user', content: 'What is running?', state: 'done' },
      { role: 'assistant', content: 'Okay.', state: undefined },
    ])
    expect(snapshot.status).toBe('idle')
    expect(sdk.prompts[0]).toContain('<agentic_remote_context')
    expect(sdk.prompts[0]).toContain('- existing · development · "Session existing"')
    expect(sdk.prompts[0]).toContain('<user_message>\nWhat is running?\n</user_message>')
    expect(events.some((event) => event.type === 'manager.delta')).toBe(true)
    expect(events.filter((event) => event.type === 'manager.status').map((event) => event.type === 'manager.status' && event.status))
      .toEqual(expect.arrayContaining(['working', 'idle']))
  })

  it('creates its SDK session with a pre-registered id and only management tools, then reuses it', async () => {
    await start()
    await agent!.send('one')
    await settled()
    await agent!.send('two')
    await settled()

    const client = sdk.clients[0]
    expect(client.createSession).toHaveBeenCalledTimes(1)
    const config = client.createSession.mock.calls[0][0]
    expect(config.sessionId).toBe('sdk-1')
    expect(config.availableTools).toContain('create_session')
    expect(config.availableTools).not.toContain('bash')
    expect(config.systemMessage.content).toContain('Session Manager')
    expect(excluded).toContain('sdk-1')
    expect(store.state()).toMatchObject({ sdkSessionId: 'sdk-1', knownSdkSessionIds: ['sdk-1'], generation: 1 })
    expect(agent!.hiddenSessionIds()).toEqual(['sdk-1'])
  })

  it('refuses only blank and oversized messages', async () => {
    await start()
    await expect(agent!.send('   ')).rejects.toMatchObject({ statusCode: 400 })
    await expect(agent!.send('x'.repeat(100_001))).rejects.toMatchObject({ statusCode: 413 })
  })

  it('accepts messages while busy and answers them in order, one at a time', async () => {
    sdk.behaviors.push(async (fakeSession) => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      reply('first')(fakeSession, '')
    })
    await start()
    await agent!.send('a')
    await agent!.send('b')
    await agent!.send('c')
    await settled()
    expect(sdk.prompts.map((prompt) => prompt.split('<user_message>\n')[1].split('\n')[0])).toEqual(['a', 'b', 'c'])
    expect(agent!.snapshot().messages.filter((message) => message.role === 'assistant').map((message) => message.content))
      .toEqual(['first', 'Okay.', 'Okay.'])
  })

  it('reports only changes since the last completed turn, and the memory index only when it changed', async () => {
    await store.memory.write('MEMORY.md', '# Prefs')
    await start()
    await agent!.send('first')
    await settled()
    expect(sdk.prompts[0]).toContain('Your memory index (MEMORY.md):\n# Prefs')

    sessions = [...sessions, session('added', { title: 'Added later' })]
    await agent!.send('second')
    await settled()
    expect(sdk.prompts[1]).toContain('created "Added later"')
    expect(sdk.prompts[1]).not.toContain('MEMORY.md):')

    await agent!.send('third')
    await settled()
    expect(sdk.prompts[2]).toContain('Changes since your last turn: none')

    await store.memory.write('MEMORY.md', '# Prefs\n- new fact')
    await agent!.send('fourth')
    await settled()
    expect(sdk.prompts[3]).toContain('- new fact')
  })

  it('retries a failed turn on the same session', async () => {
    sdk.behaviors.push(fail('rate limited'))
    await start()
    await agent!.send('hello')
    await settled()
    expect(sdk.clients).toHaveLength(1)
    expect(sdk.sessions.get('sdk-1')!.prompts).toHaveLength(2)
    expect(agent!.snapshot().messages.at(-1)).toMatchObject({ role: 'assistant', content: 'Okay.' })
    expect(sdk.prompts[1]).toContain('A previous attempt at this message failed before finishing')
  })

  it('restarts the runtime and resumes the same conversation when retries fail', async () => {
    sdk.behaviors.push(fail('broken pipe'), fail('broken pipe'))
    await start()
    await agent!.send('hello')
    await settled()
    expect(sdk.clients).toHaveLength(2)
    expect(sdk.clients[0].stop).toHaveBeenCalled()
    expect(sdk.clients[1].resumeSession).toHaveBeenCalledWith('sdk-1', expect.objectContaining({ streaming: true }))
    expect(agent!.snapshot().messages.at(-1)).toMatchObject({ role: 'assistant', content: 'Okay.' })
    expect(events.some((event) => event.type === 'manager.status' && event.status === 'recovering')).toBe(true)
  })

  it('moves to a new conversation briefed from the transcript when the old one cannot come back', async () => {
    await start()
    await agent!.send('remember the docs work')
    await settled()
    sdk.behaviors.push(fail('corrupt'), fail('corrupt'))
    sdk.resumeFailures.push(new Error('session not found'))
    await agent!.send('and now?')
    await settled()

    expect(store.state()).toMatchObject({ sdkSessionId: 'sdk-2', generation: 2, knownSdkSessionIds: ['sdk-1', 'sdk-2'] })
    expect(excluded).toEqual(expect.arrayContaining(['sdk-1', 'sdk-2']))
    expect(sdk.clients.at(-1)!.deleteSession).toHaveBeenCalledWith('sdk-1')
    const prompt = sdk.sessions.get('sdk-2')!.prompts[0]
    expect(prompt).toContain('Your previous conversation runtime was lost')
    expect(prompt).toContain('User: remember the docs work')
    expect(agent!.snapshot().messages.at(-1)).toMatchObject({ role: 'assistant', content: 'Okay.' })
  })

  it('falls back to the default model when the configured one cannot start', async () => {
    sdk.createFailures.push((config) => config.model ? new Error('model not available') : undefined)
    await start({ model: 'imaginary-model' })
    await agent!.send('hello')
    await settled()
    const calls = sdk.clients[0].createSession.mock.calls.map(([config]) => config.model)
    expect(calls).toEqual(['imaginary-model', undefined])
    expect(agent!.snapshot().messages.at(-1)).toMatchObject({ role: 'assistant' })
  })

  it('marks a message failed with Retry when every rung fails, and recovers on the next one', async () => {
    sdk.behaviors.push(fail('down'), fail('down'), fail('down'), fail('down'))
    await start()
    const message = await agent!.send('hello')
    await settled()
    const failed = agent!.snapshot().messages.find((candidate) => candidate.id === message.id)!
    expect(failed.state).toBe('failed')
    expect(failed.error).toContain('down')
    expect(agent!.snapshot().status).toBe('offline')

    await agent!.retry(message.id)
    await settled()
    expect(agent!.snapshot().messages.find((candidate) => candidate.id === message.id)!.state).toBe('done')
    expect(agent!.snapshot().status).toBe('idle')
  })

  it('aborts a turn that never finishes and recovers through a restart', async () => {
    sdk.behaviors.push(() => undefined)
    await start({ turnTimeoutMs: 40 })
    await agent!.send('hello')
    await settled()
    const stuck = await sdk.clients[0].createSession.mock.results[0].value as FakeSession
    expect(stuck.abort).toHaveBeenCalled()
    expect(sdk.clients.length).toBeGreaterThanOrEqual(2)
    expect(agent!.snapshot().messages.at(-1)).toMatchObject({ role: 'assistant', content: 'Okay.' })
  })

  it('resumes a message interrupted by a restart, once', async () => {
    await store.upsertMessage({ id: 'm1', role: 'user', content: 'start the docs work', createdAt: 't', state: 'running' })
    await start()
    await settled()
    expect(sdk.prompts[0]).toContain('interrupted by a restart')
    expect(agent!.snapshot().messages.find((message) => message.id === 'm1')!.state).toBe('done')
    expect(store.state().interruptions).toEqual({})
  })

  it('gives up on a message that keeps being interrupted', async () => {
    await store.upsertMessage({ id: 'm1', role: 'user', content: 'loop', createdAt: 't', state: 'running' })
    await store.updateState((state) => { state.interruptions = { m1: 2 } })
    await start()
    const message = agent!.snapshot().messages.find((candidate) => candidate.id === 'm1')!
    expect(message.state).toBe('failed')
    expect(sdk.prompts).toEqual([])
  })

  it('records tool actions as activity and announces sessions it started', async () => {
    sdk.behaviors.push(async (fakeSession) => {
      await fakeSession.tool('create_session')({ title: 'Docs', prompt: 'Write the docs' })
      reply('Started it.')(fakeSession, '')
    })
    await start()
    await agent!.send('start docs work')
    await settled()
    const activity = agent!.snapshot().messages.find((message) => message.role === 'activity')!
    expect(activity).toMatchObject({
      tool: 'create_session',
      content: 'Started "Docs" on development',
      sessionRefs: [{ computerId: 'hub', sessionId: 'worker-1', title: 'Docs' }],
    })
    expect(agent!.snapshot().managedSessions).toEqual(['hub:worker-1'])
    expect(events.some((event) => event.type === 'manager.sessions')).toBe(true)
    expect(hub.sendMessage).toHaveBeenCalledWith('hub', 'worker-1', { content: 'Write the docs', enqueue: true })
  })

  it('does not repeat actions from a failed attempt', async () => {
    sdk.behaviors.push(async (fakeSession) => {
      await fakeSession.tool('create_session')({ title: 'Docs', prompt: 'Write the docs' })
      fail('lost')(fakeSession, '')
    })
    await start()
    await agent!.send('start docs work')
    await settled()
    expect(sdk.prompts[1]).toContain('A previous attempt at this message failed after: Started "Docs" on development. Do not repeat these')
  })

  it('stops the current turn on cancel and keeps going with the queue', async () => {
    sdk.behaviors.push((fakeSession) => {
      fakeSession.emit({ type: 'assistant.message_delta', data: { messageId: 'r', deltaContent: 'Partial' } })
    })
    await start()
    const first = await agent!.send('long one')
    await vi.waitFor(() => expect(agent!.snapshot().streaming?.content).toBe('Partial'))
    await agent!.send('next')
    await agent!.cancel()
    await settled()
    const messages = agent!.snapshot().messages
    expect(messages.find((message) => message.id === first.id)!.state).toBe('cancelled')
    expect(messages.some((message) => message.content === 'Partial\n\n_(stopped)_')).toBe(true)
    expect(messages.at(-1)).toMatchObject({ role: 'assistant', content: 'Okay.' })
  })

  it('starts a new conversation on reset and keeps memory', async () => {
    await store.memory.write('MEMORY.md', '# Kept')
    await start()
    await agent!.send('hello')
    await settled()
    await agent!.reset()
    expect(agent!.snapshot().messages).toEqual([])
    expect(events.at(-1)).toMatchObject({ type: 'manager.reset' })
    await agent!.send('again')
    await settled()
    expect(store.state().sdkSessionId).toBe('sdk-2')
    expect(sdk.sessions.get('sdk-2')!.prompts[0]).toContain('# Kept')
    expect(sdk.sessions.get('sdk-2')!.prompts[0]).not.toContain('runtime was lost')
  })

  it('stops an idle runtime and resumes the same conversation later', async () => {
    await start({ idleStopMs: 20 })
    await agent!.send('hello')
    await settled()
    await vi.waitFor(() => expect(sdk.clients[0].stop).toHaveBeenCalled())
    await agent!.send('again')
    await settled()
    expect(sdk.clients[1].resumeSession).toHaveBeenCalledWith('sdk-1', expect.anything())
  })

  it('lists skills through the runtime for delegated prompts', async () => {
    let listing: unknown
    sdk.behaviors.push(async (fakeSession) => {
      listing = await fakeSession.tool('list_skills')({})
      reply('ok')(fakeSession, '')
    })
    await start()
    await agent!.send('which skills?')
    await settled()
    expect(String(listing)).toContain('brainstorming — Explore first (personal)')
  })
})
