import { describe, expect, it } from 'vitest'
import {
  VoiceTicketStore,
  type VoiceTicketClient,
} from './oracle-voice-tickets.js'

function clock(start = Date.parse('2026-10-17T00:00:00.000Z')) {
  let current = start
  return {
    now: () => current,
    advance: (milliseconds: number) => {
      current += milliseconds
    },
  }
}

const client: VoiceTicketClient = {
  origin: 'https://hub.test',
  address: '10.0.0.4',
}

describe('VoiceTicketStore', () => {
  it('normalizes the client binding and consumes a ticket exactly once', () => {
    const time = clock()
    const tickets = new VoiceTicketStore({ ttlMs: 30_000, now: time.now })
    const ticket = tickets.issue({
      origin: 'https://HUB.test:443/',
      address: ' ::ffff:10.0.0.4 ',
    })

    expect(tickets.consume(ticket, client)).toEqual({
      expiresAt: Date.parse('2026-10-17T00:00:30.000Z'),
    })
    expect(tickets.consume(ticket, client)).toBeUndefined()
  })

  it('expires tickets and prunes them at the lifetime boundary', () => {
    const time = clock()
    const tickets = new VoiceTicketStore({ ttlMs: 30_000, now: time.now })
    const ticket = tickets.issue(client)

    time.advance(30_000)

    expect(tickets.consume(ticket, client)).toBeUndefined()
  })

  it('binds tickets to both origin and address and burns a mismatched attempt', () => {
    const tickets = new VoiceTicketStore()
    const wrongOrigin = tickets.issue(client)
    const wrongAddress = tickets.issue(client)

    expect(tickets.consume(wrongOrigin, {
      ...client,
      origin: 'https://other.test',
    })).toBeUndefined()
    expect(tickets.consume(wrongOrigin, client)).toBeUndefined()

    expect(tickets.consume(wrongAddress, {
      ...client,
      address: '10.0.0.5',
    })).toBeUndefined()
    expect(tickets.consume(wrongAddress, client)).toBeUndefined()
  })

  it('keeps at most 64 outstanding tickets and evicts the oldest', () => {
    let token = 0
    const tickets = new VoiceTicketStore({
      randomBytes: () => Buffer.from(String(token++).padStart(32, '0')),
    })
    const issued = Array.from({ length: 65 }, () => tickets.issue(client))

    expect(tickets.consume(issued[0], client)).toBeUndefined()
    for (const ticket of issued.slice(1)) {
      expect(tickets.consume(ticket, client)).toBeTruthy()
    }
  })

  it('rejects malformed client bindings before issuing a bearer value', () => {
    const tickets = new VoiceTicketStore()

    expect(() => tickets.issue({ ...client, origin: 'null' }))
      .toThrow('valid HTTP origin')
    expect(() => tickets.issue({ ...client, address: 'not-an-address' }))
      .toThrow('valid remote address')
  })

  it('does not allow configuration to raise the 64-ticket security cap', () => {
    expect(() => new VoiceTicketStore({ maxOutstanding: 65 }))
      .toThrow('must not exceed 64')
  })
})
