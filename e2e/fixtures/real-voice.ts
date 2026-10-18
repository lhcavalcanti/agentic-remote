import { execFile } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { promisify } from 'node:util'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../server/app'
import type { EnabledOracleVoiceConfig } from '../../server/oracle-voice-config'
import type {
  VoiceEngineEvent,
  VoiceEngineFactory,
  VoiceEngineSession,
  VoiceGenerationIdentity,
  VoiceSttEngine,
  VoiceTtsEngine,
} from '../../server/oracle-voice-engine'
import { ChildVoiceEngine } from '../../server/oracle-voice-worker'
import type { VoiceBackendCapability } from '../../shared/contracts'
import {
  BrowserTestSessionService,
  FakeManager,
} from './fake-voice'

interface GenerationMetrics {
  sttStartedAt?: number
  speechEndedAt?: number
  sttSamples: number
  ttsStartedAt?: number
  ttsSamples: number
  ttsSampleRate?: number
}

interface RealMetrics {
  firstPartialMs?: number
  finalAfterSpeechMs?: number
  sttRtf?: number
  ttsFirstAudioMs?: number
  ttsRtf?: number
  peakRssMiB?: number
  sustainedCpuPercent?: number
  cancellationGeneration?: number
  audioAfterCancellation: number
  generations: Record<string, {
    audioFrames: number
    audioEndEvents: number
    audioAfterCancellation: number
    cancelled: boolean
  }>
  fatalError?: string
}

interface WorkerProcessSample {
  cpuTicks: number
  rssMiB: number
}

const execFileAsync = promisify(execFile)

class InstrumentedRealEngine implements VoiceEngineFactory {
  private readonly child = new ChildVoiceEngine({
    startupTimeoutMs: 120_000,
    operationTimeoutMs: 120_000,
  })
  private readonly generations = new Map<number, GenerationMetrics>()
  private readonly cancelledAt = new Map<number, number>()
  private session: VoiceEngineSession | undefined
  private rssTimer: ReturnType<typeof setInterval> | undefined
  private cpuStartTicks: number | undefined
  private cpuStartedAt: number | undefined
  private ticksPerSecond = 100
  private readonly result: RealMetrics = {
    audioAfterCancellation: 0,
    generations: {},
  }

  async initialize(config: EnabledOracleVoiceConfig): Promise<VoiceEngineSession> {
    if (this.session) return this.session
    const childSession = await this.child.initialize(config)
    childSession.onEvent((event) => this.observeEvent(event))
    await this.armProcessSampler()
    const stt: VoiceSttEngine = {
      start: async (input) => {
        this.generations.set(input.generation, {
          sttStartedAt: performance.now(),
          sttSamples: 0,
          ttsSamples: 0,
        })
        await childSession.stt.start(input)
      },
      accept: async (frame) => {
        this.generation(frame.generation).sttSamples += frame.samples.length
        await childSession.stt.accept(frame)
      },
      end: async (input) => {
        this.generation(input.generation).speechEndedAt = performance.now()
        await childSession.stt.end(input)
      },
      cancel: async (input) => {
        this.recordCancellation(input)
        await childSession.stt.cancel(input)
      },
      close: () => childSession.stt.close(),
    }
    const tts: VoiceTtsEngine = {
      synthesize: async (input) => {
        const generation = this.generation(input.generation)
        generation.ttsStartedAt = performance.now()
        generation.ttsSamples = 0
        await childSession.tts.synthesize(input)
      },
      cancel: async (input) => {
        this.recordCancellation(input)
        await childSession.tts.cancel(input)
      },
      close: () => childSession.tts.close(),
    }
    this.session = {
      stt,
      tts,
      onEvent: (listener) => childSession.onEvent(listener),
      cancelGeneration: async (input) => {
        this.recordCancellation(input)
        await childSession.cancelGeneration(input)
      },
      close: () => childSession.close(),
    }
    return this.session
  }

  capability(): VoiceBackendCapability {
    return this.child.capability()
  }

  async stop(): Promise<void> {
    if (this.rssTimer) clearInterval(this.rssTimer)
    this.rssTimer = undefined
    await this.child.stop()
  }

  workerPid(): number | undefined {
    return this.child.workerPid()
  }

  metrics(): RealMetrics {
    return {
      ...this.result,
      generations: Object.fromEntries(
        Object.entries(this.result.generations).map(([generation, value]) => [
          generation,
          { ...value },
        ]),
      ),
    }
  }

  resetMetrics(): void {
    this.generations.clear()
    this.cancelledAt.clear()
    this.cpuStartTicks = undefined
    this.cpuStartedAt = undefined
    for (const key of Object.keys(this.result) as Array<keyof RealMetrics>) {
      delete this.result[key]
    }
    this.result.audioAfterCancellation = 0
    this.result.generations = {}
  }

  private observeEvent(event: VoiceEngineEvent): void {
    if (event.type === 'fatal_error') {
      this.result.fatalError = event.message
      return
    }
    if (!('generation' in event)) return
    const now = performance.now()
    const generation = this.generation(event.generation)
    if (event.type === 'partial' && generation.sttStartedAt !== undefined) {
      this.result.firstPartialMs ??= now - generation.sttStartedAt
    } else if (event.type === 'final' && generation.sttStartedAt !== undefined) {
      const audioDurationMs = generation.sttSamples / 16_000 * 1_000
      this.result.sttRtf ??= audioDurationMs > 0
        ? (now - generation.sttStartedAt) / audioDurationMs
        : undefined
      this.result.finalAfterSpeechMs ??= generation.speechEndedAt === undefined
        ? 0
        : Math.max(0, now - generation.speechEndedAt)
    } else if (event.type === 'audio') {
      const observation = this.generationObservation(event.generation)
      observation.audioFrames += 1
      const cancellation = this.cancelledAt.get(event.generation)
      if (cancellation !== undefined && now >= cancellation) {
        this.result.audioAfterCancellation += 1
        observation.audioAfterCancellation += 1
      }
      generation.ttsSamples += event.samples.length
      generation.ttsSampleRate = event.sampleRate
      if (generation.ttsStartedAt !== undefined) {
        this.result.ttsFirstAudioMs ??= now - generation.ttsStartedAt
      }
    } else if (
      event.type === 'audio_end'
      && generation.ttsStartedAt !== undefined
      && generation.ttsSampleRate
    ) {
      this.generationObservation(event.generation).audioEndEvents += 1
      const audioDurationMs = generation.ttsSamples / generation.ttsSampleRate * 1_000
      this.result.ttsRtf ??= audioDurationMs > 0
        ? (now - generation.ttsStartedAt) / audioDurationMs
        : undefined
    }
  }

  private recordCancellation(input: VoiceGenerationIdentity): void {
    this.cancelledAt.set(input.generation, performance.now())
    this.result.cancellationGeneration = input.generation
    this.generationObservation(input.generation).cancelled = true
  }

  private generation(id: number): GenerationMetrics {
    const existing = this.generations.get(id)
    if (existing) return existing
    const created: GenerationMetrics = { sttSamples: 0, ttsSamples: 0 }
    this.generations.set(id, created)
    return created
  }

  private generationObservation(generation: number) {
    const key = String(generation)
    return this.result.generations[key] ??= {
      audioFrames: 0,
      audioEndEvents: 0,
      audioAfterCancellation: 0,
      cancelled: false,
    }
  }

  private async armProcessSampler(): Promise<void> {
    if (this.rssTimer) return
    this.ticksPerSecond = await clockTicksPerSecond()
    const sample = async () => {
      const pid = this.child.workerPid()
      if (!pid) return
      const processSample = await readWorkerProcessSample(pid)
      if (!processSample) return
      this.result.peakRssMiB = Math.max(
        this.result.peakRssMiB ?? 0,
        processSample.rssMiB,
      )
      const now = performance.now()
      if (this.cpuStartTicks === undefined || this.cpuStartedAt === undefined) {
        this.cpuStartTicks = processSample.cpuTicks
        this.cpuStartedAt = now
        return
      }
      const wallSeconds = Math.max((now - this.cpuStartedAt) / 1_000, 0.001)
      this.result.sustainedCpuPercent = (
        processSample.cpuTicks - this.cpuStartTicks
      ) / this.ticksPerSecond / wallSeconds * 100
    }
    await sample()
    this.rssTimer = setInterval(() => void sample(), 20)
    this.rssTimer.unref?.()
  }
}

async function startServer(port: number): Promise<void> {
  const root = path.resolve('test-results/oracle-conversation-real-e2e-server')
  await rm(root, { recursive: true, force: true })
  const manager = new FakeManager()
  const service = new BrowserTestSessionService()
  const engine = new InstrumentedRealEngine()
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
    voiceEngineFactory: engine,
  })
  registerControlRoutes(built.app, manager, engine)
  await built.app.listen({ host: '127.0.0.1', port })

  const close = async () => {
    await built.app.close()
    await rm(root, { recursive: true, force: true })
    process.exit(0)
  }
  process.once('SIGINT', () => void close())
  process.once('SIGTERM', () => void close())
}

function registerControlRoutes(
  app: FastifyInstance,
  manager: FakeManager,
  engine: InstrumentedRealEngine,
): void {
  app.post<{ Body: { content: string } }>(
    '/__e2e/manager/delta',
    async (request) => {
      manager.delta(request.body.content)
      return { ok: true }
    },
  )
  app.post<{ Body: { content: string } }>(
    '/__e2e/manager/finish',
    async (request) => {
      manager.finish(request.body.content)
      return { ok: true }
    },
  )
  app.post('/__e2e/reset', async () => {
    manager.resetState()
    engine.resetMetrics()
    return { ok: true }
  })
  app.get('/__e2e/real-state', async () => {
    const pid = engine.workerPid()
    return {
      managerSends: [...manager.sends],
      managerCancellations: manager.cancellations,
      ...(pid === undefined ? {} : { workerPid: pid }),
      workerAlive: pid === undefined ? false : await processExists(pid),
      metrics: engine.metrics(),
    }
  })
}

async function clockTicksPerSecond(): Promise<number> {
  if (process.platform !== 'linux') return 100
  try {
    const { stdout } = await execFileAsync('getconf', ['CLK_TCK'])
    const ticks = Number(stdout.trim())
    return Number.isSafeInteger(ticks) && ticks > 0 ? ticks : 100
  } catch {
    return 100
  }
}

async function readWorkerProcessSample(
  pid: number,
): Promise<WorkerProcessSample | undefined> {
  try {
    const [statLine, status] = await Promise.all([
      readFile(`/proc/${pid}/stat`, 'utf8'),
      readFile(`/proc/${pid}/status`, 'utf8'),
    ])
    const afterCommand = statLine.slice(statLine.lastIndexOf(')') + 2)
      .trim()
      .split(/\s+/)
    const userTicks = Number(afterCommand[11])
    const systemTicks = Number(afterCommand[12])
    const rssMatch = /^VmRSS:\s+(\d+)\s+kB$/m.exec(status)
    if (!Number.isFinite(userTicks) || !Number.isFinite(systemTicks) || !rssMatch) {
      return undefined
    }
    return {
      cpuTicks: userTicks + systemTicks,
      rssMiB: Number(rssMatch[1]) / 1_024,
    }
  } catch {
    return undefined
  }
}

async function processExists(pid: number): Promise<boolean> {
  try {
    await readFile(`/proc/${pid}/stat`, 'utf8')
    return true
  } catch {
    return false
  }
}

if (process.argv.includes('--serve')) {
  const portIndex = process.argv.indexOf('--port')
  const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 4396
  void startServer(port).catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
}
