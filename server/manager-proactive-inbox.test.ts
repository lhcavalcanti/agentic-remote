import {
  chown,
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ManagerProactiveInboxObservation,
  ManagerProactiveInboxOptions,
} from './manager-proactive-inbox.js'
import {
  ManagerProactiveInbox,
  ManagerProactiveInboxValidationError,
} from './manager-proactive-inbox.js'

type ReadGate = {
  path: string
  started: () => void
  release: Promise<void>
  consumed: boolean
}

const fsHooks = vi.hoisted(() => ({
  readGate: undefined as ReadGate | undefined,
  syncFailurePath: undefined as string | undefined,
  uidOverridePath: undefined as string | undefined,
}))

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  const open = async (...args: Parameters<typeof fs.open>) => {
    const handle = await fs.open(...args)
    const targetPath = args[0]
    const gate = fsHooks.readGate
    const syncFailurePath = fsHooks.syncFailurePath
    const uidOverridePath = fsHooks.uidOverridePath
    if (
      typeof targetPath !== 'string' ||
      (!gate && !syncFailurePath && !uidOverridePath)
    ) {
      return handle
    }
    const originalRead = handle.read.bind(handle)
    const originalStat = handle.stat.bind(handle)
    const originalSync = handle.sync.bind(handle)
    return new Proxy(handle, {
      get(target, property, receiver) {
        if (property === 'stat' && targetPath === uidOverridePath) {
          return async (...statArgs: Parameters<typeof handle.stat>) => {
            const metadata = await originalStat(...statArgs)
            return new Proxy(metadata, {
              get(metadataTarget, metadataProperty, metadataReceiver) {
                if (metadataProperty === 'uid') {
                  return typeof metadata.uid === 'bigint'
                    ? metadata.uid + 1n
                    : metadata.uid + 1
                }
                return Reflect.get(
                  metadataTarget,
                  metadataProperty,
                  metadataReceiver,
                )
              },
            })
          }
        }
        if (
          property === 'read' &&
          gate &&
          targetPath === gate.path &&
          !gate.consumed
        ) {
          return async (...readArgs: Parameters<typeof handle.read>) => {
            gate.consumed = true
            gate.started()
            await gate.release
            return originalRead(...readArgs)
          }
        }
        if (property === 'sync' && targetPath === syncFailurePath) {
          return async () => {
            throw new Error('injected parent sync failure')
          }
        }
        if (property === 'sync') return originalSync
        return Reflect.get(target, property, receiver)
      },
    })
  }
  return { ...fs, open }
})

describe('ManagerProactiveInbox', () => {
  let directory: string
  let clock: number
  const now = () => new Date(clock)

  beforeEach(async () => {
    directory = await mkdtemp(
      path.join(process.cwd(), '.manager-proactive-inbox-test-'),
    )
    clock = Date.parse('2026-10-20T05:00:00.000Z')
  })

  afterEach(async () => {
    fsHooks.readGate = undefined
    fsHooks.syncFailurePath = undefined
    fsHooks.uidOverridePath = undefined
    await rm(directory, { recursive: true, force: true })
  })

  function observation(
    overrides: Partial<ManagerProactiveInboxObservation> = {},
  ): ManagerProactiveInboxObservation {
    return {
      computerId: 'computer-a',
      computerGeneration: 'pairing-a',
      sessionId: 'session-a',
      revision: 1,
      origin: 'manager',
      status: 'running',
      queuedCount: 0,
      hasPendingRequest: false,
      isOpen: true,
      recovering: false,
      ...overrides,
    }
  }

  async function openInbox(
    options: Omit<
      ManagerProactiveInboxOptions,
      'hubId' | 'enabled' | 'now'
    > = {},
  ): Promise<ManagerProactiveInbox> {
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
      ...options,
    })
    await inbox.initialize()
    await inbox.bindComputer('computer-a', 'pairing-a')
    return inbox
  }

  it('uses the first running baseline to admit one finished task', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    expect(inbox.pending()).toEqual([])

    await inbox.observe(observation({ revision: 2, status: 'idle' }))

    expect(inbox.pending()).toMatchObject([
      { kind: 'finished', taskGeneration: 1 },
    ])
  })

  it('admits one blocked event when a running task reaches a pending request', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())

    const result = await inbox.observe(observation({
      revision: 2,
      status: 'waiting',
      hasPendingRequest: true,
    }))
    await inbox.observe(observation({
      revision: 3,
      status: 'waiting',
      hasPendingRequest: true,
    }))

    expect(result).toMatchObject({
      outcome: 'admitted',
      event: { kind: 'blocked', taskGeneration: 1 },
    })
    expect(inbox.pending()).toMatchObject([
      { kind: 'blocked', taskGeneration: 1, revision: 2 },
    ])
  })

  it('snapshots an observation before its queued mutation runs', async () => {
    const inbox = await openInbox()
    const input = observation()
    const pending = inbox.observe(input)
    input.sessionId = 'different-session'

    await pending
    await inbox.observe(observation({ revision: 2, status: 'idle' }))

    expect(inbox.pending()).toMatchObject([
      { sessionId: 'session-a', kind: 'finished' },
    ])
  })

  it('does no filesystem work when disabled', async () => {
    const disabledDirectory = path.join(directory, 'disabled')
    const inbox = new ManagerProactiveInbox(disabledDirectory, {
      hubId: 'hub-a',
      now,
    })

    await inbox.initialize()
    await inbox.bindComputer('computer-a', 'pairing-a')
    await inbox.observe(observation())

    expect(inbox.pending()).toEqual([])
    await expect(stat(disabledDirectory)).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('syncs newly created directory parents and retries interrupted setup', async () => {
    const nestedDirectory = path.join(
      directory,
      'created',
      'nested',
      'inbox',
    )
    fsHooks.syncFailurePath = path.join(directory, 'created')
    const inbox = new ManagerProactiveInbox(nestedDirectory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(inbox.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    await expect(stat(path.join(directory, 'created', 'nested')))
      .resolves.toMatchObject({ isDirectory: expect.any(Function) })
    await expect(stat(nestedDirectory)).rejects.toMatchObject({
      code: 'ENOENT',
    })

    fsHooks.syncFailurePath = undefined
    await inbox.initialize()
    expect((await stat(nestedDirectory)).mode & 0o777).toBe(0o700)
  })

  it('secures an owned existing inbox directory before trusting its state', async () => {
    const inboxDirectory = path.join(directory, 'owned')
    await mkdir(inboxDirectory, { mode: 0o777 })
    await chmod(inboxDirectory, 0o777)
    const inbox = new ManagerProactiveInbox(inboxDirectory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await inbox.initialize()

    expect((await stat(inboxDirectory)).mode & 0o777).toBe(0o700)
  })

  it('refuses mutations after the initialized inbox directory is replaced', async () => {
    const inbox = await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const replacedDirectory = `${directory}-replaced`
    await rename(directory, replacedDirectory)
    await mkdir(directory, { mode: 0o700 })
    try {
      await expect(inbox.observe(observation())).rejects.toMatchObject({
        statusCode: 503,
      })
      await expect(stat(statePath)).rejects.toMatchObject({
        code: 'ENOENT',
      })
    } finally {
      await rm(replacedDirectory, { recursive: true, force: true })
    }
  })

  it('refuses a foreign-owned inbox directory without touching it', async () => {
    const uid = process.getuid?.()
    expect(uid).toBeDefined()
    const foreignDirectory = uid === 0
      ? path.join(directory, 'foreign-owned')
      : '/proc'
    if (uid === 0) {
      await mkdir(foreignDirectory, { mode: 0o700 })
      await chown(foreignDirectory, 1, 1)
    }
    const metadata = await stat(foreignDirectory)
    expect(metadata.uid).not.toBe(uid)
    const inbox = new ManagerProactiveInbox(foreignDirectory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(inbox.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
  })

  it('coalesces overlapping successful initialization before mutations are available', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const started = deferred<void>()
    const release = deferred<void>()
    fsHooks.readGate = {
      path: statePath,
      started: started.resolve,
      release: release.promise,
      consumed: false,
    }
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    const first = inbox.initialize()
    await started.promise
    const second = inbox.initialize()

    expect(second).toBe(first)
    release.resolve()
    await Promise.all([first, second])
    await expect(inbox.observe(observation())).resolves.toMatchObject({
      outcome: 'baseline',
    })
  })

  it('coalesces overlapping failed initialization with the same safe error', async () => {
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const serialized = '{"corrupt":'
    await writeFile(statePath, serialized, { mode: 0o600 })
    const started = deferred<void>()
    const release = deferred<void>()
    fsHooks.readGate = {
      path: statePath,
      started: started.resolve,
      release: release.promise,
      consumed: false,
    }
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    const first = inbox.initialize()
    await started.promise
    const second = inbox.initialize()

    expect(second).toBe(first)
    release.resolve()
    await expect(first).rejects.toMatchObject({ statusCode: 503 })
    await expect(second).rejects.toMatchObject({ statusCode: 503 })
    expect(await readFile(statePath, 'utf8')).toBe(serialized)
  })

  it('requires initialization before operations', async () => {
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    expect(() => inbox.pending()).toThrow(
      'The proactive inbox must be initialized before use.',
    )
    await expect(inbox.bindComputer('computer-a', 'pairing-a')).rejects.toThrow(
      'The proactive inbox must be initialized before use.',
    )
    expect(() => inbox.observe(observation())).toThrow(
      'The proactive inbox must be initialized before use.',
    )
  })

  it.each([
    ['idle', { status: 'idle' as const }],
    ['error', { status: 'error' as const }],
  ])('does not invent a completion from a first %s baseline', async (_label, changes) => {
    const inbox = await openInbox()

    await inbox.observe(observation(changes))

    expect(inbox.pending()).toEqual([])
  })

  it('keeps a task active while non-actionable lifecycle guards remain', async () => {
    const inbox = await openInbox()

    await inbox.observe(observation())
    await inbox.observe(observation({
      revision: 2,
      status: 'idle',
      queuedCount: 1,
    }))
    await inbox.observe(observation({
      revision: 3,
      status: 'idle',
      queuedCount: 0,
      isOpen: false,
    }))
    await inbox.observe(observation({
      revision: 4,
      status: 'idle',
      recovering: true,
    }))
    expect(inbox.pending()).toEqual([])

    await inbox.observe(observation({ revision: 5, status: 'idle' }))

    expect(inbox.pending()).toMatchObject([
      { kind: 'finished', taskGeneration: 1, revision: 5 },
    ])
  })

  it.each([
    ['queued input', { queuedCount: 1 }],
    ['a closed session', { isOpen: false }],
    ['recovery', { recovering: true }],
  ])('keeps a task active when an error coincides with %s', async (_label, guard) => {
    const inbox = await openInbox()

    await inbox.observe(observation())
    await inbox.observe(observation({
      revision: 2,
      status: 'error',
      ...guard,
    }))
    expect(inbox.pending()).toEqual([])

    await inbox.observe(observation({ revision: 3, status: 'error' }))

    expect(inbox.pending()).toMatchObject([
      { kind: 'failed', taskGeneration: 1, revision: 3 },
    ])
  })

  it('blocks once for a pending request without later inventing completion', async () => {
    const inbox = await openInbox()

    await inbox.observe(observation())
    await inbox.observe(observation({
      revision: 2,
      status: 'idle',
      hasPendingRequest: true,
    }))
    await inbox.observe(observation({
      revision: 3,
      status: 'idle',
      hasPendingRequest: false,
    }))
    await inbox.observe(observation({
      revision: 4,
      status: 'idle',
      hasPendingRequest: false,
    }))

    expect(inbox.pending()).toMatchObject([
      { kind: 'blocked', taskGeneration: 1, revision: 2 },
    ])
  })

  it('admits one failure for an active task', async () => {
    const inbox = await openInbox()

    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'error' }))
    await inbox.observe(observation({ revision: 3, status: 'error' }))

    expect(inbox.pending()).toMatchObject([
      { kind: 'failed', taskGeneration: 1, revision: 2 },
    ])
  })

  it('ignores ineligible origins and stale or duplicate revisions', async () => {
    const inbox = await openInbox()

    for (const origin of ['user', 'discovered', 'schedule'] as const) {
      await expect(inbox.observe(observation({ origin }))).resolves.toMatchObject({
        outcome: 'ignored',
        reason: 'ineligible-origin',
      })
    }
    await inbox.observe(observation())
    await expect(inbox.observe(observation({
      revision: 1,
      status: 'idle',
    }))).resolves.toMatchObject({
      outcome: 'ignored',
      reason: 'stale-revision',
    })
    await expect(inbox.observe(observation({
      revision: 0,
      status: 'idle',
    }))).resolves.toMatchObject({
      outcome: 'ignored',
      reason: 'stale-revision',
    })
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({ revision: 3, status: 'idle' }))

    expect(inbox.pending()).toHaveLength(1)
  })

  it('keeps distinct task generations and same-time outcomes distinct', async () => {
    const inbox = await openInbox()

    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({ revision: 3, status: 'running' }))
    await inbox.observe(observation({ revision: 4, status: 'idle' }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 1,
      status: 'running',
    }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 2,
      status: 'error',
    }))

    const pending = inbox.pending()
    expect(pending).toMatchObject([
      { kind: 'failed', sessionId: 'session-b', taskGeneration: 1 },
      { kind: 'finished', sessionId: 'session-a', taskGeneration: 1 },
      { kind: 'finished', sessionId: 'session-a', taskGeneration: 2 },
    ])
    expect(new Set(pending.map(({ id }) => id)).size).toBe(3)
  })

  it('requires a bound generation and supersedes old generation evidence', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))

    await expect(inbox.observe(observation({
      computerGeneration: 'pairing-b',
      revision: 3,
      status: 'running',
    }))).rejects.toMatchObject({ statusCode: 409 })
    await expect(inbox.bindComputer('computer-b', 'pairing-b')).resolves.toMatchObject({
      changed: true,
    })
    await expect(inbox.observe(observation({
      computerId: 'computer-b',
      computerGeneration: 'pairing-b',
    }))).resolves.toMatchObject({ outcome: 'baseline' })

    const changed = await inbox.bindComputer('computer-a', 'pairing-b')
    expect(changed.supersededCount).toBe(1)
    expect(inbox.pending()).toEqual([])
    await expect(inbox.observe(observation({
      revision: 3,
      status: 'running',
    }))).rejects.toMatchObject({ statusCode: 409 })
    await expect(inbox.observe(observation({
      computerGeneration: 'pairing-b',
      revision: 1,
      status: 'running',
    }))).resolves.toMatchObject({ outcome: 'baseline' })
  })

  it.each([
    ['finished again', 'idle' as const, 'idle' as const],
    ['failed after finished', 'idle' as const, 'error' as const],
    ['failed again', 'error' as const, 'error' as const],
    ['finished after failed', 'error' as const, 'idle' as const],
  ])(
    'refuses a retired generation rebind before a %s transition, after reopen and pruning',
    async (_label, firstTerminalStatus, retryStatus) => {
      const inbox = await openInbox({ terminalEventRetentionMs: 1_000 })

      await inbox.observe(observation())
      await inbox.observe(observation({
        revision: 2,
        status: firstTerminalStatus,
      }))
      const event = inbox.pending()[0]!
      await inbox.acknowledge([event.id], 'handled')
      await inbox.bindComputer('computer-a', 'pairing-b')
      clock += 1_001
      await inbox.prune()

      const reopened = new ManagerProactiveInbox(directory, {
        enabled: true,
        hubId: 'hub-a',
        now,
      })
      await reopened.initialize()

      await expect(reopened.bindComputer('computer-a', 'pairing-a'))
        .rejects.toMatchObject({
          statusCode: 409,
          code: 'STALE_SCOPE',
        })
      await expect(reopened.observe(observation({
        computerGeneration: 'pairing-a',
        revision: 3,
        status: retryStatus,
      }))).rejects.toMatchObject({
        statusCode: 409,
        code: 'STALE_SCOPE',
      })
      expect(reopened.pending()).toEqual([])
    },
  )

  it('returns detached prioritized pending snapshots and validates limits', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 1,
      status: 'running',
    }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 2,
      status: 'error',
    }))

    const first = inbox.pending(1)
    first[0]!.kind = 'finished'
    expect(inbox.pending(1)[0]!.kind).toBe('failed')
    expect(() => inbox.pending(0)).toThrow()
    expect(() => inbox.pending(21)).toThrow()
    expect(inbox.pending(20)).toHaveLength(2)
  })

  it('acknowledges only known events atomically and idempotently', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 1,
      status: 'running',
    }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 2,
      status: 'error',
    }))
    const [finished, failed] = inbox.pending(20).sort(
      (left, right) => left.kind.localeCompare(right.kind),
    )

    await expect(inbox.acknowledge(
      [finished!.id, '0'.repeat(64)],
      'handled',
    )).rejects.toMatchObject({ statusCode: 409 })
    expect(inbox.pending()).toHaveLength(2)

    await expect(inbox.acknowledge([finished!.id], 'handled')).resolves.toEqual({
      acknowledged: 1,
      idempotent: false,
    })
    await expect(inbox.acknowledge([finished!.id], 'handled')).resolves.toEqual({
      acknowledged: 0,
      idempotent: true,
    })
    await expect(inbox.acknowledge([finished!.id], 'expired'))
      .rejects.toMatchObject({ statusCode: 409 })
    await inbox.acknowledge([failed!.id], 'irrelevant')
    expect(inbox.pending()).toEqual([])
  })

  it('snapshots acknowledgment IDs before its queued mutation runs', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    const ids = [inbox.pending()[0]!.id]
    const pending = inbox.acknowledge(ids, 'handled')
    ids.length = 0

    await expect(pending).resolves.toMatchObject({ acknowledged: 1 })
    expect(inbox.pending()).toEqual([])
  })

  it('refuses a third pending transition until an earlier event is acknowledged', async () => {
    const inbox = await openInbox({ maxPendingEvents: 2 })
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 1,
      status: 'running',
    }))
    await inbox.observe(observation({
      sessionId: 'session-b',
      revision: 2,
      status: 'error',
    }))
    await inbox.observe(observation({
      sessionId: 'session-c',
      revision: 1,
      status: 'running',
    }))
    await expect(inbox.observe(observation({
      sessionId: 'session-c',
      revision: 2,
      status: 'idle',
    }))).rejects.toMatchObject({ statusCode: 507 })
    const first = inbox.pending().find(
      ({ sessionId }) => sessionId === 'session-a',
    )!
    await inbox.acknowledge([first.id], 'handled')
    await inbox.observe(observation({
      sessionId: 'session-c',
      revision: 2,
      status: 'idle',
    }))

    expect(inbox.pending()).toMatchObject([
      { sessionId: 'session-b', kind: 'failed' },
      { sessionId: 'session-c', kind: 'finished' },
    ])
  })

  it('keeps the omitted twenty-first event pending across restart', async () => {
    const inbox = await openInbox()
    for (let index = 1; index <= 21; index += 1) {
      const sessionId = `session-${index}`
      await inbox.observe(observation({
        sessionId,
        revision: 1,
        status: 'running',
      }))
      await inbox.observe(observation({
        sessionId,
        revision: 2,
        status: 'idle',
      }))
    }
    const firstTwenty = inbox.pending(20)
    expect(firstTwenty).toHaveLength(20)
    await inbox.acknowledge(
      firstTwenty.map(({ id }) => id),
      'handled',
    )

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await reopened.initialize()
    expect(reopened.pending()).toMatchObject([
      { sessionId: 'session-21' },
    ])
  })

  it('serializes concurrent admissions without losing either event', async () => {
    const inbox = await openInbox()
    await Promise.all([
      inbox.observe(observation({
        sessionId: 'session-b',
        revision: 1,
        status: 'running',
      })),
      inbox.observe(observation({
        sessionId: 'session-c',
        revision: 1,
        status: 'running',
      })),
    ])
    await Promise.all([
      inbox.observe(observation({
        sessionId: 'session-b',
        revision: 2,
        status: 'idle',
      })),
      inbox.observe(observation({
        sessionId: 'session-c',
        revision: 2,
        status: 'idle',
      })),
    ])

    expect(inbox.pending()).toHaveLength(2)
  })

  it('retains cursors after explicit terminal-event pruning', async () => {
    const inbox = await openInbox({ terminalEventRetentionMs: 1_000 })
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    const event = inbox.pending()[0]!
    await inbox.acknowledge([event.id], 'handled')
    clock += 1_001

    await expect(inbox.prune()).resolves.toEqual({ pruned: 1 })
    expect(inbox.pending()).toEqual([])
    await expect(inbox.observe(observation({
      revision: 2,
      status: 'idle',
    }))).resolves.toMatchObject({
      outcome: 'ignored',
      reason: 'stale-revision',
    })
    await expect(inbox.observe(observation({
      revision: 3,
      status: 'running',
    }))).resolves.toMatchObject({
      outcome: 'observed',
      taskGeneration: 2,
    })
  })

  it('keeps the public and reopened state at the prior commit after a failed write', async () => {
    let syncCalls = 0
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
      syncDirectory: async () => {
        syncCalls += 1
        if (syncCalls === 3) throw new Error('injected sync failure')
      },
    })
    await inbox.initialize()
    await inbox.bindComputer('computer-a', 'pairing-a')
    await inbox.observe(observation())
    await expect(inbox.observe(observation({
      revision: 2,
      status: 'idle',
    }))).rejects.toMatchObject({ statusCode: 503 })

    expect(inbox.pending()).toEqual([])
    const persisted = JSON.parse(await readFile(
      path.join(directory, 'manager-proactive-inbox.json'),
      'utf8',
    )) as {
      cursors: Array<{ revision: number }>
    }
    expect(persisted.cursors[0]!.revision).toBe(1)

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await reopened.initialize()
    expect(reopened.pending()).toEqual([])
  })

  it('poisons the instance when publication and rollback both fail', async () => {
    let syncCalls = 0
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
      syncDirectory: async () => {
        syncCalls += 1
        if (syncCalls >= 3) throw new Error('injected sync failure')
      },
    })
    await inbox.initialize()
    await inbox.bindComputer('computer-a', 'pairing-a')
    await inbox.observe(observation())
    await expect(inbox.observe(observation({
      revision: 2,
      status: 'idle',
    }))).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining('roll back'),
    })
    expect(() => inbox.pending()).toThrow(
      'The proactive inbox could not roll back an incomplete publication',
    )
    expect(() => inbox.observe(observation({
      revision: 3,
      status: 'idle',
    }))).toThrow(expect.objectContaining({ statusCode: 503 }))

    const restarted = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await restarted.initialize()
    expect(restarted.pending()).toEqual([])
  })

  it('refuses a pre-commit state-size overflow without creating state', async () => {
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
      maxStateBytes: 100,
    })
    await inbox.initialize()

    await expect(inbox.bindComputer('computer-a', 'pairing-a'))
      .rejects.toMatchObject({ statusCode: 507 })
    await expect(stat(
      path.join(directory, 'manager-proactive-inbox.json'),
    )).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('keeps state private and tightens an owner-readable file on recovery', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    expect((await stat(statePath)).mode & 0o777).toBe(0o600)
    await chmod(statePath, 0o644)

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await reopened.initialize()

    expect((await stat(statePath)).mode & 0o777).toBe(0o600)
    expect(reopened.pending()).toEqual([])
  })

  it('requires permission tightening to be durable before recovery succeeds', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    await chmod(statePath, 0o644)
    fsHooks.syncFailurePath = statePath
    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect((await stat(statePath)).mode & 0o777).toBe(0o600)

    fsHooks.syncFailurePath = undefined
    await reopened.initialize()
    expect(reopened.pending()).toEqual([])
  })

  it('refuses a private state file not owned by the hub user', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    fsHooks.uidOverridePath = statePath
    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
  })

  it('persists only bounded lifecycle metadata and no user text', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    const serialized = await readFile(
      path.join(directory, 'manager-proactive-inbox.json'),
      'utf8',
    )

    expect(serialized).not.toContain('prompt')
    expect(serialized).not.toContain('title')
    expect(serialized).toContain('session-a')
    expect(serialized).toContain('running')
  })

  it.each([
    ['malformed JSON', '{"secret":"do-not-repeat"'],
    [
      'unknown top-level state',
      JSON.stringify({
        version: 1,
        hubId: 'hub-a',
        bindings: [],
        retiredBindings: [],
        cursors: [],
        events: [],
        nextEventSequence: 1,
        secret: 'do-not-repeat',
      }),
    ],
    [
      'foreign hub',
      JSON.stringify({
        version: 1,
        hubId: 'hub-b',
        bindings: [],
        retiredBindings: [],
        cursors: [],
        events: [],
        nextEventSequence: 1,
      }),
    ],
  ])('refuses %s state without replacing it', async (_label, serialized) => {
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    await writeFile(statePath, serialized, { mode: 0o600 })

    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(inbox.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath, 'utf8')).toBe(serialized)
    expect((await readdir(directory)).sort()).toEqual([
      'manager-proactive-inbox.json',
    ])
    await expect(inbox.initialize()).rejects.toMatchObject({ statusCode: 503 })
  })

  it('refuses an oversized state before reading or replacing it', async () => {
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const serialized = 'x'.repeat(101)
    await writeFile(statePath, serialized, { mode: 0o600 })
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
      maxStateBytes: 100,
    })

    await expect(inbox.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect((await stat(statePath)).size).toBe(101)
    expect(await readFile(statePath, 'utf8')).toBe(serialized)
  })

  it('cleans abandoned owned staging files without touching unrelated entries', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const abandonedPending = `${statePath}.orphan.pending`
    const abandonedRollback = `${statePath}.orphan.rollback.pending`
    const unrelated = `${statePath}.orphan.tmp`
    await writeFile(abandonedPending, 'pending', { mode: 0o600 })
    await writeFile(abandonedRollback, 'rollback', { mode: 0o600 })
    await writeFile(unrelated, 'unrelated', { mode: 0o600 })

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await reopened.initialize()

    await expect(stat(abandonedPending)).rejects.toMatchObject({
      code: 'ENOENT',
    })
    await expect(stat(abandonedRollback)).rejects.toMatchObject({
      code: 'ENOENT',
    })
    expect(await readFile(unrelated, 'utf8')).toBe('unrelated')
    expect(await readFile(statePath, 'utf8')).toContain('"hubId":"hub-a"')
  })

  it('refuses unsafe abandoned staging entries without deleting their targets', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const symlinkTarget = path.join(directory, 'staging-target')
    const symlinkPath = `${statePath}.unsafe.pending`
    await writeFile(symlinkTarget, 'target', { mode: 0o600 })
    await symlink(symlinkTarget, symlinkPath)

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(symlinkTarget, 'utf8')).toBe('target')
    expect((await lstat(symlinkPath)).isSymbolicLink()).toBe(true)
  })

  it('requires a durable cleanup barrier even when a retry finds no staging files', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const serialized = await readFile(statePath, 'utf8')
    const abandonedPending = `${statePath}.orphan.pending`
    await writeFile(abandonedPending, 'pending', { mode: 0o600 })
    fsHooks.syncFailurePath = directory
    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    await expect(stat(abandonedPending)).rejects.toMatchObject({
      code: 'ENOENT',
    })
    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })

    fsHooks.syncFailurePath = undefined
    await reopened.initialize()
    expect(reopened.pending()).toEqual([])
    expect(await readFile(statePath, 'utf8')).toBe(serialized)
  })

  it('surfaces abandoned staging cleanup failures and retries them safely', async () => {
    await openInbox()
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    const abandonedPending = `${statePath}.blocked.pending`
    await writeFile(abandonedPending, 'pending', { mode: 0o600 })
    await chmod(directory, 0o500)

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(abandonedPending, 'utf8')).toBe('pending')

    await chmod(directory, 0o700)
    await reopened.initialize()
    await expect(stat(abandonedPending)).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('refuses symlinked state and directory paths', async () => {
    const target = path.join(directory, 'state-target')
    const statePath = path.join(directory, 'manager-proactive-inbox.json')
    await writeFile(target, '{"not":"state"}', { mode: 0o600 })
    await symlink(target, statePath)
    const inbox = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(inbox.initialize()).rejects.toMatchObject({ statusCode: 503 })
    expect(await readFile(target, 'utf8')).toBe('{"not":"state"}')

    const linkedDirectory = path.join(directory, 'linked-directory')
    const linkedTarget = path.join(directory, 'directory-target')
    await mkdirForTest(linkedTarget)
    await symlink(linkedTarget, linkedDirectory)
    const linkedInbox = new ManagerProactiveInbox(linkedDirectory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(linkedInbox.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
  })

  it('refuses malformed observations and invalid acknowledgment input', async () => {
    const inbox = await openInbox()

    let unknownFieldError: unknown
    try {
      inbox.observe({
        ...observation(),
        extra: 'not allowed',
      })
    } catch (error) {
      unknownFieldError = error
    }
    expect(unknownFieldError).toBeInstanceOf(
      ManagerProactiveInboxValidationError,
    )
    expect(unknownFieldError).toMatchObject({
      statusCode: 400,
      code: 'INVALID_INPUT',
      message: 'The proactive inbox observation is invalid.',
    })

    expect(() => inbox.observe(observation({
      computerId: '../outside',
    }))).toThrow()
    expect(() => inbox.observe(observation({
      queuedCount: Number.MAX_SAFE_INTEGER + 1,
    }))).toThrow()
    expect(() => inbox.acknowledge([], 'handled')).toThrow()
    expect(() => inbox.acknowledge(['not-an-event'], 'handled')).toThrow()
  })

  it('refuses scope capacity without consuming the retry', async () => {
    const inbox = await openInbox({ maxCursorsAndBindings: 3 })
    await inbox.observe(observation())
    await inbox.observe(observation({
      sessionId: 'session-b',
    }))

    await expect(inbox.observe(observation({
      sessionId: 'session-c',
    }))).rejects.toMatchObject({ statusCode: 507 })
    await expect(inbox.bindComputer('computer-a', 'pairing-b')).resolves.toMatchObject({
      changed: true,
    })
    await expect(inbox.observe(observation({
      computerGeneration: 'pairing-b',
      sessionId: 'session-c',
    }))).resolves.toMatchObject({ outcome: 'baseline' })
  })

  it('refuses a rebind when its retired-generation fence would exceed scope capacity', async () => {
    const inbox = await openInbox({ maxCursorsAndBindings: 1 })

    await expect(inbox.bindComputer('computer-a', 'pairing-b'))
      .rejects.toMatchObject({
        statusCode: 507,
        code: 'CAPACITY',
      })
    await expect(inbox.bindComputer('computer-a', 'pairing-b'))
      .rejects.toMatchObject({
        statusCode: 507,
        code: 'CAPACITY',
      })
  })

  it.each([
    [
      'an active cursor contradicting a current event',
      (state: TestState) => {
        state.cursors[0]!.active = true
      },
    ],
    [
      'a current event without its cursor',
      (state: TestState) => {
        state.cursors = []
      },
    ],
    [
      'a current event newer than its cursor revision',
      (state: TestState) => {
        state.cursors[0]!.revision = 1
      },
    ],
    [
      'a current event newer than its cursor task generation',
      (state: TestState) => {
        state.cursors[0]!.taskGeneration = 0
      },
    ],
  ])('refuses shape-valid cross-record corruption: %s', async (_label, mutate) => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))

    const state = await readState(directory)
    mutate(state)
    const serialized = await writeState(directory, state)

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath(directory), 'utf8')).toBe(serialized)
  })

  it('refuses a pending event from a retired generation without replacing state', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.bindComputer('computer-a', 'pairing-b')

    const state = await readState(directory)
    const event = state.events[0]!
    event.lifecycle = 'pending'
    delete event.disposition
    delete event.acknowledgedAt
    const serialized = await writeState(directory, state)

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath(directory), 'utf8')).toBe(serialized)
  })

  it('refuses two outcome kinds for one task generation without replacing state', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))

    const state = await readState(directory)
    const finished = state.events[0]!
    state.events.push({
      ...finished,
      id: '4168a7f64bc98a3f0e5a58580c574dfc2cd86db88528ebda27c8c70d318ba402',
      kind: 'failed',
      sequence: 2,
    })
    state.nextEventSequence = 3
    const serialized = await writeState(directory, state)

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath(directory), 'utf8')).toBe(serialized)
  })

  it.each([
    [
      'task generations sharing an owner revision',
      (state: TestState) => {
        state.events[1]!.revision = state.events[0]!.revision
      },
    ],
    [
      'task generations reversing owner revisions',
      (state: TestState) => {
        const firstRevision = state.events[0]!.revision
        state.events[0]!.revision = state.events[1]!.revision
        state.events[1]!.revision = firstRevision
      },
    ],
    [
      'an inactive cursor reporting running',
      (state: TestState) => {
        state.cursors[0]!.active = false
        state.cursors[0]!.lastStatus = 'running'
      },
    ],
  ])('refuses shape-valid lifecycle corruption: %s', async (_label, mutate) => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({ revision: 3, status: 'running' }))
    await inbox.observe(observation({ revision: 4, status: 'idle' }))

    const state = await readState(directory)
    mutate(state)
    const serialized = await writeState(directory, state)
    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath(directory), 'utf8')).toBe(serialized)
  })

  it('refuses impossible owner revision order in retained retired history', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({ revision: 3, status: 'running' }))
    await inbox.observe(observation({ revision: 4, status: 'idle' }))
    await inbox.bindComputer('computer-a', 'pairing-b')

    const state = await readState(directory)
    const firstRevision = state.events[0]!.revision
    state.events[0]!.revision = state.events[1]!.revision
    state.events[1]!.revision = firstRevision
    const serialized = await writeState(directory, state)
    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath(directory), 'utf8')).toBe(serialized)
  })

  it.each([
    ['active', true, 'running'],
    ['inactive', false, 'idle'],
  ] as const)('refuses an older outcome sharing the %s cursor revision', async (_label, active, lastStatus) => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({ revision: 3, status: 'running' }))

    const state = await readState(directory)
    state.cursors[0]!.revision = 2
    state.cursors[0]!.active = active
    state.cursors[0]!.lastStatus = lastStatus
    const serialized = await writeState(directory, state)
    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath(directory), 'utf8')).toBe(serialized)
  })

  it('refuses an active idle cursor without a lifecycle guard', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())

    const state = await readState(directory)
    state.cursors[0]!.lastStatus = 'idle'
    const serialized = await writeState(directory, state)
    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })

    await expect(reopened.initialize()).rejects.toMatchObject({
      statusCode: 503,
    })
    expect(await readFile(statePath(directory), 'utf8')).toBe(serialized)
  })

  it('accepts a durable blocked history on reopen', async () => {
    const inbox = await openInbox()
    await inbox.observe(observation())
    await inbox.observe(observation({
      revision: 2,
      status: 'waiting',
    }))
    await inbox.observe(observation({
      revision: 3,
      status: 'idle',
      queuedCount: 1,
      hasPendingRequest: true,
    }))

    const reopened = new ManagerProactiveInbox(directory, {
      enabled: true,
      hubId: 'hub-a',
      now,
    })
    await reopened.initialize()
    expect(reopened.pending()).toMatchObject([
      { kind: 'blocked', taskGeneration: 1, revision: 2 },
    ])
  })

  it('enforces a lower retained-event bound without evicting evidence', async () => {
    const inbox = await openInbox({ maxEventRecords: 1 })
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.observe(observation({ revision: 3, status: 'running' }))
    await expect(inbox.observe(observation({
      revision: 4,
      status: 'idle',
    }))).rejects.toMatchObject({ statusCode: 507 })
    expect(inbox.pending()).toMatchObject([
      { taskGeneration: 1, kind: 'finished' },
    ])
  })

  it('admits at the retained-event bound once acknowledged evidence expires', async () => {
    const inbox = await openInbox({
      maxEventRecords: 1,
      terminalEventRetentionMs: 1_000,
    })
    await inbox.observe(observation())
    await inbox.observe(observation({ revision: 2, status: 'idle' }))
    await inbox.acknowledge([inbox.pending()[0]!.id], 'handled')
    await inbox.observe(observation({ revision: 3, status: 'running' }))
    await expect(inbox.observe(observation({
      revision: 4,
      status: 'idle',
    }))).rejects.toMatchObject({ statusCode: 507 })

    clock += 1_001
    await expect(inbox.observe(observation({
      revision: 4,
      status: 'idle',
    }))).resolves.toMatchObject({ outcome: 'admitted' })
    expect(inbox.pending()).toMatchObject([
      { taskGeneration: 2, kind: 'finished', revision: 4 },
    ])
  })
})

type TestState = {
  version: number
  hubId: string
  bindings: Array<Record<string, unknown>>
  retiredBindings: Array<Record<string, unknown>>
  cursors: Array<Record<string, unknown>>
  events: Array<Record<string, unknown>>
  nextEventSequence: number
}

function statePath(directory: string): string {
  return path.join(directory, 'manager-proactive-inbox.json')
}

function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
} {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((finish) => {
    resolve = finish
  })
  return { promise, resolve }
}

async function readState(directory: string): Promise<TestState> {
  return JSON.parse(await readFile(statePath(directory), 'utf8')) as TestState
}

async function writeState(
  directory: string,
  state: TestState,
): Promise<string> {
  const serialized = JSON.stringify(state)
  await writeFile(statePath(directory), serialized, { mode: 0o600 })
  return serialized
}

async function mkdirForTest(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: 0o700 })
}
