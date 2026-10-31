import { createHash, randomBytes as secureRandomBytes } from 'node:crypto'
import { isIP } from 'node:net'

export const DEFAULT_VOICE_TICKET_TTL_MS = 30_000
export const DEFAULT_MAX_VOICE_TICKETS = 64

export interface VoiceTicketClient {
  origin: string
  address: string
}

export interface ConsumedVoiceTicket {
  expiresAt: number
}

export interface IssuedVoiceTicket extends ConsumedVoiceTicket {
  ticket: string
}

interface VoiceTicketStoreOptions {
  ttlMs?: number
  maxOutstanding?: number
  now?: () => number
  randomBytes?: (size: number) => Buffer
}

interface StoredVoiceTicket extends ConsumedVoiceTicket {
  origin: string
  address: string
}

export class VoiceTicketStore {
  private readonly ttlMs: number
  private readonly maxOutstanding: number
  private readonly now: () => number
  private readonly randomBytes: (size: number) => Buffer
  private readonly outstanding = new Map<string, StoredVoiceTicket>()

  constructor(options: VoiceTicketStoreOptions = {}) {
    this.ttlMs = options.ttlMs ?? DEFAULT_VOICE_TICKET_TTL_MS
    this.maxOutstanding = options.maxOutstanding ?? DEFAULT_MAX_VOICE_TICKETS
    this.now = options.now ?? Date.now
    this.randomBytes = options.randomBytes ?? secureRandomBytes
    requirePositiveInteger(this.ttlMs, 'ttlMs')
    requirePositiveInteger(this.maxOutstanding, 'maxOutstanding')
    if (this.maxOutstanding > DEFAULT_MAX_VOICE_TICKETS) {
      throw new RangeError(
        `maxOutstanding must not exceed ${DEFAULT_MAX_VOICE_TICKETS}`,
      )
    }
  }

  issue(client: VoiceTicketClient): string {
    return this.issueWithExpiration(client).ticket
  }

  issueWithExpiration(client: VoiceTicketClient): IssuedVoiceTicket {
    const binding = normalizeClient(client)
    const now = this.now()
    this.prune(now)

    let ticket: string
    let hash: string
    do {
      ticket = this.randomBytes(32).toString('base64url')
      hash = ticketHash(ticket)
    } while (this.outstanding.has(hash))

    this.outstanding.set(hash, {
      ...binding,
      expiresAt: now + this.ttlMs,
    })
    while (this.outstanding.size > this.maxOutstanding) {
      const oldest = this.outstanding.keys().next().value
      if (oldest === undefined) break
      this.outstanding.delete(oldest)
    }
    return {
      ticket,
      expiresAt: now + this.ttlMs,
    }
  }

  consume(
    ticket: string,
    client: VoiceTicketClient,
  ): ConsumedVoiceTicket | undefined {
    const now = this.now()
    this.prune(now)
    const hash = ticketHash(ticket)
    const stored = this.outstanding.get(hash)
    if (!stored) return undefined
    this.outstanding.delete(hash)

    const binding = normalizeClient(client)
    if (
      binding.origin !== stored.origin
      || binding.address !== stored.address
      || stored.expiresAt <= now
    ) {
      return undefined
    }
    return { expiresAt: stored.expiresAt }
  }

  private prune(now: number): void {
    for (const [hash, ticket] of this.outstanding) {
      if (ticket.expiresAt <= now) this.outstanding.delete(hash)
    }
  }
}

function normalizeClient(client: VoiceTicketClient): VoiceTicketClient {
  return {
    origin: normalizeOrigin(client.origin),
    address: normalizeAddress(client.address),
  }
}

function normalizeOrigin(value: string): string {
  let parsed: URL
  try {
    parsed = new URL(value.trim())
  } catch {
    throw new Error('Voice tickets require a valid HTTP origin')
  }
  if (
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
    || !parsed.host
    || parsed.origin === 'null'
    || parsed.username
    || parsed.password
  ) {
    throw new Error('Voice tickets require a valid HTTP origin')
  }
  return parsed.origin
}

function normalizeAddress(value: string): string {
  let address = value.trim().toLowerCase()
  if (address.startsWith('[') && address.endsWith(']')) {
    address = address.slice(1, -1)
  }
  if (address.startsWith('::ffff:')) {
    const mapped = address.slice('::ffff:'.length)
    if (isIP(mapped) === 4) return mapped
  }
  const family = isIP(address)
  if (family === 0) {
    throw new Error('Voice tickets require a valid remote address')
  }
  if (family === 4) return address
  const hostname = new URL(`http://[${address}]/`).hostname
  return hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname
}

function ticketHash(ticket: string): string {
  return createHash('sha256').update(ticket).digest('base64url')
}

function requirePositiveInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer`)
  }
}
