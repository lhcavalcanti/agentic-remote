import { randomUUID } from 'node:crypto'
import { mkdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SchedulerStore } from './scheduler-store.js'
import { NoopScheduleLauncher, SchedulerDispatcher } from './scheduler-dispatcher.js'

const input = (name = 'Fictional review') => ({
  name, prompt: 'Review the fictional guide.',
  target: { computerId: 'fictional-studio', folder: '/fictional/repo', provider: 'copilot' as const },
  recurrence: { type: 'daily' as const, time: '09:00' },
  timezone: 'UTC',
})
let directory: string
let now: number
let store: SchedulerStore
beforeEach(async () => {
  directory = path.join(process.cwd(), `.scheduler-proposals-${randomUUID()}`)
  await mkdir(directory)
  now = Date.parse('2026-11-14T18:00:00Z')
  store = new SchedulerStore(directory, { now: () => now })
  await store.initialize()
})
afterEach(async () => { await store.flush(); await rm(directory, { recursive: true, force: true }) })

describe('durable schedule proposals', () => {
  it('stores the exact typed proposal without creating a schedule and survives restart owner-only', async () => {
    const proposal = await store.propose({ operation: 'create', payload: input() })
    expect(store.list()).toEqual([])
    expect(proposal).toMatchObject({ operation: 'create', createdBy: 'oracle', status: 'pending', payload: { target: { permissionPolicy: 'ask' } } })
    expect(Date.parse(proposal.expiresAt) - Date.parse(proposal.createdAt)).toBe(86_400_000)
    const restarted = new SchedulerStore(directory, { now: () => now })
    await restarted.initialize()
    expect(restarted.proposal(proposal.id)).toEqual(proposal)
    expect((await stat(store.statePath)).mode & 0o777).toBe(0o600)
    expect((await stat(store.directory)).mode & 0o777).toBe(0o700)
  })

  it('applies once even for concurrent approvals and after restart', async () => {
    const proposal = await store.propose({ operation: 'create', payload: input() })
    await Promise.all([store.approveProposal(proposal.id), store.approveProposal(proposal.id)])
    const restarted = new SchedulerStore(directory, { now: () => now })
    await restarted.initialize()
    expect((await restarted.approveProposal(proposal.id)).status).toBe('applied')
    expect(restarted.list()).toHaveLength(1)
    expect(restarted.list()[0].createdBy).toBe('oracle')
  })

  it('refuses revision drift at approval without applying any change', async () => {
    const schedule = await store.create(input())
    const proposal = await store.propose({ operation: 'update', scheduleId: schedule.id, baseRevision: 1, payload: { prompt: 'Proposed text' } })
    await store.update(schedule.id, { revision: 1, name: 'User edit' })
    await expect(store.approveProposal(proposal.id)).rejects.toThrow('revision conflict')
    expect(store.get(schedule.id).prompt).toBe(input().prompt)
    expect(store.proposal(proposal.id).status).toBe('failed')
  })

  it('revalidates the active cap at approval, including concurrent creates', async () => {
    const proposals = await Promise.all(['A', 'B'].map((name) => store.propose({ operation: 'create', payload: input(name) })))
    for (let index = 0; index < 19; index++) await store.create(input(`Existing ${index}`), 'oracle')
    const results = await Promise.allSettled(proposals.map((proposal) => store.approveProposal(proposal.id)))
    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected'])
    expect(store.list().filter((schedule) => schedule.enabled)).toHaveLength(20)
  })

  it('allows disabling at the cap and checks the cap again when enabling', async () => {
    const schedule = await store.create({ ...input(), enabled: false }, 'oracle')
    const proposal = await store.propose({ operation: 'enable', scheduleId: schedule.id, baseRevision: 1, payload: {} })
    for (let index = 0; index < 20; index++) await store.create(input(`Existing ${index}`), 'oracle')
    await expect(store.approveProposal(proposal.id)).rejects.toThrow('20 active')
    const other = store.list().find((entry) => entry.enabled)!
    const disable = await store.propose({ operation: 'disable', scheduleId: other.id, baseRevision: 1, payload: {} })
    expect((await store.approveProposal(disable.id)).status).toBe('applied')
  })

  it('expires pending proposals at 24 hours and refuses expired approvals', async () => {
    const proposal = await store.propose({ operation: 'create', payload: input() })
    now += 86_400_000
    await store.expireProposals()
    expect(store.proposal(proposal.id).status).toBe('expired')
    await expect(store.approveProposal(proposal.id)).rejects.toMatchObject({ statusCode: 410 })
    expect(store.list()).toEqual([])
  })

  it('revalidates allow-all policy when approved and never accepts it by default', async () => {
    const payload = { ...input(), target: { ...input().target, permissionPolicy: 'allow-all' as const } }
    await expect(store.propose({ operation: 'create', payload })).rejects.toThrow('does not permit')
    const proposal = await store.propose({ operation: 'create', payload }, true)
    await expect(store.approveProposal(proposal.id, false)).rejects.toThrow('does not permit')
    expect(store.list()).toEqual([])
  })

  it('rejects spacing below 15 minutes and payload changes to metadata', async () => {
    await expect(store.propose({ operation: 'create', payload: { ...input(), recurrence: { type: 'hourly', everyHours: 0.1 } } })).rejects.toThrow()
    await expect(store.propose({ operation: 'create', payload: { ...input(), createdBy: 'user' } } as never)).rejects.toThrow()
  })

  it('rejects without applying, publishes invalidations and returns detached copies', async () => {
    const events: string[] = []
    store.on('proposal', (event) => events.push(event.proposalId))
    const proposal = await store.propose({ operation: 'create', payload: input() })
    proposal.payload.name = 'Not the proposal'
    await store.rejectProposal(proposal.id)
    expect(store.proposal(proposal.id)).toMatchObject({ status: 'rejected', payload: { name: input().name } })
    expect(events).toEqual([proposal.id, proposal.id])
    await expect(store.approveProposal(proposal.id)).rejects.toThrow('rejected')
  })

  it('atomically fences Run now with its proposal across retries and restart', async () => {
    const dispatcher = new SchedulerDispatcher(store, new NoopScheduleLauncher(), { now: () => now, targetOnline: () => false })
    await dispatcher.start()
    try {
      const schedule = await store.create(input())
      const proposal = await store.propose({ operation: 'run-now', scheduleId: schedule.id, baseRevision: 1, payload: {} })
      await store.approveProposal(proposal.id)
      const [first, second] = await Promise.all([
        dispatcher.runNow(schedule.id, 1, proposal.id), dispatcher.runNow(schedule.id, 1, proposal.id),
      ])
      expect(second.id).toBe(first.id)
      expect(store.allRuns()).toHaveLength(1)
      expect(store.proposal(proposal.id)).toMatchObject({ status: 'applied', appliedRunId: first.id })
    } finally { await dispatcher.stop() }
  })

  it('recovers Run now after approval without requiring the HTTP handler to admit it', async () => {
    const schedule = await store.create({ ...input(), enabled: false })
    const proposal = await store.propose({ operation: 'run-now', scheduleId: schedule.id, baseRevision: 1, payload: {} })
    const approved = await store.approveProposal(proposal.id)
    expect(approved).toMatchObject({ status: 'applied', appliedRunId: expect.any(String) })
    const reopened = new SchedulerStore(directory, { now: () => now })
    const launch = vi.fn(async () => {})
    const dispatcher = new SchedulerDispatcher(reopened, {
      launch, reconcile: async () => ({ state: 'absent' }), stop: async () => ({ outcome: 'stopped' }),
    }, { now: () => now })
    try {
      await dispatcher.start()
      await vi.waitFor(() => expect(launch).toHaveBeenCalledTimes(1))
      expect(reopened.allRuns()).toHaveLength(1)
      expect((await reopened.approveProposal(proposal.id)).appliedRunId).toBe(approved.appliedRunId)
    } finally { await dispatcher.stop() }
  })

})
