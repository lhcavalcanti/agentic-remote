import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail, SessionRecoveryReason } from '../shared/contracts.js'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
} from './agent-service.js'
import { SessionStore } from './session-store.js'
import { buildApp } from './app.js'
import type { TerminalSessionController } from './terminal-session.js'

const fixtures: Array<{ directory: string; store: SessionStore; service?: AgentService }> = []
const releases: Array<() => void> = []

function gate() {
  let release!: () => void
  const promise = new Promise<void>((resolve) => { release = resolve })
  releases.push(release)
  return { promise, release }
}

async function recoverAndSeed(service: AgentService, reason: SessionRecoveryReason) {
  fixtures.find((fixture) => fixture.store === service.store)!.service = service
  const recovered = await service.recoverConversation('broken', reason)
  return await service['recoverySeedDispatches'].get(recovered.id) || recovered
}

function sdkSession(
  sessionId: string,
  prompts: string[],
): CopilotSessionLike {
  return {
    sessionId,
    on: () => () => {},
    send: vi.fn(async ({ prompt }) => {
      prompts.push(prompt)
      return randomUUID()
    }),
    sendAndWait: vi.fn(async (content) => {
      prompts.push(content)
      return undefined
    }),
    getEvents: async () => [],
    abort: async () => {},
    disconnect: async () => {},
    rpc: {
      commands: {
        list: async () => ({ commands: [] }),
        invoke: async () => ({ kind: 'text', text: '' }),
        enqueue: async () => ({ queued: true as const, queueId: 'queued-command' }),
      },
      name: { set: async () => {} },
      model: {
        getCurrent: async () => ({ modelId: 'gpt-test' }),
        switchTo: async () => ({ modelId: 'gpt-test' }),
      },
      mode: { set: async () => ({ status: 'applied', modelChanged: false }) },
    },
  }
}

async function recoveryFixture(backend: 'sdk' | 'terminal') {
  const directory = path.resolve(`.issue235-recovery-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  const store = new SessionStore(path.join(directory, 'state'))
  await store.initialize()
  await store.create({
    id: 'broken',
    cwd: directory,
    title: 'Broken session',
    updatedAt: '2026-09-09T00:00:00.000Z',
    status: 'error',
    messages: [
      {
        id: 'goal-id',
        role: 'user',
        content: 'Preserve this goal',
        createdAt: '2026-09-09T00:00:00.000Z',
      },
      {
        id: 'activity-id',
        role: 'activity',
        content: 'opaque activity',
        createdAt: '2026-09-09T00:00:01.000Z',
      },
    ],
    queuedPrompts: [{
      id: 'existing-queue',
      content: 'Queued after seed',
      createdAt: '2026-09-09T00:00:02.000Z',
    }],
    runtime: {
      model: 'gpt-test',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'autopilot',
      allowAllPermissions: false,
    },
  }, { backend, managedOpen: true })
  const cleanup: { directory: string; store: SessionStore; service?: AgentService } = {
    directory,
    store,
  }
  fixtures.push(cleanup)
  return { directory, store, cleanup }
}

function client(createSession: CopilotClientLike['createSession']): CopilotClientLike {
  return {
    start: async () => {},
    stop: async () => [],
    createSession,
    resumeSession: async () => { throw new Error('Unexpected resume') },
    listSessions: async () => [],
    deleteSession: async () => {},
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
    },
  }
}

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.all(fixtures.splice(0).map(async ({ directory, store, service }) => {
    await service?.stop().catch(() => undefined)
    await store.close().catch(() => undefined)
    await rm(directory, { recursive: true, force: true })
  }))
  vi.unstubAllEnvs()
})

describe('conversation recovery', () => {
  it.each(['complete', 'fail'])(
    'returns a remote replacement and carries hub metadata before a held seed can %s',
    async (outcome) => {
      vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
      const { directory, store, cleanup } = await recoveryFixture('sdk')
      const prompts: string[] = []
      const seed = gate()
      const service = new AgentService(
        store,
        client(async (config) => {
          const session = sdkSession(config.sessionId!, prompts)
          session.sendAndWait = vi.fn(async (content) => {
            prompts.push(content)
            if (content !== 'Queued after seed') {
              await seed.promise
              if (outcome === 'fail') throw new Error('Delayed seed failure')
            }
            return undefined
          })
          return session
        }),
      )
      cleanup.service = service
      const hubService = new AgentService(
        new SessionStore(path.join(directory, 'hub-state')),
        client(async () => { throw new Error('Recovery must stay on its node') }),
      )
      const hub = await buildApp({
        dataDirectory: path.join(directory, 'hub'),
        logger: false, role: 'hub', service: hubService,
      })
      const node = await buildApp({
        dataDirectory: path.join(directory, 'node'),
        logger: false, role: 'node', service,
      })
      try {
        await node.app.listen({ host: '127.0.0.1', port: 0 })
        const address = node.app.server.address()
        if (!address || typeof address === 'string') throw new Error('Node has no TCP address')
        const paired = await hub.app.inject({
          method: 'POST', url: '/api/computers',
          payload: {
            baseUrl: `http://127.0.0.1:${address.port}`,
            token: node.identity.token, name: 'isolated-recovery-node',
          },
        })
        expect(paired.statusCode).toBe(201)
        const computerId = node.identity.info.id
        const root = await hub.knowledgeStore!.addRoot({
          computerId, computerName: 'isolated-recovery-node',
          path: directory, name: 'Recovery notes',
        })
        await hub.sessionKnowledgeStore!.update(computerId, 'broken', {
          rootId: root.id, expectedRevision: 0,
        })
        await hub.pushService!.setSessionMuted(computerId, 'broken', true)
        let recovered: SessionDetail | undefined
        const recovering = hub.app.inject({
          method: 'POST',
          url: `/api/computers/${computerId}/sessions/broken/recover`,
          payload: { reason: 'provider-error' },
        }).then((response) => {
          expect(response.statusCode).toBe(200)
          recovered = response.json().session
        })
        await vi.waitFor(() => expect(recovered?.id).toBeDefined())
        await recovering
        await vi.waitFor(() => expect(prompts).toHaveLength(1))
        expect(recovered).toMatchObject({
          activity: 'Waiting to rebuild provider context. Preserved queued work is blocked.',
          title: 'Broken session', cwd: directory, replacedSessionIds: ['broken'],
          queuedPrompts: [{ content: 'Queued after seed' }],
        })
        const id = recovered!.id
        expect(store.recoverySeed(id)?.state).toBe('dispatching')
        expect(hub.sessionKnowledgeStore!.get(computerId, id).rootId).toBe(root.id)
        expect(hub.pushService!.settings().mutedSessions).toContain(`${computerId}:${id}`)
        expect(hub.manager!.listComputers().find((computer) => computer.id === computerId)?.online)
          .toBe(true)
        expect((await node.app.inject('/health')).statusCode).toBe(200)
        seed.release()
        await vi.waitFor(() => {
          if (outcome === 'complete') {
            expect(store.recoverySeed(id)).toBeUndefined()
            expect(prompts).toHaveLength(2)
          } else {
            expect(store.recoverySeed(id)).toMatchObject({
              state: 'failed', error: expect.stringContaining('Delayed seed failure'),
            })
            expect(prompts).toHaveLength(1)
          }
        })
        const snapshot = await hub.app.inject(`/api/computers/${computerId}/sessions/${id}`)
        expect(snapshot.statusCode).toBe(200)
        if (outcome === 'fail') {
          expect(snapshot.json().session).toMatchObject({
            id, status: 'error',
            activity: expect.stringContaining('delivery is uncertain'),
            queuedPrompts: [{ content: 'Queued after seed' }],
          })
        }
      } finally {
        seed.release()
        await Promise.all([hub.app.close(), node.app.close()])
      }
    },
  )

  it.each([
    '2026-09-09T23:59:59.999Z',
    '2026-09-10T00:00:00.001Z',
  ])('dispatches independent pending seeds without waiting for a slow provider turn at %s', async (now) => {
    const { store, cleanup } = await recoveryFixture('sdk')
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      vi.setSystemTime(new Date(now))
      await store.replaceWithRecoveredSession('broken', 'replacement', 'manual', 1, false, 'Slow seed')
      await store.create({
        id: 'other', cwd: store.get('replacement')!.cwd, title: 'Other recovery',
        updatedAt: '2026-09-09T00:00:00.000Z', status: 'error', messages: [],
      }, { backend: 'sdk', managedOpen: true })
      await store.replaceWithRecoveredSession('other', 'other-replacement', 'manual', 0, false, 'Fast seed')
      expect(store.get('other-replacement')?.updatedAt).toBe(now)
    } finally {
      vi.useRealTimers()
    }
    await store.update('other-replacement', (session) => {
      session.updatedAt = '2026-09-09T00:00:00.000Z'
    })
    await store.update('replacement', (session) => {
      session.updatedAt = '2026-09-10T00:00:00.000Z'
    })
    const seed = gate()
    const prompts: string[] = []
    const sdkClient = client(async () => { throw new Error('Unexpected SDK creation') })
    sdkClient.resumeSession = async (id) => {
      const session = sdkSession(id, prompts)
      session.sendAndWait = async (content) => {
        prompts.push(content)
        if (content === 'Slow seed') await seed.promise
        return undefined
      }
      return session
    }
    const service = new AgentService(store, sdkClient)
    cleanup.service = service
    expect(store.list()[0].id).toBe('replacement')

    await service.start()

    await vi.waitFor(() => expect(prompts).toEqual(['Slow seed', 'Fast seed']))
    await vi.waitFor(() => expect(store.recoverySeed('other-replacement')).toBeUndefined())
    expect(store.recoverySeed('replacement')?.state).toBe('dispatching')
    expect(store.get('replacement')?.queuedPrompts).toHaveLength(1)
    seed.release()
    await vi.waitFor(() => expect(prompts).toEqual(['Slow seed', 'Fast seed', 'Queued after seed']))
  })

  it('returns a pending terminal replacement without letting new work bypass its held seed', async () => {
    const { store, cleanup } = await recoveryFixture('terminal')
    const seed = gate()
    const send = vi.fn(async () => {
      await seed.promise
      return true
    })
    const service = new AgentService(
      store,
      client(async () => { throw new Error('Unexpected SDK creation') }),
      async () => [], async () => {}, async () => [], async () => undefined,
      {
        has: async () => true,
        reset: async (_id, _replacement, _cwd, _runtime, commit) => {
          await commit()
          return true
        },
        sendWhenIdle: send, send, cancel: async () => true,
      },
    )
    cleanup.service = service
    service['externalSessionIds'].add('broken')

    const recovered = await service.recoverConversation('broken', 'manual')

    expect(recovered.activity).toContain('Waiting to rebuild provider context')
    await vi.waitFor(() => expect(send).toHaveBeenCalledOnce())
    await expect(service.sendMessage(recovered.id, 'Must not bypass')).rejects
      .toMatchObject({ statusCode: 409, message: expect.stringContaining('recovery brief') })
    await expect(service.clearConversation(recovered.id)).rejects
      .toMatchObject({ statusCode: 409 })
    await expect(service.recoverConversation(recovered.id, 'manual')).rejects
      .toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('recovery brief has not settled'),
      })
    const queued = await service.sendMessage(recovered.id, 'Added after recovery', true)
    expect(queued.queuedPrompts?.map((prompt) => prompt.content)).toEqual([
      'Queued after seed', 'Added after recovery',
    ])
    expect(send).toHaveBeenCalledOnce()
    seed.release()
    await service['recoverySeedDispatches'].get(recovered.id)
    expect(store.recoverySeed(recovered.id)).toBeUndefined()
    expect(store.get(recovered.id)?.queuedPrompts).toHaveLength(2)
  })

  it.each(['queued', 'running'] as const)(
    'refuses recovery while a background task is %s',
    async (status) => {
      const { store, cleanup } = await recoveryFixture('sdk')
      const service = new AgentService(
        store,
        client(async (config) => sdkSession(config.sessionId!, [])),
      )
      cleanup.service = service
      vi.spyOn(service, 'listBackgroundTasks').mockResolvedValue({
        tasks: [{
          id: 'background-task',
          type: 'shell',
          description: 'Owned work',
          status,
          startedAt: '2026-09-16T20:00:00.000Z',
          executionMode: 'background',
          canCancel: false,
        }],
        runningCount: status === 'running' ? 1 : 0,
        supported: true,
      })

      await expect(service.recoverConversation('broken', 'manual')).rejects
        .toMatchObject({
          statusCode: 409,
          message: expect.stringContaining('background tasks'),
        })
      expect(store.get('broken')).toBeDefined()
    },
  )

  it.each([
    {
      state: 'running',
      update: (session: SessionDetail) => {
        session.status = 'running'
      },
    },
    {
      state: 'waiting on stale input',
      update: (session: SessionDetail) => {
        session.status = 'waiting'
        session.pendingUserInput = {
          requestId: 'stale-input',
          question: 'Expired question',
          choices: [],
          allowFreeform: true,
          stale: true,
        }
      },
    },
    {
      state: 'idle with live input',
      update: (session: SessionDetail) => {
        session.status = 'idle'
        session.pendingUserInput = {
          requestId: 'live-input',
          question: 'Current question',
          choices: [],
          allowFreeform: true,
        }
      },
    },
  ])('refuses recovery while the session is $state', async ({ update }) => {
    const { store, cleanup } = await recoveryFixture('sdk')
    await store.update('broken', update)
    const service = new AgentService(
      store,
      client(async (config) => sdkSession(config.sessionId!, [])),
    )
    cleanup.service = service

    await expect(service.recoverConversation('broken', 'manual')).rejects
      .toMatchObject({ statusCode: 409 })
    expect(store.get('broken')).toBeDefined()
  })

  it('replaces and seeds an SDK conversation before preserving its existing queue', async () => {
    const { store } = await recoveryFixture('sdk')
    const prompts: string[] = []
    const service = new AgentService(
      store,
      client(async (config) => sdkSession(config.sessionId!, prompts)),
      async () => [],
      async () => {},
      async () => [],
      async () => undefined,
      {
        has: async () => false,
        send: async () => false,
        cancel: async () => false,
      },
    )

    const recovered = await recoverAndSeed(service, 'provider-error')

    expect(recovered.id).not.toBe('broken')
    expect(recovered.title).toBe('Broken session')
    expect(recovered.replacedSessionIds).toContain('broken')
    expect(recovered.queuedPrompts?.map((prompt) => prompt.content)).toEqual([
      'Queued after seed',
    ])
    expect(prompts).toHaveLength(1)
    expect(prompts[0]).toContain('Preserve this goal')
    expect(prompts[0]).not.toContain('opaque activity')
    expect(recovered.messages.some((message) =>
      message.role === 'notice' && message.content.includes('read-only history'))).toBe(true)
    expect(recovered.messages.at(-2)?.role).toBe('user')
  })

  it('replaces and seeds a tmux conversation before its preserved queue can drain', async () => {
    const { store } = await recoveryFixture('terminal')
    const sent: string[] = []
    const terminal: TerminalSessionController = {
      has: async () => true,
      reset: async (_id, _replacementId, _cwd, _runtime, commit) => {
        await commit()
        return true
      },
      rename: async () => true,
      sendWhenIdle: async (_id, content) => {
        sent.push(content)
        return true
      },
      send: async (_id, content) => {
        sent.push(content)
        return true
      },
      cancel: async () => true,
    }
    const service = new AgentService(
      store,
      client(async () => { throw new Error('Unexpected SDK creation') }),
      async () => [],
      async () => {},
      async () => [],
      async () => undefined,
      terminal,
    )
    service['externalSessionIds'].add('broken')

    const recovered = await recoverAndSeed(service, 'provider-error')

    expect(recovered.executionMode).toBe('tmux')
    expect(recovered.status).toBe('running')
    expect(recovered.queuedPrompts?.map((prompt) => prompt.content)).toEqual([
      'Queued after seed',
    ])
    expect(sent).toHaveLength(1)
    expect(sent[0]).toContain('Preserve this goal')
  })

  it('returns the committed replacement with an explicit error when seed admission fails', async () => {
    const { store } = await recoveryFixture('terminal')
    const terminal: TerminalSessionController = {
      has: async () => true,
      reset: async (_id, _replacementId, _cwd, _runtime, commit) => {
        await commit()
        return true
      },
      rename: async () => true,
      sendWhenIdle: async () => false,
      send: async () => false,
      cancel: async () => true,
    }
    const service = new AgentService(
      store,
      client(async () => { throw new Error('Unexpected SDK creation') }),
      async () => [],
      async () => {},
      async () => [],
      async () => undefined,
      terminal,
    )
    service['externalSessionIds'].add('broken')

    const recovered = await recoverAndSeed(service, 'provider-error')

    expect(recovered.id).not.toBe('broken')
    expect(recovered.status).toBe('error')
    expect(recovered.activity).toContain('context brief could not be sent')
    expect(recovered.queuedPrompts?.map((prompt) => prompt.content)).toEqual([
      'Queued after seed',
    ])
    expect(store.get('broken')).toBeUndefined()
  })

  it('rejects stale SDK replies with recovery guidance', async () => {
    const { store } = await recoveryFixture('sdk')
    await store.update('broken', (session: SessionDetail) => {
      session.pendingUserInput = {
        requestId: 'stale-input',
        question: 'Choose a path',
        choices: ['A'],
        allowFreeform: false,
        stale: true,
      }
    })
    const service = new AgentService(
      store,
      client(async () => { throw new Error('Unexpected SDK creation') }),
    )

    await expect(service.replyUserInput(
      'broken',
      'stale-input',
      { answer: 'A', wasFreeform: false },
    )).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('Recover the conversation'),
    })
  })

  it('includes a stale SDK request in the fresh provider recovery brief', async () => {
    const { store } = await recoveryFixture('sdk')
    await store.update('broken', (session) => {
      session.pendingUserInput = {
        requestId: 'stale-input',
        question: 'Choose the deployment region',
        choices: ['West Europe'],
        allowFreeform: false,
        stale: true,
      }
    })
    const prompts: string[] = []
    const service = new AgentService(
      store,
      client(async (config) => sdkSession(config.sessionId!, prompts)),
    )

    await recoverAndSeed(service, 'stale-sdk-interaction')

    expect(prompts).toHaveLength(1)
    expect(prompts[0]).toContain(
      'Unresolved user-input request before restart: Choose the deployment region',
    )
  })

  it('does not copy stale permission details into provider recovery context', async () => {
    const { store } = await recoveryFixture('sdk')
    await store.update('broken', (session) => {
      session.pendingPermission = {
        requestId: 'stale-permission',
        title: 'Run dangerous stale command',
        options: [{
          optionId: 'allow-stale',
          name: 'Always allow stale command',
          kind: 'allow_once',
        }],
        stale: true,
      }
    })
    const prompts: string[] = []
    const service = new AgentService(
      store,
      client(async (config) => sdkSession(config.sessionId!, prompts)),
    )

    await recoverAndSeed(service, 'stale-sdk-interaction')

    expect(prompts).toHaveLength(1)
    expect(prompts[0]).not.toContain('Run dangerous stale command')
    expect(prompts[0]).not.toContain('Always allow stale command')
  })

  it('preserves a custom title while admitting the recovery seed', async () => {
    const { store } = await recoveryFixture('sdk')
    await store.renameSession('broken', 'My custom recovery title')
    const prompts: string[] = []
    const service = new AgentService(
      store,
      client(async (config) => sdkSession(config.sessionId!, prompts)),
    )

    const recovered = await recoverAndSeed(service, 'manual')

    expect(recovered.title).toBe('My custom recovery title')
    expect(prompts).toHaveLength(1)
  })

  it('freezes an automatic title against recovery-seed title callbacks', async () => {
    const { store } = await recoveryFixture('sdk')
    const originalTitle = store.get('broken')!.title
    const prompts: string[] = []
    const service = new AgentService(
      store,
      client(async (config) => sdkSession(config.sessionId!, prompts)),
    )

    const recovered = await recoverAndSeed(service, 'manual')
    await store.updateAutomaticTitle(
      recovered.id,
      'Conversation recovery context',
      '2026-09-10T00:00:00.000Z',
    )

    expect(store.get(recovered.id)?.title).toBe(originalTitle)
  })

  it('keeps the SDK queue blocked when the recovery seed turn fails asynchronously', async () => {
    const { store } = await recoveryFixture('sdk')
    const prompts: string[] = []
    const service = new AgentService(
      store,
      client(async (config) => {
        const failedSession = sdkSession(config.sessionId!, prompts)
        failedSession.sendAndWait = vi.fn(async (content) => {
          prompts.push(content)
          throw new Error('provider rejected recovery seed')
        })
        return failedSession
      }),
    )

    const recovered = await recoverAndSeed(service, 'provider-error')

    expect(prompts).toHaveLength(1)
    expect(recovered).toMatchObject({
      status: 'error',
      queuedPrompts: [{ content: 'Queued after seed' }],
    })
    expect(store.recoverySeed(recovered.id)).toMatchObject({
      state: 'failed',
      error: expect.stringContaining('provider rejected recovery seed'),
    })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(prompts).toHaveLength(1)
  })

  it('does not admit a recovery seed without an explicit idle completion', async () => {
    const { store } = await recoveryFixture('sdk')
    const prompts: string[] = []
    const service = new AgentService(
      store,
      client(async (config) => sdkSession(config.sessionId!, prompts)),
    )
    service['runPrompt'] = vi.fn(async () => undefined)

    const recovered = await recoverAndSeed(service, 'provider-error')

    expect(recovered).toMatchObject({
      status: 'error',
      queuedPrompts: [{ content: 'Queued after seed' }],
    })
    expect(store.recoverySeed(recovered.id)).toMatchObject({
      state: 'failed',
      error: expect.stringContaining('delivery is uncertain'),
    })
    expect(prompts).toEqual([])
  })

  it('dispatches a persisted pending seed before the preserved SDK queue after restart', async () => {
    const { directory, store, cleanup } = await recoveryFixture('sdk')
    await store.replaceWithRecoveredSession(
      'broken',
      'replacement',
      'provider-error',
      1,
      false,
      'Persisted seed must run first',
    )
    await store.close()
    const restarted = new SessionStore(path.join(directory, 'state'))
    const prompts: string[] = []
    let releaseSeed!: () => void
    const seedFinished = new Promise<void>((resolve) => { releaseSeed = resolve })
    const session = sdkSession('replacement', prompts)
    session.sendAndWait = vi.fn(async (content) => {
      prompts.push(content)
      if (content === 'Persisted seed must run first') await seedFinished
      return undefined
    })
    const sdkClient = client(async () => session)
    sdkClient.resumeSession = vi.fn(async () => session)
    const service = new AgentService(restarted, sdkClient)
    cleanup.store = restarted
    cleanup.service = service

    const starting = service.start()
    await starting
    await vi.waitFor(() =>
      expect(prompts).toEqual(['Persisted seed must run first']),
    { timeout: 3_000 })
    expect(restarted.get('replacement')?.queuedPrompts?.map((prompt) => prompt.content))
      .toEqual(['Queued after seed'])
    releaseSeed()
    await vi.waitFor(() => expect(prompts).toEqual([
      'Persisted seed must run first',
      'Queued after seed',
    ]))
  })

  it('stops an in-flight SDK seed without admitting it or waiting for its timeout', async () => {
    const { directory, store, cleanup } = await recoveryFixture('sdk')
    await store.replaceWithRecoveredSession(
      'broken',
      'replacement',
      'provider-error',
      1,
      false,
      'Seed interrupted by shutdown',
    )
    await store.close()
    const restarted = new SessionStore(path.join(directory, 'state'))
    const prompts: string[] = []
    let rejectSeed!: (error: Error) => void
    const session = sdkSession('replacement', prompts)
    session.sendAndWait = vi.fn(async (content) => {
      prompts.push(content)
      return new Promise<never>((_resolve, reject) => {
        rejectSeed = reject
      })
    })
    session.disconnect = vi.fn(async () => {
      rejectSeed?.(new Error('disconnected for shutdown'))
    })
    const sdkClient = client(async () => session)
    sdkClient.resumeSession = vi.fn(async () => session)
    const service = new AgentService(restarted, sdkClient)
    cleanup.store = restarted
    cleanup.service = service

    const starting = service.start()
    await starting
    await vi.waitFor(() =>
      expect(prompts).toEqual(['Seed interrupted by shutdown']),
    { timeout: 3_000 })
    await expect(Promise.race([
      service.stop(),
      new Promise((_, reject) => setTimeout(
        () => reject(new Error('shutdown timed out')),
        2_000,
      )),
    ])).resolves.toBeUndefined()
    expect(session.disconnect).toHaveBeenCalledOnce()
    await expect(starting).resolves.toBeUndefined()

    const reloaded = new SessionStore(path.join(directory, 'state'))
    await reloaded.initialize()
    expect(reloaded.recoverySeed('replacement')).toMatchObject({
      state: 'failed',
      error: expect.stringContaining('delivery is uncertain'),
    })
    expect(reloaded.get('replacement')?.queuedPrompts).toMatchObject([
      { content: 'Queued after seed' },
    ])
    await reloaded.close()
  })

  it('never retries a seed left dispatching across restart and keeps its queue blocked', async () => {
    const { directory, store, cleanup } = await recoveryFixture('sdk')
    await store.replaceWithRecoveredSession(
      'broken',
      'replacement',
      'provider-error',
      1,
      false,
      'Possibly delivered seed',
    )
    await store.claimRecoverySeed('replacement', 'Possibly delivered seed')
    await store.close()
    const restarted = new SessionStore(path.join(directory, 'state'))
    const prompts: string[] = []
    const session = sdkSession('replacement', prompts)
    const sdkClient = client(async () => session)
    sdkClient.resumeSession = vi.fn(async () => session)
    const service = new AgentService(restarted, sdkClient)
    cleanup.store = restarted
    cleanup.service = service

    await service.start()

    expect(prompts).toEqual([])
    expect(restarted.recoverySeed('replacement')).toMatchObject({
      state: 'failed',
      error: expect.stringContaining('delivery is uncertain'),
    })
    expect(restarted.get('replacement')).toMatchObject({
      status: 'error',
      queuedPrompts: [{ content: 'Queued after seed' }],
    })
  })

  it('dispatches a persisted terminal seed before its startup queue', async () => {
    const { directory, store, cleanup } = await recoveryFixture('terminal')
    await store.replaceWithRecoveredSession(
      'broken',
      'replacement',
      'provider-error',
      1,
      false,
      'Persisted terminal seed',
    )
    await store.close()
    const restarted = new SessionStore(path.join(directory, 'state'))
    const sent: string[] = []
    const terminal: TerminalSessionController = {
      has: async () => true,
      capture: async () => 'Synthetic idle owner\n╻▄▄▄▄▄▄▄▄▄▄\n┃ \n╹▀▀▀▀▀▀▀▀▀▀\n / commands',
      sendWhenIdle: async (_id, content) => {
        sent.push(content)
        return true
      },
      send: async (_id, content) => {
        sent.push(content)
        return true
      },
      cancel: async () => true,
    }
    const sdkClient = client(async () => { throw new Error('Unexpected SDK creation') })
    const service = new AgentService(
      restarted,
      sdkClient,
      async () => [{
        id: 'replacement',
        cwd: directory,
        title: 'Broken session',
        updatedAt: '2026-09-09T00:00:00.000Z',
      }],
      async () => {},
      async () => [],
      async () => undefined,
      terminal,
    )
    cleanup.store = restarted
    cleanup.service = service

    await service.start()

    await vi.waitFor(() =>
      expect(sent).toEqual(['Persisted terminal seed']),
    { timeout: 3_000 })
    expect(restarted.get('replacement')?.queuedPrompts?.map((prompt) => prompt.content))
      .toEqual(['Queued after seed'])
  })
})
