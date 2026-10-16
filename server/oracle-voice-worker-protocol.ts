import type { VoiceAudioFrame } from '../shared/oracle-voice.js'
import type { EnabledOracleVoiceConfig } from './oracle-voice-config.js'
import type {
  VoiceEndUtterance,
  VoiceEngineEvent,
  VoiceStartUtterance,
  VoiceSynthesisRequest,
} from './oracle-voice-engine.js'

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
      frame: VoiceAudioFrame
    })
  | (VoiceWorkerRequestBase & {
      type: 'stt_end'
      input: VoiceEndUtterance
    })
  | (VoiceWorkerRequestBase & {
      type: 'stt_cancel' | 'tts_cancel'
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
