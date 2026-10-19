import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  ManagerStructuredMemoryValidationError,
  validateStructuredMemoryCorrect,
  validateStructuredMemoryForget,
  validateStructuredMemoryImport,
  validateStructuredMemoryRemember,
  validateStructuredMemorySearch,
  validateStructuredMemoryState,
} from './manager-structured-memory-validation.js'

function safeRemember(content = 'Keep pull request comments concise.') {
  return {
    requestId: 'remember-1',
    kind: 'preference' as const,
    canonicalKey: 'pull request style',
    content,
    scope: { type: 'user' as const },
  }
}

describe('structured memory validation', () => {
  it('normalizes safe explicit memory before persistence', () => {
    expect(validateStructuredMemoryRemember({
      requestId: 'remember-1',
      kind: 'preference',
      canonicalKey: '  Pull Request Style  ',
      content: 'Keep pull request comments concise.',
      scope: {
        type: 'project',
        computerId: 'development',
        projectRoot: '/home/lcavalcanti/src/agentic-remote/../agentic-remote',
      },
      confidence: 0.95,
      sourceManagerMessageId: 'manager-message-1',
    })).toEqual({
      requestId: 'remember-1',
      kind: 'preference',
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: {
        type: 'project',
        computerId: 'development',
        projectRoot: '/home/lcavalcanti/src/agentic-remote',
      },
      confidence: 0.95,
      sourceManagerMessageId: 'manager-message-1',
    })
  })

  it.each([
    ['provider token', `ghp_${'A'.repeat(36)}`],
    ['bearer credential', `Authorization: Bearer ${'aB3_'.repeat(12)}`],
    ['JWT', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.c2lnbmF0dXJl'],
    ['private key', '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----'],
    ['password assignment', 'password=hunter2-with-symbols!'],
    ['credential URL', 'https://alice:super-secret@example.com/private'],
    ['high-entropy value', 'mF9xQ2vL8kP4rT7wY1zC6nB3sD0jH5uA9eG2iK8o'],
  ])('rejects a %s without echoing it', (_label, secret) => {
    try {
      validateStructuredMemoryRemember(safeRemember(`Never store ${secret}`))
      throw new Error('Expected validation to reject the secret')
    } catch (error) {
      expect(error).toBeInstanceOf(ManagerStructuredMemoryValidationError)
      expect(error).toMatchObject({ reason: 'secret', statusCode: 400 })
      expect(String(error)).not.toContain(secret)
      expect(JSON.stringify(error)).not.toContain(secret)
    }
  })

  it.each([
    ['/home/alice/.ssh/id_ed25519', 'sensitive_path'],
    ['Contact alice@example.com', 'personal_data'],
    ['Call +1 (415) 555-2671', 'personal_data'],
    ['SSN 123-45-6789', 'personal_data'],
    ['Card 4111 1111 1111 1111', 'personal_data'],
  ])('rejects prohibited content as %s', (content, reason) => {
    expect(() =>
      validateStructuredMemoryRemember(safeRemember(content)),
    ).toThrow(expect.objectContaining({ reason, statusCode: 400 }))
  })

  it.each([
    ['NUL', 'bad\u0000value'],
    ['control character', 'bad\u0001value'],
    ['unpaired high surrogate', 'bad\uD800value'],
    ['unpaired low surrogate', 'bad\uDC00value'],
  ])('rejects %s before persistence', (_label, content) => {
    expect(() =>
      validateStructuredMemoryRemember(safeRemember(content)),
    ).toThrow(expect.objectContaining({
      reason: 'malformed_unicode',
      statusCode: 400,
    }))
  })

  it('reports oversized content without retaining it in the error', () => {
    const content = `oversized-${'x'.repeat(2_100)}`
    try {
      validateStructuredMemoryRemember(safeRemember(content))
      throw new Error('Expected validation to reject oversized content')
    } catch (error) {
      expect(error).toMatchObject({ reason: 'oversized', statusCode: 413 })
      expect(JSON.stringify(error)).not.toContain(content)
    }
  })

  it('bounds deeply nested and cyclic malformed input without recursing', () => {
    let nested: Record<string, unknown> = {}
    for (let index = 0; index < 70; index += 1) {
      nested = { nested }
    }
    expect(() => validateStructuredMemoryRemember({
      ...safeRemember(),
      extra: nested,
    })).toThrow(expect.objectContaining({
      reason: 'oversized',
      statusCode: 413,
    }))

    const cyclic = safeRemember() as ReturnType<typeof safeRemember> & {
      cycle?: unknown
    }
    cyclic.cycle = cyclic
    expect(() => validateStructuredMemoryRemember(cyclic)).toThrow(
      expect.objectContaining({ reason: 'malformed', statusCode: 400 }),
    )
  })

  it('rejects inverted validity and unknown fields', () => {
    expect(() => validateStructuredMemoryRemember({
      ...safeRemember(),
      validFrom: '2026-10-17T00:00:00.000Z',
      validUntil: '2026-10-16T00:00:00.000Z',
    })).toThrow(expect.objectContaining({ reason: 'malformed', statusCode: 400 }))

    expect(() => validateStructuredMemoryRemember({
      ...safeRemember(),
      unexpected: 'field',
    })).toThrow(expect.objectContaining({ reason: 'malformed', statusCode: 400 }))
  })

  it('validates correction and forgetting request identities', () => {
    expect(validateStructuredMemoryCorrect({
      ...safeRemember('Use a single concise PR comment.'),
      requestId: 'correct-1',
      recordId: '11111111-1111-4111-8111-111111111111',
    })).toMatchObject({
      requestId: 'correct-1',
      recordId: '11111111-1111-4111-8111-111111111111',
      content: 'Use a single concise PR comment.',
    })
    expect(validateStructuredMemoryForget({
      requestId: 'forget-1',
      recordId: '11111111-1111-4111-8111-111111111111',
      sourceManagerMessageId: 'manager-message-2',
    })).toEqual({
      requestId: 'forget-1',
      recordId: '11111111-1111-4111-8111-111111111111',
      sourceManagerMessageId: 'manager-message-2',
    })
  })

  it('bounds search inputs and rejects duplicate scopes', () => {
    expect(validateStructuredMemorySearch({
      query: 'pull request style',
      scopes: [
        { type: 'global' },
        { type: 'project', computerId: 'development', projectRoot: '/srv/app/..' },
      ],
      limit: 8,
      at: '2026-10-16T12:00:00.000Z',
    })).toEqual({
      query: 'pull request style',
      scopes: [
        { type: 'global' },
        { type: 'project', computerId: 'development', projectRoot: '/srv' },
      ],
      limit: 8,
      at: '2026-10-16T12:00:00.000Z',
    })
    expect(() => validateStructuredMemorySearch({
      query: 'style',
      scopes: [{ type: 'user' }, { type: 'user' }],
      limit: 8,
    })).toThrow(expect.objectContaining({ reason: 'malformed', statusCode: 400 }))
    expect(() => validateStructuredMemorySearch({
      query: 'style',
      scopes: [{ type: 'user' }],
      limit: 9,
    })).toThrow(expect.objectContaining({ reason: 'oversized', statusCode: 413 }))
  })

  it('strictly validates persisted versions, uniqueness, and private content', () => {
    const record = {
      schemaVersion: 1 as const,
      id: '11111111-1111-4111-8111-111111111111',
      kind: 'preference' as const,
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' as const },
      provenance: {
        origin: 'direct-user' as const,
        requestId: 'remember-1',
        sourceDigest: 'a'.repeat(64),
      },
      authority: 'direct-user' as const,
      confidence: 0.95,
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    }
    const state = {
      version: 1 as const,
      revision: 1,
      records: [record],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    }

    expect(validateStructuredMemoryState(state)).toEqual(state)
    expect(() => validateStructuredMemoryState({
      ...state,
      version: 2,
    })).toThrow(expect.objectContaining({
      reason: 'unsupported_version',
      statusCode: 409,
    }))
    expect(() => validateStructuredMemoryState({
      ...state,
      records: [record, record],
    })).toThrow(expect.objectContaining({ reason: 'malformed', statusCode: 400 }))
    expect(() => validateStructuredMemoryState({
      ...state,
      records: [{ ...record, content: `token ghp_${'B'.repeat(36)}` }],
    })).toThrow(expect.objectContaining({ reason: 'secret', statusCode: 400 }))
  })

  it('rejects inconsistent supersession, tombstones, and resurrection on load or import', () => {
    const first = {
      schemaVersion: 1 as const,
      id: '11111111-1111-4111-8111-111111111111',
      kind: 'preference' as const,
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' as const },
      provenance: {
        origin: 'direct-user' as const,
        requestId: 'remember-1',
        sourceDigest: 'a'.repeat(64),
      },
      authority: 'direct-user' as const,
      confidence: 1,
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    }
    const second = {
      ...first,
      id: '22222222-2222-4222-8222-222222222222',
      content: 'Use one concise pull request comment.',
      provenance: {
        ...first.provenance,
        requestId: 'correct-1',
        sourceDigest: 'b'.repeat(64),
      },
      authority: 'direct-user-correction' as const,
      supersedesId: first.id,
    }
    const state = {
      version: 1 as const,
      revision: 2,
      records: [{ ...first, supersededById: second.id }, second],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    }
    expect(validateStructuredMemoryState(state)).toEqual(state)

    expect(() => validateStructuredMemoryState({
      ...state,
      records: [first, second],
    })).toThrow(expect.objectContaining({ reason: 'malformed' }))

    const contentDigest = createHash('sha256')
      .update(JSON.stringify(first.content))
      .digest('hex')
    const tombstone = {
      schemaVersion: 1 as const,
      recordId: first.id,
      scope: first.scope,
      canonicalKey: first.canonicalKey,
      contentDigest,
      sourceDigest: first.provenance.sourceDigest,
      requestId: 'forget-1',
      deletedAt: '2026-10-16T12:01:00.000Z',
    }
    expect(validateStructuredMemoryState({
      ...state,
      tombstones: [tombstone],
    }).tombstones).toEqual([tombstone])
    expect(() => validateStructuredMemoryState({
      ...state,
      tombstones: [{ ...tombstone, contentDigest: 'c'.repeat(64) }],
    })).toThrow(expect.objectContaining({ reason: 'malformed' }))
    expect(() => validateStructuredMemoryState({
      ...state,
      tombstones: [{
        ...tombstone,
        recordId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      }],
    })).toThrow(expect.objectContaining({ reason: 'malformed' }))

    const resurrected = {
      ...first,
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      provenance: {
        ...first.provenance,
        requestId: 'remember-2',
        sourceDigest: 'c'.repeat(64),
      },
    }
    expect(() => validateStructuredMemoryState({
      ...state,
      records: [...state.records, resurrected],
      tombstones: [tombstone],
    })).toThrow(expect.objectContaining({ reason: 'malformed' }))
  })

  it('allows only policy-authorized global records in persisted state', () => {
    const global = {
      schemaVersion: 1 as const,
      id: '11111111-1111-4111-8111-111111111111',
      kind: 'procedure' as const,
      canonicalKey: 'review policy',
      content: 'Require a current review before merge.',
      scope: { type: 'global' as const },
      provenance: {
        origin: 'direct-user' as const,
        requestId: 'remember-1',
        sourceDigest: 'a'.repeat(64),
      },
      authority: 'direct-user' as const,
      confidence: 1,
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    }
    expect(() => validateStructuredMemoryState({
      version: 1,
      revision: 1,
      records: [global],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    })).toThrow(expect.objectContaining({ reason: 'malformed' }))
    expect(validateStructuredMemoryState({
      version: 1,
      revision: 1,
      records: [{
        ...global,
        provenance: { ...global.provenance, origin: 'policy' as const },
        authority: 'policy-authorized' as const,
      }],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    }).records).toHaveLength(1)
    expect(() => validateStructuredMemoryState({
      version: 1,
      revision: 1,
      records: [{
        ...global,
        scope: { type: 'user' },
        provenance: { ...global.provenance, origin: 'import' },
        authority: 'direct-user-correction',
      }],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    })).toThrow(expect.objectContaining({ reason: 'malformed' }))
  })

  it.each([
    ['.env.production'],
    ['/srv/app/.env.local'],
    ['Deploy reads .env.production at boot.'],
    ['~/.env'],
    ['C:\\app\\.env.development'],
    ['"./.env.staging"'],
    ['/home/alice/.ssh/id_ed25519'],
    ['Copy id_rsa to the server.'],
    ['/etc/ssl/private/server.pem'],
    ['~/.aws/credentials'],
  ])('rejects the sensitive path %s', (content) => {
    expect(() =>
      validateStructuredMemoryRemember(safeRemember(content)),
    ).toThrow(expect.objectContaining({ reason: 'sensitive_path' }))
  })

  it.each([
    ['Prefer environment files over hard-coded values.'],
    ['Read the port from process.env.PORT.'],
    ['Keep pull request comments concise.'],
  ])('accepts benign text mentioning environments: %s', (content) => {
    expect(validateStructuredMemoryRemember(safeRemember(content)).content)
      .toBe(content)
  })

  const privateValues = [
    ['secret', `ghp_${'A'.repeat(36)}`],
    ['personal_data', 'alice@example.com'],
    ['sensitive_path', '/srv/app/.env.production'],
  ] as const

  it.each(privateValues)(
    'rejects %s in mutation metadata before persistence',
    (reason, value) => {
      expect(() => validateStructuredMemoryRemember({
        ...safeRemember(),
        requestId: value,
      })).toThrow(expect.objectContaining({ reason }))
      expect(() => validateStructuredMemoryRemember({
        ...safeRemember(),
        sourceManagerMessageId: value,
      })).toThrow(expect.objectContaining({ reason }))
      expect(() => validateStructuredMemoryRemember({
        ...safeRemember(),
        sourceSession: { computerId: 'hub', sessionId: value },
      })).toThrow(expect.objectContaining({ reason }))
      expect(() => validateStructuredMemoryCorrect({
        ...safeRemember(),
        recordId: '11111111-1111-4111-8111-111111111111',
        requestId: value,
      })).toThrow(expect.objectContaining({ reason }))
      expect(() => validateStructuredMemoryForget({
        requestId: value,
        recordId: '11111111-1111-4111-8111-111111111111',
      })).toThrow(expect.objectContaining({ reason }))
      expect(() => validateStructuredMemoryForget({
        requestId: 'forget-1',
        recordId: '11111111-1111-4111-8111-111111111111',
        sourceManagerMessageId: value,
      })).toThrow(expect.objectContaining({ reason }))
    },
  )

  describe('import privacy', () => {
    const forgotten = {
      schemaVersion: 1 as const,
      id: '11111111-1111-4111-8111-111111111111',
      kind: 'preference' as const,
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' as const },
      provenance: {
        origin: 'direct-user' as const,
        requestId: 'remember-1',
        sourceDigest: 'a'.repeat(64),
        sourceManagerMessageId: 'manager-message-1',
        sourceSession: { computerId: 'hub', sessionId: 'session-1' },
      },
      authority: 'direct-user' as const,
      confidence: 1,
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    }
    const baseState = () => ({
      version: 1 as const,
      revision: 2,
      records: [structuredClone(forgotten)],
      tombstones: [{
        schemaVersion: 1 as const,
        recordId: forgotten.id,
        scope: forgotten.scope,
        canonicalKey: forgotten.canonicalKey,
        contentDigest: createHash('sha256')
          .update(JSON.stringify(forgotten.content))
          .digest('hex'),
        sourceDigest: forgotten.provenance.sourceDigest,
        requestId: 'forget-1',
        deletedAt: '2026-10-16T12:01:00.000Z',
        sourceManagerMessageId: 'manager-message-2',
      }],
      audit: [{
        id: '33333333-3333-4333-8333-333333333333',
        operation: 'forget' as const,
        requestId: 'forget-1',
        recordId: forgotten.id,
        occurredAt: '2026-10-16T12:01:00.000Z',
        outcome: 'applied' as const,
      }],
      appliedRequests: [{
        requestId: 'forget-1',
        operation: 'forget' as const,
        recordId: forgotten.id,
        revision: 2,
        appliedAt: '2026-10-16T12:01:00.000Z',
      }],
    })
    type ImportState = ReturnType<typeof baseState>
    const fields: Array<[string, (state: ImportState, value: string) => void]> = [
      ['record provenance request ID', (state, value) => {
        state.records[0].provenance.requestId = value
      }],
      ['record provenance manager message ID', (state, value) => {
        state.records[0].provenance.sourceManagerMessageId = value
      }],
      ['record provenance source computer', (state, value) => {
        state.records[0].provenance.sourceSession.computerId = value
      }],
      ['record provenance source session', (state, value) => {
        state.records[0].provenance.sourceSession.sessionId = value
      }],
      ['tombstone request ID', (state, value) => {
        state.tombstones[0].requestId = value
      }],
      ['tombstone manager message ID', (state, value) => {
        state.tombstones[0].sourceManagerMessageId = value
      }],
      ['audit request ID', (state, value) => {
        state.audit[0].requestId = value
      }],
      ['applied request ID', (state, value) => {
        state.appliedRequests[0].requestId = value
      }],
    ]

    it('accepts a clean state including UUID metadata that resembles a card', () => {
      const state = baseState()
      state.records[0].provenance.sourceManagerMessageId =
        'aaaaaaaa-aaaa-4aaa-8123-100000000003'
      expect(validateStructuredMemoryImport('import-1', state).state)
        .toEqual(state)
    })

    it.each(fields.flatMap(([label, apply]) =>
      privateValues.map(([reason, value]) => [label, reason, value, apply] as const)))(
      'rejects %s containing %s',
      (_label, reason, value, apply) => {
        const state = baseState()
        apply(state, value)
        try {
          validateStructuredMemoryImport('import-1', state)
          throw new Error('Expected import validation to fail')
        } catch (error) {
          expect(error).toMatchObject({ reason })
          expect(JSON.stringify(error)).not.toContain(value)
          expect(String(error)).not.toContain(value)
        }
      },
    )

    it.each(privateValues)('rejects an import request ID containing %s', (reason, value) => {
      expect(() => validateStructuredMemoryImport(value, baseState()))
        .toThrow(expect.objectContaining({ reason }))
    })
  })
})
