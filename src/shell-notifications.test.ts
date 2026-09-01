import { describe, expect, it } from 'vitest'
import {
  notificationState,
  shellNotifications,
  type NotifiableSession,
} from './shell-notifications'

function session(
  overrides: Partial<NotifiableSession> & Pick<NotifiableSession, 'id'>,
): NotifiableSession {
  return {
    computerId: 'dev',
    title: 'Fix login',
    status: 'idle',
    ...overrides,
  }
}

const computerNames = new Map([['dev', 'development']])

describe('notificationState', () => {
  it('captures status and pending request identity', () => {
    const state = notificationState([
      session({
        id: 's1',
        status: 'running',
        pendingUserInput: { requestId: 'q1' },
        pendingPermission: { requestId: 'p1' },
      }),
    ])
    expect(state.get('dev:s1')).toEqual({
      status: 'running',
      question: 'q1',
      permission: 'p1',
    })
  })

  it('treats a pending request without an id as present', () => {
    const state = notificationState([
      session({ id: 's1', pendingUserInput: {} }),
    ])
    expect(state.get('dev:s1')?.question).toBe('pending')
  })

  it('records absent requests as undefined', () => {
    expect(notificationState([session({ id: 's1' })]).get('dev:s1')).toEqual({
      status: 'idle',
      question: undefined,
      permission: undefined,
    })
  })
})

describe('shellNotifications', () => {
  it('raises nothing for a session seen for the first time', () => {
    expect(
      shellNotifications(
        [session({ id: 's1', pendingUserInput: { requestId: 'q1' } })],
        { previous: new Map() },
      ),
    ).toEqual([])
  })

  it('announces a new question as urgent and names the computer', () => {
    const previous = notificationState([session({ id: 's1' })])
    expect(
      shellNotifications(
        [session({ id: 's1', pendingUserInput: { requestId: 'q1' } })],
        { previous, computerNames },
      ),
    ).toEqual([
      {
        tag: 'agentic-question-dev-s1',
        title: 'development · Fix login',
        body: 'Waiting for your answer.',
        urgent: true,
      },
    ])
  })

  it('announces a new permission as urgent', () => {
    const previous = notificationState([session({ id: 's1' })])
    const [notification] = shellNotifications(
      [session({ id: 's1', pendingPermission: { requestId: 'p1' } })],
      { previous, computerNames },
    )
    expect(notification?.tag).toBe('agentic-action-dev-s1')
    expect(notification?.urgent).toBe(true)
  })

  it('prefers a question over a simultaneous permission', () => {
    const previous = notificationState([session({ id: 's1' })])
    const raised = shellNotifications(
      [
        session({
          id: 's1',
          pendingUserInput: { requestId: 'q1' },
          pendingPermission: { requestId: 'p1' },
        }),
      ],
      { previous, computerNames },
    )
    expect(raised).toHaveLength(1)
    expect(raised[0]?.tag).toBe('agentic-question-dev-s1')
  })

  it('announces completion at low urgency and says no action is needed', () => {
    const previous = notificationState([session({ id: 's1', status: 'running' })])
    expect(
      shellNotifications([session({ id: 's1', status: 'idle' })], {
        previous,
        computerNames,
      }),
    ).toEqual([
      {
        tag: 'agentic-finished-dev-s1',
        title: 'development · Fix login',
        body: 'Finished. No action needed.',
        urgent: false,
      },
    ])
  })

  it('does not repeat a question that is still pending', () => {
    const pending = session({ id: 's1', pendingUserInput: { requestId: 'q1' } })
    const previous = notificationState([pending])
    expect(shellNotifications([pending], { previous })).toEqual([])
  })

  it('announces a second question with a new request id', () => {
    const previous = notificationState([
      session({ id: 's1', pendingUserInput: { requestId: 'q1' } }),
    ])
    expect(
      shellNotifications(
        [session({ id: 's1', pendingUserInput: { requestId: 'q2' } })],
        { previous },
      ),
    ).toHaveLength(1)
  })

  it('stays silent for a muted session', () => {
    const previous = notificationState([session({ id: 's1' })])
    expect(
      shellNotifications(
        [session({ id: 's1', pendingUserInput: { requestId: 'q1' } })],
        { previous, mutedKeys: ['dev:s1'] },
      ),
    ).toEqual([])
  })

  it('stays silent for the open session while the window is visible', () => {
    const previous = notificationState([session({ id: 's1' })])
    expect(
      shellNotifications(
        [session({ id: 's1', pendingUserInput: { requestId: 'q1' } })],
        { previous, activeKey: 'dev:s1', documentVisible: true },
      ),
    ).toEqual([])
  })

  it('still announces the open session when the window is hidden', () => {
    const previous = notificationState([session({ id: 's1' })])
    expect(
      shellNotifications(
        [session({ id: 's1', pendingUserInput: { requestId: 'q1' } })],
        { previous, activeKey: 'dev:s1', documentVisible: false },
      ),
    ).toHaveLength(1)
  })

  it('does not announce a run that started', () => {
    const previous = notificationState([session({ id: 's1', status: 'idle' })])
    expect(
      shellNotifications([session({ id: 's1', status: 'running' })], {
        previous,
      }),
    ).toEqual([])
  })

  it('does not treat an error as a completion', () => {
    const previous = notificationState([session({ id: 's1', status: 'running' })])
    expect(
      shellNotifications([session({ id: 's1', status: 'error' })], { previous }),
    ).toEqual([])
  })

  it('falls back to a placeholder title and omits an unknown computer', () => {
    const previous = notificationState([session({ id: 's1', title: '  ' })])
    const [notification] = shellNotifications(
      [
        session({
          id: 's1',
          title: '  ',
          pendingUserInput: { requestId: 'q1' },
        }),
      ],
      { previous, computerNames: new Map() },
    )
    expect(notification?.title).toBe('Untitled session')
  })

  it('reports one notification per changed session', () => {
    const previous = notificationState([
      session({ id: 's1' }),
      session({ id: 's2', status: 'running' }),
    ])
    const raised = shellNotifications(
      [
        session({ id: 's1', pendingUserInput: { requestId: 'q1' } }),
        session({ id: 's2', status: 'idle' }),
      ],
      { previous, computerNames },
    )
    expect(raised.map((entry) => entry.tag)).toEqual([
      'agentic-question-dev-s1',
      'agentic-finished-dev-s2',
    ])
  })
})
