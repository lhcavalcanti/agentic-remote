import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
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

describe('KnowledgeStore', () => {
  it('persists unique bookmarks privately and removes them', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'knowledge-test-'))
    directories.push(directory)
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      sessionId: 'session',
      sessionTitle: 'Project',
      path: 'README.md',
      name: 'README.md',
      kind: 'file' as const,
    }
    const first = await store.add(input)
    const duplicate = await store.add(input)
    expect(duplicate.id).toBe(first.id)
    expect(store.list()).toHaveLength(1)
    expect((await stat(path.join(directory, 'knowledge.json'))).mode & 0o777).toBe(
      0o600,
    )

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    expect(restored.list()).toEqual([first])
    expect(
      JSON.parse(await readFile(path.join(directory, 'knowledge.json'), 'utf8')),
    ).toMatchObject({ bookmarks: [first] })
    await expect(restored.remove(first.id)).resolves.toBe(true)
    await expect(restored.remove(first.id)).resolves.toBe(false)
  })
})
