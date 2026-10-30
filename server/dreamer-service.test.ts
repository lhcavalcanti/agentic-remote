import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DreamerService,
  type DreamerServiceOptions,
} from './dreamer-service.js'
import { DreamerStore } from './dreamer-store.js'

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
})
