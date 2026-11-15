import { z } from 'zod'
import type { SessionStatus } from './contracts.js'

/** Opaque tokens, not paths, titles, or user content. Never trim identity. */
export const launchIdentitySchema = z.string().min(1).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/)
export const cancellationAckSchema = z.object({
  timeoutMs: z.number().int().min(0).max(30_000).default(10_000),
})

export interface PromptAcceptanceReceipt {
  deliveryId: string
  sessionId: string
  acceptedAt: string
  /** Confirmed provider handoff, distinct from durable FIFO acceptance. */
  handedAt?: string
  state: 'accepted' | 'queued' | 'delivered' | 'rejected'
  promptId: string
  rootTurnId?: string
  userMessageId?: string
  outcome?: 'succeeded' | 'failed' | 'stopped' | 'unknown'
}

export interface LaunchReconciliation {
  launchId: string
  sessionId: string
  sessionStatus?: SessionStatus
  /** A deleted session's identity remains reserved; it must not be relaunched. */
  deleted?: boolean
  stopping?: boolean
  receipts: PromptAcceptanceReceipt[]
  termination?: TerminationAcknowledgement
}

export interface TerminationAcknowledgement {
  sessionId: string
  outcome: 'stopped' | 'unknown'
  checkedAt: string
  /** Only work owned and observable through the provider is in scope. */
  scope: 'provider-owned'
  reason?: string
}

const timestampSchema = z.string().refine((value) => Number.isFinite(Date.parse(value)))
export const promptAcceptanceReceiptSchema: z.ZodType<PromptAcceptanceReceipt> = z.object({
  deliveryId: launchIdentitySchema,
  sessionId: z.string().min(1),
  acceptedAt: timestampSchema,
  handedAt: timestampSchema.optional(),
  state: z.enum(['accepted', 'queued', 'delivered', 'rejected']),
  promptId: z.string().min(1),
  rootTurnId: z.string().min(1).optional(),
  userMessageId: z.string().min(1).optional(),
  outcome: z.enum(['succeeded', 'failed', 'stopped', 'unknown']).optional(),
})
export const terminationAcknowledgementSchema: z.ZodType<TerminationAcknowledgement> = z.object({
  sessionId: z.string().min(1),
  outcome: z.enum(['stopped', 'unknown']),
  checkedAt: timestampSchema,
  scope: z.literal('provider-owned'),
  reason: z.string().optional(),
})
export const launchReconciliationSchema: z.ZodType<LaunchReconciliation> = z.object({
  launchId: launchIdentitySchema,
  sessionId: z.string().min(1),
  sessionStatus: z.enum(['idle', 'running', 'waiting', 'error']).optional(),
  deleted: z.boolean().optional(),
  stopping: z.boolean().optional(),
  receipts: z.array(promptAcceptanceReceiptSchema),
  termination: terminationAcknowledgementSchema.optional(),
})
