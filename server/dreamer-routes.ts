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
  completion: z.object({
    itemId: z.string().trim().min(1).max(200),
    computerId: z.string().trim().min(1).max(200),
    sessionId: z.string().trim().min(1).max(200),
    sessionRevision: z.number().int().nonnegative(),
    messageId: z.string().trim().min(1).max(200),
    resultDigest: z.string().regex(/^[a-f0-9]{64}$/),
  }).strict().optional(),
  investigate: z.object({
    itemId: z.string().trim().min(1).max(200),
    requestId: z.string().uuid(),
  }).strict().optional(),
  taskCompletion: z.object({
    taskId: z.string().trim().min(1).max(200),
    taskRevision: z.number().int().nonnegative(),
    attemptId: z.string().trim().min(1).max(200),
    computerId: z.string().trim().min(1).max(200),
    sessionId: z.string().trim().min(1).max(200),
    sessionRevision: z.number().int().nonnegative(),
    messageId: z.string().trim().min(1).max(200),
    resultDigest: z.string().regex(/^[a-f0-9]{64}$/),
  }).strict().optional(),
}).strict().refine(
  ({ order, item, completion, investigate, taskCompletion }) =>
    [order, item, completion, investigate, taskCompletion]
      .filter((operation) => operation !== undefined).length === 1,
  'Dreamer plan edit must contain exactly one operation.',
)

const taskParamsSchema = z.object({
  taskId: z.string().trim().min(1).max(200),
}).strict()

const dispatchSchema = z.object({
  revision: z.number().int().nonnegative(),
  requestId: z.string().uuid(),
}).strict()

const taskCompletionSchema = z.object({
  revision: z.number().int().nonnegative(),
  attemptId: z.string().trim().min(1).max(200),
  computerId: z.string().trim().min(1).max(200),
  sessionId: z.string().trim().min(1).max(200),
  sessionRevision: z.number().int().nonnegative(),
  messageId: z.string().trim().min(1).max(200),
  resultDigest: z.string().regex(/^[a-f0-9]{64}$/),
}).strict()

const taskDispositionSchema = z.object({
  revision: z.number().int().nonnegative(),
  status: z.enum(['completed', 'dismissed']),
}).strict()

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

  app.post('/api/manager/dreamer/tasks/:taskId/dispatch', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const params = parse(taskParamsSchema, request.params ?? {})
    const input = parse(dispatchSchema, request.body ?? {})
    return requireService().dispatchTask({ ...input, taskId: params.taskId })
  })

  app.post('/api/manager/dreamer/tasks/:taskId/complete', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const params = parse(taskParamsSchema, request.params ?? {})
    const input = parse(taskCompletionSchema, request.body ?? {})
    return requireService().confirmTaskCompletion({
      ...input,
      taskId: params.taskId,
    })
  })

  app.post('/api/manager/dreamer/tasks/:taskId/disposition', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const params = parse(taskParamsSchema, request.params ?? {})
    const input = parse(taskDispositionSchema, request.body ?? {})
    return requireService().resolveUserTask({
      ...input,
      taskId: params.taskId,
    })
  })
}
