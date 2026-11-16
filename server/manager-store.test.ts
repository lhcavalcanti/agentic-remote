import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ManagerMessage } from '../shared/manager.js'
import { ManagerStore } from './manager-store.js'

describe('ManagerStore', () => {
  let root: string
  let clock: number
  const now = () => new Date(clock)

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-store-'))
    clock = Date.parse('2026-10-15T00:00:00.000Z')
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function open(options: ConstructorParameters<typeof ManagerStore>[1] = {}) {
    const store = new ManagerStore(path.join(root, 'manager'), { now, ...options })
    await store.initialize()
    return store
  }

  it('notifies only committed projection changes, including schedule run changes, and never on load', async () => {
    const store = await open()
    const notifications: Array<{ keys: string[]; origin: string }> = []
    const unsubscribe = store.onSessionProvenanceChanged((sessions) => {
      notifications.push({
        keys: sessions.map(({ computerId, sessionId }) => `${computerId}:${sessionId}`),
        origin: JSON.parse(readFileSync(path.join(root, 'manager', 'sessions.json'), 'utf8'))['c:live'].origin,
      })
    })
    await store.updateRegistry((registry) => {
      registry['c:live'] = { computerId: 'c', sessionId: 'live', title: 'Legacy', origin: 'user', firstSeenAt: 'x' }
    })
    expect(notifications).toEqual([])
    const writing = store.updateRegistry((registry) => { registry['c:live'].originEvidence = 'launch' })
    expect(notifications).toEqual([])
    await writing
    await store.updateRegistry((registry) => { registry['c:live'].title = 'Title only' })
    expect(notifications).toEqual([{ keys: ['c:live'], origin: 'user' }])
    await store.updateRegistry((registry) => {
      Object.assign(registry['c:live'], { origin: 'schedule', scheduleId: 'daily', scheduleRunId: 'first' })
    })
    await store.updateRegistry((registry) => { registry['c:live'].scheduleRunId = 'second' })
    expect(notifications).toHaveLength(3)
    expect(notifications.slice(1)).toEqual([
      { keys: ['c:live'], origin: 'schedule' }, { keys: ['c:live'], origin: 'schedule' },
    ])
    unsubscribe()
    await store.updateRegistry((registry) => { registry['c:live'].origin = 'manager' })
    const bytes = await readFile(path.join(root, 'manager', 'sessions.json'), 'utf8')
    const reopened = new ManagerStore(path.join(root, 'manager'))
    let notifiedOnLoad = false
    reopened.onSessionProvenanceChanged(() => { notifiedOnLoad = true })
    await reopened.initializeSessionRegistry()
    expect(await readFile(path.join(root, 'manager', 'sessions.json'), 'utf8')).toBe(bytes)
    expect(notifications).toHaveLength(3)
    expect(notifiedOnLoad).toBe(false)
  })

  it('does not notify failed writes and compares recovery against the last committed projection', async () => {
    const store = await open()
    const changes: string[][] = []
    store.onSessionProvenanceChanged((sessions) => { changes.push(sessions.map(({ sessionId }) => sessionId)) })
    const file = path.join(root, 'manager', 'sessions.json')
    await mkdir(file)
    await expect(store.updateRegistry((registry) => {
      registry['c:live'] = { computerId: 'c', sessionId: 'live', title: 'Task', origin: 'manager', firstSeenAt: 'x' }
    })).rejects.toThrow()
    expect(changes).toEqual([])
    await rm(file, { recursive: true })
    await store.updateRegistry((registry) => { registry['c:live'].title = 'Retry' })
    expect(changes).toEqual([['live']])
  })

  it('starts empty and persists state across reopen', async () => {
    const store = await open()
    expect(store.state()).toMatchObject({ generation: 0, acknowledgedJournalSeq: 0, knownSdkSessionIds: [] })
    await store.updateState((state) => {
      state.sdkSessionId = 'sdk-1'
      state.voiceTaintedSdkSessionId = 'sdk-1'
      state.generation = 1
    })
    await store.flush()

    const reopened = await open()
    expect(reopened.state()).toMatchObject({
      sdkSessionId: 'sdk-1',
      voiceTaintedSdkSessionId: 'sdk-1',
      generation: 1,
    })
  })

  it('keeps the latest version of each message in first-seen order', async () => {
    const store = await open()
    await store.upsertMessage({ id: 'a', role: 'user', content: 'hi', createdAt: 't1', state: 'queued' })
    await store.upsertMessage({ id: 'b', role: 'assistant', content: 'hello', createdAt: 't2' })
    await store.upsertMessage({ id: 'a', role: 'user', content: 'hi', createdAt: 't1', state: 'done' })
    await store.flush()

    const reopened = await open()
    expect(reopened.messages().map((message) => [message.id, message.state])).toEqual([
      ['a', 'done'],
      ['b', undefined],
    ])
  })

  it('does not expose a message whose durable append failed', async () => {
    const store = await open()
    const conversationPath = path.join(root, 'manager', 'conversation.jsonl')
    await mkdir(conversationPath)

    await expect(store.upsertMessage({
      id: 'not-durable',
      role: 'user',
      content: 'Do not expose this.',
      createdAt: 't1',
      state: 'queued',
    })).rejects.toThrow()

    expect(store.message('not-durable')).toBeUndefined()
    expect(store.messages()).toEqual([])
  })

  it('does not apply a state update whose durable write failed', async () => {
    const store = await open()
    const statePath = path.join(root, 'manager', 'state.json')
    await mkdir(statePath)

    await expect(store.updateState((state) => {
      state.sdkSessionId = 'not-durable'
    })).rejects.toThrow()

    expect(store.state().sdkSessionId).toBeUndefined()
    await rm(statePath, { recursive: true })
    await store.updateState((state) => {
      state.generation = 1
    })
    const reopened = await open()
    expect(reopened.state().generation).toBe(1)
    expect(reopened.state().sdkSessionId).toBeUndefined()
  })

  it('drops retired periodic-check state and provenance on load', async () => {
    const directory = path.join(root, 'manager')
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, 'state.json'), JSON.stringify({
      generation: 2,
      knownSdkSessionIds: [],
      acknowledgedJournalSeq: 0,
      proactive: {
        settings: { enabled: true, cadenceMinutes: 60, timeZone: 'UTC', quietStartHour: 22, quietEndHour: 7 },
        nextCheckAt: '2026-11-04T14:00:00.000Z',
      },
    }))
    await writeFile(path.join(directory, 'conversation.jsonl'), `${JSON.stringify({
      id: 'legacy-check',
      role: 'user',
      content: 'Review the current work.',
      createdAt: '2026-11-04T13:00:00.000Z',
      state: 'done',
      source: 'scheduled',
    })}\n`)

    const store = await open()
    expect(store.state()).not.toHaveProperty('proactive')
    expect(store.state().generation).toBe(2)
    expect(store.message('legacy-check')?.source).toBe('typed')

    await store.updateState((state) => {
      state.generation = 3
    })
    const saved = JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')) as Record<string, unknown>
    expect(saved).not.toHaveProperty('proactive')
    expect(saved.generation).toBe(3)
  })

  it('keeps persisted voice provenance immutable across reloads and legacy updates', async () => {
    const store = await open()
    const voice = {
      id: 'voice',
      role: 'user',
      content: 'What is running?',
      createdAt: 't1',
      state: 'queued',
      source: 'voice',
    } as ManagerMessage
    await store.upsertMessage(voice)
    await store.upsertMessage({
      ...voice,
      content: 'What is running now?',
      source: undefined,
    } as ManagerMessage)
    await store.flush()

    const reopened = await open()
    expect(reopened.message('voice')).toMatchObject({
      content: 'What is running now?',
      source: 'voice',
    })

    await reopened.upsertMessage({
      ...reopened.message('voice')!,
      source: 'typed',
      state: 'failed',
    } as ManagerMessage)
    expect(reopened.message('voice')).toMatchObject({
      source: 'voice',
      state: 'failed',
    })
  })

  it('persists proactive and task provenance with immutable automatic context', async () => {
    const store = await open()
    await store.upsertMessage({
      id: 'proactive',
      role: 'user',
      content: 'Inspect the failed session.',
      createdAt: 't1',
      state: 'queued',
      source: 'proactive',
      automatic: {
        kind: 'proactive',
        eventIds: ['a'.repeat(64)],
      },
    })
    await store.upsertMessage({
      id: 'task',
      role: 'user',
      content: 'Run the focused queue test.',
      createdAt: 't2',
      state: 'queued',
      source: 'task',
      automatic: {
        kind: 'task',
        taskId: 'oracle-task-a',
      },
    })
    await store.flush()

    const reopened = await open()
    expect(reopened.message('proactive')).toMatchObject({
      source: 'proactive',
      automatic: { kind: 'proactive', eventIds: ['a'.repeat(64)] },
    })
    expect(reopened.message('task')).toMatchObject({
      source: 'task',
      automatic: { kind: 'task', taskId: 'oracle-task-a' },
    })

    await reopened.upsertMessage({
      ...reopened.message('proactive')!,
      source: 'typed',
      automatic: undefined,
      state: 'failed',
    })
    expect(reopened.message('proactive')).toMatchObject({
      source: 'proactive',
      automatic: { kind: 'proactive', eventIds: ['a'.repeat(64)] },
      state: 'failed',
    })
  })

  it('compacts the conversation log and keeps only the newest messages', async () => {
    const store = await open({ conversationKeep: 3 })
    for (let index = 0; index < 20; index += 1) {
      await store.upsertMessage({ id: `m${index}`, role: 'user', content: `${index}`, createdAt: `${index}` })
    }
    await store.flush()
    const lines = (await readFile(path.join(root, 'manager', 'conversation.jsonl'), 'utf8')).trim().split('\n')
    expect(lines.length).toBeLessThanOrEqual(12)
    const reopened = await open({ conversationKeep: 3 })
    expect(reopened.messages().map((message) => message.id)).toEqual(['m17', 'm18', 'm19'])
  })

  it('numbers journal entries, reads them since a sequence, and rotates', async () => {
    const store = await open({ journalLimit: 6, journalKeep: 3 })
    const first = await store.appendJournal([
      { kind: 'created', computerId: 'c', sessionId: 's1', title: 'One' },
      { kind: 'created', computerId: 'c', sessionId: 's2', title: 'Two' },
    ])
    expect(first.map((entry) => entry.seq)).toEqual([1, 2])
    expect(store.journalSince(1).map((entry) => entry.sessionId)).toEqual(['s2'])

    for (let index = 3; index <= 8; index += 1) {
      await store.appendJournal([{ kind: 'status', computerId: 'c', sessionId: `s${index}`, to: 'idle' }])
    }
    await store.flush()
    const reopened = await open({ journalLimit: 6, journalKeep: 3 })
    expect(reopened.latestJournalSeq()).toBe(8)
    expect(reopened.journalSince(0).map((entry) => entry.seq).at(-1)).toBe(8)
    expect(reopened.journalSince(0).length).toBeLessThanOrEqual(6)
  })

  it('prunes old and excess tombstones from the registry', async () => {
    const store = await open({ tombstoneDays: 30, tombstoneMax: 2 })
    await store.updateRegistry((registry) => {
      registry['c:old'] = { computerId: 'c', sessionId: 'old', title: 'Old', origin: 'user', firstSeenAt: 'x', removedAt: '2026-08-01T00:00:00.000Z' }
      registry['c:r1'] = { computerId: 'c', sessionId: 'r1', title: 'R1', origin: 'user', firstSeenAt: 'x', removedAt: '2026-10-10T00:00:00.000Z' }
      registry['c:r2'] = { computerId: 'c', sessionId: 'r2', title: 'R2', origin: 'user', firstSeenAt: 'x', removedAt: '2026-10-11T00:00:00.000Z' }
      registry['c:r3'] = { computerId: 'c', sessionId: 'r3', title: 'R3', origin: 'user', firstSeenAt: 'x', removedAt: '2026-10-12T00:00:00.000Z' }
      registry['c:live'] = { computerId: 'c', sessionId: 'live', title: 'Live', origin: 'manager', firstSeenAt: 'x' }
    })
    expect(Object.keys(store.registry()).sort()).toEqual(['c:live', 'c:r2', 'c:r3'])
  })

  it('sets a corrupt state file aside instead of failing to start', async () => {
    const directory = path.join(root, 'manager')
    const first = await open()
    await first.updateState((state) => { state.generation = 4 })
    await first.flush()
    await writeFile(path.join(directory, 'state.json'), '{not json')
    await writeFile(path.join(directory, 'conversation.jsonl'), '{"id":"ok","role":"user","content":"x","createdAt":"t"}\n{broken\n')

    const store = await open()
    expect(store.state().generation).toBe(0)
    expect(store.messages().map((message) => message.id)).toEqual(['ok'])
    expect((await readdir(directory)).some((name) => name.startsWith('state.json.corrupt-'))).toBe(true)
  })

  it('starts without a file it cannot read at all', async () => {
    const directory = path.join(root, 'manager')
    await mkdir(path.join(directory, 'state.json'), { recursive: true })
    await mkdir(path.join(directory, 'journal.jsonl'), { recursive: true })
    const store = await open()
    expect(store.state().generation).toBe(0)
    expect(store.latestJournalSeq()).toBe(0)
    // Moved aside, so the files can be written again.
    await store.updateState((state) => { state.generation = 2 })
    await store.appendJournal([{ kind: 'created', computerId: 'c', sessionId: 's' }])
    await store.flush()
    expect((await open()).state().generation).toBe(2)
    const names = await readdir(directory)
    expect(names.filter((name) => name.includes('.corrupt-')).length).toBe(2)
  })

  it('starts a new conversation and keeps the previous one as an archive', async () => {
    const store = await open()
    await store.upsertMessage({ id: 'a', role: 'user', content: 'hi', createdAt: 't1' })
    await store.resetConversation()
    expect(store.messages()).toEqual([])
    await store.flush()
    const names = await readdir(path.join(root, 'manager'))
    expect(names.some((name) => name.startsWith('conversation-') && name.endsWith('.jsonl'))).toBe(true)
    expect((await open()).messages()).toEqual([])
  })

  it('does not restore an append queued before a conversation reset', async () => {
    const store = await open()
    const append = store.upsertMessage({
      id: 'a',
      role: 'user',
      content: 'hi',
      createdAt: 't1',
    })
    const reset = store.resetConversation()

    await Promise.all([append, reset])

    expect(store.messages()).toEqual([])
    expect((await open()).messages()).toEqual([])
  })
})
