import type { ComposerContent } from './composer/composer-state'

/** A message sent before its session could take it, waiting to go to it in order. */
export type HeldMessage = ComposerContent & {
  id: string
  /** Sent with Queue rather than Send. */
  enqueue: boolean
}

export type HeldQueue = {
  messages: HeldMessage[]
  /** The message being handed to the session now; it cannot be edited or removed. */
  sending?: string
  /** How many have been handed over. Later ones wait behind the turn the first starts. */
  delivered: number
  /** Why handing them over stopped. Nothing more goes until it is resumed. */
  failure?: { message: string; uncertain: boolean }
  /**
   * Where a message taken back to be edited returns when it is held again:
   * before this message, which waits for it with those after it, or last when null.
   */
  returnBefore?: string | null
}

export type HeldQueues = Readonly<Record<string, HeldQueue>>

export type HeldDeliveryOutcome =
  | { accepted: true }
  | { accepted: false; message: string; uncertain: boolean }

const emptyQueue: HeldQueue = { messages: [], delivered: 0 }

function withQueue(queues: HeldQueues, key: string, queue: HeldQueue): HeldQueues {
  // With nothing left, a message being edited goes back last, which is its place.
  if (!queue.messages.length && !queue.failure) {
    if (!(key in queues)) return queues
    const { [key]: _gone, ...rest } = queues
    return rest
  }
  return { ...queues, [key]: queue }
}

export function holdsMessages(queues: HeldQueues, key: string): boolean {
  return (queues[key]?.messages.length ?? 0) > 0
}

/** Adds a message last, or where the one being edited was taken from. */
export function holdMessage(queues: HeldQueues, key: string, message: HeldMessage): HeldQueues {
  const queue = queues[key] ?? emptyQueue
  const at = queue.returnBefore
    ? queue.messages.findIndex((entry) => entry.id === queue.returnBefore)
    : -1
  const messages = at < 0
    ? [...queue.messages, message]
    : [...queue.messages.slice(0, at), message, ...queue.messages.slice(at)]
  return withQueue(queues, key, { ...queue, messages, returnBefore: undefined })
}

/** Takes a waiting message back to be edited, remembering its place. */
export function takeHeldMessage(
  queues: HeldQueues,
  key: string,
  id: string,
): { queues: HeldQueues; message?: HeldMessage } {
  const queue = queues[key]
  const index = queue?.messages.findIndex((entry) => entry.id === id) ?? -1
  if (!queue || index < 0 || queue.sending === id) return { queues }
  const message = queue.messages[index]
  return {
    message,
    queues: withQueue(queues, key, {
      ...queue,
      messages: queue.messages.filter((entry) => entry.id !== id),
      returnBefore: queue.messages[index + 1]?.id ?? null,
    }),
  }
}

export function removeHeldMessage(queues: HeldQueues, key: string, id: string): HeldQueues {
  const queue = queues[key]
  const index = queue?.messages.findIndex((entry) => entry.id === id) ?? -1
  if (!queue || index < 0 || queue.sending === id) return queues
  return withQueue(queues, key, {
    ...queue,
    messages: queue.messages.filter((entry) => entry.id !== id),
    // Only a refused message holds the others back.
    ...(queue.failure && index === 0 ? { failure: undefined } : {}),
    // One being edited goes back before whatever follows it now.
    ...(queue.returnBefore === id ? { returnBefore: queue.messages[index + 1]?.id ?? null } : {}),
  })
}

/** The message taken back to be edited was cleared, so those after it no longer wait for it. */
export function forgetHeldPlace(queues: HeldQueues, key: string): HeldQueues {
  const queue = queues[key]
  return queue?.returnBefore === undefined
    ? queues
    : withQueue(queues, key, { ...queue, returnBefore: undefined })
}

/** Whether the next message waits for one taken back to be edited, which goes before it. */
export function waitsForEditedMessage(queue: HeldQueue | undefined): boolean {
  return Boolean(queue?.returnBefore && queue.messages[0]?.id === queue.returnBefore)
}

/** The message to hand over next, unless one is already going, a refusal holds them, or one being edited goes first. */
export function nextHeldMessage(queue: HeldQueue | undefined): HeldMessage | undefined {
  return queue && !queue.sending && !queue.failure && !waitsForEditedMessage(queue)
    ? queue.messages[0]
    : undefined
}

export function beginHeldDelivery(queues: HeldQueues, key: string, id: string): HeldQueues {
  const queue = queues[key]
  return queue?.messages[0]?.id === id ? { ...queues, [key]: { ...queue, sending: id } } : queues
}

export function settleHeldDelivery(
  queues: HeldQueues,
  key: string,
  id: string,
  outcome: HeldDeliveryOutcome,
): HeldQueues {
  const queue = queues[key]
  if (!queue || queue.sending !== id) return queues
  if (outcome.accepted) {
    return withQueue(queues, key, {
      ...queue,
      sending: undefined,
      delivered: queue.delivered + 1,
      messages: queue.messages.filter((entry) => entry.id !== id),
    })
  }
  return withQueue(queues, key, {
    ...queue,
    sending: undefined,
    failure: { message: outcome.message, uncertain: outcome.uncertain },
  })
}

export function resumeHeldDelivery(queues: HeldQueues, key: string): HeldQueues {
  const queue = queues[key]
  return queue?.failure ? withQueue(queues, key, { ...queue, failure: undefined }) : queues
}

/** Carries what is held to the key that replaces this one, after what is already held there. */
export function moveHeldQueue(queues: HeldQueues, from: string, to: string): HeldQueues {
  const source = queues[from]
  if (!source || from === to) return queues
  const { [from]: _moved, ...rest } = queues
  const destination = rest[to]
  return withQueue(rest, to, destination
    ? { ...destination, messages: [...destination.messages, ...source.messages] }
    : source)
}

export function dropHeldQueue(queues: HeldQueues, key: string): HeldQueues {
  if (!(key in queues)) return queues
  const { [key]: _dropped, ...rest } = queues
  return rest
}
