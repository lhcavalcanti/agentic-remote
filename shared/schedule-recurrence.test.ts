import { describe, expect, it } from 'vitest'
import {
  nextOccurrences,
  occurrencesBetween,
  parseCronExpression,
  validateRecurrence,
} from './schedule-recurrence.js'
import type { ScheduleRecurrence } from './schedules.js'

const LA = 'America/Los_Angeles'
const now = new Date('2026-01-01T00:00:00Z')

function next(recurrence: ScheduleRecurrence, after: string, count = 3, timezone = LA): string[] {
  return nextOccurrences(recurrence, timezone, new Date(after), count).map((date) => date.toISOString())
}

describe('DST disambiguation', () => {
  it.each([
    {
      name: '02:30 shifts to 03:30 through the Los Angeles spring gap',
      recurrence: { type: 'daily', time: '02:30' },
      after: '2026-03-07T00:00:00Z',
      expected: ['2026-03-07T10:30:00.000Z', '2026-03-08T10:30:00.000Z', '2026-03-09T09:30:00.000Z'],
    },
    {
      name: '02:30 uses standard time after Los Angeles fall-back',
      recurrence: { type: 'daily', time: '02:30' },
      after: '2026-10-31T00:00:00Z',
      expected: ['2026-10-31T09:30:00.000Z', '2026-11-01T10:30:00.000Z', '2026-11-02T10:30:00.000Z'],
    },
    {
      name: '01:30 uses only the first Los Angeles fall-back occurrence',
      recurrence: { type: 'daily', time: '01:30' },
      after: '2026-10-31T00:00:00Z',
      expected: ['2026-10-31T08:30:00.000Z', '2026-11-01T08:30:00.000Z', '2026-11-02T09:30:00.000Z'],
    },
    {
      name: 'an hourly spring gap coalesces shifted and real 03:00',
      recurrence: { type: 'hourly', everyHours: 1 },
      after: '2026-03-08T07:59:00Z',
      expected: ['2026-03-08T08:00:00.000Z', '2026-03-08T09:00:00.000Z', '2026-03-08T10:00:00.000Z', '2026-03-08T11:00:00.000Z'],
    },
    {
      name: 'hourly fall-back does not fire during the repeated hour',
      recurrence: { type: 'hourly', everyHours: 1 },
      after: '2026-11-01T06:59:00Z',
      expected: ['2026-11-01T07:00:00.000Z', '2026-11-01T08:00:00.000Z', '2026-11-01T10:00:00.000Z', '2026-11-01T11:00:00.000Z'],
    },
    {
      name: 'cron applies the same first-fold rule to each ambiguous minute',
      recurrence: { type: 'cron', expression: '0,30 1 * * *' },
      after: '2026-11-01T07:59:00Z',
      expected: ['2026-11-01T08:00:00.000Z', '2026-11-01T08:30:00.000Z', '2026-11-02T09:00:00.000Z'],
    },
    {
      name: 'cron shifts missing 02:30 rather than skipping it',
      recurrence: { type: 'cron', expression: '30 2 * * *' },
      after: '2026-03-08T00:00:00Z',
      expected: ['2026-03-08T10:30:00.000Z', '2026-03-09T09:30:00.000Z'],
    },
  ] satisfies Array<{ name: string; recurrence: ScheduleRecurrence; after: string; expected: string[] }>)('$name', ({ recurrence, after, expected }) => {
    expect(next(recurrence, after, expected.length)).toEqual(expected)
  })

  it('does not return the second 01:30 when queried between the two folds', () => {
    expect(next({ type: 'daily', time: '01:30' }, '2026-11-01T08:45:00Z', 1)).toEqual(['2026-11-02T09:30:00.000Z'])
    expect(next({ type: 'hourly', everyHours: 1 }, '2026-11-01T08:45:00Z', 1)).toEqual(['2026-11-01T10:00:00.000Z'])
  })

  it('sorts shifted wall times after earlier real instants and still finds them when querying inside a gap', () => {
    const recurrence = { type: 'hourly', everyHours: 0.5, windowStart: '02:45', windowEnd: '04:30' } as const
    expect(next(recurrence, '2026-03-08T00:00:00Z', 3)).toEqual([
      '2026-03-08T10:15:00.000Z', '2026-03-08T10:45:00.000Z', '2026-03-08T11:15:00.000Z',
    ])
    expect(next(recurrence, '2026-03-08T10:20:00Z', 1)).toEqual(['2026-03-08T10:45:00.000Z'])
  })

  it.each([
    ['2026-03-08T08:00:00Z', '2026-03-09T07:00:00Z', 92],
    ['2026-11-01T07:00:00Z', '2026-11-02T08:00:00Z', 96],
  ] as const)('keeps a full local day unique and chronological across %s', (from, to, count) => {
    const dates = occurrencesBetween({ type: 'cron', expression: '*/15 * * * *' }, LA, new Date(from), new Date(to))
    expect(dates).toHaveLength(count)
    const times = dates.map((date) => date.getTime())
    expect(times.every((timestamp, index) => index === 0 || timestamp > times[index - 1])).toBe(true)
    const wallTimes = dates.map((date) => new Intl.DateTimeFormat('en-CA', {
      timeZone: LA, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(date))
    expect(new Set(wallTimes).size).toBe(count)
  })

  it.each([
    ['Europe/London', '01:30', '2026-03-28T12:00:00Z', ['2026-03-29T01:30:00.000Z', '2026-03-30T00:30:00.000Z']],
    ['Europe/London', '01:30', '2026-10-24T12:00:00Z', ['2026-10-25T00:30:00.000Z', '2026-10-26T01:30:00.000Z']],
    ['Asia/Kolkata', '09:00', '2026-03-08T00:00:00Z', ['2026-03-08T03:30:00.000Z', '2026-03-09T03:30:00.000Z']],
    ['Australia/Lord_Howe', '02:15', '2026-10-03T00:00:00Z', ['2026-10-03T15:45:00.000Z', '2026-10-04T15:15:00.000Z']],
    ['Australia/Lord_Howe', '01:45', '2026-04-04T00:00:00Z', ['2026-04-04T14:45:00.000Z', '2026-04-05T15:15:00.000Z']],
    ['Pacific/Apia', '09:00', '2011-12-29T19:00:00Z', ['2011-12-30T19:00:00.000Z', '2011-12-31T19:00:00.000Z']],
  ] as const)('handles %s %s around %s', (timezone, time, after, expected) => {
    expect(next({ type: 'daily', time }, after, expected.length, timezone)).toEqual(expected)
  })
})

describe('calendar recurrence', () => {
  it('expands whole-minute fractional hours using integer minute arithmetic', () => {
    expect(next({ type: 'hourly', everyHours: 4.1 }, '2026-01-01T00:00:00Z', 3, 'UTC')).toEqual([
      '2026-01-01T04:06:00.000Z', '2026-01-01T08:12:00.000Z', '2026-01-01T12:18:00.000Z',
    ])
  })

  it('uses a once timestamp as an absolute instant and excludes it after it has occurred', () => {
    const recurrence = { type: 'once', at: '2026-11-13T12:30:00-08:00' } as const
    expect(next(recurrence, '2026-11-13T20:00:00Z')).toEqual(['2026-11-13T20:30:00.000Z'])
    expect(next(recurrence, '2026-11-13T20:30:00Z')).toEqual([])
  })

  it('skips the weekend for weekdays, including the spring DST boundary', () => {
    expect(next({ type: 'weekdays', time: '09:00' }, '2026-03-06T17:00:00Z')).toEqual([
      '2026-03-09T16:00:00.000Z', '2026-03-10T16:00:00.000Z', '2026-03-11T16:00:00.000Z',
    ])
  })

  it('orders a weekly multi-day set independently of input order (Sunday = 0)', () => {
    expect(next({ type: 'weekly', days: [5, 0, 1], time: '09:00' }, '2026-11-06T17:00:00Z', 4)).toEqual([
      '2026-11-08T17:00:00.000Z', '2026-11-09T17:00:00.000Z', '2026-11-13T17:00:00.000Z', '2026-11-15T17:00:00.000Z',
    ])
  })

  it.each([
    [{ type: 'hourly', everyHours: 2, windowStart: '09:30', windowEnd: '15:30' }, '2026-11-13T17:00:00Z', ['2026-11-13T17:30:00.000Z', '2026-11-13T19:30:00.000Z', '2026-11-13T21:30:00.000Z', '2026-11-14T17:30:00.000Z']],
    [{ type: 'hourly', everyHours: 2, windowStart: '22:00', windowEnd: '04:00' }, '2026-11-14T05:59:00Z', ['2026-11-14T06:00:00.000Z', '2026-11-14T08:00:00.000Z', '2026-11-14T10:00:00.000Z', '2026-11-15T06:00:00.000Z']],
    [{ type: 'hourly', everyHours: 1, windowStart: '23:00' }, '2026-11-14T05:59:00Z', ['2026-11-14T07:00:00.000Z', '2026-11-15T07:00:00.000Z']],
    [{ type: 'hourly', everyHours: 12, windowStart: '04:00', windowEnd: '04:00' }, '2026-11-13T11:59:00Z', ['2026-11-13T12:00:00.000Z', '2026-11-14T00:00:00.000Z', '2026-11-14T12:00:00.000Z']],
  ] satisfies Array<[ScheduleRecurrence, string, string[]]>)('anchors hourly windows to their local start: %j', (recurrence, after, expected) => {
    expect(next(recurrence, after, expected.length)).toEqual(expected)
  })

  it('finds leap days across years without a short lookahead cutoff', () => {
    expect(next({ type: 'cron', expression: '0 12 29 FEB *' }, '2027-03-01T00:00:00Z', 2, 'UTC')).toEqual([
      '2028-02-29T12:00:00.000Z', '2032-02-29T12:00:00.000Z',
    ])
  })

  it('does not mistake the Gregorian century 2100 for a leap year', () => {
    expect(next({ type: 'cron', expression: '0 0 29 2 *' }, '2096-03-01T00:00:00Z', 1, 'UTC')).toEqual(['2104-02-29T00:00:00.000Z'])
  })

  it('skips months without a 31st instead of clamping to month end', () => {
    expect(next({ type: 'cron', expression: '0 9 31 * *' }, '2028-01-31T09:00:00Z', 3, 'UTC')).toEqual([
      '2028-03-31T09:00:00.000Z', '2028-05-31T09:00:00.000Z', '2028-07-31T09:00:00.000Z',
    ])
  })
})

describe('five-field cron', () => {
  it.each([
    ['*/15 9-10 * JAN,MAR MON-FRI', '2026-01-02T09:00:00Z', ['2026-01-02T09:15:00.000Z', '2026-01-02T09:30:00.000Z', '2026-01-02T09:45:00.000Z', '2026-01-02T10:00:00.000Z']],
    ['5-50/15 8,12 * * *', '2026-01-01T08:00:00Z', ['2026-01-01T08:05:00.000Z', '2026-01-01T08:20:00.000Z', '2026-01-01T08:35:00.000Z', '2026-01-01T08:50:00.000Z']],
    ['5/20 8 * * *', '2026-01-01T08:00:00Z', ['2026-01-01T08:05:00.000Z', '2026-01-01T08:25:00.000Z', '2026-01-01T08:45:00.000Z']],
    ['0 9 * jan-mar/2 mon-fri/2', '2026-01-01T00:00:00Z', ['2026-01-02T09:00:00.000Z', '2026-01-05T09:00:00.000Z', '2026-01-07T09:00:00.000Z']],
    ['0 9 * * 7', '2026-11-01T09:00:00Z', ['2026-11-08T09:00:00.000Z']],
    ['0 9 13 * FRI', '2026-11-01T00:00:00Z', ['2026-11-06T09:00:00.000Z', '2026-11-13T09:00:00.000Z', '2026-11-20T09:00:00.000Z', '2026-11-27T09:00:00.000Z', '2026-12-04T09:00:00.000Z', '2026-12-11T09:00:00.000Z', '2026-12-13T09:00:00.000Z']],
    ['0 9 31 FEB MON', '2026-02-01T00:00:00Z', ['2026-02-02T09:00:00.000Z', '2026-02-09T09:00:00.000Z']],
    ['0 9 */2 * MON', '2026-11-01T00:00:00Z', ['2026-11-01T09:00:00.000Z', '2026-11-02T09:00:00.000Z', '2026-11-03T09:00:00.000Z']],
    ['0 9 2 * */2', '2026-11-01T00:00:00Z', ['2026-11-01T09:00:00.000Z', '2026-11-02T09:00:00.000Z', '2026-11-03T09:00:00.000Z']],
    ['0 9 1-31/2 * MON', '2026-11-01T00:00:00Z', ['2026-11-01T09:00:00.000Z', '2026-11-02T09:00:00.000Z', '2026-11-03T09:00:00.000Z']],
  ] as const)('expands %s', (expression, after, expected) => {
    expect(next({ type: 'cron', expression }, after, expected.length, 'UTC')).toEqual(expected)
  })

  it('normalizes duplicate Sunday aliases and list values to one occurrence', () => {
    expect(parseCronExpression('0,0 9 * * 0,7,SUN').dayOfWeek.values).toEqual([0])
    expect(next({ type: 'cron', expression: '0,0 9 * * 0,7,SUN' }, '2026-11-01T00:00:00Z', 2, 'UTC')).toEqual([
      '2026-11-01T09:00:00.000Z', '2026-11-08T09:00:00.000Z',
    ])
  })

  it.each([
    ['', 'exactly 5 fields'],
    ['0 0 * * * *', 'exactly 5 fields'],
    ['60 * * * *', 'minute'],
    ['0 24 * * *', 'hour'],
    ['0 0 0 * *', 'day-of-month'],
    ['0 0 * 13 *', 'month'],
    ['0 0 * * 8', 'day-of-week'],
    ['0 0 * BAD *', 'month'],
    ['0 0 * * FUNDAY', 'day-of-week'],
    ['*/0 * * * *', 'positive integers'],
    ['*/1.5 * * * *', 'positive integers'],
    ['0- * * * *', 'minute'],
    ['20-10 * * * *', 'ascending'],
    ['1,,2 * * * *', 'invalid list'],
    ['1/2/3 * * * *', 'invalid list'],
    ['-1 * * * *', 'minute'],
    ['0 0 L * *', 'day-of-month'],
    ['0 0 * * MON#2', 'day-of-week'],
    ['0 0 ? * MON', 'day-of-month'],
    ['@daily', 'exactly 5 fields'],
  ])('rejects %j with a clear error', (expression, message) => {
    expect(() => parseCronExpression(expression)).toThrow(message)
    expect(validateRecurrence({ type: 'cron', expression }, 'UTC', now)).toMatchObject({
      valid: false, errors: [expect.stringContaining(message)],
    })
  })
})

describe('creation validation and minimum spacing', () => {
  it.each([
    '*/5 * * * *',
    '0,14 * * * *',
    '0,50 * * * *',
    '0,50 0,23 * * *',
  ])('rejects less-than-15-minute spacing in %s, including wraparound', (expression) => {
    expect(validateRecurrence({ type: 'cron', expression }, 'UTC', now)).toEqual({
      valid: false, errors: ['Occurrences must be at least 15 minutes apart'],
    })
  })

  it('accepts exactly 15 minutes and does not invent a midnight violation between nonadjacent dates', () => {
    expect(validateRecurrence({ type: 'cron', expression: '*/15 * * * *' }, 'UTC', now)).toEqual({ valid: true, errors: [] })
    expect(validateRecurrence({ type: 'cron', expression: '0,50 0,23 1 * *' }, 'UTC', now)).toEqual({ valid: true, errors: [] })
  })

  it('checks actual spacing through a future timezone change, not only nominal wall-clock differences', () => {
    expect(validateRecurrence({ type: 'cron', expression: '0,50 1,3 * * *' }, LA, now)).toEqual({
      valid: false, errors: ['Occurrences must be at least 15 minutes apart (including timezone transitions)'],
    })
  })

  it('detects a sub-quarter-hour gap caused by a half-hour DST shift', () => {
    expect(validateRecurrence({ type: 'cron', expression: '0,40 1,2 * * *' }, 'Australia/Lord_Howe', now)).toEqual({
      valid: false, errors: ['Occurrences must be at least 15 minutes apart (including timezone transitions)'],
    })
  })

  it('rejects a sub-quarter-hour interval but accepts daily and weekly recurrences', () => {
    expect(validateRecurrence({ type: 'hourly', everyHours: 0.1 }, 'UTC', now).valid).toBe(false)
    for (const recurrence of [
      { type: 'hourly', everyHours: 0.25 },
      { type: 'daily', time: '02:30' },
      { type: 'weekdays', time: '09:00' },
      { type: 'weekly', days: [0, 2, 4], time: '01:30' },
    ]) expect(validateRecurrence(recurrence, 'UTC', now)).toEqual({ valid: true, errors: [] })
  })

  it('rejects impossible dates without rejecting a valid DOM/DOW OR alternative', () => {
    expect(validateRecurrence({ type: 'cron', expression: '0 0 30 FEB *' }, 'UTC', now)).toEqual({
      valid: false, errors: ['Recurrence has no possible calendar date'],
    })
    expect(validateRecurrence({ type: 'cron', expression: '0 0 30 FEB MON' }, 'UTC', now)).toEqual({ valid: true, errors: [] })
    expect(next({ type: 'cron', expression: '0 0 30 FEB *' }, now.toISOString(), 1, 'UTC')).toEqual([])
  })

  it.each(['2025-12-31T23:59:00Z', '2026-01-01T00:00:00Z'])('rejects a once occurrence at or before creation time: %s', (at) => {
    expect(validateRecurrence({ type: 'once', at }, LA, now)).toEqual({
      valid: false, errors: ['Once occurrence must be in the future when creating a schedule'],
    })
  })

  it('accepts a future once occurrence and reports bad clocks and timezones', () => {
    expect(validateRecurrence({ type: 'once', at: '2026-01-01T00:00:01Z' }, LA, now)).toEqual({ valid: true, errors: [] })
    expect(validateRecurrence({ type: 'daily', time: '09:00' }, 'Mars/Olympus', now).errors).toEqual(['Timezone must be a supported IANA time zone'])
    expect(validateRecurrence({ type: 'daily', time: '09:00' }, LA, new Date(NaN)).errors).toEqual(['now must be a valid Date'])
  })
})

describe('range boundaries and caps', () => {
  const recurrence = { type: 'hourly', everyHours: 1 } as const
  const from = new Date('2026-01-01T00:00:00Z')
  const to = new Date('2026-01-01T04:00:00Z')

  it('includes from, excludes to, and nextOccurrences excludes after even at subminute precision', () => {
    expect(occurrencesBetween(recurrence, 'UTC', from, to).map((date) => date.toISOString())).toEqual([
      '2026-01-01T00:00:00.000Z', '2026-01-01T01:00:00.000Z', '2026-01-01T02:00:00.000Z', '2026-01-01T03:00:00.000Z',
    ])
    expect(next(recurrence, '2026-01-01T00:00:00Z', 1, 'UTC')).toEqual(['2026-01-01T01:00:00.000Z'])
    expect(next(recurrence, '2026-01-01T00:59:59.999Z', 1, 'UTC')).toEqual(['2026-01-01T01:00:00.000Z'])
  })

  it('enforces explicit and default caps without errors for a truncated interval', () => {
    expect(occurrencesBetween(recurrence, 'UTC', from, to, 2)).toHaveLength(2)
    expect(occurrencesBetween(recurrence, 'UTC', from, new Date('2027-01-01T00:00:00Z'))).toHaveLength(1000)
    expect(occurrencesBetween(recurrence, 'UTC', from, to, 0)).toEqual([])
    expect(nextOccurrences(recurrence, 'UTC', from, 0)).toEqual([])
    expect(occurrencesBetween(recurrence, 'UTC', from, from)).toEqual([])
  })

  it('preserves the interval convention for fractional-second once occurrences', () => {
    const once = { type: 'once', at: '2026-01-01T00:00:00.123Z' } as const
    const instant = new Date(once.at)
    expect(occurrencesBetween(once, 'UTC', instant, new Date(instant.getTime() + 1))).toEqual([instant])
    expect(occurrencesBetween(once, 'UTC', from, instant)).toEqual([])
    expect(nextOccurrences(once, 'UTC', instant, 1)).toEqual([])
  })

  it('does not mutate the caller clock or recurrence', () => {
    const input = Object.freeze({ type: 'weekly', time: '09:00', days: [5, 1] }) as ScheduleRecurrence
    const original = JSON.stringify(input)
    nextOccurrences(input, 'UTC', from, 2)
    expect(JSON.stringify(input)).toBe(original)
    expect(from.toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })

  it.each([-1, 1.5, NaN, Infinity])('rejects invalid count/cap %s', (limit) => {
    expect(() => nextOccurrences(recurrence, 'UTC', from, limit)).toThrow('count must be a non-negative safe integer')
    expect(() => occurrencesBetween(recurrence, 'UTC', from, to, limit)).toThrow('cap must be a non-negative safe integer')
  })

  it('fails closed on invalid dates, reversed intervals, malformed recurrence, and timezones', () => {
    expect(() => nextOccurrences(recurrence, 'UTC', new Date(NaN), 1)).toThrow('after must be a valid Date')
    expect(() => occurrencesBetween(recurrence, 'UTC', from, new Date(NaN))).toThrow('to must be a valid Date')
    expect(() => occurrencesBetween(recurrence, 'UTC', to, from)).toThrow('to must not be before from')
    expect(() => nextOccurrences(recurrence, '+05:30', from, 1)).toThrow('IANA')
    expect(() => nextOccurrences({ type: 'daily', time: '25:00' }, 'UTC', from, 1)).toThrow('Time must be HH:mm')
  })
})
