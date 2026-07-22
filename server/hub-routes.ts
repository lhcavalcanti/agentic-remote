import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { HubEvent } from '../shared/contracts.js'
import { ComputerManager } from './computer-manager.js'

const addComputerSchema = z.object({
  baseUrl: z.string().trim().url().max(2048),
  token: z.string().trim().min(1).max(500),
  name: z.string().trim().min(1).max(100).optional(),
})

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
})

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(200_000),
})

const permissionReplySchema = z.object({
  optionId: z.string().trim().min(1).max(500),
})

interface SessionParams {
  computerId: string
  sessionId: string
}

export async function registerHubRoutes(
  app: FastifyInstance,
  manager: ComputerManager,
): Promise<void> {
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

  app.get('/api/sessions', async () => ({
    sessions: await manager.listSessions(),
  }))

  app.get('/api/history', async () => ({
    sessions: await manager.listHistory(),
  }))

  app.get<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId',
    async (request) => ({
      session: await manager.getSession(
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

  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/open',
    async (request) => ({
      session: await manager.activateSession(
        request.params.computerId,
        request.params.sessionId,
      ),
    }),
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
