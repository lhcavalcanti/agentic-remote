import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import { z } from 'zod'
import type { ServerEvent } from '../shared/contracts.js'
import { AgentService } from './agent-service.js'
import { SessionStore } from './session-store.js'

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
})

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(200_000),
})

const permissionReplySchema = z.object({
  optionId: z.string().trim().min(1).max(500),
})

export interface BuildAppOptions {
  service?: AgentService
  logger?: boolean
  serveStatic?: boolean
}

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<{ app: FastifyInstance; service: AgentService }> {
  const app = Fastify({ logger: options.logger ?? true })
  const service = options.service ?? new AgentService(new SessionStore())
  const sockets = new Set<{ send: (payload: string) => void; readyState: number }>()

  await app.register(fastifyWebsocket)

  app.get('/api/health', async () => ({ ok: true }))

  app.get('/api/sessions', async () => ({
    sessions: service.listSessions(),
  }))

  app.get<{ Params: { sessionId: string } }>(
    '/api/sessions/:sessionId',
    async (request, reply) => {
      if (!service.getSession(request.params.sessionId)) {
        return reply.code(404).send({ error: 'Session not found' })
      }
      const session = await service.openSession(request.params.sessionId)
      return { session }
    },
  )

  app.post('/api/sessions', async (request, reply) => {
    const input = createSessionSchema.parse(request.body)
    const session = await service.createSession(input.cwd)
    return reply.code(201).send({ session })
  })

  app.post<{ Params: { sessionId: string } }>(
    '/api/sessions/:sessionId/messages',
    async (request, reply) => {
      const input = sendMessageSchema.parse(request.body)
      const session = await service.sendMessage(
        request.params.sessionId,
        input.content,
      )
      return reply.code(202).send({ session })
    },
  )

  app.post<{ Params: { sessionId: string } }>(
    '/api/sessions/:sessionId/cancel',
    async (request, reply) => {
      if (!service.getSession(request.params.sessionId)) {
        return reply.code(404).send({ error: 'Session not found' })
      }
      await service.cancel(request.params.sessionId)
      return reply.code(202).send({ ok: true })
    },
  )

  app.post<{
    Params: { sessionId: string; requestId: string }
  }>(
    '/api/sessions/:sessionId/permissions/:requestId',
    async (request) => {
      const input = permissionReplySchema.parse(request.body)
      const session = await service.replyPermission(
        request.params.sessionId,
        request.params.requestId,
        input.optionId,
      )
      return { session }
    },
  )

  app.get('/api/events', { websocket: true }, (socket) => {
    sockets.add(socket)
    socket.on('close', () => {
      sockets.delete(socket)
    })
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

  app.addHook('onClose', async () => {
    service.off('event', broadcast)
    await service.stop()
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: error.issues[0]?.message || 'Invalid request',
      })
    }
    app.log.error(error)
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    const statusCode = message.toLowerCase().includes('not found') ? 404 : 500
    return reply.code(statusCode).send({ error: message })
  })

  if (options.serveStatic) {
    const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
    const publicDirectory = path.resolve(serverDirectory, '../dist')
    await app.register(fastifyStatic, {
      root: publicDirectory,
      wildcard: false,
    })
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api/')) {
        return reply.code(404).send({ error: 'Not found' })
      }
      return reply.sendFile('index.html')
    })
  }

  return { app, service }
}
