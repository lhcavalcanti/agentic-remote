import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type {
  ModelInfo,
  Options,
  Query,
  SDKMessage,
} from '@anthropic-ai/claude-agent-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ClaudeAgentService,
  type ClaudeSdk,
} from './claude-agent-service.js'
import { SessionStore } from './session-store.js'

const directories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

// Sessions are confined to the home directory; these fixtures run in tmpdir.
beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', tmpdir())
})

function models(): ModelInfo[] {
  return [
    {
      value: 'provider-model',
      resolvedModel: 'resolved-provider-model',
      displayName: 'Provider Model',
      description: 'Efficient for routine tasks',
      supportsEffort: true,
      supportedEffortLevels: ['low', 'medium', 'high'],
    },
  ]
}

function queryHandle(
  messages: () => AsyncGenerator<SDKMessage>,
  availableModels: () => ModelInfo[] = models,
): Query {
  const generator = messages()
  return Object.assign(generator, {
    supportedModels: async () => availableModels(),
  }) as unknown as Query
}

async function fixture(
  run: (options: Options) => AsyncGenerator<SDKMessage>,
  availableModels: () => ModelInfo[] = models,
) {
  const directory = await mkdtemp(path.join(tmpdir(), 'claude-service-test-'))
  directories.push(directory)
  const queryCalls: Options[] = []
  let runCount = 0
  const deleteSession = vi.fn(async () => undefined)
  const getSessionInfo = vi.fn(async (sessionId: string) =>
    runCount > 0
      ? {
          sessionId,
          summary: 'Claude session',
          lastModified: Date.now(),
        }
      : undefined,
  )
  const renameSession = vi.fn(async () => undefined)
  const queryMock = vi.fn(
    ({ prompt, options = {} }: { prompt: unknown; options?: Options }) => {
      queryCalls.push(options)
      if (typeof prompt === 'string') {
        runCount += 1
        return queryHandle(() => run(options), availableModels)
      }
      return queryHandle(async function* () {}, availableModels)
    },
  )
  const sdk: ClaudeSdk = {
    query: queryMock as ClaudeSdk['query'],
    deleteSession,
    getSessionInfo,
    renameSession,
  }
  const service = new ClaudeAgentService(
    new SessionStore(path.join(directory, 'state')),
    '/bin/true',
    sdk,
    async () => ({ loggedIn: true }),
  )
  await service.start()
  return {
    deleteSession,
    directory,
    getSessionInfo,
    queryCalls,
    renameSession,
    service,
  }
}

function textResult(sessionId: string): SDKMessage[] {
  return [
    {
      type: 'stream_event',
      event: {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: 'Hello from Claude' },
      },
      parent_tool_use_id: null,
      uuid: '11111111-1111-4111-8111-111111111111',
      session_id: sessionId,
    } as unknown as SDKMessage,
    {
      type: 'result',
      subtype: 'success',
      modelUsage: {},
      session_id: sessionId,
    } as unknown as SDKMessage,
  ]
}

async function waitForIdle(
  service: ClaudeAgentService,
  sessionId: string,
): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (service.getSession(sessionId)?.status === 'idle') {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error('Claude session did not become idle')
}

describe('ClaudeAgentService', () => {
  it('persists streamed text after an aborted turn settles and before closing', async () => {
    let sessionId = ''
    let finishTurn = () => {}
    const finishing = new Promise<void>((resolve) => { finishTurn = resolve })
    let allowStream = () => {}
    const streaming = new Promise<void>((resolve) => { allowStream = resolve })
    let runs = 0
    const { directory, service } = await fixture(async function* (options) {
      runs += 1
      await streaming
      yield textResult(sessionId)[0]
      await new Promise<void>((resolve) => {
        options.abortController?.signal.addEventListener('abort', () => resolve(), { once: true })
      })
      await finishing
    })
    const created = await service.createSession(directory, false, true, 'claude')
    sessionId = created.id
    await service.sendMessage(sessionId, 'Keep the streamed answer')
    await service.store.enqueuePrompt(sessionId, {
      id: 'waiting', content: 'Do not start during shutdown',
      createdAt: '2026-09-05T00:00:00.000Z',
    })
    allowStream()
    await vi.waitFor(() =>
      expect(service.getSession(sessionId)?.messages.at(-1)?.content).toBe('Hello from Claude'),
    )
    const close = vi.spyOn(service.store, 'close')
    const stopped = service.stop()
    try {
      await Promise.resolve()
      expect(close).not.toHaveBeenCalled()
      await expect(service.sendMessage(sessionId, 'Not admitted during shutdown'))
        .rejects.toThrow('shutting down')
    } finally {
      finishTurn()
      await stopped
    }
    const reloaded = new SessionStore(path.join(directory, 'state'))
    await reloaded.initialize()
    expect(reloaded.get(sessionId)?.messages.at(-1)).toMatchObject({
      content: 'Hello from Claude', streaming: false,
    })
    expect(reloaded.get(sessionId)?.queuedPrompts?.map((prompt) => prompt.id)).toEqual(['waiting'])
    expect(runs).toBe(1)
  })

  it('settles a starting turn without launching the provider after shutdown begins', async () => {
    let runs = 0
    const { directory, service, getSessionInfo } = await fixture(async function* () {
      runs += 1
      yield* []
    })
    const created = await service.createSession(directory, false, true, 'claude')
    let finishLookup = () => {}
    getSessionInfo.mockImplementationOnce(() =>
      new Promise((resolve) => { finishLookup = () => resolve(undefined) }),
    )
    await service.sendMessage(created.id, 'Pending startup')
    await vi.waitFor(() => expect(getSessionInfo).toHaveBeenCalled())
    const close = vi.spyOn(service.store, 'close')
    const stopped = service.stop()
    try {
      await Promise.resolve()
      expect(close).not.toHaveBeenCalled()
    } finally {
      finishLookup()
      await stopped
    }
    expect(runs).toBe(0)
    const reloaded = new SessionStore(path.join(directory, 'state'))
    await reloaded.initialize()
    expect(reloaded.get(created.id)?.messages.every((message) => !message.streaming)).toBe(true)
  })

  it('creates, streams, resumes, configures, and deletes Claude sessions', async () => {
    let sessionId = ''
    const fixtureResult = await fixture(async function* () {
      yield* textResult(sessionId)
    })
    const { deleteSession, directory, queryCalls, service } = fixtureResult

    expect(service.providers()).toEqual([
      expect.objectContaining({
        id: 'claude',
        available: true,
        terminalBacked: false,
      }),
    ])
    const created = await service.createSession(
      directory,
      false,
      true,
      'claude',
    )
    sessionId = created.id
    expect(created).toMatchObject({
      provider: 'claude',
      status: 'idle',
      runtime: { contextTier: 'default' },
    })
    expect(created.runtime?.model).toBeUndefined()
    expect(created.runtime?.reasoningEffort).toBeUndefined()

    await service.sendMessage(sessionId, 'hello')
    await waitForIdle(service, sessionId)
    expect(service.getSession(sessionId)?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'Hello from Claude',
      streaming: false,
    })
    expect(queryCalls.at(-1)).toMatchObject({
      cwd: directory,
      sessionId,
      permissionMode: 'bypassPermissions',
    })
    expect(queryCalls.at(-1)?.model).toBeUndefined()
    expect(queryCalls.at(-1)?.effort).toBeUndefined()

    await service.sendMessage(sessionId, 'follow up')
    await waitForIdle(service, sessionId)
    expect(queryCalls.at(-1)).toMatchObject({ resume: sessionId })

    const configured = await service.configureRuntime(sessionId, {
      model: 'provider-model',
      reasoningEffort: 'low',
      contextTier: 'default',
      mode: 'plan',
    })
    expect(configured.runtime).toMatchObject({
      model: 'provider-model',
      reasoningEffort: 'low',
      mode: 'plan',
    })

    await service.deleteSession(sessionId)
    expect(deleteSession).toHaveBeenCalledWith(sessionId, { dir: directory })
    expect(service.getSession(sessionId)).toBeUndefined()
  })

  it('uses requested Claude runtime defaults for a new session', async () => {
    const { directory, service } = await fixture(async function* () {})

    const created = await service.createSession(
      directory,
      false,
      true,
      'claude',
      'provider-model',
      'low',
      'default',
    )

    expect(created.runtime).toMatchObject({
      model: 'provider-model',
      reasoningEffort: 'low',
      contextTier: 'default',
    })
    await expect(service.providerRuntimeOptions('claude')).resolves.toEqual({
      models: [
        expect.objectContaining({
          id: 'provider-model',
          description: 'Efficient for routine tasks',
          reasoningEfforts: ['low', 'medium', 'high'],
        }),
      ],
    })
  })

  it('retries model discovery after a transient startup failure', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'claude-retry-test-'))
    directories.push(directory)
    let discoveryAttempts = 0
    const queryMock = vi.fn(() => {
      const handle = queryHandle(async function* () {})
      handle.supportedModels = async () => {
        discoveryAttempts += 1
        if (discoveryAttempts === 1) {
          throw new Error('Temporary discovery failure')
        }
        return models()
      }
      return handle
    })
    const authStatus = vi.fn(async () => ({ loggedIn: true }))
    const service = new ClaudeAgentService(
      new SessionStore(path.join(directory, 'state')),
      '/bin/true',
      {
        query: queryMock as ClaudeSdk['query'],
        deleteSession: vi.fn(async () => undefined),
        getSessionInfo: vi.fn(async () => undefined),
        renameSession: vi.fn(async () => undefined),
      },
      authStatus,
    )

    await service.start()
    expect(service.providers()).toEqual([
      expect.objectContaining({ id: 'claude', available: false }),
    ])

    await expect(service.providerRuntimeOptions('claude')).resolves.toEqual({
      models: [expect.objectContaining({ id: 'provider-model' })],
    })
    expect(authStatus).toHaveBeenCalledTimes(2)
    expect(service.providers()).toEqual([
      expect.objectContaining({ id: 'claude', available: true }),
    ])
  })

  it('discovers fresh Claude catalogs and recovers from a failed refresh', async () => {
    let availableModels = models()
    let discoveryError: Error | undefined
    const { directory, service } = await fixture(
      async function* () {},
      () => {
        if (discoveryError) {
          throw discoveryError
        }
        return availableModels
      },
    )

    try {
      const created = await service.createSession(directory, false, false, 'claude')
      const originalRuntime = { ...created.runtime }
      availableModels = [{
        ...models()[0],
        value: 'new-provider-model',
        displayName: 'New Provider Model',
      }]
      const refreshed = {
        models: [expect.objectContaining({ id: 'new-provider-model' })],
      }
      await expect(service.providerRuntimeOptions('claude')).resolves.toMatchObject(
        refreshed,
      )
      await expect(service.runtimeOptions(created.id)).resolves.toMatchObject(
        refreshed,
      )
      expect(service.getSession(created.id)?.runtime).toEqual(originalRuntime)

      discoveryError = new Error('Catalog refresh failed')
      await expect(service.runtimeOptions(created.id)).rejects.toThrow(
        'Catalog refresh failed',
      )
      discoveryError = undefined
      await expect(service.runtimeOptions(created.id)).resolves.toMatchObject(
        refreshed,
      )
    } finally {
      await service.stop()
    }
  })

  it('surfaces and answers Claude tool permissions', async () => {
    let sessionId = ''
    const fixtureResult = await fixture(async function* (options) {
      const decision = await options.canUseTool?.('Bash', {
        command: 'git status',
        description: 'Inspect repository status',
      }, {
        signal: new AbortController().signal,
        toolUseID: 'tool-status',
        requestId: 'permission-status',
      })
      expect(decision).toMatchObject({ behavior: 'allow' })
      yield* textResult(sessionId)
    })
    const { directory, service } = fixtureResult
    const created = await service.createSession(
      directory,
      false,
      false,
      'claude',
    )
    sessionId = created.id

    await service.sendMessage(sessionId, 'inspect this repository')
    await vi.waitFor(() =>
      expect(service.getSession(sessionId)?.pendingPermission).toBeDefined(),
    )
    const request = service.getSession(sessionId)?.pendingPermission
    expect(request).toMatchObject({
      title: 'Bash: Inspect repository status',
    })
    await service.replyPermission(
      sessionId,
      request?.requestId || '',
      'allow-once',
    )
    await waitForIdle(service, sessionId)
  })

  it('surfaces Claude clarifying questions through the existing input UI', async () => {
    let sessionId = ''
    const fixtureResult = await fixture(async function* (options) {
      const decision = await options.canUseTool?.('AskUserQuestion', {
        questions: [
          {
            question: 'Which database?',
            header: 'Database',
            options: [
              { label: 'PostgreSQL', description: 'Production database' },
              { label: 'SQLite', description: 'Local database' },
            ],
            multiSelect: false,
          },
        ],
      }, {
        signal: new AbortController().signal,
        toolUseID: 'tool-question',
        requestId: 'permission-question',
      })
      expect(decision).toMatchObject({
        behavior: 'allow',
        updatedInput: {
          answers: { 'Which database?': 'PostgreSQL' },
        },
      })
      yield* textResult(sessionId)
    })
    const { directory, service } = fixtureResult
    const created = await service.createSession(
      directory,
      false,
      true,
      'claude',
    )
    sessionId = created.id

    await service.sendMessage(sessionId, 'choose a database')
    await vi.waitFor(() =>
      expect(service.getSession(sessionId)?.pendingUserInput).toBeDefined(),
    )
    const request = service.getSession(sessionId)?.pendingUserInput
    expect(request).toMatchObject({
      question: 'Which database?',
      choices: ['PostgreSQL', 'SQLite'],
    })
    await service.replyUserInput(sessionId, request?.requestId || '', {
      answer: 'PostgreSQL',
      wasFreeform: false,
    })
    await waitForIdle(service, sessionId)
  })

  it('handles rename, clear, and delete before Claude creates a transcript', async () => {
    const fixtureResult = await fixture(async function* () {})
    const {
      deleteSession,
      directory,
      renameSession,
      service,
    } = fixtureResult
    const created = await service.createSession(
      directory,
      false,
      true,
      'claude',
    )

    renameSession.mockRejectedValueOnce(
      new Error('Session not found in any project directory'),
    )
    const renamed = await service.renameSession(created.id, 'Fresh Claude')
    expect(renamed.title).toBe('Fresh Claude')

    const removals: unknown[] = []
    service.on('event', (event) => {
      if (event.type === 'session.removed') {
        removals.push(event)
      }
    })

    deleteSession.mockRejectedValueOnce(new Error('Session not found'))
    const cleared = await service.clearConversation(created.id)
    expect(cleared.id).not.toBe(created.id)
    expect(cleared.messages).toEqual([])
    // Clearing replaces a session here as it does for Copilot, so every
    // client can move its state across rather than discard it.
    expect(removals).toEqual([
      { type: 'session.removed', sessionId: created.id, replacedBy: cleared.id },
    ])

    deleteSession.mockRejectedValueOnce(new Error('Session not found'))
    await service.deleteSession(cleared.id)
    expect(service.getSession(cleared.id)).toBeUndefined()
  })

  it('starts a new provider session after a failed first turn', async () => {
    let sessionId = ''
    let turn = 0
    const fixtureResult = await fixture(async function* () {
      turn += 1
      if (turn === 1) {
        yield {
          type: 'result',
          subtype: 'error_during_execution',
          is_error: true,
          errors: ['First turn failed'],
          modelUsage: {},
          session_id: sessionId,
        } as unknown as SDKMessage
        return
      }
      yield* textResult(sessionId)
    })
    const { directory, getSessionInfo, queryCalls, service } = fixtureResult
    getSessionInfo.mockResolvedValue(undefined)
    const created = await service.createSession(
      directory,
      false,
      true,
      'claude',
    )
    sessionId = created.id

    await service.sendMessage(sessionId, 'first')
    await vi.waitFor(() =>
      expect(service.getSession(sessionId)?.status).toBe('error'),
    )
    await service.sendMessage(sessionId, 'retry')
    await waitForIdle(service, sessionId)

    const runOptions = queryCalls.filter(
      (options) => options.sessionId || options.resume,
    )
    expect(runOptions).toHaveLength(2)
    expect(runOptions[0]).toMatchObject({ sessionId })
    expect(runOptions[0].resume).toBeUndefined()
    expect(runOptions[1]).toMatchObject({ sessionId })
    expect(runOptions[1].resume).toBeUndefined()
  })

  it('treats the real SDK missing-transcript message as already deleted', async () => {
    const { deleteSession, directory, service } = await fixture(
      async function* () {},
    )
    const created = await service.createSession(directory, false, true, 'claude')
    // The exact message @anthropic-ai/claude-agent-sdk throws for a session
    // that never wrote a transcript.
    deleteSession.mockRejectedValue(
      new Error(
        `Session ${created.id} not found in project directory for ${directory}`,
      ),
    )

    const cleared = await service.clearConversation(created.id)
    expect(cleared.messages).toEqual([])
    await expect(service.deleteSession(cleared.id)).resolves.toBeUndefined()
    expect(service.getSession(cleared.id)).toBeUndefined()
  })

  it('still reports unexpected provider errors when deleting a session', async () => {
    const { deleteSession, directory, service } = await fixture(
      async function* () {},
    )
    const created = await service.createSession(directory, false, true, 'claude')
    deleteSession.mockRejectedValue(new Error('disk exploded'))

    await expect(service.deleteSession(created.id)).rejects.toThrow(
      'disk exploded',
    )
    expect(service.getSession(created.id)).toBeUndefined()
  })

  it('collects multi-select answers as a comma-separated string', async () => {
    let sessionId = ''
    const fixtureResult = await fixture(async function* (options) {
      const decision = await options.canUseTool?.(
        'AskUserQuestion',
        {
          questions: [
            {
              question: 'Which features?',
              header: 'Features',
              options: [
                { label: 'Search', description: 'Full text search' },
                { label: 'Export', description: 'CSV export' },
                { label: 'Webhooks', description: 'Outbound webhooks' },
              ],
              multiSelect: true,
            },
          ],
        },
        {
          signal: new AbortController().signal,
          toolUseID: 'tool-multi',
          requestId: 'permission-multi',
        },
      )
      expect(decision).toMatchObject({
        behavior: 'allow',
        updatedInput: {
          answers: { 'Which features?': 'Search, Webhooks' },
        },
      })
      yield* textResult(sessionId)
    })
    const { directory, service } = fixtureResult
    const created = await service.createSession(directory, false, true, 'claude')
    sessionId = created.id

    await service.sendMessage(sessionId, 'pick features')
    await vi.waitFor(() =>
      expect(service.getSession(sessionId)?.pendingUserInput).toBeDefined(),
    )
    const request = service.getSession(sessionId)?.pendingUserInput
    expect(request).toMatchObject({
      question: 'Which features?',
      multiSelect: true,
    })

    await service.replyUserInput(sessionId, request?.requestId || '', {
      answer: 'Search, Webhooks',
      wasFreeform: false,
      answers: ['Search', 'Webhooks'],
    })
    await waitForIdle(service, sessionId)
  })

  it('rejects multi-select answers that are not offered options', async () => {
    let sessionId = ''
    const fixtureResult = await fixture(async function* (options) {
      await options.canUseTool?.(
        'AskUserQuestion',
        {
          questions: [
            {
              question: 'Which features?',
              header: 'Features',
              options: [
                { label: 'Search', description: 'Full text search' },
                { label: 'Export', description: 'CSV export' },
              ],
              multiSelect: true,
            },
          ],
        },
        {
          signal: new AbortController().signal,
          toolUseID: 'tool-multi-invalid',
          requestId: 'permission-multi-invalid',
        },
      )
      yield* textResult(sessionId)
    })
    const { directory, service } = fixtureResult
    const created = await service.createSession(directory, false, true, 'claude')
    sessionId = created.id

    await service.sendMessage(sessionId, 'pick features')
    await vi.waitFor(() =>
      expect(service.getSession(sessionId)?.pendingUserInput).toBeDefined(),
    )
    const request = service.getSession(sessionId)?.pendingUserInput

    await expect(
      service.replyUserInput(sessionId, request?.requestId || '', {
        answer: 'Search, Telemetry',
        wasFreeform: false,
        answers: ['Search', 'Telemetry'],
      }),
    ).rejects.toThrow('Unknown option: Telemetry')
  })

  it('leaves no half-written turn when suspension wins the send', async () => {
    // Recording the prompt is awaited, and a suspension can land while it is.
    // Refusing the send afterwards while keeping what was written leaves the
    // prompt in the transcript with an assistant reply that stays blank, and
    // the client puts the draft back on top of it.
    const { directory, service } = await fixture(async function* () {})
    const session = await service.createSession(directory, false, true, 'claude')
    const before = service.getSession(session.id)?.messages.length ?? 0

    // Suspension takes hold between the two writes.
    const addMessage = service.store.addMessage.bind(service.store)
    let writes = 0
    vi.spyOn(service.store, 'addMessage').mockImplementation(
      async (id, message) => {
        const result = await addMessage(id, message)
        writes += 1
        if (writes === 2) {
          await service.store.setSuspended(id, true)
        }
        return result
      },
    )

    await expect(
      service.sendMessage(session.id, 'lost to a suspension'),
    ).rejects.toThrow(/Resume the session/)

    // The transcript is as it was: no orphaned prompt, no blank reply.
    expect(service.getSession(session.id)?.messages.length).toBe(before)
  })

  it('refuses to rewrite a queued message into a command', async () => {
    // Claude has no commands of its own, and the store marks slash-prefixed
    // text as one. Stored that way it reaches a drain that refuses every
    // command and puts it straight back, so nothing behind it ever moves
    // again -- and a restart reads the same queue and stops there too.
    const { directory, service } = await fixture(async function* () {})
    const session = await service.createSession(directory, false, true, 'claude')
    await service.store.enqueuePrompt(session.id, {
      id: 'waiting-1',
      content: 'the one that was waiting',
      createdAt: '2026-09-02T00:00:00.000Z',
    })

    await expect(
      service.updateQueuedPrompt(session.id, 'waiting-1', '/plan the work'),
    ).rejects.toMatchObject({ statusCode: 409 })

    const queued = service.getSession(session.id)?.queuedPrompts
    expect(queued?.map((prompt) => prompt.id)).toEqual(['waiting-1'])
    expect(queued?.[0].content).toBe('the one that was waiting')
    expect(queued?.[0].command).toBeUndefined()
  })

  it('restarts a queue left standing by a drain that failed', async () => {
    const { directory, service } = await fixture(async function* () {})
    const session = await service.createSession(directory, false, true, 'claude')
    // A queue left standing: the prompt is back on it and the session is idle,
    // with no query running to take it off again.
    await service.store.enqueuePrompt(session.id, {
      id: 'waiting-1',
      content: 'the one that was waiting',
      createdAt: '2026-09-02T00:00:00.000Z',
    })

    await service.sendMessage(session.id, 'written afterwards')

    await vi.waitFor(() => {
      expect(
        service.getSession(session.id)?.queuedPrompts?.map(
          (prompt) => prompt.id,
        ),
      ).not.toContain('waiting-1')
    })
    // The drain starts a turn of its own, and the fixture removes the
    // directory as soon as the test ends. It is left to finish first.
    await vi.waitFor(() => {
      expect(service.getSession(session.id)?.status).toBe('idle')
    })
    await new Promise((resolve) => setTimeout(resolve, 50))
    await service.store.flush()
  })

  it('drains a standing queue once however many sends arrive', async () => {
    const { directory, service } = await fixture(async function* () {})
    const session = await service.createSession(directory, false, true, 'claude')
    await service.store.enqueuePrompt(session.id, {
      id: 'waiting-1',
      content: 'the one that was waiting',
      createdAt: '2026-09-02T00:00:00.000Z',
    })

    // Two sends reaching an idle session with a prompt already waiting each
    // took a different head off the queue before either marked the session
    // running, and started concurrent turns.
    await Promise.all([
      service.sendMessage(session.id, 'first afterwards'),
      service.sendMessage(session.id, 'second afterwards'),
    ])

    await vi.waitFor(() => {
      expect(service.getSession(session.id)?.status).toBe('idle')
    })
    const messages = service.getSession(session.id)?.messages || []
    const asked = messages
      .filter((message) => message.role === 'user')
      .map((message) => message.content)
    // Whatever ran, nothing ran twice.
    expect(new Set(asked).size).toBe(asked.length)
    await new Promise((resolve) => setTimeout(resolve, 50))
    await service.store.flush()
  })

  it('refuses a send while the session is being deleted', async () => {
    const { directory, service } = await fixture(async function* () {})
    const session = await service.createSession(directory, false, true, 'claude')

    // Deleting takes several awaits, and a send starting inside any of them
    // ran a turn against a conversation on its way out.
    const deleting = service as unknown as { deletingSessions: Set<string> }
    deleting.deletingSessions.add(session.id)

    await expect(
      service.sendMessage(session.id, 'lost to a deletion'),
    ).rejects.toThrow(/not found/)
    deleting.deletingSessions.delete(session.id)
  })

  it('refuses a restart that a suspension has already claimed', async () => {
    const { directory, service } = await fixture(async function* () {})
    const session = await service.createSession(directory, false, true, 'claude')

    // Suspension has claimed the session but has not written the flag yet.
    // Reporting a restart on the strength of the stored flag alone let the
    // suspension finish afterwards and write over it.
    const suspending = service as unknown as {
      suspendingSessions: Set<string>
    }
    suspending.suspendingSessions.add(session.id)

    await expect(service.restartSession(session.id)).rejects.toThrow(
      /Resume the session/,
    )
    suspending.suspendingSessions.delete(session.id)
  })

  it('leaves a suspended session where it was when the send is refused', async () => {
    // The list is ordered by `updatedAt`, and both writes advance it. Putting
    // only the messages back left the session at the top of the list for a
    // send that was refused -- the opposite of keeping the place it had.
    const { directory, service } = await fixture(async function* () {})
    const session = await service.createSession(directory, false, true, 'claude')
    const before = service.getSession(session.id)?.updatedAt

    const addMessage = service.store.addMessage.bind(service.store)
    let writes = 0
    vi.spyOn(service.store, 'addMessage').mockImplementation(
      async (id, message) => {
        const result = await addMessage(id, message)
        writes += 1
        if (writes === 2) {
          await service.store.setSuspended(id, true)
        }
        return result
      },
    )

    await expect(
      service.sendMessage(session.id, 'lost to a suspension'),
    ).rejects.toThrow(/Resume the session/)

    expect(service.getSession(session.id)?.updatedAt).toBe(before)
  })


})
