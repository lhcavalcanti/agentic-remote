import { describe, expect, it } from 'vitest'
import { orderTasksForReading } from './task-order'

describe('background task ordering', () => {
  it('puts running tasks first and the newest finished one above older ones', () => {
    const task = (
      id: string,
      status: 'running' | 'queued' | 'completed' | 'failed',
      startedAt: string,
      completedAt?: string,
    ) => ({
      id,
      type: 'shell' as const,
      description: id,
      status,
      startedAt,
      canCancel: false,
      ...(completedAt ? { completedAt } : {}),
    })

    const ordered = orderTasksForReading([
      task(
        'done-old',
        'completed',
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:01:00.000Z',
      ),
      task('run-new', 'running', '2026-01-01T00:05:00.000Z'),
      task(
        'done-new',
        'completed',
        '2026-01-01T00:02:00.000Z',
        '2026-01-01T00:03:00.000Z',
      ),
      task('run-old', 'running', '2026-01-01T00:04:00.000Z'),
      task('queued', 'queued', '2026-01-01T00:06:00.000Z'),
    ]).map((entry) => entry.id)

    expect(ordered).toEqual([
      'run-old',
      'run-new',
      'queued',
      'done-new',
      'done-old',
    ])
  })

  it('places a finished task with no end time by when it began', () => {
    const ordered = orderTasksForReading([
      {
        id: 'no-end',
        type: 'shell' as const,
        description: 'no-end',
        status: 'failed' as const,
        startedAt: '2026-01-01T00:09:00.000Z',
        canCancel: false,
      },
      {
        id: 'ended-earlier',
        type: 'shell' as const,
        description: 'ended-earlier',
        status: 'completed' as const,
        startedAt: '2026-01-01T00:01:00.000Z',
        completedAt: '2026-01-01T00:02:00.000Z',
        canCancel: false,
      },
    ]).map((entry) => entry.id)

    expect(ordered).toEqual(['no-end', 'ended-earlier'])
  })
})
