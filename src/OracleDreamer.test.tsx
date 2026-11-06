// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DreamerMorningPlan, DreamerSettings } from './OracleDreamer'
import {
  dispatchDreamerTask,
  DreamerApiError,
  getDreamer,
  saveDreamerSettings,
  updateDreamerPlan,
} from './dreamer-api'

vi.mock('./dreamer-api', () => ({
  getDreamer: vi.fn(),
  dispatchDreamerTask: vi.fn(),
  saveDreamerSettings: vi.fn(),
  updateDreamerPlan: vi.fn(),
  DreamerApiError: class extends Error {
    readonly status: number
    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
}))

const initial = {
  available: true,
  revision: 3,
  settings: { enabled: false, timeZone: 'Europe/Berlin' },
}
const plan = {
  id: 'daily-plan',
  localDate: '2026-10-29',
  timeZone: 'Europe/Berlin',
  createdAt: '2026-10-29T01:00:00.000Z',
  coverage: ['Session journal metadata only.', 'Durable todos unavailable.'],
  omitted: 2,
  items: [
    { id: 'a', label: 'Review failed session', reason: 'Last observed status was error.', source: 'session' as const, status: 'pending' as const },
    { id: 'b', label: 'Review remembered decision', reason: 'Active memory metadata.', source: 'memory' as const, status: 'pending' as const },
  ],
}
const ready = { ...initial, settings: { ...initial.settings, enabled: true }, plan }
const completionCandidate = {
  source: 'root-task-complete' as const,
  computerId: 'computer-a',
  sessionId: 'session-a',
  sessionRevision: 7,
  messageId: 'completion-message',
  toolCallId: 'task-complete-call',
  completedAt: '2026-10-29T03:20:00.000Z',
  resultDigest: 'a'.repeat(64),
  summary: '**Done.** The requested change passed its focused checks.',
}

async function openMorningPlan() {
  fireEvent.click(await screen.findByText('Morning plan'))
  await screen.findByRole('list', { name: 'Dreamer priorities' })
}

describe('Dreamer settings and morning review', () => {
  beforeEach(() => {
    vi.mocked(getDreamer).mockReset().mockResolvedValue(initial)
    vi.mocked(dispatchDreamerTask).mockReset()
    vi.mocked(saveDreamerSettings).mockReset()
    vi.mocked(updateDreamerPlan).mockReset()
  })

  it('distinguishes journal suggestions from durable follow-up work', async () => {
    const journalPlan = {
      ...plan,
      items: [{
        ...plan.items[0],
        computerId: 'computer-a',
        sessionId: 'session-a',
      }],
    }
    const investigated = {
      ...ready,
      revision: 4,
      plan: {
        ...journalPlan,
        items: [{ ...journalPlan.items[0], status: 'skipped' as const }],
      },
      tasks: [{
        id: 'oracle-task-a',
        revision: 1,
        title: 'Review failed session',
        summary: 'Last observed status was error.',
        nextAction: 'Oracle will reproduce the failure.',
        owner: 'oracle' as const,
        status: 'queued' as const,
        sourceEventIds: ['a'.repeat(64)],
        attempts: [{
          id: 'attempt-a',
          requestId: 'request-a',
          managerMessageId: 'manager-a',
          status: 'queued' as const,
          sessionRefs: [],
        }],
        createdAt: '2026-10-29T04:00:00.000Z',
        updatedAt: '2026-10-29T04:00:00.000Z',
      }],
    }
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, plan: journalPlan })
    vi.mocked(updateDreamerPlan).mockResolvedValue(investigated)
    render(<DreamerMorningPlan />)
    await openMorningPlan()

    expect(screen.getByText('Oracle has not investigated or assigned this work.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ask Oracle to investigate' }))
    await screen.findByText('Follow-up work')
    expect(updateDreamerPlan).toHaveBeenCalledWith({
      revision: 3,
      planId: 'daily-plan',
      investigate: {
        itemId: 'a',
        requestId: expect.any(String),
      },
    })
    expect(screen.getByText('queued · Oracle')).toBeInTheDocument()
    expect(screen.queryByText('Plan saved.')).toBeInTheDocument()
  })

  it('shows blocked evidence and retries a durable task without claiming completion', async () => {
    const blockedTask = {
      id: 'oracle-task-a',
      revision: 4,
      title: 'Run the focused queue test',
      summary: 'The queue regression needs execution.',
      nextAction: 'Reconnect the execution session, then retry.',
      owner: 'oracle' as const,
      status: 'blocked' as const,
      blockedReason: 'Execution stopped without verified completion.',
      sourceEventIds: ['a'.repeat(64)],
      attempts: [{
        id: 'attempt-old',
        requestId: 'request-old',
        managerMessageId: 'manager-old',
        status: 'failed' as const,
        sessionRefs: [],
        error: 'Execution backend unavailable.',
      }, {
        id: 'attempt-a',
        requestId: 'request-a',
        managerMessageId: 'manager-a',
        status: 'blocked' as const,
        sessionRefs: [{ computerId: 'computer-a', sessionId: 'execution-a' }],
        error: 'Execution stopped without verified completion.',
      }],
      evidence: [{
        id: 'evidence-a',
        kind: 'test' as const,
        label: 'pnpm vitest run queue',
        status: 'failed' as const,
        result: '1 test failed',
      }],
      createdAt: '2026-10-29T04:00:00.000Z',
      updatedAt: '2026-10-29T04:10:00.000Z',
    }
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, tasks: [blockedTask] })
    vi.mocked(dispatchDreamerTask).mockResolvedValue({
      ...ready,
      tasks: [{ ...blockedTask, revision: 5, status: 'queued' as const }],
    })
    render(<DreamerMorningPlan />)
    await openMorningPlan()

    expect(screen.getByText(blockedTask.blockedReason)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Execution evidence (1)'))
    expect(screen.getByText('1 test failed')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Attempt history (2)'))
    expect(screen.getByText(/Attempt 1: failed/)).toHaveTextContent('Execution backend unavailable.')
    expect(screen.getByRole('link', { name: 'Open session' })).toHaveAttribute(
      'href',
      '/?computer=computer-a&session=execution-a',
    )
    expect(screen.queryByRole('button', { name: 'Confirm completed' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(dispatchDreamerTask).toHaveBeenCalledWith(
      'oracle-task-a',
      { revision: 4, requestId: expect.any(String) },
    ))
    expect(await screen.findByText('queued · Oracle')).toBeInTheDocument()
  })

  it('reviews and confirms only trusted task completion evidence', async () => {
    const task = {
      id: 'oracle-task-a',
      revision: 6,
      title: 'Run the focused queue test',
      summary: 'The queue regression needs execution.',
      nextAction: 'Review the verified result.',
      owner: 'oracle' as const,
      status: 'review' as const,
      sourceEventIds: ['a'.repeat(64)],
      attempts: [{
        id: 'attempt-a',
        requestId: 'request-a',
        managerMessageId: 'manager-a',
        status: 'review' as const,
        sessionRefs: [{ computerId: 'computer-a', sessionId: 'execution-a' }],
      }],
      completionCandidate: {
        ...completionCandidate,
        attemptId: 'attempt-a',
        sessionId: 'execution-a',
      },
      createdAt: '2026-10-29T04:00:00.000Z',
      updatedAt: '2026-10-29T04:10:00.000Z',
    }
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, tasks: [task] })
    vi.mocked(updateDreamerPlan).mockResolvedValue({
      ...ready,
      tasks: [{ ...task, revision: 7, status: 'completed' as const }],
    })
    render(<DreamerMorningPlan />)
    await openMorningPlan()

    fireEvent.click(screen.getByRole('button', { name: 'Review result' }))
    expect(screen.getByText('Verified execution result')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm completed' }))
    await waitFor(() => expect(updateDreamerPlan).toHaveBeenCalledWith({
      revision: 3,
      planId: 'daily-plan',
      taskCompletion: {
        taskId: 'oracle-task-a',
        taskRevision: 6,
        attemptId: 'attempt-a',
        computerId: 'computer-a',
        sessionId: 'execution-a',
        sessionRevision: 7,
        messageId: 'completion-message',
        resultDigest: 'a'.repeat(64),
      },
    }))
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('saves explicit enablement and the edited timezone at the loaded revision', async () => {
    vi.mocked(saveDreamerSettings).mockResolvedValue({ ...ready, revision: 4 })
    render(<DreamerSettings />)
    const enabled = await screen.findByRole('checkbox', { name: 'Enable Dreamer' })
    expect(enabled).not.toBeChecked()
    fireEvent.click(enabled)
    fireEvent.change(screen.getByLabelText('Dreamer timezone'), { target: { value: 'Asia/Kathmandu' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText('Dreamer settings saved.')
    expect(saveDreamerSettings).toHaveBeenCalledWith({
      revision: 3, enabled: true, timeZone: 'Asia/Kathmandu',
    })
    expect(screen.getByText(/02:00/)).toBeInTheDocument()
  })

  it('retains the input and shows a save failure instead of claiming success', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValue(new DreamerApiError('Invalid timezone.', 400))
    render(<DreamerSettings />)
    fireEvent.change(await screen.findByLabelText('Dreamer timezone'), { target: { value: 'Invalid/Zone' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid timezone.')
    expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('Invalid/Zone')
    expect(screen.queryByText('Dreamer settings saved.')).not.toBeInTheDocument()
  })

  it('allows disabling with the saved timezone', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(saveDreamerSettings).mockResolvedValue({ ...initial, revision: 4 })
    render(<DreamerSettings />)
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable Dreamer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText('Dreamer settings saved.')
    expect(saveDreamerSettings).toHaveBeenCalledWith({ revision: 3, enabled: false, timeZone: 'Europe/Berlin' })
  })

  it('refreshes conflicted settings and asks the user to review rather than overwrite', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValue(new DreamerApiError('Stale settings.', 409))
    render(<DreamerSettings />)
    await screen.findByLabelText('Dreamer timezone')
    vi.mocked(getDreamer).mockResolvedValue({ ...initial, revision: 9, settings: { enabled: true, timeZone: 'UTC' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/changed elsewhere/)
    expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('UTC')
  })

  it('keeps unsaved settings when conflict recovery cannot refresh', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValue(new DreamerApiError('Stale settings.', 409))
    render(<DreamerSettings />)
    fireEvent.change(await screen.findByLabelText('Dreamer timezone'), { target: { value: 'Asia/Kathmandu' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Dreamer' }))
    vi.mocked(getDreamer).mockRejectedValue(new Error('Hub offline.'))
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not refresh/i)
    expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('Asia/Kathmandu')
    expect(screen.getByRole('checkbox', { name: 'Enable Dreamer' })).toBeChecked()
  })

  it('adopts saved settings on successful retry rather than rebasing a stale draft', async () => {
    vi.mocked(saveDreamerSettings).mockRejectedValueOnce(new DreamerApiError('Stale settings.', 409))
    render(<DreamerSettings />)
    fireEvent.change(await screen.findByLabelText('Dreamer timezone'), { target: { value: 'Asia/Kathmandu' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Dreamer' }))
    vi.mocked(getDreamer).mockRejectedValueOnce(new Error('Hub offline.'))
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText(/Could not refresh Dreamer settings/)
    vi.mocked(getDreamer).mockResolvedValue({
      ...initial, revision: 9, settings: { enabled: false, timeZone: 'UTC' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Retry Dreamer' }))
    await waitFor(() => expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('UTC'))
    expect(screen.getByRole('checkbox', { name: 'Enable Dreamer' })).not.toBeChecked()
    vi.mocked(saveDreamerSettings).mockResolvedValue({
      ...initial, revision: 10, settings: { enabled: false, timeZone: 'UTC' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText('Dreamer settings saved.')
    expect(saveDreamerSettings).toHaveBeenLastCalledWith({
      revision: 9, enabled: false, timeZone: 'UTC',
    })
  })

  it('shows a dated priority list and honest coverage without claiming task completion', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    expect(screen.getByText(/2026-10-29/)).toBeInTheDocument()
    expect(screen.getByText('Durable todos unavailable.')).toBeInTheDocument()
    expect(screen.getByText(/2 additional candidates/)).toBeInTheDocument()
    expect(screen.getByText(/Suggestions are observations, not proof that work ran/)).toBeInTheDocument()
    const items = within(screen.getByRole('list', { name: 'Dreamer priorities' })).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Review failed session')
    expect(items[1]).toHaveTextContent('Review remembered decision')
  })

  it('requires explicit confirmation before applying authoritative session completion evidence', async () => {
    const proposed = {
      ...ready,
      plan: {
        ...plan,
        items: [{
          ...plan.items[0],
          source: 'carry' as const,
          computerId: 'computer-a',
          sessionId: 'session-a',
          completionCandidate,
        }, plan.items[1]],
      },
    }
    const completed = {
      ...proposed,
      revision: 4,
      plan: {
        ...proposed.plan,
        items: [{
          ...proposed.plan.items[0],
          status: 'done' as const,
          completionCandidate: undefined,
          completion: {
            ...completionCandidate,
            summary: undefined,
            confirmedAt: '2026-10-29T04:00:00.000Z',
          },
        }, plan.items[1]],
      },
    }
    vi.mocked(getDreamer).mockResolvedValue(proposed)
    vi.mocked(updateDreamerPlan).mockResolvedValue(completed)
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    const sessionItem = within(screen.getByRole('list', {
      name: 'Dreamer priorities',
    })).getAllByRole('listitem')[0]

    expect(within(sessionItem).queryByRole('button', { name: 'Done' })).toBeNull()
    fireEvent.click(within(sessionItem).getByRole('button', {
      name: 'Review completion evidence for Review failed session',
    }))
    expect(within(sessionItem).getByText(/requested change passed/)).toBeInTheDocument()
    expect(sessionItem).toHaveTextContent('computer-a / session-a · revision 7')
    fireEvent.click(within(sessionItem).getByRole('button', {
      name: 'Confirm Review failed session completed',
    }))

    await screen.findByRole('button', { name: 'Restore Review failed session' })
    expect(updateDreamerPlan).toHaveBeenCalledWith({
      revision: 3,
      planId: 'daily-plan',
      completion: {
        itemId: 'a',
        computerId: 'computer-a',
        sessionId: 'session-a',
        sessionRevision: 7,
        messageId: 'completion-message',
        resultDigest: 'a'.repeat(64),
      },
    })
  })

  it('does not offer completion for unverified session text', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    const items = within(screen.getByRole('list', {
      name: 'Dreamer priorities',
    })).getAllByRole('listitem')
    expect(within(items[0]).queryByRole('button', { name: 'Done' })).toBeNull()
    expect(within(items[0]).queryByRole('button', {
      name: /completion evidence/i,
    })).toBeNull()
    expect(within(items[1]).getByRole('button', { name: 'Done' })).toBeEnabled()
  })

  it('distinguishes an unavailable completion source from unverified text', async () => {
    vi.mocked(getDreamer).mockResolvedValue({
      ...ready,
      plan: {
        ...plan,
        items: [{
          ...plan.items[0],
          computerId: 'computer-a',
          sessionId: '51a9d338-ec8f-4f3f-9f56-2de6c43519f7',
          completionSourceUnavailable: true,
          sourceState: 'unavailable' as const,
          sourceStateReason: 'The owning session is offline or unavailable. Reconnect it, then refresh.',
        }],
      },
    })
    render(<DreamerMorningPlan />)
    await openMorningPlan()

    expect(screen.getByText(/owning session is offline or unavailable/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry evidence for Review failed session' }))
      .toBeEnabled()
    expect(screen.getByRole('button', { name: 'Refresh morning plan' })).toBeEnabled()
  })

  it.each([
    ['desktop', 1440],
    ['phone', 390],
  ])('renders one authoritative review card with its full identity on %s', async (_layout, width) => {
    const previousWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    vi.mocked(getDreamer).mockResolvedValue({
      ...ready,
      plan: {
        ...plan,
        items: [{
          ...plan.items[0],
          label: 'Session is waiting',
          reason: 'Authoritative session state reports that input is required.',
          computerId: 'computer-a',
          sessionId: '5932eac7-7370-4b17-a539-0cadf719f34b',
          sourceState: 'pending' as const,
          sourceStateReason: 'No verified root task completion is available. Resolve the session, then refresh.',
        }],
      },
    })
    try {
      render(<DreamerMorningPlan />)
      await openMorningPlan()
      const items = within(screen.getByRole('list', {
        name: 'Dreamer priorities',
      })).getAllByRole('listitem')
      expect(items).toHaveLength(1)
      expect(items[0]).toHaveTextContent(
        'computer-a / 5932eac7-7370-4b17-a539-0cadf719f34b',
      )
      expect(items[0]).toHaveTextContent(/No verified root task completion/)
      expect(items[0]).not.toHaveTextContent('Open session review')
      expect(items[0]).not.toHaveTextContent('Journal metadata reports an open session')
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: previousWidth,
      })
    }
  })

  it('retries authoritative evidence without duplicating the review card or replaying an edit', async () => {
    const sessionId = '1b31e2dd-8810-46fc-884a-a3532b5b9148'
    vi.mocked(getDreamer)
      .mockResolvedValueOnce({
        ...ready,
        plan: {
          ...plan,
          items: [{
            ...plan.items[0],
            computerId: 'computer-a',
            sessionId,
            completionSourceUnavailable: true,
            sourceState: 'unavailable' as const,
            sourceStateReason: 'The owning session is offline or unavailable. Reconnect it, then refresh.',
          }],
        },
      })
      .mockResolvedValueOnce({
        ...ready,
        revision: 4,
        plan: {
          ...plan,
          items: [{
            ...plan.items[0],
            computerId: 'computer-a',
            sessionId,
            completionCandidate: {
              ...completionCandidate,
              sessionId,
            },
            sourceState: 'verified-completion' as const,
            sourceStateReason: 'Review the verified result before confirming completion.',
          }],
        },
      })

    render(<DreamerMorningPlan />)
    await openMorningPlan()
    fireEvent.click(screen.getByRole('button', {
      name: 'Retry evidence for Review failed session',
    }))

    expect(await screen.findByRole('button', {
      name: 'Review completion evidence for Review failed session',
    })).toBeEnabled()
    expect(within(screen.getByRole('list', {
      name: 'Dreamer priorities',
    })).getAllByRole('listitem')).toHaveLength(1)
    expect(updateDreamerPlan).not.toHaveBeenCalled()
  })

  it('persists exact reordered IDs using the current plan and revision', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockResolvedValue({
      ...ready, revision: 4, plan: { ...plan, items: [plan.items[1], plan.items[0]] },
    })
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    fireEvent.click(screen.getByRole('button', { name: 'Move Review remembered decision up' }))
    await waitFor(() => {
      expect(within(screen.getByRole('list', { name: 'Dreamer priorities' })).getAllByRole('listitem')[0])
        .toHaveTextContent('Review remembered decision')
    })
    expect(updateDreamerPlan).toHaveBeenCalledWith({ revision: 3, planId: 'daily-plan', order: ['b', 'a'] })
  })

  it.each(['done', 'skipped'] as const)('persists %s only in the plan and offers restore', async (status) => {
    const targetIndex = status === 'done' ? 1 : 0
    const target = plan.items[targetIndex]
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockResolvedValue({
      ...ready,
      revision: 4,
      plan: {
        ...plan,
        items: plan.items.map((item, index) =>
          index === targetIndex ? { ...item, status } : item),
      },
    })
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    const item = within(screen.getByRole('list', { name: 'Dreamer priorities' }))
      .getAllByRole('listitem')[targetIndex]
    fireEvent.click(within(item).getByRole('button', { name: status === 'done' ? 'Done' : 'Skip' }))
    await screen.findByRole('button', { name: `Restore ${target.label}` })
    expect(updateDreamerPlan).toHaveBeenCalledWith({
      revision: 3, planId: 'daily-plan', item: { id: target.id, status },
    })
    vi.mocked(updateDreamerPlan).mockResolvedValue({ ...ready, revision: 5 })
    fireEvent.click(screen.getByRole('button', { name: `Restore ${target.label}` }))
    await waitFor(() => expect(updateDreamerPlan).toHaveBeenLastCalledWith({
      revision: 4, planId: 'daily-plan', item: { id: target.id, status: 'pending' },
    }))
  })

  it('refreshes stale plans and does not replay a conflicting action', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockRejectedValue(new DreamerApiError('Stale plan.', 409))
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, revision: 8, plan: { ...plan, items: [plan.items[1]] } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0])
    expect(await screen.findByRole('alert')).toHaveTextContent(/changed elsewhere/)
    expect(screen.queryByText('Review failed session')).not.toBeInTheDocument()
    expect(updateDreamerPlan).toHaveBeenCalledTimes(1)
  })

  it('shows unavailable and failed-run states explicitly', async () => {
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, available: false, lastError: 'Dreamer storage is unavailable.' })
    render(<DreamerSettings />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Dreamer storage is unavailable.')
    expect(screen.queryByRole('button', { name: 'Save Dreamer' })).not.toBeInTheDocument()
  })

  it('keeps a retained plan read-only when storage becomes unavailable', async () => {
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, available: false, lastError: 'Dreamer storage is unavailable.' })
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    expect(screen.getAllByRole('button', { name: 'Done' })[0]).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move Review failed session down' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Dreamer storage is unavailable.')
  })

  it('updates an already open morning view after settings enable Dreamer', async () => {
    render(<><DreamerSettings /><DreamerMorningPlan /></>)
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable Dreamer' }))
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(saveDreamerSettings).mockResolvedValue(ready)
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    fireEvent.click(await screen.findByText('Morning plan'))
    expect(await screen.findByText('Review failed session')).toBeInTheDocument()
  })

  it('refreshes overnight plans while Oracle stays open without executing an action', async () => {
    vi.useFakeTimers()
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, plan: undefined })
    render(<DreamerMorningPlan />)
    await act(async () => undefined)
    vi.mocked(getDreamer).mockResolvedValue({ ...ready, revision: 4 })
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })
    expect(screen.getByText('Review failed session')).toBeInTheDocument()
    expect(updateDreamerPlan).not.toHaveBeenCalled()
  })

  it('refreshes on the authoritative app signal and keeps stale plan data visible on failure', async () => {
    vi.mocked(getDreamer).mockResolvedValueOnce(ready)
    render(<DreamerMorningPlan />)
    await openMorningPlan()

    vi.mocked(getDreamer).mockRejectedValueOnce(new Error('Hub offline.'))
    await act(async () => {
      window.dispatchEvent(new Event('agentic-remote:authoritative-refresh'))
    })

    expect(getDreamer).toHaveBeenCalledTimes(2)
    expect(screen.getByText('Review failed session')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Dreamer data freshness' }))
      .toHaveTextContent('Data may be stale')
    expect(screen.getByRole('alert')).toHaveTextContent('Hub offline.')
  })

  it('keeps the original settings revision on a draft across background refresh', async () => {
    vi.useFakeTimers()
    render(<DreamerSettings />)
    await act(async () => undefined)
    fireEvent.change(screen.getByLabelText('Dreamer timezone'), { target: { value: 'Asia/Kathmandu' } })
    vi.mocked(getDreamer).mockResolvedValue({
      ...initial, revision: 4, settings: { enabled: true, timeZone: 'UTC' },
    })
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })
    vi.mocked(saveDreamerSettings).mockRejectedValue(new DreamerApiError('Stale settings.', 409))
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' })) })
    expect(saveDreamerSettings).toHaveBeenCalledWith({
      revision: 3, enabled: false, timeZone: 'Asia/Kathmandu',
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/changed elsewhere/)
  })

  it('rebases an active settings draft across a revision-only authoritative refresh', async () => {
    render(<DreamerSettings />)
    fireEvent.change(await screen.findByLabelText('Dreamer timezone'), {
      target: { value: 'Asia/Kathmandu' },
    })
    vi.mocked(getDreamer).mockResolvedValue({
      ...initial,
      revision: 4,
      settings: { ...initial.settings },
    })
    await act(async () => {
      window.dispatchEvent(new Event('agentic-remote:authoritative-refresh'))
    })
    expect(screen.getByLabelText('Dreamer timezone')).toHaveValue('Asia/Kathmandu')
    vi.mocked(saveDreamerSettings).mockResolvedValue({
      ...ready,
      revision: 5,
      settings: { enabled: false, timeZone: 'Asia/Kathmandu' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Dreamer' }))
    await screen.findByText('Dreamer settings saved.')
    expect(saveDreamerSettings).toHaveBeenCalledWith({
      revision: 4,
      enabled: false,
      timeZone: 'Asia/Kathmandu',
    })
  })

  it('does not replace a saved edit with an older delayed refresh response', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    let release!: (snapshot: typeof ready) => void
    vi.mocked(getDreamer).mockImplementationOnce(() => new Promise((resolve) => { release = resolve }))
    fireEvent.click(screen.getByRole('button', { name: 'Refresh morning plan' }))
    vi.mocked(updateDreamerPlan).mockResolvedValue({
      ...ready, revision: 4, plan: { ...plan, items: [{ ...plan.items[0], status: 'done' }, plan.items[1]] },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0])
    await screen.findByRole('button', { name: 'Restore Review failed session' })
    await act(async () => { release(ready) })
    expect(screen.getByRole('button', { name: 'Restore Review failed session' })).toBeInTheDocument()
  })

  it('locks stale edits after 503 and clears the error only after successful refresh', async () => {
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockRejectedValue(new DreamerApiError('Storage offline.', 503))
    render(<DreamerMorningPlan />)
    await openMorningPlan()
    fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0])
    expect(await screen.findByRole('alert')).toHaveTextContent('Storage offline.')
    expect(screen.getAllByRole('button', { name: 'Done' })[0]).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh morning plan' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getAllByRole('button', { name: 'Done' })[0]).toBeEnabled()
  })

  it.each(['timer', 'focus'])('clears a recovered action error after %s refresh', async (trigger) => {
    vi.useFakeTimers()
    vi.mocked(getDreamer).mockResolvedValue(ready)
    vi.mocked(updateDreamerPlan).mockRejectedValue(new DreamerApiError('Storage offline.', 503))
    render(<DreamerMorningPlan />)
    await act(async () => undefined)
    fireEvent.click(screen.getByText('Morning plan'))
    await act(async () => { fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0]) })
    expect(screen.getByRole('alert')).toHaveTextContent('Storage offline.')
    await act(async () => {
      if (trigger === 'timer') await vi.advanceTimersByTimeAsync(30_000)
      else window.dispatchEvent(new Event('focus'))
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Done' })[0]).toBeEnabled()
    expect(updateDreamerPlan).toHaveBeenCalledTimes(1)
  })
})
