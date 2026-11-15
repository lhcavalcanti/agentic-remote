import { z } from 'zod'
import { parseCronExpression } from './schedule-cron.js'
import { launchIdentitySchema } from './launch-identity.js'

export const DEFAULT_SCHEDULE_TIMEZONE = 'America/Los_Angeles'
export const SCHEDULE_PROMPT_MAX_LENGTH = 20_000
export const SCHEDULE_MIN_SPACING_MINUTES = 15

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
      .refine((hours) => Number.isInteger(hours * 60), 'Hourly interval must be a whole number of minutes'),
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
}).strict()

export const scheduleSchema = z.object({
  id: identifier,
  name: z.string().trim().min(1),
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
  sessionId: identifier.optional(),
  computerId: identifier,
  startedAt: timestamp.optional(),
  endedAt: timestamp.optional(),
  summary: z.string().optional(),
  error: z.string().optional(),
}).strict()

export type ScheduleRecurrence = z.infer<typeof scheduleRecurrenceSchema>
export type ScheduleTarget = z.infer<typeof scheduleTargetSchema>
export type Schedule = z.infer<typeof scheduleSchema>
export type ScheduleRunStatus = z.infer<typeof scheduleRunStatusSchema>
export type ScheduleRun = z.infer<typeof scheduleRunSchema>
