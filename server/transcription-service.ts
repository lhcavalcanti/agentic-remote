import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
} from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { pipeline } from 'node:stream/promises'
import type { Readable } from 'node:stream'
import { promisify } from 'node:util'
import type { AudioTranscription } from '../shared/contracts.js'
import {
  PARAKEET_TRANSCRIPTION_TIMEOUT_MS,
  ParakeetSpeechEngine,
  type ParakeetDecoder,
} from './parakeet-transcription.js'
import type { TranscriptionEngineConfig } from './transcription-engine-config.js'

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024
export const MAX_AUDIO_DURATION_SECONDS = 15 * 60

const PROBE_TIMEOUT_MS = 30_000
const CONVERSION_TIMEOUT_MS = 90_000
/** Also covers waiting for an earlier Whisper run to finish. */
const WHISPER_TIMEOUT_MS = 10 * 60_000

/**
 * The longest one recording can take on the computer that transcribes it:
 * probing, conversion, a Parakeet attempt that reaches its deadline, and the
 * Whisper fallback after it.
 */
export const LONGEST_TRANSCRIPTION_MS =
  PROBE_TIMEOUT_MS
  + CONVERSION_TIMEOUT_MS
  + PARAKEET_TRANSCRIPTION_TIMEOUT_MS
  + WHISPER_TIMEOUT_MS

const execFileAsync = promisify(execFile)
const require = createRequire(import.meta.url)
const ffmpegStatic: unknown = require('ffmpeg-static')
const ffprobeStatic: unknown = require('ffprobe-static')
const packagedFfmpegPath = packagedBinary(ffmpegStatic)
const packagedFfprobePath = packagedBinary(ffprobeStatic, 'path')

/**
 * SHA-256 digests of the `ffmpeg-static`/`ffprobe-static` binaries this project
 * is pinned against, keyed by `${platform}-${arch}`. `pnpm test` recomputes
 * them from the resolved packages, so a dependency bump fails the suite with
 * the replacement values instead of a runtime 503.
 */
export const packagedMediaDigests: Record<
  string,
  { ffmpeg: string; ffprobe: string }
> = {
  'linux-x64': {
    ffmpeg: 'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99',
    ffprobe: 'e3624d8ff953c7e2f1f3e3ee24bfa64399bcb3bd5c302b2216d3f794b31bbbf6',
  },
}

export const packagedMediaPaths: {
  ffmpeg: string | undefined
  ffprobe: string | undefined
} = { ffmpeg: packagedFfmpegPath, ffprobe: packagedFfprobePath }
const genericMimeTypes = new Set(['', 'application/octet-stream'])
const supportedExtensions = new Set([
  '.aac',
  '.flac',
  '.m4a',
  '.mp3',
  '.mp4',
  '.ogg',
  '.wav',
  '.webm',
])

function packagedBinary(
  moduleValue: unknown,
  property?: string,
): string | undefined {
  const value =
    property &&
    typeof moduleValue === 'object' &&
    moduleValue !== null
      ? Reflect.get(moduleValue, property)
      : moduleValue
  return typeof value === 'string' ? value : undefined
}

async function sha256(filePath: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk)
  }
  return hash.digest('hex')
}

export class TranscriptionError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
    this.name = 'TranscriptionError'
  }
}

export interface AudioUpload {
  filename: string
  mimeType: string
  stream: Readable
  truncated: () => boolean
}

export interface TranscriptionService {
  initialize(): Promise<void>
  transcribe(
    upload: AudioUpload,
    signal?: AbortSignal,
  ): Promise<AudioTranscription>
  stop(): Promise<void>
}

interface CommandOptions {
  signal?: AbortSignal
  timeoutMs: number
}

interface CommandResult {
  stdout: string
  stderr: string
}

export type CommandRunner = (
  command: string,
  args: string[],
  options: CommandOptions,
) => Promise<CommandResult>

/** Metrics and fallbacks only; never audio or transcript text. */
export interface TranscriptionLogger {
  info(details: object, message: string): void
  warn(details: object, message: string): void
}

const silentLogger: TranscriptionLogger = {
  info: () => undefined,
  warn: () => undefined,
}

interface LocalTranscriptionOptions {
  dataDirectory: string
  ffmpegBinary?: string
  ffprobeBinary?: string
  whisperBinary?: string
  modelPath?: string
  threads?: number
  runCommand?: CommandRunner
  /** Whisper unless set; the Parakeet engine needs `parakeetWorker`. */
  engine?: TranscriptionEngineConfig
  parakeetWorker?: ParakeetDecoder
  logger?: TranscriptionLogger
}

async function defaultCommandRunner(
  command: string,
  args: string[],
  options: CommandOptions,
): Promise<CommandResult> {
  const result = await execFileAsync(command, args, {
    encoding: 'utf8',
    killSignal: 'SIGKILL',
    maxBuffer: 2 * 1024 * 1024,
    signal: options.signal,
    timeout: options.timeoutMs,
  })
  return {
    stdout: result.stdout,
    stderr: result.stderr,
  }
}

function configuredThreads(value: string | undefined): number {
  const parsed = Number.parseInt(value || '', 10)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 16 ? parsed : 3
}

export function localTranscriptionOptions(
  dataDirectory: string,
): LocalTranscriptionOptions {
  const home = process.env.HOME || process.cwd()
  return {
    dataDirectory,
    ffmpegBinary:
      process.env.AGENTIC_REMOTE_FFMPEG_BIN?.trim() ||
      packagedFfmpegPath ||
      '/usr/bin/ffmpeg',
    ffprobeBinary:
      process.env.AGENTIC_REMOTE_FFPROBE_BIN?.trim() ||
      packagedFfprobePath ||
      '/usr/bin/ffprobe',
    whisperBinary:
      process.env.AGENTIC_REMOTE_WHISPER_BIN?.trim() ||
      path.join(home, '.local/bin/whisper-cli'),
    modelPath:
      process.env.AGENTIC_REMOTE_WHISPER_MODEL?.trim() ||
      path.join(dataDirectory, 'models/ggml-small.bin'),
    threads: configuredThreads(process.env.AGENTIC_REMOTE_WHISPER_THREADS),
  }
}

export function supportsAudioUpload(filename: string, mimeType: string): boolean {
  const normalizedMimeType = mimeType.trim().toLowerCase()
  if (
    normalizedMimeType.startsWith('audio/') ||
    normalizedMimeType === 'video/mp4'
  ) {
    return true
  }
  return (
    genericMimeTypes.has(normalizedMimeType) &&
    supportedExtensions.has(path.extname(filename).toLowerCase())
  )
}

async function accessible(target: string, mode: number): Promise<boolean> {
  try {
    await access(target, mode)
    return true
  } catch {
    return false
  }
}

/** Waits for `turn`, or rejects once `signal` aborts. */
function untilAborted(turn: Promise<void>, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(signal.reason)
  return new Promise<void>((resolve, reject) => {
    const abort = () => reject(signal.reason)
    signal.addEventListener('abort', abort, { once: true })
    void turn.then(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    })
  })
}

function elapsedMs(started: number): number {
  return Math.round(performance.now() - started)
}

/** A transcript that reaches the caller is never empty. */
function spoken(transcript: string): string {
  const text = transcript.trim()
  if (!text) {
    throw new TranscriptionError('No speech was detected in the recording', 422)
  }
  return text
}

export class LocalTranscriptionService implements TranscriptionService {
  private readonly transcriptionDirectory: string
  private readonly ffmpegBinary: string
  private readonly ffprobeBinary: string
  private readonly whisperBinary: string
  private readonly modelPath: string
  private readonly threads: number
  private readonly runCommand: CommandRunner
  private readonly parakeet?: ParakeetSpeechEngine
  private readonly logger: TranscriptionLogger
  /** Parakeet takes one recording beside the active one; Whisper one at a time. */
  private readonly admissionLimit: number
  private readonly active = new Set<AbortController>()
  private whisperTurn: Promise<void> = Promise.resolve()
  private packagedMediaValidated = false

  constructor(options: LocalTranscriptionOptions) {
    if (options.engine?.engine === 'parakeet') {
      if (!options.parakeetWorker) {
        throw new Error('The Parakeet transcription engine needs a Parakeet worker')
      }
      this.parakeet = new ParakeetSpeechEngine(options.parakeetWorker)
    }
    this.admissionLimit = this.parakeet ? 2 : 1
    this.logger = options.logger ?? silentLogger
    this.transcriptionDirectory = path.join(
      options.dataDirectory,
      'tmp',
      'transcriptions',
    )
    this.ffmpegBinary = options.ffmpegBinary || '/usr/bin/ffmpeg'
    this.ffprobeBinary = options.ffprobeBinary || '/usr/bin/ffprobe'
    this.whisperBinary = options.whisperBinary || 'whisper-cli'
    this.modelPath = options.modelPath || path.join(
      options.dataDirectory,
      'models',
      'ggml-small.bin',
    )
    this.threads = options.threads ?? 3
    this.runCommand = options.runCommand || defaultCommandRunner
  }

  async initialize(): Promise<void> {
    await mkdir(this.transcriptionDirectory, { recursive: true, mode: 0o700 })
    const entries = await readdir(this.transcriptionDirectory, {
      withFileTypes: true,
    })
    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('job-'))
        .map((entry) =>
          rm(path.join(this.transcriptionDirectory, entry.name), {
            force: true,
            recursive: true,
          }),
        ),
    )
  }

  async transcribe(
    upload: AudioUpload,
    signal?: AbortSignal,
  ): Promise<AudioTranscription> {
    if (this.active.size >= this.admissionLimit) {
      throw new TranscriptionError(
        'Another audio recording is already being transcribed',
        429,
      )
    }
    if (!supportsAudioUpload(upload.filename, upload.mimeType)) {
      throw new TranscriptionError('Unsupported audio file type', 415)
    }

    const controller = new AbortController()
    this.active.add(controller)
    const abort = () => controller.abort(signal?.reason)
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) {
      abort()
    }
    let jobDirectory: string | undefined

    try {
      jobDirectory = await mkdtemp(
        path.join(this.transcriptionDirectory, 'job-'),
      )
      const inputPath = path.join(jobDirectory, 'input')
      const wavPath = path.join(jobDirectory, 'audio.wav')
      const outputPrefix = path.join(jobDirectory, 'transcript')
      // Whisper is required up front only when it is the engine.
      await this.assertRuntimeAvailable(!this.parakeet)
      await pipeline(
        upload.stream,
        createWriteStream(inputPath, { flags: 'wx', mode: 0o600 }),
        { signal: controller.signal },
      )
      if (upload.truncated()) {
        throw new TranscriptionError(
          `Audio files must be no larger than ${MAX_AUDIO_BYTES / 1024 / 1024} MB`,
          413,
        )
      }

      const durationSeconds = await this.probeDuration(
        inputPath,
        controller.signal,
      )
      if (durationSeconds > MAX_AUDIO_DURATION_SECONDS) {
        throw new TranscriptionError(
          `Audio recordings must be ${MAX_AUDIO_DURATION_SECONDS / 60} minutes or shorter`,
          413,
        )
      }

      await this.convertAudio(inputPath, wavPath, controller.signal)
      return this.parakeet
        ? await this.transcribeWithParakeet(
            this.parakeet,
            wavPath,
            outputPrefix,
            durationSeconds,
            controller.signal,
          )
        : await this.transcribeWithWhisper(
            wavPath,
            outputPrefix,
            durationSeconds,
            controller.signal,
          )
    } catch (error) {
      if (error instanceof TranscriptionError) {
        throw error
      }
      if (controller.signal.aborted) {
        throw new TranscriptionError('Audio transcription was cancelled', 499)
      }
      throw new TranscriptionError(
        error instanceof Error
          ? `Audio transcription failed: ${error.message}`
          : 'Audio transcription failed',
        500,
      )
    } finally {
      signal?.removeEventListener('abort', abort)
      this.active.delete(controller)
      if (jobDirectory) {
        await rm(jobDirectory, { force: true, recursive: true })
      }
    }
  }

  async stop(): Promise<void> {
    for (const controller of this.active) controller.abort()
  }

  private async transcribeWithParakeet(
    parakeet: ParakeetSpeechEngine,
    wavPath: string,
    outputPrefix: string,
    audioSeconds: number,
    signal: AbortSignal,
  ): Promise<AudioTranscription> {
    let reason: string
    try {
      return await this.measured({ engine: 'parakeet', audioSeconds }, signal, async () => ({
        transcript: spoken(await parakeet.transcribe(wavPath, signal)),
        durationSeconds: audioSeconds,
        engine: 'parakeet',
      }))
    } catch (error) {
      if (error instanceof TranscriptionError || signal.aborted) throw error
      reason = error instanceof Error && error.message ? error.message : 'Parakeet failed'
    }
    this.logger.warn(
      { engine: 'parakeet', fallback: 'whisper', reason },
      'Parakeet could not transcribe; falling back to Whisper',
    )
    const whisperProblem = await this.whisperUnavailableReason()
    if (whisperProblem) {
      throw new TranscriptionError(
        `Parakeet is unavailable (${reason}) and Whisper is unavailable (${whisperProblem})`,
        503,
      )
    }
    try {
      return await this.transcribeWithWhisper(wavPath, outputPrefix, audioSeconds, signal, true)
    } catch (error) {
      if (signal.aborted || (error instanceof TranscriptionError && error.statusCode === 422)) {
        throw error
      }
      throw new TranscriptionError(
        `Parakeet is unavailable (${reason}) and Whisper could not transcribe the audio`,
        503,
      )
    }
  }

  private async transcribeWithWhisper(
    wavPath: string,
    outputPrefix: string,
    audioSeconds: number,
    signal: AbortSignal,
    fallback = false,
  ): Promise<AudioTranscription> {
    const deadline = Date.now() + WHISPER_TIMEOUT_MS
    // A Parakeet computer admits two recordings, and both may fall back here.
    const previous = this.whisperTurn
    let finished = () => undefined as void
    const turn = new Promise<void>((resolve) => {
      finished = resolve
    })
    // The next run waits for this turn and the run before it, even if this
    // recording is cancelled while waiting.
    this.whisperTurn = previous.then(() => turn)
    try {
      return await this.measured(
        { engine: 'whisper', audioSeconds, ...(fallback ? { fallback: true } : {}) },
        signal,
        async () => {
          await untilAborted(previous, signal)
          await this.runWhisper(wavPath, outputPrefix, signal, deadline - Date.now())
          const transcript = await readFile(`${outputPrefix}.txt`, 'utf8')
          return { transcript: spoken(transcript), durationSeconds: audioSeconds, engine: 'whisper' }
        },
      )
    } finally {
      finished()
    }
  }

  /** Logs how one engine attempt went: never audio or text, only its timing and outcome. */
  private async measured<T>(
    details: { engine: 'whisper' | 'parakeet'; audioSeconds: number; fallback?: true },
    signal: AbortSignal,
    attempt: () => Promise<T>,
  ): Promise<T> {
    const started = performance.now()
    let outcome = 'failed'
    try {
      const result = await attempt()
      outcome = 'transcribed'
      return result
    } catch (error) {
      if (signal.aborted) outcome = 'cancelled'
      else if (error instanceof TranscriptionError && error.statusCode === 422) outcome = 'no-speech'
      throw error
    } finally {
      this.logger.info(
        { ...details, decodeMs: elapsedMs(started), outcome },
        'Transcription engine finished',
      )
    }
  }

  private async whisperUnavailableReason(): Promise<string | undefined> {
    if (!(await accessible(this.whisperBinary, constants.X_OK))) return 'missing whisper-cli'
    if (!(await accessible(this.modelPath, constants.R_OK))) return 'missing Whisper model'
    return undefined
  }

  private async assertRuntimeAvailable(includeWhisper: boolean): Promise<void> {
    const requirements: Array<[string, string, number]> = [
      ['FFmpeg', this.ffmpegBinary, constants.X_OK],
      ['FFprobe', this.ffprobeBinary, constants.X_OK],
      ...(includeWhisper
        ? [
            ['Whisper', this.whisperBinary, constants.X_OK],
            ['Whisper model', this.modelPath, constants.R_OK],
          ] as Array<[string, string, number]>
        : []),
    ]
    for (const [name, target, mode] of requirements) {
      try {
        await access(target, mode)
      } catch {
        throw new TranscriptionError(
          `${name} is not installed or readable on the Agentic Remote hub`,
          503,
        )
      }
    }
    await this.assertPackagedMediaIntegrity()
  }

  private async assertPackagedMediaIntegrity(): Promise<void> {
    if (this.packagedMediaValidated) {
      return
    }
    const usesPackagedFfmpeg = this.ffmpegBinary === packagedFfmpegPath
    const usesPackagedFfprobe = this.ffprobeBinary === packagedFfprobePath
    if (!usesPackagedFfmpeg && !usesPackagedFfprobe) {
      this.packagedMediaValidated = true
      return
    }
    const expected = packagedMediaDigests[`${process.platform}-${process.arch}`]
    if (!expected) {
      throw new TranscriptionError(
        'Packaged media binaries are not verified for this platform',
        503,
      )
    }
    const checks: Array<Promise<boolean>> = []
    if (usesPackagedFfmpeg) {
      checks.push(
        sha256(this.ffmpegBinary).then((digest) => digest === expected.ffmpeg),
      )
    }
    if (usesPackagedFfprobe) {
      checks.push(
        sha256(this.ffprobeBinary).then((digest) => digest === expected.ffprobe),
      )
    }
    if ((await Promise.all(checks)).some((valid) => !valid)) {
      throw new TranscriptionError(
        'Packaged media binary integrity verification failed',
        503,
      )
    }
    this.packagedMediaValidated = true
  }

  private async probeDuration(
    inputPath: string,
    signal: AbortSignal,
  ): Promise<number> {
    let result: CommandResult
    try {
      result = await this.runCommand(
        this.ffprobeBinary,
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          inputPath,
        ],
        { signal, timeoutMs: PROBE_TIMEOUT_MS },
      )
    } catch (error) {
      if (signal.aborted) {
        throw error
      }
      throw new TranscriptionError(
        'The audio duration could not be determined',
        422,
      )
    }
    const duration = Number.parseFloat(result.stdout.trim())
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new TranscriptionError(
        'The audio duration could not be determined',
        422,
      )
    }
    return duration
  }

  private async convertAudio(
    inputPath: string,
    wavPath: string,
    signal: AbortSignal,
  ): Promise<void> {
    try {
      await this.runCommand(
        this.ffmpegBinary,
        [
          '-nostdin',
          '-v',
          'error',
          '-i',
          inputPath,
          '-vn',
          '-ac',
          '1',
          '-ar',
          '16000',
          '-c:a',
          'pcm_s16le',
          wavPath,
        ],
        { signal, timeoutMs: CONVERSION_TIMEOUT_MS },
      )
    } catch (error) {
      if (signal.aborted) {
        throw error
      }
      throw new TranscriptionError(
        'The audio file could not be decoded',
        422,
      )
    }
  }

  private async runWhisper(
    wavPath: string,
    outputPrefix: string,
    signal: AbortSignal,
    timeoutMs: number,
  ): Promise<void> {
    try {
      if (timeoutMs <= 0) throw new Error('Whisper did not start before its deadline')
      await this.runCommand(
        this.whisperBinary,
        [
          '--model',
          this.modelPath,
          '--file',
          wavPath,
          '--language',
          'auto',
          '--threads',
          String(this.threads),
          '--no-timestamps',
          '--output-txt',
          '--output-file',
          outputPrefix,
        ],
        { signal, timeoutMs },
      )
    } catch (error) {
      if (signal.aborted) {
        throw error
      }
      throw new TranscriptionError('Whisper could not transcribe the audio', 500)
    }
  }
}
