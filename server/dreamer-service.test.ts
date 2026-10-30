import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DreamerService,
  type DreamerServiceOptions,
} from './dreamer-service.js'
import type { DreamerMemoryMetadataRecord } from './dreamer-planner.js'
import type { ManagerStructuredMemoryRuntime } from './manager-structured-memory-runtime.js'
import { DreamerStore, dreamerRunKey } from './dreamer-store.js'

const directories: string[] = []

async function root(): Promise<string> {
  const value = path.join(process.cwd(), `.dreamer-service-test-${randomUUID()}`)
  await mkdir(value, { recursive: true })
  directories.push(value)
  return value
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((value) => rm(value, { recursive: true, force: true })))
})

function options(now: () => Date, overrides: Partial<DreamerServiceOptions> = {}): DreamerServiceOptions {
  return {
    now,
    registry: () => ({
      'computer-a:session-error': {
        computerId: 'computer-a',
        sessionId: 'session-error',
        title: 'SECRET TITLE',
        task: 'SECRET PROMPT',
        cwd: '/secret/path',
        origin: 'user',
        firstSeenAt: '2026-10-29T00:00:00.000Z',
        lastStatus: 'error',
        lastSeenAt: '2026-10-29T03:00:00.000Z',
      },
    }),
    memory: () => ({
      mode: 'off',
      available: false,
      records: [],
      tombstones: [],
    }),
    ...overrides,
  }
}

function activeMemory(recordId = 'memory-a') {
  return {
    mode: 'on' as const,
    available: true,
    records: [{
      id: recordId,
      kind: 'fact' as const,
      scope: { type: 'user' as const },
      authority: 'direct-user' as const,
      confidence: 1,
      createdAt: '2026-10-28T00:00:00.000Z',
      updatedAt: '2026-10-29T03:00:00.000Z',
    }],
    tombstones: [] as Array<{ recordId: string }>,
  }
}

describe('DreamerService', () => {
  it('does not read sources or create a timer while disabled', async () => {
    const directory = await root()
    const registry = vi.fn(() => ({}))
    const memory = vi.fn(() => ({ mode: 'off' as const, available: false, records: [], tombstones: [] }))
    const service = new DreamerService(directory, { now: () => new Date('2026-10-29T04:00:00.000Z'), registry, memory })
    await service.start()
    expect(registry).not.toHaveBeenCalled()
    expect(memory).not.toHaveBeenCalled()
    expect(service.timerActive()).toBe(false)
    await service.stop()
  })

  it('runs the deterministic plan immediately after enabling during the catch-up window', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now))
    await service.start()
    const disabled = service.snapshot()
    const enabled = await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    expect(enabled.plan?.localDate).toBe('2026-10-29')
    expect(enabled.plan?.items[0]).toMatchObject({
      source: 'session',
      sessionId: 'session-error',
      label: 'Session needs attention',
    })
    expect(JSON.stringify(enabled)).not.toContain('SECRET')
    expect(service.timerActive()).toBe(true)
    await service.stop()
  })

  it.each([
    ['Europe/Berlin', '2026-10-29T01:05:00.000Z', '2026-10-29'],
    ['Asia/Kathmandu', '2026-10-28T20:20:00.000Z', '2026-10-29'],
  ])('reopens a durable %s run without rejecting its encoded key', async (timeZone, instant, localDate) => {
    const directory = await root()
    const now = () => new Date(instant)
    const first = new DreamerService(directory, {
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })
    await first.initialize()
    const initial = first.snapshot()
    const enabled = await first.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone,
    })
    expect(enabled.plan?.localDate).toBe(localDate)
    await first.stop()

    const reopened = new DreamerService(directory, {
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })
    await expect(reopened.start()).resolves.toBeUndefined()
    expect(reopened.snapshot().plan?.localDate).toBe(localDate)
    const persisted = new DreamerStore(directory, { now })
    await persisted.initialize()
    expect(persisted.snapshot().runs).toHaveLength(1)
    await reopened.stop()
  })

  it('contains a claim persistence failure and stops its timer without raw error leakage', async () => {
    const directory = await root()
    let failWrites = false
    let currentNow = new Date('2026-10-29T01:00:00.000Z')
    const store = new DreamerStore(directory, {
      now: () => currentNow,
      writeFile: async (filePath, data, options) => {
        if (failWrites) throw new Error('/secret/provider/path must not reach UI')
        return writeFile(filePath, data, options)
      },
    })
    let tick: (() => void) | undefined
    const service = new DreamerService(directory, {
      store,
      now: () => currentNow,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
      setInterval: ((callback: (...args: unknown[]) => void) => {
        tick = callback as () => void
        return { unref: () => undefined } as unknown as ReturnType<typeof setInterval>
      }) as typeof setInterval,
      clearInterval: (() => undefined) as typeof clearInterval,
    })
    await service.initialize()
    const initial = service.snapshot()
    await service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    currentNow = new Date('2026-10-29T04:00:00.000Z')
    failWrites = true
    const unhandled: unknown[] = []
    const onUnhandled = (error: unknown) => unhandled.push(error)
    process.on('unhandledRejection', onUnhandled)
    tick?.()
    await vi.waitFor(() => {
      expect(service.timerActive()).toBe(false)
    })
    process.off('unhandledRejection', onUnhandled)
    expect(unhandled).toEqual([])
    await expect(service.snapshotForApi()).rejects.toMatchObject({ statusCode: 503 })
    expect(JSON.stringify(unhandled)).not.toContain('provider/path')
  })

  it('does not report success when recording a planner failure also loses storage', async () => {
    const directory = await root()
    let currentNow = new Date('2026-10-29T01:00:00.000Z')
    let failWrites = false
    const store = new DreamerStore(directory, {
      now: () => currentNow,
      writeFile: async (filePath, data, options) => {
        if (failWrites) throw new Error('/secret/failure/path must not reach UI')
        return writeFile(filePath, data, options)
      },
    })
    const service = new DreamerService(directory, {
      store,
      now: () => currentNow,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
      planner: () => {
        failWrites = true
        throw new Error('planner failed with a sensitive internal cause')
      },
    })
    await service.initialize()
    const initial = service.snapshot()
    await service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    currentNow = new Date('2026-10-29T04:00:00.000Z')
    const result = await service.runIfDue()
    expect(result.available).toBe(false)
    expect(result.lastError).toBe('Dreamer storage is unavailable.')
    expect(service.timerActive()).toBe(false)
  })

  it('fences an in-flight plan after disable and keeps the previous plan', async () => {
    const directory = await root()
    let release: (() => void) | undefined
    const blocked = new Promise<void>((resolve) => { release = resolve })
    const service = new DreamerService(directory, options(
      () => new Date('2026-10-29T04:00:00.000Z'),
      {
        planner: async (input) => {
          await blocked
          return input.defaultPlan
        },
      },
    ))
    await service.start()
    const initial = service.snapshot()
    const enabling = service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    await vi.waitFor(() => {
      expect(service.snapshot().settings.enabled).toBe(true)
    })

    const beforeDisable = service.snapshot()
    const disabling = service.updateSettings({
      revision: beforeDisable.revision,
      enabled: false,
      timeZone: 'UTC',
    })
    release?.()
    await enabling
    await disabling
    expect(service.snapshot().settings.enabled).toBe(false)
    expect(service.snapshot().plan).toBeUndefined()
    await service.stop()
  })

  it('does not wait indefinitely for a fenced planner when disabling', async () => {
    const directory = await root()
    let release: (() => void) | undefined
    const blocked = new Promise<void>((resolve) => { release = resolve })
    const service = new DreamerService(directory, options(
      () => new Date('2026-10-29T04:00:00.000Z'),
      {
        planner: async (input) => {
          await blocked
          return input.defaultPlan
        },
      },
    ))
    await service.start()
    const initial = service.snapshot()
    const enabling = service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    await vi.waitFor(() => expect(service.snapshot().settings.enabled).toBe(true))
    const disabling = service.updateSettings({
      revision: service.snapshot().revision,
      enabled: false,
      timeZone: 'UTC',
    })
    await expect(Promise.race([
      disabling.then(() => 'done'),
      new Promise((resolve) => setTimeout(() => resolve('timeout'), 50)),
    ])).resolves.toBe('done')
    release?.()
    await enabling
    await disabling
  })

  it('waits for an admitted commit critical section but not a paused planner on stop', async () => {
    const directory = await root()
    let currentNow = new Date('2026-10-29T01:00:00.000Z')
    let blockCommit = false
    let releaseCommit: (() => void) | undefined
    let commitStarted: (() => void) | undefined
    const commitReady = new Promise<void>((resolve) => { commitStarted = resolve })
    const commitGate = new Promise<void>((resolve) => { releaseCommit = resolve })
    const store = new DreamerStore(directory, {
      now: () => currentNow,
      writeFile: async (filePath, data, options) => {
        if (blockCommit) {
          commitStarted?.()
          await commitGate
          blockCommit = false
        }
        return writeFile(filePath, data, options)
      },
    })
    const service = new DreamerService(directory, {
      store,
      now: () => currentNow,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
      planner: async (input) => {
        blockCommit = true
        return input.defaultPlan
      },
    })
    await service.initialize()
    const initial = service.snapshot()
    await service.updateSettings({ revision: initial.revision, enabled: true, timeZone: 'UTC' })
    currentNow = new Date('2026-10-29T04:00:00.000Z')
    const worker = service.runIfDue()
    await commitReady
    const stopping = service.stop()
    await expect(Promise.race([
      stopping.then(() => 'done'),
      new Promise((resolve) => setTimeout(() => resolve('timeout'), 50)),
    ])).resolves.toBe('timeout')
    releaseCommit?.()
    await worker
    await stopping
    expect(service.snapshot().plan?.localDate).toBe('2026-10-29')
  })

  it('marks a persisted memory reference stale before exposing it as an active suggestion', async () => {
    const directory = await root()
    let memory = {
      mode: 'on' as const,
      available: true,
      records: [{
        id: 'memory-a',
        kind: 'fact' as const,
        scope: { type: 'user' as const },
        authority: 'direct-user' as const,
        confidence: 1,
        createdAt: '2026-10-28T00:00:00.000Z',
        updatedAt: '2026-10-29T03:00:00.000Z',
      }],
      tombstones: [] as Array<{ recordId: string }>,
    }
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      memory: () => memory,
    })
    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    expect(enabled.plan?.items[0]).toMatchObject({ memoryId: 'memory-a', status: 'pending' })
    memory = {
      ...memory,
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }
    const refreshed = await service.snapshotForApi()
    expect(refreshed.plan?.items[0]).toMatchObject({ memoryId: 'memory-a', status: 'skipped' })
  })

  it('captures only the structured-memory metadata projection', async () => {
    const directory = await root()
    const fullSnapshot = vi.fn(() => {
      throw new Error('full structured-memory snapshot must not be read')
    })
    const metadataSnapshot = vi.fn(() => ({
      records: [{
        id: 'memory-a',
        kind: 'fact' as const,
        scope: { type: 'user' as const },
        authority: 'direct-user' as const,
        confidence: 1,
        createdAt: '2026-10-28T00:00:00.000Z',
        updatedAt: '2026-10-29T03:00:00.000Z',
      }],
      tombstones: [],
    }))
    const structuredMemory = {
      mode: 'on' as const,
      store: {
        failureReason: () => undefined,
        snapshot: fullSnapshot,
        metadataSnapshot,
      },
    } as unknown as ManagerStructuredMemoryRuntime
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      structuredMemory,
    })

    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    expect(metadataSnapshot).toHaveBeenCalled()
    expect(fullSnapshot).not.toHaveBeenCalled()
    expect(enabled.plan?.items[0]).toMatchObject({ memoryId: 'memory-a' })
  })

  it('does not clone extra sensitive fields from a direct metadata adapter', async () => {
    const directory = await root()
    const record: DreamerMemoryMetadataRecord = {
      id: 'memory-a',
      kind: 'fact',
      scope: { type: 'user' },
      authority: 'direct-user',
      confidence: 1,
      createdAt: '2026-10-28T00:00:00.000Z',
      updatedAt: '2026-10-29T03:00:00.000Z',
    }
    Object.defineProperty(record, 'content', {
      configurable: true,
      enumerable: true,
      get: () => {
        throw new Error('content was read')
      },
    })
    Object.defineProperty(record, 'canonicalKey', {
      configurable: true,
      enumerable: true,
      get: () => {
        throw new Error('canonicalKey was read')
      },
    })
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      memory: () => ({
        mode: 'on',
        available: true,
        records: [record],
        tombstones: [],
      }),
    })

    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    expect(enabled.plan?.items[0]).toMatchObject({ memoryId: 'memory-a' })
  })

  it('derives a missed current-window status without rewriting state', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T09:00:00.000Z')
    const store = new DreamerStore(directory, { now })
    const recordError = vi.spyOn(store, 'recordError')
    const service = new DreamerService(directory, {
      store,
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })

    await service.initialize()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const revision = enabled.revision
    const missed = await service.snapshotForApi()

    expect(missed.lastError).toBe('Dreamer missed the current review window.')
    expect(store.snapshot().revision).toBe(revision)
    expect(recordError).not.toHaveBeenCalled()
    await service.stop()
  })

  it('keeps an existing error instead of deriving a missed status', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T09:00:00.000Z')
    const store = new DreamerStore(directory, { now })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    await store.recordError('An existing safe Dreamer error.')
    const service = new DreamerService(directory, {
      store,
      now,
      registry: () => ({}),
      memory: () => ({ mode: 'off', available: false, records: [], tombstones: [] }),
    })
    await service.initialize()

    await expect(service.snapshotForApi()).resolves.toMatchObject({
      lastError: 'An existing safe Dreamer error.',
    })
  })

  it('coalesces concurrent stale-memory GET reconciliation without losing revisions', async () => {
    const directory = await root()
    let memory = activeMemory()
    const service = new DreamerService(directory, {
      now: () => new Date('2026-10-29T04:00:00.000Z'),
      registry: () => ({}),
      memory: () => memory,
    })
    await service.start()
    const initial = service.snapshot()
    const enabled = await service.updateSettings({
      revision: initial.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    expect(enabled.plan?.items[0].status).toBe('pending')
    memory = {
      ...memory,
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }

    const snapshots = await Promise.all(
      Array.from({ length: 4 }, () => service.snapshotForApi()),
    )
    expect(snapshots.every((snapshot) =>
      snapshot.plan?.items[0].status === 'skipped')).toBe(true)
    expect(new Set(snapshots.map(({ revision }) => revision)).size).toBe(1)
  })

  it.each([
    ['forgotten', {
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }],
    ['expired', {
      records: [{
        ...activeMemory().records[0],
        validUntil: '2026-10-29T03:00:00.000Z',
      }],
      tombstones: [],
    }],
    ['tombstoned', {
      records: [],
      tombstones: [{ recordId: 'memory-a' }],
    }],
    ['superseded', {
      records: [{
        ...activeMemory().records[0],
        supersededById: 'memory-new',
      }],
      tombstones: [],
    }],
  ])('rejects restoring a %s memory item while enabled and disabled', async (_label, stale) => {
    for (const enabledState of [true, false]) {
      const directory = await root()
      let memory = activeMemory()
      const service = new DreamerService(directory, {
        now: () => new Date('2026-10-29T04:00:00.000Z'),
        registry: () => ({}),
        memory: () => memory,
      })
      await service.start()
      const initial = service.snapshot()
      await service.updateSettings({
        revision: initial.revision,
        enabled: true,
        timeZone: 'UTC',
      })
      if (!enabledState) {
        const beforeDisable = service.snapshot()
        await service.updateSettings({
          revision: beforeDisable.revision,
          enabled: false,
          timeZone: 'UTC',
        })
      }
      const beforeEdit = service.snapshot()
      const item = beforeEdit.plan!.items[0]
      memory = {
        mode: 'on',
        available: true,
        records: stale.records,
        tombstones: stale.tombstones,
      }

      await expect(service.editPlan({
        revision: beforeEdit.revision,
        planId: beforeEdit.plan!.id,
        item: { id: item.id, status: 'pending' },
      })).rejects.toMatchObject({ statusCode: 409 })
      expect(service.snapshot().plan?.items[0].status).toBe('skipped')
      await service.stop()
    }
  })

  it.each(['off', 'shadow'] as const)(
    'does not read structured-memory state while refusing a restore in %s mode',
    async (mode) => {
      const directory = await root()
      const store = new DreamerStore(directory, {
        now: () => new Date('2026-10-29T04:00:00.000Z'),
      })
      await store.initialize()
      await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
      const claim = await store.claimRun({
        key: dreamerRunKey('UTC', '2026-10-29'),
        localDate: '2026-10-29',
        timeZone: 'UTC',
        generation: 1,
      })
      if (claim.kind !== 'claimed') throw new Error('expected a Dreamer claim')
      await store.commitRun(claim.claim, {
        id: 'plan-a',
        localDate: '2026-10-29',
        timeZone: 'UTC',
        createdAt: '2026-10-29T02:00:00.000Z',
        items: [{
          id: 'memory-item',
          label: 'Memory item needs review',
          reason: 'Structured-memory metadata identifies an active review candidate.',
          status: 'pending',
          source: 'memory',
          memoryId: 'memory-a',
          fingerprint: 'memory-fingerprint',
        }],
        coverage: [],
        omitted: 0,
      }, [])
      const disabled = store.snapshot()
      await store.updateSettings(disabled.revision, { enabled: false, timeZone: 'UTC' })
      const metadataSnapshot = vi.fn(() => {
        throw new Error('structured-memory state must not be read')
      })
      const structuredMemory = {
        mode,
        store: {
          failureReason: () => undefined,
          metadataSnapshot,
        },
      } as unknown as ManagerStructuredMemoryRuntime
      const service = new DreamerService(directory, {
        store,
        now: () => new Date('2026-10-29T04:00:00.000Z'),
        structuredMemory,
      })
      await service.initialize()
      const current = service.snapshot()

      await expect(service.editPlan({
        revision: current.revision,
        planId: 'plan-a',
        item: { id: 'memory-item', status: 'pending' },
      })).rejects.toMatchObject({ statusCode: 503 })
      expect(metadataSnapshot).not.toHaveBeenCalled()
    },
  )
})
