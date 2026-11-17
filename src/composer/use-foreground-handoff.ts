import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ManagedSession } from '../../shared/contracts'
import { sessionKey } from '../session-presentation'

export const foregroundHandoffTimeoutMs = 10_000

type Handoff = {
  owner: object
  revision?: number
  sequence: number
  failedAt?: string
}

export function useForegroundHandoff(session: ManagedSession | undefined, sequence: number) {
  const key = session ? sessionKey(session) : undefined
  const knownFailure = session?.failedPrompt?.failedAt
  const owner = useMemo(() => ({ key }), [key])
  const currentOwner = useRef(owner)
  useLayoutEffect(() => { currentOwner.current = owner }, [owner])
  const [handoff, setHandoff] = useState<Handoff>()
  // The acceptance response can still contain the pre-poll foreground bit.
  // A duplicate accepted revision is not evidence that the new turn ended.
  const active = Boolean(handoff && handoff.owner === owner && session?.status === 'running' &&
    session.foregroundTurnActive !== true &&
    (!session.failedPrompt || session.failedPrompt.failedAt === handoff.failedAt) &&
    (session.revision !== undefined && handoff.revision !== undefined
      ? session.revision <= handoff.revision
      : sequence <= handoff.sequence))

  if (handoff && !active) setHandoff(undefined)

  useEffect(() => {
    if (!handoff) return
    const timer = window.setTimeout(() => {
      setHandoff((current) => current === handoff ? undefined : current)
    }, foregroundHandoffTimeoutMs)
    return () => window.clearTimeout(timer)
  }, [handoff])

  const accepted = useCallback((response: ManagedSession, acceptedSequence: number) => {
    if (currentOwner.current !== owner || !owner.key || sessionKey(response) !== owner.key || response.status !== 'running') return
    if (response.failedPrompt && response.failedPrompt.failedAt !== knownFailure) return
    const next = {
      owner, revision: response.revision, sequence: acceptedSequence, failedAt: response.failedPrompt?.failedAt || knownFailure,
    }
    setHandoff((current) => current?.owner === owner && current.revision !== undefined &&
      response.revision !== undefined && current.revision > response.revision ? current : next)
  }, [owner, knownFailure])

  const clear = useCallback(() => {
    setHandoff((current) => current?.owner === owner ? undefined : current)
  }, [owner])

  return { active, accepted, clear }
}
