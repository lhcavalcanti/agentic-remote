import {
  fork as forkChildProcess,
  type ForkOptions,
} from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  isParakeetChildMessage,
  PARAKEET_SAMPLE_RATE,
  parakeetChildArguments,
  type ParakeetChildMessage,
  type ParakeetDecodeResult,
  type ParakeetParentMessage,
} from './parakeet-worker-protocol.js'
import { minimalWorkerEnvironment } from './worker-environment.js'
import type { ParakeetConfig } from './transcription-engine-config.js'

export type { ParakeetDecodeResult } from './parakeet-worker-protocol.js'

/** Missing assets, a crash, a lost heartbeat, or an exhausted restart budget. */
export class ParakeetUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParakeetUnavailableError'
  }
}

export class ParakeetTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParakeetTimeoutError'
  }
}

export const PARAKEET_MAX_WINDOW_SECONDS = 30
const MAX_WINDOW_SAMPLES = PARAKEET_MAX_WINDOW_SECONDS * PARAKEET_SAMPLE_RATE

export interface ParakeetWorkerOptions {
  /** Default 60 s. */
  startupTimeoutMs?: number
  /** Default 30 s; the child sends a heartbeat every 5 s. */
  heartbeatTimeoutMs?: number
  /** Default 3 restarts within `restartWindowMs`. */
  maxRestarts?: number
  /** Default 10 minutes. */
  restartWindowMs?: number
  /** How long `stop()` waits for SIGTERM before SIGKILL. Default 2 s. */
  shutdownTimeoutMs?: number
}

export interface ParakeetChildProcess {
  readonly pid?: number
  send(message: ParakeetParentMessage, callback?: (error: Error | null) => void): boolean
  kill(signal?: NodeJS.Signals): boolean
  on(event: 'message', listener: (message: unknown) => void): this
  on(event: 'exit', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this
  on(event: 'error', listener: (error: Error) => void): this
}

export interface ParakeetWorkerDependencies {
  fork: (entry: string, args: string[], options: ForkOptions) => ParakeetChildProcess
}

export type ParakeetWorkerState = 'stopped' | 'starting' | 'ready' | 'failed'

export interface ParakeetDecodeOptions {
  /** Measured from the call, including time spent waiting behind other decodes. */
  timeoutMs: number
  signal?: AbortSignal
}

type Timer = ReturnType<typeof setTimeout>

interface ChildHandle {
  process: ParakeetChildProcess
  exited: Promise<void>
  hasExited: boolean
}

interface Startup {
  promise: Promise<void>
  resolve: () => void
  reject: (error: Error) => void
  timer: Timer
}

interface DecodeRequest {
  id: number
  samples: Float32Array
  timeoutMs: number
  resolve: (result: ParakeetDecodeResult) => void
  reject: (error: Error) => void
  timer?: Timer
  signal?: AbortSignal
  onAbort?: () => void
  settled: boolean
}

/**
 * One warm Parakeet recognizer in a forked child, so a native crash cannot
 * stop the server. Decodes run one at a time in arrival order.
 */
export class ParakeetWorker {
  #state: ParakeetWorkerState = 'stopped'
  #child: ChildHandle | undefined
  #startup: Startup | undefined
  #heartbeat: Timer | undefined
  #active: DecodeRequest | undefined
  readonly #queue: DecodeRequest[] = []
  #nextId = 1
  #everStarted = false
  #restarts: number[] = []
  #lastLoss = 'unknown'
  #failure = ''
  #closed = false
  #stopping: Promise<void> | undefined
  readonly #config: ParakeetConfig
  readonly #options: Required<ParakeetWorkerOptions>
  readonly #dependencies: ParakeetWorkerDependencies

  constructor(
    config: ParakeetConfig,
    options: ParakeetWorkerOptions = {},
    dependencies: Partial<ParakeetWorkerDependencies> = {},
  ) {
    this.#config = config
    this.#options = {
      startupTimeoutMs: options.startupTimeoutMs ?? 60_000,
      heartbeatTimeoutMs: options.heartbeatTimeoutMs ?? 30_000,
      maxRestarts: options.maxRestarts ?? 3,
      restartWindowMs: options.restartWindowMs ?? 600_000,
      shutdownTimeoutMs: options.shutdownTimeoutMs ?? 2_000,
    }
    this.#dependencies = {
      fork: dependencies.fork ?? ((entry, args, forkOptions) =>
        forkChildProcess(entry, args, forkOptions)),
    }
  }

  get state(): ParakeetWorkerState {
    return this.#state
  }

  /** The child's process id while one runs, for resource measurements. */
  get pid(): number | undefined {
    return this.#child?.process.pid
  }

  start(): Promise<void> {
    if (this.#closed) return Promise.reject(new ParakeetUnavailableError('worker is stopped'))
    if (this.#state === 'failed') {
      return Promise.reject(new ParakeetUnavailableError(this.#failure))
    }
    if (this.#state === 'ready') return Promise.resolve()
    if (this.#startup) return this.#startup.promise
    if (this.#everStarted && !this.#admitRestart()) {
      const minutes = Math.round(this.#options.restartWindowMs / 60_000)
      this.#fail(
        `worker failed ${this.#options.maxRestarts + 1} times in ${minutes} min `
        + `(last: ${this.#lastLoss})`,
      )
      return Promise.reject(new ParakeetUnavailableError(this.#failure))
    }
    this.#everStarted = true
    return this.#spawn()
  }

  /** Queued in arrival order. Rejects a window over 30 s of 16 kHz samples. */
  decode(samples: Float32Array, options: ParakeetDecodeOptions): Promise<ParakeetDecodeResult> {
    if (!(samples instanceof Float32Array) || samples.length === 0 || samples.length > MAX_WINDOW_SAMPLES) {
      return Promise.reject(new RangeError(
        `Parakeet decodes 1 to ${MAX_WINDOW_SAMPLES} samples (${PARAKEET_MAX_WINDOW_SECONDS} s) at a time`,
      ))
    }
    if (this.#closed) return Promise.reject(new ParakeetUnavailableError('worker is stopped'))
    if (this.#state === 'failed') {
      return Promise.reject(new ParakeetUnavailableError(this.#failure))
    }
    if (options.signal?.aborted) return Promise.reject(abortError(options.signal))
    return new Promise<ParakeetDecodeResult>((resolve, reject) => {
      const request: DecodeRequest = {
        id: this.#nextId++,
        samples,
        timeoutMs: options.timeoutMs,
        resolve,
        reject,
        signal: options.signal,
        settled: false,
      }
      request.timer = setTimeout(() => this.#timeOut(request), options.timeoutMs)
      if (request.signal) {
        request.onAbort = () => this.#abort(request)
        request.signal.addEventListener('abort', request.onAbort, { once: true })
      }
      this.#queue.push(request)
      if (this.#state === 'stopped') {
        // A failed start rejects the queue, this request included.
        void this.start().catch(() => undefined)
      } else {
        this.#pump()
      }
    })
  }

  /** Runs only when nothing is active or queued; otherwise resolves null without queueing. */
  tryDecode(
    samples: Float32Array,
    options: ParakeetDecodeOptions,
  ): Promise<ParakeetDecodeResult | null> {
    if (this.#active || this.#queue.length > 0) return Promise.resolve(null)
    return this.decode(samples, options)
  }

  stop(): Promise<void> {
    if (this.#stopping) return this.#stopping
    this.#closed = true
    const child = this.#child
    this.#child = undefined
    this.#clearHeartbeat()
    this.#rejectEverything(new ParakeetUnavailableError('worker is stopped'))
    if (this.#state !== 'failed') this.#state = 'stopped'
    this.#stopping = child ? this.#terminate(child) : Promise.resolve()
    return this.#stopping
  }

  #spawn(): Promise<void> {
    let spawned: ParakeetChildProcess
    try {
      spawned = this.#dependencies.fork(workerEntryPath(), parakeetChildArguments(this.#config), {
        env: minimalWorkerEnvironment(process.env),
        execArgv: ['--import', 'tsx'],
        serialization: 'advanced',
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      })
    } catch (error) {
      const reason = `worker could not start: ${errorMessage(error)}`
      this.#lose(reason)
      return Promise.reject(new ParakeetUnavailableError(reason))
    }
    let markExited = () => undefined as void
    const child: ChildHandle = {
      process: spawned,
      hasExited: false,
      exited: new Promise<void>((resolve) => {
        markExited = resolve
      }),
    }
    this.#child = child
    this.#state = 'starting'
    let resolve!: () => void
    let reject!: (error: Error) => void
    const promise = new Promise<void>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise
      reject = rejectPromise
    })
    // Startup failures reach callers through the queue as well.
    promise.catch(() => undefined)
    const timer = setTimeout(() => {
      const seconds = Math.round(this.#options.startupTimeoutMs / 1_000)
      this.#lose(`worker did not start within ${seconds} s`)
    }, this.#options.startupTimeoutMs)
    this.#startup = { promise, resolve, reject, timer }
    spawned.on('message', (message) => this.#receive(child, message))
    spawned.on('error', (error) => {
      if (this.#child === child) this.#lose(`worker failed: ${errorMessage(error)}`)
    })
    spawned.on('exit', (code, signal) => {
      child.hasExited = true
      markExited()
      if (this.#child !== child) return
      this.#child = undefined
      this.#lose(`worker exited (${signal ?? `code ${code}`})`)
    })
    return promise
  }

  #receive(child: ChildHandle, message: unknown): void {
    if (this.#child !== child) return
    if (!isParakeetChildMessage(message)) {
      this.#lose('worker sent a malformed message')
      return
    }
    this.#handle(message)
  }

  #handle(message: ParakeetChildMessage): void {
    switch (message.type) {
      case 'ready': {
        const startup = this.#startup
        if (this.#state !== 'starting' || !startup) return
        clearTimeout(startup.timer)
        this.#startup = undefined
        this.#state = 'ready'
        this.#armHeartbeat()
        startup.resolve()
        this.#pump()
        return
      }
      case 'failed':
        this.#fail(message.message)
        return
      case 'heartbeat':
        this.#armHeartbeat()
        return
      case 'result':
      case 'error': {
        const request = this.#active
        if (!request || request.id !== message.id) {
          this.#lose('worker answered an unknown request')
          return
        }
        this.#active = undefined
        this.#release(request)
        this.#armHeartbeat()
        if (message.type === 'result') {
          this.#settle(request, () => request.resolve(message.result))
        } else {
          this.#settle(request, () => request.reject(new Error(`decode failed: ${message.message}`)))
        }
        this.#pump()
      }
    }
  }

  #pump(): void {
    const child = this.#child
    if (this.#state !== 'ready' || this.#active || !child) return
    const request = this.#queue.shift()
    if (!request) return
    this.#active = request
    const failed = (error: unknown) => {
      if (this.#child === child) this.#lose(`worker IPC failed: ${errorMessage(error)}`)
    }
    try {
      child.process.send(
        { type: 'decode', id: request.id, samples: request.samples },
        (error) => {
          if (error) failed(error)
        },
      )
    } catch (error) {
      failed(error)
    }
  }

  #timeOut(request: DecodeRequest): void {
    const timedOut = new ParakeetTimeoutError(
      `decode timed out after ${Math.round(request.timeoutMs / 1_000)} s`,
    )
    const index = this.#queue.indexOf(request)
    if (index >= 0) {
      this.#queue.splice(index, 1)
      this.#release(request)
      this.#settle(request, () => request.reject(timedOut))
      return
    }
    if (this.#active !== request) return
    this.#active = undefined
    this.#release(request)
    this.#settle(request, () => request.reject(timedOut))
    // The native decode cannot be interrupted, so the child goes with it.
    this.#lose('worker restarted after a decode timed out')
  }

  #abort(request: DecodeRequest): void {
    const index = this.#queue.indexOf(request)
    if (index >= 0) {
      this.#queue.splice(index, 1)
      this.#release(request)
    }
    // An active decode keeps running; its result is discarded when it arrives.
    this.#settle(request, () => request.reject(abortError(request.signal!)))
  }

  #lose(reason: string): void {
    this.#lastLoss = reason
    const child = this.#child
    this.#child = undefined
    this.#clearHeartbeat()
    if (this.#state !== 'failed' && !this.#closed) this.#state = 'stopped'
    this.#rejectEverything(new ParakeetUnavailableError(reason))
    if (child && !child.hasExited) child.process.kill('SIGKILL')
  }

  #fail(reason: string): void {
    this.#failure = reason
    this.#state = 'failed'
    this.#lose(reason)
  }

  #rejectEverything(error: Error): void {
    const startup = this.#startup
    this.#startup = undefined
    if (startup) {
      clearTimeout(startup.timer)
      startup.reject(error)
    }
    const pending = [...(this.#active ? [this.#active] : []), ...this.#queue.splice(0)]
    this.#active = undefined
    for (const request of pending) {
      this.#release(request)
      this.#settle(request, () => request.reject(error))
    }
  }

  #release(request: DecodeRequest): void {
    if (request.timer) clearTimeout(request.timer)
    request.timer = undefined
    if (request.onAbort) request.signal?.removeEventListener('abort', request.onAbort)
    request.onAbort = undefined
  }

  #settle(request: DecodeRequest, settle: () => void): void {
    if (request.settled) return
    request.settled = true
    settle()
  }

  #admitRestart(): boolean {
    const now = Date.now()
    this.#restarts = this.#restarts.filter((time) => now - time < this.#options.restartWindowMs)
    if (this.#restarts.length >= this.#options.maxRestarts) return false
    this.#restarts.push(now)
    return true
  }

  #armHeartbeat(): void {
    this.#clearHeartbeat()
    if (this.#state !== 'ready') return
    this.#heartbeat = setTimeout(() => {
      this.#heartbeat = undefined
      this.#lose('worker stopped responding')
    }, this.#options.heartbeatTimeoutMs)
  }

  #clearHeartbeat(): void {
    if (this.#heartbeat) clearTimeout(this.#heartbeat)
    this.#heartbeat = undefined
  }

  async #terminate(child: ChildHandle): Promise<void> {
    if (child.hasExited) return
    child.process.kill('SIGTERM')
    if (await this.#exitsWithin(child, this.#options.shutdownTimeoutMs)) return
    child.process.kill('SIGKILL')
    await this.#exitsWithin(child, this.#options.shutdownTimeoutMs)
  }

  #exitsWithin(child: ChildHandle, timeoutMs: number): Promise<boolean> {
    if (child.hasExited) return Promise.resolve(true)
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeoutMs)
      void child.exited.then(() => {
        clearTimeout(timer)
        resolve(true)
      })
    })
  }
}

function workerEntryPath(): string {
  return fileURLToPath(new URL('./parakeet-child.ts', import.meta.url))
}

function abortError(signal: AbortSignal): Error {
  return signal.reason instanceof Error
    ? signal.reason
    : new DOMException('The operation was aborted', 'AbortError')
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : String(error)
}
