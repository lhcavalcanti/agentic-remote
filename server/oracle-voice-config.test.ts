import {
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  readOracleVoiceConfig,
  type EnabledOracleVoiceConfig,
} from './oracle-voice-config.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ))
})

async function fixture() {
  const dataDirectory = await mkdtemp(path.join(tmpdir(), 'oracle-voice-config-'))
  directories.push(dataDirectory)
  await mkdir(path.join(dataDirectory, 'models', 'stt'), { recursive: true })
  await mkdir(path.join(dataDirectory, 'bin'), { recursive: true })
  await writeFile(path.join(dataDirectory, 'models', 'stt', 'encoder.onnx'), 'model')
  await writeFile(path.join(dataDirectory, 'bin', 'piper'), 'binary')
  await writeFile(path.join(dataDirectory, 'models', 'voice.onnx'), 'voice')
  await writeFile(path.join(dataDirectory, 'models', 'voice.json'), JSON.stringify({
    audio: {
      sample_rate: 22_050,
    },
  }))
  return dataDirectory
}

function enabledEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    AGENTIC_REMOTE_ORACLE_VOICE: 'on',
    AGENTIC_REMOTE_VOICE_COMPUTER: 'Speech node',
    AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: 'models/stt',
    AGENTIC_REMOTE_VOICE_STT_PROFILE: 'zipformer',
    AGENTIC_REMOTE_VOICE_LANGUAGE: 'en',
    AGENTIC_REMOTE_VOICE_THREADS: '4',
    AGENTIC_REMOTE_VOICE_ENDPOINT_MS: '900',
    AGENTIC_REMOTE_VOICE_TTS_BIN: 'bin/piper',
    AGENTIC_REMOTE_VOICE_TTS_MODEL: 'models/voice.onnx',
    AGENTIC_REMOTE_VOICE_TTS_CONFIG: 'models/voice.json',
    AGENTIC_REMOTE_VOICE_TTS_SPEAKER: '2',
    ...overrides,
  }
}

describe('readOracleVoiceConfig', () => {
  it.each([undefined, '', 'off', 'ON', 'true'])(
    'is disabled without the exact on value (%s)',
    async (flag) => {
      const env = enabledEnv({
        AGENTIC_REMOTE_ORACLE_VOICE: flag,
        AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: 'missing',
      })
      expect(await readOracleVoiceConfig('/does/not/exist', env)).toEqual({
        enabled: false,
      })
    },
  )

  it('returns canonical validated paths for enabled configuration', async () => {
    const dataDirectory = await fixture()

    const config = await readOracleVoiceConfig(dataDirectory, enabledEnv())

    expect(config).toEqual<EnabledOracleVoiceConfig>({
      enabled: true,
      computerName: 'Speech node',
      language: 'en',
      threads: 4,
      endpointMs: 900,
      stt: {
        profile: 'zipformer',
        modelDirectory: path.join(dataDirectory, 'models', 'stt'),
      },
      tts: {
        binary: path.join(dataDirectory, 'bin', 'piper'),
        model: path.join(dataDirectory, 'models', 'voice.onnx'),
        config: path.join(dataDirectory, 'models', 'voice.json'),
        sampleRate: 22_050,
        speaker: 2,
      },
    })
  })

  it.each([
    ['{}', 'audio.sample_rate'],
    [JSON.stringify({ audio: { sample_rate: 7_999 } }), 'from 8000 to 192000'],
    [JSON.stringify({ audio: { sample_rate: 192_001 } }), 'from 8000 to 192000'],
    ['not json', 'valid JSON'],
  ])('rejects an invalid Piper sample rate config', async (contents, message) => {
    const dataDirectory = await fixture()
    await writeFile(path.join(dataDirectory, 'models', 'voice.json'), contents)

    await expect(readOracleVoiceConfig(dataDirectory, enabledEnv()))
      .rejects.toThrow(message)
  })

  it('rejects a symlinked model file escaping the configured model directory', async () => {
    const dataDirectory = await fixture()
    const outside = path.join(dataDirectory, 'outside.onnx')
    await writeFile(outside, 'outside')
    await symlink(outside, path.join(dataDirectory, 'models', 'stt', 'decoder.onnx'))

    await expect(readOracleVoiceConfig(dataDirectory, enabledEnv()))
      .rejects.toThrow('must stay inside')
  })

  it.each([
    ['AGENTIC_REMOTE_VOICE_STT_PROFILE', 'unknown', 'zipformer or nemotron'],
    ['AGENTIC_REMOTE_VOICE_LANGUAGE', '', '1 to 35 printable characters'],
    ['AGENTIC_REMOTE_VOICE_LANGUAGE', 'en\n', '1 to 35 printable characters'],
    ['AGENTIC_REMOTE_VOICE_THREADS', '0', 'integer from 1 to 16'],
    ['AGENTIC_REMOTE_VOICE_THREADS', '17', 'integer from 1 to 16'],
    ['AGENTIC_REMOTE_VOICE_ENDPOINT_MS', '299', 'integer from 300 to 3000'],
    ['AGENTIC_REMOTE_VOICE_ENDPOINT_MS', '3001', 'integer from 300 to 3000'],
    ['AGENTIC_REMOTE_VOICE_TTS_SPEAKER', '-1', 'non-negative integer'],
    ['AGENTIC_REMOTE_VOICE_TTS_SPEAKER', '1.5', 'non-negative integer'],
  ])('rejects invalid %s values', async (name, value, message) => {
    const dataDirectory = await fixture()
    await expect(readOracleVoiceConfig(dataDirectory, enabledEnv({ [name]: value })))
      .rejects.toThrow(message)
  })

  it.each([
    ['AGENTIC_REMOTE_VOICE_STT_MODEL_DIR', 'models/voice.onnx', 'directory'],
    ['AGENTIC_REMOTE_VOICE_TTS_BIN', 'models/stt', 'regular file'],
    ['AGENTIC_REMOTE_VOICE_TTS_MODEL', 'models/stt', 'regular file'],
    ['AGENTIC_REMOTE_VOICE_TTS_CONFIG', 'models/stt', 'regular file'],
  ])('requires %s to have the expected type', async (name, value, message) => {
    const dataDirectory = await fixture()
    await expect(readOracleVoiceConfig(dataDirectory, enabledEnv({ [name]: value })))
      .rejects.toThrow(message)
  })
})
