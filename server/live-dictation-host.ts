import type WebSocket from 'ws'
import {
  DICTATION_LIMITS,
  DICTATION_PROTOCOL,
  DictationProtocolError,
  parseDictationClientMessage,
  readDictationAudioFrame,
  type DictationCapabilities,
  type DictationErrorCode,
  type DictationFinalReason,
  type DictationServerMessage,
} from '../shared/dictation.js'
import {
  DictationLimitError,
  LiveDictationError,
  LiveDictationSession,
  type LiveDecoder,
  type LiveDictationOptions,
} from './live-dictation-session.js'

export type LiveDictationEngineState = 'stopped' | 'starting' | 'ready' | 'failed'

/**
 * The warm decoder this computer transcribes with, and whether it can take a
 * stream. One that can `start` is started on demand, as the Parakeet worker
 * is before its first use and after a crash.
 */
export type LiveDictationEngine = LiveDecoder & {
  readonly state: LiveDictationEngineState
  start?(): Promise<void>
}

export interface LiveDictationLog {
  info(object: Record<string, unknown>, message?: string): void
  warn(object: Record<string, unknown>, message?: string): void
}

export interface LiveDictationHostLimits {
  heartbeatMs: number
  stallMs: number
  maxBacklogBytes: number
  /** How long a stream waits for an engine that is still starting. */
  readyTimeoutMs: number
}

export interface LiveDictationHostOptions {
  engine?: LiveDictationEngine
  computerName: () => string
  log: LiveDictationLog
  session?: Partial<LiveDictationOptions>
  limits?: Partial<LiveDictationHostLimits>
}

const DEFAULT_LIMITS: LiveDictationHostLimits = {
  heartbeatMs: DICTATION_LIMITS.heartbeatMs,
  stallMs: DICTATION_LIMITS.stallMs,
  maxBacklogBytes: DICTATION_LIMITS.maxBacklogBytes,
  readyTimeoutMs: DICTATION_LIMITS.engineWarmupMs,
}
const READY_POLL_MS = 100
const OPEN = 1

export const DICTATION_CLOSE_CODES: Record<DictationErrorCode, number> = {
  busy: 1013,
  unavailable: 1011,
  protocol: 1008,
  frame_too_large: 1009,
  backpressure: 1013,
  stalled: 1001,
  engine_failed: 1011,
  final_timeout: 1011,
  node_offline: 1011,
  node_outdated: 1011,
}

/**
 * Live dictation on this computer: one stream at a time, decoded by the
 * local engine. The hub attaches a browser socket here when it transcribes
 * itself; a node attaches the hub's relay socket. Text goes only to the
 * socket that sent the audio, and nothing it hears is stored or logged.
 */
export class LiveDictationHost {
  readonly #options: LiveDictationHostOptions
  readonly #limits: LiveDictationHostLimits
  readonly #connections = new Set<DictationConnection>()
  #active: DictationConnection | undefined

  constructor(options: LiveDictationHostOptions) {
    this.#options = options
    this.#limits = { ...DEFAULT_LIMITS, ...options.limits }
  }

  get busy(): boolean {
    return this.#active !== undefined
  }

  capabilities(): DictationCapabilities {
    const computerName = this.#options.computerName()
    const unavailable = this.#unavailableReason()
    return unavailable ? { live: false, reason: unavailable, computerName } : { live: true, computerName }
  }

  attach(socket: WebSocket): void {
    const connection = new DictationConnection(socket, {
      limits: this.#limits,
      session: this.#options.session,
      log: this.#options.log,
      computerName: this.#options.computerName,
      engine: () => this.#options.engine,
      unavailableReason: () => this.#unavailableReason(),
      claim: (claimant) => {
        if (this.#active && this.#active !== claimant) return false
        this.#active = claimant
        return true
      },
      release: (claimant) => {
        if (this.#active === claimant) this.#active = undefined
        this.#connections.delete(claimant)
      },
    })
    this.#connections.add(connection)
  }

  async close(): Promise<void> {
    for (const connection of [...this.#connections]) connection.shutdown()
  }

  #unavailableReason(): string | undefined {
    const computerName = this.#options.computerName()
    const engine = this.#options.engine
    if (!engine) return `Live dictation needs the Parakeet engine on ${computerName}`
    if (engine.state === 'ready' || engine.state === 'starting') return undefined
    if (engine.state === 'stopped' && engine.start) return undefined
    return `Parakeet is unavailable on ${computerName}`
  }
}

interface ConnectionContext {
  limits: LiveDictationHostLimits
  session?: Partial<LiveDictationOptions>
  log: LiveDictationLog
  computerName: () => string
  engine: () => LiveDictationEngine | undefined
  unavailableReason: () => string | undefined
  claim: (connection: DictationConnection) => boolean
  release: (connection: DictationConnection) => void
}

type Phase = 'waiting' | 'warming' | 'live' | 'finishing' | 'ended'

class DictationConnection {
  readonly #socket: WebSocket
  readonly #context: ConnectionContext
  #phase: Phase = 'waiting'
  #streamId: string | undefined
  #session: LiveDictationSession | undefined
  #nextSequence = 1
  #heartbeat: ReturnType<typeof setTimeout> | undefined
  #stall: ReturnType<typeof setTimeout> | undefined
  #readyAt: number | undefined
  #firstTextAt: number | undefined
  #stopAt: number | undefined
  #finalAt: number | undefined

  constructor(socket: WebSocket, context: ConnectionContext) {
    this.#socket = socket
    this.#context = context
    socket.on('message', (data, isBinary) => this.#receive(data, isBinary))
    socket.on('close', () => this.#disconnected())
    socket.on('error', () => this.#disconnected())
    this.#armStall()
    this.#scheduleHeartbeat()
  }

  shutdown(): void {
    if (this.#phase === 'ended') return
    this.#session?.cancel()
    this.#end('shutdown', 1001, 'Agentic Remote is shutting down')
  }

  #receive(data: WebSocket.RawData, isBinary: boolean): void {
    if (this.#phase === 'ended') return
    this.#armStall()
    if (isBinary) {
      this.#audio(data)
      return
    }
    let message
    try {
      message = parseDictationClientMessage(rawBuffer(data).toString('utf8'))
    } catch (error) {
      this.#fatal('protocol', errorMessage(error, 'Invalid dictation message'))
      return
    }
    switch (message.type) {
      case 'start':
        if (this.#phase !== 'waiting') {
          this.#fatal('protocol', 'Dictation already started')
          return
        }
        void this.#start(message.streamId)
        return
      case 'heartbeat':
        return
      case 'stop':
        if (this.#phase === 'live') this.#finish('stop')
        else if (this.#phase === 'warming') this.#endWithFinal('', 'stop')
        else if (this.#phase === 'waiting') this.#fatal('protocol', 'Dictation has not started')
        return
      case 'cancel':
        this.#session?.cancel()
        this.#end('cancelled', 1000, 'Dictation cancelled')
    }
  }

  async #start(streamId: string): Promise<void> {
    this.#streamId = streamId
    const engine = this.#context.engine()
    const unavailable = this.#context.unavailableReason()
    if (!engine || unavailable) {
      this.#fatal('unavailable', unavailable ?? 'Live dictation is unavailable')
      return
    }
    if (!this.#context.claim(this)) {
      this.#fatal('busy', `Live dictation is already in use on ${this.#context.computerName()}`)
      return
    }
    this.#phase = 'warming'
    if (!await this.#engineReady(engine) || this.#phase !== 'warming') return
    const session = new LiveDictationSession(
      engine,
      (update) => {
        if (this.#firstTextAt === undefined && (update.committedAppend || update.tentative)) {
          this.#firstTextAt = performance.now()
        }
        this.#send({ protocol: DICTATION_PROTOCOL, type: 'text', ...update })
      },
      this.#context.session,
      undefined,
      (failure) => this.#engineFailed(failure),
    )
    this.#session = session
    this.#phase = 'live'
    this.#readyAt = performance.now()
    session.start()
    this.#send({ protocol: DICTATION_PROTOCOL, type: 'ready' })
  }

  /** Starts a stopped engine and waits while it warms up; false once the stream has ended. */
  async #engineReady(engine: LiveDictationEngine): Promise<boolean> {
    // A start that fails leaves the engine failed or stopped, which ends the wait below.
    if (engine.state === 'stopped') void engine.start?.().catch(() => undefined)
    let waited = 0
    while (engine.state === 'starting' && waited < this.#context.limits.readyTimeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS))
      waited += READY_POLL_MS
      if (this.#phase !== 'warming') return false
    }
    if (engine.state === 'ready') return true
    this.#fatal('unavailable', engine.state === 'starting'
      ? `Parakeet did not start on ${this.#context.computerName()}`
      : `Parakeet is unavailable on ${this.#context.computerName()}`)
    return false
  }

  #audio(data: WebSocket.RawData): void {
    if (this.#phase === 'finishing') return
    if (this.#phase !== 'live' || !this.#session) {
      this.#fatal('protocol', 'Dictation audio arrived before the stream was ready')
      return
    }
    let samples: Int16Array
    try {
      const buffer = rawBuffer(data)
      if (buffer.byteLength > DICTATION_LIMITS.maxFrameBytes) {
        throw new DictationProtocolError('Dictation audio frame is too large', 'frame_too_large')
      }
      samples = readDictationAudioFrame(exactArrayBuffer(buffer), this.#nextSequence)
    } catch (error) {
      this.#fatal(
        error instanceof DictationProtocolError ? error.code : 'protocol',
        errorMessage(error, 'Invalid dictation audio'),
      )
      return
    }
    this.#nextSequence += 1
    try {
      this.#session.appendAudio(samples)
    } catch (error) {
      if (error instanceof DictationLimitError) this.#finish('duration_limit')
      else throw error
    }
  }

  #finish(reason: DictationFinalReason): void {
    const session = this.#session
    if (!session || this.#phase !== 'live') return
    this.#phase = 'finishing'
    this.#stopAt = performance.now()
    session.finish().then(
      (text) => {
        this.#finalAt = performance.now()
        this.#endWithFinal(text, reason)
      },
      (error: unknown) => {
        if (this.#phase === 'ended') return
        if (error instanceof LiveDictationError) this.#engineFailed(error)
        else this.#fatal('engine_failed', errorMessage(error, 'The final text failed'))
      },
    )
  }

  #engineFailed(failure: LiveDictationError): void {
    if (this.#phase === 'ended') return
    this.#send({ protocol: DICTATION_PROTOCOL, type: 'error', code: failure.code, message: failure.message, fatal: true }, true)
    this.#send({ protocol: DICTATION_PROTOCOL, type: 'final', text: failure.committedText }, true)
    this.#end(`error:${failure.code}`, DICTATION_CLOSE_CODES[failure.code], failure.message)
  }

  #endWithFinal(text: string, reason: DictationFinalReason): void {
    if (this.#phase === 'ended') return
    this.#send({ protocol: DICTATION_PROTOCOL, type: 'final', text, reason }, true)
    this.#end('final', 1000, 'Dictation finished')
  }

  #fatal(code: DictationErrorCode, message: string): void {
    if (this.#phase === 'ended') return
    this.#session?.cancel()
    this.#send({ protocol: DICTATION_PROTOCOL, type: 'error', code, message, fatal: true }, true)
    this.#end(`error:${code}`, DICTATION_CLOSE_CODES[code], message)
  }

  #send(message: DictationServerMessage, force = false): void {
    if (this.#phase === 'ended' || this.#socket.readyState !== OPEN) return
    const payload = JSON.stringify(message)
    if (!force && this.#socket.bufferedAmount + Buffer.byteLength(payload) > this.#context.limits.maxBacklogBytes) {
      this.#fatal('backpressure', 'The dictation connection is not keeping up')
      return
    }
    this.#socket.send(payload, () => undefined)
  }

  #end(outcome: string, code: number, reason: string): void {
    if (this.#phase === 'ended') return
    this.#phase = 'ended'
    this.#clearTimers()
    this.#context.release(this)
    if (this.#streamId !== undefined) this.#logOutcome(outcome)
    if (this.#socket.readyState === OPEN) this.#socket.close(code, closeReason(reason))
  }

  #disconnected(): void {
    if (this.#phase === 'ended') return
    this.#session?.cancel()
    this.#end('disconnected', 1000, 'Dictation socket closed')
  }

  #logOutcome(outcome: string): void {
    const stats = this.#session?.stats()
    this.#context.log.info({
      streamId: this.#streamId,
      audioSeconds: stats?.audioSeconds ?? 0,
      passes: stats?.passes ?? 0,
      firstTextMs: elapsed(this.#readyAt, this.#firstTextAt),
      finalMs: elapsed(this.#stopAt, this.#finalAt),
      outcome,
    }, 'Live dictation stream ended')
  }

  #armStall(): void {
    if (this.#stall !== undefined) clearTimeout(this.#stall)
    this.#stall = setTimeout(() => {
      this.#fatal('stalled', 'The dictation connection stopped responding')
    }, this.#context.limits.stallMs)
  }

  #scheduleHeartbeat(): void {
    this.#heartbeat = setTimeout(() => {
      this.#send({ protocol: DICTATION_PROTOCOL, type: 'heartbeat' })
      if (this.#phase !== 'ended') this.#scheduleHeartbeat()
    }, this.#context.limits.heartbeatMs)
  }

  #clearTimers(): void {
    if (this.#stall !== undefined) clearTimeout(this.#stall)
    if (this.#heartbeat !== undefined) clearTimeout(this.#heartbeat)
    this.#stall = undefined
    this.#heartbeat = undefined
  }
}

function elapsed(from: number | undefined, to: number | undefined): number | undefined {
  return from === undefined || to === undefined ? undefined : Math.round(to - from)
}

export function rawBuffer(data: WebSocket.RawData): Buffer {
  if (Array.isArray(data)) return Buffer.concat(data)
  if (data instanceof ArrayBuffer) return Buffer.from(data)
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength)
}

function exactArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

export function closeReason(reason: string): string {
  return reason.replace(/[^\x20-\x7e]/g, '').slice(0, 120) || 'Dictation closed'
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
