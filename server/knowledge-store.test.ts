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

  it('persists the read confinement of a session-created root', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const reservation = await store.reserveRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }, {
      confinementPath: '/home/user/project',
    })
    await reservation.finalize()

    expect(store.getRootConfinement(reservation.root.id)).toBe(
      '/home/user/project',
    )
    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    expect(restored.getRootConfinement(reservation.root.id)).toBe(
      '/home/user/project',
    )
  })

  it('rejects a confinement claim whose binding revision cannot advance', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()

    await expect(store.reserveRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'session',
        expectedRevision: Number.MAX_SAFE_INTEGER,
      },
    })).rejects.toThrow('cannot advance')
    expect(store.listRoots()).toEqual([])
  })

  it('rolls back a confinement added to an existing root when binding fails', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const existing = await store.addRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    })

    const reservation = await store.reserveRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'session',
        expectedRevision: 0,
      },
    })
    expect(store.getRootConfinement(existing.id)).toBe('/home/user/project')

    await expect(reservation.rollback()).resolves.toBe(false)
    expect(store.getRoot(existing.id)).toEqual(existing)
    expect(store.getRootConfinement(existing.id)).toBeUndefined()
  })

  it('rolls back an uncommitted existing-root confinement after restart', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const existing = await store.addRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    })
    await store.reserveRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'session',
        expectedRevision: 0,
      },
    })

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    await restored.recoverProvisionalRoots([])

    expect(restored.getRoot(existing.id)).toEqual(existing)
    expect(restored.getRootConfinement(existing.id)).toBeUndefined()
  })

  it('finalizes a committed existing-root confinement after restart', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const existing = await store.addRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    })
    await store.reserveRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'session',
        expectedRevision: 0,
      },
    })

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    await restored.recoverProvisionalRoots([{
      computerId: 'computer',
      sessionId: 'session',
      rootId: existing.id,
      rootPath: '.',
      revision: 1,
    }])

    expect(restored.getRootConfinement(existing.id)).toBe(
      '/home/user/project',
    )
    const finalRestart = new KnowledgeStore(directory)
    await finalRestart.initialize()
    await finalRestart.recoverProvisionalRoots([])
    expect(finalRestart.getRootConfinement(existing.id)).toBe(
      '/home/user/project',
    )
  })

  it('does not recover confinement from the pre-update binding revision', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const existing = await store.addRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    })
    await store.reserveRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'session',
        expectedRevision: 0,
      },
    })

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    await restored.recoverProvisionalRoots([{
      computerId: 'computer',
      sessionId: 'session',
      rootId: existing.id,
      rootPath: '.',
      revision: 0,
    }])

    expect(restored.getRootConfinement(existing.id)).toBeUndefined()
  })

  it('does not recover path-mode confinement from a nested root binding', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const existing = await store.addRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    })
    await store.reserveRoot({
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'session',
        expectedRevision: 0,
      },
    })

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    await restored.recoverProvisionalRoots([{
      computerId: 'computer',
      sessionId: 'session',
      rootId: existing.id,
      rootPath: 'docs',
      revision: 1,
    }])

    expect(restored.getRootConfinement(existing.id)).toBeUndefined()
  })

  it('does not let a duplicate-root reservation finalize another claim', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }
    await store.addRoot(input)
    const pathReservation = await store.reserveRoot(input, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'session',
        expectedRevision: 0,
      },
    })
    const duplicateRoot = await store.reserveRoot(input)

    await expect(duplicateRoot.finalize()).resolves.toBe(true)
    await expect(pathReservation.rollback()).resolves.toBe(false)

    expect(
      store.getRootConfinement(pathReservation.root.id),
    ).toBeUndefined()
  })

  it('requires each concurrent confinement claim to commit its binding', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }
    await store.addRoot(input)
    const first = await store.reserveRoot(input, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'first',
        expectedRevision: 0,
      },
    })
    const second = await store.reserveRoot(input, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'second',
        expectedRevision: 0,
      },
    })

    expect(first.requiresBindingCommit).toBe(true)
    expect(second.requiresBindingCommit).toBe(true)
  })

  it('rejects a conflicting confinement while another claim is pending', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }
    await store.addRoot(input)
    await store.reserveRoot(input, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'first',
        expectedRevision: 0,
      },
    })

    await expect(store.reserveRoot(input, {
      confinementPath: '/home/user',
      binding: {
        computerId: 'computer',
        sessionId: 'second',
        expectedRevision: 0,
      },
    })).rejects.toMatchObject({ statusCode: 409 })
  })

  it('rejects a conflicting confinement after the root is finalized', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'computer',
      computerName: 'development',
      path: '/home/user/project/knowledge',
      name: 'knowledge',
    }
    const first = await store.reserveRoot(input, {
      confinementPath: '/home/user/project',
      binding: {
        computerId: 'computer',
        sessionId: 'first',
        expectedRevision: 0,
      },
    })
    await first.finalize()

    await expect(store.reserveRoot(input, {
      confinementPath: '/home/user',
      binding: {
        computerId: 'computer',
        sessionId: 'second',
        expectedRevision: 0,
      },
    })).rejects.toMatchObject({ statusCode: 409 })
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

  it('keeps a provisional root when another request finalizes its reuse', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/notes',
      name: 'notes',
    }

    const creator = await store.reserveRoot(input)
    const reuser = await store.reserveRoot(input)
    expect(creator.created).toBe(true)
    expect(reuser.created).toBe(false)

    await reuser.finalize()
    await expect(creator.rollback()).resolves.toBe(false)
    expect(store.listRoots()).toEqual([creator.root])
  })

  it('removes a provisional root after every request rolls back', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/notes',
      name: 'notes',
    }

    const creator = await store.reserveRoot(input)
    const reuser = await store.reserveRoot(input)

    await expect(creator.rollback()).resolves.toBe(false)
    await expect(reuser.rollback()).resolves.toBe(true)
    expect(store.listRoots()).toEqual([])
  })

  it('never rolls back a root that existed before the reservation', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const input = {
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/notes',
      name: 'notes',
    }
    const existing = await store.addRoot(input)

    const reservation = await store.reserveRoot(input)
    expect(reservation.created).toBe(false)
    await expect(reservation.rollback()).resolves.toBe(false)
    expect(store.listRoots()).toEqual([existing])
  })

  it('rolls back a provisional root when guarded finalization is refused', async () => {
    const directory = await temporaryDirectory()
    const store = new KnowledgeStore(directory)
    await store.initialize()
    const reservation = await store.reserveRoot({
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/notes',
      name: 'notes',
    })

    await expect(
      reservation.finalize(() => false),
    ).resolves.toBe(false)
    expect(store.listRoots()).toEqual([])
  })

  it('removes an unreferenced provisional root after restart recovery', async () => {
    const directory = await temporaryDirectory()
    const initial = new KnowledgeStore(directory)
    await initial.initialize()
    const reservation = await initial.reserveRoot({
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/notes',
      name: 'notes',
    })

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    await expect(restored.recoverProvisionalRoots([])).resolves.toBe(1)
    expect(restored.listRoots()).toEqual([])

    const persisted = JSON.parse(
      await readFile(path.join(directory, 'knowledge.json'), 'utf8'),
    )
    expect(persisted.provisionalRootIds).toEqual([])
    expect(persisted.roots).not.toContainEqual(reservation.root)
  })

  it('finalizes a referenced provisional root after restart recovery', async () => {
    const directory = await temporaryDirectory()
    const initial = new KnowledgeStore(directory)
    await initial.initialize()
    const reservation = await initial.reserveRoot({
      computerId: 'worker',
      computerName: 'worker-node',
      path: '/home/user/notes',
      name: 'notes',
    })

    const restored = new KnowledgeStore(directory)
    await restored.initialize()
    await expect(
      restored.recoverProvisionalRoots([reservation.root.id]),
    ).resolves.toBe(0)
    expect(restored.listRoots()).toEqual([reservation.root])

    const finalRestart = new KnowledgeStore(directory)
    await finalRestart.initialize()
    await expect(finalRestart.recoverProvisionalRoots([])).resolves.toBe(0)
    expect(finalRestart.listRoots()).toEqual([reservation.root])
  })
})
