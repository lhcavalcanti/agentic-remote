import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  countsAsRefusal,
  REFUSAL_OVERFLOW,
  RefusalCounter,
  refusalReasonFromError,
} from './refusal-metrics.js'
import { TerminalDraftConflictError } from './terminal-session.js'
import { RetainedSessionError } from './session-store.js'
import { RemoteNodeRequestError } from './remote-node-errors.js'
import { SubmissionError } from '../shared/submission-error.js'

const route = '/api/computers/:computerId/sessions/:sessionId/messages'

function clock(start = Date.parse('2026-10-20T00:00:00.000Z')) {
  let current = start
  return {
    now: () => new Date(current),
    advance: (ms: number) => {
      current += ms
    },
  }
}

describe('RefusalCounter', () => {
  it('counts each key with first and last timestamps since a start time', () => {
    const time = clock()
    const counter = new RefusalCounter({
      now: time.now,
      since: new Date('2026-10-19T23:00:00.000Z'),
    })
    counter.record({ route, method: 'POST', status: 409, reason: 'terminal-draft-conflict.new-text' })
    time.advance(5_000)
    counter.record({ route, method: 'POST', status: 409, reason: 'terminal-draft-conflict.new-text' })

    expect(counter.snapshot()).toEqual({
      since: '2026-10-19T23:00:00.000Z',
      refusals: [{
        route,
        method: 'POST',
        status: 409,
        reason: 'terminal-draft-conflict.new-text',
        count: 2,
        firstAt: '2026-10-20T00:00:00.000Z',
        lastAt: '2026-10-20T00:00:05.000Z',
      }],
    })
  })

  it('keeps distinct keys apart and sorts by count, descending', () => {
    const counter = new RefusalCounter()
    const key = { route, method: 'POST', status: 400, reason: 'validation' }
    counter.record(key)
    for (let index = 0; index < 3; index += 1) counter.record({ ...key, status: 409, reason: 'http-409' })
    counter.record({ ...key, method: 'PUT' })
    counter.record({ ...key, method: 'PUT' })

    expect(counter.snapshot().refusals.map((entry) => [entry.method, entry.status, entry.count]))
      .toEqual([['POST', 409, 3], ['PUT', 400, 2], ['POST', 400, 1]])
  })

  it('bounds the number of distinct keys with an overflow bucket', () => {
    const counter = new RefusalCounter({ maxKeys: 3 })
    for (let index = 0; index < 10; index += 1) {
      counter.record({ route: `/api/r${index}`, method: 'GET', status: 404, reason: 'not-found' })
    }
    counter.record({ route: '/api/r0', method: 'GET', status: 404, reason: 'not-found' })

    const { refusals } = counter.snapshot()
    expect(refusals).toHaveLength(3)
    expect(refusals[0]).toMatchObject({ ...REFUSAL_OVERFLOW, count: 8 })
    expect(refusals.find((entry) => entry.route === '/api/r0')?.count).toBe(2)
    expect(refusals.find((entry) => entry.route === '/api/r1')?.count).toBe(1)
  })

  it('records only the key fields and returns copies', () => {
    const counter = new RefusalCounter()
    counter.record({
      route,
      method: 'POST',
      status: 409,
      reason: 'http-409',
      // A caller passing extra data must not get it stored.
      ...({ message: 'secret prompt', sessionId: 'session-1' } as object),
    })
    const snapshot = counter.snapshot()
    expect(Object.keys(snapshot.refusals[0]).sort())
      .toEqual(['count', 'firstAt', 'lastAt', 'method', 'reason', 'route', 'status'])
    snapshot.refusals[0].count = 99
    expect(counter.snapshot().refusals[0].count).toBe(1)
  })
})

describe('countsAsRefusal', () => {
  it('counts 401 and 403 only when the refusal named a reason', () => {
    expect(countsAsRefusal(403, route, true)).toBe(true)
    expect(countsAsRefusal(401, route, true)).toBe(true)
    expect(countsAsRefusal(403, route, false)).toBe(false)
    expect(countsAsRefusal(401, route, false)).toBe(false)
    expect(countsAsRefusal(404, undefined, true)).toBe(false)
    expect(countsAsRefusal(500, route, true)).toBe(false)
  })

  it('counts client refusals on matched routes but not auth failures or unknown routes', () => {
    expect(countsAsRefusal(400, route, false)).toBe(true)
    expect(countsAsRefusal(404, route, false)).toBe(true)
    expect(countsAsRefusal(409, route, false)).toBe(true)
    expect(countsAsRefusal(413, route, false)).toBe(true)
    expect(countsAsRefusal(401, route, false)).toBe(false)
    expect(countsAsRefusal(403, route, false)).toBe(false)
    expect(countsAsRefusal(404, undefined, false)).toBe(false)
    expect(countsAsRefusal(200, route, false)).toBe(false)
    expect(countsAsRefusal(302, route, false)).toBe(false)
    expect(countsAsRefusal(500, route, false)).toBe(false)
    expect(countsAsRefusal(503, route, false)).toBe(false)
  })
})

describe('refusalReasonFromError', () => {
  it('uses stable codes rather than messages', () => {
    const issues = z.object({ a: z.string() }).safeParse({})
    expect(refusalReasonFromError(issues.error, 400)).toBe('validation')
    expect(refusalReasonFromError(new TerminalDraftConflictError('new-text'), 409))
      .toBe('terminal-draft-conflict.new-text')
    expect(refusalReasonFromError(new TerminalDraftConflictError('unsent-text'), 409))
      .toBe('terminal-draft-conflict.unsent-text')
    expect(refusalReasonFromError(new RetainedSessionError('archived', 'sending'), 409))
      .toBe('retained-session.archived')
    expect(refusalReasonFromError(new RetainedSessionError('interrupted', 'sending'), 409))
      .toBe('retained-session.interrupted')
    expect(refusalReasonFromError(new RemoteNodeRequestError('x', 409, undefined, false, true), 409))
      .toBe('remote-node.terminal-draft-conflict')
    expect(refusalReasonFromError(new RemoteNodeRequestError('x', 409), 409))
      .toBe('RemoteNodeRequestError')
    expect(refusalReasonFromError(
      Object.assign(new Error('x'), { name: 'FastifyError', code: 'FST_ERR_CTP_BODY_TOO_LARGE' }),
      413,
    )).toBe('FST_ERR_CTP_BODY_TOO_LARGE')
  })

  it('takes a reason code from a wrapped cause before the wrapper class', () => {
    const wrapped = new SubmissionError('x', 409, undefined, {
      cause: new TerminalDraftConflictError('new-text'),
      terminalDraftConflict: true,
    })
    expect(refusalReasonFromError(wrapped, 409)).toBe('terminal-draft-conflict.new-text')
    const twice = new SubmissionError('x', 409, undefined, { cause: wrapped })
    expect(refusalReasonFromError(twice, 409)).toBe('terminal-draft-conflict.new-text')
    expect(refusalReasonFromError(
      new SubmissionError('x', 409, undefined, { cause: Object.assign(new Error('y'), { reasonCode: 'a b' }) }),
      409,
    )).toBe('SubmissionError')
    expect(refusalReasonFromError(
      new SubmissionError('x', 409, undefined, { cause: new Error('plain') }),
      409,
    )).toBe('SubmissionError')
  })

  it('stops at a bounded cause depth and survives cycles', () => {
    const cyclic: Error & { cause?: unknown } = new Error('loop')
    cyclic.cause = cyclic
    expect(refusalReasonFromError(cyclic, 409)).toBe('http-409')
    let deep: Error = Object.assign(new Error('root'), { reasonCode: 'deep.reason' })
    for (let index = 0; index < 10; index += 1) deep = new Error('wrapper', { cause: deep })
    expect(refusalReasonFromError(deep, 409)).toBe('http-409')
  })

  it('falls back to the status for plain errors and refuses unsafe names', () => {
    expect(refusalReasonFromError(Object.assign(new Error('Session 42 is gone'), { statusCode: 409 }), 409))
      .toBe('http-409')
    expect(refusalReasonFromError('a string', 400)).toBe('http-400')
    const named = new Error('x')
    named.name = 'Name with the prompt /home/user/secret'
    expect(refusalReasonFromError(named, 409)).toBe('http-409')
    expect(refusalReasonFromError(Object.assign(new Error('x'), { reasonCode: 'a b' }), 409))
      .toBe('http-409')
  })
})

describe('TerminalDraftConflictError', () => {
  it('keeps the refused send message and HTTP shape', () => {
    const error = new TerminalDraftConflictError('new-text')
    expect(error.message)
      .toBe('New terminal text appeared before the app draft could be sent. Nothing new was pasted.')
    expect(error).toMatchObject({
      name: 'TerminalDraftConflictError',
      statusCode: 409,
      uncertainDelivery: false,
      terminalDraftConflict: true,
      reasonCode: 'terminal-draft-conflict.new-text',
    })
  })
})
