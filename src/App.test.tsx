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
  getPushSettings,
  getSession,
  getRuntimeOptions,
  listCommands,
  listComputers,
  listDirectories,
  listHistory,
  listSessions,
  removeQueuedPrompt,
  renameSession,
  restartSession,
  replyUserInput,
  sendMessage,
  sendTestPushNotification,
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
  listDirectories: vi.fn(),
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
  cwd: '/home/lcavalcanti/src/second',
  messages: [],
}

describe('App', () => {
  it('caps composer growth for iPhone viewport heights', () => {
    expect(composerMaximumHeight(true, 844)).toBe(104)
    expect(composerMaximumHeight(true, 430)).toBe(72)
    expect(composerMaximumHeight(false, 430)).toBe(180)
  })

  it('tracks the visual viewport only while the mobile keyboard is open', async () => {
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
    vi.mocked(replyUserInput).mockResolvedValue(session)
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
        terminalBacked: true,
        allowAllPermissions: true,
      }),
    )
    const groups = [...document.querySelectorAll('.computer-session-group')]
      .map((group) => group.textContent)
      .join(' ')
    expect(groups).toContain('development')
    expect(groups).toContain('homelab-prod')
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
        terminalBacked: true,
        allowAllPermissions: false,
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

  it('scrolls a newly received question into view', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView)
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
})
