import { describe, expect, it } from 'vitest'
import type { BackgroundTask } from '../shared/contracts.js'
import {
  BackgroundTaskTracker,
  backgroundTaskSnapshot,
} from './background-task-tracker.js'

function task(
  id: string,
  status: BackgroundTask['status'],
  startedAt = `2026-08-31T18:0${id.length}:00.000Z`,
  executionMode: BackgroundTask['executionMode'] = 'background',
): BackgroundTask {
  return {
    id,
    type: 'agent',
    description: id,
    status,
    startedAt,
    executionMode,
    canCancel: status === 'running' || status === 'queued',
  }
}

describe('BackgroundTaskTracker', () => {
  it('deduplicates tasks and derives the running count', () => {
    expect(
      backgroundTaskSnapshot(
        [
          task('one', 'completed', '2026-08-31T18:01:00.000Z'),
          task('one', 'running', '2026-08-31T18:01:00.000Z'),
          task('two', 'running', '2026-08-31T18:02:00.000Z'),
        ],
        true,
      ),
    ).toMatchObject({
      runningCount: 2,
      tasks: [
        expect.objectContaining({ id: 'two' }),
        expect.objectContaining({ id: 'one', status: 'running' }),
      ],
      supported: true,
    })
  })

  it('does not count synchronous or unclassified running tasks', () => {
    const unclassified = task('unknown', 'running')
    unclassified.executionMode = undefined
    expect(
      backgroundTaskSnapshot(
        [
          task('background', 'running'),
          task('sync', 'running', undefined, 'sync'),
          unclassified,
        ],
        true,
      ),
    ).toMatchObject({
      runningCount: 1,
      tasks: expect.arrayContaining([
        expect.objectContaining({ id: 'background' }),
        expect.objectContaining({ id: 'sync' }),
        expect.objectContaining({ id: 'unknown' }),
      ]),
    })
  })

  it('ignores duplicate snapshots and keeps sessions isolated', () => {
    const tracker = new BackgroundTaskTracker()
    const first = tracker.replace('session-1', [task('one', 'running')], true)
    const duplicate = tracker.replace(
      'session-1',
      [task('one', 'running')],
      true,
    )
    const other = tracker.replace('session-2', [task('two', 'failed')], true)

    expect(first.changed).toBe(true)
    expect(duplicate.changed).toBe(false)
    expect(tracker.get('session-1')).toMatchObject({
      runningCount: 1,
      tasks: [{ id: 'one' }],
    })
    expect(other.snapshot.tasks).toEqual([
      expect.objectContaining({ id: 'two', status: 'failed' }),
    ])
    tracker.remove('session-1')
    expect(tracker.get('session-1')).toEqual({
      tasks: [],
      runningCount: 0,
      supported: false,
    })
    expect(tracker.get('session-2').tasks).toHaveLength(1)
  })
})
