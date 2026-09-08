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

export function deliveryUncertaintyFromError(error: unknown): boolean | undefined {
  if (!error || typeof error !== 'object') return undefined
  const uncertain = Reflect.get(error, 'uncertainDelivery')
  return typeof uncertain === 'boolean' ? uncertain : undefined
}

const definitiveHttpRefusals = new Set([
  400, 401, 403, 404, 405, 409, 410, 413, 415, 422, 429,
])

export function httpDeliveryUncertain(
  statusCode: number,
  explicit: unknown,
  submission?: SubmissionReceipt,
): boolean {
  if (typeof explicit === 'boolean') return explicit
  if (submission?.accepted) return true
  return !definitiveHttpRefusals.has(statusCode)
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
