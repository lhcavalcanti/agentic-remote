import { z } from 'zod'
import { parseCronExpression } from './schedule-cron.js'
import { launchIdentitySchema, promptAcceptanceReceiptSchema } from './launch-identity.js'
import { scheduleWorktreeInputSchema, scheduleWorktreeRecordSchema } from './schedule-worktrees.js'

export const DEFAULT_SCHEDULE_TIMEZONE = 'America/Los_Angeles'
export const SCHEDULE_PROMPT_MAX_LENGTH = 20_000
export const SCHEDULE_MIN_SPACING_MINUTES = 15
export const CLAUDE_SCHEDULE_UNAVAILABLE_REASON = 'Claude Agent schedules are unavailable because this adapter cannot prove background work has stopped.'
export const SCHEDULE_ABANDONED_REASON = 'Run abandoned by explicit confirmation. Work may still be running; inspect the owning computer. This launch identity will not be resumed.'
export const SCHEDULE_DELETED_SESSION_REASON = 'The owning computer confirms that this session was deleted. Any remaining background work requires manual review.'
export function scheduleProviderUnavailableReason(provider: 'copilot' | 'claude'): string | undefined {
  return provider === 'claude' ? CLAUDE_SCHEDULE_UNAVAILABLE_REASON : undefined
}

export function isValidScheduleTimezone(timezone: string): boolean {
  if (!timezone || timezone.trim() !== timezone || /^[+-]/.test(timezone)) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export const scheduleTimezoneSchema = z.string()
  .refine(isValidScheduleTimezone, 'Timezone must be a supported IANA time zone')
  .default(DEFAULT_SCHEDULE_TIMEZONE)

const identifier = z.string().trim().min(1).max(200)
const timestamp = z.string().datetime({ offset: true })
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:mm (00:00–23:59)')
const windowEnd = z.string().regex(/^(?:(?:[01]\d|2[0-3]):[0-5]\d|24:00)$/, 'Window end must be HH:mm (00:00–24:00)')

const cronExpression = z.string().max(1000).superRefine((expression, context) => {
  try {
    parseCronExpression(expression)
  } catch (error) {
    context.addIssue({ code: 'custom', message: (error as Error).message })
  }
})

export const scheduleRecurrenceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('once'), at: timestamp }).strict(),
  z.object({
    type: z.literal('hourly'),
    everyHours: z.number().positive().max(24)
      .refine((hours) => {
        const minutes = hours * 60
        return Math.round(minutes) >= 1 &&
          Math.abs(minutes - Math.round(minutes)) <= Number.EPSILON * Math.max(1, minutes) * 4
      }, 'Hourly interval must be a whole number of minutes'),
    windowStart: time.optional(),
    windowEnd: windowEnd.optional(),
  }).strict(),
  z.object({ type: z.literal('daily'), time }).strict(),
  z.object({ type: z.literal('weekdays'), time }).strict(),
  z.object({
    type: z.literal('weekly'),
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7)
      .refine((days) => new Set(days).size === days.length, 'Weekly days must not contain duplicates'),
    time,
  }).strict(),
  z.object({ type: z.literal('cron'), expression: cronExpression }).strict(),
])

export const scheduleTargetSchema = z.object({
  computerId: identifier,
  folder: z.string().min(1).max(4096).refine((folder) => folder.trim().length > 0, 'Folder must not be blank'),
  provider: z.enum(['copilot', 'claude']),
  model: z.string().trim().min(1).max(200).optional(),
  effort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  context: z.enum(['default', 'long_context']).optional(),
  mode: z.enum(['interactive', 'plan', 'autopilot']).default('autopilot'),
  permissionPolicy: z.enum(['ask', 'allow-all']).default('ask'),
  folderTrust: z.enum(['ask', 'auto-approve']).default('ask'),
  worktreeRoot: z.string().min(1).max(4096).optional(),
}).strict()

export const scheduleSchema = z.object({
  id: identifier,
  name: z.string().trim().min(1).max(200),
  prompt: z.string().min(1).max(SCHEDULE_PROMPT_MAX_LENGTH)
    .refine((prompt) => prompt.trim().length > 0, 'Prompt must not be blank'),
  target: scheduleTargetSchema,
  workspace: z.enum(['checkout', 'worktree']),
  recurrence: scheduleRecurrenceSchema,
  timezone: scheduleTimezoneSchema,
  catchUp: z.enum(['skip', 'once']),
  overlap: z.enum(['skip', 'queue', 'replace']),
  maxRuntimeMin: z.number().int().min(5).max(480),
  notify: z.enum(['always', 'attention', 'never']),
  enabled: z.boolean(),
  archived: z.boolean(),
  createdBy: z.enum(['user', 'oracle']),
  revision: z.number().int().min(1),
  createdAt: timestamp,
  updatedAt: timestamp,
}).strict()

export const scheduleRunStatusSchema = z.enum([
  'pending', 'launching', 'running', 'needs-input', 'stopping',
  'succeeded', 'failed', 'stopped', 'missed', 'interrupted',
])

export const scheduleRunSchema = z.object({
  id: identifier,
  scheduleId: identifier,
  occurrenceAt: timestamp,
  trigger: z.enum(['schedule', 'manual', 'catch-up']),
  status: scheduleRunStatusSchema,
  launchId: launchIdentitySchema,
  rootPromptReceipt: launchIdentitySchema.optional(),
  rootPromptAcceptance: promptAcceptanceReceiptSchema.optional(),
  worktree: scheduleWorktreeRecordSchema.optional(),
  worktreeIntent: scheduleWorktreeInputSchema.optional(),
  sessionId: identifier.optional(),
  computerId: identifier,
  createdAt: timestamp.optional(),
  retryUntil: timestamp.optional(),
  startedAt: timestamp.optional(),
  endedAt: timestamp.optional(),
  summary: z.string().optional(),
  error: z.string().optional(),
  outcomeUnknown: z.boolean().optional(),
  abandonedAt: timestamp.optional(),
}).strict()

export const scheduleCreateSchema = scheduleSchema.omit({
  id: true, revision: true, createdAt: true, updatedAt: true, createdBy: true, archived: true,
}).extend({
  workspace: scheduleSchema.shape.workspace.default('checkout'),
  catchUp: scheduleSchema.shape.catchUp.default('skip'),
  overlap: scheduleSchema.shape.overlap.default('skip'),
  maxRuntimeMin: scheduleSchema.shape.maxRuntimeMin.default(60),
  notify: scheduleSchema.shape.notify.default('attention'),
  enabled: z.boolean().default(true),
})
export const scheduleUpdateSchema = scheduleSchema.omit({
  id: true, revision: true, createdAt: true, updatedAt: true, createdBy: true, archived: true,
}).extend({ timezone: scheduleTimezoneSchema.removeDefault() }).partial().extend({
  revision: z.number().int().min(1),
}).strict()
export const scheduleRevisionSchema = z.object({ revision: z.number().int().min(1) }).strict()
export const scheduleActionSchema = z.object({}).strict()
export const scheduleAbandonSchema = z.object({ confirm: z.literal(true) }).strict()
export const scheduleEnabledSchema = scheduleRevisionSchema.extend({ enabled: z.boolean() }).strict()
export const scheduleArchivedSchema = scheduleRevisionSchema.extend({ archived: z.boolean() }).strict()
export const scheduleIdParamsSchema = z.object({ id: identifier }).strict()
export const scheduleRunListSchema = z.object({
  offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  status: scheduleRunStatusSchema.optional(),
}).strict()
export const scheduleListSchema = z.object({
  archived: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
}).strict()

export interface SchedulerChanged {
  type: 'schedules.changed'
  revision: number
  scheduleId: string
  runId?: string
  runIds?: string[]
}

export type ScheduleCreate = z.input<typeof scheduleCreateSchema>
export type ScheduleUpdate = z.input<typeof scheduleUpdateSchema>
export type ScheduleRunPage = z.infer<typeof scheduleRunListSchema>
export type ScheduleRecurrence = z.infer<typeof scheduleRecurrenceSchema>
export type ScheduleTarget = z.infer<typeof scheduleTargetSchema>
export type Schedule = z.infer<typeof scheduleSchema>
export type ScheduleRunStatus = z.infer<typeof scheduleRunStatusSchema>
export type ScheduleRun = z.infer<typeof scheduleRunSchema>
