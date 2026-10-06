import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Query } from '@anthropic-ai/claude-agent-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserInputReplyInput } from '../shared/contracts.js'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { SessionStore } from './session-store.js'
import { TerminalFormReplyError } from './terminal-session.js'

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
  ownPrompt(service)
  fixtures.push({ directory: setup.directory, service })
  return { ...setup, service }
}

async function terminalFormFixture() {
  const setup = await copilotFixture()
  const requestId = 'persisted-user-input:form-call'
  await setup.store.update(sessionId, (session) => {
    session.status = 'waiting'
    session.pendingUserInput = {
      requestId, question: 'Confirm the full synthetic question?', choices: [], allowFreeform: false,
      form: { fields: [{ name: 'confirm', title: 'Confirm', type: 'boolean', required: true }] },
    }
  })
  const terminal = setup.service['terminalController']
  terminal.has = vi.fn(async () => true)
  const fill = vi.fn(async () => true)
  const dismiss = vi.fn(async () => true)
  terminal.fillUserInputForm = fill
  terminal.dismissUserInput = dismiss
  const complete = vi.fn(async () => false)
  setup.service['isToolCallComplete'] = complete
  const input = { answer: '{"confirm":true}', wasFreeform: false, values: { confirm: true } }
  const reply = (value: UserInputReplyInput = input) => setup.service.replyUserInput(sessionId, requestId, value)
  return { ...setup, terminal, fill, dismiss, complete, requestId, input, reply }
}

async function fallbackFormFixture() {
  const f = await terminalFormFixture()
  f.fill.mockResolvedValue(false)
  const wait = vi.fn(async () => false)
  f.service['waitForToolCompletion'] = wait
  const send = vi.spyOn(f.service, 'sendMessage')
    .mockImplementation(async () => f.store.get(sessionId)!)
  return { ...f, wait, send }
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
  ownPrompt(service)
  fixtures.push({ directory: setup.directory, service })
  return { ...setup, service, sdk }
}

function holdCompletion() {
  let finish = () => {}
  const done = new Promise<void>((resolve) => { finish = resolve })
  releases.push(finish)
  return { done, finish }
}

async function assistantFixture(store: SessionStore) {
  const assistantId = randomUUID()
  await store.update(sessionId, (session) => {
    session.messages.push({
      id: assistantId, role: 'assistant', content: '',
      createdAt: '2026-09-06T00:00:00.000Z', streaming: true,
    })
  })
  return assistantId
}

function ownPrompt(service: AgentService | ClaudeAgentService) {
  if (service instanceof AgentService) {
    const owner = { assistantMessageId: randomUUID() }
    service['activePrompts'].set(sessionId, owner)
    return owner
  }
  const owner = {
    abortController: new AbortController(),
    query: (async function* () {})() as unknown as Query,
    resourceOwner: Symbol(),
    resourceReads: service['resourceReads'],
    done: Promise.resolve(),
    finish: () => {},
  }
  service['active'].set(sessionId, owner)
  return owner
}

function releasePrompt(service: AgentService | ClaudeAgentService) {
  if (service instanceof AgentService) service['activePrompts'].delete(sessionId)
  else service['active'].delete(sessionId)
}

async function copilotRunFixture(outcome: 'idle' | 'error' = 'idle') {
  const setup = await copilotFixture()
  const assistantId = await assistantFixture(setup.store)
  const provider = holdCompletion()
  setup.service['activePrompts'].set(sessionId, { assistantMessageId: assistantId })
  const runtime: CopilotSessionLike = {
    sessionId,
    on: () => () => {},
    getEvents: async () => [],
    abort: async () => { provider.finish() },
    disconnect: async () => {},
    rpc: {
      commands: { list: async () => ({ commands: [] }), invoke: vi.fn(), enqueue: vi.fn() },
      name: { set: async () => {} },
      model: {
        getCurrent: async () => ({ modelId: 'fixture' }),
        switchTo: async () => ({ modelId: 'fixture' }),
      },
      mode: { set: async () => ({ status: 'applied', modelChanged: false }) },
    },
    sendAndWait: async () => {
      await provider.done
      if (outcome === 'error') throw new Error('Provider failed')
      return undefined
    },
  }
  const finished = setup.service['runPrompt'](runtime, 'fixture', assistantId)
    .catch((error: unknown) => error)
  return { ...setup, provider, finished }
}

async function claudeRunFixture() {
  const setup = await claudeFixture()
  const assistantId = await assistantFixture(setup.store)
  const provider = holdCompletion()
  releasePrompt(setup.service)
  vi.mocked(setup.sdk.query).mockImplementation(() =>
    (async function* () { await provider.done; yield* [] })() as unknown as Query)
  const finished = setup.service['runQuery'](sessionId, 'fixture', assistantId)
    .catch((error: unknown) => error)
  await vi.waitFor(() => expect(setup.service['active'].has(sessionId)).toBe(true))
  return { ...setup, provider, finished }
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
  it('retains the accepted terminal answer across restoration and confirmation-write failures', async () => {
    const f = await terminalFormFixture()
    const notices: string[] = []
    f.service.on('event', (event) => {
      if (event.type === 'error') notices.push(event.message)
    })
    f.fill.mockRejectedValueOnce(new TerminalFormReplyError(
      'The terminal reply was submitted, but size restoration failed', 'submitted',
    ))
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))

    await expect(f.reply()).rejects.toMatchObject({
      statusCode: 503, message: expect.stringContaining('reply was accepted'),
    })
    expect(f.fill).toHaveBeenCalledOnce()
    expect(f.dismiss).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(notices).toContain('The terminal reply was submitted, but size restoration failed')

    await expect(f.reply()).resolves.toMatchObject({ pendingUserInput: undefined })
    expect(f.fill).toHaveBeenCalledOnce()
  })

  it('does not dismiss, resend, or claim non-delivery after an uncertain terminal Enter', async () => {
    const f = await terminalFormFixture()
    f.fill.mockRejectedValueOnce(new TerminalFormReplyError(
      'The terminal reply may have been submitted; do not resend it', 'uncertain',
    ))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    await expect(f.reply({ ...f.input, values: { confirm: false } })).rejects
      .toMatchObject({ statusCode: 409, uncertainDelivery: true })
    expect(f.fill).toHaveBeenCalledOnce()
    expect(f.dismiss).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.store.get(sessionId)?.pendingUserInput?.requestId).toBe(f.requestId)

    f.complete.mockResolvedValue(true)
    await expect(f.reply()).resolves.toMatchObject({ pendingUserInput: undefined })
    expect(f.fill).toHaveBeenCalledOnce()
  })

  it('retires terminal uncertainty even when no accepted SDK reply is present', async () => {
    const f = await terminalFormFixture()
    f.fill.mockRejectedValueOnce(new TerminalFormReplyError('Unconfirmed Enter', 'uncertain'))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    expect(f.service['terminalFormUncertainty'].size).toBe(1)
    f.service['forgetSdkReplies'](sessionId)
    expect(f.service['terminalFormUncertainty'].size).toBe(0)
  })

  it.each(['uncertain error', 'completion timeout', 'cleanup error'] as const)(
    'continues the original fallback answer once after a delayed dismissal %s', async (failure) => {
      const f = await fallbackFormFixture()
      if (failure !== 'completion timeout') {
        f.dismiss.mockRejectedValueOnce(new TerminalFormReplyError(
          'Synthetic fallback dismissal', failure === 'cleanup error' ? 'submitted' : 'uncertain',
        ))
      }
      await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
      await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
      await expect(f.reply({ ...f.input, values: { confirm: false } })).rejects
        .toMatchObject({ statusCode: 409, uncertainDelivery: true })
      expect(f.send).not.toHaveBeenCalled()

      f.complete.mockResolvedValue(true)
      await expect(f.reply()).resolves.toMatchObject({ pendingUserInput: undefined })
      expect(f.send).toHaveBeenCalledExactlyOnceWith(
        sessionId, 'Answering the question you just asked, from the Agentic Remote app:\n- confirm: true', false,
      )
      expect(f.dismiss).toHaveBeenCalledExactlyOnceWith(sessionId, {
        question: 'Confirm the full synthetic question?', fields: ['Confirm'],
      })
      expect(f.fill).toHaveBeenCalledOnce()
      await expect(f.reply()).rejects.toThrow('no longer pending')
      expect(f.send).toHaveBeenCalledOnce()
    },
  )

  it.each(['immediate', 'delayed'] as const)(
    'retains the fallback answer after %s dismissal and a failed pending-card write', async (timing) => {
      const f = await fallbackFormFixture()
      if (timing === 'delayed') {
        f.dismiss.mockRejectedValueOnce(new TerminalFormReplyError('Unconfirmed fallback Escape', 'uncertain'))
        await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
        f.complete.mockResolvedValue(true)
      } else {
        f.wait.mockResolvedValue(true)
      }
      vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
      await expect(f.reply()).rejects.toThrow('disk full')
      expect(f.send).not.toHaveBeenCalled()
      f.complete.mockResolvedValue(true)
      await expect(f.reply()).resolves.toMatchObject({ pendingUserInput: undefined })
      expect(f.send).toHaveBeenCalledExactlyOnceWith(
        sessionId, 'Answering the question you just asked, from the Agentic Remote app:\n- confirm: true', false,
      )
      expect(f.dismiss).toHaveBeenCalledOnce()
      expect(f.fill).toHaveBeenCalledOnce()
    },
  )

  it('joins fallback continuation retries and preserves the captured fields and values', async () => {
    const f = await fallbackFormFixture()
    const values = { confirm: true, detail: '**Literal** `payload` > 1\nkeep: false' }
    await f.store.update(sessionId, (session) => {
      session.pendingUserInput!.form!.fields.push({ name: 'detail', title: 'Detail', type: 'string', required: true })
    })
    const original = { answer: JSON.stringify(values), wasFreeform: false, values: { ...values } }
    f.dismiss.mockRejectedValueOnce(new TerminalFormReplyError('Unconfirmed fallback Escape', 'uncertain'))
    await expect(f.reply(original)).rejects.toMatchObject({ uncertainDelivery: true })
    original.values.detail = 'changed after the first call'
    await expect(f.reply(original)).rejects.toMatchObject({ statusCode: 409, uncertainDelivery: true })
    const held = holdCompletion()
    f.send.mockImplementation(async () => { await held.done; return f.store.get(sessionId)! })
    f.complete.mockResolvedValue(true)
    const retry = { ...original, values }
    const first = f.reply(retry)
    await vi.waitFor(() => expect(f.send).toHaveBeenCalledOnce())
    const second = f.reply(retry)
    await expect(f.reply(original)).rejects.toMatchObject({ statusCode: 409 })
    held.finish()
    await Promise.all([first, second])
    expect(f.send).toHaveBeenCalledExactlyOnceWith(
      sessionId,
      'Answering the question you just asked, from the Agentic Remote app:\n- confirm: true\n- detail: **Literal** `payload` > 1\nkeep: false',
      false,
    )
    expect(f.dismiss).toHaveBeenCalledOnce()
  })

  it.each([true, undefined])('retains fallback send uncertainty (%s) without using the earlier tool completion as delivery', async (uncertainDelivery) => {
    const f = await fallbackFormFixture()
    f.wait.mockResolvedValue(true)
    f.send.mockRejectedValueOnce(Object.assign(new Error('Synthetic lost send receipt'), { uncertainDelivery }))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    f.complete.mockResolvedValue(true)
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    await expect(f.reply({ ...f.input, values: { confirm: false } })).rejects
      .toMatchObject({ statusCode: 409, uncertainDelivery: true })
    expect(f.send).toHaveBeenCalledOnce()
    expect(f.dismiss).toHaveBeenCalledOnce()
  })

  it('retries the retained continuation only after an explicitly unsent message refusal', async () => {
    const f = await fallbackFormFixture()
    f.wait.mockResolvedValue(true)
    f.send.mockRejectedValueOnce(Object.assign(new Error('Refused before delivery'), { uncertainDelivery: false }))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: false })
    f.complete.mockResolvedValue(true)
    await expect(f.reply()).resolves.toMatchObject({ pendingUserInput: undefined })
    expect(f.send).toHaveBeenCalledTimes(2)
    expect(f.send.mock.calls[0]).toEqual(f.send.mock.calls[1])
    expect(f.fill).toHaveBeenCalledOnce()
    expect(f.dismiss).toHaveBeenCalledOnce()
  })

  it('retains a real accepted continuation receipt after post-send persistence fails', async () => {
    const f = await fallbackFormFixture()
    f.send.mockRestore()
    f.wait.mockResolvedValue(true)
    vi.mocked(f.terminal.send).mockImplementation(async () => {
      vi.mocked(rename).mockRejectedValueOnce(new Error('post-send disk full'))
      return true
    })
    await expect(f.reply()).rejects.toMatchObject({
      uncertainDelivery: true, submission: { sessionId, accepted: true },
    })
    f.complete.mockResolvedValue(true)
    await expect(f.reply()).rejects.toMatchObject({
      uncertainDelivery: true, submission: { sessionId, accepted: true },
    })
    expect(f.terminal.send).toHaveBeenCalledOnce()
    expect(vi.mocked(f.terminal.send).mock.calls[0]?.[1]).toBe(
      'Answering the question you just asked, from the Agentic Remote app:\n- confirm: true',
    )
    expect(f.dismiss).toHaveBeenCalledOnce()
  })

  it('keeps an unclassified fallback dismissal uncertain even if the tool completes later', async () => {
    const f = await fallbackFormFixture()
    f.dismiss.mockRejectedValueOnce(new Error('Unknown owner/delivery failure'))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    f.complete.mockResolvedValue(true)
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    expect(f.send).not.toHaveBeenCalled()
    expect(f.dismiss).toHaveBeenCalledOnce()
    f.service['forgetSdkReplies'](sessionId)
    expect(f.service['terminalFormContinuations'].size).toBe(0)
  })

  it('continues the retained original when the completed tool no longer has a pending card', async () => {
    const f = await fallbackFormFixture()
    f.dismiss.mockRejectedValueOnce(new TerminalFormReplyError('Unconfirmed fallback Escape', 'uncertain'))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    await f.store.clearPendingRequest(sessionId, 'pendingUserInput', f.requestId, { status: 'idle' })
    f.complete.mockResolvedValue(true)
    await expect(f.reply()).resolves.toMatchObject({ pendingUserInput: undefined })
    expect(f.send).toHaveBeenCalledExactlyOnceWith(
      sessionId, 'Answering the question you just asked, from the Agentic Remote app:\n- confirm: true', false,
    )
    expect(f.dismiss).toHaveBeenCalledOnce()
  })

  it.each(['request', 'question', 'fields'] as const)('does not clear or send into changed %s identity after the fallback completion arrives', async (changed) => {
    const f = await fallbackFormFixture()
    f.dismiss.mockRejectedValueOnce(new TerminalFormReplyError('Unconfirmed fallback Escape', 'uncertain'))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    await f.store.update(sessionId, (session) => {
      if (changed === 'request') session.pendingUserInput!.requestId = 'persisted-user-input:next-form'
      if (changed === 'question') session.pendingUserInput!.question = 'A different question with the same fields?'
      if (changed === 'fields') session.pendingUserInput!.form!.fields[0].name = 'otherConfirmation'
    })
    const pending = f.store.get(sessionId)?.pendingUserInput
    f.complete.mockResolvedValue(true)
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: true })
    expect(f.store.get(sessionId)?.pendingUserInput).toEqual(pending)
    expect(f.send).not.toHaveBeenCalled()
    expect(f.dismiss).toHaveBeenCalledOnce()
  })

  it.each(['cancel', 'decline'] as const)('does not duplicate an uncertain terminal %s', async (action) => {
    const f = await terminalFormFixture()
    f.dismiss.mockRejectedValueOnce(new TerminalFormReplyError(
      'The terminal dismissal may have been submitted', 'uncertain',
    ))
    const input = { ...f.input, action }
    await expect(f.reply(input)).rejects.toMatchObject({ uncertainDelivery: true })
    await expect(f.reply(input)).rejects.toMatchObject({ uncertainDelivery: true })
    expect(f.dismiss).toHaveBeenCalledOnce()
    expect(f.fill).not.toHaveBeenCalled()
    f.complete.mockResolvedValue(true)
    await expect(f.reply(input)).resolves.toMatchObject({ pendingUserInput: undefined })
  })

  it.each(['cancel', 'decline'] as const)('retains accepted %s across a restoration error and failed confirmation write', async (action) => {
    const f = await terminalFormFixture()
    f.dismiss.mockImplementationOnce(async () => {
      f.complete.mockResolvedValue(true)
      throw new TerminalFormReplyError('Terminal dismissal was submitted, but cleanup failed', 'submitted')
    })
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    const input = { ...f.input, action }
    await expect(f.reply(input)).rejects.toMatchObject({ statusCode: 503 })
    await expect(f.reply(input)).resolves.toMatchObject({ pendingUserInput: undefined })
    expect(f.dismiss).toHaveBeenCalledOnce()
    expect(f.fill).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
  })

  it('joins concurrent identical terminal replies and refuses a conflicting answer', async () => {
    const f = await terminalFormFixture()
    const held = holdCompletion()
    f.fill.mockImplementation(async () => { await held.done; return true })
    const first = f.reply()
    await vi.waitFor(() => expect(f.fill).toHaveBeenCalledOnce())
    const second = f.reply()
    await expect(f.reply({ ...f.input, values: { confirm: false } })).rejects
      .toMatchObject({ statusCode: 409 })
    held.finish()
    await Promise.all([first, second])
    expect(f.fill).toHaveBeenCalledOnce()
    expect(f.dismiss).not.toHaveBeenCalled()
  })

  it('keeps sequential terminal form receipts and the second pending draft distinct', async () => {
    const f = await terminalFormFixture()
    const question = (stage: number) => [
      `Synthetic stage ${stage}; no operations will be executed.`,
      '```json',
      ...Array.from({ length: 48 }, (_, index) => `  "setting_${index}": "stage_${stage}",`),
      '```',
    ].join('\n')
    await f.store.update(sessionId, (session) => {
      session.pendingUserInput!.question = question(1)
    })
    vi.mocked(rename).mockRejectedValueOnce(new Error('first receipt write refused'))
    await expect(f.reply()).rejects.toMatchObject({ statusCode: 503 })
    expect(f.service['acceptedSdkReplies'].get(f.requestId)?.choice).toMatchObject({
      kind: 'elicitation', response: { action: 'accept', content: { confirm: true } },
    })

    const secondId = 'persisted-user-input:second-form-call'
    await f.store.update(sessionId, (session) => {
      session.pendingUserInput = { ...session.pendingUserInput!, requestId: secondId, question: question(2) }
    })
    const secondDraft = f.store.get(sessionId)!.pendingUserInput
    const secondInput = { answer: '{"confirm":false}', wasFreeform: false, values: { confirm: false } }
    const secondReply = (input = secondInput) => f.service.replyUserInput(sessionId, secondId, input)
    f.fill.mockRejectedValueOnce(new TerminalFormReplyError('Unconfirmed second Enter', 'uncertain'))
    await expect(secondReply()).rejects.toMatchObject({ uncertainDelivery: true })

    await expect(f.reply()).resolves.toMatchObject({ pendingUserInput: secondDraft })
    expect(f.store.get(sessionId)?.pendingUserInput).toEqual(secondDraft)
    expect(f.service['terminalFormUncertainty'].get(JSON.stringify([sessionId, secondId]))?.choice)
      .toMatchObject({ kind: 'elicitation', response: { action: 'accept', content: { confirm: false } } })
    await expect(f.reply()).rejects.toThrow('no longer pending')
    await expect(secondReply(f.input)).rejects.toMatchObject({ statusCode: 409, uncertainDelivery: true })
    expect(f.store.get(sessionId)?.pendingUserInput).toEqual(secondDraft)

    f.complete.mockResolvedValue(true)
    await expect(secondReply()).resolves.toMatchObject({ pendingUserInput: undefined })
    expect(f.complete).toHaveBeenLastCalledWith(sessionId, 'second-form-call')
    expect(f.fill).toHaveBeenCalledTimes(2)
    expect(f.fill).toHaveBeenNthCalledWith(1, sessionId, expect.any(Array), { question: question(1), fields: ['Confirm'] })
    expect(f.fill).toHaveBeenNthCalledWith(2, sessionId, expect.any(Array), { question: question(2), fields: ['Confirm'] })
    expect(f.dismiss).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
    expect(f.input.values).toEqual({ confirm: true })
    expect(secondInput.values).toEqual({ confirm: false })
  })

  it('surfaces a geometry refusal without falling back to dismissal or a message', async () => {
    const f = await terminalFormFixture()
    f.fill.mockRejectedValueOnce(new TerminalFormReplyError(
      'The terminal form could not be safely answered: owner changed', 'not-submitted',
    ))
    await expect(f.reply()).rejects.toMatchObject({ uncertainDelivery: false })
    expect(f.service['answeredPersistedInputs'].has(sessionId)).toBe(false)
    expect(f.dismiss).not.toHaveBeenCalled()
    expect(f.terminal.send).not.toHaveBeenCalled()
  })

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

describe('Reply continuation ownership', () => {
  for (const kind of ['permission', 'input', 'elicitation'] as const) {
    it.each([
      ['idle', 'before'],
      ['idle', 'after'],
      ['error', 'before'],
      ['error', 'after'],
    ] as const)(
      `keeps a Copilot ${kind} reply %s when the provider ends %s confirmation refusal`,
      async (outcome, timing) => {
        const { service, store, provider, finished } = await copilotRunFixture(outcome)
        const pending = await copilotRequest(service, kind)
        const gate = holdWrite()
        const refused = expect(pending.reply()).rejects.toThrow('disk full')
        await gate.started
        if (timing === 'before') {
          provider.finish()
          await nextTick()
        }
        gate.fail(new Error('disk full'))
        await refused
        provider.finish()
        expect(await finished).toBeUndefined()
        expect(store.get(sessionId)?.status).toBe(outcome)
        expect(service['activePrompts'].has(sessionId)).toBe(false)
        expect(kind === 'permission'
          ? store.get(sessionId)?.pendingPermission?.requestId
          : store.get(sessionId)?.pendingUserInput?.requestId).toBe(pending.requestId)
        await expect(pending.reply('Right')).rejects.toMatchObject({ statusCode: 409 })

        const settled = await pending.reply()
        expect(settled.status).toBe(outcome)
        expect(settled.activity).toBeUndefined()
        expect(settled.pendingPermission).toBeUndefined()
        expect(settled.pendingUserInput).toBeUndefined()
        expect(pending.resolve).toHaveBeenCalledTimes(1)
        const admitted = await store.beginPrompt(
          sessionId, 'Next prompt', randomUUID(), () => !service['activePrompts'].has(sessionId),
        )
        expect(admitted.status).toBe('running')
      },
    )
  }

  for (const providerName of ['copilot', 'claude'] as const) {
    const setup = providerName === 'copilot'
      ? async () => {
          const fixture = await copilotFixture()
          return { ...fixture, pending: await copilotRequest(fixture.service, 'input') }
        }
      : async () => {
          const fixture = await claudeFixture()
          return { ...fixture, pending: await claudeRequest(fixture.service, 'input') }
        }

    it.each(['before', 'after'] as const)(
      `does not revive ${providerName} when completion writes fail %s confirmation refusal`,
      async (timing) => {
      const { service, store, provider, finished } = providerName === 'copilot'
        ? await copilotRunFixture()
        : await claudeRunFixture()
      const pending = service instanceof AgentService
        ? await copilotRequest(service, 'input')
        : await claudeRequest(service, 'input')
      vi.mocked(writeFile).mockRejectedValue(new Error('disk full'))
      const gate = holdWrite()
      const refused = expect(pending.reply()).rejects.toThrow('disk full')
      await gate.started
      if (timing === 'before') {
        provider.finish()
        await nextTick()
      }
      gate.fail(new Error('disk full'))
      await refused
      provider.finish()
      expect(await finished).toEqual(new Error('disk full'))
      expect(service instanceof AgentService
        ? service['activePrompts'].has(sessionId)
        : service['active'].has(sessionId)).toBe(false)
      expect(store.get(sessionId)?.status).toBe('waiting')
      expect(store.get(sessionId)?.pendingUserInput?.requestId).toBe(pending.requestId)
      vi.mocked(writeFile).mockImplementation(disk.writeFile)
      await expect(pending.reply('Right')).rejects.toMatchObject({ statusCode: 409 })

      const settled = await pending.reply()
      expect(settled.status).toBe('idle')
      expect(settled.activity).toBeUndefined()
      expect(settled.pendingUserInput).toBeUndefined()
      expect(pending.resolve).toHaveBeenCalledTimes(1)
      const admitted = await store.beginPrompt(sessionId, 'Next prompt', randomUUID(), () => true)
      expect(admitted.status).toBe('running')
      },
    )

    it(`reads current ${providerName} ownership only when the reply mutation prepares`, async () => {
      const { service, store, pending } = await setup()
      const gate = holdWrite()
      const earlier = store.update(sessionId, (stored) => { stored.title = 'Earlier write' })
      await gate.started
      const settling = pending.reply()
      releasePrompt(service)
      gate.finish()
      await earlier
      const settled = await settling
      expect(settled.status).toBe('idle')
      expect(settled.activity).toBeUndefined()
      expect(pending.resolve).toHaveBeenCalledTimes(1)
    })

    it.each(['idle', 'error'] as const)(
      `preserves an admitted ${providerName} %s state while its owner is still tearing down`,
      async (status) => {
        const { store, pending } = await setup()
        const gate = holdWrite()
        const earlier = store.update(sessionId, (stored) => { stored.title = 'Earlier write' })
        await gate.started
        const completed = store.updateStatus(sessionId, status, `${status} outcome`)
        const settling = pending.reply()
        expect(store.get(sessionId)?.status).toBe('waiting')
        gate.finish()
        await Promise.all([earlier, completed])
        const settled = await settling
        expect(settled.status).toBe(status)
        expect(settled.activity).toBe(`${status} outcome`)
        expect(pending.resolve).toHaveBeenCalledTimes(1)
      },
    )

    it(`preserves a newer ${providerName} prompt that takes ownership before settlement prepares`, async () => {
      const { service, store, pending } = await setup()
      vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
      await expect(pending.reply()).rejects.toThrow('disk full')
      const gate = holdWrite()
      const earlier = store.update(sessionId, (stored) => { stored.title = 'Earlier write' })
      await gate.started
      const changed = store.updateStatus(sessionId, 'running', 'Newer provider work')
      const settling = pending.reply()
      const nextOwner = ownPrompt(service)
      await expect(pending.reply('Right')).rejects.toMatchObject({ statusCode: 409 })
      gate.finish()
      await Promise.all([earlier, changed])
      const settled = await settling
      expect(settled).toMatchObject({ status: 'running', activity: 'Newer provider work' })
      expect(service instanceof AgentService
        ? service['activePrompts'].get(sessionId)
        : service['active'].get(sessionId)).toBe(nextOwner)
      expect(pending.resolve).toHaveBeenCalledTimes(1)
    })

    it.each(['permission', 'input'] as const)(
      `preserves a newer ${providerName} %s after the original provider owner ends`,
      async (kind) => {
        const { service, store, pending } = await setup()
        vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
        await expect(pending.reply()).rejects.toThrow('disk full')
        releasePrompt(service)
        const newer = service instanceof AgentService
          ? await copilotRequest(service, kind)
          : await claudeRequest(service, kind)
        const field = kind === 'permission' ? 'pendingPermission' : 'pendingUserInput'
        const card = store.get(sessionId)?.[field]
        const settled = await pending.reply()
        expect(settled.status).toBe('waiting')
        expect(settled[field]).toEqual(card)
        expect(newer.resolve).not.toHaveBeenCalled()
        expect(pending.resolve).toHaveBeenCalledTimes(1)
        const ended = await newer.reply()
        expect(ended.status).toBe('idle')
        expect(newer.resolve).toHaveBeenCalledTimes(1)
      },
    )
  }
})
