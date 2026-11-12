import { createContext } from 'react'

/** Long enough to collapse: past 12 lines or 600 characters, as in Oracle. */
export function isLongSentMessage(content: string): boolean {
  return content.length > 600 || content.split('\n').length > 12
}

/**
 * Stops the conversation following its end, so a message the reader expands
 * stays where it is while the agent keeps adding output below it.
 */
export const PauseFollowingContext = createContext<() => void>(() => undefined)
