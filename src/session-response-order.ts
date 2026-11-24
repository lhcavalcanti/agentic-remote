import type { ManagedSession } from '../shared/contracts'

let eventSequence = 0
const responseSequences = new WeakMap<object, number>()

export function currentSessionEventSequence(): number {
  return eventSequence
}

export function nextSessionEventSequence(): number {
  eventSequence += 1
  return eventSequence
}

/** Local request provenance, not a wire field or a durable session revision. */
export function rememberSessionResponse<TResult>(result: TResult, startedAt: number): TResult {
  const remember = (value: unknown) => {
    if (!value || typeof value !== 'object') return
    const session = value as Partial<ManagedSession>
    if (typeof session.id === 'string' && typeof session.computerId === 'string') {
      responseSequences.set(value, startedAt)
    }
  }
  if (Array.isArray(result)) {
    result.forEach(remember)
  } else if (result && typeof result === 'object') {
    remember(result)
    const envelope = result as { session?: unknown; sessions?: unknown }
    remember(envelope.session)
    if (Array.isArray(envelope.sessions)) envelope.sessions.forEach(remember)
  }
  return result
}

export function sessionResponseStartedAt(session: ManagedSession): number | undefined {
  return responseSequences.get(session)
}

export function projectSessionResponse(
  incoming: ManagedSession,
  current: ManagedSession | undefined,
  lastEventAt: number,
): ManagedSession {
  const startedAt = sessionResponseStartedAt(incoming)
  if (
    !current || current.id !== incoming.id || current.computerId !== incoming.computerId ||
    startedAt === undefined || lastEventAt <= startedAt
  ) return incoming
  if (
    incoming.revision !== undefined &&
    current.revision !== undefined &&
    incoming.revision > current.revision
  ) return incoming

  // Keep hydration and mutation results, but an older request cannot undo an
  // intervening recovery event at the same durable revision.
  return rememberSessionResponse({
    ...incoming,
    failedPrompt: current.failedPrompt,
    recoveryAcknowledgementPending: current.recoveryAcknowledgementPending,
    queueState: current.queueState,
  }, startedAt)
}

/**
 * Carries a transcript the browser already holds onto the snapshot rows that
 * arrive without one.
 *
 * A listing answers with summaries, and a summary never carries messages. Its
 * empty transcript is therefore silence rather than a statement that the
 * conversation is empty, and installing it blanks the open conversation until
 * the next full read refills it -- which the reader sees as the transcript
 * disappearing and coming back.
 *
 * A conversation that really was emptied says so through its own response or
 * event, which is authoritative and carries the emptiness before any snapshot
 * built from it can arrive.
 *
 * A held window comes along whole: where it starts, how long the transcript
 * is, and the rows it carries from before it.
 */
export function carrySnapshotTranscripts(
  rows: ManagedSession[],
  existing: ManagedSession[],
): ManagedSession[] {
  if (!rows.some((row) => row.messages.length === 0)) {
    return rows
  }
  const held = new Map(
    existing
      .filter((entry) => entry.messages.length > 0)
      .map((entry) => [`${entry.computerId}:${entry.id}`, entry]),
  )
  if (held.size === 0) {
    return rows
  }
  return rows.map((row) => {
    if (row.messages.length > 0) {
      return row
    }
    const entry = held.get(`${row.computerId}:${row.id}`)
    if (!entry) return row
    const { messages, messagesStart, messagesTotal, carriedMessages } = entry
    return messagesStart === undefined
      ? { ...row, messages }
      : { ...row, messages, messagesStart, messagesTotal, carriedMessages }
  })
}
