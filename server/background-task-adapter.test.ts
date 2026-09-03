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

})
