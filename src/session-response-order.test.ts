import { describe, expect, it } from 'vitest'
import type { ManagedSession } from '../shared/contracts'
import {
  carrySnapshotTranscripts,
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

  it('does not erase a newer queue wait with an older same-revision response', () => {
    const incoming = rememberSessionResponse({ ...session }, currentSessionEventSequence())
    const eventAt = nextSessionEventSequence()
    const queueState = {
      state: 'waiting' as const,
      promptId: 'queued',
      message: 'Waiting for the terminal composer. Delivery will retry automatically.',
      updatedAt: '2026-09-06T00:00:01Z',
    }
    expect(projectSessionResponse(incoming, { ...session, queueState }, eventAt).queueState)
      .toEqual(queueState)
  })

  it('keeps the newer recovery acknowledgement state over an older same-revision response', () => {
    const unaccepted = rememberSessionResponse({ ...session, failedPrompt: failure }, currentSessionEventSequence())
    let eventAt = nextSessionEventSequence()
    const held = projectSessionResponse(
      unaccepted, { ...session, recoveryAcknowledgementPending: true }, eventAt,
    )
    expect(held.failedPrompt).toBeUndefined()
    expect(held.recoveryAcknowledgementPending).toBe(true)

    const pending = rememberSessionResponse(
      { ...session, recoveryAcknowledgementPending: true }, currentSessionEventSequence(),
    )
    eventAt = nextSessionEventSequence()
    expect(projectSessionResponse(pending, { ...session }, eventAt).recoveryAcknowledgementPending)
      .toBeUndefined()
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

describe('Snapshot transcripts', () => {
  const held = [{ id: 'm1', role: 'assistant' as const, content: 'Held history', createdAt: session.updatedAt }]
  const open = { ...session, messages: held }

  it('keeps a transcript the browser already holds when a summary carries none', () => {
    const [row] = carrySnapshotTranscripts([{ ...session, messages: [] }], [open])
    expect(row.messages).toEqual(held)
  })

  it('carries a held window, with where it starts and what it carries, onto a summary', () => {
    const carried = [{ id: 'm0', role: 'activity' as const, content: 'Still running', createdAt: session.updatedAt, activityStatus: 'running' as const }]
    const windowed = { ...open, messagesStart: 40, messagesTotal: 41, carriedMessages: carried }
    const [row] = carrySnapshotTranscripts([{ ...session, title: 'Renamed', messages: [] }], [windowed])
    expect(row).toMatchObject({ title: 'Renamed', messages: held, messagesStart: 40, messagesTotal: 41, carriedMessages: carried })
  })

  it('leaves a row that carries its own transcript alone', () => {
    const own = [{ id: 'm2', role: 'user' as const, content: 'Newer', createdAt: session.updatedAt }]
    const [row] = carrySnapshotTranscripts([{ ...session, messages: own }], [open])
    expect(row.messages).toEqual(own)
  })

  it('does not lend a transcript to a different session or computer', () => {
    const other = { ...session, id: 'replacement' }
    const elsewhere = { ...session, computerId: 'other-computer' }
    expect(carrySnapshotTranscripts([other], [open])[0].messages).toEqual([])
    expect(carrySnapshotTranscripts([elsewhere], [open])[0].messages).toEqual([])
  })

  it('leaves an emptied conversation empty once its own response has landed', () => {
    // Clearing answers authoritatively, so the browser already holds nothing
    // by the time a snapshot built from it arrives.
    const cleared = { ...session, messages: [] }
    expect(carrySnapshotTranscripts([{ ...session, messages: [] }], [cleared])[0].messages).toEqual([])
  })

  it('returns the rows unchanged when none of them is missing a transcript', () => {
    const rows = [{ ...session, messages: held }]
    expect(carrySnapshotTranscripts(rows, [open])).toBe(rows)
  })
})
