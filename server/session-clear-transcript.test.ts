import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, type CopilotClientLike, type CopilotSessionLike } from './agent-service.js'
import { SessionStore } from './session-store.js'
import { SessionAdmissions } from './session-admissions.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile) }
})
const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const id = 'clear-transcript-session'
const timestamp = '2026-09-06T12:00:00.000Z'
const fixtures: Array<{ directory: string; service: AgentService }> = []
const releases: Array<() => void> = []

function gate() {
  let finish = () => {}
  const promise = new Promise<void>((resolve) => { finish = resolve })
  releases.push(finish)
  return { promise, finish }
}

async function tick() {
  await new Promise<void>((resolve) => setImmediate(resolve))
}

function event(type: SessionEvent['type'], data: object, createdAt = timestamp): SessionEvent {
  return { id: randomUUID(), type, data, timestamp: createdAt, ephemeral: false, parentId: null } as SessionEvent
}

function holdTurnWrite() {
  const held = gate()
  const entered = gate()
  let used = false
  vi.mocked(writeFile).mockImplementation(async (...args) => {
    const state = JSON.parse(String(args[1]))
    if (!used && state.sessions[id]?.messages.some((message: { content: string }) => message.content === 'Accepted turn')) {
      used = true
      entered.finish()
      await held.promise
    }
    return disk.writeFile(...args)
  })
  return { started: entered.promise, finish: held.finish }
}

async function fixture(loaded = true) {
  const directory = path.resolve('graphify/.cache', `clear-transcript-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  vi.stubEnv('COPILOT_HOME', path.join(directory, 'synthetic-copilot-home'))
  const store = new SessionStore(directory)
  await store.initialize()
  await store.create({
    id, provider: 'copilot', cwd: directory, title: 'Original identity',
    status: 'idle', isOpen: true, updatedAt: timestamp,
    messages: [{ id: 'old', role: 'assistant', content: 'Old history', createdAt: timestamp }],
  }, { backend: 'sdk', managedOpen: true })
  const turn = gate()
  const sent: string[] = []
  const runtime = (sessionId: string): CopilotSessionLike => ({
    sessionId,
    sendAndWait: vi.fn(async (content) => { sent.push(content); await turn.promise; return undefined }),
    on: () => () => {},
    getEvents: vi.fn(async () => []),
    abort: vi.fn(async () => { turn.finish() }),
    disconnect: vi.fn(async () => {}),
    rpc: {
      commands: { list: vi.fn(async () => ({ commands: [] })), invoke: vi.fn(), enqueue: vi.fn() },
      model: {
        getCurrent: vi.fn(async () => ({ modelId: 'fixture' })),
        switchTo: vi.fn(async () => ({ modelId: 'fixture' })),
      },
      name: { set: vi.fn(async () => {}) },
      mode: { set: vi.fn(async () => {}) },
    },
  })
  const sdk = runtime(id)
  const client: CopilotClientLike = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => { turn.finish(); return [] }),
    createSession: vi.fn(async (config) => runtime(config.sessionId || randomUUID())),
    resumeSession: vi.fn(async () => sdk),
    listSessions: vi.fn(async () => []),
    deleteSession: vi.fn(async () => {}),
    rpc: {
      commands: { list: vi.fn(async () => ({ commands: [] })) },
      models: { list: vi.fn(async () => ({ models: [] })) },
    },
  }
  let events: SessionEvent[] = [{
    id: 'old-idle', type: 'session.idle', timestamp, data: {}, ephemeral: true, parentId: null,
  }]
  let version = 'history-v1'
  const eventReader = vi.fn(async () => events)
  const terminal = {
    has: vi.fn(async () => false),
    send: vi.fn(async () => false),
    cancel: vi.fn(async () => false),
    reset: vi.fn(),
  }
  const service = new AgentService(
    store, client, async () => [], async () => {}, eventReader, async () => version,
    terminal, async () => undefined, async () => undefined,
  )
  if (loaded) service['sessions'].set(id, sdk)
  fixtures.push({ directory, service })
  return {
    directory, store, service, client, sdk, terminal, turn, sent, eventReader,
    history: (next: SessionEvent[], nextVersion = 'history-v2') => { events = next; version = nextVersion },
    persisted: async () => JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions[id],
  }
}

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
})
afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  vi.mocked(writeFile).mockImplementation(disk.writeFile)
  for (const fixture of fixtures.splice(0)) {
    await Promise.allSettled([fixture.service.stop()])
    await Promise.allSettled([fixture.service.store.flush()])
    await rm(fixture.directory, { recursive: true, force: true })
  }
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('Transcript and Clear admission serialization', () => {
  it('does not install a stale poll queued behind the held durable admission', async () => {
    const { store, service, sent } = await fixture()
    const entered = gate()
    const releaseReplacement = gate()
    const replace = store.replaceTranscript.bind(store)
    vi.spyOn(store, 'replaceTranscript').mockImplementationOnce(async (...args) => {
      entered.finish()
      await releaseReplacement.promise
      return replace(...args)
    })
    const polling = service.refreshTranscripts()
    await entered.promise
    const held = holdTurnWrite()
    const sending = service.sendMessage(id, 'Accepted turn')
    await held.started
    expect(service['activePrompts'].has(id)).toBe(false)
    releaseReplacement.finish()
    await tick()
    held.finish()
    await Promise.all([sending, polling])
    expect(sent).toEqual(['Accepted turn'])
    expect(store.get(id)?.status).toBe('running')
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(service['eventLogFingerprints'].has(id)).toBe(false)
  })

  it('waits for an already loading send and refuses Clear before any replacement side effects', async () => {
    const { store, service, client, sdk, sent } = await fixture(false)
    const loading = gate()
    const release = gate()
    vi.mocked(client.resumeSession).mockImplementationOnce(async () => {
      loading.finish()
      await release.promise
      return sdk
    })
    const sending = service.sendMessage(id, 'Accepted turn').catch((error: unknown) => error)
    await loading.promise
    const clearing = service.clearConversation(id).catch((error: unknown) => error)
    await tick()
    expect(client.createSession).not.toHaveBeenCalled()
    release.finish()
    const [accepted, refused] = await Promise.all([sending, clearing])
    expect(accepted).not.toBeInstanceOf(Error)
    expect(refused).toMatchObject({ statusCode: 409 })
    expect(sent).toEqual(['Accepted turn'])
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(client.deleteSession).not.toHaveBeenCalled()
    expect(sdk.disconnect).not.toHaveBeenCalled()
    expect(store.isRetiredSession(id)).toBe(false)
  })

  it('ignores history fetched before an admission even after that owner completes', async () => {
    const { store, service, sdk, eventReader } = await fixture()
    const fetched = gate()
    const release = gate()
    eventReader.mockImplementationOnce(async () => {
      fetched.finish()
      await release.promise
      return [event('session.idle', {})]
    })
    const polling = service.refreshTranscripts()
    await fetched.promise
    vi.mocked(sdk.sendAndWait).mockResolvedValueOnce(undefined)
    await service.sendMessage(id, 'Accepted turn')
    await vi.waitFor(() => expect(service['activePrompts'].has(id)).toBe(false))
    const watermark = new Date().toISOString()
    service['liveTranscriptWatermarks'].set(id, watermark)
    release.finish()
    await polling
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(store.get(id)?.status).toBe('idle')
    expect(service['liveTranscriptWatermarks'].get(id)).toBe(watermark)
    expect(service['eventLogVersions'].has(id)).toBe(false)
  })

  it('protects the committed transcript until SDK ownership is registered', async () => {
    const { store, service, eventReader } = await fixture()
    const committed = gate()
    const release = gate()
    const begin = store.beginPrompt.bind(store)
    vi.spyOn(store, 'beginPrompt').mockImplementationOnce(async (...args) => {
      const result = await begin(...args)
      committed.finish()
      await release.promise
      return result
    })
    const sending = service.sendMessage(id, 'Accepted turn')
    await committed.promise
    expect(service['activePrompts'].has(id)).toBe(false)
    await service.refreshTranscripts()
    expect(eventReader).not.toHaveBeenCalled()
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(store.get(id)?.status).toBe('running')
    release.finish()
    await sending
    expect(service['activePrompts'].has(id)).toBe(true)
  })

  it('does not hydrate stale SDK messages over an admission that starts during getEvents', async () => {
    const { store, service, sdk } = await fixture()
    const reading = gate()
    const release = gate()
    vi.mocked(sdk.getEvents).mockImplementationOnce(async () => {
      reading.finish()
      await release.promise
      return [event('assistant.message', { content: 'Old SDK history' })]
    })
    const opening = service.openSession(id)
    await reading.promise
    await service.sendMessage(id, 'Accepted turn')
    release.finish()
    const opened = await opening
    expect(opened.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(store.get(id)?.messages.some((message) => message.content === 'Old SDK history')).toBe(false)
    expect(service['hydratedSessions'].has(id)).toBe(false)
  })

  it('returns the committed activation transcript, not the snapshot from before setOpen', async () => {
    const { service, store } = await fixture()
    service['hydratedSessions'].add(id)
    const entering = gate()
    const release = gate()
    const setOpen = store.setOpen.bind(store)
    vi.spyOn(store, 'setOpen').mockImplementationOnce(async (...args) => {
      entering.finish()
      await release.promise
      return setOpen(...args)
    })
    const activating = service.activateSession(id)
    await entering.promise
    await service.sendMessage(id, 'Accepted turn')
    release.finish()
    const activated = await activating
    expect(activated.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(activated.status).toBe('running')
  })

  it('allows legitimate external/native reconciliation during an unrelated admitted operation', async () => {
    const { service, store, history } = await fixture()
    service['externalSessionIds'].add(id)
    await store.setBackend(id, 'terminal')
    history([
      event('user.message', { content: 'Native work' }, new Date().toISOString()),
      event('assistant.turn_start', {}, new Date().toISOString()),
    ])
    const release = gate()
    const admitted = service['admissions'].run(id, () => release.promise)
    await service.refreshTranscripts()
    expect(store.get(id)?.messages.some((message) => message.content === 'Native work')).toBe(true)
    expect(store.get(id)?.status).toBe('running')
    expect(service['eventLogVersions'].get(id)).toBe('history-v2')
    release.finish()
    await admitted
  })

  it('keeps metadata provenance while applying a current observed transcript', async () => {
    const { store } = await fixture()
    const observed = store.observeTranscript(id)
    await store.updateWorkingDirectory(id, '/authoritative', '2026-09-06T13:00:00.000Z')
    const updated = await store.replaceTranscript(
      id, [], 'idle', undefined, undefined, '/stale-index', false, undefined, undefined, observed,
    )
    expect(updated).toBeDefined()
    expect(updated?.cwd).toBe('/authoritative')
    expect(store.get(id)).not.toHaveProperty('transcriptEpoch')
  })

  it('does not invalidate a current observation when an admission write was refused', async () => {
    const { service, store } = await fixture()
    const observed = store.observeTranscript(id)
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('Admission refused'))
    await expect(service.sendMessage(id, 'Accepted turn')).rejects.toThrow('Admission refused')
    expect(service['admissions'].protectsTranscript(id)).toBe(false)
    expect(store.isCurrentTranscript(id, observed)).toBe(true)
    await expect(store.replaceTranscript(id, [], 'idle', undefined, undefined, undefined, false, undefined, undefined, observed))
      .resolves.toMatchObject({ status: 'idle', messages: [] })
  })

  it('accepts fresh completed history and retains the event-log version fast path', async () => {
    const { service, store, sdk, history, eventReader } = await fixture()
    vi.mocked(sdk.sendAndWait).mockResolvedValueOnce(undefined)
    await service.sendMessage(id, 'Accepted turn')
    await vi.waitFor(() => expect(service['activePrompts'].has(id)).toBe(false))
    const now = new Date().toISOString()
    history([
      event('user.message', { content: 'Accepted turn' }, now),
      event('assistant.message', { content: 'Fresh provider answer' }, now),
      event('session.idle', {}, now),
    ])
    await service.refreshTranscripts()
    expect(store.get(id)?.messages.some((message) => message.content === 'Fresh provider answer')).toBe(true)
    expect(store.get(id)?.status).toBe('idle')
    const reads = eventReader.mock.calls.length
    await service.refreshTranscripts()
    expect(eventReader).toHaveBeenCalledTimes(reads)
  })

  it('does not install an observation against a retired identity', async () => {
    const { store } = await fixture()
    const observed = store.observeTranscript(id)
    await store.replaceWithClearedSession(id, 'replacement')
    await expect(store.replaceMessages(id, [], observed)).resolves.toBeUndefined()
    expect(store.get('replacement')?.messages).toEqual([])
    expect(store.get(id)).toBeUndefined()
  })

  it.each(['write pending', 'committed, unregistered'] as const)(
    'joins an admission with %s and refuses Clear without cancelling accepted work',
    async (timing) => {
      const { store, service, client, sdk, sent } = await fixture()
      const committed = gate()
      const release = gate()
      let finish: () => void
      let started: Promise<void>
      if (timing === 'write pending') {
        const held = holdTurnWrite()
        finish = held.finish
        started = held.started
      } else {
        const begin = store.beginPrompt.bind(store)
        vi.spyOn(store, 'beginPrompt').mockImplementationOnce(async (...args) => {
          const result = await begin(...args)
          committed.finish()
          await release.promise
          return result
        })
        started = committed.promise
        finish = release.finish
      }
      const sending = service.sendMessage(id, 'Accepted turn')
      await started
      const clearing = service.clearConversation(id)
      const refused = expect(clearing).rejects.toMatchObject({ statusCode: 409 })
      await tick()
      await expect(service.sendMessage(id, 'Too late')).rejects.toMatchObject({ statusCode: 409 })
      expect(client.createSession).not.toHaveBeenCalled()
      finish()
      await Promise.all([sending, refused])
      expect(sent).toEqual(['Accepted turn'])
      expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
      expect(sdk.disconnect).not.toHaveBeenCalled()
      expect(client.deleteSession).not.toHaveBeenCalled()
      expect(store.isRetiredSession(id)).toBe(false)
    },
  )

  it('still refuses Clear when a joined accepted turn completes before Clear resumes', async () => {
    const { service, store, client, sdk } = await fixture(false)
    const entered = gate()
    const release = gate()
    vi.mocked(client.resumeSession).mockImplementationOnce(async () => {
      entered.finish()
      await release.promise
      return sdk
    })
    vi.mocked(sdk.sendAndWait).mockResolvedValueOnce(undefined)
    const sending = service.sendMessage(id, 'Accepted turn')
    await entered.promise
    const refused = expect(service.clearConversation(id)).rejects.toMatchObject({ statusCode: 409 })
    release.finish()
    await Promise.all([sending, refused])
    await vi.waitFor(() => expect(service['activePrompts'].has(id)).toBe(false))
    expect(store.get(id)?.status).toBe('idle')
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(client.createSession).not.toHaveBeenCalled()
  })

  it('joins a queued SDK handoff rather than cancelling it with the exclusive gate', async () => {
    const { service, store, client, sdk, sent } = await fixture(false)
    await store.enqueuePrompt(id, { id: 'queued', content: 'Accepted turn', createdAt: timestamp })
    const entered = gate()
    const release = gate()
    vi.mocked(client.resumeSession).mockImplementationOnce(async () => {
      entered.finish()
      await release.promise
      return sdk
    })
    const pumping = service['drainSdkQueue'](id)
    await entered.promise
    const refused = expect(service.clearConversation(id)).rejects.toMatchObject({ statusCode: 409 })
    release.finish()
    await Promise.all([pumping, refused])
    expect(sent).toEqual(['Accepted turn'])
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
    expect(client.createSession).not.toHaveBeenCalled()
    expect(client.deleteSession).not.toHaveBeenCalled()
  })

  it('does not reset a native provider whose accepted delivery overlaps Clear', async () => {
    const { service, store, terminal, client, history } = await fixture()
    service['externalSessionIds'].add(id)
    await store.setBackend(id, 'terminal')
    terminal.has.mockResolvedValue(true)
    const entered = gate()
    const release = gate()
    terminal.send.mockImplementationOnce(async () => {
      entered.finish()
      await release.promise
      history([event('user.message', { content: 'Accepted turn' }, new Date().toISOString())])
      return true
    })
    const sending = service.sendMessage(id, 'Accepted turn')
    await entered.promise
    const refused = expect(service.clearConversation(id)).rejects.toMatchObject({ statusCode: 409 })
    release.finish()
    await Promise.all([sending, refused])
    expect(terminal.reset).not.toHaveBeenCalled()
    expect(client.deleteSession).not.toHaveBeenCalled()
    expect(store.get(id)?.status).toBe('running')
    expect(store.isRetiredSession(id)).toBe(false)
  })

  it.each([
    { kind: 'message', outcome: 'uncertain' },
    { kind: 'command', outcome: 'uncertain' },
    { kind: 'message', outcome: 'definite refusal' },
    { kind: 'command', outcome: 'definite refusal' },
    { kind: 'message', outcome: 'preflight read failure' },
    { kind: 'command', outcome: 'preflight read failure' },
  ])('distinguishes $outcome from no-effect native $kind while Clear joins', async ({ kind, outcome }) => {
    const { service, store, terminal, client, sdk, directory, persisted } = await fixture()
    await service.start()
    service['externalSessionIds'].add(id)
    service['externalCommandCache'].set(directory, { commands: [], expiresAt: Date.now() + 60_000 })
    await store.setBackend(id, 'terminal')
    terminal.has.mockResolvedValue(true)
    const before = await persisted()
    const delivery = vi.spyOn(service as unknown as {
      recordDelivery(...args: unknown[]): Promise<void>
    }, 'recordDelivery')
    const entered = gate()
    const release = gate()
    const content = kind === 'command' ? '/usage' : 'Possibly pasted native message'
    let nativeInput = ''
    const uncertain = outcome === 'uncertain'
    const failure = Object.assign(new Error(
      uncertain ? 'Paste accepted, but terminal confirmation failed'
        : outcome === 'definite refusal' ? 'Preflight refused before paste'
          : 'Preflight capture failed before paste',
    ), uncertain ? { statusCode: 409, uncertainDelivery: true }
      : outcome === 'definite refusal' ? { statusCode: 409 } : { code: 'EIO' })
    terminal.send.mockImplementationOnce(async () => {
      if (uncertain) nativeInput = content
      entered.finish()
      await release.promise
      throw failure
    })
    terminal.reset.mockImplementation(async (
      _sessionId: string, _replacementId: string, _cwd: string,
      _runtime: unknown, commitReplacement: () => Promise<void>,
    ) => {
      nativeInput = ''
      await commitReplacement()
      return true
    })
    const sending = (kind === 'command'
      ? service.executeCommand(id, content)
      : service.sendMessage(id, content))
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    await entered.promise
    const clearing = service.clearConversation(id)
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    await tick()
    expect(terminal.reset).not.toHaveBeenCalled()
    expect(store.get(id)?.status).toBe('idle')
    release.finish()
    const [send, clear] = await Promise.all([sending, clearing])
    expect(send).toEqual({ error: failure })
    expect(terminal.send).toHaveBeenCalledTimes(1)
    expect(delivery).not.toHaveBeenCalled()
    if (uncertain) {
      expect(clear).toMatchObject({ error: { statusCode: 409 } })
      expect(terminal.reset).not.toHaveBeenCalled()
      expect(client.createSession).not.toHaveBeenCalled()
      expect(client.deleteSession).not.toHaveBeenCalled()
      expect(sdk.disconnect).not.toHaveBeenCalled()
      expect(store.isRetiredSession(id)).toBe(false)
      expect(nativeInput).toBe(content)
      expect(await persisted()).toEqual(before)
    } else {
      expect(clear).toHaveProperty('value')
      expect(terminal.reset).toHaveBeenCalledTimes(1)
      expect(store.isRetiredSession(id)).toBe(true)
      expect(nativeInput).toBe('')
    }
    expect(service['admissions'].canEnter(id)).toBe(true)
  })

  it('preserves an admitted command result even if its provider does not start a turn', async () => {
    const { service, store, sdk, client } = await fixture()
    const entered = gate()
    const release = gate()
    vi.mocked(sdk.rpc.commands.invoke).mockImplementationOnce(async () => {
      entered.finish()
      await release.promise
      return { kind: 'text', text: 'Accepted command result' }
    })
    const command = service.executeCommand(id, '/usage')
    await entered.promise
    const refused = expect(service.clearConversation(id)).rejects.toMatchObject({ statusCode: 409 })
    release.finish()
    await Promise.all([command, refused])
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted command result')).toBe(true)
    expect(client.createSession).not.toHaveBeenCalled()
    expect(client.deleteSession).not.toHaveBeenCalled()
  })

  it('blocks new sends and commands throughout successful Clear and then releases the gate', async () => {
    const { service, client, store, sent } = await fixture()
    const entered = gate()
    const release = gate()
    const create = client.createSession.bind(client)
    vi.mocked(client.createSession).mockImplementationOnce(async (config) => {
      entered.finish()
      await release.promise
      return create(config)
    })
    const clearing = service.clearConversation(id)
    await entered.promise
    await expect(service.sendMessage(id, 'Too late')).rejects.toMatchObject({ statusCode: 409 })
    await expect(service.executeCommand(id, '/usage')).rejects.toMatchObject({ statusCode: 409 })
    expect(sent).toEqual([])
    release.finish()
    const replacement = await clearing
    expect(store.isRetiredSession(id)).toBe(true)
    await service.sendMessage(replacement.id, 'New identity work')
    expect(sent).toEqual(['New identity work'])
  })

  it('restores admission after a refused Clear write without retiring or disposing the original', async () => {
    const { service, client, sdk, store, sent } = await fixture()
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('Clear persistence refused'))
    await expect(service.clearConversation(id)).rejects.toThrow('Clear persistence refused')
    expect(store.get(id)).toBeDefined()
    expect(store.isRetiredSession(id)).toBe(false)
    expect(sdk.disconnect).not.toHaveBeenCalled()
    expect(vi.mocked(client.deleteSession).mock.calls.some(([sessionId]) => sessionId === id)).toBe(false)
    await service.sendMessage(id, 'Accepted turn')
    expect(sent).toEqual(['Accepted turn'])
  })

  it('wakes queued work deferred by a failed exclusive Clear after releasing the gate', async () => {
    const { service, store, client, sent } = await fixture()
    await store.enqueuePrompt(id, { id: 'queued', content: 'Accepted turn', createdAt: timestamp })
    const entered = gate()
    const release = gate()
    const create = client.createSession.bind(client)
    vi.mocked(client.createSession).mockImplementationOnce(async (config) => {
      entered.finish()
      await release.promise
      return create(config)
    })
    const clearing = service.clearConversation(id)
    const refused = expect(clearing).rejects.toThrow('Clear refused')
    await entered.promise
    service['wakeSdkQueue'](id)
    await tick()
    expect(sent).toEqual([])
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('Clear refused'))
    release.finish()
    await refused
    await vi.waitFor(() => expect(sent).toEqual(['Accepted turn']))
    expect(store.isRetiredSession(id)).toBe(false)
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
  })

  it('does not retire a newer SDK identity installed while replacement is being prepared', async () => {
    const { service, store, client, sdk } = await fixture()
    const entered = gate()
    const release = gate()
    const create = client.createSession.bind(client)
    vi.mocked(client.createSession).mockImplementationOnce(async (config) => {
      entered.finish()
      await release.promise
      return create(config)
    })
    const clearing = service.clearConversation(id)
    const refused = expect(clearing).rejects.toMatchObject({ statusCode: 409 })
    await entered.promise
    const newer = { ...sdk, disconnect: vi.fn(async () => {}) }
    service['sessions'].set(id, newer)
    release.finish()
    await refused
    expect(store.isRetiredSession(id)).toBe(false)
    expect(service['sessions'].get(id)).toBe(newer)
    expect(sdk.disconnect).not.toHaveBeenCalled()
    expect(newer.disconnect).not.toHaveBeenCalled()
    expect(vi.mocked(client.deleteSession).mock.calls.some(([sessionId]) => sessionId === id)).toBe(false)
  })

  it('revalidates idle state and admission epoch inside the replacement transaction', async () => {
    const { store } = await fixture()
    const observed = store.observeTranscript(id)
    await store.beginPrompt(id, 'Accepted turn', 'assistant', () => true)
    await store.updateStatus(id, 'idle')
    await expect(store.replaceWithClearedSession(id, 'replacement', observed))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(store.get('replacement')).toBeUndefined()
    expect(store.isRetiredSession(id)).toBe(false)
    expect(store.get(id)?.messages.some((message) => message.content === 'Accepted turn')).toBe(true)
  })
})

describe('Exclusive admission coordination', () => {
  it('allows older nested handoffs while blocking unrelated new entrants', async () => {
    const admissions = new SessionAdmissions(() => false)
    const entered = gate()
    const release = gate()
    const old = admissions.run(id, async () => {
      entered.finish()
      await release.promise
      return admissions.run(id, async () => { admissions.markCommitted(id); return 'accepted' })
    })
    await entered.promise
    const exclusive = admissions.exclusive(id, async (owner) => {
      expect(owner.joinedActivity).toBe(true)
      expect(owner.isCurrent()).toBe(true)
      return 'exclusive'
    })
    await expect(admissions.run(id, async () => 'new')).rejects.toMatchObject({ statusCode: 409 })
    release.finish()
    await expect(old).resolves.toBe('accepted')
    await expect(exclusive).resolves.toBe('exclusive')
    await expect(admissions.run(id, async () => 'after')).resolves.toBe('after')
  })

  it('refuses self-joining Clear rather than deadlocking an admission', async () => {
    const admissions = new SessionAdmissions(() => false)
    await expect(admissions.run(id, () => admissions.exclusive(id, async () => 'invalid')))
      .rejects.toMatchObject({ statusCode: 409 })
    await expect(admissions.exclusive(id, async () => 'valid')).resolves.toBe('valid')
  })

  it('releases failed exclusive ownership and does not grant later work a stale permit', async () => {
    const admissions = new SessionAdmissions(() => false)
    let owns = () => false
    await expect(admissions.exclusive(id, async (owner) => {
      owns = owner.isCurrent
      throw new Error('Refused clear')
    })).rejects.toThrow('Refused clear')
    expect(owns()).toBe(false)
    expect(admissions.canEnter(id)).toBe(true)
  })
})
