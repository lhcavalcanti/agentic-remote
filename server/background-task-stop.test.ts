import type { SessionEvent } from '@github/copilot-sdk'
import { describe, expect, it, vi } from 'vitest'
import { backgroundTasksFromEvents, MAX_BACKGROUND_TASKS, type CopilotTaskInfo } from './background-task-adapter.js'
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

function reportedShell(
  shellId: string,
  startedAt: string,
  seconds = 4,
  details: Partial<CopilotTaskInfo> = {},
) {
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
          ...details,
        }],
      },
    },
  }
}

function nativeStart(
  shellId: string,
  toolCallId: string | undefined,
  seconds = 4,
  kind = 'shell_started',
  startedAt?: string,
): SessionEvent {
  // Persisted CLI notifications extend the SDK's event union.
  const record: unknown = {
    type: 'system.notification',
    id: `native-${shellId}-${seconds}`,
    parentId: null,
    timestamp: new Date(Date.UTC(2026, 8, 1, 8, 0, seconds)).toISOString(),
    data: {
      kind: {
        type: kind, shellId,
        ...(toolCallId ? { toolCallId } : {}),
        ...(startedAt ? { startedAt } : {}),
      },
    },
  }
  return record as SessionEvent
}

function sessionShutdown(seconds = 5): SessionEvent {
  const record: unknown = {
    type: 'session.shutdown',
    id: 'session-shutdown',
    parentId: null,
    timestamp: new Date(Date.UTC(2026, 8, 1, 8, 0, seconds)).toISOString(),
    data: {},
  }
  return record as SessionEvent
}

function nativeComplete(
  shellId: string,
  provenance: { toolCallId?: string; startedAt?: string } = {},
  seconds = 8,
  exitCode = 7,
): SessionEvent {
  const record: unknown = {
    type: 'system.notification',
    id: `native-complete-${shellId}-${seconds}`,
    parentId: null,
    timestamp: new Date(Date.UTC(2026, 8, 1, 8, 0, seconds)).toISOString(),
    data: {
      kind: {
        type: 'shell_completed', shellId, ...provenance, exitCode,
        outputPreview: 'Native final output',
      },
    },
  }
  return record as SessionEvent
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

  it.each(['stop_bash', 'stop_shell'])('does not accept a failed %s control result as process-exit evidence', (tool) => {
    const events = [
      ...launched('42'),
      started('stop', tool, { shellId: '42' }, 5),
    ]
    expect(snapshot([
      ...events,
      completed('stop', {
        success: false, error: { message: 'Stop refused' },
        result: { content: '<shellId: 42 completed with exit code 7>' },
      }, 6),
    ])).toEqual(snapshot(events))
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

  it.each([0, 7])('accepts an identity-bound stop exit after its requested alias is reused (exit=%s)', (exitCode) => {
    const result = snapshot([
      ...launched('caller-name', 'async', false, 'old-launch'),
      started('stop', 'stop_bash', { shellId: 'caller-name' }, 2),
      nativeStart('42', 'old-launch', 3),
      ...launched('caller-name', 'async', false, 'new-launch', 4),
      completed('stop', {
        result: { content: `<shellId: caller-name completed with exit code ${exitCode}>` },
      }, 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks.find((task) => task.id === '42')?.status)
      .toBe(exitCode === 0 ? 'completed' : 'failed')
    expect(result.tasks.find((task) => task.id === 'caller-name')?.status).toBe('running')
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

  it.each(['completed', 'failed', 'cancelled'])('rejects older inventory replacing a newer %s execution', (status) => {
    const current = reportedShell('42', '2026-09-01T08:00:04.000Z', 6, {
      status, completedAt: '2026-09-01T08:00:05.000Z',
      error: status === 'failed' ? 'New failure' : undefined,
      result: 'New final result',
    })
    const before = snapshot([current])
    const after = snapshot([
      current,
      reportedShell('42', '2026-09-01T08:00:00.000Z', 7, {
        description: 'Old execution', result: 'Old result',
      }),
    ])
    expect(after).toEqual(before)
  })

  it('does not let older inventory detach a stop from the newer running execution', () => {
    const result = snapshot([
      ...launched('42', 'async', false, 'new-launch', 4),
      started('stop', 'stop_bash', { shellId: '42' }, 6),
      reportedShell('42', '2026-09-01T08:00:00.000Z', 7),
      completed('stop', stopAcknowledgement('42'), 8),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({
      status: 'cancelled', startedAt: '2026-09-01T08:00:04.000Z',
    })
  })

  it('compares execution start instants rather than timestamp spellings', () => {
    const current = reportedShell('42', '2026-09-01T08:00:04.000Z', 6, {
      status: 'completed', completedAt: '2026-09-01T08:00:05.000Z', result: 'New final result',
    })
    expect(snapshot([
      current,
      reportedShell('42', '2026-09-01T09:00:00.000+01:00', 7),
    ])).toEqual(snapshot([current]))
  })

  it.each(['inventory', 'native'])('keeps pending stop identity across equivalent %s timestamps', (source) => {
    const equivalent = '2026-09-01T09:00:00.000+01:00'
    const refreshed = source === 'inventory'
      ? reportedShell('42', equivalent, 3)
      : nativeStart('42', undefined, 3, 'shell_started', equivalent)
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      refreshed,
      completed('stop', stopAcknowledgement('42'), 4),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0].status).toBe('cancelled')
  })

  it.each(['inventory', 'native'])('keeps terminal state across equivalent %s timestamps', (source) => {
    const equivalent = '2026-09-01T09:00:00.000+01:00'
    const refreshed = source === 'inventory'
      ? reportedShell('42', equivalent, 4)
      : nativeStart('42', undefined, 4, 'shell_started', equivalent)
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      completed('stop', stopAcknowledgement('42'), 3),
      refreshed,
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({ status: 'cancelled', completedAt: '2026-09-01T08:00:03.000Z' })
  })

  it.each([
    { refreshedStart: 'opaque-start', running: 0 },
    { refreshedStart: 'different-opaque-start', running: 1 },
  ])('uses only exact fallback identity for unparseable timestamps ($refreshedStart)', ({ refreshedStart, running }) => {
    const result = snapshot([
      reportedShell('42', 'opaque-start', 0),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      reportedShell('42', refreshedStart, 3),
      completed('stop', stopAcknowledgement('42'), 4),
    ])
    expect(result.runningCount).toBe(running)
  })

  it.each(['running', 'queued'])('does not revive a stopped shell from late %s metadata', (status) => {
    const events = launched('42')
    const acknowledgement = completed('stop', stopAcknowledgement('42'), 3)
    const result = snapshot([
      ...events,
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      acknowledgement,
      reportedShell('42', events[0].timestamp, 5, {
        status, error: 'Stale inventory error', result: 'Stale inventory result',
      }),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({
      status: 'cancelled', completedAt: acknowledgement.timestamp,
      command: 'node fixture-server.js', canCancel: false,
    })
    expect(result.tasks[0].error).toBeUndefined()
    expect(result.tasks[0].result).toBeUndefined()
  })

  it('retains the observed exit, result, and output across a late inventory and stop response', () => {
    const events = launched('42')
    const output = 'Final process output\n<shellId: 42 completed with exit code 7>'
    const exit = completed('read', { result: { content: output } }, 4)
    const result = snapshot([
      ...events,
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      started('read', 'read_bash', { shellId: '42' }, 3),
      exit,
      reportedShell('42', events[0].timestamp, 5, {
        status: 'failed', completedAt: exit.timestamp,
        error: 'Shell exited with status 7', result: 'Final result', activeTimeMs: 4000,
      }),
      reportedShell('42', events[0].timestamp, 6, {
        status: 'running', error: 'Stale error', result: 'Stale result', activeTimeMs: 10,
      }),
      completed('stop', stopAcknowledgement('42'), 7),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({
      status: 'failed', completedAt: exit.timestamp, error: 'Shell exited with status 7',
      result: 'Final result', activeTimeMs: 4000,
      progress: { type: 'shell', recentOutput: output },
      command: 'node fixture-server.js',
    })
  })

  it.each(['running', 'queued'])('retains known detachment when %s metadata omits it', (status) => {
    const events = launched('42', 'async', true)
    const result = snapshot([
      ...events,
      reportedShell('42', events[0].timestamp, 3, { status }),
      sessionShutdown(),
    ])
    expect(result.runningCount).toBe(status === 'running' ? 1 : 0)
    expect(result.tasks[0]).toMatchObject({ status, attachmentMode: 'detached' })
    expect(result.tasks[0].completedAt).toBeUndefined()
  })

  it('does not invent detachment when a known attached shell is refreshed', () => {
    const events = launched('42')
    const result = snapshot([
      ...events,
      reportedShell('42', events[0].timestamp, 3),
      sessionShutdown(),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({ status: 'failed', attachmentMode: 'attached' })
  })

  it('fills missing final diagnostics without changing a confirmed terminal outcome', () => {
    const startedAt = '2026-09-01T08:00:00.000Z'
    const completedAt = '2026-09-01T08:00:02.000Z'
    const result = snapshot([
      reportedShell('42', startedAt, 1, { status: 'failed' }),
      reportedShell('42', startedAt, 3, {
        status: 'failed', completedAt, error: 'Known final failure', result: 'Final result',
      }),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({
      status: 'failed', completedAt, error: 'Known final failure', result: 'Final result',
    })
  })

  it.each([0, 4])('allows an explicit new launch after a stop even when clocks tie (second %s)', (seconds) => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      completed('stop', stopAcknowledgement('42'), 3),
      ...launched('42', 'async', false, 'new-launch', seconds),
      reportedShell('42', new Date(Date.UTC(2026, 8, 1, 8, 0, seconds)).toISOString(), 8),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks[0].status).toBe('running')
    expect(result.tasks[0].completedAt).toBeUndefined()
  })

  it.each([
    { kind: 'shell_started', telemetry: true },
    { kind: 'shell_detached_started', telemetry: true },
    { kind: 'shell_started', telemetry: false },
    { kind: 'shell_detached_started', telemetry: false },
  ])('retains pending stop ownership across $kind (telemetry=$telemetry)', ({ kind, telemetry }) => {
    const events = launched('caller-name', 'async', false, 'launch')
    const acknowledgement = completed('stop', stopAcknowledgement('42', telemetry), 6)
    const result = snapshot([
      ...events,
      started('stop', 'stop_bash', { shellId: 'caller-name' }, 2),
      nativeStart('42', 'launch', 4, kind),
      acknowledgement,
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', status: 'cancelled', startedAt: events[0].timestamp,
      completedAt: acknowledgement.timestamp, description: 'Preview fixture',
      command: 'node fixture-server.js',
      attachmentMode: kind === 'shell_detached_started' ? 'detached' : 'attached',
    })])
  })

  it('does not revive a stopped invocation when its native handoff arrives late', () => {
    const acknowledgement = completed('stop', stopAcknowledgement('caller-name'), 3)
    const result = snapshot([
      ...launched('caller-name', 'async', false, 'launch'),
      started('stop', 'stop_bash', { shellId: 'caller-name' }, 2),
      acknowledgement,
      nativeStart('42', 'launch', 5),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({
      id: '42', status: 'cancelled', completedAt: acknowledgement.timestamp,
      description: 'Preview fixture',
    })
  })

  it.each(['42', '99'])('does not let an old native handoff claim a reused shell (reports %s)', (reportedId) => {
    const result = snapshot([
      ...launched('42', 'async', false, 'old-launch'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      completed('stop', stopAcknowledgement('42'), 3),
      ...launched('42', 'async', false, 'new-launch', 4),
      nativeStart(reportedId, 'old-launch', 7),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
    })])
  })

  it('does not let a late stopped handoff overwrite another live shell at its reported ID', () => {
    const result = snapshot([
      ...launched('caller-name', 'async', false, 'old-launch'),
      started('stop', 'stop_bash', { shellId: 'caller-name' }, 2),
      completed('stop', stopAcknowledgement('caller-name'), 3),
      ...launched('42', 'async', false, 'new-launch', 4),
      nativeStart('42', 'old-launch', 7),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
      status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
    })
    expect(result.tasks.find((task) => task.id === 'caller-name')?.status).toBe('cancelled')
  })

  it.each(['completed', 'failed', 'cancelled'])('does not let an older correlated handoff replace a newer %s outcome', (status) => {
    const events = [
      ...launched('caller-name', 'async', false, 'old-launch'),
      reportedShell('42', '2026-09-01T08:00:04.000Z', 6, {
        status, completedAt: '2026-09-01T08:00:05.000Z',
        error: status === 'failed' ? 'New failure' : undefined,
        result: 'New final result',
      }),
    ]
    expect(snapshot([
      ...events,
      nativeStart('42', 'old-launch', 8),
    ])).toEqual(snapshot(events))
  })

  it('lets a genuinely newer correlated handoff reuse an older completed slot', () => {
    const result = snapshot([
      reportedShell('42', '2026-09-01T08:00:00.000Z', 2, {
        status: 'completed', completedAt: '2026-09-01T08:00:01.000Z',
      }),
      ...launched('caller-name', 'async', false, 'new-launch', 4),
      nativeStart('42', 'new-launch', 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
    })])
  })

  it.each(['completed', 'failed', 'cancelled'])('does not let an older tool handoff replace a newer %s outcome', (status) => {
    const current = reportedShell('42', '2026-09-01T08:00:04.000Z', 6, {
      status, completedAt: '2026-09-01T08:00:05.000Z',
      error: status === 'failed' ? 'New failure' : undefined,
      result: 'New final result',
    })
    const result = snapshot([
      ...launched('caller-name', 'async', false, 'old-launch'),
      current,
      completed('old-launch', {
        result: { content: '<command started in background with shellId: 42>' },
      }, 8),
    ])
    expect(result.tasks.find((task) => task.id === '42')).toEqual(snapshot([current]).tasks[0])
    expect(result.tasks.find((task) => task.id === 'caller-name')?.status).toBe('running')
  })

  describe.each(['native', 'tool'])('tied-start %s handoff ordering', (source) => {
    const tiedStart = '2026-09-01T09:00:00.000+01:00'
    function handoff(callId: string, shellId = '42', seconds = 8): SessionEvent {
      return source === 'native'
        ? nativeStart(shellId, callId, seconds)
        : completed(callId, {
            result: { content: `<command started in background with shellId: ${shellId}>` },
          }, seconds)
    }

    describe.each(['launch', 'inventory', 'unmaterialized'])('source projected by %s', (projection) => {
      it.each(['completed', 'failed', 'cancelled'])('preserves a distinct newer %s destination and its output', (status) => {
        const events = [
          started('older', 'bash', {
            shellId: 'caller-name', mode: projection === 'launch' ? 'async' : 'sync',
            command: 'node older.js',
          }),
          ...launched('42', 'async', false, 'newer').map((event) =>
            event.type === 'tool.execution_start' ? { ...event, timestamp: tiedStart } : event),
          completed('newer', {
            success: status === 'completed',
            ...(status === 'cancelled' ? { cancelled: true } : {}),
            ...(status === 'failed' ? { error: { message: 'New failure' } } : {}),
            result: { content: 'New terminal output' },
          }, 3),
          reportedShell('42', tiedStart, 4, {
            status, completedAt: '2026-09-01T08:00:03.000Z', result: 'New final result',
          }),
          ...(projection === 'unmaterialized' ? [] : [
            reportedShell('caller-name', tiedStart, 5),
          ]),
        ]
        const before = snapshot(events)
        const destination = before.tasks.find((task) => task.id === '42')
        expect(destination).toMatchObject({
          status, result: 'New final result', progress: { recentOutput: 'New terminal output' },
          completedAt: '2026-09-01T08:00:03.000Z',
        })
        const result = snapshot([...events, handoff('older')])
        expect(result.tasks.find((task) => task.id === '42')).toEqual(destination)
        expect(result.runningCount).toBe(before.runningCount)
        expect(result.tasks).toHaveLength(before.tasks.length)
        if (projection !== 'unmaterialized') {
          expect(result.tasks.find((task) => task.id === 'caller-name')).toMatchObject({
            status: 'running', command: 'node older.js',
          })
        }
      })

      it('allows a genuinely newer invocation to reuse a tied completed slot materialized later', () => {
        const oldLaunch = started('older', 'bash', {
          shellId: '42', mode: 'sync', command: 'printf old',
        })
        const events = [
          oldLaunch,
          completed('older', { result: { content: 'Old final output' } }, 1),
          { ...started('newer', 'bash', {
            shellId: 'caller-name', mode: projection === 'launch' ? 'async' : 'sync',
            command: 'node newer.js',
          }), timestamp: tiedStart },
          reportedShell('42', tiedStart, 3),
          ...(projection === 'unmaterialized' ? [] : [
            reportedShell('caller-name', oldLaunch.timestamp, 4),
          ]),
          reportedShell('42', oldLaunch.timestamp, 5),
        ]
        expect(snapshot(events).tasks.find((task) => task.id === '42')).toMatchObject({
          status: 'completed', progress: { recentOutput: 'Old final output' },
        })
        const result = snapshot([...events, handoff('newer')])
        expect(result.runningCount).toBe(1)
        expect(result.tasks).toEqual([expect.objectContaining({
          id: '42', status: 'running', command: 'node newer.js',
        })])
        expect(result.tasks[0].completedAt).toBeUndefined()
        expect(result.tasks[0].progress?.recentOutput).not.toBe('Old final output')
      })
    })

    it.each(['async', 'sync'])('protects a tied unmaterialized owner from an older %s handoff', (mode) => {
      const events = [
        reportedShell('42', tiedStart, 1, { status: 'completed', result: 'Old slot result' }),
        started('older', 'bash', { shellId: 'caller-name', mode, command: 'node older.js' }),
        started('newer', 'bash', { shellId: '42', mode: 'sync', command: 'node newer.js' }),
      ]
      const before = snapshot(events)
      const rejected = snapshot([...events, handoff('older')])
      expect(rejected.tasks.find((task) => task.id === '42')).toEqual(
        before.tasks.find((task) => task.id === '42'),
      )
      const result = snapshot([...events, handoff('older'), handoff('newer', '42', 9)])
      expect(result.runningCount).toBe(mode === 'async' ? 2 : 1)
      expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
        status: 'running', command: 'node newer.js',
      })
    })

    it.each(['async', 'sync'])('allows a newer %s handoff past an older tied unmaterialized owner', (mode) => {
      const events = [
        started('older', 'bash', { shellId: '42', mode: 'sync', command: 'node older.js' }),
        started('newer', 'bash', { shellId: 'caller-name', mode, command: 'node newer.js' }),
        handoff('newer'),
      ]
      const result = snapshot(events)
      expect(result.runningCount).toBe(1)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'running', command: 'node newer.js',
      })])
      expect(snapshot([...events, handoff('older', '42', 9)])).toEqual(result)
    })
  })

  describe.each(['native', 'tool'])('unparseable-start %s handoff ordering', (source) => {
    function handoff(callId: string): SessionEvent {
      return source === 'native'
        ? nativeStart('42', callId, 8)
        : completed(callId, {
            result: { content: '<command started in background with shellId: 42>' },
          }, 8)
    }

    describe.each([
      { sourceStart: 'opaque-source', destinationStart: '2026-09-01T08:00:00.000Z' },
      { sourceStart: '2026-09-01T08:00:00.000Z', destinationStart: 'opaque-destination' },
      { sourceStart: 'opaque-source', destinationStart: 'opaque-destination' },
      { sourceStart: 'opaque-start', destinationStart: 'opaque-start' },
    ])('$sourceStart -> $destinationStart', ({ sourceStart, destinationStart }) => {
      describe.each(['launch', 'inventory', 'unmaterialized'])('source projected by %s', (projection) => {
        it.each(['completed', 'failed', 'cancelled'])('preserves a distinct newer %s destination and its output', (status) => {
          const events = [
            { ...started('older', 'bash', {
              shellId: 'caller-name', mode: projection === 'launch' ? 'async' : 'sync',
              command: 'node older.js',
            }), timestamp: sourceStart },
            reportedShell('42', destinationStart, 1),
            started('read-destination', 'read_bash', { shellId: '42' }, 2),
            completed('read-destination', { result: { content: 'New final output' } }, 3),
            reportedShell('42', destinationStart, 4, {
              status, completedAt: '2026-09-01T08:00:03.000Z',
              error: status === 'failed' ? 'New failure' : undefined, result: 'New final result',
            }),
            ...(projection === 'inventory' ? [reportedShell('caller-name', sourceStart, 5)] : []),
          ]
          const before = snapshot(events)
          const destination = before.tasks.find((task) => task.id === '42')
          expect(destination).toMatchObject({
            status, result: 'New final result', progress: { recentOutput: 'New final output' },
          })
          const result = snapshot([...events, handoff('older')])
          expect(result.tasks.find((task) => task.id === '42')).toEqual(destination)
          expect(result.runningCount).toBe(before.runningCount)
          expect(result.tasks).toHaveLength(before.tasks.length)
        })

        it('admits a newer identity even when the older destination materializes later', () => {
          const events = [
            { ...started('older', 'bash', {
              shellId: '42', mode: 'sync', command: 'printf old',
            }), timestamp: destinationStart },
            completed('older', { result: { content: 'Old final output' } }, 1),
            { ...started('newer', 'bash', {
              shellId: 'caller-name', mode: projection === 'launch' ? 'async' : 'sync',
              command: 'node newer.js',
            }), timestamp: sourceStart },
            reportedShell('42', destinationStart, 4),
            ...(projection === 'inventory' ? [reportedShell('caller-name', sourceStart, 5)] : []),
          ]
          expect(snapshot(events).tasks.find((task) => task.id === '42')).toMatchObject({
            status: 'completed', progress: { recentOutput: 'Old final output' },
          })
          const result = snapshot([...events, handoff('newer')])
          expect(result.runningCount).toBe(1)
          expect(result.tasks).toEqual([expect.objectContaining({
            id: '42', status: 'running', command: 'node newer.js', startedAt: sourceStart,
          })])
          expect(result.tasks[0].completedAt).toBeUndefined()
          expect(result.tasks[0].progress?.recentOutput).not.toBe('Old final output')
        })
      })
    })

    it.each(['async', 'sync'])('rejects an unorderable %s handoff without a destination shell identity', (mode) => {
      const events = [
        { ...started('launch', 'bash', {
          shellId: 'caller-name', mode, command: 'node fixture.js',
        }), timestamp: 'opaque-start' },
        reportedShell('42', '2026-09-01T08:00:00.000Z', 4, {
          type: 'agent', status: 'completed', result: 'Unrelated agent result',
        }),
      ]
      const before = snapshot(events)
      const after = snapshot([...events, handoff('launch')])
      expect(after.tasks.find((task) => task.id === '42')).toEqual(
        before.tasks.find((task) => task.id === '42'),
      )
      expect(after.tasks).toHaveLength(before.tasks.length)
    })
  })

  it.each(['completed', 'failed', 'cancelled'])('rejects an older uncorrelated start over a newer %s execution', (status) => {
    const current = reportedShell('42', '2026-09-01T08:00:04.000Z', 6, {
      status, completedAt: '2026-09-01T08:00:05.000Z',
      error: status === 'failed' ? 'New failure' : undefined,
      result: 'New final result',
    })
    expect(snapshot([
      current,
      nativeStart('42', undefined, 8, 'shell_started', '2026-09-01T08:00:00.000Z'),
    ])).toEqual(snapshot([current]))
  })

  it('does not let an older uncorrelated start steal a newer pending stop target', () => {
    const result = snapshot([
      ...launched('42', 'async', false, 'new-launch', 4),
      started('stop', 'stop_bash', { shellId: '42' }, 6),
      nativeStart('42', undefined, 7, 'shell_started', '2026-09-01T08:00:00.000Z'),
      completed('stop', stopAcknowledgement('42'), 8),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({
      status: 'cancelled', startedAt: '2026-09-01T08:00:04.000Z',
    })
  })

  it('allows a genuine new native launch to reuse a stopped shell ID', () => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      completed('stop', stopAcknowledgement('42'), 3),
      nativeStart('42', undefined, 5),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks[0]).toMatchObject({ id: '42', status: 'running', startedAt: '2026-09-01T08:00:05.000Z' })
    expect(result.tasks[0].completedAt).toBeUndefined()
  })

  it.each(['shell_started', 'shell_detached_started'])('allows a %s launch to reuse a historical alias', (kind) => {
    const result = snapshot([
      ...launched('caller-name', 'async', false, 'old-launch'),
      started('stop', 'stop_bash', { shellId: 'caller-name' }, 2),
      nativeStart('42', 'old-launch', 3),
      nativeStart('caller-name', undefined, 4, kind),
      completed('stop', stopAcknowledgement('caller-name'), 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks.find((task) => task.id === '42')?.status).toBe('cancelled')
    expect(result.tasks.find((task) => task.id === 'caller-name')).toMatchObject({
      type: 'shell', status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
    })
  })

  it('does not displace another live task kind with an uncorrelated native shell', () => {
    const result = snapshot([
      reportedShell('42', '2026-09-01T08:00:00.000Z', 1, {
        type: 'agent', description: 'Keep this agent',
      }),
      nativeStart('42', undefined, 4),
    ])
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', type: 'agent', status: 'running', description: 'Keep this agent',
    })])
  })

  it.each([
    { callId: undefined, startedAt: '2026-09-01T08:00:03.000Z' },
    { callId: 'new-launch', startedAt: '2026-09-01T08:00:03.000Z' },
    { callId: 'new-launch', startedAt: '2026-09-01T08:00:00.000Z' },
  ])('does not hide a new native execution while an old stop is pending ($callId, $startedAt)', ({ callId, startedAt }) => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      nativeStart('42', callId, 3, 'shell_started', startedAt),
      completed('stop', stopAcknowledgement('42'), 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks[0]).toMatchObject({ id: '42', status: 'running', startedAt })
    expect(result.tasks[0].completedAt).toBeUndefined()
  })

  it('recognizes a native refresh without a call ID by its explicit matching start time', () => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      nativeStart('42', undefined, 3, 'shell_detached_started', '2026-09-01T08:00:00.000Z'),
      completed('stop', stopAcknowledgement('42'), 6),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({ status: 'cancelled', attachmentMode: 'detached' })
  })

  it('does not revive a stopped execution from a matching native refresh without a call ID', () => {
    const result = snapshot([
      ...launched('42'),
      started('stop', 'stop_bash', { shellId: '42' }, 2),
      completed('stop', stopAcknowledgement('42'), 3),
      nativeStart('42', undefined, 5, 'shell_started', '2026-09-01T08:00:00.000Z'),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({ status: 'cancelled', completedAt: '2026-09-01T08:00:03.000Z' })
  })

  it('retains launch identity when a promoted sync shell receives its native detached handoff', () => {
    const result = snapshot([
      ...launched('42', 'sync', false, 'launch'),
      nativeStart('42', 'launch', 4, 'shell_detached_started'),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks[0]).toMatchObject({
      id: '42', status: 'running', attachmentMode: 'detached', description: 'Preview fixture',
    })
  })

  it('does not redirect a launching call completion after its original alias is reused', () => {
    const result = snapshot([
      started('old-launch', 'bash', { shellId: 'caller-name', mode: 'async', command: 'node fixture-server.js' }),
      completed('old-launch', { result: { content: '<command started in background with shellId: 42>' } }, 1),
      ...launched('caller-name', 'async', false, 'new-launch', 3),
      completed('old-launch', { result: { content: '<shellId: 42 completed with exit code 0>' } }, 6),
    ])
    expect(result.runningCount).toBe(1)
    expect(result.tasks.find((task) => task.id === '42')?.status).toBe('completed')
    expect(result.tasks.find((task) => task.id === 'caller-name')?.status).toBe('running')
  })

  it('keeps identity lookups linear when history exceeds the returned task window', () => {
    const count = MAX_BACKGROUND_TASKS * 2
    const events: SessionEvent[] = []
    for (let index = 0; index < count; index += 1) {
      events.push(...launched(`shell-${index}`, 'async', false, `launch-${index}`, index * 2))
    }
    for (let index = 0; index < count; index += 1) {
      events.push(
        started(`stop-${index}`, 'stop_bash', { shellId: `shell-${index}` }, count * 2 + index * 2),
        completed(`stop-${index}`, stopAcknowledgement(`shell-${index}`), count * 2 + index * 2 + 1),
      )
    }
    const lookups = vi.spyOn(WeakMap.prototype, 'get')
    try {
      const result = snapshot(events)
      const lookupCount = lookups.mock.calls.length
      lookups.mockRestore()
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toHaveLength(MAX_BACKGROUND_TASKS)
      expect(lookupCount).toBeLessThan(count * 8)
    } finally {
      lookups.mockRestore()
    }
  })

  it.each([true, false])(
    'cancels the handed-off original but spares a reused-name relaunch (telemetry=%s)',
    (telemetry) => {
      const result = snapshot([
        // Call A launches under its caller name and is asked to stop.
        started('launch', 'bash', {
          shellId: 'caller-name', mode: 'async',
          command: 'node fixture-server.js', description: 'Preview fixture',
        }, 0),
        started('stop', 'stop_bash', { shellId: 'caller-name' }, 1),
        // The same call hands off natively to provider shell '42'.
        nativeStart('42', 'launch', 2),
        // Call B reuses the caller name for a brand-new launch.
        started('launch-b', 'bash', {
          shellId: 'caller-name', mode: 'async',
          command: 'node other-server.js', description: 'Second fixture',
        }, 3),
        // A's stop finally acknowledges, addressing the shell it handed off to.
        completed('stop', stopAcknowledgement('42', telemetry), 4),
      ])
      expect(result.runningCount).toBe(1)
      expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
        status: 'cancelled', description: 'Preview fixture',
      })
      expect(result.tasks.find((task) => task.id === 'caller-name')).toMatchObject({
        status: 'running', description: 'Second fixture',
      })
    },
  )

  describe.each(['native', 'tool'])('unprojected synchronous %s handoffs', (source) => {
    function handoff(shellId: string, seconds = 8): SessionEvent {
      return source === 'native'
        ? nativeStart(shellId, 'sync-launch', seconds, 'shell_detached_started')
        : completed('sync-launch', {
            result: { content: `<command started in detached background with shellId: ${shellId}>` },
          }, seconds)
    }

    it.each(['inventory-running', 'inventory-completed', 'shell_started', 'shell_detached_started'])(
      'rejects older unbound %s before the current owner has a row',
      (report) => {
        const launch = started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node replacement.js',
        }, 4)
        const olderStart = '2026-09-01T08:00:00.000Z'
        const stale = report.startsWith('inventory')
          ? reportedShell('42', olderStart, 6, {
              status: report === 'inventory-completed' ? 'completed' : 'running',
              result: 'Old inventory result',
            })
          : nativeStart('42', undefined, 6, report, olderStart)
        expect(snapshot([launch, stale])).toEqual(snapshot([launch]))
        const result = snapshot([launch, stale, handoff('42')])
        expect(result.runningCount).toBe(1)
        expect(result.tasks).toEqual([expect.objectContaining({
          id: '42', status: 'running', startedAt: launch.timestamp,
          command: 'node replacement.js', attachmentMode: 'detached',
        })])
      },
    )

    it.each(['inventory', 'native'])(
      'does not collapse tied explicit launch identities through unbound %s',
      (report) => {
        const events = [
          ...launched('42', 'async', false, 'old-launch'),
          started('sync-launch', 'bash', {
            shellId: '42', mode: 'sync', command: 'node replacement.js',
          }),
        ]
        const tiedStart = '2026-09-01T09:00:00.000+01:00'
        const ambiguous = report === 'inventory'
          ? reportedShell('42', tiedStart, 6, { status: 'failed', error: 'Old failure' })
          : nativeStart('42', undefined, 6, 'shell_detached_started', tiedStart)
        expect(snapshot([...events, ambiguous])).toEqual(snapshot(events))
        const result = snapshot([...events, ambiguous, handoff('42')])
        expect(result.runningCount).toBe(1)
        expect(result.tasks).toEqual([expect.objectContaining({
          id: '42', status: 'running', command: 'node replacement.js',
        })])
        expect(result.tasks[0].error).toBeUndefined()
      },
    )

    it.each(['inventory', 'native'])('admits a genuinely newer unbound %s owner', (report) => {
      const newerStart = '2026-09-01T08:00:06.000Z'
      const newer = report === 'inventory'
        ? reportedShell('42', newerStart, 7)
        : nativeStart('42', undefined, 7, 'shell_detached_started', newerStart)
      const events = [
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node original.js',
        }, 4),
        newer,
      ]
      const before = snapshot(events)
      expect(before.runningCount).toBe(1)
      expect(before.tasks[0].startedAt).toBe(newerStart)
      expect(snapshot([...events, handoff('42')])).toEqual(before)
    })

    it.each(['old-read', 'old-launch'])(
      'applies bound %s metadata without reclaiming a newer unmaterialized alias',
      (callId) => {
        const metadata = reportedShell('caller-name', '2026-09-01T08:00:00.000Z', 6, {
          status: 'failed', completedAt: '2026-09-01T08:00:05.000Z',
          error: 'Original failure', result: 'Original final result',
        })
        const result = snapshot([
          ...launched('caller-name', 'async', false, 'old-launch'),
          started('old-read', 'read_bash', { shellId: 'caller-name' }, 2),
          nativeStart('42', 'old-launch', 3),
          started('sync-launch', 'bash', {
            shellId: 'caller-name', mode: 'sync', command: 'node replacement.js',
          }, 4),
          { ...metadata, data: { ...metadata.data, toolCallId: callId } },
          handoff('caller-name'),
        ])
        expect(result.runningCount).toBe(1)
        expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
          status: 'failed', completedAt: '2026-09-01T08:00:05.000Z',
          error: 'Original failure', result: 'Original final result',
        })
        expect(result.tasks.find((task) => task.id === 'caller-name')).toMatchObject({
          status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
          command: 'node replacement.js',
        })
      },
    )

    it.each([
      { tool: 'stop_bash', telemetry: true, reportedId: '42' },
      { tool: 'stop_bash', telemetry: false, reportedId: '99' },
      { tool: 'stop_shell', telemetry: true, reportedId: '99' },
      { tool: 'stop_shell', telemetry: false, reportedId: '42' },
    ])('retains an early $tool acknowledgement (telemetry=$telemetry, handoff=$reportedId)', ({
      tool, telemetry, reportedId,
    }) => {
      const output = 'Final stop output\n<command with id: 42 stopped>'
      const acknowledgement = completed('stop', {
        ...stopAcknowledgement('42', telemetry),
        result: { content: output },
      }, 2)
      const events = [
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node fixture-server.js',
        }),
        started('stop', tool, { shellId: '42' }, 1),
        acknowledgement,
      ]
      const before = snapshot(events)
      expect(before.runningCount).toBe(0)
      expect(before.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'cancelled', executionMode: 'sync',
        completedAt: acknowledgement.timestamp,
        progress: { type: 'shell', recentOutput: output },
      })])
      const result = snapshot([...events, handoff(reportedId), sessionShutdown(9)])
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: reportedId, status: 'cancelled', executionMode: 'background',
        completedAt: acknowledgement.timestamp, attachmentMode: 'detached',
        command: 'node fixture-server.js', progress: { type: 'shell', recentOutput: output },
      })])
    })

    it.each([
      { tool: 'read_bash', success: true, exitCode: 0 },
      { tool: 'read_bash', success: false, exitCode: 7 },
      { tool: 'read_shell', success: true, exitCode: 7 },
      { tool: 'read_shell', success: false, exitCode: 0 },
      { tool: 'stop_bash', success: true, exitCode: 0 },
      { tool: 'stop_shell', success: true, exitCode: 7 },
    ])('retains an early $tool exit (success=$success, exit=$exitCode)', ({
      tool, success, exitCode,
    }) => {
      const output = `Final process output\n<shellId: 42 completed with exit code ${exitCode}>`
      const exit = completed('observer', { success, result: { content: output } }, 2)
      const events = [
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node fixture-server.js',
        }),
        started('observer', tool, { shellId: '42' }, 1),
        exit,
      ]
      const terminal = {
        status: exitCode === 0 ? 'completed' : 'failed',
        completedAt: exit.timestamp,
        error: exitCode === 0 ? undefined : `Shell exited with status ${exitCode}`,
        progress: { type: 'shell', recentOutput: output },
      }
      expect(snapshot(events).runningCount).toBe(0)
      expect(snapshot(events).tasks[0]).toMatchObject({ ...terminal, executionMode: 'sync' })
      const result = snapshot([
        ...events, handoff('99'),
        reportedShell('99', events[0].timestamp, 9, {
          status: 'running', result: 'Stale result', error: 'Stale error',
        }),
        completed('sync-launch', { result: { content: 'Delayed launch result' } }, 10),
      ])
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toEqual([expect.objectContaining({
        ...terminal, id: '99', attachmentMode: 'detached', executionMode: 'background',
      })])
      expect(result.tasks[0].result).toBeUndefined()
    })

    it.each([
      { tool: 'read_bash', result: { content: 'Current process progress' } },
      { tool: 'read_shell', result: { content: 'Current process progress' } },
      { tool: 'read_bash', result: { content: '', recentOutput: 'Current process progress' } },
      { tool: 'read_shell', result: { content: '', recentOutput: 'Current process progress' } },
    ])('keeps early $tool progress synchronous until a handoff ($result)', ({ tool, result: readResult }) => {
      const events = [
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node fixture-server.js',
        }),
        started('read', tool, { shellId: '42' }, 1),
        completed('read', { result: readResult }, 2),
      ]
      const before = snapshot(events)
      expect(before.runningCount).toBe(0)
      expect(before.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'running', executionMode: 'sync',
        progress: { type: 'shell', recentOutput: 'Current process progress' },
      })])
      const result = snapshot([...events, handoff('99'), sessionShutdown(9)])
      expect(result.runningCount).toBe(1)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '99', status: 'running', executionMode: 'background', attachmentMode: 'detached',
        progress: { type: 'shell', recentOutput: 'Current process progress' },
      })])
    })

    it.each([
      { tool: 'stop_bash', success: false, content: '<command with id: 42 stopped>' },
      { tool: 'stop_bash', success: false, content: '<shellId: 42 completed with exit code 0>' },
      { tool: 'stop_shell', success: false, content: '<shellId: 42 completed with exit code 7>' },
      { tool: 'stop_shell', success: true, content: 'Stop request is pending' },
      { tool: 'stop_bash', success: true, content: '<command with id: 99 stopped>' },
      { tool: 'read_bash', success: false, content: 'Read unavailable' },
      { tool: 'read_shell', success: true, content: '<shellId: 99 completed with exit code 0>' },
    ])('does not materialize an unconfirmed or unrelated $tool outcome ($success, $content)', ({
      tool, success, content,
    }) => {
      const launch = started('sync-launch', 'bash', {
        shellId: '42', mode: 'sync', command: 'node fixture-server.js',
      })
      const events = [
        launch,
        started('observer', tool, { shellId: '42' }, 1),
        completed('observer', { success, result: { content } }, 2),
      ]
      expect(snapshot(events).tasks).toEqual([])
      expect(snapshot([...events, handoff('42')])).toEqual(snapshot([launch, handoff('42')]))
    })

    it.each(['stop_bash', 'read_bash', 'read_shell'])(
      'does not retarget an early %s outcome to a newer unmaterialized owner',
      (tool) => {
        const result = snapshot([
          started('old-launch', 'bash', { shellId: '42', mode: 'sync', command: 'node old.js' }),
          started('observer', tool, { shellId: '42' }, 1),
          started('sync-launch', 'bash', {
            shellId: '42', mode: 'sync', command: 'node replacement.js',
          }, 4),
          completed('observer', tool === 'stop_bash'
            ? stopAcknowledgement('42')
            : { result: { content: '<shellId: 42 completed with exit code 7>' } }, 6),
          handoff('42'),
        ])
        expect(result.runningCount).toBe(1)
        expect(result.tasks).toEqual([expect.objectContaining({
          id: '42', status: 'running', command: 'node replacement.js',
          startedAt: '2026-09-01T08:00:04.000Z',
        })])
        expect(result.tasks[0].error).toBeUndefined()
      },
    )

    it('keeps an observed synchronous completion foreground when no handoff arrives', () => {
      const result = snapshot([
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'printf fixture',
        }),
        started('read', 'read_bash', { shellId: '42' }, 1),
        completed('read', { result: { content: 'Current process progress' } }, 2),
        completed('sync-launch', { result: { content: 'Final foreground output' } }, 3),
      ])
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'completed', executionMode: 'sync',
        completedAt: '2026-09-01T08:00:03.000Z',
        progress: { type: 'shell', recentOutput: 'Final foreground output' },
      })])
    })

    it.each(['stop_bash', 'read_bash', 'read_shell'])(
      'does not bind an unknown %s target when a synchronous launch appears later',
      (tool) => {
        const launch = started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node fixture-server.js',
        }, 4)
        const events = [
          started('observer', tool, { shellId: '42' }, 1),
          launch,
          completed('observer', tool === 'stop_bash'
            ? stopAcknowledgement('42')
            : { result: { content: '<shellId: 42 completed with exit code 7>' } }, 6),
        ]
        expect(snapshot(events).tasks).toEqual([])
        expect(snapshot([...events, handoff('42')])).toEqual(snapshot([launch, handoff('42')]))
      },
    )

    it.each(['running', 'completed', 'failed', 'cancelled'])(
      'does not overwrite a newer %s destination before materialization',
      (status) => {
        const events = [
          started('sync-launch', 'bash', {
            shellId: 'caller-name', mode: 'sync', command: 'node fixture-server.js',
          }),
          reportedShell('42', '2026-09-01T08:00:04.000Z', 6, {
            status, completedAt: status === 'running' ? undefined : '2026-09-01T08:00:05.000Z',
            result: 'New result', error: status === 'failed' ? 'New failure' : undefined,
          }),
        ]
        expect(snapshot([...events, handoff('42')])).toEqual(snapshot(events))
      },
    )

    it.each(['42', '99'])('does not revive an unprojected launch after its requested ID is reused (reports %s)', (reportedId) => {
      const events = [
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node fixture-server.js',
        }),
        ...launched('42', 'async', false, 'new-launch', 4),
      ]
      expect(snapshot([...events, handoff(reportedId)])).toEqual(snapshot(events))
    })

    it('materializes the original start provenance only after a genuine handoff', () => {
      const launch = started('sync-launch', 'bash', {
        shellId: 'caller-name', mode: 'sync', command: 'node fixture-server.js',
        description: 'Synchronous fixture',
      })
      expect(snapshot([launch]).tasks).toEqual([])
      const events = [launch, handoff('42'), sessionShutdown(9)]
      const result = snapshot(events)
      expect(result.runningCount).toBe(1)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'running', startedAt: launch.timestamp,
        command: 'node fixture-server.js', description: 'Synchronous fixture',
        attachmentMode: 'detached',
      })])
      expect(snapshot([
        ...events,
        nativeComplete('42', { toolCallId: 'sync-launch', startedAt: launch.timestamp }, 10, 0),
      ]).tasks[0].status).toBe('completed')
    })

    it('preserves an unprojected launch through matching inventory and a pending observer', () => {
      const launch = started('sync-launch', 'bash', {
        shellId: 'caller-name', mode: 'sync', command: 'node fixture-server.js',
      })
      const result = snapshot([
        launch,
        started('read', 'read_bash', { shellId: 'caller-name' }, 1),
        reportedShell('caller-name', '2026-09-01T09:00:00.000+01:00', 2),
        handoff('42', 3),
        completed('read', {
          result: { content: '<shellId: caller-name completed with exit code 0>' },
        }, 4),
      ])
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'completed', command: 'node fixture-server.js',
      })])
    })

    it('allows a newer synchronous launch to hand off into an older completed slot', () => {
      const result = snapshot([
        reportedShell('42', '2026-09-01T08:00:00.000Z', 2, {
          status: 'completed', completedAt: '2026-09-01T08:00:01.000Z',
        }),
        started('sync-launch', 'bash', {
          shellId: 'caller-name', mode: 'sync', command: 'node fixture-server.js',
        }, 4),
        handoff('42'),
      ])
      expect(result.runningCount).toBe(1)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
        command: 'node fixture-server.js',
      })])
    })

    it.each([0, 4])('materializes a newly claimed ID while its prior stop is pending (start second %s)', (seconds) => {
      const launch = started('sync-launch', 'bash', {
        shellId: '42', mode: 'sync', command: 'node replacement.js',
      }, seconds)
      const result = snapshot([
        ...launched('42', 'async', false, 'old-launch'),
        started('old-stop', 'stop_bash', { shellId: '42' }, 2),
        launch,
        handoff('42', 5),
        completed('old-stop', stopAcknowledgement('42'), 6),
      ])
      expect(result.runningCount).toBe(1)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'running', startedAt: launch.timestamp, command: 'node replacement.js',
      })])
    })

    it('does not let stale terminal metadata reclaim a newer unprojected start', () => {
      const old = reportedShell('42', '2026-09-01T08:00:00.000Z', 2, {
        status: 'completed', completedAt: '2026-09-01T08:00:01.000Z',
      })
      const result = snapshot([
        old,
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node fixture-server.js',
        }, 4),
        old,
        handoff('42'),
      ])
      expect(result.runningCount).toBe(1)
      expect(result.tasks[0]).toMatchObject({
        id: '42', status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
      })
    })

    it('does not let an older projected handoff steal a newer unprojected destination', () => {
      const oldHandoff = source === 'native'
        ? nativeStart('42', 'old-launch', 6)
        : completed('old-launch', {
            result: { content: '<command started in background with shellId: 42>' },
          }, 6)
      const result = snapshot([
        ...launched('caller-name', 'async', false, 'old-launch'),
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node replacement.js',
        }, 4),
        oldHandoff,
        handoff('42'),
      ])
      expect(result.runningCount).toBe(2)
      expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
        status: 'running', startedAt: '2026-09-01T08:00:04.000Z', command: 'node replacement.js',
      })
      expect(result.tasks.find((task) => task.id === 'caller-name')?.status).toBe('running')
    })

    it('protects a newer unprojected destination even while its older terminal row remains', () => {
      const oldHandoff = source === 'native'
        ? nativeStart('42', 'old-launch', 6)
        : completed('old-launch', {
            result: { content: '<command started in background with shellId: 42>' },
          }, 6)
      const result = snapshot([
        reportedShell('42', '2026-09-01T08:00:00.000Z', 1, { status: 'completed' }),
        started('old-launch', 'bash', {
          shellId: 'caller-name', mode: 'sync', command: 'node old-fixture.js',
        }, 2),
        started('sync-launch', 'bash', {
          shellId: '42', mode: 'sync', command: 'node replacement.js',
        }, 4),
        oldHandoff,
        handoff('42'),
      ])
      expect(result.runningCount).toBe(1)
      expect(result.tasks).toEqual([expect.objectContaining({
        id: '42', status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
        command: 'node replacement.js',
      })])
    })
  })

  it('keeps unprojected start identity through a native refresh with an explicit equivalent start', () => {
    const result = snapshot([
      started('sync-launch', 'bash', {
        shellId: '42', mode: 'sync', command: 'node fixture-server.js',
      }),
      started('read', 'read_bash', { shellId: '42' }, 1),
      nativeStart('42', undefined, 2, 'shell_started', '2026-09-01T09:00:00.000+01:00'),
      completed('read', { result: { content: '<shellId: 42 completed with exit code 0>' } }, 3),
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks[0]).toMatchObject({
      id: '42', status: 'completed', command: 'node fixture-server.js',
    })
  })

  it.each([true, false])('does not project an ordinary synchronous completion (assumeBackground=%s)', (assumeBackground) => {
    expect(backgroundTasksFromEvents([
      started('sync-launch', 'bash', { mode: 'sync', shellId: '42', command: 'printf fixture' }),
      completed('sync-launch', { result: { content: '<shellId: 42 completed with exit code 0>' } }),
    ], { assumeBackground })).toEqual([])
  })

  describe.each([true, false])('ordinary synchronous launch completion (success=%s)', (success) => {
    const launch = started('sync-launch', 'bash', {
      shellId: '42', mode: 'sync', command: 'printf fixture',
    })
    const finish = completed('sync-launch', {
      success,
      ...(success ? {} : { error: { message: 'Foreground command failed' } }),
      result: { content: 'Final foreground output' },
    }, 3)
    const terminal = {
      status: success ? 'completed' : 'failed',
      completedAt: finish.timestamp,
      ...(success ? {} : { error: 'Foreground command failed' }),
      progress: { type: 'shell', recentOutput: 'Final foreground output' },
    }

    it.each([true, false])('stays unprojected without observers (assumeBackground=%s)', (assumeBackground) => {
      expect(backgroundTasksFromEvents([launch, finish], { assumeBackground })).toEqual([])
    })

    describe.each([1, 4])('observer requested at second %s', (requestSecond) => {
      it.each([
        { tool: 'read_bash', outcome: 'progress', observerSuccess: true },
        { tool: 'read_shell', outcome: 'exit', observerSuccess: true },
        { tool: 'stop_bash', outcome: 'stop', observerSuccess: true },
        { tool: 'stop_shell', outcome: 'stop', observerSuccess: true },
        { tool: 'read_bash', outcome: 'inventory-running', observerSuccess: true },
        { tool: 'read_shell', outcome: 'inventory-failed', observerSuccess: true },
        { tool: 'read_bash', outcome: 'progress', observerSuccess: false },
        { tool: 'read_shell', outcome: 'exit', observerSuccess: false },
        { tool: 'stop_bash', outcome: 'stop', observerSuccess: false },
      ])('ignores delayed $tool $outcome (observerSuccess=$observerSuccess) after the owning launch ended', ({
        tool, outcome, observerSuccess,
      }) => {
        const request = started('observer', tool, { shellId: '42' }, requestSecond)
        const metadata = reportedShell('42', launch.timestamp, 5, {
          status: outcome === 'inventory-failed' ? 'failed' : 'running',
          error: 'Stale observer error', result: 'Stale observer result',
        })
        const response = outcome.startsWith('inventory')
          ? { ...metadata, data: { ...metadata.data, toolCallId: 'observer' } }
          : completed('observer', {
              ...(outcome === 'stop'
                ? stopAcknowledgement('42', tool === 'stop_bash')
                : { result: { content: outcome === 'exit'
                    ? '<shellId: 42 completed with exit code 7>'
                    : 'Stale observer progress' } }),
              success: observerSuccess,
            }, 5)
        const events = requestSecond < 3
          ? [launch, request, finish]
          : [launch, finish, request]
        expect(snapshot(events).tasks).toEqual([])
        expect(snapshot([...events, response])).toEqual(snapshot(events))

        const exposed = [
          ...events, response,
          nativeStart('99', 'sync-launch', 6, 'shell_detached_started'),
        ]
        const before = snapshot(exposed)
        expect(before.runningCount).toBe(0)
        expect(before.tasks).toEqual([expect.objectContaining({
          ...terminal, id: '99', executionMode: 'background', attachmentMode: 'detached',
        })])
        expect(before.tasks[0].error).toBe(terminal.error)
        expect(before.tasks[0].result).toBeUndefined()
        expect(snapshot([...exposed, response])).toEqual(before)
      })
    })

    it.each(['native-handoff', 'tool-handoff', 'native-completion', 'inventory'])(
      'exposes retained completion only when a late %s materializes it',
      (source) => {
        const late = source === 'native-handoff'
          ? nativeStart('99', 'sync-launch', 6, 'shell_detached_started')
          : source === 'tool-handoff'
            ? completed('sync-launch', {
                result: { content: '<command started in detached background with shellId: 99>' },
              }, 6)
            : source === 'native-completion'
              ? nativeComplete('99', { toolCallId: 'sync-launch' }, 6, success ? 7 : 0)
              : reportedShell('42', launch.timestamp, 6, {
                  status: 'running', error: 'Stale inventory error', result: 'Stale inventory result',
                })
        const events = [launch, finish]
        expect(snapshot(events).tasks).toEqual([])
        const result = snapshot([...events, late])
        expect(result.runningCount).toBe(0)
        expect(result.tasks).toEqual([expect.objectContaining({
          ...terminal, id: source === 'inventory' ? '42' : '99', executionMode: 'background',
        })])
        expect(result.tasks[0].error).toBe(terminal.error)
        expect(result.tasks[0].result).toBeUndefined()
      },
    )

    it.each(['read_bash', 'read_shell'])('closes a sync row already materialized by %s progress', (tool) => {
      const events = [
        launch,
        started('read', tool, { shellId: '42' }, 1),
        completed('read', { result: { content: 'Current progress' } }, 2),
      ]
      expect(snapshot(events).tasks[0]).toMatchObject({
        status: 'running', executionMode: 'sync', progress: { recentOutput: 'Current progress' },
      })
      const result = snapshot([...events, finish])
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toEqual([expect.objectContaining({
        ...terminal, id: '42', executionMode: 'sync',
      })])
      expect(result.tasks[0].error).toBe(terminal.error)
    })

    it.each(['unbound', 'read_bash', 'read_shell'])('closes a sync launch materialized by %s inventory without attachment metadata', (source) => {
      const metadata = reportedShell('42', launch.timestamp, 2)
      const events = [
        launch,
        ...(source === 'unbound' ? [] : [started('inventory', source, { shellId: '42' }, 1)]),
        metadata,
        reportedShell('42', '2026-09-01T09:00:00.000+01:00', 2),
      ]
      expect(snapshot(events).tasks[0]).toMatchObject({
        status: 'running', executionMode: 'background', command: 'printf fixture',
      })
      const result = snapshot([...events, finish])
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toEqual([expect.objectContaining({
        ...terminal, id: '42', attachmentMode: 'attached',
      })])
      expect(result.tasks[0].error).toBe(terminal.error)
      expect(snapshot([
        ...events, finish,
        reportedShell('42', launch.timestamp, 4),
        nativeStart('99', 'sync-launch', 5, 'shell_detached_started'),
      ]).tasks[0]).toMatchObject({ ...terminal, id: '99', attachmentMode: 'detached' })
    })

    it('fills missing final inventory diagnostics without replacing the retained completion', () => {
      const result = snapshot([
        launch, finish,
        reportedShell('42', launch.timestamp, 6, {
          status: terminal.status, completedAt: '2026-09-01T08:00:05.000Z',
          result: 'Final inventory result', activeTimeMs: 3000,
          ...(success ? {} : { error: 'Different inventory error' }),
        }),
      ])
      expect(result.runningCount).toBe(0)
      expect(result.tasks).toEqual([expect.objectContaining({
        ...terminal, id: '42', result: 'Final inventory result', activeTimeMs: 3000,
      })])
      expect(result.tasks[0].error).toBe(terminal.error)
    })

    it.each(['stop', 'exit'])('preserves observer-first %s evidence when the owning launch finishes', (outcome) => {
      const response = completed('observer', outcome === 'stop'
        ? stopAcknowledgement('42')
        : { result: { content: 'Observed output\n<shellId: 42 completed with exit code 7>' } }, 2)
      const events = [
        launch,
        started('observer', outcome === 'stop' ? 'stop_bash' : 'read_bash', { shellId: '42' }, 1),
        response,
      ]
      const before = snapshot(events)
      expect(before.tasks[0]).toMatchObject({
        status: outcome === 'stop' ? 'cancelled' : 'failed', executionMode: 'sync',
        completedAt: response.timestamp,
      })
      expect(snapshot([...events, finish])).toEqual(before)
    })

    it('does not reclaim an ID reused after its unprojected completion', () => {
      const events = [
        launch, finish,
        ...launched('42', 'async', false, 'replacement', 4),
      ]
      expect(snapshot([
        ...events,
        nativeStart('99', 'sync-launch', 6),
        reportedShell('42', launch.timestamp, 7),
      ])).toEqual(snapshot(events))
    })
  })

  it('completes a sync launch materialized by its own successful inventory-bearing completion', () => {
    const launch = started('sync-launch', 'bash', {
      shellId: '42', mode: 'sync', command: 'printf fixture',
    })
    const metadata = reportedShell('42', launch.timestamp, 3)
    const result = snapshot([
      launch,
      { ...metadata, data: {
        ...metadata.data, toolCallId: 'sync-launch',
        result: { ...metadata.data.result, content: 'Final ordinary output' },
      } },
    ])
    expect(result.runningCount).toBe(0)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', status: 'completed', attachmentMode: 'attached',
      completedAt: metadata.timestamp, progress: { type: 'shell', recentOutput: 'Final ordinary output' },
    })])
  })

  it.each(['inventory', 'launch', 'native', 'tool'])('preserves explicit %s detachment through omitted inventory metadata and ordinary completion', (source) => {
    const launch = started('sync-launch', 'bash', {
      shellId: '42', mode: 'sync', detach: source === 'launch', command: 'node fixture-server.js',
    })
    const events = [
      launch,
      reportedShell('42', launch.timestamp, 1, {
        ...(source === 'inventory' ? { attachmentMode: 'detached' } : {}),
      }),
      ...(source === 'native' ? [nativeStart('42', 'sync-launch', 2, 'shell_detached_started')] : []),
      ...(source === 'tool' ? [completed('sync-launch', {
        result: { content: '<command started in detached background with shellId: 42>' },
      }, 2)] : []),
      reportedShell('42', launch.timestamp, 3),
      completed('sync-launch', { result: { content: 'Ordinary output without an exit footer' } }, 4),
      sessionShutdown(5),
    ]
    const result = snapshot(events)
    expect(result.runningCount).toBe(1)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', status: 'running', executionMode: 'background', attachmentMode: 'detached',
      progress: { type: 'shell', recentOutput: 'Ordinary output without an exit footer' },
    })])
    expect(result.tasks[0].completedAt).toBeUndefined()
  })

  it.each(['native', 'tool'])('preserves a genuine attached %s handoff after inventory materializes a sync launch', (source) => {
    const launch = started('sync-launch', 'bash', {
      shellId: 'caller-name', mode: 'sync', command: 'node fixture-server.js',
    })
    const events = [
      launch,
      reportedShell('caller-name', launch.timestamp, 1),
      source === 'native'
        ? nativeStart('42', 'sync-launch', 2)
        : completed('sync-launch', {
            result: { content: '<command started in background with shellId: 42>' },
          }, 2),
    ]
    const result = snapshot(events)
    expect(result.runningCount).toBe(1)
    expect(result.tasks).toEqual([expect.objectContaining({
      id: '42', status: 'running', executionMode: 'background', attachmentMode: 'attached',
    })])
    expect(result.tasks[0].completedAt).toBeUndefined()
    expect(snapshot([
      ...events, nativeComplete('42', { toolCallId: 'sync-launch', startedAt: launch.timestamp }, 3, 0),
    ]).runningCount).toBe(0)
  })

  describe('historical shell inventory aliases', () => {
    describe.each([
      { startedAt: '2026-09-01T08:00:00.000Z', refreshedAt: '2026-09-01T08:00:00.000Z' },
      { startedAt: '2026-09-01T08:00:00.000Z', refreshedAt: '2026-09-01T09:00:00.000+01:00' },
      { startedAt: 'opaque-start', refreshedAt: 'opaque-start' },
    ])('indexed start $startedAt refreshed as $refreshedAt', ({ startedAt, refreshedAt }) => {
      it.each(['running', 'cancelled'])('refreshes the current ID of a rekeyed %s execution', (status) => {
        const launch = launched('caller-name', 'async', true, 'original')
        launch[0] = { ...launch[0], timestamp: startedAt }
        const events = [...launch, nativeStart('42', 'original', 2)]
        if (status === 'cancelled') {
          events.push(
            started('stop', 'stop_bash', { shellId: '42' }, 3),
            completed('stop', stopAcknowledgement('42'), 4),
          )
        }
        const before = snapshot(events)
        const refreshed = [
          ...events,
          started('pending-stop', 'stop_bash', { shellId: '42' }, 5),
          reportedShell('caller-name', refreshedAt, 6, {
            description: 'Refreshed original', result: 'Stale result', error: 'Stale error',
          }),
        ]
        const result = snapshot(refreshed)
        expect(result.runningCount).toBe(status === 'running' ? 1 : 0)
        expect(result.tasks).toHaveLength(1)
        expect(result.tasks[0]).toMatchObject({
          id: '42', status, command: 'node fixture-server.js', attachmentMode: 'detached',
        })
        if (status === 'cancelled') {
          expect(result).toEqual(before)
        } else {
          expect(result.tasks[0].description).toBe('Refreshed original')
          expect(snapshot([
            ...refreshed, completed('pending-stop', stopAcknowledgement('42'), 7),
          ]).tasks[0].status).toBe('cancelled')
        }
      })
    })

    describe.each(['async', 'sync'])('historical alias reused by a new %s launch', (mode) => {
      it.each(['running', 'cancelled'])('refreshes only the original %s execution', (status) => {
        const events = [
          ...launched('caller-name', 'async', true, 'original'),
          nativeStart('42', 'original', 2),
        ]
        if (status === 'cancelled') {
          events.push(
            started('stop-original', 'stop_bash', { shellId: '42' }, 3),
            completed('stop-original', stopAcknowledgement('42'), 4),
          )
        }
        events.push(started('replacement', 'bash', {
          shellId: 'caller-name', mode, command: 'node replacement.js', description: 'Replacement',
        }, 5))
        const replacementBefore = snapshot(events).tasks.find((task) => task.id === 'caller-name')
        const inventory = reportedShell('caller-name', '2026-09-01T09:00:00.000+01:00', 6, {
          status, description: 'Refreshed original', result: 'Original final result',
        })
        const refreshed = snapshot([...events, inventory])
        expect(refreshed.tasks.find((task) => task.id === '42')).toMatchObject({
          status, result: 'Original final result', command: 'node fixture-server.js',
        })
        expect(refreshed.tasks.find((task) => task.id === 'caller-name')).toEqual(replacementBefore)
        const result = snapshot([
          ...events, inventory,
          started('stop-replacement', 'stop_bash', { shellId: 'caller-name' }, 7),
          nativeStart('caller-name', 'replacement', 8),
          completed('stop-replacement', stopAcknowledgement('caller-name'), 9),
        ])
        expect(result.tasks).toHaveLength(2)
        expect(result.tasks.find((task) => task.id === '42')).toEqual(
          refreshed.tasks.find((task) => task.id === '42'),
        )
        expect(result.tasks.find((task) => task.id === 'caller-name')).toMatchObject({
          status: 'cancelled', command: 'node replacement.js', startedAt: events.at(-1)?.timestamp,
        })
      })
    })

    it.each([true, false])('does not re-materialize a retired identity (alias reused=%s)', (reuseAlias) => {
      const events = [
        ...launched('caller-name', 'async', false, 'original'),
        nativeStart('42', 'original', 2),
        ...launched('42', 'async', false, 'replacement', 4),
        ...(reuseAlias ? launched('caller-name', 'async', false, 'alias-replacement', 6) : []),
      ]
      expect(snapshot([
        ...events, reportedShell('caller-name', '2026-09-01T09:00:00.000+01:00', 8),
      ])).toEqual(snapshot(events))
    })

    it('rejects tied historical provenance instead of choosing either execution', () => {
      const events = [
        ...launched('caller-name', 'async', false, 'original'),
        nativeStart('42', 'original', 2),
        ...launched('caller-name', 'async', false, 'replacement'),
      ]
      expect(snapshot([
        ...events,
        reportedShell('caller-name', '2026-09-01T09:00:00.000+01:00', 5, {
          status: 'failed', error: 'Ambiguous failure',
        }),
      ])).toEqual(snapshot(events))
    })

    it('does not bypass a newer unmaterialized owner at the resolved current ID', () => {
      const events = [
        ...launched('caller-name', 'async', false, 'original'),
        nativeStart('42', 'original', 2),
        started('replacement', 'bash', { shellId: '42', mode: 'sync', command: 'node replacement.js' }, 4),
      ]
      expect(snapshot([
        ...events,
        reportedShell('caller-name', '2026-09-01T08:00:00.000Z', 5, {
          status: 'failed', error: 'Old failure',
        }),
      ])).toEqual(snapshot(events))
    })
  })

  describe('native completion provenance', () => {
    it.each([
      { provenance: { startedAt: '2026-09-01T08:00:04.000Z' }, accepted: true },
      {
        provenance: { toolCallId: 'new-launch', startedAt: '2026-09-01T08:00:00.000Z' },
        accepted: false,
      },
    ])('validates notification-envelope provenance (%j)', ({ provenance, accepted }) => {
      const events = [
        ...launched('42', 'async', false, 'old-launch'),
        ...launched('42', 'async', false, 'new-launch', 4),
      ]
      const native = nativeComplete('42')
      const finish = { ...native, data: { ...native.data, ...provenance } } as SessionEvent
      const result = snapshot([...events, finish])
      if (accepted) {
        expect(result.tasks[0]).toMatchObject({
          status: 'failed', completedAt: finish.timestamp,
          progress: { recentOutput: 'Native final output' },
        })
      } else {
        expect(result).toEqual(snapshot(events))
      }
    })

    it.each([
      { toolCallId: 'old-launch' },
      { startedAt: '2026-09-01T08:00:00.000Z' },
      { toolCallId: 'old-launch', startedAt: '2026-09-01T08:00:00.000Z' },
      { toolCallId: 'old-launch', startedAt: '2026-09-01T08:00:04.000Z' },
      { toolCallId: 'new-launch', startedAt: '2026-09-01T08:00:00.000Z' },
      {},
    ])('rejects stale or ambiguous completion after ID reuse (%j)', (provenance) => {
      const events = [
        ...launched('42', 'async', false, 'old-launch'),
        ...launched('42', 'async', false, 'new-launch', 4),
      ]
      expect(snapshot([...events, nativeComplete('42', provenance)])).toEqual(snapshot(events))
    })

    it.each(['completed', 'failed', 'cancelled'])('does not overwrite a newer terminal %s result', (status) => {
      const events = [
        ...launched('42', 'async', false, 'old-launch'),
        reportedShell('42', '2026-09-01T08:00:04.000Z', 6, {
          status, completedAt: '2026-09-01T08:00:05.000Z',
          result: 'New final result', error: status === 'failed' ? 'New failure' : undefined,
        }),
      ]
      expect(snapshot([
        ...events, nativeComplete('42', { toolCallId: 'old-launch' }),
      ])).toEqual(snapshot(events))
    })

    it.each([
      { toolCallId: 'new-launch' },
      { startedAt: '2026-09-01T08:00:04.000Z' },
      { toolCallId: 'new-launch', startedAt: '2026-09-01T09:00:04.000+01:00' },
    ])('accepts a completion belonging to the replacement (%j)', (provenance) => {
      const finish = nativeComplete('42', provenance)
      const result = snapshot([
        ...launched('42', 'async', false, 'old-launch'),
        ...launched('42', 'async', false, 'new-launch', 4),
        finish,
      ])
      expect(result.runningCount).toBe(0)
      expect(result.tasks[0]).toMatchObject({
        status: 'failed', startedAt: '2026-09-01T08:00:04.000Z',
        completedAt: finish.timestamp, error: 'Shell exited with status 7',
        progress: { recentOutput: 'Native final output' },
      })
    })

    it('does not treat a tied launch timestamp as proof that a different call owns a completion', () => {
      const events = [
        ...launched('42', 'async', false, 'old-launch'),
        ...launched('42', 'async', false, 'new-launch'),
      ]
      expect(snapshot([
        ...events, nativeComplete('42', {
          toolCallId: 'old-launch', startedAt: '2026-09-01T08:00:00.000Z',
        }),
      ])).toEqual(snapshot(events))
    })

    it.each(['2026-09-01T08:00:00.000Z', '2026-09-01T09:00:00.000+01:00'])(
      'requires call provenance when reused executions share the supplied instant (%s)',
      (startedAt) => {
        const events = [
          ...launched('42', 'async', false, 'old-launch'),
          ...launched('42', 'async', false, 'new-launch'),
        ]
        expect(snapshot([
          ...events, nativeComplete('42', { startedAt }),
        ])).toEqual(snapshot(events))
        expect(snapshot([
          ...events, nativeComplete('42', { toolCallId: 'new-launch', startedAt }),
        ]).tasks[0].status).toBe('failed')
      },
    )

    it('follows native completion call identity without reclaiming a reused original alias', () => {
      const result = snapshot([
        ...launched('caller-name', 'async', false, 'old-launch'),
        nativeStart('42', 'old-launch', 2),
        ...launched('caller-name', 'async', false, 'new-launch', 4),
        nativeComplete('caller-name', { toolCallId: 'old-launch' }),
      ])
      expect(result.runningCount).toBe(1)
      expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
        status: 'failed', progress: { recentOutput: 'Native final output' },
      })
      expect(result.tasks.find((task) => task.id === 'caller-name')).toMatchObject({
        status: 'running', startedAt: '2026-09-01T08:00:04.000Z',
      })
    })

    it('rejects legacy completion when a provider handoff reused a historical alias', () => {
      const events = [
        ...launched('caller-name', 'async', false, 'old-launch'),
        nativeStart('42', 'old-launch', 2),
        ...launched('caller-name', 'async', false, 'new-launch', 4),
      ]
      expect(snapshot([...events, nativeComplete('caller-name')])).toEqual(snapshot(events))
    })

    it.each([true, false])('preserves unambiguous legacy native completions (known start=%s)', (knownStart) => {
      const finish = nativeComplete('42', {}, 8, 0)
      const result = snapshot([...(knownStart ? launched('42') : []), finish])
      expect(result.runningCount).toBe(0)
      expect(result.tasks[0]).toMatchObject({
        id: '42', status: 'completed', completedAt: finish.timestamp,
        progress: { recentOutput: 'Native final output' },
      })
    })
  })

  describe.each(['read_bash', 'read_shell'])('terminal targeted %s exits', (tool) => {
    function readExit(callId: string, shellId: string, exitCode: number, seconds = 8, success = true) {
      return completed(callId, {
        success,
        result: { content: `Final process output\n<shellId: ${shellId} completed with exit code ${exitCode}>` },
      }, seconds)
    }

    describe.each(['completed', 'failed', 'cancelled', 'stop'])('intervening %s', (terminal) => {
      function terminalize(shellId: string, startedAt: string): SessionEvent[] {
        return terminal === 'stop'
          ? [
              started('stop', 'stop_bash', { shellId }, 4),
              completed('stop', stopAcknowledgement(shellId), 5),
            ]
          : [reportedShell(shellId, startedAt, 5, {
              status: terminal, completedAt: '2026-09-01T08:00:05.000Z',
              error: terminal === 'failed' ? 'Inventory failure' : undefined,
              result: 'Final inventory result',
            })]
      }

      describe.each([true, false])('reader success=%s', (success) => {
        it.each([0, 7])('merges explicit exit=%s and output without moving completion time', (exitCode) => {
          const launch = launched('42')
          const events = [
            ...launch,
            started('read', tool, { shellId: '42' }, 2),
            ...terminalize('42', launch[0].timestamp),
          ]
          const before = snapshot(events).tasks[0]
          const exit = readExit('read', '42', exitCode, 8, success)
          const result = snapshot([...events, exit])
          expect(result.runningCount).toBe(0)
          expect(result.tasks[0]).toMatchObject({
            status: exitCode === 0
              ? terminal === 'stop' || terminal === 'cancelled' ? 'cancelled' : 'completed'
              : 'failed',
            completedAt: before.completedAt,
            progress: { recentOutput: exit.data.result?.content },
            canCancel: false,
          })
          expect(result.tasks[0].error).toBe(exitCode === 0 ? undefined : 'Shell exited with status 7')
          expect(result.tasks[0].result).toBe(before.result)
          expect(snapshot([
            ...events, exit,
            started('read-again', tool, { shellId: '42' }, 9),
            readExit('read-again', '42', exitCode, 10, success),
          ])).toEqual(result)
        })
      })

      it.each([0, 7])('merges exit=%s into the captured terminal execution after alias reuse', (exitCode) => {
        const launch = launched('caller-name', 'async', false, 'original')
        const events = [
          ...launch,
          started('read', tool, { shellId: 'caller-name' }, 2),
          nativeStart('42', 'original', 3),
          ...terminalize('42', launch[0].timestamp),
          ...launched('caller-name', 'async', false, 'replacement', 6),
        ]
        const before = snapshot(events)
        const exit = readExit('read', 'caller-name', exitCode)
        const result = snapshot([...events, exit])
        expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
          status: exitCode === 0
            ? terminal === 'stop' || terminal === 'cancelled' ? 'cancelled' : 'completed'
            : 'failed',
          completedAt: '2026-09-01T08:00:05.000Z',
          progress: { recentOutput: exit.data.result?.content },
        })
        expect(result.tasks.find((task) => task.id === 'caller-name')).toEqual(
          before.tasks.find((task) => task.id === 'caller-name'),
        )
        expect(result.runningCount).toBe(1)
      })

      it.each([
        { success: true, content: 'Late progress, not a process exit' },
        { success: false, content: 'Reader failed, not a process exit' },
        { success: true, content: '<shellId: 99 completed with exit code 0>' },
        { success: false, content: '<shellId: 99 completed with exit code 7>' },
      ])('ignores non-exit or mismatched results ($success, $content)', ({ success, content }) => {
        const launch = launched('42')
        const events = [
          ...launch, ...launched('99'),
          started('read', tool, { shellId: '42' }, 2),
          ...terminalize('42', launch[0].timestamp),
        ]
        expect(snapshot([
          ...events, completed('read', { success, result: { content } }, 8),
        ])).toEqual(snapshot(events))
      })

      it.each([0, 7])('rejects exit=%s after the captured terminal execution is replaced', (exitCode) => {
        const launch = launched('42', 'async', false, 'original')
        const events = [
          ...launch,
          started('read', tool, { shellId: '42' }, 2),
          ...terminalize('42', launch[0].timestamp),
          ...launched('42', 'async', false, 'replacement', 6),
          reportedShell('42', '2026-09-01T08:00:06.000Z', 7, {
            status: 'completed', completedAt: '2026-09-01T08:00:07.000Z', result: 'Replacement result',
          }),
        ]
        expect(snapshot([...events, readExit('read', '42', exitCode)])).toEqual(snapshot(events))
      })
    })

    it.each([0, 7])('fills missing inventory completion time once from a structured exit=%s', (exitCode) => {
      const launch = launched('42')
      const inventory = reportedShell('42', launch[0].timestamp, 4, { status: 'completed' })
      const exit = completed('read', {
        result: {
          ...inventory.data.result,
          content: '',
          exit: { type: 'shell_exit', shellId: '42', exitCode, outputPreview: 'Structured final output' },
        } as NonNullable<ToolComplete['data']['result']>,
      }, 5)
      const events = [...launch, started('read', tool, { shellId: '42' }, 2), inventory, exit]
      const result = snapshot(events)
      expect(result.tasks[0]).toMatchObject({
        status: exitCode === 0 ? 'completed' : 'failed',
        completedAt: exit.timestamp, progress: { recentOutput: 'Structured final output' },
      })
      expect(snapshot([
        ...events, started('again', tool, { shellId: '42' }, 6),
        { ...exit, timestamp: '2026-09-01T08:00:08.000Z', data: { ...exit.data, toolCallId: 'again' } },
      ])).toEqual(result)
    })

    describe.each(['native', 'read'])('already known %s exit', (source) => {
      it.each([0, 7])('keeps the first authoritative exit=%s outcome and timestamp', (exitCode) => {
        const events = [
          ...launched('42'),
          started('read', tool, { shellId: '42' }, 2),
          ...(source === 'native'
            ? [nativeComplete('42', { toolCallId: 'launch-42' }, 4, exitCode)]
            : [started('first-read', tool, { shellId: '42' }, 3), readExit('first-read', '42', exitCode, 4)]),
        ]
        const before = snapshot(events)
        expect(snapshot([...events, readExit('read', '42', exitCode === 0 ? 7 : 0)]))
          .toEqual(before)
        const result = snapshot([...events, readExit('read', '42', exitCode)])
        expect(result.tasks[0]).toMatchObject({
          status: exitCode === 0 ? 'completed' : 'failed',
          completedAt: '2026-09-01T08:00:04.000Z',
          progress: { recentOutput: expect.stringContaining('Final process output') },
        })
        expect(snapshot([
          ...events, readExit('read', '42', exitCode),
          nativeComplete('42', { toolCallId: 'launch-42' }, 9, exitCode === 0 ? 7 : 0),
        ])).toEqual(result)
      })
    })

    it.each([0, 7])('does not retain weaker inventory failure ahead of native/read exit=%s', (exitCode) => {
      const launch = launched('42')
      const events = [
        ...launch,
        started('read', tool, { shellId: '42' }, 2),
        reportedShell('42', launch[0].timestamp, 3, {
          status: 'failed', error: 'Inventory failure', completedAt: '2026-09-01T08:00:03.000Z',
        }),
        nativeComplete('42', { toolCallId: 'launch-42' }, 4, exitCode),
        readExit('read', '42', exitCode),
      ]
      const result = snapshot(events)
      expect(result.tasks[0]).toMatchObject({
        status: exitCode === 0 ? 'completed' : 'failed',
        completedAt: '2026-09-01T08:00:03.000Z',
        progress: { recentOutput: expect.stringContaining('Final process output') },
      })
      expect(result.tasks[0].error).toBe(exitCode === 0 ? undefined : 'Shell exited with status 7')
    })

    it('retains matching native final output without extending an observed exit duration', () => {
      const events = [
        ...launched('42'),
        started('read', tool, { shellId: '42' }, 2),
        readExit('read', '42', 7, 3),
      ]
      const finish = nativeComplete('42', { toolCallId: 'launch-42' }, 4, 7)
      const result = snapshot([...events, finish])
      expect(result.tasks[0]).toMatchObject({
        status: 'failed', completedAt: '2026-09-01T08:00:03.000Z',
        progress: { recentOutput: 'Native final output' },
      })
      expect(snapshot([
        ...events, finish, nativeComplete('42', { toolCallId: 'launch-42' }, 8, 7),
      ])).toEqual(result)
    })
  })

  describe.each(['read_bash', 'read_shell', 'bash_output', 'list_bash'])('targeted %s identity', (tool) => {
    it.each([0, 7])('ignores stale exit and output after the requested slot is replaced (exit=%s)', (exitCode) => {
      const events = [
        ...launched('42', 'async', false, 'old-launch'),
        started('read', tool, { shellId: '42' }, 2),
        ...launched('42', 'async', false, 'new-launch', 4),
      ]
      expect(snapshot([
        ...events,
        completed('read', {
          result: { content: `Old output\n<shellId: 42 completed with exit code ${exitCode}>` },
        }, 6),
      ])).toEqual(snapshot(events))
    })

    it('finishes the captured execution after handoff without following its reused alias', () => {
      const result = snapshot([
        ...launched('caller-name', 'async', false, 'old-launch'),
        started('read', tool, { shellId: 'caller-name' }, 2),
        nativeStart('42', 'old-launch', 3),
        ...launched('caller-name', 'async', false, 'new-launch', 4),
        completed('read', {
          result: { content: 'Original output\n<shellId: caller-name completed with exit code 0>' },
        }, 6),
      ])
      expect(result.runningCount).toBe(1)
      expect(result.tasks.find((task) => task.id === '42')).toMatchObject({
        status: 'completed', progress: { recentOutput: expect.stringContaining('Original output') },
      })
      expect(result.tasks.find((task) => task.id === 'caller-name')).toMatchObject({ status: 'running' })
    })

    it('keeps successful progress reads live and ignores failed reads without exit evidence', () => {
      const events = [
        ...launched('42'),
        started('read', tool, { shellId: '42' }, 2),
        completed('read', { result: { content: 'Current progress' } }, 3),
      ]
      const before = snapshot(events)
      expect(before.runningCount).toBe(1)
      expect(before.tasks[0]).toMatchObject({
        status: 'running', progress: { recentOutput: 'Current progress' },
      })
      expect(snapshot([
        ...events,
        started('failed-read', tool, { shellId: '42' }, 4),
        completed('failed-read', {
          success: false, error: { message: 'Read unavailable' },
          result: { content: 'Observer error, not process output' },
        }, 5),
      ])).toEqual(before)
    })

    it('accepts explicit exit evidence even if the read itself reports failure', () => {
      const result = snapshot([
        ...launched('42'),
        started('read', tool, { shellId: '42' }, 2),
        completed('read', {
          success: false,
          result: { content: '<shellId: 42 completed with exit code 7>' },
        }, 3),
      ])
      expect(result.runningCount).toBe(0)
      expect(result.tasks[0]).toMatchObject({ status: 'failed', error: 'Shell exited with status 7' })
    })

    it('does not bind an initially unknown target to a shell that appeared later', () => {
      const events = [
        started('read', tool, { shellId: '42' }, 0),
        ...launched('42', 'async', false, 'new-launch', 4),
      ]
      expect(snapshot([
        ...events,
        completed('read', { result: { content: '<shellId: 42 completed with exit code 0>' } }, 6),
      ])).toEqual(snapshot(events))
    })

    it('rejects explicit exit evidence for an unrelated shell', () => {
      const events = [
        ...launched('42'),
        ...launched('99'),
        started('read', tool, { shellId: '42' }, 2),
      ]
      expect(snapshot([
        ...events,
        completed('read', { result: { content: '<shellId: 99 completed with exit code 0>' } }, 3),
      ])).toEqual(snapshot(events))
    })

    it('does not hydrate stale task metadata into a tied-time replacement', () => {
      const events = [
        ...launched('42', 'async', false, 'old-launch'),
        started('read', tool, { shellId: '42' }, 2),
        ...launched('42', 'async', false, 'new-launch'),
      ]
      const metadata = reportedShell('42', '2026-09-01T08:00:00.000Z', 4, {
        status: 'failed', error: 'Old exit', result: 'Old final result',
      })
      expect(snapshot([
        ...events,
        { ...metadata, data: { ...metadata.data, toolCallId: 'read' } },
      ])).toEqual(snapshot(events))
    })
  })
})
