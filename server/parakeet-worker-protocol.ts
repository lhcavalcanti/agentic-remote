import type { ParakeetConfig } from './transcription-engine-config.js'

export const PARAKEET_SAMPLE_RATE = 16_000
export const PARAKEET_HEARTBEAT_INTERVAL_MS = 5_000

export interface ParakeetDecodeResult {
  text: string
  /** SentencePiece pieces; a leading space starts a word. */
  tokens: string[]
  /** Seconds from the start of the decoded window, one per token. */
  timestamps: number[]
  /** Seconds, one per token, in multiples of the model's 80 ms frame. */
  durations: number[]
}

export interface ParakeetDecodeRequest {
  type: 'decode'
  id: number
  samples: Float32Array
}

export type ParakeetParentMessage = ParakeetDecodeRequest

export type ParakeetChildMessage =
  | { type: 'ready' }
  | { type: 'failed'; message: string }
  | { type: 'heartbeat' }
  | { type: 'result'; id: number; result: ParakeetDecodeResult }
  | { type: 'error'; id: number; message: string }

/** The child reads its configuration from its arguments, so nothing races startup. */
export function parakeetChildArguments(config: ParakeetConfig): string[] {
  return [JSON.stringify({
    modelDirectory: config.modelDirectory,
    threads: config.threads,
  })]
}

export function readParakeetChildArguments(args: readonly string[]): ParakeetConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(args[0] ?? '')
  } catch {
    parsed = undefined
  }
  if (
    !isRecord(parsed)
    || !exactKeys(parsed, ['modelDirectory', 'threads'])
    || typeof parsed.modelDirectory !== 'string'
    || parsed.modelDirectory.length === 0
    || !Number.isInteger(parsed.threads)
    || Number(parsed.threads) < 1
    || Number(parsed.threads) > 16
  ) {
    throw new Error('worker arguments are invalid')
  }
  return { modelDirectory: parsed.modelDirectory, threads: Number(parsed.threads) }
}

export function isParakeetDecodeRequest(value: unknown): value is ParakeetDecodeRequest {
  return isRecord(value)
    && value.type === 'decode'
    && exactKeys(value, ['type', 'id', 'samples'])
    && isRequestId(value.id)
    && value.samples instanceof Float32Array
}

export function isParakeetChildMessage(value: unknown): value is ParakeetChildMessage {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  switch (value.type) {
    case 'ready':
    case 'heartbeat':
      return exactKeys(value, ['type'])
    case 'failed':
      return exactKeys(value, ['type', 'message']) && typeof value.message === 'string'
    case 'error':
      return exactKeys(value, ['type', 'id', 'message'])
        && isRequestId(value.id)
        && typeof value.message === 'string'
    case 'result':
      return exactKeys(value, ['type', 'id', 'result'])
        && isRequestId(value.id)
        && isDecodeResult(value.result)
    default:
      return false
  }
}

function isDecodeResult(value: unknown): value is ParakeetDecodeResult {
  return isRecord(value)
    && exactKeys(value, ['text', 'tokens', 'timestamps', 'durations'])
    && typeof value.text === 'string'
    && Array.isArray(value.tokens)
    && value.tokens.every((token) => typeof token === 'string')
    && isNumberList(value.timestamps)
    && isNumberList(value.durations)
}

function isNumberList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isFinite(item))
}

function isRequestId(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(value)
  return keys.length === expected.length && expected.every((key) => key in value)
}
