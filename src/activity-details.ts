import type { ActivityDetail } from '../shared/contracts'
import { getActivityDetail } from './api'

/**
 * A call's detail is final once its completion is logged, so it is kept for
 * the next time its row opens. The newest are kept, bounded by count and by
 * text held.
 */
const MAX_KEPT_DETAILS = 48
const MAX_KEPT_CHARACTERS = 4 * 1024 * 1024
const kept = new Map<string, { detail: ActivityDetail; size: number }>()
let keptCharacters = 0
// A read in flight, shared by an opener asking for the same one (React runs a
// new effect twice in development) rather than asking again.
const reading = new Map<string, Promise<ActivityDetail>>()

function detailKey(computerId: string, sessionId: string, toolCallId: string): string {
  return JSON.stringify([computerId, sessionId, toolCallId])
}

function keep(key: string, detail: ActivityDetail): void {
  // A running call, or one an abort, error or shutdown cut short, can still
  // log its completion.
  if (!detail.completedAt) return
  const previous = kept.get(key)
  if (previous) {
    kept.delete(key)
    keptCharacters -= previous.size
  }
  const size = (detail.arguments?.text.length ?? 0) +
    (detail.result?.text.length ?? 0) +
    (detail.error?.text.length ?? 0)
  kept.set(key, { detail, size })
  keptCharacters += size
  for (const [oldest, entry] of kept) {
    if (oldest === key || (kept.size <= MAX_KEPT_DETAILS && keptCharacters <= MAX_KEPT_CHARACTERS)) break
    kept.delete(oldest)
    keptCharacters -= entry.size
  }
}

/** A kept call's detail, without counting this as a use; safe while rendering. */
export function peekActivityDetail(
  computerId: string,
  sessionId: string,
  toolCallId: string,
): ActivityDetail | undefined {
  return kept.get(detailKey(computerId, sessionId, toolCallId))?.detail
}

/** A kept call's detail, now the most recently used. */
export function keptActivityDetail(
  computerId: string,
  sessionId: string,
  toolCallId: string,
): ActivityDetail | undefined {
  const key = detailKey(computerId, sessionId, toolCallId)
  const entry = kept.get(key)
  if (!entry) return undefined
  kept.delete(key)
  kept.set(key, entry)
  return entry.detail
}

/**
 * A call's detail: kept once it has finished, otherwise read from its
 * computer. Openers asking for the same `read` share one request; a new one,
 * such as the read once a call finishes, always asks again.
 */
export function loadActivityDetail(
  computerId: string,
  sessionId: string,
  toolCallId: string,
  read: string,
): Promise<ActivityDetail> {
  const finished = keptActivityDetail(computerId, sessionId, toolCallId)
  if (finished) return Promise.resolve(finished)
  const key = detailKey(computerId, sessionId, toolCallId)
  const readKey = `${key}\u0000${read}`
  const pending = reading.get(readKey)
  if (pending) return pending
  const request = getActivityDetail(computerId, sessionId, toolCallId).then((detail) => {
    keep(key, detail)
    return detail
  })
  const settle = () => {
    if (reading.get(readKey) === request) reading.delete(readKey)
  }
  request.then(settle, settle)
  reading.set(readKey, request)
  return request
}

export interface ActivityDetailFailure {
  /** Missing from the log, impossible on this provider or computer, or a failed read. */
  kind: 'not-found' | 'unavailable' | 'error'
  message: string
}

export function activityDetailFailure(error: unknown): ActivityDetailFailure {
  const status = error && typeof error === 'object' ? Reflect.get(error, 'statusCode') : undefined
  const message = error instanceof Error ? error.message.trim() : ''
  if (status === 404) {
    return { kind: 'not-found', message: message || 'This tool call is not in the session log.' }
  }
  if (status === 501) {
    return { kind: 'unavailable', message: message || 'Tool call details are unavailable here.' }
  }
  return { kind: 'error', message: message || 'The details could not be loaded.' }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KiB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
}
