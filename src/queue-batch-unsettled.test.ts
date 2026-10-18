// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { readUnsettledQueueBatches, writeUnsettledQueueBatches } from './queue-batch-unsettled'

afterEach(() => sessionStorage.clear())

describe('unconfirmed batches kept for this tab', () => {
  it('survives a reload with the same batch ID and prompts', () => {
    const batch = { input: { batchId: 'batch-0001', prompts: ['first ', 'second'] }, seed: 'first' }
    writeUnsettledQueueBatches({ 'computer:session': batch })
    expect(readUnsettledQueueBatches()).toEqual({ 'computer:session': batch })
    writeUnsettledQueueBatches({})
    expect(sessionStorage.length).toBe(0)
  })

  it('drops anything this version could not retry', () => {
    sessionStorage.setItem('agentic-remote:queue-batch-unsettled', JSON.stringify({
      bad: { input: { batchId: 'no', prompts: ['x'] }, seed: '' },
      blank: { input: { batchId: 'batch-0001', prompts: [' '] }, seed: '' },
      seedless: { input: { batchId: 'batch-0001', prompts: ['x'] } },
      good: { input: { batchId: 'batch-0002', prompts: ['x'] }, seed: '' },
    }))
    expect(Object.keys(readUnsettledQueueBatches())).toEqual(['good'])
    sessionStorage.setItem('agentic-remote:queue-batch-unsettled', 'not json')
    expect(readUnsettledQueueBatches()).toEqual({})
  })

  it('keeps at most the most recent twenty', () => {
    writeUnsettledQueueBatches(Object.fromEntries(Array.from({ length: 25 }, (_, index) => [
      `session-${index}`, { input: { batchId: `batch-${String(index).padStart(4, '0')}`, prompts: ['x'] }, seed: '' },
    ])))
    const kept = Object.keys(readUnsettledQueueBatches())
    expect(kept).toHaveLength(20)
    expect(kept[0]).toBe('session-5')
  })
})
