import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage, ComputerSummary, ManagedSession } from '../shared/contracts'
import {
  connectionSparesData,
  prefetchCandidates,
  SessionPrefetcher,
  whenIdle,
  type PrefetchSkips,
} from './session-prefetch'

const at = '2026-11-24T00:00:00.000Z'
const hub: ComputerSummary = { id: 'hub', name: 'Hub', isLocal: true, online: true }
const node: ComputerSummary = { id: 'node', name: 'Node', isLocal: false, online: false }
const message: ChatMessage = { id: 'm1', role: 'user', content: 'Hello', createdAt: at }

function listed(id: string, extra: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id, computerId: 'hub', computerName: 'Hub', cwd: '/project', title: id,
    updatedAt: at, status: 'idle', isOpen: true, messages: [], ...extra,
  }
}
const ids = (sessions: readonly ManagedSession[]) => sessions.map((session) => session.id)
const rows = (count: number) => Array.from({ length: count }, (_, index) => listed(`s${index}`))
const skips = (extra: Partial<PrefetchSkips> = {}): PrefetchSkips => ({
  hiddenKeys: new Set(), computers: [hub, node], inFlight: () => false, ...extra,
})

describe('prefetchCandidates', () => {
  it('takes the top of the sidebar in its order', () => {
    expect(ids(prefetchCandidates(rows(12), skips()))).toEqual(ids(rows(8)))
  })

  it('counts the rows it passes over toward the top of the sidebar', () => {
    const sidebar = [listed('open'), listed('held', { messages: [message] }), ...rows(8)]
    expect(ids(prefetchCandidates(sidebar, skips({ selectedKey: 'hub:open' }))))
      .toEqual(ids(rows(6)))
  })

  it('passes over the selected session and any that already hold a transcript', () => {
    const sidebar = [
      listed('selected'),
      // Pushed by the event socket.
      listed('pushed', { messages: [message], messagesStart: 0, messagesTotal: 1 }),
      // Read before, and empty.
      listed('empty', { messagesStart: 0, messagesTotal: 0 }),
      listed('summary'),
    ]
    expect(ids(prefetchCandidates(sidebar, skips({ selectedKey: 'hub:selected' }))))
      .toEqual(['summary'])
  })

  it('passes over closed, archived and hidden sessions', () => {
    const sidebar = [
      listed('closed', { isOpen: false }),
      listed('closing', { closedAt: at }),
      listed('archived', { archivedAt: at }),
      listed('hidden'),
      listed('listed'),
    ]
    expect(ids(prefetchCandidates(sidebar, skips({ hiddenKeys: new Set(['hub:hidden']) }))))
      .toEqual(['listed'])
  })

  it('passes over sessions on a computer that is offline or no longer known', () => {
    const sidebar = [
      listed('offline', { computerId: 'node' }),
      listed('unknown', { computerId: 'gone' }),
      listed('online'),
    ]
    expect(ids(prefetchCandidates(sidebar, skips()))).toEqual(['online'])
  })

  it('passes over a session whose read is already on its way', () => {
    const sidebar = [listed('reading'), listed('idle')]
    const inFlight = (session: ManagedSession) => session.id === 'reading'
    expect(ids(prefetchCandidates(sidebar, skips({ inFlight })))).toEqual(['idle'])
  })
})

describe('connectionSparesData', () => {
  it('spares data when the connection asks to, or is 2G', () => {
    expect(connectionSparesData(undefined)).toBe(false)
    expect(connectionSparesData({ effectiveType: '4g' })).toBe(false)
    expect(connectionSparesData({ effectiveType: '3g', saveData: false })).toBe(false)
    expect(connectionSparesData({ effectiveType: '4g', saveData: true })).toBe(true)
    expect(connectionSparesData({ effectiveType: '2g' })).toBe(true)
    expect(connectionSparesData({ effectiveType: 'slow-2g' })).toBe(true)
  })
})

describe('whenIdle', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('falls back to a timer where the browser has no idle callbacks', () => {
    vi.useFakeTimers()
    const run = vi.fn()
    whenIdle(run)
    vi.advanceTimersByTime(1_000)
    expect(run).toHaveBeenCalledTimes(1)
    const cancel = whenIdle(run)
    cancel()
    vi.advanceTimersByTime(1_000)
    expect(run).toHaveBeenCalledTimes(1)
  })
})

describe('SessionPrefetcher', () => {
  interface Read {
    session: ManagedSession
    signal: AbortSignal
    resolve: (session: ManagedSession) => void
    reject: (error: unknown) => void
  }

  async function settle() {
    for (let turn = 0; turn < 5; turn += 1) await Promise.resolve()
  }

  function harness(
    sidebar: ManagedSession[],
    options: { size?: (session: ManagedSession) => number; budget?: number } = {},
  ) {
    const idle: (() => void)[] = []
    const held = new Set<string>()
    const reads: Read[] = []
    const installed: string[] = []
    const prefetcher = new SessionPrefetcher({
      candidates: () => sidebar.filter((session) => !held.has(session.id)),
      read: (session, signal) => new Promise<ManagedSession>((resolve, reject) => {
        reads.push({ session, signal, resolve, reject })
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }),
      install: (session) => {
        held.add(session.id)
        installed.push(session.id)
      },
      idle: (run) => {
        idle.push(run)
        return () => {
          const index = idle.indexOf(run)
          if (index >= 0) idle.splice(index, 1)
        }
      },
      ...options,
    })
    const runIdle = async () => {
      idle.shift()?.()
      await settle()
    }
    const answer = async (read: Read) => {
      read.resolve({ ...read.session, messages: [message], messagesStart: 0, messagesTotal: 1 })
      await settle()
    }
    return { prefetcher, idle, reads, installed, runIdle, answer }
  }

  it('reads one session at a time, each once the page is idle', async () => {
    const { prefetcher, idle, reads, installed, runIdle, answer } = harness(rows(3))
    prefetcher.start()
    expect(reads).toHaveLength(0)
    await runIdle()
    expect(ids(reads.map((read) => read.session))).toEqual(['s0'])
    // Nothing else is asked for while that read is on its way.
    expect(idle).toHaveLength(0)
    await answer(reads[0])
    expect(installed).toEqual(['s0'])
    expect(reads).toHaveLength(1)
    await runIdle()
    await answer(reads[1])
    await runIdle()
    await answer(reads[2])
    expect(installed).toEqual(['s0', 's1', 's2'])
    // Nothing left to read ends the pass.
    expect(idle).toHaveLength(0)
  })

  it('abandons the read on its way when stopped, and reads that session again next pass', async () => {
    const { prefetcher, idle, reads, installed, runIdle, answer } = harness(rows(2))
    prefetcher.start()
    await runIdle()
    prefetcher.stop()
    expect(reads[0].signal.aborted).toBe(true)
    await settle()
    expect(installed).toEqual([])
    expect(idle).toHaveLength(0)

    prefetcher.start()
    await runIdle()
    expect(reads[1].session.id).toBe('s0')
    await answer(reads[1])
    expect(installed).toEqual(['s0'])
  })

  it('does not start a read once stopped while waiting for the page to be idle', async () => {
    const { prefetcher, idle, reads } = harness(rows(2))
    prefetcher.start()
    prefetcher.stop()
    expect(idle).toHaveLength(0)
    expect(reads).toHaveLength(0)
  })

  it('ends a pass once its answers come to the budget, and starts the next with a new one', async () => {
    const { prefetcher, idle, reads, installed, runIdle, answer } = harness(rows(5), {
      size: () => 1_000,
      budget: 2_500,
    })
    prefetcher.start()
    for (let index = 0; index < 3; index += 1) {
      await runIdle()
      await answer(reads[index])
    }
    expect(installed).toEqual(['s0', 's1', 's2'])
    expect(idle).toHaveLength(0)
    // Asking again within the same pass changes nothing.
    prefetcher.start()
    expect(idle).toHaveLength(0)

    prefetcher.stop()
    prefetcher.start()
    await runIdle()
    await answer(reads[3])
    expect(installed).toEqual(['s0', 's1', 's2', 's3'])
  })

  it('moves past a session whose read fails, trying it once a pass', async () => {
    const { prefetcher, reads, installed, runIdle, answer } = harness(rows(2))
    prefetcher.start()
    await runIdle()
    reads[0].reject(new Error('unreachable'))
    await settle()
    await runIdle()
    expect(reads[1].session.id).toBe('s1')
    await answer(reads[1])
    expect(installed).toEqual(['s1'])
    expect(reads).toHaveLength(2)

    prefetcher.stop()
    prefetcher.start()
    await runIdle()
    expect(reads[2].session.id).toBe('s0')
  })
})
