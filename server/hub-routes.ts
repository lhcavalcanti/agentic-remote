import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { launchIdentitySchema, cancellationAckSchema } from '../shared/launch-identity.js'
import {
  SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH,
  SIDE_QUESTION_EARLIER_LIMIT,
  SIDE_QUESTION_MAX_LENGTH,
} from './side-question.js'
import type {
  HubEvent,
  HubResyncRequest,
  SessionOrderSnapshot,
  WorkspaceFile,
  WorkspaceListing,
} from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import type { SettingsProfileSnapshot } from '../shared/settings-profile.js'
import {
  joinKnowledgeRelativePath,
  normalizeKnowledgeRelativePath,
  rebaseKnowledgeRelativePath,
} from '../shared/knowledge-path.js'
import { ComputerManager } from './computer-manager.js'
import { KnowledgeStore } from './knowledge-store.js'
import { noteRefusalReason } from './refusal-metrics.js'
import { registerSessionKnowledgeRoutes } from './session-knowledge-routes.js'
import type { SessionKnowledgeStore } from './session-knowledge-store.js'
import type { SessionOrderStore } from './session-order-store.js'
import { registerSettingsProfileRoutes } from './settings-profile-routes.js'
import type { SettingsProfileStore } from './settings-profile-store.js'
import type { ClientPresence } from './client-presence.js'
import type { NotificationCenterService } from './notification-center-service.js'
import type { SchedulerStore } from './scheduler-store.js'
import { isSessionResourceRoute, resourceRequestHandler } from './session-resources.js'
import { type PatchSocket, SessionPublications } from './session-patches.js'
import { sessionRetentionPatchSchema } from './session-retention.js'
import {
  registerOracleVoiceRoutes,
  type OracleVoiceRouteOptions,
} from './oracle-voice-routes.js'

/** The manager agent's events, carried on the same socket as session events. */
export interface ManagerEventSource {
  on(event: 'event', listener: (event: ManagerEvent) => void): unknown
  off(event: 'event', listener: (event: ManagerEvent) => void): unknown
}

const sessionOrderKeys = z.array(z.string().trim().min(1).max(300)).max(2000)

const sessionOrderLaneSchema = z.object({ order: sessionOrderKeys })

const sessionOrderPreferencesSchema = z
  .object({
    showSuspended: z.boolean().optional(),
    showHidden: z.boolean().optional(),
  })
  .refine(
    (input) => input.showSuspended !== undefined || input.showHidden !== undefined,
    'Choose suspended or hidden session visibility',
  )

const sessionOrderEntryParamsSchema = z.object({
  computerId: z.string().min(1).max(200),
  sessionId: z.string().min(1).max(200),
})

const sessionOrderEntrySchema = z.object({ hidden: z.boolean() })

const sessionOrderBootstrapSchema = z.object({
  order: z.record(z.string().trim().min(1).max(200), sessionOrderKeys),
})

const addComputerSchema = z.object({
  baseUrl: z.string().trim().url().max(2048),
  token: z.string().trim().min(1).max(500),
  name: z.string().trim().min(1).max(100).optional(),
})

const sideQuestionSchema = z.object({
  question: z.string().trim().min(1).max(SIDE_QUESTION_MAX_LENGTH),
  earlier: z.array(z.object({
    question: z.string().trim().min(1).max(SIDE_QUESTION_MAX_LENGTH),
    answer: z.string().trim().min(1).max(SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH),
  })).max(SIDE_QUESTION_EARLIER_LIMIT).optional(),
})

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
  launchId: launchIdentitySchema.optional(),
  provider: z.enum(['copilot', 'claude']).default('copilot'),
  terminalBacked: z.boolean().default(true),
  allowAllPermissions: z.boolean().default(true),
  model: z.string().trim().min(1).max(200).optional(),
  reasoningEffort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  contextTier: z.enum(['default', 'long_context']).optional(),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
})

const renameSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine(
      (title) =>
        [...title].every((character) => {
          const code = character.charCodeAt(0)
          return code >= 32 && code !== 127 && character !== '"'
        }),
      'Session names cannot contain control characters or double quotes',
    ),
})

const sendMessageSchema = z.object({
  deliveryId: launchIdentitySchema.optional(),
  acknowledgesFailure: z.string().max(64).optional(),
  content: z
    .string()
    .max(200_000)
    .refine((content) => content.trim().length > 0, 'Message cannot be blank'),
  enqueue: z.boolean().optional(),
  replaceTerminalDraft: z.boolean().optional(),
})

const permissionReplySchema = z.object({
  optionId: z.string().trim().min(1).max(500),
})

const userInputValueSchema = z.union([
  z.string().max(20_000),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().max(20_000)).max(32),
])

const userInputReplySchema = z.object({
  answer: z.string().trim().max(20_000).default(''),
  wasFreeform: z.boolean().default(false),
  answers: z.array(z.string().trim().min(1).max(20_000)).min(1).max(32).optional(),
  values: z.record(z.string(), userInputValueSchema).optional(),
  action: z.enum(['accept', 'decline', 'cancel']).optional(),
})

const updateQueuedPromptSchema = z.object({
  // The same shape a message has to take. Without it a whitespace-only edit
  // became a generic server error, and an edit could hold more than any
  // message was ever allowed to.
  content: z.string().max(200_000)
    .refine((content) => content.trim().length > 0, 'Message cannot be blank'),
})

const discardQueuedDispatchSchema = z.object({
  acknowledgesDispatch: z.string().uuid().optional(),
})

const reorderQueueSchema = z.object({
  order: z.array(z.string().min(1)),
})

const executeCommandSchema = z.object({
  acknowledgesFailure: z.string().max(64).optional(),
  command: z.string().trim().startsWith('/').max(10_000),
  enqueue: z.boolean().optional(),
  replaceTerminalDraft: z.boolean().optional(),
})

const configureRuntimeSchema = z.object({
  model: z.string().trim().min(1).max(200),
  reasoningEffort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  contextTier: z.enum(['default', 'long_context']),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
})

const recoverConversationSchema = z.object({
  reason: z.enum(['provider-error', 'stale-sdk-interaction', 'manual']),
})

const directoryQuerySchema = z.object({
  scope: z.enum(['home', 'all']).optional(),
  path: z.string().trim().max(4096).optional(),
})
const directoryValidationSchema = z.object({
  path: z.string().trim().min(1).max(4096),
})
const knowledgeRootSchema = z.object({
  computerId: z.string().min(1).max(256),
  path: z.string().trim().min(1).max(4096),
  name: z.string().trim().max(200).optional(),
})

const knowledgeRelativePathSchema = z.string().trim().max(4096).optional()
  .transform((value, context) => {
    try {
      return normalizeKnowledgeRelativePath(value)
    } catch {
      context.addIssue({
        code: 'custom',
        message: 'Knowledge paths must stay inside the selected root',
      })
      return z.NEVER
    }
  })
const knowledgePathSchema = z.object({
  path: knowledgeRelativePathSchema,
  basePath: knowledgeRelativePathSchema,
})

const knowledgeFileSchema = z.object({
  path: z.string().trim().min(1).max(4096).transform((value, context) => {
    try {
      return normalizeKnowledgeRelativePath(value)
    } catch {
      context.addIssue({
        code: 'custom',
        message: 'Knowledge paths must stay inside the selected root',
      })
      return z.NEVER
    }
  }),
  basePath: knowledgeRelativePathSchema,
})

function scopedKnowledgePath(basePath: string, path: string): string {
  return joinKnowledgeRelativePath(basePath, path)
}

function requireScopedKnowledgePath(
  basePath: string,
  path: string,
): string {
  const rebased = rebaseKnowledgeRelativePath(basePath, path)
  if (rebased === undefined) {
    throw Object.assign(
      new Error('Knowledge browsing is restricted to the selected session root'),
      { statusCode: 403 },
    )
  }
  return rebased
}

function scopeKnowledgeListing(
  listing: WorkspaceListing,
  basePath: string,
): WorkspaceListing {
  if (basePath === '.') {
    return listing
  }
  const parent = listing.parent
    ? rebaseKnowledgeRelativePath(basePath, listing.parent)
    : undefined
  return {
    ...listing,
    path: requireScopedKnowledgePath(basePath, listing.path),
    ...(parent === undefined ? { parent: undefined } : { parent }),
    entries: listing.entries.flatMap((entry) => {
      const path = rebaseKnowledgeRelativePath(basePath, entry.path)
      return path === undefined ? [] : [{ ...entry, path }]
    }),
  }
}

function scopeKnowledgeFile(
  file: WorkspaceFile,
  basePath: string,
): WorkspaceFile {
  return basePath === '.'
    ? file
    : {
        ...file,
        path: requireScopedKnowledgePath(basePath, file.path),
      }
}

const workspaceFileQuerySchema = z.object({
  path: z.string().trim().min(1).max(4096),
})
const workspaceSearchQuerySchema = z.object({
  query: z.string().trim().min(2).max(200),
  path: z.string().trim().max(4096).optional(),
})
interface SessionParams {
  computerId: string
  sessionId: string
}

type OriginPolicy = {
  origins: Set<string>
  /**
   * Loopback names cannot be pointed at the hub by an attacker-controlled DNS
   * record, so they stay allowed on any port while the policy is derived. An
   * explicit allowlist is honoured verbatim instead.
   */
  allowLoopback: boolean
}

const wildcardHosts = new Set(['0.0.0.0', '::', '*'])
const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

function isLoopbackHost(host: string): boolean {
  const withoutPort = host.startsWith('[')
    ? host.slice(0, host.indexOf(']') + 1)
    : host.split(':')[0]
  return loopbackHosts.has(withoutPort.toLowerCase())
}

function originPolicy(): OriginPolicy {
  const configured = (process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  if (configured.length > 0) {
    const origins = new Set<string>()
    for (const value of configured) {
      let parsed: URL
      try {
        parsed = new URL(value)
      } catch {
        throw new Error(
          `Invalid AGENTIC_REMOTE_ALLOWED_ORIGINS entry: ${value}`,
        )
      }
      // `localhost:4317` parses as a URL whose origin is the opaque "null",
      // which would otherwise fail on every request instead of at startup.
      if (
        (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
        !parsed.host ||
        parsed.origin === 'null'
      ) {
        throw new Error(
          `Invalid AGENTIC_REMOTE_ALLOWED_ORIGINS entry: ${value} (expected http(s)://host[:port])`,
        )
      }
      origins.add(parsed.origin)
    }
    return { origins, allowLoopback: false }
  }
  // Fail closed on the hub's own address so a hub started without an explicit
  // allowlist still rejects DNS rebinding instead of accepting any Host.
  const host = process.env.HOST?.trim() || '127.0.0.1'
  const port = process.env.PORT?.trim() || '4318'
  const origins = new Set<string>()
  if (!wildcardHosts.has(host)) {
    const formatted = host.includes(':') && !host.startsWith('[')
      ? `[${host}]`
      : host
    try {
      origins.add(new URL(`http://${formatted}:${port}`).origin)
    } catch {
      // An unusable HOST leaves only the loopback allowance below.
    }
  }
  return { origins, allowLoopback: true }
}

function hostAllowed(host: string | undefined, policy: OriginPolicy): boolean {
  if (!host) {
    return false
  }
  if (policy.allowLoopback && isLoopbackHost(host)) {
    return true
  }
  return [...policy.origins].some((origin) => new URL(origin).host === host)
}

function originAllowed(
  origin: string,
  host: string | undefined,
  policy: OriginPolicy,
): boolean {
  if (!hostAllowed(host, policy)) {
    return false
  }
  let parsed: URL
  try {
    parsed = new URL(origin)
  } catch {
    return false
  }
  if (policy.allowLoopback && isLoopbackHost(parsed.host)) {
    return true
  }
  return policy.origins.has(parsed.origin)
}

/**
 * The part of the notification state a cleared conversation has to carry with
 * it. Kept to what the clear route needs so the routes do not depend on the
 * whole push service.
 */
export interface SessionMuteCarrier {
  settings(): { mutedSessions: string[] }
  setSessionMuted(
    computerId: string,
    sessionId: string,
    muted: boolean,
  ): Promise<{ mutedSessions: string[] }>
}

export async function registerHubRoutes(
  app: FastifyInstance,
  manager: ComputerManager,
  knowledge: KnowledgeStore,
  mutes?: SessionMuteCarrier,
  sessionKnowledge?: SessionKnowledgeStore,
  sessionOrder?: SessionOrderStore,
  managerEvents?: ManagerEventSource,
  settingsProfile?: SettingsProfileStore,
  presence?: ClientPresence,
  oracleVoice?: OracleVoiceRouteOptions,
  notifications?: NotificationCenterService,
  scheduler?: SchedulerStore,
): Promise<void> {
  const policy = originPolicy()
  // Assigned once the socket set exists further down. Until then a committed
  // order is still persisted and returned; only the push to other clients is
  // skipped, which is what a client's own response already told it.
  let publishOrder: (snapshot: SessionOrderSnapshot) => void = () => {}
  let publishSettings: (settings: SettingsProfileSnapshot) => void = () => {}
  const requireSessionOrder = (): SessionOrderStore => {
    if (!sessionOrder) {
      throw Object.assign(new Error('Session order is not available'), {
        statusCode: 503,
      })
    }
    return sessionOrder
  }
  /**
   * Commits an order change and tells the other clients. A change that moved
   * nothing keeps its revision, so reconnect traffic does not look like news.
   */
  const commitOrder = async (
    change: (store: SessionOrderStore) => Promise<SessionOrderSnapshot>,
  ): Promise<SessionOrderSnapshot> => {
    const store = requireSessionOrder()
    const before = store.snapshot().revision
    const snapshot = await change(store)
    if (snapshot.revision !== before) publishOrder(snapshot)
    return snapshot
  }
  const readResource = resourceRequestHandler(app)
  app.addHook('onRequest', async (request, reply) => {
    if (isSessionResourceRoute(request.routeOptions.url)) reply.header('cache-control', 'no-store')
    const origin = request.headers.origin
    // Routing decodes escaped segments; the wire spelling is not the API boundary.
    const isApiRoute =
      request.routeOptions.url?.startsWith('/api/') ||
      request.url.startsWith('/api/')
    if (
      isApiRoute &&
      (!hostAllowed(request.headers.host, policy) ||
        (origin && !originAllowed(origin, request.headers.host, policy)))
    ) {
      return reply.code(403).send({ error: 'Origin is not allowed' })
    }
  })
  if (oracleVoice) await registerOracleVoiceRoutes(app, oracleVoice)

  const sessionKnowledgeLifecycle = sessionKnowledge
    ? await registerSessionKnowledgeRoutes(app, manager, knowledge, sessionKnowledge)
    : undefined

  app.get('/api/health', async () => ({ ok: true }))

  app.get('/api/computers', async () => ({
    computers: manager.listComputers(),
  }))

  app.post('/api/computers', async (request, reply) => {
    const input = addComputerSchema.parse(request.body)
    const computer = await manager.registerComputer(input)
    return reply.code(201).send({ computer })
  })

  app.delete<{ Params: { computerId: string } }>(
    '/api/computers/:computerId',
    async (request, reply) => {
      await manager.removeComputer(request.params.computerId)
      const finishKnowledgeRemoval = sessionKnowledgeLifecycle?.removedComputerCleanup(request.params.computerId)
      // A knowledge root is a computer and a path. Unpairing the computer
      // leaves the root able to answer nothing but "not found", so it goes
      // with it rather than staying in the list offering to try.
      await knowledge.removeRootsForComputer(request.params.computerId)
      await finishKnowledgeRemoval?.()
      return reply.code(204).send()
    },
  )

  app.get('/api/sessions', async () => manager.listSessionsWithAuthority())

  app.get('/api/history', async () => ({
    sessions: await manager.listHistory(),
  }))

  app.get('/api/closed-sessions', async () => ({
    sessions: await manager.listClosedSessions(),
  }))

  app.get('/api/knowledge/roots', async () => ({
    roots: knowledge.listRoots(),
  }))

  app.post('/api/knowledge/roots', async (request, reply) => {
    const input = knowledgeRootSchema.parse(request.body)
    const computer = manager
      .listComputers()
      .find((entry) => entry.id === input.computerId)
    if (!computer) {
      noteRefusalReason(request, 'not-registered')
      return reply.code(404).send({ error: 'Computer is not registered' })
    }
    const registrationIsCurrent = manager.captureComputerRegistration(input.computerId)
    const roots = knowledge.listRoots()
    const submittedRoot = roots.find(
      (root) =>
        root.computerId === input.computerId &&
        root.path === input.path,
    )
    const submittedConfinement = submittedRoot
      ? knowledge.getRootConfinement(submittedRoot.id)
      : undefined
    // Browse the folder first so an unreachable or refused root is reported
    // before it is stored, and so the owning computer resolves it.
    let listing
    let canonicalPath: string
    try {
      canonicalPath = await manager.validateKnowledgeRoot(
        input.computerId,
        input.path,
        submittedConfinement,
      )
      const existingRoot = submittedRoot ?? roots.find(
        (root) =>
          root.computerId === input.computerId &&
          root.path === canonicalPath,
      )
      listing = await manager.listKnowledge(
        input.computerId,
        canonicalPath,
        undefined,
        existingRoot
          ? knowledge.getRootConfinement(existingRoot.id)
          : undefined,
      )
    } catch (error) {
      // A node released before knowledge roots has no such route, which would
      // otherwise surface as a bare "Not Found".
      if (Reflect.get(error as object, 'statusCode') === 404) {
        noteRefusalReason(request, 'knowledge-root.unsupported-node')
        return reply.code(409).send({
          error: `${computer.name} does not support knowledge roots yet. Update it to the latest release.`,
        })
      }
      throw error
    }
    if (!registrationIsCurrent()) {
      const registered = manager.listComputers()
        .some((entry) => entry.id === input.computerId)
      noteRefusalReason(request, registered ? 'knowledge-root.pairing-changed' : 'not-registered')
      return reply.code(registered ? 409 : 404).send({
        error: registered
          ? 'Computer pairing changed while validating this folder. Choose the computer again.'
          : 'Computer is not registered',
      })
    }
    const reservation = await knowledge.reserveRoot({
      computerId: input.computerId,
      computerName: computer.name,
      path: canonicalPath,
      name:
        input.name?.trim() ||
        canonicalPath.split('/').filter(Boolean).at(-1) ||
        canonicalPath,
    })
    const root = reservation.root
    // The registration decision runs inside the store's serialized finalize
    // operation. Nothing can replace this pairing while finalization waits
    // behind another Knowledge write and then slip through with stale data.
    if (!(await reservation.finalize(registrationIsCurrent))) {
      const registered = manager.listComputers()
        .some((entry) => entry.id === input.computerId)
      noteRefusalReason(request, registered ? 'knowledge-root.pairing-changed' : 'not-registered')
      return reply.code(registered ? 409 : 404).send({
        error: registered
          ? 'Computer pairing changed while saving this folder. Choose the computer again.'
          : 'Computer is not registered',
      })
    }
    return reply.code(201).send({ root, listing })
  })

  app.delete<{ Params: { rootId: string } }>(
    '/api/knowledge/roots/:rootId',
    async (request, reply) => {
      if (!(await knowledge.removeRoot(request.params.rootId))) {
        return reply.code(404).send({ error: 'Knowledge root not found' })
      }
      await sessionKnowledgeLifecycle?.rootRemoved(request.params.rootId)
      return reply.code(204).send()
    },
  )

  app.get<{ Params: { rootId: string }; Querystring: { path?: string } }>(
    '/api/knowledge/roots/:rootId/entries',
    async (request, reply) => {
      const root = knowledge.getRoot(request.params.rootId)
      if (!root) {
        return reply.code(404).send({ error: 'Knowledge root not found' })
      }
      const query = knowledgePathSchema.parse(request.query)
      const listing = await manager.listKnowledge(
        root.computerId,
        root.path,
        scopedKnowledgePath(query.basePath, query.path),
        knowledge.getRootConfinement(root.id),
      )
      return scopeKnowledgeListing(listing, query.basePath)
    },
  )

  app.get<{ Params: { rootId: string }; Querystring: { path?: string } }>(
    '/api/knowledge/roots/:rootId/file',
    async (request, reply) => {
      const root = knowledge.getRoot(request.params.rootId)
      if (!root) {
        return reply.code(404).send({ error: 'Knowledge root not found' })
      }
      const query = knowledgeFileSchema.parse(request.query)
      const file = await manager.readKnowledgeFile(
        root.computerId,
        root.path,
        scopedKnowledgePath(query.basePath, query.path),
        knowledge.getRootConfinement(root.id),
      )
      return scopeKnowledgeFile(file, query.basePath)
    },
  )

  app.get<{
    Params: { computerId: string }
    Querystring: { path?: string; scope?: string }
  }>(
    '/api/computers/:computerId/directories',
    async (request) => {
      const query = directoryQuerySchema.parse(request.query)
      return manager.listDirectories(
        request.params.computerId,
        query.path,
        query.scope,
      )
    },
  )

  app.post<{ Params: { computerId: string } }>(
    '/api/computers/:computerId/directories/validate',
    async (request) => {
      const input = directoryValidationSchema.parse(request.body)
      return {
        path: await manager.validateSessionDirectory(
          request.params.computerId,
          input.path,
        ),
      }
    },
  )

  app.get<{ Params: SessionParams; Querystring: { passive?: string } }>(
    '/api/computers/:computerId/sessions/:sessionId',
    async (request) => {
      const session = request.query.passive === '1'
        ? await manager.readSession(
          request.params.computerId,
          request.params.sessionId,
        )
        : await manager.getSession(
          request.params.computerId,
          request.params.sessionId,
        )
      if (request.query.passive !== '1') {
        await notifications?.sessionOpened(request.params.computerId, request.params.sessionId)
      }
      return { session }
    },
  )

  app.get<{
    Params: SessionParams
    Querystring: { path?: string }
  }>(
    '/api/computers/:computerId/sessions/:sessionId/workspace',
    async (request) => {
      const query = directoryQuerySchema.parse(request.query)
      return manager.listWorkspace(
        request.params.computerId,
        request.params.sessionId,
        query.path,
      )
    },
  )

  app.get<{
    Params: SessionParams
    Querystring: { path: string }
  }>(
    '/api/computers/:computerId/sessions/:sessionId/workspace/file',
    async (request) => {
      const query = workspaceFileQuerySchema.parse(request.query)
      return manager.readWorkspaceFile(
        request.params.computerId,
        request.params.sessionId,
        query.path,
      )
    },
  )

  app.get<{
    Params: SessionParams
    Querystring: { query: string }
  }>(
    '/api/computers/:computerId/sessions/:sessionId/workspace/search',
    async (request) => {
      const query = workspaceSearchQuerySchema.parse(request.query)
      return manager.searchWorkspace(
        request.params.computerId,
        request.params.sessionId,
        query.query,
        query.path,
      )
    },
  )

  app.get<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/commands',
    async (request) => ({
      commands: await manager.listCommands(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
  )

  app.get<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/skills',
    async (request, reply) => {
      reply.header('cache-control', 'no-store')
      return readResource(request, reply, (signal) =>
        manager.listSkills(request.params.computerId, request.params.sessionId, signal))
    },
  )

  app.get<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/mcp',
    async (request, reply) => {
      reply.header('cache-control', 'no-store')
      return readResource(request, reply, (signal) =>
        manager.listMcpServers(request.params.computerId, request.params.sessionId, signal))
    },
  )

  app.get('/api/session-order', async () => ({
    sessionOrder: requireSessionOrder().snapshot(),
  }))

  app.put('/api/session-order', async (request) => {
    const input = sessionOrderPreferencesSchema.parse(request.body)
    return {
      sessionOrder: await commitOrder((store) => store.setVisibility(input)),
    }
  })

  app.put<{ Params: { computerId: string } }>(
    '/api/session-order/:computerId',
    async (request) => {
      const input = sessionOrderLaneSchema.parse(request.body)
      return {
        sessionOrder: await commitOrder((store) =>
          store.replaceLane(request.params.computerId, input.order),
        ),
      }
    },
  )

  // Hiding only leaves a session out of the Sessions list; it keeps running,
  // notifying, and answering Oracle exactly as before.
  app.put('/api/session-order/:computerId/:sessionId', async (request) => {
    const { computerId, sessionId } = sessionOrderEntryParamsSchema.parse(request.params)
    const input = sessionOrderEntrySchema.parse(request.body)
    return {
      sessionOrder: await commitOrder((store) =>
        store.setSessionHidden(computerId, sessionId, input.hidden),
      ),
    }
  })

  // One-time seed from a browser that ordered its sessions before the hub
  // owned the order. It is ignored once any lane exists, so the first device
  // to arrive wins rather than the last one to reload.
  app.post('/api/session-order/bootstrap', async (request) => {
    const input = sessionOrderBootstrapSchema.parse(request.body)
    return {
      sessionOrder: await commitOrder((store) => store.bootstrap(input.order)),
    }
  })

  registerSettingsProfileRoutes(app, settingsProfile, (settings) => publishSettings(settings))

  app.post<{ Params: { computerId: string } }>(
    '/api/computers/:computerId/sessions',
    async (request, reply) => {
      const input = createSessionSchema.parse(request.body)
      return reply.code(201).send({
        session: await manager.createSession(request.params.computerId, input),
      })
    },
  )

  app.get<{
    Params: { computerId: string; provider: 'copilot' | 'claude' }
  }>(
    '/api/computers/:computerId/providers/:provider/runtime',
    async (request) =>
      manager.providerRuntimeOptions(
        request.params.computerId,
        z.enum(['copilot', 'claude']).parse(request.params.provider),
      ),
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/open',
    async (request) => {
      const session = await manager.activateSession(
        request.params.computerId,
        request.params.sessionId,
      )
      await notifications?.sessionOpened(request.params.computerId, request.params.sessionId)
      return { session }
    },
  )

  app.patch<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId',
    async (request) => {
      const input = renameSessionSchema.parse(request.body)
      return {
        session: await manager.renameSession(
          request.params.computerId,
          request.params.sessionId,
          input,
        ),
      }
    },
  )

  // Field-level: omitted fields keep their value, so devices editing
  // different fields concurrently never overwrite each other.
  app.patch<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/retention',
    async (request) => ({
      session: await manager.configureRetention(
        request.params.computerId,
        request.params.sessionId,
        sessionRetentionPatchSchema.parse(request.body),
      ),
    }),
  )

  const replaceConversation = async (
    computerId: string,
    sessionId: string,
    replace: () => ReturnType<ComputerManager['clearConversation']>,
    completed: string,
  ) => {
      // Silence belongs to the conversation, not to the id it happens to be
      // under. A paired node that predates the replacement link reports a
      // clear as a plain removal, which takes the silence with it, so it is
      // read before the clear and put back on whatever replaces the session.
      const silenced =
        mutes?.settings().mutedSessions.includes(`${computerId}:${sessionId}`) ??
        false
      const registrationIsCurrent = manager.captureComputerRegistration(computerId)
      const assertCurrent = () => {
        if (!registrationIsCurrent()) {
          throw Object.assign(new Error('Computer pairing changed while clearing. Reload sessions before continuing.'), {
            statusCode: 409,
          })
        }
      }
      const carryKnowledge = sessionKnowledgeLifecycle?.replacementCarrier(computerId)
      // Read before the clear: a legacy node reports the removal as its own
      // event, which can retire the predecessor's slot before this response
      // names the successor that should inherit it.
      const orderSlot = sessionOrder?.indexOf(computerId, sessionId)
      const session = await replace()
      assertCurrent()
      // The replacement is already real. Auxiliary persistence must not hide
      // its ID: older nodes supply that lineage only in this HTTP response.
      const carryMetadata = async (carry: () => Promise<unknown> | undefined, message: string) => {
        try {
          await carry()
        } catch (error) {
          app.log.error({ err: error, computerId, sessionId: session.id }, message)
          if (registrationIsCurrent()) {
            manager.emit('event', { type: 'error', computerId, sessionId: session.id, message })
          }
        }
      }
      await Promise.all([
        carryMetadata(
          () => carryKnowledge?.(sessionId, session),
          `${completed}, but its Knowledge folder metadata could not be saved. Open Knowledge or reload to retry.`,
        ),
        carryMetadata(
          () => silenced && session.id !== sessionId
            ? mutes?.setSessionMuted(computerId, session.id, true)
            : undefined,
          `${completed}, but notification silence could not be restored. Silence notifications again for this session.`,
        ),
        // A node that predates the replacement link reports a clear as a plain
        // removal, so the lineage is only in this response. Carrying it here
        // keeps the replacement in its predecessor's slot; the store makes a
        // second report of the same clear a no-op.
        carryMetadata(
          () => sessionOrder && session.id !== sessionId
            ? commitOrder((store) =>
                store.replaceSession(
                  computerId,
                  sessionId,
                  session.id,
                  orderSlot !== undefined && orderSlot >= 0 ? orderSlot : undefined,
                ),
              )
            : undefined,
          `${completed}, but its position in the custom order could not be saved. Drag it back into place.`,
        ),
      ])
      assertCurrent()
      return session
  }

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/clear',
    async (request) => {
      const { computerId, sessionId } = request.params
      return {
        session: await replaceConversation(
          computerId,
          sessionId,
          () => manager.clearConversation(computerId, sessionId),
          'Conversation cleared',
        ),
      }
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/recover',
    async (request) => {
      const { computerId, sessionId } = request.params
      const input = recoverConversationSchema.parse(request.body)
      return {
        session: await replaceConversation(
          computerId,
          sessionId,
          () => manager.recoverConversation(computerId, sessionId, input.reason),
          'Conversation recovered',
        ),
      }
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/suspend',
    async (request) => ({
      session: await manager.suspendSession(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/resume',
    async (request) => ({
      session: await manager.resumeSession(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/restart',
    async (request) => ({
      session: await manager.restartSession(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/tmux',
    async (request) => ({
      session: await manager.moveToTerminal(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
  )

  app.get<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/runtime',
    async (request) =>
      manager.runtimeOptions(
        request.params.computerId,
        request.params.sessionId,
      ),
  )

  app.patch<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/runtime',
    async (request) => {
      const input = configureRuntimeSchema.parse(request.body)
      return {
        session: await manager.configureRuntime(
          request.params.computerId,
          request.params.sessionId,
          input,
        ),
      }
    },
  )

  app.delete<{ Params: SessionParams & { promptId: string } }>(
    '/api/computers/:computerId/sessions/:sessionId/queue/:promptId',
    async (request) => {
      const input = discardQueuedDispatchSchema.parse(request.body ?? {})
      return manager.removeQueuedPrompt(
        request.params.computerId,
        request.params.sessionId,
        request.params.promptId,
        input.acknowledgesDispatch,
      )
    },
  )

  app.post<{ Params: SessionParams & { promptId: string } }>(
    '/api/computers/:computerId/sessions/:sessionId/queue/:promptId/dispatch',
    async (request) => {
      const input = updateQueuedPromptSchema.parse(request.body)
      return manager.dispatchQueuedPrompt(
        request.params.computerId,
        request.params.sessionId,
        request.params.promptId,
        input.content,
      )
    },
  )

  app.patch<{ Params: SessionParams & { promptId: string } }>(
    '/api/computers/:computerId/sessions/:sessionId/queue/:promptId',
    async (request) => {
      const input = updateQueuedPromptSchema.parse(request.body)
      return manager.updateQueuedPrompt(
        request.params.computerId,
        request.params.sessionId,
        request.params.promptId,
        input.content,
      )
    },
  )

  app.put<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/queue',
    async (request) => {
      const input = reorderQueueSchema.parse(request.body)
      return {
        session: await manager.reorderQueuedPrompts(
          request.params.computerId,
          request.params.sessionId,
          input.order,
        ),
      }
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/commands',
    async (request) => {
      const input = executeCommandSchema.parse(request.body)
      return {
        session: await manager.executeCommand(
          request.params.computerId,
          request.params.sessionId,
          input,
        ),
      }
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/messages',
    async (request, reply) => {
      const input = sendMessageSchema.parse(request.body)
      const session = await manager.sendMessage(
        request.params.computerId,
        request.params.sessionId,
        input,
      )
      return reply.code(202).send({
        session,
        ...(input.deliveryId !== undefined ? {
          receipt: session.promptReceipts?.find((receipt) => receipt.deliveryId === input.deliveryId),
        } : {}),
      })
    },
  )

  app.get<{ Params: { computerId: string; launchId: string } }>(
    '/api/computers/:computerId/launches/:launchId',
    async (request, reply) => {
      reply.header('cache-control', 'no-store')
      return { launch: await manager.reconcileLaunch(
        request.params.computerId, launchIdentitySchema.parse(request.params.launchId),
      ) ?? null }
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/cancel-with-ack',
    async (request) => {
      const { timeoutMs } = cancellationAckSchema.parse(request.body ?? {})
      return manager.cancelWithAck(request.params.computerId, request.params.sessionId, timeoutMs)
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/cancel',
    async (request, reply) => {
      await manager.cancel(request.params.computerId, request.params.sessionId)
      return reply.code(202).send({ ok: true })
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/ask',
    async (request) => {
      const input = sideQuestionSchema.parse(request.body)
      return {
        answer: await manager.askSession(
          request.params.computerId,
          request.params.sessionId,
          input.question,
          input.earlier,
        ),
      }
    },
  )

  app.get<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/tasks',
    async (request) =>
      manager.listBackgroundTasks(
        request.params.computerId,
        request.params.sessionId,
      ),
  )

  app.post<{
    Params: SessionParams & { taskId: string }
  }>(
    '/api/computers/:computerId/sessions/:sessionId/tasks/:taskId/cancel',
    async (request) =>
      manager.cancelBackgroundTask(
        request.params.computerId,
        request.params.sessionId,
        request.params.taskId,
      ),
  )

  // Recoverable: the owning computer keeps the session to reopen. DELETE
  // below stays the permanent delete existing clients rely on.
  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/close',
    async (request) => ({
      session: await manager.closeSession(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
  )

  app.delete<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId',
    async (request, reply) => {
      const { computerId, sessionId } = request.params
      if (sessionKnowledgeLifecycle) {
        await sessionKnowledgeLifecycle.deleteSession(computerId, sessionId)
      } else {
        await manager.deleteSession(computerId, sessionId)
      }
      return reply.code(204).send()
    },
  )

  app.post<{
    Params: SessionParams & { requestId: string }
  }>(
    '/api/computers/:computerId/sessions/:sessionId/permissions/:requestId',
    async (request) => {
      const input = permissionReplySchema.parse(request.body)
      return {
        session: await manager.replyPermission(
          request.params.computerId,
          request.params.sessionId,
          request.params.requestId,
          input,
        ),
      }
    },
  )

  app.post<{
    Params: SessionParams & { requestId: string }
  }>(
    '/api/computers/:computerId/sessions/:sessionId/user-input/:requestId',
    async (request) => {
      const input = userInputReplySchema.parse(request.body)
      return {
        session: await manager.replyUserInput(
          request.params.computerId,
          request.params.sessionId,
          request.params.requestId,
          input,
        ),
      }
    },
  )

  const publications = new SessionPublications()
  app.get('/api/events', { websocket: true }, (socket, request) => {
    const query = request.query as Record<string, unknown> | undefined
    const target: PatchSocket = socket
    if (query?.patches === '1') {
      target.patchVersions = new Map()
      socket.on('message', (data: Buffer, binary: boolean) => {
        // A resync request is one of the two messages a browser sends here.
        // Anything else, or anything too large to be one, is ignored rather
        // than parsed.
        if (binary || data.length > 1_024) return
        let request: Partial<HubResyncRequest>
        try {
          request = JSON.parse(data.toString('utf8')) as Partial<HubResyncRequest>
        } catch {
          return
        }
        if (
          request?.type === 'session.resync' &&
          typeof request.computerId === 'string' &&
          typeof request.sessionId === 'string'
        ) {
          publications.resync(target, request.computerId, request.sessionId)
        }
      })
    }
    // The other: a client says what it is showing. Each reader ignores what
    // the other accepts.
    socket.on('message', (data: unknown) => presence?.update(socket, data))
    publications.add(target)
    socket.on('close', () => {
      publications.delete(target)
      presence?.remove(socket)
    })
  })
  const broadcasts = new Map<string, { computerId?: string; promise: Promise<void> }>()
  const broadcast = (event: HubEvent) => {
    if (!notifications) {
      publications.broadcast(event)
      return
    }
    const admitted = notifications.admission(event)
    const computerId = event.type === 'session.upserted' ? event.session.computerId
      : event.type === 'computer.updated' ? event.computer.id : 'computerId' in event ? event.computerId : undefined
    const sessionId = event.type === 'session.upserted' ? event.session.id : 'sessionId' in event ? event.sessionId : undefined
    const computerKey = JSON.stringify(['computer', computerId])
    const key = sessionId ? JSON.stringify(['session', computerId, sessionId])
      : event.type === 'computer.updated' || event.type === 'computer.removed' ? computerKey
        : event.type.startsWith('manager.') ? 'oracle' : event.type
    const previous = [broadcasts.get(key)?.promise, computerId ? broadcasts.get(computerKey)?.promise : undefined]
    if (event.type === 'computer.removed') {
      previous.push(...[...broadcasts.values()].filter((entry) => entry.computerId === computerId).map((entry) => entry.promise))
    } else if (event.type === 'session.order.updated') {
      previous.push(...[...broadcasts.values()].filter((entry) => entry.computerId !== undefined).map((entry) => entry.promise))
    }
    // Preserve each session's metadata/transcript order and computer retirement
    // barriers, without letting one passive detail read stall unrelated streams.
    const entry = {
      computerId,
      promise: Promise.all(previous).then(async () => {
        await admitted
        publications.broadcast(event)
      }).catch((error: unknown) => {
        app.log.error({ err: error }, 'Could not persist the notification for a hub event')
      }),
    }
    broadcasts.set(key, entry)
    void entry.promise.then(() => {
      if (broadcasts.get(key) === entry) broadcasts.delete(key)
    })
  }
  manager.on('event', broadcast)
  managerEvents?.on('event', broadcast)
  notifications?.store.on('changed', broadcast)
  scheduler?.on('changed', broadcast)
  scheduler?.on('proposal', broadcast)
  publishOrder = (snapshot) =>
    broadcast({ type: 'session.order.updated', order: snapshot })
  publishSettings = (settings) => broadcast({ type: 'settings.updated', settings })
  /**
   * Keeps the saved order in step with session identity, which is the part a
   * browser cannot be trusted to do: a client that is closed, filtered, or
   * offline would otherwise never record the change.
   *
   * Changes are queued so two lifecycle events cannot interleave their
   * read-modify-write and lose one of them.
   */
  let orderWork: Promise<unknown> = Promise.resolve()
  // Identities retired since this hub started. Startup seeding works from a
  // listing taken before these arrived, so without them a session removed
  // mid-seed would be appended back after its removal was already applied.
  const retiredSessions = new Set<string>()
  const retiredComputers = new Set<string>()
  /**
   * Seats a session by lineage: a successor takes its nearest recorded
   * ancestor's slot, and only a session with no known ancestor is appended.
   */
  const seatSession = (
    store: SessionOrderStore,
    computerId: string,
    id: string,
    replacedSessionIds: string[] | undefined,
  ): Promise<SessionOrderSnapshot> => {
    const ancestor = (replacedSessionIds ?? [])
      .map((previous) => ({ previous, index: store.indexOf(computerId, previous) }))
      .filter((entry) => entry.index >= 0)
      .sort((left, right) => left.index - right.index)[0]
    return ancestor
      ? store.replaceSession(computerId, ancestor.previous, id, ancestor.index)
      : store.appendSession(computerId, id)
  }
  const trackOrder = (event: HubEvent) => {
    if (!sessionOrder) return
    const change = (apply: (store: SessionOrderStore) => Promise<SessionOrderSnapshot>) => {
      orderWork = orderWork
        .then(() => commitOrder(apply))
        .catch((error: unknown) => {
          // The order is a preference. Losing one update must not take the
          // event stream down with it.
          app.log.error({ err: error }, 'Could not update the custom session order')
        })
    }
    if (event.type === 'session.upserted') {
      const { computerId, id, replacedSessionIds } = event.session
      change((store) => seatSession(store, computerId, id, replacedSessionIds))
      return
    }
    if (event.type === 'session.removed') {
      const { computerId, sessionId, replacedBy } = event
      retiredSessions.add(`${computerId}:${sessionId}`)
      change((store) =>
        replacedBy
          ? store.replaceSession(computerId, sessionId, replacedBy)
          : store.removeSession(computerId, sessionId),
      )
      return
    }
    if (event.type === 'computer.removed') {
      const { computerId } = event
      retiredComputers.add(computerId)
      change((store) => store.removeComputer(computerId))
    }
  }
  manager.on('event', trackOrder)
  let closed = false
  let seeding: Promise<unknown> = Promise.resolve()
  if (sessionOrder) {
    // Sessions that already existed, or that a remote computer resynced before
    // this hook attached, emit nothing further while they sit quiet. Without
    // this they would never appear in the order at all.
    seeding = Promise.resolve()
      .then(() => manager.listSessions())
      .then(async (sessions) => {
        for (const session of sessions) {
          // Shutting down mid-seed must not write into a directory the owner
          // is already taking away.
          if (closed) return
          // The listing predates anything that retired while it was in
          // flight, so a session or computer that has since gone must not be
          // recreated by this seed.
          if (
            retiredComputers.has(session.computerId) ||
            retiredSessions.has(`${session.computerId}:${session.id}`)
          ) {
            continue
          }
          await commitOrder((store) =>
            seatSession(
              store,
              session.computerId,
              session.id,
              session.replacedSessionIds,
            ),
          )
        }
      })
      .catch((error: unknown) => {
        app.log.error({ err: error }, 'Could not seed the custom session order')
      })
  }
  app.addHook('onClose', async () => {
    closed = true
    manager.off('event', broadcast)
    managerEvents?.off('event', broadcast)
    notifications?.store.off('changed', broadcast)
    scheduler?.off('changed', broadcast)
    scheduler?.off('proposal', broadcast)
    manager.off('event', trackOrder)
    // Drain in-flight order work so a closing app leaves no write behind it.
    await seeding
    await orderWork
    await Promise.all([...broadcasts.values()].map((entry) => entry.promise))
  })
}
