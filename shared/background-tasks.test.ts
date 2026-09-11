import { describe, expect, it } from 'vitest'
import type { BackgroundTaskSnapshot } from './contracts.js'
import { hasRunningBackgroundAgent } from './background-tasks.js'

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
  it('includes background agents without treating shells or sync work as turns', () => {
    expect(hasRunningBackgroundAgent(snapshot('agent', 'background'))).toBe(
      true,
    )
    expect(hasRunningBackgroundAgent(snapshot('shell', 'background'))).toBe(
      false,
    )
    expect(hasRunningBackgroundAgent(snapshot('agent', 'sync'))).toBe(false)
  })
})
