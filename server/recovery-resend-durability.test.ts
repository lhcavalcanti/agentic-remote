import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'
import { buildApp } from './app.js'
import type { RemovedQueuedPrompt, SessionDetail } from '../shared/contracts.js'
import type { SessionService } from './session-service.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...fs,
    writeFile: vi.fn(fs.writeFile),
    rename: vi.fn(fs.rename),
  }
})

const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const directories: string[] = []
const services: AgentService[] = []
const runtimes: Awaited<ReturnType<typeof buildApp>>[] = []
const gates: (() => void)[] = []
const sessionId = 'recovery-session'
const originalToken = '2026-09-04T00:00:00.000Z'
const storageError = Object.assign(new Error('Recovery storage refused the write'), { code: 'EACCES' })
type SendKind = 'message' | 'command'

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', tmpdir())
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(async () => {
  gates.splice(0).forEach((release) => release())
  await Promise.allSettled(runtimes.splice(0).map(async (runtime) => {
    runtime.manager?.stop()
    const closing = runtime.app.close()
    for (const socket of runtime.app.websocketServer.clients) socket.terminate()
    runtime.app.server.closeAllConnections()
    await closing
  }))
  await Promise.allSettled(services.splice(0).map((service) => service.stop()))
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ))
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

async function fixture(kind: SendKind = 'message') {
  const directory = await mkdtemp(path.join(tmpdir(), 'recovery-resend-'))
  directories.push(directory)
  const stateDirectory = path.join(directory, 'state')
  const statePath = path.join(stateDirectory, 'state.json')
  const original = kind === 'message' ? 'Recovered prompt' : '/usage original'
  const submitted = kind === 'message' ? 'Edited recovered prompt' : '/usage edited'
  let eventVersion: string | undefined
  const pastes: string[] = []
  const terminal = {
    has: vi.fn(async () => true),
    send: vi.fn(async (_id: string, content: string) => {
      pastes.push(content)
      return true
    }),
    cancel: vi.fn(async () => true),
  }
  const catalog: CopilotSessionLike = {
    sessionId: 'command-catalog',
    on: () => () => {},
    sendAndWait: async () => { throw new Error('No SDK delivery is needed') },
    getEvents: async () => [],
    abort: async () => {},
    disconnect: async () => {},
    rpc: {
      commands: {
        list: async () => ({
          commands: [{
            name: 'usage', description: 'Show usage', kind: 'builtin',
            allowDuringAgentExecution: true,
          }],
        }),
        invoke: async () => ({ kind: 'text', text: 'Usage' }),
        enqueue: async () => ({ queued: true as const, queueId: 'queued-command' }),
      },
      name: { set: async () => {} },
      mode: { set: async () => ({ status: 'applied', modelChanged: false }) },
      model: {
        getCurrent: async () => ({ modelId: 'fixture' }),
        switchTo: async ({ modelId }) => ({ modelId }),
      },
    },
  }
  const client: CopilotClientLike = {
    start: async () => {},
    stop: async () => [],
    createSession: async () => catalog,
    resumeSession: async () => { throw new Error('No SDK session is needed') },
    listSessions: async () => [],
    deleteSession: async () => {},
    rpc: {
      commands: { list: catalog.rpc.commands.list },
      models: { list: async () => ({ models: [] }) },
    },
  }
  const load = async (start = true) => {
    const service = new AgentService(
      new SessionStore(stateDirectory),
      client,
      async () => [{ id: sessionId, cwd: directory, title: 'Recovery', updatedAt: originalToken }],
      async () => undefined,
      async () => [],
      async () => eventVersion,
      terminal,
      async () => undefined,
      async () => undefined,
    )
    services.push(service)
    if (start) await service.start()
    else await service.store.initialize()
    return service
  }
  const service = await load()
  await service.store.update(sessionId, (session) => {
    session.failedPrompt = { content: original, failedAt: originalToken, uncertain: true }
  })
  const send = (target: AgentService, token = originalToken, enqueue = false, owner = sessionId) =>
    kind === 'message'
      ? target.sendMessage(owner, submitted, enqueue, token)
      : target.executeCommand(owner, submitted, enqueue, token)
  let writesRefused = false
  let acknowledgementsRefused = false
  let acknowledgementAttempts = 0
  vi.mocked(writeFile).mockImplementation(async (...args) => {
    if (args[0] === `${statePath}.tmp`) {
      if (writesRefused) throw storageError
      if (acknowledgementsRefused && !Object.values(JSON.parse(String(args[1])).sessions)
        .some((session) => Boolean((session as { failedPrompt?: unknown }).failedPrompt))) {
        acknowledgementAttempts += 1
        throw storageError
      }
    }
    return disk.writeFile(...args)
  })
  return {
    service, terminal, pastes, original, submitted, load, send, statePath, directory, client, catalog,
    refuseWrites: (refused = true) => { writesRefused = refused },
    refuseAcknowledgements: (refused = true) => { acknowledgementsRefused = refused },
    acknowledgementAttempts: () => acknowledgementAttempts,
    withEvents: () => { eventVersion = 'native-events' },
    persisted: async () => JSON.parse(await readFile(statePath, 'utf8')),
  }
}

function gate() {
  let opened = () => {}
  let release = () => {}
  const started = new Promise<void>((resolve) => { opened = resolve })
  const pending = new Promise<void>((resolve) => { release = resolve })
  gates.push(release)
  return { started, pending, opened, release }
}

async function prepareDecision(
  context: Awaited<ReturnType<typeof fixture>>,
  service: AgentService,
  token: string,
  owner = sessionId,
) {
  const pastes = context.pastes.length
  await expect(context.send(service, token, false, owner)).rejects.toMatchObject({
    statusCode: 409, submission: { sessionId: owner, accepted: false },
  })
  const next = service.store.get(owner)!.failedPrompt!.failedAt!
  expect(next).toMatch(/^resend:/)
  expect(next).not.toBe(token)
  expect(context.pastes).toHaveLength(pastes)
  return next
}

async function sdkFixture(kind: SendKind = 'message') {
  const context = await fixture(kind)
  context.terminal.has.mockResolvedValue(false)
  context.terminal.send.mockResolvedValue(false)
  context.service['externalSessionIds'].delete(sessionId)
  await context.service.store.setBackend(sessionId, 'sdk')
  const turn = gate()
  const calls: string[] = []
  const generated = 'Generated from the edited recovery command'
  const listeners = new Set<(event: SessionEvent) => void>()
  let turnFinished = false
  const emitIdle = () => {
    for (const listener of listeners) {
      listener({
        id: randomUUID(), type: 'session.idle', data: {},
        timestamp: new Date().toISOString(), ephemeral: true, parentId: null,
      } as SessionEvent)
    }
  }
  const finishTurn = () => {
    turnFinished = true
    turn.release()
    queueMicrotask(emitIdle)
  }
  const sdk: CopilotSessionLike = {
    ...context.catalog,
    sessionId,
    send: vi.fn(async ({ prompt }) => {
      calls.push(prompt)
      if (turnFinished) queueMicrotask(emitIdle)
      return randomUUID()
    }),
    on: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    sendAndWait: vi.fn(async (content) => {
      calls.push(content)
      await turn.pending
      return undefined
    }),
    disconnect: vi.fn(async () => { finishTurn() }),
    rpc: {
      ...context.catalog.rpc,
      commands: {
        ...context.catalog.rpc.commands,
        invoke: vi.fn(async () => ({
          kind: 'agent-prompt' as const, prompt: generated, displayPrompt: context.submitted,
        })),
      },
    },
  }
  context.client.resumeSession = vi.fn(async () => sdk)
  context.client.stop = vi.fn(async () => { finishTurn(); return [] })
  return { ...context, sdk, calls, generated, finishTurn }
}

describe('Durable recovery resend ownership', () => {
  it.each(['receipt', 'dispatch marker'] as const)(
    'holds FIFO after a startup %s write fails and its admission finishes',
    async (failure) => {
      const context = await fixture()
      context.withEvents()
      let ownsStartup = true
      Object.assign(context.terminal, {
        ownsStartupPrompt: () => ownsStartup,
        resolveStartupPrompt: async () => { ownsStartup = false; return true },
        capture: async () => '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands',
        inputReady: async () => true,
      })
      await context.service.store.enqueuePrompt(sessionId, {
        id: 'follower', content: 'Must wait for the accepted recovery', createdAt: originalToken,
      })
      const method = failure === 'receipt' ? 'acceptRecoveryResend' : 'markTerminalPromptDispatched'
      vi.spyOn(context.service.store, method).mockRejectedValueOnce(storageError)

      await expect(context.send(context.service)).rejects.toMatchObject({
        submission: { accepted: true },
      })
      expect(context.service['terminalAdmissionOperations'].size).toBe(0)
      await vi.waitFor(() => expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined())
      await context.service.refreshTranscripts()
      await context.service['drainTerminalQueue'](sessionId)
      await context.service.refreshTranscripts()

      expect(context.pastes).toEqual([context.submitted])
      expect(context.service.store.queueDispatchAt(sessionId)).toBeDefined()
      expect(context.service.store.get(sessionId)?.status).toBe('running')
      expect(context.service.store.get(sessionId)?.queuedPrompts?.map((prompt) => prompt.id))
        .toEqual(['follower'])
    },
  )

  it('integration: joins confirmed delivery and token acknowledgement before provider teardown', async () => {
    const context = await fixture()
    const held = gate()
    const phases: string[] = []
    let recoveryAtProviderStop: unknown
    context.terminal.send.mockImplementationOnce(async (_id, content) => {
      context.pastes.push(content)
      held.opened()
      await held.pending
      phases.push('confirmed')
      return true
    })
    context.client.stop = async () => {
      recoveryAtProviderStop = (await context.persisted()).sessions[sessionId].failedPrompt
      phases.push('provider-stopped')
      return []
    }
    const sending = context.send(context.service).finally(() => { phases.push('send-settled') })
    await held.started
    const stopping = context.service.stop()
    held.release()
    await Promise.all([sending, stopping])
    expect(context.pastes).toEqual([context.submitted])
    expect.soft(recoveryAtProviderStop).toBeUndefined()
    expect.soft(phases.indexOf('confirmed')).toBeLessThan(phases.indexOf('provider-stopped'))
    expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
  })

  it.each([
    ['message', false, false], ['command', false, false],
    ['message', true, false], ['command', true, false],
    ['message', false, true], ['command', false, true],
    ['message', true, true], ['command', true, true],
  ] as const)('returns the fresh recovery token over real %s HTTP routing (paired node=%s, accepted=%s)', async (kind, paired, accepted) => {
    const context = await fixture(kind)
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://localhost')
    const transcription = {
      async initialize() {}, async stop() {},
      async transcribe() { throw new Error('No transcription is needed') },
    }
    let node: Awaited<ReturnType<typeof buildApp>> | undefined
    let nodeUrl: string | undefined
    let hubService = context.service
    if (paired) {
      node = await buildApp({
        service: context.service, role: 'node', logger: false,
        dataDirectory: path.join(context.directory, 'node-http'),
        transcriptionService: transcription,
      })
      runtimes.push(node)
      nodeUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
      hubService = new AgentService(
        new SessionStore(path.join(context.directory, 'hub-store')), context.client,
        async () => [], async () => undefined, async () => [], async () => undefined,
        { has: async () => false, send: async () => false, cancel: async () => false },
        async () => undefined, async () => undefined,
      )
      services.push(hubService)
      await hubService.start()
    }
    const hub = await buildApp({
      service: hubService, role: 'hub', logger: false,
      dataDirectory: path.join(context.directory, 'hub-http'),
      transcriptionService: transcription,
    })
    runtimes.push(hub)
    const computerId = node && nodeUrl
      ? (await hub.manager!.registerComputer({ baseUrl: nodeUrl, token: node.identity.token })).id
      : hub.identity.info.id
    if (accepted) {
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        context.refuseWrites()
        return true
      })
    } else {
      context.terminal.send.mockRejectedValueOnce(Object.assign(new Error('Native receipt was not confirmed'), {
        statusCode: 409, uncertainDelivery: true,
      }))
    }
    const result = await hub.app.inject({
      method: 'POST',
      url: `/api/computers/${computerId}/sessions/${sessionId}/${kind === 'message' ? 'messages' : 'commands'}`,
      headers: { host: 'localhost' },
      payload: {
        [kind === 'message' ? 'content' : 'command']: context.submitted,
        acknowledgesFailure: originalToken,
      },
    })
    expect(result.statusCode).toBe(409)
    const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt
    expect(token).not.toBe(originalToken)
    expect(result.json()).toMatchObject({
      error: accepted ? expect.stringContaining('accepted') : 'Native receipt was not confirmed',
      submission: { sessionId, failedAt: token, accepted },
    })
    expect(context.pastes).toEqual(accepted ? [context.submitted] : [])
    if (!accepted) {
      const prepared = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${computerId}/sessions/${sessionId}/${kind === 'message' ? 'messages' : 'commands'}`,
        headers: { host: 'localhost' },
        payload: {
          [kind === 'message' ? 'content' : 'command']: context.submitted,
          acknowledgesFailure: token,
        },
      })
      expect(prepared.statusCode).toBe(409)
      expect(prepared.json().submission).toMatchObject({ sessionId, accepted: false })
      expect(prepared.json().submission.failedAt).not.toBe(token)
      expect(context.pastes).toEqual([])
      const decided = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${computerId}/sessions/${sessionId}/${kind === 'message' ? 'messages' : 'commands'}`,
        headers: { host: 'localhost' },
        payload: {
          [kind === 'message' ? 'content' : 'command']: context.submitted,
          acknowledgesFailure: prepared.json().submission.failedAt,
        },
      })
      expect(decided.statusCode).toBe(kind === 'command' ? 200 : 202)
      expect(context.pastes).toEqual([context.submitted])
    }
  })

  it('names the replacement owner in a confirmed-delivery receipt after clear', async () => {
    const context = await fixture()
    const replacementId = 'after-clear'
    let token = ''
    context.terminal.send.mockImplementationOnce(async (_id, content) => {
      context.pastes.push(content)
      token = context.service.store.get(sessionId)!.failedPrompt!.failedAt
      await context.service.store.replaceWithClearedSession(sessionId, replacementId)
      return true
    })
    await expect(context.send(context.service)).rejects.toMatchObject({
      statusCode: 409,
      submission: { sessionId: replacementId, accepted: true, failedAt: expect.stringMatching(/^resend:/) },
    })
    expect(context.service.store.get(sessionId)).toBeUndefined()
    expect(context.service.store.get(replacementId)?.failedPrompt).toBeUndefined()
    expect(context.pastes).toEqual([context.submitted])
    await expect(context.service.sendMessage(replacementId, context.submitted, false, token))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(context.pastes).toEqual([context.submitted])
  })

  it.each(['message', 'command'] as const)(
    'acknowledges only, without replay, after confirmed %s delivery and a later write failure',
    async (kind) => {
      const context = await fixture(kind)
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        context.refuseWrites()
        return true
      })
      await expect(context.send(context.service)).rejects.toThrow()
      const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt
      expect(context.pastes).toEqual([context.submitted])
      expect(token).not.toBe(originalToken)
      context.refuseWrites(false)
      let retryError: unknown
      try {
        await context.send(context.service, token)
      } catch (error) {
        retryError = error
      }
      expect.soft(context.pastes).toEqual([context.submitted])
      expect.soft(retryError).toMatchObject({ statusCode: 409 })
      await vi.waitFor(() => expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined())
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'keeps confirmed %s recovery locked through failed acknowledgement and clear replacement',
    async (kind) => {
      const context = await fixture(kind)
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        context.refuseWrites()
        return true
      })
      await expect(context.send(context.service)).rejects.toMatchObject({
        statusCode: 409, submission: { sessionId, accepted: true },
      })
      const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt
      await expect(context.send(context.service, token)).rejects.toMatchObject({ statusCode: 409 })
      await expect(kind === 'message'
        ? context.service.sendMessage(sessionId, context.submitted)
        : context.service.executeCommand(sessionId, context.submitted))
        .rejects.toMatchObject({ statusCode: 409 })
      expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
      expect((await context.service.openSession(sessionId)).failedPrompt).toBeUndefined()
      expect(context.service.listSessions().find((session) => session.id === sessionId)?.failedPrompt).toBeUndefined()
      expect(context.pastes).toEqual([context.submitted])

      context.refuseWrites(false)
      context.refuseAcknowledgements()
      await context.service.store.replaceWithClearedSession(sessionId, 'replacement')
      await expect(kind === 'message'
        ? context.service.sendMessage('replacement', context.submitted, false, token)
        : context.service.executeCommand('replacement', context.submitted, false, token))
        .rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toEqual([context.submitted])
      context.refuseAcknowledgements(false)
      await vi.waitFor(() => expect(context.service.store.get('replacement')?.failedPrompt).toBeUndefined())
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it('does not let an independent failed send erase another request delivery boundary', async () => {
    const context = await fixture()
    const first = context.send(context.service)
    const firstFailure = expect(first).rejects.toMatchObject({ submission: { accepted: true } })
    await vi.waitFor(() => expect(context.service.store.queueDispatchAt(sessionId)).toBeDefined())
    const refusal = Object.assign(new Error('Independent send was refused'), { statusCode: 409 })
    context.terminal.send.mockRejectedValueOnce(refusal)
    await expect(context.service.sendMessage(sessionId, 'Independent text')).rejects.toBe(refusal)
    context.refuseWrites()
    await firstFailure
    const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt
    context.refuseWrites(false)
    await expect(context.send(context.service, token)).rejects.toMatchObject({ statusCode: 409 })
    await vi.waitFor(() => expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined())
    expect(context.pastes).toEqual([context.submitted])
  })

  it('acknowledges a confirmed command when later feedback fails without re-executing it', async () => {
    const context = await fixture('command')
    const feedbackFailure = new Error('Command feedback is unavailable')
    Object.assign(context.terminal, {
      capture: vi.fn(async () => '╻▄▄▄▄\n┃ \n╹▀▀▀▀')
        .mockRejectedValueOnce(feedbackFailure),
    })
    // The first capture precedes delivery; fail the subsequent feedback capture.
    const capture = (context.terminal as typeof context.terminal & { capture: ReturnType<typeof vi.fn> }).capture
    capture.mockReset().mockResolvedValueOnce('╻▄▄▄▄\n┃ \n╹▀▀▀▀').mockRejectedValue(feedbackFailure)
    await expect(context.send(context.service)).rejects.toMatchObject({
      statusCode: 409, cause: feedbackFailure, submission: { accepted: true },
    })
    expect(context.pastes).toEqual([context.submitted])
    expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined()
    await expect(context.send(context.service)).rejects.toMatchObject({ statusCode: 409 })
    expect(context.pastes).toEqual([context.submitted])
  })

  it('refuses anonymous recovery retries without consuming the current token', async () => {
    const context = await fixture()
    context.terminal.send.mockRejectedValueOnce(Object.assign(new Error('Check the native draft'), {
      statusCode: 409, uncertainDelivery: true,
    }))
    await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: false } })
    const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt
    await expect(context.service.sendMessage(sessionId, context.submitted)).rejects.toMatchObject({
      statusCode: 409, submission: { failedAt: token, accepted: false },
    })
    expect(context.service.store.get(sessionId)?.failedPrompt?.failedAt).toBe(token)
    expect(context.pastes).toEqual([])
    const decision = await prepareDecision(context, context.service, token)
    await context.send(context.service, decision)
    expect(context.pastes).toEqual([context.submitted])
  })

  it('does not treat an explicitly empty recovery token as an independent message', async () => {
    const context = await fixture()
    await expect(context.send(context.service, '')).rejects.toMatchObject({ statusCode: 409 })
    expect(context.pastes).toEqual([])
    expect(context.service.store.get(sessionId)?.failedPrompt?.failedAt).toBe(originalToken)
  })

  it.each(['', '/', 'not a slash command'])(
    'keeps the original recovery usable when the command is malformed: %j',
    async (command) => {
      const context = await fixture('command')
      const before = (await context.persisted()).sessions[sessionId].failedPrompt
      await expect(context.service.executeCommand(sessionId, command, false, originalToken)).rejects.toThrow('Slash command')
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toEqual(before)
      expect(context.pastes).toEqual([])
      await context.send(context.service)
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'does not paste a recovered %s if its pre-delivery claim cannot commit',
    async (kind) => {
      const context = await fixture(kind)
      context.refuseWrites()
      await expect(context.send(context.service)).rejects.toBe(storageError)
      expect(context.pastes).toEqual([])
      expect((await context.persisted()).sessions[sessionId].failedPrompt.failedAt)
        .toBe(originalToken)
    },
  )

  it.each(['message', 'command'] as const)(
    'rejects the same original %s token after lost receipt, refused persistence, native submission and restart',
    async (kind) => {
      const context = await fixture(kind)
      const uncertain = Object.assign(new Error('The native paste receipt was lost'), {
        statusCode: 409, uncertainDelivery: true,
      })
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        // Refusal starts only after the pre-delivery claim had its chance to commit.
        context.refuseWrites()
        throw uncertain
      })
      await expect(context.send(context.service)).rejects.toMatchObject({
        cause: uncertain, statusCode: 409, submission: { sessionId, accepted: false },
      })
      expect(context.pastes).toEqual([context.submitted])
      await expect(context.send(context.service)).rejects.toMatchObject({ statusCode: 409 })
      const durableAttempt = (await context.persisted()).sessions[sessionId].failedPrompt
      await Promise.allSettled([context.service.stop()])
      // The user submitted the already-pasted native draft. Its empty composer
      // can no longer protect a restarted service from a stale browser's token.
      context.refuseWrites(false)
      const reloaded = await context.load()
      let staleError: unknown
      try {
        await context.send(reloaded)
      } catch (error) {
        staleError = error
      }
      expect.soft(context.pastes).toEqual([context.submitted])
      expect.soft(staleError).toMatchObject({ statusCode: 409 })
      expect.soft(durableAttempt).toMatchObject({ content: context.submitted, uncertain: true })
      expect(durableAttempt.failedAt).not.toBe(originalToken)

      const decision = await prepareDecision(context, reloaded, durableAttempt.failedAt)
      await context.send(reloaded, decision)
      expect(context.pastes).toEqual([context.submitted, context.submitted])
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
      await expect(context.send(reloaded, durableAttempt.failedAt)).rejects.toMatchObject({ statusCode: 409 })
    },
  )

  it.each(['message', 'command'] as const)(
    'delivers nothing if the %s claim rename is refused, then permits the still-unused token',
    async (kind) => {
      const context = await fixture(kind)
      vi.mocked(rename).mockRejectedValueOnce(storageError)
      await expect(context.send(context.service)).rejects.toBe(storageError)
      expect(context.pastes).toEqual([])
      expect((await context.persisted()).sessions[sessionId].failedPrompt.failedAt).toBe(originalToken)
      await context.send(context.service)
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'serializes competing original %s tokens behind the durable claim',
    async (kind) => {
      const context = await fixture(kind)
      const held = gate()
      vi.mocked(rename).mockImplementationOnce(async (...args) => {
        held.opened()
        await held.pending
        return disk.rename(...args)
      })
      const first = context.send(context.service)
      await held.started
      const second = kind === 'message'
        ? context.service.sendMessage(sessionId, 'Another edited draft', false, originalToken)
        : context.service.executeCommand(sessionId, '/usage another edit', false, originalToken)
      const results = Promise.allSettled([first, second])
      expect(context.pastes).toEqual([])
      expect(context.service.store.get(sessionId)?.failedPrompt?.failedAt).toBe(originalToken)
      expect((await context.persisted()).sessions[sessionId].failedPrompt.failedAt).toBe(originalToken)
      held.release()
      const settled = await results
      expect(settled.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
      expect(settled.filter((result) => result.status === 'rejected')).toHaveLength(1)
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'does not admit the replacement %s token while its dispatch is still in flight',
    async (kind) => {
      const context = await fixture(kind)
      const held = gate()
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        held.opened()
        await held.pending
        return true
      })
      const first = context.send(context.service)
      await held.started
      const current = context.service.store.get(sessionId)!.failedPrompt!
      expect(current).toMatchObject({ content: context.submitted, uncertain: true })
      expect(current.failedAt).not.toBe(originalToken)
      expect(current.failedAt).toMatch(/^resend:[0-9a-f-]{36}$/)
      await expect(context.send(context.service, current.failedAt)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toHaveLength(1)
      held.release()
      await first
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
    },
  )

  it.each(['message', 'command'] as const)(
    'permits an explicit new %s decision after a definitive pre-delivery refusal',
    async (kind) => {
      const context = await fixture(kind)
      const refusal = Object.assign(new Error('Close the terminal overlay before sending'), { statusCode: 409 })
      context.terminal.send.mockRejectedValueOnce(refusal)
      await expect(context.send(context.service)).rejects.toMatchObject({
        cause: refusal, statusCode: 409, submission: { sessionId, accepted: false },
      })
      expect(context.pastes).toEqual([])
      const retry = context.service.store.get(sessionId)!.failedPrompt!
      expect(retry).toMatchObject({ content: context.submitted, uncertain: true })
      expect(retry.failedAt).not.toBe(originalToken)
      await context.service.stop()
      const reloaded = await context.load()
      await expect(context.send(reloaded)).rejects.toMatchObject({ statusCode: 409 })
      const decision = await prepareDecision(context, reloaded, retry.failedAt!)
      await context.send(reloaded, decision)
      expect(context.pastes).toEqual([context.submitted])
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
    },
  )

  it.each([
    ['message', false], ['command', false],
    ['message', true], ['command', true],
  ] as const)(
    'does not replay an accepted %s when acknowledgement persistence fails (restart=%s)',
    async (kind, restart) => {
      const context = await fixture(kind)
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        context.refuseAcknowledgements()
        return true
      })
      await expect(context.send(context.service)).rejects.toMatchObject({
        statusCode: 409, uncertainDelivery: true, cause: storageError,
      })
      await vi.waitFor(() => expect(context.acknowledgementAttempts()).toBeGreaterThan(1))
      const pending = (await context.persisted()).sessions[sessionId].failedPrompt
      expect(pending).toMatchObject({ content: context.submitted, uncertain: true })
      expect(pending.failedAt).not.toBe(originalToken)
      await expect(context.send(context.service)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toEqual([context.submitted])
      if (restart) {
        await Promise.allSettled([context.service.stop()])
        context.refuseAcknowledgements(false)
        const reloaded = await context.load()
        await expect(context.send(reloaded)).rejects.toMatchObject({ statusCode: 409 })
        await vi.waitFor(() => expect(reloaded.store.get(sessionId)?.failedPrompt).toBeUndefined())
        await expect(context.send(reloaded, pending.failedAt)).rejects.toMatchObject({ statusCode: 409 })
        expect(context.pastes).toEqual([context.submitted])
      } else {
        context.refuseAcknowledgements(false)
        await vi.waitFor(() => expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined())
        expect(context.pastes).toEqual([context.submitted])
      }
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
    },
  )

  it.each(['message', 'command'] as const)(
    'consumes a queued %s token in the same durable write that owns the queued resend',
    async (kind) => {
      const context = await fixture(kind)
      context.withEvents()
      await context.service.store.update(sessionId, (session) => { session.status = 'running' })
      await context.send(context.service, originalToken, true)
      const saved = (await context.persisted()).sessions[sessionId]
      expect(saved.failedPrompt).toBeUndefined()
      expect(saved.queuedPrompts).toMatchObject([{
        content: context.submitted,
        ...(kind === 'command' ? { command: true } : {}),
      }])
      expect(context.pastes).toEqual([])
      await context.service.stop()
      // Observe durable ownership without asking a new runtime to drain it.
      const reloaded = await context.load(false)
      await expect(context.send(reloaded)).rejects.toMatchObject({ statusCode: 409 })
      expect(reloaded.store.get(sessionId)?.queuedPrompts).toHaveLength(1)
      expect(context.pastes).toEqual([])
    },
  )

  it('does not let a delayed acknowledgement clear a newer recovery decision', async () => {
    const context = await fixture()
    const first = context.service.store.get(sessionId)!.failedPrompt!
    const next = '2026-09-04T00:00:01.000Z'
    await context.service.store.claimFailedPrompt(sessionId, first, context.submitted, next)
    await context.service.store.clearFailedPrompt(sessionId, originalToken)
    expect(context.service.store.get(sessionId)?.failedPrompt).toMatchObject({
      content: context.submitted, failedAt: next, uncertain: true,
    })
    expect((await context.persisted()).sessions[sessionId].failedPrompt.failedAt).toBe(next)
  })

  it.each(['message', 'command'] as const)(
    'settles an independent newer %s recovery after an older acknowledgement retry becomes stale',
    async (kind) => {
      const context = await fixture(kind)
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ uncertainDelivery: true })
      const first = context.service.store.get(sessionId)!.failedPrompt!.failedAt
      await expect(context.send(context.service, first)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toEqual([context.submitted])
      const newerToken = 'independent-newer-failure'
      const newerContent = kind === 'message' ? 'A separate newer recovery' : '/usage separate-recovery'
      await context.service.store.update(sessionId, (session) => {
        session.failedPrompt = { content: newerContent, failedAt: newerToken, uncertain: true }
      })
      await expect(kind === 'message'
        ? context.service.sendMessage(sessionId, newerContent, false, newerToken)
        : context.service.executeCommand(sessionId, newerContent, false, newerToken))
        .rejects.toMatchObject({ uncertainDelivery: true, submission: { accepted: true } })
      const second = context.service.store.get(sessionId)!.failedPrompt!.failedAt
      expect(second).not.toBe(first)
      expect(context.pastes).toEqual([context.submitted, newerContent])
      context.refuseAcknowledgements(false)
      await vi.waitFor(() => expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined())
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
      expect(context.pastes).toEqual([context.submitted, newerContent])
    },
  )

  it('does not reuse a consumed decision when the clock is unchanged across restart', async () => {
    const context = await fixture()
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse(originalToken))
    context.terminal.send.mockRejectedValue(new Error('No paste was attempted'))
    await expect(context.send(context.service)).rejects.toMatchObject({ cause: { message: 'No paste was attempted' } })
    const first = context.service.store.get(sessionId)!.failedPrompt!.failedAt
    await context.service.stop()
    const reloaded = await context.load()
    const decision = await prepareDecision(context, reloaded, first)
    await expect(context.send(reloaded, decision)).rejects.toMatchObject({ cause: { message: 'No paste was attempted' } })
    const second = reloaded.store.get(sessionId)!.failedPrompt!.failedAt
    expect(new Set([originalToken, first, decision, second]).size).toBe(4)
    await expect(context.send(reloaded)).rejects.toMatchObject({ statusCode: 409 })
    await expect(context.send(reloaded, first)).rejects.toMatchObject({ statusCode: 409 })
    expect(context.pastes).toEqual([])
  })

  it('keeps the consumed token stale across clear replacement and restart', async () => {
    const context = await fixture()
    context.terminal.send.mockRejectedValueOnce(Object.assign(new Error('Lost native receipt'), {
      uncertainDelivery: true,
    }))
    await expect(context.send(context.service)).rejects.toMatchObject({ cause: { message: 'Lost native receipt' } })
    const retry = context.service.store.get(sessionId)!.failedPrompt!
    await context.service.store.replaceWithClearedSession(sessionId, 'replacement')
    await context.service.stop()
    const reloaded = await context.load()
    expect(reloaded.store.get(sessionId)).toBeUndefined()
    expect(reloaded.store.get('replacement')?.failedPrompt).toEqual(retry)
    await expect(reloaded.sendMessage('replacement', context.submitted, false, originalToken))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(context.pastes).toEqual([])
    const decision = await prepareDecision(context, reloaded, retry.failedAt!, 'replacement')
    await reloaded.sendMessage('replacement', context.submitted, false, decision)
    expect(context.pastes).toEqual([context.submitted])
    expect(reloaded.store.get('replacement')?.failedPrompt).toBeUndefined()
  })

  it('claims an unstamped legacy recovery before delivering its unchanged text', async () => {
    const context = await fixture()
    await context.service.stop()
    const saved = await context.persisted()
    delete saved.sessions[sessionId].failedPrompt.failedAt
    await disk.writeFile(context.statePath, JSON.stringify(saved))
    const reloaded = await context.load()
    context.terminal.send.mockImplementationOnce(async (_id, content) => {
      const claimed = (await context.persisted()).sessions[sessionId].failedPrompt
      expect(claimed).toMatchObject({ content: context.original, uncertain: true })
      expect(typeof claimed.failedAt).toBe('string')
      context.pastes.push(content)
      return true
    })
    await reloaded.sendMessage(sessionId, context.original)
    expect(context.pastes).toEqual([context.original])
    expect(reloaded.store.get(sessionId)?.failedPrompt).toBeUndefined()
  })
})

describe('Recovery and admission integration', () => {
  it.each(['message', 'command'] as const)(
    'Supervisor: resumes only acknowledgement for accepted %s recovery after restart',
    async (kind) => {
      const context = await fixture(kind)
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      const acceptedToken = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
      expect((await context.persisted()).sessions[sessionId].recoveryResend).toEqual({
        failedAt: acceptedToken, content: context.submitted, accepted: true,
      })
      expect(context.service.getSession(sessionId)).not.toHaveProperty('recoveryResend')
      const [shutdown] = await Promise.allSettled([context.service.stop()])
      if (shutdown.status === 'rejected') expect(shutdown.reason).toBe(storageError)
      context.refuseAcknowledgements(false)
      const restarted = await context.load()
      await expect(context.send(restarted, acceptedToken)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toEqual([context.submitted])
      await vi.waitFor(() => expect(restarted.store.get(sessionId)?.failedPrompt).toBeUndefined())
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'keeps a consumed %s attempt non-delivering across restart even if receipt persistence also failed',
    async (kind) => {
      const context = await fixture(kind)
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        context.refuseWrites()
        return true
      })
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      const attempt = (await context.persisted()).sessions[sessionId].recoveryResend
      expect(attempt).toMatchObject({ content: context.submitted, accepted: false })
      const [shutdown] = await Promise.allSettled([context.service.stop()])
      if (shutdown.status === 'rejected') expect(shutdown.reason).toBe(storageError)
      context.refuseWrites(false)
      const restarted = await context.load()
      const decision = await prepareDecision(context, restarted, attempt.failedAt)
      await expect(context.send(restarted, attempt.failedAt)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toEqual([context.submitted])
      const next = kind === 'message' ? 'A separate, explicitly chosen message' : '/usage separate-decision'
      await (kind === 'message'
        ? restarted.sendMessage(sessionId, next, false, decision)
        : restarted.executeCommand(sessionId, next, false, decision))
      expect(context.pastes).toEqual([context.submitted, next])
      expect(context.pastes.filter((text) => text === context.submitted)).toHaveLength(1)
      expect((await context.persisted()).sessions[sessionId].recoveryResend).toBeUndefined()
    },
  )

  it('keeps accepted acknowledgement ownership through repeated restarts during an outage', async () => {
    const context = await fixture('command')
    context.refuseAcknowledgements()
    await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
    const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
    let service = context.service
    for (let restart = 0; restart < 2; restart += 1) {
      const [shutdown] = await Promise.allSettled([service.stop()])
      if (shutdown.status === 'rejected') expect(shutdown.reason).toBe(storageError)
      service = await context.load()
      await expect(context.send(service, token)).rejects.toMatchObject({ statusCode: 409 })
      expect(service.getSession(sessionId)?.failedPrompt).toBeUndefined()
      expect((await context.persisted()).sessions[sessionId].recoveryResend.accepted).toBe(true)
      expect(context.pastes).toEqual([context.submitted])
    }
    context.refuseAcknowledgements(false)
    await vi.waitFor(() => expect(service.store.get(sessionId)?.failedPrompt).toBeUndefined())
    expect(context.pastes).toEqual([context.submitted])
  })

  it.each(['replacement', 'newer decision'] as const)(
    'restores only the matching accepted acknowledgement after %s and restart',
    async (change) => {
      const context = await fixture('command')
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
      await context.service.store.replaceWithClearedSession(sessionId, 'replacement')
      if (change === 'newer decision') {
        await context.service.store.update('replacement', (session) => {
          session.failedPrompt = { content: 'Newer work', failedAt: 'newer', uncertain: true }
        })
      }
      const [shutdown] = await Promise.allSettled([context.service.stop()])
      if (shutdown.status === 'rejected') expect(shutdown.reason).toBe(storageError)
      context.refuseAcknowledgements(false)
      const restarted = await context.load()
      await expect(context.send(restarted, token, false, 'replacement')).rejects.toMatchObject({ statusCode: 409 })
      if (change === 'replacement') {
        await vi.waitFor(() => expect(restarted.store.get('replacement')?.failedPrompt).toBeUndefined())
      } else {
        expect(restarted.store.get('replacement')?.failedPrompt).toEqual({
          content: 'Newer work', failedAt: 'newer', uncertain: true,
        })
      }
      expect(restarted.store.get(sessionId)).toBeUndefined()
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['accepted', 'content', 'token'] as const)(
    'refuses malformed persisted recovery receipt %s without dropping stored state',
    async (field) => {
      const context = await fixture()
      await context.service.stop()
      const saved = await context.persisted()
      saved.sessions[sessionId].recoveryResend = {
        failedAt: originalToken, content: context.original, accepted: false,
        ...(field === 'accepted' ? { accepted: 'yes' } : field === 'content' ? { content: null } : { failedAt: '' }),
      }
      await disk.writeFile(context.statePath, JSON.stringify(saved))
      await expect(context.load(false)).rejects.toThrow('Invalid recovery resend metadata')
      await services.at(-1)!.stop()
      expect(await context.persisted()).toEqual(saved)
    },
  )

  it('Supervisor: rejects a direct command behind FIFO after startup restores idle status', async () => {
    const context = await fixture('command')
    await context.service.store.clearFailedPrompt(sessionId, originalToken)
    await context.service.store.enqueuePrompt(sessionId, {
      id: 'older', content: 'Older queued prompt', createdAt: originalToken,
    })
    await context.service.store.update(sessionId, (session) => { session.status = 'running' })
    Object.assign(context.terminal, {
      ownsStartupPrompt: () => true,
      capture: async () => '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands',
      inputReady: async () => true,
      resolveStartupPrompt: async () => true,
    })
    await expect(context.service.executeCommand(sessionId, '/usage direct'))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(context.pastes).toEqual([])
    expect(context.service.store.get(sessionId)?.queuedPrompts?.map((prompt) => prompt.id)).toEqual(['older'])
  })

  it('allows only the matching recovery command ahead of the FIFO it was holding', async () => {
    const context = await fixture('command')
    await context.service.store.enqueuePrompt(sessionId, {
      id: 'older', content: 'Older queued prompt', createdAt: originalToken,
    })
    await context.service.store.update(sessionId, (session) => { session.status = 'running' })
    const ready = '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands'
    Object.assign(context.terminal, {
      ownsStartupPrompt: () => true,
      capture: async () => context.pastes.length ? `${ready}\nWorking - esc interrupt` : ready,
      inputReady: async () => true,
      resolveStartupPrompt: async () => true,
    })
    await context.send(context.service)
    expect(context.pastes).toEqual([context.submitted])
    expect(context.service.store.get(sessionId)?.queuedPrompts?.map((prompt) => prompt.id)).toEqual(['older'])
    expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined()
  })

  it('Supervisor: rejects an immediate startup follower while the old composer remains visible', async () => {
    const context = await fixture()
    await context.service.store.clearFailedPrompt(sessionId, originalToken)
    let ownsStartup = true
    Object.assign(context.terminal, {
      ownsStartupPrompt: () => ownsStartup,
      capture: async () => '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands',
      inputReady: async () => true,
      resolveStartupPrompt: async () => { ownsStartup = false; return true },
    })
    const held = gate()
    context.terminal.send.mockImplementationOnce(async (_id, content) => {
      context.pastes.push(content)
      held.opened()
      await held.pending
      return true
    })
    const first = context.service.sendMessage(sessionId, 'First startup send')
    await held.started
    const second = context.service.sendMessage(sessionId, 'Immediate follower')
    const results = Promise.allSettled([first, second])
    held.release()
    const [initial, follower] = await results
    expect(initial.status).toBe('fulfilled')
    expect(follower).toMatchObject({ status: 'rejected', reason: { statusCode: 409 } })
    expect(context.pastes).toEqual(['First startup send'])
  })

  it.each([
    ['message', 'command', false],
    ['command-turn', 'message', false],
    ['command-turn', 'command', false],
    ['command-unobserved', 'message', false],
    ['command-text', 'message', false],
    ['command-text', 'command', false],
    ['message', 'command', true],
    ['command-turn', 'message', true],
    ['command-turn', 'command', true],
  ] as const)(
    'keeps startup admission across %s → %s interleaving (enqueue=%s)',
    async (firstKind, nextKind, enqueue) => {
      const context = await fixture()
      await context.service.store.clearFailedPrompt(sessionId, originalToken)
      let ownsStartup = true
      let observedWorking = false
      let unreadableFeedback = 0
      const ready = '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands'
      Object.assign(context.terminal, {
        ownsStartupPrompt: () => ownsStartup,
        capture: async () => {
          if (firstKind === 'command-unobserved' && context.pastes.length === 1 && unreadableFeedback < 20) {
            unreadableFeedback += 1
            return undefined
          }
          if (firstKind === 'command-turn' && context.pastes.length === 1 && !observedWorking) {
            observedWorking = true
            return `${ready}\nWorking - esc interrupt`
          }
          return firstKind === 'command-text' && context.pastes.length
            ? `Command output ${context.pastes.length}\n${ready}`
            : ready
        },
        inputReady: async () => true,
        resolveStartupPrompt: async () => { ownsStartup = false; return true },
      })
      const held = gate()
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        held.opened()
        await held.pending
        return true
      })
      const firstContent = firstKind === 'message' ? 'First startup send' : '/usage first'
      const nextContent = nextKind === 'message' ? 'Following message' : '/usage following'
      const first = firstKind === 'message'
        ? context.service.sendMessage(sessionId, firstContent)
        : context.service.executeCommand(sessionId, firstContent)
      await held.started
      const admission = context.service['terminalAdmissionOperations'].get(sessionId)
      const next = nextKind === 'message'
        ? context.service.sendMessage(sessionId, nextContent, enqueue)
        : context.service.executeCommand(sessionId, nextContent, enqueue)
      const results = Promise.allSettled([first, next])
      await vi.waitFor(() => expect(context.service['terminalAdmissionOperations'].get(sessionId)).not.toBe(admission))
      held.release()
      const [initial, follower] = await results
      expect(initial.status).toBe('fulfilled')
      if (!enqueue && firstKind !== 'command-text') {
        expect.soft(follower).toMatchObject({ status: 'rejected', reason: { statusCode: 409 } })
        expect(context.pastes).toEqual([firstContent])
      } else {
        expect(follower.status).toBe('fulfilled')
        expect(context.pastes).toEqual([firstContent, nextContent])
        if (enqueue) {
          expect(context.terminal.send).toHaveBeenNthCalledWith(
            2, sessionId, nextContent, true,
            ...(nextKind === 'command' ? [{ allowDuringAgentExecution: true }] : []),
          )
        }
      }
    },
  )

  it('joins confirmed command feedback and acknowledgement before provider teardown', async () => {
    const context = await fixture('command')
    const held = gate()
    context.terminal.send.mockImplementationOnce(async (_id, content) => {
      context.pastes.push(content)
      held.opened()
      await held.pending
      return true
    })
    context.client.stop = vi.fn(async () => {
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
      return []
    })
    const sending = context.send(context.service)
    await held.started
    const stopping = context.service.stop()
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(context.client.stop).not.toHaveBeenCalled()
    held.release()
    await Promise.all([sending, stopping])
    expect(context.pastes).toEqual([context.submitted])
    expect(context.client.stop).toHaveBeenCalledOnce()
  })

  it.each(['message', 'command'] as const)(
    'retains honest %s uncertainty when shutdown overlaps confirmed delivery and a storage outage',
    async (kind) => {
      const context = await fixture(kind)
      const held = gate()
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        held.opened()
        await held.pending
        context.refuseWrites()
        return true
      })
      const sending = context.send(context.service)
      const rejected = expect(sending).rejects.toMatchObject({
        statusCode: 409, submission: { sessionId, accepted: true },
      })
      await held.started
      const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
      const stopping = context.service.stop()
      const refusedStop = expect(stopping).rejects.toBe(storageError)
      held.release()
      await Promise.all([rejected, refusedStop])
      expect(context.service['pendingAcknowledgements'].size).toBe(0)
      expect(context.service['acknowledgementTimers'].size).toBe(0)
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toEqual({
        content: context.submitted, failedAt: token, uncertain: true,
      })
      const writes = vi.mocked(writeFile).mock.calls.length
      await expect(context.service.store.update(sessionId, () => {})).rejects.toThrow('closed')
      await expect(context.send(context.service, token)).rejects.toMatchObject({ statusCode: 503 })
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect(vi.mocked(writeFile).mock.calls).toHaveLength(writes)
      context.refuseWrites(false)
      const restarted = await context.load()
      await expect(context.send(restarted)).rejects.toMatchObject({ statusCode: 409 })
      expect(restarted.store.get(sessionId)?.failedPrompt?.failedAt).toBe(token)
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'admits an accepted %s acknowledgement retry and joins it before closing the store',
    async (kind) => {
      const context = await fixture(kind)
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      await vi.waitFor(() => expect(context.service['acknowledgementTimers'].size).toBe(1))
      const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
      const held = gate()
      const clear = context.service.store.clearFailedPrompt.bind(context.service.store)
      vi.spyOn(context.service.store, 'clearFailedPrompt').mockImplementationOnce(async (...args) => {
        held.opened()
        await held.pending
        return clear(...args)
      })
      context.refuseAcknowledgements(false)
      await held.started
      let joined = false
      const admission = context.service['admissions'].wait(sessionId).then(() => { joined = true })
      context.client.stop = vi.fn(async () => {
        expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
        return []
      })
      const stopping = context.service.stop()
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect(joined).toBe(false)
      expect(context.client.stop).not.toHaveBeenCalled()
      held.release()
      await Promise.all([admission, stopping])
      expect(context.service['pendingAcknowledgements'].size).toBe(0)
      expect(context.service['acknowledgementTimers'].size).toBe(0)
      expect(context.pastes).toEqual([context.submitted])
      const restarted = await context.load()
      await expect(context.send(restarted, token)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['same owner', 'clear replacement', 'deleted owner'] as const)(
    'does not let a joined old acknowledgement erase a newer recovery for %s',
    async (change) => {
      const context = await fixture()
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      await vi.waitFor(() => expect(context.service['acknowledgementTimers'].size).toBe(1))
      const acceptedToken = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
      const held = gate()
      const clear = context.service.store.clearFailedPrompt.bind(context.service.store)
      vi.spyOn(context.service.store, 'clearFailedPrompt').mockImplementationOnce(async (...args) => {
        held.opened()
        await held.pending
        return clear(...args)
      })
      context.refuseAcknowledgements(false)
      await held.started
      const owner = change === 'clear replacement' ? 'new-owner' : sessionId
      if (change === 'clear replacement') {
        await context.service.store.replaceWithClearedSession(sessionId, owner)
      }
      if (change === 'deleted owner') {
        await context.service.store.remove(sessionId)
      } else {
        await context.service.store.update(owner, (session) => {
          session.failedPrompt = { content: 'A different attempt', failedAt: 'new-decision', uncertain: true }
        })
      }
      const stopping = context.service.stop()
      held.release()
      await stopping
      const persisted = (await context.persisted()).sessions
      if (change === 'deleted owner') expect(persisted[sessionId]).toBeUndefined()
      else {
        expect(persisted[owner].failedPrompt).toEqual({
          content: 'A different attempt', failedAt: 'new-decision', uncertain: true,
        })
        const restarted = await context.load(false)
        await expect(restarted.sendMessage(owner, context.submitted, false, acceptedToken))
          .rejects.toMatchObject({ statusCode: 409 })
      }
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'forwards the claimed token when a recovered SDK %s joins the reserved FIFO',
    async (kind) => {
      const context = await sdkFixture(kind)
      await context.service.store.enqueuePrompt(sessionId, {
        id: 'older', content: 'Older queued prompt', createdAt: originalToken,
      })
      const enqueue = vi.spyOn(context.service.store, 'enqueueAnsweringPrompt')
      await context.send(context.service)
      await vi.waitFor(() => expect(context.calls).toEqual(['Older queued prompt']))
      const forwarded = enqueue.mock.calls[0]?.[2]
      expect(forwarded).toMatch(/^resend:/)
      expect(forwarded).not.toBe(originalToken)
      const expected = kind === 'command' ? context.generated : context.submitted
      expect(context.service.store.get(sessionId)?.queuedPrompts?.map((prompt) => prompt.content))
        .toEqual([expected])
      expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
      await expect(context.send(context.service)).rejects.toMatchObject({ statusCode: 409 })
      context.finishTurn()
      await vi.waitFor(() => expect(context.calls).toEqual(['Older queued prompt', expected]))
      await vi.waitFor(() => expect(context.service.store.get(sessionId)?.status).toBe('idle'))
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
      expect(context.pastes).toEqual([])
    },
  )

  it.each(['message', 'command'] as const)(
    'keeps accepted recovery and canonical %s FIFO durable when a queued turn commits during stop',
    async (kind) => {
      const context = await sdkFixture(kind)
      await context.service.store.enqueuePrompt(sessionId, {
        id: 'older', content: 'Older queued prompt', createdAt: originalToken,
      })
      const held = gate()
      let holding = false
      vi.mocked(writeFile).mockImplementation(async (...args) => {
        if (args[0] === `${context.statePath}.tmp` && !holding &&
            JSON.parse(String(args[1])).sessions[sessionId]?.queuedDispatch?.prepared) {
          holding = true
          held.opened()
          await held.pending
        }
        return disk.writeFile(...args)
      })
      const enqueue = vi.spyOn(context.service.store, 'enqueueAnsweringPrompt')
      await context.send(context.service)
      await held.started
      const forwarded = enqueue.mock.calls[0]?.[2]
      expect(forwarded).toMatch(/^resend:/)
      const stopping = context.service.stop()
      held.release()
      await stopping
      expect(context.calls).toEqual([])
      const persisted = (await context.persisted()).sessions[sessionId]
      expect(persisted.queuedPrompts.map((prompt: { content: string }) => prompt.content)).toEqual([
        'Older queued prompt', kind === 'command' ? context.generated : context.submitted,
      ])
      expect(persisted.failedPrompt).toBeUndefined()
      expect(persisted.sdkQueueAdmission).toBeUndefined()
      const restarted = await context.load(false)
      await expect(context.send(restarted)).rejects.toMatchObject({ statusCode: 409 })
      await expect(context.send(restarted, forwarded)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.pastes).toEqual([])
    },
  )

  it('keeps the generated-command delivery boundary when its acknowledgement outlives the send', async () => {
    const context = await sdkFixture('command')
    context.refuseAcknowledgements()
    await expect(context.send(context.service)).rejects.toMatchObject({
      statusCode: 409, submission: { accepted: true },
    })
    expect(context.calls).toEqual([context.generated])
    const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
    await expect(context.send(context.service, token)).rejects.toMatchObject({ statusCode: 409 })
    await context.service.stop()
    expect(context.calls).toEqual([context.generated])
    context.refuseAcknowledgements(false)
    const restarted = await context.load(false)
    await expect(context.send(restarted)).rejects.toMatchObject({ statusCode: 409 })
    expect(restarted.store.get(sessionId)?.failedPrompt).toEqual({
      content: context.submitted, failedAt: token, uncertain: true,
    })
  })

  it.each(['acknowledgement', 'receipt'] as const)(
    'does not regenerate an accepted command after restart with refused %s persistence',
    async (phase) => {
      const context = await sdkFixture('command')
      if (phase === 'acknowledgement') context.refuseAcknowledgements()
      else {
        const deliver = context.sdk.sendAndWait.bind(context.sdk)
        context.sdk.sendAndWait = vi.fn((content: string, timeout?: number) => {
          context.refuseWrites()
          return deliver(content, timeout)
        })
      }
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
      expect(context.calls).toEqual([context.generated])
      const [shutdown] = await Promise.allSettled([context.service.stop()])
      if (shutdown.status === 'rejected') expect(shutdown.reason).toBe(storageError)
      context.refuseWrites(false)
      context.refuseAcknowledgements(false)
      const restarted = await context.load()
      await expect(context.send(restarted)).rejects.toMatchObject({ statusCode: 409 })
      await expect(context.send(restarted, token)).rejects.toMatchObject({ statusCode: 409 })
      expect(context.calls).toEqual([context.generated])
      expect(context.sdk.rpc.commands.invoke).toHaveBeenCalledOnce()
      if (phase === 'receipt') {
        expect(restarted.store.get(sessionId)?.failedPrompt).toMatchObject({
          content: context.submitted, uncertain: true,
        })
        expect(restarted.store.get(sessionId)?.failedPrompt?.failedAt).not.toBe(token)
      } else {
        await vi.waitFor(() => expect(restarted.store.get(sessionId)?.failedPrompt).toBeUndefined())
      }
    },
  )

  it.each(['message', 'command'] as const)(
    'wakes SDK FIFO once after a recovered %s acknowledgement outlives its provider turn',
    async (kind) => {
      const context = await sdkFixture(kind)
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      await context.service.store.enqueuePrompt(sessionId, {
        id: 'waiting', content: 'Waiting behind the accepted recovery', createdAt: originalToken,
      })
      context.finishTurn()
      await vi.waitFor(() => expect(context.service.store.get(sessionId)?.status).toBe('idle'))
      const first = kind === 'command' ? context.generated : context.submitted
      expect(context.calls).toEqual([first])
      context.refuseAcknowledgements(false)
      await vi.waitFor(() => expect(context.calls).toEqual([first, 'Waiting behind the accepted recovery']))
      await vi.waitFor(() => expect(context.service.store.get(sessionId)?.status).toBe('idle'))
      expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined()
      expect(context.service.store.get(sessionId)?.queuedCount).toBe(0)
      expect(context.service['sdkQueueWakeups'].size).toBe(0)
      expect(context.pastes).toEqual([])
    },
  )

  it.each([false, true])(
    'coalesces and tracks the native wake after accepted recovery settlement (stop=%s)',
    async (stop) => {
      const context = await fixture()
      context.withEvents()
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      await context.service.store.enqueuePrompt(sessionId, {
        id: 'waiting', content: 'Native FIFO after recovery', createdAt: originalToken,
      })
      await context.service.store.update(sessionId, (session) => { session.status = 'idle' })
      const held = gate()
      const capture = vi.fn(async () => {
        held.opened()
        await held.pending
        return '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands'
      })
      Object.assign(context.terminal, { capture })
      context.refuseAcknowledgements(false)
      await held.started
      context.service['wakeTerminalQueue'](sessionId)
      context.service['wakeTerminalQueue'](sessionId)
      context.service['wakeTerminalQueue'](sessionId)
      expect(context.service['terminalQueueWakeups'].size).toBe(1)
      let stopped = false
      const stopping = stop ? context.service.stop().then(() => { stopped = true }) : undefined
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect(stopped).toBe(false)
      held.release()
      if (stopping) await stopping
      else {
        await vi.waitFor(() => expect(context.service.store.get(sessionId)?.queuedCount).toBe(0))
        await vi.waitFor(() => expect(context.service['terminalQueueWakeups'].size).toBe(0))
      }
      expect(context.pastes).toEqual(stop ? [context.submitted] : [context.submitted, 'Native FIFO after recovery'])
      expect((await context.persisted()).sessions[sessionId].queuedCount).toBe(stop ? 1 : 0)
      expect(context.service['terminalQueueWakeups'].size).toBe(0)
      const captures = capture.mock.calls.length
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(capture).toHaveBeenCalledTimes(captures)
    },
  )

  it('does not let a recovery claim take ownership from a committed SDK queue admission', async () => {
    const context = await sdkFixture()
    await context.service.store.clearFailedPrompt(sessionId, originalToken)
    await context.service.store.enqueuePrompt(sessionId, {
      id: 'queued', content: 'Durable admitted text', createdAt: originalToken,
    })
    const { reservation } = await context.service.store.reserveQueuedPrompt(sessionId, () => true)
    await context.service.store.beginPrompt(sessionId, 'Durable admitted text', 'assistant', () => true, reservation)
    const saved = (await context.persisted()).sessions[sessionId]
    await expect(context.service.store.claimFailedPrompt(
      sessionId, saved.failedPrompt, 'Edited admission', 'resend:must-not-own',
    )).rejects.toMatchObject({ statusCode: 409 })
    expect((await context.persisted()).sessions[sessionId]).toEqual(saved)
    expect(context.calls).toEqual([])
    await context.service.stop()
    const restarted = await context.load(false)
    const recovery = restarted.store.get(sessionId)!.failedPrompt!
    expect(recovery).toMatchObject({ content: 'Durable admitted text', uncertain: true })
    await restarted.store.claimFailedPrompt(sessionId, recovery, 'Explicit new decision', 'resend:new-decision')
    expect(restarted.store.get(sessionId)?.failedPrompt?.content).toBe('Explicit new decision')
  })
})

describe('PR162 final root integration', () => {
  it.each([
    { kind: 'message', phase: 'receipt' },
    { kind: 'command', phase: 'receipt' },
    { kind: 'message', phase: 'acknowledgement' },
    { kind: 'command', phase: 'acknowledgement' },
  ] as const)('joins recovered $kind delivery before Clear despite refused $phase', async ({ kind, phase }) => {
    const context = await fixture(kind)
    context.withEvents()
    const held = gate()
    const reset = vi.fn(async (
      _id: string, _replacement: string, _cwd: string, _runtime: unknown,
      commit: () => Promise<void>,
    ) => { await commit(); return true })
    Object.assign(context.terminal, { reset })
    context.terminal.send.mockImplementationOnce(async (_id, content) => {
      context.pastes.push(content)
      held.opened()
      await held.pending
      if (phase === 'receipt') context.refuseWrites()
      else context.refuseAcknowledgements()
      return true
    })
    const sending = context.send(context.service).catch((error: unknown) => error)
    await held.started
    const clearing = context.service.clearConversation(sessionId)
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    await new Promise<void>((resolve) => setImmediate(resolve))
    held.release()
    const [sent, cleared] = await Promise.all([sending, clearing])
    expect(sent).toMatchObject({ statusCode: 409, submission: { accepted: true, sessionId } })
    expect(cleared).toMatchObject({ error: { statusCode: 409 } })
    expect(reset).not.toHaveBeenCalled()
    expect(context.pastes).toEqual([context.submitted])
    expect(context.service.store.isRetiredSession(sessionId)).toBe(false)
    const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
    expect(context.service['recoveryClaims'].get(token)?.accepted).toBe(true)
    expect(context.service.store.recoveryResend(sessionId)?.accepted).toBe(phase === 'acknowledgement')
    expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
    await expect(context.send(context.service, token)).rejects.toMatchObject({ statusCode: 409 })
    context.refuseWrites(false)
    context.refuseAcknowledgements(false)
    await vi.waitFor(() => expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined())
    expect(context.pastes).toEqual([context.submitted])
    await context.service.store.updateStatus(sessionId, 'idle')
    const laterClear = await context.service.clearConversation(sessionId)
    expect(laterClear.id).not.toBe(sessionId)
    expect(laterClear.failedPrompt).toBeUndefined()
    expect(reset).toHaveBeenCalledOnce()
  })

  it.each(['message', 'command'] as const)(
    'protects uncertain recovered native %s from Clear without accepting its receipt',
    async (kind) => {
      const context = await fixture(kind)
      const held = gate()
      const reset = vi.fn(async (
        _id: string, _replacement: string, _cwd: string, _runtime: unknown,
        commit: () => Promise<void>,
      ) => { await commit(); return true })
      Object.assign(context.terminal, { reset })
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        held.opened()
        await held.pending
        throw Object.assign(new Error('Native paste acknowledgement was lost'), {
          statusCode: 409, uncertainDelivery: true,
        })
      })
      const sending = context.send(context.service).catch((error: unknown) => error)
      await held.started
      const clearing = context.service.clearConversation(sessionId)
        .then((value) => ({ value }), (error: unknown) => ({ error }))
      await new Promise<void>((resolve) => setImmediate(resolve))
      held.release()
      const [sent, cleared] = await Promise.all([sending, clearing])
      expect(sent).toMatchObject({
        statusCode: 409, uncertainDelivery: true, submission: { accepted: false, sessionId },
      })
      expect(cleared).toMatchObject({ error: { statusCode: 409 } })
      expect(reset).not.toHaveBeenCalled()
      const receipt = context.service.store.recoveryResend(sessionId)!
      expect(receipt).toMatchObject({ accepted: false, content: context.submitted })
      expect(context.service.getSession(sessionId)?.failedPrompt).toMatchObject({
        failedAt: receipt.failedAt, content: context.submitted, uncertain: true,
      })
      await context.service.stop()
      const restarted = await context.load()
      await expect(context.send(restarted)).rejects.toMatchObject({ statusCode: 409 })
      await prepareDecision(context, restarted, receipt.failedAt)
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each(['message', 'command'] as const)(
    'keeps accepted recovered SDK %s and public redaction over an older transcript installation',
    async (kind) => {
      const context = await sdkFixture(kind)
      context.withEvents()
      context.service['sessions'].set(sessionId, context.sdk)
      const history = gate()
      const replace = context.service.store.replaceTranscript.bind(context.service.store)
      vi.spyOn(context.service.store, 'replaceTranscript').mockImplementationOnce(async (...args) => {
        history.opened()
        await history.pending
        return replace(...args)
      })
      let refused = false
      vi.mocked(writeFile).mockImplementation(async (...args) => {
        if (!refused && args[0] === `${context.statePath}.tmp` &&
            JSON.parse(String(args[1])).sessions[sessionId]?.recoveryResend?.accepted === true) {
          refused = true
          throw storageError
        }
        return disk.writeFile(...args)
      })
      const polling = context.service.refreshTranscripts()
      await history.started
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      expect(refused).toBe(true)
      const current = context.service.getSession(sessionId)!
      const expected = kind === 'command' ? context.generated : context.submitted
      expect(context.calls).toEqual([expected])
      expect(current.messages.some((message) => message.content === expected)).toBe(true)
      expect(current.failedPrompt).toBeUndefined()
      history.release()
      await polling
      expect(context.service.getSession(sessionId)?.messages).toEqual(current.messages)
      expect(context.service.getSession(sessionId)?.status).toBe('running')
      expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
      expect(context.service['eventLogFingerprints'].has(sessionId)).toBe(false)
      expect(context.service['eventLogVersions'].has(sessionId)).toBe(false)
    },
  )
})

describe('Review 5125727881 runtime boundaries', () => {
  type PublicSessionValue = SessionDetail | SessionDetail[] | RemovedQueuedPrompt | undefined
  type SessionMethod = {
    [Key in keyof SessionService]-?: NonNullable<SessionService[Key]> extends (...args: never[]) => infer Result
      ? Awaited<Result> extends PublicSessionValue ? Key : never
      : never
  }[keyof SessionService]
  const projections: Record<SessionMethod, (
    context: Awaited<ReturnType<typeof fixture>>, snapshot: SessionDetail,
  ) => Promise<PublicSessionValue>> = {
    listSessions: async ({ service }) => service.listSessions(),
    listHistory: async ({ service }) => service.listHistory(),
    getSession: async ({ service }) => service.getSession(sessionId),
    openSession: async ({ service }) => service.openSession(sessionId),
    activateSession: async ({ service }) => service.activateSession(sessionId),
    createSession: async ({ service, directory }, snapshot) => {
      service['createSdkSession'] = async () => snapshot
      return service.createSession(directory, false)
    },
    renameSession: async ({ service }) => service.renameSession(sessionId, 'Projected title'),
    configureRuntime: async ({ service, terminal }) => {
      service['refreshRuntimeModels'] = async () => {}
      service['reconcileRuntimeStatus'] = async (session) => ({ ...session, status: 'idle' })
      service['runtimeModels'].set('fixture', {
        id: 'fixture', name: 'Fixture', reasoningEfforts: [], contextTiers: ['default'],
      })
      Object.assign(terminal, { configure: async () => true })
      return service.configureRuntime(sessionId, { model: 'fixture', contextTier: 'default' })
    },
    clearConversation: async ({ service }, snapshot) => {
      service['clearSerialized'] = async () => snapshot
      return service.clearConversation(sessionId)
    },
    recoverConversation: async ({ service }, snapshot) => {
      service['clearSerialized'] = async () => snapshot
      return service.recoverConversation(sessionId, 'manual')
    },
    suspendSession: async ({ service }, snapshot) => {
      service['suspendSerialized'] = async () => snapshot
      return service.suspendSession(sessionId)
    },
    resumeSession: async ({ service }, snapshot) => {
      service['resumeQueued'] = async () => snapshot
      return service.resumeSession(sessionId)
    },
    restartSession: async ({ service }, snapshot) => {
      service['restartSerialized'] = async () => snapshot
      return service.restartSession(sessionId)
    },
    moveToTerminal: async ({ service }, snapshot) => {
      service['moveToTerminalSerialized'] = async () => snapshot
      return service.moveToTerminal(sessionId)
    },
    removeQueuedPrompt: async ({ service }) => {
      await service.store.enqueuePrompt(sessionId, {
        id: 'editable', content: 'Keep the removed draft', createdAt: originalToken,
      })
      return service.removeQueuedPrompt(sessionId, 'editable')
    },
    updateQueuedPrompt: async ({ service }) => {
      await service.store.enqueuePrompt(sessionId, {
        id: 'editable', content: 'Keep the editable draft', createdAt: originalToken,
      })
      return service.updateQueuedPrompt(sessionId, 'editable', 'Updated draft')
    },
    retryQueuedDispatch: async ({ service }) => {
      const attemptId = randomUUID()
      const original = { id: 'unconfirmed', content: 'Retry in place', createdAt: originalToken }
      await service.store.update(sessionId, (session) => {
        session.queuedDispatch = {
          attemptId, promptId: original.id, content: original.content, startedAt: originalToken,
          state: 'uncertain', original, originalIndex: 0,
        }
      })
      return service.retryQueuedDispatch(sessionId, original.id, attemptId)
    },
    reorderQueuedPrompts: async ({ service }) => {
      await service.store.enqueuePrompt(sessionId, {
        id: 'first', content: 'First queued draft', createdAt: originalToken,
      })
      await service.store.enqueuePrompt(sessionId, {
        id: 'second', content: 'Second queued draft', createdAt: originalToken,
      })
      return service.reorderQueuedPrompts(sessionId, ['second', 'first'])
    },
    sendMessage: async ({ service }, snapshot) => {
      service['sendAdmittedMessage'] = async () => snapshot
      return service.sendMessage(sessionId, 'Independent text')
    },
    executeCommand: async ({ service }, snapshot) => {
      service['executeAdmittedCommand'] = async () => snapshot
      return service.executeCommand(sessionId, '/usage independent')
    },
    replyPermission: async ({ service }, snapshot) => {
      service['replyPermissionInternal'] = async () => snapshot
      return service.replyPermission(sessionId, 'request', 'allow')
    },
    replyUserInput: async ({ service }, snapshot) => {
      service['replyUserInputInternal'] = async () => snapshot
      return service.replyUserInput(sessionId, 'request', { answer: 'Yes', wasFreeform: false })
    },
  }

  async function httpBoundary(context: Awaited<ReturnType<typeof fixture>>, paired: boolean) {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://localhost')
    const transcription = {
      async initialize() {}, async stop() {},
      async transcribe() { throw new Error('Live transcription is forbidden') },
    }
    let node: Awaited<ReturnType<typeof buildApp>> | undefined
    let nodeUrl: string | undefined
    let service = context.service
    if (paired) {
      node = await buildApp({
        service, role: 'node', logger: false, dataDirectory: path.join(context.directory, 'boundary-node'),
        transcriptionService: transcription,
      })
      runtimes.push(node)
      nodeUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
      service = new AgentService(
        new SessionStore(path.join(context.directory, 'boundary-hub-store')), context.client,
        async () => [], async () => undefined, async () => [], async () => undefined,
        { has: async () => false, send: async () => false, cancel: async () => false },
        async () => undefined, async () => undefined,
      )
      services.push(service)
      await service.start()
    }
    const hub = await buildApp({
      service, role: 'hub', logger: false, dataDirectory: path.join(context.directory, 'boundary-hub'),
      transcriptionService: transcription,
    })
    runtimes.push(hub)
    const computer = node && nodeUrl
      ? (await hub.manager!.registerComputer({ baseUrl: nodeUrl, token: node.identity.token })).id
      : hub.identity.info.id
    return { app: hub.app, route: `/api/computers/${computer}/sessions/${sessionId}` }
  }

  it.each([false, true])('does not re-advertise accepted text through real HTTP mutations (paired=%s)', async (paired) => {
    const context = await fixture()
    context.withEvents()
    context.refuseAcknowledgements()
    const { app, route } = await httpBoundary(context, paired)
    const first = await app.inject({
      method: 'POST', url: `${route}/messages`, headers: { host: 'localhost' },
      payload: { content: context.submitted, acknowledgesFailure: originalToken },
    })
    expect(first.statusCode).toBe(409)
    expect(first.json().submission.accepted).toBe(true)
    await vi.waitFor(() => expect(context.service['acknowledgementTimers'].size).toBe(1))
    const token = first.json().submission.failedAt
    for (const request of [
      { method: 'GET' as const, url: route, expected: 200 },
      { method: 'PATCH' as const, url: route, payload: { title: 'Independent metadata edit' }, expected: 200 },
      { method: 'POST' as const, url: `${route}/messages`, payload: { content: 'Other queued work', enqueue: true }, expected: 202 },
      { method: 'POST' as const, url: `${route}/commands`, payload: { command: '/usage other-work', enqueue: true }, expected: 200 },
    ]) {
      const { expected, ...input } = request
      const response = await app.inject({ ...input, headers: { host: 'localhost' } })
      expect(response.statusCode).toBe(expected)
      expect(response.json().session.failedPrompt).toBeUndefined()
    }
    const queued = context.service.store.get(sessionId)!.queuedPrompts!.find((prompt) => prompt.content === 'Other queued work')!
    const removed = await app.inject({
      method: 'DELETE', url: `${route}/queue/${queued.id}`, headers: { host: 'localhost' },
    })
    expect(removed.statusCode).toBe(200)
    expect(removed.json().session.failedPrompt).toBeUndefined()
    expect(removed.json().prompt.content).toBe('Other queued work')
    expect(context.service.store.failedPrompt(sessionId)?.failedAt).toBe(token)
    expect(context.service.store.recoveryResend(sessionId)?.accepted).toBe(true)
    expect(context.pastes).toEqual([context.submitted])
  })

  it.each(Object.keys(projections) as SessionMethod[])(
    'projects accepted recovery at every public SessionService response: %s',
    async (method) => {
      const context = await fixture()
      context.withEvents()
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      await vi.waitFor(() => expect(context.service['acknowledgementTimers'].size).toBe(1))
      const snapshot = context.service.store.get(sessionId)!
      const token = snapshot.failedPrompt!.failedAt
      const response = await projections[method](context, snapshot)
      expect(response).toBeDefined()
      const sessions = Array.isArray(response) ? response
        : response && 'session' in response ? [response.session]
        : [response as SessionDetail]
      expect(sessions.length).toBeGreaterThan(0)
      for (const session of sessions) expect(session.failedPrompt).toBeUndefined()
      if (response && !Array.isArray(response) && 'prompt' in response) {
        expect(response.prompt.content).toBe(
          method === 'updateQueuedPrompt'
            ? 'Updated draft'
            : 'Keep the removed draft',
        )
      }
      expect(snapshot.failedPrompt?.failedAt).toBe(token)
      expect(context.service.store.failedPrompt(sessionId)?.failedAt).toBe(token)
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it.each([
    ['message', 'message', true], ['message', 'command', true],
    ['message', 'message', false], ['message', 'command', false],
    ['command', 'message', true], ['command', 'command', true],
  ] as const)(
    'retains startup ownership before a %s receipt write fails and a %s follower enters (first readiness=%s)',
    async (firstKind, followerKind, firstReady) => {
      const context = await fixture(firstKind)
      context.withEvents()
      let ownsStartup = true
      Object.assign(context.terminal, {
        ownsStartupPrompt: () => ownsStartup,
        capture: async () => '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands',
        inputReady: vi.fn(async () => true).mockResolvedValueOnce(firstReady),
        resolveStartupPrompt: async () => { ownsStartup = false; return true },
      })
      const held = gate()
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        held.opened()
        await held.pending
        return true
      })
      const first = context.send(context.service)
      await held.started
      expect((await context.persisted()).sessions[sessionId].recoveryResend.accepted).toBe(false)
      vi.mocked(writeFile).mockImplementation(async (...args) => {
        if (args[0] === `${context.statePath}.tmp` &&
            JSON.parse(String(args[1])).sessions[sessionId]?.recoveryResend?.accepted) {
          throw storageError
        }
        return disk.writeFile(...args)
      })
      const admission = context.service['terminalAdmissionOperations'].get(sessionId)
      const follower = followerKind === 'message'
        ? context.service.sendMessage(sessionId, 'Independent following message')
        : context.service.executeCommand(sessionId, '/usage following')
      const results = Promise.allSettled([first, follower])
      await vi.waitFor(() => expect(context.service['terminalAdmissionOperations'].get(sessionId)).not.toBe(admission))
      held.release()
      const [delivered, blocked] = await results
      expect(delivered).toMatchObject({
        status: 'rejected', reason: { statusCode: 409, submission: { accepted: true } },
      })
      expect(blocked.status).toBe('rejected')
      if (blocked.status === 'rejected') {
        if (blocked.reason !== storageError) expect.soft(blocked.reason).toMatchObject({ statusCode: 409 })
        expect(blocked.reason).not.toMatchObject({ submission: { accepted: true } })
      }
      expect(context.pastes).toEqual([context.submitted])
      expect((await context.persisted()).sessions[sessionId].recoveryResend.accepted).toBe(false)
    },
  )

  it.each([
    ['message', 'message', true], ['message', 'command', true],
    ['message', 'message', false], ['message', 'command', false],
    ['command', 'message', true], ['command', 'command', true],
  ] as const)(
    'matches the independent one-shot receipt repro: %s → %s (refuse first accepted write=%s)',
    async (firstKind, followerKind, refuseFirst) => {
      const context = await fixture()
      await context.service.store.update(sessionId, (session) => {
        session.status = 'idle'
        session.failedPrompt = { content: 'Recover me', failedAt: 'original', uncertain: true }
      })
      let ownsStartup = true
      Object.assign(context.terminal, {
        ownsStartupPrompt: () => ownsStartup,
        resolveStartupPrompt: async () => { ownsStartup = false; return true },
        capture: async () => '╻▄▄▄▄\n┃ \n╹▀▀▀▀\n / commands',
        inputReady: async () => true,
      })
      const io: Array<{ operation: 'write' | 'refused' | 'rename'; accepted?: boolean }> = []
      let refusals = 0
      vi.mocked(writeFile).mockImplementation(async (...args) => {
        if (args[0] === `${context.statePath}.tmp`) {
          const candidate = JSON.parse(String(args[1])).sessions[sessionId]
          const accepted = candidate?.recoveryResend?.accepted === true
          io.push({ operation: 'write', accepted })
          if (refuseFirst && accepted && refusals === 0) {
            refusals += 1
            const persisted = (await context.persisted()).sessions[sessionId]
            expect(persisted.recoveryResend.accepted).toBe(false)
            expect(persisted.failedPrompt.failedAt).toMatch(/^resend:/)
            io.push({ operation: 'refused' })
            throw storageError
          }
        }
        return disk.writeFile(...args)
      })
      vi.mocked(rename).mockImplementation(async (...args) => {
        if (args[0] === `${context.statePath}.tmp`) {
          const candidate = JSON.parse(await disk.readFile(String(args[0]), 'utf8')).sessions[sessionId]
          io.push({ operation: 'rename', accepted: candidate?.recoveryResend?.accepted === true })
        }
        return disk.rename(...args)
      })
      const held = gate()
      context.terminal.send.mockImplementationOnce(async (_id, content) => {
        context.pastes.push(content)
        held.opened()
        await held.pending
        return true
      })
      const firstText = firstKind === 'message' ? 'First recovery' : '/usage first'
      const first = firstKind === 'message'
        ? context.service.sendMessage(sessionId, firstText, false, 'original')
        : context.service.executeCommand(sessionId, firstText, false, 'original')
      await held.started
      const firstAdmission = context.service['terminalAdmissionOperations'].get(sessionId)
      const follower = followerKind === 'message'
        ? context.service.sendMessage(sessionId, 'Independent follower')
        : context.service.executeCommand(sessionId, '/usage independent follower')
      const results = Promise.allSettled([first, follower])
      await vi.waitFor(() => expect(context.service['terminalAdmissionOperations'].get(sessionId)).not.toBe(firstAdmission))
      held.release()
      const [initial, following] = await results
      if (refuseFirst) {
        expect(initial).toMatchObject({
          status: 'rejected', reason: { statusCode: 409, submission: { accepted: true } },
        })
        const refused = io.findIndex((event) => event.operation === 'refused')
        expect(refused).toBeGreaterThan(0)
        expect(io[refused + 1]?.operation).not.toBe('rename')
      } else {
        expect(initial.status).toBe('fulfilled')
      }
      expect(refusals).toBe(refuseFirst ? 1 : 0)
      expect(io.some((event) => event.operation === 'rename' && event.accepted)).toBe(true)
      expect(following).toMatchObject({ status: 'rejected', reason: { statusCode: 409 } })
      expect(context.pastes).toEqual([firstText])
      expect((await context.persisted()).sessions[sessionId].failedPrompt).toBeUndefined()
    },
  )

  it('marks the shared in-memory recovery claim accepted before acknowledgement failure', async () => {
    const context = await fixture()
    context.withEvents()
    context.refuseAcknowledgements()
    await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
    const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
    expect(context.service['recoveryClaims'].get(token)?.accepted).toBe(true)
    expect((await context.persisted()).sessions[sessionId].recoveryResend.accepted).toBe(true)
    expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
  })

  it('marks the linked claim even if a caller forwards a separate delivery-boundary object', async () => {
    const context = await fixture()
    const claim = await context.service['claimFailure'](sessionId, context.submitted, originalToken)
    expect(claim).toBeDefined()
    const forwarded = { accepted: false }
    await context.service['recordDelivery'](sessionId, claim!.failedAt, forwarded)
    expect(forwarded.accepted).toBe(true)
    expect(claim!.accepted).toBe(true)
    expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
    expect(context.service.store.failedPrompt(sessionId)?.failedAt).toBe(claim!.failedAt)
    claim!.release()
  })

  it('publishes an accepted projection even when receipt persistence cannot commit', async () => {
    const context = await fixture()
    const snapshots: SessionDetail[] = []
    context.service.on('event', (event) => {
      if (event.type === 'session.upserted' && event.session.id === sessionId) snapshots.push(event.session)
    })
    context.terminal.send.mockImplementationOnce(async (_id, content) => {
      context.pastes.push(content)
      context.refuseWrites()
      return true
    })
    await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
    const pending = (await context.persisted()).sessions[sessionId]
    expect(pending.recoveryResend.accepted).toBe(false)
    expect(context.service['recoveryClaims'].get(pending.failedPrompt.failedAt)?.accepted).toBe(true)
    expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
    expect(snapshots.length).toBeGreaterThan(0)
    expect(snapshots.at(-1)?.failedPrompt).toBeUndefined()
    expect(context.pastes).toEqual([context.submitted])
  })

  it.each(['rename', 'queued message', 'queued command', 'remove queued prompt'] as const)(
    'does not return an accepted recovery through %s metadata',
    async (operation) => {
      const context = await fixture()
      context.withEvents()
      context.refuseAcknowledgements()
      await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
      await vi.waitFor(() => expect(context.service['acknowledgementTimers'].size).toBe(1))
      const token = context.service.store.get(sessionId)!.failedPrompt!.failedAt!
      let returned: SessionDetail
      if (operation === 'rename') returned = await context.service.renameSession(sessionId, 'A retained title')
      else if (operation === 'queued message') {
        returned = await context.service.sendMessage(sessionId, 'Unrelated queued text', true)
      } else if (operation === 'queued command') {
        returned = await context.service.executeCommand(sessionId, '/usage unrelated', true)
      } else {
        await context.service.store.enqueuePrompt(sessionId, {
          id: 'editable', content: 'Unrelated queued text', createdAt: originalToken,
        })
        const removed = await context.service.removeQueuedPrompt(sessionId, 'editable')
        expect(removed.prompt.content).toBe('Unrelated queued text')
        returned = removed.session
      }
      expect.soft(returned.failedPrompt).toBeUndefined()
      expect(context.service.store.get(sessionId)?.failedPrompt?.failedAt).toBe(token)
      expect(context.service.store.recoveryResend(sessionId)?.accepted).toBe(true)
      expect(context.pastes).toEqual([context.submitted])
    },
  )

  it('keeps a durable accepted recovery hidden after its retry waiter stops', async () => {
    const context = await fixture()
    context.withEvents()
    context.refuseAcknowledgements()
    await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
    const [shutdown] = await Promise.allSettled([context.service.stop()])
    if (shutdown.status === 'rejected') expect(shutdown.reason).toBe(storageError)
    expect(context.service['recoveryClaims'].size).toBe(0)
    expect(context.service.store.recoveryResend(sessionId)?.accepted).toBe(true)
    expect(context.service.getSession(sessionId)?.failedPrompt).toBeUndefined()
  })

  it('does not re-advertise an obsolete accepted snapshot or hide a newer recovery', async () => {
    const context = await fixture()
    context.withEvents()
    context.refuseAcknowledgements()
    await expect(context.send(context.service)).rejects.toMatchObject({ submission: { accepted: true } })
    const snapshot = context.service.store.get(sessionId)!
    context.refuseAcknowledgements(false)
    await vi.waitFor(() => expect(context.service.store.get(sessionId)?.failedPrompt).toBeUndefined())
    expect.soft(context.service['publicSession'](snapshot).failedPrompt).toBeUndefined()
    const newer = { content: 'Newer unaccepted work', failedAt: 'newer-token', uncertain: true }
    await context.service.store.update(sessionId, (session) => { session.failedPrompt = newer })
    expect(context.service.getSession(sessionId)?.failedPrompt).toEqual(newer)
    expect(context.service['publicSession'](snapshot).failedPrompt).toBeUndefined()
    expect(context.service.store.get(sessionId)?.failedPrompt).toEqual(newer)
  })
})
