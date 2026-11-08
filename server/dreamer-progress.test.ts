import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage, ManagedSession } from '../shared/contracts.js'
import {
  DreamerProgress,
  progressExcerpt,
  transcriptProgress,
  type DreamerProgressLimits,
  type DreamerProgressSource,
} from './dreamer-progress.js'

const T0 = '2026-11-07T10:00:00.000Z'

function session(overrides: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id: 's1',
    computerId: 'c1',
    computerName: 'development',
    cwd: '/work',
    title: 'Fix login',
    status: 'idle',
    updatedAt: T0,
    revision: 1,
    isOpen: true,
    messages: [],
    ...overrides,
  }
}

function reply(content: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: `reply-${content.length}`,
    role: 'assistant',
    content,
    createdAt: T0,
    ...overrides,
  }
}

type Detail = ManagedSession | Error | 'hang'

class FakeSource implements DreamerProgressSource {
  computers = [
    { id: 'c1', name: 'development' },
    { id: 'c2', name: 'production' },
  ]
  sessions: ManagedSession[] = []
  answered = ['c1', 'c2']
  details = new Map<string, Detail>()
  reads: string[] = []
  listings = 0
  active = 0
  maxActive = 0
  beforeListing?: () => Promise<void> | void

  async listSessionsWithAuthority() {
    this.listings += 1
    await this.beforeListing?.()
    return {
      sessions: structuredClone(this.sessions),
      answeredComputerIds: [...this.answered],
    }
  }

  listComputers() {
    return this.computers
  }

  async readSession(computerId: string, sessionId: string): Promise<ManagedSession> {
    const key = `${computerId}/${sessionId}`
    this.reads.push(key)
    this.active += 1
    this.maxActive = Math.max(this.maxActive, this.active)
    try {
      await Promise.resolve()
      const detail = this.details.get(key)
      if (detail === 'hang') return await new Promise<never>(() => undefined)
      if (detail instanceof Error) throw detail
      if (!detail) throw Object.assign(new Error('Session not found'), { statusCode: 404 })
      return structuredClone(detail)
    } finally {
      this.active -= 1
    }
  }
}

function setup(limits: Partial<DreamerProgressLimits> = {}) {
  const source = new FakeSource()
  const clock = { now: new Date('2026-11-07T10:05:00.000Z') }
  const progress = new DreamerProgress(source, { now: () => clock.now, limits })
  const entry = (sessionId = 's1', computerId = 'c1') =>
    progress.snapshot().entries.find((item) =>
      item.sessionId === sessionId && item.computerId === computerId)
  return { source, clock, progress, entry }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('transcriptProgress', () => {
  it('takes the last finished assistant reply with its time and trusted completion', () => {
    expect(transcriptProgress(session({
      messages: [
        reply('Earlier answer.'),
        { id: 'u', role: 'user', content: 'Next?', createdAt: T0 },
        reply('Shipped the fix.', {
          createdAt: '2026-11-07T10:03:00.000Z',
          taskCompletion: {
            source: 'root-task-complete',
            toolCallId: 'call-1',
            completedAt: '2026-11-07T10:03:00.000Z',
          },
        }),
        reply('   '),
        { id: 'tool', role: 'activity', content: 'Ran tests', createdAt: T0 },
        reply('Half a sent', { streaming: true }),
      ],
    }), 300)).toEqual({
      latest: {
        excerpt: 'Shipped the fix.',
        at: '2026-11-07T10:03:00.000Z',
        taskComplete: true,
      },
    })
  })

  it('reports the request answer_session would answer: a live permission, then a live question', () => {
    const question = {
      requestId: 'q',
      question: 'Which branch?',
      choices: [],
      allowFreeform: true,
    }
    const permission = { requestId: 'p', title: 'Run rm -rf build', options: [] }
    expect(transcriptProgress(session({
      pendingUserInput: question,
      pendingPermission: permission,
    }), 300).request).toEqual({ kind: 'permission', excerpt: 'Run rm -rf build' })
    expect(transcriptProgress(session({
      pendingUserInput: question,
      pendingPermission: { ...permission, stale: true },
    }), 300).request).toEqual({ kind: 'question', excerpt: 'Which branch?' })
    expect(transcriptProgress(session({
      pendingUserInput: { ...question, stale: true },
      pendingPermission: permission,
    }), 300).request).toEqual({ kind: 'permission', excerpt: 'Run rm -rf build' })
    expect(transcriptProgress(session({
      pendingPermission: { ...permission, stale: true },
    }), 300).request).toBeUndefined()
  })
})

describe('progressExcerpt', () => {
  it('collapses whitespace and cuts at the limit with an ellipsis', () => {
    expect(progressExcerpt('  one\n\n two\tthree  ', 300)).toBe('one two three')
    expect(progressExcerpt('abcdefghij', 6)).toBe('abcde…')
    expect(progressExcerpt('abcdef', 6)).toBe('abcdef')
  })

  it('never leaves half of a surrogate pair at the cut', () => {
    expect(progressExcerpt('abcd😀efgh', 6)).toBe('abcd…')
  })
})

describe('DreamerProgress events', () => {
  it('records a full session event with its transcript progress', () => {
    const { progress, entry } = setup()
    progress.applyEvent({
      type: 'session.upserted',
      session: session({
        status: 'waiting',
        revision: 4,
        messages: [reply('Need a decision.')],
        pendingUserInput: { requestId: 'q', question: 'Ship it?', choices: [], allowFreeform: true },
      }),
    })

    expect(entry()).toEqual({
      computerId: 'c1',
      sessionId: 's1',
      computerName: 'development',
      title: 'Fix login',
      status: 'waiting',
      isOpen: true,
      revision: 4,
      updatedAt: T0,
      latest: { excerpt: 'Need a decision.', at: T0, taskComplete: false },
      request: { kind: 'question', excerpt: 'Ship it?' },
      detail: { revision: 4, updatedAt: T0 },
    })
  })

  it('applies a summary event to metadata only, leaving the transcript stale', () => {
    const { progress, entry } = setup()
    progress.applyEvent({
      type: 'session.upserted',
      session: session({ revision: 2, messages: [reply('Old reply.')] }),
    })
    progress.applyEvent({
      type: 'session.upserted',
      summary: true,
      session: session({
        revision: 3,
        status: 'running',
        title: 'Fix login flow',
        updatedAt: '2026-11-07T10:01:00.000Z',
      }),
    })

    expect(entry()).toMatchObject({
      status: 'running',
      title: 'Fix login flow',
      revision: 3,
      latest: { excerpt: 'Old reply.' },
      detail: { revision: 2, updatedAt: T0 },
    })
  })

  it('ignores an older event and applies an equal revision with a newer time', () => {
    const { progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session({ revision: 5, status: 'running' }) })
    progress.applyEvent({ type: 'session.upserted', session: session({ revision: 4, status: 'error' }) })
    expect(entry()?.status).toBe('running')

    progress.applyEvent({
      type: 'session.upserted',
      session: session({ revision: 5, status: 'idle', updatedAt: '2026-11-07T10:02:00.000Z' }),
    })
    expect(entry()).toMatchObject({ status: 'idle', updatedAt: '2026-11-07T10:02:00.000Z' })
  })

  it('drops a replaced session and keeps a removed one as closed', () => {
    const { progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session({ id: 'a' }) })
    progress.applyEvent({ type: 'session.upserted', session: session({ id: 'b', messages: [reply('Done.')] }) })

    progress.applyEvent({ type: 'session.removed', computerId: 'c1', sessionId: 'a', replacedBy: 'a2' })
    progress.applyEvent({ type: 'session.removed', computerId: 'c1', sessionId: 'b' })

    expect(entry('a')).toBeUndefined()
    expect(entry('b')).toMatchObject({
      isOpen: false,
      closedAt: '2026-11-07T10:05:00.000Z',
      latest: { excerpt: 'Done.' },
    })
  })

  it('closes a session that reports itself closed and reopens it when it returns', () => {
    const { progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session() })
    progress.applyEvent({ type: 'session.upserted', session: session({ isOpen: false, revision: 2 }) })
    expect(entry()).toMatchObject({ isOpen: false, closedAt: '2026-11-07T10:05:00.000Z' })

    progress.applyEvent({ type: 'session.upserted', session: session({ isOpen: true, revision: 3 }) })
    expect(entry()?.isOpen).toBe(true)
    expect(entry()).not.toHaveProperty('closedAt')
  })

  it('dates a close it saw happen now, even for a session idle for days, and keeps that date', () => {
    const { clock, progress, entry } = setup()
    // Closing bumps the revision but not updatedAt.
    const idle = { updatedAt: '2026-11-04T10:00:00.000Z' }
    progress.applyEvent({ type: 'session.upserted', session: session(idle) })
    progress.applyEvent({ type: 'session.upserted', session: session({ ...idle, isOpen: false, revision: 2 }) })
    expect(entry()).toMatchObject({ isOpen: false, closedAt: '2026-11-07T10:05:00.000Z' })

    clock.now = new Date('2026-11-07T10:30:00.000Z')
    progress.applyEvent({
      type: 'session.upserted',
      session: session({ ...idle, isOpen: false, revision: 3, title: 'Renamed' }),
    })
    expect(entry()).toMatchObject({ title: 'Renamed', closedAt: '2026-11-07T10:05:00.000Z' })
  })

  it('dates a session first seen closed by its own record, never later than now', () => {
    const { progress, entry } = setup()
    const closed = (id: string, overrides: Partial<ManagedSession>) => progress.applyEvent({
      type: 'session.upserted',
      summary: true,
      session: session({ id, isOpen: false, revision: 9, ...overrides }),
    })
    closed('archived', { updatedAt: '2026-11-01T08:00:00.000Z', archivedAt: '2026-11-07T08:00:00.000Z' })
    closed('closed', { updatedAt: '2026-11-07T09:00:00.000Z' })
    closed('old-archive', { updatedAt: '2026-11-01T08:00:00.000Z', archivedAt: '2026-11-05T08:00:00.000Z' })
    closed('old-close', { updatedAt: '2026-11-05T08:00:00.000Z' })
    closed('ahead', { archivedAt: '2026-11-07T11:00:00.000Z' })

    expect(entry('archived')?.closedAt).toBe('2026-11-07T08:00:00.000Z')
    expect(entry('closed')?.closedAt).toBe('2026-11-07T09:00:00.000Z')
    expect(entry('old-archive')).toBeUndefined()
    expect(entry('old-close')).toBeUndefined()
    expect(entry('ahead')?.closedAt).toBe('2026-11-07T10:05:00.000Z')
  })

  it('dates an archive by its record even when it last saw the session open', () => {
    const { progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session({ id: 'recent' }) })
    progress.applyEvent({ type: 'session.upserted', session: session({ id: 'outage' }) })

    progress.applyEvent({
      type: 'session.upserted',
      session: session({ id: 'recent', isOpen: false, revision: 2, archivedAt: '2026-11-07T10:04:00.000Z' }),
    })
    // Archived while its computer was unreachable, and reported on reconnect.
    progress.applyEvent({
      type: 'session.upserted',
      session: session({ id: 'outage', isOpen: false, revision: 2, archivedAt: '2026-11-04T10:00:00.000Z' }),
    })

    expect(entry('recent')?.closedAt).toBe('2026-11-07T10:04:00.000Z')
    expect(entry('outage')).toBeUndefined()
  })

  it('forgets every session of a removed computer', () => {
    const { progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session() })
    progress.applyEvent({ type: 'session.upserted', session: session({ computerId: 'c2', computerName: 'production' }) })

    progress.applyEvent({ type: 'computer.removed', computerId: 'c2' })

    expect(entry('s1', 'c1')).toBeDefined()
    expect(entry('s1', 'c2')).toBeUndefined()
  })
})

describe('DreamerProgress refresh', () => {
  it('reports unreachable computers, keeps their entries, and drops unregistered ones', async () => {
    const { source, progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session({ computerId: 'c2', computerName: 'production' }) })
    progress.applyEvent({ type: 'session.upserted', session: session({ computerId: 'gone', computerName: 'old' }) })
    source.answered = ['c1']

    const result = await progress.refresh()

    expect(result).toEqual({ authoritative: [] })
    expect(entry('s1', 'c2')?.isOpen).toBe(true)
    expect(entry('s1', 'gone')).toBeUndefined()
    expect(progress.snapshot()).toMatchObject({
      refreshedAt: '2026-11-07T10:05:00.000Z',
      staleComputers: [{ id: 'c2', name: 'production' }],
    })
  })

  it('closes an open session only after two answering listings omit it', async () => {
    const { source, clock, progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session() })

    await progress.refresh()
    expect(entry()?.isOpen).toBe(true)

    clock.now = new Date('2026-11-07T10:10:00.000Z')
    await progress.refresh()
    expect(entry()).toMatchObject({ isOpen: false, closedAt: '2026-11-07T10:10:00.000Z' })

    source.sessions = [session({ revision: 1 })]
    await progress.refresh()
    expect(entry()?.isOpen).toBe(true)
  })

  it('does not count a listing that raced an event for the session', async () => {
    const { source, progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session() })
    await progress.refresh()

    source.beforeListing = () => {
      progress.applyEvent({ type: 'session.upserted', session: session({ revision: 2, status: 'running' }) })
    }
    await progress.refresh()
    source.beforeListing = undefined
    await progress.refresh()

    expect(entry()).toMatchObject({ isOpen: true, status: 'running' })
  })

  it('keeps a session closed when it was removed while a listing was in flight', async () => {
    const { source, progress, entry } = setup()
    source.sessions = [session()]
    progress.applyEvent({ type: 'session.upserted', session: session({ messages: [reply('Done.')] }) })
    source.beforeListing = () => {
      progress.applyEvent({ type: 'session.removed', computerId: 'c1', sessionId: 's1' })
    }

    await progress.refresh()

    expect(entry()).toMatchObject({ isOpen: false, closedAt: '2026-11-07T10:05:00.000Z' })
  })

  it('never lets an older listing roll back a newer event', async () => {
    const { source, progress, entry } = setup()
    source.sessions = [session({ revision: 2, status: 'running' })]
    source.beforeListing = () => {
      progress.applyEvent({
        type: 'session.upserted',
        session: session({ revision: 3, status: 'idle', messages: [reply('All green.')] }),
      })
    }

    const result = await progress.refresh()

    expect(entry()).toMatchObject({ revision: 3, status: 'idle', latest: { excerpt: 'All green.' } })
    expect(result?.authoritative.map(({ id, revision }) => ({ id, revision }))).toEqual([
      { id: 's1', revision: 2 },
    ])
    expect(source.reads).toEqual([])
  })

  it('starts a session over when its answering computer reports a lower revision', async () => {
    const { source, progress, entry } = setup()
    const before = {
      revision: 40,
      status: 'waiting' as const,
      messages: [reply('Old incarnation.')],
      pendingUserInput: { requestId: 'q', question: 'Which branch?', choices: [], allowFreeform: true },
    }
    progress.applyEvent({ type: 'session.upserted', session: session(before) })
    progress.applyEvent({
      type: 'session.upserted',
      session: session({ ...before, computerId: 'c2', computerName: 'production' }),
    })
    // c1 lost its session store; c2 did not answer, so its copy is the hub's own.
    source.answered = ['c1']
    source.sessions = [
      session({ revision: 2, status: 'running' }),
      session({ revision: 2, status: 'running', computerId: 'c2', computerName: 'production' }),
    ]

    await progress.refresh()

    expect(entry('s1', 'c1')).toMatchObject({ revision: 2, status: 'running', isOpen: true })
    expect(entry('s1', 'c1')?.latest).toBeUndefined()
    expect(entry('s1', 'c1')?.request).toBeUndefined()
    expect(source.reads).toEqual(['c1/s1'])
    expect(entry('s1', 'c2')).toMatchObject({
      revision: 40,
      status: 'waiting',
      latest: { excerpt: 'Old incarnation.' },
      request: { kind: 'question', excerpt: 'Which branch?' },
    })
  })

  it('starts a session over even when an older event for it raced the listing', async () => {
    const { source, progress, entry } = setup()
    progress.applyEvent({
      type: 'session.upserted',
      session: session({ revision: 40, messages: [reply('Old incarnation.')] }),
    })
    source.answered = ['c1']
    source.sessions = [session({ revision: 3, status: 'running' })]
    source.beforeListing = () => {
      // The new incarnation's events are older than the cache, so they change nothing.
      progress.applyEvent({ type: 'session.upserted', session: session({ revision: 2, status: 'running' }) })
    }

    await progress.refresh()

    expect(entry()).toMatchObject({ revision: 3, status: 'running' })
    expect(entry()?.latest).toBeUndefined()
  })

  it('does not let an older event excuse a session that listings omit', async () => {
    const { clock, progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session({ revision: 5 }) })
    await progress.refresh()

    progress.applyEvent({ type: 'session.upserted', session: session({ revision: 4 }) })
    clock.now = new Date('2026-11-07T10:10:00.000Z')
    await progress.refresh()

    expect(entry()).toMatchObject({ isOpen: false, closedAt: '2026-11-07T10:10:00.000Z' })
  })

  it('reopens a closed session that its answering computer lists at a lower revision', async () => {
    const { source, progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session({ revision: 40, messages: [reply('Old.')] }) })
    progress.applyEvent({ type: 'session.removed', computerId: 'c1', sessionId: 's1' })
    source.sessions = [session({ revision: 1 })]

    await progress.refresh()

    expect(entry()).toMatchObject({ revision: 1, isOpen: true })
    expect(entry()).not.toHaveProperty('closedAt')
    expect(entry()?.latest).toBeUndefined()
  })

  it('reads stale transcripts on answering computers, most urgent first, within the caps', async () => {
    const { source, progress } = setup({ readsPerRefresh: 4, readConcurrency: 2 })
    const listed = [
      session({ id: 'idle-old', updatedAt: '2026-11-07T09:00:00.000Z' }),
      session({ id: 'idle-new', updatedAt: '2026-11-07T09:30:00.000Z' }),
      session({ id: 'running', status: 'running', updatedAt: '2026-11-07T08:00:00.000Z' }),
      session({ id: 'error', status: 'error', updatedAt: '2026-11-07T07:00:00.000Z' }),
      session({ id: 'waiting', status: 'waiting', updatedAt: '2026-11-07T06:00:00.000Z' }),
      session({ id: 'current', revision: 1 }),
      session({ id: 'remote', computerId: 'c2', computerName: 'production', status: 'waiting' }),
    ]
    source.answered = ['c1']
    source.sessions = listed
    progress.applyEvent({ type: 'session.upserted', session: session({ id: 'current', messages: [reply('Fresh.')] }) })
    progress.applyEvent({ type: 'session.upserted', summary: true, session: listed[6] })
    for (const item of listed) {
      source.details.set(`${item.computerId}/${item.id}`, { ...item, messages: [reply(`Reply from ${item.id}.`)] })
    }

    await progress.refresh()

    expect(source.reads).toEqual(['c1/waiting', 'c1/error', 'c1/running', 'c1/idle-new'])
    expect(source.maxActive).toBe(2)
    expect(progress.snapshot().entries.find(({ sessionId }) => sessionId === 'waiting')?.latest?.excerpt)
      .toBe('Reply from waiting.')
  })

  it('times out a read that never settles and waits before retrying it', async () => {
    vi.useFakeTimers()
    const { source, clock, progress, entry } = setup({ readTimeoutMs: 10_000, readRetryMs: 15 * 60_000 })
    source.sessions = [session()]
    source.details.set('c1/s1', 'hang')

    const first = progress.refresh()
    await vi.advanceTimersByTimeAsync(10_000)
    await first

    expect(entry()).toMatchObject({ retryReadAt: '2026-11-07T10:20:00.000Z' })
    expect(entry()).not.toHaveProperty('latest')

    source.details.set('c1/s1', session({ messages: [reply('Recovered.')] }))
    await progress.refresh()
    expect(source.reads).toEqual(['c1/s1'])

    clock.now = new Date('2026-11-07T10:20:00.000Z')
    await progress.refresh()
    expect(source.reads).toEqual(['c1/s1', 'c1/s1'])
    expect(entry()).toMatchObject({ latest: { excerpt: 'Recovered.' } })
    expect(entry()).not.toHaveProperty('retryReadAt')
  })

  it('discards a read that is older than an event that arrived meanwhile', async () => {
    const { source, progress, entry } = setup()
    source.sessions = [session({ revision: 2 })]
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    source.readSession = async (computerId, sessionId) => {
      source.reads.push(`${computerId}/${sessionId}`)
      await gate
      return session({ revision: 2, messages: [reply('Stale read.')] })
    }

    const refreshing = progress.refresh()
    await vi.waitFor(() => expect(source.reads).toHaveLength(1))
    progress.applyEvent({
      type: 'session.upserted',
      session: session({ revision: 3, messages: [reply('Live event.')] }),
    })
    release()
    await refreshing

    expect(entry()).toMatchObject({ revision: 3, latest: { excerpt: 'Live event.' } })
  })

  it('does not reopen a session that an event closed during its read', async () => {
    const { source, progress, entry } = setup()
    source.sessions = [session()]
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    source.readSession = async (computerId, sessionId) => {
      source.reads.push(`${computerId}/${sessionId}`)
      await gate
      return session({ messages: [reply('Read after close.')] })
    }

    const refreshing = progress.refresh()
    await vi.waitFor(() => expect(source.reads).toHaveLength(1))
    progress.applyEvent({ type: 'session.removed', computerId: 'c1', sessionId: 's1' })
    release()
    await refreshing

    expect(entry()).toMatchObject({ isOpen: false })
    expect(entry()).not.toHaveProperty('latest')
  })

  it('shares one refresh between concurrent callers', async () => {
    const { source, progress } = setup()
    const [first, second] = await Promise.all([progress.refresh(), progress.refresh()])
    expect(source.listings).toBe(1)
    expect(second).toBe(first)
  })

  it('fences a refresh that clear() interrupts', async () => {
    const { source, progress } = setup()
    source.sessions = [session()]
    source.details.set('c1/s1', session({ messages: [reply('Too late.')] }))
    let release!: () => void
    source.beforeListing = () => new Promise<void>((resolve) => {
      release = resolve
    })

    const refreshing = progress.refresh()
    await vi.waitFor(() => expect(source.listings).toBe(1))
    progress.clear()
    release()

    await expect(refreshing).resolves.toBeUndefined()
    expect(progress.snapshot()).toEqual({ staleComputers: [], entries: [] })
    expect(source.reads).toEqual([])
  })

  it('surfaces a failed listing and keeps what it knew', async () => {
    const { source, progress, entry } = setup()
    progress.applyEvent({ type: 'session.upserted', session: session() })
    source.listSessionsWithAuthority = async () => {
      throw new Error('hub busy')
    }

    await expect(progress.refresh()).rejects.toThrow('hub busy')
    expect(entry()?.isOpen).toBe(true)
  })
})

describe('DreamerProgress bounds', () => {
  it('drops closed sessions after a day and keeps only the newest closed and open ones', () => {
    const { clock, progress } = setup({ closedEntries: 2, openEntries: 3 })
    for (const [index, id] of ['c-a', 'c-b', 'c-c'].entries()) {
      clock.now = new Date(`2026-11-07T10:0${index}:00.000Z`)
      progress.applyEvent({
        type: 'session.upserted',
        session: session({ id, isOpen: false, updatedAt: clock.now.toISOString() }),
      })
    }
    for (const index of [1, 2, 3, 4]) {
      progress.applyEvent({
        type: 'session.upserted',
        session: session({ id: `o-${index}`, updatedAt: `2026-11-07T09:0${index}:00.000Z` }),
      })
    }

    const ids = () => progress.snapshot().entries.map(({ sessionId }) => sessionId).sort()
    expect(ids()).toEqual(['c-b', 'c-c', 'o-2', 'o-3', 'o-4'])

    clock.now = new Date('2026-11-08T10:01:30.000Z')
    progress.applyEvent({ type: 'session.upserted', session: session({ id: 'o-4', revision: 2 }) })
    expect(ids()).toEqual(['c-c', 'o-2', 'o-3', 'o-4'])
  })

  it('keeps recent closures when a reconnecting computer reports older archives', () => {
    const { clock, progress } = setup({ closedEntries: 2 })
    for (const [index, id] of ['a', 'b'].entries()) {
      progress.applyEvent({ type: 'session.upserted', session: session({ id }) })
      clock.now = new Date(`2026-11-07T10:1${index}:00.000Z`)
      progress.applyEvent({ type: 'session.upserted', session: session({ id, isOpen: false, revision: 2 }) })
    }

    progress.applyEvent({
      type: 'session.upserted',
      summary: true,
      session: session({ id: 'archived', isOpen: false, archivedAt: '2026-11-07T02:00:00.000Z' }),
    })

    expect(progress.snapshot().entries.map(({ sessionId }) => sessionId).sort()).toEqual(['a', 'b'])
  })
})
