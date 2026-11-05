import { randomUUID } from 'node:crypto'
import { access, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { KnowledgeRoot, SessionKnowledgeBinding } from '../shared/contracts.js'
import {
  SessionKnowledgeConflictError,
  SessionKnowledgeRecoveryError,
  SessionKnowledgeReferenceError,
  SessionKnowledgeStore,
} from './session-knowledge-store.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return { ...fs, writeFile: vi.fn(fs.writeFile), rename: vi.fn(fs.rename) }
})

const disk = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const fixtures: { directory: string; store: SessionKnowledgeStore }[] = []
const releases: (() => void)[] = []

function root(id: string, computerId = 'library'): KnowledgeRoot {
  return {
    id, computerId, computerName: computerId, name: 'Notes',
    path: '/read-only/notes', createdAt: '2026-09-05T00:00:00.000Z',
  }
}

async function fixture() {
  const directory = path.join(process.cwd(), `.session-knowledge-store-test-${randomUUID()}`)
  const roots = new Map([['one', root('one')], ['two', root('two', 'other-library')]])
  const catalog = { getRoot: (id: string) => roots.get(id) }
  const store = new SessionKnowledgeStore(directory, catalog)
  fixtures.push({ directory, store })
  await store.initialize()
  return { directory, roots, catalog, store, statePath: path.join(directory, 'session-knowledge.json') }
}

function holdWrite() {
  let start!: () => void
  let finish!: () => void
  const started = new Promise<void>((resolve) => { start = resolve })
  const gate = new Promise<void>((resolve) => { finish = resolve })
  releases.push(finish)
  vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
    start()
    await gate
    return disk.writeFile(...args)
  })
  return { started, finish }
}

beforeEach(() => {
  vi.mocked(writeFile).mockReset().mockImplementation(disk.writeFile)
  vi.mocked(rename).mockReset().mockImplementation(disk.rename)
})

afterEach(async () => {
  releases.splice(0).forEach((release) => release())
  await Promise.allSettled(fixtures.map(({ store }) => store.flush()))
  await Promise.all(fixtures.splice(0).map(({ directory }) =>
    rm(directory, { recursive: true, force: true }),
  ))
})

describe('SessionKnowledgeStore', () => {
  it('reads a never-bound session without creating a file, directory, or link', async () => {
    const { store, directory } = await fixture()
    expect(store.get('computer', 'session')).toEqual({
      computerId: 'computer', sessionId: 'session', rootId: null,
      rootPath: '.', knowledgeBasePath: null, revision: 0, available: false,
    })
    expect(store.listBindings()).toEqual([])
    await expect(access(directory)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('keeps independent sessions, shared roots, and same IDs on different computers', async () => {
    const { store, roots } = await fixture()
    await Promise.all([
      store.update('computer-a', 'same-id', { rootId: 'one', expectedRevision: 0 }),
      store.update('computer-b', 'same-id', { rootId: 'two', expectedRevision: 0 }),
      store.update('computer-a', 'another-id', { rootId: 'one', expectedRevision: 0 }),
      store.update('a:b', 'c', { rootId: 'one', expectedRevision: 0 }),
      store.update('a', 'b:c', { rootId: 'two', expectedRevision: 0 }),
    ])
    expect(store.listBindings()).toHaveLength(5)
    expect(store.get('computer-a', 'same-id')).toMatchObject({ root: roots.get('one'), revision: 1 })
    expect(store.get('computer-b', 'same-id')).toMatchObject({ root: roots.get('two'), revision: 1 })
    expect(store.get('computer-a', 'another-id').rootId).toBe('one')
    expect(store.get('a:b', 'c').rootId).toBe('one')
    expect(store.get('a', 'b:c').rootId).toBe('two')
    expect(store.get('computer-a', 'never-linked').revision).toBe(0)
  })

  it('persists private metadata and immutable detached snapshots across reloads', async () => {
    const { store, roots, catalog, statePath, directory } = await fixture()
    const binding = await store.update('computer', 'session', {
      rootId: 'one',
      rootPath: 'projects/agentic-remote',
      expectedRevision: 0,
    })
    expect(Object.isFrozen(binding)).toBe(true)
    expect(Object.isFrozen(binding.root)).toBe(true)
    roots.get('one')!.name = 'Catalog object changed'
    expect(binding.root!.name).toBe('Notes')
    expect(store.get('computer', 'session').root!.name).toBe('Notes')
    const listed = store.listBindings()
    listed.length = 0
    expect(store.listBindings()).toHaveLength(1)
    expect((await stat(statePath)).mode & 0o777).toBe(0o600)
    const pathStatePath = path.join(directory, 'session-knowledge-paths.json')
    expect((await stat(pathStatePath)).mode & 0o777).toBe(0o600)
    expect(JSON.parse(await readFile(statePath, 'utf8'))).toEqual({
      version: 1,
      bindings: [{
        computerId: 'computer',
        sessionId: 'session',
        rootId: 'one',
        revision: 1,
        root: root('one'),
      }],
    })
    expect(JSON.parse(await readFile(pathStatePath, 'utf8'))).toEqual({
      version: 1,
      paths: [{
        computerId: 'computer',
        sessionId: 'session',
        rootId: 'one',
        rootPath: 'projects/agentic-remote',
        revision: 1,
      }],
    })
    expect((await readdir(directory)).sort()).toEqual([
      'session-knowledge-paths.json',
      'session-knowledge.json',
    ])
    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await reloaded.initialize()
    expect(reloaded.get('computer', 'session')).toEqual(binding)
  })

  it('projects the canonical Knowledge base path without persisting it', async () => {
    const { store, roots, statePath } = await fixture()
    roots.get('one')!.path = '/read-only/notes'

    await expect(store.update('computer', 'session', {
      rootId: 'one',
      rootPath: 'projects/agentic-remote',
      expectedRevision: 0,
    })).resolves.toMatchObject({
      knowledgeBasePath: '/read-only/notes/projects/agentic-remote',
    })
    expect(JSON.parse(await readFile(statePath, 'utf8')).bindings[0])
      .not.toHaveProperty('knowledgeBasePath')
  })

  it('keeps an unavailable root snapshot path visible', async () => {
    const { store, roots } = await fixture()
    await store.update('computer', 'session', {
      rootId: 'one',
      expectedRevision: 0,
    })
    roots.delete('one')

    expect(store.get('computer', 'session')).toMatchObject({
      available: false,
      knowledgeBasePath: '/read-only/notes',
    })
  })

  it('ignores a stale nested-path sidecar after an older rollback changes the v1 binding', async () => {
    const { store, catalog, directory, statePath } = await fixture()
    await store.update('computer', 'session', {
      rootId: 'one',
      rootPath: 'projects/agentic-remote',
      expectedRevision: 0,
    })
    await disk.writeFile(statePath, JSON.stringify({
      version: 1,
      bindings: [{
        computerId: 'computer',
        sessionId: 'session',
        rootId: 'two',
        revision: 2,
        root: root('two', 'other-library'),
      }],
    }), { mode: 0o600 })

    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await reloaded.initialize()
    expect(reloaded.get('computer', 'session')).toMatchObject({
      rootId: 'two',
      rootPath: '.',
      revision: 2,
    })
  })

  it('persists an unlink tombstone and rejects an older choice after reload', async () => {
    const { store, directory, catalog } = await fixture()
    await store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    const unlinked = await store.update('computer', 'session', { rootId: null, expectedRevision: 1 })
    expect(unlinked).toEqual({
      computerId: 'computer', sessionId: 'session', rootId: null,
      rootPath: '.', knowledgeBasePath: null, revision: 2, available: false,
    })
    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await reloaded.initialize()
    await expect(reloaded.update('computer', 'session', { rootId: 'two', expectedRevision: 0 }))
      .rejects.toMatchObject({ statusCode: 409, binding: unlinked })
    expect(reloaded.get('computer', 'session')).toEqual(unlinked)
  })

  it('records an explicit unlink even when no link existed', async () => {
    const { store } = await fixture()
    await expect(store.update('computer', 'session', { rootId: null, expectedRevision: 0 }))
      .resolves.toMatchObject({ rootId: null, revision: 1, available: false })
    await expect(store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 }))
      .rejects.toBeInstanceOf(SessionKnowledgeConflictError)
  })

  it('returns an existing current binding without writing or advancing it', async () => {
    const { store } = await fixture()
    const first = await store.update('computer', 'session', {
      rootId: 'one',
      rootPath: 'projects',
      expectedRevision: 0,
    })
    const events: SessionKnowledgeBinding[] = []
    store.on('updated', (binding) => events.push(binding))
    vi.mocked(writeFile).mockClear()

    await expect(store.update('computer', 'session', {
      rootId: 'one',
      rootPath: 'projects',
      expectedRevision: 1,
    })).resolves.toEqual(first)
    expect(writeFile).not.toHaveBeenCalled()
    expect(events).toEqual([])
    expect(store.get('computer', 'session').revision).toBe(1)
  })

  it('rejects a nested path outside a linked root or on an unlink', async () => {
    const { store } = await fixture()
    await expect(store.update('computer', 'session', {
      rootId: 'one',
      rootPath: '../private',
      expectedRevision: 0,
    })).rejects.toMatchObject({ statusCode: 400 })
    await expect(store.update('computer', 'session', {
      rootId: null,
      rootPath: 'projects',
      expectedRevision: 0,
    })).rejects.toMatchObject({ statusCode: 400 })
  })

  it('checks concurrent expected revisions inside the serialized transaction', async () => {
    const { store } = await fixture()
    const gate = holdWrite()
    const first = store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    await gate.started
    const second = store.update('computer', 'session', { rootId: 'two', expectedRevision: 0 })
    const refused = expect(second).rejects.toMatchObject({
      statusCode: 409, binding: { rootId: 'one', revision: 1 },
    })
    expect(store.get('computer', 'session').revision).toBe(0)
    gate.finish()
    await first
    await refused
    expect(vi.mocked(writeFile).mock.calls.filter(([file]) => String(file).endsWith('.pending'))).toHaveLength(2)
    expect(store.get('computer', 'session').rootId).toBe('one')
  })

  it.each(['candidate write', 'journal write', 'journal rename', 'candidate rename'])('does not publish a failed %s and can retry its revision', async (failure) => {
    const { store, statePath, directory, catalog } = await fixture()
    const before = await store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    const persisted = await readFile(statePath, 'utf8')
    const events: SessionKnowledgeBinding[] = []
    store.on('updated', (binding) => events.push(binding))
    const journal = failure.startsWith('journal')
    if (failure.endsWith('write')) {
      vi.mocked(writeFile).mockImplementation(async (...args) => {
        if (String(args[0]).startsWith(`${statePath}.recovery.`) === journal) {
          vi.mocked(writeFile).mockImplementation(disk.writeFile)
          throw new Error('disk full')
        }
        return disk.writeFile(...args)
      })
    } else {
      vi.mocked(rename).mockImplementation(async (...args) => {
        if (String(args[1]) === (journal ? `${statePath}.recovery` : statePath)) {
          vi.mocked(rename).mockImplementation(disk.rename)
          throw new Error('disk full')
        }
        return disk.rename(...args)
      })
    }
    await expect(store.update('computer', 'session', { rootId: 'two', expectedRevision: 1 }))
      .rejects.toMatchObject({ statusCode: 503, message: expect.stringContaining('Try again') })
    expect(store.get('computer', 'session')).toEqual(before)
    expect(await readFile(statePath, 'utf8')).toBe(persisted)
    expect(events).toEqual([])
    expect(await readdir(directory)).toEqual(['session-knowledge.json'])
    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await reloaded.initialize()
    expect(reloaded.get('computer', 'session')).toEqual(before)
    await expect(store.update('computer', 'session', { rootId: 'two', expectedRevision: 1 }))
      .resolves.toMatchObject({ rootId: 'two', revision: 2 })
    expect(events).toHaveLength(1)
  })

  it('keeps queued callers usable after a failed first write', async () => {
    const { store } = await fixture()
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
    const failed = store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    const next = store.update('computer', 'session', { rootId: 'two', expectedRevision: 0 })
    await expect(failed).rejects.toMatchObject({ statusCode: 503 })
    await expect(next).resolves.toMatchObject({ rootId: 'two', revision: 1 })
  })

  it('emits each immutable binding only after persistence and in commit order', async () => {
    const { store, statePath } = await fixture()
    const events: SessionKnowledgeBinding[] = []
    const diskAtEvent: Promise<string>[] = []
    store.on('updated', (binding) => {
      events.push(binding)
      diskAtEvent.push(readFile(statePath, 'utf8'))
    })
    const gate = holdWrite()
    const first = store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    await gate.started
    const second = store.update('computer', 'session', { rootId: 'two', expectedRevision: 1 })
    expect(events).toEqual([])
    expect(store.get('computer', 'session').revision).toBe(0)
    await expect(access(statePath)).rejects.toMatchObject({ code: 'ENOENT' })
    gate.finish()
    await Promise.all([first, second])
    expect(events.map((binding) => binding.revision)).toEqual([1, 2])
    expect(events.map((binding) => binding.rootId)).toEqual(['one', 'two'])
    for (const contents of await Promise.all(diskAtEvent)) {
      expect(JSON.parse(contents).bindings[0].revision).toBeGreaterThan(0)
    }
  })

  it('rechecks validation after a pending write without publishing it', async () => {
    const { store, directory } = await fixture()
    const gate = holdWrite()
    let registered = true
    const writing = store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 }, () => {
      if (!registered) throw new SessionKnowledgeReferenceError('Computer pairing changed', 409)
    })
    const refused = expect(writing).rejects.toMatchObject({ statusCode: 409 })
    await gate.started
    registered = false
    gate.finish()
    await refused
    expect(store.get('computer', 'session').revision).toBe(0)
    expect(await readdir(directory)).toEqual([])
  })

  it.each(['write', 'rename'] as const)('fails closed if rollback %s fails, and recovers the prior durable snapshot on restart', async (failure) => {
    const { store, directory, statePath, catalog } = await fixture()
    const before = await store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    const persisted = await readFile(statePath, 'utf8')
    const events: SessionKnowledgeBinding[] = []
    store.on('updated', (binding) => events.push(binding))
    let started!: () => void
    let finish!: () => void
    const renamed = new Promise<void>((resolve) => { started = resolve })
    const gate = new Promise<void>((resolve) => { finish = resolve })
    releases.push(finish)
    vi.mocked(rename).mockImplementation(async (...args) => {
      await disk.rename(...args)
      if (String(args[1]) === statePath) {
        vi.mocked(rename).mockImplementation(disk.rename)
        started()
        await gate
      }
    })
    let valid = true
    const writing = store.update('computer', 'session', { rootId: 'two', expectedRevision: 1 }, () => {
      if (!valid) throw new SessionKnowledgeReferenceError('Computer pairing changed', 409)
    })
    const failed = expect(writing).rejects.toBeInstanceOf(SessionKnowledgeRecoveryError)
    await renamed
    expect(store.get('computer', 'session')).toEqual(before)
    valid = false
    if (failure === 'write') vi.mocked(writeFile).mockRejectedValueOnce(new Error('rollback disk full'))
    else vi.mocked(rename).mockRejectedValueOnce(new Error('rollback rename refused'))
    finish()
    await failed
    expect(() => store.get('computer', 'session')).toThrow(SessionKnowledgeRecoveryError)
    expect(() => store.listBindings()).toThrow(SessionKnowledgeRecoveryError)
    expect(events).toEqual([])
    expect(JSON.parse(await readFile(statePath, 'utf8')).bindings[0].rootId).toBe('two')
    expect(JSON.parse(await readFile(`${statePath}.recovery`, 'utf8')).previous).toBe(persisted)
    expect((await stat(`${statePath}.recovery`)).mode & 0o777).toBe(0o600)
    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await reloaded.initialize()
    expect(reloaded.get('computer', 'session')).toEqual(before)
    expect(await readFile(statePath, 'utf8')).toBe(persisted)
    expect(await readdir(directory)).toEqual(['session-knowledge.json'])
  })

  it('recovers an interrupted initial write without accepting its root or creating an unlink tombstone', async () => {
    const { directory, statePath, catalog } = await fixture()
    await disk.mkdir(directory, { recursive: true })
    await disk.writeFile(`${statePath}.recovery`, JSON.stringify({ version: 1, previous: null }), { mode: 0o600 })
    await disk.writeFile(statePath, JSON.stringify({
      version: 1, bindings: [{ computerId: 'computer', sessionId: 'session', rootId: 'one', root: root('one'), revision: 1 }],
    }))
    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await reloaded.initialize()
    expect(reloaded.get('computer', 'session')).toMatchObject({ rootId: null, revision: 0 })
    expect(await readdir(directory)).toEqual([])
  })

  it('loads the authoritative state after interruption during recovery-journal creation', async () => {
    const { store, directory, statePath, catalog } = await fixture()
    const before = await store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    const persisted = await readFile(statePath, 'utf8')
    let started!: () => void
    let finish!: () => void
    const partial = new Promise<void>((resolve) => { started = resolve })
    const held = new Promise<void>((resolve) => { finish = resolve })
    releases.push(finish)
    vi.mocked(writeFile).mockImplementation(async (file, data, options) => {
      if (String(file).startsWith(`${statePath}.recovery`)) {
        await disk.writeFile(file, '{"version":', options)
        started()
        await held
        throw new Error('Interrupted journal write')
      }
      return disk.writeFile(file, data, options)
    })
    const refused = expect(store.update('computer', 'session', { rootId: 'two', expectedRevision: 1 }))
      .rejects.toMatchObject({ statusCode: 503 })
    try {
      await partial
      expect(await readFile(statePath, 'utf8')).toBe(persisted)
      const reloaded = new SessionKnowledgeStore(directory, catalog)
      await reloaded.initialize()
      expect(reloaded.get('computer', 'session')).toEqual(before)
      await expect(access(`${statePath}.recovery`)).rejects.toMatchObject({ code: 'ENOENT' })
      const journal = (await readdir(directory)).find((file) => file.startsWith('session-knowledge.json.recovery.'))
      expect(journal).toBeDefined()
      expect((await stat(path.join(directory, journal!))).mode & 0o777).toBe(0o600)
    } finally {
      finish()
    }
    await refused
    expect(store.get('computer', 'session')).toEqual(before)
    expect(await readFile(statePath, 'utf8')).toBe(persisted)
    expect(await readdir(directory)).toEqual(['session-knowledge.json'])
  })

  it.each([
    '{"version":',
    JSON.stringify({ version: 1, previous: 'invalid state' }),
  ])('still rejects a malformed published recovery journal without rewriting either file %#', async (contents) => {
    const { store, directory, statePath, catalog } = await fixture()
    await store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    const persisted = await readFile(statePath, 'utf8')
    await disk.writeFile(`${statePath}.recovery`, contents, { mode: 0o600 })
    vi.mocked(writeFile).mockClear()
    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await expect(reloaded.initialize()).rejects.toThrow('Cannot load session Knowledge recovery metadata')
    expect(await readFile(`${statePath}.recovery`, 'utf8')).toBe(contents)
    expect(await readFile(statePath, 'utf8')).toBe(persisted)
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('refuses a root that disappears while a binding write is queued', async () => {
    const { store, roots } = await fixture()
    const gate = holdWrite()
    const writing = store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    const refused = expect(writing).rejects.toMatchObject({ statusCode: 404 })
    await gate.started
    roots.delete('one')
    gate.finish()
    await refused
    expect(store.get('computer', 'session').revision).toBe(0)
  })

  it('keeps a named unavailable binding when a shared root disappears', async () => {
    const { store, roots, directory, catalog } = await fixture()
    const first = await store.update('computer', 'session', { rootId: 'one', expectedRevision: 0 })
    roots.delete('one')
    const events: SessionKnowledgeBinding[] = []
    store.on('updated', (binding) => events.push(binding))
    await store.refreshAvailability(['one'])
    expect(events).toEqual([{ ...first, available: false }])
    const reloaded = new SessionKnowledgeStore(directory, catalog)
    await reloaded.initialize()
    expect(reloaded.get('computer', 'session')).toEqual({ ...first, available: false })
    await expect(reloaded.update('computer', 'other', { rootId: 'one', expectedRevision: 0 }))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it('moves a binding through replacement ancestry and leaves unbound sessions alone', async () => {
    const { store } = await fixture()
    await store.replaceSession('computer', 'unbound-replacement', ['unbound'])
    expect(writeFile).not.toHaveBeenCalled()
    await store.update('computer', 'original', {
      rootId: 'one',
      rootPath: 'projects/agentic-remote',
      expectedRevision: 0,
    })
    await store.replaceSession('computer', 'current', ['original', 'intermediate'])
    expect(store.get('computer', 'current')).toMatchObject({
      rootId: 'one',
      rootPath: 'projects/agentic-remote',
      revision: 1,
    })
    expect(store.get('computer', 'original').revision).toBe(0)
    expect(store.get('computer', 'intermediate').revision).toBe(0)
  })

  it.each(['two', null])('preserves an explicit %s choice on the replacement', async (rootId) => {
    const { store } = await fixture()
    await store.update('computer', 'original', { rootId: 'one', expectedRevision: 0 })
    const recipient = await store.update('computer', 'current', { rootId, expectedRevision: 0 })
    await store.replaceSession('computer', 'current', ['original'])
    expect(store.get('computer', 'current')).toEqual(recipient)
    expect(store.get('computer', 'original').revision).toBe(0)
  })

  it('prefers the nearest predecessor, including its unlink tombstone', async () => {
    const { store } = await fixture()
    await store.update('computer', 'oldest', { rootId: 'one', expectedRevision: 0 })
    await store.update('computer', 'previous', { rootId: null, expectedRevision: 0 })
    await store.replaceSession('computer', 'current', ['oldest', 'previous'])
    expect(store.listBindings()).toEqual([{
      computerId: 'computer', sessionId: 'current', rootId: null,
      rootPath: '.', knowledgeBasePath: null, revision: 1, available: false,
    }])
  })

  it('preserves the source and recipient if persisting a replacement fails', async () => {
    const { store } = await fixture()
    const source = await store.update('computer', 'old', { rootId: 'one', expectedRevision: 0 })
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk full'))
    await expect(store.replaceSession('computer', 'new', ['old'])).rejects.toMatchObject({ statusCode: 503 })
    expect(store.get('computer', 'old')).toEqual(source)
    expect(store.get('computer', 'new').revision).toBe(0)
    await store.replaceSession('computer', 'new', ['old'])
    expect(store.get('computer', 'new').rootId).toBe('one')
  })

  it('deletes only association metadata, never shared catalog or folder content', async () => {
    const { store, directory, roots } = await fixture()
    await disk.mkdir(path.join(directory, 'notes'), { recursive: true })
    await disk.writeFile(path.join(directory, 'knowledge.json'), 'existing shared catalog')
    await disk.writeFile(path.join(directory, 'notes', 'README.md'), 'keep these files')
    await store.update('computer', 'one', { rootId: 'one', expectedRevision: 0 })
    await store.update('computer', 'two', { rootId: 'one', expectedRevision: 0 })
    await store.update('another-computer', 'one', { rootId: 'one', expectedRevision: 0 })
    await store.removeSession('computer', 'one')
    expect(store.get('computer', 'two').rootId).toBe('one')
    await store.removeComputer('computer')
    expect(store.listBindings().map((binding) => binding.computerId)).toEqual(['another-computer'])
    expect(roots.size).toBe(2)
    expect(await readFile(path.join(directory, 'knowledge.json'), 'utf8')).toBe('existing shared catalog')
    expect(await readFile(path.join(directory, 'notes', 'README.md'), 'utf8')).toBe('keep these files')
  })

  it.each([
    '{invalid',
    JSON.stringify({ version: 2, bindings: [] }),
    JSON.stringify({ version: 1, bindings: {} }),
    JSON.stringify({ version: 1, bindings: [{ computerId: 'c', sessionId: 's', rootId: 'one', revision: 1 }] }),
    JSON.stringify({ version: 1, bindings: [{ computerId: 'c', sessionId: 's', rootId: null, revision: 0 }] }),
    JSON.stringify({ version: 1, bindings: [
      { computerId: 'c', sessionId: 's', rootId: 'one', revision: 1, root: root('two') },
    ] }),
    JSON.stringify({ version: 1, bindings: [
      { computerId: 'c', sessionId: 's', rootId: null, revision: 1 },
      { computerId: 'c', sessionId: 's', rootId: null, revision: 2 },
    ] }),
  ])('rejects corrupt metadata without rewriting it %#', async (contents) => {
    const { directory, statePath, catalog } = await fixture()
    await disk.mkdir(directory, { recursive: true })
    await disk.writeFile(statePath, contents)
    const store = new SessionKnowledgeStore(directory, catalog)
    await expect(store.initialize()).rejects.toThrow('Cannot load session Knowledge metadata')
    expect(await readFile(statePath, 'utf8')).toBe(contents)
    expect(writeFile).not.toHaveBeenCalled()
    await expect(store.update('c', 's', { rootId: null, expectedRevision: 0 }))
      .rejects.toThrow('not initialized')
  })
})
