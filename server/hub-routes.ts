import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { HubEvent } from '../shared/contracts.js'
import { ComputerManager } from './computer-manager.js'
import { KnowledgeStore } from './knowledge-store.js'

const addComputerSchema = z.object({
  baseUrl: z.string().trim().url().max(2048),
  token: z.string().trim().min(1).max(500),
  name: z.string().trim().min(1).max(100).optional(),
})

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
  provider: z.enum(['copilot', 'claude']).default('copilot'),
  terminalBacked: z.boolean().default(true),
  allowAllPermissions: z.boolean().default(true),
  model: z.string().trim().min(1).max(200).optional(),
  reasoningEffort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  contextTier: z.enum(['default', 'long_context']).optional(),
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
  content: z.string().trim().min(1).max(200_000),
  enqueue: z.boolean().optional(),
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

const executeCommandSchema = z.object({
  command: z.string().trim().startsWith('/').max(10_000),
  enqueue: z.boolean().optional(),
})

const configureRuntimeSchema = z.object({
  model: z.string().trim().min(1).max(200),
  reasoningEffort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  contextTier: z.enum(['default', 'long_context']),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
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

const knowledgePathSchema = z.object({
  path: z.string().trim().max(4096).optional(),
})

const knowledgeFileSchema = z.object({
  path: z.string().trim().min(1).max(4096),
})

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
): Promise<void> {
  const policy = originPolicy()
  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin
    if (
      request.url.startsWith('/api/') &&
      (!hostAllowed(request.headers.host, policy) ||
        (origin && !originAllowed(origin, request.headers.host, policy)))
    ) {
      return reply.code(403).send({ error: 'Origin is not allowed' })
    }
  })

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
      return reply.code(204).send()
    },
  )

  app.get('/api/sessions', async () => manager.listSessionsWithAuthority())

  app.get('/api/history', async () => ({
    sessions: await manager.listHistory(),
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
      return reply.code(404).send({ error: 'Computer is not registered' })
    }
    // Browse the folder first so an unreachable or refused root is reported
    // before it is stored, and so the owning computer resolves it.
    let listing
    try {
      listing = await manager.listKnowledge(input.computerId, input.path)
    } catch (error) {
      // A node released before knowledge roots has no such route, which would
      // otherwise surface as a bare "Not Found".
      if (Reflect.get(error as object, 'statusCode') === 404) {
        return reply.code(409).send({
          error: `${computer.name} does not support knowledge roots yet. Update it to the latest release.`,
        })
      }
      throw error
    }
    const root = await knowledge.addRoot({
      computerId: input.computerId,
      computerName: computer.name,
      path: input.path,
      name:
        input.name?.trim() ||
        input.path.split('/').filter(Boolean).at(-1) ||
        input.path,
    })
    return reply.code(201).send({ root, listing })
  })

  app.delete<{ Params: { rootId: string } }>(
    '/api/knowledge/roots/:rootId',
    async (request, reply) => {
      if (!(await knowledge.removeRoot(request.params.rootId))) {
        return reply.code(404).send({ error: 'Knowledge root not found' })
      }
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
      return manager.listKnowledge(root.computerId, root.path, query.path)
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
      return manager.readKnowledgeFile(root.computerId, root.path, query.path)
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

  app.get<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId',
    async (request) => ({
      session: await manager.getSession(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
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
    async (request) => ({
      session: await manager.activateSession(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
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

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/clear',
    async (request) => {
      const { computerId, sessionId } = request.params
      // Silence belongs to the conversation, not to the id it happens to be
      // under. A paired node that predates the replacement link reports a
      // clear as a plain removal, which takes the silence with it, so it is
      // read before the clear and put back on whatever replaces the session.
      const silenced =
        mutes?.settings().mutedSessions.includes(`${computerId}:${sessionId}`) ??
        false
      const session = await manager.clearConversation(computerId, sessionId)
      if (silenced && session.id !== sessionId) {
        await mutes?.setSessionMuted(computerId, session.id, true)
      }
      return { session }
    },
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
    async (request) =>
      manager.removeQueuedPrompt(
        request.params.computerId,
        request.params.sessionId,
        request.params.promptId,
      ),
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
      return reply.code(202).send({
        session: await manager.sendMessage(
          request.params.computerId,
          request.params.sessionId,
          input,
        ),
      })
    },
  )

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/cancel',
    async (request, reply) => {
      await manager.cancel(request.params.computerId, request.params.sessionId)
      return reply.code(202).send({ ok: true })
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

  app.delete<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId',
    async (request, reply) => {
      await manager.deleteSession(
        request.params.computerId,
        request.params.sessionId,
      )
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

  const sockets = new Set<{
    send: (payload: string) => void
    readyState: number
  }>()
  app.get('/api/events', { websocket: true }, (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })
  const broadcast = (event: HubEvent) => {
    const payload = JSON.stringify(event)
    for (const socket of sockets) {
      if (socket.readyState === 1) {
        socket.send(payload)
      }
    }
  }
  manager.on('event', broadcast)
  app.addHook('onClose', async () => {
    manager.off('event', broadcast)
  })
}
