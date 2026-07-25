// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts'
import App from './App'
import {
  activateSession,
  clearConversation,
  createSession,
  configureRuntime,
  deleteSession,
  executeCommand,
  getSession,
  getRuntimeOptions,
  listCommands,
  listComputers,
  listDirectories,
  listHistory,
  listSessions,
  removeQueuedPrompt,
  renameSession,
  sendMessage,
} from './api'
import { composerMaximumHeight } from './composer-sizing'

vi.mock('./api', () => ({
  listSessions: vi.fn(),
  renameSession: vi.fn(),
  removeQueuedPrompt: vi.fn(),
  listComputers: vi.fn(),
  listHistory: vi.fn(),
  listDirectories: vi.fn(),
  getSession: vi.fn(),
  listCommands: vi.fn(),
  addComputer: vi.fn(),
  removeComputer: vi.fn(),
  createSession: vi.fn(),
  configureRuntime: vi.fn(),
  getRuntimeOptions: vi.fn(),
  clearConversation: vi.fn(),
  activateSession: vi.fn(),
  sendMessage: vi.fn(),
  executeCommand: vi.fn(),
  cancelSession: vi.fn(),
  deleteSession: vi.fn(),
  replyPermission: vi.fn(),
}))

class MockWebSocket {
  static instances: MockWebSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: (() => void) | null = null

  constructor() {
    MockWebSocket.instances.push(this)
  }

  close() {}
}

Object.defineProperty(globalThis, 'WebSocket', {
  configurable: true,
  value: MockWebSocket,
})

const computer: ComputerSummary = {
  id: 'computer-1',
  name: 'development',
  isLocal: true,
  online: true,
}

const secondComputer: ComputerSummary = {
  id: 'computer-2',
  name: 'homelab-prod',
  isLocal: false,
  online: true,
  baseUrl: 'http://10.0.0.233:4317',
}

const session: ManagedSession = {
  id: 'session-1',
  computerId: computer.id,
  computerName: computer.name,
  cwd: '/home/lcavalcanti/src/project',
  title: 'Project chat',
  updatedAt: '2026-07-22T00:00:00.000Z',
  status: 'idle',
  isOpen: true,
  messages: [
    {
      id: 'message-1',
      role: 'user',
      content: 'Hello agent',
      createdAt: '2026-07-22T00:00:00.000Z',
    },
    {
      id: 'message-2',
      role: 'activity',
      content: 'Bash',
      createdAt: '2026-07-22T00:00:00.500Z',
      activityStatus: 'completed',
    },
    {
      id: 'message-3',
      role: 'assistant',
      content: '**Ready.**',
      createdAt: '2026-07-22T00:00:01.000Z',
    },
  ],
}

const historicalSession: ManagedSession = {
  ...session,
  id: 'historical-session',
  title: 'Previous project chat',
  isOpen: false,
  messages: [],
}

describe('App', () => {
  it('caps composer growth for iPhone viewport heights', () => {
    expect(composerMaximumHeight(true, 844)).toBe(104)
    expect(composerMaximumHeight(true, 430)).toBe(72)
    expect(composerMaximumHeight(false, 430)).toBe(180)
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(listComputers).mockResolvedValue([computer])
    vi.mocked(listHistory).mockResolvedValue([session, historicalSession])
    vi.mocked(listDirectories).mockImplementation(
      async (_computerId, path = '~') =>
        path === '~'
          ? {
              path: '~',
              directories: [{ name: 'src', path: '~/src' }],
            }
          : {
              path: '~/src',
              parent: '~',
              directories: [{ name: 'project', path: '~/src/project' }],
            },
    )
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(createSession).mockResolvedValue(session)
    vi.mocked(getRuntimeOptions).mockResolvedValue({
      current: {
        model: 'gpt-5.6-sol',
        reasoningEffort: 'high',
        contextTier: 'long_context',
      },
      models: [
        {
          id: 'gpt-5.6-sol',
          name: 'GPT-5.6 Sol',
          reasoningEfforts: ['medium', 'high', 'xhigh'],
          contextTiers: ['default', 'long_context'],
        },
      ],
    })
    vi.mocked(configureRuntime).mockResolvedValue(session)
    vi.mocked(clearConversation).mockResolvedValue({
      ...session,
      id: 'cleared-session',
      messages: [],
    })
    vi.mocked(listCommands).mockResolvedValue([
      {
        name: 'model',
        description: 'Select model',
        inputHint: 'model',
        allowDuringAgentExecution: false,
      },
      {
        name: 'usage',
        description: 'Show usage',
        allowDuringAgentExecution: true,
      },
      {
        name: 'allow-all',
        aliases: ['yolo'],
        description: 'Enable all permissions',
        inputHint: '[on|off|show]',
        allowDuringAgentExecution: true,
      },
    ])
    vi.mocked(sendMessage).mockResolvedValue(session)
    vi.mocked(renameSession).mockImplementation(
      async (_computerId, _sessionId, input) => ({
        ...session,
        title: input.title,
      }),
    )
    vi.mocked(removeQueuedPrompt).mockRejectedValue(
      new Error('No queued prompt configured'),
    )
    vi.mocked(executeCommand).mockResolvedValue(session)
    vi.mocked(activateSession).mockResolvedValue({
      ...historicalSession,
      isOpen: true,
    })
    vi.mocked(deleteSession).mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    Element.prototype.scrollTo = vi.fn()
    Element.prototype.scrollIntoView = vi.fn()
    MockWebSocket.instances = []
  })

  afterEach(() => {
    cleanup()
  })

  it('renders a readable session and markdown response', async () => {
    render(<App />)

    expect((await screen.findAllByText('Project chat')).length).toBeGreaterThan(0)
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
    expect(screen.getByText('Bash')).toBeInTheDocument()
    expect(screen.getByText('Ready.').tagName).toBe('STRONG')
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(document.querySelector('.session-item')?.className).toMatch(
      /session-item--tone-\d/,
    )
    expect(screen.getByLabelText('Reorder development')).toBeInTheDocument()
    expect(screen.getByLabelText('Reorder Project chat')).toBeInTheDocument()
  })

  it('opens the folder-first new session dialog', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

    expect(
      screen.getByRole('heading', { name: 'Choose a folder' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith('computer-1', '~'),
    )
    expect(screen.getByText(/The session will start in/)).toHaveTextContent('~')
    expect(screen.getByRole('checkbox', { name: /Create in tmux/ })).toBeChecked()

    fireEvent.click(screen.getByRole('option', { name: 'src' }))
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith('computer-1', '~/src'),
    )
    expect(screen.getByText(/The session will start in/)).toHaveTextContent(
      '~/src',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~/src',
        terminalBacked: true,
      }),
    )
  })

  it('allows SDK-backed session creation by disabling tmux', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    const checkbox = screen.getByRole('checkbox', { name: /Create in tmux/ })
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        terminalBacked: false,
      }),
    )
  })

  it('opens a historical session from the new-session dialog', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('tab', { name: 'Open previous' }))

    await screen.findByRole('heading', { name: 'Open previous session' })
    fireEvent.change(screen.getByLabelText('Previous session'), {
      target: { value: 'computer-1:historical-session' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Open session' }))

    await waitFor(() => {
      expect(activateSession).toHaveBeenCalledWith(
        'computer-1',
        'historical-session',
      )
    })
  })

  it('renames the selected session from the conversation header', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Rename session' }))
    fireEvent.change(screen.getByLabelText('Session name'), {
      target: { value: 'Renamed project' },
    })
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, status: 'running' },
        }),
      } as MessageEvent)
    })
    expect(screen.getByLabelText('Session name')).toHaveValue('Renamed project')
    fireEvent.submit(screen.getByLabelText('Session name').closest('form')!)

    await waitFor(() =>
      expect(renameSession).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        { title: 'Renamed project' },
      ),
    )
    expect(await screen.findAllByText('Renamed project')).not.toHaveLength(0)
  })

  it('shows queued prompts and supports edit and remove actions', async () => {
    const first = {
      id: 'queue-1',
      content: 'First queued prompt',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const second = {
      id: 'queue-2',
      content: 'Second queued prompt',
      createdAt: '2026-07-25T01:00:01.000Z',
    }
    const queuedSession = {
      ...session,
      status: 'running' as const,
      queuedCount: 2,
      queuedPrompts: [first, second],
    }
    vi.mocked(listSessions).mockResolvedValue([queuedSession])
    vi.mocked(getSession).mockResolvedValue(queuedSession)
    vi.mocked(removeQueuedPrompt)
      .mockResolvedValueOnce({
        session: {
          ...queuedSession,
          queuedCount: 1,
          queuedPrompts: [second],
        },
        prompt: first,
      })
      .mockResolvedValueOnce({
        session: {
          ...queuedSession,
          queuedCount: 0,
          queuedPrompts: [],
        },
        prompt: second,
      })
    render(<App />)
    await screen.findByText('First queued prompt')

    fireEvent.click(
      screen.getByRole('button', { name: 'Edit queued prompt 1' }),
    )
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue(
        'First queued prompt',
      ),
    )
    expect(removeQueuedPrompt).toHaveBeenCalledWith(
      'computer-1',
      'session-1',
      'queue-1',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove queued prompt 1' }),
    )
    await waitFor(() =>
      expect(screen.queryByText('Second queued prompt')).not.toBeInTheDocument(),
    )
    expect(removeQueuedPrompt).toHaveBeenLastCalledWith(
      'computer-1',
      'session-1',
      'queue-2',
    )
  })

  it('ignores stale folder responses after switching computers', async () => {
    let resolveStale:
      | ((value: {
          path: string
          parent: string
          directories: Array<{ name: string; path: string }>
        }) => void)
      | undefined
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listDirectories).mockImplementation(
      async (computerId, requestedPath = '~') => {
        if (computerId === 'computer-1' && requestedPath === '~/src') {
          return new Promise((resolve) => {
            resolveStale = resolve
          })
        }
        if (computerId === 'computer-2') {
          return {
            path: '~',
            directories: [{ name: 'services', path: '~/services' }],
          }
        }
        return {
          path: '~',
          directories: [{ name: 'src', path: '~/src' }],
        }
      },
    )
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(await screen.findByRole('option', { name: 'src' }))
    fireEvent.change(screen.getAllByLabelText('Computer')[0], {
      target: { value: 'computer-2' },
    })
    expect(
      await screen.findByRole('option', { name: 'services' }),
    ).toBeInTheDocument()

    resolveStale?.({
      path: '~/src',
      parent: '~',
      directories: [{ name: 'project', path: '~/src/project' }],
    })
    await act(() => Promise.resolve())

    expect(
      screen.queryByRole('option', { name: 'project' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/The session will start in/)).toHaveTextContent('~')
  })

  it('closes the owning Copilot session after confirmation', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'Close session' }))

    await waitFor(() => {
      expect(deleteSession).toHaveBeenCalledWith('computer-1', 'session-1')
    })
    expect(screen.queryByText('Hello agent')).not.toBeInTheDocument()
  })

  it('clears Copilot and UI history from the header and slash command', async () => {
    render(<App />)
    await screen.findByText('Hello agent')

    fireEvent.click(
      screen.getByRole('button', { name: 'Clear conversation' }),
    )
    await waitFor(() =>
      expect(clearConversation).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
    expect(screen.queryByText('Hello agent')).not.toBeInTheDocument()

    vi.mocked(clearConversation).mockClear()
    const textarea = screen.getByLabelText('Message')
    fireEvent.change(textarea, { target: { value: '/clear' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() =>
      expect(clearConversation).toHaveBeenCalledWith(
        'computer-1',
        'cleared-session',
      ),
    )
  })

  it('resynchronizes sessions when the event stream reconnects', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    MockWebSocket.instances[0]?.onopen?.()

    await waitFor(() => {
      expect(listSessions).toHaveBeenCalledTimes(2)
      expect(listComputers).toHaveBeenCalledTimes(2)
    })
  })

  it('does not persist unchanged ordering on transcript updates', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(getSession).toHaveBeenCalled())
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)))
    setItem.mockClear()

    act(() => {
      for (let index = 0; index < 20; index += 1) {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({
            type: 'session.upserted',
            session: {
              ...session,
              updatedAt: `2026-07-22T00:00:${String(index).padStart(2, '0')}.000Z`,
              messages: [
                ...session.messages,
                {
                  id: `stream-${index}`,
                  role: 'assistant',
                  content: `chunk ${index}`,
                  createdAt: `2026-07-22T00:00:${String(index).padStart(2, '0')}.000Z`,
                },
              ],
            },
          }),
        } as MessageEvent)
      }
    })

    expect(setItem).not.toHaveBeenCalled()
  })

  it('supports send, newline, and queue keyboard controls', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 96,
    })

    fireEvent.change(textarea, { target: { value: 'send now' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: 'send now',
        enqueue: false,
      })
    })

    vi.mocked(sendMessage).mockClear()
    fireEvent.change(textarea, { target: { value: 'keep editing' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(sendMessage).not.toHaveBeenCalled()
    expect(textarea).toHaveStyle({ height: '96px' })

    fireEvent.change(textarea, { target: { value: 'firstsecond' } })
    ;(textarea as HTMLTextAreaElement).setSelectionRange(5, 5)
    fireEvent.click(screen.getByRole('button', { name: 'Insert newline' }))
    expect(textarea).toHaveValue('first\nsecond')

    fireEvent.change(textarea, { target: { value: 'queue this' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: 'queue this',
        enqueue: true,
      })
    })
  })

  it('autocompletes and executes session slash commands', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(listCommands).toHaveBeenCalled())

    fireEvent.change(textarea, { target: { value: '/mo' } })
    expect(await screen.findByText('/model')).toBeInTheDocument()
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea).toHaveValue('/model ')

    fireEvent.change(textarea, { target: { value: '/model gpt-5.6-sol' } })
    expect(fireEvent.keyDown(textarea, { key: 'ArrowDown' })).toBe(true)
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(executeCommand).toHaveBeenCalledWith('computer-1', 'session-1', {
        command: '/model gpt-5.6-sol',
        enqueue: false,
      })
    })

    vi.mocked(executeCommand).mockClear()
    fireEvent.change(textarea, { target: { value: '/usage' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(executeCommand).toHaveBeenCalledWith('computer-1', 'session-1', {
        command: '/usage',
        enqueue: false,
      })
    })

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, status: 'running' },
        }),
      } as MessageEvent)
    })
    vi.mocked(executeCommand).mockClear()
    fireEvent.change(textarea, { target: { value: '/usage' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(executeCommand).toHaveBeenCalledWith('computer-1', 'session-1', {
        command: '/usage',
        enqueue: false,
      })
    })

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, status: 'running' },
        }),
      } as MessageEvent)
    })
    vi.mocked(executeCommand).mockClear()
    fireEvent.change(textarea, { target: { value: '/model gpt-5.6-sol' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(executeCommand).toHaveBeenCalledWith('computer-1', 'session-1', {
        command: '/model gpt-5.6-sol',
        enqueue: true,
      })
    })
  })

  it('supports command abbreviations and configures the web status line', async () => {
      const runtimeSession = {
        ...session,
        runtime: {
          model: 'gpt-5.6-sol',
          reasoningEffort: 'high',
          contextTier: 'long_context',
          contextTokens: 200_000,
          contextTokenLimit: 922_000,
          contextEstimated: true,
        },
      }
      vi.mocked(listSessions).mockResolvedValue([runtimeSession])
      vi.mocked(getSession).mockResolvedValue(runtimeSession)
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      expect(screen.getByTestId('web-statusline')).toBeInTheDocument()
      expect(screen.getByTestId('composer-runtime')).toHaveTextContent(
        'gpt-5.6-sol',
      )
      expect(screen.getByTestId('composer-runtime')).toHaveTextContent(
        'effort high',
      )
      expect(screen.getByTestId('composer-runtime')).toHaveTextContent(
        'long context',
      )
      expect(screen.getByTestId('composer-runtime')).toHaveTextContent(
        'ctx ~200k/922k (22%)',
      )
      expect(screen.getByTestId('web-statusline')).not.toHaveTextContent(
        'gpt-5.6-sol',
      )
      expect(screen.getByTestId('web-statusline')).not.toHaveTextContent(
        'ctx ~200k/922k (22%)',
      )

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Configure model, effort, and context',
        }),
      )
      expect(
        await screen.findByRole('dialog', { name: 'Model and context' }),
      ).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText('Reasoning effort'), {
        target: { value: 'xhigh' },
      })
      fireEvent.change(screen.getByLabelText('Context size'), {
        target: { value: 'default' },
      })
      fireEvent.click(
        screen.getByRole('button', { name: 'Apply runtime settings' }),
      )
      await waitFor(() =>
        expect(configureRuntime).toHaveBeenCalledWith(
          'computer-1',
          'session-1',
          {
            model: 'gpt-5.6-sol',
            reasoningEffort: 'xhigh',
            contextTier: 'default',
          },
        ),
      )

      fireEvent.change(textarea, { target: { value: '/aa' } })
      expect(await screen.findByText('/allow-all')).toBeInTheDocument()
      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(textarea).toHaveValue('/allow-all ')

      fireEvent.change(textarea, { target: { value: '/statusline' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(
        await screen.findByRole('dialog', { name: 'Status line' }),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('Working directory'))
      expect(screen.getByTestId('web-statusline')).not.toHaveTextContent(
        '~/src/project',
      )
  })
})
