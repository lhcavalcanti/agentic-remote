import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ServerEvent, SessionDetail } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'
import type { TerminalSessionController } from './terminal-session.js'

const fixtures: { directory: string; service: AgentService }[] = []
const releases: (() => void)[] = []
const timestamp = '2026-09-06T00:00:00.000Z'

function prompt(id: string) {
  return { id, content: id, createdAt: timestamp }
}

function gate<T>(fallback: T) {
  let finish!: (result: T) => void
  let fail!: (error: Error) => void
  const pending = new Promise<T>((resolve, reject) => { finish = resolve; fail = reject })
  releases.push(() => finish(fallback))
  return { pending, finish, fail }
}

function sdkSession(sessionId: string): CopilotSessionLike {
  const listeners = new Set<Parameters<CopilotSessionLike['on']>[0]>()
  return {
    sessionId,
    on: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    send: vi.fn(async () => {
      queueMicrotask(() => {
        for (const listener of listeners) {
          listener({
            id: randomUUID(), type: 'session.idle', data: {},
            timestamp: new Date().toISOString(), ephemeral: true, parentId: null,
          })
        }
      })
      return randomUUID()
    }),
    sendAndWait: vi.fn(async () => undefined),
    getEvents: async () => [],
    abort: async () => {},
    disconnect: async () => {},
    rpc: {
      commands: {
        list: async () => ({ commands: [] }),
        invoke: async () => ({ kind: 'text', text: 'Unused' }),
        enqueue: async () => ({ queued: true as const, queueId: 'queued-command' }),
      },
      name: { set: async () => {} },
      model: {
        getCurrent: async () => ({ modelId: 'fixture-model' }),
        switchTo: async () => ({ modelId: 'fixture-model' }),
      },
      mode: { set: async () => ({ status: 'applied', modelChanged: false }) },
    },
  }
}

async function fixture(ids = ['pending']) {
  const directory = path.resolve(`.pr167-recovery-${randomUUID()}`)
  const stateDirectory = path.join(directory, 'state')
  const store = new SessionStore(stateDirectory)
  await store.initialize()
  vi.stubEnv('COPILOT_HOME', path.join(directory, 'copilot'))
  for (const id of ids) {
    await store.create({
      id, cwd: directory, title: id, updatedAt: timestamp,
      status: 'idle', isOpen: true,
      messages: [{
        id: `${id}-history`, role: 'user', content: `Retain ${id}`,
        createdAt: timestamp,
      }],
      runtime: {
        allowAllPermissions: false, model: 'fixture-model',
        reasoningEffort: 'high', contextTier: 'long_context', mode: 'autopilot',
      },
    }, { backend: 'terminal', managedOpen: true })
  }
  const ownership = {
    aggregateError: new Error('Aggregate discovery unavailable') as Error | undefined,
    probeErrors: new Map<string, Error>(),
    owners: new Set<string>(),
  }
  const attach = vi.fn<CopilotClientLike['resumeSession']>(async () => {
    throw new Error('An unconfirmed terminal must not acquire an SDK owner')
  })
  const client: CopilotClientLike = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => []),
    listSessions: vi.fn(async () => []),
    deleteSession: vi.fn(async () => {}),
    resumeSession: attach,
    createSession: vi.fn(async () => { throw new Error('Unexpected SDK creation') }),
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
    },
  }
  const active = vi.fn(async () => {
    if (ownership.aggregateError) throw ownership.aggregateError
    return [...ownership.owners].map((id) => ({
      id, cwd: directory, title: id, updatedAt: timestamp,
    }))
  })
  const terminal = {
    has: vi.fn<TerminalSessionController['has']>(async (id) => {
      const error = ownership.probeErrors.get(id)
      if (error) throw error
      return ownership.owners.has(id)
    }),
    create: vi.fn<NonNullable<TerminalSessionController['create']>>(async (id) => {
      expect(ownership.owners.has(id)).toBe(false)
      ownership.owners.add(id)
      return { sessionName: 'fixture', windowId: '@1' }
    }),
    reopen: vi.fn(async (id: string) => {
      expect(ownership.owners.has(id)).toBe(false)
      ownership.owners.add(id)
      return { sessionName: 'fixture', windowId: '@2' }
    }),
    inputReady: vi.fn(async () => true),
    send: vi.fn(async () => true),
    capture: vi.fn<NonNullable<TerminalSessionController['capture']>>(async () => undefined),
    cancel: vi.fn(async () => true),
    stop: vi.fn<NonNullable<TerminalSessionController['stop']>>(async (id, beforeStop) => {
      const error = ownership.probeErrors.get(id)
      if (error) throw error
      await beforeStop?.()
      ownership.owners.delete(id)
      return true
    }),
  }
  const stopper = vi.fn(async (id: string) => {
    const error = ownership.probeErrors.get(id)
    if (error) throw error
    ownership.owners.delete(id)
  })
  const events: ServerEvent[] = []
  const readEvents = vi.fn<NonNullable<ConstructorParameters<typeof AgentService>[4]>>(async () => [])
  const eventVersion = vi.fn<NonNullable<ConstructorParameters<typeof AgentService>[5]>>(async () => undefined)
  const service = new AgentService(
    store, client, active, stopper, readEvents, eventVersion,
    terminal, async () => undefined, async () => undefined,
  )
  service.on('event', (event) => events.push(event))
  fixtures.push({ directory, service })
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const blockedWrite = path.join(stateDirectory, 'state.json.tmp')
  function holdProbe(id = 'pending') {
    const entered = gate(undefined)
    const result = gate(false)
    const original = terminal.has.getMockImplementation()!
    let held = true
    terminal.has.mockImplementation(async (sessionId) => {
      if (sessionId !== id || !held) return original(sessionId)
      held = false
      entered.finish(undefined)
      return result.pending
    })
    return { entered: entered.pending, finish: result.finish, fail: result.fail }
  }
  return {
    directory, stateDirectory, store, client, service, terminal, active, stopper,
    ownership, events, readEvents, eventVersion,
    holdProbe,
    drainNow: async (id = 'pending') => {
      const retry = service['pendingTerminalQueueClaims'].get(id)
      if (retry) retry.retryAt = 0
      await service['drainTerminalQueue'](id)
    },
    blockWrites: () => mkdir(blockedWrite),
    unblockWrites: () => rm(blockedWrite, { recursive: true, force: true }),
    persisted: async () => JSON.parse(await readFile(path.join(stateDirectory, 'state.json'), 'utf8')),
  }
}

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  try {
    await Promise.all(fixtures.splice(0).map(async ({ directory, service }) => {
      try {
        await rm(path.join(directory, 'state', 'state.json.tmp'), { recursive: true, force: true })
        await service.stop()
      } finally {
        await rm(directory, { recursive: true, force: true })
      }
    }))
  } finally {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  }
})

describe('Closed terminal activation', () => {
  it('reopens the same provider session and starts its preserved FIFO', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    await f.store.enqueuePrompt('pending', prompt('first'))
    await f.store.enqueuePrompt('pending', prompt('second'))
    const before = f.store.get('pending')!

    const reopened = await f.service.activateSession('pending')

    expect(f.terminal.reopen).toHaveBeenCalledExactlyOnceWith(
      'pending',
      f.directory,
      'pending',
      false,
      {
        allowAllPermissions: false,
        model: 'fixture-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      },
    )
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith(
      'pending',
      'first',
      false,
    )
    expect(reopened).toMatchObject({
      id: 'pending',
      isOpen: true,
      messages: before.messages,
      queuedPrompts: [prompt('second')],
    })
    expect(f.store.isManagedOpen('pending')).toBe(true)
  })

  it('does not duplicate a terminal owner when two opens arrive together', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    const started = gate(undefined)
    const release = gate(undefined)
    f.terminal.reopen.mockImplementationOnce(async (id: string) => {
      started.finish(undefined)
      await release.pending
      f.ownership.owners.add(id)
      return { sessionName: 'fixture', windowId: '@2' }
    })

    const first = f.service.activateSession('pending')
    await started.pending
    const second = f.service.activateSession('pending')
    release.finish(undefined)

    await expect(Promise.all([first, second])).resolves.toEqual([
      expect.objectContaining({ id: 'pending', isOpen: true }),
      expect.objectContaining({ id: 'pending', isOpen: true }),
    ])
    expect(f.terminal.reopen).toHaveBeenCalledOnce()
  })

  it('does not register admission while activation waits behind lifecycle work', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    const entered = gate(undefined)
    const release = gate(undefined)
    vi.spyOn(
      f.service as unknown as {
        deleteSerialized: (id: string) => Promise<void>
      },
      'deleteSerialized',
    ).mockImplementationOnce(async () => {
      entered.finish(undefined)
      await release.pending
    })

    const deletion = f.service.deleteSession('pending')
    await entered.pending
    const activation = f.service.activateSession('pending')
    const admissions = f.service['admissions'] as unknown as {
      pending: Map<string, Set<unknown>>
    }
    const pendingAdmissions = admissions.pending.get('pending')?.size ?? 0
    release.finish(undefined)
    await expect(deletion).resolves.toBeUndefined()
    await expect(activation).resolves.toMatchObject({
      id: 'pending',
      isOpen: true,
    })
    expect(pendingAdmissions).toBe(0)
  })

  it('does not attach an SDK owner while terminal reopening is in flight', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    const started = gate(undefined)
    const release = gate(undefined)
    f.terminal.reopen.mockImplementationOnce(async (id: string) => {
      started.finish(undefined)
      await release.pending
      f.ownership.owners.add(id)
      return { sessionName: 'fixture', windowId: '@2' }
    })
    vi.mocked(f.client.resumeSession).mockResolvedValueOnce(
      sdkSession('pending'),
    )

    const activation = f.service.activateSession('pending')
    await started.pending
    const competing = await Promise.allSettled([
      f.service.listCommands('pending'),
      f.service.sendMessage('pending', 'Do not attach another owner'),
    ])
    release.finish(undefined)
    await expect(activation).resolves.toMatchObject({
      id: 'pending',
      isOpen: true,
    })
    expect(competing).toEqual([
      expect.objectContaining({
        status: 'rejected',
        reason: expect.objectContaining({ statusCode: 409 }),
      }),
      expect.objectContaining({
        status: 'rejected',
        reason: expect.objectContaining({ statusCode: 409 }),
      }),
    ])
    expect(f.client.resumeSession).not.toHaveBeenCalled()
  })

  it('retires an SDK load that began before terminal reopening', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    const sdk = sdkSession('pending')
    const disconnect = vi.spyOn(sdk, 'disconnect')
    const started = gate(undefined)
    const loading = gate<CopilotSessionLike>(sdk)
    vi.mocked(f.client.resumeSession).mockImplementationOnce(async () => {
      started.finish(undefined)
      return loading.pending
    })

    const commands = f.service.listCommands('pending')
    await started.pending
    const activation = f.service.activateSession('pending')
    await vi.waitFor(() => {
      expect(f.service['terminalActivations'].has('pending')).toBe(true)
    })
    loading.finish(sdk)
    const [commandResult, activationResult] = await Promise.allSettled([
      commands,
      activation,
    ])

    expect(commandResult).toMatchObject({
      status: 'rejected',
      reason: expect.objectContaining({ statusCode: 409 }),
    })
    expect(activationResult).toMatchObject({
      status: 'fulfilled',
      value: expect.objectContaining({ id: 'pending', isOpen: true }),
    })
    expect(disconnect).toHaveBeenCalledOnce()
    expect(f.service['sessions'].has('pending')).toBe(false)
    expect(f.terminal.reopen).toHaveBeenCalledOnce()
  })

  it('does not reopen when an in-flight SDK owner cannot disconnect', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    const sdk = sdkSession('pending')
    const disconnectFailure = new Error('SDK disconnect failed')
    const disconnect = vi
      .spyOn(sdk, 'disconnect')
      .mockRejectedValueOnce(disconnectFailure)
      .mockResolvedValue(undefined)
    const started = gate(undefined)
    const loading = gate<CopilotSessionLike>(sdk)
    vi.mocked(f.client.resumeSession).mockImplementationOnce(async () => {
      started.finish(undefined)
      return loading.pending
    })

    const commands = f.service.listCommands('pending')
    await started.pending
    const activation = f.service.activateSession('pending')
    await vi.waitFor(() => {
      expect(f.service['terminalActivations'].has('pending')).toBe(true)
    })
    loading.finish(sdk)
    const [commandResult, activationResult] = await Promise.allSettled([
      commands,
      activation,
    ])

    expect(commandResult.status).toBe('rejected')
    expect(activationResult).toMatchObject({
      status: 'rejected',
      reason: expect.objectContaining({ statusCode: 409 }),
    })
    expect(disconnect).toHaveBeenCalledOnce()
    expect(f.service['sessions'].get('pending')).toBe(sdk)
    expect(f.terminal.reopen).not.toHaveBeenCalled()
  })

  it('waits for SDK runtime configuration and reopens with the committed settings', async () => {
    const f = await fixture()
    const sdk = sdkSession('pending')
    const disconnect = vi.spyOn(sdk, 'disconnect')
    vi.mocked(f.client.resumeSession).mockResolvedValueOnce(sdk)
    await f.service.listCommands('pending')
    await f.store.setOpen('pending', false, true)
    const refresh = vi.spyOn(
      f.service as unknown as {
        refreshRuntimeModels: () => Promise<void>
      },
      'refreshRuntimeModels',
    ).mockResolvedValue(undefined)
    f.service['runtimeModels'].set('updated-model', {
      id: 'updated-model',
      name: 'Updated model',
      reasoningEfforts: ['high'],
      contextTiers: ['long_context'],
      contextTokenLimits: {},
    })
    const switchStarted = gate(undefined)
    const releaseSwitch = gate({
      modelId: 'updated-model',
      reasoningEffort: 'high',
      contextTier: 'long_context' as const,
    })
    vi.spyOn(sdk.rpc.model, 'switchTo').mockImplementationOnce(async () => {
      switchStarted.finish(undefined)
      return releaseSwitch.pending
    })

    const configuration = f.service.configureRuntime('pending', {
      model: 'updated-model',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'autopilot',
    })
    await switchStarted.pending
    const serializedConfiguration = f.service['lifecycleLocks'].has('pending')
    const activation = f.service.activateSession('pending')
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(disconnect).not.toHaveBeenCalled()
    expect(f.terminal.reopen).not.toHaveBeenCalled()
    releaseSwitch.finish({
      modelId: 'updated-model',
      reasoningEffort: 'high',
      contextTier: 'long_context',
    })

    await expect(configuration).resolves.toMatchObject({
      runtime: {
        model: 'updated-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      },
    })
    await expect(activation).resolves.toMatchObject({
      id: 'pending',
      isOpen: true,
    })
    expect(serializedConfiguration).toBe(true)
    expect(f.terminal.reopen).toHaveBeenCalledWith(
      'pending',
      f.directory,
      'pending',
      false,
      expect.objectContaining({
        model: 'updated-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
      }),
    )
    refresh.mockRestore()
  })

  it.each(['running', 'error'] as const)(
    'drains preserved work after a ready owner resumes from stale %s state',
    async (status) => {
      const f = await fixture()
      await f.store.setOpen('pending', false, true)
      await f.store.update('pending', (session) => {
        session.status = status
        session.activity = `Stale ${status}`
      })
      await f.store.enqueuePrompt('pending', prompt(`after ${status}`))

      await expect(f.service.activateSession('pending')).resolves.toMatchObject({
        isOpen: true,
        queuedPrompts: [],
      })

      expect(f.terminal.inputReady).toHaveBeenCalledWith('pending')
      expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith(
        'pending',
        `after ${status}`,
        false,
      )
    },
  )

  it('keeps transcript polling from restoring stale status before the first queue claim', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    await f.store.update('pending', (session) => {
      session.status = 'running'
      session.activity = 'Historical turn'
    })
    await f.store.enqueuePrompt('pending', prompt('after stale history'))
    f.eventVersion.mockResolvedValue('1:1')
    f.readEvents.mockResolvedValue([{
      id: 'historical-turn',
      type: 'assistant.turn_start',
      parentId: null,
      timestamp,
      data: {},
    }] as SessionEvent[])
    const captureStarted = gate(undefined)
    const capture = gate('Ready composer')
    f.terminal.capture.mockImplementationOnce(async () => {
      captureStarted.finish(undefined)
      return capture.pending
    })

    const activation = f.service.activateSession('pending')
    await captureStarted.pending
    await f.service.refreshTranscripts()
    capture.finish('Ready composer')

    await expect(activation).resolves.toMatchObject({
      isOpen: true,
      queuedPrompts: [],
    })
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith(
      'pending',
      'after stale history',
      false,
    )
  })

  it('preserves a permission that arrives while resumed readiness is checked', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    await f.store.update('pending', (session) => {
      session.status = 'running'
      session.activity = 'Historical turn'
    })
    const readinessStarted = gate(undefined)
    const readiness = gate(true)
    f.terminal.inputReady.mockImplementationOnce(async () => {
      readinessStarted.finish(undefined)
      return readiness.pending
    })

    const activation = f.service.activateSession('pending')
    await readinessStarted.pending
    await f.store.update('pending', (session) => {
      session.pendingPermission = {
        requestId: 'permission',
        kind: 'tool',
        title: 'Allow tool',
        options: [],
      }
      session.status = 'waiting'
      session.activity = 'Allow tool'
    })
    readiness.finish(true)

    await expect(activation).resolves.toMatchObject({
      status: 'waiting',
      activity: 'Allow tool',
      pendingPermission: { requestId: 'permission' },
    })
  })

  it('keeps history and queued work closed when saved provider state cannot resume', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false)
    await f.store.enqueuePrompt('pending', prompt('still waiting'))
    const before = f.store.get('pending')!
    f.terminal.reopen.mockRejectedValueOnce(
      new Error('Copilot saved session is unavailable or corrupt'),
    )

    await expect(f.service.activateSession('pending')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringMatching(/saved Copilot state/i),
    })

    expect(f.store.get('pending')).toMatchObject({
      isOpen: false,
      messages: before.messages,
      queuedPrompts: before.queuedPrompts,
    })
    expect(f.store.isManagedOpen('pending')).toBe(true)
    expect(f.terminal.send).not.toHaveBeenCalled()
  })

  it('releases admission and remains retryable when the open-state write fails', async () => {
    const f = await fixture()
    await f.store.setOpen('pending', false, true)
    await f.store.enqueuePrompt('pending', prompt('deliver after retry'))
    await f.blockWrites()

    await expect(f.service.activateSession('pending')).rejects.toMatchObject({
      code: 'EISDIR',
    })

    await f.unblockWrites()
    expect(f.service['admissionClosed'].has('pending')).toBe(false)
    await expect(f.service.activateSession('pending')).resolves.toMatchObject({
      id: 'pending',
      isOpen: true,
      queuedPrompts: [],
    })
    expect(f.terminal.reopen).toHaveBeenCalledOnce()
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith(
      'pending',
      'deliver after retry',
      false,
    )
  })
})

describe('PR167 reviewed-parent composition', () => {
  const emptyComposer = ['Synthetic idle owner', '╻▄▄▄▄▄▄▄▄▄▄', '┃ ', '╹▀▀▀▀▀▀▀▀▀▀', ' / commands'].join('\n')

  it.each(['aggregate', 'owner'])(
    'reconsiders a pending terminal seed after deferred %s discovery without duplicate dispatch',
    async (deferred) => {
      const f = await fixture()
      await f.store.enqueuePrompt('pending', prompt('Preserved FIFO'))
      await f.store.replaceWithRecoveredSession(
        'pending', 'replacement', 'manual', 1, false, 'Deferred terminal seed',
      )
      f.ownership.owners.add('replacement')
      if (deferred === 'owner') f.ownership.aggregateError = undefined
      f.ownership.probeErrors.set('replacement', new Error('Ownership unreadable'))
      f.terminal.capture.mockResolvedValue(emptyComposer)

      await f.service.start()

      expect(f.store.recoverySeed('replacement')?.state).toBe('pending')
      expect(f.terminal.send).not.toHaveBeenCalled()
      f.ownership.aggregateError = undefined
      await f.service.refreshDiscovery()
      expect(f.store.recoverySeed('replacement')?.state).toBe('pending')
      expect(f.terminal.send).not.toHaveBeenCalled()

      const claim = f.store.claimRecoverySeed.bind(f.store)
      const claiming = gate(undefined)
      const claimSpy = vi.spyOn(f.store, 'claimRecoverySeed').mockImplementation(async (...args) => {
        await claiming.pending
        return claim(...args)
      })
      f.ownership.probeErrors.clear()
      await f.service.refreshDiscovery()
      await vi.waitFor(() => expect(claimSpy).toHaveBeenCalledOnce())
      // Discovery must remain responsive while the durable claim is pending.
      await f.service.refreshDiscovery()
      expect(claimSpy).toHaveBeenCalledOnce()
      claiming.finish(undefined)
      await vi.waitFor(() => expect(f.terminal.send)
        .toHaveBeenCalledExactlyOnceWith('replacement', 'Deferred terminal seed', false))
      await vi.waitFor(() => expect(f.store.recoverySeed('replacement')).toBeUndefined())
      expect(f.store.get('replacement')?.queuedPrompts).toEqual([prompt('Preserved FIFO')])
      await f.service.refreshDiscovery()
      expect(claimSpy).toHaveBeenCalledOnce()
      expect(f.terminal.create).not.toHaveBeenCalled()
      expect(f.client.resumeSession).not.toHaveBeenCalled()

      await f.store.clearUntrackedTerminalDispatch('replacement', f.store.queueDispatchAt('replacement')!)
      await f.drainNow('replacement')
      expect(f.terminal.send.mock.calls).toEqual([
        ['replacement', 'Deferred terminal seed', false],
        ['replacement', 'Preserved FIFO', false],
      ])
    },
  )

  it('explicitly reopens queued demand while aggregate discovery is indeterminate', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Persisted native work'))
    const retained = f.store.get('pending')!
    f.terminal.capture.mockResolvedValue(emptyComposer)
    await expect(f.service.start()).resolves.toBeUndefined()

    expect(f.service['startupTerminalQueues'].has('pending')).toBe(true)
    expect(f.terminal.has).not.toHaveBeenCalled()
    expect(f.terminal.capture).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.terminal.create).not.toHaveBeenCalled()
    await expect(f.service.openSession('pending')).resolves.toMatchObject({
      isOpen: true, messages: retained.messages, queuedPrompts: retained.queuedPrompts,
    })
    expect((await f.persisted()).sessions.pending.managedOpen).toBe(true)
    await expect(f.service.activateSession('pending')).resolves.toMatchObject({
      isOpen: true,
      queuedPrompts: [],
    })
    expect(f.terminal.reopen).toHaveBeenCalledOnce()
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith(
      'pending',
      'Persisted native work',
      false,
    )
    expect(f.client.resumeSession).not.toHaveBeenCalled()
  })

  it('does not auto-create an absent queued owner but explicitly reopens it', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Wait for a positive owner'))
    f.ownership.aggregateError = undefined
    f.terminal.capture.mockResolvedValue(emptyComposer)
    await f.service.start()
    await f.service.refreshDiscovery()
    await f.drainNow()

    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.store.get('pending')).toMatchObject({ isOpen: false, queuedCount: 1 })
    await expect(f.service.openSession('pending')).resolves.toMatchObject({
      isOpen: false, queuedPrompts: [prompt('Wait for a positive owner')],
    })
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    expect(f.service['startupTerminalQueues'].has('pending')).toBe(true)
    await expect(f.service.activateSession('pending')).resolves.toMatchObject({
      isOpen: true,
      queuedPrompts: [],
    })
    expect(f.terminal.reopen).toHaveBeenCalledOnce()
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith(
      'pending',
      'Wait for a positive owner',
      false,
    )
  })

  it('does not let the new queue pump bypass a still-deferred per-session probe', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Deliver after recovery settles'))
    await f.service.start()
    f.ownership.aggregateError = undefined
    f.ownership.owners.add('pending')
    f.ownership.probeErrors.set('pending', new Error('Ownership unreadable'))
    f.terminal.capture.mockResolvedValue(emptyComposer)
    await f.service.refreshDiscovery()
    f.ownership.probeErrors.clear()
    const probed = f.terminal.has.mock.calls.length

    await f.drainNow()
    expect(f.terminal.has).toHaveBeenCalledTimes(probed)
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.store.get('pending')?.queuedCount).toBe(1)
    expect(f.service['startupTerminalQueues'].has('pending')).toBe(true)

    await f.service.refreshDiscovery()
    await f.drainNow()
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith('pending', 'Deliver after recovery settles', false)
    expect(f.store.get('pending')?.queuedCount).toBe(0)
    await f.service.refreshDiscovery()
    await f.drainNow()
    expect(f.terminal.send).toHaveBeenCalledOnce()
    expect(f.terminal.create).not.toHaveBeenCalled()
  })

  it('continues a healthy startup FIFO while the other queued identity remains deferred', async () => {
    const f = await fixture(['pending', 'healthy'])
    await f.store.enqueuePrompt('pending', prompt('Wait for ownership'))
    await f.store.enqueuePrompt('healthy', prompt('Healthy queued work'))
    await f.service.start()
    f.ownership.aggregateError = undefined
    f.ownership.owners.add('healthy')
    f.ownership.probeErrors.set('pending', new Error('Ownership unreadable'))
    f.terminal.capture.mockResolvedValue(emptyComposer)
    await f.service.refreshDiscovery()
    await f.drainNow('healthy')

    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith('healthy', 'Healthy queued work', false)
    expect(f.store.get('pending')).toMatchObject({ isOpen: true, queuedCount: 1 })
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    await expect(f.service.activateSession('healthy')).resolves.toMatchObject({ isOpen: true })
    await expect(f.service.activateSession('pending')).rejects.toMatchObject({ statusCode: 409 })
    expect(f.client.resumeSession).not.toHaveBeenCalled()
  })

  it('joins late ownership recovery to the parent Clear admission and transcript boundary', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Retain through failed Clear'))
    await f.service.start()
    f.ownership.aggregateError = undefined
    const probe = f.holdProbe()
    const refreshing = f.service.refreshDiscovery()
    await probe.entered
    expect.soft(f.service['admissions'].protectsTranscript('pending')).toBe(true)
    const clearing = f.service.clearConversation('pending')
    const refused = expect(clearing).rejects.toMatchObject({ statusCode: 409 })
    expect(f.service['admissions'].canEnter('pending')).toBe(false)
    probe.fail(new Error('Ownership still unreadable'))
    await Promise.all([refreshing, refused])

    expect(f.service['admissions'].canEnter('pending')).toBe(true)
    expect(f.service['admissions'].protectsTranscript('pending')).toBe(false)
    expect(f.store.get('pending')).toMatchObject({ isOpen: true, queuedCount: 1 })
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    f.ownership.owners.add('pending')
    f.terminal.capture.mockResolvedValue(emptyComposer)
    await f.service.refreshDiscovery()
    await f.drainNow()
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith('pending', 'Retain through failed Clear', false)
  })

  it('keeps original startup intent when suspension is refused during a deferred queue wake', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Keep original startup intent'))
    await f.service.start()
    const entered = gate(undefined)
    const release = gate(undefined)
    const read = f.store.readAfterWrites.bind(f.store)
    vi.spyOn(f.store, 'readAfterWrites').mockImplementationOnce(async (...args) => {
      entered.finish(undefined)
      await release.pending
      return read(...args)
    })
    const suspension = expect(f.service.suspendSession('pending')).rejects.toMatchObject({ statusCode: 409 })
    await entered.pending
    expect(f.service['suspendingSessions'].has('pending')).toBe(true)
    await f.drainNow()
    release.finish(undefined)
    await suspension
    expect(f.service['startupTerminalQueues'].has('pending')).toBe(true)
    expect(f.store.get('pending')?.suspended).not.toBe(true)
    expect(f.terminal.send).not.toHaveBeenCalled()
  })

  it('does not turn dropped uncertain startup demand into permission to create a missing owner', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Held behind uncertain recovery'))
    await f.service.start()
    await f.store.update('pending', (session) => {
      session.failedPrompt = { content: 'An uncertain attempt', failedAt: timestamp, uncertain: true }
    })
    await f.drainNow()
    expect(f.service['startupTerminalQueues'].has('pending')).toBe(false)
    f.ownership.aggregateError = undefined
    await f.service.refreshDiscovery()
    await f.drainNow()
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.store.get('pending')).toMatchObject({
      isOpen: false, queuedCount: 1,
      failedPrompt: { content: 'An uncertain attempt', uncertain: true },
    })
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
  })

  it.each(['stop', 'delete'] as const)(
    'retains lifecycle safety for %s during deferred recovery with native queue demand',
    async (operation) => {
      const f = await fixture()
      await f.store.enqueuePrompt('pending', prompt('Do not cross teardown'))
      await f.service.start()
      f.ownership.aggregateError = undefined
      const probe = f.holdProbe()
      const refreshing = f.service.refreshDiscovery()
      await probe.entered
      const changing = operation === 'stop'
        ? f.service.stop()
        : f.service.deleteSession('pending')
      probe.fail(new Error('Ownership unreadable'))
      await Promise.all([refreshing, changing])
      expect(f.terminal.create).not.toHaveBeenCalled()
      expect(f.terminal.send).not.toHaveBeenCalled()
      expect(f.client.resumeSession).not.toHaveBeenCalled()
      if (operation === 'delete') {
        await f.service.refreshDiscovery()
        expect(f.store.get('pending')).toBeUndefined()
        expect(f.service['startupTerminalQueues'].has('pending')).toBe(false)
      } else {
        const stored = (await f.persisted()).sessions.pending
        expect(stored.managedOpen).toBe(true)
        expect(stored.queuedPrompts).toEqual([prompt('Do not cross teardown')])
      }
    },
  )

  it('restores accepted recovery ownership before deferred startup queue cleanup can drop its intent', async () => {
    const f = await fixture()
    const accepted = 'Already delivered before restart'
    const token = `resend:${randomUUID()}`
    const failed = { content: accepted, failedAt: timestamp, uncertain: true }
    await f.store.enqueuePrompt('pending', prompt('FIFO behind accepted recovery'))
    await f.store.update('pending', (session) => { session.failedPrompt = failed })
    await f.store.claimFailedPrompt('pending', failed, accepted, token)
    await f.store.acceptRecoveryResend('pending', token)
    const entered = gate(undefined)
    const acknowledgement = gate(undefined)
    const clear = f.store.clearFailedPrompt.bind(f.store)
    vi.spyOn(f.store, 'clearFailedPrompt').mockImplementationOnce(async (...args) => {
      entered.finish(undefined)
      await acknowledgement.pending
      return clear(...args)
    })
    f.terminal.capture.mockResolvedValue(emptyComposer)
    await f.service.start()
    await entered.pending
    expect(f.service.getSession('pending')?.failedPrompt).toBeUndefined()
    expect(f.service['startupTerminalQueues'].has('pending')).toBe(true)
    await f.drainNow()
    expect(f.service['startupTerminalQueues'].has('pending')).toBe(true)
    expect(f.store.recoveryResend('pending')?.accepted).toBe(true)
    expect(f.terminal.send).not.toHaveBeenCalled()

    acknowledgement.finish(undefined)
    await vi.waitFor(() => { expect(f.store.get('pending')?.failedPrompt).toBeUndefined() })
    expect(f.service['startupTerminalQueues'].has('pending')).toBe(true)
    expect(f.terminal.send).not.toHaveBeenCalled()
    f.ownership.aggregateError = undefined
    f.ownership.owners.add('pending')
    await f.service.refreshDiscovery()
    await f.drainNow()
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith('pending', 'FIFO behind accepted recovery', false)
    expect(f.terminal.create).not.toHaveBeenCalled()
  })
})

describe('Deferred terminal ownership recovery', () => {
  it.each([false, true])('retries an indeterminate per-session probe after aggregate discovery recovers (queued: %s)', async (queued) => {
    const f = await fixture()
    if (queued) await f.store.enqueuePrompt('pending', prompt('Retain the queue'))
    await f.service.start()
    const retained = f.store.get('pending')!
    f.ownership.aggregateError = undefined
    f.ownership.probeErrors.set('pending', new Error('Transient socket/proc probe failure'))

    await f.service.refreshDiscovery()

    expect.soft(f.store.get('pending')).toMatchObject({
      isOpen: true, status: 'idle', messages: retained.messages,
      queuedPrompts: retained.queuedPrompts, runtime: retained.runtime,
    })
    expect.soft(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    expect.soft((await f.persisted()).sessions.pending.managedOpen).toBe(true)
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.client.resumeSession).not.toHaveBeenCalled()
    expect(f.events).toContainEqual({
      type: 'error', sessionId: 'pending',
      message: 'Terminal ownership probe deferred: Transient socket/proc probe failure',
    })
    await expect(f.service.openSession('pending')).resolves.toMatchObject({
      isOpen: true, messages: retained.messages, queuedPrompts: retained.queuedPrompts,
    })
    await expect(f.service.activateSession('pending')).rejects.toThrow(/discovery/)
    await expect(f.service.listCommands('pending')).rejects.toThrow(/discovery/)
    await expect(f.service.sendMessage('pending', 'Do not assume absence')).rejects.toThrow(/discovery/)
    expect(f.client.createSession).not.toHaveBeenCalled()
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)

    f.ownership.probeErrors.clear()
    await expect(f.service.listCommands('pending')).rejects.toThrow(/discovery/)
    expect(f.client.resumeSession).not.toHaveBeenCalled()
    await f.service.refreshDiscovery()
    if (queued) {
      expect(f.terminal.create).not.toHaveBeenCalled()
      expect(f.store.get('pending')?.isOpen).toBe(false)
      expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
      f.ownership.owners.add('pending')
      await f.service.refreshDiscovery()
    } else {
      expect(f.terminal.create).toHaveBeenCalledExactlyOnceWith(
        'pending', f.directory, 'pending', false, retained.runtime,
      )
    }
    await expect(f.service.activateSession('pending')).resolves.toMatchObject({ isOpen: true })
    await f.service.refreshDiscovery()
    expect(f.terminal.create).toHaveBeenCalledTimes(queued ? 0 : 1)
    expect(f.client.resumeSession).not.toHaveBeenCalled()
  })

  it('keeps deferred ownership eligible in the real persisted state across restart', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Durable pending work'))
    await f.service.start()
    f.ownership.aggregateError = undefined
    f.ownership.probeErrors.set('pending', new Error('Socket unreadable'))
    await f.service.refreshDiscovery()
    await f.service.stop()

    const restartedStore = new SessionStore(f.stateDirectory)
    await restartedStore.initialize()
    expect(restartedStore.shouldRecoverTerminalSession('pending')).toBe(true)
    expect(restartedStore.get('pending')).toMatchObject({
      isOpen: true, messages: [expect.objectContaining({ content: 'Retain pending' })],
      queuedPrompts: [prompt('Durable pending work')],
    })
    f.ownership.probeErrors.clear()
    const restarted = new AgentService(
      restartedStore, f.client, f.active, f.stopper,
      async () => [], async () => undefined,
      f.terminal, async () => undefined, async () => undefined,
    )
    fixtures.find((entry) => entry.service === f.service)!.service = restarted
    await restarted.start()
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(restartedStore.shouldRecoverTerminalSession('pending')).toBe(true)
    await expect(restarted.activateSession('pending')).resolves.toMatchObject({
      isOpen: true,
      queuedPrompts: [],
    })
    expect(f.terminal.reopen).toHaveBeenCalledOnce()
    expect(f.terminal.send).toHaveBeenCalledExactlyOnceWith(
      'pending',
      'Durable pending work',
      false,
    )
    await restarted.refreshDiscovery()
    await expect(restarted.activateSession('pending')).resolves.toMatchObject({ isOpen: true })
    expect(f.terminal.reopen).toHaveBeenCalledOnce()
  })

  it('recovers and admits healthy sessions while a different ownership probe remains unreadable', async () => {
    const f = await fixture(['pending', 'healthy'])
    await f.service.start()
    f.ownership.aggregateError = undefined
    f.ownership.probeErrors.set('pending', new Error('Socket unreadable'))
    await f.service.refreshDiscovery()

    expect(f.terminal.create).toHaveBeenCalledExactlyOnceWith(
      'healthy', f.directory, 'healthy', false, f.store.get('healthy')!.runtime,
    )
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    await expect(f.service.activateSession('healthy')).resolves.toMatchObject({ isOpen: true })
    await expect(f.service.sendMessage('healthy', 'Use the healthy owner')).resolves.toMatchObject({
      isOpen: true,
    })
    expect(f.terminal.send).toHaveBeenCalledOnce()
    await expect(f.service.activateSession('pending')).rejects.toThrow(/discovery/)
    await expect(f.service.listCommands('pending')).rejects.toThrow(/discovery/)
    await expect(f.service.sendMessage('pending', 'Do not attach')).rejects.toThrow(/discovery/)
    const retained: SessionDetail = f.store.get('pending')!
    await expect(f.service.openSession('pending')).resolves.toEqual(retained)
    expect(f.client.resumeSession).not.toHaveBeenCalled()
  })

  it('admits a healthy recovered owner while another probe is still in flight', async () => {
    const f = await fixture(['pending', 'healthy'])
    await f.service.start()
    f.ownership.aggregateError = undefined
    const probe = f.holdProbe()
    let finished = false
    const refreshing = f.service.refreshDiscovery().then(() => { finished = true })
    await probe.entered

    expect(f.store.get('pending')?.isOpen).toBe(true)
    await vi.waitFor(async () => {
      await expect(f.service.activateSession('healthy')).resolves.toMatchObject({ isOpen: true })
    })
    expect(finished).toBe(false)
    await expect(f.service.sendMessage('healthy', 'Use the confirmed owner')).resolves.toMatchObject({
      isOpen: true,
    })
    expect(f.terminal.send).toHaveBeenCalledOnce()
    expect(f.terminal.create).toHaveBeenCalledExactlyOnceWith(
      'healthy', f.directory, 'healthy', false, f.store.get('healthy')!.runtime,
    )
    probe.fail(new Error('Probe timed out'))
    await refreshing
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
  })

  it('continues independent persisted SDK startup without attaching the deferred terminal', async () => {
    const f = await fixture()
    await f.store.enqueuePrompt('pending', prompt('Terminal work'))
    await f.store.create({
      ...f.store.get('pending')!, id: 'sdk',
      queuedPrompts: [prompt('SDK work')], queuedCount: 1,
    }, { backend: 'sdk', managedOpen: true })
    const sdk = sdkSession('sdk')
    vi.mocked(f.client.resumeSession).mockImplementation(async (id) => {
      expect(id).toBe('sdk')
      return sdk
    })
    await f.service.start()
    f.ownership.aggregateError = undefined
    f.ownership.probeErrors.set('pending', new Error('Socket unreadable'))

    await f.service.refreshDiscovery()
    await vi.waitFor(() => { expect(sdk.send).toHaveBeenCalledOnce() })
    expect(f.client.resumeSession).toHaveBeenCalledExactlyOnceWith('sdk', expect.any(Object))
    expect(f.store.get('pending')?.queuedPrompts).toEqual([prompt('Terminal work')])
    expect(f.terminal.send).not.toHaveBeenCalled()
    await f.service.refreshDiscovery()
    expect(sdk.send).toHaveBeenCalledOnce()
  })

  it.each([true, false])(
    'adopts a retained native owner without a duplicate launch (listed: %s)',
    async (listed) => {
      const f = await fixture()
      await f.service.start()
      f.ownership.aggregateError = undefined
      f.ownership.owners.add('pending')
      f.ownership.probeErrors.set('pending', new Error('Unreadable process owner'))
      if (!listed) f.active.mockResolvedValue([])
      await f.service.refreshDiscovery()
      await f.service.refreshTranscripts()

      expect(f.terminal.create).not.toHaveBeenCalled()
      await expect(f.service.activateSession('pending')).rejects.toThrow(/discovery/)
      expect(f.store.get('pending')).toMatchObject({ isOpen: true, status: 'idle' })
      f.ownership.probeErrors.clear()
      await f.service.refreshDiscovery()
      await expect(f.service.activateSession('pending')).resolves.toMatchObject({ isOpen: true })
      expect(f.terminal.create).not.toHaveBeenCalled()
      expect(f.client.resumeSession).not.toHaveBeenCalled()
    },
  )

  it('does not relaunch a settled owner that exits while a different recovery remains pending', async () => {
    const f = await fixture(['pending', 'healthy'])
    await f.service.start()
    f.ownership.aggregateError = undefined
    f.ownership.probeErrors.set('pending', new Error('Socket unreadable'))
    await f.service.refreshDiscovery()
    expect(f.terminal.create).toHaveBeenCalledOnce()

    f.ownership.owners.delete('healthy')
    await f.service.refreshDiscovery()
    expect(f.terminal.create).toHaveBeenCalledOnce()
    expect(f.store.get('healthy')?.isOpen).toBe(false)
    expect(f.store.get('pending')?.isOpen).toBe(true)
    f.ownership.probeErrors.clear()
    await f.service.refreshDiscovery()
    expect(f.terminal.create.mock.calls.map(([id]) => id)).toEqual(['healthy', 'pending'])
  })

  it('keeps the unconfirmed transcript and runtime view until its own probe succeeds', async () => {
    const f = await fixture()
    await f.store.update('pending', (session) => {
      session.runtime!.updateAvailable = 'Retained update notice'
    })
    await f.service.start()
    const retained = f.store.get('pending')!
    f.ownership.aggregateError = undefined
    f.ownership.owners.add('pending')
    f.ownership.probeErrors.set('pending', new Error('Socket unreadable'))
    f.eventVersion.mockResolvedValue('changed-events')
    f.readEvents.mockResolvedValue([{
      id: 'new-message', parentId: null, timestamp,
      type: 'user.message', data: { content: 'Confirmed transcript' },
    }])

    await f.service.refreshDiscovery()
    await f.service.refreshTranscripts()
    f.active.mockResolvedValue([])
    await f.service.refreshDiscovery()
    expect(f.readEvents).not.toHaveBeenCalled()
    expect(f.store.get('pending')).toMatchObject({
      messages: retained.messages, runtime: retained.runtime,
      isOpen: true, status: retained.status,
    })

    f.ownership.probeErrors.clear()
    await f.service.refreshDiscovery()
    expect(f.store.get('pending')?.messages).toEqual([
      expect.objectContaining({ content: 'Confirmed transcript' }),
    ])
    expect(f.terminal.create).not.toHaveBeenCalled()
  })

  it('reconciles only the newly confirmed startup dispatches on each retry', async () => {
    const f = await fixture(['pending', 'healthy'])
    await f.store.markTerminalPromptDispatched('pending', timestamp)
    await f.store.markTerminalPromptDispatched('healthy', timestamp)
    await f.service.start()
    f.ownership.aggregateError = undefined
    f.ownership.probeErrors.set('pending', new Error('Socket unreadable'))

    await f.service.refreshDiscovery()
    expect(f.store.queueDispatchAt('pending')).toBe(timestamp)
    expect(f.store.get('pending')).toMatchObject({ isOpen: true, status: 'running' })
    expect(f.store.queueDispatchAt('healthy')).toBeUndefined()

    const laterDispatch = '2026-09-06T01:00:00.000Z'
    await f.store.markTerminalPromptDispatched('healthy', laterDispatch)
    await f.service.refreshDiscovery()
    expect(f.store.queueDispatchAt('healthy')).toBe(laterDispatch)
    expect(f.store.queueDispatchAt('pending')).toBe(timestamp)

    f.ownership.probeErrors.clear()
    await f.service.refreshDiscovery()
    expect(f.store.queueDispatchAt('pending')).toBeUndefined()
    expect(f.store.queueDispatchAt('healthy')).toBe(laterDispatch)
    expect(f.terminal.create.mock.calls.map(([id]) => id)).toEqual(['healthy', 'pending'])
  })

  it.each(['stop', 'delete', 'suspend'] as const)(
    'orders %s behind a failed pending probe without launching a runtime',
    async (operation) => {
      const f = await fixture()
      await f.service.start()
      f.ownership.aggregateError = undefined
      const probe = f.holdProbe()
      const refreshing = f.service.refreshDiscovery()
      await probe.entered
      const changing = operation === 'stop'
        ? f.service.stop()
        : operation === 'delete'
          ? f.service.deleteSession('pending')
          : f.service.suspendSession('pending')
      const changed = operation === 'suspend'
        ? expect(changing).rejects.toThrow(/discovery/)
        : expect(changing).resolves.toBeUndefined()
      expect(f.stopper).not.toHaveBeenCalled()
      expect(f.terminal.stop).not.toHaveBeenCalled()
      probe.fail(new Error('Probe became unreadable'))
      await Promise.all([refreshing, changed])
      expect(f.terminal.create).not.toHaveBeenCalled()
      expect(f.client.resumeSession).not.toHaveBeenCalled()
      if (operation === 'delete') {
        expect(f.store.get('pending')).toBeUndefined()
        await f.service.refreshDiscovery()
        expect(f.terminal.create).not.toHaveBeenCalled()
      } else {
        expect((await f.persisted()).sessions.pending.managedOpen).toBe(true)
        if (operation === 'suspend') {
          expect(f.store.get('pending')?.suspended).not.toBe(true)
          await f.service.refreshDiscovery()
          await expect(f.service.suspendSession('pending')).resolves.toMatchObject({
            suspended: true, isOpen: true,
          })
          await f.service.refreshDiscovery()
          expect(f.terminal.create).toHaveBeenCalledOnce()
        }
      }
    },
  )

  it('preserves strict deletion refusal while an unresolved owner cannot be stopped', async () => {
    const f = await fixture()
    await f.service.start()
    f.ownership.aggregateError = undefined
    const failure = new Error('Destructive ownership check unreadable')
    f.ownership.probeErrors.set('pending', failure)
    await f.service.refreshDiscovery()
    const retained = f.store.get('pending')

    await expect(f.service.deleteSession('pending')).rejects.toBe(failure)
    expect(f.store.get('pending')).toEqual(retained)
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    expect(f.terminal.create).not.toHaveBeenCalled()
    f.ownership.probeErrors.clear()
    await f.service.refreshDiscovery()
    expect(f.terminal.create).toHaveBeenCalledOnce()
  })

  it('uses committed configuration changes made while a recovery probe is pending', async () => {
    const f = await fixture()
    await f.service.start()
    f.ownership.aggregateError = undefined
    const probe = f.holdProbe()
    const refreshing = f.service.refreshDiscovery()
    await probe.entered
    const latest = await f.store.update('pending', (session) => {
      session.cwd = path.join(f.directory, 'changed')
      session.title = 'Changed while probing'
      session.runtime = {
        allowAllPermissions: true, model: 'changed-model',
        reasoningEffort: 'low', contextTier: 'default', mode: 'plan',
      }
    })
    probe.finish(false)
    await refreshing

    expect(f.terminal.create).toHaveBeenCalledExactlyOnceWith(
      'pending', latest.cwd, latest.title, true, latest.runtime,
    )
  })

  it.each(['closed', 'suspended', 'deleted'] as const)(
    'rechecks %s eligibility after a pending ownership probe',
    async (change) => {
      const f = await fixture()
      await f.service.start()
      f.ownership.aggregateError = undefined
      const probe = f.holdProbe()
      const refreshing = f.service.refreshDiscovery()
      await probe.entered
      if (change === 'closed') await f.store.setOpen('pending', false, true)
      else if (change === 'suspended') await f.store.setSuspended('pending', true)
      else await f.store.remove('pending')
      probe.finish(false)
      await refreshing
      await f.service.refreshDiscovery()

      expect(f.terminal.create).not.toHaveBeenCalled()
      expect(f.store.shouldRecoverTerminalSession('pending')).toBe(false)
      if (change === 'suspended') {
        expect(f.store.get('pending')).toMatchObject({ suspended: true, isOpen: true })
      }
    },
  )

  it('reports a genuine launch failure and closes only that recovery candidate', async () => {
    const f = await fixture(['pending', 'healthy'])
    await f.service.start()
    f.ownership.aggregateError = undefined
    const create = f.terminal.create.getMockImplementation()!
    f.terminal.create.mockImplementation(async (...args) => {
      if (args[0] === 'pending') throw new Error('Launch refused')
      return create(...args)
    })
    await f.service.refreshDiscovery()

    expect(f.store.get('pending')).toMatchObject({
      isOpen: false, status: 'error', activity: 'Boot recovery failed',
    })
    expect((await f.persisted()).sessions.pending.managedOpen).toBe(false)
    expect(f.events).toContainEqual({
      type: 'error', sessionId: 'pending', message: 'Unable to recover terminal session: Launch refused',
    })
    await expect(f.service.activateSession('healthy')).resolves.toMatchObject({ isOpen: true })
    await f.service.refreshDiscovery()
    expect(f.terminal.create.mock.calls.filter(([id]) => id === 'pending')).toHaveLength(1)
  })

  it('does not swallow real discovery persistence refusal before probing ownership', async () => {
    const f = await fixture()
    f.ownership.aggregateError = undefined
    await f.blockWrites()
    await expect(f.service.start()).rejects.toMatchObject({ code: 'EISDIR' })
    expect(f.terminal.has).not.toHaveBeenCalled()
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    expect(f.events.filter((event) => event.type === 'error')).toEqual([])
    await f.unblockWrites()
    await f.service.refreshDiscovery()
    expect(f.terminal.create).toHaveBeenCalledOnce()
  })

  it('proves persistence before recovering a terminal whose discovery was deferred at startup', async () => {
    const f = await fixture()
    await expect(f.service.start()).resolves.toBeUndefined()
    expect(f.terminal.create).not.toHaveBeenCalled()
    f.ownership.aggregateError = undefined
    await f.blockWrites()
    const seen = f.events.length

    await f.service.refreshDiscovery()
    expect(f.terminal.has).not.toHaveBeenCalled()
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    expect(f.events.slice(seen)).toContainEqual({
      type: 'error', sessionId: '', message: expect.stringContaining('EISDIR'),
    })

    await f.unblockWrites()
    await f.service.refreshDiscovery()
    expect(f.terminal.create).toHaveBeenCalledOnce()
    await expect(f.service.activateSession('pending')).resolves.toMatchObject({ isOpen: true })
  })

  it('runs an unchanged periodic discovery cycle without copying histories or writing state', async () => {
    const f = await fixture([])
    f.ownership.aggregateError = undefined
    const history = Array.from({ length: 50 }, (_unused, index) => ({
      id: `message-${index}`, role: 'user' as const, content: `Retained history ${index}`,
      createdAt: timestamp,
    }))
    const ids = Array.from({ length: 128 }, (_unused, index) => `listed-${index}`)
    for (const id of ids) {
      await f.store.create({
        id, cwd: f.directory, title: id, updatedAt: timestamp,
        status: 'idle', isOpen: false, messages: history,
      }, { backend: 'sdk' })
    }
    // A live terminal too, so the per-terminal title lookup runs every cycle.
    await f.store.create({
      id: 'live-terminal', cwd: f.directory, title: 'live-terminal', updatedAt: timestamp,
      status: 'idle', isOpen: true, messages: history,
    }, { backend: 'terminal', managedOpen: true })
    f.ownership.owners.add('live-terminal')
    const rename = vi.fn(async () => {})
    Object.assign(f.terminal, { rename })
    vi.mocked(f.client.listSessions).mockResolvedValue(ids.map((id) => ({
      sessionId: id,
      summary: id,
      startTime: new Date(timestamp),
      modifiedTime: new Date(timestamp),
      isRemote: false,
      context: { cwd: f.directory, workingDirectory: f.directory },
    })) as unknown as Awaited<ReturnType<CopilotClientLike['listSessions']>>)
    await f.service.start()
    await f.service.refreshDiscovery()
    const statePath = path.join(f.stateDirectory, 'state.json')
    const before = await readFile(statePath, 'utf8')
    const revisions = Object.fromEntries(ids.map((id) => [id, f.store.get(id)!.revision]))
    const list = vi.spyOn(f.store, 'list')
    const get = vi.spyOn(f.store, 'get')
    const recoverable = vi.spyOn(f.store, 'terminalRecoverySessions')

    for (let cycle = 0; cycle < 3; cycle += 1) await f.service.refreshDiscovery()

    expect(f.client.listSessions).toHaveBeenCalled()
    expect(rename).toHaveBeenCalledWith('live-terminal', 'live-terminal')
    expect(list).not.toHaveBeenCalled()
    expect(get).not.toHaveBeenCalled()
    expect(recoverable).not.toHaveBeenCalled()
    expect(await readFile(statePath, 'utf8')).toBe(before)
    list.mockRestore()
    get.mockRestore()
    expect(Object.fromEntries(ids.map((id) => [id, f.store.get(id)!.revision]))).toEqual(revisions)
  })

  it('does not reclassify a refused post-launch state write as a launch failure', async () => {
    const f = await fixture()
    f.ownership.aggregateError = undefined
    const create = f.terminal.create.getMockImplementation()!
    f.terminal.create.mockImplementationOnce(async (...args) => {
      const owner = await create(...args)
      await f.blockWrites()
      return owner
    })
    await expect(f.service.start()).rejects.toMatchObject({ code: 'EISDIR' })
    expect(f.store.shouldRecoverTerminalSession('pending')).toBe(true)
    expect((await f.persisted()).sessions.pending.managedOpen).toBe(true)
    expect(f.events.filter((event) => event.type === 'error')).toEqual([])
    await f.unblockWrites()
    await f.service.refreshDiscovery()

    await expect(f.service.activateSession('pending')).resolves.toMatchObject({ isOpen: true })
    expect(f.terminal.create).toHaveBeenCalledOnce()
    expect(f.client.resumeSession).not.toHaveBeenCalled()
  })

  it('surfaces persistence refusal while recording a genuine launch failure', async () => {
    const f = await fixture()
    f.ownership.aggregateError = undefined
    f.terminal.create.mockImplementationOnce(async () => {
      await f.blockWrites()
      throw new Error('Launch refused')
    })
    await expect(f.service.start()).rejects.toMatchObject({ code: 'EISDIR' })
    expect(f.events).toContainEqual({
      type: 'error', sessionId: 'pending', message: 'Unable to recover terminal session: Launch refused',
    })
    expect((await f.persisted()).sessions.pending.managedOpen).toBe(true)
    await f.unblockWrites()
    await f.store.readAfterWrites('pending')
  })

  it('rejects invalid stored state instead of treating it as an ownership problem', async () => {
    const f = await fixture()
    await writeFile(path.join(f.stateDirectory, 'state.json'), '{"version":2,"sessions":{}}')
    await expect(f.service.start()).rejects.toThrow('Unsupported Agentic Remote state format')
    expect(f.client.start).not.toHaveBeenCalled()
    expect(f.active).not.toHaveBeenCalled()
  })

  it.each(['start', 'listSessions'] as const)(
    'does not swallow SDK %s errors during startup',
    async (method) => {
      const f = await fixture()
      f.ownership.aggregateError = undefined
      const failure = new Error('SDK socket unavailable')
      vi.mocked(f.client[method]).mockRejectedValue(failure)
      await expect(f.service.start()).rejects.toBe(failure)
      expect(f.terminal.has).not.toHaveBeenCalled()
      expect(f.terminal.create).not.toHaveBeenCalled()
      expect((await f.persisted()).sessions.pending.managedOpen).toBe(true)
    },
  )
})

describe('External terminal recovery intent', () => {
  async function restart(f: Awaited<ReturnType<typeof fixture>>) {
    await f.service.stop()
    const store = new SessionStore(f.stateDirectory)
    await store.initialize()
    const service = new AgentService(
      store, f.client, f.active, f.stopper,
      async () => [], async () => undefined,
      f.terminal, async () => undefined, async () => undefined,
    )
    fixtures.find((entry) => entry.service === f.service)!.service = service
    await service.start()
    return { store, service }
  }

  it('does not relaunch finished external runs after a restart', async () => {
    const f = await fixture([])
    f.ownership.aggregateError = undefined
    const runs = Array.from({ length: 10 }, (_, index) => `external-run-${index}`)
    for (const id of runs) f.ownership.owners.add(id)

    await f.service.start()
    for (const id of runs) {
      expect(f.store.get(id)).toMatchObject({ isOpen: true, executionMode: 'tmux' })
      expect(f.store.shouldRecoverTerminalSession(id)).toBe(false)
    }

    f.ownership.owners.clear()
    await f.service.refreshDiscovery()
    for (const id of runs) {
      expect(f.store.get(id)?.isOpen).toBe(false)
      expect((await f.persisted()).sessions[id].managedOpen).not.toBe(true)
    }

    const restarted = await restart(f)
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(restarted.store.terminalRecoverySessions()).toEqual([])
    for (const id of runs) {
      expect(restarted.store.get(id)).toMatchObject({ isOpen: false, executionMode: 'tmux' })
    }
  })

  it('keeps managed recovery for app-owned and app-driven terminals only', async () => {
    const f = await fixture(['managed'])
    f.ownership.aggregateError = undefined
    for (const id of ['managed', 'driven', 'observed']) f.ownership.owners.add(id)

    await f.service.start()
    expect(f.terminal.create).not.toHaveBeenCalled()
    expect(f.store.shouldRecoverTerminalSession('managed')).toBe(true)
    expect(f.store.shouldRecoverTerminalSession('driven')).toBe(false)
    await expect(f.service.sendMessage('driven', 'Continue from the app')).resolves.toMatchObject({
      isOpen: true,
    })
    expect(f.terminal.send).toHaveBeenCalledOnce()
    expect(f.store.shouldRecoverTerminalSession('driven')).toBe(true)
    expect(f.store.shouldRecoverTerminalSession('observed')).toBe(false)

    f.ownership.owners.clear()
    await f.service.refreshDiscovery()
    await restart(f)
    expect(f.terminal.create.mock.calls.map(([id]) => id).sort()).toEqual(['driven', 'managed'])
  })
})
