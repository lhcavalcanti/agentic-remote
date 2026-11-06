import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { HubEvent, ManagedSession, SessionKnowledgeBinding } from '../shared/contracts.js'
import { normalizeKnowledgeRelativePath } from '../shared/knowledge-path.js'
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
const rootUpdateSchema = z.object({
  rootId: z.string().min(1).max(256).nullable(),
  rootPath: z.string().trim().max(4096).optional(),
  expectedRevision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict()
const pathUpdateSchema = z.object({
  knowledgeBasePath: z.string().trim().min(1).max(4096),
  create: z.boolean().optional().default(false),
  expectedRevision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict()
const updateSchema = z.union([rootUpdateSchema, pathUpdateSchema])

function knowledgeBaseName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).at(-1) || path
}

interface Lineage {
  replacements: Map<string, string>
  predecessors: Map<string, Set<string>>
  reconciled: Map<string, string>
}
interface ReplacementEvidence {
  sessionId: string
  previous: string[]
}
interface RegistrationGeneration {
  isCurrent: () => boolean
  lineage: Lineage
  pending: ReplacementEvidence[]
  removed: Set<string>
  epochs: Map<string, number>
  queue: Promise<void>
}

export interface SessionKnowledgeLifecycle {
  replacementCarrier(computerId: string): (previousSessionId: string, session: ManagedSession) => Promise<void>
  deleteSession(computerId: string, sessionId: string): Promise<void>
  removedComputerCleanup(computerId: string): () => Promise<void>
  rootRemoved(rootId: string): Promise<void>
}

export async function registerSessionKnowledgeRoutes(
  app: FastifyInstance,
  manager: ComputerManager,
  knowledge: KnowledgeStore,
  store: SessionKnowledgeStore,
): Promise<SessionKnowledgeLifecycle> {
  const generations = new Map<string, RegistrationGeneration>()
  const background = new Set<Promise<void>>()
  const computerRemovals = new Map<string, Promise<void>[]>()

  function generationFor(computerId: string): RegistrationGeneration {
    if (!manager.listComputers().some((computer) => computer.id === computerId)) {
      throw new SessionKnowledgeReferenceError('Computer is not registered')
    }
    const previous = generations.get(computerId)
    if (previous?.isCurrent()) return previous
    const generation: RegistrationGeneration = {
      isCurrent: manager.captureComputerRegistration(computerId),
      lineage: { replacements: new Map(), predecessors: new Map(), reconciled: new Map() },
      pending: [], removed: new Set(), epochs: new Map(), queue: Promise.resolve(),
    }
    generations.set(computerId, generation)
    return generation
  }

  function registrationGuard(computerId: string, generation = generationFor(computerId)): () => void {
    return () => {
      if (generations.get(computerId) === generation && generation.isCurrent()) return
      const registered = manager.listComputers().some((computer) => computer.id === computerId)
      throw new SessionKnowledgeReferenceError(
        registered
          ? 'Computer pairing changed. Reload this session before choosing its Knowledge folder.'
          : 'Computer is not registered',
        registered ? 409 : 404,
      )
    }
  }

  function replacementFor(lineage: Lineage, sessionId: string): string {
    const seen = new Set<string>()
    let target = sessionId
    while (lineage.replacements.has(target) && !seen.has(target)) {
      seen.add(target)
      target = lineage.replacements.get(target)!
    }
    return target
  }

  function markRemoved(generation: RegistrationGeneration, sessionId: string): void {
    generation.removed.add(sessionId)
    generation.epochs.set(sessionId, (generation.epochs.get(sessionId) ?? 0) + 1)
  }

  function recordReplacement(lineage: Lineage, evidence: ReplacementEvidence): void {
    const target = replacementFor(lineage, evidence.sessionId)
    for (const id of evidence.previous) {
      if (id === target || lineage.replacements.get(id) === evidence.sessionId) continue
      const oldTarget = lineage.replacements.get(id)
      if (oldTarget) lineage.predecessors.get(oldTarget)?.delete(id)
      lineage.replacements.set(id, evidence.sessionId)
      const sources = lineage.predecessors.get(evidence.sessionId) ?? new Set<string>()
      sources.add(id)
      lineage.predecessors.set(evidence.sessionId, sources)
    }
  }

  function knownPredecessors(lineage: Lineage, sessionId: string): string[] {
    const seen = new Set<string>()
    const ordered: string[] = []
    const pending = [{ id: sessionId, visited: false }]
    while (pending.length > 0) {
      const { id, visited } = pending.pop()!
      if (visited) {
        if (id !== sessionId) ordered.push(id)
      } else if (!seen.has(id)) {
        seen.add(id)
        pending.push({ id, visited: true })
        for (const previous of [...(lineage.predecessors.get(id) ?? [])].reverse()) {
          pending.push({ id: previous, visited: false })
        }
      }
    }
    return ordered
  }

  function reconcileReplacement(
    computerId: string,
    generation: RegistrationGeneration,
    sessionId: string,
    replacedSessionIds: readonly string[],
  ): Promise<void> {
    const validate = registrationGuard(computerId, generation)
    validate()
    if (replacedSessionIds.length === 0 &&
      !generation.lineage.predecessors.has(sessionId) &&
      !generation.lineage.replacements.has(sessionId) &&
      !generation.pending.some((entry) => entry.sessionId === sessionId || entry.previous.includes(sessionId))) {
      return Promise.resolve()
    }
    if (generation.pending.length === 0 &&
      replacedSessionIds.every((id) => generation.lineage.replacements.get(id) === sessionId)) {
      const target = replacementFor(generation.lineage, sessionId)
      const ancestry = target === sessionId ? replacedSessionIds : [...replacedSessionIds, sessionId]
      const supplied = new Set(ancestry)
      const previous = [...knownPredecessors(generation.lineage, target).filter((id) => !supplied.has(id)), ...ancestry]
      if (generation.lineage.reconciled.get(target) === JSON.stringify(previous)) return Promise.resolve()
    }
    if (replacedSessionIds.length > 0) {
      const previous = [...new Set(replacedSessionIds.filter((id) => id !== sessionId))]
      if (!generation.pending.some((entry) =>
        entry.sessionId === sessionId && JSON.stringify(entry.previous) === JSON.stringify(previous))) {
        generation.pending.push({ sessionId, previous })
      }
      // Lifecycle evidence invalidates in-flight requests immediately, but
      // these observations belong only to the captured pairing generation.
      for (const id of previous) {
        if (!generation.removed.has(id)) markRemoved(generation, id)
      }
    }
    const task = generation.queue.then(async () => {
      validate()
      const proposed = structuredClone(generation.lineage)
      for (const evidence of generation.pending) recordReplacement(proposed, evidence)
      const target = replacementFor(proposed, sessionId)
      const staged = generation.pending.filter((entry) => replacementFor(proposed, entry.sessionId) === target)
      const lineage = structuredClone(generation.lineage)
      for (const evidence of staged) recordReplacement(lineage, evidence)
      const ancestry = target === sessionId ? replacedSessionIds : [...replacedSessionIds, sessionId]
      const supplied = new Set(ancestry)
      const previous = [
        ...knownPredecessors(lineage, target).filter((id) => !supplied.has(id)),
        ...ancestry,
      ]
      if (previous.length > 0) {
        const signature = JSON.stringify(previous)
        if (lineage.reconciled.get(target) !== signature) {
          await store.replaceSession(computerId, target, previous, validate)
          lineage.reconciled.set(target, signature)
        }
      }
      // Failed persistence leaves only staged evidence for a same-generation
      // retry. An old continuation never installs maps in a fresh pairing.
      if (generations.get(computerId) === generation && generation.isCurrent()) {
        generation.lineage = lineage
        generation.pending = generation.pending.filter((entry) => !staged.includes(entry))
      }
    })
    generation.queue = task.catch(() => undefined)
    return task
  }

  function reconcileSession(session: ManagedSession, generation: RegistrationGeneration): Promise<void> {
    return reconcileReplacement(session.computerId, generation, session.id, session.replacedSessionIds ?? [])
  }

  function observe(task: Promise<void>, computerId: string, sessionId?: string): void {
    const tracked = task.catch((error: unknown) => {
      app.log.error(error)
      manager.emit('event', {
        type: 'error', computerId, sessionId,
        message: 'Could not update this session’s Knowledge folder metadata. Reload to retry.',
      })
    }).finally(() => background.delete(tracked))
    background.add(tracked)
  }

  const onEvent = (event: HubEvent): void => {
    if (event.type === 'computer.removed') {
      generations.delete(event.computerId)
      const cleanup = store.removeComputer(event.computerId)
      const queued = computerRemovals.get(event.computerId) ?? []
      queued.push(cleanup)
      computerRemovals.set(event.computerId, queued)
      observe(cleanup, event.computerId)
      return
    }
    try {
      if (event.type === 'computer.updated') {
        // Online/offline changes retain the same captured client. Re-registering
        // the same ID replaces it and retires all transient lineage/epochs.
        generationFor(event.computer.id)
      } else if (event.type === 'session.upserted') {
        observe(reconcileSession(event.session, generationFor(event.session.computerId)),
          event.session.computerId, event.session.id)
      } else if (event.type === 'session.removed') {
        const generation = generationFor(event.computerId)
        markRemoved(generation, event.sessionId)
        // Plain removals are ambiguous (old clear implementations and resync).
        // Only replacement evidence or an explicit DELETE cleans the link.
        if (event.replacedBy) {
          observe(reconcileReplacement(event.computerId, generation, event.replacedBy, [event.sessionId]),
            event.computerId, event.replacedBy)
        }
      }
    } catch (error) {
      app.log.error(error)
    }
  }

  const publish = (binding: SessionKnowledgeBinding): void => {
    manager.emit('event', {
      type: 'session.knowledge.updated', computerId: binding.computerId,
      sessionId: binding.sessionId, binding,
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

  async function knownSessionGuard(
    computerId: string,
    sessionId: string,
  ): Promise<{ validate: () => void; cwd?: string }> {
    const generation = generationFor(computerId)
    const registered = registrationGuard(computerId, generation)
    const epoch = generation.epochs.get(sessionId) ?? 0
    const current = () => {
      registered()
      if (replacementFor(generation.lineage, sessionId) !== sessionId) {
        throw new SessionKnowledgeReferenceError('Session was replaced. Reload sessions to use its replacement.')
      }
      if ((generation.epochs.get(sessionId) ?? 0) !== epoch) {
        throw new SessionKnowledgeReferenceError('Session changed while loading its Knowledge folder. Reload and try again.', 409)
      }
    }
    current()
    const lookup = await manager.lookupSessionMetadata(computerId, sessionId)
    current()
    await Promise.all(lookup.relatedSessions.map((session) => reconcileSession(session, generation)))
    current()
    if (!lookup.session) {
      const absent = lookup.activeAuthoritative && lookup.historyAuthoritative
      const knownOffline = !lookup.activeAuthoritative && !lookup.historyAuthoritative &&
        store.get(computerId, sessionId).revision > 0 && !generation.removed.has(sessionId)
      if (!knownOffline) {
        throw new SessionKnowledgeReferenceError(
          absent ? 'Session not found' : 'The owning computer could not verify this session. Reconnect it and try again.',
          absent ? 404 : 503,
        )
      }
    }
    return { validate: current, cwd: lookup.session?.cwd }
  }

  app.get<{ Params: { computerId: string; sessionId: string } }>(
    '/api/computers/:computerId/sessions/:sessionId/knowledge-root',
    async (request, reply) => {
      const { computerId, sessionId } = sessionParams.parse(request.params)
      await store.recover()
      const known = await knownSessionGuard(computerId, sessionId)
      known.validate()
      reply.header('cache-control', 'no-store')
      return { binding: store.get(computerId, sessionId) }
    },
  )
  app.put<{ Params: { computerId: string; sessionId: string } }>(
    '/api/computers/:computerId/sessions/:sessionId/knowledge-root',
    async (request, reply) => {
      const { computerId, sessionId } = sessionParams.parse(request.params)
      const input = updateSchema.parse(request.body)
      if ('knowledgeBasePath' in input) {
        const known = await knownSessionGuard(computerId, sessionId)
        const sessionIsCurrent = known.validate
        if (!known.cwd) {
          throw new SessionKnowledgeReferenceError(
            'The owning computer could not provide this session working directory. Reconnect it and try again.',
            503,
          )
        }
        const location = await manager.ensureSessionKnowledgeBase(
          computerId,
          sessionId,
          input.knowledgeBasePath,
          input.create,
        )
        sessionIsCurrent()
        const computer = manager.listComputers().find(
          (entry) => entry.id === computerId,
        )
        if (!computer) {
          throw new SessionKnowledgeReferenceError('Computer is not registered')
        }
        const reservation = await knowledge.reserveRoot({
          computerId,
          computerName: computer.name,
          path: location.path,
          name: knowledgeBaseName(location.path),
        }, {
          confinementPath: location.confinementPath,
          binding: {
            computerId,
            sessionId,
            expectedRevision: input.expectedRevision,
          },
        })
        const validate = () => {
          sessionIsCurrent()
          if (!knowledge.getRoot(reservation.root.id)) {
            throw new SessionKnowledgeReferenceError(
              'Knowledge root not found. Choose a saved folder again.',
            )
          }
        }
        let binding: SessionKnowledgeBinding
        try {
          binding = await store.update(
            computerId,
            sessionId,
            {
              rootId: reservation.root.id,
              rootPath: '.',
              expectedRevision: input.expectedRevision,
            },
            validate,
            { force: reservation.requiresBindingCommit },
          )
        } catch (error) {
          await reservation.rollback()
          if (error instanceof SessionKnowledgeConflictError) {
            return reply.code(409).send({
              error: error.message,
              binding: error.binding,
            })
          }
          throw error
        }
        try {
          await reservation.finalize()
        } catch (error) {
          request.log.error(
            {
              err: error,
              computerId,
              sessionId,
              rootId: binding.rootId,
            },
            'Session Knowledge catalog finalization failed after binding commit',
          )
          reply.header('cache-control', 'no-store')
          return reply.code(503).send({
            error:
              'The Knowledge binding was saved, but catalog cleanup could not finish. Use the returned binding and retry later.',
            binding,
          })
        }
        reply.header('cache-control', 'no-store')
        return { binding }
      }
      const root = input.rootId === null ? undefined : knowledge.getRoot(input.rootId)
      if (input.rootId !== null && !root) {
        throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
      }
      const rootIsCurrent = root ? registrationGuard(root.computerId) : undefined
      let rootPath: string
      try {
        rootPath = normalizeKnowledgeRelativePath(input.rootPath)
      } catch {
        throw new SessionKnowledgeReferenceError(
          'Knowledge root path must stay inside the saved folder.',
          400,
        )
      }
      if (root) {
        const confinementPath = knowledge.getRootConfinement(root.id)
        const canonicalPath = await manager.validateKnowledgeRoot(
          root.computerId,
          root.path,
          confinementPath,
        )
        await manager.listKnowledge(
          root.computerId,
          canonicalPath,
          rootPath,
          confinementPath,
        )
        rootIsCurrent?.()
        root.path = canonicalPath
      }
      const sessionIsCurrent = (
        await knownSessionGuard(computerId, sessionId)
      ).validate
      const validate = () => {
        sessionIsCurrent()
        rootIsCurrent?.()
        if (input.rootId !== null && !knowledge.getRoot(input.rootId)) {
          throw new SessionKnowledgeReferenceError('Knowledge root not found. Choose a saved folder again.')
        }
      }
      try {
        const binding = await store.update(
          computerId,
          sessionId,
          { ...input, rootPath },
          validate,
          { root },
        )
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
    replacementCarrier(computerId) {
      const generation = generationFor(computerId)
      return (previousSessionId, session) => reconcileReplacement(computerId, generation, session.id,
        [...new Set([...(session.replacedSessionIds ?? []), previousSessionId])])
    },
    async deleteSession(computerId, sessionId) {
      const generation = generationFor(computerId)
      const validate = registrationGuard(computerId, generation)
      const epoch = generation.epochs.get(sessionId) ?? 0
      const lookup = await manager.lookupSessionMetadata(computerId, sessionId)
      validate()
      if ((generation.epochs.get(sessionId) ?? 0) !== epoch) {
        throw new SessionKnowledgeReferenceError('Session changed while checking deletion. Reload and retry.', 409)
      }
      if (lookup.session) {
        // Do not swallow provider/transport/deletion failures. A retry can skip
        // DELETE only when both passive inventories positively prove absence.
        await manager.deleteSession(computerId, sessionId)
      } else if (!lookup.activeAuthoritative || !lookup.historyAuthoritative) {
        throw new SessionKnowledgeReferenceError('Session absence could not be verified. Reconnect the owning computer and retry deletion.', 503)
      }
      validate()
      markRemoved(generation, sessionId)
      await store.removeSession(computerId, sessionId, validate)
    },
    removedComputerCleanup(computerId) {
      const queued = computerRemovals.get(computerId)
      if (!queued?.length) throw new Error('Computer removal did not queue Knowledge cleanup')
      const cleanup = queued.shift()!
      if (queued.length === 0) computerRemovals.delete(computerId)
      // Capture the event's queued cleanup before the route awaits catalog
      // persistence. A later unscoped removal could erase a re-paired owner.
      return async () => {
        await cleanup
        const roots = store.listBindings()
          .filter((binding) => binding.root?.computerId === computerId && binding.rootId !== null)
          .map((binding) => binding.rootId!)
        await store.refreshAvailability(roots)
      }
    },
    rootRemoved(rootId) {
      return store.refreshAvailability([rootId])
    },
  }
}
