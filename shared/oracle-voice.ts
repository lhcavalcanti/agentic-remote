import type { ManagerClientDefaults } from './manager.js'

export const ORACLE_VOICE_PROTOCOL = 2 as const
export const ORACLE_VOICE_SAMPLE_RATE = 16_000 as const
export const ORACLE_VOICE_MIN_PCM_SAMPLE_RATE = 8_000
export const ORACLE_VOICE_MAX_PCM_SAMPLE_RATE = 192_000
export const ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS = 12
export const VOICE_AUDIO_HEADER_BYTES = 24

const MAGIC = [0x41, 0x52, 0x56, 0x43] as const
const UTF8_ENCODER = new TextEncoder()
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true })

export type VoiceAudioDirection = 'microphone' | 'playback'

interface VoiceAudioIdentity {
  generation: number
  sequence: number
  sampleCount: number
}

export type VoiceAudioHeader = VoiceAudioIdentity & (
  | {
      direction: 'microphone'
      sampleRate: typeof ORACLE_VOICE_SAMPLE_RATE
    }
  | {
      direction: 'playback'
      segmentId: string
      sampleRate: number
    }
)

export type VoiceAudioFrame =
  | (Omit<VoiceAudioIdentity, 'sampleCount'> & {
      direction: 'microphone'
      sampleRate: typeof ORACLE_VOICE_SAMPLE_RATE
      samples: Int16Array
    })
  | (Omit<VoiceAudioIdentity, 'sampleCount'> & {
      direction: 'playback'
      segmentId: string
      sampleRate: number
      samples: Int16Array
    })

export interface VoiceCapabilities {
  protocol: typeof ORACLE_VOICE_PROTOCOL
  available: boolean
  computerId: string
  computerName: string
  sampleRate: typeof ORACLE_VOICE_SAMPLE_RATE
  playbackSampleRate: number
  languages: string[]
  sttProfile: string
  ttsVoice: string
  resourceClass: 'low' | 'quality'
  limits: {
    maxFrameBytes: number
    maxQueueBytes: number
    maxUtteranceMs: number
  }
  reason?: string
}

interface VoiceControlBase {
  protocol: typeof ORACLE_VOICE_PROTOCOL
  streamId: string
  generation: number
}

export type VoiceClientControl =
  | (VoiceControlBase & {
    type: 'start'
    generation: number
    language: string
    defaults: ManagerClientDefaults
    answerOnly: boolean
  })
  | (VoiceControlBase & {
    type: 'speech_tentative'
    generation: number
  })
  | (VoiceControlBase & {
    type: 'speech_confirmed'
    generation: number
    utteranceId: string
  })
  | (VoiceControlBase & {
    type: 'speech_end'
    generation: number
    utteranceId: string
  })
  | (VoiceControlBase & {
    type: 'stop'
    generation: number
    reason?: string
  })
  | (VoiceControlBase & {
    type: 'synthesize'
    generation: number
    segmentId: string
    text: string
  })
  | (VoiceControlBase & {
    type: 'cancel'
    generation: number
  })
  | (VoiceControlBase & {
    type: 'heartbeat'
    timestamp: number
  })

export type VoiceServerControl =
  | (VoiceControlBase & {
    type: 'hello'
    capabilities: VoiceCapabilities
  })
  | (VoiceControlBase & {
    type: 'partial' | 'final'
    generation: number
    utteranceId: string
    text: string
  })
  | (VoiceControlBase & {
    type: 'state'
    generation: number
    state: 'ready' | 'listening' | 'recognizing' | 'thinking' | 'speaking' | 'stopped'
  })
  | (VoiceControlBase & {
    type: 'audio_end'
    generation: number
    segmentId: string
  })
  | (VoiceControlBase & {
    type: 'error'
    code: string
    message: string
    fatal: boolean
  })
  | (VoiceControlBase & {
    type: 'heartbeat'
    timestamp: number
  })

export class VoiceProtocolError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VoiceProtocolError'
  }
}

export function encodeVoiceAudioFrame(frame: VoiceAudioFrame): ArrayBuffer {
  validateDirection(frame.direction)
  validateUint32(frame.generation, 'generation')
  validateUint32(frame.sequence, 'sequence')
  validateSampleRate(frame.direction, frame.sampleRate)
  if (!(frame.samples instanceof Int16Array)) {
    throw new VoiceProtocolError('samples must be an Int16Array')
  }
  const segmentId = playbackSegmentIdBytes(frame)

  const payload = new ArrayBuffer(
    VOICE_AUDIO_HEADER_BYTES + segmentId.byteLength + frame.samples.length * 2,
  )
  const view = new DataView(payload)
  MAGIC.forEach((byte, index) => view.setUint8(index, byte))
  view.setUint8(4, ORACLE_VOICE_PROTOCOL)
  view.setUint8(5, frame.direction === 'microphone' ? 0 : 1)
  view.setUint16(6, segmentId.byteLength, true)
  view.setUint32(8, frame.generation, true)
  view.setUint32(12, frame.sequence, true)
  view.setUint32(16, frame.sampleRate, true)
  view.setUint32(20, frame.samples.length, true)
  new Uint8Array(payload, VOICE_AUDIO_HEADER_BYTES, segmentId.byteLength)
    .set(segmentId)
  const samplesOffset = VOICE_AUDIO_HEADER_BYTES + segmentId.byteLength
  for (let index = 0; index < frame.samples.length; index += 1) {
    view.setInt16(samplesOffset + index * 2, frame.samples[index], true)
  }
  return payload
}

export function voiceAudioFrameByteLength(frame: VoiceAudioFrame): number {
  if (!(frame.samples instanceof Int16Array)) {
    throw new VoiceProtocolError('samples must be an Int16Array')
  }
  return VOICE_AUDIO_HEADER_BYTES
    + playbackSegmentIdBytes(frame).byteLength
    + frame.samples.byteLength
}

export function decodeVoiceAudioFrame(payload: ArrayBuffer): VoiceAudioFrame {
  if (!(payload instanceof ArrayBuffer) || payload.byteLength < VOICE_AUDIO_HEADER_BYTES) {
    throw new VoiceProtocolError('audio frame is shorter than its header')
  }

  const view = new DataView(payload)
  for (let index = 0; index < MAGIC.length; index += 1) {
    if (view.getUint8(index) !== MAGIC[index]) {
      throw new VoiceProtocolError('invalid audio frame magic')
    }
  }
  if (view.getUint8(4) !== ORACLE_VOICE_PROTOCOL) {
    throw new VoiceProtocolError('unsupported audio protocol version')
  }
  const directionByte = view.getUint8(5)
  if (directionByte !== 0 && directionByte !== 1) {
    throw new VoiceProtocolError('invalid audio direction')
  }
  const segmentIdByteLength = view.getUint16(6, true)
  const generation = view.getUint32(8, true)
  const sequence = view.getUint32(12, true)
  const sampleRate = view.getUint32(16, true)
  const sampleCount = view.getUint32(20, true)
  const direction = directionByte === 0 ? 'microphone' : 'playback'
  if (direction === 'microphone' && segmentIdByteLength !== 0) {
    throw new VoiceProtocolError('microphone audio must not include a segment ID')
  }
  if (direction === 'playback' && segmentIdByteLength === 0) {
    throw new VoiceProtocolError('playback audio requires a segment ID')
  }
  validateSampleRate(direction, sampleRate)
  if (sampleCount > (Number.MAX_SAFE_INTEGER - VOICE_AUDIO_HEADER_BYTES) / 2) {
    throw new VoiceProtocolError('audio sample count is too large')
  }
  if (
    payload.byteLength
    !== VOICE_AUDIO_HEADER_BYTES + segmentIdByteLength + sampleCount * 2
  ) {
    throw new VoiceProtocolError('audio frame length does not match its sample count')
  }

  const samplesOffset = VOICE_AUDIO_HEADER_BYTES + segmentIdByteLength
  const samples = new Int16Array(sampleCount)
  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] = view.getInt16(samplesOffset + index * 2, true)
  }
  if (direction === 'microphone') {
    return {
      direction,
      generation,
      sequence,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples,
    }
  }
  let segmentId: string
  try {
    segmentId = UTF8_DECODER.decode(
      new Uint8Array(payload, VOICE_AUDIO_HEADER_BYTES, segmentIdByteLength),
    )
  } catch {
    throw new VoiceProtocolError('playback segment ID must be valid UTF-8')
  }
  if (segmentId.length === 0) {
    throw new VoiceProtocolError('playback audio requires a segment ID')
  }
  return {
    direction,
    generation,
    segmentId,
    sequence,
    sampleRate,
    samples,
  }
}

function playbackSegmentIdBytes(frame: VoiceAudioFrame): Uint8Array {
  if (frame.direction === 'microphone') return new Uint8Array()
  if (typeof frame.segmentId !== 'string' || frame.segmentId.length === 0) {
    throw new VoiceProtocolError('playback audio requires a segment ID')
  }
  const encoded = UTF8_ENCODER.encode(frame.segmentId)
  if (encoded.byteLength > 0xffff) {
    throw new VoiceProtocolError('playback segment ID is too long')
  }
  return encoded
}

export function isVoiceClientControl(value: unknown): value is VoiceClientControl {
  if (!isControlBase(value)) return false
  switch (value.type) {
    case 'start':
      return hasExactKeys(value, [
        'type', 'protocol', 'streamId', 'generation', 'language', 'defaults',
        'answerOnly',
      ]) && isUint32(value.generation) && isNonEmptyString(value.language)
        && isManagerClientDefaults(value.defaults)
        && typeof value.answerOnly === 'boolean'
    case 'speech_tentative':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation'])
        && isUint32(value.generation)
    case 'speech_confirmed':
    case 'speech_end':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation', 'utteranceId'])
        && isUint32(value.generation) && isNonEmptyString(value.utteranceId)
    case 'stop':
      return hasOnlyKeys(value, ['type', 'protocol', 'streamId', 'generation', 'reason'])
        && hasRequiredKeys(value, ['type', 'protocol', 'streamId', 'generation'])
        && isUint32(value.generation)
        && (value.reason === undefined || typeof value.reason === 'string')
    case 'synthesize':
      return hasExactKeys(value, [
        'type', 'protocol', 'streamId', 'generation', 'segmentId', 'text',
      ]) && isUint32(value.generation)
        && isNonEmptyString(value.segmentId) && isNonEmptyString(value.text)
    case 'cancel':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation'])
        && isUint32(value.generation)
    case 'heartbeat':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation', 'timestamp'])
        && isUint32(value.generation)
        && isFiniteNumber(value.timestamp)
    default:
      return false
  }
}

export function isVoiceServerControl(value: unknown): value is VoiceServerControl {
  if (!isControlBase(value)) return false
  switch (value.type) {
    case 'hello':
      return hasExactKeys(value, [
        'type', 'protocol', 'streamId', 'generation', 'capabilities',
      ]) && isUint32(value.generation) && isVoiceCapabilities(value.capabilities)
    case 'partial':
    case 'final':
      return hasExactKeys(value, [
        'type', 'protocol', 'streamId', 'generation', 'utteranceId', 'text',
      ]) && isUint32(value.generation)
        && isNonEmptyString(value.utteranceId) && typeof value.text === 'string'
    case 'state':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation', 'state'])
        && isUint32(value.generation)
        && ['ready', 'listening', 'recognizing', 'thinking', 'speaking', 'stopped']
          .includes(String(value.state))
    case 'audio_end':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation', 'segmentId'])
        && isUint32(value.generation) && isNonEmptyString(value.segmentId)
    case 'error':
      return hasExactKeys(value, [
        'type', 'protocol', 'streamId', 'generation', 'code', 'message', 'fatal',
      ]) && isUint32(value.generation)
        && isNonEmptyString(value.code) && typeof value.message === 'string'
        && typeof value.fatal === 'boolean'
    case 'heartbeat':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation', 'timestamp'])
        && isUint32(value.generation)
        && isFiniteNumber(value.timestamp)
    default:
      return false
  }
}

function isVoiceCapabilities(value: unknown): value is VoiceCapabilities {
  if (!isRecord(value)) return false
  if (!hasOnlyKeys(value, [
    'protocol', 'available', 'computerId', 'computerName', 'sampleRate',
    'playbackSampleRate', 'languages', 'sttProfile', 'ttsVoice', 'resourceClass',
    'limits', 'reason',
  ]) || !hasRequiredKeys(value, [
    'protocol', 'available', 'computerId', 'computerName', 'sampleRate',
    'playbackSampleRate', 'languages', 'sttProfile', 'ttsVoice', 'resourceClass',
    'limits',
  ])) return false
  if (value.protocol !== ORACLE_VOICE_PROTOCOL || typeof value.available !== 'boolean'
    || !isNonEmptyString(value.computerId) || !isNonEmptyString(value.computerName)
    || value.sampleRate !== ORACLE_VOICE_SAMPLE_RATE
    || !isVoicePlaybackSampleRate(value.playbackSampleRate)
    || !Array.isArray(value.languages) || !value.languages.every(isNonEmptyString)
    || typeof value.sttProfile !== 'string' || typeof value.ttsVoice !== 'string'
    || (value.resourceClass !== 'low' && value.resourceClass !== 'quality')
    || (value.reason !== undefined && typeof value.reason !== 'string')
    || !isRecord(value.limits)) return false
  return hasExactKeys(value.limits, ['maxFrameBytes', 'maxQueueBytes', 'maxUtteranceMs'])
    && isPositiveInteger(value.limits.maxFrameBytes)
    && isPositiveInteger(value.limits.maxQueueBytes)
    && isPositiveInteger(value.limits.maxUtteranceMs)
}

function isManagerClientDefaults(value: unknown): value is ManagerClientDefaults {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    'computerId', 'mode', 'provider', 'model', 'reasoningEffort', 'folders',
  ])) {
    return false
  }
  if (
    (value.computerId !== undefined && !isBoundedTrimmedString(value.computerId, 200))
    || (
      value.mode !== undefined
      && (
        typeof value.mode !== 'string'
        || !['interactive', 'plan', 'autopilot'].includes(value.mode)
      )
    )
    || (
      value.provider !== undefined
      && value.provider !== 'copilot'
      && value.provider !== 'claude'
    )
    || (value.model !== undefined && !isBoundedTrimmedString(value.model, 200))
    || (
      value.reasoningEffort !== undefined
      && (
        typeof value.reasoningEffort !== 'string'
        || !['low', 'medium', 'high', 'xhigh', 'max']
          .includes(value.reasoningEffort)
      )
    )
  ) {
    return false
  }
  if (value.folders === undefined) return true
  if (!isRecord(value.folders)) return false
  return Object.entries(value.folders).every(([computerId, folder]) =>
    isBoundedTrimmedString(computerId, 200)
    && isBoundedTrimmedString(folder, 4096))
}

function isControlBase(value: unknown): value is Record<string, unknown> & VoiceControlBase & {
  type: string
} {
  return isRecord(value)
    && typeof value.type === 'string'
    && value.protocol === ORACLE_VOICE_PROTOCOL
    && isNonEmptyString(value.streamId)
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return hasOnlyKeys(value, keys) && hasRequiredKeys(value, keys)
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}

function hasRequiredKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => Object.hasOwn(value, key))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isBoundedTrimmedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string'
    && value.length <= maxLength
    && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isUint32(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === 'number' && value >= 0 && value <= 0xffff_ffff
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && typeof value === 'number' && value > 0
}

export function isVoicePlaybackSampleRate(value: unknown): value is number {
  return Number.isSafeInteger(value)
    && typeof value === 'number'
    && value >= ORACLE_VOICE_MIN_PCM_SAMPLE_RATE
    && value <= ORACLE_VOICE_MAX_PCM_SAMPLE_RATE
}

function validateDirection(value: unknown): asserts value is VoiceAudioDirection {
  if (value !== 'microphone' && value !== 'playback') {
    throw new VoiceProtocolError('invalid audio direction')
  }
}

function validateUint32(value: unknown, name: string): asserts value is number {
  if (!isUint32(value)) {
    throw new VoiceProtocolError(`${name} must be a uint32`)
  }
}

function validateSampleRate(
  direction: VoiceAudioDirection,
  value: unknown,
): asserts value is number {
  if (direction === 'microphone' && value !== ORACLE_VOICE_SAMPLE_RATE) {
    throw new VoiceProtocolError(`sample rate must be ${ORACLE_VOICE_SAMPLE_RATE} Hz`)
  }
  if (direction === 'playback' && !isVoicePlaybackSampleRate(value)) {
    throw new VoiceProtocolError(
      `playback sample rate must be from ${ORACLE_VOICE_MIN_PCM_SAMPLE_RATE}`
      + ` to ${ORACLE_VOICE_MAX_PCM_SAMPLE_RATE} Hz`,
    )
  }
}
