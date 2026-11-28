import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'

const directories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })))
})

async function fixtureDirectory(): Promise<string> {
  const parent = path.join(process.cwd(), '.agentic-remote')
  await mkdir(parent, { recursive: true })
  const directory = await mkdtemp(path.join(parent, 'transcription-app-test-'))
  directories.push(directory)
  return directory
}

/** One second of 16 kHz mono PCM16 silence. */
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

/** Stand-ins for ffprobe, ffmpeg, and whisper-cli that answer like the real tools. */
async function fakeMediaTools(root: string): Promise<void> {
  const bin = path.join(root, 'bin')
  await mkdir(bin)
  const wave = path.join(root, 'converted.wav')
  await writeFile(wave, convertedWave())
  const scripts = {
    ffprobe: '#!/bin/sh\necho 1.0\n',
    ffmpeg: `#!/bin/sh\nfor last; do :; done\ncp '${wave}' "$last"\n`,
    'whisper-cli': [
      '#!/bin/sh',
      'while [ "$#" -gt 0 ]; do',
      '  if [ "$1" = --output-file ]; then printf "Whisper fallback transcript\\n" >"$2.txt"; fi',
      '  shift',
      'done',
      '',
    ].join('\n'),
  }
  for (const [name, script] of Object.entries(scripts)) {
    await writeFile(path.join(bin, name), script)
    await chmod(path.join(bin, name), 0o700)
  }
  await writeFile(path.join(root, 'ggml-small.bin'), 'model')
  vi.stubEnv('AGENTIC_REMOTE_FFPROBE_BIN', path.join(bin, 'ffprobe'))
  vi.stubEnv('AGENTIC_REMOTE_FFMPEG_BIN', path.join(bin, 'ffmpeg'))
  vi.stubEnv('AGENTIC_REMOTE_WHISPER_BIN', path.join(bin, 'whisper-cli'))
  vi.stubEnv('AGENTIC_REMOTE_WHISPER_MODEL', path.join(root, 'ggml-small.bin'))
}

function recording(): { headers: Record<string, string>; payload: Buffer } {
  const boundary = 'transcription-app-boundary'
  return {
    headers: {
      host: 'hub.example.test',
      origin: 'https://hub.example.test',
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    payload: Buffer.from([
      `--${boundary}`,
      'Content-Disposition: form-data; name="audio"; filename="note.webm"',
      'Content-Type: audio/webm',
      '',
      'recorded audio',
      `--${boundary}--`,
      '',
    ].join('\r\n')),
  }
}

describe('transcription engine wiring', () => {
  it('refuses to start with an unknown transcription engine', async () => {
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_ENGINE', 'gpu')
    const dataDirectory = await fixtureDirectory()

    await expect(buildApp({ dataDirectory, logger: false, managerAgent: false }))
      .rejects.toThrow('AGENTIC_REMOTE_TRANSCRIPTION_ENGINE must be whisper or parakeet')
  })

  it('keeps Whisper without a Parakeet worker by default', async () => {
    const dataDirectory = await fixtureDirectory()
    const runtime = await buildApp({ dataDirectory, logger: false, managerAgent: false })
    try {
      expect(runtime.transcriptionEngine).toEqual({ config: { engine: 'whisper' } })
    } finally {
      await runtime.app.close()
    }
  })

  it('serves recordings through Whisper when the Parakeet model is missing', async () => {
    const root = await fixtureDirectory()
    await fakeMediaTools(root)
    const modelDirectory = path.join(root, 'parakeet')
    await mkdir(modelDirectory)
    await mkdir(path.join(root, 'data'))
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_ENGINE', 'parakeet')
    vi.stubEnv('AGENTIC_REMOTE_PARAKEET_MODEL_DIR', modelDirectory)
    vi.stubEnv('AGENTIC_REMOTE_PARAKEET_THREADS', '1')
    const runtime = await buildApp({
      dataDirectory: path.join(root, 'data'),
      logger: false,
      managerAgent: false,
    })
    try {
      expect(runtime.transcriptionEngine.config).toEqual({
        engine: 'parakeet',
        parakeet: { modelDirectory, threads: 1 },
      })
      const response = await runtime.app.inject({
        method: 'POST',
        url: '/api/transcriptions',
        ...recording(),
      })

      expect(response.statusCode, response.body).toBe(200)
      expect(response.json()).toEqual({
        transcript: 'Whisper fallback transcript',
        durationSeconds: 1,
        engine: 'whisper',
      })
      expect(runtime.transcriptionEngine.worker?.state).toBe('failed')
    } finally {
      await runtime.app.close()
    }
    expect(runtime.transcriptionEngine.worker?.pid).toBeUndefined()
  })
})
