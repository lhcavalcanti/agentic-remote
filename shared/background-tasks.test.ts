import { describe, expect, it } from 'vitest'
import type { BackgroundTask, BackgroundTaskSnapshot } from './contracts.js'
import {
  BACKGROUND_TASK_TAIL,
  hasActiveBackgroundTasks,
  hasForegroundTurn,
  hasRunningBackgroundAgent,
  summarizeBackgroundTask,
  summarizeBackgroundTasks,
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

describe('background task summaries', () => {
  const long = (length: number, word = 'output ') => word.repeat(Math.ceil(length / word.length)).slice(0, length)
  const full = (change: Partial<BackgroundTask> = {}): BackgroundTask => ({
    id: 'shell-1',
    type: 'shell',
    description: 'Run the checks',
    status: 'completed',
    startedAt: '2026-11-24T12:00:00.000Z',
    completedAt: '2026-11-24T12:05:00.000Z',
    activeStartedAt: '2026-11-24T12:00:01.000Z',
    activeTimeMs: 299_000,
    error: long(4_000, 'stack '),
    prompt: long(6_000, 'prompt '),
    result: long(5_000, 'result '),
    latestResponse: long(5_000, 'reply '),
    model: 'claude-sonnet-5',
    resolvedModel: 'claude-sonnet-5-20261101',
    executionMode: 'background',
    attachmentMode: 'detached',
    command: long(2_000, 'pnpm vitest run '),
    pid: 4242,
    progress: { type: 'shell', recentOutput: long(12_000), pid: 4242 },
    canCancel: false,
    ...change,
  })

  it('keeps only what a finished task\'s row shows', () => {
    expect(summarizeBackgroundTask(full())).toEqual({
      id: 'shell-1',
      type: 'shell',
      description: 'Run the checks',
      status: 'completed',
      startedAt: '2026-11-24T12:00:00.000Z',
      completedAt: '2026-11-24T12:05:00.000Z',
      activeTimeMs: 299_000,
      canCancel: false,
    })
  })

  it('keeps the last 300 characters of a live task\'s command and output, marked as cut', () => {
    const task = full({ status: 'running', completedAt: undefined, canCancel: true })
    const summary = summarizeBackgroundTask(task)
    expect(BACKGROUND_TASK_TAIL).toBe(300)
    expect(summary).toEqual({
      id: 'shell-1',
      type: 'shell',
      description: 'Run the checks',
      status: 'running',
      startedAt: '2026-11-24T12:00:00.000Z',
      activeTimeMs: 299_000,
      executionMode: 'background',
      attachmentMode: 'detached',
      pid: 4242,
      command: `…${task.command!.slice(-299)}`,
      progress: { type: 'shell', recentOutput: `…${task.progress!.recentOutput!.slice(-299)}`, pid: 4242 },
      canCancel: true,
    })
    // Short text is whole, and says nothing was cut.
    const short = summarizeBackgroundTask(full({
      status: 'queued', command: 'pnpm test', progress: { type: 'shell', recentOutput: 'ok' },
    }))
    expect(short).toMatchObject({ command: 'pnpm test', progress: { type: 'shell', recentOutput: 'ok' } })
  })

  it('keeps a live agent\'s latest intent and its last few activity lines within the bound', () => {
    const lines = Array.from({ length: 40 }, (_, index) => ({
      message: index === 39 ? long(500, 'final ') : `step ${index}`,
      timestamp: `2026-11-24T12:00:${String(index).padStart(2, '0')}.000Z`,
    }))
    const agent = summarizeBackgroundTask(full({
      id: 'agent-1', type: 'agent', status: 'running', agentType: 'general-purpose', command: undefined,
      progress: { type: 'agent', latestIntent: long(400, 'intent '), recentActivity: lines },
    }))
    expect(agent.agentType).toBe('general-purpose')
    expect(agent.progress).toEqual({
      type: 'agent',
      latestIntent: `…${long(400, 'intent ').slice(-299)}`,
      recentActivity: [{ message: `…${lines[39].message.slice(-299)}`, timestamp: lines[39].timestamp }],
    })
    const brief = summarizeBackgroundTask(full({
      id: 'agent-2', type: 'agent', status: 'running', command: undefined,
      progress: { type: 'agent', recentActivity: lines.slice(0, 39) },
    }))
    // As many of the latest as the sheet first shows, while they fit.
    expect(brief.progress?.recentActivity).toEqual(lines.slice(34, 39))
  })

  it('cuts a long title at its end, and a task id never', () => {
    const summary = summarizeBackgroundTask(full({ id: 'x'.repeat(400), description: long(20_000, 'title ') }))
    expect(summary.id).toBe('x'.repeat(400))
    expect(summary.description).toBe(`${long(20_000, 'title ').slice(0, 299)}…`)
  })

  it('never splits a character in two', () => {
    const emoji = '😀'.repeat(400)
    const summary = summarizeBackgroundTask(full({ status: 'running', command: emoji, description: emoji }))
    for (const text of [summary.command!, summary.description]) {
      expect(text.length).toBeLessThanOrEqual(BACKGROUND_TASK_TAIL)
      expect(text).toMatch(/^…?(?:😀)+…?$/u)
    }
  })

  it('is bounded however much text a task has, and the same when summarized again', () => {
    const huge = long(20_000)
    const task = full({
      status: 'running', description: huge, command: huge, agentType: huge,
      progress: {
        type: 'agent', latestIntent: huge, recentOutput: huge,
        recentActivity: Array.from({ length: 40 }, () => ({ message: huge, timestamp: '2026-11-24T12:00:00.000Z' })),
      },
    })
    const summary = summarizeBackgroundTask(task)
    // Six texts at most, each cut, beside the fields every task has.
    expect(JSON.stringify(summary).length).toBeLessThan(6 * BACKGROUND_TASK_TAIL + 500)
    expect(summarizeBackgroundTask(summary)).toEqual(summary)
    expect(summarizeBackgroundTask(summarizeBackgroundTask(full()))).toEqual(summarizeBackgroundTask(full()))
  })

  it('marks a list of summaries and keeps its counts', () => {
    const snapshot: BackgroundTaskSnapshot = {
      tasks: [full(), full({ id: 'shell-2', status: 'running', completedAt: undefined })],
      runningCount: 1,
      supported: true,
    }
    const summarized = summarizeBackgroundTasks(snapshot)
    expect(summarized).toEqual({
      tasks: snapshot.tasks.map(summarizeBackgroundTask),
      runningCount: 1,
      supported: true,
      summary: true,
    })
    // The full list is left as it was.
    expect(snapshot.tasks[0].prompt).toHaveLength(6_000)
    expect(summarizeBackgroundTasks(summarized)).toEqual(summarized)
  })
})
