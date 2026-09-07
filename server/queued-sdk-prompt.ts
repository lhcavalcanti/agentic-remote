import type { AssistantMessageEvent } from '@github/copilot-sdk'
import type { CopilotSessionLike } from './agent-service.js'
import type { QueuedDelivery, acceptanceReceipt } from './queued-dispatch.js'

/**
 * Uses the SDK's acceptance receipt without submitting a second prompt.
 * Completion still follows the same assistant-message/idle/error events as
 * sendAndWait; the queue can settle before the whole turn has finished.
 */
export async function queuedSdkPrompt(
  session: CopilotSessionLike,
  content: string,
  delivery: QueuedDelivery,
  receipt: ReturnType<typeof acceptanceReceipt>,
  registerStop: (stop: () => void) => () => void,
): Promise<AssistantMessageEvent | undefined> {
  if (!session.send) {
    throw new Error('This SDK cannot confirm prompt acceptance. Update the runtime before sending a queued edit.')
  }
  let resolve: (value: AssistantMessageEvent | undefined) => void = () => {}
  let reject: (error: unknown) => void = () => {}
  let last: AssistantMessageEvent | undefined
  const finished = new Promise<AssistantMessageEvent | undefined>((accept, fail) => {
    resolve = accept
    reject = fail
  })
  void finished.catch(() => undefined)
  let failEvent: (error: unknown) => void = () => {}
  const eventFailure = new Promise<never>((_resolve, fail) => { failEvent = fail })
  void eventFailure.catch(() => undefined)
  let stop = () => {}
  const stopped = new Promise<never>((_accept, fail) => {
    stop = () => {
      delivery.closed = true
      const error = new Error('The session stopped before dispatch completion was confirmed.')
      receipt.reject(error)
      fail(error)
      reject(error)
    }
  })
  void stopped.catch(() => undefined)
  const unregister = registerStop(stop)
  const unsubscribe = session.on((event) => {
    if (event.agentId) return
    if (event.type === 'assistant.message') last = event
    if (event.type === 'session.idle') resolve(last)
    if (event.type === 'session.error' || event.type === 'session.shutdown') {
      const error = new Error(
        event.type === 'session.error' ? event.data.message : 'The SDK session shut down.',
      )
      if (!delivery.accepted) receipt.reject(error)
      failEvent(error)
      reject(error)
    }
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const timeout = new Promise<never>((_resolve, fail) => {
      timer = setTimeout(() => fail(new Error('Timed out waiting for the queued turn to finish.')), 3_600_000)
      timer.unref?.()
    })
    delivery.submit()
    const messageId = await Promise.race([
      session.send({ prompt: content, mode: 'immediate' }),
      stopped,
      eventFailure,
      timeout,
    ])
    if (!messageId) throw new Error('The SDK did not return a prompt acceptance ID.')
    delivery.accept()
    receipt.resolve()
    return await Promise.race([finished, stopped, timeout])
  } catch (error) {
    receipt.reject(error)
    throw error
  } finally {
    if (timer) clearTimeout(timer)
    unsubscribe()
    unregister()
  }
}
