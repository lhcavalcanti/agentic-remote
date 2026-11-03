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
      'Excluded 1 generic open-session metadata entry without an actionable source.',
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
      'Excluded 1 session proposal with invalid identity.',
      'Excluded 1 closed session proposal.',
      'Excluded 1 future-dated session proposal.',
      'Excluded 1 stale session proposal.',
      'tombstoned-memory',
      'superseded-memory',
      'expired-memory',
      'low-confidence-memory',
    ]))
  })

  it('carries pending review items in order and does not resurrect unchanged done or skipped evidence', () => {
    const sessions = [
      { computerId: 'c', sessionId: 'carry', status: 'error' as const, lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'carry-fingerprint' },
      { computerId: 'c', sessionId: 'done', status: 'error' as const, lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'done-fingerprint' },
      { computerId: 'c', sessionId: 'skip', status: 'waiting' as const, lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'skipped-fingerprint' },
    ]
    const seeded = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions,
    })
    const seededBySession = new Map(seeded.items.map((item) => [item.sessionId, item]))
    const prior = {
      items: [
        {
          ...seededBySession.get('carry')!,
          status: 'pending' as const,
        },
      ],
      history: [
        { fingerprint: seededBySession.get('done')!.fingerprint, status: 'done' as const },
        { fingerprint: seededBySession.get('skip')!.fingerprint, status: 'skipped' as const },
      ],
    }
    const result = planDreamer({
      now: new Date('2026-10-29T04:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        ...sessions,
        { computerId: 'c', sessionId: 'new', status: 'running', lastSeenAt: '2026-10-29T03:00:00.000Z', fingerprint: 'new-fingerprint' },
      ],
      previous: prior,
    })

    expect(result.items.map(({ id, source, sessionId, status }) => ({ id, source, sessionId, status })))
      .toEqual([
        { id: expect.any(String), source: 'carry', sessionId: 'carry', status: 'pending' },
      ])
  })

  it('preserves an actionable session carry while excluding newly generic sessions', () => {
    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        {
          computerId: 'computer-a',
          sessionId: 'carried-session',
          status: 'running',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
        },
        {
          computerId: 'computer-a',
          sessionId: 'new-idle-session',
          status: 'idle',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
        },
      ],
      previous: {
        items: [{
          id: 'legacy-carried-session',
          label: 'Session needs attention',
          reason: 'Journal metadata reports an unresolved error.',
          status: 'pending',
          source: 'session',
          computerId: 'computer-a',
          sessionId: 'carried-session',
          fingerprint: 'previous-error-state',
        }],
        history: [],
      },
    })

    expect(result.items).toEqual([
      expect.objectContaining({
        id: expect.stringMatching(/^session-/),
        label: 'Session needs attention',
        source: 'carry',
        sessionId: 'carried-session',
      }),
    ])
    expect(result.coverage).toContain(
      'Excluded 1 generic open-session metadata entry without an actionable source.',
    )
    expect(result.coverage).not.toContain('historical-session-orphan')
  })

  it('preserves interleaved session and memory carry order', () => {
    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        {
          computerId: 'computer-a',
          sessionId: 'session-one',
          status: 'error',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
        },
        {
          computerId: 'computer-a',
          sessionId: 'session-two',
          status: 'waiting',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
        },
      ],
      memory: {
        mode: 'on',
        available: true,
        records: [{
          id: 'memory-one',
          kind: 'outcome',
          scope: { type: 'user' },
          authority: 'verified-outcome',
          confidence: 1,
          createdAt: '2026-11-01T18:00:00.000Z',
          updatedAt: '2026-11-02T17:00:00.000Z',
        }],
        tombstones: [],
      },
      previous: {
        items: [
          {
            id: 'old-session-one',
            label: 'Session needs attention',
            reason: 'Previous session review.',
            status: 'pending',
            source: 'session',
            computerId: 'computer-a',
            sessionId: 'session-one',
            fingerprint: 'old-session-one',
          },
          {
            id: 'old-memory-one',
            label: 'Memory item needs review',
            reason: 'Previous memory review.',
            status: 'pending',
            source: 'memory',
            memoryId: 'memory-one',
            fingerprint: 'old-memory-one',
          },
          {
            id: 'old-session-two',
            label: 'Session is waiting',
            reason: 'Previous session review.',
            status: 'pending',
            source: 'session',
            computerId: 'computer-a',
            sessionId: 'session-two',
            fingerprint: 'old-session-two',
          },
        ],
        history: [],
      },
    })

    expect(result.items.map(({ sessionId, memoryId }) => sessionId ?? memoryId))
      .toEqual(['session-one', 'memory-one', 'session-two'])
  })

  it('does not deduplicate a memory candidate against an identity-less carry', () => {
    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [],
      memory: {
        mode: 'on',
        available: true,
        records: [{
          id: 'memory-a',
          kind: 'fact',
          scope: { type: 'user' },
          authority: 'direct-user',
          confidence: 1,
          createdAt: '2026-11-01T18:00:00.000Z',
          updatedAt: '2026-11-02T17:00:00.000Z',
        }],
        tombstones: [],
      },
      previous: {
        items: [{
          id: 'identity-less-carry',
          label: 'Review prior plan item',
          reason: 'This carry has no source identity.',
          status: 'pending',
          source: 'carry',
          fingerprint: 'identity-less-carry',
        }],
        history: [],
      },
    })

    expect(result.items.map(({ id, memoryId }) => ({ id, memoryId }))).toEqual([
      { id: 'identity-less-carry', memoryId: undefined },
      { id: expect.stringMatching(/^memory-/), memoryId: 'memory-a' },
    ])
  })

  it('does not deduplicate distinct session identities with the same fingerprint', () => {
    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        {
          computerId: 'computer-a',
          sessionId: 'session-one',
          status: 'error',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
          fingerprint: 'shared-fingerprint',
        },
        {
          computerId: 'computer-a',
          sessionId: 'session-two',
          status: 'error',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
          fingerprint: 'shared-fingerprint',
        },
      ],
      previous: {
        items: [{
          id: 'old-session-one',
          label: 'Session needs attention',
          reason: 'Previous session review.',
          status: 'pending',
          source: 'session',
          computerId: 'computer-a',
          sessionId: 'session-one',
          fingerprint: 'old-session-one',
        }],
        history: [],
      },
    })

    expect(result.items.map(({ sessionId }) => sessionId))
      .toEqual(['session-one', 'session-two'])
  })

  it('does not let completed history suppress a different session with the same source fingerprint', () => {
    const first = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [{
        computerId: 'computer-a',
        sessionId: 'session-one',
        status: 'error',
        lastSeenAt: '2026-11-02T17:55:00.000Z',
        fingerprint: 'shared-fingerprint',
      }],
    })
    const completed = {
      ...first.items[0],
      status: 'done' as const,
    }

    const second = planDreamer({
      now: new Date('2026-11-02T18:05:00.000Z'),
      registryAvailable: true,
      sessions: [{
        computerId: 'computer-a',
        sessionId: 'session-two',
        status: 'error',
        lastSeenAt: '2026-11-02T18:00:00.000Z',
        fingerprint: 'shared-fingerprint',
      }],
      previous: { items: [completed], history: [] },
    })

    expect(second.items.map(({ sessionId }) => sessionId)).toEqual(['session-two'])
  })

  it('counts historical session orphans instead of repeating a symbolic exclusion', () => {
    const previousItems = ['orphan-one', 'orphan-two'].map((sessionId) => ({
      id: `old-${sessionId}`,
      label: 'Session needs attention',
      reason: 'Previous session review.',
      status: 'pending' as const,
      source: 'session' as const,
      computerId: 'computer-a',
      sessionId,
      fingerprint: `old-${sessionId}`,
    }))
    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [],
      previous: { items: previousItems, history: [] },
    })

    expect(result.items).toEqual([])
    expect(result.coverage).toContain('Excluded 2 historical session orphans.')
    expect(result.coverage).not.toContain('historical-session-orphan')
  })

  it('deduplicates reported session identities across current metadata and stale carried proposals', () => {
    const sessions = [
      '51a9d338-ec8f-4f3f-9f56-2de6c43519f7',
      '5932eac7-7370-4b17-a539-0cadf719f34b',
      '1b31e2dd-8810-46fc-884a-a3532b5b9148',
    ]
    const previousItems = sessions.flatMap((sessionId, index) => [
      {
        id: `old-${index}-a`,
        label: 'Open session review',
        reason: 'Journal metadata reports an open session.',
        status: 'pending' as const,
        source: 'session' as const,
        computerId: 'computer-a',
        sessionId,
        fingerprint: `old-${index}-a`,
      },
      {
        id: `old-${index}-b`,
        label: 'Open session review',
        reason: 'Journal metadata reports an open session.',
        status: 'pending' as const,
        source: 'carry' as const,
        computerId: 'computer-a',
        sessionId,
        fingerprint: `old-${index}-b`,
      },
    ])

    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: sessions.flatMap((sessionId) => [
        {
          computerId: 'computer-a',
          sessionId,
          status: 'waiting' as const,
          lastSeenAt: '2026-11-02T17:55:00.000Z',
          fingerprint: `current-${sessionId}`,
        },
        {
          computerId: 'computer-a',
          sessionId,
          status: 'waiting' as const,
          lastSeenAt: '2026-11-02T17:54:00.000Z',
          fingerprint: `duplicate-${sessionId}`,
        },
      ]),
      previous: { items: previousItems, history: [] },
    })

    expect(result.items.map(({ sessionId }) => sessionId)).toEqual(sessions)
    expect(new Set(result.items.map(({ id }) => id)).size).toBe(3)
    expect(result.items.every(({ label }) => label === 'Session is waiting')).toBe(true)
    expect(JSON.stringify(result.items)).not.toContain('Open session review')
    expect(JSON.stringify(result.items)).not.toContain('Journal metadata reports an open session')
    expect(result.coverage).toContain('Excluded 9 duplicate session proposals.')
  })

  it('deduplicates legacy memory carries by stable memory identity', () => {
    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [],
      memory: {
        mode: 'on',
        available: true,
        records: [{
          id: 'memory-a',
          kind: 'outcome',
          scope: { type: 'user' },
          authority: 'verified-outcome',
          confidence: 1,
          createdAt: '2026-11-01T18:00:00.000Z',
          updatedAt: '2026-11-02T17:00:00.000Z',
        }],
        tombstones: [],
      },
      previous: {
        items: [
          {
            id: 'legacy-memory-a',
            label: 'Review completion',
            reason: 'Legacy generated proposal.',
            status: 'pending',
            source: 'memory',
            memoryId: 'memory-a',
            fingerprint: 'legacy-a',
          },
          {
            id: 'legacy-memory-b',
            label: 'pending',
            reason: 'Duplicate generated proposal.',
            status: 'pending',
            source: 'carry',
            memoryId: 'memory-a',
            fingerprint: 'legacy-b',
          },
        ],
        history: [],
      },
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      id: expect.stringMatching(/^memory-/),
      label: 'Memory item needs review',
      memoryId: 'memory-a',
      source: 'carry',
    })
    expect(result.coverage).toContain('Excluded 2 duplicate memory proposals.')
  })

  it('excludes generic open-session metadata that has no actionable review source', () => {
    const result = planDreamer({
      now: new Date('2026-11-02T18:00:00.000Z'),
      registryAvailable: true,
      sessions: [
        {
          computerId: 'computer-a',
          sessionId: '51a9d338-ec8f-4f3f-9f56-2de6c43519f7',
          status: 'running',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
        },
        {
          computerId: 'computer-a',
          sessionId: '5932eac7-7370-4b17-a539-0cadf719f34b',
          status: 'idle',
          lastSeenAt: '2026-11-02T17:55:00.000Z',
        },
      ],
    })

    expect(result.items).toEqual([])
    expect(result.coverage).toContain(
      'Excluded 2 generic open-session metadata entries without an actionable source.',
    )
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
      registryAvailable: false,
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
      status: index === 9_999 ? 'error' as const : 'waiting' as const,
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
          status: 'waiting',
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
