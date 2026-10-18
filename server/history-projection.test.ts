import type { SessionEvent } from '@github/copilot-sdk'
import { describe, expect, it } from 'vitest'
import { messagesFromHistory } from './agent-service.js'

/** Deterministic PRNG so every failure can be replayed from its seed. */
function random(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const terminalTypes = ['assistant.turn_end', 'session.idle', 'abort', 'session.error', 'session.shutdown'] as const

function eventsFor(seed: number, length: number): SessionEvent[] {
  const next = random(seed)
  const pick = <T,>(values: readonly T[]) => values[Math.floor(next() * values.length)]
  const events: SessionEvent[] = []
  for (let index = 0; index < length; index += 1) {
    const timestamp = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, index * 10)).toISOString()
    const base = { id: `event-${index}`, parentId: null, timestamp }
    // A small pool of call IDs makes duplicate starts, repeated and unknown
    // completions, and completions after a turn ended all likely.
    const toolCallId = `call-${Math.floor(next() * 6)}`
    const kind = next()
    if (kind < 0.18) {
      events.push({ ...base, type: 'user.message', data: { content: `ask ${index}` } } as SessionEvent)
    } else if (kind < 0.33) {
      events.push({
        ...base, type: 'assistant.message',
        data: { messageId: next() < 0.3 ? 'repeated-message' : `message-${index}`, content: `reply ${index}` },
      } as SessionEvent)
    } else if (kind < 0.58) {
      const taskComplete = next() < 0.2
      events.push({
        ...base, type: 'tool.execution_start',
        data: {
          toolCallId,
          toolName: taskComplete ? 'task_complete' : pick(['bash', 'view', 'edit']),
          arguments: taskComplete ? { summary: next() < 0.8 ? `summary ${index}` : '' } : { command: 'true' },
        },
      } as SessionEvent)
    } else if (kind < 0.83) {
      const withResult = next() < 0.6
      events.push({
        ...base, type: 'tool.execution_complete',
        data: {
          toolCallId: next() < 0.1 ? 'call-unknown' : toolCallId,
          success: next() < 0.75,
          ...(withResult ? { result: { content: `result ${index}` } } : {}),
        },
      } as SessionEvent)
    } else {
      events.push({ ...base, type: pick(terminalTypes), data: {} } as SessionEvent)
    }
  }
  return events
}

interface ModelMessage {
  id: string
  role: string
  status?: string
  content?: string
}

/**
 * The reduction as it was before it became linear: finishing activities
 * rescans every message, and a completion updates the first message with the
 * tool's ID. Only the fields this test generates are modelled.
 */
function quadraticModel(events: SessionEvent[]): ModelMessage[] {
  const messages: ModelMessage[] = []
  const summaries = new Map<string, string>()
  const finish = (status: string) => {
    for (const message of messages) {
      if (message.role === 'activity' && message.status === 'running') message.status = status
    }
  }
  for (const event of events) {
    const data = event.data as Record<string, unknown>
    if (event.type === 'user.message') {
      finish('completed')
      messages.push({ id: event.id, role: 'user' })
    } else if (event.type === 'assistant.message') {
      finish('completed')
      messages.push({ id: String(data.messageId), role: 'assistant' })
    } else if (event.type === 'tool.execution_start') {
      const summary = String((data.arguments as Record<string, unknown>).summary ?? '').trim()
      if (data.toolName === 'task_complete' && summary) summaries.set(String(data.toolCallId), summary)
      messages.push({ id: `tool:${String(data.toolCallId)}`, role: 'activity', status: 'running' })
    } else if (event.type === 'tool.execution_complete') {
      const message = messages.find((entry) => entry.id === `tool:${String(data.toolCallId)}`)
      if (message) {
        message.status = data.success ? 'completed' : 'failed'
        const result = String((data.result as Record<string, unknown> | undefined)?.content ?? '').trim()
        const summary = summaries.has(String(data.toolCallId))
          ? result || summaries.get(String(data.toolCallId))
          : undefined
        if (data.success && summary) {
          finish('completed')
          message.role = 'assistant'
          message.content = summary
          message.status = undefined
        }
      }
    }
    if ((terminalTypes as readonly string[]).includes(event.type)) {
      finish(event.type === 'assistant.turn_end' || event.type === 'session.idle' ? 'completed' : 'failed')
    }
  }
  return messages
}

describe('messagesFromHistory', () => {
  it('matches the quadratic reduction for generated histories', () => {
    for (let seed = 1; seed <= 400; seed += 1) {
      const events = eventsFor(seed, 5 + (seed % 120))
      const actual = messagesFromHistory(events).map((message) => ({
        id: message.id,
        role: message.role,
        status: message.activityStatus,
        ...(message.role === 'assistant' && message.id.startsWith('tool:') ? { content: message.content } : {}),
      }))
      const expected = quadraticModel(events).map((message) => ({
        id: message.id,
        role: message.role,
        status: message.status,
        ...(message.content !== undefined ? { content: message.content } : {}),
      }))
      expect(actual, `seed ${seed}`).toEqual(expected)
    }
  })

  it('completes the first activity sharing a tool call ID and leaves a later duplicate running', () => {
    const at = '2026-01-01T00:00:00.000Z'
    const messages = messagesFromHistory([
      { type: 'tool.execution_start', id: 'a', parentId: null, timestamp: at, data: { toolCallId: 'same', toolName: 'bash', arguments: {} } },
      { type: 'tool.execution_start', id: 'b', parentId: null, timestamp: at, data: { toolCallId: 'same', toolName: 'bash', arguments: {} } },
      { type: 'tool.execution_complete', id: 'c', parentId: null, timestamp: at, data: { toolCallId: 'same', success: false } },
    ] as SessionEvent[])
    expect(messages.map((message) => message.activityStatus)).toEqual(['failed', 'running'])
  })

  it('reduces a long tool-heavy history in linear time', () => {
    // Proportional rather than absolute, so a slow machine does not fail it:
    // the quadratic reduction took roughly sixteen times as long for four
    // times the events, a linear one about four.
    const time = (length: number) => {
      const events = eventsFor(7, length)
      messagesFromHistory(events)
      const started = performance.now()
      for (let round = 0; round < 3; round += 1) messagesFromHistory(events)
      return performance.now() - started
    }
    const small = time(5_000)
    const large = time(20_000)
    expect(large / small).toBeLessThan(10)
  })
})
