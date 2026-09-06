import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
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
  it('keeps the usable store when later legacy-lineage validation rejects a document', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'kept', title: 'Keep this session', cwd: '/project',
      updatedAt: '2026-09-05T00:00:00.000Z', status: 'idle', messages: [],
    })
    const before = store.list()
    const invalid = JSON.stringify({
      version: 1,
      retiredSessionIds: ['kept'],
      sessions: {
        first: { id: 'first', messages: [], replacedSessionIds: ['older'] },
        malformed: { id: 'malformed', messages: [], replacedSessionIds: [null] },
      },
    })
    const filename = path.join(directory, 'state.json')
    await writeFile(filename, invalid)
    await expect(store.initialize()).rejects.toThrow('Invalid session retirement metadata')
    expect(store.list()).toEqual(before)
    expect(store.isRetiredSession('kept')).toBe(false)
    expect(store.isRetiredSession('older')).toBe(false)
    expect(await readFile(filename, 'utf8')).toBe(invalid)
    await store.renameSession('kept', 'Still usable')
    expect(JSON.parse(await readFile(filename, 'utf8')).sessions.kept.title).toBe('Still usable')
  })

  it.each([
    { name: 'null document', value: null },
    { name: 'array document', value: [] },
    { name: 'null sessions', value: { version: 1, sessions: null } },
    { name: 'array sessions', value: { version: 1, sessions: [] } },
    { name: 'populated array sessions', value: { version: 1, sessions: [{}] } },
  ])('rejects a $name without installing or rewriting it', async ({ value }) => {
    const { directory, store } = await createStore()
    const filename = path.join(directory, 'state.json')
    const contents = JSON.stringify(value)
    await writeFile(filename, contents)
    await expect(store.initialize()).rejects.toThrow('Unsupported Agentic Remote state format')
    expect(store.list()).toEqual([])
    expect(await readFile(filename, 'utf8')).toBe(contents)
  })

  it('keeps a suspended session in the list when nothing is running for it', async () => {
    const { store } = await createStore()
    await store.create(
      {
        id: 'resting-session',
        cwd: '/tmp/resting-project',
        title: 'Resting project',
        updatedAt: '2026-07-22T00:00:01.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.setSuspended('resting-session', true)

    // Discovery finds no process for it, which is the point. Reading that as
    // closed would hide the session, and the only way to resume it is the
    // button on the session itself.
    await store.syncOpen([])

    expect(store.get('resting-session')).toMatchObject({
      isOpen: true,
      suspended: true,
    })
  })

  it('leaves a suspended session alone when recovering terminals', async () => {
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
        id: 'resting-session',
        cwd: '/tmp/resting-project',
        title: 'Resting project',
        updatedAt: '2026-07-22T00:00:01.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.setSuspended('resting-session', true)

    const restored = new SessionStore(directory)
    await restored.initialize()

    // Starting a suspended session back up at boot is the opposite of what
    // suspending it asked for.
    expect(restored.terminalRecoverySessions()).toEqual([
      expect.objectContaining({ id: 'terminal-session' }),
    ])
    expect(restored.get('resting-session')).toMatchObject({ suspended: true })
  })

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
    await store.finishToolActivity(
      'session-1',
      'second',
      false,
      '2026-07-22T00:00:03.000Z',
      'Permission denied',
    )
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
        activityResult: 'Permission denied',
        activityDurationMs: 1_000,
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

  it('keeps the whole ancestry of a session cleared many times', async () => {
    // A browser that was away long enough to miss dozens of clears is exactly
    // the one still holding the oldest id, and what it is holding has no
    // expiry of its own. Forgetting the far end of the lineage is what leaves
    // that draft with no way back to the session it belongs to.
    const { store } = await createStore()
    await store.create({
      id: 'session-0',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    for (let index = 0; index < 40; index += 1) {
      await store.replaceWithClearedSession(
        `session-${index}`,
        `session-${index + 1}`,
      )
    }

    const latest = store.get('session-40')
    expect(latest?.replacedSessionIds).toHaveLength(40)
    // The very first id is still reachable from the newest session.
    expect(latest?.replacedSessionIds?.[0]).toBe('session-0')
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

  it('leaves the queue alone when recording a failed prompt cannot be written', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-failed',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    await store.enqueuePrompt('session-failed', {
      id: 'prompt-1',
      content: 'Deploy it',
      createdAt: '2026-07-22T00:00:01.000Z',
    })
    const queued = store.get('session-failed')?.queuedPrompts?.[0]
    expect(queued).toBeDefined()

    const blockedWrite = path.join(directory, 'state.json.tmp')
    await mkdir(blockedWrite)

    // The caller reports the send as unrecovered when this rejects. Leaving
    // the queue entry removed and the prompt recorded as needing recovery
    // handed the reader a draft while the queued copy was still on disk, and
    // a restart delivered it beside the draft.
    await expect(
      store.setFailedPrompt('session-failed', queued!.id, 'Deploy it'),
    ).rejects.toThrow(/EISDIR/)

    await rm(blockedWrite, { recursive: true })
    const after = store.get('session-failed')
    expect(after?.failedPrompt).toBeUndefined()
    expect(after?.queuedPrompts?.map((prompt) => prompt.id)).toEqual([
      queued!.id,
    ])
    expect(after?.queuedCount).toBe(1)
  })

  it('keeps the failed prompt when clearing it cannot be written', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-clear',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    await store.setFailedPrompt('session-clear', 'missing', 'Deploy it')

    const blockedWrite = path.join(directory, 'state.json.tmp')
    await mkdir(blockedWrite)

    // A submission that had already succeeded was reported as failed and
    // handed back as a draft, while the marker stayed on disk to be found
    // again after a restart and delivered a second time.
    await expect(store.clearFailedPrompt('session-clear')).rejects.toThrow(
      /EISDIR/,
    )

    await rm(blockedWrite, { recursive: true })
    expect(store.get('session-clear')?.failedPrompt?.content).toBe('Deploy it')
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

  it('refuses a write that arrives after it has been closed', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-late',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    await store.close()
    // What a caller does once stopping has resolved: the directory is its own
    // again. A prompt still finishing writes from its own completion path, and
    // that write is not held by whoever stopped the service.
    await rm(directory, { recursive: true, force: true })

    await expect(
      store.renameSession('session-late', 'Renamed after closing'),
    ).rejects.toThrow('Session store is closed')
    await store.flush()
    expect(store.get('session-late')?.title).toBe('Project')
    expect(existsSync(directory)).toBe(false)
  })
})
