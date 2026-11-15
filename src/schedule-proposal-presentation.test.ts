import { describe, expect, it } from 'vitest'
import { scheduleCreateSchema } from '../shared/schedules'
import { proposalTiming } from './schedule-proposal-presentation'

describe('schedule proposal timing', () => {
  it.each([
    ['America/Los_Angeles', 'disable', 'Once at Sep 7, 2026, 9:00 AM PDT · paused; no automatic run'],
    ['UTC', 'archive', 'Once at Sep 7, 2026, 4:00 PM UTC · no automatic run after archiving'],
  ] as const)('shows the one-off timezone once for %s %s', (timezone, operation, expected) => {
    const schedule = scheduleCreateSchema.parse({
      name: 'Fictional one-off review', prompt: 'Review the fictional guide.',
      target: { computerId: 'fictional-studio', folder: '/fictional/repo', provider: 'copilot' },
      recurrence: { type: 'once', at: '2026-09-07T16:00:00Z' }, timezone, enabled: false,
    })
    expect(proposalTiming(schedule, operation, new Date('2026-09-04T16:20:00Z'))).toBe(expected)
  })
})
