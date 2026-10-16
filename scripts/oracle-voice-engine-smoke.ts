import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { ORACLE_VOICE_SAMPLE_RATE } from '../shared/oracle-voice.js'
import type { EnabledOracleVoiceConfig } from '../server/oracle-voice-config.js'
import type { VoiceEngineEvent } from '../server/oracle-voice-engine.js'
import { ChildVoiceEngine } from '../server/oracle-voice-worker.js'

const wavPath = process.argv[2]
if (!wavPath) {
  throw new Error('Usage: oracle-voice-engine-smoke.ts <16-kHz-mono-pcm16.wav>')
}

const config = voiceConfigFromEnvironment()
const wave = parsePcm16Wave(await readFile(path.resolve(wavPath)))
if (wave.sampleRate !== ORACLE_VOICE_SAMPLE_RATE || wave.channels !== 1) {
  throw new Error(`Smoke WAV must be mono ${ORACLE_VOICE_SAMPLE_RATE} Hz PCM16`)
}

const engine = new ChildVoiceEngine()
let firstPartialMs: number | undefined
let firstAudioMs: number | undefined
let playbackSamples = 0
let sttStarted = 0
let ttsStarted = 0
const partials: string[] = []

try {
  const session = await engine.initialize(config)
  const generation = 1
  const utteranceId = 'real-smoke-utterance'
  const segmentId = 'real-smoke-segment'
  const final = deferred<string>()
  const audioEnd = deferred<void>()
  const unsubscribe = session.onEvent((event: VoiceEngineEvent) => {
    if (event.type === 'partial') {
      firstPartialMs ??= performance.now() - sttStarted
      partials.push(event.text)
      console.log(`partial: ${event.text}`)
    } else if (event.type === 'final') {
      console.log(`final: ${event.text}`)
      final.resolve(event.text)
    } else if (event.type === 'audio') {
      firstAudioMs ??= performance.now() - ttsStarted
      playbackSamples += event.samples.length
    } else if (event.type === 'audio_end') {
      audioEnd.resolve(undefined)
    } else if (event.type === 'fatal_error') {
      final.reject(new Error(event.message))
      audioEnd.reject(new Error(event.message))
    }
  })

  sttStarted = performance.now()
  await session.stt.start({
    generation,
    utteranceId,
    language: config.language,
  })
  const frameSamples = ORACLE_VOICE_SAMPLE_RATE * 80 / 1_000
  for (let offset = 0, sequence = 0; offset < wave.samples.length; sequence += 1) {
    const end = Math.min(wave.samples.length, offset + frameSamples)
    await session.stt.accept({
      direction: 'microphone',
      generation,
      sequence,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: wave.samples.subarray(offset, end),
    })
    offset = end
  }
  await session.stt.end({ generation, utteranceId })
  const transcript = await final.promise
  const sttElapsedMs = performance.now() - sttStarted

  ttsStarted = performance.now()
  await session.tts.synthesize({
    generation,
    segmentId,
    text: transcript || 'Oracle voice smoke test.',
  })
  await audioEnd.promise
  const ttsElapsedMs = performance.now() - ttsStarted
  const audioDurationMs = playbackSamples / 24_000 * 1_000
  const rssBytes = await workerRssBytes(engine.workerPid())

  console.log(`first-partial latency ms: ${format(firstPartialMs)}`)
  console.log(`first-audio latency ms: ${format(firstAudioMs)}`)
  console.log(`STT RTF: ${format(sttElapsedMs / wave.durationMs)}`)
  console.log(`TTS RTF: ${format(audioDurationMs > 0 ? ttsElapsedMs / audioDurationMs : undefined)}`)
  console.log(`worker RSS MiB: ${format(rssBytes === undefined ? undefined : rssBytes / 1_048_576)}`)
  console.log(`partials observed: ${partials.length}`)
  unsubscribe()
} finally {
  await engine.stop()
}

function voiceConfigFromEnvironment(): EnabledOracleVoiceConfig {
  return {
    enabled: true,
    language: process.env.AGENTIC_REMOTE_VOICE_LANGUAGE ?? 'en',
    threads: integerEnvironment('AGENTIC_REMOTE_VOICE_THREADS', 2),
    endpointMs: integerEnvironment('AGENTIC_REMOTE_VOICE_ENDPOINT_MS', 800),
    stt: {
      profile: process.env.AGENTIC_REMOTE_VOICE_STT_PROFILE === 'zipformer'
        ? 'zipformer'
        : 'nemotron',
      modelDirectory: requiredEnvironment('AGENTIC_REMOTE_VOICE_STT_MODEL_DIR'),
    },
    tts: {
      binary: requiredEnvironment('AGENTIC_REMOTE_VOICE_TTS_BIN'),
      model: requiredEnvironment('AGENTIC_REMOTE_VOICE_TTS_MODEL'),
      config: requiredEnvironment('AGENTIC_REMOTE_VOICE_TTS_CONFIG'),
      ...(process.env.AGENTIC_REMOTE_VOICE_TTS_SPEAKER === undefined
        ? {}
        : {
            speaker: integerEnvironment('AGENTIC_REMOTE_VOICE_TTS_SPEAKER', 0),
          }),
    },
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return path.resolve(value)
}

function integerEnvironment(name: string, fallback: number): number {
  const value = process.env[name]
  if (value === undefined) return fallback
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`)
  }
  return parsed
}

function parsePcm16Wave(bytes: Buffer): {
  channels: number
  sampleRate: number
  samples: Int16Array
  durationMs: number
} {
  if (bytes.length < 44 || bytes.toString('ascii', 0, 4) !== 'RIFF'
    || bytes.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Smoke input is not a RIFF/WAVE file')
  }
  let offset = 12
  let channels = 0
  let sampleRate = 0
  let bitsPerSample = 0
  let format = 0
  let data: Buffer | undefined
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString('ascii', offset, offset + 4)
    const size = bytes.readUInt32LE(offset + 4)
    const start = offset + 8
    const end = start + size
    if (end > bytes.length) throw new Error('Smoke WAV contains a truncated chunk')
    if (id === 'fmt ') {
      format = bytes.readUInt16LE(start)
      channels = bytes.readUInt16LE(start + 2)
      sampleRate = bytes.readUInt32LE(start + 4)
      bitsPerSample = bytes.readUInt16LE(start + 14)
    } else if (id === 'data') {
      data = bytes.subarray(start, end)
    }
    offset = end + (size % 2)
  }
  if (format !== 1 || bitsPerSample !== 16 || !data || data.length % 2 !== 0) {
    throw new Error('Smoke WAV must contain little-endian PCM16 audio')
  }
  const samples = new Int16Array(data.length / 2)
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = data.readInt16LE(index * 2)
  }
  return {
    channels,
    sampleRate,
    samples,
    durationMs: samples.length / channels / sampleRate * 1_000,
  }
}

async function workerRssBytes(pid: number | undefined): Promise<number | undefined> {
  if (pid === undefined || process.platform !== 'linux') return undefined
  try {
    const status = await readFile(`/proc/${pid}/status`, 'utf8')
    const match = /^VmRSS:\s+(\d+)\s+kB$/m.exec(status)
    return match ? Number(match[1]) * 1_024 : undefined
  } catch {
    return undefined
  }
}

function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
} {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function format(value: number | undefined): string {
  return value === undefined ? 'unavailable' : value.toFixed(3)
}
