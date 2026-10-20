import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type {
  ManagerProactiveInboxObservation,
  ManagerProactiveInboxOptions,
} from './manager-proactive-inbox.js'
import {
  ManagerProactiveInbox,
} from './manager-proactive-inbox.js'

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
      suspended: false,
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

  it('keeps a task active while queue and lifecycle guards remain', async () => {
    const inbox = await openInbox()

    await inbox.observe(observation())
    await inbox.observe(observation({
      revision: 2,
      status: 'waiting',
    }))
    expect(inbox.pending()).toEqual([])
    await inbox.observe(observation({
      revision: 3,
      status: 'idle',
      queuedCount: 1,
    }))
    await inbox.observe(observation({
      revision: 4,
      status: 'idle',
      queuedCount: 0,
      isOpen: false,
    }))
    await inbox.observe(observation({
      revision: 5,
      status: 'idle',
      suspended: true,
    }))
    await inbox.observe(observation({
      revision: 6,
      status: 'idle',
      recovering: true,
    }))
    expect(inbox.pending()).toEqual([])

    await inbox.observe(observation({ revision: 7, status: 'idle' }))

    expect(inbox.pending()).toMatchObject([
      { kind: 'finished', taskGeneration: 1, revision: 7 },
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

    await expect(inbox.observe(observation({
      origin: 'user',
    }))).resolves.toMatchObject({
      outcome: 'ignored',
      reason: 'ineligible-origin',
    })
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

    expect(() => inbox.observe({
      ...observation(),
      extra: 'not allowed',
    })).toThrow()
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
    const inbox = await openInbox({ maxCursorsAndBindings: 2 })
    await inbox.observe(observation())

    await expect(inbox.observe(observation({
      sessionId: 'session-b',
    }))).rejects.toMatchObject({ statusCode: 507 })
    await expect(inbox.bindComputer('computer-a', 'pairing-b')).resolves.toMatchObject({
      changed: true,
    })
    await expect(inbox.observe(observation({
      computerGeneration: 'pairing-b',
      sessionId: 'session-b',
    }))).resolves.toMatchObject({ outcome: 'baseline' })
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
})

async function mkdirForTest(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: 0o700 })
}
