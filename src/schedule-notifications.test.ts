import { describe, expect, it } from 'vitest'
import { notificationState, shellNotifications, type NotifiableSession } from './shell-notifications'

describe('schedule-provenance native suppression', () => {
  it.each([
    { status: 'idle' },
    { status: 'waiting', pendingPermission: { requestId: 'permission' } },
    { status: 'waiting', pendingUserInput: { requestId: 'question' } },
  ])('does not reclassify ordinary %j updates that the hub suppresses', (change) => {
    const before: NotifiableSession = { computerId: 'fictional-studio', id: 'scheduled', title: 'Scheduled review', status: 'running' }
    const previous = notificationState([before])
    expect(shellNotifications([{ ...before, ...change, suppressOrdinaryNotifications: true }], { previous })).toEqual([])
    expect(shellNotifications([{ ...before, ...change }], { previous })).toHaveLength(1)
  })
})
