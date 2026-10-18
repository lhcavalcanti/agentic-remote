import { createHash, randomUUID } from 'node:crypto'
import type { QueuedPrompt } from '../shared/contracts.js'
import type { QueueBatchInput } from '../shared/queue-batch.js'

/** Identifies a batch's prompts, so one batch ID cannot admit two lists. */
export function queueBatchDigest(prompts: readonly string[]): string {
  return createHash('sha256').update(JSON.stringify(prompts)).digest('hex')
}

/** The queue items a validated batch becomes: one each, in order. */
export function queueBatchItems(batch: QueueBatchInput): QueuedPrompt[] {
  const createdAt = new Date().toISOString()
  return batch.prompts.map((content, index) => ({
    id: randomUUID(),
    content,
    createdAt,
    batch: { id: batch.batchId, index, size: batch.prompts.length },
  }))
}
