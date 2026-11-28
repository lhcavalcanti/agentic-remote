import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  importSherpaModule,
  sherpaExport,
} from './sherpa-module.js'
import {
  isParakeetDecodeRequest,
  PARAKEET_HEARTBEAT_INTERVAL_MS,
  PARAKEET_SAMPLE_RATE,
  readParakeetChildArguments,
  type ParakeetChildMessage,
  type ParakeetDecodeResult,
} from './parakeet-worker-protocol.js'
import type { ParakeetConfig } from './transcription-engine-config.js'

export const PARAKEET_MODEL_FILES = [
  'encoder.int8.onnx',
  'decoder.int8.onnx',
  'joiner.int8.onnx',
  'tokens.txt',
] as const

export interface ParakeetOfflineStream {
  acceptWaveform(input: { samples: Float32Array; sampleRate: number }): void
}

export interface ParakeetOfflineRecognizer {
  createStream(): ParakeetOfflineStream
  decodeAsync(stream: ParakeetOfflineStream): Promise<unknown>
}

export interface ParakeetSherpaModule {
  OfflineRecognizer: {
    createAsync(config: object): Promise<ParakeetOfflineRecognizer>
  }
}

export interface ParakeetChildOptions {
  loadSherpa: () => Promise<ParakeetSherpaModule>
  send: (message: ParakeetChildMessage) => Promise<void>
  heartbeatIntervalMs?: number
}

export interface ParakeetChild {
  /** Posts `ready` or `failed` and reports whether the model loaded. */
  load(config: ParakeetConfig): Promise<boolean>
  handle(message: unknown): Promise<void>
  close(): void
}

export function parakeetRecognizerConfig(modelDirectory: string, threads: number): object {
  return {
    featConfig: { sampleRate: PARAKEET_SAMPLE_RATE, featureDim: 128 },
    modelConfig: {
      transducer: {
        encoder: path.join(modelDirectory, 'encoder.int8.onnx'),
        decoder: path.join(modelDirectory, 'decoder.int8.onnx'),
        joiner: path.join(modelDirectory, 'joiner.int8.onnx'),
      },
      tokens: path.join(modelDirectory, 'tokens.txt'),
      numThreads: threads,
      provider: 'cpu',
      modelType: 'nemo_transducer',
      debug: 0,
    },
    // Measured: beam search found no fewer errors and decoded about 40% slower.
    decodingMethod: 'greedy_search',
  }
}

export function createParakeetChild(options: ParakeetChildOptions): ParakeetChild {
  const heartbeatIntervalMs = options.heartbeatIntervalMs ?? PARAKEET_HEARTBEAT_INTERVAL_MS
  let recognizer: ParakeetOfflineRecognizer | undefined
  let heartbeat: ReturnType<typeof setInterval> | undefined
  let decoding: Promise<void> = Promise.resolve()
  let closed = false

  const decode = async (samples: Float32Array): Promise<ParakeetDecodeResult> => {
    if (!recognizer) throw new Error('worker is not ready')
    const stream = recognizer.createStream()
    stream.acceptWaveform({ sampleRate: PARAKEET_SAMPLE_RATE, samples })
    // decodeAsync keeps this event loop free, so heartbeats continue meanwhile.
    return decodeResult(await recognizer.decodeAsync(stream))
  }

  return {
    async load(config) {
      try {
        const directory = await modelDirectory(config.modelDirectory)
        const sherpa = await options.loadSherpa()
        recognizer = await sherpa.OfflineRecognizer.createAsync(
          parakeetRecognizerConfig(directory, config.threads),
        )
        await decode(new Float32Array(PARAKEET_SAMPLE_RATE))
        if (closed) return false
        await options.send({ type: 'ready' })
        if (heartbeatIntervalMs > 0) {
          heartbeat = setInterval(() => {
            void options.send({ type: 'heartbeat' }).catch(() => undefined)
          }, heartbeatIntervalMs)
        }
        return true
      } catch (error) {
        recognizer = undefined
        await options.send({ type: 'failed', message: errorMessage(error) }).catch(() => undefined)
        return false
      }
    },
    handle(message) {
      if (!isParakeetDecodeRequest(message)) return Promise.resolve()
      decoding = decoding.then(async () => {
        try {
          const result = await decode(message.samples)
          await options.send({ type: 'result', id: message.id, result })
        } catch (error) {
          await options.send({ type: 'error', id: message.id, message: errorMessage(error) })
        }
      }).catch(() => undefined)
      return decoding
    },
    close() {
      closed = true
      if (heartbeat) clearInterval(heartbeat)
      heartbeat = undefined
    },
  }
}

async function modelDirectory(configured: string): Promise<string> {
  let directory: string
  try {
    directory = await realpath(configured)
  } catch {
    throw new Error('model directory is missing')
  }
  for (const file of PARAKEET_MODEL_FILES) {
    const metadata = await stat(path.join(directory, file)).catch(() => undefined)
    if (!metadata?.isFile()) throw new Error(`model file is missing: ${file}`)
  }
  return directory
}

function decodeResult(raw: unknown): ParakeetDecodeResult {
  const result = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {}
  return {
    text: typeof result.text === 'string' ? result.text : '',
    tokens: Array.isArray(result.tokens)
      ? result.tokens.filter((token): token is string => typeof token === 'string')
      : [],
    timestamps: finiteNumbers(result.timestamps),
    durations: finiteNumbers(result.durations),
  }
}

function finiteNumbers(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => Number.isFinite(item))
    : []
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Parakeet worker failed'
}

export function normalizeParakeetSherpaModule(imported: unknown): ParakeetSherpaModule {
  const OfflineRecognizer = sherpaExport(imported, 'OfflineRecognizer', hasCreateAsync)
  if (!OfflineRecognizer) {
    throw new Error('sherpa-onnx-node OfflineRecognizer export is unavailable')
  }
  return { OfflineRecognizer }
}

function hasCreateAsync(value: unknown): value is ParakeetSherpaModule['OfflineRecognizer'] {
  return (typeof value === 'function' || (typeof value === 'object' && value !== null))
    && typeof Reflect.get(value, 'createAsync') === 'function'
}

async function sendProcessMessage(message: ParakeetChildMessage): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const send = process.send
    if (!send || !process.connected) {
      reject(new Error('Parakeet worker IPC channel is closed'))
      return
    }
    send.call(process, message, (error: Error | null) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

async function runChildProcess(): Promise<void> {
  const child = createParakeetChild({
    loadSherpa: async () => normalizeParakeetSherpaModule(await importSherpaModule()),
    send: sendProcessMessage,
  })
  // The server owns this process; without it, there is nothing to answer.
  process.on('disconnect', () => {
    child.close()
    process.exit(0)
  })
  process.on('message', (message: unknown) => {
    void child.handle(message)
  })
  let loaded = false
  try {
    loaded = await child.load(readParakeetChildArguments(process.argv.slice(2)))
  } catch (error) {
    await sendProcessMessage({ type: 'failed', message: errorMessage(error) }).catch(() => undefined)
  }
  if (!loaded) process.exit(1)
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (process.send && entry === fileURLToPath(import.meta.url)) {
  void runChildProcess()
}
