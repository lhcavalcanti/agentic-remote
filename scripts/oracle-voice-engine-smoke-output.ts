import type { VoiceEngineEvent } from '../server/oracle-voice-engine.js'

export function smokeEventLogLine(event: VoiceEngineEvent): string | undefined {
  if (event.type === 'partial') return 'partial observed'
  if (event.type === 'final') return 'final observed'
  return undefined
}
