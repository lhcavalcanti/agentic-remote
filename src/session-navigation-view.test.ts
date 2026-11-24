import { describe, expect, it } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import {
  reorderSessionLaneWithHiddenFollowers,
  sessionNavigationView,
  stepVisibleSession,
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
