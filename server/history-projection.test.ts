import type { SessionEvent } from '@github/copilot-sdk'
import { describe, expect, it } from 'vitest'
import { createTranscriptBuilder, messagesFromHistory } from './agent-service.js'
import { checkedMessagesFromHistory, checkedPendingUserInput } from './transcript-test-helpers.js'

/** A soak run sets this to explore new seeds; failures name the seed. */
const seedOffset = Number(process.env.PROPERTY_SEED_OFFSET ?? 0)

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
      if (data.toolName === 'task_complete') summaries.set(String(data.toolCallId), summary)
      messages.push({ id: `tool:${String(data.toolCallId)}`, role: 'activity', status: 'running' })
    } else if (event.type === 'tool.execution_complete') {
      const message = messages.find((entry) => entry.id === `tool:${String(data.toolCallId)}`)
      if (message) {
        message.status = data.success ? 'completed' : 'failed'
        const summary = summaries.has(String(data.toolCallId))
          ? summaries.get(String(data.toolCallId))
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
    for (let seed = seedOffset + 1; seed <= seedOffset + 400; seed += 1) {
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
    const messages = checkedMessagesFromHistory([
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

describe('transcript builder', () => {
  const at = (second: number) => new Date(Date.UTC(2026, 0, 1, 0, 0, second)).toISOString()
  const start = (id: string, second: number, data: Record<string, unknown>, agentId?: string) =>
    ({
      type: 'tool.execution_start', id, parentId: null, timestamp: at(second),
      ...(agentId ? { agentId } : {}), data: { arguments: {}, ...data },
    }) as SessionEvent

  it('regroups an activity when the tool that groups it is logged after it', () => {
    const child = start('child', 1, { toolCallId: 'child-call', toolName: 'view', parentToolCallId: 'agent-call' })
    const parent = start('parent', 2, { toolCallId: 'agent-call', toolName: 'task', arguments: { agent_type: 'explore' } })
    const builder = createTranscriptBuilder()

    builder.apply([child])
    expect(builder.messages()[0].activityGroupId).toBeUndefined()
    builder.apply([parent])

    expect(builder.messages()[0].activityGroupId).toBe('tool:agent-call')
    expect(builder.messages()).toStrictEqual(messagesFromHistory([child, parent]))
  })

  it("regroups an agent's activity when its start is logged after it", () => {
    const task = start('task', 1, { toolCallId: 'agent-call', toolName: 'task', arguments: { agent_type: 'explore' } })
    const work = start('work', 2, { toolCallId: 'work-call', toolName: 'view' }, 'agent-1')
    const started = {
      type: 'subagent.started', id: 'started', parentId: null, timestamp: at(3), agentId: 'agent-1',
      data: { toolCallId: 'agent-call', agentName: 'explore', agentDisplayName: 'Explore', agentDescription: 'Explore' },
    } as SessionEvent
    const builder = createTranscriptBuilder()

    builder.apply([task, work])
    expect(builder.messages()[1].activityGroupId).toBeUndefined()
    builder.apply([started])

    expect(builder.messages()[1].activityGroupId).toBe('tool:agent-call')
  })

  it('hands out frozen rows and reuses those that have not changed since', () => {
    const builder = createTranscriptBuilder()
    builder.apply([
      { type: 'user.message', id: 'ask', parentId: null, timestamp: at(0), data: { content: 'Look around' } } as SessionEvent,
      start('look', 1, { toolCallId: 'look-call', toolName: 'view' }),
    ])
    const first = builder.messages()
    builder.apply([{
      type: 'tool.execution_complete', id: 'looked', parentId: null, timestamp: at(2),
      data: { toolCallId: 'look-call', success: true },
    } as SessionEvent])
    const second = builder.messages()

    expect(first.every((message) => Object.isFrozen(message))).toBe(true)
    expect(second[0]).toBe(first[0])
    expect(first[1].activityStatus).toBe('running')
    expect(second[1].activityStatus).toBe('completed')
  })

  /**
   * Histories with everything that groups, renames or reverts a row: nested
   * tool calls whose parents may be logged late, agents whose start may come
   * after their work, repeated call ids, and task completions.
   */
  function groupedEventsFor(seed: number, length: number): SessionEvent[] {
    const next = random(seed)
    const pick = <T,>(values: readonly T[]) => values[Math.floor(next() * values.length)]
    const events: SessionEvent[] = []
    for (let index = 0; index < length; index += 1) {
      const base = { id: `event-${index}`, parentId: null, timestamp: at(index) }
      const toolCallId = `call-${Math.floor(next() * 8)}`
      const agentId = next() < 0.3 ? pick(['agent-1', 'agent-2']) : undefined
      const kind = next()
      if (kind < 0.1) {
        events.push({ ...base, type: 'user.message', data: { content: `ask ${index}`, ...(next() < 0.2 ? { source: 'agent-x' } : {}) } } as SessionEvent)
      } else if (kind < 0.18) {
        events.push({ ...base, ...(agentId ? { agentId } : {}), type: 'assistant.message', data: { messageId: `message-${index}`, content: `reply ${index}` } } as SessionEvent)
      } else if (kind < 0.5) {
        const toolName = pick(['bash', 'view', 'task', 'skill', 'task_complete'])
        events.push({
          ...base, ...(agentId ? { agentId } : {}), type: 'tool.execution_start',
          data: {
            toolCallId, toolName,
            ...(next() < 0.5 ? { parentToolCallId: `call-${Math.floor(next() * 8)}` } : {}),
            arguments: toolName === 'task_complete' ? { summary: next() < 0.7 ? `summary ${index}` : '' } : { command: 'true' },
          },
        } as SessionEvent)
      } else if (kind < 0.72) {
        events.push({
          ...base, type: 'tool.execution_complete',
          data: { toolCallId, success: next() < 0.8, ...(next() < 0.5 ? { result: { content: `result ${index}` } } : {}) },
        } as SessionEvent)
      } else if (kind < 0.8) {
        events.push({ ...base, agentId: pick(['agent-1', 'agent-2']), type: 'subagent.started', data: { toolCallId, agentName: 'explore' } } as unknown as SessionEvent)
      } else if (kind < 0.88) {
        events.push({
          ...base,
          ...(next() < 0.5 ? { parentId: `event-${Math.max(0, index - 1 - Math.floor(next() * 3))}` } : {}),
          ...(agentId ? { agentId } : {}),
          type: 'session.task_complete',
          data: { summary: next() < 0.6 ? `final ${index}` : '', ...(next() < 0.2 ? { success: false } : {}), ...(next() < 0.1 ? { outcome: 'continue' } : {}) },
        } as SessionEvent)
      } else {
        events.push({ ...base, ...(agentId ? { agentId } : {}), type: pick(terminalTypes), data: {} } as SessionEvent)
      }
    }
    return events
  }

  it('agrees with the full scan at every prefix of generated histories', () => {
    for (let seed = seedOffset + 1; seed <= seedOffset + 120; seed += 1) {
      checkedMessagesFromHistory(eventsFor(seed, 5 + (seed % 25)), `plain seed ${seed}`)
      checkedMessagesFromHistory(groupedEventsFor(seed, 5 + (seed % 35)), `grouped seed ${seed}`)
    }
  })
})

describe('pending user input tracker', () => {
  /** Questions asked by tool starts and requests, answered, cancelled and repeated. */
  function questionEventsFor(seed: number, length: number): SessionEvent[] {
    const next = random(seed)
    const pick = <T,>(values: readonly T[]) => values[Math.floor(next() * values.length)]
    const events: SessionEvent[] = []
    for (let index = 0; index < length; index += 1) {
      const timestamp = new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString()
      const agent = next() < 0.2 ? (next() < 0.5 ? { agentId: 'agent-1' } : { data: { agentId: 'agent-1' } }) : {}
      const base = { id: `event-${index}`, parentId: null, timestamp, ...('agentId' in agent ? agent : {}) }
      const toolCallId = `call-${Math.floor(next() * 4)}`
      const question = () => ({
        ...(next() < 0.5 ? { question: `Pick ${index}` } : { message: next() < 0.8 ? `Choose ${index}` : ' ' }),
        ...(next() < 0.5 ? { choices: ['One', ' ', 'Two'] } : {}),
        ...(next() < 0.3 ? { allowFreeform: false } : {}),
        ...(next() < 0.2 ? { requestedSchema: { properties: { size: { type: 'string', enum: ['S', 'M'] } } } } : {}),
      })
      const extra = 'data' in agent ? agent.data : {}
      const kind = next()
      if (kind < 0.3) {
        events.push({
          ...base, type: 'tool.execution_start',
          data: { ...extra, toolCallId, toolName: pick(['ask_user', 'ask-user', 'Ask_User', 'bash']), arguments: question() },
        } as unknown as SessionEvent)
      } else if (kind < 0.45) {
        events.push({
          ...base, type: 'assistant.message',
          data: {
            ...extra, messageId: `message-${index}`, content: '',
            toolRequests: [
              { toolCallId, name: pick(['ask_user', 'view']), arguments: question() },
              ...(next() < 0.3 ? [{ toolCallId: `call-${Math.floor(next() * 4)}`, toolName: 'ask_user', arguments: question() }] : []),
            ],
          },
        } as unknown as SessionEvent)
      } else if (kind < 0.7) {
        events.push({ ...base, type: 'tool.execution_complete', data: { ...extra, toolCallId, success: next() < 0.8 } } as unknown as SessionEvent)
      } else if (kind < 0.8) {
        events.push({ ...base, type: 'user.message', data: { ...extra, content: 'Two' } } as unknown as SessionEvent)
      } else {
        events.push({ ...base, type: pick(['abort', 'session.error', 'session.shutdown', 'assistant.turn_end', 'session.idle']), data: extra } as unknown as SessionEvent)
      }
    }
    return events
  }

  it('agrees with the full scan at every prefix of generated histories', () => {
    for (let seed = seedOffset + 1; seed <= seedOffset + 150; seed += 1) {
      checkedPendingUserInput(questionEventsFor(seed, 4 + (seed % 30)), `seed ${seed}`)
    }
  })
})
