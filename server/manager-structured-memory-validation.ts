import path from 'node:path'
import { createHash } from 'node:crypto'
import { z } from 'zod'
import {
  MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS,
  MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES,
  MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS,
  MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS,
  MANAGER_STRUCTURED_MEMORY_MAX_RECORDS,
  MANAGER_STRUCTURED_MEMORY_MAX_REQUEST_ID_CHARS,
  MANAGER_STRUCTURED_MEMORY_MAX_RESULTS,
  MANAGER_STRUCTURED_MEMORY_MAX_TOMBSTONES,
  type ManagerStructuredMemoryCorrectInput,
  type ManagerStructuredMemoryForgetInput,
  type ManagerStructuredMemoryImportInput,
  type ManagerStructuredMemoryRememberInput,
  type ManagerStructuredMemorySearchInput,
  type ManagerStructuredMemoryState,
} from '../shared/manager-structured-memory.js'

export type ManagerStructuredMemoryValidationReason =
  | 'malformed'
  | 'malformed_unicode'
  | 'oversized'
  | 'personal_data'
  | 'secret'
  | 'sensitive_path'
  | 'unsupported_version'

const validationMessages: Record<
  ManagerStructuredMemoryValidationReason,
  string
> = {
  malformed: 'Structured memory input is malformed.',
  malformed_unicode: 'Structured memory input contains unsupported characters.',
  oversized: 'Structured memory input exceeds the allowed size.',
  personal_data: 'Structured memory cannot store this type of personal data.',
  secret: 'Structured memory cannot store credentials or secret-like values.',
  sensitive_path: 'Structured memory cannot store sensitive paths.',
  unsupported_version: 'Structured memory uses an unsupported schema version.',
}

export class ManagerStructuredMemoryValidationError extends Error {
  readonly statusCode: number

  constructor(readonly reason: ManagerStructuredMemoryValidationReason) {
    super(validationMessages[reason])
    this.name = 'ManagerStructuredMemoryValidationError'
    this.statusCode =
      reason === 'oversized' ? 413 : reason === 'unsupported_version' ? 409 : 400
  }
}

const identifierSchema = z.string().trim().min(1).max(200)
const uuidSchema = z.string().uuid()
const digestSchema = z.string().regex(/^[0-9a-f]{64}$/)
const timestampSchema = z.iso.datetime({ offset: true })

const scopeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('global') }).strict(),
  z.object({ type: z.literal('user') }).strict(),
  z.object({
    type: z.literal('computer'),
    computerId: identifierSchema,
  }).strict(),
  z.object({
    type: z.literal('project'),
    computerId: identifierSchema,
    projectRoot: z.string().trim().min(1).max(4_096)
      .refine((value) => path.isAbsolute(value), 'Project root must be absolute')
      .transform((value) => path.resolve(value)),
  }).strict(),
  z.object({
    type: z.literal('session'),
    computerId: identifierSchema,
    sessionId: identifierSchema,
  }).strict(),
])

const sourceSessionSchema = z.object({
  computerId: identifierSchema,
  sessionId: identifierSchema,
}).strict()

const requestIdSchema = z.string().trim().min(1).max(
  MANAGER_STRUCTURED_MEMORY_MAX_REQUEST_ID_CHARS,
)
const kindSchema = z.enum([
  'preference',
  'fact',
  'procedure',
  'decision',
  'outcome',
])
const canonicalKeySchema = z.string().trim().min(1)
  .max(MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS)
  .transform((value) =>
    value.normalize('NFKC').replace(/\s+/g, ' ').toLocaleLowerCase('en-US'))
const contentSchema = z.string().trim().min(1)
  .max(MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS)
  .transform((value) => value.normalize('NFKC'))
const memoryValueFields = {
  kind: z.enum(['preference', 'fact', 'procedure', 'decision', 'outcome']),
  canonicalKey: canonicalKeySchema,
  content: contentSchema,
  scope: scopeSchema,
  confidence: z.number().finite().min(0).max(1).optional(),
  validFrom: timestampSchema.optional(),
  validUntil: timestampSchema.optional(),
  sourceSession: sourceSessionSchema.optional(),
  sourceManagerMessageId: identifierSchema.optional(),
}
function validityIsOrdered({
  validFrom,
  validUntil,
}: {
  validFrom?: string
  validUntil?: string
}): boolean {
  return !validFrom || !validUntil || Date.parse(validFrom) < Date.parse(validUntil)
}
const rememberSchema = z.object({
  requestId: requestIdSchema,
  ...memoryValueFields,
}).strict().refine(
  validityIsOrdered,
  'The validity end must be later than its start',
)
const correctSchema = z.object({
  requestId: requestIdSchema,
  recordId: uuidSchema,
  ...memoryValueFields,
}).strict().refine(
  validityIsOrdered,
  'The validity end must be later than its start',
)
const forgetSchema = z.object({
  requestId: requestIdSchema,
  recordId: uuidSchema,
  sourceManagerMessageId: identifierSchema.optional(),
}).strict()
const searchSchema = z.object({
  query: z.string().trim().max(1_000)
    .transform((value) => value.normalize('NFKC')),
  scopes: z.array(scopeSchema).min(1).max(16),
  limit: z.number().int().min(1).max(MANAGER_STRUCTURED_MEMORY_MAX_RESULTS)
    .optional(),
  at: timestampSchema.optional(),
}).strict().refine(
  ({ scopes }) =>
    new Set(scopes.map((scope) => JSON.stringify(scope))).size === scopes.length,
  'Search scopes must be unique',
)

const persistedScopeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('global') }).strict(),
  z.object({ type: z.literal('user') }).strict(),
  z.object({
    type: z.literal('computer'),
    computerId: identifierSchema,
  }).strict(),
  z.object({
    type: z.literal('project'),
    computerId: identifierSchema,
    projectRoot: z.string().min(1).max(4_096)
      .refine((value) =>
        path.isAbsolute(value) && path.resolve(value) === value,
      'Persisted project roots must be normalized absolute paths'),
  }).strict(),
  z.object({
    type: z.literal('session'),
    computerId: identifierSchema,
    sessionId: identifierSchema,
  }).strict(),
])

const provenanceSchema = z.object({
  origin: z.enum(['direct-user', 'policy', 'session', 'import']),
  requestId: requestIdSchema,
  sourceDigest: digestSchema,
  sourceSession: sourceSessionSchema.optional(),
  sourceManagerMessageId: identifierSchema.optional(),
}).strict()
const persistedCanonicalKeySchema = z.string().min(1)
  .max(MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS)
  .refine((value) =>
    canonicalKeySchema.parse(value) === value,
  'Persisted canonical keys must be normalized')
const persistedContentSchema = z.string().min(1)
  .max(MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS)
  .refine((value) => value.normalize('NFKC') === value && value.trim() === value)
const recordSchema = z.object({
  schemaVersion: z.literal(1),
  id: uuidSchema,
  kind: kindSchema,
  canonicalKey: persistedCanonicalKeySchema,
  content: persistedContentSchema,
  scope: persistedScopeSchema,
  provenance: provenanceSchema,
  authority: z.enum([
    'direct-user-correction',
    'direct-user',
    'policy-authorized',
    'verified-outcome',
    'session-derived',
    'inference',
  ]),
  confidence: z.number().finite().min(0).max(1),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  validFrom: timestampSchema.optional(),
  validUntil: timestampSchema.optional(),
  supersedesId: uuidSchema.optional(),
  supersededById: uuidSchema.optional(),
}).strict().refine(
  ({ validFrom, validUntil }) =>
    !validFrom || !validUntil || Date.parse(validFrom) < Date.parse(validUntil),
  'The validity end must be later than its start',
)
const tombstoneSchema = z.object({
  schemaVersion: z.literal(1),
  recordId: uuidSchema,
  scope: persistedScopeSchema,
  canonicalKey: persistedCanonicalKeySchema,
  contentDigest: digestSchema,
  sourceDigest: digestSchema,
  requestId: requestIdSchema,
  deletedAt: timestampSchema,
  sourceManagerMessageId: identifierSchema.optional(),
}).strict()
const operationSchema = z.enum(['remember', 'correct', 'forget', 'import'])
const auditSchema = z.object({
  id: uuidSchema,
  operation: operationSchema,
  requestId: requestIdSchema,
  recordId: uuidSchema.optional(),
  occurredAt: timestampSchema,
  outcome: z.enum(['applied', 'duplicate']),
}).strict()
const appliedRequestSchema = z.object({
  requestId: requestIdSchema,
  operation: operationSchema,
  recordId: uuidSchema.optional(),
  revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  appliedAt: timestampSchema,
}).strict()
const stateSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  records: z.array(recordSchema).max(MANAGER_STRUCTURED_MEMORY_MAX_RECORDS),
  tombstones: z.array(tombstoneSchema)
    .max(MANAGER_STRUCTURED_MEMORY_MAX_TOMBSTONES),
  audit: z.array(auditSchema).max(MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES),
  appliedRequests: z.array(appliedRequestSchema)
    .max(MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS),
}).strict().refine(
  ({ records }) => new Set(records.map(({ id }) => id)).size === records.length,
  'Structured memory record IDs must be unique',
).refine(
  ({ tombstones }) =>
    new Set(tombstones.map(({ recordId }) => recordId)).size === tombstones.length,
  'Structured memory tombstones must be unique',
).refine(
  ({ audit }) => new Set(audit.map(({ id }) => id)).size === audit.length,
  'Structured memory audit IDs must be unique',
).refine(
  ({ appliedRequests }) =>
    new Set(appliedRequests.map(({ requestId }) => requestId)).size ===
      appliedRequests.length,
  'Structured memory request IDs must be unique',
)

const tokenPrefixPattern =
  /\b(?:gh[pousr]_|github_pat_|sk-(?:proj-)?|AKIA|ASIA|xox[baprs]-|glpat-|npm_)[A-Za-z0-9_-]{12,}\b/i
const bearerPattern = /\bbearer\s+[A-Za-z0-9._~+/=-]{12,}/i
const jwtPattern = /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/
const privateKeyPattern = /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/
const credentialAssignmentPattern =
  /\b(?:password|passwd|pwd|secret|token|api[_-]?key|client[_-]?secret)\s*[:=]\s*[^\s,;]{6,}/i
const credentialUrlPattern = /\b[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^@\s/]+@/i
const sensitivePathPattern =
  /(?:^|[/\\~])\.(?:ssh|aws|gnupg|env)(?:[/\\]|$)|(?:^|[/\\])(?:keychains?|credential(?:s| stores?)?|browser profiles?|login data)(?:[/\\]|$)/i
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const phonePattern = /(?:^|\D)(?:\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]\d{3}[\s.-]\d{4}(?:\D|$)/
const governmentIdPattern = /\b\d{3}-\d{2}-\d{4}\b/

function stringsIn(value: unknown): string[] {
  const strings: string[] = []
  const pending: Array<{ value: unknown; depth: number }> = [{
    value,
    depth: 0,
  }]
  const seen = new WeakSet<object>()
  let visited = 0
  while (pending.length > 0) {
    const current = pending.pop()!
    visited += 1
    if (visited > 500_000 || current.depth > 64) {
      throw new ManagerStructuredMemoryValidationError('oversized')
    }
    if (typeof current.value === 'string') {
      strings.push(current.value)
      continue
    }
    if (!current.value || typeof current.value !== 'object') continue
    if (seen.has(current.value)) continue
    seen.add(current.value)
    for (const nested of Object.values(current.value)) {
      pending.push({ value: nested, depth: current.depth + 1 })
    }
  }
  return strings
}

function hasMalformedUnicode(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) {
      return true
    }
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (next < 0xdc00 || next > 0xdfff) return true
      index += 1
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true
    }
  }
  return false
}

function shannonEntropy(value: string): number {
  const counts = new Map<string, number>()
  for (const character of value) {
    counts.set(character, (counts.get(character) ?? 0) + 1)
  }
  let entropy = 0
  for (const count of counts.values()) {
    const probability = count / value.length
    entropy -= probability * Math.log2(probability)
  }
  return entropy
}

function hasHighEntropySecret(value: string): boolean {
  const candidates = value.match(/[A-Za-z0-9_+/=-]{40,}/g) ?? []
  return candidates.some((candidate) => {
    if (/^[0-9a-f]{40}$/i.test(candidate)) return false
    const classes = [
      /[a-z]/.test(candidate),
      /[A-Z]/.test(candidate),
      /\d/.test(candidate),
      /[_+/=-]/.test(candidate),
    ].filter(Boolean).length
    return classes >= 3 && shannonEntropy(candidate) >= 4
  })
}

function looksLikePaymentCard(value: string): boolean {
  const candidates = value.match(/(?:\d[ -]?){13,19}/g) ?? []
  return candidates.some((candidate) => {
    const digits = candidate.replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19) return false
    let sum = 0
    let double = false
    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index])
      if (double) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      double = !double
    }
    return sum % 10 === 0
  })
}

function validateRawSafety(input: unknown): void {
  const strings = stringsIn(input)
  if (strings.some(hasMalformedUnicode)) {
    throw new ManagerStructuredMemoryValidationError('malformed_unicode')
  }
  if (
    strings.some((value) => value.length > 8_192) ||
    (typeof input === 'object' && input !== null &&
      typeof (input as { content?: unknown }).content === 'string' &&
      (input as { content: string }).content.length >
        MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS)
  ) {
    throw new ManagerStructuredMemoryValidationError('oversized')
  }
}

function validatePrivateContent(input: unknown): void {
  const strings = stringsIn(input)
  if (strings.some((value) =>
    tokenPrefixPattern.test(value) ||
    bearerPattern.test(value) ||
    jwtPattern.test(value) ||
    privateKeyPattern.test(value) ||
    credentialAssignmentPattern.test(value) ||
    credentialUrlPattern.test(value) ||
    hasHighEntropySecret(value)
  )) {
    throw new ManagerStructuredMemoryValidationError('secret')
  }
  if (strings.some((value) => sensitivePathPattern.test(value))) {
    throw new ManagerStructuredMemoryValidationError('sensitive_path')
  }
  if (strings.some((value) =>
    emailPattern.test(value) ||
    phonePattern.test(value) ||
    governmentIdPattern.test(value) ||
    looksLikePaymentCard(value)
  )) {
    throw new ManagerStructuredMemoryValidationError('personal_data')
  }
}

function selectedFields(
  input: unknown,
  fields: string[],
): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  const object = input as Record<string, unknown>
  return Object.fromEntries(
    fields
      .filter((field) => field in object)
      .map((field) => [field, object[field]]),
  )
}

function persistedPrivateContent(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  const state = input as {
    records?: unknown
    tombstones?: unknown
  }
  return {
    records: Array.isArray(state.records)
      ? state.records.map((record) =>
          selectedFields(record, ['canonicalKey', 'content', 'scope']))
      : state.records,
    tombstones: Array.isArray(state.tombstones)
      ? state.tombstones.map((tombstone) =>
          selectedFields(tombstone, ['canonicalKey', 'scope']))
      : state.tombstones,
  }
}

function validateWithSchema<T>(
  input: unknown,
  schema: z.ZodType<T>,
  privateContent: unknown = input,
): T {
  validateRawSafety(input)
  validatePrivateContent(privateContent)
  const result = schema.safeParse(input)
  if (!result.success) {
    const oversized = result.error.issues.some((issue) => issue.code === 'too_big')
    throw new ManagerStructuredMemoryValidationError(
      oversized ? 'oversized' : 'malformed',
    )
  }
  return result.data
}

export function validateStructuredMemoryRemember(
  input: unknown,
): ManagerStructuredMemoryRememberInput {
  return validateWithSchema(
    input,
    rememberSchema,
    selectedFields(input, ['canonicalKey', 'content', 'scope']),
  )
}

export function validateStructuredMemoryCorrect(
  input: unknown,
): ManagerStructuredMemoryCorrectInput {
  return validateWithSchema(
    input,
    correctSchema,
    selectedFields(input, ['canonicalKey', 'content', 'scope']),
  )
}

export function validateStructuredMemoryForget(
  input: unknown,
): ManagerStructuredMemoryForgetInput {
  return validateWithSchema(input, forgetSchema, {})
}

export function validateStructuredMemorySearch(
  input: unknown,
): ManagerStructuredMemorySearchInput {
  return validateWithSchema(
    input,
    searchSchema,
    selectedFields(input, ['query', 'scopes']),
  )
}

export function validateStructuredMemoryState(
  input: unknown,
): ManagerStructuredMemoryState {
  if (
    typeof input === 'object' &&
    input !== null &&
    'version' in input &&
    (input as { version?: unknown }).version !== 1
  ) {
    throw new ManagerStructuredMemoryValidationError('unsupported_version')
  }
  const state = validateWithSchema(
    input,
    stateSchema,
    persistedPrivateContent(input),
  )
  const records = new Map(state.records.map((record) => [record.id, record]))
  const sameScope = (
    left: ManagerStructuredMemoryState['records'][number]['scope'],
    right: ManagerStructuredMemoryState['records'][number]['scope'],
  ) => JSON.stringify(left) === JSON.stringify(right)
  const contentDigest = (content: string) =>
    createHash('sha256').update(JSON.stringify(content)).digest('hex')
  const authorityOrigin = {
    'direct-user-correction': 'direct-user',
    'direct-user': 'direct-user',
    'policy-authorized': 'policy',
    'verified-outcome': 'session',
    'session-derived': 'session',
    inference: 'import',
  } as const

  for (const record of state.records) {
    if (record.provenance.origin !== authorityOrigin[record.authority]) {
      throw new ManagerStructuredMemoryValidationError('malformed')
    }
    if (
      record.provenance.origin === 'session' &&
      !record.provenance.sourceSession
    ) {
      throw new ManagerStructuredMemoryValidationError('malformed')
    }
    if (
      record.scope.type === 'global' &&
      (
        record.authority !== 'policy-authorized' ||
        record.provenance.origin !== 'policy'
      )
    ) {
      throw new ManagerStructuredMemoryValidationError('malformed')
    }
    if (record.supersedesId) {
      const previous = records.get(record.supersedesId)
      if (
        !previous ||
        previous.id === record.id ||
        previous.supersededById !== record.id
      ) {
        throw new ManagerStructuredMemoryValidationError('malformed')
      }
    }
    if (record.supersededById) {
      const replacement = records.get(record.supersededById)
      if (
        !replacement ||
        replacement.id === record.id ||
        replacement.supersedesId !== record.id
      ) {
        throw new ManagerStructuredMemoryValidationError('malformed')
      }
    }
  }

  for (const tombstone of state.tombstones) {
    const record = records.get(tombstone.recordId)
    if (
      !record ||
      tombstone.canonicalKey !== record.canonicalKey ||
      !sameScope(tombstone.scope, record.scope) ||
      tombstone.contentDigest !== contentDigest(record.content) ||
      tombstone.sourceDigest !== record.provenance.sourceDigest
    ) {
      throw new ManagerStructuredMemoryValidationError('malformed')
    }
    if (state.records.some((candidate) =>
      candidate.id !== record.id &&
      candidate.supersededById === undefined &&
      candidate.canonicalKey === tombstone.canonicalKey &&
      sameScope(candidate.scope, tombstone.scope) &&
      contentDigest(candidate.content) === tombstone.contentDigest)) {
      throw new ManagerStructuredMemoryValidationError('malformed')
    }
  }
  return state
}

export function validateStructuredMemoryImport(
  requestId: unknown,
  state: unknown,
): ManagerStructuredMemoryImportInput {
  const request = validateWithSchema(
    { requestId },
    z.object({ requestId: requestIdSchema }).strict(),
    {},
  )
  return {
    requestId: request.requestId,
    state: validateStructuredMemoryState(state),
  }
}
