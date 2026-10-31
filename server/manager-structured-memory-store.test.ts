import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  truncate,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES,
  MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES,
} from '../shared/manager-structured-memory.js'
import { ManagerStructuredMemoryRuntime } from './manager-structured-memory-runtime.js'
import { ManagerStructuredMemoryStore } from './manager-structured-memory-store.js'

describe('ManagerStructuredMemoryStore', () => {
  let root: string
  let clock: number
  const now = () => new Date(clock)

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-structured-memory-'))
    clock = Date.parse('2026-10-16T12:00:00.000Z')
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function open() {
    const store = new ManagerStructuredMemoryStore(path.join(root, 'manager'), {
      now,
    })
    await store.initialize()
    return store
  }

  function rememberInput(
    requestId: string,
    content = 'Keep pull request comments concise.',
  ) {
    return {
      requestId,
      kind: 'preference' as const,
      canonicalKey: 'pull request style',
      content,
      scope: { type: 'user' as const },
      confidence: 0.95,
    }
  }

  it('persists an explicit preference across restart with private file permissions', async () => {
    const store = await open()
    expect(store.snapshot()).toEqual({
      version: 1,
      revision: 0,
      records: [],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    })

    const result = await store.remember({
      requestId: 'remember-1',
      kind: 'preference',
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' },
      confidence: 0.95,
      sourceManagerMessageId: 'manager-message-1',
    })

    expect(result).toMatchObject({
      revision: 1,
      idempotent: false,
      record: {
        kind: 'preference',
        canonicalKey: 'pull request style',
        content: 'Keep pull request comments concise.',
        scope: { type: 'user' },
        authority: 'direct-user',
        confidence: 0.95,
        createdAt: '2026-10-16T12:00:00.000Z',
        updatedAt: '2026-10-16T12:00:00.000Z',
        provenance: {
          origin: 'direct-user',
          requestId: 'remember-1',
          sourceManagerMessageId: 'manager-message-1',
        },
      },
    })

    const reopened = await open()
    expect(reopened.snapshot().records).toEqual([result.record])
    expect(reopened.snapshot().revision).toBe(1)
    expect(JSON.parse(await readFile(
      path.join(root, 'manager', 'structured-memory.json'),
      'utf8',
    ))).toEqual(reopened.snapshot())
    expect((await stat(
      path.join(root, 'manager', 'structured-memory.json'),
    )).mode & 0o777).toBe(0o600)
  })

  it('projects Dreamer metadata without reading content or canonical keys', async () => {
    const store = await open()
    const result = await store.remember(rememberInput(
      'remember-sensitive',
      'SENTINEL MEMORY CONTENT',
    ))
    const internal = store as unknown as {
      state: {
        records: Array<Record<string, unknown>>
      }
    }
    const record = internal.state.records[0]
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
    const fullSnapshot = vi.spyOn(store, 'snapshot').mockImplementation(() => {
      throw new Error('full snapshot was read')
    })

    const metadata = (store as unknown as {
      metadataSnapshot: () => {
        records: Array<Record<string, unknown>>
        tombstones: Array<{ recordId: string }>
      }
    }).metadataSnapshot()

    expect(fullSnapshot).not.toHaveBeenCalled()
    expect(metadata).toEqual({
      records: [{
        id: result.record?.id,
        kind: 'preference',
        scope: { type: 'user' },
        authority: 'direct-user',
        confidence: 0.95,
        createdAt: '2026-10-16T12:00:00.000Z',
        updatedAt: '2026-10-16T12:00:00.000Z',
      }],
      tombstones: [],
    })
    expect(JSON.stringify(metadata)).not.toContain('SENTINEL')
  })

  it('rejects direct-user global writes before creating state', async () => {
    const store = await open()
    expect(() => store.remember({
      requestId: 'remember-global',
      kind: 'procedure',
      canonicalKey: 'review policy',
      content: 'Require a current review before merge.',
      scope: { type: 'global' },
      confidence: 1,
      sourceManagerMessageId: 'manager-message-1',
    })).toThrow(expect.objectContaining({
      statusCode: 403,
      message: expect.stringContaining('policy-authorized'),
    }))
    expect(store.snapshot()).toMatchObject({
      revision: 0,
      records: [],
      audit: [],
      appliedRequests: [],
    })
    await expect(stat(
      path.join(root, 'manager', 'structured-memory.json'),
    )).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('returns the original result for retries and reuses an exact duplicate', async () => {
    const store = await open()
    const first = await store.remember(rememberInput('remember-1'))
    const retry = await store.remember(rememberInput('remember-1'))
    const duplicate = await store.remember(rememberInput('remember-2'))

    expect(retry).toEqual({ ...first, idempotent: true })
    expect(duplicate).toMatchObject({
      record: { id: first.record?.id },
      revision: 2,
      idempotent: true,
    })
    expect(store.snapshot().records).toHaveLength(1)
    expect(store.snapshot().appliedRequests.map(({ requestId }) => requestId))
      .toEqual(['remember-1', 'remember-2'])

    const reopened = await open()
    expect(await reopened.remember(rememberInput('remember-2'))).toEqual(duplicate)
    expect(reopened.snapshot().records).toHaveLength(1)
  })

  it('corrects by superseding instead of mutating history', async () => {
    const store = await open()
    const first = await store.remember(rememberInput('remember-1'))
    clock += 60_000
    const corrected = await store.correct({
      ...rememberInput('correct-1', 'Use a single concise pull request comment.'),
      recordId: first.record!.id,
    })

    expect(corrected).toMatchObject({
      revision: 2,
      idempotent: false,
      record: {
        authority: 'direct-user-correction',
        supersedesId: first.record!.id,
        content: 'Use a single concise pull request comment.',
        createdAt: '2026-10-16T12:01:00.000Z',
      },
    })
    expect(store.snapshot().records).toEqual([
      expect.objectContaining({
        id: first.record!.id,
        supersededById: corrected.record!.id,
        content: 'Keep pull request comments concise.',
      }),
      corrected.record,
    ])

    const reopened = await open()
    expect(reopened.snapshot().records).toEqual(store.snapshot().records)
    expect(await reopened.correct({
      ...rememberInput('correct-1', 'Use a single concise pull request comment.'),
      recordId: first.record!.id,
    })).toEqual({ ...corrected, idempotent: true })
  })

  it('forgets with a content-free tombstone and blocks resurrection', async () => {
    const store = await open()
    const remembered = await store.remember(rememberInput('remember-1'))
    clock += 60_000
    const forgotten = await store.forget({
      requestId: 'forget-1',
      recordId: remembered.record!.id,
      sourceManagerMessageId: 'manager-message-2',
    })

    expect(forgotten).toMatchObject({
      revision: 2,
      idempotent: false,
      tombstone: {
        recordId: remembered.record!.id,
        canonicalKey: 'pull request style',
        scope: { type: 'user' },
        requestId: 'forget-1',
        deletedAt: '2026-10-16T12:01:00.000Z',
      },
    })
    expect(forgotten.tombstone).not.toHaveProperty('content')
    expect(JSON.stringify(forgotten.tombstone)).not.toContain(
      'Keep pull request comments concise.',
    )
    expect(await store.forget({
      requestId: 'forget-1',
      recordId: remembered.record!.id,
      sourceManagerMessageId: 'manager-message-2',
    })).toEqual({ ...forgotten, idempotent: true })
    await expect(store.remember(rememberInput('remember-2'))).rejects
      .toMatchObject({ statusCode: 409 })

    const reopened = await open()
    expect(reopened.snapshot().tombstones).toEqual([forgotten.tombstone])
    await expect(reopened.remember(rememberInput('remember-3'))).rejects
      .toMatchObject({ statusCode: 409 })
  })

  it('serializes concurrent writers without losing committed revisions', async () => {
    const store = await open()
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        store.remember({
          ...rememberInput(`remember-${index}`, `Preference ${index}.`),
          canonicalKey: `preference ${index}`,
        })),
    )

    expect(results.map(({ revision }) => revision).sort((a, b) => a - b))
      .toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(store.snapshot().revision).toBe(20)
    expect(new Set(store.snapshot().records.map(({ id }) => id)).size).toBe(20)
    expect((await open()).snapshot()).toEqual(store.snapshot())
  })

  it('restores a missing primary from the last validated backup', async () => {
    const store = await open()
    await store.remember(rememberInput('remember-1'))
    await store.remember({
      ...rememberInput('remember-2', 'Prefer squash merges.'),
      canonicalKey: 'merge strategy',
    })
    const directory = path.join(root, 'manager')
    const backup = JSON.parse(await readFile(
      path.join(directory, 'structured-memory.backup.json'),
      'utf8',
    ))
    expect(backup.revision).toBe(1)

    await rm(path.join(directory, 'structured-memory.json'))
    const recovered = await open()

    expect(recovered.snapshot()).toEqual(backup)
    expect(JSON.parse(await readFile(
      path.join(directory, 'structured-memory.json'),
      'utf8',
    ))).toEqual(backup)
  })

  it.each([
    ['corrupt JSON', '{not json'],
    ['unsupported version', JSON.stringify({
      version: 2,
      revision: 0,
      records: [],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    })],
  ])('preserves a %s primary and refuses to start empty', async (_label, contents) => {
    const directory = path.join(root, 'manager')
    await mkdir(directory)
    await writeFile(path.join(directory, 'structured-memory.json'), contents)
    const store = new ManagerStructuredMemoryStore(directory, { now })

    await expect(store.initialize()).rejects.toMatchObject({ statusCode: 503 })
    expect(await readFile(
      path.join(directory, 'structured-memory.json'),
      'utf8',
    )).toBe(contents)
    expect(() => store.snapshot()).toThrow(/not initialized/i)
  })

  it('rejects a symbolic-link primary without reading or changing its target', async () => {
    const directory = path.join(root, 'manager')
    await mkdir(directory)
    const outside = path.join(root, 'outside.json')
    const contents = JSON.stringify({
      version: 1,
      revision: 0,
      records: [],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    })
    await writeFile(outside, contents)
    await symlink(outside, path.join(directory, 'structured-memory.json'))
    const store = new ManagerStructuredMemoryStore(directory, { now })

    await expect(store.initialize()).rejects.toMatchObject({ statusCode: 503 })
    expect(await readFile(outside, 'utf8')).toBe(contents)
  })

  it('refuses a symbolic-link structured-memory directory', async () => {
    const target = path.join(root, 'outside-manager')
    const linked = path.join(root, 'linked-manager')
    await mkdir(target)
    await symlink(target, linked)
    const store = new ManagerStructuredMemoryStore(linked, { now })

    await expect(store.initialize()).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining('directory'),
    })
    expect(await readdir(target)).toEqual([])
  })

  it('keeps the committed snapshot visible when persistence is refused', async () => {
    const store = await open()
    await store.remember(rememberInput('remember-1'))
    const before = store.snapshot()
    const directory = path.join(root, 'manager')
    await chmod(directory, 0o500)
    try {
      await expect(store.remember({
        ...rememberInput('remember-2', 'Prefer squash merges.'),
        canonicalKey: 'merge strategy',
      })).rejects.toMatchObject({ statusCode: 503 })
      expect(store.snapshot()).toEqual(before)
    } finally {
      await chmod(directory, 0o700)
    }

    expect((await open()).snapshot()).toEqual(before)
    expect((await readdir(directory)).filter((name) => name.endsWith('.pending')))
      .toEqual([])
  })

  it('refuses to reuse an idempotency key for another operation', async () => {
    const store = await open()
    const remembered = await store.remember(rememberInput('shared-request'))
    await expect(store.forget({
      requestId: 'shared-request',
      recordId: remembered.record!.id,
    })).rejects.toMatchObject({ statusCode: 409 })
    expect(store.snapshot().tombstones).toEqual([])
  })

  it('exports deterministically and imports atomically into an empty store', async () => {
    const source = await open()
    const remembered = await source.remember(rememberInput('remember-1'))
    await source.forget({
      requestId: 'forget-1',
      recordId: remembered.record!.id,
    })
    const exported = source.exportState()
    expect(JSON.parse(exported)).toEqual(source.snapshot())
    expect((await open()).exportState()).toBe(exported)

    const targetRoot = await mkdtemp(path.join(tmpdir(), 'manager-memory-import-'))
    try {
      const target = new ManagerStructuredMemoryStore(
        path.join(targetRoot, 'manager'),
        { now },
      )
      await target.initialize()
      const imported = await target.importState('import-1', exported)
      expect(imported).toEqual({
        revision: 3,
        idempotent: false,
      })
      expect(target.snapshot().records).toEqual(source.snapshot().records)
      expect(target.snapshot().tombstones).toEqual(source.snapshot().tombstones)
      expect(await target.importState('import-1', exported)).toEqual({
        revision: 3,
        idempotent: true,
      })

      const reopened = new ManagerStructuredMemoryStore(
        path.join(targetRoot, 'manager'),
        { now },
      )
      await reopened.initialize()
      expect(reopened.snapshot()).toEqual(target.snapshot())
      await expect(reopened.importState('import-2', exported)).rejects
        .toMatchObject({ statusCode: 409 })
    } finally {
      await rm(targetRoot, { recursive: true, force: true })
    }
  })

  it('reports hard capacity explicitly instead of silently pruning metadata', async () => {
    const store = await open()
    const fullAudit = Array.from(
      { length: MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES },
      (_, index) => ({
        id: `aaaaaaaa-aaaa-4aaa-8aaa-${index.toString(16).padStart(12, '0')}`,
        operation: 'remember' as const,
        requestId: `request-${index}`,
        occurredAt: '2026-10-16T12:00:00.000Z',
        outcome: 'applied' as const,
      }),
    )
    await expect(store.importState(
      'import-full-audit',
      JSON.stringify({
        version: 1,
        revision: 0,
        records: [],
        tombstones: [],
        audit: fullAudit,
        appliedRequests: [],
      }),
    )).rejects.toMatchObject({
      statusCode: 507,
      message: expect.stringContaining('hard capacity limit'),
    })
    expect(store.snapshot()).toMatchObject({
      revision: 0,
      audit: [],
      appliedRequests: [],
    })
  })

  it('ignores abandoned pending files while keeping a valid primary authoritative', async () => {
    const store = await open()
    await store.remember(rememberInput('remember-1'))
    const expected = store.snapshot()
    const directory = path.join(root, 'manager')
    await writeFile(
      path.join(directory, 'structured-memory.json.abandoned.pending'),
      '{"partial":',
      { mode: 0o600 },
    )

    expect((await open()).snapshot()).toEqual(expected)
    expect(await readFile(
      path.join(directory, 'structured-memory.json.abandoned.pending'),
      'utf8',
    )).toBe('{"partial":')
  })

  it('restores the prior state when publication fails after the primary rename', async () => {
    const directory = path.join(root, 'manager')
    let syncCalls = 0
    const store = new ManagerStructuredMemoryStore(directory, {
      now,
      syncDirectory: async () => {
        syncCalls += 1
        if (syncCalls === 3) {
          throw Object.assign(new Error('Injected directory sync refusal'), {
            code: 'EIO',
          })
        }
      },
    })
    await store.initialize()
    await store.remember(rememberInput('remember-1'))
    const before = store.snapshot()

    await expect(store.remember({
      ...rememberInput('remember-2', 'Prefer squash merges.'),
      canonicalKey: 'merge strategy',
    })).rejects.toMatchObject({ statusCode: 503 })
    expect(store.snapshot()).toEqual(before)

    const reopened = new ManagerStructuredMemoryStore(directory, { now })
    await reopened.initialize()
    expect(reopened.snapshot()).toEqual(before)
  })

  it('retrieves only the active correction across restart and then forgets it', async () => {
    const store = await open()
    const remembered = await store.remember(rememberInput('remember-1'))
    const corrected = await store.correct({
      ...rememberInput('correct-1', 'Use a single concise pull request comment.'),
      recordId: remembered.record!.id,
    })

    const reopened = await open()
    expect(reopened.search({
      query: 'pull request style',
      scopes: [{ type: 'user' }],
      at: '2026-10-16T12:00:00.000Z',
    }).records.map(({ id }) => id)).toEqual([corrected.record!.id])

    await reopened.forget({
      requestId: 'forget-1',
      recordId: corrected.record!.id,
    })
    expect(reopened.search({
      query: 'pull request style',
      scopes: [{ type: 'user' }],
      at: '2026-10-16T12:00:00.000Z',
    }).records).toEqual([])
  })

  async function openWithPolicyGlobal() {
    return openWithPolicyRecord({ type: 'global' })
  }

  async function openWithPolicyRecord(
    scope: Record<string, string>,
  ) {
    const store = await open()
    await store.importState('import-policy', JSON.stringify({
      version: 1,
      revision: 1,
      records: [{
        schemaVersion: 1,
        id: '11111111-1111-4111-8111-111111111111',
        kind: 'procedure',
        canonicalKey: 'review policy',
        content: 'Require a current review before merge.',
        scope,
        provenance: {
          origin: 'policy',
          requestId: 'policy-1',
          sourceDigest: 'a'.repeat(64),
        },
        authority: 'policy-authorized',
        confidence: 1,
        createdAt: '2026-10-16T12:00:00.000Z',
        updatedAt: '2026-10-16T12:00:00.000Z',
      }],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    }))
    return store
  }

  it('refuses a direct-user correction that supersedes a global policy record', async () => {
    const store = await openWithPolicyGlobal()
    const before = store.snapshot()
    await expect(store.correct({
      requestId: 'correct-global',
      recordId: '11111111-1111-4111-8111-111111111111',
      kind: 'procedure',
      canonicalKey: 'review policy',
      content: 'Merge without review.',
      scope: { type: 'user' },
    })).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('policy-authorized'),
    })
    expect(store.snapshot()).toEqual(before)
  })

  it('refuses a direct-user forget of a global policy record', async () => {
    const store = await openWithPolicyGlobal()
    const before = store.snapshot()
    await expect(store.forget({
      requestId: 'forget-global',
      recordId: '11111111-1111-4111-8111-111111111111',
    })).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('policy-authorized'),
    })
    expect(store.snapshot()).toEqual(before)
  })

  it.each([
    ['user', { type: 'user' }],
    ['project', {
      type: 'project',
      computerId: 'development',
      projectRoot: '/srv/app',
    }],
  ])('refuses direct-user correct and forget of a policy record in %s scope', async (_label, scope) => {
    const store = await openWithPolicyRecord(scope)
    const before = store.snapshot()
    await expect((async () => store.correct({
      requestId: 'correct-policy',
      recordId: '11111111-1111-4111-8111-111111111111',
      kind: 'procedure',
      canonicalKey: 'review policy',
      content: 'Merge without review.',
      scope: scope as { type: 'user' },
    }))()).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('policy-authorized'),
    })
    await expect((async () => store.forget({
      requestId: 'forget-policy',
      recordId: '11111111-1111-4111-8111-111111111111',
    }))()).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('policy-authorized'),
    })
    expect(store.snapshot()).toEqual(before)
  })

  it('remembers, finds, and round-trips a long mixed-case project root', async () => {
    const scope = {
      type: 'project' as const,
      computerId: 'development',
      projectRoot: '/Users/lcavalcanti/Projects/agentic-remote-worktrees',
    }
    const store = await open()
    await store.remember({ ...rememberInput('remember-root'), scope })

    expect(store.search({
      query: 'pull request style',
      scopes: [scope],
    }).records).toEqual([expect.objectContaining({ scope })])

    const exported = store.exportState()
    await rm(path.join(root, 'manager'), { recursive: true, force: true })
    const restored = await open()
    await restored.importState('import-root', exported)
    expect(restored.snapshot().records).toEqual([
      expect.objectContaining({ scope }),
    ])
  })

  it('tightens a group-readable primary to owner-only before loading it', async () => {
    const store = await open()
    await store.remember(rememberInput('remember-1'))
    const primary = path.join(root, 'manager', 'structured-memory.json')
    await chmod(primary, 0o644)

    const reopened = await open()

    expect(reopened.snapshot().records).toHaveLength(1)
    expect((await stat(primary)).mode & 0o777).toBe(0o600)
  })

  it('tightens a world-readable backup before restoring from it', async () => {
    const store = await open()
    await store.remember(rememberInput('remember-1'))
    await store.remember({
      ...rememberInput('remember-2', 'Prefer squash merges.'),
      canonicalKey: 'merge strategy',
    })
    const directory = path.join(root, 'manager')
    const backup = path.join(directory, 'structured-memory.backup.json')
    await chmod(backup, 0o644)
    await rm(path.join(directory, 'structured-memory.json'))

    const recovered = await open()

    expect(recovered.snapshot().revision).toBe(1)
    expect((await stat(backup)).mode & 0o777).toBe(0o600)
    expect((await stat(path.join(directory, 'structured-memory.json'))).mode & 0o777)
      .toBe(0o600)
  })

  it.each([
    ['primary', 'structured-memory.json'],
    ['backup', 'structured-memory.backup.json'],
  ])('refuses an oversized %s before reading it', async (label, name) => {
    const directory = path.join(root, 'manager')
    await mkdir(directory, { mode: 0o700 })
    const file = path.join(directory, name)
    await writeFile(file, '', { mode: 0o600 })
    await truncate(file, MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES + 1)
    const store = new ManagerStructuredMemoryStore(directory, { now })

    await expect(store.initialize()).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining(`${label} state exceeds the supported size`),
    })
    expect((await stat(file)).size).toBe(MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES + 1)
    expect((await readdir(directory)).sort()).toEqual([name])
  })

  it('becomes unavailable when publication and rollback both fail', async () => {
    const directory = path.join(root, 'manager')
    let syncCalls = 0
    let failSync = true
    const store = new ManagerStructuredMemoryStore(directory, {
      now,
      syncDirectory: async () => {
        syncCalls += 1
        if (failSync && syncCalls >= 3) {
          throw Object.assign(new Error('Injected directory sync refusal'), {
            code: 'EIO',
          })
        }
      },
    })
    await store.initialize()
    await store.remember(rememberInput('remember-1'))
    const runtime = new ManagerStructuredMemoryRuntime('on', store)

    await expect(store.remember({
      ...rememberInput('remember-2', 'Prefer squash merges.'),
      canonicalKey: 'merge strategy',
    })).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining('roll back'),
    })

    failSync = false
    const onDisk = await readFile(
      path.join(directory, 'structured-memory.json'),
      'utf8',
    )
    await expect(async () => store.remember({
      ...rememberInput('remember-3', 'Prefer rebase merges.'),
      canonicalKey: 'rebase strategy',
    })).rejects.toMatchObject({ statusCode: 503 })
    await expect(async () => store.importState('import-1', JSON.stringify({
      version: 1,
      revision: 0,
      records: [],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    }))).rejects.toMatchObject({ statusCode: 503 })
    await expect(async () => store.forget({
      requestId: 'forget-1',
      recordId: '11111111-1111-4111-8111-111111111111',
    })).rejects.toMatchObject({ statusCode: 503 })
    expect(() => store.snapshot()).toThrow(expect.objectContaining({ statusCode: 503 }))
    expect(() => store.search({ query: 'merge', scopes: [{ type: 'user' }] }))
      .toThrow(expect.objectContaining({ statusCode: 503 }))
    expect(() => store.exportState()).toThrow(expect.objectContaining({ statusCode: 503 }))
    expect(await readFile(
      path.join(directory, 'structured-memory.json'),
      'utf8',
    )).toBe(onDisk)
    expect(runtime.status()).toMatchObject({
      mode: 'on',
      availability: 'unavailable',
      lastError: expect.stringContaining('roll back'),
    })
    expect(JSON.stringify(runtime.status())).not.toContain('squash')
  })
})
