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

  it('treats shell records without an execution mode as background tasks', () => {
    expect(
      normalizeBackgroundTask(
        {
          type: 'shell',
          id: 'shell-1',
          description: 'Run the dev server',
          status: 'running',
          startedAt: '2026-08-31T18:00:00.000Z',
          command: 'pnpm dev',
          attachmentMode: 'detached',
        },
        undefined,
        false,
      ),
    ).toMatchObject({
      id: 'shell-1',
      executionMode: 'background',
      attachmentMode: 'detached',
    })
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
          model: 'fixture-model',
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
    expect(
      backgroundTasksFromEvents(events, { assumeBackground: true }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'agent-1',
          executionMode: 'background',
        }),
      ]),
    )
  })

  it.each(['session.start', 'session.resume'])(
    'ends non-detached work from the previous process at %s',
    (type) => {
      const tasks = backgroundTasksFromEvents([
        {
          type: 'session.background_tasks_changed',
          id: 'tasks-before-boundary',
          parentId: null,
          timestamp: '2026-08-31T17:59:00.000Z',
          data: {
            tasks: [
              {
                type: 'agent',
                id: 'queued-agent',
                description: 'Queued work',
                status: 'queued',
                startedAt: '2026-08-31T17:59:00.000Z',
              },
              {
                type: 'shell',
                id: 'detached-shell',
                description: 'Detached work',
                status: 'running',
                startedAt: '2026-08-31T17:59:00.000Z',
                command: 'pnpm dev',
                attachmentMode: 'detached',
              },
            ],
          },
        },
        {
          type: 'subagent.started',
          id: 'old-start',
          parentId: null,
          timestamp: '2026-08-31T18:01:00.000Z',
          agentId: 'old-agent',
          data: { agentType: 'task', agentName: 'old' },
        },
        {
          type,
          id: 'process-boundary',
          parentId: null,
          timestamp: '2026-08-31T18:01:00.000Z',
          data: {},
        },
        {
          type: 'subagent.started',
          id: 'new-start',
          parentId: null,
          timestamp: '2026-08-31T18:02:00.000Z',
          agentId: 'new-agent',
          data: { agentType: 'task', agentName: 'new' },
        },
      ] as SessionEvent[])

      expect(tasks.find((task) => task.id === 'old-agent')).toMatchObject({
        status: 'failed',
        completedAt: '2026-08-31T18:01:00.000Z',
        canCancel: false,
      })
      expect(tasks.find((task) => task.id === 'queued-agent')).toMatchObject({
        status: 'failed',
        completedAt: '2026-08-31T18:01:00.000Z',
        canCancel: false,
      })
      expect(tasks.find((task) => task.id === 'detached-shell')).toMatchObject({
        status: 'running',
        attachmentMode: 'detached',
      })
      expect(tasks.find((task) => task.id === 'new-agent')).toMatchObject({
        status: 'running',
      })
    },
  )

  it('creates a fresh task when an agent id is reused after resume', () => {
    const tasks = backgroundTasksFromEvents([
      {
        type: 'subagent.started',
        id: 'old-start',
        parentId: null,
        timestamp: '2026-08-31T18:00:00.000Z',
        agentId: 'reused-agent',
        data: {
          agentType: 'task',
          agentName: 'old',
          agentDescription: 'Old execution',
        },
      },
      {
        type: 'session.resume',
        id: 'resume',
        parentId: null,
        timestamp: '2026-08-31T18:01:00.000Z',
        data: {},
      },
      {
        type: 'subagent.started',
        id: 'new-start',
        parentId: null,
        timestamp: '2026-08-31T18:02:00.000Z',
        agentId: 'reused-agent',
        data: {
          agentType: 'task',
          agentName: 'new',
          agentDescription: 'New execution',
        },
      },
    ] as SessionEvent[])

    expect(tasks.find((task) => task.id === 'reused-agent')).toMatchObject({
      status: 'running',
      startedAt: '2026-08-31T18:02:00.000Z',
      description: 'New execution',
    })
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

  it('leaves a promoted shell running after the turn that started it ends', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "sync-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:03:00.000Z",
          "data": {
            "toolCallId": "sync-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm check",
              "description": "Run checks",
              "mode": "sync"
            }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "sync-handoff",
          "parentId": "sync-start",
          "timestamp": "2026-08-31T18:03:01.000Z",
          "data": {
            "toolCallId": "sync-call",
            "success": true,
            "result": {
              "content": "Command moved to background (shellId: shell-promoted)"
            }
          }
        },
        {
          "type": "assistant.turn_end",
          "id": "turn-end",
          "parentId": null,
          "timestamp": "2026-08-31T18:04:00.000Z",
          "data": {}
        }
      ]`) as SessionEvent[],
    )

    // Being promoted is how a shell comes to outlive the turn that started
    // it, so the turn ending says nothing about whether it is still running.
    expect(tasks).toEqual([
      expect.objectContaining({
        id: 'shell-promoted',
        type: 'shell',
        status: 'running',
        attachmentMode: 'attached',
      }),
    ])
  })

  it('leaves an async shell running after the turn that started it ends', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "async-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:02:00.000Z",
          "data": {
            "toolCallId": "async-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm dev",
              "description": "Start the dev server",
              "mode": "async"
            }
          }
        },
        {
          "type": "assistant.turn_end",
          "id": "turn-end",
          "parentId": null,
          "timestamp": "2026-08-31T18:04:00.000Z",
          "data": {}
        }
      ]`) as SessionEvent[],
    )

    expect(tasks).toEqual([
      expect.objectContaining({ id: 'async-call', status: 'running' }),
    ])
  })

  it('does not promote an explicitly synchronous shell when assuming background', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "sync-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:03:00.000Z",
          "data": {
            "toolCallId": "sync-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm check",
              "description": "Run checks",
              "mode": "sync"
            }
          }
        }
      ]`) as SessionEvent[],
      // The tmux projection cannot see execution modes, so it assumes
      // background. That assumption must not override a shell that said it
      // was synchronous and never handed off.
      { assumeBackground: true },
    )

    expect(tasks.find((task) => task.id === 'sync-call')).toBeUndefined()
  })

  it('tracks attached async shells and promoted sync shells', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "async-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:02:00.000Z",
          "data": {
            "toolCallId": "async-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm dev",
              "description": "Start the dev server",
              "mode": "async"
            }
          }
        },
        {
          "type": "tool.execution_start",
          "id": "sync-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:03:00.000Z",
          "data": {
            "toolCallId": "sync-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm check",
              "description": "Run checks",
              "mode": "sync"
            }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "sync-handoff",
          "parentId": "sync-start",
          "timestamp": "2026-08-31T18:03:01.000Z",
          "data": {
            "toolCallId": "sync-call",
            "success": true,
            "result": {
              "content": "Command moved to background (shellId: shell-promoted)"
            }
          }
        }
      ]`) as SessionEvent[],
    )

    expect(tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'async-call',
          type: 'shell',
          status: 'running',
          executionMode: 'background',
          attachmentMode: 'attached',
        }),
        expect.objectContaining({
          id: 'shell-promoted',
          type: 'shell',
          status: 'running',
          executionMode: 'background',
          attachmentMode: 'attached',
        }),
      ]),
    )
    expect(tasks).toHaveLength(2)
  })

  it('uses shell-exit metadata for completed and failed task records', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "shell-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:04:00.000Z",
          "data": {
            "toolCallId": "shell-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm check",
              "mode": "async"
            }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "shell-finish",
          "parentId": "shell-start",
          "timestamp": "2026-08-31T18:04:01.000Z",
          "data": {
            "toolCallId": "shell-call",
            "success": true,
            "result": {
              "contents": [
                {
                  "type": "shell_exit",
                  "shellId": "shell-call",
                  "exitCode": 1,
                  "outputPreview": "FAIL tests"
                }
              ]
            }
          }
        }
      ]`) as SessionEvent[],
    )

    expect(tasks).toEqual([
      expect.objectContaining({
        id: 'shell-call',
        status: 'failed',
        completedAt: '2026-08-31T18:04:01.000Z',
        error: 'Shell exited with status 1',
        progress: {
          type: 'shell',
          recentOutput: 'FAIL tests',
        },
      }),
    ])
  })

  it('recognizes detached shell mode from Copilot tool telemetry', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "shell-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:05:00.000Z",
          "data": {
            "toolCallId": "shell-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm dev"
            }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "shell-launch",
          "parentId": "shell-start",
          "timestamp": "2026-08-31T18:05:01.000Z",
          "data": {
            "toolCallId": "shell-call",
            "success": true,
            "toolTelemetry": {
              "properties": {
                "executionMode": "async",
                "detached": "true"
              }
            },
            "result": {
              "content": "<command started in detached background with shellId: shell-2>"
            }
          }
        }
      ]`) as SessionEvent[],
    )

    expect(tasks).toEqual([
      expect.objectContaining({
        id: 'shell-2',
        status: 'running',
        executionMode: 'background',
        attachmentMode: 'detached',
      }),
    ])
  })

  it('completes a detached shell reported by a later read_bash call', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "shell-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:05:00.000Z",
          "data": {
            "toolCallId": "shell-call",
            "toolName": "bash",
            "arguments": {
              "command": "pnpm dev"
            }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "shell-launch",
          "parentId": "shell-start",
          "timestamp": "2026-08-31T18:05:01.000Z",
          "data": {
            "toolCallId": "shell-call",
            "success": true,
            "toolTelemetry": {
              "properties": {
                "executionMode": "async",
                "detached": "true"
              }
            },
            "result": {
              "content": "<command started in detached background with shellId: shell-2>"
            }
          }
        },
        {
          "type": "tool.execution_start",
          "id": "read-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:06:00.000Z",
          "data": {
            "toolCallId": "read-call",
            "toolName": "read_bash",
            "arguments": {
              "shellId": "shell-2"
            }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "read-finish",
          "parentId": "read-start",
          "timestamp": "2026-08-31T18:06:01.000Z",
          "data": {
            "toolCallId": "read-call",
            "success": true,
            "result": {
              "contents": [
                {
                  "type": "shell_exit",
                  "shellId": "shell-2",
                  "exitCode": 3,
                  "outputPreview": "dev server stopped"
                }
              ]
            }
          }
        }
      ]`) as SessionEvent[],
    )

    // The exit is reported under the reading call, not the one that started
    // the shell, so resolving by tool call alone would leave it running.
    expect(tasks).toEqual([
      expect.objectContaining({
        id: 'shell-2',
        status: 'failed',
        completedAt: '2026-08-31T18:06:01.000Z',
        error: 'Shell exited with status 3',
        progress: {
          type: 'shell',
          recentOutput: 'dev server stopped',
        },
      }),
    ])
  })

  it('does not keep attached work running past the turn it belonged to', () => {
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "attached-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": {
          "toolCallId": "attached-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm test" }
        }
      },
      {
        "type": "tool.execution_start",
        "id": "detached-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:01.000Z",
        "data": {
          "toolCallId": "detached-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm dev" }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "detached-launch",
        "parentId": "detached-start",
        "timestamp": "2026-09-02T08:00:02.000Z",
        "data": {
          "toolCallId": "detached-call",
          "success": true,
          "toolTelemetry": {
            "properties": { "executionMode": "async", "detached": "true" }
          },
          "result": {
            "content": "<command started in detached background with shellId: shell-9>"
          }
        }
      },
      {
        "type": "assistant.turn_end",
        "id": "turn-over",
        "parentId": null,
        "timestamp": "2026-09-02T08:05:00.000Z",
        "data": {}
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })
    const running = tasks.filter((task) => task.status === 'running')

    // The command that never reported went with its turn; the detached shell
    // outliving one is the whole point of it.
    expect(running.map((task) => task.id)).toEqual(['shell-9'])
    expect(
      tasks.find((task) => task.id === 'attached-call'),
    ).toMatchObject({ status: 'failed' })
  })

  it('does not let a repeated shell id finish an unrelated command', () => {
    // Shell ids are small per-run counters that come round again. Two ordinary
    // commands in a long session can name the same one, and the second must
    // not close the first, which would leave it running for good.
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "first-start",
          "parentId": null,
          "timestamp": "2026-09-02T08:18:27.445Z",
          "data": {
            "toolCallId": "call-first",
            "toolName": "bash",
            "arguments": { "command": "echo one" }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "first-finish",
          "parentId": "first-start",
          "timestamp": "2026-09-02T08:18:27.586Z",
          "data": {
            "toolCallId": "call-first",
            "success": true,
            "result": { "content": "one\\n<shellId: 75 completed with exit code 0>" }
          }
        },
        {
          "type": "tool.execution_start",
          "id": "second-start",
          "parentId": null,
          "timestamp": "2026-09-02T09:00:00.000Z",
          "data": {
            "toolCallId": "call-second",
            "toolName": "bash",
            "arguments": { "command": "echo two" }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "second-finish",
          "parentId": "second-start",
          "timestamp": "2026-09-02T09:00:00.200Z",
          "data": {
            "toolCallId": "call-second",
            "success": true,
            "result": { "content": "two\\n<shellId: 75 completed with exit code 0>" }
          }
        }
      ]`) as SessionEvent[],
      { assumeBackground: true },
    )

    expect(tasks.filter((task) => task.status === 'running')).toEqual([])
    expect(tasks).toHaveLength(2)
  })

  it('keeps a task asked to run synchronously out of the background', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "task-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:07:00.000Z",
          "data": {
            "toolCallId": "task-call",
            "toolName": "task",
            "arguments": {
              "agent_type": "explore",
              "description": "Trace the cache",
              "mode": "sync"
            }
          }
        }
      ]`) as SessionEvent[],
    )

    // A synchronous task holds the turn open, so counting it as background
    // would colour the session for work the user is already waiting on.
    expect(tasks).toEqual([
      expect.objectContaining({ id: 'task-call', executionMode: 'sync' }),
    ])
  })

  it('does not read a background handoff out of ordinary output', () => {
    const tasks = backgroundTasksFromEvents(
      JSON.parse(`[
        {
          "type": "tool.execution_start",
          "id": "shell-start",
          "parentId": null,
          "timestamp": "2026-08-31T18:08:00.000Z",
          "data": {
            "toolCallId": "shell-call",
            "toolName": "bash",
            "arguments": { "command": "cat notes.md" }
          }
        },
        {
          "type": "tool.execution_complete",
          "id": "shell-finish",
          "parentId": "shell-start",
          "timestamp": "2026-08-31T18:08:01.000Z",
          "data": {
            "toolCallId": "shell-call",
            "success": true,
            "result": {
              "content": "this command starts a background process for the task"
            }
          }
        }
      ]`) as SessionEvent[],
    )

    // The words alone are not a handoff: without a shell to point at, the
    // command simply finished.
    expect(
      tasks.filter((task) => task.status === 'running'),
    ).toEqual([])
  })

  it('projects tmux shell tasks when the CLI omits the execution mode', () => {
    const events = [
      {
        type: 'tool.execution_start',
        id: 'shell-start',
        parentId: null,
        timestamp: '2026-08-31T18:06:00.000Z',
        data: {
          toolCallId: 'shell-call',
          toolName: 'bash',
          arguments:
            '{"command":"pnpm dev","description":"Start the dev server"}',
        },
      },
    ] as SessionEvent[]

    expect(
      backgroundTasksFromEvents(events, { assumeBackground: true }),
    ).toEqual([
      expect.objectContaining({
        id: 'shell-call',
        type: 'shell',
        description: 'Start the dev server',
        executionMode: 'background',
        attachmentMode: 'attached',
        status: 'running',
      }),
    ])
  })

  it('hydrates shell task snapshots reported in CLI task metadata', () => {
    const events = JSON.parse(`[
      {
        "type": "session.background_tasks_changed",
        "id": "tasks-changed",
        "parentId": null,
        "timestamp": "2026-08-31T18:07:00.000Z",
        "data": {
          "tasks": [
            {
              "type": "shell",
              "id": "shell-3",
              "description": "Watch the app",
              "status": "running",
              "startedAt": "2026-08-31T18:06:30.000Z",
              "command": "pnpm dev",
              "attachmentMode": "detached",
              "pid": 1234,
              "logPath": "/tmp/shell-3.log"
            }
          ]
        }
      }
    ]`) as SessionEvent[]

    expect(backgroundTasksFromEvents(events)).toEqual([
      expect.objectContaining({
        id: 'shell-3',
        type: 'shell',
        status: 'running',
        executionMode: 'background',
        attachmentMode: 'detached',
        pid: 1234,
      }),
    ])
  })

  it('keeps a direct exit from stealing a recycled shell id', () => {
    // Shell ids come round again. A plain command reporting its own exit must
    // close itself, not seize the id from whatever is live under that number.
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "live-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": {
          "toolCallId": "live-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm dev", "async": true }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "live-handoff",
        "parentId": "live-start",
        "timestamp": "2026-09-02T08:00:01.000Z",
        "data": {
          "toolCallId": "live-call",
          "success": true,
          "toolTelemetry": {
            "properties": { "executionMode": "async", "detached": "true" }
          },
          "result": {
            "content": "<command started in detached background with shellId: 75>"
          }
        }
      },
      {
        "type": "tool.execution_start",
        "id": "plain-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:02.000Z",
        "data": {
          "toolCallId": "plain-call",
          "toolName": "bash",
          "arguments": { "command": "ls" }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "plain-done",
        "parentId": "plain-start",
        "timestamp": "2026-09-02T08:00:03.000Z",
        "data": {
          "toolCallId": "plain-call",
          "success": true,
          "toolTelemetry": {
            "properties": { "executionMode": "sync", "detached": "false" }
          },
          "result": {
            "type": "shell_exit",
            "shellId": "75",
            "exitCode": 0
          }
        }
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    // The detached shell keeps the id it was handed and stays running.
    expect(tasks.find((task) => task.id === '75')).toMatchObject({
      status: 'running',
      attachmentMode: 'detached',
    })
    // The ordinary command closes under its own call.
    expect(tasks.find((task) => task.id === 'plain-call')).toMatchObject({
      status: 'completed',
    })
  })

  it('lets a background agent outlive the turn that is sweeping', () => {
    // A background agent is explicitly allowed to run past the foreground
    // turn, so a shell it started cannot be ended by that turn finishing.
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "agent-shell",
        "parentId": null,
        "agentId": "agent-1",
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": {
          "toolCallId": "agent-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm test" }
        }
      },
      {
        "type": "assistant.turn_end",
        "id": "turn-over",
        "parentId": null,
        "timestamp": "2026-09-02T08:05:00.000Z",
        "data": {}
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === 'agent-call')).toMatchObject({
      status: 'running',
    })
  })

  it('ends assumed foreground work when the turn errors out', () => {
    // A turn that fails still took its work with it, and it may never emit a
    // turn_end or idle event to say so.
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "shell-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": {
          "toolCallId": "shell-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm test" }
        }
      },
      {
        "type": "session.error",
        "id": "blew-up",
        "parentId": null,
        "timestamp": "2026-09-02T08:05:00.000Z",
        "data": { "message": "stream failed" }
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === 'shell-call')).toMatchObject({
      status: 'failed',
    })
  })

  it('does not sweep a shell that reported going async in place', () => {
    // Telemetry can report the handoff without renaming the shell. The task is
    // then explicitly background, so the turn ending must leave it alone.
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "async-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": {
          "toolCallId": "async-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm dev" }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "async-report",
        "parentId": "async-start",
        "timestamp": "2026-09-02T08:00:01.000Z",
        "data": {
          "toolCallId": "async-call",
          "success": true,
          "toolTelemetry": { "properties": { "executionMode": "async" } }
        }
      },
      {
        "type": "assistant.turn_end",
        "id": "turn-over",
        "parentId": null,
        "timestamp": "2026-09-02T08:05:00.000Z",
        "data": {}
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === 'async-call')).toMatchObject({
      status: 'running',
    })
  })


  it('does not let a foreground command close a live shell with its number', () => {
    // A command that ran in the foreground is deliberately not a task. Its
    // completion has nothing of its own to close, and must not be allowed to
    // close whatever live task is holding the same recycled number.
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "live-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": {
          "toolCallId": "live-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm dev", "async": true }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "live-handoff",
        "parentId": "live-start",
        "timestamp": "2026-09-02T08:00:01.000Z",
        "data": {
          "toolCallId": "live-call",
          "success": true,
          "toolTelemetry": {
            "properties": { "executionMode": "async", "detached": "true" }
          },
          "result": {
            "content": "<command started in detached background with shellId: 75>"
          }
        }
      },
      {
        "type": "tool.execution_start",
        "id": "sync-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:02.000Z",
        "data": {
          "toolCallId": "sync-call",
          "toolName": "bash",
          "arguments": { "command": "ls", "async": false }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "sync-done",
        "parentId": "sync-start",
        "timestamp": "2026-09-02T08:00:03.000Z",
        "data": {
          "toolCallId": "sync-call",
          "success": true,
          "toolTelemetry": {
            "properties": { "executionMode": "sync", "detached": "false" }
          },
          "result": { "type": "shell_exit", "shellId": "75", "exitCode": 0 }
        }
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, {})

    expect(tasks.find((task) => task.id === '75')).toMatchObject({
      status: 'running',
      attachmentMode: 'detached',
    })
  })

  it('ends agent work when the agent ends, not when a turn does', () => {
    // A background agent outlives the foreground turn, so a shell it starts
    // after that turn has already ended can never be older than it. Measured
    // against the turn it would stay running for good; measured against its
    // own agent it ends when the agent does.
    const events = JSON.parse(`[
      {
        "type": "subagent.started",
        "id": "agent-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": { "agentId": "agent-1", "description": "Review" }
      },
      {
        "type": "assistant.turn_end",
        "id": "turn-over",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:05.000Z",
        "data": {}
      },
      {
        "type": "tool.execution_start",
        "id": "agent-shell",
        "parentId": null,
        "agentId": "agent-1",
        "timestamp": "2026-09-02T08:00:10.000Z",
        "data": {
          "toolCallId": "agent-call",
          "toolName": "bash",
          "arguments": { "command": "pnpm test" }
        }
      },
      {
        "type": "subagent.completed",
        "id": "agent-done",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:20.000Z",
        "data": { "agentId": "agent-1" }
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === 'agent-call')).toMatchObject({
      status: 'failed',
    })
  })


  it('ends an idle multi-turn agent and works it again only while a message wakes it', () => {
    const events = [
      lifecycleEvent('start', 'subagent.started', '2026-09-03T08:00:00.000Z', {
        toolCallId: 'task-call', agentId: 'agent-1', agentDescription: 'Fix the review',
      }),
      lifecycleEvent('done', 'subagent.completed', '2026-09-03T08:05:00.000Z', {
        toolCallId: 'task-call', agentId: 'agent-1',
      }),
      lifecycleEvent('idle', 'system.notification', '2026-09-03T08:05:01.000Z', {
        kind: { type: 'agent_idle', agentId: 'agent-1', description: 'Fix the review' },
      }),
      lifecycleEvent('wake', 'user.message', '2026-09-03T09:00:00.000Z', { content: 'Rebase again' }, 'agent-1'),
      lifecycleEvent('turn', 'assistant.turn_start', '2026-09-03T09:00:01.000Z', { turnId: '0' }, 'agent-1'),
      // Woken by a parent already waiting for the reply: no idle notice follows.
      lifecycleEvent('turn-over', 'assistant.turn_end', '2026-09-03T09:03:00.000Z', { turnId: '0' }, 'agent-1'),
      // An agent that ended without idling is over for good.
      lifecycleEvent('other-start', 'subagent.started', '2026-09-03T09:10:00.000Z', {
        toolCallId: 'other-call', agentId: 'agent-2', agentDescription: 'Explore',
      }),
      lifecycleEvent('other-done', 'subagent.completed', '2026-09-03T09:11:00.000Z', {
        toolCallId: 'other-call', agentId: 'agent-2',
      }),
      lifecycleEvent('other-turn', 'assistant.turn_start', '2026-09-03T09:12:00.000Z', { turnId: '9' }, 'agent-2'),
    ] as unknown as SessionEvent[]
    const taskAfter = (count: number, id: string) =>
      backgroundTasksFromEvents(events.slice(0, count), { assumeBackground: true })
        .find((task) => task.id === id)

    expect(taskAfter(3, 'task-call')).toMatchObject({
      status: 'completed', completedAt: '2026-09-03T08:05:01.000Z', canCancel: false,
    })
    expect(taskAfter(5, 'task-call')).toMatchObject({ status: 'running', completedAt: undefined })
    expect(taskAfter(6, 'task-call')).toMatchObject({
      status: 'completed', completedAt: '2026-09-03T09:03:00.000Z',
    })
    expect(taskAfter(9, 'other-call')).toMatchObject({ status: 'completed' })
  })

  it("ends a subagent's shell once the agent stops after last seeing it run", () => {
    const events = [
      lifecycleEvent('start', 'subagent.started', '2026-09-03T08:00:00.000Z', {
        toolCallId: 'task-call', agentId: 'agent-1',
      }),
      ...subagentShell('agent-1', '7', '2026-09-03T08:01:00.000Z'),
      lifecycleEvent('read', 'tool.execution_start', '2026-09-03T08:02:00.000Z', {
        toolCallId: 'read-call', toolName: 'read_bash', arguments: { shellId: '7' },
      }, 'agent-1'),
      lifecycleEvent('read-result', 'tool.execution_complete', '2026-09-03T08:03:00.000Z', {
        toolCallId: 'read-call',
        success: true,
        result: { content: '<command with shellId: 7 is still running after 60 seconds.>' },
      }, 'agent-1'),
      lifecycleEvent('done', 'subagent.completed', '2026-09-03T08:04:00.000Z', {
        toolCallId: 'task-call', agentId: 'agent-1',
      }),
      lifecycleEvent('idle', 'system.notification', '2026-09-03T08:04:01.000Z', {
        kind: { type: 'agent_idle', agentId: 'agent-1' },
      }),
    ] as unknown as SessionEvent[]
    const shellAfter = (count: number) =>
      backgroundTasksFromEvents(events.slice(0, count), { assumeBackground: true })
        .find((task) => task.id === '7')

    // Copilot tells only the agent when its shell finishes, so the agent
    // stopping is the last word this log can have on it.
    expect(shellAfter(5)).toMatchObject({ status: 'running' })
    expect(shellAfter(events.length)).toMatchObject({
      status: 'failed',
      completedAt: '2026-09-03T08:04:01.000Z',
      error: 'Ended without reporting completion',
      canCancel: false,
    })
  })

  it("orders a subagent's shell and its agent stopping by the log, not the clock", () => {
    // Written in the same millisecond: only the log says which came first.
    const tasks = backgroundTasksFromEvents([
      lifecycleEvent('start', 'subagent.started', '2026-09-03T08:00:00.000Z', {
        toolCallId: 'task-call', agentId: 'agent-1',
      }),
      ...subagentShell('agent-1', '7', '2026-09-03T08:01:00.000Z'),
      lifecycleEvent('read', 'tool.execution_start', '2026-09-03T08:02:00.000Z', {
        toolCallId: 'read-call', toolName: 'read_bash', arguments: { shellId: '7' },
      }, 'agent-1'),
      lifecycleEvent('read-result', 'tool.execution_complete', '2026-09-03T08:03:00.000Z', {
        toolCallId: 'read-call',
        success: true,
        result: { content: '<command with shellId: 7 is still running after 60 seconds.>' },
      }, 'agent-1'),
      lifecycleEvent('idle', 'system.notification', '2026-09-03T08:03:00.000Z', {
        kind: { type: 'agent_idle', agentId: 'agent-1' },
      }),
    ] as unknown as SessionEvent[], { assumeBackground: true })

    expect(tasks.find((task) => task.id === '7')).toMatchObject({
      status: 'failed', completedAt: '2026-09-03T08:03:00.000Z',
    })
  })

  it("ends a subagent's shell when the CLI's own task records say its agent finished", () => {
    const agentRecord = (status: string, completedAt?: string) => ({
      tasks: [{
        type: 'agent', id: 'agent-1', status, startedAt: '2026-09-03T08:00:00.000Z',
        ...(completedAt ? { completedAt } : {}),
      }],
    })
    const tasks = backgroundTasksFromEvents([
      lifecycleEvent('listed', 'session.background_tasks_changed', '2026-09-03T08:00:00.000Z', agentRecord('running')),
      ...subagentShell('agent-1', '7', '2026-09-03T08:01:00.000Z'),
      lifecycleEvent('finished', 'session.background_tasks_changed', '2026-09-03T08:05:00.000Z',
        agentRecord('completed', '2026-09-03T08:05:00.000Z')),
    ] as unknown as SessionEvent[], { assumeBackground: true })

    expect(tasks.find((task) => task.id === 'agent-1')).toMatchObject({ status: 'completed' })
    expect(tasks.find((task) => task.id === '7')).toMatchObject({
      status: 'failed', completedAt: '2026-09-03T08:05:00.000Z',
    })
  })

  it("keeps a subagent's shell seen running after the agent stopped, and a detached one", () => {
    const tasks = backgroundTasksFromEvents([
      lifecycleEvent('start', 'subagent.started', '2026-09-03T08:00:00.000Z', {
        toolCallId: 'task-call', agentId: 'agent-1',
      }),
      ...subagentShell('agent-1', '7', '2026-09-03T08:01:00.000Z'),
      ...subagentShell('agent-1', '8', '2026-09-03T08:02:00.000Z', true),
      lifecycleEvent('idle', 'system.notification', '2026-09-03T08:04:00.000Z', {
        kind: { type: 'agent_idle', agentId: 'agent-1' },
      }),
      lifecycleEvent('read', 'tool.execution_start', '2026-09-03T08:10:00.000Z', {
        toolCallId: 'read-call', toolName: 'read_bash', arguments: { shellId: '7' },
      }),
      lifecycleEvent('read-result', 'tool.execution_complete', '2026-09-03T08:10:01.000Z', {
        toolCallId: 'read-call',
        success: true,
        result: { content: '<command with shellId: 7 is still running after 0 seconds.>' },
      }),
    ] as unknown as SessionEvent[], { assumeBackground: true })

    expect(tasks.find((task) => task.id === '7')).toMatchObject({ status: 'running' })
    expect(tasks.find((task) => task.id === '8')).toMatchObject({
      status: 'running', attachmentMode: 'detached',
    })
  })

  it('reads the marker at the end, not one quoted before it', () => {
    // A `read_bash` result carries whatever the command printed, and then the
    // transport's own footer. Taking the first thing that looks like a shell
    // id closes a task the output merely mentioned and leaves the real one
    // running for good.
    const events = [
      {
        type: 'tool.execution_start',
        id: 'fake-start',
        parentId: null,
        timestamp: '2026-09-02T08:00:00.000Z',
        data: {
          toolCallId: 'fake-call',
          toolName: 'bash',
          arguments: { command: 'pnpm one', async: true },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'fake-handoff',
        parentId: 'fake-start',
        timestamp: '2026-09-02T08:00:01.000Z',
        data: {
          toolCallId: 'fake-call',
          success: true,
          toolTelemetry: {
            properties: { executionMode: 'async', detached: 'true' },
          },
          result: {
            content:
              '<command started in detached background with shellId: fake>',
          },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'observer',
        parentId: null,
        timestamp: '2026-09-02T08:00:05.000Z',
        data: {
          toolCallId: 'read-call',
          toolName: 'read_bash',
          // The read itself failed, which closes whatever task it is taken to
          // speak for -- so which one that is has to be right.
          success: false,
          result: {
            // The command's own output mentions one shell; the footer names
            // another, and only the footer is the transport speaking.
            content: [
              'log line: shellId: fake was started earlier',
              '<shellId: real completed with exit code 0>',
            ].join('\n'),
          },
        },
      },
    ] as unknown as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    // The shell the output only mentioned is untouched.
    expect(tasks.find((task) => task.id === 'fake')).toMatchObject({
      status: 'running',
    })
  })

  it('does not take quoted handoff wording as a handoff', () => {
    // An agent describing what a background shell looks like would otherwise
    // promote its own foreground command out of reach of the turn-end sweep.
    const events = JSON.parse(`[
      {
        "type": "tool.execution_start",
        "id": "plain-start",
        "parentId": null,
        "timestamp": "2026-09-02T08:00:00.000Z",
        "data": {
          "toolCallId": "plain-call",
          "toolName": "bash",
          "arguments": { "command": "cat notes.txt" }
        }
      },
      {
        "type": "tool.execution_complete",
        "id": "plain-done",
        "parentId": "plain-start",
        "timestamp": "2026-09-02T08:00:01.000Z",
        "data": {
          "toolCallId": "plain-call",
          "success": true,
          "result": {
            "content": "the docs say Command moved to background (shellId: 42) is printed when a shell detaches"
          }
        }
      },
      {
        "type": "assistant.turn_end",
        "id": "turn-over",
        "parentId": null,
        "timestamp": "2026-09-02T08:05:00.000Z",
        "data": {}
      }
    ]`) as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    // Still ordinary work: the quote did not promote it out of reach of the
    // turn that owned it, so the turn ending leaves nothing running.
    expect(
      tasks.find((task) => task.id === 'plain-call')?.status,
    ).not.toBe('running')
    expect(tasks.filter((task) => task.status === 'running')).toEqual([])
  })


  it('reads the exit code out of a completion reported as text', () => {
    // `<shellId: 9 completed with exit code 1>` says both that the shell is
    // over and how it ended. Taking only the id left it running for good, and
    // a command that failed recorded as having succeeded.
    const events = [
      {
        type: 'tool.execution_start',
        id: 'start',
        parentId: null,
        timestamp: '2026-09-02T08:00:00.000Z',
        data: {
          toolCallId: 'call-1',
          toolName: 'bash',
          arguments: { command: 'pnpm test', async: true },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'handoff',
        parentId: 'start',
        timestamp: '2026-09-02T08:00:01.000Z',
        data: {
          toolCallId: 'call-1',
          success: true,
          toolTelemetry: {
            properties: { executionMode: 'async', detached: 'true' },
          },
          result: {
            content: '<command started in detached background with shellId: 9>',
          },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'observed',
        parentId: null,
        timestamp: '2026-09-02T08:00:09.000Z',
        data: {
          toolCallId: 'read-call',
          toolName: 'read_bash',
          success: true,
          result: { content: '<shellId: 9 completed with exit code 1>' },
        },
      },
    ] as unknown as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === '9')).toMatchObject({
      status: 'failed',
    })
  })

  it('treats a timed-out sync command as promoted, not ended', () => {
    // A synchronous command that outlives its timeout reports that it is
    // still running. That is a promotion, and the turn it outlived must not
    // be allowed to end it.
    const events = [
      {
        type: 'tool.execution_start',
        id: 'start',
        parentId: null,
        timestamp: '2026-09-02T08:00:00.000Z',
        data: {
          toolCallId: 'slow-call',
          toolName: 'bash',
          arguments: { command: 'pnpm build' },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'timeout',
        parentId: 'start',
        timestamp: '2026-09-02T08:00:30.000Z',
        data: {
          toolCallId: 'slow-call',
          success: true,
          result: {
            content:
              '<command with shellId: 45 is still running after 30 seconds>',
          },
        },
      },
      {
        type: 'assistant.turn_end',
        id: 'turn-over',
        parentId: null,
        timestamp: '2026-09-02T08:05:00.000Z',
        data: {},
      },
    ] as unknown as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === '45')).toMatchObject({
      status: 'running',
    })
  })


  it('finds the footer past the length used for display', () => {
    // The transport writes its footer last, and the text used for display is
    // truncated, so a long result loses the one thing that says the shell is
    // over and how it ended.
    const noise = 'x'.repeat(30_000)
    const events = [
      {
        type: 'tool.execution_start',
        id: 'start',
        parentId: null,
        timestamp: '2026-09-02T08:00:00.000Z',
        data: {
          toolCallId: 'call-1',
          toolName: 'bash',
          arguments: { command: 'pnpm test', async: true },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'handoff',
        parentId: 'start',
        timestamp: '2026-09-02T08:00:01.000Z',
        data: {
          toolCallId: 'call-1',
          success: true,
          toolTelemetry: {
            properties: { executionMode: 'async', detached: 'true' },
          },
          result: {
            content: '<command started in detached background with shellId: 9>',
          },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'observed',
        parentId: null,
        timestamp: '2026-09-02T08:00:09.000Z',
        data: {
          toolCallId: 'read-call',
          toolName: 'read_bash',
          success: true,
          result: {
            content: [noise, '<shellId: 9 completed with exit code 1>'].join(
              '\n',
            ),
          },
        },
      },
    ] as unknown as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === '9')).toMatchObject({
      status: 'failed',
    })
  })

  it('ends agent work when the session itself stops', () => {
    // Shutting the session down ends its agents, reported or not. Waiting for
    // a completion that never comes leaves both running for good.
    const events = [
      {
        type: 'subagent.started',
        id: 'agent-start',
        parentId: null,
        timestamp: '2026-09-02T08:00:00.000Z',
        data: { agentId: 'agent-1', description: 'Review' },
      },
      {
        type: 'tool.execution_start',
        id: 'agent-shell',
        parentId: null,
        agentId: 'agent-1',
        timestamp: '2026-09-02T08:00:10.000Z',
        data: {
          toolCallId: 'agent-call',
          toolName: 'bash',
          arguments: { command: 'pnpm test' },
        },
      },
      {
        type: 'session.shutdown',
        id: 'gone',
        parentId: null,
        timestamp: '2026-09-02T08:01:00.000Z',
        data: {},
      },
    ] as unknown as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.filter((task) => task.status === 'running')).toEqual([])
  })


  it('lets a detached shell outlive the session it was started from', () => {
    // Detaching is what puts a shell outside the session on purpose. Its
    // process can still be running long after the session has gone, so the
    // shutdown cannot be taken as its ending.
    const events = [
      {
        type: 'tool.execution_start',
        id: 'start',
        parentId: null,
        timestamp: '2026-09-02T08:00:00.000Z',
        data: {
          toolCallId: 'call-1',
          toolName: 'bash',
          arguments: { command: 'pnpm dev', async: true },
        },
      },
      {
        type: 'tool.execution_complete',
        id: 'handoff',
        parentId: 'start',
        timestamp: '2026-09-02T08:00:01.000Z',
        data: {
          toolCallId: 'call-1',
          success: true,
          toolTelemetry: {
            properties: { executionMode: 'async', detached: 'true' },
          },
          result: {
            content: '<command started in detached background with shellId: 9>',
          },
        },
      },
      {
        type: 'session.shutdown',
        id: 'gone',
        parentId: null,
        timestamp: '2026-09-02T08:05:00.000Z',
        data: {},
      },
    ] as unknown as SessionEvent[]

    const tasks = backgroundTasksFromEvents(events, { assumeBackground: true })

    expect(tasks.find((task) => task.id === '9')).toMatchObject({
      status: 'running',
      attachmentMode: 'detached',
    })
  })

})

function lifecycleEvent(
  id: string,
  type: string,
  timestamp: string,
  data: Record<string, unknown>,
  agentId?: string,
) {
  return { type, id, parentId: null, timestamp, data, ...(agentId ? { agentId } : {}) }
}

// A subagent starting a shell in the background, as Copilot records it.
function subagentShell(agentId: string, shellId: string, timestamp: string, detached = false) {
  const started = new Date(Date.parse(timestamp) + 1_000).toISOString()
  return [
    lifecycleEvent(`${shellId}-start`, 'tool.execution_start', timestamp, {
      toolCallId: `${shellId}-call`,
      toolName: 'bash',
      arguments: { command: 'pnpm test', mode: 'async', ...(detached ? { detach: true } : {}) },
    }, agentId),
    lifecycleEvent(`${shellId}-launch`, 'tool.execution_complete', started, {
      toolCallId: `${shellId}-call`,
      success: true,
      toolTelemetry: { properties: { executionMode: 'async', detached: String(detached) } },
      result: {
        content: `<command started in ${detached ? 'detached ' : ''}background with shellId: ${shellId}>`,
      },
    }, agentId),
  ]
}
