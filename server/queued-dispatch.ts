import { randomUUID } from 'node:crypto'
import type {
  QueuedPrompt,
  QueuedPromptDispatchResult,
  SessionDetail,
} from '../shared/contracts.js'
import type { SessionStore } from './session-store.js'

export interface QueuedDispatchTarget {
  promptId: string
  content: string
}

export function queueConflict(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 409 })
}

export function hasUncertainDelivery(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' &&
    Reflect.get(error, 'uncertainDelivery') === true)
}

export function explicitlyRefused(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  if (hasUncertainDelivery(error)) return false
  return Reflect.get(error, 'uncertainDelivery') === false ||
    Reflect.get(error, 'code') === -32601 ||
    Reflect.get(error, 'code') === -32602
}

export function terminalRefused(error: unknown): boolean {
  return explicitlyRefused(error) || Boolean(
    error && typeof error === 'object' && !hasUncertainDelivery(error) &&
    Reflect.get(error, 'statusCode') === 409,
  )
}

export function ownsDispatchRecovery(session: SessionDetail): boolean {
  return Boolean(session.queuedDispatch?.recoveryFailedAt &&
    session.failedPrompt?.uncertain === true &&
    session.failedPrompt?.failedAt === session.queuedDispatch.recoveryFailedAt &&
    session.failedPrompt?.content === session.queuedDispatch.content)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function preflight<T>(operation: () => Promise<T>, deadline: number): Promise<T> {
  const remaining = deadline - Date.now()
  const expired = () => queueConflict('Queued dispatch preflight timed out. Nothing was sent.')
  if (remaining <= 0) throw expired()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(expired()), remaining)
        timer.unref?.()
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export class QueuedDelivery {
  closed = false
  submitted = false
  accepted = false
  refused = false
  readonly messageIds = new Set<string>()

  constructor(readonly attemptId: string) {}

  submit(): void {
    if (this.closed) {
      throw Object.assign(queueConflict('The dispatch attempt ended before delivery.'), {
        uncertainDelivery: false,
      })
    }
    this.submitted = true
    this.refused = false
  }

  accept(): void {
    this.accepted = true
  }

  refuse(): void {
    if (!this.accepted) this.refused = true
  }
}

export async function preparePrompt(
  store: SessionStore,
  sessionId: string,
  content: string,
  userId: string,
  assistantId: string,
  assertReady: (session: SessionDetail) => void,
  delivery?: QueuedDelivery,
): Promise<SessionDetail> {
  delivery?.messageIds.add(userId)
  delivery?.messageIds.add(assistantId)
  const createdAt = new Date().toISOString()
  return store.update(sessionId, (session) => {
    if (delivery?.closed) throw queueConflict('The dispatch attempt has ended.')
    assertReady(session)
    if (delivery) {
      if (session.queuedDispatch?.attemptId !== delivery.attemptId) {
        throw queueConflict('The queued dispatch no longer owns this session.')
      }
      session.queuedDispatch.prepared = {
        status: session.status, activity: session.activity,
        updatedAt: session.updatedAt, revision: (session.revision ?? 0) + 1,
      }
    } else if (session.queuedDispatch) {
      throw queueConflict('Resolve the queued dispatch before starting another turn.')
    }
    session.messages.push(
      { id: userId, role: 'user', content, createdAt },
      { id: assistantId, role: 'assistant', content: '', createdAt, streaming: true },
    )
    session.updatedAt = createdAt
    session.status = 'running'
    session.activity = 'Thinking'
    if (!delivery && session.messages.filter((message) => message.role === 'user').length === 1) {
      const title = content.trim()
      session.title = title.length > 52 ? `${title.slice(0, 52)}…` : title
    }
  })
}

export function acceptanceReceipt(timeoutMs = 10_000) {
  let resolve = () => {}
  let reject: (error: unknown) => void = () => {}
  const promise = new Promise<void>((accept, refuse) => {
    resolve = accept
    reject = refuse
  })
  // The producer can report a failure before its caller reaches the await.
  void promise.catch(() => undefined)
  const timer = setTimeout(() => reject(Object.assign(
    new Error('The provider has not confirmed delivery. Check the session before retrying.'),
    { uncertainDelivery: true },
  )), timeoutMs)
  timer.unref?.()
  return { promise, resolve, reject, dispose: () => clearTimeout(timer) }
}

/**
 * Queue-specific business transactions, not storage rollback. The original
 * item is durably moved to the existing failed-prompt recovery format before
 * dispatch, so older runtimes cannot retry it after rollback. Current clients
 * see its original position through the claim view until acceptance is recorded.
 */
export class QueuedDispatches {
  private readonly active = new Map<string, string>()
  private readonly running = new Set<string>()
  private lastRecoveryAt = 0

  constructor(
    private readonly store: SessionStore,
    private readonly publish: (session: SessionDetail) => void,
  ) {}

  view(session: SessionDetail): SessionDetail {
    const claim = session.queuedDispatch
    if (!claim) return session
    const queuedPrompts = [...(session.queuedPrompts || [])]
    if (!queuedPrompts.some((entry) => entry.id === claim.promptId)) {
      const original = claim.original || {
        id: claim.promptId, content: claim.content,
        createdAt: claim.startedAt, command: claim.command,
      }
      const index = Math.max(0, Math.min(claim.originalIndex ?? 0, queuedPrompts.length))
      queuedPrompts.splice(index, 0, original)
    }
    return {
      ...session,
      queuedPrompts,
      queuedCount: queuedPrompts.length,
      failedPrompt: ownsDispatchRecovery(session) ? undefined : session.failedPrompt,
      queuedDispatch: this.active.get(session.id) === claim.attemptId ? claim : {
        ...claim,
        state: 'uncertain',
        message: claim.message ||
          'Delivery is unconfirmed. Check the provider before discarding this queue item; it will not be retried automatically.',
      },
    }
  }

  assertAvailable(sessionId: string, attemptId?: string): void {
    const claim = this.store.get(sessionId)?.queuedDispatch
    if (claim && claim.attemptId !== attemptId) {
      throw queueConflict(
        'A queued dispatch is unconfirmed. Check the provider and discard that queue item before sending more work.',
      )
    }
  }

  isActive(sessionId: string): boolean {
    return this.running.has(sessionId)
  }

  /**
   * Puts an unconfirmed item back where it was, once the user has checked the
   * provider did not receive it. The drain then takes it again in its turn.
   */
  async requeue(
    sessionId: string,
    promptId: string,
    acknowledgesDispatch: string,
  ): Promise<SessionDetail> {
    const claim = this.store.get(sessionId)?.queuedDispatch
    // Unconfirmed as the view shows it: a claim no live attempt owns, which
    // includes one a restart interrupted mid-dispatch.
    if (
      !claim || this.running.has(sessionId) || this.active.get(sessionId) === claim.attemptId ||
      claim.promptId !== promptId || claim.attemptId !== acknowledgesDispatch
    ) {
      throw queueConflict('That queue item is no longer unconfirmed. Read the queue again.')
    }
    if (claim.accepted) {
      throw queueConflict('The provider accepted this item, so it cannot be sent again. Discard it instead.')
    }
    const result = await this.store.update(sessionId, (session) => {
      const current = session.queuedDispatch
      if (current?.attemptId !== claim.attemptId) {
        throw queueConflict('The queued dispatch changed. Read the queue again.')
      }
      const original = current.original || {
        id: current.promptId, content: current.content,
        createdAt: current.startedAt, ...(current.command ? { command: true } : {}),
      }
      const queue = (session.queuedPrompts || []).filter((prompt) => prompt.id !== original.id)
      queue.splice(Math.max(0, Math.min(current.originalIndex ?? 0, queue.length)), 0, original)
      session.queuedPrompts = queue
      session.queuedCount = queue.length
      if (ownsDispatchRecovery(session)) session.failedPrompt = undefined
      session.queuedDispatch = undefined
    })
    this.publish(result)
    return result
  }

  async discard(
    sessionId: string,
    promptId: string,
    acknowledgesDispatch?: string,
  ): Promise<SessionDetail | undefined> {
    const claim = this.store.get(sessionId)?.queuedDispatch
    if (!claim) {
      if (acknowledgesDispatch) {
        throw queueConflict('That dispatch no longer owns this queue item. Read the queue again.')
      }
      return undefined
    }
    if (
      this.running.has(sessionId) || claim.promptId !== promptId ||
      claim.attemptId !== acknowledgesDispatch
    ) {
      throw queueConflict('Check the unconfirmed dispatch before discarding it from a fresh queue snapshot.')
    }
    const result = await this.store.update(sessionId, (session) => {
      if (session.queuedDispatch?.attemptId !== claim.attemptId) {
        throw queueConflict('The queued dispatch changed. Read the queue again.')
      }
      session.queuedPrompts = (session.queuedPrompts || [])
        .filter((prompt) => prompt.id !== promptId)
      session.queuedCount = session.queuedPrompts.length
      if (ownsDispatchRecovery(session)) session.failedPrompt = undefined
      session.queuedDispatch = undefined
    })
    this.publish(result)
    return result
  }

  async run(
    sessionId: string,
    target: QueuedDispatchTarget | undefined,
    normalize: (content: string, command: boolean) => Promise<string>,
    dispatch: (prompt: QueuedPrompt, delivery: QueuedDelivery) => Promise<unknown>,
    assertIdle: (session: SessionDetail) => void,
  ): Promise<QueuedPromptDispatchResult | undefined> {
    if (this.running.has(sessionId)) throw queueConflict('This queue is already dispatching.')
    this.running.add(sessionId)
    try {
      return await this.runExclusive(sessionId, target, normalize, dispatch, assertIdle)
    } finally {
      this.running.delete(sessionId)
    }
  }

  private async runExclusive(
    sessionId: string,
    target: QueuedDispatchTarget | undefined,
    normalize: (content: string, command: boolean) => Promise<string>,
    dispatch: (prompt: QueuedPrompt, delivery: QueuedDelivery) => Promise<unknown>,
    assertIdle: (session: SessionDetail) => void,
  ): Promise<QueuedPromptDispatchResult | undefined> {
    const deadline = Date.now() + 20_000
    const before = await this.store.readAfterWrites(sessionId)
    if (before.queuedDispatch) {
      if (!target) return undefined
      this.assertAvailable(sessionId)
    }
    assertIdle(before)
    const original = target
      ? before.queuedPrompts?.find((prompt) => prompt.id === target.promptId)
      : before.queuedPrompts?.[0]
    if (!original) {
      if (target) throw queueConflict('Queued prompt not found. Your rewritten text has not been sent.')
      return undefined
    }
    const command = target
      ? target.content.trimStart().startsWith('/')
      : original.command === true
    const content = await preflight(
      () => normalize(target?.content ?? original.content, command), deadline,
    )
    const attemptId = randomUUID()
    const previousRecoveryAt = Math.max(
      Date.parse(before.failedPrompt?.failedAt || '') || 0,
      Date.parse(original.createdAt) || 0,
    )
    this.lastRecoveryAt = Math.max(
      Date.now(),
      this.lastRecoveryAt + 1,
      previousRecoveryAt + 1,
    )
    const recoveryFailedAt = new Date(this.lastRecoveryAt).toISOString()
    let originalIndex = before.queuedPrompts!.findIndex((entry) => entry.id === original.id)
    const prompt: QueuedPrompt = {
      ...original,
      content,
      command: command || undefined,
    }
    const delivery = new QueuedDelivery(attemptId)
    this.active.set(sessionId, attemptId)
    try {
      let claimed: SessionDetail
      try {
        claimed = await this.store.update(sessionId, (session) => {
          assertIdle(session)
          if (
            session.queuedDispatch || session.failedPrompt ||
            !session.queuedPrompts?.some((entry) =>
              entry.id === original.id && entry.content === original.content &&
              entry.createdAt === original.createdAt && entry.command === original.command)
          ) {
            throw queueConflict('The queued prompt changed before it could be claimed. Nothing was sent.')
          }
          originalIndex = session.queuedPrompts.findIndex((entry) => entry.id === original.id)
          session.queuedDispatch = {
            attemptId,
            promptId: original.id,
            content,
            command: prompt.command,
            startedAt: new Date().toISOString(),
            state: 'dispatching',
            original,
            originalIndex,
            recoveryFailedAt,
          }
          session.queuedPrompts = session.queuedPrompts.filter((entry) => entry.id !== original.id)
          session.queuedCount = session.queuedPrompts.length
          session.failedPrompt = { content, failedAt: recoveryFailedAt, uncertain: true }
        })
      } catch (error) {
        if (error && typeof error === 'object' && Reflect.get(error, 'statusCode') === 409) {
          throw error
        }
        const current = this.store.get(sessionId)
        return {
          outcome: 'refused', restored: true, promptId: original.id, attemptId,
          session: current ? this.view(current) : undefined,
          message: `The queue claim could not be stored: ${errorMessage(error)}. Nothing was sent.`,
        }
      }
      this.publish(claimed)
      try {
        let timeout: ReturnType<typeof setTimeout> | undefined
        try {
          const remaining = deadline - Date.now()
          if (remaining <= 0) throw queueConflict('The dispatch deadline elapsed before invocation.')
          await Promise.race([
            dispatch(prompt, delivery),
            new Promise<never>((_resolve, reject) => {
              timeout = setTimeout(() => reject(Object.assign(
                new Error('Timed out waiting for the queued dispatch outcome.'),
                { uncertainDelivery: true },
              )), remaining)
              timeout.unref?.()
            }),
          ])
        } finally {
          if (timeout) clearTimeout(timeout)
        }
        if (!delivery.accepted) {
          throw Object.assign(new Error('The provider did not confirm delivery.'), {
            uncertainDelivery: true,
          })
        }
        const completed = await this.store.update(sessionId, (session) => {
          if (session.queuedDispatch?.attemptId !== attemptId) {
            throw queueConflict('The queued dispatch no longer belongs to this attempt.')
          }
          session.queuedPrompts = (session.queuedPrompts || [])
            .filter((entry) => entry.id !== original.id)
          session.queuedCount = session.queuedPrompts.length
          if (ownsDispatchRecovery(session)) session.failedPrompt = undefined
          session.queuedDispatch = undefined
        })
        this.publish(completed)
        return { outcome: 'sent', promptId: original.id, attemptId, session: this.view(completed) }
      } catch (error) {
        // Stop late preflight continuations before deciding that no provider
        // invocation happened. Already-started work remains uncertain, never retried.
        delivery.closed = true
        const definite = !delivery.accepted && (
          !delivery.submitted || delivery.refused || explicitlyRefused(error)
        )
        if (definite) {
          try {
            const restored = await this.store.update(sessionId, (session) => {
              if (session.queuedDispatch?.attemptId !== attemptId) {
                throw queueConflict('The queued dispatch no longer belongs to this attempt.')
              }
              const prepared = session.queuedDispatch.prepared
              const assistantIndex = session.messages.findIndex((message) =>
                message.role === 'assistant' && delivery.messageIds.has(message.id))
              const assistant = session.messages[assistantIndex]
              const ownsPreparedStatus = prepared && assistant && !assistant.content &&
                session.messages.slice(assistantIndex + 1).every((message) => message.role === 'notice')
              const queue = session.queuedPrompts || []
              if (session.queuedDispatch.original &&
                !queue.some((entry) => entry.id === original.id)) {
                queue.splice(Math.min(originalIndex, queue.length), 0, original)
              }
              session.queuedPrompts = queue
              session.queuedCount = queue.length
              if (ownsDispatchRecovery(session)) session.failedPrompt = undefined
              session.queuedDispatch = undefined
              session.messages = session.messages.filter((message) =>
                !delivery.messageIds.has(message.id))
              if (prepared && session.revision === prepared.revision) {
                session.updatedAt = prepared.updatedAt
              }
              if (
                ownsPreparedStatus && session.status === 'running' &&
                session.activity === 'Thinking' &&
                !session.pendingPermission && !session.pendingUserInput
              ) {
                session.status = prepared.status
                session.activity = prepared.activity
              }
            })
            this.publish(restored)
            return {
              outcome: 'refused', restored: true, promptId: original.id, attemptId,
              session: this.view(restored),
              message: `${errorMessage(error)} The original queued message is unchanged; your rewrite was not sent.`,
            }
          } catch (restoreError) {
            this.active.delete(sessionId)
            const current = this.store.get(sessionId)
            const session = current ? this.view(current) : undefined
            if (session) this.publish(session)
            return {
              outcome: 'refused', restored: false, promptId: original.id, attemptId,
              session,
              message: `The provider refused the dispatch, but its queue claim could not be released: ${errorMessage(restoreError)}. Do not retry until this is resolved.`,
            }
          }
        }
        let message = delivery.accepted
          ? `The provider accepted the work, but its queue outcome could not be recorded: ${errorMessage(error)}. Do not resend it.`
          : `Delivery could not be confirmed: ${errorMessage(error)}. Check the provider; this item will not be retried automatically.`
        try {
          await this.store.update(sessionId, (session) => {
            if (session.queuedDispatch?.attemptId !== attemptId) {
              throw queueConflict('The dispatch claim changed.')
            }
            session.queuedDispatch.state = 'uncertain'
            session.queuedDispatch.message = message
            if (delivery.accepted) session.queuedDispatch.accepted = true
          })
        } catch (recordError) {
          message += ` Recording the outcome also failed: ${errorMessage(recordError)}.`
        }
        this.active.delete(sessionId)
        const current = this.store.get(sessionId)
        const session = current ? this.view(current) : undefined
        if (session) this.publish(session)
        return {
          outcome: 'uncertain', promptId: original.id, attemptId, session, message,
          delivery: delivery.accepted ? 'accepted' : 'unknown',
        }
      }
    } finally {
      delivery.closed = true
      if (this.active.get(sessionId) === attemptId) this.active.delete(sessionId)
    }
  }
}
