import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DreamerPlan } from '../shared/dreamer.js'
import {
  DreamerCapacityError,
  DreamerConflictError,
  DREAMER_STATE_VERSION,
  DREAMER_MAX_ZONES,
  DreamerRecoveryError,
  DreamerStore,
  dreamerRunKey,
} from './dreamer-store.js'

const directories: string[] = []

async function directory(): Promise<string> {
  const value = path.join(process.cwd(), `.dreamer-store-test-${randomUUID()}`)
  await mkdir(value, { recursive: true })
  directories.push(value)
  return value
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((value) => rm(value, { recursive: true, force: true })))
})

const plan: DreamerPlan = {
  id: 'plan-a',
  localDate: '2026-10-29',
  timeZone: 'UTC',
  createdAt: '2026-10-29T02:00:00.000Z',
  items: [{
    id: 'item-a',
    label: 'Session needs attention',
    reason: 'Journal metadata reports an unresolved error.',
    status: 'pending',
    source: 'session',
    computerId: 'computer-a',
    sessionId: 'session-a',
  }],
  coverage: ['journal-metadata-only'],
  omitted: 0,
}

describe('DreamerStore', () => {
  function localDate(day: number): string {
    return new Date(Date.UTC(2026, 9, day)).toISOString().slice(0, 10)
  }

  it('coalesces concurrent initialization onto one durable load', async () => {
    const root = await directory()
    let release: (() => void) | undefined
    const blocked = new Promise<void>((resolve) => { release = resolve })
    const store = new DreamerStore(root, {
      syncDirectory: async () => {
        await blocked
      },
    })

    const first = store.initialize()
    const second = store.initialize()
    expect(second).toBe(first)
    release?.()
    await Promise.all([first, second])
  })

  it('persists task-backed plan items without treating journal items as tasks', async () => {
    const root = await directory()
    const store = new DreamerStore(root)
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })
    if (claim.kind !== 'claimed') throw new Error('expected a claim')

    await store.commitRun(claim.claim, {
      ...plan,
      items: [
        { ...plan.items[0], fingerprint: 'session-a' },
        {
          id: 'task-item',
          label: 'Run the focused queue test',
          reason: 'Oracle recorded an actionable finding.',
          status: 'pending',
          source: 'task',
          taskId: 'oracle-task-a',
          fingerprint: 'task-a',
        },
      ],
    }, [])

    const items = store.snapshot().plan?.items
    expect(items?.[0]).toMatchObject({ source: 'session' })
    expect(items?.[0].taskId).toBeUndefined()
    expect(items?.[1]).toMatchObject({ source: 'task', taskId: 'oracle-task-a' })
  })

  it('retries every directory ancestry barrier after a failed first initialization', async () => {
    const root = await directory()
    const nested = path.join(root, 'one', 'two', 'dreamer')
    let syncCalls = 0
    let fail = true
    const options = {
      syncDirectory: async () => {
        syncCalls += 1
        if (fail) {
          fail = false
          throw new Error('parent sync failed')
        }
      },
    }
    const first = new DreamerStore(nested, options)
    await expect(first.initialize()).rejects.toBeInstanceOf(DreamerRecoveryError)
    const firstCalls = syncCalls
    const second = new DreamerStore(nested, options)
    await second.initialize()
    expect(syncCalls).toBeGreaterThan(firstCalls)
  })

  it('retries the staging cleanup barrier when deletion succeeded but sync failed', async () => {
    const root = await directory()
    await writeFile(path.join(root, 'dreamer.12345678.pending'), 'orphan')
    let syncCalls = 0
    let fail = true
    const options = {
      syncDirectory: async () => {
        syncCalls += 1
        if (fail) {
          fail = false
          throw new Error('cleanup sync failed')
        }
      },
    }
    const first = new DreamerStore(root, options)
    await expect(first.initialize()).rejects.toBeInstanceOf(DreamerRecoveryError)
    const firstCalls = syncCalls
    const second = new DreamerStore(root, options)
    await second.initialize()
    expect(syncCalls).toBeGreaterThan(firstCalls)
  })

  it('refuses commits after the initialized Dreamer directory is replaced', async () => {
    const root = await directory()
    const store = new DreamerStore(root)
    await store.initialize()
    directories.push(`${root}-old`)
    await rm(`${root}-old`, { recursive: true, force: true })
    await rename(root, `${root}-old`)
    await mkdir(root, { mode: 0o700 })
    await expect(store.updateSettings(0, { enabled: true, timeZone: 'UTC' }))
      .rejects.toBeInstanceOf(DreamerRecoveryError)
    await expect(readFile(path.join(root, 'dreamer.json'), 'utf8'))
      .rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('fails closed when private-directory ownership cannot be verified', async () => {
    const root = await directory()
    const getuid = vi.spyOn(process, 'getuid').mockImplementation(() => undefined as never)
    try {
      await expect(new DreamerStore(root).initialize())
        .rejects.toBeInstanceOf(DreamerRecoveryError)
    } finally {
      getuid.mockRestore()
    }
  })

  it('persists settings and a committed plan exactly once across restart', async () => {
    const root = await directory()
    let now = new Date('2026-10-29T02:00:00.000Z')
    const first = new DreamerStore(root, { now: () => now, randomUUID: () => 'claim-a' })
    await first.initialize()
    const initial = first.snapshot()
    await first.updateSettings(initial.revision, { enabled: true, timeZone: 'UTC' })
    const claim = await first.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: first.snapshot().settings.generation,
    })

    expect(claim.kind).toBe('claimed')
    if (claim.kind !== 'claimed') throw new Error('expected a claim')
    await first.commitRun(claim.claim, plan, [])
    const committed = first.snapshot()
    expect(committed.plan).toEqual(plan)
    expect(committed.revision).toBeGreaterThan(initial.revision)

    const second = new DreamerStore(root, { now: () => now, randomUUID: () => 'claim-b' })
    await second.initialize()
    expect(second.snapshot()).toEqual(committed)
    await expect(second.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: second.snapshot().settings.generation,
    })).resolves.toMatchObject({ kind: 'already-committed' })
  })

  it('migrates version-one state before an older writer can erase completion provenance', async () => {
    const root = await directory()
    const statePath = path.join(root, 'dreamer.json')
    const first = new DreamerStore(root)
    await first.initialize()
    await first.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const legacy = JSON.parse(await readFile(statePath, 'utf8')) as Record<string, unknown>
    legacy.version = 1
    await writeFile(statePath, JSON.stringify(legacy))

    const reopened = new DreamerStore(root)
    await reopened.initialize()

    const migrated = JSON.parse(await readFile(statePath, 'utf8')) as Record<string, unknown>
    expect(DREAMER_STATE_VERSION).toBe(3)
    expect(migrated).toMatchObject({
      version: 3,
      revision: legacy.revision,
      settings: legacy.settings,
    })
  })

  it('migrates version-two completion provenance to an explicit root source and legacy revision', async () => {
    const root = await directory()
    const statePath = path.join(root, 'dreamer.json')
    const first = new DreamerStore(root, {
      now: () => new Date('2026-10-29T02:00:00.000Z'),
      randomUUID: () => 'claim-a',
    })
    await first.initialize()
    await first.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await first.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: first.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected a claim')
    await first.commitRun(claim.claim, plan, [])

    const legacy = JSON.parse(await readFile(statePath, 'utf8')) as {
      version: number
      plan: { items: Array<Record<string, unknown>> }
    }
    legacy.version = 2
    legacy.plan.items[0].status = 'done'
    legacy.plan.items[0].completion = {
      computerId: 'computer-a',
      sessionId: 'session-a',
      messageId: 'message-a',
      toolCallId: 'tool-call-a',
      resultDigest: 'a'.repeat(64),
      completedAt: '2026-10-29T01:58:00.000Z',
      confirmedAt: '2026-10-29T02:01:00.000Z',
    }
    await writeFile(statePath, JSON.stringify(legacy))

    const reopened = new DreamerStore(root)
    await reopened.initialize()

    expect(reopened.snapshot().plan?.items[0].completion).toMatchObject({
      source: 'root-task-complete',
      sessionRevision: 0,
      sessionId: 'session-a',
      messageId: 'message-a',
    })
    const migrated = JSON.parse(await readFile(statePath, 'utf8')) as {
      version: number
      plan: { items: Array<{ completion?: Record<string, unknown> }> }
    }
    expect(migrated.version).toBe(3)
    expect(migrated.plan.items[0].completion).toMatchObject({
      source: 'root-task-complete',
      sessionRevision: 0,
    })
  })

  it('drops legacy session items with partial source identity during migration', async () => {
    const root = await directory()
    const statePath = path.join(root, 'dreamer.json')
    const first = new DreamerStore(root, {
      now: () => new Date('2026-10-29T02:00:00.000Z'),
      randomUUID: () => 'claim-a',
    })
    await first.initialize()
    await first.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await first.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: first.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected a claim')
    await first.commitRun(claim.claim, plan, [])

    const legacy = JSON.parse(await readFile(statePath, 'utf8')) as {
      version: number
      plan: { items: Array<Record<string, unknown>> }
    }
    legacy.version = 2
    delete legacy.plan.items[0].sessionId
    await writeFile(statePath, JSON.stringify(legacy))

    const reopened = new DreamerStore(root)
    await reopened.initialize()

    expect(reopened.snapshot().plan?.items).toEqual([])
    expect(reopened.snapshot().plan?.coverage).toContain(
      'Excluded 1 legacy session item with partial source identity.',
    )
  })

  it('refuses a new timezone at fence capacity without blocking disable or known zones', async () => {
    const root = await directory()
    const zones = [
      'UTC',
      'Europe/Berlin',
      'Asia/Kathmandu',
      'America/New_York',
      'Australia/Sydney',
      'Africa/Cairo',
      'Pacific/Auckland',
      'America/Los_Angeles',
      'America/Sao_Paulo',
      'Europe/London',
      'Asia/Tokyo',
      'Africa/Johannesburg',
      'America/Chicago',
      'Europe/Paris',
      'Asia/Singapore',
      'Pacific/Honolulu',
    ]
    expect(zones).toHaveLength(DREAMER_MAX_ZONES)
    let now = new Date('2026-10-29T02:00:00.000Z')
    const store = new DreamerStore(root, { now: () => now })
    await store.initialize()

    for (const [index, timeZone] of zones.entries()) {
      const current = store.snapshot()
      await store.updateSettings(current.revision, { enabled: true, timeZone })
      const runDate = localDate(29 + index)
      const claim = await store.claimRun({
        key: dreamerRunKey(timeZone, runDate),
        localDate: runDate,
        timeZone,
        generation: store.snapshot().settings.generation,
      })
      expect(claim.kind).toBe('claimed')
      if (claim.kind !== 'claimed') throw new Error(`expected ${timeZone} claim`)
      await store.commitRun(claim.claim, {
        ...plan,
        id: `plan-${index}`,
        localDate: runDate,
        timeZone,
      }, [])
      now = new Date(`${runDate}T03:00:00.000Z`)
    }

    const beforeNewZone = store.snapshot()
    await expect(store.updateSettings(beforeNewZone.revision, {
      enabled: true,
      timeZone: 'Etc/GMT+1',
    })).rejects.toBeInstanceOf(DreamerCapacityError)
    expect(store.snapshot()).toEqual(beforeNewZone)

    const disabled = store.snapshot()
    await expect(store.updateSettings(disabled.revision, {
      enabled: false,
      timeZone: zones.at(-1)!,
    })).resolves.toBeUndefined()
    const reenabled = store.snapshot()
    await expect(store.updateSettings(reenabled.revision, {
      enabled: true,
      timeZone: zones[0],
    })).resolves.toBeUndefined()
    const recovered = await store.claimRun({
      key: dreamerRunKey(zones[0], '2027-01-01'),
      localDate: '2027-01-01',
      timeZone: zones[0],
      generation: store.snapshot().settings.generation,
    })
    expect(recovered.kind).toBe('claimed')
  })

  it('snapshots mutable settings input before serialized persistence begins', async () => {
    const root = await directory()
    const store = new DreamerStore(root)
    await store.initialize()
    const settings = { enabled: true, timeZone: 'UTC' }
    const pending = store.updateSettings(store.snapshot().revision, settings)
    settings.enabled = false
    await pending
    expect(store.snapshot().settings.enabled).toBe(true)
  })

  it('rejects stale edits and requires the exact item set for reorder', async () => {
    const root = await directory()
    const store = new DreamerStore(root, { now: () => new Date('2026-10-29T02:00:00.000Z'), randomUUID: () => 'claim-a' })
    await store.initialize()
    const initial = store.snapshot()
    await store.updateSettings(initial.revision, { enabled: true, timeZone: 'UTC' })
    const claim = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected a claim')
    await store.commitRun(claim.claim, {
      ...plan,
      items: [
        plan.items[0],
        { ...plan.items[0], id: 'item-b', sessionId: 'session-b' },
      ],
    }, [])
    const current = store.snapshot()
    await expect(store.editPlan(current.revision - 1, 'plan-a', { order: ['item-b', 'item-a'] }))
      .rejects.toBeInstanceOf(DreamerConflictError)
    await expect(store.editPlan(current.revision, 'plan-a', { order: ['item-b'] }))
      .rejects.toBeInstanceOf(DreamerConflictError)
    await store.editPlan(current.revision, 'plan-a', { order: ['item-b', 'item-a'] })
    expect(store.snapshot().plan?.items.map(({ id }) => id)).toEqual(['item-b', 'item-a'])
  })

  it('accumulates repeated durable exclusion counts atomically', async () => {
    const root = await directory()
    const store = new DreamerStore(root, {
      now: () => new Date('2026-10-29T02:00:00.000Z'),
      randomUUID: () => 'claim-a',
    })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claim = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    if (claim.kind !== 'claimed') throw new Error('expected a claim')
    await store.commitRun(claim.claim, {
      ...plan,
      items: [
        plan.items[0],
        { ...plan.items[0], id: 'item-b', sessionId: 'session-b' },
        { ...plan.items[0], id: 'item-c', sessionId: 'session-c' },
      ],
      coverage: ['Excluded 1 duplicate session proposal.'],
    }, [])

    let snapshot = store.snapshot()
    await store.reconcilePlanSources(
      snapshot.revision,
      snapshot.plan!.id,
      ['item-b'],
      [{
        count: 1,
        singular: 'duplicate session proposal',
        plural: 'duplicate session proposals',
      }],
    )
    snapshot = store.snapshot()
    await store.reconcilePlanSources(
      snapshot.revision,
      snapshot.plan!.id,
      ['item-c'],
      [{
        count: 2,
        singular: 'duplicate session proposal',
        plural: 'duplicate session proposals',
      }],
    )

    expect(store.snapshot().plan?.coverage).toContain(
      'Excluded 4 duplicate session proposals.',
    )
    expect(store.snapshot().plan?.coverage).not.toEqual(expect.arrayContaining([
      'Excluded 1 duplicate session proposal.',
      'Excluded 2 duplicate session proposals.',
    ]))
  })

  it('preserves committed bytes and refuses corrupt state instead of resetting', async () => {
    const root = await directory()
    const statePath = path.join(root, 'dreamer.json')
    await writeFile(statePath, '{"version":1,"revision":')
    const original = await readFile(statePath, 'utf8')
    const store = new DreamerStore(root)
    await expect(store.initialize()).rejects.toBeInstanceOf(DreamerRecoveryError)
    expect(await readFile(statePath, 'utf8')).toBe(original)
  })

  it('does not publish a failed atomic write', async () => {
    const root = await directory()
    let fail = true
    const store = new DreamerStore(root, {
      now: () => new Date('2026-10-29T02:00:00.000Z'),
      randomUUID: () => 'claim-a',
      writeFile: async (...args) => {
        if (fail) throw new Error('disk full')
        return writeFile(...args)
      },
    })
    await store.initialize()
    const before = store.snapshot()
    await expect(store.updateSettings(before.revision, { enabled: true, timeZone: 'UTC' }))
      .rejects.toThrow('Could not save Dreamer state')
    expect(store.snapshot()).toEqual(before)
    fail = false
    await store.updateSettings(before.revision, { enabled: true, timeZone: 'UTC' })
    expect(store.snapshot().settings.enabled).toBe(true)
  })

  it('rolls back a post-rename directory-sync failure before publishing success', async () => {
    const root = await directory()
    let syncs = 0
    let armed = false
    const store = new DreamerStore(root, {
      syncDirectory: async () => {
        if (armed && ++syncs === 2) throw new Error('directory sync failed')
      },
    })
    await store.initialize()
    armed = true
    const before = store.snapshot()
    await expect(store.updateSettings(before.revision, { enabled: true, timeZone: 'UTC' }))
      .rejects.toThrow('Could not save Dreamer state')
    expect(store.snapshot()).toEqual(before)
  })

  it('prunes terminal run records to admit the next date at capacity', async () => {
    const root = await directory()
    const store = new DreamerStore(root, {
      now: () => new Date('2026-10-29T02:00:00.000Z'),
      randomUUID: () => 'claim-a',
    })
    await store.initialize()
    const initial = store.snapshot()
    await store.updateSettings(initial.revision, { enabled: true, timeZone: 'UTC' })
    for (let index = 0; index < 35; index += 1) {
      const current = store.snapshot()
      const date = localDate(index + 1)
      const claim = await store.claimRun({
        key: dreamerRunKey('UTC', date),
        localDate: date,
        timeZone: 'UTC',
        generation: current.settings.generation,
      })
      if (claim.kind !== 'claimed') throw new Error(`expected claim ${index}`)
      await store.commitRun(claim.claim, { ...plan, id: `plan-${index}` }, [])
    }
    const day36 = localDate(36)
    await expect(store.claimRun({
      key: dreamerRunKey('UTC', day36),
      localDate: day36,
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })).resolves.toMatchObject({ kind: 'claimed' })
    expect(store.snapshot().runs.length).toBeLessThanOrEqual(35)
    expect(DreamerCapacityError).toBeDefined()
  })

  it('prunes retired failed records across mixed daily outcomes and restart', async () => {
    const root = await directory()
    let now = new Date('2026-10-01T02:00:00.000Z')
    let store = new DreamerStore(root, { now: () => now })
    await store.initialize()
    await store.updateSettings(store.snapshot().revision, { enabled: true, timeZone: 'UTC' })
    for (let day = 1; day <= 80; day += 1) {
      now = new Date(`${localDate(day)}T02:00:00.000Z`)
      const date = localDate(day)
      const result = await store.claimRun({
        key: dreamerRunKey('UTC', date),
        localDate: date,
        timeZone: 'UTC',
        generation: store.snapshot().settings.generation,
      })
      if (result.kind !== 'claimed') throw new Error(`Day ${day} was refused: ${result.kind}`)
      if (day % 2 === 1) await store.failRun(result.claim, 'Review failed.')
      else await store.commitRun(result.claim, { ...plan, id: `plan-${day}`, localDate: date }, [])
      if (day === 40) {
        store = new DreamerStore(root, { now: () => now })
        await store.initialize()
      }
    }
    const reopened = new DreamerStore(root, { now: () => now })
    await reopened.initialize()
    expect(reopened.snapshot().runs.length).toBeLessThanOrEqual(35)
    expect(reopened.snapshot().plan?.id).toBe('plan-80')
    expect(reopened.snapshot().plan?.items[0].status).toBe('pending')
    now = new Date('2026-10-01T02:00:00.000Z')
    await expect(reopened.claimRun({
      key: dreamerRunKey('UTC', '2026-10-01'),
      localDate: '2026-10-01',
      timeZone: 'UTC',
      generation: reopened.snapshot().settings.generation,
    })).resolves.toMatchObject({ kind: 'retired' })
  })

  it('reclaims expired leases at most twice and then fences the day', async () => {
    const root = await directory()
    let now = new Date('2026-10-29T02:00:00.000Z')
    let token = 0
    const store = new DreamerStore(root, {
      now: () => now,
      randomUUID: () => `claim-${++token}`,
    })
    await store.initialize()
    const initial = store.snapshot()
    await store.updateSettings(initial.revision, { enabled: true, timeZone: 'UTC' })
    const claimInput = () => ({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    const first = await store.claimRun(claimInput())
    expect(first.kind).toBe('claimed')
    now = new Date('2026-10-29T12:01:00.000Z')
    const second = await store.claimRun(claimInput())
    expect(second.kind).toBe('claimed')
    now = new Date('2026-10-29T12:12:00.000Z')
    const third = await store.claimRun(claimInput())
    expect(third.kind).toBe('claimed')
    now = new Date('2026-10-29T12:23:00.000Z')
    await expect(store.claimRun(claimInput())).resolves.toMatchObject({ kind: 'attempts-exhausted' })
    if (first.kind === 'claimed') {
      await expect(store.commitRun(first.claim, plan, [])).rejects.toBeInstanceOf(DreamerConflictError)
    }
  })

  it('does not spin failed attempts on every coarse timer tick', async () => {
    const root = await directory()
    let now = new Date('2026-10-29T02:00:00.000Z')
    let token = 0
    const store = new DreamerStore(root, {
      now: () => now,
      randomUUID: () => `claim-${++token}`,
    })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const claimed = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })
    if (claimed.kind !== 'claimed') throw new Error('expected a claim')
    await store.failRun(claimed.claim, 'Dreamer could not save the morning review.')
    now = new Date('2026-10-29T02:00:30.000Z')
    await expect(store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })).resolves.toMatchObject({ kind: 'busy' })
    now = new Date('2026-10-29T02:01:00.000Z')
    await expect(store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })).resolves.toMatchObject({ kind: 'claimed' })
  })

  it('prunes terminal run records behind a persisted zone high-water fence', async () => {
    const root = await directory()
    let now = new Date('2026-10-01T02:00:00.000Z')
    const store = new DreamerStore(root, {
      now: () => now,
      randomUUID: (() => {
        let token = 0
        return () => `claim-${++token}`
      })(),
    })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    for (let day = 1; day <= 70; day += 1) {
      const date = localDate(day)
      now = new Date(`${date}T02:00:00.000Z`)
      const claim = await store.claimRun({
        key: dreamerRunKey('UTC', date),
        localDate: date,
        timeZone: 'UTC',
        generation: store.snapshot().settings.generation,
      })
      expect(claim.kind, `day ${day} should remain claimable`).toBe('claimed')
      if (claim.kind !== 'claimed') throw new Error(`expected claim for day ${day}`)
      await store.commitRun(claim.claim, { ...plan, id: `plan-${day}`, localDate: date }, [])
    }
    expect(store.snapshot().runs.length).toBeLessThanOrEqual(35)
    expect(store.snapshot().zoneFences).toEqual([
      { timeZone: 'UTC', highWaterDate: '2026-12-09' },
    ])

    const reopened = new DreamerStore(root, { now: () => new Date('2026-12-09T02:00:00.000Z') })
    await reopened.initialize()
    expect(reopened.snapshot().zoneFences).toEqual(store.snapshot().zoneFences)
    await expect(reopened.claimRun({
      key: dreamerRunKey('UTC', '2026-10-01'),
      localDate: '2026-10-01',
      timeZone: 'UTC',
      generation: reopened.snapshot().settings.generation,
    })).resolves.toMatchObject({ kind: 'retired' })
  })

  it('reclaims a nonterminal lease from an older settings generation immediately', async () => {
    const root = await directory()
    let now = new Date('2026-10-29T07:55:00.000Z')
    const store = new DreamerStore(root, {
      now: () => now,
      randomUUID: (() => {
        let token = 0
        return () => `claim-${++token}`
      })(),
    })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const old = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })
    expect(old.kind).toBe('claimed')
    const disabled = store.snapshot()
    await store.updateSettings(disabled.revision, { enabled: false, timeZone: 'UTC' })
    const reenabled = store.snapshot()
    await store.updateSettings(reenabled.revision, { enabled: true, timeZone: 'UTC' })
    const fresh = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: store.snapshot().settings.generation,
    })
    expect(fresh.kind).toBe('claimed')
    if (old.kind === 'claimed') {
      await expect(store.commitRun(old.claim, plan, [])).rejects.toBeInstanceOf(DreamerConflictError)
    }
  })

  it('records exhausted lease retries and preserves the error through plan edits', async () => {
    const root = await directory()
    let now = new Date('2026-10-28T02:00:00.000Z')
    let token = 0
    const store = new DreamerStore(root, {
      now: () => now,
      randomUUID: () => `claim-${++token}`,
    })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const prior = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-28'),
      localDate: '2026-10-28',
      timeZone: 'UTC',
      generation: 1,
    })
    if (prior.kind !== 'claimed') throw new Error('expected prior claim')
    await store.commitRun(prior.claim, { ...plan, localDate: '2026-10-28' }, [])

    const claimForCurrent = async () => store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })
    now = new Date('2026-10-29T02:00:00.000Z')
    const first = await claimForCurrent()
    expect(first.kind).toBe('claimed')
    now = new Date('2026-10-29T02:11:00.000Z')
    expect((await claimForCurrent()).kind).toBe('claimed')
    now = new Date('2026-10-29T02:22:00.000Z')
    expect((await claimForCurrent()).kind).toBe('claimed')
    now = new Date('2026-10-29T02:33:00.000Z')
    await expect(claimForCurrent()).resolves.toMatchObject({ kind: 'attempts-exhausted' })
    expect(store.snapshot().lastError).toContain('three attempts')

    const failedRevision = store.snapshot().revision
    await store.editPlan(failedRevision, 'plan-a', {
      item: { id: 'item-a', status: 'skipped' },
    })
    expect(store.snapshot().lastError).toContain('three attempts')

    now = new Date('2026-10-30T02:00:00.000Z')
    const recovered = await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-30'),
      localDate: '2026-10-30',
      timeZone: 'UTC',
      generation: 1,
    })
    if (recovered.kind !== 'claimed') throw new Error('expected recovered claim')
    await store.commitRun(recovered.claim, { ...plan, localDate: '2026-10-30' }, [])
    expect(store.snapshot().lastError).toBeUndefined()
  })

  it('retires an older failed record behind a later zone fence after restart', async () => {
    const root = await directory()
    let now = new Date('2026-10-29T02:00:00.000Z')
    let token = 0
    const first = new DreamerStore(root, {
      now: () => now,
      randomUUID: () => `claim-${++token}`,
    })
    await first.initialize()
    await first.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    const dayOne = await first.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })
    if (dayOne.kind !== 'claimed') throw new Error('expected day-one claim')
    await first.failRun(dayOne.claim, 'A safe first attempt failure.')
    now = new Date('2026-10-30T02:00:00.000Z')
    const dayTwo = await first.claimRun({
      key: dreamerRunKey('UTC', '2026-10-30'),
      localDate: '2026-10-30',
      timeZone: 'UTC',
      generation: 1,
    })
    if (dayTwo.kind !== 'claimed') throw new Error('expected day-two claim')
    await first.commitRun(dayTwo.claim, { ...plan, localDate: '2026-10-30' }, [])

    const reopened = new DreamerStore(root, {
      now: () => new Date('2026-10-29T02:10:00.000Z'),
      randomUUID: () => `reopened-${++token}`,
    })
    await reopened.initialize()
    await expect(reopened.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })).resolves.toMatchObject({ kind: 'retired' })
    expect(() => reopened.snapshot()).not.toThrow()

    const forward = await reopened.claimRun({
      key: dreamerRunKey('UTC', '2026-10-31'),
      localDate: '2026-10-31',
      timeZone: 'UTC',
      generation: 1,
    })
    expect(forward.kind).toBe('claimed')
  })

  it.each([false, true])(
    'does not roll back into a replaced directory when final sync fails (previous=%s)',
    async (hasPrevious) => {
      const root = await directory()
      const backup = `${root}-replaced`
      directories.push(backup)
      let syncCalls = 0
      let armed = false
      let swapped = false
      const store = new DreamerStore(root, {
        syncDirectory: async () => {
          syncCalls += 1
          if (armed && !swapped && syncCalls === 2) {
            swapped = true
            await rename(root, backup)
            await mkdir(root, { mode: 0o700 })
            await writeFile(path.join(root, 'dreamer.json'), 'replacement-sentinel')
            throw new Error('final directory sync failed')
          }
        },
      })
      await store.initialize()
      if (hasPrevious) {
        await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
      }
      syncCalls = 0
      armed = true
      const revision = store.snapshot().revision
      await expect(store.updateSettings(revision, {
        enabled: !hasPrevious,
        timeZone: 'UTC',
      })).rejects.toBeInstanceOf(Error)
      expect(await readFile(path.join(root, 'dreamer.json'), 'utf8'))
        .toBe('replacement-sentinel')
    },
  )

  it.each([
    ['missing expiry', (run: Record<string, unknown>) => {
      delete run.expiresAt
    }],
    ['invalid expiry', (run: Record<string, unknown>) => {
      run.expiresAt = '2026-10-29T01:59:59.000Z'
    }],
    ['overlong expiry', (run: Record<string, unknown>) => {
      run.expiresAt = '2026-10-29T12:01:00.000Z'
    }],
    ['normalized impossible date', (run: Record<string, unknown>) => {
      run.claimedAt = '2026-02-30T02:00:00.000Z'
      run.expiresAt = '2026-02-30T02:10:00.000Z'
    }],
    ['noncanonical expiry', (run: Record<string, unknown>) => {
      run.expiresAt = '2026-10-29 02:10:00Z'
    }],
    ['invalid token type', (run: Record<string, unknown>) => {
      run.claimToken = 42
    }],
    ['generation newer than settings', (run: Record<string, unknown>) => {
      run.generation = 2
    }],
    ['committed run without terminal fields', (run: Record<string, unknown>) => {
      run.status = 'committed'
      delete run.claimToken
      delete run.claimedAt
      delete run.expiresAt
      run.committedAt = '2026-10-29T02:00:00.000Z'
    }],
    ['retryable failure without retry time', (run: Record<string, unknown>) => {
      run.status = 'failed'
      delete run.claimToken
      delete run.claimedAt
      delete run.expiresAt
      delete run.retryAt
    }],
  ])('rejects corrupt run state with %s and preserves primary bytes', async (_label, mutate) => {
    const root = await directory()
    const key = dreamerRunKey('UTC', '2026-10-29')
    const run: Record<string, unknown> = {
      key,
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
      status: 'claimed',
      attempts: 1,
      claimToken: 'claim-token',
      claimedAt: '2026-10-29T02:00:00.000Z',
      expiresAt: '2026-10-29T02:10:00.000Z',
    }
    mutate(run)
    const serialized = JSON.stringify({
      version: 1,
      revision: 1,
      settings: { enabled: true, timeZone: 'UTC', generation: 1 },
      runs: [run],
      zoneFences: [],
      history: [],
    })
    const statePath = path.join(root, 'dreamer.json')
    await writeFile(statePath, serialized)
    await expect(new DreamerStore(root).initialize())
      .rejects.toBeInstanceOf(DreamerRecoveryError)
    expect(await readFile(statePath, 'utf8')).toBe(serialized)
  })

  it('rejects duplicate run keys and duplicate JSON object keys without resetting state', async () => {
    const root = await directory()
    const key = dreamerRunKey('UTC', '2026-10-29')
    const run = {
      key,
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
      status: 'claimed',
      attempts: 1,
      claimToken: 'claim-token',
      claimedAt: '2026-10-29T02:00:00.000Z',
      expiresAt: '2026-10-29T02:10:00.000Z',
    }
    const duplicateRunState = JSON.stringify({
      version: 1,
      revision: 1,
      settings: { enabled: true, timeZone: 'UTC', generation: 1 },
      runs: [run, { ...run }],
      zoneFences: [],
      history: [],
    })
    const statePath = path.join(root, 'dreamer.json')
    await writeFile(statePath, duplicateRunState)
    await expect(new DreamerStore(root).initialize())
      .rejects.toBeInstanceOf(DreamerRecoveryError)
    expect(await readFile(statePath, 'utf8')).toBe(duplicateRunState)

    const validState = JSON.stringify({
      version: 1,
      revision: 1,
      settings: { enabled: true, timeZone: 'UTC', generation: 1 },
      runs: [run],
      zoneFences: [],
      history: [],
    })
    const duplicatePropertyState = validState.replace(
      `"key":"${key}","localDate"`,
      `"key":"${key}","key":"${key}","localDate"`,
    )
    await writeFile(statePath, duplicatePropertyState)
    const reopened = new DreamerStore(root)
    await expect(reopened.initialize()).rejects.toBeInstanceOf(DreamerRecoveryError)
    expect(await readFile(statePath, 'utf8')).toBe(duplicatePropertyState)
  })
})
