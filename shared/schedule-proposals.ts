import { z } from 'zod'
import { scheduleCreateSchema, scheduleUpdateSchema } from './schedules.js'

const existing = {
  scheduleId: z.string().min(1).max(200),
  baseRevision: z.number().int().positive(),
}
const create = z.object({ operation: z.literal('create'), payload: scheduleCreateSchema }).strict()
const update = z.object({ operation: z.literal('update'), ...existing, payload: scheduleUpdateSchema.omit({ revision: true }) }).strict()
const action = z.object({ operation: z.enum(['enable', 'disable', 'run-now', 'archive']), ...existing, payload: z.object({}).strict() }).strict()
export const scheduleProposalInputSchema = z.discriminatedUnion('operation', [create, update, action])
const metadata = {
  id: z.string().min(1).max(200),
  createdBy: z.literal('oracle'),
  createdAt: z.string().datetime({ offset: true }),
  expiresAt: z.string().datetime({ offset: true }),
  status: z.enum(['pending', 'approved', 'rejected', 'expired', 'applied', 'failed']),
  error: z.string().max(2000).optional(),
  appliedScheduleId: z.string().optional(),
  appliedRunId: z.string().optional(),
}
export const scheduleProposalSchema = z.discriminatedUnion('operation', [
  create.extend(metadata), update.extend(metadata), action.extend(metadata),
])
export type ScheduleProposalInput = z.input<typeof scheduleProposalInputSchema>
export type ScheduleProposal = z.infer<typeof scheduleProposalSchema>
export interface ScheduleProposalsChanged {
  type: 'schedule-proposals.changed'
  revision: number
  proposalId: string
}

export function scheduleProposalSummary(proposal: ScheduleProposal): string {
  const { operation, payload } = proposal
  if (operation === 'create') return `Create “${payload.name}” on ${payload.target.computerId} · ${payload.target.permissionPolicy}`
  return `${operation === 'run-now' ? 'Run now' : operation[0].toUpperCase() + operation.slice(1)} schedule ${proposal.scheduleId} · revision ${proposal.baseRevision}`
}
