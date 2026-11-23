import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import { assertSessionNotRetained, SessionStore } from './session-store.js'

const directories: string[] = []
const now = Date.parse('2026-10-19T06:52:00.000Z')
const day = 86_400_000

async function fixture(overrides: Partial<SessionDetail> = {}, managedOpen = true) {
  const directory = await mkdtemp(path.join(tmpdir(), 'session-retention-'))
  directories.push(directory)
  let time = now
  const store = new SessionStore(directory, () => time)
  await store.initialize()
  await store.create({
    id: 'retained', cwd: '/tmp/project/worktree', title: 'Review implementation',
    updatedAt: '2026-10-18T00:00:00.000Z', status: 'idle', isOpen: true,
    queuedPrompts: [],
    messages: [{ id: 'final', role: 'assistant', content: 'Synthetic final status',
      createdAt: '2026-10-18T00:00:00.000Z' }],
    ...overrides,
  }, { managedOpen, backend: 'terminal' })
  return { store, directory, advance: (ms: number) => { time += ms } }
}

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('session record retention is independent of provider ownership', () => {
  it.each(['running', 'waiting', 'error'] as const)(
    'does not let a suspension flag override unresolved %s state',
    async (status) => {
      const { store, directory, advance } = await fixture({
        status, suspended: true, retention: { pinned: false, idleDays: 7 },
      })
      advance(30 * day)
      await store.syncOpen([])
      await store.syncOpen([])
      expect(store.get('retained')).toMatchObject({ isOpen: true })
      expect(store.get('retained')?.archivedAt).toBeUndefined()
      await store.close()
      const restarted = new SessionStore(directory, () => now + 30 * day)
      await restarted.initialize()
      await restarted.syncOpen([])
      await restarted.syncOpen([])
      expect(restarted.get('retained')).toMatchObject({ isOpen: true })
      expect(restarted.get('retained')?.archivedAt).toBeUndefined()
      await restarted.close()
    },
  )

  it('preserves failure protection across restart even without a failed-prompt envelope', async () => {
    const { store, directory } = await fixture({ status: 'error', retention: { pinned: false, idleDays: 7 } })
    await store.setBackend('retained', 'sdk')
    const restarted = new SessionStore(directory, () => now + 30 * day)
    await restarted.initialize()
    await restarted.syncOpen([])
    expect(restarted.get('retained')).toMatchObject({
      isOpen: true, status: 'error', interruption: { previousStatus: 'error' },
    })
    await store.close()
    await restarted.close()
  })

  it('starts a fresh retention interval after explicit reopen without reordering the conversation', async () => {
    const { store, advance } = await fixture()
    await store.configureRetention('retained', { pinned: false, idleDays: 7 })
    const updatedAt = store.get('retained')!.updatedAt
    advance(30 * day)
    await store.syncOpen([])
    expect(store.get('retained')?.isOpen).toBe(false)
    await store.setOpen('retained', true, true)
    await store.syncOpen([])
    expect(store.get('retained')).toMatchObject({ isOpen: true, updatedAt })
    advance(7 * day)
    await store.syncOpen([])
    expect(store.get('retained')?.isOpen).toBe(false)
    await store.close()
  })

  it('protects a review-pinned external record across restart without granting process ownership', async () => {
    const { store, directory } = await fixture({ retention: { pinned: true, idleDays: 7 } }, false)
    const restarted = new SessionStore(directory, () => now)
    await restarted.initialize()
    await restarted.syncOpen([])
    expect(restarted.get('retained')).toMatchObject({ isOpen: true, retention: { pinned: true } })
    expect(restarted.shouldRecoverTerminalSession('retained')).toBe(false)
    await store.close()
    await restarted.close()
  })

  it('does not revive expired questions when a lost terminal owner is explicitly reopened', async () => {
    const { store } = await fixture({
      status: 'waiting',
      pendingUserInput: { requestId: 'old', question: 'Review the branch?', choices: [], allowFreeform: true },
    })
    await store.syncOpen([])
    expect(store.get('retained')?.pendingUserInput).toMatchObject({ requestId: 'old', stale: true })
    const reopened = await store.setOpen('retained', true, true)
    expect(reopened).toMatchObject({ status: 'error', pendingUserInput: { requestId: 'old', stale: true } })
    expect(reopened.interruption).toBeUndefined()
    await store.close()
  })

  it.each(['idle', 'running', 'waiting'] as const)(
    'keeps a missing %s owner visible and recoverable overnight without changing history',
    async (status) => {
      const { store, advance, directory } = await fixture({ status })
      const before = store.get('retained')!
      advance(12 * 60 * 60 * 1000)
      await store.syncOpen([])
      const missing = store.get('retained')!
      expect(missing).toMatchObject({
        isOpen: true, status: 'error',
        interruption: { previousStatus: status, detectedAt: '2026-10-19T18:52:00.000Z' },
        cwd: before.cwd, messages: before.messages, updatedAt: before.updatedAt,
      })
      const revision = missing.revision
      await store.syncOpen([])
      expect(store.get('retained')?.revision).toBe(revision)
      const restored = new SessionStore(directory)
      await restored.initialize()
      expect(restored.get('retained')).toMatchObject({
        isOpen: true, interruption: missing.interruption, messages: before.messages,
      })
      await store.close()
      await restored.close()
    },
  )

  it('does not mistake intentional suspension for process loss', async () => {
    const { store } = await fixture()
    await store.setSuspended('retained', true)
    await store.syncOpen([])
    expect(store.get('retained')).toMatchObject({ isOpen: true, suspended: true, status: 'idle' })
    expect(store.get('retained')?.interruption).toBeUndefined()
    await store.close()
  })

  it('clears an idle interruption when intentional suspension wins a discovery race', async () => {
    const { store } = await fixture()
    await store.syncOpen([])
    expect(store.get('retained')?.interruption).toBeDefined()
    await store.setSuspended('retained', true)
    await store.syncOpen([])
    expect(store.get('retained')).toMatchObject({ isOpen: true, suspended: true, status: 'idle' })
    expect(store.get('retained')?.interruption).toBeUndefined()
    await store.close()
  })

  it('clears the interruption only after a positive owner or explicit reopen', async () => {
    const { store } = await fixture()
    await store.syncOpen([])
    await store.syncBackends(['retained'], [])
    expect(store.get('retained')).toMatchObject({ isOpen: true, status: 'idle' })
    expect(store.get('retained')?.interruption).toBeUndefined()
    await store.syncOpen([])
    await store.setOpen('retained', true, true)
    expect(store.get('retained')?.interruption).toBeUndefined()
    await store.close()
  })

  it.each([
    ['2026-10-18T23:59:59-07:00', '2026-10-19T07:00:01Z'],
    ['2026-11-01T01:30:00-07:00', '2026-11-01T01:30:00-08:00'],
  ])('uses elapsed time rather than midnight or timezone boundaries (%s)', async (updatedAt, at) => {
    const { store, advance } = await fixture({ updatedAt })
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(Date.parse(at) - now)
    await store.syncOpen([])
    expect(store.get('retained')?.isOpen).toBe(true)
    await store.close()
  })

  it('archives only opted-in, absent idle records at the exact elapsed threshold', async () => {
    const { store, directory, advance } = await fixture({ updatedAt: new Date(now).toISOString() })
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(7 * day - 1)
    await store.syncOpen([])
    expect(store.get('retained')?.isOpen).toBe(true)
    advance(1)
    await store.syncOpen([])
    expect(store.get('retained')).toMatchObject({
      isOpen: false, archivedAt: '2026-10-26T06:52:00.000Z', messages: [expect.objectContaining({ id: 'final' })],
    })
    expect(store.isManagedOpen('retained')).toBe(false)
    const revision = store.get('retained')?.revision
    await store.syncOpen([])
    expect(store.get('retained')?.revision).toBe(revision)
    const restored = new SessionStore(directory)
    await restored.initialize()
    expect(restored.get('retained')).toMatchObject({ isOpen: false, cwd: '/tmp/project/worktree' })
    await store.close()
    await restored.close()
  })

  it.each([
    { status: 'running' as const },
    { status: 'waiting' as const },
    { queuedPrompts: [{ id: 'q', content: 'Keep FIFO', createdAt: '2026-10-18T00:00:00Z' }] },
    { pendingUserInput: { requestId: 'question', question: 'Review?', choices: [], allowFreeform: true } },
    { failedPrompt: { content: 'Uncertain delivery', failedAt: 'failure', uncertain: true } },
    { retention: { idleDays: 7, pinned: true } },
  ])('protects unresolved work and review pins from archival: %j', async (overrides) => {
    const { store, advance } = await fixture(overrides)
    if (!overrides.retention) await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(365 * day)
    await store.syncOpen([])
    expect(store.get('retained')?.isOpen).toBe(true)
    expect(store.get('retained')?.queuedPrompts).toEqual(overrides.queuedPrompts || [])
    await store.close()
  })

  it('never archives a live provider, even when opted in and very old', async () => {
    const { store, advance } = await fixture()
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(365 * day)
    await store.syncOpen(['retained'])
    expect(store.get('retained')?.isOpen).toBe(true)
    expect(store.get('retained')?.archivedAt).toBeUndefined()
    await store.close()
  })

  it('discards stale discovery without overriding a pin or pending queue', async () => {
    const { store, advance } = await fixture()
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(365 * day)
    await store.configureRetention('retained', { idleDays: 7, pinned: true })
    await store.syncOpen([], () => false)
    expect(store.get('retained')).toMatchObject({ isOpen: true, retention: { pinned: true } })
    await store.close()
  })

  it.each([0, -1, 1.5, 3651, Infinity, NaN])('rejects unsafe retention age %s without writing', async (idleDays) => {
    const { store, directory } = await fixture()
    const file = path.join(directory, 'state.json')
    const before = await readFile(file, 'utf8')
    await expect(store.configureRetention('retained', { idleDays, pinned: false })).rejects.toThrow()
    expect(await readFile(file, 'utf8')).toBe(before)
    await store.close()
  })

  it('fails closed on corrupt persisted retention without rewriting the state', async () => {
    const { store, directory } = await fixture()
    await store.close()
    const file = path.join(directory, 'state.json')
    const state = JSON.parse(await readFile(file, 'utf8'))
    state.sessions.retained.retention = { idleDays: -1, pinned: false }
    const corrupt = JSON.stringify(state)
    await writeFile(file, corrupt)
    await expect(new SessionStore(directory).initialize()).rejects.toThrow(/retention/i)
    expect(await readFile(file, 'utf8')).toBe(corrupt)
  })

  it('retains explicit record closure and deletion semantics', async () => {
    const { store } = await fixture()
    await store.setOpen('retained', false, true)
    await store.syncOpen([])
    expect(store.get('retained')?.isOpen).toBe(false)
    await store.remove('retained')
    await store.syncOpen([])
    expect(store.get('retained')).toBeUndefined()
    await store.close()
  })

  it.each(['copilot', 'claude'] as const)(
    'marks an interrupted %s SDK turn on restart without draining its FIFO',
    async (provider) => {
      const { store, directory } = await fixture({ provider, status: 'running',
        queuedPrompts: [{ id: 'q', content: 'Next task', createdAt: '2026-10-18T00:00:00Z' }] })
      await store.setBackend('retained', 'sdk')
      await store.close()
      const restored = new SessionStore(directory, () => now)
      await restored.initialize()
      expect(restored.get('retained')).toMatchObject({
        isOpen: true, status: 'error', interruption: { previousStatus: 'running' },
        queuedPrompts: [{ id: 'q', content: 'Next task' }],
      })
      await restored.close()
    },
  )

  it('preserves terminal questions across restart until the owner is reconciled', async () => {
    const { store, directory } = await fixture({ status: 'waiting',
      pendingUserInput: { requestId: 'review', question: 'Approve?', choices: ['Yes'], allowFreeform: false } })
    await store.close()
    const restored = new SessionStore(directory)
    await restored.initialize()
    await restored.syncOpen([])
    expect(restored.get('retained')).toMatchObject({
      isOpen: true, status: 'error', pendingUserInput: { requestId: 'review' },
    })
    await restored.close()
  })

  it('does not reopen an automatically archived suspended record on the next pass', async () => {
    const { store, advance } = await fixture()
    await store.setSuspended('retained', true)
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(365 * day)
    await store.syncOpen([])
    await store.syncOpen([])
    expect(store.get('retained')).toMatchObject({ isOpen: false, suspended: true, archivedAt: expect.any(String) })
    await store.close()
  })

  it('keeps a review pin but clears obsolete runtime loss on a conversation replacement', async () => {
    const { store } = await fixture()
    await store.configureRetention('retained', { pinned: true, idleDays: 30 })
    await store.markInterrupted('retained', 'terminal-stopped')
    const replaced = await store.replaceWithClearedSession('retained', 'replacement')
    expect(replaced.retention).toEqual({ pinned: true, idleDays: 30 })
    expect(replaced.interruption).toBeUndefined()
    await store.close()
  })

  it('rechecks a concurrently committed queue before archival and preserves FIFO', async () => {
    const { store, advance } = await fixture()
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(365 * day)
    const one = { id: 'one', content: 'First', createdAt: '2026-10-19T06:52:00Z' }
    const two = { id: 'two', content: 'Second', createdAt: '2026-10-19T06:52:01Z' }
    await Promise.all([store.enqueuePrompt('retained', one), store.enqueuePrompt('retained', two), store.syncOpen([])])
    expect(store.get('retained')).toMatchObject({ isOpen: true, queuedPrompts: [one, two] })
    await store.close()
  })
})

describe('archival commits only against current ownership', () => {
  it('re-validates ownership at commit time and never archives a session that gained an owner', async () => {
    const { store, advance } = await fixture()
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    advance(365 * day)
    const owners = new Set<string>()
    const pass = store.syncOpen([], undefined, (id) => !owners.has(id))
    owners.add('retained')
    await pass
    expect(store.get('retained')).toMatchObject({ isOpen: true })
    expect(store.get('retained')?.archivedAt).toBeUndefined()
    expect(store.isManagedOpen('retained')).toBe(true)
    await store.syncOpen([], undefined, () => true)
    expect(store.get('retained')).toMatchObject({ isOpen: false, archivedAt: expect.any(String) })
    await store.close()
  })

  it('archives a single confirmed-absent record only when it is still eligible at commit', async () => {
    const { store, advance } = await fixture()
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    expect(await store.archiveIfExpired('retained', () => true)).toBeUndefined()
    advance(365 * day)
    expect(store.archivalCandidates(['retained'])).toEqual([])
    expect(store.archivalCandidates([])).toEqual(['retained'])
    expect(await store.archiveIfExpired('retained', () => false)).toBeUndefined()
    expect(store.get('retained')?.archivedAt).toBeUndefined()
    await expect(store.archiveIfExpired('retained', () => true)).resolves.toMatchObject({
      isOpen: false, archivedAt: expect.any(String),
    })
    expect(store.isManagedOpen('retained')).toBe(false)
    await store.close()
  })
})

describe('retention settings merge per field', () => {
  it('does not let concurrent edits of different fields clobber each other', async () => {
    const { store } = await fixture()
    await store.configureRetention('retained', { idleDays: 7 })
    expect(store.get('retained')?.retention).toEqual({ pinned: false, idleDays: 7 })
    await Promise.all([
      store.configureRetention('retained', { pinned: true }),
      store.configureRetention('retained', { idleDays: 30 }),
    ])
    expect(store.get('retained')?.retention).toEqual({ pinned: true, idleDays: 30 })
    await store.configureRetention('retained', { idleDays: null })
    expect(store.get('retained')?.retention).toEqual({ pinned: true })
    await store.configureRetention('retained', { pinned: false })
    expect(store.get('retained')?.retention).toEqual({ pinned: false })
    await store.close()
  })

  it.each([{}, { pinned: true, extra: 1 }, { idleDays: 0 }, { pinned: null }])(
    'rejects an empty or invalid patch %j without writing', async (patch) => {
      const { store, directory } = await fixture()
      const file = path.join(directory, 'state.json')
      const before = await readFile(file, 'utf8')
      await expect(store.configureRetention('retained', patch as never)).rejects.toThrow()
      expect(await readFile(file, 'utf8')).toBe(before)
      await store.close()
    },
  )
})

describe('closed sessions stay reopenable without running', () => {
  const prompt = (id: string, content: string) => ({
    id, role: 'user' as const, content, createdAt: '2026-10-18T00:00:00.000Z',
  })

  it('leaves the open list and recovery set, keeping history and what it was about', async () => {
    const { store, directory, advance } = await fixture({
      suspended: true,
      queuedPrompts: [{ id: 'queued', content: 'Queued follow-up', createdAt: '2026-10-18T00:00:00Z' }],
      pendingUserInput: { requestId: 'question', question: 'Continue?', choices: [], allowFreeform: true },
      messages: [
        prompt('ask', 'Review the release notes'),
        { id: 'final', role: 'assistant', content: 'Synthetic final status', createdAt: '2026-10-18T00:00:00.000Z' },
      ],
    })
    advance(60_000)

    const closed = await store.closeSession('retained')

    expect(closed).toMatchObject({
      isOpen: false,
      status: 'idle',
      closedAt: '2026-10-19T06:53:00.000Z',
      closedContext: {
        title: 'Review implementation',
        cwd: '/tmp/project/worktree',
        prompts: ['Review the release notes'],
        reply: 'Synthetic final status',
      },
      queuedPrompts: [],
      messages: [expect.objectContaining({ id: 'ask' }), expect.objectContaining({ id: 'final' })],
    })
    expect(closed.suspended).toBeUndefined()
    expect(closed.pendingUserInput).toBeUndefined()
    expect(store.isManagedOpen('retained')).toBe(false)
    expect(store.terminalRecoverySessions()).toEqual([])
    await store.close()
    const restored = new SessionStore(directory, () => now)
    await restored.initialize()
    expect(restored.get('retained')).toMatchObject({
      isOpen: false, closedAt: closed.closedAt, closedContext: closed.closedContext,
    })
    expect(restored.terminalRecoverySessions()).toEqual([])
    await restored.close()
  })

  it('stays closed through discovery, a live process, and archival', async () => {
    const { store, advance } = await fixture()
    await store.configureRetention('retained', { idleDays: 7, pinned: false })
    await store.closeSession('retained')
    const closed = store.get('retained')
    advance(365 * day)

    await store.syncDiscovered([{
      id: 'retained', cwd: '/tmp/elsewhere', title: 'Provider title', updatedAt: '2027-01-01T00:00:00.000Z',
    }])
    await store.syncBackends(['retained'], ['retained'])
    await store.syncOpen(['retained'])
    await store.syncOpen([])
    await store.claimTerminalRecovery('retained')

    expect(store.archivalCandidates([])).toEqual([])
    expect(store.get('retained')).toEqual(closed)
    await store.close()
  })

  it('closes once, keeping when it first closed', async () => {
    const { store, advance } = await fixture()
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const first = await store.closeSession('retained')
    advance(day)

    const again = await store.closeSession('retained')
    await store.setOpen('retained', true, true)

    expect(again.closedAt).toBe(first.closedAt)
    expect(again.revision).toBe(first.revision)
    expect(info.mock.calls.flat().filter((line) => typeof line === 'string' && line.includes('sessionLifecycle')))
      .toEqual([
        JSON.stringify({ sessionLifecycle: 'closed', sessionId: 'retained', at: first.closedAt }),
        JSON.stringify({ sessionLifecycle: 'reopened', sessionId: 'retained', at: new Date(now + day).toISOString() }),
      ])
    await store.close()
  })

  it('refuses new queued work while closed without changing the record', async () => {
    const { store } = await fixture()
    const closed = await store.closeSession('retained')

    await expect(store.enqueuePrompt('retained', {
      id: 'late', content: 'Late follow-up', createdAt: '2026-10-19T06:52:00Z',
    })).rejects.toThrow('Reopen the closed session before queueing work. Nothing was changed.')
    expect(() => assertSessionNotRetained(store.get('retained'), 'sending'))
      .toThrow('Reopen the closed session before sending.')
    expect(store.get('retained')).toEqual(closed)
    await store.close()
  })

  it('is never marked interrupted while closed', async () => {
    const { store } = await fixture()
    const closed = await store.closeSession('retained')

    await store.markInterrupted('retained', 'terminal-stopped')

    expect(store.get('retained')).toEqual(closed)
    await store.close()
  })

  it('forgets the closure when it is reopened', async () => {
    const { store } = await fixture()
    await store.closeSession('retained')

    const reopened = await store.setOpen('retained', true, true)

    expect(reopened.isOpen).toBe(true)
    expect(reopened.closedAt).toBeUndefined()
    expect(reopened.closedContext).toBeUndefined()
    expect(store.isManagedOpen('retained')).toBe(true)
    await store.close()
  })

  it('treats a record an older release reopened as open again', async () => {
    const { store, directory } = await fixture()
    await store.closeSession('retained')
    await store.close()
    const file = path.join(directory, 'state.json')
    const state = JSON.parse(await readFile(file, 'utf8'))
    // What an older release's reopen writes: it keeps fields it does not know.
    Object.assign(state.sessions.retained, { isOpen: true, managedOpen: true })
    await writeFile(file, JSON.stringify(state))

    const restored = new SessionStore(directory, () => now)
    await restored.initialize()

    expect(restored.get('retained')?.isOpen).toBe(true)
    expect(restored.get('retained')?.closedAt).toBeUndefined()
    expect(restored.get('retained')?.closedContext).toBeUndefined()
    await restored.close()
  })

  it('keeps a closed record loadable and expiring when what it stored is unreadable', async () => {
    const { store, directory } = await fixture()
    await store.closeSession('retained')
    await store.close()
    const file = path.join(directory, 'state.json')
    const state = JSON.parse(await readFile(file, 'utf8'))
    state.sessions.retained.closedContext = { prompts: 'not a list' }
    state.sessions.retained.closedAt = 'not a time'
    await writeFile(file, JSON.stringify(state))

    const restored = new SessionStore(directory, () => now + day)
    await restored.initialize()

    expect(restored.get('retained')).toMatchObject({
      isOpen: false, closedAt: new Date(now + day).toISOString(),
    })
    expect(restored.get('retained')?.closedContext).toBeUndefined()
    await restored.close()
  })

  it('keeps a record closed when an older release only saw its process', async () => {
    const { store, directory } = await fixture()
    await store.configureRetention('retained', { pinned: true })
    const closed = await store.closeSession('retained')
    await store.close()
    const file = path.join(directory, 'state.json')
    const state = JSON.parse(await readFile(file, 'utf8'))
    // An older release lists a live process as open without managing it, and
    // a pinned record that it lists stays open across a restart.
    state.sessions.retained.isOpen = true
    await writeFile(file, JSON.stringify(state))

    const restored = new SessionStore(directory, () => now)
    await restored.initialize()

    expect(restored.get('retained')).toMatchObject({ isOpen: false, closedAt: closed.closedAt })
    await restored.close()
  })
})

describe('sessions an older release suspended are closed when they load', () => {
  const queued = { id: 'queued', content: 'Queued while paused', createdAt: '2026-10-18T00:00:00.000Z' }
  const lifecycle = (line: unknown) => typeof line === 'string' && line.includes('sessionLifecycle')

  async function suspendedOnDisk() {
    const { store, directory } = await fixture({
      messages: [
        { id: 'ask', role: 'user', content: 'Review the release notes', createdAt: '2026-10-18T00:00:00.000Z' },
        { id: 'final', role: 'assistant', content: 'Synthetic final status', createdAt: '2026-10-18T00:00:00.000Z' },
      ],
    })
    await store.enqueuePrompt('retained', queued)
    await store.close()
    const file = path.join(directory, 'state.json')
    const state = JSON.parse(await readFile(file, 'utf8'))
    // What an older release's Pause wrote.
    Object.assign(state.sessions.retained, { suspended: true, isOpen: true, managedOpen: true })
    await writeFile(file, JSON.stringify(state))
    return { directory, file }
  }

  it('records it as Close would, keeping its history and queue', async () => {
    const { directory, file } = await suspendedOnDisk()
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const closedAt = new Date(now + day).toISOString()

    const store = new SessionStore(directory, () => now + day)
    await store.initialize()

    const retired = store.get('retained')
    expect(retired).toMatchObject({
      isOpen: false,
      status: 'idle',
      closedAt,
      closedContext: {
        title: 'Review implementation',
        cwd: '/tmp/project/worktree',
        prompts: ['Review the release notes'],
        reply: 'Synthetic final status',
      },
      queuedPrompts: [queued],
      queuedCount: 1,
      messages: [expect.objectContaining({ id: 'ask' }), expect.objectContaining({ id: 'final' })],
    })
    expect(retired).not.toHaveProperty('suspended')
    expect(store.isClosed('retained')).toBe(true)
    expect(store.isManagedOpen('retained')).toBe(false)
    expect(store.terminalRecoverySessions()).toEqual([])
    expect(info.mock.calls.flat().filter(lifecycle)).toEqual([
      JSON.stringify({ sessionLifecycle: 'closed', cause: 'suspend-retired', sessionId: 'retained', at: closedAt }),
    ])
    const persisted = JSON.parse(await readFile(file, 'utf8')).sessions.retained
    expect(persisted).toMatchObject({ isOpen: false, managedOpen: false, closedAt, queuedPrompts: [queued] })
    expect(persisted).not.toHaveProperty('suspended')
    await store.close()
  })

  it('changes nothing when it loads again', async () => {
    const { directory, file } = await suspendedOnDisk()
    const first = new SessionStore(directory, () => now + day)
    await first.initialize()
    const retired = first.get('retained')
    await first.close()
    const written = await readFile(file, 'utf8')
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    const again = new SessionStore(directory, () => now + 2 * day)
    await again.initialize()

    expect(again.get('retained')).toEqual(retired)
    expect(await readFile(file, 'utf8')).toBe(written)
    expect(info.mock.calls.flat().filter(lifecycle)).toEqual([])
    await again.close()
  })

  it('leaves one that was already closed as Close recorded it', async () => {
    const { store, directory } = await fixture()
    const closed = await store.closeSession('retained')
    await store.close()
    const file = path.join(directory, 'state.json')
    const state = JSON.parse(await readFile(file, 'utf8'))
    state.sessions.retained.suspended = true
    await writeFile(file, JSON.stringify(state))
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    const restored = new SessionStore(directory, () => now + day)
    await restored.initialize()

    expect(restored.get('retained')).toEqual(closed)
    expect(info.mock.calls.flat().filter(lifecycle)).toEqual([])
    await restored.close()
  })
})
