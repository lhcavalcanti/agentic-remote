/**
 * Compares Whisper with Parakeet on the committed voice fixtures through the
 * real transcription service (upload, ffprobe, ffmpeg conversion, engine), and
 * soaks the Parakeet worker to show that its memory stays bounded.
 *
 *   AGENTIC_REMOTE_PARAKEET_MODEL_DIR=<model directory> \
 *     node --import tsx scripts/transcription-benchmark.ts [--soak 200] [--engines whisper,parakeet]
 *
 * Whisper uses AGENTIC_REMOTE_WHISPER_BIN and AGENTIC_REMOTE_WHISPER_MODEL,
 * else ~/.local/bin/whisper-cli and ~/.agentic-remote/models/ggml-small.bin,
 * and only reads them. Job files go to a temporary data directory that is
 * removed afterwards. Output names fixtures, counts, and timings; recognized
 * text appears only with --show-text.
 */
import { createReadStream } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { normalizeTranscript, wordErrorRate } from './oracle-voice-benchmark.js'
import { ParakeetWorker } from '../server/parakeet-worker.js'
import { readTranscriptionEngineConfig } from '../server/transcription-engine-config.js'
import {
  LocalTranscriptionService,
  localTranscriptionOptions,
} from '../server/transcription-service.js'

type Engine = 'whisper' | 'parakeet'

interface Fixture {
  fixture: string
  language: string
  expectedTranscript: string
  normalizedTranscript?: string
  durationSeconds: number
  tags?: string[]
}

interface ClipResult {
  fixture: Fixture
  engine: Engine
  milliseconds: number
  /** The engine that answered; a Parakeet run may have fallen back. */
  answeredBy?: string
  text?: string
  error?: string
  edits: number
  words: number
}

const repository = fileURLToPath(new URL('..', import.meta.url))
const fixtureDirectory = path.join(repository, 'fixtures', 'voice')
const SOAK_CLIP_SECONDS = 10

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      engines: { type: 'string', default: 'whisper,parakeet' },
      soak: { type: 'string' },
      'show-text': { type: 'boolean', default: false },
    },
  })
  const engines = values.engines.split(',').map((engine) => engine.trim()) as Engine[]
  if (engines.some((engine) => engine !== 'whisper' && engine !== 'parakeet')) {
    throw new Error('--engines takes whisper, parakeet, or both')
  }
  const soak = values.soak === undefined ? undefined : Number(values.soak)
  if (soak !== undefined && (!Number.isInteger(soak) || soak < 20)) {
    throw new Error('--soak takes an iteration count of at least 20')
  }
  const manifest = JSON.parse(
    await readFile(path.join(fixtureDirectory, 'manifest.json'), 'utf8'),
  ) as { fixtures: Fixture[] }
  const dataDirectory = await mkdtemp(path.join(os.tmpdir(), 'transcription-benchmark-'))
  const home = process.env.HOME || os.homedir()
  const media = {
    ...localTranscriptionOptions(dataDirectory),
    modelPath: process.env.AGENTIC_REMOTE_WHISPER_MODEL?.trim()
      || path.join(home, '.agentic-remote', 'models', 'ggml-small.bin'),
  }
  const parakeetConfig = readTranscriptionEngineConfig(
    { ...process.env, AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: 'parakeet' },
    dataDirectory,
  )
  if (parakeetConfig.engine !== 'parakeet') throw new Error('unreachable')
  const worker = new ParakeetWorker(parakeetConfig.parakeet)
  try {
    const services: Partial<Record<Engine, LocalTranscriptionService>> = {}
    if (engines.includes('whisper')) {
      services.whisper = new LocalTranscriptionService(media)
    }
    if (engines.includes('parakeet') || soak) {
      const started = performance.now()
      await worker.start()
      console.log(`Parakeet worker ready in ${Math.round(performance.now() - started)} ms `
        + `(${parakeetConfig.parakeet.threads} threads, pid ${worker.pid})`)
      services.parakeet = new LocalTranscriptionService({
        ...media,
        engine: parakeetConfig,
        parakeetWorker: worker,
        logger: {
          info: () => undefined,
          warn: (details) => console.warn('fallback:', JSON.stringify(details)),
        },
      })
    }
    for (const service of Object.values(services)) await service.initialize()

    const results: ClipResult[] = []
    for (const engine of engines) {
      const service = services[engine]!
      for (const fixture of manifest.fixtures) {
        results.push(await transcribeClip(service, engine, fixture))
      }
    }
    if (results.length > 0) report(results, engines, values['show-text'])
    if (soak) await soakParakeet(services.parakeet!, worker, soak, dataDirectory)
  } finally {
    await worker.stop()
    await rm(dataDirectory, { recursive: true, force: true })
  }
}

async function transcribeClip(
  service: LocalTranscriptionService,
  engine: Engine,
  fixture: Fixture,
): Promise<ClipResult> {
  const reference = normalizeTranscript(fixture.normalizedTranscript ?? fixture.expectedTranscript)
  const words = reference ? reference.split(' ').length : 0
  const started = performance.now()
  try {
    const result = await service.transcribe({
      filename: fixture.fixture,
      mimeType: 'audio/wav',
      stream: createReadStream(path.join(fixtureDirectory, fixture.fixture)),
      truncated: () => false,
    })
    const milliseconds = performance.now() - started
    return {
      fixture,
      engine,
      milliseconds,
      answeredBy: result.engine,
      text: result.transcript,
      edits: Math.round(wordErrorRate(reference, result.transcript) * words),
      words,
    }
  } catch (error) {
    const milliseconds = performance.now() - started
    // Silence has nothing to recognize, so "no speech" is the right answer.
    const message = error instanceof Error ? error.message : String(error)
    return { fixture, engine, milliseconds, error: message, edits: words, words }
  }
}

function report(results: ClipResult[], engines: Engine[], showText: boolean): void {
  const clean = (result: ClipResult) => result.fixture.tags?.includes('clean') === true
  const languages = [...new Set(results.filter(clean).map(({ fixture }) => fixture.language))]
  console.log('\nClean-fixture WER (total edits / total reference words)\n')
  console.log(`| Engine | ${languages.join(' | ')} |`)
  console.log(`| --- | ${languages.map(() => '---:').join(' | ')} |`)
  for (const engine of engines) {
    const cells = languages.map((language) => {
      const rows = results.filter((result) =>
        result.engine === engine && clean(result) && result.fixture.language === language)
      const edits = rows.reduce((total, row) => total + row.edits, 0)
      const words = rows.reduce((total, row) => total + row.words, 0)
      return `${edits}/${words} (${(edits / words).toFixed(3)})`
    })
    console.log(`| ${engine} | ${cells.join(' | ')} |`)
  }
  console.log('\nPer-clip latency, upload to transcript (ms)\n')
  console.log(`| Clip | Audio s | ${engines.map((engine) => `${engine} ms | ${engine} edits`).join(' | ')} |`)
  console.log(`| --- | ---: | ${engines.map(() => '---: | ---:').join(' | ')} |`)
  for (const fixture of new Set(results.map((result) => result.fixture))) {
    const cells = engines.map((engine) => {
      const row = results.find((result) => result.engine === engine && result.fixture === fixture)!
      const outcome = row.error
        ? (row.words === 0 && row.error.startsWith('No speech') ? 'no speech' : `error: ${row.error}`)
        : `${row.edits}/${row.words}${row.answeredBy === engine ? '' : ` (${row.answeredBy})`}`
      return `${Math.round(row.milliseconds)} | ${outcome}`
    })
    console.log(`| ${fixture.fixture} | ${fixture.durationSeconds} | ${cells.join(' | ')} |`)
  }
  if (showText) {
    console.log('')
    for (const result of results) {
      console.log(`${result.engine} ${result.fixture.fixture}: ${result.text ?? `[${result.error}]`}`)
    }
  }
}

async function soakParakeet(
  service: LocalTranscriptionService,
  worker: ParakeetWorker,
  iterations: number,
  dataDirectory: string,
): Promise<void> {
  const clip = path.join(dataDirectory, `soak-${SOAK_CLIP_SECONDS}s.wav`)
  await writeFile(clip, await firstSeconds(
    path.join(fixtureDirectory, 'en-long-male-clean.wav'),
    SOAK_CLIP_SECONDS,
  ))
  const latencies: number[] = []
  const rss = new Map<number, number>()
  const pid = worker.pid
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    const started = performance.now()
    const result = await service.transcribe({
      filename: path.basename(clip),
      mimeType: 'audio/wav',
      stream: createReadStream(clip),
      truncated: () => false,
    })
    latencies.push(performance.now() - started)
    if (result.engine !== 'parakeet' || worker.pid !== pid) {
      throw new Error(`soak iteration ${iteration} was not answered by the same Parakeet worker`)
    }
    if (iteration === 20 || iteration === iterations || iteration % 50 === 0) {
      rss.set(iteration, await residentKiB(pid!))
    }
  }
  const sorted = [...latencies].sort((left, right) => left - right)
  const percentile = (fraction: number) =>
    Math.round(sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))])
  const first = rss.get(20)!
  const last = rss.get(iterations)!
  console.log(`\nParakeet soak: ${iterations} transcriptions of a ${SOAK_CLIP_SECONDS} s clip, one worker (pid ${pid})\n`)
  console.log('| Iteration | Worker VmRSS (MiB) |')
  console.log('| ---: | ---: |')
  for (const [iteration, kib] of [...rss].sort(([left], [right]) => left - right)) {
    console.log(`| ${iteration} | ${(kib / 1024).toFixed(1)} |`)
  }
  console.log(`\nRSS growth from iteration 20 to ${iterations}: ${((last - first) / first * 100).toFixed(2)}%`)
  console.log(`Latency, upload to transcript: p50 ${percentile(0.5)} ms, p90 ${percentile(0.9)} ms, `
    + `max ${Math.round(sorted.at(-1)!)} ms`)
}

/** The first seconds of a 16 kHz mono PCM16 fixture, as a WAV of its own. */
async function firstSeconds(file: string, seconds: number): Promise<Buffer> {
  const wave = await readFile(file)
  let offset = 12
  while (offset + 8 <= wave.length && wave.toString('ascii', offset, offset + 4) !== 'data') {
    const size = wave.readUInt32LE(offset + 4)
    offset += 8 + size + (size % 2)
  }
  if (offset + 8 > wave.length) throw new Error(`${file} has no audio data`)
  const bytes = Math.min(seconds * 16_000 * 2, wave.readUInt32LE(offset + 4))
  const header = Buffer.alloc(44)
  header.write('RIFF', 0, 'ascii')
  header.writeUInt32LE(36 + bytes, 4)
  header.write('WAVEfmt ', 8, 'ascii')
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(16_000, 24)
  header.writeUInt32LE(32_000, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36, 'ascii')
  header.writeUInt32LE(bytes, 40)
  return Buffer.concat([header, wave.subarray(offset + 8, offset + 8 + bytes)])
}

async function residentKiB(pid: number): Promise<number> {
  const status = await readFile(`/proc/${pid}/status`, 'utf8')
  const line = status.split('\n').find((entry) => entry.startsWith('VmRSS:'))
  const kib = Number(line?.match(/(\d+)\s*kB/)?.[1])
  if (!Number.isFinite(kib)) throw new Error(`could not read VmRSS for ${pid}`)
  return kib
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
