import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { notificationKinds, type NotificationFilter } from '../shared/notification-center.js'
import type { NotificationCenterService } from './notification-center-service.js'
import { NOTIFICATION_LIMIT } from './notification-store.js'

const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true')
const filters = z.object({
  unread: booleanQuery.optional(),
  kind: z.union([z.enum(notificationKinds), z.string().regex(/^schedule\.run\.[a-z-]+$/)]).optional(),
  sessionId: z.string().min(1).max(512).optional(),
  computerId: z.string().min(1).max(512).optional(),
  failed: booleanQuery.optional(),
}).strict()
const params = z.object({ id: z.string().regex(/^[a-f0-9]{64}$/) })

/** Uses the global canonical API Host/Origin hook installed by hub-routes. */
export async function registerNotificationRoutes(
  app: FastifyInstance,
  center: NotificationCenterService | undefined,
): Promise<void> {
  // Register even when disabled so the same origin enforcement always applies.
  const ready = async () => {
    if (!center) throw Object.assign(new Error('Notification center is disabled'), { statusCode: 404 })
    await center.flush()
    return center.store
  }
  app.get('/api/notifications', async (request, reply) => {
    const store = await ready()
    reply.header('cache-control', 'no-store')
    return { notifications: await store.list(filters.parse(request.query) as NotificationFilter) }
  })
  app.get('/api/notifications/unread-count', async (request, reply) => {
    const store = await ready()
    reply.header('cache-control', 'no-store')
    return { unreadCount: await store.unreadCount(filters.parse(request.query) as NotificationFilter) }
  })
  app.post('/api/notifications/read-all', async (request) => {
    const store = await ready()
    await store.readAll(filters.parse(request.query) as NotificationFilter)
    return { ok: true }
  })
  app.post('/api/notifications/bulk', async (request) => {
    const store = await ready()
    const batch = z.object({
      ids: z.array(params.shape.id).min(1).max(NOTIFICATION_LIMIT),
      action: z.enum(['read', 'dismiss']),
    }).strict().parse(request.body)
    await store.mutateMany(batch.ids, batch.action)
    return { ok: true }
  })
  app.post('/api/notifications/:id/read', async (request) => {
    const store = await ready()
    await store.markRead(params.parse(request.params).id)
    return { ok: true }
  })
  app.post('/api/notifications/:id/dismiss', async (request) => {
    const store = await ready()
    await store.dismiss(params.parse(request.params).id)
    return { ok: true }
  })
}
