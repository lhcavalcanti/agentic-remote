import { QUEUE_BATCH_REMEMBERED, validateQueueBatch, type QueueBatchInput } from '../shared/queue-batch'

/** A batch whose outcome is unknown, and what it took from the composer. */
export interface UnsettledQueueBatch {
  input: QueueBatchInput
  seed: string
}

const storageKey = 'agentic-remote:queue-batch-unsettled'

/**
 * Unconfirmed batches by session, kept for this tab across a reload so a
 * retry reuses the same batch ID. Anything malformed is dropped.
 */
export function readUnsettledQueueBatches(): Record<string, UnsettledQueueBatch> {
  try {
    const stored: unknown = JSON.parse(globalThis.sessionStorage?.getItem(storageKey) || '{}')
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}
    const result: Record<string, UnsettledQueueBatch> = {}
    for (const [key, value] of Object.entries(stored).slice(0, QUEUE_BATCH_REMEMBERED)) {
      const entry = value as Partial<UnsettledQueueBatch> | null
      if (!entry || typeof entry.seed !== 'string') continue
      try {
        const input = validateQueueBatch(entry.input)
        result[key] = { input: { batchId: input.batchId, prompts: (entry.input as QueueBatchInput).prompts }, seed: entry.seed }
      } catch {
        // Not a batch this version can retry.
      }
    }
    return result
  } catch {
    return {}
  }
}

export function writeUnsettledQueueBatches(batches: Record<string, UnsettledQueueBatch>): void {
  try {
    const entries = Object.entries(batches).slice(-QUEUE_BATCH_REMEMBERED)
    if (entries.length) globalThis.sessionStorage?.setItem(storageKey, JSON.stringify(Object.fromEntries(entries)))
    else globalThis.sessionStorage?.removeItem(storageKey)
  } catch {
    // Storage full or unavailable: the batch is still remembered until the page closes.
  }
}
