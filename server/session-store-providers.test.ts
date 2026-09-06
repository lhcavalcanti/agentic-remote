import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RuntimeModelOption, ServerEvent, SessionDetail } from '../shared/contracts.js'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
} from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { SessionStore, type QueuedPromptReservation } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile), rm: vi.fn(fs.rm) }
})

const disk = await vi.importActual<typeof import('node:fs/promises')>(
  'node:fs/promises',
)
const fixtures: { directory: string; store: SessionStore }[] = []
const releases: (() => void)[] = []

async function holdOtherWrite(store: SessionStore, source = store.get('session')!) {
  await store.create({ ...source, id: 'other' })
  let started = () => {}
  let finish = () => {}
  const began = new Promise<void>((resolve) => { started = resolve })
  const gate = new Promise<void>((resolve) => { finish = resolve })
  releases.push(finish)
  vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
    started()
    await gate
    return disk.writeFile(...args)
  })
  const writing = store.renameSession('other', 'Unrelated write')
  await began
  return { finish, writing }
}

function event(type: SessionEvent['type'], data: object): SessionEvent {
  return {
    id: `event-${type}`,
    parentId: null,
    timestamp: '2026-09-04T01:00:00.000Z',
    type,
    data,
  } as SessionEvent
}

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'store-providers-'))
  vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot'))
  const store = new SessionStore(directory)
  fixtures.push({ directory, store })
  await store.initialize()
  await store.create({
    id: 'session',
    cwd: directory,
    title: 'Session',
    status: 'idle',
    isOpen: true,
    updatedAt: '2026-09-04T00:00:00.000Z',
    messages: [],
    queuedPrompts: ['first', 'second'].map((id) => ({
      id, content: id, createdAt: '2026-09-04T00:00:00.000Z',
    })),
    queuedCount: 2,
  }, { managedOpen: true, backend: 'sdk' })
  const blockedWrite = path.join(directory, 'state.json.tmp')
  return {
    directory,
    store,
    block: () => mkdir(blockedWrite),
    unblock: () => rm(blockedWrite, { recursive: true }),
  }
}

function copilot(
  store: SessionStore,
  history?: SessionEvent[],
  activeSessionReader: NonNullable<ConstructorParameters<typeof AgentService>[2]> = async () => [],
  eventVersion?: NonNullable<ConstructorParameters<typeof AgentService>[5]>,
) {
  const resumeSession = vi.fn(async () => {
    throw new Error('A provider must not run before a durable dequeue')
  })
  const client: CopilotClientLike = {
    start: async () => {},
    stop: async () => [],
    listSessions: async () => [],
    deleteSession: async () => {},
    createSession: resumeSession,
    resumeSession,
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
    },
  }
  const terminal = {
    has: vi.fn(async (_sessionId: string) => true),
    send: vi.fn(async () => true),
    cancel: vi.fn(async () => true),
  }
  const workspaceReader = vi.fn<NonNullable<ConstructorParameters<typeof AgentService>[7]>>(
    async () => undefined,
  )
  const workspaceVersion = vi.fn<NonNullable<ConstructorParameters<typeof AgentService>[8]>>(
    async () => undefined,
  )
  const service = new AgentService(
    store,
    client,
    activeSessionReader,
    async () => {},
    async () => history || [],
    eventVersion ?? (async () => history ? 'events-v1' : undefined),
    terminal,
    workspaceReader,
    workspaceVersion,
  )
  return { service, client, terminal, resumeSession, workspaceReader, workspaceVersion }
}

function sdkSession(sessionId: string) {
  const listeners = new Set<(event: SessionEvent) => void>()
  const session: CopilotSessionLike & { emit(event: SessionEvent): void } = {
    sessionId,
    on: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    emit: (incoming) => {
      for (const listener of listeners) listener(incoming)
    },
    sendAndWait: vi.fn(async () => undefined),
    getEvents: async () => [],
    abort: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    rpc: {
      commands: {
        list: async () => ({ commands: [] }),
        invoke: async () => ({ kind: 'text', text: 'Unused' }),
        enqueue: async () => ({ queued: true }),
      },
      name: { set: async () => {} },
      model: {
        getCurrent: async () => ({ modelId: 'configured-model' }),
        switchTo: async () => ({ modelId: 'configured-model' }),
      },
      mode: { set: async () => {} },
    },
  }
  return session
}

async function clearFixture(failure?: 'model' | 'mode' | 'create') {
  const { store, directory } = await fixture()
  await store.update('session', (stored) => {
    stored.runtime = { model: 'configured-model', contextTier: 'default', mode: 'plan' }
  })
  const { service, client } = copilot(store)
  const published: ServerEvent[] = []
  service.on('event', (value) => published.push(value))
  const replacing = vi.spyOn(store, 'replaceWithClearedSession')
  let fresh: ReturnType<typeof sdkSession> | undefined
  client.createSession = vi.fn(async (config) => {
    if (failure === 'create') throw new Error('SDK creation failed')
    const created = sdkSession(config.sessionId!)
    fresh = created
    created.rpc.model.switchTo = vi.fn(async () => {
      expect(replacing).not.toHaveBeenCalled()
      expect(store.get(created.sessionId)).toBeUndefined()
      created.emit(event('session.model_change', { newModel: 'effective-model' }))
      await store.flush()
      if (failure === 'model') throw new Error('Model configuration failed')
      return { modelId: 'effective-model' }
    })
    created.rpc.mode.set = vi.fn(async () => {
      expect(replacing).not.toHaveBeenCalled()
      expect(store.get(created.sessionId)).toBeUndefined()
      created.emit(event('session.mode_changed', { newMode: 'plan' }))
      await store.flush()
      if (failure === 'mode') throw new Error('Mode configuration failed')
    })
    return created
  })
  return { store, directory, service, client, replacing, published, fresh: () => fresh }
}

function handleEvent(service: AgentService, incoming: SessionEvent) {
  ;(service as unknown as {
    handleSessionEvent(id: string, incoming: SessionEvent): void
  }).handleSessionEvent('session', incoming)
}

function claude(store: SessionStore) {
  const query = vi.fn(() => {
    throw new Error('A provider must not run before a durable dequeue')
  })
  const sdk: ClaudeSdk = {
    query,
    getSessionInfo: async () => undefined,
    deleteSession: vi.fn(async () => {}),
    renameSession: async () => {},
  }
  const service = new ClaudeAgentService(
    store,
    '/unused-test-provider',
    sdk,
    async () => ({ loggedIn: true }),
  )
  return { service, query, deleteSession: sdk.deleteSession }
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', tmpdir())
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rm).mockReset().mockImplementation(disk.rm)
})

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.allSettled(fixtures.map(({ store }) => store.flush()))
  await Promise.all(
    fixtures.splice(0).map(({ directory }) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('Copilot candidate event reductions', () => {
  it('composes pending permission and mode events without restoring allow-all', async () => {
    const { store, directory } = await fixture()
    await store.update('session', (stored) => {
      stored.runtime = { allowAllPermissions: true, mode: 'interactive' }
    })
    const { service } = copilot(store)
    const gate = await holdOtherWrite(store)
    handleEvent(service, event('session.permissions_changed', { allowAllPermissions: false }))
    handleEvent(service, event('session.mode_changed', { newMode: 'plan' }))
    expect(store.get('session')?.runtime).toEqual({
      allowAllPermissions: true, mode: 'interactive',
    })
    gate.finish()
    await gate.writing
    await store.flush()
    expect(store.get('session')?.runtime).toMatchObject({
      allowAllPermissions: false, mode: 'plan',
    })
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.runtime).toMatchObject({
      allowAllPermissions: false, mode: 'plan',
    })
  })

  it.each([
    ['cwd', 'session.context_changed', 'cwd'],
    ['title', 'session.title_changed', 'title'],
  ] as const)('keeps the final %s event when it returns to the committed value', async (field, type, key) => {
    const { store } = await fixture()
    const { service } = copilot(store)
    const original = store.get('session')![field]
    const gate = await holdOtherWrite(store)
    handleEvent(service, event(type, { [key]: '/elsewhere' }))
    handleEvent(service, event(type, { [key]: original }))
    gate.finish()
    await gate.writing
    await store.flush()
    expect(store.get('session')![field]).toBe(original)
  })

  it('reduces transcript runtime, notices, and pending questions from the candidate', async () => {
    const { store } = await fixture()
    await store.update('session', (stored) => {
      stored.runtime = { allowAllPermissions: true, mode: 'interactive' }
    })
    const { service } = copilot(store, [
      event('session.mode_changed', { newMode: 'plan' }),
    ])
    ;(service as unknown as { externalSessionIds: Set<string> })
      .externalSessionIds.add('session')
    const gate = await holdOtherWrite(store)
    handleEvent(service, event('session.permissions_changed', { allowAllPermissions: false }))
    const notice = store.addMessage('session', {
      id: 'notice',
      role: 'notice',
      content: 'Keep this queued notice',
      createdAt: '2026-09-04T00:30:00.000Z',
    })
    const question = store.update('session', (stored) => {
      stored.pendingUserInput = {
        requestId: 'terminal:current',
        question: 'Continue?',
        choices: ['Yes'],
        allowFreeform: false,
      }
      stored.status = 'waiting'
    })
    const replace = vi.spyOn(store, 'replaceTranscript')
    const refreshing = service.refreshTranscripts()
    await vi.waitFor(() => expect(replace).toHaveBeenCalled())
    gate.finish()
    await Promise.all([gate.writing, notice, question, refreshing])
    expect(store.get('session')).toMatchObject({
      runtime: { allowAllPermissions: false, mode: 'plan' },
      messages: [expect.objectContaining({ id: 'notice' })],
      pendingUserInput: { requestId: 'terminal:current' },
      status: 'waiting',
    })
  })

  it('does not publish or retain rejected permission and mode events', async () => {
    const { store } = await fixture()
    await store.update('session', (stored) => {
      stored.runtime = { allowAllPermissions: true, mode: 'interactive' }
    })
    const { service } = copilot(store)
    const published: ServerEvent[] = []
    service.on('event', (value) => published.push(value))
    const gate = await holdOtherWrite(store)
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
    handleEvent(service, event('session.permissions_changed', { allowAllPermissions: false }))
    handleEvent(service, event('session.mode_changed', { newMode: 'plan' }))
    gate.finish()
    await gate.writing
    await expect(store.flush()).rejects.toThrow('disk full')
    await vi.waitFor(() => expect(published).toHaveLength(2))
    expect(published.every((value) => value.type === 'error')).toBe(true)
    expect(store.get('session')?.runtime).toEqual({
      allowAllPermissions: true, mode: 'interactive',
    })
  })

  it('does not write or publish a runtime event that is a candidate no-op', async () => {
    const { store } = await fixture()
    await store.update('session', (stored) => {
      stored.runtime = { allowAllPermissions: false, mode: 'plan' }
    })
    const { service } = copilot(store)
    const published = vi.fn()
    service.on('event', published)
    vi.mocked(writeFile).mockClear()
    handleEvent(service, event('session.mode_changed', { newMode: 'plan' }))
    await store.flush()
    expect(writeFile).not.toHaveBeenCalled()
    expect(published).not.toHaveBeenCalled()
  })

  it('retains metadata events behind an already-queued SDK creation', async () => {
    const { store, directory } = await fixture()
    const { service, client } = copilot(store)
    const fresh = sdkSession('created')
    client.createSession = vi.fn(async () => fresh)
    const published: ServerEvent[] = []
    service.on('event', (value) => published.push(value))
    const gate = await holdOtherWrite(store)
    const admitted = vi.spyOn(store, 'create')
    const creating = service.createSession(directory)
    await vi.waitFor(() => expect(admitted).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'created' }),
      { managedOpen: true, backend: 'sdk' },
    ))
    expect(store.get('created')).toBeUndefined()
    fresh.emit(event('session.permissions_changed', { allowAllPermissions: false }))
    gate.finish()
    await Promise.all([gate.writing, creating])
    await store.flush()
    expect(store.get('created')?.runtime?.allowAllPermissions).toBe(false)
    expect(published.filter((value) => value.type === 'error')).toEqual([])
  })

  it('retains metadata emitted synchronously when the SDK listener is registered', async () => {
    const { store, directory } = await fixture()
    const { service, client } = copilot(store)
    const fresh = sdkSession('created')
    const subscribe = fresh.on
    const admitted = vi.spyOn(store, 'create')
    fresh.on = (listener) => {
      const unsubscribe = subscribe(listener)
      expect(admitted).not.toHaveBeenCalled()
      fresh.emit(event('session.permissions_changed', { allowAllPermissions: false }))
      return unsubscribe
    }
    client.createSession = vi.fn(async () => fresh)
    const published: ServerEvent[] = []
    service.on('event', (value) => published.push(value))
    await service.createSession(directory)
    await store.flush()
    expect(store.get('created')?.runtime?.allowAllPermissions).toBe(false)
    expect(published.filter((value) => value.type === 'error')).toEqual([])
  })

  it('clears a terminal update notice even when its addition is not committed yet', async () => {
    const { store } = await fixture()
    const { service, terminal } = copilot(store)
    Object.assign(terminal, { updateNotice: async () => 'New CLI available' })
    const internals = service as unknown as {
      syncTerminalUpdateNotice(id: string): Promise<void>
      clearUpdateNoticeForExited(ids: Set<string>): Promise<void>
    }
    const gate = await holdOtherWrite(store)
    const observed = vi.spyOn(store, 'updateIf')
    const showing = internals.syncTerminalUpdateNotice('session')
    await vi.waitFor(() => expect(observed).toHaveBeenCalled())
    const clearing = internals.clearUpdateNoticeForExited(new Set(['session']))
    gate.finish()
    await Promise.all([gate.writing, showing, clearing])
    expect(store.get('session')?.runtime?.updateAvailable).toBeUndefined()
  })

  it('does not skip a workspace return to its committed folder and title', async () => {
    const { store } = await fixture()
    const { service, workspaceReader, workspaceVersion } = copilot(store)
    const original = store.get('session')!
    workspaceVersion.mockResolvedValue('workspace-v1')
    workspaceReader.mockResolvedValue({ cwd: original.cwd, title: original.title })
    const gate = await holdOtherWrite(store)
    const update = vi.spyOn(store, 'syncWorkspaceMetadata')
    const moving = store.syncWorkspaceMetadata('session', { cwd: '/elsewhere', title: 'Elsewhere' })
    const refreshing = (service as unknown as {
      syncExternalWorkspace(id: string): Promise<void>
    }).syncExternalWorkspace('session')
    await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(2))
    gate.finish()
    await Promise.all([gate.writing, moving, refreshing])
    expect(store.get('session')).toMatchObject({ cwd: original.cwd, title: original.title })
  })

  it('retries an unchanged workspace version after its state write fails', async () => {
    const { store } = await fixture()
    const { service, workspaceReader, workspaceVersion } = copilot(store)
    workspaceVersion.mockResolvedValue('workspace-v1')
    workspaceReader.mockResolvedValue({ cwd: '/elsewhere', title: 'Elsewhere' })
    const refresh = () => (service as unknown as {
      syncExternalWorkspace(id: string): Promise<void>
    }).syncExternalWorkspace('session')
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
    await expect(refresh()).rejects.toThrow('disk full')
    await refresh()
    expect(store.get('session')).toMatchObject({ cwd: '/elsewhere', title: 'Elsewhere' })
  })

  it.each([false, true])('retains a timestamp-only workspace update (first write fails: %s)', async (failFirst) => {
    const { store, directory } = await fixture()
    const { service, workspaceReader, workspaceVersion } = copilot(store)
    const before = store.get('session')!
    const updatedAt = '2026-09-05T12:00:00.000Z'
    workspaceVersion.mockResolvedValue('workspace-newer-time')
    workspaceReader.mockResolvedValue({ cwd: before.cwd, title: before.title, updatedAt })
    const refresh = () => (service as unknown as {
      syncExternalWorkspace(id: string): Promise<void>
    }).syncExternalWorkspace('session')
    if (failFirst) {
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('timestamp write refused'))
      await expect(refresh()).rejects.toThrow('timestamp write refused')
      expect(store.get('session')?.updatedAt).toBe(before.updatedAt)
    }
    await refresh()
    expect(store.get('session')?.updatedAt).toBe(updatedAt)
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.updatedAt).toBe(updatedAt)
    await refresh()
    expect(workspaceReader).toHaveBeenCalledTimes(failFirst ? 2 : 1)
  })

  it('does not reconcile an idle event over a newly admitted question', async () => {
    const { store } = await fixture()
    await store.update('session', (stored) => { stored.status = 'running' })
    const { service } = copilot(store, [event('session.idle', {})])
    const internals = service as unknown as {
      externalSessionIds: Set<string>
      reconcileRuntimeStatus(session: SessionDetail): Promise<SessionDetail>
    }
    internals.externalSessionIds.add('session')
    const gate = await holdOtherWrite(store)
    const reconciling = internals.reconcileRuntimeStatus(store.get('session')!)
    const waiting = store.update('session', (stored) => {
      stored.pendingUserInput = {
        requestId: 'terminal:question', question: 'Continue?', choices: ['Yes'], allowFreeform: false,
      }
      stored.status = 'waiting'
    })
    gate.finish()
    const [reconciled] = await Promise.all([reconciling, waiting, gate.writing])
    expect(reconciled).toMatchObject({
      status: 'waiting', pendingUserInput: { requestId: 'terminal:question' },
    })
  })
})

describe('SDK metadata during clear', () => {
  it('defers configuration metadata until the replacement identity exists', async () => {
    const { service, store, directory, published, replacing } = await clearFixture()
    const cleared = await service.clearConversation('session')
    await store.flush()
    expect(replacing).toHaveBeenCalledExactlyOnceWith('session', cleared.id)
    expect(published.filter((value) => value.type === 'error')).toEqual([])
    expect(published.slice(0, 2)).toEqual([
      { type: 'session.removed', sessionId: 'session', replacedBy: cleared.id },
      { type: 'session.upserted', session: cleared },
    ])
    expect(store.get('session')).toBeUndefined()
    expect(store.get(cleared.id)?.runtime).toMatchObject({
      model: 'effective-model', mode: 'plan',
    })
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get(cleared.id)?.runtime).toMatchObject({
      model: 'effective-model', mode: 'plan',
    })
  })

  it.each(['model', 'mode'] as const)(
    'still reports a genuine %s RPC failure without rejecting the clear',
    async (failure) => {
      const { service, store, published, fresh } = await clearFixture(failure)
      const cleared = await service.clearConversation('session')
      await store.flush()
      expect(published.filter((value) => value.type === 'error')).toEqual([
        {
          type: 'error',
          sessionId: cleared.id,
          message: failure === 'model' ? 'Model configuration failed' : 'Mode configuration failed',
        },
      ])
      expect(fresh()?.rpc.model.switchTo).toHaveBeenCalledTimes(1)
      expect(fresh()?.rpc.mode.set).toHaveBeenCalledTimes(1)
      expect(store.get(cleared.id)).toBeDefined()
    },
  )

  it('preserves recovery when creation of the replacement SDK fails', async () => {
    const { service, store, published, replacing } = await clearFixture('create')
    const cleared = await service.clearConversation('session')
    expect(replacing).toHaveBeenCalledExactlyOnceWith('session', cleared.id)
    expect(store.get('session')).toBeUndefined()
    expect(store.get(cleared.id)).toBeDefined()
    expect(published.filter((value) => value.type === 'error')).toEqual([
      { type: 'error', sessionId: cleared.id, message: 'SDK creation failed' },
    ])
  })

  it('does not replay dependent metadata when the replacement write fails', async () => {
    const { service, store, published, fresh } = await clearFixture()
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
    await expect(service.clearConversation('session')).rejects.toThrow('disk full')
    expect(store.get('session')).toBeDefined()
    expect(store.get(fresh()!.sessionId)).toBeUndefined()
    expect(fresh()?.disconnect).toHaveBeenCalledOnce()
    expect(published).toEqual([])
    fresh()!.emit(event('session.permissions_changed', { allowAllPermissions: false }))
    await store.flush().catch(() => undefined)
    expect(published).toEqual([])
  })

  it('reports a replay write failure without rejecting an already-committed clear', async () => {
    const { service, store, published } = await clearFixture()
    vi.mocked(writeFile)
      .mockImplementationOnce(disk.writeFile)
      .mockRejectedValueOnce(new Error('Metadata persistence failed'))
    const cleared = await service.clearConversation('session')
    await expect(store.flush()).rejects.toThrow('Metadata persistence failed')
    await vi.waitFor(() => {
      expect(published.some((value) => value.type === 'error')).toBe(true)
    })
    expect(published.filter((value) => value.type === 'error')).toEqual([
      { type: 'error', sessionId: cleared.id, message: 'Metadata persistence failed' },
      { type: 'error', sessionId: cleared.id, message: 'Metadata persistence failed' },
    ])
    expect(store.get(cleared.id)).toBeDefined()
    expect(store.get('session')).toBeUndefined()
  })
})

describe('Provider decisions after admitted writes', () => {
  it.each(['before admission', 'during capture'] as const)(
    'waits for a terminal status write %s before admitting a slash command',
    async (timing) => {
      const { store } = await fixture()
      await store.setBackend('session', 'terminal')
      const { service, client, terminal } = copilot(store)
      client.createSession = vi.fn(async () => sdkSession('command-catalog'))
      let gate: Awaited<ReturnType<typeof holdOtherWrite>> | undefined
      let statusWrite: Promise<SessionDetail> | undefined
      const blockStatus = async () => {
        gate = await holdOtherWrite(store)
        statusWrite = store.updateStatus('session', 'running')
      }
      Object.assign(terminal, {
        capture: vi.fn(async () => {
          if (timing === 'during capture' && !gate) await blockStatus()
          return undefined
        }),
      })
      if (timing === 'before admission') await blockStatus()
      const result = service.executeCommand('session', '/unsafe')
        .then((session) => ({ session }), (error: unknown) => ({ error }))
      try {
        if (timing === 'during capture') {
          await vi.waitFor(() => expect(gate).toBeDefined())
        }
        await new Promise((resolve) => setImmediate(resolve))
        expect(terminal.send).not.toHaveBeenCalled()
      } finally {
        gate?.finish()
        await Promise.all([gate?.writing, statusWrite])
      }
      expect(await result).toMatchObject({
        error: expect.objectContaining({ message: expect.stringContaining('must be queued') }),
      })
      expect(terminal.send).not.toHaveBeenCalled()
    },
  )

  for (const [name, provider] of [['Copilot', copilot], ['Claude', claude]] as const) {
    it.each(['restartSession', 'clearConversation', 'suspendSession'] as const)(
      `${name} does not %s against a pending running transition`,
      async (operation) => {
        const { store } = await fixture()
        const runtime = provider(store)
        const gate = await holdOtherWrite(store)
        const running = store.updateStatus('session', 'running')
        const refused = expect(runtime.service[operation]('session')).rejects.toThrow(/idle/)
        gate.finish()
        await Promise.all([gate.writing, running, refused])
        expect(store.get('session')?.status).toBe('running')
        expect(store.get('session')?.suspended).not.toBe(true)
        if ('resumeSession' in runtime) expect(runtime.resumeSession).not.toHaveBeenCalled()
        if ('query' in runtime) expect(runtime.query).not.toHaveBeenCalled()
        if ('deleteSession' in runtime) expect(runtime.deleteSession).not.toHaveBeenCalled()
      },
    )

    it(`${name} does not configure runtime over a pending running transition`, async () => {
      const { store } = await fixture()
      const { service } = provider(store)
      const gate = await holdOtherWrite(store)
      const running = store.updateStatus('session', 'running')
      const refused = expect(service.configureRuntime('session', {
        model: 'model', contextTier: 'default',
      })).rejects.toThrow(/idle/)
      gate.finish()
      await Promise.all([gate.writing, running, refused])
      expect(store.get('session')?.runtime).toBeUndefined()
    })

    it(`${name} does not send into a pending suspension`, async () => {
      const { store } = await fixture()
      const runtime = provider(store)
      const gate = await holdOtherWrite(store)
      const suspending = store.setSuspended('session', true)
      const refused = expect(runtime.service.sendMessage('session', 'Do not deliver'))
        .rejects.toThrow(/Resume/)
      gate.finish()
      await Promise.all([gate.writing, suspending, refused])
      if ('terminal' in runtime) expect(runtime.terminal.send).not.toHaveBeenCalled()
      if ('query' in runtime) expect(runtime.query).not.toHaveBeenCalled()
    })

    it(`${name} does not clear a new permission while settling an earlier reply`, async () => {
      const { store } = await fixture()
      await store.update('session', (stored) => {
        stored.pendingPermission = {
          requestId: 'old', title: 'First permission', kind: 'shell',
          options: [{ optionId: 'allow-once', name: 'Allow', kind: 'allow_once' }],
        }
        stored.status = 'waiting'
      })
      const { service } = provider(store)
      const resolve = vi.fn()
      ;(service as unknown as {
        permissions: Map<string, { sessionId: string; input: object; resolve: typeof resolve }>
      }).permissions.set('old', { sessionId: 'session', input: {}, resolve })
      const gate = await holdOtherWrite(store)
      const next = store.update('session', (stored) => {
        stored.pendingPermission = { ...stored.pendingPermission!, requestId: 'new', title: 'Second permission' }
      })
      const reply = service.replyPermission('session', 'old', 'allow-once')
      gate.finish()
      const [replied] = await Promise.all([reply, next, gate.writing])
      expect(resolve).toHaveBeenCalledTimes(1)
      expect(replied).toMatchObject({
        pendingPermission: { requestId: 'new' }, status: 'waiting',
      })
    })
  }

  it('does not clear a new Copilot question while settling an earlier reply', async () => {
    const { store } = await fixture()
    await store.update('session', (stored) => {
      stored.pendingUserInput = {
        requestId: 'old', question: 'First?', choices: ['Yes'], allowFreeform: false,
      }
      stored.status = 'waiting'
    })
    const { service } = copilot(store)
    const resolve = vi.fn()
    ;(service as unknown as {
      userInputs: Map<string, { sessionId: string; resolve: typeof resolve }>
    }).userInputs.set('old', { sessionId: 'session', resolve })
    const gate = await holdOtherWrite(store)
    const next = store.update('session', (stored) => {
      stored.pendingUserInput = { ...stored.pendingUserInput!, requestId: 'new', question: 'Second?' }
    })
    const reply = service.replyUserInput('session', 'old', { answer: 'Yes', wasFreeform: false })
    gate.finish()
    const [replied] = await Promise.all([reply, next, gate.writing])
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(replied).toMatchObject({
      pendingUserInput: { requestId: 'new' }, status: 'waiting',
    })
  })

  it('rechecks the Claude candidate status after the model-catalog await', async () => {
    const { store } = await fixture()
    const { service } = claude(store)
    const model: RuntimeModelOption = {
      id: 'model', name: 'Model', reasoningEfforts: [], contextTiers: ['default'],
    }
    ;(service as unknown as { models: RuntimeModelOption[] }).models = [model]
    vi.spyOn(service, 'providerRuntimeOptions').mockImplementation(async () => {
      await store.updateStatus('session', 'running')
      return { models: [model] }
    })
    await expect(service.configureRuntime('session', {
      model: 'model', contextTier: 'default',
    })).rejects.toThrow(/idle/)
    expect(store.get('session')?.runtime).toBeUndefined()
  })
})

describe('Provider queue persistence boundaries', () => {
  const drainTerminal = (service: AgentService) =>
    (service as unknown as { drainTerminalQueue(id: string): Promise<void> }).drainTerminalQueue('session')

  it.each([['Copilot', copilot], ['Claude', claude]] as const)(
    '%s retains queued text when turn admission and all later writes fail',
    async (_name, provider) => {
      const { store, directory } = await fixture()
      const runtime = provider(store)
      const sdk = sdkSession('session')
      if ('client' in runtime) runtime.client.resumeSession = vi.fn(async () => sdk)
      const failure = new Error('Persistent turn-admission outage')
      vi.mocked(writeFile).mockImplementationOnce(disk.writeFile).mockRejectedValue(failure)
      if ('client' in runtime) {
        await (runtime.service as unknown as { drainSdkQueue(id: string): Promise<void> }).drainSdkQueue('session')
        expect(sdk.sendAndWait).not.toHaveBeenCalled()
      } else {
        await expect((runtime.service as unknown as { drainQueue(id: string): Promise<void> }).drainQueue('session'))
          .rejects.toBe(failure)
        expect(runtime.query).not.toHaveBeenCalled()
      }
      expect(store.get('session')).toMatchObject({
        queuedPrompts: [{ id: 'first', content: 'first' }, { id: 'second', content: 'second' }],
        queuedCount: 2,
        messages: [],
      })
      const persisted = JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8'))
      expect(persisted.sessions.session.queuedPrompts.map((entry: { id: string }) => entry.id))
        .toEqual(['first', 'second'])
      const reloaded = new SessionStore(directory)
      await reloaded.initialize()
      expect(reloaded.get('session')?.queuedPrompts?.map((entry) => entry.id)).toEqual(['first', 'second'])
      expect(reloaded.get('session')).not.toHaveProperty('queuedPromptReservation')
    },
  )

  it('rechecks native liveness before retrying an accepted command settlement', async () => {
    const { store, directory } = await fixture()
    await store.update('session', (session) => {
      session.queuedPrompts![0] = { ...session.queuedPrompts![0], command: true, content: '/usage' }
    })
    const history: SessionEvent[] = []
    let version = 0
    const { service, terminal } = copilot(store, history, async () => [{
      id: 'session', cwd: directory, title: 'Session', updatedAt: '2026-09-04T00:00:00.000Z',
    }], async () => `events-${version}`)
    const composer = [
      '\u257b\u2584\u2584\u2584\u2584',
      '\u2503',
      '\u2579\u2580\u2580\u2580\u2580',
      ' / commands',
    ].join('\n')
    let pane = composer
    Object.assign(terminal, { capture: vi.fn(async () => pane) })
    await service.refreshDiscovery()
    terminal.send.mockImplementationOnce(async () => {
      pane = ` \u25cf Usage: 42 requests\n${composer}`
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('Command settlement refused'))
      return true
    })
    await drainTerminal(service)
    expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', '/usage', false)
    pane = `${composer}\n Working \u00b7 esc interrupt`
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000)
    await service.refreshTranscripts()
    expect(terminal.send).toHaveBeenCalledOnce()
    expect(store.get('session')).toMatchObject({ status: 'running', queuedCount: 1 })
    pane = composer
    history.push({ ...event('session.idle', {}), timestamp: new Date(Date.now() + 1_000).toISOString() })
    version += 1
    await service.refreshTranscripts()
    expect(terminal.send.mock.calls).toEqual([
      ['session', '/usage', false], ['session', 'second', false],
    ])
  })

  it('does not deliver a terminal queue item before its claim is durable', async () => {
    const { store, block } = await fixture()
    const { service, terminal } = copilot(store)
    const before = store.get('session')
    await block()
    await (service as unknown as { drainTerminalQueue(id: string): Promise<void> })
      .drainTerminalQueue('session')
    expect(terminal.send).not.toHaveBeenCalled()
    expect(store.get('session')).toEqual(before)
  })

  it('retries a refused claim after storage recovers with no new terminal events', async () => {
    const { store, directory } = await fixture()
    const { service, terminal } = copilot(store, [event('session.idle', {})], async () => [{
      id: 'session', cwd: directory, title: 'Session', updatedAt: '2026-09-04T00:00:00.000Z',
    }])
    await service.refreshDiscovery()
    const claim = store.claimTerminalQueuedPrompt.bind(store)
    vi.spyOn(store, 'claimTerminalQueuedPrompt').mockImplementationOnce((...args) => {
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('claim write refused'))
      return claim(...args)
    })
    await service.refreshTranscripts()
    expect(terminal.send).not.toHaveBeenCalled()
    expect(store.get('session')?.queuedCount).toBe(2)
    await service.refreshTranscripts()
    expect(terminal.send).not.toHaveBeenCalled()
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000)
    await service.refreshTranscripts()
    expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', 'first', false)
    expect(store.get('session')?.queuedCount).toBe(1)
  })

  it('does not claim FIFO work while an immediate terminal send owns admission', async () => {
    const { store } = await fixture()
    const { service, terminal } = copilot(store, [])
    let enter = () => {}
    let finish = () => {}
    const entered = new Promise<void>((resolve) => { enter = resolve })
    const gate = new Promise<void>((resolve) => { finish = resolve })
    releases.push(finish)
    terminal.send.mockImplementationOnce(async () => {
      enter()
      await gate
      return true
    })
    const sending = service.sendMessage('session', 'Immediate prompt')
    await entered
    await drainTerminal(service)
    expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', 'Immediate prompt', false)
    expect(store.terminalQueueDispatch('session')).toBeUndefined()
    expect(store.get('session')?.queuedCount).toBe(2)
    finish()
    await sending
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000)
    await service.refreshTranscripts()
    expect(terminal.send).toHaveBeenCalledOnce()
    const dispatchAt = store.queueDispatchAt('session')!
    await store.clearQueueDispatch('session', dispatchAt)
    await store.updateStatus('session', 'idle')
    vi.mocked(Date.now).mockReturnValue(Date.now() + 1_000)
    await service.refreshTranscripts()
    expect(terminal.send.mock.calls).toEqual([
      ['session', 'Immediate prompt', false], ['session', 'first', false],
    ])
    expect(store.get('session')?.queuedPrompts).toEqual([expect.objectContaining({ id: 'second' })])
  })

  it.each(['answered', 'overlay'] as const)(
    'retries only queued command observation after a capture failure (%s)',
    async (result) => {
      const { store } = await fixture()
      await store.update('session', (session) => {
        session.queuedPrompts![0] = { ...session.queuedPrompts![0], command: true, content: '/usage' }
      })
      const { service, terminal } = copilot(store)
      const composer = [
        '\u257b\u2584\u2584\u2584\u2584',
        '\u2503',
        '\u2579\u2580\u2580\u2580\u2580',
        ' \u2190 open sidebar \u00b7 / commands \u00b7 ? help',
      ].join('\n')
      const before = [' \u25cf Tip: /plugin', composer].join('\n')
      const after = result === 'overlay'
        ? 'Select a model\n > fixture-model\n esc close \u00b7 enter select'
        : [' \u25cf Tip: /plugin', ' \u25cf Usage: 42 requests', composer].join('\n')
      const capture = vi.fn(async () => after)
        .mockResolvedValueOnce(before)
        .mockRejectedValueOnce(new Error('Temporary pane read error'))
      Object.assign(terminal, { capture })
      await drainTerminal(service)
      expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', '/usage', false)
      expect(store.terminalQueueDispatch('session')).toBeDefined()
      expect(store.get('session')?.messages).toEqual([])
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000)
      await service.refreshTranscripts()
      expect(store.terminalQueueDispatch('session')).toBeUndefined()
      expect(store.get('session')?.messages).toEqual([
        expect.objectContaining({
          role: 'notice',
          content: expect.stringContaining(result === 'overlay' ? 'interactive view' : '42 requests'),
        }),
      ])
      if (result === 'overlay') {
        expect(store.get('session')?.status).toBe('idle')
        expect(terminal.send).toHaveBeenCalledOnce()
        vi.mocked(Date.now).mockReturnValue(Date.now() + 1_000)
        await service.refreshTranscripts()
        expect(terminal.send).toHaveBeenCalledOnce()
        capture.mockResolvedValue(before)
        vi.mocked(Date.now).mockReturnValue(Date.now() + 1_000)
        await service.refreshTranscripts()
      }
      expect(terminal.send.mock.calls).toEqual([
        ['session', '/usage', false], ['session', 'second', false],
      ])
      expect(store.get('session')?.queuedCount).toBe(0)
      expect(store.get('session')?.messages).toHaveLength(1)
    },
  )

  it.each([false, true])('does not repeat delivered terminal work after its completion write fails (restart=%s)', async (restart) => {
    const { store, directory } = await fixture()
    const { service, terminal } = copilot(store)
    const drain = (target: AgentService) =>
      (target as unknown as { drainTerminalQueue(id: string): Promise<void> }).drainTerminalQueue('session')
    terminal.send.mockImplementationOnce(async () => {
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('completion write refused'))
      return true
    })
    await drain(service)
    expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', 'first', false)
    if (restart) {
      const reloaded = new SessionStore(directory)
      await reloaded.initialize()
      const next = copilot(reloaded)
      await drain(next.service)
      expect(next.terminal.send).not.toHaveBeenCalled()
      expect(reloaded.get('session')).toMatchObject({
        failedPrompt: { content: 'first', uncertain: true },
        queuedPrompts: [{ id: 'second' }],
      })
    } else {
      await drain(service)
      expect(terminal.send).toHaveBeenCalledOnce()
    }
  })

  it.each(['accepted', 'refused', 'uncertain'] as const)(
    'retries only settlement after a terminal %s outcome, even without an active discovery entry',
    async (outcome) => {
      const { store, directory } = await fixture()
      const { service, terminal } = copilot(store)
      const published: ServerEvent[] = []
      service.on('event', (value) => published.push(value))
      terminal.send.mockImplementationOnce(async () => {
        const persisted = JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8'))
        expect(persisted.sessions.session).toMatchObject({
          failedPrompt: { content: 'first', uncertain: true },
          queuedPrompts: [{ id: 'second' }],
          terminalQueueDispatch: { id: expect.any(String) },
        })
        expect(store.get('session')?.failedPrompt).toBeUndefined()
        vi.mocked(writeFile).mockRejectedValueOnce(new Error('settlement refused'))
        if (outcome !== 'accepted') {
          throw Object.assign(new Error('Terminal delivery failed'), outcome === 'uncertain' ? { uncertainDelivery: true } : {})
        }
        return true
      })
      await drainTerminal(service)
      expect(store.terminalQueueDispatch('session')).toBeDefined()
      expect(store.get('session')?.failedPrompt).toBeUndefined()
      expect(published.filter((value) => value.type === 'error')).toEqual([
        expect.objectContaining({ message: expect.stringContaining('held pending durable delivery confirmation') }),
      ])
      expect(published.some((value) => value.type === 'error' && value.failedPrompt)).toBe(false)
      await service.refreshTranscripts()
      expect(store.terminalQueueDispatch('session')).toBeDefined()
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000)
      await service.refreshTranscripts()
      expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', 'first', false)
      expect(store.terminalQueueDispatch('session')).toBeUndefined()
      const reloaded = new SessionStore(directory)
      await reloaded.initialize()
      if (outcome === 'accepted') {
        expect(reloaded.get('session')?.failedPrompt).toBeUndefined()
        expect(store.get('session')?.status).toBe('running')
      } else {
        expect(reloaded.get('session')?.failedPrompt).toMatchObject({
          content: 'first',
        })
        expect(reloaded.get('session')?.failedPrompt?.uncertain)
          .toBe(outcome === 'uncertain' ? true : undefined)
        expect(published.filter((value) => value.type === 'error').at(-1)).toMatchObject({
          failedPrompt: 'first',
          failedPromptAt: reloaded.get('session')?.failedPrompt?.failedAt,
          message: 'Terminal delivery failed',
        })
      }
    },
  )

  it.each(['sendMessage', 'executeCommand', 'clearConversation', 'restartSession', 'suspendSession'] as const)(
    'refuses %s while an idle native completion still has an unsettled queue claim',
    async (method) => {
      const { store } = await fixture()
      const { service, terminal } = copilot(store)
      await store.claimTerminalQueuedPrompt('session', store.get('session')!.queuedPrompts![0], () => true)
      await store.updateStatus('session', 'idle')
      const attempt = method === 'sendMessage'
        ? service.sendMessage('session', 'first')
        : method === 'executeCommand'
          ? service.executeCommand('session', '/status')
          : service[method]('session')
      await expect(attempt).rejects.toThrow(/confirmation|idle/)
      expect(terminal.send).not.toHaveBeenCalled()
      expect(store.terminalQueueDispatch('session')).toBeDefined()
    },
  )

  it('continues after a delayed native completion without restoring the previous dispatch clock', async () => {
    const { store } = await fixture()
    const { service, terminal } = copilot(store)
    terminal.send.mockImplementationOnce(async () => {
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('settlement refused'))
      return true
    })
    await drainTerminal(service)
    const dispatchAt = store.queueDispatchAt('session')!
    await store.clearQueueDispatch('session', dispatchAt)
    await store.updateStatus('session', 'idle')
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000)
    await service.refreshTranscripts()
    expect(terminal.send.mock.calls).toEqual([
      ['session', 'first', false], ['session', 'second', false],
    ])
    expect(store.get('session')).toMatchObject({ status: 'running', queuedCount: 0 })
    expect(store.queueDispatchAt('session')).not.toBe(dispatchAt)
    expect(store.terminalQueueDispatch('session')).toBeUndefined()
  })

  it('settles queued command feedback once before continuing after a write refusal', async () => {
    const { store } = await fixture()
    await store.update('session', (session) => {
      session.queuedPrompts![0] = { ...session.queuedPrompts![0], command: true, content: '/usage' }
    })
    const { service, terminal } = copilot(store)
    terminal.send.mockImplementationOnce(async () => {
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('command settlement refused'))
      return true
    })
    await drainTerminal(service)
    expect(store.get('session')?.messages).toEqual([])
    expect(terminal.send).toHaveBeenCalledOnce()
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1_000)
    await service.refreshTranscripts()
    expect(terminal.send.mock.calls).toEqual([
      ['session', '/usage', false], ['session', 'second', false],
    ])
    expect(store.get('session')?.messages).toEqual([
      expect.objectContaining({ role: 'notice', content: '/usage' }),
    ])
    await service.refreshTranscripts()
    expect(store.get('session')?.messages).toHaveLength(1)
    expect(terminal.send).toHaveBeenCalledTimes(2)
  })

  it('does not send or write again after stopping during terminal delivery', async () => {
    const { store, directory } = await fixture()
    const { service, terminal } = copilot(store)
    let finish = () => {}
    let enter = () => {}
    const entered = new Promise<void>((resolve) => { enter = resolve })
    const gate = new Promise<void>((resolve) => { finish = resolve })
    releases.push(finish)
    terminal.send.mockImplementationOnce(async () => {
      enter()
      await gate
      return true
    })
    const draining = drainTerminal(service)
    await entered
    let stopped = false
    const stopping = service.stop().then(() => { stopped = true })
    await new Promise((resolve) => setImmediate(resolve))
    expect(stopped).toBe(false)
    finish()
    await Promise.all([draining, stopping])
    const writes = vi.mocked(writeFile).mock.calls.length
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 60_000)
    await service.refreshTranscripts()
    await drainTerminal(service)
    expect(terminal.send).toHaveBeenCalledOnce()
    expect(writeFile).toHaveBeenCalledTimes(writes)
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')).toMatchObject({
      failedPrompt: { content: 'first', uncertain: true },
      queuedPrompts: [{ id: 'second' }],
    })
  })

  it('keeps recovered terminal work held if discovery routes the queue through SDK recovery', async () => {
    const { store, directory } = await fixture()
    await store.claimTerminalQueuedPrompt('session', store.get('session')!.queuedPrompts![0], () => true)
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    const { service, resumeSession } = copilot(reloaded)
    await (service as unknown as { drainSdkQueue(id: string): Promise<void> }).drainSdkQueue('session')
    expect(resumeSession).not.toHaveBeenCalled()
    expect(reloaded.get('session')).toMatchObject({
      failedPrompt: { content: 'first', uncertain: true },
      queuedPrompts: [{ id: 'second' }],
    })
  })

  it('does not leave an unowned claim when suspension arrives during its write', async () => {
    const { store } = await fixture()
    const { service, terminal } = copilot(store)
    let enter = () => {}
    let finish = () => {}
    const entered = new Promise<void>((resolve) => { enter = resolve })
    const gate = new Promise<void>((resolve) => { finish = resolve })
    releases.push(finish)
    vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
      enter()
      await gate
      return disk.writeFile(...args)
    })
    const draining = drainTerminal(service)
    await entered
    const suspension = expect(service.suspendSession('session')).rejects.toThrow(/confirmation|idle/)
    finish()
    await Promise.all([draining, suspension])
    expect(terminal.send).not.toHaveBeenCalled()
    expect(store.terminalQueueDispatch('session')).toBeUndefined()
    expect(store.get('session')?.failedPrompt).toMatchObject({ content: 'first' })
    expect(store.get('session')?.failedPrompt?.uncertain).toBeUndefined()
  })

  it.each([
    ['Copilot', copilot],
    ['Claude', claude],
  ] as const)('%s never publishes a refused queue removal in a later snapshot', async (_name, provider) => {
    const { store, block, unblock } = await fixture()
    const { service } = provider(store)
    const events: ServerEvent[] = []
    service.on('event', (event) => events.push(event))
    const before = service.getSession('session')
    await block()
    await expect(service.removeQueuedPrompt('session', 'first')).rejects.toThrow('EISDIR')
    expect(events).toEqual([])
    expect(service.getSession('session')).toEqual(before)
    expect(service.listSessions()[0].queuedPrompts).toEqual(before?.queuedPrompts)

    await unblock()
    const removed = await service.removeQueuedPrompt('session', 'second')
    expect(removed.session.queuedPrompts?.map(({ id }) => id)).toEqual(['first'])
    expect(events).toEqual([{ type: 'session.upserted', session: removed.session }])
  })

  describe('Provider identity admission', () => {
    function metadata(id: string, directory: string) {
      return {
        sessionId: id,
        startTime: new Date('2026-09-05T00:00:00.000Z'),
        modifiedTime: new Date('2026-09-05T00:00:00.000Z'),
        isRemote: false,
        summary: 'Provisional identity',
        context: { workingDirectory: directory },
      }
    }

    async function terminalClearFixture() {
      const setup = await fixture()
      const { store, directory } = setup
      await store.remove('session')
      let liveId = ''
      let replacementId = ''
      const { service, client, terminal } = copilot(store, undefined, async () =>
        liveId ? [{
          id: liveId, cwd: directory, title: 'Terminal history',
          updatedAt: '2026-09-05T00:00:00.000Z',
        }] : [],
      )
      const controller = Object.assign(terminal, {
        create: vi.fn(async (id: string) => {
          liveId = id
          return { sessionName: 'fixture', windowId: '@1' }
        }),
        rename: vi.fn(async () => true),
        reset: vi.fn(async (
          oldId: string, newId: string, _cwd: string, _runtime: unknown,
          commitReplacement: () => Promise<void>,
        ) => {
          replacementId = newId
          liveId = newId
          try {
            await commitReplacement()
          } catch (error) {
            liveId = oldId
            throw error
          }
          return true
        }),
      })
      terminal.has.mockImplementation(async (id) => id === liveId)
      const created = await service.createSession(directory, true, false)
      await store.update(created.id, (session) => {
        session.title = 'Terminal history'
        session.messages = [{
          id: 'history', role: 'user', content: 'Keep the original conversation',
          createdAt: session.updatedAt,
        }]
      })
      client.deleteSession = vi.fn(async () => {})
      const providerDirectory = path.join(directory, 'copilot', 'session-state', created.id)
      await mkdir(providerDirectory, { recursive: true })
      const historyPath = path.join(providerDirectory, 'events.jsonl')
      await writeFile(historyPath, 'Original provider history\n')
      return {
        ...setup, service, client, terminal: controller, historyPath,
        sessionId: created.id, owner: () => liveId, replacement: () => replacementId,
      }
    }

    it('does not reconcile a predecessor-only discovery after a terminal clear commits', async () => {
      const { store, service, sessionId } = await terminalClearFixture()
      let enter = () => {}
      let release = () => {}
      const entered = new Promise<void>((resolve) => { enter = resolve })
      const gate = new Promise<void>((resolve) => { release = resolve })
      releases.push(release)
      const syncOpen = store.syncOpen.bind(store)
      vi.spyOn(store, 'syncOpen').mockImplementationOnce(async (...args) => {
        enter()
        await gate
        return syncOpen(...args)
      })
      const discovering = service.refreshDiscovery()
      await entered
      const replacement = await service.clearConversation(sessionId)
      release()
      await discovering
      expect(store.get(sessionId)).toBeUndefined()
      expect(store.get(replacement.id)).toMatchObject({ isOpen: true, executionMode: 'tmux' })
      expect((await service.openSession(replacement.id)).id).toBe(replacement.id)
    })

    it('restores terminal ownership and provider history after a rejected clear write', async () => {
      const setup = await terminalClearFixture()
      const { store, directory, service, client, terminal, sessionId, historyPath, block, unblock } = setup
      const uploaded = await store.saveUpload(sessionId, 'notes.txt', Buffer.from('Original upload'))
      const before = store.get(sessionId)
      const onDisk = await readFile(path.join(directory, 'state.json'), 'utf8')
      const published: ServerEvent[] = []
      service.on('event', (incoming) => published.push(incoming))
      await block()
      await expect(service.clearConversation(sessionId)).rejects.toThrow('EISDIR')
      expect(setup.owner()).toBe(sessionId)
      expect(store.get(sessionId)).toEqual(before)
      expect(store.get(setup.replacement())).toBeUndefined()
      expect(await readFile(path.join(directory, 'state.json'), 'utf8')).toBe(onDisk)
      expect(await readFile(historyPath, 'utf8')).toBe('Original provider history\n')
      expect(await readFile(uploaded.path, 'utf8')).toBe('Original upload')
      expect(client.deleteSession).not.toHaveBeenCalledWith(sessionId)
      expect(published).toEqual([])
      await unblock()
      client.listSessions = vi.fn(async () => [
        metadata(sessionId, directory), metadata(setup.replacement(), directory),
      ])
      await service.refreshDiscovery()
      expect(store.get(setup.replacement())).toBeUndefined()
      expect((await service.openSession(sessionId)).id).toBe(sessionId)
      await service.sendMessage(sessionId, 'Continue the original conversation')
      expect(terminal.send).toHaveBeenCalledWith(sessionId, 'Continue the original conversation', false)
      expect(client.resumeSession).not.toHaveBeenCalled()
    })

    it('retires terminal provider files only after the replacement is durable', async () => {
      const { store, directory, service, client, sessionId, historyPath, owner } = await terminalClearFixture()
      client.deleteSession = vi.fn(async (id) => {
        if (id === sessionId) {
          expect(store.get(sessionId)).toBeUndefined()
          const persisted = JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8'))
          expect(persisted.sessions[owner()].replacedSessionIds).toContain(sessionId)
        }
      })
      const replacement = await service.clearConversation(sessionId)
      expect(owner()).toBe(replacement.id)
      expect(store.get(sessionId)).toBeUndefined()
      expect(replacement).toMatchObject({
        executionMode: 'tmux', title: 'Terminal history', messages: [],
        cwd: directory, runtime: { allowAllPermissions: false },
      })
      expect(client.deleteSession).toHaveBeenCalledWith(sessionId)
      await expect(readFile(historyPath)).rejects.toMatchObject({ code: 'ENOENT' })
    })

    it('keeps the old terminal recoverable when failed replacement cleanup also fails', async () => {
      const setup = await terminalClearFixture()
      const { service, client, sessionId, historyPath, block } = setup
      client.deleteSession = vi.fn(async () => { throw new Error('Replacement cleanup refused') })
      await block()
      await expect(service.clearConversation(sessionId)).rejects.toMatchObject({
        name: 'AggregateError',
        errors: [
          expect.objectContaining({ code: 'EISDIR' }),
          expect.objectContaining({ message: expect.stringContaining('SDK cleanup is incomplete') }),
        ],
      })
      expect(setup.owner()).toBe(sessionId)
      expect(await readFile(historyPath, 'utf8')).toBe('Original provider history\n')
      expect(client.deleteSession).not.toHaveBeenCalledWith(sessionId)
    })

    it.each(['sdk', 'terminal', 'claude'] as const)(
      'does not roll back an accepted %s clear when upload cleanup fails',
      async (provider) => {
        let setup: {
          store: SessionStore
          directory: string
          sessionId: string
          service: AgentService | ClaudeAgentService
          owner?: () => string
        }
        if (provider === 'terminal') {
          setup = await terminalClearFixture()
        } else if (provider === 'sdk') {
          setup = { ...await clearFixture(), sessionId: 'session' }
        } else {
          const created = await fixture()
          setup = { ...created, ...claude(created.store), sessionId: 'session' }
        }
        const { store, directory, sessionId, service } = setup
        const upload = await store.saveUpload(sessionId, 'notes.txt', Buffer.from('Pending cleanup'))
        vi.mocked(rm).mockImplementation(async (target, options) => {
          if (target === path.join(directory, 'uploads', sessionId)) throw new Error('Cleanup refused')
          return disk.rm(target, options)
        })
        const events: ServerEvent[] = []
        service.on('event', (incoming) => events.push(incoming))
        const replacement = await service.clearConversation(sessionId)
        expect(store.get(sessionId)).toBeUndefined()
        expect(store.get(replacement.id)).toBeDefined()
        if (setup.owner) expect(setup.owner()).toBe(replacement.id)
        expect(events).toEqual(expect.arrayContaining([
          { type: 'session.removed', sessionId, replacedBy: replacement.id },
          expect.objectContaining({ type: 'session.upserted', session: expect.objectContaining({ id: replacement.id }) }),
          { type: 'error', sessionId: replacement.id, message: 'Conversation cleared, but previous uploads could not be removed.' },
        ]))
        expect(await readFile(upload.path, 'utf8')).toBe('Pending cleanup')
        expect((await service.openSession(replacement.id)).id).toBe(replacement.id)
      },
    )

    it('keeps an accepted terminal clear when renaming its window fails', async () => {
      const { store, service, terminal, sessionId, historyPath, owner } = await terminalClearFixture()
      terminal.rename.mockRejectedValueOnce(new Error('Window rename refused'))
      const events: ServerEvent[] = []
      service.on('event', (incoming) => events.push(incoming))
      const replacement = await service.clearConversation(sessionId)
      expect(owner()).toBe(replacement.id)
      expect(store.get(sessionId)).toBeUndefined()
      expect((await service.openSession(replacement.id)).id).toBe(replacement.id)
      await expect(readFile(historyPath)).rejects.toMatchObject({ code: 'ENOENT' })
      expect(events).toContainEqual({
        type: 'error', sessionId: replacement.id, message: 'Window rename refused',
      })
    })

    it('keeps Claude provider history until a clear write commits', async () => {
      const { store, directory, block, unblock } = await fixture()
      const { service, deleteSession } = claude(store)
      const before = store.get('session')
      const events: ServerEvent[] = []
      service.on('event', (incoming) => events.push(incoming))
      await block()
      await expect(service.clearConversation('session')).rejects.toThrow('EISDIR')
      expect(deleteSession).not.toHaveBeenCalled()
      expect(store.get('session')).toEqual(before)
      expect(events).toEqual([])
      await unblock()
      vi.mocked(deleteSession).mockImplementation(async (id) => {
        expect(store.get(id)).toBeUndefined()
        expect(JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions[id])
          .toBeUndefined()
      })
      const replacement = await service.clearConversation('session')
      expect(deleteSession).toHaveBeenCalledExactlyOnceWith('session', { dir: directory })
      expect(store.get(replacement.id)).toBeDefined()
    })

    it('reports old Claude provider cleanup failure without rejecting an accepted clear', async () => {
      const { store } = await fixture()
      const { service, deleteSession } = claude(store)
      vi.mocked(deleteSession).mockRejectedValueOnce(new Error('Claude cleanup refused'))
      const events: ServerEvent[] = []
      service.on('event', (incoming) => events.push(incoming))
      const replacement = await service.clearConversation('session')
      expect(store.get('session')).toBeUndefined()
      expect(store.get(replacement.id)).toBeDefined()
      expect(events).toContainEqual({
        type: 'error', sessionId: replacement.id, message: 'Claude cleanup refused',
      })
    })

    it('disposes and excludes a rejected SDK creation from later discovery', async () => {
      const { store, directory, block, unblock } = await fixture()
      const { service, client } = copilot(store)
      const created = sdkSession('provisional')
      client.createSession = vi.fn(async () => created)
      client.deleteSession = vi.fn(async () => {})
      client.listSessions = vi.fn(async () => [metadata(created.sessionId, directory)])
      const published: ServerEvent[] = []
      service.on('event', (incoming) => published.push(incoming))
      await block()
      await expect(service.createSession(directory)).rejects.toThrow('EISDIR')
      expect(created.disconnect).toHaveBeenCalledOnce()
      expect(client.deleteSession).toHaveBeenCalledExactlyOnceWith(created.sessionId)
      expect(store.get(created.sessionId)).toBeUndefined()
      created.emit(event('session.title_changed', { title: 'Late rejected title' }))
      await unblock()
      await service.refreshDiscovery()
      await store.flush()
      expect(store.get(created.sessionId)).toBeUndefined()
      expect(published.filter((incoming) => incoming.type === 'session.upserted')).toEqual([])
    })

    it('holds discovery until a provisional SDK identity and its failed write settle', async () => {
      const { store, directory, block, unblock } = await fixture()
      const { service, client } = copilot(store)
      const created = sdkSession('provisional')
      let finishCreation!: (value: CopilotSessionLike) => void
      let finishListing!: () => void
      const listingGate = new Promise<void>((resolve) => { finishListing = resolve })
      releases.push(finishListing)
      client.createSession = vi.fn(() => new Promise<CopilotSessionLike>((resolve) => { finishCreation = resolve }))
      client.listSessions = vi.fn(async () => {
        await listingGate
        return [metadata(created.sessionId, directory)]
      })
      await block()
      const creating = service.createSession(directory)
      const rejected = expect(creating).rejects.toThrow('EISDIR')
      await vi.waitFor(() => expect(client.createSession).toHaveBeenCalledOnce())
      const discovery = service.refreshDiscovery()
      await Promise.resolve()
      expect(client.listSessions).not.toHaveBeenCalled()
      finishCreation(created)
      await rejected
      await unblock()
      finishListing()
      await discovery
      expect(store.get(created.sessionId)).toBeUndefined()
    })

    it('keeps failed cleanup quarantined while surfacing both failures', async () => {
      const { store, directory, block, unblock } = await fixture()
      const { service, client } = copilot(store)
      const created = sdkSession('provisional')
      created.disconnect = vi.fn(async () => { throw new Error('Disconnect refused') })
      client.createSession = vi.fn(async () => created)
      client.deleteSession = vi.fn(async () => { throw new Error('Delete refused') })
      client.listSessions = vi.fn(async () => [metadata(created.sessionId, directory)])
      await block()
      await expect(service.createSession(directory))
        .rejects.toThrow('Session creation failed and SDK cleanup is incomplete')
      expect(created.disconnect).toHaveBeenCalledOnce()
      expect(client.deleteSession).toHaveBeenCalledOnce()
      await unblock()
      await service.refreshDiscovery()
      expect(store.get(created.sessionId)).toBeUndefined()
      await service.stop()
      expect(created.disconnect).toHaveBeenCalledOnce()
    })

    it('does not delete the original SDK identity when clear persistence fails', async () => {
      const { store, directory, service, client, fresh } = await clearFixture()
      client.deleteSession = vi.fn(async () => {})
      const before = store.get('session')
      const blocked = path.join(directory, 'state.json.tmp')
      await mkdir(blocked)
      await expect(service.clearConversation('session')).rejects.toThrow('EISDIR')
      const replacement = fresh()!
      expect(store.get('session')).toEqual(before)
      expect(store.get(replacement.sessionId)).toBeUndefined()
      expect(client.deleteSession).toHaveBeenCalledExactlyOnceWith(replacement.sessionId)
      expect(replacement.disconnect).toHaveBeenCalledOnce()
      await rm(blocked, { recursive: true })
      client.listSessions = vi.fn(async () => [
        metadata('session', directory), metadata(replacement.sessionId, directory),
      ])
      await service.refreshDiscovery()
      expect(store.get(replacement.sessionId)).toBeUndefined()
      expect(store.get('session')).toBeDefined()
    })

    it('retires the original SDK identity only after replacement commits', async () => {
      const { store, directory, service, client } = await clearFixture()
      client.deleteSession = vi.fn(async (id) => {
        if (id === 'session') expect(store.get(id)).toBeUndefined()
      })
      const replacement = await service.clearConversation('session')
      expect(client.deleteSession).toHaveBeenCalledWith('session')
      client.listSessions = vi.fn(async () => [
        metadata('session', directory), metadata(replacement.id, directory),
      ])
      const reloaded = new SessionStore(directory)
      await reloaded.initialize()
      const restarted = copilot(reloaded)
      restarted.client.listSessions = client.listSessions
      await restarted.service.refreshDiscovery()
      expect(reloaded.get('session')).toBeUndefined()
      expect(reloaded.get(replacement.id)).toBeDefined()
    })

    it('preserves a committed clear when old SDK cleanup is refused', async () => {
      const { store, service, client } = await clearFixture()
      client.deleteSession = vi.fn(async () => { throw new Error('Cleanup unavailable') })
      const errors: ServerEvent[] = []
      service.on('event', (incoming) => {
        if (incoming.type === 'error') errors.push(incoming)
      })
      const replacement = await service.clearConversation('session')
      expect(store.get('session')).toBeUndefined()
      expect(store.get(replacement.id)).toBeDefined()
      expect(errors).toEqual([expect.objectContaining({
        type: 'error', sessionId: replacement.id,
        message: expect.stringContaining('SDK cleanup is incomplete'),
      })])
    })

    it.each([false, true])(
      'keeps cleared identities retired after deleting their last descendant (stale deleted replacement: %s)',
      async (staleReplacement) => {
        const { store, directory, service, client } = await clearFixture()
        const providerIds = new Set(['session'])
        client.deleteSession = vi.fn(async (id) => {
          if (id === 'session') throw new Error('Original provider cleanup is unavailable')
          if (!staleReplacement) providerIds.delete(id)
        })
        client.listSessions = vi.fn(async () =>
          [...providerIds].map((id) => metadata(id, directory)),
        )
        const replacement = await service.clearConversation('session')
        providerIds.add(replacement.id)
        await store.flush()
        expect(replacement.replacedSessionIds).toContain('session')
        await service.deleteSession(replacement.id)
        expect(store.list()).toEqual([])
        expect(providerIds.has('session')).toBe(true)
        await service.stop()

        const reloaded = new SessionStore(directory)
        await reloaded.initialize()
        const restarted = copilot(reloaded)
        restarted.client.listSessions = client.listSessions
        await restarted.service.refreshDiscovery()
        expect(reloaded.get('session')).toBeUndefined()
        expect(reloaded.get(replacement.id)).toBeUndefined()
        expect(reloaded.list()).toEqual([])
      },
    )

    it('settles in-flight creation before stopping the SDK', async () => {
      const { store, directory } = await fixture()
      const { service, client } = copilot(store)
      const created = sdkSession('provisional')
      let finish!: (value: CopilotSessionLike) => void
      client.createSession = vi.fn(() => new Promise<CopilotSessionLike>((resolve) => { finish = resolve }))
      client.deleteSession = vi.fn(async () => {})
      const stop = vi.spyOn(client, 'stop')
      const creating = service.createSession(directory)
      const rejected = expect(creating).rejects.toThrow('session service is stopping')
      await vi.waitFor(() => expect(client.createSession).toHaveBeenCalledOnce())
      const stopping = service.stop()
      await Promise.resolve()
      expect(stop).not.toHaveBeenCalled()
      finish(created)
      await rejected
      await stopping
      expect(created.disconnect).toHaveBeenCalledOnce()
      expect(client.deleteSession).toHaveBeenCalledWith(created.sessionId)
      expect(store.get(created.sessionId)).toBeUndefined()
      await expect(service.createSession(directory)).rejects.toThrow('session service is stopping')
      expect(client.createSession).toHaveBeenCalledOnce()
    })

    it('does not overwrite or dispose an existing provider identity on collision', async () => {
      const { store, directory } = await fixture()
      const { service, client } = copilot(store)
      const existing = sdkSession('session')
      const before = store.get('session')
      client.createSession = vi.fn(async () => existing)
      client.deleteSession = vi.fn(async () => {})
      await expect(service.createSession(directory)).rejects.toThrow('existing session identity')
      expect(store.get('session')).toEqual(before)
      expect(existing.disconnect).not.toHaveBeenCalled()
      expect(client.deleteSession).not.toHaveBeenCalled()
    })

    it('does not attach an SDK resume that completes after its identity was replaced', async () => {
      const { store, service, client } = await clearFixture()
      const old = sdkSession('session')
      let finish!: (value: CopilotSessionLike) => void
      client.resumeSession = vi.fn(() => new Promise<CopilotSessionLike>((resolve) => { finish = resolve }))
      const opening = service.openSession('session')
      const rejected = expect(opening).rejects.toThrow('Session is no longer available')
      await vi.waitFor(() => expect(client.resumeSession).toHaveBeenCalledOnce())
      const replacement = await service.clearConversation('session')
      finish(old)
      await rejected
      expect(old.disconnect).toHaveBeenCalledOnce()
      expect(store.get('session')).toBeUndefined()
      expect(store.get(replacement.id)).toBeDefined()
    })
  })

  it('does not dispatch Copilot SDK work when its dequeue write fails', async () => {
    const { store, block } = await fixture()
    const { service, resumeSession, terminal } = copilot(store)
    const events: ServerEvent[] = []
    service.on('event', (event) => events.push(event))
    const before = service.getSession('session')
    await block()
    await (service as unknown as {
      drainSdkQueue(id: string): Promise<void>
    }).drainSdkQueue('session')
    expect(resumeSession).not.toHaveBeenCalled()
    expect(terminal.send).not.toHaveBeenCalled()
    expect(events).toEqual([expect.objectContaining({
      type: 'error',
      message: expect.stringContaining('EISDIR'),
    })])
    expect(service.getSession('session')).toEqual(before)
  })

  it('does not dispatch Claude work when its dequeue write fails', async () => {
    const { store, block } = await fixture()
    const { service, query } = claude(store)
    const before = service.getSession('session')
    await block()
    await expect((service as unknown as {
      drainQueue(id: string): Promise<void>
    }).drainQueue('session')).rejects.toThrow('EISDIR')
    expect(query).not.toHaveBeenCalled()
    expect(service.getSession('session')).toEqual(before)
  })

  it('does not let a Claude drain dispatch the head a concurrent edit removed', async () => {
    const { store } = await fixture()
    const { service, query } = claude(store)
    const internals = service as unknown as {
      drainQueue(id: string): Promise<void>
      dispatchQueued(id: string, content: string, enqueue: boolean, fromQueue: boolean, reservation?: QueuedPromptReservation): Promise<unknown>
    }
    const dispatch = vi.spyOn(internals, 'dispatchQueued').mockImplementation(
      async (id, content, _enqueue, _fromQueue, reservation) =>
        store.beginPrompt(id, content, 'assistant', () => true, reservation),
    )
    const removing = service.removeQueuedPrompt('session', 'first')
    const draining = internals.drainQueue('session')
    const [removed] = await Promise.all([removing, draining])
    expect(removed.prompt.id).toBe('first')
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      'session', 'second', false, true,
      expect.objectContaining({ prompt: expect.objectContaining({ id: 'second' }) }),
    )
    expect(query).not.toHaveBeenCalled()
    expect(service.getSession('session')?.queuedPrompts).toEqual([])
  })

  it('drains the committed terminal order after a reorder write is refused', async () => {
    const { store, directory, block, unblock } = await fixture()
    const { service, terminal } = copilot(store)
    const events: ServerEvent[] = []
    service.on('event', (event) => events.push(event))
    await block()
    await expect(store.update('session', (stored) => {
      stored.queuedPrompts!.reverse()
    })).rejects.toThrow('EISDIR')
    await unblock()
    await (service as unknown as {
      drainTerminalQueue(id: string): Promise<void>
    }).drainTerminalQueue('session')
    expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', 'first', false)
    expect(service.getSession('session')?.queuedPrompts?.map(({ id }) => id))
      .toEqual(['second'])
    expect(events).toEqual(['Dispatching queued prompt', 'Sent queued prompt'].map((activity) => expect.objectContaining({
      type: 'session.upserted',
      session: expect.objectContaining({
        status: 'running',
        activity,
        queuedPrompts: [expect.objectContaining({ id: 'second' })],
      }),
    })))
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.queuedPrompts).toEqual(
      service.getSession('session')?.queuedPrompts,
    )
  })
})
