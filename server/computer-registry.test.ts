import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ComputerRegistry } from './computer-registry.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('ComputerRegistry', () => {
  it('serializes concurrent trust changes without resurrecting removals', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'computer-registry-test-'))
    directories.push(directory)
    const registry = new ComputerRegistry(directory)
    await registry.initialize()
    await registry.upsert({
      id: 'remove-me',
      name: 'Old node',
      baseUrl: 'http://127.0.0.1:4001',
      token: 'old-token',
    })

    await Promise.all([
      registry.upsert({
        id: 'keep-me',
        name: 'New node',
        baseUrl: 'http://127.0.0.1:4002',
        token: 'new-token',
      }),
      registry.remove('remove-me'),
    ])

    const reloaded = new ComputerRegistry(directory)
    await reloaded.initialize()
    expect(reloaded.list()).toEqual([
      expect.objectContaining({ id: 'keep-me' }),
    ])
  })
})
