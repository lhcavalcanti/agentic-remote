import { EventEmitter } from 'node:events'
import type { ForkOptions } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ParakeetChildMessage,
  ParakeetParentMessage,
} from './parakeet-worker-protocol.js'
import {
  PARAKEET_MAX_WINDOW_SECONDS,
  ParakeetTimeoutError,
  ParakeetUnavailableError,
  ParakeetWorker,
  type ParakeetChildProcess,
  type ParakeetWorkerOptions,
} from './parakeet-worker.js'

class FakeChild extends EventEmitter implements ParakeetChildProcess {
  readonly sent: ParakeetParentMessage[] = []
  readonly signals: NodeJS.Signals[] = []
  readonly pid: number
  connected = true

  constructor(pid: number) {
    super()
    this.pid = pid
  }

  send(message: ParakeetParentMessage, callback?: (error: Error | null) => void): boolean {
    this.sent.push(message)
    callback?.(null)
    return true
  }

  kill(signal: NodeJS.Signals = 'SIGTERM'): boolean {
    this.signals.push(signal)
    queueMicrotask(() => this.exit(null, signal))
    return true
  }

  post(message: ParakeetChildMessage): void {
    this.emit('message', message)
  }

  answer(text: string, request = this.sent.at(-1)!): void {
    this.post({
      type: 'result',
      id: request.id,
      result: { text, tokens: [], timestamps: [], durations: [] },
    })
  }

  exit(code: number | null, signal: NodeJS.Signals | null): void {
    if (!this.connected) return
    this.connected = false
    this.emit('exit', code, signal)
  }
}

const config = { modelDirectory: '/models/parakeet', threads: 4 }
const second = Float32Array.from({ length: 16_000 }, (_, index) => index % 7 / 7)

function harness(options: ParakeetWorkerOptions = {}) {
  const children: FakeChild[] = []
  const forks: Array<{ entry: string; args: string[]; options: ForkOptions }> = []
  const worker = new ParakeetWorker(config, options, {
    fork: (entry, args, forkOptions) => {
      forks.push({ entry, args, options: forkOptions })
      const child = new FakeChild(5_000 + children.length)
      children.push(child)
      return child
    },
  })
  return { worker, children, forks }
}

async function ready(worker: ParakeetWorker, children: FakeChild[]): Promise<FakeChild> {
  const starting = worker.start()
  const child = children.at(-1)!
  child.post({ type: 'ready' })
  await starting
  return child
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ParakeetWorker', () => {
  it('starts one isolated child that receives its configuration as arguments', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'secret-token')
    const { worker, children, forks } = harness()

    const starting = worker.start()

    expect(worker.state).toBe('starting')
    expect(forks).toHaveLength(1)
    expect(forks[0].entry).toMatch(/parakeet-child\.ts$/)
    expect(JSON.parse(forks[0].args[0])).toEqual(config)
    expect(forks[0].options).toMatchObject({
      execArgv: ['--import', 'tsx'],
      serialization: 'advanced',
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    })
    expect(forks[0].options.env).not.toHaveProperty('GITHUB_TOKEN')
    children[0].post({ type: 'ready' })
    await expect(starting).resolves.toBeUndefined()
    expect(worker.state).toBe('ready')
    expect(worker.pid).toBe(5_000)
    vi.unstubAllEnvs()
  })

  it('starts lazily on the first decode', async () => {
    const { worker, children } = harness()

    const decoding = worker.decode(second, { timeoutMs: 1_000 })
    expect(children).toHaveLength(1)
    expect(children[0].sent).toEqual([])
    children[0].post({ type: 'ready' })
    await vi.waitFor(() => expect(children[0].sent).toHaveLength(1))
    expect(children[0].sent[0]).toEqual({ type: 'decode', id: 1, samples: second })
    children[0].answer('hello')

    await expect(decoding).resolves.toEqual({
      text: 'hello',
      tokens: [],
      timestamps: [],
      durations: [],
    })
  })

  it('decodes one window at a time in arrival order', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const settled: string[] = []

    const decodes = ['first', 'second', 'third'].map((label) =>
      worker.decode(second, { timeoutMs: 1_000 }).then((result) => {
        settled.push(`${label}:${result.text}`)
      }))
    expect(child.sent).toHaveLength(1)
    child.answer('one')
    await vi.waitFor(() => expect(child.sent).toHaveLength(2))
    child.answer('two')
    await vi.waitFor(() => expect(child.sent).toHaveLength(3))
    child.answer('three')
    await Promise.all(decodes)

    expect(settled).toEqual(['first:one', 'second:two', 'third:three'])
    expect(child.sent.map(({ id }) => id)).toEqual([1, 2, 3])
  })

  it('declines a try while a decode is queued or active without queueing it', async () => {
    const { worker, children } = harness()
    const starting = worker.start()
    const queued = worker.decode(second, { timeoutMs: 1_000 })
    await expect(worker.tryDecode(second, { timeoutMs: 1_000 })).resolves.toBeNull()
    const child = children[0]
    child.post({ type: 'ready' })
    await starting
    expect(child.sent).toHaveLength(1)
    await expect(worker.tryDecode(second, { timeoutMs: 1_000 })).resolves.toBeNull()
    child.answer('queued')
    await queued

    const tried = worker.tryDecode(second, { timeoutMs: 1_000 })
    child.answer('tried')
    await expect(tried).resolves.toMatchObject({ text: 'tried' })
    expect(child.sent).toHaveLength(2)
  })

  it('kills a decode past its deadline and restarts the child on the next call', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)

    const decoding = worker.decode(second, { timeoutMs: 1_000 })
    const rejected = expect(decoding).rejects.toBeInstanceOf(ParakeetTimeoutError)
    await vi.advanceTimersByTimeAsync(1_000)
    await rejected
    expect(child.signals).toEqual(['SIGKILL'])
    expect(worker.state).toBe('stopped')

    const next = worker.decode(second, { timeoutMs: 1_000 })
    expect(children).toHaveLength(2)
    children[1].post({ type: 'ready' })
    await vi.waitFor(() => expect(children[1].sent).toHaveLength(1))
    children[1].answer('recovered')
    await expect(next).resolves.toMatchObject({ text: 'recovered' })
  })

  it('times out a queued decode without disturbing the active one', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const active = worker.decode(second, { timeoutMs: 5_000 })
    const queued = worker.decode(second, { timeoutMs: 1_000 })
    const rejected = expect(queued).rejects.toBeInstanceOf(ParakeetTimeoutError)

    await vi.advanceTimersByTimeAsync(1_000)
    await rejected
    child.answer('active')

    await expect(active).resolves.toMatchObject({ text: 'active' })
    expect(child.signals).toEqual([])
    expect(child.sent).toHaveLength(1)
  })

  it('rejects every pending call when the child exits', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const active = worker.decode(second, { timeoutMs: 1_000 })
    const queued = worker.decode(second, { timeoutMs: 1_000 })

    child.exit(null, 'SIGSEGV')

    await expect(active).rejects.toThrow(new ParakeetUnavailableError('worker exited (SIGSEGV)'))
    await expect(queued).rejects.toBeInstanceOf(ParakeetUnavailableError)
    expect(worker.state).toBe('stopped')
  })

  it('stays failed once the child crashes more often than its restart budget allows', async () => {
    const { worker, children } = harness({ maxRestarts: 2, restartWindowMs: 60_000 })
    await ready(worker, children)

    for (let restart = 0; restart < 2; restart += 1) {
      children.at(-1)!.exit(139, null)
      await ready(worker, children)
    }
    children.at(-1)!.exit(139, null)

    await expect(worker.decode(second, { timeoutMs: 1_000 })).rejects.toThrow(
      new ParakeetUnavailableError(
        'worker failed 3 times in 1 min (last: worker exited (code 139))',
      ),
    )
    expect(worker.state).toBe('failed')
    expect(children).toHaveLength(3)
    await expect(worker.start()).rejects.toBeInstanceOf(ParakeetUnavailableError)
  })

  it('forgets restarts older than the restart window', async () => {
    const { worker, children } = harness({ maxRestarts: 1, restartWindowMs: 60_000 })
    await ready(worker, children)
    children.at(-1)!.exit(139, null)
    await ready(worker, children)

    await vi.advanceTimersByTimeAsync(60_000)
    children.at(-1)!.exit(139, null)
    await ready(worker, children)

    expect(worker.state).toBe('ready')
    expect(children).toHaveLength(3)
  })

  it('stays failed when the child cannot load its model', async () => {
    const { worker, children } = harness()
    const starting = worker.start()

    children[0].post({ type: 'failed', message: 'model file is missing: encoder.int8.onnx' })

    await expect(starting).rejects.toThrow(
      new ParakeetUnavailableError('model file is missing: encoder.int8.onnx'),
    )
    expect(worker.state).toBe('failed')
    await expect(worker.decode(second, { timeoutMs: 1_000 })).rejects.toThrow(
      'model file is missing: encoder.int8.onnx',
    )
    expect(children).toHaveLength(1)
  })

  it('restarts a child that stops sending heartbeats', async () => {
    const { worker, children } = harness({ heartbeatTimeoutMs: 30_000 })
    const child = await ready(worker, children)
    const decoding = worker.decode(second, { timeoutMs: 120_000 })

    await vi.advanceTimersByTimeAsync(20_000)
    child.post({ type: 'heartbeat' })
    await vi.advanceTimersByTimeAsync(20_000)
    expect(child.signals).toEqual([])
    const rejected = expect(decoding).rejects.toThrow(
      new ParakeetUnavailableError('worker stopped responding'),
    )
    await vi.advanceTimersByTimeAsync(10_000)

    await rejected
    expect(child.signals).toEqual(['SIGKILL'])
    expect(worker.state).toBe('stopped')
  })

  it('gives up on a child that does not become ready in time', async () => {
    const { worker, children } = harness({ startupTimeoutMs: 60_000 })
    const starting = worker.start()
    const rejected = expect(starting).rejects.toThrow(
      new ParakeetUnavailableError('worker did not start within 60 s'),
    )

    await vi.advanceTimersByTimeAsync(60_000)

    await rejected
    expect(children[0].signals).toEqual(['SIGKILL'])
    expect(worker.state).toBe('stopped')
  })

  it(`refuses a window longer than ${PARAKEET_MAX_WINDOW_SECONDS} seconds`, async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)

    await expect(worker.decode(
      new Float32Array(PARAKEET_MAX_WINDOW_SECONDS * 16_000 + 1),
      { timeoutMs: 1_000 },
    )).rejects.toBeInstanceOf(RangeError)
    await expect(worker.decode(new Float32Array(0), { timeoutMs: 1_000 }))
      .rejects.toBeInstanceOf(RangeError)
    expect(child.sent).toEqual([])

    const longest = worker.decode(
      new Float32Array(PARAKEET_MAX_WINDOW_SECONDS * 16_000),
      { timeoutMs: 1_000 },
    )
    child.answer('fits')
    await expect(longest).resolves.toMatchObject({ text: 'fits' })
  })

  it('drops a queued decode whose caller aborts before it is sent', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const active = worker.decode(second, { timeoutMs: 1_000 })
    const controller = new AbortController()
    const queued = worker.decode(second, { timeoutMs: 1_000, signal: controller.signal })

    controller.abort()

    await expect(queued).rejects.toMatchObject({ name: 'AbortError' })
    child.answer('active')
    await active
    await vi.advanceTimersByTimeAsync(0)
    expect(child.sent).toHaveLength(1)
    await expect(worker.decode(second, {
      timeoutMs: 1_000,
      signal: AbortSignal.abort(),
    })).rejects.toMatchObject({ name: 'AbortError' })
    expect(child.sent).toHaveLength(1)
  })

  it('discards the result of a decode aborted while the child works on it', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const controller = new AbortController()
    const aborted = worker.decode(second, { timeoutMs: 1_000, signal: controller.signal })
    const next = worker.decode(second, { timeoutMs: 1_000 })

    controller.abort()
    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' })
    expect(child.sent).toHaveLength(1)
    child.answer('discarded')
    await vi.waitFor(() => expect(child.sent).toHaveLength(2))
    child.answer('kept')

    await expect(next).resolves.toMatchObject({ text: 'kept' })
  })

  it('rejects a decode the child could not complete', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const decoding = worker.decode(second, { timeoutMs: 1_000 })

    child.post({ type: 'error', id: 1, message: 'Invalid input shape' })

    await expect(decoding).rejects.toThrow('decode failed: Invalid input shape')
    expect(worker.state).toBe('ready')
  })

  it('treats a malformed child message as a lost worker', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const decoding = worker.decode(second, { timeoutMs: 1_000 })

    child.emit('message', { type: 'result', id: 1, result: { text: 7 } })

    await expect(decoding).rejects.toThrow(
      new ParakeetUnavailableError('worker sent a malformed message'),
    )
    expect(child.signals).toEqual(['SIGKILL'])
  })

  it('stops the child and rejects pending calls', async () => {
    const { worker, children } = harness()
    const child = await ready(worker, children)
    const active = worker.decode(second, { timeoutMs: 1_000 })
    const queued = worker.decode(second, { timeoutMs: 1_000 })

    await worker.stop()

    await expect(active).rejects.toThrow(new ParakeetUnavailableError('worker is stopped'))
    await expect(queued).rejects.toBeInstanceOf(ParakeetUnavailableError)
    expect(child.signals).toEqual(['SIGTERM'])
    expect(worker.state).toBe('stopped')
    await expect(worker.decode(second, { timeoutMs: 1_000 }))
      .rejects.toBeInstanceOf(ParakeetUnavailableError)
    expect(children).toHaveLength(1)
  })
})
