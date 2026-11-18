import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NotificationRecord } from '../shared/notification-center.js'
import type { ManagedSession } from '../shared/contracts.js'
import { classifyHubNotification, notificationIdentity } from './notification-classifier.js'
import { NOTIFICATION_LIMIT, NOTIFICATION_RETENTION_MS, NotificationStore } from './notification-store.js'

const directories: string[] = []
const now = Date.parse('2026-11-14T06:00:00.000Z')

async function setup() {
  const directory = path.resolve(`.notification-store-test-${randomUUID()}`)
  directories.push(directory)
  await mkdir(directory, { mode: 0o700 })
  const store = new NotificationStore(directory, { now: () => now })
  await store.initialize()
  return { directory, store }
}

function record(index: number, createdAt = new Date(now).toISOString()): NotificationRecord {
  return {
    id: notificationIdentity('session.completed', 'computer', 'session', String(index)),
    kind: 'session.completed', severity: 'info', computerId: 'computer', sessionId: 'session',
    title: 'Finished', body: 'No action needed', url: '/?session=session', createdAt,
    coalesceKey: 'session', muted: false,
  }
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('NotificationStore', () => {
  it('updates bounded batches with one durable write and preserves unrelated records', async () => {
    const { directory, store } = await setup()
    await store.ingest(() => [record(1), record(2), record(3)])
    const persist = vi.spyOn(store as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    await store.mutateMany([record(1).id, record(2).id, record(1).id], 'read')
    expect(persist).toHaveBeenCalledOnce()
    expect((await store.list()).filter((entry) => entry.readAt)).toHaveLength(2)
    persist.mockClear()
    await store.mutateMany([record(1).id, record(2).id], 'dismiss')
    expect(persist).toHaveBeenCalledOnce()
    const restarted = new NotificationStore(directory, { now: () => now })
    await restarted.initialize()
    expect((await restarted.list()).map((entry) => entry.id)).toEqual([record(3).id])
    expect(() => store.mutateMany(Array.from({ length: 1001 }, () => record(3).id), 'read')).toThrow('limit')
  })
  it('atomically stores owner-only data and tightens existing directory/file permissions', async () => {
    const { directory, store } = await setup()
    await store.ingest(() => [record(1)])
    expect((await stat(store.directory)).mode & 0o777).toBe(0o700)
    expect((await stat(store.statePath)).mode & 0o777).toBe(0o600)
    expect(await readdir(store.directory)).toEqual(['records.json'])
    await chmod(store.directory, 0o755)
    await chmod(store.statePath, 0o644)
    const restarted = new NotificationStore(directory, { now: () => now })
    await restarted.initialize()
    expect((await stat(store.directory)).mode & 0o777).toBe(0o700)
    expect((await stat(store.statePath)).mode & 0o777).toBe(0o600)
    expect(await restarted.list()).toHaveLength(1)
  })

  it('deduplicates read and dismissed events across restart without resurrecting them', async () => {
    const { directory, store } = await setup()
    await store.ingest(() => [record(1), record(2)])
    await store.markRead(record(1).id)
    await store.dismiss(record(2).id)
    const restarted = new NotificationStore(directory, { now: () => now })
    await restarted.initialize()
    await restarted.ingest(() => [record(1), record(2)])
    expect(await restarted.list()).toEqual([expect.objectContaining({ id: record(1).id, readAt: expect.any(String) })])
    expect(await restarted.unreadCount()).toBe(0)
    expect(JSON.parse(await readFile(restarted.statePath, 'utf8')).records).toHaveLength(2)
  })

  it('bounds records to 1,000 and keeps capacity-evicted identities as durable tombstones', async () => {
    const { directory, store } = await setup()
    await store.ingest(() => Array.from({ length: NOTIFICATION_LIMIT + 10 }, (_, index) =>
      record(index, new Date(now - 10_000 + index).toISOString())))
    const records = await store.list()
    expect(records).toHaveLength(NOTIFICATION_LIMIT)
    expect(records.some((entry) => entry.id === record(0).id)).toBe(false)
    const restarted = new NotificationStore(directory, { now: () => now })
    await restarted.initialize()
    await restarted.ingest(() => [record(0)])
    expect((await restarted.list()).some((entry) => entry.id === record(0).id)).toBe(false)
  })

  it('evicts the oldest unpinned dedupe identities deterministically at capacity and keeps admitting durable state', async () => {
    const { directory, store } = await setup()
    const stamp = new Date(now - 1000).toISOString()
    await store.ingest(() => Array.from({ length: 10_000 }, (_, index) => record(index, stamp)))
    await store.markRead(record(9999).id)
    const before = JSON.parse(await readFile(store.statePath, 'utf8'))
    const pinned = new Set([
      ...before.records.slice(2).map((entry: NotificationRecord) => entry.id), record(10_000).id, record(10_001).id,
    ])
    const evicted = Object.keys(before.seen).filter((id) => !pinned.has(id)).sort().slice(0, 2)
    await store.ingest((cursors) => {
      cursors.pressure = { status: 'idle', rootPromptId: 'new-root', touchedAt: new Date(now).toISOString() }
      return [record(10_000), record(10_001)]
    })
    const saved = JSON.parse(await readFile(store.statePath, 'utf8'))
    expect(Object.keys(saved.seen)).toHaveLength(10_000)
    expect(evicted.every((id) => saved.seen[id] === undefined)).toBe(true)
    expect(saved.records).toHaveLength(NOTIFICATION_LIMIT)
    expect(saved.records.every((entry: NotificationRecord) => saved.seen[entry.id])).toBe(true)
    expect(saved.cursors.pressure).toMatchObject({ status: 'idle', rootPromptId: 'new-root' })
    const warn = vi.fn()
    const restarted = new NotificationStore(directory, { now: () => now, warn })
    await restarted.initialize()
    await restarted.ingest(() => [record(9999, stamp), record(10_000)])
    expect(warn).not.toHaveBeenCalled()
    expect(await restarted.list()).toHaveLength(NOTIFICATION_LIMIT)
    expect((await restarted.list()).find((entry) => entry.id === record(9999).id)?.readAt).toBeDefined()
    expect((await restarted.list()).filter((entry) => entry.id === record(10_000).id)).toHaveLength(1)
  })

  it('expires records after 30 days on startup and reads, and rejects aged replays', async () => {
    const { directory, store } = await setup()
    await store.ingest(() => [record(1, new Date(now - NOTIFICATION_RETENTION_MS - 1).toISOString()), record(2)])
    expect(await store.list()).toHaveLength(1)
    let clock = now
    const restarted = new NotificationStore(directory, { now: () => clock })
    await restarted.initialize()
    clock += NOTIFICATION_RETENTION_MS + 1
    expect(await restarted.list()).toEqual([])
    await restarted.ingest(() => [record(2)])
    expect(await restarted.list()).toEqual([])
  })

  it.each(['{broken', '{"version":99}', '{"version":1,"revision":0,"records":[],"seen":{},"cursors":{"bad":{"status":"bogus"}}}'])(
    'quarantines invalid persisted state and logs once: %s', async (raw) => {
      const { directory, store } = await setup()
      await writeFile(store.statePath, raw)
      const warn = vi.fn()
      const restarted = new NotificationStore(directory, { now: () => now, warn })
      await Promise.all([restarted.initialize(), restarted.initialize()])
      expect(await restarted.list()).toEqual([])
      const quarantined = (await readdir(store.directory)).filter((name) => name.includes('.corrupt-'))
      expect(quarantined).toHaveLength(1)
      expect(await readFile(path.join(store.directory, quarantined[0]!), 'utf8')).toBe(raw)
      expect((await stat(path.join(store.directory, quarantined[0]!))).mode & 0o777).toBe(0o600)
      expect(warn).toHaveBeenCalledOnce()
      const again = new NotificationStore(directory, { warn, now: () => now })
      await again.initialize()
      expect(warn).toHaveBeenCalledOnce()
    },
  )

  it('refuses symlink state rather than reading or overwriting another file', async () => {
    const { directory, store } = await setup()
    const other = path.join(directory, 'other.json')
    await writeFile(other, 'untouched')
    await rm(store.statePath)
    await symlink(other, store.statePath)
    await expect(new NotificationStore(directory).initialize()).rejects.toThrow()
    expect(await readFile(other, 'utf8')).toBe('untouched')
  })

  it('removes only recognized owned staging files left by an interrupted atomic write', async () => {
    const { directory, store } = await setup()
    const pending = path.join(store.directory, `records.${randomUUID()}.pending`)
    const unrelated = path.join(store.directory, 'unrelated.pending')
    await writeFile(pending, 'interrupted', { mode: 0o600 })
    await writeFile(unrelated, 'keep', { mode: 0o600 })
    await new NotificationStore(directory, { now: () => now }).initialize()
    await expect(stat(pending)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await readFile(unrelated, 'utf8')).toBe('keep')
  })

  it('serializes read-all, dismiss, and admissions without losing marks; broadcasts only committed visible changes', async () => {
    const { store } = await setup()
    const changed = vi.fn()
    store.on('changed', changed)
    await store.ingest(() => [record(1), { ...record(2), sessionId: 'other', kind: 'session.failed', severity: 'error' }])
    const snapshot = await store.list()
    snapshot[0]!.title = 'Not the store'
    await Promise.all([store.readAll({ sessionId: 'session' }), store.dismiss(record(2).id), store.ingest(() => [record(3)])])
    expect(await store.unreadCount()).toBe(1)
    expect(await store.list({ failed: true })).toEqual([])
    expect(await store.list({ unread: false, sessionId: 'session' })).toEqual([expect.objectContaining({ id: record(1).id, title: 'Finished' })])
    const before = changed.mock.calls.length
    await store.ingest(() => [record(1)])
    await store.markRead(record(1).id)
    expect(changed).toHaveBeenCalledTimes(before)
    expect(changed.mock.calls.at(-1)?.[0]).toMatchObject({ type: 'notifications.changed', unreadCount: 1 })
  })

  it('does not rewrite streaming cursors for observation times, revisions or LRU order alone', async () => {
    const { directory, store } = await setup()
    const stamp = new Date(now).toISOString()
    const active: ManagedSession = {
      id: 'one', computerId: 'computer', computerName: 'Worker', cwd: '/project', title: 'Review',
      status: 'running', revision: 1, updatedAt: stamp, isOpen: true,
      messages: [{ id: 'root-one', role: 'user', content: 'Review', createdAt: stamp }],
    }
    const other = { ...active, id: 'two', messages: [{ ...active.messages[0], id: 'root-two' }] }
    for (const session of [active, other]) {
      await store.ingest((cursors) => classifyHubNotification({ type: 'session.upserted', session }, cursors, stamp))
    }
    const computer = { id: 'computer', name: 'Worker', online: true, isLocal: false }
    await store.ingest((cursors) => classifyHubNotification({ type: 'computer.updated', computer }, cursors, stamp))
    const persistedBefore = await readFile(store.statePath, 'utf8')
    const persist = vi.spyOn(store as unknown as { persist(state: unknown): Promise<void> }, 'persist')
    for (let index = 0; index < 12; index += 1) {
      const session = index % 2 ? active : other
      const time = new Date(now + (index + 1) * 750).toISOString()
      await store.ingest((cursors) => [
        ...classifyHubNotification({ type: 'session.upserted', session: {
          ...session, revision: index + 2, updatedAt: time,
          messages: [...session.messages, { id: 'reply', role: 'assistant', content: `Word ${index}`, createdAt: time }],
        } }, cursors, time),
        ...classifyHubNotification({ type: 'computer.updated', computer }, cursors, time),
      ])
    }
    // The latest revision still fences stale snapshots in memory without I/O.
    await store.ingest((cursors) => classifyHubNotification({
      type: 'session.upserted', session: { ...active, revision: 2, status: 'idle' },
    }, cursors, stamp))
    expect(await store.list()).toEqual([])
    expect(persist).not.toHaveBeenCalled()
    expect(await readFile(store.statePath, 'utf8')).toBe(persistedBefore)

    await store.ingest((cursors) => classifyHubNotification({
      type: 'session.upserted', session: { ...active, revision: 50, status: 'idle' },
    }, cursors, stamp))
    expect(persist).toHaveBeenCalledOnce()
    const durable = JSON.parse(await readFile(store.statePath, 'utf8'))
    expect(durable.records).toEqual([expect.objectContaining({ kind: 'session.completed', sessionId: 'one' })])
    expect(durable.cursors[JSON.stringify(['session', 'computer', 'one'])].revision).toBe(50)
    await store.markRead(durable.records[0].id)
    const restarted = new NotificationStore(directory, { now: () => now })
    await restarted.initialize()
    await restarted.ingest((cursors) => classifyHubNotification({
      type: 'session.upserted', session: { ...active, revision: 49 },
    }, cursors, stamp))
    expect(await restarted.unreadCount()).toBe(0)
    expect(await restarted.list()).toHaveLength(1)
  })
})
