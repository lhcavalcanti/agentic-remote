import { z } from 'zod'
import type { SessionDetail, SessionRetention, SessionRetentionPatch } from '../shared/contracts.js'

const idleDaysSchema = z.number().int().min(1).max(3650)

export const sessionRetentionSchema = z.object({
  pinned: z.boolean(),
  idleDays: idleDaysSchema.optional(),
}).strict()

export const sessionRetentionPatchSchema = z.object({
  pinned: z.boolean().optional(),
  idleDays: idleDaysSchema.nullable().optional(),
}).strict().refine(
  (patch) => patch.pinned !== undefined || patch.idleDays !== undefined,
  'Change at least one retention setting',
)

export function mergeSessionRetention(
  current: SessionRetention | undefined,
  input: SessionRetentionPatch,
): SessionRetention {
  const patch = sessionRetentionPatchSchema.parse(input)
  const idleDays = patch.idleDays === undefined ? current?.idleDays : patch.idleDays ?? undefined
  return sessionRetentionSchema.parse({
    pinned: patch.pinned ?? current?.pinned ?? false,
    ...(idleDays === undefined ? {} : { idleDays }),
  })
}

export function canArchiveSession(session: SessionDetail, now: number): boolean {
  const days = session.retention?.idleDays
  const status = session.interruption?.previousStatus ?? session.status
  if (!days || session.retention?.pinned || !session.isOpen ||
      status !== 'idle' ||
      session.pendingPermission || session.pendingUserInput ||
      session.queuedPrompts?.length || session.queuedCount ||
      session.queuedDispatch || session.failedPrompt || session.recoverySeedState) return false
  const updated = Math.max(Date.parse(session.updatedAt), session.retentionLastUsedAt
    ? Date.parse(session.retentionLastUsedAt) : -Infinity)
  return Number.isFinite(updated) && Number.isFinite(now) &&
    now >= updated && now - updated >= days * 86_400_000
}
