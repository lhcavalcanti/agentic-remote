import { describe, expect, it } from 'vitest'
import {
  BoundedQueue,
  VoiceQueueClearedError,
  VoiceQueueOverflowError,
} from './bounded-queue'

describe('BoundedQueue', () => {
  it('accounts bytes and refuses overflow without mutating the queue', () => {
    const queue = new BoundedQueue<Uint8Array>(6, (item) => item.byteLength)
    queue.push(new Uint8Array(4))

    expect(() => queue.push(new Uint8Array(3))).toThrow(VoiceQueueOverflowError)
    expect(queue.bytes).toBe(4)
    expect(queue.length).toBe(1)
    expect(queue.shift()?.byteLength).toBe(4)
    expect(queue.bytes).toBe(0)
  })

  it('delivers pushed input directly to the oldest waiter', async () => {
    const queue = new BoundedQueue<string>(10, (item) => item.length)
    const first = queue.wait()
    const second = queue.wait()

    queue.push('one')
    queue.push('two')

    await expect(first).resolves.toBe('one')
    await expect(second).resolves.toBe('two')
    expect(queue.length).toBe(0)
    expect(queue.bytes).toBe(0)
  })

  it('resolves wait immediately from queued input', async () => {
    const queue = new BoundedQueue<string>(10, (item) => item.length)
    queue.push('ready')

    await expect(queue.wait()).resolves.toBe('ready')
    expect(queue.length).toBe(0)
  })

  it('aborts a waiter without consuming later input', async () => {
    const queue = new BoundedQueue<string>(10, (item) => item.length)
    const controller = new AbortController()
    const waiting = queue.wait(controller.signal)
    controller.abort(new Error('cancelled'))
    queue.push('kept')

    await expect(waiting).rejects.toThrow('cancelled')
    expect(queue.shift()).toBe('kept')
  })

  it('does not consume queued input for an already-aborted wait', async () => {
    const queue = new BoundedQueue<string>(10, (item) => item.length)
    const controller = new AbortController()
    queue.push('kept')
    controller.abort(new Error('cancelled'))

    await expect(queue.wait(controller.signal)).rejects.toThrow('cancelled')
    expect(queue.shift()).toBe('kept')
  })

  it('clear empties input and rejects all waiters with the supplied reason', async () => {
    const queue = new BoundedQueue<string>(10, (item) => item.length)
    queue.push('old')
    queue.shift()
    const waiting = queue.wait()
    const reason = new Error('socket closed')

    queue.clear(reason)

    await expect(waiting).rejects.toBe(reason)
    expect(queue.length).toBe(0)
    expect(queue.bytes).toBe(0)
  })

  it('uses a typed rejection when clear has no explicit reason', async () => {
    const queue = new BoundedQueue<string>(10, (item) => item.length)
    const waiting = queue.wait()
    queue.clear()

    await expect(waiting).rejects.toBeInstanceOf(VoiceQueueClearedError)
  })

  it('rejects invalid queue limits and item sizes', () => {
    expect(() => new BoundedQueue(0, () => 0)).toThrow(RangeError)
    const queue = new BoundedQueue<string>(10, () => -1)
    expect(() => queue.push('bad')).toThrow(RangeError)
    expect(queue.length).toBe(0)
  })
})
