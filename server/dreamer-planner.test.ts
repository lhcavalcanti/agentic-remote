import { describe, expect, it, vi } from 'vitest'
import {
  activeDreamerMemoryIds,
  planDreamer,
} from './dreamer-planner.js'

describe('Dreamer planner', () => {
  it('prioritizes metadata-only session evidence and never persists source text', () => {
    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        {
          computerId: 'computer-a',
          sessionId: 'waiting-session',
          status: 'waiting',
          lastSeenAt: '2026-10-29T03:00:00.000Z',
        },
        {
          computerId: 'computer-a',
          sessionId: 'error-session',
          status: 'error',
          lastSeenAt: '2026-10-29T03:00:00.000Z',
        },
        {
          computerId: 'computer-a',
          sessionId: 'secret-session',
          status: 'running',
          lastSeenAt: '2026-10-29T03:00:00.000Z',
          title: 'TOP SECRET TITLE',
          task: 'TOP SECRET PROMPT',
          cwd: '/private/secret/project',
        },
        {
          computerId: 'computer-a',
          sessionId: 'removed-session',
          status: 'error',
          lastSeenAt: '2026-10-29T03:00:00.000Z',
          removedAt: '2026-10-29T03:30:00.000Z',
        },
      ],
      memory: {
        mode: 'on',
        available: true,
        records: [{
          id: 'memory-a',
          kind: 'outcome',
          scope: { type: 'user' },
          authority: 'verified-outcome',
          confidence: 0.9,
          createdAt: '2026-10-28T03:00:00.000Z',
          updatedAt: '2026-10-29T03:00:00.000Z',
        }],
        tombstones: [],
      },
    })

    expect(result.items.map(({ sessionId, memoryId }) => ({ sessionId, memoryId })))
      .toEqual([
        { sessionId: 'error-session', memoryId: undefined },
        { sessionId: 'waiting-session', memoryId: undefined },
        { sessionId: 'secret-session', memoryId: undefined },
        { sessionId: undefined, memoryId: 'memory-a' },
      ])
    expect(result.items[0]).toMatchObject({
      label: 'Session needs attention',
      reason: 'Journal metadata reports an unresolved error.',
      source: 'session',
      status: 'pending',
    })
    expect(JSON.stringify(result)).not.toContain('TOP SECRET')
    expect(JSON.stringify(result)).not.toContain('/private/secret/project')
    expect(result.coverage).toEqual(expect.arrayContaining([
      'journal-metadata-only',
      'live-computer-state-unavailable',
      'background-todos-unavailable',
      'structured-memory-metadata',
    ]))
  })

  it('filters stale, future, tombstoned, superseded, expired, low-confidence, and invalid metadata', () => {
    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      staleAfterMs: 60 * 60 * 1000,
      sessions: [
        { computerId: 'c', sessionId: 'stale', status: 'error', lastSeenAt: '2026-10-28T00:00:00.000Z' },
        { computerId: 'c', sessionId: 'future', status: 'error', lastSeenAt: '2026-10-29T05:00:00.000Z' },
        { computerId: 'c', sessionId: 'closed', status: 'closed', lastSeenAt: '2026-10-29T03:00:00.000Z' },
        { computerId: '', sessionId: 'invalid', status: 'error', lastSeenAt: '2026-10-29T03:00:00.000Z' },
      ],
      memory: {
        mode: 'on',
        available: true,
        records: [
          { id: 'tombstoned', kind: 'fact', scope: { type: 'user' }, authority: 'direct-user', confidence: 1, createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-29T03:00:00.000Z' },
          { id: 'superseded', kind: 'fact', scope: { type: 'user' }, authority: 'direct-user', confidence: 1, createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-29T03:00:00.000Z', supersededById: 'newer' },
          { id: 'expired', kind: 'fact', scope: { type: 'user' }, authority: 'direct-user', confidence: 1, createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-29T03:00:00.000Z', validUntil: '2026-10-29T03:00:00.000Z' },
          { id: 'future-memory', kind: 'fact', scope: { type: 'user' }, authority: 'direct-user', confidence: 1, createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-29T05:00:00.000Z' },
          { id: 'low-confidence', kind: 'fact', scope: { type: 'user' }, authority: 'inference', confidence: 0.1, createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-29T03:00:00.000Z' },
        ],
        tombstones: [{ recordId: 'tombstoned' }],
      },
    })

    expect(result.items).toEqual([])
    expect(result.coverage).toEqual(expect.arrayContaining([
      'stale-metadata',
      'future-metadata',
      'closed-metadata',
      'invalid-scope',
      'tombstoned-memory',
      'superseded-memory',
      'expired-memory',
      'low-confidence-memory',
    ]))
  })

  it('carries pending review items in order and does not resurrect unchanged done or skipped evidence', () => {
    const prior = {
      items: [
        {
          id: 'carry-item',
          label: 'Session needs attention',
          reason: 'Journal metadata reports an unresolved error.',
          status: 'pending' as const,
          source: 'session' as const,
          computerId: 'c',
          sessionId: 'carry',
          fingerprint: 'carry-fingerprint',
        },
      ],
      history: [
        { fingerprint: 'done-fingerprint', status: 'done' as const },
        { fingerprint: 'skipped-fingerprint', status: 'skipped' as const },
      ],
    }
    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        { computerId: 'c', sessionId: 'carry', status: 'error', lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'carry-fingerprint' },
        { computerId: 'c', sessionId: 'done', status: 'error', lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'done-fingerprint' },
        { computerId: 'c', sessionId: 'skip', status: 'waiting', lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'skipped-fingerprint' },
        { computerId: 'c', sessionId: 'new', status: 'running', lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'new-fingerprint' },
      ],
      previous: prior,
    })

    expect(result.items.map(({ id, source, sessionId, status }) => ({ id, source, sessionId, status })))
      .toEqual([
        { id: 'carry-item', source: 'carry', sessionId: 'carry', status: 'pending' },
        { id: expect.any(String), source: 'session', sessionId: 'new', status: 'pending' },
      ])
  })

  it('reports overflow but refuses to drop pending carry items', () => {
    const pending = Array.from({ length: 20 }, (_, index) => ({
      id: `carry-${index}`,
      label: 'Session needs attention',
      reason: 'Journal metadata reports an unresolved error.',
      status: 'pending' as const,
      source: 'session' as const,
      computerId: 'c',
      sessionId: `carry-${index}`,
      fingerprint: `carry-fingerprint-${index}`,
    }))
    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        { computerId: 'c', sessionId: 'new', status: 'error', lastSeenAt: '2026-10-29T03:00:00.000Z' },
      ],
      previous: { items: pending, history: [] },
    })
    expect(result.items).toHaveLength(20)
    expect(result.items.every(({ source }) => source === 'carry')).toBe(true)
    expect(result.omitted).toBe(1)
    expect(result.coverage).toContain('overflow')
  })

  it('does not carry a pending memory reference after it is forgotten or superseded', () => {
    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions: [],
      memory: {
        mode: 'on',
        available: true,
        records: [{
          id: 'memory-new',
          kind: 'fact',
          scope: { type: 'user' },
          authority: 'direct-user',
          confidence: 1,
          createdAt: '2026-10-28T00:00:00.000Z',
          updatedAt: '2026-10-29T03:00:00.000Z',
          supersededById: 'memory-later',
        }],
        tombstones: [{ recordId: 'memory-old' }],
      },
      previous: {
        items: [{
          id: 'old-memory-item',
          label: 'Memory item needs review',
          reason: 'Structured-memory metadata identifies an active review candidate.',
          status: 'pending',
          source: 'memory',
          memoryId: 'memory-old',
          fingerprint: 'old-memory-fingerprint',
        }],
        history: [],
      },
    })
    expect(result.items).toEqual([])
    expect(result.coverage).toContain('memory-reference-stale')
  })

  it('preindexes large tombstone metadata instead of scanning tombstones per record', () => {
    const records = Array.from({ length: 10_000 }, (_, index) => ({
      id: `memory-${index}`,
      kind: 'fact' as const,
      scope: { type: 'user' as const },
      authority: 'direct-user' as const,
      confidence: 1,
      createdAt: '2026-10-28T00:00:00.000Z',
      updatedAt: '2026-10-29T03:00:00.000Z',
    }))
    const tombstones = Array.from(
      { length: 20_000 },
      (_, index) => ({ recordId: `forgotten-${index}` }),
    )
    Object.defineProperty(tombstones, 'some', {
      value: () => {
        throw new Error('per-record tombstone scan')
      },
    })

    expect(() => activeDreamerMemoryIds({
      mode: 'on',
      available: true,
      records,
      tombstones,
    }, new Date('2026-10-29T04:00:00.000Z'))).not.toThrow()
  })

  it('precomputes session ranks without scanning all sessions during candidate sorting', () => {
    const sessions = Array.from({ length: 10_000 }, (_, index) => ({
      computerId: `computer-${index % 10}`,
      sessionId: `session-${index}`,
      status: index === 9_999 ? 'error' as const : 'running' as const,
      lastSeenAt: '2026-10-29T03:00:00.000Z',
    }))
    const find = vi.spyOn(sessions, 'find').mockImplementation(() => {
      throw new Error('candidate comparator scanned all sessions')
    })

    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions,
    })

    expect(find).not.toHaveBeenCalled()
    expect(result.items).toHaveLength(20)
    expect(result.items[0].sessionId).toBe('session-9999')
  })

  it('keeps session identities distinct when IDs contain the delimiter characters', () => {
    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        {
          computerId: 'a',
          sessionId: 'b:c',
          status: 'running',
          lastSeenAt: '2026-10-29T03:00:00.000Z',
        },
        {
          computerId: 'a:b',
          sessionId: 'c',
          status: 'error',
          lastSeenAt: '2026-10-29T03:00:00.000Z',
        },
      ],
    })

    expect(result.items.map(({ computerId, sessionId, status }) => ({
      computerId,
      sessionId,
      status,
    }))).toEqual([
      { computerId: 'a:b', sessionId: 'c', status: 'pending' },
      { computerId: 'a', sessionId: 'b:c', status: 'pending' },
    ])
  })
})
