import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import type { ForkOptions } from 'node:child_process'
import { describe, expect, it, vi } from 'vitest'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  voiceAudioFrameByteLength,
  type VoiceAudioFrame,
  type VoiceClientControl,
} from '../shared/oracle-voice.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import type {
  VoiceEngineEvent,
  VoiceEngineSession,
} from './oracle-voice-engine.js'
import {
  createVoiceBackendSession,
  type VoiceBackendOutput,
} from './oracle-voice-session.js'
import type {
  VoiceWorkerChildMessage,
  VoiceWorkerParentMessage,
} from './oracle-voice-worker-protocol.js'
import {
  createVoiceWorker,
  type PiperProcess,
} from './oracle-voice-child.js'
import {
  ChildVoiceEngine,
  type ChildVoiceEngineDependencies,
} from './oracle-voice-worker.js'

const config: EnabledOracleVoiceConfig = {
  enabled: true,
  language: 'en',
  threads: 2,
  endpointMs: 800,
  stt: {
    profile: 'nemotron',
    modelDirectory: '/models/stt',
  },
  tts: {
    binary: '/opt/piper/piper',
    model: '/models/en_US-lessac-medium.onnx',
    config: '/models/en_US-lessac-medium.onnx.json',
    sampleRate: 22_050,
  },
}

function nativeTtsConfig(): EnabledOracleVoiceConfig {
  return {
    ...config,
    tts: {
      engine: 'sherpa-vits',
      model: '/models/ljspeech/model.onnx',
      config: '/models/ljspeech/model.onnx.json',
      tokens: '/models/ljspeech/tokens.txt',
      dataDir: '/models/ljspeech/espeak-ng-data',
      sampleRate: 22_050,
      speaker: 2,
    },
  }
}

function patternedSamples(length: number, offset: number): Float32Array {
  const pattern = [-1, -0.5, 0, 0.5, 1] as const
  return Float32Array.from(
    { length },
    (_, index) => pattern[(offset + index) % pattern.length],
  )
}

function float32ToExpectedPcm(samples: ArrayLike<number>): Int16Array {
  return Int16Array.from(
    { length: samples.length },
    (_, index) => samples[index] < 0
      ? Math.round(samples[index] * 32_768)
      : Math.round(samples[index] * 32_767),
  )
}

function joinPcm(chunks: Int16Array[]): Int16Array {
  const output = new Int16Array(
    chunks.reduce((total, chunk) => total + chunk.length, 0),
  )
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

function joinFloat32(chunks: Float32Array[]): Float32Array {
  const output = new Float32Array(
    chunks.reduce((total, chunk) => total + chunk.length, 0),
  )
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

function backendControl(
  type: VoiceClientControl['type'],
  generation: number,
  extra: Record<string, unknown> = {},
): VoiceClientControl {
  return {
    type,
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId: 'backend-stream',
    generation,
    ...extra,
  } as VoiceClientControl
}

class FakeChildProcess extends EventEmitter {
  readonly sent: VoiceWorkerParentMessage[] = []
  readonly signals: NodeJS.Signals[] = []
  connected = true
  pid = 41_042

  send(
    message: VoiceWorkerParentMessage,
    callback?: (error: Error | null) => void,
  ): boolean {
    this.sent.push(message)
    callback?.(null)
    return true
  }

  kill(signal: NodeJS.Signals): boolean {
    this.signals.push(signal)
    return true
  }

  disconnect(): void {
    this.connected = false
  }

  respond(request: VoiceWorkerParentMessage = this.sent.at(-1)!): void {
    this.emit('message', {
      type: 'response',
      requestId: request.requestId,
    } satisfies VoiceWorkerChildMessage)
  }

  fail(request: VoiceWorkerParentMessage, message: string): void {
    this.emit('message', {
      type: 'response_error',
      requestId: request.requestId,
      message,
    } satisfies VoiceWorkerChildMessage)
  }

  emitEvent(event: VoiceEngineEvent): void {
    this.emit('message', {
      type: 'event',
      event,
    } satisfies VoiceWorkerChildMessage)
  }
}

class InProcessVoiceChild extends FakeChildProcess {
  handleMessage: ((message: VoiceWorkerParentMessage) => Promise<void>) | undefined

  override send(
    message: VoiceWorkerParentMessage,
    callback?: (error: Error | null) => void,
  ): boolean {
    this.sent.push(message)
    callback?.(null)
    const handling = this.handleMessage?.(message)
    if (!handling) return true
    void handling.then(() => {
      if (message.type !== 'close' || !this.connected) return
      this.connected = false
      this.emit('exit', 0, null)
    })
    return true
  }
}

function parentHarness(
  overrides: Partial<ChildVoiceEngineDependencies> = {},
): {
  child: FakeChildProcess
  engine: ChildVoiceEngine
  forkCalls: Array<{ entry: string; options: ForkOptions }>
} {
  const child = new FakeChildProcess()
  const forkCalls: Array<{ entry: string; options: ForkOptions }> = []
  const engine = new ChildVoiceEngine({
    fork: (entry, options) => {
      forkCalls.push({ entry, options })
      return child
    },
    startupTimeoutMs: 100,
    operationTimeoutMs: 200,
    heartbeatTimeoutMs: 300,
    closeRequestTimeoutMs: 20,
    shutdownTimeoutMs: 10,
    maxPendingRequests: 8,
    ...overrides,
  })
  return { child, engine, forkCalls }
}

async function initialize(
  engine: ChildVoiceEngine,
  child: FakeChildProcess,
): Promise<VoiceEngineSession> {
  const initializing = engine.initialize(config)
  const request = child.sent.at(-1)
  expect(request?.type).toBe('initialize')
  child.emitEvent({ type: 'ready' })
  child.respond(request)
  return initializing
}

describe('ChildVoiceEngine parent supervision', () => {
  it('forks the explicit worker entry with advanced IPC and a minimal environment', async () => {
    const { child, engine, forkCalls } = parentHarness()
    const session = await initialize(engine, child)

    expect(forkCalls).toHaveLength(1)
    expect(forkCalls[0].entry).toMatch(/oracle-voice-child\.ts$/)
    expect(forkCalls[0].options).toMatchObject({
      serialization: 'advanced',
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    })
    expect(forkCalls[0].options.env).not.toBe(process.env)
    expect(forkCalls[0].options.env).not.toHaveProperty('GITHUB_TOKEN')
    expect(forkCalls[0].options.env).not.toHaveProperty('COPILOT_GITHUB_TOKEN')
    expect(engine.capability()).toMatchObject({
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
    })

    const closing = session.close()
    child.respond(child.sent.at(-1))
    child.emit('exit', 0, null)
    await closing
  })

  it('surfaces worker exit and rejects pending initialization', async () => {
    const { child, engine } = parentHarness()
    const ready = engine.initialize(config)

    child.emit('exit', 139, null)

    await expect(ready).rejects.toThrow('voice worker exited')
    expect(engine.capability()).toEqual({
      available: false,
      reason: expect.stringContaining('voice worker exited'),
    })
  })

  interface FakeSherpaStream {
    accepted: Array<{ samples: Float32Array; sampleRate: number }>
    finished: number
    options: Map<string, string>
    pendingDecodes: number
    reset: number
    text: string
  }

  function fakeSherpa(
    outputs: string[] = [],
    endpointAfterDecode = Number.POSITIVE_INFINITY,
    ttsGate?: Promise<void>,
    ttsProgressSamples: Float32Array[] = [Float32Array.of(-1, 0, 0.5, 1)],
    ttsResultSamples: Float32Array = ttsProgressSamples.length > 0
      ? ttsProgressSamples.at(-1)!
      : Float32Array.of(-1, 0, 0.5, 1),
  ): {
    module: {
      OnlineRecognizer: new (recognizerConfig: object) => object
      OfflineTts: {
        createAsync: (config: object) => Promise<{
          sampleRate: number
          generateAsync: (request: {
            text: string
            sid: number
            speed: number
            onProgress?: (chunk: { samples: Float32Array }) => boolean | number | void
          }) => Promise<{ samples: Float32Array; sampleRate: number }>
        }>
      }
    }
    recognizers: Array<{
      config: object
      streams: FakeSherpaStream[]
      decodeCount: number
    }>
    ttsConfigs: object[]
    ttsRequests: Array<{
      text: string
      sid: number
      speed: number
    }>
  } {
    const recognizers: Array<{
      config: object
      streams: FakeSherpaStream[]
      decodeCount: number
    }> = []
    const ttsConfigs: object[] = []
    const ttsRequests: Array<{
      text: string
      sid: number
      speed: number
    }> = []
    class OnlineRecognizer {
      readonly streams: FakeSherpaStream[] = []
      decodeCount = 0

      constructor(readonly config: object) {
        recognizers.push(this)
      }

      createStream(): FakeSherpaStream {
        const stream: FakeSherpaStream = {
          accepted: [],
          finished: 0,
          options: new Map(),
          pendingDecodes: 0,
          reset: 0,
          text: '',
        }
        Object.assign(stream, {
          acceptWaveform: (input: { samples: Float32Array; sampleRate: number }) => {
            stream.accepted.push(input)
            stream.pendingDecodes += 1
          },
          inputFinished: () => {
            stream.finished += 1
          },
          setOption: (key: string, value: string) => {
            stream.options.set(key, value)
          },
        })
        this.streams.push(stream)
        return stream
      }

      isReady(stream: FakeSherpaStream): boolean {
        return stream.pendingDecodes > 0
      }

      decode(stream: FakeSherpaStream): void {
        stream.pendingDecodes -= 1
        stream.text = outputs.shift() ?? stream.text
        this.decodeCount += 1
      }

      isEndpoint(): boolean {
        return this.decodeCount >= endpointAfterDecode
      }

      getResult(stream: FakeSherpaStream): { text: string } {
        return { text: stream.text }
      }

      reset(stream: FakeSherpaStream): void {
        stream.reset += 1
      }
    }
    const OfflineTts = {
      createAsync: async (ttsConfig: object) => {
        ttsConfigs.push(ttsConfig)
        return {
          sampleRate: 22_050,
          generateAsync: async (request: {
            text: string
            sid: number
            speed: number
            onProgress?: (chunk: { samples: Float32Array }) => boolean | number | void
          }) => {
            ttsRequests.push({
              text: request.text,
              sid: request.sid,
              speed: request.speed,
            })
            for (const samples of ttsProgressSamples) {
              if (request.onProgress?.({ samples }) === false) break
            }
            await ttsGate
            return { samples: ttsResultSamples, sampleRate: 22_050 }
          },
        }
      },
    }
    return {
      module: { OnlineRecognizer, OfflineTts },
      recognizers,
      ttsConfigs,
      ttsRequests,
    }
  }

  class FakePiperProcess extends EventEmitter implements PiperProcess {
    readonly stdin = new PassThrough()
    readonly stdout = new PassThrough()
    readonly stderr = new PassThrough()
    readonly signals: NodeJS.Signals[] = []
    readonly input: Buffer[] = []
    readonly pid = 52_052
    private exited = false

    constructor(private readonly exitOnKill = true) {
      super()
      this.stdin.on('data', (chunk: Buffer) => this.input.push(Buffer.from(chunk)))
    }

    kill(signal: NodeJS.Signals): boolean {
      this.signals.push(signal)
      if (this.exitOnKill) this.finish(null, signal)
      return true
    }

    finish(
      code: number | null = 0,
      signal: NodeJS.Signals | null = null,
    ): void {
      if (this.exited) return
      this.exited = true
      this.stdout.end()
      this.stderr.end()
      this.emit('exit', code, signal)
    }

    inputText(): string {
      return Buffer.concat(this.input).toString('utf8')
    }
  }

  function childHarness(options: {
    outputs?: string[]
    endpointAfterDecode?: number
    maxUtteranceSamples?: number
    send?: (message: VoiceWorkerChildMessage) => Promise<void>
    now?: () => number
    heartbeatIntervalMs?: number
    piperExitOnKill?: boolean
    piperShutdownTimeoutMs?: number
    maxCancellationStreams?: number
    workerConfig?: EnabledOracleVoiceConfig
    ttsGate?: Promise<void>
    ttsProgressSamples?: Float32Array[]
    ttsResultSamples?: Float32Array
  } = {}): {
    worker: ReturnType<typeof createVoiceWorker>
    messages: VoiceWorkerChildMessage[]
    sherpa: ReturnType<typeof fakeSherpa>
    pipers: FakePiperProcess[]
    spawnCalls: Array<{ binary: string; args: string[] }>
    workerConfig: EnabledOracleVoiceConfig
  } {
    const messages: VoiceWorkerChildMessage[] = []
    const sherpa = fakeSherpa(
      options.outputs,
      options.endpointAfterDecode,
      options.ttsGate,
      options.ttsProgressSamples,
      options.ttsResultSamples,
    )
    const pipers: FakePiperProcess[] = []
    const spawnCalls: Array<{ binary: string; args: string[] }> = []
    const workerConfig = options.workerConfig ?? config
    const worker = createVoiceWorker({
      sherpa: sherpa.module,
      spawnPiper: (binary, args) => {
        spawnCalls.push({ binary, args })
        const piper = new FakePiperProcess(options.piperExitOnKill)
        pipers.push(piper)
        return piper
      },
      send: async (message) => {
        messages.push(message)
        await options.send?.(message)
      },
      now: options.now ?? (() => 123),
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? 0,
      piperShutdownTimeoutMs: options.piperShutdownTimeoutMs ?? 10,
      ...(options.maxCancellationStreams === undefined
        ? {}
        : { maxCancellationStreams: options.maxCancellationStreams }),
      ...(options.maxUtteranceSamples === undefined
        ? {}
        : { maxUtteranceSamples: options.maxUtteranceSamples }),
    })
    return {
      worker,
      messages,
      sherpa,
      pipers,
      spawnCalls,
      workerConfig,
    }
  }

  async function initializeWorker(
    harness: ReturnType<typeof childHarness>,
  ): Promise<void> {
    await harness.worker.handle({
      type: 'initialize',
      requestId: 'initialize',
      config: harness.workerConfig,
    })
  }

  function workerEvents(
    messages: VoiceWorkerChildMessage[],
  ): VoiceEngineEvent[] {
    return messages.flatMap((message) =>
      message.type === 'event' ? [message.event] : [])
  }

  describe('resident sherpa STT worker', () => {
    it('selects the validated Zipformer profile files and feature dimension', async () => {
      const harness = childHarness({
        workerConfig: {
          ...config,
          stt: {
            profile: 'zipformer',
            modelDirectory: '/models/zipformer',
          },
        },
      })

      await initializeWorker(harness)

      expect(harness.sherpa.recognizers[0].config).toMatchObject({
        featConfig: {
          featureDim: 80,
        },
        modelConfig: {
          transducer: {
            encoder: '/models/zipformer/encoder-epoch-99-avg-1.int8.onnx',
            decoder: '/models/zipformer/decoder-epoch-99-avg-1.onnx',
            joiner: '/models/zipformer/joiner-epoch-99-avg-1.int8.onnx',
          },
        },
      })
    })

    it('constructs one recognizer, pins language, and emits changed partials plus one final', async () => {
      const harness = childHarness({ outputs: ['hel', 'hello'] })
      await initializeWorker(harness)
      await harness.worker.handle({
        type: 'stt_start',
        requestId: 'start',
        input: {
          streamId: 'stream-1',
          generation: 1,
          utteranceId: 'utterance-1',
          language: 'pt-BR',
        },
      })
      await harness.worker.handle({
        type: 'stt_audio',
        requestId: 'audio-1',
        frame: {
          direction: 'microphone',
          streamId: 'stream-1',
          generation: 1,
          utteranceId: 'utterance-1',
          sequence: 0,
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          samples: Int16Array.of(-32_768, 0, 32_767),
        },
      })
      await harness.worker.handle({
        type: 'stt_audio',
        requestId: 'audio-2',
        frame: {
          direction: 'microphone',
          streamId: 'stream-1',
          generation: 1,
          utteranceId: 'utterance-1',
          sequence: 1,
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          samples: Int16Array.of(1, 2),
        },
      })
      await harness.worker.handle({
        type: 'stt_end',
        requestId: 'end',
        input: {
          streamId: 'stream-1',
          generation: 1,
          utteranceId: 'utterance-1',
        },
      })

      expect(harness.sherpa.recognizers).toHaveLength(1)
      expect(harness.sherpa.recognizers[0].config).toMatchObject({
        featConfig: {
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          featureDim: 128,
        },
        modelConfig: {
          transducer: {
            encoder: '/models/stt/encoder.int8.onnx',
            decoder: '/models/stt/decoder.int8.onnx',
            joiner: '/models/stt/joiner.int8.onnx',
          },
          tokens: '/models/stt/tokens.txt',
          numThreads: 2,
          provider: 'cpu',
          debug: 0,
        },
        enableEndpoint: true,
        rule2MinTrailingSilence: 0.8,
      })
      const stream = harness.sherpa.recognizers[0].streams[0]
      expect(stream.options.get('language')).toBe('pt-BR')
      expect(stream.accepted[0]).toEqual({
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        samples: Float32Array.of(-1, 0, 32_767 / 32_768),
      })
      expect(stream.accepted.at(-1)?.samples).toHaveLength(12_800)
      expect(stream.finished).toBe(1)
      expect(stream.reset).toBe(1)
      expect(workerEvents(harness.messages)
        .flatMap((event) => event.type === 'partial' ? [event.text] : []))
        .toEqual(['hel', 'hello'])
      expect(workerEvents(harness.messages)
        .filter((event) => event.type === 'final')).toEqual([{
        type: 'final',
        streamId: 'stream-1',
        generation: 1,
        utteranceId: 'utterance-1',
        text: 'hello',
      }])
    })

    it('finalizes at a recognizer endpoint without duplicating final on speech end', async () => {
      const harness = childHarness({
        outputs: ['endpoint text'],
        endpointAfterDecode: 1,
      })
      await initializeWorker(harness)
      await harness.worker.handle({
        type: 'stt_start',
        requestId: 'start',
        input: {
          streamId: 'stream-2',
          generation: 2,
          utteranceId: 'utterance-2',
          language: 'en',
        },
      })
      await harness.worker.handle({
        type: 'stt_audio',
        requestId: 'audio',
        frame: {
          direction: 'microphone',
          streamId: 'stream-2',
          generation: 2,
          utteranceId: 'utterance-2',
          sequence: 0,
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          samples: Int16Array.of(1),
        },
      })
      await harness.worker.handle({
        type: 'stt_end',
        requestId: 'end',
        input: {
          streamId: 'stream-2',
          generation: 2,
          utteranceId: 'utterance-2',
        },
      })

      expect(workerEvents(harness.messages)
        .filter((event) => event.type === 'final')).toHaveLength(1)
    })

    it('rejects audio beyond the maximum utterance without feeding it to sherpa', async () => {
      const harness = childHarness({ maxUtteranceSamples: 3 })
      await initializeWorker(harness)
      await harness.worker.handle({
        type: 'stt_start',
        requestId: 'start',
        input: {
          streamId: 'stream-3',
          generation: 3,
          utteranceId: 'utterance-3',
          language: 'en',
        },
      })
      await harness.worker.handle({
        type: 'stt_audio',
        requestId: 'too-long',
        frame: {
          direction: 'microphone',
          streamId: 'stream-3',
          generation: 3,
          utteranceId: 'utterance-3',
          sequence: 0,
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          samples: Int16Array.of(1, 2, 3, 4),
        },
      })

      expect(harness.messages.at(-1)).toEqual({
        type: 'response_error',
        requestId: 'too-long',
        message: expect.stringContaining('maximum duration'),
      })
      expect(harness.sherpa.recognizers[0].streams[0].accepted).toEqual([])
    })

    it('cancels STT generations without emitting a stale final', async () => {
      const harness = childHarness({ outputs: ['late final'] })
      await initializeWorker(harness)
      await harness.worker.handle({
        type: 'stt_start',
        requestId: 'start',
        input: {
          streamId: 'stream-4',
          generation: 4,
          utteranceId: 'utterance-4',
          language: 'en',
        },
      })
      await harness.worker.handle({
        type: 'stt_cancel',
        requestId: 'cancel',
        streamId: 'stream-4',
        generation: 4,
      })
      await harness.worker.handle({
        type: 'stt_end',
        requestId: 'end',
        input: {
          streamId: 'stream-4',
          generation: 4,
          utteranceId: 'utterance-4',
        },
      })

      expect(workerEvents(harness.messages)
        .filter((event) => event.type === 'final')).toEqual([])
    })

    it('fails closed at the cancellation stream limit without forgetting prior streams', async () => {
      const harness = childHarness({ maxCancellationStreams: 2 })
      await initializeWorker(harness)
      for (const [streamId, requestId] of [
        ['stream-a', 'cancel-a'],
        ['stream-b', 'cancel-b'],
        ['stream-c', 'cancel-c'],
      ] as const) {
        await harness.worker.handle({
          type: 'stt_cancel',
          requestId,
          streamId,
          generation: 1,
        })
      }

      expect(harness.messages).toContainEqual({
        type: 'response_error',
        requestId: 'cancel-c',
        message: expect.stringContaining('cancellation stream limit'),
      })
      await harness.worker.handle({
        type: 'stt_start',
        requestId: 'stale-a',
        input: {
          streamId: 'stream-a',
          generation: 1,
          utteranceId: 'stale-a',
          language: 'en',
        },
      })
      expect(harness.messages.at(-1)).toEqual({
        type: 'response_error',
        requestId: 'stale-a',
        message: expect.stringContaining('closed'),
      })
      expect(workerEvents(harness.messages)
        .filter((event) => 'generation' in event)).toEqual([])
    })

    it('rejects delayed same-generation audio from an older stream and utterance', async () => {
      const harness = childHarness()
      await initializeWorker(harness)
      await harness.worker.handle({
        type: 'stt_start',
        requestId: 'old-start',
        input: {
          streamId: 'old-stream',
          generation: 5,
          utteranceId: 'old-utterance',
          language: 'en',
        },
      })
      await harness.worker.handle({
        type: 'stt_end',
        requestId: 'old-end',
        input: {
          streamId: 'old-stream',
          generation: 5,
          utteranceId: 'old-utterance',
        },
      })
      await harness.worker.handle({
        type: 'stt_start',
        requestId: 'new-start',
        input: {
          streamId: 'new-stream',
          generation: 5,
          utteranceId: 'new-utterance',
          language: 'en',
        },
      })
      await harness.worker.handle({
        type: 'stt_audio',
        requestId: 'late-audio',
        frame: {
          direction: 'microphone',
          streamId: 'old-stream',
          generation: 5,
          utteranceId: 'old-utterance',
          sequence: 0,
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          samples: Int16Array.of(1, 2),
        },
      })

      expect(harness.messages.at(-1)).toEqual({
        type: 'response_error',
        requestId: 'late-audio',
        message: expect.stringContaining('identity'),
      })
      expect(harness.sherpa.recognizers[0].streams[1].accepted).toEqual([])
    })
  })

  describe('Piper TTS worker', () => {
    it('keeps a sherpa VITS voice resident and streams bounded PCM without spawning Piper', async () => {
      const harness = childHarness({
        workerConfig: {
          ...config,
          tts: {
            engine: 'sherpa-vits',
            model: '/models/ljspeech/model.onnx',
            config: '/models/ljspeech/model.onnx.json',
            tokens: '/models/ljspeech/tokens.txt',
            dataDir: '/models/ljspeech/espeak-ng-data',
            sampleRate: 22_050,
            speaker: 2,
          },
        },
      })
      await initializeWorker(harness)

      await harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'native-synthesize',
        input: {
          streamId: 'native-stream',
          generation: 3,
          segmentId: 'native-segment',
          text: 'Verified LJSpeech smoke.',
        },
      })

      expect(harness.spawnCalls).toEqual([])
      expect(harness.sherpa.ttsConfigs).toEqual([{
        model: {
          vits: {
            model: '/models/ljspeech/model.onnx',
            tokens: '/models/ljspeech/tokens.txt',
            dataDir: '/models/ljspeech/espeak-ng-data',
          },
        },
        maxNumSentences: 1,
        numThreads: config.threads,
        provider: 'cpu',
      }])
      expect(harness.sherpa.ttsRequests).toEqual([{
        text: 'Verified LJSpeech smoke.',
        sid: 2,
        speed: 1,
      }])
      const events = workerEvents(harness.messages)
      expect(events.filter((event) => event.type === 'audio'), JSON.stringify(harness.messages))
        .toEqual([
        expect.objectContaining({
          streamId: 'native-stream',
          generation: 3,
          segmentId: 'native-segment',
          sequence: 0,
          sampleRate: 22_050,
          samples: Int16Array.of(-32_768, 0, 16_384, 32_767),
        }),
      ])
      expect(events.at(-1)).toEqual({
        type: 'audio_end',
        streamId: 'native-stream',
        generation: 3,
        segmentId: 'native-segment',
      })
    })

    it('splits multi-second sherpa VITS callbacks into ordered protocol-safe PCM frames', async () => {
      const first = patternedSamples(22_050 * 2 + 137, 0)
      const second = patternedSamples(22_050 * 2 + 251, first.length)
      const harness = childHarness({
        ttsProgressSamples: [first, second],
        workerConfig: nativeTtsConfig(),
      })
      await initializeWorker(harness)

      await harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'native-multi-callback',
        input: {
          streamId: 'native-stream',
          generation: 13,
          segmentId: 'native-segment',
          text: 'Several seconds of callback audio.',
        },
      })

      const audio = workerEvents(harness.messages)
        .filter((event) => event.type === 'audio')
      expect(audio.length).toBeGreaterThan(2)
      expect(audio.map((event) => event.sequence))
        .toEqual(audio.map((_, index) => index))
      expect(audio.every((event) => voiceAudioFrameByteLength({
        direction: 'playback',
        generation: event.generation,
        segmentId: event.segmentId,
        sequence: event.sequence,
        sampleRate: event.sampleRate,
        samples: event.samples,
      }) <= 32 * 1024)).toBe(true)
      expect(joinPcm(audio.map((event) => event.samples)))
        .toEqual(float32ToExpectedPcm(joinFloat32([first, second])))
      expect(workerEvents(harness.messages).at(-1)?.type).toBe('audio_end')
    })

    it('splits a multi-second sherpa VITS fallback result when progress emits no audio', async () => {
      const samples = patternedSamples(22_050 * 3 + 503, 0)
      const harness = childHarness({
        ttsProgressSamples: [],
        ttsResultSamples: samples,
        workerConfig: nativeTtsConfig(),
      })
      await initializeWorker(harness)

      await harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'native-fallback',
        input: {
          streamId: 'native-stream',
          generation: 14,
          segmentId: 'native-segment',
          text: 'Several seconds of fallback audio.',
        },
      })

      const audio = workerEvents(harness.messages)
        .filter((event) => event.type === 'audio')
      expect(audio.length).toBeGreaterThan(1)
      expect(audio.map((event) => event.sequence))
        .toEqual(audio.map((_, index) => index))
      expect(audio.every((event) => voiceAudioFrameByteLength({
        direction: 'playback',
        generation: event.generation,
        segmentId: event.segmentId,
        sequence: event.sequence,
        sampleRate: event.sampleRate,
        samples: event.samples,
      }) <= 32 * 1024)).toBe(true)
      expect(joinPcm(audio.map((event) => event.samples)))
        .toEqual(float32ToExpectedPcm(samples))
      expect(workerEvents(harness.messages).at(-1)?.type).toBe('audio_end')
    })

    it('rejects a synchronous sherpa VITS callback above the playable segment limit before audio', async () => {
      const samples = patternedSamples(22_050 * 12 + 1, 0)
      const harness = childHarness({
        ttsProgressSamples: [samples],
        workerConfig: nativeTtsConfig(),
      })
      await initializeWorker(harness)

      await harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'native-overflow',
        input: {
          streamId: 'native-stream',
          generation: 15,
          segmentId: 'native-segment',
          text: 'Overflow safely.',
        },
      })

      expect(harness.messages).toContainEqual({
        type: 'response_error',
        requestId: 'native-overflow',
        message: expect.stringContaining('playable segment'),
      })
      expect(workerEvents(harness.messages).filter(
        (event) => event.type === 'audio' || event.type === 'audio_end',
      )).toEqual([])
    })

    it.each([
      ['LJSpeech', 176_469],
      ['Faber', 148_224],
    ])('streams measured %s VITS output through EngineVoiceBackendSession', async (
      voice,
      sampleCount,
    ) => {
      const samples = patternedSamples(sampleCount, 0)
      const child = new InProcessVoiceChild()
      const sherpa = fakeSherpa([], Number.POSITIVE_INFINITY, undefined, [samples])
      const worker = createVoiceWorker({
        sherpa: sherpa.module,
        spawnPiper: () => new FakePiperProcess(),
        send: async (message) => {
          child.emit('message', message)
        },
        heartbeatIntervalMs: 0,
      })
      child.handleMessage = (message) => worker.handle(message)
      const engine = new ChildVoiceEngine({
        fork: () => child,
        startupTimeoutMs: 100,
        operationTimeoutMs: 5_000,
        heartbeatTimeoutMs: 10_000,
        shutdownTimeoutMs: 10,
        maxPendingRequests: 8,
      })
      const engineSession = await engine.initialize(nativeTtsConfig())
      const sent: VoiceBackendOutput[] = []
      const backend = createVoiceBackendSession({
        streamId: 'backend-stream',
        engine: engineSession,
        limits: {
          maxFrameBytes: 32 * 1024,
          maxQueueBytes: 64_000,
          maxUtteranceMs: 30_000,
          idleTimeoutMs: 30_000,
        },
        send: async (output) => {
          sent.push(output)
        },
        terminate: () => undefined,
      })
      await backend.control(backendControl('start', 21, { language: 'en' }))
      await backend.control(backendControl('synthesize', 21, {
        segmentId: 'backend-segment',
        text: `Measured ${voice} resident audio.`,
      }))

      await vi.waitFor(() => {
        expect(sent.some((output) => 'type' in output && output.type === 'audio_end'))
          .toBe(true)
      })
      const frames = sent.filter(
        (output): output is VoiceAudioFrame => 'direction' in output,
      )
      expect(frames.length).toBeGreaterThan(1)
      expect(frames.every((frame) => voiceAudioFrameByteLength(frame) <= 32 * 1024))
        .toBe(true)
      expect(frames.map((frame) => frame.sequence))
        .toEqual(frames.map((_, index) => index))
      expect(joinPcm(frames.map((frame) => frame.samples)))
        .toEqual(float32ToExpectedPcm(samples))
      expect(sent.at(-1)).toMatchObject({
        type: 'audio_end',
        generation: 21,
        segmentId: 'backend-segment',
      })

      await backend.close('test complete')
    })

    it('waits for cancelled sherpa VITS generation before accepting another segment', async () => {
      let release!: () => void
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      const harness = childHarness({
        ttsGate: gate,
        workerConfig: {
          ...config,
          tts: {
            engine: 'sherpa-vits',
            model: '/models/ljspeech/model.onnx',
            config: '/models/ljspeech/model.onnx.json',
            tokens: '/models/ljspeech/tokens.txt',
            dataDir: '/models/ljspeech/espeak-ng-data',
            sampleRate: 22_050,
          },
        },
      })
      await initializeWorker(harness)
      const synthesis = harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'native-synthesis',
        input: {
          streamId: 'native-stream',
          generation: 4,
          segmentId: 'native-segment',
          text: 'Cancel this.',
        },
      })
      await new Promise((resolve) => setImmediate(resolve))
      let cancellationFinished = false
      const cancellation = harness.worker.handle({
        type: 'tts_cancel',
        requestId: 'native-cancel',
        streamId: 'native-stream',
        generation: 4,
      }).then(() => {
        cancellationFinished = true
      })

      await new Promise((resolve) => setImmediate(resolve))
      expect(cancellationFinished).toBe(false)
      release()
      await Promise.all([synthesis, cancellation])
      expect(workerEvents(harness.messages)
        .filter((event) => event.type === 'audio_end')).toEqual([])
    })

    it('frames one segment on stdin and emits even PCM16 chunks at the native rate', async () => {
      const piperConfig = config.tts
      if (!('binary' in piperConfig)) throw new Error('expected external Piper fixture')
      const harness = childHarness({
        workerConfig: {
          ...config,
          tts: {
            ...config.tts,
            speaker: 3,
          },
        },
      })
      await initializeWorker(harness)
      const synthesis = harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'synthesize',
        input: {
          streamId: 'stream-5',
          generation: 5,
          segmentId: 'segment-5',
          text: 'Hello there.',
        },
      })
      const piper = harness.pipers[0]

      expect(harness.spawnCalls).toEqual([{
        binary: piperConfig.binary,
        args: [
          '--model',
          piperConfig.model,
          '--config',
          piperConfig.config,
          '--output-raw',
          '--speaker',
          '3',
        ],
      }])
      expect(piper.inputText()).toBe('Hello there.\n')
      piper.stdout.write(Buffer.from([1]))
      await new Promise((resolve) => setImmediate(resolve))
      piper.stdout.write(Buffer.from([2, 3, 4]))
      piper.finish()
      await synthesis

      const audioEvents = workerEvents(harness.messages)
        .filter((event) => event.type === 'audio')
      expect(audioEvents.map((event) => ({
        streamId: event.streamId,
        generation: event.generation,
        segmentId: event.segmentId,
        sequence: event.sequence,
        sampleRate: event.sampleRate,
      }))).toEqual([{
        streamId: 'stream-5',
        generation: 5,
        segmentId: 'segment-5',
        sequence: 0,
        sampleRate: 22_050,
      }])
      expect(audioEvents.flatMap((event) => [...event.samples])).toEqual([513, 1_027])
      expect(workerEvents(harness.messages).at(-1)).toEqual({
        type: 'audio_end',
        streamId: 'stream-5',
        generation: 5,
        segmentId: 'segment-5',
      })
    })

    it('reports non-zero Piper exit with bounded stderr', async () => {
      const harness = childHarness()
      await initializeWorker(harness)
      const synthesis = harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'synthesize',
        input: {
          streamId: 'stream-6',
          generation: 6,
          segmentId: 'segment-6',
          text: 'Do not echo this text.',
        },
      })
      const piper = harness.pipers[0]
      piper.stderr.write('x'.repeat(8_192))
      piper.finish(7)
      await synthesis

      const failure = harness.messages.find((message) =>
        message.type === 'response_error' && message.requestId === 'synthesize')
      expect(failure).toMatchObject({
        type: 'response_error',
        requestId: 'synthesize',
        message: expect.stringContaining('Piper exited with code 7'),
      })
      if (failure?.type === 'response_error') {
        expect(failure.message.length).toBeLessThan(4_300)
      }
      expect(workerEvents(harness.messages)
        .filter((event) => event.type === 'audio_end')).toEqual([])
    })

    it('kills the exact active Piper child and suppresses stale audio on cancellation', async () => {
      const harness = childHarness()
      await initializeWorker(harness)
      const synthesis = harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'synthesize',
        input: {
          streamId: 'stream-7',
          generation: 7,
          segmentId: 'segment-7',
          text: 'Cancelled.',
        },
      })
      const piper = harness.pipers[0]
      await harness.worker.handle({
        type: 'tts_cancel',
        requestId: 'cancel',
        streamId: 'stream-7',
        generation: 7,
      })
      await synthesis

      expect(piper.pid).toBe(52_052)
      expect(piper.signals).toEqual(['SIGTERM'])
      expect(workerEvents(harness.messages)
        .filter((event) => 'generation' in event && event.generation === 7)).toEqual([])
    })

    it('does not let an old stream cancel same-generation synthesis', async () => {
      const harness = childHarness()
      await initializeWorker(harness)
      const synthesis = harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'synthesize',
        input: {
          streamId: 'new-stream',
          generation: 9,
          segmentId: 'new-segment',
          text: 'Still active.',
        },
      })
      const piper = harness.pipers[0]

      await harness.worker.handle({
        type: 'tts_cancel',
        requestId: 'stale-cancel',
        streamId: 'old-stream',
        generation: 9,
      })

      expect(piper.signals).toEqual([])
      piper.finish()
      await synthesis
      expect(workerEvents(harness.messages)).toContainEqual({
        type: 'audio_end',
        streamId: 'new-stream',
        generation: 9,
        segmentId: 'new-segment',
      })
    })

    it('escalates a stalled Piper cancellation from SIGTERM to SIGKILL', async () => {
      vi.useFakeTimers()
      try {
        const harness = childHarness({
          piperExitOnKill: false,
          piperShutdownTimeoutMs: 10,
        })
        await initializeWorker(harness)
        const synthesis = harness.worker.handle({
          type: 'tts_synthesize',
          requestId: 'synthesize',
          input: {
            streamId: 'cancel-stream',
            generation: 10,
            segmentId: 'cancel-segment',
            text: 'Cancel me.',
          },
        })
        const piper = harness.pipers[0]
        const cancellation = harness.worker.handle({
          type: 'tts_cancel',
          requestId: 'cancel',
          streamId: 'cancel-stream',
          generation: 10,
        })

        expect(piper.signals).toEqual(['SIGTERM'])
        await vi.advanceTimersByTimeAsync(11)
        expect(piper.signals).toEqual(['SIGTERM', 'SIGKILL'])
        piper.finish(null, 'SIGKILL')
        await cancellation
        await synthesis
      } finally {
        vi.useRealTimers()
      }
    })

    it('escalates a stalled Piper close from SIGTERM to SIGKILL', async () => {
      vi.useFakeTimers()
      try {
        const harness = childHarness({
          piperExitOnKill: false,
          piperShutdownTimeoutMs: 10,
        })
        await initializeWorker(harness)
        const synthesis = harness.worker.handle({
          type: 'tts_synthesize',
          requestId: 'synthesize',
          input: {
            streamId: 'close-stream',
            generation: 11,
            segmentId: 'close-segment',
            text: 'Close me.',
          },
        })
        const piper = harness.pipers[0]
        const closing = harness.worker.close()

        expect(piper.signals).toEqual(['SIGTERM'])
        await vi.advanceTimersByTimeAsync(11)
        expect(piper.signals).toEqual(['SIGTERM', 'SIGKILL'])
        piper.finish(null, 'SIGKILL')
        await closing
        await synthesis
      } finally {
        vi.useRealTimers()
      }
    })

    it.each(['send', 'stream'] as const)(
      'terminates Piper with escalation after a %s failure',
      async (failure) => {
        const harness = childHarness({
          piperExitOnKill: false,
          piperShutdownTimeoutMs: 100,
          send: async (message) => {
            if (
              failure === 'send'
              && message.type === 'event'
              && message.event.type === 'audio'
            ) {
              throw new Error('audio IPC failed')
            }
          },
        })
        await initializeWorker(harness)
        const synthesis = harness.worker.handle({
          type: 'tts_synthesize',
          requestId: 'synthesize',
          input: {
            streamId: `${failure}-stream`,
            generation: 12,
            segmentId: `${failure}-segment`,
            text: 'Failure path.',
          },
        })
        const piper = harness.pipers[0]
        if (failure === 'send') {
          piper.stdout.write(Buffer.from([1, 0]))
        } else {
          piper.stdout.destroy(new Error('Piper stdout failed'))
        }
        await vi.waitFor(() => expect(piper.signals).toContain('SIGTERM'))
        await vi.waitFor(() => expect(piper.signals).toEqual(['SIGTERM', 'SIGKILL']))
        piper.finish(null, 'SIGKILL')
        await synthesis
        expect(harness.messages).toContainEqual({
          type: 'response_error',
          requestId: 'synthesize',
          message: expect.stringContaining('failed'),
        })
      },
    )

    it('awaits downstream audio delivery before consuming the next Piper chunk', async () => {
      let releaseFirstAudio = () => {}
      const firstAudioDelivered = new Promise<void>((resolve) => {
        releaseFirstAudio = resolve
      })
      let audioSends = 0
      const harness = childHarness({
        send: async (message) => {
          if (message.type !== 'event' || message.event.type !== 'audio') return
          audioSends += 1
          if (audioSends === 1) await firstAudioDelivered
        },
      })
      await initializeWorker(harness)
      const synthesis = harness.worker.handle({
        type: 'tts_synthesize',
        requestId: 'synthesize',
        input: {
          streamId: 'stream-8',
          generation: 8,
          segmentId: 'segment-8',
          text: 'Backpressure.',
        },
      })
      const piper = harness.pipers[0]
      piper.stdout.write(Buffer.from([1, 0]))
      await vi.waitFor(() => expect(audioSends).toBe(1))
      piper.stdout.write(Buffer.from([2, 0]))
      piper.finish()
      await new Promise((resolve) => setImmediate(resolve))

      expect(audioSends).toBe(1)
      releaseFirstAudio()
      await synthesis
      expect(audioSends).toBe(2)
    })

    it('emits heartbeats only while the resident worker is open', async () => {
      vi.useFakeTimers()
      try {
        const harness = childHarness({ heartbeatIntervalMs: 100 })
        await initializeWorker(harness)

        await vi.advanceTimersByTimeAsync(101)
        expect(workerEvents(harness.messages)).toContainEqual({
          type: 'heartbeat',
          timestamp: 123,
        })
        const beforeClose = workerEvents(harness.messages).length
        await harness.worker.handle({
          type: 'close',
          requestId: 'close',
        })
        await vi.advanceTimersByTimeAsync(200)
        expect(workerEvents(harness.messages)).toHaveLength(beforeClose)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  it('times out startup and terminates the exact worker without leaving an orphan', async () => {
    vi.useFakeTimers()
    try {
      const { child, engine } = parentHarness()
      const ready = engine.initialize(config)
      const rejection = expect(ready).rejects.toThrow('initialization timed out')

      await vi.advanceTimersByTimeAsync(101)
      await rejection
      expect(child.signals).toEqual(['SIGTERM'])

      await vi.advanceTimersByTimeAsync(11)
      expect(child.signals).toEqual(['SIGTERM', 'SIGKILL'])
    } finally {
      vi.useRealTimers()
    }
  })

  it('fails a ready session when worker heartbeats stop', async () => {
    vi.useFakeTimers()
    try {
      const { child, engine } = parentHarness()
      const session = await initialize(engine, child)
      const events: VoiceEngineEvent[] = []
      session.onEvent((event) => events.push(event))

      await vi.advanceTimersByTimeAsync(301)

      expect(events).toContainEqual({
        type: 'fatal_error',
        message: expect.stringContaining('heartbeat timed out'),
      })
      expect(child.signals).toContain('SIGTERM')
      expect(engine.capability()).toEqual({
        available: false,
        reason: expect.stringContaining('heartbeat timed out'),
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('refreshes the heartbeat deadline when the child reports liveness', async () => {
    vi.useFakeTimers()
    try {
      const { child, engine } = parentHarness()
      await initialize(engine, child)

      await vi.advanceTimersByTimeAsync(250)
      child.emitEvent({ type: 'heartbeat', timestamp: 250 })
      await vi.advanceTimersByTimeAsync(250)

      expect(child.signals).toEqual([])
      expect(engine.capability().available).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects every pending operation when the worker exits', async () => {
    const { child, engine } = parentHarness()
    const session = await initialize(engine, child)
    const starting = session.stt.start({
      streamId: 'stream-7',
      generation: 7,
      utteranceId: 'utterance-7',
      language: 'en',
    })
    child.respond(child.sent.at(-1))
    await starting
    const synthesis = session.tts.synthesize({
      streamId: 'stream-7',
      generation: 7,
      segmentId: 'segment-7',
      text: 'Sensitive transcript text.',
    })
    const end = session.stt.end({
      streamId: 'stream-7',
      generation: 7,
      utteranceId: 'utterance-7',
    })

    child.emit('exit', 1, null)

    await expect(synthesis).rejects.toThrow('voice worker exited')
    await expect(end).rejects.toThrow('voice worker exited')
  })

  it('bounds pending requests before sending more work to the child', async () => {
    const { child, engine } = parentHarness({ maxPendingRequests: 2 })
    const session = await initialize(engine, child)
    const starting = session.stt.start({
      streamId: 'stream-1',
      generation: 1,
      utteranceId: 'utterance-1',
      language: 'en',
    })
    child.respond(child.sent.at(-1))
    await starting
    const first = session.stt.accept({
      direction: 'microphone',
      streamId: 'stream-1',
      generation: 1,
      utteranceId: 'utterance-1',
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: Int16Array.of(1),
    })
    const second = session.stt.accept({
      direction: 'microphone',
      streamId: 'stream-1',
      generation: 1,
      utteranceId: 'utterance-1',
      sequence: 1,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: Int16Array.of(2),
    })

    await expect(session.stt.accept({
      direction: 'microphone',
      streamId: 'stream-1',
      generation: 1,
      utteranceId: 'utterance-1',
      sequence: 2,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: Int16Array.of(3),
    })).rejects.toThrow('too many pending voice worker requests')
    expect(child.sent.filter((message) => message.type === 'stt_audio')).toHaveLength(2)

    const audioRequests = child.sent.filter((message) => message.type === 'stt_audio')
    child.respond(audioRequests[0])
    child.respond(audioRequests[1])
    await Promise.all([first, second])
  })

  it('treats malformed child IPC as fatal', async () => {
    const { child, engine } = parentHarness()
    const ready = engine.initialize(config)

    child.emit('message', { type: 'response', requestId: 42 })

    await expect(ready).rejects.toThrow('malformed voice worker message')
    expect(child.signals).toContain('SIGTERM')
  })

  it('forwards a child fatal error once before terminating it', async () => {
    const { child, engine } = parentHarness()
    const session = await initialize(engine, child)
    const events: VoiceEngineEvent[] = []
    session.onEvent((event) => events.push(event))

    child.emitEvent({
      type: 'fatal_error',
      message: 'native recognizer failed',
    })

    expect(events).toEqual([{
      type: 'fatal_error',
      message: 'native recognizer failed',
    }])
    expect(child.signals).toContain('SIGTERM')
  })

  it('drops generation events after cancellation while preserving newer events', async () => {
    const { child, engine } = parentHarness()
    const session = await initialize(engine, child)
    const events: VoiceEngineEvent[] = []
    session.onEvent((event) => events.push(event))
    const starting = session.stt.start({
      streamId: 'stream-5',
      generation: 5,
      utteranceId: 'utterance-5',
      language: 'en',
    })
    child.respond(child.sent.at(-1))
    await starting

    const cancellation = session.cancelGeneration({
      streamId: 'stream-4',
      generation: 4,
    })
    const cancelRequests = child.sent.filter((message) =>
      message.type === 'stt_cancel' || message.type === 'tts_cancel')
    expect(cancelRequests).toHaveLength(2)
    for (const request of cancelRequests) child.respond(request)
    await cancellation

    child.emitEvent({
      type: 'partial',
      streamId: 'stream-4',
      generation: 4,
      utteranceId: 'utterance-4',
      text: 'late',
    })
    child.emitEvent({
      type: 'audio_end',
      streamId: 'stream-4',
      generation: 4,
      segmentId: 'segment-4',
    })
    child.emitEvent({
      type: 'partial',
      streamId: 'stream-3',
      generation: 3,
      utteranceId: 'utterance-3',
      text: 'older',
    })
    child.emitEvent({
      type: 'partial',
      streamId: 'stream-5',
      generation: 5,
      utteranceId: 'utterance-5',
      text: 'current',
    })

    expect(events).toEqual([{
      type: 'partial',
      streamId: 'stream-5',
      generation: 5,
      utteranceId: 'utterance-5',
      text: 'current',
    }])
  })

  it('terminates the worker at the parent cancellation stream limit', async () => {
    const { child, engine } = parentHarness({ maxCancellationStreams: 2 })
    const session = await initialize(engine, child)
    for (const streamId of ['stream-a', 'stream-b']) {
      const cancellation = session.cancelGeneration({
        streamId,
        generation: 1,
      })
      const requests = child.sent.slice(-2)
      for (const request of requests) child.respond(request)
      await cancellation
    }

    await expect(session.cancelGeneration({
      streamId: 'stream-c',
      generation: 1,
    })).rejects.toThrow('cancellation stream limit')
    expect(child.sent.filter((message) =>
      (message.type === 'stt_cancel' || message.type === 'tts_cancel')
      && message.streamId === 'stream-c')).toEqual([])
    expect(child.signals).toContain('SIGTERM')
  })

  it('rejects delayed same-generation audio outside the active stream and utterance', async () => {
    const { child, engine } = parentHarness()
    const session = await initialize(engine, child)
    const starting = session.stt.start({
      streamId: 'new-stream',
      generation: 1,
      utteranceId: 'new-utterance',
      language: 'en',
    })
    child.respond(child.sent.at(-1))
    await starting

    await expect(session.stt.accept({
      direction: 'microphone',
      streamId: 'old-stream',
      generation: 1,
      utteranceId: 'old-utterance',
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: Int16Array.of(1),
    })).rejects.toThrow('stale STT audio')

    expect(child.sent.filter((message) => message.type === 'stt_audio')).toEqual([])
  })

  it('drops same-generation STT and TTS events outside the active identities', async () => {
    const { child, engine } = parentHarness()
    const session = await initialize(engine, child)
    const events: VoiceEngineEvent[] = []
    session.onEvent((event) => events.push(event))

    const starting = session.stt.start({
      streamId: 'active-stream',
      generation: 2,
      utteranceId: 'active-utterance',
      language: 'en',
    })
    child.respond(child.sent.at(-1))
    await starting
    const synthesis = session.tts.synthesize({
      streamId: 'active-stream',
      generation: 2,
      segmentId: 'active-segment',
      text: 'Active.',
    })

    child.emitEvent({
      type: 'partial',
      streamId: 'stale-stream',
      generation: 2,
      utteranceId: 'active-utterance',
      text: 'stale stream',
    })
    child.emitEvent({
      type: 'partial',
      streamId: 'active-stream',
      generation: 2,
      utteranceId: 'stale-utterance',
      text: 'stale utterance',
    })
    child.emitEvent({
      type: 'audio',
      streamId: 'active-stream',
      generation: 2,
      segmentId: 'stale-segment',
      sequence: 0,
      sampleRate: 22_050,
      samples: Int16Array.of(1),
    })
    child.emitEvent({
      type: 'partial',
      streamId: 'active-stream',
      generation: 2,
      utteranceId: 'active-utterance',
      text: 'current',
    })
    child.emitEvent({
      type: 'audio_end',
      streamId: 'active-stream',
      generation: 2,
      segmentId: 'active-segment',
    })
    const request = child.sent.find((message) => message.type === 'tts_synthesize')
    expect(request).toBeDefined()
    child.respond(request!)
    await synthesis

    expect(events).toEqual([
      {
        type: 'partial',
        streamId: 'active-stream',
        generation: 2,
        utteranceId: 'active-utterance',
        text: 'current',
      },
      {
        type: 'audio_end',
        streamId: 'active-stream',
        generation: 2,
        segmentId: 'active-segment',
      },
    ])
  })

  it('closes gracefully when the worker acknowledges and exits', async () => {
    const { child, engine } = parentHarness()
    const session = await initialize(engine, child)

    const closing = session.close()
    const request = child.sent.at(-1)
    expect(request?.type).toBe('close')
    child.respond(request)
    child.emit('exit', 0, null)
    await closing

    expect(child.signals).toEqual([])
    expect(child.connected).toBe(false)
  })

  it('lets the child finish resistant Piper shutdown before signaling the worker', async () => {
    vi.useFakeTimers()
    try {
      const child = new InProcessVoiceChild()
      const sherpa = fakeSherpa()
      const pipers: FakePiperProcess[] = []
      const worker = createVoiceWorker({
        sherpa: sherpa.module,
        spawnPiper: () => {
          const piper = new FakePiperProcess(false)
          pipers.push(piper)
          return piper
        },
        send: async (message) => {
          child.emit('message', message)
        },
        heartbeatIntervalMs: 0,
      })
      child.handleMessage = (message) => worker.handle(message)
      const engine = new ChildVoiceEngine({
        fork: () => child,
        startupTimeoutMs: 100,
        operationTimeoutMs: 5_000,
        heartbeatTimeoutMs: 10_000,
        shutdownTimeoutMs: 10,
        maxPendingRequests: 8,
      })
      const session = await engine.initialize(config)
      const synthesis = session.tts.synthesize({
        streamId: 'resistant-stream',
        generation: 1,
        segmentId: 'resistant-segment',
        text: 'Stop safely.',
      })
      const synthesisResult = synthesis.catch((error: unknown) => error)
      const piper = pipers[0]

      const closing = session.close()
      expect(piper.signals).toEqual(['SIGTERM'])
      await vi.advanceTimersByTimeAsync(3_999)
      const workerSignalsBeforeChildAcknowledgement = [...child.signals]
      expect(piper.signals).toEqual(['SIGTERM', 'SIGKILL'])
      await vi.advanceTimersByTimeAsync(2)
      await closing
      piper.finish(null, 'SIGKILL')

      expect(workerSignalsBeforeChildAcknowledgement).toEqual([])
      await expect(synthesisResult).resolves.toBeInstanceOf(Error)
    } finally {
      vi.useRealTimers()
    }
  })

  it('escalates from SIGTERM to SIGKILL when graceful close stalls', async () => {
    vi.useFakeTimers()
    try {
      const { child, engine } = parentHarness()
      await initialize(engine, child)

      const stopping = engine.stop()
      await vi.advanceTimersByTimeAsync(21)
      expect(child.signals).toEqual(['SIGTERM'])
      await vi.advanceTimersByTimeAsync(11)
      expect(child.signals).toEqual(['SIGTERM', 'SIGKILL'])
      child.emit('exit', null, 'SIGKILL')
      await stopping
    } finally {
      vi.useRealTimers()
    }
  })
})
