/**
 * A tool call's complete detail is read on demand from the owning computer's
 * event log; each text in it is cut to this many bytes of UTF-8.
 */
export const ACTIVITY_DETAIL_TEXT_LIMIT_BYTES = 256 * 1024

/**
 * The tool call IDs providers issue (`call_…`, `toolu_…`, UUIDs), bounded by
 * the 100-character route parameter the server accepts.
 */
export const TOOL_CALL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/

/** The tool call a transcript activity row (`tool:<toolCallId>`) stands for. */
export function toolCallIdFromActivityId(messageId: string): string | undefined {
  if (!messageId.startsWith('tool:')) return undefined
  const toolCallId = messageId.slice('tool:'.length)
  return TOOL_CALL_ID_PATTERN.test(toolCallId) ? toolCallId : undefined
}
