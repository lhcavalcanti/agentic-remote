import type { ChatMessage, ManagedSession } from '../shared/contracts'
import { TRANSCRIPT_CARRIED_LIMIT, type TranscriptPage } from '../shared/transcript-window'

function isRunning(message: ChatMessage): boolean {
  return message.role === 'activity' && message.activityStatus === 'running'
}

/**
 * How far a row has come: an activity waiting to run, then running, then
 * anything else -- an activity that finished or failed, or the agent's message
 * a finished root task is read again as, under the same id. A row only moves
 * forward.
 */
function progress(message: ChatMessage): number {
  if (message.role !== 'activity') return 2
  if (message.activityStatus === 'pending') return 0
  return message.activityStatus === 'running' ? 1 : 2
}

/**
 * Of two copies of one row, the one carried with the latest window, unless
 * the other has come further: a copy read before an activity finished cannot
 * undo that.
 */
function laterCopy(row: ChatMessage, carried: ChatMessage | undefined): ChatMessage {
  if (!carried) return row
  return progress(row) > progress(carried) ? row : carried
}

/**
 * `rows` from before what a window holds, each brought up to what the window
 * carries. A row still running there that the window does not carry as
 * running has finished without saying how, so it goes with every row before
 * it -- unless the window carried as many rows as it can, and may have left
 * it out for that.
 */
function reconcileEarlier(
  rows: readonly ChatMessage[],
  carriedMessages: readonly ChatMessage[] | undefined,
): ChatMessage[] {
  const carried = new Map((carriedMessages ?? []).map((message) => [message.id, message]))
  const reconciled = rows.map((message) => laterCopy(message, carried.get(message.id)))
  if (carried.size >= TRANSCRIPT_CARRIED_LIMIT) return reconciled
  const stale = reconciled.findLastIndex((message) => isRunning(message) && !carried.has(message.id))
  return stale >= 0 ? reconciled.slice(stale + 1) : reconciled
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
  const earlier = reconcileEarlier(held.slice(0, start - heldStart), incoming.carriedMessages)
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
 *
 * The page was read before it arrived, so what the window carries is brought
 * into it the way a later window's is, and a row the page still shows running
 * that has finished since is left out with the rows before it: the reader
 * pages them in again, as they are now.
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
  const earlier = reconcileEarlier(page.messages, session.carriedMessages)
  if (!earlier.length) return undefined
  return {
    ...session,
    messages: [...earlier, ...session.messages],
    messagesStart: start - earlier.length,
    carriedMessages: stillCarried(session.carriedMessages, earlier),
  }
}
