import type { ChatMessage, SessionStatus } from '../shared/contracts'

/**
 * A message the terminal took that its CLI has not yet written to the
 * transcript. Copilot holds a message typed mid-response as pending and only
 * logs it when the turn reaches it, so without this the message would vanish
 * from the composer and appear nowhere until then.
 */
export interface PendingEcho {
  id: string
  content: string
  sentAt: number
  /** User messages already in the transcript, which cannot be its echo. */
  knownUserIds: string[]
  /** When its session last settled without logging it. */
  settledAt?: number
}

/** How long a session may stay settled while still showing a message it never logged. */
export const PENDING_ECHO_SETTLED_MS = 10_000

const KNOWN_USER_LIMIT = 200
const PREFIX_MATCH_MIN = 32

export function createPendingEcho(
  id: string,
  content: string,
  messages: ChatMessage[],
  sentAt: number,
): PendingEcho {
  return {
    id,
    content,
    sentAt,
    knownUserIds: messages
      .filter((message) => message.role === 'user')
      .slice(-KNOWN_USER_LIMIT)
      .map((message) => message.id),
  }
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function sameText(left: string, right: string): boolean {
  if (left === right) return true
  // A long message can come back shortened or with its paste collapsed.
  const [shorter, longer] = left.length < right.length ? [left, right] : [right, left]
  return shorter.length >= PREFIX_MATCH_MIN && longer.startsWith(shorter)
}

/**
 * The echoes whose transcript message has not arrived yet. Each is paired with
 * at most one new user message, in order, so sending the same words twice
 * keeps the second pending until the CLI logs it too.
 */
export function unloggedPendingEchoes(
  echoes: PendingEcho[],
  messages: ChatMessage[],
): PendingEcho[] {
  if (echoes.length === 0) return echoes
  const used = new Set<string>()
  const unlogged = echoes.filter((echo) => {
    const known = new Set(echo.knownUserIds)
    const content = normalize(echo.content)
    const match = messages.find((message) =>
      message.role === 'user' &&
      !known.has(message.id) &&
      !used.has(message.id) &&
      sameText(content, normalize(message.content)),
    )
    if (match) used.add(match.id)
    return !match
  })
  return unlogged.length === echoes.length ? echoes : unlogged
}

/**
 * The echoes still waiting for their transcript message. A session that stays
 * settled for the grace period without logging one (the person recalled it in
 * the terminal) lets it go rather than showing it forever; going back to work
 * starts the grace over. Nothing here ever resends.
 */
export function retainPendingEchoes(
  echoes: PendingEcho[],
  messages: ChatMessage[],
  status: SessionStatus,
  now: number,
): PendingEcho[] {
  const unlogged = unloggedPendingEchoes(echoes, messages)
  const settled = status === 'idle' || status === 'error'
  let changed = unlogged !== echoes
  const retained: PendingEcho[] = []
  for (const echo of unlogged) {
    if (!settled) {
      if (echo.settledAt === undefined) retained.push(echo)
      else {
        const { settledAt: _settledAt, ...working } = echo
        retained.push(working)
        changed = true
      }
    } else if (echo.settledAt === undefined) {
      retained.push({ ...echo, settledAt: now })
      changed = true
    } else if (now - echo.settledAt >= PENDING_ECHO_SETTLED_MS) {
      changed = true
    } else {
      retained.push(echo)
    }
  }
  return changed ? retained : echoes
}

export interface PendingEchoOwner {
  messages: ChatMessage[]
  status: SessionStatus
}

/**
 * Applies {@link retainPendingEchoes} to every session's echoes. A session the
 * app does not currently know keeps its echoes untouched.
 */
export function prunePendingEchoMap(
  map: Record<string, PendingEcho[]>,
  owner: (key: string) => PendingEchoOwner | undefined,
  now: number,
): Record<string, PendingEcho[]> {
  let next: Record<string, PendingEcho[]> | undefined
  for (const [key, echoes] of Object.entries(map)) {
    const session = owner(key)
    if (!session) continue
    const kept = retainPendingEchoes(echoes, session.messages, session.status, now)
    if (kept === echoes) continue
    next ??= { ...map }
    if (kept.length) next[key] = kept
    else delete next[key]
  }
  return next ?? map
}

/** When the earliest settled echo's grace runs out, if any is settling. */
export function nextPendingEchoDeadline(
  map: Record<string, PendingEcho[]>,
): number | undefined {
  let deadline: number | undefined
  for (const echoes of Object.values(map)) {
    for (const echo of echoes) {
      if (echo.settledAt === undefined) continue
      const due = echo.settledAt + PENDING_ECHO_SETTLED_MS
      if (deadline === undefined || due < deadline) deadline = due
    }
  }
  return deadline
}
