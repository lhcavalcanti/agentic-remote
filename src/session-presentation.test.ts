import { describe, expect, it } from 'vitest'
import type { BackgroundTaskSnapshot, ManagedSession } from '../shared/contracts'
import {
  executionModeName,
  matchesSessionSearch,
  providerName,
  sessionKey,
  sessionPresentation,
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
  it('keeps identity scoped to the computer and preserves legacy provider labels', () => {
    expect(sessionKey(session)).toBe('studio:same-id')
    expect(sessionKey({ ...session, computerId: 'worker' })).toBe('worker:same-id')
    expect(providerName(undefined)).toBe('GitHub Copilot')
    expect(executionModeName(undefined)).toBeUndefined()
    expect(shortPath('/home/demo/projects/field-notes')).toBe('~/projects/field-notes')
    expect(shortPath('/srv/notes')).toBe('/srv/notes')
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
      .toMatchObject({ state: 'offline', working: false, needsAttention: false })
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
