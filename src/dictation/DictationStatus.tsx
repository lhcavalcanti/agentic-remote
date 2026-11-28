import { recordingDuration } from '../voice-recorder'
import type { LiveDictationStatus } from './use-live-dictation'

export type ActiveDictationStatus = Exclude<LiveDictationStatus, 'idle'>

/** What dictation is doing, in words: "Listening · 0:07". */
function dictationStatusLabel(status: ActiveDictationStatus, seconds: number): string {
  if (status === 'connecting') return 'Connecting…'
  if (status === 'finishing') return 'Finishing…'
  return `Listening · ${recordingDuration(seconds)}`
}

/**
 * The compact status beside the dictation controls. Its timer changes every
 * second, so it is not a live region; the composer announces the changes
 * that matter.
 */
export function DictationStatus({
  status,
  seconds,
  className = '',
}: {
  status: ActiveDictationStatus
  seconds: number
  className?: string
}) {
  return (
    <span className={`dictation-status dictation-status--${status} ${className}`.trim()}>
      <i aria-hidden="true" />
      {dictationStatusLabel(status, seconds)}
    </span>
  )
}
