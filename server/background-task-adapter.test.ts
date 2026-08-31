import type { SessionEvent } from '@github/copilot-sdk'
import { describe, expect, it } from 'vitest'
import {
  backgroundTasksFromEvents,
  MAX_TASK_ACTIVITY_LINES,
  MAX_TASK_TEXT_LENGTH,
  normalizeBackgroundTask,
} from './background-task-adapter.js'

describe('background task adapter', () => {
  it('normalizes SDK idle tasks as queued and bounds task output', () => {
    const task = normalizeBackgroundTask(
      {
        type: 'agent',
        id: 'task-1',
        description: 'A'.repeat(MAX_TASK_TEXT_LENGTH + 10),
        status: 'idle',
        startedAt: '2026-08-31T18:00:00.000Z',
        prompt: 'P'.repeat(MAX_TASK_TEXT_LENGTH + 10),
      },
      {
        type: 'agent',
        latestIntent: 'Inspecting the repository',
        recentActivity: Array.from(
          { length: MAX_TASK_ACTIVITY_LINES + 10 },
          (_, index) => ({
            message: `activity-${index}`,
            timestamp: `2026-08-31T18:${String(index).padStart(2, '0')}:00.000Z`,
          }),
        ),
      },
      true,
    )

    expect(task).toMatchObject({
      status: 'queued',
      canCancel: true,
      progress: {
        latestIntent: 'Inspecting the repository',
        recentActivity: expect.any(Array),
      },
    })
    expect(task.description).toHaveLength(MAX_TASK_TEXT_LENGTH)
    expect(task.prompt).toHaveLength(MAX_TASK_TEXT_LENGTH)
    expect(task.progress?.recentActivity).toHaveLength(
      MAX_TASK_ACTIVITY_LINES,
    )
  })

  it('reconstructs agent lifecycle, progress, failures, and cancellation', () => {
    const events = [
      {
        type: 'subagent.started',
        id: 'started',
        parentId: null,
        timestamp: '2026-08-31T18:00:00.000Z',
        agentId: 'agent-1',
        data: {
          agentType: 'task',
          agentName: 'reviewer',
          agentDescription: 'Review the implementation',
          model: 'gpt-5.6',
        },
      },
      {
        type: 'tool.execution_start',
        id: 'tool',
        parentId: 'started',
        timestamp: '2026-08-31T18:00:01.000Z',
        agentId: 'agent-1',
        data: {
          toolCallId: 'tool-1',
          toolName: 'bash',
        },
      },
      {
        type: 'subagent.completed',
        id: 'completed',
        parentId: 'tool',
        timestamp: '2026-08-31T18:00:02.000Z',
        agentId: 'agent-1',
        data: {
          agentType: 'task',
          agentName: 'reviewer',
          cancelled: true,
        },
      },
      {
        type: 'subagent.started',
        id: 'started-2',
        parentId: 'completed',
        timestamp: '2026-08-31T18:01:00.000Z',
        agentId: 'agent-2',
        data: {
          agentType: 'explore',
          agentDescription: 'Find a regression',
        },
      },
      {
        type: 'subagent.failed',
        id: 'failed-2',
        parentId: 'started-2',
        timestamp: '2026-08-31T18:01:02.000Z',
        agentId: 'agent-2',
        data: {
          error: 'The repository could not be inspected',
        },
      },
    ] as SessionEvent[]

    expect(backgroundTasksFromEvents(events)).toHaveLength(2)
    expect(backgroundTasksFromEvents(events)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'agent-1',
          status: 'cancelled',
          canCancel: false,
          progress: expect.objectContaining({
            recentActivity: [
              {
                message: 'bash',
                timestamp: '2026-08-31T18:00:01.000Z',
              },
            ],
          }),
        }),
        expect.objectContaining({
          id: 'agent-2',
          status: 'failed',
          error: 'The repository could not be inspected',
          canCancel: false,
        }),
      ]),
    )
  })
})
