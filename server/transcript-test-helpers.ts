import type { SessionEvent } from '@github/copilot-sdk'
import { expect } from 'vitest'
import type { ChatMessage } from '../shared/contracts.js'
import { createTranscriptBuilder, messagesFromHistory } from './agent-service.js'
import { expectIncrementalEquivalence, vandalize } from './projection-test-helpers.js'

/**
 * Rows a builder hands out are frozen, and the array holding them is the
 * caller's own: vandalizing it must leave the builder's next snapshot intact.
 */
function receivedTranscript(messages: ChatMessage[]): void {
  for (const message of messages) {
    expect(Object.isFrozen(message)).toBe(true)
    if (message.taskCompletion) expect(Object.isFrozen(message.taskCompletion)).toBe(true)
  }
  vandalize(messages)
}

/**
 * `messagesFromHistory`, after proving that a builder taking the same events
 * in a few at a time agrees with it at every prefix.
 */
export function checkedMessagesFromHistory(
  events: SessionEvent[],
  label = '',
): ChatMessage[] {
  expectIncrementalEquivalence(
    events,
    () => {
      const builder = createTranscriptBuilder()
      return { apply: (chunk) => builder.apply(chunk), snapshot: () => builder.messages() }
    },
    messagesFromHistory,
    receivedTranscript,
    label,
  )
  return messagesFromHistory(events)
}
