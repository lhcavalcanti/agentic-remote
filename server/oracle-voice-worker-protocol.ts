import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import type {
  VoiceEndUtterance,
  VoiceEngineEvent,
  VoiceStartUtterance,
  VoiceSynthesisRequest,
  VoiceUtteranceAudioFrame,
} from './oracle-voice-engine.js'

export const VOICE_PIPER_SHUTDOWN_TIMEOUT_MS = 2_000
export const VOICE_WORKER_CLOSE_TIMEOUT_MS =
  VOICE_PIPER_SHUTDOWN_TIMEOUT_MS * 2 + 1_000
export const VOICE_MAX_CANCELLATION_STREAMS = 1_024

interface VoiceWorkerRequestBase {
  requestId: string
}

export type VoiceWorkerParentMessage =
  | (VoiceWorkerRequestBase & {
      type: 'initialize'
      config: EnabledOracleVoiceConfig
    })
  | (VoiceWorkerRequestBase & {
      type: 'stt_start'
      input: VoiceStartUtterance
    })
  | (VoiceWorkerRequestBase & {
      type: 'stt_audio'
      frame: VoiceUtteranceAudioFrame
    })
  | (VoiceWorkerRequestBase & {
      type: 'stt_end'
      input: VoiceEndUtterance
    })
  | (VoiceWorkerRequestBase & {
      type: 'stt_cancel' | 'tts_cancel'
      streamId: string
      generation: number
    })
  | (VoiceWorkerRequestBase & {
      type: 'tts_synthesize'
      input: VoiceSynthesisRequest
    })
  | (VoiceWorkerRequestBase & {
      type: 'close'
    })

export type VoiceWorkerChildMessage =
  | {
      type: 'response'
      requestId: string
    }
  | {
      type: 'response_error'
      requestId: string
      message: string
    }
  | {
      type: 'event'
      event: VoiceEngineEvent
    }
