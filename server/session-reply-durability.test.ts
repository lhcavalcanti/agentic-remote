import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserInputReplyInput } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { SessionStore } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...fs,
    writeFile: vi.fn(fs.writeFile),
    rename: vi.fn(fs.rename),
  }
})

const disk = await vi.importActual<typeof import('node:fs/promises')>(
  'node:fs/promises',
)
const fixtures: {
  directory: string
  service: AgentService | ClaudeAgentService
}[] = []
const releases: (() => void)[] = []
const sessionId = 'reply-session'

function answer(value: string): UserInputReplyInput {
  return { answer: value, wasFreeform: false }
}

async function fixture(provider: 'copilot' | 'claude') {
  const directory = path.resolve('graphify/.cache', `reply-durability-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  const store = new SessionStore(directory)
  await store.initialize()
  await store.create({
    id: sessionId,
    provider,
    cwd: directory,
    title: 'Reply durability',
    updatedAt: '2026-09-06T00:00:00.000Z',
    status: 'running',
    isOpen: true,
    messages: [],
    runtime: { allowAllPermissions: false },
  }, { backend: 'sdk' })
  return {
    directory,
    store,
    contents: () => readFile(path.join(directory, 'state.json'), 'utf8'),
  }
}

async function copilotFixture() {
  const setup = await fixture('copilot')
  const client: CopilotClientLike = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => []),
    createSession: vi.fn(),
    resumeSession: vi.fn(),
    listSessions: vi.fn(async () => []),
    deleteSession: vi.fn(async () => {}),
    rpc: {
      commands: { list: vi.fn(async () => ({ commands: [] })) },
      models: { list: vi.fn(async () => ({ models: [] })) },
    },
  }
  const service = new AgentService(
    setup.store,
    client,
    async () => [],
    async () => {},
    async () => [],
    async () => undefined,
    {
      has: vi.fn(async () => false),
      send: vi.fn(async () => false),
      cancel: vi.fn(async () => false),
    },
  )
  fixtures.push({ directory: setup.directory, service })
  return { ...setup, service }
}

async function claudeFixture() {
  const setup = await fixture('claude')
  const sdk: ClaudeSdk = {
    query: vi.fn(),
    deleteSession: vi.fn(async () => {}),
    getSessionInfo: vi.fn(async () => undefined),
    renameSession: vi.fn(async () => {}),
  }
  const service = new ClaudeAgentService(setup.store, '/bin/true', sdk)
  fixtures.push({ directory: setup.directory, service })
  return { ...setup, service }
}

async function copilotRequest(
  service: AgentService,
  kind: 'permission' | 'input' | 'elicitation',
) {
  const response = kind === 'permission'
    ? service['requestPermission'](sessionId, {
        kind: 'shell',
        fullCommandText: 'echo fixture',
        intention: 'Run fixture',
        commands: [],
        possiblePaths: [],
        possibleUrls: [],
        hasWriteFileRedirection: false,
        canOfferSessionApproval: false,
      })
    : kind === 'input'
      ? service['requestUserInput'](sessionId, {
          question: 'Choose a direction',
          choices: ['Left', 'Right'],
          allowFreeform: false,
        })
      : service['requestElicitation']({
          sessionId,
          mode: 'form',
          message: 'Choose a direction',
          requestedSchema: {
            type: 'object',
            properties: {
              direction: { type: 'string' },
              detail: { type: 'string' },
            },
            required: ['direction'],
          },
        })
  await service.store.readAfterWrites(sessionId)
  const stored = service.store.get(sessionId)!
  const requestId = (kind === 'permission'
    ? stored.pendingPermission
    : stored.pendingUserInput)!.requestId
  const resolve = kind === 'permission'
    ? vi.spyOn(service['permissions'].get(requestId)!, 'resolve')
    : kind === 'input'
      ? vi.spyOn(service['userInputs'].get(requestId)!, 'resolve')
      : vi.spyOn(service['elicitations'].get(requestId)!, 'resolve')
  const reply = (choice = 'Left') => kind === 'permission'
    ? service.replyPermission(sessionId, requestId, choice === 'Left' ? 'allow-once' : 'reject')
    : service.replyUserInput(sessionId, requestId, {
        ...answer(choice),
        ...(kind === 'elicitation' ? { values: { direction: choice } } : {}),
      })
  return { requestId, response, resolve, reply }
}

async function claudeQuestions(service: ClaudeAgentService, count = 2, multiSelect = false) {
  const questions = ['First?', 'Second?', 'Third?'].slice(0, count).map((question) => ({
    question,
    options: [{ label: 'Left' }, { label: 'Right' }],
    multiSelect,
  }))
  const response = service['canUseTool'](sessionId, 'AskUserQuestion', { questions })
  await service.store.readAfterWrites(sessionId)
  const requestId = service.store.get(sessionId)!.pendingUserInput!.requestId
  const resolve = vi.spyOn(service['userInputs'].get(requestId)!, 'resolve')
  return { requestId, response, resolve }
}

async function claudeRequest(service: ClaudeAgentService, kind: 'permission' | 'input') {
  if (kind === 'input') {
    const pending = await claudeQuestions(service, 1)
    return {
      ...pending,
      reply: (choice = 'Left') => service.replyUserInput(sessionId, pending.requestId, answer(choice)),
    }
  }
  const response = service['canUseTool'](sessionId, 'Bash', { command: 'echo fixture' })
  await service.store.readAfterWrites(sessionId)
  const requestId = service.store.get(sessionId)!.pendingPermission!.requestId
  const resolve = vi.spyOn(service['permissions'].get(requestId)!, 'resolve')
  return {
    requestId,
    response,
    resolve,
    reply: (choice = 'Left') =>
      service.replyPermission(sessionId, requestId, choice === 'Left' ? 'allow-once' : 'deny'),
  }
}

function holdWrite() {
  let start = () => {}
  let finish = () => {}
  let fail: (error: unknown) => void = () => {}
  const started = new Promise<void>((resolve) => { start = resolve })
  const gate = new Promise<void>((resolve, reject) => {
    finish = resolve
    fail = reject
  })
  releases.push(finish)
  vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
    start()
    await gate
    return disk.writeFile(...args)
  })
  return { started, finish, fail }
}

async function nextTick() {
  await new Promise<void>((resolve) => setImmediate(resolve))
}

function requestInput(service: AgentService | ClaudeAgentService) {
  return service instanceof AgentService
    ? service['requestUserInput'](sessionId, {
        question: 'Choose', choices: ['Left', 'Right'], allowFreeform: false,
      })
    : service['canUseTool'](sessionId, 'AskUserQuestion', {
        questions: [{ question: 'Choose', options: [{ label: 'Left' }, { label: 'Right' }] }],
      })
}

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
})

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  for (const { directory, service } of fixtures.splice(0)) {
    await Promise.allSettled([service.stop()])
    await Promise.allSettled([service.store.flush()])
    await rm(directory, { recursive: true, force: true })
  }
  vi.restoreAllMocks()
})

describe('Reply durability regressions', () => {
  it('keeps the original Claude question answerable when advancing its card is refused', async () => {
    const { service, store, contents } = await claudeFixture()
    const { requestId, response, resolve } = await claudeQuestions(service)
    const before = store.get(sessionId)
    const onDisk = await contents()
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))

    await expect(service.replyUserInput(sessionId, requestId, answer('Left')))
      .rejects.toThrow('disk full')
    expect(store.get(sessionId)).toEqual(before)
    expect(await contents()).toBe(onDisk)
    expect(resolve).not.toHaveBeenCalled()

    const next = await service.replyUserInput(sessionId, requestId, answer('Right'))
    expect(next.pendingUserInput?.question).toBe('Second?')
    await service.replyUserInput(sessionId, next.pendingUserInput!.requestId, answer('Left'))
    await expect(response).resolves.toMatchObject({
      behavior: 'allow',
      updatedInput: { answers: { 'First?': 'Right', 'Second?': 'Left' } },
    })
    expect(resolve).toHaveBeenCalledTimes(1)
  })

  it('retries only settlement after the final Claude answer was delivered', async () => {
    const { service, store, contents } = await claudeFixture()
    const { requestId, response, resolve } = await claudeQuestions(service, 1)
    const before = store.get(sessionId)
    const onDisk = await contents()
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))

    await expect(service.replyUserInput(sessionId, requestId, answer('Left')))
      .rejects.toThrow('disk full')
    await expect(response).resolves.toMatchObject({
      behavior: 'allow', updatedInput: { answers: { 'First?': 'Left' } },
    })
    expect(store.get(sessionId)).toEqual(before)
    expect(await contents()).toBe(onDisk)

    const settled = await service.replyUserInput(sessionId, requestId, answer('Left'))
    expect(settled.pendingUserInput).toBeUndefined()
    expect(resolve).toHaveBeenCalledTimes(1)
  })

  it.each(['permission', 'input', 'elicitation'] as const)(
    'retries only settlement after the Copilot %s callback was delivered',
    async (kind) => {
      const { service, store, contents } = await copilotFixture()
      const { response, resolve, reply } = await copilotRequest(service, kind)
      const before = store.get(sessionId)
      const onDisk = await contents()
      vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))

      await expect(reply()).rejects.toThrow('disk full')
      await response
      expect(resolve).toHaveBeenCalledTimes(1)
      expect(store.get(sessionId)).toEqual(before)
      expect(await contents()).toBe(onDisk)

      await expect(reply('Right')).rejects.toMatchObject({ statusCode: 409 })
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk still full'))
      await expect(reply()).rejects.toThrow('disk still full')
      expect(store.get(sessionId)).toEqual(before)
      expect(await contents()).toBe(onDisk)

      const settled = await reply()
      expect(settled.pendingPermission).toBeUndefined()
      expect(settled.pendingUserInput).toBeUndefined()
      expect(settled.status).toBe('running')
      expect(resolve).toHaveBeenCalledTimes(1)
    },
  )
})

describe('Concurrent Claude question advancement', () => {
  it('does not advance partial answers or keys while a write is pending or rejected', async () => {
    const { service, store, contents } = await claudeFixture()
    const original = await claudeQuestions(service, 3)
    const second = await service.replyUserInput(sessionId, original.requestId, answer('Left'))
    const requestId = second.pendingUserInput!.requestId
    const pending = service['userInputs'].get(requestId)!
    const before = store.get(sessionId)
    const onDisk = await contents()
    const gate = holdWrite()
    const first = service.replyUserInput(sessionId, requestId, answer('Left'))
    const firstRejected = expect(first).rejects.toThrow('disk full')
    await gate.started
    const duplicate = service.replyUserInput(sessionId, requestId, answer('Left'))
    const duplicateRejected = expect(duplicate).rejects.toThrow('disk full')
    await expect(service.replyUserInput(sessionId, requestId, answer('Right')))
      .rejects.toMatchObject({ statusCode: 409 })

    expect(store.get(sessionId)).toEqual(before)
    expect(await contents()).toBe(onDisk)
    expect(service['userInputs'].get(requestId)).toBe(pending)
    expect(pending).toMatchObject({ index: 1, answers: { 'First?': 'Left' }, requestId })
    expect([...service['userInputs'].keys()]).toEqual([requestId])
    expect(original.resolve).not.toHaveBeenCalled()
    gate.fail(new Error('disk full'))
    await Promise.all([firstRejected, duplicateRejected])
    expect(store.get(sessionId)).toEqual(before)
    expect(await contents()).toBe(onDisk)
    expect(service['userInputs'].get(requestId)).toBe(pending)
    expect(pending).toMatchObject({ index: 1, answers: { 'First?': 'Left' }, requestId })

    const third = await service.replyUserInput(sessionId, requestId, answer('Right'))
    expect(third.pendingUserInput?.question).toBe('Third?')
    await expect(service.replyUserInput(sessionId, requestId, answer('Right')))
      .rejects.toThrow('no longer pending')
    await service.replyUserInput(sessionId, third.pendingUserInput!.requestId, answer('Left'))
    await expect(original.response).resolves.toMatchObject({
      behavior: 'allow',
      updatedInput: { answers: { 'First?': 'Left', 'Second?': 'Right', 'Third?': 'Left' } },
    })
    expect(original.resolve).toHaveBeenCalledTimes(1)
  })

  it('joins duplicate replies at every question without skipping or duplicating answers', async () => {
    const { service, store } = await claudeFixture()
    const original = await claudeQuestions(service, 3)
    let requestId = original.requestId
    for (let index = 0; index < 3; index += 1) {
      const previous = store.get(sessionId)
      const writes = vi.mocked(writeFile).mock.calls.length
      const gate = holdWrite()
      const first = service.replyUserInput(sessionId, requestId, answer('Left'))
      await gate.started
      const duplicate = service.replyUserInput(sessionId, requestId, answer('Left'))
      await expect(service.replyUserInput(sessionId, requestId, answer('Right')))
        .rejects.toMatchObject({ statusCode: 409 })
      expect(store.get(sessionId)).toEqual(previous)
      expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes + 1)
      expect(original.resolve).toHaveBeenCalledTimes(index === 2 ? 1 : 0)
      gate.finish()
      const [next, repeated] = await Promise.all([first, duplicate])
      expect(repeated).toEqual(next)
      if (index < 2) {
        expect(next.pendingUserInput?.question).toBe(index === 0 ? 'Second?' : 'Third?')
        expect(next.pendingUserInput?.requestId).not.toBe(requestId)
        requestId = next.pendingUserInput!.requestId
      } else {
        expect(next.pendingUserInput).toBeUndefined()
        expect(next.status).toBe('running')
      }
    }
    await expect(original.response).resolves.toMatchObject({
      behavior: 'allow',
      updatedInput: { answers: { 'First?': 'Left', 'Second?': 'Left', 'Third?': 'Left' } },
    })
    expect(original.resolve).toHaveBeenCalledTimes(1)
  })

  it('does not advance invalid multi-select answers and records each selection once', async () => {
    const { service, store } = await claudeFixture()
    const original = await claudeQuestions(service, 2, true)
    const before = store.get(sessionId)
    const writes = vi.mocked(writeFile).mock.calls.length
    await expect(service.replyUserInput(sessionId, original.requestId, {
      ...answer('Left'), answers: ['Left', 'Unknown'],
    })).rejects.toThrow('Unknown option')
    expect(store.get(sessionId)).toEqual(before)
    expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
    const second = await service.replyUserInput(sessionId, original.requestId, {
      ...answer('Left'), answers: ['Left', 'Right', 'Left'],
    })
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    await expect(service.replyUserInput(sessionId, second.pendingUserInput!.requestId, answer('Right')))
      .rejects.toThrow('disk full')
    await expect(service.replyUserInput(sessionId, second.pendingUserInput!.requestId, answer('Left')))
      .rejects.toMatchObject({ statusCode: 409 })
    await service.replyUserInput(sessionId, second.pendingUserInput!.requestId, answer('Right'))
    await expect(original.response).resolves.toMatchObject({
      behavior: 'allow',
      updatedInput: { answers: { 'First?': 'Left, Right', 'Second?': 'Right' } },
    })
    expect(original.resolve).toHaveBeenCalledTimes(1)
  })

  it('does not overwrite a newer question admitted before advancement is prepared', async () => {
    const { service, store } = await claudeFixture()
    const original = await claudeQuestions(service, 2)
    const before = service['userInputs'].get(original.requestId)!
    const newer = claudeQuestions(service, 1)
    await expect(service.replyUserInput(sessionId, original.requestId, answer('Left')))
      .rejects.toThrow('no longer pending')
    const next = await newer
    expect(store.get(sessionId)).toMatchObject({
      pendingUserInput: { requestId: next.requestId }, status: 'waiting',
    })
    expect(service['userInputs'].get(original.requestId)).toBe(before)
    expect(before.index).toBe(0)
    expect(before.answers).toEqual({})
    expect(original.resolve).not.toHaveBeenCalled()
    await service.replyUserInput(sessionId, next.requestId, answer('Right'))
    expect(next.resolve).toHaveBeenCalledTimes(1)
    expect(original.resolve).not.toHaveBeenCalled()
  })
})

describe('Accepted reply ownership', () => {
  it.each(['permission', 'input', 'elicitation'] as const)(
    'joins concurrent Copilot %s replies and refuses a conflicting choice',
    async (kind) => {
      const { service, store } = await copilotFixture()
      const pending = await copilotRequest(service, kind)
      const before = store.get(sessionId)
      const writes = vi.mocked(writeFile).mock.calls.length
      const gate = holdWrite()
      const first = pending.reply('Right')
      await gate.started
      const duplicate = pending.reply('Right')
      await expect(pending.reply('Left')).rejects.toMatchObject({ statusCode: 409 })
      expect(store.get(sessionId)).toEqual(before)
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes + 1)
      gate.finish()
      const [settled, repeated] = await Promise.all([first, duplicate])
      expect(repeated).toEqual(settled)
      expect(settled.status).toBe('running')
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      await expect(pending.response).resolves.toEqual(kind === 'permission'
        ? { kind: 'reject', feedback: 'Rejected from Agentic Remote' }
        : kind === 'input'
          ? { answer: 'Right', wasFreeform: false }
          : { action: 'accept', content: { direction: 'Right' } })
      await expect(pending.reply('Left')).rejects.toThrow('no longer pending')
      expect(pending.resolve).toHaveBeenCalledTimes(1)
    },
  )

  it.each(['permission', 'input'] as const)(
    'retains an accepted Claude %s through repeated settlement refusals',
    async (kind) => {
      const { service, store, contents } = await claudeFixture()
      const pending = await claudeRequest(service, kind)
      const before = store.get(sessionId)
      const onDisk = await contents()
      vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
      await expect(pending.reply()).rejects.toThrow('accepted')
      await pending.response
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      expect(store.get(sessionId)).toEqual(before)
      expect(await contents()).toBe(onDisk)
      await expect(pending.reply('Right')).rejects.toMatchObject({ statusCode: 409 })
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk still full'))
      await expect(pending.reply()).rejects.toThrow('disk still full')
      expect(store.get(sessionId)).toEqual(before)
      expect(await contents()).toBe(onDisk)
      service['resolvePending'](sessionId, 'Provider finished')
      const settled = await pending.reply()
      expect(settled.status).toBe('running')
      expect(settled.pendingPermission).toBeUndefined()
      expect(settled.pendingUserInput).toBeUndefined()
      expect(pending.resolve).toHaveBeenCalledTimes(1)
    },
  )

  it.each([
    ['permission', 'permission'],
    ['permission', 'input'],
    ['input', 'permission'],
    ['input', 'input'],
    ['elicitation', 'permission'],
    ['elicitation', 'input'],
  ] as const)(
    'settles an older Copilot %s without consuming a newer %s',
    async (olderKind, newerKind) => {
      const { service, store } = await copilotFixture()
      const older = await copilotRequest(service, olderKind)
      const gate = holdWrite()
      const rejected = expect(older.reply()).rejects.toThrow('disk full')
      await gate.started
      const newerRequest = copilotRequest(service, newerKind)
      gate.fail(new Error('disk full'))
      await rejected
      const newer = await newerRequest
      const waiting = store.get(sessionId)!
      const settled = await older.reply()
      expect(settled).toMatchObject({
        status: 'waiting',
        activity: newerKind === 'permission'
          ? waiting.pendingPermission!.title
          : waiting.pendingUserInput!.question,
        [newerKind === 'permission' ? 'pendingPermission' : 'pendingUserInput']: {
          requestId: newer.requestId,
        },
      })
      expect(newer.resolve).not.toHaveBeenCalled()
      expect(older.resolve).toHaveBeenCalledTimes(1)
      await newer.reply('Right')
      expect(newer.resolve).toHaveBeenCalledTimes(1)
      expect(older.resolve).toHaveBeenCalledTimes(1)
    },
  )

  it.each([
    ['permission', 'permission'],
    ['permission', 'input'],
    ['input', 'permission'],
    ['input', 'input'],
  ] as const)(
    'settles an older Claude %s without consuming a newer %s',
    async (olderKind, newerKind) => {
      const { service, store } = await claudeFixture()
      const older = await claudeRequest(service, olderKind)
      const gate = holdWrite()
      const rejected = expect(older.reply()).rejects.toThrow('disk full')
      await gate.started
      const newerRequest = claudeRequest(service, newerKind)
      gate.fail(new Error('disk full'))
      await rejected
      const newer = await newerRequest
      const waiting = store.get(sessionId)!
      const settled = await older.reply()
      expect(settled).toMatchObject({
        status: 'waiting',
        activity: newerKind === 'permission'
          ? waiting.pendingPermission!.title
          : waiting.pendingUserInput!.question,
        [newerKind === 'permission' ? 'pendingPermission' : 'pendingUserInput']: {
          requestId: newer.requestId,
        },
      })
      expect(newer.resolve).not.toHaveBeenCalled()
      expect(older.resolve).toHaveBeenCalledTimes(1)
      await newer.reply('Right')
      expect(newer.resolve).toHaveBeenCalledTimes(1)
      expect(older.resolve).toHaveBeenCalledTimes(1)
    },
  )

  it('compares accepted elicitation values rather than mutable input objects or key order', async () => {
    const { service, store } = await copilotFixture()
    const pending = await copilotRequest(service, 'elicitation')
    const values = { direction: 'Left', detail: 'Original' }
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    await expect(service.replyUserInput(sessionId, pending.requestId, {
      ...answer('Left'), values,
    })).rejects.toThrow('disk full')
    values.direction = 'Right'
    await expect(service.replyUserInput(sessionId, pending.requestId, {
      ...answer('Left'), values,
    })).rejects.toMatchObject({ statusCode: 409 })
    await service.replyUserInput(sessionId, pending.requestId, {
      ...answer('Different display text'), values: { detail: 'Original', direction: 'Left' },
    })
    expect(store.get(sessionId)?.pendingUserInput).toBeUndefined()
    expect(pending.resolve).toHaveBeenCalledTimes(1)
  })

  it.each(['decline', 'cancel'] as const)(
    'settles a Copilot elicitation %s without delivering another action',
    async (action) => {
      const { service } = await copilotFixture()
      const pending = await copilotRequest(service, 'elicitation')
      const reply = { ...answer(''), action }
      vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
      await expect(service.replyUserInput(sessionId, pending.requestId, reply))
        .rejects.toThrow('disk full')
      await expect(pending.response).resolves.toEqual({ action })
      await expect(pending.reply()).rejects.toMatchObject({ statusCode: 409 })
      await service.replyUserInput(sessionId, pending.requestId, reply)
      expect(pending.resolve).toHaveBeenCalledTimes(1)
    },
  )
})

describe('Reply lifecycle cleanup', () => {
  for (const provider of ['copilot', 'claude'] as const) {
    const setup = provider === 'copilot'
      ? async () => {
          const fixture = await copilotFixture()
          const pending = await copilotRequest(fixture.service, 'input')
          return { ...fixture, pending }
        }
      : async () => {
          const fixture = await claudeFixture()
          const pending = await claudeRequest(fixture.service, 'input')
          return { ...fixture, pending }
        }

    it.each(['stop', 'delete'] as const)(
      `does not schedule ${provider} accepted-reply retries after %s`,
      async (operation) => {
        const { service, store, pending } = await setup()
        vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
        await expect(pending.reply()).rejects.toThrow('disk full')
        await store.readAfterWrites(sessionId)
        await (operation === 'stop' ? service.stop() : service.deleteSession(sessionId))
        const writes = vi.mocked(writeFile).mock.calls.length
        await expect(pending.reply()).rejects.toThrow('no longer available')
        await nextTick()
        await store.flush()
        expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
        expect(pending.resolve).toHaveBeenCalledTimes(1)
        if (operation === 'delete') expect(store.get(sessionId)).toBeUndefined()
        expect(service instanceof AgentService
          ? service['acceptedSdkReplies'].size
          : service['pendingReplies'].size).toBe(0)
      },
    )

    it(`gives duplicate ${provider} replies the same refused settlement outcome`, async () => {
      const { service, store, pending } = await setup()
      const before = store.get(sessionId)
      const gate = holdWrite()
      const first = expect(pending.reply()).rejects.toThrow('disk full')
      await gate.started
      const duplicate = expect(pending.reply()).rejects.toThrow('disk full')
      gate.fail(new Error('disk full'))
      await Promise.all([first, duplicate])
      expect(store.get(sessionId)).toEqual(before)
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      const writes = vi.mocked(writeFile).mock.calls.length
      await nextTick()
      expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
      await pending.reply()
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      expect(service.store.get(sessionId)?.pendingUserInput).toBeUndefined()
    })

    it(`retains ${provider} settlement state when deleting the stored session fails`, async () => {
      const { service, store, pending } = await setup()
      vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
      await expect(pending.reply()).rejects.toThrow('disk full')
      vi.mocked(rename).mockRejectedValueOnce(new Error('delete refused'))
      await expect(service.deleteSession(sessionId)).rejects.toThrow('delete refused')
      expect(store.get(sessionId)?.pendingUserInput?.requestId).toBe(pending.requestId)
      await pending.reply()
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      expect(store.get(sessionId)?.pendingUserInput).toBeUndefined()
    })

    it.each(['stop', 'delete'] as const)(
      `drains an unpublished ${provider} request and refuses new registrations during %s`,
      async (operation) => {
        const { service, store } = provider === 'copilot'
          ? await copilotFixture()
          : await claudeFixture()
        const published = vi.fn()
        service.on('event', published)
        const gate = holdWrite()
        const response = requestInput(service)
        const owners = service instanceof AgentService
          ? service['userInputs']
          : service['userInputs']
        const owner = [...owners.values()][0]
        const resolve = vi.spyOn(owner, 'resolve')
        await gate.started
        let finished = false
        const closing = (operation === 'stop' ? service.stop() : service.deleteSession(sessionId))
          .then(() => { finished = true })
        await nextTick()
        expect(finished).toBe(false)
        await requestInput(service)
        expect(resolve).toHaveBeenCalledTimes(1)
        gate.finish()
        await closing
        await expect(response).resolves.toMatchObject(provider === 'copilot'
          ? { answer: '', wasFreeform: true }
          : { behavior: 'deny' })
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(owners.size).toBe(0)
        expect(published.mock.calls.flatMap(([event]) => event.type === 'session.upserted' ? [event] : []))
          .toEqual([])
        const writes = vi.mocked(writeFile).mock.calls.length
        await requestInput(service)
        await nextTick()
        await store.flush()
        expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
      },
    )

    it.each(['stop', 'delete'] as const)(
      `waits for an in-flight ${provider} reply write during %s`,
      async (operation) => {
        const { service, store, pending } = await setup()
        const published = vi.fn()
        service.on('event', published)
        const gate = holdWrite()
        const reply = pending.reply()
        await gate.started
        let finished = false
        const closing = (operation === 'stop' ? service.stop() : service.deleteSession(sessionId))
          .then(() => { finished = true })
        await nextTick()
        expect(finished).toBe(false)
        await expect(pending.reply()).rejects.toThrow('no longer available')
        gate.finish()
        await Promise.all([reply, closing])
        const writes = vi.mocked(writeFile).mock.calls.length
        await nextTick()
        await store.flush()
        expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
        expect(pending.resolve).toHaveBeenCalledTimes(1)
        expect(published.mock.calls.flatMap(([event]) => event.type === 'session.upserted' ? [event] : []))
          .toEqual([])
        if (operation === 'delete') expect(store.get(sessionId)).toBeUndefined()
      },
    )
  }

  it.each(['stop', 'delete'] as const)(
    'does not adopt a new Claude question key while %s cancels an advancement',
    async (operation) => {
      const { service, store } = await claudeFixture()
      const original = await claudeQuestions(service, 3)
      const gate = holdWrite()
      const rejected = expect(service.replyUserInput(sessionId, original.requestId, answer('Left')))
        .rejects.toThrow('no longer pending')
      await gate.started
      let finished = false
      const closing = (operation === 'stop' ? service.stop() : service.deleteSession(sessionId))
        .then(() => { finished = true })
      await nextTick()
      expect(finished).toBe(false)
      gate.finish()
      await Promise.all([rejected, closing])
      await expect(original.response).resolves.toMatchObject({ behavior: 'deny' })
      expect(original.resolve).toHaveBeenCalledTimes(1)
      expect(service['userInputs'].size).toBe(0)
      expect(service['pendingReplies'].size).toBe(0)
      const writes = vi.mocked(writeFile).mock.calls.length
      await expect(service['canUseTool'](sessionId, 'Bash', {}))
        .resolves.toMatchObject({ behavior: 'deny' })
      await nextTick()
      await store.flush()
      expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
    },
  )
})
