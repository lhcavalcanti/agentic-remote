import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ServerEvent } from '../shared/contracts.js'
import { NodeIdentityStore } from './node-identity.js'
import type { SessionService } from './session-service.js'

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
  terminalBacked: z.boolean().default(true),
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

const userInputReplySchema = z.object({
  answer: z.string().trim().min(1).max(20_000),
  wasFreeform: z.boolean(),
})

const executeCommandSchema = z.object({
  command: z.string().trim().startsWith('/').max(10_000),
  enqueue: z.boolean().optional(),
})

const configureRuntimeSchema = z.object({
  model: z.string().trim().min(1).max(200),
  reasoningEffort: z.string().trim().min(1).max(50),
  contextTier: z.enum(['default', 'long_context']),
})

const directoryQuerySchema = z.object({
  path: z.string().trim().max(4096).optional(),
})

function tokenMatches(actual: string | undefined, expected: string): boolean {
  const prefix = 'Bearer '
  if (!actual?.startsWith(prefix)) {
    return false
  }
  const received = Buffer.from(actual.slice(prefix.length))
  const stored = Buffer.from(expected)
  return received.length === stored.length && timingSafeEqual(received, stored)
}

export async function registerNodeRoutes(
  app: FastifyInstance,
  service: SessionService,
  identity: NodeIdentityStore,
): Promise<void> {
  await app.register(
    async (node) => {
      node.addHook('onRequest', async (request, reply) => {
        if (!tokenMatches(request.headers.authorization, identity.token)) {
          return reply.code(401).send({ error: 'Invalid node token' })
        }
      })

      node.get('/info', async () => identity.info)

      node.get('/sessions', async () => ({
        sessions: service.listSessions(),
      }))

      node.get('/history', async () => ({
        sessions: service.listHistory(),
      }))

      node.get<{ Querystring: { path?: string } }>(
        '/directories',
        async (request) => {
          const query = directoryQuerySchema.parse(request.query)
          return service.listDirectories(query.path)
        },
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/commands',
        async (request) => ({
          commands: await service.listCommands(request.params.sessionId),
        }),
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId',
        async (request) => ({
          session: await service.openSession(request.params.sessionId),
        }),
      )

      node.post('/sessions', async (request, reply) => {
        const input = createSessionSchema.parse(request.body)
        return reply
          .code(201)
          .send({
            session: await service.createSession(
              input.cwd,
              input.terminalBacked,
            ),
          })
      })

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/open',
        async (request) => ({
          session: await service.activateSession(request.params.sessionId),
        }),
      )

      node.patch<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId',
        async (request) => {
          const input = renameSessionSchema.parse(request.body)
          return {
            session: await service.renameSession(
              request.params.sessionId,
              input.title,
            ),
          }
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/clear',
        async (request) => ({
          session: await service.clearConversation(request.params.sessionId),
        }),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/restart',
        async (request) => ({
          session: await service.restartSession(request.params.sessionId),
        }),
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/runtime',
        async (request) => service.runtimeOptions(request.params.sessionId),
      )

      node.patch<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/runtime',
        async (request) => {
          const input = configureRuntimeSchema.parse(request.body)
          return {
            session: await service.configureRuntime(
              request.params.sessionId,
              input,
            ),
          }
        },
      )

      node.delete<{ Params: { sessionId: string; promptId: string } }>(
        '/sessions/:sessionId/queue/:promptId',
        async (request) =>
          service.removeQueuedPrompt(
            request.params.sessionId,
            request.params.promptId,
          ),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/messages',
        async (request, reply) => {
          const input = sendMessageSchema.parse(request.body)
          return reply.code(202).send({
            session: await service.sendMessage(
              request.params.sessionId,
              input.content,
              input.enqueue,
            ),
          })
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/commands',
        async (request) => {
          const input = executeCommandSchema.parse(request.body)
          return {
            session: await service.executeCommand(
              request.params.sessionId,
              input.command,
              input.enqueue,
            ),
          }
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/cancel',
        async (request, reply) => {
          await service.cancel(request.params.sessionId)
          return reply.code(202).send({ ok: true })
        },
      )

      node.delete<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId',
        async (request) => {
          await service.deleteSession(request.params.sessionId)
          return { ok: true }
        },
      )

      node.post<{ Params: { sessionId: string; requestId: string } }>(
        '/sessions/:sessionId/permissions/:requestId',
        async (request) => {
          const input = permissionReplySchema.parse(request.body)
          return {
            session: await service.replyPermission(
              request.params.sessionId,
              request.params.requestId,
              input.optionId,
            ),
          }
        },
      )

      node.post<{ Params: { sessionId: string; requestId: string } }>(
        '/sessions/:sessionId/user-input/:requestId',
        async (request) => {
          const input = userInputReplySchema.parse(request.body)
          return {
            session: await service.replyUserInput(
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
      node.get('/events', { websocket: true }, (socket) => {
        sockets.add(socket)
        socket.on('close', () => sockets.delete(socket))
      })
      const broadcast = (event: ServerEvent) => {
        const payload = JSON.stringify(event)
        for (const socket of sockets) {
          if (socket.readyState === 1) {
            socket.send(payload)
          }
        }
      }
      service.on('event', broadcast)
      node.addHook('onClose', async () => {
        service.off('event', broadcast)
      })
    },
    { prefix: '/node-api' },
  )
}
