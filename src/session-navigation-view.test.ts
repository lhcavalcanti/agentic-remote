import { describe, expect, it } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import type { CollapsedCategoryShows } from '../shared/session-categories'
import {
  categoryNewSession,
  reorderSessionLaneWithHiddenFollowers,
  sessionNavigationView,
  stepVisibleSession,
  type SessionFilter,
} from './session-navigation-view'

const computers: ComputerSummary[] = [
  { id: 'one', name: 'Studio', isLocal: true, online: true },
  { id: 'two', name: 'Build node', isLocal: false, online: true },
  { id: 'offline', name: 'Travel laptop', isLocal: false, online: false },
]
const first: ManagedSession = {
  id: 'first', computerId: 'one', computerName: 'Studio', title: 'Visible first',
  cwd: '/home/demo/notes', status: 'idle', messages: [], updatedAt: '2026-09-01T00:00:00Z',
}
const hidden: ManagedSession = { ...first, id: 'hidden', title: 'Hidden conversation' }
const last: ManagedSession = {
  ...first, id: 'last', computerId: 'two', computerName: 'Build node', title: 'Visible last',
  pendingUserInput: { requestId: 'question', question: 'Which file?', choices: ['One'], allowFreeform: true },
}
const grouped = new Map([['one', [first, hidden]], ['two', [last]]])

describe('shared session navigation view', () => {
  it('hides archived records from every roster count without treating them as deleted', () => {
    const archived = { ...hidden, isOpen: false, archivedAt: '2026-10-19T06:52:00Z' }
    const view = sessionNavigationView(computers, new Map([['one', [first, archived]]]), {}, '', 'all')
    expect(view.visible).toEqual([first])
    expect(view.counts.all).toBe(1)
  })

  it('uses the same filtered sequence for rows and both directions of navigation', () => {
    const view = sessionNavigationView(computers, grouped, {}, 'visible', 'all')
    expect(view.visible).toEqual(view.groups.flatMap((group) => group.sessions))
    expect(view.visible).toEqual([first, last])
    expect(stepVisibleSession(view.visible, 'one:first', 1)).toBe(last)
    expect(stepVisibleSession(view.visible, 'two:last', -1)).toBe(first)
    expect(stepVisibleSession(view.visible, 'two:last', 1)).toBe(first)
    expect(stepVisibleSession(view.visible, 'one:first', -1)).toBe(last)
    expect(grouped.get('one')).toEqual([first, hidden])
  })

  it('starts at the correct visible edge when the selection is hidden', () => {
    const view = sessionNavigationView(computers, grouped, {}, 'visible', 'all')
    expect(stepVisibleSession(view.visible, 'one:hidden', 1)).toBe(first)
    expect(stepVisibleSession(view.visible, 'one:hidden', -1)).toBe(last)
    expect(stepVisibleSession(view.visible, undefined, -1)).toBe(last)
  })

  it('keeps every computer discoverable and leaves selection alone for no results', () => {
    const view = sessionNavigationView(computers, grouped, {}, 'missing', 'all')
    expect(view.groups.map((group) => group.computer)).toEqual(computers)
    expect(view.visible).toEqual([])
    expect(view.counts).toEqual({ all: 3, attention: 1, working: 0, unread: 0, hidden: 0 })
    expect(stepVisibleSession(view.visible, 'one:first', 1)).toBeUndefined()
    expect(stepVisibleSession(view.visible, 'one:first', -1)).toBeUndefined()
  })

  it('combines query and attention filters rather than exposing hidden conversations', () => {
    const view = sessionNavigationView(computers, grouped, {}, 'build', 'attention')
    expect(view.visible).toEqual([last])
    expect(view.shown).toBe(1)
    expect(view.filtering).toBe(true)
    expect(view.reorderDisabled).toBe(true)
    expect(stepVisibleSession(view.visible, 'one:first', 1)).toBe(last)
  })

  it('leaves hidden sessions out of rows, counts, and navigation until they are shown', () => {
    const tucked: ManagedSession = { ...first, id: 'tucked', title: 'Tucked away', status: 'running' }
    const sessions = new Map([['one', [first, tucked]], ['two', [last]]])
    const keys = new Set(['one:tucked'])

    const view = sessionNavigationView(computers, sessions, {}, '', 'all', {
      keys,
      shown: false,
    })
    expect(view.visible).toEqual([first, last])
    expect(view.counts).toEqual({ all: 2, attention: 1, working: 0, unread: 0, hidden: 1 })
    expect(view.groups.map((group) => group.computer)).toEqual(computers)
    expect(view.groups[0]).toMatchObject({ total: 1, hidden: 1 })
    // Hiding is not a filter: nothing to clear, and the order stays editable.
    expect(view.filtering).toBe(false)
    expect(view.reorderDisabled).toBe(false)
    expect(stepVisibleSession(view.visible, 'one:first', 1)).toBe(last)
    expect(stepVisibleSession(view.visible, 'one:tucked', 1)).toBe(first)
    expect(sessionNavigationView(computers, sessions, {}, 'tucked', 'all', {
      keys,
      shown: false,
    }).visible).toEqual([])

    const shown = sessionNavigationView(computers, sessions, {}, '', 'all', {
      keys,
      shown: true,
    })
    expect(shown.visible).toEqual([first, tucked, last])
    expect(shown.counts).toEqual({ all: 3, attention: 1, working: 1, unread: 0, hidden: 1 })
    expect(shown.groups[0]).toMatchObject({ total: 2, hidden: 0 })
  })

  it('keeps a hidden session listed and counted while it needs you', () => {
    const keys = new Set(['two:last'])
    const view = sessionNavigationView(computers, grouped, {}, '', 'all', {
      keys,
      shown: false,
    })
    expect(view.visible).toEqual([first, hidden, last])
    expect(view.counts).toEqual({ all: 3, attention: 1, working: 0, unread: 0, hidden: 1 })
    expect(view.groups[1]).toMatchObject({ total: 1, hidden: 0 })
    expect(sessionNavigationView(computers, grouped, {}, '', 'attention', {
      keys,
      shown: false,
    }).visible).toEqual([last])

    const answered = new Map(grouped)
    answered.set('two', [{ ...last, pendingUserInput: undefined }])
    const settled = sessionNavigationView(computers, answered, {}, '', 'all', {
      keys,
      shown: false,
    })
    expect(settled.visible).toEqual([first, hidden])
    expect(settled.counts.attention).toBe(0)
  })

  it('filters and counts unread sessions, leaving hidden ones out until they are shown', () => {
    const tucked: ManagedSession = { ...first, id: 'tucked', title: 'Tucked away' }
    const sessions = new Map([['one', [first, tucked, hidden]], ['two', [last]]])
    const unread = new Set(['one:first', 'one:tucked', 'two:last'])
    const keys = new Set(['one:tucked'])

    const view = sessionNavigationView(computers, sessions, {}, '', 'unread', {
      keys,
      shown: false,
    }, unread)
    expect(view.visible).toEqual([first, last])
    expect(view.counts).toEqual({
      all: 3, attention: 1, working: 0, unread: 2, hidden: 1,
    })
    expect(view.groups.map((group) => group.computer)).toEqual(computers)
    expect(view.filtering).toBe(true)
    expect(view.reorderDisabled).toBe(true)
    expect(stepVisibleSession(view.visible, 'one:first', 1)).toBe(last)

    const shown = sessionNavigationView(computers, sessions, {}, '', 'unread', {
      keys,
      shown: true,
    }, unread)
    expect(shown.visible).toEqual([first, tucked, last])
    expect(shown.counts.unread).toBe(3)

    // Like every hidden session, an unread one that needs you stays counted.
    const waiting = sessionNavigationView(computers, sessions, {}, '', 'unread', {
      keys: new Set(['one:tucked', 'two:last']),
      shown: false,
    }, unread)
    expect(waiting.visible).toEqual([first, last])
    expect(waiting.counts.unread).toBe(2)

    // Nothing is unread until the hub says so.
    expect(sessionNavigationView(computers, sessions, {}, '', 'unread').visible).toEqual([])
  })

  it('moves hidden followers with their visible session block', () => {
    expect(reorderSessionLaneWithHiddenFollowers(
      ['active-a', 'paused-a1', 'paused-a2', 'active-b', 'paused-b', 'active-c'],
      'active-a',
      'active-b',
      new Set(['active-a', 'active-b', 'active-c']),
    )).toEqual([
      'active-b',
      'paused-b',
      'active-a',
      'paused-a1',
      'paused-a2',
      'active-c',
    ])
  })

  it('keeps leading hidden sessions ahead of reordered blocks', () => {
    expect(reorderSessionLaneWithHiddenFollowers(
      ['paused-leading', 'active-a', 'paused-a', 'active-b'],
      'active-b',
      'active-a',
      new Set(['active-a', 'active-b']),
    )).toEqual([
      'paused-leading',
      'active-b',
      'active-a',
      'paused-a',
    ])
  })
})

describe('categories in the session navigation view', () => {
  const session = (id: string, change: Partial<ManagedSession> = {}): ManagedSession =>
    ({ ...first, id, title: `Session ${id}`, ...change })
  const asking = { pendingUserInput: { requestId: 'q', question: 'Which file?', choices: ['One'], allowFreeform: true } }
  const lab = (sessions: ManagedSession[], collapsed = false) => ({
    category: { id: 'lab', name: 'Homelab', collapsed, sessions: sessions.map((entry) => `${entry.computerId}:${entry.id}`) },
    sessions,
  })

  it('lists categorized sessions in their category above the computers, and out of their computer', () => {
    const remote = session('remote', { computerId: 'two', computerName: 'Build node' })
    const kept = session('kept')
    const grouped = new Map([['one', [first, kept]], ['two', [remote, last]]])

    const view = sessionNavigationView(computers, grouped, {}, '', 'all', undefined, undefined, {
      categories: [lab([remote, kept])],
    })
    expect(view.categories).toMatchObject([
      { category: { id: 'lab', name: 'Homelab' }, collapsed: false, sessions: [remote, kept], total: 2 },
    ])
    expect(view.groups.map((group) => [group.computer.id, group.sessions, group.total, group.categorized])).toEqual([
      ['one', [first], 1, 1], ['two', [last], 1, 1], ['offline', [], 0, 0],
    ])
    expect(view.visible).toEqual([remote, kept, first, last])
    expect(view.counts).toMatchObject({ all: 4, attention: 1 })
  })

  it('sums up a collapsed category and keeps what needs you, unread, and the open session in sight', () => {
    const members = [
      session('quiet-1'),
      session('unread-1'),
      session('asking-1', asking),
      session('working', { status: 'running' }),
      session('unread-2'),
      session('asking-2', { status: 'error' }),
      session('open'),
      session('quiet-2'),
    ]
    const unread = new Set(['one:unread-1', 'one:unread-2'])

    const view = sessionNavigationView(computers, new Map([['one', members]]), {}, '', 'all', undefined, unread, {
      categories: [lab(members, true)], selectedKey: 'one:open',
    })
    const [section] = view.categories
    expect(section).toMatchObject({ collapsed: true, total: 8, attention: 2, unread: 2, working: true, more: 4 })
    // Needs you comes first, up to three, then the open session, in the category's order.
    expect(section.sessions.map((entry) => entry.id)).toEqual(['unread-1', 'asking-1', 'asking-2', 'open'])
    expect(view.visible.map((entry) => entry.id)).toEqual(['unread-1', 'asking-1', 'asking-2', 'open'])
    expect(stepVisibleSession(view.visible, 'one:asking-2', 1)?.id).toBe('open')

    const quiet = sessionNavigationView(computers, new Map([['one', [first]]]), {}, '', 'all', undefined, undefined, {
      categories: [lab([first], true)],
    })
    expect(quiet.categories[0]).toMatchObject({ sessions: [], total: 1, attention: 0, unread: 0, working: false, more: 1 })
  })

  describe('what a collapsed category keeps in sight', () => {
    const members = [
      session('quiet-1'),
      session('unread-1'),
      session('asking-1', asking),
      session('working', { status: 'running' }),
      session('unread-2'),
      session('asking-2', { status: 'error' }),
      session('open'),
      session('quiet-2'),
    ]
    const unread = new Set(['one:unread-1', 'one:unread-2'])
    const collapsed = (
      collapsedShows?: CollapsedCategoryShows,
      { selectedKey = 'one:open', query = '', filter = 'all', sessions = members, closed = true }: {
        selectedKey?: string | null
        query?: string
        filter?: SessionFilter
        sessions?: ManagedSession[]
        closed?: boolean
      } = {},
    ) => sessionNavigationView(computers, new Map([['one', [...sessions, first]]]), {}, query, filter, undefined, unread, {
      categories: [lab(sessions, closed)], selectedKey: selectedKey ?? undefined, collapsedShows,
    })

    it.each([
      // The default: up to three that need you or are unread, needs you first, and the open session.
      ['attention-unread', ['unread-1', 'asking-1', 'asking-2', 'open']],
      // Unread sessions collapse too.
      ['attention', ['asking-1', 'asking-2', 'open']],
      // Nothing, the open session included.
      ['none', []],
    ] as const)('closed and showing %s, keeps %j in sight and counts all eight alike', (collapsedShows, kept) => {
      const view = collapsed(collapsedShows)
      const [section] = view.categories
      expect(section).toMatchObject({
        collapsed: true, total: 8, attention: 2, unread: 2, working: true, more: 8 - kept.length,
      })
      expect(section.sessions.map((entry) => entry.id)).toEqual(kept)
      expect(view.visible.map((entry) => entry.id)).toEqual([...kept, 'first'])
    })

    it('keeps up to three that need you when only those show, and the open session though it is only unread', () => {
      const many = [...members, session('asking-3', asking), session('asking-4', asking)]
      const [section] = collapsed('attention', { selectedKey: 'one:unread-2', sessions: many }).categories
      expect(section.sessions.map((entry) => entry.id)).toEqual(['asking-1', 'unread-2', 'asking-2', 'asking-3'])
      expect(section).toMatchObject({ total: 10, attention: 4, unread: 2, more: 6, hidesSelected: false })
    })

    it('keeps even the open session out of sight when it shows counts only, and says it is in there', () => {
      const view = collapsed('none')
      expect(view.categories[0]).toMatchObject({ sessions: [], more: 8, countsOnly: true, hidesSelected: true })
      // Next and previous pass it by, as they do a session a filter leaves out.
      expect(stepVisibleSession(view.visible, 'one:open', 1)?.id).toBe('first')
      expect(collapsed('none', { selectedKey: 'one:first' }).categories[0].hidesSelected).toBe(false)
      expect(collapsed('none', { selectedKey: null }).categories[0].hidesSelected).toBe(false)
      for (const shows of [undefined, 'attention-unread', 'attention'] as const) {
        expect(collapsed(shows).categories[0].hidesSelected).toBe(false)
      }
      // Open, it shows every session whatever it keeps when closed.
      const open = collapsed('none', { closed: false }).categories[0]
      expect(open).toMatchObject({ collapsed: false, more: 0, countsOnly: false, hidesSelected: false })
      expect(open.sessions).toEqual(members)
    })

    it('still opens to show its matches while the list is filtered, whatever it keeps in sight closed', () => {
      for (const shows of ['attention-unread', 'attention', 'none'] as const) {
        const searched = collapsed(shows, { query: 'quiet-2' }).categories[0]
        expect(searched).toMatchObject({ collapsed: false, total: 8, more: 0, countsOnly: false, hidesSelected: false })
        expect(searched.sessions.map((entry) => entry.id)).toEqual(['quiet-2'])
        expect(collapsed(shows, { filter: 'unread' }).categories[0].sessions.map((entry) => entry.id))
          .toEqual(['unread-1', 'unread-2'])
      }
    })
  })

  it('shows matches inside their categories, expanded, and leaves out categories without any', () => {
    const match = session('match', { title: 'Backup the router' })
    const other = session('other', { title: 'Plan the week' })
    const view = sessionNavigationView(computers, new Map([['one', [match, other, first]]]), {}, 'router', 'all',
      undefined, undefined, {
        categories: [
          lab([match, other], true),
          { category: { id: 'empty', name: 'Plans', collapsed: false, sessions: ['one:first'] }, sessions: [first] },
        ],
      })
    expect(view.categories).toMatchObject([{ collapsed: false, sessions: [match], total: 2, more: 0 }])
    expect(view.visible).toEqual([match])
    expect(view.reorderDisabled).toBe(true)
    expect(view.counts.all).toBe(3)
  })

  it('leaves a hidden session out of its category unless it needs you or hidden sessions are shown', () => {
    const tucked = session('tucked')
    const waiting = session('waiting', asking)
    const keys = new Set(['one:tucked', 'one:waiting'])
    const sessions = new Map([['one', [first, tucked, waiting]]])
    const categories = [lab([first, tucked, waiting])]

    const view = sessionNavigationView(computers, sessions, {}, '', 'all', { keys, shown: false }, undefined, { categories })
    expect(view.categories[0]).toMatchObject({ sessions: [first, waiting], total: 2 })
    expect(view.counts.hidden).toBe(2)
    expect(sessionNavigationView(computers, sessions, {}, '', 'all', { keys, shown: true }, undefined, { categories })
      .categories[0].sessions).toEqual([first, tucked, waiting])
  })

  it('counts a computer\'s hidden sessions in categories among those it has in categories', () => {
    const tucked = session('tucked')
    const view = sessionNavigationView(computers, new Map([['one', [tucked]]]), {}, '', 'all',
      { keys: new Set(['one:tucked']), shown: false }, undefined, { categories: [lab([tucked])] })
    expect(view.groups[0]).toMatchObject({ sessions: [], total: 0, hidden: 0, categorized: 1 })
    expect(view.categories[0]).toMatchObject({ sessions: [], total: 0 })
  })

  it('keeps an empty category listed until it is filtered', () => {
    const empty = { category: { id: 'empty', name: 'Plans', collapsed: false, sessions: [] }, sessions: [] }
    expect(sessionNavigationView(computers, grouped, {}, '', 'all', undefined, undefined, { categories: [empty] })
      .categories).toMatchObject([{ sessions: [], total: 0, more: 0 }])
    expect(sessionNavigationView(computers, grouped, {}, '', 'unread', undefined, undefined, { categories: [empty] })
      .categories).toEqual([])
  })

  it('keeps the most recently active session a category lists, closed, filtered, or open alike', () => {
    const older = session('older', { updatedAt: '2026-09-01T00:00:00Z' })
    const newest = session('newest', { computerId: 'two', computerName: 'Build node', cwd: '/home/demo/build', updatedAt: '2026-09-03T00:00:00Z' })
    const tucked = session('tucked', { updatedAt: '2026-09-04T00:00:00Z' })
    const undated = session('undated', { updatedAt: 'not a time' })
    const sessions = new Map([['one', [older, tucked, undated]], ['two', [newest]]])
    const categories = [lab([older, undated, newest, tucked], true)]
    const hiddenTucked = { keys: new Set(['one:tucked']), shown: false }

    const view = sessionNavigationView(computers, sessions, {}, '', 'all', hiddenTucked, undefined, { categories })
    // A hidden session the list leaves out is not where its work goes on.
    expect(view.categories[0].latest).toBe(newest)
    expect(sessionNavigationView(computers, sessions, {}, '', 'all', { ...hiddenTucked, shown: true }, undefined, { categories })
      .categories[0].latest).toBe(tucked)
    // A filter that shows only some of its sessions does not change it.
    expect(sessionNavigationView(computers, sessions, {}, 'older', 'all', hiddenTucked, undefined, { categories })
      .categories[0]).toMatchObject({ sessions: [older], latest: newest })
    expect(sessionNavigationView(computers, sessions, {}, '', 'all', undefined, undefined, {
      categories: [{ category: { id: 'empty', name: 'Plans', collapsed: false, sessions: [] }, sessions: [] }],
    }).categories[0].latest).toBeUndefined()
  })

  it('starts a category\'s new session beside its latest one, while that computer and its provider can', () => {
    const byId = new Map(computers.map((computer) => [computer.id, computer]))
    expect(categoryNewSession(undefined, byId)).toEqual({ unavailable: 'Needs a session in it first' })
    expect(categoryNewSession(first, byId)).toEqual({ computer: computers[0], cwd: '/home/demo/notes' })
    expect(categoryNewSession({ ...first, computerId: 'offline' }, byId)).toEqual({ unavailable: 'Travel laptop is offline' })
    const withoutCopilot = new Map<string, ComputerSummary>([['one', {
      ...computers[0],
      providers: [
        { id: 'copilot', name: 'GitHub Copilot', available: false, terminalBacked: true, unavailableReason: 'Sign in to Copilot' },
        { id: 'claude', name: 'Claude Agent', available: true, terminalBacked: false },
      ],
    }]])
    expect(categoryNewSession(first, withoutCopilot)).toEqual({ unavailable: 'GitHub Copilot is unavailable on Studio' })
    expect(categoryNewSession(first, new Map())).toEqual({ unavailable: 'Its computer is no longer paired' })
  })
})
