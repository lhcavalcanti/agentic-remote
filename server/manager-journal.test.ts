import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ManagedSession } from '../shared/contracts.js'
import { JournalRecorder } from './manager-journal.js'
import { ManagerStore } from './manager-store.js'

function session(id: string, change: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id,
    computerId: 'hub',
    computerName: 'development',
    cwd: '/home/me/src/app',
    title: `Session ${id}`,
    status: 'idle',
    updatedAt: '2026-10-15T00:00:00.000Z',
    isOpen: true,
    messages: [],
    ...change,
  }
}

describe('JournalRecorder', () => {
  let root: string
  let store: ManagerStore
  let recorder: JournalRecorder

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-journal-'))
    store = new ManagerStore(path.join(root, 'manager'))
    await store.initialize()
    recorder = new JournalRecorder(store, { flushDelayMs: 0 })
  })

  afterEach(async () => {
    await recorder.stop()
    await rm(root, { recursive: true, force: true })
  })

  it('takes in the sessions that already exist without reporting them as new', async () => {
    await recorder.reconcile([session('a'), session('b')], ['hub'])
    expect(store.journalSince(0)).toEqual([])
    expect(store.state().baselineAt).toBeTruthy()
    expect(store.registry()['hub:a']).toMatchObject({ origin: 'discovered', title: 'Session a' })
  })

  it('records a new session with its task, then only real transitions', async () => {
    await recorder.reconcile([], ['hub'])
    recorder.handle({
      type: 'session.upserted',
      session: session('n', {
        status: 'running',
        messages: [{ id: 'm', role: 'user', content: 'Fix the login bug', createdAt: 't' }],
      }),
    })
    recorder.handle({ type: 'session.upserted', session: session('n', { status: 'running' }) })
    recorder.handle({ type: 'session.upserted', session: session('n', { status: 'idle' }) })
    recorder.handle({ type: 'session.upserted', session: session('n', { status: 'idle', title: 'Login fix' }) })
    await recorder.flush()

    expect(store.journalSince(0).map(({ kind, from, to }) => ({ kind, from, to }))).toEqual([
      { kind: 'created', from: undefined, to: undefined },
      { kind: 'status', from: 'running', to: 'idle' },
      { kind: 'renamed', from: 'Session n', to: 'Login fix' },
    ])
    expect(store.registry()['hub:n']).toMatchObject({
      origin: 'user',
      task: 'Fix the login bug',
      title: 'Login fix',
      lastStatus: 'idle',
    })
  })

  it('records a deletion with a tombstone and carries a cleared session to its replacement', async () => {
    await recorder.reconcile([session('gone'), session('old')], ['hub'])
    await recorder.markManaged(session('old'), 'Write the docs')
    recorder.handle({ type: 'session.removed', computerId: 'hub', sessionId: 'gone' })
    recorder.handle({ type: 'session.removed', computerId: 'hub', sessionId: 'old', replacedBy: 'new' })
    await recorder.flush()

    expect(store.journalSince(0).map(({ kind, sessionId, replacedBy }) => ({ kind, sessionId, replacedBy }))).toEqual([
      { kind: 'removed', sessionId: 'gone', replacedBy: undefined },
      { kind: 'replaced', sessionId: 'old', replacedBy: 'new' },
    ])
    const registry = store.registry()
    expect(registry['hub:gone'].removedAt).toBeTruthy()
    expect(registry['hub:new']).toMatchObject({ origin: 'manager', task: 'Write the docs' })
    expect(registry['hub:old'].replacedBy).toBe('new')
  })

  it('reconciles what it missed, only for computers that answered', async () => {
    await recorder.reconcile(
      [session('stay'), session('quiet'), session('remote', { computerId: 'node', computerName: 'production' })],
      ['hub', 'node'],
    )
    await recorder.reconcile([session('stay'), session('fresh')], ['hub'])
    await recorder.flush()

    expect(store.journalSince(0).map(({ kind, sessionId, to }) => ({ kind, sessionId, to }))).toEqual([
      { kind: 'created', sessionId: 'fresh', to: undefined },
      { kind: 'status', sessionId: 'quiet', to: 'closed' },
    ])
    expect(store.registry()['hub:quiet'].lastStatus).toBe('closed')
    expect(store.registry()['node:remote'].lastStatus).toBe('idle')
  })

  it('marks a session the manager started as its own', async () => {
    await recorder.reconcile([], ['hub'])
    recorder.handle({ type: 'session.upserted', session: session('m') })
    await recorder.markManaged(session('m'), 'Investigate flaky tests')
    await recorder.flush()
    expect(store.registry()['hub:m']).toMatchObject({ origin: 'manager', task: 'Investigate flaky tests' })
    expect(recorder.managedSessions()).toEqual(['hub:m'])
  })

  it('does not report sessions arriving before the first baseline as new', async () => {
    recorder.handle({ type: 'session.upserted', session: session('early') })
    await recorder.flush()
    expect(store.journalSince(0)).toEqual([])
    expect(store.registry()['hub:early']).toMatchObject({ origin: 'discovered' })
  })

  it('ignores events that are not about sessions', async () => {
    recorder.handle({ type: 'computer.removed', computerId: 'hub' })
    recorder.handle({ type: 'manager.delta', messageId: 'x', content: 'y' })
    await recorder.flush()
    expect(store.journalSince(0)).toEqual([])
  })
})
