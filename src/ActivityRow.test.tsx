// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useCallback, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActivityDetail, ActivityStatus, ChatMessage } from '../shared/contracts'
import { SubmissionError } from '../shared/submission-error'
import { activityPresentation } from './activity-presentation'
import { getActivityDetail } from './api'
import { ActivityRow } from './ActivityRow'
import { PauseFollowingContext } from './sent-message'

vi.mock('./api', () => ({ getActivityDetail: vi.fn() }))
vi.mock('./activity-presentation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./activity-presentation')>()
  return { ...actual, activityPresentation: vi.fn(actual.activityPresentation) }
})

const command = 'pnpm vitest run server/activity-details.test.ts'
const output = Array.from({ length: 12 }, (_, index) => `ok ${index + 1} - activity details`).join('\n')
/** Compares whole texts, newlines included. */
const raw = { normalizer: (value: string) => value }
let session = 0

function text(value: string) {
  return { text: value, truncated: false, originalBytes: value.length }
}

function bashDetail(overrides: Partial<ActivityDetail> = {}): ActivityDetail {
  return {
    toolCallId: 'call_bash', toolName: 'bash', kind: 'tool', status: 'completed',
    startedAt: '2026-11-20T06:00:00.000Z', completedAt: '2026-11-20T06:00:01.250Z', durationMs: 1250,
    arguments: { format: 'command', ...text(command) },
    result: text(output),
    ...overrides,
  }
}

const runningDetail = () => bashDetail({
  status: 'running', completedAt: undefined, durationMs: undefined, result: undefined,
})

function row(status: ActivityStatus = 'completed', overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'tool:call_bash', role: 'activity', content: `Bash · Run the activity tests\n$ ${command}`,
    createdAt: '2026-11-20T06:00:00.000Z', activityStatus: status, activityKind: 'tool',
    ...(status === 'completed' ? { activityResult: 'ok 1 - activity details', activityDurationMs: 1250 } : {}),
    ...overrides,
  }
}

/** Owns which rows are open, as the conversation does: one stable toggle for every row. */
function Transcript({ messages, sessionId }: { messages: ChatMessage[]; sessionId: string }) {
  const [open, setOpen] = useState<string[]>([])
  const toggle = useCallback((id: string) => {
    setOpen((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
  }, [])
  return (
    <>
      {messages.map((message) => (
        <ActivityRow
          computerId="studio"
          current={false}
          expanded={open.includes(message.id)}
          key={message.id}
          message={message}
          onToggle={toggle}
          sessionId={sessionId}
        />
      ))}
    </>
  )
}

/** Each transcript is a session of its own, so no test reads another's cached call. */
function renderTranscript(messages: ChatMessage[], pauseFollowing = () => {}) {
  session += 1
  const sessionId = `session-${session}`
  const tree = (next: ChatMessage[]) => (
    <PauseFollowingContext.Provider value={pauseFollowing}>
      <Transcript messages={next} sessionId={sessionId} />
    </PauseFollowingContext.Provider>
  )
  const view = render(tree(messages))
  return { sessionId, rerender: (next: ChatMessage[]) => view.rerender(tree(next)) }
}

const toggleFor = (name: RegExp) => screen.getByRole('button', { name })

describe('ActivityRow', () => {
  beforeEach(() => {
    vi.mocked(getActivityDetail).mockReset()
  })

  afterEach(() => {
    cleanup()
    delete (Element.prototype as Partial<Element>).scrollIntoView
    delete (navigator as Partial<Navigator> & { clipboard?: Clipboard }).clipboard
    delete (document as Partial<Document>).execCommand
  })

  it('opens a tool row onto its complete call and closes it again, reading the call once', async () => {
    vi.mocked(getActivityDetail).mockResolvedValue(bashDetail())
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
    const pauseFollowing = vi.fn()
    const { sessionId } = renderTranscript([row()], pauseFollowing)
    const toggle = toggleFor(/^Completed: Bash · Run the activity tests/)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).not.toHaveAttribute('aria-controls')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(toggle.getAttribute('aria-controls')!)!
    expect(panel).toBeInTheDocument()
    expect(await within(panel).findByText(output, raw)).toBeInTheDocument()
    expect(within(panel).getByText(command)).toBeInTheDocument()
    expect(within(panel).getByText('Completed')).toBeInTheDocument()
    expect(within(panel).getByText('1.3s')).toBeInTheDocument()
    expect(getActivityDetail).toHaveBeenCalledExactlyOnceWith('studio', sessionId, 'call_bash')
    expect(pauseFollowing).toHaveBeenCalledOnce()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(panel).not.toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    expect(pauseFollowing).toHaveBeenCalledOnce()

    fireEvent.click(toggle)
    expect(await screen.findByText(output, raw)).toBeInTheDocument()
    expect(getActivityDetail).toHaveBeenCalledOnce()
  })

  it('keeps a skill or agent row a heading with its toggle inside, and a row with no call static', () => {
    renderTranscript([
      row('completed', { id: 'tool:call_skill', content: 'Skill (pdf)', activityKind: 'skill' }),
      row('completed', { id: 'legacy-row', content: 'Read\nREADME.md' }),
    ])
    const heading = screen.getByRole('heading', { level: 3 })
    expect(within(heading).getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(document.querySelectorAll('.activity-message')).toHaveLength(2)
  })

  it('shows a running call with its arguments and reads it once more when it finishes while open', async () => {
    vi.mocked(getActivityDetail).mockResolvedValueOnce(runningDetail()).mockResolvedValueOnce(bashDetail())
    const view = renderTranscript([row('running')])
    fireEvent.click(toggleFor(/^Running: Bash/))

    expect(await screen.findByText('Running…')).toBeInTheDocument()
    expect(screen.getByText(command)).toBeInTheDocument()
    expect(screen.queryByText(output, raw)).not.toBeInTheDocument()

    view.rerender([row('completed')])
    expect(await screen.findByText(output, raw)).toBeInTheDocument()
    expect(screen.queryByText('Running…')).not.toBeInTheDocument()
    expect(getActivityDetail).toHaveBeenCalledTimes(2)

    view.rerender([{ ...row('completed'), activityResult: 'ok 2 - activity details' }])
    await act(async () => {})
    expect(getActivityDetail).toHaveBeenCalledTimes(2)
  })

  it('reads a call that finishes while its first read is still under way once more', async () => {
    let answerFirst: (detail: ActivityDetail) => void = () => {}
    vi.mocked(getActivityDetail)
      .mockImplementationOnce(() => new Promise((resolve) => { answerFirst = resolve }))
      .mockResolvedValueOnce(bashDetail())
    const view = renderTranscript([row('running')])
    fireEvent.click(toggleFor(/^Running: Bash/))
    expect(getActivityDetail).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('Loading details…')

    view.rerender([row('completed')])
    expect(getActivityDetail).toHaveBeenCalledTimes(2)
    await act(async () => answerFirst(runningDetail()))
    expect(await screen.findByText(output, raw)).toBeInTheDocument()
    expect(screen.queryByText('The session log has no result for this call yet.')).not.toBeInTheDocument()
  })

  it('says when the log has no result yet for a finished call, and tries again on request', async () => {
    vi.mocked(getActivityDetail).mockResolvedValueOnce(runningDetail()).mockResolvedValueOnce(bashDetail())
    renderTranscript([row('completed')])
    fireEvent.click(toggleFor(/^Completed: Bash/))

    expect(await screen.findByText('The session log has no result for this call yet.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText(output, raw)).toBeInTheDocument()
    expect(getActivityDetail).toHaveBeenCalledTimes(2)
  })

  it.each([
    {
      name: 'a call the log does not have',
      error: new SubmissionError('This tool call is not in the session log.', 404),
      role: 'status', retry: true,
    },
    {
      name: 'a provider with no event log',
      error: new SubmissionError('Tool call details are unavailable for this provider.', 501),
      role: 'status', retry: false,
    },
    {
      name: 'a read that failed',
      error: new SubmissionError('Unexpected server error', 500),
      role: 'alert', retry: true,
    },
  ])('explains $name', async ({ error, role, retry }) => {
    vi.mocked(getActivityDetail).mockRejectedValueOnce(error).mockResolvedValueOnce(bashDetail())
    renderTranscript([row('completed')])
    fireEvent.click(toggleFor(/^Completed: Bash/))

    const message = await screen.findByText(error.message)
    expect(message.closest(`[role="${role}"]`)).not.toBeNull()
    const again = screen.queryByRole('button', { name: 'Try again' })
    if (!retry) {
      expect(again).toBeNull()
      return
    }
    fireEvent.click(again!)
    expect(await screen.findByText(output, raw)).toBeInTheDocument()
    expect(screen.queryByText(error.message)).not.toBeInTheDocument()
  })

  it('says how much of a long output it shows', async () => {
    vi.mocked(getActivityDetail).mockResolvedValue(bashDetail({
      result: { text: 'x'.repeat(1024), truncated: true, originalBytes: 1_468_006 },
    }))
    renderTranscript([row('completed')])
    fireEvent.click(toggleFor(/^Completed: Bash/))

    expect(await screen.findByText('Showing the first 256 KiB of 1.4 MiB.')).toBeInTheDocument()
  })

  it('copies the command and the output', async () => {
    const writeText = vi.fn(async (_text: string) => {})
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    vi.mocked(getActivityDetail).mockResolvedValue(bashDetail())
    renderTranscript([row('completed')])
    fireEvent.click(toggleFor(/^Completed: Bash/))

    fireEvent.click(await screen.findByRole('button', { name: 'Copy command' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(command))
    expect(await screen.findByRole('button', { name: 'Command copied' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Copy output' }))
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(output))
  })

  it('copies over plain HTTP, where browsers withhold the Clipboard API', async () => {
    let copied: string | undefined
    const execCommand = vi.fn((name: string) => {
      copied = name === 'copy' ? document.getSelection()?.toString() : undefined
      return Boolean(copied)
    })
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
    vi.mocked(getActivityDetail).mockResolvedValue(bashDetail())
    renderTranscript([row('completed')])
    fireEvent.click(toggleFor(/^Completed: Bash/))
    const copy = await screen.findByRole('button', { name: 'Copy output' })
    copy.focus()

    fireEvent.click(copy)
    expect(await screen.findByRole('button', { name: 'Output copied' })).toHaveFocus()
    expect(execCommand).toHaveBeenCalledExactlyOnceWith('copy')
    expect(copied).toBe(output)
    expect(document.getSelection()?.toString()).toBe('')
    expect(document.body.textContent?.split(output)).toHaveLength(2)
  })

  it('shows every text as plain text, never as markup', async () => {
    const markup = '<b>bold</b> **strong** <img src=x onerror=alert(1)>'
    vi.mocked(getActivityDetail).mockResolvedValue(bashDetail({ result: text(markup), error: text(`# ${markup}`) }))
    renderTranscript([row('completed')])
    fireEvent.click(toggleFor(/^Completed: Bash/))

    expect(await screen.findByText(markup)).toBeInTheDocument()
    expect(screen.getByText(`# ${markup}`)).toBeInTheDocument()
    expect(document.querySelector('.activity-details :is(b, img, strong, h1)')).toBeNull()
  })

  it('names the MCP server and tool a call went to', async () => {
    const args = '{\n  "query": "activity"\n}'
    vi.mocked(getActivityDetail).mockResolvedValue({
      toolCallId: 'call_mcp', toolName: 'search_code', mcpServerName: 'github-mcp-server', mcpToolName: 'search_code',
      kind: 'tool', status: 'completed', arguments: { format: 'json', ...text(args) }, result: text('2 results'),
    })
    renderTranscript([row('completed', { id: 'tool:call_mcp', content: 'MCP · GitHub · Search Code\nactivity' })])
    fireEvent.click(toggleFor(/^Completed: MCP · GitHub · Search Code/))

    expect(await screen.findByText('github-mcp-server › search_code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy arguments' })).toBeInTheDocument()
    expect(screen.getByText(args, raw)).toBeInTheDocument()
  })

  it('leaves rows alone when the transcript changes around them', () => {
    const first = row('completed')
    const second = row('running', { id: 'tool:call_view', content: 'View\nREADME.md' })
    const view = renderTranscript([first, second])
    const renders = () => vi.mocked(activityPresentation).mock.calls.length
    const initial = renders()

    view.rerender([structuredClone(first), structuredClone(second)])
    expect(renders()).toBe(initial)

    view.rerender([structuredClone(first), { ...second, activityStatus: 'completed' }])
    expect(renders()).toBe(initial + 1)
  })
})
