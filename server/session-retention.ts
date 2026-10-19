import { z } from 'zod'
import type { SessionDetail } from '../shared/contracts.js'

export const sessionRetentionSchema = z.object({
  pinned: z.boolean(),
  idleDays: z.number().int().min(1).max(3650).optional(),
}).strict()

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
