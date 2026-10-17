import {
  fork as forkChildProcess,
  type ForkOptions,
} from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ORACLE_VOICE_SAMPLE_RATE,
  isVoicePlaybackSampleRate,
} from '../shared/oracle-voice.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import type {
  VoiceEndUtterance,
  VoiceEngineEvent,
  VoiceEngineFactory,
  VoiceGenerationIdentity,
  VoiceEngineSession,
  VoiceStartUtterance,
  VoiceSttEngine,
  VoiceSynthesisRequest,
  VoiceTtsEngine,
  VoiceUtteranceAudioFrame,
} from './oracle-voice-engine.js'
import type { VoiceBackendCapability } from '../shared/contracts.js'
import {
  VOICE_MAX_CANCELLATION_STREAMS,
  VOICE_WORKER_CLOSE_TIMEOUT_MS,
  type VoiceWorkerChildMessage,
  type VoiceWorkerParentMessage,
} from './oracle-voice-worker-protocol.js'

const DEFAULT_STARTUP_TIMEOUT_MS = 30_000
const DEFAULT_OPERATION_TIMEOUT_MS = 30_000
const DEFAULT_HEARTBEAT_TIMEOUT_MS = 15_000
const DEFAULT_CLOSE_REQUEST_TIMEOUT_MS = VOICE_WORKER_CLOSE_TIMEOUT_MS
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 2_000
const DEFAULT_MAX_PENDING_REQUESTS = 128
const DEFAULT_MAX_CANCELLATION_STREAMS = VOICE_MAX_CANCELLATION_STREAMS

type Timer = ReturnType<typeof setTimeout>

export interface VoiceChildProcess {
  readonly pid?: number
  connected: boolean
  send(
    message: VoiceWorkerParentMessage,
    callback?: (error: Error | null) => void,
  ): boolean
  kill(signal: NodeJS.Signals): boolean
  disconnect(): void
  on(event: 'message', listener: (message: unknown) => void): this
  on(
    event: 'exit',
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): this
}

export interface ChildVoiceEngineDependencies {
  fork: (entry: string, options: ForkOptions) => VoiceChildProcess
  startupTimeoutMs: number
  operationTimeoutMs: number
  heartbeatTimeoutMs: number
  closeRequestTimeoutMs: number
  shutdownTimeoutMs: number
  maxPendingRequests: number
  maxCancellationStreams: number
  setTimeout: typeof setTimeout
  clearTimeout: typeof clearTimeout
}

interface PendingRequest {
  timer: Timer
  resolve: () => void
  reject: (error: Error) => void
}

interface ReadyWaiter {
  timer: Timer
  resolve: () => void
  reject: (error: Error) => void
}

interface ActiveUtteranceIdentity extends VoiceGenerationIdentity {
  utteranceId: string
}

interface ActiveSynthesisIdentity extends VoiceGenerationIdentity {
  segmentId: string
}

function defaultDependencies(): ChildVoiceEngineDependencies {
  return {
    fork: (entry, options) => forkChildProcess(entry, [], options),
    startupTimeoutMs: DEFAULT_STARTUP_TIMEOUT_MS,
    operationTimeoutMs: DEFAULT_OPERATION_TIMEOUT_MS,
    heartbeatTimeoutMs: DEFAULT_HEARTBEAT_TIMEOUT_MS,
    closeRequestTimeoutMs: DEFAULT_CLOSE_REQUEST_TIMEOUT_MS,
    shutdownTimeoutMs: DEFAULT_SHUTDOWN_TIMEOUT_MS,
    maxPendingRequests: DEFAULT_MAX_PENDING_REQUESTS,
    maxCancellationStreams: DEFAULT_MAX_CANCELLATION_STREAMS,
    setTimeout,
    clearTimeout,
  }
}

export class ChildVoiceEngine implements
  VoiceEngineFactory,
  VoiceEngineSession,
  VoiceSttEngine,
  VoiceTtsEngine {
  readonly stt: VoiceSttEngine = this
  readonly tts: VoiceTtsEngine = this

  private readonly dependencies: ChildVoiceEngineDependencies
  private readonly configuredAtConstruction: EnabledOracleVoiceConfig | undefined
  private readonly listeners = new Set<(event: VoiceEngineEvent) => void>()
  private readonly pending = new Map<string, PendingRequest>()
  private child: VoiceChildProcess | undefined
  private initializedConfig: EnabledOracleVoiceConfig | undefined
  private currentCapability: VoiceBackendCapability = {
    available: false,
    reason: 'Oracle voice worker is not initialized',
  }
  private initializationPromise: Promise<VoiceEngineSession> | undefined
  private stopPromise: Promise<void> | undefined
  private readyWaiter: ReadyWaiter | undefined
  private heartbeatTimer: Timer | undefined
  private requestSequence = 0
  private readonly cancelledThroughGeneration = new Map<string, number>()
  private activeUtterance: ActiveUtteranceIdentity | undefined
  private activeSynthesis: ActiveSynthesisIdentity | undefined
  private exited = false
  private closing = false
  private fatal = false
  private exitWaiters = new Set<() => void>()

  constructor(dependencies?: Partial<ChildVoiceEngineDependencies>)
  constructor(
    config: EnabledOracleVoiceConfig,
    dependencies?: Partial<ChildVoiceEngineDependencies>,
  )
  constructor(
    configOrDependencies: EnabledOracleVoiceConfig | Partial<ChildVoiceEngineDependencies> = {},
    maybeDependencies: Partial<ChildVoiceEngineDependencies> = {},
  ) {
    if (isEnabledConfig(configOrDependencies)) {
      this.configuredAtConstruction = configOrDependencies
      this.dependencies = { ...defaultDependencies(), ...maybeDependencies }
    } else {
      this.dependencies = { ...defaultDependencies(), ...configOrDependencies }
    }
  }

  initialize(config?: EnabledOracleVoiceConfig): Promise<VoiceEngineSession> {
    if (this.initializationPromise) return this.initializationPromise
    const selectedConfig = config ?? this.configuredAtConstruction
    if (!selectedConfig) {
      return Promise.reject(new Error('Oracle voice configuration is required'))
    }
    this.initializationPromise = this.initializeWorker(selectedConfig)
    return this.initializationPromise
  }

  capability(): VoiceBackendCapability {
    return this.currentCapability
  }

  workerPid(): number | undefined {
    return this.child?.pid
  }

  onEvent(listener: (event: VoiceEngineEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async start(input: VoiceStartUtterance): Promise<void> {
    await this.request({
      requestId: this.nextRequestId(),
      type: 'stt_start',
      input,
    })
    this.activeUtterance = {
      streamId: input.streamId,
      generation: input.generation,
      utteranceId: input.utteranceId,
    }
  }

  accept(frame: VoiceUtteranceAudioFrame): Promise<void> {
    if (!matchesUtterance(this.activeUtterance, frame)) {
      return Promise.reject(new Error('stale STT audio identity'))
    }
    return this.request({
      requestId: this.nextRequestId(),
      type: 'stt_audio',
      frame,
    })
  }

  end(input: VoiceEndUtterance): Promise<void> {
    if (!matchesUtterance(this.activeUtterance, input)) {
      return Promise.reject(new Error('stale STT utterance identity'))
    }
    return this.request({
      requestId: this.nextRequestId(),
      type: 'stt_end',
      input,
    })
  }

  synthesize(input: VoiceSynthesisRequest): Promise<void> {
    if (this.activeSynthesis) {
      return Promise.reject(new Error('Piper synthesis is already active'))
    }
    const active = {
      streamId: input.streamId,
      generation: input.generation,
      segmentId: input.segmentId,
    }
    this.activeSynthesis = active
    return this.request({
      requestId: this.nextRequestId(),
      type: 'tts_synthesize',
      input,
    }).finally(() => {
      if (matchesSynthesis(this.activeSynthesis, active)) {
        this.activeSynthesis = undefined
      }
    })
  }

  async cancel(input: VoiceGenerationIdentity): Promise<void> {
    await this.cancelGeneration(input)
  }

  async cancelGeneration(input: VoiceGenerationIdentity): Promise<void> {
    this.requireInitialized()
    try {
      rememberCancellation(
        this.cancelledThroughGeneration,
        input,
        this.dependencies.maxCancellationStreams,
      )
    } catch (error) {
      const failure = error instanceof Error
        ? error
        : new Error('voice cancellation stream limit exceeded')
      this.failWorker(failure, true)
      throw failure
    }
    if (matchesCancelled(this.activeUtterance, input)) {
      this.activeUtterance = undefined
    }
    if (matchesCancelled(this.activeSynthesis, input)) {
      this.activeSynthesis = undefined
    }
    await Promise.all([
      this.request({
        requestId: this.nextRequestId(),
        type: 'stt_cancel',
        ...input,
      }),
      this.request({
        requestId: this.nextRequestId(),
        type: 'tts_cancel',
        ...input,
      }),
    ])
  }

  close(): Promise<void> {
    return this.stop()
  }

  stop(): Promise<void> {
    if (this.stopPromise) return this.stopPromise
    this.stopPromise = this.stopWorker()
    return this.stopPromise
  }

  private async initializeWorker(
    config: EnabledOracleVoiceConfig,
  ): Promise<VoiceEngineSession> {
    this.closing = false
    this.fatal = false
    this.exited = false
    let child: VoiceChildProcess
    try {
      child = this.dependencies.fork(workerEntryPath(), {
        env: minimalWorkerEnvironment(process.env),
        execArgv: ['--import', 'tsx'],
        serialization: 'advanced',
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      })
    } catch (error) {
      const reason = errorMessage(error, 'voice worker failed to start')
      this.currentCapability = { available: false, reason }
      throw new Error(reason)
    }
    this.child = child
    child.on('message', (message) => this.handleChildMessage(message))
    child.on('exit', (code, signal) => this.handleChildExit(code, signal))

    const ready = this.waitForReady()
    try {
      await Promise.all([
        ready,
        this.request(
          {
            requestId: this.nextRequestId(),
            type: 'initialize',
            config,
          },
          this.dependencies.startupTimeoutMs,
          'voice worker initialization timed out',
        ),
      ])
    } catch (error) {
      if (!this.fatal) {
        this.failWorker(
          error instanceof Error ? error : new Error('voice worker initialization failed'),
          true,
        )
      }
      throw error
    }

    this.initializedConfig = config
    this.currentCapability = capabilityFromConfig(config)
    this.armHeartbeat()
    return this
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = this.dependencies.setTimeout(() => {
        const error = new Error('voice worker initialization timed out')
        this.readyWaiter = undefined
        reject(error)
        this.failWorker(error, true)
      }, this.dependencies.startupTimeoutMs)
      this.readyWaiter = {
        timer,
        resolve: () => {
          this.dependencies.clearTimeout(timer)
          this.readyWaiter = undefined
          resolve()
        },
        reject: (error) => {
          this.dependencies.clearTimeout(timer)
          this.readyWaiter = undefined
          reject(error)
        },
      }
    })
  }

  private request(
    message: VoiceWorkerParentMessage,
    timeoutMs = this.dependencies.operationTimeoutMs,
    timeoutMessage = `voice worker ${message.type} timed out`,
    allowClosing = false,
    fatalOnTimeout = true,
  ): Promise<void> {
    const child = this.requireChild(allowClosing)
    if (this.pending.size >= this.dependencies.maxPendingRequests) {
      return Promise.reject(new Error('too many pending voice worker requests'))
    }
    return new Promise((resolve, reject) => {
      const timer = this.dependencies.setTimeout(() => {
        if (!this.pending.delete(message.requestId)) return
        const error = new Error(timeoutMessage)
        reject(error)
        if (fatalOnTimeout) this.failWorker(error, true)
      }, timeoutMs)
      this.pending.set(message.requestId, { timer, resolve, reject })
      try {
        child.send(message, (error) => {
          if (!error) return
          const pending = this.takePending(message.requestId)
          pending?.reject(new Error(`voice worker IPC failed: ${error.message}`))
        })
      } catch (error) {
        const pending = this.takePending(message.requestId)
        pending?.reject(new Error(errorMessage(error, 'voice worker IPC failed')))
      }
    })
  }

  private handleChildMessage(message: unknown): void {
    if (!isVoiceWorkerChildMessage(message)) {
      this.failWorker(new Error('malformed voice worker message'), true)
      return
    }
    if (message.type === 'response' || message.type === 'response_error') {
      const pending = this.takePending(message.requestId)
      if (!pending) return
      if (message.type === 'response') {
        pending.resolve()
      } else {
        pending.reject(new Error(message.message))
      }
      return
    }

    const { event } = message
    if (event.type === 'ready') {
      this.readyWaiter?.resolve()
      return
    }
    if (event.type === 'heartbeat') {
      this.armHeartbeat()
    }
    if (event.type === 'fatal_error') {
      this.failWorker(new Error(event.message), true)
      return
    }
    if (isCancelledEvent(event, this.cancelledThroughGeneration)) return
    if (
      (event.type === 'partial' || event.type === 'final')
      && !matchesUtterance(this.activeUtterance, event)
    ) return
    if (
      (event.type === 'audio' || event.type === 'audio_end')
      && !matchesSynthesis(this.activeSynthesis, event)
    ) return
    this.emit(event)
    if (event.type === 'final') this.activeUtterance = undefined
    if (event.type === 'audio_end') this.activeSynthesis = undefined
  }

  private handleChildExit(
    code: number | null,
    signal: NodeJS.Signals | null,
  ): void {
    if (this.exited) return
    this.exited = true
    this.clearHeartbeat()
    if (this.child?.connected) {
      try {
        this.child.disconnect()
      } catch {
        // The IPC channel may already be closed as part of process exit.
      }
    }
    for (const resolve of this.exitWaiters) resolve()
    this.exitWaiters.clear()
    if (this.closing) {
      this.rejectPending(new Error('voice worker stopped'))
      this.currentCapability = {
        available: false,
        reason: 'Oracle voice worker is stopped',
      }
      return
    }
    const detail = signal ?? (code === null ? 'unknown status' : `code ${code}`)
    this.failWorker(new Error(`voice worker exited with ${detail}`), false)
  }

  private failWorker(error: Error, terminate: boolean): void {
    if (this.fatal) return
    this.fatal = true
    this.clearHeartbeat()
    this.readyWaiter?.reject(error)
    this.rejectPending(error)
    this.activeUtterance = undefined
    this.activeSynthesis = undefined
    this.currentCapability = {
      available: false,
      reason: error.message,
    }
    if (this.initializedConfig && !this.closing) {
      this.emit({ type: 'fatal_error', message: error.message })
    }
    if (terminate && !this.exited) void this.beginTermination()
  }

  private armHeartbeat(): void {
    this.clearHeartbeat()
    if (!this.initializedConfig || this.closing || this.exited) return
    this.heartbeatTimer = this.dependencies.setTimeout(() => {
      this.heartbeatTimer = undefined
      this.failWorker(new Error('voice worker heartbeat timed out'), true)
    }, this.dependencies.heartbeatTimeoutMs)
  }

  private clearHeartbeat(): void {
    if (!this.heartbeatTimer) return
    this.dependencies.clearTimeout(this.heartbeatTimer)
    this.heartbeatTimer = undefined
  }

  private emit(event: VoiceEngineEvent): void {
    for (const listener of this.listeners) listener(event)
  }

  private takePending(requestId: string): PendingRequest | undefined {
    const pending = this.pending.get(requestId)
    if (!pending) return undefined
    this.pending.delete(requestId)
    this.dependencies.clearTimeout(pending.timer)
    return pending
  }

  private rejectPending(error: Error): void {
    for (const [requestId, pending] of this.pending) {
      this.pending.delete(requestId)
      this.dependencies.clearTimeout(pending.timer)
      pending.reject(error)
    }
  }

  private nextRequestId(): string {
    this.requestSequence += 1
    return String(this.requestSequence)
  }

  private requireChild(allowClosing = false): VoiceChildProcess {
    if (!this.child || this.exited || this.fatal || (this.closing && !allowClosing)) {
      throw new Error(this.currentCapability.available
        ? 'Oracle voice worker is unavailable'
        : this.currentCapability.reason)
    }
    return this.child
  }

  private requireInitialized(): void {
    if (!this.initializedConfig || !this.currentCapability.available) {
      throw new Error(this.currentCapability.available
        ? 'Oracle voice worker is unavailable'
        : this.currentCapability.reason)
    }
  }

  private async stopWorker(): Promise<void> {
    const child = this.child
    if (!child || this.exited) {
      this.listeners.clear()
      return
    }
    this.closing = true
    this.clearHeartbeat()
    this.readyWaiter?.reject(new Error('voice worker stopped'))

    let closeAcknowledged = false
    try {
      await this.request(
        {
          requestId: this.nextRequestId(),
          type: 'close',
        },
        this.dependencies.closeRequestTimeoutMs,
        'voice worker close timed out',
        true,
        false,
      )
      closeAcknowledged = true
    } catch {
      // Shutdown continues with signals if the worker cannot acknowledge.
    }

    if (!this.exited) {
      if (closeAcknowledged) {
        await this.waitForExit(this.dependencies.shutdownTimeoutMs)
      }
      if (!this.exited) {
        child.kill('SIGTERM')
        await this.waitForExit(this.dependencies.shutdownTimeoutMs)
      }
      if (!this.exited) {
        child.kill('SIGKILL')
      }
    }
    if (child.connected) {
      try {
        child.disconnect()
      } catch {
        // A simultaneous child exit can close IPC first.
      }
    }
    this.rejectPending(new Error('voice worker stopped'))
    this.cancelledThroughGeneration.clear()
    this.activeUtterance = undefined
    this.activeSynthesis = undefined
    this.currentCapability = {
      available: false,
      reason: 'Oracle voice worker is stopped',
    }
    this.listeners.clear()
  }

  private beginTermination(): Promise<void> {
    const child = this.child
    if (!child || this.exited) return Promise.resolve()
    child.kill('SIGTERM')
    return this.waitForExit(this.dependencies.shutdownTimeoutMs).then((exited) => {
      if (!exited && !this.exited) child.kill('SIGKILL')
    })
  }

  private waitForExit(timeoutMs: number): Promise<boolean> {
    if (this.exited) return Promise.resolve(true)
    return new Promise((resolve) => {
      let settled = false
      const finish = (exited: boolean) => {
        if (settled) return
        settled = true
        this.dependencies.clearTimeout(timer)
        this.exitWaiters.delete(onExit)
        resolve(exited)
      }
      const onExit = () => finish(true)
      const timer = this.dependencies.setTimeout(() => finish(false), timeoutMs)
      this.exitWaiters.add(onExit)
    })
  }
}

function workerEntryPath(): string {
  return fileURLToPath(new URL('./oracle-voice-child.ts', import.meta.url))
}

function minimalWorkerEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const allowed = [
    'HOME',
    'LANG',
    'LC_ALL',
    'NODE_ENV',
    'PATH',
    'SystemRoot',
    'TZ',
    'WINDIR',
  ] as const
  return Object.fromEntries(
    allowed.flatMap((name) => env[name] === undefined ? [] : [[name, env[name]]]),
  )
}

function capabilityFromConfig(config: EnabledOracleVoiceConfig): VoiceBackendCapability {
  return {
    available: true,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    playbackSampleRate: config.tts.sampleRate,
    languages: [config.language],
    sttProfile: config.stt.profile,
    ttsVoice: path.basename(config.tts.model).replace(/\.onnx$/i, ''),
    resourceClass: config.stt.profile === 'zipformer' ? 'low' : 'quality',
  }
}

function isEnabledConfig(
  value: EnabledOracleVoiceConfig | Partial<ChildVoiceEngineDependencies>,
): value is EnabledOracleVoiceConfig {
  return Reflect.get(value, 'enabled') === true
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function isCancelledEvent(
  event: VoiceEngineEvent,
  cancelledThroughGeneration: ReadonlyMap<string, number>,
): boolean {
  if (!('generation' in event)) return false
  return event.generation <= (cancelledThroughGeneration.get(event.streamId) ?? -1)
}

function isVoiceWorkerChildMessage(value: unknown): value is VoiceWorkerChildMessage {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  if (value.type === 'response') {
    return exactKeys(value, ['type', 'requestId'])
      && typeof value.requestId === 'string'
  }
  if (value.type === 'response_error') {
    return exactKeys(value, ['type', 'requestId', 'message'])
      && typeof value.requestId === 'string'
      && typeof value.message === 'string'
  }
  return value.type === 'event'
    && exactKeys(value, ['type', 'event'])
    && isVoiceEngineEvent(value.event)
}

function isVoiceEngineEvent(value: unknown): value is VoiceEngineEvent {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  switch (value.type) {
    case 'ready':
      return exactKeys(value, ['type'])
    case 'heartbeat':
      return exactKeys(value, ['type', 'timestamp'])
        && typeof value.timestamp === 'number'
        && Number.isFinite(value.timestamp)
    case 'fatal_error':
      return exactKeys(value, ['type', 'message'])
        && typeof value.message === 'string'
    case 'partial':
    case 'final':
      return exactKeys(value, ['type', 'streamId', 'generation', 'utteranceId', 'text'])
        && isNonEmptyString(value.streamId)
        && isUint32(value.generation)
        && isNonEmptyString(value.utteranceId)
        && typeof value.text === 'string'
    case 'audio':
      return exactKeys(value, [
        'type',
        'streamId',
        'generation',
        'segmentId',
        'sequence',
        'sampleRate',
        'samples',
      ])
        && isNonEmptyString(value.streamId)
        && isUint32(value.generation)
        && isNonEmptyString(value.segmentId)
        && isUint32(value.sequence)
        && isVoicePlaybackSampleRate(value.sampleRate)
        && value.samples instanceof Int16Array
    case 'audio_end':
      return exactKeys(value, ['type', 'streamId', 'generation', 'segmentId'])
        && isNonEmptyString(value.streamId)
        && isUint32(value.generation)
        && isNonEmptyString(value.segmentId)
    default:
      return false
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value)
  return keys.length === expected.length && expected.every((key) => key in value)
}

function isUint32(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 0xffff_ffff
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function matchesUtterance(
  active: ActiveUtteranceIdentity | undefined,
  input: ActiveUtteranceIdentity,
): boolean {
  return active !== undefined
    && active.streamId === input.streamId
    && active.generation === input.generation
    && active.utteranceId === input.utteranceId
}

function matchesSynthesis(
  active: ActiveSynthesisIdentity | undefined,
  input: ActiveSynthesisIdentity,
): boolean {
  return active !== undefined
    && active.streamId === input.streamId
    && active.generation === input.generation
    && active.segmentId === input.segmentId
}

function matchesCancelled(
  active: VoiceGenerationIdentity | undefined,
  input: VoiceGenerationIdentity,
): boolean {
  return active !== undefined
    && active.streamId === input.streamId
    && active.generation <= input.generation
}

function rememberCancellation(
  cancelledThroughGeneration: Map<string, number>,
  input: VoiceGenerationIdentity,
  maximumStreams: number,
): void {
  if (
    !cancelledThroughGeneration.has(input.streamId)
    && cancelledThroughGeneration.size >= maximumStreams
  ) {
    throw new Error('voice cancellation stream limit exceeded')
  }
  cancelledThroughGeneration.set(
    input.streamId,
    Math.max(cancelledThroughGeneration.get(input.streamId) ?? -1, input.generation),
  )
}
