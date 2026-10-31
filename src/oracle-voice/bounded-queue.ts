interface QueueEntry<T> {
  item: T
  bytes: number
}

interface QueueWaiter<T> {
  resolve: (item: T) => void
  reject: (reason: unknown) => void
  signal?: AbortSignal
  abort?: () => void
}

export class VoiceQueueOverflowError extends Error {
  constructor(message = 'voice queue byte limit exceeded') {
    super(message)
    this.name = 'VoiceQueueOverflowError'
  }
}

export class VoiceQueueClearedError extends Error {
  constructor(message = 'voice queue was cleared') {
    super(message)
    this.name = 'VoiceQueueClearedError'
  }
}

export class BoundedQueue<T> {
  private readonly maxBytes: number
  private readonly sizeOf: (item: T) => number
  private readonly items: QueueEntry<T>[] = []
  private readonly waiters: QueueWaiter<T>[] = []
  private byteCount = 0

  constructor(maxBytes: number, sizeOf: (item: T) => number) {
    if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
      throw new RangeError('maxBytes must be a positive safe integer')
    }
    this.maxBytes = maxBytes
    this.sizeOf = sizeOf
  }

  get bytes(): number {
    return this.byteCount
  }

  get length(): number {
    return this.items.length
  }

  push(item: T): void {
    const bytes = this.sizeOf(item)
    if (!Number.isSafeInteger(bytes) || bytes < 0) {
      throw new RangeError('queue item size must be a non-negative safe integer')
    }
    if (bytes > this.maxBytes || this.byteCount > this.maxBytes - bytes) {
      throw new VoiceQueueOverflowError()
    }

    const waiter = this.waiters.shift()
    if (waiter) {
      removeAbortListener(waiter)
      waiter.resolve(item)
      return
    }
    this.items.push({ item, bytes })
    this.byteCount += bytes
  }

  shift(): T | undefined {
    const entry = this.items.shift()
    if (!entry) return undefined
    this.byteCount -= entry.bytes
    return entry.item
  }

  wait(signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) return Promise.reject(abortReason(signal))
    if (this.items.length > 0) return Promise.resolve(this.shift() as T)

    return new Promise<T>((resolve, reject) => {
      const waiter: QueueWaiter<T> = { resolve, reject, signal }
      if (signal) {
        waiter.abort = () => {
          const index = this.waiters.indexOf(waiter)
          if (index >= 0) this.waiters.splice(index, 1)
          reject(abortReason(signal))
        }
        signal.addEventListener('abort', waiter.abort, { once: true })
      }
      this.waiters.push(waiter)
    })
  }

  clear(reason: unknown = new VoiceQueueClearedError()): void {
    this.items.length = 0
    this.byteCount = 0
    for (const waiter of this.waiters.splice(0)) {
      removeAbortListener(waiter)
      waiter.reject(reason)
    }
  }
}

function removeAbortListener<T>(waiter: QueueWaiter<T>): void {
  if (waiter.signal && waiter.abort) {
    waiter.signal.removeEventListener('abort', waiter.abort)
  }
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The operation was aborted', 'AbortError')
}
