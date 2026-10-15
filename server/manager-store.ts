import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { AgentProvider, SessionStatus } from '../shared/contracts.js'
import type { ManagerClientDefaults, ManagerMessage } from '../shared/manager.js'
import { ManagerMemory } from './manager-memory.js'

export type SessionOrigin = 'manager' | 'user' | 'discovered'

export interface ManagerState {
  /** The SDK session holding the manager's conversation. */
  sdkSessionId?: string
  /** Bumped every time the conversation moves to a new SDK session. */
  generation: number
  /**
   * Every SDK session the manager has used or is about to create. Recorded
   * before creation, so none of them is ever listed as one of your sessions,
   * even if deleting a retired one failed or the hub stopped mid-creation.
   */
  knownSdkSessionIds: string[]
  /** How often each queued message has been interrupted by a restart. */
  interruptions?: Record<string, number>
  /** Things the agent learns on its next turn, such as your answer to a confirmation. */
  pendingNotes?: string[]
  /** The newest journal entry a completed turn has shown the agent. */
  acknowledgedJournalSeq: number
  /** Hash of the MEMORY.md the agent last saw in a prompt. */
  memoryHashShown?: string
  /** When the registry first took in the sessions that already existed. */
  baselineAt?: string
  /** The browser defaults the last message carried. */
  defaults?: ManagerClientDefaults
}

export type JournalKind = 'created' | 'status' | 'renamed' | 'replaced' | 'removed'

export interface JournalDraft {
  kind: JournalKind
  computerId: string
  sessionId: string
  computerName?: string
  title?: string
  from?: string
  to?: string
  replacedBy?: string
  origin?: SessionOrigin
}

export interface JournalEntry extends JournalDraft {
  seq: number
  at: string
}

export interface RegistryEntry {
  computerId: string
  sessionId: string
  title: string
  computerName?: string
  cwd?: string
  provider?: AgentProvider
  origin: SessionOrigin
  /** What the session was started to do, from its first prompt. */
  task?: string
  firstSeenAt: string
  lastStatus?: SessionStatus | 'closed'
  lastSeenAt?: string
  removedAt?: string
  replacedBy?: string
}

export type ManagerRegistry = Record<string, RegistryEntry>

export interface ManagerStoreOptions {
  now?: () => Date
  conversationKeep?: number
  journalLimit?: number
  journalKeep?: number
  tombstoneDays?: number
  tombstoneMax?: number
}

const emptyState = (): ManagerState => ({
  generation: 0,
  knownSdkSessionIds: [],
  acknowledgedJournalSeq: 0,
})

export function registryKey(computerId: string, sessionId: string): string {
  return `${computerId}:${sessionId}`
}

/**
 * The files the app keeps for the manager agent, under `<data>/manager/`.
 * Every write is serialized; JSON files are replaced atomically and the logs
 * are append-only, so a crash leaves at worst a torn last line, which loading
 * skips. A file that cannot be parsed at all is set aside, never fatal.
 */
export class ManagerStore {
  readonly memory: ManagerMemory
  private readonly now: () => Date
  private readonly conversationKeep: number
  private readonly journalLimit: number
  private readonly journalKeep: number
  private readonly tombstoneMs: number
  private readonly tombstoneMax: number
  private current: ManagerState = emptyState()
  private conversation = new Map<string, ManagerMessage>()
  private conversationLines = 0
  private journal: JournalEntry[] = []
  private journalSeq = 0
  private sessions: ManagerRegistry = {}
  private work: Promise<unknown> = Promise.resolve()

  constructor(readonly directory: string, options: ManagerStoreOptions = {}) {
    this.now = options.now ?? (() => new Date())
    this.conversationKeep = options.conversationKeep ?? 1000
    this.journalLimit = options.journalLimit ?? 4000
    this.journalKeep = options.journalKeep ?? 2000
    this.tombstoneMs = (options.tombstoneDays ?? 30) * 24 * 60 * 60 * 1000
    this.tombstoneMax = options.tombstoneMax ?? 500
    this.memory = new ManagerMemory(path.join(directory, 'memory'))
  }

  async initialize(): Promise<void> {
    await mkdir(path.join(this.directory, 'memory'), { recursive: true })
    await mkdir(path.join(this.directory, 'workspace'), { recursive: true })
    const state = await this.readJson<Partial<ManagerState>>('state.json')
    this.current = { ...emptyState(), ...(state ?? {}) }
    if (!Array.isArray(this.current.knownSdkSessionIds)) this.current.knownSdkSessionIds = []
    this.sessions = (await this.readJson<ManagerRegistry>('sessions.json')) ?? {}

    this.conversation = new Map()
    const conversationLines = await this.readLines<ManagerMessage>('conversation.jsonl')
    this.conversationLines = conversationLines.length
    for (const message of conversationLines) {
      if (typeof message?.id === 'string') this.conversation.set(message.id, message)
    }
    this.trimConversation()

    this.journal = (await this.readLines<JournalEntry>('journal.jsonl'))
      .filter((entry) => Number.isInteger(entry?.seq))
    this.journalSeq = this.journal.reduce((highest, entry) => Math.max(highest, entry.seq), 0)
  }

  state(): ManagerState {
    return structuredClone(this.current)
  }

  updateState(change: (state: ManagerState) => void): Promise<ManagerState> {
    const next = structuredClone(this.current)
    change(next)
    this.current = next
    const snapshot = structuredClone(next)
    return this.serialized(() => this.writeJson('state.json', snapshot)).then(() => structuredClone(snapshot))
  }

  messages(): ManagerMessage[] {
    return [...this.conversation.values()].map((message) => structuredClone(message))
  }

  message(id: string): ManagerMessage | undefined {
    const message = this.conversation.get(id)
    return message ? structuredClone(message) : undefined
  }

  upsertMessage(message: ManagerMessage): Promise<void> {
    const stored = structuredClone(message)
    this.conversation.set(stored.id, stored)
    this.trimConversation()
    this.conversationLines += 1
    const compact = this.conversationLines > this.conversationKeep * 4
    if (compact) this.conversationLines = this.conversation.size
    const lines = compact
      ? [...this.conversation.values()].map((entry) => JSON.stringify(entry)).join('\n') + '\n'
      : `${JSON.stringify(stored)}\n`
    return this.serialized(() =>
      compact
        ? this.writeAtomic('conversation.jsonl', lines)
        : appendFile(path.join(this.directory, 'conversation.jsonl'), lines, 'utf8'),
    )
  }

  /** Starts an empty conversation, keeping the old log beside it. */
  resetConversation(): Promise<void> {
    this.conversation = new Map()
    this.conversationLines = 0
    const archive = `conversation-${this.now().toISOString().replaceAll(':', '-')}.jsonl`
    return this.serialized(async () => {
      await rename(
        path.join(this.directory, 'conversation.jsonl'),
        path.join(this.directory, archive),
      ).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error
      })
    })
  }

  appendJournal(drafts: JournalDraft[]): Promise<JournalEntry[]> {
    if (!drafts.length) return Promise.resolve([])
    const at = this.now().toISOString()
    const entries = drafts.map((draft) => ({ ...draft, seq: ++this.journalSeq, at }))
    this.journal.push(...entries)
    const rotate = this.journal.length > this.journalLimit
    if (rotate) this.journal = this.journal.slice(-this.journalKeep)
    const content = rotate
      ? this.journal.map((entry) => JSON.stringify(entry)).join('\n') + '\n'
      : entries.map((entry) => JSON.stringify(entry)).join('\n') + '\n'
    return this.serialized(() =>
      rotate
        ? this.writeAtomic('journal.jsonl', content)
        : appendFile(path.join(this.directory, 'journal.jsonl'), content, 'utf8'),
    ).then(() => entries.map((entry) => ({ ...entry })))
  }

  journalSince(seq: number): JournalEntry[] {
    return this.journal.filter((entry) => entry.seq > seq).map((entry) => ({ ...entry }))
  }

  latestJournalSeq(): number {
    return this.journalSeq
  }

  registry(): ManagerRegistry {
    return structuredClone(this.sessions)
  }

  updateRegistry(change: (registry: ManagerRegistry) => void): Promise<void> {
    const next = structuredClone(this.sessions)
    change(next)
    this.sessions = this.pruneTombstones(next)
    const snapshot = structuredClone(this.sessions)
    return this.serialized(() => this.writeJson('sessions.json', snapshot))
  }

  /** Settles once every write issued so far is on disk. */
  async flush(): Promise<void> {
    await this.work
  }

  private pruneTombstones(registry: ManagerRegistry): ManagerRegistry {
    const cutoff = this.now().getTime() - this.tombstoneMs
    const tombstones = Object.entries(registry)
      .filter(([, entry]) => entry.removedAt)
      .sort(([, left], [, right]) => right.removedAt!.localeCompare(left.removedAt!))
    tombstones.forEach(([key, entry], index) => {
      if (index >= this.tombstoneMax || Date.parse(entry.removedAt!) < cutoff) delete registry[key]
    })
    return registry
  }

  private trimConversation(): void {
    const excess = this.conversation.size - this.conversationKeep
    if (excess <= 0) return
    for (const key of [...this.conversation.keys()].slice(0, excess)) this.conversation.delete(key)
  }

  private async readJson<T>(name: string): Promise<T | undefined> {
    let text: string
    try {
      text = await readFile(path.join(this.directory, name), 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      // Unreadable is treated like corrupt: set aside, so the next write can
      // create it again, and started fresh, never fatal.
      console.warn(`Manager ${name} could not be read; starting without it:`, error)
      await this.setAside(name)
      return undefined
    }
    try {
      const value = JSON.parse(text) as unknown
      if (value && typeof value === 'object' && !Array.isArray(value)) return value as T
    } catch {
      // Set aside below.
    }
    console.warn(`Manager ${name} could not be parsed; starting fresh`)
    await this.setAside(name)
    return undefined
  }

  private async setAside(name: string): Promise<void> {
    const aside = `${name}.corrupt-${this.now().toISOString().replaceAll(':', '-')}`
    await rename(path.join(this.directory, name), path.join(this.directory, aside)).then(
      () => console.warn(`Moved manager ${name} to ${aside}`),
      (error: unknown) => console.warn(`Could not move manager ${name} aside:`, error),
    )
  }

  private async readLines<T>(name: string): Promise<T[]> {
    let text: string
    try {
      text = await readFile(path.join(this.directory, name), 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      console.warn(`Manager ${name} could not be read; starting without it:`, error)
      await this.setAside(name)
      return []
    }
    const values: T[] = []
    for (const line of text.split('\n')) {
      if (!line.trim()) continue
      try {
        values.push(JSON.parse(line) as T)
      } catch {
        // A torn or damaged line is skipped; the rest of the log still counts.
      }
    }
    return values
  }

  private writeJson(name: string, value: unknown): Promise<void> {
    return this.writeAtomic(name, `${JSON.stringify(value)}\n`)
  }

  private async writeAtomic(name: string, content: string): Promise<void> {
    const target = path.join(this.directory, name)
    const temporary = `${target}.${randomUUID()}.tmp`
    await writeFile(temporary, content, 'utf8')
    await rename(temporary, target)
  }

  private serialized<T>(work: () => Promise<T>): Promise<T> {
    const next = this.work.then(work, work)
    this.work = next.catch((error: unknown) => {
      console.warn('Manager state write failed:', error)
    })
    return next
  }
}
