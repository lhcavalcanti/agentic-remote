import { EventEmitter } from 'node:events'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import {
  ORACLE_VOICE_PROTOCOL,
  type VoiceAudioFrame,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../../shared/oracle-voice'
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSettingsSnapshot,
  ManagerSnapshot,
  UpdateManagerSettingsInput,
} from '../../shared/manager'
import type { VoiceBackendCapability } from '../../shared/contracts'
import { buildApp } from '../../server/app'
import type { ManagerRouteAgent } from '../../server/manager-routes'
import {
  DEFAULT_VOICE_BACKEND_LIMITS,
  type VoiceBackend,
  type VoiceBackendOutput,
  type VoiceBackendSession,
  type VoiceBackendSessionOpenOptions,
} from '../../server/oracle-voice-session'

interface ScriptedUtterance {
  text: string
  partial?: string
  holdFinal?: boolean
}

interface FakeVoiceState {
  activeStreams: number
  streamStarts: number
  audioFrames: number
  managerSends: string[]
  synthesizedTexts: string[]
  synthesizedSegments: Array<{ text: string; signature: number }>
  cancellations: number
  currentGeneration: number
}

interface ActiveBackendSession {
  streamId: string
  generation: number
  utteranceId?: string
  script?: ScriptedUtterance
  partialSent?: boolean
  send(output: VoiceBackendOutput): Promise<void>
  terminate: VoiceBackendSessionOpenOptions['terminate']
}

export class BrowserTestSessionService extends EventEmitter {
  async start() {}
  async stop() {}
  providers() { return [] }
  listSessions() { return [] }
  listHistory() { return [] }
}

export class FakeManager extends EventEmitter<{ event: [event: ManagerEvent] }>
  implements ManagerRouteAgent {
  private messages: ManagerMessage[] = []
  private streaming: ManagerSnapshot['streaming']
  private currentUserId: string | undefined
  private sequence = 0
  readonly sends: string[] = []
  cancellations = 0

  async start() {}
  async stop() {}
  hiddenSessionIds() { return [] }

  snapshot(): ManagerSnapshot {
    return {
      available: true,
      status: this.currentUserId ? 'working' : 'idle',
      messages: this.messages.map((message) => ({ ...message })),
      queued: 0,
      managedSessions: [],
      ...(this.streaming ? { streaming: { ...this.streaming } } : {}),
    }
  }

  async send(
    content: string,
    _defaults?: ManagerClientDefaults,
    options: { answerOnly?: boolean } = {},
  ): Promise<ManagerMessage> {
    const timestamp = new Date().toISOString()
    const message: ManagerMessage = {
      id: `voice-user-${++this.sequence}`,
      role: 'user',
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      state: 'running',
      ...(options.answerOnly ? { answerOnly: true } : {}),
    }
    this.sends.push(content)
    this.messages.push(message)
    this.currentUserId = message.id
    this.streaming = undefined
    this.emit('event', { type: 'manager.message', message: { ...message } })
    this.emit('event', {
      type: 'manager.status',
      status: 'working',
      queued: 0,
    })
    return { ...message }
  }

  delta(content: string): void {
    if (!this.currentUserId) throw new Error('No Oracle turn is active')
    const messageId = `voice-assistant-${this.currentUserId}`
    this.streaming = { messageId, content }
    this.emit('event', { type: 'manager.delta', messageId, content })
  }

  finish(content: string): void {
    const replyTo = this.currentUserId
    if (!replyTo) throw new Error('No Oracle turn is active')
    const timestamp = new Date().toISOString()
    const assistant: ManagerMessage = {
      id: `voice-assistant-${replyTo}`,
      role: 'assistant',
      replyTo,
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      state: 'done',
    }
    this.messages.push(assistant)
    this.streaming = undefined
    this.emit('event', { type: 'manager.message', message: { ...assistant } })
    this.updateUser(replyTo, 'done')
    this.currentUserId = undefined
    this.emit('event', { type: 'manager.status', status: 'idle', queued: 0 })
  }

  async cancel(): Promise<void> {
    this.cancellations += 1
    const replyTo = this.currentUserId
    if (replyTo) this.updateUser(replyTo, 'interrupted')
    this.currentUserId = undefined
    this.streaming = undefined
    this.emit('event', { type: 'manager.status', status: 'idle', queued: 0 })
  }

  resetState(): void {
    this.messages = []
    this.streaming = undefined
    this.currentUserId = undefined
    this.sequence = 0
    this.sends.length = 0
    this.cancellations = 0
    this.emit('event', { type: 'manager.reset', snapshot: this.snapshot() })
  }

  async retry() { throw Object.assign(new Error('Not used by E2E'), { statusCode: 409 }) }
  async removeQueued() { throw Object.assign(new Error('Not used by E2E'), { statusCode: 409 }) }
  async editQueued() { throw Object.assign(new Error('Not used by E2E'), { statusCode: 409 }) }
  async resolveConfirmation() {
    throw Object.assign(new Error('Not used by E2E'), { statusCode: 409 })
  }
  async updateSettings(
    _input: UpdateManagerSettingsInput,
  ): Promise<ManagerSettingsSnapshot> {
    return {}
  }
  async reset(): Promise<void> {
    this.resetState()
  }

  private updateUser(
    id: string,
    state: NonNullable<ManagerMessage['state']>,
  ): void {
    const index = this.messages.findIndex((message) => message.id === id)
    if (index < 0) return
    const message = {
      ...this.messages[index],
      state,
      updatedAt: new Date().toISOString(),
    }
    this.messages[index] = message
    this.emit('event', { type: 'manager.message', message: { ...message } })
  }
}

class FakeVoiceBackend implements VoiceBackend {
  private readonly utterances: ScriptedUtterance[] = []
  private readonly pendingFinals: ActiveBackendSession[] = []
  private readonly sessions = new Map<string, ActiveBackendSession>()
  readonly synthesizedTexts: string[] = []
  readonly synthesizedSegments: Array<{ text: string; signature: number }> = []
  streamStarts = 0
  audioFrames = 0
  currentGeneration = 0
  private synthesisSequence = 0

  capability(): VoiceBackendCapability {
    return {
      available: true,
      sampleRate: 16_000,
      playbackSampleRate: 22_050,
      languages: ['en', 'pt-BR'],
      sttProfile: 'deterministic-e2e',
      ttsVoice: 'deterministic-e2e',
      resourceClass: 'low',
    }
  }

  limits() {
    return DEFAULT_VOICE_BACKEND_LIMITS
  }

  busy() {
    return false
  }

  queueUtterance(script: ScriptedUtterance): void {
    this.utterances.push(script)
  }

  async open(options: VoiceBackendSessionOpenOptions): Promise<VoiceBackendSession> {
    this.streamStarts += 1
    const active: ActiveBackendSession = {
      streamId: options.streamId,
      generation: 0,
      send: options.send,
      terminate: options.terminate,
    }
    this.sessions.set(options.streamId, active)
    return {
      control: async (message) => this.control(active, message),
      audio: async (frame) => this.audio(active, frame),
      close: async () => {
        this.sessions.delete(options.streamId)
      },
    }
  }

  async stop(): Promise<void> {
    this.sessions.clear()
    this.pendingFinals.length = 0
  }

  releaseFinal(): void {
    const active = this.pendingFinals.shift()
    if (!active?.script || !active.utteranceId) {
      throw new Error('No held final is pending')
    }
    void this.sendFinal(active)
  }

  dropNetwork(): void {
    const active = [...this.sessions.values()].at(-1)
    if (!active) throw new Error('No voice stream is connected')
    active.terminate({
      code: 1011,
      reason: 'Deterministic E2E network drop',
      retryable: true,
      cause: 'transport',
    })
  }

  async emitStale(generation: number): Promise<void> {
    const active = [...this.sessions.values()].at(-1)
    if (!active) throw new Error('No voice stream is connected')
    await active.send({
      type: 'partial',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: active.streamId,
      generation,
      utteranceId: `stale-${generation}`,
      text: 'stale generation transcript',
    })
    await active.send({
      direction: 'playback',
      generation,
      segmentId: `stale-${generation}`,
      sequence: 0,
      sampleRate: 22_050,
      samples: new Int16Array(2_205).fill(700),
    })
  }

  resetState(): void {
    this.utterances.length = 0
    this.pendingFinals.length = 0
    this.synthesizedTexts.length = 0
    this.synthesizedSegments.length = 0
    this.streamStarts = 0
    this.audioFrames = 0
    this.currentGeneration = 0
    this.synthesisSequence = 0
  }

  activeStreams(): number {
    return this.sessions.size
  }

  private async control(
    active: ActiveBackendSession,
    message: VoiceClientControl,
  ): Promise<void> {
    switch (message.type) {
      case 'start':
        active.generation = message.generation
        this.currentGeneration = message.generation
        await active.send(serverState(active, 'listening'))
        return
      case 'speech_tentative':
      case 'heartbeat':
        return
      case 'speech_confirmed':
        active.generation = message.generation
        active.utteranceId = message.utteranceId
        active.script = this.utterances.shift()
        active.partialSent = false
        this.currentGeneration = message.generation
        if (!active.script) throw new Error('No deterministic utterance was queued')
        return
      case 'speech_end':
        if (active.script?.holdFinal) {
          this.pendingFinals.push(active)
          return
        }
        await this.sendFinal(active)
        return
      case 'cancel':
        return
      case 'synthesize':
        {
        const signature = 1_000 + (++this.synthesisSequence)
        this.synthesizedTexts.push(message.text)
        this.synthesizedSegments.push({ text: message.text, signature })
        await active.send(serverState(active, 'speaking'))
        queueMicrotask(() => {
          void this.sendPlayback(active, message, signature).catch(() => undefined)
        })
        return
        }
      case 'stop':
        await active.send(serverState(active, 'stopped'))
    }
  }

  private async sendFinal(active: ActiveBackendSession): Promise<void> {
    if (!active.script || !active.utteranceId) {
      throw new Error('No deterministic utterance is active')
    }
    await active.send({
      type: 'final',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: active.streamId,
      generation: active.generation,
      utteranceId: active.utteranceId,
      text: active.script.text,
    })
    active.script = undefined
    active.utteranceId = undefined
  }

  private async audio(
    active: ActiveBackendSession,
    frame: VoiceAudioFrame,
  ): Promise<void> {
    if (frame.direction !== 'microphone') return
    this.audioFrames += 1
    if (active.partialSent || !active.script || !active.utteranceId) return
    active.partialSent = true
    await active.send(serverState(active, 'recognizing'))
    if (active.script.partial) {
      await active.send({
        type: 'partial',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: active.streamId,
        generation: active.generation,
        utteranceId: active.utteranceId,
        text: active.script.partial,
      })
    }
  }

  private async sendPlayback(
    active: ActiveBackendSession,
    message: Extract<VoiceClientControl, { type: 'synthesize' }>,
    signature: number,
  ): Promise<void> {
    const samples = new Int16Array(44_100).fill(signature)
    let sequence = 0
    for (let offset = 0; offset < samples.length; offset += 8_000) {
      await active.send({
        direction: 'playback',
        generation: message.generation,
        segmentId: message.segmentId,
        sequence,
        sampleRate: 22_050,
        samples: samples.slice(offset, offset + 8_000),
      })
      sequence += 1
    }
    await active.send({
      type: 'audio_end',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: active.streamId,
      generation: message.generation,
      segmentId: message.segmentId,
    })
  }
}

function serverState(
  active: ActiveBackendSession,
  state: Extract<VoiceServerControl, { type: 'state' }>['state'],
): VoiceServerControl {
  return {
    type: 'state',
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId: active.streamId,
    generation: active.generation,
    state,
  }
}

export class FakeVoiceController {
  constructor(private readonly page: Page) {}

  async setPermission(permission: 'granted' | 'denied'): Promise<void> {
    await this.page.evaluate((next) => {
      window.__oracleVoiceE2E.permission = next
    }, permission)
  }

  async speak(
    text: string,
    options: { partial?: string; holdFinal?: boolean } = {},
  ): Promise<void> {
    await this.beginSpeech(text, options)
    await this.endSpeech()
  }

  async beginSpeech(
    text: string,
    options: { partial?: string; holdFinal?: boolean } = {},
  ): Promise<void> {
    await this.post('/__e2e/voice/utterance', { text, ...options })
    await this.page.waitForFunction(() => Boolean(window.__oracleVoiceE2E.vad))
    await this.page.evaluate(async () => {
      await window.__oracleVoiceE2E.vad?.beginSpeech()
    })
  }

  async endSpeech(): Promise<void> {
    await this.page.evaluate(() => {
      window.__oracleVoiceE2E.vad?.endSpeech()
    })
  }

  async releaseFinal(): Promise<void> {
    await this.post('/__e2e/voice/release-final')
  }

  async oracleDelta(content: string): Promise<void> {
    await this.post('/__e2e/manager/delta', { content })
  }

  async finishOracle(content: string): Promise<void> {
    await this.post('/__e2e/manager/finish', { content })
  }

  async dropNetwork(): Promise<void> {
    await this.post('/__e2e/voice/drop')
  }

  async emitStaleGeneration(generation: number): Promise<void> {
    await this.post('/__e2e/voice/stale', { generation })
  }

  async currentGeneration(): Promise<number> {
    return (await this.serverState()).currentGeneration
  }

  async managerSends(): Promise<string[]> {
    return (await this.serverState()).managerSends
  }

  async playedText(): Promise<string[]> {
    const [server, browser] = await Promise.all([
      this.serverState(),
      this.browserState(),
    ])
    const textBySignature = new Map(
      server.synthesizedSegments.map(({ text, signature }) => [signature, text]),
    )
    return [...new Set(browser.playedSignatures)].flatMap((signature) => {
      const text = textBySignature.get(signature)
      return text === undefined ? [] : [text]
    })
  }

  async snapshot(): Promise<FakeVoiceState & {
    audioStarts: number
    audioStops: number
  }> {
    return {
      ...(await this.serverState()),
      ...(await this.browserState()),
    }
  }

  private async serverState(): Promise<FakeVoiceState> {
    const response = await this.page.request.get('/__e2e/state')
    expectOk(response.ok(), await response.text())
    return response.json() as Promise<FakeVoiceState>
  }

  private async browserState(): Promise<{
    audioStarts: number
    audioStops: number
    playedSignatures: number[]
  }> {
    return this.page.evaluate(() => ({
      audioStarts: window.__oracleVoiceE2E.audioStarts.length,
      audioStops: window.__oracleVoiceE2E.audioStops,
      playedSignatures: [...window.__oracleVoiceE2E.playedSignatures],
    }))
  }

  private async post(pathname: string, data?: unknown): Promise<void> {
    const response = await this.page.request.post(pathname, { data })
    expectOk(response.ok(), await response.text())
  }
}

function expectOk(ok: boolean, body: string): void {
  if (!ok) throw new Error(`E2E control request failed: ${body}`)
}

export async function installFakeBrowserVoice(page: Page): Promise<void> {
  await page.addInitScript(() => {
    class FakeTrack {
      stop() {
        window.__oracleVoiceE2E.trackStops += 1
      }
    }
    class FakeStream {
      private readonly track = new FakeTrack()
      getTracks() { return [this.track] }
    }
    class FakeAudioBuffer {
      samples = new Float32Array()
      constructor(
        readonly length: number,
        readonly sampleRate: number,
      ) {}
      copyToChannel(samples: Float32Array) {
        this.samples = samples.slice()
      }
    }
    class FakeSource {
      buffer: FakeAudioBuffer | null = null
      onended: (() => void) | null = null
      private timer: ReturnType<typeof setTimeout> | undefined
      private pendingId: number | undefined
      constructor(private readonly context: FakeAudioContext) {}
      connect() {}
      disconnect() {}
      start(when = 0) {
        const duration = this.buffer
          ? Math.max(25, this.buffer.length / this.buffer.sampleRate * 1_000)
          : 25
        const generation = window.__oracleVoiceE2E.incomingPlaybackGeneration ?? -1
        const id = ++window.__oracleVoiceE2E.audioScheduleSequence
        const signature = this.buffer
          ? Math.round(this.buffer.samples[0] * 32_768)
          : 0
        const scheduledAt = performance.now()
        const schedulingDelay = Math.max(
          0,
          when * 1_000 - (performance.now() - this.context.startedAt),
        )
        const record = { id, generation, signature, at: scheduledAt }
        window.__oracleVoiceE2E.audioScheduleRecords.push(record)
        window.__oracleVoiceE2E.pendingAudioStarts.push(record)
        this.pendingId = id
        this.timer = setTimeout(() => {
          this.pendingId = undefined
          window.__oracleVoiceE2E.pendingAudioStarts =
            window.__oracleVoiceE2E.pendingAudioStarts.filter(
              (pending) => pending.id !== id,
            )
          const at = performance.now()
          window.__oracleVoiceE2E.audioStarts.push(at)
          window.__oracleVoiceE2E.audioStartRecords.push({
            id,
            generation,
            signature,
            at,
          })
          window.__oracleVoiceE2E.playedSignatures.push(signature)
          this.timer = setTimeout(() => this.onended?.(), duration)
        }, schedulingDelay + window.__oracleVoiceE2E.playbackStartDelayMs)
      }
      stop() {
        if (this.timer !== undefined) clearTimeout(this.timer)
        this.timer = undefined
        if (this.pendingId !== undefined) {
          const id = this.pendingId
          window.__oracleVoiceE2E.pendingAudioStarts =
            window.__oracleVoiceE2E.pendingAudioStarts.filter(
              (pending) => pending.id !== id,
            )
          this.pendingId = undefined
        }
        window.__oracleVoiceE2E.audioStops += 1
      }
    }
    class FakeGain {
      gain = {
        value: 1,
        cancelScheduledValues() {},
        setValueAtTime: (value: number) => {
          this.gain.value = value
        },
        linearRampToValueAtTime: (value: number) => {
          this.gain.value = value
        },
      }
      connect() {}
      disconnect() {}
    }
    class FakeAudioContext {
      readonly destination = {}
      readonly audioWorklet = { addModule: async () => undefined }
      readonly startedAt = performance.now()
      state: AudioContextState = 'running'
      get currentTime() {
        return (performance.now() - this.startedAt) / 1_000
      }
      async resume() {
        this.state = 'running'
      }
      async close() {
        this.state = 'closed'
      }
      createGain() {
        return new FakeGain()
      }
      createBuffer(_channels: number, length: number, sampleRate: number) {
        return new FakeAudioBuffer(length, sampleRate)
      }
      createBufferSource() {
        return new FakeSource(this)
      }
    }
    class FakeMediaRecorder {
      static isTypeSupported() { return true }
      state = 'inactive'
      readonly mimeType: string
      private readonly listeners = new Map<string, Set<(event: Event & { data?: Blob }) => void>>()
      constructor(_stream: FakeStream, options?: MediaRecorderOptions) {
        this.mimeType = options?.mimeType ?? 'audio/webm'
      }
      addEventListener(
        type: string,
        listener: (event: Event & { data?: Blob }) => void,
      ) {
        const listeners = this.listeners.get(type) ?? new Set()
        listeners.add(listener)
        this.listeners.set(type, listeners)
      }
      start(_timeslice?: number) {
        this.state = 'recording'
      }
      stop() {
        this.state = 'inactive'
        this.emit('dataavailable', Object.assign(new Event('dataavailable'), {
          data: new Blob(['voice'], { type: this.mimeType }),
        }))
        this.emit('stop', new Event('stop'))
      }
      private emit(type: string, event: Event & { data?: Blob }) {
        for (const listener of this.listeners.get(type) ?? []) listener(event)
      }
    }

    window.__oracleVoiceE2E = {
      permission: 'granted',
      audioStarts: [],
      audioStops: 0,
      playedSignatures: [],
      audioScheduleSequence: 0,
      audioScheduleRecords: [],
      pendingAudioStarts: [],
      audioStartRecords: [],
      playbackStartDelayMs: 0,
      trackStops: 0,
    }
    const NativeWebSocket = window.WebSocket
    class ObservedWebSocket extends NativeWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols)
        this.addEventListener('message', (event) => {
          if (!(event.data instanceof ArrayBuffer) || event.data.byteLength < 24) {
            return
          }
          const view = new DataView(event.data)
          if (
            view.getUint8(0) !== 0x41
            || view.getUint8(1) !== 0x52
            || view.getUint8(2) !== 0x56
            || view.getUint8(3) !== 0x43
            || view.getUint8(5) !== 1
          ) return
          window.__oracleVoiceE2E.incomingPlaybackGeneration =
            view.getUint32(8, true)
        })
      }
    }
    Object.defineProperty(window, 'WebSocket', {
      configurable: true,
      value: ObservedWebSocket,
    })
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        async getUserMedia() {
          if (window.__oracleVoiceE2E.permission === 'denied') {
            throw new DOMException('Permission denied by E2E', 'NotAllowedError')
          }
          return new FakeStream()
        },
      },
    })
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext,
    })
    Object.defineProperty(window, 'webkitAudioContext', {
      configurable: true,
      value: FakeAudioContext,
    })
    Object.defineProperty(window, 'AudioWorkletNode', {
      configurable: true,
      value: class {},
    })
    Object.defineProperty(window, 'MediaRecorder', {
      configurable: true,
      value: FakeMediaRecorder,
    })
  })
}

declare global {
  interface Window {
    __oracleVoiceE2E: {
      permission: 'granted' | 'denied'
      vad?: {
        beginSpeech(): Promise<void>
        pushAudio(samples: number[]): Promise<void>
        endSpeech(): void
        speak(): Promise<void>
        misfire(): void
      }
      audioStarts: number[]
      audioStops: number
      playedSignatures: number[]
      incomingPlaybackGeneration?: number
      audioScheduleSequence: number
      audioScheduleRecords: Array<{
        id: number
        generation: number
        signature: number
        at: number
      }>
      pendingAudioStarts: Array<{
        id: number
        generation: number
        signature: number
        at: number
      }>
      audioStartRecords: Array<{
        id: number
        generation: number
        signature: number
        at: number
      }>
      playbackStartDelayMs: number
      trackStops: number
    }
    webkitAudioContext?: typeof AudioContext
  }
}

async function startFixtureServer(port: number): Promise<void> {
  const root = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'test-results',
    'oracle-conversation-e2e-server',
  )
  await rm(root, { recursive: true, force: true })
  const manager = new FakeManager()
  const voice = new FakeVoiceBackend()
  const service = new BrowserTestSessionService()
  const transcriptionService = {
    async initialize() {},
    async stop() {},
  }
  const built = await buildApp({
    dataDirectory: root,
    logger: false,
    managerAgent: manager as never,
    role: 'hub',
    serveStatic: true,
    service: service as never,
    transcriptionService: transcriptionService as never,
    voiceBackend: voice,
  })

  built.app.post<{ Body: ScriptedUtterance }>(
    '/__e2e/voice/utterance',
    async (request) => {
      voice.queueUtterance(request.body)
      return { ok: true }
    },
  )
  built.app.post('/__e2e/voice/release-final', async () => {
    voice.releaseFinal()
    return { ok: true }
  })
  built.app.post<{ Body: { content: string } }>(
    '/__e2e/manager/delta',
    async (request) => {
      manager.delta(request.body.content)
      return { ok: true }
    },
  )
  built.app.post<{ Body: { content: string } }>(
    '/__e2e/manager/finish',
    async (request) => {
      manager.finish(request.body.content)
      return { ok: true }
    },
  )
  built.app.post('/__e2e/voice/drop', async () => {
    voice.dropNetwork()
    return { ok: true }
  })
  built.app.post<{ Body: { generation: number } }>(
    '/__e2e/voice/stale',
    async (request) => {
      await voice.emitStale(request.body.generation)
      return { ok: true }
    },
  )
  built.app.post('/__e2e/reset', async () => {
    manager.resetState()
    voice.resetState()
    return { ok: true }
  })
  built.app.get('/__e2e/state', async (): Promise<FakeVoiceState> => ({
    activeStreams: voice.activeStreams(),
    streamStarts: voice.streamStarts,
    audioFrames: voice.audioFrames,
    managerSends: [...manager.sends],
    synthesizedTexts: [...voice.synthesizedTexts],
    synthesizedSegments: [...voice.synthesizedSegments],
    cancellations: manager.cancellations,
    currentGeneration: voice.currentGeneration,
  }))

  await built.app.listen({ host: '127.0.0.1', port })
  const close = async () => {
    await built.app.close()
    process.exit(0)
  }
  process.once('SIGINT', () => void close())
  process.once('SIGTERM', () => void close())
}

const isMainModule = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule && process.argv.includes('--serve')) {
  const portIndex = process.argv.indexOf('--port')
  const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 4395
  void startFixtureServer(port).catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
}
