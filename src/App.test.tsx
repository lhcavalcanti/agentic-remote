// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ComputerSummary,
  ManagedSession,
  WorkspaceFile,
  WorkspaceListing,
} from '../shared/contracts'
import App from './App'
import {
  activateSession,
  cancelSession,
  clearConversation,
  createSession,
  configureRuntime,
  deleteSession,
  executeCommand,
  getPushSettings,
  getSession,
  getRuntimeOptions,
  listCommands,
  listComputers,
  listDirectories,
  listHistory,
  listKnowledgeRoots,
  listKnowledgeEntries,
  readKnowledgeFile,
  addKnowledgeRoot,
  listSessions,
  listWorkspace,
  validateSessionDirectory,
  moveSessionToTmux,
  removeQueuedPrompt,
  renameSession,
  readWorkspaceFile,
  restartSession,
  replyUserInput,
  sendMessage,
  sendTestPushNotification,
  searchWorkspace,
  setSessionNotificationsMuted,
  transcribeAudio,
  uploadSessionFile,
} from './api'
import { composerMaximumHeight } from './composer-sizing'
import { PWA_UPDATE_EVENT } from './pwa'

vi.mock('./api', () => ({
  listSessions: vi.fn(),
  renameSession: vi.fn(),
  removeQueuedPrompt: vi.fn(),
  listComputers: vi.fn(),
  listHistory: vi.fn(),
  listKnowledgeRoots: vi.fn(),
  addKnowledgeRoot: vi.fn(),
  deleteKnowledgeRoot: vi.fn(),
  listKnowledgeEntries: vi.fn(),
  readKnowledgeFile: vi.fn(),
  listDirectories: vi.fn(),
  validateSessionDirectory: vi.fn(),
  listWorkspace: vi.fn(),
  moveSessionToTmux: vi.fn(),
  readWorkspaceFile: vi.fn(),
  searchWorkspace: vi.fn(),
  getSession: vi.fn(),
  listCommands: vi.fn(),
  addComputer: vi.fn(),
  removeComputer: vi.fn(),
  createSession: vi.fn(),
  configureRuntime: vi.fn(),
  getRuntimeOptions: vi.fn(),
  clearConversation: vi.fn(),
  restartSession: vi.fn(),
  activateSession: vi.fn(),
  sendMessage: vi.fn(),
  executeCommand: vi.fn(),
  getPushSettings: vi.fn(),
  cancelSession: vi.fn(),
  deleteSession: vi.fn(),
  replyPermission: vi.fn(),
  replyUserInput: vi.fn(),
  sendTestPushNotification: vi.fn(),
  setSessionNotificationsMuted: vi.fn(),
  transcribeAudio: vi.fn(),
  uploadSessionFile: vi.fn(),
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
  providers: [
    {
      id: 'copilot',
      name: 'GitHub Copilot',
      available: true,
      terminalBacked: true,
      supportsTmuxMigration: true,
    },
    {
      id: 'claude',
      name: 'Claude Agent',
      available: true,
      terminalBacked: false,
    },
  ],
}

const secondComputer: ComputerSummary = {
  id: 'computer-2',
  name: 'worker-node',
  isLocal: false,
  online: true,
  baseUrl: 'http://192.0.2.20:4317',
}

const session: ManagedSession = {
  id: 'session-1',
  computerId: computer.id,
  computerName: computer.name,
  executionMode: 'tmux',
  cwd: '/home/tester/src/project',
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
      content: 'Bash\n$ pnpm test',
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

const secondSession: ManagedSession = {
  ...session,
  id: 'session-2',
  title: 'Second chat',
  cwd: '/home/tester/src/second',
  messages: [],
}

/**
 * Knowledge listings have to answer per path. A single fixed listing makes
 * every folder contain itself, so expanding one recurses until the stack is
 * exhausted and `<App>` crashes while the assertions still pass.
 */
function knowledgeListings(
  listings: Record<string, WorkspaceListing>,
): (rootId: string, path?: string) => Promise<WorkspaceListing> {
  return async (_rootId, path = '.') =>
    listings[path] || { path, parent: '.', entries: [] }
}

let restoreScrollTop: (() => void) | undefined

describe('App', () => {
  afterEach(() => {
    restoreScrollTop?.()
    restoreScrollTop = undefined
  })

  it('caps composer growth for iPhone viewport heights', () => {
    expect(composerMaximumHeight(true, 844)).toBe(104)
    expect(composerMaximumHeight(true, 430)).toBe(72)
    expect(composerMaximumHeight(false, 430)).toBe(180)
  })

  it('tracks the visual viewport at normal and keyboard-open sizes', async () => {
    const originalVisualViewport = window.visualViewport
    const visualViewport = new EventTarget() as VisualViewport
    Object.defineProperties(visualViewport, {
      height: { configurable: true, value: 844, writable: true },
      offsetTop: { configurable: true, value: 0, writable: true },
    })
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: visualViewport,
    })

    const rendered = render(<App />)
    const shell = document.querySelector<HTMLElement>('.app-shell')
    Object.defineProperty(visualViewport, 'height', {
      configurable: true,
      value: 700,
      writable: true,
    })
    Object.defineProperty(visualViewport, 'offsetTop', {
      configurable: true,
      value: 18,
      writable: true,
    })
    act(() => visualViewport.dispatchEvent(new Event('resize')))
    expect(shell).not.toHaveClass('app-shell--keyboard-open')
    expect(shell?.style.getPropertyValue('--visual-viewport-height')).toBe(
      '700px',
    )
    expect(shell?.style.getPropertyValue('--visual-viewport-top')).toBe('18px')

    const editor = document.createElement('textarea')
    document.body.append(editor)
    editor.focus()
    Object.defineProperty(visualViewport, 'height', {
      configurable: true,
      value: 510,
      writable: true,
    })
    Object.defineProperty(visualViewport, 'offsetTop', {
      configurable: true,
      value: 42,
      writable: true,
    })
    act(() => visualViewport.dispatchEvent(new Event('resize')))
    expect(shell).toHaveClass('app-shell--keyboard-open')
    expect(shell?.style.getPropertyValue('--visual-viewport-height')).toBe(
      '510px',
    )
    expect(shell?.style.getPropertyValue('--visual-viewport-top')).toBe('42px')

    editor.blur()
    Object.defineProperty(visualViewport, 'height', {
      configurable: true,
      value: 844,
      writable: true,
    })
    Object.defineProperty(visualViewport, 'offsetTop', {
      configurable: true,
      value: 0,
      writable: true,
    })
    await waitFor(() =>
      expect(shell).not.toHaveClass('app-shell--keyboard-open'),
    )
    await waitFor(() =>
      expect(shell?.style.getPropertyValue('--visual-viewport-height')).toBe(
        '844px',
      ),
    )
    expect(shell?.style.getPropertyValue('--visual-viewport-top')).toBe('0px')

    editor.remove()
    rendered.unmount()
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: originalVisualViewport,
    })

  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // The address now carries the selected session, so it has to be reset or
    // one test's deep link selects a session in the next.
    window.history.replaceState({}, '', '/')
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(listComputers).mockResolvedValue([computer])
    vi.mocked(listHistory).mockResolvedValue([session, historicalSession])
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    vi.mocked(listWorkspace).mockImplementation(
      async (_computerId, _sessionId, path = '.') =>
        path === 'docs'
          ? {
              path: 'docs',
              parent: '.',
              entries: [
                {
                  name: 'knowledge.md',
                  path: 'docs/knowledge.md',
                  kind: 'markdown',
                  size: 20,
                },
              ],
            }
          : {
              path: '.',
              entries: [
                {
                  name: 'docs',
                  path: 'docs',
                  kind: 'directory',
                },
                {
                  name: 'README.md',
                  path: 'README.md',
                  kind: 'markdown',
                  size: 25,
                },
                {
                  name: 'guide.pdf',
                  path: 'guide.pdf',
                  kind: 'pdf',
                  size: 50,
                },
              ],
            },
    )
    vi.mocked(readWorkspaceFile).mockResolvedValue({
      name: 'README.md',
      path: 'README.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 25,
      content: '# Workspace guide\n\nUseful knowledge.',
    })
    vi.mocked(searchWorkspace).mockResolvedValue({
      results: [
        {
          name: 'README.md',
          path: 'README.md',
          kind: 'markdown',
          snippet: 'Useful knowledge.',
        },
      ],
      truncated: false,
    })
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
    vi.mocked(validateSessionDirectory).mockImplementation(
      async (_computerId, path) => path,
    )
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(createSession).mockResolvedValue(session)
    vi.mocked(getRuntimeOptions).mockResolvedValue({
      current: {
        model: 'gpt-5.6-sol',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'plan',
      },
      models: [
        {
          id: 'gpt-5.6-sol',
          name: 'GPT-5.6 Sol',
          reasoningEfforts: ['medium', 'high', 'xhigh'],
          contextTiers: ['default', 'long_context'],
          contextTokenLimits: {
            default: 114_000,
            long_context: 922_000,
          },
        },
      ],
    })
    vi.mocked(configureRuntime).mockResolvedValue(session)
    vi.mocked(clearConversation).mockResolvedValue({
      ...session,
      id: 'cleared-session',
      messages: [],
    })
    vi.mocked(restartSession).mockResolvedValue(session)
    vi.mocked(moveSessionToTmux).mockResolvedValue({
      ...session,
      executionMode: 'tmux',
    })
    vi.mocked(replyUserInput).mockResolvedValue(session)
    vi.mocked(listCommands).mockResolvedValue([
      {
        name: 'cwd',
        description: 'Change working directory',
        inputHint: '[path]',
        allowDuringAgentExecution: false,
      },
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
    vi.mocked(transcribeAudio).mockResolvedValue({
      transcript: 'Transcribed walking idea',
      durationSeconds: 12,
    })
    vi.mocked(uploadSessionFile).mockResolvedValue({
      name: 'statement.pdf',
      path: '/private/uploads/statement.pdf',
      size: 14,
    })
    vi.mocked(getPushSettings).mockResolvedValue({ mutedSessions: [] })
    vi.mocked(setSessionNotificationsMuted).mockResolvedValue({
      mutedSessions: ['computer-1:session-1'],
    })
    vi.mocked(sendTestPushNotification).mockResolvedValue({ sent: 1 })
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
    expect(screen.getByText('$ pnpm test')).toBeInTheDocument()
    expect(document.querySelector('.tool-activity-history')).toBeInTheDocument()
    expect(screen.getByText('Ready.').tagName).toBe('STRONG')
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(document.querySelector('.session-item')?.className).toMatch(
      /session-item--tone-\d/,
    )
    expect(screen.getByLabelText('Reorder development')).toBeInTheDocument()
    expect(screen.getByLabelText('Reorder Project chat')).toBeInTheDocument()
    expect(
      screen.getByText('tmux', { selector: '.session-mode-badge' }),
    ).toBeInTheDocument()

    const displayedMessages = document.querySelectorAll(
      '.message:not(.message--activity)',
    )
    const expectedTimestamps = [
      '2026-07-22T00:00:00.000Z',
      '2026-07-22T00:00:01.000Z',
    ]
    expect(displayedMessages).toHaveLength(expectedTimestamps.length)
    expectedTimestamps.forEach((createdAt, index) => {
      const timestamp = displayedMessages[index]?.querySelector('time')
      expect(timestamp).toHaveAttribute('datetime', createdAt)
      expect(timestamp).toHaveTextContent(
        new Date(createdAt).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        }),
      )
    })
    expect(displayedMessages[0]?.querySelector('.message__metadata')).toHaveTextContent(
      'You',
    )
    expect(displayedMessages[1]?.querySelector('.message__metadata')).toHaveTextContent(
      'Agent',
    )
  })

  it('renders MCP activity as a compact, identifiable tool row', async () => {
    const mcpSession: ManagedSession = {
      ...session,
      messages: [
        session.messages[0]!,
        {
          id: 'mcp-activity',
          role: 'activity',
          content: 'MCP · GitHub · Search Repositories\nagentic-remote',
          createdAt: '2026-07-22T00:00:00.500Z',
          activityStatus: 'completed',
        },
        session.messages[2]!,
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([mcpSession])
    vi.mocked(getSession).mockResolvedValue(mcpSession)

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(
      screen.getByText('MCP · GitHub · Search Repositories'),
    ).toBeInTheDocument()
    expect(document.querySelector('.activity-message--mcp')).toHaveTextContent(
      'agentic-remote',
    )
  })

  it('keeps sidebar actions outside the independently scrolling navigation', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    const sidebar = document.querySelector<HTMLElement>('.sidebar')
    const sidebarBody = document.querySelector<HTMLElement>('.sidebar__body')
    const sidebarSettings =
      document.querySelector<HTMLElement>('.sidebar-settings')
    expect(sidebar).toContainElement(sidebarBody)
    expect(sidebar).toContainElement(sidebarSettings)
    expect(sidebarBody).not.toContainElement(sidebarSettings)
    expect(sidebarSettings).toContainElement(
      screen.getByRole('button', { name: 'App settings' }),
    )
    expect(sidebarSettings).toContainElement(
      screen.getByRole('button', { name: 'Add knowledge root' }),
    )
  })

  it('persists the sidebar width from the final pointer position', async () => {
    localStorage.removeItem('agentic-remote:sidebar-width')
    render(<App />)
    const resizer = await screen.findByRole('separator', {
      name: 'Resize sidebar',
    })
    const pointer = (type: string, clientX: number) =>
      new PointerEvent(type, { bubbles: true, clientX, pointerId: 1 })

    await act(async () => {
      resizer.dispatchEvent(pointer('pointerdown', 300))
    })

    // A quick drag: the final move and the release both land before React
    // commits a render, so a handler that reads rendered state sees the width
    // from before the drag and saves that instead.
    await act(async () => {
      resizer.dispatchEvent(pointer('pointermove', 380))
      resizer.dispatchEvent(pointer('pointerup', 380))
    })

    expect(localStorage.getItem('agentic-remote:sidebar-width')).toBe('366')
  })

  it('recalls previous sent messages with ArrowUp per session', async () => {
    const historySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'history-user-1',
          role: 'user',
          content: 'First prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        },
        {
          id: 'history-agent-1',
          role: 'assistant',
          content: 'First response',
          createdAt: '2026-07-22T00:00:01.000Z',
        },
        {
          id: 'history-user-2',
          role: 'user',
          content: 'Second prompt\nwith details',
          createdAt: '2026-07-22T00:00:02.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historySession])
    vi.mocked(getSession).mockResolvedValue(historySession)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')

    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Second prompt\nwith details')
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('First prompt')
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    expect(textarea).toHaveValue('Second prompt\nwith details')
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    expect(textarea).toHaveValue('')

    fireEvent.change(textarea, { target: { value: 'Draft text\nline two' } })
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Draft text\nline two')
  })

  it('focuses the composer and recalls history from elsewhere in the app', async () => {
    const historySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'history-user-1',
          role: 'user',
          content: 'First prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        },
        {
          id: 'history-user-2',
          role: 'user',
          content: 'Second prompt',
          createdAt: '2026-07-22T00:00:02.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historySession])
    vi.mocked(getSession).mockResolvedValue(historySession)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const draft = 'Keep this draft'
    fireEvent.change(textarea, { target: { value: draft } })
    const sidebarButton = screen.getAllByRole('button', {
      name: 'New session',
    })[0]
    sidebarButton?.focus()

    fireEvent.keyDown(sidebarButton!, { key: 'ArrowUp' })

    expect(textarea).toHaveValue('Second prompt')
    await waitFor(() => expect(textarea).toHaveFocus())
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    expect(textarea).toHaveValue(draft)
  })

  it('does not steal ArrowUp while a dialog is open', async () => {
    const historySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'history-user-1',
          role: 'user',
          content: 'Previous prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historySession])
    vi.mocked(getSession).mockResolvedValue(historySession)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const newSessionButton = screen.getAllByRole('button', {
      name: 'New session',
    })[0]
    fireEvent.click(newSessionButton)
    expect(
      screen.getByRole('dialog', { name: 'Choose a folder' }),
    ).toBeInTheDocument()

    fireEvent.keyDown(newSessionButton, { key: 'ArrowUp' })

    expect(textarea).toHaveValue('')
    expect(textarea).not.toHaveFocus()
  })

  it('does not steal ArrowUp from sortable drag handles', async () => {
    const historySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'history-user-1',
          role: 'user',
          content: 'Previous prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historySession])
    vi.mocked(getSession).mockResolvedValue(historySession)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const dragHandle = screen.getByLabelText('Reorder Project chat')
    dragHandle.focus()

    fireEvent.keyDown(dragHandle, { key: 'ArrowUp' })

    expect(textarea).toHaveValue('')
    expect(textarea).not.toHaveFocus()
  })

  it('does not let history navigation overwrite dictated text', async () => {
    const historySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'history-user-1',
          role: 'user',
          content: 'First prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        },
        {
          id: 'history-user-2',
          role: 'user',
          content: 'Second prompt',
          createdAt: '2026-07-22T00:00:02.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historySession])
    vi.mocked(getSession).mockResolvedValue(historySession)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')

    // Start navigating, so history is active and tracking the empty draft.
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Second prompt')

    // Dictation appends to the composer without replacing it, and without
    // going through the textarea's change handler.
    const file = new File(['audio'], 'idea.webm', { type: 'audio/webm' })
    fireEvent.drop(textarea.closest('.composer')!, {
      dataTransfer: { files: [file], types: ['Files'] },
    })
    await waitFor(() =>
      expect(textarea).toHaveValue('Second prompt\n\nTranscribed walking idea'),
    )

    // Navigating again must not discard the dictated text.
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Second prompt\n\nTranscribed walking idea')
  })

  it('does not let history navigation overwrite a programmatic draft', async () => {
    const queued = {
      id: 'queue-1',
      content: 'Queued prompt text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const historySession: ManagedSession = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
      messages: [
        {
          id: 'history-user-1',
          role: 'user',
          content: 'First prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        },
        {
          id: 'history-user-2',
          role: 'user',
          content: 'Second prompt',
          createdAt: '2026-07-22T00:00:02.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historySession])
    vi.mocked(getSession).mockResolvedValue(historySession)
    vi.mocked(removeQueuedPrompt).mockResolvedValue({
      session: { ...historySession, queuedCount: 0, queuedPrompts: [] },
      prompt: queued,
    })

    render(<App />)
    const textarea = await screen.findByLabelText('Message')

    // Start navigating, so history is active and tracking the empty draft.
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Second prompt')

    // Editing a queued prompt writes the composer without the user typing, so
    // it never reaches the textarea's change handler.
    fireEvent.click(await screen.findByLabelText('Edit queued prompt 1'))
    await waitFor(() => expect(textarea).toHaveValue('Queued prompt text'))

    // Navigating again must not discard it. The tracked draft is the empty
    // string from before navigation, so without invalidation the recovered
    // text would be unreachable.
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Queued prompt text')
  })

  it('keeps completed tools in history while the current tool stays sticky', async () => {
    const runningSession: ManagedSession = {
      ...session,
      status: 'running',
      messages: [
        session.messages[0]!,
        session.messages[1]!,
        {
          id: 'message-4',
          role: 'activity',
          content: 'Task · Review implementation\ncode-review',
          createdAt: '2026-07-22T00:00:02.000Z',
          activityStatus: 'running',
        },
        session.messages[2]!,
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([runningSession])
    vi.mocked(getSession).mockResolvedValue(runningSession)

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(document.querySelectorAll('.tool-activity-history')).toHaveLength(1)
    expect(document.querySelector('.tool-activity-history')).toHaveTextContent(
      'Bash',
    )
    expect(document.querySelector('.tool-activity-slot')).toHaveTextContent(
      'Task · Review implementation',
    )
    const stack = document.querySelector('.message-stack')
    const runningTool = document.querySelector('.tool-activity-slot')
    const response = screen.getByText('Ready.').closest('article')
    expect(
      [...(stack?.children || [])].indexOf(runningTool as Element),
    ).toBeLessThan([...(stack?.children || [])].indexOf(response as Element))
  })

  it('marks a running background agent as still working', async () => {
    const runningSession: ManagedSession = {
      ...session,
      status: 'running',
      messages: [
        session.messages[0]!,
        {
          id: 'message-agent',
          role: 'activity',
          content: 'Agent (rubber-duck) · Final cache RCA review',
          createdAt: '2026-07-22T00:00:02.000Z',
          activityStatus: 'running',
        },
        session.messages[2]!,
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([runningSession])
    vi.mocked(getSession).mockResolvedValue(runningSession)

    render(<App />)
    await screen.findAllByText('Project chat')

    // The parent's last message reads as final, so the row has to say why the
    // session is still running.
    const row = document.querySelector('.activity-message--agent')
    expect(row).toHaveTextContent('Agent (rubber-duck) · Final cache RCA review')
    expect(row).toHaveTextContent('still working')
  })

  it('does not mark a finished background agent as still working', async () => {
    const doneSession: ManagedSession = {
      ...session,
      messages: [
        session.messages[0]!,
        {
          id: 'message-agent',
          role: 'activity',
          content: 'Agent (rubber-duck) · Final cache RCA review',
          createdAt: '2026-07-22T00:00:02.000Z',
          activityStatus: 'completed',
        },
        session.messages[2]!,
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([doneSession])
    vi.mocked(getSession).mockResolvedValue(doneSession)

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(
      document.querySelector('.activity-message--agent'),
    ).not.toHaveTextContent('still working')
  })

  it('opens app settings from the sessions panel', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(
      screen.getByRole('button', { name: 'App settings' }),
    )

    expect(
      screen.getByRole('dialog', { name: 'App settings' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'App updates' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Status line' })).toBeInTheDocument()
  })

  it('persists provider default models and applies them to new sessions', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    fireEvent.change(screen.getByLabelText('Copilot default model'), {
      target: { value: 'gpt-5.6-sol' },
    })
    fireEvent.change(screen.getByLabelText('Claude default model'), {
      target: { value: 'claude-sonnet-4-5' },
    })
    expect(
      JSON.parse(localStorage.getItem('agentic-remote:default-models') || '{}'),
    ).toEqual({
      copilot: 'gpt-5.6-sol',
      claude: 'claude-sonnet-4-5',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
        model: 'gpt-5.6-sol',
      }),
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'claude',
        terminalBacked: false,
        allowAllPermissions: true,
        model: 'claude-sonnet-4-5',
      }),
    )
  })

  it('persists a validated default folder per computer and applies it to new sessions', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Browse default session folder for development',
      }),
    )
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(
        computer.id,
        '~',
        'all',
      ),
    )
    fireEvent.click(await screen.findByRole('option', { name: 'src' }))
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(
        computer.id,
        '~/src',
        'all',
      ),
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Use this folder' })).not.toBeDisabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Use this folder' }))
    await waitFor(() =>
      expect(validateSessionDirectory).toHaveBeenCalledWith(
        computer.id,
        '~/src',
      ),
    )
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:default-session-folders') || '{}',
        ),
      ).toEqual({
        version: 1,
        folders: { [computer.id]: '~/src' },
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(computer.id, '~/src'),
    )
    expect(screen.getByText(/The session will start in/)).toHaveTextContent(
      '~/src',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(computer.id, {
        cwd: '~/src',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
      }),
    )
    expect(session.cwd).toBe('/home/tester/src/project')
  })

  it('rejects an invalid default folder without saving it', async () => {
    vi.mocked(validateSessionDirectory).mockRejectedValueOnce(
      new Error('Sessions are restricted to the user home directory'),
    )
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Browse default session folder for development',
      }),
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Use this folder' })).not.toBeDisabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Use this folder' }))

    expect(
      await screen.findByText('Sessions are restricted to the user home directory'),
    ).toBeInTheDocument()
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:default-session-folders') || '{}',
      ),
    ).toEqual({ version: 1, folders: {} })
  })

  it('reloads computer-specific default folders from versioned local storage', async () => {
    localStorage.setItem(
      'agentic-remote:default-session-folders',
      JSON.stringify({
        version: 1,
        folders: { [computer.id]: '~/reloaded' },
      }),
    )
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    expect(screen.getByText('~/reloaded')).toBeInTheDocument()
    expect(screen.getByText('Home directory (blank)')).toBeInTheDocument()
  })

  it('uses the default belonging to the selected computer', async () => {
    localStorage.setItem(
      'agentic-remote:default-session-folders',
      JSON.stringify({
        version: 1,
        folders: { [secondComputer.id]: '~/services' },
      }),
    )
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listDirectories).mockImplementation(
      async (computerId, path = '~') => {
        if (computerId === secondComputer.id && path === '~/services') {
          return { path: '~/services', parent: '~', directories: [] }
        }
        return path === '~'
          ? { path: '~', directories: [{ name: 'src', path: '~/src' }] }
          : {
              path: '~/src',
              parent: '~',
              directories: [{ name: 'project', path: '~/src/project' }],
            }
      },
    )
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Computer'), {
      target: { value: secondComputer.id },
    })
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(
        secondComputer.id,
        '~/services',
      ),
    )
    expect(screen.getByText(/The session will start in/)).toHaveTextContent(
      '~/services',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(secondComputer.id, {
        cwd: '~/services',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
      }),
    )
    expect(session.cwd).toBe('/home/tester/src/project')
  })

  it('applies a selected computer default before its folder listing resolves', async () => {
    localStorage.setItem(
      'agentic-remote:default-session-folders',
      JSON.stringify({
        version: 1,
        folders: { [secondComputer.id]: '~/services' },
      }),
    )
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    let resolveListing: ((listing: {
      path: string
      parent?: string
      directories: []
    }) => void) | undefined
    vi.mocked(listDirectories).mockImplementation(
      async (computerId, path = '~') => {
        if (computerId === secondComputer.id && path === '~/services') {
          return await new Promise((resolve) => {
            resolveListing = resolve
          })
        }
        return { path, directories: [] }
      },
    )
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Computer'), {
      target: { value: secondComputer.id },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(secondComputer.id, {
        cwd: '~/services',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
      }),
    )
    resolveListing?.({ path: '~/services', directories: [] })
  })

  it('dismisses the update toast without removing it from app settings', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    const registration = {
      waiting: { postMessage: vi.fn() },
    } as unknown as ServiceWorkerRegistration

    act(() => {
      window.dispatchEvent(
        new CustomEvent(PWA_UPDATE_EVENT, { detail: registration }),
      )
    })
    expect(
      screen.getByText('A new Agentic Remote version is ready.'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss update' }))
    expect(
      screen.queryByText('A new Agentic Remote version is ready.'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    expect(screen.getByRole('button', { name: 'Update now' })).toBeInTheDocument()
  })

  it('preserves a separate composer draft for each session', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === secondSession.id ? secondSession : session,
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'First session draft' } })

    fireEvent.click(screen.getByText('Second chat').closest('button')!)
    await waitFor(() => expect(textarea).toHaveValue(''))
    fireEvent.change(textarea, { target: { value: 'Second session draft' } })

    const firstSessionTitle = screen
      .getAllByText('Project chat')
      .find((element) => element.closest('.session-item'))
    fireEvent.click(firstSessionTitle!.closest('button')!)
    expect(textarea).toHaveValue('First session draft')

    fireEvent.click(screen.getByText('Second chat').closest('button')!)
    expect(textarea).toHaveValue('Second session draft')
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        ),
      ).toMatchObject({
        'computer-1:session-1': 'First session draft',
        'computer-1:session-2': 'Second session draft',
      }),
    )
  })

  it('adds an audio transcript to the live draft without sending it', async () => {
    let finishTranscription:
      | ((value: { transcript: string; durationSeconds: number }) => void)
      | undefined
    vi.mocked(transcribeAudio).mockReturnValue(
      new Promise((resolve) => {
        finishTranscription = resolve
      }),
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Existing thought' } })
    const file = new File(['audio'], 'idea.m4a', { type: 'audio/x-m4a' })

    fireEvent.change(screen.getByLabelText('File attachment'), {
      target: { files: [file] },
    })
    expect(
      screen.getByRole('button', { name: 'Transcribing audio' }),
    ).toBeDisabled()
    fireEvent.change(textarea, {
      target: { value: 'Existing thought edited while waiting' },
    })
    finishTranscription?.({
      transcript: 'Transcribed walking idea',
      durationSeconds: 12,
    })

    await waitFor(() =>
      expect(textarea).toHaveValue(
        'Existing thought edited while waiting\n\nTranscribed walking idea',
      ),
    )
    expect(transcribeAudio).toHaveBeenCalledWith(file)
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('accepts a dropped audio recording', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const file = new File(['audio'], 'idea.webm', { type: 'audio/webm' })
    const composerElement = textarea.closest('.composer')!

    fireEvent.drop(composerElement, {
      dataTransfer: { files: [file], types: ['Files'] },
    })

    await waitFor(() =>
      expect(textarea).toHaveValue('Transcribed walking idea'),
    )
    expect(transcribeAudio).toHaveBeenCalledWith(file)
  })

  it('browses and renders Markdown workspace files', async () => {
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenCalledWith(
        computer.id,
        session.id,
        '.',
      ),
    )
    // The path is now a breadcrumb trail rooted at the workspace folder.
    expect(
      screen.getByRole('navigation', { name: 'Folder breadcrumb' }),
    ).toBeInTheDocument()
    expect(screen.getByTitle(session.cwd)).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
    expect(await screen.findByRole('heading', { name: 'Workspace guide' }))
      .toBeInTheDocument()
    expect(document.querySelector('.workspace-dialog')).toHaveClass(
      'workspace-dialog--previewing',
    )
    expect(
      screen.getByRole('button', { name: 'Back to files' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Useful knowledge.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Raw' }))
    expect(screen.getByText(/# Workspace guide/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Insert path' }))
    expect(screen.getByLabelText('Message')).toHaveValue(
      'File: `/home/tester/src/project/README.md`',
    )
  })

  it('navigates workspace folder history and truncates forward history', async () => {
    vi.mocked(listWorkspace).mockImplementation(
      async (_computerId, _sessionId, path = '.') => {
        if (path === 'docs') {
          return {
            path: 'docs',
            parent: '.',
            entries: [],
          }
        }
        if (path === 'src') {
          return {
            path: 'src',
            parent: '.',
            entries: [],
          }
        }
        return {
          path: '.',
          entries: [
            { name: 'docs', path: 'docs', kind: 'directory' },
            { name: 'src', path: 'src', kind: 'directory' },
          ],
        }
      },
    )
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: 'docs' }))
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenLastCalledWith(
        computer.id,
        session.id,
        'docs',
      ),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Back folder' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Forward folder' }))
        .toBeEnabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Forward folder' }))
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenLastCalledWith(
        computer.id,
        session.id,
        'docs',
      ),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Back folder' }))
    fireEvent.click(await screen.findByRole('button', { name: 'src' }))
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenLastCalledWith(
        computer.id,
        session.id,
        'src',
      ),
    )
    expect(screen.getByRole('button', { name: 'Forward folder' }))
      .toBeDisabled()
  })

  it('keeps the newest workspace folder when requests finish out of order', async () => {
    let resolveDocs: (listing: WorkspaceListing) => void = () => undefined
    const docsListing = new Promise<WorkspaceListing>((resolve) => {
      resolveDocs = resolve
    })
    vi.mocked(listWorkspace).mockImplementation(
      async (_computerId, _sessionId, path = '.') => {
        if (path === 'docs') {
          return docsListing
        }
        if (path === 'src') {
          return {
            path: 'src',
            parent: '.',
            entries: [],
          }
        }
        return {
          path: '.',
          entries: [
            { name: 'docs', path: 'docs', kind: 'directory' },
            { name: 'src', path: 'src', kind: 'directory' },
          ],
        }
      },
    )
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    const docs = await screen.findByRole('button', { name: 'docs' })
    const src = screen.getByRole('button', { name: 'src' })
    act(() => {
      docs.click()
      src.click()
    })

    expect(
      await screen.findByTitle('/home/tester/src/project/src'),
    ).toBeInTheDocument()
    await act(async () => {
      resolveDocs({
        path: 'docs',
        parent: '.',
        entries: [],
      })
      await docsListing
    })
    expect(
      screen.getByTitle('/home/tester/src/project/src'),
    ).toBeInTheDocument()
  })

  it('moves the chat to the displayed workspace folder', async () => {
    vi.mocked(executeCommand).mockImplementation(
      async (_computerId, _sessionId, input) => ({
        ...session,
        cwd: input.command.slice('/cwd '.length),
      }),
    )
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: /docs/ }))
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenLastCalledWith(
        computer.id,
        session.id,
        'docs',
      ),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Move here' }))

    await waitFor(() =>
      expect(executeCommand).toHaveBeenCalledWith(
        computer.id,
        session.id,
        {
          command: '/cwd /home/tester/src/project/docs',
          enqueue: false,
        },
      ),
    )
    expect(
      screen.queryByRole('heading', { name: 'Session files' }),
    ).not.toBeInTheDocument()
  })




  it('records microphone audio and transcribes it into the draft', async () => {
    class MockMediaRecorder extends EventTarget {
      static isTypeSupported = vi.fn(() => true)
      state: RecordingState = 'inactive'
      mimeType = 'audio/mp4'

      start() {
        this.state = 'recording'
      }

      stop() {
        this.state = 'inactive'
        this.dispatchEvent(
          new BlobEvent('dataavailable', {
            data: new Blob(['voice'], { type: this.mimeType }),
          }),
        )
        this.dispatchEvent(new Event('stop'))
      }
    }
    const stopTrack = vi.fn()
    const getUserMedia = vi.fn(async () => ({
      getTracks: () => [{ stop: stopTrack }],
    }))
    const originalMediaDevices = navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })
    vi.stubGlobal('MediaRecorder', MockMediaRecorder)

    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Start microphone recording',
      }),
    )
    await waitFor(() =>
      expect(document.querySelector('.recording-panel')).toHaveTextContent(
        'Recording 0:00',
      ),
    )
    expect(document.querySelector('.composer-actions')).not.toBeInTheDocument()
    expect(
      document.querySelector('.composer')?.lastElementChild,
    ).toHaveClass('recording-panel')
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })

    fireEvent.click(screen.getByRole('button', { name: /Stop & transcribe/ }))

    await waitFor(() => expect(transcribeAudio).toHaveBeenCalledOnce())
    const recordedFile = vi.mocked(transcribeAudio).mock.calls[0][0]
    expect(recordedFile.name).toBe('recording.m4a')
    expect(recordedFile.type).toBe('audio/mp4')
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue(
        'Transcribed walking idea',
      ),
    )
    expect(stopTrack).toHaveBeenCalledOnce()

    vi.unstubAllGlobals()
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: originalMediaDevices,
    })
  })

  it('cancels microphone audio without transcribing it', async () => {
    class MockMediaRecorder extends EventTarget {
      static isTypeSupported = () => true
      state: RecordingState = 'inactive'
      mimeType = 'audio/webm'

      start() {
        this.state = 'recording'
      }

      stop() {
        this.state = 'inactive'
        this.dispatchEvent(
          new BlobEvent('dataavailable', {
            data: new Blob(['voice'], { type: this.mimeType }),
          }),
        )
        this.dispatchEvent(new Event('stop'))
      }
    }
    const originalMediaDevices = navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => ({ getTracks: () => [] })),
      },
    })
    vi.stubGlobal('MediaRecorder', MockMediaRecorder)

    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Start microphone recording',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() =>
      expect(screen.queryByText(/Recording 0:00/)).not.toBeInTheDocument(),
    )
    expect(transcribeAudio).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: originalMediaDevices,
    })
  })

  it('uploads a document to the selected computer and appends its path', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const file = new File(['financial data'], 'statement.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(screen.getByLabelText('File attachment'), {
      target: { files: [file] },
    })

    await waitFor(() =>
      expect(uploadSessionFile).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        file,
      ),
    )
    await waitFor(() =>
      expect(textarea).toHaveValue(
        'Attached file: `/private/uploads/statement.pdf`',
      ),
    )
    expect(transcribeAudio).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('uploads multiple selected files in order', async () => {
    vi.mocked(uploadSessionFile).mockImplementation(
      async (_computerId, _sessionId, file) => ({
        name: file.name,
        path: `/private/uploads/${file.name}`,
        size: file.size,
      }),
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const statement = new File(['statement'], 'statement.pdf', {
      type: 'application/pdf',
    })
    const transactions = new File(['transactions'], 'transactions.csv', {
      type: 'text/csv',
    })

    fireEvent.change(screen.getByLabelText('File attachment'), {
      target: { files: [statement, transactions] },
    })

    await waitFor(() =>
      expect(uploadSessionFile).toHaveBeenCalledTimes(2),
    )
    expect(vi.mocked(uploadSessionFile).mock.calls.map((call) => call[2])).toEqual(
      [statement, transactions],
    )
    await waitFor(() =>
      expect(textarea).toHaveValue(
        'Attached file: `/private/uploads/statement.pdf`\n\n' +
          'Attached file: `/private/uploads/transactions.csv`',
      ),
    )
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('preserves a transcript when an in-flight message send fails', async () => {
    let failSend: ((reason: Error) => void) | undefined
    vi.mocked(sendMessage).mockReturnValue(
      new Promise((_resolve, reject) => {
        failSend = reject
      }),
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Original message' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())

    const file = new File(['audio'], 'idea.m4a', { type: 'audio/x-m4a' })
    fireEvent.change(screen.getByLabelText('File attachment'), {
      target: { files: [file] },
    })
    await waitFor(() =>
      expect(textarea).toHaveValue('Transcribed walking idea'),
    )
    failSend?.(new Error('Send failed'))

    await waitFor(() =>
      expect(textarea).toHaveValue(
        'Original message\n\nTranscribed walking idea',
      ),
    )
  })

  it('mutes notifications for the selected session from the header', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(
      screen.getByRole('button', { name: 'Mute session notifications' }),
    )

    await waitFor(() =>
      expect(setSessionNotificationsMuted).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        true,
      ),
    )
    expect(
      screen.getByRole('button', { name: 'Unmute session notifications' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('opens Sessions by swiping right anywhere and closes by swiping left', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    const shell = document.querySelector('.app-shell')
    const sidebar = document.querySelector('.sidebar')
    if (!shell || !sidebar) {
      throw new Error('App shell or sidebar was not rendered')
    }

    fireEvent.touchStart(shell, {
      touches: [{ clientX: 12, clientY: 300 }],
    })
    fireEvent.touchEnd(shell, {
      changedTouches: [{ clientX: 110, clientY: 310 }],
    })
    expect(sidebar).toHaveClass('sidebar--open')

    fireEvent.touchStart(shell, {
      touches: [{ clientX: 250, clientY: 300 }],
    })
    fireEvent.touchEnd(shell, {
      changedTouches: [{ clientX: 150, clientY: 305 }],
    })
    expect(sidebar).not.toHaveClass('sidebar--open')

    fireEvent.touchStart(shell, {
      touches: [{ clientX: 80, clientY: 300 }],
    })
    fireEvent.touchEnd(shell, {
      changedTouches: [{ clientX: 180, clientY: 300 }],
    })
    expect(sidebar).toHaveClass('sidebar--open')

    fireEvent.touchStart(shell, {
      touches: [{ clientX: 250, clientY: 300 }],
    })
    fireEvent.touchEnd(shell, {
      changedTouches: [{ clientX: 150, clientY: 300 }],
    })
    expect(sidebar).not.toHaveClass('sidebar--open')

    const code = document.createElement('pre')
    shell.append(code)
    fireEvent.touchStart(code, {
      touches: [{ clientX: 12, clientY: 300 }],
    })
    fireEvent.touchEnd(code, {
      changedTouches: [{ clientX: 110, clientY: 300 }],
    })
    expect(sidebar).not.toHaveClass('sidebar--open')
  })

  it('opens the folder-first new session dialog', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

    expect(
      screen.getByRole('heading', { name: 'Choose a folder' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Choose a folder' }),
    ).toHaveClass('new-session-dialog')
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
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
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
        provider: 'copilot',
        terminalBacked: false,
        allowAllPermissions: true,
      }),
    )
  })

  it('keeps every computer visible after creating a remote session', async () => {
    const remoteSession: ManagedSession = {
      ...session,
      id: 'remote-session',
      computerId: secondComputer.id,
      computerName: secondComputer.name,
      title: 'Remote chat',
      messages: [],
    }
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([session, remoteSession])
    vi.mocked(createSession).mockResolvedValue({
      ...remoteSession,
      id: 'new-remote-session',
      title: 'New remote chat',
    })
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Computer'), {
      target: { value: secondComputer.id },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(secondComputer.id, {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
      }),
    )
    const groups = [...document.querySelectorAll('.computer-session-group')]
      .map((group) => group.textContent)
      .join(' ')
    expect(groups).toContain('development')
    expect(groups).toContain('worker-node')
  })

  it('can create a session without allow-all permissions', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(
      screen.getByRole('checkbox', { name: /Allow all permissions/ }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: false,
      }),
    )
  })

  it('creates a Claude Agent session without tmux', async () => {
    vi.mocked(createSession).mockResolvedValue({
      ...session,
      id: 'claude-session',
      provider: 'claude',
      title: 'Claude project',
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })
    expect(
      screen.queryByRole('checkbox', { name: /Create in tmux/ }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'claude',
        terminalBacked: false,
        allowAllPermissions: true,
      }),
    )
  })

  it('sends a message from an existing Claude Agent session', async () => {
    const claudeSession: ManagedSession = {
      ...session,
      id: 'claude-session',
      provider: 'claude',
      executionMode: 'sdk',
      title: 'Claude project',
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([claudeSession])
    vi.mocked(getSession).mockResolvedValue(claudeSession)
    vi.mocked(listCommands).mockResolvedValue([])
    vi.mocked(sendMessage).mockResolvedValue(claudeSession)
    render(<App />)

    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, {
      target: { value: 'Hello Claude' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        'computer-1',
        'claude-session',
        {
          content: 'Hello Claude',
          enqueue: false,
        },
      ),
    )
    expect(
      screen.getByText('Tap ↑ to send · Return adds a line'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('SDK', { selector: '.session-mode-badge' }),
    ).toBeInTheDocument()
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

  it('shows and answers ask-user prompts', async () => {
    const askingSession = {
      ...session,
      status: 'waiting' as const,
      pendingUserInput: {
        requestId: 'question-1',
        question: 'Which environment?',
        choices: ['Production', 'Staging'],
        allowFreeform: true,
      },
    }
    vi.mocked(listSessions).mockResolvedValue([askingSession])
    vi.mocked(getSession).mockResolvedValue(askingSession)
    vi.mocked(replyUserInput).mockResolvedValue({
      ...askingSession,
      status: 'running',
      pendingUserInput: undefined,
    })
    render(<App />)

    expect(await screen.findByText('Which environment?')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Production' }),
    ).toBeInTheDocument()
    const input = screen.getByLabelText('Your answer')
    fireEvent.change(input, { target: { value: 'Development' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() =>
      expect(replyUserInput).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'question-1',
        { answer: 'Development', wasFreeform: true },
      ),
    )
    expect(screen.queryByText('Which environment?')).not.toBeInTheDocument()
  })

  it('answers multi-select questions with every selected option', async () => {
    const askingSession = {
      ...session,
      status: 'waiting' as const,
      pendingUserInput: {
        requestId: 'question-multi',
        question: 'Which features?',
        choices: ['Search', 'Export', 'Webhooks'],
        allowFreeform: false,
        multiSelect: true,
      },
    }
    vi.mocked(listSessions).mockResolvedValue([askingSession])
    vi.mocked(getSession).mockResolvedValue(askingSession)
    vi.mocked(replyUserInput).mockResolvedValue({
      ...askingSession,
      status: 'running',
      pendingUserInput: undefined,
    })
    render(<App />)

    expect(await screen.findByText('Which features?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Search' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Webhooks' }))
    fireEvent.click(screen.getByRole('button', { name: 'Answer' }))

    await waitFor(() =>
      expect(replyUserInput).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'question-multi',
        {
          answer: 'Search, Webhooks',
          wasFreeform: false,
          answers: ['Search', 'Webhooks'],
        },
      ),
    )
  })

  it('shows and submits structured ask-user forms', async () => {
    const askingSession: ManagedSession = {
      ...session,
      status: 'waiting',
      pendingUserInput: {
        requestId: 'form-1',
        question: 'What should I inspect?',
        choices: [],
        allowFreeform: false,
        form: {
          fields: [
            {
              name: 'target',
              title: 'Inspection target',
              type: 'string',
              required: true,
            },
            {
              name: 'scope',
              title: 'Scope',
              type: 'string',
              required: true,
              options: [
                { value: 'worktree', label: 'Current worktree' },
                { value: 'code', label: 'Code behavior' },
              ],
            },
            {
              name: 'includeHistory',
              title: 'Include history',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              name: 'areas',
              title: 'Areas',
              type: 'array',
              required: false,
              options: [
                { value: 'server', label: 'Server' },
                { value: 'web', label: 'Web' },
              ],
            },
          ],
        },
      },
    }
    vi.mocked(listSessions).mockResolvedValue([askingSession])
    vi.mocked(getSession).mockResolvedValue(askingSession)
    vi.mocked(replyUserInput).mockResolvedValue({
      ...askingSession,
      status: 'running',
      pendingUserInput: undefined,
    })
    render(<App />)

    expect(await screen.findByText('What should I inspect?')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Inspection target'), {
      target: { value: 'agentic remote setup' },
    })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Scope' }), {
      key: 'j',
    })
    const scopeOptions = screen.getByRole('listbox', {
      name: 'Scope options',
    })
    fireEvent.keyDown(scopeOptions, { key: 'j' })
    fireEvent.keyDown(scopeOptions, { key: 'Enter' })
    const areas = screen.getByRole('group', { name: 'Areas options' })
    fireEvent.focus(areas)
    fireEvent.keyDown(areas, { key: ' ' })
    fireEvent.keyDown(areas, { key: 'j' })
    fireEvent.keyDown(areas, { key: ' ' })
    fireEvent.keyDown(areas, { key: 'Enter' })

    const values = {
      target: 'agentic remote setup',
      scope: 'code',
      includeHistory: true,
      areas: ['server', 'web'],
    }
    await waitFor(() =>
      expect(replyUserInput).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'form-1',
        {
          answer: JSON.stringify(values),
          wasFreeform: false,
          values,
        },
      ),
    )
    expect(screen.queryByText('What should I inspect?')).not.toBeInTheDocument()
  })

  it('opens at the latest messages and scrolls a new question into view while scrolled up', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(getSession).toHaveBeenCalledWith('computer-1', 'session-1'),
    )
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView)
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' }),
    )

    const timeline = document.querySelector<HTMLElement>('.timeline')
    expect(timeline).not.toBeNull()
    Object.defineProperties(timeline!, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 100, writable: true },
    })
    fireEvent.scroll(timeline!)
    scrollIntoView.mockClear()
    scrollIntoView.mockImplementation(() => {
      timeline!.scrollTop = 500
      fireEvent.scroll(timeline!)
    })

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...session,
            status: 'waiting',
            pendingUserInput: {
              requestId: 'new-question',
              question: 'Choose the deployment target',
              choices: ['Development', 'Production'],
              allowFreeform: false,
            },
          },
        }),
      } as MessageEvent)
    })

    expect(
      await screen.findByText('Choose the deployment target'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' }),
    )
    scrollIntoView.mockClear()

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...session,
            status: 'waiting',
            pendingUserInput: {
              requestId: 'new-question',
              question: 'Choose the deployment target',
              choices: ['Development', 'Production'],
              allowFreeform: false,
            },
            messages: [
              ...session.messages,
              {
                id: 'later-message',
                role: 'assistant',
                content: 'A later transcript update',
                createdAt: '2026-07-22T00:00:04.000Z',
              },
            ],
          },
        }),
      } as MessageEvent)
    })

    expect(await screen.findByText('A later transcript update')).toBeInTheDocument()
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('scrolls a new permission into view while scrolled up', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(getSession).toHaveBeenCalledWith('computer-1', 'session-1'),
    )

    const timeline = document.querySelector<HTMLElement>('.timeline')
    expect(timeline).not.toBeNull()
    Object.defineProperties(timeline!, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 100, writable: true },
    })
    fireEvent.scroll(timeline!)
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView)
    scrollIntoView.mockClear()

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...session,
            status: 'waiting',
            pendingPermission: {
              requestId: 'new-permission',
              title: 'Run the deployment command?',
              options: [
                { optionId: 'allow', name: 'Allow', kind: 'allow' },
                { optionId: 'deny', name: 'Deny', kind: 'deny' },
              ],
            },
          },
        }),
      } as MessageEvent)
    })

    expect(
      await screen.findByText('Run the deployment command?'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' }),
    )
  })

  it('preserves a scrolled-up timeline through complete and streaming messages', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(getSession).toHaveBeenCalledWith('computer-1', 'session-1'),
    )

    const timeline = document.querySelector<HTMLElement>('.timeline')
    expect(timeline).not.toBeNull()
    Object.defineProperties(timeline!, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 100, writable: true },
    })
    fireEvent.scroll(timeline!)
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView)
    scrollIntoView.mockClear()

    const streamedMessage = {
      id: 'streamed-message',
      role: 'assistant' as const,
      content: 'A complete response',
      createdAt: '2026-07-22T00:00:03.000Z',
    }
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...session,
            messages: [...session.messages, streamedMessage],
          },
        }),
      } as MessageEvent)
    })
    expect(await screen.findByText('A complete response')).toBeInTheDocument()
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)))
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(timeline!.scrollTop).toBe(100)

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...session,
            messages: [
              ...session.messages,
              {
                ...streamedMessage,
                content: 'A complete response with a streamed update',
              },
            ],
          },
        }),
      } as MessageEvent)
    })
    expect(
      await screen.findByText('A complete response with a streamed update'),
    ).toBeInTheDocument()
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)))
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(timeline!.scrollTop).toBe(100)

    timeline!.scrollTop = 470
    fireEvent.scroll(timeline!)
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...session,
            messages: [
              ...session.messages,
              {
                ...streamedMessage,
                content: 'A later streamed update',
              },
            ],
          },
        }),
      } as MessageEvent)
    })

    expect(await screen.findByText('A later streamed update')).toBeInTheDocument()
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' }),
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
    const textarea = screen.getByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Keep this draft' } })

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
    expect(textarea).toHaveValue('Keep this draft')

    vi.mocked(clearConversation).mockClear()
    fireEvent.change(textarea, { target: { value: '/clear' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() =>
      expect(clearConversation).toHaveBeenCalledWith(
        'computer-1',
        'cleared-session',
      ),
    )
  })

  it('restarts the selected session without removing UI history', async () => {
    render(<App />)
    await screen.findByText('Hello agent')

    fireEvent.click(screen.getByRole('button', { name: 'Restart session' }))
    await waitFor(() =>
      expect(restartSession).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
    expect(screen.getByText('Hello agent')).toBeInTheDocument()

    vi.mocked(restartSession).mockClear()
    const textarea = screen.getByLabelText('Message')
    fireEvent.change(textarea, { target: { value: '/restart' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() =>
      expect(restartSession).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
  })

  it('moves an idle Copilot SDK session to tmux', async () => {
    const sdkSession: ManagedSession = {
      ...session,
      executionMode: 'sdk',
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([sdkSession])
    vi.mocked(getSession).mockResolvedValue(sdkSession)
    vi.mocked(moveSessionToTmux).mockResolvedValue({
      ...sdkSession,
      executionMode: 'tmux',
    })

    render(<App />)

    await screen.findByRole('button', { name: 'Move session to tmux' })
    fireEvent.click(
      screen.getByRole('button', { name: 'Move session to tmux' }),
    )

    await waitFor(() =>
      expect(moveSessionToTmux).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
    expect(
      screen.queryByRole('button', { name: 'Move session to tmux' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('tmux', { selector: '.session-mode-badge' }),
    ).toBeInTheDocument()
  })

  it('hides tmux migration when the owning node does not advertise support', async () => {
    const remoteSdkSession: ManagedSession = {
      ...session,
      computerId: secondComputer.id,
      computerName: secondComputer.name,
      executionMode: 'sdk',
      messages: [],
    }
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([remoteSdkSession])
    vi.mocked(getSession).mockResolvedValue(remoteSdkSession)
    render(<App />)

    await screen.findByLabelText('Message')
    expect(
      screen.queryByRole('button', { name: 'Move session to tmux' }),
    ).not.toBeInTheDocument()
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

  it('does not let a delayed detail response overwrite a newer event', async () => {
    let resolveDetail!: (value: ManagedSession) => void
    vi.mocked(listSessions).mockResolvedValue([{ ...session, revision: 1 }])
    vi.mocked(getSession).mockReturnValue(
      new Promise((resolve) => {
        resolveDetail = resolve
      }),
    )
    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(getSession).toHaveBeenCalled())

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...session,
            revision: 3,
            messages: [
              ...session.messages,
              {
                id: 'fresh-event',
                role: 'assistant',
                content: 'Fresh event state',
                createdAt: '2026-07-22T00:00:03.000Z',
              },
            ],
          },
        }),
      } as MessageEvent)
    })
    expect(await screen.findByText('Fresh event state')).toBeInTheDocument()

    await act(async () => {
      resolveDetail({
        ...session,
        revision: 2,
        messages: [
          ...session.messages,
          {
            id: 'stale-detail',
            role: 'assistant',
            content: 'Stale detail state',
            createdAt: '2026-07-22T00:00:02.000Z',
          },
        ],
      })
    })
    expect(screen.getByText('Fresh event state')).toBeInTheDocument()
    expect(screen.queryByText('Stale detail state')).not.toBeInTheDocument()
  })

  it('does not resurrect a session removed during reconnect detail loading', async () => {
    let resolveDetail!: (value: ManagedSession) => void
    vi.mocked(listSessions).mockResolvedValue([{ ...session, revision: 1 }])
    vi.mocked(getSession)
      .mockResolvedValueOnce({ ...session, revision: 1 })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveDetail = resolve
        }),
      )
    render(<App />)
    await screen.findAllByText('Project chat')

    MockWebSocket.instances[0]?.onopen?.()
    await waitFor(() => expect(getSession).toHaveBeenCalledTimes(2))
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: session.id,
        }),
      } as MessageEvent)
    })
    await act(async () => {
      resolveDetail({ ...session, revision: 1 })
    })

    await waitFor(() =>
      expect(document.querySelector('.conversation-header__title')).toHaveTextContent(
        'Agentic Remote',
      ),
    )
    expect(screen.queryByText('Hello agent')).not.toBeInTheDocument()
  })

  it('replaces stale tool history from the reconnect snapshot', async () => {
    const stale = {
      ...session,
      revision: 1,
      status: 'running' as const,
      messages: [
        ...session.messages,
        {
          id: 'tool:stale',
          role: 'activity' as const,
          content: 'Bash\n$ long task',
          createdAt: '2026-07-22T00:00:02.000Z',
          activityStatus: 'running' as const,
        },
      ],
    }
    const current = {
      ...stale,
      revision: 2,
      status: 'idle' as const,
      messages: stale.messages.map((message) =>
        message.id === 'tool:stale'
          ? { ...message, activityStatus: 'completed' as const }
          : message,
      ),
    }
    vi.mocked(listSessions)
      .mockResolvedValueOnce([stale])
      .mockResolvedValue([current])
    vi.mocked(getSession)
      .mockResolvedValueOnce(stale)
      .mockResolvedValue(current)
    render(<App />)
    await screen.findByRole('button', { name: 'Stop response' })

    MockWebSocket.instances[0]?.onopen?.()

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Stop response' }),
      ).not.toBeInTheDocument(),
    )
    expect(document.querySelector('.tool-activity-history')).toBeInTheDocument()
  })

  it('selects another session when the selected session is removed', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    render(<App />)
    await screen.findAllByText('Project chat')

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: session.id,
        }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(document.querySelector('.conversation-header__title')).toHaveTextContent(
        'Second chat',
      ),
    )
  })

  it('does not resurrect a computer removed during snapshot refresh', async () => {
    let resolveComputers!: (value: ComputerSummary[]) => void
    vi.mocked(listComputers)
      .mockResolvedValueOnce([computer])
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveComputers = resolve
        }),
      )
    vi.mocked(listSessions).mockResolvedValue([{ ...session, revision: 1 }])
    vi.mocked(getSession).mockResolvedValue({ ...session, revision: 1 })
    render(<App />)
    await screen.findAllByText('Project chat')

    MockWebSocket.instances[0]?.onopen?.()
    await waitFor(() => expect(listComputers).toHaveBeenCalledTimes(2))
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'computer.removed',
          computerId: computer.id,
        }),
      } as MessageEvent)
    })
    await act(async () => {
      resolveComputers([computer])
    })

    await waitFor(() =>
      expect(document.querySelector('.conversation-header__title')).toHaveTextContent(
        'Agentic Remote',
      ),
    )
    expect(screen.queryByText('Hello agent')).not.toBeInTheDocument()
  })

  it('converges after cancelling even when no event arrives', async () => {
    const running = {
      ...session,
      revision: 1,
      status: 'running' as const,
    }
    const stopped = {
      ...running,
      revision: 2,
      status: 'idle' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([running])
    vi.mocked(getSession)
      .mockResolvedValueOnce(running)
      .mockResolvedValueOnce(stopped)
    vi.mocked(cancelSession).mockResolvedValue()
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'Stop response' }))

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Stop response' }),
      ).not.toBeInTheDocument(),
    )
    expect(cancelSession).toHaveBeenCalledWith(computer.id, session.id)
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
    expect(textarea.closest('.composer-text-panel')).toBeInTheDocument()
    expect(document.querySelector('.composer-actions')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Insert newline' }),
    ).not.toBeInTheDocument()
    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 96,
    })

    fireEvent.change(textarea, { target: { value: 'send now' } })
    textarea.focus()
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: 'send now',
        enqueue: false,
      })
    })
    await waitFor(() => expect(textarea).toHaveFocus())

    vi.mocked(sendMessage).mockClear()
    fireEvent.change(textarea, { target: { value: 'keep editing' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(sendMessage).not.toHaveBeenCalled()
    expect(textarea).toHaveStyle({ height: '96px' })

    fireEvent.change(textarea, { target: { value: 'firstsecond' } })
    ;(textarea as HTMLTextAreaElement).setSelectionRange(5, 5)
    const originalMatchMedia = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        matches: true,
        media: '(pointer: coarse)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea).toHaveValue('first\nsecond')
    expect(sendMessage).not.toHaveBeenCalled()

    fireEvent.change(textarea, { target: { value: 'queue this' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: 'queue this',
        enqueue: true,
      })
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    })
  })

  it('offers immediate send and queue buttons while the agent is running', async () => {
    const runningSession: ManagedSession = {
      ...session,
      status: 'running',
    }
    vi.mocked(listSessions).mockResolvedValue([runningSession])
    vi.mocked(getSession).mockResolvedValue(runningSession)
    vi.mocked(sendMessage).mockResolvedValue(runningSession)
    render(<App />)
    const textarea = await screen.findByLabelText('Message')

    fireEvent.change(textarea, { target: { value: 'send immediately' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: 'send immediately',
        enqueue: false,
      }),
    )

    await waitFor(() => expect(textarea).not.toBeDisabled())
    vi.mocked(sendMessage).mockClear()
    fireEvent.change(textarea, { target: { value: 'queue this instead' } })
    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: 'queue this instead',
        enqueue: true,
      }),
    )
    expect(
      screen.getByRole('button', { name: 'Send message' }),
    ).toHaveAttribute('title', 'Send immediately')
    expect(
      screen.getByRole('button', { name: 'Stop response' }),
    ).toBeInTheDocument()
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

  it('opens a folder picker for /cwd at the terminal directory', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(listCommands).toHaveBeenCalled())

    fireEvent.change(textarea, { target: { value: '/cwd' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(
      await screen.findByRole('heading', { name: 'Change working directory' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        '.',
      ),
    )
    expect(screen.getByText(/Copilot will continue in/)).toHaveTextContent(
      '~/src/project',
    )

    fireEvent.click(screen.getByRole('option', { name: 'docs' }))
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'docs',
      ),
    )
    expect(screen.getByText(/Copilot will continue in/)).toHaveTextContent(
      '~/src/project/docs',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Change directory' }),
    )
    await waitFor(() =>
      expect(executeCommand).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        {
          command: '/cwd /home/tester/src/project/docs',
          enqueue: false,
        },
      ),
    )
    expect(
      screen.queryByRole('heading', { name: 'Change working directory' }),
    ).not.toBeInTheDocument()
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
          mode: 'plan',
          allowAllPermissions: true,
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
        '922k context',
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
      expect(screen.getByTestId('web-statusline')).toHaveTextContent('plan')
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        'allow all',
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
      expect(screen.getByRole('option', { name: '114k tokens' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '922k tokens' })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /long context/i })).not.toBeInTheDocument()
      fireEvent.change(screen.getByLabelText('Agent mode'), {
        target: { value: 'autopilot' },
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
            mode: 'autopilot',
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

  it('prevents runtime changes while the session is active', async () => {
    const runningSession = {
      ...session,
      status: 'running' as const,
      runtime: {
        model: 'gpt-5.6-sol',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'plan',
      },
    }
    vi.mocked(listSessions).mockResolvedValue([runningSession])
    vi.mocked(getSession).mockResolvedValue(runningSession)
    render(<App />)

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Configure model, effort, and context',
      }),
    )

    expect(
      await screen.findByRole('button', { name: 'Apply runtime settings' }),
    ).toBeDisabled()
    expect(
      screen.getByText(
        'Finish or stop the current response before changing runtime settings.',
      ),
    ).toBeInTheDocument()
  })

  it('uses reconciled runtime status when the session summary is stale', async () => {
    const staleSession = {
      ...session,
      status: 'running' as const,
      runtime: {
        model: 'gpt-5.6-sol',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'plan',
      },
    }
    vi.mocked(listSessions).mockResolvedValue([staleSession])
    vi.mocked(getSession).mockResolvedValue(staleSession)
    vi.mocked(getRuntimeOptions).mockResolvedValue({
      status: 'idle',
      current: staleSession.runtime,
      models: [
        {
          id: 'gpt-5.6-sol',
          name: 'GPT-5.6 Sol',
          reasoningEfforts: ['high'],
          contextTiers: ['default', 'long_context'],
        },
      ],
    })
    render(<App />)

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Configure model, effort, and context',
      }),
    )

    expect(
      await screen.findByRole('button', { name: 'Apply runtime settings' }),
    ).toBeEnabled()
    expect(
      screen.queryByText(
        'Finish or stop the current response before changing runtime settings.',
      ),
    ).not.toBeInTheDocument()
  })

  it('applies the persisted computer order without mutating the loaded array', async () => {
    localStorage.setItem(
      'agentic-remote:computer-order',
      JSON.stringify([secondComputer.id, computer.id]),
    )
    const loaded = [computer, secondComputer]
    vi.mocked(listComputers).mockResolvedValue(loaded)
    vi.mocked(listSessions).mockResolvedValue([session])
    const { container } = render(<App />)
    await screen.findAllByText('Project chat')

    await waitFor(() => {
      const groups = container.querySelectorAll(
        '.computer-session-groups > *',
      )
      expect(groups).toHaveLength(2)
      expect(groups[0].textContent).toContain(secondComputer.name)
      expect(groups[1].textContent).toContain(computer.name)
    })
    expect(loaded).toEqual([computer, secondComputer])
  })
  it('navigates with breadcrumbs and offers a document outline', async () => {
    vi.mocked(readWorkspaceFile).mockResolvedValue({
      name: 'knowledge.md',
      path: 'docs/knowledge.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 90,
      content:
        '# Knowledge base\n\nIntro.\n\n## Session model\n\nOne computer.\n\n## Files\n\nStay put.',
    })
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: /docs/ }))
    fireEvent.click(
      await screen.findByRole('button', { name: /knowledge.md/ }),
    )

    // Headings are anchored so the outline can jump to them.
    const heading = await screen.findByRole('heading', {
      name: 'Session model',
    })
    expect(heading).toHaveAttribute('id', 'session-model')

    fireEvent.click(
      await screen.findByRole('button', { name: 'Document outline' }),
    )
    const outline = await screen.findByRole('navigation', {
      name: 'Document outline',
    })
    expect(
      within(outline).getByRole('button', { name: 'Session model' }),
    ).toBeInTheDocument()
    expect(
      within(outline).getByRole('button', { name: 'Knowledge base' }),
    ).toBeInTheDocument()

    // A breadcrumb segment returns to its folder.
    fireEvent.click(screen.getByRole('button', { name: 'Back to files' }))
    const crumbs = screen.getByRole('navigation', { name: 'Folder breadcrumb' })
    expect(
      within(crumbs).getByRole('button', { name: 'docs' }),
    ).toHaveAttribute('aria-current', 'page')
    fireEvent.click(within(crumbs).getByRole('button', { name: 'project' }))
    await waitFor(() =>
      expect(listWorkspace).toHaveBeenLastCalledWith(
        computer.id,
        session.id,
        '.',
      ),
    )
  })

  it('returns to the previous document at its previous scroll position', async () => {
    // jsdom performs no layout, so scrollTop is inert. Back it with a real
    // accessor for this test so the reader's scroll bookkeeping is observable.
    const offsets = new WeakMap<HTMLElement, number>()
    const original = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollTop',
    )
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      get(this: HTMLElement) {
        return offsets.get(this) ?? 0
      },
      set(this: HTMLElement, value: number) {
        offsets.set(this, value)
      },
    })
    if (original) {
      restoreScrollTop = () =>
        Object.defineProperty(HTMLElement.prototype, 'scrollTop', original)
    }

    vi.mocked(readWorkspaceFile).mockImplementation(
      async (_computerId, _sessionId, path) => ({
        name: path.split('/').at(-1) || path,
        path,
        kind: 'markdown' as const,
        mimeType: 'text/plain; charset=utf-8',
        size: 40,
        content: `# ${path}\n\nBody of ${path}.`,
      }),
    )
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
    await screen.findByRole('heading', { name: 'README.md' })

    // Scroll the first document, then open a second one.
    const content = document.querySelector('.workspace-preview__content')
    if (content) {
      content.scrollTop = 240
      fireEvent.scroll(content)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Back to files' }))
    fireEvent.click(await screen.findByRole('button', { name: /docs/ }))
    fireEvent.click(
      await screen.findByRole('button', { name: /knowledge.md/ }),
    )
    await screen.findByRole('heading', { name: 'docs/knowledge.md' })

    // Back returns to the first document and restores where it was.
    fireEvent.click(screen.getByRole('button', { name: 'Previous document' }))
    await screen.findByRole('heading', { name: 'README.md' })
    await waitFor(() =>
      expect(readWorkspaceFile).toHaveBeenLastCalledWith(
        computer.id,
        session.id,
        'README.md',
      ),
    )
    await waitFor(() =>
      expect(
        document.querySelector('.workspace-preview__content')?.scrollTop,
      ).toBe(240),
    )
  })
  it('browses a knowledge root from the sidebar switch', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_root, path) =>
      path === 'guides'
        ? {
            path: 'guides',
            parent: '.',
            entries: [
              {
                name: 'setup.md',
                path: 'guides/setup.md',
                kind: 'markdown' as const,
                size: 30,
              },
            ],
          }
        : {
            path: '.',
            entries: [
              { name: 'guides', path: 'guides', kind: 'directory' as const },
            ],
          },
    )
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'setup.md',
      path: 'guides/setup.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 30,
      content: '# Setup\n\nSteps.\n\n## Install\n\nRun it.',
    })
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })

    // The first root is selected automatically and listed without any session.
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenCalledWith('root-1', '.'),
    )
    // Folders are tree items that expand in place instead of replacing the list.
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    )
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenLastCalledWith('root-1', 'guides'),
    )

    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /setup.md/ }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Setup' }),
    ).toBeInTheDocument()
    expect(readKnowledgeFile).toHaveBeenCalledWith('root-1', 'guides/setup.md')

    // The reader offers the same outline as the session workspace.
    fireEvent.click(
      await screen.findByRole('button', { name: 'Document outline' }),
    )
    const outline = await screen.findByRole('navigation', {
      name: 'Document outline',
    })
    expect(
      within(outline).getByRole('button', { name: 'Install' }),
    ).toBeInTheDocument()

    // Closing the panel leaves the conversation and its sessions intact.
    fireEvent.click(
      screen.getByRole('button', { name: 'Close knowledge panel' }),
    )
    expect(
      screen.getByRole('navigation', { name: 'Sessions' }),
    ).not.toHaveAttribute('hidden')
    expect(
      document.querySelector('.knowledge-panel'),
    ).toHaveAttribute('hidden')
  })

  it('expands knowledge folders in place and remembers them', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_root, path) =>
      path === 'guides'
        ? {
            path: 'guides',
            parent: '.',
            entries: [
              {
                name: 'setup.md',
                path: 'guides/setup.md',
                kind: 'markdown' as const,
                size: 30,
              },
            ],
          }
        : {
            path: '.',
            entries: [
              { name: 'guides', path: 'guides', kind: 'directory' as const },
              {
                name: 'readme.md',
                path: 'readme.md',
                kind: 'markdown' as const,
                size: 10,
              },
            ],
          },
    )
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })

    const guides = await within(tree).findByRole('treeitem', {
      name: /guides/,
    })
    expect(guides).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(guides)
    await within(tree).findByRole('treeitem', { name: /setup.md/ })

    // Expanding keeps the surrounding folder visible instead of replacing it.
    expect(
      within(tree).getByRole('treeitem', { name: /readme.md/ }),
    ).toBeInTheDocument()
    expect(
      within(tree).getByRole('treeitem', { name: /guides/ }),
    ).toHaveAttribute('aria-expanded', 'true')
    // Children are one level deeper, so the sidebar can indent them.
    expect(
      within(tree).getByRole('treeitem', { name: /setup.md/ }),
    ).toHaveAttribute('aria-level', '2')

    const crumbs = within(tree).getByRole('group', { name: 'Knowledge folder' })
    expect(
      within(crumbs).getByRole('button', { name: 'guides' }),
    ).toHaveAttribute('aria-current', 'true')
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-expanded') || '{}',
      ),
    ).toEqual({ 'root-1': ['guides'] })

    fireEvent.click(within(tree).getByRole('treeitem', { name: /guides/ }))
    expect(
      within(tree).queryByRole('treeitem', { name: /setup.md/ }),
    ).not.toBeInTheDocument()

    // Reopening a folder reuses what was already read.
    const loads = vi.mocked(listKnowledgeEntries).mock.calls.length
    fireEvent.click(within(tree).getByRole('treeitem', { name: /guides/ }))
    await within(tree).findByRole('treeitem', { name: /setup.md/ })
    expect(vi.mocked(listKnowledgeEntries).mock.calls.length).toBe(loads)

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Collapse all folders' }),
    )
    expect(
      within(tree).queryByRole('treeitem', { name: /setup.md/ }),
    ).not.toBeInTheDocument()
  })

  it('keeps the tree usable when one folder cannot be read', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_root, path) => {
      if (path === 'notes') {
        throw new Error('offline')
      }
      return {
        path: '.',
        entries: [
          { name: 'notes', path: 'notes', kind: 'directory' as const },
          {
            name: 'readme.md',
            path: 'readme.md',
            kind: 'markdown' as const,
            size: 10,
          },
        ],
      }
    })
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })

    fireEvent.click(await within(tree).findByRole('treeitem', { name: /notes/ }))

    // The failure is reported on its own branch, not by blanking the tree.
    expect(await within(tree).findByText('offline')).toBeInTheDocument()
    expect(
      within(tree).getByRole('treeitem', { name: /readme.md/ }),
    ).toBeInTheDocument()
  })

  it('expands and collapses knowledge folders from the keyboard', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_root, path) =>
      path === 'guides'
        ? {
            path: 'guides',
            parent: '.',
            entries: [
              {
                name: 'setup.md',
                path: 'guides/setup.md',
                kind: 'markdown' as const,
                size: 30,
              },
            ],
          }
        : {
            path: '.',
            entries: [
              { name: 'guides', path: 'guides', kind: 'directory' as const },
            ],
          },
    )
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    const guides = await within(tree).findByRole('treeitem', { name: /guides/ })
    guides.focus()

    fireEvent.keyDown(guides, { key: 'ArrowRight' })
    const child = await within(tree).findByRole('treeitem', {
      name: /setup.md/,
    })

    // Right again steps into the branch that was just opened.
    fireEvent.keyDown(guides, { key: 'ArrowRight' })
    expect(child).toHaveFocus()

    // Left from a child returns to its folder, and closes it from there.
    fireEvent.keyDown(child, { key: 'ArrowLeft' })
    expect(guides).toHaveFocus()
    fireEvent.keyDown(guides, { key: 'ArrowLeft' })
    expect(
      within(tree).queryByRole('treeitem', { name: /setup.md/ }),
    ).not.toBeInTheDocument()
  })

  it('adds a knowledge root by picking a computer folder', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    vi.mocked(addKnowledgeRoot).mockResolvedValue({
      id: 'root-new',
      computerId: computer.id,
      computerName: computer.name,
      path: '~/src',
      name: 'src',
      createdAt: '2026-08-01T00:00:00.000Z',
    })
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [],
    })
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Add knowledge root' }),
    )
    // Sessions stay visible beside the panel, so the folder has to be picked
    // inside the dialog rather than anywhere on screen.
    const rootDialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })
    fireEvent.click(await within(rootDialog).findByRole('button', { name: /src/ }))
    const addFolder = within(rootDialog).getByRole('button', {
      name: 'Add this folder',
    })
    await waitFor(() => expect(addFolder).toBeEnabled())
    fireEvent.click(addFolder)

    await waitFor(() =>
      expect(addKnowledgeRoot).toHaveBeenCalledWith({
        computerId: computer.id,
        path: '~/src',
      }),
    )
  })
  it('renders an image referenced from a workspace document', async () => {
    vi.mocked(readWorkspaceFile).mockImplementation(async (_c, _s, target) =>
      target === 'docs/diagram.svg'
        ? {
            name: 'diagram.svg',
            path: 'docs/diagram.svg',
            kind: 'image' as const,
            mimeType: 'image/svg+xml',
            size: 40,
            base64: 'PHN2Zz48L3N2Zz4=',
          }
        : {
            name: 'knowledge.md',
            path: 'docs/knowledge.md',
            kind: 'markdown' as const,
            mimeType: 'text/plain; charset=utf-8',
            size: 60,
            content:
              '# Diagram\n\n![Flow](./diagram.svg)\n\n![Remote](https://example.test/x.png)\n\n![Gone](./missing.svg)',
          },
    )
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: /docs/ }))
    fireEvent.click(
      await screen.findByRole('button', { name: /knowledge.md/ }),
    )
    await screen.findByRole('heading', { name: 'Diagram' })

    // The relative image is resolved against the document and inlined.
    const image = await screen.findByAltText('Flow')
    expect(image).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    )
    expect(readWorkspaceFile).toHaveBeenCalledWith(
      computer.id,
      session.id,
      'docs/diagram.svg',
    )

    // An absolute source is left for the browser to load.
    expect(screen.getByAltText('Remote')).toHaveAttribute(
      'src',
      'https://example.test/x.png',
    )

    // A missing image degrades to its alt text rather than breaking the page.
    expect(await screen.findByText('Gone')).toBeInTheDocument()
  })
  it('previews an image selected directly from the workspace', async () => {
    vi.mocked(listWorkspace).mockResolvedValue({
      path: '.',
      entries: [
        { name: 'diagram.svg', path: 'diagram.svg', kind: 'image', size: 40 },
      ],
    })
    vi.mocked(readWorkspaceFile).mockResolvedValue({
      name: 'diagram.svg',
      path: 'diagram.svg',
      kind: 'image',
      mimeType: 'image/svg+xml',
      size: 40,
      base64: 'PHN2Zz48L3N2Zz4=',
    })
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: /diagram.svg/ }))

    // An image opened on its own renders instead of an empty <pre>.
    const image = await screen.findByAltText('diagram.svg')
    expect(image).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    )
  })
  it('searches workspace files and opens a result', async () => {
    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Browse current session folder',
      }),
    )
    const search = await screen.findByLabelText('Search workspace')
    fireEvent.change(search, { target: { value: 'knowledge' } })
    fireEvent.submit(search.closest('form')!)

    await waitFor(() =>
      expect(searchWorkspace).toHaveBeenCalledWith(
        computer.id,
        session.id,
        'knowledge',
        '.',
      ),
    )
    expect(await screen.findByText('Useful knowledge.')).toBeInTheDocument()
  })

  it('reopens the document that was being read', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-position',
      JSON.stringify({
        rootId: 'root-1',
        path: 'guides',
        file: 'guides/setup.md',
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/srv/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: 'guides',
      parent: '.',
      entries: [
        {
          name: 'setup.md',
          path: 'guides/setup.md',
          kind: 'markdown',
          size: 20,
        },
      ],
    })
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'setup.md',
      path: 'guides/setup.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 20,
      content: '# Setup guide',
    })
    render(<App />)
    await screen.findAllByText('Project chat')

    // No folder picking on return: the previous root, folder, and document all
    // come back on their own.
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenCalledWith('root-1', 'guides'),
    )
    await waitFor(() =>
      expect(readKnowledgeFile).toHaveBeenCalledWith(
        'root-1',
        'guides/setup.md',
      ),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    expect(
      await screen.findByRole('heading', { name: 'Setup guide' }),
    ).toBeInTheDocument()
  })

  it('picks a knowledge root from anywhere on the computer', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    vi.mocked(listDirectories).mockResolvedValue({
      path: '/srv',
      parent: '/',
      directories: [{ name: 'docs', path: '/srv/docs' }],
    })
    vi.mocked(addKnowledgeRoot).mockResolvedValue({
      id: 'root-new',
      computerId: computer.id,
      computerName: computer.name,
      path: '/srv/docs',
      name: 'docs',
      createdAt: '2026-08-01T00:00:00.000Z',
    })
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(
      await screen.findByRole('button', { name: 'Add knowledge root' }),
    )
    // The picker walks the whole filesystem, not just the home directory.
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(computer.id, '~', 'all'),
    )
    fireEvent.click(await screen.findByRole('button', { name: /docs/ }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Add this folder' }),
    )
    await waitFor(() =>
      expect(addKnowledgeRoot).toHaveBeenCalledWith({
        computerId: computer.id,
        path: '/srv',
      }),
    )
  })

  it('keeps knowledge open across sessions and follows the new one', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    const panel = document.querySelector('.knowledge-panel')
    expect(panel).toHaveAttribute('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--docked',
    )
    // Files are navigated from the sidebar, in every mode.
    const sidebar = document.querySelector('.sidebar')!
    expect(
      within(sidebar as HTMLElement).getByRole('navigation', {
        name: 'Knowledge',
      }),
    ).toBeInTheDocument()

    // Reading survives a session switch instead of being dismissed.
    fireEvent.click(
      screen.getAllByRole('button', { name: /Second chat/ })[0]!,
    )
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Second chat/ })
          .find((item) => item.classList.contains('session-item')),
      ).toHaveAttribute('aria-current', 'page'),
    )
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-mode') || '""',
      ),
    ).toBe('docked')
  })

  it('expands the knowledge panel over the conversation', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    expect(document.querySelector('.conversation')).not.toHaveAttribute(
      'hidden',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand knowledge panel' }),
    )
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--expanded',
    )
    // Expanded covers the conversation instead of squeezing it.
    expect(document.querySelector('.conversation')).toHaveAttribute('hidden')

    fireEvent.click(
      screen.getByRole('button', { name: 'Minimize knowledge panel' }),
    )
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--docked',
    )
    expect(document.querySelector('.conversation')).not.toHaveAttribute(
      'hidden',
    )
  })

  it('restores the knowledge scroll position when the panel reopens', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: Array.from({ length: 40 }, (_, index) => ({
        name: `note-${index}.md`,
        path: `note-${index}.md`,
        kind: 'markdown' as const,
        size: 10,
      })),
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })

    tree.scrollTop = 180
    fireEvent.scroll(tree)
    fireEvent.click(
      screen.getByRole('button', { name: 'Close knowledge panel' }),
    )
    // A hidden panel reports 0; recording that would erase the position.
    tree.scrollTop = 0
    fireEvent.scroll(tree)
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))

    // Reopening resumes where the reader was, instead of jumping to the top.
    expect(
      screen.getByRole('navigation', { name: 'Knowledge' }).scrollTop,
    ).toBe(180)
  })

  it('drives sessions and the knowledge panel from the keyboard', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    await screen.findAllByText('Project chat')
    // Shortcuts are bound to the window, so they work with focus anywhere.
    const shell = window
    const sessionItem = (title: RegExp) =>
      screen
        .getAllByRole('button', { name: title })
        .find((item) => item.classList.contains('session-item'))!
    expect(sessionItem(/Project chat/)).toHaveAttribute('aria-current', 'page')

    fireEvent.keyDown(shell, { key: 'ArrowDown', code: 'ArrowDown', altKey: true })
    await waitFor(() =>
      expect(sessionItem(/Second chat/)).toHaveAttribute('aria-current', 'page'),
    )
    fireEvent.keyDown(shell, { key: 'ArrowUp', code: 'ArrowUp', altKey: true })
    await waitFor(() =>
      expect(sessionItem(/Project chat/)).toHaveAttribute('aria-current', 'page'),
    )

    fireEvent.keyDown(shell, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )
    fireEvent.keyDown(shell, {
      key: 'K',
      code: 'KeyK',
      altKey: true,
      shiftKey: true,
    })
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--expanded',
    )
    fireEvent.keyDown(shell, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.knowledge-panel')).toHaveAttribute('hidden')
  })

  it('lists the keyboard shortcuts in app settings', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))

    const shortcuts = await screen.findByRole('heading', {
      name: 'Keyboard shortcuts',
    })
    const list = shortcuts.parentElement?.querySelector('.shortcut-list')
    expect(list).toHaveTextContent('Next session')
    expect(list).toHaveTextContent('Open or close knowledge')
    expect(list).toHaveTextContent('Expand or minimize knowledge')
  })

  it('keeps the selected session in the URL and follows browser history', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    window.history.replaceState({}, '', '/')

    render(<App />)
    await screen.findAllByText('Project chat')

    // Auto-selection corrects the address without adding a history entry.
    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-1',
      ),
    )

    fireEvent.click(
      screen.getAllByRole('button', { name: /Second chat/ })[0]!,
    )
    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-2',
      ),
    )

    // Going back returns to the session that was open before.
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-1',
    )
    window.dispatchEvent(new PopStateEvent('popstate'))
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Project chat/ })
          .find((item) => item.classList.contains('session-item')),
      ).toHaveAttribute('aria-current', 'page'),
    )
  })

  it('keeps knowledge reachable with no session selected', async () => {
    vi.mocked(listSessions).mockResolvedValue([])
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      }),
    )

    render(<App />)
    // Configured roots stay browsable when no session exists at all.
    fireEvent.click(
      await screen.findByRole('button', { name: 'Session knowledge' }),
    )
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    expect(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    ).toBeInTheDocument()
  })

  it('does not overwrite a session knowledge position before restoring it', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-2': { rootId: 'root-1', path: 'guides' },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    await screen.findByRole('navigation', { name: 'Knowledge' })

    // Selecting another session must not stamp the previous session's reader
    // state over its own remembered one.
    fireEvent.click(
      screen.getAllByRole('button', { name: /Second chat/ })[0]!,
    )
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Second chat/ })
          .find((item) => item.classList.contains('session-item')),
      ).toHaveAttribute('aria-current', 'page'),
    )
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-session-positions') ||
          '{}',
      )['computer-1:session-2'],
    ).toEqual({ rootId: 'root-1', path: 'guides' })
  })

  it('leaves composer text editing to the composer', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    textarea.focus()

    fireEvent.keyDown(textarea, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      altKey: true,
    })
    fireEvent.keyDown(textarea, { key: 'k', code: 'KeyK', altKey: true })

    // Alt+Arrow moves the caret by word, so the shortcut must stand down.
    expect(
      screen
        .getAllByRole('button', { name: /Project chat/ })
        .find((item) => item.classList.contains('session-item')),
    ).toHaveAttribute('aria-current', 'page')
    expect(document.querySelector('.knowledge-panel')).toHaveAttribute('hidden')
  })

  it('shows errors in the knowledge panel that covers the conversation', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [
        { name: 'setup.md', path: 'setup.md', kind: 'markdown', size: 10 },
      ],
    })
    vi.mocked(readKnowledgeFile).mockRejectedValue(new Error('offline'))

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand knowledge panel' }),
    )
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /setup.md/ }),
    )

    // The conversation is covered, so its banner cannot be the only one.
    const panel = document.querySelector('.knowledge-panel')!
    await waitFor(() =>
      expect(panel.querySelector('.knowledge-panel__error')).toHaveTextContent(
        'offline',
      ),
    )
  })

  it('opens the session a direct link names', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(secondSession)
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-2',
    )

    render(<App />)
    await screen.findAllByText('Second chat')

    // Synchronising the address must not erase the link before the session
    // loader has read it.
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Second chat/ })
          .find((item) => item.classList.contains('session-item')),
      ).toHaveAttribute('aria-current', 'page'),
    )
    expect(window.location.search).toBe(
      '?computer=computer-1&session=session-2',
    )
  })

  it('forgets the knowledge state of a closed session', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(deleteSession).mockResolvedValue()
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
        'computer-1:session-2': { rootId: 'root-1', path: 'notes' },
      }),
    )
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Close session' }))

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-session-positions') ||
            '{}',
        ),
      ).toEqual({ 'computer-1:session-2': { rootId: 'root-1', path: 'notes' } }),
    )
    confirmSpy.mockRestore()
  })

  it('retries a knowledge restore that failed', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_root, path) => {
      if (path === 'guides') {
        throw new Error('offline')
      }
      return {
        path: '.',
        entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
      }
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenCalledWith('root-1', 'guides'),
    )

    // A restore that failed is not remembered as done, so closing and
    // reopening tries the branch again instead of giving up on it.
    const attempts = vi
      .mocked(listKnowledgeEntries)
      .mock.calls.filter(([, path]) => path === 'guides').length
    fireEvent.click(
      screen.getByRole('button', { name: 'Close knowledge panel' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    await waitFor(() =>
      expect(
        vi
          .mocked(listKnowledgeEntries)
          .mock.calls.filter(([, path]) => path === 'guides').length,
      ).toBeGreaterThan(attempts),
    )
  })

  it('reaches the file tree while the panel covers the conversation', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))

    // The sidebar slides away on a phone, so the panel offers a way back to
    // the files it is reading.
    fireEvent.click(screen.getByRole('button', { name: 'Show files' }))
    expect(document.querySelector('.sidebar')).toHaveClass('sidebar--open')
  })

  it('leaves file navigation keys to the file tree', async () => {
    const historySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'history-user-1',
          role: 'user',
          content: 'Earlier prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historySession])
    vi.mocked(getSession).mockResolvedValue(historySession)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      }),
    )

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    await screen.findByRole('navigation', { name: 'Knowledge' })
    // The root selector and breadcrumbs sit outside the tree's own key
    // handling, so they are where a stray recall would surface.
    const rootButton = document.querySelector<HTMLButtonElement>(
      '.knowledge-root > button',
    )!
    rootButton.focus()

    fireEvent.keyDown(rootButton, { key: 'ArrowUp' })

    // Working through the file navigation must not recall a message into the
    // composer or pull focus away from it.
    expect(textarea).toHaveValue('')
    expect(rootButton).toHaveFocus()
  })

  it('carries the reading position to a cleared conversation', async () => {
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      messages: [],
    }
    vi.mocked(clearConversation).mockResolvedValue(replacement)
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: 'guides',
      parent: '.',
      entries: [
        { name: 'setup.md', path: 'guides/setup.md', kind: 'markdown', size: 8 },
      ],
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))

    // Clearing gives the session a new id, so its reading position has to
    // travel with it rather than being stranded under the old one.
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-session-positions') ||
            '{}',
        ),
      ).toEqual({
        'computer-1:session-1-cleared': { rootId: 'root-1', path: 'guides' },
      }),
    )
    confirmSpy.mockRestore()
  })

  it('drops a file still loading when the folder moves on', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [
            { name: 'slow.md', path: 'slow.md', kind: 'markdown', size: 8 },
            { name: 'guides', path: 'guides', kind: 'directory' },
          ],
        },
      }),
    )
    let releaseFile: ((file: WorkspaceFile) => void) | undefined
    vi.mocked(readKnowledgeFile).mockImplementation(
      () =>
        new Promise<WorkspaceFile>((resolve) => {
          releaseFile = resolve
        }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /slow.md/ }),
    )
    // Navigating with the breadcrumb clears the reader, so a late answer for
    // the file left behind must not repopulate it.
    const crumbs = within(tree).getByRole('group', { name: 'Knowledge folder' })
    fireEvent.click(within(crumbs).getByRole('button', { name: 'docs' }))

    releaseFile?.({
      name: 'slow.md',
      path: 'slow.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 8,
      content: '# Stale document',
    })
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Stale document' }),
      ).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('heading', { name: 'Stale document' }),
    ).not.toBeInTheDocument()
  })

  it('lists a knowledge root created as the first one', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    vi.mocked(listDirectories).mockResolvedValue({
      path: '/srv',
      parent: '/',
      directories: [{ name: 'docs', path: '/srv/docs' }],
    })
    vi.mocked(addKnowledgeRoot).mockResolvedValue({
      id: 'root-new',
      computerId: computer.id,
      computerName: computer.name,
      path: '/srv',
      name: 'srv',
      createdAt: '2026-08-01T00:00:00.000Z',
    })
    let releaseListing: (() => void) | undefined
    vi.mocked(listKnowledgeEntries).mockImplementation(
      () =>
        new Promise<WorkspaceListing>((resolve) => {
          releaseListing = () =>
            resolve({
              path: '.',
              entries: [
                { name: 'guides', path: 'guides', kind: 'directory' },
              ],
            })
        }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(
      await screen.findByRole('button', { name: 'Add knowledge root' }),
    )
    const rootDialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })
    const addFolder = within(rootDialog).getByRole('button', {
      name: 'Add this folder',
    })
    await waitFor(() => expect(addFolder).toBeEnabled())
    fireEvent.click(addFolder)

    // The listing is answered only once the new root has been rendered, which
    // is exactly when a stray invalidation would discard it and leave the
    // tree empty until the root is picked again by hand.
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    await waitFor(() => expect(releaseListing).toBeDefined())
    releaseListing?.()
    expect(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    ).toBeInTheDocument()
  })

  it('falls back when history names a session that is gone', async () => {
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')

    act(() => {
      window.history.replaceState(
        {},
        '',
        '/?computer=computer-1&session=deleted-session',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    // Reconciled in the same commit as the history event, rather than left
    // with nothing selected until some later refresh repairs it.
    expect(
      screen
        .getAllByRole('button', { name: /Project chat/ })
        .find((item) => item.classList.contains('session-item')),
    ).toHaveAttribute('aria-current', 'page')

    // Going back to a session that has since been closed must land on one
    // that still exists rather than on nothing at all.
    // Checked well inside the transcript poll interval, so the fallback is
    // the fix rather than the next refresh happening to repair it.
    await waitFor(
      () =>
        expect(
          screen
            .getAllByRole('button', { name: /Project chat/ })
            .find((item) => item.classList.contains('session-item')),
        ).toHaveAttribute('aria-current', 'page'),
      { timeout: 250 },
    )
    await waitFor(
      () =>
        expect(window.location.search).toBe(
          '?computer=computer-1&session=session-1',
        ),
      { timeout: 250 },
    )
  })

  it('colours the knowledge toggles while they are on', async () => {
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })

    render(<App />)
    await screen.findAllByText('Project chat')

    // A toggle that is on is accented, the way the mute control already is,
    // so its state is visible and not only announced.
    const toggle = screen.getByRole('button', { name: 'Session knowledge' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).not.toHaveClass('icon-button--active')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(toggle).toHaveClass('icon-button--active')

    const expand = screen.getByRole('button', { name: 'Expand knowledge panel' })
    expect(expand).toHaveAttribute('aria-pressed', 'false')
    expect(expand).not.toHaveClass('icon-button--active')

    fireEvent.click(expand)
    const minimize = screen.getByRole('button', {
      name: 'Minimize knowledge panel',
    })
    expect(minimize).toHaveAttribute('aria-pressed', 'true')
    expect(minimize).toHaveClass('icon-button--active')

    fireEvent.click(screen.getByRole('button', { name: 'Close knowledge panel' }))
    expect(
      screen.getByRole('button', { name: 'Session knowledge' }),
    ).not.toHaveClass('icon-button--active')
  })

  it('keeps a chosen file when a slow restore finishes late', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': {
          rootId: 'root-1',
          path: 'guides',
          file: 'guides/remembered.md',
        },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    let releaseGuides: (() => void) | undefined
    vi.mocked(listKnowledgeEntries).mockImplementation(
      async (_root, path) =>
        path === 'guides'
          ? new Promise<WorkspaceListing>((resolve) => {
              releaseGuides = () =>
                resolve({
                  path: 'guides',
                  parent: '.',
                  entries: [
                    {
                      name: 'remembered.md',
                      path: 'guides/remembered.md',
                      kind: 'markdown' as const,
                      size: 10,
                    },
                  ],
                })
            })
          : {
              path: '.',
              entries: [
                {
                  name: 'chosen.md',
                  path: 'chosen.md',
                  kind: 'markdown' as const,
                  size: 10,
                },
                { name: 'guides', path: 'guides', kind: 'directory' as const },
              ],
            },
    )
    vi.mocked(readKnowledgeFile).mockImplementation(async (_root, target) => ({
      name: target.split('/').pop() || target,
      path: target,
      kind: 'markdown' as const,
      mimeType: 'text/plain; charset=utf-8',
      size: 10,
      content:
        target === 'chosen.md' ? '# Chosen document' : '# Remembered document',
    }))

    render(<App />)
    await screen.findAllByText('Project chat')
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    // The restore is parked on the remembered folder.
    await waitFor(() => expect(releaseGuides).toBeDefined())

    // Meanwhile the reader opens a different document.
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /chosen.md/ }),
    )
    await screen.findByRole('heading', { name: 'Chosen document' })

    releaseGuides?.()

    // The late restore must not reopen the remembered document over it.
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenCalledWith('root-1', 'guides'),
    )
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(
      screen.getByRole('heading', { name: 'Chosen document' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Remembered document' }),
    ).not.toBeInTheDocument()
  })

  it('leaves a history entry when a session is created', async () => {
    const fresh: ManagedSession = {
      ...session,
      id: 'session-fresh',
      title: 'Fresh chat',
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(createSession).mockResolvedValue(fresh)
    vi.mocked(listDirectories).mockResolvedValue({
      path: '/home/tester',
      parent: '/home',
      directories: [{ name: 'src', path: '/home/tester/src' }],
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-1',
      ),
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0]!)
    const dialog = await screen.findByRole('dialog', { name: 'Choose a folder' })
    fireEvent.click(within(dialog).getByRole('button', { name: /Create session/ }))

    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-fresh',
      ),
    )

    // Creating a session is navigation, so Back returns to the one that was
    // open before it rather than replacing that entry.
    act(() => {
      window.history.back()
    })
    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-1',
      ),
    )
  })

  it('keeps a chosen root when a slow restore finishes late', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': {
          rootId: 'root-1',
          path: 'guides',
          file: 'guides/remembered.md',
        },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'root-2',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/other',
        name: 'other',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    let releaseGuides: (() => void) | undefined
    vi.mocked(listKnowledgeEntries).mockImplementation(
      async (rootId, path = '.') => {
        if (rootId === 'root-1' && path === 'guides') {
          return new Promise<WorkspaceListing>((resolve) => {
            releaseGuides = () =>
              resolve({
                path: 'guides',
                parent: '.',
                entries: [
                  {
                    name: 'remembered.md',
                    path: 'guides/remembered.md',
                    kind: 'markdown',
                    size: 10,
                  },
                ],
              })
          })
        }
        return rootId === 'root-2'
          ? {
              path: '.',
              entries: [
                { name: 'only-here.md', path: 'only-here.md', kind: 'markdown', size: 4 },
              ],
            }
          : {
              path: '.',
              entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
            }
      },
    )
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'remembered.md',
      path: 'guides/remembered.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 10,
      content: '# Remembered document',
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    await waitFor(() => expect(releaseGuides).toBeDefined())

    // The reader switches root while the remembered branch is still loading.
    fireEvent.click(
      within(tree)
        .getAllByRole('button', { name: /other/ })
        .find((button) => button.closest('.knowledge-root'))!,
    )
    await within(tree).findByRole('treeitem', { name: /only-here.md/ })

    releaseGuides?.()
    await new Promise((resolve) => setTimeout(resolve, 150))

    // The late restore belongs to the root that was left, so it must not
    // reopen its document over the newly chosen one.
    expect(
      screen.queryByRole('heading', { name: 'Remembered document' }),
    ).not.toBeInTheDocument()

    // Abandoning the restore also has to hand recording back, or the root the
    // reader chose is never remembered for this session.
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-session-positions') ||
            '{}',
        )['computer-1:session-1'],
      ).toMatchObject({ rootId: 'root-2' }),
    )
  })

  it('does not show one session document while another is selected', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [
            { name: 'setup.md', path: 'setup.md', kind: 'markdown', size: 10 },
          ],
        },
      }),
    )
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'setup.md',
      path: 'setup.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 10,
      content: '# Setup guide',
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /setup.md/ }),
    )
    await screen.findByRole('heading', { name: 'Setup guide' })

    // The second session has never opened anything, so the panel must not
    // leave the first session's document on screen under its name.
    fireEvent.click(screen.getAllByRole('button', { name: /Second chat/ })[0]!)
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Setup guide' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('drops a file read left behind by the session that started it', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [
            { name: 'slow.md', path: 'slow.md', kind: 'markdown', size: 10 },
          ],
        },
      }),
    )
    let releaseFile: (() => void) | undefined
    vi.mocked(readKnowledgeFile).mockImplementation(
      () =>
        new Promise<WorkspaceFile>((resolve) => {
          releaseFile = () =>
            resolve({
              name: 'slow.md',
              path: 'slow.md',
              kind: 'markdown',
              mimeType: 'text/plain; charset=utf-8',
              size: 10,
              content: '# Slow document',
            })
        }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })

    // The first session starts reading a document.
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /slow.md/ }),
    )
    await waitFor(() => expect(releaseFile).toBeDefined())

    // Before it lands, the reader moves to a session that has never opened
    // anything at all.
    fireEvent.click(screen.getAllByRole('button', { name: /Second chat/ })[0]!)
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Second chat/ })
          .find((item) => item.classList.contains('session-item')),
      ).toHaveAttribute('aria-current', 'page'),
    )

    releaseFile?.()
    await new Promise((resolve) => setTimeout(resolve, 150))

    // The read belongs to the session that asked for it, so it must not
    // surface under the one now selected, nor be saved as its position.
    expect(
      screen.queryByRole('heading', { name: 'Slow document' }),
    ).not.toBeInTheDocument()
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-session-positions') ||
          '{}',
      )['computer-1:session-2']?.file,
    ).toBeUndefined()
  })

  it('forgets knowledge state for a session removed elsewhere', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
        'computer-1:session-2': { rootId: 'root-1', path: 'notes' },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    await screen.findAllByText('Project chat')

    // The removal reaches every connected client, not only the one that
    // closed the session, so each has to forget what it was reading.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-2',
        }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-session-positions') ||
            '{}',
        ),
      ).toEqual({ 'computer-1:session-1': { rootId: 'root-1', path: 'guides' } }),
    )
  })

  it('loads the folders above a remembered document on startup', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-position',
      JSON.stringify({ rootId: 'root-1', path: 'guides/deep' }),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/srv/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
        guides: {
          path: 'guides',
          parent: '.',
          entries: [
            { name: 'deep', path: 'guides/deep', kind: 'directory' },
          ],
        },
        'guides/deep': {
          path: 'guides/deep',
          parent: 'guides',
          entries: [
            {
              name: 'note.md',
              path: 'guides/deep/note.md',
              kind: 'markdown',
              size: 6,
            },
          ],
        },
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')

    // The remembered folder sits two levels down, so its ancestors have to
    // load for the branch to be reachable at all.
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenCalledWith('root-1', 'guides'),
    )
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    expect(
      await within(tree).findByRole('treeitem', { name: /note.md/ }),
    ).toBeInTheDocument()
  })

  it('carries the position across a clear even as the removal arrives', async () => {
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      messages: [],
    }
    let releaseClear: (() => void) | undefined
    vi.mocked(clearConversation).mockImplementation(
      () =>
        new Promise<ManagedSession>((resolve) => {
          releaseClear = () => resolve(replacement)
        }),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
    await waitFor(() => expect(releaseClear).toBeDefined())

    // The server removes the old session and creates a replacement, and the
    // removal reaches this client first. Pruning then would throw the
    // position away before it could be moved across.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
        }),
      } as MessageEvent)
    })
    await act(async () => {
      releaseClear?.()
    })

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-session-positions') ||
            '{}',
        ),
      ).toEqual({
        'computer-1:session-1-cleared': { rootId: 'root-1', path: 'guides' },
      }),
    )
    confirmSpy.mockRestore()
  })

  it('moves the position on a client that did not issue the clear', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-2': { rootId: 'root-1', path: 'notes' },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    await screen.findAllByText('Project chat')

    // Another browser cleared the conversation. This client only sees the
    // removal, so the event has to say the session was replaced rather than
    // deleted, or the position is thrown away here.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-2',
          replacedBy: 'session-2-cleared',
        }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-session-positions') ||
            '{}',
        ),
      ).toEqual({
        'computer-1:session-2-cleared': { rootId: 'root-1', path: 'notes' },
      }),
    )
  })

  it('carries the draft across a clear on every client', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Draft worth keeping' } })

    // Another browser cleared this conversation. The replacement is a new
    // session id, so the draft has to travel with it rather than be dropped.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
          replacedBy: 'session-1-cleared',
        }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, id: 'session-1-cleared', messages: [] },
        }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue(
        'Draft worth keeping',
      ),
    )
  })

  it('clears a foreign document after the panel was closed in between', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [
            { name: 'setup.md', path: 'setup.md', kind: 'markdown', size: 10 },
          ],
        },
      }),
    )
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'setup.md',
      path: 'setup.md',
      kind: 'markdown',
      mimeType: 'text/plain; charset=utf-8',
      size: 10,
      content: '# Setup guide',
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /setup.md/ }),
    )
    await screen.findByRole('heading', { name: 'Setup guide' })

    // Closing the panel resets the handled marker, so only the view owner
    // still knows this document belongs to the first session.
    fireEvent.click(
      screen.getByRole('button', { name: 'Close knowledge panel' }),
    )
    fireEvent.click(screen.getAllByRole('button', { name: /Second chat/ })[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Setup guide' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('keeps a cleared session muted and selected', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(getPushSettings).mockResolvedValue({
      mutedSessions: ['computer-1:session-1'],
    })
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Unmute session notifications' }),
      ).toBeInTheDocument(),
    )

    // Removal and upsert arrive separately. Following the replacement keeps
    // the conversation selected and silenced across the gap, instead of
    // landing on an unrelated session with notifications switched back on.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
          replacedBy: 'session-1-cleared',
        }),
      } as MessageEvent)
    })
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, id: 'session-1-cleared', messages: [] },
        }),
      } as MessageEvent)
    })

    // The address carries the selection, so it says plainly which session is
    // open once the replacement arrives.
    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-1-cleared',
      ),
    )
    expect(
      screen.getByRole('button', { name: 'Unmute session notifications' }),
    ).toBeInTheDocument()
  })

  it('loads the root listing even if the first attempt was superseded', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-position',
      JSON.stringify({ rootId: 'root-1', path: '.' }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/srv/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    const rootListing: WorkspaceListing = {
      path: '.',
      entries: [
        { name: 'setup.md', path: 'setup.md', kind: 'markdown', size: 8 },
      ],
    }
    let releaseRoot: (() => void) | undefined
    let held = false
    vi.mocked(listKnowledgeEntries).mockImplementation(async () => {
      if (held) {
        return rootListing
      }
      held = true
      // Only the startup load is held open; the recovery that follows has to
      // answer normally or the test could not tell the two apart.
      return new Promise<WorkspaceListing>((resolve) => {
        releaseRoot = () => resolve(rootListing)
      })
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(releaseRoot).toBeDefined())

    // Switching session supersedes the startup load, which then writes
    // nothing. The panel must still end up with a listing rather than sit
    // blank until the root is picked again by hand.
    fireEvent.click(screen.getAllByRole('button', { name: /Second chat/ })[0]!)
    releaseRoot?.()

    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    expect(
      await within(tree).findByRole('treeitem', { name: /setup.md/ }),
    ).toBeInTheDocument()
  })

  it('keeps everything when an older node omits the replacement', async () => {
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      messages: [],
    }
    let releaseClear: (() => void) | undefined
    vi.mocked(clearConversation).mockImplementation(
      () =>
        new Promise<ManagedSession>((resolve) => {
          releaseClear = () => resolve(replacement)
        }),
    )
    vi.mocked(getPushSettings).mockResolvedValue({
      mutedSessions: ['computer-1:session-1'],
    })
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
      }),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Draft worth keeping' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
    await waitFor(() => expect(releaseClear).toBeDefined())

    // A node on an older build sends no replacement link, so the removal
    // looks like a deletion. Everything the conversation carries has to
    // survive until the response names the replacement.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
        }),
      } as MessageEvent)
    })
    await act(async () => {
      releaseClear?.()
    })

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-session-positions') ||
            '{}',
        ),
      ).toEqual({
        'computer-1:session-1-cleared': { rootId: 'root-1', path: 'guides' },
      }),
    )
    expect(screen.getByLabelText('Message')).toHaveValue('Draft worth keeping')
    expect(
      screen.getByRole('button', { name: 'Unmute session notifications' }),
    ).toBeInTheDocument()
    confirmSpy.mockRestore()
  })

  it('keeps the migrated mute when a stale refresh answers late', async () => {
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      messages: [],
    }
    vi.mocked(getPushSettings).mockResolvedValue({
      mutedSessions: ['computer-1:session-1'],
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    await screen.findByRole('button', {
      name: 'Unmute session notifications',
    })

    let answerSettings: (() => void) | undefined
    vi.mocked(getPushSettings).mockImplementation(
      () =>
        new Promise<{ mutedSessions: string[] }>((resolve) => {
          // A reconnect asks before the clear happens, so its answer still
          // names the session that is about to be replaced.
          answerSettings = () =>
            resolve({ mutedSessions: ['computer-1:session-1'] })
        }),
    )
    vi.mocked(listSessions).mockResolvedValue([session])

    const socket = MockWebSocket.instances[0]!
    act(() => {
      socket.onopen?.()
    })
    await waitFor(() => expect(answerSettings).toBeDefined())

    act(() => {
      socket.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
          replacedBy: replacement.id,
        }),
      } as MessageEvent)
      socket.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: replacement }),
      } as MessageEvent)
    })
    await act(async () => {
      answerSettings?.()
    })

    // The reply predates the clear, so it must not unmute the replacement the
    // mute was just moved to.
    expect(
      await screen.findByRole('button', {
        name: 'Unmute session notifications',
      }),
    ).toBeInTheDocument()
  })

  it('recovers a root listing abandoned mid-flight', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: '.' },
      }),
    )
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/srv/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    const rootListing: WorkspaceListing = {
      path: '.',
      entries: [
        { name: 'setup.md', path: 'setup.md', kind: 'markdown', size: 8 },
      ],
    }
    let switched = false
    const stalled: ((listing: WorkspaceListing) => void)[] = []
    vi.mocked(listKnowledgeEntries).mockImplementation(async () => {
      if (switched) {
        return rootListing
      }
      // Every reply is held back until the session has changed, so the
      // generation check discards them all and the folder is left marked
      // loading with nothing on the way.
      return new Promise<WorkspaceListing>((resolve) => {
        stalled.push(resolve)
      })
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(stalled.length).toBeGreaterThan(0))

    // Changing session abandons the load. The new session has nothing to
    // restore, so nothing else asks for the root: the discarded reply would
    // otherwise leave the folder marked loading for ever.
    fireEvent.click(screen.getAllByRole('button', { name: /Second chat/ })[0]!)
    switched = true
    await act(async () => {
      for (const resolve of stalled) {
        resolve(rootListing)
      }
    })

    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    expect(
      await within(tree).findByRole('treeitem', { name: /setup.md/ }),
    ).toBeInTheDocument()
  })

  it('no longer offers a separate saved paths panel', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    // Knowledge is a per-session panel now, closed until the session opens it.
    expect(document.querySelector('.knowledge-panel')).toHaveAttribute('hidden')
    expect(
      screen.getByRole('button', { name: 'Add knowledge root' }),
    ).toBeInTheDocument()
  })
  it('keeps the remembered position when it cannot be restored', async () => {
    const remembered = {
      rootId: 'root-1',
      path: 'guides',
      file: 'guides/setup.md',
    }
    localStorage.setItem(
      'agentic-remote:knowledge-position',
      JSON.stringify(remembered),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/srv/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    // The owning computer is unreachable this time.
    vi.mocked(listKnowledgeEntries).mockRejectedValue(new Error('offline'))
    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(listKnowledgeEntries).toHaveBeenCalled())

    // A failed restore must not erase where the reader was.
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-position') || '{}',
        ),
      ).toEqual(remembered),
    )
  })
})
