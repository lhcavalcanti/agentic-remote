import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SessionStore } from './session-store.js'

const temporaryDirectories: string[] = []

async function createStore(): Promise<{
  directory: string
  store: SessionStore
}> {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-remote-test-'))
  temporaryDirectories.push(directory)
  const store = new SessionStore(directory)
  await store.initialize()
  return { directory, store }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('SessionStore', () => {
  it('persists sessions and protects the state file', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    const statePath = path.join(directory, 'state.json')
    const metadata = await stat(statePath)
    const contents = JSON.parse(await readFile(statePath, 'utf8')) as {
      sessions: Record<string, unknown>
    }

    expect(metadata.mode & 0o777).toBe(0o600)
    expect(contents.sessions['session-1']).toBeDefined()
  })

  it('streams and finishes an assistant message', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    await store.addMessage('session-1', {
      id: 'message-1',
      role: 'assistant',
      content: '',
      createdAt: '2026-07-22T00:00:01.000Z',
      streaming: true,
    })

    store.streamMessage('session-1', 'message-1', 'Hello')
    store.streamMessage('session-1', 'message-1', ' world')
    await store.finishMessage('session-1', 'message-1')

    expect(store.get('session-1')?.messages[0]).toMatchObject({
      content: 'Hello world',
      streaming: false,
    })
  })

  it('resets interrupted transient state when reloaded', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      activity: 'Thinking',
      messages: [
        {
          id: 'message-1',
          role: 'assistant',
          content: 'Partial',
          createdAt: '2026-07-22T00:00:01.000Z',
          streaming: true,
        },
      ],
    })
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()

    expect(reloaded.get('session-1')).toMatchObject({
      status: 'idle',
      activity: undefined,
      messages: [{ streaming: false }],
    })
  })

  it('discovers sessions without replacing locally stored history', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'existing',
      cwd: '/tmp/old-project',
      title: 'Old title',
      updatedAt: '2026-07-21T00:00:00.000Z',
      status: 'idle',
      messages: [
        {
          id: 'message-1',
          role: 'user',
          content: 'Keep me',
          createdAt: '2026-07-21T00:00:00.000Z',
        },
      ],
    })
    await store.create({
      id: 'stale',
      cwd: '/tmp/deleted-project',
      title: 'Deleted elsewhere',
      updatedAt: '2026-07-21T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    await store.syncDiscovered([
      {
        id: 'existing',
        cwd: '/tmp/project',
        title: 'Updated title',
        updatedAt: '2026-07-22T00:00:00.000Z',
      },
      {
        id: 'discovered',
        cwd: '/tmp/another-project',
        title: 'Discovered session',
        updatedAt: '2026-07-22T01:00:00.000Z',
      },
    ])

    expect(store.get('existing')).toMatchObject({
      cwd: '/tmp/project',
      title: 'Updated title',
      messages: [{ content: 'Keep me' }],
    })
    expect(store.get('discovered')).toMatchObject({
      title: 'Discovered session',
      messages: [],
    })
    expect(store.get('stale')).toMatchObject({
      title: 'Deleted elsewhere',
      messages: [],
    })
  })
})
