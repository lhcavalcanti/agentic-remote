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

/**
 * Marks a refusal raised before the batch was written. Nothing was queued, so
 * the client may edit and resend instead of being held to a retry.
 */
export function nothingQueued(error: unknown): Error {
  const refusal = error instanceof Error ? error : new Error(String(error))
  if (!/Nothing was queued/.test(refusal.message)) {
    refusal.message = `${refusal.message.replace(/\.?$/, '.')} Nothing was queued.`
  }
  return Object.assign(refusal, {
    statusCode: (Reflect.get(refusal, 'statusCode') as number | undefined) ?? 409,
    uncertainDelivery: false,
  })
}
