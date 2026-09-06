import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'
import { buildApp } from './app.js'

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
        enqueue: async () => ({ queued: true }),
      },
      name: { set: async () => {} },
      mode: { set: async () => {} },
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
  const send = (target: AgentService, token = originalToken, enqueue = false) =>
    kind === 'message'
      ? target.sendMessage(sessionId, submitted, enqueue, token)
      : target.executeCommand(sessionId, submitted, enqueue, token)
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
    service, terminal, pastes, original, submitted, load, send, statePath, directory, client,
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

describe('Durable recovery resend ownership', () => {
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
    await context.send(context.service, token)
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

      await context.send(reloaded, durableAttempt.failedAt)
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
      await context.send(reloaded, retry.failedAt)
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
        expect(reloaded.store.get(sessionId)?.failedPrompt).toEqual(pending)
        await context.send(reloaded, pending.failedAt)
        expect(context.pastes).toEqual([context.submitted, context.submitted])
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
    await expect(context.send(reloaded, first)).rejects.toMatchObject({ cause: { message: 'No paste was attempted' } })
    const second = reloaded.store.get(sessionId)!.failedPrompt!.failedAt
    expect(new Set([originalToken, first, second]).size).toBe(3)
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
    await reloaded.sendMessage('replacement', context.submitted, false, retry.failedAt)
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
