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
})
