import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
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
  return {
    sessionId,
    on: () => () => {},
    sendAndWait: vi.fn(async () => undefined),
    getEvents: async () => [],
    abort: async () => {},
    disconnect: async () => {},
    rpc: {
      commands: {
        list: async () => ({ commands: [] }),
        invoke: async () => ({ kind: 'text', text: 'Unused' }),
        enqueue: async () => ({ queued: true }),
      },
      name: { set: async () => {} },
      model: {
        getCurrent: async () => ({ modelId: 'fixture-model' }),
        switchTo: async () => ({ modelId: 'fixture-model' }),
      },
      mode: { set: async () => {} },
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

describe('PR167 reviewed-parent composition', () => {
  const emptyComposer = ['Synthetic idle owner', '╻▄▄▄▄▄▄▄▄▄▄', '┃ ', '╹▀▀▀▀▀▀▀▀▀▀', ' / commands'].join('\n')

  it('starts with native queued demand while aggregate discovery is indeterminate', async () => {
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
    await expect(f.service.activateSession('pending')).rejects.toMatchObject({ statusCode: 409 })
    expect(f.client.resumeSession).not.toHaveBeenCalled()
  })

  it('does not create or force open an absent owner merely because startup work is queued', async () => {
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
    await expect(f.service.activateSession('pending')).rejects.toMatchObject({ statusCode: 409 })
    expect(f.client.resumeSession).not.toHaveBeenCalled()
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
    await expect(restarted.activateSession('pending')).rejects.toMatchObject({ statusCode: 409 })
    f.ownership.owners.add('pending')
    await restarted.refreshDiscovery()
    await expect(restarted.activateSession('pending')).resolves.toMatchObject({ isOpen: true })
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
    await vi.waitFor(() => { expect(sdk.sendAndWait).toHaveBeenCalledOnce() })
    expect(f.client.resumeSession).toHaveBeenCalledExactlyOnceWith('sdk', expect.any(Object))
    expect(f.store.get('pending')?.queuedPrompts).toEqual([prompt('Terminal work')])
    expect(f.terminal.send).not.toHaveBeenCalled()
    await f.service.refreshDiscovery()
    expect(sdk.sendAndWait).toHaveBeenCalledOnce()
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
