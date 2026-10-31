const LOCAL_RUN_HOUR = 2
const CATCHUP_END_HOUR = 8
const MINUTE_MS = 60_000

export interface DreamerLocalParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export type DreamerScheduleReason =
  | 'before-run'
  | 'window-expired'
  | 'due'

export interface DreamerScheduleDecision {
  due: boolean
  localDate: string
  scheduledAt: Date
  reason: DreamerScheduleReason
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function formatter(timeZone: string): Intl.DateTimeFormat {
  let value = formatterCache.get(timeZone)
  if (!value) {
    value = new Intl.DateTimeFormat('en-CA', {
      timeZone,
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
    formatterCache.set(timeZone, value)
  }
  return value
}

function partsAt(date: Date, timeZone: string): DreamerLocalParts {
  const values = Object.fromEntries(
    formatter(timeZone).formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  ) as Record<string, number>
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  }
}

function localDateFromParts(parts: DreamerLocalParts): string {
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

function localDateParts(localDate: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate)
  if (!match) throw new Error('Invalid Dreamer local date')
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const check = new Date(Date.UTC(year, month - 1, day))
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error('Invalid Dreamer local date')
  }
  return { year, month, day }
}

export function validateDreamerTimeZone(timeZone: string): boolean {
  if (typeof timeZone !== 'string' || timeZone.trim() !== timeZone || !timeZone) {
    return false
  }
  try {
    formatter(timeZone)
    return Boolean(new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date()))
  } catch {
    return false
  }
}

function assertTimeZone(timeZone: string): void {
  if (!validateDreamerTimeZone(timeZone)) {
    throw new Error('Invalid Dreamer timezone')
  }
}

export function dreamerLocalParts(date: Date, timeZone: string): DreamerLocalParts {
  assertTimeZone(timeZone)
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid Dreamer clock')
  return partsAt(date, timeZone)
}

export function dreamerLocalDate(date: Date, timeZone: string): string {
  return localDateFromParts(dreamerLocalParts(date, timeZone))
}

function exactCandidates(
  localDate: string,
  timeZone: string,
  targetHour: number,
  targetMinute: number,
): Date[] {
  const { year, month, day } = localDateParts(localDate)
  const naive = Date.UTC(year, month - 1, day, targetHour, targetMinute)
  const candidates: Date[] = []
  for (const sampleOffset of [-36, -24, -12, -6, 0, 6, 12, 24, 36]) {
    const sample = new Date(naive + sampleOffset * 60 * MINUTE_MS)
    const sampleParts = partsAt(sample, timeZone)
    const localAsUtc = Date.UTC(
      sampleParts.year,
      sampleParts.month - 1,
      sampleParts.day,
      sampleParts.hour,
      sampleParts.minute,
      sampleParts.second,
    )
    const offset = localAsUtc - sample.getTime()
    const candidate = new Date(naive - offset)
    const actual = partsAt(candidate, timeZone)
    if (
      actual.year === year &&
      actual.month === month &&
      actual.day === day &&
      actual.hour === targetHour &&
      actual.minute === targetMinute
    ) {
      candidates.push(candidate)
    }
  }
  return [...new Map(candidates.map((candidate) => [candidate.getTime(), candidate])).values()]
}

function firstValidLaterMinute(localDate: string, timeZone: string): Date {
  const { year, month, day } = localDateParts(localDate)
  const naive = Date.UTC(year, month - 1, day, LOCAL_RUN_HOUR)
  const start = naive - 36 * 60 * MINUTE_MS
  const end = naive + 36 * 60 * MINUTE_MS
  for (let timestamp = start; timestamp <= end; timestamp += MINUTE_MS) {
    const candidate = new Date(timestamp)
    const actual = partsAt(candidate, timeZone)
    if (
      localDateFromParts(actual) === localDate &&
      (actual.hour > LOCAL_RUN_HOUR ||
        (actual.hour === LOCAL_RUN_HOUR && actual.minute >= 0))
    ) {
      return candidate
    }
  }
  throw new Error('Could not resolve Dreamer local run time')
}

/**
 * Resolves the first instant at local 02:00. If that local minute is skipped
 * by a DST transition, the first valid later minute on the same date wins.
 */
export function dreamerScheduledAt(localDate: string, timeZone: string): Date {
  assertTimeZone(timeZone)
  const candidates = exactCandidates(localDate, timeZone, LOCAL_RUN_HOUR, 0)
  if (candidates.length) {
    return new Date(Math.min(...candidates.map((candidate) => candidate.getTime())))
  }
  return firstValidLaterMinute(localDate, timeZone)
}

export function dreamerScheduleDecision(
  now: Date,
  timeZone: string,
): DreamerScheduleDecision {
  assertTimeZone(timeZone)
  const parts = dreamerLocalParts(now, timeZone)
  const localDate = localDateFromParts(parts)
  const scheduledAt = dreamerScheduledAt(localDate, timeZone)
  if (now.getTime() < scheduledAt.getTime()) {
    return { due: false, localDate, scheduledAt, reason: 'before-run' }
  }
  const localSeconds = parts.hour * 3600 + parts.minute * 60 + parts.second
  if (localSeconds >= CATCHUP_END_HOUR * 3600) {
    return { due: false, localDate, scheduledAt, reason: 'window-expired' }
  }
  return { due: true, localDate, scheduledAt, reason: 'due' }
}

export const DREAMER_RUN_HOUR = LOCAL_RUN_HOUR
export const DREAMER_CATCHUP_END_HOUR = CATCHUP_END_HOUR
