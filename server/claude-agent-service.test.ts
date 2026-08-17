import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type {
  ModelInfo,
  Options,
  Query,
  SDKMessage,
} from '@anthropic-ai/claude-agent-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ClaudeAgentService,
  type ClaudeSdk,
} from './claude-agent-service.js'
import { SessionStore } from './session-store.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

function models(): ModelInfo[] {
  return [
    {
      value: 'sonnet',
      resolvedModel: 'claude-sonnet-5',
      displayName: 'Sonnet',
      description: 'Efficient for routine tasks',
      supportsEffort: true,
      supportedEffortLevels: ['low', 'medium', 'high'],
    },
  ]
}

function queryHandle(messages: () => AsyncGenerator<SDKMessage>): Query {
  const generator = messages()
  return Object.assign(generator, {
    supportedModels: async () => models(),
  }) as unknown as Query
}

async function fixture(
  run: (options: Options) => AsyncGenerator<SDKMessage>,
) {
  const directory = await mkdtemp(path.join(tmpdir(), 'claude-service-test-'))
  directories.push(directory)
  const queryCalls: Options[] = []
  const deleteSession = vi.fn(async () => undefined)
  const renameSession = vi.fn(async () => undefined)
  const queryMock = vi.fn(
    ({ prompt, options = {} }: { prompt: unknown; options?: Options }) => {
      queryCalls.push(options)
      return typeof prompt === 'string'
        ? queryHandle(() => run(options))
        : queryHandle(async function* () {})
    },
  )
  const sdk: ClaudeSdk = {
    query: queryMock as ClaudeSdk['query'],
    deleteSession,
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
      runtime: { model: 'sonnet' },
    })

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
      model: 'sonnet',
      permissionMode: 'bypassPermissions',
    })

    await service.sendMessage(sessionId, 'follow up')
    await waitForIdle(service, sessionId)
    expect(queryCalls.at(-1)).toMatchObject({ resume: sessionId })

    const configured = await service.configureRuntime(sessionId, {
      model: 'sonnet',
      reasoningEffort: 'low',
      contextTier: 'default',
      mode: 'plan',
    })
    expect(configured.runtime).toMatchObject({
      model: 'sonnet',
      reasoningEffort: 'low',
      mode: 'plan',
    })

    await service.deleteSession(sessionId)
    expect(deleteSession).toHaveBeenCalledWith(sessionId, { dir: directory })
    expect(service.getSession(sessionId)).toBeUndefined()
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
})
