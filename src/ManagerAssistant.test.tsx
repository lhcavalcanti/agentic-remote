// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagerEvent, ManagerSnapshot } from '../shared/manager'
import {
  cancelManager,
  getManager,
  resetManager,
  resolveManagerConfirmation,
  retryManagerMessage,
  sendManagerMessage,
} from './api'
import { ManagerAssistant } from './ManagerAssistant'
import { sessionLinkTarget } from './manager-links'

vi.mock('./api', () => ({
  getManager: vi.fn(),
  sendManagerMessage: vi.fn(),
  retryManagerMessage: vi.fn(),
  resolveManagerConfirmation: vi.fn(),
  cancelManager: vi.fn(),
  resetManager: vi.fn(),
}))

const empty: ManagerSnapshot = {
  available: true,
  status: 'idle',
  messages: [],
  queued: 0,
  managedSessions: [],
}

function setup(snapshot: ManagerSnapshot = empty, overrides: Partial<Parameters<typeof ManagerAssistant>[0]> = {}) {
  vi.mocked(getManager).mockResolvedValue(snapshot)
  const listeners = new Set<(event: ManagerEvent) => void>()
  const onOpenSession = vi.fn(() => true)
  const onManagedSessionsChange = vi.fn()
  const props = {
    connectionEpoch: 1,
    subscribe: (listener: (event: ManagerEvent) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    defaults: { computerId: 'hub', mode: 'autopilot' as const },
    openSessions: 3,
    composerVisible: false,
    keyboardOpen: false,
    onOpenSession,
    onManagedSessionsChange,
    ...overrides,
  }
  const view = render(<ManagerAssistant {...props} />)
  const emit = (event: ManagerEvent) => act(() => {
    for (const listener of listeners) listener(event)
  })
  return { ...view, emit, onOpenSession, onManagedSessionsChange }
}

async function openPanel() {
  fireEvent.click(await screen.findByRole('button', { name: /Open the manager/ }))
  return screen.getByRole('dialog', { name: 'Manager' })
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
  })

  it('stays hidden when the hub has no manager', async () => {
    setup({ ...empty, available: false, unavailableReason: 'off' })
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    expect(screen.queryByRole('button', { name: /Open the manager/ })).not.toBeInTheDocument()
  })

  it('stays hidden, without breaking the page, when the snapshot cannot be read', async () => {
    vi.mocked(getManager).mockRejectedValueOnce(new Error('offline'))
    const { container } = render(
      <ManagerAssistant
        composerVisible={false}
        connectionEpoch={1}
        defaults={{}}
        keyboardOpen={false}
        onManagedSessionsChange={vi.fn()}
        onOpenSession={vi.fn(() => true)}
        openSessions={0}
        subscribe={() => () => undefined}
      />,
    )
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('opens from the bubble with suggestions and sends one with the browser defaults', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'm1', role: 'user', content: 'What is running right now?', createdAt: 't', state: 'queued' })
    setup()
    await openPanel()
    expect(screen.getByText('Keeping track of 3 open sessions')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'What is running right now?' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith('What is running right now?', { computerId: 'hub', mode: 'autopilot' }))
    expect(await screen.findByText('Waiting its turn')).toBeInTheDocument()
  })

  it('sends on Return at a desk, queues while working, and clears the draft only once accepted', async () => {
    let accept!: (value: Awaited<ReturnType<typeof sendManagerMessage>>) => void
    vi.mocked(sendManagerMessage).mockReturnValue(new Promise((resolve) => { accept = resolve }))
    setup({ ...empty, status: 'working' })
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message the manager' })
    expect(screen.getByRole('button', { name: 'Queue message' })).toBeDisabled()
    fireEvent.change(input, { target: { value: 'Also check the tests' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(sendManagerMessage).toHaveBeenCalledWith('Also check the tests', expect.anything())
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
    fireEvent.change(screen.getByRole('textbox', { name: 'Message the manager' }), { target: { value: 'status?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    emit({ type: 'manager.message', message: { id: 'm1', role: 'user', content: 'status?', createdAt: '2026-10-15T00:00:00.000Z', updatedAt: '2026-10-15T00:00:00.050Z', state: 'running' } })
    await act(async () => accept({ id: 'm1', role: 'user', content: 'status?', createdAt: '2026-10-15T00:00:00.000Z', updatedAt: '2026-10-15T00:00:00.000Z', state: 'queued' }))
    expect(screen.queryByText('Waiting its turn')).not.toBeInTheDocument()
    expect(screen.getByText('status?')).toBeInTheDocument()
  })

  it('keeps the draft and says why when sending fails', async () => {
    vi.mocked(sendManagerMessage).mockRejectedValue(new Error('Messages are limited to 100,000 characters.'))
    setup()
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message the manager' })
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

    fireEvent.click(screen.getByRole('button', { name: 'Close the manager' }))
    emit({ type: 'manager.message', message: { id: 'r2', role: 'assistant', content: 'Another', createdAt: 't' } })
    expect(screen.getByRole('button', { name: 'Open the manager (new reply)' })).toBeInTheDocument()
  })

  it('offers Retry on a failed message', async () => {
    vi.mocked(retryManagerMessage).mockResolvedValue({ id: 'u1', role: 'user', content: 'hi', createdAt: 't', updatedAt: '2026-10-15T00:00:02.000Z', state: 'queued' })
    setup({
      ...empty,
      status: 'offline',
      messages: [{ id: 'u1', role: 'user', content: 'hi', createdAt: 't', updatedAt: '2026-10-15T00:00:01.000Z', state: 'failed', error: 'The manager could not answer: down.' }],
    })
    await openPanel()
    expect(screen.getByText('Could not answer the last message')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('could not answer: down')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(retryManagerMessage).toHaveBeenCalledWith('u1'))
    expect(await screen.findByText('Waiting its turn')).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: "Stop the manager's reply" }))
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
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message the manager' }), { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Manager' })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open the manager' })).toHaveFocus())
  })

  it('stays out of the way of an open phone keyboard', async () => {
    setup(empty, { composerVisible: true, keyboardOpen: true })
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    await act(async () => undefined)
    expect(screen.queryByRole('button', { name: /Open the manager/ })).not.toBeInTheDocument()
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
