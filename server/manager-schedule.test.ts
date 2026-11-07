import { describe, expect, it } from 'vitest'
import {
  deferManagerCheckUntilAllowed,
  isManagerCheckQuiet,
  managerCheckDefaults,
  managerScheduledMessageId,
  nextManagerCheckAt,
  validateManagerProactiveSettings,
} from './manager-schedule.js'

describe('Oracle periodic check schedule', () => {
  it('uses the configured cadence outside quiet hours', () => {
    const settings = managerCheckDefaults()
    expect(nextManagerCheckAt(new Date('2026-11-04T12:00:00.000Z'), settings).toISOString())
      .toBe('2026-11-04T14:00:00.000Z')
  })

  it('defers a cadence target to the end of overnight quiet hours', () => {
    const settings = managerCheckDefaults()
    expect(nextManagerCheckAt(new Date('2026-11-04T21:30:00.000Z'), settings).toISOString())
      .toBe('2026-11-05T07:00:00.000Z')
    expect(isManagerCheckQuiet(new Date('2026-11-04T23:00:00.000Z'), settings)).toBe(true)
    expect(isManagerCheckQuiet(new Date('2026-11-05T06:59:00.000Z'), settings)).toBe(true)
    expect(isManagerCheckQuiet(new Date('2026-11-05T07:00:00.000Z'), settings)).toBe(false)
  })

  it('defers an already-due check only until quiet hours end', () => {
    expect(deferManagerCheckUntilAllowed(
      new Date('2026-11-05T06:00:00.000Z'),
      managerCheckDefaults(),
    ).toISOString()).toBe('2026-11-05T07:00:00.000Z')
  })

  it('supports daytime quiet hours and treats equal hours as disabled', () => {
    const daytime = {
      ...managerCheckDefaults(),
      quietStartHour: 9,
      quietEndHour: 17,
    }
    expect(isManagerCheckQuiet(new Date('2026-11-04T12:00:00.000Z'), daytime)).toBe(true)
    expect(isManagerCheckQuiet(new Date('2026-11-04T18:00:00.000Z'), daytime)).toBe(false)
    expect(isManagerCheckQuiet(new Date('2026-11-04T12:00:00.000Z'), {
      ...daytime,
      quietEndHour: 9,
    })).toBe(false)
  })

  it('uses the saved timezone instead of the host timezone', () => {
    const settings = {
      ...managerCheckDefaults(),
      timeZone: 'Asia/Kathmandu',
      cadenceMinutes: 60 as const,
      quietStartHour: 22,
      quietEndHour: 7,
    }
    expect(isManagerCheckQuiet(new Date('2026-11-04T16:30:00.000Z'), settings)).toBe(true)
    expect(nextManagerCheckAt(new Date('2026-11-04T15:45:00.000Z'), settings).toISOString())
      .toBe('2026-11-05T01:15:00.000Z')
  })

  it('rejects invalid cadence, timezone, and quiet-hour values', () => {
    expect(() => validateManagerProactiveSettings({
      ...managerCheckDefaults(),
      cadenceMinutes: 30 as 60,
    })).toThrow('cadence')
    expect(() => validateManagerProactiveSettings({
      ...managerCheckDefaults(),
      timeZone: 'Not/AZone',
    })).toThrow('timezone')
    expect(() => validateManagerProactiveSettings({
      ...managerCheckDefaults(),
      quietStartHour: 24,
    })).toThrow('quiet')
  })

  it('derives one stable bounded message id per scheduled instant', () => {
    const scheduledFor = '2026-11-04T14:00:00.000Z'
    expect(managerScheduledMessageId(scheduledFor)).toBe(managerScheduledMessageId(scheduledFor))
    expect(managerScheduledMessageId(scheduledFor)).not.toBe(
      managerScheduledMessageId('2026-11-04T16:00:00.000Z'),
    )
    expect(managerScheduledMessageId(scheduledFor)).toMatch(/^scheduled-[a-f0-9]{64}$/)
  })
})
