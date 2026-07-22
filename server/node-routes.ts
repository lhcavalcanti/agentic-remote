import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ServerEvent } from '../shared/contracts.js'
import { NodeIdentityStore } from './node-identity.js'
import type { SessionService } from './session-service.js'

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
})

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(200_000),
})

const permissionReplySchema = z.object({
  optionId: z.string().trim().min(1).max(500),
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
          .send({ session: await service.createSession(input.cwd) })
      })

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/open',
        async (request) => ({
          session: await service.activateSession(request.params.sessionId),
        }),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/messages',
        async (request, reply) => {
          const input = sendMessageSchema.parse(request.body)
          return reply.code(202).send({
            session: await service.sendMessage(
              request.params.sessionId,
              input.content,
            ),
          })
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
