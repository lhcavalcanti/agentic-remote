import { z } from 'zod'
import { launchIdentitySchema } from './launch-identity.js'

export const SCHEDULE_WORKTREE_VERSION = 1
const folder = z.string().min(1).max(4096)
export const scheduleWorktreeInputSchema = z.object({
  launchId: launchIdentitySchema,
  folder,
  root: folder.optional(),
}).strict()
export const scheduleWorktreeCleanupSchema = z.object({ launchId: launchIdentitySchema }).strict()
export const scheduleWorktreeRecordSchema = z.object({
  launchId: launchIdentitySchema,
  repository: folder,
  root: folder,
  path: folder,
  createdAt: z.string().datetime(),
  state: z.enum(['allocating', 'ready', 'deferred', 'removed']),
  reason: z.string().optional(),
}).strict()
export type ScheduleWorktreeInput = z.infer<typeof scheduleWorktreeInputSchema>
export type ScheduleWorktreeRecord = z.infer<typeof scheduleWorktreeRecordSchema>

export function updateComputerForScheduleWorktrees(): Error {
  return Object.assign(new Error('Update this computer to run schedules in worktrees.'), { statusCode: 409 })
}
