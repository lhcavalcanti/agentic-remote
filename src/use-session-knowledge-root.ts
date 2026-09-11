import { useCallback, useEffect, useRef, useState } from 'react'
import type { ManagedSession, SessionKnowledgeBinding } from '../shared/contracts'
import { getSessionKnowledgeRoot, SessionKnowledgeRequestError, updateSessionKnowledgeRoot } from './api'
import type { KnowledgePosition } from './knowledge-position'
import { sessionKey } from './session-presentation'

type SessionIdentity = Pick<ManagedSession, 'computerId' | 'id'>

function bindingKey(binding: SessionKnowledgeBinding): string {
  return sessionKey({ computerId: binding.computerId, id: binding.sessionId })
}

export function knowledgePositionForBinding(
  binding: SessionKnowledgeBinding | undefined,
  remembered: KnowledgePosition | undefined,
): KnowledgePosition | undefined {
  if (!binding) return remembered
  if (!binding.rootId) return binding.revision === 0 ? remembered : undefined
  return remembered?.rootId === binding.rootId
    ? remembered
    : { rootId: binding.rootId, path: '.' }
}

export function useSessionKnowledgeRoot(
  session: SessionIdentity | undefined,
  enabled: boolean,
  onAccepted?: (binding: SessionKnowledgeBinding) => void,
) {
  const key = session ? sessionKey(session) : undefined
  const computerId = session?.computerId
  const sessionId = session?.id
  const activeKey = useRef(key)
  activeKey.current = key
  const [bindings, setBindings] = useState(new Map<string, SessionKnowledgeBinding>())
  const bindingsRef = useRef(bindings)
  const onAcceptedRef = useRef(onAccepted)
  onAcceptedRef.current = onAccepted
  const eventSequence = useRef(new Map<string, number>())
  const generation = useRef(0)
  const lifetime = useRef(0)
  const computerChanges = useRef(new Map<string, number>())
  const sessionLifetimes = useRef(new Map<string, number>())
  const saveSequence = useRef(0)
  const mounted = useRef(true)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [request, setRequest] = useState<{
    key: string
    pending: boolean
    error?: string
  }>()
  const [savingKey, setSavingKey] = useState<string>()

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; generation.current += 1 }
  }, [])

  const accept = useCallback((incoming: SessionKnowledgeBinding) => {
    const incomingKey = bindingKey(incoming)
    const previous = bindingsRef.current.get(incomingKey)
    if (previous && previous.revision > incoming.revision) return
    if (previous && JSON.stringify(previous) === JSON.stringify(incoming)) return
    const next = new Map(bindingsRef.current)
    const accepted = structuredClone(incoming)
    next.set(incomingKey, accepted)
    bindingsRef.current = next
    if (mounted.current) {
      onAcceptedRef.current?.(accepted)
      setBindings(next)
    }
  }, [])

  const applyUpdate = useCallback((incoming: SessionKnowledgeBinding) => {
    const incomingKey = bindingKey(incoming)
    eventSequence.current.set(incomingKey, (eventSequence.current.get(incomingKey) || 0) + 1)
    accept(incoming)
  }, [accept])

  const refresh = useCallback(() => setRefreshVersion((version) => version + 1), [])

  useEffect(() => {
    const token = ++generation.current
    if (!enabled || !key || !computerId || !sessionId) {
      setRequest(undefined)
      return
    }
    const startedAtSequence = eventSequence.current.get(key) || 0
    setRequest({ key, pending: true })
    void getSessionKnowledgeRoot(computerId, sessionId).then((incoming) => {
      if (token !== generation.current) return
      if (bindingKey(incoming) !== key) {
        throw new Error('The Knowledge root response belongs to a different session.')
      }
      const cached = bindingsRef.current.get(key)
      // Availability may change without changing the root's revision. A read
      // started before a newer event cannot undo that event at equal revision.
      if (
        !cached ||
        incoming.revision > cached.revision ||
        startedAtSequence === (eventSequence.current.get(key) || 0)
      ) {
        accept(incoming)
      }
      setRequest({ key, pending: false })
    }).catch((caught: unknown) => {
      if (token === generation.current) {
        setRequest({
          key, pending: false,
          error: caught instanceof Error ? caught.message : String(caught),
        })
      }
    })
    return () => { generation.current += 1 }
  }, [accept, computerId, enabled, key, refreshVersion, sessionId])

  const saveRoot = useCallback(async (rootId: string | null, expectedRevision?: number) => {
    const previous = key ? bindingsRef.current.get(key) : undefined
    if (!key || !computerId || !sessionId || !previous) {
      throw new Error('Wait for this session\'s saved root to load before changing it.')
    }
    const token = ++saveSequence.current
    const ownerLifetime = lifetime.current
    const pairingChanged = (incoming: SessionKnowledgeBinding) =>
      [computerId, incoming.root?.computerId].some((id) =>
        id !== undefined && (computerChanges.current.get(id) || 0) > ownerLifetime)
    const sessionLifetime = sessionLifetimes.current.get(key) || 0
    setSavingKey(key)
    try {
      const incoming = await updateSessionKnowledgeRoot(computerId, sessionId, {
        rootId, expectedRevision: expectedRevision ?? previous.revision,
      })
      if (bindingKey(incoming) !== key) {
        throw new Error('The saved Knowledge root belongs to a different session.')
      }
      if (pairingChanged(incoming)) {
        throw new Error('A computer pairing changed while saving the Knowledge root. Reload before trying again.')
      }
      if (sessionLifetime !== (sessionLifetimes.current.get(key) || 0)) {
        throw new Error('The session changed while saving its Knowledge root. Reopen the chooser before trying again.')
      }
      applyUpdate(incoming)
      return incoming
    } catch (caught) {
      if (
        caught instanceof SessionKnowledgeRequestError &&
        caught.binding &&
        bindingKey(caught.binding) === key &&
        !pairingChanged(caught.binding) &&
        sessionLifetime === (sessionLifetimes.current.get(key) || 0)
      ) {
        applyUpdate(caught.binding)
      }
      if (mounted.current) refresh()
      throw caught
    } finally {
      if (mounted.current && token === saveSequence.current) setSavingKey(undefined)
    }
  }, [applyUpdate, computerId, key, refresh, sessionId])

  const forgetSession = useCallback((computerId: string, sessionId: string) => {
    const removedKey = sessionKey({ computerId, id: sessionId })
    sessionLifetimes.current.set(removedKey, (sessionLifetimes.current.get(removedKey) || 0) + 1)
    const next = new Map(bindingsRef.current)
    next.delete(removedKey)
    eventSequence.current.delete(removedKey)
    bindingsRef.current = next
    setBindings(next)
    if (activeKey.current === removedKey) {
      generation.current += 1
      refresh()
    }
  }, [refresh])

  const forgetComputer = useCallback((removedId: string) => {
    computerChanges.current.set(removedId, ++lifetime.current)
    generation.current += 1
    const next = new Map(bindingsRef.current)
    for (const [savedKey, binding] of next) {
      if (binding.computerId === removedId) {
        next.delete(savedKey)
        eventSequence.current.delete(savedKey)
      } else if (binding.root?.computerId === removedId) {
        next.set(savedKey, { ...binding, available: false })
        eventSequence.current.set(savedKey, (eventSequence.current.get(savedKey) || 0) + 1)
      }
    }
    bindingsRef.current = next
    setBindings(next)
    refresh()
  }, [refresh])

  const binding = key ? bindings.get(key) : undefined
  return {
    binding,
    loading: Boolean(enabled && key && (
      request?.key === key ? request.pending : !binding
    )),
    error: request && request.key === key ? request.error : undefined,
    saving: savingKey === key && Boolean(key),
    refresh,
    saveRoot,
    applyUpdate,
    forgetComputer,
    forgetSession,
  }
}
