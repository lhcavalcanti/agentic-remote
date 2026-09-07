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
  }, startedAt)
}
