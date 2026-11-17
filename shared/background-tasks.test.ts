import { describe, expect, it } from 'vitest'
import type { BackgroundTaskSnapshot } from './contracts.js'
import {
  hasActiveBackgroundTasks,
  hasForegroundTurn,
  hasRunningBackgroundAgent,
} from './background-tasks.js'

function snapshot(
  type: 'agent' | 'shell',
  executionMode: 'sync' | 'background',
): BackgroundTaskSnapshot {
  return {
    tasks: [
      {
        id: 'task',
        type,
        description: 'Fixture task',
        status: 'running',
        startedAt: '2026-09-07T20:00:00.000Z',
        executionMode,
        canCancel: false,
      },
    ],
    runningCount: executionMode === 'background' ? 1 : 0,
    supported: true,
  }
}

describe('running background agent detection', () => {
  it('distinguishes aggregate background work from an actual foreground turn', () => {
    const session = { status: 'running' as const, messages: [] }
    const background = snapshot('agent', 'background')
    expect(hasForegroundTurn({ ...session, foregroundTurnActive: false }, background)).toBe(false)
    expect(hasForegroundTurn({ ...session, foregroundTurnActive: true }, background)).toBe(true)
    expect(hasForegroundTurn({ status: 'idle', messages: [] }, background)).toBe(false)
  })

  it('keeps legacy background-only sessions directly sendable without guessing steering support', () => {
    const session = { status: 'running' as const, messages: [] }
    expect(hasForegroundTurn(session, snapshot('agent', 'background'))).toBe(false)
    expect(hasForegroundTurn(session, snapshot('shell', 'background'))).toBe(false)
    expect(hasForegroundTurn(session)).toBe(true)
    expect(hasForegroundTurn(session, snapshot('agent', 'sync'))).toBe(true)
    expect(hasForegroundTurn({
      ...session,
      messages: [{ id: 'foreground', role: 'assistant', content: '', streaming: true, createdAt: '2026-09-07T20:00:00Z' }],
    }, snapshot('agent', 'background'))).toBe(true)
  })

  it('includes background agents without treating shells or sync work as turns', () => {
    expect(hasRunningBackgroundAgent(snapshot('agent', 'background'))).toBe(
      true,
    )
    expect(hasRunningBackgroundAgent(snapshot('shell', 'background'))).toBe(
      false,
    )
    expect(hasRunningBackgroundAgent(snapshot('agent', 'sync'))).toBe(false)
  })

  it('treats queued and running work of either kind as active', () => {
    for (const status of ['queued', 'running'] as const) {
      const active = snapshot('shell', 'sync')
      active.tasks[0].status = status
      expect(hasActiveBackgroundTasks(active)).toBe(true)
    }
    const completed = snapshot('agent', 'background')
    completed.tasks[0].status = 'completed'
    expect(hasActiveBackgroundTasks(completed)).toBe(false)
    expect(hasActiveBackgroundTasks(undefined)).toBe(false)
  })
})
