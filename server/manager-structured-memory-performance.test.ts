import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES,
  type ManagerStructuredMemoryState,
} from '../shared/manager-structured-memory.js'
import {
  formatStructuredMemoryContext,
} from './manager-structured-memory-search.js'
import { ManagerStructuredMemoryStore } from './manager-structured-memory-store.js'

const now = () => new Date('2026-10-16T13:00:00.000Z')

function percentile(values: number[], quantile: number): number {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.ceil(sorted.length * quantile) - 1] ?? 0
}

function benchmarkState(size: number): ManagerStructuredMemoryState {
  return {
    version: 1,
    revision: size,
    records: Array.from({ length: size }, (_, index) => ({
      schemaVersion: 1,
      id: `${index.toString(16).padStart(8, '0')}-aaaa-4aaa-8aaa-aaaaaaaaaaaa`,
      kind: 'preference',
      canonicalKey: `workflow preference ${index}`,
      content:
        `Keep workflow preference number ${index} concise and deterministic.`,
      scope: { type: 'user' },
      provenance: {
        origin: 'direct-user',
        requestId: `benchmark-${index}`,
        sourceDigest: createHash('sha256')
          .update(`benchmark-${index}`)
          .digest('hex'),
      },
      authority: 'direct-user',
      confidence: 1,
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    })),
    tombstones: [],
    audit: [],
    appliedRequests: [],
  }
}

describe('structured memory performance', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-memory-performance-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function openFixture(name: string, size: number) {
    const directory = path.join(root, name)
    await mkdir(directory, { recursive: true })
    await writeFile(
      path.join(directory, 'structured-memory.json'),
      JSON.stringify(benchmarkState(size)),
      { mode: 0o600 },
    )
    const store = new ManagerStructuredMemoryStore(directory, { now })
    const startedAt = performance.now()
    await store.initialize()
    return {
      directory,
      startupMs: performance.now() - startedAt,
      store,
    }
  }

  function searchSamples(
    store: ManagerStructuredMemoryStore,
    iterations: number,
  ): number[] {
    for (let index = 0; index < 5; index += 1) {
      formatStructuredMemoryContext(store.search({
        query: 'workflow preference 9999 concise',
        scopes: [{ type: 'user' }],
      }))
    }
    return Array.from({ length: iterations }, () => {
      const startedAt = performance.now()
      formatStructuredMemoryContext(store.search({
        query: 'workflow preference 9999 concise',
        scopes: [{ type: 'user' }],
      }))
      return performance.now() - startedAt
    })
  }

  it('keeps representative and stress retrieval plus prompt assembly within p95 budgets', async () => {
    const representative = await openFixture('representative', 1_000)
    const stress = await openFixture('stress', 10_000)

    const representativeP95 = percentile(
      searchSamples(representative.store, 80),
      0.95,
    )
    const stressP95 = percentile(searchSamples(stress.store, 80), 0.95)

    expect(representativeP95).toBeLessThanOrEqual(10)
    expect(stressP95).toBeLessThanOrEqual(25)
  })

  it('keeps startup and memory growth bounded at the maximum record count', async () => {
    const rssBefore = process.memoryUsage().rss
    const emptyDirectory = path.join(root, 'empty')
    const emptyStore = new ManagerStructuredMemoryStore(emptyDirectory, {
      now,
    })
    const emptyStartedAt = performance.now()
    await emptyStore.initialize()
    const emptyStartupMs = performance.now() - emptyStartedAt

    const loaded = await openFixture('loaded', 10_000)
    const rssGrowth = process.memoryUsage().rss - rssBefore
    const stateSize = (await stat(
      path.join(loaded.directory, 'structured-memory.json'),
    )).size

    expect(emptyStartupMs).toBeLessThanOrEqual(100)
    expect(loaded.startupMs).toBeLessThanOrEqual(2_000)
    expect(rssGrowth).toBeLessThanOrEqual(192 * 1024 * 1024)
    expect(stateSize).toBeLessThanOrEqual(
      MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES,
    )
  })

  it('serializes concurrent writes and repeated restart/search cycles without unbounded files', async () => {
    const fixture = await openFixture('cycles', 1_000)
    const writeStartedAt = performance.now()
    await Promise.all(Array.from({ length: 20 }, (_, index) =>
      fixture.store.remember({
        requestId: `concurrent-${index}`,
        kind: 'preference',
        canonicalKey: `concurrent preference ${index}`,
        content: `Keep concurrent workflow ${index} deterministic.`,
        scope: { type: 'user' },
        confidence: 1,
      })))
    const writeDurationMs = performance.now() - writeStartedAt
    expect(fixture.store.snapshot().records).toHaveLength(1_020)
    expect(writeDurationMs).toBeLessThanOrEqual(5_000)

    for (let index = 0; index < 10; index += 1) {
      const reopened = new ManagerStructuredMemoryStore(
        fixture.directory,
        { now },
      )
      await reopened.initialize()
      expect(reopened.search({
        query: 'concurrent workflow',
        scopes: [{ type: 'user' }],
      }).records).toHaveLength(8)
    }

    const files = await import('node:fs/promises').then(({ readdir }) =>
      readdir(fixture.directory))
    expect(files.filter((file) => file.endsWith('.pending'))).toEqual([])
    expect(files.sort()).toEqual([
      'structured-memory.backup.json',
      'structured-memory.json',
    ])
  })
})
