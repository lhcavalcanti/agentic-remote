export const ORACLE_VOICE_PROTOCOL = 1 as const
export const ORACLE_VOICE_SAMPLE_RATE = 16_000 as const
export const VOICE_AUDIO_HEADER_BYTES = 24

const MAGIC = [0x41, 0x52, 0x56, 0x43] as const

export type VoiceAudioDirection = 'microphone' | 'playback'

export interface VoiceAudioHeader {
  direction: VoiceAudioDirection
  generation: number
  sequence: number
  sampleRate: typeof ORACLE_VOICE_SAMPLE_RATE
  sampleCount: number
}

export interface VoiceAudioFrame extends Omit<VoiceAudioHeader, 'sampleCount'> {
  samples: Int16Array
}

export interface VoiceCapabilities {
  protocol: typeof ORACLE_VOICE_PROTOCOL
  available: boolean
  computerId: string
  computerName: string
  sampleRate: typeof ORACLE_VOICE_SAMPLE_RATE
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
  validateSampleRate(frame.sampleRate)
  if (!(frame.samples instanceof Int16Array)) {
    throw new VoiceProtocolError('samples must be an Int16Array')
  }

  const payload = new ArrayBuffer(VOICE_AUDIO_HEADER_BYTES + frame.samples.length * 2)
  const view = new DataView(payload)
  MAGIC.forEach((byte, index) => view.setUint8(index, byte))
  view.setUint8(4, ORACLE_VOICE_PROTOCOL)
  view.setUint8(5, frame.direction === 'microphone' ? 0 : 1)
  view.setUint16(6, 0, true)
  view.setUint32(8, frame.generation, true)
  view.setUint32(12, frame.sequence, true)
  view.setUint32(16, frame.sampleRate, true)
  view.setUint32(20, frame.samples.length, true)
  for (let index = 0; index < frame.samples.length; index += 1) {
    view.setInt16(VOICE_AUDIO_HEADER_BYTES + index * 2, frame.samples[index], true)
  }
  return payload
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
  if (view.getUint16(6, true) !== 0) {
    throw new VoiceProtocolError('reserved audio header bytes must be zero')
  }

  const directionByte = view.getUint8(5)
  if (directionByte !== 0 && directionByte !== 1) {
    throw new VoiceProtocolError('invalid audio direction')
  }
  const generation = view.getUint32(8, true)
  const sequence = view.getUint32(12, true)
  const sampleRate = view.getUint32(16, true)
  const sampleCount = view.getUint32(20, true)
  validateSampleRate(sampleRate)
  if (sampleCount > (Number.MAX_SAFE_INTEGER - VOICE_AUDIO_HEADER_BYTES) / 2) {
    throw new VoiceProtocolError('audio sample count is too large')
  }
  if (payload.byteLength !== VOICE_AUDIO_HEADER_BYTES + sampleCount * 2) {
    throw new VoiceProtocolError('audio frame length does not match its sample count')
  }

  const samples = new Int16Array(sampleCount)
  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] = view.getInt16(VOICE_AUDIO_HEADER_BYTES + index * 2, true)
  }
  return {
    direction: directionByte === 0 ? 'microphone' : 'playback',
    generation,
    sequence,
    sampleRate,
    samples,
  }
}

export function isVoiceClientControl(value: unknown): value is VoiceClientControl {
  if (!isControlBase(value)) return false
  switch (value.type) {
    case 'start':
      return hasExactKeys(value, ['type', 'protocol', 'streamId', 'generation', 'language'])
        && isUint32(value.generation) && isNonEmptyString(value.language)
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
    'protocol', 'available', 'computerId', 'computerName', 'sampleRate', 'languages',
    'sttProfile', 'ttsVoice', 'resourceClass', 'limits', 'reason',
  ]) || !hasRequiredKeys(value, [
    'protocol', 'available', 'computerId', 'computerName', 'sampleRate', 'languages',
    'sttProfile', 'ttsVoice', 'resourceClass', 'limits',
  ])) return false
  if (value.protocol !== ORACLE_VOICE_PROTOCOL || typeof value.available !== 'boolean'
    || !isNonEmptyString(value.computerId) || !isNonEmptyString(value.computerName)
    || !isValidSampleRate(value.sampleRate)
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isUint32(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === 'number' && value >= 0 && value <= 0xffff_ffff
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && typeof value === 'number' && value > 0
}

function isValidSampleRate(value: unknown): value is typeof ORACLE_VOICE_SAMPLE_RATE {
  return value === ORACLE_VOICE_SAMPLE_RATE
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

function validateSampleRate(value: unknown): asserts value is typeof ORACLE_VOICE_SAMPLE_RATE {
  if (!isValidSampleRate(value)) {
    throw new VoiceProtocolError(`sample rate must be ${ORACLE_VOICE_SAMPLE_RATE} Hz`)
  }
}
