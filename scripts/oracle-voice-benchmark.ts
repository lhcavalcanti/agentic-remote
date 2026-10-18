import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { ORACLE_VOICE_SAMPLE_RATE } from '../shared/oracle-voice.js'
import {
  readPiperSampleRate,
  type EnabledOracleVoiceConfig,
  type OracleVoiceSttProfile,
  type SherpaVitsVoiceConfig,
} from '../server/oracle-voice-config.js'
import type {
  VoiceEngineEvent,
  VoiceEngineSession,
} from '../server/oracle-voice-engine.js'
import { SpeakableSegmenter } from '../server/oracle-voice-segments.js'
import { ChildVoiceEngine } from '../server/oracle-voice-worker.js'

type MetricBasis = 'measured' | 'derived' | 'missing'

export interface BenchmarkMetric {
  value: number | null
  basis: MetricBasis
}

export interface VoiceBenchmarkRow {
  profile: string
  fixture: string
  language: string
  transcript: string
  expectedTranscript: string
  wer: BenchmarkMetric
  firstPartialMs: BenchmarkMetric
  finalAfterSpeechMs: BenchmarkMetric
  sttRtf: BenchmarkMetric
  ttsFirstAudioMs: BenchmarkMetric
  ttsRtf: BenchmarkMetric
  peakRssMiB: BenchmarkMetric
  sustainedCpuPercent: BenchmarkMetric
}

export interface VoiceBenchmarkReport {
  schemaVersion: 1
  generatedAt: string
  host: {
    platform: string
    arch: string
    cpuCount: number
  }
  profiles: Array<{
    name: string
    sttProfile: OracleVoiceSttProfile
    languages: string[]
  }>
  rows: VoiceBenchmarkRow[]
  baselines: Array<{
    name: string
    note: string
    sttRtf: BenchmarkMetric
    peakRssMiB: BenchmarkMetric
  }>
}

interface CorpusFixture {
  fixture: string
  language: string
  expectedTranscript: string
  normalizedTranscript: string
  durationSeconds: number
  sha256: string
}

interface CorpusManifest {
  fixtures: CorpusFixture[]
}

interface CliOptions {
  fastSttDirectory: string
  multilingualSttDirectory: string
  englishTtsDirectory: string
  portugueseTtsDirectory: string
  outputJson: string
  outputMarkdown: string
  fixtureNames?: Set<string>
}

interface BenchmarkProfile {
  name: string
  sttProfile: OracleVoiceSttProfile
  sttDirectory: string
  languages: string[]
}

interface TtsAssets {
  directory: string
  modelName: string
}

interface WaveData {
  channels: number
  sampleRate: number
  samples: Int16Array
  durationMs: number
}

interface ProcessSample {
  cpuTicks: number
  rssBytes: number
}

const execFileAsync = promisify(execFile)
const FRAME_SAMPLES = ORACLE_VOICE_SAMPLE_RATE * 80 / 1_000
const CHILD_TIMEOUT_MS = 120_000

export function normalizeTranscript(value: string): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('und')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function wordErrorRate(reference: string, hypothesis: string): number {
  const expected = normalizeTranscript(reference).split(' ').filter(Boolean)
  const actual = normalizeTranscript(hypothesis).split(' ').filter(Boolean)
  if (expected.length === 0) return actual.length === 0 ? 0 : 1
  const previous = Array.from({ length: actual.length + 1 }, (_, index) => index)
  for (let expectedIndex = 1; expectedIndex <= expected.length; expectedIndex += 1) {
    let diagonal = previous[0]
    previous[0] = expectedIndex
    for (let actualIndex = 1; actualIndex <= actual.length; actualIndex += 1) {
      const above = previous[actualIndex]
      const substitution = diagonal
        + (expected[expectedIndex - 1] === actual[actualIndex - 1] ? 0 : 1)
      previous[actualIndex] = Math.min(
        previous[actualIndex] + 1,
        previous[actualIndex - 1] + 1,
        substitution,
      )
      diagonal = above
    }
  }
  return previous[actual.length] / expected.length
}

export function parsePcm16Wave(bytes: Buffer): WaveData {
  if (
    bytes.length < 44
    || bytes.toString('ascii', 0, 4) !== 'RIFF'
    || bytes.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    throw new Error('Benchmark input is not a RIFF/WAVE file')
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
    if (end > bytes.length) throw new Error('Benchmark WAV contains a truncated chunk')
    if (id === 'fmt ') {
      if (size < 16) throw new Error('Benchmark WAV has an invalid format chunk')
      format = bytes.readUInt16LE(start)
      channels = bytes.readUInt16LE(start + 2)
      sampleRate = bytes.readUInt32LE(start + 4)
      bitsPerSample = bytes.readUInt16LE(start + 14)
    } else if (id === 'data') {
      data = bytes.subarray(start, end)
    }
    offset = end + (size % 2)
  }
  if (
    format !== 1
    || bitsPerSample !== 16
    || channels <= 0
    || sampleRate <= 0
    || !data
    || data.length % 2 !== 0
  ) {
    throw new Error('Benchmark WAV must contain little-endian PCM16 audio')
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

export function formatBenchmarkMarkdown(report: VoiceBenchmarkReport): string {
  const lines = [
    '# Oracle voice benchmark',
    '',
    `Generated ${report.generatedAt} on ${report.host.platform}/${report.host.arch} `
      + `(${report.host.cpuCount} logical CPUs).`,
    '',
    '| Profile | Fixture | Language | WER | First partial ms | Final after speech ms | STT RTF | TTS first audio ms | TTS RTF | Peak RSS MiB | Sustained CPU % |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]
  for (const row of report.rows) {
    lines.push([
      row.profile,
      row.fixture,
      row.language,
      formatMetric(row.wer),
      formatMetric(row.firstPartialMs),
      formatMetric(row.finalAfterSpeechMs),
      formatMetric(row.sttRtf),
      formatMetric(row.ttsFirstAudioMs),
      formatMetric(row.ttsRtf),
      formatMetric(row.peakRssMiB),
      formatMetric(row.sustainedCpuPercent),
    ].map((value) => ` ${value} `).join('|').replace(/^/, '|').concat('|'))
  }
  lines.push(
    '',
    '## Prior baseline',
    '',
    '| Baseline | STT RTF | Peak RSS MiB |',
    '| --- | ---: | ---: |',
  )
  for (const baseline of report.baselines) {
    lines.push(
      `| ${baseline.name} | ${formatMetric(baseline.sttRtf)} `
      + `| ${formatMetric(baseline.peakRssMiB)} |`,
    )
  }
  lines.push(
    '',
    'M = measured, D = derived from prior measurements, X = missing.',
    '',
  )
  return lines.join('\n')
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2))
  const repositoryRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
  const fixtureDirectory = path.join(repositoryRoot, 'fixtures', 'voice')
  const manifest = parseManifest(JSON.parse(
    await readFile(path.join(fixtureDirectory, 'manifest.json'), 'utf8'),
  ))
  await verifyCorpus(fixtureDirectory, manifest)
  const selectedFixtures = options.fixtureNames
    ? manifest.fixtures.filter((fixture) => options.fixtureNames?.has(fixture.fixture))
    : manifest.fixtures
  if (selectedFixtures.length === 0) throw new Error('No corpus fixtures were selected')

  const profiles: BenchmarkProfile[] = [
    {
      name: 'fast-en',
      sttProfile: 'zipformer',
      sttDirectory: options.fastSttDirectory,
      languages: ['en'],
    },
    {
      name: 'multilingual-quality',
      sttProfile: 'nemotron',
      sttDirectory: options.multilingualSttDirectory,
      languages: ['en', 'pt-BR'],
    },
  ]
  const ttsAssets = new Map<string, TtsAssets>([
    ['en', {
      directory: options.englishTtsDirectory,
      modelName: 'en_US-ljspeech-medium.onnx',
    }],
    ['pt-BR', {
      directory: options.portugueseTtsDirectory,
      modelName: 'pt_BR-faber-medium.onnx',
    }],
  ])
  const ticksPerSecond = await clockTicksPerSecond()
  const rows: VoiceBenchmarkRow[] = []
  for (const profile of profiles) {
    for (const language of profile.languages) {
      const fixtures = selectedFixtures.filter((fixture) =>
        fixture.language === language || fixture.language === 'und')
      if (fixtures.length === 0) continue
      const assets = ttsAssets.get(language)
      if (!assets) throw new Error(`No TTS assets configured for ${language}`)
      rows.push(...await benchmarkGroup(
        fixtureDirectory,
        profile,
        language,
        assets,
        fixtures,
        ticksPerSecond,
      ))
    }
  }

  const report: VoiceBenchmarkReport = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    host: {
      platform: process.platform,
      arch: process.arch,
      cpuCount: os.cpus().length,
    },
    profiles: profiles.map(({ name, sttProfile, languages }) => ({
      name,
      sttProfile,
      languages,
    })),
    rows,
    baselines: [{
      name: 'Whisper tiny.en prior',
      note: 'Earlier controlled measurement: 7.96 s processing for 11 s audio',
      sttRtf: derived(0.72),
      peakRssMiB: derived(885),
    }],
  }
  await Promise.all([
    mkdir(path.dirname(options.outputJson), { recursive: true }),
    mkdir(path.dirname(options.outputMarkdown), { recursive: true }),
  ])
  await Promise.all([
    writeFile(options.outputJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    writeFile(options.outputMarkdown, formatBenchmarkMarkdown(report), 'utf8'),
  ])
  console.log(`Wrote ${rows.length} measured rows to ${options.outputJson}`)
  console.log(`Wrote Markdown summary to ${options.outputMarkdown}`)
}

async function benchmarkGroup(
  fixtureDirectory: string,
  profile: BenchmarkProfile,
  language: string,
  ttsAssets: TtsAssets,
  fixtures: CorpusFixture[],
  ticksPerSecond: number,
): Promise<VoiceBenchmarkRow[]> {
  const config = await buildConfig(profile, language, ttsAssets)
  const engine = new ChildVoiceEngine({
    startupTimeoutMs: CHILD_TIMEOUT_MS,
    operationTimeoutMs: CHILD_TIMEOUT_MS,
  })
  try {
    const session = await engine.initialize(config)
    const pid = engine.workerPid()
    if (!pid) throw new Error('Voice benchmark worker did not expose a PID')
    const rows: VoiceBenchmarkRow[] = []
    for (const [index, fixture] of fixtures.entries()) {
      const wave = parsePcm16Wave(await readFile(path.join(fixtureDirectory, fixture.fixture)))
      if (wave.channels !== 1 || wave.sampleRate !== ORACLE_VOICE_SAMPLE_RATE) {
        throw new Error(`${fixture.fixture} must be mono ${ORACLE_VOICE_SAMPLE_RATE} Hz PCM16`)
      }
      console.log(`[${profile.name}/${language}] ${fixture.fixture}`)
      rows.push(await benchmarkFixture(
        session,
        pid,
        ticksPerSecond,
        profile.name,
        fixture,
        wave,
        index + 1,
        config.tts.sampleRate,
      ))
    }
    return rows
  } finally {
    await engine.stop()
  }
}

async function benchmarkFixture(
  session: VoiceEngineSession,
  pid: number,
  ticksPerSecond: number,
  profileName: string,
  fixture: CorpusFixture,
  wave: WaveData,
  generation: number,
  ttsSampleRate: number,
): Promise<VoiceBenchmarkRow> {
  const streamId = `${profileName}-${fixture.language}`
  const utteranceId = `${generation}-${fixture.fixture}`
  const processStart = await readProcessSample(pid)
  let peakRssBytes = processStart?.rssBytes
  const rssTimer = setInterval(() => {
    void readProcessSample(pid).then((sample) => {
      if (sample) peakRssBytes = Math.max(peakRssBytes ?? 0, sample.rssBytes)
    })
  }, 20)
  rssTimer.unref?.()
  const wallStartedAt = performance.now()
  try {
    const stt = await measureStt(
      session,
      streamId,
      generation,
      utteranceId,
      fixture.language === 'und' ? 'en' : fixture.language,
      wave,
    )
    const ttsText = firstTtsSegment(fixture.expectedTranscript)
    const tts = ttsText.length > 0
      ? await measureTts(
          session,
          streamId,
          generation,
          `${generation}-tts`,
          ttsText,
          ttsSampleRate,
        )
      : undefined
    const processEnd = await readProcessSample(pid)
    if (processEnd) peakRssBytes = Math.max(peakRssBytes ?? 0, processEnd.rssBytes)
    const wallSeconds = Math.max((performance.now() - wallStartedAt) / 1_000, 0.001)
    const cpuPercent = processStart && processEnd
      ? (processEnd.cpuTicks - processStart.cpuTicks) / ticksPerSecond / wallSeconds * 100
      : undefined
    return {
      profile: profileName,
      fixture: fixture.fixture,
      language: fixture.language,
      transcript: stt.transcript,
      expectedTranscript: fixture.expectedTranscript,
      wer: measured(wordErrorRate(fixture.expectedTranscript, stt.transcript)),
      firstPartialMs: maybeMeasured(stt.firstPartialMs),
      finalAfterSpeechMs: measured(stt.finalAfterSpeechMs),
      sttRtf: measured(stt.elapsedMs / wave.durationMs),
      ttsFirstAudioMs: tts ? maybeMeasured(tts.firstAudioMs) : missing(),
      ttsRtf: tts ? maybeMeasured(tts.rtf) : missing(),
      peakRssMiB: peakRssBytes === undefined
        ? missing()
        : measured(peakRssBytes / 1_048_576),
      sustainedCpuPercent: cpuPercent === undefined ? missing() : measured(cpuPercent),
    }
  } finally {
    clearInterval(rssTimer)
  }
}

async function measureStt(
  session: VoiceEngineSession,
  streamId: string,
  generation: number,
  utteranceId: string,
  language: string,
  wave: WaveData,
): Promise<{
  transcript: string
  firstPartialMs?: number
  finalAfterSpeechMs: number
  elapsedMs: number
}> {
  const final = deferred<string>()
  let startedAt = 0
  let speechEndedAt: number | undefined
  let firstPartialMs: number | undefined
  let finalAt: number | undefined
  const unsubscribe = session.onEvent((event: VoiceEngineEvent) => {
    if (
      !('generation' in event)
      || event.streamId !== streamId
      || event.generation !== generation
    ) return
    if (event.type === 'partial') {
      firstPartialMs ??= performance.now() - startedAt
    } else if (event.type === 'final' && event.utteranceId === utteranceId) {
      finalAt = performance.now()
      final.resolve(event.text)
    } else if (event.type === 'fatal_error') {
      final.reject(new Error(event.message))
    }
  })
  try {
    startedAt = performance.now()
    await session.stt.start({ streamId, generation, utteranceId, language })
    for (let offset = 0, sequence = 0; offset < wave.samples.length; sequence += 1) {
      const end = Math.min(wave.samples.length, offset + FRAME_SAMPLES)
      await session.stt.accept({
        direction: 'microphone',
        streamId,
        generation,
        utteranceId,
        sequence,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        samples: wave.samples.subarray(offset, end),
      })
      offset = end
      if (finalAt !== undefined) break
    }
    speechEndedAt = performance.now()
    if (finalAt === undefined) {
      await session.stt.end({ streamId, generation, utteranceId })
    }
    const transcript = await final.promise
    const completedAt = finalAt ?? performance.now()
    return {
      transcript,
      firstPartialMs,
      finalAfterSpeechMs: Math.max(0, completedAt - speechEndedAt),
      elapsedMs: completedAt - startedAt,
    }
  } finally {
    unsubscribe()
  }
}

async function measureTts(
  session: VoiceEngineSession,
  streamId: string,
  generation: number,
  segmentId: string,
  text: string,
  sampleRate: number,
): Promise<{
  firstAudioMs?: number
  rtf?: number
}> {
  const audioEnd = deferred<void>()
  let startedAt = 0
  let firstAudioMs: number | undefined
  let sampleCount = 0
  const unsubscribe = session.onEvent((event: VoiceEngineEvent) => {
    if (
      !('generation' in event)
      || event.streamId !== streamId
      || event.generation !== generation
    ) return
    if (event.type === 'audio' && event.segmentId === segmentId) {
      if (event.sampleRate !== sampleRate) {
        audioEnd.reject(new Error('Voice benchmark TTS sample rate mismatch'))
        return
      }
      firstAudioMs ??= performance.now() - startedAt
      sampleCount += event.samples.length
    } else if (event.type === 'audio_end' && event.segmentId === segmentId) {
      audioEnd.resolve(undefined)
    } else if (event.type === 'fatal_error') {
      audioEnd.reject(new Error(event.message))
    }
  })
  try {
    startedAt = performance.now()
    await session.tts.synthesize({ streamId, generation, segmentId, text })
    await audioEnd.promise
    const elapsedMs = performance.now() - startedAt
    const audioDurationMs = sampleCount / sampleRate * 1_000
    return {
      firstAudioMs,
      rtf: audioDurationMs > 0 ? elapsedMs / audioDurationMs : undefined,
    }
  } finally {
    unsubscribe()
  }
}

async function buildConfig(
  profile: BenchmarkProfile,
  language: string,
  assets: TtsAssets,
): Promise<EnabledOracleVoiceConfig> {
  const configPath = path.join(assets.directory, `${assets.modelName}.json`)
  const tts: SherpaVitsVoiceConfig = {
    engine: 'sherpa-vits',
    model: path.join(assets.directory, assets.modelName),
    config: configPath,
    tokens: path.join(assets.directory, 'tokens.txt'),
    dataDir: path.join(assets.directory, 'espeak-ng-data'),
    sampleRate: await readPiperSampleRate(configPath),
  }
  return {
    enabled: true,
    language,
    threads: 2,
    endpointMs: 800,
    stt: {
      profile: profile.sttProfile,
      modelDirectory: profile.sttDirectory,
    },
    tts,
  }
}

function firstTtsSegment(text: string): string {
  if (text.trim().length === 0) return ''
  return new SpeakableSegmenter('benchmark', 160).finalize(text)[0] ?? ''
}

async function verifyCorpus(
  fixtureDirectory: string,
  manifest: CorpusManifest,
): Promise<void> {
  for (const fixture of manifest.fixtures) {
    const bytes = await readFile(path.join(fixtureDirectory, fixture.fixture))
    const digest = createHash('sha256').update(bytes).digest('hex')
    if (digest !== fixture.sha256) {
      throw new Error(`${fixture.fixture} checksum does not match manifest`)
    }
    const wave = parsePcm16Wave(bytes)
    if (wave.channels !== 1 || wave.sampleRate !== ORACLE_VOICE_SAMPLE_RATE) {
      throw new Error(`${fixture.fixture} is not mono ${ORACLE_VOICE_SAMPLE_RATE} Hz PCM16`)
    }
    if (Math.abs(wave.durationMs / 1_000 - fixture.durationSeconds) > 0.02) {
      throw new Error(`${fixture.fixture} duration does not match manifest`)
    }
    if (normalizeTranscript(fixture.expectedTranscript) !== fixture.normalizedTranscript) {
      throw new Error(`${fixture.fixture} normalized transcript does not match manifest`)
    }
  }
}

function parseManifest(value: unknown): CorpusManifest {
  if (!isRecord(value) || !Array.isArray(value.fixtures)) {
    throw new Error('Voice fixture manifest must contain a fixtures array')
  }
  return {
    fixtures: value.fixtures.map((fixture, index) => {
      if (!isRecord(fixture)) throw new Error(`Voice fixture ${index} must be an object`)
      const parsed: CorpusFixture = {
        fixture: requiredString(fixture, 'fixture'),
        language: requiredString(fixture, 'language'),
        expectedTranscript: requiredString(fixture, 'expectedTranscript', true),
        normalizedTranscript: requiredString(fixture, 'normalizedTranscript', true),
        durationSeconds: requiredNumber(fixture, 'durationSeconds'),
        sha256: requiredString(fixture, 'sha256'),
      }
      if (!/^[a-zA-Z0-9._-]+\.wav$/.test(parsed.fixture)) {
        throw new Error(`Voice fixture ${index} has an unsafe filename`)
      }
      if (!/^[a-f0-9]{64}$/.test(parsed.sha256)) {
        throw new Error(`Voice fixture ${index} has an invalid SHA-256 checksum`)
      }
      return parsed
    }),
  }
}

function parseCliOptions(args: string[]): CliOptions {
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index]
    const value = args[index + 1]
    if (!name?.startsWith('--') || value === undefined || value.startsWith('--')) {
      throw new Error(usage())
    }
    values.set(name, value)
  }
  const known = new Set([
    '--fast-stt-dir',
    '--multilingual-stt-dir',
    '--tts-en-dir',
    '--tts-pt-dir',
    '--output-json',
    '--output-markdown',
    '--fixtures',
  ])
  for (const name of values.keys()) {
    if (!known.has(name)) throw new Error(`Unknown option ${name}\n${usage()}`)
  }
  return {
    fastSttDirectory: resolvedOption(values, '--fast-stt-dir'),
    multilingualSttDirectory: resolvedOption(values, '--multilingual-stt-dir'),
    englishTtsDirectory: resolvedOption(values, '--tts-en-dir'),
    portugueseTtsDirectory: resolvedOption(values, '--tts-pt-dir'),
    outputJson: resolvedOption(values, '--output-json'),
    outputMarkdown: resolvedOption(values, '--output-markdown'),
    ...(values.has('--fixtures')
      ? {
          fixtureNames: new Set(
            values.get('--fixtures')!.split(',').map((value) => value.trim()).filter(Boolean),
          ),
        }
      : {}),
  }
}

function resolvedOption(values: ReadonlyMap<string, string>, name: string): string {
  const value = values.get(name)
  if (!value) throw new Error(`${name} is required\n${usage()}`)
  return path.resolve(value)
}

function usage(): string {
  return [
    'Usage: oracle-voice-benchmark.ts',
    '  --fast-stt-dir <directory>',
    '  --multilingual-stt-dir <directory>',
    '  --tts-en-dir <directory>',
    '  --tts-pt-dir <directory>',
    '  --output-json <file>',
    '  --output-markdown <file>',
    '  [--fixtures <comma-separated WAV names>]',
  ].join('\n')
}

async function clockTicksPerSecond(): Promise<number> {
  if (process.platform !== 'linux') return 100
  const { stdout } = await execFileAsync('getconf', ['CLK_TCK'])
  const ticks = Number(stdout.trim())
  return Number.isSafeInteger(ticks) && ticks > 0 ? ticks : 100
}

async function readProcessSample(pid: number): Promise<ProcessSample | undefined> {
  if (process.platform !== 'linux') return undefined
  try {
    const [statLine, status] = await Promise.all([
      readFile(`/proc/${pid}/stat`, 'utf8'),
      readFile(`/proc/${pid}/status`, 'utf8'),
    ])
    const afterCommand = statLine.slice(statLine.lastIndexOf(')') + 2).trim().split(/\s+/)
    const userTicks = Number(afterCommand[11])
    const systemTicks = Number(afterCommand[12])
    const rssMatch = /^VmRSS:\s+(\d+)\s+kB$/m.exec(status)
    if (!Number.isFinite(userTicks) || !Number.isFinite(systemTicks) || !rssMatch) {
      return undefined
    }
    return {
      cpuTicks: userTicks + systemTicks,
      rssBytes: Number(rssMatch[1]) * 1_024,
    }
  } catch {
    return undefined
  }
}

function measured(value: number): BenchmarkMetric {
  return { value, basis: 'measured' }
}

function derived(value: number): BenchmarkMetric {
  return { value, basis: 'derived' }
}

function missing(): BenchmarkMetric {
  return { value: null, basis: 'missing' }
}

function maybeMeasured(value: number | undefined): BenchmarkMetric {
  return value === undefined ? missing() : measured(value)
}

function formatMetric(metric: BenchmarkMetric): string {
  const suffix = metric.basis === 'measured'
    ? 'M'
    : metric.basis === 'derived'
      ? 'D'
      : 'X'
  return metric.value === null ? `— ${suffix}` : `${metric.value.toFixed(3)} ${suffix}`
}

function requiredString(
  value: Record<string, unknown>,
  name: string,
  allowEmpty = false,
): string {
  const candidate = value[name]
  if (
    typeof candidate !== 'string'
    || (!allowEmpty && candidate.length === 0)
  ) {
    throw new Error(`Voice fixture ${name} must be a string`)
  }
  return candidate
}

function requiredNumber(value: Record<string, unknown>, name: string): number {
  const candidate = value[name]
  if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate < 0) {
    throw new Error(`Voice fixture ${name} must be a non-negative number`)
  }
  return candidate
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function isMainModule(): boolean {
  return Boolean(process.argv[1])
    && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
}

if (isMainModule()) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
