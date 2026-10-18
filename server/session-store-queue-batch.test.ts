import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { QueuedPrompt } from '../shared/contracts.js'
import { SessionStore } from './session-store.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

async function store() {
  const directory = await mkdtemp(path.join(tmpdir(), 'queue-batch-store-'))
  directories.push(directory)
  const created = new SessionStore(directory)
  await created.initialize()
  await created.create({
    id: 'session', cwd: '/project', title: 'Project', updatedAt: '2026-10-18T00:00:00.000Z',
    status: 'running', messages: [],
  })
  return { store: created, directory }
}

function prompts(batchId: string, contents: string[]): QueuedPrompt[] {
  return contents.map((content, index) => ({
    id: `${batchId}-${index}`, content, createdAt: '2026-10-18T00:00:01.000Z',
    batch: { id: batchId, index, size: contents.length },
  }))
}

describe('SessionStore.enqueueBatch', () => {
  it('appends every prompt after the existing queue in one durable write', async () => {
    const { store: sessions, directory } = await store()
    await sessions.enqueuePrompt('session', { id: 'earlier', content: 'Earlier', createdAt: 't' })
    const before = sessions.get('session')!.revision ?? 0
    const result = await sessions.enqueueBatch('session', {
      id: 'batch-0001', digest: 'digest-1', prompts: prompts('batch-0001', ['one', 'two', 'three']),
    })
    expect(result.duplicate).toBe(false)
    expect(result.promptIds).toEqual(['batch-0001-0', 'batch-0001-1', 'batch-0001-2'])
    expect(result.session.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['Earlier', 'one', 'two', 'three'])
    expect(result.session.queuedCount).toBe(4)
    // One mutation: the revision moves once for the whole batch.
    expect(result.session.revision).toBe(before + 1)

    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('session')?.queuedPrompts?.map((prompt) => prompt.batch?.index ?? 'single'))
      .toEqual(['single', 0, 1, 2])
    expect(reloaded.get('session')?.queueBatches).toEqual([{
      id: 'batch-0001', digest: 'digest-1', promptIds: result.promptIds, admittedAt: expect.any(String),
    }])
  })

  it('recognises a retried batch, even after a restart and after its prompts ran', async () => {
    const { store: sessions, directory } = await store()
    const first = await sessions.enqueueBatch('session', {
      id: 'batch-0001', digest: 'digest-1', prompts: prompts('batch-0001', ['one', 'two']),
    })
    // The prompts have since been delivered and left the queue.
    await sessions.update('session', (session) => {
      session.queuedPrompts = []
      session.queuedCount = 0
    })
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    const revision = reloaded.get('session')!.revision
    const retry = await reloaded.enqueueBatch('session', {
      id: 'batch-0001', digest: 'digest-1', prompts: prompts('batch-0001-retry', ['one', 'two']),
    })
    expect(retry).toMatchObject({ duplicate: true, promptIds: first.promptIds })
    expect(retry.session.queuedPrompts ?? []).toEqual([])
    expect(reloaded.get('session')!.revision).toBe(revision)
  })

  it('refuses the same batch ID for different prompts rather than merging them', async () => {
    const { store: sessions } = await store()
    await sessions.enqueueBatch('session', {
      id: 'batch-0001', digest: 'digest-1', prompts: prompts('batch-0001', ['one']),
    })
    await expect(sessions.enqueueBatch('session', {
      id: 'batch-0001', digest: 'digest-2', prompts: prompts('batch-0001', ['other']),
    })).rejects.toMatchObject({ statusCode: 409 })
    expect(sessions.get('session')?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['one'])
  })

  it('remembers only the latest batches', async () => {
    const { store: sessions } = await store()
    for (let index = 0; index < 22; index += 1) {
      await sessions.enqueueBatch('session', {
        id: `batch-${String(index).padStart(4, '0')}`, digest: `d${index}`,
        prompts: prompts(`b${index}`, [`p${index}`]),
      })
    }
    const remembered = sessions.get('session')!.queueBatches!.map((batch) => batch.id)
    expect(remembered).toHaveLength(20)
    expect(remembered[0]).toBe('batch-0002')
    expect(remembered.at(-1)).toBe('batch-0021')
  })

  it('queues nothing when the write fails, so the same batch can be sent again', async () => {
    const { store: sessions, directory } = await store()
    await rm(directory, { recursive: true, force: true })
    await writeFile(directory, 'not a directory')
    await expect(sessions.enqueueBatch('session', {
      id: 'batch-0001', digest: 'digest-1', prompts: prompts('batch-0001', ['one', 'two']),
    })).rejects.toThrow()
    expect(sessions.get('session')?.queuedPrompts ?? []).toEqual([])
    expect(sessions.get('session')?.queueBatches).toBeUndefined()
    await rm(directory, { force: true })
  })

  it('refuses a session that does not exist', async () => {
    const { store: sessions } = await store()
    await expect(sessions.enqueueBatch('missing', {
      id: 'batch-0001', digest: 'digest-1', prompts: prompts('batch-0001', ['one']),
    })).rejects.toThrow(/does not exist/)
  })
})
