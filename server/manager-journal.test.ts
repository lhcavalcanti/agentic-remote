import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagedSession } from '../shared/contracts.js'
import { JournalRecorder, recordScheduleProposal } from './manager-journal.js'
import { SchedulerStore } from './scheduler-store.js'
import { ManagerStore } from './manager-store.js'
import { recordScheduleReplacement } from './schedule-launcher.js'

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

  it('journals proposals and outcomes durably without making scheduled sessions Oracle-owned', async () => {
    const schedules = new SchedulerStore(root)
    await schedules.initialize()
    const proposal = await schedules.propose({
      operation: 'create', payload: {
        name: 'Fictional review', prompt: 'Review the fictional guide.',
        target: { computerId: 'hub', folder: '/fictional/repo', provider: 'copilot' },
        recurrence: { type: 'daily', time: '09:00' }, timezone: 'UTC',
      },
    })
    await recordScheduleProposal(store, proposal)
    await recordScheduleProposal(store, proposal)
    await recordScheduleProposal(store, await schedules.rejectProposal(proposal.id))
    const restarted = new ManagerStore(path.join(root, 'manager'))
    await restarted.initialize()
    expect(restarted.journalSince(0).map((entry) => entry.proposalStatus)).toEqual(['pending', 'rejected'])
    await store.updateRegistry((registry) => {
      registry['hub:scheduled'] = { computerId: 'hub', sessionId: 'scheduled', title: 'Scheduled review', origin: 'schedule', firstSeenAt: '2026-11-14T18:00:00Z' }
    })
    await expect(recorder.markManaged(session('scheduled'), 'Take ownership')).rejects.toThrow('not owned')
    expect(recorder.managedSessions()).toEqual([])
    expect(store.registry()['hub:scheduled'].origin).toBe('schedule')
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
      origin: 'discovered',
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

  it('exposes replacement provenance synchronously and persists it once', async () => {
    await store.recordUserSession(session('old'))
    await recorder.reconcile([session('old')], ['hub'])
    await recorder.stop()
    recorder = new JournalRecorder(store, { flushDelayMs: 60_000 })
    const writes = vi.spyOn(store, 'updateRegistry')
    const flush = vi.spyOn(recorder, 'flush')
    recorder.handle({ type: 'session.removed', computerId: 'hub', sessionId: 'old', replacedBy: 'new' })
    expect(store.sessionProvenance('hub', 'new')).toEqual({ origin: 'user' })
    await recorder.pendingRegistryWrites()
    expect(flush).not.toHaveBeenCalled()
    await recorder.flush()
    expect(writes).toHaveBeenCalledOnce()
  })

  it('carries a predecessor first observed in the still-unflushed journal batch', async () => {
    await recorder.reconcile([], ['hub'])
    recorder.handle({ type: 'session.upserted', session: session('old') })
    recorder.handle({ type: 'session.removed', computerId: 'hub', sessionId: 'old', replacedBy: 'new' })
    expect(store.sessionProvenance('hub', 'new')).toEqual({ origin: 'discovered' })
    await recorder.flush()
    expect(store.registry()['hub:old'].replacedBy).toBe('new')
    expect(store.registry()['hub:new'].originEvidence).toBe('discovery')
  })

  it('carries a predecessor whose registry batch is already in flight', async () => {
    await recorder.reconcile([], ['hub'])
    recorder.handle({ type: 'session.upserted', session: session('old') })
    const first = recorder.flush()
    recorder.handle({ type: 'session.removed', computerId: 'hub', sessionId: 'old', replacedBy: 'new' })
    await Promise.all([first, recorder.flush()])
    expect(store.registry()['hub:old'].replacedBy).toBe('new')
    expect(store.sessionProvenance('hub', 'new')).toEqual({ origin: 'discovered' })
  })

  it('does not write a replacement again when the schedule path already carried it', async () => {
    await store.updateRegistry((registry) => {
      registry['hub:old'] = { computerId: 'hub', sessionId: 'old', title: 'Scheduled task', origin: 'schedule', originEvidence: 'launch', scheduleId: 'daily', scheduleRunId: 'run', firstSeenAt: '2026-11-15T00:00:00Z' }
    })
    await recorder.reconcile([session('old')], ['hub'])
    const writes = vi.spyOn(store, 'updateRegistry')
    const event = { type: 'session.removed' as const, computerId: 'hub', sessionId: 'old', replacedBy: 'new' }
    const persisted = recordScheduleReplacement(store, event)
    recorder.handle(event)
    expect(store.sessionProvenance('hub', 'new')).toEqual({ origin: 'schedule', scheduleId: 'daily', scheduleRunId: 'run' })
    await Promise.all([persisted, recorder.flush()])
    expect(writes).toHaveBeenCalledOnce()
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
