import { cronMatchesDate, parseCronExpression, type ParsedCronExpression } from './schedule-cron.js'
import {
  DEFAULT_SCHEDULE_TIMEZONE,
  isValidScheduleTimezone,
  SCHEDULE_MIN_SPACING_MINUTES,
  scheduleRecurrenceSchema,
  type ScheduleRecurrence,
} from './schedules.js'

export { parseCronExpression } from './schedule-cron.js'

const MINUTE_MS = 60_000
const DAY_MS = 86_400_000
const MIN_SPACING_MS = SCHEDULE_MIN_SPACING_MINUTES * MINUTE_MS
const formatters = new Map<string, Intl.DateTimeFormat>()
const transitionCache = new Map<string, readonly number[]>()

interface Calendar {
  minutes: readonly number[]
  matches: (date: Date) => boolean
}

export interface RecurrenceValidation {
  valid: boolean
  errors: string[]
}

function assertDate(date: Date, label: string): void {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new Error(`${label} must be a valid Date`)
  }
}

function assertTimezone(timezone: string): void {
  if (!isValidScheduleTimezone(timezone)) throw new Error('Timezone must be a supported IANA time zone')
}

function formatter(timezone: string): Intl.DateTimeFormat {
  let value = formatters.get(timezone)
  if (!value) {
    value = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      calendar: 'gregory',
      numberingSystem: 'latn',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    if (formatters.size >= 16) formatters.delete(formatters.keys().next().value!)
    formatters.set(timezone, value)
  }
  return value
}

// UTC is only a coordinate system for Gregorian wall-clock fields here.
function wallTimestamp(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): number {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, 0)
  return date.getTime()
}

function localTimestamp(instant: number, timezone: string): number {
  const parts: Record<string, number> = {}
  for (const { type, value } of formatter(timezone).formatToParts(new Date(instant))) {
    if (type !== 'literal') parts[type] = Number(value)
  }
  return wallTimestamp(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second)
}

function offsetAt(instant: number, timezone: string): number {
  return localTimestamp(instant, timezone) - instant
}

function localDay(instant: number, timezone: string): number {
  return Math.floor(localTimestamp(instant, timezone) / DAY_MS) * DAY_MS
}

function resolver(day: number, timezone: string): (minute: number) => number {
  const offsets = new Set<number>()
  // Include both sides even for non-hour transitions and skipped calendar days.
  for (let hours = -48; hours <= 48; hours += 12) {
    offsets.add(offsetAt(day + hours * 60 * MINUTE_MS, timezone))
  }
  return (minute) => {
    const wall = day + minute * MINUTE_MS
    if (offsets.size === 1) return wall - offsets.values().next().value!
    let first = Infinity
    let shifted = Infinity
    let gap = Infinity
    for (const offset of offsets) {
      const instant = wall - offset
      const difference = localTimestamp(instant, timezone) - wall
      if (difference === 0) first = Math.min(first, instant)
      else if (difference > 0 && difference < gap) {
        gap = difference
        shifted = instant
      }
    }
    // Exact candidates choose the first fold; otherwise preserve minutes into the gap.
    const result = Number.isFinite(first) ? first : shifted
    if (!Number.isFinite(result)) throw new Error('Could not resolve schedule wall time')
    return result
  }
}

function minuteOfDay(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function cronCalendar(cron: ParsedCronExpression): Calendar {
  return {
    minutes: cron.hour.values.flatMap((hour) => cron.minute.values.map((minute) => hour * 60 + minute)),
    matches: (date) => cronMatchesDate(cron, date),
  }
}

function calendarFor(recurrence: Exclude<ScheduleRecurrence, { type: 'once' }>): Calendar {
  switch (recurrence.type) {
    case 'cron': return cronCalendar(parseCronExpression(recurrence.expression))
    case 'hourly': {
      const start = minuteOfDay(recurrence.windowStart ?? '00:00')
      const end = minuteOfDay(recurrence.windowEnd ?? '24:00')
      const duration = (end - start + 1440) % 1440 || 1440
      const minutes: number[] = []
      for (let elapsed = 0; elapsed < duration; elapsed += recurrence.everyHours * 60) {
        minutes.push((start + elapsed) % 1440)
      }
      return { minutes: minutes.sort((a, b) => a - b), matches: () => true }
    }
    case 'daily': return { minutes: [minuteOfDay(recurrence.time)], matches: () => true }
    case 'weekdays': return {
      minutes: [minuteOfDay(recurrence.time)],
      matches: (date) => date.getUTCDay() >= 1 && date.getUTCDay() <= 5,
    }
    case 'weekly': return {
      minutes: [minuteOfDay(recurrence.time)],
      matches: (date) => recurrence.days.includes(date.getUTCDay()),
    }
  }
}

function addCalendarYears(day: number, years: number): number {
  const date = new Date(day)
  date.setUTCFullYear(date.getUTCFullYear() + years)
  return date.getTime()
}

function* occurrences(
  recurrence: ScheduleRecurrence,
  timezone: string,
  minimum: number,
  end = Infinity,
): Generator<Date> {
  if (recurrence.type === 'once') {
    const timestamp = Date.parse(recurrence.at)
    if (timestamp >= minimum && timestamp < end) yield new Date(timestamp)
    return
  }
  const calendar = calendarFor(recurrence)
  let day = localDay(minimum, timezone) - 2 * DAY_MS
  let searchEnd = addCalendarYears(day, 400)
  let last = -Infinity
  const pending = new Set<number>()
  while (Number.isFinite(day) && day <= searchEnd && day < end + 3 * DAY_MS) {
    if (calendar.matches(new Date(day))) {
      const resolve = resolver(day, timezone)
      for (const minute of calendar.minutes) {
        const timestamp = resolve(minute)
        if (timestamp >= minimum && timestamp < end && timestamp > last) pending.add(timestamp)
      }
      searchEnd = addCalendarYears(day, 400)
    }
    // A shifted time can sort after a later wall time, even on the next date.
    const ready = [...pending].filter((timestamp) => timestamp <= day - 2 * DAY_MS).sort((a, b) => a - b)
    for (const timestamp of ready) {
      pending.delete(timestamp)
      last = timestamp
      yield new Date(timestamp)
    }
    day += DAY_MS
  }
  for (const timestamp of [...pending].sort((a, b) => a - b)) yield new Date(timestamp)
}

function assertLimit(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`)
}

/** Returns strictly increasing instants after (not including) `after`. */
export function nextOccurrences(
  recurrence: ScheduleRecurrence,
  timezone: string,
  after: Date,
  count: number,
): Date[] {
  assertDate(after, 'after')
  assertTimezone(timezone)
  assertLimit(count, 'count')
  const parsed = scheduleRecurrenceSchema.parse(recurrence)
  if (count === 0) return []
  const result: Date[] = []
  for (const occurrence of occurrences(parsed, timezone, after.getTime() + 1)) {
    result.push(occurrence)
    if (result.length === count) break
  }
  return result
}

/** Returns at most `cap` instants in the half-open interval [from, to). */
export function occurrencesBetween(
  recurrence: ScheduleRecurrence,
  timezone: string,
  from: Date,
  to: Date,
  cap = 1000,
): Date[] {
  assertDate(from, 'from')
  assertDate(to, 'to')
  assertTimezone(timezone)
  assertLimit(cap, 'cap')
  const parsed = scheduleRecurrenceSchema.parse(recurrence)
  if (to < from) throw new Error('to must not be before from')
  if (cap === 0 || to.getTime() === from.getTime()) return []
  const result: Date[] = []
  for (const occurrence of occurrences(parsed, timezone, from.getTime(), to.getTime())) {
    result.push(occurrence)
    if (result.length === cap) break
  }
  return result
}

function nominalSpacingError(calendar: Calendar): string | undefined {
  const minutes = calendar.minutes
  const withinDay = minutes.some((minute, index) => index > 0 && minute - minutes[index - 1] < SCHEDULE_MIN_SPACING_MINUTES)
  const acrossMidnight = 1440 - minutes[minutes.length - 1] + minutes[0] < SCHEDULE_MIN_SPACING_MINUTES
  const start = wallTimestamp(2000, 1, 1)
  const end = wallTimestamp(2400, 1, 1)
  let any = false
  let previousMatched = calendar.matches(new Date(start - DAY_MS))
  // Gregorian dates and weekdays repeat every 400 years, including the cycle boundary.
  for (let day = start; day < end; day += DAY_MS) {
    const matched = calendar.matches(new Date(day))
    if (matched) {
      any = true
      if (withinDay || (previousMatched && acrossMidnight)) return spacingError()
      if (!acrossMidnight) return undefined
    }
    previousMatched = matched
  }
  return any ? undefined : 'Recurrence has no possible calendar date'
}

function spacingError(): string {
  return `Occurrences must be at least ${SCHEDULE_MIN_SPACING_MINUTES} minutes apart`
}

function transitionDays(timezone: string, startYear: number): readonly number[] {
  const key = `${timezone}:${startYear}`
  const cached = transitionCache.get(key)
  if (cached) return cached
  const start = wallTimestamp(startYear, 1, 1) - 3 * DAY_MS
  const end = wallTimestamp(startYear + 400, 1, 1)
  const days = new Set<number>()
  let previous = offsetAt(start - DAY_MS, timezone)
  for (let day = start; day < end; day += DAY_MS) {
    const offset = offsetAt(day, timezone)
    if (offset !== previous) {
      for (let adjacent = -2; adjacent <= 2; adjacent++) days.add(day + adjacent * DAY_MS)
    }
    previous = offset
  }
  const result = [...days].sort((a, b) => a - b)
  if (transitionCache.size >= 4) transitionCache.delete(transitionCache.keys().next().value!)
  transitionCache.set(key, result)
  return result
}

function actualSpacingError(calendar: Calendar, timezone: string, now: Date): string | undefined {
  const recent = new Map<number, number[]>()
  for (const day of transitionDays(timezone, now.getUTCFullYear())) {
    for (const previousDay of recent.keys()) {
      if (previousDay < day - 2 * DAY_MS) recent.delete(previousDay)
    }
    if (!calendar.matches(new Date(day))) continue
    const resolve = resolver(day, timezone)
    recent.set(day, calendar.minutes.map(resolve).filter((timestamp) => timestamp > now.getTime()))
    const sorted = [...new Set([...recent.values()].flat())].sort((a, b) => a - b)
    if (sorted.some((timestamp, index) => index > 0 && timestamp - sorted[index - 1] < MIN_SPACING_MS)) {
      return `${spacingError()} (including timezone transitions)`
    }
  }
  return undefined
}

/**
 * Creation validation; pass `now` explicitly for a reproducible decision.
 * The structural schemas deliberately still represent past one-off schedules.
 */
export function validateRecurrence(
  recurrence: unknown,
  timezone = DEFAULT_SCHEDULE_TIMEZONE,
  now: Date = new Date(),
): RecurrenceValidation {
  const parsed = scheduleRecurrenceSchema.safeParse(recurrence)
  const errors = parsed.success ? [] : parsed.error.issues.map((issue) => issue.message)
  if (!isValidScheduleTimezone(timezone)) errors.push('Timezone must be a supported IANA time zone')
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) errors.push('now must be a valid Date')
  if (!parsed.success || errors.length) return { valid: false, errors }
  if (parsed.data.type === 'once') {
    if (Date.parse(parsed.data.at) <= now.getTime()) {
      errors.push('Once occurrence must be in the future when creating a schedule')
    }
  } else {
    const calendar = calendarFor(parsed.data)
    const error = nominalSpacingError(calendar)
      ?? (calendar.minutes.length > 1 ? actualSpacingError(calendar, timezone, now) : undefined)
    if (error) errors.push(error)
  }
  return { valid: errors.length === 0, errors }
}
