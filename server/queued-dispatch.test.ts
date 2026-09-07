import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionEvent } from '@github/copilot-sdk'
import type { QueuedPrompt, SessionDetail } from '../shared/contracts.js'
import {
  AgentService,
  type CopilotClientLike,
  type CopilotSessionLike,
} from './agent-service.js'
import { preparePrompt, QueuedDispatches, type QueuedDelivery } from './queued-dispatch.js'
import { SessionStore } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile), rename: vi.fn(fs.rename) }
})
const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')

const fixtures: { directory: string; store: SessionStore; service?: AgentService }[] = []
const releases: (() => void)[] = []
const createdAt = '2026-09-05T00:00:00.000Z'

function prompt(id: string) {
  return { id, content: `original ${id}`, createdAt }
}

function deferred() {
  let resolve = () => {}
  const promise = new Promise<void>((accept) => { resolve = accept })
  releases.push(resolve)
  return { promise, resolve }
}

const normalize = async (content: string) => content
const accept = async (_prompt: QueuedPrompt, delivery: QueuedDelivery) => {
  delivery.submit()
  delivery.accept()
}
const idle = (session: SessionDetail) => {
  if (session.suspended || session.status !== 'idle') {
    throw Object.assign(new Error('Session must be idle'), { statusCode: 409 })
  }
}
const target = { promptId: 'middle', content: 'rewritten' }

async function persisted(directory: string): Promise<SessionDetail> {
  return JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions.session
}

function holdWrite() {
  const began = deferred()
  const release = deferred()
  vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
    began.resolve()
    await release.promise
    return disk.writeFile(...args)
  })
  return { began: began.promise, release: release.resolve }
}

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'targeted-queue-'))
  const store = new SessionStore(directory)
  const entry: (typeof fixtures)[number] = { directory, store }
  fixtures.push(entry)
  await store.initialize()
  await store.create({
    id: 'session', title: 'Session', cwd: directory, updatedAt: createdAt,
    status: 'idle', isOpen: true, messages: [],
    queuedPrompts: [prompt('first'), prompt('middle'), prompt('last')],
    queuedCount: 3,
  }, { managedOpen: true, backend: 'sdk' })
  return { directory, store, entry }
}

function sdkSession() {
  const listeners = new Set<(event: SessionEvent) => void>()
  const sdk: CopilotSessionLike & {
    send(options: { prompt: string; mode: 'immediate' }): Promise<string>
    emit(event: SessionEvent): void
  } = {
    sessionId: 'session',
    on: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    emit: (event) => { for (const listener of listeners) listener(event) },
    send: vi.fn(async () => 'receipt'),
    sendAndWait: vi.fn(async () => undefined),
    getEvents: async () => [],
    abort: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    rpc: {
      name: { set: async () => {} },
      model: {
        getCurrent: async () => ({ modelId: 'model' }),
        switchTo: async () => ({ modelId: 'model' }),
      },
      mode: { set: async () => {} },
      commands: {
        list: async () => ({ commands: [] }),
        invoke: async () => ({ kind: 'text', text: 'Done' }),
        enqueue: async () => ({ queued: true }),
      },
    },
  }
  return sdk
}

function client(sdk: CopilotSessionLike): CopilotClientLike {
  return {
    start: async () => {},
    stop: async () => [],
    createSession: vi.fn(async () => sdk),
    resumeSession: vi.fn(async () => sdk),
    deleteSession: vi.fn(async () => {}),
    listSessions: async () => [],
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
    },
  }
}

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
})

afterEach(async () => {
  vi.useRealTimers()
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
  releases.splice(0).forEach((release) => release())
  await Promise.allSettled(fixtures.map(({ service }) => service?.stop()))
  await Promise.allSettled(fixtures.map(({ store }) => store.close()))
  await Promise.all(fixtures.splice(0).map(({ directory }) =>
    rm(directory, { recursive: true, force: true })))
})

describe('Queued dispatch claims', () => {
  it('keeps the idle queue visible while an SDK drain awaits its provider', async () => {
    const { store, entry } = await fixture()
    const sdk = sdkSession()
    const copilot = client(sdk)
    let began = () => {}
    let refuse: () => void = () => {}
    const loading = new Promise<void>((resolve) => { began = resolve })
    copilot.resumeSession = vi.fn(() => new Promise<CopilotSessionLike>((_resolve, reject) => {
      refuse = () => reject(new Error('Definitive load refusal'))
      releases.push(refuse)
      began()
    }))
    const service = new AgentService(
      store, copilot, async () => [], async () => {}, async () => [],
      async () => undefined,
      { has: async () => false, send: async () => false, cancel: async () => false },
      async () => undefined, async () => undefined,
    )
    entry.service = service
    const draining = (service as unknown as {
      drainSdkQueue(id: string): Promise<unknown>
    }).drainSdkQueue('session')
    await loading
    try {
      expect(service.getSession('session')?.queuedPrompts).toEqual([
        prompt('first'), prompt('middle'), prompt('last'),
      ])
      expect(service.getSession('session')?.failedPrompt).toBeUndefined()
      expect(store.get('session')?.queuedPrompts).toEqual([prompt('middle'), prompt('last')])
      expect(store.get('session')?.failedPrompt).toMatchObject({
        content: 'original first', uncertain: true,
      })
    } finally {
      refuse()
      await draining
    }
  })

  it('claims exactly the requested item without rewriting or moving its original', async () => {
    const { store, directory } = await fixture()
    const published = vi.fn()
    const claims = new QueuedDispatches(store, published)
    let began = () => {}
    let release = () => {}
    const pending = new Promise<void>((resolve) => { release = resolve })
    const started = new Promise<void>((resolve) => { began = resolve })
    releases.push(release)
    const result = claims.run('session', { promptId: 'middle', content: 'rewritten' },
      async (content) => content,
      async (message, delivery) => {
        expect(message.id).toBe('middle')
        expect(message.content).toBe('rewritten')
        delivery.submit()
        began()
        await pending
        delivery.accept()
      },
      () => {},
    )
    await started
    expect(claims.view(store.get('session')!)).toMatchObject({
      status: 'idle',
      queuedPrompts: [prompt('first'), prompt('middle'), prompt('last')],
      queuedDispatch: { promptId: 'middle', content: 'rewritten' },
    })
    expect(await persisted(directory)).toMatchObject({
      queuedPrompts: [prompt('first'), prompt('last')],
      queuedDispatch: { original: prompt('middle'), originalIndex: 1 },
      failedPrompt: { content: 'rewritten', uncertain: true },
    })
    release()
    expect(await result).toMatchObject({ outcome: 'sent', promptId: 'middle' })
    expect(store.get('session')?.queuedPrompts).toEqual([prompt('first'), prompt('last')])
  })

  it('leaves the original item at its original position after a definitive refusal', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const result = await claims.run('session', { promptId: 'middle', content: 'rewritten' },
      async (content) => content,
      async () => { throw new Error('Refused before provider invocation') },
      () => {},
    )
    expect(result).toMatchObject({ outcome: 'refused', restored: true })
    expect(store.get('session')?.queuedPrompts).toEqual([
      prompt('first'), prompt('middle'), prompt('last'),
    ])
    expect(store.get('session')?.queuedDispatch).toBeUndefined()
  })

  it('retains an unconfirmed receipt across restart rather than resending', async () => {
    const { store, directory } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const dispatch = vi.fn(async (_message, delivery) => {
      delivery.submit()
      throw new Error('Transport acknowledgement lost')
    })
    expect(await claims.run('session', { promptId: 'middle', content: 'rewritten' },
      async (content) => content, dispatch, () => {},
    )).toMatchObject({ outcome: 'uncertain', delivery: 'unknown' })
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    const recovered = new QueuedDispatches(reloaded, () => {})
    expect(recovered.view(reloaded.get('session')!).queuedDispatch?.state).toBe('uncertain')
    expect(await recovered.run('session', undefined, async (text) => text, dispatch, () => {}))
      .toBeUndefined()
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(reloaded.get('session')?.queuedPrompts).toEqual([prompt('first'), prompt('last')])
    expect(reloaded.get('session')?.failedPrompt).toMatchObject({
      content: 'rewritten', uncertain: true,
    })
    expect(recovered.view(reloaded.get('session')!).failedPrompt).toBeUndefined()
    await reloaded.close()
  })

  it('reserves a single preflight before the first asynchronous catalog read', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const began = deferred()
    const gate = deferred()
    const normalizeOnce = vi.fn(async (content: string) => {
      began.resolve()
      await gate.promise
      return content
    })
    const dispatch = vi.fn(accept)
    const first = claims.run('session', target, normalizeOnce, dispatch, idle)
    await began.promise
    await expect(claims.run('session', target, normalizeOnce, dispatch, idle))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(store.get('session')?.queuedDispatch).toBeUndefined()
    expect(normalizeOnce).toHaveBeenCalledTimes(1)
    gate.resolve()
    expect(await first).toMatchObject({ outcome: 'sent' })
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('bounds normalization and never claims or invokes after definitive preflight expiry', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const began = deferred()
    const gate = deferred()
    const dispatch = vi.fn(accept)
    const result = claims.run('session', target, async (text) => {
      began.resolve()
      await gate.promise
      return text
    }, dispatch, idle)
    const refused = expect(result).rejects.toMatchObject({ statusCode: 409 })
    await began.promise
    await vi.advanceTimersByTimeAsync(20_001)
    await refused
    gate.resolve()
    await Promise.resolve()
    expect(dispatch).not.toHaveBeenCalled()
    expect(store.get('session')?.queuedDispatch).toBeUndefined()
    expect(store.get('session')?.queuedPrompts).toEqual([prompt('first'), prompt('middle'), prompt('last')])
  })

  it.each([
    ['plain slash-leading text', undefined, false],
    ['explicitly plain slash-leading text', false, false],
    ['explicit command', true, true],
  ] as const)('preserves the background %s command flag', async (_name, command, expected) => {
    const { store } = await fixture()
    await store.update('session', (session) => {
      session.queuedPrompts = [{
        ...prompt('first'), content: '  /plan verbatim  \n', command,
      }]
    })
    const claims = new QueuedDispatches(store, () => {})
    const normalizer = vi.fn(normalize)
    const dispatch = vi.fn(accept)
    await claims.run('session', undefined, normalizer, dispatch, idle)
    expect(normalizer).toHaveBeenCalledWith('  /plan verbatim  \n', expected)
    expect(dispatch.mock.calls[0][0]).toMatchObject({
      content: '  /plan verbatim  \n', command: expected || undefined,
    })
  })

  it('claims the fresh queue index after reordering during normalization', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const began = deferred()
    const gate = deferred()
    const result = claims.run('session', target, async (text) => {
      began.resolve()
      await gate.promise
      return text
    }, async () => { throw new Error('Preflight refused') }, idle)
    await began.promise
    await store.reorderQueuedPrompts('session', ['last', 'first', 'middle'])
    gate.resolve()
    expect(await result).toMatchObject({ outcome: 'refused', restored: true })
    expect(store.get('session')?.queuedPrompts).toEqual([
      prompt('last'), prompt('first'), prompt('middle'),
    ])
  })

  it.each(['content', 'createdAt', 'command', 'removal'] as const)(
    'does not claim an original whose %s changed during preflight',
    async (change) => {
      const { store } = await fixture()
      const claims = new QueuedDispatches(store, () => {})
      const began = deferred()
      const gate = deferred()
      const dispatch = vi.fn(accept)
      const result = claims.run('session', target, async (text) => {
        began.resolve()
        await gate.promise
        return text
      }, dispatch, idle)
      const refused = expect(result).rejects.toMatchObject({ statusCode: 409 })
      await began.promise
      await store.update('session', (session) => {
        if (change === 'removal') {
          session.queuedPrompts = session.queuedPrompts!.filter((entry) => entry.id !== 'middle')
        } else {
          const original = session.queuedPrompts![1]
          if (change === 'command') original.command = false
          else original[change] = 'changed'
        }
      })
      gate.resolve()
      await refused
      expect(dispatch).not.toHaveBeenCalled()
      expect(store.get('session')?.queuedDispatch).toBeUndefined()
      expect(store.get('session')?.failedPrompt).toBeUndefined()
    },
  )

  it('checks suspension inside the claim transaction rather than trusting an ordered read', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const dispatch = vi.fn(accept)
    await expect(claims.run('session', target, async (text) => {
      await store.setSuspended('session', true)
      return text
    }, dispatch, idle)).rejects.toMatchObject({ statusCode: 409 })
    expect(dispatch).not.toHaveBeenCalled()
    expect(store.get('session')?.queuedPrompts).toHaveLength(3)
  })

  it.each(['write', 'rename'] as const)(
    'refuses a failed claim %s without leaking candidate state or invoking a provider',
    async (phase) => {
      const { store, directory } = await fixture()
      const before = store.get('session')
      const published = vi.fn()
      const claims = new QueuedDispatches(store, published)
      const dispatch = vi.fn(accept)
      vi.mocked(phase === 'write' ? writeFile : rename).mockRejectedValueOnce(new Error('disk full'))
      expect(await claims.run('session', target, normalize, dispatch, idle))
        .toMatchObject({ outcome: 'refused', restored: true })
      expect(dispatch).not.toHaveBeenCalled()
      expect(published).not.toHaveBeenCalled()
      expect(store.get('session')).toEqual(before)
      await store.renameSession('session', 'Later successful write')
      expect(await persisted(directory)).toMatchObject({
        queuedPrompts: [prompt('first'), prompt('middle'), prompt('last')],
      })
      expect((await persisted(directory)).queuedDispatch).toBeUndefined()
      expect((await persisted(directory)).failedPrompt).toBeUndefined()
    },
  )

  it('does not publish or invoke from an uncommitted claim', async () => {
    const { store, directory } = await fixture()
    const published = vi.fn()
    const claims = new QueuedDispatches(store, published)
    const dispatch = vi.fn(accept)
    const write = holdWrite()
    const result = claims.run('session', target, normalize, dispatch, idle)
    await write.began
    expect(store.get('session')?.queuedDispatch).toBeUndefined()
    expect((await persisted(directory)).queuedPrompts).toHaveLength(3)
    expect(published).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    write.release()
    expect(await result).toMatchObject({ outcome: 'sent' })
  })

  it('prepares a turn atomically and restores only its own unchanged placeholders', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const before = store.get('session')!
    const result = await claims.run('session', target, normalize, async (_prompt, delivery) => {
      const prepared = await preparePrompt(
        store, 'session', 'rewritten', 'owned-user', 'owned-assistant', idle, delivery,
      )
      expect(prepared.messages.map((message) => message.id)).toEqual(['owned-user', 'owned-assistant'])
      expect(prepared).toMatchObject({ status: 'running', activity: 'Thinking', title: 'Session' })
      throw new Error('Refused before invocation')
    }, idle)
    expect(result).toMatchObject({ outcome: 'refused', restored: true })
    expect(store.get('session')).toMatchObject({
      title: before.title, status: before.status, updatedAt: before.updatedAt, messages: [],
      queuedPrompts: before.queuedPrompts,
    })
    expect(store.get('session')?.activity).toBeUndefined()
  })

  it('restores a failed preparation without committing any partial user/assistant/status change', async () => {
    const { store, directory } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const before = store.get('session')!
    const result = await claims.run('session', target, normalize, async (_prompt, delivery) => {
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('preparation disk full'))
      await preparePrompt(store, 'session', target.content, 'user', 'assistant', idle, delivery)
      delivery.submit()
    }, idle)
    expect(result).toMatchObject({ outcome: 'refused', restored: true })
    expect(store.get('session')).toMatchObject({
      messages: [], status: 'idle', updatedAt: before.updatedAt,
      queuedPrompts: before.queuedPrompts,
    })
    await store.renameSession('session', 'Unrelated commit')
    expect((await persisted(directory)).messages).toEqual([])
    expect((await persisted(directory)).queuedDispatch).toBeUndefined()
  })

  it('preserves later messages, errors, timestamps and an unrelated failure during rollback', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const newerAt = '2026-09-06T00:00:00.000Z'
    const result = await claims.run('session', target, normalize, async (_prompt, delivery) => {
      await preparePrompt(store, 'session', target.content, 'user', 'assistant', idle, delivery)
      await store.update('session', (session) => {
        session.messages.push({ id: 'other', role: 'notice', content: 'Other work', createdAt: newerAt })
        session.status = 'error'
        session.activity = 'Another operation failed'
        session.updatedAt = newerAt
        session.failedPrompt = { content: 'Unrelated failure', failedAt: newerAt }
        session.queuedPrompts!.push(prompt('new'))
      })
      throw new Error('Refused')
    }, idle)
    expect(result).toMatchObject({ outcome: 'refused' })
    expect(store.get('session')).toMatchObject({
      status: 'error', activity: 'Another operation failed', updatedAt: newerAt,
      messages: [{ id: 'other', content: 'Other work' }],
      failedPrompt: { content: 'Unrelated failure', failedAt: newerAt },
      queuedPrompts: [prompt('first'), prompt('middle'), prompt('last'), prompt('new')],
    })
  })

  it('releases its own Thinking status without undoing a later notice or its timestamp', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const updatedAt = '2026-09-06T00:00:00.000Z'
    const result = await claims.run('session', target, normalize, async (_prompt, delivery) => {
      await preparePrompt(store, 'session', target.content, 'user', 'assistant', idle, delivery)
      await store.addMessage('session', {
        id: 'notice', role: 'notice', content: 'Independent notice', createdAt: updatedAt,
      })
      throw new Error('Definitive preflight refusal')
    }, idle)
    expect(result).toMatchObject({ outcome: 'refused', restored: true })
    expect(store.get('session')).toMatchObject({
      status: 'idle', updatedAt,
      messages: [{ id: 'notice', content: 'Independent notice' }],
    })
  })

  it('keeps accepted work non-runnable when recording the outcome fails', async () => {
    const { store, directory } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const result = await claims.run('session', target, normalize, async (_prompt, delivery) => {
      delivery.submit()
      delivery.accept()
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('outcome disk full'))
    }, idle)
    expect(result).toMatchObject({ outcome: 'uncertain', delivery: 'accepted' })
    expect(result?.session?.queuedPrompts).toEqual([prompt('first'), prompt('middle'), prompt('last')])
    expect(result?.session?.failedPrompt).toBeUndefined()
    expect(await persisted(directory)).toMatchObject({
      queuedPrompts: [prompt('first'), prompt('last')],
      queuedDispatch: { state: 'uncertain', original: prompt('middle') },
      failedPrompt: { content: target.content, uncertain: true },
    })
  })

  it('projects uncertainty even when the outcome-error write also fails', async () => {
    const { store, directory } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const result = await claims.run('session', target, normalize, async (_prompt, delivery) => {
      delivery.submit()
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('outcome cannot be saved'))
      throw new Error('Receipt transport failed')
    }, idle)
    expect(result).toMatchObject({ outcome: 'uncertain', delivery: 'unknown' })
    expect(result?.session?.queuedDispatch?.state).toBe('uncertain')
    expect((await persisted(directory)).queuedDispatch?.state).toBe('dispatching')
    expect((await persisted(directory)).queuedPrompts).toHaveLength(2)
    expect((await persisted(directory)).failedPrompt?.uncertain).toBe(true)
  })

  it('keeps a failed restore claimed rather than making an unsafe queue copy', async () => {
    const { store, directory } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const result = await claims.run('session', target, normalize, async () => {
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('restore disk full'))
      throw new Error('Provider was not invoked')
    }, idle)
    expect(result).toMatchObject({ outcome: 'refused', restored: false })
    expect(result?.session?.queuedDispatch?.state).toBe('uncertain')
    expect((await persisted(directory)).queuedPrompts).toEqual([prompt('first'), prompt('last')])
    expect((await persisted(directory)).failedPrompt?.uncertain).toBe(true)
    await expect(claims.run('session', target, normalize, accept, idle))
      .rejects.toMatchObject({ statusCode: 409 })
  })

  it.each([false, true])('settles timeout conservatively (provider invoked: %s)', async (submitted) => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const began = deferred()
    const gate = deferred()
    const continued = deferred()
    const invoked = vi.fn()
    const result = claims.run('session', target, normalize, async (_prompt, delivery) => {
      if (submitted) {
        delivery.submit()
        invoked()
      }
      began.resolve()
      await gate.promise
      try {
        if (!submitted) {
          delivery.submit()
          invoked()
        }
        delivery.accept()
      } finally {
        continued.resolve()
      }
    }, idle)
    await began.promise
    await vi.advanceTimersByTimeAsync(20_001)
    expect(await result).toMatchObject(submitted
      ? { outcome: 'uncertain', delivery: 'unknown' }
      : { outcome: 'refused', restored: true })
    gate.resolve()
    await continued.promise
    expect(invoked).toHaveBeenCalledTimes(submitted ? 1 : 0)
    expect(Boolean(store.get('session')?.queuedDispatch)).toBe(submitted)
  })

  it('requires exact fresh discard acknowledgement without resending or cancelling work', async () => {
    const { store, directory } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const dispatch = vi.fn(async (_prompt, delivery) => {
      delivery.submit()
      throw new Error('Lost receipt')
    })
    const result = await claims.run('session', target, normalize, dispatch, idle)
    for (const acknowledgement of [undefined, 'older-attempt']) {
      await expect(claims.discard('session', 'middle', acknowledgement))
        .rejects.toMatchObject({ statusCode: 409 })
    }
    await expect(claims.discard('session', 'first', result?.attemptId))
      .rejects.toMatchObject({ statusCode: 409 })
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('discard write failed'))
    await expect(claims.discard('session', 'middle', result?.attemptId)).rejects.toThrow('discard write failed')
    expect((await persisted(directory)).queuedDispatch).toBeDefined()
    const discarded = await claims.discard('session', 'middle', result?.attemptId)
    expect(discarded?.queuedPrompts).toEqual([prompt('first'), prompt('last')])
    expect(discarded?.queuedDispatch).toBeUndefined()
    expect(discarded?.failedPrompt).toBeUndefined()
    expect(dispatch).toHaveBeenCalledTimes(1)
    await expect(claims.discard('session', 'first', result?.attemptId))
      .rejects.toMatchObject({ statusCode: 409 })
  })

  it('refuses discard while a live attempt owns the claim', async () => {
    const { store } = await fixture()
    const claims = new QueuedDispatches(store, () => {})
    const began = deferred()
    const gate = deferred()
    const pending = claims.run('session', target, normalize, async (_prompt, delivery) => {
      delivery.submit()
      began.resolve()
      await gate.promise
      delivery.accept()
    }, idle)
    await began.promise
    await expect(claims.discard('session', 'middle', store.get('session')?.queuedDispatch?.attemptId))
      .rejects.toMatchObject({ statusCode: 409 })
    gate.resolve()
    await pending
  })

  it.each(['content', 'failedAt', 'uncertain'] as const)(
    'hides and clears only its exact legacy recovery marker (%s differs)',
    async (field) => {
      const { store } = await fixture()
      const claims = new QueuedDispatches(store, () => {})
      const result = await claims.run('session', target, normalize, async (_prompt, delivery) => {
        delivery.submit()
        throw new Error('Unknown receipt')
      }, idle)
      await store.update('session', (session) => {
        if (field === 'uncertain') session.failedPrompt!.uncertain = false
        else session.failedPrompt![field] = 'different'
      })
      const marker = store.get('session')?.failedPrompt
      expect(claims.view(store.get('session')!).failedPrompt).toEqual(marker)
      await claims.discard('session', 'middle', result?.attemptId)
      expect(store.get('session')?.failedPrompt).toEqual(marker)
    },
  )
})
