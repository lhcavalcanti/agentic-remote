import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { CLOSED_SESSION_RETENTION_MS } from '../shared/closed-sessions.js'
import { SessionCategoryStore } from './session-category-store.js'
import { SessionOrderStore } from './session-order-store.js'

const directories: string[] = []
const DAY = 24 * 60 * 60 * 1000

async function folder(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'session-categories-test-'))
  directories.push(directory)
  return directory
}

async function store(directory?: string, now?: () => number) {
  const where = directory ?? await folder()
  const created = new SessionCategoryStore(where, now ? { now } : {})
  await created.initialize()
  return { store: created, directory: where, file: path.join(where, 'session-categories.json') }
}

const everyone = () => true

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('SessionCategoryStore', () => {
  it('starts empty in a file of its own, written privately', async () => {
    const { store: categories, file, directory } = await store()
    expect(categories.snapshot()).toEqual({ revision: 0, categories: [] })
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({
      version: 1, revision: 0, categories: [], closed: {},
    })
    expect((await stat(file)).mode & 0o777).toBe(0o600)
    await expect(stat(path.join(directory, 'session-order.json'))).rejects.toThrow()
  })

  it('commits a change made against the current revision and reloads it after a restart', async () => {
    const { store: categories, directory } = await store()
    const created = await categories.change(0, {
      type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a'],
    }, everyone)
    expect(created).toEqual({
      revision: 1,
      categories: [{ id: 'lab', name: 'Homelab', collapsed: false, sessions: ['hub:a'] }],
    })
    await categories.change(1, { type: 'update', categoryId: 'lab', collapsed: true })

    const { store: reloaded } = await store(directory)
    expect(reloaded.snapshot()).toEqual({
      revision: 2,
      categories: [{ id: 'lab', name: 'Homelab', collapsed: true, sessions: ['hub:a'] }],
    })
  })

  it('refuses a change made against a revision the hub has moved past', async () => {
    const { store: categories, file } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab' })
    const saved = await readFile(file, 'utf8')

    await expect(categories.change(0, { type: 'update', categoryId: 'lab', name: 'Lab' }))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(categories.snapshot().revision).toBe(1)
    expect(await readFile(file, 'utf8')).toBe(saved)
  })

  it('keeps its revision for a change that changes nothing', async () => {
    const { store: categories } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab' })
    expect(await categories.change(1, { type: 'update', categoryId: 'lab', collapsed: false }))
      .toMatchObject({ revision: 1 })
  })

  it('refuses to categorize a session the list does not hold, or one that has just gone', async () => {
    const { store: categories } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab' })
    const listed = (key: string) => key !== 'hub:unknown'

    await expect(categories.change(1, { type: 'move', sessions: ['hub:unknown'], categoryId: 'lab' }, listed))
      .rejects.toMatchObject({ statusCode: 409 })
    await expect(categories.change(1, { type: 'create', id: 'b', name: 'B', sessions: ['hub:unknown'] }, listed))
      .rejects.toMatchObject({ statusCode: 409 })

    // The list may not have caught up with a removal the store has already seen.
    await categories.removeSession('hub', 'gone')
    await expect(categories.change(1, { type: 'move', sessions: ['hub:gone'], categoryId: 'lab' }, everyone))
      .rejects.toMatchObject({ statusCode: 409 })
    // Listed again, it can be placed again.
    await categories.sessionListed('hub', 'gone')
    expect(await categories.change(1, { type: 'move', sessions: ['hub:gone'], categoryId: 'lab' }, everyone))
      .toMatchObject({ revision: 2 })
    // Taking one out is always safe.
    expect(await categories.change(2, { type: 'move', sessions: ['hub:unknown'], categoryId: null }, listed))
      .toMatchObject({ revision: 2 })
  })

  it('puts a cleared or recovered session\'s replacement in its predecessor\'s place', async () => {
    const { store: categories } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a', 'hub:b', 'hub:c'] }, everyone)

    expect((await categories.replaceSession('hub', 'b', 'b2')).categories[0].sessions)
      .toEqual(['hub:a', 'hub:b2', 'hub:c'])
    // Reported twice, as an event and in the clear's own response.
    expect(await categories.replaceSession('hub', 'b', 'b2')).toMatchObject({ revision: 2 })
  })

  it('carries the place to a replacement a legacy node reports after a plain removal', async () => {
    const { store: categories } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a', 'hub:b', 'hub:c'] }, everyone)

    await categories.removeSession('hub', 'b')
    expect(categories.snapshot().categories[0].sessions).toEqual(['hub:a', 'hub:c'])
    expect((await categories.replaceSession('hub', 'b', 'b2')).categories[0].sessions)
      .toEqual(['hub:a', 'hub:b2', 'hub:c'])
  })

  it('takes a successor into its ancestor\'s place when it is first listed by lineage', async () => {
    const { store: categories } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a', 'hub:old'] }, everyone)

    expect((await categories.sessionListed('hub', 'new', ['older', 'old'])).categories[0].sessions)
      .toEqual(['hub:a', 'hub:new'])
  })

  it('never places a session it discovers', async () => {
    const { store: categories } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a'] }, everyone)

    expect(await categories.sessionListed('hub', 'found')).toEqual({
      revision: 1,
      categories: [{ id: 'lab', name: 'Homelab', collapsed: false, sessions: ['hub:a'] }],
    })
    expect(await categories.sessionListed('hub', 'a')).toMatchObject({ revision: 1 })
  })

  it('remembers a closed session\'s place and gives it back when it is reopened', async () => {
    const { store: categories, directory } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a', 'hub:b', 'hub:c'] }, everyone)

    await categories.sessionClosed('hub', 'b')
    const { store: restarted } = await store(directory)
    await restarted.change(restarted.snapshot().revision, { type: 'move', sessions: ['hub:c'], categoryId: 'lab', index: 0 }, everyone)
    expect((await restarted.sessionListed('hub', 'b')).categories[0].sessions)
      .toEqual(['hub:c', 'hub:a', 'hub:b'])
  })

  it('forgets a closed session once it can no longer be reopened', async () => {
    let now = Date.parse('2026-11-01T00:00:00Z')
    const { store: categories, directory } = await store(undefined, () => now)
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a', 'hub:b'] }, everyone)
    await categories.sessionClosed('hub', 'b')

    now += CLOSED_SESSION_RETENTION_MS + DAY + 1
    const { store: later } = await store(directory, () => now)
    expect(later.snapshot().categories[0].sessions).toEqual(['hub:a'])
    expect((await later.sessionListed('hub', 'b')).categories[0].sessions).toEqual(['hub:a'])
  })

  it('drops the closed mark of a session no category holds any more, so its file still loads', async () => {
    const { store: categories, directory } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a'] }, everyone)
    await categories.change(1, { type: 'create', id: 'ops', name: 'Ops', sessions: ['hub:b'] }, everyone)
    await categories.sessionClosed('hub', 'a')
    await categories.sessionClosed('hub', 'b')
    await categories.change(4, { type: 'delete', categoryId: 'lab' })
    await categories.change(5, { type: 'move', sessions: ['hub:b'], categoryId: null })

    const { store: restarted } = await store(directory)
    expect(restarted.unavailableReason()).toBeUndefined()
    expect(restarted.snapshot()).toEqual({
      revision: 6,
      categories: [{ id: 'ops', name: 'Ops', collapsed: false, sessions: [] }],
    })
    // Reopened, neither has a place to take back.
    await restarted.sessionListed('hub', 'a')
    expect((await restarted.sessionListed('hub', 'b')).categories[0].sessions).toEqual([])
  })

  it('takes a deleted session and an unpaired computer\'s sessions out of their categories', async () => {
    const { store: categories } = await store()
    await categories.change(0, {
      type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a', 'node:b', 'node:c', 'hub:d'],
    }, everyone)

    await categories.removeSession('hub', 'a')
    await categories.sessionClosed('hub', 'd')
    await categories.removeSession('hub', 'd')
    expect(categories.snapshot().categories[0].sessions).toEqual(['node:b', 'node:c'])
    await categories.sessionListed('hub', 'd')
    expect(categories.snapshot().categories[0].sessions).toEqual(['node:b', 'node:c'])

    await categories.removeComputer('node')
    expect(categories.snapshot().categories[0].sessions).toEqual([])
    await expect(categories.change(categories.snapshot().revision, {
      type: 'move', sessions: ['node:b'], categoryId: 'lab',
    }, everyone)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('keeps what it does not know when it writes', async () => {
    const directory = await folder()
    const file = path.join(directory, 'session-categories.json')
    await writeFile(file, JSON.stringify({
      version: 1,
      revision: 4,
      futureSetting: { kept: true },
      categories: [{ id: 'lab', name: 'Homelab', collapsed: false, sessions: ['hub:a'], color: 'teal' }],
      closed: {},
    }))
    const { store: categories } = await store(directory)
    await categories.change(4, { type: 'update', categoryId: 'lab', name: 'Lab' })

    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({
      version: 1,
      revision: 5,
      futureSetting: { kept: true },
      categories: [{ id: 'lab', name: 'Lab', collapsed: false, sessions: ['hub:a'], color: 'teal' }],
      closed: {},
    })
  })

  it('leaves a newer or unreadable file alone and reports categories unavailable', async () => {
    for (const contents of [
      JSON.stringify({ version: 2, revision: 9, categories: [] }),
      '{ not json',
    ]) {
      const directory = await folder()
      const file = path.join(directory, 'session-categories.json')
      await writeFile(file, contents)
      const { store: categories } = await store(directory)

      expect(categories.unavailableReason()).toMatch(/categories/i)
      await expect(categories.change(0, { type: 'create', id: 'lab', name: 'Homelab' }))
        .rejects.toMatchObject({ statusCode: 503 })
      await categories.sessionClosed('hub', 'a')
      await categories.removeComputer('hub')
      expect(await readFile(file, 'utf8')).toBe(contents)
    }
  })

  it('starts with categories unavailable rather than failing when its file cannot be read', async () => {
    const directory = await folder()
    await mkdir(path.join(directory, 'session-categories.json'))
    const { store: categories } = await store(directory)

    expect(categories.unavailableReason()).toMatch(/cannot be read/)
    await expect(categories.change(0, { type: 'create', id: 'lab', name: 'Homelab' }))
      .rejects.toMatchObject({ statusCode: 503 })
  })

  it('leaves a file it can read but does not recognize alone, rather than repair it', async () => {
    const malformed = [
      { categories: 'none' },
      { categories: [{ id: 'lab', sessions: [] }] },
      { categories: [{ id: 'has space', name: 'Lab', collapsed: false, sessions: [] }] },
      { categories: [{ id: 'lab', name: 'Lab', collapsed: 'yes', sessions: [] }] },
      { categories: [{ id: 'lab', name: 'Lab', collapsed: false, sessions: ['hub:a', 'no-colon'] }] },
      {
        categories: [
          { id: 'lab', name: 'Lab', collapsed: false, sessions: ['hub:a'] },
          { id: 'other', name: 'Other', collapsed: false, sessions: ['hub:a'] },
        ],
      },
      {
        categories: [
          { id: 'lab', name: 'Lab', collapsed: false, sessions: [] },
          { id: 'lab', name: 'Again', collapsed: false, sessions: [] },
        ],
      },
      { categories: [], closed: { 'hub:a': '2026-11-01T00:00:00Z' } },
      {
        categories: [{ id: 'lab', name: 'Lab', collapsed: false, sessions: ['hub:a'] }],
        closed: { 'hub:a': 'last week' },
      },
      { revision: -1, categories: [] },
      // Neither could be written past: the next revision would not be a safe integer.
      { revision: 2 ** 53, categories: [] },
      { revision: Number.MAX_SAFE_INTEGER, categories: [] },
    ]
    for (const shape of malformed) {
      const directory = await folder()
      const file = path.join(directory, 'session-categories.json')
      const contents = JSON.stringify({ version: 1, revision: 2, closed: {}, ...shape })
      await writeFile(file, contents)
      const { store: categories } = await store(directory)

      expect(categories.unavailableReason()).toMatch(/not readable/)
      await categories.sessionListed('hub', 'a')
      await categories.removeComputer('hub')
      expect(await readFile(file, 'utf8')).toBe(contents)
    }
  })

  it('stops at the last revision it can count rather than repeat one', async () => {
    const directory = await folder()
    const file = path.join(directory, 'session-categories.json')
    const last = Number.MAX_SAFE_INTEGER
    await writeFile(file, JSON.stringify({
      version: 1, revision: last - 1, closed: {},
      categories: [{ id: 'lab', name: 'Homelab', collapsed: false, sessions: [] }],
    }))
    const { store: categories } = await store(directory)

    expect(await categories.change(last - 1, { type: 'update', categoryId: 'lab', collapsed: true }))
      .toMatchObject({ revision: last })
    await expect(categories.change(last, { type: 'update', categoryId: 'lab', collapsed: false }))
      .rejects.toMatchObject({ statusCode: 503 })
    await expect(categories.removeComputer('hub')).resolves.toMatchObject({ revision: last })
    expect(JSON.parse(await readFile(file, 'utf8'))).toMatchObject({ revision: last, categories: [{ collapsed: true }] })
  })

  it('keeps what a category it could not delete holds that it does not know', async () => {
    const directory = await folder()
    const file = path.join(directory, 'session-categories.json')
    await writeFile(file, JSON.stringify({
      version: 1, revision: 1, closed: {},
      categories: [{ id: 'lab', name: 'Homelab', collapsed: false, sessions: [], color: 'teal' }],
    }))
    const { store: categories } = await store(directory)

    await rm(directory, { recursive: true, force: true })
    await writeFile(directory, 'blocked')
    await expect(categories.change(1, { type: 'delete', categoryId: 'lab' })).rejects.toThrow()
    await rm(directory, { force: true })
    await mkdir(directory)

    await categories.change(1, { type: 'update', categoryId: 'lab', collapsed: true })
    expect(JSON.parse(await readFile(file, 'utf8')).categories).toEqual([
      { id: 'lab', name: 'Homelab', collapsed: true, sessions: [], color: 'teal' },
    ])
  })

  it('refuses to place a session that a clear or recovery has just replaced', async () => {
    const { store: categories } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a'] }, everyone)
    await categories.change(1, { type: 'create', id: 'other', name: 'Other', sessions: ['hub:old'] }, everyone)

    await categories.replaceSession('hub', 'a', 'a2')
    await categories.sessionListed('hub', 'new', ['old'])
    const revision = categories.snapshot().revision
    for (const gone of ['hub:a', 'hub:old']) {
      await expect(categories.change(revision, { type: 'move', sessions: [gone], categoryId: 'lab' }, everyone))
        .rejects.toMatchObject({ statusCode: 409 })
    }
    expect(await categories.change(revision, { type: 'move', sessions: ['hub:new'], categoryId: 'lab' }, everyone))
      .toMatchObject({ revision: revision + 1 })
  })

  it('does not give a category back to a session reopened after it could no longer be', async () => {
    let now = Date.parse('2026-11-01T00:00:00Z')
    const { store: categories } = await store(undefined, () => now)
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a', 'hub:b'] }, everyone)
    await categories.sessionClosed('hub', 'b')

    now += CLOSED_SESSION_RETENTION_MS + DAY + 1
    expect((await categories.sessionListed('hub', 'b')).categories[0].sessions).toEqual(['hub:a'])
  })

  it('keeps the last committed categories when a write fails', async () => {
    const { store: categories, directory } = await store()
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab' })

    // Replacing the directory with a file makes the temporary write fail.
    await rm(directory, { recursive: true, force: true })
    await writeFile(directory, 'blocked')
    await expect(categories.change(1, { type: 'update', categoryId: 'lab', collapsed: true })).rejects.toThrow()
    await rm(directory, { force: true })
    await mkdir(directory)

    expect(categories.snapshot()).toMatchObject({ revision: 1, categories: [{ collapsed: false }] })
    expect(await categories.change(1, { type: 'update', categoryId: 'lab', collapsed: true }))
      .toMatchObject({ revision: 2 })
  })

  it('never touches the session order file beside it', async () => {
    const directory = await folder()
    const order = new SessionOrderStore(directory)
    await order.initialize()
    await order.appendSession('hub', 'a')
    const orderFile = path.join(directory, 'session-order.json')
    const before = { text: await readFile(orderFile, 'utf8'), modified: (await stat(orderFile)).mtimeMs }

    const { store: categories } = await store(directory)
    await categories.change(0, { type: 'create', id: 'lab', name: 'Homelab', sessions: ['hub:a'] }, everyone)
    await categories.change(1, { type: 'move', sessions: ['hub:a'], categoryId: null })
    await categories.sessionClosed('hub', 'a')
    await categories.removeComputer('hub')

    expect(await readFile(orderFile, 'utf8')).toBe(before.text)
    expect((await stat(orderFile)).mtimeMs).toBe(before.modified)
  })
})
