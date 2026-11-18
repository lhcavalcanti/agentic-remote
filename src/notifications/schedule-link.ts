export interface ScheduleLink {
  scheduleId: string
  runId?: string
}

/** Only the hub's root-page schedule links may open an internal feature view. */
export function readScheduleLink(value: string, origin = window.location.origin): ScheduleLink | undefined {
  try {
    const url = new URL(value, origin)
    if (url.origin !== origin || url.pathname !== '/' || url.username || url.password) return
    const schedules = url.searchParams.getAll('schedule')
    const runs = url.searchParams.getAll('run')
    const validId = (id: string) => id.length > 0 && id.length <= 200 && id === id.trim() &&
      [...id].every((character) => {
        const code = character.codePointAt(0)!
        return code >= 32 && (code < 127 || code > 159)
      })
    if (schedules.length !== 1 || !validId(schedules[0]!) || runs.length > 1 || (runs.length && !validId(runs[0]!))) return
    return { scheduleId: schedules[0]!, ...(runs.length ? { runId: runs[0] } : {}) }
  } catch { return }
}

export function scheduleNotificationLabel(kind: string): string | undefined {
  if (!kind.startsWith('schedule.run.')) return
  const outcome = kind.slice('schedule.run.'.length).replaceAll('-', ' ')
  return `Scheduled · ${outcome ? outcome[0]!.toUpperCase() + outcome.slice(1) : 'Run update'}`
}
