import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type WebSocket from 'ws'
import {
  encodeDictationAudioFrame,
  parseDictationServerMessage,
  type DictationServerMessage,
} from '../shared/dictation.js'
import {
  LiveDictationHost,
  type LiveDictationEngine,
  type LiveDictationEngineState,
} from './live-dictation-host.js'
import type { LiveDecodeOptions, LiveDecodeResult } from './live-dictation-session.js'

class FakeSocket extends EventEmitter {
  readyState = 1
  bufferedAmount = 0
  readonly sent: DictationServerMessage[] = []
  closed: { code: number; reason: string } | undefined

  send(data: string, callback?: (error?: Error) => void): void {
    this.sent.push(parseDictationServerMessage(data))
    callback?.()
  }

  close(code = 1000, reason = ''): void {
    if (this.readyState !== 1) return
    this.readyState = 3
    this.closed = { code, reason }
    this.emit('close', code, Buffer.from(reason))
  }

  start(streamId = 'stream-1'): void {
    this.text({ protocol: 1, type: 'start', streamId })
  }

  control(type: 'stop' | 'cancel' | 'heartbeat'): void {
    this.text({ protocol: 1, type })
  }

  text(message: unknown): void {
    this.emit('message', Buffer.from(typeof message === 'string' ? message : JSON.stringify(message)), false)
  }

  audio(sequence: number, samples = new Int16Array(1_600).fill(800)): void {
    this.emit('message', Buffer.from(encodeDictationAudioFrame(sequence, samples)), true)
  }

  /** Sends `seconds` of 100 ms frames, numbered on from `next`. */
  speak(seconds: number, next = 1): number {
    for (let frame = 0; frame < Math.round(seconds * 10); frame += 1) this.audio(next + frame)
    return next + Math.round(seconds * 10)
  }

  types(): string[] {
    return this.sent.filter((message) => message.type !== 'heartbeat').map((message) => message.type)
  }
}

class FakeEngine implements LiveDictationEngine {
  state: LiveDictationEngineState = 'ready'
  tryDecodes = 0
  decodes = 0
  failPasses = false
  failFinal = false

  async tryDecode(samples: Float32Array, _options: LiveDecodeOptions): Promise<LiveDecodeResult | null> {
    this.tryDecodes += 1
    if (this.failPasses) throw new Error('worker exited')
    return words(samples, 'hello world')
  }

  async decode(samples: Float32Array, _options: LiveDecodeOptions): Promise<LiveDecodeResult> {
    this.decodes += 1
    if (this.failFinal) throw new Error('worker exited')
    return words(samples, 'hello world again')
  }
}

/** An engine that starts on demand, as the Parakeet worker does after a crash. */
class LazyEngine extends FakeEngine {
  starts = 0
  startFails = false

  constructor() {
    super()
    this.state = 'stopped'
  }

  start(): Promise<void> {
    this.starts += 1
    if (this.startFails) {
      this.state = 'failed'
      return Promise.reject(new Error('restart budget exhausted'))
    }
    this.state = 'starting'
    return new Promise((resolve) => setTimeout(() => {
      this.state = 'ready'
      resolve()
    }, 2_500))
  }
}

/** Words a quarter second apart from the start of the window. */
function words(_samples: Float32Array, text: string): LiveDecodeResult {
  const list = text.split(' ')
  return {
    text,
    tokens: list.map((word) => ` ${word}`),
    timestamps: list.map((_word, index) => 0.05 + index * 0.25),
    durations: list.map(() => 0.2),
  }
}

const logs: Array<Record<string, unknown>> = []
const log = {
  info: (object: Record<string, unknown>) => logs.push(object),
  warn: (object: Record<string, unknown>) => logs.push(object),
}

function host(engine?: FakeEngine, session = {}) {
  return new LiveDictationHost({ engine, computerName: () => 'Studio', log, session })
}

function attach(dictation: LiveDictationHost): FakeSocket {
  const socket = new FakeSocket()
  dictation.attach(socket as unknown as WebSocket)
  return socket
}

beforeEach(() => {
  vi.useFakeTimers()
  logs.length = 0
})

afterEach(() => {
  vi.useRealTimers()
})

describe('live dictation host capabilities', () => {
  it.each([
    ['ready', true],
    ['starting', true],
    ['stopped', false],
    ['failed', false],
  ] as const)('reports a %s engine as live: %s', (state, live) => {
    const engine = new FakeEngine()
    engine.state = state
    expect(host(engine).capabilities()).toMatchObject({ live, computerName: 'Studio' })
  })

  it('reports an engine that starts on demand as live while it is stopped', () => {
    expect(host(new LazyEngine()).capabilities()).toMatchObject({ live: true, computerName: 'Studio' })
  })

  it('names the Parakeet engine when this computer has none', () => {
    expect(host().capabilities()).toEqual({
      live: false,
      reason: 'Live dictation needs the Parakeet engine on Studio',
      computerName: 'Studio',
    })
  })
})

describe('live dictation host streams', () => {
  it('streams text to its socket and ends Stop with the final text', async () => {
    const engine = new FakeEngine()
    const dictation = host(engine)
    const socket = attach(dictation)
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(socket.types()).toEqual(['ready'])
    socket.speak(1)
    await vi.advanceTimersByTimeAsync(750)
    expect(socket.sent.at(-1)).toEqual({
      protocol: 1, type: 'text', seq: 1, committedAppend: '', tentative: 'hello world',
    })
    socket.control('stop')
    await vi.advanceTimersByTimeAsync(0)
    expect(socket.sent.at(-1)).toEqual({ protocol: 1, type: 'final', text: 'hello world again', reason: 'stop' })
    expect(socket.closed?.code).toBe(1000)
    expect(dictation.busy).toBe(false)
    expect(logs).toEqual([expect.objectContaining({
      streamId: 'stream-1', audioSeconds: 1, passes: 1, outcome: 'final',
    })])
    expect(JSON.stringify(logs)).not.toMatch(/hello/)
  })

  it('refuses a second stream as busy and sends it nothing else', async () => {
    const dictation = host(new FakeEngine())
    const first = attach(dictation)
    first.start('first')
    const second = attach(dictation)
    second.start('second')
    await vi.advanceTimersByTimeAsync(0)
    expect(second.sent).toEqual([{
      protocol: 1, type: 'error', code: 'busy', message: 'Live dictation is already in use on Studio', fatal: true,
    }])
    expect(second.closed?.code).toBe(1013)
    first.speak(1)
    await vi.advanceTimersByTimeAsync(750)
    expect(first.types()).toEqual(['ready', 'text'])
    expect(second.sent).toHaveLength(1)
  })

  it.each([
    ['no engine', undefined, 'Live dictation needs the Parakeet engine on Studio'],
    ['a failed engine', 'failed', 'Parakeet is unavailable on Studio'],
  ] as const)('reports %s as unavailable', async (_label, state, message) => {
    const engine = state ? Object.assign(new FakeEngine(), { state }) : undefined
    const socket = attach(host(engine))
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(socket.sent).toEqual([{ protocol: 1, type: 'error', code: 'unavailable', message, fatal: true }])
    expect(socket.closed?.code).toBe(1011)
  })

  it('waits for a starting engine before it is ready', async () => {
    const engine = new FakeEngine()
    engine.state = 'starting'
    const socket = attach(host(engine))
    socket.start()
    await vi.advanceTimersByTimeAsync(4_000)
    expect(socket.types()).toEqual([])
    engine.state = 'ready'
    await vi.advanceTimersByTimeAsync(250)
    expect(socket.types()).toEqual(['ready'])
  })

  it('starts a stopped engine and waits for it before it is ready', async () => {
    const engine = new LazyEngine()
    const socket = attach(host(engine))
    socket.start()
    await vi.advanceTimersByTimeAsync(2_000)
    expect(engine.starts).toBe(1)
    expect(socket.types()).toEqual([])
    await vi.advanceTimersByTimeAsync(1_000)
    expect(socket.types()).toEqual(['ready'])
  })

  it('reports a stopped engine that cannot start again as unavailable', async () => {
    const engine = new LazyEngine()
    engine.startFails = true
    const socket = attach(host(engine))
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(engine.starts).toBe(1)
    expect(socket.sent).toEqual([{
      protocol: 1, type: 'error', code: 'unavailable', message: 'Parakeet is unavailable on Studio', fatal: true,
    }])
    expect(socket.closed?.code).toBe(1011)
  })

  it('abandons a stream cancelled while the engine warms up', async () => {
    const engine = new FakeEngine()
    engine.state = 'starting'
    const dictation = host(engine)
    const socket = attach(dictation)
    socket.start()
    await vi.advanceTimersByTimeAsync(1_000)
    socket.control('cancel')
    expect(dictation.busy).toBe(false)
    engine.state = 'ready'
    await vi.advanceTimersByTimeAsync(5_000)
    expect(socket.types()).toEqual([])
    expect(dictation.busy).toBe(false)
    // No session was left running for the abandoned stream.
    expect(vi.getTimerCount()).toBe(0)
  })

  it('gives up on an engine that does not become ready within a minute', async () => {
    const engine = new FakeEngine()
    engine.state = 'starting'
    const socket = attach(host(engine))
    socket.start()
    for (let second = 0; second < 60; second += 5) {
      await vi.advanceTimersByTimeAsync(5_000)
      socket.control('heartbeat')
    }
    expect(socket.sent.at(-1)).toMatchObject({ type: 'error', code: 'unavailable', fatal: true })
    expect(socket.closed?.code).toBe(1011)
  })

  it('cancels without a final text and stops decoding', async () => {
    const engine = new FakeEngine()
    const dictation = host(engine)
    const socket = attach(dictation)
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    const next = socket.speak(1)
    await vi.advanceTimersByTimeAsync(750)
    socket.control('cancel')
    expect(socket.closed?.code).toBe(1000)
    expect(socket.types()).toEqual(['ready', 'text'])
    socket.speak(1, next)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(engine.tryDecodes).toBe(1)
    expect(engine.decodes).toBe(0)
    expect(dictation.busy).toBe(false)
    expect(logs).toEqual([expect.objectContaining({ outcome: 'cancelled' })])
  })

  it('sends heartbeats and ends a stream that hears nothing for fifteen seconds', async () => {
    const socket = attach(host(new FakeEngine()))
    socket.start()
    await vi.advanceTimersByTimeAsync(10_000)
    socket.control('heartbeat')
    await vi.advanceTimersByTimeAsync(14_999)
    expect(socket.closed).toBeUndefined()
    expect(socket.sent.filter((message) => message.type === 'heartbeat')).toHaveLength(4)
    await vi.advanceTimersByTimeAsync(1)
    expect(socket.sent.at(-1)).toMatchObject({ type: 'error', code: 'stalled', fatal: true })
    expect(socket.closed).toBeDefined()
  })

  it.each([
    ['a frame over 32 KiB', (socket: FakeSocket) => socket.audio(1, new Int16Array(16_400)), 'frame_too_large', 1009],
    ['a sequence gap', (socket: FakeSocket) => { socket.audio(1); socket.audio(3) }, 'protocol', 1008],
    ['a second start', (socket: FakeSocket) => socket.start('again'), 'protocol', 1008],
    ['invalid JSON', (socket: FakeSocket) => socket.text('{"protocol":1'), 'protocol', 1008],
  ])('ends the stream on %s', async (_label, send, code, closeCode) => {
    const socket = attach(host(new FakeEngine()))
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    send(socket)
    expect(socket.sent.at(-1)).toMatchObject({ type: 'error', code, fatal: true })
    expect(socket.closed?.code).toBe(closeCode)
  })

  it('refuses audio before it is ready', async () => {
    const engine = new FakeEngine()
    engine.state = 'starting'
    const socket = attach(host(engine))
    socket.start()
    socket.audio(1)
    expect(socket.sent.at(-1)).toMatchObject({ type: 'error', code: 'protocol', fatal: true })
  })

  it('ends with a final text at the duration limit', async () => {
    const socket = attach(host(new FakeEngine(), { maxDurationMs: 1_000 }))
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    socket.speak(1)
    await vi.advanceTimersByTimeAsync(0)
    expect(socket.sent.at(-1)).toEqual({
      protocol: 1, type: 'final', text: 'hello world again', reason: 'duration_limit',
    })
    expect(socket.closed?.code).toBe(1000)
  })

  it('keeps the committed text when the engine keeps failing', async () => {
    const engine = new FakeEngine()
    const socket = attach(host(engine))
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    let next = socket.speak(1)
    await vi.advanceTimersByTimeAsync(750)
    next = socket.speak(1, next)
    await vi.advanceTimersByTimeAsync(750)
    engine.failPasses = true
    for (let pass = 0; pass < 3; pass += 1) {
      next = socket.speak(1, next)
      await vi.advanceTimersByTimeAsync(750)
    }
    expect(socket.sent.slice(-2)).toEqual([
      { protocol: 1, type: 'error', code: 'engine_failed', message: expect.any(String), fatal: true },
      { protocol: 1, type: 'final', text: 'hello world' },
    ])
    expect(socket.closed?.code).toBe(1011)
  })

  it('keeps the committed text when the final decode fails', async () => {
    const engine = new FakeEngine()
    const socket = attach(host(engine))
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    const next = socket.speak(1)
    await vi.advanceTimersByTimeAsync(750)
    socket.speak(1, next)
    await vi.advanceTimersByTimeAsync(750)
    engine.failFinal = true
    socket.control('stop')
    await vi.advanceTimersByTimeAsync(0)
    expect(socket.sent.slice(-2)).toEqual([
      { protocol: 1, type: 'error', code: 'engine_failed', message: expect.any(String), fatal: true },
      { protocol: 1, type: 'final', text: 'hello world' },
    ])
  })

  it('ends a stream whose socket stops draining', async () => {
    const socket = attach(host(new FakeEngine()))
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    socket.bufferedAmount = 384_000
    socket.speak(1)
    await vi.advanceTimersByTimeAsync(750)
    expect(socket.sent.at(-1)).toMatchObject({ type: 'error', code: 'backpressure', fatal: true })
    expect(socket.closed?.code).toBe(1013)
  })

  it('cancels the stream when its socket closes', async () => {
    const engine = new FakeEngine()
    const dictation = host(engine)
    const socket = attach(dictation)
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    socket.speak(1)
    socket.close(1001)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(engine.tryDecodes).toBe(0)
    expect(dictation.busy).toBe(false)
    expect(logs).toEqual([expect.objectContaining({ outcome: 'disconnected' })])
  })

  it('closes its streams when the server shuts down', async () => {
    const dictation = host(new FakeEngine())
    const socket = attach(dictation)
    socket.start()
    await vi.advanceTimersByTimeAsync(0)
    await dictation.close()
    expect(socket.closed?.code).toBe(1001)
    expect(dictation.busy).toBe(false)
  })
})
