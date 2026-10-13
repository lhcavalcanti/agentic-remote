/**
 * Side questions: a quick question about a session, answered from its
 * conversation without tools and without becoming part of it.
 *
 * The owning computer forks the session's saved history into a temporary
 * Copilot SDK session, asks there, and deletes the fork. Nothing is typed into
 * the session or added to its history, whichever backend runs it. The fork is
 * made by a runtime of its own, started on demand and stopped when idle, since
 * one that has the source session loaded records the fork in its history.
 */

import type { SideQuestionExchange } from '../shared/contracts.js'

export {
  SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH,
  SIDE_QUESTION_EARLIER_LIMIT,
  SIDE_QUESTION_MAX_LENGTH,
} from '../shared/side-question.js'

/** How long an answer may take before the question is abandoned. */
export const SIDE_QUESTION_TIMEOUT_MS = 120_000

/** How long the side-question runtime stays up after its last question. */
export const SIDE_QUESTION_RUNTIME_IDLE_MS = 120_000

/** How long disconnecting, deleting a fork, or stopping the runtime may take. */
export const SIDE_QUESTION_CLEANUP_MS = 10_000

/**
 * The event a fork has to stop before, if a turn is still unfinished.
 *
 * A question asked over an unanswered prompt is answered as that prompt, so
 * the fork ends at the first user message after the last completed turn.
 */
export function sideQuestionBoundary(
  events: readonly { id?: string; type: string }[],
): string | undefined {
  let lastTurnEnd = -1
  for (let index = events.length - 1; index >= 0; index -= 1) {
    if (events[index].type === 'assistant.turn_end') {
      lastTurnEnd = index
      break
    }
  }
  return events
    .slice(lastTurnEnd + 1)
    .find((event) => event.type === 'user.message' && event.id)?.id
}

/**
 * What is asked of the fork. Each question is answered by a fresh fork that
 * knows nothing of the side thread, so a follow-up carries the earlier side
 * answers with it.
 */
export function sideQuestionPrompt(
  question: string,
  earlier: readonly SideQuestionExchange[] = [],
): string {
  if (!earlier.length) return question
  const thread = earlier
    .map((exchange) => `Question: ${exchange.question}\nAnswer: ${exchange.answer}`)
    .join('\n\n')
  return [
    'Earlier side questions about this conversation, with your answers:',
    thread,
    `Follow-up question: ${question}`,
  ].join('\n\n')
}

export class SideQuestionError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message)
    this.name = 'SideQuestionError'
  }
}

/** Settles with the answer, or rejects once the question has taken too long. */
export async function withSideQuestionTimeout<T>(
  answer: Promise<T>,
  timeoutMs = SIDE_QUESTION_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      answer,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new SideQuestionError(
            `The side question was not answered within ${Math.round(timeoutMs / 1000)} seconds.`,
            504,
          )),
          timeoutMs,
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
