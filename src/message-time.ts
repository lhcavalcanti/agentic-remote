// Session and Oracle transcripts share these times, in the viewer's locale and timezone.
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dayTime = new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
})
const full = new Intl.DateTimeFormat(undefined, {
  year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
})

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
  const label = date.toDateString() === now.toDateString()
    ? time.format(date)
    : date.getFullYear() === now.getFullYear()
      ? dayTime.format(date)
      : full.format(date)
  return { label, title: full.format(date) }
}
