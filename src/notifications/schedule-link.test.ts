import { expect, it } from 'vitest'
import { readScheduleLink, scheduleNotificationLabel } from './schedule-link'

it('accepts canonical same-hub schedule/run links without treating the optional session as the schedule', () => {
  const origin = 'https://hub.example'
  expect(readScheduleLink('/?schedule=review&run=run-1&computer=studio&session=session-2', origin))
    .toEqual({ scheduleId: 'review', runId: 'run-1' })
  expect(readScheduleLink('https://hub.example/?schedule=review', origin)).toEqual({ scheduleId: 'review' })
  for (const url of ['https://other.example/?schedule=review', '//other.example/?schedule=review',
    '/api/settings?schedule=review', '/?schedule=', '/?schedule=one&schedule=two', '/?schedule=one&run=',
    '/?schedule=%0Aone', 'javascript:alert(1)', '/?schedule=one&run=a&run=b']) {
    expect(readScheduleLink(url, origin)).toBeUndefined()
  }
})

it('labels every canonical scheduled outcome and retains a readable future-kind fallback', () => {
  for (const kind of ['succeeded', 'failed', 'needs-input', 'missed', 'interrupted']) {
    expect(scheduleNotificationLabel(`schedule.run.${kind}`)).toBe(`Scheduled · ${kind[0]!.toUpperCase()}${kind.slice(1).replaceAll('-', ' ')}`)
  }
  expect(scheduleNotificationLabel('session.failed')).toBeUndefined()
})
