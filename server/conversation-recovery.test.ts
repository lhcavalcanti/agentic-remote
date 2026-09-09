import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
} from './agent-service.js'
import { SessionStore } from './session-store.js'
import type { TerminalSessionController } from './terminal-session.js'

const fixtures: Array<{ directory: string; store: SessionStore; service?: AgentService }> = []

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
        enqueue: async () => ({ queued: true }),
      },
      name: { set: async () => {} },
      model: {
        getCurrent: async () => ({ modelId: 'gpt-test' }),
        switchTo: async () => ({ modelId: 'gpt-test' }),
      },
      mode: { set: async () => {} },
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
  await Promise.all(fixtures.splice(0).map(async ({ directory, store, service }) => {
    await service?.stop().catch(() => undefined)
    await store.close().catch(() => undefined)
    await rm(directory, { recursive: true, force: true })
  }))
})

describe('conversation recovery', () => {
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

    const recovered = await service.recoverConversation('broken', 'provider-error')

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

    const recovered = await service.recoverConversation('broken', 'provider-error')

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

    const recovered = await service.recoverConversation('broken', 'provider-error')

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

    await service.recoverConversation('broken', 'stale-sdk-interaction')

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

    await service.recoverConversation('broken', 'stale-sdk-interaction')

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

    const recovered = await service.recoverConversation('broken', 'manual')

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

    const recovered = await service.recoverConversation('broken', 'manual')
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

    const recovered = await service.recoverConversation('broken', 'provider-error')

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

    const recovered = await service.recoverConversation('broken', 'provider-error')

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
