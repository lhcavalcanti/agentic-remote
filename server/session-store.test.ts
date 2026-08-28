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

  it('persists terminal ownership for boot recovery', async () => {
    const { directory, store } = await createStore()
    await store.create(
      {
        id: 'terminal-session',
        cwd: '/tmp/terminal-project',
        title: 'Terminal project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.create(
      {
        id: 'sdk-session',
        cwd: '/tmp/sdk-project',
        title: 'SDK project',
        updatedAt: '2026-07-22T00:00:01.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'sdk' },
    )

    const restored = new SessionStore(directory)
    await restored.initialize()

    expect(restored.terminalRecoverySessions()).toEqual([
      expect.objectContaining({
        id: 'terminal-session',
        executionMode: 'tmux',
        isOpen: true,
      }),
    ])
    expect(restored.get('sdk-session')).toMatchObject({
      executionMode: 'sdk',
    })
  })

  it('migrates active terminal sessions into boot recovery', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'legacy-terminal',
      cwd: '/tmp/legacy-project',
      title: 'Legacy terminal',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      isOpen: false,
      messages: [],
    })

    await store.syncBackends(['legacy-terminal'], [])
    const restored = new SessionStore(directory)
    await restored.initialize()

    expect(restored.terminalRecoverySessions()).toEqual([
      expect.objectContaining({
        id: 'legacy-terminal',
        isOpen: true,
      }),
    ])
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

  it('keeps completed tool activities in conversation history', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      messages: [],
    })
    await store.startToolActivity(
      'session-1',
      'first',
      'Bash\n$ pnpm test',
      '2026-07-22T00:00:01.000Z',
    )
    await store.startToolActivity(
      'session-1',
      'second',
      'View\n/tmp/source.ts',
      '2026-07-22T00:00:02.000Z',
    )
    await store.finishToolActivity('session-1', 'second', false)
    await store.addMessage('session-1', {
      id: 'assistant',
      role: 'assistant',
      content: '',
      createdAt: '2026-07-22T00:00:03.000Z',
      streaming: true,
    })
    store.setMessageContent('session-1', 'assistant', 'Done')

    expect(store.get('session-1')?.messages).toEqual([
      expect.objectContaining({
        id: 'tool:first',
        activityStatus: 'completed',
      }),
      expect.objectContaining({
        id: 'tool:second',
        activityStatus: 'failed',
      }),
      expect.objectContaining({ id: 'assistant', content: 'Done' }),
    ])
  })

  it('moves a live task completion after its tool activity', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      messages: [],
    })
    await store.addMessage('session-1', {
      id: 'assistant',
      role: 'assistant',
      content: '',
      createdAt: '2026-07-22T00:00:01.000Z',
      streaming: true,
    })
    await store.startToolActivity(
      'session-1',
      'task',
      'Task Complete',
      '2026-07-22T00:00:02.000Z',
    )
    await store.finishTaskCompletion(
      'session-1',
      'task',
      '**Done.**',
      '2026-07-22T00:00:03.000Z',
      'assistant',
    )

    expect(store.get('session-1')?.messages).toEqual([
      {
        id: 'assistant',
        role: 'assistant',
        content: '**Done.**',
        createdAt: '2026-07-22T00:00:03.000Z',
        streaming: false,
      },
    ])
  })

  it('keeps pending terminal requests waiting during transcript sync', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      messages: [],
    })

    await store.update('session-1', (session) => {
      session.pendingPermission = {
        requestId: 'terminal-permission:request',
        title: 'Run command',
        options: [],
      }
    })

    await store.replaceTranscript('session-1', [], 'running', 'Bash')

    expect(store.get('session-1')).toMatchObject({
      status: 'waiting',
      activity: 'Run command',
      pendingPermission: { requestId: 'terminal-permission:request' },
    })
  })

  it('preserves a terminal dispatch that starts during transcript replacement', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    const before = store.get('session-1')
    await store.markTerminalPromptDispatched(
      'session-1',
      '2026-07-22T00:00:02.000Z',
      'Sent to terminal',
    )

    const updated = await store.replaceTranscript(
      'session-1',
      [],
      'idle',
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
    )

    expect(updated).toMatchObject({
      status: 'running',
      activity: 'Sent to terminal',
    })
    expect(updated.revision).toBeGreaterThan(before?.revision || 0)
  })

  it('does not clear a newer terminal dispatch with an older completion', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    const older = '2026-07-22T00:00:01.000Z'
    const newer = '2026-07-22T00:00:02.000Z'
    await store.markTerminalPromptDispatched('session-1', older)
    await store.markTerminalPromptDispatched('session-1', newer)

    const updated = await store.clearQueueDispatch('session-1', older)

    expect(store.queueDispatchAt('session-1')).toBe(newer)
    expect(updated.status).toBe('running')
  })

  it('stores private session uploads and removes them on clear', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    const upload = await store.saveUpload(
      'session-1',
      '../../statement.pdf',
      Buffer.from('financial data'),
    )

    expect(upload.name).toBe('statement.pdf')
    expect(await readFile(upload.path, 'utf8')).toBe('financial data')
    expect((await stat(upload.path)).mode & 0o777).toBe(0o600)

    await store.replaceWithClearedSession('session-1', 'session-2')
    await expect(stat(upload.path)).rejects.toMatchObject({ code: 'ENOENT' })

    await expect(
      store.saveUpload('__proto__', 'orphan.pdf', Buffer.from('data')),
    ).rejects.toThrow('Session __proto__ does not exist')

    const second = await store.saveUpload(
      'session-2',
      'second.pdf',
      Buffer.from('data'),
    )
    await store.remove('session-2')
    await expect(stat(second.path)).rejects.toMatchObject({ code: 'ENOENT' })
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

  it('keeps managed SDK sessions open but closes missing terminal sessions', async () => {
    const { directory, store } = await createStore()
    await store.create(
      {
        id: 'managed-sdk-session',
        cwd: '/tmp/project',
        title: 'Managed SDK project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'sdk' },
    )
    await store.create(
      {
        id: 'managed-terminal-session',
        cwd: '/tmp/project',
        title: 'Managed terminal project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )

    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    await reloaded.syncOpen([])

    expect(reloaded.get('managed-sdk-session')).toMatchObject({
      isOpen: true,
    })
    expect(reloaded.get('managed-terminal-session')).toMatchObject({
      isOpen: false,
    })
    expect(reloaded.get('managed-sdk-session')).not.toHaveProperty('managedOpen')
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

  it('preserves a custom title across discovery and reloads', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'custom-title',
      cwd: '/tmp/project',
      title: 'Generated title',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    await store.renameSession('custom-title', 'My project')
    await store.syncDiscovered([
      {
        id: 'custom-title',
        cwd: '/tmp/project',
        title: 'New generated title',
        updatedAt: '2026-07-23T00:00:00.000Z',
      },
    ])
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()

    expect(reloaded.get('custom-title')).toMatchObject({
      title: 'My project',
    })
    expect(reloaded.get('custom-title')).not.toHaveProperty('customTitle')
  })

  it('persists queued prompts and removes a selected entry', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'queued-session',
      cwd: '/tmp/project',
      title: 'Queued project',
      updatedAt: '2026-07-25T01:00:00.000Z',
      status: 'running',
      messages: [],
    })
    await store.enqueuePrompt('queued-session', {
      id: 'first',
      content: 'First prompt',
      createdAt: '2026-07-25T01:00:01.000Z',
    })
    await store.enqueuePrompt('queued-session', {
      id: 'second',
      content: 'Second prompt',
      createdAt: '2026-07-25T01:00:02.000Z',
    })

    const removed = await store.removeQueuedPrompt('queued-session', 'first')
    await store.markTerminalPromptDispatched(
      'queued-session',
      '2026-07-25T01:00:03.000Z',
    )
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()

    expect(removed.prompt?.content).toBe('First prompt')
    expect(reloaded.get('queued-session')).toMatchObject({
      status: 'running',
      queuedCount: 1,
      queuedPrompts: [{ id: 'second', content: 'Second prompt' }],
    })
    expect(reloaded.queueDispatchAt('queued-session')).toBe(
      '2026-07-25T01:00:03.000Z',
    )

    await reloaded.clearUntrackedTerminalDispatch(
      'queued-session',
      'older-dispatch',
    )
    expect(reloaded.get('queued-session')?.status).toBe('running')
    await reloaded.clearUntrackedTerminalDispatch(
      'queued-session',
      '2026-07-25T01:00:03.000Z',
    )
    expect(reloaded.get('queued-session')?.status).toBe('idle')
    expect(reloaded.queueDispatchAt('queued-session')).toBeUndefined()
  })

  it('keeps only currently active sessions open', async () => {
    const { store } = await createStore()
    for (const id of ['running', 'stopped']) {
      await store.create({
        id,
        cwd: `/tmp/${id}`,
        title: id,
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      })
    }

    await store.syncOpen(['running'])

    expect(store.get('running')?.isOpen).toBe(true)
    expect(store.get('stopped')?.isOpen).toBe(false)
  })

  it('persists every mutation in a burst that shares one write', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-burst',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    await Promise.all(
      Array.from({ length: 25 }, (_unused, index) =>
        store.addMessage('session-burst', {
          id: `message-${index}`,
          role: 'assistant',
          content: `chunk ${index}`,
          createdAt: '2026-07-22T00:00:01.000Z',
        }),
      ),
    )

    const persisted = JSON.parse(
      await readFile(path.join(directory, 'state.json'), 'utf8'),
    ) as {
      sessions: Record<string, { messages: { id: string }[] }>
    }
    expect(persisted.sessions['session-burst'].messages).toHaveLength(25)
  })
})
