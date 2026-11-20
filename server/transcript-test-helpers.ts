import type { SessionEvent } from '@github/copilot-sdk'
import { expect } from 'vitest'
import type {
  ChatMessage,
  PendingUserInput,
  SessionRuntimeInfo,
  SessionStatus,
} from '../shared/contracts.js'
import {
  contextChangedInEvents,
  createPendingUserInputTracker,
  createTranscriptBuilder,
  foregroundCompletedSince,
  messagesFromHistory,
  pendingUserInputFromEvents,
  runtimeInfoFromEvents,
  SessionEventProjection,
  statusFromEvents,
  workingDirectoryFromEvents,
} from './agent-service.js'
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

/**
 * `pendingUserInputFromEvents`, after proving that a tracker taking the same
 * events in a few at a time agrees with it at every prefix.
 */
export function checkedPendingUserInput(
  events: SessionEvent[],
  label = '',
): PendingUserInput | undefined {
  expectIncrementalEquivalence(
    events,
    () => {
      const tracker = createPendingUserInputTracker()
      return { apply: (chunk) => tracker.apply(chunk), snapshot: () => tracker.pending() }
    },
    pendingUserInputFromEvents,
    vandalize,
    label,
  )
  return pendingUserInputFromEvents(events)
}

/** A tmux session's projection, fed the growing log the way a reader hands it over. */
function projectionOf<T>(read: (projection: SessionEventProjection) => T) {
  const projection = new SessionEventProjection()
  const log: SessionEvent[] = []
  return {
    apply: (chunk: readonly SessionEvent[]) => {
      log.push(...chunk)
      projection.takeIn(log)
    },
    snapshot: () => read(projection),
  }
}

/**
 * `statusFromEvents`, after proving that a session projection taking the
 * same events in a few at a time agrees with it at every prefix.
 */
export function checkedStatusFromEvents(events: SessionEvent[], label = ''): SessionStatus {
  expectIncrementalEquivalence(
    events,
    () => projectionOf((projection) => projection.status()),
    statusFromEvents,
    () => undefined,
    label,
  )
  return statusFromEvents(events)
}

/**
 * `runtimeInfoFromEvents`, after proving that a session projection taking the
 * same events in a few at a time agrees with it at every prefix.
 */
export function checkedRuntimeInfoFromEvents(
  events: SessionEvent[],
  previous: SessionRuntimeInfo | undefined,
  modelLimits: Parameters<typeof runtimeInfoFromEvents>[2] = new Map(),
  estimateContext = true,
  label = '',
): SessionRuntimeInfo | undefined {
  expectIncrementalEquivalence(
    events,
    () => projectionOf((projection) => projection.runtime()(previous, modelLimits, estimateContext)),
    (prefix) => runtimeInfoFromEvents(prefix, previous, modelLimits, estimateContext),
    vandalize,
    label,
  )
  return runtimeInfoFromEvents(events, previous, modelLimits, estimateContext)
}

/**
 * Everything a session projection answers, against the full scans it
 * replaces, at every prefix of `events`.
 */
export function expectSessionProjectionEquivalence(
  events: SessionEvent[],
  fallbackCwd: string | undefined,
  previous: SessionRuntimeInfo | undefined,
  label = '',
): void {
  const times = events.map((event) => Date.parse(event.timestamp))
  const dispatchTimes = [
    Number.NEGATIVE_INFINITY,
    ...times.filter((_, index) => index % 3 === 0),
    Number.NaN,
  ]
  expectIncrementalEquivalence(
    events,
    () => projectionOf((projection) => ({
      status: projection.status(),
      runtime: projection.runtime()(previous),
      workingDirectory: projection.workingDirectory(fallbackCwd),
      contextChanged: projection.contextChanged(),
      completedSince: dispatchTimes.map((time) => projection.foregroundCompletedSince(time)),
      pendingUserInput: projection.pendingUserInput(),
    })),
    (prefix) => ({
      status: statusFromEvents(prefix),
      runtime: runtimeInfoFromEvents(prefix, previous),
      workingDirectory: workingDirectoryFromEvents(prefix, fallbackCwd),
      contextChanged: contextChangedInEvents(prefix),
      completedSince: dispatchTimes.map((time) => foregroundCompletedSince(prefix, time)),
      pendingUserInput: pendingUserInputFromEvents(prefix),
    }),
    vandalize,
    label,
  )
}
