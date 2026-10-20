import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

/**
 * Counts user-facing refusals by route template, method, status, and a stable
 * reason code, so a refusal that fires falsely is visible without a report.
 *
 * Only those four fields are ever kept or logged. Message text, prompts,
 * paths, ids, query strings, headers, and client addresses never are.
 */

export interface RefusalKey {
  route: string
  method: string
  status: number
  reason: string
}

export interface RefusalEntry extends RefusalKey {
  count: number
  firstAt: string
  lastAt: string
}

export interface RefusalSnapshot {
  since: string
  refusals: RefusalEntry[]
}

export const DEFAULT_MAX_REFUSAL_KEYS = 256

/** Where refusals land once the distinct-key bound is reached. */
export const REFUSAL_OVERFLOW: RefusalKey = Object.freeze({
  route: 'other',
  method: 'other',
  status: 0,
  reason: 'other',
})

const overflowId = keyId(REFUSAL_OVERFLOW)

function keyId({ route, method, status, reason }: RefusalKey): string {
  return JSON.stringify([route, method, status, reason])
}

export class RefusalCounter {
  private readonly entries = new Map<string, RefusalEntry>()
  private readonly maxKeys: number
  private readonly now: () => Date
  readonly since: string

  constructor(options: { maxKeys?: number; now?: () => Date; since?: Date } = {}) {
    this.maxKeys = Math.max(1, options.maxKeys ?? DEFAULT_MAX_REFUSAL_KEYS)
    this.now = options.now ?? (() => new Date())
    this.since = (options.since ?? this.now()).toISOString()
  }

  record(key: RefusalKey): void {
    const at = this.now().toISOString()
    let id = keyId(key)
    let source: RefusalKey = key
    // The overflow bucket takes the last slot, so the total stays at maxKeys.
    if (!this.entries.has(id) && this.entries.size >= this.maxKeys - 1) {
      id = overflowId
      source = REFUSAL_OVERFLOW
    }
    const entry = this.entries.get(id)
    if (entry) {
      entry.count += 1
      entry.lastAt = at
      return
    }
    this.entries.set(id, {
      route: source.route,
      method: source.method,
      status: source.status,
      reason: source.reason,
      count: 1,
      firstAt: at,
      lastAt: at,
    })
  }

  snapshot(): RefusalSnapshot {
    const refusals = [...this.entries.values()]
      .map((entry) => ({ ...entry }))
      .sort((left, right) =>
        right.count - left.count ||
        left.route.localeCompare(right.route) ||
        left.method.localeCompare(right.method) ||
        left.status - right.status ||
        left.reason.localeCompare(right.reason))
    return { since: this.since, refusals }
  }
}

/**
 * A refusal is a 4xx answer from a matched route. An unmatched route has no
 * template, and a 401 or 403 that names no reason is a direct reply from the
 * node-token or Host/Origin check: both are mostly scanner noise rather than
 * a user being turned away. A 401 or 403 a route raised, such as a path
 * outside the session folder, names its reason and is counted.
 */
export function countsAsRefusal(
  status: number,
  route: string | undefined,
  reasonNoted: boolean,
): boolean {
  if (status < 400 || status >= 500 || !route) return false
  return reasonNoted || (status !== 401 && status !== 403)
}

const reasonPattern = /^[A-Za-z0-9_.:-]{1,64}$/

function safeReason(value: unknown): string | undefined {
  return typeof value === 'string' && reasonPattern.test(value) ? value : undefined
}

export function httpRefusalReason(status: number): string {
  return `http-${status}`
}

const MAX_CAUSE_DEPTH = 4

/** The first safe `reasonCode` on an error or, for a wrapper, its causes. */
function reasonCodeFromChain(error: object): string | undefined {
  let current: unknown = error
  for (let depth = 0; depth <= MAX_CAUSE_DEPTH; depth += 1) {
    if (typeof current !== 'object' || current === null) return undefined
    const reasonCode = safeReason(Reflect.get(current, 'reasonCode'))
    if (reasonCode) return reasonCode
    current = Reflect.get(current, 'cause')
  }
  return undefined
}

/**
 * A stable reason for an error: its `reasonCode` or that of an error it wraps,
 * Fastify's error code, or its class name. A plain `Error` says nothing a
 * status does not, so it reports as `http-<status>`.
 */
export function refusalReasonFromError(error: unknown, status: number): string {
  if (error instanceof z.ZodError) return 'validation'
  if (typeof error !== 'object' || error === null) return httpRefusalReason(status)
  const reasonCode = reasonCodeFromChain(error)
  if (reasonCode) return reasonCode
  const name = safeReason(Reflect.get(error, 'name'))
  if (name === 'FastifyError') {
    const code = safeReason(Reflect.get(error, 'code'))
    if (code) return code
  }
  if (name && name !== 'Error') return name
  return httpRefusalReason(status)
}

const notedReasons = new WeakMap<FastifyRequest, string>()

/**
 * Names the reason for a refusal this request is about to send. Routes that
 * reply with a 4xx directly may call it; otherwise the reason is `http-<status>`.
 */
export function noteRefusalReason(request: FastifyRequest, reason: string): void {
  const safe = safeReason(reason)
  if (safe) notedReasons.set(request, safe)
}

/**
 * Counts every refusal the app sends. Register before any route plugin so
 * encapsulated plugins inherit the hook.
 */
export function registerRefusalMetrics(app: FastifyInstance, counter: RefusalCounter): void {
  app.addHook('onResponse', async (request, reply) => {
    const status = reply.statusCode
    const route = request.routeOptions.url
    const noted = notedReasons.get(request)
    if (!countsAsRefusal(status, route, noted !== undefined)) return
    const key: RefusalKey = {
      route: route!,
      method: request.method,
      status,
      reason: noted ?? httpRefusalReason(status),
    }
    counter.record(key)
    // info, not warn: a refusal is a correct answer to the user, not a server
    // fault. The counts, not each line, are what show a refusal firing falsely.
    app.log.info({
      event: 'request.refused',
      route: key.route,
      method: key.method,
      status: key.status,
      reason: key.reason,
    })
  })
}
