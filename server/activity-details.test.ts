import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ACTIVITY_DETAIL_TEXT_LIMIT_BYTES } from '../shared/activity-details.js'
import { activityDetailFromEvents, AgentService, type CopilotClientLike } from './agent-service.js'
import { SessionStore } from './session-store.js'

const startedAt = '2026-11-20T06:00:00.000Z'
const completedAt = '2026-11-20T06:00:01.250Z'
let sequence = 0

function event(type: string, data: object, timestamp: string): SessionEvent {
  sequence += 1
  return {
    id: `event-${sequence}`, type, data, timestamp, parentId: null, ephemeral: false,
  } as unknown as SessionEvent
}

function start(toolCallId: string, toolName: string, args: unknown, extra: object = {}): SessionEvent {
  return event('tool.execution_start', { toolCallId, toolName, arguments: args, ...extra }, startedAt)
}

function complete(toolCallId: string, data: object): SessionEvent {
  return event('tool.execution_complete', { toolCallId, ...data }, completedAt)
}

function text(value: string) {
  return { text: value, truncated: false, originalBytes: Buffer.byteLength(value) }
}

describe('activity details from the event log', () => {
  it('gives a bash call its whole command and output, past the row preview', () => {
    const command = 'pnpm vitest run server/activity-details.test.ts \\\n  --reporter dot'
    const output = Array.from({ length: 40 }, (_, index) => `ok ${index + 1} - activity details`).join('\n')
    const detail = activityDetailFromEvents([
      start('call_other', 'view', { path: 'README.md' }),
      start('call_bash', 'bash', { command, description: 'Run the activity tests' }),
      complete('call_other', { success: true, result: { content: 'readme' } }),
      complete('call_bash', { success: true, result: { content: 'ok (truncated)', detailedContent: output } }),
    ], 'call_bash')

    expect(detail).toEqual({
      toolCallId: 'call_bash',
      toolName: 'bash',
      kind: 'tool',
      status: 'completed',
      startedAt,
      completedAt,
      durationMs: 1250,
      arguments: { format: 'command', ...text(command) },
      result: text(output),
    })
  })

  it('takes the result from content, output or message when there is no detailed content', () => {
    for (const result of [{ content: 'from content' }, { output: 'from output' }, { message: 'from message' }]) {
      const detail = activityDetailFromEvents([
        start('call_read', 'view', { path: 'docs/app-spec.md' }),
        complete('call_read', { success: true, result }),
      ], 'call_read')
      expect(detail?.result?.text).toBe(Object.values(result)[0])
    }
  })

  it('names the MCP server and tool and gives the arguments as JSON', () => {
    const args = { query: 'repo:example/field-notes activity', perPage: 5 }
    const detail = activityDetailFromEvents([
      start('call_mcp', 'search_code', args, { mcpServerName: 'github-mcp-server', mcpToolName: 'search_code' }),
      complete('call_mcp', { success: true, result: { content: '2 results' } }),
    ], 'call_mcp')

    expect(detail).toMatchObject({
      toolName: 'search_code',
      mcpServerName: 'github-mcp-server',
      mcpToolName: 'search_code',
      arguments: { format: 'json', ...text(JSON.stringify(args, null, 2)) },
      result: text('2 results'),
    })
    expect(activityDetailFromEvents([
      start('call_inferred', 'github-mcp-server-get_me', {}),
    ], 'call_inferred')).toMatchObject({ mcpServerName: 'github', mcpToolName: 'get_me' })
    expect(activityDetailFromEvents([
      start('call_plain', 'view', { path: 'README.md' }),
    ], 'call_plain')).not.toHaveProperty('mcpServerName')
  })

  it('gives string arguments as text and leaves out empty ones', () => {
    const patch = '*** Begin Patch\n*** Update File: README.md\n+Field notes\n*** End Patch'
    expect(activityDetailFromEvents([start('call_patch', 'apply_patch', patch)], 'call_patch')?.arguments)
      .toEqual({ format: 'text', ...text(patch) })
    expect(activityDetailFromEvents([start('call_empty', 'list_agents', {})], 'call_empty'))
      .not.toHaveProperty('arguments')
  })

  it('keeps the whole error of a failed call beside its output', () => {
    const detail = activityDetailFromEvents([
      start('call_failed', 'bash', { command: 'pnpm test' }),
      complete('call_failed', {
        success: false,
        error: { code: 'failure', message: 'Command failed\nexit status 2' },
        result: { content: 'FAIL server/x.test.ts' },
      }),
    ], 'call_failed')

    expect(detail).toMatchObject({
      status: 'failed',
      error: text('Command failed\nexit status 2'),
      result: text('FAIL server/x.test.ts'),
    })
    expect(activityDetailFromEvents([
      start('call_string_error', 'view', { path: 'missing.md' }),
      complete('call_string_error', { success: false, error: 'missing.md does not exist' }),
    ], 'call_string_error')?.error).toEqual(text('missing.md does not exist'))
  })

  it('reports a call with no completion yet as running, with its arguments', () => {
    const detail = activityDetailFromEvents([
      start('call_running', 'bash', { command: 'sleep 30' }),
    ], 'call_running')

    expect(detail).toEqual({
      toolCallId: 'call_running',
      toolName: 'bash',
      kind: 'tool',
      status: 'running',
      startedAt,
      arguments: { format: 'command', ...text('sleep 30') },
    })
  })

  it('names skill and agent calls by their kind', () => {
    expect(activityDetailFromEvents([start('call_skill', 'skill', { skill: 'pdf' })], 'call_skill'))
      .toMatchObject({ kind: 'skill' })
    expect(activityDetailFromEvents([start('call_task', 'task', { agent_type: 'explore' })], 'call_task'))
      .toMatchObject({ kind: 'agent' })
  })

  it('finds nothing for a call that is not in the log', () => {
    expect(activityDetailFromEvents([
      start('call_bash', 'bash', { command: 'pwd' }),
      complete('call_bash', { success: true, result: { content: '/home/demo' } }),
    ], 'call_missing')).toBeUndefined()
  })

  it('strips terminal colours and NUL characters', () => {
    const detail = activityDetailFromEvents([
      start('call_color', 'bash', { command: 'printf "\u001b[32mok\u001b[0m"' }),
      complete('call_color', {
        success: true, result: { content: '\u001b[1;32mPASS\u001b[0m\u0000 all\r\ndone\u0000\n' },
      }),
    ], 'call_color')

    expect(detail?.arguments?.text).toBe('printf "ok"')
    expect(detail?.result).toEqual(text('PASS all\ndone'))
  })

  it('strips terminal titles, hyperlinks and other escapes too', () => {
    const output = [
      '\u001b]0;pnpm test\u0007\u001b]2;window\u001b\\Report',
      '\u001b]8;;https://example.com/report\u0007open the report\u001b]8;;\u0007 now\u0007',
      '\u001b(B\u001b=\u001b7plain\u001b8 text\u001bP1$r0m\u001b\\ done\u001b',
    ].join('\n')
    const detail = activityDetailFromEvents([
      start('call_osc', 'bash', { command: 'pnpm test' }),
      complete('call_osc', { success: true, result: { content: output } }),
    ], 'call_osc')

    expect(detail?.result?.text).toBe('Report\nopen the report now\nplain text done')
  })

  it('cuts each text at 256 KiB on a character boundary and reports its whole size', () => {
    const output = 'é'.repeat(200_000)
    const command = `echo ${'x'.repeat(ACTIVITY_DETAIL_TEXT_LIMIT_BYTES)}`
    const detail = activityDetailFromEvents([
      start('call_large', 'bash', { command }),
      complete('call_large', { success: true, result: { content: output } }),
    ], 'call_large')

    expect(ACTIVITY_DETAIL_TEXT_LIMIT_BYTES).toBe(256 * 1024)
    expect(detail?.result).toEqual({
      text: 'é'.repeat(ACTIVITY_DETAIL_TEXT_LIMIT_BYTES / 2),
      truncated: true,
      originalBytes: 400_000,
    })
    expect(detail?.arguments).toEqual({
      format: 'command',
      text: command.slice(0, ACTIVITY_DETAIL_TEXT_LIMIT_BYTES),
      truncated: true,
      originalBytes: command.length,
    })
    const odd = activityDetailFromEvents([
      complete('call_odd', { success: true, result: { content: `a${'é'.repeat(ACTIVITY_DETAIL_TEXT_LIMIT_BYTES)}` } }),
    ], 'call_odd')?.result
    expect(Buffer.byteLength(odd!.text)).toBe(ACTIVITY_DETAIL_TEXT_LIMIT_BYTES - 1)
    expect(odd!.text.endsWith('é')).toBe(true)
  })
})

describe('reading activity details from a Copilot session', () => {
  const directories: string[] = []
  afterEach(async () => {
    await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  })

  it('reads only that session log, and refuses a call the log does not have', async () => {
    const directory = path.resolve('graphify/.cache', `activity-details-${randomUUID()}`)
    await mkdir(directory, { recursive: true })
    directories.push(directory)
    const store = new SessionStore(directory)
    await store.initialize()
    await store.create({
      id: 'session-with-log', provider: 'copilot', cwd: directory, title: 'Field notes',
      status: 'idle', isOpen: true, updatedAt: startedAt, messages: [],
    }, { backend: 'sdk', managedOpen: true })
    const reader = vi.fn(async (_sessionId: string) => [
      start('call_bash', 'bash', { command: 'pwd' }),
      complete('call_bash', { success: true, result: { content: '/home/demo' } }),
    ])
    const service = new AgentService(
      store, {} as unknown as CopilotClientLike, async () => [], async () => {}, reader,
    )

    await expect(service.readActivityDetail('session-with-log', 'call_bash')).resolves.toMatchObject({
      toolCallId: 'call_bash', status: 'completed', result: text('/home/demo'),
    })
    await expect(service.readActivityDetail('session-with-log', 'call_missing')).rejects.toMatchObject({
      statusCode: 404, message: 'This tool call is not in the session log.',
    })
    await expect(service.readActivityDetail('another-session', 'call_bash')).rejects.toThrow('Session not found')
    expect(reader.mock.calls).toEqual([['session-with-log'], ['session-with-log']])
    expect(service.providers()[0]).toMatchObject({ supportsActivityDetails: true })
  })
})
