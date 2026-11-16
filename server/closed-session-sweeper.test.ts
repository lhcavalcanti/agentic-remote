import { afterEach, describe, expect, it, vi } from 'vitest'
import { ClosedSessionSweeper } from './closed-session-sweeper.js'

const day = 86_400_000
const now = Date.parse('2026-11-20T00:00:00.000Z')
const closedDaysAgo = (days: number) => new Date(now - days * day).toISOString()

function closedSessions(closed: { id: string; closedAt: string }[]) {
  const remaining = new Map(closed.map((session) => [session.id, session]))
  return {
    remaining,
    listClosedSessions: () => [...remaining.values()],
    deleteExpiredClosedSession: vi.fn(async (id: string, closedBefore: number) => {
      const session = remaining.get(id)
      if (!session || Date.parse(session.closedAt) > closedBefore) return false
      remaining.delete(id)
      return true
    }),
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('closed session retention sweep', () => {
  it('deletes only sessions closed fourteen days ago or more, oldest first, a bounded number per pass', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const sessions = closedSessions([
      { id: 'recent', closedAt: closedDaysAgo(13) },
      { id: 'just-expired', closedAt: closedDaysAgo(14) },
      { id: 'oldest', closedAt: closedDaysAgo(30) },
      { id: 'older', closedAt: closedDaysAgo(20) },
    ])
    const sweeper = new ClosedSessionSweeper(sessions, { now: () => now, limit: 2 })

    await sweeper.sweep()
    expect(sessions.deleteExpiredClosedSession.mock.calls.map(([id]) => id)).toEqual(['oldest', 'older'])
    await sweeper.sweep()

    expect([...sessions.remaining.keys()]).toEqual(['recent'])
    expect(sessions.deleteExpiredClosedSession).toHaveBeenLastCalledWith('just-expired', now - 14 * day)
    expect(info).toHaveBeenCalledWith(JSON.stringify({
      sessionLifecycle: 'expired', sessionId: 'oldest', at: new Date(now).toISOString(),
    }))
  })

  it('logs a deletion that fails and tries it again on the next pass', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const sessions = closedSessions([
      { id: 'stuck', closedAt: closedDaysAgo(20) },
      { id: 'fine', closedAt: closedDaysAgo(15) },
    ])
    sessions.deleteExpiredClosedSession.mockRejectedValueOnce(new Error('provider busy'))
    const sweeper = new ClosedSessionSweeper(sessions, { now: () => now })

    await sweeper.sweep()
    expect([...sessions.remaining.keys()]).toEqual(['stuck'])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"sessionId":"stuck"'))
    await sweeper.sweep()

    expect(sessions.remaining.size).toBe(0)
  })

  it('sweeps when started and every interval after, and stops after the pass in flight', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const sessions = closedSessions([])
    const list = vi.spyOn(sessions, 'listClosedSessions')
    const sweeper = new ClosedSessionSweeper(sessions, { now: () => now, intervalMs: 1_000 })

    sweeper.start()
    await vi.waitFor(() => expect(list).toHaveBeenCalledTimes(1))
    let release = () => {}
    sessions.remaining.set('expired', { id: 'expired', closedAt: closedDaysAgo(20) })
    sessions.deleteExpiredClosedSession.mockImplementationOnce(async () => {
      await new Promise<void>((resolve) => { release = resolve })
      return true
    })
    vi.advanceTimersByTime(1_000)
    await vi.waitFor(() => expect(sessions.deleteExpiredClosedSession).toHaveBeenCalledOnce())
    let stopped = false
    const stopping = sweeper.stop().then(() => { stopped = true })
    await Promise.resolve()
    expect(stopped).toBe(false)
    release()
    await stopping
    vi.advanceTimersByTime(5_000)

    expect(list).toHaveBeenCalledTimes(2)
  })
})
