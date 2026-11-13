import { createContext } from 'react'

export type SentMessageLength = 'short' | 'long' | 'very-long'

/**
 * How long a message the user sent is, for collapsing it behind Show all. A
 * long one, past 12 lines or 600 characters, collapses on a phone or a touch
 * device, and in Oracle's narrow panel on every device; a very long one, past
 * 30 lines or 2,000 characters, also collapses in a desktop's conversation,
 * which has room for more. The stylesheet applies the device's limit.
 */
export function sentMessageLength(content: string): SentMessageLength {
  const lines = content.split('\n').length
  if (content.length > 2000 || lines > 30) return 'very-long'
  if (content.length > 600 || lines > 12) return 'long'
  return 'short'
}

/**
 * Stops the conversation following its end, so a message the reader expands
 * stays where it is while the agent keeps adding output below it.
 */
export const PauseFollowingContext = createContext<() => void>(() => undefined)
