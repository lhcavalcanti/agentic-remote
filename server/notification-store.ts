import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { constants } from 'node:fs'
import { chmod, lstat, mkdir, open, readdir, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type {
  NotificationFilter,
  NotificationRecord,
  NotificationsChanged,
} from '../shared/notification-center.js'
import { notificationKinds } from '../shared/notification-center.js'
import type { NotificationCursors } from './notification-classifier.js'

export const NOTIFICATION_LIMIT = 1_000
export const NOTIFICATION_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000
const DEDUPE_LIMIT = 10_000
const CURSOR_LIMIT = 2_000
const MAX_FILE_BYTES = 16 * 1024 * 1024
const identity = z.string().regex(/^[a-f0-9]{64}$/)
const timestamp = z.string().datetime({ offset: true })
const kind = z.union([z.enum(notificationKinds), z.string().regex(/^schedule\.run\.[a-z-]+$/)])
const recordSchema = z.object({
  id: identity,
  kind,
  severity: z.enum(['info', 'warning', 'error']),
  computerId: z.string().max(512).optional(),
  sessionId: z.string().max(512).optional(),
  title: z.string().max(512),
  body: z.string().max(2_000),
  url: z.string().max(4_096).refine((value) => value.startsWith('/') && !value.startsWith('//')),
  createdAt: timestamp,
  readAt: timestamp.optional(),
  dismissedAt: timestamp.optional(),
  coalesceKey: z.string().max(2_048),
  muted: z.boolean(),
}).strict()
const cursorSchema = z.object({
  status: z.enum(['idle', 'running', 'waiting', 'error']).optional(),
  revision: z.number().int().nonnegative().optional(),
  rootPromptId: z.string().max(1_024).optional(),
  actions: z.array(z.string().max(1_024)).max(2).optional(),
  online: z.boolean().optional(),
  episode: z.number().int().nonnegative().optional(),
  touchedAt: timestamp,
}).strict()
const stateSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative(),
  records: z.array(recordSchema).max(NOTIFICATION_LIMIT),
  // Identity-only tombstones outlive capacity eviction of visible records.
  seen: z.record(identity, timestamp).refine((value) => Object.keys(value).length <= DEDUPE_LIMIT),
  cursors: z.record(z.string().max(2_048), cursorSchema)
    .refine((value) => Object.keys(value).length <= CURSOR_LIMIT),
}).strict()

interface NotificationState {
  version: 1
  revision: number
  records: NotificationRecord[]
  seen: Record<string, string>
  cursors: NotificationCursors
}

function emptyState(): NotificationState {
  return { version: 1, revision: 0, records: [], seen: {}, cursors: {} }
}

function durableState(state: NotificationState): string {
  const cursors = Object.keys(state.cursors).sort().map((key) => [
    key,
    Object.fromEntries(Object.entries(state.cursors[key])
      .filter(([name]) => name !== 'touchedAt' && name !== 'revision')
      .sort(([left], [right]) => left.localeCompare(right))),
  ])
  return JSON.stringify({ ...state, cursors })
}

export function matchesNotification(record: NotificationRecord, filter: NotificationFilter): boolean {
  return !record.dismissedAt &&
    (filter.unread === undefined || Boolean(!record.readAt) === filter.unread) &&
    (!filter.kind || record.kind === filter.kind) &&
    (!filter.sessionId || record.sessionId === filter.sessionId) &&
    (!filter.computerId || record.computerId === filter.computerId) &&
    (filter.failed === undefined || (record.severity === 'error') === filter.failed)
}

/**
 * Single hub writer. Records and semantic cursor changes require an atomic
 * replace; observation watermarks may advance in memory between commits.
 */
export class NotificationStore extends EventEmitter<{
  changed: [event: NotificationsChanged]
}> {
  readonly directory: string
  readonly statePath: string
  private state = emptyState()
  private commits: Promise<unknown> = Promise.resolve()
  private initialized = false
  private poisoned = false
  private initializing?: Promise<void>
  private directoryIdentity?: { dev: number; ino: number }

  constructor(
    dataDirectory: string,
    private readonly options: { now?: () => number; warn?: (message: string) => void } = {},
  ) {
    super()
    this.directory = path.join(dataDirectory, 'notifications')
    this.statePath = path.join(this.directory, 'records.json')
  }

  initialize(): Promise<void> {
    return this.initializing ??= this.load()
  }

  private async load(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const directory = await lstat(this.directory)
    this.checkOwner(directory)
    if (!directory.isDirectory()) throw new Error('Notification directory must be a real directory')
    await chmod(this.directory, 0o700)
    this.directoryIdentity = { dev: directory.dev, ino: directory.ino }
    let raw: string | undefined
    try {
      const handle = await open(this.statePath, constants.O_RDONLY | constants.O_NOFOLLOW)
      try {
        const info = await handle.stat()
        this.checkOwner(info)
        if (!info.isFile()) throw new Error('Invalid notification state file')
        await handle.chmod(0o600)
        raw = info.size > MAX_FILE_BYTES ? '' : await handle.readFile('utf8')
      } finally {
        await handle.close()
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
    if (raw !== undefined) {
      try {
        const parsed = stateSchema.parse(JSON.parse(raw)) as NotificationState
        if (new Set(parsed.records.map((entry) => entry.id)).size !== parsed.records.length ||
            parsed.records.some((entry) => !parsed.seen[entry.id])) throw new Error('Invalid notification identities')
        this.state = parsed
      } catch {
        await rename(this.statePath, `${this.statePath}.corrupt-${randomUUID()}`)
        const warn = this.options.warn ?? console.warn
        warn('Corrupt notification state quarantined; starting with an empty notification center')
        this.state = emptyState()
      }
    }
    this.prune(this.state)
    for (const name of await readdir(this.directory)) {
      if (!/^records\.[a-f0-9-]{36}\.pending$/.test(name)) continue
      const staging = path.join(this.directory, name)
      const info = await lstat(staging)
      this.checkOwner(info)
      if (!info.isFile()) throw new Error('Invalid notification staging file')
      await unlink(staging)
    }
    await this.persist(this.state)
    this.initialized = true
  }

  private checkOwner(info: { uid: number }): void {
    if (process.getuid && info.uid !== process.getuid()) throw new Error('Notification storage has a different owner')
  }

  /** Classifies and admits in the same serialized durable transaction. */
  ingest(classify: (cursors: NotificationCursors) => NotificationRecord[]): Promise<void> {
    return this.commit((next) => {
      for (const candidate of classify(next.cursors)) {
        const record = recordSchema.parse(candidate) as NotificationRecord
        if (next.seen[record.id] || Date.parse(record.createdAt) < this.now() - NOTIFICATION_RETENTION_MS) continue
        if (Object.keys(next.seen).length >= DEDUPE_LIMIT) {
          // Never evict a live dedupe fence to accept a replay as new.
          throw new Error('Notification deduplication capacity reached')
        }
        next.seen[record.id] = record.createdAt
        next.records.push(record)
      }
    })
  }

  async list(filter: NotificationFilter = {}): Promise<NotificationRecord[]> {
    await this.commit(() => {})
    return structuredClone(this.state.records.filter((record) => matchesNotification(record, filter))
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt) || left.id.localeCompare(right.id)))
  }

  async unreadCount(filter: NotificationFilter = {}): Promise<number> {
    return (await this.list({ ...filter, unread: true })).length
  }

  markRead(id: string): Promise<void> {
    return this.commit((next) => {
      const record = next.records.find((entry) => entry.id === id)
      if (!record) throw Object.assign(new Error('Notification not found'), { statusCode: 404 })
      record.readAt ??= new Date(this.now()).toISOString()
    })
  }

  dismiss(id: string): Promise<void> {
    return this.commit((next) => {
      const record = next.records.find((entry) => entry.id === id)
      if (!record) throw Object.assign(new Error('Notification not found'), { statusCode: 404 })
      record.dismissedAt ??= new Date(this.now()).toISOString()
    })
  }

  readAll(filter: NotificationFilter = {}): Promise<void> {
    return this.commit((next) => {
      const now = new Date(this.now()).toISOString()
      for (const record of next.records) {
        if (matchesNotification(record, filter)) record.readAt ??= now
      }
    })
  }

  async flush(): Promise<void> {
    await this.commits
  }

  private now(): number {
    return (this.options.now ?? Date.now)()
  }

  private prune(next: NotificationState): void {
    const cutoff = this.now() - NOTIFICATION_RETENTION_MS
    next.records = next.records.filter((entry) => Date.parse(entry.createdAt) >= cutoff)
      .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
      .slice(-NOTIFICATION_LIMIT)
    // Keep active cursor fences across pruning. Their bounded LRU covers
    // current pending requests even if their visible record has aged out.
    next.cursors = Object.fromEntries(Object.entries(next.cursors)
      .sort(([, left], [, right]) => Date.parse(left.touchedAt) - Date.parse(right.touchedAt))
      .slice(-CURSOR_LIMIT))
    for (const [id, at] of Object.entries(next.seen)) {
      if (Date.parse(at) < cutoff) delete next.seen[id]
    }
  }

  private commit(mutate: (next: NotificationState) => void): Promise<void> {
    const task = this.commits.then(async () => {
      if (!this.initialized) throw new Error('Notification store is not initialized')
      if (this.poisoned) throw new Error('Notification commit outcome is uncertain; restart to reload durable state')
      const next = structuredClone(this.state)
      this.prune(next)
      mutate(next)
      this.prune(next)
      if (durableState(next) === durableState(this.state)) {
        // Keep live revision fences and LRU observations without an fsync for
        // every streamed word. The next semantic commit checkpoints them too.
        this.state = next
        return
      }
      const changed = JSON.stringify(next.records) !== JSON.stringify(this.state.records)
      if (changed) next.revision += 1
      await this.persist(next)
      this.state = next
      if (changed) this.emit('changed', {
        type: 'notifications.changed',
        revision: next.revision,
        unreadCount: next.records.filter((record) => !record.readAt && !record.dismissedAt).length,
      })
    })
    this.commits = task.catch(() => undefined)
    return task
  }

  private async persist(state: NotificationState): Promise<void> {
    const directory = await lstat(this.directory)
    this.checkOwner(directory)
    if (!directory.isDirectory() || directory.dev !== this.directoryIdentity?.dev ||
        directory.ino !== this.directoryIdentity.ino) throw new Error('Notification directory was replaced')
    const pending = path.join(this.directory, `records.${randomUUID()}.pending`)
    let replaced = false
    try {
      const handle = await open(pending, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600)
      try {
        await handle.writeFile(JSON.stringify(state))
        await handle.sync()
      } finally {
        await handle.close()
      }
      await rename(pending, this.statePath)
      replaced = true
      const directoryHandle = await open(this.directory, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
      try {
        await directoryHandle.sync()
      } finally {
        await directoryHandle.close()
      }
    } catch (error) {
      if (replaced) this.poisoned = true
      throw error
    } finally {
      await unlink(pending).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error
      })
    }
  }
}
