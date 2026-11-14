import { describe, expect, it } from 'vitest'
import {
  DURABLE_TASK_LINE_PREFIX,
  durableTaskTitle,
  formatProactivePrompt,
  proactivePromptEvents,
} from './manager-automatic.js'

const finished = {
  id: 'a'.repeat(64), kind: 'finished', computerId: 'hub', sessionId: 's1', taskGeneration: 14, revision: 1317,
} as const
const failed = {
  id: 'b'.repeat(64), kind: 'failed', computerId: 'hub', sessionId: 's2', taskGeneration: 3, revision: 9,
} as const

describe('Oracle automatic turn prompts', () => {
  it('keeps the proactive prompt Oracle has always received', () => {
    // A batch's queued message is matched by content after a restart, so this
    // text must not change shape.
    expect(formatProactivePrompt([finished, failed])).toBe([
      'Review these durable manager-owned lifecycle events. Read state only, then record exactly one outcome for every event.',
      `Event ${'a'.repeat(64)}: kind=finished; computer=hub; session=s1; taskGeneration=14; revision=1317.`,
      `Event ${'b'.repeat(64)}: kind=failed; computer=hub; session=s2; taskGeneration=3; revision=9.`,
    ].join('\n'))
  })

  it('reads back the kind of every admitted event, and only those', () => {
    const content = formatProactivePrompt([finished, failed])
    expect(proactivePromptEvents(content)).toEqual([
      { id: finished.id, kind: 'finished' },
      { id: failed.id, kind: 'failed' },
    ])
    expect(proactivePromptEvents(content, [failed.id])).toEqual([{ id: failed.id, kind: 'failed' }])
    expect(proactivePromptEvents('Docs finished', [finished.id])).toEqual([])
  })

  it('finds the durable task title after the execution prompt', () => {
    const content = [
      'Durable task: quoted inside the execution prompt',
      '',
      `${DURABLE_TASK_LINE_PREFIX}Ship docs`,
      'Next action: Review the draft',
    ].join('\n')
    expect(durableTaskTitle(content)).toBe('Ship docs')
    expect(durableTaskTitle('Investigate the gate')).toBeUndefined()
  })
})
