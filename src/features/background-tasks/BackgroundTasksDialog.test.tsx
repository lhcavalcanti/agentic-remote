// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  BackgroundTask,
  BackgroundTaskSnapshot,
} from '../../../shared/contracts'
import { BackgroundTasksDialog } from './BackgroundTasksDialog'
import { BackgroundTasksStatus } from './BackgroundTasksStatus'
import { orderTasksForReading } from './task-order'
import { backgroundTaskStopRequest } from './task-summary'

const NOW = Date.parse('2026-11-21T08:00:00.000Z')
const ago = (seconds: number) => new Date(NOW - seconds * 1_000).toISOString()

function task(id: string, change: Partial<BackgroundTask> = {}): BackgroundTask {
  return {
    id,
    type: 'shell',
    description: id,
    status: 'running',
    executionMode: 'background',
    startedAt: ago(60),
    canCancel: false,
    ...change,
  }
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

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

  it('puts every subagent before the shells, running before finished within each', () => {
    const ordered = orderTasksForReading([
      task('shell-done', { status: 'completed', startedAt: ago(120), completedAt: ago(30) }),
      task('agent-done', { type: 'agent', status: 'completed', startedAt: ago(400), completedAt: ago(380) }),
      task('shell-running', { startedAt: ago(900) }),
      task('agent-running', { type: 'agent', startedAt: ago(60) }),
    ]).map((entry) => entry.id)

    expect(ordered).toEqual(['agent-running', 'agent-done', 'shell-running', 'shell-done'])
  })
})

describe('background tasks status item', () => {
  const shells = (count: number) =>
    Array.from({ length: count }, (_, index) => task(`shell-${index + 1}`))
  const cases: Array<[string, BackgroundTaskSnapshot | undefined, string, string]> = [
    ['nothing reported yet', undefined, '0 tasks', '0 background tasks running'],
    [
      'only finished work',
      { supported: true, runningCount: 0, tasks: [task('done', { status: 'completed', completedAt: ago(5) })] },
      '0 tasks',
      '0 background tasks running',
    ],
    ['one shell', { supported: true, runningCount: 1, tasks: shells(1) }, '1 task', '1 background task running'],
    ['several shells', { supported: true, runningCount: 3, tasks: shells(3) }, '3 tasks', '3 background tasks running'],
    [
      'a subagent among shells',
      { supported: true, runningCount: 4, tasks: [...shells(3), task('agent', { type: 'agent' })] },
      '4 tasks · 1 subagent',
      '4 background tasks running, 1 subagent',
    ],
    [
      'a synchronous subagent beside background work',
      {
        supported: true,
        runningCount: 2,
        tasks: [
          ...shells(1),
          task('background-agent', { type: 'agent' }),
          task('sync-agent', { type: 'agent', executionMode: 'sync' }),
          task('queued-agent', { type: 'agent', status: 'queued' }),
          task('finished-agent', { type: 'agent', status: 'completed', completedAt: ago(5) }),
        ],
      },
      '3 tasks · 2 subagents',
      '3 background tasks running, 2 subagents',
    ],
    [
      'a lone synchronous subagent',
      { supported: true, runningCount: 0, tasks: [task('sync-agent', { type: 'agent', executionMode: 'sync' })] },
      '1 task · 1 subagent',
      '1 background task running, 1 subagent',
    ],
    [
      'a runtime that does not report tasks',
      { supported: false, runningCount: 0, tasks: [task('sync-agent', { type: 'agent', executionMode: 'sync' })] },
      '0 tasks',
      '0 background tasks running',
    ],
  ]

  it.each(cases)('names %s in words and opens the sheet', (_case, snapshot, text, name) => {
    const onOpen = vi.fn()
    render(<BackgroundTasksStatus onOpen={onOpen} snapshot={snapshot} />)

    const item = screen.getByRole('button', { name })
    expect(item.textContent).toBe(text)
    expect(item).toHaveAccessibleDescription('View background tasks')
    fireEvent.click(item)
    expect(onOpen).toHaveBeenCalledOnce()
  })
})

describe('background tasks sheet', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW })
  })

  type SheetProps = ComponentProps<typeof BackgroundTasksDialog>

  function renderSheet(snapshot: BackgroundTaskSnapshot, change: Partial<SheetProps> = {}) {
    const handlers = {
      onAskToStop: vi.fn(),
      onCancel: vi.fn(),
      onClose: vi.fn(),
      onRefresh: vi.fn(),
    }
    const props = (next: Partial<SheetProps>): SheetProps => ({
      loading: false,
      open: true,
      ownerKey: 'studio:field-notes',
      sessionTitle: 'Field notes',
      snapshot,
      stopActionsDisabled: false,
      ...handlers,
      ...change,
      ...next,
    })
    const view = render(<BackgroundTasksDialog {...props({})} />)
    return {
      ...handlers,
      rerender: (next: Partial<SheetProps>) => view.rerender(<BackgroundTasksDialog {...props(next)} />),
    }
  }

  const rowToggle = (name: string) => screen.getByRole('button', { name })

  it("summarizes running work in the words the status item is named by", () => {
    renderSheet({
      supported: true,
      runningCount: 3,
      tasks: [
        task('shell-1'),
        task('shell-2'),
        task('agent', { type: 'agent' }),
        task('sync-agent', { type: 'agent', executionMode: 'sync' }),
        task('done', { status: 'completed', completedAt: ago(5) }),
      ],
    })

    expect(screen.getByRole('status')).toHaveTextContent(/^4 background tasks running, 2 subagents$/)
  })

  it('lists one row per task, subagents first and running before finished within each', () => {
    renderSheet({
      supported: true,
      runningCount: 2,
      tasks: [
        task('build', { description: 'pnpm build', status: 'failed', startedAt: ago(120), completedAt: ago(30) }),
        task('lint-agent', {
          type: 'agent', description: 'Lint the docs', status: 'completed', startedAt: ago(400), completedAt: ago(380),
        }),
        task('dev', { description: 'pnpm dev', startedAt: ago(7_530) }),
        task('guide-agent', { type: 'agent', executionMode: 'sync', description: 'Check the guide links', startedAt: ago(65) }),
        task('watch', { description: 'pnpm test --watch', status: 'queued', startedAt: ago(125) }),
        task('review-agent', { type: 'agent', description: 'Review recovery paths', startedAt: ago(250) }),
      ],
    })

    const rows = screen.getAllByRole('button', { expanded: false })
    const expected = [
      ['Running subagent: Review recovery paths', 'Subagent', 'Running for 4m 10s'],
      ['Running subagent: Check the guide links', 'Subagent', 'Running for 1m 5s'],
      ['Completed subagent: Lint the docs', 'Subagent', 'Ran for 20s'],
      ['Running shell: pnpm dev', 'Shell', 'Running for 2h 5m'],
      ['Queued shell: pnpm test --watch', 'Shell', 'Queued for 2m 5s'],
      ['Failed shell: pnpm build', 'Shell', 'Ran for 1m 30s'],
    ]
    expect(rows).toHaveLength(expected.length)
    expected.forEach(([name, kind, elapsed], index) => {
      expect(rows[index]).toHaveAccessibleName(name)
      expect(rows[index]).toHaveAccessibleDescription(elapsed)
      expect(within(rows[index]).getByText(kind)).toBeInTheDocument()
    })
    expect(screen.getByRole('list', { name: 'Background task list' }).children).toHaveLength(6)
  })

  it('keeps the elapsed time of running work current while the sheet is open', () => {
    renderSheet({ supported: true, runningCount: 1, tasks: [task('dev', { description: 'pnpm dev', startedAt: ago(70) })] })
    const toggle = rowToggle('Running shell: pnpm dev')
    expect(toggle).toHaveAccessibleDescription('Running for 1m 10s')

    act(() => {
      vi.advanceTimersByTime(5_000)
    })

    expect(toggle).toHaveAccessibleDescription('Running for 1m 15s')
  })

  it('opens a row onto its details in place and closes it again', () => {
    renderSheet({
      supported: true,
      runningCount: 2,
      tasks: [
        task('review-agent', {
          type: 'agent',
          description: 'Review recovery paths',
          agentType: 'code-review',
          prompt: 'Review the recovery paths.',
          startedAt: ago(250),
          activeTimeMs: 200_000,
          latestResponse: 'Two links are stale.',
          progress: {
            type: 'agent',
            latestIntent: 'Comparing the checklist',
            recentActivity: [{ message: 'Read the field guide', timestamp: ago(30) }],
          },
        }),
        task('dev', { description: 'pnpm dev', command: 'pnpm dev --host 127.0.0.1' }),
      ],
    })
    const toggle = rowToggle('Running subagent: Review recovery paths')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).not.toHaveAttribute('aria-controls')
    expect(screen.queryByText('Comparing the checklist')).not.toBeInTheDocument()

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(toggle.getAttribute('aria-controls')!)!
    expect(within(panel).getByText('code-review')).toBeInTheDocument()
    expect(within(panel).getByText('Review the recovery paths.')).toBeInTheDocument()
    expect(within(panel).getByText('Comparing the checklist')).toBeInTheDocument()
    expect(within(panel).getByText('Read the field guide')).toBeInTheDocument()
    expect(within(panel).getByText('Two links are stale.')).toBeInTheDocument()
    expect(within(panel).getByText('3m 20s')).toBeInTheDocument()
    expect(rowToggle('Running shell: pnpm dev')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('pnpm dev --host 127.0.0.1')).not.toBeInTheDocument()

    fireEvent.click(rowToggle('Running shell: pnpm dev'))
    expect(screen.getByText('pnpm dev --host 127.0.0.1')).toBeInTheDocument()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).not.toHaveAttribute('aria-controls')
    expect(panel).not.toBeInTheDocument()
    expect(screen.getByText('pnpm dev --host 127.0.0.1')).toBeInTheDocument()
  })

  describe('when the list carries summaries', () => {
    const flush = () => act(async () => {
      for (let tick = 0; tick < 5; tick += 1) await Promise.resolve()
    })
    const summarized = task('dev', {
      description: 'pnpm dev',
      command: '…--host 127.0.0.1',
      progress: { type: 'shell', recentOutput: '…ready in 300 ms' },
    })
    const whole = {
      ...summarized,
      command: 'pnpm dev --host 127.0.0.1',
      pid: 4242,
      progress: { type: 'shell' as const, recentOutput: 'vite starting\nready in 300 ms' },
    }
    const other = task('watch', { description: 'pnpm test --watch' })
    const listed = (...tasks: BackgroundTask[]): BackgroundTaskSnapshot =>
      ({ supported: true, runningCount: tasks.length, summary: true, tasks })

    it('reads an opened task whole, and again only when that task changes', async () => {
      const readTask = vi.fn(async () => whole)
      const sheet = renderSheet(listed(summarized, other), { readTask })
      expect(readTask).not.toHaveBeenCalled()

      fireEvent.click(rowToggle('Running shell: pnpm dev'))
      // What the list has shows at once, while the rest is read.
      expect(screen.getByText('…--host 127.0.0.1')).toBeInTheDocument()
      expect(screen.getByText('Loading full details…')).toBeInTheDocument()
      await flush()
      expect(readTask).toHaveBeenCalledExactlyOnceWith('dev')
      expect(screen.getByText('pnpm dev --host 127.0.0.1')).toBeInTheDocument()
      expect(screen.getByText(/vite starting/)).toBeInTheDocument()
      expect(screen.getByText('4242')).toBeInTheDocument()
      expect(screen.queryByText('Loading full details…')).not.toBeInTheDocument()

      // Another task changing leaves this one as it was read.
      sheet.rerender({ snapshot: listed(summarized, { ...other, status: 'completed', completedAt: ago(1) }) })
      await flush()
      expect(readTask).toHaveBeenCalledOnce()

      readTask.mockResolvedValueOnce({ ...whole, progress: { type: 'shell', recentOutput: 'vite starting\npage reloaded' } })
      sheet.rerender({ snapshot: listed({ ...summarized, progress: { type: 'shell', recentOutput: '…page reloaded' } }, other) })
      await flush()
      expect(readTask).toHaveBeenCalledTimes(2)
      expect(screen.getByText(/page reloaded/)).toBeInTheDocument()
    })

    it('reads a task that changes while it is being read once more, after the first answer', async () => {
      const answers: Array<(value: BackgroundTask) => void> = []
      const readTask = vi.fn(() => new Promise<BackgroundTask>((resolve) => answers.push(resolve)))
      const sheet = renderSheet(listed(summarized), { readTask })
      fireEvent.click(rowToggle('Running shell: pnpm dev'))
      await flush()
      sheet.rerender({ snapshot: listed({ ...summarized, pid: 1 }) })
      sheet.rerender({ snapshot: listed({ ...summarized, pid: 2 }) })
      await flush()
      expect(readTask).toHaveBeenCalledOnce()
      answers[0](whole)
      await flush()
      expect(screen.getByText('pnpm dev --host 127.0.0.1')).toBeInTheDocument()
      expect(readTask).toHaveBeenCalledTimes(2)
      answers[1]({ ...whole, command: 'pnpm dev --host 0.0.0.0' })
      await flush()
      expect(screen.getByText('pnpm dev --host 0.0.0.0')).toBeInTheDocument()
      expect(readTask).toHaveBeenCalledTimes(2)
    })

    it('keeps what the list has, and says so, when the task cannot be read whole', async () => {
      const readTask = vi.fn(async () => { throw new Error('Background task not found') })
      renderSheet(listed(summarized), { readTask })
      fireEvent.click(rowToggle('Running shell: pnpm dev'))
      await flush()
      expect(screen.getByText('…--host 127.0.0.1')).toBeInTheDocument()
      expect(screen.getByText('Full details could not be loaded; this is what the list has.')).toBeInTheDocument()
    })

    it('shows a whole task as it is, without reading it', async () => {
      const readTask = vi.fn(async () => whole)
      renderSheet({ ...listed(whole), summary: undefined }, { readTask })
      fireEvent.click(rowToggle('Running shell: pnpm dev'))
      await flush()
      expect(readTask).not.toHaveBeenCalled()
      expect(screen.getByText('pnpm dev --host 127.0.0.1')).toBeInTheDocument()
      expect(screen.queryByText('Loading full details…')).not.toBeInTheDocument()
    })
  })

  it('shows the last five activity entries until all of them are asked for', () => {
    const steps = (count: number) => Array.from({ length: count }, (_, index) => ({
      message: `Step ${index + 1}`,
      timestamp: ago(100 - index * 10),
    }))
    renderSheet({
      supported: true,
      runningCount: 2,
      tasks: [
        task('review-agent', {
          type: 'agent', description: 'Review recovery paths', progress: { type: 'agent', recentActivity: steps(8) },
        }),
        task('guide-agent', {
          type: 'agent', description: 'Check the guide links', progress: { type: 'agent', recentActivity: steps(5) },
        }),
      ],
    })
    fireEvent.click(rowToggle('Running subagent: Review recovery paths'))
    const activity = screen.getByRole('list', { name: 'Recent activity' })
    expect(within(activity).getAllByRole('listitem')).toHaveLength(5)
    expect(within(activity).queryByText('Step 3')).not.toBeInTheDocument()
    expect(within(activity).getByText('Step 4')).toBeInTheDocument()
    expect(within(activity).getByText('Step 8')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show all (8)' }))
    expect(within(activity).getAllByRole('listitem')).toHaveLength(8)
    expect(within(activity).getByText('Step 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show last 5' }))
    expect(within(activity).getAllByRole('listitem')).toHaveLength(5)

    fireEvent.click(rowToggle('Running subagent: Review recovery paths'))
    fireEvent.click(rowToggle('Running subagent: Check the guide links'))
    expect(within(screen.getByRole('list', { name: 'Recent activity' })).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.queryByRole('button', { name: /^Show all/ })).not.toBeInTheDocument()
  })

  it('offers Stop on the row only for a task the runtime can stop, with its pending state', () => {
    const { onCancel, rerender } = renderSheet({
      supported: true,
      runningCount: 2,
      tasks: [
        task('review-agent', { type: 'agent', description: 'Review recovery paths', canCancel: true }),
        task('dev', { description: 'pnpm dev', attachmentMode: 'detached' }),
        task('build', { description: 'pnpm build', status: 'completed', completedAt: ago(5) }),
      ],
    })

    fireEvent.click(screen.getByRole('button', { name: 'Stop task: Review recovery paths' }))
    expect(onCancel).toHaveBeenCalledExactlyOnceWith('review-agent')
    expect(screen.queryByRole('button', { name: /^Stop task: pnpm/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask to stop: pnpm dev' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ask to stop: Review recovery paths' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ask to stop: pnpm build' })).not.toBeInTheDocument()

    rerender({ cancellingTaskId: 'review-agent', stopActionsDisabled: true })
    expect(screen.getByRole('button', { name: 'Stopping task: Review recovery paths' })).toBeDisabled()
  })

  it('asks the agent to stop a running task the runtime cannot stop', () => {
    const dev = task('shell-7', { description: 'pnpm dev' })
    const { onAskToStop, onCancel } = renderSheet({ supported: true, runningCount: 1, tasks: [dev] })

    fireEvent.click(screen.getByRole('button', { name: 'Ask to stop: pnpm dev' }))

    expect(onAskToStop).toHaveBeenCalledExactlyOnceWith(dev)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('explains once for the whole sheet when no running task can be stopped', () => {
    renderSheet({
      supported: true,
      runningCount: 3,
      tasks: [
        task('review-agent', { type: 'agent', description: 'Review recovery paths' }),
        task('dev', { description: 'pnpm dev' }),
        task('watch', { description: 'pnpm test --watch' }),
        task('lint', { description: 'pnpm lint', status: 'completed', completedAt: ago(5) }),
      ],
    })

    expect(screen.getAllByText('Stop unavailable.')).toHaveLength(1)
    expect(screen.getByRole('note')).toHaveTextContent(
      'The owning runtime did not expose a live stop handle for these tasks.',
    )
    fireEvent.click(rowToggle('Running shell: pnpm dev'))
    expect(screen.getAllByText('Stop unavailable.')).toHaveLength(1)
  })

  it('keeps which rows are open to the session they were opened in', () => {
    const { rerender } = renderSheet({ supported: true, runningCount: 1, tasks: [task('shell-1', { description: 'pnpm dev' })] })
    fireEvent.click(rowToggle('Running shell: pnpm dev'))
    expect(rowToggle('Running shell: pnpm dev')).toHaveAttribute('aria-expanded', 'true')

    rerender({
      ownerKey: 'studio:other-session',
      sessionTitle: 'Other session',
      snapshot: { supported: true, runningCount: 1, tasks: [task('shell-1', { description: 'pnpm test' })] },
    })

    expect(rowToggle('Running shell: pnpm test')).toHaveAttribute('aria-expanded', 'false')
  })

  it("gives a task's own reason in its details when other tasks can be stopped", () => {
    renderSheet({
      supported: true,
      runningCount: 2,
      tasks: [
        task('review-agent', { type: 'agent', description: 'Review recovery paths', canCancel: true }),
        task('dev', { description: 'pnpm dev', attachmentMode: 'detached' }),
      ],
    })

    expect(screen.queryByRole('note')).not.toBeInTheDocument()
    expect(screen.queryByText('Stop unavailable.')).not.toBeInTheDocument()
    fireEvent.click(rowToggle('Running shell: pnpm dev'))
    expect(screen.getByText(/This detached task has no live stop handle\./)).toBeInTheDocument()
  })
})

describe('stop request', () => {
  it('names the task by its id and title on one line', () => {
    expect(backgroundTaskStopRequest(task('shell-12', { description: 'pnpm dev\n   --host 127.0.0.1' }))).toBe(
      'Stop the background task `shell-12` (pnpm dev --host 127.0.0.1) and tell me when it has stopped.',
    )
  })
})
