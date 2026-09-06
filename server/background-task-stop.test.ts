import type { SessionEvent } from '@github/copilot-sdk'
import { describe, expect, it } from 'vitest'
import { backgroundTasksFromEvents } from './background-task-adapter.js'
import { backgroundTaskSnapshot } from './background-task-tracker.js'

type ToolStart = Extract<SessionEvent, { type: 'tool.execution_start' }>
type ToolComplete = Extract<SessionEvent, { type: 'tool.execution_complete' }>

function started(
  callId: string,
  toolName: string,
  args: NonNullable<ToolStart['data']['arguments']>,
  seconds = 0,
): ToolStart {
  return {
    type: 'tool.execution_start',
    id: `${callId}-start`,
    parentId: null,
    timestamp: new Date(Date.UTC(2026, 8, 1, 8, 0, seconds)).toISOString(),
    data: { toolCallId: callId, toolName, arguments: args },
  }
}

function completed(
  callId: string,
  data: Partial<ToolComplete['data']> = {},
  seconds = 1,
): ToolComplete {
  return {
    type: 'tool.execution_complete',
    id: `${callId}-complete`,
    parentId: `${callId}-start`,
    timestamp: new Date(Date.UTC(2026, 8, 1, 8, 0, seconds)).toISOString(),
    data: { toolCallId: callId, success: true, ...data },
  }
}

function launched(
  shellId: string,
  mode = 'async',
  detached = false,
  callId = `launch-${shellId}`,
  seconds = 0,
): SessionEvent[] {
  const content = `<command started in ${detached ? 'detached ' : ''}background with shellId: ${shellId}>`
  return [
    started(callId, 'bash', {
      shellId, mode, detach: detached,
      command: 'node fixture-server.js', description: 'Preview fixture',
    }, seconds),
    completed(callId, {
      toolTelemetry: {
        properties: { executionMode: 'async', detached: String(detached) },
      },
      result: { content, detailedContent: content },
    }, seconds + 1),
  ]
}

function stopAcknowledgement(shellId: string, telemetry = true): Partial<ToolComplete['data']> {
  const content = `<command with id: ${shellId} stopped>`
  return {
    ...(telemetry ? { toolTelemetry: { properties: { shell_status: 'stopped' } } } : {}),
    result: { content, detailedContent: content },
  }
}

function snapshot(events: SessionEvent[]) {
  return backgroundTaskSnapshot(backgroundTasksFromEvents(events, { assumeBackground: true }), true)
}

function reportedShell(shellId: string, startedAt: string, seconds = 4) {
  const event = completed('inventory', {}, seconds)
  return {
    ...event,
    data: {
      ...event.data,
      result: {
        content: 'CLI task inventory',
        tasks: [{
          type: 'shell', id: shellId, status: 'running', startedAt,
          description: 'Current shell metadata', executionMode: 'background',
        }],
      },
    },
  }
}

describe('background shell stop reconciliation', () => {
  it.each([
    { shellId: 'preview-server', mode: 'async', detached: false, telemetry: true },
    { shellId: '42', mode: 'async', detached: true, telemetry: true },
    { shellId: 'preview-server', mode: 'sync', detached: false, telemetry: false },
    { shellId: '42', mode: 'async', detached: true, telemetry: false },
  ])('reconciles a confirmed stop ($shellId, $mode, detached=$detached, telemetry=$telemetry)', ({
    shellId, mode, detached, telemetry,
  }) => {
    const events = launched(shellId, mode, detached)
    expect(snapshot(events).runningCount).toBe(1)
    events.push(started('stop', 'stop_bash', { shellId }, 5))
    expect(snapshot(events).runningCount).toBe(1)
    const acknowledgement = completed('stop', stopAcknowledgement(shellId, telemetry), 6)
    events.push(acknowledgement)
    const result = snapshot(events)
    expect(result.runningCount).toBe(0)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: shellId, type: 'shell', status: 'cancelled',
      description: 'Preview fixture',
      completedAt: acknowledgement.timestamp,
      canCancel: false,
    })])
  })

  it.each(['stop_bash', 'stop_shell'])('accepts structured %s acknowledgement without a text footer', (tool) => {
    const result = snapshot([
      ...launched('preview-server'),
      started('stop', tool, { shellId: 'preview-server' }, 5),
      completed('stop', {
        toolTelemetry: { properties: { shell_status: 'stopped' } },
        result: { content: 'Stopped the requested command.' },
      }, 6),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0].status).toBe('cancelled')
  })

  it('retires only the requested shell and keeps unrelated background work alive', () => {
    const result = snapshot([
      ...launched('preview-server'),
      ...launched('other-server'),
      started('stop', 'stop_bash', { shellId: 'preview-server' }, 5),
      completed('stop', stopAcknowledgement('preview-server'), 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks.find((task) => task.id === 'preview-server')?.status).toBe('cancelled')
    expect(result.tasks.find((task) => task.id === 'other-server')?.status).toBe('running')
  })

  it.each([true, false])('does not mistake a failed stop for a terminated job (telemetry=%s)', (telemetry) => {
    const result = snapshot([
      ...launched('preview-server'),
      started('stop', 'stop_bash', { shellId: 'preview-server' }, 5),
      completed('stop', {
        ...stopAcknowledgement('preview-server', telemetry),
        success: false,
        error: { message: 'Stop refused' },
      }, 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks[0].status).toBe('running')
    expect(result.tasks[0].completedAt).toBeUndefined()
  })

  it.each(['active', 'unknown'])('does not override structured %s status with a stopped-looking footer', (status) => {
    const result = snapshot([
      ...launched('preview-server'),
      started('stop', 'stop_bash', { shellId: 'preview-server' }, 5),
      completed('stop', {
        ...stopAcknowledgement('preview-server'),
        toolTelemetry: { properties: { shell_status: status } },
      }, 6),
    ])
    expect(result.runningCount).toBe(1)
  })

  it.each(['view', 'read_bash', 'list_bash'])('does not treat %s output as a stop acknowledgement', (tool) => {
    const result = snapshot([
      ...launched('preview-server'),
      started('observer', tool, { shellId: 'preview-server' }, 5),
      completed('observer', stopAcknowledgement('preview-server'), 6),
    ])
    expect(result.runningCount).toBe(1)
  })

  it.each([
    'Documentation quotes <command with id: preview-server stopped>',
    '<command with id: preview-server stopped>\nStill waiting',
    '<command with id: other-server stopped>',
  ])('rejects an unrelated or nonterminal stop marker: %s', (content) => {
    const result = snapshot([
      ...launched('preview-server'),
      ...launched('other-server'),
      started('stop', 'stop_bash', { shellId: 'preview-server' }, 5),
      completed('stop', { result: { content } }, 6),
    ])
    expect(result.runningCount).toBe(2)
  })

  it('does not infer a stop target from an unpaired completion record', () => {
    const event = completed('unknown-stop', stopAcknowledgement('preview-server'), 6)
    const observation = { ...event, data: { ...event.data, toolName: 'stop_bash' } }
    expect(snapshot([...launched('preview-server'), observation]).runningCount).toBe(1)
  })

  it.each([0, 3])('does not apply a delayed stop to a reused ID (new start at second %s)', (newStart) => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      ...launched('42', 'async', false, 'new-launch', newStart),
      completed('stop', stopAcknowledgement('42'), 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', status: 'running',
      startedAt: new Date(Date.UTC(2026, 8, 1, 8, 0, newStart)).toISOString(),
    })])
  })

  it('retains a real exit received while stopping rather than relabeling it cancelled', () => {
    const exit = completed('read', { result: { content: '<shellId: 42 completed with exit code 0>' } }, 4)
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      started('read', 'read_bash', { shellId: '42' }, 3),
      exit,
      completed('stop', stopAcknowledgement('42'), 6),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({ status: 'completed', completedAt: exit.timestamp })
  })

  it('keeps repeated successful stops idempotent', () => {
    const events = [
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      completed('stop', stopAcknowledgement('42'), 3),
    ]
    const before = snapshot(events)
    events.push(
      started('stop-again', 'stop_bash', { shellId: '42' }, 5),
      completed('stop-again', stopAcknowledgement('42'), 6),
    )
    expect(snapshot(events)).toEqual(before)
  })

  it('follows the addressed shell through a handoff while a stop is pending', () => {
    const result = snapshot([
      started('launch', 'bash', { shellId: 'caller-name', mode: 'async', command: 'node fixture-server.js' }),
      started('stop', 'stop_bash', { shellId: 'caller-name' }, 1),
      completed('launch', {
        result: { content: '<command started in background with shellId: 42>' },
      }, 2),
      completed('stop', stopAcknowledgement('42', false), 3),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({ id: '42', status: 'cancelled' })
  })

  it.each([0, 7])('preserves explicit process-exit evidence returned by a stop (exit=%s)', (exitCode) => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      completed('stop', { result: { content: `<shellId: 42 completed with exit code ${exitCode}>` } }, 3),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0].status).toBe(exitCode === 0 ? 'completed' : 'failed')
  })

  it('keeps a stop associated with the same shell through a metadata refresh', () => {
    const events = launched('42')
    const result = snapshot([
      ...events,
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      reportedShell('42', events[0].timestamp),
      completed('stop', stopAcknowledgement('42'), 6),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({ status: 'cancelled', description: 'Current shell metadata' })
  })

  it('does not stop a newly reported shell that reused the same ID', () => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      reportedShell('42', '2026-09-01T08:00:03.000Z'),
      completed('stop', stopAcknowledgement('42'), 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks[0]).toMatchObject({ status: 'running', description: 'Current shell metadata' })
  })
})
