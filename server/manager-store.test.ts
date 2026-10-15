import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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

  it('starts empty and persists state across reopen', async () => {
    const store = await open()
    expect(store.state()).toMatchObject({ generation: 0, acknowledgedJournalSeq: 0, knownSdkSessionIds: [] })
    await store.updateState((state) => {
      state.sdkSessionId = 'sdk-1'
      state.generation = 1
    })
    await store.flush()

    const reopened = await open()
    expect(reopened.state()).toMatchObject({ sdkSessionId: 'sdk-1', generation: 1 })
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
})
