import type { ChatMessage } from '../shared/contracts.js'

const MAX_MESSAGE_CHARACTERS = 1_600
const MAX_CONTEXT_CHARACTERS = 8_000

export interface RecoveryBrief {
  prompt: string
  messageCount: number
  truncated: boolean
}

interface BriefMessage {
  index: number
  label: 'User' | 'Assistant' | 'Notice'
  content: string
  truncated: boolean
}

function briefMessage(message: ChatMessage, index: number): BriefMessage | undefined {
  if (
    message.role !== 'user' &&
    message.role !== 'assistant' &&
    message.role !== 'notice'
  ) {
    return undefined
  }
  const content = message.content.replace(/\s+/gu, ' ').trim()
  if (!content) return undefined
  const truncated = content.length > MAX_MESSAGE_CHARACTERS
  return {
    index,
    label: message.role === 'user'
      ? 'User'
      : message.role === 'assistant'
        ? 'Assistant'
        : 'Notice',
    content: truncated
      ? `${content.slice(0, MAX_MESSAGE_CHARACTERS - 1)}…`
      : content,
    truncated,
  }
}

function formattedLength(message: BriefMessage): number {
  return message.label.length + message.content.length + 4
}

export function buildRecoveryBrief(messages: ChatMessage[]): RecoveryBrief {
  const candidates = messages.flatMap((message, index) => {
    const projected = briefMessage(message, index)
    return projected ? [projected] : []
  })
  const selected = new Map<number, BriefMessage>()
  let used = 0
  const include = (message: BriefMessage | undefined) => {
    if (!message || selected.has(message.index)) return
    const length = formattedLength(message)
    if (used + length > MAX_CONTEXT_CHARACTERS) return
    selected.set(message.index, message)
    used += length
  }

  include(candidates[0])
  const firstUser = candidates.find((message) => message.label === 'User')
  include(firstUser)
  if (firstUser) {
    include(candidates.find((message) =>
      message.index > firstUser.index && message.label === 'Assistant'))
  }
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    include(candidates[index])
  }

  const ordered = [...selected.values()].sort((left, right) => left.index - right.index)
  const truncated =
    ordered.length < candidates.length ||
    candidates.some((message) => message.truncated)
  const transcript = ordered
    .map((message) => `${message.label}: ${message.content}`)
    .join('\n\n')
  const prompt = [
    'Conversation recovery context',
    '',
    'A fresh provider conversation was created after the previous context became unusable. Older messages remain visible in Agentic Remote as read-only history. Use this bounded text-only brief for continuity. Do not assume prior tool connections, opaque event identifiers, permissions, or in-flight tool state still exist.',
    '',
    `Included ${ordered.length} of ${candidates.length} text messages. Context truncated: ${truncated ? 'yes' : 'no'}.`,
    '',
    transcript || 'No prior text messages were available.',
    '',
    'Reply with a concise summary of the recovered goal and current state. Do not call tools or take further action until the next user instruction.',
  ].join('\n')

  return {
    prompt,
    messageCount: ordered.length,
    truncated,
  }
}
