import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { NodeIdentityStore } from './node-identity.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('NodeIdentityStore lifecycle generation', () => {
  it('preserves the local lifecycle generation across restart', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'node-identity-test-'))
    directories.push(directory)
    const first = new NodeIdentityStore(directory)
    await first.initialize()

    const restarted = new NodeIdentityStore(directory)
    await restarted.initialize()

    expect(first.lifecycleGeneration).toMatch(/^[0-9a-f-]{36}$/)
    expect(restarted.lifecycleGeneration).toBe(first.lifecycleGeneration)
  })

  it('migrates a legacy identity to one durable lifecycle generation', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'node-identity-test-'))
    directories.push(directory)
    await writeFile(path.join(directory, 'node.json'), JSON.stringify({
      version: 1,
      id: 'legacy-node',
      name: 'Legacy node',
      token: 'legacy-token',
    }))

    const identity = new NodeIdentityStore(directory)
    await identity.initialize()
    const persisted = JSON.parse(
      await readFile(path.join(directory, 'node.json'), 'utf8'),
    ) as { version: number; lifecycleGeneration: string }

    expect(persisted).toMatchObject({
      version: 2,
      lifecycleGeneration: identity.lifecycleGeneration,
    })
  })
})
