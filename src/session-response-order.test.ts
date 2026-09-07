import { describe, expect, it } from 'vitest'
import type { ManagedSession } from '../shared/contracts'
import {
  currentSessionEventSequence,
  nextSessionEventSequence,
  projectSessionResponse,
  rememberSessionResponse,
  sessionResponseStartedAt,
} from './session-response-order'

const session: ManagedSession = {
  id: 'session', computerId: 'computer', computerName: 'Fixture',
  cwd: '/fixture', title: 'Fixture', status: 'idle', isOpen: true,
  revision: 6, updatedAt: '2026-09-06T00:00:00Z', messages: [],
}
const failure = { content: 'Accepted text', failedAt: 'resend:accepted', uncertain: true }

describe('Session response causal ordering', () => {
  it('preserves detail data while removing a recovery superseded by an equal-revision event', () => {
    const incoming = rememberSessionResponse({
      ...session, failedPrompt: failure,
      messages: [{ id: 'detail', role: 'assistant' as const, content: 'Hydrated history', createdAt: session.updatedAt }],
    }, currentSessionEventSequence())
    const eventAt = nextSessionEventSequence()
    const projected = projectSessionResponse(incoming, session, eventAt)
    expect(projected.failedPrompt).toBeUndefined()
    expect(projected.messages).toEqual(incoming.messages)
    expect(incoming.failedPrompt).toEqual(failure)
    expect(sessionResponseStartedAt(projected)).toBe(sessionResponseStartedAt(incoming))
  })

  it('allows the immediate same-revision event itself', () => {
    const eventAt = nextSessionEventSequence()
    expect(projectSessionResponse(session, { ...session, failedPrompt: failure }, eventAt))
      .toBe(session)
  })

  it('allows a fresh equal-revision read, including intentionally uncertain restart state', () => {
    const eventAt = nextSessionEventSequence()
    const incoming = rememberSessionResponse({ ...session, failedPrompt: failure }, currentSessionEventSequence())
    expect(projectSessionResponse(incoming, session, eventAt)).toBe(incoming)
  })

  it('preserves a different recovery delivered by a later equal-revision event', () => {
    const incoming = rememberSessionResponse({ ...session, failedPrompt: failure }, currentSessionEventSequence())
    const eventAt = nextSessionEventSequence()
    const newer = { content: 'New work', failedAt: 'resend:new-event', uncertain: true }
    expect(projectSessionResponse(incoming, { ...session, failedPrompt: newer }, eventAt).failedPrompt)
      .toEqual(newer)
  })

  it('allows a genuinely newer durable response even when its request began first', () => {
    const newer = { content: 'New work', failedAt: 'resend:new-response', uncertain: true }
    const incoming = rememberSessionResponse({ ...session, revision: 7, failedPrompt: newer }, currentSessionEventSequence())
    expect(projectSessionResponse(incoming, session, nextSessionEventSequence())).toBe(incoming)
  })

  it('does not erase a newer recovery with an older response that had no failure', () => {
    const incoming = rememberSessionResponse({ ...session }, currentSessionEventSequence())
    const eventAt = nextSessionEventSequence()
    expect(projectSessionResponse(incoming, { ...session, failedPrompt: failure }, eventAt).failedPrompt)
      .toEqual(failure)
  })

  it('does not cross session or computer ownership', () => {
    const incoming = rememberSessionResponse({ ...session, failedPrompt: failure }, currentSessionEventSequence())
    const eventAt = nextSessionEventSequence()
    expect(projectSessionResponse(incoming, { ...session, id: 'other' }, eventAt)).toBe(incoming)
    expect(projectSessionResponse(incoming, { ...session, computerId: 'other' }, eventAt)).toBe(incoming)
  })

  it('does not retain request provenance on a copied state observation', () => {
    const incoming = rememberSessionResponse({ ...session }, currentSessionEventSequence())
    expect(sessionResponseStartedAt({ ...incoming })).toBeUndefined()
    expect(sessionResponseStartedAt(incoming)).toBeDefined()
  })
})
