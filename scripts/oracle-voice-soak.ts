import { EventEmitter } from 'node:events'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import WebSocket, { type RawData } from 'ws'
import { buildApp } from '../server/app.js'
import {
  DEFAULT_VOICE_BACKEND_LIMITS,
  type VoiceBackend,
  type VoiceBackendSession,
  type VoiceBackendSessionOpenOptions,
} from '../server/oracle-voice-session.js'
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
  schemaVersion: 1
  generatedAt: string
  requested: {
    minutes: number
    turnsPerMinute: number
    rapidStartStop: number
  }
  elapsedMs: number
  utteranceCount: number
  managerSendCount: number
  uniqueManagerSendCount: number
  managerCancellationCount: number
  backendCancellationCount: number
  staleBackendEmissions: number
  staleClientDeliveries: number
  maximumInputQueueBytes: number
  queueLimitBytes: number
  activeBackendSessionsAfterStop: number
  socketClosed: boolean
  childPidsBefore: number[]
  childPidsAfter: number[]
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

class SoakVoiceBackend implements VoiceBackend {
  activeSessions = 0
  cancellations = 0
  staleEmissions = 0
  maximumInputQueueBytes = 0

  capability(): VoiceBackendCapability {
    return {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'soak-deterministic',
      ttsVoice: 'soak-deterministic',
      resourceClass: 'low',
    }
  }

  limits() {
    return DEFAULT_VOICE_BACKEND_LIMITS
  }

  busy(): boolean {
    return this.activeSessions > 0
  }

  async open(options: VoiceBackendSessionOpenOptions): Promise<VoiceBackendSession> {
    this.activeSessions += 1
    let generation = 0
    let utteranceId = ''
    let closed = false
    return {
      control: async (message) => {
        if (closed) return
        switch (message.type) {
          case 'start':
            generation = message.generation
            await options.send(serverState(options.streamId, generation, 'ready'))
            return
          case 'speech_tentative':
          case 'heartbeat':
            return
          case 'speech_confirmed':
            generation = message.generation
            utteranceId = message.utteranceId
            await options.send(serverState(options.streamId, generation, 'listening'))
            return
          case 'speech_end':
            queueMicrotask(() => {
              void sendTranscript(options, generation, utteranceId)
            })
            return
          case 'cancel': {
            this.cancellations += 1
            const staleGeneration = message.generation
            queueMicrotask(() => {
              this.staleEmissions += 1
              void options.send({
                type: 'partial',
                protocol: ORACLE_VOICE_PROTOCOL,
                streamId: options.streamId,
                generation: staleGeneration,
                utteranceId: `stale-${staleGeneration}`,
                text: 'stale output',
              }).catch(() => undefined)
            })
            return
          }
          case 'synthesize': {
            queueMicrotask(() => {
              void sendSynthesis(options, message)
            })
            return
          }

          async function sendTranscript(
            options: VoiceBackendSessionOpenOptions,
            generation: number,
            utteranceId: string,
          ): Promise<void> {
            await options.send({
              type: 'partial',
              protocol: ORACLE_VOICE_PROTOCOL,
              streamId: options.streamId,
              generation,
              utteranceId,
              text: `soak utterance ${generation}`,
            })
            await options.send({
              type: 'final',
              protocol: ORACLE_VOICE_PROTOCOL,
              streamId: options.streamId,
              generation,
              utteranceId,
              text: `soak utterance ${generation}`,
            })
          }

          async function sendSynthesis(
            options: VoiceBackendSessionOpenOptions,
            message: Extract<VoiceClientControl, { type: 'synthesize' }>,
          ): Promise<void> {
            await options.send(serverState(options.streamId, message.generation, 'speaking'))
            await options.send({
              direction: 'playback',
              generation: message.generation,
              segmentId: message.segmentId,
              sequence: 0,
              sampleRate: 22_050,
              samples: new Int16Array(2_205).fill(400),
            })
            await options.send({
              type: 'audio_end',
              protocol: ORACLE_VOICE_PROTOCOL,
              streamId: options.streamId,
              generation: message.generation,
              segmentId: message.segmentId,
            })
          }
          case 'stop':
            queueMicrotask(() => {
              void options.send(
                serverState(options.streamId, generation, 'stopped'),
              ).catch(() => undefined)
            })
        }
      },
      audio: async (frame) => {
        const bytes = frame.samples.byteLength
        this.maximumInputQueueBytes = Math.max(this.maximumInputQueueBytes, bytes)
      },
      close: async () => {
        if (closed) return
        closed = true
        this.activeSessions -= 1
      },
    }
  }

  async stop(): Promise<void> {
    this.activeSessions = 0
  }
}

class SoakSocket {
  readonly audioEndGenerations = new Set<number>()
  staleDeliveries = 0
  streamId = ''
  currentGeneration = 0
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
    if (isBinary) {
      const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer)
      const payload = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      const frame = decodeVoiceAudioFrame(payload)
      if (frame.generation < this.currentGeneration) this.staleDeliveries += 1
      return
    }
    const control = JSON.parse(data.toString()) as VoiceServerControl
    if (control.type === 'hello') this.streamId = control.streamId
    if (control.generation < this.currentGeneration) this.staleDeliveries += 1
    if (control.type === 'audio_end') {
      this.audioEndGenerations.add(control.generation)
    }
  }
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
  const backend = new SoakVoiceBackend()
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
    soakSocket = await connectSoakSocket(`http://127.0.0.1:${address.port}`)
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
    for (let index = 0; index < options.rapidStartStop; index += 1) {
      generation += 1
      soakSocket.currentGeneration = generation
      await soakSocket.control({
        type: 'speech_confirmed',
        generation,
        utteranceId: `race-${generation}`,
      })
      await soakSocket.audio(generation, 0, frame)
      await soakSocket.control({
        type: 'speech_end',
        generation,
        utteranceId: `race-${generation}`,
      })
      await waitFor(
        () => manager.sends.length === index + 1,
        10_000,
        `race manager send ${index + 1}`,
      )
    }
    console.log(`Oracle voice soak completed ${options.rapidStartStop} rapid races`)

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
      await soakSocket.audio(generation, 0, frame)
      await soakSocket.control({
        type: 'speech_end',
        generation,
        utteranceId: `soak-${generation}`,
      })
      const expectedSends = options.rapidStartStop + index + 1
      await waitFor(
        () => manager.sends.length === expectedSends,
        10_000,
        `soak manager send ${index + 1}`,
      )
      manager.respond(`Soak response ${index + 1}.`)
      await soakSocket.waitForAudioEnd(generation)
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
  const utteranceCount = options.rapidStartStop
    + Math.round(options.minutes * options.turnsPerMinute)
  const finalSamples = rssSamples.filter((sample) =>
    sample.elapsedMs >= rssSamples.at(-1)!.elapsedMs / 2)
  const finalRssSlopeMiBPerMinute = linearSlopePerMinute(finalSamples)
  const assertions = {
    realElapsedDuration: elapsedMs >= options.minutes * 60_000,
    exactManagerSendCount: manager.sends.length === utteranceCount,
    oneSendPerUtterance: new Set(manager.sends).size === utteranceCount,
    boundedQueue: backend.maximumInputQueueBytes <= DEFAULT_VOICE_BACKEND_LIMITS.maxQueueBytes,
    staleOutputRejected: soakSocket?.staleDeliveries === 0,
    noActiveBackendSession: backend.activeSessions === 0,
    socketClosed: soakSocket?.closed === true,
    noOrphanChildPid: orphanChildPids.length === 0,
    boundedFinalRssSlope: finalRssSlopeMiBPerMinute < 1,
    noUnhandledRejection: unhandledRejections.length === 0,
    noUncaughtException: uncaughtExceptions.length === 0,
  }
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    requested: {
      minutes: options.minutes,
      turnsPerMinute: options.turnsPerMinute,
      rapidStartStop: options.rapidStartStop,
    },
    elapsedMs,
    utteranceCount,
    managerSendCount: manager.sends.length,
    uniqueManagerSendCount: new Set(manager.sends).size,
    managerCancellationCount: manager.cancellations,
    backendCancellationCount: backend.cancellations,
    staleBackendEmissions: backend.staleEmissions,
    staleClientDeliveries: soakSocket?.staleDeliveries ?? -1,
    maximumInputQueueBytes: backend.maximumInputQueueBytes,
    queueLimitBytes: DEFAULT_VOICE_BACKEND_LIMITS.maxQueueBytes,
    activeBackendSessionsAfterStop: backend.activeSessions,
    socketClosed: soakSocket?.closed ?? false,
    childPidsBefore,
    childPidsAfter,
    orphanChildPids,
    rssSamples,
    finalRssSlopeMiBPerMinute,
    unhandledRejections,
    uncaughtExceptions,
    assertions,
    passed: Object.values(assertions).every(Boolean),
  }
}

async function connectSoakSocket(baseUrl: string): Promise<SoakSocket> {
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
  await new Promise<void>((resolve, reject) => {
    socket.once('open', resolve)
    socket.once('error', reject)
  })
  await client.waitForHello()
  return client
}

function serverState(
  streamId: string,
  generation: number,
  state: Extract<VoiceServerControl, { type: 'state' }>['state'],
): VoiceServerControl {
  return {
    type: 'state',
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId,
    generation,
    state,
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
