import type { ChatMessage, SessionDetail } from './contracts.js'

/**
 * How many of a session's latest messages a browser asks for when it opens
 * one. It covers the 250 the conversation draws with room to reveal more
 * before anything has to be fetched; on the longest sessions measured it is
 * about 0.3 MB of JSON.
 */
export const TRANSCRIPT_WINDOW = 500

/** The most messages one window or one page of older messages may hold. */
export const TRANSCRIPT_WINDOW_LIMIT = 2_000

/** How a session is read: `window` asks for only its latest messages. */
export interface SessionReadOptions {
  window?: number
}

/** A transcript read by absolute index, without being copied whole. */
export interface TranscriptReader {
  readonly length: number
  at(index: number): ChatMessage
}

/** The latest part of a transcript, and where it sits in the whole. */
export interface TranscriptWindow {
  messages: ChatMessage[]
  /** The absolute index of the first of `messages`. */
  messagesStart: number
  /** How many messages the whole transcript has. */
  messagesTotal: number
  /** Rows from before `messagesStart` the conversation still draws. */
  carriedMessages: ChatMessage[]
}

/** Asks for the messages before the first one a browser holds. */
export interface TranscriptPageQuery {
  /** The absolute index of the first message held. */
  before: number
  /** That message's id; a page is only cut where it still is. */
  beforeId: string
  limit: number
}

export interface TranscriptPage {
  messages: ChatMessage[]
  messagesStart: number
  messagesTotal: number
}

export function transcriptOf(messages: readonly ChatMessage[]): TranscriptReader {
  return { length: messages.length, at: (index) => messages[index] }
}

/**
 * At most this many rows come along with a window, the latest of them, so a
 * transcript full of activities that never finished cannot make a window grow
 * with it.
 */
const CARRIED_LIMIT = TRANSCRIPT_WINDOW

/**
 * The rows from before `start` that the conversation draws with the window:
 * an activity that is still running, and every activity row a row it draws is
 * grouped under, parent by parent. The browser carries the same rows past its
 * own cut, so a window that left them out would lift a child out of its group,
 * or hide the only sign that something is still running.
 */
export function carriedBefore(
  transcript: TranscriptReader,
  start: number,
  window: readonly ChatMessage[],
): ChatMessage[] {
  const wanted = new Set<string>()
  for (const message of window) {
    if (message.role === 'activity' && message.activityGroupId) wanted.add(message.activityGroupId)
  }
  const carried: ChatMessage[] = []
  for (
    let index = Math.min(start, transcript.length) - 1;
    index >= 0 && carried.length < CARRIED_LIMIT;
    index -= 1
  ) {
    const message = transcript.at(index)
    if (message.role !== 'activity') continue
    if (message.activityStatus !== 'running' && !wanted.has(message.id)) continue
    carried.push(message)
    if (message.activityGroupId) wanted.add(message.activityGroupId)
  }
  return carried.reverse()
}

/** The last `size` rows, without copying any of them. */
export function windowTranscript(transcript: TranscriptReader, size: number): TranscriptWindow {
  const total = transcript.length
  const start = Math.max(0, total - size)
  const messages: ChatMessage[] = []
  for (let index = start; index < total; index += 1) messages.push(transcript.at(index))
  return {
    messages,
    messagesStart: start,
    messagesTotal: total,
    carriedMessages: carriedBefore(transcript, start, messages),
  }
}

/**
 * The rows before a browser's first one, or nothing when that row is no longer
 * where the browser holds it -- a transcript rebuilt from its event log, say.
 * Splicing a page onto a boundary that moved would duplicate or drop rows, so
 * the browser reads a fresh window instead.
 */
export function pageTranscript(
  transcript: TranscriptReader,
  query: TranscriptPageQuery,
): TranscriptPage | undefined {
  const { before, beforeId, limit } = query
  if (before >= transcript.length || transcript.at(before).id !== beforeId) return undefined
  const start = Math.max(0, before - limit)
  const messages: ChatMessage[] = []
  for (let index = start; index < before; index += 1) messages.push(transcript.at(index))
  return { messages, messagesStart: start, messagesTotal: transcript.length }
}

/** The refusal for a page whose boundary moved; the browser reads a fresh window. */
export function transcriptMoved(): Error & { statusCode: number } {
  return Object.assign(
    new Error('The conversation changed before its earlier messages could be read.'),
    { statusCode: 409 },
  )
}

/**
 * A page cut from a session read whole, for a reader or computer that cannot
 * page by itself.
 */
export function pageWholeSession(
  session: SessionDetail | undefined,
  query: TranscriptPageQuery,
): TranscriptPage {
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 })
  const page = session.messagesStart === undefined
    ? pageTranscript(transcriptOf(session.messages), query)
    : undefined
  if (!page) throw transcriptMoved()
  return page
}

/**
 * Windows a session that came back whole, as an older computer answers or a
 * read that had to copy it anyway; a windowed one is left as it is.
 */
export function windowSession<T extends SessionDetail>(session: T, size: number | undefined): T {
  if (size === undefined || session.messagesStart !== undefined) return session
  return { ...session, ...windowTranscript(transcriptOf(session.messages), size) }
}
