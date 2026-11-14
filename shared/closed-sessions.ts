import type { ChatMessage, ClosedSessionContext, SessionDetail } from './contracts.js'

/** How long a closed session stays reopenable before it is deleted for good. */
export const CLOSED_SESSION_RETENTION_DAYS = 14
export const CLOSED_SESSION_RETENTION_MS = CLOSED_SESSION_RETENTION_DAYS * 24 * 60 * 60 * 1000

const CONTEXT_PROMPTS = 3
const CONTEXT_PROMPT_LENGTH = 200
const CONTEXT_REPLY_LENGTH = 400

/** When a session closed at `closedAt` is deleted, in epoch milliseconds; NaN when unreadable. */
export function closedSessionExpiresAt(closedAt: string): number {
  return Date.parse(closedAt) + CLOSED_SESSION_RETENTION_MS
}

// Whole code points, so a cut never leaves half of a surrogate pair.
function excerpt(text: string, limit: number): string {
  const characters = Array.from(text.replace(/\s+/g, ' ').trim())
  return characters.length > limit
    ? `${characters.slice(0, limit - 1).join('')}…`
    : characters.join('')
}

function said(message: ChatMessage, role: ChatMessage['role']): boolean {
  return message.role === role && message.content.trim().length > 0
}

export function closedSessionContext(
  session: Pick<SessionDetail, 'title' | 'cwd' | 'messages'>,
): ClosedSessionContext {
  const prompts = session.messages
    .filter((message) => said(message, 'user'))
    .slice(-CONTEXT_PROMPTS)
    .map((message) => excerpt(message.content, CONTEXT_PROMPT_LENGTH))
  const reply = session.messages.findLast((message) => said(message, 'assistant'))
  return {
    title: session.title,
    cwd: session.cwd,
    prompts,
    ...(reply ? { reply: excerpt(reply.content, CONTEXT_REPLY_LENGTH) } : {}),
  }
}

export function isClosedSessionContext(value: unknown): value is ClosedSessionContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const context = value as Record<string, unknown>
  return typeof context.title === 'string' &&
    typeof context.cwd === 'string' &&
    Array.isArray(context.prompts) &&
    context.prompts.every((prompt) => typeof prompt === 'string') &&
    (context.reply === undefined || typeof context.reply === 'string')
}
