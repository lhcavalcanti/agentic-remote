import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { DreamerService } from './dreamer-service.js'
import { DreamerUnavailableError } from './dreamer-service.js'

const settingsSchema = z.object({
  revision: z.number().int().nonnegative(),
  enabled: z.boolean(),
  timeZone: z.string().trim().min(1).max(128),
}).strict()

const planSchema = z.object({
  revision: z.number().int().nonnegative(),
  planId: z.string().trim().min(1).max(200),
  order: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
  item: z.object({
    id: z.string().trim().min(1).max(200),
    status: z.enum(['pending', 'skipped', 'done']),
  }).strict().optional(),
}).strict().refine(
  ({ order, item }) => order !== undefined || item !== undefined,
  'Dreamer plan edit is empty.',
)

function parse<T>(
  schema: z.ZodType<T>,
  value: unknown,
): T {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw Object.assign(new Error('Invalid Dreamer request.'), {
      statusCode: 400,
      cause: parsed.error,
    })
  }
  return parsed.data
}

export async function registerDreamerRoutes(
  app: FastifyInstance,
  service: DreamerService | undefined,
  unavailableReason = 'Dreamer is unavailable on this hub.',
): Promise<void> {
  const requireService = (): DreamerService => {
    if (!service) throw new DreamerUnavailableError(unavailableReason)
    return service
  }

  app.get('/api/manager/dreamer', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    return requireService().snapshotForApi()
  })

  app.put('/api/manager/dreamer/settings', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const input = parse(settingsSchema, request.body ?? {})
    await requireService().updateSettings(input)
    return requireService().snapshotForApi()
  })

  app.put('/api/manager/dreamer/plan', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const input = parse(planSchema, request.body ?? {})
    return requireService().editPlan(input)
  })
}
