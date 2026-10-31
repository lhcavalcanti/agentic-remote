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
import type { ManagedSession } from '../shared/contracts.js'

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

function completionSession(
  taskCompletion = true,
  content = '**Done.** The requested change passed its focused checks.',
): ManagedSession {
  return {
    id: 'session-error',
    computerId: 'computer-a',
    computerName: 'development',
    cwd: '/home/tester/project',
    title: 'Review failed session',
    updatedAt: '2026-10-29T03:30:00.000Z',
    status: 'idle',
    messages: [{
      id: 'completion-message',
      role: 'assistant',
      content,
      createdAt: '2026-10-29T03:20:00.000Z',
      ...(taskCompletion ? {
        taskCompletion: {
          source: 'root-task-complete' as const,
          toolCallId: 'task-complete-call',
          completedAt: '2026-10-29T03:20:00.000Z',
        },
      } : {}),
    }],
  }
}

describe('DreamerService', () => {
  it('offers only authoritative task completion evidence and confirms it idempotently', async () => {
    const directory = await root()
    let currentNow = new Date('2026-10-29T04:00:00.000Z')
    const now = () => currentNow
    const readSession = vi.fn(async () => completionSession())
    const service = new DreamerService(directory, options(now, { readSession }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    const proposed = await service.snapshotForApi()
    const item = proposed.plan!.items[0]
    expect(item).toMatchObject({
      status: 'pending',
      source: 'session',
      computerId: 'computer-a',
      sessionId: 'session-error',
    })
    expect(readSession).toHaveBeenCalledWith('computer-a', 'session-error')
    await expect(readSession.mock.results[0].value).resolves.toMatchObject({
      messages: [expect.objectContaining({
        taskCompletion: expect.objectContaining({ source: 'root-task-complete' }),
      })],
    })
    expect(item.completionCandidate).toEqual({
      computerId: 'computer-a',
      sessionId: 'session-error',
      messageId: 'completion-message',
      toolCallId: 'task-complete-call',
      completedAt: '2026-10-29T03:20:00.000Z',
      resultDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
      summary: '**Done.** The requested change passed its focused checks.',
    })

    const reordered = await service.editPlan({
      revision: proposed.revision,
      planId: proposed.plan!.id,
      order: proposed.plan!.items.map(({ id }) => id).reverse(),
    })
    const projectedItem = reordered.plan!.items.find(({ id }) => id === item.id)!
    expect(projectedItem.completionCandidate).toEqual(item.completionCandidate)

    const confirmed = await service.editPlan({
      revision: reordered.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })
    expect(confirmed.plan!.items.find(({ id }) => id === item.id)).toMatchObject({
      status: 'done',
      completion: {
        computerId: 'computer-a',
        sessionId: 'session-error',
        messageId: 'completion-message',
        toolCallId: 'task-complete-call',
        resultDigest: item.completionCandidate!.resultDigest,
        completedAt: '2026-10-29T03:20:00.000Z',
        confirmedAt: '2026-10-29T04:00:00.000Z',
      },
    })

    currentNow = new Date('2026-10-29T04:05:00.000Z')
    const readsAfterConfirmation = readSession.mock.calls.length
    readSession.mockRejectedValue(new Error('remote computer is offline'))
    const duplicate = await service.editPlan({
      revision: reordered.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })
    expect(duplicate.revision).toBe(confirmed.revision)
    expect(readSession).toHaveBeenCalledTimes(readsAfterConfirmation)

    const persisted = await import('node:fs/promises').then(({ readFile }) =>
      readFile(`${directory}/dreamer.json`, 'utf8'))
    expect(persisted).not.toContain('requested change passed')
    await service.stop()

    const reopened = new DreamerService(directory, options(now, { readSession }))
    await reopened.initialize()
    expect(reopened.snapshot().plan!.items.find(({ id }) => id === item.id)?.completion).toEqual(
      confirmed.plan!.items.find(({ id }) => id === item.id)?.completion,
    )
    await reopened.stop()
  })

  it('refuses plain assistant text as task completion evidence', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now, {
      readSession: async () => completionSession(false),
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const snapshot = await service.snapshotForApi()
    expect(snapshot.plan!.items[0].completionCandidate).toBeUndefined()
    await expect(service.editPlan({
      revision: snapshot.revision,
      planId: snapshot.plan!.id,
      completion: {
        itemId: snapshot.plan!.items[0].id,
        messageId: 'completion-message',
        resultDigest: 'a'.repeat(64),
      },
    })).rejects.toMatchObject({ statusCode: 409 })
    await service.stop()
  })

  it('reports an unavailable completion source and refuses confirmation until it can be re-read', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    const service = new DreamerService(directory, options(now, {
      readSession: async () => {
        throw new Error('remote computer is offline')
      },
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })

    const snapshot = await service.snapshotForApi()
    expect(snapshot.plan!.items[0]).toMatchObject({
      source: 'session',
      completionSourceUnavailable: true,
    })
    expect(snapshot.plan!.items[0].completionCandidate).toBeUndefined()
    await expect(service.editPlan({
      revision: snapshot.revision,
      planId: snapshot.plan!.id,
      completion: {
        itemId: snapshot.plan!.items[0].id,
        messageId: 'completion-message',
        resultDigest: 'a'.repeat(64),
      },
    })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringMatching(/could not be re-read/i),
    })
    await service.stop()
  })

  it('revalidates the exact authoritative result before confirming completion', async () => {
    const directory = await root()
    const now = () => new Date('2026-10-29T04:00:00.000Z')
    let result = completionSession()
    const service = new DreamerService(directory, options(now, {
      readSession: async () => result,
    }))
    await service.start()
    const disabled = service.snapshot()
    await service.updateSettings({
      revision: disabled.revision,
      enabled: true,
      timeZone: 'UTC',
    })
    const proposed = await service.snapshotForApi()
    const item = proposed.plan!.items[0]
    result = completionSession(true, '**Changed.** This is not the reviewed result.')

    await expect(service.editPlan({
      revision: proposed.revision,
      planId: proposed.plan!.id,
      completion: {
        itemId: item.id,
        messageId: item.completionCandidate!.messageId,
        resultDigest: item.completionCandidate!.resultDigest,
      },
    })).rejects.toMatchObject({ statusCode: 409 })
    expect(service.snapshot().plan!.items[0].status).toBe('pending')
    expect(service.snapshot().plan!.items[0].completion).toBeUndefined()
    await service.stop()
  })

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

  it('reports an abandoned overnight claim as missed after restart outside the window', async () => {
    const directory = await root()
    let now = new Date('2026-10-29T02:00:00.000Z')
    const store = new DreamerStore(directory, { now: () => now })
    await store.initialize()
    await store.updateSettings(0, { enabled: true, timeZone: 'UTC' })
    await store.claimRun({
      key: dreamerRunKey('UTC', '2026-10-29'),
      localDate: '2026-10-29',
      timeZone: 'UTC',
      generation: 1,
    })
    now = new Date('2026-10-29T09:00:00.000Z')
    const registry = vi.fn(() => ({}))
    const restarted = new DreamerService(directory, { now: () => now, registry })
    await restarted.start()
    try {
      await expect(restarted.snapshotForApi()).resolves.toMatchObject({
        lastError: 'Dreamer missed the current review window.',
      })
      expect(registry).not.toHaveBeenCalled()
    } finally {
      await restarted.stop()
    }
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
