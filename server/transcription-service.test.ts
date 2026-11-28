import { constants } from 'node:fs'
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ParakeetDecoder } from './parakeet-transcription.js'
import {
  ParakeetTimeoutError,
  ParakeetUnavailableError,
  type ParakeetDecodeResult,
} from './parakeet-worker.js'
import { PARAKEET_TRANSCRIPTION_TIMEOUT_MS } from './parakeet-transcription.js'
import { TRANSCRIPTION_TIMEOUT_MS } from './remote-node-client.js'
import {
  LocalTranscriptionService,
  LONGEST_TRANSCRIPTION_MS,
  MAX_AUDIO_DURATION_SECONDS,
  supportsAudioUpload,
  type CommandRunner,
  type TranscriptionLogger,
} from './transcription-service.js'

const directories: string[] = []

/** One second of 16 kHz mono PCM16, as ffmpeg writes it. */
function convertedWave(): Buffer {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0, 'ascii')
  header.writeUInt32LE(36 + 32_000, 4)
  header.write('WAVEfmt ', 8, 'ascii')
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(16_000, 24)
  header.writeUInt32LE(32_000, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36, 'ascii')
  header.writeUInt32LE(32_000, 40)
  return Buffer.concat([header, Buffer.alloc(32_000)])
}

interface FixtureOptions {
  runCommand?: CommandRunner
  whisper?: CommandRunner
  parakeet?: ParakeetDecoder
  whisperInstalled?: boolean
  logger?: TranscriptionLogger
}

async function fixture(
  options: FixtureOptions = {},
): Promise<{
  dataDirectory: string
  service: LocalTranscriptionService
  commands: string[]
}> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'transcription-test-'))
  directories.push(root)
  const dataDirectory = path.join(root, 'data')
  const binaryDirectory = path.join(root, 'bin')
  const modelPath = path.join(root, 'ggml-small.bin')
  await mkdir(binaryDirectory, { recursive: true })
  const ffmpegBinary = path.join(binaryDirectory, 'ffmpeg')
  const ffprobeBinary = path.join(binaryDirectory, 'ffprobe')
  const whisperBinary = path.join(binaryDirectory, 'whisper-cli')
  const whisperInstalled = options.whisperInstalled ?? true
  const executables = whisperInstalled
    ? [ffmpegBinary, ffprobeBinary, whisperBinary]
    : [ffmpegBinary, ffprobeBinary]
  await Promise.all([
    ...executables.map((file) => writeFile(file, '')),
    ...(whisperInstalled ? [writeFile(modelPath, 'model')] : []),
  ])
  await Promise.all(executables.map((file) =>
    chmod(file, constants.S_IRUSR | constants.S_IWUSR | constants.S_IXUSR)))

  const commands: string[] = []
  const whisper: CommandRunner = options.whisper ?? (async (_command, args) => {
    const outputIndex = args.indexOf('--output-file')
    await writeFile(`${args[outputIndex + 1]}.txt`, 'Walking note transcript\n')
    return { stdout: '', stderr: '' }
  })
  const runner: CommandRunner =
    options.runCommand ||
    (async (command, args, commandOptions) => {
      commands.push(path.basename(command))
      if (command === ffprobeBinary) {
        return { stdout: '42.5\n', stderr: '' }
      }
      if (command === ffmpegBinary) {
        await writeFile(args.at(-1)!, convertedWave())
        return { stdout: '', stderr: '' }
      }
      return whisper(command, args, commandOptions)
    })

  const service = new LocalTranscriptionService({
    dataDirectory,
    ffmpegBinary,
    ffprobeBinary,
    whisperBinary,
    modelPath,
    runCommand: runner,
    ...(options.parakeet
      ? {
          engine: {
            engine: 'parakeet' as const,
            parakeet: { modelDirectory: path.join(root, 'parakeet'), threads: 4 },
          },
          parakeetWorker: options.parakeet,
        }
      : {}),
    ...(options.logger ? { logger: options.logger } : {}),
  })
  await service.initialize()
  return { dataDirectory, service, commands }
}

function recording(name = 'idea.m4a') {
  return {
    filename: name,
    mimeType: 'audio/x-m4a',
    stream: Readable.from('audio data'),
    truncated: () => false,
  }
}

function decoded(text: string): ParakeetDecodeResult {
  return { text, tokens: [], timestamps: [], durations: [] }
}

function parakeet(
  decode: ParakeetDecoder['decode'],
): ParakeetDecoder & { decode: ReturnType<typeof vi.fn> } {
  return { decode: vi.fn(decode) }
}

function recordingLogger(): TranscriptionLogger & { lines: unknown[][] } {
  const lines: unknown[][] = []
  return {
    lines,
    info: vi.fn((...line: unknown[]) => { lines.push(['info', ...line]) }),
    warn: vi.fn((...line: unknown[]) => { lines.push(['warn', ...line]) }),
  }
}

async function jobsLeft(dataDirectory: string): Promise<string[]> {
  return readdir(path.join(dataDirectory, 'tmp', 'transcriptions'))
}

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  )
})

describe('LocalTranscriptionService', () => {
  it('transcribes supported audio and removes temporary files', async () => {
    const { dataDirectory, service } = await fixture()

    await expect(
      service.transcribe({
        filename: 'idea.m4a',
        mimeType: 'audio/x-m4a',
        stream: Readable.from('audio data'),
        truncated: () => false,
      }),
    ).resolves.toEqual({
      transcript: 'Walking note transcript',
      durationSeconds: 42.5,
      engine: 'whisper',
    })

    const jobs = await readdir(
      path.join(dataDirectory, 'tmp', 'transcriptions'),
    )
    expect(jobs).toEqual([])
  })

  it('rejects and cleans up truncated uploads', async () => {
    const { dataDirectory, service } = await fixture()

    await expect(
      service.transcribe({
        filename: 'idea.mp3',
        mimeType: 'audio/mpeg',
        stream: Readable.from('partial audio'),
        truncated: () => true,
      }),
    ).rejects.toMatchObject({ statusCode: 413 })

    expect(
      await readdir(path.join(dataDirectory, 'tmp', 'transcriptions')),
    ).toEqual([])
  })

  it('rejects recordings longer than the configured limit', async () => {
    const { service } = await fixture({ runCommand: async (command) => {
      if (path.basename(command) === 'ffprobe') {
        return {
          stdout: String(MAX_AUDIO_DURATION_SECONDS + 1),
          stderr: '',
        }
      }
      throw new Error('Unexpected command')
    } })

    await expect(
      service.transcribe({
        filename: 'long.wav',
        mimeType: 'audio/wav',
        stream: Readable.from('audio'),
        truncated: () => false,
      }),
    ).rejects.toMatchObject({ statusCode: 413 })
  })

  it('removes orphaned job directories during initialization', async () => {
    const { dataDirectory, service } = await fixture()
    const orphan = path.join(
      dataDirectory,
      'tmp',
      'transcriptions',
      'job-orphan',
    )
    await mkdir(orphan)
    await writeFile(path.join(orphan, 'input'), 'old audio')

    await service.initialize()

    await expect(readFile(path.join(orphan, 'input'))).rejects.toThrow()
  })
})

describe('LocalTranscriptionService engines', () => {
  it('keeps Whisper to one recording at a time', async () => {
    let release: (() => void) | undefined
    const { service } = await fixture({ whisper: async (_command, args) => {
      await new Promise<void>((resolve) => { release = resolve })
      await writeFile(`${args[args.indexOf('--output-file') + 1]}.txt`, 'first\n')
      return { stdout: '', stderr: '' }
    } })

    const first = service.transcribe(recording())
    await vi.waitFor(() => expect(release).toBeDefined())
    await expect(service.transcribe(recording())).rejects.toMatchObject({ statusCode: 429 })
    release?.()
    await expect(first).resolves.toMatchObject({ transcript: 'first', engine: 'whisper' })
  })

  it('transcribes with Parakeet without needing Whisper', async () => {
    const engine = parakeet(async () => decoded(' Parakeet transcript '))
    const logger = recordingLogger()
    const { dataDirectory, service, commands } = await fixture({
      parakeet: engine,
      whisperInstalled: false,
      logger,
    })

    await expect(service.transcribe(recording())).resolves.toEqual({
      transcript: 'Parakeet transcript',
      durationSeconds: 42.5,
      engine: 'parakeet',
    })

    expect(engine.decode).toHaveBeenCalledOnce()
    expect(engine.decode.mock.calls[0][0]).toHaveLength(16_000)
    expect(commands).toEqual(['ffprobe', 'ffmpeg'])
    expect(logger.info).toHaveBeenCalledWith(
      {
        engine: 'parakeet',
        audioSeconds: 42.5,
        decodeMs: expect.any(Number),
        outcome: 'transcribed',
      },
      'Transcription engine finished',
    )
    expect(JSON.stringify(logger.lines)).not.toContain('Parakeet transcript')
    expect(await jobsLeft(dataDirectory)).toEqual([])
  })

  it('admits one Parakeet recording beside the active one and refuses a third', async () => {
    const releases: Array<() => void> = []
    const engine = parakeet(async () => {
      await new Promise<void>((resolve) => { releases.push(resolve) })
      return decoded('queued fine')
    })
    const { dataDirectory, service } = await fixture({ parakeet: engine })

    const first = service.transcribe(recording())
    const second = service.transcribe(recording())
    await vi.waitFor(() => expect(releases).toHaveLength(2))
    await expect(service.transcribe(recording())).rejects.toMatchObject({
      statusCode: 429,
      message: 'Another audio recording is already being transcribed',
    })
    for (const release of releases) release()

    await expect(Promise.all([first, second])).resolves.toMatchObject([
      { transcript: 'queued fine', engine: 'parakeet' },
      { transcript: 'queued fine', engine: 'parakeet' },
    ])
    expect(await jobsLeft(dataDirectory)).toEqual([])
  })

  it.each([
    ['unavailable', new ParakeetUnavailableError('worker exited (SIGSEGV)')],
    ['timed out', new ParakeetTimeoutError('decode timed out after 600 s')],
  ])('falls back to Whisper when Parakeet is %s', async (_label, failure) => {
    const logger = recordingLogger()
    const { dataDirectory, service, commands } = await fixture({
      parakeet: parakeet(async () => { throw failure }),
      logger,
    })

    await expect(service.transcribe(recording())).resolves.toEqual({
      transcript: 'Walking note transcript',
      durationSeconds: 42.5,
      engine: 'whisper',
    })

    expect(commands).toEqual(['ffprobe', 'ffmpeg', 'whisper-cli'])
    expect(logger.warn).toHaveBeenCalledWith(
      { engine: 'parakeet', fallback: 'whisper', reason: failure.message },
      'Parakeet could not transcribe; falling back to Whisper',
    )
    expect(logger.info).toHaveBeenCalledWith(
      {
        engine: 'parakeet',
        audioSeconds: 42.5,
        decodeMs: expect.any(Number),
        outcome: 'failed',
      },
      'Transcription engine finished',
    )
    expect(logger.info).toHaveBeenCalledWith(
      {
        engine: 'whisper',
        audioSeconds: 42.5,
        decodeMs: expect.any(Number),
        fallback: true,
        outcome: 'transcribed',
      },
      'Transcription engine finished',
    )
    expect(JSON.stringify(logger.lines)).not.toContain('Walking note transcript')
    expect(await jobsLeft(dataDirectory)).toEqual([])
  })

  it('names both engines when neither can transcribe', async () => {
    const { dataDirectory, service } = await fixture({
      parakeet: parakeet(async () => { throw new ParakeetUnavailableError('worker exited (SIGSEGV)') }),
      whisperInstalled: false,
    })

    await expect(service.transcribe(recording())).rejects.toMatchObject({
      statusCode: 503,
      message:
        'Parakeet is unavailable (worker exited (SIGSEGV)) and Whisper is unavailable (missing whisper-cli)',
    })
    expect(await jobsLeft(dataDirectory)).toEqual([])
  })

  it('names both engines when the Whisper fallback fails', async () => {
    const { dataDirectory, service } = await fixture({
      parakeet: parakeet(async () => { throw new ParakeetTimeoutError('decode timed out after 600 s') }),
      whisper: async () => { throw new Error('exit code 1') },
    })

    await expect(service.transcribe(recording())).rejects.toMatchObject({
      statusCode: 503,
      message:
        'Parakeet is unavailable (decode timed out after 600 s) and Whisper could not transcribe the audio',
    })
    expect(await jobsLeft(dataDirectory)).toEqual([])
  })

  it('reports no speech instead of an empty Parakeet transcript', async () => {
    const { dataDirectory, service, commands } = await fixture({
      parakeet: parakeet(async () => decoded('  ')),
    })

    await expect(service.transcribe(recording())).rejects.toMatchObject({
      statusCode: 422,
      message: 'No speech was detected in the recording',
    })
    expect(commands).not.toContain('whisper-cli')
    expect(await jobsLeft(dataDirectory)).toEqual([])
  })

  it('cancels a Parakeet recording without falling back', async () => {
    const controller = new AbortController()
    const { dataDirectory, service, commands } = await fixture({
      parakeet: parakeet(async (_samples, { signal }) => {
        controller.abort()
        throw signal?.reason
      }),
    })

    await expect(service.transcribe(recording(), controller.signal))
      .rejects.toMatchObject({ statusCode: 499 })
    expect(commands).not.toContain('whisper-cli')
    expect(await jobsLeft(dataDirectory)).toEqual([])
  })

  it('records the engine, duration, and decode time when Whisper fails', async () => {
    const logger = recordingLogger()
    const { service } = await fixture({
      whisper: async () => { throw new Error('exit code 1') },
      logger,
    })

    await expect(service.transcribe(recording())).rejects.toMatchObject({ statusCode: 500 })

    expect(logger.info).toHaveBeenCalledWith(
      {
        engine: 'whisper',
        audioSeconds: 42.5,
        decodeMs: expect.any(Number),
        outcome: 'failed',
      },
      'Transcription engine finished',
    )
  })

  it('stops waiting for its Whisper turn when its recording is cancelled', async () => {
    let releaseFirst: (() => void) | undefined
    const whisperRuns: string[] = []
    const logger = recordingLogger()
    const { dataDirectory, service } = await fixture({
      parakeet: parakeet(async () => { throw new ParakeetUnavailableError('worker is stopped') }),
      whisper: async (_command, args) => {
        whisperRuns.push('run')
        await new Promise<void>((resolve) => { releaseFirst = resolve })
        await writeFile(`${args[args.indexOf('--output-file') + 1]}.txt`, 'first\n')
        return { stdout: '', stderr: '' }
      },
      logger,
    })
    const first = service.transcribe(recording())
    await vi.waitFor(() => expect(releaseFirst).toBeDefined())
    const controller = new AbortController()
    const waiting = service.transcribe(recording(), controller.signal)
    // The second recording has fallen back and queues behind the first Whisper run.
    await vi.waitFor(() => expect(logger.warn).toHaveBeenCalledTimes(2))
    await new Promise((resolve) => setTimeout(resolve, 50))

    controller.abort()

    await expect(waiting).rejects.toMatchObject({ statusCode: 499 })
    expect(await jobsLeft(dataDirectory)).toHaveLength(1)
    expect(whisperRuns).toHaveLength(1)
    releaseFirst?.()
    await expect(first).resolves.toMatchObject({ transcript: 'first' })
  })

  it('gives a Whisper fallback what remains of its deadline after waiting its turn', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      const start = new Date('2026-11-28T04:00:00Z')
      vi.setSystemTime(start)
      const deadlines: number[] = []
      let releaseFirst: (() => void) | undefined
      const { service } = await fixture({
        parakeet: parakeet(async () => { throw new ParakeetUnavailableError('worker is stopped') }),
        whisper: async (_command, args, options) => {
          deadlines.push(options.timeoutMs)
          if (deadlines.length === 1) {
            await new Promise<void>((resolve) => { releaseFirst = resolve })
          }
          await writeFile(`${args[args.indexOf('--output-file') + 1]}.txt`, 'fallback\n')
          return { stdout: '', stderr: '' }
        },
      })

      const first = service.transcribe(recording())
      // vi.waitFor would move the faked clock; poll on real timers instead.
      while (!releaseFirst) await new Promise((resolve) => setTimeout(resolve, 5))
      const second = service.transcribe(recording())
      await new Promise((resolve) => setTimeout(resolve, 50))
      vi.setSystemTime(start.getTime() + 120_000)
      releaseFirst?.()
      await Promise.all([first, second])

      expect(deadlines).toEqual([600_000, 480_000])
    } finally {
      vi.useRealTimers()
    }
  })

  it('outwaits the slowest recording on the computer that transcribes from the hub', () => {
    expect(LONGEST_TRANSCRIPTION_MS).toBeGreaterThanOrEqual(PARAKEET_TRANSCRIPTION_TIMEOUT_MS + 600_000)
    expect(TRANSCRIPTION_TIMEOUT_MS).toBeGreaterThan(LONGEST_TRANSCRIPTION_MS)
  })

  it('runs Whisper fallbacks one at a time', async () => {
    let running = 0
    let most = 0
    const { service } = await fixture({
      parakeet: parakeet(async () => { throw new ParakeetUnavailableError('worker is stopped') }),
      whisper: async (_command, args) => {
        running += 1
        most = Math.max(most, running)
        await new Promise((resolve) => setTimeout(resolve, 20))
        await writeFile(`${args[args.indexOf('--output-file') + 1]}.txt`, 'fallback\n')
        running -= 1
        return { stdout: '', stderr: '' }
      },
    })

    await expect(Promise.all([
      service.transcribe(recording()),
      service.transcribe(recording()),
    ])).resolves.toHaveLength(2)
    expect(most).toBe(1)
  })
})

describe('supportsAudioUpload', () => {
  it('accepts iOS and generic MIME types with known extensions', () => {
    expect(supportsAudioUpload('Voice Memo.m4a', 'audio/x-m4a')).toBe(true)
    expect(
      supportsAudioUpload('Voice Memo.m4a', 'application/octet-stream'),
    ).toBe(true)
    expect(supportsAudioUpload('Voice Memo.m4a', '')).toBe(true)
  })

  it('rejects non-audio uploads', () => {
    expect(supportsAudioUpload('payload.js', 'application/octet-stream')).toBe(
      false,
    )
    expect(supportsAudioUpload('payload.js', 'text/javascript')).toBe(false)
  })
})
