import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ManagerMessage, ManagerSnapshot } from '../shared/manager.js'
import type { ManagerClientDefaults } from '../shared/manager.js'

/** What the routes need from the manager agent. */
export interface ManagerRouteAgent {
  snapshot(): ManagerSnapshot
  send(content: string, defaults?: ManagerClientDefaults): Promise<ManagerMessage>
  retry(messageId: string): Promise<ManagerMessage>
  cancel(): Promise<void>
  reset(): Promise<void>
}

const effort = z.enum(['low', 'medium', 'high', 'xhigh', 'max'])

const defaultsSchema = z.object({
  computerId: z.string().trim().min(1).max(200).optional(),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
  provider: z.enum(['copilot', 'claude']).optional(),
  model: z.string().trim().min(1).max(200).optional(),
  reasoningEffort: effort.optional(),
  folders: z.record(z.string().trim().min(1).max(200), z.string().trim().min(1).max(4096)).optional(),
}).strip()

const sendSchema = z.object({
  // The agent gives the precise limits; this only bounds the request.
  content: z.string().max(200_000),
  defaults: defaultsSchema.optional(),
})

const messageParams = z.object({ messageId: z.string().trim().min(1).max(100) })

export function unavailableSnapshot(reason: string): ManagerSnapshot {
  return {
    available: false,
    unavailableReason: reason,
    status: 'offline',
    messages: [],
    queued: 0,
    managedSessions: [],
  }
}

/** Hub routes for the manager agent, under the hub's Host and Origin policy. */
export async function registerManagerRoutes(
  app: FastifyInstance,
  agent: ManagerRouteAgent | undefined,
  unavailableReason = 'The manager agent is not available on this hub.',
): Promise<void> {
  const requireAgent = () => {
    if (!agent) throw Object.assign(new Error(unavailableReason), { statusCode: 503 })
    return agent
  }

  app.get('/api/manager', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    return agent ? agent.snapshot() : unavailableSnapshot(unavailableReason)
  })

  app.post('/api/manager/messages', async (request, reply) => {
    const input = sendSchema.parse(request.body ?? {})
    const message = await requireAgent().send(input.content, input.defaults)
    return reply.code(202).send({ message })
  })

  app.post('/api/manager/messages/:messageId/retry', async (request) => {
    const { messageId } = messageParams.parse(request.params)
    return { message: await requireAgent().retry(messageId) }
  })

  app.post('/api/manager/cancel', async (_request, reply) => {
    await requireAgent().cancel()
    return reply.code(204).send()
  })

  app.post('/api/manager/reset', async () => {
    const managerAgent = requireAgent()
    await managerAgent.reset()
    return managerAgent.snapshot()
  })
}
