import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PushNotificationService } from './push-notification-service.js'

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(4096),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1).max(4096),
    auth: z.string().min(1).max(4096),
  }),
})

const unsubscribeSchema = z.object({
  endpoint: z.string().url().max(4096),
})

const sessionMuteSchema = z.object({
  computerId: z.string().min(1).max(256),
  sessionId: z.string().min(1).max(256),
  muted: z.boolean(),
})

const testNotificationSchema = z.object({
  confirm: z.literal(true),
})

export async function registerPushRoutes(
  app: FastifyInstance,
  push: PushNotificationService,
): Promise<void> {
  app.get('/api/push/public-key', async () => ({
    publicKey: push.publicKey(),
  }))

  app.post('/api/push/subscriptions', async (request, reply) => {
    await push.subscribe(subscriptionSchema.parse(request.body))
    return reply.code(201).send({ ok: true })
  })

  app.delete('/api/push/subscriptions', async (request, reply) => {
    const input = unsubscribeSchema.parse(request.body)
    await push.unsubscribe(input.endpoint)
    return reply.code(204).send()
  })

  app.get('/api/push/settings', async () => push.settings())

  app.put('/api/push/session-mute', async (request) => {
    const input = sessionMuteSchema.parse(request.body)
    return push.setSessionMuted(input.computerId, input.sessionId, input.muted)
  })

  app.post('/api/push/test', async (request) => {
    testNotificationSchema.parse(request.body)
    return push.sendTestNotification()
  })
}
