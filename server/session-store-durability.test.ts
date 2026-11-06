import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import { SessionStore } from './session-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...fs,
    writeFile: vi.fn(fs.writeFile),
    rename: vi.fn(fs.rename),
    rm: vi.fn(fs.rm),
  }
})

const disk = await vi.importActual<typeof import('node:fs/promises')>(
  'node:fs/promises',
)
const fixtures: { directory: string; store: SessionStore }[] = []
const releases: (() => void)[] = []
const timestamp = '2026-09-04T00:00:00.000Z'

function prompt(id: string) {
  return { id, content: id, createdAt: timestamp }
}

function session(id = 'session'): SessionDetail {
  return {
    id,
    cwd: '/project',
    title: id,
    updatedAt: timestamp,
    status: 'idle',
    isOpen: false,
    messages: [{
      id: 'assistant',
      role: 'assistant',
      content: 'Hello',
      createdAt: timestamp,
      streaming: false,
    }],
    queuedPrompts: [prompt('first'), prompt('second')],
    queuedCount: 2,
    runtime: { model: 'before' },
    failedPrompt: { content: 'Earlier failure', failedAt: timestamp },
  }
}

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'store-durability-'))
  const store = new SessionStore(directory)
  fixtures.push({ directory, store })
  await store.initialize()
  await store.create(session(), { backend: 'sdk' })
  vi.mocked(writeFile).mockClear()
  vi.mocked(rename).mockClear()
  return {
    store,
    directory,
    contents: () => readFile(path.join(directory, 'state.json'), 'utf8'),
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

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
  vi.mocked(rm).mockReset().mockImplementation(disk.rm)
})

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.allSettled(fixtures.map(({ store }) => store.flush()))
  await Promise.all(
    fixtures.splice(0).map(({ directory }) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
  vi.restoreAllMocks()
})

describe('Durable queue claims', () => {
  async function ready() {
    const setup = await fixture()
    await setup.store.clearFailedPrompt('session')
    return setup
  }

  it('keeps reserved SDK work in FIFO until its complete turn record is durable', async () => {
    const { store, directory, contents } = await ready()
    const { reservation } = await store.reserveQueuedPrompt('session', () => true)
    expect(reservation?.prompt).toEqual(prompt('first'))
    expect(store.get('session')).not.toHaveProperty('queuedPromptReservation')
    const before = store.get('session')
    const gate = holdWrite()
    const admission = store.beginPrompt('session', 'first', 'new-assistant', () => true, reservation)
    const refused = expect(admission).rejects.toThrow('Admission write refused')
    await gate.started
    expect(store.get('session')).toEqual(before)
    gate.fail(new Error('Admission write refused'))
    await refused
    expect(store.get('session')).toEqual(before)
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.queuedPrompts).toEqual([prompt('first'), prompt('second')])
    expect(reloaded.get('session')?.messages).toEqual(before?.messages)
    const retry = await store.reserveQueuedPrompt('session', () => true)
    vi.mocked(writeFile).mockClear()
    const admitted = await store.beginPrompt('session', 'first', 'new-assistant', () => true, retry.reservation)
    expect(writeFile).toHaveBeenCalledOnce()
    expect(admitted).toMatchObject({ status: 'running', queuedCount: 1, queuedPrompts: [prompt('second')] })
    expect(admitted.messages.slice(-2)).toEqual([
      expect.objectContaining({ role: 'user', content: 'first' }),
      expect.objectContaining({ id: 'new-assistant', role: 'assistant', streaming: true }),
    ])
    const persisted = JSON.parse(await contents()).sessions.session
    expect(persisted.queuedPromptReservation).toBeUndefined()
    expect(persisted.messages).toEqual(admitted.messages)
    expect(persisted.queuedPrompts).toEqual([prompt('second')])
  })

  it.each(['edit', 'remove', 'reorder'] as const)('refuses a reserved SDK turn after a queue %s', async (change) => {
    const { store } = await ready()
    const { reservation } = await store.reserveQueuedPrompt('session', () => true)
    await store.update('session', (session) => {
      if (change === 'edit') session.queuedPrompts![0].content = 'Edited by another reader'
      if (change === 'remove') session.queuedPrompts!.shift()
      if (change === 'reorder') session.queuedPrompts!.reverse()
      session.queuedCount = session.queuedPrompts!.length
    })
    const before = store.get('session')
    await expect(store.beginPrompt('session', 'first', 'new-assistant', () => true, reservation))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(store.get('session')).toEqual(before)
  })

  it('lets only the current SDK reservation admit the matching FIFO head', async () => {
    const { store } = await ready()
    const old = await store.reserveQueuedPrompt('session', () => true)
    const current = await store.reserveQueuedPrompt('session', () => true)
    await expect(store.beginPrompt('session', 'first', 'old-assistant', () => true, old.reservation))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(store.get('session')?.queuedCount).toBe(2)
    await store.beginPrompt('session', 'first', 'current-assistant', () => true, current.reservation)
    expect(store.get('session')?.messages.some((message) => message.id === 'old-assistant')).toBe(false)
    expect(store.get('session')?.queuedPrompts).toEqual([prompt('second')])
  })

  it('keeps an unstamped legacy recovery visible', async () => {
    const { store, directory, contents } = await fixture()
    const state = JSON.parse(await contents())
    delete state.sessions.session.failedPrompt.failedAt
    await disk.writeFile(path.join(directory, 'state.json'), JSON.stringify(state))
    await store.initialize()
    expect(store.get('session')?.failedPrompt?.content).toBe('Earlier failure')
  })

  it('holds the exact head privately until the claim commits', async () => {
    const { store, contents } = await ready()
    const before = store.get('session')
    const gate = holdWrite()
    const claiming = store.claimTerminalQueuedPrompt('session', prompt('first'), () => true)
    await gate.started
    expect(store.get('session')).toEqual(before)
    expect(store.terminalQueueDispatch('session')).toBeUndefined()
    gate.finish()
    const { session: claimed, dispatch } = await claiming
    expect(claimed).not.toHaveProperty('terminalQueueDispatch')
    expect(claimed.terminalQueueDispatchPending).toBe(true)
    expect(claimed.failedPrompt).toBeUndefined()
    expect(claimed).toMatchObject({ status: 'running', queuedPrompts: [prompt('second')], queuedCount: 1 })
    expect(store.terminalQueueDispatch('session')).toEqual(dispatch)
    expect(JSON.parse(await contents()).sessions.session).toMatchObject({
      terminalQueueDispatch: dispatch,
      failedPrompt: { content: 'first', failedAt: dispatch.startedAt, uncertain: true },
    })
  })

  it.each(['identity', 'content', 'command', 'time', 'owner'] as const)(
    'does not claim a stale queue %s',
    async (changed) => {
      const { store } = await ready()
      const expected = {
        ...prompt('first'),
        ...(changed === 'identity' ? { id: 'second' } : {}),
        ...(changed === 'content' ? { content: 'Changed' } : {}),
        ...(changed === 'command' ? { command: true } : {}),
        ...(changed === 'time' ? { createdAt: '2026-09-05T00:00:00.000Z' } : {}),
      }
      await expect(store.claimTerminalQueuedPrompt('session', expected, () => changed !== 'owner'))
        .rejects.toThrow('nothing was sent')
      expect(store.get('session')?.queuedCount).toBe(2)
    },
  )

  it('prevents generic recovery operations from consuming an active claim', async () => {
    const { store } = await ready()
    const { dispatch } = await store.claimTerminalQueuedPrompt('session', prompt('first'), () => true)
    await expect(store.clearFailedPrompt('session')).rejects.toMatchObject({ statusCode: 409 })
    await expect(store.enqueueAnsweringPrompt('session', prompt('retry'), dispatch.startedAt))
      .rejects.toMatchObject({ statusCode: 409 })
    await expect(store.setFailedPrompt('session', 'second', 'Overwrite')).rejects.toMatchObject({ statusCode: 409 })
    expect(store.terminalQueueDispatch('session')).toEqual(dispatch)
    expect(store.get('session')?.queuedPrompts).toEqual([prompt('second')])
  })

  it('keeps newer native permission state when settling a delivered turn', async () => {
    const { store } = await ready()
    const { dispatch } = await store.claimTerminalQueuedPrompt('session', prompt('first'), () => true)
    await store.update('session', (session) => {
      session.status = 'waiting'
      session.pendingPermission = {
        requestId: 'permission', title: 'Native permission', kind: 'shell', options: [],
      }
      session.activity = 'Native permission'
    })
    const settled = await store.settleTerminalQueuedPrompt('session', dispatch.id, { kind: 'accepted', startedTurn: true })
    expect(settled).toMatchObject({
      status: 'waiting', activity: 'Native permission', pendingPermission: { requestId: 'permission' },
    })
    expect(settled.failedPrompt).toBeUndefined()
  })

  it('does not resurrect recovery settled by an older runtime', async () => {
    const { store, directory, contents } = await ready()
    await store.claimTerminalQueuedPrompt('session', prompt('first'), () => true)
    const state = JSON.parse(await contents())
    delete state.sessions.session.failedPrompt
    await disk.writeFile(path.join(directory, 'state.json'), JSON.stringify(state))
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.terminalQueueDispatch('session')).toBeUndefined()
    expect(reloaded.get('session')?.failedPrompt).toBeUndefined()
    expect(reloaded.get('session')?.queuedPrompts).toEqual([prompt('second')])
  })
})

describe('SessionStore durability', () => {
  const changes: [string, (store: SessionStore) => Promise<unknown>][] = [
    ['reorder', (store) => store.reorderQueuedPrompts('session', ['second', 'first'])],
    ['enqueue', (store) => store.enqueuePrompt('session', prompt('third'))],
    ['queue removal', (store) => store.removeQueuedPrompt('session', 'first')],
    ['queue shift', (store) => store.shiftQueuedPrompt('session')],
    ['session removal', (store) => store.remove('session')],
    ['creation', (store) => store.create(session('new'))],
    ['lineage creation', (store) => store.create({ ...session('replacement'), replacedSessionIds: ['session'] })],
    ['replacement', (store) => store.replaceWithClearedSession('session', 'new')],
    ['discovery', (store) => store.syncDiscovered([
      { id: 'session', cwd: '/new', title: 'Discovered', updatedAt: timestamp },
      { id: 'new', cwd: '/new', title: 'New', updatedAt: timestamp },
    ])],
    ['open state', (store) => store.syncOpen(['session'])],
    ['backend', (store) => store.syncBackends(['session'], [])],
    ['failed prompt', (store) => store.setFailedPrompt('session', 'first', 'First')],
    ['failure acknowledgement', (store) => store.clearFailedPrompt('session')],
    ['answering enqueue', (store) =>
      store.enqueueAnsweringPrompt('session', prompt('third'), timestamp)],
    ['nested mutation', (store) => store.update('session', (stored) => {
      stored.runtime!.model = 'refused'
      stored.messages[0].content = 'refused'
      stored.queuedPrompts![0].content = 'refused'
    })],
  ]

  it.each(changes)('does not expose a pending or rejected %s', async (_name, change) => {
    const { store, directory, contents } = await fixture()
    const before = store.list()
    const onDisk = await contents()
    const gate = holdWrite()
    const result = change(store)
    const rejected = expect(result).rejects.toThrow('disk full')
    await gate.started
    try {
      expect(store.list()).toEqual(before)
      expect(store.get('session')).toEqual(before[0])
      expect(store.get('new')).toBeUndefined()
      expect(store.isRetiredSession('session')).toBe(false)
      expect(store.backend('session')).toBe('sdk')
      expect(store.terminalRecoverySessions()).toEqual([])
      expect(await contents()).toBe(onDisk)
    } finally {
      gate.fail(new Error('disk full'))
      await rejected
    }
    expect(store.list()).toEqual(before)
    expect(store.isRetiredSession('session')).toBe(false)
    expect(await contents()).toBe(onDisk)
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.list()).toEqual(before)
    expect(reloaded.isRetiredSession('session')).toBe(false)
  })

  it('persists retirement independently of the last descendant and rejects stale admission', async () => {
    const { store, contents } = await fixture()
    await store.replaceWithClearedSession('session', 'replacement')
    await store.remove('replacement')
    expect(JSON.parse(await contents()).retiredSessionIds).toEqual(['session', 'replacement'])
    await store.syncDiscovered(['session', 'replacement', 'new'].map((id) => ({
      id, cwd: '/project', title: id, updatedAt: timestamp,
    })))
    expect(store.list().map(({ id }) => id)).toEqual(['new'])
    await expect(store.create(session())).rejects.toThrow('identity has been retired')
    await expect(store.replaceWithClearedSession('new', 'session'))
      .rejects.toThrow('Replacement session identity is not available')
    expect(store.get('new')).toBeDefined()
    await store.remove('unknown')
    expect(store.isRetiredSession('unknown')).toBe(false)
    await expect(store.create(session('unknown'))).resolves.toMatchObject({ id: 'unknown' })
  })

  it('indexes legacy lineage without rewriting the file and retains it after deletion', async () => {
    const { directory } = await fixture()
    const filename = path.join(directory, 'state.json')
    const legacy = JSON.stringify({
      version: 1,
      sessions: { descendant: { ...session('descendant'), replacedSessionIds: ['ancestor'] } },
    })
    await disk.writeFile(filename, legacy)
    const loaded = new SessionStore(directory)
    await loaded.initialize()
    expect(await readFile(filename, 'utf8')).toBe(legacy)
    expect(loaded.isRetiredSession('ancestor')).toBe(true)
    await loaded.remove('descendant')
    const restarted = new SessionStore(directory)
    await restarted.initialize()
    expect(restarted.isRetiredSession('ancestor')).toBe(true)
    expect(restarted.isRetiredSession('descendant')).toBe(true)
    await restarted.syncDiscovered(['ancestor', 'descendant'].map((id) => ({
      id, cwd: '/project', title: id, updatedAt: timestamp,
    })))
    expect(restarted.list()).toEqual([])
  })

  it('does not expose or recover a cached row whose identity is already retired', async () => {
    const { directory } = await fixture()
    await disk.writeFile(path.join(directory, 'state.json'), JSON.stringify({
      version: 1,
      retiredSessionIds: ['retired'],
      sessions: {
        retired: { ...session('retired'), backend: 'terminal', managedOpen: true },
        active: session('active'),
      },
    }))
    const loaded = new SessionStore(directory)
    await loaded.initialize()
    expect(loaded.get('retired')).toBeUndefined()
    expect(loaded.backend('retired')).toBeUndefined()
    expect(loaded.list().map(({ id }) => id)).toEqual(['active'])
    expect(loaded.terminalRecoverySessions()).toEqual([])
    await expect(loaded.readAfterWrites('retired')).rejects.toThrow('does not exist')
    await expect(loaded.renameSession('retired', 'Must not return')).rejects.toThrow('does not exist')
    await expect(loaded.updateIf('retired', () => true)).rejects.toThrow('does not exist')
    expect(() => loaded.streamMessage('retired', 'assistant', 'Must not return')).toThrow('does not exist')
  })

  it.each([
    { retiredSessionIds: null },
    { retiredSessionIds: 'retired' },
    { retiredSessionIds: [''] },
  ])('refuses malformed retirement metadata: $retiredSessionIds', async ({ retiredSessionIds }) => {
    const { directory } = await fixture()
    await disk.writeFile(path.join(directory, 'state.json'), JSON.stringify({
      version: 1, sessions: {}, retiredSessionIds,
    }))
    await expect(new SessionStore(directory).initialize()).rejects.toThrow('Unsupported Agentic Remote state format')
  })

  it('separates a lineage creation from writes whose identity it retires', async () => {
    const { store } = await fixture()
    const gate = holdWrite()
    const first = store.renameSession('session', 'Before retirement')
    await gate.started
    const creating = store.create({ ...session('replacement'), replacedSessionIds: ['session'] })
    const later = expect(store.renameSession('session', 'After retirement')).rejects.toThrow('does not exist')
    gate.finish()
    await expect(first).resolves.toMatchObject({ id: 'session', title: 'Before retirement' })
    await expect(creating).resolves.toMatchObject({ id: 'replacement' })
    await later
    expect(store.list().map(({ id }) => id)).toEqual(['replacement'])
  })

  it('closes across queued destructive boundaries without stranding admitted callers', async () => {
    const { store, directory } = await fixture()
    const gate = holdWrite()
    const first = store.renameSession('session', 'First committed title')
    await gate.started
    const replacing = store.replaceWithClearedSession('session', 'replacement')
    const renaming = store.renameSession('replacement', 'Final committed title')
    const closing = store.close()
    await expect(store.renameSession('replacement', 'Too late'))
      .rejects.toThrow('Session store is closed')
    gate.finish()
    await Promise.all([first, replacing, renaming, closing])
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')).toBeUndefined()
    expect(reloaded.get('replacement')?.title).toBe('Final committed title')
  })

  it('checkpoints volatile text on close and ignores later live changes', async () => {
    const { store, directory } = await fixture()
    store.setMessageContent('session', 'assistant', 'Stream received before closing')
    await store.close()
    const closed = store.get('session')
    store.setMessageContent('session', 'assistant', 'Too late')
    expect(store.get('session')).toEqual(closed)
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.messages[0].content)
      .toBe('Stream received before closing')
  })

  it('waits for admitted file writes and refuses uploads after close begins', async () => {
    const { store } = await fixture()
    const gate = holdWrite()
    const upload = store.saveUpload('session', 'held.txt', Buffer.from('Owned upload'))
    await gate.started
    let finished = false
    const closing = store.close().then(() => { finished = true })
    await expect(store.saveUpload('session', 'late.txt', Buffer.from('Too late')))
      .rejects.toThrow('Session store is closed')
    await Promise.resolve()
    expect(finished).toBe(false)
    gate.finish()
    const saved = await upload
    await closing
    expect(await readFile(saved.path, 'utf8')).toBe('Owned upload')
  })

  it('does not report a successful close when an admitted checkpoint fails', async () => {
    const { store } = await fixture()
    const gate = holdWrite()
    const mutation = store.renameSession('session', 'Not committed')
    const refusedMutation = expect(mutation).rejects.toThrow('Closing write failed')
    await gate.started
    const refusedClose = expect(store.close()).rejects.toThrow('Closing write failed')
    gate.fail(new Error('Closing write failed'))
    await Promise.all([refusedMutation, refusedClose])
    expect(store.get('session')?.title).toBe('session')
  })

  it('isolates a validation failure even after its callback changed nested data', async () => {
    const { store, contents } = await fixture()
    const before = store.get('session')
    const onDisk = await contents()
    await expect(store.update('session', (stored) => {
      stored.queuedPrompts!.reverse()
      stored.messages[0].content = 'not installed'
      throw new Error('invalid mutation')
    })).rejects.toThrow('invalid mutation')
    expect(store.get('session')).toEqual(before)
    expect(await contents()).toBe(onDisk)
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('rejects the whole coalesced write without installing any of its mutations', async () => {
    const { store, contents } = await fixture()
    const before = store.get('session')
    const onDisk = await contents()
    const gate = holdWrite()
    const results = [
      store.reorderQueuedPrompts('session', ['second', 'first']),
      store.enqueuePrompt('session', prompt('third')),
      store.removeQueuedPrompt('session', 'first'),
    ]
    const rejected = results.map((result) => expect(result).rejects.toThrow('disk full'))
    await gate.started
    gate.fail(new Error('disk full'))
    await Promise.all(rejected)
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(store.get('session')).toEqual(before)
    expect(await contents()).toBe(onDisk)
  })

  it('rebases a later batch on committed state after an earlier write fails', async () => {
    const { store, contents } = await fixture()
    const first = holdWrite()
    const reorder = store.reorderQueuedPrompts('session', ['second', 'first'])
    const rejected = expect(reorder).rejects.toThrow('disk full')
    await first.started
    const second = holdWrite()
    const enqueue = store.enqueuePrompt('session', prompt('third'))
    const renameSession = store.renameSession('session', 'Accepted')
    first.fail(new Error('disk full'))
    await rejected
    await second.started
    try {
      expect(store.get('session')?.title).toBe('session')
      expect(store.get('session')?.queuedPrompts?.map(({ id }) => id))
        .toEqual(['first', 'second'])
    } finally {
      second.finish()
    }
    await Promise.all([enqueue, renameSession])
    const persisted = JSON.parse(await contents()).sessions.session
    expect(persisted.title).toBe('Accepted')
    expect(persisted.queuedPrompts.map(({ id }: { id: string }) => id))
      .toEqual(['first', 'second', 'third'])
    expect(store.get('session')?.queuedPrompts).toEqual(persisted.queuedPrompts)
    expect(writeFile).toHaveBeenCalledTimes(2)
  })

  it('keeps successful awaited mutations durable on each side of the snapshot boundary', async () => {
    const { store, contents } = await fixture()
    const first = holdWrite()
    const renameSession = store.renameSession('session', 'Accepted')
    await first.started
    const second = holdWrite()
    let enqueued = false
    const enqueue = store.enqueuePrompt('session', prompt('third')).then((value) => {
      enqueued = true
      return value
    })
    first.finish()
    await renameSession
    await second.started
    try {
      const persisted = JSON.parse(await contents()).sessions.session
      expect(persisted.title).toBe('Accepted')
      expect(persisted.queuedPrompts).toHaveLength(2)
      expect(store.get('session')?.queuedPrompts).toHaveLength(2)
      expect(enqueued).toBe(false)
    } finally {
      second.finish()
    }
    await enqueue
    expect(JSON.parse(await contents()).sessions.session.queuedPrompts).toHaveLength(3)
    expect(await contents()).not.toContain('\n')
    expect(writeFile).toHaveBeenCalledTimes(2)
  })

  it('keeps an earlier committed batch when the following batch fails', async () => {
    const { store, contents } = await fixture()
    const first = holdWrite()
    const accepted = store.renameSession('session', 'Accepted')
    await first.started
    const second = holdWrite()
    const rejected = expect(store.enqueuePrompt('session', prompt('third')))
      .rejects.toThrow('disk full')
    first.finish()
    await accepted
    await second.started
    second.fail(new Error('disk full'))
    await rejected
    expect(store.get('session')?.title).toBe('Accepted')
    expect(store.get('session')?.queuedPrompts?.map(({ id }) => id))
      .toEqual(['first', 'second'])
    const persisted = JSON.parse(await contents()).sessions.session
    expect(persisted.title).toBe('Accepted')
    expect(persisted.queuedPrompts).toEqual(store.get('session')?.queuedPrompts)
  })

  it.each([false, true])(
    'keeps streaming separate from a pending mutation (write failure: %s)',
    async (fail) => {
      const { store, contents } = await fixture()
      const gate = holdWrite()
      const reorder = store.update('session', (stored) => stored.queuedPrompts!.reverse())
      const settled = fail
        ? expect(reorder).rejects.toThrow('disk full')
        : expect(reorder).resolves.toMatchObject({
            queuedPrompts: [prompt('second'), prompt('first')],
          })
      await gate.started
      let streamed: SessionDetail
      try {
        store.streamMessage('session', 'assistant', ' world')
        streamed = store.setMessageContent('session', 'assistant', 'Hello world!')
        expect(streamed.messages[0].content).toBe('Hello world!')
        expect(streamed.queuedPrompts?.map(({ id }) => id)).toEqual(['first', 'second'])
        expect(store.get('session')?.queuedPrompts).toEqual(streamed.queuedPrompts)
        expect(JSON.parse(await contents()).sessions.session.messages[0].content).toBe('Hello')
        expect(writeFile).toHaveBeenCalledTimes(1)
      } finally {
        if (fail) gate.fail(new Error('disk full'))
        else gate.finish()
        await settled
      }
      expect(store.get('session')?.messages[0].content).toBe('Hello world!')
      if (!fail) {
        expect(store.get('session')!.revision).toBeGreaterThan(streamed.revision!)
      }
      await store.finishMessage('session', 'assistant')
      const persisted = JSON.parse(await contents()).sessions.session
      expect(persisted.messages[0].content).toBe('Hello world!')
      expect(persisted.queuedPrompts.map(({ id }: { id: string }) => id))
        .toEqual(fail ? ['first', 'second'] : ['second', 'first'])
    },
  )

  it('keeps deltas after a queued transcript replacement even before its write starts', async () => {
    const { store } = await fixture()
    const gate = holdWrite()
    const first = store.renameSession('session', 'Accepted')
    await gate.started
    const replacement = store.replaceMessages('session', [{
      ...session().messages[0],
      content: 'From the transcript',
    }])
    store.streamMessage('session', 'assistant', ' plus a live delta')
    gate.finish()
    await Promise.all([first, replacement])
    expect(store.get('session')?.messages[0].content)
      .toBe('From the transcript plus a live delta')
  })

  it('orders synchronous deltas with mutations queued in the same turn', async () => {
    const { store, contents } = await fixture()
    const updating = store.update('session', (stored) => {
      stored.messages[0].content = stored.messages[0].content.toUpperCase()
    })
    store.streamMessage('session', 'assistant', ' world')
    await updating
    expect(store.get('session')?.messages[0].content).toBe('HELLO world')
    expect(JSON.parse(await contents()).sessions.session.messages[0].content)
      .toBe('HELLO world')
  })

  it('retains only live deltas from a failed batch and checkpoints them once', async () => {
    const { store, contents } = await fixture()
    const gate = holdWrite()
    const rejected = expect(store.update('session', (stored) => {
      stored.messages[0].content = 'refused'
      stored.queuedPrompts!.reverse()
    })).rejects.toThrow('disk full')
    store.streamMessage('session', 'assistant', ' before')
    await gate.started
    store.streamMessage('session', 'assistant', ' after')
    gate.fail(new Error('disk full'))
    await rejected
    expect(store.get('session')?.messages[0].content).toBe('Hello before after')
    await store.finishMessage('session', 'assistant')
    const persisted = JSON.parse(await contents()).sessions.session
    expect(persisted.messages[0].content).toBe('Hello before after')
    expect(persisted.queuedPrompts.map(({ id }: { id: string }) => id))
      .toEqual(['first', 'second'])
  })

  it('preserves streaming through an unrelated session write', async () => {
    const { store, contents } = await fixture()
    await store.create(session('other'))
    const gate = holdWrite()
    const updating = store.renameSession('other', 'Accepted')
    await gate.started
    store.streamMessage('session', 'assistant', ' world')
    gate.finish()
    await updating
    expect(store.get('session')?.messages[0].content).toBe('Hello world')
    expect(JSON.parse(await contents()).sessions.session.messages[0].content).toBe('Hello')
    await store.finishMessage('session', 'assistant')
    expect(JSON.parse(await contents()).sessions.session.messages[0].content).toBe('Hello world')
  })

  it('keeps live deltas when validation rejects the only durable mutation', async () => {
    const { store, contents } = await fixture()
    const rejected = expect(store.update('session', (stored) => {
      stored.messages[0].content = 'refused'
      throw new Error('invalid')
    })).rejects.toThrow('invalid')
    store.streamMessage('session', 'assistant', ' world')
    await rejected
    expect(writeFile).not.toHaveBeenCalled()
    await store.finishMessage('session', 'assistant')
    expect(JSON.parse(await contents()).sessions.session.messages[0].content).toBe('Hello world')
  })

  it('coalesces live tokens without writing or retaining a history snapshot per token', async () => {
    const { store, contents } = await fixture()
    for (let index = 0; index < 100; index += 1) {
      store.streamMessage('session', 'assistant', '.')
    }
    await store.readAfterWrites('session')
    expect(writeFile).not.toHaveBeenCalled()
    expect((store as unknown as { pendingChanges: unknown[] }).pendingChanges)
      .toEqual([{
        kind: 'append',
        sessionId: 'session',
        messageId: 'assistant',
        content: '.'.repeat(100),
        updatedAt: expect.any(String),
        revisions: 100,
      }])
    await store.finishMessage('session', 'assistant')
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(JSON.parse(await contents()).sessions.session.messages[0].content)
      .toBe(`Hello${'.'.repeat(100)}`)
  })

  it('rejects coalesced mutations in different sessions together', async () => {
    const { store, contents } = await fixture()
    const before = store.list()
    const onDisk = await contents()
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
    await Promise.all([
      expect(store.create(session('other'))).rejects.toThrow('disk full'),
      expect(store.enqueuePrompt('session', prompt('third'))).rejects.toThrow('disk full'),
    ])
    expect(store.list()).toEqual(before)
    expect(await contents()).toBe(onDisk)
    expect(writeFile).toHaveBeenCalledTimes(1)
  })

  it('does not install a snapshot when the atomic rename fails', async () => {
    const { store, contents } = await fixture()
    const before = store.get('session')
    const onDisk = await contents()
    vi.mocked(rename).mockRejectedValueOnce(new Error('rename failed'))
    await expect(store.enqueuePrompt('session', prompt('third')))
      .rejects.toThrow('rename failed')
    expect(store.get('session')).toEqual(before)
    expect(await contents()).toBe(onDisk)
    await store.enqueuePrompt('session', prompt('fourth'))
    expect(JSON.parse(await contents()).sessions.session.queuedPrompts.map(
      ({ id }: { id: string }) => id,
    )).toEqual(['first', 'second', 'fourth'])
  })

  it('does not leak a failed validation into other coalesced mutations', async () => {
    const { store, contents } = await fixture()
    const enqueue = store.enqueuePrompt('session', prompt('third'))
    const rejected = expect(store.update('session', (stored) => {
      stored.queuedPrompts!.reverse()
      stored.messages[0].content = 'refused'
      throw new Error('invalid')
    })).rejects.toThrow('invalid')
    const remove = store.removeQueuedPrompt('session', 'second')
    await Promise.all([enqueue, rejected, remove])
    const persisted = JSON.parse(await contents()).sessions.session
    expect(persisted.queuedPrompts.map(({ id }: { id: string }) => id))
      .toEqual(['first', 'third'])
    expect(persisted.messages[0].content).toBe('Hello')
    expect(writeFile).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['open state', (store: SessionStore) => store.syncOpen(['session'])],
    ['backend', (store: SessionStore) => store.syncBackends(['session'], [])],
    ['discovery', (store: SessionStore) => store.syncDiscovered([
      { id: 'session', cwd: '/new', title: 'Discovered', updatedAt: timestamp },
    ])],
  ] as const)('applies a live delta only once during a %s write', async (_name, change) => {
    const { store } = await fixture()
    const gate = holdWrite()
    const writing = change(store)
    await gate.started
    const streamed = store.streamMessage('session', 'assistant', ' world')
    gate.finish()
    await writing
    expect(streamed.messages[0].content).toBe('Hello world')
    expect(store.get('session')?.messages[0].content).toBe('Hello world')
    expect(store.get('session')!.revision).toBeGreaterThan(streamed.revision!)
  })

  it('does not resurrect a cleared message or publish an older revision than its deltas', async () => {
    const { store } = await fixture()
    const gate = holdWrite()
    const clearing = store.clearConversation('session')
    await gate.started
    store.streamMessage('session', 'assistant', ' world')
    const streamed = store.streamMessage('session', 'assistant', '!')
    gate.finish()
    const cleared = await clearing
    expect(cleared.messages).toEqual([])
    expect(cleared.revision).toBeGreaterThan(streamed.revision!)
    expect(store.get('session')).toEqual(cleared)
  })

  it('does not install an unserializable mutation', async () => {
    const { store, contents } = await fixture()
    const before = store.get('session')
    const onDisk = await contents()
    await expect(store.update('session', (stored) => {
      Object.assign(stored.runtime!, { invalid: 1n })
    })).rejects.toThrow()
    expect(store.get('session')).toEqual(before)
    expect(await contents()).toBe(onDisk)
    await store.renameSession('session', 'Accepted')
    expect(JSON.parse(await contents()).sessions.session.runtime).toEqual({ model: 'before' })
  })

  it.each([
    ['remove', (store: SessionStore) => store.remove('session')],
    ['replace', (store: SessionStore) => store.replaceWithClearedSession('session', 'new')],
  ] as const)('keeps uploads when a session %s cannot commit', async (_name, change) => {
    const { store } = await fixture()
    const uploaded = await store.saveUpload('session', 'notes.txt', Buffer.from('Keep me'))
    vi.mocked(rename).mockRejectedValueOnce(new Error('rename failed'))
    await expect(change(store)).rejects.toThrow('rename failed')
    expect(await readFile(uploaded.path, 'utf8')).toBe('Keep me')
    expect(store.get('session')).toBeDefined()
    expect(store.get('new')).toBeUndefined()
  })

  it('distinguishes upload cleanup failure from a rejected replacement write', async () => {
    const { store, contents } = await fixture()
    const uploaded = await store.saveUpload('session', 'notes.txt', Buffer.from('Retained upload'))
    const failure = new Error('Upload cleanup refused')
    vi.mocked(rm).mockRejectedValueOnce(failure)
    await expect(store.replaceWithClearedSession('session', 'replacement')).rejects.toMatchObject({
      name: 'SessionReplacementCleanupError',
      replacement: { id: 'replacement', replacedSessionIds: ['session'] },
      cause: failure,
    })
    expect(store.get('session')).toBeUndefined()
    expect(JSON.parse(await contents()).sessions.replacement.id).toBe('replacement')
    expect(await readFile(uploaded.path, 'utf8')).toBe('Retained upload')
  })

  it('selects each shifted head within its transaction', async () => {
    const { store, contents } = await fixture()
    const [first, second] = await Promise.all([
      store.shiftQueuedPrompt('session'),
      store.shiftQueuedPrompt('session'),
    ])
    expect(first.prompt?.id).toBe('first')
    expect(second.prompt?.id).toBe('second')
    expect(JSON.parse(await contents()).sessions.session.queuedPrompts).toEqual([])
    expect(writeFile).toHaveBeenCalledTimes(1)
  })

  it('reports the latest failed write from flush', async () => {
    const { store } = await fixture()
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
    await expect(store.enqueuePrompt('session', prompt('third'))).rejects.toThrow('disk full')
    await expect(store.flush()).rejects.toThrow('disk full')
  })

  it.each([
    ['replacement', (store: SessionStore) => store.replaceWithClearedSession('session', 'replacement')],
    ['removal', (store: SessionStore) => store.remove('session')],
  ] as const)('acknowledges a rename before a queued %s removes its original ID', async (_name, remove) => {
    const { store, contents } = await fixture()
    await store.create(session('other'))
    const gate = holdWrite()
    const unrelated = store.renameSession('other', 'Unrelated')
    await gate.started
    const renaming = expect(store.renameSession('session', 'New title')).resolves.toMatchObject({
      id: 'session', title: 'New title',
    })
    const removing = remove(store)
    gate.finish()
    await Promise.all([unrelated, renaming, removing])
    expect(store.get('session')).toBeUndefined()
    if (_name === 'replacement') {
      expect(JSON.parse(await contents()).sessions.replacement.title).toBe('New title')
    }
  })

  it.each([false, true])(
    'does not couple rename and replacement outcomes across their boundary (rename fails: %s)',
    async (renameFails) => {
      const { store, contents } = await fixture()
      await store.create(session('other'))
      const gate = holdWrite()
      const unrelated = store.renameSession('other', 'Unrelated')
      await gate.started
      const rename = store.renameSession('session', 'New title')
      const replacement = store.replaceWithClearedSession('session', 'replacement')
      const renamed = renameFails
        ? expect(rename).rejects.toThrow('disk full')
        : expect(rename).resolves.toMatchObject({ id: 'session', title: 'New title' })
      const replaced = renameFails
        ? expect(replacement).resolves.toMatchObject({ id: 'replacement', title: 'session' })
        : expect(replacement).rejects.toThrow('disk full')
      if (!renameFails) {
        vi.mocked(writeFile).mockImplementationOnce(disk.writeFile)
      }
      vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
      gate.finish()
      await Promise.all([unrelated, renamed, replaced])
      const persisted = JSON.parse(await contents()).sessions
      if (renameFails) {
        expect(persisted.session).toBeUndefined()
        expect(persisted.replacement.title).toBe('session')
      } else {
        expect(persisted.session.title).toBe('New title')
        expect(persisted.replacement).toBeUndefined()
      }
    },
  )

  it('makes a no-op conditional mutation and a settled read without writing', async () => {
    const { store } = await fixture()
    const before = store.get('session')
    expect(await store.updateIf('session', (stored) => {
      stored.runtime!.model = 'discarded'
      return false
    })).toBeUndefined()
    expect(await store.readAfterWrites('session')).toEqual(before)
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('keeps another pending request waiting when an answered request clears', async () => {
    const { store } = await fixture()
    await store.update('session', (stored) => {
      stored.pendingUserInput = {
        requestId: 'question', question: 'Continue?', choices: ['Yes'], allowFreeform: false,
      }
      stored.pendingPermission = {
        requestId: 'permission', title: 'Needs permission', kind: 'shell', options: [],
      }
      stored.status = 'waiting'
    })
    const cleared = await store.clearPendingRequest(
      'session', 'pendingUserInput', 'question', { status: 'running', activity: 'Continuing' },
    )
    expect(cleared).toMatchObject({
      pendingUserInput: undefined,
      pendingPermission: { requestId: 'permission' },
      status: 'waiting',
      activity: 'Needs permission',
    })
  })
})
