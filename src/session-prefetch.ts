import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import { sessionKey } from './session-presentation'
import { holdsTranscript } from './session-transcript'

/**
 * Reading ahead: once the page has settled, the latest window of the sessions
 * at the top of the sidebar is read while the page is idle, so opening one
 * draws it at once instead of waiting for its read.
 */

/** How many sessions from the top of the sidebar are read ahead. */
export const PREFETCH_SIDEBAR_ROWS = 8
/** A pass reads no further once its answers come to about this many bytes. */
export const PREFETCH_PASS_BYTES = 2 * 1024 * 1024
/** The longest a read waits for the page to be idle. */
const IDLE_DEADLINE_MS = 2_000
/** Where the browser has no idle callbacks (Safari), a read waits this long. */
const IDLE_FALLBACK_MS = 300

/** A node reads a session without opening it, as `?passive=1` asks, from this version on. */
const PASSIVE_READS_SINCE = [1, 15, 1]

/**
 * Whether reading a session on this computer leaves it as it is. The hub
 * serving the page does; a node from before passive reads ignores `?passive=1`
 * and opens the session, resuming its runtime, so it is read ahead only once it
 * has said it is newer.
 */
export function readsPassively(computer: Pick<ComputerSummary, 'isLocal' | 'version'>): boolean {
  if (computer.isLocal) return true
  const version = computer.version?.match(/^(\d+)\.(\d+)\.(\d+)/)?.slice(1).map(Number)
  if (!version) return false
  const differs = version.findIndex((part, index) => part !== PASSIVE_READS_SINCE[index])
  return differs < 0 || version[differs] > PASSIVE_READS_SINCE[differs]
}

export interface PrefetchSkips {
  selectedKey?: string
  /** `computerId:sessionId` of the sessions hidden from the list. */
  hiddenKeys: ReadonlySet<string>
  computers: readonly Pick<ComputerSummary, 'id' | 'online' | 'isLocal' | 'version'>[]
  /** Whether a read of this session is already on its way. */
  inFlight: (session: ManagedSession) => boolean
}

/**
 * The sessions worth reading ahead, in the order the sidebar shows them. Only
 * its top rows are looked at, so rows passed over still count toward them.
 */
export function prefetchCandidates(
  sidebar: readonly ManagedSession[],
  skips: PrefetchSkips,
  rows = PREFETCH_SIDEBAR_ROWS,
): ManagedSession[] {
  const readable = new Set(skips.computers
    .filter((computer) => computer.online && readsPassively(computer))
    .map((computer) => computer.id))
  return sidebar.slice(0, rows).filter((session) => {
    const key = sessionKey(session)
    return key !== skips.selectedKey &&
      !holdsTranscript(session) &&
      session.isOpen !== false && !session.closedAt && !session.archivedAt &&
      !skips.hiddenKeys.has(key) &&
      readable.has(session.computerId) &&
      !skips.inFlight(session)
  })
}

export interface ConnectionHints {
  saveData?: boolean
  effectiveType?: string
}

/** Whether the connection asks for data to be spared: Save-Data, or 2G. */
export function connectionSparesData(connection: ConnectionHints | undefined): boolean {
  return connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g'
}

export interface BrowserConnection extends ConnectionHints {
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

/** The browser's connection hints, where it gives them. */
export function browserConnection(): BrowserConnection | undefined {
  return (globalThis.navigator as (Navigator & { connection?: BrowserConnection }) | undefined)?.connection
}

/** Calls `run` once the page is idle; the function returned calls it off. */
export type IdleScheduler = (run: () => void) => () => void

export const whenIdle: IdleScheduler = (run) => {
  if (typeof globalThis.requestIdleCallback === 'function') {
    const handle = globalThis.requestIdleCallback(() => run(), { timeout: IDLE_DEADLINE_MS })
    return () => globalThis.cancelIdleCallback(handle)
  }
  const handle = globalThis.setTimeout(run, IDLE_FALLBACK_MS)
  return () => globalThis.clearTimeout(handle)
}

export interface SessionPrefetcherOptions {
  /** The sessions to read next, best first, as things stand now. */
  candidates: () => readonly ManagedSession[]
  read: (session: ManagedSession, signal: AbortSignal) => Promise<ManagedSession>
  install: (session: ManagedSession) => void
  /** Looked at again just before each read: the page may have changed since. */
  allowed?: () => boolean
  idle?: IdleScheduler
  /** How many bytes an answer came to. */
  size?: (session: ManagedSession) => number
  budget?: number
}

const answerSize = (session: ManagedSession) => JSON.stringify(session).length

/**
 * Reads sessions ahead one at a time, each once the page is idle.
 *
 * A pass runs from `start` until `stop`. It reads no further once its answers
 * come to the budget, and tries each session at most once; `start` while it
 * runs only has it look again for sessions to read. `stop` abandons the read on
 * its way, so a request the reader makes goes first, and the next pass reads
 * that session again.
 */
export class SessionPrefetcher {
  private readonly options: SessionPrefetcherOptions
  private active = false
  private busy = false
  private spent = 0
  private readonly attempted = new Set<string>()
  private cancelIdle?: () => void
  private controller?: AbortController

  constructor(options: SessionPrefetcherOptions) {
    this.options = options
  }

  start(): void {
    if (!this.active) {
      this.active = true
      this.spent = 0
      this.attempted.clear()
    }
    this.schedule()
  }

  stop(): void {
    this.active = false
    this.busy = false
    this.cancelIdle?.()
    this.cancelIdle = undefined
    this.controller?.abort()
    this.controller = undefined
  }

  private next(): ManagedSession | undefined {
    return this.options.candidates().find((session) => !this.attempted.has(sessionKey(session)))
  }

  private schedule(): void {
    if (!this.active || this.busy || this.spent >= (this.options.budget ?? PREFETCH_PASS_BYTES) || !this.next()) return
    this.busy = true
    this.cancelIdle = (this.options.idle ?? whenIdle)(() => {
      this.cancelIdle = undefined
      void this.readNext()
    })
  }

  private async readNext(): Promise<void> {
    const session = this.active && (this.options.allowed?.() ?? true) ? this.next() : undefined
    if (!session) {
      this.busy = false
      return
    }
    this.attempted.add(sessionKey(session))
    const controller = new AbortController()
    this.controller = controller
    try {
      const answer = await this.options.read(session, controller.signal)
      if (controller.signal.aborted) return
      this.spent += (this.options.size ?? answerSize)(answer)
      this.options.install(answer)
    } catch {
      // A failed read is tried again next pass; an abandoned one, too.
    } finally {
      if (this.controller === controller) {
        this.controller = undefined
        this.busy = false
      }
    }
    if (!controller.signal.aborted) this.schedule()
  }
}
