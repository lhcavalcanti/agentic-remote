import { spawn, type ChildProcess } from 'node:child_process'
import { EventEmitter, once } from 'node:events'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import WebSocket, { type RawData } from 'ws'
import { buildApp } from '../server/app.js'
import {
  DEFAULT_VOICE_BACKEND_LIMITS,
  LocalVoiceBackend,
  type VoiceBackend,
  type VoiceBackendQueueSnapshot,
  type VoiceBackendSession,
  type VoiceBackendSessionOpenOptions,
} from '../server/oracle-voice-session.js'
import type { EnabledOracleVoiceConfig } from '../server/oracle-voice-config.js'
import type {
  VoiceEngineEvent,
  VoiceEngineFactory,
  VoiceEngineSession,
  VoiceEndUtterance,
  VoiceGenerationIdentity,
  VoiceStartUtterance,
  VoiceSynthesisRequest,
  VoiceUtteranceAudioFrame,
} from '../server/oracle-voice-engine.js'
import type { VoiceBackendCapability } from '../shared/contracts.js'
import type {
  ManagerEvent,
  ManagerMessage,
  ManagerSnapshot,
} from '../shared/manager.js'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  type VoiceAudioFrame,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'

export interface SoakOptions {
  minutes: number
  turnsPerMinute: number
  rapidStartStop: number
  output: string
}

interface RssSample {
  elapsedMs: number
  rssMiB: number
}

interface SoakReport {
  schemaVersion: 3
  generatedAt: string
  requested: {
    minutes: number
    turnsPerMinute: number
    rapidStartStop: number
  }
  elapsedMs: number
  lifecycleElapsedMs: number
  lifecycle: LifecycleCycleResult
  utteranceCount: number
  managerSendCount: number
  uniqueManagerSendCount: number
  managerCancellationCount: number
  backendCancellationCount: number
  staleBackendEmissions: number
  staleClientDeliveries: number
  maximumInputQueueBytes: number
  maximumPendingInputBytes: number
  maximumInputBacklogBytes: number
  maximumOutputQueueBytes: number
  queueOverflowRejections: number
  queueLimitBytes: number
  activeBackendSessionsAfterStop: number
  socketClosed: boolean
  childPidsBefore: number[]
  childPidsDuring: number[]
  childPidsAfter: number[]
  ownedChildPid?: number
  orphanChildPids: number[]
  rssSamples: RssSample[]
  finalRssSlopeMiBPerMinute: number
  unhandledRejections: string[]
  uncaughtExceptions: string[]
  assertions: Record<string, boolean>
  passed: boolean
}

interface TicketResponse {
  ticket: string
}

const SOAK_VOICE_CONFIG: EnabledOracleVoiceConfig = {
  enabled: true,
  language: 'en',
  threads: 1,
  endpointMs: 800,
  stt: {
    profile: 'zipformer',
    modelDirectory: '/controlled-soak/stt',
  },
  tts: {
    engine: 'sherpa-vits',
    model: '/controlled-soak/tts.onnx',
    config: '/controlled-soak/tts.onnx.json',
    tokens: '/controlled-soak/tokens.txt',
    dataDir: '/controlled-soak/espeak-ng-data',
    sampleRate: 22_050,
  },
}

class SoakSessionService extends EventEmitter {
  async start() {}
  async stop() {}
  providers() { return [] }
  listSessions() { return [] }
  listHistory() { return [] }
}

class SoakManager extends EventEmitter<{ event: [event: ManagerEvent] }> {
  readonly sends: string[] = []
  cancellations = 0
  private messages: ManagerMessage[] = []
  private current: ManagerMessage | undefined
  private sequence = 0

  async start() {}
  async stop() {}
  hiddenSessionIds() { return [] }

  snapshot(): ManagerSnapshot {
    return {
      available: true,
      status: this.current ? 'working' : 'idle',
      messages: this.messages.map((message) => ({ ...message })),
      queued: 0,
      managedSessions: [],
    }
  }

  async send(content: string): Promise<ManagerMessage> {
    const timestamp = new Date().toISOString()
    const message: ManagerMessage = {
      id: `soak-user-${++this.sequence}`,
      role: 'user',
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      state: 'running',
    }
    this.sends.push(content)
    this.current = message
    this.messages = [...this.messages.slice(-19), message]
    this.emit('event', { type: 'manager.message', message: { ...message } })
    this.emit('event', { type: 'manager.status', status: 'working', queued: 0 })
    return { ...message }
  }

  async cancel(): Promise<void> {
    this.cancellations += 1
    const current = this.current
    if (current) {
      const interrupted: ManagerMessage = {
        ...current,
        state: 'interrupted',
        updatedAt: new Date().toISOString(),
      }
      this.replaceMessage(interrupted)
      this.emit('event', { type: 'manager.message', message: { ...interrupted } })
    }
    this.current = undefined
    this.emit('event', { type: 'manager.status', status: 'idle', queued: 0 })
  }

  respond(content: string): void {
    const current = this.current
    if (!current) throw new Error('No soak manager turn is active')
    const messageId = `soak-assistant-${current.id}`
    this.emit('event', { type: 'manager.delta', messageId, content })
    const timestamp = new Date().toISOString()
    const assistant: ManagerMessage = {
      id: messageId,
      role: 'assistant',
      replyTo: current.id,
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      state: 'done',
    }
    const done: ManagerMessage = {
      ...current,
      state: 'done',
      updatedAt: timestamp,
    }
    this.replaceMessage(done)
    this.messages = [...this.messages.slice(-19), assistant]
    this.emit('event', { type: 'manager.message', message: { ...assistant } })
    this.emit('event', { type: 'manager.message', message: { ...done } })
    this.current = undefined
    this.emit('event', { type: 'manager.status', status: 'idle', queued: 0 })
  }

  async retry() { throw Object.assign(new Error('Not used by soak'), { statusCode: 409 }) }
  async removeQueued() { throw Object.assign(new Error('Not used by soak'), { statusCode: 409 }) }
  async editQueued() { throw Object.assign(new Error('Not used by soak'), { statusCode: 409 }) }
  async resolveConfirmation() {
    throw Object.assign(new Error('Not used by soak'), { statusCode: 409 })
  }
  async updateSettings() { return {} }
  async reset() {}

  private replaceMessage(message: ManagerMessage): void {
    const index = this.messages.findIndex((candidate) => candidate.id === message.id)
    if (index >= 0) this.messages[index] = message
  }
}

class ControlledAcquisitionGate {
  started = false
  resolved = false
  released = false
  private releaseGate!: () => void
  private readonly pending = new Promise<void>((resolve) => {
    this.releaseGate = resolve
  })

  async wait(): Promise<void> {
    this.started = true
    await this.pending
    this.resolved = true
  }

  release(): void {
    if (this.released) return
    this.released = true
    this.releaseGate()
  }
}

class ControlledSoakEngine implements VoiceEngineFactory, VoiceEngineSession {
  readonly stt = {
    start: async (input: VoiceStartUtterance) => {
      this.activeUtterance = input
    },
    accept: async (_frame: VoiceUtteranceAudioFrame) => {
      await delay(15)
    },
    end: async (input: VoiceEndUtterance) => {
      this.emit({
        type: 'partial',
        ...input,
        text: `soak utterance ${input.generation}`,
      })
      this.emit({
        type: 'final',
        ...input,
        text: `soak utterance ${input.generation}`,
      })
      this.activeUtterance = undefined
    },
    cancel: async (input: VoiceGenerationIdentity) => {
      await this.cancelGeneration(input)
    },
    close: async () => undefined,
  }
  readonly tts = {
    synthesize: async (input: VoiceSynthesisRequest) => {
      this.ttsSyntheses += 1
      queueMicrotask(() => {
        for (let sequence = 0; sequence < 4; sequence += 1) {
          this.audioFrames += 1
          this.emit({
            type: 'audio',
            ...input,
            sequence,
            sampleRate: 22_050,
            samples: new Int16Array(2_205).fill(400 + sequence),
          })
        }
        this.emit({ type: 'audio_end', ...input })
      })
    },
    cancel: async (input: VoiceGenerationIdentity) => {
      await this.cancelGeneration(input)
    },
    close: async () => undefined,
  }
  cancellations = 0
  staleEmissions = 0
  ttsSyntheses = 0
  audioFrames = 0
  private readonly listeners = new Set<(event: VoiceEngineEvent) => void>()
  private child: ChildProcess | undefined
  private activeUtterance: VoiceStartUtterance | undefined
  private nextInitializationGate: ControlledAcquisitionGate | undefined

  async initialize(_config: EnabledOracleVoiceConfig): Promise<VoiceEngineSession> {
    const gate = this.nextInitializationGate
    this.nextInitializationGate = undefined
    await gate?.wait()
    if (!this.child) {
      this.child = spawn(process.execPath, [
        '-e',
        'setInterval(() => undefined, 1000)',
      ], { stdio: 'ignore' })
      await waitFor(() => this.child?.pid !== undefined, 10_000, 'soak child startup')
    }
    return this
  }

  gateNextInitialization(): ControlledAcquisitionGate {
    if (this.nextInitializationGate) {
      throw new Error('A controlled voice acquisition gate is already pending')
    }
    const gate = new ControlledAcquisitionGate()
    this.nextInitializationGate = gate
    return gate
  }

  capability(): VoiceBackendCapability {
    return {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'controlled-soak-engine',
      ttsVoice: 'controlled-soak-engine',
      resourceClass: 'low',
    }
  }

  onEvent(listener: (event: VoiceEngineEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async cancelGeneration(input: VoiceGenerationIdentity): Promise<void> {
    this.cancellations += 1
    this.activeUtterance = undefined
    queueMicrotask(() => {
      this.staleEmissions += 1
      this.emit({
        type: 'partial',
        ...input,
        utteranceId: `stale-${input.generation}`,
        text: 'stale output',
      })
    })
  }

  async close(): Promise<void> {}

  childPid(): number | undefined {
    return this.child?.pid
  }

  async stop(): Promise<void> {
    const child = this.child
    this.child = undefined
    if (child?.pid && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit')
      child.kill('SIGTERM')
      await exited
    }
    this.listeners.clear()
  }

  private emit(event: VoiceEngineEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}

class ObservedProductionVoiceBackend implements VoiceBackend {
  activeSessions = 0
  maximumInputQueueBytes = 0
  maximumPendingInputBytes = 0
  maximumInputBacklogBytes = 0
  maximumOutputQueueBytes = 0
  queueOverflowRejections = 0
  readonly deliveredOutputTypes: string[] = []
  readonly openAttempts: string[] = []
  readonly openedSessions: string[] = []
  readonly cancelledAcquisitions: string[] = []
  readonly closedSessions: string[] = []
  private openOperations = 0

  constructor(private readonly backend: LocalVoiceBackend) {}

  capability() {
    return this.backend.capability()
  }

  limits() {
    return this.backend.limits()
  }

  busy() {
    return this.openOperations > 0 || this.backend.busy()
  }

  async open(options: VoiceBackendSessionOpenOptions): Promise<VoiceBackendSession> {
    this.openOperations += 1
    this.openAttempts.push(options.streamId)
    let session: VoiceBackendSession
    try {
      session = await this.backend.open({
        ...options,
        send: async (output) => {
          this.deliveredOutputTypes.push(
            'direction' in output ? output.direction : output.type,
          )
          await options.send(output)
        },
        observeQueue: (snapshot) => this.observe(snapshot),
      })
      this.openedSessions.push(options.streamId)
    } catch (error) {
      if (options.signal?.aborted) {
        this.cancelledAcquisitions.push(options.streamId)
      }
      throw error
    } finally {
      this.openOperations -= 1
    }
    this.activeSessions += 1
    let closed = false
    return {
      control: (message) => session.control(message),
      audio: async (frame) => {
        try {
          await session.audio(frame)
        } catch (error) {
          if (
            error instanceof Error
            && 'closeCode' in error
            && error.closeCode === 1013
          ) {
            this.queueOverflowRejections += 1
          }
          throw error
        }
      },
      close: async (reason) => {
        await session.close(reason)
        if (closed) return
        closed = true
        this.closedSessions.push(options.streamId)
        this.activeSessions -= 1
      },
    }
  }

  async stop(): Promise<void> {
    await this.backend.stop()
    this.activeSessions = 0
  }

  private observe(snapshot: VoiceBackendQueueSnapshot): void {
    this.maximumInputQueueBytes = Math.max(
      this.maximumInputQueueBytes,
      snapshot.queuedInputBytes,
    )
    this.maximumPendingInputBytes = Math.max(
      this.maximumPendingInputBytes,
      snapshot.pendingInputBytes,
    )
    this.maximumInputBacklogBytes = Math.max(
      this.maximumInputBacklogBytes,
      snapshot.queuedInputBytes + snapshot.pendingInputBytes,
    )
    this.maximumOutputQueueBytes = Math.max(
      this.maximumOutputQueueBytes,
      snapshot.queuedOutputBytes,
    )
  }
}

class SoakSocket {
  readonly audioEndGenerations = new Set<number>()
  readonly audioFrameGenerations: number[] = []
  readonly controlTypes: string[] = []
  staleDeliveries = 0
  serverMessageCount = 0
  helloCount = 0
  streamId = ''
  currentGeneration = 0
  connected = false
  closed = false

  constructor(private readonly socket: WebSocket) {
    socket.on('message', (data, isBinary) => this.onMessage(data, isBinary))
    socket.on('close', () => {
      this.closed = true
    })
  }

  async waitForHello(): Promise<void> {
    await waitFor(() => this.streamId.length > 0, 10_000, 'voice hello')
  }

  async control(
    message: Omit<VoiceClientControl, 'protocol' | 'streamId'>,
  ): Promise<void> {
    await sendSocket(this.socket, JSON.stringify({
      ...message,
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: this.streamId,
    }))
  }

  async audio(generation: number, sequence: number, samples: Int16Array): Promise<void> {
    const frame: VoiceAudioFrame = {
      direction: 'microphone',
      generation,
      sequence,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples,
    }
    await sendSocket(this.socket, Buffer.from(encodeVoiceAudioFrame(frame)))
  }

  async waitForAudioEnd(generation: number): Promise<void> {
    await waitFor(
      () => this.audioEndGenerations.has(generation),
      10_000,
      `audio end for generation ${generation}`,
    )
  }

  async waitForClose(): Promise<void> {
    await waitFor(() => this.closed, 10_000, 'voice socket close')
  }

  close(): void {
    this.socket.close()
  }

  private onMessage(data: RawData, isBinary: boolean): void {
    this.serverMessageCount += 1
    if (isBinary) {
      const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer)
      const payload = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      const frame = decodeVoiceAudioFrame(payload)
      this.audioFrameGenerations.push(frame.generation)
      if (frame.generation < this.currentGeneration) this.staleDeliveries += 1
      return
    }
    const control = JSON.parse(data.toString()) as VoiceServerControl
    this.controlTypes.push(control.type)
    if (control.type === 'hello') {
      this.helloCount += 1
      this.streamId = control.streamId
    }
    if (control.generation < this.currentGeneration) this.staleDeliveries += 1
    if (control.type === 'audio_end') {
      this.audioEndGenerations.add(control.generation)
    }
  }
}

export interface LifecycleCycleResult {
  requested: number
  completed: number
  socketConnections: number
  startupStops: number
  immediateRestarts: number
  cleanupChecks: number
  oldAcquisitionCancellations: number
  oldHelloLeakages: number
  oldStreamLeakages: number
  replacementHellos: number
  replacementSessions: number
  workerCleanupChecks: number
  gatedStartupRaces: GatedStartupRaceObservation[]
}

export interface LifecycleCycleObservation {
  socketConnections: number
  closedSockets: number
  backendCleaned: boolean
}

export interface GatedStartupRaceObservation extends LifecycleCycleObservation {
  cycle: number
  oldAcquisitionUnresolvedAtClose: boolean
  replacementAttemptStartedBeforeOldRelease: boolean
  oldHelloCount: number
  oldStreamMessageCount: number
  oldAcquisitionCancelled: boolean
  replacementHelloCount: number
  replacementSessionCount: number
  workerStarted: boolean
  workerCleaned: boolean
}

export async function runLifecycleCycles(
  count: number,
  hooks: {
    startupStopEvery: number
    runGatedStartupRace(
      cycle: number,
    ): Promise<Omit<GatedStartupRaceObservation, 'cycle'>>
    startAndStop(): Promise<LifecycleCycleObservation>
  },
): Promise<LifecycleCycleResult> {
  const result: LifecycleCycleResult = {
    requested: count,
    completed: 0,
    socketConnections: 0,
    startupStops: 0,
    immediateRestarts: 0,
    cleanupChecks: 0,
    oldAcquisitionCancellations: 0,
    oldHelloLeakages: 0,
    oldStreamLeakages: 0,
    replacementHellos: 0,
    replacementSessions: 0,
    workerCleanupChecks: 0,
    gatedStartupRaces: [],
  }
  for (let index = 0; index < count; index += 1) {
    if (index % hooks.startupStopEvery === 0) {
      let observation: GatedStartupRaceObservation
      try {
        observation = {
          cycle: index + 1,
          ...await hooks.runGatedStartupRace(index + 1),
        }
      } catch (error) {
        throw new Error(
          `Lifecycle cycle ${index + 1} startup stop failed: ${errorText(error)}`,
        )
      }
      result.gatedStartupRaces.push(observation)
      result.socketConnections += observation.socketConnections
      result.cleanupChecks += observation.closedSockets
      result.startupStops += Number(observation.oldAcquisitionUnresolvedAtClose)
      result.immediateRestarts += Number(
        observation.replacementAttemptStartedBeforeOldRelease,
      )
      result.oldAcquisitionCancellations += Number(
        observation.oldAcquisitionCancelled,
      )
      result.oldHelloLeakages += observation.oldHelloCount
      result.oldStreamLeakages += observation.oldStreamMessageCount
      result.replacementHellos += observation.replacementHelloCount
      result.replacementSessions += observation.replacementSessionCount
      result.workerCleanupChecks += Number(
        observation.workerStarted && observation.workerCleaned,
      )
      result.completed += Number(
        observation.socketConnections === 2
        && observation.closedSockets === 2
        && observation.backendCleaned
        && observation.oldAcquisitionUnresolvedAtClose
        && observation.replacementAttemptStartedBeforeOldRelease
        && observation.oldHelloCount === 0
        && observation.oldStreamMessageCount === 0
        && observation.oldAcquisitionCancelled
        && observation.replacementHelloCount === 1
        && observation.replacementSessionCount === 1
        && observation.workerStarted
        && observation.workerCleaned,
      )
      continue
    }
    let observation: LifecycleCycleObservation
    try {
      observation = await hooks.startAndStop()
    } catch (error) {
      throw new Error(
        `Lifecycle cycle ${index + 1} start/stop failed: ${errorText(error)}`,
      )
    }
    result.socketConnections += observation.socketConnections
    result.cleanupChecks += observation.closedSockets
    result.completed += Number(
      observation.socketConnections === 1
      && observation.closedSockets === 1
      && observation.backendCleaned,
    )
  }
  return result
}

export function childCleanupPassed(
  ownedChildPid: number | undefined,
  childPidsDuring: readonly number[],
  childPidsAfter: readonly number[],
): boolean {
  return ownedChildPid !== undefined
    && childPidsDuring.includes(ownedChildPid)
    && !childPidsAfter.includes(ownedChildPid)
}

export function parseSoakOptions(args: string[]): SoakOptions {
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index]
    const value = args[index + 1]
    if (!name?.startsWith('--') || value === undefined || value.startsWith('--')) {
      throw new Error(soakUsage())
    }
    values.set(name, value)
  }
  return {
    minutes: positiveNumber(values, '--minutes'),
    turnsPerMinute: positiveNumber(values, '--turns-per-minute'),
    rapidStartStop: nonNegativeInteger(values, '--rapid-start-stop'),
    output: path.resolve(requiredOption(values, '--output')),
  }
}

export function linearSlopePerMinute(samples: RssSample[]): number {
  if (samples.length < 2) return 0
  const times = samples.map((sample) => sample.elapsedMs / 60_000)
  const values = samples.map((sample) => sample.rssMiB)
  const meanTime = times.reduce((sum, value) => sum + value, 0) / times.length
  const meanValue = values.reduce((sum, value) => sum + value, 0) / values.length
  let numerator = 0
  let denominator = 0
  for (let index = 0; index < samples.length; index += 1) {
    const timeDelta = times[index] - meanTime
    numerator += timeDelta * (values[index] - meanValue)
    denominator += timeDelta * timeDelta
  }
  return denominator === 0 ? 0 : numerator / denominator
}

async function main(): Promise<void> {
  const options = parseSoakOptions(process.argv.slice(2))
  const unhandledRejections: string[] = []
  const uncaughtExceptions: string[] = []
  const onRejection = (reason: unknown) => unhandledRejections.push(errorText(reason))
  const onException = (error: Error) => uncaughtExceptions.push(error.message)
  process.on('unhandledRejection', onRejection)
  process.on('uncaughtExceptionMonitor', onException)
  try {
    const report = await runSoak(options, unhandledRejections, uncaughtExceptions)
    await mkdir(path.dirname(options.output), { recursive: true })
    await writeFile(options.output, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    if (!report.passed) {
      throw new Error(`Oracle voice soak assertions failed; see ${options.output}`)
    }
    console.log(`Oracle voice soak passed; wrote ${options.output}`)
  } finally {
    process.off('unhandledRejection', onRejection)
    process.off('uncaughtExceptionMonitor', onException)
  }
}

async function runSoak(
  options: SoakOptions,
  unhandledRejections: string[],
  uncaughtExceptions: string[],
): Promise<SoakReport> {
  const repositoryRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
  const dataDirectory = path.join(
    repositoryRoot,
    'test-results',
    `oracle-voice-soak-${process.pid}`,
  )
  await rm(dataDirectory, { recursive: true, force: true })
  const childPidsBefore = await childPids()
  const manager = new SoakManager()
  const engine = new ControlledSoakEngine()
  const backend = new ObservedProductionVoiceBackend(
    new LocalVoiceBackend(engine, SOAK_VOICE_CONFIG),
  )
  const service = new SoakSessionService()
  const transcriptionService = { async initialize() {}, async stop() {} }
  const previousAllowedOrigins = process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
  process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = ''
  const built = await buildApp({
    dataDirectory,
    logger: false,
    managerAgent: manager as never,
    role: 'hub',
    serveStatic: false,
    service: service as never,
    transcriptionService: transcriptionService as never,
    voiceBackend: backend,
  }).finally(() => {
    if (previousAllowedOrigins === undefined) {
      delete process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
    } else {
      process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = previousAllowedOrigins
    }
  })
  let soakSocket: SoakSocket | undefined
  let elapsedMs = 0
  let lifecycleElapsedMs = 0
  let lifecycle: LifecycleCycleResult = {
    requested: options.rapidStartStop,
    completed: 0,
    socketConnections: 0,
    startupStops: 0,
    immediateRestarts: 0,
    cleanupChecks: 0,
    oldAcquisitionCancellations: 0,
    oldHelloLeakages: 0,
    oldStreamLeakages: 0,
    replacementHellos: 0,
    replacementSessions: 0,
    workerCleanupChecks: 0,
    gatedStartupRaces: [],
  }
  let childPidsDuring: number[] = []
  let ownedChildPid: number | undefined
  const rssSamples: RssSample[] = []
  const startedAt = performance.now()
  const rssTimer = setInterval(() => {
    rssSamples.push({
      elapsedMs: performance.now() - startedAt,
      rssMiB: process.memoryUsage().rss / 1_048_576,
    })
  }, 10_000)
  rssTimer.unref?.()
  rssSamples.push({ elapsedMs: 0, rssMiB: process.memoryUsage().rss / 1_048_576 })
  try {
    await built.app.listen({ host: '127.0.0.1', port: 0 })
    const address = built.app.server.address()
    if (!address || typeof address === 'string') throw new Error('Soak server did not bind TCP')
    const baseUrl = `http://127.0.0.1:${address.port}`
    const lifecycleStartedAt = performance.now()
    lifecycle = await runLifecycleCycles(options.rapidStartStop, {
      startupStopEvery: Math.max(1, Math.floor(options.rapidStartStop / 20)),
      runGatedStartupRace: (cycle) =>
        runGatedStartupRace(cycle, baseUrl, backend, engine),
      startAndStop: async () => {
        const socket = await connectSoakSocket(baseUrl)
        await socket.control({
          type: 'start',
          generation: 0,
          language: 'en',
          defaults: {},
          answerOnly: false,
        })
        await socket.control({
          type: 'stop',
          generation: 0,
          reason: 'Lifecycle cycle complete',
        })
        await socket.waitForClose()
        await waitFor(
          () => !backend.busy() && backend.activeSessions === 0,
          10_000,
          'per-cycle backend cleanup',
        )
        return {
          socketConnections: Number(socket.connected),
          closedSockets: Number(socket.closed),
          backendCleaned: !backend.busy() && backend.activeSessions === 0,
        }
      },
    })
    lifecycleElapsedMs = performance.now() - lifecycleStartedAt
    childPidsDuring = await childPids()
    ownedChildPid = engine.childPid()
    console.log(
      `Oracle voice soak completed ${lifecycle.completed} lifecycle cycles `
        + `(${lifecycle.startupStops} startup stops)`,
    )

    soakSocket = await connectSoakSocket(baseUrl)
    console.log('Oracle voice soak connected')
    await soakSocket.control({
      type: 'start',
      generation: 0,
      language: 'en',
      defaults: {},
      answerOnly: false,
    })

    let generation = 0
    const frame = new Int16Array(320).fill(500)
    const turnCount = Math.round(options.minutes * options.turnsPerMinute)
    const soakStartedAt = performance.now()
    const turnIntervalMs = 60_000 / options.turnsPerMinute
    for (let index = 0; index < turnCount; index += 1) {
      await waitUntil(soakStartedAt + index * turnIntervalMs)
      generation += 1
      soakSocket.currentGeneration = generation
      await soakSocket.control({
        type: 'speech_confirmed',
        generation,
        utteranceId: `soak-${generation}`,
      })
      for (let sequence = 0; sequence < 8; sequence += 1) {
        await soakSocket.audio(generation, sequence, frame)
      }
      await soakSocket.control({
        type: 'speech_end',
        generation,
        utteranceId: `soak-${generation}`,
      })
      const expectedSends = index + 1
      await waitFor(
        () => manager.sends.length === expectedSends,
        10_000,
        `soak manager send ${index + 1}`,
      )
      manager.respond(`Soak response ${index + 1}.`)
      try {
        await soakSocket.waitForAudioEnd(generation)
      } catch (error) {
        throw new Error(
          `${errorText(error)}; controlled engine syntheses=${engine.ttsSyntheses}, `
            + `audio frames=${engine.audioFrames}; client controls=`
            + `${soakSocket.controlTypes.join(',')}; client audio generations=`
            + `${soakSocket.audioFrameGenerations.join(',')}; backend outputs=`
            + `${backend.deliveredOutputTypes.join(',')}`,
        )
      }
    }
    await waitUntil(soakStartedAt + options.minutes * 60_000)
    elapsedMs = performance.now() - soakStartedAt
    console.log(`Oracle voice soak completed ${turnCount} timed turns`)
    await soakSocket.control({
      type: 'stop',
      generation,
      reason: 'Soak complete',
    })
    await soakSocket.waitForClose()
    await waitFor(
      () => backend.activeSessions === 0,
      10_000,
      'backend session close',
    )
    await delay(100)
    console.log('Oracle voice soak socket closed')
  } finally {
    clearInterval(rssTimer)
    rssSamples.push({
      elapsedMs: performance.now() - startedAt,
      rssMiB: process.memoryUsage().rss / 1_048_576,
    })
    soakSocket?.close()
    built.app.server.closeAllConnections?.()
    await closeServer(built.app.server)
    await backend.stop()
    await manager.stop()
    built.manager?.stop()
    built.pushService?.stop()
    await transcriptionService.stop()
    await service.stop()
    console.log('Oracle voice soak server closed')
    await rm(dataDirectory, { recursive: true, force: true })
  }

  async function closeServer(server: import('node:http').Server): Promise<void> {
    if (!server.listening) return
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
  }

  const childPidsAfter = await childPids()
  const orphanChildPids = childPidsAfter.filter((pid) => !childPidsBefore.includes(pid))
  const utteranceCount = Math.round(options.minutes * options.turnsPerMinute)
  const finalSamples = rssSamples.filter((sample) =>
    sample.elapsedMs >= rssSamples.at(-1)!.elapsedMs / 2)
  const finalRssSlopeMiBPerMinute = linearSlopePerMinute(finalSamples)
  const assertions = {
    realElapsedDuration: elapsedMs >= options.minutes * 60_000,
    lifecycleCyclesComplete: lifecycle.completed === options.rapidStartStop,
    lifecycleCleanupComplete:
      lifecycle.cleanupChecks === lifecycle.socketConnections,
    startupStopRestartCovered:
      lifecycle.startupStops >= Math.min(20, options.rapidStartStop)
      && lifecycle.immediateRestarts === lifecycle.startupStops,
    gatedRaceEvidenceComplete:
      lifecycle.gatedStartupRaces.length === lifecycle.startupStops
      && lifecycle.gatedStartupRaces.every((race) =>
        race.oldAcquisitionUnresolvedAtClose
        && race.replacementAttemptStartedBeforeOldRelease
        && race.oldAcquisitionCancelled
        && race.backendCleaned
        && race.workerStarted
        && race.workerCleaned
        && race.closedSockets === 2),
    noOldStartupLeakage:
      lifecycle.oldHelloLeakages === 0
      && lifecycle.oldStreamLeakages === 0,
    exactlyOneReplacementPerRace:
      lifecycle.replacementHellos === lifecycle.gatedStartupRaces.length
      && lifecycle.replacementSessions === lifecycle.gatedStartupRaces.length,
    gatedWorkersCleaned:
      lifecycle.workerCleanupChecks === lifecycle.gatedStartupRaces.length,
    exactManagerSendCount: manager.sends.length === utteranceCount,
    oneSendPerUtterance: new Set(manager.sends).size === utteranceCount,
    inputBacklogMeasured:
      backend.maximumInputBacklogBytes > 320 * Int16Array.BYTES_PER_ELEMENT,
    boundedQueue:
      backend.maximumInputBacklogBytes <= DEFAULT_VOICE_BACKEND_LIMITS.maxQueueBytes,
    outputBacklogMeasured: backend.maximumOutputQueueBytes > 0,
    boundedOutputQueue:
      backend.maximumOutputQueueBytes
        <= DEFAULT_VOICE_BACKEND_LIMITS.maxOutputQueueBytes,
    noQueueOverflow: backend.queueOverflowRejections === 0,
    staleOutputRejected: soakSocket?.staleDeliveries === 0,
    noActiveBackendSession: backend.activeSessions === 0,
    socketClosed: soakSocket?.closed === true,
    ownedChildCleaned: childCleanupPassed(
      ownedChildPid,
      childPidsDuring,
      childPidsAfter,
    ),
    noOrphanChildPid: orphanChildPids.length === 0,
    boundedFinalRssSlope: finalRssSlopeMiBPerMinute < 1,
    noUnhandledRejection: unhandledRejections.length === 0,
    noUncaughtException: uncaughtExceptions.length === 0,
  }
  return {
    schemaVersion: 3,
    generatedAt: new Date().toISOString(),
    requested: {
      minutes: options.minutes,
      turnsPerMinute: options.turnsPerMinute,
      rapidStartStop: options.rapidStartStop,
    },
    elapsedMs,
    lifecycleElapsedMs,
    lifecycle,
    utteranceCount,
    managerSendCount: manager.sends.length,
    uniqueManagerSendCount: new Set(manager.sends).size,
    managerCancellationCount: manager.cancellations,
    backendCancellationCount: engine.cancellations,
    staleBackendEmissions: engine.staleEmissions,
    staleClientDeliveries: soakSocket?.staleDeliveries ?? -1,
    maximumInputQueueBytes: backend.maximumInputQueueBytes,
    maximumPendingInputBytes: backend.maximumPendingInputBytes,
    maximumInputBacklogBytes: backend.maximumInputBacklogBytes,
    maximumOutputQueueBytes: backend.maximumOutputQueueBytes,
    queueOverflowRejections: backend.queueOverflowRejections,
    queueLimitBytes: DEFAULT_VOICE_BACKEND_LIMITS.maxQueueBytes,
    activeBackendSessionsAfterStop: backend.activeSessions,
    socketClosed: soakSocket?.closed ?? false,
    childPidsBefore,
    childPidsDuring,
    childPidsAfter,
    ...(ownedChildPid === undefined ? {} : { ownedChildPid }),
    orphanChildPids,
    rssSamples,
    finalRssSlopeMiBPerMinute,
    unhandledRejections,
    uncaughtExceptions,
    assertions,
    passed: Object.values(assertions).every(Boolean),
  }
}

async function connectSoakSocket(
  baseUrl: string,
  waitForHello = true,
): Promise<SoakSocket> {
  const deadline = performance.now() + 10_000
  while (true) {
    const response = await fetch(`${baseUrl}/api/oracle-voice/tickets`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        connection: 'close',
        origin: baseUrl,
      },
    })
    const ticket = await response.json() as TicketResponse
    if (!response.ok || !ticket.ticket) {
      throw new Error(
        `Voice soak ticket failed (${response.status}): ${JSON.stringify(ticket)}`,
      )
    }
    const url = new URL('/api/oracle-voice', baseUrl)
    url.protocol = 'ws:'
    url.searchParams.set('ticket', ticket.ticket)
    const socket = new WebSocket(url, { origin: baseUrl })
    const client = new SoakSocket(socket)
    try {
      await new Promise<void>((resolve, reject) => {
        socket.once('open', resolve)
        socket.once('error', reject)
      })
      client.connected = true
      if (waitForHello) await client.waitForHello()
      return client
    } catch (error) {
      socket.close()
      if (
        performance.now() >= deadline
        || !errorText(error).includes('409')
      ) {
        throw error
      }
      await delay(10)
    }
  }
}

async function runGatedStartupRace(
  cycle: number,
  baseUrl: string,
  backend: ObservedProductionVoiceBackend,
  engine: ControlledSoakEngine,
): Promise<Omit<GatedStartupRaceObservation, 'cycle'>> {
  await backend.stop()
  await waitFor(
    () => !backend.busy() && backend.activeSessions === 0,
    10_000,
    `gated lifecycle cycle ${cycle} pre-race cleanup`,
  )
  const attemptStart = backend.openAttempts.length
  const openedStart = backend.openedSessions.length
  const cancelledStart = backend.cancelledAcquisitions.length
  const gate = engine.gateNextInitialization()
  let oldSocket: SoakSocket | undefined
  let replacementSocket: SoakSocket | undefined
  try {
    oldSocket = await connectSoakSocket(baseUrl, false)
    await waitFor(
      () => gate.started && backend.openAttempts.length === attemptStart + 1,
      10_000,
      `gated lifecycle cycle ${cycle} old acquisition`,
    )
    const oldStreamId = backend.openAttempts[attemptStart]
    const oldAcquisitionUnresolvedAtClose =
      !gate.resolved
      && !backend.openedSessions.slice(openedStart).includes(oldStreamId)

    oldSocket.close()
    await oldSocket.waitForClose()
    await waitFor(
      () => backend.cancelledAcquisitions.length === cancelledStart + 1,
      10_000,
      `gated lifecycle cycle ${cycle} old acquisition cancellation`,
    )

    replacementSocket = await connectSoakSocket(baseUrl, false)
    await waitFor(
      () => backend.openAttempts.length === attemptStart + 2,
      10_000,
      `gated lifecycle cycle ${cycle} replacement acquisition`,
    )
    const replacementStreamId = backend.openAttempts[attemptStart + 1]
    const replacementAttemptStartedBeforeOldRelease =
      !gate.released
      && !gate.resolved
      && backend.openedSessions.length === openedStart

    gate.release()
    await replacementSocket.waitForHello()
    await replacementSocket.control({
      type: 'start',
      generation: 0,
      language: 'en',
      defaults: {},
      answerOnly: false,
    })
    await replacementSocket.control({
      type: 'stop',
      generation: 0,
      reason: `Gated lifecycle cycle ${cycle} complete`,
    })
    await replacementSocket.waitForClose()
    await waitFor(
      () => !backend.busy() && backend.activeSessions === 0,
      10_000,
      `gated lifecycle cycle ${cycle} backend cleanup`,
    )
    const workerPid = engine.childPid()
    const workerStarted = workerPid !== undefined
    const replacementSessionCount = backend.openedSessions
      .slice(openedStart)
      .filter((streamId) => streamId === replacementStreamId)
      .length
    await backend.stop()
    const childrenAfterStop = await childPids()

    return {
      socketConnections:
        Number(oldSocket.connected) + Number(replacementSocket.connected),
      closedSockets: Number(oldSocket.closed) + Number(replacementSocket.closed),
      oldAcquisitionUnresolvedAtClose,
      replacementAttemptStartedBeforeOldRelease,
      oldHelloCount: oldSocket.helloCount,
      oldStreamMessageCount: oldSocket.serverMessageCount,
      oldAcquisitionCancelled: backend.cancelledAcquisitions
        .slice(cancelledStart)
        .includes(oldStreamId),
      replacementHelloCount: replacementSocket.helloCount,
      replacementSessionCount,
      backendCleaned: !backend.busy() && backend.activeSessions === 0,
      workerStarted,
      workerCleaned:
        workerPid !== undefined && !childrenAfterStop.includes(workerPid),
    }
  } finally {
    gate.release()
    oldSocket?.close()
    replacementSocket?.close()
    await backend.stop()
  }
}

async function sendSocket(socket: WebSocket, data: string | Buffer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    socket.send(data, (error) => error ? reject(error) : resolve())
  })
}

async function waitFor(
  condition: () => boolean,
  timeoutMs: number,
  description: string,
): Promise<void> {
  const deadline = performance.now() + timeoutMs
  while (!condition()) {
    if (performance.now() >= deadline) {
      throw new Error(`Timed out waiting for ${description}`)
    }
    await delay(10)
  }
}

async function waitUntil(target: number): Promise<void> {
  while (performance.now() < target) {
    await delay(Math.min(1_000, target - performance.now()))
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds)))
}

async function childPids(): Promise<number[]> {
  if (process.platform !== 'linux') return []
  try {
    const value = await readFile(
      `/proc/self/task/${process.pid}/children`,
      'utf8',
    )
    return value.trim().split(/\s+/).filter(Boolean).map(Number).sort((a, b) => a - b)
  } catch {
    return []
  }
}

function positiveNumber(values: ReadonlyMap<string, string>, name: string): number {
  const value = Number(requiredOption(values, name))
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`)
  }
  return value
}

function nonNegativeInteger(values: ReadonlyMap<string, string>, name: string): number {
  const value = Number(requiredOption(values, name))
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`)
  }
  return value
}

function requiredOption(values: ReadonlyMap<string, string>, name: string): string {
  const value = values.get(name)
  if (!value) throw new Error(`${name} is required\n${soakUsage()}`)
  return value
}

function soakUsage(): string {
  return 'Usage: oracle-voice-soak.ts --minutes <n> --turns-per-minute <n> '
    + '--rapid-start-stop <n> --output <file>'
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isMainModule(): boolean {
  return Boolean(process.argv[1])
    && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
}

if (isMainModule()) {
  try {
    await main()
  } catch (error) {
    console.error(errorText(error))
    process.exitCode = 1
  }
}
