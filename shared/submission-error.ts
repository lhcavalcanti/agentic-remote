export interface SubmissionReceipt {
  sessionId: string
  failedAt?: string
  accepted: boolean
}

export function parseSubmissionReceipt(value: unknown): SubmissionReceipt | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const { sessionId, failedAt, accepted } = value as Record<string, unknown>
  if (
    typeof sessionId !== 'string' || !sessionId || sessionId.length > 512 ||
    typeof accepted !== 'boolean' ||
    (failedAt !== undefined && (typeof failedAt !== 'string' || !failedAt || failedAt.length > 64)) ||
    (!accepted && failedAt === undefined)
  ) return undefined
  return { sessionId, accepted, ...(typeof failedAt === 'string' ? { failedAt } : {}) }
}

export function submissionReceiptFromError(error: unknown): SubmissionReceipt | undefined {
  return error && typeof error === 'object'
    ? parseSubmissionReceipt(Reflect.get(error, 'submission'))
    : undefined
}

export class SubmissionError extends Error {
  readonly statusCode: number
  readonly submission?: SubmissionReceipt
  readonly uncertainDelivery: boolean

  constructor(
    message: string,
    statusCode: number,
    submission?: SubmissionReceipt,
    options?: ErrorOptions & { uncertainDelivery?: boolean },
  ) {
    super(message, options)
    this.name = 'SubmissionError'
    this.statusCode = statusCode
    this.submission = submission
    this.uncertainDelivery = options?.uncertainDelivery ?? submission?.accepted === true
  }
}
