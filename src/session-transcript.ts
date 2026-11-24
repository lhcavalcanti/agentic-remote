import type { ChatMessage, ManagedSession } from '../shared/contracts'
import type { TranscriptPage } from '../shared/transcript-window'

function isRunning(message: ChatMessage): boolean {
  return message.role === 'activity' && message.activityStatus === 'running'
}

/** What is carried from before the rows held, without the ones now held. */
function stillCarried(
  carried: readonly ChatMessage[] | undefined,
  held: readonly ChatMessage[],
): ChatMessage[] {
  if (!carried?.length) return []
  const ids = new Set(held.map((message) => message.id))
  return carried.filter((message) => !ids.has(message.id))
}

/**
 * The transcript to hold once `incoming` arrives over what is held.
 *
 * A window -- an answer with `messagesStart` -- is the latest word on the rows
 * it holds. The reader may also hold rows from before it, revealed or paged in
 * earlier. Those stay only while they line up with it, every row held at an
 * index the window also holds being the same row, so nothing held can be
 * duplicated, dropped or put out of order. A row the window carries replaces
 * the held copy of it. A held row still shown running that the window does not
 * carry as running has finished without saying how, so it goes, with every row
 * before it; the reader can page them in again.
 *
 * A whole transcript, or another session, is taken as it is.
 */
export function mergeTranscriptWindow(
  existing: ManagedSession | undefined,
  incoming: ManagedSession,
): ManagedSession {
  const start = incoming.messagesStart
  if (
    start === undefined || !existing ||
    existing.id !== incoming.id || existing.computerId !== incoming.computerId
  ) return incoming
  const heldStart = existing.messagesStart ?? 0
  const held = existing.messages
  const heldEnd = heldStart + held.length
  const overlapEnd = Math.min(heldEnd, start + incoming.messages.length)
  if (heldStart >= start || overlapEnd <= start) return incoming
  for (let index = start; index < overlapEnd; index += 1) {
    if (held[index - heldStart].id !== incoming.messages[index - start].id) return incoming
  }
  const carried = new Map((incoming.carriedMessages ?? []).map((message) => [message.id, message]))
  let earlier = held.slice(0, start - heldStart).map((message) => carried.get(message.id) ?? message)
  const stale = earlier.findLastIndex((message) => isRunning(message) && !carried.has(message.id))
  if (stale >= 0) earlier = earlier.slice(stale + 1)
  if (!earlier.length) return incoming
  const messages = [...earlier, ...incoming.messages]
  return {
    ...incoming,
    messages,
    messagesStart: start - earlier.length,
    carriedMessages: stillCarried(incoming.carriedMessages, earlier),
  }
}

/**
 * `session` with a page of earlier messages before it, or nothing when the
 * session no longer starts where the page was asked for -- a fresh window
 * arrived meanwhile -- and the page is dropped rather than spliced.
 */
export function prependTranscriptPage(
  session: ManagedSession,
  page: TranscriptPage,
  beforeId: string,
): ManagedSession | undefined {
  const start = session.messagesStart
  if (
    start === undefined || session.messages[0]?.id !== beforeId ||
    page.messagesStart + page.messages.length !== start
  ) return undefined
  return {
    ...session,
    messages: [...page.messages, ...session.messages],
    messagesStart: page.messagesStart,
    carriedMessages: stillCarried(session.carriedMessages, page.messages),
  }
}
