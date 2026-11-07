import { describe, expect, it } from 'vitest'
import type { ManagerMessage } from './manager.js'
import {
  notificationAllowed,
  notificationScopes,
  OracleNotifier,
  oracleNotificationTags,
  ORACLE_NOTIFICATION_URL,
} from './notifications.js'

function message(change: Partial<ManagerMessage> & Pick<ManagerMessage, 'id' | 'role'>): ManagerMessage {
  return { content: '', createdAt: '2026-10-18T00:00:00.000Z', ...change }
}

const event = (change: Parameters<typeof message>[0]) =>
  ({ type: 'manager.message', message: message(change) }) as const

describe('notificationAllowed', () => {
  it('sends everything by default, only Oracle in Oracle only, and nothing when disabled', () => {
    const matrix = Object.fromEntries(
      [undefined, ...notificationScopes].map((scope) => [
        scope ?? 'unset',
        (['session', 'alert', 'oracle'] as const).filter((category) => notificationAllowed(scope, category)),
      ]),
    )
    expect(matrix).toEqual({
      unset: ['session', 'alert', 'oracle'],
      all: ['session', 'alert', 'oracle'],
      oracle: ['oracle'],
      off: [],
    })
  })

  it('treats an unknown stored scope as the default rather than as silence', () => {
    expect(notificationAllowed('loud' as never, 'session')).toBe(true)
  })
})

describe('OracleNotifier', () => {
  it("announces Oracle's reply once, with a plain-text brief, when your message is done", () => {
    const oracle = new OracleNotifier()
    expect(oracle.next(event({ id: 'u1', role: 'user', content: 'Status?', state: 'running' }))).toBeUndefined()
    expect(oracle.next(event({
      id: 'a1', role: 'assistant', replyTo: 'u1',
      content: '**Two sessions** are running. [Docs](?computer=hub&session=s1) is `waiting` for you.',
    }))).toBeUndefined()
    expect(oracle.next(event({ id: 'u1', role: 'user', content: 'Status?', state: 'done' }))).toEqual({
      title: 'Oracle replied',
      body: 'Two sessions are running. Docs is waiting for you.',
      tag: 'agentic-oracle-reply',
      priority: 'normal',
      data: { url: ORACLE_NOTIFICATION_URL },
    })
    // The same state sent again, as on a later update, is not news.
    expect(oracle.next(event({ id: 'u1', role: 'user', content: 'Status?', state: 'done' }))).toBeUndefined()
  })

  it('keeps a long reply to a short brief and says something when there was no text', () => {
    const oracle = new OracleNotifier()
    oracle.next(event({ id: 'a1', role: 'assistant', replyTo: 'u1', content: `Done. ${'word '.repeat(80)}` }))
    const long = oracle.next(event({ id: 'u1', role: 'user', state: 'done' }))
    expect(long?.body.length).toBeLessThanOrEqual(140)
    expect(long?.body.endsWith('…')).toBe(true)
    expect(oracle.next(event({ id: 'u2', role: 'user', state: 'done' }))?.body)
      .toBe('Open Oracle to see what it did.')
  })

  it('announces a failure, and again if a retry fails too', () => {
    const oracle = new OracleNotifier()
    const failed = event({ id: 'u1', role: 'user', state: 'failed', error: 'Oracle could not answer: runtime gone. Your message is kept; press Retry.' })
    expect(oracle.next(failed)).toMatchObject({
      title: 'Oracle couldn’t answer',
      body: 'Oracle could not answer: runtime gone. Your message is kept; press Retry.',
      tag: 'agentic-oracle-reply',
      priority: 'normal',
    })
    expect(oracle.next(failed)).toBeUndefined()
    oracle.next(event({ id: 'u1', role: 'user', state: 'queued' }))
    expect(oracle.next(failed)).toBeDefined()
  })

  it('suppresses a scheduled result completed during its quiet hours', () => {
    const oracle = new OracleNotifier()
    oracle.next(event({
      id: 'a1',
      role: 'assistant',
      replyTo: 'scheduled-1',
      content: 'Nothing needs attention.',
    }))
    expect(oracle.next(event({
      id: 'scheduled-1',
      role: 'user',
      state: 'done',
      source: 'scheduled',
      suppressNotification: true,
    }))).toBeUndefined()
  })

  it('asks for your OK once, with high priority, when Oracle wants to close a session', () => {
    const oracle = new OracleNotifier()
    const pending = event({
      id: 'c1', role: 'activity', tool: 'close_session',
      content: 'Close "Docs"? This permanently deletes it and its history.',
      confirmation: { kind: 'close-session', computerId: 'hub', sessionId: 's1', title: 'Docs', state: 'pending' },
    })
    expect(oracle.next(pending)).toEqual({
      title: 'Oracle needs your OK',
      body: 'Close "Docs"? This permanently deletes it and its history.',
      tag: 'agentic-oracle-confirm',
      priority: 'high',
      data: { url: ORACLE_NOTIFICATION_URL },
    })
    expect(oracle.next(pending)).toBeUndefined()
    expect(oracle.next({
      ...pending,
      message: { ...pending.message, confirmation: { ...pending.message.confirmation!, state: 'confirmed' } },
    })).toBeUndefined()
  })

  it('stays quiet for a stopped message, ordinary activity, streaming, and status', () => {
    const oracle = new OracleNotifier()
    expect(oracle.next(event({ id: 'u1', role: 'user', state: 'cancelled' }))).toBeUndefined()
    expect(oracle.next(event({ id: 'x1', role: 'activity', tool: 'create_session', content: 'Started "Docs"' }))).toBeUndefined()
    expect(oracle.next({ type: 'manager.delta', messageId: 'a1', content: 'Hel' })).toBeUndefined()
    expect(oracle.next({ type: 'manager.status', status: 'working', queued: 0 })).toBeUndefined()
  })

  it('forgets everything when the conversation starts over', () => {
    const oracle = new OracleNotifier()
    oracle.next(event({ id: 'u1', role: 'user', state: 'done' }))
    oracle.next({
      type: 'manager.reset',
      snapshot: { available: true, status: 'idle', messages: [], queued: 0, managedSessions: [] },
    })
    expect(oracle.next(event({ id: 'u1', role: 'user', state: 'done' }))).toBeDefined()
  })

  it('names every tag it uses, so opening Oracle can clear them', () => {
    expect([...oracleNotificationTags].sort()).toEqual(['agentic-oracle-confirm', 'agentic-oracle-reply'])
  })
})
