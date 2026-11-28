import os from 'node:os'
import path from 'node:path'

export type TranscriptionEngineName = 'whisper' | 'parakeet'

export interface ParakeetConfig {
  /** As configured; the worker validates the model files. */
  modelDirectory: string
  threads: number
}

export type TranscriptionEngineConfig =
  | { engine: 'whisper' }
  | { engine: 'parakeet'; parakeet: ParakeetConfig }

/** The `voice-install` profile that installs the Parakeet model. */
export const PARAKEET_PROFILE_ID = 'parakeet-ultra'
export const PARAKEET_MODEL_NAME = 'sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8'

const MAX_DEFAULT_THREADS = 4

/** Where `agentic-remote voice-install parakeet-ultra` activates the model. */
export function installedParakeetModelDirectory(dataDirectory: string): string {
  return path.join(
    dataDirectory,
    'models',
    'oracle-voice',
    'active',
    PARAKEET_PROFILE_ID,
    PARAKEET_MODEL_NAME,
  )
}

/**
 * Reads the engine this computer transcribes with. Only the computer that
 * transcribes reads it, so a hub delegating elsewhere ignores its own value.
 */
export function readTranscriptionEngineConfig(
  env: NodeJS.ProcessEnv,
  dataDirectory: string,
  cpuCount: number = os.availableParallelism(),
): TranscriptionEngineConfig {
  const engine = env.AGENTIC_REMOTE_TRANSCRIPTION_ENGINE?.trim().toLowerCase() || 'whisper'
  if (engine === 'whisper') return { engine: 'whisper' }
  if (engine !== 'parakeet') {
    throw new Error('AGENTIC_REMOTE_TRANSCRIPTION_ENGINE must be whisper or parakeet')
  }
  const modelDirectory = env.AGENTIC_REMOTE_PARAKEET_MODEL_DIR?.trim()
  return {
    engine: 'parakeet',
    parakeet: {
      modelDirectory: modelDirectory
        ? path.resolve(dataDirectory, modelDirectory)
        : installedParakeetModelDirectory(dataDirectory),
      threads: parakeetThreads(env.AGENTIC_REMOTE_PARAKEET_THREADS, cpuCount),
    },
  }
}

function parakeetThreads(value: string | undefined, cpuCount: number): number {
  const configured = value?.trim()
  if (!configured) return Math.max(1, Math.min(MAX_DEFAULT_THREADS, cpuCount))
  const threads = /^\d+$/.test(configured) ? Number(configured) : Number.NaN
  if (!Number.isInteger(threads) || threads < 1 || threads > 16) {
    throw new Error('AGENTIC_REMOTE_PARAKEET_THREADS must be an integer from 1 to 16')
  }
  return threads
}
