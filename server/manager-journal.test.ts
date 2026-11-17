import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ManagedSession } from '../shared/contracts.js'
import type { ScheduleProposalInput } from '../shared/schedule-proposals.js'
import { JournalRecorder, recordScheduleProposals } from './manager-journal.js'
import { SchedulerStore } from './scheduler-store.js'
import { ManagerStore } from './manager-store.js'

const proposalInput: ScheduleProposalInput = {
  operation: 'create', payload: {
    name: 'Fictional review', prompt: 'Review the fictional guide.',
    target: { computerId: 'hub', folder: '/fictional/repo', provider: 'copilot' },
    recurrence: { type: 'daily', time: '09:00' }, timezone: 'UTC',
  },
}

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
    await recordScheduleProposals(store, [proposal])
    await recordScheduleProposals(store, [proposal])
    await recordScheduleProposals(store, [await schedules.rejectProposal(proposal.id)])
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

  it('does not re-journal rotated proposal statuses on restart or later proposal events', async () => {
    const schedules = new SchedulerStore(root)
    await schedules.initialize()
    const proposal = await schedules.propose(proposalInput)
    const directory = path.join(root, 'rotating-manager')
    let manager = new ManagerStore(directory, { journalLimit: 3, journalKeep: 1 })
    await manager.initialize()
    await recordScheduleProposals(manager, [proposal])
    for (let index = 0; index < 4; index += 1) {
      await manager.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle' }])
    }
    manager = new ManagerStore(directory, { journalLimit: 3, journalKeep: 1 })
    await manager.initialize()
    const before = manager.latestJournalSeq()
    await recordScheduleProposals(manager, [proposal])
    expect(manager.latestJournalSeq()).toBe(before)

    const rejected = await schedules.rejectProposal(proposal.id)
    await Promise.all([recordScheduleProposals(manager, [rejected]), recordScheduleProposals(manager, [rejected])])
    expect(manager.journalSince(before).map((entry) => entry.proposalStatus)).toEqual(['rejected'])
    for (let index = 0; index < 4; index += 1) {
      await manager.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle' }])
    }
    const restarted = new ManagerStore(directory, { journalLimit: 3, journalKeep: 1 })
    await restarted.initialize()
    const after = restarted.latestJournalSeq()
    await recordScheduleProposals(restarted, [rejected])
    expect(restarted.latestJournalSeq()).toBe(after)
    expect((await stat(path.join(directory, 'proposal-journal.json'))).mode & 0o777).toBe(0o600)
  })

  it('does not replay ambiguous legacy terminal outcomes older than the retained journal window', async () => {
    let now = '2026-11-14T00:00:00.000Z'
    const schedules = new SchedulerStore(root, { now: () => Date.parse(now) })
    await schedules.initialize()
    const proposal = await schedules.propose(proposalInput)
    const rejected = await schedules.rejectProposal(proposal.id)
    const stillPending = await schedules.propose(proposalInput)
    const journal = JSON.stringify({
      kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle',
      seq: 40, at: '2026-11-15T00:00:00.000Z',
    }) + '\n'
    await store.updateState((state) => { state.acknowledgedJournalSeq = 39 })
    const stateBefore = await readFile(path.join(root, 'manager', 'state.json'), 'utf8')
    await writeFile(path.join(root, 'manager', 'journal.jsonl'), journal)
    const reloaded = new SchedulerStore(root, { now: () => Date.parse(now) })
    await reloaded.initialize()
    const persisted = reloaded.persistedProposalStatuses()
    const restarted = new ManagerStore(path.join(root, 'manager'))
    await restarted.initialize()
    await recordScheduleProposals(restarted, [rejected, stillPending], persisted)
    expect(restarted.latestJournalSeq()).toBe(40)
    expect(await readFile(path.join(root, 'manager', 'journal.jsonl'), 'utf8')).toBe(journal)
    expect(await readFile(path.join(root, 'manager', 'state.json'), 'utf8')).toBe(stateBefore)
    now = '2026-11-17T00:00:00.000Z'
    const fresh = await reloaded.propose(proposalInput)
    await recordScheduleProposals(restarted, [rejected, stillPending, fresh], persisted)
    const freshRejected = await reloaded.rejectProposal(fresh.id)
    const legacyOutcome = await reloaded.rejectProposal(stillPending.id)
    await recordScheduleProposals(restarted, [rejected, legacyOutcome, freshRejected], persisted)
    await recordScheduleProposals(restarted, [rejected, legacyOutcome, freshRejected], persisted)
    expect(restarted.journalSince(40).map((entry) => [entry.proposalId, entry.proposalStatus])).toEqual([
      [fresh.id, 'pending'], [legacyOutcome.id, 'expired'], [fresh.id, 'rejected'],
    ])
  })

  it('journals a legacy pending proposal that expires during scheduler startup exactly once', async () => {
    let now = '2026-11-14T00:00:00.000Z'
    const schedules = new SchedulerStore(root, { now: () => Date.parse(now) })
    await schedules.initialize()
    const pending = await schedules.propose(proposalInput)
    await writeFile(path.join(root, 'manager', 'journal.jsonl'), JSON.stringify({
      kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle', seq: 40, at: '2026-11-15T00:00:00.000Z',
    }) + '\n')
    now = '2026-11-17T00:00:00.000Z'
    const restartedSchedules = new SchedulerStore(root, { now: () => Date.parse(now) })
    await restartedSchedules.initialize()
    const persisted = restartedSchedules.persistedProposalStatuses()
    await restartedSchedules.expireProposals()
    expect(restartedSchedules.proposals().map((proposal) => proposal.status)).toEqual(['expired'])
    const restarted = new ManagerStore(path.join(root, 'manager'))
    await restarted.initialize()
    await recordScheduleProposals(restarted, restartedSchedules.proposals(), persisted)
    await recordScheduleProposals(restarted, restartedSchedules.proposals(), persisted)
    expect(restarted.journalSince(40).map((entry) => [entry.proposalId, entry.proposalStatus])).toEqual([[pending.id, 'expired']])
  })

  it('journals a new outcome even when rotation overtakes its first recording', async () => {
    const schedules = new SchedulerStore(root)
    await schedules.initialize()
    const manager = new ManagerStore(path.join(root, 'burst-manager'), { journalLimit: 3, journalKeep: 1 })
    await manager.initialize()
    const proposal = await schedules.propose(proposalInput)
    const rejected = await schedules.rejectProposal(proposal.id)
    for (let index = 0; index < 4; index += 1) {
      await manager.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle' }])
    }
    const before = manager.latestJournalSeq()
    await recordScheduleProposals(manager, [rejected])
    expect(manager.journalSince(before).map((entry) => entry.proposalStatus)).toEqual(['rejected'])
  })

  it('retains the old journal and sequence when the pre-rotation proposal fence cannot be saved', async () => {
    const schedules = new SchedulerStore(root)
    await schedules.initialize()
    const proposal = await schedules.propose(proposalInput)
    const directory = path.join(root, 'blocked-manager')
    const manager = new ManagerStore(directory, { journalLimit: 2, journalKeep: 1 })
    await manager.initialize()
    await recordScheduleProposals(manager, [proposal])
    await manager.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'running' }])
    const before = await readFile(path.join(directory, 'journal.jsonl'), 'utf8')
    await mkdir(path.join(directory, 'proposal-journal.json'))
    await expect(manager.appendJournal([
      { kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle' },
    ])).rejects.toThrow()
    expect(manager.latestJournalSeq()).toBe(2)
    expect(await readFile(path.join(directory, 'journal.jsonl'), 'utf8')).toBe(before)
    expect(manager.journalSince(0)[0].proposalId).toBe(proposal.id)
    await rm(path.join(directory, 'proposal-journal.json'), { recursive: true })
    await manager.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle' }])
    const restarted = new ManagerStore(directory)
    await restarted.initialize()
    await recordScheduleProposals(restarted, [proposal])
    expect(restarted.latestJournalSeq()).toBe(3)
  })

  it('keeps fences only for retained proposals and preserves every status in a batch larger than the journal window', async () => {
    const schedules = new SchedulerStore(root)
    await schedules.initialize()
    const first = await schedules.propose(proposalInput)
    const second = await schedules.propose(proposalInput)
    const directory = path.join(root, 'batch-manager')
    const manager = new ManagerStore(directory, { journalLimit: 1, journalKeep: 1 })
    await manager.initialize()
    await recordScheduleProposals(manager, [first, second])
    await manager.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle' }])
    const restarted = new ManagerStore(directory, { journalLimit: 1, journalKeep: 1 })
    await restarted.initialize()
    await recordScheduleProposals(restarted, [first, second])
    expect(restarted.latestJournalSeq()).toBe(3)
    await recordScheduleProposals(restarted, [second])
    const index = JSON.parse(await readFile(path.join(directory, 'proposal-journal.json'), 'utf8'))
    expect(index.proposals).toEqual({ [second.id]: ['pending'] })
    await restarted.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'running' }])
    const again = new ManagerStore(directory)
    await again.initialize()
    await recordScheduleProposals(again, [second])
    expect(again.latestJournalSeq()).toBe(4)
  })

  it('recovers a durable proposal fence when the subsequent journal rotation fails', async () => {
    const schedules = new SchedulerStore(root)
    await schedules.initialize()
    const proposal = await schedules.propose(proposalInput)
    const directory = path.join(root, 'interrupted-manager')
    const options = { journalLimit: 2, journalKeep: 1 }
    const manager = new ManagerStore(directory, options)
    await manager.initialize()
    await recordScheduleProposals(manager, [proposal])
    await manager.appendJournal([{ kind: 'status', computerId: 'hub', sessionId: 'other', to: 'running' }])
    const journal = path.join(directory, 'journal.jsonl')
    await rename(journal, `${journal}.held`)
    await mkdir(journal)
    await expect(manager.appendJournal([
      { kind: 'status', computerId: 'hub', sessionId: 'other', to: 'idle' },
    ])).rejects.toThrow()
    expect(manager.latestJournalSeq()).toBe(2)
    const index = JSON.parse(await readFile(path.join(directory, 'proposal-journal.json'), 'utf8'))
    expect(index.proposals).toEqual({ [proposal.id]: ['pending'] })
    await rm(journal, { recursive: true })
    await rename(`${journal}.held`, journal)
    const restarted = new ManagerStore(directory, options)
    await restarted.initialize()
    await recordScheduleProposals(restarted, [proposal])
    expect(restarted.latestJournalSeq()).toBe(2)
    await recordScheduleProposals(restarted, [await schedules.rejectProposal(proposal.id)])
    expect(restarted.journalSince(2).map((entry) => entry.proposalStatus)).toEqual(['rejected'])
  })

  it('does not silently discard a corrupt proposal journal fence index', async () => {
    const target = path.join(root, 'manager', 'proposal-journal.json')
    const damaged = '{"version":1,"proposals":{"old":"not-an-array"}}'
    await writeFile(target, damaged)
    const restarted = new ManagerStore(path.join(root, 'manager'))
    await expect(restarted.initialize()).rejects.toThrow('Invalid Oracle proposal journal index')
    expect(await readFile(target, 'utf8')).toBe(damaged)
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
