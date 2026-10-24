import { describe, expect, it } from 'vitest'
import type { BackgroundTaskSnapshot, ManagedSession } from '../shared/contracts'
import {
  executionModeName,
  matchesSessionSearch,
  orderSessionLane,
  pendingSessionPlacements,
  providerName,
  sessionKey,
  sessionPresentation,
  sessionSortFrom,
  sessionActivityTime,
  sortSessionView,
  shortPath,
} from './session-presentation'

const session: ManagedSession = {
  id: 'same-id',
  computerId: 'studio',
  computerName: 'Studio',
  title: 'Review the release plan',
  cwd: '/home/demo/projects/field-notes',
  provider: 'claude',
  executionMode: 'sdk',
  status: 'idle',
  messages: [],
  updatedAt: '2026-09-01T00:00:00Z',
}
const tasks: BackgroundTaskSnapshot = {
  tasks: [],
  runningCount: 2,
  supported: true,
}

describe('session presentation', () => {
  it('does not show a missing process as working even with stale running tasks', () => {
    expect(sessionPresentation({
      ...session, status: 'running',
      interruption: { detectedAt: '2026-10-19T06:52:00Z', previousStatus: 'running' },
    }, tasks)).toMatchObject({ working: false, needsAttention: true, label: 'Interrupted' })
  })

  it('distinguishes active SDK recovery from an interrupted session', () => {
    expect(sessionPresentation({
      ...session,
      status: 'error',
      interruption: { detectedAt: '2026-10-24T00:00:00Z', previousStatus: 'running' },
      restartRecovery: {
        state: 'recovering',
        detectedAt: '2026-10-24T00:00:00Z',
        message: 'Restoring provider history.',
      },
    })).toMatchObject({
      state: 'recovering',
      label: 'Recovering',
      description: 'Restoring provider history.',
      needsAttention: false,
      working: true,
    })

    expect(sessionPresentation({
      ...session,
      status: 'waiting',
      interruption: { detectedAt: '2026-10-24T00:00:00Z', previousStatus: 'waiting' },
      restartRecovery: {
        state: 'waiting-permission',
        detectedAt: '2026-10-24T00:00:00Z',
      },
      pendingPermission: {
        requestId: 'permission',
        title: 'Run a controlled command',
        options: [],
      },
    })).toMatchObject({
      state: 'permission',
      label: 'Permission',
      needsAttention: true,
      working: false,
    })
  })

  it('keeps identity scoped to the computer and preserves legacy provider labels', () => {
    expect(sessionKey(session)).toBe('studio:same-id')
    expect(sessionKey({ ...session, computerId: 'worker' })).toBe('worker:same-id')
    expect(providerName(undefined)).toBe('GitHub Copilot')
    expect(executionModeName(undefined)).toBeUndefined()
    expect(shortPath('/home/demo/projects/field-notes')).toBe('~/projects/field-notes')
    expect(shortPath('/srv/notes')).toBe('/srv/notes')
  })

  describe('session ordering', () => {
    const older = { ...session, id: 'older', title: 'Task 10', updatedAt: '2026-08-01T00:00:00Z' }
    const newer = { ...session, id: 'newer', title: 'task 2', updatedAt: '2026-09-01T00:00:00Z' }

    it('keeps custom order intact and never mutates the input', () => {
      const original = [older, newer]
      const sorted = sortSessionView(original, 'custom', {})
      expect(sorted).toEqual(original)
      expect(sorted).not.toBe(original)
      sortSessionView(original, 'recent', {})
      expect(original).toEqual([older, newer])
      expect(sessionSortFrom('unknown')).toBe('custom')
    })

    it('sorts actual timestamps and leaves invalid activity dates last', () => {
      const invalid = { ...session, id: 'invalid', updatedAt: 'invalid' }
      const offset = { ...session, id: 'offset', updatedAt: '2026-09-01T01:00:00+02:00' }
      expect(sortSessionView([invalid, older, offset, newer], 'recent', {}).map((item) => item.id))
        .toEqual(['newer', 'offset', 'older', 'invalid'])
    })

    it('prioritizes actionable questions and permissions over running work', () => {
      const question = {
        ...older, id: 'question',
        pendingUserInput: { requestId: 'q', question: 'Choose?', choices: [], allowFreeform: true },
      }
      const permission = {
        ...older, id: 'permission',
        pendingPermission: { requestId: 'p', title: 'Allow?', options: [] },
      }
      const working = { ...newer, id: 'working', status: 'running' as const }
      const background = { ...newer, id: 'background' }
      const waiting = { ...newer, id: 'waiting', status: 'waiting' as const }
      const error = { ...newer, id: 'error', status: 'error' as const }
      expect(sortSessionView(
        [newer, working, error, permission, waiting, background, question],
        'attention',
        { 'studio:background': tasks },
      ).map((item) => item.id)).toEqual([
        'question', 'permission', 'waiting', 'error', 'working', 'background', 'newer',
      ])
    })

    it('sorts names naturally and retains custom order for ties', () => {
      const first = { ...session, id: 'first', title: 'Task 1' }
      expect(sortSessionView([older, newer, first], 'name', {}).map((item) => item.id))
        .toEqual(['first', 'newer', 'older'])
      expect(sortSessionView([session, { ...session, id: 'tie' }], 'name', {}).map((item) => item.id))
        .toEqual(['same-id', 'tie'])
    })

    it('orders a lane by its custom rank before applying the view sort', () => {
      const unranked = { ...session, id: 'unranked', updatedAt: '2026-10-01T00:00:00Z' }
      const lane = orderSessionLane(
        [unranked, newer, older],
        ['studio:older', 'studio:newer'],
        'custom',
        {},
      )
      expect(lane.map((item) => item.id)).toEqual(['older', 'newer', 'unranked'])
      expect(orderSessionLane([unranked, newer, older], ['studio:older'], 'recent', {})
        .map((item) => item.id)).toEqual(['unranked', 'newer', 'older'])
    })

    describe('pending creation placement', () => {
      const creation = {
        id: 'pending-1',
        computerId: 'studio',
        cwd: '~/projects/kiln',
        provider: 'copilot' as const,
        executionMode: 'tmux' as const,
      }
      const lane = [newer, older]
      const order = ['studio:newer', 'studio:older']

      it('places a creation where the custom order will append its session', () => {
        expect(pendingSessionPlacements(lane, [creation], order, 'custom', {}))
          .toEqual([{ id: 'pending-1', followers: [] }])
        const unranked = { ...session, id: 'unranked', updatedAt: '2026-08-15T00:00:00Z' }
        expect(pendingSessionPlacements(
          [newer, unranked, older], [creation], order, 'custom', {},
        )).toEqual([{ id: 'pending-1', followers: [] }])
      })

      it('keeps a pending creation in place when the one before it finishes', () => {
        const later = { ...creation, id: 'pending-2' }
        expect(pendingSessionPlacements(lane, [creation, later], order, 'custom', {}))
          .toEqual([
            { id: 'pending-1', followers: [] },
            { id: 'pending-2', followers: [] },
          ])
        const finished = { ...newer, id: 'pending-1-session', updatedAt: '2026-09-02T00:00:00Z' }
        const after = [finished, ...lane]
        const appended = [...order, 'studio:pending-1-session']
        expect(orderSessionLane(after, appended, 'custom', {}).map((item) => item.id))
          .toEqual(['newer', 'older', 'pending-1-session'])
        expect(pendingSessionPlacements(after, [later], appended, 'custom', {}))
          .toEqual([{ id: 'pending-2', followers: [] }])
        expect(pendingSessionPlacements(lane, [creation, later], order, 'recent', {})[0].id)
          .toBe('pending-2')
        expect(pendingSessionPlacements(after, [later], appended, 'recent', {}))
          .toEqual([{ id: 'pending-2', followers: ['studio:pending-1-session', 'studio:newer', 'studio:older'] }])
      })

      it('places the newest creation first by recent activity', () => {
        const later = { ...creation, id: 'pending-2' }
        expect(pendingSessionPlacements(lane, [creation, later], order, 'recent', {}))
          .toEqual([
            { id: 'pending-2', followers: ['studio:newer', 'studio:older'] },
            { id: 'pending-1', followers: ['studio:newer', 'studio:older'] },
          ])
        const future = { ...newer, id: 'future', updatedAt: '2099-01-01T00:00:00Z' }
        expect(pendingSessionPlacements([future, ...lane], [creation], order, 'recent', {}))
          .toEqual([{ id: 'pending-1', followers: ['studio:future', 'studio:newer', 'studio:older'] }])
      })

      it('places a creation as an idle session in attention order', () => {
        const working = { ...older, id: 'working', status: 'running' as const }
        const question = {
          ...older, id: 'question',
          pendingUserInput: { requestId: 'q', question: 'Choose?', choices: [], allowFreeform: true },
        }
        const suspended = { ...newer, id: 'suspended', suspended: true }
        expect(pendingSessionPlacements(
          [suspended, newer, working, question], [creation], [], 'attention', {},
        )).toEqual([{ id: 'pending-1', followers: ['studio:newer', 'studio:suspended'] }])
      })

      it('places a creation by its folder name, after equal names', () => {
        const kiln = { ...older, id: 'kiln', title: 'kiln' }
        const atlas = { ...older, id: 'atlas', title: 'atlas' }
        const zinc = { ...older, id: 'zinc', title: 'zinc' }
        expect(pendingSessionPlacements(
          [zinc, kiln, atlas], [creation], ['studio:zinc', 'studio:kiln', 'studio:atlas'], 'name', {},
        )).toEqual([{ id: 'pending-1', followers: ['studio:zinc'] }])
        expect(pendingSessionPlacements(
          [zinc], [{ ...creation, cwd: '/', provider: 'claude' }], [], 'name', {},
        )).toEqual([{ id: 'pending-1', followers: ['studio:zinc'] }])
      })
    })

    it('shows local activity time with full context and an explicit unknown state', () => {
      const stamp = '2026-09-01T10:00:00Z'
      const result = sessionActivityTime(stamp, new Date('2026-09-01T12:00:00Z'))
      expect(result.dateTime).toBe(stamp)
      expect(result.title).toContain('Last activity:')
      expect(result.label).toBe(new Intl.DateTimeFormat(undefined, {
        hour: 'numeric', minute: '2-digit',
      }).format(new Date(stamp)))
      expect(sessionActivityTime('bad')).toEqual({
        label: '--', title: 'Activity time unavailable',
      })
    })
  })

  it('prioritizes questions and permissions over passive status and background work', () => {
    const pendingPermission = { requestId: 'permission', title: 'Allow access?', options: [] }
    const pendingUserInput = {
      requestId: 'question',
      question: 'Which option?',
      choices: [],
      allowFreeform: true,
    }
    expect(sessionPresentation({
      ...session, status: 'running', pendingPermission, pendingUserInput,
    }, tasks)).toMatchObject({
      state: 'question', needsAttention: true, working: false,
    })
    expect(sessionPresentation({
      ...session, pendingPermission,
    }, tasks)).toMatchObject({
      state: 'permission', needsAttention: true, working: false,
    })
  })

  it.each(['waiting', 'error'] as const)('keeps %s ahead of tasks', (status) => {
    expect(sessionPresentation({ ...session, status }, tasks)).toMatchObject({
      state: status, needsAttention: true, working: false,
    })
  })

  it('prioritizes foreground Working status over running background tasks', () => {
    expect(sessionPresentation({ ...session, status: 'running' }, tasks))
      .toEqual({
        state: 'running',
        label: 'Working',
        description: 'Working',
        working: true,
        needsAttention: false,
      })
  })

  it('recognizes idle foreground sessions with background work without inventing completion', () => {
    expect(sessionPresentation(session, tasks)).toMatchObject({
      state: 'tasks', working: true, needsAttention: false,
    })
    expect(sessionPresentation({ ...session, status: 'running' })).toMatchObject({
      state: 'running', working: true,
    })
    expect(sessionPresentation(session)).toMatchObject({
      state: 'idle', label: 'Idle', working: false,
    })
    expect(sessionPresentation({ ...session, suspended: true }, tasks)).toMatchObject({
      state: 'suspended', working: false,
    })
  })

  it('does not advertise cached offline work as live, but keeps its attention discoverable', () => {
    expect(sessionPresentation({ ...session, status: 'running' }, tasks, false))
      .toMatchObject({
        state: 'offline',
        working: false,
        needsAttention: false,
        description: 'Computer offline. Last known state: working.',
      })
    expect(sessionPresentation({ ...session, status: 'waiting' }, tasks, false))
      .toMatchObject({
        state: 'offline',
        working: false,
        needsAttention: true,
        description: 'Computer offline. Last known state: waiting.',
      })
  })

  it('keeps a persisted delivery failure discoverable even when passive status returns to idle', () => {
    const failed = {
      ...session,
      failedPrompt: { content: 'A prompt still needs recovery', failedAt: '2026-09-05T00:00:00Z' },
    }
    expect(sessionPresentation(failed, tasks)).toMatchObject({
      state: 'error', needsAttention: true, working: false,
    })
    expect(sessionPresentation(failed, tasks, false)).toMatchObject({
      state: 'offline', needsAttention: true, working: false,
    })
  })

  it('keeps an uncertain queued dispatch in Needs you without implying it was unsent', () => {
    const held = {
      ...session,
      queuedDispatch: {
        promptId: 'q2', attemptId: 'attempt-1', state: 'uncertain' as const,
        content: 'Check this delivery', startedAt: '2026-09-05T00:00:00Z',
      },
    }
    expect(sessionPresentation(held, tasks)).toMatchObject({
      state: 'unconfirmed', label: 'Check delivery', needsAttention: true, working: false,
    })
    expect(sessionPresentation(held, tasks, false)).toMatchObject({
      state: 'offline', needsAttention: true, working: false,
    })
    expect(sessionPresentation({
      ...held,
      pendingUserInput: { requestId: 'question', question: 'Still waiting?', choices: [], allowFreeform: true },
    }, tasks)).toMatchObject({ state: 'question', needsAttention: true })
  })

  it('can search the current computer name without rewriting cached session metadata', () => {
    expect(matchesSessionSearch(session, 'renamed studio', 'Renamed Studio')).toBe(true)
    expect(session.computerName).toBe('Studio')
  })

  it.each([
    ['  STUDIO  claude ', true],
    ['sdk release', true],
    ['~/projects/field-notes', true],
    ['/home/demo', true],
    ['studio copilot', false],
    ['not-present', false],
    ['   ', true],
  ])('searches title, computer, provider, mode, and folder: %s', (query, matches) => {
    expect(matchesSessionSearch(session, query)).toBe(matches)
  })
})
