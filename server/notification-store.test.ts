import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NotificationRecord } from '../shared/notification-center.js'
import { notificationIdentity } from './notification-classifier.js'
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
})
