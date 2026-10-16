import { readdir, realpath, stat } from 'node:fs/promises'
import path from 'node:path'

export type OracleVoiceSttProfile = 'zipformer' | 'nemotron'

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
  tts: {
    binary: string
    model: string
    config: string
    speaker?: number
  }
}

export type OracleVoiceConfig =
  | { enabled: false }
  | EnabledOracleVoiceConfig

export async function readOracleVoiceConfig(
  dataDirectory: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<OracleVoiceConfig> {
  if (env.AGENTIC_REMOTE_ORACLE_VOICE !== 'on') {
    return { enabled: false }
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

  const computerName = optionalValue(env, 'AGENTIC_REMOTE_VOICE_COMPUTER')
  const speakerValue = optionalValue(env, 'AGENTIC_REMOTE_VOICE_TTS_SPEAKER')
  return {
    enabled: true,
    ...(computerName ? { computerName } : {}),
    language,
    threads: boundedInteger(env, 'AGENTIC_REMOTE_VOICE_THREADS', 1, 16),
    endpointMs: boundedInteger(env, 'AGENTIC_REMOTE_VOICE_ENDPOINT_MS', 300, 3000),
    stt: {
      profile,
      modelDirectory,
    },
    tts: {
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
      config: await canonicalPath(
        dataDirectory,
        env,
        'AGENTIC_REMOTE_VOICE_TTS_CONFIG',
        'file',
      ),
      ...(speakerValue === undefined
        ? {}
        : { speaker: nonNegativeInteger('AGENTIC_REMOTE_VOICE_TTS_SPEAKER', speakerValue) }),
    },
  }
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
