import {
  ORACLE_VOICE_SAMPLE_RATE,
  VoiceProtocolError,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
} from './oracle-voice.js'

/**
 * Live dictation: the browser streams microphone PCM to the transcription
 * computer and gets text back while the user speaks. Nothing it carries is
 * submitted to Oracle or spoken, and nothing is stored.
 */
export const DICTATION_PROTOCOL = 1 as const

export const DICTATION_LIMITS = {
  sampleRate: 16_000,
  /** 100 ms frames are 3,200 bytes of PCM; anything over this is fatal. */
  maxFrameBytes: 32 * 1024,
  maxDurationMs: 900_000,
  /** 12 s of 16 kHz PCM16 waiting at the session or in a relay. */
  maxBacklogBytes: 384_000,
  heartbeatMs: 5_000,
  stallMs: 15_000,
  finalTimeoutMs: 30_000,
} as const

/** How long the browser waits for `ready` or `final`, past the server's own limit. */
export const DICTATION_CLIENT_TIMEOUT_MS = 35_000
export const DICTATION_MAX_CLIENT_MESSAGE_BYTES = 4 * 1024
export const DICTATION_MAX_TEXT_BYTES = 64 * 1024
/** Audio frames reuse the Oracle voice codec with one fixed generation. */
export const DICTATION_AUDIO_GENERATION = 1

export type DictationErrorCode =
  | 'busy'
  | 'unavailable'
  | 'protocol'
  | 'frame_too_large'
  | 'backpressure'
  | 'stalled'
  | 'engine_failed'
  | 'final_timeout'
  | 'node_offline'
  | 'node_outdated'

export type DictationFinalReason = 'stop' | 'duration_limit'

export type DictationClientMessage =
  | { protocol: typeof DICTATION_PROTOCOL; type: 'start'; streamId: string }
  | { protocol: typeof DICTATION_PROTOCOL; type: 'stop' }
  | { protocol: typeof DICTATION_PROTOCOL; type: 'cancel' }
  | { protocol: typeof DICTATION_PROTOCOL; type: 'heartbeat' }

export type DictationServerMessage =
  | { protocol: typeof DICTATION_PROTOCOL; type: 'ready' }
  | {
      protocol: typeof DICTATION_PROTOCOL
      type: 'text'
      seq: number
      committedAppend: string
      tentative: string
    }
  | {
      protocol: typeof DICTATION_PROTOCOL
      type: 'final'
      text: string
      reason?: DictationFinalReason
    }
  | {
      protocol: typeof DICTATION_PROTOCOL
      type: 'error'
      code: DictationErrorCode
      message: string
      fatal: boolean
    }
  | { protocol: typeof DICTATION_PROTOCOL; type: 'heartbeat' }

export interface DictationCapabilities {
  live: boolean
  reason?: string
  computerName: string
}

export class DictationProtocolError extends Error {
  readonly code: Extract<DictationErrorCode, 'protocol' | 'frame_too_large'>

  constructor(message: string, code: Extract<DictationErrorCode, 'protocol' | 'frame_too_large'> = 'protocol') {
    super(message)
    this.name = 'DictationProtocolError'
    this.code = code
  }
}

const ERROR_CODES: ReadonlySet<string> = new Set<DictationErrorCode>([
  'busy',
  'unavailable',
  'protocol',
  'frame_too_large',
  'backpressure',
  'stalled',
  'engine_failed',
  'final_timeout',
  'node_offline',
  'node_outdated',
])
const STREAM_ID = /^[A-Za-z0-9_-]{1,64}$/
// The longest valid server message is a few text fields of 64 KiB each; the
// raw bound only keeps a hostile payload from being parsed at all.
const MAX_SERVER_MESSAGE_CHARACTERS = 4 * DICTATION_MAX_TEXT_BYTES
const UTF8 = new TextEncoder()

export function parseDictationClientMessage(raw: string): DictationClientMessage {
  if (exceedsUtf8Bytes(raw, DICTATION_MAX_CLIENT_MESSAGE_BYTES)) {
    throw new DictationProtocolError('Dictation control message is too large')
  }
  const value = parseRecord(raw)
  switch (value.type) {
    case 'start':
      requireKeys(value, ['protocol', 'type', 'streamId'])
      if (typeof value.streamId !== 'string' || !STREAM_ID.test(value.streamId)) {
        throw new DictationProtocolError('Dictation stream IDs are 1 to 64 letters, digits, - or _')
      }
      return { protocol: DICTATION_PROTOCOL, type: 'start', streamId: value.streamId }
    case 'stop':
    case 'cancel':
    case 'heartbeat':
      requireKeys(value, ['protocol', 'type'])
      return { protocol: DICTATION_PROTOCOL, type: value.type }
    default:
      throw new DictationProtocolError('Unknown dictation control message')
  }
}

export function parseDictationServerMessage(raw: string): DictationServerMessage {
  if (raw.length > MAX_SERVER_MESSAGE_CHARACTERS) {
    throw new DictationProtocolError('Dictation message is too large')
  }
  const value = parseRecord(raw)
  switch (value.type) {
    case 'ready':
    case 'heartbeat':
      requireKeys(value, ['protocol', 'type'])
      return { protocol: DICTATION_PROTOCOL, type: value.type }
    case 'text':
      requireKeys(value, ['protocol', 'type', 'seq', 'committedAppend', 'tentative'])
      if (!Number.isSafeInteger(value.seq) || (value.seq as number) < 0) {
        throw new DictationProtocolError('Dictation text needs a sequence number')
      }
      return {
        protocol: DICTATION_PROTOCOL,
        type: 'text',
        seq: value.seq as number,
        committedAppend: boundedText(value.committedAppend),
        tentative: boundedText(value.tentative),
      }
    case 'final': {
      requireKeys(value, ['protocol', 'type', 'text'], ['reason'])
      const text = boundedText(value.text)
      if (value.reason === undefined) return { protocol: DICTATION_PROTOCOL, type: 'final', text }
      if (value.reason !== 'stop' && value.reason !== 'duration_limit') {
        throw new DictationProtocolError('Unknown dictation final reason')
      }
      return { protocol: DICTATION_PROTOCOL, type: 'final', text, reason: value.reason }
    }
    case 'error':
      requireKeys(value, ['protocol', 'type', 'code', 'message', 'fatal'])
      if (typeof value.code !== 'string' || !ERROR_CODES.has(value.code)) {
        throw new DictationProtocolError('Unknown dictation error code')
      }
      if (typeof value.fatal !== 'boolean') {
        throw new DictationProtocolError('Dictation errors say whether they are fatal')
      }
      return {
        protocol: DICTATION_PROTOCOL,
        type: 'error',
        code: value.code as DictationErrorCode,
        message: boundedText(value.message),
        fatal: value.fatal,
      }
    default:
      throw new DictationProtocolError('Unknown dictation message')
  }
}

/** One 16 kHz microphone frame, numbered from 1 within its stream. */
export function encodeDictationAudioFrame(sequence: number, samples: Int16Array): ArrayBuffer {
  return encodeVoiceAudioFrame({
    direction: 'microphone',
    generation: DICTATION_AUDIO_GENERATION,
    sequence,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    samples,
  })
}

/** Decodes a frame that must be exactly the next one in its stream. */
export function readDictationAudioFrame(payload: ArrayBuffer, expectedSequence: number): Int16Array {
  if (payload.byteLength > DICTATION_LIMITS.maxFrameBytes) {
    throw new DictationProtocolError('Dictation audio frame is too large', 'frame_too_large')
  }
  let frame
  try {
    frame = decodeVoiceAudioFrame(payload)
  } catch (error) {
    if (error instanceof VoiceProtocolError) throw new DictationProtocolError(error.message)
    throw error
  }
  if (frame.direction !== 'microphone') {
    throw new DictationProtocolError('Dictation accepts microphone audio only')
  }
  if (frame.generation !== DICTATION_AUDIO_GENERATION) {
    throw new DictationProtocolError('Dictation audio has the wrong generation')
  }
  if (frame.sequence !== expectedSequence) {
    throw new DictationProtocolError(
      `Dictation audio frame ${frame.sequence} arrived where ${expectedSequence} was expected`,
    )
  }
  return frame.samples
}

function parseRecord(raw: string): Record<string, unknown> {
  let value: unknown
  try {
    value = JSON.parse(raw) as unknown
  } catch {
    throw new DictationProtocolError('Dictation message is not valid JSON')
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new DictationProtocolError('Dictation message must be an object')
  }
  const record = value as Record<string, unknown>
  if (record.protocol !== DICTATION_PROTOCOL) {
    throw new DictationProtocolError('Unsupported dictation protocol')
  }
  return record
}

function requireKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional])
  if (
    !required.every((key) => Object.hasOwn(value, key))
    || !Object.keys(value).every((key) => allowed.has(key))
  ) {
    throw new DictationProtocolError(`Malformed dictation ${String(value.type)} message`)
  }
}

function boundedText(value: unknown): string {
  if (typeof value !== 'string') throw new DictationProtocolError('Dictation text must be a string')
  if (exceedsUtf8Bytes(value, DICTATION_MAX_TEXT_BYTES)) {
    throw new DictationProtocolError('Dictation text is too long')
  }
  return value
}

function exceedsUtf8Bytes(value: string, limit: number): boolean {
  // A UTF-16 unit is one to three UTF-8 bytes, so most strings need no encoding.
  if (value.length > limit) return true
  if (value.length * 3 <= limit) return false
  return UTF8.encode(value).byteLength > limit
}
