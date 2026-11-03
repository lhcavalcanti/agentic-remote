import { describe, expect, it } from 'vitest'
import {
  dreamerLocalDate,
  dreamerScheduleDecision,
  dreamerScheduledAt,
  validateDreamerTimeZone,
} from './dreamer-schedule.js'

describe('Dreamer schedule', () => {
  it('uses the fixed UTC 02:00 run and exclusive 08:00 catch-up window', () => {
    expect(dreamerScheduleDecision(new Date('2026-10-29T01:59:59.000Z'), 'UTC'))
      .toMatchObject({ due: false, localDate: '2026-10-29', reason: 'before-run' })
    expect(dreamerScheduleDecision(new Date('2026-10-29T02:00:00.000Z'), 'UTC'))
      .toMatchObject({ due: true, localDate: '2026-10-29' })
    expect(dreamerScheduleDecision(new Date('2026-10-29T07:59:59.000Z'), 'UTC'))
      .toMatchObject({ due: true, localDate: '2026-10-29' })
    expect(dreamerScheduleDecision(new Date('2026-10-29T08:00:00.000Z'), 'UTC'))
      .toMatchObject({ due: false, localDate: '2026-10-29', reason: 'window-expired' })
    expect(dreamerScheduleDecision(new Date('2026-10-29T08:00:01.000Z'), 'UTC'))
      .toMatchObject({ due: false, localDate: '2026-10-29', reason: 'window-expired' })
  })

  it('calculates local dates and non-hour-offset due times without using host time', () => {
    expect(dreamerLocalDate(new Date('2026-10-28T20:14:59.000Z'), 'Asia/Kathmandu'))
      .toBe('2026-10-29')
    expect(dreamerScheduledAt('2026-10-29', 'Asia/Kathmandu').toISOString())
      .toBe('2026-10-28T20:15:00.000Z')
    expect(dreamerScheduleDecision(new Date('2026-10-28T20:15:00.000Z'), 'Asia/Kathmandu'))
      .toMatchObject({ due: true, localDate: '2026-10-29' })
  })

  it('runs once at the first valid minute when Europe/Berlin skips 02:00', () => {
    expect(dreamerScheduledAt('2026-03-29', 'Europe/Berlin').toISOString())
      .toBe('2026-03-29T01:00:00.000Z')
    expect(dreamerScheduleDecision(new Date('2026-03-29T01:00:00.000Z'), 'Europe/Berlin'))
      .toMatchObject({ due: true, localDate: '2026-03-29' })
  })

  it('chooses the first occurrence when Europe/Berlin repeats 02:00', () => {
    expect(dreamerScheduledAt('2026-10-25', 'Europe/Berlin').toISOString())
      .toBe('2026-10-25T00:00:00.000Z')
    expect(dreamerScheduleDecision(new Date('2026-10-25T00:30:00.000Z'), 'Europe/Berlin'))
      .toMatchObject({ due: true, localDate: '2026-10-25' })
    expect(dreamerScheduleDecision(new Date('2026-10-25T01:30:00.000Z'), 'Europe/Berlin'))
      .toMatchObject({ due: true, localDate: '2026-10-25' })
  })

  it('uses the 2026-11-02 America/Los_Angeles local day after the DST fallback', () => {
    const timeZone = 'America/Los_Angeles'
    expect(dreamerLocalDate(new Date('2026-11-02T07:59:59.000Z'), timeZone))
      .toBe('2026-11-01')
    expect(dreamerLocalDate(new Date('2026-11-02T08:00:00.000Z'), timeZone))
      .toBe('2026-11-02')
    expect(dreamerScheduledAt('2026-11-02', timeZone).toISOString())
      .toBe('2026-11-02T10:00:00.000Z')
    expect(dreamerScheduleDecision(new Date('2026-11-02T09:59:59.000Z'), timeZone))
      .toMatchObject({ due: false, localDate: '2026-11-02', reason: 'before-run' })
    expect(dreamerScheduleDecision(new Date('2026-11-02T10:00:00.000Z'), timeZone))
      .toMatchObject({ due: true, localDate: '2026-11-02' })
    expect(dreamerScheduleDecision(new Date('2026-11-02T15:59:59.000Z'), timeZone))
      .toMatchObject({ due: true, localDate: '2026-11-02' })
    expect(dreamerScheduleDecision(new Date('2026-11-02T16:00:00.000Z'), timeZone))
      .toMatchObject({ due: false, localDate: '2026-11-02', reason: 'window-expired' })
  })

  it('rejects invalid IANA zones without falling back to the host zone', () => {
    expect(validateDreamerTimeZone('Not/AZone')).toBe(false)
    expect(() => dreamerLocalDate(new Date(), 'Not/AZone')).toThrow('Invalid Dreamer timezone')
  })
})
