import { describe, expect, it } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import { SessionUnreadTracker } from './session-unread-tracker.js'

function upserted(change: Partial<ManagedSession> = {}): HubEvent {
  return {
    type: 'session.upserted',
    session: {
      id: 'a',
      computerId: 'node',
      computerName: 'Build node',
      title: 'Synthetic check',
      cwd: '/home/demo',
      updatedAt: '2026-11-19T00:00:00Z',
      status: 'idle',
      messages: [],
      ...change,
    },
  }
}

/** Feeds the statuses in order and reports which events finished a turn. */
function finished(tracker: SessionUnreadTracker, ...events: HubEvent[]): boolean[] {
  return events.map((event) => tracker.observe(event) !== undefined)
}

describe('SessionUnreadTracker', () => {
  it('reports the session whose turn just ended', () => {
    const tracker = new SessionUnreadTracker()
    expect(tracker.observe(upserted({ status: 'running' }))).toBeUndefined()
    expect(tracker.observe(upserted({ status: 'idle' }))).toEqual({
      computerId: 'node',
      sessionId: 'a',
    })
    // Hearing about the same idle session again is not another ending.
    expect(tracker.observe(upserted({ status: 'idle' }))).toBeUndefined()
  })

  it('counts a turn that ends after waiting on you', () => {
    expect(finished(
      new SessionUnreadTracker(),
      upserted({ status: 'waiting' }),
      upserted({ status: 'idle' }),
    )).toEqual([false, true])
  })

  it('does not count an idle session that still needs you or has more queued', () => {
    const tracker = new SessionUnreadTracker()
    expect(finished(
      tracker,
      upserted({ status: 'running' }),
      upserted({
        status: 'idle',
        pendingPermission: { requestId: 'permission', title: 'Run tests', options: [] },
      }),
      upserted({ status: 'running' }),
      upserted({
        status: 'idle',
        pendingUserInput: {
          requestId: 'question', question: 'Which file?', choices: [], allowFreeform: true,
        },
      }),
      upserted({ status: 'running' }),
      upserted({ status: 'idle', queuedCount: 1 }),
    )).toEqual([false, false, false, false, false, false])
  })

  it('counts a session that fails, from any other status', () => {
    expect(finished(
      new SessionUnreadTracker(),
      upserted({ status: 'idle' }),
      upserted({ status: 'error' }),
      upserted({ status: 'error' }),
      upserted({ status: 'running' }),
      upserted({ status: 'error' }),
    )).toEqual([false, true, false, false, true])
  })

  it('does not count a session it sees for the first time', () => {
    const tracker = new SessionUnreadTracker()
    expect(finished(
      tracker,
      upserted({ id: 'idle-at-start', status: 'idle' }),
      upserted({ id: 'failed-at-start', status: 'error' }),
    )).toEqual([false, false])
  })

  it('forgets a removed session, and every session of an unpaired computer', () => {
    const tracker = new SessionUnreadTracker()
    finished(
      tracker,
      upserted({ id: 'a', status: 'running' }),
      upserted({ id: 'b', status: 'running' }),
      upserted({ id: 'c', computerId: 'other', status: 'running' }),
    )
    tracker.observe({ type: 'session.removed', computerId: 'node', sessionId: 'a', closed: true })
    tracker.observe({ type: 'computer.removed', computerId: 'other' })

    // Seen again, each is new: nothing says how its last turn went.
    expect(finished(
      tracker,
      upserted({ id: 'a', status: 'idle' }),
      upserted({ id: 'c', computerId: 'other', status: 'idle' }),
      upserted({ id: 'b', status: 'idle' }),
    )).toEqual([false, false, true])
  })

  it('keeps sessions with the same id on different computers apart', () => {
    const tracker = new SessionUnreadTracker()
    expect(finished(
      tracker,
      upserted({ computerId: 'hub', status: 'running' }),
      upserted({ computerId: 'node', status: 'idle' }),
      upserted({ computerId: 'hub', status: 'idle' }),
    )).toEqual([false, false, true])
  })
})
