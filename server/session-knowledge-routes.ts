import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { HubEvent, ManagedSession, SessionKnowledgeBinding } from '../shared/contracts.js'
import type { ComputerManager } from './computer-manager.js'
import type { KnowledgeStore } from './knowledge-store.js'
import {
  SessionKnowledgeConflictError,
  SessionKnowledgeReferenceError,
  type SessionKnowledgeStore,
} from './session-knowledge-store.js'

const sessionParams = z.object({
  computerId: z.string().min(1).max(256),
  sessionId: z.string().min(1).max(256),
})

const updateSchema = z.object({
  rootId: z.string().min(1).max(256).nullable(),
  expectedRevision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict()

function key(computerId: string, sessionId: string): string {
  return JSON.stringify([computerId, sessionId])
}

export interface SessionKnowledgeLifecycle {
  replaceSession(
    computerId: string,
    previousSessionId: string,
    session: ManagedSession,
  ): Promise<void>
  removeSession(computerId: string, sessionId: string): Promise<void>
  removeComputer(computerId: string): Promise<void>
  rootRemoved(rootId: string): Promise<void>
}

export async function registerSessionKnowledgeRoutes(
  app: FastifyInstance,
  manager: ComputerManager,
  knowledge: KnowledgeStore,
  store: SessionKnowledgeStore,
): Promise<SessionKnowledgeLifecycle> {
  const replacements = new Map<string, Map<string, string>>()
  const predecessors = new Map<string, Map<string, Set<string>>>()
  const removals = new Map<string, Set<string>>()
  const sessionEpochs = new Map<string, number>()
  const reconciled = new Map<string, Map<string, string>>()
  const background = new Set<Promise<void>>()

  function registrationGuard(computerId: string): () => void {
    if (!manager.listComputers().some((computer) => computer.id === computerId)) {
      throw new SessionKnowledgeReferenceError('Computer is not registered')
    }
    const isCurrent = manager.captureComputerRegistration(computerId)
    return () => {
      if (isCurrent()) return
      const registered = manager.listComputers().some((computer) => computer.id === computerId)
      throw new SessionKnowledgeReferenceError(
        registered
          ? 'Computer pairing changed. Reload this session before choosing its Knowledge folder.'
          : 'Computer is not registered',
        registered ? 409 : 404,
      )
    }
  }

  function replacementFor(computerId: string, sessionId: string): string {
    const mapping = replacements.get(computerId)
    const seen = new Set<string>()
    let target = sessionId
    while (mapping?.has(target) && !seen.has(target)) {
      seen.add(target)
      target = mapping.get(target)!
    }
    return target
  }

  function markRemoved(computerId: string, sessionId: string): void {
    const removed = removals.get(computerId) ?? new Set<string>()
    removed.add(sessionId)
    removals.set(computerId, removed)
    const identity = key(computerId, sessionId)
    sessionEpochs.set(identity, (sessionEpochs.get(identity) ?? 0) + 1)
  }

  function recordReplacement(
    computerId: string,
    sessionId: string,
    previous: readonly string[],
  ): string {
    const target = replacementFor(computerId, sessionId)
    const mapping = replacements.get(computerId) ?? new Map<string, string>()
    const reverse = predecessors.get(computerId) ?? new Map<string, Set<string>>()
    for (const id of previous) {
      if (id !== target && mapping.get(id) !== sessionId) {
        const oldTarget = mapping.get(id)
        if (oldTarget) reverse.get(oldTarget)?.delete(id)
        mapping.set(id, sessionId)
        const sources = reverse.get(sessionId) ?? new Set<string>()
        sources.add(id)
        reverse.set(sessionId, sources)
        markRemoved(computerId, id)
      }
    }
    replacements.set(computerId, mapping)
    predecessors.set(computerId, reverse)
    return target
  }

  function knownPredecessors(computerId: string, sessionId: string): string[] {
    const reverse = predecessors.get(computerId)
    const seen = new Set<string>()
    const ordered: string[] = []
    const pending = [{ id: sessionId, visited: false }]
    while (pending.length > 0) {
      const { id, visited } = pending.pop()!
      if (visited) {
        if (id !== sessionId) ordered.push(id)
        continue
      }
      if (seen.has(id)) continue
      seen.add(id)
      pending.push({ id, visited: true })
      for (const previous of [...(reverse?.get(id) ?? [])].reverse()) {
        pending.push({ id: previous, visited: false })
      }
    }
    return ordered
  }

  async function reconcileReplacement(
    computerId: string,
    sessionId: string,
    replacedSessionIds: readonly string[],
  ): Promise<void> {
    const target = recordReplacement(computerId, sessionId, replacedSessionIds)
    const ancestry = target === sessionId ? replacedSessionIds : [...replacedSessionIds, sessionId]
    const supplied = new Set(ancestry)
    const known = knownPredecessors(computerId, target)
    const previous = [...known.filter((previous) => !supplied.has(previous)), ...ancestry]
    if (previous.length === 0) return
    const signature = JSON.stringify(previous)
    const completed = reconciled.get(computerId) ?? new Map<string, string>()
    if (completed.get(target) === signature) return
    const validate = registrationGuard(computerId)
    await store.replaceSession(computerId, target, previous, validate)
    validate()
    completed.set(target, signature)
    reconciled.set(computerId, completed)
  }

  async function reconcileSession(session: ManagedSession): Promise<void> {
    const { computerId, id, replacedSessionIds = [] } = session
    if (replacementFor(computerId, id) === id) removals.get(computerId)?.delete(id)
    await reconcileReplacement(computerId, id, replacedSessionIds)
  }

  function observe(task: Promise<void>, computerId: string, sessionId?: string): void {
    const tracked = task.catch((error: unknown) => {
      app.log.error(error)
      manager.emit('event', {
        type: 'error',
        computerId,
        sessionId,
        message: 'Could not update this session’s Knowledge folder metadata. Reload to retry.',
      })
    }).finally(() => background.delete(tracked))
    background.add(tracked)
  }

  const onEvent = (event: HubEvent): void => {
    if (event.type === 'session.upserted') {
      observe(reconcileSession(event.session), event.session.computerId, event.session.id)
    } else if (event.type === 'session.removed') {
      markRemoved(event.computerId, event.sessionId)
      // A plain removal is also emitted by older clear implementations and
      // reconnect snapshots. Keep the link until positive replacement evidence
      // or the explicit hub DELETE route settles what happened to the session.
      if (event.replacedBy) {
        observe(
          reconcileReplacement(event.computerId, event.replacedBy, [event.sessionId]),
          event.computerId,
          event.replacedBy,
        )
      }
    } else if (event.type === 'computer.removed') {
      replacements.delete(event.computerId)
      predecessors.delete(event.computerId)
      reconciled.delete(event.computerId)
      removals.delete(event.computerId)
      observe(store.removeComputer(event.computerId), event.computerId)
    }
  }

  const publish = (binding: SessionKnowledgeBinding): void => {
    manager.emit('event', {
      type: 'session.knowledge.updated',
      computerId: binding.computerId,
      sessionId: binding.sessionId,
      binding,
    })
  }
  store.on('updated', publish)
  manager.on('event', onEvent)
  app.addHook('onClose', async () => {
    manager.off('event', onEvent)
    await Promise.allSettled([...background])
    await store.flush()
    store.off('updated', publish)
  })

  async function knownSessionGuard(computerId: string, sessionId: string): Promise<() => void> {
    const registered = registrationGuard(computerId)
    const identity = key(computerId, sessionId)
    const epoch = sessionEpochs.get(identity) ?? 0
    const current = () => {
      registered()
      if (replacementFor(computerId, sessionId) !== sessionId) {
        throw new SessionKnowledgeReferenceError('Session was replaced. Reload sessions to use its replacement.')
      }
      if ((sessionEpochs.get(identity) ?? 0) !== epoch) {
        throw new SessionKnowledgeReferenceError('Session changed while loading its Knowledge folder. Reload and try again.', 409)
      }
    }
    current()
    const listing = await manager.listSessionsWithAuthority()
    current()
    const sessions = listing.sessions.filter((session) => session.computerId === computerId)
    await Promise.all(sessions.map(reconcileSession))
    current()
    let found = sessions.some((session) => session.id === sessionId)
    if (!found) {
      const history = await manager.listHistory()
      current()
      const ownedHistory = history.filter((session) => session.computerId === computerId)
      await Promise.all(ownedHistory.map(reconcileSession))
      current()
      found = ownedHistory.some((session) => session.id === sessionId)
    }
    if (!found) {
      // A saved binding is positive evidence of a previously verified identity;
      // an offline node's missing cache is not evidence that it was deleted.
      const knownOffline = !listing.answeredComputerIds.includes(computerId) &&
        store.get(computerId, sessionId).revision > 0 &&
        !removals.get(computerId)?.has(sessionId)
      if (!knownOffline) {
        throw new SessionKnowledgeReferenceError(
          listing.answeredComputerIds.includes(computerId)
            ? 'Session not found'
            : 'The owning computer could not verify this session. Reconnect it and try again.',
          listing.answeredComputerIds.includes(computerId) ? 404 : 503,
        )
      }
    }
    return current
  }

  app.get<{ Params: { computerId: string; sessionId: string } }>(
    '/api/computers/:computerId/sessions/:sessionId/knowledge-root',
    async (request, reply) => {
      const { computerId, sessionId } = sessionParams.parse(request.params)
      const validate = await knownSessionGuard(computerId, sessionId)
      validate()
      reply.header('cache-control', 'no-store')
      return { binding: store.get(computerId, sessionId) }
    },
  )

  app.put<{ Params: { computerId: string; sessionId: string } }>(
    '/api/computers/:computerId/sessions/:sessionId/knowledge-root',
    async (request, reply) => {
      const { computerId, sessionId } = sessionParams.parse(request.params)
      const input = updateSchema.parse(request.body)
      const root = input.rootId === null ? undefined : knowledge.getRoot(input.rootId)
      if (input.rootId !== null && !root) {
        throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
      }
      const rootIsCurrent = root ? registrationGuard(root.computerId) : undefined
      const sessionIsCurrent = await knownSessionGuard(computerId, sessionId)
      const validate = () => {
        sessionIsCurrent()
        rootIsCurrent?.()
      }
      try {
        const binding = await store.update(computerId, sessionId, input, validate)
        validate()
        reply.header('cache-control', 'no-store')
        return { binding }
      } catch (error) {
        if (error instanceof SessionKnowledgeConflictError) {
          return reply.code(409).send({ error: error.message, binding: error.binding })
        }
        throw error
      }
    },
  )

  return {
    async replaceSession(computerId, previousSessionId, session) {
      const previous = [...new Set([...(session.replacedSessionIds ?? []), previousSessionId])]
      await reconcileReplacement(computerId, session.id, previous)
    },
    async removeSession(computerId, sessionId) {
      markRemoved(computerId, sessionId)
      await store.removeSession(computerId, sessionId)
    },
    async removeComputer(computerId) {
      await store.removeComputer(computerId)
      const roots = store.listBindings()
        .filter((binding) => binding.root?.computerId === computerId && binding.rootId !== null)
        .map((binding) => binding.rootId!)
      await store.refreshAvailability(roots)
    },
    rootRemoved(rootId) {
      return store.refreshAvailability([rootId])
    },
  }
}
