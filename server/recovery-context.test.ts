import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../shared/contracts.js'
import { buildRecoveryBrief } from './recovery-context.js'

function message(
  id: string,
  role: ChatMessage['role'],
  content: string,
): ChatMessage {
  return {
    id,
    role,
    content,
    createdAt: '2026-09-09T00:00:00.000Z',
  }
}

describe('buildRecoveryBrief', () => {
  it('keeps earliest goal and newest context while excluding activities and identifiers', () => {
    const messages = [
      message('notice-id', 'notice', 'Opened the project'),
      message('goal-id', 'user', 'Build resilient session recovery'),
      message('activity-id', 'activity', 'tool call opaque-tool-123'),
      message('answer-id', 'assistant', 'I will preserve the queue and runtime'),
      ...Array.from({ length: 12 }, (_, index) =>
        message(`middle-${index}`, 'assistant', `middle ${index} ${'x'.repeat(900)}`)),
      message('latest-user-id', 'user', 'Newest constraint: never restore tool state'),
      message('latest-answer-id', 'assistant', 'Ready to recover with text context only'),
    ]

    const brief = buildRecoveryBrief(messages)

    expect(brief.prompt).toContain('Build resilient session recovery')
    expect(brief.prompt).toContain('Newest constraint: never restore tool state')
    expect(brief.prompt).toContain('Ready to recover with text context only')
    expect(brief.prompt).toContain('Context truncated: yes')
    expect(brief.prompt).not.toContain('opaque-tool-123')
    expect(brief.prompt).not.toContain('goal-id')
    expect(brief.prompt).not.toContain('activity-id')
    expect(brief.prompt).toContain('Do not call tools or take further action')
    expect(brief.truncated).toBe(true)
    expect(brief.messageCount).toBeLessThan(16)
  })

  it('bounds individual and total context size deterministically', () => {
    const messages = Array.from({ length: 30 }, (_, index) =>
      message(`message-${index}`, index % 2 ? 'assistant' : 'user', `${index}:${'z'.repeat(4_000)}`))

    const first = buildRecoveryBrief(messages)
    const second = buildRecoveryBrief(messages)

    expect(second).toEqual(first)
    expect(first.prompt.length).toBeLessThan(9_000)
    expect(first.prompt).toContain('0:')
    expect(first.prompt).toContain('29:')
    expect(first.truncated).toBe(true)
  })
})
