import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { HubEvent } from '../shared/contracts.js'
import {
  SESSION_CATEGORY_NAME_MAX_LENGTH,
  type SessionCategoriesSnapshot,
  type SessionCategoryChange,
} from '../shared/session-categories.js'
import type { SessionCategoryStore } from './session-category-store.js'

const revision = z.number().int().min(0)
const sessionRefs = z.array(z.object({
  computerId: z.string().min(1).max(200),
  sessionId: z.string().min(1).max(200),
}).strict()).max(2000)
// Generous: names are trimmed and checked against the real limit when applied.
const name = z.string().max(SESSION_CATEGORY_NAME_MAX_LENGTH * 4)

const createSchema = z.object({
  revision,
  id: z.string().max(64).optional(),
  name,
  sessions: sessionRefs.optional(),
}).strict()

const updateSchema = z.object({
  revision,
  name: name.optional(),
  collapsed: z.boolean().optional(),
  index: z.number().int().min(0).max(1000).optional(),
}).strict().refine(
  (input) => input.name !== undefined || input.collapsed !== undefined || input.index !== undefined,
  'Choose what to change about the category',
)

const deleteSchema = z.object({ revision: z.coerce.number().int().min(0) })

const moveSchema = z.object({
  revision,
  categoryId: z.string().min(1).max(64).nullable(),
  index: z.number().int().min(0).max(10_000).optional(),
  sessions: sessionRefs.min(1),
}).strict()

const paramsSchema = z.object({ categoryId: z.string().min(1).max(64) })

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw Object.assign(
      new Error(result.error.issues[0]?.message || 'Invalid category request'),
      { statusCode: 400 },
    )
  }
  return result.data
}

const keys = (sessions: readonly { computerId: string; sessionId: string }[]) =>
  sessions.map(({ computerId, sessionId }) => `${computerId}:${sessionId}`)

export interface SessionCategoryRouteOptions {
  store?: SessionCategoryStore
  /** Whether the session list holds `computerId:sessionId`; only such a session may be placed. */
  listed: (sessionKey: string) => boolean
  publish: (snapshot: SessionCategoriesSnapshot) => void
  log: (error: unknown, message: string) => void
}

export interface SessionCategoryLifecycle {
  /** Follows hub session events: replacements, closes, reopens, deletes and unpairing. */
  observe(event: HubEvent): void
  /** A session the hub lists at startup, seated by lineage. */
  listed(computerId: string, sessionId: string, replacedSessionIds?: readonly string[]): Promise<void>
  /** A clear or recovery's successor, named only in its response by an older node. */
  replace(computerId: string, previousSessionId: string, nextSessionId: string): Promise<void>
  /** Waits for every lifecycle change queued so far. */
  drain(): Promise<void>
}

/**
 * The hub's session categories. Registered from the hub routes so the Host
 * and Origin policy guards them like every other `/api/` route. Each change
 * names the revision it was made against, and a committed change is told to
 * every browser as `session.categories.updated`.
 */
export function registerSessionCategoryRoutes(
  app: FastifyInstance,
  options: SessionCategoryRouteOptions,
): SessionCategoryLifecycle | undefined {
  const { store, listed, publish, log } = options
  const requireStore = (): SessionCategoryStore => {
    if (!store) {
      throw Object.assign(new Error('Categories are not available on this hub'), { statusCode: 503 })
    }
    const reason = store.unavailableReason()
    if (reason) throw Object.assign(new Error(reason), { statusCode: 503 })
    return store
  }
  /** A change that moved nothing keeps its revision, so it is not news to anyone. */
  const commit = async (
    apply: (categories: SessionCategoryStore) => Promise<SessionCategoriesSnapshot>,
  ): Promise<SessionCategoriesSnapshot> => {
    const categories = requireStore()
    const before = categories.snapshot().revision
    const snapshot = await apply(categories)
    if (snapshot.revision !== before) publish(snapshot)
    return snapshot
  }
  const change = async (at: number, update: SessionCategoryChange) => ({
    sessionCategories: await commit((categories) => categories.change(at, update, listed)),
  })

  app.get('/api/session-categories', async () => ({ sessionCategories: requireStore().snapshot() }))

  app.post('/api/session-categories', async (request) => {
    const input = parse(createSchema, request.body)
    return change(input.revision, {
      type: 'create',
      id: input.id ?? randomUUID(),
      name: input.name,
      sessions: keys(input.sessions ?? []),
    })
  })

  // Placed before the category routes it would otherwise be read as.
  app.post('/api/session-categories/move', async (request) => {
    const input = parse(moveSchema, request.body)
    return change(input.revision, {
      type: 'move',
      sessions: keys(input.sessions),
      categoryId: input.categoryId,
      ...(input.index === undefined ? {} : { index: input.index }),
    })
  })

  app.patch('/api/session-categories/:categoryId', async (request) => {
    const { categoryId } = parse(paramsSchema, request.params)
    const { revision: at, ...fields } = parse(updateSchema, request.body)
    return change(at, { type: 'update', categoryId, ...fields })
  })

  // Its sessions stay listed, in no category.
  app.delete('/api/session-categories/:categoryId', async (request) => {
    const { categoryId } = parse(paramsSchema, request.params)
    const { revision: at } = parse(deleteSchema, request.query)
    return change(at, { type: 'delete', categoryId })
  })

  if (!store) return undefined
  // Lifecycle changes are queued so two events cannot interleave, and a
  // failure is logged rather than taking the event stream down with it.
  let work: Promise<unknown> = Promise.resolve()
  const queue = (apply: (categories: SessionCategoryStore) => Promise<SessionCategoriesSnapshot>) => {
    const queued = work.then(() => commit(apply))
    work = queued.catch(() => undefined)
    return queued.then(() => undefined)
  }
  const quietly = (apply: (categories: SessionCategoryStore) => Promise<SessionCategoriesSnapshot>) => {
    void queue(apply).catch((error: unknown) => log(error, 'Could not update session categories'))
  }
  return {
    observe(event) {
      if (store.unavailableReason()) return
      if (event.type === 'session.upserted') {
        const { computerId, id, replacedSessionIds, isOpen, closedAt } = event.session
        // A closed or archived record arriving is not a reopen.
        if (isOpen === false || closedAt) return
        quietly((categories) => categories.sessionListed(computerId, id, replacedSessionIds))
      } else if (event.type === 'session.removed') {
        const { computerId, sessionId, replacedBy, closed } = event
        quietly((categories) => replacedBy
          ? categories.replaceSession(computerId, sessionId, replacedBy)
          : closed
            ? categories.sessionClosed(computerId, sessionId)
            : categories.removeSession(computerId, sessionId))
      } else if (event.type === 'computer.removed') {
        const { computerId } = event
        quietly((categories) => categories.removeComputer(computerId))
      }
    },
    listed: (computerId, sessionId, replacedSessionIds) => store.unavailableReason()
      ? Promise.resolve()
      : queue((categories) => categories.sessionListed(computerId, sessionId, replacedSessionIds)),
    replace: (computerId, previousSessionId, nextSessionId) => store.unavailableReason()
      ? Promise.resolve()
      : queue((categories) => categories.replaceSession(computerId, previousSessionId, nextSessionId)),
    drain: async () => {
      await work
    },
  }
}
