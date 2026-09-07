import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CopilotSessionLike } from './agent-service.js'
import { acceptanceReceipt, QueuedDelivery } from './queued-dispatch.js'
import { queuedSdkPrompt } from './queued-sdk-prompt.js'

const disposals: (() => void)[] = []

function fixture(send = vi.fn(async () => 'receipt-id')) {
  const handlers = new Set<(event: SessionEvent) => void>()
  const session = {
    sessionId: 'session',
    send,
    sendAndWait: vi.fn(),
    on: (handler: (event: SessionEvent) => void) => {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
  } as unknown as CopilotSessionLike
  const receipt = acceptanceReceipt()
  const delivery = new QueuedDelivery('attempt')
  const unregister = vi.fn()
  let stop = () => {}
  disposals.push(() => { receipt.dispose(); stop() })
  const run = queuedSdkPrompt(session, '  exact prompt  \n', delivery, receipt, (callback) => {
    stop = callback
    return unregister
  })
  void run.catch(() => undefined)
  function emit(type: string, data: unknown = {}, agentId?: string) {
    for (const handler of handlers) {
      handler({
        id: type, type, data, timestamp: '2026-09-05T00:00:00.000Z',
        parentId: null, ...(agentId ? { agentId } : {}),
      } as SessionEvent)
    }
  }
  return { session, send, receipt, delivery, run, emit, unregister, stop: () => stop(), handlers }
}

afterEach(() => {
  disposals.splice(0).forEach((dispose) => dispose())
  vi.useRealTimers()
})

describe('queued SDK acceptance', () => {
  it('accepts a send ID without waiting for the turn or making a second submission', async () => {
    const { send, session, receipt, delivery, run, emit, handlers, unregister } = fixture()
    const finished = vi.fn()
    void run.then(finished)
    await receipt.promise
    expect(delivery.accepted).toBe(true)
    expect(finished).not.toHaveBeenCalled()
    expect(send).toHaveBeenCalledExactlyOnceWith({ prompt: '  exact prompt  \n', mode: 'immediate' })
    expect(session.sendAndWait).not.toHaveBeenCalled()
    emit('assistant.message', { content: 'Final answer' })
    emit('session.idle')
    expect(await run).toMatchObject({ type: 'assistant.message', data: { content: 'Final answer' } })
    expect(unregister).toHaveBeenCalledTimes(1)
    expect(handlers.size).toBe(0)
  })

  it('does not mistake worker completion for foreground completion', async () => {
    const { receipt, run, emit } = fixture()
    const done = vi.fn()
    void run.then(done)
    await receipt.promise
    emit('assistant.message', { content: 'Worker answer' }, 'worker')
    emit('session.idle', {}, 'worker')
    await Promise.resolve()
    expect(done).not.toHaveBeenCalled()
    emit('session.idle')
    expect(await run).toBeUndefined()
  })

  it('buffers a completed turn without substituting completion for a missing acceptance receipt', async () => {
    let accept = (_id: string) => {}
    const pending = new Promise<string>((resolve) => { accept = resolve })
    const { receipt, run, emit, delivery } = fixture(vi.fn(() => pending))
    const accepted = vi.fn()
    void receipt.promise.then(accepted)
    emit('assistant.message', { content: 'Fast answer' })
    emit('session.idle')
    await Promise.resolve()
    expect(accepted).not.toHaveBeenCalled()
    expect(delivery.accepted).toBe(false)
    accept('actual-receipt')
    await receipt.promise
    expect(await run).toMatchObject({ data: { content: 'Fast answer' } })
  })

  it.each(['session.error', 'session.shutdown'])(
    'settles %s while the SDK receipt itself is still pending',
    async (type) => {
      const { receipt, run, emit, delivery, handlers } = fixture(vi.fn(() => new Promise<string>(() => {})))
      const receiptFailure = expect(receipt.promise).rejects.toThrow()
      const turnFailure = expect(run).rejects.toThrow()
      emit(type, { message: 'Runtime disconnected' })
      await Promise.all([receiptFailure, turnFailure])
      expect(delivery.submitted).toBe(true)
      expect(delivery.accepted).toBe(false)
      expect(handlers.size).toBe(0)
    },
  )

  it('keeps an accepted receipt accepted even if the later turn fails', async () => {
    const { receipt, run, emit, delivery } = fixture()
    await receipt.promise
    const failed = expect(run).rejects.toThrow('Later failure')
    emit('session.error', { message: 'Later failure' })
    await failed
    expect(delivery.accepted).toBe(true)
    await expect(receipt.promise).resolves.toBeUndefined()
  })

  it('settles pending receipt and work on stop and ignores a late receipt', async () => {
    let release = (_id: string) => {}
    const pending = new Promise<string>((resolve) => { release = resolve })
    const { receipt, run, delivery, stop, unregister, handlers } = fixture(vi.fn(() => pending))
    const failedReceipt = expect(receipt.promise).rejects.toThrow('stopped')
    const failedTurn = expect(run).rejects.toThrow('stopped')
    stop()
    await Promise.all([failedReceipt, failedTurn])
    release('late-receipt')
    await Promise.resolve()
    expect(delivery.accepted).toBe(false)
    expect(delivery.closed).toBe(true)
    expect(handlers.size).toBe(0)
    expect(unregister).toHaveBeenCalledTimes(1)
  })

  it('bounds missing receipts to ten seconds and outstanding turns to one hour', async () => {
    vi.useFakeTimers()
    const { receipt, run, delivery, handlers } = fixture(vi.fn(() => new Promise<string>(() => {})))
    const receiptFailure = expect(receipt.promise).rejects.toMatchObject({ uncertainDelivery: true })
    const turnFailure = expect(run).rejects.toThrow('queued turn to finish')
    await vi.advanceTimersByTimeAsync(10_001)
    await receiptFailure
    expect(delivery.accepted).toBe(false)
    expect(handlers.size).toBe(1)
    await vi.advanceTimersByTimeAsync(3_600_000)
    await turnFailure
    expect(handlers.size).toBe(0)
  })

  it('does not invoke the SDK when dispatch was closed before submission', async () => {
    const send = vi.fn(async () => 'unexpected')
    const session = { send, on: () => () => {} } as unknown as CopilotSessionLike
    const delivery = new QueuedDelivery('closed')
    delivery.closed = true
    const receipt = acceptanceReceipt()
    disposals.push(receipt.dispose)
    const run = queuedSdkPrompt(session, 'text', delivery, receipt, () => () => {})
    await expect(run).rejects.toMatchObject({ uncertainDelivery: false })
    await expect(receipt.promise).rejects.toMatchObject({ uncertainDelivery: false })
    expect(send).not.toHaveBeenCalled()
  })
})
