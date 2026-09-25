import { describe, expect, it } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import { sessionNavigationView, stepVisibleSession } from './session-navigation-view'

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
    expect(view.counts).toEqual({ all: 3, attention: 1, working: 0, suspended: 0 })
    expect(stepVisibleSession(view.visible, 'one:first', 1)).toBeUndefined()
    expect(stepVisibleSession(view.visible, 'one:first', -1)).toBeUndefined()
  })

  it('combines query and attention filters rather than exposing hidden conversations', () => {
    const view = sessionNavigationView(computers, grouped, {}, 'build', 'attention')
    expect(view.visible).toEqual([last])
    expect(view.shown).toBe(1)
    expect(view.filtering).toBe(true)
    expect(stepVisibleSession(view.visible, 'one:first', 1)).toBe(last)
  })

  it('removes suspended sessions from rows and keyboard navigation when hidden', () => {
    const suspended = {
      ...first,
      id: 'paused',
      title: 'Paused planning',
      suspended: true,
    }
    const sessions = new Map(grouped)
    sessions.set('one', [first, hidden, suspended])

    const view = sessionNavigationView(computers, sessions, {}, '', 'all', false)

    expect(view.counts).toEqual({ all: 4, attention: 1, working: 0, suspended: 1 })
    expect(view.visible).toEqual([first, hidden, last])
    expect(view.groups.map((group) => group.computer)).toEqual(computers)
    expect(view.filtering).toBe(true)
    expect(stepVisibleSession(view.visible, 'one:paused', 1)).toBe(first)
    expect(stepVisibleSession(view.visible, 'one:paused', -1)).toBe(last)
  })
})
