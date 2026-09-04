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
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
  WorkspaceFile,
  WorkspaceListing,
} from '../shared/contracts'
import App, { orderTasksForReading } from './App'
import {
  activateSession,
  cancelBackgroundTask,
  cancelSession,
  clearConversation,
  createSession,
  configureRuntime,
  deleteSession,
  executeCommand,
  getPushSettings,
  getProviderRuntimeOptions,
  getSession,
  getRuntimeOptions,
  listBackgroundTasks,
  listCommands,
  listComputers,
  listDirectories,
  listHistory,
  listKnowledgeRoots,
  listKnowledgeEntries,
  readKnowledgeFile,
  addKnowledgeRoot,
  listSessions,
  listSessionListing,
  listWorkspace,
  validateSessionDirectory,
  moveSessionToTmux,
  removeQueuedPrompt,
  renameSession,
  readWorkspaceFile,
  restartSession,
  resumeSession,
  suspendSession,
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
  listSessionListing: vi.fn(),
  listBackgroundTasks: vi.fn(),
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
  getProviderRuntimeOptions: vi.fn(),
  clearConversation: vi.fn(),
  restartSession: vi.fn(),
  resumeSession: vi.fn(),
  suspendSession: vi.fn(),
  activateSession: vi.fn(),
  sendMessage: vi.fn(),
  executeCommand: vi.fn(),
  getPushSettings: vi.fn(),
  cancelSession: vi.fn(),
  cancelBackgroundTask: vi.fn(),
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

const taskComputer: ComputerSummary = {
  ...computer,
  providers: computer.providers?.map((provider) => ({
    ...provider,
    supportsBackgroundTasks: provider.id === 'copilot',
  })),
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
    // The snapshot asks for the list and for which computers answered for
    // their own sessions. Every test that sets up a list means it to be an
    // answer from everything it names.
    vi.mocked(listSessionListing).mockImplementation(async () => {
      const sessions = await vi.mocked(listSessions)()
      return {
        sessions,
        answeredComputerIds: [
          ...new Set(sessions.map((entry) => entry.computerId)),
        ],
      }
    })
    vi.mocked(listBackgroundTasks).mockResolvedValue({
      tasks: [],
      runningCount: 0,
      supported: true,
    })
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
    vi.mocked(getProviderRuntimeOptions).mockImplementation(
      async (_computerId, provider) => ({
        models:
          provider === 'copilot'
            ? [
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
                {
                  id: 'gpt-fast',
                  name: 'GPT Fast',
                  reasoningEfforts: ['low', 'medium'],
                  contextTiers: ['default'],
                },
              ]
            : [
                {
                  id: 'sonnet',
                  name: 'Sonnet',
                  description: '**Efficient** for routine tasks',
                  reasoningEfforts: ['low', 'medium', 'high'],
                  contextTiers: ['default'],
                },
              ],
      }),
    )
    vi.mocked(configureRuntime).mockResolvedValue(session)
    vi.mocked(clearConversation).mockResolvedValue({
      ...session,
      id: 'cleared-session',
      messages: [],
    })
    vi.mocked(restartSession).mockResolvedValue(session)
    vi.mocked(suspendSession).mockResolvedValue({ ...session, suspended: true })
    vi.mocked(resumeSession).mockResolvedValue({ ...session, suspended: false })
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

  it('makes a diagram the block, not something inside a code block', async () => {
    // Overriding only `code` leaves React Markdown's own `<pre>` wrapped round
    // the result, which boxes the diagram in a code block and gives the source
    // fallback a second one.
    const diagramSession = {
      ...session,
      messages: [
        {
          id: 'diagram-1',
          role: 'assistant' as const,
          content: '```mermaid\ngraph TD; A--\n```\n\n```js\nconst a = 1\n```',
          createdAt: '2026-07-22T00:00:02.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([diagramSession])
    vi.mocked(getSession).mockResolvedValue(diagramSession)
    render(<App />)
    await screen.findAllByText('Project chat')

    // The diagram falls back to its source here, and that source is the block
    // itself rather than a `<pre>` inside another one.
    const fallback = await waitFor(() => {
      const found = document.querySelector('.mermaid-source')
      expect(found).not.toBeNull()
      return found as HTMLElement
    })
    expect(fallback.parentElement?.closest('pre')).toBeNull()

    // An ordinary fenced block still gets its code block.
    const js = screen.getByText('const a = 1')
    expect(js.closest('pre')).not.toBeNull()
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

  it('renders transcript headings, statuses, results, and optional durations', async () => {
    const activitySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'tool:skill-call',
          role: 'activity',
          content: 'Skill (tool-model-catalog)',
          createdAt: '2026-07-22T00:00:00.000Z',
          activityStatus: 'completed',
          activityKind: 'skill',
        },
        {
          id: 'mcp-call',
          role: 'activity',
          content: 'MCP · ecs-mcp-server · search_config',
          createdAt: '2026-07-22T00:00:00.500Z',
          activityStatus: 'completed',
          activityResult: '48 lines read',
          activityDurationMs: 1_250,
          activityGroupId: 'tool:skill-call',
        },
        {
          id: 'failed-call',
          role: 'activity',
          content: 'Read\nmissing.md',
          createdAt: '2026-07-22T00:00:01.000Z',
          activityStatus: 'failed',
          activityResult: 'Error: file not found',
        },
        {
          id: 'pending-call',
          role: 'activity',
          content: 'Search\ncache',
          createdAt: '2026-07-22T00:00:01.500Z',
          activityStatus: 'pending',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([activitySession])
    vi.mocked(getSession).mockResolvedValue(activitySession)

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(screen.getByText('skill(tool-model-catalog)')).toBeInTheDocument()
    expect(screen.getByText('search_config')).toBeInTheDocument()
    expect(screen.getByText('(MCP: ecs-mcp-server)')).toBeInTheDocument()
    expect(screen.getByText('48 lines read')).toBeInTheDocument()
    expect(screen.getByText('1.3s')).toBeInTheDocument()
    expect(screen.getByText('Error: file not found')).toBeInTheDocument()
    expect(screen.getByText('cache')).toBeInTheDocument()
    expect(document.querySelectorAll('.activity-message')).toHaveLength(4)
    expect(document.querySelector('.activity-group__children')).toHaveTextContent(
      'search_config',
    )
    expect(
      document.querySelector('.activity-message--pending'),
    ).toHaveTextContent('—')
    expect(
      document.querySelectorAll('.activity-message__glyph'),
    ).toHaveLength(4)
  })

  it('renders nested activity groups recursively', async () => {
    const activitySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'tool:agent-call',
          role: 'activity',
          content: 'Agent (reviewer)',
          createdAt: '2026-07-22T00:00:00.000Z',
          activityStatus: 'running',
          activityKind: 'agent',
        },
        {
          id: 'tool:nested-skill-call',
          role: 'activity',
          content: 'Skill (agentic-remote-navigation)',
          createdAt: '2026-07-22T00:00:00.500Z',
          activityStatus: 'completed',
          activityKind: 'skill',
          activityGroupId: 'tool:agent-call',
        },
        {
          id: 'tool:nested-child-call',
          role: 'activity',
          content: 'View\n docs/app-spec.md',
          createdAt: '2026-07-22T00:00:01.000Z',
          activityStatus: 'completed',
          activityGroupId: 'tool:nested-skill-call',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([activitySession])
    vi.mocked(getSession).mockResolvedValue(activitySession)

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(document.querySelectorAll('.activity-group')).toHaveLength(2)
    const nestedGroup = [...document.querySelectorAll('.activity-group')].find(
      (group) => group.textContent?.includes('skill(agentic-remote-navigation)'),
    )
    expect(nestedGroup?.querySelector('.activity-group__children')).toHaveTextContent(
      'View',
    )
  })

  it('keeps a parent group together across a nested child', async () => {
    const activitySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'tool:agent-call',
          role: 'activity',
          content: 'Agent (reviewer)',
          createdAt: '2026-07-22T00:00:00.000Z',
          activityStatus: 'running',
          activityKind: 'agent',
        },
        {
          id: 'tool:nested-skill-call',
          role: 'activity',
          content: 'Skill (agentic-remote-navigation)',
          createdAt: '2026-07-22T00:00:00.500Z',
          activityStatus: 'completed',
          activityKind: 'skill',
          activityGroupId: 'tool:agent-call',
        },
        {
          id: 'tool:nested-child-call',
          role: 'activity',
          content: 'View\n docs/app-spec.md',
          createdAt: '2026-07-22T00:00:01.000Z',
          activityStatus: 'completed',
          activityGroupId: 'tool:nested-skill-call',
        },
        {
          id: 'tool:later-agent-call',
          role: 'activity',
          content: 'Search\n "cache" in *.md',
          createdAt: '2026-07-22T00:00:02.000Z',
          activityStatus: 'completed',
          activityGroupId: 'tool:agent-call',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([activitySession])
    vi.mocked(getSession).mockResolvedValue(activitySession)

    render(<App />)
    await screen.findAllByText('Project chat')

    // The agent's own later tool belongs to it, and a child owning activity of
    // its own in between must not turn that into a top-level row.
    const agentGroup = [...document.querySelectorAll('.activity-group')].find(
      (group) => group.textContent?.includes('agent(reviewer)'),
    )
    expect(
      agentGroup?.querySelector('.activity-group__children'),
    ).toHaveTextContent('Search')
  })

  it('keeps non-contiguous activity in chronological order', async () => {
    const activitySession: ManagedSession = {
      ...session,
      messages: [
        {
          id: 'skill-call',
          role: 'activity',
          content: 'Skill (tool-model-catalog)',
          createdAt: '2026-07-22T00:00:00.000Z',
          activityStatus: 'running',
          activityKind: 'skill',
        },
        {
          id: 'unrelated-call',
          role: 'activity',
          content: 'Read\nREADME.md',
          createdAt: '2026-07-22T00:00:00.500Z',
          activityStatus: 'completed',
        },
        {
          id: 'child-call',
          role: 'activity',
          content: 'MCP · GitHub · Search Repositories',
          createdAt: '2026-07-22T00:00:01.000Z',
          activityStatus: 'completed',
          activityGroupId: 'skill-call',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([activitySession])
    vi.mocked(getSession).mockResolvedValue(activitySession)

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(
      [...document.querySelectorAll('.activity-message__name')].map(
        (name) => name.textContent,
      ),
    ).toEqual(['skill(tool-model-catalog)', 'Read', 'Search Repositories'])
    expect(document.querySelectorAll('.activity-group')).toHaveLength(0)
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

  it('falls back to blank runtime defaults when stored settings are null', async () => {
    localStorage.setItem('agentic-remote:default-models', 'null')

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))

    expect(
      await screen.findByLabelText('GitHub Copilot default model'),
    ).toHaveValue('')
    expect(screen.getByLabelText('Claude Agent default model')).toHaveValue('')
  })

  it('persists SDK-backed provider runtime defaults and applies them to new sessions', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    await screen.findByLabelText('GitHub Copilot default model')
    expect(getProviderRuntimeOptions).toHaveBeenCalledWith(
      'computer-1',
      'copilot',
    )
    fireEvent.change(screen.getByLabelText('GitHub Copilot default model'), {
      target: { value: 'gpt-5.6-sol' },
    })
    fireEvent.change(screen.getByLabelText('Claude Agent default model'), {
      target: { value: 'sonnet' },
    })
    expect(screen.getByText('Efficient').tagName).toBe('STRONG')
    fireEvent.change(
      screen.getByLabelText('GitHub Copilot default reasoning effort'),
      {
        target: { value: 'xhigh' },
      },
    )
    fireEvent.change(screen.getByLabelText('GitHub Copilot default context size'), {
      target: { value: 'long_context' },
    })
    fireEvent.change(
      screen.getByLabelText('Claude Agent default reasoning effort'),
      { target: { value: 'low' } },
    )
    expect(
      JSON.parse(localStorage.getItem('agentic-remote:default-models') || '{}'),
    ).toEqual({
      copilot: {
        model: 'gpt-5.6-sol',
        reasoningEffort: 'xhigh',
        contextTier: 'long_context',
      },
      claude: {
        model: 'sonnet',
        reasoningEffort: 'low',
        contextTier: 'default',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    const createButton = screen.getByRole('button', { name: 'Create session' })
    await waitFor(() => expect(createButton).toBeEnabled())
    fireEvent.click(createButton)
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
        model: 'gpt-5.6-sol',
        reasoningEffort: 'xhigh',
        contextTier: 'long_context',
      }),
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Create session' }),
      ).toBeEnabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'claude',
        terminalBacked: false,
        allowAllPermissions: true,
        model: 'sonnet',
        reasoningEffort: 'low',
        contextTier: 'default',
      }),
    )
  })

  it('preserves provider-managed defaults when app settings are opened', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    const copilotModel = await screen.findByLabelText(
      'GitHub Copilot default model',
    )
    const claudeModel = screen.getByLabelText('Claude Agent default model')

    expect(copilotModel).toHaveValue('')
    expect(claudeModel).toHaveValue('')
    expect(screen.getAllByRole('option', { name: 'Provider default' })).toHaveLength(
      2,
    )
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:default-models') || '{}',
        ),
      ).toEqual({
        copilot: {
          model: '',
          reasoningEffort: '',
          contextTier: 'default',
        },
        claude: {
          model: '',
          reasoningEffort: '',
          contextTier: 'default',
        },
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    const createButton = screen.getByRole('button', { name: 'Create session' })
    await waitFor(() => expect(createButton).toBeEnabled())
    fireEvent.click(createButton)
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
      }),
    )
  })

  it('aggregates model catalogs without overwriting a node-specific default', async () => {
    localStorage.setItem(
      'agentic-remote:default-models',
      JSON.stringify({
        copilot: {
          model: 'node-model',
          reasoningEffort: 'high',
          contextTier: 'long_context',
        },
        claude: {
          model: '',
          reasoningEffort: '',
          contextTier: 'default',
        },
      }),
    )
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(getProviderRuntimeOptions).mockImplementation(
      async (computerId, provider) => ({
        models:
          provider === 'claude'
            ? [
                {
                  id: 'sonnet',
                  name: 'Sonnet',
                  reasoningEfforts: ['low', 'medium', 'high'],
                  contextTiers: ['default'],
                },
              ]
            : computerId === secondComputer.id
              ? [
                  {
                    id: 'node-model',
                    name: 'Node Model',
                    reasoningEfforts: ['high'],
                    contextTiers: ['default', 'long_context'],
                  },
                ]
              : [
                  {
                    id: 'hub-model',
                    name: 'Hub Model',
                    reasoningEfforts: ['medium'],
                    contextTiers: ['default'],
                  },
                ],
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))

    const model = await screen.findByLabelText(
      'GitHub Copilot default model',
    )
    await waitFor(() => expect(model).toHaveValue('node-model'))
    expect(screen.getByRole('option', { name: 'Hub Model' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Node Model' })).toBeInTheDocument()
    expect(getProviderRuntimeOptions).toHaveBeenCalledWith(
      secondComputer.id,
      'copilot',
    )
    expect(
      JSON.parse(localStorage.getItem('agentic-remote:default-models') || '{}'),
    ).toEqual({
      copilot: {
        model: 'node-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
      },
      claude: {
        model: '',
        reasoningEffort: '',
        contextTier: 'default',
      },
    })
  })

  it('keeps model catalogs incomplete while a paired computer is offline', async () => {
    localStorage.setItem(
      'agentic-remote:default-models',
      JSON.stringify({
        copilot: {
          model: 'node-model',
          reasoningEffort: 'high',
          contextTier: 'long_context',
        },
        claude: {
          model: 'node-claude-model',
          reasoningEffort: 'high',
          contextTier: 'default',
        },
      }),
    )
    vi.mocked(listComputers).mockResolvedValue([
      computer,
      { ...secondComputer, online: false },
    ])

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))

    const model = await screen.findByLabelText(
      'GitHub Copilot default model',
    )
    await waitFor(() => expect(model).toHaveValue('node-model'))
    expect(
      screen.getByRole('option', { name: 'node-model (unavailable)' }),
    ).toBeInTheDocument()
    const claudeModel = screen.getByLabelText('Claude Agent default model')
    expect(claudeModel).toHaveValue('node-claude-model')
    expect(
      screen.getByRole('option', {
        name: 'node-claude-model (unavailable)',
      }),
    ).toBeInTheDocument()
    expect(getProviderRuntimeOptions).not.toHaveBeenCalledWith(
      secondComputer.id,
      'copilot',
    )
    expect(
      JSON.parse(localStorage.getItem('agentic-remote:default-models') || '{}'),
    ).toEqual({
      copilot: {
        model: 'node-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
      },
      claude: {
        model: 'node-claude-model',
        reasoningEffort: 'high',
        contextTier: 'default',
      },
    })
  })

  it('keeps model catalogs incomplete while a computer has not reported its providers', async () => {
    localStorage.setItem(
      'agentic-remote:default-models',
      JSON.stringify({
        claude: {
          model: 'node-claude-model',
          reasoningEffort: 'high',
          contextTier: 'default',
        },
      }),
    )
    // Online, but its capabilities never arrived, so it is only assumed to
    // offer Copilot and is never asked about Claude.
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))

    const claudeModel = await screen.findByLabelText(
      'Claude Agent default model',
    )
    await waitFor(() => expect(claudeModel).toHaveValue('node-claude-model'))
    // Assuming the provider is absent must not be strong enough to retire the
    // saved model: the computer was simply never asked.
    expect(
      JSON.parse(localStorage.getItem('agentic-remote:default-models') || '{}')
        .claude,
    ).toEqual({
      model: 'node-claude-model',
      reasoningEffort: 'high',
      contextTier: 'default',
    })
  })

  it('uses a computer-specific fallback without replacing the saved default', async () => {
    localStorage.setItem(
      'agentic-remote:default-models',
      JSON.stringify({
        copilot: {
          model: 'removed-model',
          reasoningEffort: 'max',
          contextTier: 'long_context',
        },
        claude: {
          model: 'sonnet',
          reasoningEffort: 'max',
          contextTier: 'long_context',
        },
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

    const createButton = screen.getByRole('button', { name: 'Create session' })
    await waitFor(() => expect(createButton).toBeEnabled())
    fireEvent.click(createButton)
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
        model: 'gpt-5.6-sol',
        reasoningEffort: 'medium',
        contextTier: 'long_context',
      }),
    )
    expect(
      JSON.parse(localStorage.getItem('agentic-remote:default-models') || '{}'),
    ).toEqual({
      copilot: {
        model: 'removed-model',
        reasoningEffort: 'max',
        contextTier: 'long_context',
      },
      claude: {
        model: 'sonnet',
        reasoningEffort: 'max',
        contextTier: 'long_context',
      },
    })
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

  it('keeps a running activity visible past the window', async () => {
    // The activity indicator is suppressed while a tool is running, so a
    // running row that the window cuts off leaves nothing on screen saying
    // anything is happening at all.
    const messages = [
      {
        id: 'running-tool',
        role: 'activity' as const,
        content: 'Bash\n$ pnpm dev',
        createdAt: '2026-07-22T00:00:00.000Z',
        activityStatus: 'running' as const,
      },
      ...Array.from({ length: 400 }, (_, index) => ({
        id: `later-${index}`,
        role: 'assistant' as const,
        content: `later line ${index}`,
        createdAt: new Date(Date.UTC(2026, 6, 22, 1, 0, index)).toISOString(),
      })),
    ]
    const busy = { ...session, activity: 'Working', messages }
    vi.mocked(listSessions).mockResolvedValue([busy])
    vi.mocked(getSession).mockResolvedValue(busy)
    render(<App />)
    await screen.findAllByText('Project chat')

    // The oldest ordinary message is behind the window, as intended.
    expect(screen.queryByText('later line 0')).not.toBeInTheDocument()
    // The running tool is not.
    expect(await screen.findByText('$ pnpm dev')).toBeInTheDocument()
  })

  it('keeps an expanded transcript across a snapshot refresh', async () => {
    // A refresh installs session summaries first, and those carry no messages
    // on purpose, so the transcript is unmounted and mounted again around
    // every reconnect. Expansion has to outlive that or it closes under the
    // reader whenever the tab comes back.
    const long = {
      ...session,
      messages: Array.from({ length: 400 }, (_, index) => ({
        id: `line-${index}`,
        role: 'assistant' as const,
        content: `line ${index}`,
        createdAt: new Date(Date.UTC(2026, 6, 22, 0, 0, index)).toISOString(),
      })),
    }
    vi.mocked(listSessions).mockResolvedValue([long])
    vi.mocked(getSession).mockResolvedValue(long)
    render(<App />)

    fireEvent.click(
      await screen.findByRole('button', { name: /Show \d+ earlier messages/ }),
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /earlier messages/ }),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByText('line 0')).toBeInTheDocument()

    // The summary with no messages lands, then the detail comes back.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...long, messages: [] },
        }),
      } as MessageEvent)
    })
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: long }),
      } as MessageEvent)
    })

    expect(await screen.findByText('line 0')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /earlier messages/ }),
    ).not.toBeInTheDocument()
  })

  it('does not carry an expanded transcript into the next session', async () => {
    // The window is what bounds rendering cost. It belongs to the session being
    // read, so expanding one must not hand the next session an open transcript.
    const longMessages = (prefix: string) =>
      Array.from({ length: 400 }, (_, index) => ({
        id: `${prefix}-${index}`,
        role: 'assistant' as const,
        content: `${prefix} line ${index}`,
        createdAt: new Date(Date.UTC(2026, 6, 22, 0, 0, index)).toISOString(),
      }))
    const longFirst = { ...session, messages: longMessages('first') }
    const longSecond = { ...secondSession, messages: longMessages('second') }
    vi.mocked(listSessions).mockResolvedValue([longFirst, longSecond])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === longSecond.id ? longSecond : longFirst,
    )
    render(<App />)

    const expand = await screen.findByRole('button', {
      name: /Show \d+ earlier messages/,
    })
    fireEvent.click(expand)
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /earlier messages/ }),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByText('first line 0')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Second chat').closest('button')!)

    // Back to a bounded transcript: the oldest message is behind the control
    // again rather than already on screen.
    expect(
      await screen.findByRole('button', { name: /Show \d+ earlier messages/ }),
    ).toBeInTheDocument()
    expect(screen.queryByText('second line 0')).not.toBeInTheDocument()
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

  it('keeps a suspended conversation readable and closed to writing', async () => {
    // Suspending stops the process, not the conversation: the history and the
    // name stay, and the way back is the button rather than the composer.
    const resting = { ...session, suspended: true }
    vi.mocked(listSessions).mockResolvedValue([resting])
    vi.mocked(getSession).mockResolvedValue(resting)
    render(<App />)
    await screen.findAllByText('Project chat')

    // Still readable.
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
    // ...and visibly not running.
    expect(document.querySelector('.session-item')?.className).toContain(
      'session-item--suspended',
    )
    // Writing is what resuming is for.
    const composer = screen.getByLabelText('Message')
    expect(composer).toBeDisabled()
    expect(composer).toHaveAttribute('placeholder', 'Suspended · resume to send')
    // Offered beside the conversation in the list, so a session can be picked
    // up again without opening it first.
    expect(
      screen.getByRole('button', { name: 'Resume Project chat' }),
    ).toBeInTheDocument()
  })

  it('suspends a session from the list and offers to start it again', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'Suspend Project chat' }))

    await waitFor(() =>
      expect(suspendSession).toHaveBeenCalledWith('computer-1', 'session-1'),
    )
    // The session is kept, so the way back has to be offered where the way
    // out was.
    const resume = await screen.findByRole('button', {
      name: 'Resume Project chat',
    })
    fireEvent.click(resume)
    await waitFor(() =>
      expect(resumeSession).toHaveBeenCalledWith('computer-1', 'session-1'),
    )
  })

  it('offers to start a suspended session even though it is not idle', async () => {
    vi.mocked(listSessions).mockResolvedValue([
      { ...session, suspended: true, status: 'error' },
    ])
    vi.mocked(getSession).mockResolvedValue({
      ...session,
      suspended: true,
      status: 'error',
    })

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(
      await screen.findByRole('button', { name: 'Resume Project chat' }),
    ).toBeInTheDocument()
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
    await waitFor(() =>
      expect(
        within(screen.getByLabelText('Queued prompts')).queryByText(
          'First queued prompt',
        ),
      ).not.toBeInTheDocument(),
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

  it('keeps the newest message in view as the composer grows', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    const timeline = document.querySelector<HTMLElement>('.timeline')!
    Object.defineProperties(timeline, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 500, writable: true },
    })

    // Typing grows the composer, which takes height from the transcript. The
    // reader has not gone anywhere, so the end must stay where they left it.
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'A message\nlong enough\nto grow the box' },
    })

    await waitFor(() => expect(timeline.scrollTop).toBe(1_000))
  })

  it('offers a way back to the latest only once the reader has left it', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    expect(
      screen.queryByRole('button', { name: 'Scroll to latest' }),
    ).not.toBeInTheDocument()

    const timeline = document.querySelector<HTMLElement>('.timeline')!
    Object.defineProperties(timeline, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 100, writable: true },
    })
    fireEvent.scroll(timeline)

    const jump = await screen.findByRole('button', { name: 'Scroll to latest' })
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView)
    scrollIntoView.mockClear()
    fireEvent.click(jump)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' })

    // Following again is what puts the way back out of the way.
    timeline.scrollTop = 500
    fireEvent.scroll(timeline)
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Scroll to latest' }),
      ).not.toBeInTheDocument(),
    )
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

  it('retries a forced background-task refresh after an in-flight request settles', async () => {
    let resolveInitial!: (snapshot: BackgroundTaskSnapshot) => void
    const refreshedSnapshot: BackgroundTaskSnapshot = {
      tasks: [
        {
          id: 'task-1',
          type: 'agent',
          description: 'Review the implementation',
          status: 'running',
          startedAt: '2026-08-31T18:00:00.000Z',
          canCancel: true,
        },
      ],
      runningCount: 1,
      supported: true,
    }
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(listBackgroundTasks)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveInitial = resolve
        }),
      )
      .mockResolvedValueOnce(refreshedSnapshot)

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(listBackgroundTasks).toHaveBeenCalledTimes(1),
    )

    MockWebSocket.instances[0]?.onopen?.()
    await waitFor(() => expect(listSessions).toHaveBeenCalledTimes(2))
    expect(listBackgroundTasks).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveInitial({
        tasks: [],
        runningCount: 0,
        supported: true,
      })
    })
    await waitFor(() =>
      expect(listBackgroundTasks).toHaveBeenCalledTimes(2),
    )
    await waitFor(() =>
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        '1 background task running',
      ),
    )
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

  it('shows the agent update the CLI is offering and can hide it', async () => {
    const updateSession = {
      ...session,
      runtime: { mode: 'plan', updateAvailable: '1.0.83' },
    }
    vi.mocked(listSessions).mockResolvedValue([updateSession])
    vi.mocked(getSession).mockResolvedValue(updateSession)
    render(<App />)
    const textarea = await screen.findByLabelText('Message')

    expect(screen.getByTestId('web-statusline-update')).toHaveTextContent(
      'v1.0.83 available',
    )
    expect(screen.getByTestId('web-statusline-update')).toHaveTextContent(
      'run /update',
    )

    fireEvent.change(textarea, { target: { value: '/statusline' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(
      await screen.findByRole('dialog', { name: 'Status line' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Agent update available'))

    expect(
      screen.queryByTestId('web-statusline-update'),
    ).not.toBeInTheDocument()
  })

  it('hides the update segment when the CLI is not offering one', async () => {
    const currentSession = {
      ...session,
      runtime: { mode: 'plan' },
    }
    vi.mocked(listSessions).mockResolvedValue([currentSession])
    vi.mocked(getSession).mockResolvedValue(currentSession)
    render(<App />)
    await screen.findByLabelText('Message')

    expect(
      screen.queryByTestId('web-statusline-update'),
    ).not.toBeInTheDocument()
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

  it('opens background tasks by shortcut when the status line is off', async () => {
    // The status line is a display preference, so it cannot be the only way to
    // reach a panel that describes work still running.
    localStorage.setItem(
      'agentic-remote:statusline',
      JSON.stringify({ enabled: false, backgroundTasks: false }),
    )
    const runningSnapshot: BackgroundTaskSnapshot = {
      tasks: [
        {
          id: 'task-1',
          type: 'agent' as const,
          description: 'Review the implementation',
          status: 'running' as const,
          startedAt: '2026-08-31T18:00:00.000Z',
          agentType: 'code-review',
          prompt: 'Review the implementation',
          canCancel: true,
        },
      ],
      runningCount: 1,
      supported: true,
    }
    vi.mocked(listBackgroundTasks).mockResolvedValue(runningSnapshot)
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(getSession).mockResolvedValue({ ...session, executionMode: 'sdk' })
    render(<App />)
    await screen.findAllByText('Project chat')

    expect(screen.queryByTestId('web-statusline')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'View background tasks' }),
    ).not.toBeInTheDocument()

    fireEvent.keyDown(window, { code: 'KeyT', altKey: true })

    expect(
      await screen.findByRole('dialog', {
        name: 'Background tasks · Project chat',
      }),
    ).toHaveTextContent('Review the implementation')
  })

  it('shows the running tasks first in the panel, then the newest finished', async () => {
    // The order the sorting produces has to be the order on screen: the panel
    // is opened to see what is running right now, so anything still going
    // belongs at the top where it is found at a glance.
    localStorage.setItem(
      'agentic-remote:statusline',
      JSON.stringify({ enabled: false, backgroundTasks: false }),
    )
    const mixed: BackgroundTaskSnapshot = {
      tasks: [
        {
          id: 'finished-first',
          type: 'shell' as const,
          description: 'Finished a while ago',
          status: 'completed' as const,
          startedAt: '2026-01-01T00:00:00.000Z',
          completedAt: '2026-01-01T00:01:00.000Z',
          canCancel: false,
        },
        {
          id: 'still-going',
          type: 'agent' as const,
          description: 'Still going',
          status: 'running' as const,
          startedAt: '2026-01-01T00:02:00.000Z',
          canCancel: true,
        },
        {
          id: 'finished-last',
          type: 'shell' as const,
          description: 'Finished just now',
          status: 'completed' as const,
          startedAt: '2026-01-01T00:03:00.000Z',
          completedAt: '2026-01-01T00:04:00.000Z',
          canCancel: false,
        },
      ],
      runningCount: 1,
      supported: true,
    }
    vi.mocked(listBackgroundTasks).mockResolvedValue(mixed)
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(getSession).mockResolvedValue({ ...session, executionMode: 'sdk' })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.keyDown(window, { code: 'KeyT', altKey: true })
    await screen.findByRole('dialog', {
      name: 'Background tasks · Project chat',
    })

    const list = screen.getByLabelText('Background task list')
    const order = Array.from(
      list.querySelectorAll('.background-task'),
    ).map((card) => card.textContent || '')

    expect(order[0]).toContain('Still going')
    expect(order[1]).toContain('Finished just now')
    expect(order[2]).toContain('Finished a while ago')
  })

  it('opens background tasks by touch from the sidebar count', async () => {
    // The status line is a display preference, so it cannot be the only way to
    // reach a panel that describes work still running.
    localStorage.setItem(
      'agentic-remote:statusline',
      JSON.stringify({ enabled: false, backgroundTasks: false }),
    )
    const runningSnapshot: BackgroundTaskSnapshot = {
      tasks: [
        {
          id: 'task-1',
          type: 'agent' as const,
          description: 'Review the implementation',
          status: 'running' as const,
          startedAt: '2026-08-31T18:00:00.000Z',
          agentType: 'code-review',
          prompt: 'Review the implementation',
          canCancel: true,
        },
      ],
      runningCount: 1,
      supported: true,
    }
    vi.mocked(listBackgroundTasks).mockResolvedValue(runningSnapshot)
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(getSession).mockResolvedValue({ ...session, executionMode: 'sdk' })
    render(<App />)
    await screen.findAllByText('Project chat')

    // A keyboard shortcut cannot be reached by touch, so the count already in
    // the sidebar has to be a way in that no display preference can remove.
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'View background tasks for Project chat',
      }),
    )

    expect(
      await screen.findByRole('dialog', {
        name: 'Background tasks \u00b7 Project chat',
      }),
    ).toHaveTextContent('Review the implementation')
  })

  it('shows running background tasks, blue session styling, and cancellation', async () => {
    const runningTask = {
      id: 'task-1',
      type: 'agent' as const,
      description: 'Review the implementation',
      status: 'running' as const,
      startedAt: '2026-08-31T18:00:00.000Z',
      agentType: 'code-review',
      prompt: 'Review the implementation',
      canCancel: true,
      progress: {
        type: 'agent' as const,
        latestIntent: 'Inspecting changed files',
        recentActivity: [
          {
            message: '▸ bash',
            timestamp: '2026-08-31T18:01:00.000Z',
          },
        ],
      },
    }
    const runningSnapshot: BackgroundTaskSnapshot = {
      tasks: [runningTask],
      runningCount: 1,
      supported: true,
    }
    const cancelledSnapshot: BackgroundTaskSnapshot = {
      tasks: [{ ...runningTask, status: 'cancelled', canCancel: false }],
      runningCount: 0,
      supported: true,
    }
    vi.mocked(listBackgroundTasks).mockResolvedValue(runningSnapshot)
    vi.mocked(cancelBackgroundTask).mockResolvedValue(cancelledSnapshot)
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(getSession).mockResolvedValue({
      ...session,
      executionMode: 'sdk',
    })
    render(<App />)

    await waitFor(() =>
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        '1 background task running',
      ),
    )
    expect(document.querySelector('.session-item')).toHaveClass(
      'session-item--background-running',
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'View background tasks' }),
    )
    expect(
      await screen.findByRole('dialog', {
        name: 'Background tasks · Project chat',
      }),
    ).toHaveTextContent('Review the implementation')
    expect(screen.getByText('Inspecting changed files')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel task' }))
    await waitFor(() =>
      expect(cancelBackgroundTask).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'task-1',
      ),
    )
    await waitFor(() =>
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        '0 background tasks running',
      ),
    )
    expect(document.querySelector('.session-item')).not.toHaveClass(
      'session-item--background-running',
    )
  })

  it('updates failed background task details from a live event', async () => {
    const failedTask = {
      id: 'task-failed',
      type: 'shell' as const,
      description: 'Run checks',
      status: 'failed' as const,
      startedAt: '2026-08-31T18:00:00.000Z',
      completedAt: '2026-08-31T18:02:00.000Z',
      command: 'pnpm check',
      canCancel: false,
      error: 'The command exited with status 1',
      progress: {
        type: 'shell' as const,
        recentOutput: 'FAIL tests',
      },
    }
    vi.mocked(listBackgroundTasks).mockResolvedValue({
      tasks: [failedTask],
      runningCount: 0,
      supported: true,
    })
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(getSession).mockResolvedValue({
      ...session,
      executionMode: 'sdk',
    })
    render(<App />)

    await waitFor(() =>
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        '0 background tasks running',
      ),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'View background tasks' }),
    )
    expect(await screen.findByText('The command exited with status 1')).toBeInTheDocument()

    const nextTask = {
      ...failedTask,
      status: 'running' as const,
      completedAt: undefined,
      canCancel: true,
      error: undefined,
    }
    MockWebSocket.instances[0]?.onmessage?.({
      data: JSON.stringify({
        type: 'session.tasks.updated',
        computerId: 'computer-1',
        sessionId: 'session-1',
        tasks: [nextTask],
        runningCount: 1,
        supported: true,
      }),
    } as MessageEvent)
    await waitFor(() =>
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        '1 background task running',
      ),
    )
    expect(document.querySelector('.session-item')).toHaveClass(
      'session-item--background-running',
    )
  })

  it('keeps idle controls available while a background task runs', async () => {
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(listBackgroundTasks).mockResolvedValue({
      tasks: [
        {
          id: 'task-idle',
          type: 'agent',
          description: 'Inspect the repository',
          status: 'running',
          startedAt: '2026-08-31T18:00:00.000Z',
          executionMode: 'background',
          canCancel: false,
        },
      ],
      runningCount: 1,
      supported: true,
    })

    render(<App />)

    await waitFor(() =>
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        '1 background task running',
      ),
    )
    expect(
      screen.queryByRole('button', { name: 'Stop response' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Queue message' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Send message' }),
    ).toBeInTheDocument()
  })

  it('keeps waiting and error status dots above blue task styling', async () => {
    const waitingSession = {
      ...session,
      status: 'waiting' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([waitingSession])
    vi.mocked(getSession).mockResolvedValue(waitingSession)
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(listBackgroundTasks).mockResolvedValue({
      tasks: [
        {
          id: 'task-waiting',
          type: 'shell',
          description: 'Run checks',
          status: 'running',
          startedAt: '2026-08-31T18:00:00.000Z',
          command: 'pnpm check',
          canCancel: false,
          executionMode: 'background',
          attachmentMode: 'detached',
        },
      ],
      runningCount: 1,
      supported: true,
    })

    render(<App />)
    await waitFor(() => {
      const item = document.querySelector('.session-item')
      expect(item).not.toHaveClass('session-item--background-running')
      expect(item?.querySelector('.status-dot')).toHaveClass(
        'status-dot--waiting',
      )
    })

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...waitingSession, status: 'error' },
        }),
      } as MessageEvent)
    })

    await waitFor(() => {
      const item = document.querySelector('.session-item')
      expect(item).not.toHaveClass('session-item--background-running')
      expect(item?.querySelector('.status-dot')).toHaveClass('status-dot--error')
    })
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
  it('moves the session to a folder browsed in Knowledge', async () => {
    vi.mocked(executeCommand).mockImplementation(
      async (_computerId, _sessionId, input) => ({
        ...session,
        cwd: input.command.slice('/cwd '.length),
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
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_root, path) =>
      path === 'guides'
        ? { path: 'guides', parent: '.', entries: [] }
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
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    )
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenLastCalledWith('root-1', 'guides'),
    )

    // Browsing to a folder is how the session is moved there: the reader picks
    // it in the tree rather than opening a separate browser for it.
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Move session to this folder',
      }),
    )
    await waitFor(() =>
      expect(executeCommand).toHaveBeenCalledWith(computer.id, session.id, {
        command: '/cwd /home/tester/docs/guides',
      }),
    )
    // A knowledge root may sit outside the roots a session is allowed to run
    // in, so the target is checked on the owning computer before `/cwd`.
    expect(validateSessionDirectory).toHaveBeenCalledWith(
      computer.id,
      '/home/tester/docs/guides',
    )
  })

  it('offers the move to a session the workspace browser would also move', async () => {
    // The workspace browser moves an SDK session too, so browsing Knowledge
    // must not withhold what the other route already allows.
    const sdkSession = { ...session, executionMode: 'sdk' as const }
    vi.mocked(listSessions).mockResolvedValue([sdkSession])
    vi.mocked(getSession).mockResolvedValue(sdkSession)
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
        ? { path: 'guides', parent: '.', entries: [] }
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
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    )
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenLastCalledWith('root-1', 'guides'),
    )

    expect(
      await screen.findByRole('button', {
        name: 'Move session to this folder',
      }),
    ).not.toBeDisabled()
  })

  it('withholds the move while the agent is still working', async () => {
    // `/cwd` is sent rather than queued, so moving a live pane would type
    // over the turn that is running in it.
    const busySession = { ...session, status: 'running' as const }
    vi.mocked(listSessions).mockResolvedValue([busySession])
    vi.mocked(getSession).mockResolvedValue(busySession)
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
        ? { path: 'guides', parent: '.', entries: [] }
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
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    )
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenLastCalledWith('root-1', 'guides'),
    )

    expect(
      await screen.findByRole('button', {
        name: 'Move session to this folder',
      }),
    ).toBeDisabled()
  })

  it('does not offer the move to a provider that refuses commands', async () => {
    // Claude refuses every slash command, so the move could only ever fail.
    const claudeSession = { ...session, provider: 'claude' as const }
    vi.mocked(listSessions).mockResolvedValue([claudeSession])
    vi.mocked(getSession).mockResolvedValue(claudeSession)
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
        ? { path: 'guides', parent: '.', entries: [] }
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
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    )
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenLastCalledWith('root-1', 'guides'),
    )

    expect(
      screen.queryByRole('button', { name: 'Move session to this folder' }),
    ).not.toBeInTheDocument()
  })

  it('does not move the session to a folder the server rejects', async () => {
    vi.mocked(validateSessionDirectory).mockRejectedValue(
      new Error('Sessions are restricted to the user home directory'),
    )
    vi.mocked(listKnowledgeRoots).mockResolvedValue([
      {
        id: 'root-1',
        computerId: computer.id,
        computerName: computer.name,
        path: '/srv/shared',
        name: 'shared',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_root, path) =>
      path === 'guides'
        ? { path: 'guides', parent: '.', entries: [] }
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
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /guides/ }),
    )
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenLastCalledWith('root-1', 'guides'),
    )

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Move session to this folder',
      }),
    )
    await screen.findAllByText(
      'Sessions are restricted to the user home directory',
    )
    // The boundary is the point: a rejected folder never reaches the CLI.
    expect(executeCommand).not.toHaveBeenCalled()
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
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
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
    expect(
      await screen.findByRole('heading', { name: 'Setup guide' }),
    ).toBeInTheDocument()
    // Adopted by the session that was open, and gone from where an older
    // build kept it.
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-session-positions') ||
          '{}',
      ),
    ).toEqual({
      'computer-1:session-1': {
        rootId: 'root-1',
        path: 'guides',
        file: 'guides/setup.md',
      },
    })
    expect(localStorage.getItem('agentic-remote:knowledge-position')).toBeNull()
  })

  it('drops an app-wide position rather than filing it under a linked session', async () => {
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-2',
    )
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-position',
      JSON.stringify({
        rootId: 'root-1',
        path: 'guides',
        file: 'guides/setup.md',
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
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      }),
    )

    render(<App />)
    await screen.findAllByText('Second chat')
    await waitFor(() => expect(listKnowledgeEntries).toHaveBeenCalled())

    // The link says which session to open, not where that session was
    // reading, so the position an older build kept is discarded.
    await waitFor(() =>
      expect(
        localStorage.getItem('agentic-remote:knowledge-position'),
      ).toBeNull(),
    )
    expect(readKnowledgeFile).not.toHaveBeenCalled()
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-session-positions') ||
          '{}',
      )['computer-1:session-2'],
    ).toBeUndefined()
    window.history.replaceState({}, '', '/')
  })

  it('keeps a muted session muted when an update lands during a settings read', async () => {
    let answerSettings: (() => void) | undefined
    vi.mocked(getPushSettings).mockImplementation(
      () =>
        new Promise<{ mutedSessions: string[] }>((resolve) => {
          answerSettings = () =>
            resolve({ mutedSessions: ['computer-1:session-1'] })
        }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(answerSettings).toBeDefined())

    // An ordinary update says nothing about notifications, so it must not
    // make the answer look stale for the session it mentions.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, activity: 'Thinking' },
        }),
      } as MessageEvent)
    })
    await act(async () => {
      answerSettings?.()
    })

    expect(
      await screen.findByRole('button', {
        name: 'Unmute session notifications',
      }),
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
      screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!,
    )
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Second chat/ })
          .find((item) => item.classList.contains('session-item__open')),
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

  it('starts up when the stored shortcuts are nonsense', async () => {
    // Storage is not a trusted source: another tab, an older version, or a
    // hand edit can leave anything here. `null` in particular is an object to
    // `typeof`, and reading its entries threw before anything had rendered --
    // a blank screen with no way back except clearing site data.
    localStorage.setItem('agentic-remote:shortcuts', 'null')
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByLabelText('App settings'))
    expect(
      await screen.findByLabelText('Change the keys for Open or close knowledge'),
    ).toHaveTextContent('Alt + K')
  })

  it('drops stored shortcut keys that the editor would have refused', async () => {
    // A binding held with nothing would fire while typing, and two rows on the
    // same keys leave the second unreachable. Neither can be made in the
    // editor, so neither may arrive by reloading either.
    localStorage.setItem(
      'agentic-remote:shortcuts',
      JSON.stringify({
        toggleKnowledge: { code: 'KeyG', alt: false, shift: false, ctrl: false, meta: false },
        backgroundTasks: { code: 'ArrowDown', alt: true, shift: false, ctrl: false, meta: false },
        nonsense: { code: 'KeyZ', alt: true },
      }),
    )
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))

    // Held with nothing: refused, so the default stands.
    expect(
      await screen.findByLabelText('Change the keys for Open or close knowledge'),
    ).toHaveTextContent('Alt + K')
    // Already what "Next session" answers to: refused for the same reason.
    expect(
      screen.getByLabelText('Change the keys for View background tasks'),
    ).toHaveTextContent('Alt + T')
    expect(
      screen.getByLabelText('Change the keys for Next session'),
    ).toHaveTextContent('Alt + \u2193')
  })

  it('refuses a key at capture that a reload would throw away', async () => {
    // The editor and the stored form have to agree. Accepting a key here that
    // reloading discards gave a shortcut that worked until the page was opened
    // again, and then quietly was not there.
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))
    fireEvent.click(
      await screen.findByLabelText('Change the keys for View background tasks'),
    )
    fireEvent.keyDown(
      screen.getByLabelText('Press the new keys for View background tasks'),
      { key: 'Enter', code: 'NumpadEnter', altKey: true },
    )

    await screen.findByText(/cannot be used for a shortcut/i)
    // Still listening, so another key can be tried; nothing was changed.
    fireEvent.keyDown(
      screen.getByLabelText('Press the new keys for View background tasks'),
      { key: 'Escape', code: 'Escape' },
    )
    await waitFor(() =>
      expect(
        screen.getByLabelText('Change the keys for View background tasks'),
      ).toHaveTextContent('Alt + T'),
    )
  })

  it('drops a stored shortcut whose key is not a real one', async () => {
    // Any nonempty string was accepted, so a code no keyboard produces came
    // back as a shortcut that showed in the list and could never be pressed.
    localStorage.setItem(
      'agentic-remote:shortcuts',
      JSON.stringify({
        toggleKnowledge: {
          code: 'NotARealKey',
          alt: true,
          shift: false,
          ctrl: false,
          meta: false,
        },
      }),
    )
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))

    expect(
      await screen.findByLabelText('Change the keys for Open or close knowledge'),
    ).toHaveTextContent('Alt + K')
  })

  it('drops stored shortcut keys that could never be pressed', async () => {
    // Escape leaves the editor and Tab moves on, so neither can be recorded
    // however they are held -- stored, they showed in the list as shortcuts
    // that did nothing. A modifier that is a string rather than a boolean is
    // not a choice anybody made either.
    localStorage.setItem(
      'agentic-remote:shortcuts',
      JSON.stringify({
        toggleKnowledge: { code: 'Escape', ctrl: true, alt: false, shift: false, meta: false },
        backgroundTasks: { code: 'KeyM', alt: 'yes', shift: false, ctrl: false, meta: false },
      }),
    )
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))

    expect(
      await screen.findByLabelText('Change the keys for Open or close knowledge'),
    ).toHaveTextContent('Alt + K')
    expect(
      screen.getByLabelText('Change the keys for View background tasks'),
    ).toHaveTextContent('Alt + T')
  })

  it('drops a stored override that collides with a default it fell back to', async () => {
    // The override that survives and the default that another row falls back
    // to have to be checked against each other, not only the overrides among
    // themselves. Otherwise the same fault reappears one step along.
    localStorage.setItem(
      'agentic-remote:shortcuts',
      JSON.stringify({
        // Takes the keys "View background tasks" answers to by default...
        nextSession: { code: 'KeyT', alt: true, shift: false, ctrl: false, meta: false },
        // ...while this one is discarded for duplicating another override, so
        // it falls back to exactly those keys.
        backgroundTasks: { code: 'KeyT', alt: true, shift: false, ctrl: false, meta: false },
      }),
    )
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))

    // Both back to their defaults, so each can still be pressed.
    expect(
      await screen.findByLabelText('Change the keys for Next session'),
    ).toHaveTextContent('Alt + \u2193')
    expect(
      screen.getByLabelText('Change the keys for View background tasks'),
    ).toHaveTextContent('Alt + T')
  })

  it('will not reset a shortcut onto keys another row has taken', async () => {
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))

    // Move background tasks off Alt+T...
    fireEvent.click(
      await screen.findByLabelText('Change the keys for View background tasks'),
    )
    fireEvent.keyDown(
      screen.getByLabelText('Press the new keys for View background tasks'),
      { key: 'y', code: 'KeyY', altKey: true },
    )
    // ...then give Alt+T to another row.
    await waitFor(() =>
      expect(
        screen.getByLabelText('Change the keys for Next session'),
      ).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByLabelText('Change the keys for Next session'))
    fireEvent.keyDown(
      screen.getByLabelText('Press the new keys for Next session'),
      { key: 't', code: 'KeyT', altKey: true },
    )
    await waitFor(() =>
      expect(
        screen.getByLabelText('Change the keys for Next session'),
      ).toHaveTextContent('Alt + T'),
    )

    // Putting the first back would land on the keys the other now holds.
    fireEvent.click(
      screen.getByLabelText('Reset the keys for View background tasks'),
    )
    await screen.findByText(/now does "Next session"/i)
    expect(
      screen.getByLabelText('Change the keys for View background tasks'),
    ).toHaveTextContent('Alt + Y')
  })

  it('gives a shortcut different keys, and answers to them', async () => {
    // The list and the handler read the same rows, so a shortcut cannot be
    // shown as one thing and answer to another.
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))

    const change = await screen.findByLabelText(
      'Change the keys for Open or close knowledge',
    )
    expect(change).toHaveTextContent('Alt + K')
    fireEvent.click(change)
    fireEvent.keyDown(
      screen.getByLabelText('Press the new keys for Open or close knowledge'),
      { key: 'j', code: 'KeyJ', altKey: true },
    )
    await waitFor(() =>
      expect(
        screen.getByLabelText('Change the keys for Open or close knowledge'),
      ).toHaveTextContent('Alt + J'),
    )

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )

    // The keys it was given work...
    fireEvent.keyDown(window, { key: 'j', code: 'KeyJ', altKey: true })
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )
    // ...and the ones it used to have do not.
    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )
  })

  it('refuses shortcut keys that are already taken, or held with nothing', async () => {
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))

    const change = await screen.findByLabelText(
      'Change the keys for View background tasks',
    )
    fireEvent.click(change)
    const recording = screen.getByLabelText(
      'Press the new keys for View background tasks',
    )

    // A bare letter would fire the moment it was typed anywhere outside a
    // text box.
    fireEvent.keyDown(recording, { key: 't', code: 'KeyT' })
    await screen.findByText(/Hold Alt, Ctrl or Cmd as well/i)

    // And one already spoken for would leave two rows claiming the same keys.
    fireEvent.keyDown(recording, { key: 'k', code: 'KeyK', altKey: true })
    await screen.findByText(/already does "Open or close knowledge"/i)

    // Unchanged throughout.
    fireEvent.keyDown(recording, { key: 'Escape', code: 'Escape' })
    await waitFor(() =>
      expect(
        screen.getByLabelText('Change the keys for View background tasks'),
      ).toHaveTextContent('Alt + T'),
    )
  })

  it('remembers changed shortcut keys across a reload, and resets them', async () => {
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    const first = render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))
    fireEvent.click(
      await screen.findByLabelText('Change the keys for View background tasks'),
    )
    fireEvent.keyDown(
      screen.getByLabelText('Press the new keys for View background tasks'),
      { key: 'b', code: 'KeyB', altKey: true, shiftKey: true },
    )
    await waitFor(() =>
      expect(
        screen.getByLabelText('Change the keys for View background tasks'),
      ).toHaveTextContent('Alt + Shift + B'),
    )
    first.unmount()

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByLabelText('App settings'))
    const kept = await screen.findByLabelText(
      'Change the keys for View background tasks',
    )
    expect(kept).toHaveTextContent('Alt + Shift + B')

    // Put back, and the row stops offering to.
    fireEvent.click(
      screen.getByLabelText('Reset the keys for View background tasks'),
    )
    await waitFor(() =>
      expect(
        screen.getByLabelText('Change the keys for View background tasks'),
      ).toHaveTextContent('Alt + T'),
    )
    expect(
      screen.queryByLabelText('Reset the keys for View background tasks'),
    ).not.toBeInTheDocument()
  })

  it('closes the knowledge panel, then the drawer, on Escape', async () => {
    // One press puts away one thing, in the order they are stacked.
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    await waitFor(() =>
      expect(document.querySelector('.knowledge-panel')).toHaveAttribute(
        'hidden',
      ),
    )
  })

  it('closes the command menu on Escape, and nothing behind it', async () => {
    // The menu is what Escape is about while it is open. Left to the global
    // handler, the press went straight past it and closed a panel behind the
    // composer while the menu stayed exactly where it was.
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    vi.mocked(listCommands).mockResolvedValue([
      {
        name: 'clear',
        description: 'Clear the conversation',
        allowDuringAgentExecution: false,
      },
    ])

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )

    const composer = screen.getByLabelText('Message')
    fireEvent.change(composer, { target: { value: '/cle' } })
    await waitFor(() =>
      expect(document.querySelector('.command-menu')).not.toBeNull(),
    )

    fireEvent.keyDown(composer, { key: 'Escape', code: 'Escape' })
    await waitFor(() =>
      expect(document.querySelector('.command-menu')).toBeNull(),
    )
    // The panel behind it is untouched.
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )
  })

  it('closes the drawer before the panel it slid over', async () => {
    // The drawer only exists on a narrow screen, and there it covers
    // everything else. Closing what is behind it first put away something the
    // reader could not see, and left the thing they were looking at.
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])

    render(<App />)
    await screen.findAllByText('Project chat')

    const originalWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 700,
      writable: true,
    })
    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )
    fireEvent.click(screen.getByLabelText('Open sessions'))
    await waitFor(() =>
      expect(document.querySelector('.sidebar')).toHaveClass('sidebar--open'),
    )

    // The drawer goes first...
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    await waitFor(() =>
      expect(document.querySelector('.sidebar')).not.toHaveClass(
        'sidebar--open',
      ),
    )
    expect(document.querySelector('.knowledge-panel')).not.toHaveAttribute(
      'hidden',
    )

    // ...and the panel it was covering on the next press.
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    await waitFor(() =>
      expect(document.querySelector('.knowledge-panel')).toHaveAttribute(
        'hidden',
      ),
    )
    // Put back, or every test after this one runs at a phone's width.
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalWidth,
      writable: true,
    })
  })

  it('ignores the drawer flag once the sidebar is part of the layout again', async () => {
    // Widening past the breakpoint leaves the drawer flag set while the
    // sidebar is simply part of the page. Escape then spent the press on
    // something invisible and left what was in front of the reader open.
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    vi.mocked(listKnowledgeRoots).mockResolvedValue([])
    const setWidth = (width: number) => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: width,
        writable: true,
      })
    }
    const original = window.innerWidth
    setWidth(700)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    fireEvent.click(screen.getByLabelText('Open sessions'))
    await waitFor(() =>
      expect(document.querySelector('.sidebar')).toHaveClass('sidebar--open'),
    )

    // The window is widened; the sidebar is no longer an overlay.
    setWidth(1400)

    // The press closes what is actually in front, not the flag behind it.
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    await waitFor(() =>
      expect(document.querySelector('.knowledge-panel')).toHaveAttribute(
        'hidden',
      ),
    )
    setWidth(original)
  })

  it('closes an open dialog on Escape, from a field inside it', async () => {
    // The keys that drive the app are held back while a dialog is open, and
    // Escape has to be the exception -- it is exactly then that it is wanted,
    // and it has to work from the field the reader is typing in.
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)

    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: /new session/i })[0])
    const dialog = await screen.findByRole('dialog')
    const field = within(dialog).getAllByRole('combobox')[0]
    fireEvent.keyDown(field, { key: 'Escape', code: 'Escape' })

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
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
        .find((item) => item.classList.contains('session-item__open'))!
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
      screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!,
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
          .find((item) => item.classList.contains('session-item__open')),
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
      screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!,
    )
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Second chat/ })
          .find((item) => item.classList.contains('session-item__open')),
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
        .find((item) => item.classList.contains('session-item__open')),
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
          .find((item) => item.classList.contains('session-item__open')),
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

  it('leaves the previous folder when the next session sits at the root', async () => {
    localStorage.setItem(
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
        'computer-1:session-2': { rootId: 'root-1', path: '.' },
      }),
    )
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
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
        guides: {
          path: 'guides',
          parent: '.',
          entries: [
            { name: 'setup.md', path: 'guides/setup.md', kind: 'markdown' },
          ],
        },
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'guides', current: true }),
      ).toBeInTheDocument(),
    )

    // Both sessions share the active root, so nothing has to be reloaded, but
    // the second session was left at the root and must be taken back there.
    fireEvent.click(screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!)

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'docs', current: true }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('button', { name: 'guides', current: true }),
    ).not.toBeInTheDocument()
  })

  it('keeps the migrated mute when the first settings read answers late', async () => {
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      messages: [],
    }
    let answerSettings: (() => void) | undefined
    vi.mocked(getPushSettings).mockImplementation(
      () =>
        new Promise<{ mutedSessions: string[] }>((resolve) => {
          // The first read goes out before anything is muted, so its answer
          // describes a world without either the mute or the replacement.
          answerSettings = () => resolve({ mutedSessions: [] })
        }),
    )
    vi.mocked(clearConversation).mockResolvedValue(replacement)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(answerSettings).toBeDefined())

    fireEvent.click(
      screen.getByRole('button', { name: 'Mute session notifications' }),
    )
    await screen.findByRole('button', {
      name: 'Unmute session notifications',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
          replacedBy: replacement.id,
        }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: replacement }),
      } as MessageEvent)
    })
    await act(async () => {
      answerSettings?.()
    })

    expect(
      await screen.findByRole('button', {
        name: 'Unmute session notifications',
      }),
    ).toBeInTheDocument()
    confirmSpy.mockRestore()
  })

  it('gives back a prompt that failed while another send was in flight', async () => {
    // The composer is busy, so the failure is held back rather than shown. The
    // send it was waiting on then answers with a record older than the failure
    // and is rejected -- and dropping the held text on the strength of that
    // answer left it invisible for good, with the marker on the server still
    // holding the queue.
    let answerSend: ((value: ManagedSession) => void) | undefined
    vi.mocked(sendMessage).mockImplementation(
      () =>
        new Promise((resolve) => {
          answerSend = resolve
        }),
    )

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'first thing' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(answerSend).toBeDefined())

    const failed: ManagedSession = {
      ...session,
      revision: (session.revision || 0) + 5,
      failedPrompt: {
        content: 'the queued one that failed',
        failedAt: '2026-09-03T00:00:00.000Z',
      },
    }
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: failed }),
      } as MessageEvent)
    })

    // Older than the failure, so the session rejects it.
    await act(async () => {
      answerSend?.({ ...session, revision: session.revision || 0 })
    })

    await waitFor(() =>
      expect(textarea).toHaveValue('the queued one that failed'),
    )
  })

  it('does not hand back a failed prompt the send it answered has cleared', async () => {
    // The HTTP answer can arrive before the event that clears the marker, and
    // with the socket down it never arrives at all. Offering whatever the
    // session still shows put the prompt that was just sent straight back in
    // the composer, ready to be sent a second time.
    const failed: ManagedSession = {
      ...session,
      failedPrompt: {
        content: 'the one that failed',
        failedAt: '2026-09-03T00:00:00.000Z',
      },
    }
    vi.mocked(listSessions).mockResolvedValue([failed, secondSession])
    vi.mocked(getSession).mockResolvedValue(failed)
    // Answers with the session exactly as it was: the marker is still there.
    vi.mocked(sendMessage).mockResolvedValue(failed)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(textarea).toHaveValue('the one that failed'))

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => expect(sendMessage).toHaveBeenCalled())
    await waitFor(() => expect(textarea).toHaveValue(''))
  })

  it('takes back an untouched recovery once another client answers for it', async () => {
    // The marker is gone, so somebody has answered for the prompt. Leaving the
    // text this client was handed on screen reads as something still waiting
    // to be sent, and sending it delivers the prompt a second time.
    const failed: ManagedSession = {
      ...session,
      failedPrompt: {
        content: 'the one that failed',
        failedAt: '2026-09-03T00:00:00.000Z',
      },
    }
    vi.mocked(listSessions).mockResolvedValue([failed, secondSession])
    vi.mocked(getSession).mockResolvedValue(failed)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(textarea).toHaveValue('the one that failed'))

    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, revision: (session.revision || 0) + 3 },
        }),
      } as MessageEvent)
    })

    await waitFor(() => expect(textarea).toHaveValue(''))
  })

  it('waits for the promised replacement instead of opening another session', async () => {
    // The address names a session that is cleared while the first list request
    // is still in flight. The response cannot contain the replacement yet, so
    // searching it finds nothing; falling through opens an unrelated
    // conversation the reader never asked for.
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-1',
    )
    const other: ManagedSession = {
      ...session,
      id: 'session-unrelated',
      title: 'Unrelated chat',
      messages: [],
    }
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      title: 'Followed on',
      messages: [],
    }
    let deliver: (value: ManagedSession[]) => void = () => {}
    vi.mocked(listSessions).mockReturnValue(
      new Promise<ManagedSession[]>((resolve) => {
        deliver = resolve
      }),
    )
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === replacement.id ? replacement : other,
    )

    render(<App />)
    await waitFor(() => expect(MockWebSocket.instances[0]).toBeDefined())

    // The clear is announced before the list arrives.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
          replacedBy: replacement.id,
        }),
      } as MessageEvent)
    })
    await act(async () => {
      // Only the unrelated session: the replacement has not been delivered.
      deliver([other])
    })
    // Its arrival comes after the list has already settled.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: replacement }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(
        document.querySelector('.session-item--active')?.textContent,
      ).toContain('Followed on'),
    )
  })

  it('follows a clear when the reader goes back to the old session', async () => {
    // The clear happens while another session is open, so nothing moves the
    // selection at the time. Back then reaches an address naming a session
    // that no longer exists, and selecting that id opens nothing.
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      title: 'Followed on',
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === replacement.id
        ? replacement
        : sessionId === secondSession.id
          ? secondSession
          : session,
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(MockWebSocket.instances[0]).toBeDefined())

    // Read a different conversation, so the clear does not move the selection.
    fireEvent.click(screen.getByText('Second chat').closest('button')!)
    await waitFor(() =>
      expect(
        document.querySelector('.session-item--active')?.textContent,
      ).toContain('Second chat'),
    )

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1',
          replacedBy: replacement.id,
        }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: replacement }),
      } as MessageEvent)
    })
    await screen.findAllByText('Followed on')

    // An older history entry still names the session that was cleared.
    act(() => {
      window.history.replaceState(
        {},
        '',
        '/?computer=computer-1&session=session-1',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() =>
      expect(
        document.querySelector('.session-item--active')?.textContent,
      ).toContain('Followed on'),
    )
  })

  it('opens the linked session when the socket refresh gets there first', async () => {
    // The socket opens and starts a refresh of its own, which can overtake
    // the first list because that request waits on paired nodes. Whichever
    // arrives first has to be the one that answers the address.
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-wanted',
    )
    const other: ManagedSession = {
      ...session,
      id: 'session-first',
      title: 'Unrelated chat',
      messages: [],
    }
    const wanted: ManagedSession = {
      ...session,
      id: 'session-wanted',
      title: 'Linked chat',
      messages: [],
    }
    let deliverInitial: (value: ManagedSession[]) => void = () => {}
    let call = 0
    vi.mocked(listSessions).mockImplementation(() => {
      call += 1
      // The first list is held; the socket's refresh answers immediately.
      return call === 1
        ? new Promise<ManagedSession[]>((resolve) => {
            deliverInitial = resolve
          })
        : Promise.resolve([other, wanted])
    })
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === wanted.id ? wanted : other,
    )

    render(<App />)
    await waitFor(() => expect(MockWebSocket.instances[0]).toBeDefined())
    act(() => {
      MockWebSocket.instances[0]?.onopen?.()
    })

    await waitFor(() =>
      expect(
        document.querySelector('.session-item--active')?.textContent,
      ).toContain('Linked chat'),
    )
    await act(async () => {
      deliverInitial([other, wanted])
    })
    expect(
      document.querySelector('.session-item--active')?.textContent,
    ).toContain('Linked chat')
  })

  it('takes the newest ancestor when several held something', async () => {
    // Ancestors only fill what the replacement lacks, so the most recent has
    // to be offered first. Oldest-first, the earliest draft takes the place
    // the latest one should have had and the newer text is lost.
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({
        'computer-1:session-a': 'oldest thought',
        'computer-1:session-b': 'newest thought',
      }),
    )
    const replacement: ManagedSession = {
      ...session,
      id: 'session-c',
      replacedSessionIds: ['session-a', 'session-b'],
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)

    render(<App />)
    await screen.findAllByText('Project chat')

    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('newest thought'),
    )
  })

  it('does not overwrite newer state under the replacement', async () => {
    // This browser used the replacement before it learned what it replaced, so
    // it already has newer writing there. Claiming the ancestor must fill a
    // gap, not paint over it.
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({
        'computer-1:session-1': 'older thought',
        'computer-1:session-1-cleared': 'newer thought',
      }),
    )
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      replacedSessionIds: ['session-1'],
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)

    render(<App />)
    await screen.findAllByText('Project chat')

    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('newer thought'),
    )
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:composer-drafts') || '{}',
      ),
    ).toEqual({ 'computer-1:session-1-cleared': 'newer thought' })
  })

  it('keeps a computer\'s sessions when only its status changed', async () => {
    // A paired node going offline is an ordinary update. Treating it as
    // reason to reject the snapshot discards every session it owns.
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)
    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() => expect(MockWebSocket.instances[0]).toBeDefined())

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'computer.updated',
          computer: { ...computer, online: false },
        }),
      } as MessageEvent)
    })

    expect((await screen.findAllByText('Project chat')).length).toBeGreaterThan(
      0,
    )
  })

  it('claims state from a clear that happened while it was away', async () => {
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({ 'computer-1:session-1': 'Half-written thought' }),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-session-positions',
      JSON.stringify({
        'computer-1:session-1': { rootId: 'root-1', path: 'guides' },
      }),
    )
    // Another client cleared the session while this one was asleep, so the
    // removal was announced to nobody here: only the replacement is left, and
    // it is the one thing that says what it replaced.
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-cleared',
      replacedSessionIds: ['session-1'],
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)

    render(<App />)
    await screen.findAllByText('Project chat')

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        ),
      ).toEqual({ 'computer-1:session-1-cleared': 'Half-written thought' }),
    )
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-session-positions') ||
          '{}',
      ),
    ).toEqual({
      'computer-1:session-1-cleared': { rootId: 'root-1', path: 'guides' },
    })
    expect(screen.getByLabelText('Message')).toHaveValue('Half-written thought')
  })

  it('claims ancestry from a replacement that arrives after the list', async () => {
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({ 'computer-1:session-1': 'Half-written thought' }),
    )
    const stale: ManagedSession = {
      ...session,
      id: 'session-1-b',
      title: 'Cleared away',
      replacedSessionIds: ['session-1'],
      messages: [],
    }
    const current: ManagedSession = {
      ...session,
      id: 'session-1-c',
      title: 'Carried on',
      replacedSessionIds: ['session-1', 'session-1-b'],
      messages: [],
    }
    let answerSessions: (() => void) | undefined
    vi.mocked(listSessions).mockImplementation(
      () =>
        new Promise<ManagedSession[]>((resolve) => {
          answerSessions = () => resolve([stale])
        }),
    )
    vi.mocked(getSession).mockResolvedValue(current)

    render(<App />)
    await waitFor(() => expect(answerSessions).toBeDefined())

    // The list is answered with the session that was already replaced, and
    // rejected for it. The replacement arrives afterwards, and it is the only
    // thing that still knows what the draft was left under.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1-b',
        }),
      } as MessageEvent)
    })
    await act(async () => {
      answerSessions?.()
    })
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: current }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        ),
      ).toEqual({ 'computer-1:session-1-c': 'Half-written thought' }),
    )
  })

  it('does not bring back a session removed while the list was loading', async () => {
    const stale: ManagedSession = {
      ...session,
      id: 'session-1-b',
      title: 'Cleared away',
      replacedSessionIds: ['session-1'],
      messages: [],
    }
    const current: ManagedSession = {
      ...session,
      id: 'session-1-c',
      title: 'Carried on',
      replacedSessionIds: ['session-1', 'session-1-b'],
      messages: [],
    }
    let answerSessions: (() => void) | undefined
    vi.mocked(listSessions).mockImplementation(
      () =>
        new Promise<ManagedSession[]>((resolve) => {
          answerSessions = () => resolve([stale])
        }),
    )
    vi.mocked(getSession).mockResolvedValue(current)

    render(<App />)
    await waitFor(() => expect(answerSessions).toBeDefined())

    // The list was already on its way when the clear happened, so its answer
    // still describes the session that has since been replaced.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: computer.id,
          sessionId: 'session-1-b',
          replacedBy: 'session-1-c',
        }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: current }),
      } as MessageEvent)
    })
    await act(async () => {
      answerSessions?.()
    })

    expect(await screen.findAllByText('Carried on')).not.toHaveLength(0)
    // An answer that predates the removal is not evidence the session is back.
    expect(screen.queryByText('Cleared away')).not.toBeInTheDocument()
  })

  it('claims state from a session cleared twice while it was away', async () => {
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({ 'computer-1:session-1': 'Half-written thought' }),
    )
    // Cleared twice over: the session in between is gone as well, so only the
    // whole ancestry can lead back to what the draft was left under.
    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-twice',
      replacedSessionIds: ['session-1', 'session-1-once'],
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)

    render(<App />)
    await screen.findAllByText('Project chat')

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        ),
      ).toEqual({ 'computer-1:session-1-twice': 'Half-written thought' }),
    )
  })

  it('opens what a linked session became after a clear it missed', async () => {
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-2',
    )
    const replacement: ManagedSession = {
      ...secondSession,
      id: 'session-2-cleared',
      title: 'Second chat',
      replacedSessionIds: ['session-2'],
      messages: [],
    }
    // The link names a session that no longer exists, and an unrelated one is
    // listed first, so falling back would open the wrong conversation.
    vi.mocked(listSessions).mockResolvedValue([session, replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)

    render(<App />)

    await waitFor(() =>
      expect(getSession).toHaveBeenCalledWith('computer-1', 'session-2-cleared'),
    )
    window.history.replaceState({}, '', '/')
  })

  it('follows a link through a replacement the list could not speak for', async () => {
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-2',
    )
    // The link names A. The list that is about to answer holds B, which says
    // it replaced A -- but B is cleared into C while that list is in flight,
    // so reconciliation rejects B and its ancestry went with it. Without the
    // link A -> B there is no route from the address to C, and an unrelated
    // session sorts first and takes the reader's place for good.
    const replacementB: ManagedSession = {
      ...secondSession,
      id: 'session-2-b',
      title: 'Second chat',
      replacedSessionIds: ['session-2'],
      messages: [],
    }
    const replacementC: ManagedSession = {
      ...secondSession,
      id: 'session-2-c',
      title: 'Second chat',
      replacedSessionIds: ['session-2', 'session-2-b'],
      messages: [],
    }
    let answerSessions: (() => void) | undefined
    vi.mocked(listSessions).mockImplementation(
      () =>
        new Promise((resolve) => {
          answerSessions = () => resolve([session, replacementB])
        }),
    )
    vi.mocked(getSession).mockResolvedValue(replacementC)

    render(<App />)
    await waitFor(() => expect(answerSessions).toBeDefined())

    // B is cleared into C while the list is still in flight.
    await act(async () => {
      MockWebSocket.instances[0]?.onopen?.()
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-2-b',
          replacedBy: 'session-2-c',
        }),
      } as MessageEvent)
    })
    await act(async () => {
      answerSessions?.()
    })
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: replacementC,
        }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(getSession).toHaveBeenCalledWith('computer-1', 'session-2-c'),
    )
    window.history.replaceState({}, '', '/')
  })

  it('keeps an edited recovery answering for its failure', async () => {
    // A reader who edits what they were handed is still answering that
    // failure. Requiring the words to match meant the edited draft no longer
    // acknowledged it, so the prompt came back and went on holding the queue.
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({ 'computer-1:session-1': 'the one that failed, edited' }),
    )
    localStorage.setItem(
      'agentic-remote:composer-draft-failures',
      JSON.stringify({ 'computer-1:session-1': '2026-09-03T00:00:00.000Z' }),
    )
    const failed: ManagedSession = {
      ...session,
      failedPrompt: {
        content: 'the one that failed',
        failedAt: '2026-09-03T00:00:00.000Z',
      },
    }
    vi.mocked(listSessions).mockResolvedValue([failed, secondSession])
    vi.mocked(getSession).mockResolvedValue(failed)
    vi.mocked(sendMessage).mockResolvedValue(session)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() =>
      expect(textarea).toHaveValue('the one that failed, edited'),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        expect.objectContaining({
          acknowledgesFailure: '2026-09-03T00:00:00.000Z',
        }),
      ),
    )
  })

  it('keeps waiting when the node that owns a replacement did not answer', async () => {
    // The hub answers for a paired computer out of its own cache when the node
    // request fails, and a failed request does not have to mean the computer
    // is offline. The replacement is missing from that answer because nothing
    // looked for it, not because it has gone.
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(listSessionListing).mockImplementation(async () => ({
      sessions: [session, secondSession],
      // `computer-1` is still reported online; its list simply was not fetched.
      answeredComputerIds: [],
    }))

    render(<App />)
    await screen.findAllByText('Project chat')

    // The removal comes first, so the snapshot that follows starts after the
    // replacement was announced -- its absence is no longer explained by the
    // request predating the announcement, and this is the answer that settles
    // the claim.
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
          replacedBy: 'session-1-next',
        }),
      } as MessageEvent)
    })
    vi.mocked(getSession).mockClear()
    await act(async () => {
      MockWebSocket.instances[0]?.onopen?.()
      await Promise.resolve()
    })
    await act(async () => {
      await Promise.resolve()
    })

    const replacement: ManagedSession = {
      ...session,
      id: 'session-1-next',
      replacedSessionIds: ['session-1'],
      messages: [],
    }
    vi.mocked(getSession).mockResolvedValue(replacement)
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: replacement,
        }),
      } as MessageEvent)
    })

    // The replacement was still expected, so the reader is on it rather than
    // on whatever an unanswered list happened to sort first.
    await waitFor(() =>
      expect(getSession).toHaveBeenCalledWith('computer-1', 'session-1-next'),
    )
    // Never taken back to the session that was cleared, nor to anything else
    // the unanswered list happened to still be carrying.
    expect(getSession).not.toHaveBeenCalledWith('computer-1', 'session-1')
    expect(getSession).not.toHaveBeenCalledWith('computer-1', 'session-2')
  })

  it('does not put back a replacement that was cleared again while answering', async () => {
    // A -> B finishes on the server, then B -> C is announced here before A's
    // answer arrives. Putting B back would resurrect a session that is gone
    // and take the reader off the one that replaced it.
    let answerClear: ((value: ManagedSession) => void) | undefined
    vi.mocked(clearConversation).mockImplementation(
      () =>
        new Promise((resolve) => {
          answerClear = resolve
        }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
    await waitFor(() => expect(answerClear).toBeDefined())

    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1-b',
          replacedBy: 'session-1-c',
        }),
      } as MessageEvent)
    })
    await act(async () => {
      answerClear?.({ ...session, id: 'session-1-b', messages: [] })
    })

    // B is gone, so it must not be in the list, and the reader belongs on C.
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /session-1-b/ }),
      ).not.toBeInTheDocument(),
    )
    expect(getSession).not.toHaveBeenCalledWith('computer-1', 'session-1-b')
  })

  it('keeps sessions a computer was never asked about', async () => {
    // The hub answers for a paired computer out of its own cache when the node
    // does not reply, and after a restart that cache is empty. Reading it as
    // the whole truth removed every session the browser already had.
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    render(<App />)
    await screen.findAllByText('Project chat')

    vi.mocked(listSessionListing).mockResolvedValue({
      sessions: [],
      answeredComputerIds: [],
    })
    await act(async () => {
      MockWebSocket.instances[0]?.onopen?.()
      await Promise.resolve()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(await screen.findAllByText('Project chat')).not.toHaveLength(0)
  })

  it('moves a cleared session\'s things to the session that is really live', async () => {
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({ 'computer-1:session-1': 'Half-written thought' }),
    )
    let answerClear: ((value: ManagedSession) => void) | undefined
    vi.mocked(clearConversation).mockImplementation(
      () =>
        new Promise((resolve) => {
          answerClear = resolve
        }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
    await waitFor(() => expect(answerClear).toBeDefined())

    // B is cleared into C before A's answer names B. Moving the draft into B
    // left it under a session that is gone, and C had already been told there
    // was nothing left to claim.
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1-b',
          replacedBy: 'session-1-c',
        }),
      } as MessageEvent)
    })
    await act(async () => {
      answerClear?.({ ...session, id: 'session-1-b', messages: [] })
    })

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        ),
      ).toEqual({ 'computer-1:session-1-c': 'Half-written thought' }),
    )
  })

  it('puts running tasks first and the newest finished one above older ones', () => {
    // What is still going is the only part worth a glance, so it leads
    // whatever it started. The rest is history, and history reads newest
    // first: the one that just finished is what a reader is looking for.
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
      task('done-old', 'completed', '2026-01-01T00:00:00.000Z', '2026-01-01T00:01:00.000Z'),
      task('run-new', 'running', '2026-01-01T00:05:00.000Z'),
      task('done-new', 'completed', '2026-01-01T00:02:00.000Z', '2026-01-01T00:03:00.000Z'),
      task('run-old', 'running', '2026-01-01T00:04:00.000Z'),
      task('queued', 'queued', '2026-01-01T00:06:00.000Z'),
    ]).map((entry) => entry.id)

    expect(ordered).toEqual([
      // Still going, oldest first so nothing long-running is buried.
      'run-old',
      'run-new',
      'queued',
      // Finished, newest first.
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

  it('counts only what is running, not what is merely tracked', async () => {
    // A session can carry a long history of finished work. The count exists to
    // be caught at a glance, so it speaks for what is running now: a hundred
    // tracked tasks with none of them running is a quiet session and reads as
    // one.
    render(<App />)
    await screen.findAllByText('Project chat')

    const finished = Array.from({ length: 100 }, (_unused, index) => ({
      id: `shell-${index}`,
      type: 'shell' as const,
      description: `finished ${index}`,
      status: 'completed' as const,
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:30.000Z',
      canCancel: false,
    }))
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.tasks.updated',
          computerId: 'computer-1',
          sessionId: 'session-1',
          tasks: finished,
          runningCount: 0,
          supported: true,
        }),
      } as MessageEvent)
    })

    // Nothing is running, so the row says nothing about tasks at all.
    expect(document.querySelector('.session-item__tasks')).toBeNull()

    // Two of them start, and only those two are counted.
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.tasks.updated',
          computerId: 'computer-1',
          sessionId: 'session-1',
          tasks: finished,
          runningCount: 2,
          supported: true,
        }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(
        document.querySelector('.session-item__tasks')?.textContent,
      ).toBe('2 tasks'),
    )
  })

  it('says nothing in the list when no task is running', async () => {
    // The count is there to be caught in passing. A session with nothing
    // running should read as a session, not as a session with a zero on it.
    render(<App />)
    await screen.findAllByText('Project chat')

    expect(document.querySelector('.session-item__tasks')).toBeNull()
    expect(screen.queryByText(/running task/)).not.toBeInTheDocument()
    // The folder still shows, and the count would sit beside it.
    expect(document.querySelector('.session-item__where')).not.toBeNull()
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
        .find((item) => item.classList.contains('session-item__open')),
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
            .find((item) => item.classList.contains('session-item__open')),
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
    fireEvent.click(screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!)
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
    fireEvent.click(screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!)
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('button', { name: /Second chat/ })
          .find((item) => item.classList.contains('session-item__open')),
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
      'agentic-remote:knowledge-mode',
      JSON.stringify('docked'),
    )
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
    fireEvent.click(screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!)
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
    fireEvent.click(screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!)
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
    fireEvent.click(screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!)
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

    // A failed restore must not erase where the reader was. The position now
    // belongs to the session that adopted it, and the app-wide one an older
    // build left behind is gone for good.
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem(
            'agentic-remote:knowledge-session-positions',
          ) || '{}',
        ),
      ).toEqual({ 'computer-1:session-1': remembered }),
    )
    expect(localStorage.getItem('agentic-remote:knowledge-position')).toBeNull()
  })
})
