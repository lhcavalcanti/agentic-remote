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
    const tasks = backgroundTasksFromEvents(events)
    expect(tasks).toEqual(
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
    expect(tasks.find((task) => task.id === 'agent-1')).not.toHaveProperty(
      'executionMode',
    )
  })

  it('preserves an explicit background execution mode without inferring it', () => {
    const [task] = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "subagent.started",
          "id": "started",
          "parentId": null,
          "timestamp": "2026-08-31T18:00:00.000Z",
          "agentId": "agent-1",
          "data": {
            "agentType": "task",
            "executionMode": "background"
          }
        }
      ]`) as SessionEvent[],
    )

    expect(task).toMatchObject({
      id: 'agent-1',
      status: 'running',
      executionMode: 'background',
    })
  })

  it('reconstructs CLI task records and detached shell lifecycle', () => {
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "task-start",
        "parentId": null,
        "timestamp": "2026-08-31T18:00:00.000Z",
        "data": {
          "toolCallId": "task-call",
          "toolName": "task",
          "arguments": {
            "agent_type": "explore",
            "description": "Inspect the repository",
            "prompt": "Find the relevant files"
          }
        }
      },
      {
        "type": "subagent.started",
        "id": "agent-start",
        "parentId": "task-start",
        "timestamp": "2026-08-31T18:00:01.000Z",
        "agentId": "agent-1",
        "data": {
          "toolCallId": "task-call",
          "agentType": "explore"
        }
      },
      {
        "type": "tool.execution_start",
        "id": "shell-start",
        "parentId": "agent-start",
        "timestamp": "2026-08-31T18:00:02.000Z",
        "data": {
          "toolCallId": "shell-call",
          "toolName": "bash",
          "arguments": {
            "command": "pnpm test",
            "description": "Run the test suite",
            "detach": true
          }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "shell-launch",
        "parentId": "shell-start",
        "timestamp": "2026-08-31T18:00:03.000Z",
        "data": {
          "toolCallId": "shell-call",
          "success": true,
          "result": {
            "content": "Started background shell (shellId: shell-1)"
          }
        }
      },
      {
        "type": "subagent.completed",
        "id": "agent-complete",
        "parentId": "shell-launch",
        "timestamp": "2026-08-31T18:00:04.000Z",
        "agentId": "agent-1",
        "data": {
          "toolCallId": "task-call"
        }
      }
    ]`) as SessionEvent[]

    const running = backgroundTasksFromEvents(events.slice(0, 4))
    expect(running).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'task-call',
          type: 'agent',
          executionMode: 'background',
          status: 'running',
        }),
        expect.objectContaining({
          id: 'shell-1',
          type: 'shell',
          command: 'pnpm test',
          attachmentMode: 'detached',
          executionMode: 'background',
          status: 'running',
        }),
      ]),
    )

    const completed = backgroundTasksFromEvents([
      ...events,
      {
        type: 'system.notification',
        id: 'shell-complete',
        parentId: 'agent-complete',
        timestamp: '2026-08-31T18:00:05.000Z',
        data: {
          content: 'Detached shell completed',
          kind: {
            type: 'shell_detached_completed',
            shellId: 'shell-1',
            description: 'Run the test suite',
          },
        },
      },
    ] as SessionEvent[])

    expect(completed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'shell-1',
          status: 'completed',
          completedAt: '2026-08-31T18:00:05.000Z',
        }),
        expect.objectContaining({
          id: 'task-call',
          status: 'completed',
        }),
      ]),
    )
  })
})
