// Session and Oracle transcripts share these times, in the viewer's locale,
// calendar, and timezone.
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dayTime = new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
})
const full = new Intl.DateTimeFormat(undefined, {
  year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
})

// Days and years as the labels count them, so a label gains its year when the
// viewer's calendar turns (a Persian year at Nowruz), not each January.
const yearFields = new Set(['era', 'year', 'relatedYear', 'yearName'])
const dayFields = new Set([...yearFields, 'month', 'day'])
const calendarKey = (date: Date, fields: Set<string>) => full.formatToParts(date)
  .filter((part) => fields.has(part.type))
  .map((part) => part.value)
  .join(' ')

/** The viewer's calendar day, which changes at their local midnight. */
export const calendarDay = (now = new Date()) => calendarKey(now, dayFields)

/**
 * How a stored message's time reads: just the time today, the day too on
 * other days, and the year as well in other years. The title always carries
 * the full date. Missing or unreadable values have no time to show.
 */
export function messageTimeParts(
  value: string | undefined,
  now = new Date(),
): { label: string; title: string } | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return undefined
  const label = calendarDay(date) === calendarDay(now)
    ? time.format(date)
    : calendarKey(date, yearFields) === calendarKey(now, yearFields)
      ? dayTime.format(date)
      : full.format(date)
  return { label, title: full.format(date) }
}
