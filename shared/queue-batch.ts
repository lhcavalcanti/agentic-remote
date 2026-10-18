/**
 * Queueing several prompts in one request. Each prompt stays its own queue
 * item and its own turn; nothing is combined. See docs/design/queue-batch.md.
 */

export const QUEUE_BATCH_MAX_PROMPTS = 50
/** The same limit a single message has. */
export const QUEUE_BATCH_MAX_PROMPT_LENGTH = 200_000
export const QUEUE_BATCH_MAX_CHARACTERS = 1_000_000
/** How many admitted batches a session remembers, so a retry is recognised. */
export const QUEUE_BATCH_REMEMBERED = 20
const BATCH_ID_PATTERN = /^[A-Za-z0-9_-]{8,100}$/
/**
 * Room for the largest batch however it is encoded: a million characters
 * can take several bytes each, and JSON escapes some further.
 */
export const QUEUE_BATCH_BODY_LIMIT = 8 * 1024 * 1024

export interface QueueBatchInput {
  /** Chosen by the client and reused on a retry, so a batch is admitted once. */
  batchId: string
  prompts: string[]
}

export interface QueueBatchReceipt {
  id: string
  /** The queue items this batch became, in order. */
  promptIds: string[]
  /** True when this `batchId` had already been admitted; nothing new was queued. */
  duplicate: boolean
}

/** A batch a session admitted, kept so a retried request is recognised. */
export interface QueueBatchRecord {
  id: string
  /** Of the admitted prompts, so the same ID cannot admit different ones. */
  digest: string
  promptIds: string[]
  admittedAt: string
}

export class QueueBatchError extends Error {
  readonly statusCode: 400 | 409
  /** Refused before anything was written, so the same prompts can be sent again. */
  readonly uncertainDelivery = false

  constructor(message: string, statusCode: 400 | 409 = 400) {
    super(message)
    this.name = 'QueueBatchError'
    this.statusCode = statusCode
  }
}

function count(value: number): string {
  return value.toLocaleString('en-US')
}

/**
 * Checks a whole batch before anything is written, so a refused batch leaves
 * nothing queued. Prompts are trimmed the way a message is.
 */
export function validateQueueBatch(input: unknown): QueueBatchInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new QueueBatchError('A batch must be an object with batchId and prompts.')
  }
  const fields = input as Record<string, unknown>
  for (const key of Object.keys(fields)) {
    if (key !== 'batchId' && key !== 'prompts') {
      throw new QueueBatchError(`Unknown field ${key.slice(0, 40)} in the batch.`)
    }
  }
  const { batchId, prompts } = fields
  if (typeof batchId !== 'string' || !BATCH_ID_PATTERN.test(batchId)) {
    throw new QueueBatchError('batchId must be 8 to 100 letters, digits, dashes, or underscores.')
  }
  if (!Array.isArray(prompts)) throw new QueueBatchError('prompts must be a list of prompts.')
  if (prompts.length === 0) throw new QueueBatchError('A batch needs at least one prompt.')
  if (prompts.length > QUEUE_BATCH_MAX_PROMPTS) {
    throw new QueueBatchError(`A batch holds at most ${QUEUE_BATCH_MAX_PROMPTS} prompts.`)
  }
  let total = 0
  const trimmed = prompts.map((prompt, index) => {
    const position = index + 1
    if (typeof prompt !== 'string') throw new QueueBatchError(`Prompt ${position} must be text.`)
    const text = prompt.trim()
    if (!text) throw new QueueBatchError(`Prompt ${position} is blank.`)
    if (text.length > QUEUE_BATCH_MAX_PROMPT_LENGTH) {
      throw new QueueBatchError(
        `Prompt ${position} is longer than ${count(QUEUE_BATCH_MAX_PROMPT_LENGTH)} characters.`,
      )
    }
    // A command reports what it printed instead of starting a turn, so it is
    // sent on its own rather than mixed into a batch of prompts.
    if (text.startsWith('/')) {
      throw new QueueBatchError(`Prompt ${position} is a command. Send commands on their own.`)
    }
    total += text.length
    return text
  })
  if (total > QUEUE_BATCH_MAX_CHARACTERS) {
    throw new QueueBatchError(
      `A batch holds at most ${count(QUEUE_BATCH_MAX_CHARACTERS)} characters in all.`,
    )
  }
  return { batchId, prompts: trimmed }
}
