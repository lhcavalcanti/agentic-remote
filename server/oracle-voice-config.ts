import { readFile, readdir, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import {
  ORACLE_VOICE_MAX_PCM_SAMPLE_RATE,
  ORACLE_VOICE_MIN_PCM_SAMPLE_RATE,
  isVoicePlaybackSampleRate,
} from '../shared/oracle-voice.js'

const MAX_ESPEAK_DATA_DIRECTORY_BYTES = 251

export type OracleVoiceSttProfile = 'zipformer' | 'nemotron'

export interface ExternalPiperVoiceConfig {
  binary: string
  model: string
  config: string
  sampleRate: number
  speaker?: number
}

export interface SherpaVitsVoiceConfig {
  engine: 'sherpa-vits'
  model: string
  config: string
  tokens: string
  dataDir: string
  sampleRate: number
  speaker?: number
}

export interface EnabledOracleVoiceConfig {
  enabled: true
  computerName?: string
  language: string
  threads: number
  endpointMs: number
  stt: {
    profile: OracleVoiceSttProfile
    modelDirectory: string
  }
  tts: ExternalPiperVoiceConfig | SherpaVitsVoiceConfig
}

export interface RemoteOracleVoiceConfig {
  enabled: true
  computerName: string
}

export type OracleVoiceConfig =
  | { enabled: false }
  | EnabledOracleVoiceConfig
  | RemoteOracleVoiceConfig

export interface ReadOracleVoiceConfigOptions {
  requireLocal?: boolean
}

export function readOracleVoiceSelection(
  env: NodeJS.ProcessEnv = process.env,
): { enabled: false } | { enabled: true; computerName?: string } {
  if (env.AGENTIC_REMOTE_ORACLE_VOICE !== 'on') {
    return { enabled: false }
  }
  const computerName = optionalValue(env, 'AGENTIC_REMOTE_VOICE_COMPUTER')
  return {
    enabled: true,
    ...(computerName ? { computerName } : {}),
  }
}

export async function readOracleVoiceConfig(
  dataDirectory: string,
  env: NodeJS.ProcessEnv = process.env,
  options: ReadOracleVoiceConfigOptions = {},
): Promise<OracleVoiceConfig> {
  const selection = readOracleVoiceSelection(env)
  if (!selection.enabled) return selection
  if (options.requireLocal === false && selection.computerName) {
    return { enabled: true, computerName: selection.computerName }
  }

  const profile = requiredValue(env, 'AGENTIC_REMOTE_VOICE_STT_PROFILE')
  if (profile !== 'zipformer' && profile !== 'nemotron') {
    throw new Error('AGENTIC_REMOTE_VOICE_STT_PROFILE must be zipformer or nemotron')
  }
  const language = env.AGENTIC_REMOTE_VOICE_LANGUAGE ?? ''
  if (!/^[\x20-\x7e]{1,35}$/.test(language)) {
    throw new Error('AGENTIC_REMOTE_VOICE_LANGUAGE must contain 1 to 35 printable characters')
  }

  const modelDirectory = await canonicalPath(
    dataDirectory,
    env,
    'AGENTIC_REMOTE_VOICE_STT_MODEL_DIR',
    'directory',
  )
  await validateModelDirectory(modelDirectory)

  const speakerValue = optionalValue(env, 'AGENTIC_REMOTE_VOICE_TTS_SPEAKER')
  const ttsConfig = await canonicalPath(
    dataDirectory,
    env,
    'AGENTIC_REMOTE_VOICE_TTS_CONFIG',
    'file',
  )
  const speaker = speakerValue === undefined
    ? {}
    : { speaker: nonNegativeInteger('AGENTIC_REMOTE_VOICE_TTS_SPEAKER', speakerValue) }
  const tts = env.AGENTIC_REMOTE_VOICE_TTS_ENGINE === 'sherpa-vits'
    ? {
        engine: 'sherpa-vits' as const,
        model: await canonicalPath(
          dataDirectory,
          env,
          'AGENTIC_REMOTE_VOICE_TTS_MODEL',
          'file',
        ),
        config: ttsConfig,
        tokens: await canonicalPath(
          dataDirectory,
          env,
          'AGENTIC_REMOTE_VOICE_TTS_TOKENS',
          'file',
        ),
        dataDir: await espeakDataDirectory(dataDirectory, env),
        sampleRate: await readPiperSampleRate(ttsConfig),
        ...speaker,
      }
    : {
        binary: await canonicalPath(
          dataDirectory,
          env,
          'AGENTIC_REMOTE_VOICE_TTS_BIN',
          'file',
        ),
        model: await canonicalPath(
          dataDirectory,
          env,
          'AGENTIC_REMOTE_VOICE_TTS_MODEL',
          'file',
        ),
        config: ttsConfig,
        sampleRate: await readPiperSampleRate(ttsConfig),
        ...speaker,
      }
  return {
    enabled: true,
    ...(selection.computerName ? { computerName: selection.computerName } : {}),
    language,
    threads: boundedInteger(env, 'AGENTIC_REMOTE_VOICE_THREADS', 1, 16),
    endpointMs: boundedInteger(env, 'AGENTIC_REMOTE_VOICE_ENDPOINT_MS', 300, 3000),
    stt: {
      profile,
      modelDirectory,
    },
    tts,
  }
}

async function espeakDataDirectory(
  dataDirectory: string,
  env: NodeJS.ProcessEnv,
): Promise<string> {
  const directory = await canonicalPath(
    dataDirectory,
    env,
    'AGENTIC_REMOTE_VOICE_TTS_DATA_DIR',
    'directory',
  )
  if (Buffer.byteLength(directory) > MAX_ESPEAK_DATA_DIRECTORY_BYTES) {
    throw new Error(
      'AGENTIC_REMOTE_VOICE_TTS_DATA_DIR path must not exceed '
      + `${MAX_ESPEAK_DATA_DIRECTORY_BYTES} bytes`,
    )
  }
  return directory
}

export async function readPiperSampleRate(configPath: string): Promise<number> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await readFile(configPath, 'utf8')) as unknown
  } catch {
    throw new Error('Piper TTS config must contain valid JSON')
  }
  const sampleRate = isRecord(parsed) && isRecord(parsed.audio)
    ? parsed.audio.sample_rate
    : undefined
  if (!isVoicePlaybackSampleRate(sampleRate)) {
    throw new Error(
      'Piper TTS config audio.sample_rate must be an integer from '
      + `${ORACLE_VOICE_MIN_PCM_SAMPLE_RATE} to ${ORACLE_VOICE_MAX_PCM_SAMPLE_RATE}`,
    )
  }
  return sampleRate
}

function requiredValue(env: NodeJS.ProcessEnv, name: string): string {
  const value = optionalValue(env, name)
  if (value === undefined) {
    throw new Error(`${name} is required when Oracle voice is enabled`)
  }
  return value
}

function optionalValue(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name]?.trim()
  return value || undefined
}

function boundedInteger(
  env: NodeJS.ProcessEnv,
  name: string,
  minimum: number,
  maximum: number,
): number {
  const value = requiredValue(env, name)
  const parsed = parseInteger(value)
  if (parsed === undefined || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`)
  }
  return parsed
}

function nonNegativeInteger(name: string, value: string): number {
  const parsed = parseInteger(value)
  if (parsed === undefined) {
    throw new Error(`${name} must be a non-negative integer`)
  }
  return parsed
}

function parseInteger(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : undefined
}

async function canonicalPath(
  dataDirectory: string,
  env: NodeJS.ProcessEnv,
  name: string,
  expected: 'directory' | 'file',
): Promise<string> {
  const configured = requiredValue(env, name)
  const candidate = path.resolve(dataDirectory, configured)
  let canonical: string
  try {
    canonical = await realpath(candidate)
  } catch {
    throw new Error(`${name} does not exist: ${candidate}`)
  }
  const metadata = await stat(canonical)
  if (expected === 'directory' ? !metadata.isDirectory() : !metadata.isFile()) {
    throw new Error(`${name} must be a ${expected === 'directory' ? 'directory' : 'regular file'}`)
  }
  return canonical
}

async function validateModelDirectory(root: string): Promise<void> {
  const visited = new Set<string>()
  const pending = [root]
  while (pending.length > 0) {
    const directory = pending.pop()!
    if (visited.has(directory)) continue
    visited.add(directory)
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name)
      const canonical = await realpath(candidate)
      if (!isInside(root, canonical)) {
        throw new Error(`Voice STT model path must stay inside ${root}: ${candidate}`)
      }
      const metadata = await stat(canonical)
      if (metadata.isDirectory()) {
        pending.push(canonical)
      } else if (!metadata.isFile()) {
        throw new Error(`Voice STT model path must be a regular file or directory: ${candidate}`)
      }
    }
  }
}

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate)
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
