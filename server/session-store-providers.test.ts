import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
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
import { SessionStore } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile) }
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

function copilot(store: SessionStore, history?: SessionEvent[]) {
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
    has: vi.fn(async () => true),
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
    async () => [],
    async () => {},
    async () => history || [],
    async () => history ? 'events-v1' : undefined,
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
    expect(fresh()?.disconnect).not.toHaveBeenCalled()
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
      dispatchQueued(id: string, content: string): Promise<unknown>
    }
    const dispatch = vi.spyOn(internals, 'dispatchQueued').mockImplementation(
      async (id) => store.updateStatus(id, 'running'),
    )
    const removing = service.removeQueuedPrompt('session', 'first')
    const draining = internals.drainQueue('session')
    const [removed] = await Promise.all([removing, draining])
    expect(removed.prompt.id).toBe('first')
    expect(dispatch).toHaveBeenCalledExactlyOnceWith('session', 'second', false, true)
    expect(query).not.toHaveBeenCalled()
    expect(service.getSession('session')?.queuedPrompts).toEqual([])
  })

  it('drains the committed terminal order after a reorder write is refused', async () => {
    const { store, directory, block, unblock } = await fixture()
    const { service, terminal } = copilot(store)
    const events: ServerEvent[] = []
    service.on('event', (event) => events.push(event))
    await block()
    await expect(service.reorderQueuedPrompts('session', ['second', 'first']))
      .rejects.toThrow('EISDIR')
    await unblock()
    await (service as unknown as {
      drainTerminalQueue(id: string): Promise<void>
    }).drainTerminalQueue('session')
    expect(terminal.send).toHaveBeenCalledExactlyOnceWith('session', 'first', false)
    expect(service.getSession('session')?.queuedPrompts?.map(({ id }) => id))
      .toEqual(['second'])
    expect(events).toEqual([expect.objectContaining({
      type: 'session.upserted',
      session: expect.objectContaining({
        status: 'running',
        queuedPrompts: [expect.objectContaining({ id: 'second' })],
      }),
    })])
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.queuedPrompts).toEqual(
      service.getSession('session')?.queuedPrompts,
    )
  })

  it('drains the committed Claude order after rejecting a real reorder', async () => {
    const { store, directory, block, unblock } = await fixture()
    const { service, query } = claude(store)
    const events: ServerEvent[] = []
    service.on('event', (incoming) => events.push(incoming))
    await store.updateStatus('session', 'running')
    const before = service.getSession('session')
    await block()
    await expect(service.reorderQueuedPrompts('session', ['second', 'first']))
      .rejects.toThrow('EISDIR')
    expect(events).toEqual([])
    expect(service.getSession('session')).toEqual(before)
    expect(query).not.toHaveBeenCalled()
    await unblock()
    await store.updateStatus('session', 'idle')
    const internals = service as unknown as {
      drainQueue(id: string): Promise<void>
      dispatchQueued(id: string, content: string): Promise<unknown>
    }
    const dispatch = vi.spyOn(internals, 'dispatchQueued').mockImplementation(
      async (id) => store.updateStatus(id, 'running'),
    )
    await internals.drainQueue('session')
    expect(dispatch).toHaveBeenCalledExactlyOnceWith('session', 'first', false, true)
    expect(query).not.toHaveBeenCalled()
    expect(service.getSession('session')?.queuedPrompts?.map(({ id }) => id))
      .toEqual(['second'])
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.queuedPrompts).toEqual(
      service.getSession('session')?.queuedPrompts,
    )
  })
})
