import { describe, expect, it, vi } from 'vitest'
import {
  SideQuestionError,
  sideQuestionBoundary,
  withSideQuestionTimeout,
} from './side-question.js'

describe('side question boundary', () => {
  it('forks everything when no turn is unfinished', () => {
    expect(sideQuestionBoundary([])).toBeUndefined()
    expect(sideQuestionBoundary([
      { id: 's', type: 'session.start' },
      { id: 'u1', type: 'user.message' },
      { id: 'a1', type: 'assistant.message' },
      { id: 'e1', type: 'assistant.turn_end' },
      { id: 'c1', type: 'session.usage_checkpoint' },
    ])).toBeUndefined()
  })

  it('stops before the first prompt after the last completed turn', () => {
    expect(sideQuestionBoundary([
      { id: 'u1', type: 'user.message' },
      { id: 'e1', type: 'assistant.turn_end' },
      { id: 'u2', type: 'user.message' },
      { id: 't2', type: 'assistant.turn_start' },
      { id: 'u3', type: 'user.message' },
    ])).toBe('u2')
    expect(sideQuestionBoundary([
      { id: 's', type: 'session.start' },
      { id: 'u1', type: 'user.message' },
      { id: 't1', type: 'tool.execution_start' },
    ])).toBe('u1')
  })

  it('ignores a pending prompt it cannot name', () => {
    expect(sideQuestionBoundary([
      { id: 'e1', type: 'assistant.turn_end' },
      { type: 'user.message' },
    ])).toBeUndefined()
  })
})

describe('side question timeout', () => {
  it('settles with the answer and clears its timer', async () => {
    vi.useFakeTimers()
    try {
      await expect(withSideQuestionTimeout(Promise.resolve('done'), 1_000)).resolves.toBe('done')
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects with a gateway timeout when the answer takes too long', async () => {
    vi.useFakeTimers()
    try {
      const waiting = withSideQuestionTimeout(new Promise(() => {}), 120_000)
      const rejection = expect(waiting).rejects.toMatchObject({
        name: 'SideQuestionError',
        statusCode: 504,
        message: 'The side question was not answered within 120 seconds.',
      })
      await vi.advanceTimersByTimeAsync(120_000)
      await rejection
      expect(new SideQuestionError('x', 400)).toBeInstanceOf(Error)
    } finally {
      vi.useRealTimers()
    }
  })
})
