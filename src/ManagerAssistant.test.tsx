// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { useRef, useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagerEvent, ManagerSnapshot } from '../shared/manager'
import {
  cancelManager,
  getManager,
  removeQueuedManagerMessage,
  resetManager,
  resolveManagerConfirmation,
  retryManagerMessage,
  sendManagerMessage,
} from './api'
import { ManagerAssistant, OracleButton } from './ManagerAssistant'
import type { OracleControl, OracleIndicator } from './ManagerAssistant'
import { sessionLinkTarget } from './manager-links'

vi.mock('./api', () => ({
  getManager: vi.fn(),
  sendManagerMessage: vi.fn(),
  retryManagerMessage: vi.fn(),
  resolveManagerConfirmation: vi.fn(),
  removeQueuedManagerMessage: vi.fn(),
  cancelManager: vi.fn(),
  resetManager: vi.fn(),
}))

type Props = Parameters<typeof ManagerAssistant>[0]

/** The header button and the panel, wired the way App wires them. */
function Harness(props: Omit<Props, 'open' | 'onOpenChange' | 'onIndicatorChange' | 'controlRef'> & {
  onControl?: (control: OracleControl | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const [indicator, setIndicator] = useState<OracleIndicator>({ available: false, status: 'idle', unread: false, queued: 0 })
  const controlRef = useRef<OracleControl | undefined>(undefined)
  return (
    <>
      <button onClick={() => props.onControl?.(controlRef.current)} type="button">Expose control</button>
      <OracleButton indicator={indicator} onToggle={() => setOpen((current) => !current)} open={open} />
      <ManagerAssistant
        {...props}
        controlRef={controlRef}
        onIndicatorChange={setIndicator}
        onOpenChange={setOpen}
        open={open}
      />
    </>
  )
}

const empty: ManagerSnapshot = {
  available: true,
  status: 'idle',
  messages: [],
  queued: 0,
  managedSessions: [],
}

function setup(snapshot: ManagerSnapshot = empty, overrides: Partial<Parameters<typeof Harness>[0]> = {}) {
  vi.mocked(getManager).mockResolvedValue(snapshot)
  const listeners = new Set<(event: ManagerEvent) => void>()
  const onOpenSession = vi.fn(() => true)
  const onManagedSessionsChange = vi.fn()
  const onOpenSettings = vi.fn()
  const props = {
    connectionEpoch: 1,
    subscribe: (listener: (event: ManagerEvent) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    defaults: { computerId: 'hub', mode: 'autopilot' as const },
    openSessions: 3,
    onOpenSession,
    onManagedSessionsChange,
    onOpenSettings,
    ...overrides,
  }
  const view = render(<Harness {...props} />)
  const emit = (event: ManagerEvent) => act(() => {
    for (const listener of listeners) listener(event)
  })
  return { ...view, emit, onOpenSession, onManagedSessionsChange, onOpenSettings }
}

async function openPanel() {
  fireEvent.click(await screen.findByRole('button', { name: /^Oracle/ }))
  return screen.getByRole('dialog', { name: 'Oracle' })
}

describe('ManagerAssistant', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.mocked(getManager).mockReset()
    vi.mocked(sendManagerMessage).mockReset()
    vi.mocked(retryManagerMessage).mockReset()
    vi.mocked(cancelManager).mockReset()
    vi.mocked(resetManager).mockReset()
    vi.mocked(removeQueuedManagerMessage).mockReset()
    localStorage.clear()
  })

  it('does not take focus when the page loads', async () => {
    setup()
    await screen.findByRole('button', { name: 'Oracle' })
    await act(async () => undefined)
    expect(screen.getByRole('button', { name: 'Oracle' })).not.toHaveFocus()
  })

  it('offers no Oracle button when the hub has no Oracle', async () => {
    setup({ ...empty, available: false, unavailableReason: 'off' })
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    expect(screen.queryByRole('button', { name: /^Oracle/ })).not.toBeInTheDocument()
  })

  it('offers no Oracle button, without breaking the page, when the snapshot cannot be read', async () => {
    vi.mocked(getManager).mockRejectedValueOnce(new Error('offline'))
    setup()
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    await act(async () => undefined)
    expect(screen.queryByRole('button', { name: /^Oracle/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from the header button and asks a suggestion as Ask only', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'm1', role: 'user', content: 'What is running right now?', createdAt: 't', state: 'queued', answerOnly: true })
    setup()
    const button = await screen.findByRole('button', { name: 'Oracle' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await openPanel()
    expect(screen.getByRole('button', { name: 'Oracle' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Keeping track of 3 open sessions')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'What is running right now?' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
      'What is running right now?', { computerId: 'hub', mode: 'autopilot' }, { answerOnly: true },
    ))
    const queue = await screen.findByRole('region', { name: 'Queued for Oracle' })
    expect(queue).toHaveTextContent('What is running right now?')
    expect(queue).toHaveTextContent('Ask only')
  })

  it('shows waiting messages in order, outside the conversation, and removes one on request', async () => {
    vi.mocked(removeQueuedManagerMessage).mockResolvedValue({
      id: 'q1', role: 'user', content: 'first waiting', createdAt: 't', updatedAt: '2026-10-15T00:00:09.000Z', state: 'cancelled',
    })
    setup({
      ...empty,
      status: 'working',
      queued: 2,
      messages: [
        { id: 'r0', role: 'user', content: 'being answered', createdAt: 't', state: 'running' },
        { id: 'q1', role: 'user', content: 'first waiting', createdAt: 't', updatedAt: '2026-10-15T00:00:01.000Z', state: 'queued' },
        { id: 'q2', role: 'user', content: 'second waiting', createdAt: 't', updatedAt: '2026-10-15T00:00:02.000Z', state: 'queued', answerOnly: true },
      ],
    })
    await openPanel()
    expect(screen.getByText('Working · 2 waiting')).toBeInTheDocument()
    const queue = screen.getByRole('region', { name: 'Queued for Oracle' })
    expect(queue).toHaveTextContent('2 waiting · answered in this order')
    const items = within(queue).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^1Number 1: first waiting/),
      expect.stringMatching(/^2Number 2: second waitingAsk only/),
    ])
    expect(within(screen.getByRole('list', { name: 'Oracle conversation' })).queryByText('first waiting')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove from the queue: first waiting' }))
    await waitFor(() => expect(removeQueuedManagerMessage).toHaveBeenCalledWith('q1'))
    await waitFor(() => expect(within(screen.getByRole('region', { name: 'Queued for Oracle' })).getAllByRole('listitem')).toHaveLength(1))
  })

  it('remembers the Ask only choice and sends with it', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'm1', role: 'user', content: 'x', createdAt: 't', state: 'queued' })
    setup()
    await openPanel()
    const toggle = screen.getByRole('checkbox', { name: /Ask only/ })
    expect(toggle).not.toBeChecked()
    fireEvent.click(toggle)
    expect(localStorage.getItem('agentic-remote:oracle-answer-only')).toBe('true')
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    expect(input).toHaveAttribute('placeholder', 'Ask about your sessions; running work is left alone…')
    expect(toggle).toHaveAccessibleName(/running work is left alone/)
    fireEvent.change(input, { target: { value: 'Just tell me' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith('Just tell me', expect.anything(), { answerOnly: true }))
    cleanup()
    setup()
    await openPanel()
    expect(screen.getByRole('checkbox', { name: /Ask only/ })).toBeChecked()
  })

  it('queues an Ask only question while Oracle is busy, without stopping anything', async () => {
    localStorage.setItem('agentic-remote:oracle-answer-only', 'true')
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'q9', role: 'user', content: 'How is the docs work going?', createdAt: 't', updatedAt: '2026-10-15T00:00:09.000Z', state: 'queued', answerOnly: true })
    setup({
      ...empty,
      status: 'working',
      messages: [{ id: 'r0', role: 'user', content: 'Start the docs work', createdAt: 't', state: 'running' }],
    })
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    expect(input).toHaveAttribute('placeholder', 'Ask; answered after the current reply…')
    fireEvent.change(input, { target: { value: 'How is the docs work going?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
      'How is the docs work going?', expect.anything(), { answerOnly: true },
    ))
    const queue = await screen.findByRole('region', { name: 'Queued for Oracle' })
    expect(within(queue).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^1Number 1: How is the docs work going\?Ask only/),
    ])
    expect(cancelManager).not.toHaveBeenCalled()
  })

  it('shows the model and opens App settings to change it', async () => {
    const { onOpenSettings } = setup({ ...empty, settings: { model: 'gpt-6-sol', reasoningEffort: 'high', defaultModel: 'hub-default' } })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Oracle model: gpt-6-sol · high. Change it in App settings' }))
    expect(onOpenSettings).toHaveBeenCalled()
  })

  it('says when the chosen model could not start', async () => {
    setup({ ...empty, settings: { model: 'missing', modelUnavailable: true } })
    await openPanel()
    expect(screen.getByText(/missing could not start, so Copilot’s default model is answering/)).toBeInTheDocument()
  })

  it('takes a prompt from elsewhere in the app, opening the panel', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'm1', role: 'user', content: 'From /oracle', createdAt: 't', state: 'queued', answerOnly: true })
    let control: OracleControl | undefined
    setup(empty, { onControl: (value) => { control = value } })
    await screen.findByRole('button', { name: 'Oracle' })
    fireEvent.click(screen.getByRole('button', { name: 'Expose control' }))
    await act(async () => control!.ask('From /oracle', { answerOnly: true }))
    expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
    expect(sendManagerMessage).toHaveBeenCalledWith('From /oracle', expect.anything(), { answerOnly: true })
  })

  it('sends on Return at a desk, queues while working, and clears the draft only once accepted', async () => {
    let accept!: (value: Awaited<ReturnType<typeof sendManagerMessage>>) => void
    vi.mocked(sendManagerMessage).mockReturnValue(new Promise((resolve) => { accept = resolve }))
    setup({ ...empty, status: 'working' })
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    expect(screen.getByRole('button', { name: 'Queue message' })).toBeDisabled()
    fireEvent.change(input, { target: { value: 'Also check the tests' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(sendManagerMessage).toHaveBeenCalledWith('Also check the tests', expect.anything(), { answerOnly: false })
    expect(input).toHaveValue('Also check the tests')
    await act(async () => accept({ id: 'm2', role: 'user', content: 'Also check the tests', createdAt: 't', state: 'queued' }))
    expect(input).toHaveValue('')

    fireEvent.change(input, { target: { value: 'line one' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(sendManagerMessage).toHaveBeenCalledTimes(1)
  })

  it('keeps a newer update when the send response arrives after it', async () => {
    let accept!: (value: Awaited<ReturnType<typeof sendManagerMessage>>) => void
    vi.mocked(sendManagerMessage).mockReturnValue(new Promise((resolve) => { accept = resolve }))
    const { emit } = setup()
    await openPanel()
    fireEvent.change(screen.getByRole('textbox', { name: 'Message Oracle' }), { target: { value: 'status?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    emit({ type: 'manager.message', message: { id: 'm1', role: 'user', content: 'status?', createdAt: '2026-10-15T00:00:00.000Z', updatedAt: '2026-10-15T00:00:00.050Z', state: 'running' } })
    await act(async () => accept({ id: 'm1', role: 'user', content: 'status?', createdAt: '2026-10-15T00:00:00.000Z', updatedAt: '2026-10-15T00:00:00.000Z', state: 'queued' }))
    expect(screen.queryByRole('region', { name: 'Queued for Oracle' })).not.toBeInTheDocument()
    expect(screen.getByText('status?')).toBeInTheDocument()
  })

  it('keeps the draft and says why when sending fails', async () => {
    vi.mocked(sendManagerMessage).mockRejectedValue(new Error('Messages are limited to 100,000 characters.'))
    setup()
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Messages are limited')
    expect(input).toHaveValue('hello')
  })

  it('streams a reply, then shows the stored one and marks it unread while closed', async () => {
    const { emit } = setup({ ...empty, status: 'working', messages: [{ id: 'u1', role: 'user', content: 'status?', createdAt: 't', state: 'running' }] })
    await openPanel()
    expect(screen.getByText('Thinking…')).toBeInTheDocument()
    emit({ type: 'manager.delta', messageId: 'r1', content: 'Two sessions are' })
    expect(screen.getByText('Two sessions are')).toBeInTheDocument()
    emit({ type: 'manager.message', message: { id: 'r1', role: 'assistant', content: 'Two sessions are running.', createdAt: 't' } })
    expect(screen.getByText('Two sessions are running.')).toBeInTheDocument()
    expect(screen.queryByText('Two sessions are')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))
    emit({ type: 'manager.message', message: { id: 'r2', role: 'assistant', content: 'Another', createdAt: 't' } })
    // Both states hold at once, so both are announced.
    expect(screen.getByRole('button', { name: 'Oracle, working, new reply' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Oracle, working, new reply' }))
    expect(screen.getByRole('button', { name: 'Oracle, working' })).toBeInTheDocument()
  })

  it('keeps a /oracle question in Oracle when it cannot be sent', async () => {
    vi.mocked(sendManagerMessage).mockRejectedValue(new Error('Origin is not allowed.'))
    let control: OracleControl | undefined
    setup(empty, { onControl: (value) => { control = value } })
    await screen.findByRole('button', { name: 'Oracle' })
    fireEvent.click(screen.getByRole('button', { name: 'Expose control' }))
    await act(async () => control!.ask('What is riskiest?', { answerOnly: true }))
    expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not send to Oracle: Origin is not allowed. Your question is in the message bar to send again.',
    )
    expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('What is riskiest?')
    expect(screen.getByRole('checkbox', { name: /Ask only/ })).toBeChecked()
  })

  it('tells the app why Oracle cannot take a message', async () => {
    const onIndicatorChange = vi.fn()
    vi.mocked(getManager).mockRejectedValueOnce(new Error('offline'))
    const props = {
      connectionEpoch: 1, subscribe: () => () => undefined, defaults: {}, openSessions: 0,
      open: false, onOpenChange: vi.fn(), onIndicatorChange, onOpenSession: vi.fn(() => true),
      onManagedSessionsChange: vi.fn(), onOpenSettings: vi.fn(),
    }
    const view = render(<ManagerAssistant {...props} />)
    await waitFor(() => expect(onIndicatorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ available: false, unavailableReason: 'Oracle could not be reached: offline' }),
    ))
    vi.mocked(getManager).mockResolvedValueOnce({ ...empty, available: false, unavailableReason: 'Oracle is turned off.' })
    view.rerender(<ManagerAssistant {...props} connectionEpoch={2} />)
    await waitFor(() => expect(onIndicatorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ available: false, unavailableReason: 'Oracle is turned off.' }),
    ))
  })

  it("names the hub's default model when it is the one that could not start", async () => {
    setup({ ...empty, settings: { defaultModel: 'env-model', modelUnavailable: true } })
    await openPanel()
    expect(screen.getByText(/env-model could not start/)).toBeInTheDocument()
  })

  it('never returns focus to a trigger that has slid out of view', async () => {
    vi.mocked(getManager).mockResolvedValue(empty)
    function Drawer() {
      const [open, setOpen] = useState(false)
      const [drawerOpen, setDrawerOpen] = useState(true)
      const [indicator, setIndicator] = useState<OracleIndicator>({ available: false, status: 'idle', unread: false, queued: 0 })
      return (
        <>
          <div data-testid="drawer">
            <OracleButton indicator={indicator} offscreen={!drawerOpen} onToggle={() => setOpen((current) => !current)} open={open} />
          </div>
          <div data-testid="header">
            <OracleButton indicator={indicator} onToggle={() => setOpen((current) => !current)} open={open} />
          </div>
          {/* Following a session link closes the drawer and Oracle together. */}
          <button onClick={() => { setDrawerOpen(false); setOpen(false) }} type="button">Follow link</button>
          <ManagerAssistant
            connectionEpoch={1}
            defaults={{}}
            onIndicatorChange={setIndicator}
            onManagedSessionsChange={vi.fn()}
            onOpenChange={setOpen}
            onOpenSession={vi.fn(() => true)}
            onOpenSettings={vi.fn()}
            open={open}
            openSessions={0}
            subscribe={() => () => undefined}
          />
        </>
      )
    }
    render(<Drawer />)
    const fromDrawer = await within(screen.getByTestId('drawer')).findByRole('button', { name: 'Oracle' })
    // Chrome focuses a button it clicks.
    fromDrawer.focus()
    fireEvent.click(fromDrawer)
    await screen.findByRole('dialog', { name: 'Oracle' })
    fireEvent.click(screen.getByRole('button', { name: 'Follow link' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Oracle' })).not.toBeInTheDocument())
    expect(within(screen.getByTestId('header')).getByRole('button', { name: 'Oracle' })).toHaveFocus()
  })

  it('offers Retry on a failed message', async () => {
    vi.mocked(retryManagerMessage).mockResolvedValue({ id: 'u1', role: 'user', content: 'hi', createdAt: 't', updatedAt: '2026-10-15T00:00:02.000Z', state: 'queued' })
    setup({
      ...empty,
      status: 'offline',
      messages: [{ id: 'u1', role: 'user', content: 'hi', createdAt: 't', updatedAt: '2026-10-15T00:00:01.000Z', state: 'failed', error: 'The manager could not answer: down.' }],
    })
    await openPanel()
    expect(screen.getByText("Couldn't answer the last message")).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('could not answer: down')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(retryManagerMessage).toHaveBeenCalledWith('u1'))
    expect(await screen.findByRole('region', { name: 'Queued for Oracle' })).toHaveTextContent('hi')
  })

  it('opens sessions from activity and from links in a reply', async () => {
    const { onOpenSession } = setup({
      ...empty,
      messages: [
        { id: 'u1', role: 'user', content: 'start docs', createdAt: 't', state: 'done' },
        { id: 'a1', role: 'activity', content: 'Started "Docs" on development', createdAt: 't', tool: 'create_session', sessionRefs: [{ computerId: 'hub', sessionId: 's1', title: 'Docs' }] },
        { id: 'r1', role: 'assistant', content: 'Started [Docs](?computer=hub&session=s1).', createdAt: 't' },
      ],
    })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Open Docs' }))
    expect(onOpenSession).toHaveBeenLastCalledWith({ computerId: 'hub', sessionId: 's1', title: 'Docs' })
    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))
    expect(onOpenSession).toHaveBeenLastCalledWith({ computerId: 'hub', sessionId: 's1' })
  })

  it('closes a session only when you confirm the request', async () => {
    const request = {
      id: 'c1', role: 'activity' as const, content: 'Close "Docs"? It finished.', createdAt: 't', updatedAt: '2026-10-15T00:00:01.000Z',
      tool: 'close_session', sessionRefs: [{ computerId: 'hub', sessionId: 's1', title: 'Docs' }],
      confirmation: { kind: 'close-session' as const, computerId: 'hub', sessionId: 's1', title: 'Docs', state: 'pending' as const },
    }
    vi.mocked(resolveManagerConfirmation).mockResolvedValue({
      ...request, updatedAt: '2026-10-15T00:00:02.000Z', confirmation: { ...request.confirmation, state: 'confirmed' },
    })
    setup({ ...empty, messages: [request] })
    await openPanel()
    expect(screen.getByText('Close "Docs"? It finished.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close session' }))
    await waitFor(() => expect(resolveManagerConfirmation).toHaveBeenCalledWith('c1', true))
    expect(await screen.findByText('Closed. It is permanently deleted.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close session' })).not.toBeInTheDocument()
  })

  it('stops the current reply', async () => {
    vi.mocked(cancelManager).mockResolvedValue()
    setup({ ...empty, status: 'working' })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: "Stop Oracle's reply" }))
    expect(cancelManager).toHaveBeenCalled()
  })

  it('starts a new conversation after confirmation', async () => {
    vi.mocked(resetManager).mockResolvedValue(empty)
    setup({ ...empty, messages: [{ id: 'u1', role: 'user', content: 'hi', createdAt: 't', state: 'done' }] })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Start a new conversation' }))
    expect(resetManager).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }))
    await waitFor(() => expect(resetManager).toHaveBeenCalled())
    expect(await screen.findByText('Ask about your sessions')).toBeInTheDocument()
  })

  it('reports the sessions it started and follows changes', async () => {
    const { emit, onManagedSessionsChange } = setup({ ...empty, managedSessions: ['hub:s1'] })
    await waitFor(() => expect(onManagedSessionsChange).toHaveBeenLastCalledWith(['hub:s1']))
    emit({ type: 'manager.sessions', managedSessions: ['hub:s1', 'hub:s2'] })
    expect(onManagedSessionsChange).toHaveBeenLastCalledWith(['hub:s1', 'hub:s2'])
  })

  it('closes on Escape and returns focus to the bubble', async () => {
    setup()
    await openPanel()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message Oracle' }), { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Oracle' })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Oracle' })).toHaveFocus())
  })

  it('folds a long message of yours until you ask to see it all', async () => {
    setup({ ...empty, messages: [{ id: 'u1', role: 'user', content: 'word '.repeat(300), createdAt: 't', state: 'done' }] })
    await openPanel()
    const toggle = screen.getByRole('button', { name: 'Show all' })
    expect(document.querySelector('.manager-message__text--clamped')).not.toBeNull()
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument()
    expect(document.querySelector('.manager-message__text--clamped')).toBeNull()
  })

  it('recognises only same-origin session links', () => {
    expect(sessionLinkTarget('?computer=hub&session=s1')).toEqual({ computerId: 'hub', sessionId: 's1' })
    expect(sessionLinkTarget('https://elsewhere.example/?computer=hub&session=s1')).toBeUndefined()
    expect(sessionLinkTarget('?computer=hub')).toBeUndefined()
  })
})
