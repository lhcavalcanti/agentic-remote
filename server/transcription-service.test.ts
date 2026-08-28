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
import {
  LocalTranscriptionService,
  MAX_AUDIO_DURATION_SECONDS,
  supportsAudioUpload,
  type CommandRunner,
} from './transcription-service.js'

const directories: string[] = []

async function fixture(
  runCommand?: CommandRunner,
): Promise<{
  dataDirectory: string
  service: LocalTranscriptionService
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
  await Promise.all([
    writeFile(ffmpegBinary, ''),
    writeFile(ffprobeBinary, ''),
    writeFile(whisperBinary, ''),
    writeFile(modelPath, 'model'),
  ])
  await Promise.all([
    chmod(ffmpegBinary, constants.S_IRUSR | constants.S_IWUSR | constants.S_IXUSR),
    chmod(ffprobeBinary, constants.S_IRUSR | constants.S_IWUSR | constants.S_IXUSR),
    chmod(whisperBinary, constants.S_IRUSR | constants.S_IWUSR | constants.S_IXUSR),
  ])

  const runner: CommandRunner =
    runCommand ||
    (async (command, args) => {
      if (command === ffprobeBinary) {
        return { stdout: '42.5\n', stderr: '' }
      }
      if (command === ffmpegBinary) {
        await writeFile(args.at(-1)!, 'wav')
        return { stdout: '', stderr: '' }
      }
      const outputIndex = args.indexOf('--output-file')
      await writeFile(`${args[outputIndex + 1]}.txt`, 'Walking note transcript\n')
      return { stdout: '', stderr: '' }
    })

  const service = new LocalTranscriptionService({
    dataDirectory,
    ffmpegBinary,
    ffprobeBinary,
    whisperBinary,
    modelPath,
    runCommand: runner,
  })
  await service.initialize()
  return { dataDirectory, service }
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
    const { service } = await fixture(async (command) => {
      if (path.basename(command) === 'ffprobe') {
        return {
          stdout: String(MAX_AUDIO_DURATION_SECONDS + 1),
          stderr: '',
        }
      }
      throw new Error('Unexpected command')
    })

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
