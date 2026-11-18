export interface CronField {
  values: readonly number[]
  wildcard: boolean
}

export interface ParsedCronExpression {
  minute: CronField
  hour: CronField
  dayOfMonth: CronField
  month: CronField
  dayOfWeek: CronField
}

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function parseField(
  source: string,
  label: string,
  minimum: number,
  maximum: number,
  names: readonly string[] = [],
  nameOffset = 0,
): CronField {
  function number(token: string): number {
    const named = names.indexOf(token.toUpperCase())
    const value = named < 0 ? (/^\d+$/.test(token) ? Number(token) : NaN) : named + nameOffset
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new Error(`Cron ${label}: "${token}" must be ${minimum}–${maximum}${names.length ? ' or a three-letter name' : ''}`)
    }
    return value
  }

  const values = new Set<number>()
  for (const item of source.split(',')) {
    const [range, stepToken, extra] = item.split('/')
    if (!range || extra !== undefined ||
        (stepToken !== undefined && (!/^\d+$/.test(stepToken) || Number(stepToken) < 1))) {
      throw new Error(`Cron ${label}: invalid list or step "${item}"; steps must be positive integers`)
    }
    const step = stepToken === undefined ? 1 : Number(stepToken)
    if (!Number.isSafeInteger(step)) throw new Error(`Cron ${label}: step is too large`)
    const bounds = range.split('-')
    if (bounds.length > 2) throw new Error(`Cron ${label}: invalid range "${range}"`)
    const start = range === '*' ? minimum : number(bounds[0])
    const end = range === '*' ? maximum
      : bounds.length === 2 ? number(bounds[1])
        : stepToken === undefined ? start : maximum
    if (start > end) throw new Error(`Cron ${label}: range "${range}" must be ascending`)
    for (let value = start; value <= end; value += step) {
      values.add(label === 'day-of-week' && value === 7 ? 0 : value)
    }
  }
  return { values: [...values].sort((a, b) => a - b), wildcard: source === '*' }
}

export function parseCronExpression(expression: string): ParsedCronExpression {
  const fields = expression.trim().split(/\s+/)
  if (fields.length !== 5) {
    throw new Error('Cron expression must have exactly 5 fields: minute hour day-of-month month day-of-week')
  }
  return {
    minute: parseField(fields[0], 'minute', 0, 59),
    hour: parseField(fields[1], 'hour', 0, 23),
    dayOfMonth: parseField(fields[2], 'day-of-month', 1, 31),
    month: parseField(fields[3], 'month', 1, 12, MONTH_NAMES, 1),
    dayOfWeek: parseField(fields[4], 'day-of-week', 0, 7, DAY_NAMES),
  }
}

export function cronMatchesDate(cron: ParsedCronExpression, date: Date): boolean {
  if (!cron.month.values.includes(date.getUTCMonth() + 1)) return false
  const dayOfMonth = cron.dayOfMonth.values.includes(date.getUTCDate())
  const dayOfWeek = cron.dayOfWeek.values.includes(date.getUTCDay())
  return cron.dayOfMonth.wildcard || cron.dayOfWeek.wildcard
    ? dayOfMonth && dayOfWeek
    : dayOfMonth || dayOfWeek
}
