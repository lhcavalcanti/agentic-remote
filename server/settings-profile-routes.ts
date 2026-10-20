import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  SETTINGS_DEVICE_ID_MAX_LENGTH,
  type SettingsProfileSnapshot,
} from '../shared/settings-profile.js'
import type { SettingsProfileStore } from './settings-profile-store.js'

/** Generous for 32 KB of settings; anything larger is refused before parsing. */
const SETTINGS_BODY_LIMIT = 64 * 1024

const deviceId = z.string().min(1).max(SETTINGS_DEVICE_ID_MAX_LENGTH).optional()

const updateSchema = z
  .object({
    deviceId,
    changes: z.record(
      z.string().max(64),
      z.object({
        value: z.unknown(),
        baseRevision: z.number().int().min(0),
        seq: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
      }).strict(),
    ),
  })
  .strict()

const importSchema = z
  .object({ deviceId, values: z.record(z.string().max(64), z.unknown()) })
  .strict()

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw Object.assign(
      new Error(result.error.issues[0]?.message || 'Invalid settings request'),
      { statusCode: 400 },
    )
  }
  return result.data
}

/**
 * The hub's settings profile. Registered from the hub routes so the Host and
 * Origin policy guards it like every other `/api/` route.
 */
export function registerSettingsProfileRoutes(
  app: FastifyInstance,
  store: SettingsProfileStore | undefined,
  publish: (settings: SettingsProfileSnapshot) => void,
): void {
  const requireStore = (): SettingsProfileStore => {
    if (!store) {
      throw Object.assign(new Error('Settings are not available on this hub'), {
        statusCode: 503,
      })
    }
    return store
  }
  /** Tells the other devices, but only when the commit changed something. */
  const announce = (before: number, settings: SettingsProfileSnapshot) => {
    if (settings.revision !== before) publish(settings)
    return settings
  }

  app.get('/api/settings', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    return { settings: requireStore().snapshot() }
  })

  app.patch('/api/settings', { bodyLimit: SETTINGS_BODY_LIMIT }, async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const profile = requireStore()
    const input = parse(updateSchema, request.body)
    const before = profile.snapshot().revision
    const result = await profile.update(input.changes, input.deviceId)
    return { settings: announce(before, result.settings), conflicts: result.conflicts }
  })

  app.post('/api/settings/import', { bodyLimit: SETTINGS_BODY_LIMIT }, async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const profile = requireStore()
    const input = parse(importSchema, request.body)
    const before = profile.snapshot().revision
    return { settings: announce(before, await profile.import(input.values, input.deviceId)) }
  })
}
