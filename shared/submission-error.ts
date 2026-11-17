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

export function terminalDraftConflictFromError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      Reflect.get(error, 'terminalDraftConflict') === true,
  )
}

const legacyDefinitiveHttpRefusals = new Set([
  400, 401, 403, 404, 405, 410, 413, 415, 422, 429,
])

export function httpDeliveryUncertain(
  statusCode: number,
  explicit: unknown,
  submission?: SubmissionReceipt,
  // Statuses this endpoint only answers with before anything is handed over.
  // The conservative default below is for peers that say nothing, and it is
  // wrong for a route that reports doubt in its body rather than its status.
  definiteStatuses?: ReadonlySet<number>,
): boolean {
  if (typeof explicit === 'boolean') return explicit
  if (submission?.accepted) return true
  if (definiteStatuses?.has(statusCode)) return false
  // Older runtimes did not serialize uncertainty. Their HTTP 409 covered both
  // preflight conflicts and failures after native paste, so absence must stay
  // conservative until the peer sends an explicit value.
  return !legacyDefinitiveHttpRefusals.has(statusCode)
}

export class SubmissionError extends Error {
  readonly statusCode: number
  readonly code?: string
  readonly submission?: SubmissionReceipt
  readonly uncertainDelivery: boolean
  readonly terminalDraftConflict: boolean

  constructor(
    message: string,
    statusCode: number,
    submission?: SubmissionReceipt,
    options?: ErrorOptions & {
      code?: string
      terminalDraftConflict?: boolean
      uncertainDelivery?: boolean
    },
  ) {
    super(message, options)
    this.name = 'SubmissionError'
    this.statusCode = statusCode
    this.code = options?.code
    this.submission = submission
    this.uncertainDelivery = options?.uncertainDelivery ?? submission?.accepted === true
    this.terminalDraftConflict = options?.terminalDraftConflict === true
  }
}
