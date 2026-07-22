import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import { z } from 'zod'
import { AgentService } from './agent-service.js'
import { ComputerManager } from './computer-manager.js'
import { ComputerRegistry } from './computer-registry.js'
import { registerHubRoutes } from './hub-routes.js'
import { NodeIdentityStore } from './node-identity.js'
import { registerNodeRoutes } from './node-routes.js'
import { resolveDataDirectory } from './paths.js'
import { SessionStore } from './session-store.js'
import type { SessionService } from './session-service.js'

export type ServerRole = 'hub' | 'node'

export interface BuildAppOptions {
  service?: SessionService
  identity?: NodeIdentityStore
  manager?: ComputerManager
  logger?: boolean
  serveStatic?: boolean
  role?: ServerRole
  dataDirectory?: string
}

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<{
  app: FastifyInstance
  service: SessionService
  identity: NodeIdentityStore
  manager?: ComputerManager
}> {
  const app = Fastify({ logger: options.logger ?? true })
  const role = options.role ?? 'hub'
  const dataDirectory = options.dataDirectory ?? resolveDataDirectory()
  const service = options.service ?? new AgentService(new SessionStore(dataDirectory))
  const identity = options.identity ?? new NodeIdentityStore(dataDirectory)
  await identity.initialize()

  await app.register(fastifyWebsocket)
  await registerNodeRoutes(app, service, identity)

  let manager: ComputerManager | undefined
  if (role === 'hub') {
    manager =
      options.manager ??
      new ComputerManager(
        service,
        identity,
        new ComputerRegistry(dataDirectory),
      )
    await manager.initialize()
    await registerHubRoutes(app, manager)
  }

  app.get('/health', async () => ({
    ok: true,
    role,
    node: identity.info,
  }))

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: error.issues[0]?.message || 'Invalid request',
      })
    }
    app.log.error(error)
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    const lower = message.toLowerCase()
    const statusCode = lower.includes('not found')
      ? 404
      : lower.includes('not registered')
        ? 400
        : 500
    return reply.code(statusCode).send({ error: message })
  })

  if (role === 'hub' && options.serveStatic) {
    const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
    const publicDirectory = path.resolve(serverDirectory, '../dist')
    await app.register(fastifyStatic, {
      root: publicDirectory,
      wildcard: false,
    })
    app.setNotFoundHandler((request, reply) => {
      if (
        request.url.startsWith('/api/') ||
        request.url.startsWith('/node-api/')
      ) {
        return reply.code(404).send({ error: 'Not found' })
      }
      return reply.sendFile('index.html')
    })
  }

  app.addHook('onClose', async () => {
    manager?.stop()
    await service.stop()
  })

  return { app, service, identity, manager }
}
