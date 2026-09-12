import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { KnowledgeStore } from './knowledge-store.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'knowledge-test-'))
  directories.push(directory)
  return directory
}

describe('KnowledgeStore', () => {
  it('persists unique roots privately and removes them', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/notes',
      name: 'notes',
    }

    const first = await store.addRoot(input)
    const duplicate = await store.addRoot(input)

    expect(duplicate.id).toBe(first.id)
    expect(store.listRoots()).toHaveLength(1)
    expect((await stat(path.join(directory, 'knowledge.json'))).mode & 0o777).toBe(
      0o600,
    )

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    expect(restored.listRoots()).toEqual([first])
    expect(restored.getRoot(first.id)).toEqual(first)
    await expect(restored.removeRoot(first.id)).resolves.toBe(true)
    await expect(restored.removeRoot(first.id)).resolves.toBe(false)
  })

  it('keeps a provisional root when another requester finalizes it', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/notes',
      name: 'notes',
    }
    const creatorCandidate = store.prepareRoot(input)
    const reuserCandidate = store.prepareRoot(input)

    const creator = await store.reservePreparedRoot(creatorCandidate.root)
    const reuser = await store.reservePreparedRoot(reuserCandidate.root)

    expect(creator.created).toBe(true)
    expect(reuser).toMatchObject({ root: creator.root, created: false })
    await expect(creator.rollback()).resolves.toBe(false)
    await reuser.finalize()
    expect(store.getRoot(creator.root.id)).toEqual(creator.root)
  })

  it.each(['creator', 'reuser'] as const)(
    'removes a provisional root after the %s rolls back first and both requests fail',
    async (first) => {
      const directory = await temporaryDirectory()
      const store = new KnowledgeStore(directory)
      await store.initialize()
      const input = {
        computerId: 'computer',
        computerName: 'development',
        path: '/home/user/notes',
        name: 'notes',
      }
      const creatorCandidate = store.prepareRoot(input)
      const reuserCandidate = store.prepareRoot(input)
      const creator = await store.reservePreparedRoot(creatorCandidate.root)
      const reuser = await store.reservePreparedRoot(reuserCandidate.root)
      const reservations = { creator, reuser }
      const second = first === 'creator' ? 'reuser' : 'creator'

      await expect(reservations[first].rollback()).resolves.toBe(false)
      await expect(reservations[second].rollback()).resolves.toBe(true)

      expect(store.getRoot(creator.root.id)).toBeUndefined()
      const restored = new KnowledgeStore(directory)
      await restored.initialize()
      expect(restored.listRoots()).toEqual([])
    },
  )

  it('keeps a provisional root when the reuser finalizes before the creator rolls back', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/notes',
      name: 'notes',
    }
    const creatorCandidate = store.prepareRoot(input)
    const reuserCandidate = store.prepareRoot(input)
    const creator = await store.reservePreparedRoot(creatorCandidate.root)
    const reuser = await store.reservePreparedRoot(reuserCandidate.root)

    await reuser.finalize()
    await expect(creator.rollback()).resolves.toBe(false)

    expect(store.getRoot(creator.root.id)).toEqual(creator.root)
  })

  it('loads a state file written before roots replaced bookmarks', async () => {
    const directory = await temporaryDirectory()
    const root = {
      id: 'existing-root',
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/notes',
      name: 'notes',
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    await writeFile(
      path.join(directory, 'knowledge.json'),
      JSON.stringify({
        bookmarks: [{ id: 'old', path: 'README.md', kind: 'file' }],
        roots: [root],
      }),
    )

    const store = new KnowledgeStore(directory)
    await store.initialize()

    expect(store.listRoots()).toEqual([root])

    // The obsolete key is dropped rather than carried forward.
    await store.removeRoot(root.id)
    const written = JSON.parse(
      await readFile(path.join(directory, 'knowledge.json'), 'utf8'),
    )
    expect(written).not.toHaveProperty('bookmarks')
  })

  it('drops the roots of a computer that is no longer paired', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    await store.addRoot({
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/notes',
      name: 'notes',
    })
    await store.addRoot({
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/specs',
      name: 'specs',
    })
    const kept = await store.addRoot({
      computerId: 'hub',
      computerName: 'development',
      path: '/home/user/reference',
      name: 'reference',
    })

    await expect(store.removeRootsForComputer('worker')).resolves.toBe(2)
    expect(store.listRoots()).toEqual([kept])
    await expect(store.removeRootsForComputer('worker')).resolves.toBe(0)

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    expect(restored.listRoots()).toEqual([kept])
  })
})
