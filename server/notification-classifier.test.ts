import { describe, expect, it } from 'vitest'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import {
  classifyHubNotification,
  classifyOracleNotification,
  notificationIdentity,
  type NotificationCursors,
} from './notification-classifier.js'

const now = '2026-11-14T06:00:00.000Z'
const running: ManagedSession = {
  computerId: 'computer', computerName: 'Worker', id: 'session', title: 'Review',
  cwd: '/project', status: 'running', updatedAt: now, isOpen: true,
  messages: [{ id: 'root-1', role: 'user', content: 'Review the code', createdAt: now }],
}

describe('canonical hub notification classifier', () => {
  it.each<[string, Partial<ManagedSession>, string, string]>([
    ['completed', { status: 'idle' }, 'session.completed', 'info'],
    ['failed', { status: 'error' }, 'session.failed', 'error'],
    ['waiting', { status: 'waiting' }, 'session.needs-input', 'warning'],
    ['permission', { status: 'waiting', pendingPermission: { requestId: 'request', title: 'Run?', options: [] } }, 'session.needs-input', 'warning'],
    ['question', { status: 'waiting', pendingUserInput: { requestId: 'request', question: 'Where?', choices: [], allowFreeform: true } }, 'session.needs-input', 'warning'],
  ])('maps %s before channel suppression', (_name, update, kind, severity) => {
    const cursors: NotificationCursors = {}
    expect(classifyHubNotification({ type: 'session.upserted', session: running }, cursors, now)).toEqual([])
    const records = classifyHubNotification({ type: 'session.upserted', session: { ...running, ...update } }, cursors, now)
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({ kind, severity, computerId: 'computer', sessionId: 'session', muted: false })
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, ...update }, summary: true }, cursors, now)).toEqual([])
  })

  it('uses durable root and request IDs, not arrival time, title, revision or message text', () => {
    function finish(update: Partial<ManagedSession>) {
      const cursors: NotificationCursors = {}
      classifyHubNotification({ type: 'session.upserted', session: { ...running, computerId: update.computerId ?? running.computerId } }, cursors, now)
      return classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'idle', ...update } }, cursors, '2026-11-14T07:00:00.000Z')[0]!.id
    }
    expect(finish({})).toBe(finish({ revision: 99, title: 'Renamed', updatedAt: '2026-11-14T08:00:00Z' }))
    expect(finish({ computerId: 'other' })).not.toBe(finish({}))
    const question: HubEvent = {
      type: 'session.upserted',
      session: { ...running, pendingUserInput: { requestId: 'request-1', question: 'A?', choices: [], allowFreeform: true } },
    }
    const first = classifyHubNotification(question, {}, now)[0]!
    question.session.pendingUserInput!.question = 'Renamed?'
    expect(classifyHubNotification(question, {}, '2026-11-14T08:00:00.000Z')[0]!.id).toBe(first.id)
    question.session.pendingUserInput!.requestId = 'request-2'
    expect(classifyHubNotification(question, {}, now)[0]!.id).not.toBe(first.id)
    expect(notificationIdentity('session.completed', 'a:b', 'c')).not.toBe(notificationIdentity('session.completed', 'a', 'b:c'))
  })

  it('keeps roster roots, ignores old revisions, and distinguishes successive turns', () => {
    const cursors: NotificationCursors = {}
    classifyHubNotification({ type: 'session.upserted', session: { ...running, revision: 2 } }, cursors, now)
    const done = { ...running, revision: 3, status: 'idle' as const, messages: [] }
    const first = classifyHubNotification({ type: 'session.upserted', session: done, summary: true }, cursors, now)[0]!
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, revision: 1 } }, cursors, now)).toEqual([])
    const next = { ...running, revision: 4, messages: [{ ...running.messages[0]!, id: 'root-2' }] }
    classifyHubNotification({ type: 'session.upserted', session: next }, cursors, now)
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...next, revision: 5, status: 'idle' } }, cursors, now)[0]!.id).not.toBe(first.id)
  })

  it.each([
    { queuedCount: 1 }, { suspended: true }, { pendingPermission: { requestId: 'p', title: 'Run?', options: [] } },
    { restartRecovery: { state: 'recovering' as const, detectedAt: now } }, { recoverySeedState: 'pending' as const },
    { terminalQueueDispatchPending: true }, { recoveryAcknowledgementPending: true },
  ])('does not fabricate completion while work is still owned: %j', (update) => {
    const cursors: NotificationCursors = {}
    classifyHubNotification({ type: 'session.upserted', session: running }, cursors, now)
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'idle', ...update } }, cursors, now)
      .some((record) => record.kind === 'session.completed')).toBe(false)
  })

  it('does not announce terminal history, missing roots, quiet errors, or an initially offline computer', () => {
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'idle' } }, {}, now)).toEqual([])
    const cursors: NotificationCursors = {}
    classifyHubNotification({ type: 'session.upserted', session: { ...running, messages: [] } }, cursors, now)
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'idle', messages: [] } }, cursors, now)).toEqual([])
    expect(classifyHubNotification({ type: 'error', message: 'Quiet error' }, {}, now)).toEqual([])
    expect(classifyHubNotification({ type: 'computer.updated', computer: { id: 'c', name: 'Worker', online: false, isLocal: false } }, {}, now)).toEqual([])
  })

  it('does not reuse the previous turn root when a new transcript-free turn starts', () => {
    const cursors: NotificationCursors = {}
    classifyHubNotification({ type: 'session.upserted', session: running }, cursors, now)
    classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'idle' } }, cursors, now)
    classifyHubNotification({ type: 'session.upserted', session: { ...running, messages: [] }, summary: true }, cursors, now)
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'idle', messages: [] }, summary: true }, cursors, now)).toEqual([])
  })

  it('classifies existing health alerts and durable offline episodes', () => {
    expect(classifyHubNotification({ type: 'error', notify: true, computerId: 'c', message: 'CLI unavailable' }, {}, now)[0])
      .toMatchObject({ kind: 'host.alert', severity: 'error' })
    const cursors: NotificationCursors = {}
    const computer = { id: 'c', name: 'Worker', online: true, isLocal: false, lifecycleGeneration: 'pairing-1' }
    classifyHubNotification({ type: 'computer.updated', computer }, cursors, now)
    const first = classifyHubNotification({ type: 'computer.updated', computer: { ...computer, online: false } }, cursors, now)[0]!
    expect(first.kind).toBe('computer.offline')
    expect(classifyHubNotification({ type: 'computer.updated', computer: { ...computer, online: false } }, cursors, now)).toEqual([])
    classifyHubNotification({ type: 'computer.updated', computer }, cursors, now)
    expect(classifyHubNotification({ type: 'computer.updated', computer: { ...computer, online: false } }, cursors, now)[0]!.id).not.toBe(first.id)
  })

  it('records failures and needs-input even with queued work; root IDs cannot alias request namespaces', () => {
    const cursors: NotificationCursors = {}
    classifyHubNotification({ type: 'session.upserted', session: running }, cursors, now)
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'error', queuedCount: 1 } }, cursors, now)[0])
      .toMatchObject({ kind: 'session.failed' })
    classifyHubNotification({ type: 'session.upserted', session: running }, cursors, now)
    expect(classifyHubNotification({ type: 'session.upserted', session: { ...running, status: 'waiting', queuedCount: 1 } }, cursors, now)[0])
      .toMatchObject({ kind: 'session.needs-input' })
    const rootSession = { ...running, messages: [{ ...running.messages[0]!, id: 'permission:request' }] }
    const rootCursors: NotificationCursors = {}
    classifyHubNotification({ type: 'session.upserted', session: rootSession }, rootCursors, now)
    const root = classifyHubNotification({ type: 'session.upserted', session: { ...rootSession, status: 'waiting' } }, rootCursors, now)[0]!
    const request = classifyHubNotification({ type: 'session.upserted', session: {
      ...rootSession, pendingPermission: { requestId: 'request', title: 'Run?', options: [] },
    } }, {}, now)[0]!
    expect(request.id).not.toBe(root.id)
  })

  it.each([
    [{ id: 'reply', role: 'assistant', content: 'Done', replyTo: 'user' }, 'info'],
    [{ id: 'user', role: 'user', content: 'Status?', state: 'done' }, 'info'],
    [{ id: 'user', role: 'user', content: 'Status?', state: 'failed', error: 'Offline' }, 'error'],
    [{ id: 'confirm', role: 'activity', content: 'Close?', confirmation: { kind: 'close-session', computerId: 'c', sessionId: 's', title: 'Review', state: 'pending' } }, 'warning'],
  ] as const)('classifies Oracle messages independently of presence: %j', (message, severity) => {
    const event: ManagerEvent = { type: 'manager.message', message: { ...message, createdAt: now } }
    const result = classifyOracleNotification(event, now)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ kind: 'oracle.message', severity, url: '/?oracle=open' })
    expect(classifyOracleNotification(event, '2026-11-14T09:00:00.000Z')[0]!.id).toBe(result[0]!.id)
  })
})
