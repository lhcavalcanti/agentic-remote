import { z } from 'zod'
import {
  TRANSCRIPT_WINDOW_LIMIT,
  type SessionReadOptions,
  type TranscriptPageQuery,
} from '../shared/transcript-window.js'

const count = z.coerce.number().int().min(1).max(TRANSCRIPT_WINDOW_LIMIT)
const windowQuerySchema = z.object({ window: count.optional() })

/**
 * The `?window=` of a session read. Without one the whole transcript is read,
 * as every reader from before windows expects.
 */
export function sessionReadOptions(query: unknown): SessionReadOptions | undefined {
  const { window } = windowQuerySchema.parse(query ?? {})
  return window === undefined ? undefined : { window }
}

/** The window size an event socket asked for, or nothing for anything else. */
export function transcriptWindowParam(value: unknown): number | undefined {
  const parsed = count.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export const transcriptPageQuerySchema: z.ZodType<TranscriptPageQuery> = z.object({
  before: z.coerce.number().int().min(0),
  beforeId: z.string().min(1).max(1_024),
  limit: count,
})
