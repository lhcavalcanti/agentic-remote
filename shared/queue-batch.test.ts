import { describe, expect, it } from 'vitest'
import {
  QUEUE_BATCH_MAX_CHARACTERS,
  QUEUE_BATCH_MAX_PROMPTS,
  QueueBatchError,
  validateQueueBatch,
} from './queue-batch.js'

const id = 'batch-0001'

function refusal(input: unknown): string | undefined {
  try {
    validateQueueBatch(input)
    return undefined
  } catch (error) {
    expect(error).toBeInstanceOf(QueueBatchError)
    expect((error as QueueBatchError).statusCode).toBe(400)
    return (error as Error).message
  }
}

describe('validateQueueBatch', () => {
  it('keeps each prompt separate and in order, trimmed like a message', () => {
    expect(validateQueueBatch({ batchId: id, prompts: ['  first  ', 'second\n'] })).toEqual({
      batchId: id,
      prompts: ['first', 'second'],
    })
  })

  it('accepts the documented maximums', () => {
    const prompts = Array.from({ length: QUEUE_BATCH_MAX_PROMPTS }, (_, index) => `prompt ${index}`)
    expect(validateQueueBatch({ batchId: id, prompts }).prompts).toHaveLength(50)
    const large = ['x'.repeat(200_000), 'y'.repeat(200_000), 'z'.repeat(200_000), 'w'.repeat(200_000), 'v'.repeat(200_000)]
    expect(large.join('').length).toBe(QUEUE_BATCH_MAX_CHARACTERS)
    expect(validateQueueBatch({ batchId: id, prompts: large }).prompts).toHaveLength(5)
  })

  it.each([
    ['no prompts', { batchId: id, prompts: [] }, /at least one prompt/],
    ['too many prompts', { batchId: id, prompts: Array.from({ length: 51 }, () => 'p') }, /at most 50 prompts/],
    ['a blank prompt', { batchId: id, prompts: ['first', '   '] }, /Prompt 2 is blank/],
    ['an oversized prompt', { batchId: id, prompts: ['x'.repeat(200_001)] }, /Prompt 1 is longer than 200,000 characters/],
    ['too much text', { batchId: id, prompts: Array.from({ length: 6 }, () => 'x'.repeat(200_000)) }, /at most 1,000,000 characters/],
    ['a command', { batchId: id, prompts: ['first', ' /usage'] }, /Prompt 2 is a command/],
    ['a non-string prompt', { batchId: id, prompts: ['first', 7] }, /Prompt 2 must be text/],
    ['prompts that are not a list', { batchId: id, prompts: 'first' }, /prompts must be a list/],
    ['a missing batch ID', { prompts: ['first'] }, /batchId/],
    ['a short batch ID', { batchId: 'abc', prompts: ['first'] }, /batchId/],
    ['a batch ID with odd characters', { batchId: 'batch id/../x', prompts: ['first'] }, /batchId/],
    ['an overlong batch ID', { batchId: 'b'.repeat(101), prompts: ['first'] }, /batchId/],
    ['extra fields', { batchId: id, prompts: ['first'], combine: true }, /Unknown field combine/],
    ['not an object', 'first', /must be an object/],
  ])('refuses %s before anything is written', (_name, input, message) => {
    expect(refusal(input)).toMatch(message)
  })
})
