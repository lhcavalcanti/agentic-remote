import { createContext } from 'react'

export type SentMessageLength = 'short' | 'long' | 'very-long'

/**
 * How long a message the user sent is, for collapsing it behind Show all. A
 * phone or a touch device collapses a long one, past 12 lines or 600
 * characters; a desktop has room for more and collapses only a very long one,
 * past 30 lines or 2,000 characters. The stylesheet applies the device's
 * limit, for the conversation and Oracle alike.
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
